// 퀘스트/임무 수락 팝업 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { BATTLE_LOG_KEY, TIMELINE_KEY, _addTimelineOnDeath, addBattleLogEntry, addTimelineEvent, renderBattleLogPanel, renderTimelinePanel } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { getCombatInjuryBonus } from '../combat/247-③-부상-흔적-현재-전투-페널티-연결.js';
import { clearUndeadBorrowedTime, detectUndeadActionFromText, renderMiniMap } from '../combat/257-renderMiniMap-던전-미니맵-일반-미니맵.js';
import { SOCIAL_RANKS, START_CONTINENTS, getSocialRankMechanics, renderKeys, renderScenarios, showScreen } from '../core/084-TaleForge-순수-JS-엔진.js';
import { pmClearAll, pmLoad } from '../core/267-저장로드초기화.js';
import { EMOTION_DEFS, _dirty, _memStore } from '../data/001-block0-preamble.js';
import { SKILL_ENHANCE_TIERS, TITLE_DEFS } from '../data/010-스킬-강화-시스템.js';
import { INHERITABLE_STATS } from '../data/015-시스템-1120.js';
import { CURSE_RING_ACTIONS } from '../data/016-2130번-시스템.js';
import { DEJAVU_TRIGGERS, PET_TYPES } from '../data/019-71100번-환생-누적-시스템.js';
import { ELEMENTAL_TYPES, TRAP_PATTERNS } from '../data/020-101130번-환생-누적-시스템.js';
import { CYBER_IMPLANTS, SWORD_TECHNIQUES } from '../data/028-악마족-진명-시스템-Demon-True-Name.js';
import { ELEMENT_DEFS } from '../data/035-NEW-직업-조합-시너지-시스템.js';
import { RACE_EXCLUSIVE_CONTENT } from '../data/038-NEW-종족-전용-스토리-루트.js';
import { LOC_MONSTER_POOL } from '../data/053-게시판-시스템.js';
import { BOSS_MONSTERS } from '../data/054-이동수단-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { ACADEMY_SUBJECTS, BOUNTY_HUNTER_NAMES, CATASTROPHE_POOL, EMOTION_KEYWORDS, GUARD_TIER_TABLE, INV_RARITY_ORDER, LOCAL_JAIL_ACTIONS, MAXSEC_JAIL_ACTIONS, MAXSEC_JAIL_DEF, MAXSEC_JAIL_INMATES, ME_AFFINITY_BANDS, ME_GOLD_BANDS, ME_HP_BANDS, ME_INTENT_PATTERNS, ME_SYNONYM_GROUPS, MONSTER_TIER_TABLE, RC } from '../data/086-퀘스트임무-수락-팝업-시스템.js';
import { QUEST_GRADES } from '../data/087-전직-조건-저장로드-헬퍼-퀘스트아이템장소-등.js';
import { SEAL_DEFINITIONS } from '../data/155-⑭-메모리-패널-UI.js';
import { LEGACY_RULES } from '../data/156-NG-회차-계승-시스템.js';
import { WEATHER_CYCLE } from '../data/214-11-날씨-자동-순환.js';
import { MERC_ARCHETYPES } from '../data/251-통합-처리-함수-매-AI-응답-후-호출.js';
import { renderEconomyPanel } from '../economy/191-UI-4-경제-현황-패널.js';
import { tickEconomy } from '../economy/200-NEW-7-경제-자동-변동-시스템.js';
import { renderHunterGroundsPanel } from '../economy/255-상인-거래소-교역-지부-확장.js';
import { EQUIP_SLOTS } from '../items/004-장비-슬롯-시스템-12종.js';
import { renderSetBonusPanel, saveSetBonuses } from '../items/006-세트-아이템-시스템.js';
import { DYN_BP_KEY, DYN_ENCOUNTER_KEY, DYN_ENEMY_KEY, DYN_MAT_KEY, DYN_NPC_KEY, calcReincCraftPoints, checkSaveVersion, clearEquipped, clearGold, clearInventory, detectItemDrop, extractDefeatedEnemyName, getLocationMonsterPool, loadGold, loadInventory, loadRCPoints, registerLocationMonster, renderItemCodex, renderRCShopPanel, restoreDynamicBlueprints, restoreDynamicEnemies, restoreDynamicMaterials, rollDynamicLoot, rollDynamicMaterialDrop, rollLoot, saveEquipped, saveGold, saveInventory, saveRCPoints, shouldGenerateNewMonster } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { NPC_MEMORY_KEY, NPC_QUEST_STATE_KEY, QUEST_CHOICES_KEY, checkNpcQuestCompletion, checkNpcQuests, detectNpcRelationshipChange, renderNpcs } from '../items/065-NPC퀘스트-완성도-강화.js';
import { clearSkillSP, clearSkills, loadSkills, saveSkillSP, saveSkills } from '../job/002-스킬-시스템.js';
import { clearPlayerLevel, loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { clearMemory, clearSecrets, clearSkillEnhance, getSkillEnhanceCost, getSkillEnhanceDesc, getSkillEnhanceLevel, getStatInfo, loadHighlights, loadMemory, loadTitles, saveHighlights, saveMemory } from '../job/010-스킬-강화-시스템.js';
import { calcAffinityMod, clearAffinity, renderAffinityPanel } from '../job/035-NEW-직업-조합-시너지-시스템.js';
import { MAIN_QUEST_KEY, WORLD_EVENT_KEY, checkMainQuests, checkSecretEndings, checkWorldEvents, discoverJob, getJobIdFromName, getNPCHero, loadMainQuestState, loadNPCHeroState, loadWorldEvents, renderJobPanel, saveJobToMemory, updateActionPattern } from '../job/042-직업-시스템-무한-파생-도감.js';
import { applyPassiveEffects, processSkillBeforeSend } from '../job/071-파트1-A-스킬-실제-발동-시스템.js';
import { checkBulletinQuestCompletion, checkDynQuestCompletion, generateAIQuest, recordLocationVisit, renderHighlights, renderInventory, renderQuests, renderShop, shouldAutoGenerateQuest } from '../job/087-전직-조건-저장로드-헬퍼-퀘스트아이템장소-등.js';
import { renderSkillTreePanel } from '../job/195-NEW-2-스킬트리-시각화-UI-직업-계보-기반.js';
import { checkAllHiddenJobsAuto } from '../job/203-NEW-10-히든-직업-자동-감지-강화.js';
import { expireSkillBuffs } from '../job/207-4-스킬-시스템.js';
import { renderProphecyPanel } from '../lore/301-①-예언운명-시스템.js';
import { renderOathPanel } from '../lore/312-⑤-서약-시스템.js';
import { renderTraumaDeepPanel } from '../lore/316-⑦-심층-트라우마-시스템.js';
import { CHAR_KEY, CHAT_KEY, META_KEY, SCENARIO_SAVE_KEY, STATS_SAVE_KEY, STORAGE_KEY, _clearDirty, _markDirty, clearAtmosphere, clearNPCs, clearQuests, clearSession, loadAtmosphere, loadEmotion, loadNPCs, loadPastLife, loadQuests, saveAtmosphere, saveCharacter, saveChatHistory, saveEmotion, saveMetaState, savePastLife, saveScenario, saveSession, saveStatsSplit } from '../misc/001-block0-preamble.js';
import { EPIC_QUEST_KEY, SKILL_TREE_SP_COST, checkEpicQuests, clearJobSkills, clearPlayerExp, gainExpFromAction, gainExpFromKill, getAllSkillDefs, getSkillUnlockable, loadStatPoints, renderBuildRecommendPanel, renderEpicQuestPanel, renderRestPanel, renderStatAllocPanel, saveStatPoints } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { checkEvolutionCondition, clearTraumas, getActiveDeathBonuses, loadPermStatBonus, rollPermStatBonus, savePermStatBonus } from '../misc/015-시스템-1120.js';
import { recordCurseRingAction, recordMemoryDistort, recordParallelSelf, recordStatKill, recordStatScenario, recordStatTurn, resetPastPrayerCycle } from '../misc/016-2130번-시스템.js';
import { assignConstellation, growWorldMemory, recordDreamProphecy, recordEmotionRipple, recordLanguageMemory, recordLightningImprint, recordWarScar, recordWatcher } from '../misc/017-4150번-시스템.js';
import { clearDeathEcho, detectDeathEchoFromText } from '../misc/021-1-죽음의-메아리-시스템.js';
import { LIFE_GOALS } from '../data/030-NEW-동적-클리어-목표-시스템.js';
import { assignRandomGoal, loadCycleGoal, saveCycleGoal, updateGoalProgress } from '../misc/030-NEW-동적-클리어-목표-시스템.js';
import { clearVillainData, tickVillainGrowth } from '../misc/036-NEW-성장형-악당-시스템.js';
import { BOSS_HP_KEY, BOSS_KEY, LOCATION_KEY, PARTY_KEY, RELIC_OWNED_KEY, REPUTATION_KEY, SKILL_COMBO_KEY, checkPartyLeave, checkRelicUnlock, checkSkillCombos, defeatBoss, detectLocation, detectStatusEffects, getEnemyScaleMultiplier, getPlayerMaxHp, getPlayerMaxMp, getReincarnationInheritance, loadBossState, loadParty, renderPartyPanel, renderSkillComboPanel, renderStatusBar, unlockEnding, updateCombo, updateReputation } from '../misc/054-이동수단-시스템.js';
import { CHOICE_HISTORY_KEY, WORLD_STATE_KEY, detectConsequences, getLongTermChoiceEcho, loadWorldState, recordChoice, saveWorldState } from '../misc/066-②-선택-결과-추적-시스템.js';
import { renderFactionPanel, tickFactionGoals } from '../misc/068-전쟁-피해-플레이어-개입-시스템.js';
import { checkRandomEvents } from '../misc/072-파트1-B-랜덤-이벤트-시스템.js';
import { MATERIAL_BAG_KEY, renderCraftPanel, rollEventBlueprint, rollMaterialDrop } from '../misc/075-파트2-C-크래프팅-시스템.js';
import { DIARY_KEY, detectDiaryMoment, renderDiaryPanel } from '../misc/076-파트2-D-일기기록-시스템.js';
import { updateChallenge } from '../misc/164-도전-과제-달성률-시스템.js';
import { EVO_KEY, gainEvoEnergy, isEvoJob, loadEvolution, renderEvolution } from '../misc/206-3-진화Evolution-시스템.js';
import { autoSummarize, checkWorldConsistency, detectImmediateNarrativeHook, extractAndStorePermanentFacts, processResolvedHooks, trimMidByTurnBlocks } from '../misc/217-14-메모리-자동-요약.js';
import { discoverLocation } from '../misc/221-19-탐험-discoverLocation-loadExploredLocat.js';
import { renderPlotHookPanel } from '../misc/227-②-복선미해결-떡밥-트래커.js';
import { renderEndingCondPanel } from '../misc/228-④-엔딩클리어-조건-시스템.js';
import { detectMercNotorietyFromText, getFoodWaterPenalty, getMercBandStatBonus, getOverweightPenalty, getResidentMembers, loadMercBand, processCombatSystems } from '../misc/251-통합-처리-함수-매-AI-응답-후-호출.js';
import { renderEndingCompassPanel, renderMilestonePanel } from '../misc/261-block4-preamble.js';
import { pmGetBLS } from '../misc/275-선택-파트-업데이트.js';
import { renderDreamPanel } from '../misc/302-②-꿈환영-시스템.js';
import { recordNonPlayerChronicleEntry, renderChroniclePanel } from '../misc/303-③-자동-모험-연대기-Living-Chronicle.js';
import { renderAuctionPanel } from '../misc/314-⑤-이벤트-경매-시스템.js';
import { renderAlliancePanel } from '../misc/317-⑨-동맹배신-시스템.js';
import { renderGoalsPanel } from '../misc/318-⑩-플레이어-목표-노트.js';
import { clearNpcGrowth } from '../npc/031-NEW-NPC-성장-시스템-동료-레벨업-버프.js';
import { FACTION_KEY, NPC_NETWORK_KEY, checkFactionSecretTrigger, detectFactionChanges, getActiveWars, getCurrentFactions, loadFactionRep, renderWorldFigures, showFactionNewsToast, tickFactionSimulation, tickNpcBonds } from '../npc/067-③-NPC-관계망-시스템.js';
import { loadRomance } from '../npc/211-8-로맨스-시스템.js';
import { renderNpcAgendaPanel } from '../npc/305-⑤-NPC-비밀-아젠다-이중성-시스템.js';
import { renderPlayStatsPanel, saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { renderCollectionPanel, renderMomentsPanel, renderNpcGrowthPanel, renderNpcLegacyPanel, renderSeasonEventsPanel, renderUnfinishedPanel, renderWorldHistoryPanel } from '../patches/322-TaleForge-v58-매판-진득하게-살-수-있는-10가지-시스템.js';
import { checkAndGrantLegacyTitles } from '../progression/012-궁수-계열-T2-파생-5종-칭호-전사마법사도적-계열과-동일한-절제-원칙.js';
import { addMemoryFragment, getKarmaEffect, incrementWeaponAffinity, loadCycleCount, propagateFame, saveCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { drawFateCards, getBestiaryStatus, growPastLanguage, loadLanguages, progressWatcherGaze, recordEvilEyeKill, recordMonsterKill, recordRiftEncounter, resetTimeTokens, resetUndyingGaugeCycle, updateRecipeBook, upgradeHideout } from '../progression/018-5170번-환생-누적-시스템.js';
import { decipherInscriptionLine, getGamblingDebt, growInstinct, recordDejavuEvent, recordEmotionEcho, recordGamblingDebt, recordNatureAction, recordPetLegacy, resetCausalityOnReincarnate, tickApocalypse, visitCircus } from '../progression/019-71100번-환생-누적-시스템.js';
import { DARKLING_VOID_STAGES, DEMON_CORRUPTION_STAGES, DWARF_CRAFT_STAGES, ORC_HONOR_STAGES, applyCelestialCovenantStats, applyDemonCorruptionStats, applyDragonHeartStats, applyDwarfGrudgeStats, applyDwarfUnfinishedStats, applyElementalSystemStats, applyOrcBloodVowStats, applyOrcCouncilStats, avengeGrudgeFlower, checkCursedCycle, clearCelestialCovenant, clearCelestialScale, clearDarklingVoid, clearDemonCorruption, clearDragonHeart, clearDwarfCraft, clearElementalSystem, clearGorblood, clearNpcCraft, clearOrcHonor, detectCelestialCovenantFromText, detectCelestialScaleFromText, detectDarklingVoidFromText, getCelestialCovenantStatus, getCelestialPhase, getDragonBalancePhase, getElemAwakeningStage, getElemRestraintStage, loadCelestialScale, loadDarklingVoid, loadDeification, loadDemonCorruption, loadDragonHeart, loadDwarfCraft, loadElementalSystem, loadLoopAwareness, loadOrcHonor, overcameCursedCycle, recordActionPattern, renderCelestialScalePanel, renderDragonHeartPanel, renderDwarfCraftPanel, renderDwarfGrudgePanel, renderDwarfUnfinishedPanel, renderElementalSystemPanel, renderOrcBloodVowPanel, renderOrcCouncilPanel, renderVampireChroniclePanel, triggerMemoryFlood, witherGrudgeFlowers } from '../progression/020-101130번-환생-누적-시스템.js';
import { renderAchievementsPanel } from '../progression/088-업적-시스템-완전판-누적-보상-연결.js';
import { renderSummons, renderTitles } from '../progression/089-칭호-시스템-완전판-1개-활성화-스탯-효과-적용.js';
import { checkAchievements, checkAdvancedAchievements, checkHiddenAchievements, loadAchievements, unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { renderButterflyPanel } from '../progression/192-UI-5-나비효과-패널.js';
import { recordHallOfFame } from '../progression/194-NEW-1-명예의-전당-Hall-of-Fame.js';
import { triggerLoopIfDead } from '../progression/220-18-회차루프-시스템.js';
import { GEMINI_FALLBACK_MODELS } from '../data/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { callLocalModel, callLocalModelJSON, logLocalModelEvent, tryCloudThenLocalModelThenBank } from '../quest/331-로컬-AI-모델-엔진.js';
import { callGeminiDirect } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { RACE_DEFS, clearRace, loadApiKeys, loadKeyIndex } from '../race/013-종족-시스템.js';
import { clearShadowPact } from '../race/024-4-그림자-협약-시스템-다크링-핵심-협상-도구.js';
import { applyDemonContractStats, renderDemonContractPanel } from '../race/027-악마족-계약-장부-시스템-Demon-Contract-Ledger.js';
import { addRoleReversal, addToKillList, applyTrueNameStats, assignWorldWill, evolvNaturalLaw, growMentalCorruption, growSoulFrequency, loadBondTree, loadLoopersGuild, rankUpGuild, recordCyberImprint, recordSwordTechnique, renderDemonTrueNamePanel, triggerSwordGhost, viewCinemaScene } from '../race/028-악마족-진명-시스템-Demon-True-Name.js';
import { getRaceContent, unlockRaceRoute } from '../race/038-NEW-종족-전용-스토리-루트.js';
import { FIVE_CONTINENTS, JOB_TURN_KEY, checkJobMasterySkillUnlock, updateJobTurns } from '../race/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js';
import { renderUndeadBorrowedTimePanel } from '../race/258-언데드-패널-렌더.js';
import { applyBeastWildlawStats, clearBeastWildlaw, getBeastBloodStage, getBeastPackRankStage, loadBeastWildlaw } from '../race/259-수인족-야생의-법칙-Law-of-the-Wild-시스템.js';
import { BEAST_AWAKENING_STAGES, applyBeastAwakeningStats, applyBeastLineageStats, applyBeastPackBondStats, checkDemesneUnlockTrigger, clearBeastAwakening, loadBeastAwakening, loadDemesne, renderBeastAwakeningPanel, renderBeastLineagePanel, renderBeastPackBondPanel, renderBeastWildlawPanel } from '../race/260-수인족-패널-렌더.js';
import { clearVoidSummon } from '../summon/023-3-균열-소환-시스템.js';
import { ELF_MEMORY_STAGES, HUMAN_AWAKENING_STAGES, applyElfEmotionStats, applyElfForgettingStats, clearElfMemory, clearNpcInspire, loadElfMemory, loadHumanAwakening, renderElfEmotionPanel, renderElfForgettingPanel, renderElfMemoryPanel } from '../ui/025-통합-패널-공허-확장-탭-시스템.js';
import { applyHumanLegacyStats, applyHumanStigmaStats, checkDominationAbility, clearNpcCorruption, clearThrall, renderHumanLegacyPanel, renderHumanStigmaPanel, renderSocialRankPanel } from '../ui/026-renderHumanAwakeningPanel-완전-재정의.js';
import { EXPLORE_KEY, STATUS_STATE_KEY, buySealHintFromSilver, checkTrueEndingCondition, getActiveEffects, getBossPhaseBLS, getSilverSealPrice, loadSealDiscovery, renderSaveSlotPanel, tickStatusEffects } from '../ui/155-⑭-메모리-패널-UI.js';
import { renderStoryMarkdown } from '../ui/231-스토리서사-캐릭터-성장-UIUX-개선-시스템.js';
import { $, esc, isBlockingPopupOpen, lsDel, lsGet, lsSet, toast } from '../utils.js';
import { checkHiddenQuestsLocal } from './041-궁수-계열-T2-파생-5종-히든-퀘스트-전사마법사도적-계열과-동일한-뼈대.js';
import { getScenarioEvent } from '../world/034-NEW-세계관별-고유-이벤트-테이블.js';
import { CURRENT_LOC_KEY, getLocationLevelBand, getLocationPowerScale, loadCurrentLocation, loadLocEco, onLocMonsterKilled, pickWeightedLocEcoName, registerLocEcoEncounter, renderLocationPanel, saveCurrentLocation, saveLocEco, tickLocEcosystem } from '../world/052-동대륙-추가-장소-4.js';
import { WORLD_REACTION_KEY, checkWorldReactions, renderWorldReactions } from '../world/070-⑤-세계-반응-시스템.js';
import { getWeatherStatModifier, notifyWeatherChange } from '../world/073-파트2-A-날씨-게임플레이-반영.js';
import { _drainQueue, enqueueAITask, estimateTokens, trimHistory } from '../world/085-대륙-스타팅-시스템.js';
import { clearReligionState } from '../world/091-2-저장소.js';
import { loadGSFlags, saveGSFlags } from '../world/145-⑥-세계-상태-DB.js';
import { renderFactionPowerPanel } from '../world/190-UI-3-세력-힘의-구도-시각화.js';
import { TIME_COST_PER_DAY, advanceTimeByAction, getCurrentEncounterMult, loadTimeCost } from '../world/214-11-날씨-자동-순환.js';
import { renderCodexPanel } from '../world/304-④-세계-신화-백과사전.js';
import { renderWorldCalendarPanel } from '../world/306-⑥-세계-시간-달력-시스템-확장.js';
import { renderMapNotesPanel } from '../world/311-④-탐험-메모-지도-시스템.js';
import { renderPoliticalMapPanel } from '../world/315-⑥-대륙-정치-지도.js';
import { HIDDEN_QUEST_KEY } from './039-NEW-히든-퀘스트-시스템.js';
import { checkQuestCompletion } from './209-6-퀘스트-완료실패자동체크.js';
import { checkNpcDlgQuestCompletion } from './229-NPC-대화-퀘스트-시스템-AI-생성.js';

window._qapPending = null;

export function showQuestAcceptPopup(questData, onAccept, onDecline){
  // 이미 팝업 열려있으면 무시 (중복 방지)
  if(document.getElementById('quest-accept-popup')?.classList.contains('open')) return;
  // [버그 수정] 다른 전체화면 팝업(전직 제안·돌발 이벤트 등)이 이미 열려
  // 있으면 겹쳐 뜨지 않도록 잠시 후 재시도한다 — 두 팝업이 동시에 뜨면
  // 위의 것을 닫아도 아래 팝업이 그대로 남아 입력이 계속 막힌 것처럼
  // 보이는 문제가 있었다.
  if(isBlockingPopupOpen('quest-accept-popup')){
    setTimeout(()=>showQuestAcceptPopup(questData, onAccept, onDecline), 1200);
    return;
  }

  window._qapPending = { questData, onAccept, onDecline };

  const q    = questData;
  const r    = q.reward || {};
  const diff = q.difficulty || 'normal';
  const grade = q.grade || null;
  const gi    = (typeof QUEST_GRADES !== 'undefined' && grade) ? QUEST_GRADES[grade] : null;

  const popup = document.getElementById('quest-accept-popup');
  const inner = document.getElementById('quest-accept-inner');

  // ── 등급별 팝업 스타일 ──
  if(gi){
    inner.style.borderColor = gi.color;
    inner.style.boxShadow   = `0 0 40px ${gi.glow}, inset 0 0 0 1px ${gi.color}44`;
    // 배경 미묘한 틴트
    inner.style.background  = grade === 'S' ? '#0d0200' : grade === 'A' ? '#080900' : 'var(--panel)';
  } else {
    inner.style.borderColor = 'var(--gold)';
    inner.style.boxShadow   = '0 0 40px rgba(200,169,110,.25), inset 0 0 0 1px #2a1a05';
    inner.style.background  = 'var(--panel)';
  }

  // 배지 텍스트
  const badgeEl = inner.querySelector('.qap-badge');
  if(badgeEl){
    if(gi){
      badgeEl.textContent = gi.badge + ' ' + gi.label;
      badgeEl.style.color = gi.color;
      badgeEl.style.borderColor = gi.color + '66';
      badgeEl.style.background  = gi.color + '15';
      // S등급: 깜빡임 애니메이션
      if(grade === 'S'){
        badgeEl.style.animation = 'questSGlow 1.5s ease-in-out infinite';
      } else {
        badgeEl.style.animation = '';
      }
    } else {
      badgeEl.textContent = '✦ 새로운 의뢰 ✦';
      badgeEl.style.color = 'var(--gold)';
      badgeEl.style.borderColor = '';
      badgeEl.style.background = '';
      badgeEl.style.animation = '';
    }
  }

  // 아이콘 / 제목
  document.getElementById('qap-icon').textContent  = q.icon || '📋';
  const titleEl = document.getElementById('qap-title');
  titleEl.textContent = q.title || '의뢰';
  titleEl.style.color = gi ? gi.color : 'var(--gold)';

  // NPC 표시
  const npcEl = document.getElementById('qap-npc');
  if(q.npcName){ npcEl.textContent = `${q.npcIcon||'👤'} ${q.npcName} 의 의뢰`; npcEl.style.display='block'; }
  else npcEl.style.display = 'none';

  // 난이도
  const diffEl = document.getElementById('qap-diff');
  const diffLabels = { easy:'쉬움 EASY', normal:'보통 NORMAL', hard:'어려움 HARD', legendary:'전설 LEGENDARY' };
  diffEl.className = 'qap-diff ' + diff;
  diffEl.textContent = diffLabels[diff] || diff.toUpperCase();

  // 설명
  document.getElementById('qap-desc').textContent = q.desc || '';

  // 보상
  const rewardEl = document.getElementById('qap-rewards');
  const chips = [];
  if(r.gold)  chips.push(`💰 골드 ${r.gold}`);
  if(r.exp)   chips.push(`✨ 경험치 ${r.exp}`);
  if(r.item)  chips.push(`🎁 ${r.item}`);
  const chipColor = gi ? gi.color+'44' : '#0a1505';
  const chipBorder = gi ? gi.color+'88' : '#3a6a1a';
  rewardEl.innerHTML = chips.map(c=>`<span class="qap-reward-chip" style="background:${chipColor};border-color:${chipBorder};color:${gi?gi.color:'#80c040'}">${c}</span>`).join('');

  // 배경설정
  const loreEl = document.getElementById('qap-lore');
  if(q.lore){ loreEl.textContent = q.lore; loreEl.style.display='block'; }
  else loreEl.style.display = 'none';

  // 수락 버튼 스타일
  const acceptBtn = document.getElementById('qap-btn-accept');
  if(acceptBtn && gi){
    const gc = gi.color;
    acceptBtn.style.background  = `linear-gradient(135deg, ${gc}18, ${gc}28)`;
    acceptBtn.style.borderColor = gc + '88';
    acceptBtn.style.color       = gc;
    // S등급이면 텍스트 강조
    acceptBtn.textContent = grade === 'S' ? '⚔️ 운명을 받아들인다' : grade === 'A' ? '✦ 의뢰를 수락한다' : '✦ 수락하겠습니다';
  } else if(acceptBtn){
    acceptBtn.style.background  = '';
    acceptBtn.style.borderColor = '';
    acceptBtn.style.color       = '';
    acceptBtn.textContent = '✦ 수락하겠습니다';
  }

  popup.classList.add('open');
}
window.showQuestAcceptPopup = showQuestAcceptPopup;

export function questPopupAccept(){
  if(!window._qapPending) return;
  const { onAccept } = window._qapPending;
  window._qapPending = null;
  document.getElementById('quest-accept-popup').classList.remove('open');
  if(typeof onAccept === 'function') onAccept();
}
window.questPopupAccept = questPopupAccept;

export function questPopupDecline(){
  if(!window._qapPending) return;
  const { onDecline } = window._qapPending;
  window._qapPending = null;
  document.getElementById('quest-accept-popup').classList.remove('open');
  if(typeof onDecline === 'function') onDecline();
}
window.questPopupDecline = questPopupDecline;

// [자유도 튜닝] 자유 텍스트 입력을 아예 안 쓰기로 한 플레이 스타일에서는
// "선택지 클릭"이 사실상 유일한 진행 수단이 된다 — 그런데 이 재사용 캐시는
// 원래 선택지 클릭에만 적용되므로, 기준을 너무 낮게 잡으면 같은 상황을
// 반복 방문할 때 선택지가 금방 "예전에 봤던 것"으로 수렴해버린다. API
// 호출을 줄인다는 목표는 유지하되, 재사용이 시작되는 시점을 훨씬 늦추고
// (5→8, 12→30) 아래 diversityRatio 안전장치 기준도 함께 높여서, 실제로
// 재사용이 걸릴 때쯤엔 풀 안에 변형이 충분히 쌓여 "재사용"이 체감상
// "신선함"과 거의 구분되지 않도록 한다.
export const ME_MIN_SAMPLES   = 8;


export const ME_POOL_MIN_SIZE = 30;


export const ME_RECENCY_HALFLIFE = 200;

// [자유도 튜닝] 선택지 클릭만으로도 자유 타이핑 못지않게 폭넓게 놀 수
//있으려면, 매 턴 AI가 내놓는 선택지 자체가 서로 다른 "성격"을 띠어야
// 한다 — 예전엔 "각 선택이 다른 방향을 제시할 것" 정도의 막연한 지침뿐이라
// 매번 전투/대화류로 수렴하기 쉬웠다. 선택지 생성 프롬프트 3곳
// (오프닝/매 턴/buildLightSystem 규칙 #19)이 전부 이 문구를 공유한다.
export const CHOICE_DIVERSITY_HINT = '성격이 다른 선택지를 섞을 것 — 전투/생존형, 대화/설득형, 실리/탐색형, 대담하거나 위험한 선택형 중 최소 2가지 이상 포함. NPC 호감도가 충분히 쌓였으면 가끔 관계 진전 방향을, 수상한 단서·소문을 좇을 만한 상황이면 가끔 숨겨진 장소나 퀘스트로 이어질 법한 선택지를 자연스럽게 섞어도 좋다';

// ══════════════════════════════════════════════════════════════════
// [로컬 선택지 재조합 생성기] — AI 호출도, 같은 상황의 반복 방문도 전혀
// 필요 없이 매 턴 하나 이상의 선택지를 그 자리에서 새로 조합해낸다.
// Memory-Echo(위 ME_* 캐시)는 "과거에 실제로 AI가 만든 문장"만 재생할 수
// 있어서 다양성의 천장이 실제 AI 호출 횟수에 묶여있는데, 이건 반대로
// 사람이 미리 준비해둔 문장 틀(템플릿) × 그때그때 실제 게임 상태(NPC 이름,
// 장소, 몬스터 등)를 조합하는 방식이라 — 다른 로그라이크 게임들이 "단어
// 몇 개를 재조합해 수만 가지 문장을 낸다"는 것과 같은 원리다. 템플릿
// 10개 × 슬롯을 채울 대상 몇 가지만 있어도, 매번 다른 장소·NPC와
// 맞물리면서 체감 다양성은 훨씬 커진다. 이 결과는 항상 CHOICE_DIVERSITY_HINT
// 카테고리(전투/생존, 대화/설득, 실리/탐색, 대담/위험) 중 하나를 골라
// AI가 준 선택지 뒤에 추가로 붙는다 — AI의 선택지를 대체하지 않는다.
// [한글 조사 처리] {t}로 채워 넣는 대상(NPC/몬스터/장소 이름 등)은 매번
// 받침 유무가 달라지므로("사람"엔 "과", "그림자"엔 "와"), 조사를 템플릿에
// 그냥 박아두면 절반은 문법이 깨진다 — {t:을를}처럼 조사 종류를 표시해두고
// 실제로 채울 때 마지막 글자의 받침 유무를 계산해서 맞는 쪽을 붙인다.
function _josa(word, type){
  const ch = String(word||'').trim().slice(-1);
  const code = ch.charCodeAt(0);
  const isHangul = code>=0xAC00 && code<=0xD7A3;
  const finalIdx = isHangul ? (code-0xAC00)%28 : 0;
  const hasBatchim = isHangul && finalIdx!==0;
  const isRieul = isHangul && finalIdx===8;
  switch(type){
    case '은는': return hasBatchim ? '은' : '는';
    case '이가': return hasBatchim ? '이' : '가';
    case '을를': return hasBatchim ? '을' : '를';
    case '과와': return hasBatchim ? '과' : '와';
    case '로':   return (!hasBatchim || isRieul) ? '로' : '으로';
    default: return '';
  }
}
// {t:종류} 마커를 실제 단어+조사로 치환한다. {t}만 있고 종류가 없으면
// (에게/의처럼 받침과 무관한 조사가 템플릿에 이미 고정으로 붙어있는
// 경우) 단어만 채운다.
function _fillTargetSlots(tpl, word){
  return tpl.replace(/\{t(?::([^}]+))?\}/g, (_, type) => type ? word+_josa(word,type) : word);
}

// [14번 라운드 재설계] 예전엔 대화/실리/대담/경계 4개 카테고리였는데,
// 이 라벨들은 sendMsg()/getChoiceDiceHint()의 실제 판정 정규식
// (combatRe/stealthRe/persuadeRe/intimidateRe/searchRe/moveRe/magicRe/
// socialActionRe)과 대응 관계가 전혀 없어서, 선택지 문구가 그 정규식이
// 요구하는 정확한 단어를 못 담고 있으면 전부 luk(운) 판정으로 조용히
// 떨어졌다 — "카테고리는 다른데 결과는 다 비슷하다"는 체감의 진짜
// 원인. 이제 TURN_REACT_BANK와 완전히 같은 9개 키(공격/방어/위협/
// 은신/이동/마법/설득/탐색/사교)로 다시 설계하고, 각 문구는 위
// 정규식들이 실제로 요구하는 리터럴 부분 문자열(예: "공격한다"→
// combatRe의 "공격"+"한다", "위협한다"→intimidateRe의 완전한 리터럴)을
// 정확히 포함하도록 손으로 검증하며 썼다 — 그래서 어떤 선택지를
// 고르느냐가 실제로 다른 스탯 판정, 다른 TURN_REACT_BANK 카테고리로
// 이어진다.
const LOCAL_FLAVOR_TEMPLATES = {
  attack: [
    '{t}에게 달려들어 곧장 공격한다',
    '빈틈을 노려 {t:을를} 기습한다',
    '단숨에 거리를 좁혀 {t:을를} 급습한다',
    '{t}의 목을 노리고 일격을 가해 공격한다',
    '몰아붙일 기회를 잡아 {t:을를} 공격한다',
    '예리하게 {t:을를} 노려 강타한다',
    '빈틈을 놓치지 않고 {t:을를} 가격한다',
    '주저 없이 무기를 들어 {t:을를} 공격한다',
    '허를 찔러 {t:을를} 제압한다',
    '{t}에게 폭탄을 던져 공격한다',
  ],
  defend: [
    '{t}의 공격을 정면으로 막아낸다',
    '무기를 들어 자세를 잡고 방어한다',
    '{t:이가} 휘두른 일격을 막아낸다',
    '틈을 노려 {t:을를} 반격한다',
    '방패를 앞세워 방어한다',
    '{t}의 다음 수를 읽고 막아낸다',
    '뒤로 물러서지 않고 그대로 방어한다',
    '{t}의 기세를 되받아쳐 반격한다',
    '몸을 낮춰 공격을 막아낸다',
    '{t}가 날린 일격을 막아낸다',
  ],
  fear: [
    '{t:을를} 향해 무기를 들이대며 위협한다',
    '낮고 차가운 목소리로 {t:을를} 협박한다',
    '{t}에게 단호하게 경고하며 위협한다',
    '물러서지 않을 것을 알리며 {t:을를} 위협한다',
    '{t}의 눈을 똑바로 보며 겁주려는 듯 노려본다',
    '가만두지 않겠다고 말하며 {t:을를} 협박한다',
    '{t:을를} 몰아붙이듯 압박한다',
    '칼끝을 들이밀며 {t:을를} 위협한다',
    '{t}에게 으름장을 놓는다',
    '물러서라며 {t:을를} 겁박한다',
  ],
  stealth: [
    '평범한 행인인 척 위장한다',
    '{t}의 눈을 속이려 다른 사람인 척 변장한다',
    '아무것도 모르는 척 위장한다',
    '{t}에게 정체를 들키지 않도록 위장한다',
    '태연한 척 위장하며 동요를 감춘다',
    '{t:을를} 속이려 모르는 척 시치미를 뗀다',
    '표정을 숨기며 침착한 척한다',
    '{t}의 의심을 피하려 위장한다',
    '전혀 다른 용무가 있는 척 위장한다',
    '위장한 채 {t}에게 들키지 않게 접근한다',
  ],
  move: [
    '지체 없이 몸을 돌려 도망친다',
    '{t:로}부터 곧장 도주한다',
    '틈을 놓치지 않고 재빨리 도망친다',
    '뒤도 돌아보지 않고 달려 나간다',
    '{t}의 손이 닿기 전에 빠져나온다',
    '좁은 틈으로 재빨리 벗어나 몸을 피한다',
    '있는 힘껏 달려 거리를 벌린다',
    '{t}를 뒤로하고 곧장 도망친다',
    '지형을 이용해 벗어나 거리를 벌린다',
    '숨 돌릴 틈 없이 계속 달려 나간다',
  ],
  magic: [
    '마력을 끌어모아 주문을 시전한다',
    '{t:을를} 향해 마법을 시전한다',
    '손끝에 마나를 모아 주문을 시전한다',
    '치유의 마법을 시전한다',
    '{t}에게 걸린 저주를 풀려 주문을 시전한다',
    '방어 결계를 세우려 마법을 시전한다',
    '오래 익힌 마법을 시전한다',
    '{t:을를} 제압할 봉인 마법을 시전한다',
    '몸에 걸린 상처를 회복하려 치유 마법을 시전한다',
    '주변을 밝히는 마법을 시전한다',
  ],
  persuade: [
    '{t:을를} 차분한 말로 설득한다',
    '{t}에게 지금 필요한 걸 짚으며 설득한다',
    '진심을 담아 {t:을를} 설득한다',
    '{t}와 조건을 걸고 협상한다',
    '작은 대가를 걸며 {t:과와} 흥정한다',
    '{t}에게 도움이 될 거라며 설득한다',
    '한 걸음 물러서는 척 {t:과와} 협상한다',
    '{t}의 사정을 헤아리며 설득한다',
    '서로에게 이득이 될 거라 {t:을를} 설득한다',
    '{t}에게 정중히 부탁한다',
  ],
  search: [
    '주변을 꼼꼼히 조사한다',
    '{t}의 주변을 자세히 조사한다',
    '놓친 단서가 없는지 조사한다',
    '흔적을 쫓으며 상황을 조사한다',
    '구석구석 뒤져 단서를 조사한다',
    '{t}에게서 나는 냄새를 맡아 살펴본다',
    '발견한 흔적을 곰곰이 분석하며 조사한다',
    '숨겨진 것이 없는지 서랍을 열어 조사한다',
    '주변 상황을 침착하게 분석하고 조사한다',
    '{t:이가} 남긴 자취를 조사한다',
  ],
  social: [
    '{t}에게 다가가 먼저 말을 건다',
    '{t:과와} 인사를 건네며 접근한다',
    '자연스럽게 {t}에게 말을 건다',
    '{t}에게 손을 내밀며 인사를 건넨다',
    '분위기를 살피며 {t}에게 말을 건다',
    '{t}에게 먼저 정체를 밝히며 인사를 건넨다',
    '조심스레 {t}에게 다가가 말을 건다',
    '{t:과와} 가볍게 손을 내밀어 인사한다',
    '{t}의 곁으로 다가가 말을 건다',
    '{t}에게 부드럽게 말을 건다',
  ],
};

// 카테고리별로 {t} 슬롯에 넣을 실제 대상을 우선순위대로 고른다 —
// 그 장면에 실제로 있는 NPC/몬스터/장소 이름을 최우선으로 쓰고, 없으면
// 카테고리에 어울리는 일반 명사로 대체한다(그래도 매번 랜덤이라 문장은
// 계속 달라진다).
const LOCAL_FLAVOR_FALLBACK_TARGETS = {
  attack: ['눈앞의 위협', '가로막은 무언가', '적대적인 기척'],
  defend: ['날아드는 공격', '눈앞의 위협', '다가오는 기척'],
  fear: ['앞을 막아선 이', '위협적인 존재', '수상한 자'],
  stealth: ['가까이 있는 이', '지켜보는 이', '경계하는 이들'],
  move: ['위험한 상황', '눈앞의 위협', '이 자리'],
  magic: ['눈앞의 상황', '주변의 기운', '위태로운 순간'],
  persuade: ['가까이 있는 사람', '상대', '눈앞의 인물'],
  search: ['주변 물건', '바닥에 떨어진 것', '근처의 무언가'],
  social: ['가까이 있는 사람', '지나가던 이', '주변 사람'],
};

function _localFlavorPickTarget(category){
  try{
    const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]).filter(m=>m.status==='alive') : [];
    if(category==='attack' || category==='defend' || category==='fear'){
      if(monsters.length) return monsters[0].name;
      const npcs0 = (typeof loadNPCs==='function') ? (loadNPCs()||[]) : [];
      const hostile = npcs0.find(n=>n.relation==='hostile'||n.relation==='enemy');
      if(hostile) return hostile.name;
    }
    const npcs = (typeof loadNPCs==='function') ? (loadNPCs()||[]) : [];
    if((category==='social' || category==='persuade' || category==='stealth') && npcs.length){
      return npcs[Math.floor(Math.random()*npcs.length)].name;
    }
    if(category==='search'){
      const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
      if(loc?.name) return loc.name+'의 물건들';
    }
    if(monsters.length) return monsters[0].name;
    if(npcs.length) return npcs[Math.floor(Math.random()*npcs.length)].name;
  }catch(e){}
  const fb = LOCAL_FLAVOR_FALLBACK_TARGETS[category] || ['상황'];
  return fb[Math.floor(Math.random()*fb.length)];
}

// count개의 로컬 선택지를 서로 다른 카테고리에서 뽑아 반환한다 —
// AI 호출도, 이 상황을 예전에 몇 번 겪었는지도 전혀 상관없이 매번 즉석
// 조합이라 항상 신선하다.
export function generateLocalFlavorChoices(count){
  const categories = Object.keys(LOCAL_FLAVOR_TEMPLATES).sort(()=>Math.random()-0.5);
  const out = [];
  for(let i=0; i<Math.min(count, categories.length); i++){
    const cat = categories[i];
    const templates = LOCAL_FLAVOR_TEMPLATES[cat];
    const tpl = templates[Math.floor(Math.random()*templates.length)];
    const text = _fillTargetSlots(tpl, _localFlavorPickTarget(cat));
    out.push(text);
  }
  return out;
}
window.generateLocalFlavorChoices = generateLocalFlavorChoices;
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════
// [숨겨진 장소 로컬 발견 규칙] — hidden_location_found GS 필드는 AI가
// discoveryHint(예: "오크와의 우호적 접촉", "밤에 방문")를 읽고 스스로
// 판단해야만 나온다. 그런데 이 판단은 Memory-Echo 캐시가 그 턴을 대신
// 처리한 턴에는 절대 새로 일어나지 않고(과거 gs가 재생될 뿐), API 호출이
// 아예 없는 미래에는 한 번도 일어날 수 없다 — 즉 지금 구조로는 이
// 4곳(오크 은신처·위장 저택가·균열의 안식처·죽음의 계곡)이 AI 없이는
// 영원히 발견 불가능한 죽은 콘텐츠가 된다.
// (히든 퀘스트로 잠긴 나머지 3곳 — 태초의 화로/전설의 사냥터/감시자의
// 영역 — 은 의도적으로 손대지 않는다. 그 퀘스트들의 완료 판단 자체가
// AI 서사 의존적이라 여기서 로컬 규칙으로 우회하면 안 된다.)
// 여기서는 이미 게임이 매 턴 추적하는 값(현재 위치의 대륙, 시간대, 대륙별
// 누적 체류 턴수)만으로 같은 발견을 로컬에서 대신 보장한다. AI가 여전히
// 서사로 먼저 발견시켜준다면 그 경로도 그대로 살아있다 — 이미 발견된
// id는 두 경로 모두 tf-discovered-hidden-locs를 공유하므로 중복 없이
// 자연스럽게 합쳐진다.
export function checkHiddenLocationDiscoveryLocal(){
  try{
    const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    if(!loc || !loc.continent) return;
    const discovered = JSON.parse(lsGet('tf-discovered-hidden-locs')||'[]');
    const timeBand = _meTimeBand();

    // 대륙별 누적 체류 턴수 — 턴마다 현재 위치의 대륙 카운터를 1 올린다.
    const visits = JSON.parse(lsGet('tf-continent-visit-count')||'{}');
    visits[loc.continent] = (visits[loc.continent]||0) + 1;
    lsSet('tf-continent-visit-count', JSON.stringify(visits));

    const unlock = (id) => {
      if(discovered.includes(id)) return;
      discovered.push(id);
      lsSet('tf-discovered-hidden-locs', JSON.stringify(discovered));
      const target = (typeof window.getAllLocations==='function') ? window.getAllLocations().find(l=>l.id===id) : null;
      toast(`🗝️ 숨겨진 장소를 발견했다: ${target?.name||id}`, 4000);
    };

    // 은둔부족 거점 그롬바르 — 북부 변경 깊숙이 들어가는 모험(북부 누적 3턴↑)
    if(!discovered.includes('loc_orc_warcamp') && (visits.north||0) >= 3) unlock('loc_orc_warcamp');
    // 위장 저택가 — 중앙대륙에서 밤을 맞이함
    if(!discovered.includes('loc_vampire_manor') && loc.continent==='central' && timeBand==='밤') unlock('loc_vampire_manor');
    // 균열의 안식처 — 동남대륙(해적 군도) 깊숙이 들어가는 모험
    if(!discovered.includes('loc_darkling_breach') && (visits.southeast||0) >= 3) unlock('loc_darkling_breach');
    // 죽음의 계곡 — 북부 변경에서 밤을 맞이함(오크 거점과는 밤 조건으로 구분)
    if(!discovered.includes('loc_undead_necropolis') && loc.continent==='north' && timeBand==='밤') unlock('loc_undead_necropolis');
  }catch(e){}
}
window.checkHiddenLocationDiscoveryLocal = checkHiddenLocationDiscoveryLocal;
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════
// [로컬 턴 서사 엔진] — callAI 자체를 대체하는 로컬 조합기. 자유 텍스트
// 입력을 없애고 선택지 클릭만 남긴 결정에 따라, sendMsg가 이미 계산해서
// injectedContext에 실어 보내는 결정론적 판정 정보(행동 카테고리로 쓰인
// 스탯, d100 굴림 결과, 대성공/성공/실패/대실패)만으로 반응 문장을
// 조합한다. AI에게 필요했던 건 "자유 텍스트 이해"가 아니라 이미 계산된
// 판정 결과를 "그럴듯한 문장으로 포장"하는 것뿐이었다는 점에 착안.
// 다운스트림(HP/MP/스탯/골드 정규식, 선택지 파싱, <gs> 처리)은 전부
// AI가 반환하던 것과 같은 텍스트 포맷만 보고 동작하므로, 이 함수가 같은
// 포맷의 문자열만 돌려주면 다른 코드는 한 줄도 안 건드려도 된다.
const TURN_REACT_BANK = {
  attack: {
    crit: ['{t}의 빈틈을 정확히 파고들어, 결정적인 일격을 꽂아 넣는다. 반격할 틈조차 주지 않는다.', '몸이 먼저 움직인다 — {t:은는} 미처 반응하지 못하고 치명적인 타격을 그대로 받아낸다.', '완벽한 각도로 파고든 일격이 {t}의 급소를 정확히 꿰뚫는다.', '숨 쉴 틈도 주지 않는 연속 공격에 {t:이가} 그대로 무너진다.'],
    success: ['{t:을를} 향해 매섭게 파고들어 확실히 타격을 먹인다.', '노림수가 통했다. {t}에게 제대로 된 일격이 꽂힌다.', '단단히 힘을 실은 공격이 {t}에게 그대로 적중한다.', '거리를 좁혀 {t:을를} 확실하게 몰아붙인다.'],
    fail: ['{t:이가} 한발 빨리 움직여, 공격이 허공을 가른다.', '거리 계산이 어긋나 {t}에게 제대로 닿지 않는다.', '{t:이가} 몸을 틀어 피하는 바람에 헛손질만 하고 만다.', '힘만 잔뜩 들어간 채 {t}에게 제대로 스치지도 못한다.'],
    critfail: ['균형을 잃고 크게 휘청인다 — {t}에게 오히려 빈틈을 내주고 만다.', '무리하게 힘을 준 탓에 자세가 무너지며, 위험한 틈이 생긴다.', '헛디딘 발끝에 자세가 완전히 무너져, {t}에게 역으로 노림수를 내준다.', '무기를 놓칠 뻔하며 자세가 크게 흐트러진다.'],
  },
  defend: {
    crit: ['완벽한 타이밍으로 막아내며, {t}의 공세를 무력화시킨다.', '한 치의 오차도 없이 받아넘긴다 — {t:이가} 오히려 균형을 잃는다.', '흠잡을 데 없는 자세로 받아치며, {t}의 다음 수까지 미리 읽어낸다.', '{t}의 공격을 완벽히 흘려내며 곧바로 유리한 자세를 잡는다.'],
    success: ['제때 막아내며 피해를 최소화한다.', '{t}의 공격을 어렵지 않게 받아넘긴다.', '단단히 자세를 잡고 {t}의 공격을 무사히 막아낸다.', '충격을 크게 줄이며 {t}의 공세를 견뎌낸다.'],
    fail: ['막아섰지만 완전히 흘려내지 못해 충격이 전해진다.', '{t}의 힘에 밀려 자세가 무너진다.', '방어는 했지만 반동을 다 흡수하지 못해 몸이 휘청인다.', '{t}의 공격 일부가 방어선을 뚫고 스친다.'],
    critfail: ['방어가 완전히 뚫린다 — {t}의 공격이 그대로 꽂힌다.', '엉뚱한 방향으로 몸을 틀어, 무방비 상태가 되고 만다.', '막으려던 자세가 오히려 {t}에게 틈을 내주고 만다.', '반응이 한발 늦어 {t}의 공격을 고스란히 받아낸다.'],
  },
  fear: {
    crit: ['서슬 퍼런 기세에 {t:이가} 완전히 얼어붙는다.', '눈빛만으로 {t:을를} 제압한다 — 저항할 엄두조차 내지 못한다.', '{t}의 얼굴에서 핏기가 가신다 — 더 이상 맞설 생각조차 못한다.', '압도적인 기세에 {t:이가} 그 자리에서 굳어버린다.'],
    success: ['위협이 먹힌다. {t}의 표정에 동요가 스친다.', '{t:이가} 한 걸음 물러서며 경계한다.', '{t}의 눈빛이 흔들린다 — 위협이 제대로 먹힌 듯하다.', '목소리에 실린 기세에 {t:이가} 주춤한다.'],
    fail: ['{t:은는} 별다른 동요 없이 받아넘긴다.', '위협이 크게 와닿지 않은 듯, {t}의 태도는 그대로다.', '{t:이가} 오히려 코웃음을 치며 물러서지 않는다.', '위협의 무게가 부족했는지 {t}는 태연하다.'],
    critfail: ['오히려 {t:을를} 자극해, 상황이 더 험악해진다.', '위협이 역효과를 낸다 — {t}의 눈빛이 사나워진다.', '섣부른 위협이 {t}의 분노에 기름을 붓는다.', '{t:이가} 더 이상 참지 않겠다는 듯 태도가 돌변한다.'],
  },
  stealth: {
    crit: ['그림자에 완전히 녹아든다 — {t:은는} 존재조차 눈치채지 못한다.', '숨소리 하나 흘리지 않고, 완벽하게 몸을 숨긴다.', '조명과 그림자를 완벽히 읽어내며 흔적조차 남기지 않는다.', '{t}의 코앞을 스쳐 지나도 전혀 눈치채지 못한다.'],
    success: ['들키지 않고 자리를 잡는다.', '{t}의 시선을 피해 무사히 은신한다.', '숨을 죽인 채 {t}의 경계망을 무사히 통과한다.', '적당한 그림자를 찾아 무리 없이 몸을 숨긴다.'],
    fail: ['완전히 숨지 못해, {t}의 시선이 잠깐 스친다.', '몸을 숨기긴 했지만 어딘가 부자연스럽다.', '숨은 자세가 어설퍼, {t}가 뭔가 이상함을 느낀다.', '완전히 몸을 감추지 못해 그림자 끝이 드러난다.'],
    critfail: ['부스럭거리는 소리에 {t:이가} 곧바로 이쪽을 돌아본다.', '숨을 곳을 잘못 골라, 오히려 눈에 띄고 만다.', '발을 헛디뎌 소리가 나는 바람에 완전히 들통난다.', '{t}의 시야 한가운데로 그대로 걸어 들어가고 만다.'],
  },
  move: {
    crit: ['거침없이 내달려 순식간에 거리를 벌린다.', '몸놀림이 물 흐르듯 매끄럽다 — 단숨에 상황을 벗어난다.', '지형을 완벽히 읽어내며 최단 경로로 빠져나간다.', '단 한 번의 도약으로 위기를 통째로 넘어선다.'],
    success: ['무사히 움직여 원하는 위치로 이동한다.', '큰 무리 없이 이동을 마친다.', '적당한 속도로 안전하게 자리를 옮긴다.', '숨을 고르며 무사히 거리를 벌린다.'],
    fail: ['발이 꼬여 속도가 붙지 않는다.', '생각만큼 빠르게 움직이지 못한다.', '길을 잘못 짚어 잠시 헤맨다.', '숨이 차올라 속도가 눈에 띄게 줄어든다.'],
    critfail: ['발을 헛디뎌 크게 휘청인다.', '지형을 잘못 읽어 엉뚱한 곳으로 향하고 만다.', '발목이 꺾이며 그 자리에 주저앉을 뻔한다.', '앞이 막힌 길로 뛰어들어 오히려 발이 묶인다.'],
  },
  magic: {
    crit: ['마력이 완벽하게 응축되어, 강력한 힘이 뿜어져 나온다.', '주문이 한 치의 오차도 없이 완성된다.', '마나의 흐름이 완벽히 맞아떨어지며, 상상 이상의 위력이 터져 나온다.', '주문서에 적힌 그대로, 흠잡을 데 없이 마법이 완성된다.'],
    success: ['마력이 무리 없이 흘러나와 원하는 효과를 낸다.', '주문이 무사히 발동한다.', '집중이 잘 유지되며 마법이 원하는 대로 펼쳐진다.', '마나 순환이 안정적으로 이루어지며 주문이 완성된다.'],
    fail: ['마력이 흩어져 위력이 크게 줄어든다.', '집중이 흔들려 주문이 온전히 완성되지 않는다.', '마나가 예상보다 빨리 소진돼 효과가 약해진다.', '주문의 형태가 조금씩 어긋나며 위력이 줄어든다.'],
    critfail: ['마력이 역류해 반동이 몸을 덮친다.', '주문이 완전히 어긋나며, 예상 못한 부작용이 인다.', '마나 폭주로 손끝이 저릿하게 타들어간다.', '주문이 뒤틀리며 전혀 의도치 않은 결과를 낳는다.'],
  },
  persuade: {
    crit: ['말 한마디 한마디가 정확히 급소를 찌른다 — {t}의 마음이 완전히 돌아선다.', '논리와 진심이 함께 통했다. {t:이가} 순순히 고개를 끄덕인다.', '{t}의 가장 약한 지점을 정확히 짚어내며 설득이 완벽하게 통한다.', '더 이상 망설일 이유가 없다는 듯 {t:이가} 흔쾌히 동의한다.'],
    success: ['설득이 통한다. {t:이가} 조금씩 마음을 연다.', '{t:이가} 이야기를 진지하게 받아들인다.', '차분한 설명에 {t}의 경계가 서서히 풀린다.', '{t:이가} 고민 끝에 제안을 받아들이기로 한다.'],
    fail: ['{t:은는} 여전히 완고하게 버틴다.', '말이 제대로 와닿지 않은 듯, {t}의 표정이 굳어 있다.', '{t:이가} 팔짱을 끼며 쉽게 마음을 열지 않는다.', '설득의 논리가 부족했는지 {t}는 고개를 젓는다.'],
    critfail: ['말실수가 {t}의 심기를 건드린다.', '오히려 {t}의 불신만 키우고 만다.', '섣부른 말이 {t}의 자존심을 건드려 분위기가 얼어붙는다.', '{t:이가} 더는 들을 필요 없다는 듯 등을 돌린다.'],
  },
  search: {
    crit: ['숨겨져 있던 단서가 한눈에 들어온다 — 놓칠 뻔한 것까지 전부 짚어낸다.', '예리한 관찰 끝에, 결정적인 흔적을 찾아낸다.', '작은 위화감 하나까지 놓치지 않고 핵심 단서를 정확히 짚어낸다.', '누구도 눈치채지 못했을 흔적까지 완벽하게 찾아낸다.'],
    success: ['눈에 띄지 않던 것을 발견한다.', '차분히 살핀 끝에 쓸 만한 단서를 얻는다.', '꼼꼼히 훑어본 끝에 의미 있는 흔적을 찾아낸다.', '시간을 들인 만큼 쓸모 있는 정보를 얻는다.'],
    fail: ['별다른 소득 없이 시간만 흐른다.', '눈에 띄는 건 찾지 못한다.', '이곳저곳 살펴봤지만 이렇다 할 단서가 없다.', '주의 깊게 살폈지만 특별한 건 발견하지 못한다.'],
    critfail: ['엉뚱한 곳을 뒤지느라 정작 중요한 걸 놓친다.', '서두르다 흔적을 훼손하고 만다.', '조급함에 정작 결정적인 단서를 놓치고 만다.', '헛짚은 방향으로 시간을 낭비하고 만다.'],
  },
  social: {
    crit: ['대화가 예상보다 훨씬 부드럽게 흘러간다 — {t:이가} 마음을 활짝 연다.', '분위기를 완벽하게 읽어내며, {t:과와} 거리가 확 가까워진다.', '한마디 한마디가 절묘하게 맞아떨어지며 {t:이가} 금세 마음을 놓는다.', '{t}의 표정이 눈에 띄게 밝아지며 대화가 술술 풀린다.'],
    success: ['자연스럽게 대화가 이어진다.', '{t:과와} 무난하게 말을 주고받는다.', '편안한 분위기 속에 이야기가 오간다.', '{t:이가} 별 거리낌 없이 말을 받아준다.'],
    fail: ['대화가 어색하게 겉돈다.', '분위기를 제대로 못 살려, {t}의 반응이 미적지근하다.', '어색한 침묵이 잠시 흐른다.', '{t}와의 대화가 좀처럼 매끄럽게 풀리지 않는다.'],
    critfail: ['말실수로 분위기가 싸늘해진다.', '엉뚱한 타이밍에 끼어들어 {t:을를} 당황시킨다.', '잘못 꺼낸 화제에 {t}의 표정이 굳는다.', '어색한 농담이 오히려 분위기를 얼어붙게 만든다.'],
  },
  resolve: {
    crit: ['생각한 대로, 아니 그 이상으로 상황이 풀린다.', '완벽하게 마음먹은 대로 흘러간다.', '모든 게 딱딱 맞아떨어지며 최선의 결과로 이어진다.', '예상을 뛰어넘는 좋은 흐름으로 상황이 정리된다.'],
    success: ['별 무리 없이 원하는 대로 진행된다.', '순조롭게 상황이 정리된다.', '큰 걸림돌 없이 다음으로 넘어간다.', '무난하게 원하던 방향으로 흘러간다.'],
    fail: ['생각만큼 쉽게 풀리지 않는다.', '뜻대로 되지 않아 잠시 멈칫한다.', '예상 밖의 변수에 잠시 흐름이 꼬인다.', '뭔가 아쉬운 결과로 상황이 마무리된다.'],
    critfail: ['생각지도 못한 방향으로 어긋나 버린다.', '최악의 타이밍에 일이 꼬인다.', '전혀 예상 못한 방식으로 상황이 틀어진다.', '되려 상황을 더 어렵게 만들고 만다.'],
  },
};
const TURN_CASUAL_BANK = [
  '잠시 숨을 고르며 주변을 살핀다. 다음 행동을 정할 시간이다.',
  '상황은 크게 달라지지 않았지만, 다음에 무엇을 할지는 여전히 그대의 몫이다.',
  '별다른 동요 없이 시간이 흐른다. 주위를 둘러보며 다음 수를 고민한다.',
  '작은 침묵이 흐른다. 다음 행동을 정할 차례다.',
];
// [버그 수정] 여행 지도로 이동하면 quest/229가
// "{icon} {장소명}에 도착해 주변을 둘러본다."를 자동 전송하는데, 로컬
// 조합(API 키 없음/실패 시)은 그 메시지를 완전히 무시하고 위
// TURN_CASUAL_BANK의 "잠시 숨을 고르며..." 같은 장소와 무관한 문장을
// 아무거나 골라 쓰고 있었다 — 실제로 이동해도 서사에는 전혀 반영이
// 안 돼 "이동은 됐는데 아무것도 안 바뀐 것처럼 보인다"는 결과로
// 이어졌다. 장소 도착 문구를 감지해 실제 도착한 장소 이름을 반영한
// 문장을 우선 사용하도록 별도 뱅크를 추가한다.
const LOC_ARRIVAL_BANK = [
  '{icon} {loc}에 발을 들인다. 낯선 거리와 사람들의 기척이 사방에서 스며든다.',
  '{icon} {loc}의 풍경이 눈앞에 펼쳐진다. 잠시 걸음을 멈추고 이곳의 분위기를 살핀다.',
  '{icon} {loc}에 도착했다. 오는 길의 피로를 잠시 내려놓고 주변을 둘러본다.',
  '긴 여정 끝에 {icon} {loc}에 이르렀다. 이곳에서 무엇을 마주하게 될지 아직은 알 수 없다.',
];
// [15번 라운드, 필드↔스토리 연결 #14] 위 범용 도착 문구는 그 장소의
// 습격/경제 상태(11번 섹션에서 만든 economy/332, 10번 섹션의 습격
// 시스템)를 전혀 반영하지 않았다 — 습격으로 파괴된 마을에 도착해도
// "낯선 거리와 사람들의 기척이 스며든다"는 평온한 문장이 그대로
// 나왔다. AI 프롬프트에 힌트를 꽂는 방식(13번 섹션에서 기각된 접근 —
// 완전 하드코딩 폴백은 S.system을 안 읽음)이 아니라, 이 로컬 뱅크
// 자체가 `loadRaidState()`/`getLocationEconomySummary()`를 직접 읽어
// 분기하도록 만들어 AI 유무와 무관하게 항상 반영되게 했다.
const LOC_ARRIVAL_THREATENED_BANK = [
  '{icon} {loc}에 들어서자마자 심상치 않은 공기가 느껴진다 — 습격의 그림자가 아직 이 마을 위를 맴돌고 있다.',
  '{icon} {loc}의 거리는 평소보다 긴장돼 있다. 사람들이 불안한 눈으로 성문 쪽을 흘끔거린다.',
  '{icon} {loc}에 도착하니 경비병들이 분주히 오가고 있다 — 이 마을이 위협받고 있다는 소문이 사실이었다.',
];
const LOC_ARRIVAL_DAMAGED_BANK = [
  '{icon} {loc}에 들어서자 불에 그을린 지붕과 무너진 담벼락이 먼저 눈에 들어온다 — 얼마 전 습격의 흔적이 아직 그대로다.',
  '{icon} {loc}은 습격의 상처가 채 가시지 않은 모습이다. 주민들이 무거운 얼굴로 잔해를 치우고 있다.',
  '{icon} {loc}에 도착하니 활기는 온데간데없고, 복구 작업에 지친 사람들만 눈에 띈다.',
];
const LOC_ARRIVAL_DEPRESSED_BANK = [
  '{icon} {loc}에 들어선다. 거리는 한산하고 상점 문은 대부분 닫혀 있다 — 이 마을 형편이 그리 좋지 않은 듯하다.',
  '{icon} {loc}의 분위기는 가라앉아 있다. 오가는 사람도, 팔려는 물건도 눈에 띄게 적다.',
  '{icon} {loc}에 도착했지만 반겨주는 활기는 없다. 침체된 거리가 그대로 드러난다.',
];
function _isLocArrivalMsg(text){
  return typeof text==='string' && text.includes('에 도착해 주변을 둘러본다');
}
const TURN_OPENING_BANK = [
  '{name:은는} 낯선 공기를 깊게 들이마신다. {loc}의 풍경이 눈앞에 펼쳐지고, 새로운 이야기가 막 시작되려 한다.',
  '발걸음을 뗄 때마다 {loc}의 냄새와 소리가 낯설게 스며든다. {name}의 여정이 이제 막 첫걸음을 뗀다.',
  '{loc}에 도착한 {name:은는} 잠시 걸음을 멈추고 주위를 둘러본다. 앞으로 무엇을 마주하게 될지, 아직은 알 수 없다.',
];
// [신규] "신분·시작 대륙을 골라도 오프닝이 다 똑같다"는 지적을 받고
// 추가 — 위 TURN_OPENING_BANK는 {name}/{loc} 두 개만 채우는 완전
// 범용 템플릿이라, loadCurrentLocation()이 아직 없는(=거의 항상 그런)
// 새 캐릭터의 첫 턴에는 {loc}조차 "낯선 땅"이라는 고정 문구로 빠져서
// 신분·대륙 어느 쪽을 골라도 체감상 똑같은 문장이 나왔다. SOCIAL_RANKS의
// lore와 START_CONTINENTS의 desc/lore — 신분·대륙 선택 화면에 이미
// 있던 손으로 쓴 설정 텍스트 — 를 그대로 오프닝에 엮어 넣어, AI 호출
// 없이도(로컬 조합만으로도) 신분·대륙에 따라 확실히 다른 문장이
// 나오게 한다.
function composeRankContinentOpening(char){
  const rank = SOCIAL_RANKS.find(r => r.id === char.socialRankId);
  const cont = START_CONTINENTS.find(c => c.id === char.startContinent);
  // [신규] 종족도 같은 사각지대였다 — RACE_DEFS.lore는 이미 AI 프롬프트
  // (ai-prompt/077 buildLightSystem)에는 들어가고 있어 AI가 응답할 땐
  // 종족 차이가 반영됐지만, 로컬 전용 오프닝에는 아예 연결이 안 돼 있어
  // AI 호출이 실패/미사용일 땐 종족을 뭘 골라도 차이가 없었다. lore가
  // 보통 여러 문장으로 길어 오프닝에 그대로 넣기엔 과하므로 첫 문장만 쓴다.
  const race = char.race ? RACE_DEFS.find(r => r.name === char.race) : null;
  const raceLoreFull = race ? (race.lore || race.desc || '') : '';
  const raceLore = raceLoreFull ? raceLoreFull.split(/(?<=[.!?])\s/)[0] : '';
  const nameWord = char.name || '주인공';
  const josa = nameWord + _josa(nameWord, '은는');
  const contLabel = cont ? cont.label : '낯선 땅';
  const contDesc = cont ? cont.desc : '';
  const rankLore = rank ? rank.lore : '평범한 태생으로 하루하루를 살아왔다.';
  if(!rank && !cont && !raceLore) return null; // 셋 다 정보가 없으면 기존 범용 템플릿에 맡긴다
  const raceClause = raceLore ? ` ${char.race} 특유의 기질도 숨길 수 없다 — ${raceLore}` : '';
  const templates = [
    `${contLabel}. ${contDesc} 그 속에서 ${josa} 지금껏 이렇게 살아왔다 — ${rankLore}${raceClause}`,
    `${josa} ${contLabel}에서 눈을 떴다. ${contDesc} ${rankLore}${raceClause}`,
    `${contDesc} 이곳 ${contLabel}, ${josa} ${rankLore}${raceClause}`,
  ];
  return templates[Math.floor(Math.random()*templates.length)];
}
// [신규] 오프닝 이후의 "매 턴" 서사(TURN_REACT_BANK/TURN_CASUAL_BANK)는
// 주사위 판정 결과나 잡담 여부로만 문구가 갈릴 뿐, 게임 전체 턴의
// 대다수를 차지하는데도 종족·신분을 전혀 참조하지 않았다(오프닝만
// 고치고 정작 가장 빈도 높은 이 부분은 그대로였음 — 전수조사로 확인).
// 매 턴 긴 설정 문단을 반복하면 오히려 거슬리므로, 짧은 한 구절만
// 낮은 확률로 앞에 붙여 "가끔 신분·종족이 묻어나는" 정도로 조정한다.
function composeIdentityFlavorFragment(char){
  const rank = SOCIAL_RANKS.find(r => r.id === char?.socialRankId);
  const frags = [];
  if(rank) frags.push(`${rank.name}${_josa(rank.name,'로')} 살아온 시간이 문득 스친다. `);
  if(char?.race) frags.push(`${char.race}${_josa(char.race,'로')}서의 감각이 낯설지 않게 반응한다. `);
  if(!frags.length) return '';
  return frags[Math.floor(Math.random()*frags.length)];
}
function _turnStatToCategory(stat){
  const map = { str:'attack', rng:'attack', end:'defend', fear:'fear', disg:'stealth',
    agi:'move', mgc:'magic', fath:'magic', neg:'persuade', per:'search', int:'search', spk:'social' };
  return map[stat] || 'resolve';
}
function _turnVerdictKey(label){
  return label==='대성공' ? 'crit' : label==='대실패' ? 'critfail' : label==='실패' ? 'fail' : 'success';
}
function _turnParseDice(ctx){
  if(!ctx) return null;
  const m = ctx.match(/\[주사위 굴림\]\s*d100:\s*\d+\s*\/\s*([A-Z]+)\(\d+\)\s*→\s*\S+\s*(대성공|성공|실패|대실패)/);
  if(!m) return null;
  return { stat: m[1].toLowerCase(), verdict: m[2] };
}
function _turnPickTarget(){
  try{
    const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]).filter(m=>m.status==='alive') : [];
    if(monsters.length) return monsters[0].name;
    const npcs = (typeof loadNPCs==='function') ? (loadNPCs()||[]) : [];
    const hostile = npcs.find(n=>n.relation==='hostile'||n.relation==='enemy');
    if(hostile) return hostile.name;
    if(npcs.length) return npcs[Math.floor(Math.random()*npcs.length)].name;
  }catch(e){}
  return '상대';
}
// [14번 라운드 2단계] 판정 결과를 순수 텍스트로만 끝내지 않고, 실제
// NPC 호감도(updateNpcRelationship, items/065 — 퀘스트 수락/완료 등
// 여러 곳에서 이미 쓰이는 라이브 시스템)에 반영한다. persuade(설득)/
// social(사교)/fear(위협) 세 카테고리만 대상으로 한다 — attack/defend/
// move/magic/stealth/search는 NPC 호감도와 자연스럽게 이어지는 기존
// 시스템이 없어서(예: "탐색 성공 → 장소 경제"는 억지로 지어내는 연결이라
// 11번 섹션의 "연결이 없으면 억지 매핑 만들지 말고 보류" 원칙을 그대로
// 따라 손대지 않는다). 위협(fear)은 판정이 "먹혔어도" 우호도가 오르지
// 않고 오히려 떨어지도록 설계했다 — 겁을 줘서 통했다고 그 상대가 나를
// 더 좋아하게 되는 건 아니기 때문.
const TURN_NPC_RELATION_DELTA = {
  persuade: { crit: 8, success: 3, fail: -1, critfail: -6 },
  social:   { crit: 6, success: 2, fail: -1, critfail: -4 },
  fear:     { crit: -1, success: -2, fail: -3, critfail: -8 },
};
const TURN_RELATION_REASON = {
  persuade: { crit:'설득 대성공', success:'설득 성공', fail:'설득 실패', critfail:'설득 대실패' },
  social:   { crit:'대화 대성공', success:'대화 성공', fail:'대화 어색함', critfail:'대화 대실패' },
  fear:     { crit:'위협 대성공(반감)', success:'위협 성공(반감)', fail:'위협 실패', critfail:'위협 역효과' },
};
function applyTurnRelationEffect(cat, vk, target){
  try{
    const delta = TURN_NPC_RELATION_DELTA[cat]?.[vk];
    if(!delta || !target) return;
    if(typeof updateNpcRelationship==='function') updateNpcRelationship(target, delta, TURN_RELATION_REASON[cat][vk]);
    // 세력 평판 — persuade/social만, 대상이 특정 세력 소속 NPC일 때만
    // 소폭(개인 호감도 델타의 1/3, 반올림) 연동한다. fear는 개인 반감이지
    // 세력 전체 평판에 옮길 근거가 약하다고 판단해 제외.
    if((cat==='persuade' || cat==='social') && typeof loadNPCs==='function'){
      const npc = (loadNPCs()||[]).find(n=>n.name===target);
      if(npc?.faction && typeof updateFactionRep==='function'){
        const factionDelta = Math.round(delta/3);
        if(factionDelta) updateFactionRep(npc.faction, factionDelta);
      }
    }
  }catch(e){}
}
export function composeLocalTurnText(history, injectedContext){
  // [패턴 학습] 실제 AI가 쓴 서사가 충분히 쌓였으면 35% 확률로 그
  // 패턴으로 즉석 생성한 문장을 뱅크 대신 사용.
  const learned = Math.random()<0.35 ? getLearnedText('turn_narrative') : null;
  // 오프닝(1턴차, history 없음)
  if(!history || !history.length){
    const char = S.character||{};
    const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    const tpl = TURN_OPENING_BANK[Math.floor(Math.random()*TURN_OPENING_BANK.length)];
    const nameWord = char.name||'주인공';
    // [신규] 아직 구체적인 장소(loc)가 정해지지 않은 상태(거의 항상 그런
    // 첫 턴)에는 신분·시작 대륙 기반 오프닝을 우선 사용 — 이미 구체적인
    // 장소가 있으면 그 장소 이름을 쓰는 기존 범용 템플릿으로 충분하므로
    // 건드리지 않는다.
    const rankContOpening = !loc ? composeRankContinentOpening(char) : null;
    const prose = learned || rankContOpening || tpl
      .replace(/\{name(?::([^}]+))?\}/g, (_, type) => type ? nameWord+_josa(nameWord,type) : nameWord)
      .replace(/\{loc\}/g, loc?.name||'낯선 땅');
    const choices = generateLocalFlavorChoices(4);
    return prose+'\n[선택지]'+choices.map((c,i)=>'①②③④⑤'[i]+c).join('')+'[/선택지]';
  }
  const dice = _turnParseDice(injectedContext);
  let prose;
  // [신규] 20% 확률로만 붙인다 — learned(학습된 문장)로 대체될 때는
  // 이미 실제 AI가 쓴 문장이니 덧붙이지 않는다.
  const identityFrag = (!learned && Math.random()<0.2) ? composeIdentityFlavorFragment(S.character) : '';
  const lastUserMsg = [...history].reverse().find(m=>m.role==='user');
  // [16번 라운드, 필드↔스토리 연결 #10] world/320(실시간 필드 이동)에서
  // 대화로 돌아온 직후 딱 한 턴만, "방금 필드에서 뭘 했는지"를 먼저
  // 짚어준다 — 지금까지 이 뱅크 자체는 S.system(AI 전용)을 안 읽어서
  // 필드에 다녀와도 서사가 아무 일 없었다는 듯 이어졌었다(사용자 지적:
  // "사냥하고 마을 갔다왔는데 이어서 대화를 진행하는 게 맞아?"). 여기서
  // 소비 즉시 지워서 다음 턴부터는 평소대로 돌아간다.
  if(!learned && S._pendingFieldReturnHint){
    const fieldHint = S._pendingFieldReturnHint; S._pendingFieldReturnHint = null;
    prose = identityFrag + fieldHint;
  } else if(dice){
    const cat = _turnStatToCategory(dice.stat);
    const vk = _turnVerdictKey(dice.verdict);
    const bank = TURN_REACT_BANK[cat][vk];
    const tpl = bank[Math.floor(Math.random()*bank.length)];
    const target = _turnPickTarget();
    applyTurnRelationEffect(cat, vk, target);
    prose = learned || (identityFrag + _fillTargetSlots(tpl, target));
  } else if(!learned && _isLocArrivalMsg(lastUserMsg?.content)){
    const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    let arrivalBank = LOC_ARRIVAL_BANK;
    try{
      const raid = (loc?.id && typeof loadRaidState==='function') ? (loadRaidState()[loc.id]) : null;
      const econ = (loc?.id && typeof getLocationEconomySummary==='function') ? getLocationEconomySummary(loc.id) : null;
      if(raid && raid.state==='threatened') arrivalBank = LOC_ARRIVAL_THREATENED_BANK;
      else if(raid && raid.state==='resolved' && (raid.outcome==='damaged'||raid.outcome==='destroyed')) arrivalBank = LOC_ARRIVAL_DAMAGED_BANK;
      else if(econ && (econ.prosLabel==='피폐'||econ.prosLabel==='침체')) arrivalBank = LOC_ARRIVAL_DEPRESSED_BANK;
    }catch(e){}
    const tpl = arrivalBank[Math.floor(Math.random()*arrivalBank.length)];
    prose = identityFrag + tpl.replace(/\{icon\}/g, loc?.icon||'📍').replace(/\{loc\}/g, loc?.name||'낯선 곳');
  } else {
    prose = learned || (identityFrag + TURN_CASUAL_BANK[Math.floor(Math.random()*TURN_CASUAL_BANK.length)]);
  }
  const choices = generateLocalFlavorChoices(4);
  return prose+'\n[선택지]'+choices.map((c,i)=>'①②③④⑤'[i]+c).join('')+'[/선택지]';
}
window.composeLocalTurnText = composeLocalTurnText;
// ══════════════════════════════════════════════════════════════════

export const ME_SYNONYM_MAP = (() => {
  const map = {};
  ME_SYNONYM_GROUPS.forEach(group => { group.forEach(word => { map[word] = group[0]; }); });
  return map;
})();

export const ME_NEGATION_RE = /(안|않|못|말고|거부|싫|아니)/;

export function _meTokenize(text){
  if(!text) return [];
  const raw = (text.toLowerCase().match(/[가-힣]{2,}|[a-z]{3,}/g) || []);
  return raw.map(w => ME_SYNONYM_MAP[w] || w);
}
window._meTokenize = _meTokenize;

export function _meHasNegation(text){
  return ME_NEGATION_RE.test(text || '');
}
window._meHasNegation = _meHasNegation;

export function _meJaccard(a, b){
  const setA = new Set(a), setB = new Set(b);
  if(!setA.size && !setB.size) return 0;
  let inter = 0;
  setA.forEach(x => { if(setB.has(x)) inter++; });
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}
window._meJaccard = _meJaccard;

export function _meRecencyWeight(entryTurn, curTurn){
  const diff = Math.max(0, curTurn - entryTurn);
  return Math.pow(0.5, diff / ME_RECENCY_HALFLIFE);
}
window._meRecencyWeight = _meRecencyWeight;

export function _meHpBand(hpPct){
  if(hpPct === null) return null;
  return (ME_HP_BANDS.find(b => hpPct <= b.max) || ME_HP_BANDS[ME_HP_BANDS.length-1]).label;
}
window._meHpBand = _meHpBand;

export function _meAffinityBand(score){
  if(score === null || score === undefined) return null;
  return (ME_AFFINITY_BANDS.find(b => score <= b.max) || ME_AFFINITY_BANDS[ME_AFFINITY_BANDS.length-1]).label;
}
window._meAffinityBand = _meAffinityBand;

export function _meGoldBand(gold){
  if(gold === null || gold === undefined) return null;
  return (ME_GOLD_BANDS.find(b => gold <= b.max) || ME_GOLD_BANDS[ME_GOLD_BANDS.length-1]).label;
}
window._meGoldBand = _meGoldBand;

export function _meTimeBand(){
  try{
    const gt = (typeof loadGameTime === 'function') ? loadGameTime() : null;
    const phase = gt?.timePhase || gt?.phase || null;
    if(!phase) return null;
    if(/밤|심야|새벽/.test(phase)) return '밤';
    if(/아침|오전/.test(phase)) return '아침';
    if(/낮|오후|정오/.test(phase)) return '낮';
    if(/저녁|황혼/.test(phase)) return '저녁';
    return null;
  }catch(e){ return null; }
}
window._meTimeBand = _meTimeBand;

export const ME_INTENT_WORDS = new Set(['공격','이동','대화','조사','도망','휴식','구매','판매','설득','위협','수락','거절']);

export function _meIntent(tokens, rawText){
  // 1차: 정규식 패턴 매칭 — AI가 매번 다르게 표현해도 핵심 의미 단어로 포착
  if(rawText){
    for(const p of ME_INTENT_PATTERNS){ if(p.re.test(rawText)) return p.label; }
  }
  // 2차: 기존 정확 단어 매칭 (폴백)
  for(const t of tokens){ if(ME_INTENT_WORDS.has(t)) return t; }
  return null; // 알려진 의도가 없으면 null — 카테고리 매칭에서 제외됨(너무 막연한 입력 방지)
}
window._meIntent = _meIntent;

export function _meCurrentNpcAffinityBand(recentText){
  try{
    const npcs = (typeof loadNPCs === 'function') ? loadNPCs() : [];
    if(!npcs.length) return null;
    const text = recentText || '';
    const sceneNpc = text ? npcs.find(n => n.name && text.includes(n.name)) : null;
    if(!sceneNpc) return null;
    return _meAffinityBand(sceneNpc.relationship);
  }catch(e){ return null; }
}
window._meCurrentNpcAffinityBand = _meCurrentNpcAffinityBand;

export function _meCategoryKey(loc, job, race, sceneType, hpBand, intent, negation, affinityBand, goldBand, timeBand, monsterName){
  return [
    loc||'?', job||'?', race||'?', sceneType||'?',
    hpBand||'?', intent||'?', negation?'NEG':'POS',
    affinityBand||'?', goldBand||'?', timeBand||'?',
    monsterName||'?', // [신규] 개별 몬스터 단위로 전투 서사 풀을 구분
  ].join('::');
}
window._meCategoryKey = _meCategoryKey;

window._meIntercept = async function(injectedContext, history){
  try{
    const playlog = (()=>{ try{ return JSON.parse(lsGet('tf-master-playlog')||'[]'); }catch(e){ return []; } })();
    if(playlog.length < ME_MIN_SAMPLES) return null;

    const meEnabled = lsGet('tf-me-enabled') === '1';
    if(!meEnabled) return null;

    // [핵심 정책] 자유 텍스트 입력은 절대 캐시하지 않는다 — 항상 AI 호출.
    // 게임의 독특한 전개·예상 못한 서사는 자유 입력에서 나오는 경우가
    // 많으므로, 다양성을 지키기 위해 이 경로는 매칭을 시도조차 하지 않는다.
    // 선택지 클릭(미리 정해진 짧은 문구 중 하나)만 캐시 대상으로 삼는다 —
    // 입력값이 유한하고 반복되므로 충분히 쌓이면 안전하게 매칭 가능.
    const isCurrentChoice = !!(typeof S!=='undefined' && S._isCurrentInputChoice);
    if(!isCurrentChoice) return null;

    const lastUser = Array.isArray(history) ? [...history].reverse().find(m => m.role === 'user') : null;
    const userMsg = lastUser?.content || '';
    if(!userMsg || userMsg.length < 3) return null;

    const curTokens = _meTokenize(userMsg);
    if(curTokens.length === 0) return null;
    const curNegation = _meHasNegation(userMsg);
    const curIntent = _meIntent(curTokens, userMsg);
    if(!curIntent) return null; // 알려진 행동 의도가 없는 입력 — 너무 자유로운 서사 요청이라 AI에게 맡김

    const curLoc = (typeof S!=='undefined' && S.currentLocation?.name) || null;
    const curHpPct = (S?.stats?.hp!==undefined && S?.stats?.maxHp) ? (S.stats.hp / S.stats.maxHp) : null;
    const curHpBand = _meHpBand(curHpPct);
    const curJob  = (typeof S!=='undefined' && S.character?.role) || null;
    const curRace = (typeof S!=='undefined' && S.character?.race) || null;
    const curTurn = (typeof S!=='undefined' && S.msgCount) || 0;

    const lastAi = Array.isArray(history) ? [...history].reverse().find(m => m.role === 'assistant' || m.role === 'model') : null;
    const lastAiText = lastAi?.content || '';
    let curSceneType = null;
    {
      const lc2 = lastAiText.toLowerCase();
      if(/전투|공격|적이|몬스터|싸움/.test(lc2)) curSceneType = '전투';
      else if(/상점|구매|판매|거래/.test(lc2)) curSceneType = '상점';
      else if(/이동|도착|향했|여행/.test(lc2)) curSceneType = '이동';
      else if(/휴식|잠을|쉬었|회복/.test(lc2)) curSceneType = '휴식';
      else if(/탐험|발견|살펴|조사/.test(lc2)) curSceneType = '탐험';
    }

    // [확장] 호감도/골드/시간대까지 포함한 전체 차원으로 카테고리 생성
    const curAffinityBand = (typeof _meCurrentNpcAffinityBand==='function') ? _meCurrentNpcAffinityBand(lastAiText) : null;
    const curGoldBand = _meGoldBand((typeof loadGold === 'function') ? loadGold() : null);
    const curTimeBand = _meTimeBand();

    // [신규] 현재 전투 중인 몬스터 이름 — 씬타입이 전투일 때만 의미가 있다.
    const curMonsterName = (() => {
      try{
        if(curSceneType !== '전투') return null;
        const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
        const alive = monsters.find(m=>m.status==='alive');
        return alive ? alive.name : null;
      }catch(e){ return null; }
    })();

    const curKey = _meCategoryKey(curLoc, curJob, curRace, curSceneType, curHpBand, curIntent, curNegation, curAffinityBand, curGoldBand, curTimeBand, curMonsterName);

    // ── 같은 카테고리에 속하는 모든 과거 응답을 "풀"로 수집 ──
    // (정확한 문장 유사도는 더 안 봄 — 카테고리가 같으면 충분히 비슷한 상황으로 간주)
    // [핵심] 선택지로 만들어진 과거 기록만 풀에 포함 — 자유 입력으로 쌓인
    // 데이터는 절대 캐시 풀에 섞이지 않는다 (다양성을 해치지 않기 위함).
    const pool = [];
    playlog.forEach(entry => {
      if(!entry.userMsg || !entry.aiText) return;
      if(!entry.isChoiceInput) return; // 자유 입력으로 쌓인 기록은 캐시 후보에서 제외
      const eTokens = _meTokenize(entry.userMsg);
      const eIntent = _meIntent(eTokens, entry.userMsg);
      if(!eIntent) return;
      const eHpBand = (entry.hp !== undefined && entry.maxHp) ? _meHpBand(entry.hp / entry.maxHp) : null;
      const eAffinityBand = _meAffinityBand(entry.npcAffinityScore);
      const eGoldBand = _meGoldBand(entry.gold);
      const eTimeBand = entry.timeBand || null;
      const eKey = _meCategoryKey(entry.location, entry.job, entry.race, entry.sceneType, eHpBand, eIntent, _meHasNegation(entry.userMsg), eAffinityBand, eGoldBand, eTimeBand, entry.monsterName);
      if(eKey === curKey) pool.push({ entry, weight: _meRecencyWeight(entry.turn||0, curTurn) });
    });

    // ── 풀 크기 기준 — 다양성을 위해 캐시형보다 더 큰 표본을 요구 ──
    // (작은 풀에서 매칭하면 같은 문장이 너무 자주 반복돼 다양성이 죽음)
    // ME_POOL_MIN_SIZE는 파일 상단에서 전역으로 한 번만 선언됨 (룰 추출기와 공유)
    if(pool.length < ME_POOL_MIN_SIZE){
      // 풀이 아직 충분히 안 쌓였으면 무조건 AI 호출 — 데이터를 계속 모으는 단계
      return null;
    }

    // 풀 안에서도 서로 다른 응답이 충분히 다양해야 함 (전부 같은 문장이면 매칭 의미 없음)
    // [자유도 튜닝] ME_POOL_MIN_SIZE를 30으로 올린 것과 짝을 맞춰, 다양성
    // 기준도 0.3→0.5로, "그래도 봐줄 크기" 기준도 30→60으로 올렸다 —
    // 재사용이 실제로 걸리는 건 정말 다양한 변형이 많이 쌓였을 때뿐이다.
    const uniqueResponses = new Set(pool.map(p => p.entry.aiText.slice(0,60)));
    const diversityRatio = uniqueResponses.size / pool.length;
    if(diversityRatio < 0.5 && pool.length < 60){
      // 다양성이 너무 낮고 풀도 충분히 안 크면 — 좀 더 쌓일 때까지 AI 계속 사용
      return null;
    }

    // ── 풀 전체에서 가중 랜덤 선택 (최근 응답일수록 약간 더 자주 뽑힘, 하지만 옛 응답도 등장) ──
    const totalWeight = pool.reduce((s,p) => s + p.weight, 0);
    let r = Math.random() * totalWeight;
    let picked = pool[pool.length - 1].entry;
    for(const p of pool){ r -= p.weight; if(r <= 0){ picked = p.entry; break; } }

    console.log(`[ME] 풀 매칭 — 카테고리:${curKey}, 풀크기:${pool.length}, 다양성:${(diversityRatio*100).toFixed(0)}%, AI 호출 절감`);

    try{
      const meStats = (()=>{ try{ return JSON.parse(lsGet('tf-me-stats')||'{}'); }catch(e){ return {}; } })();
      meStats.hits   = (meStats.hits||0) + 1;
      meStats.misses = meStats.misses || 0;
      lsSet('tf-me-stats', JSON.stringify(meStats));
    }catch(e){}

    // GS 재실행 — stats/gold/items만 (퀘스트/플래그 등 상태의존 필드는 위험하므로 제외)
    if(picked.gs && typeof picked.gs === 'object'){
      try{
        const safeGs = {};
        if(picked.gs.stats) safeGs.stats = picked.gs.stats;
        if(picked.gs.gold !== undefined) safeGs.gold = picked.gs.gold;
        if(picked.gs.items) safeGs.items = picked.gs.items;
        if(Object.keys(safeGs).length){
          (window.processGSBlock || (typeof window.processGSBlock==='function' && window.processGSBlock))(safeGs);
        }
      }catch(e){ console.warn('[ME] GS 재실행 실패(서사는 그대로 사용):', e); }
    }

    if(lsGet('tf-me-debug') === '1'){
      setTimeout(()=>{ try{ toast(`🧠 로컬 풀 매칭 (풀 ${pool.length}개 중 선택, AI 호출 절감)`, 1800); }catch(e){} }, 300);
    }

    return picked.aiText;
  }catch(e){
    console.warn('[ME] 매칭 엔진 오류, AI 호출로 폴백:', e);
    return null;
  }
};

window._meTokenize = _meTokenize;

window._meJaccard  = _meJaccard;

export async function summarizeIfNeeded(){
  if(S.messages.length < 15) return;
  const older = S.messages.slice(0, -10);
  const totalTokens = older.reduce((sum, m) => sum + estimateTokens(m.content), 0);
  if(totalTokens < 1500) return;
  try{
    const toSummarize = older.map(m=>(m.role==='user'?'플레이어':'AI')+': '+m.content.slice(0,300)).join('\n');
    // [신규] 기존에 등록된 미해결 떡밥이 있으면, 이번 구간에서 해결됐는지
    // AI에게 함께 물어본다. 키워드 매칭으로는 "진짜 그 떡밥이 해결됐는지"
    // 정확히 판단할 수 없으므로(이야기 맥락 이해가 필요), AI가 직접 보고
    // 판단하게 한다.
    const _existingMem = loadMemory();
    const _hooks = (_existingMem.facts||[]).filter(f=>f.category==='unresolved_hook');
    const hookListBlock = _hooks.length
      ? '\n\n기존 미해결 떡밥 목록(번호로 지칭):\n' + _hooks.map((h,i)=>`${i+1}. ${h.text}`).join('\n')
      : '';
    const resolvedSectionGuide = _hooks.length
      ? '\n\n[해결됨]\n(위 "기존 미해결 떡밥 목록" 중 이번 구간 대화에서 명확히 해결되거나 결말이 난 게 있으면, "번호|어떻게 해결됐는지 1줄 설명" 형식으로 적어라. 없으면 이 섹션은 비워라.)'
      : '';
    const prompt = '다음 RPG 대화를 분석해 아래 형식으로 한국어로 요약해. 반드시 이 형식 그대로 출력:\n\n[주요사건]\n(이번 구간에서 일어난 핵심 사건 3~5개, 각 1줄)\n\n[NPC동향]\n(등장한 NPC 이름과 행동/감정 변화, 각 1줄)\n\n[플레이어선택]\n(플레이어가 내린 중요 결정과 그 결과, 각 1줄)\n\n[획득/변화]\n(아이템, 스킬, 장소, 관계 변화 등, 각 1줄)\n\n[미완료사항]\n(아직 해결 안 된 것, 복선, 열린 퀘스트, 각 1줄)\n\n[영구기록]\n(이 구간에서 절대 잊으면 안 되는 사실만 골라서, 한 줄에 하나씩 "카테고리|내용" 형식으로 적어라. 카테고리는 반드시 다음 6개 중 하나: npc_death(NPC의 죽음·영구 이탈), world_change(세계의 영구적 변화), identity_reveal(정체·비밀의 발각), irreversible_choice(되돌릴 수 없는 중대한 선택), relationship_turn(관계의 결정적 전환점), unresolved_hook(아직 회수 안 된 약속·떡밥). 해당하는 사실이 이 구간에 없으면 이 섹션 자체를 비워둬도 된다. 사소하거나 일시적인 사건은 절대 넣지 마라.)' + resolvedSectionGuide + hookListBlock + '\n\n대화:\n' + toSummarize.slice(0,4000);
    const summary = await window.callAI([{role:'user', content: prompt}], '');
    if(summary && summary.length > 20){
      const mem = loadMemory();
      const prevMid = mem.mid || '';
      const turnLabel = '\n\n─── 턴 ' + Math.max(0,(S.msgCount||0)-older.length) + '~' + (S.msgCount||0) + ' 요약 ───\n';
      // [BUG FIX] slice(-6000)으로 글자수만 보고 무지성 절단하면 턴 구간
      // 요약 중간에서 잘려 의미가 깨질 수 있었다. 턴 블록 단위로 통째로
      // 제거하도록 trimMidByTurnBlocks()를 사용 — 항상 완전한 블록만 남는다.
      const newMidFull = prevMid + turnLabel + summary;
      const newMid = (typeof trimMidByTurnBlocks==='function') ? trimMidByTurnBlocks(newMidFull, 6000) : newMidFull.slice(-6000);
      saveMemory({...mem, mid: newMid, midUpdatedAt: Date.now()});
      // [신규] 이 구간 요약에서 영구 보존 사실 추출 — core/mid가 나중에
      // 압축·절단되어도 이 사실들은 별도로 살아남는다.
      if(typeof extractAndStorePermanentFacts==='function') extractAndStorePermanentFacts(summary, S.msgCount||0);
      // [신규] 해결된 떡밥 처리 — facts에서 제거하고 영구 로그로 이전
      if(typeof processResolvedHooks==='function') processResolvedHooks(summary, _hooks);
      // [BUG FIX] {core, mid}만 넘기면 위에서 갱신한 facts가 buildLightSystem에
      // 전달되지 않는다. loadMemory()로 다시 읽어 facts를 포함시킨다.
      const _memForBLS = loadMemory();
      S.system = window.buildLightSystem(S.character, loadTitles(), {core:mem.core||'', mid:newMid, facts:_memForBLS.facts||[]}, S.npcs);
      S.messages = S.messages.slice(-10);
      toast('📝 대화 구조화 요약됨', 2000);
    }
  }catch(e){}
}
window.summarizeIfNeeded = summarizeIfNeeded;

export async function pmAutoSummarize(){
  try {
    if(typeof pmGetBLS !== 'function') return;
    var bls = pmGetBLS();
    if(!bls || bls.length < 50) return;
    var mem = typeof loadMemory === 'function' ? loadMemory() : {};
    // [신규] 기존 미해결 떡밥 해결 여부 확인 절차
    var _hooks3 = (mem.facts||[]).filter(f=>f.category==='unresolved_hook');
    var hookListBlock3 = _hooks3.length
      ? '\n\n기존 미해결 떡밥 목록(번호로 지칭):\n' + _hooks3.map(function(h,i){return (i+1)+'. '+h.text;}).join('\n')
      : '';
    var resolvedSectionGuide3 = _hooks3.length
      ? '\n\n[해결됨]\n(위 목록 중 해결된 게 있으면 "번호|어떻게 해결됐는지 1줄 설명" 형식으로. 없으면 비워라.)'
      : '';
    var prompt = '아래는 RPG 장기 기억 데이터야. 이걸 바탕으로 현재까지의 핵심 상황을 아래 형식으로 한국어로 정리해. 반드시 이 형식 그대로:\n\n[핵심서사]\n(지금까지 이야기의 핵심 흐름 2~3줄)\n\n[주요NPC상태]\n(중요 NPC별 현재 관계와 상태, 각 1줄)\n\n[진행중퀘스트]\n(현재 활성 퀘스트와 진행도, 각 1줄)\n\n[세계변화]\n(플레이어 행동으로 달라진 세계 상태, 각 1줄)\n\n[플레이어성향]\n(지금까지 선택 패턴으로 드러난 성향 1줄)\n\n[영구기록]\n(절대 잊으면 안 되는 사실만 골라서, 한 줄에 하나씩 "카테고리|내용" 형식으로. 카테고리는 npc_death, world_change, identity_reveal, irreversible_choice, relationship_turn, unresolved_hook 중 하나. 없으면 비워도 됨.)' + resolvedSectionGuide3 + hookListBlock3 + '\n\n장기기억:\n' + bls.slice(0,4000);
    var summary = await window.callAI([{role:'user', content: prompt}], '');
    if(summary && summary.length > 20){
      var updatedMem = typeof loadMemory === 'function' ? loadMemory() : {};
      // [신규] PM 요약에서도 영구기록 추출 — 절단 전에 먼저 추출
      if(typeof extractAndStorePermanentFacts==='function') extractAndStorePermanentFacts(summary, S?.msgCount||0);
      // [신규] 해결된 떡밥 처리
      if(typeof processResolvedHooks==='function') processResolvedHooks(summary, _hooks3);
      const newCore = summary.slice(0, 3000);
      if(typeof saveMemory === 'function') saveMemory({...updatedMem, core: newCore, coreUpdatedAt: Date.now()});
      if(typeof window.buildLightSystem === 'function' && typeof S !== 'undefined' && S.character){
        // [BUG FIX] {core, mid}만 넘기면 방금 추출한 facts가 누락된다.
        // loadMemory()로 다시 읽어 최신 facts를 포함시킨다.
        const _memForBLS2 = loadMemory();
        S.system = window.buildLightSystem(S.character, loadTitles(), {core: newCore, mid: updatedMem.mid||'', facts:_memForBLS2.facts||[]}, S.npcs);
      }
      window._pmSystemDirty = false;
    }
  } catch(e) {}
}
window.pmAutoSummarize = pmAutoSummarize;

export async function buildCoreMemoryFromFull(){
  try{
    const full = S.fullMessages || S.messages || [];
    if(full.length < 10) return;
    const mem = loadMemory();
    // 전체 히스토리를 턴 블록으로 나눠서 요약
    const text = full.slice(-60).map(m=>(m.role==='user'?'[플]':'[서]')+' '+( m.content||'').slice(0,200)).join('\n');
    // [BUG FIX] 이전엔 매번 "최근 60개 메시지만" 보고 core를 새로 만들어서,
    // 그 이전 core에 있던 핵심 정보가 다음 압축에서 자연히 누락될 위험이
    // 있었다(함수명은 "FromFull"이지만 실제로는 최근 구간만 봤다). 이전
    // core를 입력에 포함시켜, 한 번 핵심으로 인정된 정보가 이후 압축에서도
    // 계속 살아남도록 한다.
    const prevCoreBlock = mem.core ? ('이전까지의 핵심 기록:\n' + mem.core + '\n\n') : '';
    // [신규] 기존 미해결 떡밥 해결 여부 확인 절차 — summarizeIfNeeded와 동일한 방식
    const _hooks2 = (mem.facts||[]).filter(f=>f.category==='unresolved_hook');
    const hookListBlock2 = _hooks2.length
      ? '\n\n기존 미해결 떡밥 목록(번호로 지칭):\n' + _hooks2.map((h,i)=>`${i+1}. ${h.text}`).join('\n')
      : '';
    const resolvedSectionGuide2 = _hooks2.length
      ? '\n\n[해결됨]\n(위 "기존 미해결 떡밥 목록" 중 최근 대화에서 명확히 해결되거나 결말이 난 게 있으면, "번호|어떻게 해결됐는지 1줄 설명" 형식으로 적어라. 없으면 이 섹션은 비워라.)'
      : '';
    const prompt = '아래는 RPG 게임의 대화 기록이야. ' + (mem.core ? '이전까지의 핵심 기록과 최근 대화를 모두 반영해서' : '이걸 바탕으로') + ' 현재 상황을 아래 형식으로 정확하게 정리해. 이전 핵심 기록에 있던 내용 중 여전히 유효한 것은 유지하고, 최근 대화로 달라진 부분만 갱신해. 반드시 이 형식 그대로:\n\n[핵심서사]\n(지금까지 이야기의 핵심 흐름)\n\n[주요NPC상태]\n(중요 NPC별 현재 관계와 상태)\n\n[진행중퀘스트]\n(현재 활성 퀘스트와 진행도)\n\n[세계변화]\n(플레이어 행동으로 달라진 세계 상태)\n\n[플레이어성향]\n(선택 패턴으로 드러난 성향)\n\n[미완결복선]\n(아직 해결 안 된 떡밥과 열린 결말)\n\n[영구기록]\n(절대 잊으면 안 되는 사실만 골라서, 한 줄에 하나씩 "카테고리|내용" 형식으로 적어라. 카테고리는 반드시 다음 6개 중 하나: npc_death, world_change, identity_reveal, irreversible_choice, relationship_turn, unresolved_hook. 해당 사실이 없으면 이 섹션을 비워도 된다.)' + resolvedSectionGuide2 + hookListBlock2 + '\n\n' + prevCoreBlock + '최근대화:\n' + text.slice(0,5000);
    const summary = await window.callAI([{role:'user',content:prompt}],'');
    if(summary && summary.length > 30){
      // [BUG FIX] 이전엔 summary.slice(0,3000)으로 먼저 자른 뒤 저장했는데,
      // AI 응답이 길면 맨 마지막 섹션인 [영구기록]이 잘려나간 뒤에야
      // 추출을 시도해 정작 보존해야 할 사실을 놓칠 위험이 있었다. 원본
      // summary 전체에서 먼저 영구기록을 추출하고, 그 다음에 표시용
      // core만 절단한다.
      if(typeof extractAndStorePermanentFacts==='function') extractAndStorePermanentFacts(summary, S.msgCount||0);
      // [신규] 해결된 떡밥 처리
      if(typeof processResolvedHooks==='function') processResolvedHooks(summary, _hooks2);
      const newCore = summary.slice(0,3000);
      saveMemory({...mem, core:newCore, coreUpdatedAt:Date.now()});
      // [BUG FIX] {core, mid}만 넘기면 방금 추출한 facts가 누락된다.
      const _memForBLS3 = loadMemory();
      if(S.character) S.system = window.buildLightSystem(S.character, loadTitles(), {core:newCore, mid:mem.mid||'', facts:_memForBLS3.facts||[]}, S.npcs);
      console.log('[TaleForge] core 기억 갱신 완료 ('+newCore.length+'자)');
    }
  }catch(e){ console.warn('[buildCoreMemory]',e); }
}
window.buildCoreMemoryFromFull = buildCoreMemoryFromFull;

window.buildCoreMemoryFromFull = buildCoreMemoryFromFull;

export async function doStartChat(){
  S.loading=true; window.renderThinking();
  const char=S.character;
  if(!char){ S.loading=false; window.renderThinking(); return; }
  // [BUG FIX] 새 게임/환생 시작 시에도 동적 콘텐츠 복원이 필요하다 —
  // 이전 캐릭터(또는 이전 생애) 플레이 중 AI가 만든 재료·적 드롭·
  // 제작 레시피는 localStorage(tf-* 키)에 영구 보존되는데, 메모리상의
  // MATERIALS/BLUEPRINT_SHOP/CRAFT_RECIPES에 반영되지 않으면 새로
  // 시작한 캐릭터가 그 콘텐츠를 전혀 활용할 수 없다.
  try{
    if(typeof restoreDynamicMaterials==='function') restoreDynamicMaterials();
    if(typeof restoreDynamicEnemies==='function') restoreDynamicEnemies();
    if(typeof restoreDynamicBlueprints==='function') restoreDynamicBlueprints();
    if(typeof checkSaveVersion==='function') checkSaveVersion();
    // [이번 생의 목표 — 난이도/보상 연계] 캐릭터 생성 때 고른 목표(char._goals,
    // 최대 3개)의 난이도 합계를 S._goalDifficulty에 저장해 getEnemyScaleMultiplier가
    // 이번 생 내내 적 강도에 반영하게 하고, 첫 번째 목표를 실제 클리어 목표
    // (CYCLE_GOAL)로 등록해 진행도 추적·완료 시 영구 스탯 보너스(다음 생부터
    // 적용)가 실제로 동작하게 한다. 목표를 하나도 안 골랐으면 난이도는 0,
    // 클리어 목표는 환생 시 assignRandomGoal이 배정한 랜덤 목표가 그대로 유지된다.
    try{
      const _goalLabels = Array.isArray(char._goals) ? char._goals : [];
      const _goalDefs = _goalLabels.map(l=>LIFE_GOALS.find(g=>g.label===l)).filter(Boolean);
      S._goalDifficulty = _goalDefs.reduce((s,g)=>s+(g.difficulty||0),0);
      if(_goalDefs.length){
        const _primary = _goalDefs[0], _primaryLabel = _goalLabels[0];
        saveCycleGoal({
          id:'lifegoal_'+_primaryLabel, icon:_primary.icon, name:_primaryLabel,
          desc:_primary.hint, hint:_primary.hint, aiHint:_primary.aiHint,
          statBonus:_primary.statBonus, difficulty:_primary.difficulty,
          targetProgress:60+_primary.difficulty*20,
          assignedAt:new Date().toISOString(), progress:0, completed:false,
        });
        S.system = (S.system||'') + `\n\n[이번 생의 목표] ${_goalLabels.join(' / ')}. 오프닝 장면과 이후 서사에 이 목표와 관련된 복선·상황을 자연스럽게 심어라.`;
      } else {
        S._goalDifficulty = 0;
      }
    }catch(e){}
    // 전생 카르마 점수에 따른 시작 효과 반영
    const _pastLifeForKarma = (typeof loadPastLife==='function') ? loadPastLife() : null;
    if(_pastLifeForKarma && typeof getKarmaEffect==='function'){
      const _karmaEff = getKarmaEffect(_pastLifeForKarma.karmaScore ?? 50);
      if(_karmaEff){
        S._pastKarmaEffect = _karmaEff;
        const _karmaMods = {...(_karmaEff.statBonus||{}), ...(_karmaEff.statPenalty||{})};
        Object.entries(_karmaMods).forEach(([k,v])=>{
          if(S.stats && S.stats[k]!==undefined) S.stats[k]=Math.max(0,Math.min(999,S.stats[k]+v));
        });
      }
    }
    if(typeof recordStatScenario==='function') recordStatScenario(S.scenario?.id);
    // 종족 전용 콘텐츠 루트 자동 언락
    if(typeof unlockRaceRoute==='function' && typeof RACE_EXCLUSIVE_CONTENT!=='undefined' && S.character?.race){
      const _raceKeyForRoute = Object.keys(RACE_EXCLUSIVE_CONTENT).find(r=>S.character.race.includes(r));
      if(_raceKeyForRoute){
        unlockRaceRoute(_raceKeyForRoute, 'main');
        const _raceContent = (typeof getRaceContent==='function') ? getRaceContent(_raceKeyForRoute) : null;
        if(_raceContent){
          S.system = (S.system||'') + `\n\n[종족 전용 콘텐츠] 이 캐릭터는 ${_raceKeyForRoute}입니다. 관련 장소(${_raceContent.dungeon?.name||''}), 이벤트, NPC 반응이 이 종족에게만 특별하게 열려 있습니다. 자연스러운 흐름에서 이런 종족 전용 요소를 서사에 반영할 수 있습니다: ${_raceContent.event||''}`;
        }
      }
    }
    // [15차 감사 FIX] summon/133이 "게임 시작 훅"으로 window.doStartChat을
    // 감싸 혈통 자동 배정(autoAssignBloodline)과 가문 특성 스탯/서사 힌트
    // (applyBloodlineTraits)를 걸려 했는데, 이 함수(quest/086의 진짜
    // doStartChat)의 실제 호출부(core/084)가 bare 식별자로 직접 부르는
    // 구조라(다른 죽은 훅들과 동일한 원인) 그 래핑이 한 번도 적용된 적이
    // 없었다 — 즉 혈통 시스템 전체(매 턴 각성 체크는 이미 정상 작동하는데,
    // 애초에 시작할 혈통 자체가 배정된 적이 없어 영원히 비활성 상태였다).
    // 실제 캐릭터 생성 완료 시점인 여기서 직접 호출한다.
    if(typeof window.autoAssignBloodline==='function') window.autoAssignBloodline();
    if(typeof window.applyBloodlineTraits==='function') window.applyBloodlineTraits();
    // 전생의 도박 빚이 남아있으면 빚쟁이 NPC 등장 힌트
    if(typeof getGamblingDebt==='function'){
      const _debtForIntro = getGamblingDebt();
      if(_debtForIntro && !_debtForIntro.paidOff && _debtForIntro.totalDebt>0){
        S.system = (S.system||'') + `\n\n[전생의 빚] 이 캐릭터는 전생에 도박으로 ${_debtForIntro.totalDebt}골드의 빚을 졌습니다. 채권자는 "${_debtForIntro.creditorName}"입니다. 게임 초반 적절한 시점에 이 빚쟁이(또는 그 대리인)를 서사에 자연스럽게 등장시켜 상환을 요구하십시오.`;
      }
    }
    // 7회차 이상이면 신비한 서커스 등장 가능성 힌트
    if(typeof loadCycleCount==='function' && loadCycleCount()>=7 && Math.random()<0.3){
      S.system = (S.system||'') + `\n\n[전생의 서커스] 이 캐릭터는 여러 생을 거쳐왔습니다. 게임 중반 이후 여행 중 우연히 신비한 떠돌이 서커스단을 마주칠 수 있습니다. 자연스러운 흐름이라면 이런 만남을 서사에 배치해도 좋습니다 (강제하지 마세요).`;
    }
    // 신격화 완료 시 신의 개입 가능성 힌트
    if(typeof loadDeification==='function'){
      const _deifStatus = loadDeification();
      if(_deifStatus?.deified){
        S.system = (S.system||'') + `\n\n[신격화] 이 캐릭터의 전생 영혼은 이미 신의 영역에 도달했습니다. 극적으로 중요한 순간, 정체불명의 목소리·기이한 우연·불가능해 보이는 구원 등으로 "무언가 초월적인 존재"가 은근히 개입하는 느낌을 서사에 아주 가끔 녹여낼 수 있습니다 (과용 금지, 신비로움 유지). 그런 개입이 실제로 일어나면 <gs>{"divine_intervention":"개입 내용 한 줄 요약"}</gs>를 출력하라.`;
      }
    }
    // 루프 완전 자각 시 환생자 길드 등장 가능성
    if(typeof loadLoopAwareness==='function'){
      const _loopAware = loadLoopAwareness();
      if(_loopAware?.level>=3){
        S.system = (S.system||'') + `\n\n[환생자 길드] 이 캐릭터는 자신이 환생을 반복하고 있음을 완전히 자각했습니다. 다른 환생자들의 비밀 결사 "환생자 길드"의 구성원이 우연히 접촉해올 수 있습니다. 자연스러운 흐름이라면 배치해도 좋습니다 (강제하지 마세요). 플레이어가 가입 여부를 명확히 결정하면 <gs>{"looper_guild":"join"}</gs> 또는 <gs>{"looper_guild":"reject"}</gs>를 출력하라.`;
      }
    }
  }catch(e){ console.warn('[동적 콘텐츠 복원 실패]', e); }
  // [프롤로그 경량화] 기존엔 캐릭터 생성 직후 첫 요청부터 buildLightSystem
  // (32000자+ 전체 게임 시스템 프롬프트)과 GS 마스터 규칙(5000자+)이
  // 통째로 실려, AI가 소화해야 할 지시사항이 첫 턴부터 과도하게 많았다.
  // 이 때문에 "1장은 자연스럽게 시작되며 에이든이 초반에 강제로 등장할
  // 필요 없다" 같은 세부 지침이 우선순위에서 밀려 무시되기 쉬웠다.
  // 프롤로그(신분에 맞는 극적인 도입부 한 장면)는 게임 시스템 전체가
  // 필요 없으므로, 훨씬 가벼운 전용 프롬프트로 대체하고 정식 시스템
  // 프롬프트는 프롤로그 다음 턴(사용자의 첫 선택 이후)부터 적용한다.
  S.system = `당신은 다크판타지 인터랙티브 소설의 나레이터입니다. 지금은 프롤로그 — 게임의 복잡한 시스템(스킬·퀘스트·전투 규칙 등)은 아직 신경 쓰지 말고, 오직 캐릭터의 신분과 상황에 맞는 생생하고 몰입감 있는 도입부 한 장면만 묘사하세요. 다른 이름 있는 캐릭터를 등장시켜야 할 특별한 이유가 없다면, 주인공 혼자만의 상황에 집중하세요.`;
  S._prologueMode = true; // 다음 턴에 정식 시스템 프롬프트로 전환하기 위한 표시
  const CONTINENT_DESCS={
    central:'중앙 대륙 — 왕국과 문명의 중심지. 왕도, 마법탑, 성도가 자리한 세계의 심장부.',
    north:'북대륙 — 영구 동토와 혹한의 설원. 강인한 전사와 야만족이 사는 빙하의 땅.',
    east:'동대륙 — 예술과 외교의 고장. 엘프와 인간이 공존하는 고원 문명의 땅.',
    west:'서대륙 — 해적과 상인이 활보하는 항구 세계. 돈이 곧 권력인 바다의 땅.',
    south:'남대륙 — 밀림과 사막의 고대 문명. 태양 신전과 잃어버린 도시의 신비로운 땅.',
    northeast:'북동 대륙 — 세계수와 별빛 고원의 엘프 왕국. 신비로운 예언과 오랜 숲의 땅.',
    southeast:'남동 군도 — 해적과 항해자들이 지배하는 섬들의 바다. 보물과 해구의 전설이 살아 있는 땅.',
    northwest:'북서 대륙 — 지하 갱도와 용광로의 드워프 왕국. 고대 기계와 장인 조합의 땅.',
  };
  const continentId = char.startContinent || 'central';
  const continentLabel = char.startContinentLabel || '중앙 대륙';
  const continentDesc = CONTINENT_DESCS[continentId] || CONTINENT_DESCS['central'];

  // 대륙 데이터로 오프닝 프롬프트 강화
  const _cont = (typeof FIVE_CONTINENTS !== 'undefined') ? FIVE_CONTINENTS[continentId==='central'?'center':continentId] : null;
  const _kd = _cont?.kingdom;
  const _contExtra = _kd ? [
    '왕국: '+_kd.name+' (수도: '+_kd.capital+', 통치자: '+_kd.ruler+')',
    '문화: '+_kd.culture+' / 특산: '+_kd.specialty,
    '군사: '+_kd.military,
    _kd.npcs?.length ? '주요 인물: '+_kd.npcs.map(n=>n.icon+n.name+'('+n.role+')').join(', ') : '',
    S._continentStartQuest ? '첫 의뢰: ['+S._continentStartQuest.title+'] — '+S._continentStartQuest.desc : '',
    (()=>{
      if(!_kd?.relations) return '';
      const rivals = Object.entries(_kd.relations).filter(([,v])=>v==='적대'||v==='긴장');
      if(!rivals.length) return '';
      const rCont = rivals.map(([id])=>(typeof FIVE_CONTINENTS!=='undefined'?FIVE_CONTINENTS[id==='center'?'central':id==='central'?'center':id]?.label:id)).filter(Boolean);
      return rCont.length ? '긴장 관계: '+rCont.join(', ')+' — 해당 출신 NPC 등장 시 갈등 암시 가능' : '';
    })(),
  ].filter(Boolean).join('\n') : '';

  const op='이야기를 시작합니다.\n주인공: '+char.name+(char.race?' ('+char.race+')':'')+(char.socialRank?' / 신분: '+char.socialRank:'')+' / 직업: '+char.role+'\n세계관: '+(char.scenario||'중세 판타지')+'\n성격: '+(char.personality||'알 수 없음')+'\n배경: '+(char.background||'알 수 없음')+'\n말투: '+(char.speechStyle||'기본')+'\n시작 위치: '+continentDesc+(_contExtra?'\n\n[대륙 세부 정보]\n'+_contExtra:'')+'\n\n위 캐릭터로 '+continentLabel+' 분위기에 어울리는 첫 장면을 생생하게 묘사하고 마지막에 행동 4가지를 제시하세요('+CHOICE_DIVERSITY_HINT+').\n① [행동1]\n② [행동2]\n③ [행동3]\n④ [행동4]';
  // 세계관 금지 사항 — 다른 대륙/세계관 내용 혼입 방지
  const _scenario = char.scenario || '중세 판타지';
  const _worldGuard = _scenario.includes('중세') || _scenario.includes('판타지')
    ? '\n\n[⚠️ 세계관 준수] 이 세계는 중세 판타지입니다. 무협/강호/무림/무술대회, 증기기계/사이버펑크, SF/현대 요소는 절대 포함하지 마십시오. 오직 검과 마법의 중세 판타지 분위기로만 묘사하십시오.'
    : _scenario.includes('무협') || _scenario.includes('강호')
    ? '\n\n[⚠️ 세계관 준수] 이 세계는 무협 강호입니다. 중세 기사단/교황, 증기기계, SF 요소는 절대 포함하지 마십시오.'
    : '';

  // 신분 강제 오프닝
  const _openingRankId = char.socialRankId || 'commoner';
  const _openingRankHints = {
    slave: '\n\n[⛓️ 신분: 노예] 첫 장면부터 노예 신분의 제약을 사실적으로 묘사하라. 쇠사슬 또는 감시, 하대받는 환경, 자유가 없는 상황을 구체적으로 보여라. 선택지도 탈출·저항·복종 등 노예 처지에 맞게 제시하라.',
    outlaw: '\n\n[💀 신분: 무법자] 첫 장면에서 지명수배 상태임을 반영하라. 관원을 피하거나 신분을 숨기는 상황, 사회의 그늘에서 시작하는 분위기를 묘사하라.',
    royal: '\n\n[👑 신분: 왕족] 왕족으로서의 특권과 동시에 음모·감시·기대라는 무게를 첫 장면에 담아라.',
    noble: '\n\n[🏰 신분: 귀족] 귀족의 권위와 책임이 느껴지는 첫 장면으로 시작하라. NPC들이 자연스럽게 경의를 표한다.',
  };
  const _openingRankHint = _openingRankHints[_openingRankId] || '';
  let startOp = op + _worldGuard + _openingRankHint + '\n\n서사 묘사 후 마지막에 반드시: [선택지]①행동1②행동2③행동3④행동4[/선택지] ('+CHOICE_DIVERSITY_HINT+')';
  // [신규] sendMsg(51310줄)와 동일한 패턴 — 캐릭터 생성 과정에서 어떤
  // 시스템이 S._nextInjectedContext에 힌트를 쌓아뒀을 가능성에 대비해
  // 첫 시작 요청에도 반영한다(원래는 소비하는 곳이 없어 방치되던 값).
  if(S._nextInjectedContext){
    startOp += S._nextInjectedContext;
    S._nextInjectedContext = '';
  }
  try{
    // [오프닝 전용 — AI 호출 자체를 건너뜀] 클라우드 flash-lite의 단어 오용
    // ("역부족" 오용 등)과 gemini-2.5-flash의 일일 20회 한도 사이에서
    // 절충하려 했었지만, 오프닝은 매턴 반복되는 게 아니라 "첫인상" 딱
    // 한 장면이라 굳이 실시간 AI 호출에 의존할 필요가 없다는 판단—
    // composeLocalTurnText가 이미 신분·시작 대륙·종족을 반영한 로컬
    // 오프닝(composeRankContinentOpening)을 만들어내므로, 여기서는 API
    // 호출 없이 바로 그걸 쓴다. 할당량 소모 0, 단어 오용 위험 0.
    const text=composeLocalTurnText([],startOp);
    const cm=text.match(/\[선택지\]([\s\S]*?)(?:\[\/선택지\]|$)/);
    const bareC=!cm && text.match(/[①②③④⑤][^①②③④⑤\n]{3,}(?:\n[①②③④⑤][^①②③④⑤\n]{3,}){1,}/);
    let cleanText=text, choices=['주변을 둘러보며 상황을 파악한다.','가까운 사람에게 말을 건다.','조용히 다음 행동을 계획한다.','좀 더 대담한 방법을 시도한다.'];
    if(cm){
      const parsed=cm[1].match(/[①②③④⑤]([^①②③④⑤]+)/g);
      if(parsed&&parsed.length>=2){ choices=parsed.map(c=>c.replace(/^[①②③④⑤]/,'').trim()); }
      cleanText=text.replace(/\[선택지\][\s\S]*?(?:\[\/선택지\]|$)/,'').trim();
    } else if(bareC){
      const parsed=bareC[0].match(/[①②③④⑤]([^①②③④⑤]+)/g);
      if(parsed&&parsed.length>=2){ choices=parsed.map(c=>c.replace(/^[①②③④⑤]/,'').trim()); cleanText=text.replace(bareC[0],'').trim(); }
    }
    cleanText=cleanText.replace(/[①②③④⑤][^\n]{3,}/g,'').replace(/\n{3,}/g,'\n\n').trim();

    // [버그 수정] 오프닝(doStartChat)에는 <gs> 태그 파싱/제거 로직이 아예
    // 없어서, AI가 시작 장면에서 npc_add 등 GS를 함께 보내면 그 원본
    // JSON이 화면에 그대로 노출되는 버그가 있었다 — sendMsg(메인 대화
    // 루프)의 GS 처리 로직을 오프닝에도 동일하게 적용한다.
    const gsMatch = cleanText.match(/<gs>([\s\S]*?)<\/gs>/);
    if(gsMatch){
      cleanText = cleanText.replace(/<gs>[\s\S]*?<\/gs>/,'').trim();
      try{
        const gs = JSON.parse(gsMatch[1].trim());
        gs._narrativeText = cleanText;
        window._lastParsedGS = gs;
        (window.processGSBlock || window.processGSBlock)(gs);
      }catch(e){ console.warn('[doStartChat] GS 파싱 오류:', e); }
    }
    // 잔여 태그 방어적 제거 (여는 태그만 오고 닫는 태그가 안 온 경우 등)
    cleanText = cleanText.replace(/<gs>[\s\S]*?(<\/gs>|$)/,'').trim();
    cleanText = cleanText.replace(/```json[\s\S]*?```/g,'').trim();
    cleanText = cleanText.replace(/```[\s\S]*?```/g,'').trim();

    S.messages=[{role:'assistant',content:cleanText,characterName:char.name}];
    S.choices=choices;
    renderMsgs(); window.renderChoices();
  }catch(e){
    console.warn('[doStartChat] callAI 오류:', e?.message||e);
    if(typeof window.logLocalModelEvent==='function'){
      const _stackLines = (e?.stack||'').split('\n').slice(0,5).join(' | ');
      window.logLocalModelEvent('[오프닝] callAI 전체 실패(3단 폴백 다 실패) — 원본 오류: '+(e?.message||e)+(_stackLines?' :: '+_stackLines:''));
    }
    S.messages=[{role:'assistant',content:char.name+'은(는) 새로운 여정을 시작하려 한다.',characterName:char.name}];
    S.choices=['주변을 둘러보며 상황을 파악한다.','가까운 사람에게 말을 건다.','조용히 다음 행동을 계획한다.'];
    try { renderMsgs(); window.renderChoices(); } catch(re){ console.warn('[doStartChat] render 오류:', re); }
  }
  grantTitle('first_blood');
  unlockAchievement('first_start');
  // 기본 직업 도감 등록
  const startJobId = S.character?.jobId || getJobIdFromName(S.character?.role);
  if(startJobId) discoverJob(startJobId, '캐릭터 생성 시 선택');
  S.loading=false; S.initialized=true; window.renderThinking(); updateSendBtn();
  // 😈 악마족 타락 스탯 적용 (게임 재개 시)
  if(typeof applyDemonCorruptionStats==='function') applyDemonCorruptionStats();
  if(typeof applyDemonContractStats==='function') applyDemonContractStats();
  if(typeof applyTrueNameStats==='function') applyTrueNameStats();
  if(typeof applyBeastPackBondStats==='function') applyBeastPackBondStats();
  if(typeof applyBeastLineageStats==='function') applyBeastLineageStats();
  if(typeof applyOrcBloodVowStats==='function') applyOrcBloodVowStats();
  if(typeof applyOrcCouncilStats==='function')  applyOrcCouncilStats();
  if(typeof applyDwarfGrudgeStats==='function') applyDwarfGrudgeStats();
  if(typeof applyDwarfUnfinishedStats==='function') applyDwarfUnfinishedStats();
  if(typeof applyElfForgettingStats==='function') applyElfForgettingStats();
  if(typeof applyElfEmotionStats==='function')    applyElfEmotionStats();
  if(typeof applyHumanLegacyStats==='function')   applyHumanLegacyStats();
  if(typeof applyHumanStigmaStats==='function')   applyHumanStigmaStats();
  // 튜토리얼 자동 시작
  if(typeof isTutorialDone==='function' && !isTutorialDone()) setTimeout(startTutorial, 2000);
}
window.doStartChat = doStartChat;

export function handleKey(e){ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();doSend();} }
window.handleKey = handleKey;

export function doSend(){
  const v=($('msg-inp')?.value||'').trim();
  if(!v||S.loading) return;
  // processSkillBeforeSend는 sendMsg 내부에서 isChoice=false일 때 한 번만 호출됨
  sendMsg(v, false);
}
window.doSend = doSend;

export async function sendMsg(userMsg, isChoice=false){
  if(!userMsg.trim()||S.loading||!S.character) return;
  // [버그 수정] 대륙 금기 체크(checkContinentTaboo — 대륙별 금기 발언 시 평판
  // 하락 + AI 힌트 주입)는 misc/292가 한때 window.sendMsg를 감싸는 방식으로
  // 매 전송마다 실행하려 했던 훅이다. sendMsg()가 실제로는 이 파일 안에서
  // 직접(모듈 바인딩으로) 호출되어 그 래핑이 한 번도 실행되지 않았다 — 다른
  // 죽은 훅들과 같은 원인. quest/086은 misc/292를 import하지 않으므로(순환
  // 참조 방지), 이 코드베이스에서 흔히 쓰는 "typeof 확인 후 전역 window.X
  // 폴백 호출" 방식으로 실제 호출 지점에 연결한다.
  if(typeof checkContinentTaboo==='function') checkContinentTaboo(userMsg);
  // [버그 수정] NPC 오프스크린(비화면 활동) 스케줄러도 같은 이유(ui/155의
  // window.sendMsg 래핑이 한 번도 실행 안 됨)로 죽어있던 매턴 훅이다.
  if(typeof runOffscreenScheduler==='function') runOffscreenScheduler();
  if(typeof checkOffscreenEvents==='function') checkOffscreenEvents();
  // [버그 수정] 영지 방어력 경고(checkDemesneDefenseWarning)도 race/260이
  // window.sendMsg를 감싸던 같은 원인으로 죽어있던 매턴(전송 전) 훅이다.
  if(typeof checkDemesneDefenseWarning==='function') checkDemesneDefenseWarning();
  // [버그 수정] NPC 드라마 자동 발생 스케줄러(runDramaScheduler, 자체 15턴
  // 간격 게이트 보유)도 npc/158이 window.sendMsg를 감싸던 같은 원인으로
  // 죽어있던 매턴(전송 전) 훅이다.
  if(typeof runDramaScheduler==='function') runDramaScheduler();
  // [버그 수정] 나비효과 기록·동료 이탈 체크·세계 영향력 갱신도 ui/291이
  // window.sendMsg를 감싸던 같은 원인으로 죽어있던 훅이다.
  if(S.character && userMsg){
    if(typeof recordButterflyEvent==='function') recordButterflyEvent(userMsg);
    if(typeof checkCompanionLeave==='function') checkCompanionLeave(userMsg);
    if(typeof updateWorldImpact==='function') updateWorldImpact(userMsg);
    // [버그 수정] 플레이스타일 갱신·딜레마 컨텍스트 주입도 misc/293이
    // window.sendMsg를 감싸던 같은 원인으로 죽어있던 훅이다.
    if(typeof updatePlayStyle==='function') updatePlayStyle(userMsg);
    if(typeof buildDilemmaContext==='function'){
      const _dc = buildDilemmaContext(userMsg);
      if(_dc) S._nextInjectedContext = (S._nextInjectedContext||'') + _dc;
    }
    // [버그 수정] getNpcTopicHint는 misc/293의 cacheNpcTopicResponse가
    // 매턴 쌓아두는 "NPC별 이전 답변 요약" 캐시를 읽어 서사 일관성
    // 힌트를 만드는 함수인데, 정작 이를 실제로 호출해 프롬프트에
    // 주입하는 곳이 어디에도 없어 캐시만 쌓이고 한 번도 쓰인 적이
    // 없었다. 이번 사용자 메시지에 등장하는 NPC를 찾아 힌트를
    // 주입한다(같은 파일의 buildDilemmaContext와 동일한 위치·방식).
    if(typeof getNpcTopicHint==='function' && typeof loadNPCs==='function'){
      const _npcsForTopic = loadNPCs()||[];
      const _mentionedNpc = _npcsForTopic.find(n=>n.name && userMsg.includes(n.name));
      if(_mentionedNpc){
        const _topicHint = getNpcTopicHint(_mentionedNpc.name, userMsg);
        if(_topicHint) S._nextInjectedContext = (S._nextInjectedContext||'') + _topicHint;
      }
    }
  }
  // [버그 수정] 30턴 자동 압축·상황별/요약 BLS 주입도 ai-prompt/153이
  // window.sendMsg를 감싸던 같은 원인으로 죽어있던 훅이다.
  if((S.msgCount||0)>0 && (S.msgCount||0)%30===0 && typeof autoCompressHistory==='function') setTimeout(autoCompressHistory,2000);
  if(typeof buildContextBLS==='function'){
    const _ctxBLS = buildContextBLS();
    if(_ctxBLS) S._nextInjectedContext = (S._nextInjectedContext||'') + _ctxBLS;
  }
  if((S.msgCount||0)%5===0 && typeof getSummaryBLS==='function'){
    const _sumBLS = getSummaryBLS();
    if(_sumBLS) S._nextInjectedContext = (S._nextInjectedContext||'') + _sumBLS;
  }
  // [로컬 전투 엔진] 로컬 전투가 진행 중일 때 메인 채팅으로 메시지를 보내면
  // AI 프롬프트에 낡은 몬스터 정보가 들어가거나, 로컬로 이미 처치한 몬스터를
  // AI가 다시 살아있는 것으로 착각하는 등 두 시스템이 어긋날 수 있다.
  // 전투 패널을 마저 진행하거나 도주로 마무리하도록 안내하고 전송을 막는다.
  try{
    const _lc = typeof loadLocalCombat==='function' ? loadLocalCombat() : null;
    if(_lc && _lc.active){
      toast('⚔️ 전투가 진행 중입니다. 먼저 전투를 마무리하세요.', 2500);
      if(typeof window.openP==='function') window.openP('local-combat');
      if(typeof renderLocalCombatPanel==='function') renderLocalCombatPanel();
      return;
    }
    // 도주/패배로 살아남았지만 "로컬 엔진으로 시작된" 몬스터가 여전히
    // 남아있다면, AI 서사로 넘기지 않고 로컬 전투를 다시 열어 이어간다.
    // [버그 수정 — 심각] 이 재개 로직이 무조건이었다 — 도망치거나
    // 패배해서 살아남은 몬스터가 하나라도 있으면, 그 다음부터는 무슨
    // 메시지를 보내도 영원히 같은 전투로 다시 끌려 들어갔다. 도주에
    // 성공해도(finishLocalCombat이 승리 시에만 status를 'dead'로 바꾸고
    // 도주/패배는 의도적으로 살려두므로) 몬스터가 여전히
    // _localCombatEngaged로 남아있어서, 확실히 죽이지 못하는 상대(특히
    // 이상 현상처럼 체급을 압도하는 몬스터)를 한 번이라도 만나면 그
    // 즉시 게임이 다시는 진행되지 않는 막다른 상황이 됐다 — 이번
    // 세션에서 찾은 가장 심각한 버그(무리 몬스터 무한 전투)와 사실상
    // 같은 계열의, 훨씬 더 흔하게 터질 수 있는 버전이다. 같은 몬스터
    // 조합에게 연속으로 강제 재개당한 횟수를 세어, 두 번 넘게(도주
    // 실패 포함 총 세 번째부터) 반복되면 그 몬스터를 놓아주고(engaged
    // 해제) 메시지를 정상 진행시켜 플레이어가 그 자리를 벗어날 수 있게
    // 한다 — 몬스터 자체는 죽지 않고 그대로 남아있어 나중에 다시 마주칠
    // 수 있다.
    const _allMonsters = typeof loadMonsters==='function' ? (loadMonsters()||[]) : [];
    const _survivors = _allMonsters.filter(m=>m.status==='alive' && m._localCombatEngaged);
    if(_survivors.length && typeof initLocalCombat==='function'){
      const _survivorKey = _survivors.map(m=>m.id).sort().join(',');
      if(S._survivorForceKey !== _survivorKey){ S._survivorForceKey = _survivorKey; S._survivorForceCount = 0; }
      S._survivorForceCount = (S._survivorForceCount||0) + 1;
      if(S._survivorForceCount > 2){
        _survivors.forEach(m=>{ m._localCombatEngaged = false; });
        if(typeof saveMonsters==='function') saveMonsters(_allMonsters);
        toast('💨 위험한 상대를 피해 그 자리를 벗어난다.', 2500);
        S._survivorForceKey = null; S._survivorForceCount = 0;
      } else {
        const combat = initLocalCombat();
        if(combat){
          toast('⚔️ 아직 근처에 남은 적이 있습니다.', 2500);
          if(typeof window.openP==='function') window.openP('local-combat');
          if(typeof renderLocalCombatPanel==='function') renderLocalCombatPanel();
          return;
        }
      }
    }
  }catch(e){}

  // [프롤로그 → 정식 시스템 전환] 프롤로그 응답을 받은 뒤 사용자의 첫
  // 실제 행동(선택지 클릭 또는 직접 입력)이 들어온 시점에, 가벼웠던
  // 프롤로그 전용 시스템 프롬프트를 정식 buildLightSystem(전체 게임
  // 시스템 + GS 규칙)으로 교체한다. 이렇게 하면 무거운 지시사항은
  // "1장이 실제로 진행되는 시점"부터만 실리고, 정작 가장 부담이 컸던
  // 캐릭터 생성 직후 첫 요청은 가볍게 유지된다.
  if(S._prologueMode){
    S._prologueMode = false;
    try{
      const memory = loadMemory();
      const coreMem = memory.core||memory.mid||'';
      S.system = window.buildLightSystem(S.character, loadTitles(), {core:coreMem, mid:''}, (S.npcs||[]).slice(0,5));
    }catch(e){ console.warn('[prologue->full system 전환 실패]', e); }
  }

  // [신규] 이번 입력이 선택지 클릭인지 자유 타이핑인지 전역에 기록.
  // 매칭 엔진이 이 정보를 활용해 "선택지 클릭"에는 더 적극적으로 캐시를
  // 적용하고, "자유 입력"에는 항상 AI를 우선 사용하도록 구분한다.
  // (자유서술 다양성은 그대로 보존, 선택지 기반 반복 패턴만 별도로 최적화)
  S._isCurrentInputChoice = !!isChoice;
  // [신규] 명시적 전투 상태 학습 시스템용 — 이번 턴 사용자 입력을 기억해
  // AI가 combat_state를 출력하면 (입력텍스트 → 상태) 쌍으로 누적 저장.
  window._lastUserMsgForCombatLearning = userMsg;
  // [B-8/B-9 FIX] 턴 시작 시 이전 GS 캐시 초기화 — 이번 턴의 감정/소환수 변경이 즉시 BLS에 반영됨
  window._lastParsedGS = null;
  // 💛 계율 쉴드 매 턴 리셋 (1턴 1회 사용 보장)
  S._covenantCritFailShieldUsed = false;
  S._covenantDivineShieldUsed   = false;
  S._covenantAbyssRerollUsed    = false;
  // [신규] 자동 드롭 중복 방지 플래그도 매 턴 리셋
  S._itemsGrantedThisTurn = false;
  // 스킬 선행 처리 — pendingSkill이 있으면 메시지 앞에 [스킬:이름] 태그를 부착한다.
  // [BUG FIX] 이전 코드는 isChoice===false일 때만 호출했고, 반환값(태그 부착된
  // 메시지)도 버려서 자유 입력·선택지 클릭 모두에서 실제로는 태그가 붙지 않고
  // MP/HP 소모 등 부수효과만 일어났다 — AI에게는 스킬 사용이 전달되지 않았다.
  // 이제 isChoice 여부와 무관하게 항상 호출하고, 반환값을 userMsg에 반영한다.
  if(typeof processSkillBeforeSend==='function'){
    userMsg = processSkillBeforeSend(userMsg);
  }
  // 선택지 클릭 시 기록 — 태그 부착 후의 원문이 아니라 원래 선택지 문구를 기록
  if(isChoice && typeof recordChoice==='function'){
    recordChoice(userMsg.replace(/^\[스킬:[^\]]+\]\s*/,''), S.messages.slice(-1)[0]?.content?.slice(0,80)||'');
  }
  $('msg-inp').value=''; S.choices=[]; window.renderChoices();
  const char=S.character;

  // 스킬 파싱
  let skillUsed=null, cleanMsg=userMsg;
  const sm=userMsg.match(/\[스킬:([^\]]+)\]/);
  if(sm){
    const sid=sm[1], sdef=getAllSkillDefs().find(s=>s.id===sid&&S.unlockedSkills[sid]);
    if(sdef&&(sdef.type==='active'||sdef.type==='event')){
      const enhLevel = getSkillEnhanceLevel(sdef.id);
      const enhTier = enhLevel > 0 ? SKILL_ENHANCE_TIERS[enhLevel-1] : null;
      // MP 비용: 강화 시 최대 30% 감소
      const mpDiscount = enhTier ? Math.round((sdef.mpCost||0) * enhTier.bonus * 0.3) : 0;
      const mpCostFinal = Math.max(0, (sdef.mpCost||0) - mpDiscount);
      const mpOk=!mpCostFinal||S.stats.mp>=mpCostFinal;
      const hpOk=!sdef.hpCost||S.stats.hp>sdef.hpCost;
      if(mpOk&&hpOk){
        skillUsed=sdef; cleanMsg=userMsg.replace(/\[스킬:[^\]]+\]/,'').trim()||sdef.name+' 사용';
        if(mpCostFinal) S.stats.mp=Math.max(0,S.stats.mp-mpCostFinal);
        if(sdef.hpCost) S.stats.hp=Math.max(1,S.stats.hp-sdef.hpCost);
        // HP 회복: 강화 시 증폭
        const hpRestoreBonus = enhTier ? Math.round((sdef.hpRestore||0) * enhTier.bonus) : 0;
        const hpRestoreFinal = (sdef.hpRestore||0) + hpRestoreBonus;
        if(hpRestoreFinal) S.stats.hp=Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999),S.stats.hp+hpRestoreFinal);
        window.updateHeader();
      }
    }
  }

  const _userMsg = {role:'user',content:cleanMsg,characterName:char.name};
  S.messages.push(_userMsg);
  S.fullMessages.push(_userMsg);
  _markDirty('chat');
  S.loading=true; renderMsgs(); window.renderThinking(); updateSendBtn();
  // 워치독: 30초 후에도 로딩 중이면 강제 리셋
  clearTimeout(window._loadingWatchdog);
  window._loadingWatchdog = setTimeout(()=>{
    if(S.loading){
      S.loading=false;
      if(typeof window.renderThinking==='function') window.renderThinking();
      if(typeof updateSendBtn==='function') updateSendBtn();
      if(typeof window.renderChoices==='function'){
        if(!S.choices||!S.choices.length)
          S.choices=['주변을 살피며 상황을 파악한다.','가까운 NPC에게 말을 건다.','다음 행동을 생각한다.'];
        window.renderChoices();
      }
      toast('⚠️ 응답 지연 — 다시 시도해주세요', 3000);
    }
  }, 30000);

  // 주사위 필요 여부 판별
  const msg_lc=cleanMsg.toLowerCase();

  // ══════════════════════════════════════════════════════════
  // 주사위 판별 엔진 — 문맥 기반 정밀 판정
  // 원칙: 실제로 "실행"하는 행동만 주사위, 생각/대화/묘사는 스킵
  // ══════════════════════════════════════════════════════════

  // ── 판정 제외 패턴 (먼저 체크 — 이게 있으면 무조건 casual) ──
  const noRollRe = /(?:생각|고민|고려|계획|상상|떠올|궁금|바라|원해|하고싶|하고 싶|해볼까|해볼지|할까|할지|할 것|할거|해야|해야지|해야겠|어떻게|어떡|뭘|무얼|무엇을|어디|누구|왜|왜냐|이유|까닭|느낌|기분|감정|생각이|마음이|눈길|바라보|바라볼|쳐다|지켜보|관찰하며 서|멈춰|멈춰서|기다리|기다려|잠시|잠깐|쉬|머뭇|망설|주저|두리번|두리번거|살짝|슬쩍|조용히 서|가만히 서|서 있|앉아|앉았|누워|누웠|기대어|기대었|가만히|조용히|침묵|침묵을 지|말없이|눈을 감|눈을 떠|숨을 고르|숨을 들이|한숨|한숨을|고개를 끄덕|고개를 저|미소|미소 지|웃으며|울며|눈물을 흘|손을 내려|팔짱|팔짱을|어깨를 으쓱|입술을 깨물|입을 다물)/;

  // ── 실행형 어미 (이게 있어야 행동으로 인정) ──
  // "한다/했다/하겠다/하자/해봐/해버린다" 등
  const execEndingRe = /(?:한다|했다|하겠다|하겠어|할게|할께|하자|해버린|해버렸|해냈|해낸다|해봐|해봤|해본다|해야겠다|하고야|하고 만다|쳐낸|쳐냈|뽑아낸|낚아챈|잡아챈|잡아당긴|잡아끈|집어든|내던진|내리친|내리꽂|휘두른|휘둘렀|뛰어든|뛰어들었|달려든|달려들었|파고든|파고들었|뛰쳐|뛰쳐나|빠져나|빠져나왔|빠져나간|기어오른|기어올랐|기어든|기어들었|숨어든|숨어들었|잠입했|잠입한다|탈출했|탈출한다|탈출해|도주했|도주한다|도망쳤|도망친다|꺼낸다|꺼냈다|집어낸|집어넣|밀어넣|밀쳐낸|밀쳐냈|눌러|눌렀|눌러버린|비틀었|비틀어|꺾었|꺾어|걷어찬|걷어찼|발로 찬|발로 찼|주먹으로|칼로|검으로|활로|창으로|도끼로)/;

  // ── 카테고리별 행동 패턴 ──

  // [전투] 직접 공격/방어 행동
  const combatRe = /(?:공격|베어|베기|찌르|때려|가격|강타|일격|난도질|급소|급습|기습|암습|암격|암살|독살|독을 탄|독을 넣|독침|독화살|폭탄|화염병|불을 질러|방화|저격|사격|쏘아|쏜다|던져|투척|투석|파괴|부숴|부수|무너뜨|제압|결박|포박|붙잡아|낚아채|해제|무장해제|방어|막아|막았|막아낸|반격|반격했|역습|패링|회피|피해낸|피해냈|구르며|굴러|구른다|전력|전력으로 달|전속력|도약|뛰어|점프|날아|날았|뛰어오른|뛰어올랐)(?:해|하고|하며|했|한다|할게|할께|하겠|냈|낸다|낸다|버린|버렸|든다|들었|친다|쳤|꽂|꽂았|꽂는다)/;

  // [은신/기만] 숨기/속이기/위장
  const stealthRe = /(?:숨어|숨었|몰래|살금|살금살금|발소리를 죽|기척을 죽|그림자처럼|어둠 속으로|어둠속으로|벽에 붙어|벽에 기대어|엎드려|엎드렸|납작|납작 엎드|포복|포복으로|위장|변장|분장|가면을 쓰|가면 쓰|변장했|위장했|다른 사람인 척|모르는 척|아무것도 모르는 척|표정을 숨기|감정을 숨기|내색하지|내색 않|티 내지|티를 감추|아닌 척|없는 척|가장|가장했|연기|연기했|눈을 피해|시선을 피해|눈치채지 못하게|들키지 않게|발각되지 않게|추적을 따돌|미행을 따돌)/;

  // [설득/교섭] 실제로 설득 시도
  const persuadeRe = /(?:설득|설득했|설득한다|설득해|설득하겠|납득|납득시키|협상|협상했|협상한다|흥정|흥정했|흥정한다|거래를 제안|거래 제안|조건을 내걸|조건을 제시|회유|회유했|포섭|포섭했|매수|매수했|뇌물|뇌물을 건|뇌물을 줬|부탁|부탁했|부탁한다|청탁|청탁했|간청|간청했|애원|애원했|懇請|懇請했)/;

  // [위협/공포] 위협 행동
  const intimidateRe = /(?:위협|위협했|위협한다|협박|협박했|협박한다|겁박|겁박했|겁주|겁을 줬|겁을 준다|으름장|으름장을 놓|칼을 들이대|칼을 겨누|칼끝을 들이|무기를 겨누|총을 겨누|목에 칼|목덜미를 잡|멱살을 잡|노려보며 위협|죽이겠다고|죽여버리겠|가만두지 않겠|후회하게|후회할|압박|압박했|단호하게 경고)/;

  // [탐색/조사] 실제로 뒤지거나 조사
  const searchRe = /(?:뒤진|뒤졌|뒤져|수색했|수색한다|탐색했|탐색한다|조사했|조사한다|살펴봤|살펴본다|찾아냈|찾아낸|발견했|발견한다|캐냈|캐낸|파헤쳤|파헤친다|뒤집어|뒤집었|열어봤|열어본다|확인했|확인한다|문을 열었|문을 열어|자물쇠를 열|자물쇠를 따|잠금을 해제|서랍을 열|서랍을 뒤|금고를 열|금고를 뒤|단서를 찾|흔적을 찾|증거를 찾|발자국을 쫓|냄새를 맡아|귀를 기울여)/;

  // [이동/탈출] 실제 이동 행동
  const moveRe = /(?:달려|달렸|달린다|뛰어|뛰었|뛴다|도망|도망쳤|도망친다|탈출|탈출했|탈출한다|탈출해|빠져나|빠져나왔|빠져나간다|벗어나|벗어났|넘어|넘었|넘는다|담을 넘|벽을 넘|창문으로 뛰|창문을 뚫|창문을 통해 뛰|지붕으로|지붕 위로|지하로|지하 통로로|하수구로|비밀 통로로|후문으로|뒷문으로|도주|도주했|도주한다|철수|철수했|철수한다|후퇴|후퇴했|후퇴한다)/;

  // [마법/특수능력]
  const magicRe = /(?:마법|주문|시전|시전했|시전한다|소환|소환했|소환한다|봉인|봉인했|봉인한다|결계|결계를 쳤|결계를 펼쳤|마나|마력을 쏟|마력을 담아|마법진|마법진을 그려|주술|주술을 걸었|주술을 건다|저주|저주를 걸었|저주를 건다|치유|치유했|치유한다|회복|회복시켰|회복시킨다|힐링|힐링했)/;

  // [사회적 행동] 실제 대화 시작 — 단순 "말을 건다"가 아닌 목적 있는 접근
  const socialActionRe = /(?:접근|접근했|접근한다|말을 걸었|말을 건다|대화를 시작|대화를 시작했|먼저 말|먼저 다가가 말|손을 내밀었|손을 내민다|인사를 건넸|인사를 건넨다|소개했|소개한다|이름을 밝혔|이름을 밝힌다|정체를 밝혔|정체를 밝힌다|신분을 밝혔|신분을 밝힌다|거짓 신분|가짜 신분|다른 이름으로 소개|정보를 캐냈|정보를 캐낸다|정보를 얻어냈|정보를 얻어낸다|술을 권했|술을 권한다|음식을 건넸|선물을 건넸|돈을 건넸|돈을 줬|돈을 준다|뇌물을 건넸)/;

  // [문맥 기반] 전투/위험 상황에서의 평범한 행동도 판정
  const isInCombat = (typeof loadMonsters==='function') && (loadMonsters()||[]).some(m=>m.status==='alive');
  const isHostileNPC = (S.npcs||[]).some(n=>n.relation==='hostile'||n.relation==='enemy');
  const isDangerousContext = isInCombat || isHostileNPC;

  // 위험 상황에서 추가로 판정 붙는 패턴
  const contextualRe = isDangerousContext
    ? /(?:말을 건|말을 걸|다가가|다가갔|다가간다|뒤로 물러|뒤로 물러났|물러선다|등을 돌|등을 돌렸|자리를 피해|자리를 피했|고개를 숙여|고개를 숙였|손을 들어|손을 들었|무릎을 꿇|무릎을 꿇었|항복|항복했|항복한다|버텼|버텨냈|버텨낸다|저항|저항했|저항한다)/
    : null;

  // ── 최종 판정 ──
  const pureReactionRe = /^(안녕|반가워|고마워|감사|미안|죄송|잘자|잘 자|ㅋ+|ㅎ+|ㅠ+|ㅜ+|응|네|아니|그래|알겠|알았|맞아|좋아|싫어|흠|으음|글쎄|헐|오|와|아|어|음)[\s!?,.]*$/;

  // 제외 패턴이 있으면 무조건 casual (단, 실행형 어미가 함께 있으면 행동으로 인정)
  const hasExclude = noRollRe.test(msg_lc) && !execEndingRe.test(msg_lc);

  const hasIntent = !hasExclude && (
    skillUsed ||
    combatRe.test(msg_lc) ||
    stealthRe.test(msg_lc) ||
    persuadeRe.test(msg_lc) ||
    intimidateRe.test(msg_lc) ||
    searchRe.test(msg_lc) ||
    moveRe.test(msg_lc) ||
    magicRe.test(msg_lc) ||
    socialActionRe.test(msg_lc) ||
    (contextualRe && contextualRe.test(msg_lc))
  );

  // isCasual: 실제 행동이 없거나, 선택지인데 힌트 없을 때
  const isCasual = (isChoice && !getChoiceDiceHint(userMsg)) || !hasIntent || pureReactionRe.test(cleanMsg.trim());

  // ── 사용 스탯 결정: 복합 행동 우선순위 적용 ──
  // 우선순위: 스킬 > 전투(공격) > 전투(방어) > 원거리 > 위협 > 은신(위장) > 은신(이동) >
  //           마법 > 치유 > 설득 > 탐색(지성) > 탐색(지각) > 이동 > 사회(기만) >
  //           사회(위협) > 사회(협상) > 사회(화술) > 문맥 > 보조키워드 > luk
  let usedStat = 'luk';

  // 복합 행동에서 어떤 패턴이 매칭됐는지 플래그
  const _hasCombatAtk  = combatRe.test(msg_lc) && !/(?:막아|막았|방어|버텨|버텼|반격|패링|저항했|견뎌냈)/.test(msg_lc) && !/(?:쏘아|쏜다|사격|저격|활로|화살|원거리에서|던져|투척)/.test(msg_lc);
  const _hasCombatDef  = combatRe.test(msg_lc) && /(?:막아|막았|방어|버텨|버텼|반격|패링|저항했|견뎌냈)/.test(msg_lc);
  const _hasCombatRng  = combatRe.test(msg_lc) && /(?:쏘아|쏜다|사격|저격|활로|화살|원거리에서|던져|투척)/.test(msg_lc);
  const _hasStealthDsg = stealthRe.test(msg_lc) && /(?:위장|변장|가장|연기|분장|모르는 척|없는 척|아닌 척|표정을 숨기|감정을 숨기|내색|티를 감추)/.test(msg_lc);
  const _hasStealthMov = stealthRe.test(msg_lc) && !_hasStealthDsg;
  const _hasSearchInt  = searchRe.test(msg_lc) && /(?:추리|해석|분석|읽어|연구|파헤|이유를 찾|원인을 찾|단서를 해석)/.test(msg_lc);
  const _hasSearchPer  = searchRe.test(msg_lc) && !_hasSearchInt;
  const _hasSocialDsg  = socialActionRe.test(msg_lc) && /(?:속이|거짓|가짜|다른 이름|위장|거짓 신분|정체를 숨)/.test(msg_lc);
  const _hasSocialFear = socialActionRe.test(msg_lc) && /(?:위협|겁|압박|경고)/.test(msg_lc) && !_hasSocialDsg;
  const _hasSocialNeg  = socialActionRe.test(msg_lc) && /(?:협상|흥정|거래|조건|매수|뇌물)/.test(msg_lc) && !_hasSocialDsg && !_hasSocialFear;
  const _hasSocialSpk  = socialActionRe.test(msg_lc) && !_hasSocialDsg && !_hasSocialFear && !_hasSocialNeg;

  // 복합 행동: "몰래 다가가 칼로 찌른다" → 잠입+공격 → 공격이 최종 목적이므로 STR
  // "독을 건네며 설득한다" → 공격+설득 → 상황에 따라 다르지만 속임수 우선 → DISG
  // 우선순위 테이블로 처리
  if(skillUsed?.stat)                usedStat = skillUsed.stat;
  else if(_hasCombatAtk)             usedStat = 'str';
  else if(intimidateRe.test(msg_lc)) usedStat = 'fear';
  else if(_hasCombatRng)             usedStat = 'rng';
  else if(_hasCombatDef)             usedStat = 'end';
  else if(_hasStealthDsg)            usedStat = 'disg';
  else if(_hasStealthMov)            usedStat = 'agi';
  else if(magicRe.test(msg_lc)){
    usedStat = /(?:치유|치료|회복|힐링)/.test(msg_lc) ? 'fath' : 'mgc';
  }
  else if(persuadeRe.test(msg_lc))   usedStat = 'neg';
  else if(_hasSearchInt)             usedStat = 'int';
  else if(_hasSearchPer)             usedStat = 'per';
  else if(moveRe.test(msg_lc))       usedStat = 'agi';
  else if(_hasSocialDsg)             usedStat = 'disg';
  else if(_hasSocialFear)            usedStat = 'fear';
  else if(_hasSocialNeg)             usedStat = 'neg';
  else if(_hasSocialSpk)             usedStat = 'spk';
  else if(contextualRe?.test(msg_lc)){
    if(/(?:말을 건|말을 걸|다가가|다가갔)/.test(msg_lc))      usedStat = 'spk';
    else if(/(?:뒤로 물러|물러선|등을 돌|자리를 피)/.test(msg_lc)) usedStat = 'agi';
    else if(/(?:버텼|저항|항복)/.test(msg_lc))               usedStat = 'end';
  }
  else {
    // 보조 키워드 폴백
    const _fallbackHints=[
      {keys:['의지','굳건','정신력','두려움을 극복','포기하지'],stat:'wil'},
      {keys:['지휘','명령','통솔','부대','군령'],stat:'ldr'},
      {keys:['매력','호감을 사','마음을 얻','신뢰를 쌓'],stat:'cha'},
      {keys:['마법','주문','마나','소환','시전'],stat:'mgc'},
      {keys:['치유','치료','회복','힐'],stat:'fath'},
      {keys:['활','쏘','사격','원거리'],stat:'rng'},
    ];
    const _fb = _fallbackHints.find(h=>h.keys.some(k=>msg_lc.includes(k)));
    if(_fb) usedStat = _fb.stat;
  }
  const statValue=S.stats[usedStat]||50;
  // ── [추가] 행운 보정: 판정마다 luk 수치의 0.1만큼 성공률에 소량 가산 ──
  const lukBonus = Math.floor((S.stats.luk||50) * 0.1);

  let survivalPenalty=0;

  // ── 피로도 페널티 계산 ────────────────────────────────────────
  // 연속 전투·장거리 이동 시 판정에 페널티
  {
    const _fatigue = S._fatigue || 0;
    if(_fatigue >= 80)       survivalPenalty -= 15; // 탈진: 심각한 페널티
    else if(_fatigue >= 50)  survivalPenalty -= 8;  // 피로: 중간 페널티
    else if(_fatigue >= 30)  survivalPenalty -= 3;  // 약간 피로
  }

  // [CRITICAL BUG FIX] tickStatusEffects()가 인자 없이 호출되는데 실제 함수는
  // tickStatusEffects(target) 시그니처라 target=undefined로 들어가 매 턴 상태이상
  // 갱신(턴 감소·만료 처리)이 전혀 안 되던 버그. loadStatusEffects()도 객체 반환인데
  // .some() 배열 메서드를 호출해 TypeError가 나던 버그. 둘 다 player 대상으로 수정.
  tickStatusEffects('player');
  renderStatusBar();

  // 동결 상태 = 판정 불가 (자동 실패) — tick 후 확인
  const effects = (typeof getActiveEffects==='function') ? getActiveEffects('player') : [];
  // 완전 빙결 = 행동 불가, 부분 저항(weakened) 빙결은 페널티만 적용하고 행동 가능
  const isStunned = effects.some(e=>window.STATUS_EFFECTS[e.id]?.effect?.stunned && !e.weakened);
  if(isStunned){
    toast('❄️ 빙결 상태! 행동 불가!', 2000);
    S.loading=false; window.renderThinking(); updateSendBtn(); return;
  }

  // 파티 보너스
  const partyBonus = S._partyBonus ? (S._partyBonus[usedStat]||0) : 0;

  // 콤보 보너스
  const comboBonus = S._comboBonus||0;

  // 상태이상 보너스/페널티 (tickStatusEffects가 채운 값 사용)
  const statusBonus = (S._statusStatBonus||0) - (S._statusStatPenalty||0);
  // 판정 후 리셋
  S._statusStatBonus = 0; S._statusStatPenalty = 0;

  const weatherBonus = getWeatherStatModifier(usedStat||'str');
  // 계절 효과
  const seasonEff = (typeof getSeasonEffect==='function') ? getSeasonEffect() : {};
  const seasonBonus = seasonEff.statBonus?.[usedStat||'str']||0;
  const skillBonus = Object.values(S._tempBoosts||{}).reduce((a,b)=>a+b,0);
  const equippedBonus2 = getEquippedStatBonus(usedStat||'str');
  const partyBattleInfo2 = typeof getPartyBattleBonus==='function' ? getPartyBattleBonus() : {bonus:0,desc:''};
  const emotionBonus = typeof getEmotionBonus==='function' ? getEmotionBonus() : 0;
  // lukBonus 적용: luk 스탯의 10%를 유효 스탯에 가산 (행운 체감 연동)
  const terrainBonus  = (typeof window.getTerrainBonus==='function') ? window.getTerrainBonus(usedStat||'str') : 0;
  const injuryBonus   = (typeof getCombatInjuryBonus==='function') ? getCombatInjuryBonus(usedStat||'str') : 0;
  const overweightPen = (typeof getOverweightPenalty==='function') ? getOverweightPenalty(usedStat||'str') : 0;
  const foodWaterPen  = (typeof getFoodWaterPenalty==='function') ? getFoodWaterPenalty(usedStat||'str') : 0;
  const mercBandBonus2 = (typeof getMercBandStatBonus==='function') ? getMercBandStatBonus(usedStat||'str') : 0;
  // [신규] 전투 행동(공격/방어/원거리)에 용병단이 유의미하게 기여했으면
  // 판정 보너스 숫자만이 아니라 실제 전투 로그로도 남겨, 용병단이 곁에서
  // 함께 싸우고 있다는 감각을 준다. 매 턴 나오면 지겨우니 낮은 확률로만.
  if(mercBandBonus2>0 && (_hasCombatAtk||_hasCombatDef||_hasCombatRng) && Math.random()<0.35){
    const _band = (typeof loadMercBand==='function') ? loadMercBand() : {members:[]};
    const _resident = (typeof getResidentMembers==='function') ? getResidentMembers(_band) : _band.members;
    if(_resident.length){
      const _fighter = _resident[Math.floor(Math.random()*_resident.length)];
      const _arch = (typeof MERC_ARCHETYPES!=='undefined') ? MERC_ARCHETYPES[_fighter.archetype] : null;
      if(_arch) toast(`${_fighter.name}이(가) 힘을 보탰다! (+${mercBandBonus2})`, 1800, _arch);
    }
  }
  // [CRITICAL BUG FIX] applyPassiveEffects가 호출처가 전혀 없어 습득한 모든
  // 패시브 스킬(전투중/HP위기/세레스티얼 계율 등)의 판정 보너스가 실제 행동
  // 판정에 전혀 반영되지 않던 버그. effStat 계산에 통합.
  const passiveBonus = (typeof applyPassiveEffects==='function') ? applyPassiveEffects(null, null, usedStat) : 0;
  // [버그 수정] lore/312 markOath('kept')가 "다음 판정에 +15"라는 명시적
  // 주석과 함께 S._oathBonus를 설정하는데, 어디에서도 이 값을 effStat
  // 계산에 더하지 않아 getOathBLSHint()의 AI 서사 힌트("신성한 도움이
  // 따른다")만 나가고 실제 판정에는 아무 영향이 없었다. 다른 보너스들과
  // 같은 자리에 합산한다.
  const oathBonus = S._oathBonus||0;
  const effStat = Math.max(1, statValue + survivalPenalty + partyBonus + comboBonus + statusBonus + weatherBonus + skillBonus + seasonBonus + equippedBonus2 + partyBattleInfo2.bonus + emotionBonus + lukBonus + terrainBonus + injuryBonus + overweightPen + foodWaterPen + mercBandBonus2 + passiveBonus + oathBonus);

  let diceRoll=null, isCritSuccess=false, isCritFail=false, isSuccess=true, verdictLabel='', verdictEmoji='', effectiveSuccess=true;

  if(!isCasual){
    diceRoll=Math.floor(Math.random()*100)+1;
    if(S.unlockedSkills['passive_lucky']&&!S.passiveRerollUsed&&diceRoll>=96){
      diceRoll=Math.floor(Math.random()*100)+1; S.passiveRerollUsed=true;
    }
    // [버그 수정] "다음 판정에 +15" 1회성 가호 — 실제 판정(이 블록)에 반영된
    // 직후 즉시 소진시켜, 30초 타임아웃 전에 우연히 여러 번 판정해도
    // 한 번만 적용되게 한다.
    if(oathBonus>0) S._oathBonus = 0;

    // 이중 주사위 패시브 — 2번 굴려 유리한 쪽 선택
    const isSpkCheck = usedStat==='spk';
    const isNegCheck = usedStat==='neg';
    const useLukDouble = S.unlockedSkills['passive_double_luck'];
    const useSilverTongue = isSpkCheck && S.unlockedSkills['passive_silver_tongue'];
    const useDealMaker = isNegCheck && S.unlockedSkills['passive_deal_maker'];
    if(useLukDouble || useSilverTongue || useDealMaker){
      const roll2=Math.floor(Math.random()*100)+1;
      // 낮을수록 유리 (성공 = diceRoll <= effStat)
      if(roll2 < diceRoll){ diceRoll=roll2; }
      const skillName = useSilverTongue?'은빛 혀':useDealMaker?'계약의 달인':'행운의 여신';
      toast('🎲 '+skillName+' — 유리한 주사위 선택!', 2000);
    }

    isCritSuccess=diceRoll<=Math.floor(effStat/5);
    isCritFail=diceRoll>=96;
    isSuccess=diceRoll<=effStat;
    verdictLabel=isCritSuccess?'대성공':isCritFail?'대실패':isSuccess?'성공':'실패';
    verdictEmoji=isCritSuccess?'✨':isCritFail?'💥':isSuccess?'✅':'❌';
    effectiveSuccess=isSuccess;
    if(S.unlockedSkills['passive_sixth_sense']&&!isSuccess&&!S.passiveSixthSenseUsed){
      effectiveSuccess=true; S.passiveSixthSenseUsed=true;
    }

    // ── 💛 세레스티얼 계율 단계별 판정 특수 효과 ──────────────────
    if(typeof getCelestialCovenantStatus === 'function'){
      const _cvRoll = getCelestialCovenantStatus();
      if(_cvRoll){
        const _cvStage = _cvRoll.stageDef?.stage || 0;

        // ★ +2단계 이상 (성광의 손길~): 신성 판정 이중 주사위
        if(_cvStage >= 2 && (usedStat==='fath'||usedStat==='wil'||usedStat==='mgc')){
          const _roll2 = Math.floor(Math.random()*100)+1;
          if(_roll2 < diceRoll){ diceRoll = _roll2; toast('💛 신성한 빛의 가호 — 유리한 판정 선택!', 1800); }
          isCritSuccess = diceRoll<=Math.floor(effStat/5);
          isCritFail    = diceRoll>=96;
          isSuccess     = diceRoll<=effStat;
          effectiveSuccess = isSuccess;
        }

        // ★ +3단계 이상 (심판의 눈): 대실패 방지 (96-100 → 그냥 실패)
        if(_cvStage >= 3 && isCritFail && !S._covenantCritFailShieldUsed){
          isCritFail = false;
          verdictLabel = '실패';
          verdictEmoji = '❌';
          S._covenantCritFailShieldUsed = true;
          toast('⚖️ 심판의 눈 — 대실패를 막아냈다!', 2000);
        }

        // ★ +4단계 (천상의 완성): 실패 1회 성공으로 전환 (passive_sixth_sense와 별개)
        if(_cvStage >= 4 && !isSuccess && !S._covenantDivineShieldUsed){
          effectiveSuccess = true;
          S._covenantDivineShieldUsed = true;
          toast('😇 천상의 완성 — 신성의 가호로 실패가 성공으로!', 2500);
        }

        // ★ -1단계 이하 (그늘진 신성~): 신성 판정(fath) 이중 주사위 중 불리한 쪽
        if(_cvStage <= -1 && usedStat==='fath'){
          const _roll2 = Math.floor(Math.random()*100)+1;
          if(_roll2 > diceRoll){ diceRoll = _roll2; toast('🌑 오염된 신성 — 신성 판정이 흔들린다', 1800); }
          isCritSuccess = diceRoll<=Math.floor(effStat/5);
          isCritFail    = diceRoll>=96;
          isSuccess     = diceRoll<=effStat;
          effectiveSuccess = isSuccess;
        }

        // ★ -2단계 이하 (오염된 빛~): 공격/공포 판정 이중 주사위 (유리한 쪽)
        if(_cvStage <= -2 && (usedStat==='str'||usedStat==='fear'||usedStat==='agi')){
          const _roll2 = Math.floor(Math.random()*100)+1;
          if(_roll2 < diceRoll){ diceRoll = _roll2; toast('💜 타락한 힘 — 어둠이 판정을 밀어올린다', 1800); }
          isCritSuccess = diceRoll<=Math.floor(effStat/5);
          isCritFail    = diceRoll>=96;
          isSuccess     = diceRoll<=effStat;
          effectiveSuccess = isSuccess;
        }

        // ★ -3단계 이하 (타락한 수호자~): 어둠 마법(mgc) 판정 이중 주사위
        if(_cvStage <= -3 && usedStat==='mgc'){
          const _roll2 = Math.floor(Math.random()*100)+1;
          if(_roll2 < diceRoll){ diceRoll = _roll2; toast('🌑 심연의 마력 — 어둠이 주사위를 뒤집는다', 1800); }
          isCritSuccess = diceRoll<=Math.floor(effStat/5);
          isCritFail    = diceRoll>=96;
          isSuccess     = diceRoll<=effStat;
          effectiveSuccess = isSuccess;
        }

        // ★ -4단계 (심연의 화신): 전투 판정 무조건 재롤 → 낮은 쪽 선택
        if(_cvStage <= -4 && !S._covenantAbyssRerollUsed){
          const monsters = loadMonsters()||[];
          if(monsters.some(m=>m.status==='alive')){
            const _roll2 = Math.floor(Math.random()*100)+1;
            if(_roll2 < diceRoll){ diceRoll = _roll2; }
            isCritSuccess = diceRoll<=Math.floor(effStat/5);
            isCritFail    = diceRoll>=96;
            isSuccess     = diceRoll<=effStat;
            effectiveSuccess = isSuccess;
            S._covenantAbyssRerollUsed = true;
            toast('🖤 심연의 화신 — 전투 판정 재롤!', 2000);
          }
        }

        // 매 턴 재롤 플래그 리셋 (턴 종료 시)
        if(_cvStage <= -4) S._covenantAbyssRerollUsed = false;
        verdictLabel = isCritSuccess?'대성공':isCritFail?'대실패':effectiveSuccess?'성공':'실패';
        verdictEmoji = isCritSuccess?'✨':isCritFail?'💥':effectiveSuccess?'✅':'❌';
      }
    }
  } // ── if(!isCasual) 닫기 ──────────────────────────────────────

  // 10턴마다 또는 중요 PM 이벤트(배신·비밀) 발생 시 시스템 프롬프트 갱신
  if(S.msgCount%10===0||!S.system||window._pmSystemDirty){
    S.system=window.buildLightSystem(char,loadTitles(),loadMemory(),S.npcs);
    window._pmSystemDirty=false;
  }
  const statInfo=getStatInfo(usedStat);
  const rollInfo=isCasual?null:{stat:usedStat,statName:statInfo?.name||usedStat,statIcon:statInfo?.icon||'',statValue:effStat,diceRoll,verdict:verdictLabel,verdictEmoji,isCritSuccess,isCritFail,isSuccess:effectiveSuccess,skillUsed:skillUsed?.name};

  const _GS_RULE = `

위 상황을 서사로 묘사한 후, 마지막에 반드시 다음 형식으로 행동 선택지 4가지를 추가하라(${CHOICE_DIVERSITY_HINT}. 아주 가끔, 특정 조건이 무르익었을 때만 ⑤ 비밀 선택지를 추가로 붙여도 좋다):
[선택지]①행동1②행동2③행동3④행동4[/선택지]

그 다음 줄에 반드시 아래 JSON을 출력하라. 해당 없는 키는 생략 가능하지만 해당되는 것은 빠짐없이 기록하라. 이 데이터는 게임 하드코딩을 위해 영구 보존된다:
<gs>{
  "q_done":[],
  "q_new":[],
  "q_fail":[],
  "q_fail_reason":"실패 이유",
  "q_abandon":[],
  "flags":[],
  "npc":[],
  "npc_add":[{"name":"NPC이름","role":"역할","icon":"😊","personality":"성격","speech_style":"말투","relation":"neutral","location":"장소","desc":"외모/특징","faction":"소속"}],
  "stats":{},
  "gold":0,
  "items":[{"name":"아이템명","icon":"🗡️","rarity":"common","type":"weapon","desc":"설명","effects":{"str":10}}],
  "location_visit":{"name":"장소명","type":"dungeon","icon":"🏰","desc":"설명","danger_level":1,"features":["특징1","특징2"]},
  "npc_dialogue":[{"name":"NPC이름","line":"대사 전문","emotion":"감정","context":"맥락"}],
  "skills_used":[{"name":"스킬명","type":"magic","icon":"✨","desc":"설명","mp_cost":20,"effect":"효과"}],
  "scene_tag":"전투",
  "lore_add":[{"title":"설정명","content":"내용","category":"역사"}],
  "events_add":[{"title":"사건명","desc":"설명","impact":"영향"}],
  "quest_detail":{"id":"id","title":"퀘스트명","desc":"설명","objective":"목표","reward":"보상"},
  "pm_npc":[{"name":"NPC이름","emotion":"감정","topic":"대화주제","secret":null,"promise":null,"betrayal":false,"favor":null,"grudge":null}],
  "pm_quest":[{"title":"퀘스트명","clue":"발견한단서","moment":"중요순간","choice_outcome":null,"next_hint":"다음 단계 힌트"}],
  "pm_personal":{"injury":null,"trauma":null,"achievement":null,"scar":null,"skill":null,"healed_injury":null},
  "pm_npc_relation":{"from":"NPC1","to":"NPC2","rel":20,"desc":"관계설명 (적대/동맹 등)"}
}</gs>
※ scene_tag = "전투"/"탐험"/"대화"/"이벤트"/"보스전"/"상점"/"휴식" 중 하나
※ lore_add = 이번 서사에서 밝혀진 세계관 정보(전설/역사/세력/문화 등)
※ events_add = 세계에 영향을 준 사건
※ npc_add personality/speech_style/desc 는 최대한 상세하게
※ pm_npc = 이번 씬에서 NPC가 드러낸 감정·비밀·약속·배신·호의·원한 기록 (대화 있는 NPC마다)
※ pm_quest = 이번 씬에서 발견한 퀘스트 단서·중요 순간 기록
※ pm_personal = 주인공이 이번 씬에서 부상·트라우마·성취·흉터·능력습득 시 기록 / healed_injury = 치유된 부상 텍스트 (일치하는 부상 자동 완료)
※ pm_npc_relation = 이번 씬에서 NPC끼리의 관계가 드러났을 때 기록 (씬당 1건)`;

  const diceCtx=isCasual
    ? _GS_RULE
    : (function(){
        let ctx = '\n[주사위 굴림] d100: '+diceRoll+' / '+usedStat.toUpperCase()+'('+effStat+') → '+verdictEmoji+' '+verdictLabel;
        if(skillUsed){
          const elv = getSkillEnhanceLevel(skillUsed.id);
          ctx += ' (⚡'+skillUsed.name+(elv>0?' Lv.'+elv+' 강화':'')+')';
        }
        if(survivalPenalty<0) ctx += '\n[🍖 생존 페널티 '+survivalPenalty+']';
        if(skillUsed && skillUsed.aiHint){
          const elv = getSkillEnhanceLevel(skillUsed.id);
          ctx += '\n[스킬 발동] '+skillUsed.aiHint;
          if(elv>0) ctx += ' ('+SKILL_ENHANCE_TIERS[elv-1].desc+')';
        }
        ctx += _GS_RULE;
        return ctx;
      })();

  // 엔딩 이후 이어서 플레이 컨텍스트 주입
  let finalDiceCtx = diceCtx;
  if(S._postEndingContext){
    finalDiceCtx = S._postEndingContext + '\n' + (diceCtx||'');
    S._postEndingContext = null; // 1회만 주입
  }

  // ── BLS 패치 주입 (_nextInjectedContext) ─────────────────────
  // 소환수·종교·메모리DB·봉인석·상태이상·엔딩·룬보석 등
  // 모든 시스템이 이 변수에 컨텍스트를 누적하고 여기서 한 번에 주입
  if(S._nextInjectedContext){
    finalDiceCtx = (finalDiceCtx||'') + S._nextInjectedContext;
    S._nextInjectedContext = '';
  }

  let _battleLogHpBefore=S.stats?.hp||0, _battleLogGoldBefore=S.gold||0;
  try{
    // [로컬 전투 엔진] 로컬 전투 결과 요약 메시지(isSystemNote)는 화면 표시와
    // 저장(diary/chat history)까지는 그대로 하되, AI 호출 시에는 제외한다 —
    // 이미 injectedContext로 같은 정보를 훨씬 짧게 전달하고 있으므로, 굳이
    // 전체 히스토리에 중복으로 실어 보내 토큰을 낭비할 필요가 없다.
    const _aiHistory = S.messages.filter(m=>!m.isSystemNote);
    const text=await window.callAI(_aiHistory,finalDiceCtx);

    // [20차 감사 FIX — 3탄] 서사 본문의 "HP-9" 같은 자유 텍스트 정규식
    // 파싱과, 그 아래에서 따로 실행되는 정식 <gs>{"stats":{"hp":-9}}</gs>
    // JSON 파싱(processGSBlock)이 서로 존재를 모른 채 완전히 독립적으로
    // 실행된다. AI가 같은 피해를 서사에도 적고 GS_RULE이 지시한 대로
    // JSON으로도 정직하게 보고하면(오히려 지시를 잘 따른 경우), 같은
    // 피해가 두 번 적용된다 — 실제로 재현: "HP-9" 서술 + gs.stats.hp:-9를
    // 함께 보낸 턴에서 9가 아니라 18이 깎임을 확인했다. <gs>가 이미 그
    // 필드를 보고했다면 그쪽을 유일한 정답으로 삼고, 아래 정규식 파싱은
    // <gs>가 없거나 그 필드를 언급하지 않은 경우에만 폴백으로 동작하게
    // 한다(정규식 쪽이 나중에 도입된 <gs> 이전부터 있던 구식 경로).
    let _gsPeekStats = null, _gsPeekGold;
    {
      const _gsPeekMatch = text.match(/<gs>([\s\S]*?)<\/gs>/);
      if(_gsPeekMatch){
        try{
          const _gsPeek = JSON.parse(_gsPeekMatch[1].trim());
          if(_gsPeek && typeof _gsPeek.stats === 'object') _gsPeekStats = _gsPeek.stats;
          if(_gsPeek && _gsPeek.gold !== undefined) _gsPeekGold = _gsPeek.gold;
        }catch(e){}
      }
    }

    // ── HP/MP 파싱 ──────────────────────────────────────────────
    // 적 HP 변화 문맥인지 플레이어 HP 변화 문맥인지 구분
    // 적 관련 문맥 키워드: "사내", "적", "상대", "그의", "몬스터", "그가", "그는"
    // + 이미 전투중 몬스터 이름
    const _monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
    const _enemyNames = _monsters.filter(m=>m.status==='alive').map(m=>m.name);
    const _enemyContextPat = new RegExp(
      '(사내|적|상대|그의\\s*HP|그가|그는|몬스터|적군|대상|그\\s*놈|그놈' +
      (_enemyNames.length ? '|' + _enemyNames.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|') : '') +
      ').*?HP\\s*[-–]\\s*\\d+',
      'i'
    );
    const _playerContextPat = /(칼리아|주인공|나는|내가|내\s*HP|플레이어|당신|그녀의\s*HP|그녀가\s*HP).*?HP\s*[-–]\s*\d+/i;

    // 각 HP- 패턴을 개별로 처리 (문맥 기반)
    const _hpMinusAll = [...text.matchAll(/HP\s*[-–]\s*(\d+)/gi)];
    let _playerHpDelta = 0;
    for(const _hm of _hpMinusAll){
      const _idx = _hm.index;
      // 해당 패턴 앞 30자 문맥 확인
      const _ctx = text.slice(Math.max(0,_idx-30), _idx+20);
      const _isEnemy = _enemyNames.some(n=>_ctx.includes(n)) ||
        /(사내|적|상대|그의|몬스터|그가|그는|그놈|대상)/.test(_ctx);
      if(!_isEnemy){
        _playerHpDelta += parseInt(_hm[1]);
      } else {
        // 적 HP 차감은 detectMonsterDamageFromText에서 처리
      }
    }
    const mpM=text.match(/MP\s*[-–]\s*(\d+)/i)||text.match(/마나\s*[-–]\s*(\d+)/i);
    const _gsHasHp = !!(_gsPeekStats && _gsPeekStats.hp !== undefined);
    const _gsHasMp = !!(_gsPeekStats && _gsPeekStats.mp !== undefined);
    if(_playerHpDelta > 0 && !_gsHasHp){
      S.stats.hp=Math.max(0,Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999),S.stats.hp-_playerHpDelta));
      window.updateHeader();
    }
    if(mpM && !_gsHasMp) S.stats.mp=Math.max(0,Math.min((typeof getPlayerMaxMp==='function'?getPlayerMaxMp():999),S.stats.mp-parseInt(mpM[1])));

    // HP/MP 증가 파싱
    const hpPM=(text.match(/HP\s*\+\s*(\d+)/i)||text.match(/체력\s*\+\s*(\d+)/i));
    const mpPM=(text.match(/MP\s*\+\s*(\d+)/i)||text.match(/마나\s*\+\s*(\d+)/i));
    if(hpPM && !_gsHasHp) S.stats.hp=Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999),S.stats.hp+parseInt(hpPM[1]));
    if(mpPM && !_gsHasMp) S.stats.mp=Math.min((typeof getPlayerMaxMp==='function'?getPlayerMaxMp():999),S.stats.mp+parseInt(mpPM[1]));
    // 체력/HP 한글 증감 패턴
    const hpKorM=text.match(/체력\s*[-–]\s*(\d+)/i);
    if(hpKorM && !_gsHasHp){ const _v=parseInt(hpKorM[1]); const _ctx2=text.slice(Math.max(0,text.search(/체력\s*[-–]/)-30),text.search(/체력\s*[-–]/)+20); if(!/(사내|적|상대|그의|몬스터)/.test(_ctx2)) S.stats.hp=Math.max(0,S.stats.hp-_v); }

    // [19차 감사 FIX] 아래 "HP 재생" 블록은 매 턴 무조건 실행되는데, 그중
    // "HP 30% 이하면 재생 1.5배" 보너스가 하필 방금 치명타로 HP가 0이 된
    // 바로 그 순간(=hpPct도 0이라 항상 <=0.3)에도 똑같이 적용된다. 그
    // 결과 위에서 Math.max(0, ...)로 정확히 0까지 깎인 HP가, 사망 판정
    // (triggerLoopIfDead, 아래 원래 위치)이 실행되기도 전에 재생으로 다시
    // 1 이상으로 복구되어버려 — hp<=0 조건이 다시는 참이 될 수 없었다.
    // 실제로 죽었어야 할 타격이었는지를 재생이 끼어들기 전, 지금 이
    // 시점의 HP로 먼저 판정한다(triggerLoopIfDead 내부에 중복 실행 방지
    // 가드가 있어 아래쪽의 기존 호출과 겹쳐도 안전하다).
    if (S.stats.hp <= 0 && typeof triggerLoopIfDead === 'function') triggerLoopIfDead();

    // 능력치 파싱 (STR/AGI/END/MGC/INT/LUK/PER/WIL/LDR/CHA/LUK 등 +/-)
    const STAT_PATTERNS = [
      { keys:['STR','근력','힘'], stat:'str' },
      { keys:['AGI','민첩','민첩성'], stat:'agi' },
      { keys:['END','인내','지구력'], stat:'end' },
      { keys:['MGC','마법','마력'], stat:'mgc' },
      { keys:['INT','지성','지능'], stat:'int' },
      { keys:['LUK','행운'], stat:'luk' },
      { keys:['PER','지각','인식'], stat:'per' },
      { keys:['WIL','의지'], stat:'wil' },
      { keys:['LDR','통솔','리더십'], stat:'ldr' },
      { keys:['CHA','매력'], stat:'cha' },
      { keys:['FATH','신앙'], stat:'fath' },
      { keys:['RNG','원거리'], stat:'rng' },
      { keys:['NEG','교섭','협상'], stat:'neg' },
      { keys:['DISG','위장'], stat:'disg' },
    ];
    STAT_PATTERNS.forEach(({keys, stat}) => {
      // [20차 감사 FIX — 3탄] 위 hp/mp와 같은 이유로, <gs>.stats가 이미
      // 이 스탯을 보고했다면 정규식 폴백은 건너뛴다(이중 적용 방지).
      if(_gsPeekStats && _gsPeekStats[stat] !== undefined) return;
      const keyPat = keys.join('|');
      const plusM  = text.match(new RegExp(`(?:${keyPat})\\s*\\+\\s*(\\d+)`, 'i'));
      const minusM = text.match(new RegExp(`(?:${keyPat})\\s*[-–]\\s*(\\d+)`, 'i'));
      if(plusM){
        const v = parseInt(plusM[1]);
        S.stats[stat] = Math.min(999, (S.stats[stat]||50) + v);
        toast(`📈 ${stat.toUpperCase()} +${v}`, 1800);
      }
      if(minusM){
        const v = parseInt(minusM[1]);
        S.stats[stat] = Math.max(0, (S.stats[stat]||50) - v);
        toast(`📉 ${stat.toUpperCase()} -${v}`, 1800);
      }
    });
    // 스탯 변화가 있으면 저장
    if(STAT_PATTERNS.some(({keys})=>{ const k=keys.join('|'); return new RegExp(`(?:${k})\\s*[+\\-–]\\s*\\d+`,'i').test(text); })){
      // 분리 저장: 변경된 항목만 각자 키에 저장
      saveCharacter(); saveStatsSplit(); saveChatHistory(); saveMetaState(); saveScenario();
      saveGold(S.gold); saveInventory(S.inventory||[]); saveEquipped(S.equipped||{});
      // 하위호환 compact session
      lsSet(STORAGE_KEY, JSON.stringify({character:S.character, msgCount:S.msgCount, scenario:S.scenario, _splitSaved:true}));
    }

    // 골드 파싱 — [20차 감사 FIX — 3탄] <gs>.gold가 이미 이번 턴 골드
    // 변화를 보고했다면 정규식 폴백은 건너뛴다(이중 적용 방지).
    const _gsHasGold = _gsPeekGold !== undefined;
    const goldM=text.match(/골드\s*\+\s*(\d+)/);
    if(goldM && !_gsHasGold){ const g=parseInt(goldM[1]); S.gold+=g; saveGold(S.gold); window.updateStats('totalGoldEarned',g); toast('💰 골드 +'+g,1800); unlockAchievement('first_gold'); }
    const goldMinusM=text.match(/골드\s*[-–]\s*(\d+)/);
    if(goldMinusM && !_gsHasGold){ const g=parseInt(goldMinusM[1]); S.gold=Math.max(0,S.gold-g); saveGold(S.gold); window.updateHeader(); }

    // 보스 처치 감지
    const bossState = loadBossState();
    const sid2 = S.scenario?.id||'medieval';
    const bosses = BOSS_MONSTERS[sid2]||BOSS_MONSTERS.medieval||[];
    bosses.forEach(boss=>{
      if(bossState[boss.id+'_spawned']&&!bossState[boss.id]){
        const lc2=text.toLowerCase();
        if(lc2.includes(boss.name.toLowerCase())&&(lc2.includes('쓰러')||lc2.includes('처치')||lc2.includes('죽'))){
          defeatBoss(boss.id);
        }
      }
    });

    // ── HP 재생 (장소/상황별 너프) ────────────────────────────────
    {
      const _baseRegen = Math.floor((S.stats.regen||30)/100*3);
      let _regenMult = 1.0;
      // 전투 중이면 재생 50% 감소
      if(S._inCombat) _regenMult *= 0.5;
      // 던전·고대 유적·심연 장소에서 재생 추가 감소
      const _rlType = (typeof window.currentLocation!=='undefined' && window.currentLocation?.type)||'';
      const _rlName = ((typeof window.currentLocation!=='undefined' && window.currentLocation?.name)||'').toLowerCase();
      if(_rlType==='dungeon' || /던전|지하|고대|유적|봉인|심연|마왕/.test(_rlName)){
        _regenMult *= 0.3; // 던전/위험 지역: 자연 회복 70% 차단
      }
      // HP가 30% 이하면 재생 보너스 (위기에서 버티는 맛)
      const _hpPct = (S.stats.hp||100) / (S.stats.maxHp||100);
      if(_hpPct <= 0.3) _regenMult *= 1.5;
      const _finalRegen = Math.max(0, Math.floor(_baseRegen * _regenMult));
      if(_finalRegen > 0) S.stats.hp = Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999), S.stats.hp + _finalRegen);
    }

    window.updateHeader();
    // [BUG6 FIX] HP ≤ 0이면 환생 화면으로 자동 유도
    if (typeof triggerLoopIfDead === 'function') triggerLoopIfDead();
    // 유연한 패턴: 태그 불완전/누락 시에도 ①②③ 감지
    const choiceMatch = text.match(/\[선택지\]([\s\S]*?)(?:\[\/선택지\]|$)/);
    // ①②③이 태그 밖에 직접 나타나는 경우도 감지 (태그 없는 fallback)
    const bareChoiceMatch = !choiceMatch && text.match(/[①②③④⑤][^①②③④⑤\n]{3,}(?:\n[①②③④⑤][^①②③④⑤\n]{3,}){1,}/);
    let cleanText = text;
    if(choiceMatch){
      const choiceRaw = choiceMatch[1];
      const parsed = choiceRaw.match(/[①②③④⑤]([^①②③④⑤]+)/g);
      if(parsed&&parsed.length>=2){
        S.choices = parsed.map(c=>c.replace(/^[①②③④⑤]/,'').trim()).filter(Boolean);
        cleanText = text.replace(/\[선택지\][\s\S]*?(?:\[\/선택지\]|$)/,'').trim();
      } else {
        S.choices = ['상황을 파악하며 주변을 살핀다.','가장 가까운 NPC에게 말을 건다.','조심스럽게 다음 행동을 준비한다.','좀 더 대담한 방법을 시도한다.'];
        cleanText = text.replace(/\[선택지\][\s\S]*?(?:\[\/선택지\]|$)/,'').trim();
      }
    } else if(bareChoiceMatch){
      // 태그 없이 ①②③이 직접 나온 경우
      const parsed = bareChoiceMatch[0].match(/[①②③④⑤]([^①②③④⑤]+)/g);
      if(parsed&&parsed.length>=2){
        S.choices = parsed.map(c=>c.replace(/^[①②③④⑤]/,'').trim()).filter(Boolean);
        cleanText = text.replace(bareChoiceMatch[0],'').trim();
      }
    } else {
      // [선택지] 태그가 없으면 기본 선택지 보충
      if(!S.choices || S.choices.length === 0){
        S.choices = ['상황을 파악하며 주변을 살핀다.','가장 가까운 NPC에게 말을 건다.','조심스럽게 다음 행동을 준비한다.','좀 더 대담한 방법을 시도한다.'];
      }
    }
    // 안전망: 본문에 ①②③ 잔여물이 남아있으면 제거
    cleanText = cleanText.replace(/[①②③④⑤][^\n]{3,}/g,'').replace(/\n{3,}/g,'\n\n').trim();

    // ── [서사 로그] AI 원문 전체 저장 (gs 태그 성공 여부 무관) ──────────
    // gs 태그가 빠지거나 깨져도 서사 텍스트는 반드시 기록된다
    try{
      const _nlKey = 'tf-narrative-log';
      const _nlRaw = lsGet(_nlKey);
      const _nl = _nlRaw ? JSON.parse(_nlRaw) : [];
      _nl.push({
        turn:    S.msgCount || 0,
        at:      new Date().toISOString(),
        rawText: text,           // 원문 전체 (gs 태그, 선택지 태그 포함 원본)
        userMsg: cleanMsg || '',
        scenario: S.scenario?.id || '',
        char:    S.character?.name || '',
        roll:    rollInfo ? { stat: rollInfo.stat, verdict: rollInfo.verdict, roll: rollInfo.diceRoll } : null,
      });
      lsSet(_nlKey, JSON.stringify(_nl));
    }catch(e){ /* 서사 저장 실패해도 게임 진행에 영향 없음 */ }

    // [게임 전체 학습 시스템] 직전에 시스템이 트리거한 사건(돌발 조우·보스
    // 등장·이상 현상·재앙 — S._pendingLearnBucket에 표시해둠)이 있으면,
    // 이번에 AI가 그걸 어떻게 서술했는지를 해당 상황 버킷에 학습 예시로
    // 쌓는다. 매 턴 자동으로 일어나므로 사람이 따로 손댈 게 없다.
    try{
      if(S._pendingLearnBucket && cleanText){
        recordSituationExample(S._pendingLearnBucket, cleanText.slice(0, 400), S._pendingLearnSubject||'');
      }
    }catch(e){}
    S._pendingLearnBucket = null;
    S._pendingLearnSubject = null;

    // ── <gs> 블록 파싱 (2단계: 게임 상태 JSON) ──────────
    const gsMatch = cleanText.match(/<gs>([\s\S]*?)<\/gs>/);
    let _gsSucceeded = false;
    if(gsMatch){
      cleanText = cleanText.replace(/<gs>[\s\S]*?<\/gs>/,'').trim();
      try{
        const gs = JSON.parse(gsMatch[1].trim());
        // [소울 시스템 연동] AI가 soul_action을 명시하지 않은 턴에도
        // 시스템이 서사 본문에서 키워드를 추정할 수 있도록 원문을 함께 싣는다.
        gs._narrativeText = cleanText;
        window._lastParsedGS = gs; // [BUG1 FIX] 모든 훅이 DOM textContent 재파싱 없이 이 객체를 사용
        // [CRITICAL FIX] 식별자 직접 호출 시 호이스팅 문제로 후속 래퍼(스킬사용·로맨스·세력명성·
        // 영혼무기·운명카드·장소발견·진화에너지·퀘스트완료·업적·NPC보강·골드애니메이션)가 전부 무시됨.
        // window.processGSBlock으로 호출해야 모든 체이닝된 래퍼가 실행됨.
        (window.processGSBlock || window.processGSBlock)(gs);
        _gsSucceeded = true;
        window._pmLastGsSucceeded = S.msgCount || 0;  // PM 폴백 감지 스킵용
        // [20차 감사 FIX — 2탄] AI가 데미지를 본문 "HP-N" 문구가 아니라
        // GS_RULE이 원래 지시하는 정식 경로인 <gs>{"stats":{"hp":-N}}</gs>
        // JSON으로만 보고한 턴에는, 위쪽(1974행)·재생 블록 뒤(2057행) 두
        // 사망 판정이 전부 이 processGSBlock(gs) 호출보다 먼저 실행돼버려
        // 이 경로로 들어온 치명타는 단 한 번도 사망 판정을 거치지 않았다.
        // (재생이 사망 판정을 가리던 1탄 버그와 같은 종류지만, 이쪽은
        // 재생조차 필요 없이 애초에 판정 자체가 이 경로를 안 보고
        // 있었다는 점에서 더 근본적이다.) GS 처리 직후 여기서도 확인한다.
        if (S.stats.hp <= 0 && typeof triggerLoopIfDead === 'function') triggerLoopIfDead();
      }catch(e){
        // JSON 깨진 경우 — 전투 관련 필드만 정규식으로 부분 복구 시도
        try{ if(typeof recoverPartialCombatGS==='function') recoverPartialCombatGS(gsMatch[1]); }catch(e3){}
        // 서사 텍스트로 보조 파싱 시도
        try{ fallbackParseNarrative(cleanText, text); }catch(e2){}
      }
    } else {
      // gs 태그 자체가 없는 경우 — 보조 파서로 NPC명/장소명 추출
      try{ fallbackParseNarrative(cleanText, text); }catch(e){}
    }

    // [숨겨진 장소 로컬 발견] AI가 gs로 hidden_location_found를 냈는지와
    // 무관하게, 매 턴(선택지든 타이핑이든, 실시간 AI든 Memory-Echo 캐시
    // 재생이든) 항상 로컬 조건도 함께 확인한다 — 위 참고.
    try{ checkHiddenLocationDiscoveryLocal(); }catch(e){}
    // [히든 퀘스트 로컬 진행] 마찬가지로 hidden_quest_done GS 필드와
    // 무관하게 매 턴 75개 퀘스트의 로컬 조건(직업 숙련·제작소 등급·로그
    // 횟수 등)을 확인해 조건 충족 시 즉시 활성화+완료 처리한다.
    try{ checkHiddenQuestsLocal(); }catch(e){}

    // ── 잔여 시스템 태그 추가 제거 (AI가 누출하는 경우 방지) ──
    // [선택지] 블록이 매칭 안 된 경우에도 제거
    cleanText = cleanText.replace(/\[선택지\][\s\S]*?(\[\/선택지\]|$)/,'').trim();
    // <gs> 태그 잔여 제거
    cleanText = cleanText.replace(/<gs>[\s\S]*?(<\/gs>|$)/,'').trim();
    // SVG/path 코드가 응답에 직접 포함된 경우 제거
    cleanText = cleanText.replace(/<svg[\s\S]*?<\/svg>/gi,'').trim();
    cleanText = cleanText.replace(/path\s+d="[^"]*"/g,'').trim();
    // 주사위 결과 줄이 본문 앞에 붙은 경우 제거 (예: "[주사위 굴림] d100:...")
    cleanText = cleanText.replace(/^\[주사위 굴림\][^\n]*\n?/,'').trim();
    // AI가 마크다운 코드블록으로 JSON을 직접 출력한 경우 제거
    cleanText = cleanText.replace(/```json[\s\S]*?```/g,"").trim();
    cleanText = cleanText.replace(/```[\s\S]*?```/g,"").trim();
    // AI가 <gs> 없이 순수 JSON을 평문으로 출력한 경우 제거
    // { "flags": [...], "stats": {...}, ... } 형태 패턴 감지 및 제거
    cleanText = cleanText.replace(/\{[\s\S]*?"flags"[\s\S]*?\}/g,"").trim();
    cleanText = cleanText.replace(/\{[\s\S]*?"stats"[\s\S]*?"hp"[\s\S]*?\}/g,"").trim();
    cleanText = cleanText.replace(/\{[\s\S]*?"q_done"[\s\S]*?\}/g,"").trim();
    cleanText = cleanText.replace(/\{[\s\S]*?"q_new"[\s\S]*?\}/g,"").trim();
    // 줄 단위로 순수 JSON 라인 제거 (예: "hp": 100, 같은 낱줄)
    cleanText = cleanText.split('\n').filter(function(line){
      const t = line.trim();
      // JSON 전형 패턴: "key": value 로만 구성된 줄, 또는 { [ } ] 만 있는 줄
      if(/^[{\[\]}]$/.test(t)) return false;
      if(/^"[a-z_]+"\s*:/.test(t)) return false;
      return true;
    }).join('\n').trim();

    // 하이라이트
    if(isCritSuccess||isCritFail){
      const hl=loadHighlights();
      hl.push({type:isCritSuccess?'crit_success':'crit_fail',text:cleanText.slice(0,100),turn:S.msgCount,at:new Date().toISOString()});
      saveHighlights(hl); S.highlights=hl;
      if(isCritSuccess && typeof addMemoryFragment==='function') addMemoryFragment(cleanText.slice(0,100), 'triumph');
      if(isCritSuccess && typeof recordLightningImprint==='function') recordLightningImprint('perfect_strike', S.scenario?.id);
    }

    const _newMsg = {role:'assistant',content:cleanText,characterName:char.name,rollInfo};
    S.messages.push(_newMsg);
    S.fullMessages.push(_newMsg); // 전체 기록 (이미지 포함)
    S.msgCount++;
    // [버그 수정 연계] 턴이 넘어갈 때마다 만료된 스킬 buff/debuff를
    // 되돌린다. applySkillEffect의 buff 케이스에서 등록한 큐를 소비.
    if (S._skillBuffQueue && S._skillBuffQueue.length && typeof expireSkillBuffs === 'function') {
      expireSkillBuffs();
    }
    if(S.msgCount%10===0){
      // 진화형 직업이면 자동 에너지 획득
      if(typeof isEvoJob === 'function' && isEvoJob()){
        if(typeof gainEvoEnergy === 'function') gainEvoEnergy(15, '꾸준한 성장');
      }
      // SP는 턴수로 주지 않음 — 레벨업/아이템/특수조건으로만 획득
    }

    // ── 통계 업데이트 ────────────────────────
    window.updateStats('totalTurns', 1);
    window.updateStats('maxSurvivalTurns', S.msgCount, 'max');
    window.updateStats('totalApiCalls', 1);
    if(isCritSuccess){ window.updateStats('critSuccessCount',1); unlockAchievement('crit_success'); }
    if(isCritFail)   { window.updateStats('critFailCount',1);   unlockAchievement('crit_fail'); }
    if(effectiveSuccess) unlockAchievement('first_success');
    // ── 전직 조건용 전투 카운터 ──
    const _isCombatStat = usedStat==='str' || usedStat==='end';
    const _isRangedStat = usedStat==='rng';
    if(_isCombatStat && effectiveSuccess){
      window.updateStats('battleWins', 1);
      // [20차 감사 FIX] lowHpWins가 어디에도 기록된 적이 없어, job/029의
      // berserk(광전사)·wandering_ghost(방랑 검귀)·blood_knight(혈기 기사)
      // 3개 히든 직업이 자동 감지로는 영원히 해금될 수 없었다. berserk와
      // wandering_ghost의 unlockDesc가 명시한 "HP 10% 이하에서 전투 승리"
      // 기준을 그대로 기록한다.
      const _hpPct = (S.stats.maxHp||0) > 0 ? (S.stats.hp||0)/S.stats.maxHp : 1;
      if(_hpPct <= 0.10) window.updateStats('lowHpWins', 1);
    }
    if(_isRangedStat && isCritSuccess)    window.updateStats('rangeCritCount', 1);

    // ── 모든 시스템 연동 ────────────────────
    setTimeout(()=>{ try{ updateActionPattern(cleanMsg); }catch(e){} }, 200); // 직업 행동 패턴 — 로딩 완료 후 처리
    updateJobTurns();                       // 직업 숙련도 + 전직 제안
    // 장소 방문 기록 (전직 조건용)
    if(S?.location){ const loc = typeof S.location==='string'?S.location:(S.location?.name||''); if(loc) recordLocationVisit(loc); }
    window.detectAndSetLocation(cleanText);             // 현재 위치 감지
    // 전직 조건용 장소 키워드 직접 감지 (LOCATION_DATA에 없는 장소명 포함)
    (function detectJobCondLocations(text){
      const JOB_LOC_KEYWORDS = ['암살자 길드','용의 둥지','소환의 제단','대성당','시간의 균열','이단 제단','마법사의 탑','왕국 기사단 본부','검성 도장','도적 아지트','성전','신전','지하 던전','고대 유적','드래곤 둥지'];
      JOB_LOC_KEYWORDS.forEach(kw=>{ if(text.includes(kw)) recordLocationVisit(kw); });
    })(cleanText);
  detectItemDrop(cleanText);                   // 아이템 드롭 감지
    detectStatusEffects(cleanText);              // 새 상태이상 감지 (AI 텍스트 기반)
    renderStatusBar();                      // 상태이상 바 갱신
    updateCombo(effectiveSuccess, isCritSuccess); // 콤보
    checkMainQuests();
    checkWorldEvents();                     // 세계 사건
    checkPartyLeave?.();                    // 동료 이탈 체크
    window.checkBossSpawn();                       // 보스 등장
    checkSkillCombos();                     // 스킬 조합
    checkRelicUnlock();                     // 유물 획득
    // [연결] 악당 성장 / 종말 시계 진행
    try{
      const _playerActionForVillain = /도망|후퇴|피한다/.test(cleanText||'') ? 'retreat'
        : /아무것도 하지 않|기다린다|관망/.test(cleanText||'') ? 'idle'
        : /구했다|구원|보호했|치유했/.test(cleanText||'') ? 'hero' : 'none';
      if(typeof tickVillainGrowth==='function') tickVillainGrowth(_playerActionForVillain);
      if(typeof updateGoalProgress==='function'){
        const _goalBefore = (typeof loadCycleGoal==='function') ? loadCycleGoal() : null;
        const _goalResult = updateGoalProgress(isCritSuccess?3:effectiveSuccess?2:1);
        if(_goalResult?.completed && !_goalBefore?.completed){
          toastHTML(`🎯 회차 목표 달성: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(_goalResult,{size:14}):(_goalResult.icon||"")} ${esc(_goalResult.name||'')}!`, 4000);
          if(_goalResult.statBonus && S.stats){
            Object.entries(_goalResult.statBonus).forEach(([k,v])=>{
              if(S.stats[k]!==undefined) S.stats[k]=Math.min(999,S.stats[k]+v);
            });
            if(typeof window.updateHeader==='function') window.updateHeader();
            // [환생 연계] 이번 생 한정 스탯 상승만으로는 "환생할 때 영향이 가게"라는
            // 요구를 충족하지 못한다. loadPermStatBonus/savePermStatBonus는 캐릭터
            // 생성 시(core/084) 기본 스탯에 그대로 더해지는 영구 누적 저장소이므로,
            // 여기에도 같은 보너스를 쌓아 다음 생부터 영구히 반영되게 한다.
            if(typeof loadPermStatBonus==='function' && typeof savePermStatBonus==='function'){
              const _permGoal = loadPermStatBonus();
              Object.entries(_goalResult.statBonus).forEach(([k,v])=>{
                _permGoal[k] = (_permGoal[k]||0) + v;
              });
              savePermStatBonus(_permGoal);
              toast(`✨ 영구 보너스 획득: ${Object.entries(_goalResult.statBonus).map(([k,v])=>k+'+'+v).join(', ')} (다음 생부터 적용)`, 4500);
            }
          }
        }
      }
      if(typeof witherGrudgeFlowers==='function') witherGrudgeFlowers();
      if(typeof recordStatTurn==='function') recordStatTurn();
      if(typeof checkGamblingAction==='function') checkGamblingAction(cleanText);
      if(typeof checkCircusAndCinema==='function') checkCircusAndCinema(cleanText);
      if(typeof checkPetBonding==='function') checkPetBonding(cleanText);
      if(typeof checkDejavuAndRift==='function') checkDejavuAndRift(cleanText);
      if(typeof checkActionPattern==='function') checkActionPattern(userMsg);
    }catch(e){}
    checkNpcQuests();                       // NPC 퀘스트
    checkNpcQuestCompletion(cleanText);          // NPC 퀘스트 완료 감지
    if(typeof checkNpcDlgQuestCompletion==='function') checkNpcDlgQuestCompletion(cleanText); // NPC 대화 의뢰 완료 감지
    if(typeof checkBulletinQuestCompletion==='function') checkBulletinQuestCompletion(cleanText); // 게시판 의뢰 완료 감지
    detectNpcRelationshipChange(cleanText, userMsg); // NPC 관계 변화
    checkSecretEndings();                   // 비밀 엔딩
    if(typeof checkUnificationEnding==='function') checkUnificationEnding(); // 통일 엔딩
    checkAchievements();                    // 업적 체크
    checkAdvancedAchievements();            // 고급 업적 체크
    if(typeof checkHiddenAchievements==='function') checkHiddenAchievements(); // 히든 업적 체크
    if(typeof tickEconomy==='function') tickEconomy();                         // 경제 자동 변동
    if(typeof checkAllHiddenJobsAuto==='function' && (S.msgCount||0)%10===0) checkAllHiddenJobsAuto(); // 히든 직업 자동 감지
    if(typeof _religionV2PerTurn==='function') _religionV2PerTurn(cleanText, rollInfo); // 종교 v2
    if(typeof _bloodlineV2PerTurn==='function') _bloodlineV2PerTurn(cleanText, rollInfo); // 혈통 v2
    // [13차 감사 FIX] misc/230·core/244 세 군데가 window._wandererAxisHook를
    // 차례로 감싸며 방랑자 혼돈/질서 축 처리·NPC 텍스트 감지·스탯 스냅샷
    // 기록(그래프용)·운명 분기점 감지·피로도(tickFatigue) 틱까지 5개 시스템을
    // 쌓아뒀는데, 이 훅 자체를 실제로 호출하는 곳이 어디에도 없었다 — 위
    // _bloodlineV2PerTurn·_religionV2PerTurn과 똑같은 "훅은 완성했는데 호출부를
    // 안 만든" 패턴. 매 턴 실행되는 이 지점에 연결한다.
    if(typeof window._wandererAxisHook==='function') window._wandererAxisHook(cleanText, userMsg); // 방랑자 축/스탯스냅샷/운명분기/피로도
    detectConsequences(cleanText);               // 선택 결과 추적
    // [버그 수정] 아래 둘(PM 선택 결과 반영, 복선/떡밥 자동 감지)은
    // misc/278·misc/227이 각각 window.detectConsequences를 감싸는 방식으로
    // detectConsequences 호출 직후 실행하려 했던 훅이다. 그런데
    // detectConsequences는 이 파일이 직접 import한 바인딩으로 바로 위에서
    // 호출되므로, window.detectConsequences 재할당은 절대 도달하지 못했다
    // — 다른 죽은 훅들과 동일한 원인. 실제 호출 지점 바로 뒤에 네이티브로 연결.
    try{
      const _choices = (typeof pmLoad==='function') ? pmLoad('choices') : null;
      const _majorList = _choices?.major || [];
      const _lastChoice = _majorList[_majorList.length-1];
      if(_lastChoice && !_lastChoice.consequence && cleanText){
        const _lc = cleanText.toLowerCase();
        const _posP = [/감사|도움이|호감|보상|동맹/, /정보|단서|비밀/, /승리|성공|완료/];
        const _negP = [/배신|적대|분노|원한/, /수배|체포|도망/, /실패|좌절|피해/];
        let _found = false;
        for(let i=0;i<_posP.length && !_found;i++){ if(_posP[i].test(_lc)){ _lastChoice.consequence=cleanText.slice(0,60); _lastChoice.effect='긍정'; _found=true; } }
        for(let j=0;j<_negP.length && !_found;j++){ if(_negP[j].test(_lc)){ _lastChoice.consequence=cleanText.slice(0,60); _lastChoice.effect='부정'; _found=true; } }
        if(_found && typeof pmSave==='function') pmSave('choices', _choices);
      }
    }catch(e){}
    if(typeof detectPlotHooks==='function') detectPlotHooks(cleanText);
    detectFactionChanges(cleanText);             // 파벌 변화
    // ── 세력 자율 시뮬레이션 (매 턴 갱신) ──
    {
      const factionEvents = tickFactionSimulation();
      if(factionEvents && factionEvents.length){
        showFactionNewsToast(factionEvents);
        // [신규 ⑤] 굵직한 세력 사건(전쟁/패배/어부지리)을 연대기에도 등재
        factionEvents.forEach(e=>{
          if(e.isDefeat || e.isOpportunist) recordNonPlayerChronicleEntry(e.msg, e.isDefeat?'긴장':'경이');
        });
      }
    }
    // [신규 ⑦] 세력 자체 장기 목표 진행 — 플레이어와 무관하게 진행됨
    {
      const goalEvents = (typeof tickFactionGoals==='function') ? tickFactionGoals() : [];
      if(goalEvents && goalEvents.length){
        if(typeof showFactionNewsToast==='function') showFactionNewsToast(goalEvents);
        // [신규 ⑤] 세력 목표의 성공/실패는 역사적 사건이므로 연대기에 등재
        goalEvents.forEach(e=>recordNonPlayerChronicleEntry(e.msg, e.to==='success'?'환희':'슬픔'));
      }
    }
    // [신규 ③] NPC끼리 독립적으로 사랑/갈등/죽음을 겪는 관계 시뮬레이션
    try{
      const npcBondEvents = (typeof tickNpcBonds==='function') ? tickNpcBonds() : [];
      // [신규 ⑤] NPC 간의 굵직한 사건(결혼/죽음)도 연대기 등재 후보
      if(npcBondEvents && npcBondEvents.length){
        npcBondEvents.forEach(e=>{
          if(e.type==='npc_marriage' || e.type==='npc_death') recordNonPlayerChronicleEntry(e.msg, e.type==='npc_death'?'슬픔':'환희');
        });
      }
    }catch(e){}
    // [신규 ④] 매 턴 활동 시각 갱신 — 다음 접속 시 정확한 오프라인 경과 계산용
    try{ if(typeof markActiveNow==='function') markActiveNow(); }catch(e){}
    // [버그 수정] 균열 소환수의 duration(3턴 지속)을 실제로 소진시키는
    // 로직이 어디에도 없어 영원히 활성 상태로 누적되던 문제 — 다른
    // 매 턴 tick 함수들과 같은 자리에서 호출
    try{ if(typeof tickVoidSummon==='function') tickVoidSummon(); }catch(e){}
    // [CRITICAL BUG FIX] checkTrueEndingCondition이 attemptSealRestore()
    // 안에서만 호출돼서, 진엔딩 조건(10개 봉인석+15회차+화해)이 모두
    // 갖춰진 "이후"에는 새로 복원할 봉인석이 없어 다시는 호출되지 않던
    // 버그. 그 결과 감시자 대면의 5단계 클라이맥스(stage1~stage4_5~
    // stage5)가 1단계에서 영원히 멈춰있었다. 매 턴 호출로 변경해
    // 조건 충족 후 자연스럽게 단계가 진행되도록 한다.
    try{ if(typeof checkTrueEndingCondition==='function') checkTrueEndingCondition(); }catch(e){}
    checkWorldReactions();                  // 세계 반응
    if(isCritSuccess) updateReputation(5);
    else if(effectiveSuccess) updateReputation(1);
    // 경험치 획득
    gainExpFromAction(effectiveSuccess, isCritSuccess, isCritFail);
    // 스킬 임시 부스트 제거
    if(typeof clearTempBoosts==='function') clearTempBoosts();
    // 재료 드롭 체크 (AI 텍스트에서 몬스터 등급 추론)
    const _monRarity = /전설|레전드|드래곤|타이탄|고대|신화/.test(cleanText||'') ? 'legendary'
                     : /희귀|레어|엘리트|보스|챔피언/.test(cleanText||'') ? 'rare'
                     : /고급|언커먼|강화된|특수/.test(cleanText||'') ? 'uncommon' : 'common';
    // 적 처치 감지 → 강도별 EXP 지급
    const _killDetected = /쓰러뜨|처치했|처치하|죽였|죽었|쓰러졌|격파|소탕|제거|처리했|사망했/.test(cleanText||'');
    if(_killDetected && typeof gainExpFromKill==='function'){
      gainExpFromKill(_monRarity);
    }
    // [연결] 처치 서사에서 무기 종류 감지 → 무기 숙련도 축적
    if(_killDetected && typeof incrementWeaponAffinity==='function'){
      const _weaponKwMap = {sword:['검','칼날','베었'],staff:['지팡이','마법','주문'],bow:['활','화살'],dagger:['단검','비수'],fist:['맨손','주먹']};
      for(const [wtype,kws] of Object.entries(_weaponKwMap)){
        if(kws.some(kw=>cleanText.includes(kw))){ incrementWeaponAffinity(wtype); break; }
      }
    }
    // 동적 적 이름 추출 → 동적 재료 드롭
    const _defeatedEnemy = extractDefeatedEnemyName(cleanText||'');
    if(_defeatedEnemy){
      // [연결] 계승 시스템 트리거 — 몬스터 도감/통계/원한 무기/살수 명단 기록
      try{
        if(typeof recordMonsterKill==='function') recordMonsterKill(_defeatedEnemy, _monRarity);
        if(typeof recordStatKill==='function') recordStatKill(_defeatedEnemy);
        if(typeof getBestiaryStatus==='function'){
          const _bStatus = getBestiaryStatus(_defeatedEnemy);
          if(_bStatus?.killCount>=5 && _bStatus.insight){
            S._nextInjectedContext = (S._nextInjectedContext||'')
              +`\n\n[📕 도감 통찰] ${_defeatedEnemy}은(는) 이미 ${_bStatus.killCount}번 처치한 적입니다: ${_bStatus.insight}`;
          }
        }
        if(typeof recordEvilEyeKill==='function') recordEvilEyeKill(1);
        if(typeof avengeGrudgeFlower==='function') avengeGrudgeFlower(_defeatedEnemy);
        const _isBossKillForList = /보스|두목|수장|왕|군주|전설|드래곤|타이탄|고대의/.test(cleanText||'');
        // [B67 FIX] 도전 과제 "보스 사냥꾼"(bosses_defeated)이 어디서도
        // updateChallenge()로 갱신되지 않아 보스를 아무리 처치해도 영원히
        // 미달성으로 남던 버그.
        if(_isBossKillForList && typeof updateChallenge==='function'){
          try{
            const _bkCount = (parseInt(lsGet('tf-boss-kill-count')||'0',10)||0) + 1;
            lsSet('tf-boss-kill-count', String(_bkCount));
            updateChallenge('bosses_defeated', _bkCount);
          }catch(e){}
        }
        if(_isBossKillForList && typeof addToKillList==='function') addToKillList(_defeatedEnemy, '보스', S.scenario?.id);
        if(_isBossKillForList && typeof addRoleReversal==='function') addRoleReversal(_defeatedEnemy, [], S.scenario?.id);
        if(_isBossKillForList && typeof recordWatcher==='function') recordWatcher(_defeatedEnemy, 3, S.scenario?.id);
        if(typeof recordWarScar==='function'){
          const _warKw = {siege:['공성','포위'],plague_war:['역병','전염병'],revolution:['혁명','반란'],naval_battle:['해전','함대'],border_war:['국경 전쟁','변경 전투'],dragon_war:['용과의 전쟁','드래곤 전쟁']};
          for(const [wtype,kws] of Object.entries(_warKw)){
            if(kws.some(kw=>cleanText.includes(kw))){ recordWarScar(wtype, S.scenario?.id); break; }
          }
        }
      }catch(e){}
      rollDynamicMaterialDrop(_defeatedEnemy, _monRarity);
      // [신규] 처치된 몬스터를 현재 장소의 몬스터 풀에 등록한다 —
      // 이후 이 장소에서 checkRandomEncounter(시스템 인카운터)와
      // shouldGenerateNewMonster(AI 서술 재사용 유도) 양쪽 모두에서
      // 이 몬스터가 재사용 대상이 된다. 풀이 커질수록(최대 8종)
      // 신규 생성 확률이 1/(N+1)로 자연히 낮아진다.
      try{
        const _curLocForPool = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
        const _curLocNameForPool = _curLocForPool ? (_curLocForPool.name||'') : '';
        if(_curLocNameForPool && typeof registerLocationMonster==='function'){
          registerLocationMonster(_curLocNameForPool, _defeatedEnemy);
        }
      }catch(e){}
    } else if(_killDetected) {
      rollMaterialDrop(_monRarity);
    }
    // 전투 처치 → 아이템 드롭 (rollDynamicLoot)
    // [수정] 몬스터→재료→아이템 순서 강제를 위해 처치된 몬스터 이름을
    // 그대로 전달한다. 없으면(이름 추출 실패) null — 이 경우 아이템은
    // 특정 몬스터에 종속되지 않는 일반 드롭으로 처리된다.
    if(_killDetected && typeof rollDynamicLoot === 'function'){
      const _isBossKill = /보스|두목|수장|왕|군주|전설|드래곤|타이탄|고대의/.test(cleanText||'');
      rollDynamicLoot(cleanText.slice(0,150), _isBossKill, _defeatedEnemy||null).then(drops=>{
        if(!drops || !drops.length) return;
        drops.forEach(item=>{
          if(!item) return;
          item.id = item.id || ('drop_'+Date.now()+'_'+Math.random().toString(36).slice(2,5));
          S.inventory = S.inventory || [];
          S.inventory.push(item);
          saveInventory(S.inventory);
          toast(`${item.name} 드롭! (${item.rarity})`, 2800, item);
        });
      }).catch(()=>{});
    }
    // ── 탈출 패널티: 도망 실패 시 HP 손실 + 아이템 드롭 ──────────
    // [20차 감사 FIX — 4탄] 이 페널티는 도망 실패 자체만으로는 죽지
    // 않도록 일부러 최저 1로 바닥을 깐 것인데, 같은 턴에 이미 다른
    // 경로(서사/GS)로 치명타를 맞아 hp가 정확히 0까지 떨어지고
    // 사망판정까지 이미 끝난 뒤라면, 이 코드가 무조건 실행되면서
    // "죽은 채 그대로 두어야 할" hp를 다시 1로 되살려버린다 —
    // 1·2탄과 완전히 같은 유형(재생/후처리가 이미 확정된 사망을
    // 가리는 문제)이라 같은 방식으로 막는다: 이미 죽은 상태(hp<=0)면
    // 이 페널티 자체를 건너뛴다.
    const _fleeAttempt = /도망|탈출|후퇴|물러|달아|피했/.test(userMsg||'');
    const _fleeFailed  = _fleeAttempt && !effectiveSuccess && S.stats.hp > 0;
    if(_fleeFailed){
      // HP 10~20% 손실
      const _fleeDmg = Math.max(5, Math.floor((S.stats.hp||100) * 0.15));
      S.stats.hp = Math.max(1, (S.stats.hp||100) - _fleeDmg);
      toast(`💨 도망 실패! HP -${_fleeDmg}`, 2000);
      // 10% 확률로 아이템 1개 드롭
      if(Math.random() < 0.10 && (S.inventory||[]).length > 0){
        const dropIdx = Math.floor(Math.random() * S.inventory.length);
        const dropped = S.inventory.splice(dropIdx, 1)[0];
        saveInventory(S.inventory);
        toastHTML(`📦 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(dropped,{size:14}):(dropped.icon||"📦")} ${esc(dropped.name)} 을(를) 떨어뜨렸다!`, 2500);
      }
    }

    // 이벤트 설계도 드롭 체크
    if(/이벤트|보물|상자|유물|발견|발굴|탐색/.test(cleanText||'')) rollEventBlueprint();
    // 랜덤 이벤트 체크 (현재 서술 내용 기반으로 상황에 안 맞는 이벤트 차단)
    checkRandomEvents(cleanText);
    // 일기 감지
    detectDiaryMoment(cleanText);
    // 서술 반복 방지 기록
    if(typeof recordNarration==='function') recordNarration(cleanText);
    // 에픽퀘스트: AI 텍스트 기반 목표 감지
    if(typeof checkEpicQuests==='function') checkEpicQuests(cleanText);
    if(typeof checkDreamEvent==='function') checkDreamEvent();
    if(typeof detectWeatherChange==='function') detectWeatherChange(cleanText);
    // 보스 피해 감지
    if(typeof detectBossDamage==='function') detectBossDamage(cleanText);
    // [개선] 전투 상태 판단 — 3단계 우선순위로 재구성.
    // 1순위: AI가 combat_state를 명시적으로 출력했다면 그게 이미
    //        processGSToAllDBs()에서 S._inCombat에 반영됐으므로 건너뜀.
    // 2순위: 학습된 패턴 데이터(predictCombatStateFromLearning)로 예측.
    // 3순위: 그래도 안 되면 기존 텍스트 키워드 추측(최후의 보강 수단).
    const _gsHasCombatState = window._lastParsedGS && typeof window._lastParsedGS.combat_state === 'string';
    if(!_gsHasCombatState){
      const _learned = (typeof predictCombatStateFromLearning==='function') ? predictCombatStateFromLearning(userMsg||'') : null;
      if(_learned === 'start' || _learned === 'ongoing') S._inCombat = true;
      else if(_learned === 'end' || _learned === 'none') S._inCombat = false;
      else if(/전투|싸움|공격|방어|베었|강타|쓰러뜨|적이/.test(cleanText||'')) S._inCombat=true;
      else if(/평화|휴식|대화|마을|상점|도착/.test(cleanText||'')) S._inCombat=false;
    }
    // 보스 HP 바 갱신
    if(typeof renderBossHpBar==='function') renderBossHpBar();
    // NPC 특수 이벤트 체크
    if(typeof checkNpcSpecialEvents==='function') checkNpcSpecialEvents();
    // 😈 악마족 타락 감지
    if(typeof window.detectDemonSinFromText==='function') window.detectDemonSinFromText(cleanText);
    // [CRITICAL BUG FIX] detectLocation이 호출처가 전혀 없어 "3곳/8곳 탐험" 업적이
    // 영원히 달성 불가능했고, 탐험 진행도 BLS도 항상 0으로 표시되던 버그.
    // loadLocations()를 의존하는 17곳의 코드가 전부 빈 데이터만 읽고 있었음.
    if(typeof detectLocation==='function') detectLocation(cleanText);
    if(typeof detectUndeadActionFromText==='function') detectUndeadActionFromText(cleanText);
    // 🐾 수인족 야생의 법칙 감지
    if(typeof window.detectBeastWildlawFromText==='function') window.detectBeastWildlawFromText(cleanText);
    // 🔨 드워프족 장인 행동 감지
    if(typeof window.detectDwarfCraftFromText==='function') window.detectDwarfCraftFromText(cleanText);
    // 😤 오크족 업보 행동 감지
    if(typeof window.detectOrcHonorFromText==='function') window.detectOrcHonorFromText(cleanText);
    // 🕶️ 용병단 악명 로컬 감지 (AI GS 필드 없이도 동작)
    if(typeof detectMercNotorietyFromText==='function') detectMercNotorietyFromText(cleanText);
    // 🌟 인간족 각성 감지
    if(typeof window.detectHumanDeedFromText==='function') window.detectHumanDeedFromText(cleanText);
    // 🧝 엘프족 기억 감지
    if(typeof window.detectElfMemoryFromText==='function') window.detectElfMemoryFromText(cleanText);
    // [버그 수정] 🧝 엘프족 망각 감지 — elfSealMemory(수동 UI 액션)와
    // detectElfForgettingFromText(AI 서사 자동 감지) 둘 다 완성돼 있었지만
    // 이 텍스트 감지 디스패처 어디에도 연결돼 있지 않아, 망각 스택 시스템
    // 전체가 한 번도 실행된 적이 없었다. 같은 종족 감지기들과 동일한
    // 자리에 연결한다.
    if(typeof window.detectElfForgettingFromText==='function') window.detectElfForgettingFromText(cleanText);
    // 💛 세레스티얼 신성 천평 감지
    if(typeof detectCelestialScaleFromText==='function') detectCelestialScaleFromText(cleanText);
    // 💛 세레스티얼 신성 계율 감지
    if(typeof detectCelestialCovenantFromText==='function') detectCelestialCovenantFromText(cleanText);
    // 🌑 다크링 공허 감지
    if(typeof detectDarklingVoidFromText==='function') detectDarklingVoidFromText(cleanText);
    // 💀 다크링 죽음의 메아리 감지
    if(typeof detectDeathEchoFromText==='function') detectDeathEchoFromText(cleanText);
    // 😈 조우한 적 자동 NPC 등록 (타락 시전 대상 확보)
    if(typeof window.autoDetectAndRegisterEnemy==='function') window.autoDetectAndRegisterEnemy(cleanText);
    // [신규] 플레이어 행동에서 나온 "나중에 돌아올 것 같은" 떡밥을 매 턴
    // 즉시 감지한다. 패턴이 막연해서 오탐 가능성이 있으므로, 잡아낸 문장
    // 자체를 그대로 기록할 뿐 의미를 단정하지 않는다 — AI가 나중에 구간
    // 요약에서 이 떡밥의 해결 여부를 판단할 때 참고할 "원문 단서"로 쓰인다.
    if(typeof detectImmediateNarrativeHook==='function') detectImmediateNarrativeHook(cleanText, userMsg);
    // [신규] 세계관 사실 일관성 가벼운 검증 — 죽은 NPC가 살아있는 듯
    // 묘사되는 명백한 모순만 보수적으로 감지해 경고
    if(typeof checkWorldConsistency==='function') checkWorldConsistency(cleanText);
    // [신규] 선택의 장기 파급력 — 25~200턴 전의 무거운 선택 중 아직
    // 환기되지 않은 게 있으면 자연스럽게 되돌아올 수 있다는 힌트 주입
    if(typeof getLongTermChoiceEcho==='function'){
      const echoCtx = getLongTermChoiceEcho();
      if(echoCtx) S._nextInjectedContext = (S._nextInjectedContext||'') + echoCtx;
    }
    // [신규] 세력 고유 비밀 발견 기회 — 충분히 얽힌 세력의 lore 비밀을
    // 가끔 단서로 흘려 플레이어가 추적할 수 있게 한다
    if(typeof checkFactionSecretTrigger==='function'){
      const secretCtx = checkFactionSecretTrigger();
      if(secretCtx) S._nextInjectedContext = (S._nextInjectedContext||'') + secretCtx;
    }
    // [신규] 기존 NPC가 적대로 전환되는 상황의 보조 감지 — AI가
    // npc_turns_hostile GS를 빠뜨렸을 때를 위한 안전망. 누적된 패턴
    // 데이터(tf-hostile-pattern-log)가 쌓일수록 정확도가 높아진다.
    try{
      if(typeof detectExistingNpcTurnsHostile==='function'){
        const hostileFound = detectExistingNpcTurnsHostile(cleanText);
        if(hostileFound.length){
          processNpcTurnsHostileGS({ npc_turns_hostile: hostileFound.map(name=>({name, reason:'보조 감지(텍스트 패턴 학습)'})) });
        }
      }
    }catch(e){}
    // 장비 내구도 소모
    if(typeof tickEquipDurability==='function') tickEquipDurability();
    // ── 전투 시스템 확장 훅 ───────────────────────────────────────
    if(typeof processCombatSystems==='function') processCombatSystems(cleanText, userMsg, effectiveSuccess, isCritSuccess, isCritFail);
    // 직업 숙련도 → 스킬 해금
    if(typeof checkJobMasterySkillUnlock==='function') checkJobMasterySkillUnlock();
    // 감정 감지
    if(typeof detectEmotion==='function') detectEmotion(cleanText);
    if(typeof updateEmotionDisplay==='function') updateEmotionDisplay();
    // 자동 저장
    if(typeof autoSave==='function') autoSave();
    // 퀘스트 배지 갱신
    if(typeof updateQuestBadge==='function') updateQuestBadge();
    if(typeof updateMenuVisibility==='function') updateMenuVisibility();
    // 영지 해금 조건 감지
    if(typeof checkDemesneUnlockTrigger==='function') setTimeout(checkDemesneUnlockTrigger, 800);
    // 시간 흐름 (행동 유형별 시간 소모)
    if(typeof tickGameTime==='function') tickGameTime();
    if(typeof advanceTimeByAction==='function'){
      try{ advanceTimeByAction(userMsg||'', cleanText||''); }catch(e){}
    }
    if(typeof tickAcademy==='function') tickAcademy();        // 학교 진행
    if(typeof checkArrestCondition==='function') checkArrestCondition(); // 체포 조건
    if(typeof tickJailSentence==='function') tickJailSentence(); // 형기 자동 감소/석방
    if(typeof updateBountyFromInfamy==='function') updateBountyFromInfamy(); // 현상금 갱신
    if(typeof checkBountyHunterEncounter==='function') checkBountyHunterEncounter(); // 현상금 사냥꾼 등장
    window.renderWeatherWidget(); window.syncAutoAtmosphere(); // 날씨 위젯 갱신 + 자동 날씨 동기화
    // 명성 전파 (대성공 시)
    if(isCritSuccess && typeof propagateFame==='function') propagateFame('대성공 행동', 3);
    // 보스 단계 컨텍스트
    const bossCtx = (typeof updateBossPhase==='function') ? updateBossPhase() : null;
    if(bossCtx) S._bossPhaseCtx = bossCtx;
    // 새 장소 발견 기록
    if(window.currentLocation?.id) discoverLocation(window.currentLocation.id, window.currentLocation.name||window.currentLocation.id);
    // 이벤트 컨텍스트 주입 (다음 턴에 반영)
    if(S._lastEventResult){ S._nextInjectedContext = (S._nextInjectedContext||'')+' '+S._lastEventResult; S._lastEventResult=null; }
    // 진화 조건 알림
    if(S.character && !loadEvolution()[S.character.race] && typeof checkEvolutionCondition==='function' && checkEvolutionCondition(S.character.race)){
      toast('🌟 종족 진화 가능! [진화] 버튼을 눌러보세요!', 4000);
    }

    window.renderChoices();
    renderMsgs();
    // [20차 감사 FIX — 7탄] 이 자리에 있던 window._wandererAxisHook(cleanText,
    // userMsg) 재호출을 제거한다 — 이 훅은 2341행 부근("13차 감사 FIX" 주석
    // 참고)에서 이미 이번 턴에 한 번 호출됐다. cleanText/userMsg는 두 호출
    // 시점 사이에 재할당되지 않아 완전히 동일한 값이었고, 헤드리스 검증 결과
    // 실제로 매 턴 이 훅의 체인 전체(tickFoodWater·tickWorldTimer·
    // tickNearDeathPenalty·tickSkillCooldowns·tickMercBand·tickCaravan·
    // tickFarm·방랑자 혼돈/질서 축 처리 등)가 정확히 2번씩 실행되고 있었다
    // — 예: 평상시 턴에 식량이 3이 아니라 6, 물이 4가 아니라 8씩 깎이는 것을
    // 확인(굶주림/갈증 HP 페널티도 동일 배율로 이중 발생). 둠 클락 진행,
    // 스킬 쿨다운 감소, 빈사 카운터 증가도 전부 같은 이유로 두 배 속도였다.
    // ── HP 0 → 게임오버 ──────────────────────────────────────────
    window.updateHeader(); // 최신 HP 반영 보장
    // [20차 감사 FIX — 5탄] 이 파일 위쪽에서 이번 턴에 이미 세 곳
    // (1974/2057/2145행 부근)에서 사망 시 triggerLoopIfDead()(회차 루프
    // 시스템, progression/220)를 호출하고 있는데, 그쪽이 사망을 실제로
    // 처리 중이면(불사 패시브 대신 "죽음과의 거래" 모달을 띄워 플레이어
    // 응답을 기다리고 있거나, 거래 없이 곧장 환생 처리를 끝냈으면) 아래의
    // 완전히 별개인 구식 game-over 오버레이(#go-overlay)를 또 띄워서 두
    // 화면이 동시에 겹쳐 보이는 버그가 있었다 — 헤드리스로 재현:
    // .death-deal-modal과 #go-overlay가 실제로 동시에 열림을 확인. 이번
    // 세션에서 사망판정이 아예 실행 안 되던 버그 3건을 고치면서
    // triggerLoopIfDead가 이제서야 매 사망마다 안정적으로 실행되기
    // 시작해, 이전엔 드물게만 겹치던(triggerLoopIfDead가 거의 발동 안
    // 했으므로) 이 충돌이 이제 사실상 매번 드러나게 됐다. 회차 루프
    // 시스템이 이미 처리 중(모달 표시 또는 처리 완료)이면 구식
    // game-over는 건너뛴다.
    const _loopDeathHandling = !!document.querySelector('.death-deal-modal') || !!window._loopDeathTriggered;
    if((S.stats.hp||0)<=0 && !_loopDeathHandling){
      // [신규] 경비병 조우 중에 HP가 0이 됐다면, AI가 arrest_outcome을
      // 빠뜨렸어도 시스템이 안전하게 "사망"이 아니라 "체포"로 처리한다
      // — 경비병에게 제압당해 죽는 것은 부자연스럽고, 체포 시스템의
      // 의도(잡혀서 감옥에 가는 것)와도 맞지 않는다.
      if(S._guardEncounterActive && typeof executeArrest==='function'){
        S.stats.hp = 1; // 죽지 않고 제압당한 것으로 처리
        window.updateHeader();
        executeArrest({ surrendered:false });
        renderMsgs();
        return;
      } else {
      S.stats.hp = 0;
      window.updateHeader();
      if(typeof handleDeath==='function') handleDeath();
      // [19차 감사 FIX] handleDeath는 이 이름으로 정의된 함수가 코드베이스
      // 어디에도 없어(다른 곳의 typeof 방어 호출도 마찬가지) 항상 아무
      // 일도 하지 않는 죽은 호출이었다. progression/236의 saveLastLifeMemory()
      // (마지막 장면/행동을 저장해 다음 회차 초반에 "전생의 기억" 데자뷔
      // 서사로 되살리는 기능, callAI 훅에는 이미 정상 연결돼 있었음)는
      // 바로 이 handleDeath 훅에만 의존하고 있어 저장이 한 번도 실행된
      // 적이 없었다. 진짜 사망 처리 지점인 여기서 직접 호출한다.
      if(typeof saveLastLifeMemory==='function') saveLastLifeMemory();
      if(typeof _addTimelineOnDeath==='function') _addTimelineOnDeath();
      window.updateStats('deathCount',1); unlockAchievement('death');
      window.updateStats('totalPlayMs', Date.now()-window.playStartTime);
      window.updateStats('maxSurvivalTurns', S.msgCount, 'max');
      if(typeof recordPlayerDeathCause==='function'){
        // 마지막 AI 응답에서 사인 추출
        const _deathText = cleanText.slice(0,200);
        recordPlayerDeathCause('전투 중 사망', '', _deathText);
      }
      S.choices=[]; window.renderChoices(); S.loading=false; window.renderThinking(); updateSendBtn();
      showGameOver({type:'death'});
      return;
      }
    }

    // 미배분 스탯 포인트 있으면 버튼 강조
    const pendingPts = loadStatPoints();
    const btnSA = document.getElementById('btn-statalloc');
    if(btnSA) btnSA.style.color = pendingPts > 0 ? '#80c040' : '';
    // 전투 로그 기록
    if(diceRoll!==null){
      const battleResult = { result: isCritSuccess?'crit_success':effectiveSuccess?'success':isCritFail?'crit_fail':'fail',
        stat:usedStat||'', roll:diceRoll, effStat:effStat||0,
        hpChange:Math.round((S.stats.hp||0)-_battleLogHpBefore),
        goldChange:Math.round((S.gold||0)-_battleLogGoldBefore),
        skill:skillUsed?.name||null };
      // 전투 결과 팝업
      if(typeof showBattleResultSummary==='function') showBattleResultSummary(battleResult);
      if(typeof addBattleLogEntry==='function') addBattleLogEntry({
        result: battleResult.result,
        stat: usedStat||'',
        roll: diceRoll,
        effStat: effStat||0,
        hpChange: Math.round((S.stats.hp||0)-_battleLogHpBefore),
        goldChange: Math.round((S.gold||0)-_battleLogGoldBefore),
        skill: skillUsed?.name||null,
        summary: text.slice(0,50),
      });
    }
    // ── 데이터 수집 (1단계) ──
    if(typeof collectSceneData==='function') collectSceneData(cleanText, S.choices, userMsg, rollInfo);
    // 전투 결과 배틀로그 기록
    if(rollInfo && typeof addBattleLogEntry==='function'){
      addBattleLogEntry({
        action:    (userMsg||'').slice(0,60),
        result:    rollInfo.crit?'crit':rollInfo.critFail?'critFail':rollInfo.success?'success':'fail',
        roll:      rollInfo.dice||0,
        hpChange:  Math.round((S.stats?.hp||0) - (_battleLogHpBefore||0)),
        goldChange:Math.round((S.gold||0) - (_battleLogGoldBefore||0)),
      });
    }
    // 전투 타임라인
    if(rollInfo && rollInfo.crit && typeof addTimelineEvent==='function'){
      addTimelineEvent('battle', `대성공! ${(userMsg||'').slice(0,30)}`, {icon:'🌟'});
    }
    // ── AI 동적 퀘스트: 완료/실패 감지 ──
    checkDynQuestCompletion(cleanText);
    // [신규] 랜덤 인카운터 — 이동/탐험성 입력일 때만 낮은 확률로 발동
    // [버그 수정] misc/328의 hookEncounterForDelayedCombat는 window.
    // checkRandomEncounter를 감싸는 방식이었지만, checkRandomEncounter가
    // 바로 이 파일에 로컬 선언돼 있고 위 호출도 bare 식별자라 그 감싸기가
    // 절대 적용되지 못했다(다른 죽은 훅들과 동일한 원인). 몬스터 조우 직후
    // 다음 턴 자동 전투 예약 로직을 호출 지점에 바로 네이티브로 연결.
    try{
      if(typeof checkRandomEncounter==='function'){
        const _beforeMonCount = (typeof loadMonsters==='function' ? (loadMonsters()||[]).length : 0);
        checkRandomEncounter(userMsg);
        const _afterMonCount = (typeof loadMonsters==='function' ? (loadMonsters()||[]).length : 0);
        if(_afterMonCount > _beforeMonCount && typeof scheduleLocalCombatStart==='function') scheduleLocalCombatStart();
      }
    }catch(e){}
    // [버그 수정] 인적 조우(tryHumanEncounter)·제3자 충돌 목격
    // (tryWitnessEncounter)도 items/218이 같은 원인(window.
    // checkRandomEncounter 감싸기가 bare 호출에 도달 못 함)으로 죽어있던
    // 훅이다. checkRandomEncounter 호출 지점에 네이티브로 연결.
    try{
      if(userMsg && typeof window.AMBUSH_INTENT_RE!=='undefined'){
        const _isActiveEnc = window.AMBUSH_INTENT_RE.test(userMsg);
        const _movementRe = /가다|걸어가다|향하다|떠나다|이동한다|간다|탐험|살피다|조사하다|뒤지다|관찰하다|살펴본다|길을 나서|발걸음/;
        if(_isActiveEnc || _movementRe.test(userMsg)){
          if(typeof tryHumanEncounter==='function') tryHumanEncounter(_isActiveEnc);
          if(typeof tryWitnessEncounter==='function') tryWitnessEncounter(_isActiveEnc);
        }
      }
    }catch(e){}
    // [신규] 몬스터 컨셉 생성 — 이동/탐험 의도일 때만, 낮은 확률로 실제
    // 새 몬스터를 만들어 이 장소 풀에 등록한다(다음 인카운터부터 등장 가능).
    // 비동기라 이번 턴 응답을 막지 않으며, shouldGenerateNewMonster가 풀
    // 크기에 따라 한 번 더 확률을 조절하므로 여기서는 가볍게만 걸러낸다.
    try{
      if(/가다|걸어가다|향하다|떠나다|이동한다|간다|탐험|살피다|조사하다|뒤지다|관찰하다|살펴본다|길을 나서|발걸음/.test(userMsg||'')
        && Math.random() < 0.25 && typeof generateAIMonsterConcept==='function'){
        generateAIMonsterConcept();
      }
    }catch(e){}
    // [BUG21 FIX] checkQuestCompletion을 sendMsg 완료 후 올바른 위치에서 호출
    try { if(typeof checkQuestCompletion==='function') checkQuestCompletion(); } catch(e2) {}
    // [BUG17 FIX] autoSummarize도 sendMsg 완료 후 호출
    setTimeout(() => { try { if(typeof autoSummarize==='function') autoSummarize(); } catch(e2) {} }, 100);
    // ── AI 동적 퀘스트: 자동 생성 트리거 ──
    if(shouldAutoGenerateQuest()) enqueueAITask(()=>generateAIQuest(true), '퀘스트 자동 생성');

    // dirty flag 기반 분리 저장 — 변경된 항목만 저장
      _markDirty('chat'); // 매 턴 채팅은 항상 갱신
      saveCharacter(); saveStatsSplit(); saveChatHistory(); saveMetaState(); saveScenario();
      if(_dirty.gold||true) saveGold(S.gold);
      if(_dirty.inventory||true) saveInventory(S.inventory||[]);
      saveEquipped(S.equipped||{});
      _clearDirty();
      lsSet(STORAGE_KEY, JSON.stringify({character:S.character, msgCount:S.msgCount, scenario:S.scenario, _splitSaved:true}));
    if(S.msgCount%10===0){
      toast('💾 저장됨', 1200);
      enqueueAITask(()=>summarizeIfNeeded(), '대화 요약');
    }
    // fullMessages 활용: 20턴마다 전체 히스토리 기반 core 기억 갱신
    if(S.msgCount%20===0 && S.msgCount>0){
      enqueueAITask(()=>buildCoreMemoryFromFull(), 'fullMessages 기억 구축');
    }
    // PM 기반 중간 요약: 30턴마다 PM 데이터 → core 자동 갱신
    if(S.msgCount%30===0 && S.msgCount>0){
      enqueueAITask(()=>{ try{ return pmAutoSummarize(); }catch(e){} }, 'PM 요약');
    }
    // genChoices 제거 - AI 응답에 포함됨
  }catch(e){
    toast('⚠️ AI 오류: '+e.message);
    S.lastFailedMsg = userMsg; S.lastFailedIsChoice = isChoice;
    S.messages.push({role:'assistant',content:'[오류] '+e.message+'\n\n__RETRY__',characterName:char.name,rollInfo});
    renderMsgs();
  }
  S.loading=false; window.renderThinking(); updateSendBtn(); renderMsgs();
  // [버그 수정] 아래 후처리들(고향 NPC 재회 감지, NPC 상호작용/소문 시스템,
  // NPC 대화 주제 캐싱)은 misc/292·misc/293이 한때 window.renderMsgs를 감싸는
  // 방식으로 매턴 자동 실행하려 했던 훅이었다. 그런데 sendMsg()가 renderMsgs를
  // 같은 파일 안에서 직접 호출하다 보니 그 래핑을 항상 건너뛰어(다른 죽은
  // 훅들과 동일한 원인) 실제로는 한 번도 실행된 적이 없었다. quest/086이
  // 저 함수들을 import하면 misc/293(quest/086을 이미 import 중)과 순환
  // 참조가 생기므로, 이 코드베이스 다른 곳에서도 흔히 쓰는 "typeof 확인 후
  // 전역 window.X로 폴백 호출" 방식으로 안전하게 실제 호출 지점에 연결한다.
  try{
    const _lastAiMsg = S.messages[S.messages.length-1];
    const _lastUserMsg = [...S.messages].reverse().find(m=>m.role==='user');
    if(_lastAiMsg?.role==='assistant' && _lastAiMsg.content && _lastUserMsg?.content && !_lastAiMsg._postRenderChecked){
      _lastAiMsg._postRenderChecked = true;
      if(typeof checkHomelandNpcReunion==='function') checkHomelandNpcReunion(_lastAiMsg.content);
      if(typeof detectNpcInteractionFromText==='function') detectNpcInteractionFromText(_lastAiMsg.content, _lastUserMsg.content);
      if(typeof updateRumorSystem==='function') updateRumorSystem(_lastUserMsg.content, _lastAiMsg.content);
      // [버그 수정] 파벌 게이지 감지(detectFactionGaugeFromText)도 race/260이
      // window.sendMsg를 감싸던 같은 원인으로 죽어있던 훅이다.
      if(typeof detectFactionGaugeFromText==='function') detectFactionGaugeFromText(_lastAiMsg.content);
      // [버그 수정] 인과 감지·마일스톤 체크도 misc/261이 window.sendMsg를
      // 감싸던 같은 원인으로 죽어있던 훅이다.
      if(typeof detectCausalFromText==='function') detectCausalFromText(_lastAiMsg.content, _lastUserMsg.content);
      if(typeof checkMilestones==='function') checkMilestones();
      // [버그 수정] 전투 키워드 자동 경험치·종교 특수 이벤트·임무 귀환
      // 체크도 ai-prompt/153이 window.sendMsg를 감싸던 같은 원인으로
      // 죽어있던 훅이다.
      if(typeof giveSummonBattleExp==='function'){
        const _killKw=['처치했','쓰러뜨렸','쓰러졌','소멸했','격파했','물리쳤'];
        const _bossKw=['보스','두목','군주','마왕'];
        if(_killKw.some(k=>_lastAiMsg.content.includes(k))) giveSummonBattleExp(_bossKw.some(k=>_lastAiMsg.content.includes(k))?3:2);
      }
      if(typeof triggerReligionEvent==='function' && (_lastAiMsg.content.includes('신성 모독')||_lastAiMsg.content.includes('순교'))) triggerReligionEvent('special','central');
      if(typeof checkMissionReturns==='function') checkMissionReturns();
      // [버그 수정] 환경 생존 키워드 자동 감지도 core/162가 window.sendMsg를
      // 감싸던 같은 원인으로 죽어있던 훅이다.
      if(typeof enterSurvivalEnv==='function' && typeof loadSurvivalState==='function' && !loadSurvivalState()){
        const _envMap = { '사막':'desert','해상':'ocean','극지':'arctic','화산':'volcanic','심해':'deep_sea' };
        Object.entries(_envMap).forEach(([kw,envId])=>{
          if(_lastAiMsg.content.includes(kw) && ((_lastAiMsg.content.includes('진입')&&_lastAiMsg.content.includes('위험'))||_lastAiMsg.content.includes('생존'))) enterSurvivalEnv(envId);
        });
      }
      if(typeof cacheNpcTopicResponse==='function'){
        const _npcsForCache = (typeof loadNPCs==='function' ? loadNPCs()||[] : []);
        for(let _ni=0; _ni<Math.min(_npcsForCache.length,5); _ni++){
          const _npcForCache = _npcsForCache[_ni];
          if(_npcForCache.name && (_lastAiMsg.content.includes(_npcForCache.name)||_lastUserMsg.content.includes(_npcForCache.name))){
            cacheNpcTopicResponse(_npcForCache.name, _lastUserMsg.content.slice(0,30).toLowerCase().trim(), _lastAiMsg.content.slice(0,100));
            break;
          }
        }
      }
      // [버그 수정] 아래 개인기억(PM) 텍스트 감지 파이프라인 전체는
      // misc/278이 window.sendMsg를 감싸던 같은 원인으로 죽어있던 훅이다.
      // 원래 있던 "gs 파싱이 이미 성공했으면 건너뛴다" 게이트는 그런 gs
      // 기반 PM 처리 경로가 실제로는 코드베이스 어디에도 없어(확인됨)
      // 근거 없는 조건이었으므로 제거하고 매 턴 항상 실행한다.
      if(typeof pmDetectNpcFromText==='function') pmDetectNpcFromText(_lastAiMsg.content, _lastUserMsg.content);
      if(typeof detectVampireChronicleFromText==='function') detectVampireChronicleFromText(_lastAiMsg.content, _lastUserMsg.content);
      if(typeof pmDetectWorldFromText==='function') pmDetectWorldFromText(_lastAiMsg.content);
      if(typeof pmDetectPersonalFromText==='function') pmDetectPersonalFromText(_lastAiMsg.content);
      if(typeof pmDetectQuestFromText==='function') pmDetectQuestFromText(_lastAiMsg.content, _lastUserMsg.content);
      if(typeof detectHistoryFragment==='function') detectHistoryFragment(_lastAiMsg.content, _lastUserMsg.content);
      if(typeof pmLearnFromNpcDialog==='function'){
        const _npcsForPm = (typeof loadNPCs==='function' ? loadNPCs()||[] : []);
        const _lcPm = (_lastAiMsg.content+' '+_lastUserMsg.content).toLowerCase();
        for(let _pi=0; _pi<Math.min(_npcsForPm.length,5); _pi++){
          const _npcForPm = _npcsForPm[_pi];
          if(_npcForPm?.name && _lcPm.includes(_npcForPm.name.toLowerCase())){
            pmLearnFromNpcDialog(_npcForPm.name, _lastUserMsg.content, _lastAiMsg.content).catch(()=>{});
            break;
          }
        }
      }
      const _pmTrivialRe = /^(네|아니|응|그래|좋아|알겠|계속|다음|돌아|뒤로|확인|닫|ㄴ|ㅇ|예|아니요|ok|yes|no).{0,5}$/i;
      if(typeof pmUpdateChoice==='function' && _lastUserMsg.content.length>10 && !_pmTrivialRe.test(_lastUserMsg.content.trim())) pmUpdateChoice(_lastUserMsg.content, '', '');
      if(typeof collectTurnData==='function') collectTurnData(_lastAiMsg.content, _lastUserMsg.content, window._pmLastGsSucceeded===(S.msgCount||0));
      // [버그 수정] 예언 키워드 자동 감지·중요 행동 자동 소문 생성도
      // npc/158이 window.sendMsg를 감싸던 같은 원인으로 죽어있던 훅이다.
      if(typeof addProphecy==='function' && _lastAiMsg.content.includes('예언') && _lastAiMsg.content.includes('"') && !_lastAiMsg.content.includes('prophecy_add')){
        const _prophMatch = _lastAiMsg.content.match(/"([^"]{10,80})"/);
        if(_prophMatch) setTimeout(()=>{ addProphecy(_prophMatch[1],'서사 속 예언자'); }, 500);
      }
      if(typeof addPlayerRumor==='function'){
        const _bigWords=['봉인석 복원','보스 처치','대륙 구했','마왕 쓰러','전쟁 끝'];
        if(_bigWords.some(w=>_lastAiMsg.content.includes(w))){
          const _rumorLoc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
          addPlayerRumor(_lastAiMsg.content.slice(_lastAiMsg.content.search(/봉인석|보스|대륙|마왕|전쟁/)).slice(0,50), (_rumorLoc&&_rumorLoc.name)||'알 수 없는 곳', true);
        }
      }
    }
  }catch(e){}
  // [버그 수정] 5턴마다 자동 저장 슬롯에 조용히 저장하는 훅도 같은 이유로
  // 죽어있었다 — ui/155의 runAutoSaveSnapshot() 참고.
  if(typeof runAutoSaveSnapshot==='function' && S.character && (S.msgCount||0)%5===0) runAutoSaveSnapshot();
  // [버그 수정] PM(개인기억) 주기 동기화(퀘스트/영지/개인 파트를 실제 게임
  // 상태와 맞춤)도 misc/278의 죽은 sendMsg 훅에 있던 5턴마다 실행 로직이다.
  if((S.msgCount||0)%5===0){
    if(typeof pmSyncQuestFromGame==='function') pmSyncQuestFromGame();
    if(typeof pmUpdateDemesne==='function') pmUpdateDemesne();
    if(typeof pmSyncPersonalFromGame==='function') pmSyncPersonalFromGame();
  }
  // [버그 수정] 영지 자원 틱(tickDemesneResources — 세수/업킵/인구/계절)도
  // race/260이 window.sendMsg를 감싸던 같은 원인으로 죽어있던 매턴(응답 후) 훅이다.
  if(typeof tickDemesneResources==='function') tickDemesneResources();
  // [버그 수정] NPC 영지 침략 시스템(tickRivalDomain/ensureRivalDomainForNpc/
  // tickPuppetTribute)도 misc/324가 window.sendMsg를 감싸던 같은 원인으로
  // 죽어있던 매턴 훅이다.
  try{
    if(typeof ensureRivalDomainForNpc==='function'){
      (loadNPCs()||[]).slice(0,20).forEach(n=>ensureRivalDomainForNpc(n));
    }
    if(typeof tickRivalDomain==='function' && typeof loadRD==='function'){
      const _rd=loadRD();
      Object.keys(_rd).forEach(k=>tickRivalDomain(k));
    }
    if((S.msgCount||0)%5===0 && typeof tickPuppetTribute==='function') tickPuppetTribute();
    if(typeof renderRivalDomainPanel==='function' && document.getElementById('pb-rival-domain')) renderRivalDomainPanel();
  }catch(e){}
  // [버그 수정] 세계 정착지 영향력 시스템(tickWSI)도 misc/325가
  // window.sendMsg를 감싸던 같은 원인으로 죽어있던 매턴 훅이다.
  try{
    if(typeof tickWSI==='function') tickWSI();
    const _wsiCurLoc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    if(_wsiCurLoc && _wsiCurLoc.id && _wsiCurLoc.type!=='battlefield' && typeof loadWSI==='function' && typeof initSettlement==='function'){
      const _wsi = loadWSI();
      if(!_wsi[_wsiCurLoc.id]){
        const _allLocs = typeof window.getAllLocations==='function' ? window.getAllLocations() : [];
        const _locDef = _allLocs.find(l=>l.id===_wsiCurLoc.id) || _wsiCurLoc;
        initSettlement(_wsiCurLoc.id, _locDef);
      }
    }
    if(typeof injectWSIBtn==='function') injectWSIBtn();
    if(typeof injectCitiesShortcut==='function') injectCitiesShortcut();
    if(document.getElementById('pb-politicalmap') && document.getElementById('wmap-markers')) renderPoliticalMapPanel();
  }catch(e){}
  // [버그 수정] 영지 v5 확장 통합 틱(v5Tick — 명성/왕실관계/인구계층/
  // 건설대기열/봉신반란/점령/계절행사)도 misc/323가 window.sendMsg를
  // 감싸던 같은 원인으로 죽어있던 매턴 훅이다(v5Tick 자체 게이트: established
  // 영지 + 3턴 간격). 영지 v5 패널이 열려 있을 때만 갱신(닫혀 있으면 패널이
  // DOM에 없어 renderDemesneV5Panel이 재주입 타이머를 매턴 새로 만드는
  // 낭비를 피함).
  if(typeof v5Tick==='function') v5Tick();
  if(typeof renderDemesneV5Panel==='function' && document.getElementById('pb-demesne-v5')) renderDemesneV5Panel();
  // [버그 수정] 자동 전직 알림(checkAutoJobUnlock, 자체 10턴 간격 게이트
  // 보유)도 job/042가 window.sendMsg를 감싸던 같은 원인으로 죽어있던 훅이다.
  if(typeof checkAutoJobUnlock==='function') checkAutoJobUnlock();
  // [버그 수정] 계승 회차 도전과제 체크(checkLoopMilestones)도 ai-prompt/172가
  // window.sendMsg를 감싸던 같은 원인으로 죽어있던 매턴 훅이다. gs 블록 유무와
  // 무관하게 매 턴 돌아야 하므로 processGSBlock이 아닌 여기(sendMsg 네이티브)에 연결.
  if(typeof checkLoopMilestones==='function'){
    const _loop = typeof v36_getReincarnationCount==='function' ? v36_getReincarnationCount() : 0;
    checkLoopMilestones(_loop);
  }
  // [버그 수정] 챕터 자동 진행 + 도전 과제 갱신(loop_count/max_moral/
  // min_moral/max_gold)도 misc/164가 window.sendMsg를 감싸던 같은 원인으로
  // 죽어있던 매턴(응답 후) 훅이다.
  try{
    const _ws = typeof loadWorldDB==='function' ? loadWorldDB() : {};
    const _flags = _ws.flags||{};
    const _loopCount = typeof v36_getReincarnationCount==='function' ? v36_getReincarnationCount() : 0;
    const _ch = typeof loadChapterState==='function' ? loadChapterState() : null;
    if(_ch){
      if(_ch.current===1 && _flags['seal_broken_0'] && typeof advanceChapter==='function') advanceChapter(2,'봉인석 최초 파괴');
      if(_ch.current===2 && _loopCount>=1 && typeof advanceChapter==='function') advanceChapter(3,'첫 회차 완료');
      if(_ch.current===3 && _loopCount>=3 && typeof advanceChapter==='function') advanceChapter(4,'루프 각성');
    }
    const _playerDB = typeof loadPlayerDB==='function' ? loadPlayerDB() : {};
    updateChallenge('loop_count', _loopCount);
    updateChallenge('max_moral', _playerDB.moralAlignment||0);
    updateChallenge('min_moral', _playerDB.moralAlignment||0);
    if(S.gold) updateChallenge('max_gold', S.gold);
  }catch(e){}
  window.renderChoices();
  // 안전망: 혹시 S.loading이 True 상태로 남으면 5초 후 강제 리셋
  clearTimeout(window._loadingWatchdog);
  window._loadingWatchdog = null;
}
window.sendMsg = sendMsg;

export function updateCharHeader(){
  const c=S.character; if(!c) return;
  $('char-name').textContent=c.name||'-';
  const rank = c.socialRank ? SOCIAL_RANKS.find(r=>r.id===c.socialRankId) : null;
  const rankStr = rank ? rank.icon+' '+rank.name+' · ' : '';
  $('char-role').textContent = rankStr + (c.race?c.race+' · ':'')+(c.role||'-');
  const race=RACE_DEFS.find(r=>r.name===c.race);
  // [캐릭터 초상화] race.icon은 손으로 그린 SVG 문자열이다 — 도트
  // 생성기가 RACE_DEFS 12종을 전부 스캔해서 이미지로 만들어뒀으므로
  // (tools/pixelart-gen/scan-svgicon-defs.js), 있으면 그 도트 흉상을
  // 쓰고 없으면 원래 SVG 그대로 폴백한다.
  $('char-avatar').innerHTML=race?(typeof getEntityIconHTML==='function'?getEntityIconHTML(race,{size:22}):race.icon):'⚔';
  // PC 사이드 패널
  const pcName=$('pc-char-name');
  const pcRole=$('pc-char-role');
  const pcAvatar=$('pc-char-avatar');
  if(pcName) pcName.textContent=c.name||'-';
  if(pcRole) pcRole.textContent=rankStr+(c.race?c.race+' · ':'')+( c.role||'-');
  if(pcAvatar) pcAvatar.innerHTML=race?(typeof getEntityIconHTML==='function'?getEntityIconHTML(race,{size:32}):race.icon):'⚔';
}
window.updateCharHeader = updateCharHeader;

export function updateSendBtn(){ $('send-btn').disabled=S.loading; }
window.updateSendBtn = updateSendBtn;

export function getChoiceDiceHint(text){
  // 선택지 판정도 sendMsg 엔진과 동일한 기준 적용
  const t = text.toLowerCase();
  if(text.length < 8) return null;

  // 제외 패턴 — 실행형 어미 없으면 casual
  const _noRoll = /(?:생각|고민|바라보|지켜보|기다리|멈춰|망설|머뭇|잠시|잠깐|가만히|침묵|서 있|앉아|누워|미소|웃으며|울며|고개를 끄덕|고개를 저)/;
  const _execEnd = /(?:한다|했다|하겠|할게|하자|해버린|해냈|냈다|쳤다|꽂았|달렸|뛰었|탈출|잠입|도망|뛰쳐|빠져나|휘둘렀|내리친|집어든|낚아챈)/;
  if(_noRoll.test(t) && !_execEnd.test(t)) return null;

  // 문맥: 전투/적대 상황
  const _inCombat = (typeof loadMonsters==='function') && (loadMonsters()||[]).some(m=>m.status==='alive');
  const _hostile  = (S.npcs||[]).some(n=>n.relation==='hostile'||n.relation==='enemy');
  const _danger   = _inCombat || _hostile;

  // 카테고리별 패턴 (sendMsg와 동일 기준)
  const _combat    = /(?:공격|베어|찌르|때려|가격|강타|일격|급습|기습|암살|독살|제압|결박|방어|막아|반격|패링|회피|피해낸|구르며|도약|뛰어오른)(?:해|하고|하며|했|한다|할게|하겠|냈|낸다|버린|친다|쳤|꽂)/;
  const _stealth   = /(?:몰래|살금|기척을 죽|그림자처럼|어둠 속으로|벽에 붙어|엎드려|포복|위장|변장|모르는 척|표정을 숨기|내색하지|들키지 않게|눈치채지 못하게|추적을 따돌)/;
  const _persuade  = /(?:설득|납득시키|협상|흥정|거래를 제안|조건을 제시|회유|포섭|매수|뇌물|부탁|간청|애원)/;
  const _intimidate= /(?:위협|협박|겁박|겁주|으름장|칼을 들이대|칼을 겨누|목에 칼|멱살을 잡|죽이겠다|가만두지 않겠|압박|단호하게 경고)/;
  const _search    = /(?:뒤진|수색|탐색|조사|살펴봤|찾아냈|발견|파헤쳤|열어봤|확인|단서를 찾|흔적을 찾|냄새를 맡아|귀를 기울여)/;
  const _move      = /(?:달려|뛰어|도망|탈출|빠져나|벗어나|담을 넘|창문으로 뛰|도주|철수|후퇴)/;
  const _magic     = /(?:마법|주문|시전|소환|봉인|결계|마나|마력|주술|저주|치유|힐링)/;
  const _social    = /(?:말을 건|다가가 말|손을 내밀|인사를 건|정체를 밝|정보를 캐|뇌물을 건|술을 권)/;
  const _ctx       = _danger ? /(?:말을 건|다가가|뒤로 물러|등을 돌|항복|저항|버텼)/ : null;

  // 판정 여부
  const _hasAction = _combat.test(t) || _stealth.test(t) || _persuade.test(t) ||
                     _intimidate.test(t) || _search.test(t) || _move.test(t) ||
                     _magic.test(t) || _social.test(t) || (_ctx && _ctx.test(t));
  if(!_hasAction) return null;

  // 스탯 결정 (복합 행동 우선순위)
  const _statMap = [
    { re: _combat,     sub: /(?:막아|방어|버텨|반격|패링)/, subStat:'end', sub2: /(?:쏘아|사격|저격|활로|던져)/, sub2Stat:'rng', def:'str', icon:'⚔️' },
    { re: _intimidate, stat:'fear', icon:'😠' },
    { re: _stealth,    sub: /(?:위장|변장|모르는 척|표정을 숨기|내색)/, subStat:'disg', def:'agi', icon:'🎭' },
    { re: _magic,      sub: /(?:치유|치료|회복|힐링)/, subStat:'fath', def:'mgc', icon:'✨' },
    { re: _persuade,   stat:'neg',  icon:'🤝' },
    { re: _search,     sub: /(?:추리|해석|분석|연구|파헤)/, subStat:'int', def:'per', icon:'👁️' },
    { re: _move,       stat:'agi',  icon:'💨' },
    { re: _social,     sub: /(?:속이|가짜|거짓|정체를 숨)/, subStat:'disg', sub2:/(?:위협|압박|경고)/, sub2Stat:'fear', sub3:/(?:협상|흥정|거래|뇌물)/, sub3Stat:'neg', def:'spk', icon:'💬' },
    { re: _ctx,        stat:'luk',  icon:'🎲' },
  ];

  for(const entry of _statMap){
    if(!entry.re || !entry.re.test(t)) continue;
    let stat = entry.stat || entry.def || 'luk';
    let icon = entry.icon || '🎲';
    if(entry.sub  && entry.sub.test(t))  { stat = entry.subStat;  }
    if(entry.sub2 && entry.sub2.test(t)) { stat = entry.sub2Stat; }
    if(entry.sub3 && entry.sub3.test(t)) { stat = entry.sub3Stat; }
    return { stat: stat.toUpperCase(), icon };
  }
  return { stat:'LUK', icon:'🎲' };
}
window.getChoiceDiceHint = getChoiceDiceHint;

export function pickChoiceByIdx(el){
  const idx=parseInt(el.dataset.choiceIdx);
  if(isNaN(idx)||!S.choices[idx]) return;
  sendMsg(S.choices[idx], true);
}
window.pickChoiceByIdx = pickChoiceByIdx;

export function renderMsgs(){
  const area=$('msgs'), thinking=$('thinking');
  area.innerHTML=''; if(thinking) area.appendChild(thinking);
  S.messages.forEach(msg=>{
    const div=document.createElement('div');
    div.className=(msg.role==='assistant'?'msg-ai':'msg-user')+' fade-in';
    const bubble=document.createElement('div'); bubble.className='bubble';
    if(msg.role==='assistant'&&msg.content.includes('__RETRY__')){
      const errText=msg.content.replace('\n\n__RETRY__','');
      bubble.textContent=errText;
      const retryBtn=document.createElement('button');
      retryBtn.textContent='🔄 다시 시도';
      retryBtn.style.cssText='margin-top:8px;display:block;width:100%;padding:7px;background:linear-gradient(135deg,#2a1f0d,#3a2a10);border:1px solid var(--gold);color:var(--gold);font-family:Cinzel,serif;font-size:10px;cursor:pointer;border-radius:2px;';
      retryBtn.onclick=()=>{ S.messages.pop(); if(S.messages.length && S.messages[S.messages.length-1].role==='user' && S.messages[S.messages.length-1].content===S.lastFailedMsg) S.messages.pop(); if(S.lastFailedMsg) sendMsg(S.lastFailedMsg, S.lastFailedIsChoice||false); };
      bubble.appendChild(retryBtn);
    } else {
      // [블랙스크린 FIX] renderStoryMarkdown 미정의 → 안전한 인라인 마크다운 렌더로 교체
      const _md = msg.content || '';
      try {
        if(typeof renderStoryMarkdown === 'function'){
          bubble.innerHTML = renderStoryMarkdown(_md);
        } else {
          // 기본 마크다운: 줄바꿈, **굵게**, *기울임* 처리
          bubble.innerHTML = _md
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
            .replace(/\*(.+?)\*/g,'<em>$1</em>')
            .replace(/\n/g,'<br>');
        }
      } catch(mdErr) {
        bubble.textContent = _md; // 최후 안전망
      }
    }
    div.appendChild(bubble);
    if(msg.rollInfo){
      const ri=msg.rollInfo;
      const vc=ri.isCritSuccess?'v-cs':ri.isCritFail?'v-cf':ri.isSuccess?'v-s':'v-f';
      const rd=document.createElement('div'); rd.className='roll-info';
      rd.innerHTML=`<span>${ri.statIcon}</span><span style="color:var(--dim)">${esc(ri.statName)} ${ri.statValue}</span><span style="color:#6a5a3a">d100:${ri.diceRoll}</span><span class="verdict ${vc}">${ri.verdictEmoji} ${ri.verdict}</span>${ri.skillUsed?`<span style="color:#4a6fa5;font-size:8px">⚡${esc(ri.skillUsed)}</span>`:''}`;
      div.appendChild(rd);
    }
    area.insertBefore(div, thinking);
  });
  window.renderThinking();
  area.scrollTop=area.scrollHeight;
}
window.renderMsgs = renderMsgs;

export function showGameOver(go, isNonMainEnding){
  const ov=$('go-overlay'); if(!ov) return;
  const c=S.character;
  const continueBtn = $('go-continue-main');

  if(go.type==='death'){
    $('go-ico').textContent='💀'; $('go-title').textContent='최후';
    $('go-msg').textContent=(c?.name||'주인공')+'은(는) 이 생을 마감했습니다.\n전생의 기억을 안고 환생할 수 있습니다.';
    if(continueBtn) continueBtn.style.display='none';
  } else if(isNonMainEnding && go.endingName){
    // 비메인 엔딩 달성 팝업
    $('go-ico').textContent = go.endingIcon||'🌟';
    $('go-title').textContent = go.endingName;
    $('go-msg').textContent =
      (go.endingDesc ? go.endingDesc+'\n\n' : '')
      +'— 환생하여 새 여정을 시작하거나,\n메인 스토리 엔딩을 위해 계속 플레이할 수 있습니다.';
    if(continueBtn) continueBtn.style.display='block';
  } else {
    $('go-ico').textContent='✨'; $('go-title').textContent='엔딩';
    $('go-msg').textContent='이야기가 마무리됐습니다.\n환생하여 새로운 삶을 시작할 수 있습니다.';
    if(continueBtn) continueBtn.style.display='none';
  }

  // ── 다음 환생 스탯 미리보기 (누적 영구 보너스 현황) ──
  try {
    const nextStatsEl = $('go-next-stats');
    const nextGridEl  = $('go-next-stats-grid');
    const deathBonusEl = $('go-next-death-bonus');
    if(nextStatsEl && nextGridEl){
      const perm = loadPermStatBonus();
      const permEntries = INHERITABLE_STATS.filter(k=>(perm[k]||0)>0).map(k=>[k,perm[k]]);

      if(permEntries.length > 0){
        nextGridEl.innerHTML = permEntries.map(([k,v])=>{
          const info = getStatInfo(k);
          return `<div style="display:flex;align-items:center;gap:5px;padding:4px 7px;background:var(--bg-input);border:1px solid var(--border);font-family:'Cinzel',serif;font-size:10px">
            <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(info,{size:14}):(info?.icon||'📊')}</span>
            <span style="color:var(--dim);flex:1">${info?.name||k}</span>
            <span style="color:#60d060;font-weight:bold">+${v}</span>
          </div>`;
        }).join('');
      } else {
        nextGridEl.innerHTML = `<div style="grid-column:1/-1;text-align:center;font-size:10px;color:var(--dim);padding:6px">환생 후 무작위 스탯 2~3개가 +2씩 오릅니다</div>`;
      }

      if(deathBonusEl){
        const deathBonuses = getActiveDeathBonuses();
        if(deathBonuses.length>0){
          deathBonusEl.innerHTML = `<div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:5px;text-align:center">💀 전생 사망 유산</div>` +
            deathBonuses.map(d=>{
              const bonusText = Object.entries(d.bonus).map(([k,v])=>{
                const info = getStatInfo(k);
                return `${info?.name||k} ${v>0?'+':''}${v}`;
              }).join(', ');
              return `<div style="padding:3px 7px;margin-bottom:3px;background:var(--bg-input);border:1px solid #3a1a3a;font-size:10px">
                ${typeof getEntityIconHTML==='function'?getEntityIconHTML(d,{size:16}):(d.icon)} <span style="color:var(--gold);font-family:'Cinzel',serif">${d.name}</span>
                <span style="color:#c080d0;margin-left:4px">${bonusText}</span>
              </div>`;
            }).join('');
        } else {
          deathBonusEl.innerHTML = '';
        }
      }
      nextStatsEl.style.display='block';
    }
  } catch(e){ /* 스탯 미리보기 오류 무시 */ }

  ov.classList.add('open');
}
window.showGameOver = showGameOver;

export function goReinc(){ $('go-overlay').classList.remove('open'); showReincScreen(); }
window.goReinc = goReinc;

export function goContinueForMainEnding(){
  $('go-overlay').classList.remove('open');
  // 메인 엔딩을 향해 계속 진행하도록 AI에게 힌트 주입
  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n\n[🎯 플레이어 선택: 메인 엔딩 도전]\n'
    +'플레이어가 현재 달성한 엔딩에도 불구하고 메인 스토리 완결을 위해 계속 플레이하기로 했다.\n'
    +'메인 퀘스트(봉인석 복원, 아스모데우스 저지 등 핵심 목표)를 자연스럽게 다시 상기시키되 강요하지 마라.\n'
    +'플레이어가 이미 비범한 여정을 걸어왔음을 감안해 세계의 반응을 풍부하게 묘사하라.';
  toast('⚔️ 메인 엔딩을 향해 계속 나아갑니다...', 3000);
}
window.goContinueForMainEnding = goContinueForMainEnding;

export function softResetPlaythrough(){
  const cycle = loadCycleCount()||0;
  const msg = `게임을 완전히 초기화합니다.\n\n✅ 유지되는 것:\n- AI가 만든 재료·적·설계도 데이터\n\n❌ 초기화되는 것:\n- 회차·누적 스탯·업적·통계 등 모든 진행 데이터\n- 캐릭터·대화·퀘스트·인벤토리·장비·골드·스킬\n\n계속하시겠습니까?`;
  if(!confirm(msg)) return;

  // 장착 효과 먼저 제거
  if(S.equipped) Object.values(S.equipped).filter(Boolean).forEach(item=>{
    if(item.effects) Object.entries(item.effects).forEach(([k,v])=>{
      if(S.stats&&S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v);
    });
  });

  // AI가 생성한 데이터만 백업
  const keepDynMat      = lsGet(DYN_MAT_KEY);
  const keepDynEnemy    = lsGet(DYN_ENEMY_KEY);
  const keepDynBP       = lsGet(DYN_BP_KEY);
  const keepDynNpc      = lsGet(DYN_NPC_KEY);
  const keepDynEncounter= lsGet(DYN_ENCOUNTER_KEY);

  // _memStore 전체 삭제
  Object.keys(_memStore).forEach(k => lsDel(k));

  // AI 생성 데이터 복구
  if(keepDynMat)       lsSet(DYN_MAT_KEY,       keepDynMat);
  if(keepDynEnemy)     lsSet(DYN_ENEMY_KEY,      keepDynEnemy);
  if(keepDynBP)        lsSet(DYN_BP_KEY,         keepDynBP);
  if(keepDynNpc)       lsSet(DYN_NPC_KEY,        keepDynNpc);
  if(keepDynEncounter) lsSet(DYN_ENCOUNTER_KEY,  keepDynEncounter);

  // fired-events 빈 배열로 초기화
  lsSet('tf-fired-events', '[]');

  // 지역 종교 점유율 등 종교 상태 초기화 (새 회차는 처음부터 시작)
  if(typeof clearReligionState==='function') clearReligionState();

  // NPC/월드/퀘스트/영지/개인/선택 파싱 캐시 초기화 (완전 초기화인데 누락되어 있었음)
  if(typeof pmClearAll==='function') pmClearAll();

  // S 상태 완전 초기화
  S.character=null; S.messages=[]; S.stats={}; S.msgCount=0;
  S.scenario=null; S.inventory=[]; S.fullMessages=[]; S.gold=0;
  // [버그 수정] 메모리(S.gold=0, S.inventory=[])만 초기화하고 localStorage의
  // GOLD_KEY/INVENTORY_KEY 자체는 안 지워서, 다음 로드 시 이전 골드·아이템이
  // 되살아날 위험이 있었음.
  if(typeof clearGold==='function') clearGold();
  if(typeof clearInventory==='function') clearInventory();
  // 분리 저장 키 초기화 (환생 후 새 데이터로 덮어씀)
  lsDel(CHAR_KEY); lsDel(STATS_SAVE_KEY); lsDel(CHAT_KEY);
  lsDel(META_KEY); lsDel(SCENARIO_SAVE_KEY);
  S.equipped=Object.fromEntries(EQUIP_SLOTS.map(s=>[s.id,null]));
  S._emotion='neutral'; S._weather=''; S._partyBonus=null; S._comboBonus=0;
  S.pastLifeData=null; S.unlockedSkills={};

  closeP('saves');
  toast('🔄 완전 초기화 완료 — AI 생성 재료·적·NPC·설계도·조우 로그 유지됩니다', 4000);
  setTimeout(()=>showScreen('title'), 800);
}
window.softResetPlaythrough = softResetPlaythrough;

export function showReincScreen(){
  window._reincRunning = false;
  const btn = document.getElementById('reinc-start-btn');
  if(btn) btn.disabled = false;
  showScreen('reincarnation');
  const c=S.character; if(!c) return;
  $('reinc-sub').textContent=c.name+'의 이야기가 끝났습니다.\n전생의 기억과 함께 새 삶이 시작됩니다.';
  // [신규] LEGACY_RULES.carry_over — 완전히 작성되어 있었지만 어디에도
  // 표시되지 않던 "다음 회차에 무엇이 이어지는지" 안내를 환생 화면에
  // 실제로 노출한다.
  try{
    const legacyEl = document.getElementById('reinc-legacy-info');
    if(legacyEl && typeof LEGACY_RULES !== 'undefined'){
      const items = Object.values(LEGACY_RULES.carry_over).map(v=>`<div>✦ <b style="color:var(--gold)">${v.label}</b> — ${v.desc}</div>`).join('');
      legacyEl.innerHTML = `<div style="color:var(--gold);margin-bottom:4px;font-family:Cinzel,serif;letter-spacing:1px">다음 생으로 이어지는 것들</div>${items}`;
    }
  }catch(e){}

  // ── [수정] 환생 보너스 스탯: 3개 후보 중 2개 직접 선택 ──
  const pool = [...INHERITABLE_STATS];
  // 후보 3개 뽑기
  const candidates = [];
  for(let i=0; i<3 && pool.length>0; i++){
    const idx = Math.floor(Math.random()*pool.length);
    candidates.push(pool.splice(idx,1)[0]);
  }
  // 전역 저장 (doReincarnate에서 읽음)
  window._reincCandidates = candidates;
  window._reincSelected = new Set();

  // 기존 누적 현황 표시
  const perm = loadPermStatBonus();
  const existingEntries = INHERITABLE_STATS.filter(k=>(perm[k]||0)>0).map(k=>[k,perm[k]]);

  // 후보 선택 UI
  $('reinc-grid').innerHTML = `
    <div style="grid-column:1/-1;font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:1px;margin-bottom:8px;text-align:center">
      🎲 상승할 스탯 2개를 선택하세요 (3개 중)
    </div>
    ${candidates.map(k=>{
      const info = getStatInfo(k);
      return `<div id="reinc-cand-${k}" onclick="toggleReincCandidate('${k}')" style="
        display:flex;align-items:center;gap:5px;padding:8px 10px;
        background:var(--bg-input);border:2px solid var(--border);
        font-family:'Cinzel',serif;font-size:11px;cursor:pointer;
        transition:all .15s;border-radius:2px;user-select:none">
        <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(info,{size:14}):(info?.icon||'📊')}</span>
        <span style="flex:1;color:var(--gold)">${info?.name||k}</span>
        <span style="color:#60d060;font-size:10px">+2 ↑</span>
      </div>`;
    }).join('')}
    ${existingEntries.length > 0 ? `
      <div style="grid-column:1/-1;margin-top:10px;font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:1px">누적 영구 보너스</div>
      ${existingEntries.map(([k,v])=>{
        const i=getStatInfo(k);
        return `<div style="display:flex;align-items:center;gap:5px;padding:4px 8px;background:var(--bg-input);border:1px solid var(--border);font-family:'Cinzel',serif;font-size:10px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(i,{size:14}):(i?.icon||'📊')}</span><span style="color:var(--dim);flex:1">${i?.name||k}</span>
          <span style="color:#c8a96e;font-weight:bold">+${v}</span>
        </div>`;
      }).join('')}
    ` : ''}
    <div id="reinc-select-hint" style="grid-column:1/-1;text-align:center;font-size:10px;color:var(--dim);margin-top:6px">
      0 / 2 선택됨
    </div>
  `;

  // 버튼 상태 업데이트
  _updateReincBtn();

  // 포인트 표시
  const pts = loadRCPoints();
  const cycle = loadCycleCount()||0;
  const nextPts = calcReincCraftPoints(cycle+1);
  const rcEl = $('reinc-rc-pts');
  if(rcEl) rcEl.innerHTML = `✨ 환생 포인트 <span style="color:var(--gold);font-size:12px">${pts}pt</span> 보유 · 환생 시 <span style="color:var(--gold)">${nextPts}pt</span> 추가 획득`;
}
window.showReincScreen = showReincScreen;

export function toggleReincCandidate(key){
  if(!window._reincSelected || !window._reincCandidates) return;
  const el = document.getElementById('reinc-cand-'+key);
  if(!el) return;
  if(window._reincSelected.has(key)){
    window._reincSelected.delete(key);
    el.style.borderColor='var(--border)';
    el.style.background='var(--bg-input)';
    el.style.boxShadow='none';
  } else {
    if(window._reincSelected.size >= 2){
      toast('⚠️ 최대 2개까지 선택할 수 있습니다', 1500);
      return;
    }
    window._reincSelected.add(key);
    el.style.borderColor='#60d060';
    el.style.background='rgba(96,208,96,0.08)';
    el.style.boxShadow='0 0 6px #40d04044';
  }
  _updateReincBtn();
}
window.toggleReincCandidate = toggleReincCandidate;

export function _updateReincBtn(){
  const hint = document.getElementById('reinc-select-hint');
  const btn  = document.getElementById('reinc-start-btn');
  const sel  = window._reincSelected ? window._reincSelected.size : 0;
  if(hint) hint.textContent = `${sel} / 2 선택됨`;
  if(btn)  btn.disabled = (sel < 2);
}
window._updateReincBtn = _updateReincBtn;

export const PASSIVE_SKILL_STAT_CAP = 50;

export function applyAllPassiveSkills(){
  // 이전 적용분 먼저 제거
  const prevBonus = S._passiveSkillBonus || {};
  Object.entries(prevBonus).forEach(([k,v])=>{
    if(S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v);
  });

  const unlocked = loadSkills()||{}; // loadSkills()로 통일
  const allSkills = getAllSkillDefs();
  const newBonus = {};
  allSkills.filter(sk=>sk.type==='passive'&&unlocked[sk.id]&&sk.statBoost).forEach(sk=>{
    Object.entries(sk.statBoost).forEach(([k,v])=>{
      if(v&&S.stats[k]!==undefined){
        // [BUG22] 스킬 하나당 단일 스탯 보너스를 PASSIVE_SKILL_STAT_CAP으로 제한
        const cappedV = Math.min(Math.abs(v), PASSIVE_SKILL_STAT_CAP) * Math.sign(v);
        newBonus[k]=(newBonus[k]||0)+cappedV;
      }
    });
  });
  Object.entries(newBonus).forEach(([k,v])=>{
    if(S.stats[k]!==undefined) S.stats[k]=Math.min(999,Math.max(0,S.stats[k]+v));
  });
  S._passiveSkillBonus = newBonus; // 다음 호출 시 제거용 기록
}
window.applyAllPassiveSkills = applyAllPassiveSkills;

export function showStatRisePopups(stats){
  if(!stats || stats.length === 0) return;
  // 화면 중앙 기준 랜덤 X 위치에서 각 스탯이 팝업으로 떠오름
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.55;
  stats.forEach((statKey, idx) => {
    setTimeout(()=>{
      const info = getStatInfo(statKey);
      const popup = document.createElement('div');
      popup.className = 'stat-rise-popup';
      popup.textContent = `${info?.icon||'📊'} ${info?.name||statKey} +2 ↑`;
      const rx = cx + (Math.random() - 0.5) * 220;
      popup.style.left = rx + 'px';
      popup.style.top  = cy + 'px';
      document.body.appendChild(popup);
      setTimeout(()=>popup.remove(), 1900);
    }, idx * 320);
  });
}
window.showStatRisePopups = showStatRisePopups;

export function showStatRisePopup(text, color){
  try{
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.55;
    const popup = document.createElement('div');
    popup.className = 'stat-rise-popup';
    popup.textContent = text;
    if(color) popup.style.color = color;
    const rx = cx + (Math.random() - 0.5) * 220;
    popup.style.left = rx + 'px';
    popup.style.top  = cy + 'px';
    document.body.appendChild(popup);
    setTimeout(()=>popup.remove(), 1900);
  }catch(e){ console.warn('[showStatRisePopup]', e); }
}
window.showStatRisePopup = showStatRisePopup;

window.showStatRisePopup = showStatRisePopup;

export function grantTitle(titleId){
  const def=TITLE_DEFS.find(d=>d.id===titleId); if(!def) return;
  if(window.addTitle(def)){
    S.titles=loadTitles();
    if(def.bonus){ Object.entries(def.bonus).forEach(([k,v])=>{ if(S.stats[k]!==undefined) S.stats[k]=Math.max(0,Math.min(999,S.stats[k]+v)); }); window.updateHeader(); }
    toast(def.icon+' 칭호 획득: '+def.name, 3000);
    const sp=def.rarity==='legendary'?3:def.rarity==='rare'?2:1;
    S.skillSP+=sp; saveSkillSP(S.skillSP);
    getAllSkillDefs().filter(s=>s.type==='event'&&s.unlockTitle===titleId).forEach(sd=>{
      if(!S.unlockedSkills[sd.id]){ S.unlockedSkills[sd.id]=true; saveSkills(S.unlockedSkills); toast('⚡ '+sd.icon+' '+sd.name+' 스킬 획득!',3500); }
    });
  }
}
window.grantTitle = grantTitle;

export function applyTitleStatBonuses(){
  try{
    if(!S || !S.stats) return;
    if(!S.unlockedSkills) S.unlockedSkills = {};
    const owned = (typeof loadTitles==='function') ? loadTitles() : [];
    if(!owned.length || typeof getAllSkillDefs!=='function') return;
    const allSkills = getAllSkillDefs();
    let statsChanged = false;
    owned.forEach(t=>{
      const def = TITLE_DEFS.find(d=>d.id===t.id);
      if(!def?.bonus) return;
      // 이 칭호에 연결된 이벤트 스킬을 찾는다
      const linkedSkill = allSkills.find(s=>s.type==='event' && s.unlockTitle===t.id);
      if(!linkedSkill) return; // 연결 스킬이 없으면 재동기화 대상 아님(최초 grantTitle 때만 적용되는 일반 칭호)
      if(S.unlockedSkills[linkedSkill.id]) return; // 이번 생에 이미 스킬을 획득 = 이미 스탯도 반영됨
      // 이번 생에 아직 없음 → 스탯 보너스 반영
      Object.entries(def.bonus).forEach(([k,v])=>{
        if(S.stats[k]!==undefined) S.stats[k]=Math.min(999,S.stats[k]+v);
      });
      statsChanged = true;
    });
    if(statsChanged && typeof saveStats==='function') saveStats(S.stats);
  }catch(e){}
}
window.applyTitleStatBonuses = applyTitleStatBonuses;

export function applyTitleUnlockedSkills(){
  try{
    if(!S) return;
    if(!S.unlockedSkills) S.unlockedSkills = {};
    const owned = (typeof loadTitles==='function') ? loadTitles() : [];
    const ownedIds = new Set(owned.map(t=>t.id));
    if(!ownedIds.size || typeof getAllSkillDefs!=='function') return;
    let changed = false;
    getAllSkillDefs().filter(s=>s.type==='event' && s.unlockTitle && ownedIds.has(s.unlockTitle)).forEach(sd=>{
      if(!S.unlockedSkills[sd.id]){ S.unlockedSkills[sd.id]=true; changed=true; }
    });
    if(changed && typeof saveSkills==='function') saveSkills(S.unlockedSkills);
  }catch(e){}
}
window.applyTitleUnlockedSkills = applyTitleUnlockedSkills;

export function restoreTitleBenefits(){
  applyTitleStatBonuses();
  applyTitleUnlockedSkills();
}
window.restoreTitleBenefits = restoreTitleBenefits;

window.applyTitleStatBonuses = applyTitleStatBonuses;

window.applyTitleUnlockedSkills = applyTitleUnlockedSkills;

window.restoreTitleBenefits = restoreTitleBenefits;

export function updateMenuVisibility(){ if(typeof window.updateHeader==='function') window.updateHeader(); }
window.updateMenuVisibility = updateMenuVisibility;

window.updateMenuVisibility = updateMenuVisibility;

export function updateEmotionDisplay(){
  try{
    const el = document.getElementById('emotion-display');
    if(!el) return;
    const emotion = (typeof loadEmotion === 'function') ? loadEmotion() : null;
    if(emotion && (emotion.icon || emotion.label || emotion.id)){
      el.innerHTML = `<span style="font-size:13px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(emotion,{size:13}):(emotion.icon||"😐")}</span>`;
      el.title = `감정 상태: ${emotion.label || emotion.id || ''}`;
    } else {
      el.innerHTML = '';
    }
  }catch(e){ console.warn('[updateEmotionDisplay]', e); }
}
window.updateEmotionDisplay = updateEmotionDisplay;

window.updateEmotionDisplay = updateEmotionDisplay;

export function updateBossPhase(){
  return (typeof getBossPhaseBLS==='function') ? getBossPhaseBLS() : '';
}
window.updateBossPhase = updateBossPhase;

window.updateBossPhase = updateBossPhase;

export function showBossEntrance(boss){
  try{
    if(!boss) return;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);pointer-events:none;animation:fadeInUp .3s ease';
    overlay.innerHTML = `
      <div style="text-align:center">
        <div style="font-size:60px;margin-bottom:10px;filter:drop-shadow(0 0 20px rgba(255,80,40,0.8))">${typeof getEntityIconHTML==='function'?getEntityIconHTML(boss,{size:60}):(boss.icon||"👹")}</div>
        <div style="font-family:'Cinzel',serif;font-size:22px;color:#e05030;letter-spacing:2px;text-shadow:0 0 12px rgba(255,60,30,0.6)">${esc(boss.name||'보스')}</div>
        <div style="font-size:11px;color:#c08060;margin-top:6px;letter-spacing:3px">등 장</div>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.style.transition = 'opacity .6s'; overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 600); }, 1800);
  }catch(e){ console.warn('[showBossEntrance]', e); }
}
window.showBossEntrance = showBossEntrance;

window.showBossEntrance = showBossEntrance;

export function renderStatistics(){
  try{
    const body = document.getElementById('pb-statistics');
    if(!body) return;
    const sceneStats = (()=>{ try{ return JSON.parse(lsGet('tf-scene-stats')||'{}'); }catch(e){ return {}; } })();
    const playlog = (()=>{ try{ return JSON.parse(lsGet('tf-master-playlog')||'[]'); }catch(e){ return []; } })();
    const meStats = (()=>{ try{ return JSON.parse(lsGet('tf-me-stats')||'{}'); }catch(e){ return {}; } })();
    const monsters = (typeof loadMonsters === 'function') ? (loadMonsters()||[]) : [];
    const deadCount = monsters.filter(m => m.status === 'dead').length;

    const sceneRows = Object.entries(sceneStats).sort((a,b)=>b[1]-a[1])
      .map(([k,v]) => `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>${k}</span><span style="color:var(--gold)">${v}회</span></div>`).join('');

    body.innerHTML = `
      <div style="padding:12px;font-size:11px">
        <div style="font-family:'Cinzel',serif;color:var(--gold);margin-bottom:10px">📈 전투·행동 통계</div>
        <div style="margin-bottom:10px">총 턴 수: <b>${playlog.length}</b> / 처치한 적: <b>${deadCount}</b></div>
        ${sceneRows ? `<div style="margin-top:8px;color:var(--dim);font-size:9px">행동 유형별 빈도</div>${sceneRows}` : ''}
        ${meStats.hits ? `<div style="margin-top:14px;padding-top:10px;border-top:1px solid var(--border);font-size:9px;color:var(--dim)">로컬 매칭 절감: ${meStats.hits}건</div>` : ''}
      </div>`;
  }catch(e){ console.warn('[renderStatistics]', e); }
}
window.renderStatistics = renderStatistics;

window.renderStatistics = renderStatistics;

export function updateQuestBadge(){
  try{
    const badge = document.getElementById('quest-badge');
    if(!badge) return;
    const quests = (typeof loadQuests === 'function') ? (loadQuests() || []) : [];
    const activeCount = quests.filter(q => q.status !== 'completed' && q.status !== 'failed').length;
    if(activeCount > 0){
      badge.textContent = activeCount > 9 ? '9+' : String(activeCount);
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }catch(e){ console.warn('[updateQuestBadge]', e); }
}
window.updateQuestBadge = updateQuestBadge;

window.updateQuestBadge = updateQuestBadge;

export const ACADEMY_KEY = 'tf-academy';

export function loadAcademy(){
  try{ return JSON.parse(lsGet(ACADEMY_KEY)||'{"enrolled":false,"subject":null,"progress":0,"completedSubjects":[]}'); }
  catch(e){ return { enrolled:false, subject:null, progress:0, completedSubjects:[] }; }
}
window.loadAcademy = loadAcademy;

export function saveAcademy(d){ try{ lsSet(ACADEMY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveAcademy = saveAcademy;

window.loadAcademy = loadAcademy;

window.saveAcademy = saveAcademy;

export function enrollAcademy(subjectId){
  const def = ACADEMY_SUBJECTS.find(s => s.id === subjectId);
  if(!def) return;
  const d = loadAcademy();
  d.enrolled = true; d.subject = subjectId; d.progress = 0;
  saveAcademy(d);
  S._academyDesc = `${def.icon} ${def.name} 수업`;
  toast(`🎓 ${def.name} 수강 시작`, 2500);
  if(typeof renderAcademyPanel === 'function') renderAcademyPanel();
}
window.enrollAcademy = enrollAcademy;

window.enrollAcademy = enrollAcademy;

export function tickAcademy(){
  try{
    const d = loadAcademy();
    if(!d.enrolled || !d.subject) { S._academyDesc = ''; return; }
    const def = ACADEMY_SUBJECTS.find(s => s.id === d.subject);
    if(!def) return;
    d.progress = (d.progress||0) + 1;
    S._academyDesc = `${def.icon} ${def.name} 수업 (${d.progress}/10)`;
    if(d.progress >= 10){
      // 수료 — 스탯 보너스 적용
      Object.entries(def.statBonus||{}).forEach(([stat, val]) => {
        S.stats[stat] = Math.min(999, (S.stats[stat]||0) + val);
      });
      d.completedSubjects = d.completedSubjects||[];
      d.completedSubjects.push(d.subject);
      d.enrolled = false; d.subject = null; d.progress = 0;
      toast(`🎓 ${def.name} 수료! 스탯 보너스 획득`, 3500);
      S._nextInjectedContext = (S._nextInjectedContext||'') + `\n[🎓 학업 수료] ${def.name} 과정을 수료했다. 실력이 늘었음을 서사에 반영하라.`;
      if(typeof window.updateHeader==='function') window.updateHeader();
    }
    saveAcademy(d);
  }catch(e){ console.warn('[tickAcademy]', e); }
}
window.tickAcademy = tickAcademy;

window.tickAcademy = tickAcademy;

export function renderAcademyPanel(){
  try{
    const body = document.getElementById('pb-academy');
    if(!body) return;
    const d = loadAcademy();
    const completed = d.completedSubjects || [];

    if(d.enrolled && d.subject){
      const def = ACADEMY_SUBJECTS.find(s => s.id === d.subject);
      const pct = Math.min(100, Math.round((d.progress||0) / 10 * 100));
      body.innerHTML = `
        <div style="padding:14px">
          <div style="font-family:'Cinzel',serif;color:var(--gold);margin-bottom:8px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def?.icon||'🎓')} ${def?.name||''} 수강 중</div>
          <div style="background:#1a1008;border-radius:3px;height:8px;overflow:hidden;margin-bottom:6px">
            <div style="width:${pct}%;height:100%;background:#c0a050"></div>
          </div>
          <div style="font-size:9px;color:var(--dim)">${d.progress||0}/10 턴 진행 (${pct}%)</div>
          <div style="font-size:9px;color:var(--dim);margin-top:8px">${def?.desc||''}</div>
        </div>`;
    } else {
      body.innerHTML = `
        <div style="padding:14px">
          <div style="font-family:'Cinzel',serif;color:var(--gold);margin-bottom:10px">🎓 수강 가능한 과목</div>
          ${ACADEMY_SUBJECTS.map(s => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;margin-bottom:6px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px">
              <div>
                <div style="font-size:11px;color:var(--text)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:11}):(s.icon)} ${s.name} ${completed.includes(s.id)?'<span style="color:#60c060;font-size:8px">(수료)</span>':''}</div>
                <div style="font-size:8px;color:var(--dim)">${s.desc}</div>
              </div>
              <button onclick="enrollAcademy('${s.id}')" style="padding:5px 10px;font-size:9px;background:var(--bg-bubble-ai);border:1px solid var(--gold);color:var(--gold);cursor:pointer;border-radius:2px">수강</button>
            </div>`).join('')}
        </div>`;
    }
  }catch(e){ console.warn('[renderAcademyPanel]', e); }
}
window.renderAcademyPanel = renderAcademyPanel;

window.renderAcademyPanel = renderAcademyPanel;

export function autoSave(){
  try{
    if(typeof saveSession === 'function') saveSession();
  }catch(e){ console.warn('[autoSave]', e); }
}
window.autoSave = autoSave;

window.autoSave = autoSave;

export function detectEmotion(text){
  try{
    if(!text) return;
    for(const [id, pattern] of Object.entries(EMOTION_KEYWORDS)){
      if(new RegExp(pattern).test(text)){
        const def = EMOTION_DEFS.find(e => e.id === id);
        if(def) saveEmotion(def);
        // [연결] 감정 잔향/파문 시스템 — id 체계가 달라 매핑 필요
        const _emoMap = {anger:'rage', sadness:'sorrow', joy:'joy', fear:'fear', proud:'pride', affection:'love', disgust:'hatred'};
        const _mappedEmo = _emoMap[id];
        if(_mappedEmo){
          if(typeof recordEmotionEcho==='function') recordEmotionEcho(_mappedEmo);
          if(typeof recordEmotionRipple==='function') recordEmotionRipple(_mappedEmo, S.scenario?.id);
        }
        return;
      }
    }
  }catch(e){ console.warn('[detectEmotion]', e); }
}
window.detectEmotion = detectEmotion;

window.detectEmotion = detectEmotion;

export function detectWeatherChange(text){
  try{
    // [수정] 실제 날씨 저장소는 saveWeather가 아니라 loadAtmosphere/
    // saveAtmosphere의 atm.weather 필드 (updateWeather()가 쓰는 것과 동일)
    if(!text || typeof loadAtmosphere !== 'function' || typeof saveAtmosphere !== 'function') return;
    const map = { rain:'비가|소나기|장맛비', snow:'눈이|설경|폭설', clear:'맑은 하늘|쾌청', storm:'폭풍|태풍|광풍', fog:'안개가' };
    for(const [w, pattern] of Object.entries(map)){
      if(new RegExp(pattern).test(text)){
        const atm = loadAtmosphere();
        const prevWeather = atm.weather;
        atm.weather = w;
        saveAtmosphere(atm);
        // [신규] 날씨가 실제로 바뀐 경우에만 알림 — 같은 날씨가 계속
        // 유지될 때마다 매번 토스트가 뜨면 잡음이 되므로 변경 시에만.
        if(prevWeather !== w && typeof notifyWeatherChange==='function'){
          notifyWeatherChange(w);
        }
        return;
      }
    }
  }catch(e){}
}
window.detectWeatherChange = detectWeatherChange;

window.detectWeatherChange = detectWeatherChange;

export function detectBossDamage(text){ /* GS 경로(checkBossPhase)가 정식 처리 — 안전 스텁 */ }
window.detectBossDamage = detectBossDamage;

window.detectBossDamage = detectBossDamage;

export function getSortedFilteredInv(){
  try{
    const inv = (S.inventory||[]).slice();
    return inv.sort((a,b) => (INV_RARITY_ORDER[b.rarity]||0) - (INV_RARITY_ORDER[a.rarity]||0));
  }catch(e){ return S.inventory||[]; }
}
window.getSortedFilteredInv = getSortedFilteredInv;

window.getSortedFilteredInv = getSortedFilteredInv;

export function renderInvSortBar(){
  try{
    const bar = document.getElementById('inv-sort-bar');
    if(bar) bar.textContent = '등급 높은 순으로 정렬됨';
  }catch(e){}
}
window.renderInvSortBar = renderInvSortBar;

window.renderInvSortBar = renderInvSortBar;

export const SKILL_XP_KEY = 'tf-skill-xp';

export function loadSkillXp(){ try{ return JSON.parse(lsGet(SKILL_XP_KEY)||'{}'); }catch(e){ return {}; } }
window.loadSkillXp = loadSkillXp;

export function saveSkillXp(d){ try{ lsSet(SKILL_XP_KEY, JSON.stringify(d||{})); }catch(e){} }
window.saveSkillXp = saveSkillXp;

export function gainSkillXp(skillId){
  try{
    if(!skillId) return;
    const xp = loadSkillXp();
    xp[skillId] = (xp[skillId]||0) + 1;
    if(xp[skillId] % 50 === 0){
      toast(`📈 ${skillId} 숙련도 상승! (${xp[skillId]}회 사용)`, 2500);
    }
    saveSkillXp(xp);
  }catch(e){ console.warn('[gainSkillXp]', e); }
}
window.gainSkillXp = gainSkillXp;

window.loadSkillXp = loadSkillXp;

window.saveSkillXp = saveSkillXp;

window.gainSkillXp = gainSkillXp;

export function getEmotionBonus(){
  try{
    const emotion = (typeof loadEmotion === 'function') ? loadEmotion() : null;
    if(!emotion) return 0;
    const positiveBonus = { joy:5, excited:5, proud:4, calm:3, affection:3, surprise:2 };
    const negativeBonus = { fear:-5, anxiety:-4, sadness:-3, anger:-2, confused:-3, guilty:-2 };
    return positiveBonus[emotion.id] || negativeBonus[emotion.id] || 0;
  }catch(e){ return 0; }
}
window.getEmotionBonus = getEmotionBonus;

window.getEmotionBonus = getEmotionBonus;

export function getPartyBattleBonus(){
  try{
    const party = (typeof loadParty === 'function') ? (loadParty()||[]) : [];
    const aliveCount = party.filter(m => m.alive !== false).length;
    if(aliveCount === 0) return { bonus:0, desc:'' };
    const bonus = Math.min(15, aliveCount * 5);
    return { bonus, desc: `동료 ${aliveCount}명 지원` };
  }catch(e){ return { bonus:0, desc:'' }; }
}
window.getPartyBattleBonus = getPartyBattleBonus;

window.getPartyBattleBonus = getPartyBattleBonus;

export function getWorldCrisisLevel(){
  try{
    const gsF = (typeof loadGSFlags === 'function') ? loadGSFlags() : {};
    const fired = (typeof loadWorldEvents === 'function') ? loadWorldEvents() : {};
    let level = 0;
    // 발화된 세계 위기 이벤트 1건당 +8 (최대 일정 캡)
    const firedCount = Object.values(fired).filter(Boolean).length;
    level += Math.min(40, firedCount * 8);
    // 봉인석 균열류 플래그
    if(gsF['mq4_done']) level += 15;
    // 용사가 실패한 경우 — 가장 큰 비중
    if(gsF['world_failed'] || gsF['bad_ending_triggered'] || gsF['abyss_contract']) level += 40;
    // 용사가 성공했으면 위기도 크게 완화
    if(gsF['world_saved'] || gsF['good_ending_triggered'] || gsF['true_ending_triggered']) level = Math.max(0, level - 30);
    return Math.max(0, Math.min(100, level));
  }catch(e){ return 0; }
}
window.getWorldCrisisLevel = getWorldCrisisLevel;

window.getWorldCrisisLevel = getWorldCrisisLevel;

export function getDynamicPriceMultiplier(rarity){
  try{
    const d = (typeof loadDemesne === 'function') ? loadDemesne() : null;
    const prosperity = (d && d.established) ? (d.prosperity||50) : 50;
    // 번영도가 높으면 물가 약간 저렴, 낮으면 비싸짐
    let base = 1.3 - (prosperity / 100) * 0.5;
    // [신규] 세계 위기도가 높을수록 물가 추가 상승 — 전쟁/재난 시 물자 부족을 반영
    const crisis = getWorldCrisisLevel();
    base += (crisis / 100) * 0.6;
    const rarityMod = { legendary:1.3, rare:1.15, uncommon:1.0, common:0.9, misc:1.0 }[rarity] || 1.0;
    return Math.max(0.7, Math.min(2.2, base * rarityMod));
  }catch(e){ return 1.0; }
}
window.getDynamicPriceMultiplier = getDynamicPriceMultiplier;

window.getDynamicPriceMultiplier = getDynamicPriceMultiplier;

export function getWeatherForecast(){
  try{
    const totalDays = Math.floor((typeof loadTimeCost === 'function' ? loadTimeCost() : 0) / TIME_COST_PER_DAY);
    const forecast = [];
    for(let i = 0; i < 3; i++){
      const dayIdx = totalDays + i;
      forecast.push(WEATHER_CYCLE[Math.floor(dayIdx / 3) % WEATHER_CYCLE.length]);
    }
    return forecast;
  }catch(e){ return []; }
}
window.getWeatherForecast = getWeatherForecast;

window.getWeatherForecast = getWeatherForecast;

export function getQuestDB(){ return (typeof loadQuests==='function') ? loadQuests() : []; }
window.getQuestDB = getQuestDB;

window.getQuestDB = getQuestDB;

export function loadWorldQuests(){
  // 월드(NPC 발급) 퀘스트 전용 별도 저장소는 미구현 — 빈 배열로 안전 반환
  // (loadQuests의 일반 퀘스트와 혼동 방지를 위해 별도 함수로 유지)
  return [];
}
window.loadWorldQuests = loadWorldQuests;

window.loadWorldQuests = loadWorldQuests;

export function loadQuestDoneCount(){
  try{
    const quests = (typeof loadQuests==='function') ? (loadQuests()||[]) : [];
    return quests.filter(q => q.status === 'completed').length;
  }catch(e){ return 0; }
}
window.loadQuestDoneCount = loadQuestDoneCount;

window.loadQuestDoneCount = loadQuestDoneCount;

export const DEATH_CAUSE_KEY = 'tf-death-causes';

export function recordPlayerDeathCause(cause, detail, narrationSnippet){
  try{
    const list = (()=>{ try{ return JSON.parse(lsGet(DEATH_CAUSE_KEY)||'[]'); }catch(e){ return []; } })();
    list.push({ cause, detail, narration: narrationSnippet, turn: S.msgCount||0, cycle: (typeof loadCycleCount==='function')?loadCycleCount():0 });
    if(list.length > 50) list.splice(0, list.length-50);
    lsSet(DEATH_CAUSE_KEY, JSON.stringify(list));
    S._lastDeathCause = cause;
  }catch(e){ console.warn('[recordPlayerDeathCause]', e); }
}
window.recordPlayerDeathCause = recordPlayerDeathCause;

window.recordPlayerDeathCause = recordPlayerDeathCause;

export function recordNarration(text){ /* tf-master-playlog(collectTurnData)가 이미 동일 역할 수행 */ }
window.recordNarration = recordNarration;

window.recordNarration = recordNarration;

export const JAIL_STATE_KEY = 'tf-jail';

export function loadJailState(){ try{ return JSON.parse(lsGet(JAIL_STATE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadJailState = loadJailState;

export function saveJailState(d){ try{ lsSet(JAIL_STATE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveJailState = saveJailState;

export function getInfamyLevel(){
  try{
    const ws = (typeof loadWorldState==='function') ? loadWorldState() : {};
    const jail = loadJailState();
    const baseEvilActs = ws.evilActs||0;
    const repeatBonus = (jail.maxSecHistory||0) * 8; // 최고보안 전적 1회당 +8 가중
    return baseEvilActs + repeatBonus;
  }catch(e){ return 0; }
}
window.getInfamyLevel = getInfamyLevel;

window.getInfamyLevel = getInfamyLevel;

window.MAXSEC_JAIL_INMATES = MAXSEC_JAIL_INMATES;

window.LOCAL_JAIL_ACTIONS = LOCAL_JAIL_ACTIONS;

window.MAXSEC_JAIL_ACTIONS = MAXSEC_JAIL_ACTIONS;

window.GUARD_TIER_TABLE = GUARD_TIER_TABLE;

export function getGuardTierForInfamy(infamy){
  return GUARD_TIER_TABLE.find(t => infamy >= t.minInfamy && infamy < t.maxInfamy) || GUARD_TIER_TABLE[0];
}
window.getGuardTierForInfamy = getGuardTierForInfamy;

window.getGuardTierForInfamy = getGuardTierForInfamy;

export function checkArrestCondition(){
  if(!S || !S.character) return;
  const jail = loadJailState();
  if(jail.jailed) return; // 이미 수감 중이면 조우 판정 자체를 건너뜀
  if(S._inCombat) return; // 이미 전투/대치 중이면 새 조우를 만들지 않음
  if(S._guardEncounterActive) return; // 이미 경비병과 대치 중

  const rankId = S.character.socialRankId || 'commoner';
  if(rankId !== 'outlaw') return; // 무법자(지명수배) 신분만 대상

  const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  const isPublicPlace = loc && ['city','capital','town','port'].includes(loc.type);
  if(!isPublicPlace) return; // 인적이 드문 곳에서는 경비병과 마주칠 일이 없다

  const disg = S.stats?.disg || 10; // 은신 스탯이 높을수록 발각 회피
  let encounterChance = Math.max(0.03, 0.25 - disg*0.01); // 최소 3%, 최대 25%
  // [레벨대 배치] 이 장소의 "격"에 비해 캐릭터 레벨이 한참 낮으면(예: 아직
  // 저레벨인데 수도에서 나쁜 짓을 시도) 경비 수준도 그만큼 높고 촘촘해서
  // 훨씬 쉽게 들킨다 — 하드하게 막는 대신, 발각 확률을 크게 올려서
  // "이 도시에서 나쁜 짓을 하기엔 아직 약하다"는 자연스러운 억제력을 만든다.
  const _band4Arrest = (typeof getLocationLevelBand==='function') ? getLocationLevelBand(loc) : null;
  const _playerLv4Arrest = (typeof loadPlayerLevel==='function') ? (loadPlayerLevel()||1) : 1;
  const _underLevelGap = _band4Arrest ? Math.max(0, _band4Arrest[0] - _playerLv4Arrest) : 0;
  if(_underLevelGap > 0) encounterChance = Math.min(0.9, encounterChance + _underLevelGap*0.03);
  if(Math.random() >= encounterChance) return;

  // [신규] 즉시 체포가 아니라 경비병을 실제 전투 대상으로 등록하고,
  // 플레이어에게 싸움/항복/도주 중 하나를 선택할 상황을 만든다.
  // [레벨대 배치] 발각될 경우 맞서는 경비병도 이 장소의 격에 맞게 나온다 —
  // 실제 악명(infamy)과 "이 장소가 요구하는 최소 격" 중 더 높은 쪽을 써서,
  // 저레벨로 고급 지역에서 사고 치면 감당하기 버거운 경비대와 마주치게 된다.
  const infamy = (typeof getInfamyLevel==='function') ? getInfamyLevel() : 0;
  const _locFloorInfamy = _band4Arrest ? Math.max(0, (_band4Arrest[0]-1) * 1.2) : 0;
  const tier = getGuardTierForInfamy(Math.max(infamy, _locFloorInfamy));
  const guardCount = tier.count;
  const lv = tier.lvMin + Math.floor(Math.random()*(tier.lvMax-tier.lvMin+1));
  const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
  const baseName = tier.names[Math.floor(Math.random()*tier.names.length)];
  const groupName = guardCount > 1 ? `${baseName}×${guardCount}` : baseName;
  if(monsters.find(m => m.name === groupName && m.status==='alive')) return;

  const hpEach = Math.round(40 + lv*9);
  const atkEach = Math.round(8 + lv*1.6);
  monsters.push({
    id: 'guard_encounter_'+Date.now(),
    name: groupName, icon: tier.icon,
    hp: hpEach*guardCount, maxHp: hpEach*guardCount,
    count: guardCount, hpEach,
    atk: Math.round(atkEach*Math.sqrt(guardCount)), atkEach,
    def: Math.max(1, Math.floor(lv*0.4)), level: lv,
    status: 'alive', isBoss: tier.minInfamy>=70, isNamed: tier.minInfamy>=50, isGroup: guardCount>1,
    isGuardEncounter: true, guardTier: tier.minInfamy,
  });
  if(typeof saveMonsters==='function') saveMonsters(monsters);
  if(typeof renderMonsters==='function') renderMonsters();
  S._inCombat = true;
  S._guardEncounterActive = true;

  toast(`${groupName}이(가) 당신을 알아보고 다가온다!`, 4000, tier);
  S._nextInjectedContext = (S._nextInjectedContext||'') +
    `\n\n[${tier.icon} 경비병 조우 — 체포 시도, 등급: ${baseName} (악명 ${tier.minInfamy}+)] ${tier.desc} (Lv.${lv} 상당, ${guardCount}명) 이것은 즉시 체포가 아니라 대치 상황이다 — 이 등급에 걸맞은 위협감과 전투력으로 묘사하라(낮은 등급은 다소 미숙하고 절차적으로, 높은 등급일수록 숙련되고 위협적으로). 플레이어가 다음 중 무엇을 하든 자연스럽게 받아들여라:\n• 싸운다 — 일반 전투로 진행하라. 플레이어가 패배하거나 제압당하면(enemy_incap 등으로 처리되는 일반 흐름과 같다) <gs>{"arrest_outcome":"captured"}</gs>를 출력하라.\n• 항복한다(무기를 내려놓거나 순순히 따라간다고 명확히 밝히면) — 전투 없이 곧장 체포되는 것으로 처리하고 <gs>{"arrest_outcome":"surrendered"}</gs>를 출력하라.\n• 도망친다 — 도주 시도로 처리하고 결과를 <gs>{"arrest_outcome":"fled","success":true 또는 false}</gs>로 출력하라. 성공하면 그 자리를 벗어나지만 수배는 그대로 유지된다.\n경비병/순찰대를 쓰러뜨리고 싸움에서 이기면(경비병이 전투불능/사망 처리되면) <gs>{"arrest_outcome":"won_fight"}</gs>를 출력하라 — 이 경우 체포되지 않지만 공무 집행 방해로 악명이 크게 오른다는 것을 서사에 반영해도 좋다. 처형부대급(악명 70+)을 상대로 승리하면 그 자체로 전설적인 사건임을 서사에 반영하라.`;
}
window.checkArrestCondition = checkArrestCondition;

window.checkArrestCondition = checkArrestCondition;

export function executeArrest(opts={}){
  try{
    const jail = loadJailState();
    if(jail.jailed) return;
    const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    if(!loc) return;

    // [신규] 신분별 체포 면책 — 기존엔 신분의 privilege 텍스트에 "면책",
    // "치외법권" 같은 설명이 있어도 실제 체포 판정에는 전혀 반영되지
    // 않았다. 고위 신분(귀족 이상)은 일정 확률로 "신분을 내세워" 그
    // 자리에서 풀려난다 — 항복/싸움과는 별개의 세 번째 결말이다.
    const mech = (typeof getSocialRankMechanics==='function') ? getSocialRankMechanics() : { arrestImmunity:0 };
    if(!opts.skipImmunityCheck && (mech.arrestImmunity||0) > 0 && Math.random() < mech.arrestImmunity){
      S._inCombat = false;
      S._guardEncounterActive = false;
      const rankName = S.character?.socialRank || '높은 신분';
      toast(`📜 ${rankName}의 신분을 내세워 체포를 면했다.`, 3500);
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n\n[📜 신분으로 체포 면제] 플레이어가 ${rankName}임을 밝히자, 경비병들이 당황하며 한 발 물러선다 — 신분이 체포를 막아준 것이다. 다만 이 일이 알려지면 평판이나 정치적 입지에 영향을 줄 수 있다는 여지를 서사에 남겨도 좋다.`;
      return;
    }

    const infamy = (typeof getInfamyLevel==='function') ? getInfamyLevel() : 0;
    const isMaxSec = infamy >= 40;

    jail.jailed = true;
    jail.jailedAt = S.msgCount||0;
    jail.tier = isMaxSec ? 'maxsec' : 'local';
    jail.location = isMaxSec ? (MAXSEC_JAIL_DEF.name) : (loc.name || '도시');
    jail.continent = loc.continent || 'central';
    jail.returnLocationId = loc.id;
    jail.returnLocationName = loc.name;
    // 형량 — 최고 보안 감옥은 형량 자체도 훨씬 길다. 순순히 항복했으면
    // 협조적이었다는 명목으로 형량을 약간 깎아준다.
    const baseSentence = isMaxSec ? (20 + Math.floor(Math.random()*30)) : (5 + Math.floor(Math.random()*15));
    let sentence = opts.surrendered ? Math.max(3, Math.round(baseSentence*0.7)) : baseSentence;
    // [신규] 신분별 형량 배율 — 노예/부랑자는 더 가혹하게, 귀족은 가볍게.
    sentence = Math.max(1, Math.round(sentence * (typeof mech.jailSentenceMod==='number' ? mech.jailSentenceMod : 1.0)));
    jail.sentenceTurns = sentence;
    if(isMaxSec) jail.maxSecHistory = (jail.maxSecHistory||0) + 1;
    saveJailState(jail);
    S._inCombat = false;
    S._guardEncounterActive = false;

    if(isMaxSec){
      const deathRowRisk = infamy >= 70;
      jail.deathRowRisk = deathRowRisk;
      saveJailState(jail);
      toast(`⛓️ 악명이 너무 높다! ${MAXSEC_JAIL_DEF.name}으로 압송된다...`, 4500);
      const inmateIntro = MAXSEC_JAIL_INMATES.map(n => `${n.icon}${n.name}(${n.title})`).join(', ');
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n\n[⛓️ 최고 보안 감옥 압송] 체포된 플레이어는 거듭된 악행으로 악명이 너무 높아, 지방 감옥이 아니라 대륙 전역에서 가장 악명 높은 죄수들이 모이는 중앙대륙의 최고 보안 감옥 "${MAXSEC_JAIL_DEF.name}"으로 압송된다. 압송 과정 자체를 무겁고 상징적인 장면으로 묘사하라. 이 감옥에는 고정 수감자 ${inmateIntro}가 있다.${deathRowRisk ? ' 죄질이 특히 무거워, 형기가 끝나면 사형 여부를 가리는 재판이 열릴 것이라는 불안감을 깔아두어라.' : ''}`;
    } else {
      toast(opts.surrendered ? `🔒 순순히 항복해 ${jail.location}에 수감된다.` : `🔒 ${jail.location}에서 체포됐다! 감옥에 수감된다.`, 4000);
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n\n[🔒 수감] 플레이어가 ${opts.surrendered ? '순순히 항복해' : '경비병과의 충돌에서 제압당해'} 감옥에 수감됐다. 이후 감옥 안에서의 상황을 서사로 시작하라. 플레이어가 탈출을 시도하면 jail_escape_attempt GS로 결과를 알려라. 악명이 계속 높아지면 다음엔 중앙대륙의 최고 보안 감옥으로 압송될 수 있음을 암시해도 좋다.`;
    }

    try{
      if(typeof window.getAllLocations==='function' && typeof saveCurrentLocation==='function'){
        const allLocs = window.getAllLocations();
        const jailLoc = allLocs.find(l => l.id === 'loc_jail');
        if(jailLoc){
          window.currentLocation = jailLoc;
          saveCurrentLocation(jailLoc);
          if(typeof renderLocationPanel==='function') renderLocationPanel();
        }
      }
    }catch(e){ console.warn('[감옥 장소 전환 실패]', e); }
  }catch(e){ console.warn('[executeArrest]', e); }
}
window.executeArrest = executeArrest;

window.executeArrest = executeArrest;

export function processArrestOutcome(gs){
  try{
    if(!gs?.arrest_outcome) return;
    const outcome = gs.arrest_outcome;
    if(outcome === 'captured' || outcome === 'surrendered'){
      executeArrest({ surrendered: outcome === 'surrendered' });
    } else if(outcome === 'fled'){
      const success = typeof gs.success === 'boolean' ? gs.success : true;
      S._guardEncounterActive = false;
      if(success){
        S._inCombat = false;
        // 경비병 조우 제거(따돌렸으므로 더 이상 전투 대상 아님)
        const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
        monsters.forEach(m => { if(m.isGuardEncounter && m.status==='alive') m.status = 'fled_from'; });
        if(typeof saveMonsters==='function') saveMonsters(monsters);
        if(typeof renderMonsters==='function') renderMonsters();
        toast('🏃 경비병을 따돌리고 도망쳤다. 수배 상태는 여전하다.', 3000);
      } else {
        toast('💨 도망치려 했지만 따라잡혔다...', 2500);
        // 도주 실패는 자동으로 체포까지 가지 않고, 다시 전투/항복 기로에 놓이게 둔다.
      }
    } else if(outcome === 'won_fight'){
      S._inCombat = false;
      S._guardEncounterActive = false;
      // 공무 집행 방해 + 폭력 — 악명에 직접 영향을 주는 ws.evilActs를 더 크게 올린다.
      try{
        const ws = (typeof loadWorldState==='function') ? loadWorldState() : {};
        ws.evilActs = (ws.evilActs||0) + 8; // 일반 악행(+1)보다 훨씬 큰 가중치
        if(typeof saveWorldState==='function') saveWorldState(ws);
      }catch(e){}
      toast('⚔️ 경비병을 제압했다! 체포는 면했지만 악명이 크게 올랐다.', 3500);
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n\n[⚠️ 공무 집행 방해] 경비병을 상대로 승리했다 — 체포는 면했지만 이 일이 알려지며 악명이 크게 오르고, 더 강한 병력이나 현상금 사냥꾼이 다음엔 출동할 수 있다.`;
    }
  }catch(e){ console.warn('[processArrestOutcome]', e); }
}
window.processArrestOutcome = processArrestOutcome;

window.processArrestOutcome = processArrestOutcome;

export const BOUNTY_KEY = 'tf-bounty';

export function loadBounty(){ try{ return JSON.parse(lsGet(BOUNTY_KEY)||'{}'); }catch(e){ return {}; } }
window.loadBounty = loadBounty;

export function saveBounty(d){ try{ lsSet(BOUNTY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveBounty = saveBounty;

export const BOUNTY_INFAMY_THRESHOLD = 20;

export function updateBountyFromInfamy(){
  try{
    if(!S || !S.character) return;
    const rankId = S.character.socialRankId || 'commoner';
    if(rankId !== 'outlaw') { 
      // 무법자 신분을 벗어나면(사면 등) 현상금도 자동 소멸
      const b = loadBounty();
      if(b.amount) { b.amount = 0; saveBounty(b); }
      return;
    }
    const infamy = (typeof getInfamyLevel==='function') ? getInfamyLevel() : 0;
    const b = loadBounty();
    if(infamy < BOUNTY_INFAMY_THRESHOLD){
      if(b.amount){ b.amount = 0; saveBounty(b); }
      return;
    }
    // 악명 20→현상금 약 500골드, 악명 100→약 20000골드 (지수적 증가로
    // 후반 악명이 진짜 위협적으로 느껴지게 함)
    const newAmount = Math.round(Math.pow(infamy - BOUNTY_INFAMY_THRESHOLD + 5, 2.1) * 3);
    if(newAmount > (b.amount||0)){
      const increased = !b.amount;
      b.amount = newAmount;
      b.lastUpdated = S.msgCount||0;
      saveBounty(b);
      if(increased) toast(`📜 현상금이 걸렸다! ${newAmount}골드 — 현상금 사냥꾼들이 당신을 노릴 것이다.`, 4000);
    }
  }catch(e){ console.warn('[updateBountyFromInfamy]', e); }
}
window.updateBountyFromInfamy = updateBountyFromInfamy;

window.updateBountyFromInfamy = updateBountyFromInfamy;

window.loadBounty = loadBounty;

export function checkBountyHunterEncounter(){
  try{
    if(!S || !S.character) return;
    if(S._inCombat) return; // 이미 전투 중이면 새로 등장시키지 않음
    const jail = (typeof loadJailState==='function') ? loadJailState() : {};
    if(jail.jailed) return; // 수감 중엔 사냥꾼이 못 찾아옴
    const b = loadBounty();
    if(!b.amount || b.amount <= 0) return;

    // 현상금 액수에 비례한 등장 확률 (최대 12%/턴) — 너무 자주 뜨면
    // 피곤해지므로 상한을 둔다.
    const chance = Math.min(0.12, b.amount / 150000);
    if(Math.random() > chance) return;

    // 현상금 액수에 비례한 레벨 — 액수가 클수록 더 강한 사냥꾼이 옴
    const hunterLevel = Math.min(120, 15 + Math.floor(b.amount / 800));
    const hp  = Math.round(40 + hunterLevel*9);
    const atk = Math.round(8 + hunterLevel*1.6);
    const def = Math.max(1, Math.floor(hunterLevel*0.45));
    const name = BOUNTY_HUNTER_NAMES[Math.floor(Math.random()*BOUNTY_HUNTER_NAMES.length)];

    const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
    if(monsters.find(m => m.name===name && m.status==='alive')) return;
    monsters.push({
      id: 'bounty_hunter_'+Date.now(),
      name, icon: '🎯',
      hp, maxHp: hp, atk, def, level: hunterLevel,
      status: 'alive', isBoss: b.amount >= 10000, isNamed: true, isGroup:false,
      isBountyHunter: true,
    });
    if(typeof saveMonsters==='function') saveMonsters(monsters);
    if(typeof renderMonsters==='function') renderMonsters();
    S._inCombat = true;
    toast(`🎯 현상금 사냥꾼 ${name}이(가) 나타났다! (현상금 ${b.amount}골드를 노린다)`, 4000);
    S._nextInjectedContext = (S._nextInjectedContext||'') +
      `\n\n[🎯 현상금 사냥꾼 등장] ${b.amount}골드의 현상금을 노리는 현상금 사냥꾼 "${name}"이(가) 플레이어를 찾아내 나타났다. 이 인물을 능력 있고 위협적인 전문 사냥꾼으로 묘사하라(레벨 ${hunterLevel} 상당). 전투 또는 협상(매수·설득)으로 이어질 수 있다.`;
  }catch(e){ console.warn('[checkBountyHunterEncounter]', e); }
}
window.checkBountyHunterEncounter = checkBountyHunterEncounter;

window.checkBountyHunterEncounter = checkBountyHunterEncounter;

export const BOUNTY_BOARD_KEY = 'tf-bounty-board';

export function loadBountyBoard(){ try{ return JSON.parse(lsGet(BOUNTY_BOARD_KEY)||'[]'); }catch(e){ return []; } }
window.loadBountyBoard = loadBountyBoard;

export function saveBountyBoard(d){ try{ lsSet(BOUNTY_BOARD_KEY, JSON.stringify(d)); }catch(e){} }
window.saveBountyBoard = saveBountyBoard;

export function refreshBountyBoard(){
  try{
    const npcs = (typeof loadNPCs==='function') ? (loadNPCs()||[]) : [];
    const hostiles = npcs.filter(n => (n.relationship||50) < 25);
    const board = loadBountyBoard();
    const boardNames = new Set(board.map(b=>b.name));
    let added = 0;
    hostiles.forEach(n => {
      if(boardNames.has(n.name)) return;
      if(added >= 3) return; // 한 번에 너무 많이 추가하지 않음
      const severity = 50 - (n.relationship||50); // 0~75 정도
      const amount = Math.round(200 + severity * 40 + Math.random()*300);
      board.push({ name:n.name, icon:n.icon||'👤', amount, role:n.role||'', claimed:false, addedAt: S?.msgCount||0 });
      added++;
    });
    if(added>0) saveBountyBoard(board);
    return board;
  }catch(e){ return loadBountyBoard(); }
}
window.refreshBountyBoard = refreshBountyBoard;

window.refreshBountyBoard = refreshBountyBoard;

export function huntBountyTarget(name){
  try{
    const board = loadBountyBoard();
    const target = board.find(b => b.name === name && !b.claimed);
    if(!target){ toast('해당 수배자를 찾을 수 없습니다', 1800); return; }
    if(typeof processNpcTurnsHostileGS==='function'){
      processNpcTurnsHostileGS({ npc_turns_hostile:[{ name: target.name, reason:'현상금 사냥' }] });
    }
    toastHTML(`🎯 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(target,{size:14}):(target.icon)} ${esc(target.name)}을(를) 추적해 전투를 시작한다! (현상금 ${esc(target.amount)}골드)`, 3000);
  }catch(e){ console.warn('[huntBountyTarget]', e); }
}
window.huntBountyTarget = huntBountyTarget;

window.huntBountyTarget = huntBountyTarget;

export function claimBountyIfMatched(npcName){
  try{
    const board = loadBountyBoard();
    const target = board.find(b => b.name === npcName && !b.claimed);
    if(!target) return;
    target.claimed = true;
    saveBountyBoard(board);
    S.gold = (S.gold||0) + target.amount;
    if(typeof saveGold==='function') saveGold(S.gold);
    if(typeof window.updateHeader==='function') window.updateHeader();
    toast(`💰 수배자 ${target.name} 처치! 현상금 ${target.amount}골드 획득`, 3500);
  }catch(e){ console.warn('[claimBountyIfMatched]', e); }
}
window.claimBountyIfMatched = claimBountyIfMatched;

window.claimBountyIfMatched = claimBountyIfMatched;

export function returnFromJail(jail){
  try{
    if(typeof window.getAllLocations!=='function' || typeof saveCurrentLocation!=='function') return;
    const allLocs = window.getAllLocations(); // 이 시점엔 이미 jail.jailed=false라 'loc_jail'은 빠짐
    let backLoc = allLocs.find(l => l.id === jail.returnLocationId);
    if(!backLoc){
      // 폴백: 이름으로 재시도, 그래도 없으면 첫 번째 장소(보통 시작 마을)
      backLoc = allLocs.find(l => l.name === jail.returnLocationName) || allLocs[0];
    }
    if(backLoc){
      window.currentLocation = backLoc;
      saveCurrentLocation(backLoc);
      if(typeof renderLocationPanel==='function') renderLocationPanel();
    }
  }catch(e){ console.warn('[returnFromJail]', e); }
}
window.returnFromJail = returnFromJail;

export function processJailEscapeAttempt(gs){
  try{
    if(!gs?.jail_escape_attempt) return;
    const jail = loadJailState();
    if(!jail.jailed) return;
    const success = typeof gs.jail_escape_attempt === 'object' ? gs.jail_escape_attempt.success : !!gs.jail_escape_attempt;
    if(success){
      jail.jailed = false;
      saveJailState(jail);
      toast('🏃 감옥을 탈출했다! 다시 자유의 몸이 됐다.', 3500);
      returnFromJail(jail);
    } else {
      jail.sentenceTurns = (jail.sentenceTurns||10) + 5; // 탈출 실패 시 형량 추가
      saveJailState(jail);
      toast('⛓️ 탈출 실패! 형량이 늘어났다.', 3000);
    }
  }catch(e){ console.warn('[jail_escape_attempt]', e); }
}
window.processJailEscapeAttempt = processJailEscapeAttempt;

window.processJailEscapeAttempt = processJailEscapeAttempt;

export function tickJailSentence(){
  try{
    const jail = loadJailState();
    if(!jail.jailed) return;
    const served = (S.msgCount||0) - (jail.jailedAt||0);
    if(served >= (jail.sentenceTurns||10)){
      // [신규] 사형 위기(deathRowRisk) 상태면 형기가 끝나도 즉시 석방이
      // 아니라 재판 단계로 들어간다 — 진짜 생사가 걸린 순간이므로 시스템이
      // 갑자기 처형해버리지 않고, 먼저 플레이어에게 알리고 최후 변론/탈출
      // 시도 기회를 1번 더 준다. 그 기회 이후에도 처리 안 되면 판결이 난다.
      if(jail.deathRowRisk && !jail.onTrial){
        jail.onTrial = true;
        jail.trialAt = S.msgCount||0;
        saveJailState(jail);
        toast('⚖️ 형기가 끝났다... 그러나 죄질이 무거워 사형 여부를 가리는 재판이 열린다.', 5000);
        S._nextInjectedContext = (S._nextInjectedContext||'') +
          `\n\n[⚖️ 사형 재판] 형기가 끝났지만, 죄질이 너무 무거워 단순 석방이 아니라 사형 여부를 가리는 재판이 열렸다. 이 장면을 무겁고 진지하게 묘사하라 — 판사, 증인, 군중, 혹은 침묵하는 법정. 플레이어에게 최후 변론이나 행동의 기회를 줘라(선처를 구하거나, 정당함을 주장하거나, 마지막으로 탈출을 시도하거나). 이 재판 중 또는 그 직후 탈출을 시도하면 jail_escape_attempt GS로 알려라. 플레이어가 아무 행동도 하지 않거나 변론이 효과가 없으면, 몇 턴 안에 판결이 날 것이다.`;
        return;
      }
      // 재판 중인데 일정 턴(3턴) 안에 탈출도 못 하고 그대로 흘러가면
      // 시스템이 최종 판결을 내린다 — 악명이 높을수록 처형 확률도 높다.
      if(jail.onTrial){
        const sinceTrial = (S.msgCount||0) - (jail.trialAt||0);
        if(sinceTrial >= 3){
          const infamy = (typeof getInfamyLevel==='function') ? getInfamyLevel() : 0;
          // 악명 70=약 35% 처형 확률, 100=약 65% — 무겁지만 절대적이진 않음
          const executionChance = Math.min(0.65, (infamy-40) * 0.011);
          if(Math.random() < executionChance){
            // [신규] 진짜 사형 집행 — 기존 HP=0 게임오버 경로를 그대로
            // 타게 만들어, 사망 처리(deathCount, 업적, 사인 기록 등)가
            // 일관되게 일어나도록 한다. 별도의 사형 전용 게임오버 로직을
            // 새로 만들지 않고 기존 흐름에 편입시키는 게 가장 안전하다.
            jail.jailed = false;
            jail.executed = true;
            saveJailState(jail);
            S.stats.hp = 0;
            toast('⚰️ 재판부는 사형을 선고했다. 형이 집행된다...', 6000);
            S._nextInjectedContext = (S._nextInjectedContext||'') +
              `\n\n[⚰️ 사형 집행] 재판부는 사형을 선고했고, 형이 집행됐다. 이것은 진짜 죽음이다 — 되돌릴 수 없는 결말로서 무게 있게 묘사하라(처형 장면, 마지막 순간의 심경, 군중의 반응 등). 가볍게 다루지 마라.`;
            if(typeof recordPlayerDeathCause==='function') recordPlayerDeathCause('사형 집행', '재판에서 사형을 선고받음', '');
          } else {
            // 항소/감형 — 사형은 면했지만 형기가 크게 늘어난다(종신형 느낌)
            jail.onTrial = false;
            jail.deathRowRisk = false;
            jail.sentenceTurns = (jail.sentenceTurns||10) + 25;
            jail.jailedAt = S.msgCount||0; // 형기 카운트 재시작
            saveJailState(jail);
            toast('⚖️ 재판부는 사형 대신 종신형에 가까운 중형을 선고했다.', 4500);
            S._nextInjectedContext = (S._nextInjectedContext||'') +
              `\n\n[⚖️ 감형] 사형은 면했지만, 훨씬 무거운 형벌(거의 종신형)이 선고됐다. 안도와 동시에 길고 긴 수감 생활이 남았다는 무게감을 서사에 담아라.`;
          }
        }
        return;
      }
      jail.jailed = false;
      saveJailState(jail);
      toast('⛓️ 형기를 마치고 석방됐다.', 3500);
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n\n[🔓 석방] 형기를 마치고 감옥에서 풀려났다. 자유를 되찾은 순간을 짧게 서사화하라.`;
      returnFromJail(jail);
    }
  }catch(e){}
}
window.tickJailSentence = tickJailSentence;

window.tickJailSentence = tickJailSentence;

window.loadJailState = loadJailState;

export function checkUnificationEnding(){
  if(!S || !S.character) return;
  if(lsGet('ending_unlocked_continental_unification')) return;
  if((S.msgCount||0) < 60) return; // 충분히 진행된 시점에만 체크
  try{
    const factions = (typeof getCurrentFactions==='function') ? getCurrentFactions() : {};
    const names = Object.keys(factions);
    if(names.length < 3) return; // 세력이 거의 없는 시나리오는 통일 의미가 없음
    const rep = (typeof loadFactionRep==='function') ? loadFactionRep() : {};
    const friendly = names.filter(n => (rep[n]||0) >= 60);
    const ratio = friendly.length / names.length;
    const activeWars = (typeof getActiveWars==='function') ? getActiveWars() : [];
    if(ratio >= 0.8 && activeWars.length === 0){
      if(typeof unlockEnding==='function'){
        unlockEnding('continental_unification', '대륙의 통일자');
        S._nextInjectedContext = (S._nextInjectedContext||'') +
          `\n\n[👑 대륙통일 엔딩 조건 달성] 대륙의 거의 모든 주요 세력(${friendly.length}/${names.length}개)이 플레이어와 깊은 우호 관계를 맺었고, 전쟁은 모두 가라앉았다. 분열돼 있던 세력들이 플레이어를 중심으로 하나로 모이는 역사적인 순간을 서사로 풀어내라 — 대관식, 동맹 선언, 혹은 그에 준하는 통일의 상징적 장면을 묘사하라.`;
        // [버그 수정] 이 함수는 매 턴 호출되는데 위쪽의 lsGet 가드 키에
        // 아무도 lsSet을 하지 않아 한번 조건이 충족되면 이후 모든 턴마다
        // (unlockEnding 자체는 중복 방지되지만) 이 통일 서사 지시문이
        // AI 프롬프트에 영원히 반복 주입되고 있었다 — 여기서 가드를 설정해
        // 최초 1회만 발동하도록 한다.
        lsSet('ending_unlocked_continental_unification', '1');
      }
    }
  }catch(e){ console.warn('[checkUnificationEnding]', e); }
}
window.checkUnificationEnding = checkUnificationEnding;

window.checkUnificationEnding = checkUnificationEnding;

export function checkDreamEvent(){ /* checkDreamTrigger(이미 구현됨)와 별개 — 안전 스텁 */ }
window.checkDreamEvent = checkDreamEvent;

window.checkDreamEvent = checkDreamEvent;

export function checkNpcSpecialEvents(){
  if(!S || !S.character) return;
  if(Math.random() > 0.12) return; // 턴당 12%로 제한 — 너무 자주 뜨면 잡음
  try{
    const npcData = (typeof pmLoad==='function') ? pmLoad('npc') : {};
    const names = Object.keys(npcData);
    if(!names.length) return;
    const curTurn = S.msgCount||0;
    const fired = (typeof loadGSFlags==='function') ? loadGSFlags() : {};

    // ① 고백 이벤트
    const romance = (typeof loadRomance==='function') ? loadRomance() : {};
    for(const name of names){
      const r = romance[name];
      if(!r || (r.stage||0) < 4) continue; // 연인 단계 미달
      const flagKey = 'npc_confession_'+name;
      if(fired[flagKey]) continue;
      if(typeof saveGSFlags==='function') saveGSFlags({[flagKey]: true});
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n\n[💕 NPC 특수 이벤트 — 고백] ${name}과(와)의 관계가 연인 단계에 이르렀다. 지금까지 쌓인 감정을 더 미루지 않고, ${name}이(가) 먼저 마음을 고백하거나 플레이어가 고백할 자연스러운 분위기를 이번 장면에 만들어라. 억지스럽지 않게, 지금까지의 대화·사건들을 돌아보는 진심 어린 장면으로 풀어내라.`;
      return; // 한 턴에 하나만
    }

    // ② 배신 결렬 이벤트
    for(const name of names){
      const n = npcData[name];
      if(!n?.betrayals?.length) continue;
      const lastBetrayal = n.betrayals[n.betrayals.length-1];
      const turnsSince = curTurn - (lastBetrayal.turn||0);
      // 배신 후 15턴 이상 지났는데도 관계가 회복되지 않았다면(20 미만) 결렬
      if(turnsSince >= 15 && (n.rel||50) < 20){
        const flagKey = 'npc_breakup_'+name;
        if(fired[flagKey]) continue;
        if(typeof saveGSFlags==='function') saveGSFlags({[flagKey]: true});
        S._nextInjectedContext = (S._nextInjectedContext||'') +
          `\n\n[💔 NPC 특수 이벤트 — 관계 결렬] ${name}은(는) 과거의 배신("${lastBetrayal.text||''}")을 끝내 극복하지 못했다. 더 이상 관계를 회복할 의지가 없다는 것을 분명히 밝히는 장면을 만들어라 — 차갑게 선을 긋거나, 마지막으로 실망을 토로하거나, 완전히 등을 돌리는 결정적인 장면으로.`;
        return;
      }
    }

    // ③ 약속 추궁 이벤트
    for(const name of names){
      const n = npcData[name];
      if(!n?.promises?.length) continue;
      const openPromise = n.promises.find(p => p.fulfilled === null && (curTurn - (p.turn||0)) >= 30);
      if(!openPromise) continue;
      const flagKey = 'npc_promise_confront_'+name+'_'+(openPromise.turn||0);
      if(fired[flagKey]) continue;
      if(typeof saveGSFlags==='function') saveGSFlags({[flagKey]: true});
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n\n[📌 NPC 특수 이벤트 — 약속 추궁] ${name}이(가) 오래전 플레이어가 한 약속("${openPromise.text||''}")을 아직 기억하고 있다. 마침 만났다면 그 약속을 직접 상기시키거나 은근히 떠올리게 하는 대화를 자연스럽게 끼워넣어라. 플레이어가 약속을 지키는지 어기는지에 따라 이후 신뢰가 크게 갈릴 수 있음을 암시하라.`;
      return;
    }
  }catch(e){ console.warn('[checkNpcSpecialEvents]', e); }
}
window.checkNpcSpecialEvents = checkNpcSpecialEvents;

window.checkNpcSpecialEvents = checkNpcSpecialEvents;

export function clearTempBoosts(){
  try{
    if(!S._tempBoosts) return;
    // setTimeout 누락 대비 — 일정 시간(턴 1회분) 이상 지난 보너스는 강제 정리하지 않고
    // 실제 만료는 각 보너스의 setTimeout에 맡김 (여기선 빈 객체 초기화만 보장)
    if(Object.keys(S._tempBoosts).length === 0) S._tempBoosts = {};
  }catch(e){}
}
window.clearTempBoosts = clearTempBoosts;

window.clearTempBoosts = clearTempBoosts;

export function tickEquipDurability(){
  try{
    const isInCombat = (typeof loadMonsters==='function') && (loadMonsters()||[]).some(m=>m.status==='alive');
    if(!isInCombat || !S.equipped) return;
    let changed = false;
    Object.values(S.equipped).forEach(item => {
      if(!item) return;
      if(item._durability === undefined) item._durability = 100;
      item._durability = Math.max(0, item._durability - 1);
      changed = true;
      if(item._durability === 20){
        toast(`⚠️ ${item.name} 내구도 위험 (20%)`, 2500);
      }
    });
    if(changed && typeof saveSession === 'function') saveSession();
  }catch(e){ console.warn('[tickEquipDurability]', e); }
}
window.tickEquipDurability = tickEquipDurability;

window.tickEquipDurability = tickEquipDurability;

export const EVENT_LOG_KEY = 'tf-event-log';

export function addEventLog(text){
  try{
    const log = (()=>{ try{ return JSON.parse(lsGet(EVENT_LOG_KEY)||'[]'); }catch(e){ return []; } })();
    log.push({ text, turn: S.msgCount||0, at: Date.now() });
    if(log.length > 200) log.splice(0, log.length-200);
    lsSet(EVENT_LOG_KEY, JSON.stringify(log));
  }catch(e){ console.warn('[addEventLog]', e); }
}
window.addEventLog = addEventLog;

window.addEventLog = addEventLog;

export function showBattleResultSummary(battleResult){
  try{
    if(!battleResult) return;
    const labelMap = { crit_success:'💥 대성공', success:'✅ 성공', fail:'❌ 실패', crit_fail:'💀 대실패' };
    const label = labelMap[battleResult.result] || '';
    const parts = [label];
    if(battleResult.hpChange) parts.push(`HP ${battleResult.hpChange>0?'+':''}${battleResult.hpChange}`);
    if(battleResult.goldChange) parts.push(`Gold ${battleResult.goldChange>0?'+':''}${battleResult.goldChange}`);
    if(battleResult.skill) parts.push(`(${battleResult.skill})`);
    if(parts.filter(Boolean).length > 1) toast(parts.filter(Boolean).join(' '), 1800);
  }catch(e){ console.warn('[showBattleResultSummary]', e); }
}
window.showBattleResultSummary = showBattleResultSummary;

window.showBattleResultSummary = showBattleResultSummary;

export function recoverPartialCombatGS(rawGsText){
  try{
    if(!rawGsText) return;
    const dmgMatch = rawGsText.match(/"hp"\s*:\s*(-?\d+)/);
    if(dmgMatch && S.stats){
      S.stats.hp = Math.max(0, Math.min(S.stats.maxHp||999, (S.stats.hp||100) + parseInt(dmgMatch[1],10)));
      if(typeof window.updateHeader==='function') window.updateHeader();
    }
  }catch(e){}
}
window.recoverPartialCombatGS = recoverPartialCombatGS;

window.recoverPartialCombatGS = recoverPartialCombatGS;

export function tickTimedQuests(){ /* 시간제한 퀘스트 시스템 미구현 — 안전 스텁 */ }
window.tickTimedQuests = tickTimedQuests;

window.tickTimedQuests = tickTimedQuests;

export function buildTimedQuestContext(){ return ''; }
window.buildTimedQuestContext = buildTimedQuestContext;

window.buildTimedQuestContext = buildTimedQuestContext;

export function collectSceneData(){ /* tf-scene-stats(collectTurnData)가 이미 동일 역할 수행 */ }
window.collectSceneData = collectSceneData;

window.collectSceneData = collectSceneData;

export function checkStaleCollectedData(){
  try{
    const cycle = (typeof loadCycleCount === 'function') ? loadCycleCount() : 0;
    const playlog = (()=>{ try{ return JSON.parse(lsGet('tf-master-playlog')||'[]'); }catch(e){ return []; } })();
    const monsterDex = (()=>{ try{ return JSON.parse(lsGet('tf-discovered-monsters')||'[]'); }catch(e){ return []; } })();

    // 누적 데이터가 거의 없으면(진짜 첫 실행) 아무것도 안 물어봄
    if(cycle === 0 && playlog.length < 5 && monsterDex.length === 0) return;
    if(document.getElementById('stale-data-modal')) return; // 중복 표시 방지

    const overlay = document.createElement('div');
    overlay.id = 'stale-data-modal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;padding:20px';
    overlay.innerHTML = `
      <div style="background:#0a0805;border:1px solid var(--gold);border-radius:4px;max-width:380px;padding:20px">
        <div style="font-family:'Cinzel',serif;font-size:13px;color:var(--gold);margin-bottom:10px;text-align:center">📦 기존 데이터 발견</div>
        <div style="font-size:11px;color:var(--text);line-height:1.7;margin-bottom:14px">
          이 기기에 이전 플레이 기록이 남아있습니다:<br>
          · 환생 회차: <b>${cycle}회</b><br>
          · 누적 플레이 턴: <b>${playlog.length}건</b><br>
          · 발견한 몬스터: <b>${monsterDex.length}종</b><br><br>
          새로 시작하는 캐릭터에 이 기록이 영향을 줄 수 있습니다. 어떻게 할까요?
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button onclick="document.getElementById('stale-data-modal').remove()" style="padding:10px;background:var(--bg-bubble-ai);border:1px solid var(--border);color:var(--text);font-size:10px;cursor:pointer;border-radius:2px">
            이어서 쌓기 (회차·도감 등 유지)
          </button>
          <button onclick="confirmFreshStart()" style="padding:10px;background:#2a1010;border:1px solid #803030;color:#e08080;font-size:10px;cursor:pointer;border-radius:2px">
            완전 초기화 후 새로 시작 (모든 기록 삭제)
          </button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }catch(e){ console.warn('[checkStaleCollectedData]', e); }
}
window.checkStaleCollectedData = checkStaleCollectedData;

window.checkStaleCollectedData = checkStaleCollectedData;

export function confirmFreshStart(){
  if(!confirm('정말로 모든 누적 기록(회차 수, 플레이 데이터, 도감 등)을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
  try{
    Object.keys(localStorage).filter(k => k.startsWith('tf-') || k.startsWith('taleforge')).forEach(k => localStorage.removeItem(k));
  }catch(e){}
  document.getElementById('stale-data-modal')?.remove();
  toast('🆕 모든 데이터가 초기화됐습니다', 2500);
}
window.confirmFreshStart = confirmFreshStart;

window.confirmFreshStart = confirmFreshStart;

export function seekOutHero(){
  try{
    const hero = (typeof getNPCHero === 'function') ? getNPCHero() : null;
    if(!hero){ toast('이 세계에는 알려진 용사가 없습니다', 2500); return; }

    // [버그 수정] aidenInParty와 동일한 기준(명확한 GS 플래그)으로 통일 —
    // relationship 기반 모호한 체크 대신 aiden_joined/aiden_left 플래그 사용
    const gsF = (typeof loadGSFlags === 'function') ? loadGSFlags() : {};
    const isWithHero = !gsF['aiden_left'] && !!gsF['aiden_joined'];

    let prompt;
    if(isWithHero){
      prompt = `${hero.name}에게 다가가 지금 상황에 대해 이야기를 나눈다.`;
    } else {
      const state = (typeof loadNPCHeroState === 'function') ? loadNPCHeroState() : {};
      if(state.concluded){
        prompt = `${hero.name}에 대한 최근 소식을 수소문해본다.`;
      } else {
        // [신규] 거리감 반영 — 현재 진행 단계의 region을 찾아 명확히 알려줌으로써
        // AI가 "마침 근처에 있었다"로 즉시 만남을 퉁치지 않고, 거리에 따라
        // 수소문만 가능한지(먼 지역) 실제로 찾아갈 여정이 필요한지를 판단하게 함.
        const completedFlags = Object.keys(state).filter(k => state[k] === true);
        let currentRegion = 'unknown';
        for(const step of (hero.progressSteps||[])){
          if(completedFlags.includes(step.flag)) currentRegion = step.region || 'unknown';
        }
        const regionLabel = { unknown:'행방이 불분명한 곳', frontier:'변경 전선', capital:'왕도 근처', demon_realm:'마계 인근(매우 먼 곳)' }[currentRegion] || '먼 곳';
        if(currentRegion === 'unknown'){
          prompt = `${hero.name}의 행방을 수소문해본다. (현재 정확한 위치는 알려지지 않음 — 소문 정도만 들을 수 있을 것이다)`;
        } else {
          prompt = `${hero.name}이(가) 현재 ${regionLabel}에 있다는 소식을 들었다. 직접 만나려면 그곳까지 가야 하는데, 지금 당장 그렇게 할지 고민하며 행방을 수소문해본다.`;
        }
      }
    }
    if(typeof sendMsg === 'function') sendMsg(prompt, false);
  }catch(e){ console.warn('[seekOutHero]', e); }
}
window.seekOutHero = seekOutHero;

window.seekOutHero = seekOutHero;

export function seekOutSilver(){
  try{
    const discovery = (typeof loadSealDiscovery === 'function') ? loadSealDiscovery() : {};
    const undiscovered = (typeof SEAL_DEFINITIONS !== 'undefined') ? Object.keys(SEAL_DEFINITIONS).filter(k => !discovery[k]) : [];
    if(!undiscovered.length){
      toast('실버: "이미 다 아시는군요. 더 팔 게 없습니다."', 3000);
      return;
    }
    const price = (typeof getSilverSealPrice === 'function') ? getSilverSealPrice() : 800;
    if((S.gold||0) < price){
      // 골드가 부족하면 그냥 만나는 장면만 자유 서사로 — 구매는 다음에
      if(typeof sendMsg === 'function') sendMsg('회색 외투를 두른 정보상 실버를 찾아 말을 건다. 봉인석에 대해 아는 게 있는지 묻는다.', false);
      return;
    }
    // 골드가 충분하면 즉시 구매 확인 절차로 — confirm으로 명확히 사용자 의사 확인
    if(confirm(`정보상 실버에게 ${price}골드를 지불하고 미발견 봉인석의 단서를 구매하시겠습니까?`)){
      buySealHintFromSilver();
    }
  }catch(e){ console.warn('[seekOutSilver]', e); }
}
window.seekOutSilver = seekOutSilver;

window.seekOutSilver = seekOutSilver;

export function triggerStoryEnding(){
  try{
    const results = (typeof window.checkEndingConditions === 'function') ? window.checkEndingConditions() : [];
    const top = results[0];
    if(!top) return;

    // [버그 수정] progression/194의 hookHofOnEnding이 window.triggerStoryEnding을
    // 감싸 명예의 전당(recordHallOfFame)을 기록하려 했지만, 이 함수의 유일한
    // 실제 호출부(job/042의 두 곳)가 ES import 바인딩을 bare로 직접 호출해서
    // (다른 죽은 훅들과 동일한 원인) 그 감싸기가 한 번도 적용된 적이 없었다 —
    // 어떤 엔딩을 달성해도 명예의 전당에는 영원히 아무 기록도 남지 않던 버그.
    // 이미 계산된 top(어떤 엔딩인지)을 그대로 써서 여기 네이티브로 연결한다.
    if(typeof recordHallOfFame === 'function') recordHallOfFame(top.id);

    const isTrueEndingReady = (top.id === 'true_ending');

    if(typeof showGameOver === 'function'){
      if(isTrueEndingReady){
        // 이미 봉인석 11개+감시자 화해+15회차 이상을 다 채워뒀다면, 8장
        // 완료와 동시에 곧바로 진짜 최종 결말로 — 더 보여줄 "다음"이 없다.
        showGameOver({ endingIcon: top.icon, endingName: top.name, endingDesc: top.desc }, false);
      } else {
        // [중요] 8장 종결이 "최초의 혼돈"을 영구히 끝낸 게 아님을 명확히
        // 알린다 — 임시 봉인일 뿐이며, 진짜 결말(감시자와의 대면)은 별도로
        // 존재한다는 걸 사용자가 오해하지 않도록.
        showGameOver({
          endingIcon: top.icon || '🌟',
          endingName: top.name || '메인 스토리 완료',
          endingDesc: (top.desc || '8장의 위기가 끝났다.') + '\n\n— 그러나 이것은 진짜 결말이 아니다. 최초의 혼돈은 소멸한 게 아니라 다시 봉인됐을 뿐이다. 세계 어딘가에 흩어진 봉인석들과, 이 모든 반복을 지켜본 존재(감시자)를 찾아낸다면 — 더 깊은 진실과 진짜 결말에 다가갈 수 있다.',
        }, false);
      }
    }
    if(typeof addTimelineEvent === 'function') addTimelineEvent('chapter8_end', '8장 완료: '+(top.name||''), {icon:top.icon||'🌟'});
  }catch(e){ console.warn('[triggerStoryEnding]', e); }
}
window.triggerStoryEnding = triggerStoryEnding;

window.triggerStoryEnding = triggerStoryEnding;

export const OFFLINE_TIME_KEY = 'tf-last-active-at';

export const OFFLINE_MAX_VIRTUAL_TURNS = 5;

export const OFFLINE_MIN_HOURS_TO_TRIGGER = 6;

export function markActiveNow(){
  try{ lsSet(OFFLINE_TIME_KEY, Date.now().toString()); }catch(e){}
}
window.markActiveNow = markActiveNow;

window.markActiveNow = markActiveNow;

export function checkOfflineCatchUp(){
  try{
    const lastStr = lsGet(OFFLINE_TIME_KEY);
    markActiveNow(); // 항상 갱신 — 다음 계산의 기준점
    if(!lastStr) return null; // 첫 플레이는 캐치업 없음

    const elapsedMs = Date.now() - parseInt(lastStr, 10);
    const elapsedHours = elapsedMs / (1000*60*60);
    if(elapsedHours < OFFLINE_MIN_HOURS_TO_TRIGGER) return null;

    // 시간이 길수록 가상 턴이 늘지만, 절대 캡을 넘지 않는다.
    // 대략 12시간당 1가상턴, 최대 OFFLINE_MAX_VIRTUAL_TURNS로 캡.
    const rawTurns = Math.floor(elapsedHours / 12);
    const virtualTurns = Math.max(1, Math.min(OFFLINE_MAX_VIRTUAL_TURNS, rawTurns));

    const allEvents = [];
    for(let i=0; i<virtualTurns; i++){
      try{ const e1 = (typeof tickFactionSimulation==='function') ? tickFactionSimulation() : []; if(e1) allEvents.push(...e1); }catch(e){}
      try{ const e2 = (typeof tickFactionGoals==='function') ? tickFactionGoals() : []; if(e2) allEvents.push(...e2); }catch(e){}
      try{ const e3 = (typeof tickNpcBonds==='function') ? tickNpcBonds() : []; if(e3) allEvents.push(...e3); }catch(e){}
    }

    if(allEvents.length){
      // 메인 화면 진입 직후 자연스럽게 보여줄 요약 — 직접적인 "당신이 없는
      // 동안" 표현보다 "최근 들어온 소식들"처럼 자연스럽게 프레이밍.
      const summary = allEvents.slice(0, 5).map(e => e.msg).filter(Boolean);
      return {
        elapsedHours: Math.round(elapsedHours),
        virtualTurns,
        eventCount: allEvents.length,
        summary,
      };
    }
    return null;
  }catch(e){ console.warn('[checkOfflineCatchUp]', e); return null; }
}
window.checkOfflineCatchUp = checkOfflineCatchUp;

window.checkOfflineCatchUp = checkOfflineCatchUp;

export function checkCatastropheEvent(){
  try{
    // 너무 자주 터지면 의미가 없다 — 매 턴 0.5%, 평균 200턴에 1번 정도
    if(Math.random() > 0.005) return;

    const fired = (()=>{ try{ return JSON.parse(lsGet('tf-catastrophe-fired')||'[]'); }catch(e){ return []; } })();
    const active = (()=>{ try{ return JSON.parse(lsGet('tf-catastrophe-active')||'null'); }catch(e){ return null; } })();
    if(active) return; // 이미 진행 중인 재앙이 있으면 중복 발동 안 함

    const mqState = (typeof loadMainQuestState === 'function') ? loadMainQuestState() : {};
    let tier = 'early';
    // [수정] 28장 재설계 이후 기준점 갱신 — mq7_5는 더 이상 존재하지 않는다.
    // late: 16장(마왕 결전) 이상 진행, mid: 8장(첫 봉인석 파괴) 이상 진행.
    if(mqState['mq16'] === 'active' || mqState['mq16'] === 'complete') tier = 'late';
    else if(mqState['mq8'] === 'active' || mqState['mq8'] === 'complete') tier = 'mid';

    const pool = CATASTROPHE_POOL[tier].filter(c => !fired.includes(c.id));
    if(!pool.length) return; // 해당 단계 재앙을 이미 다 겪었으면 발동 안 함

    const pick = pool[Math.floor(Math.random()*pool.length)];
    fired.push(pick.id);
    lsSet('tf-catastrophe-fired', JSON.stringify(fired));

    // [재앙 하드코딩] 예전엔 "세계 어딘가에서 일어난다"는 서술만 있고
    // 실제로 어느 장소인지, 거기 있으면 무슨 일이 벌어지는지 코드로
    // 정해진 게 전혀 없었다 — API 없이 하드코딩하면 통째로 안 돌아가는
    // 부분. 실제 대상 장소를 하나 골라서(플레이어가 지금 있는 곳이
    // 정착지라면 그곳을 우선 — "고룡의 광란"처럼 도시를 덮치는 재앙이
    // 자연스러우니까), 그 장소에 있으면 진짜 전투가 벌어지게 한다.
    const _curLocForCata = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    const _settleTypes = ['hamlet','village','town','city','capital','major','port'];
    let _targetLoc = (_curLocForCata && _settleTypes.includes(_curLocForCata.type)) ? _curLocForCata : null;
    if(!_targetLoc){
      try{
        const _allLocs = (typeof window.getAllLocations==='function') ? window.getAllLocations() : [];
        const _settlements = _allLocs.filter(l => _settleTypes.includes(l.type));
        if(_settlements.length) _targetLoc = _settlements[Math.floor(Math.random()*_settlements.length)];
      }catch(e){}
    }
    const _targetLocId = _targetLoc ? (_targetLoc.id || _targetLoc.name) : null;
    const _playerIsThere = _targetLoc && _curLocForCata && (_curLocForCata.id||_curLocForCata.name) === _targetLocId;

    lsSet('tf-catastrophe-active', JSON.stringify({ id:pick.id, startedAt:S.msgCount||0, until:(S.msgCount||0)+pick.duration, targetLocId:_targetLocId, targetLocName:_targetLoc?.name||null }));

    // 이 장소 생태계는 실제로 큰 타격을 입는다 — 재앙이 지나간 자리는
    // 나중에 다시 와도 한동안 몬스터가 뜸하게 느껴진다(개체수 급감).
    if(_targetLocId){
      try{
        const eco = (typeof loadLocEco==='function') ? loadLocEco() : {};
        if(eco[_targetLocId]){
          Object.values(eco[_targetLocId]).forEach(e => { e.abundance = Math.max(0, e.abundance*0.15); });
          if(typeof saveLocEco==='function') saveLocEco(eco);
        }
      }catch(e){}
    }

    // [게임 전체 학습 시스템] 이 재앙(cata_dragon_rage 등 고유 id 자체가
    // 이미 구체적인 사건이라 tier문자열+장소로 버킷을 잡는다)을 AI가
    // 이 장소 유형에서 이미 여러 번 서술해봤으면 재사용한다.
    const _cataBucket = (typeof getSituationBucketKey==='function') ? getSituationBucketKey('catastrophe_'+tier+'_'+pick.id, _targetLoc, null) : null;
    const _cataLearned = (_cataBucket && typeof pickLearnedSituationExample==='function') ? pickLearnedSituationExample(_cataBucket, _targetLoc?.name||'') : null;
    if(_cataLearned){
      S._nextInjectedContext = (S._nextInjectedContext||'') + `\n\n[🌋 재앙급 돌발 사건 — 이미 서술 확보됨] ${_cataLearned}`;
    } else {
      S._nextInjectedContext = (S._nextInjectedContext||'')
        + `\n\n[🌋 재앙급 돌발 사건${_targetLoc?` — 대상: ${_targetLoc.name}`:''}] ${pick.icon} ${pick.name} — ${pick.desc} 이 사건은 완전히 예고 없이 일어난다. 메인 퀘스트의 일부가 아니지만 세계관과 깊이 연결되어 있다 — 직접적인 설명보다는 사람들의 혼란과 공포, 그리고 "이것이 무엇을 의미하는가"에 대한 막연한 불안으로 묘사하라. 플레이어가 이 사건에 어떻게 반응할지는 전적으로 자유다(개입/회피/방관 모두 자연스러움). 이 사건은 ${pick.duration}턴 정도 세계에 영향을 남긴 뒤 자연히 진정된다.`
        + (_playerIsThere ? `\n[⚠️ 플레이어가 하필 그 자리에 있다] 지금 있는 곳이 바로 이 재앙의 한복판이다 — 실제로 목숨이 위험한 상황임을 서사로 분명히 전달하라.` : '');
      S._pendingLearnBucket = _cataBucket;
      S._pendingLearnSubject = _targetLoc?.name||'';
    }
    if(typeof toast === 'function') toastHTML(`🌋 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(pick,{size:14}):(pick.icon)} ${esc(pick.name)} 발생!`, 5000);
    if(typeof addTimelineEvent === 'function') addTimelineEvent('catastrophe', pick.name, {icon:pick.icon});

    // 플레이어가 하필 그 장소에 있었다면, 서술만이 아니라 실제 전투로도
    // 이어진다 — 재앙급 존재이므로 최상위 티어(11~13)에서 뽑는다.
    if(_playerIsThere){
      const _cataMonster = (typeof pickTierNameSample==='function') ? pickTierNameSample(11, 13) : null;
      if(_cataMonster){
        const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
        monsters.push({
          id: 'catastrophe_'+_cataMonster.name+'_'+Date.now(),
          name: pick.name, icon: pick.icon,
          hp: _cataMonster.hp, maxHp: _cataMonster.hp, atk: _cataMonster.atk, def: _cataMonster.def,
          status:'alive', isBoss:true, isNamed:true, isCatastrophe:true,
          tier:_cataMonster.tier, element:_cataMonster.element, weakElement:_cataMonster.weakElement,
          resistElement:_cataMonster.resistElement, skills:_cataMonster.skills, trait:_cataMonster.trait,
        });
        if(typeof saveMonsters==='function') saveMonsters(monsters);
        if(typeof renderMonsters==='function') renderMonsters();
      }
    }
  }catch(e){ console.warn('[checkCatastropheEvent]', e); }
}
window.checkCatastropheEvent = checkCatastropheEvent;

window.checkCatastropheEvent = checkCatastropheEvent;

export function tickCatastropheState(){
  try{
    const active = (()=>{ try{ return JSON.parse(lsGet('tf-catastrophe-active')||'null'); }catch(e){ return null; } })();
    if(active && (S.msgCount||0) >= active.until){
      lsDel('tf-catastrophe-active');
    }
  }catch(e){}
}
window.tickCatastropheState = tickCatastropheState;

window.tickCatastropheState = tickCatastropheState;

export function predictCombatStateFromLearning(userMsg){
  try{
    if(!userMsg) return null;
    const learned = JSON.parse(lsGet('tf-combat-learn-data')||'[]');
    // 최소 30건 이상 쌓이기 전에는 예측하지 않음 — 데이터 부족 시 오판 방지
    if(learned.length < 30) return null;

    const tokenize = (s) => new Set(s.replace(/[^\가-힣a-zA-Z0-9\s]/g,'').split(/\s+/).filter(w=>w.length>=2));
    const targetTokens = tokenize(userMsg);
    if(!targetTokens.size) return null;

    let bestMatch = null, bestScore = 0;
    for(const entry of learned){
      const entryTokens = tokenize(entry.text||'');
      if(!entryTokens.size) continue;
      const intersection = [...targetTokens].filter(w=>entryTokens.has(w)).length;
      const union = new Set([...targetTokens, ...entryTokens]).size;
      const score = intersection / union; // 자카드 유사도
      if(score > bestScore){ bestScore = score; bestMatch = entry; }
    }
    // 유사도 0.4 이상일 때만 신뢰 — 너무 낮은 유사도로 잘못 예측하는 것 방지
    if(bestMatch && bestScore >= 0.4) return bestMatch.state;
    return null;
  }catch(e){ return null; }
}
window.predictCombatStateFromLearning = predictCombatStateFromLearning;

window.predictCombatStateFromLearning = predictCombatStateFromLearning;

// ============================================================
// [게임 전체 학습 시스템] predictCombatStateFromLearning은 "전투냐
// 아니냐" 하나만 배웠다 — 이걸 게임 전체로 넓힌 버전. 시스템이 직접
// 트리거하는 사건(돌발 조우·보스 등장·이상 현상·재앙)이 벌어질 때마다
// "이런 종류의 사건 + 이런 장소/등급"이라는 상황 버킷을 만들고, 그
// 사건을 AI가 실제로 어떻게 서술했는지(다음 AI 응답의 서사 원문)를
// 자동으로 그 버킷에 쌓는다. 같은 버킷에 예시가 충분히 쌓이면(기본
// 15건 — predictCombatStateFromLearning의 30건보다 낮게 잡은 이유는
// 여기서 재사용하는 건 "전체 대화 흐름"이 아니라 "이 사건 하나를 알리는
// 한두 문장"이라 상황이 좁고 재사용 안전성이 더 높기 때문), 다음부터
// 같은 버킷의 사건이 벌어지면 AI에게 새로 써달라고 하는 대신 쌓인 예시
// 중 하나를 그대로 재사용한다 — 그만큼 그 턴은 AI 호출이 필요 없다.
// 자주 벌어지는 흔한 사건(마을 근처 잡몹 조우 등)은 금방 성숙해서 빨리
// AI를 덜 쓰게 되고, 희귀한 사건(수도의 이상 현상 등)은 오래 걸린다 —
// "많이 겪을수록 그 부분은 저절로 덜 AI를 쓰게 된다"는 게 자동으로
// 일어난다. 사람이 문장을 미리 써둘 필요가 없다.
// ============================================================
export const SITUATION_LEARN_KEY = 'tf-situation-learn';
const SITUATION_LEARN_MAX_PER_BUCKET = 40;
const SITUATION_LEARN_MIN_TO_REUSE   = 15;

function _situationTierBucket(tier){
  if(!tier) return 'none';
  if(tier <= 4) return 'low';
  if(tier <= 8) return 'mid';
  return 'high';
}
window._situationTierBucket = _situationTierBucket;

// kind: 'encounter'|'boss'|'anomaly'|'catastrophe' 등 사건 종류.
// loc: 그 사건이 벌어진 장소 객체(type만 사용). tier: 관련 몬스터 등급(있으면).
export function getSituationBucketKey(kind, loc, tier){
  const locType = (loc && loc.type) || 'unknown';
  return kind + '|' + locType + '|' + _situationTierBucket(tier);
}
window.getSituationBucketKey = getSituationBucketKey;

export function loadSituationLearnDB(){ try{ return JSON.parse(lsGet(SITUATION_LEARN_KEY)||'{}'); }catch(e){ return {}; } }
window.loadSituationLearnDB = loadSituationLearnDB;

export function saveSituationLearnDB(d){ try{ lsSet(SITUATION_LEARN_KEY, JSON.stringify(d)); }catch(e){} }
window.saveSituationLearnDB = saveSituationLearnDB;

// 이 사건을 서술한 AI 응답 원문이 도착하면 호출 — 해당 버킷에 예시로 쌓는다.
// subject(그 사건의 중심 이름 — 몬스터명 등)를 같이 저장해두면, 나중에
// 다른 이름으로 재사용할 때 문장 속 그 이름만 바꿔치기할 수 있다.
export function recordSituationExample(bucketKey, text, subject){
  if(!bucketKey || !text) return;
  try{
    const db = loadSituationLearnDB();
    if(!db[bucketKey]) db[bucketKey] = [];
    if(!db[bucketKey].some(e=>e.text===text)){
      db[bucketKey].push({ text, subject: subject||'' });
      if(db[bucketKey].length > SITUATION_LEARN_MAX_PER_BUCKET){
        db[bucketKey] = db[bucketKey].slice(-SITUATION_LEARN_MAX_PER_BUCKET);
      }
      saveSituationLearnDB(db);
    }
  }catch(e){}
}
window.recordSituationExample = recordSituationExample;

// 이 버킷이 충분히 성숙했으면(예시 15건 이상) 그중 하나를 무작위로
// 돌려준다 — 성숙 전이면 null(= 지금처럼 AI에게 새로 서술을 맡겨야 함).
// newSubject를 주면, 저장 당시의 이름을 지금 실제 이름으로 바꿔서 돌려준다
// (문맥이 어긋나는 걸 막기 위한 최소한의 안전장치).
export function pickLearnedSituationExample(bucketKey, newSubject){
  try{
    const db = loadSituationLearnDB();
    const arr = db[bucketKey];
    if(!arr || arr.length < SITUATION_LEARN_MIN_TO_REUSE) return null;
    const entry = arr[Math.floor(Math.random()*arr.length)];
    if(entry.subject && newSubject && entry.subject !== newSubject){
      return entry.text.split(entry.subject).join(newSubject);
    }
    return entry.text;
  }catch(e){ return null; }
}
window.pickLearnedSituationExample = pickLearnedSituationExample;

export function getSituationLearnStats(){
  try{
    const db = loadSituationLearnDB();
    return Object.entries(db).map(([bucket, arr]) => ({
      bucket, count: arr.length, matured: arr.length >= SITUATION_LEARN_MIN_TO_REUSE,
    })).sort((a,b) => b.count - a.count);
  }catch(e){ return []; }
}
window.getSituationLearnStats = getSituationLearnStats;

// ============================================================
// [독립 호출 학습 시스템] 위 SITUATION_LEARN은 "이미 이번 턴에 어차피
// AI를 부르는 서술"에 끼워 재사용하는 것이라, 재사용해도 API 호출 자체는
// 줄지 않는다(정직하게 밝혀둔 한계). 반면 generateAILocation/
// generateAIQuest처럼 "이 함수가 실행되면 그 자체로 새 API 호출 1건이
// 발생"하는 독립 호출 함수들은 다르다 — 여기서 예전에 만든 완성된 결과
// 객체(장소/퀘스트 전체)를 그대로 재사용하면, 그 턴은 API 호출 자체가
// 통째로 스킵된다. 이게 실제로 "겪을수록 AI를 덜 쓰게 된다"는 걸
// 호출 횟수로 체감할 수 있는 부분.
// ============================================================
export const OBJECT_LEARN_KEY = 'tf-object-learn';
const OBJECT_LEARN_MAX_PER_BUCKET = 20;
const OBJECT_LEARN_MIN_TO_REUSE   = 12;

export function loadObjectLearnDB(){ try{ return JSON.parse(lsGet(OBJECT_LEARN_KEY)||'{}'); }catch(e){ return {}; } }
window.loadObjectLearnDB = loadObjectLearnDB;

export function saveObjectLearnDB(d){ try{ lsSet(OBJECT_LEARN_KEY, JSON.stringify(d)); }catch(e){} }
window.saveObjectLearnDB = saveObjectLearnDB;

// AI 호출이 성공해서 완성된 결과 객체(장소/퀘스트 등)를 얻었을 때 호출 —
// 해당 버킷에 예시로 쌓는다. obj는 그대로 JSON 저장 가능한 순수 객체여야 함.
export function recordGeneratedObject(bucketKey, obj){
  if(!bucketKey || !obj) return;
  try{
    const db = loadObjectLearnDB();
    if(!db[bucketKey]) db[bucketKey] = [];
    db[bucketKey].push(obj);
    if(db[bucketKey].length > OBJECT_LEARN_MAX_PER_BUCKET){
      db[bucketKey] = db[bucketKey].slice(-OBJECT_LEARN_MAX_PER_BUCKET);
    }
    saveObjectLearnDB(db);
  }catch(e){}
}
window.recordGeneratedObject = recordGeneratedObject;

// 이 버킷이 충분히 성숙했으면(예시 12건 이상) 그중 하나를 깊은 복사로
// 돌려준다 — 호출부에서 id 등 고유 필드만 새로 갈아끼우면 됨.
// 성숙 전이면 null(= 지금처럼 AI를 새로 불러야 함).
export function pickGeneratedObject(bucketKey){
  try{
    const db = loadObjectLearnDB();
    const arr = db[bucketKey];
    if(!arr || arr.length < OBJECT_LEARN_MIN_TO_REUSE) return null;
    const entry = arr[Math.floor(Math.random()*arr.length)];
    return JSON.parse(JSON.stringify(entry));
  }catch(e){ return null; }
}
window.pickGeneratedObject = pickGeneratedObject;

export function getObjectLearnStats(){
  try{
    const db = loadObjectLearnDB();
    return Object.entries(db).map(([bucket, arr]) => ({
      bucket, count: arr.length, matured: arr.length >= OBJECT_LEARN_MIN_TO_REUSE,
    })).sort((a,b) => b.count - a.count);
  }catch(e){ return []; }
}
window.getObjectLearnStats = getObjectLearnStats;

// ══════════════════════════════════════════════════════════════════
// [패턴 학습 엔진] — 위 OBJECT_LEARN 캐시는 "저장 후 재생"(쌓인 AI
// 결과물을 통째로 랜덤 재사용)일 뿐 진짜 학습은 아니었다. 여기서는
// 쌓인 실제 AI 문장들에서 단어 전이 패턴(1차 마르코프 체인)을 뽑아,
// 저장된 문장을 그대로 재생하는 대신 그 패턴으로 완전히 새로운 문장을
// 즉석 생성한다 — 데이터가 쌓일수록 조합 가짓수가 늘어 실제로
// "학습할수록 다양해진다"가 성립한다. 외부 라이브러리·네트워크 불필요,
// 순수 JS. (order=1을 씀 — 2차로 해보니 겹치는 어절이 적어 사실상
// 원문을 그대로 재생하는 것과 다를 게 없었고, 1차가 문법은 유지하면서
// 훨씬 다양한 새 조합을 만들어냄을 실측으로 확인함.)
// ══════════════════════════════════════════════════════════════════
const MARKOV_MIN_SAMPLES = 10;
const MARKOV_START = '', MARKOV_END = '';

export function markovTrain(sentences){
  const chain = {};
  for(const s of sentences){
    if(!s || typeof s !== 'string') continue;
    const tokens = s.trim().split(/\s+/).filter(Boolean);
    if(tokens.length < 2) continue;
    const padded = [MARKOV_START, ...tokens, MARKOV_END];
    for(let i=0; i<padded.length-1; i++){
      const key = padded[i];
      const next = padded[i+1];
      (chain[key] = chain[key]||[]).push(next);
    }
  }
  return chain;
}
window.markovTrain = markovTrain;

export function markovGenerate(chain, maxTokens=25){
  if(!chain[MARKOV_START]) return null;
  let state = MARKOV_START;
  const out = [];
  for(let i=0; i<maxTokens; i++){
    const options = chain[state];
    if(!options || !options.length) break;
    const next = options[Math.floor(Math.random()*options.length)];
    if(next === MARKOV_END) break;
    out.push(next);
    state = next;
  }
  if(out.length < 2) return null;
  return out.join(' ');
}
window.markovGenerate = markovGenerate;

// [코퍼스 저장소] OBJECT_LEARN 버킷은 job/race/era/트리거 등으로 잘게
// 쪼개져 있어(정확 재사용 목적엔 맞지만) 마르코프 학습용 코퍼스로 쓰기엔
// 표본이 너무 안 모인다. 그래서 "이 종류의 텍스트"(예: 아이템 설명,
// 꿈 묘사) 단위로만 묶는 훨씬 덜 쪼개진 별도 저장소를 둔다 — 세부 맥락은
// 다르지만 문체/패턴은 같은 카테고리라 학습 재료로 섞어도 무방하다.
export const MARKOV_CORPUS_KEY = 'tf-markov-corpus';
const MARKOV_CORPUS_MAX_PER_CATEGORY = 150;

export function loadMarkovCorpus(){ try{ return JSON.parse(lsGet(MARKOV_CORPUS_KEY)||'{}'); }catch(e){ return {}; } }
window.loadMarkovCorpus = loadMarkovCorpus;

export function saveMarkovCorpus(d){ try{ lsSet(MARKOV_CORPUS_KEY, JSON.stringify(d)); }catch(e){} }
window.saveMarkovCorpus = saveMarkovCorpus;

// 실제 AI가 만든 텍스트 하나를 category(예: 'item_desc','dream_desc')
// 코퍼스에 누적한다. AI 생성이 성공할 때마다 호출하면 됨.
export function recordMarkovSample(category, text){
  if(!category || typeof text!=='string' || text.length<4) return;
  try{
    const db = loadMarkovCorpus();
    if(!db[category]) db[category] = [];
    if(!db[category].includes(text)) db[category].push(text);
    if(db[category].length > MARKOV_CORPUS_MAX_PER_CATEGORY) db[category] = db[category].slice(-MARKOV_CORPUS_MAX_PER_CATEGORY);
    saveMarkovCorpus(db);
  }catch(e){}
}
window.recordMarkovSample = recordMarkovSample;

// category 코퍼스가 충분히 쌓였으면 그 패턴으로 새 문장을 즉석 생성.
// 샘플 부족이면 null(호출부는 기존 문장 뱅크로 폴백해야 함).
export function getLearnedText(category, minSamples=MARKOV_MIN_SAMPLES){
  try{
    const db = loadMarkovCorpus();
    const texts = db[category];
    if(!texts || texts.length < minSamples) return null;
    return markovGenerate(markovTrain(texts));
  }catch(e){ return null; }
}
window.getLearnedText = getLearnedText;

export function getMarkovCorpusStats(){
  try{
    const db = loadMarkovCorpus();
    return Object.entries(db).map(([category, arr]) => ({
      category, count: arr.length, matured: arr.length >= MARKOV_MIN_SAMPLES,
    })).sort((a,b) => b.count - a.count);
  }catch(e){ return []; }
}
window.getMarkovCorpusStats = getMarkovCorpusStats;

// [이상 현상 하드코딩] 예전엔 "자연재해급 특수 등장(레벨 무시)"이 AI
// 프롬프트 지침으로만 있었다 — 실제로 죽거나 사는지 판정하는 코드가
// 전혀 없이 AI의 서술에만 전적으로 의존했다는 뜻으로, 나중에 API 없이
// 하드코딩해서 팔 때는 통째로 작동하지 않는 부분이었다. MONSTER_TIER_TABLE의
// 상위 등급(10~13, 신화/상급마물/전설급 — 전부 solitary/leader라 "개체수"가
// 아니라 원래도 단독 희귀 존재)에서 실제 이름+스탯을 뽑아, 장소 레벨대를
// 완전히 무시하는 진짜 인카운터를 만들 때 쓴다.
export function pickTierNameSample(tierMin, tierMax){
  const rows = MONSTER_TIER_TABLE.filter(r => r.tier >= tierMin && r.tier <= tierMax);
  if(!rows.length) return null;
  const row = rows[Math.floor(Math.random()*rows.length)];
  const name = row.keywords[Math.floor(Math.random()*row.keywords.length)];
  const rng = (lo,hi) => lo + Math.floor(Math.random()*(hi-lo+1));
  return {
    name, tier: row.tier, label: row.label, social: row.social||'solitary',
    hp: rng(...row.hp), atk: rng(...row.atk), def: rng(...row.def),
    element: row.element || 'physical', weakElement: row.weakElement || null, resistElement: row.resistElement || null,
    skills: row.skills || [], trait: row.trait || '',
  };
}
window.pickTierNameSample = pickTierNameSample;

export function getMonsterTierStats(name){
  const nm = (name||'');
  let bestRow = null, bestLen = 0;
  for(const row of MONSTER_TIER_TABLE){
    for(const k of row.keywords){
      if(nm.includes(k) && k.length > bestLen){
        bestLen = k.length;
        bestRow = row;
      }
    }
  }
  if(bestRow){
    const rng = (lo,hi) => lo + Math.floor(Math.random()*(hi-lo+1));
    return {
      hp:rng(...bestRow.hp), atk:rng(...bestRow.atk), def:rng(...bestRow.def),
      tier:bestRow.tier, label:bestRow.label, social:bestRow.social||'pair',
      element: bestRow.element || 'physical',
      weakElement: bestRow.weakElement || null,
      resistElement: bestRow.resistElement || null,
      skills: bestRow.skills || [],
      trait: bestRow.trait || '',
    };
  }
  // 기본: T3(일반야생) 중간값 — 매칭 없는 낯선 이름의 몬스터 안전 처리
  return {
    hp:90+Math.floor(Math.random()*70), atk:18+Math.floor(Math.random()*15), def:5,
    tier:3, label:'일반야생', social:'pair',
    element:'physical', weakElement:null, resistElement:null, skills:[], trait:'',
  };
}
window.getMonsterTierStats = getMonsterTierStats;

window.getMonsterTierStats = getMonsterTierStats;

export function getMonsterRevivalChance(monster){
  if(!monster) return 0;
  // AI나 특수 이벤트가 명시적으로 부여한 경우 최우선
  if(monster.canRevive === false) return 0; // 명시적 차단
  if(typeof monster.reviveChance === 'number') return monster.reviveChance;

  const name = monster.name || '';
  // 확실한 언데드/불사 계열 — 이름에 포함되면 부활 확률 보유
  const undeadPatterns = ['구울','좀비','리치','미라','리버넌트','망령','유령','스켈레톤','해골',
    '불사','언데드','악령','원령','사령','시체','뱀파이어'];
  const isUndeadByName = undeadPatterns.some(p => name.includes(p));

  // 속성 기반 보정 — dark(어둠) 속성이면 약한 확률 부여
  const isDarkElement = monster.element === 'dark';

  if(isUndeadByName) return 0.35; // 언데드 계열은 35% 확률로 부활 시도
  if(isDarkElement) return 0.15;  // 어둠 속성이면 15%
  return 0; // 그 외 일반 생물은 부활 없음
}
window.getMonsterRevivalChance = getMonsterRevivalChance;

window.getMonsterRevivalChance = getMonsterRevivalChance;

export function tryReviveMonster(monster){
  if(!monster || monster._hasRevived) return false;
  const chance = getMonsterRevivalChance(monster);
  if(chance <= 0) return false;
  if(Math.random() >= chance) return false;

  monster._hasRevived = true;
  monster.status = 'alive';
  const restorePct = 0.3 + Math.random()*0.2; // 30~50%
  monster.hp = Math.max(1, Math.round((monster.maxHp||monster.hp||50) * restorePct));
  monster.atk = Math.round((monster.atk||10) * 0.8);
  return true;
}
window.tryReviveMonster = tryReviveMonster;

window.tryReviveMonster = tryReviveMonster;

export function autoDropLootOnDeath(monster){
  try{
    if(!monster) return;
    // [생태계 시스템] 이 몬스터가 죽었으니 그 장소의 개체수를 갱신한다 —
    // 이 함수는 죽음 처리 경로 3곳(GS 파싱, 스킬 즉사) 전부에서 공통으로
    // 호출되므로 여기 한 곳에만 연결하면 어디서 죽든 빠짐없이 반영된다.
    try{
      const _ecoLoc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
      const _ecoLocId = _ecoLoc ? (_ecoLoc.id || _ecoLoc.name) : null;
      if(_ecoLocId && monster.name && typeof onLocMonsterKilled==='function'){
        onLocMonsterKilled(_ecoLocId, monster.name, monster.tier||3, S.msgCount||0);
      }
    }catch(e){}
    // [생존→서사 연결] 장소 레벨대를 무시한 "이상 현상"급 몬스터를 실제로
    // 이겨내면, 이게 그냥 흘러가는 서술로 끝나지 않고 업적·타임라인에
    // 영구히 남는다 — 말 그대로 "죽을 뻔했는데 살아남아서 이야깃거리가
    // 됐다"를 코드로 보장한다.
    try{
      if(monster.isAnomaly && typeof unlockAchievement==='function') unlockAchievement('anomaly_survivor');
      if(monster.isCatastrophe && typeof unlockAchievement==='function') unlockAchievement('catastrophe_survivor');
      if((monster.isAnomaly || monster.isCatastrophe) && typeof addTimelineEvent==='function'){
        addTimelineEvent('anomaly_survived', monster.name, {icon:monster.icon||'🌀'});
      }
    }catch(e){}
    if(S._itemsGrantedThisTurn) return; // AI가 이미 이번 턴에 아이템을 줬으면 중복 방지
    // [버그 수정] 몬스터 생성 경로마다 강도를 담는 필드가 다르다
    // (조우 시스템은 tier, 경비병/NPC 적대 전환은 level) — 하나만 보면
    // 다른 경로의 몬스터는 항상 최하급 보상으로 계산되는 문제가 있었다.
    // level을 우선하고, 없으면 tier, 둘 다 없으면 안전하게 1로 처리한다.
    const lootLevel = monster.level || monster.tier || 1;
    const drops = (typeof rollLoot==='function') ? rollLoot(lootLevel, !!monster.isBoss) : [];
    if(!drops.length) return;
    const inv = (typeof loadInventory==='function') ? loadInventory() : (S.inventory||[]);
    drops.forEach(item=>{
      inv.push({...item, obtainedAt: S.msgCount||0});
      toastHTML(`🎁 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon||"")} ${esc(item.name)} 획득!`, 2500);
    });
    if(typeof saveInventory==='function') saveInventory(inv);
    S.inventory = inv;
  }catch(e){ console.warn('[autoDropLootOnDeath]', e); }
}
window.autoDropLootOnDeath = autoDropLootOnDeath;

window.autoDropLootOnDeath = autoDropLootOnDeath;

export function calcMonsterDamageMultiplier(attackElement, monster){
  try{
    if(!attackElement || attackElement==='none' || !monster) return { mod:1.0, label:'보통', reason:'일반' };
    if(monster.weakElement && attackElement === monster.weakElement){
      return { mod:2.0, label:'극적 효과!', reason:`${monster.name||'적'}의 확실한 약점을 찔렀다` };
    }
    if(monster.resistElement && attackElement === monster.resistElement){
      return { mod:0.4, label:'거의 안 통함', reason:`${monster.name||'적'}이(가) 이 속성에 강한 저항을 지녔다` };
    }
    if(monster.element && typeof calcAffinityMod==='function'){
      const r = calcAffinityMod(attackElement, monster.element);
      return { mod:r.mod, label:r.label, reason:'속성 상성' };
    }
    return { mod:1.0, label:'보통', reason:'일반' };
  }catch(e){ return { mod:1.0, label:'보통', reason:'일반' }; }
}
window.calcMonsterDamageMultiplier = calcMonsterDamageMultiplier;

window.calcMonsterDamageMultiplier = calcMonsterDamageMultiplier;

export function rollMonsterGroupCount(social){
  const r = (lo,hi) => lo + Math.floor(Math.random()*(hi-lo+1));
  switch(social){
    case 'solitary': return 1;
    case 'leader':   return 1;
    case 'pair':     return r(1,2);
    case 'pack':     return r(1,4);
    case 'swarm':    return r(2,6);
    default:         return r(1,3);
  }
}
window.rollMonsterGroupCount = rollMonsterGroupCount;

window.rollMonsterGroupCount = rollMonsterGroupCount;

export function checkGamblingAction(userMsg){
  try{
    if(!userMsg) return;
    if(!/도박|내기를 걸|판돈|주사위 게임|카드 게임에|노름/.test(userMsg)) return;
    const won = Math.random() < 0.45;
    const stake = 50 + Math.floor(Math.random()*150);
    if(won){
      S.gold = (S.gold||0) + stake;
      if(typeof saveGold==='function') saveGold(S.gold);
      if(typeof window.updateHeader==='function') window.updateHeader();
      toast(`🎲 도박에서 승리! 골드 +${stake}`, 3000);
    } else {
      toast(`🎲 도박에서 패배... 빚을 지고 말았다.`, 3000);
      if(typeof recordGamblingDebt==='function') recordGamblingDebt(stake, S.scenario?.id);
      S._nextInjectedContext = (S._nextInjectedContext||'')
        +'\n\n[⚠️ 도박 빚] 캐릭터가 방금 도박에서 져서 빚을 졌습니다. 이후 적절한 시점에 빚쟁이(전생 채무 정리 기관 등)가 서사에 자연스럽게 등장해 상환을 요구할 수 있습니다.';
    }
  }catch(e){ console.warn('[checkGamblingAction]', e); }
}
window.checkGamblingAction = checkGamblingAction;

window.checkGamblingAction = checkGamblingAction;

export function checkCircusAndCinema(userMsg){
  try{
    if(!userMsg) return;
    if(/서커스|곡예단|떠돌이 공연/.test(userMsg) && typeof visitCircus==='function' && typeof loadCycleCount==='function' && loadCycleCount()>=7){
      const act = visitCircus(loadCycleCount());
      if(act){
        toastHTML(`🎪 서커스 관람: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(act,{size:14}):(act.icon)} ${esc(act.name)}`, 3500);
        S._nextInjectedContext = (S._nextInjectedContext||'')
          +`\n\n[🎪 서커스 공연: ${act.name}] ${act.desc} 이 장면을 신비롭고 인상적으로 묘사하라. 보상: ${act.reward}`;
      }
    }
    if(/장면이 스쳐|전생의 기억이|섬광처럼 떠오/.test(userMsg) && typeof viewCinemaScene==='function'){
      const scene = viewCinemaScene(null, S.scenario?.name||S.scenario?.id);
      if(scene){
        toastHTML(`🎬 전생의 장면: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(scene,{size:14}):(scene.icon||"")} ${esc(scene.title||'')}`, 3500);
      }
    }
  }catch(e){ console.warn('[checkCircusAndCinema]', e); }
}
window.checkCircusAndCinema = checkCircusAndCinema;

window.checkCircusAndCinema = checkCircusAndCinema;

export function checkPetBonding(userMsg){
  try{
    if(!userMsg) return;
    if(!/길들/.test(userMsg) && !/반려/.test(userMsg) && !/따라온다/.test(userMsg) && !/동물을 거둔/.test(userMsg)) return;
    if(typeof recordPetLegacy!=='function' || typeof PET_TYPES==='undefined') return;
    const petKwMap = {wolf:['늑대'],raven:['까마귀'],cat:['고양이'],horse:['말'],owl:['올빼미'],dragon_whelp:['아기 용','새끼 용']};
    for(const [petId,kws] of Object.entries(petKwMap)){
      if(kws.some(kw=>userMsg.includes(kw))){
        recordPetLegacy(petId, null, 1, S.scenario?.id);
        const def = PET_TYPES.find(p=>p.id===petId);
        if(def) toast(`${def.name}과(와) 유대를 맺었다`, 3500, def);
        break;
      }
    }
  }catch(e){ console.warn('[checkPetBonding]', e); }
}
window.checkPetBonding = checkPetBonding;

window.checkPetBonding = checkPetBonding;

export function checkDejavuAndRift(userMsg){
  try{
    if(!userMsg) return;
    if(typeof recordDejavuEvent==='function' && typeof DEJAVU_TRIGGERS!=='undefined' && typeof loadCycleCount==='function' && loadCycleCount()>=2){
      for(const trig of DEJAVU_TRIGGERS){
        if((trig.keyword||[]).some(kw=>userMsg.includes(kw)) && Math.random()<0.08){
          recordDejavuEvent(trig.id, S.scenario?.id);
          S._nextInjectedContext = (S._nextInjectedContext||'')
            +`\n\n[😵 데자뷰] 캐릭터가 강렬한 기시감을 느낍니다: "${trig.feeling}" 이 감각을 짧게, 신비롭게 묘사에 녹여내십시오.`;
          break;
        }
      }
    }
    if(/균열|차원의 틈|공간이 일그러/.test(userMsg) && typeof recordRiftEncounter==='function'){
      recordRiftEncounter(null, (typeof loadCycleCount==='function')?loadCycleCount():0);
      toast('🌌 차원의 균열과 조우했다', 3500);
    }
    if(/또 다른 나|평행세계|또 다른 자신|나와 닮은/.test(userMsg) && typeof recordParallelSelf==='function'){
      recordParallelSelf(S.character?.name, S.character?.role, S.scenario?.id, null);
      toast('👥 평행세계의 자신과 조우했다', 3500);
    }
  }catch(e){ console.warn('[checkDejavuAndRift]', e); }
}
window.checkDejavuAndRift = checkDejavuAndRift;

window.checkDejavuAndRift = checkDejavuAndRift;

export function checkActionPattern(userMsg){
  try{
    if(!userMsg) return;
    const patterns = {
      always_attack:  /공격한다|베어버린다|찌른다|친다|때린다/,
      always_flee:    /도망친다|도주한다|피한다|물러선다/,
      always_solo:    /혼자|홀로 간다|나 혼자서/,
      always_stealth: /숨는다|은신한다|몰래/,
      always_trust:   /믿는다|신뢰한다|맡긴다/,
      always_rich:    /돈을 요구|값을 흥정|팔아치운다/,
      always_deceive: /속인다|거짓말한다|기만한다/,
    };
    for(const [pid, re] of Object.entries(patterns)){
      if(re.test(userMsg)){
        if(typeof recordActionPattern==='function' && typeof TRAP_PATTERNS!=='undefined' && TRAP_PATTERNS.find(p=>p.id===pid)){
          recordActionPattern(pid);
        }
        if(typeof recordCurseRingAction==='function' && typeof CURSE_RING_ACTIONS!=='undefined' && CURSE_RING_ACTIONS[pid]){
          recordCurseRingAction(pid);
        }
        break;
      }
    }
  }catch(e){ console.warn('[checkActionPattern]', e); }
}
window.checkActionPattern = checkActionPattern;

window.checkActionPattern = checkActionPattern;

export function renderMonsters(){
  try{
    const monsters = (typeof loadMonsters === 'function') ? (loadMonsters() || []) : [];
    const alive = monsters.filter(m => m.status === 'alive');

    // [신규] 타겟팅 시스템 — 죽었거나 더 이상 존재하지 않는 적이 타겟으로
    // 남아있지 않도록 매 렌더링마다 유효성 검증.
    if(S._currentTarget && !alive.some(m => m.name === S._currentTarget)){
      S._currentTarget = null;
    }

    const body = document.getElementById('pb-monsters');
    if(body){
      if(!alive.length){
        body.innerHTML = '<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">현재 전투 중인 적이 없습니다.</div>';
      } else {
        body.innerHTML = alive.map(m => {
          const pct = Math.max(0, Math.round((m.hp / (m.maxHp||m.hp||1)) * 100));
          const barColor = pct > 50 ? '#c0504a' : pct > 20 ? '#c08a30' : '#8a2020';
          const tag = m.isBoss ? '🔴보스' : m.isNamed ? '🟡강적' : m.isGroup ? '👥무리' : '⬜일반';
          // [밸런스 표시] 무리는 현재 남은 마리 수를 함께 표시 — HP%만으로는
          // "몇 마리가 남았는지" 직관적으로 알기 어려움
          const countTag = m.isGroup ? ` (남은 ${m.count||0}마리)` : '';
          const isTargeted = S._currentTarget === m.name;
          // 행동 패턴이 있으면 "이 적을 먼저 노리면 유리하다"는 작은 힌트 표시
          const tacticalHint = (m._behaviorId==='mage' || m._behaviorId==='commander') ? ' <span style="color:#e0c060">★우선타겟 권장</span>' : '';
          return `
            <div onclick="setCombatTarget(${JSON.stringify(m.name)})" style="padding:10px 12px;border-bottom:1px solid var(--border);cursor:pointer;${isTargeted?'background:rgba(192,80,80,0.15);box-shadow:inset 3px 0 0 #c05050':''}" title="클릭해서 타겟으로 지정">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
                <span style="font-size:12px;color:var(--text)">${isTargeted?'🎯 ':''}${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:12}):(m.icon||"👹")} ${m.name}${countTag}${tacticalHint}</span>
                <span style="font-size:8px;color:var(--dim)">${tag}</span>
              </div>
              <div style="background:#1a1008;border-radius:3px;height:8px;overflow:hidden">
                <div style="width:${pct}%;height:100%;background:${barColor};transition:width .3s"></div>
              </div>
              <div style="font-size:9px;color:var(--dim);margin-top:3px;text-align:right">
                HP ${Math.round(m.hp)} / ${Math.round(m.maxHp||m.hp)} (${pct}%)
              </div>
            </div>`;
        }).join('');
      }
    }

    // [버그 수정] 기존에 이미 HTML에 존재하던 #boss-hp-bar 슬롯(1645줄)이
    // 채워주는 함수(renderBossHpBar) 없이 영구히 display:none 상태였음.
    // 동적으로 새 DOM을 만들지 않고, 기존 고정 슬롯을 그대로 활용해
    // renderMsgs()의 전체 재렌더링(innerHTML='')에도 안전하게 유지된다.
    const hpBarEl = document.getElementById('boss-hp-bar');
    if(hpBarEl){
      if(!alive.length){
        hpBarEl.style.display = 'none';
        hpBarEl.innerHTML = '';
      } else {
        hpBarEl.style.display = 'flex';
        hpBarEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;padding:5px 10px;background:var(--hdr-bg);border-bottom:1px solid var(--border);font-size:9px;flex-shrink:0';
        // [수정] 전체 바 클릭 시 패널을 여는 기존 동작은 각 적 항목 클릭과
        // 충돌하므로 제거 — 이제 각 적 이름을 직접 클릭해 타겟 지정한다.
        hpBarEl.onclick = null;
        hpBarEl.innerHTML = alive.map(m => {
          const pct = Math.max(0, Math.round((m.hp / (m.maxHp||m.hp||1)) * 100));
          const color = pct > 50 ? '#c0a050' : pct > 20 ? '#c08030' : '#c04040';
          const isTargeted = S._currentTarget === m.name;
          return `<span onclick="event.stopPropagation();setCombatTarget(${JSON.stringify(m.name)})" style="cursor:pointer;${isTargeted?'background:rgba(192,80,80,0.25);border-radius:2px;padding:1px 4px':''}" title="클릭해서 타겟으로 지정"><span style="color:var(--text)">${isTargeted?'🎯':(typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:12}):(m.icon||'👹'))} ${m.name} <b style="color:${color}">${pct}%</b></span></span>`;
        }).join('');
      }
    }
    // [신규] 도망 버튼 — 전투 중에만 표시. 보스전은 도망 가능하지만
    // 일반 전투보다 더 위험하다는 경고를 함께 보여준다(TRPG적 緊張感).
    const fleeBarEl = document.getElementById('flee-btn-bar');
    if(fleeBarEl){
      if(!alive.length){
        fleeBarEl.style.display = 'none';
        fleeBarEl.innerHTML = '';
      } else {
        const hasBoss = alive.some(m=>m.isBoss);
        fleeBarEl.style.display = 'block';
        fleeBarEl.style.cssText = 'display:block;padding:4px 10px;background:var(--hdr-bg);border-bottom:1px solid var(--border);flex-shrink:0';
        fleeBarEl.innerHTML = `<button onclick="attemptFlee()" style="width:100%;padding:6px;background:#2a1810;border:1px solid #5a3020;color:#d09060;font-size:10px;font-family:'Cinzel',serif;cursor:pointer;border-radius:2px;letter-spacing:0.5px">
          🏃 도망 시도${hasBoss?' <span style="color:#c05040">(보스전 — 위험)</span>':''}
        </button>`;
      }
    }
  }catch(e){ console.warn('[renderMonsters]', e); }
}
window.renderMonsters = renderMonsters;

window.renderMonsters = renderMonsters;

export function setCombatTarget(name){
  if(!name) return;
  try{
    const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
    const m = monsters.find(x => x.name === name && x.status === 'alive');
    if(!m){ toast('이미 쓰러진 적입니다'); return; }

    // 같은 적을 다시 클릭하면 타겟 해제
    if(S._currentTarget === name){
      S._currentTarget = null;
      toast(`🎯 ${name} 타겟 해제`, 1800);
      if(typeof renderMonsters==='function') renderMonsters();
      return;
    }

    S._currentTarget = name;
    let tacticalNote = '';
    if(m._behaviorId === 'mage'){
      tacticalNote = ' 마법사형 적을 우선 타겟으로 지정했다 — 정확한 전술적 판단이다. 이 적을 먼저 노리는 행동에 약간의 명중·치명타 보너스를 부여하라.';
    } else if(m._behaviorId === 'commander'){
      tacticalNote = ' 지휘관형 적을 우선 타겟으로 지정했다 — 정확한 전술적 판단이다(지휘관을 빨리 처치하면 부하들의 사기가 무너진다). 이 적을 먼저 노리는 행동에 약간의 명중·치명타 보너스를 부여하라.';
    }
    S._nextInjectedContext = (S._nextInjectedContext||'') +
      `\n[🎯 타겟 지정] 플레이어가 "${name}"을(를) 다음 행동의 우선 타겟으로 지정했다. 별다른 이유로 다른 대상을 공격하겠다는 명확한 입력이 없다면, 이번 행동은 이 적을 향한 것으로 서사화하라.${tacticalNote}`;
    toastHTML(`🎯 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:14}):(m.icon||"👹")} ${esc(name)} 타겟 지정`, 2000);
    if(typeof renderMonsters==='function') renderMonsters();
  }catch(e){ console.warn('[setCombatTarget]', e); }
}
window.setCombatTarget = setCombatTarget;

window.setCombatTarget = setCombatTarget;

export function renderBossHpBar(){ return renderMonsters(); }
window.renderBossHpBar = renderBossHpBar;

window.renderBossHpBar = renderBossHpBar;

export function closeP(name){ $('p-'+name)?.classList.remove('open'); }
window.closeP = closeP;

document.addEventListener('click',e=>{
  if(e.target.classList.contains('panel-ov')){
    // 레이드 전투 패널은 배경 클릭으로 닫힐 때도 안전 정리가 필요하다 —
    // 그냥 닫아버리면 RAID_BATTLE_STATE.active가 true로 남아 그 레이드가
    // 다시는 진행되지 않는 좀비 상태가 된다.
    if(e.target.id === 'p-world-raid-battle' && typeof closeWorldRaidBattlePanel==='function'){
      closeWorldRaidBattlePanel();
      return;
    }
    e.target.classList.remove('open');
  }
});

window.curSkTab = 'all';

export let curSkUnlockedOnly=true;

export function skTab(t,el){ window.curSkTab=t; document.querySelectorAll('.sk-tab').forEach(e=>e.classList.remove('act')); el?.classList.add('act'); renderPanel('skills'); }
window.skTab = skTab;

export function renderPanel(name){
  switch(name){
    case 'keys': renderKeys?.(); break;
    case 'stats': window.renderStats(); break;
    case 'skills': renderSkills(); break;
    case 'inventory': renderInventory(); break;
    case 'shop': renderShop(); break;
    case 'npcs': renderNpcs(); break;
    case 'highlights': renderHighlights(); break;
    case 'memory': renderMemory(); break;
    case 'quests': renderQuests(); break;
    case 'titles': renderTitles(); break;
    case 'summons': renderSummons(); break;
    case 'monsters': if(typeof renderMonsters==='function') renderMonsters(); break;
    case 'worldfigures': { const pb=document.getElementById('pb-worldfigures'); if(pb && typeof renderWorldFigures==='function') pb.innerHTML = renderWorldFigures(); } break;
    case 'achievements': (typeof renderAchievementsPanel==='function'?renderAchievementsPanel():renderAchievements?.()); break;
    case 'statistics': if(typeof renderStatistics==='function') renderStatistics(); break;
    // [버그 수정] 세이브 패널을 여는 실제 진입점(ui/155의 메뉴 버튼)은
    // openP('save')(단수)를 호출하는데, 이 switch는 'saves'(복수)만 처리하고
    // 있어서 패널이 빈 화면으로 열리던 실제 버그였다 — 'save'도 같이 처리.
    case 'saves': case 'save': if(typeof renderSaveSlotPanel==='function') renderSaveSlotPanel(); break;
    case 'jobs': renderJobPanel(); break;
    case 'worldmap': if(typeof window.renderWorldMapPanel==='function') window.renderWorldMapPanel(); else renderWorldReactions(); break;
    case 'location': renderLocationPanel(); break;
    case 'itemcodex': renderItemCodex(); break;
    case 'statalloc': renderStatAllocPanel(); break;
    case 'setbonus': renderSetBonusPanel(); break;
    case 'craft': renderCraftPanel(); break;
    case 'hunter': if(typeof renderHunterGroundsPanel==='function') renderHunterGroundsPanel(); break;
    case 'rc-shop': renderRCShopPanel(); break;
    case 'rest': renderRestPanel(); break;
    case 'skilltree': if(typeof renderSkillTreePanel==='function') renderSkillTreePanel(); else { const pb=document.getElementById('pb-skilltree'); if(pb) pb.innerHTML='<div style="padding:20px;text-align:center;color:var(--dim);font-size:11px">스킬을 스킬 패널에서 확인하세요.</div>'; } break; // [B-5 FIX]
    case 'minimap': renderMiniMap(); break;
    case 'battlelog': renderBattleLogPanel(); break;
    case 'academy': renderAcademyPanel(); break;
    case 'diary': renderDiaryPanel(); break;
    case 'prophecy':       renderProphecyPanel?.(); break;
    case 'dream':          renderDreamPanel?.(); break;
    case 'chronicle':      renderChroniclePanel?.(); break;
    case 'codex':          renderCodexPanel?.(); break;
    case 'npc-agenda':     renderNpcAgendaPanel?.(); break;
    case 'world-calendar': renderWorldCalendarPanel?.(); break;
    case 'mapnotes':       renderMapNotesPanel?.(); break;
    case 'oath':           renderOathPanel?.(); break;
    case 'bloodline':      renderBloodlinePanel?.(); break;
    case 'auction':        renderAuctionPanel?.(); break;
    case 'politicalmap':   renderPoliticalMapPanel?.(); break;
    case 'trauma-deep':    renderTraumaDeepPanel?.(); break;
    case 'alliance':       renderAlliancePanel?.(); break;
    case 'goals':          renderGoalsPanel?.(); break;
    case 'npc-legacy':     renderNpcLegacyPanel?.(); break;
    case 'moments':        renderMomentsPanel?.(); break;
    case 'unfinished':     renderUnfinishedPanel?.(); break;
    case 'world-history':  renderWorldHistoryPanel?.(); break;
    case 'season-events':  renderSeasonEventsPanel?.(); break;
    case 'npc-growth':     renderNpcGrowthPanel?.(); break;
    case 'collection':     renderCollectionPanel?.(); break;
    case 'party': { const _pp=document.getElementById('pb-party'); if(_pp){ const _r=renderPartyPanel(); if(typeof _r==='string') _pp.innerHTML=_r; } break; } // [B-7 FIX]
    case 'epic':        renderEpicQuestPanel?.(); break;
    case 'timeline':    renderTimelinePanel?.(); break;
    case 'economy':     if(typeof renderEconomyPanel==='function') renderEconomyPanel(); break;
    case 'butterfly':   if(typeof renderButterflyPanel==='function') renderButterflyPanel(); break;
    case 'factions':    if(typeof renderFactionPanel==='function') renderFactionPanel(); else renderFactionPowerPanel?.(); break;
    case 'playstats':   renderPlayStatsPanel?.(); break;
    case 'build':       renderBuildRecommendPanel?.(); break;
    case 'skillcombos': renderSkillComboPanel?.(); break;
    case 'evolution': if(typeof renderEvolution==='function') renderEvolution(); break;
    case 'datacollect': if(typeof renderDataCollectPanel==='function') renderDataCollectPanel(); break; // [B-6 FIX]
    case 'plothook':    renderPlotHookPanel?.(); break;
    case 'endingcond':  renderEndingCondPanel?.(); break;
    case 'affinity':    { const pb=document.getElementById('pb-affinity'); if(pb) pb.innerHTML=renderAffinityPanel(); break; }
    case 'demon-corruption': renderDemonCorruptionPanel(); break;
    case 'demon-contract':   renderDemonContractPanel?.(); break;
    case 'demon-truename':   renderDemonTrueNamePanel?.(); break;
    case 'dwarf-craft':      renderDwarfCraftPanel();      break;
    case 'orc-honor':        window.renderOrcHonorPanel();        break;
    case 'elf-memory': renderElfMemoryPanel(); break;
    case 'human-awakening':  window.renderHumanAwakeningPanel();  break;
    case 'elf-forgetting': renderElfForgettingPanel?.(); break;
    case 'elf-emotion':    renderElfEmotionPanel?.(); break;
    case 'human-legacy':   renderHumanLegacyPanel?.(); break;
    case 'human-stigma':   renderHumanStigmaPanel?.(); break;
    case 'social-rank':    renderSocialRankPanel?.(); break;
    case 'darkling-void': window.renderDarklingVoidPanel(); break;
    case 'vampire-chronicle': renderVampireChroniclePanel(); break;
    case 'thrall-manager': renderThrallManagerPanel(); break;
    case 'undead-borrowed-time': renderUndeadBorrowedTimePanel(); break;
    case 'beast-wildlaw': renderBeastWildlawPanel(); break;
    case 'beast-awakening': renderBeastAwakeningPanel?.(); break;
    case 'beast-packbond':  renderBeastPackBondPanel?.(); break;
    case 'beast-lineage':   renderBeastLineagePanel?.(); break;
    case 'orc-bloodvow':    renderOrcBloodVowPanel?.(); break;
    case 'orc-council':     renderOrcCouncilPanel?.(); break;
    case 'dwarf-grudge':    renderDwarfGrudgePanel?.(); break;
    case 'dwarf-unfinished':renderDwarfUnfinishedPanel?.(); break;
    case 'celestial-scale': renderCelestialScalePanel(); break;
    // [버그 수정] misc/261이 window.renderPanel을 감싸는 방식으로 이 두 케이스를
    // 추가했었는데, 이 함수를 실제로 호출하는 openP()가 (같은 파일 안에서)
    // renderPanel(name)을 바인딩으로 직접 호출해 window.renderPanel의 래핑을
    // 항상 건너뛰었다 — 즉 '업적 이정표'/'엔딩 나침반' 패널은 한 번도 뜬 적이
    // 없었다(core/084 renderSetupStep/doStartChat과 같은 근본 원인). 여기
    // 진짜 switch 안에 직접 추가한다.
    case 'milestones': renderMilestonePanel(); break;
    case 'ending-compass': renderEndingCompassPanel(); break;
    // [버그 수정] ui/098이 window.renderPanel을 감싸 'religion' 케이스를,
    // race/260이 같은 방식으로 'demesne' 케이스를 추가하려 했는데 둘 다
    // 위와 동일한 원인(openP가 renderPanel을 bare로 직접 호출)으로 절대
    // 실행되지 않았다. '⛪ 종교' 메뉴 버튼은 openP('religion')만 호출하고
    // 별도의 직접 렌더 호출이 없어서, 종교 패널이 빈 화면으로 열리는 실제
    // 버그였다(demesne는 모든 실제 진입점이 renderDemesnePanel()을 이미
    // 직접 같이 호출하고 있어 겉으로는 멀쩡했지만, 방어적으로 같이 추가).
    case 'religion': renderReligionPanel?.(); break;
    case 'demesne': renderDemesnePanel?.(); break;
    // [실시간 필드 이동] 월드맵 패널(economy/255)의 "🎮 실시간 필드 이동"
    // 버튼에서 openP('fieldmove')로 진입한다 — world/320 참고.
    case 'fieldmove': renderFieldPanel?.(); break;
  }
}
window.renderPanel = renderPanel;

export function toggleHiddenSkills(el){
  const div=document.getElementById('hidden-skills');
  if(!div) return;
  const isHidden=div.style.display==='none';
  div.style.display=isHidden?'block':'none';
  const cnt = div.children.length;
  el.textContent=isHidden?'🔒 숨기기':`🔒 조건 미충족 스킬 ${cnt}개 (클릭하여 확인)`;
}
window.toggleHiddenSkills = toggleHiddenSkills;

export function renderSkills(){
  const body=$('pb-skills'); if(!body) return;
  const spEl=document.querySelector('#sk-sp > span');
  if(spEl) spEl.textContent='스킬 포인트: '+S.skillSP+' SP · 골드: '+S.gold;
  const cb=$('sk-unlocked-only'); if(cb) cb.checked=curSkUnlockedOnly;
  const all=getAllSkillDefs();
  let filtered=window.curSkTab==='all'?all:window.curSkTab==='job'?all.filter(s=>s.jobRole):all.filter(s=>s.type===window.curSkTab);
  const sid=S.scenario?.id;
  let shown=filtered.filter(s=>!s.scenario||s.scenario===sid||s.scenario===(S.character?.scenario||''));
  if(curSkUnlockedOnly) shown=shown.filter(s=>!!S.unlockedSkills[s.id]);
  if(!shown.length){
    body.innerHTML=curSkUnlockedOnly
      ? '<div style="text-align:center;padding:18px;color:var(--dim);font-size:11px">아직 해금한 스킬이 없습니다.<br><span style="font-size:9px">위 체크박스를 해제하면 해금 가능한 스킬을 볼 수 있습니다.</span></div>'
      : '<div style="text-align:center;padding:18px;color:var(--dim);font-size:11px">해당 스킬이 없습니다</div>';
    return;
  }
  const cardHtml = (sk) => {
    const unlocked=!!S.unlockedSkills[sk.id];
    const canUnlock=!unlocked&&getSkillUnlockable(sk.id,S.unlockedSkills,S.stats,S.titles);
    const spCost=SKILL_TREE_SP_COST(sk);
    const hasEnoughSP=S.skillSP>=spCost;
    const rc=RC[sk.rarity]||RC.common;
    const enhLevel = unlocked ? getSkillEnhanceLevel(sk.id) : 0;
    const enhCost = unlocked ? getSkillEnhanceCost(sk.id) : null;
    const enhColors = ['#80c080','#60a0e0','#a060e0','#e06030','#c8a96e'];
    const pipColor = enhLevel > 0 ? enhColors[enhLevel-1] : '#c8a96e';
    const enhBonus = unlocked && enhLevel > 0 ? getSkillEnhanceDesc(sk.id, sk) : '';
    // SP 부족 사유 표시
    let lockReason='';
    if(!unlocked&&!canUnlock){
      if(S.skillSP<spCost) lockReason=`SP 부족 (필요 ${spCost}, 보유 ${S.skillSP})`;
      else lockReason='조건 미충족';
    }
    return `<div class="sk-card ${unlocked?'unlocked':'locked'}" style="cursor:default">
      <div class="sk-top">
        <span class="sk-ico">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:20}):sk.icon}</span>
        <span class="sk-nm" style="color:${rc}">${esc(sk.name)}</span>
        <span class="sk-rar" style="background:${rc}22;color:${rc};border:1px solid ${rc}44">${sk.rarity}</span>
        ${unlocked?'<span style="color:#60a060;font-size:9px;margin-left:auto">✓해금됨</span>':''}
        ${enhLevel>0?`<span style="font-size:8px;color:${pipColor};margin-left:2px;font-family:'Cinzel',serif">Lv.${enhLevel}</span>`:''}
      </div>
      <div class="sk-desc">${esc(sk.desc)}</div>
      ${sk.lore?`<div style="font-size:9px;color:#5a4a2a;font-style:italic;line-height:1.5;margin-top:3px;margin-bottom:2px;border-left:2px solid #3a2a0a;padding-left:5px">${esc(sk.lore)}</div>`:''}
      ${enhBonus?`<div style="font-size:9px;color:#a0c0a0;margin-top:2px">✨ ${enhBonus}</div>`:''}
      ${sk.type==='active'?`<div class="sk-cost">MP: ${sk.mpCost}${enhLevel>0?` (강화 후 -${Math.round(sk.mpCost*SKILL_ENHANCE_TIERS[enhLevel-1].bonus*0.3)})`:''}</div>`:''}
      ${sk.condition?`<div class="sk-cost" style="color:#a06030">조건: ${esc(sk.conditionDesc||sk.condition)}</div>`:''}
      ${canUnlock?`
        <button
          style="margin-top:7px;width:100%;padding:8px;background:linear-gradient(135deg,#2a1f0d,#3a2a10);border:1px solid var(--gold);color:var(--gold);font-family:'Cinzel',serif;font-size:10px;cursor:pointer;border-radius:2px;letter-spacing:.5px;-webkit-tap-highlight-color:rgba(200,169,110,.3);touch-action:manipulation"
          ontouchend="unlockSkill('${sk.id}');event.preventDefault()"
          onclick="unlockSkill('${sk.id}')"
        >🔓 해금 (${spCost} SP)</button>
      `:''}
      ${!unlocked&&!canUnlock&&lockReason?`<div style="margin-top:5px;font-size:9px;color:#5a4a2a;font-family:'Cinzel',serif">🔒 ${lockReason}</div>`:''}
      ${unlocked?`
        <div class="sk-enhance-bar" style="--pip-color:${pipColor};margin-top:7px">
          ${[1,2,3,4,5].map(i=>`<div class="sk-enhance-pip${i<=enhLevel?' filled':''}" style="${i<=enhLevel?`background:${enhColors[i-1]};border-color:${enhColors[i-1]}`:''}"></div>`).join('')}
          ${(enhCost && enhCost.spCost >= 0 && enhLevel < 5)?`<button
            style="margin-left:6px;padding:4px 10px;font-size:9px;font-family:'Cinzel',serif;border:1px solid var(--gold);background:#1a1005;color:var(--gold);cursor:pointer;border-radius:2px;-webkit-tap-highlight-color:rgba(200,169,110,.3);touch-action:manipulation"
            ontouchend="doEnhanceSkill('${sk.id}',event);event.stopPropagation()"
            onclick="doEnhanceSkill('${sk.id}',event)"
            title="SP:${enhCost.spCost} 골드:${enhCost.goldCost}">
            ▲강화 (SP${enhCost.spCost}${enhCost.goldCost>0?` 💰${enhCost.goldCost}`:''})
          </button>`:`<span style="font-size:8px;color:#c8a96e;margin-left:4px;font-family:'Cinzel',serif">MAX</span>`}
        </div>
      `:''}
    </div>`;
  };
  // 조건 미충족(잠김) 스킬은 접이식 섹션으로 분리 — 목록이 너무 길어지는 것을 방지
  const visibleSks = shown.filter(sk => !!S.unlockedSkills[sk.id] || getSkillUnlockable(sk.id,S.unlockedSkills,S.stats,S.titles));
  const hiddenSks  = shown.filter(sk => !S.unlockedSkills[sk.id] && !getSkillUnlockable(sk.id,S.unlockedSkills,S.stats,S.titles));
  let html = visibleSks.map(cardHtml).join('');
  if(hiddenSks.length){
    html += `<button onclick="toggleHiddenSkills(this)" style="width:100%;margin-top:8px;padding:8px;background:var(--bg-input);border:1px solid var(--border);color:var(--dim);font-family:'Cinzel',serif;font-size:10px;cursor:pointer;border-radius:2px;letter-spacing:.5px">🔒 조건 미충족 스킬 ${hiddenSks.length}개 (클릭하여 확인)</button>`;
    html += `<div id="hidden-skills" style="display:none;margin-top:6px">${hiddenSks.map(cardHtml).join('')}</div>`;
  }
  body.innerHTML = html;
}
window.renderSkills = renderSkills;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_67(){
// [복원] 매 턴 서사도 "키 있으면 AI 우선, 없거나 실패하면 로컬" 정책으로
// 통일한다. system_instruction(S.system, buildLightSystem이 계속 만들어
// 왔지만 로컬 전용이던 동안은 아무도 안 읽던 바로 그 값)과 대화 히스토리를
// 그대로 살려 원래 방식대로 fetch한다 — 복잡한 키 로테이션/재시도 UI는
// 되살리지 않는다(실패해도 로컬 폴백이 항상 완전한 턴을 만들어주므로
// 원래처럼 사용자에게 "키 전환 팝업"을 보여줄 이유 자체가 없어졌다).
async function callGeminiForTurn(history, injectedContext){
  const keys = S.apiKeys?.length ? S.apiKeys : (S.apiKeys = loadApiKeys());
  const k = keys[loadKeyIndex()%Math.max(1,keys.length)]||'';
  if(!k) throw new Error('API 키 없음');

  const trimmed = trimHistory ? trimHistory(history, 4500) : history;
  let contents = trimmed.map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content||''}]}));
  if(injectedContext){
    if(contents.length>0 && contents[contents.length-1].role==='user') contents[contents.length-1].parts[0].text += injectedContext;
    else contents.push({role:'user', parts:[{text:injectedContext}]});
  }
  if(contents.length===0) contents = [{role:'user', parts:[{text:'시작'}]}];

  // [버그 수정] 기존엔 GEMINI_FALLBACK_MODELS의 첫 번째 모델만 시도하고
  // 실패하면(할당량 초과 포함) 바로 포기해서 로컬 모델/로컬 조합으로
  // 넘어갔다 — callGeminiDirect(quest/229)는 이미 5개 모델을 순서대로
  // 전부 시도하는데 여기만 그렇지 않아 불필요하게 일찍 클라우드를
  // 포기하는 비대칭이 있었다. 목록 순서 자체가 이미 한도가 넉넉한
  // 모델부터라(gemini-3.5-flash-lite 등), 앞쪽 모델 하나가 그 순간
  // 한도에 걸렸어도 다음 모델은 아직 여유가 있을 수 있다 — 전부 다
  // 시도해본 뒤에야 로컬 폴백으로 넘어가도록 통일한다.
  // [참고] 오프닝(캐릭터 생성 직후 첫 장면)은 더 이상 이 함수를 거치지
  // 않는다 — doStartChat이 API 호출 없이 composeLocalTurnText를 직접
  // 쓰도록 바뀌었다(할당량 소모 0, 단어 오용 위험 0). 그래서 여기엔
  // history가 비어있는 호출이 들어올 일이 없어, 한때 있었던 "오프닝
  // 전용 모델 우선순위" 분기는 죽은 코드가 되어 제거했다.
  let lastErr = null;
  for(const model of GEMINI_FALLBACK_MODELS){
    try{
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent?key='+k,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          system_instruction: { parts:[{ text:(S.system||'').slice(0,12000) }] },
          contents,
          generationConfig:{ temperature:1.0, maxOutputTokens:1024 }
        })
      });
      const d = await res.json();
      if(d.error){ lastErr = new Error(d.error.message||'AI 오류'); continue; }
      const text = d.candidates?.[0]?.content?.parts?.[0]?.text;
      if(!text){ lastErr = new Error('빈 응답'); continue; }
      recordMarkovSample('turn_narrative', text);
      return text;
    }catch(e){
      lastErr = e;
    }
  }
  throw lastErr || new Error('AI 오류(모든 모델 실패)');
}

// 로컬 모델용 — 소형 모델은 긴 멀티턴 히스토리를 안정적으로 못 다루는
// 경우가 많아, 최근 대화를 압축한 텍스트 프롬프트 한 턴으로 넘긴다.
async function callLocalModelForTurn(history, injectedContext){
  const trimmed = trimHistory ? trimHistory(history, 3000) : history;
  const convo = (trimmed||[]).map(m=>(m.role==='assistant'?'서술':'플레이어')+': '+(m.content||'')).join('\n');
  const userPrompt = convo + (injectedContext ? '\n'+injectedContext : '') + '\n\n다음 장면을 2~3문장으로 서술해줘.';
  const text = await callLocalModel((S.system||'').slice(0,4000), userPrompt, { maxTokens: 220 });
  recordMarkovSample('turn_narrative', text);
  return text;
}

async function callAI(history, injectedContext='', retryCount=0){
  if(retryCount === 0) window._apiQueueRunning = true;
  // [13차 감사 FIX] _meIntercept("Master Engine" 로컬 풀 매칭 — 선택지 입력이
  // 충분히 반복 축적되면 매번 AI를 부르는 대신 과거의 비슷한 상황 응답
  // 풀에서 골라 쓰는, 이미 완성돼 있던 AI 호출 절감 기능)가 실제로는 한
  // 번도 호출되지 않고 있었다 — 매 턴 데이터는 계속 쌓이는데(tf-master-playlog,
  // ai-prompt/148에서 정상 기록됨) 그걸 읽어서 활용하는 쪽이 연결 안 돼
  // 있었던 것. 자유 입력은 이 함수 내부에서 자체적으로 절대 건드리지
  // 않으므로(다양성 보호 정책) 여기서 먼저 시도해도 안전하다.
  if(retryCount === 0 && typeof window._meIntercept==='function'){
    try{
      const meText = await window._meIntercept(injectedContext, history);
      if(meText){
        window._apiQueueRunning = false; setTimeout(_drainQueue,500);
        return meText;
      }
    }catch(e){ console.warn('[ME] intercept 실패, 정상 AI 호출로 진행:', e); }
  }
  const text = await tryCloudThenLocalModelThenBank(
    () => callGeminiForTurn(history, injectedContext),
    () => callLocalModelForTurn(history, injectedContext),
    () => composeLocalTurnText(history, injectedContext),
    '매턴 서사'
  );
  if(retryCount===0){ window._apiQueueRunning=false; setTimeout(_drainQueue,500); }
  return text;
}
window.callAI = callAI;

function updateHeader(){
  if(window.updateHeader._running) return;
  window.updateHeader._running = true;
  try{
  $('h-hp').textContent=Math.round(S.stats.hp || 50);
  $('h-mp').textContent=Math.round(S.stats.mp || 50);
  $('h-gold').textContent=S.gold;
  const lv=$('h-lv'); if(lv) lv.textContent='Lv.'+(loadPlayerLevel()||1);
  // 인간족 전용 버튼 표시/숨김
  const _isHuman = (S.character?.race||'').includes('인간') || (S.character?.race||'').toLowerCase().includes('human') || !(S.character?.race||'');
  const hBtn = document.getElementById('btn-human-awaken');
  const hBtnPc = document.getElementById('pc-btn-human-awaken');
  if(hBtn) hBtn.style.display = _isHuman ? 'inline-flex' : 'none';
  if(hBtnPc) hBtnPc.style.display = _isHuman ? 'flex' : 'none';
  const hlBtn   = document.getElementById('btn-human-legacy');
  const hlBtnPc = document.getElementById('pc-btn-human-legacy');
  if(hlBtn)   hlBtn.style.display   = _isHuman ? 'inline-flex' : 'none';
  if(hlBtnPc) hlBtnPc.style.display = _isHuman ? 'flex'        : 'none';
  const hsBtn   = document.getElementById('btn-human-stigma');
  const hsBtnPc = document.getElementById('pc-btn-human-stigma');
  if(hsBtn)   hsBtn.style.display   = _isHuman ? 'inline-flex' : 'none';
  if(hsBtnPc) hsBtnPc.style.display = _isHuman ? 'flex'        : 'none';
  // 인간족 각성도 헤더 표시
  if(_isHuman){
    const ha = loadHumanAwakening();
    const hastg = HUMAN_AWAKENING_STAGES[ha.stage||0];
    const hdrAwake = document.getElementById('h-humanawake');
    if(!hdrAwake){
      const hdrStats = document.querySelector('.hdr-stats');
      if(hdrStats){
        const span = document.createElement('span');
        span.className='hst'; span.id='h-humanawake';
        span.style.cssText='color:#f0c040;cursor:pointer';
        span.title='각성도 클릭하면 패널 열기';
        span.onclick=()=>{window.openP('human-awakening');window.renderHumanAwakeningPanel();};
        hdrStats.insertBefore(span, hdrStats.firstChild);
      }
    }
    const hw=document.getElementById('h-humanawake');
    if(hw) hw.innerHTML=`<span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(hastg,{size:10}):(hastg.icon)}</span><span style="font-size:9px;font-family:'Cinzel',serif">${ha.points}</span>`;
  } else {
    const hw=document.getElementById('h-humanawake');
    if(hw) hw.remove();
  }
  // 🐉 드래곤혈 전용 버튼 표시/숨김
  const _isDragonBlood = (S.character?.race||'').includes('드래곤') || (S.character?.race||'').includes('dragon') || (S.character?.race||'').includes('용혈');
  const dhBtn   = document.getElementById('btn-dragon-heart');
  const dhBtnPc = document.getElementById('pc-btn-dragon-heart');
  if(dhBtn)   dhBtn.style.display   = _isDragonBlood ? 'inline-flex' : 'none';
  if(dhBtnPc) dhBtnPc.style.display = _isDragonBlood ? 'flex' : 'none';
  // 드래곤혈 용심 헤더 표시
  if(_isDragonBlood){
    if(typeof loadDragonHeart==='function'){
      const dh=loadDragonHeart();
      const balPhase=getDragonBalancePhase(dh.heartBalance||500);
      let hdrDH=document.getElementById('h-dragonheart');
      if(!hdrDH){
        const hdrStats=document.querySelector('.hdr-stats');
        if(hdrStats){
          const span=document.createElement('span');
          span.className='hst'; span.id='h-dragonheart';
          span.style.cssText='color:#ff6020;cursor:pointer';
          span.title='용심 — 클릭하면 패널 열기';
          span.onclick=()=>{window.openP('dragon-heart');renderDragonHeartPanel();};
          hdrStats.insertBefore(span,hdrStats.firstChild);
        }
      }
      const hdh=document.getElementById('h-dragonheart');
      if(hdh) hdh.innerHTML=`<span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(balPhase,{size:10}):(balPhase.icon)}</span><span style="font-size:9px;font-family:'Cinzel',serif;color:#ff6020">${dh.awakenPoints||0}</span>`;
      // 스탯 적용
      if(typeof applyDragonHeartStats==='function') applyDragonHeartStats();
    }
  } else {
    const hdh=document.getElementById('h-dragonheart');
    if(hdh) hdh.remove();
  }
  // 악마족 전용 버튼 표시/숨김
  const _isDemon = (S.character?.race||'').includes('악마') || (S.character?.race||'').includes('demon');
  const dBtn = document.getElementById('btn-demon-corrupt');
  const dBtnPc = document.getElementById('pc-btn-demon-corrupt');
  if(dBtn) dBtn.style.display = _isDemon ? 'inline-flex' : 'none';
  if(dBtnPc) dBtnPc.style.display = _isDemon ? 'flex' : 'none';
  const dcBtn   = document.getElementById('btn-demon-contract');
  const dcBtnPc = document.getElementById('pc-btn-demon-contract');
  if(dcBtn)   dcBtn.style.display   = _isDemon ? 'inline-flex' : 'none';
  if(dcBtnPc) dcBtnPc.style.display = _isDemon ? 'flex'        : 'none';
  const dtBtn   = document.getElementById('btn-demon-truename');
  const dtBtnPc = document.getElementById('pc-btn-demon-truename');
  if(dtBtn)   dtBtn.style.display   = _isDemon ? 'inline-flex' : 'none';
  if(dtBtnPc) dtBtnPc.style.display = _isDemon ? 'flex'        : 'none';
  // 💀 언데드 전용 버튼 표시/숨김
  const _isUndead = (S.character?.race||'').includes('언데드') || (S.character?.race||'').includes('undead');
  const udBtn   = document.getElementById('btn-undead-borrowed');
  const udBtnPc = document.getElementById('pc-btn-undead-borrowed');
  // 권속 버튼 — 지배 능력 있을 때만 표시 (모바일 + PC)
  const thrallBtn = document.getElementById('btn-thrall-manager');
  const thrallBtnPc = document.getElementById('pc-btn-thrall-manager');
  const hasDomination = typeof checkDominationAbility==='function' && checkDominationAbility().ok;
  if (thrallBtn) thrallBtn.style.display = hasDomination ? '' : 'none';
  if (thrallBtnPc) thrallBtnPc.style.display = hasDomination ? 'flex' : 'none';
  // 혈통 연대기 버튼 — 뱀파이어 종족 전용 (모바일 2개 + PC)
  const vampChronicleBtn = document.getElementById('btn-vampire-chronicle');
  const vampChronicleBtn2 = document.getElementById('btn-vampire-chronicle2');
  const vampChronicleBtnPc = document.getElementById('pc-btn-vampire-chronicle');
  {
    const _raceForVamp = (S.character?.race||'');
    const isVampire = _raceForVamp==='뱀파이어' || _raceForVamp.includes('혈종') || _raceForVamp.includes('혈군') || _raceForVamp.includes('혈통');
    if (vampChronicleBtn) vampChronicleBtn.style.display = isVampire ? '' : 'none';
    if (vampChronicleBtn2) vampChronicleBtn2.style.display = isVampire ? '' : 'none';
    if (vampChronicleBtnPc) vampChronicleBtnPc.style.display = isVampire ? 'flex' : 'none';
  }
  if(udBtn)   udBtn.style.display   = _isUndead ? 'inline-flex' : 'none';
  if(udBtnPc) udBtnPc.style.display = _isUndead ? 'flex'        : 'none';
  // 🐾 수인족 전용 버튼 표시/숨김
  const _isBeast = (S.character?.race||'').includes('수인') || (S.character?.race||'').includes('beast');
  const bwBtn   = document.getElementById('btn-beast-wildlaw');
  const bwBtnPc = document.getElementById('pc-btn-beast-wildlaw');
  if(bwBtn)   bwBtn.style.display   = _isBeast ? 'inline-flex' : 'none';
  if(bwBtnPc) bwBtnPc.style.display = _isBeast ? 'flex'        : 'none';
  // 🌕 수인족 야수 각성 버튼 표시/숨김
  const baBtn   = document.getElementById('btn-beast-awakening');
  const baBtnPc = document.getElementById('pc-btn-beast-awakening');
  if(baBtn)   baBtn.style.display   = _isBeast ? 'inline-flex' : 'none';
  if(baBtnPc) baBtnPc.style.display = _isBeast ? 'flex'        : 'none';
  // 🐺 수인족 무리 유대 버튼
  const pbBtn   = document.getElementById('btn-beast-packbond');
  const pbBtnPc = document.getElementById('pc-btn-beast-packbond');
  if(pbBtn)   pbBtn.style.display   = _isBeast ? 'inline-flex' : 'none';
  if(pbBtnPc) pbBtnPc.style.display = _isBeast ? 'flex'        : 'none';
  // 🧬 수인족 계보 버튼
  const lgBtn   = document.getElementById('btn-beast-lineage');
  const lgBtnPc = document.getElementById('pc-btn-beast-lineage');
  if(lgBtn)   lgBtn.style.display   = _isBeast ? 'inline-flex' : 'none';
  if(lgBtnPc) lgBtnPc.style.display = _isBeast ? 'flex'        : 'none';
  // 수인족 야생의 법칙 헤더 표시
  if(_isBeast){
    if(typeof applyBeastWildlawStats==='function') applyBeastWildlawStats();
    if(typeof applyBeastAwakeningStats==='function') applyBeastAwakeningStats();
    if(typeof applyBeastPackBondStats==='function') applyBeastPackBondStats();
    if(typeof applyBeastLineageStats==='function') applyBeastLineageStats();
    if(typeof loadBeastWildlaw==='function'){
      const bw=loadBeastWildlaw();
      const packStg=getBeastPackRankStage(bw.packRank||30);
      const beastStg=getBeastBloodStage(bw.beastBlood||50);
      let hdrBW=document.getElementById('h-beastwildlaw');
      if(!hdrBW){
        const hdrStats=document.querySelector('.hdr-stats');
        if(hdrStats){
          const span=document.createElement('span');
          span.className='hst'; span.id='h-beastwildlaw';
          span.style.cssText='color:#7ec850;cursor:pointer';
          span.title='야생의 법칙 — 클릭하면 패널 열기';
          span.onclick=()=>{window.openP('beast-wildlaw');renderBeastWildlawPanel();};
          hdrStats.insertBefore(span,hdrStats.firstChild);
        }
      }
      const hbw=document.getElementById('h-beastwildlaw');
      if(hbw) hbw.innerHTML=`<span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(packStg,{size:10}):(packStg.icon)}</span><span style="font-size:9px;font-family:'Cinzel',serif;color:#7ec850">${bw.packRank||30}</span><span style="font-size:8px;color:#5a9030;margin-left:2px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(beastStg,{size:8}):(beastStg.icon)}</span>`;
    }
    // 🌕 야수각성 헤더 뱃지
    if(typeof loadBeastAwakening==='function'){
      const ba=loadBeastAwakening();
      const bastg=BEAST_AWAKENING_STAGES[ba.stage||0];
      let hdrBA=document.getElementById('h-beastawakening');
      if(!hdrBA){
        const hdrStats=document.querySelector('.hdr-stats');
        if(hdrStats){
          const span=document.createElement('span');
          span.className='hst'; span.id='h-beastawakening';
          span.style.cssText='color:#e8a030;cursor:pointer;margin-left:2px';
          span.title='야수 각성 — 클릭하면 패널 열기';
          span.onclick=()=>{window.openP('beast-awakening');renderBeastAwakeningPanel();};
          hdrStats.insertBefore(span,hdrStats.firstChild);
        }
      }
      const hba=document.getElementById('h-beastawakening');
      if(hba && bastg) hba.innerHTML=`<span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(bastg,{size:10}):(bastg.icon)}</span><span style="font-size:9px;font-family:'Cinzel',serif;color:#e8a030">${ba.points||0}</span>`;
    }
  } else {
    const hbw=document.getElementById('h-beastwildlaw');
    if(hbw) hbw.remove();
    const hba=document.getElementById('h-beastawakening');
    if(hba) hba.remove();
  }
  // 🔨 드워프족 전용 버튼 표시/숨김
  const _isDwarf = (S.character?.race||'').includes('드워프') || (S.character?.race||'').includes('dwarf');
  const dwBtn   = document.getElementById('btn-dwarf-craft');
  const dwBtnPc = document.getElementById('pc-btn-dwarf-craft');
  if(dwBtn)   dwBtn.style.display   = _isDwarf ? 'inline-flex' : 'none';
  if(dwBtnPc) dwBtnPc.style.display = _isDwarf ? 'flex' : 'none';
  const dgBtn   = document.getElementById('btn-dwarf-grudge');
  const dgBtnPc = document.getElementById('pc-btn-dwarf-grudge');
  if(dgBtn)   dgBtn.style.display   = _isDwarf ? 'inline-flex' : 'none';
  if(dgBtnPc) dgBtnPc.style.display = _isDwarf ? 'flex'        : 'none';
  const duBtn   = document.getElementById('btn-dwarf-unfinished');
  const duBtnPc = document.getElementById('pc-btn-dwarf-unfinished');
  if(duBtn)   duBtn.style.display   = _isDwarf ? 'inline-flex' : 'none';
  if(duBtnPc) duBtnPc.style.display = _isDwarf ? 'flex'        : 'none';
  // 😤 오크족 전용 버튼 표시/숨김
  const _isOrc = (S.character?.race||'').includes('오크') || (S.character?.race||'').includes('orc');
  const orBtn   = document.getElementById('btn-orc-honor');
  const orBtnPc = document.getElementById('pc-btn-orc-honor');
  if(orBtn)   orBtn.style.display   = _isOrc ? 'inline-flex' : 'none';
  if(orBtnPc) orBtnPc.style.display = _isOrc ? 'flex' : 'none';
  const bvBtn   = document.getElementById('btn-orc-bloodvow');
  const bvBtnPc = document.getElementById('pc-btn-orc-bloodvow');
  if(bvBtn)   bvBtn.style.display   = _isOrc ? 'inline-flex' : 'none';
  if(bvBtnPc) bvBtnPc.style.display = _isOrc ? 'flex'        : 'none';
  const ocBtn   = document.getElementById('btn-orc-council');
  const ocBtnPc = document.getElementById('pc-btn-orc-council');
  if(ocBtn)   ocBtn.style.display   = _isOrc ? 'inline-flex' : 'none';
  if(ocBtnPc) ocBtnPc.style.display = _isOrc ? 'flex'        : 'none';
  // 드워프 각인도 헤더 표시
  if(_isDwarf){
    if(typeof loadDwarfCraft==='function'){
      const dw=loadDwarfCraft();
      const dwstg=DWARF_CRAFT_STAGES[dw.stage||0];
      let hdrCraft=document.getElementById('h-dwarfcraft');
      if(!hdrCraft){
        const hdrStats=document.querySelector('.hdr-stats');
        if(hdrStats){
          const span=document.createElement('span');
          span.className='hst'; span.id='h-dwarfcraft';
          span.style.cssText='color:#d4a030;cursor:pointer';
          span.title='각인도 클릭하면 패널 열기';
          span.onclick=()=>{window.openP('dwarf-craft');renderDwarfCraftPanel();};
          hdrStats.insertBefore(span,hdrStats.firstChild);
        }
      }
      const hd=document.getElementById('h-dwarfcraft');
      if(hd) hd.innerHTML=`<span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(dwstg,{size:10}):(dwstg.icon)}</span><span style="font-size:9px;font-family:'Cinzel',serif">${dw.points}</span>`;
    }
  } else {
    const hd=document.getElementById('h-dwarfcraft');
    if(hd) hd.remove();
  }
  // 😤 오크족 업보 헤더 표시
  if(_isOrc){
    if(typeof loadOrcHonor==='function'){
      const oh=loadOrcHonor();
      const orstg=ORC_HONOR_STAGES[oh.stage||0];
      let hdrOrc=document.getElementById('h-orchonor');
      if(!hdrOrc){
        const hdrStats=document.querySelector('.hdr-stats');
        if(hdrStats){
          const span=document.createElement('span');
          span.className='hst'; span.id='h-orchonor';
          span.style.cssText='color:#e06020;cursor:pointer';
          span.title='업보 클릭하면 패널 열기';
          span.onclick=()=>{window.openP('orc-honor');window.renderOrcHonorPanel();};
          hdrStats.insertBefore(span,hdrStats.firstChild);
        }
      }
      const ho=document.getElementById('h-orchonor');
      if(ho) ho.innerHTML=`<span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(orstg,{size:10}):(orstg.icon)}</span><span style="font-size:9px;font-family:'Cinzel',serif">${oh.points}</span>`;
    }
  } else {
    const ho=document.getElementById('h-orchonor');
    if(ho) ho.remove();
  }
  const _isElf = (S.character?.race||'').includes('엘프') || (S.character?.race||'').includes('elf');
  const eBtn = document.getElementById('btn-elf-memory');
  const eBtnPc = document.getElementById('pc-btn-elf-memory');
  if(eBtn) eBtn.style.display = _isElf ? 'inline-flex' : 'none';
  if(eBtnPc) eBtnPc.style.display = _isElf ? 'flex' : 'none';
  const efBtn   = document.getElementById('btn-elf-forgetting');
  const efBtnPc = document.getElementById('pc-btn-elf-forgetting');
  if(efBtn)   efBtn.style.display   = _isElf ? 'inline-flex' : 'none';
  if(efBtnPc) efBtnPc.style.display = _isElf ? 'flex'        : 'none';
  const eeBtn   = document.getElementById('btn-elf-emotion');
  const eeBtnPc = document.getElementById('pc-btn-elf-emotion');
  if(eeBtn)   eeBtn.style.display   = _isElf ? 'inline-flex' : 'none';
  if(eeBtnPc) eeBtnPc.style.display = _isElf ? 'flex'        : 'none';
  if(_isElf) {
    if(typeof applyElfForgettingStats==='function') applyElfForgettingStats();
    if(typeof applyElfEmotionStats==='function')    applyElfEmotionStats();
  }
  // 🌑 다크링 전용 버튼 표시/숨김
  const _isDarkling = (S.character?.race||'').includes('다크링') || (S.character?.race||'').includes('darkling');
  const dvBtn   = document.getElementById('btn-darkling-void');
  const dvBtnPc = document.getElementById('pc-btn-darkling-void');
  if(dvBtn)   dvBtn.style.display   = _isDarkling ? 'inline-flex' : 'none';
  if(dvBtnPc) dvBtnPc.style.display = _isDarkling ? 'flex' : 'none';
  // 다크링 공허도 헤더 표시
  if(_isDarkling){
    if(typeof loadDarklingVoid==='function'){
      const dvd=loadDarklingVoid();
      const dvstg=DARKLING_VOID_STAGES[dvd.stage||0];
      let hdrVoid=document.getElementById('h-darklingvoid');
      if(!hdrVoid){
        const hdrStats=document.querySelector('.hdr-stats');
        if(hdrStats){
          const span=document.createElement('span');
          span.className='hst'; span.id='h-darklingvoid';
          span.style.cssText='color:#5080e0;cursor:pointer';
          span.title='공허도 — 클릭하면 패널 열기';
          span.onclick=()=>{window.openP('darkling-void');window.renderDarklingVoidPanel();};
          hdrStats.insertBefore(span,hdrStats.firstChild);
        }
      }
      const hv=document.getElementById('h-darklingvoid');
      if(hv) hv.innerHTML=`<span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(dvstg,{size:10}):(dvstg.icon)}</span><span style="font-size:9px;font-family:'Cinzel',serif">${dvd.points}</span>`;
    }
  } else {
    const hv=document.getElementById('h-darklingvoid');
    if(hv) hv.remove();
  }
  // 엘프족 기억력 헤더 표시
  if(_isElf){
    const em = loadElfMemory();
    const estg = ELF_MEMORY_STAGES[em.stage||0];
    const hdrMemory = document.getElementById('h-elfmemory');
    if(!hdrMemory){
      const hdrStats = document.querySelector('.hdr-stats');
      if(hdrStats){
        const span = document.createElement('span');
        span.className='hst'; span.id='h-elfmemory';
        span.style.cssText='color:#40d0a0;cursor:pointer';
        span.title='기억력 클릭하면 패널 열기';
        span.onclick=()=>{window.openP('elf-memory');renderElfMemoryPanel();};
        hdrStats.insertBefore(span, hdrStats.firstChild);
      }
    }
    const hm=document.getElementById('h-elfmemory');
    if(hm) hm.innerHTML=`<span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(estg,{size:10}):(estg.icon)}</span><span style="font-size:9px;font-family:'Cinzel',serif">${em.points}</span>`;
  } else {
    const hm=document.getElementById('h-elfmemory');
    if(hm) hm.remove();
  }
  // 💛 세레스티얼 전용 버튼 표시/숨김
  const _isCelestial = (S.character?.race||'').includes('세레스티얼') || (S.character?.race||'').includes('celestial');
  const csBtn   = document.getElementById('btn-celestial-scale');
  const csBtnPc = document.getElementById('pc-btn-celestial-scale');
  if(csBtn)   csBtn.style.display   = _isCelestial ? 'inline-flex' : 'none';
  if(csBtnPc) csBtnPc.style.display = _isCelestial ? 'flex' : 'none';
  // 💛 세레스티얼 계율 버튼 표시/숨김
  const ccBtn   = document.getElementById('btn-celestial-covenant');
  const ccBtnPc = document.getElementById('pc-btn-celestial-covenant');
  if(ccBtn)   ccBtn.style.display   = _isCelestial ? 'inline-flex' : 'none';
  if(ccBtnPc) ccBtnPc.style.display = _isCelestial ? 'flex' : 'none';
  // 계율 스탯 초기 적용
  if(_isCelestial && typeof applyCelestialCovenantStats==='function') applyCelestialCovenantStats();
  // 세레스티얼 천평도 헤더 표시
  if(_isCelestial){
    if(typeof loadCelestialScale==='function'){
      const cs=loadCelestialScale();
      const csPhase = getCelestialPhase(cs.points);
      let hdrCS=document.getElementById('h-celestialscale');
      if(!hdrCS){
        const hdrStats=document.querySelector('.hdr-stats');
        if(hdrStats){
          const span=document.createElement('span');
          span.className='hst'; span.id='h-celestialscale';
          span.style.cssText='color:#c8c0ff;cursor:pointer';
          span.title='신성 천평 — 클릭하면 패널 열기';
          span.onclick=()=>{window.openP('celestial-scale');renderCelestialScalePanel();};
          hdrStats.insertBefore(span,hdrStats.firstChild);
        }
      }
      const hcs=document.getElementById('h-celestialscale');
      if(hcs) hcs.innerHTML=`<span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(csPhase,{size:10}):(csPhase.icon)}</span><span style="font-size:9px;font-family:'Cinzel',serif">${cs.points}</span>`;
    }
  } else {
    const hcs=document.getElementById('h-celestialscale');
    if(hcs) hcs.remove();
  }
  // 악마족 타락도 헤더 표시
  if(_isDemon){
    const dc = loadDemonCorruption();
    const stg = DEMON_CORRUPTION_STAGES[dc.stage||0];
    const hdrCorrupt = document.getElementById('h-corruption');
    if(!hdrCorrupt){
      const hdrStats = document.querySelector('.hdr-stats');
      if(hdrStats){
        const span = document.createElement('span');
        span.className='hst'; span.id='h-corruption';
        span.style.cssText='color:#c060d0;cursor:pointer';
        span.title='타락도 클릭하면 패널 열기';
        span.onclick=()=>{window.openP('demon-corruption');renderDemonCorruptionPanel();};
        hdrStats.insertBefore(span, hdrStats.firstChild);
      }
    }
    const hc=document.getElementById('h-corruption');
    if(hc) hc.innerHTML=`<span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:10}):(stg.icon)}</span><span style="font-size:9px;font-family:'Cinzel',serif">${dc.points}</span>`;
  } else {
    const hc=document.getElementById('h-corruption');
    if(hc) hc.remove();
  }
  // 🌀 원소인 전용 버튼 표시/숨김
  const _isElementalRace = (S.character?.race||'').includes('원소') || (S.character?.race||'').includes('elemental');
  const elBtn   = document.getElementById('btn-elemental-system');
  const elBtnPc = document.getElementById('pc-btn-elemental-system');
  if(elBtn)   elBtn.style.display   = _isElementalRace ? 'inline-flex' : 'none';
  if(elBtnPc) elBtnPc.style.display = _isElementalRace ? 'flex' : 'none';
  // 원소인 헤더 표시
  if(_isElementalRace){
    if(typeof loadElementalSystem==='function'){
      const _es = loadElementalSystem();
      const _et = _es.element ? ELEMENTAL_TYPES[_es.element] : null;
      const _stg = getElemAwakeningStage(_es.points);
      const _restStg = getElemRestraintStage(_es.restraint);
      let hdrEl = document.getElementById('h-elementalsystem');
      if(!hdrEl){
        const hdrStats = document.querySelector('.hdr-stats');
        if(hdrStats){
          const span = document.createElement('span');
          span.className='hst'; span.id='h-elementalsystem';
          span.style.cssText='color:#40e0a0;cursor:pointer';
          span.title='원소각성 — 클릭하면 패널 열기';
          span.onclick=()=>{window.openP('elemental-system');renderElementalSystemPanel();};
          hdrStats.insertBefore(span, hdrStats.firstChild);
        }
      }
      const hel = document.getElementById('h-elementalsystem');
      if(hel){
        const elIcon = _et ? _et.icon : '🌀';
        const elColor = _et ? _et.color : '#40e0a0';
        hel.innerHTML=`<span style="font-size:10px">${elIcon}</span><span style="font-size:9px;font-family:'Cinzel',serif;color:${elColor}">${_es.points}</span><span style="font-size:8px;color:${_restStg.color};margin-left:2px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(_restStg,{size:8}):(_restStg.icon)}</span>`;
      }
      if(typeof applyElementalSystemStats==='function') applyElementalSystemStats();
    }
  } else {
    const hel = document.getElementById('h-elementalsystem');
    if(hel) hel.remove();
  }
  } finally { window.updateHeader._running = false; }
}
window.updateHeader = updateHeader;

function renderThinking(){ $('thinking').style.display=S.loading?'flex':'none'; }
window.renderThinking = renderThinking;

function renderChoices(){
  $('choices').innerHTML=S.choices.map((c,i)=>{
    const hint=getChoiceDiceHint(c);
    const prefix=hint?`<span style="color:#c8a96e;font-size:10px;font-family:'Cinzel',serif;margin-right:5px;opacity:0.8">🎲${typeof getEntityIconHTML==='function'?getEntityIconHTML(hint,{size:10}):(hint.icon)}${hint.stat}</span>`:'';
    return `<button class="choice" data-choice-idx="${i}" onclick="pickChoiceByIdx(this)">${prefix}${esc(c)}</button>`;
  }).join('');
}
window.renderChoices = renderChoices;

function doReincarnate(){
  if(window._reincRunning) return;
  window._reincRunning = true;
  const btn = document.getElementById('reinc-start-btn');
  if(btn) btn.disabled = true;
  // [BUG FIX] 이 함수는 200줄이 넘는 정리 로직(lsDel 수십 회 + 여러 시스템의
  // clear 함수 호출)을 실행하는데, 그중 단 하나라도 예외를 던지면 함수가
  // 그 줄에서 멈춰버려 마지막의 화면 전환(showScreen('scenario'))과
  // window._reincRunning = false 복구까지 도달하지 못했다. 그 결과
  // "새 삶 시작" 버튼을 눌러도 아무 반응이 없고, 버튼은 disabled 상태로
  // 영구히 잠기며, 다시 클릭해도 47563줄의 가드 때문에 재시도조차 막히는
  // 증상이 발생했다. 전체를 try/finally로 감싸 어떤 에러가 나든 반드시
  // 화면 전환과 플래그 복구가 실행되도록 한다.
  try{
  // ── [수정] 플레이어가 선택한 스탯 2개 사용, 미선택 시 랜덤 fallback ──
  let pickedStats;
  if(window._reincSelected && window._reincSelected.size >= 2){
    pickedStats = Array.from(window._reincSelected);
    // 실제 permStatBonus에 반영
    const perm = loadPermStatBonus();
    pickedStats.forEach(k=>{ perm[k] = (perm[k]||0) + 2; });
    savePermStatBonus(perm);
  } else {
    pickedStats = rollPermStatBonus(); // 기존 랜덤 방식 fallback
  }
  window._reincCandidates = null;
  window._reincSelected = null;
  const permBonus = loadPermStatBonus();
  const bonuses = permBonus; // 전체 누적값을 pastLife에 저장
  // 골드 인계
  const inherit = getReincarnationInheritance();
  if(inherit.goldRetention > 0){ S.gold = Math.min(S.gold, inherit.goldRetention); saveGold(S.gold); }
  const cycle=(loadCycleCount()||0)+1; saveCycleCount(cycle);
  window.updateStats('reincarnationCount',1);
  // 회차마다 세계의 별의 의지 재할당
  if (typeof assignWorldWill === 'function') assignWorldWill(cycle);
  // [연결] 회차 시작 시 배정되어야 하는 계승 시스템 — 별자리 운세, 동적 클리어 목표
  try{
    if(typeof assignConstellation==='function') assignConstellation();
    if(typeof assignRandomGoal==='function') assignRandomGoal(S.scenario?.id, cycle);
    if(typeof decipherInscriptionLine==='function') decipherInscriptionLine(cycle);
    if(typeof evolvNaturalLaw==='function') evolvNaturalLaw(cycle);
    if(typeof growInstinct==='function') growInstinct(cycle);
    if(typeof growMentalCorruption==='function') growMentalCorruption(cycle);
    if(typeof growPastLanguage==='function') growPastLanguage(cycle);
    if(typeof growSoulFrequency==='function'){
      const _bondData = (typeof loadBondTree==='function') ? loadBondTree() : {deepBonds:0};
      growSoulFrequency(cycle, _bondData.deepBonds||0);
    }
    if(typeof growWorldMemory==='function') growWorldMemory(Math.round(S.stats?.krma||50), cycle);
    if(typeof checkCursedCycle==='function') checkCursedCycle(cycle);
    if(typeof overcameCursedCycle==='function') overcameCursedCycle(cycle-1);
    if(typeof recordDreamProphecy==='function') recordDreamProphecy(S.stats?.wil||10, S.scenario?.id);
    if(typeof recordMemoryDistort==='function') recordMemoryDistort(S.stats?.wil||10);
    if(typeof loadLoopersGuild==='function'){
      const _guildStatus = loadLoopersGuild();
      if(_guildStatus?.status==='member' && typeof rankUpGuild==='function'){
        const _newRank = rankUpGuild();
        if(_newRank) toast(`🌀 환생자 길드 승급: ${_newRank.label}`, 4000);
      }
    }
    if(typeof resetCausalityOnReincarnate==='function') resetCausalityOnReincarnate(cycle);
    if(typeof resetPastPrayerCycle==='function') resetPastPrayerCycle();
    if(typeof resetTimeTokens==='function') resetTimeTokens();
    if(typeof resetUndyingGaugeCycle==='function') resetUndyingGaugeCycle();
    if(typeof triggerMemoryFlood==='function') triggerMemoryFlood(S.stats?.wil||10, cycle);
    if(typeof recordLanguageMemory==='function' && typeof loadLanguages==='function'){
      const _learnedLangs = loadLanguages();
      if(_learnedLangs?.length) recordLanguageMemory(_learnedLangs[_learnedLangs.length-1].id);
    }
    if(typeof updateRecipeBook==='function') updateRecipeBook(cycle);
    if(typeof upgradeHideout==='function') upgradeHideout(cycle);
    if(typeof progressWatcherGaze==='function') progressWatcherGaze(cycle);
    if(typeof drawFateCards==='function') window._reincFateCardChoices = drawFateCards();
  }catch(e){}
  // 환생 제작 포인트 지급
  const rcPtsEarned = calcReincCraftPoints(cycle);
  saveRCPoints(loadRCPoints() + rcPtsEarned);
  toast(`✨ 환생 포인트 +${rcPtsEarned}pt 획득! (총 ${loadRCPoints()}pt)`, 4000);
  // 이번 환생에서 오른 스탯 알림
  const pickedNames = pickedStats.map(k=>{ const i=getStatInfo(k); return (i?.icon||'')+(i?.name||k); }).join(' · ');
  setTimeout(()=>toast(`📈 스탯 상승: ${pickedNames} (+2 each)`, 4000), 1500);
  // ── [추가] 환생 후 스탯 상승 시각적 팝업 연출 ──
  setTimeout(()=>showStatRisePopups(pickedStats), 800);
  saveJobToMemory(); // 직업 기억 저장
  window.updateStats('totalPlayMs', Date.now()-window.playStartTime);
  window.playStartTime = Date.now();
  if(cycle>=1) unlockAchievement('first_reinc');
  if(cycle>=3) unlockAchievement('reinc_3');
  // ── [추가] 레거시 칭호 조건 체크 ──
  checkAndGrantLegacyTitles();
  savePastLife({name:S.character?.name,role:S.character?.role,race:S.character?.race,stats:S.stats,statBonuses:bonuses,karmaScore:Math.round(S.stats.krma||50),savedAt:new Date().toISOString()});
  S.pastLifeData={statBonuses:bonuses};
  // 리셋
  // 장착 효과 먼저 제거
  if(S.equipped) Object.values(S.equipped).filter(Boolean).forEach(item=>{
    if(item.effects) Object.entries(item.effects).forEach(([k,v])=>{
      if(S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v);
    });
  });
  clearEquipped();
  saveSetBonuses({});
  S.equipped = Object.fromEntries(EQUIP_SLOTS.map(s=>[s.id,null]));
  // [BUG24 FIX] clearEquipped 중복 호출 제거 (위에서 이미 한 번 호출함)
  clearSession(); clearMemory(); clearNPCs(); clearJobSkills(); clearSkills(); clearSkillSP();
  if(typeof clearReligionState==='function') clearReligionState();
  if(typeof pmClearAll==='function') pmClearAll();
  // [버그 수정] 환생 계승 규칙(getReincarnationInheritance)에 인벤토리는 계승 항목이
  // 아닌데도(스탯/골드/유물/칭호/스킬기억만 계승) 실제로는 지워지는 코드가 없어서
  // 이전 생의 아이템을 그대로 들고 시작하던 문제.
  // [버그 수정] 포로 목록·일반 퀘스트·종족 변환 기록은 이번 생 한정 상태인데
  // 환생 시 지워지는 코드가 없어서 이전 생의 기록이 그대로 남아있던 문제.
  // [버그 수정] 권속 시스템 핵심 데이터(THRALL_KEY)는 clearNpcInspire 등
  // 세부 함수만 부르고 정작 본체는 안 지워서, 환생해도 이전 생의 권속들이
  // 그대로 남아있던 문제. 비밀 목록·현재 트라우마도 이번 생 한정 상태.
  // [버그 수정] 현재 회차 악당(마왕) 성장 데이터는 이번 생 한정 상태.
  if(typeof clearVillainData==='function') clearVillainData();
  if(typeof clearThrall==='function') clearThrall();
  if(typeof clearSecrets==='function') clearSecrets();
  if(typeof clearTraumas==='function') clearTraumas();
  if(typeof clearPrisoners==='function') clearPrisoners();
  if(typeof clearQuests==='function') clearQuests();
  if(typeof clearRace==='function') clearRace();
  if(typeof clearInventory==='function') clearInventory();
  S.inventory = [];
  S.equipped=Object.fromEntries(EQUIP_SLOTS.map(s=>[s.id,null]));
  // [BUG10 FIX] saveStatPoints(0)을 clearPlayerLevel/Exp 이전에 먼저 처리
  saveStatPoints(0);
  S._passiveSkillBonus = {}; // 패시브 스킬 보너스 추적 초기화
  S._runeGemStatBonus = {};  // 룬/보석 보너스 추적 초기화
  // 게임 상태 초기화
  clearPlayerLevel(); clearPlayerExp();
  saveSetBonuses({});
  clearAffinity(); // 속성 상성 초기화
  lsDel(MAIN_QUEST_KEY); // 구버전 키 호환
  // 시나리오별 메인 퀘스트 키 전체 삭제
  Object.keys(_memStore).filter(k=>k.startsWith(MAIN_QUEST_KEY+'-')).forEach(k=>lsDel(k));
  lsDel(CHOICE_HISTORY_KEY);
  lsDel(WORLD_STATE_KEY);
  lsDel(WORLD_REACTION_KEY);
  lsDel(FACTION_KEY);
  lsDel(NPC_NETWORK_KEY);
  // [BUG FIX] MATERIAL_KEY는 어디에도 정의되지 않은 변수였다 — 이 줄에
  // 도달하는 순간 ReferenceError가 발생해 doReincarnate 전체가 멈추고
  // "새 삶 시작" 버튼이 먹통이 되는 근본 원인이었다. 실제 재료 시스템은
  // MATERIAL_BAG_KEY('tf-materials')로 저장되며 바로 다음 줄에서 이미
  // 지워지므로, 안전한 형태로 교체.
  lsDel(typeof MATERIAL_KEY!=='undefined' ? MATERIAL_KEY : 'tf-materials');
  lsDel(MATERIAL_BAG_KEY); // 재료 수량 초기화 (환생 시 리셋)
  // ※ DYN_MAT_KEY(재료 정의), DYN_ENEMY_KEY(적 정보), DYN_BP_KEY(설계도)는 유지
  lsDel(DIARY_KEY);
  // [BUG FIX] GAME_TIME_KEY 미정의 → ReferenceError 원인. 실제 시간 시스템
  // 저장 키는 'tf-game-time' (loadGameTime/saveGameTime이 사용).
  lsDel(typeof GAME_TIME_KEY!=='undefined' ? GAME_TIME_KEY : 'tf-game-time');
  lsDel('tf-timecost'); // 시간 누적값 초기화
  if(typeof TIMELINE_KEY!=='undefined') lsDel(TIMELINE_KEY);
  lsDel(typeof PREV_DESC_KEY!=='undefined' ? PREV_DESC_KEY : 'tf-prev-narrations');
  lsDel('tf-boss-state');
  lsDel(typeof SKILL_XP_KEY!=='undefined' ? SKILL_XP_KEY : 'tf-skill-xp');
  lsDel('tf-titles');
  lsDel('tf-npc-events');
  lsDel('tf-boss-hp');
  lsDel(ACADEMY_KEY);
  // [버그 수정] tf-boss-hp-cache가 환생 초기화 목록에 없어 이전 생의
  // 보스 HP가 새 생에 잔류할 위험이 있던 부분 — 추가
  lsDel(typeof BOSS_HP_KEY!=='undefined' ? BOSS_HP_KEY : 'tf-boss-hp-cache');
  // [BUG FIX] JAIL_KEY 미정의 → ReferenceError 원인. 실제 키는 'tf-jail'.
  lsDel(typeof JAIL_KEY!=='undefined' ? JAIL_KEY : 'tf-jail');
  lsDel(BATTLE_LOG_KEY);
  // [BUG FIX] FAME_KEY 미정의 → ReferenceError 원인. 실제 명성 시스템
  // 저장 키는 'tf-world-fame'.
  lsDel(typeof FAME_KEY!=='undefined' ? FAME_KEY : 'tf-world-fame');
  lsDel(EXPLORE_KEY);
  lsDel('tf-fired-events');
  lsSet('tf-fired-events', '[]');
  lsDel(WORLD_EVENT_KEY);
  lsDel(BOSS_KEY);
  // [BUG FIX] STATUS_KEY 미정의 → ReferenceError 원인. 실제 상태이상
  // 시스템 저장 키는 STATUS_STATE_KEY('tf-status-effects') — 이미
  // 다른 곳에서 정의된 변수이므로 그것을 우선 사용.
  lsDel(typeof STATUS_STATE_KEY!=='undefined' ? STATUS_STATE_KEY : (typeof STATUS_KEY!=='undefined' ? STATUS_KEY : 'tf-status-effects'));
  lsDel(PARTY_KEY);
  lsDel(JOB_TURN_KEY);
  lsDel(NPC_QUEST_STATE_KEY);
  lsDel(CURRENT_LOC_KEY);
  lsDel(RELIC_OWNED_KEY);
  lsDel(SKILL_COMBO_KEY);
  lsDel(LOCATION_KEY);
  lsDel(NPC_MEMORY_KEY);
  lsDel(EVO_KEY);
  lsDel(REPUTATION_KEY);
  // ── 누락된 퀘스트 관련 키 초기화 ──
  lsDel(EPIC_QUEST_KEY);       // 에픽 퀘스트 진행 상태
  lsDel(HIDDEN_QUEST_KEY);     // 히든 퀘스트 진행 상태
  lsDel('taleforge-quest-history'); // 퀘스트 히스토리 로그
  lsDel(QUEST_CHOICES_KEY);    // 퀘스트 선택 기록
  lsDel('tf-npc-dlg-quests'); // NPC 대화 의뢰 초기화
  if(typeof clearAtmosphere==='function') clearAtmosphere(); // 🌦️ 날씨/시간대 초기화 (이번 생 한정 상태, 다음 생은 다시 배정되어야 함)
  clearDemonCorruption();      // 😈 악마족 타락 시스템 초기화
  if(typeof clearDragonHeart==='function') clearDragonHeart();         // 🐉 드래곤혈 용심 시스템 초기화
  if(typeof clearNpcCorruption==='function') clearNpcCorruption(); // 😈 NPC 타락 데이터 초기화
  if(typeof clearElfMemory==='function') clearElfMemory();         // 🧝 엘프족 기억 시스템 초기화
  if(typeof clearDarklingVoid==='function') clearDarklingVoid();   // 🌑 다크링 공허 잠식 초기화
  if(typeof clearDeathEcho==='function')   clearDeathEcho();       // 💀 다크링 죽음의 메아리 초기화
  if(typeof clearVoidSummon==='function')  clearVoidSummon();      // 🌀 다크링 균열 소환 초기화
  if(typeof clearShadowPact==='function')  clearShadowPact();      // 🖤 다크링 그림자 협약 초기화
  if(typeof clearDwarfCraft==='function') clearDwarfCraft();       // 🔨 드워프족 장인 각인 초기화
  if(typeof clearGorblood==='function')  clearGorblood();          // 😤 오크족 혈전 게이지 초기화
  if(typeof clearNpcCraft==='function')   clearNpcCraft();         // 🔨 드워프 NPC 강화 초기화
  if(typeof clearCelestialScale==='function') clearCelestialScale(); // 💛 세레스티얼 신성 천평 초기화
  if(typeof clearCelestialCovenant==='function') clearCelestialCovenant(); // 💛 세레스티얼 신성 계율 초기화
  if(typeof clearElementalSystem==='function') clearElementalSystem(); // 🌀 원소인 원소 계약 시스템 초기화
  if(typeof clearOrcHonor==='function') clearOrcHonor();               // 😤 오크족 명예 게이지 초기화
  if(typeof clearNpcInspire==='function') clearNpcInspire();           // ✨ NPC 감화 데이터 초기화
  if(typeof clearNpcGrowth==='function') clearNpcGrowth();             // 📈 NPC 성장 데이터 초기화
  if(typeof clearUndeadBorrowedTime==='function') clearUndeadBorrowedTime(); // 💀 언데드 수명 시스템 초기화
  if(typeof clearBeastWildlaw==='function') clearBeastWildlaw();       // 🐺 수인족 야생법 초기화
  if(typeof clearBeastAwakening==='function') clearBeastAwakening();   // 🐾 수인족 야수 각성 초기화
  window._gsFlags = {};                                  // 인메모리 플래그 초기화
  // 콤보 리셋
  window.comboState = { count:0, lastTurn:0, maxCombo:0 };
  S._comboBonus = 0; S._partyBonus = {}; S._statusStatBonus=0; S._statusStatPenalty=0; clearSkillEnhance();
  // ── 새 시스템 리셋 ──────────────────────────────────────────────
  lsDel('tf-food-water');       // 식량/수분
  lsDel('tf-black-market');     // 암시장
  lsDel('tf-world-timer');      // 월드 타이머(둠 클락)
  lsDel('tf-faction-pursuit');  // 세력 추격
  lsDel('tf-wdr-npcs');         // 방랑자 NPC 풀 (새 게임마다 재생성)
  lsDel('tf-wdr-axis');         // 혼돈/질서 수치
  lsDel('tf-wdr-plaus');        // 개연성 수치
  // ── 영지 경영 시스템 전체 초기화 (v4 기본 + v5/RivalDomain/WSI) ──
  lsDel('tf-demesne');           // 영지 v4 기본 데이터 (건물·세수·인구·정책 등)
  lsDel('tf-demesne-v5');        // 영지 v5 확장 (건설대기열·봉신위기·점령 등)
  lsDel('tf-rival-domains');     // NPC 영지 침략·찬탈 기록
  lsDel('tf-thrall-system');     // 권속·혈통 지배 시스템
  lsDel('tf-vampire-chronicle'); // 뱀파이어 피의 연대기
  lsDel('tf-prisoners');         // 포로 목록
  lsDel('tf-world-settlements'); // 세계 도시 관리 상태
  lsDel('tf-demesne-notified');  // 영지 해금 알림 플래그 (새 생에서 다시 뜨도록)
  // AI 생성 게시판 초기화 (이전 캐릭터용 의뢰 제거)
  lsDel('tf-ai-bulletin');
  // PM 파트별 기억 초기화 (이전 생의 NPC 기억이 섞이지 않도록)
  ['tf-pm-npc','tf-pm-world','tf-pm-quest','tf-pm-demesne','tf-pm-personal','tf-pm-choices'].forEach(k=>lsDel(k));
  // 상점 재고 캐시 초기화 (새 캐릭터에 맞는 재고로)
  lsDel('tf-shop-stock-cache');
  // NPC 대화 주제 캐시는 환생 후에도 유지 (전생 기억 느낌)
  // 게시판 갱신 타임스탬프 초기화
  Object.keys(_memStore||{}).filter(k=>k.startsWith('tf-bulletin-last-refresh-')).forEach(k=>lsDel(k));
  // 전직 자동 알림 기록 초기화 (새 생에서 다시 팝업 뜨도록)
  lsDel('tf-job-auto-notified');
  // ── 환생 초기화 누락분 보강 [검증 완료 - 실제 미초기화 확인됨] ──
  // [버그 수정] 트라우마·정신오염 저장 로직이 'tf-traumas'/'tf-mental-corruption'
  // (존재하지 않는 키)에 쓰고 있던 것을 saveTraumas()/saveMentalCorruption()으로
  // 교정했다. 따라서 환생 초기화도 실제 키(taleforge-trauma, taleforge-mental-corruption)를
  // 지워야 진짜로 초기화된다 — 기존의 잘못된 키 삭제는 과거 세이브 잔재 정리용으로 남겨둔다.
  lsDel('tf-traumas');           // (구) 잘못된 키 — 과거 세이브 잔재 정리
  lsDel('taleforge-trauma');     // 트라우마 기록 실제 키 (이전 생 트라우마가 새 캐릭터에 남던 버그)
  lsDel('tf-mental-corruption');        // (구) 잘못된 키 — 과거 세이브 잔재 정리
  lsDel('taleforge-mental-corruption'); // 정신 오염 실제 키 (이전 생 오염도 잔류 버그)
  lsDel('tf-job-history');        // 직업 변경 이력 (이전 생 직업 기록 잔류 버그)
  lsDel('tf-social-rank-log');    // 신분 변화 이력 (이전 생 신분 기록 잔류 버그)
  lsDel('tf-faction-sim');        // 세력 자율 시뮬레이션 상태 (이전 생 세력 균형 잔류 버그)
  lsDel('tf-faction-goals');      // 세력 자체 장기 목표 진행 상태 — 다음 생에서 새로 시작
  lsDel('tf-npc-bonds');          // NPC-NPC 독립 관계 진행 상태 — 다음 생에서 새로 시작
  lsDel('tf-discovered-hidden-locs'); // 숨겨진 종족 거주지 발견 기록 — 다음 생에서 다시 발견해야 함
  // [F-BUG 수정] tf-primal-forge-last-gather(태초의 화로 채집 쿨다운)를
  // 클리어하지 않으면, 각 생의 턴 카운터(S.msgCount)가 매번 0부터 다시
  // 시작하는 탓에 새로운 생에서 화로에 가도 "직전 생에 채집했던 턴"과
  // 비교되어 불필요하게 다시 쿨다운에 걸리는 문제가 있었다. 장소 자체의
  // 영구 개방(tf-permanent-unlocked-locs)과 달리, 채집 쿨다운은 매 생
  // 새로 시작하는 게 자연스러우므로 초기화한다.
  lsDel('tf-primal-forge-last-gather');
  // [신규] 전설의 사냥터 쿨다운도 동일한 이유(턴 카운터가 매 생 0부터
  // 시작)로 초기화한다 — 새 생에서 즉시 다시 사냥 가능해야 한다.
  lsDel('tf-legendary-hunt-last');
  // [신규] 종족-직업 정체성 부조화는 "이번 생의 종족과 직업 사이의
  // 긴장"이므로, 다음 생에서 다른 종족/직업 조합을 선택하면 처음부터
  // 다시 계산되어야 한다 — 칭호(영구)와 달리 이건 그 생에 국한된 여정이다.
  lsDel('tf-race-job-dissonance');
  lsDel('tf-race-job-dissonance-resolved');
  lsDel('tf-race-job-dissonance-stat-applied');
  lsDel('tf-watcher-stage'); // 감시자 대면 진행 단계 — 다음 생에서 처음부터 다시
  lsDel('tf-watcher-stage-turn'); // 감시자 대면 단계 진행 턴 추적
  lsDel('tf-combat-state');       // 전투 상태 (환생 시점 전투 잔류 데이터 방지)
  lsDel('tf-quest-history');      // 퀘스트 히스토리 (이전 생 퀘스트 기록 잔류 버그)
  // [재설계] tf-seal-restore를 지우기 전에, "이번 생에서 실제로 복원한
  // 봉인석 이름"만 따로 tf-seal-mastered(영구 보존)에 누적 저장한다.
  // 이게 사용자가 원한 정확한 조건이다 — 단순히 "환생했다"가 아니라
  // "이 특정 봉인석을 한 번이라도 실제로 재건해본 적이 있는가"를 추적.
  try{
    const _sealRestoreSnapshot = JSON.parse(lsGet('tf-seal-restore')||'{}');
    const _restoredNames = Object.entries(_sealRestoreSnapshot).filter(([,v])=>v?.restored).map(([k])=>k);
    if(_restoredNames.length){
      const _mastered = JSON.parse(lsGet('tf-seal-mastered')||'[]');
      const _merged = Array.from(new Set([..._mastered, ..._restoredNames]));
      lsSet('tf-seal-mastered', JSON.stringify(_merged));
    }
  }catch(e){}
  lsDel('tf-seal-restore');       // 봉인석 복원 진행도 (이전 생 메인 시나리오 진행 잔류 버그) — 복원 자체는 이번 생에서 다시 해야 함
  // [신규] tf-seal-discovery(어디에 봉인석이 있는지 아는 것)는 환생해도
  // 지우지 않는다 — "전생의 기억"으로 자연스럽게 유지. 15회차까지 매번
  // 처음부터 10개를 다시 찾아야 한다면 너무 가혹하므로, 위치를 아는 것은
  // 기억하되 실제 복원(관계·조건 충족)은 이번 생에서 다시 해야 하는 절충.
  // tf-seal-mastered(한 번이라도 재건해본 봉인석 목록)는 절대 지우지 않음 —
  // 영구 보존 데이터.
  lsDel('tf-seal-visit-track');   // 대륙별 체류 턴수 추적 — 발견 방식이 바뀌어 더 이상 사용 안 함, 안전하게 정리만
  lsDel('tf-catastrophe-fired');   // 발동한 재앙 목록 — 다음 생에서 다시 겪을 수 있도록 초기화
  lsDel('tf-catastrophe-active');  // 진행 중인 재앙 상태 — 새 생에서 잔류 방지
  // 참고: tf-discovered-monsters/skills, tf-visited-locations/continents는
  // 도감·여행기록류로 환생 후에도 유지되는 게 일반적 게임 디자인이라 의도적으로 보존함
  // S 인메모리 전투/생존 상태 초기화
  if(S){ S._fatigue=0; S._nearDeathTurns=0; S._skillCooldowns={}; S._enemyMorale=80;
    S._inCombat=false; S._terrainId=null; S._combatInjury={}; S._foodWaterPenalty=0; }

  S.messages=[]; S.choices=[]; S.loading=false; S.initialized=false; S.msgCount=0;
  S.character=null; S.scenario=null;
  }catch(e){
    // [BUG FIX] 정리 로직 중 어디서 에러가 나든 여기서 잡아 콘솔에 남기고,
    // 사용자에게도 알려서 "조용히 멈춤" 대신 무엇이 실패했는지 알 수 있게 한다.
    console.error('[doReincarnate] 환생 처리 중 오류 발생:', e);
    try{ toast('⚠️ 환생 처리 중 일부 오류가 발생했지만 새 삶을 시작합니다', 4000); }catch(_e){}
    // 에러가 나도 최소한의 초기화는 보장 — 캐릭터 화면에 갇히지 않도록
    S.messages=[]; S.choices=[]; S.loading=false; S.initialized=false; S.msgCount=0;
    S.character=null; S.scenario=null;
  }finally{
    // [BUG FIX] 위에서 무슨 일이 있었든 반드시 실행 — 버튼 잠금 해제 +
    // 재시도 가능 + 새 게임 시작 화면으로 전환.
    window._reincRunning = false;
    if(btn) btn.disabled = false;
    window.selScenarioId=null;
    try{ showScreen('scenario'); renderScenarios(); }catch(e2){ console.error('[doReincarnate] 화면 전환 실패:', e2); }
  }
}
window.doReincarnate = doReincarnate;

// ══════════════════════════════════════════════════════════════════
// [신규] 몬스터 컨셉 생성 — 그동안 "몬스터 생성"이라 부르던 것은 사실
// AI 서사에 우연히 등장한 이름을 사후에 감지/등록(autoDetectAndRegisterEnemy)
// 하는 것뿐이었고, checkRandomEncounter는 설계상 AI 호출이 없는 순수
// 시스템이라 스스로 새 몬스터를 "만들어내지"는 못했다. 이 함수가 그 공백을
// 메운다 — 로컬 모델을 메인으로, API를 보조로 써서 진짜로 새로운 몬스터
// "개체"를 만들고 장소 풀에 등록해 다음 인카운터부터 실제로 등장하게 한다.
// 원칙은 그대로 유지: AI는 이름의 수식어(변형)와 소문(lore) — 즉 순수
// 창작 영역만 맡고, 이름에 반드시 MONSTER_TIER_TABLE의 실제 키워드가
// 포함되도록 강제해 스탯(hp/atk/def/tier)은 항상 getMonsterTierStats가
// 결정론적으로 계산한다. AI가 그 규칙을 어겨도 로컬에서 키워드를 강제로
// 붙여 보정하므로 밸런스가 깨지지 않는다.
// ══════════════════════════════════════════════════════════════════
const MONSTER_LORE_KEY = 'tf-ai-monster-lore';

function loadMonsterLoreMap(){ try{ return JSON.parse(lsGet(MONSTER_LORE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadMonsterLoreMap = loadMonsterLoreMap;

function saveMonsterLoreMap(d){ try{ lsSet(MONSTER_LORE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveMonsterLoreMap = saveMonsterLoreMap;

function registerMonsterLore(name, lore){
  if(!name || !lore) return;
  const map = loadMonsterLoreMap();
  map[name] = lore;
  saveMonsterLoreMap(map);
}
window.registerMonsterLore = registerMonsterLore;

function getMonsterLore(name){
  if(!name) return null;
  const map = loadMonsterLoreMap();
  return map[name] || null;
}
window.getMonsterLore = getMonsterLore;

const MONSTER_NAME_ADJ_BANK = [
  '그림자에 물든', '핏빛 눈의', '뒤틀린', '굶주린', '서리 맺힌',
  '녹슨 사슬을 두른', '안개 속에서 나온', '오래된 저주에 물든',
  '검은 갈기의', '일그러진', '상처투성이', '흉터 가득한', '반쯤 썩은',
  '이름 없는', '눈이 붉게 빛나는',
];
function composeLocalMonsterName(baseWord){
  const adj = MONSTER_NAME_ADJ_BANK[Math.floor(Math.random()*MONSTER_NAME_ADJ_BANK.length)];
  return `${adj} ${baseWord}`;
}
const MONSTER_LORE_BANK = [
  '평범한 개체와는 눈빛부터 다르다는 목격담이 있다.',
  '이 근방에서 최근에야 나타나기 시작했다는 소문이 돈다.',
  '왜 이런 모습이 되었는지 아는 이는 아직 없다.',
  '보통 개체보다 훨씬 사납다는 이야기가 떠돈다.',
  '이 지역 사냥꾼들 사이에서 조심하라는 말이 돌기 시작했다.',
];
function composeLocalMonsterLore(baseWord){
  return MONSTER_LORE_BANK[Math.floor(Math.random()*MONSTER_LORE_BANK.length)];
}

// 이 장소에 어울리는 티어(강함)를 고른다 — 손으로 레벨을 매기는 대신,
// 이미 이 장소에 실제로 등장했던(혹은 이 장소 유형의 하드코딩 풀에 있는)
// 몬스터 이름 하나를 표본으로 뽑아 그 티어를 기준으로 삼는다. 이러면
// getLocationLevelBand 등 다른 시스템과 별도의 계산식을 새로 만들 필요 없이
// checkRandomEncounter가 이미 쓰는 것과 같은 "그 장소다움"을 그대로 물려받는다.
function _pickMonsterConceptTierRow(loc){
  try{
    const typePool = (loc && LOC_MONSTER_POOL[loc.type]) || LOC_MONSTER_POOL.city || [];
    const locTypePool = (loc && Array.isArray(loc.monsters) && loc.monsters.length) ? loc.monsters.concat(typePool) : typePool;
    const existingPool = (loc && loc.name && typeof getLocationMonsterPool==='function') ? getLocationMonsterPool(loc.name) : [];
    const nameSource = existingPool.length ? existingPool : (locTypePool||[]).map(p=>p.name);
    let sampleTier = 3;
    if(nameSource.length){
      const sampleName = nameSource[Math.floor(Math.random()*nameSource.length)];
      sampleTier = getMonsterTierStats(sampleName).tier;
    }
    // 살짝의 편차(-1~+1)를 줘서 같은 이름만 계속 반복되지 않게 한다.
    const jitter = Math.random()<0.35 ? -1 : (Math.random()<0.7 ? 0 : 1);
    const targetTier = Math.min(13, Math.max(1, sampleTier + jitter));
    const rows = MONSTER_TIER_TABLE.filter(r=>r.tier===targetTier);
    if(rows.length) return rows[Math.floor(Math.random()*rows.length)];
    const fallbackRows = MONSTER_TIER_TABLE.filter(r=>r.tier===sampleTier);
    return fallbackRows.length ? fallbackRows[Math.floor(Math.random()*fallbackRows.length)] : MONSTER_TIER_TABLE[0];
  }catch(e){ return MONSTER_TIER_TABLE[0]; }
}

async function generateAIMonsterConcept(){
  try{
    const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    const locName = loc ? (loc.name||'') : '';
    if(!locName) return;
    if(typeof shouldGenerateNewMonster==='function' && !shouldGenerateNewMonster(locName)) return;

    const row = _pickMonsterConceptTierRow(loc);
    if(!row || !row.keywords || !row.keywords.length) return;
    const baseWord = row.keywords[Math.floor(Math.random()*row.keywords.length)];

    const prompt = `당신은 판타지 세계관의 몬스터 설정 작가입니다. 아래 기본 종류를 바탕으로, 이 세계관에 어울리는 개성 있는 "변형 개체" 이름과 짧은 소문/특징을 만드세요.
[장소] ${locName}
[기본 종류] ${baseWord}
[등급] ${row.label}
반드시 다음 규칙을 지켜 JSON만 출력하세요:
- name: 반드시 "${baseWord}"라는 단어를 그대로 포함해야 하며, 그 앞이나 뒤에 짧은 수식어만 붙인 형태여야 합니다(예: "그림자에 물든 ${baseWord}"). 절대 완전히 다른 생물 이름으로 바꾸지 마세요.
- lore: 이 개체에 대한 1문장짜리 짧은 소문이나 특징.
{"name":"...", "lore":"..."}`;

    const result = await tryCloudThenLocalModelThenBank(
      async () => {
        const raw = await callGeminiDirect(prompt, 200);
        if(raw && raw.name) recordMarkovSample('monster_name', raw.name);
        if(raw && raw.lore) recordMarkovSample('monster_lore', raw.lore);
        return (raw && raw.name) ? raw : null;
      },
      async () => {
        const raw = await callLocalModelJSON(prompt, { maxTokens: 150 });
        if(raw && raw.name) recordMarkovSample('monster_name', raw.name);
        if(raw && raw.lore) recordMarkovSample('monster_lore', raw.lore);
        return (raw && raw.name) ? raw : null;
      },
      () => ({ name: composeLocalMonsterName(baseWord), lore: composeLocalMonsterLore(baseWord) }),
      '몬스터 컨셉 생성'
    );
    if(!result || !result.name) return;

    // [안전장치] AI/로컬 모델이 규칙을 어기고 기본 단어를 빼먹었다면,
    // 스탯 티어 매칭이 깨지지 않도록 로컬에서 강제로 붙여 보정한다.
    const rawName = String(result.name).trim();
    const finalName = rawName.includes(baseWord) ? rawName : `${rawName} ${baseWord}`;

    if(typeof registerLocationMonster==='function') registerLocationMonster(locName, finalName);
    if(result.lore) registerMonsterLore(finalName, String(result.lore).trim());
    // [진단용] 성공 시점에도 남겨야 확인 가능 — tryCloudThenLocalModelThenBank는
    // 실패할 때만 진단 로그를 남기므로, 이 로그가 없으면 "한 번이라도 실제로
    // 발동됐는지"를 진단 로그만으로는 확인할 방법이 없었다.
    if(typeof logLocalModelEvent==='function') logLocalModelEvent('[몬스터 생성] "'+finalName+'"을(를) "'+locName+'" 풀에 등록'+(result.lore?' · 소문: '+String(result.lore).trim().slice(0,60):''));
  }catch(e){ console.warn('[generateAIMonsterConcept]', e); }
}
window.generateAIMonsterConcept = generateAIMonsterConcept;

function checkRandomEncounter(userMsg){
  try{
    if(!userMsg) return;
    // 이미 전투 중이면 발동하지 않음
    const isInCombat = (typeof loadMonsters==='function') && (loadMonsters()||[]).some(m=>m.status==='alive');
    if(isInCombat) return;
    // [12차 수정] 실제 여행(startLandTravel/tickLandTravel) 중에는 이 함수가
    // window.currentLocation(며칠 전에 떠난 출발지에 계속 고정돼 있음)의
    // 생태계를 기준으로 조우를 굴린다 — "숲을 탐험한다"처럼 이동/탐험 키워드가
    // 든 문장을 치면, 이미 여행 자체가 자기 조우 시스템(TRAVEL_ENCOUNTER_POOL,
    // tickLandTravel)을 갖고 있는데도 떠나온 도시 근방 몬스터가 또 튀어나오는
    // 개연성 오류가 생긴다. 여행 중엔 이 일반 조우를 건너뛴다.
    if(typeof window.loadTravelState==='function' && window.loadTravelState()) return;
    // 이동/탐험 의도가 있는 입력에만 발동 (대화·상점·휴식 등에는 발동 안 함)
    const movementRe = /가다|걸어가다|향하다|떠나다|이동한다|간다|탐험|살피다|조사하다|뒤지다|관찰하다|살펴본다|길을 나서|발걸음/;
    if(!movementRe.test(userMsg)) return;

    // [연결] 자연 파괴/보호 행동 감지
    if(typeof recordNatureAction==='function'){
      if(/베어|파괴하|불태우|오염시/.test(userMsg)) recordNatureAction('destroy');
      else if(/심는다|보호한다|치유한다|가꾼다/.test(userMsg)) recordNatureAction('protect');
    }

    // [이상 현상 하드코딩] 장소 레벨대를 완전히 무시하는 아주 희귀한 조우 —
    // 예전엔 AI 프롬프트의 "자연재해급 특수 등장(레벨 무시)" 지침 하나에만
    // 의존해서, API 없이 하드코딩하면 통째로 사라지는 부분이었다. 아래
    // 위기도/장소 기반 확률과 완전히 별개로 판정한다 — "어디서든, 언제든"
    // 일어날 수 있어야 하는 성질이라 장소 안전도의 영향을 받지 않는다.
    // 평균 약 670턴에 1번(0.15%) — 순수 잡담/뜬금없는 조우가 아니라 정말
    // 희귀한 사건으로 남도록 낮게 잡았다.
    if(Math.random() < 0.0015){
      const _anomaly = (typeof pickTierNameSample==='function') ? pickTierNameSample(10, 13) : null;
      if(_anomaly){
        const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
        monsters.push({
          id: 'anomaly_'+_anomaly.name+'_'+Date.now(),
          name: _anomaly.name, icon: '🌀',
          hp: _anomaly.hp, maxHp: _anomaly.hp, atk: _anomaly.atk, def: _anomaly.def,
          status:'alive', isBoss:true, isNamed:true, isAnomaly:true,
          tier:_anomaly.tier, element:_anomaly.element, weakElement:_anomaly.weakElement,
          resistElement:_anomaly.resistElement, skills:_anomaly.skills, trait:_anomaly.trait,
        });
        if(typeof saveMonsters==='function') saveMonsters(monsters);
        if(typeof renderMonsters==='function') renderMonsters();

        // [게임 전체 학습 시스템] 이 (사건종류+장소유형+등급) 조합을 AI가
        // 이미 충분히(15회+) 서술해본 적 있으면, 새로 써달라고 요청하는
        // 대신 그동안 쌓인 서술을 바로 재사용한다 — 이 턴은 AI 도움 없이
        // 완결된다. 처음 겪는 조합이면 지금까지처럼 AI에게 서술을 맡기고,
        // 그 결과를 다음 학습 예시로 쌓는다(recordSituationExample 호출부,
        // 서사 로그 저장 지점 참고).
        const _anomalyLoc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
        const _anomalyBucket = (typeof getSituationBucketKey==='function') ? getSituationBucketKey('anomaly', _anomalyLoc, _anomaly.tier) : null;
        const _anomalyLearned = (_anomalyBucket && typeof pickLearnedSituationExample==='function') ? pickLearnedSituationExample(_anomalyBucket, _anomaly.name) : null;
        if(_anomalyLearned){
          if(typeof addTimelineEvent==='function') addTimelineEvent('anomaly', _anomaly.name, {icon:'🌀'});
          S._nextInjectedContext = (S._nextInjectedContext||'')
            + `\n\n[🌀 이상 현상 — 이미 서술 확보됨] ${_anomalyLearned}`;
        } else {
          S._nextInjectedContext = (S._nextInjectedContext||'')
            + `\n\n[🌀 이상 현상 — 레벨 무시 돌발 조우] 이 장소에 전혀 어울리지 않는 압도적인 존재가 예고 없이 나타났다: ${_anomaly.name}(${_anomaly.label}). 이것은 이 지역의 평범한 위협이 아니다 — 원인 불명, 전조 없음. 플레이어가 감당하기엔 지나치게 강할 수 있음을 서사로 분명히 암시하되, 맞설지/도망칠지/숨을지/도움을 청할지는 전적으로 플레이어의 몫이다.`;
          S._pendingLearnBucket = _anomalyBucket;
          S._pendingLearnSubject = _anomaly.name;
        }
        toast(`🌀 이상 현상: ${_anomaly.name} 출현!`, 4500);
      }
      return; // 이상 현상이 발생했으면 이번 턴의 일반 인카운터 판정은 건너뜀
    }

    // 기본 확률 8% — 세계 위기도가 높을수록 위험 지역이 늘어나 확률 상승
    const crisis = (typeof getWorldCrisisLevel === 'function') ? getWorldCrisisLevel() : 0;
    let baseChance = 0.08 + (crisis/100) * 0.12; // 최대 20%
    // [v13] 탑승수단별 인카운터 배율 — 비행 수단은 지상 몬스터 인카운터를
    // 완전히 건너뛴다(대신 별도의 공중 전용 위험으로 대체됨).
    const _transportMult = (typeof getCurrentEncounterMult==='function') ? getCurrentEncounterMult() : 1.0;
    if(_transportMult <= 0) return;
    baseChance *= _transportMult;
    if(Math.random() > baseChance){
      // [연결] 몬스터 인카운터가 없을 때, 낮은 확률로 시나리오 특화 이벤트 시도
      try{
        if(Math.random() < 0.04 && typeof getScenarioEvent==='function'){
          const _scenEvent = getScenarioEvent(S.scenario?.id||'');
          if(_scenEvent){
            S._nextInjectedContext = (S._nextInjectedContext||'')
              +'\n\n[🎲 시나리오 이벤트: '+_scenEvent.icon+' '+_scenEvent.name+']\n'+_scenEvent.desc
              +'\n'+(_scenEvent.aiHint||'');
            toast(`${_scenEvent.name}`, 3000, _scenEvent);
          }
        }
      }catch(e){}
      return;
    }

    // 인카운터 발생 — 티어 테이블 기반 고정 스탯 (플레이어 레벨 무관)
    const _encScale = (typeof getEnemyScaleMultiplier === 'function') ? getEnemyScaleMultiplier() : {cycleMult:1};

    const ENCOUNTER_POOL = [
      {name:'들개 무리', icon:'🐺'}, {name:'도적단', icon:'🗡️'}, {name:'야생 멧돼지', icon:'🐗'},
      {name:'독거미', icon:'🕷️'}, {name:'까마귀 무리', icon:'🦅'}, {name:'유랑 강도', icon:'🔪'},
      {name:'늪지 괴물', icon:'🐊'}, {name:'박쥐 떼', icon:'🦇'},
    ];
    // [수정] 장소별 몬스터 풀(AI 서사로 실제 등장했던 몬스터들)을 우선
    // 참조한다 — 이 인카운터 로직은 AI 호출이 없는 순수 시스템이므로,
    // "새 몬스터 생성"은 여기서 할 수 없다(그건 AI 서술 경로의 몫). 대신
    // 그 장소 풀에 이미 등록된 몬스터가 있으면 60% 확률로 그걸 우선
    // 사용하고, 그렇지 않으면(풀이 비었거나 40% 확률) 기존 고정 풀에서
    // 뽑는다. 이렇게 하면 AI가 그 장소에서 만들어낸 몬스터들이 시스템
    // 인카운터에도 자연스럽게 섞여 들어가 세계의 일관성이 높아진다.
    const _curLoc4Enc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    const _curLocName4Enc = _curLoc4Enc ? (_curLoc4Enc.name||'') : '';
    const _locPool = _curLocName4Enc && typeof getLocationMonsterPool==='function' ? getLocationMonsterPool(_curLocName4Enc) : [];
    // [위치 인식] 이 장소에서 실제로 AI 서사에 등장했던 몬스터 기록(_locPool)이
    // 최우선 — "실제 플레이 중 이 장소에 나타났던 것"이 가장 그 장소다운
    // 선택이기 때문. 그 기록이 없거나 40% 확률로는, 장소 "유형"에 맞는
    // 하드코딩 풀(LOC_MONSTER_POOL)을 쓴다 — AI 호출 없이도 던전엔 던전다운,
    // 마을 근처엔 마을다운 몬스터가 나오게 하기 위함. 유형 풀도 없을 때만
    // 완전히 장소 무관한 범용 ENCOUNTER_POOL로 최종 폴백한다.
    // [수정] type이 LOC_MONSTER_POOL에 없는 장소(major, 혹은 앞으로 새로
    // 추가될 유형)가 완전히 장소 무관한 범용 풀로 폴백하던 문제 — city
    // 풀을 최종 안전망으로 둔다(대부분의 미분류 장소는 도시에 가깝다).
    const _typeBasePool4Enc = _curLoc4Enc ? (LOC_MONSTER_POOL[_curLoc4Enc.type] || LOC_MONSTER_POOL.city) : null;
    // [장소별 특색 몬스터] 일부 서사적으로 특별한 장소(수도, 유적, 특정
    // 던전 등)는 해당 장소 데이터에 직접 monsters 배열을 갖고 있다 — 같은
    // 유형이라도 이 장소만의 고유한 위협이 있다는 걸 보여주기 위함.
    // AI가 이 장소에서 아직 아무것도 서술하지 않았어도(_locPool이 비어도)
    // 유형 풀보다 우선 섞여 들어가도록 유형 풀 앞에 이어붙인다.
    const _locTypePool4Enc = (_curLoc4Enc && Array.isArray(_curLoc4Enc.monsters) && _curLoc4Enc.monsters.length)
      ? _curLoc4Enc.monsters.concat(_typeBasePool4Enc || [])
      : _typeBasePool4Enc;
    // [생태계 시스템] 이 장소에서 최근 사냥이 몰린 종은 뜸해지고, 상대적으로
    // 안 잡힌 종(포식자가 줄어 압박이 덜해진 먹이 등)은 더 자주 나오게
    // 한다 — 균등 랜덤 대신 장소별 개체수(abundance)로 가중 추첨.
    const _ecoLocId = _curLoc4Enc ? (_curLoc4Enc.id || _curLoc4Enc.name) : null;
    if(_ecoLocId && typeof tickLocEcosystem==='function') tickLocEcosystem(_ecoLocId, S.msgCount||0);
    let pick;
    if(_locPool.length && Math.random() < 0.6){
      const pickedName = (_ecoLocId && typeof pickWeightedLocEcoName==='function')
        ? (pickWeightedLocEcoName(_ecoLocId, _locPool) || _locPool[Math.floor(Math.random()*_locPool.length)])
        : _locPool[Math.floor(Math.random()*_locPool.length)];
      pick = { name: pickedName, icon: '👹' };
    } else if(_locTypePool4Enc && _locTypePool4Enc.length){
      const _names = _locTypePool4Enc.map(p=>p.name);
      const pickedName = (_ecoLocId && typeof pickWeightedLocEcoName==='function')
        ? (pickWeightedLocEcoName(_ecoLocId, _names) || _names[Math.floor(Math.random()*_names.length)])
        : _names[Math.floor(Math.random()*_names.length)];
      pick = _locTypePool4Enc.find(p=>p.name===pickedName) || _locTypePool4Enc[0];
    } else {
      pick = ENCOUNTER_POOL[Math.floor(Math.random()*ENCOUNTER_POOL.length)];
    }

    // 몬스터 이름으로 티어 결정 — 플레이어 레벨 비례 제거
    const _encTier = getMonsterTierStats(pick.name);
    if(_ecoLocId && typeof registerLocEcoEncounter==='function') registerLocEcoEncounter(_ecoLocId, pick.name, _encTier.tier, S.msgCount||0);
    // 마리 수는 이름이 아니라 "사회성(social)"에 따라 결정 — 단독종은 항상 1마리,
    // 무리/떼 생활종만 여러 마리로 등장 (예: 늪지 괴물·독거미는 solitary → 항상 1마리)
    const count = (typeof rollMonsterGroupCount === 'function') ? rollMonsterGroupCount(_encTier.social) : (1 + Math.floor(Math.random()*3));
    const atkMultiplier = Math.sqrt(count);
    // [F-BUG 수정] dangerMult(장소 위험도 배율)를 반영 — 기존에는 cycleMult만
    // 곱해서 같은 이름의 몬스터가 안전한 장소든 극위험 지역이든 항상 같은
    // 강도로 나오던 결함이 있었다.
    const _dangerM = _encScale.dangerMult || 1;
    const hpEach   = Math.round(_encTier.hp  * _encScale.cycleMult * _dangerM);
    const atkEach  = Math.round(_encTier.atk * _encScale.cycleMult * _dangerM);
    const defEach  = Math.max(0, _encTier.def);

    const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
    monsters.push({
      id: 'encounter_'+pick.name+'_'+Date.now(),
      name: count>1 ? `${pick.name}×${count}` : pick.name,
      icon: pick.icon,
      hp: hpEach*count, maxHp: hpEach*count,
      count, hpEach,
      atk: Math.round(atkEach*atkMultiplier), atkEach,
      def: defEach,
      status:'alive', isBoss:false, isNamed:false, isGroup: count>1,
      // [버그 수정] tier 필드가 누락되어 있어 autoDropLootOnDeath 등
      // 로컬 드롭 계산이 몬스터의 실제 강도와 무관하게 항상 기본값(1)으로
      // 처리되고 있었다 — getMonsterTierStats가 이미 계산해준 tier를
      // 그대로 저장해 실제 강도에 맞는 보상이 나오게 한다.
      tier: _encTier.tier,
      // [신규] 속성/약점/저항/스킬/특성 저장 — gs.enemy_damage의 element와
      // 대조해 실제 데미지 배율을 계산하는 데 쓰이고, AI 서사 프롬프트에도 노출된다.
      element: _encTier.element, weakElement: _encTier.weakElement,
      resistElement: _encTier.resistElement, skills: _encTier.skills, trait: _encTier.trait,
    });
    if(typeof saveMonsters==='function') saveMonsters(monsters);
    if(typeof renderMonsters==='function') renderMonsters();

    // [신규] 몬스터의 속성/약점/저항/스킬/특성을 AI 서사 프롬프트에 안내 —
    // AI가 이 정보를 참고해 서사와 공격 속성을 판단하도록 유도한다.
    const _elemDef = (typeof ELEMENT_DEFS!=='undefined') ? ELEMENT_DEFS[_encTier.element] : null;
    const _weakDef = _encTier.weakElement && typeof ELEMENT_DEFS!=='undefined' ? ELEMENT_DEFS[_encTier.weakElement] : null;
    const _resistDef = _encTier.resistElement && typeof ELEMENT_DEFS!=='undefined' ? ELEMENT_DEFS[_encTier.resistElement] : null;
    const _skillText = (_encTier.skills||[]).map(s=>`${s.name}(${s.desc})`).join(', ');
    // [신규] 이 이름이 generateAIMonsterConcept로 실제 생성된 개체라면,
    // 그때 AI/로컬 모델이 지어낸 소문(lore)도 함께 프롬프트에 실어
    // AI 서사가 그 설정을 자연스럽게 반영하게 한다.
    const _aiLore = (typeof getMonsterLore==='function') ? getMonsterLore(pick.name) : null;
    const _monsterInfoLine = `[몬스터 정보] ${pick.name} — 속성:${_elemDef?.name||'물리'}${_weakDef?` · 약점:${_weakDef.name}` : ''}${_resistDef?` · 저항:${_resistDef.name}` : ''}${_encTier.trait?` · 특성: ${_encTier.trait}` : ''}${_skillText?` · 보유 능력: ${_skillText}` : ''}${_aiLore?` · 소문: ${_aiLore}` : ''}`;

    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n\n[🎲 돌발 조우] 이동 중 예상치 못하게 ${pick.icon} ${pick.name}${count>1?` ${count}마리`:''}와 마주쳤다. 이것은 계획된 사건이 아니라 우연한 만남이다 — 그에 맞게 갑작스럽고 긴박한 분위기로 서사를 전개하라.\n${_monsterInfoLine}`;
    if(typeof toast === 'function') toastHTML(`⚠️ 돌발 조우: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(pick,{size:14}):(pick.icon)} ${esc(pick.name)}`, 2500);
  }catch(e){ console.warn('[checkRandomEncounter]', e); }
}
window.checkRandomEncounter = checkRandomEncounter;

window.checkRandomEncounter = checkRandomEncounter;

function openP(name){
  if(name==='shop'){
    const loc = loadCurrentLocation();
    // [BUG25 FIX] 상점 허용 장소 확장: city, village, capital, town, hamlet + 상점 정의가 있는 모든 장소
    const SHOP_ALLOWED_TYPES = ['city','village','capital','town','hamlet','shrine','special','event','port'];
    const hasShopInLoc = loc && loc.shops && loc.shops.length > 0;
    const isAllowedType = loc && SHOP_ALLOWED_TYPES.includes(loc.type);
    if(!loc || (!isAllowedType && !hasShopInLoc)){
      const locName = loc ? loc.name : '알 수 없는 장소';
      const locType = loc ? `(${loc.type||'?'})` : '';
      toast(`🏪 ${locName}${locType}에는 상점이 없습니다. 마을, 도시, 또는 상점이 있는 특수 장소를 방문하세요.`, 2800);
      return;
    }
  }
  renderPanel(name); $('p-'+name)?.classList.add('open');
}
window.openP = openP;
}

