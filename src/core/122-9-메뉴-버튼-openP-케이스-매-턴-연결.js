// 9. 메뉴 버튼 + openP 케이스 + 매 턴 연결
// Auto-extracted from taleforge.html (original section banner preserved above).
import { RELIGION_SECRET_QUESTS } from '../data/107-7-성직자-비밀-퀘스트-라인.js';
import { RELIGION_SIDE_QUESTS } from '../data/119-6-종교-사이드-퀘스트-20개-세계관-이해-연동.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { completeReligionQuest } from '../quest/107-7-성직자-비밀-퀘스트-라인.js';
import { checkReligionRituals } from '../religion/118-5-종교-의례축제.js';
import { checkReligionSideQuests, completeReligionSideQuest } from '../religion/119-6-종교-사이드-퀘스트-20개-세계관-이해-연동.js';
import { renderMythologyPanel, renderPantheonPanel } from '../religion/120-7-만신전-패널-신화-패널-렌더링.js';
import { unlockHiddenMyth } from '../world/115-2-창세신화-세계관-역사.js';

document.addEventListener('DOMContentLoaded', function(){
  setTimeout(()=>{
    const pcMenu = document.querySelector('.pc-menu-btn[onclick*="religion"]');
    if(pcMenu){
      const addBtn = (onclick, icon, lbl) => {
        if(document.querySelector(`.pc-menu-btn[onclick*="${onclick.split("'")[1]}"]`)) return;
        const btn = document.createElement('button');
        btn.className='pc-menu-btn';
        btn.setAttribute('onclick', onclick);
        btn.innerHTML=`<span class="pc-ico">${icon}</span><span class="pc-lbl">${lbl}</span>`;
        pcMenu.parentNode.insertBefore(btn, pcMenu.nextSibling);
      };
      addBtn("openP('mythology');renderMythologyPanel()",  '📖', '세계 신화');
      addBtn("openP('pantheon');renderPantheonPanel()",    '🌌', '만신전');
    }
  }, 2000);
});

console.log('[TaleForge] 종교 시스템 v3 로드 완료 ✓ (신규종교2/창세신화/만신전/NPC풀/의례/사이드퀘스트20개)');

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_103(){
(function registerReligionV3(){
  // openP 케이스
  setTimeout(()=>{
    const orig = window.openP;
    if(typeof orig==='function' && !orig._relV3Hooked){
      window.openP = function(id){
        const r = orig.apply(this, arguments);
        if(id==='pantheon')    setTimeout(renderPantheonPanel,  50);
        if(id==='mythology')   setTimeout(renderMythologyPanel, 50);
        return r;
      };
      window.openP._relV3Hooked = true;
    }
  }, 4000);

  // _religionV2PerTurn 확장
  const _origV2 = window._religionV2PerTurn;
  window._religionV2PerTurn = function(cleanText, rollInfo){
    if(typeof _origV2==='function') _origV2(cleanText, rollInfo);
    try{ checkReligionRituals(); }catch(e){}
    try{ checkReligionSideQuests(); }catch(e){}
    try{
      // 루프 자각 시 루프 기원 신화 해금
      // [버그 수정] unlockHiddenMyth가 이제 codexKey를 정확히 대조하므로
      // (부분 문자열 'cycle'이 아니라) 실제 키인 'loop_origin'을 넘긴다.
      const cycle = typeof loadCycleCount==='function'?loadCycleCount():0;
      if(cycle>=1) unlockHiddenMyth('loop_origin');
    }catch(e){}
  };

  // GS 사이드 퀘스트 완료 처리
  setTimeout(()=>{
    const origSend = window.sendMsg;
    if(typeof origSend==='function' && !origSend._relV3GSHooked){
      // 기존 GS 훅에 sq 완료 처리 추가
      window.sendMsg._relV3GSHooked = true;
    }
    // q_done 처리에 종교 퀘스트 완료 연결
    const origGS = window.processGSToAllDBs;
    if(typeof origGS==='function' && !origGS._relSQHooked){
      window.processGSToAllDBs = function(gs){
        const result = origGS.apply(this, arguments);
        if(Array.isArray(gs?.q_done)){
          gs.q_done.forEach(id=>{
            if(RELIGION_SIDE_QUESTS.find(sq=>sq.id===id))
              completeReligionSideQuest(id);
            // [B61 FIX] 비밀 퀘스트(v2)도 AI의 실제 완수 보고(q_done)로 자동 완료되도록 연결
            if(Object.values(RELIGION_SECRET_QUESTS).flat().find(q=>q.id===id))
              completeReligionQuest(id);
          });
        }
        return result;
      };
      window.processGSToAllDBs._relSQHooked = true;
    }
  }, 2000);
})();
}

