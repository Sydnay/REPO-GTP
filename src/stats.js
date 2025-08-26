export const MAX_PRIMARY = 20;

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function computeSecondaryStats(base) {
  const strength = clamp(base.strength, 0, MAX_PRIMARY);
  const intellect = clamp(base.intellect, 0, MAX_PRIMARY);
  const endurance = clamp(base.endurance, 0, MAX_PRIMARY);

  const attack = Math.min(10, strength);
  const hp = Math.min(100, endurance * 5);
  const mp = Math.min(100, intellect * 5);
  return { attack, hp, mp };
}
