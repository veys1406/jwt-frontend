import { useState } from "react";

export default function Login({ run, session, go }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const res = await run({ method: "POST", path: "/login", body: { username, password } });

    if (res.ok) {
      session.setLoggedIn(true, username);
      go("mynotes");
    } else if (res.status === 429) {
      setMsg("Cok fazla deneme yaptiniz. Bir dakika sonra tekrar deneyin.");
    } else if (res.networkError) {
      setMsg("Sunucuya ulasilamiyor.");
    } else {
      setMsg("Kullanici adi veya parola hatali.");
    }
  }

  return (
    <div className="page page--narrow">
      <h1 className="page-title">Giris yap</h1>
      <p className="page-sub">Notlarina ulasmak icin hesabina gir.</p>

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
            autoComplete="current-password"
          />
        </label>

        {msg && <p className="msg error">{msg}</p>}

        <button className="btn primary block">Giris yap</button>
      </form>

      <p className="alt">
        Hesabin yok mu?{" "}
        <button className="link" type="button" onClick={() => go("register")}>
          Kayit ol
        </button>
      </p>
    </div>
  );
}
