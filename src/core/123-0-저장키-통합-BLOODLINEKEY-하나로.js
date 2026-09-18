// 0. 저장키 통합 — BLOODLINE_KEY 하나로
// Auto-extracted from taleforge.html (original section banner preserved above).
import { lsDel, lsGet, lsSet } from '../utils.js';

(function migrateBloodlineKey(){
  try{
    const old = lsGet('tf-bloodline');
    const cur = lsGet('taleforge-bloodline');
    if(old && !cur){
      lsSet('taleforge-bloodline', old);
      lsDel('tf-bloodline');
      console.log('[Bloodline] 저장키 마이그레이션 완료');
    }
  }catch(e){}
})();
