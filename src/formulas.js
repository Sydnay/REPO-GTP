export const FORMULAS = {
  damage(strength, mods = {}) {
    const base = (mods.damage || 0) + strength / 2;
    return { min: Math.floor(base - 1), max: Math.floor(base + 1) };
  },
  hp(endurance, mods = {}) {
    return Math.floor(((1 + endurance / 2) * 10) + (mods.hp || 0));
  },
  dodge(agility, mods = {}) {
    return Math.floor(5 + agility / 2 + (mods.dodge || 0));
  },
  armor(endurance, mods = {}) {
    return Math.floor(endurance / 4 + 1 + (mods.armor || 0));
  },
  crit(strength, mods = {}) {
    return Math.floor(1 + strength / 5 + (mods.crit || 0));
  }
};
