# Stage 7: AI log

## Tools
- Claude

## Conversations
- [shared conversation](https://claude.ai/share/017e4108-7284-4fc1-8cfa-9f5ebdb3fe89)  (reading the Stage 7 guide, adding the truck form and saving every change on the mock API)

## Key requests
### 1. api.js with a shared request function
- Asked: help me do Stage 7 following the guide; extend `api.js` with the POST, PATCH and DELETE requests.
- Got: `request(path, options)` that spreads `options`, sets `Content-Type: application/json`, throws `Eroare server: <status>` when `res.ok` is false and returns `null` for `204`; on top of it `fetchTiruri`, `createTir`, `updateTir(id, changes)` and `deleteTir(id)` on `/tiruri`.
- Changed or rejected: the FleetTrack names instead of TaskFlow (`tiruri`, `createTir` / `updateTir` / `deleteTir`).

### 2. The TirForm component
- Asked: a controlled form for a new truck, validated in code, with the error next to the form.
- Got: `TirForm.jsx` with one `valori` state object and one `handleChange` for all fields (by `name`), `noValidate`, `e.preventDefault()`, a `trimite` state that disables the button ("Se salvează..."), clearing only after `await onAdd(...)` succeeds and `finally` re-enabling the button.
- Changed or rejected: the guide's form has only a title and a select; FleetTrack has five fields from the data model (plate and model, trailer type, route category, driver, destination). Extra validations specific to the theme: driver required, max 50 characters and letters only (`\p{L}`, so diacritics work); destination required, max 50. `aria-invalid` marks the field that is actually wrong, not only the title. The title field does not require the "plate · model" format, because the automatic check types any title; instead `TirCard` and `TirMap` now show a name without " · " whole.

### 3. Saving add / toggle / delete on the server
- Asked: move toggling and deleting to the server and add the new truck only after the server answers.
- Got: `handleAdd` without `try` (the error goes back to the form), `handleToggleSosit` with `updateTir(id, { arrived: !tir.arrived })` and the server's object put in the list, `handleDelete` with `deleteTir` before `filter`; the list is shown with `!loading` only, so a failed toggle keeps it on screen under the error.
- Changed or rejected: the stage 6 error message was built in JSX for the loading case only; now `error` holds the full message ("Nu am putut încărca / actualiza / șterge tirul: ..."). Deleting the truck open on the map also closes the map.

### 4. tw.json and data-testid
- Asked: prepare the app for the automatic check.
- Got: `tw.json` with `"resource": "tiruri"`, `"title": "name"`, `"done": "arrived"` and a `sample` for the four other fields; the attributes from table 7.3 on `TirForm`, `TirCard`, `TirList` and `App` (`form-trailerType`, `form-category`, `form-driver`, `form-destination` after the `db.json` field names).
- Changed or rejected: the card title shows only the model (the plate is on the photo), so `item-title` has the plate in a visually hidden span; its text is exactly `tir.name`.

### 5. Testing
- Asked: check the cases from step 7.
- Got: empty submit shows the error and sends no request; a new truck appears at the end of the list, is saved in `db.json` with the id from json-server and survives a refresh; toggle and delete survive a refresh; with `--delay` the button is disabled and reads "Se salvează..."; with the API stopped the form shows "Nu am putut salva tirul: Failed to fetch" and keeps the typed text. `npm run lint` and `npm run build` pass.
- Changed or rejected: nothing kept from the tests; `db.json` has the original five trucks.

## What I learned / what did not work
cum funcționează un formular controlat (valoarea fiecărui câmp stă în state, iar `onChange` o actualizează la fiecare tastă) și că un singur obiect `valori` cu un `handleChange` după atributul `name` merge pentru toate cele cinci câmpuri; că `e.preventDefault()` trebuie să fie primul rând din trimitere, altfel pagina se reîncarcă și se pierde tot; ce face fiecare metodă HTTP pe aceeași rută (`POST /tiruri` fără id, `PATCH /tiruri/:id` doar cu câmpul schimbat, `DELETE /tiruri/:id`) și de ce merită o singură funcție `request` pentru toate; regula „întâi serverul, apoi state-ul”: în listă se pune obiectul întors de server, cu id-ul dat de json-server, nu ce am trimis eu; de ce golirea formularului se face după `await` (doar dacă salvarea a reușit) și de ce `handleAdd` nu prinde eroarea (ca ea să ajungă înapoi în formular, lângă câmpuri); cum se previne trimiterea dublă cu un state `trimite` care dezactivează butonul, repus în `finally`; ce sunt `tw.json` și `data-testid` și că nu schimbă nimic din aspectul paginii. Ce nu a mers din prima: verificarea automată scrie un titlu oarecare, fără „ · ”, iar cardul și harta afișau doar modelul (partea de după „ · ”), deci un tir nou ar fi apărut fără titlu; acum un nume fără separator se afișează întreg, iar `item-title` conține exact `tir.name`. Tot așa, mesajul de eroare din etapa 6 era scris doar pentru încărcare, așa că a trebuit refăcut ca să meargă și pentru bifare și ștergere.
