# City of Angels — 3D LA Driving

A single-file, zero-dependency 3D Los Angeles free-drive built with Three.js (loaded from CDN via importmap). Golden-hour smog light, a downtown glass-tower canyon, palm-lined boulevards, live traffic, and the Hollywood sign on the hills to the north.

Just open `index.html` — no build step.

## Controls
- **W / ↑** throttle · **S / ↓** brake / reverse
- **A D / ← →** steer · **SPACE** drift
- **C** cycle camera (chase / hood / cinematic orbit)
- **R** reset to last safe spot · **H** jump to the Hollywood sign
- Touch controls appear automatically on mobile.

## What's in the world
- Procedural 13×13 city grid — buildings grow taller toward downtown, a central plaza with a fountain and palms
- Emissive-window skyscrapers with rooftop beacons, sidewalks, dashed lane markings
- ~46 AI traffic cars looping the avenues, live minimap
- Layered distant mountains + the HOLLYWOOD sign seated on displaced hill terrain
- Golden-hour sky shader, ACES tone mapping, bloom

## Tech
Single `index.html`, `three@0.160.0` from unpkg. Deterministic procedural generation (seeded RNG) so the city is identical every load.
