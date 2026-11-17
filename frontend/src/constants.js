// Valorile fixe din modelul de date (README) și etichetele lor, într-un singur loc.
// Le folosesc formularul, cardul, harta și pagina de detaliu.

export const REMORCI = [
  { value: "refrigerated", label: "Frigorifică" },
  { value: "curtainsider", label: "Prelată" },
  { value: "tanker", label: "Cisternă" },
];

export const CATEGORII = [
  { value: "Domestic", label: "Domestic (intern)" },
  { value: "EU", label: "EU" },
  { value: "Non-EU", label: "Non-EU" },
];

// { refrigerated: "Frigorifică", ... }: valoarea din date -> textul de pe ecran
export const ETICHETE_REMORCA = Object.fromEntries(REMORCI.map((r) => [r.value, r.label]));
export const ETICHETE_CATEGORIE = Object.fromEntries(CATEGORII.map((c) => [c.value, c.label]));

// Iconița din badge, pentru fiecare tip de remorcă (calea SVG)
export const ICONITE_REMORCA = {
  refrigerated: "M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1L19.1 4.9",
  curtainsider: "M3 5h18M3 12h18M3 19h18",
  tanker: "M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z",
};

// Fotografia după tipul remorcii (din frontend/public/photos, sursa: Unsplash)
export const FOTO_REMORCA = {
  refrigerated: "/photos/truck-refrigerated.jpg",
  curtainsider: "/photos/truck-curtainsider.jpg",
  tanker: "/photos/truck-tanker.jpg",
};
