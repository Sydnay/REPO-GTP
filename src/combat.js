export function rollD20(rng=Math.random) {
  return Math.floor(rng()*20) + 1;
}

export function attemptAttack(attacker, defender, rng=Math.random) {
  const attackRoll = rollD20(rng);
  const dodgeRoll = rollD20(rng);
  const attackSuccess = Math.max(0, attackRoll - attacker.strength);
  const dodgeSuccess = Math.max(0, dodgeRoll - defender.dodge);
  if (attackSuccess > dodgeSuccess) {
    defender.hp = Math.max(0, defender.hp - attacker.attack);
    return { hit: true, damage: attacker.attack, attackRoll, dodgeRoll };
  }
  return { hit: false, damage: 0, attackRoll, dodgeRoll };
}
