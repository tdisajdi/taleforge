// ⑬ buildLightSystem 최적화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { getBetrayalBLS } from '../misc/033-NEW-배신-가능한-동료-시스템.js';
import { getLoopWorldBLS } from '../progression/018-5170번-환생-누적-시스템.js';

(function optimizeBLS(){
  const tryPatch=function(){
    if(window._bls2Optimized) return;
    if(typeof window.buildLightSystem!=='function'){ setTimeout(tryPatch,1500); return; }
    window._bls2Optimized=true;
    const _o=window.buildLightSystem;
    window.buildLightSystem=function(char,titles,memory,npcs){
      const base=_o.call(this,char,titles,memory,npcs);
      // 고정 정보만 (루프 변화, 배신 위험, 창조신화는 10턴마다 갱신)
      const fixed=[];
      try{ const x=typeof getBetrayalBLS==='function'?getBetrayalBLS():''; if(x) fixed.push(x); }catch(e){}
      try{ const x=typeof getLoopWorldBLS==='function'?getLoopWorldBLS():''; if(x) fixed.push(x); }catch(e){}
      // 상황별 BLS는 sendMsg 훅에서 매 턴 주입 — 여기선 제외
      return typeof base==='string'?base+fixed.join(''):base;
    };
  };
  setTimeout(tryPatch,3500);
})();
