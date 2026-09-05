import { useState } from "react";

export default function Account({ run, session, go }) {
  const [refreshToken, setRefreshToken] = useState("");
  const [msg, setMsg] = useState("");

  async function logout() {
    setMsg("");
    const body = refreshToken ? { token: refreshToken } : undefined;
    const res = await run({ method: "POST", path: "/logout", body });
    if (res.ok) {
      session.setLoggedIn(false, "");
      go("login");
    } else {
      setMsg("Cikis yapilamadi.");
    }
  }

  async function probe() {
    setMsg("");
    const res = await run({ method: "GET", path: "/mynotes" });
    session.setLoggedIn(res.ok, session.username);
    setMsg(res.ok ? "Oturum gecerli." : "Oturum gecersiz, tekrar giris yapmalisin.");
  }

  async function renew() {
    setMsg("");
    const res = await run({ method: "POST", path: "/refresh", body: { token: refreshToken } });
    setMsg(res.ok && res.data?.message ? res.data.message : "Token yenilenemedi.");
  }

  return (
    <div className="page page--narrow">
      <h1 className="page-title">Hesap</h1>

      <div className="account-row">
        <div className="avatar">{(session.username || "?").charAt(0).toUpperCase()}</div>
        <div>
          <strong>{session.username || "bilinmiyor"}</strong>
          <p className={"state " + (session.loggedIn ? "on" : "off")}>
            {session.loggedIn ? "oturum acik" : "oturum kapali"}
          </p>
        </div>
      </div>

      {msg && <p className="msg">{msg}</p>}

      <div className="stack">
        <button className="btn block" onClick={probe}>
          Oturumu yokla
        </button>
        <button className="btn danger block" onClick={logout}>
          Cikis yap
        </button>
      </div>

      <div className="advanced">
        <h3 className="preview-title">Oturumu yenile</h3>
        <label className="field">
          <span className="field-label">Refresh token</span>
          <textarea
            rows={3}
            value={refreshToken}
            onChange={(e) => setRefreshToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiJ9..."
          />
        </label>
        <button className="btn" onClick={renew} disabled={!refreshToken}>
          Yenile
        </button>
      </div>
    </div>
  );
}
