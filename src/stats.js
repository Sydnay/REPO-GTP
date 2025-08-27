import { FORMULAS } from './formulas.js';

export const MAX_PRIMARY = 20;

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function computeSecondaryStats(base, mods = {}) {
  const strength = Math.floor(clamp(base.strength, 0, MAX_PRIMARY));
  const dexterity = Math.floor(clamp(base.dexterity || 0, 0, MAX_PRIMARY));
  const intellect = Math.floor(clamp(base.intellect, 0, MAX_PRIMARY));
  const stamina = Math.floor(clamp(base.stamina, 0, MAX_PRIMARY));

  return {
    damage: FORMULAS.damage(strength, mods),
    hp: FORMULAS.hp(stamina, mods),
    armor: FORMULAS.armor(stamina, mods)
  };
}
