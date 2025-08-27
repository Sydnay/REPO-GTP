import { computeSecondaryStats } from '../src/stats.js';

describe('computeSecondaryStats', () => {
  test('derives secondary attributes from base stats', () => {
    const sec = computeSecondaryStats({ strength:10, dexterity:12, intellect:8, stamina:14 });
    expect(sec.damage).toBe(2);
    expect(sec.hp).toBe(80);
    expect(sec.armor).toBe(0);
  });
});
