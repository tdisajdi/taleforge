// 11. 환생 시 혈통 자동 처리
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { onBloodlineNewCycle } from '../items/128-7-회차-진화-시-자동-혈통-강화.js';
import { recordRacePlayed } from '../misc/015-시스템-1120.js';

(function hookBloodlineOnReinc(){
  setTimeout(()=>{
    const orig = window.goReinc;
    if(typeof orig==='function' && !orig._blReincHooked){
      window.goReinc = function(){
        // 환생 전 혈통 진화 체크
        try{ onBloodlineNewCycle(); }catch(e){}
        // 환생 전 종족 기록
        try{
          const race = S.character?.race;
          if(race && typeof recordRacePlayed==='function') recordRacePlayed(race);
        }catch(e){}
        return orig.apply(this, arguments);
      };
      window.goReinc._blReincHooked = true;
    }
  }, 1500);
})();
