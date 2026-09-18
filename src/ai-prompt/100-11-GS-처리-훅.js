// 11. GS 처리 훅
// Auto-extracted from taleforge.html (original section banner preserved above).
import { triggerReligionEvent } from '../misc/093-4-긴장도-계산.js';
import { changeReligionShare } from '../religion/092-3-지역-종교-점유율-조회수정.js';
import { convertNpc } from '../religion/094-5-플레이어-종교-귀속-교화.js';
import { toast } from '../utils.js';
import { loadReligionState, saveReligionState } from '../world/091-2-저장소.js';

// [버그 수정] 이 자리에 있던 hookReligionGS는 window.sendMsg를 감싸는
// 방식이라(quest/086이 sendMsg를 로컬 바인딩으로 직접 호출해 재할당이
// 도달 못 함 — 다른 죽은 훅들과 동일한 원인) 한 번도 실행되지 않았다.
// quest/086이 매 턴 실제로 호출하는 window.processGSBlock(gs)에 옮겨
// 연결한다. gs는 이미 파싱된 객체가 인자로 들어오므로 DOM 재파싱도 불필요.
(function hookReligionGS(){
  const tryHook=function(){
    if(window._religionGSHooked) return;
    if(typeof window.processGSBlock!=='function'){ setTimeout(tryHook,1500); return; }
    window._religionGSHooked=true;
    const _orig=window.processGSBlock;
    window.processGSBlock=function(gs){
      const result=_orig.apply(this,arguments);
      try{
        if(!gs) return result;

        // religion_share_delta
        if(gs.religion_share_delta){
          const d=gs.religion_share_delta;
          const delta={};
          ['temple','solar','roots','abyss'].forEach(r=>{ if(typeof d[r]==='number') delta[r]=d[r]; });
          if(Object.keys(delta).length) changeReligionShare(d.region||'central',delta);
        }

        // convert_npc
        if(gs.convert_npc){
          const c=gs.convert_npc;
          if(c.name&&c.to) convertNpc(c.name,c.from||'',c.to);
        }

        // religion_tension_up
        if(gs.religion_tension_up){
          const region=typeof gs.religion_tension_up==='string'?gs.religion_tension_up:(gs.religion_tension_up.region||'central');
          triggerReligionEvent('gs_trigger',region);
        }

        // religion_tension_reset
        if(gs.religion_tension_reset){
          const st=loadReligionState();
          const key=gs.religion_tension_reset;
          if(st.tension[key]){ st.tension[key].level=Math.max(0,(st.tension[key].level||1)-2); }
          if(st.war&&st.war.region===key) st.war=null;
          saveReligionState(st);
          if(typeof window.renderReligionPanel==='function') window.renderReligionPanel();
          toast('☮️ 종교 긴장도 완화! ('+key+')',3000);
        }

        // flags 감지 — religion_war_*
        if(Array.isArray(gs.flags)){
          gs.flags.forEach(flag=>{
            if(flag.startsWith('religion_tension_up_')){
              const region=flag.replace('religion_tension_up_','');
              triggerReligionEvent('flag',region);
            }
            if(flag==='abyss_exposed'){
              toast('😈 심연의 계시 정체가 폭로됐다!',4000);
              changeReligionShare('central',{abyss:-20,temple:+10,solar:+10});
            }
          });
        }
      }catch(e){ console.warn('[ReligionGS]',e); }
      return result;
    };
  };
  setTimeout(tryHook,2500);
})();

(function hookReligionToPrompt(){
  const tryPatch=function(){
    if(window._religionPromptHooked) return;
    const fn=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn){ setTimeout(tryPatch,2800); return; }
    window._religionPromptHooked=true;
    const _o=window[fn];
    window[fn]=function(){
      const r=_o.apply(this,arguments);
      try{ const b=window.getReligionBLS(); return b&&typeof r==='string'?r+b:r; }catch(e){ return r; }
    };
  };
  setTimeout(tryPatch,4200);
})();

(function hookReligionToOpenPanel(){
  const tryHook=function(){
    if(window._religionOpenHooked) return;
    if(typeof window.openP!=='function'){ setTimeout(tryHook,1500); return; }
    window._religionOpenHooked=true;
    const _o=window.openP;
    window.openP=function(name,...args){
      const r=_o.call(this,name,...args);
      if(name==='religion') setTimeout(window.renderReligionPanel,100);
      return r;
    };
  };
  setTimeout(tryHook,2000);
})();

(function injectReligionPanelDOM(){
  const tryInject=function(){
    if(window._religionDOMInjected) return;
    // pb-religion 패널 본문 컨테이너가 없으면 생성
    if(!document.getElementById('pb-religion')){
      // 기존 패널 구조 복사해서 religion 패널 삽입
      const existing=document.getElementById('p-summons');
      if(!existing){ setTimeout(tryInject,1000); return; }
      const div=document.createElement('div');
      div.className='panel-ov';
      div.id='p-religion';
      div.innerHTML='<div class="panel"><div class="p-hdr"><span class="p-title">⛪ 종교</span><button class="p-close" onclick="closeP(\'religion\')">✕</button></div><div class="p-body scrollable" id="pb-religion"></div></div>';
      existing.parentNode.insertBefore(div,existing.nextSibling);
    }
    // 그룹 서브 버튼에 종교 추가
    const grpBtns=document.querySelector('.grp-sub-btn[onclick*="summons"]');
    if(grpBtns&&!document.querySelector('.grp-sub-btn[onclick*="religion"]')){
      const btn=document.createElement('button');
      btn.className='grp-sub-btn';
      btn.setAttribute('onclick',"openP('religion');closeGrp()");
      btn.innerHTML='⛪ 종교';
      grpBtns.parentNode.insertBefore(btn,grpBtns.nextSibling);
    }
    // PC 메뉴에도 추가
    const pcMenu=document.querySelector('.pc-menu-btn[onclick*="summons"]');
    if(pcMenu&&!document.querySelector('.pc-menu-btn[onclick*="religion"]')){
      const btn=document.createElement('button');
      btn.className='pc-menu-btn';
      btn.setAttribute('onclick',"openP('religion')");
      btn.innerHTML='<span class="pc-ico">⛪</span><span class="pc-lbl">종교</span>';
      pcMenu.parentNode.insertBefore(btn,pcMenu.nextSibling);
    }
    window._religionDOMInjected=true;
  };
  // DOMContentLoaded 이후 또는 즉시
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',tryInject);
  else setTimeout(tryInject,1500);
})();

console.log('[TaleForge v36] 종교 시스템 v1 로드 완료 ✓');
