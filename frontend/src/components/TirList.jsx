// Întreaga listă: un TirCard (vederea „carduri”) sau un TirRand (vederea „tabel”) pentru
// fiecare tir. Primește lista deja filtrată și funcțiile din pagină, fără să le modifice.
import TirCard from "./TirCard.jsx";
import TirRand from "./TirRand.jsx";
import styles from "./TirList.module.css";

export default function TirList({ tiruri, totalFlota, vedere, acum, onToggle, onDelete, onSelect, onReset }) {
  // Flota goală: return timpuriu cu mesaj explicit și o fotografie cu rampele goale
  if (totalFlota === 0) {
    return (
      <div className={styles.empty}>
        <img src="/photos/empty-loading-docks.jpg" alt="" />
        <div className={styles.emptyText}>
          <p className="eyebrow">Rampe libere</p>
          <p data-testid="empty">Nu există niciun tir în flotă.</p>
        </div>
      </div>
    );
  }

  // Flota are tiruri, dar niciunul nu trece de filtre
  if (tiruri.length === 0) {
    return (
      <div className={styles.noMatch}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5M8 11h6" /></svg>
        <p>Niciun tir nu se potrivește cu filtrele alese.</p>
        {onReset && (
          <button type="button" className="btn-ghost" onClick={onReset}>
            Arată toată flota
          </button>
        )}
      </div>
    );
  }

  const Element = vedere === "tabel" ? TirRand : TirCard;

  // key = id-ul tirului, pus pe componenta întoarsă direct din map;
  // pozitie servește doar la întârzierea animației de intrare
  return (
    <ul className={vedere === "tabel" ? styles.board : styles.list}>
      {vedere === "tabel" && (
        <li className={styles.boardHead} aria-hidden="true">
          <span>Tir</span>
          <span>Șofer</span>
          <span>Traseu</span>
          <span>Remorcă</span>
          <span>Sosit</span>
          <span></span>
        </li>
      )}
      {tiruri.map((tir, pozitie) => (
        <Element
          key={tir.id}
          tir={tir}
          pozitie={pozitie}
          acum={acum}
          onToggle={onToggle}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
