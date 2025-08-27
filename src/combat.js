function rollD20(rng) {
  return Math.floor(rng() * 20) + 1;
}

function rollRange(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function attemptAttack(attacker, defender, rng = Math.random) {
  const attackRoll = rollD20(rng);
  let attackSuccess = 0;
  if (attackRoll > attacker.strength) {
    attackSuccess = attackRoll - attacker.strength;
  } else {
    return { hit: false, damage: 0 };
  }

  const dodgeRoll = rollD20(rng);
  let dodgeSuccess = 0;
  if (dodgeRoll > defender.dodge) {
    dodgeSuccess = dodgeRoll - defender.dodge;
  }

  if (attackSuccess <= dodgeSuccess) {
    return { hit: false, damage: 0 };
  }

  let damage = rollRange(attacker.damage.min, attacker.damage.max, rng);
  const critRoll = rng();
  const crit = critRoll < attacker.crit / 100;
  if (crit) damage *= 2;
  damage = Math.max(0, damage - defender.armor);
  defender.hp = Math.max(0, defender.hp - damage);
  return { hit: true, damage, crit };
}

