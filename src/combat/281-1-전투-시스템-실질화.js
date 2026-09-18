// 1. 전투 시스템 실질화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { COMBAT_ACTIONS } from '../data/281-1-전투-시스템-실질화.js';

export function buildCombatChoices(monsters, lastUserAction){
  if(!monsters || !monsters.length) return null;
  const alive = monsters.filter(m=>m.status==='alive');
  if(!alive.length) return null;
  const target = alive[0];
  const hp = target.hp || 0;
  const maxHp = target.maxHp || 100;
  const hpPct = Math.round(hp/maxHp*100);

  // 직전 행동 유형 감지 (COMBAT_ACTIONS 키워드 매칭) — 같은 행동 반복 시 다른 선택지를 우선 제시
  let lastActionType = null;
  if(lastUserAction && typeof COMBAT_ACTIONS!=='undefined'){
    for(const [key, def] of Object.entries(COMBAT_ACTIONS)){
      if(def.keys.some(k=>lastUserAction.includes(k))){ lastActionType = key; break; }
    }
  }

  // 상황별 선택지 구성
  const choices = [];
  if(lastActionType==='attack'){
    choices.push(`이번엔 다른 방식으로 ${target.icon||'👹'}${target.name}을 노린다 (AGI)`);
  } else {
    choices.push(`${target.icon||'👹'}${target.name}에게 전력으로 공격한다 (STR)`);
  }
  if((S.stats?.mgc||0) >= 30)
    choices.push(`마법을 시전해 ${target.name}을 공격한다 (MGC, MP-15)`);
  else
    choices.push(`방어 태세로 적의 다음 공격을 막는다 (END)`);
  if(hpPct <= 40)
    choices.push(`${target.name}이 약해졌다 — 필살기를 시도한다`);
  else if((S.stats?.agi||0) >= 40)
    choices.push(`빠르게 움직여 ${target.name}의 약점을 노린다 (AGI)`);
  else
    choices.push(`주변 환경을 이용해 유리한 위치를 잡는다`);

  return choices;
}
window.buildCombatChoices = buildCombatChoices;

window.buildCombatChoices = buildCombatChoices;

export function getEquippedItemCombatHint(){
  try{
    const eq = S.equipped || {};
    const weapon = eq.weapon;
    const armor  = eq.armor;
    const hints = [];
    if(weapon) hints.push(`장비한 ${weapon.icon||'⚔️'}${weapon.name}의 특성을 전투 서사에 반영하라.`);
    if(armor)  hints.push(`${armor.icon||'🛡️'}${armor.name}이 방어에 어떤 역할을 하는지 묘사하라.`);
    return hints.join(' ');
  }catch(e){ return ''; }
}
window.getEquippedItemCombatHint = getEquippedItemCombatHint;

window.getEquippedItemCombatHint = getEquippedItemCombatHint;
