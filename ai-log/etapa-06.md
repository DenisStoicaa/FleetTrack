# Stage 6: AI log

## Tools
- Claude

## Conversations
- [shared conversation](https://claude.ai/share/618b9c1b-4f09-43a7-8184-238934bca39e)  (reading the Stage 6 guide and loading the FleetTrack list from a mock API)

## Key requests
### 1. The mock API
- Asked: help me do Stage 6 following the guide; move the data out of `App.jsx` into a json-server API.
- Got: `npm install -D json-server@0.17.4`, `frontend/db.json` with the key `tiruri` (the three trucks from the README plus two new ones: BV 404 FLT · Mercedes Actros, in transit, curtainsider, EU; TM 505 FLT · MAN TGX, arrived, refrigerated, Domestic) and the `"api": "json-server --watch db.json --port 3001"` script. `http://localhost:3001/tiruri` returns the five trucks as JSON.
- Changed or rejected: the FleetTrack names instead of the TaskFlow example (`tiruri` / `/tiruri` / `fetchTiruri`, the fields `name`, `arrived`, `trailerType`, `category`, `driver`, `destination`). The two new trucks use only the three trailer types that have a photo, and differ in state and route category, so the list and the header look like a real fleet (5 trucks, 3 in transit). The README sample data lists them too.

### 2. api.js and the environment variable
- Asked: create `api.js` as the only place with `fetch`, with the address from an environment variable.
- Got: `export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001"` and `fetchTiruri()` with `await fetch`, the `res.ok` check and `throw new Error(`Eroare server: ${res.status}`)`; `frontend/.env.example` with `VITE_API_URL=http://localhost:3001`.
- Changed or rejected: nothing; only the resource name changed.

### 3. Loading in App with useEffect
- Asked: replace the hard-coded array with data from the API and show the three states.
- Got: `TIRURI_INITIALE` removed, `useState([])` plus `loading` (true) and `error` (null), the effect with the inner `async function load()` (`try` / `catch` / `finally`), the `ignore` flag and the cleanup function, and `[]` as dependencies. In the panel: "Se încarcă flota…" while loading, the error message with `npm run api` when it fails, `TirList` only when neither.
- Changed or rejected: the guide's `--mare` color does not exist in this project, so `.error` uses the existing `--danger`; `--error-bg` / `--error-border` were added in all three theme blocks (light `:root`, the system dark `@media` block and `[data-theme="dark"]`), with reds that match the project palette instead of the pink example values. The error paragraph has `role="alert"` so a screen reader announces it. The empty-list message from stage 4 stays in `TirList`, so an API that answers with `[]` still shows "Nu există niciun tir în flotă."

### 4. Testing
- Asked: check the cases from step 7.
- Got: with `npm run api` the page shows the five trucks and the header "5 tiruri, dintre care 3 în tranzit"; the Network tab shows two requests to `/tiruri` (the double mount in development); with the API stopped the panel shows "Nu am putut încărca flota: Failed to fetch. Rulează npm run api?" instead of an empty page; with `--delay 4000` "Se încarcă flota…" stays visible for four seconds. `npm run lint` and `npm run build` pass, no React warnings in the console.
- Changed or rejected: nothing kept from the tests; `db.json` has the original five trucks.

## What I learned / what did not work
cum pornește un API REST de test cu json-server dintr-un singur fișier `db.json` (cheia `tiruri` devine ruta `/tiruri`) și de ce versiunea se fixează la 0.17.4; că `fetch` întoarce o promisiune și nu aruncă eroare la 404 sau 500, ci doar când serverul nu răspunde, de aceea se verifică `res.ok`; că toate cererile stau într-un singur fișier, `api.js`, iar adresa serverului vine dintr-o variabilă de mediu (`import.meta.env.VITE_API_URL`, cu `??` pentru valoarea implicită); că `useEffect` cu `[]` rulează o singură dată, după prima randare, iar funcția dată lui nu poate fi `async`, deci se definește `load` în interior; că orice încărcare are trei stări (se încarcă, a reușit, a eșuat) și fiecare trebuie să aibă ceva pe ecran; ce face curățarea efectului cu `ignore` și de ce apar două cereri în Network în modul de dezvoltare. Ce nu a mers din prima: variabila de culoare `--mare` din ghid nu există în FleetTrack, așa că mesajul de eroare folosește `--danger`, iar culorile noi trebuiau puse în toate cele trei blocuri de temă.
