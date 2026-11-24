// Simularea curselor în timp real: un ceas comun pentru toată aplicația.
// Fiecare tir în tranzit înaintează pe traseul lui cu VITEZA_MEDIE, măsurată în timpul simulat.
// La viteza 1× timpul simulat curge ca cel real; la 60× o oră de drum durează un minut.
// Nimic nu se salvează pe server: la reîncărcare, tirurile pornesc din nou din datele de test,
// iar sosirea o confirmă dispecerul (bifa „Sosit”), ca până acum.
import { createContext, useContext, useEffect, useRef } from "react";
import { VITEZA_MEDIE, lungimeTraseu, traseuPentru } from "./traseu.js";

export const VITEZE = [
  { value: 0, label: "Pauză" },
  { value: 1, label: "1×", titlu: "Timp real" },
  { value: 60, label: "60×", titlu: "1 minut = 1 oră de drum" },
  { value: 600, label: "600×", titlu: "1 secundă = 10 minute de drum" },
];
export const VITEZA_IMPLICITA = 60;

const ORA = 3600 * 1000;

// Starea simulării: { simMs, porniri, ceas, viteza, setViteza, pleacaDinNou, abonare }
export const SimulareContext = createContext(null);

export function useSimulare() {
  const sim = useContext(SimulareContext);
  if (!sim) throw new Error("useSimulare se folosește doar în interiorul lui <SimulareProvider>");
  return sim;
}

// Cât din drum a parcurs tirul (0..1) la momentul simulat simMs.
// porniri[id] = { progres, laSimMs }: de unde a (re)pornit tirul; implicit, progresul din date la momentul 0.
// null pentru un tir fără traseu.
export function progresSimulat(tir, simMs, porniri) {
  if (tir.arrived) return 1;
  const traseu = traseuPentru(tir);
  if (!traseu) return null;
  const start = porniri[tir.id] ?? { progres: traseu.progres, laSimMs: 0 };
  const km = ((simMs - start.laSimMs) / ORA) * VITEZA_MEDIE;
  return Math.min(1, start.progres + km / lungimeTraseu(traseu.opriri));
}

// Progresul unui tir acum, din componentă
export function useProgres(tir) {
  const { simMs, porniri } = useSimulare();
  return progresSimulat(tir, simMs, porniri);
}

// Anunță o singură dată fiecare tir care ajunge la destinație în timpul simulării
// (și din nou, dacă a plecat iar în cursă). laSosire(tir) primește tirul.
export function useSosiriSimulate(tiruri, laSosire) {
  const { abonare } = useSimulare();
  const date = useRef({ tiruri, laSosire });
  const anuntate = useRef(null);

  useEffect(() => {
    date.current = { tiruri, laSosire };
  });

  useEffect(
    () =>
      abonare(({ simMs, porniri }) => {
        const { tiruri, laSosire } = date.current;
        const laDestinatie = new Set(
          tiruri.filter((t) => !t.arrived && progresSimulat(t, simMs, porniri) >= 1).map((t) => t.id)
        );
        // prima trecere: cine e deja la destinație la încărcare nu se anunță
        if (anuntate.current === null) {
          if (tiruri.length > 0) anuntate.current = laDestinatie;
          return;
        }
        for (const t of tiruri) {
          if (laDestinatie.has(t.id) && !anuntate.current.has(t.id)) laSosire(t);
        }
        anuntate.current = laDestinatie;
      }),
    [abonare]
  );
}
