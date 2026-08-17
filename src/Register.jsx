import { useState } from 'react';
import './Login.css';

function Register({ onSwitch }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");
    const [error, setError] = useState("");
    const [registered, setRegistered] = useState(false);

    async function handleRegister() {
        setError("");

        if (!username || !password) {
            setError("Kullanıcı adı ve parola zorunludur.");
            return;
        }

        if (password !== passwordAgain) {
            setError("Parolalar eşleşmiyor.");
            return;
        }

        const response = await fetch("http://localhost:8080/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            setRegistered(true);
        } else {
            setError("Kayıt başarısız. Kullanıcı adı alınmış olabilir.");
        }
    }

    return (
        <div className="auth">
          <div className="auth-card">
            <div className="auth-head">
              <span className="auth-mark" aria-hidden="true">&#9679;</span>
              <h1 className="auth-title">Hesap oluşturun</h1>
              <p className="auth-subtitle">Başlamak için birkaç saniye yeterli.</p>
            </div>

            {registered ? (
                <div className="auth-form">
                  <p className="auth-status">Kayıt tamamlandı!</p>
                  <p className="auth-hint">Artık yeni hesabınızla giriş yapabilirsiniz.</p>
                  <button className="auth-btn auth-btn--primary" onClick={onSwitch}>Girişe dön</button>
                </div>
            ) : (
                <div className="auth-form">
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="register-username">Kullanıcı adı</label>
                    <input
                      id="register-username"
                      className="auth-input"
                      placeholder="kullanici adiniz"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="register-password">Parola</label>
                    <input
                      id="register-password"
                      className="auth-input"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="register-password-again">Parola tekrar</label>
                    <input
                      id="register-password-again"
                      className="auth-input"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      type="password"
                      value={passwordAgain}
                      onChange={(e) => setPasswordAgain(e.target.value)}
                    />
                  </div>

                  {error && <p className="auth-error">{error}</p>}

                  <button className="auth-btn auth-btn--primary" onClick={handleRegister}>Kayıt ol</button>

                  <p className="auth-alt">
                    Zaten hesabınız var mı?{' '}
                    <button className="auth-link" type="button" onClick={onSwitch}>Giriş yapın</button>
                  </p>
                </div>
            )}
          </div>
        </div>
    );
}

export default Register;
