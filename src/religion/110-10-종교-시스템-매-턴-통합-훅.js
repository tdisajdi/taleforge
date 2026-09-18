// 10. 종교 시스템 매 턴 통합 훅
// Auto-extracted from taleforge.html (original section banner preserved above).

(function hookReligionV2ToTick(){
  setTimeout(()=>{
    const origSend = window.sendMsg;
    if(typeof origSend==='function' && !origSend._religionV2Hooked){
      // sendMsg 이후 처리는 기존 GS 훅에서 이미 하고 있으므로
      // 매 턴 ticker만 등록
      window.sendMsg._religionV2Hooked = true;
    }
  }, 1500);
})();
