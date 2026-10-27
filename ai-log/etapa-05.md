# Stage 5: AI log

## Tools
- Claude

## Conversations
- [shared conversation](https://claude.ai/share/bafc3918-ff33-47a3-a5a2-6813306207d0)  (reading the Stage 5 guide and making the FleetTrack list interactive)

## Key requests
### 1. The list in state and the change functions
- Asked: help me do Stage 5 following the guide; the list must stay in the state of `App` and change only through immutable functions.
- Got: in `App.jsx` the `useState` import, the array renamed to `TIRURI_INITIALE` (only the initial value), `const [tiruri, setTiruri] = useState(TIRURI_INITIALE)`, and the two functions in the `setTiruri((prev) => ...)` form: `handleToggleSosit` (`map` + `{ ...t, arrived: !t.arrived }`) and `handleDelete` (`filter`). The counter and the four stat tiles stay derived values, computed from `tiruri` before `return`.
- Changed or rejected: used the FleetTrack names instead of the TaskFlow example (`tiruri` / `setTiruri`, `arrived` instead of `gata`, `handleToggleSosit` instead of `handleToggle`). The props keep the generic names `onToggle` / `onDelete`, as the guide asks. No separate state for "in transit": it would get out of sync with the list.

### 2. Checkbox and delete button in the card
- Asked: pass the functions through `TirList` and add the controlled checkbox and the delete button to `TirCard`.
- Got: `TirList` receives `onToggle` and `onDelete` and gives them to every `TirCard`; the card wraps the checkbox and the text in `<label className="item-main">` and has `checked={tir.arrived}` with `onChange={() => onToggle(tir.id)}`, plus a `btn-danger` button with `onClick={() => onDelete(tir.id)}` and `aria-label={`Șterge ${numar}`}`.
- Changed or rejected: the status pill ("În tranzit / Sosit") stays, next to the button, in a new `item-actions` group. The checkbox also has its own `aria-label` (`"B 101 FLT a sosit"`), because the label wraps the whole card and a screen reader would otherwise read all of it. The checkbox uses the green `--done` color, since checked means "arrived". The red of the button comes from a new `--danger` variable (one value per theme) instead of `--mare`, which does not exist in this project. On a 375px screen the checkbox made the panel 11px too wide, so on narrow screens the gap is smaller and the driver → destination line may wrap.

### 3. Light / dark toggle
- Asked: add the theme button in the header (step 8).
- Got: `temaInitiala()` read from `matchMedia`, `const [tema, setTema] = useState(temaInitiala)`, `handleTema` that writes `document.documentElement.dataset.theme`, and the button with `aria-pressed` and a text derived from state ("Mod întunecat" / "Mod luminos").
- Changed or rejected: the stage 1 dark theme also had a few component rules inside `@media` (body background, `.brand-mark`, `.stat`, `.stat-transit`, `.item-card`, `.plate`, `.count-pill`). Instead of copying them for `[data-theme="dark"]`, each difference became a variable (`--page-glow`, `--brand-shadow`, `--stat-transit-bg`, `--card-border`, `--plate-border`, `--pill-bg` …), so both blocks — `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` and `:root[data-theme="dark"]` — only redefine variables. The header in light mode is light, so the button uses the header variables (`--stat-bg`, `--stat-border`, `--on-header`) instead of the white border from the example.

### 4. Testing
- Asked: check the cases from steps 6–8.
- Got: checking B 101 FLT makes the card green ("Sosit") and the header goes from "2 în tranzit" to 1; clicking the text of a card also toggles it; deleting all three shows "Nu există niciun tir în flotă." and 0 in the header; the button switches the theme both ways, starting from a light and from a dark system theme (`data-theme` changes on `<html>`, `aria-pressed` follows). The console has no warnings; `npm run build` passes.
- Changed or rejected: nothing kept from the tests; the data is the original one from the README.

## What I learned / what did not work
cum se păstrează datele unei componente în state cu `useState`, unde array-ul de la început este doar valoarea inițială; de ce state-ul nu se modifică direct (`push`, `t.arrived = ...`), ci se dă `setTiruri` o listă nouă, construită cu `map` și `filter`, iar forma cu funcție `setTiruri((prev) => ...)` primește mereu cea mai recentă valoare; că state-ul stă în componenta părinte (`App`), iar copiii primesc funcții prin props și doar le apelează (datele coboară, acțiunile urcă); diferența dintre o valoare din state și una derivată (numărul de tiruri în tranzit se calculează la fiecare randare); checkbox-ul controlat are nevoie și de `checked`, și de `onChange`; de ce `onClick={() => onDelete(tir.id)}` și nu `onClick={onDelete(tir.id)}` (a doua formă apelează funcția la randare); `aria-label` pentru butoane și câmpuri al căror text nu ajunge; comutarea temei cu un atribut pe `<html>` și variabile CSS. Ce nu a mers din prima: tema întunecată din Etapa 1 avea și reguli pe componente în `@media`, care ar fi trebuit copiate pentru butonul de temă, așa că au fost transformate în variabile; pe ecran îngust checkbox-ul a lățit cardul peste margine.
