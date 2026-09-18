// BLS 통합 래퍼 — 새 시스템들 주입
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { getOathBLSHint } from '../lore/312-⑤-서약-시스템.js';
import { getTraumaDeepBLS } from '../lore/316-⑦-심층-트라우마-시스템.js';
import { getAllianceBLS } from '../misc/317-⑨-동맹배신-시스템.js';
import { getGoalsBLS } from '../misc/318-⑩-플레이어-목표-노트.js';

(function wrapBLSForNewSystems(){
  if(window._v55BLSWrapped) return;
  window._v55BLSWrapped = true;
  const checkAndWrap = ()=>{
    if(typeof window.buildLightSystem!=='function'){ setTimeout(checkAndWrap, 500); return; }
    const orig = window.buildLightSystem;
    window.buildLightSystem = function(...args){
      let r = orig.apply(this, args);
      try{ const h=getOathBLSHint(); if(h) r+=h; }catch(e){}
      try{ const h=window.getBloodlineBLS(); if(h) r+=h; }catch(e){}
      try{ const h=getTraumaDeepBLS(); if(h) r+=h; }catch(e){}
      try{ const h=getAllianceBLS(); if(h) r+=h; }catch(e){}
      try{ const h=getGoalsBLS(); if(h) r+=h; }catch(e){}
      // 오스 보너스 반영
      if(S._oathBonus>0) r+=`\n[📜 서약 가호 +${S._oathBonus}] 이번 행동에 신성한 도움이 따른다.`;
      return r;
    };
  };
  checkAndWrap();
})();
