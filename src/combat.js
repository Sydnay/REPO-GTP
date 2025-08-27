export function attemptAttack(attacker, defender) {
  const raw = attacker.damage - defender.armor;
  const damage = Math.max(0, raw);
  defender.hp = Math.max(0, defender.hp - damage);
  return { hit: damage > 0, damage };
}
