import { computeSecondaryStats } from '../src/stats.js';

describe('computeSecondaryStats', () => {
  test('derives secondary attributes from base stats', () => {
    const sec = computeSecondaryStats({ strength:10, intellect:8, endurance:8 });
    expect(sec.attack).toBe(10);
    expect(sec.hp).toBe(40);
    expect(sec.mp).toBe(40);
  });
});
