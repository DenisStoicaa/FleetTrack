// Antetul, navigația și subsolul, comune tuturor paginilor: scrise o singură dată.
// Pagina curentă se desenează în locul lui <Outlet />.
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import styles from "./Layout.module.css";

// Tema de pornire: cea a sistemului de operare
function temaInitiala() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// NavLink transmite isActive: adevărat când adresa curentă se potrivește cu linkul
function navClass({ isActive }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

export default function Layout() {
  const [tema, setTema] = useState(temaInitiala);

  // Comutarea temei: state-ul pentru buton, atributul data-theme pentru CSS
  function handleTema() {
    const noua = tema === "dark" ? "light" : "dark";
    setTema(noua);
    document.documentElement.dataset.theme = noua;
  }

  return (
    <>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M2 6h12v10H2z" /><path d="M14 9h4l4 4v3h-8z" /><circle cx="6.5" cy="17.5" r="2" /><circle cx="17.5" cy="17.5" r="2" /></svg>
          </span>
          <span className={styles.logo}>FleetTrack</span>
        </Link>

        <nav className={styles.nav} data-testid="nav" aria-label="Navigare principală">
          {/* end: potrivire exactă, altfel "/" ar fi activ pe toate paginile */}
          <NavLink to="/" end className={navClass}>
            Flotă
          </NavLink>
          <NavLink to="/despre" className={navClass}>
            Despre
          </NavLink>
        </nav>

        <button className={styles.toggle} onClick={handleTema} aria-pressed={tema === "dark"}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {tema === "dark"
              ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>
              : <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}
          </svg>
          {tema === "dark" ? "Mod luminos" : "Mod întunecat"}
        </button>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <span>FleetTrack · Proiect Tehnologii Web</span>
        <span>
          Fotografii: <a href="https://unsplash.com" target="_blank" rel="noreferrer">Unsplash</a>
        </span>
      </footer>
    </>
  );
}
