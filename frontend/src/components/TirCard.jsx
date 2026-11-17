// Un singur tir din listă, primit prin props, împreună cu funcțiile din pagina cu lista.
// Titlul este link către pagina de detaliu; restul cardului deschide harta traseului.
import { Link } from "react-router-dom";
import { ETICHETE_REMORCA, FOTO_REMORCA, ICONITE_REMORCA } from "../constants.js";
import { initiale, numarSiModel, nuanta } from "../format.js";
import styles from "./TirCard.module.css";

export default function TirCard({ tir, pozitie, onToggle, onDelete, onSelect }) {
  const [numar, model] = numarSiModel(tir.name);

  return (
    <li
      className={tir.arrived ? `${styles.card} ${styles.done}` : styles.card}
      style={{ "--i": pozitie, "--hue": nuanta(tir.id) }}
      data-testid="item"
      data-id={tir.id}
      // clic oriunde pe card deschide harta, mai puțin pe link, pe comutator și pe butoane
      onClick={(e) => {
        if (!e.target.closest(`a, button, .${styles.actions}`)) onSelect(tir.id);
      }}
    >
      <div className={styles.photo}>
        <img
          src={FOTO_REMORCA[tir.trailerType]}
          alt={`Camion cu remorcă ${ETICHETE_REMORCA[tir.trailerType].toLowerCase()}`}
          loading="lazy"
        />
        <span className={tir.arrived ? "status done" : "status"}>
          <span className="dot" aria-hidden="true"></span>
          {tir.arrived ? "Sosit" : "În tranzit"}
        </span>
        {/* același lucru și din tastatură */}
        <button
          className={styles.mapOpen}
          onClick={() => onSelect(tir.id)}
          aria-label={`Vezi traseul pentru ${numar} pe hartă`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" />
          </svg>
          Traseu
        </button>
        <span className="plate">
          <span className="plate-eu">RO</span>
          {numar}
        </span>
      </div>

      <div className={styles.body}>
        {/* titlul duce la /tiruri/:id; textul complet al linkului este tir.name,
            numărul e deja pe plăcuță, deci se ascunde vizual */}
        <h3 className={styles.title}>
          <Link to={`/tiruri/${tir.id}`} className={styles.titleLink} data-testid="item-link">
            {model ? (
              <>
                <span className="visually-hidden">{numar} · </span>
                {model}
              </>
            ) : (
              tir.name
            )}
          </Link>
        </h3>

        <dl className={styles.meta}>
          <div>
            <dt>Șofer</dt>
            <dd>
              <span className="avatar" aria-hidden="true">{initiale(tir.driver)}</span>
              {tir.driver}
            </dd>
          </div>
          <div>
            <dt>Destinație</dt>
            <dd>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {tir.destination}
            </dd>
          </div>
        </dl>

        <div className={styles.tags}>
          <span className={`badge badge-${tir.trailerType}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={ICONITE_REMORCA[tir.trailerType]} />
            </svg>
            {ETICHETE_REMORCA[tir.trailerType]}
          </span>
          <span className="tag">{tir.category}</span>
        </div>
      </div>

      <div className={styles.actions}>
        {/* checkbox controlat, cu textul în același label: clic pe text = bifare */}
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={tir.arrived}
            onChange={() => onToggle(tir.id)}
            data-testid="item-toggle"
            aria-label={`${numar}: sosit la destinație`}
          />
          <span>Sosit la destinație</span>
        </label>
        <button
          className="btn-danger"
          onClick={() => onDelete(tir.id)}
          aria-label={`Șterge ${numar}`}
          data-testid="item-delete"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
          </svg>
          Șterge
        </button>
      </div>
    </li>
  );
}
