// Istegin backend'de hangi duraga kadar gittigini status koduna bakarak tahmin ediyoruz.
// Bu bir TAHMIN — backend'e log koymadan kesin bilemeyiz. Ama %90 dogru okuyor.

const STAGES = [
  { key: "cors",       label: "CorsFilter",              hint: "Origin izinli mi? allowCredentials var mi?" },
  { key: "ratelimit",  label: "RateLimitFilter",         hint: "Bucket4j + Redis. Sadece /login'i denetliyor." },
  { key: "jwt",        label: "JwtAuthenticationFilter", hint: "Cookie'den token okur, SecurityContext'e kimlik koyar." },
  { key: "authz",      label: "authorizeHttpRequests",   hint: "permitAll mi, authenticated mi?" },
  { key: "controller", label: "Controller",              hint: "@RequestBody / @RequestParam / @Validated" },
  { key: "service",    label: "Service",                 hint: "Is kurallari. IDOR kontrolu burada." },
  { key: "repo",       label: "Repository",              hint: "JPA / Mongo sorgusu" },
];

const PUBLIC_PATHS = ["/login", "/register", "/refresh"];

export function inferChain(entry, loggedIn) {
  const { status, path, networkError } = entry;
  const isPublic = PUBLIC_PATHS.includes(path);

  const out = STAGES.map((s) => ({ ...s, state: "idle", note: "" }));
  const at = (k) => out.find((s) => s.key === k);
  const done = (key, note) => {
    at(key).state = "stop";
    at(key).note = note;
    return out;
  };
  const pass = (key, note) => {
    at(key).state = "pass";
    at(key).note = note;
  };

  if (networkError) {
    return done(
      "cors",
      "Cevap hic gelmedi. Ya backend ayakta degil, ya da CORS reddetti — Origin listede yok veya preflight (OPTIONS) dustu."
    );
  }

  pass("cors", "Origin http://localhost:5173 izinli, allowCredentials=true → cookie tasinabildi.");

  if (status === 429) {
    return done(
      "ratelimit",
      "Bucket bosaldi. 429'u filter'in KENDISI yazdi — istek Controller'i, hatta JwtAuthenticationFilter'i bile gormedi."
    );
  }
  pass(
    "ratelimit",
    path === "/login"
      ? "Bucket'tan 1 token dusuldu. Kalan hakkin bitince buradan geri donersin."
      : "Bu filter yalnizca /login'e bakiyor, digerlerini dogrudan gecirir. (→ acik konu G4)"
  );

  pass(
    "jwt",
    loggedIn
      ? "accessToken cookie'si dogrulandi + Redis blacklist'inde degil → SecurityContext dolduruldu."
      : "Gecerli cookie yok → SecurityContext BOS birakildi. Dikkat: filter yine de istegi gecirdi, reddetmedi."
  );

  if (status === 401 || status === 403) {
    if (path === "/refresh") {
      pass("authz", "/refresh permitAll listesinde.");
      pass("controller", "RefreshRequest bind edildi.");
      return done(
        "service",
        "AuthService.refresh → InvalidTokenException. Sebep: imza/sure gecersiz, ya type != \"refresh\", ya token Redis'te yok, ya da JSON anahtari yanlis (\"token\" olmali)."
      );
    }
    if (loggedIn) {
      pass("authz", "Kimlik vardi, gecti.");
      pass("controller", "@AuthenticationPrincipal ile username Service'e verildi.");
      return done(
        "service",
        "Bu 403 KIMLIKTEN degil, YETKIDEN. NotesService.getNoteById → not baskasinin → AccessDeniedException. Senin IDOR korumandir."
      );
    }
    return done(
      "authz",
      "anyRequest().authenticated() reddetti — SecurityContext bos. Controller'a HIC gidilmedi, kodun calismadi bile."
    );
  }

  pass("authz", isPublic ? `${path} permitAll listesinde, kimlik sorulmadi.` : "Kimlik dogrulandi, gecti.");

  if (status === 400) {
    return done(
      "controller",
      "Istek Controller'a ULASTI ama bind edilemedi: @Validated kurali (@NotBlank / @Size) veya zorunlu bir @RequestParam eksik."
    );
  }
  if (status === 404) {
    return done("controller", "Boyle bir endpoint (veya path degiskeni eslesmesi) yok.");
  }
  if (status === 415) {
    return done("controller", "Content-Type uyusmadi. JSON bekleyen uca multipart, ya da tersi.");
  }

  pass("controller", "Metot calisti, parametreler bind edildi.");

  if (status === 409) {
    return done("service", "AuthService.register → UserAlreadyExistsException. GlobalExceptionHandler bunu 409'a cevirdi.");
  }
  if (status >= 500) {
    return done(
      "service",
      "Yakalanmamis exception. En olasi sebep: repo.findById(id).orElseThrow() → NoSuchElementException. GlobalExceptionHandler'da karsiligi yok, 404 yerine 500 donuyor. (→ acik konu A7)"
    );
  }

  pass("service", "Is kurallari gecildi.");
  pass("repo", "Sorgu calisti, veri dondu.");
  return out;
}
