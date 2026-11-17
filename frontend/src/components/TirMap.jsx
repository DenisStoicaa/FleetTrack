// Fereastra cu harta unui tir, deschisă din card: antetul (plăcuță, stare, model, șofer)
// și traseul (componenta TirTraseu, folosită și în pagina de detaliu).
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import TirTraseu from "./TirTraseu.jsx";
import { TRASEE } from "../data/harta.js";
import { numarSiModel } from "../format.js";
import styles from "./TirMap.module.css";

export default function TirMap({ tir, onClose }) {
  const dialogRef = useRef(null);

  // <dialog> deschis ca modal: focus în fereastră, Escape o închide
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  const inchide = () => dialogRef.current.close();

  const [numar, model] = numarSiModel(tir.name);
  const traseu = TRASEE[tir.id];

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="map-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && inchide()}
    >
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <p className={styles.kicker}>
              <span className="plate">
                <span className="plate-eu">RO</span>
                {numar}
              </span>
              <span className={tir.arrived ? "status done" : "status"}>
                <span className="dot" aria-hidden="true"></span>
                {tir.arrived ? "Sosit" : "În tranzit"}
              </span>
            </p>
            <h2 id="map-title" className={styles.title}>{model || tir.name}</h2>
            <p className={styles.sub}>
              {tir.driver} · {traseu ? `${traseu.opriri[0]} → ${tir.destination}` : tir.destination}
            </p>
          </div>
          <div className={styles.headActions}>
            <Link to={`/tiruri/${tir.id}`} className="btn-ghost">
              Fișa tirului
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <button className={styles.close} onClick={inchide} aria-label="Închide harta" title="Închide (Esc)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        </header>

        <TirTraseu tir={tir} />
      </div>
    </dialog>
  );
}
