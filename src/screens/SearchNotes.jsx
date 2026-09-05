import { useState } from "react";

export default function SearchNotes({ run }) {
  const [keyword, setKeyword] = useState("");
  const [notes, setNotes] = useState(null);
  const [msg, setMsg] = useState("");

  async function search(e) {
    e.preventDefault();
    setMsg("");
    const res = await run({ method: "GET", path: "/mynotes/search", query: { keyword } });

    if (res.ok && Array.isArray(res.data)) {
      setNotes(res.data);
    } else {
      setNotes(null);
      if (res.status === 403) setMsg("Arama yapmak icin giris yapmalisin.");
      else if (res.networkError) setMsg("Sunucuya ulasilamiyor.");
      else setMsg("Arama basarisiz.");
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Ara</h1>
      <p className="page-sub">Notlarinin icinde gecen bir kelime yaz.</p>

      <form className="form" onSubmit={search}>
        <div className="row">
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="liste" />
          <button className="btn primary">Ara</button>
        </div>
      </form>

      {msg && <p className="msg error">{msg}</p>}

      {notes && notes.length === 0 && <div className="empty-state">Eslesen not yok.</div>}

      {notes && notes.length > 0 && (
        <>
          <p className="page-sub">{notes.length} sonuc</p>
          <ul className="notes">
            {notes.map((n, i) => (
              <li key={i} className="note">
                {n.icerik}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
