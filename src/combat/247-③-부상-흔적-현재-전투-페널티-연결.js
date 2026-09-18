// ③ 부상 흔적 → 현재 전투 페널티 연결
// Auto-extracted from taleforge.html (original section banner preserved above).
import { INJURY_PART_DEFS } from '../data/016-2130번-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { recordInjury } from '../misc/016-2130번-시스템.js';
import { toast } from '../utils.js';

export function checkCombatInjury(cleanText){
  if(!S?.stats) return;
  const hp    = S.stats.hp    || 100;
  const maxHp = S.stats.maxHp || 100;
  const pct   = hp / maxHp;
  if(pct > 0.25) return; // HP 25% 이하에서만 부상 체크
  if(S._injuryCheckedThisCombat) return;

  // 이미 상태이상 있으면 부상 가중
  const injuryMap = {
    '팔|손목|어깨|무기를 떨어': 'arm',
    '다리|무릎|발목|움직이지': 'leg',
    '눈|시야|앞이 보이지': 'eye',
    '머리|정신이 흐려|의식이': 'mind',
    '가슴|갈비|흉부|심장': 'chest',
    '목|숨이|호흡': 'throat',
  };

  let injuredPart = null;
  for(const [pattern, part] of Object.entries(injuryMap)){
    if(new RegExp(pattern).test(cleanText)){
      injuredPart = part; break;
    }
  }
  // 패턴 없으면 랜덤
  if(!injuredPart && pct < 0.15){
    const parts = Object.keys(INJURY_PART_DEFS);
    injuredPart = parts[Math.floor(Math.random()*parts.length)];
  }
  if(!injuredPart) return;

  S._injuryCheckedThisCombat = true;
  const def = INJURY_PART_DEFS[injuredPart];
  if(!def) return;

  // 전생 부상 기록 (다음 회차에 영향)
  if(typeof recordInjury === 'function') recordInjury(injuredPart);

  // 현재 전투 즉시 페널티 (S._combatInjury)
  S._combatInjury = S._combatInjury || {};
  S._combatInjury[def.statWeak] = (S._combatInjury[def.statWeak]||0) - 15;

  toastHTML(`🩸 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} ${esc(def.label)} 부상! ${esc(def.statWeak.toUpperCase())} -15`, 3000);
  S._nextInjectedContext = (S._nextInjectedContext||'') +
    `\n[🩸 부상] ${def.label}에 심각한 부상. ${def.statWeak} 대폭 감소. 부상 부위를 서사에 반영하고 치료 없이는 계속 악화됨을 묘사하라.`;
}
window.checkCombatInjury = checkCombatInjury;

export function getCombatInjuryBonus(statKey){
  return (S._combatInjury && S._combatInjury[statKey]) || 0;
}
window.getCombatInjuryBonus = getCombatInjuryBonus;

window.getCombatInjuryBonus = getCombatInjuryBonus;

export function tickResidualInjury(){
  if(!S?._combatInjury || S._inCombat) return;
  let changed = false;
  for(const k in S._combatInjury){
    const v = S._combatInjury[k];
    if(v === 0) continue;
    const recovered = v * 0.2; // 20%씩 회복(0에 가까워짐)
    const next = Math.abs(recovered) < 0.5 ? 0 : Math.round(v - recovered);
    if(next !== v){ S._combatInjury[k] = next; changed = true; }
  }
  if(changed){
    // 모두 회복됐으면 정리
    for(const k in S._combatInjury){ if(S._combatInjury[k]===0) delete S._combatInjury[k]; }
    if(!Object.keys(S._combatInjury).length){
      toast('🩹 부상이 완전히 회복됐다', 2000);
    }
  }
}
window.tickResidualInjury = tickResidualInjury;

window.tickResidualInjury = tickResidualInjury;
