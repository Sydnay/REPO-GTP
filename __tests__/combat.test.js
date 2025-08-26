import { computeSecondaryStats } from '../src/stats.js';
import { attemptAttack } from '../src/combat.js';

function makeRng(values){
  return () => values.shift();
}

describe('attemptAttack', () => {
  test('successful hit reduces hp', () => {
    const attackerBase = { strength:12, agility:8, intellect:8, endurance:8 };
    const defenderBase = { strength:8, agility:10, intellect:8, endurance:8 };
    const attacker = { ...attackerBase, ...computeSecondaryStats(attackerBase, () => 0) };
    const defender = { ...defenderBase, ...computeSecondaryStats(defenderBase, () => 0), hp:40 };
    const rng = makeRng([0.95, 0.1]); // attackRoll 20, dodgeRoll 3
    const res = attemptAttack(attacker, defender, rng);
    expect(res.hit).toBe(true);
    expect(defender.hp).toBe(40 - attacker.attack);
  });

  test('miss leaves hp unchanged', () => {
    const attackerBase = { strength:12, agility:8, intellect:8, endurance:8 };
    const defenderBase = { strength:8, agility:10, intellect:8, endurance:8 };
    const attacker = { ...attackerBase, ...computeSecondaryStats(attackerBase, () => 0) };
    const defender = { ...defenderBase, ...computeSecondaryStats(defenderBase, () => 0), hp:40 };
    const rng = makeRng([0.3, 0.9]); // attackRoll 7, dodgeRoll 19
    const res = attemptAttack(attacker, defender, rng);
    expect(res.hit).toBe(false);
    expect(defender.hp).toBe(40);
  });
});
