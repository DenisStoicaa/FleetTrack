# Stage 2: AI log

## Tools
- Claude (Claude Code)

## Conversations
- [exported conversation](etapa-02-conversatie.md)  (local session, no share link; reading the Stage 2 guide and writing the data logic for FleetTrack)

## Key requests
### 1. Adapting the names to FleetTrack
- Asked: help me do Stage 2 following the guide, adapted to FleetTrack.
- Got: file `tiruri.js`, array `tiruri`, fixed values `TIPURI_REMORCA` (refrigerated, curtainsider, tanker) and `CATEGORII` (Domestic, EU, Non-EU), functions `numaraInTranzit`, `comutaSosit`, `cautaTir` (search by name, driver or destination).
- Changed or rejected: kept the field names in English (`name`, `arrived`, `trailerType`), the same as in the README data model, and only the function names in Romanian, as in the guide. Added the route category (Berlin → EU, Cluj-Napoca → Domestic, Istanbul → Non-EU) so the sample data matches the README.

### 2. Immutable functions and the next id
- Asked: write list, count, search, add, toggle and delete without changing the original array.
- Got: functions built on `map`, `filter` and `reduce`, spread for new arrays (`[...lista, nou]`) and objects (`{ ...t, arrived: !t.arrived }`), `nextId` as max id + 1.
- Changed or rejected: added an extra console line, `Id-ul următorului tir`, after the delete test, to show that the next id is 5 and not 4 (the `lista.length + 1` version would give a duplicate id).

### 3. Validation and console tests
- Asked: validate the new truck and test everything in the console, grouped in sections.
- Got: `adaugaTir` rejects an empty name, a name over 100 chars, an unknown trailer type or category and a driver/destination over 60 chars; tests grouped in Citire / Adăugare / Modificare și ștergere / Validare.
- Changed or rejected: the search tests use "volvo" and "cluj" instead of "tema", to check both the name and the destination; the invalid trailer type test uses "basculantă".

## What I learned / what did not work
cum map, filter și reduce întorc date noi fără să modifice array-ul inițial, de ce id-ul nou se calculează ca maxim plus unu (lista.length + 1 dă id-uri duplicate după ștergere), cum spread-ul (...) creează un array sau un obiect nou, de ce React are nevoie de o referință nouă ca să redeseneze interfața, cum se citesc mesajele și linia de cod în fila Console din DevTools
