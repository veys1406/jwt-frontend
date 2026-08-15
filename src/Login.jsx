import { useState } from 'react';

function Login() {
    const [username, setUsername] = useState("");// initialize
    const [password, setPassword] = useState("");// setPassword ile degistirilebilir sadece

    async function handleLogin(){// async cunku cevap gelene kadar satir atlamasin diye
        const response = await fetch("http://localhost:8080/login", {
           method:"POST",
           headers: { "Content-Type": "application/json" },
            body: JSON.stringify({username,password})
        });
        const data = await response.json();
        console.log(data);
    }

    return(// her input degisikliginde username veya passwordu degistirecek
        <div>
            <input onChange={(e) => setUsername(e.target.value)} />
            <input onChange={(e) => setPassword(e.target.value)} type="password" />
            <button onClick={handleLogin}>Login</button>
        </div>
    );

}
export default Login;