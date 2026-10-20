# Stage 4: AI log

## Tools
- Claude

## Conversations
- [shared conversation](https://claude.ai/share/4475b916-9221-4805-9a95-4471ee18b84b)  (reading the Stage 4 guide and splitting the FleetTrack list into components)

## Key requests
### 1. The card component
- Asked: help me do Stage 4 following the guide: one component for a single truck, built from the stage 1 mockup.
- Got: `src/components/TirCard.jsx`, which receives `tir` through props and returns the same `<li class="item-card">` markup as the mockup: plate, model, driver → destination, trailer badge with icon, category tag and status.
- Changed or rejected: used the FleetTrack names instead of the TaskFlow example (`TirCard` / `TirList`, prop `tiruri`, `arrived` instead of `gata`, "În tranzit / Sosit" instead of "Activ / Gata"). The `name` field ("B 101 FLT · Volvo FH16") is split at " · " so the plate number and the model go in different places, like in the mockup. The trailer labels are kept in `ETICHETE_REMORCA`, separate from the data values; the badge icons are kept in `ICONITE_REMORCA` for the same reason.

### 2. The list component and App
- Asked: render one card per item and show a message when the list is empty; replace the `<pre>{JSON.stringify(...)}</pre>` block in `App.jsx`.
- Got: `src/components/TirList.jsx` with an early `return <p className="empty">…</p>` for an empty array and `tiruri.map((tir) => <TirCard key={tir.id} … />)` inside `<ul className="item-list">`; in `App.jsx` the import and `<TirList tiruri={tiruri} />`.
- Changed or rejected: the empty message is the one already written in the mockup comment ("Nu există niciun tir în flotă."). The mockup sets `style="--i: 0/1/2"` on each card for the staggered entry animation, so the position from `map` is passed as a separate `pozitie` prop only for that style; the `key` stays the `id`, as the guide asks.

### 3. Testing the special cases
- Asked: check the cases from step 5.
- Got: with `key` removed the console shows "Each child in a list should have a unique "key" prop … Check the render method of `TirList`", which disappears when it is put back; with `tiruri = []` the page shows the empty message and the header shows 0; with `arrived: true` on truck 1 its card turns green with "Sosit" and the header shows 1 in transit. With the original data the console only has the React DevTools info message. `npm run lint` and `npm run build` pass.
- Changed or rejected: all test changes were undone; the data is the original one from the README.

## What I learned / what did not work
cum se împarte interfața în componente, câte una pe fișier în `src/components/`, cu numele fișierului identic cu al componentei și cu `export default`; cum ajung datele de la părinte la copil prin props (`<TirList tiruri={tiruri} />` și `function TirList({ tiruri })`), unde numele din stânga trebuie să fie același cu cel destructurat, altfel copilul primește `undefined`; că props-urile se citesc doar, iar cardul nu modifică tirul primit; cum se randează o listă cu `map` și de ce `key` se pune pe componenta întoarsă direct din `map` și are ca valoare id-ul, nu poziția (poziția se schimbă la ștergere, id-ul nu); randarea condiționată cu `return` timpuriu pentru lista goală și cu operatorul `? :` pentru „Sosit / În tranzit” și pentru clasa `done`; cum se construiește numele clasei din date cu template string (`badge-${tir.trailerType}`) și de ce etichetele afișate („Frigorifică”) stau separat de valorile din date (`refrigerated`); cum se recunoaște în consolă avertismentul pentru `key` lipsă, care indică și componenta vinovată (`TirList`). Ce nu a mers din prima: câmpul `name` conține și numărul, și modelul, așa că a trebuit despărțit cu `split(" · ")` ca să arate ca în mockup; animația din mockup folosea `style="--i: 0"`, care în JSX devine obiect (`style={{ "--i": pozitie }}`), iar poziția a fost trimisă ca prop separat, fără să fie folosită ca `key`; `npm run build` nu a mers în mediul Linux de test, pentru că `node_modules` era instalat pe Windows, așa că verificarea s-a făcut pe o copie cu pachetele reinstalate.
