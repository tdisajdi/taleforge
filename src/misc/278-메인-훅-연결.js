// 메인 훅 연결
// Auto-extracted from taleforge.html (original section banner preserved above).
import { pmGetBLS } from './275-선택-파트-업데이트.js';
import { renderMemoryEnhanced } from './277-PM-수동-편집-헬퍼-함수.js';

(function patchPMv2(){
  var tryPatch = function() {
    if (window._pmv2Patched) return;
    if (typeof window.buildLightSystem !== 'function' || typeof window.sendMsg !== 'function') {
      setTimeout(tryPatch, 1500); return;
    }
    window._pmv2Patched = true;

    // 1. buildLightSystem — PM BLS 주입
    var _origBLS = window.buildLightSystem;
    window.buildLightSystem = function() {
      var result = _origBLS.apply(this, arguments);
      try {
        var pmBLS = pmGetBLS();
        if (pmBLS && typeof result === 'string') result += pmBLS;
      } catch(e) {}
      return result;
    };

    // [버그 수정] 이 자리에 있던 항목 2(sendMsg 감싸기 — PM 텍스트 감지·
    // 하드코딩 데이터 수집·주기 동기화), 항목 3(detectConsequences 감싸기),
    // 항목 5(startGame 감싸기 — 개인 기억 초기화)는 전부 window.X를
    // 재할당하는 방식이었다. 그런데 sendMsg/detectConsequences/startGame는
    // 전부 실제 호출부(quest/086, core/084)가 같은 파일 안에서 로컬 바인딩
    // (또는 quest/086이 직접 import한 바인딩)으로 호출하기 때문에, 이
    // 재할당이 절대 도달하지 못했다 — 다른 죽은 훅들과 동일한 원인.
    //   · 항목 2의 로직: quest/086의 sendMsg() 후처리 블록(응답 렌더링 직후,
    //     checkHomelandNpcReunion 등과 같은 자리)에 네이티브로 이동.
    //   · 항목 3의 로직: quest/086에서 detectConsequences(cleanText)를 실제
    //     호출하는 지점 바로 뒤에 네이티브로 이동.
    //   · 항목 5의 로직: core/084의 startGame() 안, doStartChat() 호출
    //     직후에 네이티브로 이동(원래와 동일하게 2초 지연).
    // 항목 6(newGame 감싸기)은 window.newGame이라는 함수 자체가 이
    // 코드베이스 어디에도 정의된 적이 없어 애초에 가드를 통과하지 못하고
    // 설치조차 되지 않았다 — 그런데 이 항목이 하려던 일(새 회차 시작 시
    // pmClearAll())은 이미 quest/086의 softResetPlaythrough()와
    // doReincarnate() 양쪽에서 살아있는 경로로 호출되고 있어 별도 수정이
    // 필요 없다.

    // 4. renderMemory 교체
    window.renderMemory = renderMemoryEnhanced;
  };
  setTimeout(tryPatch, 3500);
})();

// [버그 수정] 이 자리에 있던 hookPMPanelv2 IIFE(window.renderPanel을 감싸
// 'memory' 패널을 renderMemoryEnhanced로 대체)도 같은 이유로 죽어있던
// 데다, 사실상 불필요한 중복이었다 — quest/086의 renderPanel() 안
// 'memory' 케이스가 바로 위에서 재할당한 window.renderMemory를 bare
// 호출로 그대로 사용하므로(renderMemory를 quest/086이 로컬 선언/import
// 하지 않아 스코프체인이 정상적으로 window까지 내려감), renderMemoryEnhanced가
// 이미 실제로 렌더링되고 있다.
