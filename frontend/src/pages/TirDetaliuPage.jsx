// Pagina unui singur tir (/tiruri/:id): citește id-ul din adresă și cere de la server
// exact acel tir. Arată ce nu încape în card: modelul, ruta, id-ul și traseul pe hartă.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TirTraseu from "../components/TirTraseu.jsx";
import { fetchTir } from "../api.js";
import {
  ETICHETE_CATEGORIE,
  ETICHETE_REMORCA,
  FOTO_REMORCA,
  ICONITE_REMORCA,
} from "../constants.js";
import { initiale, numarSiModel, nuanta } from "../format.js";
import styles from "./TirDetaliuPage.module.css";

export default function TirDetaliuPage() {
  const { id } = useParams(); // text din URL, de exemplu "3"
  const [tir, setTir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <p className="info" data-testid="loading">
        Se încarcă tirul…
      </p>
    );
  }

  // id inexistent (404) sau server oprit: mesaj și drum înapoi, nu un ecran gol
  if (error) {
    return (
      <section className={`panel surface ${styles.missing}`}>
        <p className="error" role="alert" data-testid="error">
          Tirul nu a putut fi încărcat: {error}
        </p>
        <Link to="/" className={styles.back}>
          <ArrowLeft />
          Înapoi la flotă
        </Link>
      </section>
    );
  }

  const [numar, model] = numarSiModel(tir.name);

  return (
    <section className={`panel ${styles.detail}`} data-testid="detail">
      <Link to="/" className={styles.back}>
        <ArrowLeft />
        Înapoi la flotă
      </Link>

      <div className={styles.top}>
        <div className={tir.arrived ? `${styles.photo} ${styles.done}` : styles.photo}>
          <img
            src={FOTO_REMORCA[tir.trailerType]}
            alt={`Camion cu remorcă ${ETICHETE_REMORCA[tir.trailerType].toLowerCase()}`}
          />
          <span className={tir.arrived ? "status done" : "status"}>
            <span className="dot" aria-hidden="true"></span>
            {tir.arrived ? "Sosit" : "În tranzit"}
          </span>
          <span className="plate">
            <span className="plate-eu">RO</span>
            {numar}
          </span>
        </div>

        <div className={`surface ${styles.info}`}>
          <p className={styles.kicker}>Fișa tirului #{tir.id}</p>
          {/* textul complet al titlului este tir.name; numărul e pe plăcuță */}
          <h2 className={tir.arrived ? `${styles.title} ${styles.doneTitle}` : styles.title} data-testid="detail-title">
            {model ? (
              <>
                <span className="visually-hidden">{numar} · </span>
                {model}
              </>
            ) : (
              tir.name
            )}
          </h2>

          {/* listă de definiții: denumirea câmpului (dt) și valoarea lui (dd) */}
          <dl className={styles.fields} style={{ "--hue": nuanta(tir.id) }}>
            <dt>Șofer</dt>
            <dd>
              <span className="avatar" aria-hidden="true">{initiale(tir.driver)}</span>
              {tir.driver}
            </dd>
            <dt>Destinație</dt>
            <dd>{tir.destination}</dd>
            <dt>Remorcă</dt>
            <dd>
              <span className={`badge badge-${tir.trailerType}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={ICONITE_REMORCA[tir.trailerType]} />
                </svg>
                {ETICHETE_REMORCA[tir.trailerType]}
              </span>
            </dd>
            <dt>Rută</dt>
            <dd>{ETICHETE_CATEGORIE[tir.category] ?? tir.category}</dd>
            <dt>Stare</dt>
            <dd>{tir.arrived ? "Sosit la destinație" : "În tranzit"}</dd>
            <dt>ID</dt>
            <dd className={styles.mono}>{tir.id}</dd>
          </dl>
        </div>
      </div>

      <section className={`surface ${styles.mapBox}`}>
        <h3 className={styles.mapTitle}>Poziția pe hartă</h3>
        <TirTraseu tir={tir} />
      </section>
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
