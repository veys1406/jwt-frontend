import { useState } from "react";

export default function UploadNote({ run }) {
  const [icerik, setIcerik] = useState("");
  const [imza, setImza] = useState("test");
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setOk(false);

    const form = new FormData();
    form.append("icerik", icerik);
    form.append("imza", imza);
    if (file) form.append("image", file);

    const res = await run({ method: "POST", path: "/notes/upload", form });

    if (res.ok) {
      setOk(true);
    } else if (res.status === 403) {
      setMsg("Dosya yuklemek icin giris yapmalisin.");
    } else if (res.networkError) {
      setMsg("Sunucuya ulasilamiyor.");
    } else {
      setMsg("Yukleme basarisiz.");
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Gorsel yukle</h1>
      <p className="page-sub">Notuna bir gorsel ekle.</p>

      <form className="form" onSubmit={submit}>
        <label className="field">
          <span className="field-label">Icerik</span>
          <textarea rows={4} value={icerik} onChange={(e) => setIcerik(e.target.value)} placeholder="notun metni..." />
        </label>

        <label className="field">
          <span className="field-label">Imza</span>
          <input value={imza} onChange={(e) => setImza(e.target.value)} />
        </label>

        <label className="field">
          <span className="field-label">Dosya</span>
          <input type="file" onChange={(e) => setFile(e.target.files[0] ?? null)} />
        </label>

        {msg && <p className="msg error">{msg}</p>}
        {ok && <p className="msg ok">Yukleme tamamlandi.</p>}

        <button className="btn primary">Yukle</button>
      </form>
    </div>
  );
}
