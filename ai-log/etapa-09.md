# Stage 9: AI log

## Tools
- Claude

## Conversations
- [shared conversation](https://claude.ai/share/efc873dc-b1ce-4612-a6b4-f5a1ec9601eb)  (reading the Stage 9 guide, writing the Express backend and removing json-server)

## Key requests
### 1. The backend project
- Asked: help me go through Stage 9 following the guide.
- Got: `backend/` next to `frontend/` with `npm init`, Express 5 and `cors`, `"type": "module"`, the `start` and `dev` (`node --watch`) scripts, `.gitignore` (`node_modules`, `.env`) and `.env.example` (`PORT`, `CORS_ORIGIN`); `app.js` separate from `server.js`.
- Changed or rejected: the FleetTrack names instead of TaskFlow: `routes/tiruri.js`, prefix `/tiruri` (the `resource` from `tw.json`), the 404 message "Tirul nu există". The in-memory data are the five sample trucks from the README, not three.

### 2. Server side validation
- Asked: the server must check everything it receives, the same way the form does.
- Got: `valideazaTir(body, { partial })` that returns `{ erori, date }`, with only the known fields kept (whitelist), and `parseId` for the id in the URL.
- Changed or rejected: the guide validates only the title and the priority; FleetTrack has more fields, so the server copies the form rules: `name` (max 100), `driver` (max 50, letters only, same regular expression as `TirForm.jsx`), `destination` (max 50), `trailerType` and `category` from the same lists as `constants.js`, `arrived` boolean. A small helper `verificaText` avoids repeating the three text checks.

### 3. Connecting the frontend and removing json-server
- Asked: the React app should work exactly as before, on the new server.
- Got: `request` in `api.js` reads `body.error`; `db.json`, the `api` script and `json-server` removed, `package-lock.json` updated.
- Changed or rejected: the error message on the fleet page said "Rulează npm run api?"; it now points to `npm run dev` in `backend/`. The about page lists Node.js and Express instead of json-server.

### 4. Testing
- Asked: check the routes with curl and the app in the browser.
- Got: curl: list 200, POST 201 (an `id` and `user_id` sent by the client are ignored), GET 200, PATCH 200, DELETE 204, GET after delete 404; empty object and empty name 400 with `{ "error": "..." }`; invalid id 400; malformed JSON 400; unknown route 404. Browser, on a clean copy (`npm ci`, build with `VITE_API_URL`): add, toggle, delete and reload work, `/tiruri/999` shows "Tirul nu există", no errors in the console; opened from `http://127.0.0.1:5173` the requests are blocked by CORS, as expected. `npm run lint` and `npm run build` pass.
- Changed or rejected: nothing kept from the tests; the data reset when the server restarts.

## What I learned / what did not work
am înțeles că un server Express este un șir de funcții prin care trece fiecare cerere, în ordinea în care sunt scrise în `app.js`: întâi `cors()` și `express.json()`, apoi rutele, apoi ruta de 404, care prinde tot ce nu s-a potrivit, iar la final funcția cu patru parametri, pe care Express o recunoaște ca tratare a erorilor doar după numărul de parametri (de aceea `next` rămâne în listă deși nu e folosit); că `app.js` separat de `server.js` permite construirea aplicației fără să ocupe un port; că validarea din formular nu este suficientă, pentru că cu curl pot trimite orice direct la server, fără să treacă prin interfață, așa că serverul verifică tot și păstrează doar câmpurile cunoscute (un `id` trimis de client este ignorat, id-ul îl dă serverul); că valorile fixe din `validation.js` trebuie să fie exact cele din `constants.js`, altfel formularul trimite valori pe care serverul le refuză; ce înseamnă codurile: 201 la creare, 204 la ștergere fără corp, 400 pentru date greșite, 404 pentru ce nu există, și că toate erorile au aceeași formă, `{ "error": "..." }`, pe care `api.js` o citește și o afișează în pagină; că id-ul din adresă vine ca text, deci trebuie transformat în număr înainte de comparare. Am înțeles și CORS: frontendul de pe portul 5173 și backendul de pe 3001 sunt origini diferite, iar browserul blochează răspunsul dacă serverul nu spune explicit că permite originea paginii; nu se poate repara din frontend, ci doar pe server, prin `CORS_ORIGIN`. Am văzut asta deschizând aplicația de la `127.0.0.1:5173`: în pagină apare doar „Failed to fetch”, iar motivul real este în consolă. Ce nu a mers din prima: json-server folosea și el portul 3001, deci trebuie oprit înainte de pornirea serverului nou; textul de eroare din pagina flotei încă spunea „Rulează npm run api?”, deși scriptul nu mai există; după ștergerea json-server din `package.json` trebuie rulat `npm install`, altfel `package-lock.json` rămâne în urmă. Datele stau deocamdată în memorie, deci la fiecare repornire a serverului revin cele cinci tiruri inițiale; în Etapa 10 se mută în MariaDB.
