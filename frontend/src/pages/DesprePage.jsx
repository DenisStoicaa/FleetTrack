// Pagina de prezentare (/despre): ce face aplicația și cu ce e construită.
import { Link } from "react-router-dom";
import styles from "./DesprePage.module.css";

export default function DesprePage() {
  return (
    <section className={`panel surface ${styles.about}`}>
      <p className={styles.kicker}>Despre</p>
      <h2>FleetTrack</h2>
      <p className={styles.lead}>
        FleetTrack ține evidența tirurilor dintr-o flotă de transport: numărul și modelul
        camionului, tipul remorcii, ruta (internă, UE sau în afara UE), șoferul, destinația și
        dacă tirul a ajuns. Aplicația este construită pas cu pas, pe parcursul semestrului, în
        cadrul proiectului de Tehnologii Web.
      </p>

      <ul className={styles.features}>
        <li>Lista flotei, cu adăugare, bifare la sosire și ștergere, salvate pe server.</li>
        <li>O fișă pentru fiecare tir, la adresa <code>/tiruri/:id</code>.</li>
        <li>Traseul pe o hartă demonstrativă, cu poziția simulată și ora estimată de sosire.</li>
        <li>Temă luminoasă și întunecată.</li>
      </ul>

      <p className={styles.stack}>
        Stack: React, Vite, React Router, CSS Modules, json-server (urmează Node.js, Express,
        MariaDB, Docker).
      </p>

      <Link to="/" className="btn-primary">
        Vezi flota
      </Link>
    </section>
  );
}
