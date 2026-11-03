// Toate cererile HTTP stau aici; componentele nu apelează fetch direct.
// Adresa serverului vine din variabila de mediu VITE_API_URL (vezi .env.example).
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// GET /tiruri: lista întreagă a flotei
export async function fetchTiruri() {
  const res = await fetch(`${API_URL}/tiruri`);
  // fetch nu aruncă la 404 / 500, doar când serverul nu răspunde deloc
  if (!res.ok) {
    throw new Error(`Eroare server: ${res.status}`);
  }
  return res.json();
}
