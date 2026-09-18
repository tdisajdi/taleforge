// 궁수 계열 T2 파생 5종 칭호 — 전사·마법사·도적 계열과 동일한 절제 원칙.
// Auto-extracted from taleforge.html (original section banner preserved above).
import { LEGACY_TITLE_DEFS } from '../data/012-궁수-계열-T2-파생-5종-칭호-전사마법사도적-계열과-동일한-절제-원칙.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { getStatInfo } from '../job/010-스킬-강화-시스템.js';
import { loadPermStatBonus } from '../misc/015-시스템-1120.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadCycleCount } from './014-환생-누적-시스템-110번.js';

export const LEGACY_TITLE_KEY = 'tf-legacy-titles';

export function loadLegacyTitles(){ try{ return JSON.parse(lsGet(LEGACY_TITLE_KEY)||'[]'); }catch(e){ return []; } }
window.loadLegacyTitles = loadLegacyTitles;

export function saveLegacyTitles(d){ try{ lsSet(LEGACY_TITLE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveLegacyTitles = saveLegacyTitles;

export function checkAndGrantLegacyTitles(){
  const owned = loadLegacyTitles();
  const cycle = loadCycleCount() || 0;
  const perm  = loadPermStatBonus();
  const ownedIds = new Set(owned.map(t=>t.id));

  LEGACY_TITLE_DEFS.forEach(def => {
    if(ownedIds.has(def.id)) return; // 이미 보유
    let met = false;
    if(def.condition.type === 'cycle'){
      met = cycle >= def.condition.value;
    } else if(def.condition.type === 'permStat'){
      met = (perm[def.condition.stat] || 0) >= def.condition.value;
    }
    if(!met) return;
    // 조건 충족 → 영구 칭호 부여
    owned.push({ id:def.id, unlockedAt:new Date().toISOString(), cycle });
    saveLegacyTitles(owned);
    // 스탯 보너스 즉시 적용
    if(def.bonus && S.stats){
      Object.entries(def.bonus).forEach(([k,v])=>{
        if(S.stats[k]!==undefined) S.stats[k] = Math.min(999,(S.stats[k]||0)+v);
      });
    }
    // 알림 (환생 화면에서 보임)
    setTimeout(()=>{
      toast(`레거시 칭호 해금: ${def.name}!`, 4500, def);
      showLegacyTitlePopup(def);
    }, 1200);
  });
}
window.checkAndGrantLegacyTitles = checkAndGrantLegacyTitles;

export function showLegacyTitlePopup(def){
  const popup = document.createElement('div');
  popup.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
    z-index:9800;background:#0a0500;border:2px solid #c8a96e;
    padding:24px 28px;text-align:center;max-width:320px;width:90%;
    animation:fadeIn .4s ease;box-shadow:0 0 30px #c8a96e44`;
  popup.innerHTML = `
    <div style="font-size:8px;color:#6a5a3a;font-family:'Cinzel',serif;letter-spacing:3px;margin-bottom:10px">LEGACY TITLE</div>
    <div style="display:flex;justify-content:center;color:#c8a96e;margin-bottom:10px;filter:drop-shadow(0 0 12px #c8a96e);transform:scale(2.4)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:16}):(def.svgIcon||def.icon)}</div>
    <div style="font-family:'Cinzel',serif;font-size:16px;color:#c8a96e;letter-spacing:2px;margin-bottom:6px">${def.name}</div>
    <div style="font-size:11px;color:#8a7a5a;line-height:1.6;margin-bottom:12px">${def.desc}</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-bottom:14px">
      ${Object.entries(def.bonus).map(([k,v])=>{
        const i = getStatInfo(k);
        return `<span style="padding:2px 8px;background:#1a1005;border:1px solid #c8a96e;color:#c8a96e;font-family:'Cinzel',serif;font-size:9px">${i?.name||k.toUpperCase()} +${v}</span>`;
      }).join('')}
    </div>
    <button onclick="this.parentElement.remove()" style="padding:8px 20px;background:linear-gradient(135deg,#c8a96e,#e8c97e);color:#0d0800;font-family:'Cinzel',serif;font-size:10px;cursor:pointer;border:none">확인</button>
  `;
  document.body.appendChild(popup);
}
window.showLegacyTitlePopup = showLegacyTitlePopup;
