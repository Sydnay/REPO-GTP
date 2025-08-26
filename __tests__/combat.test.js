import { attemptAttack } from '../src/combat.js';

describe('attemptAttack', () => {
  test('damage applied to defender', () => {
    const attacker = { attack: 7 };
    const defender = { hp: 20 };
    const res = attemptAttack(attacker, defender);
    expect(res.hit).toBe(true);
    expect(res.damage).toBe(7);
    expect(defender.hp).toBe(13);
  });
});
