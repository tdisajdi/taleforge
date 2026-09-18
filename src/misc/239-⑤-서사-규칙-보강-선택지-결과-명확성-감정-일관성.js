// ⑤ 서사 규칙 보강 — 선택지 결과 명확성 + 감정 일관성
// Auto-extracted from taleforge.html (original section banner preserved above).



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_214(){
const _prevCallAI3 = window.callAI;

window.callAI = async function(history, injectedContext='', retryCount=0){
  let ctx = injectedContext;
  if(retryCount === 0){
    // 서사 품질 규칙 주입
    const narrativeRule =
      '\n[📖 서사 규칙]' +
      '\n• 선택지는 항상 전 턴 플레이어 행동의 결과가 반영된 상황에서 제시한다.' +
      '\n• NPC의 감정과 반응은 플레이어 이전 행동과 관계도에 일관성 있게 연동한다.' +
      '\n• **중요 대사**나 *감정적 순간*은 강조 표현을 사용해 서사적 무게를 준다.' +
      '\n• 선택지는 3~4개, 각각 다른 접근법(전투/외교/은신/기지)을 포함한다.';
    ctx = ctx + narrativeRule;
  }
  return _prevCallAI3.call(this, history, ctx, retryCount);
};
}

