import { computeSecondaryStats } from './src/stats.js';
import { attemptAttack } from './src/combat.js';
import { generateMonster } from './src/monster.js';
import { CONFIG } from './src/config.js';
import { UI_CONFIG } from './src/ui-config.js';

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
const modalPopup = document.getElementById('modalPopup');
const modalText = document.getElementById('modalText');
const modalActions = document.getElementById('modalActions');

function applyUIConfig(){
  Object.entries(UI_CONFIG.canvases).forEach(([id,cfg])=>{
    const el=document.getElementById(id);
    if(!el) return;
    if(cfg.width) el.width=cfg.width;
    if(cfg.height) el.height=cfg.height;
    if(cfg.displayWidth) el.style.width=cfg.displayWidth+'px';
    if(cfg.displayHeight) el.style.height=cfg.displayHeight+'px';
  });
  document.querySelectorAll('.popup').forEach(p=>{
    p.style.top=UI_CONFIG.popup.top;
    p.style.left=UI_CONFIG.popup.left;
  });
}

function showModal(message, options){
  return new Promise(resolve=>{
    modalText.textContent=message;
    modalActions.innerHTML='';
    options.forEach(opt=>{
      const btn=document.createElement('button');
      btn.textContent=opt.text;
      btn.onclick=()=>{ modalPopup.style.display='none'; resolve(opt.value); };
      modalActions.appendChild(btn);
    });
    modalPopup.style.display='block';
  });
}

applyUIConfig();

function genSprite(color){
  const s=16; const c=document.createElement('canvas'); c.width=c.height=s; const x=c.getContext('2d');
  x.fillStyle='#000'; x.fillRect(0,0,s,s); x.fillStyle=color;
  for(let i=0;i<s;i++){ for(let j=0;j<s/2;j++){ if(Math.random()>0.5){ x.fillRect(j,i,1,1); x.fillRect(s-1-j,i,1,1); } } }
  return c;
}
function drawSprite(canvas, spr){ const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(spr,8,8); }

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
    hero={ name, ...base, ...sec, maxHp: sec.hp, coins:CONFIG.initialCoins, items:[], kills:0, teleport:false, usedTeleport:false };
    drawSprite(heroCanvas, heroSprite);
    updateRoomStats();
    showScreen('room');
  };
}

function updateRoomStats(){
  roomStats.textContent=`Урон: ${hero.damage.min}-${hero.damage.max} | HP: ${hero.hp}/${hero.maxHp} | Монеты: ${hero.coins}`;
}

function updatePopups(){
  inventorySlots.innerHTML='';
  for(let i=0;i<8;i++){
    const slot=document.createElement('div');
    slot.className='inventory-slot';
    slot.textContent=hero.items[i]||'';
    inventorySlots.appendChild(slot);
  }
  statsText.textContent=`Убито монстров: ${hero.kills}\nМонеты: ${hero.coins}`;
  charText.textContent=`Имя: ${hero.name}\nСИЛА ${hero.strength}\nЛОВКОСТЬ ${hero.agility}\nИНТЕЛЛЕКТ ${hero.intellect}\nВЫНОСЛИВОСТЬ ${hero.endurance}\nУрон ${hero.damage.min}-${hero.damage.max}\nHP ${hero.hp}/${hero.maxHp}\nУклонение ${hero.dodge}\nБроня ${hero.armor}\nКрит ${hero.crit}%`;
}

function closePopups(){ [inventoryPopup,statsPopup,charPopup,shopPopup].forEach(p=>p.style.display='none'); }
[...document.querySelectorAll('.popup .close')].forEach(btn=>btn.onclick=closePopups);

inventoryBtn.onclick=()=>{ updatePopups(); inventoryPopup.style.display='block'; };
statsBtn.onclick=()=>{ updatePopups(); statsPopup.style.display='block'; };
charBtn.onclick=()=>{ updatePopups(); charPopup.style.display='block'; };
shopBtn.onclick=()=>{ renderShop(); shopPopup.style.display='block'; };

restartBtn.onclick=()=>{ closePopups(); showScreen('creation'); setupCreation(); };

const shopGoods = [
  { name:'Зелье силы (+1 СИЛА)', cost:10, apply:()=>{ hero.strength=Math.min(20, hero.strength+1); Object.assign(hero, computeSecondaryStats(hero)); hero.maxHp=hero.hp; } },
  { name:'Зелье ловкости (+1 ЛОВ)', cost:10, apply:()=>{ hero.agility=Math.min(20, hero.agility+1); Object.assign(hero, computeSecondaryStats(hero)); hero.maxHp=hero.hp; } },
  { name:'Зелье здоровья (+10 HP)', cost:15, apply:()=>{ hero.maxHp=Math.min(100, hero.maxHp+10); hero.hp=Math.min(hero.maxHp, hero.hp+10); } }
];
function renderShop(){
  shopItemsEl.innerHTML='';
  shopGoods.forEach(item=>{
    const btn=document.createElement('button');
    btn.textContent=`${item.name} - ${item.cost}`;
    btn.onclick=()=>{ if(hero.coins>=item.cost){ hero.coins-=item.cost; item.apply(); updateRoomStats(); renderShop(); }};
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
      const use=await showModal('Использовать камень телепорта и продолжить?',[
        {text:'Да', value:true},
        {text:'Нет', value:false}
      ]);
      if(use){
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
        const cont=await showModal('Продолжить восхождение?',[{text:'Да',value:true},{text:'Нет',value:false}]);
        if(!cont){ escaped=true; }
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
        const reward=rand(CONFIG.rewards.chestCoins[0], CONFIG.rewards.chestCoins[1]); hero.coins+=reward; if(hero.items.length<8){ hero.items.push('Лут'); } eventText.textContent=`Сундук +${reward} монет`; updateRoomStats();
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
