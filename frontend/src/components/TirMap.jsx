// Fereastra cu harta unui tir: poziția curentă și traseul până la destinație.
// Harta e o schiță SVG (mockup), desenată din datele de test din data/harta.js.
import { useEffect, useRef, useState } from "react";
import { ORASE, TRASEE, MARI } from "../data/harta.js";

const FACTOR_DRUM = 1.2;  // drumul real e cu ~20% mai lung decât linia dreaptă
const VITEZA_MEDIE = 70;  // km/h, cu tot cu pauze

// Distanța în linie dreaptă între două puncte [lat, lon], în km
function distantaKm([lat1, lon1], [lat2, lon2]) {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// [lat, lon] -> [x, y] pe hartă (1° latitudine = 100 de unități)
function proiectie([lat, lon]) {
  return [lon * 69, (56 - lat) * 100];
}

// Curbă netedă prin toate punctele: câte o curbă Bézier pentru fiecare tronson
function tronsoaneCurbe(p) {
  return p.slice(0, -1).map((p1, i) => {
    const p0 = p[i - 1] ?? p1;
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    return [p1, c1, c2, p2];
  });
}

// Prima parte a unei curbe Bézier, tăiată la t (algoritmul de Casteljau)
function taieCurba([a, b, c, d], t) {
  const mij = (p, q) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const ab = mij(a, b), bc = mij(b, c), cd = mij(c, d);
  const abc = mij(ab, bc), bcd = mij(bc, cd);
  return [a, ab, abc, mij(abc, bcd)];
}

function caleSvg(curbe) {
  if (curbe.length === 0) return "";
  const pt = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  return `M${pt(curbe[0][0])}` + curbe.map(([, c1, c2, p]) => ` C${pt(c1)} ${pt(c2)} ${pt(p)}`).join("");
}

// Pe ce tronson se află tirul și cât din el a parcurs
function calculeazaTraseu(opriri, progres) {
  const coordonate = opriri.map((o) => ORASE[o]);
  const tronsoane = coordonate.slice(1).map((p, i) => distantaKm(coordonate[i], p) * FACTOR_DRUM);
  const total = tronsoane.reduce((s, km) => s + km, 0);
  const parcurs = total * progres;

  let index = 0;
  let rest = parcurs;
  while (index < tronsoane.length - 1 && rest > tronsoane[index]) {
    rest -= tronsoane[index];
    index++;
  }
  const t = Math.min(rest / tronsoane[index], 1);
  return { coordonate, total, parcurs, index, t };
}

// Cadrul hărții: tot traseul, cu margine, în formatul cerut (lățime / înălțime)
function cadru(puncte, format) {
  const xs = puncte.map((p) => p[0]);
  const ys = puncte.map((p) => p[1]);
  let x = Math.min(...xs), y = Math.min(...ys);
  let w = Math.max(...xs) - x, h = Math.max(...ys) - y;
  const margine = Math.max(w, h) * 0.16 + 40;
  x -= margine; y -= margine; w += 2 * margine; h += 2 * margine;
  if (w / h < format) { x -= (h * format - w) / 2; w = h * format; }
  else { y -= (w / format - h) / 2; h = w / format; }
  return { x, y, w, h };
}

function formatOre(ore) {
  const h = Math.floor(ore);
  const min = Math.round((ore - h) * 60);
  return h > 0 ? `${h} h ${min} min` : `${min} min`;
}

const formatKm = (km) => `${Math.round(km).toLocaleString("ro-RO")} km`;

const formatSosire = new Intl.DateTimeFormat("ro-RO", {
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export default function TirMap({ tir, onClose }) {
  const dialogRef = useRef(null);
  const [acum] = useState(() => Date.now());

  // <dialog> deschis ca modal: focus în fereastră, Escape o închide
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  const inchide = () => dialogRef.current.close();

  const [numar, model] = tir.name.split(" · ");
  const traseu = TRASEE[tir.id];

  return (
    <dialog
      ref={dialogRef}
      className="map-dialog"
      aria-labelledby="map-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && inchide()}
    >
      <div className="map-inner">
        <header className="map-head">
          <div>
            <p className="map-kicker">
              <span className="plate">
                <span className="plate-eu">RO</span>
                {numar}
              </span>
              <span className={tir.arrived ? "map-status done" : "map-status"}>
                <span className="dot" aria-hidden="true"></span>
                {tir.arrived ? "Sosit" : "În tranzit"}
              </span>
            </p>
            <h2 id="map-title">{model}</h2>
            <p className="map-sub">
              {tir.driver} · {traseu ? `${traseu.opriri[0]} → ${tir.destination}` : tir.destination}
            </p>
          </div>
          <button className="map-close" onClick={inchide} aria-label="Închide harta">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>

        {traseu ? (
          <Harta tir={tir} traseu={traseu} acum={acum} />
        ) : (
          <p className="map-empty">Pentru acest tir nu există încă un traseu.</p>
        )}
      </div>
    </dialog>
  );
}

function Harta({ tir, traseu, acum }) {
  const { opriri } = traseu;
  // un tir bifat ca sosit stă la destinație, indiferent de progresul din date
  const progres = tir.arrived ? 1 : traseu.progres;
  const { coordonate, total, parcurs, index, t } = calculeazaTraseu(opriri, progres);
  const ramas = total - parcurs;
  const oreRamase = ramas / VITEZA_MEDIE;

  const puncte = coordonate.map(proiectie);
  const curbe = tronsoaneCurbe(puncte);
  const parcurse = [...curbe.slice(0, index), taieCurba(curbe[index], t)];
  const pozitie = parcurse.at(-1)[3];

  // pe ecran lat harta e mai joasă, ca fereastra să încapă fără derulare
  const mobil = window.matchMedia("(max-width: 700px)").matches;
  const format = mobil ? 1.3 : 1.9;
  const vb = cadru(puncte, format);
  // unitate de desen: 1% din lățimea hărții (dublă pe telefon, ca textul să rămână lizibil)
  const u = (vb.w / 100) * (mobil ? 2 : 1);
  const inCadru = ([x, y]) => x > vb.x && x < vb.x + vb.w && y > vb.y && y < vb.y + vb.h;

  // ultima oprire atinsă și cea care urmează
  const atinse = t >= 1 ? index + 1 : index;
  const urmatoarea = opriri[atinse + 1];

  let locatie;
  if (progres >= 1) locatie = `La destinație, ${opriri.at(-1)}`;
  else if (progres <= 0) locatie = `La plecare, ${opriri[0]}`;
  else locatie = `Între ${opriri[index]} și ${opriri[index + 1]}`;

  // orașele din jur, doar ca repere: sar peste cele prea apropiate de altele,
  // ca etichetele să nu se suprapună
  const departe = (a, b) => Math.abs(a[0] - b[0]) > 12 * u || Math.abs(a[1] - b[1]) > 3 * u;
  const repere = [];
  for (const [nume, c] of Object.entries(ORASE)) {
    const p = proiectie(c);
    if (opriri.includes(nume) || !inCadru(p)) continue;
    if ([...puncte, ...repere.map((r) => r[1])].every((q) => departe(p, q))) repere.push([nume, p]);
  }

  // grila de meridiane și paralele, din 2 în 2 grade
  const meridiane = [];
  for (let lon = 0; lon <= 50; lon += 2) meridiane.push(lon * 69);
  const paralele = [];
  for (let lat = 30; lat <= 60; lat += 2) paralele.push((56 - lat) * 100);

  const eticheta = (text, x, y, clasa) => (
    <text x={x} y={y} className={clasa} fontSize={1.55 * u}>{text}</text>
  );
  const scara = (100 / 111) * 100;  // 100 km pe hartă (1° latitudine ≈ 111 km = 100 de unități)
  const numar = tir.name.split(" · ")[0];
  const latimeEticheta = numar.length * 0.62 * 1.4 * u + 2.4 * u;
  const inaltimeEticheta = 2.6 * u;

  // eticheta tirului: deasupra punctului, sau dedesubt / în lateral dacă acolo e numele unui oraș
  const zona = (nume, [x, y], dy) => ({
    x1: x - 1 * u, x2: x + 1.3 * u + nume.length * 0.56 * 1.55 * u,
    y1: y + dy - 1.8 * u, y2: y + Math.max(dy, 0) + 1 * u,
  });
  const seSuprapun = (a, b) => !(a.x2 < b.x1 || a.x1 > b.x2 || a.y2 < b.y1 || a.y1 > b.y2);

  // numele opririlor: capetele mereu, cele intermediare doar dacă au loc (pe telefon nu încap toate)
  const zoneOrase = repere.map(([nume, p]) => zona(nume, p, 0.5 * u));
  const etichetaVizibila = new Set();
  const ordine = [0, puncte.length - 1, ...puncte.map((_, i) => i).slice(1, -1)];
  for (const i of ordine) {
    const z = zona(opriri[i], puncte[i], -0.9 * u);
    const capat = i === 0 || i === puncte.length - 1;
    if (capat || zoneOrase.every((alta) => !seSuprapun(z, alta))) {
      etichetaVizibila.add(i);
      zoneOrase.push(z);
    }
  }
  const variante = [
    [-latimeEticheta / 2, -5.6 * u],
    [-latimeEticheta / 2, 3 * u],
    [3 * u, -inaltimeEticheta / 2],
    [-3 * u - latimeEticheta, -inaltimeEticheta / 2],
  ];
  const libera = ([dx, dy]) => {
    const x1 = pozitie[0] + dx, y1 = pozitie[1] + dy;
    const x2 = x1 + latimeEticheta, y2 = y1 + inaltimeEticheta;
    return zoneOrase.every((z) => !seSuprapun({ x1, x2, y1, y2 }, z));
  };
  const [tagX, tagY] = variante.find(libera) ?? variante[0];

  return (
    <>
      <div className={tir.arrived ? "map-canvas done" : "map-canvas"} style={{ "--map-ratio": format }}>
        <span className="map-badge">Hartă demonstrativă · poziție simulată</span>
        <svg
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          className="map-svg"
          role="img"
          aria-label={`Traseul tirului ${tir.name}: ${opriri.join(", ")}. Poziția curentă: ${locatie}.`}
        >
          <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} className="map-land" />

          {MARI.map((mare) => (
            <polygon
              key={mare.nume}
              className="map-sea"
              points={mare.contur.map((c) => proiectie(c).join(",")).join(" ")}
            />
          ))}
          {MARI.filter((m) => m.eticheta && inCadru(proiectie(m.eticheta))).map((m) => {
            const [x, y] = proiectie(m.eticheta);
            return <text key={m.nume} x={x} y={y} className="map-sea-label" fontSize={1.6 * u}>{m.nume}</text>;
          })}

          {meridiane.map((x) => (
            <line key={`m${x}`} x1={x} x2={x} y1={vb.y} y2={vb.y + vb.h} className="map-grid" />
          ))}
          {paralele.map((y) => (
            <line key={`p${y}`} y1={y} y2={y} x1={vb.x} x2={vb.x + vb.w} className="map-grid" />
          ))}

          {repere.map(([nume, [x, y]]) => (
            <g key={nume}>
              <circle cx={x} cy={y} r={0.45 * u} className="map-town" />
              {eticheta(nume, x + 1 * u, y + 0.5 * u, "map-town-label")}
            </g>
          ))}

          {/* tot drumul (rămas = punctat), apoi porțiunea parcursă peste el */}
          <path d={caleSvg(curbe)} className="map-road-casing" />
          <path d={caleSvg(curbe)} className="map-road" />
          <path d={caleSvg(parcurse)} className="map-road-done" />

          {puncte.map(([x, y], i) => {
            const capat = i === 0 || i === puncte.length - 1;
            return (
              <g key={opriri[i]}>
                <circle
                  cx={x}
                  cy={y}
                  r={(capat ? 0.95 : 0.65) * u}
                  className={i <= atinse ? "map-stop passed" : "map-stop"}
                />
                {etichetaVizibila.has(i) &&
                  eticheta(opriri[i], x + 1.3 * u, y - 0.9 * u, capat ? "map-stop-label end" : "map-stop-label")}
              </g>
            );
          })}

          {/* acul de la destinație */}
          {!tir.arrived && (
            <svg
              x={puncte.at(-1)[0] - 2 * u}
              y={puncte.at(-1)[1] - 4 * u}
              width={4 * u}
              height={4 * u}
              viewBox="0 0 24 24"
              className="map-pin"
            >
              <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" />
              <circle cx="12" cy="10" r="2.6" />
            </svg>
          )}

          {/* tirul: punct care pulsează + eticheta cu numărul */}
          <g transform={`translate(${pozitie[0]} ${pozitie[1]})`} className="map-truck">
            <circle r={2.6 * u} className="map-truck-pulse" />
            <circle r={1.7 * u} className="map-truck-dot" />
            <svg x={-1.1 * u} y={-1.1 * u} width={2.2 * u} height={2.2 * u} viewBox="0 0 24 24" className="map-truck-icon">
              <path d="M2 6h12v10H2z" /><path d="M14 9h4l4 4v3h-8z" /><circle cx="6.5" cy="17.5" r="2" /><circle cx="17.5" cy="17.5" r="2" />
            </svg>
            <g transform={`translate(${tagX} ${tagY})`}>
              <rect width={latimeEticheta} height={inaltimeEticheta} rx={0.6 * u} className="map-truck-tag" />
              <text x={latimeEticheta / 2} y={1.85 * u} fontSize={1.4 * u} className="map-truck-tag-text">
                {numar}
              </text>
            </g>
          </g>

          {/* scara: 100 km */}
          <g transform={`translate(${vb.x + 3 * u} ${vb.y + vb.h - 3 * u})`} className="map-scale">
            <path d={`M0 ${-0.8 * u} V0 H${scara} V${-0.8 * u}`} />
            <text x={scara / 2} y={-1.4 * u} fontSize={1.4 * u}>100 km</text>
          </g>
        </svg>
      </div>

      <dl className="map-stats">
        <div className="map-stat map-stat-wide">
          <dt>Poziție curentă</dt>
          <dd>{locatie}</dd>
        </div>
        <div className="map-stat">
          <dt>Parcurs</dt>
          <dd>
            {formatKm(parcurs)} <span>din {formatKm(total)}</span>
          </dd>
          <div className="map-progress" aria-hidden="true">
            <span style={{ width: `${progres * 100}%` }}></span>
          </div>
        </div>
        <div className="map-stat">
          <dt>Rămas</dt>
          <dd>
            {progres >= 1 ? "—" : <>{formatKm(ramas)} <span>~ {formatOre(oreRamase)}</span></>}
          </dd>
        </div>
        <div className="map-stat">
          <dt>{progres >= 1 ? "Status" : "Sosire estimată"}</dt>
          <dd>{progres >= 1 ? "Livrat" : formatSosire.format(acum + oreRamase * 3600 * 1000)}</dd>
        </div>
      </dl>

      <div className="map-route">
        <h3>Traseu</h3>
        <ol className="map-steps">
          {opriri.map((oras, i) => {
            let stare = "";
            if (i <= atinse) stare = "passed";
            if (oras === urmatoarea && progres < 1) stare = "next";
            return (
              <li key={oras} className={stare}>
                <span className="step-dot" aria-hidden="true"></span>
                {oras}
                {stare === "next" && <span className="visually-hidden"> (următoarea oprire)</span>}
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}

