// 세트 아이템 효과 시스템 (SET_DEFS + calcSetBonus 로 통합됨)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { SET_DEFS, calcSetBonus } from './006-세트-아이템-시스템.js';
import { loadEquipped } from './007-동적-아이템-생성-시스템-무제한-영구-캐시.js';

export function getSetItemBLS(){
  const {activeSetBonus} = calcSetBonus();
  const keys = Object.keys(activeSetBonus);
  if(!keys.length){
    // 미완성 세트 힌트 — 1개 이상 장착 중인 세트만
    const equipped = typeof loadEquipped==='function'?loadEquipped()||{}:{};
    const equippedIds = Object.values(equipped).filter(Boolean).map(it=>it.id);
    const hints = [];
    Object.entries(SET_DEFS).forEach(function(entry){
      const setId=entry[0], set=entry[1];
      const count = set.items.filter(function(id){ return equippedIds.includes(id); }).length;
      if(count>=1) hints.push(set.icon+' '+set.name+' '+count+'/'+set.items.length+'개 장착');
    });
    if(!hints.length) return '';
    return '\n\n[🔰 세트 아이템 진행도]\n'+hints.join('\n')+'\n세트 완성 시 강력한 효과 발동. 관련 던전·퀘스트·전투 보상에서 찾을 수 있다.';
  }
  const lines = keys.map(function(k){
    const ae=activeSetBonus[k];
    const descs = (ae.bonuses||[]).map(function(b){ return b.desc; }).join(', ');
    return ae.icon+' '+ae.name+' ('+ae.count+'개/'+ae.total+'): '+descs;
  });
  return '\n\n[🔰 활성 세트 효과]\n'+lines.join('\n')
    +'\n세트 효과를 전투·NPC 반응에 반영하라. 특수 스킬이 있으면 자동 사용 가능하다.';
}
window.getSetItemBLS = getSetItemBLS;

window.getSetItemBLS = getSetItemBLS;
