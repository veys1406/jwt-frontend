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
    // refreshToken artik httpOnly bir cookie'de (path=/refresh) — tarayici onu
    // otomatik gonderiyor, body'ye koymamiza gerek yok (K3 kapandi).
    const res = await run({ method: "POST", path: "/refresh" });
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
        <p className="page-sub">
          Refresh token artik <code>httpOnly</code> bir cookie'de (sadece{" "}
          <code>/refresh</code>'e gidiyor) — asagidaki kutuya bir sey yazmana gerek yok, buton
          tek basina calisir.
        </p>
        <button className="btn" onClick={renew}>
          Yenile
        </button>

        <label className="field" style={{ marginTop: 18 }}>
          <span className="field-label">Refresh token (sadece cikis testi icin)</span>
          <textarea
            rows={3}
            value={refreshToken}
            onChange={(e) => setRefreshToken(e.target.value)}
            placeholder="docker exec -it redis redis-cli --scan ile bulup buraya yapistir"
          />
        </label>
      </div>
    </div>
  );
}
