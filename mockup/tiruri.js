// FleetTrack · Etapa 2: logica pe date (fără DOM)

// Datele de test din README, fiecare cu id unic
const tiruri = [
  { id: 1, name: "B 101 FLT · Volvo FH16", arrived: false, trailerType: "refrigerated", category: "EU", driver: "Ion Popescu", destination: "Berlin" },
  { id: 2, name: "B 202 FLT · Scania R450", arrived: true, trailerType: "curtainsider", category: "Domestic", driver: "Maria Ionescu", destination: "Cluj-Napoca" },
  { id: 3, name: "CJ 303 FLT · DAF XF", arrived: false, trailerType: "tanker", category: "Non-EU", driver: "Andrei Georgescu", destination: "Istanbul" },
];

// Valorile permise
const TIPURI_REMORCA = ["refrigerated", "curtainsider", "tanker"];
const CATEGORII = ["Domestic", "EU", "Non-EU"];
const MAX_NUME = 100;
const MAX_TEXT = 60;

// Listarea numelor (număr + model)
function listeazaNume(lista) {
  return lista.map((t) => t.name);
}

// Numărul tirurilor aflate încă în tranzit (nesosite)
function numaraInTranzit(lista) {
  return lista.filter((t) => !t.arrived).length;
}

// Căutare după nume, șofer sau destinație, fără diferență între litere mari și mici
function cautaTir(lista, text) {
  const cautat = text.trim().toLowerCase();
  return lista.filter(
    (t) =>
      t.name.toLowerCase().includes(cautat) ||
      t.driver.toLowerCase().includes(cautat) ||
      t.destination.toLowerCase().includes(cautat)
  );
}

// Următorul id: cel mai mare id existent plus unu
function nextId(lista) {
  return lista.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

// Adăugare cu validare; întoarce o listă nouă sau lista neschimbată
function adaugaTir(lista, name, trailerType = "curtainsider", category = "Domestic", driver = "", destination = "") {
  const numeCurat = name.trim();
  const soferCurat = driver.trim();
  const destinatieCurata = destination.trim();

  if (numeCurat === "") {
    console.log("Eroare: numele tirului nu poate fi gol.");
    return lista;
  }
  if (numeCurat.length > MAX_NUME) {
    console.log(`Eroare: numele tirului depășește ${MAX_NUME} de caractere.`);
    return lista;
  }
  if (!TIPURI_REMORCA.includes(trailerType)) {
    console.log(`Eroare: tipul de remorcă „${trailerType}” nu există. Valori permise: ${TIPURI_REMORCA.join(", ")}.`);
    return lista;
  }
  if (!CATEGORII.includes(category)) {
    console.log(`Eroare: categoria „${category}” nu există. Valori permise: ${CATEGORII.join(", ")}.`);
    return lista;
  }
  if (soferCurat.length > MAX_TEXT || destinatieCurata.length > MAX_TEXT) {
    console.log(`Eroare: șoferul și destinația pot avea cel mult ${MAX_TEXT} de caractere.`);
    return lista;
  }

  const nou = {
    id: nextId(lista),
    name: numeCurat,
    arrived: false,
    trailerType,
    category,
    driver: soferCurat,
    destination: destinatieCurata,
  };
  return [...lista, nou];
}

// Comută starea: în tranzit <-> sosit
function comutaSosit(lista, id) {
  return lista.map((t) => (t.id === id ? { ...t, arrived: !t.arrived } : t));
}

// Ștergere după id
function stergeTir(lista, id) {
  return lista.filter((t) => t.id !== id);
}

// ---------- Teste în consolă ----------
console.log("--- Citire ---");
console.log("Tiruri:", listeazaNume(tiruri).join(", "));
console.log("În tranzit:", numaraInTranzit(tiruri));
console.log("Căutare 'volvo':", listeazaNume(cautaTir(tiruri, "volvo")).join(", "));
console.log("Căutare 'cluj':", listeazaNume(cautaTir(tiruri, "cluj")).join(", "));

console.log("--- Adăugare ---");
let lista = adaugaTir(tiruri, "B 404 FLT · MAN TGX", "refrigerated", "EU", "Elena Dumitru", "Viena");
console.log("Lista nouă:", lista.length, "tiruri");
console.log("Originalul a rămas cu:", tiruri.length, "tiruri");

console.log("--- Modificare și ștergere ---");
lista = comutaSosit(lista, 1);
console.log("După sosirea id 1, în tranzit:", numaraInTranzit(lista));
lista = stergeTir(lista, 3);
console.log("După ștergerea id 3:", listeazaNume(lista).join(", "));
console.log("Id-ul următorului tir:", nextId(lista));

console.log("--- Validare ---");
adaugaTir(lista, "   ");
adaugaTir(lista, "B 505 FLT · Iveco S-Way", "basculantă");
