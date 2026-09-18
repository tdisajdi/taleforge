// DOM 주입
// Auto-extracted from taleforge.html (original section banner preserved above).
import { renderHeritagePanel } from '../progression/170-계승-패널-UI.js';

(function injectHeritagePanel(){
  const t=function(){
    if(window._heritagePanelInjected) return;
    if(!document.getElementById('pb-challenges')){ setTimeout(t,1000); return; }
    if(!document.getElementById('pb-heritage')){
      const ref=document.getElementById('p-challenges');
      if(!ref){ setTimeout(t,500); return; }
      const div=document.createElement('div');
      div.className='panel-ov'; div.id='p-heritage';
      div.innerHTML='<div class="panel"><div class="p-hdr"><span class="p-title">🏛️ 계승</span><button class="p-close" onclick="closeP(\'heritage\')">✕</button></div><div class="p-body scrollable" id="pb-heritage"></div></div>';
      ref.parentNode.insertBefore(div,ref.nextSibling);
    }
    const chBtn=document.querySelector('.grp-sub-btn[onclick*="challenges"]');
    if(chBtn&&!document.querySelector('.grp-sub-btn[onclick*="heritage"]')){
      const btn=document.createElement('button');
      btn.className='grp-sub-btn';
      btn.setAttribute('onclick',"openP('heritage');closeGrp()");
      btn.innerHTML='🏛️ 계승';
      chBtn.parentNode.insertBefore(btn,chBtn.nextSibling);
    }
    window._heritagePanelInjected=true;
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',t);
  else setTimeout(t,2300);
})();

(function hookHeritageOpenP(){
  const t=function(){
    if(window._heritageOpenHooked) return;
    if(typeof window.openP!=='function'){ setTimeout(t,1500); return; }
    window._heritageOpenHooked=true;
    const _o=window.openP;
    window.openP=function(name){
      const r=_o.apply(this,arguments);
      if(name==='heritage') setTimeout(renderHeritagePanel,100);
      return r;
    };
  };
  setTimeout(t,2700);
})();
