# FleetTrack

FleetTrack is a web app for small transport companies that keeps track of their trucks (TIR).
Dispatchers see every truck in the fleet, its trailer type and whether it is still in transit or has arrived.

## Data model

| Field        | Type         | Notes                                                        |
| ------------ | ------------ | ------------------------------------------------------------ |
| name         | text         | plate number + model (e.g. "B 101 FLT · Volvo FH16"), required, max 100 chars |
| arrived      | boolean      | toggled from the list: in transit (false) / arrived (true), default false |
| trailerType  | fixed values | refrigerated, curtainsider, tanker                           |
| category     | relation     | Domestic, EU, Non-EU (route type)                            |
| user         | relation     | the dispatcher who owns the truck record (from week 11)      |
| driver       | text         | extra field: name of the driver                              |
| destination  | text         | extra field: destination city of the current trip            |

Sample data used across all stages:

1. B 101 FLT · Volvo FH16, in transit, refrigerated (driver Ion Popescu, to Berlin)
2. B 202 FLT · Scania R450, arrived, curtainsider (driver Maria Ionescu, to Cluj-Napoca)
3. CJ 303 FLT · DAF XF, in transit, tanker (driver Andrei Georgescu, to Istanbul)
4. BV 404 FLT · Mercedes Actros, in transit, curtainsider (driver Elena Dumitrescu, to Viena), added in stage 6
5. TM 505 FLT · MAN TGX, arrived, refrigerated (driver Mihai Stan, to Constanța), added in stage 6

From stage 6 the data lives in `frontend/db.json` and is served by json-server.

## How to run

```bash
cd frontend
npm install
npm run api    # terminal 1: mock API, http://localhost:3001
npm run dev    # terminal 2: the app, http://localhost:5173
```

Then open the address printed in the second terminal (http://localhost:5173).
The API address is read from `VITE_API_URL` (see `frontend/.env.example`); the default is http://localhost:3001.
The stage 1–2 static files (HTML mockup, CSS, `tiruri.js`) are kept in `mockup/`.

## AI usage

| Tool   | Used for                                                                                   |
| ------ | ------------------------------------------------------------------------------------------ |
| Claude | stage 1: reading the stage guide, drafting the README, HTML structure and CSS (Grid, Flexbox, variables, dark theme) |
| Claude | stage 2: reading the stage guide, writing `tiruri.js` (array of objects, map/filter/find/reduce, immutable functions, validation, console tests) |
| Claude | stage 3: reading the stage guide, creating the Vite + React project, removing the demo files, writing `App.jsx` with the header computed from data |
| Claude | stage 4: reading the stage guide, splitting the list into `TirList` and `TirCard`, rendering the cards from data with `map` and `key`, testing the special cases (missing key, empty list, state change) |
| Claude | stage 5: reading the stage guide, moving the list into `useState`, the immutable `handleToggleSosit` / `handleDelete` functions passed down through props, the controlled checkbox and the delete button in `TirCard`, the light / dark toggle with `data-theme` |
| Claude | stage 6: reading the stage guide, `db.json` with five trucks, the `api` script with json-server 0.17.4, `api.js` with `fetchTiruri` and the URL from `VITE_API_URL`, loading the list with `useEffect` and the loading / error states, testing with the API stopped and with `--delay 4000` |
| Claude | stage 7: reading the stage guide, the shared `request` function and the CRUD functions in `api.js`, the controlled `TirForm` with validation, saving add / toggle / delete on the server, `tw.json` and the `data-testid` attributes, testing with the API stopped and with `--delay` |
| Claude | stage 8: reading the stage guide, React Router (`BrowserRouter`, the route map, `Layout` with `NavLink` and `Outlet`), the detail page with `useParams` and `fetchTir`, the about and 404 pages, splitting `App.css` into `index.css` and CSS Modules, testing the routes and the `data-testid` attributes |

Details per stage: see the [ai-log/](ai-log/) folder.

## Stage 2: data logic

Plain JavaScript, no DOM. `tiruri.js` holds the `tiruri` array and the functions
that read and change it: `listeazaNume`, `numaraInTranzit`, `cautaTir` (by name, driver or destination),
`adaugaTir` (with validation), `comutaSosit`, `stergeTir` and `nextId`.
None of the functions changes the list it receives; each one returns a new list.
Results are printed in the browser console (F12).

## Stage 3: Vite and React project

The app now lives in `frontend/`, built with Vite. The data from stage 2
moved into the main component; the list is still printed raw.
The header (counter and the four stat tiles) is computed from the `tiruri` array:
total, in transit, arrived and international routes (category other than Domestic).

## Stage 4: components

The list is rendered from the data, through two components in `frontend/src/components/`:
- `TirList` receives the whole `tiruri` array and renders one card per item (`map`, `key={tir.id}`);
  when the array is empty it shows "Nu există niciun tir în flotă."
- `TirCard` receives a single truck through props and displays it exactly like the stage 1 mockup:
  EU-style plate, model, driver → destination, trailer badge, route category and status.
  The trailer label comes from `ETICHETE_REMORCA` (`refrigerated` → "Frigorifică"),
  and an arrived truck gets the `done` class and the "Sosit" status.

## Stage 5: local state and events

The list lives in React state, in `App` (`useState(TIRURI_INITIALE)`).
Checking a truck as arrived and deleting it work from the page: `TirCard` only calls
`onToggle(id)` / `onDelete(id)`, and `App` changes the list with immutable updates
(`map` with `{ ...t, arrived: !t.arrived }`, `filter`). The counter and the four stat tiles
in the header are derived from the list on every render, so they follow automatically.
A button in the header switches between light and dark mode: the choice is kept in state
and written as `data-theme` on `<html>`; the CSS only redefines the color variables.
Changes are lost on refresh; stage 6 loads the list from an API and stage 7 saves the changes there.

## Stage 6: data from a mock API

The list is served by json-server from `frontend/db.json` (key `tiruri`, route `/tiruri`).
The app fetches it on load and shows a loading state and an error state.

    npm run api    # terminal 1, http://localhost:3001
    npm run dev    # terminal 2, http://localhost:5173

- `src/api.js` is the only file that calls `fetch`; `fetchTiruri()` checks `res.ok`
  and throws `Eroare server: <status>` otherwise. The address comes from `VITE_API_URL`,
  documented in `.env.example`.
- `App` starts with `useState([])` and loads the list in `useEffect(..., [])`,
  with `loading` and `error` state and an `ignore` flag cleaned up when the component unmounts.
- While waiting the panel shows "Se încarcă flota…"; when the API is down it shows
  "Nu am putut încărca flota: … Rulează `npm run api`?" instead of an empty page.
- json-server is pinned to 0.17.4 (1.x generates text ids and behaves differently).
- Toggling and deleting still change only the local state and are lost on refresh; stage 7 saves them on the server.

## Stage 7: form and validation

Trucks can be added from the page. The form is controlled and validated,
and every change (add, toggle, delete) goes to the API before it shows up
in the list, so everything survives a page refresh.

- `src/api.js` has one shared `request(path, options)` that sends JSON, checks `res.ok`
  and handles `204 No Content`; on top of it `fetchTiruri`, `createTir` (POST),
  `updateTir` (PATCH, only the changed fields) and `deleteTir` (DELETE).
- `src/components/TirForm.jsx` is a controlled form (every field has `value` + `onChange`):
  plate and model, trailer type, route category, driver and destination.
  Validation, shown under the fields (not with `alert`), with the wrong field marked by `aria-invalid`:
  name required and at most 100 characters; driver required, at most 50 characters,
  letters only; destination required, at most 50 characters. An invalid form sends nothing.
- While saving, the button is disabled and reads "Se salvează..."; the form is cleared only
  after the server confirms. If the API is down the error appears in the form and the typed text stays.
- `App` adds to the list the object returned by the server (with its id), and replaces the toggled
  truck with the server's copy. A failed toggle or delete shows an error above the list, which stays visible.
- Layout: the form on the left, the fleet on the right (one column under 960px).
- `tw.json` (repository root) and the `data-testid` attributes (`form`, `form-title`, `form-trailerType`,
  `form-category`, `form-driver`, `form-destination`, `form-submit`, `form-error`, `item` with `data-id`,
  `item-title`, `item-toggle`, `item-delete`, `empty`, `loading`, `error`) are for the automatic check.

## Stage 8: routing and detail page

The app now has several pages behind React Router, and the component styles
moved next to their components, in CSS Modules.

- `src/main.jsx` wraps `App` in `BrowserRouter`; `src/App.jsx` is only the route map:
  `/` (the fleet), `/tiruri/:id` (one truck: the route uses the `resource` from `tw.json`),
  `/despre` and `*` (the app's 404 page), all inside one `Layout` route.
- `src/components/Layout.jsx`: the header (brand, navigation, light / dark toggle), `<Outlet />`
  for the current page and the footer, written once. The navigation uses `NavLink`, which marks
  the current page by itself (`end` on the `/` link, so it is not active everywhere).
- `src/pages/TiruriPage.jsx`: the stage 7 `App` (state, loading effect, add / toggle / delete),
  with the hero photo and KPIs; the truck counter moved into the list panel.
- The card title is now a `Link` to `/tiruri/:id` (`data-testid="item-link"`, which replaces
  `item-title`); a click elsewhere on the card still opens the route map.
- `src/pages/TirDetaliuPage.jsx` reads the id with `useParams` and loads exactly that truck with
  `fetchTir(id)` (`GET /tiruri/:id`); the effect depends on `[id]`, so Back / Forward work without
  a reload. It shows what does not fit on the card: model, route category, status, id and the
  route map with the simulated position (`TirTraseu`, shared with the map window).
  A missing id (`/tiruri/999`, 404) shows an error and a link back, not an empty page.
- `src/pages/DesprePage.jsx` describes the app; `src/pages/NotFoundPage.jsx` catches unknown URLs.
- CSS Modules: every component and page has its `.module.css`; `App.css` became `index.css` and keeps
  only the color variables (both themes), base elements and shared classes (`panel`, `surface`,
  buttons, plate, status, badges, messages). The fixed values and their labels moved to
  `src/constants.js`, small display helpers to `src/format.js`.
- New `data-testid` attributes: `nav`, `item-link`, `detail`, `detail-title`, `error` / `loading`
  on the detail page, `not-found`. The stage 7 attributes stay on the same elements.

## UI redesign: "on the road"

After stage 5 the interface was redesigned after a look at fleet-management designs on Dribbble:
a dusk-highway photo hero with the KPI tiles on frosted glass, then one photo card per truck
(photo by trailer type, plate and status on the photo, driver avatar with initials, destination,
an "arrived" switch that is still the controlled checkbox, and the delete button).
The data, the state and the functions are the same as in stage 5; the light / dark themes still only
redefine CSS variables. Fonts: Bricolage Grotesque (headings), Figtree (text), JetBrains Mono (plates).

Photos (free, [Unsplash License](https://unsplash.com/license)), in `frontend/public/photos/`:

| File | Photographer |
| ---- | ------------ |
| `hero-highway-dusk.jpg` | [@josiahfarrow](https://unsplash.com/photos/semi-truck-on-highway-at-dusk-ucuOscdCaO4) |
| `truck-refrigerated.jpg` | [@ishergraphy](https://unsplash.com/photos/a-white-semi-truck-driving-down-a-road-778IldZFCDk) |
| `truck-curtainsider.jpg` | [@photogasan](https://unsplash.com/photos/white-truck-on-road-during-daytime-GBVDilE8yvI) |
| `truck-tanker.jpg` | [@zemos](https://unsplash.com/photos/a-large-tanker-truck-parked-on-the-side-of-the-road-yXAFCxpaQcw) |
| `empty-loading-docks.jpg` | [@themrjaxon](https://unsplash.com/photos/a-row-of-semi-trucks-parked-next-to-each-other-fP4OG67TVes) |

## Live trip simulation

The trucks in transit now move along their routes in real time (simulated; there is no GPS).

- `src/simulare.js` + `src/components/SimulareProvider.jsx`: one simulation clock for the whole app,
  placed around `<App />` in `main.jsx`. Four times a second the simulated time advances by the real
  time elapsed multiplied by the chosen speed: pause, 1× (real time), 60× (1 minute = 1 hour of
  driving, the default) or 600×. The speed is remembered in `localStorage`.
- Each truck starts from the progress in `data/harta.js` and drives at `VITEZA_MEDIE` (70 km/h)
  of simulated time. Routes were added for trucks 4 and 5; a truck added from the form whose
  destination is a city on the map gets a direct route from the depot (București), starting at 0.
- `src/components/HartaFlotei.jsx`: a new "Harta flotei" panel on the fleet page with every visible
  truck (the filters apply) on one map, each in its own color; a click (or Enter) on a truck opens
  its route map. The cards, the table rows, the KPI "km to go", the "closest to arrival" sort, the
  map window and the detail page all read the same simulated position, and the ETA is computed
  from the simulated clock.
- When a truck reaches its destination it shows "La destinație" and a toast asks the dispatcher to
  confirm with the "arrived" switch: the simulation never writes to the server. Unticking "arrived"
  sends the truck on a new trip from the start of its route.
- The map drawing helpers moved from `TirTraseu.jsx` to `src/harta-svg.js`, shared by both maps.
- The simulation restarts on a page reload; in-app navigation keeps it running.

## Status

- [x] Stage 1: static mockup
- [x] Stage 2: data logic in JavaScript
- [x] Stage 3: Vite and React project
- [x] Stage 4: components rendered from data
- [x] Stage 5: local state and events
- [x] Stage 6: data from a mock API
- [x] Stage 7: form and validation
- [x] Stage 8: routing and detail page
- [ ] Stage 9: own backend with Express

## Stage 1 checklist

| ID    | Requirement                                          | Where (permalink) | How to check |
| ----- | ---------------------------------------------------- | ----------------- | ------------ |
| S1-R1 | README: description, fields, sample data, how to run | [README.md#L1-L26](https://github.com/DenisStoicaa/FleetTrack/blob/c2e0b47a42b3fc6108d894cb7dd7f9af52f5beef/README.md#L1-L26) | read |
| S1-R2 | AI usage section                                     | [README.md#L28-L34](https://github.com/DenisStoicaa/FleetTrack/blob/c2e0b47a42b3fc6108d894cb7dd7f9af52f5beef/README.md#L28-L34) | read |
| S1-R3 | AI log for stage 1                                   | [ai-log/etapa-01.md](https://github.com/DenisStoicaa/FleetTrack/blob/c2e0b47a42b3fc6108d894cb7dd7f9af52f5beef/ai-log/etapa-01.md) | read |
| S1-R4 | header, form (text + select), 3 cards with own data  | [index.html#L10-L66](https://github.com/DenisStoicaa/FleetTrack/blob/c2e0b47a42b3fc6108d894cb7dd7f9af52f5beef/index.html#L10-L66) | open the page |
| S1-R5 | finished card looks different                        | [style.css#L174-L183](https://github.com/DenisStoicaa/FleetTrack/blob/c2e0b47a42b3fc6108d894cb7dd7f9af52f5beef/style.css#L174-L183) (`.done`) | look at the B 202 FLT card |
| S1-R6 | 2 columns on desktop, 1 under 700px                  | [style.css#L54-L62](https://github.com/DenisStoicaa/FleetTrack/blob/c2e0b47a42b3fc6108d894cb7dd7f9af52f5beef/style.css#L54-L62), [style.css#L227-L231](https://github.com/DenisStoicaa/FleetTrack/blob/c2e0b47a42b3fc6108d894cb7dd7f9af52f5beef/style.css#L227-L231) (`@media`) | resize < 700px |
| S1-R7 | visible focus, readable dark theme                   | [style.css#L203-L224](https://github.com/DenisStoicaa/FleetTrack/blob/c2e0b47a42b3fc6108d894cb7dd7f9af52f5beef/style.css#L203-L224) | Tab; dark mode |
| S1-R8 | commit "Stage 1" pushed                              | [c2e0b47](https://github.com/DenisStoicaa/FleetTrack/commit/c2e0b47a42b3fc6108d894cb7dd7f9af52f5beef) | commit history |

## Stage 2 checklist

| ID    | Requirement                                   | Where (permalink) | How to check |
| ----- | --------------------------------------------- | ----------------- | ------------ |
| S2-R1 | JS file linked, logs on page load             | [index.html#L67](https://github.com/DenisStoicaa/FleetTrack/blob/9af2941dbd451225faa8312e0e78db2cf5a3a204/index.html#L67) (script) | open page, F12 |
| S2-R2 | 3+ items with id, name, state, tag            | [tiruri.js#L4-L14](https://github.com/DenisStoicaa/FleetTrack/blob/9af2941dbd451225faa8312e0e78db2cf5a3a204/tiruri.js#L4-L14) | read |
| S2-R3 | list, count, search, add, toggle, delete      | [tiruri.js#L16-L89](https://github.com/DenisStoicaa/FleetTrack/blob/9af2941dbd451225faa8312e0e78db2cf5a3a204/tiruri.js#L16-L89) | console output |
| S2-R4 | add rejects empty name and invalid tag        | [tiruri.js#L48-L67](https://github.com/DenisStoicaa/FleetTrack/blob/9af2941dbd451225faa8312e0e78db2cf5a3a204/tiruri.js#L48-L67) | last 2 console lines |
| S2-R5 | original array unchanged after add            | [tiruri.js#L101](https://github.com/DenisStoicaa/FleetTrack/blob/9af2941dbd451225faa8312e0e78db2cf5a3a204/tiruri.js#L101) | console line |
| S2-R6 | README Stage 2 section + AI log               | [README.md](https://github.com/DenisStoicaa/FleetTrack/blob/9af2941dbd451225faa8312e0e78db2cf5a3a204/README.md), [ai-log/etapa-02.md](https://github.com/DenisStoicaa/FleetTrack/blob/9af2941dbd451225faa8312e0e78db2cf5a3a204/ai-log/etapa-02.md) | read |
| S2-R7 | commit "Stage 2" pushed                       | [9af2941](https://github.com/DenisStoicaa/FleetTrack/commit/9af2941dbd451225faa8312e0e78db2cf5a3a204) | commit history |

## Stage 3 checklist

| ID    | Requirement                                   | Where (permalink) | How to check |
| ----- | --------------------------------------------- | ----------------- | ------------ |
| S3-R1 | npm run dev starts without errors             | [frontend/package.json#L6-L11](https://github.com/DenisStoicaa/FleetTrack/blob/627e5ec8fd9be0ad600a01fcca5e7b336e01e273/frontend/package.json#L6-L11) (scripts) | npm install, npm run dev |
| S3-R2 | app name and counter computed from data       | [frontend/src/App.jsx#L11-L50](https://github.com/DenisStoicaa/FleetTrack/blob/627e5ec8fd9be0ad600a01fcca5e7b336e01e273/frontend/src/App.jsx#L11-L50) | edit data, save |
| S3-R3 | data from README, not from the example        | [frontend/src/App.jsx#L3-L8](https://github.com/DenisStoicaa/FleetTrack/blob/627e5ec8fd9be0ad600a01fcca5e7b336e01e273/frontend/src/App.jsx#L3-L8) | compare with README |
| S3-R4 | stage 1 styles reused                         | [frontend/src/App.css](https://github.com/DenisStoicaa/FleetTrack/blob/627e5ec8fd9be0ad600a01fcca5e7b336e01e273/frontend/src/App.css) | look at the page |
| S3-R5 | node_modules ignored, build passes            | [frontend/.gitignore#L10-L11](https://github.com/DenisStoicaa/FleetTrack/blob/627e5ec8fd9be0ad600a01fcca5e7b336e01e273/frontend/.gitignore#L10-L11) | npm run build |
| S3-R6 | README Stage 3 section + AI log               | [README.md#L53-L58](https://github.com/DenisStoicaa/FleetTrack/blob/627e5ec8fd9be0ad600a01fcca5e7b336e01e273/README.md#L53-L58), [ai-log/etapa-03.md](https://github.com/DenisStoicaa/FleetTrack/blob/627e5ec8fd9be0ad600a01fcca5e7b336e01e273/ai-log/etapa-03.md) | read |
| S3-R7 | commit "Stage 3" pushed                       | [627e5ec](https://github.com/DenisStoicaa/FleetTrack/commit/627e5ec8fd9be0ad600a01fcca5e7b336e01e273) | commit history |

## Stage 4 checklist

| ID    | Requirement                                   | Where (permalink) | How to check |
| ----- | --------------------------------------------- | ----------------- | ------------ |
| S4-R1 | 2+ components in src/components/              | [frontend/src/components/](https://github.com/DenisStoicaa/FleetTrack/tree/f0bacd6888962960546b95324289ccb1a62914e1/frontend/src/components) | open folder |
| S4-R2 | card receives data through props              | [TirCard.jsx#L17-L50](https://github.com/DenisStoicaa/FleetTrack/blob/f0bacd6888962960546b95324289ccb1a62914e1/frontend/src/components/TirCard.jsx#L17-L50) | read |
| S4-R3 | map + key={id}, no console warnings           | [TirList.jsx#L12-L18](https://github.com/DenisStoicaa/FleetTrack/blob/f0bacd6888962960546b95324289ccb1a62914e1/frontend/src/components/TirList.jsx#L12-L18) | F12, Console |
| S4-R4 | message for empty list                        | [TirList.jsx#L5-L8](https://github.com/DenisStoicaa/FleetTrack/blob/f0bacd6888962960546b95324289ccb1a62914e1/frontend/src/components/TirList.jsx#L5-L8) | set array to [] |
| S4-R5 | state changes the card look                   | [TirCard.jsx#L22](https://github.com/DenisStoicaa/FleetTrack/blob/f0bacd6888962960546b95324289ccb1a62914e1/frontend/src/components/TirCard.jsx#L22) (`done`), [TirCard.jsx#L48](https://github.com/DenisStoicaa/FleetTrack/blob/f0bacd6888962960546b95324289ccb1a62914e1/frontend/src/components/TirCard.jsx#L48) (status) | toggle `arrived` |
| S4-R6 | README Stage 4 section + AI log               | [README.md#L61-L69](https://github.com/DenisStoicaa/FleetTrack/blob/f0bacd6888962960546b95324289ccb1a62914e1/README.md#L61-L69), [ai-log/etapa-04.md](https://github.com/DenisStoicaa/FleetTrack/blob/f0bacd6888962960546b95324289ccb1a62914e1/ai-log/etapa-04.md) | read |
| S4-R7 | commit "Stage 4" pushed                       | [f0bacd6](https://github.com/DenisStoicaa/FleetTrack/commit/f0bacd6888962960546b95324289ccb1a62914e1) | commit history |

## Stage 5 checklist

| ID    | Requirement                                   | Where (permalink) | How to check |
| ----- | --------------------------------------------- | ----------------- | ------------ |
| S5-R1 | list kept in useState, in App                 | [frontend/src/App.jsx#L18](https://github.com/DenisStoicaa/FleetTrack/blob/f9f92ae9a7935574c900ccc35841720e615778f0/frontend/src/App.jsx#L18) | read |
| S5-R2 | toggling changes state and card look          | [frontend/src/App.jsx#L22-L26](https://github.com/DenisStoicaa/FleetTrack/blob/f9f92ae9a7935574c900ccc35841720e615778f0/frontend/src/App.jsx#L22-L26), [TirCard.jsx#L22-L30](https://github.com/DenisStoicaa/FleetTrack/blob/f9f92ae9a7935574c900ccc35841720e615778f0/frontend/src/components/TirCard.jsx#L22-L30) | click a checkbox |
| S5-R3 | delete removes the item                       | [frontend/src/App.jsx#L28-L30](https://github.com/DenisStoicaa/FleetTrack/blob/f9f92ae9a7935574c900ccc35841720e615778f0/frontend/src/App.jsx#L28-L30), [TirCard.jsx#L60-L66](https://github.com/DenisStoicaa/FleetTrack/blob/f9f92ae9a7935574c900ccc35841720e615778f0/frontend/src/components/TirCard.jsx#L60-L66) | click Șterge |
| S5-R4 | header counter derived, not in state          | [frontend/src/App.jsx#L39-L42](https://github.com/DenisStoicaa/FleetTrack/blob/f9f92ae9a7935574c900ccc35841720e615778f0/frontend/src/App.jsx#L39-L42) | toggle, watch header |
| S5-R5 | immutable updates (no push, splice, assignment) | [frontend/src/App.jsx#L21-L30](https://github.com/DenisStoicaa/FleetTrack/blob/f9f92ae9a7935574c900ccc35841720e615778f0/frontend/src/App.jsx#L21-L30) | read |
| S5-R6 | light / dark toggle: state + data-theme on html | [frontend/src/App.jsx#L32-L37](https://github.com/DenisStoicaa/FleetTrack/blob/f9f92ae9a7935574c900ccc35841720e615778f0/frontend/src/App.jsx#L32-L37), [App.jsx#L46-L53](https://github.com/DenisStoicaa/FleetTrack/blob/f9f92ae9a7935574c900ccc35841720e615778f0/frontend/src/App.jsx#L46-L53), [App.css#L706-L823](https://github.com/DenisStoicaa/FleetTrack/blob/f9f92ae9a7935574c900ccc35841720e615778f0/frontend/src/App.css#L706-L823) | click the button, both system themes |
| S5-R7 | no console warnings; README + AI log          | [README.md#L72-L81](https://github.com/DenisStoicaa/FleetTrack/blob/f9f92ae9a7935574c900ccc35841720e615778f0/README.md#L72-L81), [ai-log/etapa-05.md](https://github.com/DenisStoicaa/FleetTrack/blob/f9f92ae9a7935574c900ccc35841720e615778f0/ai-log/etapa-05.md) | F12, Console |
| S5-R8 | commit "Stage 5" pushed                       | [f9f92ae](https://github.com/DenisStoicaa/FleetTrack/commit/f9f92ae9a7935574c900ccc35841720e615778f0) | commit history |

## Stage 6 checklist

| ID    | Requirement                                   | Where (permalink) | How to check |
| ----- | --------------------------------------------- | ----------------- | ------------ |
| S6-R1 | npm run api starts, route shows JSON          | [frontend/package.json#L11](https://github.com/DenisStoicaa/FleetTrack/blob/8ac44851ac61040a8f800382a5d7e34b465ef9db/frontend/package.json#L11) (script), [#L26](https://github.com/DenisStoicaa/FleetTrack/blob/8ac44851ac61040a8f800382a5d7e34b465ef9db/frontend/package.json#L26) (json-server 0.17.4), [frontend/db.json](https://github.com/DenisStoicaa/FleetTrack/blob/8ac44851ac61040a8f800382a5d7e34b465ef9db/frontend/db.json) | `npm run api`, open localhost:3001/tiruri |
| S6-R2 | data no longer in React code                  | [frontend/src/App.jsx#L14](https://github.com/DenisStoicaa/FleetTrack/blob/8ac44851ac61040a8f800382a5d7e34b465ef9db/frontend/src/App.jsx#L14) (`useState([])`) | read |
| S6-R3 | loading message while waiting                 | [frontend/src/App.jsx#L15](https://github.com/DenisStoicaa/FleetTrack/blob/8ac44851ac61040a8f800382a5d7e34b465ef9db/frontend/src/App.jsx#L15), [App.jsx#L128](https://github.com/DenisStoicaa/FleetTrack/blob/8ac44851ac61040a8f800382a5d7e34b465ef9db/frontend/src/App.jsx#L128) | `--delay 4000` |
| S6-R4 | error message when API is down                | [frontend/src/App.jsx#L22-L40](https://github.com/DenisStoicaa/FleetTrack/blob/8ac44851ac61040a8f800382a5d7e34b465ef9db/frontend/src/App.jsx#L22-L40) (effect), [App.jsx#L129-L133](https://github.com/DenisStoicaa/FleetTrack/blob/8ac44851ac61040a8f800382a5d7e34b465ef9db/frontend/src/App.jsx#L129-L133) | stop `npm run api`, refresh |
| S6-R5 | fetch only in api.js, URL from env            | [frontend/src/api.js#L3-L13](https://github.com/DenisStoicaa/FleetTrack/blob/8ac44851ac61040a8f800382a5d7e34b465ef9db/frontend/src/api.js#L3-L13), [frontend/.env.example](https://github.com/DenisStoicaa/FleetTrack/blob/8ac44851ac61040a8f800382a5d7e34b465ef9db/frontend/.env.example) | search for `fetch` |
| S6-R6 | README Stage 6 section + AI log               | [README.md#L90-L106](https://github.com/DenisStoicaa/FleetTrack/blob/8ac44851ac61040a8f800382a5d7e34b465ef9db/README.md#L90-L106), [ai-log/etapa-06.md](https://github.com/DenisStoicaa/FleetTrack/blob/8ac44851ac61040a8f800382a5d7e34b465ef9db/ai-log/etapa-06.md) | read |
| S6-R7 | commit "Stage 6" pushed                       | [8ac4485](https://github.com/DenisStoicaa/FleetTrack/commit/8ac44851ac61040a8f800382a5d7e34b465ef9db) | commit history |

## Stage 7 checklist

| ID    | Requirement                                   | Where (permalink) | How to check |
| ----- | --------------------------------------------- | ----------------- | ------------ |
| S7-R1 | controlled form: value + onChange on every field | [TirForm.jsx#L86-L171](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/frontend/src/components/TirForm.jsx#L86-L171) | read |
| S7-R2 | empty title shows an error, nothing is sent   | [TirForm.jsx#L43-L54](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/frontend/src/components/TirForm.jsx#L43-L54) (`valideaza`), [TirForm.jsx#L57-L65](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/frontend/src/components/TirForm.jsx#L57-L65) | submit empty, watch Network |
| S7-R3 | added item shows in the list and survives refresh | [App.jsx#L45-L48](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/frontend/src/App.jsx#L45-L48) (`handleAdd`), [api.js#L7-L27](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/frontend/src/api.js#L7-L27) | add, refresh |
| S7-R4 | toggle and delete survive refresh             | [App.jsx#L51-L71](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/frontend/src/App.jsx#L51-L71), [api.js#L29-L40](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/frontend/src/api.js#L29-L40) | toggle/delete, refresh |
| S7-R5 | button disabled while sending, form cleared only on success | [TirForm.jsx#L67-L81](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/frontend/src/components/TirForm.jsx#L67-L81), [TirForm.jsx#L168](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/frontend/src/components/TirForm.jsx#L168) | `--delay 3000`; stop API and submit |
| S7-R6 | tw.json and the data-testid attributes from table 7.3 | [tw.json](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/tw.json), [TirCard.jsx#L40-L137](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/frontend/src/components/TirCard.jsx#L40-L137), [TirForm.jsx#L86-L171](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/frontend/src/components/TirForm.jsx#L86-L171), [TirList.jsx#L11](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/frontend/src/components/TirList.jsx#L11), [App.jsx#L159-L167](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/frontend/src/App.jsx#L159-L167) | querySelectorAll in the console |
| S7-R7 | README Stage 7 section + AI log               | [README.md#L109-L130](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/README.md#L109-L130), [ai-log/etapa-07.md](https://github.com/DenisStoicaa/FleetTrack/blob/d9de296135b32a3402d5215e09784bfc5dab965f/ai-log/etapa-07.md) | read |
| S7-R8 | commit "Stage 7" pushed                       | [d9de296](https://github.com/DenisStoicaa/FleetTrack/commit/d9de296135b32a3402d5215e09784bfc5dab965f) | commit history |

## Stage 8 checklist

| ID    | Requirement                                   | Where (permalink) | How to check |
| ----- | --------------------------------------------- | ----------------- | ------------ |
| S8-R1 | header navigation changes page without reload | [App.jsx#L11-L23](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/App.jsx#L11-L23), [Layout.jsx#L29-L66](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/components/Layout.jsx#L29-L66) | click links, watch Network |
| S8-R2 | click on an item opens its detail page        | [TirCard.jsx#L52-L63](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/components/TirCard.jsx#L52-L63), [TirDetaliuPage.jsx](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/pages/TirDetaliuPage.jsx) | click a title |
| S8-R3 | refresh on the detail URL works; missing id shows an error | [TirDetaliuPage.jsx#L17-L64](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/pages/TirDetaliuPage.jsx#L17-L64), [api.js#L24-L27](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/api.js#L24-L27) | refresh /tiruri/1, open /tiruri/999 |
| S8-R4 | unknown URL shows the app 404 page            | [App.jsx#L19](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/App.jsx#L19) (`path="*"`), [NotFoundPage.jsx](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/pages/NotFoundPage.jsx) | open /ceva |
| S8-R5 | each component has its .module.css; index.css only shared styles | [src/components](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/components), [src/pages](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/pages), [index.css](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/index.css) | read |
| S8-R6 | data-testid attributes from tables 7.3 and 8.2; detail route /<resource>/:id | [tw.json](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/tw.json), [App.jsx#L16](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/App.jsx#L16), [Layout.jsx#L37](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/components/Layout.jsx#L37), [TirCard.jsx#L12-L120](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/components/TirCard.jsx#L12-L120), [TirDetaliuPage.jsx#L43-L138](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/pages/TirDetaliuPage.jsx#L43-L138), [NotFoundPage.jsx#L7](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/frontend/src/pages/NotFoundPage.jsx#L7) | querySelector in the console |
| S8-R7 | README Stage 8 section + AI log               | [README.md#L133-L159](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/README.md#L133-L159), [ai-log/etapa-08.md](https://github.com/DenisStoicaa/FleetTrack/blob/36bec87514b6ed301d977cbf08a9f5e0ef723d1f/ai-log/etapa-08.md) | read |
| S8-R8 | commit "Stage 8" pushed                       | [36bec87](https://github.com/DenisStoicaa/FleetTrack/commit/36bec87514b6ed301d977cbf08a9f5e0ef723d1f) | commit history |
