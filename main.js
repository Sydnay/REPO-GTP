import { computeSecondaryStats } from './src/stats.js';
import { attemptAttack } from './src/combat.js';
import { generateMonster } from './src/monster.js';
import { CONFIG } from './src/config.js';
import { randomItem } from './src/items.js';

function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

// DOM elements
const screens = {
  greeting: document.getElementById('greeting'),
  creation: document.getElementById('creation'),
  room: document.getElementById('room'),
  dungeon: document.getElementById('dungeon'),
  death: document.getElementById('death')
};
function showScreen(name){ Object.values(screens).forEach(s=>s.style.display='none'); screens[name].style.display='block'; }

const greetBtn = document.getElementById('greetBtn');
const creationCanvas = document.getElementById('creationCanvas');
const allocEl = document.getElementById('alloc');
const pointsEl = document.getElementById('points');
const nameInput = document.getElementById('nameInput');
const createBtn = document.getElementById('createBtn');
const heroCanvas = document.getElementById('heroCanvas');
const roomStats = document.getElementById('roomStats');
const dungeonBtn = document.getElementById('dungeonBtn');
const battleCanvas = document.getElementById('battleCanvas');
const eventText = document.getElementById('eventText');
const restartBtn = document.getElementById('restartBtn');
const inventoryBtn = document.getElementById('inventoryBtn');
const statsBtn = document.getElementById('statsBtn');
const charBtn = document.getElementById('charBtn');
const shopBtn = document.getElementById('shopBtn');
const inventoryPopup = document.getElementById('inventoryPopup');
const inventorySlots = document.getElementById('inventorySlots');
const statsPopup = document.getElementById('statsPopup');
const statsText = document.getElementById('statsText');
const charPopup = document.getElementById('charPopup');
const charText = document.getElementById('charText');
const shopPopup = document.getElementById('shopPopup');
const shopItemsEl = document.getElementById('shopItems');
const equipBtn = document.getElementById('equipBtn');
const equipPopup = document.getElementById('equipPopup');
const equipSlotsEl = document.getElementById('equipSlots');

function genSprite(color){
  const s=16; const c=document.createElement('canvas'); c.width=c.height=s; const x=c.getContext('2d');
  x.fillStyle='#000'; x.fillRect(0,0,s,s); x.fillStyle=color;
  for(let i=0;i<s;i++){ for(let j=0;j<s/2;j++){ if(Math.random()>0.5){ x.fillRect(j,i,1,1); x.fillRect(s-1-j,i,1,1); } } }
  return c;
}
function drawSprite(canvas, spr){ const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,32,32); ctx.drawImage(spr,8,8); }

let heroSprite = genSprite('#ff0');
let hero = null;

function setupCreation(){
  heroSprite = genSprite('#ff0');
  drawSprite(creationCanvas, heroSprite);
  const stats = { ...CONFIG.initialStats };
  let free = CONFIG.statPoints;
  pointsEl.textContent=free;
  allocEl.innerHTML='';
  Object.entries(stats).forEach(([key,val])=>{
    const row=document.createElement('div');
    const minus=document.createElement('button'); minus.textContent='-';
    const plus=document.createElement('button'); plus.textContent='+';
    const span=document.createElement('span'); span.id=key; span.textContent=val;
    minus.onclick=()=>{ if(stats[key]>CONFIG.initialStats[key]){ stats[key]--; free++; span.textContent=stats[key]; pointsEl.textContent=free; }};
    plus.onclick=()=>{ if(free>0 && stats[key]<20){ stats[key]++; free--; span.textContent=stats[key]; pointsEl.textContent=free; }};
    row.textContent=key.toUpperCase()+': ';
    row.appendChild(minus); row.appendChild(span); row.appendChild(plus);
    allocEl.appendChild(row);
  });
  createBtn.onclick=()=>{
    const base={ strength:parseInt(document.getElementById('strength').textContent),
                 agility:parseInt(document.getElementById('agility').textContent),
                 intellect:parseInt(document.getElementById('intellect').textContent),
                 endurance:parseInt(document.getElementById('endurance').textContent) };
    const name=nameInput.value||'Герой';
    const sec=computeSecondaryStats(base);
    hero={ name, baseStats:{...base}, ...base, ...sec, maxHp: sec.hp, coins:CONFIG.initialCoins, items:Array(25).fill(null), equipment:{ring:null,helmet:null,amulet:null,weapon:null,armor:null,shield:null}, kills:0, teleport:false, usedTeleport:false };
    drawSprite(heroCanvas, heroSprite);
    updateRoomStats();
    showScreen('room');
  };
}

function updateRoomStats(){
  roomStats.textContent=`Урон: ${hero.damage.min}-${hero.damage.max} | HP: ${hero.hp}/${hero.maxHp} | Монеты: ${hero.coins}`;
}

function describeItem(item){
  return `${item.name}\n${item.desc}\nПокупка: ${item.buy} Продажа: ${item.sell}`;
}

function addItem(item){
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

function totalMods(){
  const mods={};
  Object.values(hero.equipment).forEach(eq=>{ if(eq) Object.keys(eq.mods).forEach(k=>{ mods[k]=(mods[k]||0)+eq.mods[k]; }); });
  return mods;
}

function recalcStats(){
  const mods=totalMods();
  const base={
    strength:hero.baseStats.strength + (mods.strength||0),
    agility:hero.baseStats.agility + (mods.agility||0),
    intellect:hero.baseStats.intellect + (mods.intellect||0),
    endurance:hero.baseStats.endurance + (mods.endurance||0)
  };
  const sec=computeSecondaryStats(base, mods);
  Object.assign(hero, base, sec);
  hero.maxHp=sec.hp; hero.hp=Math.min(hero.hp, hero.maxHp);
  updateRoomStats();
}

function inventoryClick(i){
  const slot=hero.items[i];
  if(!slot) return;
  const item=slot.item;
  let opts=['2=Выбросить','3=Описание'];
  const equipables=['weapon','armor','helmet','ring','amulet','shield'];
  if(item.class==='consumable' || equipables.includes(item.class)) opts.unshift('1=Применить');
  const choice=prompt(opts.join('\n'));
  if(choice==='1'){
    if(item.class==='consumable'){
      Object.keys(item.mods).forEach(k=>{ hero.baseStats[k]=(hero.baseStats[k]||0)+item.mods[k]; });
      recalcStats();
      slot.qty--; if(slot.qty<=0) hero.items[i]=null;
    } else if(equipables.includes(item.class)){
      equipItem(i,item.class);
    }
  } else if(choice==='2'){
    slot.qty--; if(slot.qty<=0) hero.items[i]=null;
  } else if(choice==='3'){
    alert(describeItem(item));
  }
  updatePopups();
}

function equipItem(index, type){
  const slot=hero.items[index];
  if(!slot) return;
  const item=slot.item;
  if(hero.equipment[type]){
    alert('Ячейка занята'); return;
  }
  hero.equipment[type]=item;
  slot.qty--; if(slot.qty<=0) hero.items[index]=null;
  recalcStats();
}

function equipSlotClick(type){
  const eq=hero.equipment[type];
  if(eq){
    const choice=prompt('1=Снять\n2=Описание\n3=Выбросить');
    if(choice==='1'){
      if(addItem(eq)){ hero.equipment[type]=null; recalcStats(); }
      else alert('Инвентарь переполнен');
    } else if(choice==='2'){
      alert(describeItem(eq));
    } else if(choice==='3'){
      hero.equipment[type]=null; recalcStats();
    }
    updatePopups();
    return;
  }
  const options=[];
  hero.items.forEach((sl,i)=>{ if(sl && sl.item.class===type) options.push(`${i+1}:${sl.item.name}`); });
  if(!options.length){ alert('Нет предметов'); return; }
  const pick=prompt('Выберите:\n'+options.join('\n'));
  const idx=parseInt(pick)-1;
  if(!isNaN(idx) && hero.items[idx] && hero.items[idx].item.class===type){ equipItem(idx,type); updatePopups(); }
}

function updatePopups(){
  inventorySlots.innerHTML='';
  for(let i=0;i<hero.items.length;i++){
    const slot=document.createElement('div');
    slot.className='inventory-slot';
    const data=hero.items[i];
    if(data){ slot.textContent=data.item.name+(data.qty>1?` x${data.qty}`:''); }
    slot.onclick=(()=>inventoryClick(i));
    inventorySlots.appendChild(slot);
    if((i+1)%5===0) inventorySlots.appendChild(document.createElement('br'));
  }
  equipSlotsEl.innerHTML='';
  const order=['ring','helmet','amulet','weapon','armor','shield'];
  order.forEach(t=>{
    const slot=document.createElement('div');
    slot.className='inventory-slot';
    if(hero.equipment[t]) slot.textContent=hero.equipment[t].name; else slot.textContent=t;
    slot.onclick=(()=>equipSlotClick(t));
    equipSlotsEl.appendChild(slot);
    if(t==='amulet') equipSlotsEl.appendChild(document.createElement('br'));
  });
  statsText.textContent=`Убито монстров: ${hero.kills}\nМонеты: ${hero.coins}`;
  charText.textContent=`Имя: ${hero.name}\nСИЛА ${hero.strength}\nЛОВКОСТЬ ${hero.agility}\nИНТЕЛЛЕКТ ${hero.intellect}\nВЫНОСЛИВОСТЬ ${hero.endurance}\nУрон ${hero.damage.min}-${hero.damage.max}\nHP ${hero.hp}/${hero.maxHp}\nУклонение ${hero.dodge}\nБроня ${hero.armor}\nКрит ${hero.crit}%`;
}

function closePopups(){ [inventoryPopup,statsPopup,charPopup,shopPopup,equipPopup].forEach(p=>p.style.display='none'); }
[...document.querySelectorAll('.popup .close')].forEach(btn=>btn.onclick=closePopups);

inventoryBtn.onclick=()=>{ updatePopups(); inventoryPopup.style.display='block'; };
statsBtn.onclick=()=>{ updatePopups(); statsPopup.style.display='block'; };
charBtn.onclick=()=>{ updatePopups(); charPopup.style.display='block'; };
shopBtn.onclick=()=>{ renderShop(); shopPopup.style.display='block'; };
equipBtn.onclick=()=>{ updatePopups(); equipPopup.style.display='block'; };

restartBtn.onclick=()=>{ closePopups(); showScreen('creation'); setupCreation(); };

let shopGoods = [];
function renderShop(){
  if(shopGoods.length===0){ shopGoods=[randomItem(),randomItem(),randomItem()]; }
  shopItemsEl.innerHTML='';
  shopGoods.forEach((item,idx)=>{
    const btn=document.createElement('button');
    btn.textContent=`${item.name} - ${item.buy}`;
    btn.onclick=()=>{
      if(hero.coins>=item.buy){
        if(addItem(item)){
          hero.coins-=item.buy;
          shopGoods.splice(idx,1);
          updateRoomStats();
          renderShop();
        } else alert('Инвентарь переполнен');
      }
    };
    shopItemsEl.appendChild(btn);
    shopItemsEl.appendChild(document.createElement('br'));
  });
}

function drawBattle(hp1,max1,hp2,max2,monsterSprite){
  const ctx=battleCanvas.getContext('2d');
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,battleCanvas.width,battleCanvas.height);
  ctx.drawImage(heroSprite,16,32);
  ctx.drawImage(monsterSprite,battleCanvas.width-32,32);
  ctx.fillStyle='red';
  ctx.fillRect(10,10,40,5);
  ctx.fillRect(battleCanvas.width-50,10,40,5);
  ctx.fillStyle='green';
  ctx.fillRect(10,10,40*(hp1/max1),5);
  ctx.fillRect(battleCanvas.width-50,10,40*(hp2/max2),5);
}

function showDamage(target,res){
  const d=document.createElement('div');
  d.className='damage';
  d.textContent=res.hit ? res.damage : 'Мимо';
  const rect=battleCanvas.getBoundingClientRect();
  const parent=screens.dungeon.getBoundingClientRect();
  const x=rect.left-parent.left+(target==='monster'?90:30);
  const y=rect.top-parent.top+5;
  d.style.left=x+'px';
  d.style.top=y+'px';
  screens.dungeon.appendChild(d);
  setTimeout(()=>d.remove(),1000);
}

async function fight(monster, monsterSprite){
  drawBattle(hero.hp, hero.maxHp, monster.hp, monster.maxHp, monsterSprite);
  while(hero.hp>0 && monster.hp>0){
    let res=attemptAttack(hero, monster);
    showDamage('monster', res);
    drawBattle(hero.hp, hero.maxHp, monster.hp, monster.maxHp, monsterSprite);
    await sleep(500);
    if(monster.hp<=0) break;
    res=attemptAttack(monster, hero);
    showDamage('hero', res);
    drawBattle(hero.hp, hero.maxHp, monster.hp, monster.maxHp, monsterSprite);
    updateRoomStats();
    if(hero.hp<=0 && hero.teleport && !hero.usedTeleport){
      if(confirm('Использовать камень телепорта и продолжить?')){
        hero.hp = hero.maxHp;
        hero.usedTeleport = true;
        drawBattle(hero.hp, hero.maxHp, monster.hp, monster.maxHp, monsterSprite);
      } else {
        break;
      }
    }
    await sleep(500);
  }
}

async function explore(){
  showScreen('dungeon');
  eventText.textContent=`${hero.name} отправился в подземелье`;
  const c=CONFIG.eventChances;
  let level=0;
  let escaped=false;
  while(hero.hp>0 && level<CONFIG.levelCount){
    for(let e=1;e<=CONFIG.eventsPerLevel && hero.hp>0;e++){
      await sleep(500);
      if(e===CONFIG.eventsPerLevel){
        const boss=generateMonster(level,'boss');
        boss.maxHp=boss.hp;
        const spr=genSprite('#f55');
        eventText.textContent=`Босс уровня ${level+1}`;
        await fight(boss,spr);
        if(hero.hp<=0) break;
        const reward=rand(CONFIG.rewards.monsterCoins[0], CONFIG.rewards.monsterCoins[1]);
        hero.coins+=reward; hero.kills++;
        updateRoomStats();
        if(!confirm('Продолжить восхождение?')){ escaped=true; }
        else level++;
        break;
      }
      const roll=Math.random();
      if(roll<c.safe){
        hero.hp=hero.maxHp; eventText.textContent='Безопасная зона. HP восстановлено'; updateRoomStats();
      } else if(roll<c.safe+c.potion){
        const heal=Math.floor(hero.maxHp*0.25); hero.hp=Math.min(hero.maxHp, hero.hp+heal); eventText.textContent=`Зелье лечения +${heal} HP`; updateRoomStats();
      } else if(roll<c.safe+c.potion+c.monsterCommon){
        const m=generateMonster(level,'common'); m.maxHp=m.hp; const spr=genSprite('#f55'); eventText.textContent='Монстр'; await fight(m,spr); if(hero.hp>0){ const reward=rand(CONFIG.rewards.monsterCoins[0], CONFIG.rewards.monsterCoins[1]); hero.coins+=reward; hero.kills++; eventText.textContent+=` Победа +${reward} монет`; updateRoomStats(); }
      } else if(roll<c.safe+c.potion+c.monsterCommon+c.monsterRare){
        const m=generateMonster(level,'rare'); m.maxHp=m.hp; const spr=genSprite('#f55'); eventText.textContent='Редкий монстр'; await fight(m,spr); if(hero.hp>0){ const reward=rand(CONFIG.rewards.monsterCoins[0], CONFIG.rewards.monsterCoins[1]); hero.coins+=reward; hero.kills++; eventText.textContent+=` Победа +${reward} монет`; updateRoomStats(); }
      } else if(roll<c.safe+c.potion+c.monsterCommon+c.monsterRare+c.monsterUnique){
        const m=generateMonster(level,'unique'); m.maxHp=m.hp; const spr=genSprite('#f55'); eventText.textContent='Уникальный монстр'; await fight(m,spr); if(hero.hp>0){ const reward=rand(CONFIG.rewards.monsterCoins[0], CONFIG.rewards.monsterCoins[1]); hero.coins+=reward; hero.kills++; eventText.textContent+=` Победа +${reward} монет`; updateRoomStats(); }
      } else if(roll<c.safe+c.potion+c.monsterCommon+c.monsterRare+c.monsterUnique+c.chest){
        const reward=rand(CONFIG.rewards.chestCoins[0], CONFIG.rewards.chestCoins[1]); hero.coins+=reward; const item=randomItem(); addItem(item); eventText.textContent=`Сундук +${reward} монет и ${item.name}`; updateRoomStats();
      } else {
        hero.teleport=true; eventText.textContent='Найден камень телепорта';
      }
    }
    if(escaped || hero.hp<=0) break;
  }
  if(hero.hp>0){
    showScreen('room');
    updateRoomStats();
  } else {
    showScreen('death');
  }
}

dungeonBtn.onclick=()=>{ explore(); };

greetBtn.onclick=()=>{ localStorage.setItem('greeted','1'); showScreen('creation'); setupCreation(); };

if(localStorage.getItem('greeted')){ showScreen('creation'); setupCreation(); }
else { showScreen('greeting'); }
