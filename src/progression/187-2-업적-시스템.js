// [2] 업적 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { SEAL_DEFINITIONS } from '../data/155-⑭-메모리-패널-UI.js';
import { ACHIEVEMENT_DEFS, ADVANCED_ACHIEVEMENT_DEFS } from '../data/187-2-업적-시스템.js';
import { loadGold, loadInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { loadSkills } from '../job/002-스킬-시스템.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadJobMemory } from '../job/042-직업-시스템-무한-파생-도감.js';
import { loadProphecy } from '../lore/301-①-예언운명-시스템.js';
import { loadOaths } from '../lore/312-⑤-서약-시스템.js';
import { loadTraumaDeep } from '../lore/316-⑦-심층-트라우마-시스템.js';
import { loadNPCs } from '../misc/001-block0-preamble.js';
import { loadBloodline } from '../misc/015-시스템-1120.js';
import { loadLocations, loadReputation } from '../misc/054-이동수단-시스템.js';
import { loadEvolution } from '../misc/206-3-진화Evolution-시스템.js';
import { loadDreams } from '../misc/302-②-꿈환영-시스템.js';
import { loadChronicle } from '../misc/303-③-자동-모험-연대기-Living-Chronicle.js';
import { loadAlliances } from '../misc/317-⑨-동맹배신-시스템.js';
import { loadGoals } from '../misc/318-⑩-플레이어-목표-노트.js';
import { _loadPStats, _loadSnapshots } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadQuestDoneCount } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { loadKingdom } from '../race/028-악마족-진명-시스템-Demon-True-Name.js';
import { loadHumanStigma } from '../ui/026-renderHumanAwakeningPanel-완전-재정의.js';
import { loadSealRestore } from '../ui/155-⑭-메모리-패널-UI.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadCodex } from '../world/304-④-세계-신화-백과사전.js';
import { loadMapNotes } from '../world/311-④-탐험-메모-지도-시스템.js';
import { loadCycleCount, loadSoulWeapon } from './014-환생-누적-시스템-110번.js';
import { growTreeBranch } from './020-101130번-환생-누적-시스템.js';
import { loadLegacy } from './156-NG-회차-계승-시스템.js';

export const ACH_KEY = 'tf-achievements';

window.ACHIEVEMENT_DEFS = ACHIEVEMENT_DEFS;

export function loadAchievements() {
  try { return JSON.parse(lsGet(ACH_KEY) || '{}'); } catch(e) { return {}; }
}
window.loadAchievements = loadAchievements;

export function saveAchievements(d) {
  try { lsSet(ACH_KEY, JSON.stringify(d)); } catch(e) {}
}
window.saveAchievements = saveAchievements;

export function unlockAchievement(id) {
  try {
    const ach = loadAchievements();
    if (ach[id]) return false; // 이미 획득
    const def = ACHIEVEMENT_DEFS[id];
    if (!def) return false;
    ach[id] = { unlockedAt: Date.now(), turn: S?.msgCount || 0 };
    saveAchievements(ach);
    toastHTML(`🏆 업적 달성: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} ${esc(def.name)}`, 3500);
    if(typeof growTreeBranch==='function') growTreeBranch(null, S.scenario?.id);
    // [버그 수정] progression/088이 이 함수가 정의된 바로 이 파일 밖에서
    // window.unlockAchievement를 감싸 achievement 보상(applyAchievementReward)을
    // 지급하려 했지만, 이 파일 안의 모든 실제 호출부(checkAchievements 등)가
    // bare 식별자로 unlockAchievement(id)를 부르기 때문에 그 감싸기가 절대
    // 적용되지 못했다 — 업적은 정상적으로 달성 표시되는데 보상(스탯/경험치
    // 등)은 조용히 한 번도 지급된 적이 없었다. 실제 정의부에 직접 연결한다.
    if(typeof window.applyAchievementReward==='function') setTimeout(()=>window.applyAchievementReward(id), 800);
    return true;
  } catch(e) { return false; }
}
window.unlockAchievement = unlockAchievement;

export function checkAchievements() {
  try {
    const lv  = typeof loadPlayerLevel==='function'  ? loadPlayerLevel()    : null;
    const cyc = typeof loadCycleCount==='function'   ? loadCycleCount()     : 0;
    const d   = typeof _loadPStats==='function'      ? _loadPStats()        : {};
    const inv = typeof loadInventory==='function'    ? loadInventory()      : [];
    const gold= typeof loadGold==='function'         ? loadGold()           : (S.gold||0);
    const loc = typeof loadLocations==='function'    ? loadLocations()      : [];
    const npcs= typeof loadNPCs==='function'         ? loadNPCs()           : [];

    // 레벨 관련
    if(lv){
      if(lv>=10)  unlockAchievement('level_10');
      if(lv>=30)  unlockAchievement('level_30');
      if(lv>=50)  unlockAchievement('level_50');
      if(lv>=99)  unlockAchievement('level_99');
      if(lv>=50)  unlockAchievement('max_level');
    }
    // 환생
    if(cyc>=1)   unlockAchievement('first_reinc');
    if(cyc>=3)   unlockAchievement('reinc_3');
    if(cyc>=5)   unlockAchievement('reinc_5');
    if(cyc>=10)  unlockAchievement('reinc_10');
    if(cyc>=30)  unlockAchievement('reinc_30');
    if(cyc>=100) unlockAchievement('century_cycle');

    // 전투 통계
    if((d.battleWins||0)>=100) unlockAchievement('battle_100');
    if((d.battleWins||0)>=5)   unlockAchievement('boss_5');
    if((d.battleWins||0)>=20)  unlockAchievement('boss_20');
    if((d.maxCombo||0)>=30)    unlockAchievement('combo_30');
    if((d.deathCount||0)>=10)  unlockAchievement('death_10');

    // 턴/플레이 시간
    if((d.totalTurns||0)>=500)  unlockAchievement('turn_500');
    if((d.totalTurns||0)>=2000) unlockAchievement('turn_2000');
    if((d.totalPlayMs||0)>=36000000) unlockAchievement('play_10h'); // 10시간

    // 골드
    if(gold>=1000)   unlockAchievement('gold_1000');
    if(gold>=10000)  unlockAchievement('gold_10000');
    if(gold>=100000) unlockAchievement('gold_100000');

    // 아이템
    if(inv.length>=10) unlockAchievement('item_10');
    if((d.totalGoldEarned||0)>=50000) {
      // item_50 proxy: 골드 많이 번 사람은 아이템도 많이 얻었을 것
      unlockAchievement('item_50');
    }

    // 탐험 장소
    if(loc.length>=10) unlockAchievement('location_10');
    if(loc.length>=30) unlockAchievement('location_30');

    // NPC 수
    if(npcs.length>=20) unlockAchievement('npc_20');

    // 스탯
    const stats = S.stats||{};
    const statVals = Object.values(stats).filter(v=>typeof v==='number'&&v>0);
    if(statVals.some(v=>v>=100)) unlockAchievement('stat_100');
    if(statVals.reduce((a,b)=>a+b,0)>=500) unlockAchievement('stat_500');

    // 스킬
    const skills = typeof loadSkills==='function' ? loadSkills() : {};
    if(Object.keys(skills).length>=10) unlockAchievement('skill_master');

    // 엔딩 종류
    const snaps = typeof _loadSnapshots==='function' ? _loadSnapshots() : [];
    const endingTypes = new Set(snaps.map(s=>s.endingType).filter(Boolean));
    if(endingTypes.size>=5) unlockAchievement('all_endings');

    // 직업 종류
    const jobMem = typeof loadJobMemory==='function' ? loadJobMemory() : {};
    if(Object.keys(jobMem).length>=10) unlockAchievement('all_jobs');

    // 기존 체크
    const seals = typeof loadSealRestore==='function' ? loadSealRestore() : {};
    // [B44 FIX] "모든 봉인석 복원" 업적이 실제 총량(11)보다 적은 8로
    // 하드코딩되어 있어 실제로는 11개 중 8개만 복원해도 달성되던 버그.
    if(Object.values(seals).filter(v=>v===true).length>=((typeof SEAL_DEFINITIONS!=='undefined')?Object.keys(SEAL_DEFINITIONS).length:11)) unlockAchievement('all_seals');
    const sw = typeof loadSoulWeapon==='function' ? loadSoulWeapon() : null;
    if(sw && sw.level>=1) unlockAchievement('soul_weapon');
    const kg = typeof loadKingdom==='function' ? loadKingdom() : null;
    if(kg && kg.founded && kg.founded.length) unlockAchievement('kingdom_builder');

    // 진화
    const evo = typeof loadEvolution==='function' ? loadEvolution() : null;
    if(evo && evo.stage>=1) unlockAchievement('evolution_1');

    // 파티
    const party = S.party||[];
    if(party.length>=8) unlockAchievement('party_full');

    // 퀘스트 수
    const qDone = typeof loadQuestDoneCount==='function' ? loadQuestDoneCount() : (d.questDone||0);
    if(qDone>=10) unlockAchievement('quest_10');
    if(qDone>=50) unlockAchievement('quest_50');

    // 예언
    const proph = typeof loadProphecy==='function' ? loadProphecy() : null;
    if(proph && proph.prophecies && proph.prophecies.some(p=>p.fulfilled)) unlockAchievement('prophecy_done');

    // 연대기
    const ch = typeof loadChronicle==='function' ? loadChronicle() : [];
    if(ch.length>=10) unlockAchievement('chronicle_10');

    // 백과사전
    const codex = typeof loadCodex==='function' ? loadCodex() : {};
    if(Object.keys(codex).length>=10) unlockAchievement('codex_10');

    // 꿈
    const dreams = typeof loadDreams==='function' ? loadDreams() : [];
    if(dreams.length>=10) unlockAchievement('dream_10');

    // 지도 메모
    const notes = typeof loadMapNotes==='function' ? loadMapNotes() : [];
    if(notes.length>=10) unlockAchievement('map_notes_10');

    // 동맹
    const alliances = typeof loadAlliances==='function' ? loadAlliances() : [];
    if(alliances.length>=1) unlockAchievement('alliance_made');

    // 혈통 각성
    const bl = typeof loadBloodline==='function' ? loadBloodline() : null;
    if(bl && bl.awakened) unlockAchievement('bloodline_awaken');

    // 트라우마 치유
    const traumaList = typeof loadTraumaDeep==='function' ? loadTraumaDeep() : [];
    if(traumaList.some(t=>t.healed)) unlockAchievement('trauma_healed');

    // 서약 지킴
    const oaths = typeof loadOaths==='function' ? loadOaths() : [];
    const totalKept = oaths.reduce((a,o)=>a+(o.kept||0),0);
    if(totalKept>=5) unlockAchievement('oath_kept_5');

  } catch(e) { console.log('checkAchievements error:', e); }
}
window.checkAchievements = checkAchievements;

window.loadAchievements  = loadAchievements;

window.unlockAchievement = unlockAchievement;

window.checkAchievements = checkAchievements;

export function checkHiddenAchievements() {
  try {
    const d     = typeof _loadPStats==='function' ? _loadPStats() : {};
    const npcs  = typeof loadNPCs==='function' ? loadNPCs() : [];
    const oaths = typeof loadOaths==='function' ? loadOaths() : [];
    const inv   = typeof loadInventory==='function' ? loadInventory() : [];
    const cyc   = typeof loadCycleCount==='function' ? loadCycleCount() : 0;
    const bl    = typeof loadBloodline==='function' ? loadBloodline() : null;
    const snaps = typeof _loadSnapshots==='function' ? _loadSnapshots() : [];
    const proph = typeof loadProphecy==='function' ? loadProphecy() : null;
    const ach   = loadAchievements() || {};
    const party = S.party || [];

    // 침묵의 언어 — NPC와 대화 없이 30턴 이상 생존 (탐색/행동만으로)
    if ((d.totalTurns||0) >= 30 && (d.npcTalkCount||0) === 0)
      unlockAchievement('hid_silence');

    // 진짜 이름 — 자신의 이름을 바꾼 적이 있고 NPC가 원래 이름을 기억함
    if (S.nameHistory && S.nameHistory.length >= 2)
      unlockAchievement('hid_true_name');

    // 유령 — 아무도 죽이지 않고 아무도 죽지 않은 채 엔딩 달성
    if (snaps.length >= 1 && (d.killCount||0) === 0 && (d.deathCount||0) === 0)
      unlockAchievement('hid_ghost');

    // 이단자 — 신앙 관련 선택지를 10번 이상 거부
    if ((d.faithRefuseCount||0) >= 10)
      unlockAchievement('hid_heretic');

    // 후회 — 같은 NPC에게 3번 이상 사과
    if (npcs.some(n => (n.apologyCount||0) >= 3))
      unlockAchievement('hid_regret');

    // 거울 속의 나 — 자신과 같은 이름/직업의 NPC를 만남
    if (npcs.some(n => n.name === S.name || n.job === S.job))
      unlockAchievement('hid_mirror');

    // 공허를 들여다본 자 — 크리티컬 실패를 30번 이상 겪고도 포기 안 함
    if ((d.critFailCount||0) >= 30)
      unlockAchievement('hid_void');

    // 조종당하는 자 — 매혹/세뇌 관련 상태이상을 5번 이상 받음
    if ((d.charmCount||0) >= 5)
      unlockAchievement('hid_puppet');

    // 신살자 — 신적 존재와의 전투에서 승리
    if ((d.godKillCount||0) >= 1)
      unlockAchievement('hid_god_killer');

    // 제로 — 골드가 정확히 0인 상태에서 행동
    if ((S.gold||0) === 0 && (d.totalTurns||0) >= 1)
      unlockAchievement('hid_zero');

    // 최초의 피 — 게임 시작 후 첫 번째 행동으로 전투를 선택
    if ((d.firstActionWasBattle||0) === 1)
      unlockAchievement('hid_first_blood');

    // 거짓말쟁이 — NPC에게 거짓 정보를 20번 이상 전달
    if ((d.lieCount||0) >= 20)
      unlockAchievement('hid_liar');

    // 비폭력주의자 — 전투 없이 50턴을 생존
    if ((d.totalTurns||0) >= 50 && (d.battleWins||0) === 0 && (d.deathCount||0) === 0)
      unlockAchievement('hid_pacifist');

    // 저주받은 자 — 저주 아이템을 3개 이상 동시에 보유
    const cursedItems = inv.filter(i => i.cursed || (i.tags && i.tags.includes('cursed')));
    if (cursedItems.length >= 3)
      unlockAchievement('hid_cursed');

    // 선택받은 자 — 예언의 주인공으로 지목되고 모든 예언을 실현
    if (proph && proph.isChosen && proph.prophecies && proph.prophecies.every(p=>p.fulfilled))
      unlockAchievement('hid_chosen');

    // 잊혀진 자 — 환생 후 이전 회차의 모든 NPC가 자신을 기억 못 함
    if (cyc >= 1 && npcs.every(n => !(n.remembers||false)))
      unlockAchievement('hid_forgotten');

    // 역설 — 자신을 죽인 적을 동료로 만듦
    if (party.some(m => m.killedPlayer || m.wasEnemy))
      unlockAchievement('hid_paradox');

    // 목격자 — 주요 NPC의 죽음을 3번 이상 목격
    if ((d.npcDeathWitnessed||0) >= 3)
      unlockAchievement('hid_witness');

    // 마지막 남은 자 — 파티원이 전원 사망하고 혼자 생존
    if ((d.partyWipeCount||0) >= 1)
      unlockAchievement('hid_last_one');

    // 기원 — 100회차 이상에서 1레벨 1턴 상태를 다시 맞이함
    if (cyc >= 100 && (S.level||1) === 1 && (d.totalTurns||0) <= 1)
      unlockAchievement('hid_origin');

  } catch(e) { console.log('checkHiddenAchievements error:', e); }
}
window.checkHiddenAchievements = checkHiddenAchievements;

window.checkHiddenAchievements = checkHiddenAchievements;

Object.assign(ACHIEVEMENT_DEFS, ADVANCED_ACHIEVEMENT_DEFS);

window.ADVANCED_ACHIEVEMENT_DEFS = ADVANCED_ACHIEVEMENT_DEFS;

export function checkAdvancedAchievements() {
  try {
    const d    = typeof _loadPStats === 'function' ? _loadPStats() : {};
    const lv   = typeof loadPlayerLevel === 'function' ? loadPlayerLevel() : null;
    const cyc  = typeof loadCycleCount === 'function' ? loadCycleCount() : 0;
    const inv  = typeof loadInventory === 'function' ? loadInventory() : [];
    const gold = typeof loadGold === 'function' ? loadGold() : (S.gold || 0);
    const npcs = typeof loadNPCs === 'function' ? loadNPCs() : [];
    const snaps = typeof _loadSnapshots === 'function' ? _loadSnapshots() : [];
    const skills = typeof loadSkills === 'function' ? loadSkills() : {};
    const oaths = typeof loadOaths === 'function' ? loadOaths() : [];
    const goals = typeof loadGoals === 'function' ? loadGoals() : [];
    const dreams = typeof loadDreams === 'function' ? loadDreams() : [];
    const ch = typeof loadChronicle === 'function' ? loadChronicle() : [];
    const codex = typeof loadCodex === 'function' ? loadCodex() : {};
    const evo = typeof loadEvolution === 'function' ? loadEvolution() : null;
    const bl = typeof loadBloodline === 'function' ? loadBloodline() : null;
    const hs = typeof loadHumanStigma === 'function' ? loadHumanStigma() : null;
    const rep = typeof loadReputation === 'function' ? loadReputation() : null;
    const qDone = typeof loadQuestDoneCount === 'function' ? loadQuestDoneCount() : (d.questDone || 0);
    const proph = typeof loadProphecy === 'function' ? loadProphecy() : null;
    const legacy = typeof loadLegacy === 'function' ? loadLegacy() : null;
    const alliances = typeof loadAlliances === 'function' ? loadAlliances() : [];

    // ── 🔥 극한 도전 ──────────────────────────────────────────
    // 대성공 횟수
    if ((d.critSuccessCount || 0) >= 50)  unlockAchievement('crit_50');
    if ((d.critSuccessCount || 0) >= 200) unlockAchievement('crit_200');

    // 전투 승리
    if ((d.battleWins || 0) >= 500) unlockAchievement('battle_500');

    // 사망 횟수
    if ((d.deathCount || 0) >= 30) unlockAchievement('death_30');

    // 50콤보
    if ((d.maxCombo || window.comboState?.maxCombo || 0) >= 50) unlockAchievement('combo_50');

    // 5000턴
    if ((d.totalTurns || 0) >= 5000) unlockAchievement('turn_5000');

    // 단일 회차 최장 생존 200턴
    if ((d.maxSurvivalTurns || 0) >= 200) unlockAchievement('max_survival');

    // 100턴 무사망: maxSurvivalTurns가 100 이상이고 deathCount가 0이면 (단일 회차 의미)
    if ((d.maxSurvivalTurns || 0) >= 100 && (d.deathCount || 0) === 0) unlockAchievement('no_death_100');

    // 파티 없이 보스 처치: 보스 처치 기록 + 파티 없음
    if ((d.battleWins || 0) >= 1 && !(S.party && S.party.length > 0)) unlockAchievement('solo_boss');

    // 50턴 연속 실패 없음 (critFailCount가 0이고 totalTurns >= 50인 케이스 근사)
    if ((d.critFailCount || 0) === 0 && (d.totalTurns || 0) >= 50) unlockAchievement('perfect_run');

    // HP 1 생존 10회 근사: deathCount >= 10 이상이고 생존한 경우
    // 정확한 추적이 없으므로 low_hp_win이 이미 달성 + 사망 10회 이상을 근거로 판단
    const ach = loadAchievements() || {};
    if (ach['low_hp_win'] && (d.deathCount || 0) >= 10) unlockAchievement('iron_will');

    // ── 👑 명성 ───────────────────────────────────────────────
    // 명성 최고
    if (rep && (rep.score || 0) >= 100) unlockAchievement('rep_max');

    // NPC 신뢰 10명
    const trustedNpcs = npcs.filter(n => (n.relation || n.relationship || 0) >= 80);
    if (trustedNpcs.length >= 10) unlockAchievement('npc_trust_10');

    // 배신 없이 50턴: betrayalCount가 없으면 ach['first_betrayal'] 미달성 + totalTurns >= 50
    if (!ach['first_betrayal'] && (d.totalTurns || 0) >= 50) unlockAchievement('no_betrayal');

    // 모든 세력 동맹
    if (alliances.length >= 5) unlockAchievement('all_factions');

    // ── 🧬 혈통·진화 심층 ─────────────────────────────────────
    // 진화 최고 단계(5: 초월)
    if (evo && evo.stage >= 5) unlockAchievement('evo_max');

    // 혈통 최고 단계
    if (bl && (bl.stage >= 5 || bl.maxStage >= 5 || bl.level >= 5)) unlockAchievement('bloodline_max');

    // 낙인 극복 5회 이상
    if (hs) {
      const overcomeCounts = Object.values(hs.overcomeCounts || {}).reduce((a, b) => a + b, 0);
      if (overcomeCounts >= 5)  unlockAchievement('stigma_overcome');
      if ((hs.totalStigmaCount || Object.keys(hs.stigmas || {}).length) >= 10) unlockAchievement('stigma_collector');
    }

    // 모든 종족 업적 달성
    const raceAchs = ['race_human','race_elf','race_dwarf','race_orc','race_undead','race_beast','race_demon','race_celestial'];
    if (raceAchs.every(r => ach[r])) unlockAchievement('all_race_bonus');

    // ── 💰 경제 패권 ──────────────────────────────────────────
    if (gold >= 1000000) unlockAchievement('gold_1m');
    if ((d.totalGoldEarned || 0) >= 500000) unlockAchievement('total_gold_500k');
    if (inv.length >= 100) unlockAchievement('item_100');

    // 제작 횟수 (craftCount 통계 또는 craft_master 달성 후 추가)
    if ((d.craftCount || 0) >= 100) unlockAchievement('craft_100');

    // 강화 횟수
    if ((d.enhanceCount || 0) >= 50) unlockAchievement('enhance_50');

    // ── 📚 지식·탐구 ──────────────────────────────────────────
    const codexCount = Object.keys(codex).length;
    if (codexCount >= 50)  unlockAchievement('codex_50');
    if (codexCount >= 100) unlockAchievement('codex_100');

    if (dreams.length >= 30) unlockAchievement('dream_30');
    if (ch.length >= 50)     unlockAchievement('chronicle_50');

    if ((d.totalMpUsed || 0) >= 10000) unlockAchievement('mp_10000');

    if (Object.keys(skills).length >= 20) unlockAchievement('skill_20');

    // 모든 예언 실현
    if (proph && proph.prophecies && proph.prophecies.length > 0 &&
        proph.prophecies.every(p => p.fulfilled)) unlockAchievement('all_prophecy');

    // ── 🌌 초월·환생 심층 ─────────────────────────────────────
    if (cyc >= 50) unlockAchievement('reinc_50');

    // 10종류 엔딩
    const endingTypes = new Set(snaps.map(s => s.endingType).filter(Boolean));
    if (endingTypes.size >= 10) unlockAchievement('all_endings_full');

    // 유산 최고 단계
    if (legacy && (legacy.level >= 5 || legacy.stage >= 5 || (legacy.buildings && legacy.buildings.length >= 10))) {
      unlockAchievement('legacy_complete');
    }

    // 50시간 플레이
    if ((d.totalPlayMs || 0) >= 180000000) unlockAchievement('play_50h'); // 50h

    // 퀘스트 100개
    if (qDone >= 100) unlockAchievement('quest_100');

    // 서약 20번 지킴
    const totalKept = oaths.reduce((a, o) => a + (o.kept || 0), 0);
    if (totalKept >= 20) unlockAchievement('oath_kept_20');

    // 목표 20개 완료
    const doneGoals = goals.filter(g => g.done).length;
    if (doneGoals >= 20) unlockAchievement('all_goals');

  } catch(e) { console.log('checkAdvancedAchievements error:', e); }
}
window.checkAdvancedAchievements = checkAdvancedAchievements;

window.checkAdvancedAchievements = checkAdvancedAchievements;
