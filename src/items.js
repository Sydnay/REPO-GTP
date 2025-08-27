function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ITEM_CLASSES = {
  ingredient: 'ingredient',
  weapon: 'weapon',
  armor: 'armor',
  helmet: 'helmet',
  ring: 'ring',
  amulet: 'amulet',
  shield: 'shield',
  junk: 'junk',
  consumable: 'consumable'
};

const CLASS_DEFS = {
  ingredient: { buy:[50,10000], stack:true },
  weapon: { mod:'damage', range:[0,5], buy:[150,10000] },
  armor: { mod:'armor', range:[0,5], buy:[250,3000] },
  helmet: { mod:'armor', range:[0,2], buy:[150,1500] },
  ring: { mod:'primary', range:[0,2], buy:[200,5000] },
  amulet: { mod:'primary', range:[0,2], buy:[150,10000] },
  shield: { mod:'damage', range:[0,3], buy:[500,10000] },
  consumable: { mod:'temp', range:[0,4], buy:[50,10000], stack:true, duration:[1,10] },
  junk: { buy:[0,0], stack:true }
};

export function generateItem(type){
  const def = CLASS_DEFS[type];
  const val = def.range ? rand(def.range[0], def.range[1]) : 0;
  let mods = {};
  let name = '';
  if(def.mod === 'damage') { mods.damage = val; name = `${type==='shield'?'Щит':'Оружие'} +${val}`; }
  else if(def.mod === 'armor') { mods.armor = val; name = `${type==='helmet'?'Шлем':'Броня'} +${val}`; }
  else if(def.mod === 'primary') { const stat=['strength','agility','intellect','endurance'][rand(0,3)]; mods[stat]=val; name = `${type==='ring'?'Кольцо':'Амулет'} ${stat}+${val}`; }
  else if(def.mod === 'temp') { const stat=['strength','agility','intellect','endurance'][rand(0,3)]; mods[stat]=val; name = `Зелье ${stat}+${val}`; }
  else if(type==='ingredient') { name='Ингредиент'; }
  else if(type==='junk') { name='Хлам'; }
  const buy = rand(def.buy[0], def.buy[1]);
  const sell = Math.floor(buy*0.7);
  const desc = `${name}. Модификаторы: ${JSON.stringify(mods)}`;
  return { name, class:type, mods, buy, sell, desc, stack:def.stack || false, duration:def.duration?rand(def.duration[0], def.duration[1]):0 };
}

export function randomItem(){
  const types = Object.keys(ITEM_CLASSES);
  return generateItem(types[rand(0, types.length-1)]);
}
