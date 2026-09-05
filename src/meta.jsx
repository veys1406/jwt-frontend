import { RateLimitTool } from "./tools.jsx";

// Her ekranin ARKA PLAN bilgisi burada duruyor.
// Sol taraf gercek uygulama; endpoint imzasi, backend eksikleri ve
// denenecekler sag panele bu dosyadan besleniyor.

export const META = {
  login: {
    method: "POST",
    path: "/login",
    auth: false,
    desc: (
      <>
        Cevap govdesinde artik sadece kucuk bir <code>{`{ message: "..." }`}</code> var — token
        orada degil, <code>Set-Cookie: accessToken=...; HttpOnly; SameSite=Strict</code>{" "}
        header'inda gelir. Ayrica bir refresh token uretilip Redis'e yazilir ama disari hic
        verilmez.
      </>
    ),
    notes: [
      {
        title: "Mesaj UX icin, kanit degil",
        body: (
          <>
            <code>message</code> alani sadece kullaniciya gosterilecek bir metin — giris
            basarisinin gercek kaniti degil. Token'in kendisini hic goremiyoruz: cookie{" "}
            <code>httpOnly</code>. Soldaki uygulamanin JS'i ile bir saldirganin XSS ile
            calistirdigi JS tarayici acisindan ayni seydir — ikisine de kapali. (Onceden bu cevap
            tamamen bostu, tutarli bir <code>MessageResponse</code> eklendi — K1 kapandi.)
          </>
        ),
      },
    ],
    gaps: [],
    tryouts: [
      <>
        Yanlis parola → <b>403</b>. Bu 403 <code>AuthenticationManager</code>'dan geliyor, JWT
        filter'indan degil.
      </>,
      <>
        DevTools → Application (Chrome) / Storage (Firefox) → Cookies → <code>accessToken</code>{" "}
        satirinda <b>HttpOnly</b> kutusu isaretli.
      </>,
    ],
    Tools: RateLimitTool,
  },

  register: {
    method: "POST",
    path: "/register",
    auth: false,
    desc: (
      <>
        Parola <code>BCryptPasswordEncoder</code> ile hash'lenip saklanir. Rol her zaman{" "}
        <code>USER</code> — client kendi rolunu secemez, gonderse bile dikkate alinmaz.
      </>
    ),
    notes: [
      {
        title: "Ayni ekran, iki farkli derinlik",
        body: (
          <>
            Ayni kullanici adiyla ikinci kayit <b>409</b> verir ve serit <b>Service</b>'te durur:
            istek butun filter'lari gecti, is kuralina takildi. Uc karakterlik parola ise{" "}
            <b>400</b> verir ve serit <b>Controller</b>'da durur — Service hic calismadi. Ikisi de
            "hata" ama tamamen baska yerler.
          </>
        ),
      },
    ],
    gaps: [],
    tryouts: [
      <>
        Ayni kullanici adiyla iki kez kayit ol → <b>409</b>,{" "}
        <code>UserAlreadyExistsException</code>
      </>,
      <>
        3 karakterlik parola → <b>400</b>, <code>@Size(min = 6, max = 12)</code>
      </>,
    ],
  },

  mynotes: {
    method: "GET",
    path: "/mynotes",
    auth: true,
    desc: (
      <>
        Sen bir kullanici adi gondermiyorsun. <code>@AuthenticationPrincipal</code> onu{" "}
        <code>SecurityContext</code>'ten aliyor, oraya da <code>JwtAuthenticationFilter</code>{" "}
        cookie'deki token'i dogruladiktan sonra koymustu.
      </>
    ),
    notes: [
      {
        title: "Kullanicilari ayiran tek sey",
        body: (
          <>
            <code>findByOwnerUsername(username)</code>. Bu tek satir olmasa herkes herkesin
            notunu gorurdu. Yetkilendirme cogu zaman boyle gorunur: gosterisli bir mekanizma
            degil, dogru yere konmus bir filtre.
          </>
        ),
      },
    ],
    gaps: [],
    tryouts: [
      <>
        Cikis yapip tekrar dene → <b>403</b>. Cookie hala tarayicida ve istekte gidiyor, ama
        Redis kara listesinde.
      </>,
      <>Iki farkli kullaniciyla giris yap → listeler tamamen ayri.</>,
      <>
        Her satirda artik gercek <code>id</code>, varsa kucuk bir <b>onizleme</b> ve{" "}
        <code>imza</code> gorunuyor — <code>NotesResponse</code> artik <code>id</code>,{" "}
        <code>icerik</code>, <code>imza</code> ve <code>image</code>'i birlikte tasiyor (A9
        kapandi).
      </>,
    ],
  },

  new: {
    method: "POST",
    path: "/notes?imza=...",
    auth: true,
    desc: (
      <>
        Tek istekte <b>iki farkli tasima yolu</b>: <code>icerik</code> JSON govdesinde,{" "}
        <code>imza</code> URL'in query string'inde. Sagdaki istek kaydinda ikisini ayri ayri
        gorebilirsin.
      </>
    ),
    notes: [
      {
        title: "Onizleme neden tehlikeli",
        body: (
          <>
            Soldaki onizleme <code>dangerouslySetInnerHTML</code> kullaniyor —{" "}
            <b>bilerek savunmasiz</b>. React'te <code>&#123;deger&#125;</code> yazsaydin girdi
            metin olarak basilir, etiketler calismazdi. Bu fonksiyon o korumayi kapatiyor;
            adindaki "dangerously" tesaduf degil.
          </>
        ),
      },
      {
        title: "httpOnly neyi cozdu, neyi cozmedi",
        body: (
          <>
            <b>Cozdu:</b> token artik <code>localStorage</code>'da degil, JS okuyamiyor —{" "}
            <code>document.cookie</code> payload'i bos doner.
            <br />
            <b>Cozmedi:</b> saldirganin kodu hala senin sayfanda, senin oturumunla calisiyor.
            Token'i okuyamasa da <i>kullanabilir</i>: sayfadan{" "}
            <code>fetch("/notes", &#123;credentials:"include"&#125;)</code> cagirirsa cookie yine
            otomatik gider. XSS'in cozumu httpOnly degil, girdiyi hic HTML olarak basmamak.
          </>
        ),
      },
    ],
    gaps: [],
    tryouts: [
      <>
        Imza'yi tamamen sil → <b>400</b>. Istek Controller'a <i>ulasti</i> ama parametre bind
        edilemedi, metot govdesi hic calismadi.
      </>,
      <>
        Onizlemeye <code>&lt;img src=x onerror="alert(document.cookie)"&gt;</code> yaz → kod
        calisir ama cookie bos gelir.
      </>,
    ],
  },

  detail: {
    method: "GET",
    path: "/notes/{id}",
    auth: true,
    desc: (
      <>
        Id'yi <b>client</b> soyluyor. Yani baskasinin notunu istemek teknik olarak serbest; onu
        durduran tek sey <code>NotesService</code>'teki uc satirlik sahiplik kontrolu.
      </>
    ),
    notes: [
      {
        title: "Ayni 403, iki ayri yer",
        body: (
          <>
            Giris yapmadan id sorarsan 403 gelir ve serit <code>authorizeHttpRequests</code>'te
            durur — kodun hic calismaz. Giris yapip <b>baskasinin</b> id'sini sorarsan yine 403
            gelir, ama serit ta <code>Service</code>'e kadar yesil gider. Ikinci durumda backend
            notu veritabanindan <b>okudu</b>, sonra vermemeye karar verdi.
          </>
        ),
      },
      {
        title: "500 degil, 403 cikiyordu — neden?",
        body: (
          <>
            Var olmayan bir id icin beklenen <b>500</b>'du (yakalanmamis{" "}
            <code>NoSuchElementException</code>), ama gercekte <b>403</b> donuyordu. Sebep
            IDOR degildi: yakalanmamis exception Spring Boot'u dahili olarak{" "}
            <code>/error</code>'a forward ettiriyor, bu path <code>permitAll()</code>'da yok, ve{" "}
            <code>JwtAuthenticationFilter</code> (bir <code>OncePerRequestFilter</code>) bu ERROR
            dispatch'inde varsayilan olarak <b>tekrar calismiyor</b>. Sonuc: kimlik doğrulama bir
            daha kurulmuyor, sistem seni anonim saniyor, <code>authenticated()</code> kurali 403
            ile reddediyor. <code>GlobalExceptionHandler</code>'a duzgun bir handler eklenince bu
            zincir hic devreye girmiyor — exception artik hic "yakalanmamis" hale gelmiyor.
          </>
        ),
      },
    ],
    gaps: [],
    tryouts: [
      <>Iki hesapla dene: A ile not ekle, B ile giris yapip A'nin id'sini iste → 403.</>,
      <>
        Sonra <code>NotesService.getNoteById</code>'deki <code>if</code> blogunu yorum satiri
        yapip tekrar dene. Zafiyet tam olarak boyle bir seydir: eksik bir kontrol.
      </>,
      <>
        Var olmayan bir id dene (orn. 9999) → artik <b>404</b>,{" "}
        <code>NotFoundException</code> + <code>GlobalExceptionHandler</code> (A7 kapandi).
      </>,
    ],
  },

  search: {
    method: "GET",
    path: "/mynotes/search?keyword=...",
    auth: true,
    desc: (
      <>
        Arka planda Mongo'nun kendi <code>@Query</code>'si calisiyor — JPQL degil, dogrudan bir
        JSON filtre: <code>{`{ ownerUsername: ?0, icerik: { $regex: ?1, $options: 'i' } }`}</code>
      </>
    ),
    notes: [
      {
        title: "Bu sefer 'injection'a acik degil' demiyoruz",
        body: (
          <>
            JPQL'deki named parameter korumasinin (SQL'e asla string olarak yapismiyordu) burada
            <b> birebir karsiligi yok.</b> <code>keyword</code>, <code>$regex</code>'in degeri
            olarak <b>oldugu gibi</b> gidiyor — yani kullanicinin yazdigi sey dogrudan bir regex
            deseni oluyor. Bu, [[nosql-injection]] notundaki operator injection'dan farkli ama
            akraba bir risk (C2, hala acik).
          </>
        ),
      },
    ],
    gaps: [],
    tryouts: [
      <>
        Bos anahtar kelime → <code>$regex: ''</code> → butun notlarin gelir. Filtre degil, "her
        seyle eslesen" bir desen.
      </>,
      <>
        <code>.*</code> yaz → yine her sey eslesir, bu sefer bilerek bir regex joker karakteriyle.
      </>,
      <>
        Buyuk/kucuk harf degistir → eslesme <b>kaybolmaz</b>. <code>$options: 'i'</code> case-insensitive
        yapiyor — eski JPQL/H2 davranisiyla ayni sonucu, farkli bir mekanizmayla veriyoruz.
      </>,
    ],
  },

  upload: {
    method: "POST",
    path: "/notes/upload",
    auth: true,
    desc: (
      <>
        Bu ucun Content-Type'i <code>multipart/form-data</code>. Diger her sey JSON gonderiyordu —
        fark burada goruluyor.
      </>
    ),
    notes: [
      {
        title: "Content-Type'i neden elle yazmiyoruz",
        body: (
          <>
            <code>api.js</code> icinde <code>FormData</code> gonderirken Content-Type'i{" "}
            <b>bilerek koymuyoruz</b>. Multipart'ta alanlari ayiran rastgele bir{" "}
            <code>boundary</code> dizesi var ve onu tarayici uretiyor. Elle yazarsan boundary
            kaybolur, Spring govdeyi parcalayamaz.
          </>
        ),
      },
    ],
    gaps: [],
    tryouts: [
      <>
        Yukle, sonra "Notlarim"a bak — yeni not orada, icerigi, imzasi ve kucuk bir onizlemesiyle
        birlikte. Resim <code>byte[]</code> olarak Mongo'da saklaniyor,{" "}
        <code>NotesResponse</code> onu Jackson'in otomatik cevirdigi bir <b>Base64 string</b>{" "}
        olarak geri donuyor; ekranda gormek icin ona <code>data:image/png;base64,</code> onekini
        ekliyoruz.
      </>,
    ],
  },

  account: {
    method: "POST",
    path: "/logout · /refresh",
    auth: true,
    desc: (
      <>
        <code>/logout</code> access token'i <b>kalan omru kadar</b> Redis'e{" "}
        <code>blacklisted</code> diye yazar. Body'de refresh token gonderilirse o da Redis'ten
        silinir. Ikisi de artik kucuk bir <code>{`{ message: "..." }`}</code> donuyor.
      </>
    ),
    notes: [
      {
        title: "Refresh artik token'i body'de donmuyor",
        body: (
          <>
            Onceden <code>/refresh</code> ürettigi yeni access token'i <b>ciplak string</b> olarak
            body'de donuyordu — login'de bilerek kacinilan seyi (token'in JS'in okuyabilecegi bir
            yere sizmasi) kendisi yapiyordu. Artik login ile ayni yolu izliyor: yeni token{" "}
            <code>httpOnly</code> cookie'ye yaziliyor, body'de sadece mesaj var (K1 kapandi).
          </>
        ),
      },
      {
        title: "JWT'de cikis diye bir sey yok",
        body: (
          <>
            Token stateless'tir, sunucu onu "iptal" edemez — imza gecerliyse gecerlidir. Cikisi
            disaridan bir kara liste tutarak <i>taklit</i> ediyoruz. Cikistan sonra Notlarim'a
            bak: cookie hala tarayicida, istekte de gidiyor, ama 403.
          </>
        ),
      },
      {
        title: "Oturum yoklamasi neden Notlarim'i cagiriyor",
        body: (
          <>
            <code>/me</code> olmadigi icin korumali bir ucu cagirip 200 mu 403 mu geldigine
            bakiyoruz. Cirkin ama calisiyor.
          </>
        ),
      },
    ],
    gaps: [
      {
        code: "K3",
        body: (
          <>
            <b>Refresh kutusu bos ve sucu sende degil.</b> <code>AuthService.login</code> refresh
            token'i uretip Redis'e yaziyor ama frontend'e <b>ne cookie'de ne body'de</b>
            gonderiyor. Elle test icin Redis'ten kopyala:
            <code className="cmd">docker exec -it redis redis-cli --scan</code>
          </>
        ),
      },
      {
        code: "tuzak",
        body: (
          <>
            Giden JSON anahtari <code>token</code> olmali, <code>refreshToken</code> degil.
            Jackson alan adini field'dan degil <code>getToken()</code> getter'indan turetiyor.
            Yanlis anahtarda hata olmaz, alan sessizce <code>null</code> kalir.
          </>
        ),
      },
    ],
    tryouts: [
      <>Cikis yap, sonra Notlarim'a bas → 403. Redis kara listesi calisiyor.</>,
      <>
        Sayfayi yenile (F5) → giris durumu kayboldu ama cookie duruyor. "Oturumu yokla" ile geri
        kur.
      </>,
    ],
  },
};
