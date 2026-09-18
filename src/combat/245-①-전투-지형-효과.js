// ① 전투 지형 효과
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { TERRAIN_EFFECTS_BATTLE } from '../data/245-①-전투-지형-효과.js';

export function detectTerrainFromText(text, locName){
  const lc = (text||'').toLowerCase();
  const ln = (locName||'').toLowerCase();
  if(/골목|통로|복도|좁은|협소|비좁/.test(lc+ln)) return 'narrow';
  if(/평원|광장|벌판|들판|개활지/.test(lc+ln)) return 'open';
  if(/숲|수풀|밀림|정글|덤불/.test(lc+ln)) return 'forest';
  // [BUG FIX] '던전/요새/지하 감옥' 같은 더 구체적인 키워드가 일반적인
  // '지하' 키워드(underground)에 먼저 가로채이지 않도록, dungeon 검사를
  // underground보다 먼저 배치한다. 예: "지하 감옥" → 기존 순서에서는
  // "지하"에 먼저 걸려 underground로 잘못 분류됨.
  if(/던전|요새|성채|지하\s*감옥/.test(lc+ln)) return 'dungeon';
  if(/지하|동굴|갱도|지하실|굴/.test(lc+ln)) return 'underground';
  if(/물|강|호수|바다|늪|수중|물속/.test(lc+ln)) return 'water';
  // [신규] 절벽/낭떠러지를 옥상/고지대(인공 구조물)에서 분리 — 자연
  // 지형인 절벽은 cliff로 독립해 "밀어떨어뜨리기" 같은 전용 액션을 부여.
  if(/절벽|낭떠러지|벼랑/.test(lc+ln)) return 'cliff';
  if(/옥상|성벽|탑 위|고지/.test(lc+ln)) return 'rooftop';
  // [신규] 화산 지대 — 용암·유독 가스 지형
  if(/화산|용암|마그마|분화구/.test(lc+ln)) return 'volcanic';
  // [신규] 빙판/설원 — 미끄러운 빙결 지형
  if(/빙판|설원|얼어붙은|빙하|눈밭/.test(lc+ln)) return 'ice';
  if(/폐허|잔해|폐건물|무너진/.test(lc+ln)) return 'ruins';
  return null;
}
window.detectTerrainFromText = detectTerrainFromText;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_219(){
function getTerrainBonus(statKey){
  const tid = S._terrainId;
  if(!tid) return 0;
  const t = TERRAIN_EFFECTS_BATTLE[tid];
  if(!t) return 0;
  // [BUG FIX] penalty 값은 이미 음수로 정의돼 있다(예: rng:-15). 그런데
  // 기존 코드는 "bonus - penalty"로 계산해 음수를 한 번 더 빼서 결과적으로
  // 페널티가 보너스로 뒤집히는 부호 오류가 있었다(rng:-15 penalty가 실제
  // 효과는 +15가 되어버림). bonus와 penalty를 더하는 것이 올바른 계산.
  return (t.bonus[statKey]||0) + (t.penalty[statKey]||0);
}
window.getTerrainBonus = getTerrainBonus;

window.getTerrainBonus = window.getTerrainBonus;
}

