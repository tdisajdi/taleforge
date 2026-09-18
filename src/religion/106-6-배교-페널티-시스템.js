// 6. 배교 페널티 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RELIGIONS } from '../data/090-1-마스터-데이터.js';
import { APOSTASY_COOLDOWN, APOSTASY_PENALTY } from '../data/106-6-배교-페널티-시스템.js';
import { toast } from '../utils.js';
import { getPlayerReligion } from './094-5-플레이어-종교-귀속-교화.js';



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_87(){
const _origSetPlayerReligion2 = window.setPlayerReligion;

window.setPlayerReligion = function(religionId){
  const prev = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;

  // 배교 처리
  if(prev && prev !== religionId){
    const penalty = APOSTASY_PENALTY[prev];
    if(penalty){
      if(S.stats){
        S.stats.rep  = Math.max(-100,(S.stats.rep||0) + (penalty.rep||0));
        S.stats.fath = Math.max(0,(S.stats.fath||50)  + (penalty.fath||0));
        if(penalty.str) S.stats.str = Math.max(0,(S.stats.str||10)+penalty.str);
      }
      toast('⚠️ 배교: '+penalty.msg, 4000);
      APOSTASY_COOLDOWN[prev] = (S.msgCount||0);

      if(typeof addTimelineEvent==='function')
        addTimelineEvent('event', `배교: ${RELIGIONS[prev]?.name||prev} 이탈`, {icon:'💔'});

      // 전 종교의 보복 예약
      S._nextInjectedContext = (S._nextInjectedContext||'')
        +`\n[💔 배교 선언] 플레이어가 ${RELIGIONS[prev]?.name||prev}에서 이탈했다. `
        +'전 종교 성직자들이 배신자로 간주하며 적대하는 장면을 자연스럽게 삽입하라.';
    }
  }

  if(typeof _origSetPlayerReligion2==='function') _origSetPlayerReligion2(religionId);
};
}

