// Validare pe server: datele de la client nu sunt niciodată de încredere.
// Valorile fixe sunt identice cu cele din frontend/src/constants.js,
// iar limitele cu cele din frontend/src/components/TirForm.jsx.
export const REMORCI = ["refrigerated", "curtainsider", "tanker"];
export const CATEGORII = ["Domestic", "EU", "Non-EU"];
const NUME_MAX = 100;
const TEXT_MAX = 50;
// numele șoferului: doar litere (cu diacritice), spații, cratimă, punct, apostrof
const NUME_PERSOANA = /^[\p{L}][\p{L} .'-]*$/u;

// Câmp text obligatoriu, curățat de spații, cu lungime maximă
function verificaText(body, camp, eticheta, max, erori, date) {
  const valoare = body[camp];
  if (typeof valoare !== "string" || valoare.trim() === "") {
    erori.push(`${eticheta} este obligatoriu`);
  } else if (valoare.trim().length > max) {
    erori.push(`${eticheta} are maximum ${max} de caractere`);
  } else {
    date[camp] = valoare.trim();
  }
}

// partial = true pentru PATCH (se verifică doar câmpurile trimise)
export function valideazaTir(body, { partial = false } = {}) {
  const erori = [];
  const date = {};

  if (!partial || body.name !== undefined) {
    verificaText(body, "name", "name", NUME_MAX, erori, date);
  }

  if (!partial || body.driver !== undefined) {
    verificaText(body, "driver", "driver", TEXT_MAX, erori, date);
    if (date.driver !== undefined && !NUME_PERSOANA.test(date.driver)) {
      erori.push("driver poate conține doar litere, spații și cratimă");
      delete date.driver;
    }
  }

  if (!partial || body.destination !== undefined) {
    verificaText(body, "destination", "destination", TEXT_MAX, erori, date);
  }

  if (!partial || body.trailerType !== undefined) {
    const t = body.trailerType ?? "refrigerated";
    if (!REMORCI.includes(t)) {
      erori.push(`trailerType trebuie să fie una din: ${REMORCI.join(", ")}`);
    } else {
      date.trailerType = t;
    }
  }

  if (!partial || body.category !== undefined) {
    const c = body.category ?? "Domestic";
    if (!CATEGORII.includes(c)) {
      erori.push(`category trebuie să fie una din: ${CATEGORII.join(", ")}`);
    } else {
      date.category = c;
    }
  }

  if (body.arrived !== undefined) {
    if (typeof body.arrived !== "boolean") {
      erori.push("arrived trebuie să fie true sau false");
    } else {
      date.arrived = body.arrived;
    }
  } else if (!partial) {
    date.arrived = false;
  }

  return { erori, date };
}

// Id-urile din adresă vin ca text; se acceptă doar numere întregi pozitive
export function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
