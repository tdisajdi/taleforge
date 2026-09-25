// block18-preamble
// Auto-extracted from taleforge.html (original section banner preserved above).
import { calcDamage } from '../combat/210-7-전투-시스템.js';
import { detectTerrainFromText } from '../combat/245-①-전투-지형-효과.js';
import { ELEMENT_DEFS } from '../data/035-NEW-직업-조합-시너지-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { TERRAIN_EFFECTS_BATTLE } from '../data/245-①-전투-지형-효과.js';
import { loadInventory, rollLoot, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { loadSkills } from '../job/002-스킬-시스템.js';
import { loadTitles } from '../job/010-스킬-강화-시스템.js';
import { loadGrief, saveGrief } from '../progression/019-71100번-환생-누적-시스템.js';
import { calcMonsterDamageMultiplier, closeP, getMonsterRevivalChance, renderMonsters, renderMsgs } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { loadNPCs, saveChatHistory, saveNPCs } from './001-block0-preamble.js';
import { gainExpFromKill, getAllSkillDefs } from './009-레벨업-스탯-포인트-배분-시스템.js';
import { recordFateChoice } from './016-2130번-시스템.js';
import { recordTimeEcho } from './017-4150번-시스템.js';
import { gainDeathEcho } from './021-1-죽음의-메아리-시스템.js';
import { loadParty, saveParty } from './054-이동수단-시스템.js';
import { saveDiaryEntry } from './076-파트2-D-일기기록-시스템.js';
import { gainEvoEnergy } from './206-3-진화Evolution-시스템.js';



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_295(){
(function(){

const LC_KEY = 'tf-local-combat';
const LC_MAX_SIDE = 8; // 파티/몬스터 한 진영 당 최대 인원

// ── 저장/로드 ──
function loadLocalCombat(){
  try{ return JSON.parse(lsGet(LC_KEY)||'null'); }catch(e){ return null; }
}
function saveLocalCombat(d){ try{ lsSet(LC_KEY, d?JSON.stringify(d):'null'); }catch(e){} }
window.loadLocalCombat = loadLocalCombat;
window.saveLocalCombat = saveLocalCombat;

// ── 조우 예고: checkRandomEncounter가 몬스터를 이미 로컬로 만들어
//    S._nextInjectedContext에 서사 힌트를 넣어둔 시점에 호출된다.
//    여기서는 "이번 턴엔 전투 시작 안 함, 다음 턴에 연다"는 예약만 한다. ──
// ══════════════════════════════════════════════════════════════════
// 로컬 전투 서술 엔진 (AI 미사용) — 지능(mute/feral/sapient) × 무기(fang/
// blade/spear/bow/blunt/magic/unarmed) 조합별 상태 기반 문장 뱅크.
// 별도 프로토타입에서 검증한 구조를 그대로 이식했다 — API 키가 없어도
// "누가 무엇으로 어떻게 쳤는지"가 매번 다르게 서술된다. 공격/전투 판정
// 로직(calcDamage 등)은 전혀 건드리지 않고 서술 문장만 이 경로로 뺐다.
// ══════════════════════════════════════════════════════════════════
function _cbJosa(word, type){
  const ch = String(word).charCodeAt(String(word).length-1);
  const hasBatchim = ch>=0xAC00 && ch<=0xD7A3 && (ch-0xAC00)%28!==0;
  if(type==='을를') return hasBatchim ? '을' : '를';
  if(type==='이가') return hasBatchim ? '이' : '가';
  return '';
}
function _cbFill(tpl, atkName, tgtName){
  return tpl
    .replace(/\{atk:을를\}/g, atkName+_cbJosa(atkName,'을를'))
    .replace(/\{atk:이가\}/g, atkName+_cbJosa(atkName,'이가'))
    .replace(/\{atk:에게\}/g, atkName+'에게')
    .replace(/\{tgt:을를\}/g, tgtName+_cbJosa(tgtName,'을를'))
    .replace(/\{tgt:이가\}/g, tgtName+_cbJosa(tgtName,'이가'))
    .replace(/\{tgt:에게\}/g, tgtName+'에게')
    .replace(/\{tgt:은는\}\(는\)/g, tgtName+'은(는)')
    .replace(/\{atk\}/g, atkName)
    .replace(/\{tgt\}/g, tgtName);
}

// 몬스터/유닛 이름(또는 플레이어 직업)에서 지능·무기 태그를 추정한다.
// 명시적으로 태그가 없는 몬스터(AI가 그때그때 생성한 이름 포함)도
// 키워드로 합리적인 기본값을 받는다 — 못 맞히면 sapient+blade로 수렴.
function classifyCombatant(unit){
  if(unit.isPlayer){
    const job = (S.character && (S.character.job||S.character.class)) || '';
    if(/궁수|사수/.test(job)) return { intellect:'sapient', weapon:'bow' };
    if(/마법사|주술사|정령사|샤먼/.test(job)) return { intellect:'sapient', weapon:'magic' };
    if(/창병|랜서/.test(job)) return { intellect:'sapient', weapon:'spear' };
    if(/격투가|수도사|무투가/.test(job)) return { intellect:'sapient', weapon:'unarmed' };
    return { intellect:'sapient', weapon:'blade' };
  }
  const name = unit.baseName || unit.name || '';
  if(/골렘|석상|기계|인형|갑옷|스켈레톤|해골|좀비|미라/.test(name)) return { intellect:'mute', weapon:'blunt' };
  if(/늑대|들개|호랑이|곰|멧돼지|거미|박쥐|쥐|뱀|악어|짐승|야수/.test(name)) return { intellect:'mute', weapon:'fang' };
  if(/궁수|사수|헌터/.test(name)) return { intellect:'sapient', weapon:'bow' };
  if(/창병|창기사|랜서/.test(name)) return { intellect:'sapient', weapon:'spear' };
  if(/마법사|주술사|샤먼|네크로맨서|정령사|메이지/.test(name)) return { intellect:'sapient', weapon:'magic' };
  if(/고블린|오크|코볼트/.test(name)) return { intellect:'feral', weapon:'unarmed' };
  if(/도적|암살자|산적/.test(name)) return { intellect:'sapient', weapon:'blade' };
  if(unit.element && unit.element!=='physical') return { intellect:'sapient', weapon:'magic' };
  return { intellect:'sapient', weapon:'blade' };
}
window.classifyCombatant = classifyCombatant;

const CB_WEAPON_ACTION_BANK = {
  fang: [
    '{atk:이가} 날카로운 이빨을 드러내며 {tgt:을를} 향해 달려들었다',
    '{atk:이가} 발톱을 세워 {tgt:을를} 할퀴려 들었다',
    '{atk:이가} 낮게 몸을 웅크렸다가 그대로 {tgt:에게} 튀어올랐다',
    '{atk:이가} 아가리를 크게 벌려 {tgt}의 목덜미를 노렸다',
    '{atk:이가} 옆구리를 파고들며 {tgt:을를} 물어뜯으려 했다',
    '{atk:이가} 앞발을 크게 휘둘러 {tgt:을를} 후려쳤다',
    '{atk:이가} 어깨를 낮춘 채 {tgt:을를} 향해 몸을 던졌다',
    '{atk:이가} 살기를 번뜩이며 {tgt}의 다리를 노리고 파고들었다',
    '{atk:이가} 등을 활처럼 휘며 {tgt:을를} 덮쳤다',
    '{atk:이가} 이빨을 부딪치며 {tgt:에게} 바짝 다가섰다',
  ],
  blade: [
    '{atk:이가} 검을 크게 휘둘러 {tgt:을를} 베어갔다',
    '{atk:이가} 칼끝을 낮게 세워 {tgt:을를} 향해 찔러갔다',
    '{atk:이가} 검신을 뒤집으며 {tgt:을를} 내리쳤다',
    '{atk:이가} 재빠르게 파고들며 {tgt:을를} 향해 검을 그었다',
    '{atk:이가} 손목을 비틀어 {tgt:을를} 향해 검을 올려쳤다',
    '{atk:이가} 발을 내디디며 {tgt:을를} 향해 짧게 찔러갔다',
    '{atk:이가} 검을 역수로 고쳐 잡고 {tgt:을를} 베어갔다',
    '{atk:이가} 자세를 낮춰 {tgt}의 옆구리를 노리고 파고들었다',
    '{atk:이가} 칼날을 눕혀 {tgt:을를} 향해 횡으로 그었다',
    '{atk:이가} 검끝을 흔들어 시선을 끈 뒤 {tgt:을를} 베어갔다',
  ],
  spear: [
    '{atk:이가} 창끝을 낮게 겨눈 채 {tgt:을를} 향해 찔러갔다',
    '{atk:이가} 창대를 크게 휘둘러 {tgt:을를} 후려치려 했다',
    '{atk:이가} 간격을 벌린 채 {tgt:을를} 향해 창을 내질렀다',
    '{atk:이가} 창날을 낮게 쓸어 {tgt}의 다리를 노렸다',
    '{atk:이가} 창을 회전시키며 {tgt:을를} 향해 후려쳤다',
    '{atk:이가} 자세를 낮춰 {tgt}의 발목을 노리고 창을 휘둘렀다',
    '{atk:이가} 창대를 짧게 잡고 {tgt:을를} 향해 재빠르게 찔렀다',
    '{atk:이가} 거리를 벌린 채 {tgt:을를} 향해 창끝을 겨눴다',
    '{atk:이가} 온몸을 실어 {tgt:을를} 향해 창을 내리꽂았다',
    '{atk:이가} 창날을 세워 {tgt}의 가슴팍을 노렸다',
  ],
  bow: [
    '{atk:이가} 화살을 매겨 {tgt:을를} 겨눈 채 시위를 놓았다',
    '{atk:이가} 물러서며 {tgt:을를} 향해 화살을 날렸다',
    '{atk:이가} 연달아 화살을 메겨 {tgt:에게} 쏘아 보냈다',
    '{atk:이가} 몸을 낮춘 채 {tgt:을를} 향해 정확히 조준해 쐈다',
    '{atk:이가} 시위를 팽팽히 당긴 채 {tgt:을를} 겨눴다',
    '{atk:이가} 무릎을 꿇고 {tgt:을를} 향해 화살을 날렸다',
    '{atk:이가} 바람을 가늠하며 {tgt:을를} 향해 시위를 놓았다',
    '{atk:이가} 재빠르게 두 번째 화살을 매겨 {tgt:을를} 겨눴다',
    '{atk:이가} 숨을 고른 뒤 {tgt}의 급소를 노리고 쏘았다',
    '{atk:이가} 활을 낮춰 {tgt:을를} 향해 빠르게 쏘아붙였다',
  ],
  blunt: [
    '{atk:이가} 철퇴를 크게 치켜들어 {tgt:을를} 내리쳤다',
    '{atk:이가} 방패로 밀치며 {tgt:을를} 가격했다',
    '{atk:이가} 묵직한 곤봉을 휘둘러 {tgt:을를} 노렸다',
    '{atk:이가} 체중을 실어 {tgt:을를} 향해 둔기를 내리찍었다',
    '{atk:이가} 어깨를 밀어붙이며 {tgt:을를} 향해 돌진했다',
    '{atk:이가} 두 손으로 무기를 치켜들어 {tgt:을를} 내리찍었다',
    '{atk:이가} 옆으로 크게 휘둘러 {tgt:을를} 쓸어갔다',
    '{atk:이가} 무게를 실어 {tgt:을를} 향해 짓눌렀다',
    '{atk:이가} 짧게 끊어 치며 {tgt}의 팔을 노렸다',
    '{atk:이가} 온몸으로 부딪치며 {tgt:을를} 밀어붙였다',
  ],
  unarmed: [
    '{atk:이가} 맨주먹을 휘둘러 {tgt:을를} 가격했다',
    '{atk:이가} 거칠게 달려들어 {tgt:을를} 붙잡으려 했다',
    '{atk:이가} 팔꿈치를 세워 {tgt:을를} 내리찍었다',
    '{atk:이가} 몸통 박치기로 {tgt:을를} 밀쳐냈다',
    '{atk:이가} 낮은 자세로 파고들며 {tgt:을를} 향해 주먹을 뻗었다',
    '{atk:이가} 다리를 걸어 {tgt:을를} 넘어뜨리려 했다',
    '{atk:이가} 손날을 세워 {tgt}의 목을 노렸다',
    '{atk:이가} 무릎을 튕겨 올려 {tgt:을를} 가격했다',
    '{atk:이가} 상체를 비틀며 {tgt:을를} 향해 팔꿈치를 꽂았다',
    '{atk:이가} 재빠르게 파고들어 {tgt:을를} 붙잡고 메쳤다',
  ],
  magic: [
    '{atk:이가} 손끝에 마력을 모아 {tgt:을를} 향해 쏘아냈다',
    '{atk:이가} 주문을 읊조리며 {tgt:을를} 향해 손을 뻗었다',
    '{atk:이가} 허공에 마법진을 그리며 {tgt:을를} 겨눴다',
    '{atk:이가} 지팡이 끝에서 뿜어져 나온 빛이 {tgt:을를} 덮쳤다',
    '{atk:이가} 손바닥을 펼쳐 {tgt:을를} 향해 충격파를 쏘아냈다',
    '{atk:이가} 낮은 목소리로 주문을 완성해 {tgt:을를} 덮쳤다',
    '{atk:이가} 허공에 문양을 그리며 {tgt}의 발밑을 노렸다',
    '{atk:이가} 두 손을 맞부딪쳐 {tgt:을를} 향해 마력을 터뜨렸다',
    '{atk:이가} 지팡이를 크게 휘둘러 {tgt:을를} 향해 술식을 완성했다',
    '{atk:이가} 눈빛을 번뜩이며 {tgt:을를} 향해 힘을 쏟아부었다',
  ],
};
const CB_VOICE_BANK = {
  sapient: {
    threat:   ['「감히-!」', '「죽고 싶어 환장했구나!」', '「이 자식이 정말...!」', '「끝까지 발악해봐라!」', '「이걸로 각오해라!」', '「어디 한번 버텨봐라!」', '「이번엔 봐주지 않는다!」', '「그 목숨, 여기서 끝이다!」'],
    surprise: ['「뭐, 뭐야 이건?!」', '「이럴 수가...」', '「말도 안 돼...」', '「어떻게 이런 일이!」', '「이게 무슨...!」', '「설마 이 정도일 줄은...」', '「방심했다...!」', '「이런 실력자였다니...」'],
    triumph:  ['「그럴 줄 알았다!」', '「이걸로 끝이다!」', '「승부는 여기까지다!」', '「약해 빠진 놈.」', '「이 정도면 충분하겠지.」', '「더 볼 것도 없군.」', '「승부는 이미 갈렸다.」', '「수고했다 — 여기까지다.」'],
    pain:     ['「크윽...!」', '「이, 이게 무슨...」', '「젠장...!」', '「아직... 아직이다!」', '「이런 곳에서...!」', '「몸이... 말을 듣지 않는다...」', '「이대로는...!」', '「조금만... 조금만 더...」'],
  },
  feral: {
    threat:   ['"죽인다... 죽여버린다..."', '"약한... 냄새..."', '"찢는다... 갈기갈기..."', '"피... 피 냄새..."', '"물어... 뜯는다..."', '"달아날... 수 없다..."', '"먹이... 먹이 냄새..."', '"끝까지... 쫓는다..."'],
    surprise: ['"컥...?!"', '"어, 어떻게...?"', '"이건... 뭐지...?"', '"강하다...!"', '"예상 밖..."'],
    triumph:  ['"크르... 끝... 끝이다..."', '"약해... 쉽다..."', '"이겼다... 이겼다..."', '"더... 없나..."', '"만족스러운... 사냥..."'],
    pain:     ['"끄으윽..."', '"아프다... 아파..."', '"안... 돼..."', '"이럴... 수가..."', '"물러... 서야..."'],
  },
  mute: {
    threat:   ['낮게 그르렁거리며 이빨을 드러냈다', '털을 곤두세우고 사납게 울부짖었다', '거친 숨을 몰아쉬며 앞발로 땅을 긁었다', '위협하듯 몸을 크게 부풀렸다', '나직한 소음과 함께 위협적으로 다가섰다', '낮은 울음과 함께 자세를 낮췄다', '두 눈에 살기를 띠고 노려보았다', '삐걱이는 관절음과 함께 한 걸음 다가섰다'],
    surprise: ['움찔하며 순간적으로 몸을 움츠렸다', '순간 동작을 멈추고 경계했다', '순간 동작이 멈칫했다', '당황한 듯 잠시 균형을 잃었다', '예상치 못한 반격에 움직임이 흔들렸다'],
    triumph:  ['만족스러운 듯 콧김을 거칠게 내뿜었다', '고개를 치켜들고 승리를 과시하듯 울부짖었다', '묵직한 진동과 함께 승리를 알렸다', '여유롭게 자세를 고쳐 잡았다', '낮은 울음으로 우위를 과시했다'],
    pain:     ['고통스러운 신음과 함께 몸을 뒤틀었다', '휘청이며 뒷걸음질 쳤다', '삐걱이는 소리와 함께 크게 휘청였다', '다리에 힘이 풀려 잠시 휘청였다', '낮은 신음과 함께 자세가 무너졌다'],
  },
};
const CB_NARRATION_BANK = {
  dominant: [
    '{atk:이가} 여유롭게 빈틈을 파고들어 {tgt:을를} 강타했다',
    '{tgt:이가} 이미 한계에 다다른 듯 방어가 무너진다',
    '가볍게 흘려낸 뒤 정확한 반격이 {tgt:을를} 노렸다',
    '전황은 완전히 기울었다 — {atk}의 움직임이 거침없다',
    '{atk:이가} 압도적인 우위 속에서 침착하게 다음 수를 노린다',
    '{tgt:이가} 물러설 곳조차 찾지 못하고 있다',
    '승기는 이미 {atk}에게 완전히 기울어 있었다',
    '{atk:이가} 여유로운 몸놀림으로 {tgt}의 반격을 흘려냈다',
    '남은 것은 시간 문제일 뿐이었다',
  ],
  desperate: [
    '숨이 턱까지 찬 채로 {atk:이가} 마지막 힘을 짜냈다',
    '휘청이는 몸을 간신히 가누며 {tgt:을를} 향해 반격했다',
    '이 한 방에 모든 걸 걸어야 한다 — {atk}의 눈빛이 달라졌다',
    '{atk:이가} 버티는 것조차 벅차 보이지만 물러서지 않는다',
    '한계를 넘어선 몸짓으로 {tgt:을를} 향해 마지막 발버둥을 쳤다',
    '{tgt:이가} 몰아붙이는 기세에 숨 돌릴 틈조차 없다',
    '발밑이 무너지는 듯한 압박감이 {atk:을를} 짓눌렀다',
    '한 걸음만 물러서도 끝이라는 걸 {atk:이가} 알고 있었다',
    '버티는 것만으로도 온 힘을 쥐어짜야 했다',
  ],
  critical: [
    '완벽하게 들어갔다 — {tgt:이가} 크게 휘청인다!',
    '빈틈을 정확히 꿰뚫는 회심의 일격!',
    '{atk}의 일격이 급소를 스쳤다 — 상대의 표정이 일그러진다',
    '누구도 예상 못한 궤적으로 {tgt:을를} 강타했다',
    '방어의 틈을 정확히 파고든 결정적인 순간이었다',
    '{tgt:이가} 미처 반응하지 못한 채 그대로 맞았다',
    '순간적으로 벌어진 빈틈, {atk:이가} 놓치지 않았다',
    '뼈를 울리는 듯한 충격이 {tgt:을를} 덮쳤다',
  ],
  comeback: [
    '포기하려던 순간, 오히려 그것이 {tgt}의 빈틈이 됐다',
    '흐름이 바뀌었다 — 방금 전까지의 수세는 온데간데없다',
    '{atk:이가} 다시 눈을 떴다. 아직 끝나지 않았다',
    '전세가 요동친다 — {atk}의 반격이 심상치 않다',
    '꺾였던 기세가 다시 일어섰다',
    '궁지에 몰렸던 것이 거짓말처럼 상황이 뒤바뀐다',
    '{atk:이가} 마지막 힘을 쥐어짜 흐름을 되돌렸다',
    '승부의 추가 다시 {atk} 쪽으로 기울기 시작했다',
  ],
  decisive: [
    '결정적인 일격이 {tgt:을를} 무너뜨렸다',
    '{tgt:이가} 휘청이며 무릎을 꿇었다',
    '{tgt:이가} 더 이상 버티지 못하고 쓰러졌다',
    '마지막 일격에 {tgt}의 저항이 완전히 무너졌다',
    '{tgt:이가} 힘없이 무기를 놓쳤다',
    '승부를 가르는 결정타가 정확히 들어갔다',
    '{tgt:이가} 그 자리에 힘없이 주저앉았다',
  ],
  neutral: [
    '{atk}과(와) {tgt}이(가) 팽팽하게 맞섰다',
    '서로의 빈틈을 노리며 공방이 이어진다',
    '{atk}의 공격이 {tgt:에게} 스쳤다',
    '서로 한 치의 양보도 없이 맞부딪쳤다',
    '팽팽한 긴장감 속에 공방이 오갔다',
    '{atk:이가} 거리를 재며 다음 기회를 노렸다',
    '승부의 추가 어느 쪽으로도 기울지 않았다',
  ],
};
// ── 상황 분위기를 덧붙이는 짧은 환경/여운 문장 — 특정 몬스터·장소에
//    묶이지 않은 범용 문장이라 로스터가 아무리 늘어나도 그대로 재사용된다.
//    확률적으로만 덧붙어 매번 세 문장이 되지는 않는다(문장이 늘어질 정도로
//    매번 붙으면 오히려 단조로워지므로). ──
const CB_ENV_BANK = {
  dominant: [
    '주변의 공기마저 {atk}의 편을 드는 듯했다',
    '지켜보던 이들도 승부의 향방을 직감했다',
    '먼지가 가라앉을 새도 없이 다음 공세가 이어졌다',
  ],
  desperate: [
    '숨소리마저 거칠어진 전장의 공기가 무겁게 가라앉았다',
    '한 번의 실수도 용납되지 않는 순간이었다',
    '시간이 유독 느리게 흐르는 듯했다',
  ],
  critical: [
    '짧은 정적 뒤에 터져 나온 충격이었다',
    '주변의 시선이 일제히 그 순간에 쏠렸다',
  ],
  comeback: [
    '누구도 예상 못한 반전이었다',
    '전장의 분위기가 순식간에 뒤바뀌었다',
  ],
  decisive: [
    '긴 공방 끝에 승부가 갈리는 순간이었다',
    '전장에 잠시 정적이 감돌았다',
  ],
  neutral: [
    '팽팽한 대치가 이어지는 가운데 시간이 흘렀다',
    '어느 쪽도 쉽게 승기를 잡지 못했다',
  ],
};
const CB_TONE_BY_CAT = { dominant:'threat', critical:'triumph', comeback:'triumph', desperate:'pain', decisive:'triumph', neutral:'threat' };
const CB_VOICE_CHANCE_BY_CAT = { dominant:0.6, critical:0.9, comeback:0.9, desperate:0.7, decisive:0.5, neutral:0.35 };
const CB_ENV_CHANCE_BY_CAT = { dominant:0.25, critical:0.3, comeback:0.35, desperate:0.25, decisive:0.3, neutral:0.2 };

function _cbSumHp(units){ return units.reduce((s,u)=>s+Math.max(0,u.hp),0); }
function _cbSumMaxHp(units){ return units.reduce((s,u)=>s+u.maxHp,0); }

// lc(로컬 전투 상태), 공격자 유닛, 대상 유닛, 이번 공격 데미지, 치명타 여부를 받아
// "무기 동작 + (지능에 맞는) 대사·울음 + 우세/열세 상태 서술" 세 문장을 조합해 반환한다.
function composeLocalAttackLine(lc, atkUnit, tgtUnit, dmg, isCrit){
  lc._cbPrevCat = lc._cbPrevCat || { ally:null, enemy:null };
  const atkSide = atkUnit.side==='ally' ? lc.allies : lc.enemies;
  const oppSide = atkUnit.side==='ally' ? lc.enemies : lc.allies;
  const diff = (_cbSumHp(atkSide)/Math.max(1,_cbSumMaxHp(atkSide))) - (_cbSumHp(oppSide)/Math.max(1,_cbSumMaxHp(oppSide)));
  const killed = tgtUnit.hp<=0;

  let cat;
  if(killed) cat = 'decisive';
  else if(isCrit) cat = 'critical';
  else if(diff > 0.28) cat = 'dominant';
  else if(diff < -0.28) cat = 'desperate';
  else cat = 'neutral';

  if(cat!=='decisive' && cat!=='critical'){
    if(lc._cbPrevCat[atkUnit.side]==='desperate' && diff > -0.05) cat = 'comeback';
    lc._cbPrevCat[atkUnit.side] = (cat==='comeback') ? 'dominant' : cat;
  }

  const traits = classifyCombatant(atkUnit);
  const wpnBank = CB_WEAPON_ACTION_BANK[traits.weapon] || CB_WEAPON_ACTION_BANK.blade;
  const wpnSentence = _cbFill(wpnBank[Math.floor(Math.random()*wpnBank.length)], atkUnit.name, tgtUnit.name);

  let voiceSentence = '';
  const voiceChance = CB_VOICE_CHANCE_BY_CAT[cat]!=null ? CB_VOICE_CHANCE_BY_CAT[cat] : 0.3;
  if(Math.random() < voiceChance){
    const tone = CB_TONE_BY_CAT[cat] || 'threat';
    const vb = (CB_VOICE_BANK[traits.intellect] || CB_VOICE_BANK.sapient)[tone];
    if(vb && vb.length){
      const line = vb[Math.floor(Math.random()*vb.length)];
      voiceSentence = (traits.intellect==='mute') ? (atkUnit.name+_cbJosa(atkUnit.name,'이가')+' '+line) : line;
    }
  }

  const outBank = CB_NARRATION_BANK[cat] || CB_NARRATION_BANK.neutral;
  const outcomeSentence = _cbFill(outBank[Math.floor(Math.random()*outBank.length)], atkUnit.name, tgtUnit.name);

  let envSentence = '';
  const envChance = CB_ENV_CHANCE_BY_CAT[cat]!=null ? CB_ENV_CHANCE_BY_CAT[cat] : 0.25;
  if(Math.random() < envChance){
    const envBank = CB_ENV_BANK[cat] || CB_ENV_BANK.neutral;
    if(envBank && envBank.length) envSentence = _cbFill(envBank[Math.floor(Math.random()*envBank.length)], atkUnit.name, tgtUnit.name);
  }

  return [wpnSentence, voiceSentence, outcomeSentence, envSentence].filter(Boolean).join(' ');
}
window.composeLocalAttackLine = composeLocalAttackLine;

// ══════════════════════════════════════════════════════════════════
// 로컬 서술 — 스킬/도주/지형필살/방어 전용 뱅크. 공격 교환이 아니라
// "이 행동을 했다/성공했다/실패했다"는 단발성 이벤트라 composeLocalAttackLine의
// 우세/열세 판정 구조와는 안 맞아서, 행동별 소규모 뱅크로 따로 둔다.
// 전부 플레이어 기준(도주/방어/지형필살은 플레이어 전용 행동)이라
// classifyCombatant 분기가 필요 없다 — 매번 같은 사람이 하는 행동이므로.
// ══════════════════════════════════════════════════════════════════
const CB_TERRAIN_BANK = {
  success: [
    '{atk:이가} 지형을 완벽히 이용해 {tgt:을를} 몰아붙였다',
    '틈을 놓치지 않고 {atk:이가} 결정적인 순간을 만들어냈다',
    '{tgt:이가} 미처 지형의 함정을 피하지 못했다',
    '{atk:이가} 주변 환경을 이용해 승기를 완전히 굳혔다',
    '노림수가 정확히 들어맞았다 — {tgt}의 반격이 무뎌진다',
    '{atk:이가} 지형지물을 방패 삼아 결정타를 꽂아넣었다',
    '주변을 살피던 {atk}의 눈빛이 날카로워졌다',
    '한 치의 오차도 없이 계획대로 흘러갔다',
  ],
  fail: [
    '{atk:이가} 발을 헛디디며 균형을 잃었다',
    '노림수가 어긋나며 오히려 빈틈이 드러났다',
    '지형을 이용하려던 시도가 무위로 돌아갔다',
    '{atk:이가} 위험을 무릅썼지만 결과가 따르지 않았다',
    '순간의 판단이 어긋나며 대가를 치렀다',
    '{atk:이가} 자세가 흐트러진 채 물러섰다',
    '기회를 놓친 대가는 뼈아팠다',
    '{atk:이가} 다급히 자세를 고쳐 잡았다',
  ],
};
const CB_FLEE_BANK = {
  success: [
    '{atk:이가} 혼란한 틈을 타 재빠르게 몸을 뺐다',
    '뒤도 돌아보지 않고 {atk:이가} 전장을 벗어났다',
    '{atk:이가} 지형을 이용해 순식간에 거리를 벌렸다',
    '가쁜 숨을 몰아쉬며 {atk:이가} 안전한 곳에 다다랐다',
    '{atk:이가} 결단을 내리고 몸을 돌렸다',
    '뒤쫓는 기척이 점점 멀어졌다',
    '{atk:이가} 순발력을 발휘해 포위를 빠져나갔다',
    '한숨 돌릴 틈이 생겼다',
  ],
  fail: [
    '몇 걸음 못 가 {atk:이가} 발목을 붙잡혔다',
    '{atk:이가} 도주로를 찾지 못하고 그 자리에 멈춰섰다',
    '등 뒤로 다가오는 기척에 {atk:이가} 몸이 굳었다',
    '{atk:이가} 균형을 잃고 휘청였다',
    '퇴로가 이미 막혀 있었다',
    '{atk:이가} 다급히 방향을 틀었지만 늦었다',
    '거리를 좁혀오는 적을 뿌리치지 못했다',
    '{atk:이가} 거친 숨을 몰아쉬며 다시 자세를 잡았다',
  ],
};
const CB_SKILL_BANK = {
  damage: [
    '{atk:이가} 「{skill}」의 힘을 끌어올려 {tgt:을를} 향해 터뜨렸다',
    '응축된 기운이 {tgt:을를} 그대로 덮쳤다',
    '{atk:이가} 동작을 완성하자 {tgt}의 방어가 무너졌다',
    '「{skill}」의 여파가 주변을 흔들었다',
    '{atk:이가} 한 치의 망설임 없이 술식을 풀어냈다',
    '빛과 함께 터져 나온 힘이 {tgt:을를} 강타했다',
    '{tgt:이가} 예상치 못한 위력에 휘청였다',
    '{atk:이가} 쌓아온 힘을 단숨에 쏟아냈다',
  ],
  heal: [
    '{atk:이가} 숨을 고르며 따뜻한 기운을 끌어모았다',
    '상처 위로 은은한 빛이 스며들었다',
    '{atk:이가} 지친 몸에 새 힘이 도는 것을 느꼈다',
    '「{skill}」의 온기가 몸을 감쌌다',
    '{atk:이가} 다시 숨을 크게 들이쉬었다',
    '흐트러졌던 호흡이 서서히 안정을 되찾았다',
    '{atk:이가} 굳은 표정을 풀고 다시 자세를 잡았다',
    '상처의 통증이 한결 가라앉았다',
  ],
  buff: [
    '{atk:이가} 「{skill}」을(를) 발동하며 기세를 끌어올렸다',
    '몸 안에서 힘이 새롭게 차오르는 것이 느껴졌다',
    '{atk:이가} 눈빛을 다잡으며 다음 수를 준비했다',
    '전신에 감도는 기운이 달라졌다',
    '{atk:이가} 자세를 고쳐 잡으며 만반의 준비를 마쳤다',
    '「{skill}」의 효과가 서서히 몸에 스며들었다',
    '{atk:이가} 짧게 숨을 고르며 집중했다',
    '보이지 않는 힘이 {atk:을를} 감싸고 돌았다',
  ],
  summon: [
    '{atk:이가} 「{skill}」을(를) 외치자 주변의 기운이 뒤틀렸다',
    '어둠 속에서 무언가가 서서히 형체를 갖췄다',
    '{atk:이가} 불러낸 존재가 곁에 나란히 섰다',
    '공기가 서늘해지며 새로운 기척이 나타났다',
    '{atk:이가} 손짓하자 소환된 것들이 자리를 잡았다',
    '「{skill}」의 부름에 응답이 돌아왔다',
    '{atk:이가} 만족스러운 얼굴로 소환체를 바라보았다',
    '전장에 새로운 그림자가 늘어섰다',
  ],
};
const CB_DEFEND_BANK = [
  '{atk:이가} 자세를 낮추고 무기를 고쳐 잡았다',
  '{atk:이가} 숨을 고르며 다음 공격에 대비했다',
  '빈틈을 최소화하려 {atk:이가} 몸을 웅크렸다',
  '{atk:이가} 시선을 떼지 않은 채 태세를 갖췄다',
  '{atk:이가} 두 발을 단단히 딛고 버틸 준비를 마쳤다',
  '잠시 숨을 돌리며 {atk:이가} 다음 기회를 노렸다',
  '{atk:이가} 흐트러진 호흡을 가다듬었다',
  '{atk:이가} 경계를 늦추지 않고 자세를 고쳐 잡았다',
];

function composeTerrainLine(player, target, success){
  const bank = success ? CB_TERRAIN_BANK.success : CB_TERRAIN_BANK.fail;
  const tgtName = target ? target.name : player.name;
  return _cbFill(bank[Math.floor(Math.random()*bank.length)], player.name, tgtName);
}
function composeFleeLine(player, success){
  const bank = success ? CB_FLEE_BANK.success : CB_FLEE_BANK.fail;
  return _cbFill(bank[Math.floor(Math.random()*bank.length)], player.name, player.name);
}
function composeSkillLine(player, target, kind, skillName){
  const bank = CB_SKILL_BANK[kind] || CB_SKILL_BANK.buff;
  const tgtName = target ? target.name : player.name;
  return _cbFill(bank[Math.floor(Math.random()*bank.length)], player.name, tgtName).replace(/\{skill\}/g, skillName||'');
}
function composeDefendLine(player){
  return _cbFill(CB_DEFEND_BANK[Math.floor(Math.random()*CB_DEFEND_BANK.length)], player.name, player.name);
}
window.composeTerrainLine = composeTerrainLine;
window.composeFleeLine = composeFleeLine;
window.composeSkillLine = composeSkillLine;
window.composeDefendLine = composeDefendLine;

// [AI 제거] requestCombatNarration — 스킬/도주/지형필살/방어까지 전부
// 로컬 조합 방식(composeLocalAttackLine 등, 위 참조)으로 대체되어 이미
// 어디서도 호출되지 않던 죽은 함수였다. 남은 fetch 호출부까지 완전히
// 제거하기 위해 함수 자체를 삭제한다.

function scheduleLocalCombatStart(){
  try{
    S._pendingLocalCombat = true; // 다음 tick에서 전투 패널을 자동으로 연다
  }catch(e){}
}
window.scheduleLocalCombatStart = scheduleLocalCombatStart;

// ── 전투 시작: loadMonsters()에 있는 살아있는 몬스터 + loadParty()를
//    LOCAL_COMBAT 상태로 변환한다. 최대 8명씩만 참여(초과분은 대기). ──
function initLocalCombat(){
  // 이미 진행 중인 전투가 있으면 그대로 반환 — 재호출 시 HP가 초기화되는
  // 것을 방지한다 (예: sendMsg 가드가 여러 경로에서 이 함수를 호출할 수 있음).
  const existing = loadLocalCombat();
  if(existing && existing.active) return existing;

  // 레이드 전투가 진행 중이면 일반 몬스터 전투를 새로 시작하지 않는다 —
  // 두 전투 시스템이 동시에 플레이어 HP를 조작하는 것을 방지한다.
  if(window.RAID_BATTLE_STATE && window.RAID_BATTLE_STATE.active) return null;

  const monsters = (typeof loadMonsters==='function' ? loadMonsters() : []).filter(m=>m.status==='alive');
  if(!monsters.length) return null;

  // 이 조우가 로컬 엔진으로 시작됐음을 몬스터 데이터에 표시해둔다.
  // 도주/패배로 몬스터가 살아남아도 이 표시 덕분에 다음 조우 때도
  // AI 서사 기반 전투가 아니라 로컬 엔진으로 계속 이어지게 한다.
  try{
    monsters.forEach(m=>{ m._localCombatEngaged = true; });
    if(typeof saveMonsters==='function') saveMonsters(monsters);
  }catch(e){}

  const party = (typeof loadParty==='function' ? loadParty() : []).filter(p=>p.alive!==false);
  const summons = (typeof window.loadSummons==='function' ? window.loadSummons() : []).filter(s=>s.status==='active');
  const playerUnit = {
    id:'player', side:'ally', isPlayer:true,
    name: (S.character&&S.character.name) || '플레이어',
    hp: S.stats?.hp||100, maxHp: S.stats?.maxHp||100,
    atk: S.stats?.str||50, def: S.stats?.end||10,
  };
  // 파티원과 소환수를 합쳐 나머지 슬롯(최대 8명 중 플레이어 제외 7자리)에
  // 나눠 채운다 — 파티를 우선하고 남는 자리에 소환수를 채운다.
  const remainingSlots = LC_MAX_SIDE - 1;
  const partySlice = party.slice(0, remainingSlots);
  const summonSlots = Math.max(0, remainingSlots - partySlice.length);
  const summonSlice = summons.slice(0, summonSlots);

  const allyUnits = [
    playerUnit,
    ...partySlice.map(p=>({
      id:'ally_'+p.name, side:'ally', isPlayer:false, isSummon:false,
      name:p.name, hp:p.hp!=null?p.hp:(p.maxHp||100), maxHp:p.maxHp||100,
      atk: 30 + Math.round((p.statBonus?.str||0)/2), def: 8 + Math.round((p.statBonus?.end||0)/3),
    })),
    ...summonSlice.map(s=>({
      id:'summon_'+s.name, side:'ally', isPlayer:false, isSummon:true,
      name:(s.customName||s.name), hp:s.hp!=null?s.hp:(s.maxHp||100), maxHp:s.maxHp||100,
      atk:s.atk||20, def:s.def||5,
    })),
  ];

  // ── [리팩터] 잡몹 무리를 개별 유닛으로 전개 — "무리 압축 표현"은
  //    AI가 여러 마리를 서사로 일일이 다루기 버거워서 만든 타협책이었다.
  //    로컬 전투는 AI가 없으니 그 타협이 필요 없다. 개별 유닛으로 만들면
  //    포로화·속성 공격·약점 노리기 같은 다른 기능도 마리마다 자연스럽게
  //    적용되고, "몇 마리 남았는지" 역산도 필요 없어진다.
  //    8마리 슬롯을 넘는 초과분은 대기열(enemyReinforcements)에 두고,
  //    한 마리가 쓰러질 때마다 자동으로 한 마리씩 전장에 투입한다. ──
  const expandedEnemies = [];
  monsters.forEach(m=>{
    const count = m.count||1;
    const hpEach = m.hpEach || Math.round((m.hp||10)/count) || 1;
    const atkEach = count>1 ? Math.round((m.atk||10)/Math.sqrt(count)) : (m.atk||10); // 원래 무리 공격력 배율을 역산해 개체당 순수 공격력 복원
    for(let i=0; i<count; i++){
      expandedEnemies.push({
        id: count>1 ? `${m.id}_${i+1}` : m.id,
        side: 'enemy',
        baseName: m.name,
        name: count>1 ? `${m.name} ${i+1}` : m.name,
        hp: hpEach, maxHp: hpEach,
        atk: atkEach, def: m.def||0,
        element: m.element, weakElement: m.weakElement, resistElement: m.resistElement,
        isBoss: m.isBoss, isNamed: m.isNamed, isGroup: false, // 개별 유닛이므로 더 이상 무리 표시가 필요 없음
      });
    }
  });
  const enemyUnits = expandedEnemies.slice(0, LC_MAX_SIDE);
  const enemyReinforcements = expandedEnemies.slice(LC_MAX_SIDE); // 슬롯 초과분 대기열

  // ── 지형 감지 — AI 텍스트 없이도 현재 위치의 이름+설명만으로 판단 가능한
  //    detectTerrainFromText를 그대로 재사용한다. 지형별 필살기 정보는
  //    TERRAIN_EFFECTS_BATTLE에 이미 완비되어 있다. ──
  let terrainId = null;
  try{
    const curLoc = typeof loadCurrentLocation==='function' ? loadCurrentLocation() : null;
    if(curLoc && typeof detectTerrainFromText==='function'){
      terrainId = detectTerrainFromText(curLoc.desc||'', curLoc.name||'');
    }
  }catch(e){}

  // 로그에는 "고블린 1, 고블린 2, 고블린 3"처럼 나열하지 않고 원래
  // 몬스터 이름 기준으로 마릿수를 요약해 표시(가독성 유지) — 계산 자체는
  // 개별 유닛이지만, 첫 등장 메시지 정도는 사람이 읽기 좋게 묶어준다.
  const nameCounts = {};
  expandedEnemies.forEach(e=>{ nameCounts[e.baseName] = (nameCounts[e.baseName]||0)+1; });
  const spawnSummary = Object.entries(nameCounts).map(([n,c])=> c>1 ? `${n}×${c}` : n).join(', ');

  const combat = {
    active:true, turn:0,
    allies: allyUnits, enemies: enemyUnits,
    enemyReinforcements, // 8마리 슬롯을 넘는 초과분 대기열
    terrainId,
    terrainChanceUsedThisTurn:false,
    log: [`⚔️ 전투 시작 — ${spawnSummary} 등장!`],
  };
  saveLocalCombat(combat);
  return combat;
}
window.initLocalCombat = initLocalCombat;

// ── 대상 선택: 살아있는 적 중 첫 번째(추후 타겟팅 UI로 확장 가능) ──
function pickTarget(units){ return units.find(u=>u.hp>0) || null; }

// ── 한 유닛의 공격 처리(공용 — 플레이어/동료/적 모두 동일 로직 사용) ──
// ── 지형 필살 기회 판정 — 매 턴 자동으로 확률을 굴려, 성공하면 그 턴에만
//    "지금 [지형] 필살기를 쓸 틈이 보인다"는 기회가 열린다. 안 쓰고 다른
//    행동을 하면 기회는 사라지고, 다음 턴에 다시 확률을 굴린다. 대상의
//    HP가 낮을수록(약해질수록) 확률이 올라가 "몰아붙이는 타이밍"이라는
//    전략적 느낌을 준다. 원래 AI가 "창의적인 순간인지" 서사로 판단하던
//    부분을, 매 턴 안 뜨는 우연한 기회 + 약화 시 확률 상승으로 대체한다. ──
function checkTerrainOpportunity(lc){
  lc.terrainOpportunity = false;
  if(!lc.terrainId || typeof TERRAIN_EFFECTS_BATTLE==='undefined') return;
  const def = TERRAIN_EFFECTS_BATTLE[lc.terrainId];
  if(!def || !def.finisher) return;

  const target = lc.enemies.find(e=>e.hp>0 && !e._captured);
  if(!target) return;

  let chance = 0.12; // 기본 12%
  const hpPct = target.hp / target.maxHp;
  if(hpPct <= 0.3) chance = 0.30;
  else if(hpPct <= 0.5) chance = 0.20;

  if(Math.random() < chance){
    lc.terrainOpportunity = true;
    lc.terrainOpportunityTarget = target.id;
    lc.log.unshift(`${def.icon} 지금 「${def.finisher.label}」을(를) 시도할 틈이 보인다!`);
  }
}

// ── 지형 필살기 실행 — 성공/실패 확률과 보상은 기존 terrain_finisher
//    GS 처리 로직(일반몹 즉사, 보스 35% 피해+1회 격분, 실패 시 역효과)을
//    그대로 이식한다. ──
async function executeTerrainFinisher(lc){
  if(!lc.terrainOpportunity) return;
  const def = TERRAIN_EFFECTS_BATTLE[lc.terrainId];
  const target = lc.enemies.find(e=>e.id===lc.terrainOpportunityTarget && e.hp>0);
  const player = lc.allies.find(u=>u.isPlayer);
  lc.terrainOpportunity = false;
  if(!def || !target) return;

  const successChance = 0.6; // 기본 성공률 60%
  if(Math.random() < successChance){
    if(target.isBoss){
      const dmg = Math.round(target.maxHp * 0.35);
      target.hp = Math.max(1, target.hp - dmg);
      if(!target._terrainEnraged){
        target._terrainEnraged = true;
        target.atk = Math.round(target.atk * 1.4);
        lc.log.unshift(`${def.icon} 「${def.finisher.label}」 성공! ${target.name}이(가) 큰 피해(${dmg})를 입고 격분했다! (공격력 상승)`);
      } else {
        lc.log.unshift(`${def.icon} 「${def.finisher.label}」 성공! ${target.name}에게 추가 피해 ${dmg}.`);
      }
    } else {
      target.hp = 0;
      target._incapProcessed = true; // 확정 처치이므로 별도 확률 판정 없이 즉시 사망 처리
      lc.log.unshift(`💀 ${def.icon} 「${def.finisher.label}」 성공! ${target.name}이(가) 그 자리에서 쓰러졌다!`);
    }
    try{
      if(player){
        const narration = composeTerrainLine(player, target, true);
        if(narration) lc.log.unshift(`📖 ${narration}`);
      }
    }catch(e){}
  } else {
    // 실패 — 위험 부담이 본인에게 돌아온다: 플레이어가 추가 피해를 입는다.
    if(player){
      const penalty = Math.round(player.maxHp * 0.08);
      player.hp = Math.max(1, player.hp - penalty);
      syncPlayerHpToGlobalStats(player);
    }
    lc.log.unshift(`⚠️ ${def.icon} 「${def.finisher.label}」 실패! 위험에 노출되어 오히려 피해를 입었다.`);
    try{
      if(player){
        const narration = composeTerrainLine(player, target, false);
        if(narration) lc.log.unshift(`📖 ${narration}`);
      }
    }catch(e){}
  }
}

function unitAttack(attacker, defender){
  // [정리] 이전에는 무리형 몬스터를 하나의 압축 유닛으로 다뤄 마리 수
  // 감소에 따른 제곱근 곡선 공격력 감쇠가 필요했다. 이제 로컬 전투는
  // 무리를 개별 유닛으로 전개하므로(initLocalCombat 참고), 각 유닛이
  // 이미 자기 몫의 순수 공격력을 갖고 있어 이 보정이 필요 없다.
  const result = calcDamage(attacker, defender);
  defender.hp = Math.max(0, defender.hp - result.dmg);
  return result;
}

// ── 플레이어 턴 처리: action = 'attack' | 'defend' | 'flee' ──
async function processLocalCombatTurn(action, targetId, element, skillId){
  // [동시성 가드] 서사 요청(AI 호출)이 진행 중일 때 버튼을 또 누르면
  // 같은 턴이 중복 처리될 수 있다 — 요청이 끝날 때까지 새 턴 처리를 막는다.
  if(window._localCombatTurnBusy) return;
  window._localCombatTurnBusy = true;
  try{

  const lc = loadLocalCombat();
  if(!lc || !lc.active) { window._localCombatTurnBusy = false; return; }
  lc.turn++;

  const player = lc.allies.find(u=>u.isPlayer);
  if(!player || player.hp<=0){ finishLocalCombat(lc, false); window._localCombatTurnBusy = false; return; }

  // [버그 수정] 로컬 전투 도중 인벤토리 패널에서 회복 아이템을 쓰면
  // S.stats.hp(전역)만 갱신되고, 로컬 전투가 자체적으로 들고 있는
  // player.hp(사본)는 그대로 남아있었다 — 다음 턴에 그 옛날 값으로
  // S.stats.hp를 다시 덮어써서 방금 마신 물약 효과가 통째로 사라지는
  // 문제가 있었다. 턴 시작 시 전역 HP가 로컬 값보다 높으면(=전투 밖에서
  // 회복이 있었던 것으로 판단) 그 값을 반영한다. 반대로 낮은 경우는
  // 반영하지 않는다 — 전역 HP가 로컬보다 낮아지는 경우는 정상적으로는
  // 없어야 하지만, 혹시 다른 시스템이 손댔더라도 전투 계산 자체를
  // 되돌리는 방향으로는 동기화하지 않기 위함이다.
  if(S?.stats?.hp !== undefined && S.stats.hp > player.hp){
    player.hp = Math.min(player.maxHp, S.stats.hp);
  }

  if(action === 'flee'){
    // 도주 기본 성공률 55%, 다인 전투(적 수가 많을수록)일수록 불리
    const aliveEnemies = lc.enemies.filter(e=>e.hp>0).length;
    const fleeChance = Math.max(0.25, 0.6 - aliveEnemies*0.05);
    if(Math.random() < fleeChance){
      lc.log.unshift(`💨 ${player.name}이(가) 전장에서 이탈했다.`);
      try{
        const narration = composeFleeLine(player, true);
        if(narration) lc.log.unshift(`📖 ${narration}`);
      }catch(e){}
      finishLocalCombat(lc, null); // null = 무승부(도주 성공, 보상 없음)
      return;
    } else {
      lc.log.unshift(`💨 도주에 실패했다! 적이 반격한다.`);
      try{
        const narration = composeFleeLine(player, false);
        if(narration) lc.log.unshift(`📖 ${narration}`);
      }catch(e){}
      // 도주 실패 시 모든 살아있는 적이 플레이어를 공격
      lc.enemies.filter(e=>e.hp>0).forEach(en=>{
        const r = unitAttack(en, player);
        lc.log.unshift(`${en.name} → ${player.name}: ${r.dmg} 피해`);
      });
      syncPlayerHpToGlobalStats(player);
      if(player.hp<=0){ finishLocalCombat(lc, false); return; }
      saveLocalCombat(lc);
      renderLocalCombatPanel();
      return;
    }
  }

  if(action === 'skill'){
    const allDefs = typeof getAllSkillDefs==='function' ? getAllSkillDefs() : [];
    const skillDef = allDefs.find(s=>s.id===skillId);
    if(!skillDef || !skillDef.effects || !skillDef.effects.kind){
      toast('사용할 수 없는 스킬입니다.');
      window._localCombatTurnBusy = false;
      return;
    }
    const cost = skillDef.mpCost||0;
    if(S?.stats?.mp !== undefined && S.stats.mp < cost){
      toast(`MP가 부족합니다! (필요: ${cost}MP)`, 1800);
      window._localCombatTurnBusy = false;
      return;
    }
    if(S?.stats?.mp !== undefined) S.stats.mp = Math.max(0, S.stats.mp - cost);

    const target = targetId ? lc.enemies.find(e=>e.id===targetId && e.hp>0) : pickTarget(lc.enemies);
    const result = resolveSkillEffect(skillId, target);
    let resultDesc = '';

    if(result){
      switch(result.kind){
        case 'damage': {
          if(target){
            let skillDmg = result.damage;
            let elemNote = '';
            // [버그 수정] 스킬 고유 속성(effects.element)이 있어도 대상의
            // 약점/저항과 대조하는 배율 계산이 빠져 있어, 속성 스킬을
            // 만들어도 상성 효과가 전혀 반영되지 않았다. 일반 공격의
            // 속성 공격 버튼과 동일한 계산을 스킬에도 적용한다.
            if(result.element && result.element!=='physical' && typeof calcMonsterDamageMultiplier==='function'){
              const affinity = calcMonsterDamageMultiplier(result.element, target);
              if(affinity.mod !== 1.0){
                const before = skillDmg;
                skillDmg = Math.round(skillDmg * affinity.mod);
                elemNote = ` [${affinity.label}! ${before}→${skillDmg}]`;
              }
            }
            target.hp = Math.max(0, target.hp - skillDmg*(result.hits||1));
            lc.log.unshift(`${skillDef.icon||'✨'} ${player.name}의 「${skillDef.name}」! ${target.name}에게 ${skillDmg} 피해${result.hits>1?` ×${result.hits}`:''}${elemNote}`);
            resultDesc = `${target.name}에게 ${skillDmg} 피해${elemNote}`;
            if(target.hp<=0 && !target._incapProcessed){
              target._incapProcessed = true;
              const deathChance = target.isBoss ? 0.25 : target.isNamed ? 0.40 : 0.60;
              if(Math.random() < deathChance){
                lc.log.unshift(`💀 ${target.name}이(가) 쓰러졌다.`);
              } else {
                target.hp = 1;
                lc.log.unshift(`🩸 ${target.name}이(가) 치명상을 입었지만 아직 숨이 붙어있다.`);
              }
              if(typeof getMonsterRevivalChance==='function'){
                const rc = getMonsterRevivalChance(target);
                if(rc>0 && Math.random()<rc && !target._hasRevived){
                  target._hasRevived = true;
                  target.hp = Math.max(1, Math.round(target.maxHp*(0.3+Math.random()*0.2)));
                  target.atk = Math.round(target.atk*0.8);
                  target._incapProcessed = false;
                  lc.log.unshift(`🌑 ${target.name}이(가) 다시 일어섰다!`);
                }
              }
            }
          }
          break;
        }
        case 'heal': {
          player.hp = Math.min(player.maxHp, player.hp + result.heal);
          syncPlayerHpToGlobalStats(player);
          lc.log.unshift(`${skillDef.icon||'✨'} ${player.name}의 「${skillDef.name}」! HP +${result.heal} 회복`);
          resultDesc = `HP ${result.heal} 회복`;
          break;
        }
        case 'buff': case 'debuff': case 'statBoost': {
          lc.log.unshift(`${skillDef.icon||'✨'} ${player.name}의 「${skillDef.name}」! ${Object.entries(result.statMod||{}).map(([k,v])=>`${k}${v>=0?'+':''}${v}`).join(', ')}`);
          resultDesc = `상태 변화: ${Object.entries(result.statMod||{}).map(([k,v])=>`${k}${v>=0?'+':''}${v}`).join(', ')}`;
          break;
        }
        case 'summon': {
          // [버그 수정] 기존엔 lc.allies(로컬 전투 임시 배열)에만 추가되고
          // 전역 loadSummons()에는 전혀 등록되지 않아, 전투가 끝나면
          // 소환수가 완전히 사라지고 소환 관리 패널에서도 보이지 않는
          // 문제가 있었다. AI 서사 전투 경로와 동일하게 전역 저장소에도
          // 함께 등록해 두 경로의 결과가 일치하도록 한다.
          const roomLeft = LC_MAX_SIDE - lc.allies.length;
          let toSummon = Math.min(result.count, Math.max(0, roomLeft));

          try{
            const summons = typeof window.loadSummons==='function' ? window.loadSummons() : [];
            const activeSummons = summons.filter(s=>s.status==='active');
            const globalRoomLeft = Math.max(0, result.maxActive - activeSummons.length);
            toSummon = Math.min(toSummon, globalRoomLeft); // 로컬 전투 슬롯과 전역 유지 한도 중 더 좁은 쪽을 따름

            for(let i=0; i<toSummon; i++){
              const summonName = `${skillDef.name} 소환체 ${activeSummons.length+i+1}`;
              const summonId = `summon_${skillId}_${Date.now()}_${i}`;
              summons.push({
                id: summonId,
                name: summonName,
                icon: skillDef.icon||'💀', category:'undead', origin:'스킬 소환',
                hp: result.summonHp, maxHp: result.summonHp,
                atk: result.summonAtk, def: result.summonDef,
                level:1, exp:0, loyalty:80, status:'active', mood:'neutral',
                onMission:false, missionLog:[], dialogLog:[], totalKills:0, totalMissions:0,
                summonedAt: new Date().toISOString(),
              });
              // 전역 등록과 동시에 로컬 전투 아군 자리에도 즉시 합류시킨다 —
              // id를 공유해 전투 종료 후 로컬 전투의 최종 HP를 전역 소환수
              // 기록에 다시 반영할 수 있게 한다.
              lc.allies.push({
                id: summonId, side:'ally', isPlayer:false, isSummon:true,
                name: summonName, hp: result.summonHp, maxHp: result.summonHp,
                atk: result.summonAtk, def: result.summonDef,
              });
            }
            if(typeof window.saveSummons==='function') window.saveSummons(summons);
          }catch(e){ console.warn('[skill summon]', e); }

          lc.log.unshift(`${skillDef.icon||'✨'} ${player.name}의 「${skillDef.name}」! ${toSummon}기 소환 (${result.locationCategory==='graveyard'?'무덤 보정':result.locationCategory==='dungeon'?'던전 보정':'기본'})`);
          resultDesc = `${toSummon}기 소환 (HP${result.summonHp}/ATK${result.summonAtk})`;
          break;
        }
      }
    }

    try{
      const skillKindToBank = { damage:'damage', heal:'heal', buff:'buff', debuff:'buff', statBoost:'buff', summon:'summon' };
      const bankKind = skillKindToBank[result && result.kind] || 'buff';
      const narration = composeSkillLine(player, target, bankKind, skillDef.name);
      if(narration) lc.log.unshift(`📖 ${narration}`);
    }catch(e){}

    if(lc.enemies.every(e=>e.hp<=0)){
      finishLocalCombat(lc, true);
      return;
    }
    // 적 턴 진행
    lc.enemies.filter(e=>e.hp>0).forEach(en=>{
      const aliveAllies = lc.allies.filter(u=>u.hp>0 && !u._outOfBattle);
      if(!aliveAllies.length) return;
      const target2 = aliveAllies[Math.floor(Math.random()*aliveAllies.length)];
      const r2 = unitAttack(en, target2);
      lc.log.unshift(`${en.name} → ${target2.name}: ${r2.dmg} 피해`);
      try{
        const narration = composeLocalAttackLine(lc, en, target2, r2.dmg, !!r2.crit);
        if(narration) lc.log.unshift(`📖 ${narration}`);
      }catch(e){}
    });
    // [버그 수정] 이 판정이 빠져 있어 스킬 사용 중 반격으로 동료가
    // HP 0이 되어도 사망/부상 처리가 전혀 실행되지 않았다.
    processAllyIncapJudgment(lc);
    syncPlayerHpToGlobalStats(player);
    if(lc.allies.every(u=>u.hp<=0 || u._outOfBattle) || player.hp<=0){
      finishLocalCombat(lc, false);
      return;
    }
    checkTerrainOpportunity(lc);
    lc.log = lc.log.slice(0, 40);
    saveLocalCombat(lc);
    renderLocalCombatPanel();
    return;
  }

  if(action === 'terrain'){
    await executeTerrainFinisher(lc);
    // 지형 필살은 그 자체로 하나의 큰 행동이므로, 성공 시 적이 전멸했는지만
    // 확인하고(즉시 승리 처리) 실패해도 이번 턴은 여기서 마무리한다 —
    // 별도로 플레이어의 일반 공격이 이어지지 않는다.
    if(lc.enemies.every(e=>e.hp<=0)){
      finishLocalCombat(lc, true);
      return;
    }
    // 적 턴 진행(지형 필살 성공/실패와 무관하게 살아있는 적은 반격한다)
    lc.enemies.filter(e=>e.hp>0).forEach(en=>{
      const aliveAllies = lc.allies.filter(u=>u.hp>0 && !u._outOfBattle);
      if(!aliveAllies.length) return;
      const target2 = aliveAllies[Math.floor(Math.random()*aliveAllies.length)];
      const r2 = unitAttack(en, target2);
      lc.log.unshift(`${en.name} → ${target2.name}: ${r2.dmg} 피해`);
      try{
        const narration = composeLocalAttackLine(lc, en, target2, r2.dmg, !!r2.crit);
        if(narration) lc.log.unshift(`📖 ${narration}`);
      }catch(e){}
    });
    // [버그 수정] 이 판정이 빠져 있어 지형 필살 사용 중 반격으로 동료가
    // HP 0이 되어도 사망/부상 처리가 전혀 실행되지 않았다.
    processAllyIncapJudgment(lc);
    syncPlayerHpToGlobalStats(player);
    if(lc.allies.every(u=>u.hp<=0 || u._outOfBattle) || player.hp<=0){
      finishLocalCombat(lc, false);
      return;
    }
    checkTerrainOpportunity(lc);
    lc.log = lc.log.slice(0, 40);
    saveLocalCombat(lc);
    renderLocalCombatPanel();
    return;
  }

  if(action === 'attack' || action === 'combo' || action === 'weakpoint'){
    const target = targetId ? lc.enemies.find(e=>e.id===targetId && e.hp>0) : pickTarget(lc.enemies);
    if(target){
      const r = unitAttack(player, target);
      let dmg = r.dmg;
      let elemNote = '';
      // ── 속성 상성 배율 — 기존 calcMonsterDamageMultiplier(약점 2배/
      //    저항 0.4배/일반 12속성 상성표)를 그대로 재사용한다. ──
      if(element && element!=='physical' && typeof calcMonsterDamageMultiplier==='function'){
        const affinity = calcMonsterDamageMultiplier(element, target);
        if(affinity.mod !== 1.0){
          const before = dmg;
          dmg = Math.round(dmg * affinity.mod);
          target.hp = Math.max(0, target.hp - (dmg - before)); // 이미 unitAttack에서 before만큼 깎였으니 차액만 추가 반영
          elemNote = ` [${affinity.label}! ${before}→${dmg}]`;
        }
      }
      let bonusNote = '';
      if(action === 'combo'){
        // 협동 공격 — 최대HP의 10% 추가 피해 (기존 combo_attack 로직 이식)
        const bonusDmg = Math.round(target.maxHp * 0.10);
        target.hp = Math.max(0, target.hp - bonusDmg);
        bonusNote = ` + 협동 추가피해 ${bonusDmg}`;
        lc.log.unshift(`🤝 ${player.name}과(와) 동료의 협동 공격!`);
      } else if(action === 'weakpoint'){
        // 약점 부위 타격 — 최대HP의 12% 추가 피해 (기존 weakpoint_hit 로직 이식)
        const bonusDmg = Math.round(target.maxHp * 0.12);
        target.hp = Math.max(0, target.hp - bonusDmg);
        bonusNote = ` + 약점 추가피해 ${bonusDmg}`;
        lc.log.unshift(`🎯 ${target.name}의 약점을 정확히 노렸다!`);
      }
      const logLine = `⚔️ ${player.name} → ${target.name}: ${dmg} 피해${r.crit?' (치명타!)':''}${elemNote}${bonusNote}`;
      lc.log.unshift(logLine);

      // ── 로컬(AI 미사용) 서술: 지능×무기 조합 배너에서 문장을 조합한다.
      //    캐시/API 호출이 전혀 없으므로 항상 즉시, 항상 동작한다. ──
      try{
        const narration = composeLocalAttackLine(lc, player, target, dmg, !!r.crit);
        if(narration) lc.log.unshift(`📖 ${narration}`);
      }catch(e){}
    }
  } else if(action === 'defend'){
    player._defending = true;
    lc.log.unshift(`🛡️ ${player.name}이(가) 방어 태세를 취했다.`);
    try{
      const narration = composeDefendLine(player);
      if(narration) lc.log.unshift(`📖 ${narration}`);
    }catch(e){}
  }

  // ── 살아있는 아군(동료)도 자동으로 한 번씩 공격 (1단계에서는 단순 자동 공격만) ──
  lc.allies.filter(u=>!u.isPlayer && u.hp>0 && !u._outOfBattle).forEach(ally=>{
    const target = pickTarget(lc.enemies);
    if(target){
      const r = unitAttack(ally, target);
      lc.log.unshift(`⚔️ ${ally.name} → ${target.name}: ${r.dmg} 피해${r.crit?' (치명타!)':''}`);
      try{
        const narration = composeLocalAttackLine(lc, ally, target, r.dmg, !!r.crit);
        if(narration) lc.log.unshift(`📖 ${narration}`);
      }catch(e){}
    }
  });

  // ── 몬스터 사망 판정 — 보스 25% / 네임드 40% / 잡몹 60% 사망, 나머지는
  //    부상으로 hp를 1 유지. 전멸 체크보다 반드시 먼저 실행해야 한다 —
  //    그렇지 않으면 HP 0 도달만으로 확률 없이 곧장 사망 처리되어버린다. ──
  lc.enemies.filter(e=>e.hp<=0 && !e._incapProcessed).forEach(e=>{
    e._incapProcessed = true;
    const deathChance = e.isBoss ? 0.25 : (e.isNamed ? 0.40 : 0.60);
    if(Math.random() < deathChance){
      lc.log.unshift(`💀 ${e.name}이(가) 쓰러졌다.`);
    } else {
      e.hp = 1; // 부상으로 간신히 버티지만 사실상 전투 불능
      lc.log.unshift(`🩸 ${e.name}이(가) 치명상을 입었지만 아직 숨이 붙어있다.`);
    }
    // ── [신규] 종족/속성 기반 부활 판정 — AI 서사 전투와 동일한 규칙을
    //    로컬 전투에도 그대로 적용한다. ──
    if(!e._hasRevived && typeof getMonsterRevivalChance==='function'){
      const chance = getMonsterRevivalChance(e);
      if(chance > 0 && Math.random() < chance){
        e._hasRevived = true;
        e.hp = Math.max(1, Math.round(e.maxHp * (0.3 + Math.random()*0.2)));
        e.atk = Math.round(e.atk * 0.8);
        e._incapProcessed = false; // 다시 살아났으니 재판정 가능하도록 초기화
        lc.log.unshift(`🌑 ${e.name}이(가) 다시 일어섰다!`);
      }
    }
  });

  // ── [신규] 증원 투입 — 무리가 8마리 슬롯을 넘었을 때 대기열에 쌓아둔
  //    나머지 개체를, 죽은 자리가 생길 때마다 하나씩 전장에 투입한다.
  //    이렇게 하면 "고블린 15마리 무리"도 압축 없이 결국 전부 개별
  //    유닛으로 등장하되, 화면과 계산은 항상 최대 8마리로 유지된다. ──
  if(lc.enemyReinforcements && lc.enemyReinforcements.length){
    const deadSlotIdx = lc.enemies.findIndex(e=>e.hp<=0 && !e._outOfBattle);
    if(deadSlotIdx >= 0){
      const next = lc.enemyReinforcements.shift();
      lc.enemies[deadSlotIdx] = next;
      lc.log.unshift(`⚠️ ${next.name}이(가) 새로 합류했다!`);
    }
  }

  // ── 전멸 체크(적) ──
  if(lc.enemies.every(e=>e.hp<=0) && (!lc.enemyReinforcements || !lc.enemyReinforcements.length)){
    finishLocalCombat(lc, true);
    return;
  }

  // ── 적 턴: 살아있는 적 전원이 살아있는 아군 중 하나를 공격 ──
  lc.enemies.filter(e=>e.hp>0).forEach(en=>{
    const aliveAllies = lc.allies.filter(u=>u.hp>0 && !u._outOfBattle);
    if(!aliveAllies.length) return;
    const target = aliveAllies[Math.floor(Math.random()*aliveAllies.length)];
    let r = unitAttack(en, target);
    if(target._defending){
      // 방어 중이면 피해 50% 감소(이미 적용된 hp 차감을 절반만 반영하도록 보정)
      const healBack = Math.round(r.dmg*0.5);
      target.hp = Math.min(target.maxHp, target.hp + healBack);
      r = { ...r, dmg: r.dmg - healBack };
    }
    lc.log.unshift(`${en.name} → ${target.name}: ${r.dmg} 피해${target.isPlayer?'':''}`);
    try{
      const narration = composeLocalAttackLine(lc, en, target, r.dmg, !!r.crit);
      if(narration) lc.log.unshift(`📖 ${narration}`);
    }catch(e){}
  });
  lc.allies.forEach(u=>{ u._defending = false; });

  // ── 동료·소환수(비-플레이어 아군) 전투불능/사망 판정 ──
  //    동료: 부상 70%/사망 30%, 재피격 시 사망 확률 2배, 불사의 온기 개입.
  //    소환수: 부상 50%/소멸 50%, 재피격 시 소멸 확률 90%.
  //    기존 GS 기반(party_incap/summon_incap) 확률 체계를 그대로 이식.
  //    플레이어는 게임오버 로직이 별도로 처리하므로 제외. ──
  processAllyIncapJudgment(lc);

  syncPlayerHpToGlobalStats(player);

  // ── 전멸 체크(아군) ──
  if(lc.allies.every(u=>u.hp<=0 || u._outOfBattle) || player.hp<=0){
    finishLocalCombat(lc, false);
    return;
  }

  checkTerrainOpportunity(lc);
  lc.log = lc.log.slice(0, 40);
  saveLocalCombat(lc);
  renderLocalCombatPanel();

  } finally {
    window._localCombatTurnBusy = false;
  }
}
window.processLocalCombatTurn = processLocalCombatTurn;

// ── 동료 전투불능/사망 판정 — 기존 GS 기반 party_incap 로직을 그대로 이식.
//    동료 30% 사망 / 70% 부상이탈, 이미 부상 이력이 있으면 사망 확률 2배,
//    "불사의 온기" 칭호 보유 시 25% 확률로 사망 판정을 무효화한다. ──
// ── [리팩터] 동료·소환수 전투불능 판정을 별도 함수로 뽑아내 재사용한다.
//    이전에는 이 판정이 attack 계열 액션에만 인라인으로 있어서, skill과
//    terrain 액션에서는 적의 반격으로 동료가 죽어도 판정이 전혀 실행되지
//    않는 버그가 있었다 — 별도 함수로 통일해 모든 액션에서 빠짐없이
//    호출되도록 한다. ──
function processAllyIncapJudgment(lc){
  lc.allies.filter(u=>!u.isPlayer && u.hp<=0 && !u._incapProcessed).forEach(u=>{
    u._incapProcessed = true;
    u._outOfBattle = true; // 부상이든 사망이든 이 전투에서는 더 이상 행동 불가
    if(u.isSummon) resolveSummonIncap(lc, u);
    else resolveCompanionIncap(lc, u);
  });
}
window.processAllyIncapJudgment = processAllyIncapJudgment;

function resolveCompanionIncap(lc, unit){
  try{
    const party = (typeof loadParty==='function' ? loadParty() : []);
    const member = party.find(m=>m.name===unit.name);
    if(!member){
      // 파티 데이터를 못 찾아도 로컬 전투 표시는 유지 — 그냥 쓰러진 것으로만 처리
      lc.log.unshift(`🩹 ${unit.name}이(가) 쓰러졌다.`);
      return;
    }

    const alreadyIncap = !!member.incapUntilTurn;
    const baseDeathChance = 0.30;
    let deathChance = alreadyIncap ? Math.min(0.80, baseDeathChance*2) : baseDeathChance;

    let undyingWarmthTriggered = false;
    if(typeof loadTitles==='function'){
      const ownedTitleIds = loadTitles().map(t=>t.id);
      if(ownedTitleIds.includes('healer_undying_warmth') && Math.random() < 0.25){
        deathChance = 0;
        undyingWarmthTriggered = true;
      }
    }

    if(Math.random() < deathChance){
      // 사망 처리
      member.alive = false;
      member.hp = 0;
      lc.log.unshift(`💀 ${member.name}이(가) 전투 중 사망했다.`);
      toast(`💀 ${member.name} 전투 중 사망!`, 4000);
      try{
        const npcs = typeof loadNPCs==='function' ? loadNPCs() : [];
        const npc = npcs.find(n=>n.name===member.name);
        if(npc){
          npc.status='dead'; npc.hp=0;
          const gr = typeof loadGrief==='function' ? loadGrief() : {lostOnes:[],total:0};
          gr.lostOnes = gr.lostOnes||[]; gr.total=(gr.total||0)+1;
          if(!gr.lostOnes.find(x=>x.name===npc.name)) gr.lostOnes.push({name:npc.name, turn:S.msgCount||0});
          if(typeof saveGrief==='function') saveGrief(gr);
          if(typeof saveNPCs==='function') saveNPCs(npcs);
        }
      }catch(e){}
      const idx = party.indexOf(member);
      if(idx>=0) party.splice(idx,1);
    } else {
      // 부상 이탈 — 최소 HP로 유지, 일정 턴 후 회복 가능하도록 표시만 해둔다.
      member.alive = false;
      member.incapReason = '전투 부상';
      member.incapUntilTurn = (S.msgCount||0) + 2;
      member.hp = Math.max(1, Math.round((member.maxHp||100)*0.05));
      unit.hp = member.hp; // 로컬 전투 UI에도 "완전히 0" 대신 최소 HP로 표시
      if(undyingWarmthTriggered){
        lc.log.unshift(`🕯️ 불사의 온기가 ${member.name}을(를) 지켜냈다!`);
        toast(`🕯️ 불사의 온기가 ${member.name}을(를) 지켜냈다!`, 4500);
      } else {
        lc.log.unshift(`🩹 ${member.name}이(가) 부상으로 전투불능이 되었다.`);
        toast(`🩹 ${member.name} 부상 이탈`, 3000);
      }
    }
    if(typeof saveParty==='function') saveParty(party);
  }catch(e){ console.warn('[resolveCompanionIncap]', e); }
}

// ── 소환수 전투불능/소멸 판정 — 기존 summon_incap 로직 이식.
//    소환수 50% 소멸 / 50% 부상이탈, 재피격 시 소멸 확률 90%. ──
function resolveSummonIncap(lc, unit){
  try{
    const summons = (typeof window.loadSummons==='function' ? window.loadSummons() : []);
    // [버그 수정] 이름만으로 매칭하면 같은 이름의 소환수가 여러 마리일 때
    // 엉뚱한 개체가 판정될 수 있다 — id가 있으면(스킬로 소환된 경우) id를
    // 우선 사용하고, 없으면(레거시 호환) 이름으로 폴백한다.
    const s = (unit.id && summons.find(x=>x.id===unit.id)) || summons.find(x=>(x.customName||x.name)===unit.name);
    if(!s){
      lc.log.unshift(`⚡ ${unit.name}이(가) 쓰러졌다.`);
      return;
    }
    const alreadyIncap = !!s.incapUntilTurn;
    const deathChance = alreadyIncap ? 0.90 : 0.50;
    if(Math.random() < deathChance){
      s.status = 'dead'; s.alive = false;
      lc.log.unshift(`💀 ${s.name}이(가) 소멸했다.`);
      toast(`💀 ${s.name} 소환수 소멸`, 3000);
    } else {
      s.alive = false;
      s.incapUntilTurn = (S.msgCount||0) + 3;
      s.hp = Math.max(1, Math.round((s.maxHp||100)*0.1));
      unit.hp = s.hp;
      lc.log.unshift(`⚡ ${s.name}이(가) 부상으로 전투불능이 되었다.`);
      toast(`⚡ ${s.name} 소환수 부상 이탈`, 3000);
    }
    if(typeof window.saveSummons==='function') window.saveSummons(summons);
  }catch(e){ console.warn('[resolveSummonIncap]', e); }
}

function syncPlayerHpToGlobalStats(player){
  try{
    if(S?.stats) S.stats.hp = player.hp;
    if(typeof window.updateHeader==='function') window.updateHeader();
  }catch(e){}
}

// ── 전투 종료 처리: victory=true(승리)/false(패배)/null(도주 성공, 무승부) ──
// ── 부상당한(치명상, hp=1로 간신히 생존) 적을 포로로 잡는다. 기존
//    enemy_captured/addPrisoner 로직을 그대로 재사용한다. ──
function capturePrisoner(enemyId){
  const lc = loadLocalCombat();
  if(!lc || !lc.active) return;
  const enemy = lc.enemies.find(e=>e.id===enemyId);
  if(!enemy || enemy.hp<=0 || !enemy._incapProcessed){
    toast('치명상을 입어 저항할 수 없는 적만 포로로 잡을 수 있습니다.');
    return;
  }
  if(typeof addPrisoner==='function'){
    addPrisoner(enemy.name, { icon:'⚔️', role:enemy.name, faction:'적', desc:'전투 중 포로로 잡힘' });
    toast(`⛓️ ${enemy.name}을(를) 포로로 잡았다.`, 3000);
    if(typeof recordTimeEcho==='function') recordTimeEcho('mercy', enemy.name+'을(를) 살려줌', S.scenario?.id);
    if(typeof recordFateChoice==='function') recordFateChoice('capture_'+enemy.name, enemy.name+'을(를) 포로로 잡음', 'good', S.scenario?.id);
  }
  // 포로가 된 적은 전투에서 완전히 제외(더 이상 공격 대상도, 공격도 하지 않음)
  enemy.hp = 0;
  enemy._captured = true;
  lc.log.unshift(`⛓️ ${enemy.name}을(를) 포로로 붙잡았다.`);

  try{
    const monsters = (typeof loadMonsters==='function' ? loadMonsters() : []);
    const m = monsters.find(x=>x.id===enemy.id);
    if(m){ m.status = 'captured'; if(typeof saveMonsters==='function') saveMonsters(monsters); }
  }catch(e){}

  if(lc.enemies.every(e=>e.hp<=0)){
    finishLocalCombat(lc, true);
    return;
  }
  saveLocalCombat(lc);
  renderLocalCombatPanel();
}
window.capturePrisoner = capturePrisoner;

function finishLocalCombat(lc, victory){
  lc.active = false;

  // 몬스터 데이터에도 결과 반영 — 승리 시 status를 dead로,
  // 패배/도주 시엔 그대로 살려둬 다음에 다시 마주칠 수 있게 한다.
  // [버그 수정 — 심각] 몬스터 "무리"(count>1, 예: "도적단×3")는 로컬 전투
  // 시작 시 개별 유닛(id: `${원본id}_1`, `${원본id}_2`, ...)으로 펼쳐지는데,
  // 여기서는 그 펼쳐진 유닛 id로만 원본 몬스터 레코드를 찾고 있었다 —
  // 무리 몬스터는 원본 레코드의 id가 접미사 없는 그대로라 절대 매치가 안
  // 되고, 그 결과 전투에서 무리를 완전히 전멸시켜도 원본 몬스터 레코드는
  // 영원히 status:'alive'·풀피로 남아있었다. 그러면 다음 sendMsg마다
  // "아직 안 끝난 로컬 전투 몬스터가 있다"는 survivors 가드(quest/086)가
  // 매번 같은 무리를 처음부터(풀피로) 다시 소환해, 사실상 절대 못
  // 벗어나는 무한 전투 루프가 됐다 — 채팅이 영원히 멈춰 보이는, 이번
  // 세션에서 찾은 것 중 가장 심각한 버그였다. 펼쳐진 유닛에 저장해둔
  // baseName(원본 몬스터의 name)으로 묶어서 원본 레코드를 찾는다.
  try{
    const monsters = (typeof loadMonsters==='function' ? loadMonsters() : []);
    const enemyGroups = {};
    lc.enemies.forEach(e=>{
      const key = e.baseName || e.name;
      (enemyGroups[key] ||= []).push(e);
    });
    Object.entries(enemyGroups).forEach(([baseName, units])=>{
      let m = monsters.find(x=>x.id===units[0].id); // 무리가 아닌 단일 개체
      if(!m) m = monsters.find(x=>x.name===baseName && x._localCombatEngaged); // 무리 — baseName으로 원본 매치
      if(!m) return;
      m.hp = units.reduce((s,u)=>s+Math.max(0,u.hp), 0);
      if(victory===true && units.every(u=>u.hp<=0)) m.status = 'dead';
    });
    if(typeof saveMonsters==='function') saveMonsters(monsters);
    if(typeof renderMonsters==='function') renderMonsters();
  }catch(e){}

  // [버그 수정] 전투 중 스킬로 소환된 소환수의 최종 HP/생존 여부를
  // 전역 loadSummons() 기록에도 반영한다 — 안 그러면 전투 중 소환수가
  // 피해를 입거나 소멸해도 전역 기록은 항상 풀피/active로 남는다.
  // [22-1, AI 의존 전수 스캔 이어서 발견한 2차 버그] 위 의도는 맞았지만
  // 매칭 키가 어긋나 있었다 — initLocalCombat이 전투 유닛을 만들 때
  // `id:'summon_'+s.name`(파생 id)을 쓰는데, 여기서는 그 파생 id를
  // 소환수 원본 레코드의 진짜 id(`summon_${skillId}_${Date.now()}_${i}`
  // 형태, ai-prompt/148의 GS summon_add 경로도 별도 id 체계)와 비교하고
  // 있었다 — 절대 일치할 수 없는 키라 이 동기화 자체가 항상 조용히
  // no-op였다(전투 로그엔 "-N 피해"가 실제로 찍히는데, 전투가 끝나면
  // 그 피해가 통째로 사라지는 것까지 Playwright로 실측 확인). 유닛
  // 생성 때와 대칭되게, id 대신 이름(`customName||name`)으로 맞춘다.
  try{
    const summonUnits = lc.allies.filter(u=>u.isSummon);
    if(summonUnits.length){
      const summons = (typeof window.loadSummons==='function' ? window.loadSummons() : []);
      summonUnits.forEach(u=>{
        const s = summons.find(x=>(x.customName||x.name)===u.name);
        if(!s) return;
        s.hp = u.hp;
        if(u.hp<=0 && !u._outOfBattle) s.status = 'dead'; // resolveSummonIncap이 이미 처리했으면 건드리지 않음
      });
      if(typeof window.saveSummons==='function') window.saveSummons(summons);
    }
  }catch(e){}

  const enemyNames = lc.enemies.map(e=>e.name).join(', ');
  const droppedItems = [];
  let summaryText = '';

  if(victory===true){
    toast(`🏆 전투 승리!`, 3000);
    if(typeof gainEvoEnergy==='function') gainEvoEnergy(12, '전투 승리');
    // [F2 FIX] gainDeathEcho(다크링 "죽음의 메아리")가 detectDeathEchoFromText
    // (AI 서사 감지) 한 곳에서만 호출되고, 실제 승패를 결정하는 이 로컬 전투
    // 엔진(경험치·루팅·진화 에너지는 이미 여기서 지급)에는 연결이 없었다 —
    // 같은 함수를 다크링 승리 시 직접 호출(함수 자체가 종족 체크를 한 번 더
    // 하므로 이중 안전).
    if(typeof gainDeathEcho==='function'){
      const _race328 = (S.character?.race||'');
      if(_race328.includes('다크링') || _race328.includes('darkling')){
        gainDeathEcho(lc.enemies[0]?.name || enemyNames || null, null);
      }
    }
    // [버그 수정] 몬스터가 보스든 잡몹 무리든 상관없이 항상 'common'(최하급)
    // 경험치로 고정되어 있었다 — 전멸시킨 적 중 가장 강한 개체(보스>네임드>
    // 일반) 기준으로 등급을 정해 경험치를 산정한다.
    const rarityForExp = lc.enemies.some(e=>e.isBoss) ? 'boss'
      : lc.enemies.some(e=>e.isNamed) ? 'rare' : 'common';
    if(typeof gainExpFromKill==='function') gainExpFromKill(rarityForExp);
    // 드롭 처리는 기존 rollLoot 재사용 (있으면)
    // [버그 수정] 몬스터 실제 강도와 무관하게 항상 고정값(5)을 써서
    // autoDropLootOnDeath에 이미 적용했던 tier/level 반영이 승리 처리
    // 경로에는 빠져 있었다 — 동일한 기준으로 맞춘다.
    try{
      if(typeof rollLoot==='function'){
        const lootLevel = lc.enemies.reduce((max,e)=>Math.max(max, e.level||e.tier||1), 1);
        const isBossFight = lc.enemies.some(e=>e.isBoss);
        const drops = rollLoot(lootLevel, isBossFight);
        drops.forEach(item=>{
          const inv = typeof loadInventory==='function' ? loadInventory() : (S.inventory||[]);
          inv.push(item);
          if(typeof saveInventory==='function') saveInventory(inv);
          S.inventory = inv;
          droppedItems.push(item.name);
          toastHTML(`🎁 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon||"")} ${esc(item.name)} 획득`, 2500);
        });
      }
    }catch(e){}
    summaryText = `⚔️ ${enemyNames}과(와)의 전투에서 승리했다.` + (droppedItems.length ? ` (획득: ${droppedItems.join(', ')})` : '');
  } else if(victory===false){
    toast(`💀 전투에서 패배했다...`, 3500);
    summaryText = `💀 ${enemyNames}과(와)의 전투에서 패배해 후퇴했다.`;
  } else {
    toast(`💨 전장에서 벗어났다.`, 2500);
    summaryText = `💨 ${enemyNames}과(와) 마주쳤으나 전장에서 벗어났다.`;
  }

  // ── 서사 저장 (1) 일지에 전투 결과 기록 — 나중에 캐릭터 일지에서 확인 가능 ──
  try{
    if(typeof saveDiaryEntry==='function') saveDiaryEntry('combat', summaryText);
  }catch(e){}

  // ── 서사 저장 (2) 채팅 히스토리에 시스템 메시지로 남겨 대화창 스크롤에서도
  //    보이고, saveChatHistory()를 통해 그대로 영구 저장된다. ──
  try{
    const sysMsg = { role:'assistant', content:`*(${summaryText})*`, isSystemNote:true, turn:S.msgCount||0 };
    if(Array.isArray(S.messages)) S.messages.push(sysMsg);
    if(Array.isArray(S.fullMessages)) S.fullMessages.push(sysMsg);
    if(typeof saveChatHistory==='function') saveChatHistory(true);
    if(typeof renderMsgs==='function') renderMsgs();
  }catch(e){}

  // ── AI가 다음 응답을 쓸 때 이 전투 결과를 알고 자연스럽게 이어가도록
  //    컨텍스트로 주입한다 — 로컬 전투가 "AI가 모르는 사이 일어난 일"이
  //    되지 않게 한다. ──
  try{
    S._nextInjectedContext = (S._nextInjectedContext||'') + `\n[⚔️ 직전 전투 결과] ${summaryText} 이 결과를 자연스럽게 이어받아 서사를 진행하라.`;
  }catch(e){}

  saveLocalCombat(lc);
  renderLocalCombatPanel();

  // [20차 감사 FIX] 로컬 전투 패배는 player.hp를 0으로 만들 수 있지만,
  // 사망 판정(triggerLoopIfDead)은 지금까지 sendMsg 파이프라인 안에서만
  // 호출됐다 — 로컬 전투는 그 파이프라인 밖(버튼 클릭)에서 즉시 실행되므로,
  // 패배 직후 곧바로 사망 처리되지 않고 플레이어가 다음 채팅 메시지를 보낼
  // 때까지(그 사이엔 HP 0 상태로도 정상 플레이가 가능해 보이는) 최소 한 턴
  // 지연된 채 방치되는 순서 오류가 있었다. 여기서 즉시 판정해 다른 사망
  // 경로와 동일한 타이밍을 보장한다.
  if((S?.stats?.hp||0) <= 0 && typeof window.triggerLoopIfDead === 'function') window.triggerLoopIfDead();
}
window.finishLocalCombat = finishLocalCombat;

// ── 전투 패널 렌더링 ──
// ── 현재 대상(첫 번째 생존 적)에게 알려진 약점/저항이 있으면 속성 공격
//    버튼을 보여준다. 정보가 없으면 아무것도 표시하지 않아 UI가 불필요하게
//    복잡해지지 않게 한다. 협동/약점 공격 옵션도 함께 노출한다. ──
// ── 지형 필살 기회가 열려있으면 눈에 띄는 강조 배너+버튼을 별도로 보여준다.
//    다른 상시 버튼(속성/협동/약점)과 시각적으로 분리해 "특별한 순간"임을
//    강조한다. ──
function renderTerrainOpportunityBanner(lc){
  if(!lc.terrainOpportunity || !lc.terrainId) return '';
  const def = (typeof TERRAIN_EFFECTS_BATTLE!=='undefined') ? TERRAIN_EFFECTS_BATTLE[lc.terrainId] : null;
  if(!def || !def.finisher) return '';
  return `<div style="padding:8px;margin-bottom:8px;background:linear-gradient(135deg,#1a1400,#2a2000);border:1px solid #c8a030;border-radius:3px;animation:pulse 1.5s ease-in-out infinite">
    <div style="font-size:8.5px;color:#e0c060;margin-bottom:4px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:16}):(def.icon)} 지금이 기회다! 「${esc(def.finisher.label)}」</div>
    <div style="font-size:7.5px;color:var(--dim);margin-bottom:6px">${esc(def.finisher.desc)}<br><span style="color:#c07050">⚠️ ${esc(def.finisher.riskNote)}</span></div>
    <button onclick="processLocalCombatTurn('terrain')" style="width:100%;padding:7px;background:#2a1a00;border:1px solid #c8a030;color:#e0c060;font-family:'Cinzel',serif;font-size:9px;cursor:pointer">${def.icon} 「${esc(def.finisher.label)}」 시도 (성공률 60%)</button>
  </div>`;
}

// ── 로컬 전투용 스킬 버튼 목록 — 해금된 스킬 중 표준 effects 스키마를
//    가진 액티브 스킬만 사용 가능하다(스키마 없는 스킬은 로컬 계산이
//    불가능하므로 제외). MP가 부족하면 버튼을 비활성화한다. ──
function renderSkillButtons(lc){
  try{
    const unlocked = typeof loadSkills==='function' ? loadSkills() : {};
    const allDefs = typeof getAllSkillDefs==='function' ? getAllSkillDefs() : [];
    const usable = allDefs.filter(s => unlocked[s.id] && s.type==='active' && s.effects && s.effects.kind);
    if(!usable.length) return '';

    const curMp = S?.stats?.mp;
    const rows = usable.map(s=>{
      const cost = s.mpCost||0;
      const canAfford = curMp===undefined || curMp>=cost;
      return `<button ${canAfford?'':'disabled'} onclick="processLocalCombatTurn('skill', null, null, '${s.id}')" style="padding:5px 8px;font-size:8px;background:${canAfford?'#150a1a':'#0a0a0a'};border:1px solid ${canAfford?'#5a3a6a':'#333'};color:${canAfford?'#c090e0':'#555'};cursor:${canAfford?'pointer':'not-allowed'}">${s.icon||'✨'} ${esc(s.name)} (${cost}MP)</button>`;
    }).join('');
    return `<div style="font-size:7.5px;color:var(--dim);margin:6px 0 4px">📖 사용 가능한 스킬</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">${rows}</div>`;
  }catch(e){ return ''; }
}

function renderElementAttackOptions(lc){
  const target = lc.enemies.find(e=>e.hp>0 && !e._captured);
  if(!target) return '';
  const elemLabel = (id)=> (typeof ELEMENT_DEFS!=='undefined' && ELEMENT_DEFS[id]) ? ELEMENT_DEFS[id].name : id;
  let html = '';

  if(target.weakElement || target.resistElement){
    html += `<div style="font-size:7.5px;color:var(--dim);margin-bottom:4px">🔮 ${esc(target.name)}의 알려진 성질:`;
    if(target.weakElement) html += ` 약점-${elemLabel(target.weakElement)}`;
    if(target.resistElement) html += ` 저항-${elemLabel(target.resistElement)}`;
    html += `</div>`;
  }

  const hasLivingAlly = lc.allies.some(u=>!u.isPlayer && u.hp>0 && !u._outOfBattle);
  html += `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">`;
  if(target.weakElement){
    html += `<button onclick="processLocalCombatTurn('attack', '${target.id}', '${target.weakElement}')" style="padding:5px 8px;font-size:8px;background:#0a1a05;border:1px solid #2a6a2a;color:#80e080;cursor:pointer">✨ ${elemLabel(target.weakElement)} 속성 공격 (약점 2배)</button>`;
  }
  if(hasLivingAlly){
    html += `<button onclick="processLocalCombatTurn('combo', '${target.id}')" style="padding:5px 8px;font-size:8px;background:#0a0a1a;border:1px solid #2a2a6a;color:#8080e0;cursor:pointer">🤝 협동 공격 (+10% 추가피해)</button>`;
  }
  html += `<button onclick="processLocalCombatTurn('weakpoint', '${target.id}')" style="padding:5px 8px;font-size:8px;background:#1a1005;border:1px solid #6a5a2a;color:#e0c080;cursor:pointer">🎯 약점 노리기 (+12% 추가피해)</button>`;
  html += `</div>`;
  return html;
}

function renderLocalCombatPanel(){
  const body = document.getElementById('pb-local-combat');
  if(!body) return;
  const lc = loadLocalCombat();

  if(!lc){
    body.innerHTML = `<div style="padding:20px;text-align:center;color:var(--dim);font-size:11px">진행 중인 전투가 없습니다.</div>`;
    return;
  }

  function unitBar(u){
    const pct = Math.max(0, Math.round((u.hp/u.maxHp)*100));
    const barColor = u.side==='enemy' ? '#c04040' : (u.isPlayer ? '#c0a030' : (u.isSummon ? '#9060d0' : '#4a9a6a'));
    const isDown = u.hp<=0 || u._outOfBattle;
    const statusIcon = u._outOfBattle ? (u.hp<=0?'💀 ':'🩹 ') : (u.hp<=0?'💀 ':'');
    const roleTag = u.isSummon ? '✨' : '';
    // [정리] 무리 압축 표현이 제거되어(개별 유닛화) 마리 수 역산 표시가
    // 더 이상 필요 없다 — 화면에 보이는 유닛 하나하나가 이미 실제 개체다.
    // 치명상(hp=1)을 입고 아직 죽지 않은 적은 포로로 잡을 수 있다.
    const canCapture = u.side==='enemy' && u.hp>0 && u.hp<=1 && u._incapProcessed;
    const captureBtn = canCapture
      ? `<button onclick="event.stopPropagation();capturePrisoner('${u.id}')" style="margin-top:2px;padding:2px 6px;font-size:7px;background:#1a1005;border:1px solid #6a5a2a;color:#e0c080;cursor:pointer">⛓️ 포로로 잡기</button>`
      : '';
    return `<div style="margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;font-size:8.5px;color:${isDown?'#555':'var(--text)'}">
        <span>${statusIcon}${roleTag}${esc(u.name)}</span><span>${u.hp}/${u.maxHp}</span>
      </div>
      <div style="height:6px;background:#1a0a0a;border-radius:3px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:${isDown?'#333':barColor};transition:width .3s"></div>
      </div>
      ${captureBtn}
    </div>`;
  }

  body.innerHTML = `
    <div style="padding:12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#c04040;letter-spacing:1px;margin-bottom:5px">── 적 ──</div>
      ${lc.enemies.map(unitBar).join('')}
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#4a9a6a;letter-spacing:1px;margin:10px 0 5px">── 아군 ──</div>
      ${lc.allies.map(unitBar).join('')}
      ${lc.active ? `
      ${renderTerrainOpportunityBanner(lc)}
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin:12px 0 10px">
        <button onclick="processLocalCombatTurn('attack')" style="padding:9px 4px;background:#1a0a00;border:1px solid #a04020;color:#e08050;font-family:'Cinzel',serif;font-size:9.5px;cursor:pointer">⚔️ 공격</button>
        <button onclick="processLocalCombatTurn('defend')" style="padding:9px 4px;background:#0a0a1a;border:1px solid #204080;color:#5090e0;font-family:'Cinzel',serif;font-size:9.5px;cursor:pointer">🛡️ 방어</button>
        <button onclick="processLocalCombatTurn('flee')" style="padding:9px 4px;background:#0a0a0a;border:1px solid #3a3a3a;color:#999;font-family:'Cinzel',serif;font-size:9.5px;cursor:pointer">💨 도주</button>
      </div>
      ${renderElementAttackOptions(lc)}
      ${renderSkillButtons(lc)}` : `<div style="text-align:center;font-size:10px;color:var(--dim);margin:12px 0">전투가 종료되었습니다.</div>`}
      <div style="font-family:'Cinzel',serif;font-size:8px;color:var(--dim);letter-spacing:1px;margin-bottom:4px">── 전투 로그 ──</div>
      <div style="max-height:160px;overflow-y:auto">
        ${lc.log.slice(0,20).map(l=>`<div style="font-size:8.5px;color:var(--dim);padding:2px 0;border-bottom:1px solid #1a1005">${esc(l)}</div>`).join('')}
      </div>
    </div>`;
}
window.renderLocalCombatPanel = renderLocalCombatPanel;

// ── 전투 패널 DOM 마크업 삽입 ──
(function injectLocalCombatPanelMarkup(){
  function doInject(){
    if(document.getElementById('p-local-combat')) return;
    const div = document.createElement('div');
    div.className = 'panel-ov';
    div.id = 'p-local-combat';
    div.innerHTML = `<div class="panel">
      <div class="p-hdr" style="background:linear-gradient(135deg,#1a0000,#2a0a0a);border-bottom:1px solid #a04040">
        <span class="p-title" style="color:#e08080">⚔️ 전투</span>
        <button class="p-close" onclick="closeLocalCombatPanel()">✕</button>
      </div>
      <div class="p-body scrollable" id="pb-local-combat"></div>
    </div>`;
    document.body.appendChild(div);
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', doInject);
  } else {
    doInject();
  }
})();

// 패널을 닫을 때: 전투가 진행 중이면 그냥 닫지 않고 확인 없이 백그라운드로
// 유지한다(다음에 다시 열면 이어서 진행 가능) — 레이드처럼 좀비 상태가
// 되지 않도록, active 상태는 그대로 두고 패널만 숨긴다.
function closeLocalCombatPanel(){
  closeP('local-combat');
}
window.closeLocalCombatPanel = closeLocalCombatPanel;

// [버그 수정] 이 자리에 있던 hookEncounterForDelayedCombat(몬스터 조우
// 직후 다음 턴 자동 전투 예약)는 window.checkRandomEncounter를 감싸는
// 방식이었다. checkRandomEncounter는 quest/086에 로컬 선언돼 있고 그
// 파일의 실제 호출도 bare 식별자라 이 감싸기가 절대 적용되지 못했다
// (다른 죽은 훅들과 동일한 원인). 같은 로직을 quest/086의 실제 호출
// 지점(checkRandomEncounter(userMsg) 바로 옆)에 네이티브로 옮겼다.

// ── 매 턴(메시지 처리 후) 훅: 예약된 전투가 있으면 이번에 실제로 연다 ──
(function hookTurnForPendingCombat(){
  let lastCount = -1;
  setInterval(()=>{
    try{
      if(typeof S==='undefined') return;
      if(S.msgCount === lastCount) return;
      lastCount = S.msgCount;
      if(S._pendingLocalCombat){
        S._pendingLocalCombat = false;
        const combat = initLocalCombat();
        if(combat){
          window.openP('local-combat');
          renderLocalCombatPanel();
        }
      }
    }catch(e){}
  }, 1500);
})();

console.log('[TaleForge] 로컬 전투 엔진 v1(기본 공방) 로드 완료 ✓');

})();
}

