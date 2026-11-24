// Pagina unui singur tir (/tiruri/:id): citește id-ul din adresă și cere de la server
// exact acel tir. Arată ce nu încape în card: modelul, ruta, id-ul și traseul pe hartă;
// starea „sosit” se poate schimba și de aici.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TirTraseu from "../components/TirTraseu.jsx";
import { fetchTir, updateTir } from "../api.js";
import {
  ETICHETE_CATEGORIE,
  ETICHETE_REMORCA,
  FOTO_REMORCA,
  ICONITE_REMORCA,
} from "../constants.js";
import { initiale, numarSiModel, nuanta } from "../format.js";
import { progresSimulat, useSimulare } from "../simulare.js";
import styles from "./TirDetaliuPage.module.css";

export default function TirDetaliuPage() {
  const { id } = useParams(); // text din URL, de exemplu "3"
  const [tir, setTir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eroareSalvare, setEroareSalvare] = useState(null);
  const [salveaza, setSalveaza] = useState(false);
  const { simMs, porniri, pleacaDinNou } = useSimulare();

  // Se reîncarcă dacă se schimbă id-ul din adresă (de exemplu cu Înapoi / Înainte)
  useEffect(() => {
    let ignore = false;
    fetchTir(id)
      .then((data) => {
        if (!ignore) {
          setTir(data);
          setError(null); // o eroare de la un id anterior nu mai este valabilă
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  // Aceeași operație ca în listă: PATCH doar cu câmpul schimbat, apoi obiectul întors de server
  async function handleToggle() {
    setSalveaza(true);
    try {
      const actualizat = await updateTir(tir.id, { arrived: !tir.arrived });
      setTir(actualizat);
      // scos din „sosit”: în simulare pleacă într-o cursă nouă, de la începutul traseului
      if (!actualizat.arrived) pleacaDinNou(actualizat.id);
      setEroareSalvare(null);
    } catch (err) {
      setEroareSalvare(`Nu am putut actualiza tirul: ${err.message}`);
    } finally {
      setSalveaza(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loading} data-testid="loading" role="status">
        <span className={styles.loadingBar}></span>
        Se încarcă tirul…
      </div>
    );
  }

  // id inexistent (404) sau server oprit: mesaj și drum înapoi, nu un ecran gol
  if (error) {
    return (
      <section className={`panel surface ${styles.missing}`}>
        <p className="eyebrow">Fișa tirului #{id}</p>
        <p className="error" role="alert" data-testid="error">
          Tirul nu a putut fi încărcat: {error}
        </p>
        <Link to="/" className="btn-ghost">
          <ArrowLeft />
          Înapoi la flotă
        </Link>
      </section>
    );
  }

  const [numar, model] = numarSiModel(tir.name);
  const laDestinatie = !tir.arrived && progresSimulat(tir, simMs, porniri) >= 1;

  return (
    <section className={`panel ${styles.detail}`} data-testid="detail">
      <nav className={styles.crumbs} aria-label="Pesmet">
        <Link to="/" className={styles.back}>
          <ArrowLeft />
          Flotă
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{numar}</span>
      </nav>

      {/* banda cu fotografia: plăcuța, starea și titlul peste imagine */}
      <header className={tir.arrived ? `${styles.hero} ${styles.done}` : styles.hero}>
        <img
          src={FOTO_REMORCA[tir.trailerType]}
          alt={`Camion cu remorcă ${ETICHETE_REMORCA[tir.trailerType].toLowerCase()}`}
        />
        <div className={styles.heroBody}>
          <div className={styles.heroTop}>
            <span className="plate">
              <span className="plate-eu">RO</span>
              {numar}
            </span>
            <span className={tir.arrived || laDestinatie ? "status done" : "status"}>
              <span className="dot" aria-hidden="true"></span>
              {tir.arrived ? "Sosit" : laDestinatie ? "La destinație" : "În tranzit"}
            </span>
          </div>
          <p className={styles.kicker}>Fișa tirului #{tir.id}</p>
          {/* textul complet al titlului este tir.name; numărul e pe plăcuță */}
          <h1 className={styles.title} data-testid="detail-title">
            {model ? (
              <>
                <span className="visually-hidden">{numar} · </span>
                {model}
              </>
            ) : (
              tir.name
            )}
          </h1>
          <p className={styles.heroSub}>
            {tir.driver} <span aria-hidden="true">→</span> {tir.destination}
          </p>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.side}>
          {/* listă de definiții: denumirea câmpului (dt) și valoarea lui (dd) */}
          <dl className={`surface ${styles.fields}`} style={{ "--hue": nuanta(tir.id) }}>
            <div>
              <dt>Șofer</dt>
              <dd>
                <span className="avatar" aria-hidden="true">{initiale(tir.driver)}</span>
                {tir.driver}
              </dd>
            </div>
            <div>
              <dt>Destinație</dt>
              <dd>{tir.destination}</dd>
            </div>
            <div>
              <dt>Remorcă</dt>
              <dd>
                <span className={`badge badge-${tir.trailerType}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={ICONITE_REMORCA[tir.trailerType]} />
                  </svg>
                  {ETICHETE_REMORCA[tir.trailerType]}
                </span>
              </dd>
            </div>
            <div>
              <dt>Rută</dt>
              <dd>{ETICHETE_CATEGORIE[tir.category] ?? tir.category}</dd>
            </div>
            <div>
              <dt>Stare</dt>
              <dd>{tir.arrived ? "Sosit la destinație" : laDestinatie ? "La destinație, de confirmat" : "În tranzit"}</dd>
            </div>
            <div>
              <dt>ID</dt>
              <dd className={styles.mono}>{tir.id}</dd>
            </div>
          </dl>

          <div className={`surface ${styles.toggleBox} ${tir.arrived ? styles.toggleDone : ""}`}>
            <label className="switch">
              <input type="checkbox" checked={tir.arrived} onChange={handleToggle} disabled={salveaza} />
              <span>Sosit la destinație</span>
            </label>
            <span className={styles.toggleHint}>
              {salveaza ? "Se salvează…" : tir.arrived ? "Cursa este încheiată." : "Bifează când tirul a ajuns."}
            </span>
            {eroareSalvare && <p className="error" role="alert">{eroareSalvare}</p>}
          </div>
        </div>

        <section className={`surface ${styles.mapBox}`} aria-labelledby="harta-titlu">
          <h2 id="harta-titlu" className={styles.mapTitle}>Poziția pe hartă</h2>
          <TirTraseu key={String(tir.arrived)} tir={tir} />
        </section>
      </div>
    </section>
  );
}

function ArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}
