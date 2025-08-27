export const MAX_PRIMARY = 20;

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function computeSecondaryStats(base, mods = {}) {
  const strength = Math.floor(clamp(base.strength, 0, MAX_PRIMARY));
  const dexterity = Math.floor(clamp(base.agility || base.dexterity || 0, 0, MAX_PRIMARY));
  const intellect = Math.floor(clamp(base.intellect, 0, MAX_PRIMARY));
  const endurance = Math.floor(clamp(base.endurance, 0, MAX_PRIMARY));

  const damageBase = (mods.damage || 0) + strength / 2;
  const damage = {
    min: Math.floor(damageBase - 1),
    max: Math.floor(damageBase + 1)
  };
  const hp = Math.floor(((1 + endurance / 2) * 10) + (mods.hp || 0));
  const dodge = Math.floor(5 + dexterity / 2 + (mods.dodge || 0));
  const armor = Math.floor(endurance / 4 + 1) + (mods.armor || 0);
  const crit = Math.floor(1 + strength / 5 + (mods.crit || 0));
  return { damage, hp, dodge, armor, crit };
}
