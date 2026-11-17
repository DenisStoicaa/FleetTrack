// Calculele de traseu, comune hărții (TirTraseu), cardului, rândului din tabel și filtrelor.
// Datele de traseu sunt de test, din data/harta.js (nu vin dintr-un GPS real).
import { ORASE, TRASEE } from "./data/harta.js";

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

// Ce afișează cardul despre traseu: de unde pleacă, cât a parcurs, cât mai are.
// null pentru un tir fără traseu (de exemplu unul adăugat din formular).
export function rezumatTraseu(tir) {
  const traseu = TRASEE[tir.id];
  if (!traseu) return null;
  const progres = tir.arrived ? 1 : traseu.progres;
  const { total, parcurs } = calculeazaTraseu(traseu.opriri, progres);
  const ramas = total - parcurs;
  return {
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
