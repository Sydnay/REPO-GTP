import { computeSecondaryStats } from './src/stats.js';
import { attemptAttack } from './src/combat.js';
import { generateMonster } from './src/monster.js';

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
const inventoryPopup = document.getElementById('inventoryPopup');
const inventorySlots = document.getElementById('inventorySlots');
const statsPopup = document.getElementById('statsPopup');
const statsText = document.getElementById('statsText');
const charPopup = document.getElementById('charPopup');
const charText = document.getElementById('charText');

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
  const stats = { strength:8, agility:8, intellect:8, endurance:8 };
  let free=4;
  pointsEl.textContent=free;
  allocEl.innerHTML='';
  Object.entries(stats).forEach(([key,val])=>{
    const row=document.createElement('div');
    const minus=document.createElement('button'); minus.textContent='-';
    const plus=document.createElement('button'); plus.textContent='+';
    const span=document.createElement('span'); span.id=key; span.textContent=val;
    minus.onclick=()=>{ if(stats[key]>8){ stats[key]--; free++; span.textContent=stats[key]; pointsEl.textContent=free; }};
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
    hero={ name, ...base, ...sec, maxHp: sec.hp, coins:0, items:[], kills:0 };
    drawSprite(heroCanvas, heroSprite);
    updateRoomStats();
    showScreen('room');
  };
}

function updateRoomStats(){
  roomStats.textContent=`АТК: ${hero.attack} | HP: ${hero.hp}/${hero.maxHp} | Монеты: ${hero.coins}`;
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
  charText.textContent=`Имя: ${hero.name}\nСИЛА ${hero.strength}\nЛОВКОСТЬ ${hero.agility}\nИНТЕЛЛЕКТ ${hero.intellect}\nВЫНОСЛИВОСТЬ ${hero.endurance}\nАТК ${hero.attack}\nHP ${hero.hp}/${hero.maxHp}\nMP ${hero.mp}\nУКЛОН ${hero.dodge}`;
}

function closePopups(){ [inventoryPopup,statsPopup,charPopup].forEach(p=>p.style.display='none'); }
[...document.querySelectorAll('.popup .close')].forEach(btn=>btn.onclick=closePopups);

inventoryBtn.onclick=()=>{ updatePopups(); inventoryPopup.style.display='block'; };
statsBtn.onclick=()=>{ updatePopups(); statsPopup.style.display='block'; };
charBtn.onclick=()=>{ updatePopups(); charPopup.style.display='block'; };

restartBtn.onclick=()=>{ closePopups(); showScreen('creation'); setupCreation(); };

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
  d.textContent=res.hit?res.damage:'MISS';
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
    await sleep(500);
  }
}

async function explore(){
  showScreen('dungeon');
  eventText.textContent=`${hero.name} отправился в подземелье`;
  let events=0;
  while(hero.hp>0 && events<100){
    events++;
    await sleep(500);
    const roll=Math.random();
    if(roll<0.5){
      const monster=generateMonster();
      monster.maxHp=monster.hp;
      const monsterSprite=genSprite('#f55');
      eventText.textContent=`Встречен ${monster.name}`;
      await fight(monster, monsterSprite);
      if(hero.hp<=0) break;
      const reward=rand(5,20);
      hero.coins+=reward; hero.kills++;
      eventText.textContent=`Монстр повержен. +${reward} монет`;
      updateRoomStats();
    } else if(roll<0.7){
      const reward=rand(10,30); hero.coins+=reward;
      if(hero.items.length<8){ hero.items.push('Лут'); }
      eventText.textContent=`Сундук. +${reward} монет`;
      updateRoomStats();
    } else {
      const heal=rand(10,30); hero.hp=Math.min(hero.maxHp, hero.hp+heal);
      eventText.textContent=`Зелье. +${heal} HP`;
      updateRoomStats();
    }
  }
  if(hero.hp>0){
    eventText.textContent+='\nЗабег окончен.';
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
