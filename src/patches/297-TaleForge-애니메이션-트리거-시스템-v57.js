// 🎆 TaleForge 애니메이션 트리거 시스템 v57
// Auto-extracted from taleforge.html (original section banner preserved above).
import { esc } from '../utils.js';

export function _spawnPopup(text, className, offsetX, offsetY){
  const el = document.createElement('div');
  el.className = className;
  el.textContent = text;
  // 화면 중앙 기준 ±랜덤
  const x = (window.innerWidth/2) + (offsetX||0) + (Math.random()*40-20);
  const y = (window.innerHeight/2) + (offsetY||0);
  el.style.left = x+'px';
  el.style.top  = y+'px';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 2000);
}
window._spawnPopup = _spawnPopup;

export function animLevelUpFlash(){
  const el = document.createElement('div');
  el.className = 'lvl-flash';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 2000);
}
window.animLevelUpFlash = animLevelUpFlash;

export function animQuestBanner(grade, title){
  const existing = document.getElementById('quest-complete-banner');
  if(existing) existing.remove();
  const gradeColors = {S:'#ff4040',A:'#e0a030',B:'#4090d0',C:'#60b060',D:'#8a8aaa'};
  const gradeIcons  = {S:'🌟',A:'⭐',B:'💫',C:'✨',D:'·'};
  const color = gradeColors[grade]||'#c8a96e';
  const icon  = gradeIcons[grade]||'✨';
  const el = document.createElement('div');
  el.id = 'quest-complete-banner';
  el.className = 'quest-banner';
  el.innerHTML = `<div class="quest-banner-inner" style="border-bottom:2px solid ${color};padding:10px 16px;display:flex;align-items:center;justify-content:center;gap:10px">
    <span style="font-size:18px">${icon}</span>
    <span style="font-family:Cinzel,serif;font-size:10px;color:${color};letter-spacing:2px">QUEST COMPLETE</span>
    <span style="font-family:Cinzel,serif;font-size:11px;color:#d4b870">${esc(title||'퀘스트 완료')}</span>
    <span style="font-family:Cinzel,serif;font-size:10px;color:${color};letter-spacing:1px">${grade}등급</span>
    <span style="font-size:18px">${icon}</span>
  </div>`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 4000);
}
window.animQuestBanner = animQuestBanner;

export function animProphecyGlow(){
  const el = document.createElement('div');
  el.className = 'prophecy-glow';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 3200);
}
window.animProphecyGlow = animProphecyGlow;

export function animBloodlineAwaken(){
  for(let i=0;i<3;i++){
    setTimeout(()=>{
      const el = document.createElement('div');
      el.className = 'blood-ripple';
      document.body.appendChild(el);
      setTimeout(()=>el.remove(), 1300);
    }, i*250);
  }
}
window.animBloodlineAwaken = animBloodlineAwaken;

export function animHpDamage(amount){
  if(!amount || amount<=0) return;
  _spawnPopup(`-${amount} HP`, 'dmg-popup', 0, -80);
}
window.animHpDamage = animHpDamage;

export function animHpHeal(amount){
  if(!amount || amount<=0) return;
  _spawnPopup(`+${amount} HP`, 'heal-popup', 0, -80);
}
window.animHpHeal = animHpHeal;

export function animGoldGain(amount){
  if(!amount || amount<=0) return;
  _spawnPopup(`+${amount}G`, 'gold-popup', 60, -60);
}
window.animGoldGain = animGoldGain;

export function animDungeonFloorTransit(floorNum){
  const el = document.createElement('div');
  el.className = 'dungeon-transit';
  // 층 번호 텍스트
  el.innerHTML = `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
    <div style="font-family:Cinzel,serif;font-size:11px;color:#3a2a4a;letter-spacing:3px;margin-bottom:6px">DESCENDING</div>
    <div style="font-family:Cinzel,serif;font-size:32px;color:#6a4a8a;letter-spacing:4px">${floorNum}F</div>
  </div>`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 1500);
}
window.animDungeonFloorTransit = animDungeonFloorTransit;

export function animBossRoom(){
  // 화면 진동
  const app = document.getElementById('app') || document.body;
  app.classList.add('boss-shake');
  setTimeout(()=>app.classList.remove('boss-shake'), 700);
  // 빨간 테두리 펄스
  const el = document.createElement('div');
  el.className = 'boss-room-overlay';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 3800);
}
window.animBossRoom = animBossRoom;

export function animCritHit(){
  const el = document.createElement('div');
  el.className = 'crit-flash';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 600);
  // 크리티컬 팝업
  _spawnPopup('CRITICAL!', 'dmg-popup', 0, -120);
}
window.animCritHit = animCritHit;
