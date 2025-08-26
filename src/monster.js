import { computeSecondaryStats } from './stats.js';
import { CONFIG } from './config.js';

export function generateMonster(rng=Math.random) {
  const randStat = () => CONFIG.monsterStats.min + Math.floor(rng()*(CONFIG.monsterStats.max - CONFIG.monsterStats.min + 1));
  const base = {
    strength: randStat(),
    agility: randStat(),
    intellect: randStat(),
    endurance: randStat()
  };
  return { name: 'Монстр', ...base, ...computeSecondaryStats(base) };
}
