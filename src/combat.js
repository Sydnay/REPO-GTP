export function attemptAttack(attacker, defender) {
  defender.hp = Math.max(0, defender.hp - attacker.attack);
  return { hit: true, damage: attacker.attack };
}
