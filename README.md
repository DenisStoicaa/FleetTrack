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

## How to run

```bash
cd frontend
npm install
npm run dev
```

Then open the address printed in the terminal (http://localhost:5173).
The stage 1–2 static files (HTML mockup, CSS, `tiruri.js`) are kept in `mockup/`.

## AI usage

| Tool   | Used for                                                                                   |
| ------ | ------------------------------------------------------------------------------------------ |
| Claude | stage 1: reading the stage guide, drafting the README, HTML structure and CSS (Grid, Flexbox, variables, dark theme) |
| Claude | stage 2: reading the stage guide, writing `tiruri.js` (array of objects, map/filter/find/reduce, immutable functions, validation, console tests) |
| Claude | stage 3: reading the stage guide, creating the Vite + React project, removing the demo files, writing `App.jsx` with the header computed from data |
| Claude | stage 4: reading the stage guide, splitting the list into `TirList` and `TirCard`, rendering the cards from data with `map` and `key`, testing the special cases (missing key, empty list, state change) |
| Claude | stage 5: reading the stage guide, moving the list into `useState`, the immutable `handleToggleSosit` / `handleDelete` functions passed down through props, the controlled checkbox and the delete button in `TirCard`, the light / dark toggle with `data-theme` |

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
Changes are lost on refresh, which is what stage 6 and stage 10 fix.

## Status

- [x] Stage 1: static mockup
- [x] Stage 2: data logic in JavaScript
- [x] Stage 3: Vite and React project
- [x] Stage 4: components rendered from data
- [x] Stage 5: local state and events
- [ ] Stage 6: loading data from a mock API

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
