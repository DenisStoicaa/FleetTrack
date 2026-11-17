// Pagina de prezentare (/despre): ce face aplicația și cu ce e construită.
import { Link } from "react-router-dom";
import styles from "./DesprePage.module.css";

const FUNCTII = [
  {
    titlu: "Evidența flotei",
    text: "Adăugare, bifare la sosire și ștergere, salvate pe server. Căutare, filtre după stare și remorcă, sortare, carduri sau tabel.",
    icon: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  },
  {
    titlu: "Fișa fiecărui tir",
    text: <>O pagină pentru fiecare tir, la adresa <code>/tiruri/:id</code>, cu toate datele și traseul.</>,
    icon: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h5" /></>,
  },
  {
    titlu: "Traseul pe hartă",
    text: "O hartă demonstrativă cu poziția simulată, distanța rămasă și ora estimată de sosire.",
    icon: <><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /></>,
  },
  {
    titlu: "Temă luminoasă și întunecată",
    text: "Pornește cu tema sistemului; alegerea făcută din bara laterală se păstrează.",
    icon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  },
];

const STACK = ["React", "Vite", "React Router", "CSS Modules", "json-server"];
const URMEAZA = ["Node.js", "Express", "MariaDB", "Docker"];

export default function DesprePage() {
  return (
    <section className={`panel ${styles.about}`}>
      <header className={styles.hero}>
        <p className="eyebrow">Despre</p>
        <h2 className={styles.title}>FleetTrack</h2>
        <p className={styles.lead}>
          FleetTrack ține evidența tirurilor dintr-o flotă de transport: numărul și modelul
          camionului, tipul remorcii, ruta (internă, UE sau în afara UE), șoferul, destinația și
          dacă tirul a ajuns. Aplicația este construită pas cu pas, pe parcursul semestrului, în
          cadrul proiectului de Tehnologii Web.
        </p>
      </header>

      <ul className={styles.features}>
        {FUNCTII.map((f, i) => (
          <li key={f.titlu} style={{ "--i": i }}>
            <span className={styles.icon} aria-hidden="true">
              <svg viewBox="0 0 24 24">{f.icon}</svg>
            </span>
            <h3>{f.titlu}</h3>
            <p>{f.text}</p>
          </li>
        ))}
      </ul>

      <div className={`surface ${styles.stack}`}>
        <div>
          <p className="eyebrow">Stack</p>
          <ul className={styles.pills}>
            {STACK.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Urmează</p>
          <ul className={`${styles.pills} ${styles.next}`}>
            {URMEAZA.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
        <Link to="/" className="btn-primary">
          Vezi flota
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
      </div>
    </section>
  );
}
