// block19-preamble
// Auto-extracted from taleforge.html (original section banner preserved above).
import { lsGet, lsSet } from '../utils.js';

(function initMatchingEngineDefault(){
  try{
    if(lsGet('tf-me-enabled') === null){
      lsSet('tf-me-enabled', '1');
      lsSet('tf-me-user-toggled', '0'); // 사용자가 아직 직접 건드린 적 없음 표시
      console.log('[TaleForge] 로컬 매칭 엔진 기본 ON — 데이터가 충분히 쌓이면 자동으로 AI 호출을 절감합니다.');
    }
  }catch(e){}
})();
