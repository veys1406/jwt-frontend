import { useState } from 'react';

function Login() {
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

    return(// her input degisikliginde username veya passwordu degistirecek
        loggedIn ? (
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