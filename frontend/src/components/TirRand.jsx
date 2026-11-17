// Un tir în vederea „tabel”: un rând dens, ca pe un panou de plecări.
// Aceleași date, aceleași acțiuni și aceleași data-testid ca TirCard.
import { Link } from "react-router-dom";
import RutaProgres from "./RutaProgres.jsx";
import { ETICHETE_REMORCA, ICONITE_REMORCA } from "../constants.js";
import { initiale, numarSiModel, nuanta } from "../format.js";
import { rezumatTraseu } from "../traseu.js";
import styles from "./TirRand.module.css";

export default function TirRand({ tir, pozitie, onToggle, onDelete, onSelect }) {
  const [numar, model] = numarSiModel(tir.name);

  return (
    <li
      className={tir.arrived ? `${styles.row} ${styles.done}` : styles.row}
      style={{ "--i": pozitie, "--hue": nuanta(tir.id) }}
      data-testid="item"
      data-id={tir.id}
      onClick={(e) => {
        if (!e.target.closest("a, button, label")) onSelect(tir.id);
      }}
    >
      <div className={styles.truck}>
        <span className="plate">
          <span className="plate-eu">RO</span>
          {numar}
        </span>
        <Link to={`/tiruri/${tir.id}`} className={styles.link} data-testid="item-link">
          {model ? (
            <>
              <span className="visually-hidden">{numar} · </span>
              {model}
            </>
          ) : (
            tir.name
          )}
        </Link>
      </div>

      <div className={styles.driver}>
        <span className="avatar" aria-hidden="true">{initiale(tir.driver)}</span>
        <span>{tir.driver}</span>
      </div>

      <RutaProgres tir={tir} rezumat={rezumatTraseu(tir)} compact />

      <div className={styles.trailer}>
        <span className={`badge badge-${tir.trailerType}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={ICONITE_REMORCA[tir.trailerType]} />
          </svg>
          {ETICHETE_REMORCA[tir.trailerType]}
        </span>
        <span className="tag">{tir.category}</span>
      </div>

      <label className={`switch ${styles.toggle}`}>
        <input
          type="checkbox"
          checked={tir.arrived}
          onChange={() => onToggle(tir.id)}
          data-testid="item-toggle"
          aria-label={`${numar}: sosit la destinație`}
        />
        <span className={styles.toggleText}>Sosit</span>
      </label>

      <div className={styles.actions}>
        <button className={styles.icon} onClick={() => onSelect(tir.id)} aria-label={`Vezi traseul pentru ${numar} pe hartă`} title="Hartă">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" />
          </svg>
        </button>
        <button
          className={`${styles.icon} ${styles.delete}`}
          onClick={() => onDelete(tir.id)}
          aria-label={`Șterge ${numar}`}
          title="Șterge"
          data-testid="item-delete"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
          </svg>
        </button>
      </div>
    </li>
  );
}
