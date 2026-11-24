// Harta flotei, live: toate tirurile vizibile (după filtre) pe aceeași hartă, fiecare pe traseul lui,
// în poziția din simulare. Un clic pe un tir deschide harta lui (TirMap).
// Datele de traseu sunt de test (data/harta.js), iar mișcarea e simulată (simulare.js).
import { ORASE, MARI } from "../data/harta.js";
import { cadru, caleSvg, proiectie, taieCurba, tronsoaneCurbe } from "../harta-svg.js";
import { calculeazaTraseu, formatKm, formatOre, traseuPentru, VITEZA_MEDIE } from "../traseu.js";
import { progresSimulat, useSimulare } from "../simulare.js";
import { numarSiModel } from "../format.js";
import SimulareControl from "./SimulareControl.jsx";
import styles from "./HartaFlotei.module.css";

// Culoarea fiecărui tir în mișcare (verdele rămâne pentru tirurile oprite la destinație)
const CULORI = ["#ff6b1a", "#2f6fe0", "#9b4be0", "#d63a8a", "#0a9bb5", "#c98a00"];
const culoare = (id) => CULORI[(Number(id) - 1 + CULORI.length) % CULORI.length] ?? CULORI[0];

// dreptunghiul ocupat de un text pe hartă și testul de suprapunere
const cutie = (x, y, latime, inaltime) => ({ x1: x, y1: y, x2: x + latime, y2: y + inaltime });
const seSuprapun = (a, b) => !(a.x2 < b.x1 || a.x1 > b.x2 || a.y2 < b.y1 || a.y1 > b.y2);

export default function HartaFlotei({ tiruri, onSelect }) {
  const { simMs, porniri } = useSimulare();

  // doar tirurile care au un traseu pe hartă
  const curse = tiruri
    .map((tir) => {
      const traseu = traseuPentru(tir);
      if (!traseu) return null;
      const progres = progresSimulat(tir, simMs, porniri);
      const { coordonate, total, parcurs, index, t } = calculeazaTraseu(traseu.opriri, progres);
      const puncte = coordonate.map(proiectie);
      const curbe = tronsoaneCurbe(puncte);
      const parcurse = [...curbe.slice(0, index), taieCurba(curbe[index], t)];
      return {
        tir,
        opriri: traseu.opriri,
        progres,
        ramas: total - parcurs,
        puncte,
        curbe,
        parcurse,
        pozitie: parcurse.at(-1)[3],
        laDestinatie: !tir.arrived && progres >= 1,
      };
    })
    .filter(Boolean);

  const inMiscare = curse.filter((c) => !c.tir.arrived && !c.laDestinatie).length;

  return (
    <section className={`panel ${styles.panel}`} aria-labelledby="harta-flotei-titlu">
      <div className="panel-head">
        <div>
          <h2 id="harta-flotei-titlu">Harta flotei</h2>
          <p className="panel-hint">
            Cursele simulate în timp real: {inMiscare} {inMiscare === 1 ? "tir în mișcare" : "tiruri în mișcare"}.
            Apasă pe un tir pentru traseul lui.
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <SimulareControl />
      </div>

      {curse.length === 0 ? (
        <p className={styles.empty}>Niciun tir vizibil nu are un traseu pe hartă.</p>
      ) : (
        <Harta curse={curse} onSelect={onSelect} />
      )}
    </section>
  );
}

function Harta({ curse, onSelect }) {
  const toate = curse.flatMap((c) => c.puncte);
  const mobil = window.matchMedia("(max-width: 700px)").matches;
  const format = mobil ? 1.15 : 1.6;
  const vb = cadru(toate, format);
  const u = (vb.w / 100) * (mobil ? 2 : 1);
  const inCadru = ([x, y]) => x > vb.x && x < vb.x + vb.w && y > vb.y && y < vb.y + vb.h;

  // capetele traseelor, fiecare oraș o singură dată: destinațiile întâi (au prioritate la etichetă)
  const capete = new Map();
  for (const c of curse) capete.set(c.opriri.at(-1), { p: c.puncte.at(-1), destinatie: true });
  for (const c of curse) if (!capete.has(c.opriri[0])) capete.set(c.opriri[0], { p: c.puncte[0], destinatie: false });

  // etichetele orașelor: la dreapta punctului, sau la stânga dacă acolo ar acoperi altă etichetă;
  // altfel, fără nume (doar punctul)
  const font = 1.45 * u;
  const ocupate = [...capete.values()].map(({ p: [x, y] }) => cutie(x - 0.8 * u, y - 0.8 * u, 1.6 * u, 1.6 * u));
  const etichete = new Map();
  for (const [nume, { p: [x, y] }] of capete) {
    const lat = nume.length * 0.56 * font;
    const variante = [
      [x + 1 * u, y - 0.6 * u],
      [x - 1 * u - lat, y - 0.6 * u],
      [x + 1 * u, y + 1.6 * u],
      [x - 1 * u - lat, y + 1.6 * u],
    ];
    const libera = variante.find(([tx, ty]) => {
      const c = cutie(tx, ty - font, lat, font * 1.1);
      return ocupate.every((o) => !seSuprapun(c, o));
    });
    if (libera) {
      etichete.set(nume, libera);
      ocupate.push(cutie(libera[0], libera[1] - font, lat, font * 1.1));
    }
  }

  // eticheta cu numărul fiecărui tir: prima poziție liberă din jurul punctului
  const tags = new Map();
  // (doar tirurile în cursă; cele sosite stau pe destinație, cu numele în titlu)
  for (const c of curse.filter((c) => !c.tir.arrived)) {
    const [numar] = numarSiModel(c.tir.name);
    const lat = numar.length * 0.62 * 1.3 * u + 2 * u;
    const inalt = 2.3 * u;
    const [x, y] = c.pozitie;
    const variante = [
      [1.6 * u, -3.4 * u],
      [1.6 * u, 1.1 * u],
      [-1.6 * u - lat, -3.4 * u],
      [-1.6 * u - lat, 1.1 * u],
    ];
    const libera =
      variante.find(([dx, dy]) => ocupate.every((o) => !seSuprapun(cutie(x + dx, y + dy, lat, inalt), o))) ?? variante[0];
    ocupate.push(cutie(x + libera[0], y + libera[1], lat, inalt));
    tags.set(c.tir.id, { dx: libera[0], dy: libera[1], lat });
  }

  const paralele = [];
  for (let lat = 30; lat <= 60; lat += 2) paralele.push((56 - lat) * 100);
  const meridiane = [];
  for (let lon = 0; lon <= 50; lon += 2) meridiane.push(lon * 69);

  return (
    <div className={styles.canvas}>
      <span className={styles.badge}>Hartă demonstrativă · poziții simulate</span>
      <svg
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        className={styles.svg}
        style={{ "--map-ratio": format }}
        role="group"
        aria-label="Harta flotei cu pozițiile simulate ale tirurilor"
      >
        <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} className={styles.land} />
        {MARI.map((mare) => (
          <polygon
            key={mare.nume}
            className={styles.sea}
            points={mare.contur.map((c) => proiectie(c).join(",")).join(" ")}
          />
        ))}
        {MARI.filter((m) => m.eticheta && inCadru(proiectie(m.eticheta))).map((m) => {
          const [x, y] = proiectie(m.eticheta);
          return <text key={m.nume} x={x} y={y} className={styles.seaLabel} fontSize={1.5 * u}>{m.nume}</text>;
        })}
        {meridiane.map((x) => (
          <line key={`m${x}`} x1={x} x2={x} y1={vb.y} y2={vb.y + vb.h} className={styles.gridLine} />
        ))}
        {paralele.map((y) => (
          <line key={`p${y}`} y1={y} y2={y} x1={vb.x} x2={vb.x + vb.w} className={styles.gridLine} />
        ))}

        {/* orașele din jur, ca repere discrete */}
        {Object.entries(ORASE)
          .filter(([nume, c]) => !capete.has(nume) && inCadru(proiectie(c)))
          .map(([nume, c]) => {
            const [x, y] = proiectie(c);
            return <circle key={nume} cx={x} cy={y} r={0.3 * u} className={styles.town} />;
          })}

        {/* traseele: întâi tot drumul (punctat), apoi porțiunile parcurse, în culoarea fiecărui tir */}
        {curse.map((c) => (
          <path key={`r${c.tir.id}`} d={caleSvg(c.curbe)} className={styles.road} />
        ))}
        {curse.map((c) => (
          <path
            key={`d${c.tir.id}`}
            d={caleSvg(c.parcurse)}
            className={c.tir.arrived ? `${styles.roadDone} ${styles.arrived}` : styles.roadDone}
            style={{ "--c": culoare(c.tir.id) }}
          />
        ))}

        {[...capete].map(([nume, { p: [x, y], destinatie }]) => (
          <g key={nume}>
            <circle cx={x} cy={y} r={(destinatie ? 0.7 : 0.5) * u} className={styles.city} />
            {etichete.has(nume) && (
              <text
                x={etichete.get(nume)[0]}
                y={etichete.get(nume)[1]}
                fontSize={font}
                className={destinatie ? `${styles.cityLabel} ${styles.end}` : styles.cityLabel}
              >
                {nume}
              </text>
            )}
          </g>
        ))}

        {/* tirurile; cele în mișcare deasupra celor oprite */}
        {curse
          .toSorted((a, b) => Number(!a.tir.arrived) - Number(!b.tir.arrived))
          .map((c) => (
            <Tir key={c.tir.id} cursa={c} u={u} tag={tags.get(c.tir.id)} onSelect={onSelect} />
          ))}
      </svg>
    </div>
  );
}

function Tir({ cursa, u, tag, onSelect }) {
  const { tir, pozitie, progres, ramas, opriri, laDestinatie } = cursa;
  const [numar] = numarSiModel(tir.name);
  const oprit = tir.arrived || laDestinatie;

  const stare = tir.arrived
    ? `sosit la ${tir.destination}`
    : laDestinatie
      ? `la destinație, ${tir.destination}, de confirmat`
      : `${Math.round(progres * 100)}% din ${opriri[0]} – ${tir.destination}, mai are ${formatKm(ramas)} (~ ${formatOre(ramas / VITEZA_MEDIE)})`;

  const deschide = () => onSelect(tir.id);

  return (
    <g
      className={[styles.truck, oprit && styles.stopped, tir.arrived && styles.arrived].filter(Boolean).join(" ")}
      style={{ transform: `translate(${pozitie[0]}px, ${pozitie[1]}px)`, "--c": culoare(tir.id) }}
      role="button"
      tabIndex={0}
      aria-label={`${numar}: ${stare}. Deschide harta tirului.`}
      onClick={deschide}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          deschide();
        }
      }}
    >
      <title>{`${numar} · ${stare}`}</title>
      {!oprit && <circle r={2.2 * u} className={styles.pulse} />}
      <circle r={1.25 * u} className={styles.dot} />
      {tag && (
        <g transform={`translate(${tag.dx} ${tag.dy})`}>
          <rect width={tag.lat} height={2.3 * u} rx={0.5 * u} className={styles.tag} />
          <text x={tag.lat / 2} y={1.6 * u} fontSize={1.3 * u} className={styles.tagText}>{numar}</text>
        </g>
      )}
    </g>
  );
}
