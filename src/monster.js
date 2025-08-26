import { computeSecondaryStats } from './stats.js';

export function generateMonster(rng=Math.random) {
  const randStat = () => 8 + Math.floor(rng()*8); // 8..15
  const base = {
    strength: randStat(),
    agility: randStat(),
    intellect: randStat(),
    endurance: randStat()
  };
  return { name: 'Монстр', ...base, ...computeSecondaryStats(base, rng) };
}
