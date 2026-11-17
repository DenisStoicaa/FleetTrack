// Pagina pentru adresele care nu se potrivesc cu nicio rută (path="*").
import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <section className={`panel ${styles.notFound}`} data-testid="not-found">
      <img src="/photos/empty-loading-docks.jpg" alt="" />
      <div className={styles.body}>
        <p className={styles.code} aria-hidden="true">404</p>
        <p className="eyebrow">Rampă inexistentă</p>
        <h2>Pagina nu există</h2>
        <p className={styles.text}>Adresa cerută nu duce nicăieri: aici nu a parcat niciun tir.</p>
        <Link to="/" className="btn-primary">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
          Înapoi la flotă
        </Link>
      </div>
    </section>
  );
}
