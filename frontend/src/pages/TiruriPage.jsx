// Pagina principală (/): cifrele flotei (care sunt și filtre), bara de căutare și sortare,
// lista (carduri sau tabel), formularul de adăugare și notificările.
// Încărcarea și funcțiile care vorbesc cu serverul sunt cele din Etapa 7–8.
import { useEffect, useRef, useState } from "react";
import TirList from "../components/TirList.jsx";
import TirMap from "../components/TirMap.jsx";
import TirForm from "../components/TirForm.jsx";
import Toasts from "../components/Toasts.jsx";
import CountUp from "../components/CountUp.jsx";
import HartaFlotei from "../components/HartaFlotei.jsx";
import { createTir, deleteTir, fetchTiruri, updateTir } from "../api.js";
import { REMORCI, ICONITE_REMORCA } from "../constants.js";
import { numarSiModel } from "../format.js";
import { formatKm, rezumatTraseu } from "../traseu.js";
import { progresSimulat, useSimulare, useSosiriSimulate } from "../simulare.js";
import styles from "./TiruriPage.module.css";

const SORTARI = [
  { value: "implicit", label: "Ordinea adăugării" },
  { value: "numar", label: "Număr de înmatriculare" },
  { value: "destinatie", label: "Destinație (A–Z)" },
  { value: "progres", label: "Cel mai aproape de sosire" },
];

// vederea aleasă (carduri / tabel) rămâne și după reîncărcare
function vedereInitiala() {
  try {
    return localStorage.getItem("fleettrack-vedere") === "tabel" ? "tabel" : "carduri";
  } catch {
    return "carduri";
  }
}

export default function TiruriPage() {
  // Lista pornește goală: datele vin de la server (API-ul Express din backend/)
  const [tiruri, setTiruri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // tirul deschis pe hartă: doar id-ul, datele se iau mereu din listă
  const [selectatId, setSelectatId] = useState(null);

  // filtre și afișare: nu modifică datele, doar ce se vede
  const [stare, setStare] = useState("toate"); // toate | tranzit | sosite | intl
  const [remorca, setRemorca] = useState("toate");
  const [cautare, setCautare] = useState("");
  const [sortare, setSortare] = useState("implicit");
  const [vedere, setVedere] = useState(vedereInitiala);

  const [toasts, setToasts] = useState([]);

  // simularea curselor: progresul fiecărui tir la momentul simulat curent
  const { simMs, porniri, pleacaDinNou } = useSimulare();
  const progres = (t) => progresSimulat(t, simMs, porniri);

  const cautareRef = useRef(null);

  // Rulează o singură dată, după prima randare
  useEffect(() => {
    let ignore = false; // nu se setează state dacă pagina a dispărut între timp

    async function load() {
      try {
        const data = await fetchTiruri();
        if (!ignore) setTiruri(data);
      } catch (err) {
        if (!ignore) setError(`Nu am putut încărca flota: ${err.message}. Rulează npm run dev în backend/?`);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Scurtătura „/” duce la căutare (doar când nu se scrie deja într-un câmp)
  useEffect(() => {
    function onKey(e) {
      const tinta = e.target;
      const scrie = tinta.closest?.("input, select, textarea, [contenteditable]");
      if (scrie || e.ctrlKey || e.metaKey || e.altKey || document.querySelector("dialog[open]")) return;
      if (e.key === "/") {
        e.preventDefault();
        cautareRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function anunta(text, tip = "info") {
    const id = crypto.randomUUID?.() ?? String(Math.random());
    setToasts((prev) => [...prev.slice(-2), { id, text, tip }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3600);
  }

  // un tir ajuns la destinație în simulare: anunț, iar dispecerul confirmă cu bifa „Sosit”
  useSosiriSimulate(tiruri, (tir) =>
    anunta(`${numarSiModel(tir.name)[0]} a ajuns la ${tir.destination} · bifează „Sosit” pentru confirmare`, "ok")
  );

  function schimbaVedere(noua) {
    setVedere(noua);
    try {
      localStorage.setItem("fleettrack-vedere", noua);
    } catch {
      /* fără localStorage, alegerea ține până la reîncărcare */
    }
  }

  // Întâi serverul, apoi state-ul: pe ecran ajunge doar ce s-a salvat.
  // Fără try: eroarea ajunge înapoi în formular, care o afișează lângă câmpuri.
  async function handleAdd(tir) {
    const creat = await createTir(tir); // serverul întoarce tirul cu id
    setTiruri((prev) => [...prev, creat]);
    anunta(`${numarSiModel(creat.name)[0]} a fost adăugat în flotă`, "ok");
  }

  // PATCH trimite doar câmpul schimbat; în listă se pune obiectul întors de server
  async function handleToggleSosit(id) {
    const tir = tiruri.find((t) => t.id === id);
    try {
      const actualizat = await updateTir(id, { arrived: !tir.arrived });
      setTiruri((prev) => prev.map((t) => (t.id === id ? actualizat : t)));
      // scos din „sosit”: în simulare pleacă într-o cursă nouă, de la începutul traseului
      if (!actualizat.arrived) pleacaDinNou(id);
      setError(null);
      const numar = numarSiModel(actualizat.name)[0];
      anunta(actualizat.arrived ? `${numar} a ajuns la ${actualizat.destination}` : `${numar} este din nou în tranzit`, actualizat.arrived ? "ok" : "info");
    } catch (err) {
      setError(`Nu am putut actualiza tirul: ${err.message}`);
    }
  }

  async function handleDelete(id) {
    const tir = tiruri.find((t) => t.id === id);
    try {
      await deleteTir(id);
      setTiruri((prev) => prev.filter((t) => t.id !== id));
      if (selectatId === id) setSelectatId(null);
      setError(null);
      anunta(`${numarSiModel(tir.name)[0]} a fost șters din flotă`, "sters");
    } catch (err) {
      setError(`Nu am putut șterge tirul: ${err.message}`);
    }
  }

  function reseteazaFiltrele() {
    setStare("toate");
    setRemorca("toate");
    setCautare("");
  }

  // Valori derivate: se recalculează din listă la fiecare randare, nu stau în state
  const inTranzit = tiruri.filter((t) => !t.arrived).length;
  const sosite = tiruri.length - inTranzit;
  const internationale = tiruri.filter((t) => t.category !== "Domestic").length;
  const kmRamasi = tiruri.reduce((s, t) => s + (t.arrived ? 0 : rezumatTraseu(t, progres(t))?.ramas ?? 0), 0);
  const procentSosite = tiruri.length ? Math.round((sosite / tiruri.length) * 100) : 0;
  const selectat = tiruri.find((t) => t.id === selectatId);

  // căutare după număr, model, șofer sau destinație, fără diacritice și fără majuscule
  const simplu = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const cheie = simplu(cautare.trim());

  const vizibile = tiruri
    .filter((t) => {
      if (stare === "tranzit") return !t.arrived;
      if (stare === "sosite") return t.arrived;
      if (stare === "intl") return t.category !== "Domestic";
      return true;
    })
    .filter((t) => remorca === "toate" || t.trailerType === remorca)
    .filter((t) => !cheie || simplu(`${t.name} ${t.driver} ${t.destination}`).includes(cheie))
    .toSorted((a, b) => {
      if (sortare === "numar") return a.name.localeCompare(b.name, "ro");
      if (sortare === "destinatie") return a.destination.localeCompare(b.destination, "ro");
      // tirurile fără traseu la final
      if (sortare === "progres") return (progres(b) ?? -1) - (progres(a) ?? -1);
      return 0;
    });

  const filtreActive = stare !== "toate" || remorca !== "toate" || cheie !== "";

  const kpi = [
    { id: "toate", eticheta: "Total flotă", valoare: tiruri.length, sub: `${new Set(tiruri.map((t) => t.trailerType)).size} tipuri de remorci` },
    { id: "tranzit", eticheta: "În tranzit", valoare: inTranzit, sub: `${formatKm(kmRamasi)} de parcurs`, clasa: styles.kpiTransit },
    { id: "sosite", eticheta: "Sosite", valoare: sosite, sub: `${procentSosite}% din flotă`, clasa: styles.kpiDone },
    { id: "intl", eticheta: "Curse internaționale", valoare: internationale, sub: `${tiruri.filter((t) => t.category === "EU").length} UE · ${tiruri.filter((t) => t.category === "Non-EU").length} non-UE` },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.mainCol}>
        <header className={styles.pageHead}>
          <div>
            <p className="eyebrow">Dispecerat flotă · live</p>
            <h1 className={styles.title}>Flota</h1>
            <p className={styles.lead}>
              Evidența tirurilor din flotă: remorcă, șofer, destinație și starea cursei.
            </p>
          </div>
        </header>

        {/* cifrele flotei: un clic filtrează lista după ele */}
        <section className={styles.kpis} aria-label="Cifrele flotei. Apasă pentru a filtra lista.">
          {kpi.map((k, i) => (
            <button
              key={k.id}
              type="button"
              className={`${styles.kpi} ${k.clasa ?? ""} ${stare === k.id ? styles.kpiOn : ""}`}
              style={{ "--i": i }}
              aria-pressed={stare === k.id}
              onClick={() => setStare(stare === k.id && k.id !== "toate" ? "toate" : k.id)}
            >
              <span className={styles.kpiLabel}>{k.eticheta}</span>
              <span className={styles.kpiValue}>
                <CountUp value={k.valoare} />
              </span>
              <span className={styles.kpiSub}>{k.sub}</span>
            </button>
          ))}
          {/* bara cu proporția tranzit / sosite */}
          <div className={styles.ratio} aria-hidden="true">
            <span style={{ flexGrow: inTranzit }} className={styles.ratioTransit}></span>
            <span style={{ flexGrow: sosite }} className={styles.ratioDone}></span>
          </div>
        </section>

        {/* toate cursele pe o singură hartă, în timp real (simulare) */}
        <div className={styles.fleetMap}>
          <HartaFlotei tiruri={vizibile} onSelect={setSelectatId} />
        </div>

          <section className={`panel ${styles.listPanel}`} aria-labelledby="flota-titlu">
            <div className="panel-head">
              <div>
                <h2 id="flota-titlu">Flota mea</h2>
                <p className="panel-hint">
                  Numele deschide fișa tirului; restul cardului arată traseul pe hartă.
                </p>
              </div>
              <span className="count-pill" aria-live="polite">
                {vizibile.length === tiruri.length
                  ? `${tiruri.length} tiruri, dintre care ${inTranzit} în tranzit`
                  : `${vizibile.length} din ${tiruri.length} tiruri`}
              </span>
            </div>

            {/* bara de unelte: căutare, remorcă, sortare, vedere */}
            <div className={styles.toolbar}>
              <label className={styles.search}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                <span className="visually-hidden">Caută în flotă</span>
                <input
                  ref={cautareRef}
                  type="search"
                  value={cautare}
                  onChange={(e) => setCautare(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setCautare("")}
                  placeholder="Caută număr, șofer, destinație…"
                />
                {!cautare && <kbd className="kbd" aria-hidden="true">/</kbd>}
              </label>

              <div className={styles.chips} role="group" aria-label="Tipul remorcii">
                <button type="button" aria-pressed={remorca === "toate"} onClick={() => setRemorca("toate")}>
                  Toate
                </button>
                {REMORCI.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    className={styles[`chip-${r.value}`]}
                    aria-pressed={remorca === r.value}
                    onClick={() => setRemorca(remorca === r.value ? "toate" : r.value)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONITE_REMORCA[r.value]} /></svg>
                    {r.label}
                  </button>
                ))}
              </div>

              <div className={styles.toolsRight}>
                <label className={styles.sort}>
                  <span className="visually-hidden">Sortează</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4" /></svg>
                  <select value={sortare} onChange={(e) => setSortare(e.target.value)}>
                    {SORTARI.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </label>

                <div className={styles.views} role="group" aria-label="Afișare">
                  <button type="button" aria-pressed={vedere === "carduri"} onClick={() => schimbaVedere("carduri")} title="Carduri">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
                    <span className="visually-hidden">Carduri</span>
                  </button>
                  <button type="button" aria-pressed={vedere === "tabel"} onClick={() => schimbaVedere("tabel")} title="Tabel">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
                    <span className="visually-hidden">Tabel</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cele trei stări ale încărcării: așteptare, eroare, succes */}
            {loading && (
              <div className={styles.skeletons} data-testid="loading" aria-label="Se încarcă flota…" role="status">
                <span className="visually-hidden">Se încarcă flota…</span>
                {[0, 1, 2].map((i) => <div key={i} className={styles.skeleton}></div>)}
              </div>
            )}
            {error && (
              <p className="error" role="alert" data-testid="error">
                {error}
              </p>
            )}
            {/* fără !error: dacă o bifare eșuează, lista rămâne pe ecran sub mesaj */}
            {!loading && (
              <TirList
                tiruri={vizibile}
                totalFlota={tiruri.length}
                vedere={vedere}
                onToggle={handleToggleSosit}
                onDelete={handleDelete}
                onSelect={setSelectatId}
                onReset={filtreActive ? reseteazaFiltrele : null}
              />
            )}
          </section>
      </div>

      {/* formularul stă în coloana din dreapta, de sus până jos, mereu la vedere */}
      <aside className={styles.rail}>
        <section
          className={`panel surface ${styles.formPanel}`}
          aria-labelledby="adauga-titlu"
        >
          <div className="panel-head">
            <div>
              <h2 id="adauga-titlu">Adaugă tir</h2>
              <p className="panel-hint">Apare în flotă după ce serverul confirmă salvarea.</p>
            </div>
          </div>
          <TirForm onAdd={handleAdd} />
        </section>
      </aside>

      {selectat && <TirMap tir={selectat} onClose={() => setSelectatId(null)} />}
      <Toasts toasts={toasts} />
    </div>
  );
}
