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
      // [63번 섹션] 'romance_max'(운명의 상대, 호감도 100 달성 — data/088에
      // 이미 CHA+10 보상까지 정의돼 있었다)가 어디서도 unlockAchievement로
      // 호출되지 않아 영원히 해금 불가능했던 죽은 업적 — 레벨5(영원한 인연)
      // 도달 시점에 바로 연결한다.
      if (newStage.level >= 5) { unlockAchievement('romance_max'); }
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

// [63번 섹션] 근본 원인 수정 — addRomancePoint의 유일한 실제 호출부가
// ai-prompt/222의 processGSBlock(AI가 생성한 서사의 gs.romance 태그를
// 파싱)뿐이었다. 이 세션 전체의 대전제("완전 무-API 판매")로 클라우드
// tier가 비활성화돼 있어, 로맨스 호감도가 오를 수 있는 로컬 경로가
// 단 하나도 없었다 — 즉 레벨5(영원한 인연)는 이 빌드에서 영원히
// 도달 불가능했다. 자매 시스템(items/065의 giftNpc → updateNpcRelationship,
// 선물 버튼으로 즉시 로컬 반영)엔 이미 수동 버튼이 있는데 로맨스축만
// 빠져있던 고신뢰 버그 클래스 — 같은 "선물하기" 버튼 옆에 "구애하기"
// 버튼을 신설해 로컬 다이스 굴림으로 직접 호감도를 올릴 수 있게 한다.
export function courtNpc(npcName){
  try{
    const delta = 5 + Math.floor(Math.random()*11); // 5~15
    addRomancePoint(npcName, delta);
    toast(`💘 ${npcName}에게 마음을 전했다. 호감도+${delta}`, 2500);
  }catch(e){}
}
window.courtNpc = courtNpc;

export const MARRIAGE_KEY = 'tf-marriage';

export function loadMarriage(){
  try{ return JSON.parse(lsGet(MARRIAGE_KEY)||'null') || { spouseName:null, marriedAt:null, bonusGiven:false }; }
  catch(e){ return { spouseName:null, marriedAt:null, bonusGiven:false }; }
}
window.loadMarriage = loadMarriage;

export function saveMarriage(d){ try{ lsSet(MARRIAGE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveMarriage = saveMarriage;

// [63번 섹션] 결혼 — 로맨스 레벨5(영원한 인연)가 레벨4와 똑같은
// triggerRomanceEvent()만 재사용하고 전용 결혼식/배우자 보너스/거주
// 연동이 전혀 없던 공백을 메운다. 자동으로 발생하지 않고 플레이어가
// 명확히 "청혼"을 선택해야만 하는 의도적 행동으로 설계("뭐든 할 수
// 있는 생태계" — 서사가 강제하지 않고 플레이어가 직접 결정).
export function proposeMarriage(npcName){
  try{
    const status = getRomanceStatus(npcName);
    if(status.level < 5){ toast('아직 그 정도로 깊은 사이는 아니다.', 2500); return; }
    const marriage = loadMarriage();
    if(marriage.spouseName){
      toast(marriage.spouseName===npcName ? '이미 배우자다.' : `이미 ${marriage.spouseName}과(와) 혼인한 상태다.`, 2500);
      return;
    }
    marriage.spouseName = npcName;
    marriage.marriedAt = new Date().toISOString();
    if(!marriage.bonusGiven){
      S.stats.wil = Math.min(999,(S.stats.wil||50)+15);
      S.stats.cha = Math.min(999,(S.stats.cha||50)+10);
      marriage.bonusGiven = true;
      if(typeof window.updateHeader==='function') window.updateHeader();
    }
    saveMarriage(marriage);
    toast(`💍 ${npcName}과(와) 영원한 인연을 맺었다. 평생의 동반자가 생겼다! WIL+15, CHA+10`, 4000);
  }catch(e){}
}
window.proposeMarriage = proposeMarriage;
