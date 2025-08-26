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
const logEl = document.getElementById('log');
const eventLogEl = document.getElementById('eventLog');
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
    hero={ name, ...base, ...computeSecondaryStats(base), coins:0, items:[], kills:0 };
    drawSprite(heroCanvas, heroSprite);
    updateRoomStats();
    showScreen('room');
  };
}

function updateRoomStats(){
  roomStats.textContent=`АТК: ${hero.attack} | HP: ${hero.hp} | Монеты: ${hero.coins}`;
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
  charText.textContent=`Имя: ${hero.name}\nСИЛА ${hero.strength}\nЛОВКОСТЬ ${hero.agility}\nИНТЕЛЛЕКТ ${hero.intellect}\nВЫНОСЛИВОСТЬ ${hero.endurance}\nАТК ${hero.attack}\nHP ${hero.hp}\nMP ${hero.mp}\nУКЛОН ${hero.dodge}`;
}

function closePopups(){ [inventoryPopup,statsPopup,charPopup].forEach(p=>p.style.display='none'); }
[...document.querySelectorAll('.popup .close')].forEach(btn=>btn.onclick=closePopups);

inventoryBtn.onclick=()=>{ updatePopups(); inventoryPopup.style.display='block'; };
statsBtn.onclick=()=>{ updatePopups(); statsPopup.style.display='block'; };
charBtn.onclick=()=>{ updatePopups(); charPopup.style.display='block'; };

restartBtn.onclick=()=>{ closePopups(); showScreen('creation'); setupCreation(); };

async function explore(){
  showScreen('dungeon');
  logEl.textContent=`${hero.name} отправился в подземелье`;
  eventLogEl.style.display='none';
  let events=0;
  while(hero.hp>0 && events<100){
    events++;
    await sleep(500);
    const roll=Math.random();
    if(roll<0.5){
      const monster=generateMonster();
      logEl.textContent+=`\nВстречен ${monster.name}`;
      eventLogEl.style.display='block';
      eventLogEl.textContent='Началась схватка\n';
      while(hero.hp>0 && monster.hp>0){
        let res=attemptAttack(hero, monster);
        eventLogEl.textContent+=`${hero.name} бросок ${res.attackRoll}, монстр уклон ${res.dodgeRoll} -> ${res.hit?'попадание':'промах'}\n`;
        if(res.hit){ eventLogEl.textContent+=`Монстр HP ${monster.hp}\n`; }
        if(monster.hp<=0) break;
        res=attemptAttack(monster, hero);
        eventLogEl.textContent+=`Монстр бросок ${res.attackRoll}, ${hero.name} уклон ${res.dodgeRoll} -> ${res.hit?'попадание':'промах'}\n`;
        if(res.hit){ eventLogEl.textContent+=`${hero.name} HP ${hero.hp}\n`; updateRoomStats(); }
        await sleep(300);
      }
      if(hero.hp<=0) break;
      const reward=rand(5,20);
      hero.coins+=reward; hero.kills++;
      logEl.textContent+=`\nМонстр повержен. +${reward} монет`;
      eventLogEl.style.display='none';
      updateRoomStats();
    } else if(roll<0.7){
      logEl.textContent+='\nСундук';
      const reward=rand(10,30); hero.coins+=reward;
      if(hero.items.length<8){ hero.items.push('Лут'); }
      updateRoomStats();
    } else {
      logEl.textContent+='\nЗелье';
      const heal=rand(10,30); hero.hp=Math.min(100, hero.hp+heal);
      updateRoomStats();
    }
  }
  if(hero.hp>0){
    logEl.textContent+='\nЗабег окончен.';
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
