# Roguelike Config

This project is a simple web-based roguelike.

## Configuration
`src/config.js` exposes tunable parameters:

- **eventChances** – probabilities for dungeon events (`monster`, `chest`, `potion`, `exit`).
- **eventLimit** – maximum number of events per run.
- **rewards** – coin and healing ranges for monsters, chests and potions.
- **monsterStats** – minimum and maximum primary attributes for generated monsters.

Adjust these values to tweak game balance.

## Patch Notes
- Revised dodge mechanics to compare d20 rolls against Strength and Dodge, skipping dodge when the attack roll fails.
- Potions are consumed immediately on discovery.
- Added "exit" event (~3% chance) returning the hero to the room and capped runs to 20 events.
- Moved all event and monster parameters into `src/config.js` for easier tuning.
- Added tests for attack resolution and updated combat logic accordingly.
