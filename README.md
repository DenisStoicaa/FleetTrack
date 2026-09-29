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

Details per stage: see the [ai-log/](ai-log/) folder.

## Status

- [x] Stage 1: static mockup
- [ ] Stage 2: data logic in JavaScript
