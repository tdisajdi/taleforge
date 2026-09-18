// 9. BLS 강화 — 회차 진화명 + 각성 상태 + 힌트 주입
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { BLOODLINE_MASTER } from '../data/124-1-통합-혈통-정의-BLOODLINETYPES-BLOODLINEDEFS-.js';
import { getBloodlineEvolution } from '../progression/126-5-회차-진화-완전-자동.js';
import { loadBL } from '../summon/124-1-통합-혈통-정의-BLOODLINETYPES-BLOODLINEDEFS-.js';



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_111(){
const _origGetBloodlineBLS = window.getBloodlineBLS;

window.getBloodlineBLS = function(){
  const bl = loadBL();
  if(!bl?.type) return typeof _origGetBloodlineBLS==='function'?_origGetBloodlineBLS():'';

  const def  = BLOODLINE_MASTER[bl.type]||{};
  const evo  = getBloodlineEvolution();
  const turn = S.msgCount||0;
  const isActive = bl.awakened && bl.activeUntil && turn <= bl.activeUntil;
  const canAwaken = !bl.awakened || (bl.activeUntil && turn > bl.activeUntil+20);

  let bls = `\n\n[🩸 혈통 — ${evo?.stageName||def.name||bl.type}]`;
  bls += `\n기본: ${def.name||bl.type} | 진화명: ${evo?.stageName||def.name}`;
  bls += `\n힌트: ${def.hint||''}`;
  bls += `\n각성 조건: ${def.awakeCond||''}`;

  if(isActive){
    bls += `\n⚡ 현재 각성 상태! "${def.skill}" 발동 중 — 이번 서사에 반드시 반영하라.`;
    bls += `\nGS 가이드: {"bloodline_awaken":"${bl.type}"} 각성 효과 서사화`;
  } else if(canAwaken){
    bls += `\n[각성 대기] 조건 충족 시 GS: {"bloodline_awaken":"${bl.type}"} 출력하면 자동 각성됨`;
  }

  if(bl.origin){
    bls += `\n기원: ${bl.origin}`;
  } else {
    bls += `\n기원: 아직 밝혀지지 않음 — 적절한 순간에 서사 속에서 자연스럽게 드러낼 것`;
    bls += `\n혈통 공개 시: GS {"bloodline_discover":"기원 설명 1~2문장"} 출력`;
  }

  // 회차 진화명 주입
  if(evo?.raceEvo?.isEvolved){
    bls += `\n종족 진화: ${evo.raceEvo.name} (${evo.raceEvo.count}회차)`;
    bls += `\n→ 종족명과 혈통명을 NPC가 경외심으로 부를 것`;
  }

  // 힌트 기록 (이미 나온 힌트)
  if(bl.hints?.length){
    bls += `\n[이미 드러난 혈통 힌트]: ${bl.hints.slice(-2).map(h=>h.text).join(' / ')}`;
  }

  return bls;
};
}

