// Ceasul simulării, pus în jurul întregii aplicații (main.jsx): lista, harta și pagina de detaliu
// văd același moment simulat. De 4 ori pe secundă timpul simulat avansează cu timpul real
// scurs înmulțit cu viteza aleasă; în pauză ceasul nu mai bate deloc.
// Starea (ceasul și repornirile tirurilor) se salvează în localStorage: după o reîncărcare
// simularea continuă de unde a rămas. Doar butonul „Resetează” o readuce la început.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SimulareContext, VITEZA_IMPLICITA, VITEZE } from "../simulare.js";

const PAS = 250; // ms între două actualizări
const CHEIE = "fleettrack-simulare";

// { start, simMs, porniri } salvat la ultima vizită, sau o simulare nouă
function stareInitiala() {
  const noua = { start: Date.now(), simMs: 0, porniri: {} };
  try {
    const salvata = JSON.parse(localStorage.getItem(CHEIE));
    if (
      salvata &&
      Number.isFinite(salvata.start) &&
      Number.isFinite(salvata.simMs) &&
      salvata.porniri &&
      typeof salvata.porniri === "object"
    ) {
      return salvata;
    }
  } catch {
    /* date lipsă sau stricate: simulare nouă */
  }
  return noua;
}

function vitezaInitiala() {
  try {
    const salvata = localStorage.getItem("fleettrack-viteza");
    return VITEZE.find((v) => String(v.value) === salvata)?.value ?? VITEZA_IMPLICITA;
  } catch {
    return VITEZA_IMPLICITA;
  }
}

export default function SimulareProvider({ children }) {
  const [initiala] = useState(stareInitiala);
  const [start, setStart] = useState(initiala.start);      // ora la pornirea simulării
  const [simMs, setSimMs] = useState(initiala.simMs);      // timp simulat scurs de la pornire
  const [viteza, setVitezaState] = useState(vitezaInitiala);
  const [porniri, setPorniri] = useState(initiala.porniri); // id -> { progres, laSimMs }

  // valorile curente, pentru intervalul și pentru abonați (fără să repornească intervalul)
  const curent = useRef({ simMs, porniri });
  const abonati = useRef(new Set());

  useEffect(() => {
    curent.current.porniri = porniri;
  }, [porniri]);

  // salvare după fiecare pas al ceasului și după fiecare repornire
  useEffect(() => {
    try {
      localStorage.setItem(CHEIE, JSON.stringify({ start, simMs, porniri }));
    } catch {
      /* fără localStorage, simularea ține doar până la reîncărcare */
    }
  }, [start, simMs, porniri]);

  useEffect(() => {
    if (viteza === 0) return;
    let ultim = performance.now();
    const id = setInterval(() => {
      const t = performance.now();
      const nou = curent.current.simMs + (t - ultim) * viteza;
      ultim = t;
      curent.current.simMs = nou;
      setSimMs(nou);
      abonati.current.forEach((f) => f(curent.current));
    }, PAS);
    return () => clearInterval(id);
  }, [viteza]);

  const setViteza = useCallback((v) => {
    setVitezaState(v);
    try {
      localStorage.setItem("fleettrack-viteza", String(v));
    } catch {
      /* fără localStorage, viteza ține până la reîncărcare */
    }
  }, []);

  // tirul pleacă într-o cursă nouă, de la începutul traseului (după ce i s-a scos bifa „Sosit”)
  const pleacaDinNou = useCallback((id) => {
    setPorniri((prev) => ({ ...prev, [id]: { progres: 0, laSimMs: curent.current.simMs } }));
  }, []);

  // toate tirurile înapoi la pozițiile de pornire din data/harta.js, ceasul la ora reală
  const reseteaza = useCallback(() => {
    curent.current.simMs = 0;
    setSimMs(0);
    setPorniri({});
    setStart(Date.now());
  }, []);

  // abonare(f): f(stare) la fiecare pas al ceasului; întoarce funcția de dezabonare
  const abonare = useCallback((f) => {
    abonati.current.add(f);
    return () => abonati.current.delete(f);
  }, []);

  const valoare = useMemo(
    () => ({ simMs, porniri, ceas: start + simMs, viteza, setViteza, pleacaDinNou, reseteaza, abonare }),
    [simMs, porniri, start, viteza, setViteza, pleacaDinNou, reseteaza, abonare]
  );

  return <SimulareContext.Provider value={valoare}>{children}</SimulareContext.Provider>;
}
