// Un singur tir din listă, primit prin props, împreună cu funcțiile din App.

// Valoarea din date -> textul afișat pe ecran
const ETICHETE_REMORCA = {
  refrigerated: "Frigorifică",
  curtainsider: "Prelată",
  tanker: "Cisternă",
};

// Iconița din badge, pentru fiecare tip de remorcă
const ICONITE_REMORCA = {
  refrigerated: "M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1L19.1 4.9",
  curtainsider: "M3 5h18M3 12h18M3 19h18",
  tanker: "M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z",
};

// Fotografia de pe card, după tipul remorcii (din frontend/public/photos, sursa: Unsplash)
const FOTO_REMORCA = {
  refrigerated: "/photos/truck-refrigerated.jpg",
  curtainsider: "/photos/truck-curtainsider.jpg",
  tanker: "/photos/truck-tanker.jpg",
};

// "Ion Popescu" -> "IP", pentru avatarul șoferului
function initiale(nume) {
  return nume
    .split(" ")
    .map((parte) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TirCard({ tir, pozitie, onToggle, onDelete }) {
  // "B 101 FLT · Volvo FH16" -> numărul pe plăcuță, modelul în titlu
  const [numar, model] = tir.name.split(" · ");

  return (
    <li
      className={tir.arrived ? "item-card done" : "item-card"}
      style={{ "--i": pozitie, "--hue": (tir.id * 67 + 20) % 360 }}
    >
      <div className="card-photo">
        <img
          src={FOTO_REMORCA[tir.trailerType]}
          alt={`Camion cu remorcă ${ETICHETE_REMORCA[tir.trailerType].toLowerCase()}`}
          loading="lazy"
        />
        <span className="status">
          <span className="dot" aria-hidden="true"></span>
          {tir.arrived ? "Sosit" : "În tranzit"}
        </span>
        <span className="plate">
          <span className="plate-eu">RO</span>
          {numar}
        </span>
      </div>

      <div className="item-body">
        <h3>{model}</h3>

        <dl className="item-meta">
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

      <div className="item-actions">
        {/* checkbox controlat, cu textul în același label: clic pe text = bifare */}
        <label className="item-main">
          <input
            type="checkbox"
            checked={tir.arrived}
            onChange={() => onToggle(tir.id)}
            aria-label={`${numar}: sosit la destinație`}
          />
          <span>Sosit la destinație</span>
        </label>
        <button
          className="btn-danger"
          onClick={() => onDelete(tir.id)}
          aria-label={`Șterge ${numar}`}
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
