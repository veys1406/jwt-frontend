import { useEffect, useRef, useState } from "react";
import { inferChain } from "./chain.js";

function Chain({ entry, loggedIn }) {
  const stages = inferChain(entry, loggedIn);
  return (
    <div className="chain">
      {stages.map((s) => (
        <div key={s.key} className={"stage s-" + s.state}>
          <div className="stage-head">
            <span className="stage-dot" />
            <span className="stage-label">{s.label}</span>
          </div>
          <p className="stage-note">{s.note || s.hint}</p>
        </div>
      ))}
    </div>
  );
}

function Entry({ entry, loggedIn, open, onToggle }) {
  const tone = entry.networkError ? "bad" : entry.ok ? "good" : "warn";

  return (
    <article className={"log " + (open ? "is-open" : "")}>
      <button className="log-head" onClick={onToggle}>
        <span className={"method m-" + entry.method.toLowerCase()}>{entry.method}</span>
        <code className="log-path">{entry.path}</code>
        <span className={"status st-" + tone}>{entry.networkError ? "ERR" : entry.status}</span>
        <span className="log-ms">{entry.duration} ms</span>
      </button>

      {open && (
        <div className="log-body">
          <section>
            <h4>Giden istek</h4>
            <pre className="raw">{entry.method + " " + entry.url}</pre>
            <div className="hdr">
              {Object.entries(entry.requestHeaders).map(([k, v]) => (
                <div key={k}>
                  <span className="hdr-k">{k}:</span> {v}
                </div>
              ))}
              <div className="hdr-auto">
                <span className="hdr-k">Origin:</span> http://localhost:5173
                <span className="hdr-tag">tarayici ekledi</span>
              </div>
              <div className="hdr-auto">
                <span className="hdr-k">Cookie:</span> accessToken=&bull;&bull;&bull;&bull;&bull;&bull;
                <span className="hdr-tag">httpOnly — JS okuyamaz</span>
              </div>
            </div>
            {entry.requestBody && <pre className="raw">{entry.requestBody}</pre>}
          </section>

          <section>
            <h4>Gelen cevap</h4>
            {entry.networkError ? (
              <pre className="raw bad">{entry.networkError}</pre>
            ) : (
              <>
                <pre className="raw">{entry.responseText || "(govde bos — endpoint void donuyor)"}</pre>
                <p className="tiny">
                  Cevap header'larindan sadece {entry.responseHeaders.length} tanesini
                  gorebiliyoruz. Set-Cookie dahil digerlerini CORS gizliyor.
                </p>
              </>
            )}
          </section>

          <section>
            <h4>Istek nereye kadar gitti</h4>
            <Chain entry={entry} loggedIn={loggedIn} />
          </section>
        </div>
      )}
    </article>
  );
}

function About({ meta, run, session }) {
  const Tools = meta.Tools;

  return (
    <div className="about">
      <div className="ep-sig">
        <span className={"method m-" + meta.method.toLowerCase()}>{meta.method}</span>
        <code className="ep-path">{meta.path}</code>
        <span className={"ep-auth " + (meta.auth ? "is-locked" : "is-open")}>
          {meta.auth ? "kimlik gerekli" : "permitAll"}
        </span>
      </div>

      <p className="about-desc">{meta.desc}</p>

      {meta.notes.map((n) => (
        <div key={n.title} className="note-box">
          <h4>{n.title}</h4>
          <p>{n.body}</p>
        </div>
      ))}

      {meta.gaps.map((g) => (
        <div key={g.code} className="gap">
          <span className="gap-code">{g.code}</span>
          <span>{g.body}</span>
        </div>
      ))}

      {meta.tryouts.length > 0 && (
        <div className="tryout">
          <h4>Denemeye deger</h4>
          <ul>
            {meta.tryouts.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {Tools && <Tools run={run} session={session} />}
    </div>
  );
}

export default function Inspector({ entries, loggedIn, onClear, meta, run, session }) {
  const [tab, setTab] = useState("about");
  const [openId, setOpenId] = useState(null);
  const seen = useRef(0);

  // yeni istek geldiginde otomatik gunluge gec — arkada ne oldugu kacmasin
  useEffect(() => {
    if (entries.length > seen.current) setTab("log");
    seen.current = entries.length;
  }, [entries.length]);

  return (
    <aside className="inspector">
      <div className="tabs">
        <button className={"tab " + (tab === "about" ? "is-active" : "")} onClick={() => setTab("about")}>
          Bu ekran
        </button>
        <button className={"tab " + (tab === "log" ? "is-active" : "")} onClick={() => setTab("log")}>
          Istekler{entries.length > 0 && <span className="tab-count">{entries.length}</span>}
        </button>
        {tab === "log" && entries.length > 0 && (
          <button className="tab-clear" onClick={onClear}>
            temizle
          </button>
        )}
      </div>

      <div className="inspector-body">
        {tab === "about" ? (
          <About meta={meta} run={run} session={session} />
        ) : entries.length === 0 ? (
          <p className="empty">
            Henuz istek yok. Soldan bir sey yap — her <code>fetch</code> buraya ham haliyle
            dusecek.
          </p>
        ) : (
          <div className="log-list">
            {entries.map((e) => (
              <Entry
                key={e.id}
                entry={e}
                loggedIn={loggedIn}
                open={openId === e.id}
                onToggle={() => setOpenId(openId === e.id ? null : e.id)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
