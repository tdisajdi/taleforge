// ⑩ 상태이상 아이콘 헤더 직접 표시
// Auto-extracted from taleforge.html (original section banner preserved above).
import { getActiveEffects } from '../ui/155-⑭-메모리-패널-UI.js';

export function renderStatusIconsInHeader(){
  // [BUG FIX] loadStatusEffects가 객체 반환 — getActiveEffects로 player 배열만 추출
  const effects = (typeof getActiveEffects==='function') ? getActiveEffects('player') : [];
  let container = document.getElementById('h-status-icons');
  if(!container){
    container = document.createElement('div');
    container.id='h-status-icons';
    container.style.cssText='display:flex;gap:2px;align-items:center';
    const hs = document.querySelector('.hdr-stats');
    if(hs) hs.insertBefore(container, hs.firstChild);
  }
  if(!effects.length){ container.innerHTML=''; return; }
  container.innerHTML = effects.slice(0,4).map(e=>{
    const def = (typeof window.STATUS_EFFECTS!=='undefined') ? window.STATUS_EFFECTS[e.id] : null;
    return `<span title="${def?.name||e.id} (${e.duration||0}턴)" style="font-size:11px;cursor:default">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def?.icon||'⚡')}</span>`;
  }).join('');
}
window.renderStatusIconsInHeader = renderStatusIconsInHeader;

window.renderStatusIconsInHeader = renderStatusIconsInHeader;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_217(){
if(typeof window.updateHeader === 'function'){
  const __prevUH = window.updateHeader;
  window.updateHeader = function(){
    __prevUH.apply(this, arguments);
    try{ renderStatusIconsInHeader(); }catch(e){}
  };
}
}

