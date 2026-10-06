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

Open `index.html` in a browser. No build step, no server.

## AI usage

| Tool   | Used for                                                                                   |
| ------ | ------------------------------------------------------------------------------------------ |
| Claude | stage 1: reading the stage guide, drafting the README, HTML structure and CSS (Grid, Flexbox, variables, dark theme) |
| Claude | stage 2: reading the stage guide, writing `tiruri.js` (array of objects, map/filter/find/reduce, immutable functions, validation, console tests) |

Details per stage: see the [ai-log/](ai-log/) folder.

## Stage 2: data logic

Plain JavaScript, no DOM. `tiruri.js` holds the `tiruri` array and the functions
that read and change it: `listeazaNume`, `numaraInTranzit`, `cautaTir` (by name, driver or destination),
`adaugaTir` (with validation), `comutaSosit`, `stergeTir` and `nextId`.
None of the functions changes the list it receives; each one returns a new list.
Results are printed in the browser console (F12).

## Status

- [x] Stage 1: static mockup
- [x] Stage 2: data logic in JavaScript
- [ ] Stage 3: Vite and React project

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
