// 1. 신앙(fath) ↔ 종교 시스템 실제 연동
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { EVANGEL_ACTIONS } from '../data/090-1-마스터-데이터.js';
import { FAITH_TIERS } from '../data/101-1-신앙fath-종교-시스템-실제-연동.js';

export function getFaithTier(){
  const fath = S.stats?.fath||50;
  return FAITH_TIERS.find(t=>fath>=t.min&&fath<=t.max) || FAITH_TIERS[2];
}
window.getFaithTier = getFaithTier;

window.getFaithTier = getFaithTier;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_82(){
const _origPerformEvangel = window.performEvangel;

if(typeof _origPerformEvangel==='function'){
  window.performEvangel = function(actionName, region, targetReligion){
    const tier = getFaithTier();
    const action = EVANGEL_ACTIONS[actionName];
    if(action && tier.evangelBonus !== 0){
      const origEffect = action.effect;
      action.effect = Math.max(1, (action.effect||10) + tier.evangelBonus);
      _origPerformEvangel(actionName, region, targetReligion);
      action.effect = origEffect; // 복원
    } else {
      _origPerformEvangel(actionName, region, targetReligion);
    }
    // 교화 시 신앙 소폭 상승
    if(S.stats){ S.stats.fath = Math.min(999, (S.stats.fath||50)+3); }
  };
}

const _origSetPlayerReligion = window.setPlayerReligion;

if(typeof _origSetPlayerReligion==='function'){
  window.setPlayerReligion = function(religionId){
    _origSetPlayerReligion(religionId);
    if(religionId && S.stats){
      S.stats.fath = Math.max(S.stats.fath||50, 60); // 귀의하면 최소 신도 등급
    }
  };
}
}

