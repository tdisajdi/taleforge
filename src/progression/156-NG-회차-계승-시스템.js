// NG+ 회차 계승 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { ENDING_DEFINITIONS } from '../data/155-⑭-메모리-패널-UI.js';
import { loadTitles } from '../job/010-스킬-강화-시스템.js';
import { getPlayerMaxHp } from '../misc/054-이동수단-시스템.js';
import { loadPlayerDB } from '../misc/144-⑤-플레이어-상태-DB.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadWorldDB } from '../world/145-⑥-세계-상태-DB.js';
import { v36_getReincarnationCount } from './014-환생-누적-시스템-110번.js';

export const LEGACY_KEY = 'tf-ng-plus-legacy';

export function loadLegacy(){ try{ return JSON.parse(lsGet(LEGACY_KEY)||'{}'); }catch(e){ return {}; } }
window.loadLegacy = loadLegacy;

export function saveLegacy(d){ try{ lsSet(LEGACY_KEY,JSON.stringify(d)); }catch(e){} }
window.saveLegacy = saveLegacy;

export function saveLoopLegacy(endingId){
  const legacy = loadLegacy();
  const loop   = typeof v36_getReincarnationCount==='function' ? v36_getReincarnationCount() : 0;
  const playerDB = typeof loadPlayerDB==='function' ? loadPlayerDB() : {};
  const summons  = typeof window.loadSummons==='function'  ? window.loadSummons()||[] : [];

  // 이전 회차들 보존
  if(!legacy.loops) legacy.loops = [];
  legacy.loops.push({
    loopNum:   loop,
    endingId:  endingId||'neutral_ending',
    titles:    typeof loadTitles==='function' ? loadTitles() : [],
    scars:     playerDB.scars||[],
    achievements: playerDB.achievements||[],
    moralAlignment: playerDB.moralAlignment||0,
    summonBonds: summons.filter(function(s){ return (s.affection||0)>=50; }).map(function(s){
      return { name:s.name, icon:s.icon, category:s.category, level:s.level, evoCount:s.evoCount, affection:s.affection };
    }),
    worldFlags: typeof loadWorldDB==='function' ? Object.keys((loadWorldDB().flags||{})).filter(function(k){ return (loadWorldDB().flags||{})[k]?.set; }) : [],
    savedAt: new Date().toISOString(),
  });
  

  // 계승 보너스 계산
  const endDef = typeof ENDING_DEFINITIONS!=='undefined' ? ENDING_DEFINITIONS[endingId||'neutral_ending'] : null;
  legacy.pendingBonus = {
    endingId,
    endingIcon: endDef ? endDef.icon : '⚖️',
    endingName: endDef ? endDef.name : '알 수 없는 엔딩',
    statBonus:  endingId==='true_ending' ? {hp:50,atk:10,def:5} : endingId==='good_ending' ? {hp:20,atk:5} : {},
    specialTitle: endingId==='true_ending' ? '루프 해방자' : endingId==='loop_master_ending' ? '루프의 주인' : null,
    loopMemory:  loop+1,
  };
  saveLegacy(legacy);
  toast('📖 회차 기록이 저장됐습니다. 다음 생에서 이어집니다.', 4000);
}
window.saveLoopLegacy = saveLoopLegacy;

window.saveLoopLegacy = saveLoopLegacy;

export function applyLegacyBonus(){
  const legacy = loadLegacy();
  if(!legacy.pendingBonus) return;
  const bonus = legacy.pendingBonus;

  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n\n[👑 회차 계승 보너스 적용]\n'
    +bonus.endingIcon+' '+bonus.endingName+' 달성의 기억이 이 생에 스며든다.\n'
    +(bonus.specialTitle?'칭호 "'+bonus.specialTitle+'" 계승\n':'')
    +(bonus.loopMemory?'이것은 '+bonus.loopMemory+'번째 삶이다.\n':'')
    +'이전 회차의 흉터·기억·유대가 서사에 자연스럽게 반영되어야 한다.\n'
    +'GS: "apply_legacy":{"confirmed":true}';

  // [B73 FIX] bonus.statBonus가 정확히 계산되지만 이 함수 어디에서도
  // 참조되지 않아 진/선 엔딩 계승 스탯 보너스(HP/ATK/DEF)가 UI에는
  // "적용됨"으로 표시되면서도 실제로는 전혀 반영되지 않던 버그.
  // updateRuneGemBonuses()/applyHeritageToNewLoop()와 동일한 매핑으로 적용.
  if(bonus.statBonus && S.stats){
    const sb = bonus.statBonus;
    if(sb.atk) S.stats.str = Math.min(999, (S.stats.str||10) + sb.atk);
    if(sb.def) S.stats.end = Math.min(999, (S.stats.end||10) + sb.def);
    if(sb.hp)  S.stats.hp  = Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999), (S.stats.hp||100) + sb.hp);
  }

  legacy.pendingBonus = null;
  saveLegacy(legacy);
}
window.applyLegacyBonus = applyLegacyBonus;

window.applyLegacyBonus = applyLegacyBonus;

export function getLegacyBLS(){
  const legacy = loadLegacy();
  if(!legacy.loops||!legacy.loops.length) return '';
  const loops = legacy.loops.slice(-3);
  const lines = loops.map(function(l){
    return (l.endingId||'?')+'('+l.loopNum+'회차) — 소환수 유대: '+l.summonBonds.length+'기 / 흉터: '+l.scars.length+'개 / 도덕: '+l.moralAlignment;
  });
  return '\n\n[👑 전생 기록 (최근 '+loops.length+'회차)]\n'+lines.join('\n')
    +'\n전생의 기억이 서사에 스며든다. NPC들이 전생의 흔적을 감지할 수 있다.';
}
window.getLegacyBLS = getLegacyBLS;

window.getLegacyBLS = getLegacyBLS;
