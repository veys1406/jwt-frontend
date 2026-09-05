import { useEffect, useState } from "react";

export default function MyNotes({ run, go }) {
  const [notes, setNotes] = useState(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await run({ method: "GET", path: "/mynotes" });
    setMsg("");

    if (res.ok && Array.isArray(res.data)) {
      setNotes(res.data);
    } else {
      setNotes(null);
      if (res.networkError) setMsg("Sunucuya ulasilamiyor.");
      else if (res.status === 403) setMsg("Notlarini gormek icin giris yapmalisin.");
      else setMsg("Notlar yuklenemedi.");
    }
  }

  // gercek bir uygulama gibi: sayfa acilinca kendiliginden yukleniyor.
  // Bos dependency dizisi = "sadece ilk render'da bir kez calis".
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Notlarim</h1>
          <p className="page-sub">{notes ? notes.length + " not" : " "}</p>
        </div>
        <div className="page-actions">
          <button className="btn ghost" onClick={load}>
            Yenile
          </button>
          <button className="btn primary" onClick={() => go("new")}>
            Yeni not
          </button>
        </div>
      </div>

      {msg && (
        <div className="empty-state">
          <p className="msg error">{msg}</p>
          {msg.includes("giris") && (
            <button className="btn" onClick={() => go("login")}>
              Giris yap
            </button>
          )}
        </div>
      )}

      {notes && notes.length === 0 && (
        <div className="empty-state">
          <p>Henuz not yok.</p>
          <button className="btn" onClick={() => go("new")}>
            Ilk notunu yaz
          </button>
        </div>
      )}

      {notes && notes.length > 0 && (
        <ul className="notes">
          {notes.map((n, i) => (
            <li key={i} className="note">
              {n.icerik}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
