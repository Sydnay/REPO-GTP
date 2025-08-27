import { computeSecondaryStats } from '../src/stats.js';

describe('computeSecondaryStats', () => {
  test('derives secondary attributes from base stats', () => {
    const sec = computeSecondaryStats({ strength:10, agility:12, intellect:8, endurance:14 });
    expect(sec.damage).toEqual({ min:4, max:6 });
    expect(sec.hp).toBe(80);
    expect(sec.dodge).toBe(11);
    expect(sec.armor).toBe(4);
    expect(sec.crit).toBe(3);
  });
});
