// Comenzile simulării: ceasul simulat, viteza (pauză, timp real, 60×, 600×)
// și resetarea curselor la pozițiile de pornire.
// Folosite deasupra hărții flotei și în harta unui tir.
import { VITEZE, useSimulare } from "../simulare.js";
import styles from "./SimulareControl.module.css";

const formatCeas = new Intl.DateTimeFormat("ro-RO", {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export default function SimulareControl({ compact = false }) {
  const { ceas, viteza, setViteza, reseteaza } = useSimulare();

  return (
    <div className={compact ? `${styles.bar} ${styles.compact}` : styles.bar}>
      <span className={viteza > 0 ? `${styles.live} ${styles.on}` : styles.live}>
        <span className={styles.liveDot} aria-hidden="true"></span>
        {viteza > 0 ? "Simulare" : "În pauză"}
      </span>
      <time className={styles.clock} dateTime={new Date(ceas).toISOString()} title="Ora simulată">
        {formatCeas.format(ceas)}
      </time>
      <div className={styles.speeds} role="group" aria-label="Viteza simulării">
        {VITEZE.map((v) => (
          <button
            key={v.value}
            type="button"
            aria-pressed={viteza === v.value}
            title={v.titlu}
            onClick={() => setViteza(v.value)}
          >
            {v.value === 0 ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>
            ) : null}
            <span className={v.value === 0 ? "visually-hidden" : undefined}>{v.label}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className={styles.reset}
        onClick={reseteaza}
        title="Readuce toate tirurile la pozițiile de pornire"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
        <span className={compact ? "visually-hidden" : undefined}>Resetează</span>
        {compact && <span className="visually-hidden"> simularea</span>}
      </button>
    </div>
  );
}
