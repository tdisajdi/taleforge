// 13. 매 턴 자동 체크 등록
// Auto-extracted from taleforge.html (original section banner preserved above).
import { tickBloodlineAwaken, tickBloodlineCooldown } from '../job/125-4-자동-각성-감지-매-턴-AI-응답-텍스트-분석.js';

window._bloodlineV2PerTurn = function(cleanText, rollInfo){
  try{ tickBloodlineAwaken(cleanText, rollInfo); }catch(e){}
  try{ tickBloodlineCooldown(); }catch(e){}
};

window._bloodlineV2PerTurn._registered = true;

console.log('[TaleForge] 혈통 시스템 v2 로드 완료 ✓ (자동배정/자동각성/진화/GS연동/BLS강화)');
