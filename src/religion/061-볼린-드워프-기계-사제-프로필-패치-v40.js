// 볼린 — 드워프 기계 사제 프로필 [패치 v40]
// Auto-extracted from taleforge.html (original section banner preserved above).
import { AIDEN_PROFILE, ARCANUS_LOOP_PROFILE, ASMODEUS_PROFILE, BEELZEBUB_PROFILE, CABAL_OFFICERS, GABRIEL_PROFILE, INFERNAL_FACTIONS, LEONARD_PROFILE, MALAKAR_PROFILE, MICHAEL_PROFILE, MYTH_ORIGIN_REVELATION, PRIMORDIAL_CHAOS, SILARIEL_PROFILE, SILVER_PROFILE, WATCHER_IDENTITY, WORLD_LORE, WORLD_WILL_MANIFESTATION } from '../data/055-5대륙-왕국-시스템.js';
import { AMENHOTEP_PROFILE } from '../data/056-아멘호테프-남대륙-태양-신관-대신관-프로필-패치-v40.js';
import { TALIS_PROFILE } from '../data/057-탈리스-동대륙-용골-연구소장-프로필-패치-v40.js';
import { CRYSTALLIA_PROFILE } from '../data/058-크리스탈리아-북대륙-룬-마법사-프로필-패치-v40.js';
import { BALTAZAR_PROFILE } from '../data/059-발타자르-해적왕-프로필-패치-v40.js';
import { MARINELA_PROFILE } from '../data/060-마리넬라-폭풍-마법사-프로필-패치-v40.js';
import { CONTINENT_FACTION_MAP, CONTINENT_RELATIONS, ENDING_SCENES, NPC_CHAPTER_STATE, RACE_STORY_RULES, VOLIN_PROFILE } from '../data/061-볼린-드워프-기계-사제-프로필-패치-v40.js';
import { BLOOD_CLASSES } from '../data/020-101130번-환생-누적-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadMainQuestState, loadWorldEvents } from '../job/042-직업-시스템-무한-파생-도감.js';
import { loadNPCs } from '../misc/001-block0-preamble.js';
import { loadWorldTreeLevel } from '../misc/016-2130번-시스템.js';
import { isAidenInParty } from '../npc/305-⑤-NPC-비밀-아젠다-이중성-시스템.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { VAMPIRE_CHRONICLE_STAGES, loadVampireChronicle } from '../progression/020-101130번-환생-누적-시스템.js';
import { loadSealRestore } from '../ui/155-⑭-메모리-패널-UI.js';
import { THRALL_LORD_STAGES, loadThrallData } from '../ui/026-renderHumanAwakeningPanel-완전-재정의.js';
import { lsGet, lsSet } from '../utils.js';
import { loadGSFlags } from '../world/145-⑥-세계-상태-DB.js';

window.VOLIN_PROFILE = VOLIN_PROFILE;

window.NPC_CHAPTER_STATE = NPC_CHAPTER_STATE;

export function getCurrentMainChapter(){
  try{
    const gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
    for(let i=28; i>=1; i--){
      if(gsF['mq'+i+'_done']) return i;
    }
    return 1;
  }catch(e){ return 1; }
}
window.getCurrentMainChapter = getCurrentMainChapter;

window.getCurrentMainChapter = getCurrentMainChapter;

export function hasMetMainStoryNpc(shortName){
  try{
    const npcs = (typeof loadNPCs==='function') ? (loadNPCs()||[]) : [];
    return npcs.some(n => n.name && (n.name.includes(shortName) || shortName.includes(n.name)));
  }catch(e){ return false; }
}
window.hasMetMainStoryNpc = hasMetMainStoryNpc;

window.hasMetMainStoryNpc = hasMetMainStoryNpc;

export function getMainStoryNpcSafeInfo(shortName){
  try{
    if(!hasMetMainStoryNpc(shortName)) return null; // ① 만난 적 없음 — 완전 비공개

    const stateTable = (typeof NPC_CHAPTER_STATE!=='undefined') ? NPC_CHAPTER_STATE[shortName] : null;
    if(!stateTable) return null;

    const curChapter = getCurrentMainChapter();
    // ② 현재 챕터 이하의 단계만 순회 — 배열 인덱스 자체를 미래로 넘어가지
    // 않으므로, 코드 실수가 있어도 구조적으로 미래 정보를 못 읽는다.
    let lastSafeChKey = null, lastSafeState = null;
    for(let ch=1; ch<=curChapter; ch++){
      const key = 'ch'+ch;
      if(stateTable[key]) { lastSafeChKey = key; lastSafeState = stateTable[key]; }
    }
    if(!lastSafeState) return null;

    // ③ status 등급에 따라 노출 수준 결정
    const HIDDEN_STATUSES = new Set(['unknown','absent']);
    if(HIDDEN_STATUSES.has(lastSafeState.status)){
      // 존재 자체가 아직 의미 없는 단계 — 패널에 올리지 않음
      return null;
    }
    if(lastSafeState.status === 'hidden'){
      // 만났지만 비밀은 안 풀린 상태 — 내용 숨기고 암시만
      return { status:'hidden', note:'아직 알아내지 못한 비밀이 있는 듯하다.', chapter:curChapter };
    }
    // first/active/revealed/hostile/ally/climax — 실제 note 노출
    return { status:lastSafeState.status, note:lastSafeState.note, chapter:curChapter };
  }catch(e){ return null; }
}
window.getMainStoryNpcSafeInfo = getMainStoryNpcSafeInfo;

window.getMainStoryNpcSafeInfo = getMainStoryNpcSafeInfo;

window.ENDING_SCENES = ENDING_SCENES;

export const CABAL_STATE_KEY = 'tf-cabal-state';

export function loadCabalState(){ try{ return JSON.parse(lsGet(CABAL_STATE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadCabalState = loadCabalState;

export function saveCabalState(d){ try{ lsSet(CABAL_STATE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveCabalState = saveCabalState;

export function getCabalBLSContext(){
  const gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
  if(!gsF['mq3_done'] && !gsF['mq2_done']) return ''; // 2장 이후에만 등장
  const cabalState = loadCabalState();
  // [버그 수정] 28장 재설계 이후 — 기존엔 mq7_done까지만 확인하고 최대
  // 7로 고정되어 있어, 8장 이후(실제로는 새 구조의 8~28장 전체)의 모든
  // chapter 기반 조건이 영원히 발동하지 못하는 심각한 결함이 있었다.
  // 28개 챕터를 전부 순회해 실제 완료된 최고 챕터 번호를 반환한다.
  const chapter = (() => {
    for(let i=28; i>=1; i--){
      if(gsF['mq'+i+'_done']) return i;
    }
    return 1;
  })();

  const activeOfficers = CABAL_OFFICERS.filter(o => {
    if(cabalState[o.id+'_dead']) return false;
    if(o.id === 'cabal_lira' && chapter < 3) return false;
    if(o.id === 'cabal_kross' && chapter < 4) return false;
    if(o.id === 'cabal_sera' && chapter < 3) return false;
    if(o.id === 'cabal_vorn' && chapter < 4) return false;
    return true;
  });

  if(!activeOfficers.length) return '';

  const lines = activeOfficers.map(o => {
    const defected = cabalState[o.id+'_defected'];
    const status = defected ? '이탈(잠재적 협력자)' : '적대';
    return `${o.icon}${o.name}(${o.title.split('—')[0].trim()}) [${status}]: ${o.personality.split('.')[0]}`;
  });
  return `\n\n[🕵️ 아스모데우스 결사 간부 — 현재 활동 중]\n${lines.join('\n')}\n이 인물들은 고정 캐릭터다. 새로운 결사 간부를 임의로 만들지 마라. 이들을 반복 등장시켜 연속성을 만들어라.`;
}
window.getCabalBLSContext = getCabalBLSContext;

window.CONTINENT_FACTION_MAP = CONTINENT_FACTION_MAP;

window.CONTINENT_RELATIONS = CONTINENT_RELATIONS;

window.RACE_STORY_RULES = RACE_STORY_RULES;

export function getWorldLoreBLSContext(){
  if(typeof S === 'undefined' || !S.character) return '';
  const gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
  const contId = S.character?.startContinent || 'central';
  const factMap = CONTINENT_FACTION_MAP[contId];

  // [버그 수정] chapter 변수를 함수 맨 앞으로 이동 — 이전엔 함수 중간
  // (asmoSnippet 등보다 뒤)에 정의되어 있어서, 그보다 앞에서 chapter를
  // 참조하던 코드들이 ReferenceError를 일으키고 있었다. 28장 재설계 이후
  // 기존 최대 7 고정 문제도 함께 해결(전체 28장을 순회해 정확한 값 반환).
  const chapter = (() => {
    for(let i=28; i>=1; i--){
      if(gsF['mq'+i+'_done']) return i;
    }
    return 1;
  })();

  // 세계 기본 역사 (항상 주입)
  const timelineSnippet = WORLD_LORE.timeline
    .slice(-3) // 최근 3개 사건만 (프롬프트 절약)
    .map(t=>`${t.era}: ${t.event.slice(0,60)}...`)
    .join(' / ');

  // 세력 지도 (해당 대륙)
  const factionSnippet = factMap
    ? `\n[⚔️ ${factMap.label} — 세력 구도]\n${factMap.factions.slice(0,4).map(f=>`${f.icon}${f.name}(${f.stance.slice(0,30)})`).join(' / ')}\n현재 갈등: ${factMap.currentConflict.slice(0,80)}`
    : '';

  // [버그 수정 - 매우 중요] 아스모데우스의 "진짜 목적"(세계의 의지와
  // 협상하려는 진짜 동기)은 히든 루트 22장에서야 밝혀지는 정보인데,
  // 기존엔 mq3_done(3장, 극초반) 기준으로 표면 루트 플레이어에게까지
  // 그대로 노출되고 있었다 — "표면 루트에서는 아스모데우스가 끝까지
  // 명백한 악당으로만 남아야 한다"는 원칙을 정면으로 위배하는 유출.
  const asmoSnippet = chapter >= 22
    ? `\n[📜 아스모데우스 진짜 목적] ${ASMODEUS_PROFILE.motivation.slice(0,80)}... → 그는 최초의 혼돈을 \"수단\"으로 쓴다. 목적은 세계의 의지와의 협상.`
    : '';

  // [버그 수정] 최초의 혼돈의 진짜 정체(순수 엔트로피, 세계 탄생 이전
  // 존재)도 히든 루트 21장(진실의 무게) 전용 정보다. 기존 mq6_done(6장)
  // 기준은 너무 이르다 — 표면 루트에서 "최초의 혼돈"이라는 이름조차
  // 언급되면 안 된다(표면 루트의 최종 흑막은 어디까지나 마왕이다).
  const chaosSnippet = chapter >= 21
    ? `\n[🌑 최초의 혼돈] ${PRIMORDIAL_CHAOS.nature} ${PRIMORDIAL_CHAOS.aiHint}`
    : '';

  // 감시자 (6회차 이상)
  const cycle = (typeof loadCycleCount==='function') ? (loadCycleCount()||0) : 0;
  const watcherSnippet = cycle >= 6
    ? `\n[👁️ 감시자 — 에테르 나시온] ${WATCHER_IDENTITY.motivation.slice(0,60)}... 그는 플레이어를 구원자로 기다린다.`
    : '';

  // [신규] 신화의 진짜 기원 — MYTH_ORIGIN_REVELATION. 15회차 이상(진엔딩
  // 직전 단계)부터만 노출되도록 게이트를 걸어, 시간 봉인석 클라이맥스의
  // stage4_5에서 드러나는 충격이 미리 새지 않게 한다.
  const mythOriginSnippet = (cycle >= 15 && typeof MYTH_ORIGIN_REVELATION !== 'undefined')
    ? `\n[🌌 신화의 기원 — 깊은 진실] 천계-마계는 원래 하나의 차원("근원계")이었다. 신계 대전은 갈라진 자신의 반쪽을 알아보지 못한 내전이었다. 테네브라 해구의 "고대 신"은 최초의 혼돈의 잘려나간 거대 파편이다. 9번째 영역이라 불리는 전설은 감시자의 공간 그 자체다. 이 정보는 절대 직접 설명하지 말고, 오직 시간 봉인석 클라이맥스(stage4_5)나 다크링 철학자의 깊은 전승(deeperOriginHint)을 통해서만 단편적으로 드러내라.`
    : '';

  // ── 패치 v38: 인과 구조 주입 ──────────────────────────────
  // [1] 봉인석 균열 인과 — 항상 주입
  // [버그 수정] "혼돈 본체 진실 해금"은 히든 루트 21장(진실의 무게) 전용
  // 정보다. 기존 chapter<=4(즉 5장부터 해금)는 표면 루트 한복판에서
  // 진실이 새어나가는 문제가 있었다.
  const causalSnippet = `\n[🔗 봉인석 균열 인과] 시발점: 7대 왕 악마 계약(220년 전) → 봉인 네트워크 결함. 셀리나 폭발(150년 전) = 최초의 혼돈 첫 각성 시도. 본체: 최초의 혼돈이 결함 틈새로 파편 연결 → 현재 균열 본격화. ${chapter<21?'1~20장: 왕국의 저주가 원인으로만 묘사.':'21장 이후: 혼돈 본체 진실 해금.'}`;

  // [2] 루프 자각 경위 — 2장 이후
  // [버그 수정 - 매우 중요] 이 두 스니펫은 루프/에테르 나시온/봉인 협약
  // 같은 히든 루트 전용 진실을 담고 있는데, 기존엔 chapter>=2(1부 극초반)
  // 부터 노출되고 있었다. 이러면 히든 루트를 영영 못 여는 표면 루트
  // 플레이어에게도 진실이 프롬프트를 통해 새어나가, "진실을 모르는 상태
  // = 마왕이 명백한 흑막"이라는 표면 루트의 핵심 전제 자체가 무너진다.
  // 히든 루트 진입 시점(17장) 이후로만 노출되도록 게이트를 옮긴다.
  const loopOriginSnippet = chapter >= 17
    ? `\n[👁️ 루프 자각자 경위] 에테르 나시온: 루프 설계자 — 루프 밖에 고정, 구조 전체 관찰. 아스모데우스: 봉인 협약 증인 서명 → 계약 기억 능력으로 약 300회차에 자각. ${chapter>=20?'암시 대사: "300번째 무렵, 나도 처음으로 기억이 왔습니다."':''}`
    : '';

  // [3] 심연 봉인석 논리 — 이건 봉인석 자체의 물리적 속성 설명이라 표면
  // 루트에도 노출 가능(루프의 진실과는 무관한 정보)
  const seaLogicSnippet = (chapter >= 4 || contId === 'southeast')
    ? `\n[🌊 심연 봉인석 역설] 봉인석 약화 = 그릇이 금가는 것. 고대 신 힘이 커지는 게 아님. 고대 신이 뒤척임 = 공간 압박. 파괴 시 고대 신 해방 + 봉인석 동시 소멸.`
    : '';

  // [4] 교회 루프 비밀 — 히든 루트 전용 진실이므로 17장 이후로 게이트 이동
  const churchSnippet = chapter >= 17
    ? `\n[⛪ 교회 루프 비밀] 대사제 타리엘 존재. 교회는 3대 현왕 시절부터 루프를 알고 교리로 숨겼다.${chapter>=20?' 타리엘이 플레이어에게 루프 최초 인정.':''}${chapter>=22?' 사원 지하 금서고에서 에테르 나시온+3대 왕 루프 협약 문서 발견 가능.':''}`
    : '';

  // [5] 세계수 루프 정박점 — 이것도 루프 관련 진실이므로 히든 루트 이후로 이동
  const worldtreeSnippet = (chapter >= 17 || (contId === 'northeast' && chapter >= 17))
    ? `\n[🌳 세계수 = 루프 정박점] 사망 영혼이 세계수 뿌리 통해 다음 회차로 흐름. 세계수 소멸 = 루프 흐름 차단 = 진 엔딩 불가. 실라리엘 침묵 이유: 세계수 역할 공개 시 적이 먼저 노림.`
    : '';

  // [6] 보른 복선 — 해당 챕터
  const vornSnippet = chapter === 2
    ? `\n[📋 복선] 도적 길드 장부에 "V.D." 이니셜 등장 — 보른 더스크의 첫 흔적. 정체 미공개.`
    : chapter === 3
    ? `\n[📋 복선] 암살 현장에서 미소 짓는 중년 상인 "보른" 목격. 말 없이 사라짐.`
    : '';

  // [7] 이름 교정 — 항상
  const nameFixSnippet = `\n[📛 이름 교정] 서대륙 발명가는 반드시 "에다르손" 또는 "에다르손 크레이그"로 호칭하라. "에디슨"이라 쓰지 말 것.`;

  // [v39 추가] 주요 NPC 프로필 — 챕터별 선택 주입
  // 에이든 파티 여부 확인
  // [CRITICAL BUG FIX] relationship >= 0은 기본값(50)에서 거의 안 내려가는
  // 모호한 기준이라, "배신/이탈"을 서사화해도 동행 상태가 풀리지 않는 버그가
  // 있었음. 명확한 전용 플래그(aiden_joined/aiden_left)로 교체 — AI가
  // 합류·이탈을 명시적으로 선언해야만 상태가 바뀌므로 모호함이 없다.
  const aidenInParty = (() => {
    try {
      const gsF = (typeof loadGSFlags === 'function') ? loadGSFlags() : {};
      if(gsF['aiden_left'])   return false;
      if(gsF['aiden_joined']) return true;
      return false; // 기본값: 아직 합류 안 함
    } catch(e) { return false; }
  })();

  const aidenSnippet = typeof AIDEN_PROFILE !== 'undefined'
    ? `

[⚔️ 에이든 — NPC 용사]
출신: ${AIDEN_PROFILE.origin.slice(0,50)}...
성격: ${AIDEN_PROFILE.personality.slice(0,60)}...
루프 인지: ${AIDEN_PROFILE.loopAwareness.slice(0,60)}...
★에이든 동행 여부: ${aidenInParty ? '현재 파티에 있음 — 함께 진행' : '현재 파티에 없음 — 에이든은 세계 어딘가에서 독자적으로 같은 위기를 추적 중. 플레이어가 모든 장면을 단독으로 진행한다. 절대로 에이든이 없어서 진행이 막힌다는 묘사 금지.'}★`
    : '';

  // [버그 수정] 28장 재설계에 맞춰 모든 chapter 임계값을 재매핑했다.
  // 이전 8장 기준 값들은 새 구조에서 전혀 다른 시점(대부분 훨씬 이른
  // 시점)에 발동하거나, chapter가 7로 캡핑되어 있던 버그와 겹쳐 아예
  // 발동하지 않았다.
  const beelzebubSnippet = (chapter >= 24 && typeof BEELZEBUB_PROFILE !== 'undefined')
    ? `\n\n[👑 베엘제부브 — 마왕]\n동기: ${BEELZEBUB_PROFILE.personality.slice(0,60)}...\n내부갈등: 친제 말라카르(반협약파)와 3천 년 대립 중. 25장 동맹 재구성 시 말라카르의 방해 발생.\n협약 서명 이유: ${BEELZEBUB_PROFILE.whyHeSigned.slice(0,80)}...`
    : '';

  const malakarSnippet = (chapter >= 24 && typeof MALAKAR_PROFILE !== 'undefined')
    ? `\n[🔥 말라카르 — 반협약파 수장] 베엘제부브의 친제. 25장 동맹 재구성 방해자. 27장엔 최초의 혼돈 앞에 합류.`
    : '';

  const worldWillSnippet = (chapter >= 28 && typeof WORLD_WILL_MANIFESTATION !== 'undefined')
    ? `\n\n[🌌 세계의 의지 — 28장 등장]\n모습: ${WORLD_WILL_MANIFESTATION.appearance.slice(0,80)}...\n에이든에게: "${WORLD_WILL_MANIFESTATION.whatItSaysToAiden.slice(0,40)}..."\n플레이어에게: 선택 3가지(봉인/흡수/세번째). AI지침: ${WORLD_WILL_MANIFESTATION.aiHint.slice(0,80)}...`
    : '';

  const leonardSnippet = (chapter <= 13 && typeof LEONARD_PROFILE !== 'undefined')
    ? `\n\n[⚔️ 레오나르드 경]\n비밀: ${LEONARD_PROFILE.secret.slice(0,70)}...\n모르는 것: ${LEONARD_PROFILE.unknownTruth.slice(0,60)}...\n균열 시점: ${LEONARD_PROFILE.howHeCracks.slice(0,80)}...`
    : '';

  const infernalSnippet = (chapter >= 24 && typeof INFERNAL_FACTIONS !== 'undefined')
    ? `\n[⚔️ 마계 내분] 협약파(베엘제부브 55%) vs 반협약파(말라카르 40%). 25장 동맹 재구성 중 말라카르의 개입 필수.`
    : '';

  const arcanusSnippet = (chapter >= 17 && typeof ARCANUS_LOOP_PROFILE !== 'undefined')
    ? `\n[🔮 아르카누스 루프 자각] 수십 회차 기억 보유. 플레이어가 루프 증거 제시 시 처음 인정 — 연구 데이터 제공. 타리엘과 묵시적 동맹.`
    : '';

  // v40 추가 NPC 스니펫
  const michaelSnippet = (chapter >= 10 && typeof MICHAEL_PROFILE !== 'undefined')
    ? `\n[⚔️ 미카엘] 천계 대천사장. 3천 년간 속세 개입 최소화 원칙(자신의 결정). 플레이어를 "예언 밖 변수"로 인식. 비밀: 천계가 신계대전 선제공격. 25장에서 마왕동맹에 처음 반대→설득 가능.`
    : '';

  const gabrielSnippet = (chapter >= 21 && typeof GABRIEL_PROFILE !== 'undefined')
    ? `\n[📜 가브리엘] 천계 예언사. 최초의 혼돈 예언에서 "이후"가 없어 처음으로 두려움. 루프를 "예언의 반복"으로 해석해왔으나 플레이어로 인해 흔들림. 26장에서 "세 번째 선택" 힌트 제공.`
    : '';

  const silarielSnippet = typeof SILARIEL_PROFILE !== 'undefined'
    ? `\n[🌙 실라리엘] 북동대륙 대예언사. 3천 년 이상. 세계수를 통해 루프 전체 "느낌". 침묵 이유: 공개 시 적이 세계수 노림. 진 엔딩 조건(유대도 90+) 핵심 인물. 플레이어가 올바른 질문 시 조금씩 열림.`
    : '';

  const silverSnippet = (chapter >= 2 && typeof SILVER_PROFILE !== 'undefined')
    ? `\n[🕵️ 정보상 실버] 루프 자각자. 수십 회차 정보 누적. 양쪽(아스모+감시자) 모두에 정보 팔아왔음. 사실만 말하는 원칙. 플레이어가 루프 물으면 무료 제공(이번만). 17장 이후 선제적 정보 제공.`
    : '';

  const contNpcSnippet = (() => {
    const lines = [];
    if(contId === 'south'   && typeof AMENHOTEP_PROFILE  !== 'undefined') lines.push(`[☀️ 아멘호테프] 43대 대신관. 신앙=봉인석 에너지. 신도 믿음이 봉인 유지 에너지. 태양 흐려짐=악순환. 진실 공개 용기는 플레이어에게서.`);
    if(contId === 'east'    && typeof TALIS_PROFILE       !== 'undefined') lines.push(`[🔬 탈리스] 고룡 광기=봉인석 연결 수치 증명. 발표하면 제국 붕괴 위기. 해결책 없이는 데이터 불가. 플레이어가 해결책 제시 시 전부 공개.`);
    if(contId === 'north'   && typeof CRYSTALLIA_PROFILE  !== 'undefined') lines.push(`[❄️ 크리스탈리아] 거인족 강화=봉인석 흡수 원인 앎. 말하면 수비대 전면전→패배. 에너지 추출 연구 중. 시간 벌기 위해 침묵.`);
    if(contId === 'southeast' && typeof BALTAZAR_PROFILE  !== 'undefined') lines.push(`[🏴‍☠️ 발타자르] 12대 해적왕. 죽음 두렵지 않음, 평범한 삶이 두려움. 고대 신 계약 원함. 마리넬라 앞에서만 멈칫. 루프 말하면 "다시 만나겠네" 웃음.`);
    if(contId === 'southeast' && typeof MARINELA_PROFILE  !== 'undefined') lines.push(`[⛈️ 마리넬라] 해구 진실 완전히 앎. 조건 없이 플레이어에게 공개. 발타자르 이야기 나오면 말 느려짐.`);
    if(contId === 'northwest' && typeof VOLIN_PROFILE     !== 'undefined') lines.push(`[⚙️ 볼린] 기계=봉인석 수호자임을 알게 된 후 신앙 전환 중. 고대 기계어 구사 가능. 봉인석 진실 들으면 신전 개방.`);
    return lines.length ? `\n` + lines.join('\n') : '';
  })();

  // ── NPC 챕터 상태 테이블 주입 ─────────────────────────────
  let npcStateSnippet = '';
  if (typeof NPC_CHAPTER_STATE !== 'undefined') {
    const chKey = `ch${chapter}`;
    const stateLines = [];
    const statusLabel = {
      unknown:'[미등장]', first:'[첫등장]', active:'[활동중]', hidden:'[활동·비밀유지]',
      revealed:'[비밀공개]', ally:'[동료]', hostile:'[적대]', absent:'[비활성]', climax:'[핵심등장]'
    };
    for (const [npcName, chapters] of Object.entries(NPC_CHAPTER_STATE)) {
      const state = chapters[chKey];
      if (!state) continue;
      const label = statusLabel[state.status] || `[${state.status}]`;
      stateLines.push(`${npcName} ${label}: ${state.note}`);
    }
    if (stateLines.length) {
      npcStateSnippet = `\n\n[🎭 ${chapter}장 NPC 현재 상태 — 이 장에서 각 NPC의 정확한 위치와 태도]\n` + stateLines.join('\n');
    }
  }

  // [19차 감사 FIX] mqState가 이 함수 어디에도 선언된 적이 없어(원본인
  // ai-prompt/077의 죽은 buildSystem에도 동일하게 선언이 없는 잠재
  // 버그였으나, 그 함수는 애초에 호출되지 않아 드러나지 않았다) 이
  // getWorldLoreBLSContext() 전체가 misc/330에 편입된 18차 이후 매턴
  // ReferenceError로 조용히 실패하고 있었다(SECTION_FNS 훅이 예외를
  // 삼켜서 증상이 안 보임). 다른 파일들과 동일한 패턴으로 실제 메인
  // 퀘스트 진행 상태를 로드한다.
  const mqState = (typeof loadMainQuestState === 'function') ? loadMainQuestState() : {};

  // ── 메인퀘스트 미시작 상태 처리 ───────────────────────────
  // mq1이 아직 active/complete가 아니면 = 플레이어가 아직 자기 삶을 살고 있는 것
  const mqNotStarted = !mqState['mq1'] || (mqState['mq1'] !== 'active' && mqState['mq1'] !== 'complete');
  const mqFreeRoamNote = mqNotStarted
    ? `

[🌱 메인퀘스트 미시작 — 자유 생활 단계]
플레이어가 아직 메인 퀘스트를 만나지 않았다. 지금은 플레이어가 세계를 살아가는 단계다. AI는 절대 퀘스트를 강요하지 마라. 플레이어의 배경에 맞는 삶을 서사화하라 — 노예라면 탈출이나 생존, 상인이라면 거래, 도적이라면 의뢰, 기사라면 임무. 봉인석 파편은 플레이어가 현재 있는 곳으로 찾아온다. 절대로 플레이어를 특정 장소로 유도하지 마라. 에이든은 이 시점에 왕도 어딘가에서 독자적으로 조사 중인 기사 한 명일 뿐이다 — 아직 플레이어와 무관하다.`
    : '';

  // ── [③] 회차별 세계 상태 요약 ──────────────────────────────
  let worldStateSnippet = '';
  try {
    const cycleNum  = typeof loadCycleCount === 'function' ? (loadCycleCount() || 1) : 1;
    const sealDB    = typeof loadSealRestore === 'function' ? (loadSealRestore() || {}) : {};
    const restoredN = Object.values(sealDB).filter(v => v === true).length;
    const wtLv      = typeof loadWorldTreeLevel === 'function' ? (loadWorldTreeLevel() || 0) : 0;
    const gsF2      = typeof loadGSFlags === 'function' ? (loadGSFlags() || {}) : {};
    const worldEvDB = typeof loadWorldEvents === 'function' ? (loadWorldEvents() || {}) : {};
    const firedEvts = Object.keys(worldEvDB).filter(k => worldEvDB[k]);

    // 세계 상태 핵심 요약
    const sealStatus  = `봉인석 복원 ${restoredN}/8개`;
    const treeStatus  = wtLv >= 5 ? '세계수 번성(5단계)' : wtLv >= 3 ? `세계수 회복 중(${wtLv}단계)` : wtLv >= 1 ? `세계수 약화(${wtLv}단계)` : '세계수 위기(0단계)';
    const cycleStatus = cycleNum >= 10 ? `${cycleNum}회차 — 고베테랑` : cycleNum >= 5 ? `${cycleNum}회차 — 중급` : `${cycleNum}회차 — 초반`;
    const chapterStatus = `현재 ${chapter}장 진행 중`;

    // 발화된 세계 이벤트 중 서사에 영향 있는 것
    const majorEvts = [];
    if (firedEvts.includes('we_dragon_mad'))   majorEvts.push('고룡 광기 사태 발생');
    if (firedEvts.includes('we_guild_war'))    majorEvts.push('마법협회 vs 교회 충돌 발생');
    if (firedEvts.includes('we_trade_war'))    majorEvts.push('서대륙-군도 무역전쟁 발발');
    if (firedEvts.includes('we_frost_giant'))  majorEvts.push('얼음 거인족 남하 침공 발생');
    if (firedEvts.includes('we_pirate_king'))  majorEvts.push('해적왕 반란 쿠데타 발생');
    if (firedEvts.includes('we_first_chaos'))  majorEvts.push('최초의 혼돈 각성');
    if (firedEvts.includes('we_gate_tremble')) majorEvts.push('천계-마계 경계 흔들림');

    worldStateSnippet = `\n\n[🌍 현재 세계 상태 요약]\n${cycleStatus} | ${chapterStatus} | ${sealStatus} | ${treeStatus}`;
    if (majorEvts.length) worldStateSnippet += `\n발생한 세계 이벤트: ${majorEvts.join(', ')}`;

    // 엔딩 근접도 암시
    if (restoredN >= 8 && gsF2['watcher_peace']) {
      worldStateSnippet += '\n⚠️ 진 엔딩 조건 근접 — 세계수 의식만 남음';
    } else if (restoredN >= 7) {
      worldStateSnippet += `\n진 엔딩까지 봉인석 ${8 - restoredN}개 남음`;
    }
  } catch(e) {}

  // ── [②] 대륙 간 관계 — 현재 대륙 기준 관련 정보 주입 ────
  let relationSnippet = '';
  if (typeof CONTINENT_RELATIONS !== 'undefined' && contId) {
    const relLines = [];
    for (const [key, rel] of Object.entries(CONTINENT_RELATIONS)) {
      if (!key.includes(contId) && !key.includes('-all')) continue;
      if (rel.score < 0 || rel.currentTension !== '없음.') {
        relLines.push(`${key.replace(/-/g,'↔')}: ${rel.relation}(${rel.score}) — ${rel.currentTension}`);
        if (rel.playerWarning) relLines.push(`  ⚠️ ${rel.playerWarning}`);
      }
    }
    if (relLines.length) relationSnippet = `\n\n[🗺️ 현재 대륙 외교 관계]\n` + relLines.join('\n');
  }

  // ── [①] 엔딩 장면 — 27장(최초의 혼돈 결전) 이후에만 주입 ─────
  // [버그 수정] ENDING_SCENES(진/선/배드 엔딩 등)는 히든 루트 최종
  // 클라이맥스(세계의 의지와의 대면) 전용 서사다. 표면 루트의 16장
  // 엔딩은 mq16 자체의 aiHint/chapterEndingLogic이 별도로 처리하므로
  // 이 스니펫과 무관하다. 기존 chapter>=8은 옛 8장 구조 기준이라
  // 새 28장 체계에서는 27장(결전) 근처로 게이트를 옮긴다.
  let endingSceneSnippet = '';
  if (chapter >= 27 && typeof ENDING_SCENES !== 'undefined') {
    // [수정] 엔딩 aiHint 원문에 "에이든의 마지막 대사를 반드시 묘사하라"는
    // 지시가 하드코딩되어 있어, 에이든과 동행한 적 없거나 배신했거나
    // 이미 죽은 회차에서도 그가 갑자기 등장해 대사를 하는 모순이 있었다.
    // 실제 동행/관계 상태를 확인해 에이든 등장 여부를 명확히 안내한다.
    const _aidenPresent = (typeof isAidenInParty==='function') ? isAidenInParty() : false;
    const _gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
    const _aidenBetrayed = !!_gsF['betrayed_hero_flag'];
    const _aidenDead = !!(_gsF['killed_villain_first'] && _gsF['stole_hero_glory']);
    let aidenNote;
    if (_aidenBetrayed || _aidenDead) {
      aidenNote = '에이든은 이 결말에 등장하지 않는다 — 그와의 관계가 이미 끝났다(배신 또는 사망). 절대로 그의 대사나 등장을 묘사하지 마라. 플레이어 혼자만의 결말로 완결하라.';
    } else if (_aidenPresent) {
      aidenNote = '에이든이 파티에 동행 중이다. 다른 동료 NPC들과 동등한 비중으로 짧게 등장시킬 수 있다(주인공급 비중은 아님).';
    } else {
      aidenNote = '에이든과 동행한 적이 없거나 이미 갈라섰다. 그를 이 결말에 등장시키지 마라 — 플레이어가 유일한 주인공인 결말로 완결하라.';
    }
    endingSceneSnippet = `\n\n[🏁 엔딩 장면 가이드] ${aidenNote}\n진 엔딩: ${ENDING_SCENES.true_ending.aiHint.slice(0,80)}...\n선 엔딩: ${ENDING_SCENES.good_ending.aiHint.slice(0,80)}...\n배드(심연): ${ENDING_SCENES.bad_ending_abyss.aiHint.slice(0,80)}...\n전체 장면은 window.ENDING_SCENES 참조.`;
  }

  // [19차 감사 FIX] raceStorySection도 mqState와 마찬가지로 이 함수
  // 어디에도 계산된 적이 없었다(원본 ai-prompt/077의 죽은 buildSystem
  // 안에 있던 것과 완전히 동일한 로직 — char 매개변수 대신 S.character를
  // 쓰도록 바꿔 그대로 옮겨왔다). RACE_STORY_RULES(뱀파이어/혈족 등
  // 종족별 서사 규칙 + 피의 연대기 진행 상황)를 실제로 프롬프트에
  // 반영한다.
  const raceStorySection = (() => {
    const _race = S.character?.race || '';
    if (!_race || typeof RACE_STORY_RULES === 'undefined') return '';
    // [19차 감사 FIX] RACE_STORY_RULES의 키는 영문 id(human/elf/dwarf/...)인데
    // 실제 캐릭터 생성(core/084의 pickRace)은 종족 한글 표시명(예: "인간",
    // "엘프")을 S.character.race에 그대로 저장한다. 원본 buildSystem의
    // 영문 부분 문자열 매칭(`_race.includes(k)`)은 한글 이름과 절대 겹치지
    // 않아 이 raceStorySection 전체가 원본에서도 처음부터 죽어있던
    // 코드였다. race/013의 RACE_DEFS id↔name 매핑을 그대로 반영해 실제
    // 매칭이 되도록 한다(world/055의 RACE_NAME_TO_ID와 동일한 패턴).
    const KR_TO_RACE_KEY = {
      '인간':'human', '엘프':'elf', '드워프':'dwarf', '오크':'orc',
      '다크링':'darkling', '세레스티얼':'celestial', '드래곤':'dragon',
      '악마':'demon', '언데드':'undead',
    };
    const raceKey = Object.entries(KR_TO_RACE_KEY).find(([kr]) => _race.includes(kr))?.[1]
      || Object.keys(RACE_STORY_RULES).find(k =>
        _race.toLowerCase().includes(k) || k.includes(_race.toLowerCase())
      );
    if (!raceKey) return '';
    const rule = RACE_STORY_RULES[raceKey];
    if (!rule) return '';

    const mqStarted = mqState['mq1'] === 'active' || mqState['mq1'] === 'complete';
    const lines = [];

    if (!mqStarted) {
      lines.push(`[🔮 ${_race} — 파편 조우 방식] ${rule.fragmentEncounter}`);
    }
    if (!mqStarted) {
      lines.push(`[🗺️ ${_race} — 퀘스트 진입 경로] ${rule.questEntryStyle}`);
    }

    const reactions = Object.entries(rule.npcReactions || {})
      .map(([npc, reaction]) => `${npc}: ${reaction}`)
      .join(' / ');
    if (reactions) {
      lines.push(`[👥 ${_race} — NPC 반응] ${reactions}`);
    }

    if (rule.uniqueNarrative) {
      lines.push(`[📖 ${_race} — 서사 지침] ${rule.uniqueNarrative}`);
    }

    if (rule.forbiddenByLore) {
      lines.push(`[🚫 ${_race} — 로어 금기] ${rule.forbiddenByLore}`);
    }

    // 🩸 뱀파이어 전용 — 피의 연대기 현황
    if (/뱀파이어|혈종|혈군|혈통 왕/.test(_race)) {
      try {
        const vc = (typeof loadVampireChronicle === 'function') ? loadVampireChronicle() : null;
        const th = (typeof loadThrallData === 'function') ? loadThrallData() : null;
        if (vc && vc.points > 0) {
          const vcStage = (typeof VAMPIRE_CHRONICLE_STAGES !== 'undefined') ? VAMPIRE_CHRONICLE_STAGES[vc.stage || 0] : null;
          lines.push(`[🩸 피의 연대기] ${vcStage ? vcStage.icon + vcStage.name : '눈뜸'} (${vc.points}pts) | 혈통기록 ${vc.bloodRegister.entries.length}명 | 공포기록 ${vc.fearRegistry.entries.length}명 | 살아온 시간 ${vc.eraRecord.totalTurns}턴`);
          if (vc.bloodRegister.rarest) {
            const cls = (typeof BLOOD_CLASSES !== 'undefined') ? BLOOD_CLASSES[vc.bloodRegister.rarest] : null;
            if (cls) lines.push(`가장 희귀한 흡혈 대상: ${cls.icon}${cls.label} — 이 혈액의 기억이 행동에 배어있다`);
          }
          const cityFearTop = Object.entries(vc.fearRegistry.cityFear || {}).sort((a,b)=>b[1]-a[1])[0];
          if (cityFearTop && cityFearTop[1] >= 30) lines.push(`공포 최고 도시: ${cityFearTop[0]}(공포도 ${cityFearTop[1]}) — 그 도시에서 이름만 들어도 반응이 달라진다`);
        }
        if (th && th.thralls && th.thralls.length) {
          const lord = (typeof THRALL_LORD_STAGES !== 'undefined') ? THRALL_LORD_STAGES[th.lordStage || 0] : null;
          lines.push(`[🦇 혈통 군주] ${lord ? lord.icon + lord.name : ''} | 권속 ${th.thralls.length}명 (충성 불안 ${th.thralls.filter(t=>(t.loyalty||80)<40).length}명)`);
        }
      } catch(e) {}
    }

    return lines.length ? '\n\n' + lines.join('\n') : '';
  })();

  return `\n\n[📜 세계 역사 뼈대] ${timelineSnippet}${factionSnippet}${asmoSnippet}${chaosSnippet}${watcherSnippet}${mythOriginSnippet}${causalSnippet}${loopOriginSnippet}${seaLogicSnippet}${churchSnippet}${worldtreeSnippet}${vornSnippet}${nameFixSnippet}${aidenSnippet}${beelzebubSnippet}${malakarSnippet}${worldWillSnippet}${leonardSnippet}${infernalSnippet}${arcanusSnippet}${michaelSnippet}${gabrielSnippet}${silarielSnippet}${silverSnippet}${contNpcSnippet}${npcStateSnippet}${worldStateSnippet}${relationSnippet}${endingSceneSnippet}${mqFreeRoamNote}${raceStorySection}`;
}
window.getWorldLoreBLSContext = getWorldLoreBLSContext;
