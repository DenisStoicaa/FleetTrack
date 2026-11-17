// Pagina pentru adresele care nu se potrivesc cu nicio rută (path="*").
import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <section className={`panel surface ${styles.notFound}`} data-testid="not-found">
      <img src="/photos/empty-loading-docks.jpg" alt="" />
      <p className={styles.code}>404</p>
      <h2>Pagina nu există</h2>
      <p className="info">Adresa cerută nu duce nicăieri: aici nu a parcat niciun tir.</p>
      <Link to="/" className="btn-primary">
        Înapoi la flotă
      </Link>
    </section>
  );
}
