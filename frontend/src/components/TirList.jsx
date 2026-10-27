// Întreaga listă: câte un TirCard pentru fiecare element din array.
// Primește lista și funcțiile din App și le transmite fiecărui card, fără să le modifice.
import TirCard from "./TirCard.jsx";

export default function TirList({ tiruri, onToggle, onDelete }) {
  // Lista goală: return timpuriu cu mesaj explicit și o fotografie cu rampele goale
  if (tiruri.length === 0) {
    return (
      <div className="empty">
        <img src="/photos/empty-loading-docks.jpg" alt="" />
        <p>Nu există niciun tir în flotă.</p>
      </div>
    );
  }

  // key = id-ul tirului, pus pe componenta întoarsă direct din map;
  // pozitie servește doar la întârzierea animației de intrare
  return (
    <ul className="item-list">
      {tiruri.map((tir, pozitie) => (
        <TirCard
          key={tir.id}
          tir={tir}
          pozitie={pozitie}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
