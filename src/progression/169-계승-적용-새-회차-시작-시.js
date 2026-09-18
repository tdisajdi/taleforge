// 계승 적용 (새 회차 시작 시)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { HERITAGE_ITEMS, MILESTONES } from '../data/165-저장소.js';
import { HERITAGE_CAPS } from '../data/166-밸런스-상한선-과도한-누적-방지.js';
import { getPlayerMaxHp } from '../misc/054-이동수단-시스템.js';
import { loadHeritage, loadMilestones } from '../world/165-저장소.js';
import { v36_getReincarnationCount } from './014-환생-누적-시스템-110번.js';

export function applyHeritageToNewLoop(){
  const h       = loadHeritage();
  const ms      = loadMilestones();
  const loop    = typeof v36_getReincarnationCount==='function' ? v36_getReincarnationCount() : 0;
  const items   = h.items||{};
  const applied = {};

  // 스탯 보너스 계산 (상한선 적용)
  let totalAtk=0, totalDef=0, totalHp=0;
  Object.entries(items).forEach(function(entry){
    const id=entry[0], cnt=entry[1];
    const def=HERITAGE_ITEMS[id];
    if(!def||!def.statBonus) return;
    totalAtk += (def.statBonus.atk||0)*cnt;
    totalDef += (def.statBonus.def||0)*cnt;
    totalHp  += (def.statBonus.hp||0)*cnt;
  });
  // 상한선 적용
  totalAtk = Math.min(totalAtk, HERITAGE_CAPS.max_stat_bonus_atk);
  totalDef = Math.min(totalDef, HERITAGE_CAPS.max_stat_bonus_def);
  totalHp  = Math.min(totalHp,  HERITAGE_CAPS.max_stat_bonus_hp);
  applied.stats = { atk:totalAtk, def:totalDef, hp:totalHp };

  // 마일스톤 스탯 보너스
  MILESTONES.filter(function(m){ return ms.includes(m.id)&&m.effect&&m.effect.hp; }).forEach(function(m){
    applied.stats.hp  = (applied.stats.hp||0)+(m.effect.hp||0);
    applied.stats.atk = (applied.stats.atk||0)+(m.effect.atk||0);
    applied.stats.def = (applied.stats.def||0)+(m.effect.def||0);
  });

  // 경험치 배율 (루프 베테랑)
  const expMult = Math.min(HERITAGE_CAPS.max_exp_mult, 1 + loop*0.02 + (items.loop_veteran?0.1:0));
  applied.expMult = expMult;

  // 게임플레이 이펙트 목록
  applied.effects = [];
  Object.entries(items).forEach(function(entry){
    const id=entry[0];
    const def=HERITAGE_ITEMS[id];
    if(def&&def.gameplayEffect) applied.effects.push(def.gameplayEffect);
  });

  // 시작 골드 보너스
  const goldBonus = Math.min(HERITAGE_CAPS.max_gold_start, (items.merchant_eye||0)*500);
  applied.goldBonus = goldBonus;

  // S.heritage에 저장 (런타임)
  S.heritageApplied = applied;

  // 시작 컨텍스트 주입
  const bonusLines = [];
  if(totalAtk>0||totalDef>0||totalHp>0) bonusLines.push('스탯: ATK+'+totalAtk+' DEF+'+totalDef+' HP+'+totalHp);
  if(expMult>1) bonusLines.push('경험치 획득 ×'+expMult.toFixed(2));
  if(goldBonus>0) bonusLines.push('시작 골드 +'+goldBonus+'G');
  if(applied.effects.length) bonusLines.push('특수 효과: '+applied.effects.join(', '));

  if(bonusLines.length){
    S._nextInjectedContext = (S._nextInjectedContext||'')
      +'\n\n[🏛️ 계승 보너스 적용됨]\n'+bonusLines.join('\n')
      +'\n이 계승 보너스를 자연스럽게 서사에 녹여라. 전생의 기억이 몸에 남아있는 느낌으로.';
    if(goldBonus>0 && S.gold!=null) S.gold += goldBonus;
  }
  // [B68 FIX] applied.stats(atk/def/hp)가 UI에는 "적용됨"으로 표시되지만
  // 실제 S.stats에 대입하는 코드가 없어 계승 스탯 보너스가 전혀 반영되지
  // 않던 버그. atk/def는 정식 스탯이 아니므로 updateRuneGemBonuses()와
  // 동일한 statMap 패턴(atk→str, def→end)으로 실제 스탯에 반영한다.
  if(S.stats){
    if(applied.stats.atk) S.stats.str = Math.min(999, (S.stats.str||10) + applied.stats.atk);
    if(applied.stats.def) S.stats.end = Math.min(999, (S.stats.end||10) + applied.stats.def);
    if(applied.stats.hp)  S.stats.hp  = Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999), (S.stats.hp||100) + applied.stats.hp);
  }
  return applied;
}
window.applyHeritageToNewLoop = applyHeritageToNewLoop;

window.applyHeritageToNewLoop = applyHeritageToNewLoop;
