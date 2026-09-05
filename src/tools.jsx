import { useState } from "react";

// Sag paneldeki "Bu ekran" sekmesine gomulen kucuk test araclari.
// Gercek uygulamanin parcasi degiller, o yuzden solda degil sagdalar.

export function RateLimitTool({ run }) {
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);

  async function hammer() {
    setBusy(true);
    setResults([]);
    for (let i = 1; i <= 7; i++) {
      // sirayla, paralel degil: bucket'in tukenisi adim adim gorulsun
      const res = await run({
        method: "POST",
        path: "/login",
        body: { username: "ratelimit-testi", password: "yanlis-parola" },
      });
      setResults((prev) => [...prev, { n: i, status: res.status }]);
    }
    setBusy(false);
  }

  return (
    <div className="tool">
      <h4>Arac — rate limit</h4>
      <p>
        Yanlis parolayla ust uste 7 giris denemesi. Kova IP basina 5 jeton tutuyor, dakikada
        doluyor.
      </p>
      <button className="btn danger sm" onClick={hammer} disabled={busy}>
        {busy ? "atiyor..." : "7 istek at"}
      </button>
      {results.length > 0 && (
        <ol className="hits">
          {results.map((r) => (
            <li key={r.n} className={r.status === 429 ? "hit blocked" : "hit"}>
              <span className="hit-n">#{r.n}</span>
              <span className="hit-status">{r.status}</span>
              <span className="hit-text">
                {r.status === 429 ? "bucket bos — filter kesti" : "kimlik dogrulanamadi"}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
