# Stage 8: AI log

## Tools
- Claude

## Conversations
- [shared conversation](https://claude.ai/share/5c648b9d-30db-4e9e-8a50-11adfaf9256c)  (reading the Stage 8 guide, splitting the app into pages with React Router and moving the styles to CSS Modules)

## Key requests
### 1. React Router and the route map
- Asked: help me go through Stage 8 following the guide.
- Got: `react-router-dom` installed, `BrowserRouter` in `main.jsx`, `App.jsx` reduced to the route map (`/`, `/tiruri/:id`, `/despre`, `*`) inside one `Layout` route, `Layout.jsx` with `NavLink` (+ `end` on `/`) and `<Outlet />`.
- Changed or rejected: the FleetTrack names instead of TaskFlow (`TiruriPage`, `TirDetaliuPage`, route `/tiruri/:id` from `tw.json`, links "Flotă" and "Despre"). The light / dark toggle moved from the hero into the common header, since it is needed on every page; the hero photo and the KPI tiles stayed on the fleet page.

### 2. The detail page
- Asked: a page for one truck that reads the id from the URL and asks the server for exactly that truck.
- Got: `fetchTir(id)` in `api.js`, `TirDetaliuPage.jsx` with `useParams`, the effect on `[id]` with `ignore`, the loading / error / detail states and `data-testid` `detail`, `detail-title`, `error`, `loading`.
- Changed or rejected: the guide shows only priority, status and id; the FleetTrack card already shows driver, destination and trailer, so the detail page adds the model, the route category, the id and the route map with the simulated position. For that, the map body was moved out of `TirMap.jsx` into a new component, `TirTraseu.jsx`, used both in the map window and on the detail page.

### 3. The card title as a link
- Asked: the title opens the detail page.
- Got: `<Link to={`/tiruri/${tir.id}`}>` with `data-testid="item-link"` instead of `item-title`; its text is still exactly `tir.name` (plate in a visually hidden span).
- Changed or rejected: the whole card used to open the map on click; the link is now excluded from that, so a click on the title only navigates.

### 4. CSS Modules
- Asked: move the styles next to the components.
- Got: `App.css` (1,389 lines) split into `index.css` (variables for both themes, base elements, shared classes: `panel`, `surface`, `btn-primary`, `btn-danger`, `plate`, `status`, `dot`, `badge`, `tag`, `avatar`, `info`, `error`) and one `.module.css` per component and page; constants in `constants.js`, small display functions in `format.js`.
- Changed or rejected: global classes used inside a module are written with `:global(...)` (for example the plate positioned on the card photo); the `@keyframes` used by a module are declared in that module, because CSS Modules rename animation names too.

### 5. Testing
- Asked: check the cases from step 8.
- Got: a click on a title opens `/tiruri/1` with no HTML document request; Back and Forward work; a refresh on `/tiruri/1` shows the detail page; `/tiruri/999` shows "Tirul nu a putut fi încărcat: Eroare server: 404"; `/ceva` shows the 404 page; `[data-testid=nav] a` returns 2 links; add / toggle / delete still work; no horizontal scroll on a phone width. `npm run lint` and `npm run build` pass.
- Changed or rejected: nothing kept from the tests; `db.json` has the original five trucks.

## What I learned / what did not work
cum funcționează o aplicație cu o singură pagină: browserul încarcă o dată `index.html`, iar React Router desenează altă componentă în funcție de adresă, fără să mai ceară o pagină nouă de la server (în fila Network apar doar cererile fetch către API); de ce `<Link>` și `<NavLink>` și nu `<a href>`, care ar reîncărca tot documentul și ar pierde state-ul; că o rută fără `path`, cu `Layout`, face ca antetul și subsolul să fie scrise o singură dată, iar pagina curentă apare în locul lui `<Outlet />`; că `NavLink` marchează singur pagina curentă, dar linkul către `/` are nevoie de `end`, altfel ar fi activ pe toate paginile; că `useParams()` întoarce id-ul ca text (`"3"`, nu `3`), iar efectul din pagina de detaliu trebuie să depindă de `[id]`, ca la Înapoi / Înainte între două tiruri să se încarce tirul nou; că un id inexistent nu trebuie să dea un ecran gol: serverul răspunde 404, `request` aruncă eroarea și pagina o afișează cu un drum înapoi; cum funcționează CSS Modules: clasele dintr-un `.module.css` primesc la build nume unice, deci `.card` dintr-o componentă nu mai intră în conflict cu altă clasă `.card`, iar în JSX se scriu `styles.nume`. Ce nu a mers din prima: în module, clasele globale (plăcuța, starea de pe fotografie) nu se aplicau până nu le-am scris cu `:global(...)`, iar animațiile definite doar în fișierul global nu mai mergeau din module, pentru că CSS Modules redenumesc și numele animațiilor, așa că fiecare modul își declară propriile `@keyframes`. Tot așa, după ce titlul cardului a devenit link, un clic pe el deschidea și harta (clicul pe card o deschide), așa că linkul a trebuit exclus din clicul pe card. Reîncărcarea pe `/tiruri/1` merge doar pentru că serverul Vite trimite `index.html` pentru orice adresă; pe un server obișnuit ar da 404 și se configurează la containerizare.
