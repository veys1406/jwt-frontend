import { useState } from "react";

export default function NoteDetail({ run }) {
  const [id, setId] = useState("1");
  const [note, setNote] = useState(null);
  const [msg, setMsg] = useState("");

  async function open(e) {
    e.preventDefault();
    setMsg("");
    setNote(null);
    const res = await run({ method: "GET", path: "/notes/" + id });

    if (res.ok && res.data) {
      setNote(res.data);
    } else if (res.status === 403) {
      setMsg("Bu not sana ait degil.");
    } else if (res.status >= 500) {
      setMsg("Boyle bir not bulunamadi.");
    } else if (res.networkError) {
      setMsg("Sunucuya ulasilamiyor.");
    } else {
      setMsg("Not acilamadi.");
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Not ac</h1>
      <p className="page-sub">Numarasini bildigin bir notu ac.</p>

      <form className="form" onSubmit={open}>
        <label className="field">
          <span className="field-label">Not numarasi</span>
          <input className="narrow" value={id} onChange={(e) => setId(e.target.value)} />
        </label>
        <button className="btn primary">Ac</button>
      </form>

      {msg && <p className="msg error">{msg}</p>}

      {note && (
        <article className="note note--full">
          <span className="note-id">#{id}</span>
          {note.icerik}
        </article>
      )}
    </div>
  );
}
