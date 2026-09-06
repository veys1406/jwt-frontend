// Butun backend cagrilari buradan geciyor.
// Tek amaci var: istegin ham halini kaydetmek ki sagdaki Inspector gosterebilsin.

export const BASE = "http://localhost:8080";

let counter = 0;

// XSRF-TOKEN cookie'sini okuyoruz (httpOnly degil, bunun icin JS'e acik).
// Backend'in /csrf endpoint'i bu cookie'yi tetikliyor (bkz. App.jsx).
function readCsrfCookie() {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const CSRF_PROTECTED_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

export async function call({ method, path, query, body, form }) {
  const qs = query ? "?" + new URLSearchParams(query).toString() : "";
  const url = BASE + path + qs;

  const headers = {};
  let payload;

  if (form) {
    // Content-Type'i BILEREK koymuyoruz.
    // multipart'ta boundary'yi tarayici uretmek zorunda, elle yazarsak istek bozulur.
    payload = form;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  // CSRF: state degistiren isteklerde cookie'deki token'i header'a kopyalarz.
  // kotuadam.com bu cookie'yi okuyamadigi icin dogru header'i uretemiyor.
  if (CSRF_PROTECTED_METHODS.includes(method)) {
    const csrfToken = readCsrfCookie();
    if (csrfToken) headers["X-XSRF-TOKEN"] = csrfToken;
  }

  const entry = {
    id: ++counter,
    at: new Date(),
    method,
    path,
    url,
    // bizim koydugumuz header'lar
    requestHeaders: headers,
    requestBody: form ? "(multipart/form-data — dosya)" : (payload ?? null),
  };

  const t0 = performance.now();

  try {
    const res = await fetch(url, {
      method,
      headers,
      credentials: "include", // cookie'yi cross-origin istekte tasi
      body: payload,
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null; // duz string donmus olabilir (orn. GlobalExceptionHandler)
    }

    return {
      ...entry,
      duration: Math.round(performance.now() - t0),
      status: res.status,
      ok: res.ok,
      responseText: text,
      data,
      responseHeaders: [...res.headers.entries()],
    };
  } catch (e) {
    // fetch burada patliyorsa cevap HIC gelmemistir: backend kapali ya da CORS reddetti
    return {
      ...entry,
      duration: Math.round(performance.now() - t0),
      status: 0,
      ok: false,
      networkError: String(e),
      responseText: "",
      data: null,
      responseHeaders: [],
    };
  }
}
