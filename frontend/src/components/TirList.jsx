// Întreaga listă: câte un TirCard pentru fiecare element din array.
// Primește lista și funcțiile din pagină și le transmite fiecărui card, fără să le modifice.
import TirCard from "./TirCard.jsx";
import styles from "./TirList.module.css";

export default function TirList({ tiruri, onToggle, onDelete, onSelect }) {
  // Lista goală: return timpuriu cu mesaj explicit și o fotografie cu rampele goale
  if (tiruri.length === 0) {
    return (
      <div className={styles.empty}>
        <img src="/photos/empty-loading-docks.jpg" alt="" />
        <p data-testid="empty">Nu există niciun tir în flotă.</p>
      </div>
    );
  }

  // key = id-ul tirului, pus pe componenta întoarsă direct din map;
  // pozitie servește doar la întârzierea animației de intrare
  return (
    <ul className={styles.list}>
      {tiruri.map((tir, pozitie) => (
        <TirCard
          key={tir.id}
          tir={tir}
          pozitie={pozitie}
          onToggle={onToggle}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
