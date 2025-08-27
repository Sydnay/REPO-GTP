export const FORMULAS = {
  damage(strength, mods = {}) {
    return Math.floor(strength / 4 + (mods.damage || 0));
  },
  hp(stamina, mods = {}) {
    return Math.floor(((1 + stamina / 2) * 10) + (mods.hp || 0));
  },
  armor(_, mods = {}) {
    return Math.floor(mods.armor || 0);
  }
};
