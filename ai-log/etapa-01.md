# Stage 1: AI log

## Tools
- Claude (Claude Code)

## Conversations
- <[share link](https://claude.ai/code/session_01SSKczkaWGnDNPZRz64GzRx)>  (reading the Stage 1 guide and building the FleetTrack mockup)

## Key requests
### 1. Choosing the data model
- Asked: help me do Stage 1 for FleetTrack, an app that tracks trucks (TIR).
- Got: a data model where each item is a truck: name (plate + model), arrived yes/no, trailer type (refrigerated, curtainsider, tanker), route category (Domestic, EU, Non-EU), dispatcher as owner, plus driver and destination.
- Changed or rejected: <what I changed, e.g. other trailer types or sample trucks>

### 2. HTML structure and CSS layout
- Asked: create index.html and style.css following the guide (header, form, 3 cards, Grid 1fr 2fr, @media 700px).
- Got: a semantic page (header, main, section, footer) with Flexbox inside the form and the cards, all colors in CSS variables.
- Changed or rejected: <what I changed, e.g. the accent color>

### 3. Dark theme and focus
- Asked: add hover states, visible focus and a dark theme.
- Got: `:focus-visible` outline and a `prefers-color-scheme: dark` block that only redefines the variables.
- Changed or rejected: <what I changed>

## What I learned / what did not work
cum împarte grid-template-columns: 1fr 2fr pagina în două coloane, cum o trece @media (max-width: 700px) pe o singură coloană, de ce tema întunecată merge doar pentru că toate culorile sunt variabile
