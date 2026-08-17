import { useState } from 'react'
import Login from './Login.jsx'
import Register from './Register.jsx'

function App() {
  const [view, setView] = useState("login");

  return view === "login"
    ? <Login onSwitch={() => setView("register")} />
    : <Register onSwitch={() => setView("login")} />;
}
export default App;
