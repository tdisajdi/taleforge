// ★ UI-6: 패널 케이스 + 버튼 연결
// Auto-extracted from taleforge.html (original section banner preserved above).
import { renderBattleLogPanel, renderTimelinePanel } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { renderEconomyPanel } from '../economy/191-UI-4-경제-현황-패널.js';
import { renderButterflyPanel } from '../progression/192-UI-5-나비효과-패널.js';
import { renderFactionPowerPanel } from '../world/190-UI-3-세력-힘의-구도-시각화.js';

(function hookNewUIPanels(){
  function _patchUIPanelOpenP(){
    const orig = window.openP;
    if(typeof orig==='function'){
      window.openP = function(id){
        const r = orig.apply(this, arguments);
        if(id==='timeline')   { setTimeout(renderTimelinePanel,   50); }
        if(id==='battlelog')  { setTimeout(renderBattleLogPanel,  50); }
        if(id==='factions')   { setTimeout(renderFactionPowerPanel,50); }
        if(id==='economy')    { setTimeout(renderEconomyPanel,    50); }
        if(id==='butterfly')  { setTimeout(renderButterflyPanel,  50); }
        return r;
      };
      window.openP._uiPanelHooked = true;
    }
  }
  setTimeout(_patchUIPanelOpenP, 3500);
})();

(function hookTimelineAutoRecord(){
  setTimeout(()=>{
    // 전투 결과 → 타임라인 + 배틀로그 동시 기록
    const origSend = window.sendMsg;
    if(typeof origSend==='function' && !origSend._tlHooked){
      // sendMsg 완료 후 배틀로그 기록은 기존 addBattleLogEntry 호출로 처리됨
      window.sendMsg._tlHooked = true;
    }
  }, 1000);
})();
