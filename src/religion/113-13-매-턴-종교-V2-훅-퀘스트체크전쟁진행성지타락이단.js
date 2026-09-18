// 13. 매 턴 종교 V2 훅 — 퀘스트체크/전쟁진행/성지/타락/이단
// Auto-extracted from taleforge.html (original section banner preserved above).
import { checkReligionSecretQuests } from '../quest/107-7-성직자-비밀-퀘스트-라인.js';
import { tickAbyssCorruption } from './102-2-종교-축복저주-판정-보너스.js';
import { tickDivineCheck } from './103-3-신의-응답-저주-시스템.js';
import { tickReligionWar } from './104-4-종교전쟁-결과-처리.js';
import { tickHeresyCheck } from './108-8-이단-심문-시스템.js';
import { tickShrineEffects } from './109-9-성지-시스템.js';

console.log('[TaleForge] 종교 시스템 v2 로드 완료 ✓ (신앙연동/신의응답/전쟁결과/혼합종파/배교/비밀퀘스트/이단심문/성지)');

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_94(){
(function registerReligionV2PerTurn(){
  const origCheckAdv = window.checkAdvancedAchievements;
  // sendMsg 후처리에서 호출되도록 전역 등록
  window._religionV2PerTurn = function(cleanText, rollInfo){
    try{ tickAbyssCorruption(); }catch(e){}
    try{ tickReligionWar(); }catch(e){}
    try{ tickShrineEffects(); }catch(e){}
    try{ tickDivineCheck(cleanText, rollInfo); }catch(e){}
    try{ tickHeresyCheck(cleanText); }catch(e){}
    try{ checkReligionSecretQuests(); }catch(e){}
  };
  window._religionV2PerTurn._registered = true;
})();
}

