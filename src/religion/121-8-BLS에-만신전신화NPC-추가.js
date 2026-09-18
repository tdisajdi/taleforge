// 8. BLS에 만신전/신화/NPC 추가
// Auto-extracted from taleforge.html (original section banner preserved above).
import { PANTHEON } from '../data/116-3-만신전-신격-존재-정의.js';
import { RELIGION_SIDE_QUESTS } from '../data/119-6-종교-사이드-퀘스트-20개-세계관-이해-연동.js';
import { getPlayerReligion } from './094-5-플레이어-종교-귀속-교화.js';
import { getReligionNPCSection } from './117-4-종교-전용-NPC-풀.js';
import { loadReligionSQ } from './119-6-종교-사이드-퀘스트-20개-세계관-이해-연동.js';



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_102(){
const _origGetReligionBLS2 = window.getReligionBLS;

window.getReligionBLS = function(){
  const base = typeof _origGetReligionBLS2==='function' ? _origGetReligionBLS2() : '';
  const rel  = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;

  // 소속 신격 정보
  let deitySection = '';
  if(rel){
    const deities = Object.values(PANTHEON).filter(d=>d.religion===rel);
    if(deities.length){
      deitySection = `\n[🌌 소속 신격]\n${deities.map(d=>`• ${d.icon} ${d.name} (${d.title}): ${d.personality}`).join('\n')}`;
    }
  }

  // 창세신화 요약 (AI에게 세계관 맥락 제공)
  const mythSummary = `\n[📖 세계관 신화 요약]\n• 창세: 세계수 이그드라에서 세계가 생겨났다. 심연은 그 그림자에서 태어났다.\n• 역사: 300년 전 제1차 신성전쟁. 알테라 조약으로 지역별 종교 구역 분할.\n• 현재: 4+2 종교의 긴장 고조. 세계수 시듦 소문.`;

  // 활성 사이드 퀘스트 힌트
  const sqDone = loadReligionSQ();
  const activeSQ = RELIGION_SIDE_QUESTS.filter(sq=>sqDone[sq.id]==='discovered' && sqDone[sq.id]!=='completed');
  const sqSection = activeSQ.length ? `\n[📜 진행 중인 종교 사이드 퀘스트]\n${activeSQ.map(sq=>`• ${sq.icon} ${sq.title}: ${sq.phases[0]}`).join('\n')}` : '';

  // NPC 섹션
  const npcSection = getReligionNPCSection();

  return base + deitySection + mythSummary + sqSection + npcSection;
};
}

