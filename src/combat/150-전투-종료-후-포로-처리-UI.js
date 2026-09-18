// ⚔️ 전투 종료 후 포로 처리 UI
// Auto-extracted from taleforge.html (original section banner preserved above).
import { checkWorldEventTriggers } from '../ai-prompt/148-⑨-GS-DB-자동-파싱-모든-GS-필드-처리.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { SEAL_DEFINITIONS } from '../data/155-⑭-메모리-패널-UI.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { completeMainQuest } from '../job/042-직업-시스템-무한-파생-도감.js';
import { addButterflyEffect, addMetaKnowledge, loadTraumas, recordTrauma, saveTraumas } from '../misc/015-시스템-1120.js';
import { addGrudge, addTimeEcho, recordCurse } from '../misc/016-2130번-시스템.js';
import { loadParty } from '../misc/054-이동수단-시스템.js';
import { addEvent } from '../misc/142-③-사건-DB-태그-인덱스-전문-검색.js';
import { updatePlayerDB } from '../misc/144-⑤-플레이어-상태-DB.js';
import { updateChallenge } from '../misc/164-도전-과제-달성률-시스템.js';
import { handleCaravanEvolve, handleMercEvolve } from '../misc/251-통합-처리-함수-매-AI-응답-후-호출.js';
import { processFactionSecretResolved } from '../npc/067-③-NPC-관계망-시스템.js';
import { upsertNpc } from '../npc/140-①-NPC-DB-가장-세분화.js';
import { upsertRelation } from '../npc/143-④-관계-DB-NPC-간-관계망.js';
import { addNpcDialog } from '../npc/146-⑦-대화-DB-NPC별-실제-대화-전문-보존.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { loadTimeTokens, useTimeToken } from '../progression/018-5170번-환생-누적-시스템.js';
import { loadCausality, saveCausality } from '../progression/019-71100번-환생-누적-시스템.js';
import { awakenLoopAwareness, loadMentalCorruption, saveMentalCorruption } from '../progression/020-101130번-환생-누적-시스템.js';
import { addSummon, giveSummonExp, handleSummonDialogGS, handleSummonEvolve } from '../progression/089-칭호-시스템-완전판-1개-활성화-스탯-효과-적용.js';
import { processArrestOutcome, processJailEscapeAttempt, renderMonsters } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { getQuest, upsertQuest } from '../quest/141-②-퀘스트-DB.js';
import { changeReligionShare } from '../religion/092-3-지역-종교-점유율-조회수정.js';
import { convertNpc } from '../religion/094-5-플레이어-종교-귀속-교화.js';
import { autoCheckBossPhases } from '../ui/155-⑭-메모리-패널-UI.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { advanceNpcStoryStage } from '../world/055-5대륙-왕국-시스템.js';
import { updateWorldDB } from '../world/145-⑥-세계-상태-DB.js';

function processGSToAllDBs(gs){
  if(!gs) return;
  const t = S.msgCount||0;

  // ══════════════════════════════════════════════════════════════
  //  ⚔️ 명시적 전투 상태 판단 — combat_state [신규]
  //  기존엔 cleanText에서 "전투/싸움/공격" 같은 키워드를 사후적으로
  //  추측하는 방식뿐이었다. 이는 "쇠사슬로 묶는다", "기습한다" 같은
  //  명백한 전투 개시 행동을 인식하지 못하는 사각지대를 만들었다.
  //  AI가 매 응답마다 명시적으로 combat_state를 출력하도록 하고,
  //  시스템은 그 값을 최우선으로 신뢰한다(텍스트 키워드 추측은 폴백).
  //  동시에 (입력 패턴 → combat_state) 사례를 누적 학습시켜, 점차
  //  AI 의존 없이 시스템이 먼저 판단할 수 있는 데이터를 쌓는다.
  // ══════════════════════════════════════════════════════════════
  if(typeof gs.combat_state === 'string'){
    const prevState = S._inCombat;
    if(gs.combat_state === 'start' || gs.combat_state === 'ongoing'){
      if(!prevState) S._tookDamageThisCombat = false; // [B67 FIX] 새 전투 시작 시 무상처 플래그 초기화
      // [B71 FIX] "최초의 피" 히든 업적(첫 행동이 전투) 트래킹 — 게임 시작 직후
      // 첫 AI 응답(msgCount<=1)에서 전투가 시작된 경우에만 기록.
      if(gs.combat_state === 'start' && (S.msgCount||0) <= 1 && typeof window.updateStats==='function'){
        window.updateStats('firstActionWasBattle', 1, 'max');
      }
      S._inCombat = true;
    } else if(gs.combat_state === 'end' || gs.combat_state === 'none'){
      // [B67 FIX] "무상처 전사" 도전 과제 — 전투가 끝났고(직전까지 전투 중이었고)
      // 이번 전투에서 한 번도 피해를 입지 않았다면 무상처 승리로 카운트한다.
      if(prevState && !S._tookDamageThisCombat && typeof updateChallenge==='function'){
        const ndw = (parseInt(lsGet('tf-no-damage-wins-count')||'0',10)||0) + 1;
        lsSet('tf-no-damage-wins-count', String(ndw));
        updateChallenge('no_damage_wins', ndw);
      }
      S._inCombat = false;
    }
    // 학습 데이터 누적 — 이번 턴의 사용자 입력과 AI의 명시적 판단을 함께 저장
    try{
      const userMsgForLearning = (window._lastUserMsgForCombatLearning || '');
      // [20차 감사 FIX] prevState는 boolean(S._inCombat)인데 gs.combat_state는
      // 'start'/'ongoing'/'end'/'none' 문자열이라, 타입이 달라 이 비교는 항상
      // true였다 — 즉 "상태가 실제로 바뀐 턴만 기록"하려던 의도와 달리 전투
      // 중인 모든 턴(예: 'ongoing'이 계속 나오는 매 턴)이 전환 사례처럼 학습
      // 버퍼(최근 200건)에 누적되어, 정작 유의미한 상태 전환 경계 데이터가
      // 반복된 동일 상태 데이터에 밀려나던 문제였다. boolean 전환 여부로
      // 비교하도록 교정한다.
      const isCombatNow = (gs.combat_state === 'start' || gs.combat_state === 'ongoing');
      if(userMsgForLearning && isCombatNow !== !!prevState){
        const learned = JSON.parse(lsGet('tf-combat-learn-data')||'[]');
        learned.push({ text: userMsgForLearning.slice(0,80), state: gs.combat_state, turn: t });
        lsSet('tf-combat-learn-data', JSON.stringify(learned.slice(-200))); // 최근 200건만 보관
      }
    }catch(e){}
  }

  // [신규] npc_to_enemy — 기존에 npc_add로 등록된 일반 NPC가 전투의
  // 적이 되는 명시적 전환. 이게 없으면 "쇠사슬로 묶인 감독관" 같은
  // 인물이 전투 중인데도 몬스터로 등록되지 않는 사각지대가 생긴다.
  if(Array.isArray(gs.npc_to_enemy)){
    gs.npc_to_enemy.forEach(entry=>{
      if(!entry?.name) return;
      try{
        const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
        const lv = (typeof loadPlayerLevel==='function') ? (loadPlayerLevel()||1) : 1;
        const hp = entry.hp || Math.round(20 + lv*4);
        monsters.push({
          id: 'npc_enemy_'+entry.name+'_'+Date.now(),
          name: entry.name, icon: entry.icon||'😠',
          hp, maxHp: hp,
          atk: entry.atk || Math.round(6+lv*1.3),
          def: Math.max(1, Math.floor(lv*0.3)),
          status:'alive', isBoss: !!entry.isBoss, isNamed:true, isGroup:false,
          fromNpc: true, // NPC였다가 전환됐다는 표시
        });
        if(typeof saveMonsters==='function') saveMonsters(monsters);
        S._inCombat = true;
        // NPC 기록은 유지하되 관계를 명확히 적대로 갱신 — NPC 패널과
        // 몬스터 패널 양쪽에 일관된 상태가 보이게 한다(중복이 아니라
        // "이 인물이 지금 전투 중인 적이다"라는 동일 사실의 두 표시).
        if(typeof upsertNpc==='function') upsertNpc(entry.name, { relation:'hostile', emotion:'hostile', fact:'전투 중 — 적대로 전환됨' });
      }catch(e){ console.warn('[npc_to_enemy]', e); }
    });
    if(typeof renderMonsters==='function') renderMonsters();
  }

  // [신규] terrain_finisher — 지형을 활용한 필살 액션의 결과 처리.
  // getTerrainBLS()가 AI에게 "이 지형에서는 OOO 행동이 가능하다"고
  // 안내하면, AI가 상황에 맞을 때 그 행동을 서사/선택지로 제안하고
  // 결과를 이 필드로 보고한다. 일반 몹은 성공 시 즉시 처치(즉사),
  // 보스는 죽지 않는 대신 큰 피해 + 격분 상태로 전환되어 공격력이
  // 오히려 상승한다 — "지형으로 보스를 한 방에 끝낼 수는 없지만
  // 시도할 가치는 있다"는 밸런스. 실패 시에는 위험 부담이 있었다는
  // 사실만 토스트로 알리고, 실제 역효과(피해 등)는 AI가 서사+stats
  // 필드로 자연스럽게 함께 묘사/반영하도록 둔다(시스템이 강제 처리하지
  // 않음 — 어떤 역효과인지는 상황마다 다르므로 서사적 판단에 맡김).
  if (gs.terrain_finisher && gs.terrain_finisher.name) {
    try {
      const tf = gs.terrain_finisher;
      const monsters = (typeof loadMonsters === 'function') ? (loadMonsters() || []) : [];
      const m = monsters.find(x => x.name && x.name.includes(String(tf.name).slice(0, 4)) && x.status === 'alive');
      if (m) {
        if (tf.success) {
          if (m.isBoss) {
            // 보스: 즉사 대신 큰 피해(최대HP의 35%) + 격분 상태(공격력 +40%, 1회만 적용)
            const dmg = Math.round((m.maxHp || m.hp || 100) * 0.35);
            m.hp = Math.max(1, m.hp - dmg);
            if (!m._terrainEnraged) {
              m._terrainEnraged = true;
              m.atk = Math.round((m.atk || 10) * 1.4);
              toast(`🌋 ${m.name}이(가) 지형 필살 공격에 큰 피해를 입고 격분했다! (피해 ${dmg}, 공격력 상승)`, 3500);
            } else {
              toast(`🌋 ${m.name}이(가) 지형 필살 공격에 다시 피해를 입었다! (피해 ${dmg})`, 3000);
            }
          } else {
            // 일반 몹 / 네임드: 즉시 처치
            m.status = 'dead'; m.hp = 0;
            toast(`💀 ${m.name} 지형을 이용한 일격에 즉사!`, 3000);
          }
          if (typeof saveMonsters === 'function') saveMonsters(monsters);
          if (typeof renderMonsters === 'function') renderMonsters();
          if (typeof checkPostCombatCapture === 'function') checkPostCombatCapture();
          // 보스가 큰 피해를 입었으니 페이즈 전환 체크
          if (m.isBoss && typeof autoCheckBossPhases === 'function') autoCheckBossPhases();
        } else {
          // 실패 — 시도 자체의 위험 부담을 알림. 구체적 역효과는 AI의
          // 서사·stats 필드로 함께 처리되는 것을 전제로 한다.
          toast(`⚠️ 지형을 이용한 필살 시도가 실패했다 — 위험에 노출됨`, 3000);
        }
      }
    } catch (e) { console.warn('[terrain_finisher]', e); }
  }

  // [신규] combo_attack — 동료/소환수와의 협동 공격에 대한 시스템적
  // 보상. 기존에는 "동료가 묶고 내가 마무리" 같은 협동 묘사가 순수
  // 텍스트로만 존재했고, 실제로 보상받는 메커니즘이 없었다. 파티원이
  // 있을 때 협동 공격이 성립하면 추가 피해를 보장해 동료 동반 전투가
  // 실질적으로 더 유리하다는 걸 체감하게 한다.
  if (gs.combo_attack && gs.combo_attack.target) {
    try {
      const ca = gs.combo_attack;
      const party = (typeof loadParty === 'function') ? (loadParty() || []) : [];
      const hasLivingAlly = party.some(p => p.status !== 'dead' && p.hp > 0) ||
        (typeof window.loadSummons === 'function' && (window.loadSummons() || []).some(s => s.status === 'active'));
      if (hasLivingAlly) {
        const monsters = (typeof loadMonsters === 'function') ? (loadMonsters() || []) : [];
        const m = monsters.find(x => x.name && x.name.includes(String(ca.target).slice(0, 4)) && x.status === 'alive');
        if (m) {
          // 협동 공격 보너스 — 최대HP의 10% 추가 피해
          const bonusDmg = Math.round((m.maxHp || m.hp || 100) * 0.10);
          m.hp = Math.max(1, m.hp - bonusDmg);
          toast(`🤝 협동 공격 성공! ${m.name}에게 추가 피해 ${bonusDmg}`, 2800);
          if (typeof saveMonsters === 'function') saveMonsters(monsters);
          if (typeof renderMonsters === 'function') renderMonsters();
          if (m.isBoss && typeof autoCheckBossPhases === 'function') autoCheckBossPhases();
        }
      }
    } catch (e) { console.warn('[combo_attack]', e); }
  }

  // [신규] weakpoint_hit — "골렘은 관절·코어 같은 약점 부위 집중 공격이
  // 필요하다"는 AI 힌트(ENEMY_BEHAVIOR_PATTERNS.golem)는 그동안 텍스트
  // 힌트로만 존재했고, 실제로 약점을 맞췄을 때 시스템이 보장하는 효과가
  // 없었다. 약점 부위를 정확히 노린 공격이 성공하면 추가 피해를 입혀
  // "정확히 약점을 노리는 것이 실제로 보상받는다"는 전술적 깊이를 더한다.
  if (gs.weakpoint_hit && gs.weakpoint_hit.name) {
    try {
      const wp = gs.weakpoint_hit;
      const monsters = (typeof loadMonsters === 'function') ? (loadMonsters() || []) : [];
      const m = monsters.find(x => x.name && x.name.includes(String(wp.name).slice(0, 4)) && x.status === 'alive');
      if (m) {
        // 약점 추가 피해 — 최대HP의 12%를 보너스로 추가 적용
        const bonusDmg = Math.round((m.maxHp || m.hp || 100) * 0.12);
        m.hp = Math.max(1, m.hp - bonusDmg);
        toast(`🎯 ${m.name}의 약점(${wp.part || '취약 부위'})을 정확히 타격! 추가 피해 ${bonusDmg}`, 2800);
        if (typeof saveMonsters === 'function') saveMonsters(monsters);
        if (typeof renderMonsters === 'function') renderMonsters();
        if (m.isBoss && typeof autoCheckBossPhases === 'function') autoCheckBossPhases();
      }
    } catch (e) { console.warn('[weakpoint_hit]', e); }
  }

  // [신규] flee_result — attemptFlee()가 시작한 도망 시도의 결과 처리.
  // 성공 시 전투를 완전히 종료(몬스터 전부 제거 + 전투 상태 해제)하고,
  // 실패 시에는 전투를 유지하며 AI가 서술한 추가 피해(stats.hp)를 그대로
  // 반영하는 것을 전제로 한다 — 이 필드 자체는 결과를 토스트로 알리고
  // 성공 시의 종료 처리만 담당한다.
  if (gs.flee_result && typeof gs.flee_result.success === 'boolean') {
    try {
      if (gs.flee_result.success) {
        const monsters = (typeof loadMonsters === 'function') ? (loadMonsters() || []) : [];
        monsters.forEach(m => { if (m.status === 'alive') m.status = 'fled_from'; });
        if (typeof saveMonsters === 'function') saveMonsters(monsters);
        if (typeof renderMonsters === 'function') renderMonsters();
        S._inCombat = false;
        toast('🏃 도망 성공! 전투에서 벗어났다.', 3000);
        // [B67 FIX] 도전 과제 "생존 전문가"(flee_successes)가 어디서도
        // updateChallenge()로 갱신되지 않던 버그.
        if(typeof updateChallenge==='function'){
          const _fleeCount = (parseInt(lsGet('tf-flee-success-count')||'0',10)||0) + 1;
          lsSet('tf-flee-success-count', String(_fleeCount));
          updateChallenge('flee_successes', _fleeCount);
        }
      } else {
        toast('💨 도망 실패! ' + (gs.flee_result.penalty || '적의 추가 공격을 받았다.'), 3000);
      }
    } catch (e) { console.warn('[flee_result]', e); }
  }

  // [신규] 세력 비밀 결말 처리
  if (gs.faction_secret_resolved && typeof processFactionSecretResolved==='function') {
    processFactionSecretResolved(gs);
  }

  // [신규] 감옥 탈출 시도 처리
  if (gs.jail_escape_attempt && typeof processJailEscapeAttempt==='function') {
    processJailEscapeAttempt(gs);
  }

  // [신규] 경비병 조우 결과 처리 — 즉시 체포가 아니라 전투/항복/도주의 결과
  if (gs.arrest_outcome && typeof processArrestOutcome==='function') {
    processArrestOutcome(gs);
  }

  // [신규] NPC 서브플롯 진행 단계 처리 — 종족/세력/대륙/직업 마스터
  // NPC들의 questChain 단계를 AI가 직접 진행시킬 수 있게 한다.
  if (gs.npc_story_progress && typeof advanceNpcStoryStage==='function') {
    advanceNpcStoryStage(gs.npc_story_progress);
  }

  // ── NPC ──────────────────────────────────────────────
  if(Array.isArray(gs.npc_add)){
    gs.npc_add.forEach(n=>{
      if(!n.name) return;
      upsertNpc(n.name,{
        role:n.role, icon:n.icon, faction:n.faction,
        race:n.race||'',
        rank:n.rank||n.socialRank||'',
        rankIcon:n.rankIcon||'',
        personality:{ type:'', desc:n.personality||'', speechStyle:n.speech_style||'' },
        fact:'등장: '+(n.desc||'').slice(0,60),
        note:n.note||'',
        emotion:'neutral', relation:n.relation||'neutral',
        firstMetTurn:S.msgCount||0,
        firstMetLoc:(typeof window.currentLocation!=='undefined'&&window.currentLocation?.name)||'',
      });
    });
  }

  if(Array.isArray(gs.pm_npc)){
    gs.pm_npc.forEach(n=>{
      if(!n.name) return;
      upsertNpc(n.name,{
        emotion:    n.emotion||'',
        dialog:     n.topic ? { topic:n.topic, emotion:n.emotion||'', outcome:'' } : null,
        secretRevealed: n.secret||null,
        promise:    n.promise||null,
        betrayalRisk: n.betrayal ? 60 : null,
        fact:       n.favor ? '호의: '+n.favor : n.grudge ? '원한: '+n.grudge : null,
      });
      if(n.topic&&n.line) addNpcDialog(n.name,'',n.line,n.topic,n.emotion);
    });
  }

  if(Array.isArray(gs.npc)){
    gs.npc.forEach(n=>{
      if(n.name) upsertNpc(n.name,{ relationDelta:n.rel||0, emotion:n.emotion||'' });
    });
  }

  if(Array.isArray(gs.npc_dialogue)){
    // [B71 FIX] "침묵의 언어" 히든 업적(NPC와 대화 없이 생존) 판정용 —
    // 실제 NPC 대화가 발생한 턴 수를 트래킹.
    if(gs.npc_dialogue.length && typeof window.updateStats==='function') window.updateStats('npcTalkCount', 1);
    gs.npc_dialogue.forEach(d=>{
      if(d.name&&d.line) addNpcDialog(d.name,'',d.line,d.context||'',d.emotion||'');
      if(d.name&&d.line&&d.emotion&&typeof addTimeEcho==='function') addTimeEcho(d.line,d.name,d.emotion,S.scenario?.id);
    });
  }

  if(gs.pm_npc_relation){
    const r=gs.pm_npc_relation;
    if(r.from&&r.to) upsertRelation(r.from,r.to,{ delta:r.rel||0, desc:r.desc||'' });
  }

  // ── 퀘스트 ───────────────────────────────────────────
  if(gs.quest_detail){
    const q=gs.quest_detail;
    if(q.id) upsertQuest(q.id,{ title:q.title, description:q.desc, objective:q.objective, rewards:q.reward?{special:q.reward}:{} });
  }
  if(Array.isArray(gs.q_new)){
    gs.q_new.forEach(id=>upsertQuest(String(id),{ status:'active' }));
  }
  if(Array.isArray(gs.q_done)){
    gs.q_done.forEach(id=>{
      upsertQuest(String(id),{ status:'completed' });
      // 타임라인 기록
      const q=getQuest(String(id));
      if(q) updateWorldDB({ timeline:{ category:'quest', title:q.title+' 완료', icon:'✅' } });

      // [CRITICAL BUG FIX] mq1~mq9(메인 퀘스트 8장+9장)는 PM 시스템(upsertQuest)
      // 과 완전히 분리된 별도 데이터(MAIN_QUESTS)에 정의돼 있어서, AI가
      // q_done으로 완료 처리해도 막대한 보상(골드/경험치/스탯보너스/완료
      // 플래그)이 단 한 번도 지급되지 않던 버그. id가 mq로 시작하면
      // completeMainQuest로도 함께 처리한다.
      if(/^mq\d+$/.test(String(id)) && typeof completeMainQuest === 'function'){
        try{ completeMainQuest(String(id)); }catch(e){}
      }
    });
  }
  if(Array.isArray(gs.pm_quest)){
    gs.pm_quest.forEach(q=>{
      if(!q.title) return;
      const id='q_'+q.title.replace(/\s/g,'').slice(0,12);
      upsertQuest(id,{ title:q.title, clue:q.clue, moment:q.moment, choice:q.choice_outcome });
    });
  }

  // ── 사건 ─────────────────────────────────────────────
  if(Array.isArray(gs.events_add)){
    gs.events_add.forEach(ev=>{
      if(ev.title) addEvent({ title:ev.title, desc:ev.desc, impact:ev.impact, tags:[ev.category||'general'], category:ev.category||'general' });
    });
  }

  // ── 플레이어 ─────────────────────────────────────────
  if(gs.pm_personal){
    const p=gs.pm_personal;
    if(p.injury)        updatePlayerDB({ injury:p.injury, severity:'medium' });
    if(p.healed_injury) updatePlayerDB({ healed:p.healed_injury });
    if(p.trauma){
      updatePlayerDB({ trauma:p.trauma });
      // 트라우마 시스템 연결 [v49 ④]
      // [버그 수정] 'tf-traumas'(존재하지 않는 키, loadTraumas는 taleforge-trauma를
      // 읽음) → saveTraumas()로 교정. 이전엔 AI가 부여한 트라우마가 저장은
      // 됐지만 loadTraumas()로는 영원히 안 읽혔다.
      try{
        const tr = (typeof loadTraumas==='function'?loadTraumas():{}) || {};
        const trId = 'trm_'+(S.msgCount||0);
        tr[trId] = { text:p.trauma, trigger:'', turn:S.msgCount||0, resolved:false };
        if(typeof saveTraumas==='function') saveTraumas(tr);
      }catch(e){}
      // 트라우마 텍스트에서 타입 키워드 감지 → 트라우마 면역 시스템 연결
      try{
        const _traumaKw = {fire:['화염','불'],ice:['얼음','냉기'],fall:['추락','낙하'],ambush:['기습','매복'],curse:['저주'],betrayal:['배신'],crowd:['군중','인파'],poison:['독'],freeze:['얼어붙','동결']};
        for(const [ttype,kws] of Object.entries(_traumaKw)){
          if(kws.some(kw=>p.trauma.includes(kw))){ if(typeof recordTrauma==='function') recordTrauma(ttype); break; }
        }
        if(p.trauma.includes('저주') && typeof recordCurse==='function'){
          const _curseKw = {eternal_thirst:['갈증','목마름'],haunted_shadow:['그림자'],marked_by_death:['죽음의 표식','사신'],broken_tongue:['말을 잃','목소리'],timelock:['시간이 멈','정지']};
          let _curseType = 'haunted_shadow';
          for(const [ctype,kws] of Object.entries(_curseKw)){
            if(kws.some(kw=>p.trauma.includes(kw))){ _curseType = ctype; break; }
          }
          recordCurse(_curseType);
        }
      }catch(e){}
    }
    if(p.achievement)   updatePlayerDB({ achievement:p.achievement });
    if(p.scar)          updatePlayerDB({ scar:p.scar });
    if(p.skill)         updatePlayerDB({ skill:p.skill });
    // 원한 추가 [v49 ④]
    if(p.grudge && typeof addGrudge==='function') addGrudge(p.grudge);
    // 정신 오염 [v49 ④]
    // [버그 수정] 'tf-mental-corruption'(존재하지 않는 키) → saveMentalCorruption()으로
    // 교정. loadMentalCorruption()이 읽는 실제 키(taleforge-mental-corruption)에
    // 정확히 저장된다.
    if(p.mental_corruption){
      try{
        const mc=(typeof loadMentalCorruption==='function'?loadMentalCorruption():{level:0,symptoms:[],cured:0})||{level:0,symptoms:[],cured:0};
        mc.level=Math.min(10,(mc.level||0)+1);
        if(p.mental_corruption!==true) mc.symptoms=(mc.symptoms||[]).concat([p.mental_corruption]);
        if(typeof saveMentalCorruption==='function') saveMentalCorruption(mc);
      }catch(e){}
    }
    // 메타 지식 [v49 ④]
    if(p.meta_knowledge && typeof addMetaKnowledge==='function') addMetaKnowledge(p.meta_knowledge);
  }

  // 나비효과 자동 기록 [v49 ③] — 중요 GS 이벤트마다 기록
  try{
    const bfTriggers = [];
    if(Array.isArray(gs.q_done)&&gs.q_done.length) bfTriggers.push({desc:`퀘스트 완료: ${gs.q_done.join(',')}`, impact:3, worldChange:'퀘스트가 완료됐다'});
    if(gs.job) bfTriggers.push({desc:`직업 변경: ${gs.job}`, impact:3, worldChange:`${gs.job}이 됐다`});
    if(gs.social_rank) bfTriggers.push({desc:`신분 변경: ${gs.social_rank}`, impact:4, worldChange:`신분이 달라졌다`});
    if(Array.isArray(gs.party_death)&&gs.party_death.length) bfTriggers.push({desc:`동료 사망: ${gs.party_death.join(',')}`, impact:5, worldChange:'동료를 잃었다'});
    if(typeof addButterflyEffect==='function') bfTriggers.forEach(bf=>addButterflyEffect(bf));
  }catch(e){}

  // 인과 관계 자동 기록 [v49 ④]
  // [버그 수정] 'tf-causality'(존재하지 않는 키) → saveCausality()로 교정.
  try{
    if(Array.isArray(gs.q_done)&&gs.q_done.length&&typeof loadCausality==='function'){
      const ca=(loadCausality())||[];
      gs.q_done.forEach(id=>{
        ca.push({cause:`퀘스트 ${id} 완료`, effect:'세계 변화 예정', turn:S.msgCount||0, resolved:false});
      });
      if(typeof saveCausality==='function') saveCausality(ca);
    }
  }catch(e){}

  // 루프 자각 체크 [v49 ④] — 회차 3 이상에서 루프 관련 플래그 세팅 시 자각
  try{
    const cyc = typeof loadCycleCount==='function'?loadCycleCount():0;
    if(cyc>=3&&Array.isArray(gs.flags)&&gs.flags.some(f=>f.includes('loop')||f.includes('루프')||f.includes('cycle'))){
      // [B28 FIX] cycle 인자 누락으로 항상 undefined가 되어 레벨이 항상 0으로
      // 계산되던 버그.
      if(typeof awakenLoopAwareness==='function') awakenLoopAwareness(cyc);
    }
  }catch(e){}

  // ── 세계 ─────────────────────────────────────────────
  if(Array.isArray(gs.flags)){
    gs.flags.forEach(flag=>{
      updateWorldDB({ flag });
      // [신규] 시간 역행 토큰 소비 — earnTimeToken은 있었지만 소비 쪽에
      // 실제로 토큰을 차감하는 GS 처리가 없어, AI가 아무리 "시간을
      // 되돌린다"고 서사를 써도 토큰이 전혀 줄지 않는 문제가 있었다.
      if(flag === 'time_token_used' && typeof loadTimeTokens==='function'){
        try{
          const tt = loadTimeTokens();
          const _hadToken = (tt.tokens||0) > 0;
          if(_hadToken && typeof useTimeToken==='function' && useTimeToken()){
            const tt2 = loadTimeTokens();
            toast(`⏪ 시간 역행 토큰 사용 (남은 개수: ${tt2.tokens})`, 3000);
          }
        }catch(e){}
      }
      // [CRITICAL BUG FIX] sealBroken에 AI가 출력한 원본 플래그 문자열
      // ('seal_broken_세계수')을 그대로 저장해서, SEAL_DEFINITIONS의 정식
      // 키('세계수 봉인석')와 절대 매칭이 안 되던 버그. 플래그 안에서
      // 어떤 봉인석의 키워드가 포함되는지 찾아 정식 이름으로 변환한다.
      if(flag.includes('seal_broken')||flag.includes('봉인')){
        let matchedSealName = null;
        if(typeof SEAL_DEFINITIONS !== 'undefined'){
          for(const sealFullName of Object.keys(SEAL_DEFINITIONS)){
            const keyword = sealFullName.replace(' 봉인석', ''); // '세계수 봉인석' → '세계수'
            if(flag.includes(keyword)){ matchedSealName = sealFullName; break; }
          }
        }
        updateWorldDB({ sealBroken: matchedSealName || flag });
      }
      // 종교 전쟁
      if(flag.startsWith('religion_war_')) addEvent({ title:'종교전쟁: '+flag, tags:['종교','전쟁'], category:'religion', worldImpact:7 });
    });
    // [CRITICAL BUG FIX] checkWorldEventTriggers가 mq1_done 시점 단 1회만
    // 호출되고 있어서, mq2_done~mq6_done이나 봉인석 균열 누적(brokenCount)에
    // 따른 세계 이벤트(노블 위기·드래곤 광폭화·길드전쟁 등)가 절대 발동
    // 안 되던 버그. 새 플래그가 들어올 때마다 매번 재체크하도록 수정.
    if(typeof checkWorldEventTriggers === 'function') checkWorldEventTriggers();
  }

  if(gs.location_visit){
    const l=gs.location_visit;
    updateWorldDB({ location:l.name||l.id });
    addEvent({ title:l.name+' 방문', tags:['탐험',l.type||'location'], category:'exploration', worldImpact:1 });
  }

  // 소환수 → 소환수 시스템 처리
  if(Array.isArray(gs.summon_add)){
    gs.summon_add.forEach(r=>{ if(r&&r.name&&typeof addSummon==='function') addSummon(r); });
  }
  if(Array.isArray(gs.summon_exp)){
    gs.summon_exp.forEach(e=>{
      if(!e||!e.name) return;
      const ss=typeof window.loadSummons==='function'?window.loadSummons():[];
      const s=ss.find(x=>x.status==='active'&&(x.customName||x.name).includes(e.name.slice(0,4)));
      if(s&&typeof giveSummonExp==='function') giveSummonExp(s.id,Math.abs(Number(e.exp)||15));
    });
  }
  if(Array.isArray(gs.summon_evolve)&&typeof handleSummonEvolve==='function') handleSummonEvolve(gs.summon_evolve);
  if(Array.isArray(gs.merc_evolve)&&typeof handleMercEvolve==='function') handleMercEvolve(gs.merc_evolve, false);
  if(Array.isArray(gs.caravan_evolve)&&typeof handleCaravanEvolve==='function') handleCaravanEvolve(gs.caravan_evolve, false);
  if(gs.summon_dialog&&typeof handleSummonDialogGS==='function') handleSummonDialogGS(gs.summon_dialog);

  // 종교
  if(gs.religion_share_delta&&typeof changeReligionShare==='function'){
    const d=gs.religion_share_delta;
    const delta={};
    ['temple','solar','roots','abyss'].forEach(r=>{ if(typeof d[r]==='number') delta[r]=d[r]; });
    if(Object.keys(delta).length){ changeReligionShare(d.region||'central',delta); updateWorldDB({ religionDelta:{ region:d.region||'central', turn:t, ...delta } }); }
  }
  if(gs.convert_npc&&typeof convertNpc==='function'){ const c=gs.convert_npc; if(c.name&&c.to) convertNpc(c.name,c.from||'',c.to); }
}
window.processGSToAllDBs = processGSToAllDBs;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_130(){
window.processGSToAllDBs = window.processGSToAllDBs;
}

