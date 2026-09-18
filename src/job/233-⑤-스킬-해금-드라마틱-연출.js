// ⑤ 스킬 해금 드라마틱 연출
// Auto-extracted from taleforge.html (original section banner preserved above).
import { getAllSkillDefs } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { esc } from '../utils.js';

export function showSkillUnlockEffect(skill){
  if(!skill) return;
  document.getElementById('skill-unlock-banner')?.remove();

  const banner = document.createElement('div');
  banner.id = 'skill-unlock-banner';
  banner.style.cssText = `
    position:fixed;top:60px;left:50%;transform:translateX(-50%);
    z-index:7000;width:90%;max-width:320px;
    background:linear-gradient(135deg,#050a1a,#0a1530);
    border:1px solid #2a4a8a;border-left:3px solid #4a80d0;
    padding:10px 14px;animation:fadeIn .3s ease;
    box-shadow:0 4px 20px rgba(74,128,208,.3);
  `;
  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:24px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(skill,{size:24}):(skill.icon||"⚡")}</span>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:8px;color:#4a80d0;letter-spacing:2px;margin-bottom:2px">✦ 스킬 해금</div>
        <div style="font-family:'Cinzel',serif;font-size:12px;color:#80b0f0">${esc(skill.name||'새 스킬')}</div>
        <div style="font-size:9px;color:var(--dim);margin-top:2px">${esc((skill.desc||'').slice(0,60))}</div>
      </div>
    </div>`;
  document.body.appendChild(banner);
  setTimeout(()=>{ banner.style.opacity='0'; banner.style.transition='opacity .5s';
    setTimeout(()=>banner.remove(), 500); }, 3500);
}
window.showSkillUnlockEffect = showSkillUnlockEffect;

window.showSkillUnlockEffect = showSkillUnlockEffect;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_208(){
const _origUnlockSkill = window.unlockSkill;

if(typeof window.unlockSkill === 'function'){
  window.unlockSkill = function(skillId){
    _origUnlockSkill.call(this, skillId);
    try{
      const def = getAllSkillDefs?.().find(s=>s.id===skillId);
      if(def) setTimeout(()=>showSkillUnlockEffect(def), 200);
    }catch(e){}
  };
}
}

