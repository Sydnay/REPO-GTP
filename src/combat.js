export function rollD20(rng=Math.random) {
  return Math.floor(rng()*20) + 1;
}

export function attemptAttack(attacker, defender, rng=Math.random) {
  const attackRoll = rollD20(rng);
  if (attackRoll >= attacker.strength) {
    return { hit: false, damage: 0, attackRoll };
  }
  const attackSuccess = attacker.strength - attackRoll;
  const dodgeRoll = rollD20(rng);
  const dodgeTarget = Math.ceil(defender.dodge);
  const dodgeSuccess = dodgeRoll < dodgeTarget ? (dodgeTarget - dodgeRoll) : 0;
  if (attackSuccess > dodgeSuccess) {
    defender.hp = Math.max(0, defender.hp - attacker.attack);
    return { hit: true, damage: attacker.attack, attackRoll, dodgeRoll };
  }
  return { hit: false, damage: 0, attackRoll, dodgeRoll };
}
