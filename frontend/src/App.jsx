// FleetTrack · Etapa 5: componenta principală, cu state local și evenimente
import { useState } from "react";
import TirList from "./components/TirList.jsx";

// Datele de test din README (doar valoarea inițială, folosită o singură dată, la prima randare)
const TIRURI_INITIALE = [
  { id: 1, name: "B 101 FLT · Volvo FH16", arrived: false, trailerType: "refrigerated", category: "EU", driver: "Ion Popescu", destination: "Berlin" },
  { id: 2, name: "B 202 FLT · Scania R450", arrived: true, trailerType: "curtainsider", category: "Domestic", driver: "Maria Ionescu", destination: "Cluj-Napoca" },
  { id: 3, name: "CJ 303 FLT · DAF XF", arrived: false, trailerType: "tanker", category: "Non-EU", driver: "Andrei Georgescu", destination: "Istanbul" },
];

// Tema de pornire: cea a sistemului de operare
function temaInitiala() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  const [tiruri, setTiruri] = useState(TIRURI_INITIALE);
  const [tema, setTema] = useState(temaInitiala);

  // Actualizare imutabilă: listă nouă, obiect nou doar pentru tirul schimbat
  function handleToggleSosit(id) {
    setTiruri((prev) =>
      prev.map((t) => (t.id === id ? { ...t, arrived: !t.arrived } : t))
    );
  }

  function handleDelete(id) {
    setTiruri((prev) => prev.filter((t) => t.id !== id));
  }

  // Comutarea temei: state-ul pentru buton, atributul data-theme pentru CSS
  function handleTema() {
    const noua = tema === "dark" ? "light" : "dark";
    setTema(noua);
    document.documentElement.dataset.theme = noua;
  }

  // Valori derivate: se recalculează din listă la fiecare randare, nu stau în state
  const inTranzit = tiruri.filter((t) => !t.arrived).length;
  const sosite = tiruri.length - inTranzit;
  const internationale = tiruri.filter((t) => t.category !== "Domestic").length;

  return (
    <>
      <header className="app-header">
        <button
          className="theme-toggle"
          onClick={handleTema}
          aria-pressed={tema === "dark"}
        >
          {tema === "dark" ? "Mod luminos" : "Mod întunecat"}
        </button>
        <div className="header-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M2 6h12v10H2z" /><path d="M14 9h4l4 4v3h-8z" /><circle cx="6.5" cy="17.5" r="2" /><circle cx="17.5" cy="17.5" r="2" /></svg>
            </span>
            <div>
              <h1>FleetTrack</h1>
              <p>Evidența tirurilor din flotă: remorcă, șofer, destinație și starea cursei.</p>
            </div>
          </div>
          <p className="app-count">
            {tiruri.length} tiruri, dintre care {inTranzit} în tranzit
          </p>

          <dl className="stats">
            <div className="stat">
              <dt>Total flotă</dt>
              <dd>{tiruri.length}</dd>
            </div>
            <div className="stat stat-transit">
              <dt>În tranzit</dt>
              <dd>{inTranzit}</dd>
            </div>
            <div className="stat stat-done">
              <dt>Sosite</dt>
              <dd>{sosite}</dd>
            </div>
            <div className="stat">
              <dt>Curse internaționale</dt>
              <dd>{internationale}</dd>
            </div>
          </dl>
        </div>
      </header>

      <main className="container">
        <section className="panel">
          <div className="panel-head">
            <h2>Flota mea</h2>
            <span className="count-pill">{tiruri.length} tiruri</span>
          </div>
          <TirList
            tiruri={tiruri}
            onToggle={handleToggleSosit}
            onDelete={handleDelete}
          />
        </section>
      </main>

      <footer className="app-footer">FleetTrack · Proiect Tehnologii Web</footer>
    </>
  );
}
