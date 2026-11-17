// Pagina principală (/): fotografia cu cifrele flotei, formularul de adăugare și lista.
// State-ul, efectul de încărcare și funcțiile sunt cele din App.jsx de la Etapa 7.
import { useEffect, useState } from "react";
import TirList from "../components/TirList.jsx";
import TirMap from "../components/TirMap.jsx";
import TirForm from "../components/TirForm.jsx";
import { createTir, deleteTir, fetchTiruri, updateTir } from "../api.js";
import styles from "./TiruriPage.module.css";

export default function TiruriPage() {
  // Lista pornește goală: datele vin de la server (json-server, db.json)
  const [tiruri, setTiruri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // tirul deschis pe hartă: doar id-ul, datele se iau mereu din listă
  const [selectatId, setSelectatId] = useState(null);

  // Rulează o singură dată, după prima randare
  useEffect(() => {
    let ignore = false; // nu se setează state dacă pagina a dispărut între timp

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

  // Valori derivate: se recalculează din listă la fiecare randare, nu stau în state
  const inTranzit = tiruri.filter((t) => !t.arrived).length;
  const sosite = tiruri.length - inTranzit;
  const selectat = tiruri.find((t) => t.id === selectatId);
  const internationale = tiruri.filter((t) => t.category !== "Domestic").length;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Dispecerat flotă</p>
          <h1>FleetTrack</h1>
          <p className={styles.lead}>
            Evidența tirurilor din flotă: remorcă, șofer, destinație și starea cursei.
          </p>
        </div>

        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dt>Total flotă</dt>
            <dd>{tiruri.length}</dd>
          </div>
          <div className={`${styles.stat} ${styles.statTransit}`}>
            <dt>În tranzit</dt>
            <dd>{inTranzit}</dd>
          </div>
          <div className={`${styles.stat} ${styles.statDone}`}>
            <dt>Sosite</dt>
            <dd>{sosite}</dd>
          </div>
          <div className={styles.stat}>
            <dt>Curse internaționale</dt>
            <dd>{internationale}</dd>
          </div>
        </dl>
      </section>

      <div className={styles.grid}>
        <section className={`panel surface ${styles.formPanel}`}>
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
              <p className="panel-hint">
                Apasă pe numele unui tir pentru fișa lui, sau pe card ca să-i vezi traseul pe hartă.
              </p>
            </div>
            {/* contorul stă acum în panoul listei: antetul e comun tuturor paginilor */}
            <span className="count-pill">
              {tiruri.length} tiruri, dintre care {inTranzit} în tranzit
            </span>
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
      </div>

      {selectat && <TirMap tir={selectat} onClose={() => setSelectatId(null)} />}
    </>
  );
}
