// MutationObserver 통합 (기존 훅에 추가)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { autoMapPin } from '../world/311-④-탐험-메모-지도-시스템.js';

(function hookV55PostProcess(){
  if(window._v55Hooked) return;
  window._v55Hooked = true;
  const observer = new MutationObserver(function(mutations){
    for(const mut of mutations){
      for(const node of mut.addedNodes){
        if(node.nodeType!==1) continue;
        const bubble=node.classList?.contains('msg-ai')?node:node.querySelector?.('.msg-ai');
        if(!bubble) continue;
        const aiText=bubble.innerText||bubble.textContent||'';
        if(!aiText||aiText.length<20) continue;
        // 지도 자동 핀
        autoMapPin(aiText);
      }
    }
  });
  const tryAttach=()=>{
    const el=document.getElementById('msgs');
    if(el){ observer.observe(el,{childList:true,subtree:true}); }
    else setTimeout(tryAttach,800);
  };
  tryAttach();
})();
