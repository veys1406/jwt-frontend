import { useState } from 'react';
import './Login.css';

function Login({ onSwitch }) {
    const [username, setUsername] = useState("");// initialize
    const [password, setPassword] = useState("");// setPassword ile degistirilebilir sadece
    const [loggedIn, setLoggedIn] = useState(false);
    const [note, setNote] = useState("");

    async function handleLogin(){// async cunku cevap gelene kadar satir atlamasin diye
        const response = await fetch("http://localhost:8080/login", {
           method:"POST",
           headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({username,password})
        });
        if (response.ok) {
            setLoggedIn(true);
        }
    }

    async function handleLogout() {
        await fetch("http://localhost:8080/logout", {
            method: "POST",
            credentials: "include"
        });
        setLoggedIn(false);
    }

    return(
        loggedIn ? (
            <div className="auth">
              <div className="auth-card auth-card--wide">
                <div className="auth-session">
                  <p className="auth-status">Giris yapildi!</p>
                  <button className="auth-btn auth-btn--ghost" onClick={handleLogout}>Cikis yap</button>
                </div>
                <div className="auth-panel">
                  <h2 className="auth-panel-title">Not</h2>
                  <textarea
                    className="auth-textarea"
                    placeholder="Notunuzu yazin..."
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <div className="auth-panel">
                  <h2 className="auth-panel-title">Onizleme</h2>
                  <div className="auth-preview" dangerouslySetInnerHTML={{ __html: note }} />
                </div>
              </div>
            </div>
        ) : (
            <div className="auth">
              <div className="auth-card">
                <div className="auth-head">
                  <span className="auth-mark" aria-hidden="true">&#9679;</span>
                  <h1 className="auth-title">Tekrar hos geldiniz</h1>
                  <p className="auth-subtitle">Devam etmek icin hesabiniza giris yapin.</p>
                </div>
                <div className="auth-form">
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="auth-username">Kullanici adi</label>
                    <input
                      id="auth-username"
                      className="auth-input"
                      placeholder="kullanici adiniz"
                      autoComplete="username"
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="auth-password">Parola</label>
                    <input
                      id="auth-password"
                      className="auth-input"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                    />
                  </div>
                  <button className="auth-btn auth-btn--primary" onClick={handleLogin}>Login</button>

                  <p className="auth-alt">
                    Hesabiniz yok mu?{' '}
                    <button className="auth-link" type="button" onClick={onSwitch}>Kayit olun</button>
                  </p>
                </div>
              </div>
            </div>
        )
    );

}
export default Login;