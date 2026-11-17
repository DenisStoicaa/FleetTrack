// Notificările scurte din colțul ecranului (adăugat, sosit, șters).
// Regiunea aria-live le citește și cu un cititor de ecran.
import styles from "./Toasts.module.css";

const ICONITE = {
  ok: "M5 12.5l4.5 4.5L19 7.5",
  info: "M12 8v5M12 16h.01",
  sters: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
};

export default function Toasts({ toasts }) {
  return (
    <div className={styles.stack} role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.tip] ?? ""}`}>
          <span className={styles.icon} aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d={ICONITE[t.tip] ?? ICONITE.info} /></svg>
          </span>
          {t.text}
        </div>
      ))}
    </div>
  );
}
