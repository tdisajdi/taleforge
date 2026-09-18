// 6. 비전투 해결 경로 실행
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { PEACE_ROUTES } from '../data/090-1-마스터-데이터.js';
import { toast } from '../utils.js';



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_76(){
function initiatePeaceRoute(routeId, region){
  const route = PEACE_ROUTES[routeId];
  if(!route){ toast('알 수 없는 해결 경로',2000); return; }
  // AI에게 서사 처리 요청
  S._nextInjectedContext=(S._nextInjectedContext||'')
    +'\n[☮️ 종교 비전투 해결] 플레이어가 "'+route.name+'" 경로를 선택했다. '
    +'조건: '+route.req+'. 예상 결과: '+route.result+'.\n'
    +'이 협상 장면을 역사적 무게감 있게 서사화하라. 판정에 따라 성공/실패 분기를 만들어라.\n'
    +'성공 시 GS: "religion_share_delta":{"region":"'+region+'","temple":-5,"solar":+5} 형태로 출력.\n'
    +'실패 시 GS: "flags":["religion_tension_up_'+region+'"] 출력.';
  toast('☮️ '+route.name+' 협상 시작...',2500);
  document.querySelectorAll('.religion-popup').forEach(e=>e.remove());
}
window.initiatePeaceRoute = initiatePeaceRoute;

window.initiatePeaceRoute = initiatePeaceRoute;
}

