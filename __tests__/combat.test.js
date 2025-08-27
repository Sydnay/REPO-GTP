import { attemptAttack } from '../src/combat.js';

describe('attemptAttack', () => {
  test('damage applied to defender', () => {
    const seq=[0.9,0.1,0.5,0.99];
    let i=0; const rng=()=>seq[i++];
    const attacker={ strength:10, damage:{min:4,max:6}, crit:0, armor:0 };
    const defender={ hp:20, dodge:5, armor:1 };
    const res=attemptAttack(attacker, defender, rng);
    expect(res.hit).toBe(true);
    expect(res.damage).toBe(4);
    expect(defender.hp).toBe(16);
  });
});
