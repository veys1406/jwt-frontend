import { useState } from "react";

export default function NewNote({ run, go }) {
  const [icerik, setIcerik] = useState("");
  const [imza, setImza] = useState("test");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const res = await run({
      method: "POST",
      path: "/notes",
      query: { imza }, // URL'de
      body: { icerik }, // govdede
    });

    if (res.ok) {
      go("mynotes");
    } else if (res.status === 403) {
      setMsg("Not kaydetmek icin giris yapmalisin.");
    } else if (res.status === 400) {
      setMsg("Imza alani bos birakilamaz.");
    } else if (res.networkError) {
      setMsg("Sunucuya ulasilamiyor.");
    } else {
      setMsg("Not kaydedilemedi.");
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Yeni not</h1>
      <p className="page-sub">Notunu yaz, onizlemede nasil gorunecegini gor.</p>

      <form className="form" onSubmit={submit}>
        <label className="field">
          <span className="field-label">Icerik</span>
          <textarea rows={6} value={icerik} onChange={(e) => setIcerik(e.target.value)} placeholder="alisveris listesi..." />
        </label>

        <label className="field">
          <span className="field-label">Imza</span>
          <input value={imza} onChange={(e) => setImza(e.target.value)} />
        </label>

        {msg && <p className="msg error">{msg}</p>}

        <div className="row">
          <button className="btn primary">Kaydet</button>
          <button className="btn ghost" type="button" onClick={() => go("mynotes")}>
            Vazgec
          </button>
        </div>
      </form>

      <div className="preview-block">
        <h3 className="preview-title">Onizleme</h3>
        {/* BILEREK savunmasiz: XSS demosu icin duruyor, silme */}
        <div className="preview" dangerouslySetInnerHTML={{ __html: icerik }} />
      </div>
    </div>
  );
}
