# City of Angels — 3D LA Driving

A 3D Los Angeles free-drive: golden-hour downtown tower canyon, palm-lined boulevards, live traffic, 9 signature LA landmarks (US Bank Tower, City Hall, Capitol Records, Walt Disney Concert Hall, Griffith Observatory, Randy's Donuts, LAX Theme Building, Dodger Stadium, the Hollywood Sign), and a landmark **tour mode**.

Open `index.html` — no build step.

## Built on the shared engine

This game runs on **[golden-hour-engine](https://github.com/icomppower/golden-hour-engine)** — the shared 3D city-driving engine. The engine (a vendored copy of `engine.js`) provides controls, physics, cameras, HUD, minimap and tour mode; this repo only supplies the LA world in `cities/los_angeles.js`. To refresh the engine: `../golden-hour-engine/sync.sh .`

## Controls
- **W / ↑** throttle · **S / ↓** brake / reverse
- **A D / ← →** steer · **SPACE** drift
- **C** camera (chase / hood / cinematic) · **R** reset · **T** landmark tour
- Touch controls appear automatically on mobile.
