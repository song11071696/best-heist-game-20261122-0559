# The Meridian Vault

A top-down 2D stealth heist game. You are **Wren**, the thief. Three museum rooms stand between you and the Meridian Diamond — patrolling guards with vision cones, sweeping wall cameras, and an alarm meter that climbs every second you are seen. Get in, grab the loot, get out.

## How to play
- **WASD / arrow keys** — move
- **Shift** — sneak (slower, harder to spot)
- **Click** — toss a coin to lure a guard away (3 per room)
- **E** (or walk over) — grab loot
- **R** — restart the current room
- **Enter** — start / continue

## The rooms
1. **The Gallery** — lift the gallery pieces, learn the patrols.
2. **The Vault Corridor** — watched end to end; weave between the lanes.
3. **The Vault** — the Meridian Diamond ($5,000) sits on the central plinth. Take it, then reach the green exit door for the clean getaway.

## Rules
- Red cones are guard vision, orange cones are cameras. Break line of sight behind a green display case or pillar to cool the alarm down.
- A guard that glimpses you gets suspicious and comes to look; a guard that holds you in sight locks on and chases. If one touches you, or the alarm hits 100%, you are caught and lose a life (3 lives).
- Small loot is optional; the Diamond is required to open the Vault exit.
- Score is loot value plus a time bonus for a fast getaway.

## Run it
```sh
node serve.ts
```
Then open http://localhost:8080 in desktop Chrome. No build step, no network requests — every file the game loads lives under `game/`, and all sound is synthesized live with WebAudio.

## Files
- `game/index.html` — page shell
- `game/src/config.js` — tuning constants
- `game/src/random.js` — seeded RNG for staged shots and replays
- `game/src/input.js` — keyboard + mouse
- `game/src/audio.js` — WebAudio synth effects and alarm loop
- `game/src/levels.js` — the three room layouts, patrols, loot, cameras
- `game/src/world.js` — state, guard AI, detection, alarm, win/lose
- `game/src/render.js` — canvas drawing: room, cones, HUD, screens
- `game/src/shots.js` — deterministic staged scenes for screenshots
- `game/src/main.js` — game loop and screens

Original game, art, sound and names — no commercial game is referenced or copied. Licensed under the MIT License.
