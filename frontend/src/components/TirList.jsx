// Întreaga listă: câte un TirCard pentru fiecare element din array.
import TirCard from "./TirCard.jsx";

export default function TirList({ tiruri }) {
  // Lista goală: return timpuriu cu mesaj explicit
  if (tiruri.length === 0) {
    return <p className="empty">Nu există niciun tir în flotă.</p>;
  }

  // key = id-ul tirului, pus pe componenta întoarsă direct din map;
  // pozitie servește doar la întârzierea animației de intrare, ca în mockup
  return (
    <ul className="item-list">
      {tiruri.map((tir, pozitie) => (
        <TirCard key={tir.id} tir={tir} pozitie={pozitie} />
      ))}
    </ul>
  );
}
