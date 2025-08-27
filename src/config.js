export const CONFIG = {
  levelCount: 10,
  eventsPerLevel: 15,
  eventChances: {
    safe: 0.05,
    potion: 0.1,
    monsterCommon: 0.5,
    monsterRare: 0.1,
    monsterUnique: 0.02,
    chest: 0.22,
    teleport: 0.01
  },
  rewards: {
    monsterCoins: [5, 20],
    chestCoins: [10, 30]
  },
  monsterK: {
    common: 1,
    rare: 1.5,
    unique: 2.5,
    boss: 4
  },
  initialStats: { strength: 8, dexterity: 8, intellect: 8, stamina: 8 },
  initialCoins: 0,
  statPoints: 4
};
