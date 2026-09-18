// 게임 시작 시 예언 자동 생성 훅
// Auto-extracted from taleforge.html (original section banner preserved above).

(function hookGameStart(){
  const origStartGame = window.startGame || window.doStart;
  // startGame을 래핑하는 대신 화면 전환 이벤트 감지
  const screenObs = new MutationObserver(function(muts){
    const chatScreen = document.getElementById('screen-chat');
    if(chatScreen && chatScreen.classList.contains('active')){
      // 게임 시작됨 - 예언이 없으면 자동 생성
      // [변경] generateProphecy가 이제 AI 호출 없는 로컬 조합 방식이라
      // "API 한도 절약"을 위해 꺼뒀던 제약이 사라져 다시 켠다.
      setTimeout(()=>{
        const existing = window.loadProphecy && window.loadProphecy();
        if(!existing && window.S && window.S.character && typeof window.generateProphecy==='function') window.generateProphecy();
      }, 2000);
      screenObs.disconnect();
    }
  });
  screenObs.observe(document.body, { attributes:true, subtree:true, attributeFilter:['class'] });
})();
