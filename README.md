# Roguelike Config

This project is a simple web-based roguelike.

## Configuration
`src/config.js` exposes tunable parameters:

- **eventChances** – probabilities for dungeon events (`monster`, `chest`, `potion`, `exit`).
- **eventLimit** – maximum number of events per run.
- **rewards** – coin and healing ranges for monsters, chests and potions.
- **monsterStats** – minimum and maximum primary attributes for generated monsters.
- **initialStats** – starting primary attributes for a new hero.
- **initialCoins** – how many coins the hero begins with.
- **statPoints** – free points available to allocate during creation.

Adjust these values to tweak game balance.

## Formulas
- **Attack** = `min(10, Strength)`
- **HP** = `min(100, Endurance × 5)`
- **MP** = `min(100, Intellect × 5)`

## Patch Notes
- Removed dodge and accuracy checks; all attacks now land.
- Added a shop in the hero room to buy stat and HP boosts.
- Potions are consumed immediately on discovery.
- Added "exit" event (~3% chance) returning the hero to the room and capped runs to 20 events.
- Moved all event and monster parameters into `src/config.js` for easier tuning.
- Added tests for attack resolution and updated combat logic accordingly.
