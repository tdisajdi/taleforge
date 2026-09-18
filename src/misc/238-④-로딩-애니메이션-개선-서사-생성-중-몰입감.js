// ④ 로딩 애니메이션 개선 (서사 생성 중 몰입감)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { LOADING_TEXTS } from '../data/238-④-로딩-애니메이션-개선-서사-생성-중-몰입감.js';



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_213(){
if(typeof window.renderThinking === 'function'){
  const __origRT = window.renderThinking;
  window.renderThinking = function(){
    __origRT.call(this);
    try{
      if(S?.loading){
        const thinking = document.getElementById('thinking');
        if(thinking && !thinking.querySelector('.thinking-text')){
          const span = document.createElement('div');
          span.className = 'thinking-text';
          span.style.cssText = 'font-size:10px;color:var(--dim);font-family:"Cinzel",serif;letter-spacing:.5px;margin-top:3px';
          span.textContent = LOADING_TEXTS[Math.floor(Math.random()*LOADING_TEXTS.length)];
          thinking.appendChild(span);
          // 3초마다 문구 교체
          thinking._loadingInterval = setInterval(()=>{
            span.textContent = LOADING_TEXTS[Math.floor(Math.random()*LOADING_TEXTS.length)];
          }, 3000);
        }
      } else {
        const thinking = document.getElementById('thinking');
        if(thinking?._loadingInterval){
          clearInterval(thinking._loadingInterval);
          delete thinking._loadingInterval;
        }
      }
    }catch(e){}
  };
}
}

