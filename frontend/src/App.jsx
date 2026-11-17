// FleetTrack · componenta principală: date de la API (citire, adăugare, modificare, ștergere), evenimente și tema
import { useEffect, useState } from "react";
import TirList from "./components/TirList.jsx";
import TirMap from "./components/TirMap.jsx";
import TirForm from "./components/TirForm.jsx";
import { createTir, deleteTir, fetchTiruri, updateTir } from "./api.js";

// Tema de pornire: cea a sistemului de operare
function temaInitiala() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  // Lista pornește goală: datele vin de la server (json-server, db.json)
  const [tiruri, setTiruri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tema, setTema] = useState(temaInitiala);
  // tirul deschis pe hartă: doar id-ul, datele se iau mereu din listă
  const [selectatId, setSelectatId] = useState(null);

  // Rulează o singură dată, după prima randare
  useEffect(() => {
    let ignore = false; // nu se setează state dacă componenta a dispărut între timp

    async function load() {
      try {
        const data = await fetchTiruri();
        if (!ignore) setTiruri(data);
      } catch (err) {
        if (!ignore) setError(`Nu am putut încărca flota: ${err.message}. Rulează npm run api?`);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Întâi serverul, apoi state-ul: pe ecran ajunge doar ce s-a salvat.
  // Fără try: eroarea ajunge înapoi în formular, care o afișează lângă câmpuri.
  async function handleAdd(tir) {
    const creat = await createTir(tir); // serverul întoarce tirul cu id
    setTiruri((prev) => [...prev, creat]);
  }

  // PATCH trimite doar câmpul schimbat; în listă se pune obiectul întors de server
  async function handleToggleSosit(id) {
    const tir = tiruri.find((t) => t.id === id);
    try {
      const actualizat = await updateTir(id, { arrived: !tir.arrived });
      setTiruri((prev) => prev.map((t) => (t.id === id ? actualizat : t)));
      setError(null);
    } catch (err) {
      setError(`Nu am putut actualiza tirul: ${err.message}`);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTir(id);
      setTiruri((prev) => prev.filter((t) => t.id !== id));
      if (selectatId === id) setSelectatId(null);
      setError(null);
    } catch (err) {
      setError(`Nu am putut șterge tirul: ${err.message}`);
    }
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
  const selectat = tiruri.find((t) => t.id === selectatId);
  const internationale = tiruri.filter((t) => t.category !== "Domestic").length;

  return (
    <>
      <header className="app-header">
        <div className="hero-top">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M2 6h12v10H2z" /><path d="M14 9h4l4 4v3h-8z" /><circle cx="6.5" cy="17.5" r="2" /><circle cx="17.5" cy="17.5" r="2" /></svg>
            </span>
            <span className="brand-tag">Dispecerat flotă</span>
          </div>
          <button
            className="theme-toggle"
            onClick={handleTema}
            aria-pressed={tema === "dark"}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {tema === "dark"
                ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>
                : <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}
            </svg>
            {tema === "dark" ? "Mod luminos" : "Mod întunecat"}
          </button>
        </div>

        <div className="hero-copy">
          <h1>FleetTrack</h1>
          <p>Evidența tirurilor din flotă: remorcă, șofer, destinație și starea cursei.</p>
          <p className="app-count">
            {tiruri.length} tiruri, dintre care {inTranzit} în tranzit
          </p>
        </div>

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
      </header>

      <main className="container">
        <section className="panel panel-form">
          <div className="panel-head">
            <div>
              <h2>Adaugă tir</h2>
              <p className="panel-hint">Tirul apare în flotă după ce serverul confirmă salvarea.</p>
            </div>
          </div>
          <TirForm onAdd={handleAdd} />
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Flota mea</h2>
              <p className="panel-hint">Bifează un tir când ajunge la destinație. Apasă pe un tir ca să-i vezi traseul pe hartă.</p>
            </div>
            <span className="count-pill">{tiruri.length} tiruri</span>
          </div>
          {/* Cele trei stări ale încărcării: așteptare, eroare, succes */}
          {loading && (
            <p className="info" data-testid="loading">
              Se încarcă flota…
            </p>
          )}
          {error && (
            <p className="error" role="alert" data-testid="error">
              {error}
            </p>
          )}
          {/* fără !error: dacă o bifare eșuează, lista rămâne pe ecran sub mesaj */}
          {!loading && (
            <TirList
              tiruri={tiruri}
              onToggle={handleToggleSosit}
              onDelete={handleDelete}
              onSelect={setSelectatId}
            />
          )}
        </section>
      </main>

      {selectat && <TirMap tir={selectat} onClose={() => setSelectatId(null)} />}

      <footer className="app-footer">
        <span>FleetTrack · Proiect Tehnologii Web</span>
        <span>
          Fotografii: <a href="https://unsplash.com" target="_blank" rel="noreferrer">Unsplash</a>
        </span>
      </footer>
    </>
  );
}
