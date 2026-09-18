// 8. 레벨업/성장 연출 강화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { addUnifiedFame } from '../npc/286-6-평판명성-통합-시스템.js';

export function buildLevelGrowthNarrative(prevLv, newLv){
  const milestones = {
    5:  '처음 세상에 발을 내딛던 신인에서 벗어나 이제 어느 정도 실력을 인정받게 됐다.',
    10: '이름이 조금씩 알려지기 시작한다. 지나가던 여행자도 한 번 더 돌아본다.',
    20: '상당한 경험을 쌓은 실력자로 불린다. 약자들이 도움을 청하러 찾아온다.',
    30: '이 지역에서 모르는 사람이 없을 정도의 실력자가 됐다. 강호 고수들도 인정한다.',
    50: '전설의 반열에 오르기 시작한다. 왕국 귀족조차 예우를 갖춘다.',
    99: '세계의 정점. 그 이름 하나만으로 전장이 멈춘다.',
  };
  const hint = milestones[newLv] || (newLv % 10 === 0 ? `Lv.${newLv}의 경지. 내면에서 새로운 힘이 솟구치는 것을 느낀다.` : '');
  if(hint){
    setTimeout(()=>{
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        ` [🌟 레벨업 서사: Lv.${prevLv}→${newLv}] ${hint} 다음 장면에서 성장을 체감할 수 있는 변화를 자연스럽게 묘사하라.`;
    }, 3000);
  }
}
window.buildLevelGrowthNarrative = buildLevelGrowthNarrative;

window.buildLevelGrowthNarrative = buildLevelGrowthNarrative;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_259(){
(function patchDramaticLevelUp(){
  if(window._levelUpPatched) return;
  window._levelUpPatched = true;
  const _orig = window.dramaticLevelUp;
  if(typeof _orig !== 'function') return;
  window.dramaticLevelUp = function(prevLv, newLv){
    _orig.apply(this, arguments);
    buildLevelGrowthNarrative(prevLv||newLv-1, newLv);
    // 마일스톤 명성 보너스
    const milestone = newLv >= 50 ? 30 : newLv >= 30 ? 20 : newLv >= 20 ? 15 : newLv >= 10 ? 10 : 5;
    if(newLv % 10 === 0 || [5,15,25].includes(newLv))
      addUnifiedFame(milestone, `Lv.${newLv} 달성`);
  };
})();
}

