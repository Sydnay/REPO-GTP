import { computeSecondaryStats } from './stats.js';
import { CONFIG } from './config.js';

export function generateMonster(level, rarity = 'common', rng = Math.random) {
  const k = CONFIG.monsterK[rarity] || 1;
  const baseStat = () => Math.floor((level + 1) * k);
  const base = {
    strength: baseStat(),
    dexterity: baseStat(),
    intellect: baseStat(),
    stamina: baseStat()
  };
  return { name: rarity === 'boss' ? 'Босс' : 'Монстр', rarity, level, ...base, ...computeSecondaryStats(base) };
}
