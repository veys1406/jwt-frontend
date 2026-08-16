import { useState } from 'react';

function Login() {
    const [username, setUsername] = useState("");// initialize
    const [password, setPassword] = useState("");// setPassword ile degistirilebilir sadece
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [note, setNote] = useState("");

    async function handleLogin(){// async cunku cevap gelene kadar satir atlamasin diye
        const response = await fetch("http://localhost:8080/login", {
           method:"POST",
           headers: { "Content-Type": "application/json" },
            body: JSON.stringify({username,password})
        });
        const data = await response.json();
        console.log(data);
        setToken(data.accessToken);
        localStorage.setItem("token", data.accessToken)
    }

    function handleLogout() {
        localStorage.removeItem("token");
        setToken(null);
    }

    return(// her input degisikliginde username veya passwordu degistirecek
        token ? (
            <div>
                <p>Giris yapildi!</p>
                <button onClick={handleLogout}>Cikis yap</button>
                <textarea onChange={(e) => setNote(e.target.value)} />
                <div dangerouslySetInnerHTML={{ __html: note }} />
            </div>
        ) : (
            <div>
                <input onChange={(e) => setUsername(e.target.value)} />
                <input onChange={(e) => setPassword(e.target.value)} type="password" />
                <button onClick={handleLogin}>Login</button>
            </div>
        )
    );

}
export default Login;