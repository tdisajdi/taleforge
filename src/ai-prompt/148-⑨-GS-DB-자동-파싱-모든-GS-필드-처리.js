// ⑨ GS → DB 자동 파싱 (모든 GS 필드 처리)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { SOCIAL_RANKS } from '../core/084-TaleForge-순수-JS-엔진.js';
import { pmLoad, pmSave } from '../core/267-저장로드초기화.js';
import { THRALL_BUILDINGS, THRALL_RANKS } from '../data/026-renderHumanAwakeningPanel-완전-재정의.js';
import { BASE_JOBS } from '../data/042-직업-시스템-무한-파생-도감.js';
import { CABAL_OFFICERS } from '../data/055-5대륙-왕국-시스템.js';
import { MATERIALS } from '../data/075-파트2-C-크래프팅-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RELIGIONS } from '../data/090-1-마스터-데이터.js';
import { MERC_ARCHETYPES, MERC_RARITY } from '../data/251-통합-처리-함수-매-AI-응답-후-호출.js';
import { addToItemCache, loadDynMaterials, loadGold, loadInventory, saveDynMaterials, saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { recordQuestChoice } from '../items/065-NPC퀘스트-완성도-강화.js';
import { loadSkills, saveSkills } from '../job/002-스킬-시스템.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadTitles } from '../job/010-스킬-강화-시스템.js';
import { TIER2_JOBS, loadJobHistory, loadWorldEvents } from '../job/042-직업-시스템-무한-파생-도감.js';
import { renderInventory } from '../job/087-전직-조건-저장로드-헬퍼-퀘스트아이템장소-등.js';
import { applyDissonanceStatEffect, loadItemDissonance, saveItemDissonance } from '../job/208-5-직업-시스템.js';
import { loadNPCs, loadQuests, saveNPCs, saveSession } from '../misc/001-block0-preamble.js';
import { addButterflyEffect } from '../misc/015-시스템-1120.js';
import { addGrudge, loadDivineGaze, recordDivineIntervention, recordStatUsage } from '../misc/016-2130번-시스템.js';
import { recordDivineContract, recordSin } from '../misc/017-4150번-시스템.js';
import { loadBetrayals, saveBetrayals } from '../misc/033-NEW-배신-가능한-동료-시스템.js';
import { applyPartyBonus, calcAllyAttackDamage, getActiveEnemyAtk, getEnemyScaleMultiplier, getPlayerMaxHp, getPlayerMaxMp, loadParty, processEnemyAttacksGS, recruitDeadNpcToParty, saveParty, updateCompanionTrust } from '../misc/054-이동수단-시스템.js';
import { addMaterial, loadMaterials, saveMaterials } from '../misc/075-파트2-C-크래프팅-시스템.js';
import { setRecentShock } from '../misc/217-14-메모리-자동-요약.js';
import { checkMercBandEstablished, getMercNotorietyTier, grantMercBandXp, guessMercArchetypeFromRole, loadMercBand, loadMercNotoriety, renderContractsPanel, rollMercRarity, saveMercBand, saveMercNotoriety, updateMercCaptain } from '../misc/251-통합-처리-함수-매-AI-응답-후-호출.js';
import { pmUpdateNpc } from '../npc/269-NPC-파트-업데이트.js';
import { earnTimeToken, fillUndyingGauge } from '../progression/018-5170번-환생-누적-시스템.js';
import { earnTearCrystal, growFaith, loadGrief, recordChildhoodTrauma, saveGrief, sealMemory } from '../progression/019-71100번-환생-누적-시스템.js';
import { elemTabooViolation, gainDragonAwakenPoints, gainDragonFragment, gainDragonHoard, gainElemResonance, processVampireChronicleGS, setDragonBloodline, shiftDragonBalance, shiftElemRestraint } from '../progression/020-101130번-환생-누적-시스템.js';
import { loadScholarResearchLog, saveScholarResearchLog } from '../quest/039-NEW-히든-퀘스트-시스템.js';
import { completeHiddenQuest } from '../quest/041-궁수-계열-T2-파생-5종-히든-퀘스트-전사마법사도적-계열과-동일한-뼈대.js';
import { _meTimeBand, autoDropLootOnDeath, calcMonsterDamageMultiplier, claimBountyIfMatched, getMonsterTierStats, getQuestDB, renderMonsters, tryReviveMonster } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { generateAILocation } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { loadCabalState, saveCabalState } from '../religion/061-볼린-드워프-기계-사제-프로필-패치-v40.js';
import { getPlayerReligion } from '../religion/094-5-플레이어-종교-귀속-교화.js';
import { triggerElfForgetting } from '../ui/025-통합-패널-공허-확장-탭-시스템.js';
import { THRALL_LORD_STAGES, deployThrall, loadSocialRankLog, loadThrallData, processEnemyRevivalGrantGS, processSkillDefineGS, processThrallGS, rewardThrall, saveThrallData } from '../ui/026-renderHumanAwakeningPanel-완전-재정의.js';
import { autoCheckBossPhases, loadSealRestore, triggerAfterBattleChoice } from '../ui/155-⑭-메모리-패널-UI.js';
import { esc, lsDel, lsGet, lsSet, toast } from '../utils.js';
import { loadGSFlags, updateWorldDB } from '../world/145-⑥-세계-상태-DB.js';

export function fireWorldEvent(eventId, force=false) {
  try {
    const evDB = typeof loadWorldEvents === 'function' ? loadWorldEvents() : {};
    if (!force && evDB[eventId]) return false; // 이미 발화됨
    evDB[eventId] = true;
    if (typeof lsSet === 'function') lsSet('tf-world-events', JSON.stringify(evDB));

    // 이벤트별 효과
    const eventEffects = {
      we_seal_crack:     () => toast('🔮 봉인석에 균열이 생겼다!', 3000),
      we_noble_crisis:   () => toast('👑 귀족 의회가 위기에 빠졌다!', 3000),
      we_guild_war:      () => toast('⚔️ 마법사 협회와 기사단이 충돌했다!', 3000),
      we_frost_giant:    () => toast('🧊 얼음 거인족이 남하하기 시작했다!', 3000),
      we_aurora_magic:   () => toast('✨ 극북에서 이상한 오로라가 나타났다!', 3000),
      we_dragon_mad:     () => toast('🐉 고룡 이그나르 2세가 광기에 빠졌다!', 3500),
      we_dragonrider:    () => toast('🐉 드래곤 라이더단이 출격했다!', 3000),
      we_steam_berserk:  () => toast('⚙️ 증기 기관들이 폭주하기 시작했다!', 3000),
      we_trade_war:      () => toast('⚓ 서대륙이 남동 군도를 봉쇄했다!', 3000),
      we_sun_dim:        () => toast('☀️ 태양이 흐려지기 시작했다...', 3000),
      we_ruins_open:     () => toast('🏚️ 고대 폐허의 봉인이 풀렸다!', 3000),
      we_worldtree_ill:  () => toast('🌳 세계수 잎이 검게 변하기 시작했다!', 3500),
      we_race_conflict:  () => toast('⚔️ 종족 간 충돌이 발생했다!', 3000),
      we_abyss_stir:     () => toast('🌊 심연이 뒤척이고 있다...', 3000),
      we_pirate_king:    () => toast('🏴‍☠️ 해적왕이 반란을 일으켰다!', 3000),
      we_machine_wake:   () => toast('⚙️ 고대 기계들이 깨어나고 있다!', 3000),
      we_dwarf_secret:   () => toast('🔨 드워프의 비밀이 드러났다!', 3000),
      we_gate_tremble:   () => toast('🌀 천계와 마계의 경계가 흔들린다!', 3500),
      we_first_chaos:    () => toast('🌑 최초의 혼돈이 각성하고 있다!!', 4000),
      we_hack:           () => toast('💾 시스템에 이상이 감지됐다...', 3000),
    };

    const effect = eventEffects[eventId];
    if (effect) effect();

    // [신규] 세력 간 충돌형 이벤트는 추상적인 토스트로 끝내지 않고, 실제
    // 전장을 지도에 생성한다 — 플레이어가 직접 찾아가 개입(또는 관전)
    // 할 수 있는 구체적인 장소로 만든다.
    const BATTLEFIELD_EVENTS = {
      we_guild_war:    { name:'마법사 협회 vs 기사단 — 충돌 현장', desc:'두 세력이 정면으로 맞붙은 전장. 양측 모두 물러서지 않는다.' },
      we_race_conflict:{ name:'종족 충돌 전선', desc:'서로 다른 종족이 무력으로 맞선 경계 지역. 긴장감이 가득하다.' },
      we_trade_war:    { name:'서대륙 해상 봉쇄선', desc:'함선들이 항로를 막고 대치 중인 해역. 언제 전투가 터질지 모른다.' },
      we_pirate_king:  { name:'해적왕 반란의 거점', desc:'반란을 일으킨 해적 함대가 집결한 항구. 일반인은 접근을 꺼린다.' },
    };
    const bfDef = BATTLEFIELD_EVENTS[eventId];
    if(bfDef && typeof generateAILocation === 'function'){
      (async()=>{
        try{
          const trigger = `세력 충돌 발생. "${bfDef.name}"이라는 전장이 생겨났다.`;
          const context = `${bfDef.desc} 이 장소는 위험하지만(continent 필드를 사건과 어울리는 대륙으로 설정), 직접 찾아가 개입하거나 관찰할 수 있는 실제 전장이어야 한다. type은 "special" 또는 "dungeon"으로 설정하라.`;
          const loc = await generateAILocation(trigger, context);
          if(loc){
            toast(`⚔️ 전장이 지도에 표시됐습니다: ${loc.name}`, 4000);
          }
        }catch(e){ console.warn('[battlefield_gen]', e); }
      })();
    }

    // 세계 DB에 기록
    if (typeof updateWorldDB === 'function') {
      updateWorldDB({ timeline: { category: 'world_event', title: `세계 이벤트: ${eventId}`, icon: '🌍' } });
    }
    // 나비효과 기록
    if (typeof addButterflyEffect === 'function') {
      addButterflyEffect({ desc: `세계 이벤트 발생: ${eventId}`, impact: 5, worldChange: '세계가 달라졌다', major: true });
    }

    console.log(`[WorldEvent] ${eventId} 발화됨`);
    return true;
  } catch(e) {
    console.warn('[fireWorldEvent]', e);
    return false;
  }
}
window.fireWorldEvent = fireWorldEvent;

window.fireWorldEvent = fireWorldEvent;

export function checkWorldEventTriggers() {
  try {
    const gsF = typeof loadGSFlags === 'function' ? loadGSFlags() : {};
    const evDB = typeof loadWorldEvents === 'function' ? loadWorldEvents() : {};
    const seals = typeof loadSealRestore === 'function' ? loadSealRestore() : {};
    const brokenCount = Object.values(seals).filter(v => v === false).length;

    // 봉인석 균열 → 이벤트 연쇄
    if (brokenCount >= 1 && !evDB['we_seal_crack'])    fireWorldEvent('we_seal_crack');
    if (brokenCount >= 2 && !evDB['we_abyss_stir'])    fireWorldEvent('we_abyss_stir');
    if (brokenCount >= 4 && !evDB['we_worldtree_ill']) fireWorldEvent('we_worldtree_ill');
    if (brokenCount >= 6 && !evDB['we_gate_tremble'])  fireWorldEvent('we_gate_tremble');
    // [버그 수정] we_first_chaos(최초의 혼돈 각성 스포일러)는 봉인석 8개
    // 파괴만으로 표면 루트 중에도 자동 발동할 수 있었다 — 히든 루트
    // 진입(mq21_done) 이후로만 발동하도록 추가 게이트를 건다.
    if (brokenCount >= 8 && gsF['mq21_done'] && !evDB['we_first_chaos'])   fireWorldEvent('we_first_chaos');

    // 챕터 진행에 따른 이벤트
    if (gsF['mq2_done'] && !evDB['we_noble_crisis'])   fireWorldEvent('we_noble_crisis');
    if (gsF['mq3_done'] && !evDB['we_dragon_mad'])     fireWorldEvent('we_dragon_mad');
    if (gsF['mq4_done'] && !evDB['we_guild_war'])      fireWorldEvent('we_guild_war');
    if (gsF['mq4_done'] && !evDB['we_sun_dim'])        fireWorldEvent('we_sun_dim');
    if (gsF['mq5_done'] && !evDB['we_steam_berserk'])  fireWorldEvent('we_steam_berserk');
    if (gsF['mq5_done'] && !evDB['we_trade_war'])      fireWorldEvent('we_trade_war');
    if (gsF['mq6_done'] && !evDB['we_frost_giant'])    fireWorldEvent('we_frost_giant');
    if (gsF['mq6_done'] && !evDB['we_pirate_king'])    fireWorldEvent('we_pirate_king');
  } catch(e) {}
}
window.checkWorldEventTriggers = checkWorldEventTriggers;

window.checkWorldEventTriggers = checkWorldEventTriggers;

export const _origProcessGSBlock = typeof window.processGSBlock === 'function' ? window.processGSBlock : function(gs){ if(typeof window.processGSToAllDBs==='function') window.processGSToAllDBs(gs); };

export const _wrappedProcessGSBlock = function(gs) {
  _origProcessGSBlock(gs);
  setTimeout(checkWorldEventTriggers, 200);
};

export function collectTurnData(aiText, userMsg, gsSucceeded){
  try{
    const turn = (typeof S!=='undefined' && S.msgCount) || 0;

    // 씬 타입 + 판정 성공 여부를 먼저 계산 (playlog와 장면통계 둘 다에서 사용)
    const lc = (aiText||'').toLowerCase();
    let sceneType = '대화';
    if(/전투|공격|적이|몬스터|싸움|베었|찔렀|마법을 시전/.test(lc)) sceneType = '전투';
    else if(/상점|구매|판매|골드를 지불|거래/.test(lc)) sceneType = '상점';
    else if(/이동|도착|향했|걸어|여행/.test(lc)) sceneType = '이동';
    else if(/휴식|잠을|쉬었|회복/.test(lc)) sceneType = '휴식';
    else if(/탐험|발견|살펴|조사/.test(lc)) sceneType = '탐험';

    // 판정 성공/실패 — 매칭 정밀도용 메타데이터. AI 텍스트의 성공/실패 표현으로 추정.
    let isSuccess = null; // null = 판정 없는 서술(이동/대화 등)
    if(/실패|놓치|빗나가|막혔|좌절|불가능했|어긋났/.test(lc)) isSuccess = false;
    else if(/성공|명중|관통|꿰뚫었|이뀌|해냈|마침내/.test(lc)) isSuccess = true;

    // ① 마스터 플레이로그 — 턴별 행동-결과 원본 기록 (하드코딩 핵심 재료)
    // [보완] GS 원본도 함께 저장 — 매칭 엔진이 텍스트만 재사용하면 그 턴의
    // 실제 게임 상태 변화(스탯/골드/퀘스트 등)가 누락되는 문제를 해결하기 위함.
    // window._lastParsedGS는 처리 직후 즉시 같은 턴인지 확인 후 사용 (다른 턴 오염 방지).
    const _gsForThisTurn = (gsSucceeded && window._pmLastGsSucceeded === (S.msgCount||0))
      ? window._lastParsedGS : null;

    const playlog = (()=>{ try{ return JSON.parse(lsGet('tf-master-playlog')||'[]'); }catch(e){ return []; } })();
    playlog.push({
      turn, userMsg: (userMsg||'').slice(0,300), aiText: (aiText||'').slice(0,800),
      gsSucceeded: !!gsSucceeded,
      gs: _gsForThisTurn, // 재실행 가능한 GS 원본 (없으면 null)
      sceneType, isSuccess,
      location: (typeof S!=='undefined' && S.currentLocation?.name) || null,
      // [보완] 직업/종족 컨텍스트 — 다른 직업/종족 캐릭터의 행동 패턴이
      // 섞여서 매칭되면 서사 일관성이 깨질 수 있어 매칭 조건에 포함시킴
      job: (typeof S!=='undefined' && S.character?.role) || null,
      race: (typeof S!=='undefined' && S.character?.race) || null,
      hp: S?.stats?.hp, maxHp: S?.stats?.maxHp, mp: S?.stats?.mp,
      // [신규] 전투 씬일 때 현재 마주친 몬스터 이름 — 이게 없으면 "고블린과
      // 싸울 때"와 "오크와 싸울 때"가 같은 캐시 카테고리로 뭉개져서, 강한
      // 몬스터와의 전투에 약한 몬스터 서사가 잘못 재생될 수 있다. 개별
      // 몬스터명 단위로 구분해 그 몬스터만의 전투 서사 풀이 쌓이게 한다.
      monsterName: (() => {
        try{
          if(sceneType !== '전투') return null;
          const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
          const alive = monsters.find(m=>m.status==='alive');
          return alive ? alive.name : null;
        }catch(e){ return null; }
      })(),
      // [확장] 골드/호감도/시간대 — HP(전투)에만 치우쳐 있던 구간화를
      // 게임 전반(경제·관계·시간)으로 확장하기 위한 컨텍스트
      gold: (typeof loadGold === 'function') ? loadGold() : null,
      // 씬에 등장한 NPC가 있으면 그 NPC와의 호감도 원점수 저장 (구간화는 매칭/추출 시점에 수행)
      npcAffinityScore: (() => {
        try{
          const npcs = (typeof loadNPCs==='function') ? loadNPCs() : [];
          const sceneNpc = npcs.find(n => n.inScene || n.present);
          return sceneNpc?.relation?.score ?? null;
        }catch(e){ return null; }
      })(),
      timeBand: (typeof _meTimeBand === 'function') ? _meTimeBand() : null,
      // [신규] 선택지 클릭 vs 자유 입력 구분 — 매칭 엔진이 선택지 입력에만
      // 더 적극적으로 캐시를 적용하기 위한 핵심 필드.
      // (별개 시스템인 recordChoice/tf-choice-history와는 목적이 다름 —
      // 그쪽은 선택의 도덕적/세계관적 결과 추적용이고, 여긴 AI 호출 절감용)
      isChoiceInput: !!(typeof S!=='undefined' && S._isCurrentInputChoice),
      at: Date.now(),
    });
    if(playlog.length > 2000) playlog.splice(0, playlog.length-2000); // 용량 제한
    lsSet('tf-master-playlog', JSON.stringify(playlog));

    // ② 장면 통계 — 장면 유형별 발생 빈도 (전투/대화/탐험/상점/휴식 등 비율)
    const sceneStats = (()=>{ try{ return JSON.parse(lsGet('tf-scene-stats')||'{}'); }catch(e){ return {}; } })();
    sceneStats[sceneType] = (sceneStats[sceneType]||0) + 1;
    lsSet('tf-scene-stats', JSON.stringify(sceneStats));

    // ③ 발견 몬스터 — 전투 텍스트에서 몬스터 정보 추출
    if(sceneType === '전투'){
      const monsters = (()=>{ try{ return JSON.parse(lsGet('tf-discovered-monsters')||'[]'); }catch(e){ return []; } })();
      try{
        const liveMon = (typeof loadMonsters==='function' ? loadMonsters() : []) || [];
        liveMon.forEach(m=>{
          if(!m?.name) return;
          if(!monsters.find(x=>x.name===m.name)){
            monsters.push({ name:m.name, hp:m.maxHp||m.hp, isBoss:!!m.isBoss, isNamed:!!m.isNamed, firstSeenTurn:turn });
          }
        });
        if(monsters.length) lsSet('tf-discovered-monsters', JSON.stringify(monsters));
      }catch(e){}
    }

    // ④ 발견 스킬 — 스킬 사용 패턴 기록
    try{
      const skillMatch = aiText.match(/['"「]([가-힣A-Za-z ]{2,12})['"」]\s*(?:스킬|기술|마법)?\s*(?:을|를)?\s*(?:발동|사용|시전)/);
      if(skillMatch){
        const skills = (()=>{ try{ return JSON.parse(lsGet('tf-discovered-skills')||'[]'); }catch(e){ return []; } })();
        const skillName = skillMatch[1].trim();
        if(skillName && !skills.find(x=>x.name===skillName)){
          skills.push({ name:skillName, firstSeenTurn:turn, context:aiText.slice(0,150) });
          lsSet('tf-discovered-skills', JSON.stringify(skills));
        }
      }
    }catch(e){}

    // ⑤ 세계관 로어 — 설정성 문단 감지 (역사/지명/종족 설명 등 정보성 서술)
    try{
      if(/전설에 따르면|역사적으로|오래전|고대에|왕국의 역사|이 땅은|전해지는 이야기/.test(aiText)){
        const lore = (()=>{ try{ return JSON.parse(lsGet('tf-lore-database')||'[]'); }catch(e){ return []; } })();
        const loreEntry = { turn, text: aiText.slice(0,500), location:(typeof S!=='undefined'&&S.currentLocation?.name)||null };
        if(!lore.some(x=>x.text===loreEntry.text)){
          lore.push(loreEntry);
          if(lore.length > 300) lore.splice(0, lore.length-300);
          lsSet('tf-lore-database', JSON.stringify(lore));
        }
      }
    }catch(e){}

    // ⑥ 세계 이벤트 로그
    try{
      if(/세계가|왕국에|전쟁이|재앙이|선언했다|소식이 전해|사건이 발생/.test(aiText)){
        const worldEvs = (()=>{ try{ return JSON.parse(lsGet('tf-world-events-log')||'[]'); }catch(e){ return []; } })();
        worldEvs.push({ turn, text: aiText.slice(0,300) });
        if(worldEvs.length > 300) worldEvs.splice(0, worldEvs.length-300);
        lsSet('tf-world-events-log', JSON.stringify(worldEvs));
      }
    }catch(e){}

    // ⑦ 퀘스트 DB — 현재 활성/완료 퀘스트 전체 스냅샷
    try{
      const qdb = (typeof getQuestDB==='function') ? getQuestDB() : ((typeof loadQuests==='function') ? loadQuests() : null);
      if(qdb){
        const questDb = (()=>{ try{ return JSON.parse(lsGet('tf-quest-database')||'[]'); }catch(e){ return []; } })();
        const qList = Array.isArray(qdb) ? qdb : Object.values(qdb);
        qList.forEach(q=>{
          if(!q?.id && !q?.title) return;
          const key = q.id || q.title;
          if(!questDb.find(x=>(x.id||x.title)===key)){
            questDb.push({ id:q.id, title:q.title, status:q.status, reward:q.reward, firstSeenTurn:turn });
          }
        });
        if(questDb.length) lsSet('tf-quest-database', JSON.stringify(questDb));
      }
    }catch(e){}

    // ⑧ NPC 대사 샘플 — 현재 씬 NPC들의 발화 패턴 수집
    try{
      const sceneNpcs = (typeof loadNPCs==='function' ? loadNPCs() : []) || [];
      const lc2 = aiText;
      sceneNpcs.forEach(npc=>{
        if(!npc?.name || !lc2.includes(npc.name)) return;
        const quoteMatch = lc2.match(new RegExp('["「]([^"」]{3,80})["」]'));
        if(quoteMatch){
          const dialogues = (()=>{ try{ return JSON.parse(lsGet('tf-npc-dialogues')||'[]'); }catch(e){ return []; } })();
          dialogues.push({ npc:npc.name, line:quoteMatch[1], turn, personality:npc.personality||'' });
          if(dialogues.length > 500) dialogues.splice(0, dialogues.length-500);
          lsSet('tf-npc-dialogues', JSON.stringify(dialogues));
        }
      });
    }catch(e){}
  }catch(e){ console.warn('[collectTurnData]', e); }
}
window.collectTurnData = collectTurnData;

window.collectTurnData = collectTurnData;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_129(){
if (typeof window !== 'undefined') {
  window.processGSBlock = _wrappedProcessGSBlock;
}

function processGSBlock(gs) {
  if (!gs) return;

  // ── stats ──────────────────────────────────────────────────
  if (gs.stats && typeof gs.stats === 'object') {
    // [버그 수정] wis/lck/sanity가 자기 자신에게 매핑돼 있었는데
    // S.stats에는 이 세 키가 아예 존재하지 않는다(진짜 키는 luk/per이고
    // sanity는 없음, wil이 가장 가까운 대응) — AI가 흔한 RPG 관례로
    // 이 이름들을 GS stats에 써서 보내면 아래 `S.stats[sk] !== undefined`
    // 가드에 걸려 조용히 버려졌다(misc/216 fate 카드, progression/220
    // 루프 보상에서 발견한 것과 동일한 유형의 버그). 실존하는 키로 교정.
    const statMap = { str:'str', agi:'agi', int:'int', wis:'per', cha:'cha',
                      lck:'luk', per:'per', spk:'spk', neg:'neg', fath:'fath',
                      hp:'hp', mp:'mp', mgc:'mgc', fear:'fear', sanity:'wil' };
    // hp/mp는 각인(재능 발현) 대상이 아니다 — recordStatUsage는 원래
    // STR/AGI 등 "전투 스탯을 실전에서 얼마나 썼는지" 세는 시스템인데,
    // 매 턴 체력 회복량까지 여기 누적되면서 "체력 각인"이 수천까지
    // 폭주하는 버그가 있었다(실측 3986까지 확인됨).
    const IMPRINT_EXCLUDED_STATS = new Set(['hp', 'mp']);
    Object.entries(gs.stats).forEach(([k, v]) => {
      const sk = statMap[k] || k;
      if (S.stats && S.stats[sk] !== undefined) {
        // hp/mp는 레벨 기반 공식(getPlayerMaxHp/getPlayerMaxMp)을 실제
        // 상한으로 쓴다. 기존엔 무조건 999를 상한으로 써서, AI가 매 턴
        // 조금씩 회복시키는 GS를 누적하면 레벨 11에 HP 819 같은 비정상
        // 성장이 발생했다(실측 확인됨: 턴1 HP100 → 110턴 뒤 819).
        let cap = 999;
        if (sk === 'hp' && typeof getPlayerMaxHp === 'function') cap = getPlayerMaxHp();
        else if (sk === 'mp' && typeof getPlayerMaxMp === 'function') cap = getPlayerMaxMp();
        S.stats[sk] = Math.max(0, Math.min(cap, (S.stats[sk] || 0) + Number(v)));
        if (Number(v) > 0 && !IMPRINT_EXCLUDED_STATS.has(sk) && typeof recordStatUsage === 'function') {
          recordStatUsage(sk, Number(v));
        }
      }
    });
    // [연결] HP가 위험 수준(20% 이하)까지 떨어지고도 생존하면 불사의 게이지 축적
    if(gs.stats.hp !== undefined && Number(gs.stats.hp) < 0 && S.stats && S.stats.hp > 0){
      const _maxHpForGauge = S.stats.maxHp || 100;
      if(S.stats.hp <= _maxHpForGauge * 0.2 && typeof fillUndyingGauge==='function') fillUndyingGauge(1);
      if(S.stats.hp <= _maxHpForGauge * 0.1){
        const _gazeForIntervention = (typeof loadDivineGaze==='function') ? loadDivineGaze() : null;
        if(_gazeForIntervention?.favored && typeof recordDivineIntervention==='function'){
          recordDivineIntervention();
          if(typeof recordDivineContract==='function') recordDivineContract('god', '위기 시 신의 개입으로 계약이 발동됨', S.scenario?.id);
        }
      }
    }
    if (typeof window.updateHeader === 'function') window.updateHeader();
    if (typeof saveSession === 'function') saveSession();
  }

  // ── enemy_attacks — 몬스터 공격, 데미지는 AI 판단이 아니라 시스템이
  // 직접 계산(calcMonsterAttackDamage). AI는 "이 몬스터가 공격했다"는
  // 사실만 전달하고 숫자는 절대 내지 않는다. ─────────────────────
  if (typeof processEnemyAttacksGS === 'function') processEnemyAttacksGS(gs);

  // ── gold ───────────────────────────────────────────────────
  // [버그 수정] 'tf-gold'(존재하지 않는 키)에 저장하던 것을 saveGold()로
  // 교정 — taleforge-gold(loadGold가 읽는 실제 키)에 정확히 저장된다.
  if (gs.gold !== undefined) {
    const delta = Number(gs.gold) || 0;
    if (delta !== 0) {
      const cur = typeof loadGold === 'function' ? loadGold() : 0;
      const next = Math.max(0, cur + delta);
      if (typeof saveGold === 'function') saveGold(next);
      if (S.gold !== undefined) S.gold = next;
      if (typeof window.updateHeader === 'function') window.updateHeader();
      if (delta > 0) toast(`💰 골드 +${delta} (총 ${next})`, 2000);
      else toast(`💸 골드 ${delta} (총 ${next})`, 2000);
    }
  }

  // ── items ──────────────────────────────────────────────────
  // [버그 수정] 기존엔 loadInventory()(taleforge-inventory 키)로 읽은 뒤
  // 존재하지 않는 키('tf-inventory')에 저장해서, AI가 주는 아이템이
  // 화면에 안 보이고 다음 세션에서 사라지는 핵심 버그가 있었다.
  // saveInventory()로 정확한 키에 쓰고, S.inventory(화면이 실제로
  // 읽는 메모리 배열)도 함께 동기화한다.
  if (Array.isArray(gs.items) && gs.items.length > 0) {
    S._itemsGrantedThisTurn = true; // 자동 드롭 시스템이 중복 지급하지 않도록 표시
    const inv = (typeof loadInventory === 'function' ? loadInventory() : []) || [];
    gs.items.forEach(item => {
      if (!item || !item.name) return;
      const newItem = {
        id: item.id || ('item_' + Date.now() + '_' + Math.random().toString(36).slice(2,6)),
        name: item.name, icon: item.icon || '📦',
        rarity: item.rarity || 'common',
        type: item.type || (item.slot ? 'equip' : 'misc'),
        slot: item.slot || null,
        effects: item.effects || {},
        desc: item.desc || '', quantity: item.qty || 1,
        lore: item.lore || '',
        obtainedAt: S.msgCount || 0,
        _aiGenerated: true,
      };
      inv.push(newItem);
      if(typeof addToItemCache==='function') addToItemCache(newItem);
      toastHTML(`${esc(item.icon || '📦')} ${esc(item.name)} 획득!`, 2500);
    });
    if (typeof saveInventory === 'function') saveInventory(inv);
    S.inventory = inv;
    if (typeof renderInventory === 'function') setTimeout(renderInventory, 100);
  }

  // ── job ────────────────────────────────────────────────────
  if (gs.job && typeof gs.job === 'string') {
    const prevJob = S.character?.role || '';
    if (gs.job !== prevJob) {
      if (S.character) S.character.role = gs.job;
      if (gs.job_icon && S.character) S.character.roleIcon = gs.job_icon;
      const reason = gs.job_reason || '직업 변경';
      toast(`⚔️ 직업 변경: ${prevJob} → ${gs.job} (${reason})`, 3000);
      // 직업 이력 저장
      const jh = (typeof loadJobHistory === 'function' ? loadJobHistory() : []) || [];
      jh.push({ from: prevJob, to: gs.job, reason, turn: S.msgCount || 0 });
      if (typeof lsSet === 'function') lsSet('tf-job-history', JSON.stringify(jh));
      if (typeof saveSession === 'function') saveSession();
      if (typeof window.updateHeader === 'function') window.updateHeader();
    }
  }

  // ── social_rank ────────────────────────────────────────────
  if (gs.social_rank && typeof gs.social_rank === 'string') {
    const prevRank = S.character?.socialRankId || '';
    if (gs.social_rank !== prevRank) {
      // [BUG FIX] rankDef를 못 찾으면(존재하지 않는 신분 ID — 예: 제거된
      // archmage/general/mage_guild를 AI가 실수로 보낸 경우) socialRankId
      // 만 바뀌고 socialRank(표시명)는 이전 값에 머무는 불일치가 생겼다.
      // mechanics도 못 찾는 신분에선 빈 객체로 폴백되어 가격/체포 면책
      // 등이 전부 무효화되는 부작용도 있었다. 유효한 신분일 때만 적용한다.
      const rankDef = typeof SOCIAL_RANKS !== 'undefined'
        ? SOCIAL_RANKS.find(r => r.id === gs.social_rank) : null;
      if (rankDef) {
        if (S.character) {
          S.character.socialRankId = gs.social_rank;
          S.character.socialRank = rankDef.name;
        }
        const reason = gs.social_rank_reason || '신분 변경';
        toast(`👑 신분 변경: ${gs.social_rank} (${reason})`, 3000);
        // 신분 이력 저장
        const sl = (typeof loadSocialRankLog === 'function' ? loadSocialRankLog() : []) || [];
        sl.push({ from: prevRank, to: gs.social_rank, reason, turn: S.msgCount || 0 });
        if (typeof lsSet === 'function') lsSet('tf-social-rank-log', JSON.stringify(sl));
        if (typeof saveSession === 'function') saveSession();
        if (typeof window.updateHeader === 'function') window.updateHeader();
      } else {
        console.warn('[social_rank] 알 수 없는 신분 ID 무시:', gs.social_rank);
      }
    }
  }

  // ── merc_notoriety ────────────────────────────────────────────
  // [신규] 용병단 시스템의 "악명"을 서사에서도 쌓을 수 있게 한다.
  // 게시판의 약탈/밀수/강탈 임무 외에도, 플레이어가 직접 자유 서사로
  // 약탈·강탈 행위를 저지르면 AI가 이 필드로 악명을 반영할 수 있다.
  if (gs.merc_notoriety && typeof gs.merc_notoriety === 'number' && gs.merc_notoriety > 0) {
    const curNoto = (typeof loadMercNotoriety === 'function') ? loadMercNotoriety() : 0;
    const nextNoto = curNoto + Math.round(gs.merc_notoriety);
    if (typeof saveMercNotoriety === 'function') saveMercNotoriety(nextNoto);
    const notoTier = (typeof getMercNotorietyTier === 'function') ? getMercNotorietyTier(nextNoto) : null;
    toast(`🕶️ 악명 +${Math.round(gs.merc_notoriety)}${notoTier ? ` — "${notoTier.label}"` : ''}`, 2500);
  }

  // ── religion_join ────────────────────────────────────────────
  // [신규] 기존에는 종교 귀의가 오직 UI의 "귀의" 버튼을 직접 눌러야만
  // 가능했다 — AI가 서사로 "신전에 귀의했다"고 서술해도 시스템이 전혀
  // 인식하지 못하는 불일치가 있었다. job/social_rank와 동일한 패턴으로
  // GS 필드를 만들어, 서사 중 자연스러운 귀의도 정확히 인식되게 한다.
  if (gs.religion_join && typeof gs.religion_join === 'string') {
    const prevRel = (typeof getPlayerReligion === 'function' ? getPlayerReligion() : null) || '';
    if (gs.religion_join !== prevRel) {
      const relDef = typeof RELIGIONS !== 'undefined' ? RELIGIONS[gs.religion_join] : null;
      if (relDef) {
        if (typeof window.setPlayerReligion === 'function') window.setPlayerReligion(gs.religion_join);
        if (typeof growFaith === 'function') growFaith(15);
        const reason = gs.religion_join_reason || '종교 귀의';
        // setPlayerReligion 자체가 toast를 띄우므로 여기서는 이력만 남긴다.
        const rl = (typeof lsGet === 'function' ? JSON.parse(lsGet('tf-religion-join-log') || '[]') : []);
        rl.push({ from: prevRel, to: gs.religion_join, reason, turn: S.msgCount || 0 });
        if (typeof lsSet === 'function') lsSet('tf-religion-join-log', JSON.stringify(rl));
        if (typeof saveSession === 'function') saveSession();
      } else {
        console.warn('[religion_join] 알 수 없는 종교 ID 무시:', gs.religion_join);
      }
    }
  }
  // 배교(종교 이탈)도 동일한 방식으로 처리 — "religion_leave":true
  if (gs.religion_leave === true) {
    const prevRel = (typeof getPlayerReligion === 'function' ? getPlayerReligion() : null);
    if (prevRel && typeof window.setPlayerReligion === 'function') {
      window.setPlayerReligion(null);
      const rl = (typeof lsGet === 'function' ? JSON.parse(lsGet('tf-religion-join-log') || '[]') : []);
      rl.push({ from: prevRel, to: null, reason: gs.religion_leave_reason || '배교', turn: S.msgCount || 0 });
      if (typeof lsSet === 'function') lsSet('tf-religion-join-log', JSON.stringify(rl));
      if (typeof saveSession === 'function') saveSession();
    }
  }

  // ── skill ──────────────────────────────────────────────────
  // [버그 수정] 'tf-skills'(존재하지 않는 키)에 저장하던 것을 saveSkills()로
  // 교정 — taleforge-skills(loadSkills가 읽는 실제 키)에 정확히 저장된다.
  if (gs.skill && typeof gs.skill === 'string') {
    const skills = (typeof loadSkills === 'function' ? loadSkills() : {}) || {};
    if (!skills[gs.skill]) {
      skills[gs.skill] = { level: 1, obtainedAt: S.msgCount || 0 };
      if (typeof saveSkills === 'function') saveSkills(skills);
      toast(`✨ 스킬 습득: ${gs.skill}`, 2500);
    } else {
      skills[gs.skill].level = (skills[gs.skill].level || 1) + 1;
      if (typeof saveSkills === 'function') saveSkills(skills);
      toast(`⬆️ 스킬 강화: ${gs.skill} Lv.${skills[gs.skill].level}`, 2500);
    }
  }

  // ── party_damage ───────────────────────────────────────────
  if (Array.isArray(gs.party_damage)) {
    const npcs = (typeof loadNPCs === 'function' ? loadNPCs() : []) || [];
    const _zeroHpNames = []; // [신규] HP 0에 도달한 동료 이름을 모아 자동 판정에 넘긴다
    gs.party_damage.forEach(d => {
      if (!d || !d.name) return;
      const npc = npcs.find(n => n.name && n.name.includes(d.name.slice(0, 4)));
      if (npc) {
        npc.hp = npc.hp === undefined ? 100 : npc.hp;
        npc.maxHp = npc.maxHp || 100;
        // [버그 수정] 기존엔 d.dmg(AI가 즉흥 판단한 숫자)를 그대로 썼다 —
        // enemy_attacks와 동일한 원칙으로, AI는 "누가 맞았는지"만 알리고
        // 실제 데미지는 현재 전투 중인 적의 공격력 기반으로 시스템이 계산한다.
        const dmg = calcAllyAttackDamage();
        npc.hp = Math.max(0, npc.hp - dmg);
        toast(`💥 ${npc.name} -${dmg} HP (${npc.hp}/${npc.maxHp})`, 2000);
        if (npc.hp <= 0) _zeroHpNames.push(npc.name);
      }
    });
    if (typeof saveNPCs === 'function') saveNPCs(npcs);

    // ── [신규] 기존엔 HP가 0이 되어도 AI가 party_incap을 별도로 보내야만
    //    사망/부상 판정이 실행됐다 — enemy_damage에 적용했던 것과 동일한
    //    자동화를 여기에도 적용한다. 이미 완성된 party_incap 확률 로직
    //    (불사의 온기 개입 포함)을 그대로 재사용하기 위해, HP 0가 된
    //    동료들을 모아 이번 턴의 gs.party_incap에 자동으로 편입시킨다.
    //    AI가 같은 턴에 이미 party_incap을 명시했다면 중복 없이 합쳐진다. ──
    if (_zeroHpNames.length) {
      const existingIncapNames = new Set(
        (Array.isArray(gs.party_incap) ? gs.party_incap : []).map(e => typeof e === 'string' ? e : e.name)
      );
      _zeroHpNames.forEach(name => {
        if (!existingIncapNames.has(name)) {
          if (!Array.isArray(gs.party_incap)) gs.party_incap = [];
          gs.party_incap.push({ name, reason: '치명상' });
        }
      });
    }
  }

  // ── party_death ────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════
//  ⚔️ 전투 이탈 & 포로 시스템
//  - 아군 부상 → 전투 슬롯에서 즉시 제거 (후방대기로 전환)
//  - 적 부상 → 전투에서 이탈 (도주 또는 포로)
//  - 포로 → NPC로 등록, 심문/영입/처형/석방 선택지
// ══════════════════════════════════════════════════════════════
const PRISONER_KEY = 'tf-prisoners';
const loadPrisoners  = () => { try{ return JSON.parse(lsGet(PRISONER_KEY)||'[]'); }catch(e){ return []; } };
const savePrisoners  = (d) => { try{ lsSet(PRISONER_KEY, JSON.stringify(d)); }catch(e){} };
const clearPrisoners = () => lsDel(PRISONER_KEY);

// 포로 추가
function addPrisoner(name, info) {
  const list = loadPrisoners();
  if (list.find(p => p.name === name)) return; // 이미 있음
  const prisoner = {
    name,
    icon:        info.icon    || '⚔️',
    role:        info.role    || '포로',
    faction:     info.faction || '불명',
    capturedTurn: (typeof S !== 'undefined' && S.msgCount) || 0,
    capturedAt:   (typeof S !== 'undefined' && S.currentLocation?.name) || '불명',
    condition:   'wounded',   // wounded / broken / defiant / cooperative
    info:        info.desc    || '',
    canRecruit:  false,
    canThrall:   false,
  };
  list.push(prisoner);
  savePrisoners(list);

  // NPC 상태 업데이트
  try {
    const npcs = (typeof loadNPCs === 'function') ? loadNPCs() : [];
    const npc = npcs.find(n => n.name && n.name.includes(String(name).slice(0,4)));
    if (npc) {
      npc.status    = 'captured';
      npc.isPrisoner = true;
      if (typeof saveNPCs === 'function') saveNPCs(npcs);
    }
  } catch(e) {}

  toast(`⛓️ ${name} 포로 획득! (하단 ⛓️포로 메뉴에서 관리)`, 3500);
  S._nextInjectedContext = (S._nextInjectedContext || '')
    + `
[⛓️ 포로 획득] ${name}이(가) 포로로 붙잡혔다. 심문·회유·위협·영입·처형·석방 등 다양한 선택지를 자연스럽게 제시하라.`;
}
window.addPrisoner = addPrisoner;

// 포로 석방
function releasePrisoner(name) {
  const list = loadPrisoners().filter(p => p.name !== name);
  savePrisoners(list);
  try {
    const npcs = (typeof loadNPCs === 'function') ? loadNPCs() : [];
    const npc = npcs.find(n => n.name && n.name.includes(String(name).slice(0,4)));
    if (npc) { npc.status = 'alive'; npc.isPrisoner = false; if (typeof saveNPCs === 'function') saveNPCs(npcs); }
  } catch(e) {}
  toast(`🕊️ ${name} 석방`, 2500);
}
window.releasePrisoner = releasePrisoner;

// 포로 처형
function executePrisoner(name) {
  const list = loadPrisoners().filter(p => p.name !== name);
  savePrisoners(list);
  try {
    const npcs = (typeof loadNPCs === 'function') ? loadNPCs() : [];
    const npc = npcs.find(n => n.name && n.name.includes(String(name).slice(0,4)));
    if (npc) {
      npc.status = 'dead'; npc.hp = 0; npc.isPrisoner = false;
      if (typeof saveNPCs === 'function') saveNPCs(npcs);
      if (typeof pmLoad === 'function') {
        const pmD = pmLoad('npc');
        if (pmD[npc.name]) { pmD[npc.name].deceased = true; pmSave('npc', pmD); }
      }
    }
  } catch(e) {}
  toast(`💀 ${name} 처형`, 2500);
}
window.executePrisoner = executePrisoner;

// [신규] 포로 → 용병단 영입. 포로 상태에 따라 성공률이 달라진다 —
// 협조적(cooperative)이거나 마음이 꺾인(broken) 포로는 잘 넘어오지만,
// 반항적인(defiant) 포로는 잘 넘어오지 않는다.
function recruitPrisonerToMercBand(name){
  const list = loadPrisoners();
  const prisoner = list.find(p=>p.name===name);
  if(!prisoner){ toast('해당 포로를 찾을 수 없습니다.'); return; }
  if(!prisoner.canRecruit){ toast('아직 영입에 응할 상태가 아닙니다. 먼저 회유하거나 설득해야 합니다.'); return; }

  const chanceByCondition = { cooperative:0.85, broken:0.6, defiant:0.2, wounded:0.4 };
  const chance = chanceByCondition[prisoner.condition] ?? 0.4;
  if(Math.random() >= chance){
    toast(`❌ ${name}이(가) 결국 마음을 돌리지 않았습니다. (영입 실패)`, 3500);
    return;
  }

  const band = (typeof loadMercBand==='function') ? loadMercBand() : {members:[]};
  const archKey = (typeof guessMercArchetypeFromRole==='function') ? guessMercArchetypeFromRole(prisoner) : 'vanguard';
  const arch = MERC_ARCHETYPES[archKey];
  const rarityKey = (typeof rollMercRarity==='function') ? rollMercRarity() : 'common';
  const rarity = MERC_RARITY[rarityKey];
  // 포로 출신은 항상 "회유된 자" 특성을 강제로 부여 — 개연성 있는 개성:
  // 유지비는 저렴하지만(부담 없이 얻은 인력) 충성도는 낮게 시작한다.
  const member = {
    id:'merc_'+Date.now()+'_'+Math.floor(Math.random()*1000),
    name:prisoner.name, sourceNpc:prisoner.name, fromPrisoner:true,
    icon:prisoner.icon||arch.icon, archetype:archKey, trait:'greedy', rarity:rarityKey,
    level:1, xp:0,
    loyalty: prisoner.condition==='broken' ? 35 : 45,
    upkeep: Math.round((7+Math.floor(Math.random()*4)) * (rarity.upkeepMult||1)),
    joinedAt:S.msgCount||0,
  };
  band.members.push(member);
  if(typeof updateMercCaptain==='function') updateMercCaptain(band);
  if(typeof checkMercBandEstablished==='function') checkMercBandEstablished(band);
  saveMercBand(band);

  // 포로 목록에서 제거, NPC 상태도 갱신
  savePrisoners(list.filter(p=>p.name!==name));
  try {
    const npcs = (typeof loadNPCs==='function') ? loadNPCs() : [];
    const npc = npcs.find(n=>n.name && n.name.includes(String(name).slice(0,4)));
    if(npc){ npc.status='alive'; npc.isPrisoner=false; npc.inMercBand=true; if(typeof saveNPCs==='function') saveNPCs(npcs); }
  } catch(e){}

  toast(`⛓️➡️⚔️ ${name}이(가) 목숨을 살려준 은혜로 용병단에 합류했습니다. (${rarity.label} ${arch.label})`, 4500);
  S._pendingContractHint = `포로였던 ${name}이 처형이나 방치 대신 용병단 합류를 택했다. 완전히 마음을 놓기엔 이르지만, 당장은 충실히 일한다.`;
  if(typeof renderPrisonerPanel==='function') renderPrisonerPanel();
  if(typeof renderContractsPanel==='function') renderContractsPanel();
}
window.recruitPrisonerToMercBand = recruitPrisonerToMercBand;

// 포로 BLS 주입
function getPrisonerBLS() {
  const list = loadPrisoners();
  if (!list.length) return '';
  const band = (typeof loadMercBand==='function') ? loadMercBand() : {members:[]};
  const mercHint = band.members.length>0
    ? ' 용병단을 거느리고 있으므로, 포로를 진심으로 설득하는 데 성공하면 prisoner_update의 canRecruit:true로 표시하라 — 그러면 플레이어가 포로 패널에서 직접 용병단에 영입할 수 있다.'
    : '';
  return `
[⛓️ 보유 포로(${list.length}명)] `
    + list.map(p => `${p.name}(${p.role}·${p.faction}·상태:${p.condition === 'wounded' ? '부상' : p.condition === 'broken' ? '기력소진' : p.condition === 'defiant' ? '저항' : '협조적'})`).join(', ')
    + ` — 포로와 상호작용(심문·회유·거래·위협 등) 시 상태에 따라 다른 반응을 보여라. 협조적 포로는 정보를 줄 수 있고, 저항하는 포로는 완강히 버틴다.${mercHint}`;
}
window.getPrisonerBLS = getPrisonerBLS;

// [신규] 포로 관리 UI 패널 — 지금까지는 addPrisoner/releasePrisoner/
// executePrisoner가 데이터 함수로는 있었지만 실제로 누를 화면이 전혀
// 없어 AI 서사에만 의존했다. 이제 직접 관리할 수 있는 패널을 만든다.
function renderPrisonerPanel(){
  const body = document.getElementById('pb-prisoners'); if(!body) return;
  const list = loadPrisoners();
  const condLabel = { wounded:'부상', broken:'기력소진', defiant:'저항', cooperative:'협조적' };
  const condColor  = { wounded:'#c08030', broken:'#8a6a9a', defiant:'#c04040', cooperative:'#6aca6a' };

  let html = `<div style="padding:8px 12px;background:#0a0500;border-bottom:1px solid #2a1a05;font-size:9px;color:#8a6a3a;line-height:1.6">⛓️ 전투 중 사로잡은 포로들이다. 심문·회유는 서사(대화)로 진행되며, 상태가 바뀌면 여기 반영된다. 석방·처형·영입은 아래 버튼으로 직접 결정한다.</div>`;

  if(!list.length){
    html += `<div style="padding:20px;text-align:center;color:var(--dim);font-size:10px">아직 포로가 없습니다. 전투에서 적을 죽이지 않고 제압하면 포로로 잡을 수 있습니다.</div>`;
  } else {
    list.forEach(p=>{
      html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-size:15px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(p,{size:15}):(p.icon)}</span>
          <span style="flex:1;font-size:10px;color:var(--text)">${esc(p.name)} <span style="color:#8a7a5a;font-size:9px">· ${esc(p.role)}</span></span>
          <span style="font-size:8px;color:${condColor[p.condition]||'#8a8a8a'}">${condLabel[p.condition]||p.condition}</span>
        </div>
        <div style="font-size:8px;color:var(--dim);margin-bottom:8px">${esc(p.faction)} 소속${p.info?' · '+esc(p.info):''} · ${p.capturedAt}에서 ${p.capturedTurn}턴째 포획</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          ${p.canRecruit ? `<button onclick="recruitPrisonerToMercBand('${esc(p.name)}')" style="flex:1;padding:5px;background:#0a150a;border:1px solid #2a5a1a;color:#6aca6a;font-size:8px;cursor:pointer">⚔️ 용병단에 영입</button>` : `<span style="flex:1;font-size:8px;color:#6a5a3a;text-align:center;padding:5px">영입하려면 먼저 대화로 설득하세요</span>`}
          <button onclick="if(confirm('${esc(p.name)}을(를) 석방하시겠습니까?'))releasePrisoner('${esc(p.name)}');renderPrisonerPanel()" style="padding:5px 10px;background:#0a0f1a;border:1px solid #1a3a5a;color:#6a9ac0;font-size:8px;cursor:pointer">🕊️ 석방</button>
          <button onclick="if(confirm('${esc(p.name)}을(를) 처형하시겠습니까? 되돌릴 수 없습니다.'))executePrisoner('${esc(p.name)}');renderPrisonerPanel()" style="padding:5px 10px;background:#150a0a;border:1px solid #5a1a1a;color:#ca6a6a;font-size:8px;cursor:pointer">💀 처형</button>
        </div>
      </div>`;
    });
  }

  html += `<div style="padding:8px 12px;text-align:center"><button onclick="renderPrisonerPanel()" style="padding:5px 14px;background:#0a0500;border:1px solid #3a1a05;color:#5a3a1a;font-size:8px;font-family:Cinzel,serif;cursor:pointer">🔄 새로고침</button></div>`;
  body.innerHTML = html;
}
window.renderPrisonerPanel = renderPrisonerPanel;

// ── 패널 DOM 등록 + 진입 버튼 ──
(function(){
  if(document.getElementById('p-prisoners')) return;
  const div=document.createElement('div'); div.className='panel-ov'; div.id='p-prisoners';
  div.innerHTML=`<div class="panel"><div class="p-hdr"><span class="p-title">⛓️ 포로</span><button class="p-close" onclick="closeP('prisoners')">✕</button></div><div class="p-body scrollable" id="pb-prisoners"></div></div>`;
  document.body.appendChild(div);
})();
setTimeout(function(){
  try{
    const b=document.querySelector('.btm-bar'); if(!b) return;
    if(!document.getElementById('btn-prisoners')){
      const bn=document.createElement('button'); bn.id='btn-prisoners'; bn.className='bb';
      bn.style.cssText='color:#c0a030;border-color:#3a2a05'; bn.textContent='⛓️포로'; bn.title='포로 — 석방·처형·영입';
      bn.onclick=function(){ window.openP('prisoners'); renderPrisonerPanel(); }; b.appendChild(bn);
    }
  }catch(e){}
}, 4400);

// ══════════════════════════════════════════════════════════════
//  ⚔️ 기존 NPC가 전투 상대로 전환 — npc_turns_hostile [신규]
//  ENCOUNTER_PATTERNS(나타났다·달려들다·막아섰다 등)는 "새로 등장한 적"만
//  잡는 구조라, 원래 그 자리에 있던 인물(예: 감독관, 동료였던 자)이 나중에
//  적대 행위를 시작하는 상황은 구조적으로 감지할 수 없었다. AI에게 이런
//  상황을 명시적으로 출력하게 하고, 시스템이 그 NPC를 정확히 전투 시스템
//  (loadMonsters)으로 전환 등록한다.
// ══════════════════════════════════════════════════════════════
const NPC_HOSTILE_PATTERN_KEY = 'tf-hostile-pattern-log';

function loadHostilePatternLog(){ try{ return JSON.parse(lsGet(NPC_HOSTILE_PATTERN_KEY)||'[]'); }catch(e){ return []; } }
function saveHostilePatternLog(d){ try{ lsSet(NPC_HOSTILE_PATTERN_KEY, JSON.stringify(d.slice(-50))); }catch(e){} }

// ── NPC 신분/역할 기반 레벨·스탯·스킬 프로필 산정 ──────────────
// 신분(rank)에 따라 고정 절대 레벨 범위를 사용한다.
// 플레이어 레벨과 무관하게 NPC 유형별 세계 내 실질 강도를 반영.
//
// ■ 전체 레벨 구조 (위에서부터 우선순위 매칭):
//
//  【비전투 민간인】
//   노예·포로·거지           Lv. 3~10   → 사실상 전투 능력 없음
//   농노·농부·평민·시민       Lv. 5~20   → 몸싸움은 가능하나 허약
//   상인·행상·수공업자        Lv. 8~18   → 체력은 있으나 훈련 없음
//   도적·불량배·갱단원        Lv.12~22   → 비정규 싸움꾼, 비겁한 전술
//   산적·현상금 사냥꾼        Lv.18~30   → 실전 경험 있는 무법자
//
//  【정규군 — 사병·하급 부사관】
//   신병·훈련병               Lv.12~18   → 막 입대한 신참, 훈련만 받음
//   이등병·삼등병·졸병         Lv.15~22   → 최하위 계급, 숫자가 무기
//   일등병·상등병              Lv.18~26   → 기초 전투 확립됨
//   병장·상사보               Lv.22~30   → 중견 사병, 팀내 역할 있음
//
//  【정규군 — 부사관】
//   하사·하사관               Lv.25~35   → 분대 지휘, 첫 리더십
//   중사                      Lv.30~40   → 소대 핵심, 전투 베테랑
//   상사·원사                  Lv.35~48   → 병사 중 최고, 사실상 전장 간부
//
//  【정규군 — 위관급 장교】
//   준위·소위                  Lv.35~45   → 갓 임관, 아직 실전 경험 얕음
//   중위                      Lv.40~52   → 소대장, 실전 경험 쌓이는 중
//   대위·기사                  Lv.45~60   → 중대장급, 개인 전투력도 높음
//
//  【정규군 — 영관급 장교】
//   소령·기사단원              Lv.52~65   → 대대 참모, 지휘+전투 겸비
//   중령·기사단 부단장         Lv.58~72   → 대대장, 상급 전투 엘리트
//   대령·기사단장보            Lv.65~80   → 연대장, 고위 전투 지휘관
//
//  【정규군 — 장성급·고위 지휘관】
//   준장·소장·기사단장         Lv.72~88   → 여단/사단급 지휘, 강력한 개인 전투력
//   중장·성기사단장            Lv.80~95   → 군단급 지휘, 전설적 전투 경험
//   대장·원수·최고사령관       Lv.90~110  → 국가 최고 군부, 영웅급 존재
//
//  【비정규·용병】
//   견습 용병·경비병            Lv.15~25   → 갓 시작한 용병, 경비 업무 수준
//   일반 용병·경비대            Lv.22~35   → 실전 경험 있는 용병
//   베테랑 용병·용병단원        Lv.32~48   → 여러 전장을 누빈 숙련자
//   용병 대장·용병단장          Lv.50~70   → 용병 집단의 수장, 개인도 강함
//
//  【귀족·성직자·마법사 계열】
//   견습 사제·수련사제           Lv.18~30
//   사제·성직자·마법 견습        Lv.28~42
//   기사 서임자·정규 기사        Lv.45~60
//   주교·남작·자작·마법사        Lv.55~70
//   백작·대마법사 견습           Lv.62~78
//   대주교·후작·공작·대마법사    Lv.72~92
//   왕·국왕·황제·교황           Lv.90~120
//
// getNpcAbsoluteLevel(rankText) 반환값: 해당 계급 범위 내 랜덤 레벨
const NPC_RANK_LEVEL_TABLE = [
  // ── 비전투 민간인 ──
  { kw:['노예','포로','거지','부랑자','걸인'],                          min: 3,  max: 10 },
  { kw:['농노','농부','평민','시민','일반인','주민','촌민','마을 사람'], min: 5,  max: 20 },
  { kw:['상인','행상','수공업자','직인','대장장이 견습','점원'],         min: 8,  max: 18 },
  { kw:['산적','현상금 사냥꾼','불량배 두목','갱단 부두목'],            min:18,  max: 30 },
  { kw:['도적','불량배','갱단원','악당','건달','무뢰한'],               min:12,  max: 22 },

  // ── 정규군 사병 ──
  { kw:['신병','훈련병','군 입문자'],                                   min:12,  max: 18 },
  { kw:['이등병','삼등병','졸병','최하 병사'],                          min:15,  max: 22 },
  { kw:['일등병','상등병'],                                             min:18,  max: 26 },
  { kw:['병장','상사보','선임 사병'],                                   min:22,  max: 30 },
  // 그냥 "병사·군인·보병·경비병"은 이등병~병장 혼재로 처리
  { kw:['보병','경비병','파수꾼','수비대원','수문장'],                   min:15,  max: 28 },
  { kw:['병사','군인'],                                                 min:15,  max: 25 },

  // ── 정규군 부사관 ──
  { kw:['상사','원사','주임원사'],                                      min:35,  max: 48 },
  { kw:['중사'],                                                        min:30,  max: 40 },
  { kw:['하사','하사관','분대장'],                                      min:25,  max: 35 },

  // ── 위관급 장교 ──
  { kw:['대위'],                                                        min:45,  max: 60 },
  { kw:['중위'],                                                        min:40,  max: 52 },
  { kw:['소위','준위'],                                                 min:35,  max: 45 },

  // ── 영관급 장교 ──
  { kw:['대령','기사단장보','연대장'],                                   min:65,  max: 80 },
  { kw:['중령','부단장','대대장'],                                      min:58,  max: 72 },
  { kw:['소령','대대 참모'],                                            min:52,  max: 65 },

  // ── 장성급·고위 지휘관 ──
  { kw:['원수','총사령관','최고사령관','총대장'],                        min:90,  max:110 },
  { kw:['대장','상급 장군','군 최고 지휘관'],                           min:85,  max:105 },
  { kw:['중장','성기사단장','군단장'],                                  min:80,  max: 95 },
  { kw:['소장','준장','사단장','여단장'],                               min:72,  max: 88 },
  // 그냥 "장군·사령관"은 소장~대장 혼재
  { kw:['장군','사령관'],                                               min:75,  max: 98 },

  // ── 용병 ──
  { kw:['용병단장','용병 대장'],                                        min:50,  max: 70 },
  { kw:['베테랑 용병','숙련 용병','용병단원'],                          min:32,  max: 48 },
  { kw:['용병','경비대','경비'],                                        min:22,  max: 35 },
  { kw:['견습 용병','신참 경비'],                                       min:15,  max: 25 },

  // ── 기사 계열 ──
  { kw:['기사단장','수석 기사','기사대장'],                             min:72,  max: 88 },
  { kw:['기사단 부단장','수석 부기사'],                                 min:62,  max: 78 },
  { kw:['기사단원','소속 기사'],                                        min:52,  max: 65 },
  { kw:['성기사','팔라딘','신성기사'],                                  min:55,  max: 70 },
  { kw:['기사'],                                                        min:45,  max: 60 },
  { kw:['종자','기사 견습','수련 기사'],                                min:25,  max: 38 },

  // ── 성직자·사제 ──
  { kw:['대주교','추기경'],                                             min:72,  max: 92 },
  { kw:['주교','고위 사제'],                                            min:55,  max: 72 },
  { kw:['사제','성직자'],                                               min:28,  max: 42 },
  { kw:['견습 사제','수련 사제','수도사'],                              min:18,  max: 30 },

  // ── 마법사 계열 ──
  { kw:['대마법사','대마도사','마법 원로'],                             min:72,  max: 92 },
  { kw:['마법사','마도사','위저드'],                                    min:30,  max: 52 },
  { kw:['마법 견습','마법사 수련생'],                                   min:15,  max: 28 },

  // ── 귀족 ──
  { kw:['황제','교황'],                                                 min:92,  max:120 },
  { kw:['왕','국왕'],                                                   min:90,  max:115 },
  { kw:['공작','대공'],                                                 min:75,  max: 92 },
  { kw:['후작'],                                                        min:68,  max: 85 },
  { kw:['백작'],                                                        min:62,  max: 78 },
  { kw:['자작'],                                                        min:55,  max: 70 },
  { kw:['남작'],                                                        min:48,  max: 62 },
];

function getNpcAbsoluteLevel(rankOrRoleText){
  const t = rankOrRoleText || '';
  for(const r of NPC_RANK_LEVEL_TABLE){
    if(r.kw.some(k=>t.includes(k))){
      return r.min + Math.floor(Math.random() * (r.max - r.min + 1));
    }
  }
  // 매칭 없으면 일반 시민 수준(Lv.8~15)
  return 8 + Math.floor(Math.random() * 8);
}
window.getNpcAbsoluteLevel = getNpcAbsoluteLevel;

// 역할(role/job 텍스트)에 따른 스탯 포커스 — 기존 직업 statFocus 체계와 동일한 키 사용
// 군인 계급별로 스탯 포커스 세분화: 사병=체력 중심, 장교=지휘+전투, 장성=지휘 압도
const NPC_ROLE_STAT_FOCUS = [
  // 고위 군 지휘관 — 지휘력·의지·체력
  { kw:['원수','총사령관','대장','중장','군단장','총대장'], focus:['ldr','wil','end'] },
  // 장성급 — 지휘+강인한 전투력
  { kw:['소장','준장','사단장','여단장','장군','사령관'],   focus:['ldr','str','end'] },
  // 영관급 장교 — 전술+전투
  { kw:['대령','중령','소령','연대장','대대장'],            focus:['str','ldr','end'] },
  // 위관급 장교·기사 — 전투 특화
  { kw:['대위','중위','소위','준위'],                       focus:['str','agi','end'] },
  // 부사관 — 체력·지구력 중심
  { kw:['상사','원사','중사','하사','분대장','하사관'],      focus:['end','str','per'] },
  // 사병 — 순수 체력
  { kw:['병장','일등병','상등병','이등병','병사','군인','보병','훈련병','신병'], focus:['end','str'] },
  // 경비·파수꾼 — 체력+인지
  { kw:['경비병','파수꾼','수비대원','수문장','경비'],       focus:['end','per'] },
  // 기사단장 — 지휘+전투 최강
  { kw:['기사단장','기사단 부단장','수석 기사'],             focus:['str','ldr','end'] },
  // 기사 계열 — 전투 특화
  { kw:['기사','성기사','팔라딘','신성기사','종자'],         focus:['str','end'] },
  // 용병 — 전투+민첩
  { kw:['용병단장','베테랑 용병','용병'],                    focus:['str','agi'] },
  // 마법사 계열
  { kw:['대마법사','마법사','마도사','위저드','마법 견습'],  focus:['mgc','int'] },
  // 성직자 계열
  { kw:['대주교','주교','사제','성직자','수도사'],           focus:['fath','wil'] },
  // 도적·암살자
  { kw:['도적','암살자','첩자','불량배','산적'],             focus:['agi','disg'] },
  // 궁수·사냥꾼
  { kw:['궁수','사냥꾼','저격수'],                          focus:['rng','per'] },
  // 상인·외교관
  { kw:['상인','외교관','행상'],                            focus:['neg','luk'] },
];

function getNpcStatFocus(roleText){
  const t = roleText || '';
  for(const r of NPC_ROLE_STAT_FOCUS){ if(r.kw.some(k=>t.includes(k))) return r.focus; }
  return ['str','end']; // 기본값
}
// statFocus에 맞는 스킬을 기존 BASE_JOBS/TIER2_JOBS 풀에서 1~2개 빌려와 부여
function pickNpcSkillsByFocus(focus){
  try{
    const pool = [...(typeof BASE_JOBS!=='undefined'?BASE_JOBS:[]), ...(typeof TIER2_JOBS!=='undefined'?TIER2_JOBS:[])];
    const matched = pool.filter(j=>j.statFocus && j.statFocus.some(s=>focus.includes(s)));
    const skills = [];
    matched.slice(0,2).forEach(j=>{ if(j.skills && j.skills[0]) skills.push(j.skills[0]); });
    return skills;
  }catch(e){ return []; }
}

// 신분/역할 정보로 NPC 전투 프로필(레벨·HP·공격력·방어력·스탯포커스·스킬) 산정
// ★ NPC 레벨은 플레이어 레벨과 무관한 고정 절대 레벨 체계를 사용.
//   일반 시민: Lv.5~20 / 일반 병사(최하위): Lv.15~25 / 기사급: Lv.30~50 등
//   단, 환생 회차(cycleMult)에 의한 HP/ATK 배율은 그대로 적용해 후반 긴장감 유지.
function buildHostileNpcProfile(npc, playerLevel, scaleMult){
  const rankText = (npc?.rank||'') + ' ' + (npc?.role||'');
  // 절대 레벨 산정 (플레이어 레벨 무시)
  const level = getNpcAbsoluteLevel(rankText);
  const focus = getNpcStatFocus(rankText);
  const hp  = Math.round((40 + level*9) * (scaleMult||1));
  const atk = Math.round((8 + level*1.6) * (scaleMult||1));
  const def = Math.max(1, Math.floor(level*0.45));
  const skills = pickNpcSkillsByFocus(focus);
  return { level, hp, atk, def, statFocus: focus, skills };
}
window.buildHostileNpcProfile = buildHostileNpcProfile;

function processNpcTurnsHostileGS(gs){
  if(!gs || !Array.isArray(gs.npc_turns_hostile)) return;
  try{
    const npcs = loadNPCs() || [];
    const monsters = loadMonsters() || [];
    const lv = (typeof loadPlayerLevel === 'function') ? (loadPlayerLevel() || 1) : 1;
    const _scale = (typeof getEnemyScaleMultiplier === 'function') ? getEnemyScaleMultiplier() : {cycleMult:1};

    gs.npc_turns_hostile.forEach(entry => {
      const name = typeof entry === 'string' ? entry : entry.name;
      const reason = typeof entry === 'object' ? (entry.reason||'') : '';
      if(!name) return;
      if(monsters.find(m => m.name===name && m.status==='alive')) return; // 이미 등록됨

      const npc = npcs.find(n => n.name === name);
      const profile = buildHostileNpcProfile(npc, lv, _scale.cycleMult||1);
      monsters.push({
        id: 'hostile_'+name+'_'+Date.now(),
        name, icon: npc?.icon || '👤',
        hp: profile.hp, maxHp: profile.hp,
        atk: profile.atk, def: profile.def,
        level: profile.level, statFocus: profile.statFocus, skills: profile.skills,
        status: 'alive', isBoss:false, isNamed:true, isGroup:false,
        fromExistingNpc: true,
      });

      // [데이터 누적] 이 NPC가 적대로 전환된 상황의 텍스트 패턴을 기록한다.
      // 누적되면 향후 detectExistingNpcTurnsHostile()이 비슷한 표현을
      // AI 출력 없이도 먼저 감지할 수 있게 하는 학습 데이터가 된다.
      try{
        const log = loadHostilePatternLog();
        log.push({ name, reason, turn: S.msgCount||0, role: npc?.role||'' });
        saveHostilePatternLog(log);
      }catch(e){}

      const skillNote = profile.skills?.[0] ? ` (${profile.skills[0].icon||''}${profile.skills[0].name})` : '';
      toast(`⚔️ ${name}이(가) 전투 상대로 전환됐다! Lv.${profile.level}${skillNote}`, 3000);
    });

    saveMonsters(monsters);
    if(typeof renderMonsters === 'function') renderMonsters();
  }catch(e){ console.warn('[processNpcTurnsHostileGS]', e); }
}
window.processNpcTurnsHostileGS = processNpcTurnsHostileGS;

// [데이터 누적형 보조 감지] AI가 매번 npc_turns_hostile을 정확히 출력
// 한다고 100% 보장할 수 없으므로, 누적된 패턴(reason 텍스트)에서 자주
// 나오는 키워드를 추출해 보조 정규식으로 활용한다. 사용 데이터가 쌓일수록
// 이 보조 감지의 정확도가 높아지고, 결과적으로 AI 의존도가 줄어든다.
function detectExistingNpcTurnsHostile(text){
  try{
    if(!text) return [];
    const log = loadHostilePatternLog();
    // 누적된 reason에서 공통적으로 등장하는 적대 행위 키워드를 동적으로 수집
    const learnedKeywords = new Set(['움켜쥐었다','밀치며','후려쳤다','으르렁','위협','협박','폭행','구타','채찍','매질','베었다','공격했다','찔렀다','휘둘렀다','맞섰다','달려들었다','후려갈겼다']);
    log.forEach(entry => {
      if(entry.reason){
        // 2글자 이상의 동사형 어미(~았다/~쳤다/~겼다 등)를 단순 추출해 학습 키워드로 누적
        const words = entry.reason.match(/[가-힣]{2,6}(?:았다|었다|렸다|쳤다|겼다)/g) || [];
        words.forEach(w => learnedKeywords.add(w));
      }
    });
    const npcs = loadNPCs() || [];
    const found = [];
    npcs.forEach(npc => {
      if(!text.includes(npc.name)) return;
      const nearbyText = text.slice(Math.max(0, text.indexOf(npc.name)-20), text.indexOf(npc.name)+40);
      if([...learnedKeywords].some(kw => nearbyText.includes(kw))){
        found.push(npc.name);
      }
    });
    return found;
  }catch(e){ return []; }
}
window.detectExistingNpcTurnsHostile = detectExistingNpcTurnsHostile;

// GS 처리 — enemy_incap(적 부상), enemy_captured(포로)
function processCombatIncapGS(gs) {
  if (!gs) return;

  // [신규] enemy_damage — 보스/네임드 등 "개별로 추적되는" 적이 일반
  // 공격으로 서서히 HP가 깎이는 경로. 기존에는 party_damage(동료),
  // summon_damage(소환수), monster_group_damage(잡몹 무리)는 있었지만
  // "보스/네임드 단일 개체가 맞는" 경로가 전혀 없어서, HP가 100%에서
  // 갑자기 0%(enemy_incap)로 뛰는 부자연스러운 흐름이었다 — 보스 HP바가
  // 한참 안 줄어들다 한 번에 사망 판정으로 가는 문제. 이제 매 공격마다
  // 점진적으로 HP를 깎을 수 있다.
  if (Array.isArray(gs.enemy_damage)) {
    try {
      const monsters = (typeof loadMonsters === 'function') ? (loadMonsters() || []) : [];
      let changed = false;
      gs.enemy_damage.forEach(entry => {
        if (!entry || !entry.name) return;
        const m = monsters.find(x => x.name && x.name.includes(String(entry.name).slice(0, 4)) && x.status === 'alive');
        if (!m) return;
        let dmg = Math.max(0, Number(entry.dmg) || 0);
        if (dmg <= 0) return;
        // [신규] 속성 상성 배율 실제 반영 — AI가 entry.element(예: "fire",
        // "light" 등 ELEMENT_DEFS 키)를 함께 보내면, 이 몬스터의
        // weakElement/resistElement/element와 대조해 실제 데미지 수치에
        // 배율을 곱한다. AFFINITY_TABLE·calcAffinityMod는 이미 완성돼
        // 있었지만 몬스터 쪽에 element 자체가 없어 실제로는 한 번도
        // 호출되지 않던 죽은 시스템이었다 — 이제 실제로 작동한다.
        let affinityInfo = null;
        if (entry.element && typeof calcMonsterDamageMultiplier === 'function') {
          affinityInfo = calcMonsterDamageMultiplier(entry.element, m);
          if (affinityInfo.mod !== 1.0) {
            const before = dmg;
            dmg = Math.round(dmg * affinityInfo.mod);
            toast(`${affinityInfo.mod > 1 ? '💥' : '🛡️'} ${affinityInfo.label} (${before}→${dmg})`, 2500);
          }
        }
        m.hp = Math.max(0, (m.hp || m.maxHp || 1) - dmg);
        changed = true;
        // [개선] 기존에는 HP가 0이 되어도 최소 1로 유지하며 AI가 별도로
        // enemy_incap을 보내야만 사망/부상 판정이 실행됐다 — AI가 이
        // 필드를 빠뜨리면 몬스터가 영원히 HP1로 죽지도 살지도 않는
        // 상태로 남는 버그가 있었다. 이제 HP가 0에 도달하는 바로 그
        // 순간 시스템이 자동으로 사망/부상 확률 판정을 실행한다.
        // (AI가 그래도 같은 턴에 enemy_incap을 보내면, 이미 status가
        // alive가 아니게 되어 그쪽 로직은 자연히 무시된다 — 중복 처리 방지.)
        if (m.hp <= 0) {
          const deathChance = m.isBoss ? 0.25 : m.isNamed ? 0.40 : 0.60;
          if (Math.random() < deathChance) {
            m.status = 'dead'; m.hp = 0;
            toast(`💀 ${m.name} 사망`, 2500);
            if (typeof claimBountyIfMatched==='function') claimBountyIfMatched(m.name);
            if (typeof autoDropLootOnDeath==='function') autoDropLootOnDeath(m);
          } else {
            m.status = 'incap';
            m.incapReason = '치명상';
            m.hp = Math.max(1, Math.round((m.maxHp || m.hp || 50) * 0.05));
            toast(`🩹 ${m.name} 부상 이탈`, 2500);
            if (!S._pendingCaptureList) S._pendingCaptureList = [];
            if (!S._pendingCaptureList.find(x => x.name === m.name)) {
              S._pendingCaptureList.push({
                name: m.name, icon: m.icon || '⚔️',
                role: m.role || m.name, faction: m.faction || '적',
                isBoss: !!m.isBoss, isNamed: !!m.isNamed, incapReason: '치명상',
              });
            }
          }
          // ── [신규] 종족/속성 기반 부활 판정 — 사망이든 부상이든 판정 직후
          //    1회 시도한다. 언데드 계열은 여기서 다시 일어설 수 있다. ──
          if (typeof tryReviveMonster === 'function' && tryReviveMonster(m)) {
            toast(`🌑 ${m.name}이(가) 다시 일어섰다!`, 3000);
          }
        }
        // [신규] 마법사형 — "MP 소진 시 현저히 약해짐"이라는 AI 힌트를
        // 시스템이 직접 보장. HP 30% 이하로 떨어지면(마나가 거의 다
        // 소모된 것으로 간주) 공격력을 1회 약화시킨다.
        if (m._behaviorId === 'mage' && !m._mageWeakened && m.hp <= (m.maxHp || 100) * 0.3) {
          m._mageWeakened = true;
          m.atk = Math.round((m.atk || 10) * 0.6);
          toast(`📉 ${m.name}의 마력이 고갈되어 약해졌다!`, 2500);
        }
      });
      if (changed) {
        if (typeof saveMonsters === 'function') saveMonsters(monsters);
        if (typeof renderMonsters === 'function') renderMonsters();
        // 보스 HP%가 바뀌었으니 즉시 페이즈 체크 — AI가 boss_hp_pct를
        // 따로 안 보내도 시스템이 직접 감지해 페이즈 전환을 보장한다.
        if (typeof autoCheckBossPhases === 'function') autoCheckBossPhases();
        // [버그 수정] 자동 사망/부상 판정으로 S._pendingCaptureList에
        // 부상당한 몬스터가 쌓여도, 이 호출이 없으면 포로화 UI가 뜨지
        // 않아 그 몬스터가 영원히 방치되는 문제가 있었다. enemy_incap의
        // 명시적 경로와 동일하게 루프 종료 후 반드시 호출해야 한다.
        if (typeof checkPostCombatCapture === 'function') checkPostCombatCapture();
      }
    } catch (e) { console.warn('[enemy_damage]', e); }
  }

  // 적 부상 이탈
  // ── enemy_incap — HP 0 도달 시 확률 사망 or 부상이탈 ──────
  // 보스 25% 사망, 네임드 40%, 잡몹 60% / 나머지는 부상이탈 대기
  if (Array.isArray(gs.enemy_incap)) {
    try {
      const _mon = (typeof loadMonsters === 'function') ? loadMonsters() : [];
      let _mc = false;
      gs.enemy_incap.forEach(entry => {
        const name    = typeof entry === 'string' ? entry : entry.name;
        const reason  = typeof entry === 'object' ? (entry.reason || '부상') : '부상';
        const forceDead = typeof entry === 'object' && entry.dead === true;
        const m = _mon.find(x => x.name && x.name.includes(String(name).slice(0,4)));
        if (!m || m.status !== 'alive') return;

        const deathChance = forceDead ? 1.0 : m.isBoss ? 0.25 : m.isNamed ? 0.40 : 0.60;
        if (Math.random() < deathChance) {
          m.status = 'dead'; m.hp = 0;
          toast(`💀 ${m.name} 사망`, 2500);
          // [신규] 결사 간부 사망 자동 추적 — getCabalBLSContext()가
          // cabalState[id+'_dead']를 읽지만 이를 기록하는 경로가 없어
          // 결사 간부가 전투로 죽어도 시스템이 영원히 모르던 문제.
          // 일반 적 사망 경로에서 죽은 이름이 결사 간부 이름과 일치하면
          // 자동으로 기록한다(별도 GS 필드 없이 기존 경로 재사용).
          try{
            if(typeof CABAL_OFFICERS!=='undefined'){
              const officer = CABAL_OFFICERS.find(o => m.name.includes(o.name.slice(0,2)));
              if(officer){
                const cs = loadCabalState();
                cs[officer.id+'_dead'] = true;
                saveCabalState(cs);
              }
            }
          }catch(e){}
          // [신규] 현상금 게시판 자동 수령 — 죽은 적이 게시판의
          // 수배자였다면 자동으로 현상금을 지급한다.
          if(typeof claimBountyIfMatched==='function') claimBountyIfMatched(m.name);
          if (typeof autoDropLootOnDeath==='function') autoDropLootOnDeath(m);
          // [신규] 용병단이 있으면 전투 기여로 경험치 획득 — 몬스터 등급별 차등
          if (typeof grantMercBandXp==='function') {
            const xpAmt = m.isBoss ? 12 : m.isNamed ? 6 : 3;
            grantMercBandXp(xpAmt);
          }
        } else {
          m.status = 'incap';
          m.incapReason = reason;
          m.hp = Math.max(1, Math.round((m.maxHp || m.hp || 50) * 0.05));
          toast(`🩹 ${m.name} 부상 이탈`, 2500);
          // 전투 후 처리 대기열
          if (!S._pendingCaptureList) S._pendingCaptureList = [];
          if (!S._pendingCaptureList.find(x => x.name === m.name)) {
            S._pendingCaptureList.push({
              name: m.name, icon: m.icon || '⚔️',
              role: m.role || m.name, faction: m.faction || '적',
              isBoss: !!m.isBoss, isNamed: !!m.isNamed, incapReason: reason,
            });
          }
        }
        _mc = true;

        // ── [신규] 종족/속성 기반 부활 판정 — 즉사(forceDead)는 확실한
        //    처치로 취급해 부활 판정을 건너뛴다. ──
        if (!forceDead && typeof tryReviveMonster === 'function' && tryReviveMonster(m)) {
          toast(`🌑 ${m.name}이(가) 다시 일어섰다!`, 3000);
        }
      });
      if (_mc && typeof saveMonsters === 'function') saveMonsters(_mon);
      if (typeof checkPostCombatCapture === 'function') checkPostCombatCapture();
    } catch(e) { console.warn('[enemy_incap]', e); }
  }

  // 포로 획득
  if (Array.isArray(gs.enemy_captured)) {
    try {
      const monsters = (typeof loadMonsters === 'function') ? loadMonsters() : [];
      let changed = false;
      gs.enemy_captured.forEach(entry => {
        const name = typeof entry === 'string' ? entry : entry.name;
        const info = typeof entry === 'object' ? entry : {};
        const m = monsters.find(x => x.name && x.name.includes(String(name).slice(0,4)));
        if (m) {
          m.status = 'captured';
          changed  = true;
          addPrisoner(name, {
            icon:    m.icon    || info.icon    || '⚔️',
            role:    m.role    || info.role    || m.name,
            faction: m.faction || info.faction || '적',
            desc:    info.desc || '',
          });
        } else {
          // 몬스터 목록에 없어도 포로 등록 (네임드 NPC 포로)
          addPrisoner(name, { icon: info.icon || '👤', role: info.role || '포로', faction: info.faction || '적', desc: info.desc || '' });
        }
      });
      if (changed && typeof saveMonsters === 'function') saveMonsters(monsters);
    } catch(e) {}
  }

  // 포로 상태 변경 (심문 결과 등)
  if (gs.prisoner_update) {
    const pu = gs.prisoner_update;
    const list = loadPrisoners();
    const p = list.find(x => x.name && x.name.includes(String(pu.name || '').slice(0,4)));
    if (p) {
      if (pu.condition) p.condition = pu.condition;
      if (pu.canRecruit !== undefined) p.canRecruit = pu.canRecruit;
      if (pu.info)      p.info = pu.info;
      savePrisoners(list);
      if (pu.canRecruit) toast(`💡 ${p.name} 영입 가능 상태`, 3000);
    }
  }
}
window.processCombatIncapGS = processCombatIncapGS;




// ══════════════════════════════════════════════════════════════
//  🩸 권속 관리 패널
// ══════════════════════════════════════════════════════════════
function renderThrallManagerPanel() {
  const body = document.getElementById('pb-thrall-manager');
  if (!body) return;
  const d       = (typeof loadThrallData === 'function') ? loadThrallData() : { thralls:[], bloodPoints:0, lordStage:0, domainInfluence:{} };
  const thralls = d.thralls || [];
  const stage   = (typeof THRALL_LORD_STAGES!=='undefined') ? THRALL_LORD_STAGES[d.lordStage||0] : null;
  const nextStg = (typeof THRALL_LORD_STAGES!=='undefined') ? THRALL_LORD_STAGES[(d.lordStage||0)+1] : null;
  const softCap = stage ? stage.thrallSlots : 2;
  const pct     = nextStg ? Math.min(100, Math.round(((d.bloodPoints||0)-(stage?.threshold||0)) / ((nextStg.threshold||1)-(stage?.threshold||0))*100)) : 100;

  let h = `<div style="padding:10px 12px;background:linear-gradient(135deg,#0d0008,#180010);border-bottom:1px solid #2a0018">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <span style="font-size:18px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stage,{size:14}):(stage?.icon||'🩸')}</span>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:12px;color:#c03060">${stage?.name||'입문자'}</div>
        <div style="font-size:8px;color:#603040">${stage?.desc||''}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;color:#803050">혈통 ${d.bloodPoints||0}pts</div>
        <div style="font-size:8px;color:#502030">권속 ${thralls.length}명</div>
      </div>
    </div>
    <div style="background:#1a000a;border-radius:2px;height:4px;margin-bottom:2px">
      <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#5a0020,#c03060);border-radius:2px"></div>
    </div>
    <div style="font-size:8px;color:#502030;display:flex;justify-content:space-between">
      <span>소프트캡:${softCap}명${thralls.length>softCap?' <span style=color:#e03050>초과</span>':''}</span>
      <span>${nextStg?nextStg.threshold+'pts까지 '+(nextStg.threshold-(d.bloodPoints||0))+'pts':'최고 단계'}</span>
    </div>
  </div>
  <div style="display:flex;border-bottom:1px solid #2a0018;background:#0d0008">
    <button onclick="thrallTab('list')" id="ttab-list" style="flex:1;padding:7px 4px;background:#1a000a;border:none;color:#c03060;font-size:9px;cursor:pointer;font-family:'Cinzel',serif;border-right:1px solid #2a0018">목록(${thralls.length})</button>
    <button onclick="thrallTab('deploy')" id="ttab-deploy" style="flex:1;padding:7px 4px;background:none;border:none;color:#603040;font-size:9px;cursor:pointer;font-family:'Cinzel',serif;border-right:1px solid #2a0018">파견·전투</button>
    <button onclick="thrallTab('domain')" id="ttab-domain" style="flex:1;padding:7px 4px;background:none;border:none;color:#603040;font-size:9px;cursor:pointer;font-family:'Cinzel',serif;border-right:1px solid #2a0018">혈통 영역</button>
    <button onclick="thrallTab('buildings')" id="ttab-buildings" style="flex:1;padding:7px 4px;background:none;border:none;color:#603040;font-size:9px;cursor:pointer;font-family:'Cinzel',serif">건물</button>
  </div>
  <div id="thrall-tab-content" style="padding:10px 12px"></div>`;
  body.innerHTML = h;
  thrallTab('list');
}
window.renderThrallManagerPanel = renderThrallManagerPanel;

function thrallTab(tab) {
  ['list','deploy','domain','buildings'].forEach(t=>{
    const b=document.getElementById('ttab-'+t);
    if(!b)return;
    b.style.background=t===tab?'#1a000a':'none';
    b.style.color=t===tab?'#c03060':'#603040';
  });
  const c=document.getElementById('thrall-tab-content');
  if(!c)return;
  const d=(typeof loadThrallData==='function')?loadThrallData():{thralls:[],domainInfluence:{}};
  const thralls=d.thralls||[];

  if(tab==='list'){
    if(!thralls.length){ c.innerHTML='<div style="text-align:center;padding:24px;color:#3a1020;font-size:10px"><div style="font-size:28px;margin-bottom:8px;opacity:.3">🩸</div>아직 권속이 없다.<br><span style="font-size:8px">흡혈·계약·서약으로 만들어라.</span></div>'; return; }
    c.innerHTML=thralls.map((t,i)=>{
      const rd=(typeof THRALL_RANKS!=='undefined')?THRALL_RANKS[t.rankIdx||0]:null;
      const lc=t.loyalty>70?'#60c060':t.loyalty>40?'#c0a040':'#c04040';
      const nextT=(typeof THRALL_RANKS!=='undefined')?THRALL_RANKS[Math.min((t.rankIdx||0)+1,9)]:null;
      return `<div style="background:#0a0005;border:1px solid #2a0018;border-radius:2px;padding:10px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
          <span style="font-size:15px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(t,{size:15}):(t.icon||"⚔️")}</span>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Cinzel',serif;font-size:11px;color:#e03060">${t.name}</div>
            <div style="font-size:8px;color:#603040">${t.rank} · ${t.type}</div>
          </div>
          <div style="text-align:right;font-size:8px">
            <div style="color:${lc}">충성 ${t.loyalty||0}</div>
            ${t.deployedBattle?'<div style="color:#e06040">⚔️전투</div>':t.isDeployed?`<div style="color:#4080c0">📍${t.deployedAt||''}</div>`:'<div style="color:#403040">🏠대기</div>'}
          </div>
        </div>
        <div style="background:#0d0008;border-radius:2px;height:3px;margin-bottom:5px">
          <div style="width:${t.loyalty||0}%;height:100%;background:linear-gradient(90deg,#5a0020,${lc});border-radius:2px"></div>
        </div>
        <div style="font-size:8px;color:#3a1020;margin-bottom:6px">단계 ${t.rankIdx||0}/9 · ${t.rankPoints||0}pts${nextT?' / '+nextT.threshold+'pts까지':''}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${!t.deployedBattle
            ?`<button onclick="thrallAction('battle',${i})" style="padding:3px 7px;background:#1a0005;border:1px solid #5a1020;color:#e03060;font-size:8px;cursor:pointer;border-radius:2px">⚔️전투</button>`
            :`<button onclick="thrallAction('recall',${i})" style="padding:3px 7px;background:#0a0a00;border:1px solid #2a2000;color:#a0a040;font-size:8px;cursor:pointer;border-radius:2px">↩️해제</button>`}
          <button onclick="thrallAction('deploy',${i})" style="padding:3px 7px;background:#00050d;border:1px solid #1a2a50;color:#4080c0;font-size:8px;cursor:pointer;border-radius:2px">📍파견</button>
          <button onclick="thrallAction('mission',${i})" style="padding:3px 7px;background:#050a00;border:1px solid #1a3000;color:#608030;font-size:8px;cursor:pointer;border-radius:2px">📋임무</button>
          <button onclick="thrallAction('reward',${i})" style="padding:3px 7px;background:#0a0900;border:1px solid #2a2000;color:#a08030;font-size:8px;cursor:pointer;border-radius:2px">💛포상</button>
          <button onclick="thrallAction('release',${i})" style="padding:3px 7px;background:#050000;border:1px solid #200000;color:#604040;font-size:8px;cursor:pointer;border-radius:2px">🔓해방</button>
        </div>
      </div>`;
    }).join('');
  } else if(tab==='deploy'){
    const inB=thralls.filter(t=>t.deployedBattle);
    const dep=thralls.filter(t=>t.isDeployed&&!t.deployedBattle);
    const std=thralls.filter(t=>!t.isDeployed&&!t.deployedBattle);
    c.innerHTML=`
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#803040;margin-bottom:6px">⚔️ 전투 참전 (${inB.length})</div>
      ${inB.map(t=>`<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:#100005;border:1px solid #3a0015;border-radius:2px;margin-bottom:4px">
        <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(t,{size:16}):(t.icon||"⚔️")}</span><span style="flex:1;font-size:10px;color:#e03060">${t.name}</span>
        <span style="font-size:8px;color:#e06040">⚔️전투중</span>
        <button onclick="dismissThrallFromBattle('${t.name}');renderThrallManagerPanel()" style="padding:2px 6px;background:#0a0a00;border:1px solid #2a2000;color:#a0a040;font-size:8px;cursor:pointer;border-radius:2px">해제</button>
      </div>`).join('')||'<div style="font-size:9px;color:#3a1020;padding:2px 0 8px">없음</div>'}
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#4060c0;margin:10px 0 6px">📍 도시 파견 (${dep.length})</div>
      ${dep.map(t=>`<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:#000510;border:1px solid #0a1a40;border-radius:2px;margin-bottom:4px">
        <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(t,{size:16}):(t.icon||"⚔️")}</span><span style="flex:1;font-size:10px;color:#4080c0">${t.name}</span>
        <span style="font-size:8px;color:#203060">${t.deployedAt||''}</span>
        <button onclick="deployThrall('${t.name}',null);renderThrallManagerPanel()" style="padding:2px 6px;background:#050000;border:1px solid #200000;color:#604040;font-size:8px;cursor:pointer;border-radius:2px">귀환</button>
      </div>`).join('')||'<div style="font-size:9px;color:#3a1020;padding:2px 0 8px">없음</div>'}
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#603040;margin:10px 0 6px">🏠 대기 (${std.length})</div>
      ${std.map(t=>`<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:#0a0005;border:1px solid #1a0010;border-radius:2px;margin-bottom:4px">
        <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(t,{size:16}):(t.icon||"⚔️")}</span><span style="flex:1;font-size:10px;color:#803040">${t.name} <span style="color:#3a1020;font-size:8px">(${t.rank})</span></span>
        <button onclick="callThrallToBattle('${t.name}');renderThrallManagerPanel()" style="padding:2px 6px;background:#1a0005;border:1px solid #5a1020;color:#e03060;font-size:8px;cursor:pointer;border-radius:2px">⚔️소환</button>
      </div>`).join('')||'<div style="font-size:9px;color:#3a1020;padding:2px">없음</div>'}`;
  } else if(tab==='domain'){
    const infl=Object.entries(d.domainInfluence||{}).sort((a,b)=>b[1]-a[1]);
    c.innerHTML=infl.length?infl.map(([loc,val])=>`<div style="padding:8px;background:#0a0005;border:1px solid #2a0018;border-radius:2px;margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px">
        <span style="font-size:10px;color:#c03060">${loc}</span><span style="font-size:9px;color:#803040">영향력 ${val}%</span>
      </div>
      <div style="background:#0d0008;border-radius:2px;height:4px">
        <div style="width:${val}%;height:100%;background:linear-gradient(90deg,#3a0015,#c03060);border-radius:2px"></div>
      </div>
      <div style="font-size:8px;color:#3a1020;margin-top:3px">파견: ${(thralls).filter(t=>t.deployedAt===loc).map(t=>t.name).join(', ')||'없음'}</div>
    </div>`).join(''):'<div style="font-size:9px;color:#3a1020">혈통 영향권 없음<br><span style="font-size:8px">권속을 도시에 파견하면 영향력이 쌓인다.</span></div>';
  } else {
    // 건물 탭 — THRALL_BUILDINGS 건설/업그레이드
    if(typeof THRALL_BUILDINGS==='undefined'){ c.innerHTML='<div style="font-size:9px;color:#3a1020">건물 시스템을 불러올 수 없습니다.</div>'; return; }
    const builtMap = d.buildings || {};
    c.innerHTML = `<div style="font-size:9px;color:#803040;margin-bottom:8px">혈점(Blood Points) 보유: ${d.bloodPoints||0}pt</div>` +
      Object.values(THRALL_BUILDINGS).map(b=>{
        const curLv = builtMap[b.id]||0;
        const nextCost = b.cost * (curLv+1);
        const maxed = curLv>=b.maxLevel;
        const eff = b.effect(curLv+1);
        const effText = Object.entries(eff).map(([k,v])=>`${k} +${v}`).join(', ');
        return `<div style="padding:8px;background:#0a0005;border:1px solid #2a0018;border-radius:2px;margin-bottom:6px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
            <span style="font-size:10px;color:#c03060">${typeof getEntityIconHTML==='function'?getEntityIconHTML(b,{size:10}):(b.icon)} ${esc(b.name)} ${curLv>0?`Lv.${curLv}/${b.maxLevel}`:''}</span>
            ${!maxed?`<button onclick="if(typeof buildThrallBuilding==='function'){buildThrallBuilding('${b.id}');renderThrallManagerPanel();thrallTab('buildings');}" style="padding:3px 8px;font-size:8px;background:#1a0005;border:1px solid #5a1020;color:#e03060;cursor:pointer;border-radius:2px">${curLv>0?'강화':'건설'} (${nextCost}pt)</button>`:'<span style="font-size:8px;color:#5a2030">최대</span>'}
          </div>
          <div style="font-size:8px;color:#3a1020">${esc(b.desc)}</div>
          ${curLv>0?`<div style="font-size:8px;color:#803040;margin-top:2px">현재 효과: ${effText}</div>`:''}
        </div>`;
      }).join('');
  }
}
window.thrallTab = thrallTab;

// THRALL_BUILDINGS 건설/업그레이드 실행
function buildThrallBuilding(buildingId){
  try{
    if(typeof loadThrallData!=='function' || typeof THRALL_BUILDINGS==='undefined') return;
    const b = THRALL_BUILDINGS[buildingId];
    if(!b) return;
    const d = loadThrallData();
    d.buildings = d.buildings || {};
    const curLv = d.buildings[buildingId]||0;
    if(curLv>=b.maxLevel){ toast('이미 최대 레벨입니다'); return; }
    const cost = b.cost * (curLv+1);
    if((d.bloodPoints||0) < cost){ toast(`혈점 부족 (필요 ${cost}pt)`); return; }
    d.bloodPoints -= cost;
    d.buildings[buildingId] = curLv+1;
    if(typeof saveThrallData==='function') saveThrallData(d);
    toast(`${b.name} ${curLv>0?'강화':'건설'} 완료 (Lv.${curLv+1})`, 3500, b);
    const hint = b.aiHint ? b.aiHint(curLv+1) : '';
    if(hint) S._nextInjectedContext = (S._nextInjectedContext||'') + `\n\n[🩸 권속 건물] ${hint}`;
  }catch(e){ console.warn('[buildThrallBuilding]', e); }
}
window.buildThrallBuilding = buildThrallBuilding;

function thrallAction(action, idx) {
  const d=(typeof loadThrallData==='function')?loadThrallData():{thralls:[]};
  const t=d.thralls[idx]; if(!t)return;
  if(action==='battle'){ callThrallToBattle(t.name); renderThrallManagerPanel(); }
  else if(action==='recall'){ dismissThrallFromBattle(t.name); toast('↩️ '+t.name+' 해제',2000); renderThrallManagerPanel(); }
  else if(action==='deploy'){
    const loc=prompt(t.name+'을(를) 파견할 도시명:');
    if(loc&&loc.trim()){ deployThrall(t.name,loc.trim()); renderThrallManagerPanel(); }
  } else if(action==='mission'){
    const ms=prompt(t.name+'에게 부여할 임무:');
    if(ms&&ms.trim()){ S._nextInjectedContext=(S._nextInjectedContext||'')+'\n[📋 권속 임무] '+t.name+'('+t.rank+')에게 임무가 부여됐다: "'+ms.trim()+'". 다음 응답에서 이 임무 서사를 포함하라.'; toast('📋 '+t.name+' 임무 부여',2500); }
  } else if(action==='reward'){ rewardThrall(t.name,20,'포상'); renderThrallManagerPanel(); }
  else if(action==='release'){
    if(!confirm(t.name+'을(를) 해방하시겠습니까?'))return;
    d.thralls.splice(idx,1); saveThrallData(d);
    toast('🔓 '+t.name+' 해방',2500);
    S._nextInjectedContext=(S._nextInjectedContext||'')+'\n[🔓 권속 해방] '+t.name+'이(가) 해방됐다. 서사에 반영하라.';
    renderThrallManagerPanel();
  }
}
window.thrallAction = thrallAction;

// ── 권속 전투 소환/해제 ──────────────────────────────────────
function callThrallToBattle(thrallName) {
  const d = loadThrallData();
  const t = d.thralls.find(x => x.name === thrallName);
  if (!t) { toast('해당 권속을 찾을 수 없습니다', 2000); return; }
  if (t.loyalty <= 0) { toast(`${t.name} — 충성도 없음`, 2000); return; }
  t.deployedBattle = true;
  saveThrallData(d);
  toast(`⚔️ ${t.name}(${t.rank}) 전투 참전!`, 3000);
  S._nextInjectedContext = (S._nextInjectedContext||'')
    + `
[⚔️ 권속 참전] ${t.name}(${t.rank})이(가) 전투에 참여했다. 군주의 명에 따라 싸우는 장면을 묘사하라. 등급에 맞는 전투력으로 활약한다.`;
}
window.callThrallToBattle = callThrallToBattle;

function dismissThrallFromBattle(thrallName) {
  const d = loadThrallData();
  const t = d.thralls.find(x => x.name === thrallName);
  if (t) { t.deployedBattle = false; saveThrallData(d); }
}
window.dismissThrallFromBattle = dismissThrallFromBattle;

// 권속 전투 중 피해/사망 GS 처리
function processThrallBattleGS(gs) {
  if (!gs) return;
  // thrall_damage — 전투 중 권속 피해
  if (Array.isArray(gs.thrall_damage)) {
    const d = loadThrallData();
    gs.thrall_damage.forEach(entry => {
      const name = typeof entry === 'string' ? entry : entry.name;
      const dmg  = typeof entry === 'object' ? (entry.dmg || 10) : 10;
      const t = d.thralls.find(x => x.name && x.name.includes(String(name).slice(0,4)));
      if (t) {
        t.loyalty = Math.max(0, (t.loyalty||80) - Math.floor(dmg / 10));
        toast(`🩸 ${name} 부상 (충성 -${Math.floor(dmg/10)})`, 2000);
      }
    });
    saveThrallData(d);
  }
  // thrall_incap — 권속 전투불능
  if (Array.isArray(gs.thrall_incap)) {
    const d = loadThrallData();
    gs.thrall_incap.forEach(entry => {
      const name      = typeof entry === 'string' ? entry : entry.name;
      const forceDead = typeof entry === 'object' && entry.dead === true;
      const t = d.thralls.find(x => x.name && x.name.includes(String(name).slice(0,4)));
      if (!t) return;
      // 권속 사망 확률: 등급 높을수록 낮음 (9단계는 거의 안 죽음)
      const baseDeathChance = Math.max(0.05, 0.50 - (t.rankIdx||0) * 0.05);
      if (forceDead || Math.random() < baseDeathChance) {
        t.deployedBattle = false;
        d.thralls = d.thralls.filter(x => x.name !== t.name);
        toast(`💀 ${t.name} 전투 중 소멸`, 4000);
        S._nextInjectedContext = (S._nextInjectedContext||'')
          + `
[💀 권속 소멸] ${t.name}(${t.rank})이(가) 전투 중 소멸했다. 군주와의 유대가 끊기는 장면을 묘사하라.`;
      } else {
        t.deployedBattle = false;
        t.loyalty = Math.max(10, (t.loyalty||80) - 15);
        toast(`🩸 ${t.name} 전투 이탈 (부상)`, 3000);
      }
    });
    saveThrallData(d);
  }
}
window.processThrallBattleGS = processThrallBattleGS;

// ══════════════════════════════════════════════════════════════
//  ⚔️ 전투 종료 후 포로 처리 UI
// ══════════════════════════════════════════════════════════════

function checkPostCombatCapture() {
  if (!S._pendingCaptureList || !S._pendingCaptureList.length) return;
  try {
    const alive = (typeof loadMonsters === 'function' ? loadMonsters() : [])
      .filter(m => m.status === 'alive');
    if (alive.length > 0) return;
  } catch(e) {}
  // [BUG FIX] triggerAfterBattleChoice가 호출처가 전혀 없어 전투 후 처리 방식
  // (자비/처형/영입/심문/석방) 선택지를 AI가 서사로 제시하도록 유도하는 GS 지시가
  // 절대 발동하지 않던 버그. 시스템 UI(showPostCombatCaptureUI)와 병행해
  // AI에게도 동일한 맥락의 선택지를 서사로 제시하도록 지시.
  try {
    if (typeof triggerAfterBattleChoice === 'function' && S._pendingCaptureList.length) {
      const first = S._pendingCaptureList[0];
      triggerAfterBattleChoice(first.name, true);
    }
  } catch(e) {}
  showPostCombatCaptureUI(S._pendingCaptureList.slice());
  S._pendingCaptureList = [];
}
window.checkPostCombatCapture = checkPostCombatCapture;

function showPostCombatCaptureUI(list) {
  if (!list || !list.length) return;
  const old = document.getElementById('post-combat-capture-modal');
  if (old) old.remove();
  const modal = document.createElement('div');
  modal.id = 'post-combat-capture-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;';
  const rows = list.map((e, i) => {
    const rankTag = e.isBoss ? '🔴보스' : e.isNamed ? '🟡네임드' : '⬜잡몹';
    return `<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:#0a0a0a;border:1px solid #2a2a2a;border-radius:3px;margin-bottom:8px">
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;color:#ccc;font-family:'Cinzel',serif">${typeof getEntityIconHTML==='function'?getEntityIconHTML(e,{size:12}):(e.icon)} ${e.name} <span style="font-size:9px;color:#666">${rankTag} · ${e.faction}</span></div>
        <div style="font-size:9px;color:#666;margin-top:2px">${e.incapReason}</div>
      </div>
      <button onclick="handleCaptureChoice(${i},'capture')" style="padding:6px 12px;background:#0a1a0a;border:1px solid #2a5a2a;color:#60c060;font-size:10px;cursor:pointer;border-radius:2px;white-space:nowrap">⛓️ 포로</button>
      <button onclick="handleCaptureChoice(${i},'execute')" style="padding:6px 12px;background:#1a0a0a;border:1px solid #5a2a2a;color:#c06060;font-size:10px;cursor:pointer;border-radius:2px;white-space:nowrap">💀 처형</button>
    </div>`;
  }).join('');
  modal.innerHTML = `<div style="background:#0f0f0f;border:1px solid #3a3a3a;border-radius:4px;width:min(96vw,440px);max-height:80vh;overflow-y:auto;padding:20px">
    <div style="font-family:'Cinzel',serif;font-size:14px;color:#c8a96e;margin-bottom:4px;text-align:center">⚔️ 전투 종료 — 쓰러진 적 처리</div>
    <div style="font-size:9px;color:#666;text-align:center;margin-bottom:16px">부상으로 이탈한 적들입니다.</div>
    <div id="capture-list">${rows}</div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button onclick="handleCaptureAll('capture')" style="flex:1;padding:8px;background:#0a1a0a;border:1px solid #2a5a2a;color:#60c060;font-size:10px;cursor:pointer;border-radius:2px">⛓️ 전원 포로</button>
      <button onclick="handleCaptureAll('execute')" style="flex:1;padding:8px;background:#1a0a0a;border:1px solid #5a2a2a;color:#c06060;font-size:10px;cursor:pointer;border-radius:2px">💀 전원 처형</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  modal._captureList = list;
  modal._processed = new Array(list.length).fill(false);
}
window.showPostCombatCaptureUI = showPostCombatCaptureUI;

function handleCaptureChoice(idx, action) {
  const modal = document.getElementById('post-combat-capture-modal');
  if (!modal || !modal._captureList) return;
  const entry = modal._captureList[idx];
  if (!entry || modal._processed[idx]) return;
  modal._processed[idx] = true;
  if (action === 'capture') {
    addPrisoner(entry.name, entry);
  } else {
    try {
      const mon = (typeof loadMonsters === 'function') ? loadMonsters() : [];
      const m = mon.find(x => x.name && x.name.includes(String(entry.name).slice(0,4)));
      if (m) { m.status = 'dead'; m.hp = 0; if (typeof saveMonsters === 'function') saveMonsters(mon); }
    } catch(e) {}
    toast('💀 ' + entry.name + ' 처형', 2000);
    S._nextInjectedContext = (S._nextInjectedContext || '') + '\n[💀 처형] ' + entry.name + '이(가) 처형됐다.';
  }
  const rows = modal.querySelectorAll('#capture-list > div');
  if (rows[idx]) { rows[idx].style.opacity = '0.35'; rows[idx].querySelectorAll('button').forEach(b => b.disabled = true); }
  if (modal._processed.every(Boolean)) setTimeout(() => modal.remove(), 600);
}
window.handleCaptureChoice = handleCaptureChoice;

function handleCaptureAll(action) {
  const modal = document.getElementById('post-combat-capture-modal');
  if (!modal || !modal._captureList) return;
  modal._captureList.forEach((_, i) => handleCaptureChoice(i, action));
}
window.handleCaptureAll = handleCaptureAll;

  // ── party_incap — 전투불능(부상·기절·탈락, 사망 아님) ──────
  // ── party_incap — 시스템 확률 판정 ──────────────────────
  // 동료(NPC): 부상 70% / 사망 30%
  // 소환수:    부상 50% / 사망 50%
  // 이미 incap 상태에서 재피격: 사망 확률 2배
  // forceDead:true → 100% 사망
  if (Array.isArray(gs.party_incap)) {
    const _party = (typeof loadParty === 'function') ? loadParty() : [];
    const _npcs  = (typeof loadNPCs  === 'function') ? loadNPCs()  : [];
    gs.party_incap.forEach(entry => {
      const name      = typeof entry === 'string' ? entry : entry.name;
      const reason    = typeof entry === 'object' ? (entry.reason || '부상') : '부상';
      const turns     = typeof entry === 'object' ? (entry.turns  || 2)     : 2;
      const forceDead = typeof entry === 'object' && entry.dead === true;
      const member    = _party.find(m => m.name && m.name.includes(String(name).slice(0,4)));
      if (!member) return;

      const alreadyIncap = !!member.incapUntilTurn;
      const baseDeathChance = 0.30;
      let deathChance = forceDead ? 1.0 : (alreadyIncap ? Math.min(0.80, baseDeathChance * 2) : baseDeathChance);

      // ── 불사의 온기 개입 ──
      // 「hq_undying_warmth」 히든 퀘스트(치유사 전용) 완료로 얻는 영구 칭호
      // healer_undying_warmth를 보유한 플레이어는, 동료가 사망 판정에 걸릴 때
      // 낮은 확률로 자동 개입해 사망을 막는다. 즉사기(forceDead)는 존중해
      // 개입하지 않는다 — 밸런스를 깨지 않는 "구원의 손길"이지 무적 방패가 아니다.
      let undyingWarmthTriggered = false;
      if(!forceDead && typeof loadTitles==='function'){
        const ownedTitleIds = loadTitles().map(t=>t.id);
        if(ownedTitleIds.includes('healer_undying_warmth') && Math.random() < 0.25){
          deathChance = 0; // 이번엔 사망 판정 자체를 건너뛰고 부상으로 전환
          undyingWarmthTriggered = true;
        }
      }

      if (Math.random() < deathChance) {
        // 사망 처리 — party_death 로직 재사용
        member.alive = false;
        member.hp    = 0;
        toast(`💀 ${member.name} 전투 중 사망!`, 4000);
        S._nextInjectedContext = (S._nextInjectedContext || '')
          + `
[💀 동료 전사] ${member.name}이(가) ${reason}(으)로 전사했다. 동료의 죽음을 서사적으로 비중있게 묘사하라.`;
        // NPC 사망 처리
        try {
          const npc = _npcs.find(n => n.name && n.name.includes(String(name).slice(0,4)));
          if (npc) {
            npc.status = 'dead'; npc.hp = 0;
            const gr = (typeof loadGrief==='function') ? loadGrief() : {lostOnes:[],total:0};
            gr.lostOnes = gr.lostOnes||[]; gr.total=(gr.total||0)+1;
            if(!gr.lostOnes.find(x=>x.name===npc.name)) gr.lostOnes.push({name:npc.name,turn:S.msgCount||0});
            if(typeof saveGrief==='function') saveGrief(gr);
            if(typeof saveNPCs==='function') saveNPCs(_npcs);
            if(typeof pmUpdateNpc==='function') pmUpdateNpc(npc.name, {event:`전투 중 사망(T${S.msgCount||0})`});
            try {
              const pmD = pmLoad('npc');
              if(pmD[npc.name]){pmD[npc.name].deceased=true; pmD[npc.name].deceasedTurn=S.msgCount||0; pmSave('npc',pmD);}
            }catch(e){}
          }
        } catch(e) {}
        // 파티에서 제거
        const idx = _party.indexOf(member);
        if (idx >= 0) _party.splice(idx, 1);
      } else {
        // 부상 이탈
        member.alive          = false;
        member.incapReason    = reason;
        member.incapUntilTurn = (S.msgCount||0) + turns;
        member.hp             = Math.max(1, Math.round((member.maxHp||100) * 0.05));
        if(undyingWarmthTriggered){
          toast(`🕯️ 불사의 온기가 ${member.name}을(를) 지켜냈다! (원래는 치명적이었다)`, 4500);
          S._nextInjectedContext = (S._nextInjectedContext||'')
            + `
[🕯️ 불사의 온기] ${member.name}이(가) 목숨을 잃을 뻔한 순간, 알 수 없는 따뜻한 기운이 상처를 감쌌다. 셀레네에게 전수받은 절박한 의술이 저도 모르게 발동해 목숨을 붙잡아냈다 — 그 기적 같은 순간을 짧게 묘사하라. ${member.name}은 ${reason}(으)로 ${turns}턴간 전투에서 이탈한다.`;
        } else {
          toast(`🩹 ${member.name} 부상 이탈 — ${reason} (${turns}턴)`, 3500);
          S._nextInjectedContext = (S._nextInjectedContext||'')
            + `
[🩹 부상 이탈] ${member.name}이(가) ${reason}(으)로 전투에서 이탈했다. ${turns}턴 후 회복. 의식이 흐릿하거나 부상으로 쓰러진 상태로 묘사하라.`;
        }
      }
    });
    if (typeof saveParty === 'function') saveParty(_party);
    // [B71 FIX] "마지막 남은 자" 히든 업적(파티 전멸 후 생존) 트래킹 —
    // 파티원이 1명 이상 있었는데 이번 처리 후 전원이 alive!==true가
    // 됐고, 정작 플레이어 본인은 살아있다면 전멸로 판정.
    try{
      if (_party.length && _party.every(m => m.alive===false) && (S.stats?.hp||0) > 0 && typeof window.updateStats==='function') {
        window.updateStats('partyWipeCount', 1);
      }
    }catch(e){}
  }

  // ── summon_incap — 소환수 확률 판정 ──────────────────────
  // 소환수: 부상 50% / 소멸 50%
  if (Array.isArray(gs.summon_incap)) {
    try {
      const _summons = (typeof window.loadSummons==='function') ? window.loadSummons() : (S.summons||[]);
      gs.summon_incap.forEach(entry => {
        const name      = typeof entry === 'string' ? entry : entry.name;
        const turns     = typeof entry === 'object' ? (entry.turns || 3) : 3;
        const forceDead = typeof entry === 'object' && entry.dead === true;
        const s = _summons.find(x => x.name && x.name.includes(String(name).slice(0,4)));
        if (!s) return;
        const alreadyIncap  = !!s.incapUntilTurn;
        const deathChance   = forceDead ? 1.0 : (alreadyIncap ? 0.90 : 0.50);
        if (Math.random() < deathChance) {
          s.status = 'dead'; s.alive = false;
          toast(`💀 ${s.name} 소환수 소멸`, 3000);
          S._nextInjectedContext = (S._nextInjectedContext||'')
            + `
[💀 소환수 소멸] ${s.name}이(가) 소멸했다. 서사에서 자연스럽게 묘사하라.`;
        } else {
          s.alive = false;
          s.incapUntilTurn = (S.msgCount||0) + turns;
          s.hp = Math.max(1, Math.round((s.maxHp||100) * 0.1));
          toast(`⚡ ${s.name} 소환수 부상 이탈 (${turns}턴)`, 3000);
        }
      });
      if (typeof window.saveSummons==='function') window.saveSummons(_summons);
    } catch(e) {}
  }

  if (Array.isArray(gs.party_death) && gs.party_death.length) {
    // [B22 FIX 보조] 벚꽃 엔딩의 "동료를 한 명도 잃지 않음" 조건 판정을 위해
    // 이번 회차에 동료 사망이 있었는지 추적.
    S._companionDiedThisLoop = true;
  }
  if (Array.isArray(gs.party_death)) {
    const npcs = (typeof loadNPCs === 'function' ? loadNPCs() : []) || [];
    gs.party_death.forEach(name => {
      if (!name) return;
      const npc = npcs.find(n => n.name && n.name.includes(String(name).slice(0, 4)));
      if (npc) {
        npc.status = 'dead';
        npc.hp = 0;
        toast(`💀 ${npc.name} 사망`, 3500);
        // [B71 FIX] "목격자" 히든 업적(NPC 죽음 3회 목격) 트래킹
        if (typeof window.updateStats==='function') window.updateStats('npcDeathWitnessed', 1);
        // [신규] 단기 감정 잔상 — 기존 Grief 시스템(누적 슬픔 수치, 영구적
        // 스탯 보정)과는 별개로, "방금 일어난 충격적 사건" 자체를 짧게
        // 추적한다. 동료 사망 같은 사건 직후 몇 턴은 평범한 대화로 바로
        // 돌아가는 게 부자연스러우므로, 그 기간 동안만 AI에게 짧은
        // 감정 잔상 가이드를 준다.
        if(typeof setRecentShock==='function') setRecentShock('동료 ' + npc.name + '의 죽음', S?.msgCount||0);
        // 슬픔 기록
        const gr = (typeof loadGrief === 'function' ? loadGrief() : { lostOnes: [], total: 0 });
        gr.lostOnes = gr.lostOnes || [];
        gr.total = (gr.total || 0) + 1;
        if (!gr.lostOnes.find(x => x.name === npc.name)) {
          gr.lostOnes.push({ name: npc.name, turn: S.msgCount || 0 });
        }
        if (typeof saveGrief === 'function') saveGrief(gr);
        // 배신 기록이 아닌 상실 기록
        if (typeof addButterflyEffect === 'function') {
          addButterflyEffect({ desc: `${npc.name} 사망`, impact: 4, worldChange: '동료를 잃었다' });
        }
        if (typeof earnTearCrystal === 'function') earnTearCrystal(npc.name+'을(를) 잃은 슬픔', S.scenario?.id);
        if (typeof earnTimeToken === 'function') earnTimeToken('tragic_sacrifice');
        // pm-npc 사망 기록 — AI가 사망한 NPC를 다시 등장시키지 않도록
        if (typeof pmUpdateNpc === 'function') {
          pmUpdateNpc(npc.name, { event: `사망 (T${S.msgCount||0})` });
          try {
            var _pmD = pmLoad('npc');
            if (_pmD[npc.name]) {
              _pmD[npc.name].deceased = true;
              _pmD[npc.name].deceasedTurn = S.msgCount || 0;
              pmSave('npc', _pmD);
            }
          } catch(e) {}
        }
      }
    });
    if (typeof saveNPCs === 'function') saveNPCs(npcs);
  }

  // ── 전투 부상/포로 GS 처리 ──────────────────────────────────
  if((gs.thrall_damage||gs.thrall_incap) && typeof processThrallBattleGS==='function'){
    processThrallBattleGS(gs);
  }
  // [BUG FIX] elemTabooViolation/shiftElemRestraint가 함수는 완성돼 있으나
  // AI에게 트리거 방법을 알려주는 GS 필드/프롬프트 규칙이 전혀 없어 원소인의
  // 금기 위반·원소 폭발 시스템 절반이 죽어있던 버그.
  if(gs.elem_taboo && typeof elemTabooViolation==='function'){
    elemTabooViolation(gs.elem_taboo);
  }
  if(gs.elem_restraint !== undefined && typeof shiftElemRestraint==='function'){
    shiftElemRestraint(Number(gs.elem_restraint)||0);
  }
  // [B29 FIX] 원소인의 "공명도"를 깎는 경로(elem_taboo)는 있지만 올리는
  // 경로는 유료 회복 수단뿐이라, "원소 관련 행동을 하면 서사적으로
  // 자연스럽게 공명도가 쌓인다"는 UI 안내와 달리 실제로는 GS로 절대
  // 획득할 수 없던 버그. 드래곤혈(dragon_awaken)과 동일한 패턴으로 GS
  // 필드를 추가한다.
  if(gs.elem_gain && typeof gainElemResonance==='function'){
    gainElemResonance('narrative', Math.max(1, Math.min(30, Number(gs.elem_gain)||15)));
  }

  // ── 드래곤혈 종족 GS 처리 ───────────────────────────────────
  // [BUG FIX] gainDragonAwakenPoints/gainDragonHoard/gainDragonFragment/
  // shiftDragonBalance/setDragonBloodline 5개 함수 전부 정의만 있고 외부에서
  // 단 한 번도 호출되지 않아 드래곤혈 종족의 핵심 시스템(혈통 각성·고룡 유산
  // 발굴·용심 균형·보물 집착·각성의 대가)이 전부 죽어있던 버그.
  if(gs.dragon_awaken && typeof gainDragonAwakenPoints==='function'){
    gainDragonAwakenPoints(gs.dragon_awaken);
  }
  if(gs.dragon_hoard && typeof gainDragonHoard==='function'){
    const ht = typeof gs.dragon_hoard==='object' ? gs.dragon_hoard.type : gs.dragon_hoard;
    const amt = typeof gs.dragon_hoard==='object' ? gs.dragon_hoard.amount : undefined;
    gainDragonHoard(ht, amt);
  }
  if(gs.dragon_fragment && typeof gainDragonFragment==='function'){
    gainDragonFragment(gs.dragon_fragment);
  }
  if(gs.dragon_balance !== undefined && typeof shiftDragonBalance==='function'){
    shiftDragonBalance(Number(gs.dragon_balance)||0);
  }
  if(gs.dragon_bloodline !== undefined && typeof setDragonBloodline==='function'){
    setDragonBloodline(Number(gs.dragon_bloodline));
  }

  // ── 퀘스트 선택 기록 GS 처리 ────────────────────────────────
  // [BUG FIX] recordQuestChoice가 호출처가 전혀 없어 퀘스트 선택 이력 BLS
  // (41196줄에서 활용)가 항상 빈 데이터였던 버그. AI가 분기형 퀘스트에서
  // 플레이어의 선택과 결과를 명시할 때 사용.
  if(gs.quest_choice && typeof recordQuestChoice==='function'){
    const qcq = gs.quest_choice;
    recordQuestChoice(qcq.questId||qcq.quest||'unknown', qcq.choice||'', qcq.outcome||'');
  }

  // ── 동료 신뢰도 GS 처리 ─────────────────────────────────────
  // [BUG FIX] updateCompanionTrust가 window export는 있었지만 트리거가
  // 전혀 없어 동료 신뢰도(trustLevel)가 항상 초기값(30)에 고정돼 있던 버그.
  if(gs.companion_trust !== undefined && typeof updateCompanionTrust==='function'){
    updateCompanionTrust(Number(gs.companion_trust)||0);
  }

  // ── 히든 퀘스트 완료 GS 처리 ─────────────────────────────────
  // [BUG FIX] completeHiddenQuest 함수는 정의만 있고 실제 호출 트리거가
  // 어디에도 없어, HIDDEN_QUEST_POOL의 모든 히든 퀘스트(태초의 화로 포함)가
  // activate까지만 되고 영원히 완료 처리될 수 없던 구조적 결함. AI가 서사
  // 안에서 히든 퀘스트를 실제로 완결지으면 이 필드를 출력해야 한다.
  if(Array.isArray(gs.hidden_quest_done) && typeof completeHiddenQuest==='function'){
    gs.hidden_quest_done.forEach(id=>{ try{ completeHiddenQuest(id); }catch(e){} });
  }

  // ── 학자 연구 행동 GS 처리 ───────────────────────────────────
  // 학자 히든 퀘스트 「금서의 무게」(진 엔딩으로 가는 첫 관문)의 조건
  // 추적용. AI가 서사 안에서 주인공이 실제로 조사·연구·해독 행위를 했다고
  // 판단하면 이 필드를 출력한다 — 다른 여섯 직업의 원정 카운트(채광,
  // 이야기 채집 등)와 대칭되는 학자만의 진행도 지표.
  if(gs.research_action !== undefined && typeof loadScholarResearchLog==='function' && typeof saveScholarResearchLog==='function'){
    const rl = loadScholarResearchLog();
    rl.count = (rl.count||0) + (Number(gs.research_action)||1);
    saveScholarResearchLog(rl);
  }

  // ── 장비 정체성 부조화 GS 처리 ──────────────────────────────
  // 서사적 극적 순간(강제로 저주받은 무기를 쥠, 참회 의식으로 정화 등)에
  // AI가 직접 부조화 수치를 조정할 수 있게 하는 보조 수단. 평상시에는
  // recalcItemDissonance()가 장착 상태 기반으로 자동 계산하므로, 이 필드는
  // "장비와 무관한 서사적 사건"으로 정체성이 흔들리거나 회복될 때만 사용.
  if(gs.item_dissonance !== undefined && typeof loadItemDissonance==='function' && typeof saveItemDissonance==='function'){
    const cur = loadItemDissonance();
    saveItemDissonance(cur + Number(gs.item_dissonance||0));
    if(typeof applyDissonanceStatEffect==='function') applyDissonanceStatEffect();
  }

  // ── 엘프 망각 GS 처리 ───────────────────────────────────────
  // [BUG FIX] triggerElfForgetting이 정의만 있고 호출처가 전혀 없어
  // 엘프의 "기억 봉인/망각" 패널티 이벤트가 절대 발생하지 않던 버그.
  // 강력한 저주·정신 공격·자발적 봉인 등 서사에서 기억을 잃는 사건 발생 시 사용.
  if(gs.elf_forget && typeof triggerElfForgetting==='function'){
    const amt = typeof gs.elf_forget==='object' ? (gs.elf_forget.amount||50) : 50;
    const npc = typeof gs.elf_forget==='object' ? gs.elf_forget.npc : null;
    triggerElfForgetting(amt, npc);
  }
  if((gs.enemy_incap||gs.enemy_captured||gs.prisoner_update||gs.enemy_damage) && typeof processCombatIncapGS==='function'){
    processCombatIncapGS(gs);
  }
  // [신규] 기존 NPC가 전투 상대로 전환되는 상황 처리
  if(gs.npc_turns_hostile && typeof processNpcTurnsHostileGS==='function'){
    processNpcTurnsHostileGS(gs);
  }

  // ── 권속 시스템 GS 처리 ─────────────────────────────────────
  if((gs.blood_record||gs.fear_record||gs.chronicle_points) && typeof processVampireChronicleGS==='function'){
    processVampireChronicleGS(gs);
  }
  if((gs.npc_thrall||gs.thrall_rankup||gs.blood_points||gs.thrall_revolt) && typeof processThrallGS==='function'){
    processThrallGS(gs);
  }

  // ── party_join/party_leave — AI 서사에서 동료 합류/이탈이 결정되면 실제 파티에 반영 ──
  // [버그 수정] 프롬프트는 이 필드를 출력하라고 지시하지만, 실제로 파티에
  // 반영하는 코드가 없어서 AI가 "동료가 됐다"고 서술해도 게임 데이터(파티 목록)는
  // 전혀 바뀌지 않던 문제. UI 영입 버튼(recruitNpcToParty)의 조건부 로직과는
  // 별개로, 이미 서사로 확정된 사실이므로 조건 체크 없이 가볍게 반영한다.
  if(gs.party_join && typeof gs.party_join === 'string'){
    try{
      const jName = gs.party_join;
      const party = loadParty();
      if(!party.find(p=>p.name===jName) && party.length < 8){
        const npcs = (typeof loadNPCs==='function') ? loadNPCs() : [];
        const jNpc = npcs.find(n=>n.name===jName) || {name:jName, icon:'👤', role:'동료'};
        party.push({
          name: jNpc.name, icon: jNpc.icon||'👤', role: jNpc.role||'동료',
          type: 'story_joined', typeLabel:'동료',
          relationship: jNpc.relationship||50,
          personality: jNpc.personality||'',
          statBonus:{}, battleRole:'balanced',
          joinedAt: new Date().toISOString(), joinTurn: S.msgCount||0,
          alive:true, mood:'neutral', trustLevel:50, hp:100, maxHp:100,
        });
        saveParty(party);
        if(typeof applyPartyBonus==='function') applyPartyBonus();
        toast(`👥 ${jName}이(가) 동료가 되었다!`, 3000);
      }
    }catch(e){ console.warn('[party_join GS 처리 오류]', e); }
  }
  if(gs.party_leave && typeof gs.party_leave === 'string'){
    try{
      const lName = gs.party_leave;
      const party = loadParty();
      if(party.find(p=>p.name===lName)){
        saveParty(party.filter(p=>p.name!==lName));
        if(typeof applyPartyBonus==='function') applyPartyBonus();
        toast(`👋 ${lName}이(가) 파티를 떠났다.`, 3000);
      }
    }catch(e){ console.warn('[party_leave GS 처리 오류]', e); }
  }

  // ── [신규] AI가 새로 만든 스킬을 표준 effects 스키마로 정식 등록 ──
  if(gs.skill_define && typeof processSkillDefineGS==='function'){
    processSkillDefineGS(gs);
  }

  // ── [신규] AI가 특정 몬스터에게 부활 능력을 명시적으로 부여 ──
  if(gs.enemy_revival_grant && typeof processEnemyRevivalGrantGS==='function'){
    processEnemyRevivalGrantGS(gs);
  }

  // ── npc_revive — AI가 부활 서사를 쓴 뒤 GS로 알림 ────────────
  if(gs.npc_revive){
    const rName    = typeof gs.npc_revive === 'string' ? gs.npc_revive : gs.npc_revive.name;
    const rType    = (typeof gs.npc_revive === 'object' && gs.npc_revive.type) || 'undead';
    if(rName && typeof recruitDeadNpcToParty === 'function'){
      const _npcs  = (typeof loadNPCs==='function' ? loadNPCs() : []) || [];
      const _party = (typeof loadParty==='function' ? loadParty() : []) || [];
      const _npc   = _npcs.find(n=>n.name && n.name.includes(String(rName).slice(0,4)));
      if(_npc) recruitDeadNpcToParty(rName, rType, _npc, _party, _npcs);
    }
  }

  // ── 잡몹 무리 시스템 (생성/피해/전멸) ───────────────────────
  // [CRITICAL BUG FIX] 기존엔 3가지 문제가 있었음:
  //  ① 무리를 "생성"하는 GS 필드가 전혀 없어 AI가 "잡몹 무리가 나타났다"고
  //     서술해도 시스템상 아무것도 등록되지 않음 (HP 표시 불가)
  //  ② monster_group_damage가 AI 지시문(객체 {icon,name,dmg})과 실제 처리
  //     코드(Number()로 숫자만 기대)가 어긋나 항상 NaN→0으로 무시됨
  //  ③ monster_group_wipe가 선언만 있고 처리 코드가 0줄이었음
  // 이제 잡몹 무리도 loadMonsters() 시스템에 진짜로 등록되고 HP가 추적된다.

  // ① 무리 생성 — AI가 잡몹 무리 등장을 서술할 때
  if (gs.monster_group_spawn && typeof loadMonsters === 'function' && typeof saveMonsters === 'function') {
    try {
      const spawn = gs.monster_group_spawn;
      const count = Math.max(1, Number(spawn.count) || 3);
      // [밸런스 수정 v2] 이름 키워드 기반 티어 테이블로 기본 스탯 결정.
      //   플레이어 레벨 비례(15+lv*3 등) 완전 제거 → 80레벨에 늑대 600HP 문제 해결.
      //   AI가 hp/atk를 직접 지정하면 그 값 우선, 없으면 티어 테이블 기본값 사용.
      //   회차(cycleMult)는 그대로 곱해 후반 긴장감 유지.
      const _scale = (typeof getEnemyScaleMultiplier==='function') ? getEnemyScaleMultiplier() : {cycleMult:1};
      const _tier  = getMonsterTierStats(spawn.name || '');
      // [F-BUG 수정] dangerMult(장소 위험도 배율) 반영 — AI가 hp/atk를
      // 직접 지정하지 않고 티어 테이블 기본값을 쓰는 경우에도 장소
      // 위험도가 강도에 실제로 영향을 주도록 한다.
      const _dangerM2 = _scale.dangerMult || 1;
      const hpEach  = Math.round(Math.max(10, Number(spawn.hp)  || _tier.hp)  * _scale.cycleMult * _dangerM2);
      const atkEach = Math.round(Math.max(1,  Number(spawn.atk) || _tier.atk) * _scale.cycleMult * _dangerM2);
      const defEach = Math.max(0,  Number(spawn.def) || _tier.def);
      const monsters = loadMonsters() || [];
      const groupId = 'group_' + (spawn.name || '잡몹') + '_' + Date.now();
      // [밸런스 재수정] 공격력을 마리 수만큼 그대로 선형 합산(×count)하면
      // 늑대 13마리 같은 대규모 무리는 한 턴에 플레이어 HP를 통째로 날릴
      // 수 있는 즉사급 위협이 됨 — 막거나 피할 기회 자체가 사라지는 밸런스
      // 붕괴. 마리 수가 늘수록 개체당 효율이 줄어드는 제곱근 스케일 적용:
      //   3마리:  공격력 ×√3(≈1.7)   13마리: 공격력 ×√13(≈3.6)
      // (선형이면 ×3, ×13이었던 것과 비교해 대규모 무리일수록 완화 효과가 큼)
      // HP는 "많을수록 오래 버틴다"가 자연스러우므로 그대로 선형 유지.
      const atkMultiplier = Math.sqrt(count);
      monsters.push({
        id: groupId,
        name: `${spawn.name || '잡몹'} 무리×${count}`,
        icon: spawn.icon || '👹',
        hp: hpEach * count, maxHp: hpEach * count,
        count, hpEach,
        atk: Math.round(atkEach * atkMultiplier), atkEach,
        def: defEach,
        status: 'alive', isBoss: false, isNamed: false, isGroup: true,
        // [신규] 속성/약점/저항/스킬/특성 저장
        element: _tier.element, weakElement: _tier.weakElement,
        resistElement: _tier.resistElement, skills: _tier.skills, trait: _tier.trait,
      });
      saveMonsters(monsters);
      if (typeof renderMonsters === 'function') renderMonsters();
    } catch(e) { console.warn('[monster_group_spawn]', e); }
  }

  // ② 무리에게 가한 피해 + 플레이어가 받은 피해 (양방향)
  if (gs.monster_group_damage) {
    try {
      const gd = gs.monster_group_damage;
      // 무리를 먼저 찾는다 — [버그 수정] 기존엔 dmgToPlayer(AI가 즉흥
      // 판단한 숫자)를 그대로 썼는데, 바로 아래서 계산되는 group.atk가
      // 이미 정확한 무리 공격력인데도 안 쓰이고 있었다. 이제 group.atk를
      // 실제 플레이어 피해 계산의 기준으로 삼는다(enemy_attacks와 동일한
      // 원칙 — AI는 무리가 공격했다는 사실만 전달, 숫자는 시스템 결정).
      let group = null;
      if (typeof loadMonsters === 'function' && typeof saveMonsters === 'function') {
        const monsters = loadMonsters() || [];
        group = monsters.find(m => m.isGroup && m.status === 'alive' &&
          (!gd.name || (m.name||'').includes(String((typeof gd === 'object' ? gd.name : '')||'').slice(0,4))));

        // 무리가 입은 피해 (플레이어가 무리를 공격 — 이건 AI의 전투 판정이
        // 필요한 영역이라 dmg 필드를 그대로 유지)
        if (group && typeof gd === 'object' && gd.dmg) {
          group.hp = Math.max(0, (group.hp || 0) - (Number(gd.dmg) || 0));
          // [밸런스 수정] 무리 HP가 줄어들수록(개체가 죽어나갈수록) 남은
          // 마리 수를 재계산해 공격력도 같이 줄인다. 안 그러면 전멸 직전의
          // 마지막 한 마리도 풀 무리 공격력을 그대로 내는 비현실적 상황이 됨.
          if (group.hpEach > 0) {
            const remainingCount = Math.max(0, Math.ceil(group.hp / group.hpEach));
            group.count = remainingCount;
            // [밸런스 수정] 생성 시점과 동일한 제곱근 스케일 적용 — 마리 수가
            // 줄어들수록 공격력도 같은 완화 곡선으로 줄어야 일관성이 있음
            group.atk = Math.round((group.atkEach || 1) * Math.sqrt(Math.max(1, remainingCount)));
          }
          if (group.hp <= 0) group.status = 'dead';
        }
        if (group) { saveMonsters(monsters); if (typeof renderMonsters === 'function') renderMonsters(); }
      }

      // 플레이어가 받은 피해 — AI가 낸 dmgToPlayer는 더 이상 참고하지
      // 않고, 무리의 실제 atk(방금 갱신된 값)를 기준으로 시스템이 계산.
      // 무리를 못 찾았을 때만 calcAllyAttackDamage와 동일한 방식의
      // 안전한 폴백을 쓴다.
      const wasAttack = (typeof gd === 'object' ? (gd.dmgToPlayer !== undefined) : (gd !== undefined));
      if (S.stats && wasAttack) {
        const groupAtk = group ? (group.atk || 0) : getActiveEnemyAtk();
        const variance = 0.85 + Math.random() * 0.3;
        const dmgToPlayer = Math.max(1, Math.round(groupAtk * variance));
        S.stats.hp = Math.max(0, (S.stats.hp || 100) - dmgToPlayer);
        S._tookDamageThisCombat = true; // [B67 FIX] "무상처 전사" 도전 과제용 플래그
      }
      if (typeof window.updateHeader === 'function') window.updateHeader();
      if (typeof saveSession === 'function') saveSession();
    } catch(e) { console.warn('[monster_group_damage]', e); }
  }

  // ③ 무리 전멸 처리
  if (gs.monster_group_wipe && typeof loadMonsters === 'function' && typeof saveMonsters === 'function') {
    try {
      const monsters = loadMonsters() || [];
      let changed = false;
      monsters.forEach(m => {
        if (m.isGroup && m.status === 'alive') { m.hp = 0; m.status = 'dead'; changed = true; }
      });
      if (changed) {
        saveMonsters(monsters);
        if (typeof renderMonsters === 'function') renderMonsters();
        if (typeof checkPostCombatCapture === 'function') checkPostCombatCapture();
      }
    } catch(e) { console.warn('[monster_group_wipe]', e); }
  }

  // ── 배신 기록 [v49 ⑧] ───────────────────────────────────────
  if (gs.betrayal) {
    try {
      const bt = (typeof loadBetrayals === 'function' ? loadBetrayals() : []) || [];
      const entry = typeof gs.betrayal === 'string'
        ? { target: gs.betrayal, reason: '플레이어가 배신', turn: S.msgCount || 0, desc: gs.betrayal_desc || '' }
        : { ...gs.betrayal, turn: S.msgCount || 0 };
      if (!bt.find(x => x.target === entry.target)) {
        bt.push(entry);
        if (typeof saveBetrayals === 'function') saveBetrayals(bt);
        else if (typeof lsSet === 'function') lsSet('tf-betrayals', JSON.stringify(bt));
        toast(`⚠️ 배신 기록: ${entry.target}`, 2500);
        // [신규] 배신도 충격적 사건이므로 단기 감정 잔상 적용
        if(typeof setRecentShock==='function') setRecentShock(entry.target + '에 대한 배신', S?.msgCount||0);
        if(typeof recordSin==='function') recordSin('betrayal', entry.target, S.scenario?.id);
        if((S.msgCount||0)<=15 && typeof recordChildhoodTrauma==='function') recordChildhoodTrauma('betrayed', S.scenario?.id);
        if (typeof addButterflyEffect === 'function') {
          addButterflyEffect({ desc: `${entry.target} 배신`, impact: 5, worldChange: '신뢰가 깨졌다', major: true });
        }
      }
    } catch(e) {}
  }
  // betrayed_by — 누군가에게 배신당함
  if (gs.betrayed_by) {
    try {
      const bt = (typeof loadBetrayals === 'function' ? loadBetrayals() : []) || [];
      bt.push({ target: gs.betrayed_by, reason: '플레이어가 배신당함', byPlayer: false, turn: S.msgCount || 0 });
      if (typeof saveBetrayals === 'function') saveBetrayals(bt);
      else if (typeof lsSet === 'function') lsSet('tf-betrayals', JSON.stringify(bt));
      toast(`🗡️ ${gs.betrayed_by}에게 배신당했다!`, 3000);
      if(typeof sealMemory==='function') sealMemory('betrayal_pain', S.scenario?.id);
      // 원한 추가
      // [B11 FIX] addGrudge(name, power, scenario)는 3개 개별 인자를 받는데
      // 객체 하나를 name 자리에 통째로 전달해 저장된 name 필드가 "[object
      // Object]"로 AI 프롬프트에 그대로 노출되던 버그.
      if (typeof addGrudge === 'function') addGrudge(gs.betrayed_by, 3, S.scenario?.id);
    } catch(e) {}
  }

  // ── materials (재료 획득) ──────────────────────────────────
  if (gs.materials && typeof gs.materials === 'object') {
    Object.entries(gs.materials).forEach(([matId, count]) => {
      const n = Math.max(1, parseInt(count) || 1);
      if (MATERIALS[matId]) {
        addMaterial(matId, n);
      } else {
        // 동적 재료 (MATERIALS에 없는 커스텀 재료)
        const dynMats = loadDynMaterials();
        if (!dynMats[matId]) {
          dynMats[matId] = { name: matId, icon: '🪨', desc: 'AI가 생성한 재료' };
          saveDynMaterials(dynMats);
        }
        const bag = loadMaterials();
        bag[matId] = (bag[matId] || 0) + n;
        saveMaterials(bag);
        const mat = dynMats[matId];
        toast(`${mat.name} ×${n} 획득!`, 2000, mat);
      }
    });
  }

  // ── 나머지는 processGSToAllDBs로 위임 ─────────────────────
  window.processGSToAllDBs(gs);
}
window.processGSBlock = processGSBlock;
}

