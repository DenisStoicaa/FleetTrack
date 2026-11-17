// Un număr care „se derulează” până la valoarea nouă, ca pe un panou de plecări.
// Cititoarele de ecran și cine a cerut mai puțină mișcare primesc direct valoarea finală.
import { useEffect, useRef, useState } from "react";

const DURATA = 700; // ms

export default function CountUp({ value }) {
  const [afisat, setAfisat] = useState(value);
  const deLa = useRef(value);

  useEffect(() => {
    const start = deLa.current;
    if (start === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      deLa.current = value;
      setAfisat(value);
      return;
    }
    const t0 = performance.now();
    let cadru;
    function pas(t) {
      const p = Math.min((t - t0) / DURATA, 1);
      const usor = 1 - (1 - p) ** 3; // încetinește spre final
      setAfisat(Math.round(start + (value - start) * usor));
      if (p < 1) cadru = requestAnimationFrame(pas);
      else deLa.current = value;
    }
    cadru = requestAnimationFrame(pas);
    return () => {
      cancelAnimationFrame(cadru);
      deLa.current = value;
    };
  }, [value]);

  return (
    <>
      <span aria-hidden="true">{afisat}</span>
      <span className="visually-hidden">{value}</span>
    </>
  );
}
