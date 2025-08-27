import { computeSecondaryStats } from '../stats.js';

export function createHero(baseStats, name, initialCoins=0){
  const sec = computeSecondaryStats(baseStats);
  return {
    name,
    baseStats:{...baseStats},
    ...baseStats,
    ...sec,
    maxHp: sec.hp,
    coins: initialCoins,
    items: Array(25).fill(null),
    equipment:{ring:null,helmet:null,amulet:null,weapon:null,armor:null,shield:null},
    kills:0,
    teleport:false,
    usedTeleport:false
  };
}

export function addItem(hero, item){
  const stackable=['ingredient','junk','consumable'];
  if(stackable.includes(item.class)){
    for(let i=0;i<hero.items.length;i++){
      const it=hero.items[i];
      if(it && it.item.name===item.name){ it.qty++; return true; }
    }
  }
  for(let i=0;i<hero.items.length;i++){
    if(!hero.items[i]){ hero.items[i]={item, qty:1}; return true; }
  }
  return false;
}

export function totalMods(hero){
  const mods={};
  Object.values(hero.equipment).forEach(eq=>{ if(eq) Object.keys(eq.mods).forEach(k=>{ mods[k]=(mods[k]||0)+eq.mods[k]; }); });
  return mods;
}

export function recalcStats(hero){
  const mods=totalMods(hero);
  const base={
    strength:hero.baseStats.strength + (mods.strength||0),
    dexterity:hero.baseStats.dexterity + (mods.dexterity||0),
    intellect:hero.baseStats.intellect + (mods.intellect||0),
    stamina:hero.baseStats.stamina + (mods.stamina||0)
  };
  const sec=computeSecondaryStats(base, mods);
  Object.assign(hero, base, sec);
  hero.maxHp=sec.hp; hero.hp=Math.min(hero.hp, hero.maxHp);
}

export function equipItem(hero, index, type){
  const slot=hero.items[index];
  if(!slot) return false;
  const item=slot.item;
  if(hero.equipment[type]) return false;
  hero.equipment[type]=item;
  slot.qty--; if(slot.qty<=0) hero.items[index]=null;
  recalcStats(hero);
  return true;
}

export function unequipItem(hero, type){
  const eq=hero.equipment[type];
  if(!eq) return false;
  if(addItem(hero, eq)){
    hero.equipment[type]=null;
    recalcStats(hero);
    return true;
  }
  return false;
}
