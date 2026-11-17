// Cadrul comun tuturor paginilor: bara laterală (marca, navigația, ceasul dispeceratului,
// tema) și subsolul. Pagina curentă se desenează în locul lui <Outlet />.
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import styles from "./Layout.module.css";

// Tema de pornire: cea salvată (pusă pe <html> de scriptul din index.html), altfel a sistemului
function temaInitiala() {
  const salvata = document.documentElement.dataset.theme;
  if (salvata === "light" || salvata === "dark") return salvata;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const formatOra = new Intl.DateTimeFormat("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const formatZi = new Intl.DateTimeFormat("ro-RO", { weekday: "long", day: "numeric", month: "long" });

// NavLink transmite isActive: adevărat când adresa curentă se potrivește cu linkul
function navClass({ isActive }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

export default function Layout() {
  const [tema, setTema] = useState(temaInitiala);
  const [acum, setAcum] = useState(() => new Date());

  // ceasul din bara laterală: o actualizare pe secundă
  useEffect(() => {
    const id = setInterval(() => setAcum(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Comutarea temei: state-ul pentru butoane, atributul data-theme pentru CSS,
  // localStorage ca alegerea să rămână și după reîncărcare
  function alegeTema(noua) {
    setTema(noua);
    document.documentElement.dataset.theme = noua;
    try {
      localStorage.setItem("fleettrack-tema", noua);
    } catch {
      /* fără localStorage, tema ține până la reîncărcare */
    }
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M2 6h12v10H2z" /><path d="M14 9h4l4 4v3h-8z" /><circle cx="6.5" cy="17.5" r="2" /><circle cx="17.5" cy="17.5" r="2" /></svg>
          </span>
          <span>
            <span className={styles.logo}>FleetTrack</span>
            <span className={styles.logoSub}>Dispecerat</span>
          </span>
        </Link>

        <nav className={styles.nav} data-testid="nav" aria-label="Navigare principală">
          {/* end: potrivire exactă, altfel "/" ar fi activ pe toate paginile */}
          <NavLink to="/" end className={navClass}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
            Flotă
          </NavLink>
          <NavLink to="/despre" className={navClass}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
            Despre
          </NavLink>
        </nav>

        <div className={styles.clock} aria-hidden="true">
          <p className="eyebrow">Ora dispeceratului</p>
          <p className={styles.time}>{formatOra.format(acum)}</p>
          <p className={styles.date}>{formatZi.format(acum)}</p>
        </div>

        <div className={styles.theme} role="group" aria-label="Tema">
          <button
            type="button"
            className={tema === "light" ? styles.themeOn : undefined}
            aria-pressed={tema === "light"}
            onClick={() => alegeTema("light")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            <span className={styles.themeLabel}>Luminos</span>
          </button>
          <button
            type="button"
            className={tema === "dark" ? styles.themeOn : undefined}
            aria-pressed={tema === "dark"}
            onClick={() => alegeTema("dark")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
            <span className={styles.themeLabel}>Întunecat</span>
          </button>
        </div>
      </aside>

      <div className={styles.content}>
        <main className={styles.main}>
          <Outlet />
        </main>

        <footer className={styles.footer}>
          <span>FleetTrack · Proiect Tehnologii Web</span>
          <span>
            Fotografii: <a href="https://unsplash.com" target="_blank" rel="noreferrer">Unsplash</a>
          </span>
        </footer>
      </div>
    </div>
  );
}
