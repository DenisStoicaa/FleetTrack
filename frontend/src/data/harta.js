// Date de test pentru harta (mockup): nu vin dintr-un GPS real.
// Coordonatele orașelor sunt [latitudine, longitudine].
export const ORASE = {
  "București": [44.43, 26.1],
  "Pitești": [44.86, 24.87],
  "Sibiu": [45.79, 24.15],
  "Deva": [45.88, 22.9],
  "Alba Iulia": [46.07, 23.58],
  "Cluj-Napoca": [46.77, 23.59],
  "Arad": [46.18, 21.31],
  "Timișoara": [45.75, 21.23],
  "Oradea": [47.05, 21.93],
  "Brașov": [45.66, 25.61],
  "Iași": [47.16, 27.59],
  "Constanța": [44.18, 28.63],
  "Craiova": [44.32, 23.8],
  "Budapesta": [47.5, 19.04],
  "Viena": [48.21, 16.37],
  "Bratislava": [48.15, 17.11],
  "Brno": [49.2, 16.61],
  "Praga": [50.08, 14.44],
  "Dresda": [51.05, 13.74],
  "Berlin": [52.52, 13.4],
  "Varșovia": [52.23, 21.01],
  "Cracovia": [50.06, 19.94],
  "Belgrad": [44.79, 20.45],
  "Sofia": [42.7, 23.32],
  "Ruse": [43.85, 25.97],
  "Veliko Tarnovo": [43.08, 25.63],
  "Stara Zagora": [42.43, 25.63],
  "Edirne": [41.68, 26.56],
  "Istanbul": [41.01, 28.98],
  "Varna": [43.21, 27.91],
  "Chișinău": [47.01, 28.86],
};

// Traseul fiecărui tir (după id): orașele prin care trece, în ordine,
// și cât din drum a parcurs deja (0 = la plecare, 1 = la destinație).
export const TRASEE = {
  1: {
    opriri: ["București", "Pitești", "Sibiu", "Deva", "Arad", "Budapesta", "Bratislava", "Brno", "Praga", "Dresda", "Berlin"],
    progres: 0.47,
  },
  2: {
    opriri: ["București", "Pitești", "Sibiu", "Alba Iulia", "Cluj-Napoca"],
    progres: 1,
  },
  3: {
    opriri: ["Cluj-Napoca", "Sibiu", "Brașov", "București", "Ruse", "Veliko Tarnovo", "Stara Zagora", "Edirne", "Istanbul"],
    progres: 0.62,
  },
};

// Contururi aproximative ale mărilor, doar ca fundal pentru schiță
export const MARI = [
  {
    nume: "Marea Neagră",
    eticheta: [43.3, 31.4],
    contur: [
      [45.4, 29.7], [44.9, 29.6], [44.18, 28.68], [43.4, 28.35], [43.2, 27.95], [42.5, 27.5],
      [42.0, 27.98], [41.6, 28.15], [41.22, 29.1], [41.1, 30.5], [41.2, 31.5], [41.1, 33],
      [42.0, 35], [41.6, 36], [41.3, 37.5], [41.0, 39.5], [41.6, 41.6], [42.6, 41.6], [43.5, 40],
      [44.6, 38], [45.1, 36.6], [44.4, 34], [44.6, 33.5], [45.3, 32.6], [46.0, 33],
      [46.6, 31.2], [46.5, 30.7], [45.9, 30.2],
    ],
  },
  {
    nume: "Marea Marmara",
    contur: [
      [41.0, 28.95], [40.97, 28.6], [41.06, 28.0], [40.95, 27.5], [40.6, 26.95], [40.35, 27.0],
      [40.35, 27.8], [40.4, 28.9], [40.72, 29.9], [40.85, 29.3],
    ],
  },
  {
    nume: "Marea Egee",
    contur: [
      [40.85, 26.0], [40.6, 26.8], [40.0, 26.2], [38.5, 26.4], [38.5, 22.9], [40.5, 22.6], [40.95, 24.4],
    ],
  },
  {
    nume: "Marea Adriatică",
    eticheta: [43.0, 15.6],
    contur: [
      [45.65, 13.77], [45.33, 14.44], [44.12, 15.23], [43.51, 16.44], [42.65, 18.09], [42.1, 19.1],
      [41.32, 19.45], [40.47, 19.49], [40.15, 18.49], [41.12, 16.87], [42.46, 14.21], [43.62, 13.52],
      [44.06, 12.57], [45.43, 12.33],
    ],
  },
];
