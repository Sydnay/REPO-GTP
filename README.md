# Roguelike Config

This project is a simple web-based roguelike.

## Configuration
`src/config.js` exposes tunable parameters:

- **levelCount** – number of dungeon floors.
- **eventsPerLevel** – how many events occur on each floor before the boss.
- **eventChances** – probabilities for safe zones, potions, monster rarities, chests and teleport stones.
- **rewards** – coin ranges for monsters and chests.
- **monsterK** – stat multipliers per monster rarity.
- **initialStats** – starting primary attributes for a new hero.
- **initialCoins** – how many coins the hero begins with.
- **statPoints** – free points available to allocate during creation.

Adjust these values to tweak game balance.

## Formulas
- **Урон** = `[ (модификатор_урона + Strength/2) - 1 , (модификатор_урона + Strength/2) + 1 ]`
- **HP** = `((1 + Endurance/2) × 10) + модификатор_ХП`
- **Уклонение** = `5 + (Agility/2) + модификатор_уклонения`
- **Броня** = `floor(Endurance/4 + 1) + модификатор_брони`
- **Критический удар** = `1 + (Strength/5) + модификатор_крита` %

## Patch Notes
- Reworked primary and secondary stats with new formulas for damage, HP, dodge, armor and crit.
- Introduced multi-floor dungeon with bosses and configurable event probabilities.
- Added teleport stone mechanic allowing one revival during a run.
