// GS 처리 + sendMsg 훅
// Auto-extracted from taleforge.html (original section banner preserved above).
import { HERITAGE_ITEMS } from '../data/165-저장소.js';
import { earnHeritageItem } from '../items/167-계승-아이템-획득.js';
import { processEndOfLoop } from '../progression/168-회차-종료-시-자동-계승-체크.js';
import { loadHeritage } from '../world/165-저장소.js';

// [버그 수정] 이 자리에 있던 hookHeritageSendMsg는 window.sendMsg를 감싸는
// 방식이라(다른 죽은 훅들과 동일한 원인) 한 번도 실행되지 않았다. GS 필드
// (earn_heritage/end_of_loop) 처리는 window.processGSBlock(gs)에 옮겨
// 연결하고, gs 존재 여부와 무관하게 매 턴 돌아야 하는 도전과제 체크
// (checkLoopMilestones)는 quest/086의 sendMsg() 안에 네이티브로 연결한다
// (processGSBlock은 AI 응답에 <gs> 블록이 있을 때만 호출되므로, 그 블록이
// 없는 턴에도 반드시 돌아야 하는 로직을 거기 두면 안 된다).
(function hookHeritageGS(){
  const t=function(){
    if(window._heritageGSHooked) return;
    if(typeof window.processGSBlock!=='function'){ setTimeout(t,1500); return; }
    window._heritageGSHooked=true;
    const _o=window.processGSBlock;
    window.processGSBlock=function(gs){
      const r=_o.apply(this,arguments);
      try{
        if(gs){
          if(gs.earn_heritage) earnHeritageItem(gs.earn_heritage.id, gs.earn_heritage.reason||'서사 달성');
          if(gs.end_of_loop) processEndOfLoop(gs.end_of_loop);
        }
      }catch(e){}
      return r;
    };
  };
  setTimeout(t,3500);
})();

(function hookHeritageBLS(){
  const t=function(){
    if(window._heritageBLSHooked) return;
    const fn=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn){ setTimeout(t,3000); return; }
    window._heritageBLSHooked=true;
    const _o=window[fn];
    window[fn]=function(){
      const r=_o.apply(this,arguments);
      try{
        const h=loadHeritage();
        const items=h.items||{};
        const owned=Object.keys(items).filter(function(k){ return items[k]>0; });
        if(!owned.length) return r;
        const lines=owned.slice(0,5).map(function(id){
          const def=HERITAGE_ITEMS[id];
          return def?(def.icon+' '+def.name+(items[id]>1?' ×'+items[id]:'')+': '+def.effect.slice(0,50)):'?';
        });
        const bls='\n\n[🏛️ 활성 계승 효과]\n'+lines.join('\n')
          +'\n계승 효과가 이번 회차에 적용돼 있다. 서사에서 자연스럽게 반영하라.'
          +'\nGS: "earn_heritage":{"id":"item_id","reason":"달성 이유"} — 조건 충족 시 계승 아이템 부여'
          +'\nGS: "end_of_loop":"ending_id" — 회차 종료 및 계승 처리';
        return typeof r==='string'?r+bls:r;
      }catch(e){ return r; }
    };
  };
  setTimeout(t,5100);
})();

// [버그 수정] 이 자리에 있던 autoApplyHeritage는 "페이지 로드 5초 후"
// 딱 한 번만 실행되는 setTimeout이었다. 실제 캐릭터 생성은 여러 단계를
// 거쳐 5초를 훌쩍 넘기는 게 보통이라 최초 플레이에서는 S.character가
// 아직 없어 항상 조건을 놓쳤고, 환생 후 재시작(doReincarnate는 페이지를
// 새로고침하지 않고 화면만 전환한다)에는 이 타이머가 이미 한 번
// 소진돼 있어 두 번째 회차부터도 절대 재실행되지 않았다 — 결과적으로
// "새 회차 시작 시" 적용돼야 할 계승 보너스가 사실상 한 번도 실제로
// 적용될 수 없는 죽은 트리거였다. 실제 "새 회차가 시작되는" 시점인
// core/084 startGame()의 doStartChat() 호출 직전으로 네이티브 연결했다.

console.log('[TaleForge] 확장 업적·계승 시스템 (밸런스) 로드 완료 ✓');
