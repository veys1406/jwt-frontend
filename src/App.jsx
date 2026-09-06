import { useEffect, useState } from "react";
import { call } from "./api.js";
import Inspector from "./Inspector.jsx";
import { META } from "./meta.jsx";

import Register from "./screens/Register.jsx";
import Login from "./screens/Login.jsx";
import Account from "./screens/Account.jsx";
import MyNotes from "./screens/MyNotes.jsx";
import NewNote from "./screens/NewNote.jsx";
import NoteDetail from "./screens/NoteDetail.jsx";
import SearchNotes from "./screens/SearchNotes.jsx";
import UploadNote from "./screens/UploadNote.jsx";

const SCREENS = {
  login: Login,
  register: Register,
  account: Account,
  mynotes: MyNotes,
  new: NewNote,
  detail: NoteDetail,
  search: SearchNotes,
  upload: UploadNote,
};

const APP_NAV = [
  { key: "mynotes", label: "Notlarim" },
  { key: "new", label: "Yeni not" },
  { key: "detail", label: "Not ac" },
  { key: "search", label: "Ara" },
  { key: "upload", label: "Gorsel yukle" },
];

export default function App() {
  const [active, setActive] = useState("login");
  const [entries, setEntries] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // Butun ekranlar isteklerini bu fonksiyondan geciriyor,
  // boylece hicbir cagri sag panele dusmeden kacamiyor.
  async function run(opts) {
    const entry = await call(opts);
    setEntries((prev) => [entry, ...prev].slice(0, 40));
    return entry;
  }

  const session = {
    loggedIn,
    username,
    setLoggedIn: (value, name) => {
      setLoggedIn(value);
      if (name !== undefined) setUsername(name);
      // XSRF-TOKEN cookie'si tembel uretiliyor (deferred), bu istek onu tetikliyor.
      if (value) run({ method: "GET", path: "/csrf" });
    },
  };

  // Sayfa acilinca/yenilenince oturumu backend'e sorup ogreniyoruz (A1).
  // accessToken httpOnly oldugu icin JS onu okuyamiyor, tek yol backend'e sormak.
  // Bos dependency dizisi = "sadece ilk render'da bir kez calis".
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    (async () => {
      const res = await run({ method: "GET", path: "/me" });
      if (res.ok && res.data) {
        session.setLoggedIn(true, res.data.username);
        setActive((current) => (current === "login" ? "mynotes" : current));
      }
      // 401 ise loggedIn zaten varsayilan olarak false, hicbir sey yapmiyoruz.
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Screen = SCREENS[active];

  return (
    <div className="app">
      <nav className="nav">
        <div className="brand">
          <span className="brand-dot" />
          <strong>Notlar</strong>
        </div>

        <div className="nav-group">
          {APP_NAV.map((i) => (
            <button
              key={i.key}
              className={"nav-item " + (active === i.key ? "is-active" : "")}
              onClick={() => setActive(i.key)}
            >
              {i.label}
            </button>
          ))}
        </div>

        <div className="nav-bottom">
          {loggedIn ? (
            <button
              className={"user-chip " + (active === "account" ? "is-active" : "")}
              onClick={() => setActive("account")}
            >
              <span className="avatar sm">{(username || "?").charAt(0).toUpperCase()}</span>
              <span className="user-name">{username || "hesabim"}</span>
            </button>
          ) : (
            <div className="nav-group">
              <button
                className={"nav-item " + (active === "login" ? "is-active" : "")}
                onClick={() => setActive("login")}
              >
                Giris yap
              </button>
              <button
                className={"nav-item " + (active === "register" ? "is-active" : "")}
                onClick={() => setActive("register")}
              >
                Kayit ol
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="main">
        <Screen run={run} session={session} go={setActive} />
      </main>

      <Inspector
        entries={entries}
        loggedIn={loggedIn}
        onClear={() => setEntries([])}
        meta={META[active]}
        run={run}
        session={session}
      />
    </div>
  );
}
