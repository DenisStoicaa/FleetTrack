# Stage 3: AI log

## Tools
- Claude (Claude Code)

## Conversations
- [exported conversation](etapa-03-conversatie.md)  (local session, no share link; reading the Stage 3 guide and moving FleetTrack to Vite + React)

## Key requests
### 1. Creating the Vite project
- Asked: help me do Stage 3 following the guide: move the old files to `mockup/` and create the React project in `frontend/`.
- Got: `npm create vite@latest frontend -- --template react`; the newer create-vite picked Oxlint by default, so the project was recreated with the `--eslint` flag to use ESLint, as the guide asks. Then `npm install` (0 vulnerabilities) and `npm run dev`.
- Changed or rejected: rejected the Oxlint default and kept ESLint, the linter the guide asks for. The stage 1–2 files were moved with `git mv` instead of a plain `mv`, so Git records them as renamed and keeps their history. The empty `public/` folder was left out, because nothing uses it after the icons were removed.

### 2. Removing the demo files and reusing the stage 1 styles
- Asked: delete the Vite demo files and bring back the stage 1 CSS.
- Got: deleted `src/assets/`, `public/favicon.svg`, `public/icons.svg`, `src/index.css`; `mockup/style.css` copied into `src/App.css` with `.container` on one column (`1fr`); `main.jsx` imports `App.css` instead of `index.css`.
- Changed or rejected: kept the Google Fonts link (Archivo, JetBrains Mono) in `frontend/index.html`, otherwise the stage 1 styles would fall back to system fonts.

### 3. The App component
- Asked: write `App.jsx` with the stage 2 data and the header computed from data.
- Got: the `tiruri` array above the function, `inTranzit`, `sosite` and `internationale` calculated with `filter`, the header from the mockup with `className` and values in braces, the list printed with `JSON.stringify(tiruri, null, 2)` inside `<pre>`.
- Changed or rejected: used the FleetTrack data from the README instead of the TaskFlow example (`tiruri` instead of `taskuri`, `arrived` instead of `gata`). The counter says "3 tiruri, dintre care 2 în tranzit" instead of "active". I kept all four stat tiles from the mockup (total, in transit, arrived, international routes), each computed from the array, plus the `count-pill` and the footer, instead of only the counter from the guide. International routes are the trucks whose category is not Domestic.

## What I learned / what did not work
cum package.json ține lista de pachete și comenzile dev, build și lint, de ce node_modules nu se urcă pe Git (se recreează cu npm install, iar .gitignore din frontend îl exclude), de ce aplicația se deschide la localhost:5173 și nu prin dublu clic (fișierele se încarcă prin import), diferențele dintre HTML și JSX (className în loc de class, etichete închise ca `<path />`, expresii între acolade, fragmentul `<>...</>`, comentarii `{/* */}`), de ce array-ul fix stă deasupra funcției App (funcția se reapelează la fiecare desenare), cum main.jsx montează App în `<div id="root">`. Ce nu a mers din prima: create-vite a pus Oxlint în loc de ESLint, așa că proiectul a fost recreat cu `--eslint`; importul lui index.css din main.jsx trebuia înlocuit cu App.css imediat după ștergere, altfel pagina rămânea albă cu eroare 404.
