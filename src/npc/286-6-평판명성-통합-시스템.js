// 6. 평판/명성 통합 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { UNIFIED_FAME_LEVELS } from '../data/286-6-평판명성-통합-시스템.js';
import { loadReputation, saveReputation } from '../misc/054-이동수단-시스템.js';
import { toast } from '../utils.js';

export function getUnifiedFameLevel(score){
  return [...UNIFIED_FAME_LEVELS].reverse().find(l=>(score||0)>=l.min) || UNIFIED_FAME_LEVELS[0];
}
window.getUnifiedFameLevel = getUnifiedFameLevel;

export function addUnifiedFame(amount, reason=''){
  const rep = typeof loadReputation==='function' ? loadReputation() : { score:0 };
  const before = getUnifiedFameLevel(rep.score);
  rep.score = Math.max(0,(rep.score||0)+amount);
  const after = getUnifiedFameLevel(rep.score);
  if(typeof saveReputation==='function') saveReputation(rep);
  // 레벨 상승 시 연출
  if(after.min > before.min){
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:290;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;animation:fadeIn .3s ease';
    overlay.innerHTML = `
    <div style="text-align:center;padding:30px;max-width:300px">
      <div style="display:flex;justify-content:center;color:var(--gold);transform:scale(2.4);margin-bottom:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(after,{size:16}):(after.svgIcon||after.icon)}</div>
      <div style="font-family:Cinzel,serif;font-size:11px;color:var(--dim);letter-spacing:3px;margin-bottom:8px">FAME UP</div>
      <div style="font-family:Cinzel,serif;font-size:22px;color:var(--gold);margin-bottom:8px">${after.label}</div>
      <div style="font-size:11px;color:var(--dim);line-height:1.6;margin-bottom:20px">${after.npcReact}</div>
      <button onclick="this.parentElement.parentElement.remove()" style="padding:10px 24px;background:var(--gold);border:none;color:#000;font-family:Cinzel,serif;font-size:11px;cursor:pointer">계속하기</button>
    </div>`;
    document.body.appendChild(overlay);
    setTimeout(()=>overlay.remove(), 6000);
    if(reason) toast(`명성 상승: ${after.label} (${reason})`, 3500, after);
  }
  return rep.score;
}
window.addUnifiedFame = addUnifiedFame;

window.addUnifiedFame = addUnifiedFame;
