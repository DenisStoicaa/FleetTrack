// Toate cererile HTTP stau aici; componentele nu apelează fetch direct.
// Adresa serverului vine din variabila de mediu VITE_API_URL (vezi .env.example).
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// Funcție comună: trimite JSON și aruncă eroare dacă răspunsul nu este 2xx.
// fetch nu aruncă la 404 / 500, doar când serverul nu răspunde deloc.
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    // API-ul propriu (backend/) răspunde cu { error: "..." }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Eroare server: ${res.status}`);
  }
  // 204 No Content nu are corp, iar res.json() ar arunca eroare
  return res.status === 204 ? null : res.json();
}

// GET /tiruri: lista întreagă a flotei
export function fetchTiruri() {
  return request("/tiruri");
}

// GET /tiruri/:id: un singur tir (pagina de detaliu); 404 dacă id-ul nu există
export function fetchTir(id) {
  return request(`/tiruri/${id}`);
}

// POST /tiruri: tirul nou, fără id (id-ul îl dă serverul)
export function createTir(tir) {
  return request("/tiruri", { method: "POST", body: JSON.stringify(tir) });
}

// PATCH /tiruri/:id: doar câmpurile schimbate
export function updateTir(id, changes) {
  return request(`/tiruri/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

// DELETE /tiruri/:id
export function deleteTir(id) {
  return request(`/tiruri/${id}`, { method: "DELETE" });
}
