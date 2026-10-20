// Un singur tir din listă, primit prin props.

// Valoarea din date -> textul afișat pe ecran
const ETICHETE_REMORCA = {
  refrigerated: "Frigorifică",
  curtainsider: "Prelată",
  tanker: "Cisternă",
};

// Iconița din badge, aceeași ca în mockup, pentru fiecare tip de remorcă
const ICONITE_REMORCA = {
  refrigerated: "M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1L19.1 4.9",
  curtainsider: "M3 5h18M3 12h18M3 19h18",
  tanker: "M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z",
};

export default function TirCard({ tir, pozitie }) {
  // "B 101 FLT · Volvo FH16" -> numărul pe plăcuță, modelul în titlu
  const [numar, model] = tir.name.split(" · ");

  return (
    <li className={tir.arrived ? "item-card done" : "item-card"} style={{ "--i": pozitie }}>
      <div className="item-body">
        <div className="item-title">
          <span className="plate">
            <span className="plate-eu">RO</span>
            {numar}
          </span>
          <h3>{model}</h3>
        </div>
        <p className="item-meta">
          <span className="driver">{tir.driver}</span>
          <span className="route-line" aria-hidden="true"></span>
          <span className="dest">{tir.destination}</span>
        </p>
        <div className="tags">
          <span className={`badge badge-${tir.trailerType}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={ICONITE_REMORCA[tir.trailerType]} />
            </svg>
            {ETICHETE_REMORCA[tir.trailerType]}
          </span>
          <span className="tag">{tir.category}</span>
        </div>
      </div>
      <span className="status">
        <span className="dot" aria-hidden="true"></span>
        {tir.arrived ? "Sosit" : "În tranzit"}
      </span>
    </li>
  );
}
