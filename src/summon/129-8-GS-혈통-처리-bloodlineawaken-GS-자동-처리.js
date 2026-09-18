// 8. GS 혈통 처리 — bloodline_awaken GS 자동 처리
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { awakenBloodlineAuto } from '../job/125-4-자동-각성-감지-매-턴-AI-응답-텍스트-분석.js';
import { toast } from '../utils.js';
import { loadBL, saveBL } from './124-1-통합-혈통-정의-BLOODLINETYPES-BLOODLINEDEFS-.js';

(function hookBloodlineGS(){
  setTimeout(()=>{
    const orig = window.processGSToAllDBs;
    if(typeof orig==='function' && !orig._bloodlineHooked){
      window.processGSToAllDBs = function(gs){
        const result = orig.apply(this, arguments);
        try{
          // AI가 bloodline_awaken GS 출력하면 각성 처리
          if(gs.bloodline_awaken){
            const bl = loadBL();
            if(bl && !bl.awakened) awakenBloodlineAuto();
          }
          // bloodline_discover GS — AI가 서사에서 혈통 공개
          if(gs.bloodline_discover){
            const bl = loadBL();
            if(bl){
              bl.origin = gs.bloodline_discover;
              saveBL(bl);
              toast('🩸 혈통의 비밀이 밝혀졌다!', 3000);
              if(typeof addTimelineEvent==='function')
                addTimelineEvent('event','혈통의 비밀 공개',{icon:'🩸'});
            }
          }
          // bloodline_hint — AI가 혈통 힌트 추가
          if(gs.bloodline_hint && loadBL()){
            const bl = loadBL();
            bl.hints = bl.hints||[];
            bl.hints.push({text:gs.bloodline_hint, turn:S.msgCount||0});
            saveBL(bl);
          }
        }catch(e){}
        return result;
      };
      window.processGSToAllDBs._bloodlineHooked = true;
    }
  }, 1500);
})();
