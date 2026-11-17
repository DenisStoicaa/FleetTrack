// Linia traseului: plecare —— camion —— destinație, cu porțiunea parcursă colorată.
// Folosită în card și în rândul din tabel; datele vin din rezumatTraseu (traseu.js).
import styles from "./RutaProgres.module.css";

export default function RutaProgres({ tir, rezumat, compact = false }) {
  const clase = [styles.ruta, compact && styles.compact, tir.arrived && styles.done].filter(Boolean).join(" ");

  // tir fără traseu (adăugat din formular): doar destinația, fără progres
  if (!rezumat) {
    return (
      <div className={`${clase} ${styles.fara}`}>
        <div className={styles.ends}>
          <span>Traseu neplanificat</span>
          <strong>{tir.destination}</strong>
        </div>
        <div className={styles.track}></div>
      </div>
    );
  }

  const procent = Math.round(rezumat.progres * 100);
  return (
    <div className={clase} style={{ "--p": rezumat.progres }}>
      <div className={styles.ends}>
        <span>{rezumat.plecare}</span>
        <strong>{tir.destination}</strong>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={procent}
        aria-label={`Traseu ${rezumat.plecare} – ${tir.destination}: ${procent}% parcurs`}
      >
        <span className={styles.fill}></span>
        <span className={styles.truck} aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M2 6h12v10H2z" /><path d="M14 9h4l4 4v3h-8z" /><circle cx="6.5" cy="17.5" r="2" /><circle cx="17.5" cy="17.5" r="2" /></svg>
        </span>
      </div>
    </div>
  );
}
