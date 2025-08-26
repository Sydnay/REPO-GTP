export const MAX_PRIMARY = 20;

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function computeSecondaryStats(base, rng=Math.random) {
  const strength = clamp(base.strength, 0, MAX_PRIMARY);
  const agility = clamp(base.agility, 0, MAX_PRIMARY);
  const intellect = clamp(base.intellect, 0, MAX_PRIMARY);
  const endurance = clamp(base.endurance, 0, MAX_PRIMARY);

  const attack = Math.min(10, Math.max(1, Math.round(strength/2 + rng()*strength/2)));
  const hp = Math.min(100, endurance * 5);
  const mp = Math.min(100, intellect * 5);
  const dodge = +(agility * 0.5).toFixed(1);
  return { attack, hp, mp, dodge };
}
