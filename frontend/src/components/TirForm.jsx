// Formularul de adăugare a unui tir. Formular controlat: state-ul React este
// sursa de adevăr pentru fiecare câmp. Nu apelează fetch: validează, transmite
// datele prin onAdd și afișează eroarea, dacă apare. Deasupra câmpurilor, o
// previzualizare arată tirul așa cum va apărea în flotă, pe măsură ce se scrie.
import { useState } from "react";
import { CATEGORII, ETICHETE_REMORCA, FOTO_REMORCA, REMORCI } from "../constants.js";
import { initiale, numarSiModel } from "../format.js";
import styles from "./TirForm.module.css";

const NUME_MAX = 100;
const TEXT_MAX = 50;
// numele șoferului: doar litere (cu diacritice), spații, cratimă, punct, apostrof
const NUME_PERSOANA = /^[\p{L}][\p{L} .'-]*$/u;

const GOL = {
  name: "",
  trailerType: "refrigerated",
  category: "Domestic",
  driver: "",
  destination: "",
};

export default function TirForm({ onAdd }) {
  const [valori, setValori] = useState(GOL);
  const [eroare, setEroare] = useState("");
  const [campGresit, setCampGresit] = useState(null); // câmpul marcat cu aria-invalid
  const [trimite, setTrimite] = useState(false);

  // Un singur onChange pentru toate câmpurile, după atributul name
  function handleChange(e) {
    const { name, value } = e.target;
    setValori((prev) => ({ ...prev, [name]: value }));
    // câmpul corectat nu mai e marcat greșit
    if (name === campGresit) {
      setCampGresit(null);
      setEroare("");
    }
  }

  // Întoarce [câmp, mesaj] pentru prima problemă găsită sau null dacă totul e valid
  function valideaza() {
    const name = valori.name.trim();
    const driver = valori.driver.trim();
    const destination = valori.destination.trim();
    if (name === "") return ["name", "Numărul și modelul tirului sunt obligatorii."];
    if (name.length > NUME_MAX) return ["name", `Numele are maximum ${NUME_MAX} de caractere.`];
    if (driver === "") return ["driver", "Numele șoferului este obligatoriu."];
    if (driver.length > TEXT_MAX) return ["driver", `Numele șoferului are maximum ${TEXT_MAX} de caractere.`];
    if (!NUME_PERSOANA.test(driver)) return ["driver", "Numele șoferului poate conține doar litere, spații și cratimă."];
    if (destination === "") return ["destination", "Destinația este obligatorie."];
    if (destination.length > TEXT_MAX) return ["destination", `Destinația are maximum ${TEXT_MAX} de caractere.`];
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault(); // oprește reîncărcarea paginii
    const problema = valideaza();
    if (problema) {
      setCampGresit(problema[0]);
      setEroare(problema[1]);
      return; // nu se trimite nimic la server
    }
    setEroare("");
    setCampGresit(null);
    setTrimite(true);
    try {
      await onAdd({
        name: valori.name.trim(),
        arrived: false,
        trailerType: valori.trailerType,
        category: valori.category,
        driver: valori.driver.trim(),
        destination: valori.destination.trim(),
      });
      setValori(GOL); // golirea doar după o salvare reușită
    } catch (err) {
      setEroare(`Nu am putut salva tirul: ${err.message}`);
    } finally {
      setTrimite(false);
    }
  }

  const [numarPrev, modelPrev] = numarSiModel(valori.name.trim());

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate data-testid="form">
      {/* previzualizarea: doar pentru ochi, cititoarele de ecran citesc câmpurile */}
      <div className={styles.preview} aria-hidden="true">
        <img key={valori.trailerType} src={FOTO_REMORCA[valori.trailerType]} alt="" />
        <div className={styles.previewBody}>
          <span className="plate">
            <span className="plate-eu">RO</span>
            {numarPrev || "B 000 FLT"}
          </span>
          <strong>{modelPrev || "Model camion"}</strong>
          <span className={styles.previewMeta}>
            <span className="avatar">{initiale(valori.driver.trim() || "?")}</span>
            {valori.driver.trim() || "Șofer"} → {valori.destination.trim() || "Destinație"}
          </span>
          <span className={styles.previewTags}>
            {ETICHETE_REMORCA[valori.trailerType]} · {valori.category}
          </span>
        </div>
      </div>

      <label>
        <span className={styles.labelRow}>
          Număr și model
          <span className={styles.count} aria-hidden="true">{valori.name.length}/{NUME_MAX}</span>
        </span>
        <input
          type="text"
          name="name"
          value={valori.name}
          onChange={handleChange}
          placeholder="Ex: IS 606 FLT · Iveco S-Way"
          maxLength={NUME_MAX}
          aria-invalid={campGresit === "name"}
          data-testid="form-title"
        />
      </label>

      <div className={styles.row}>
        <label>
          Remorcă
          <select
            name="trailerType"
            value={valori.trailerType}
            onChange={handleChange}
            data-testid="form-trailerType"
          >
            {REMORCI.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rută
          <select
            name="category"
            value={valori.category}
            onChange={handleChange}
            data-testid="form-category"
          >
            {CATEGORII.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Șofer
        <input
          type="text"
          name="driver"
          value={valori.driver}
          onChange={handleChange}
          placeholder="Ex: Ana Marinescu"
          maxLength={TEXT_MAX}
          aria-invalid={campGresit === "driver"}
          data-testid="form-driver"
        />
      </label>

      <label>
        Destinație
        <input
          type="text"
          name="destination"
          value={valori.destination}
          onChange={handleChange}
          placeholder="Ex: Budapesta"
          maxLength={TEXT_MAX}
          aria-invalid={campGresit === "destination"}
          data-testid="form-destination"
        />
      </label>

      {eroare && (
        <p className="error" role="alert" data-testid="form-error">
          {eroare}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={trimite} data-testid="form-submit">
        {trimite ? (
          <>
            <span className={styles.spinner} aria-hidden="true"></span>
            Se salvează...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            Adaugă tirul
          </>
        )}
      </button>
    </form>
  );
}
