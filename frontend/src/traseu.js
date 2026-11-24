// Calculele de traseu, comune hărții (TirTraseu), cardului, rândului din tabel și filtrelor.
// Datele de traseu sunt de test, din data/harta.js (nu vin dintr-un GPS real).
import { DEPOU, ORASE, TRASEE } from "./data/harta.js";

export const FACTOR_DRUM = 1.2;  // drumul real e cu ~20% mai lung decât linia dreaptă
export const VITEZA_MEDIE = 70;  // km/h, cu tot cu pauze

// Distanța în linie dreaptă între două puncte [lat, lon], în km
export function distantaKm([lat1, lon1], [lat2, lon2]) {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// Pe ce tronson se află tirul și cât din el a parcurs
export function calculeazaTraseu(opriri, progres) {
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

// Lungimea întregului drum, în km
export function lungimeTraseu(opriri) {
  return calculeazaTraseu(opriri, 0).total;
}

// "Cluj Napoca" și "cluj-napoca" sunt același oraș
const cheieOras = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[\s-]+/g, " ").trim().toLowerCase();

// Traseul unui tir: cel din data/harta.js sau, pentru un tir fără traseu (adăugat din formular)
// cu o destinație cunoscută pe hartă, drumul direct din depou, pornit de la 0.
// null dacă destinația nu e pe hartă.
export function traseuPentru(tir) {
  if (TRASEE[tir.id]) return TRASEE[tir.id];
  const destinatie = Object.keys(ORASE).find((o) => cheieOras(o) === cheieOras(tir.destination ?? ""));
  if (!destinatie || destinatie === DEPOU) return null;
  return { opriri: [DEPOU, destinatie], progres: 0 };
}

// Ce afișează cardul despre traseu: de unde pleacă, cât a parcurs, cât mai are.
// progres vine din simulare (simulare.js); fără el, cel din datele de test.
// null pentru un tir fără traseu.
export function rezumatTraseu(tir, progresSimulat) {
  const traseu = traseuPentru(tir);
  if (!traseu) return null;
  const progres = tir.arrived ? 1 : progresSimulat ?? traseu.progres;
  const { total, parcurs } = calculeazaTraseu(traseu.opriri, progres);
  const ramas = total - parcurs;
  return {
    laDestinatie: !tir.arrived && progres >= 1,
    plecare: traseu.opriri[0],
    opriri: traseu.opriri.length,
    progres,
    total,
    ramas,
    oreRamase: ramas / VITEZA_MEDIE,
  };
}

export function formatOre(ore) {
  const h = Math.floor(ore);
  const min = Math.round((ore - h) * 60);
  return h > 0 ? `${h} h ${min} min` : `${min} min`;
}

export const formatKm = (km) => `${Math.round(km).toLocaleString("ro-RO")} km`;

export const formatSosire = new Intl.DateTimeFormat("ro-RO", {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
});
