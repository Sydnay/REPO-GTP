import { attemptAttack } from '../src/combat.js';

describe('attemptAttack', () => {
  test('damage applied to defender', () => {
    const attacker={ damage:6 };
    const defender={ hp:20, armor:1 };
    const res=attemptAttack(attacker, defender);
    expect(res.hit).toBe(true);
    expect(res.damage).toBe(5);
    expect(defender.hp).toBe(15);
  });
});
