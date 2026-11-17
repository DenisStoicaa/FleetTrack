// Formularul de adăugare a unui tir. Formular controlat: state-ul React este
// sursa de adevăr pentru fiecare câmp. Nu apelează fetch: validează, transmite
// datele prin onAdd și afișează eroarea, dacă apare.
import { useState } from "react";

// Valorile fixe din modelul de date (README)
const REMORCI = [
  { value: "refrigerated", label: "Frigorifică" },
  { value: "curtainsider", label: "Prelată" },
  { value: "tanker", label: "Cisternă" },
];
const CATEGORII = [
  { value: "Domestic", label: "Domestic (intern)" },
  { value: "EU", label: "EU" },
  { value: "Non-EU", label: "Non-EU" },
];
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

  return (
    <form className="tir-form" onSubmit={handleSubmit} noValidate data-testid="form">
      <label>
        Număr și model
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

      <div className="form-row">
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
        {trimite ? "Se salvează..." : "Adaugă tirul"}
      </button>
    </form>
  );
}
