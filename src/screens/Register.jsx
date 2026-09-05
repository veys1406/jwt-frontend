import { useState } from "react";

export default function Register({ run, go }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg("");

    if (password !== again) {
      setMsg("Parolalar eslesmiyor.");
      return; // bu kontrol tarayicida, backend'e istek bile gitmiyor
    }

    const res = await run({ method: "POST", path: "/register", body: { username, password } });

    if (res.ok) {
      setDone(true);
    } else if (res.status === 409) {
      setMsg("Bu kullanici adi zaten alinmis.");
    } else if (res.status === 400) {
      setMsg("Parola 6-12 karakter olmali.");
    } else if (res.networkError) {
      setMsg("Sunucuya ulasilamiyor.");
    } else {
      setMsg("Kayit basarisiz.");
    }
  }

  if (done) {
    return (
      <div className="page page--narrow">
        <h1 className="page-title">Hesabin hazir</h1>
        <p className="page-sub">Artik giris yapabilirsin.</p>
        <button className="btn primary block" onClick={() => go("login")}>
          Girise don
        </button>
      </div>
    );
  }

  return (
    <div className="page page--narrow">
      <h1 className="page-title">Hesap olustur</h1>
      <p className="page-sub">Baslamak icin birkac saniye yeterli.</p>

      <form className="form" onSubmit={submit}>
        <label className="field">
          <span className="field-label">Kullanici adi</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </label>
        <label className="field">
          <span className="field-label">Parola</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <label className="field">
          <span className="field-label">Parola tekrar</span>
          <input
            type="password"
            value={again}
            onChange={(e) => setAgain(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        {msg && <p className="msg error">{msg}</p>}

        <button className="btn primary block">Kayit ol</button>
      </form>

      <p className="alt">
        Zaten hesabin var mi?{" "}
        <button className="link" type="button" onClick={() => go("login")}>
          Giris yap
        </button>
      </p>
    </div>
  );
}
