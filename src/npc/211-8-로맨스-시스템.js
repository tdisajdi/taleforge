// [8] 로맨스 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { ROMANCE_STAGES } from '../data/211-8-로맨스-시스템.js';
import { addButterflyEffect } from '../misc/015-시스템-1120.js';
import { recordRomanceLegacy } from '../progression/018-5170번-환생-누적-시스템.js';
import { setRedThread } from '../progression/020-101130번-환생-누적-시스템.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const ROMANCE_KEY        = 'tf-romance';

export const ROMANCE_POINTS_KEY = 'tf-romance-points';

export const ROMANCE_EVENTS_KEY = 'tf-romance-events';

window.ROMANCE_STAGES = ROMANCE_STAGES;

export function loadRomance() {
  try {
    const pts = lsGet(ROMANCE_POINTS_KEY); const evs = lsGet(ROMANCE_EVENTS_KEY);
    if (pts) {
      const pObj = JSON.parse(pts); const eObj = evs ? JSON.parse(evs) : {};
      const merged = {};
      Object.keys(pObj).forEach(name => { merged[name] = { ...pObj[name], events: eObj[name]||[] }; });
      return merged;
    }
    return JSON.parse(lsGet(ROMANCE_KEY)||'{}');
  } catch(e) { return {}; }
}
window.loadRomance = loadRomance;

export function saveRomance(d) {
  try {
    const points = {}; const events = {};
    Object.keys(d).forEach(name => { points[name]={points:d[name].points||0,stage:d[name].stage||0}; events[name]=d[name].events||[]; });
    lsSet(ROMANCE_POINTS_KEY, JSON.stringify(points));
    lsSet(ROMANCE_EVENTS_KEY, JSON.stringify(events));
    lsSet(ROMANCE_KEY, JSON.stringify(d)); // 하위호환
  } catch(e) {}
}
window.saveRomance = saveRomance;

export function addRomancePoint(npcName, delta) {
  try {
    const rom = loadRomance();
    if (!rom[npcName]) rom[npcName] = { points: 0, stage: 0, events: [] };
    rom[npcName].points = Math.max(0, Math.min(100, (rom[npcName].points || 0) + delta));
    checkRomanceStage(npcName, rom);
    saveRomance(rom);
  } catch(e) {}
}
window.addRomancePoint = addRomancePoint;

export function checkRomanceStage(npcName, rom) {
  try {
    rom = rom || loadRomance();
    const r = rom[npcName];
    if (!r) return;
    const newStage = [...ROMANCE_STAGES].reverse().find(s => r.points >= s.threshold);
    if (newStage && newStage.level !== r.stage) {
      const prev = ROMANCE_STAGES[r.stage];
      r.stage = newStage.level;
      toast(`${npcName}과의 관계: ${prev?.name||''} → ${newStage.name}`, 3000, newStage);
      if (newStage.level >= 4) { unlockAchievement('romance_bloom'); triggerRomanceEvent(npcName, newStage); }
    }
  } catch(e) {}
}
window.checkRomanceStage = checkRomanceStage;

export function triggerRomanceEvent(npcName, stage) {
  try {
    if (typeof addButterflyEffect === 'function')
      addButterflyEffect({ desc:`${npcName}와 ${stage.name} 관계 도달`, impact:3, worldChange:'인연이 깊어졌다' });
    if (typeof recordRomanceLegacy === 'function') recordRomanceLegacy(npcName, stage.level, S.scenario?.id);
    if (typeof setRedThread === 'function') setRedThread(npcName, stage.level*20, S.scenario?.id);
  } catch(e) {}
}
window.triggerRomanceEvent = triggerRomanceEvent;

export function getRomanceStatus(npcName) {
  try {
    const rom = loadRomance();
    const r = rom[npcName];
    if (!r) return ROMANCE_STAGES[0];
    return ROMANCE_STAGES[r.stage] || ROMANCE_STAGES[0];
  } catch(e) { return ROMANCE_STAGES[0]; }
}
window.getRomanceStatus = getRomanceStatus;

// [버그 수정] addRomancePoint는 ai-prompt/222의 GS 필드("romance")로
// 매 턴 정상적으로 호감도를 쌓고 있었지만, 정작 그 결과(현재 관계
// 단계 — 안면/친구/호감/연인/영원한 인연)를 AI에게 알려주는 경로가
// 어디에도 없었다. AI는 자기가 직접 서술한 과거 대화를 스스로 계속
// 기억해내지 못하는 한 현재 관계가 "연인" 단계에 도달했는지조차 알 수
// 없어, 이미 연인 사이인 NPC를 계속 초면인 것처럼 대하는 식의 서사
// 일관성 붕괴가 발생할 수 있었다. 관계가 진전된(1단계 이상) NPC들의
// 현재 단계를 매 턴 BLS로 전달한다.
export function getRomanceBLS(){
  try{
    const rom = typeof loadRomance==='function' ? loadRomance() : {};
    const active = Object.entries(rom).filter(([,r])=>(r?.stage||0) > 0);
    if(!active.length) return '';
    const lines = active.map(([name,r])=>{
      const stage = ROMANCE_STAGES[r.stage] || ROMANCE_STAGES[0];
      return `${name}: ${stage.icon}${stage.name}(${r.points||0}pt)`;
    });
    return '\n\n[💕 로맨스 관계] ' + lines.join(', ') + '\n각 NPC와의 현재 관계 단계에 맞는 태도와 애정 표현을 서사에 일관되게 반영하라.';
  }catch(e){ return ''; }
}
window.getRomanceBLS = getRomanceBLS;

window.loadRomance       = loadRomance;

window.addRomancePoint   = addRomancePoint;

window.checkRomanceStage = checkRomanceStage;

window.triggerRomanceEvent = triggerRomanceEvent;

window.getRomanceStatus  = getRomanceStatus;
