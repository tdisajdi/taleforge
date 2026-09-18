// 시스템 프롬프트 조립
// Auto-extracted from taleforge.html (original section banner preserved above).
import { loadDungeonState } from '../combat/256-회차가-높을수록-보스가-더-빨리-더-강하게-스폰됨.js';
import { getUndeadBorrowedTimeStatus } from '../combat/257-renderMiniMap-던전-미니맵-일반-미니맵.js';
import { SOCIAL_RANKS } from '../core/084-TaleForge-순수-JS-엔진.js';
import { EPIC_QUEST_CHAINS } from '../data/009-레벨업-스탯-포인트-배분-시스템.js';
import { BUTTERFLY_EFFECTS, LAST_WORD_OPENINGS } from '../data/015-시스템-1120.js';
import { ABILITY_IMPRINT_LABELS, CURSE_TYPE_DEFS, REL_LEGACY_HINTS } from '../data/016-2130번-시스템.js';
import { BLOOD_CLASSES, COVENANT_DEED_GAIN, DRAGON_ANCESTOR_TYPES, DRAGON_AWAKEN_COSTS, DRAGON_HOARD_TYPES, ELEMENTAL_TYPES } from '../data/020-101130번-환생-누적-시스템.js';
import { ELF_SPECIALIZATIONS } from '../data/025-통합-패널-공허-확장-탭-시스템.js';
import { NPC_CORRUPTION_STAGES } from '../data/026-renderHumanAwakeningPanel-완전-재정의.js';
import { AFFINITY_TABLE, ELEMENT_DEFS } from '../data/035-NEW-직업-조합-시너지-시스템.js';
import { MAIN_QUESTS, WORLD_EVENTS } from '../data/042-직업-시스템-무한-파생-도감.js';
import { RACE_STORY_RULES } from '../data/061-볼린-드워프-기계-사제-프로필-패치-v40.js';
import { ALTA_KINGS } from '../data/063-알테라-왕국-역대-왕-계보-1대-현재.js';
import { RACE_WAR_HISTORY } from '../data/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js';
import { S, SCENARIOS } from '../data/084-TaleForge-순수-JS-엔진.js';
import { SEAL_DEFINITIONS } from '../data/155-⑭-메모리-패널-UI.js';
import { loadEconomy } from '../economy/069-④-경제-시스템.js';
import { getGuildSection, getNetworkSection, getVoyageSection, getWorldMapSection } from '../economy/255-상인-거래소-교역-지부-확장.js';
import { getDynBestiarySection, loadEquipped, loadGold, loadInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { loadNpcMemory, loadQuestChoices } from '../items/065-NPC퀘스트-완성도-강화.js';
import { loadSummaries } from '../items/151-⑩-자동-요약-압축-강화판.js';
import { loadSkills } from '../job/002-스킬-시스템.js';
import { loadClearRewards, loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadSecrets } from '../job/010-스킬-강화-시스템.js';
import { HIDDEN_JOBS, getUnlockedHiddenJobs, loadHiddenJobs } from '../job/029-숨겨진-직업-시스템.js';
import { checkJobSynergy, getCharElement, loadJobSynergy } from '../job/035-NEW-직업-조합-시너지-시스템.js';
import { loadMainQuestState, loadWorldEvents } from '../job/042-직업-시스템-무한-파생-도감.js';
import { applyDissonanceStatEffect, applyRaceJobDissonanceStatEffect, getItemDissonanceSection, getRaceJobDissonanceSection, recalcItemDissonance, recalcRaceJobDissonance } from '../job/208-5-직업-시스템.js';
import { loadProphecies } from '../lore/157-예언-성취-추적-시스템.js';
import { loadAtmosphere, loadEmotion, loadPastLife, loadWorldNotes } from '../misc/001-block0-preamble.js';
import { loadEpicState } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { getActiveDeathBonuses, getEvolvedRace, getExploredLocations, getFateResistance, getMetaKnowledgeHints, getTraumaImmunities, getUnlockedForbiddenSkills, loadBloodline, loadButterfly, loadLastWord, loadMetaKnowledge, loadPermStatBonus, loadTraumas } from '../misc/015-시스템-1120.js';
import { getVoidSenseAIHint } from '../misc/022-2-공허-감지-시스템.js';
import { getActiveCurseRings, getActiveGrudges, getAgeParadoxBonus, getCurseMasteries, getCycleStatsSummary, getDivineGazeStatus, getFateChoices, getGreatCycleStatus, getGrudgeWeapons, getImprintedAbilities, getInjuryEffects, getMemoryDistortStatus, getParallelSelfEncounter, getPastPrayerStatus, getPastTheme, getRelationshipLegacies, getSummonLegacies, getTimeEchoes, getWorldSecrets, getWorldTreeStatus, loadGrudgeList, loadPastTheme, loadRelLegacy, loadWorldSecrets, loadWorldTree } from '../misc/016-2130번-시스템.js';
import { getConstellation, getDawnStatus, getDreamProphecies, getEmotionRipples, getExplorerMap, getLegacyBuildings, getLightningImprints, getSoulMasks, getTestaments, getWatchers, loadConstellation, loadDreamProphecies, loadEmotionRipples, loadSinRedemptions, loadSoulMasks, loadWorldMemory } from '../misc/017-4150번-시스템.js';
import { loadCycleGoal } from '../misc/030-NEW-동적-클리어-목표-시스템.js';
import { loadBetrayals } from '../misc/033-NEW-배신-가능한-동료-시스템.js';
import { getVillainStatus } from '../misc/036-NEW-성장형-악당-시스템.js';
import { loadChoiceHistory, loadWorldState } from '../misc/066-②-선택-결과-추적-시스템.js';
import { loadWarAction } from '../misc/068-전쟁-피해-플레이어-개입-시스템.js';
import { loadEvolution } from '../misc/206-3-진화Evolution-시스템.js';
import { loadExploredLocations } from '../misc/221-19-탐험-discoverLocation-loadExploredLocat.js';
import { getCaravanSection, getContractSection } from '../misc/251-통합-처리-함수-매-AI-응답-후-호출.js';
import { getFarmExtrasSection, getGraveSection, getWorkshopSection } from '../misc/253-SVG-타일-렌더링-작물-단계별-애니메이션.js';
import { getCompanionBuffs } from '../npc/031-NEW-NPC-성장-시스템-동료-레벨업-버프.js';
import { getActiveWars, getCurrentFactions, loadFactionRep, loadFactionSim } from '../npc/067-③-NPC-관계망-시스템.js';
import { getNpcAgendaSection } from '../npc/305-⑤-NPC-비밀-아젠다-이중성-시스템.js';
import { loadArtifactShards, loadCycleCount, loadFameLegacy, loadMemoryFragments, loadPastRelics, loadSoulWeapon } from '../progression/014-환생-누적-시스템-110번.js';
import { getBardLegendStatus, getCurrentFateCard, getEvilEyeStatus, getFullBestiary, getHideoutStatus, getIdentityVault, getLastAchievementBonus, getMemoryMerchantStatus, getMoonPhase, getMysteryPuzzleStatus, getPastLanguage, getRecipeBook, getRiftStatus, getRomanceLegacy, getStarSign, getSurvivorCompanions, getTimeTokenStatus, getUndyingGaugeStatus, getUnlockedLanguages, getWatcherGazeStatus, loadHideout, loadIdentityVault, loadLanguages, loadMoonPhase } from '../progression/018-5170번-환생-누적-시스템.js';
import { getAliasList, getApocalypseStatus, getButterflyIndex, getCausalityStatus, getChildhoodTraumas, getCircusStatus, getCursedRelics, getDarkEchoStatus, getDejavuStatus, getDimensionMapStatus, getElementResistances, getEmotionEcho, getGamblingDebt, getGriefStatus, getHighlightReel, getInscriptionStatus, getInstinctStatus, getLatestLetter, getLegacyWords, getMutationStatus, getNatureKarma, getPetLegacy, getRankStatus, getSakuraStatus, getSealedMemories, getSoulCrystalStatus, getTearCrystalStatus, getTempleStatus, getVillainInheritStatus, getWishStatus, loadCausality, loadChildhoodTrauma, loadDejavu, loadGrief, loadMutation, loadPastLetters } from '../progression/019-71100번-환생-누적-시스템.js';
import { DEMON_CORRUPTION_STAGES, VAMPIRE_CHRONICLE_STAGES, getCarouselNPC, getCelestialCovenantStatus, getCelestialScaleStatus, getCursedCycleStatus, getDeificationStatus, getDemonCorruptionStatus, getDragonBalancePhase, getDragonBloodlineLabel, getElemAwakeningStatus, getElemRestraintStage, getFateMagnet, getFateTraps, getGrowthTreeStatus, getGrudgeFlowers, getKillSenseStatus, getLoopAwareness, getMemoryFloodStatus, getRedThread, getRivals, getRuins, loadCelestialCovenant, loadDarklingVoid, loadDemonCorruption, loadDragonHeart, loadDwarfCraft, loadDwarfGrudge, loadDwarfUnfinished, loadLoopAwareness, loadMentalCorruption, loadOrcBloodVow, loadOrcHonor, loadRivals, loadRuins, loadVampireChronicle } from '../progression/020-101130번-환생-누적-시스템.js';
import { loadHiddenQuests } from '../quest/039-NEW-히든-퀘스트-시스템.js';
import { activateHiddenQuest, getAvailableHiddenQuests } from '../quest/041-궁수-계열-T2-파생-5종-히든-퀘스트-전사마법사도적-계열과-동일한-뼈대.js';
import { loadNpcDlgQuests } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { RACE_DEFS, loadRace } from '../race/013-종족-시스템.js';
import { loadDemonContracts } from '../race/027-악마족-계약-장부-시스템-Demon-Contract-Ledger.js';
import { getBondTreeStatus, getCinemaStatus, getCyberImprint, getDeathDealerStatus, getDeathEyeStatus, getKillList, getKingdomLegacy, getLoopersGuild, getMemoryAuction, getMentalCorruption, getNaturalLaw, getRoleReversal, getSealedGodStatus, getSoulFrequency, getSwordGhost, getTwinSoul, getWorldWill, loadDemonTrueName, loadKillList, loadKingdom } from '../race/028-악마족-진명-시스템-Demon-True-Name.js';
import { getRaceContent } from '../race/038-NEW-종족-전용-스토리-루트.js';
import { FIVE_CONTINENTS, loadContinentRep, loadJobMastery } from '../race/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js';
import { getNpcGrudgeSection } from '../race/198-NEW-5-종족-공통-NPC-원한-시스템-강화.js';
import { getBeastWildlawStatus } from '../race/259-수인족-야생의-법칙-Law-of-the-Wild-시스템.js';
import { getBeastAwakeningStatus, loadFactionGauge } from '../race/260-수인족-패널-렌더.js';
import { getCabalBLSContext, getWorldLoreBLSContext, loadCabalState } from '../religion/061-볼린-드워프-기계-사제-프로필-패치-v40.js';
import { getElfMemoryStatus, loadElfEmotion, loadElfForgetting, loadElfMemory, loadNpcInspire } from '../ui/025-통합-패널-공허-확장-탭-시스템.js';
import { THRALL_LORD_STAGES, loadHumanLegacy, loadHumanStigma, loadNpcCorruption, loadThrallData } from '../ui/026-renderHumanAwakeningPanel-완전-재정의.js';
import { getMatchingOrganicTrigger, loadExploration, loadOffscreenDB, loadSealRestore } from '../ui/155-⑭-메모리-패널-UI.js';
import { getFarmSection } from '../ui/252-상단Caravan-UI-용병단-UI와-대칭-구조.js';
import { getWeatherStatMods } from '../world/032-NEW-날씨계절-판정-연동-시스템.js';
import { getLocationLevelBand, getLocationPowerScale, loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { getSocialRankNpcBLS, getWorldFigureBLS } from '../world/055-5대륙-왕국-시스템.js';
import { loadReligionState } from '../world/091-2-저장소.js';
import { loadGSFlags } from '../world/145-⑥-세계-상태-DB.js';
import { loadLoopRecords } from '../world/165-저장소.js';
import { getFactionHistorySection } from '../world/199-NEW-6-세력-전쟁-영구-반영-시스템.js';
import { loadTimeCost, timeCostToCalendar } from '../world/214-11-날씨-자동-순환.js';

// [19차 감사 FIX] 아래 getRaceSpecialHint()는 이 파일의 죽은 buildSystem()
// (17차에서 완전히 사멸 확인 — 실제 프롬프트 조립기는 misc/076의
// buildLightSystem) 안에서만 쓰이던 newRaceHint 삼항연쇄를 그대로
// 살려낸 것이다. 용혈/악마족/언데드/수인/원소인/엘프/세레스티얼
// 7개 종족 각각의 정교한 상태 추적 시스템(용심 균형·타락 단계·
// 감정 온도·무리 서열·원소각성·기억 단계·신성 계율)이 전부 완성돼
// 있었는데, 유일한 소비처가 죽은 함수뿐이라 어떤 종족을 선택해도
// 이 서사 힌트가 AI에게 단 한 번도 전달된 적이 없었다. B80/18차와
// 완전히 동일한 원인·해법이라 misc/330의 SECTION_FNS 훅에 합류시킨다.
export function getRaceSpecialHint(){
  try{
    const _race = (S.character?.race || "").toLowerCase();
    const isDragon     = _race.includes("드래곤") || _race.includes("dragon") || _race.includes("용혈");
    const isDemon      = _race.includes("악마") || _race.includes("demon");
    const isUndead     = _race.includes("언데드") || _race.includes("undead");
    const isBeastman   = _race.includes("수인") || _race.includes("beast");
    const isElemental  = _race.includes("원소") || _race.includes("elemental");
    const isElf        = _race.includes("엘프") || _race.includes("elf");
    const isCelestial  = _race.includes("천족") || _race.includes("celestial") || _race.includes("세레스티얼");

    const newRaceHint = isDragon ? `\n[🐉 드래곤혈 특성] 이 캐릭터는 용의 피가 흐릅니다. 분노하거나 강한 감정을 느낄 때 눈동자가 세로 동공으로 변하거나 피부에서 비늘 무늬가 드러나는 묘사를 자연스럽게 포함하십시오. 화염이나 냉기를 본능적으로 다루며, 용족 NPC는 본능적으로 이 자를 같은 혈통으로 인식합니다.`
        + (()=>{
          if(typeof loadDragonHeart!=='function') return '';
          const _dh = loadDragonHeart();
          const _balPhase = getDragonBalancePhase(_dh.heartBalance||500);
          const _bloodLabel = getDragonBloodlineLabel(_dh.bloodline||50);
          const _anc = _dh.ancestorRevealed && _dh.ancestorType ? DRAGON_ANCESTOR_TYPES[_dh.ancestorType] : null;
          const _hoard = _dh.hoardType ? DRAGON_HOARD_TYPES[_dh.hoardType] : null;
          const _awakenCost = DRAGON_AWAKEN_COSTS.slice().reverse().find(c=>c.threshold<=(_dh.awakenPoints||0));
          let _hint = `\n[🐉 용심 시스템 상태]`;
          _hint += `\n혈통: ${_bloodLabel.icon} ${_bloodLabel.label} (${_dh.bloodline||50}/100) — ${_bloodLabel.desc}`;
          _hint += `\n용심 균형: ${_balPhase.icon} ${_balPhase.name} (${_dh.heartBalance||500}/1000) — ${_balPhase.desc}`;
          _hint += `\n${_balPhase.aiHint||''}`;
          if(_anc) _hint += `\n선조 고룡: ${_anc.icon} ${_anc.name} — ${_anc.hint}`;
          else if(_dh.ancestorFragments>=3) _hint += `\n선조의 기억이 깨어나는 중 (파편 ${_dh.ancestorFragments}/7). 고대 용의 기억이 가끔 섬광처럼 스침.`;
          if(_hoard) _hint += `\n보물 유형: ${_hoard.icon} ${_hoard.name} (집착도 ${_dh.hoardObsession||0}/100) — 드워프가 보물에 접근하면 자동 분노 반응.`;
          if((_dh.awakenPoints||0)>=200) _hint += `\n각성도: ${_dh.awakenPoints}/1000 — ${_awakenCost?_awakenCost.aiHint:'강렬한 존재감이 주변에 영향을 미침.'}`;
          if(_dh.awakenCostPending) _hint += `\n⚠️ 각성 대가 미지불 상태 — 주변에 크고 작은 이상 현상이 발생한다.`;
          return _hint;
        })()
      : isDemon ? `\n[😈 악마족 특성] 이 캐릭터는 악마의 피가 흐릅니다. 대화에서 은근히 상대의 욕망을 꿰뚫어보고 거기에 어필하는 묘사를 포함하십시오. 강한 힘을 쓸 때 뒤에서 날개나 뿔이 잠깐 드러납니다. 인간·신성 NPC는 본능적으로 불편함을 느끼지만 동시에 이끌리기도 합니다.`
        + (()=>{
          const _dcStatus = getDemonCorruptionStatus();
          if(!_dcStatus || !_dcStatus.stageDef) return '';
          const _dcs = _dcStatus.stageDef;
          return `\n[😈 타락 단계: ${_dcs.stage||0}단계 · ${_dcs.name}] 타락도: ${_dcStatus.points}/1000\n${_dcs.aiHint||''}\n현재 오라: ${_dcs.aura||''}` + (()=>{
            const _ncd = (typeof loadNpcCorruption==='function') ? loadNpcCorruption() : {};
            const _corrupted = Object.entries(_ncd).filter(([,v])=>v.stage>0);
            if(!_corrupted.length) return '';
            return '\n[🌑 타락한 NPC 목록] ' + _corrupted.map(([name,nd])=>{
              const nstg = NPC_CORRUPTION_STAGES[nd.stage] || NPC_CORRUPTION_STAGES[0];
              return `${name}(${nstg.name}·${nd.points}/100)`;
            }).join(', ') + ' — 이 NPC들은 타락의 영향을 받아 행동과 대사에 어두운 면이 드러나야 합니다.';
          })();
        })()
      : isUndead ? (()=>{
          const _ubs = (typeof getUndeadBorrowedTimeStatus==='function') ? getUndeadBorrowedTimeStatus() : null;
          let _uHint = `\n[💀 언데드 특성] 이 캐릭터는 세계로부터 시간을 빌린 존재입니다. 체온이 없고 고통을 느끼지 못하며, 강한 공격에도 쉽게 쓰러지지 않는 섬뜩한 생존력을 묘사하십시오. 산 자들은 본능적으로 소름과 불쾌감을 느끼지만 이 눈빛에서 눈을 뗄 수가 없습니다.`;
          if(_ubs){
            const _ts  = _ubs.tempStage;
            const _ss  = _ubs.scaleStage;
            const _sd  = _ubs.sightDef;
            const _cd  = _ubs.chainDef;
            _uHint += `\n[💀 감정 온도: ${_ts.icon} ${_ts.name} (${_ubs.soulTemp}/100)] ${_ts.aiHint||''}`;
            _uHint += `\n[⚖️ 두 번째 죽음의 저울: ${_ss.icon} ${_ss.name} (${_ubs.deathScale}/100)] ${_ss.aiHint||''}`;
            if(_ubs.worldDebt>=40) _uHint += `\n[💸 세계의 빚: ${_ubs.worldDebt}/100] 빚이 누적되어 사신의 기운이 느껴진다. 이번 장면에서 낯선 시선이나 죽음의 기운을 암시하라.`;
            if(_sd && _sd.level>=2) _uHint += `\n[👁️ 죽음 너머의 눈: ${_sd.name}] ${_sd.ability||''} — NPC의 숨겨진 감정(거짓말·공포·욕망)을 이 언데드가 직관적으로 감지하는 묘사를 포함하라.`;
            if(_cd) _uHint += `\n[⛓️ 미완성의 사슬: ${_cd.icon} ${_cd.label} (${_ubs.chainProgress}/100)] ${_cd.aiHint||''}`;
            const _activeTempSkills = (_ts.skills || []);
            if(_activeTempSkills.length > 0){
              _uHint += `\n[💀 감정 온도 해금 스킬]`;
              _activeTempSkills.forEach(sk => {
                _uHint += `\n  • ${sk.icon} ${sk.name} (${sk.conditionDesc}): ${sk.aiHint||sk.desc}`;
              });
            }
            if(_cd && _ubs.chainProgress >= 25){
              const _activeChainSkills = (_cd.chainSkills||[]).filter(s => (_ubs.chainProgress||0) >= s.threshold);
              if(_activeChainSkills.length > 0){
                _uHint += `\n[⛓️ 집착 해금 스킬]`;
                _activeChainSkills.forEach(sk => {
                  _uHint += `\n  • ${sk.icon} ${sk.name} (${sk.conditionDesc}): ${sk.aiHint||sk.desc}`;
                });
              }
            }
            if(_ubs.tabooViolations>0) _uHint += `\n[⚠️ 금기 위반 ${_ubs.tabooViolations}회] 영원히 살려는 선택을 반복했다. 이 언데드의 내면에 망령의 기운이 자리잡고 있음을 암시하라.`;
          }
          return _uHint;
        })()
      : isBeastman ? `\n[🐺 수인 특성] 이 캐릭터는 짐승의 본능을 지니고 있습니다. 감각이 예민하여 인간이 눈치채지 못하는 것을 미리 감지하는 묘사를 포함하십시오. 흥분하면 동물적 특징(귀·꼬리·눈동자 변화 등)이 드러납니다. 야생 동물들이 본능적으로 이 자를 두려워하거나 복종합니다.`
        + (()=>{
          if(typeof getBeastWildlawStatus!=='function') return '';
          const _bws = getBeastWildlawStatus();
          if(!_bws) return '';
          let _bHint = '';
          const _pr = _bws.packRankStage;
          const _bb = _bws.beastBloodStage;
          const _hc = _bws.hunterCodeStage;
          _bHint += `\n[🐾 무리 서열: ${_pr.icon} ${_pr.name} (${_bws.packRank}/100)] ${_pr.aiHint||''}`;
          _bHint += `\n[🩸 야수의 피: ${_bb.icon} ${_bb.name} (${_bws.beastBlood}/100)] ${_bb.aiHint||''}`;
          _bHint += `\n[⚖️ 사냥꾼의 윤리: ${_hc.icon} ${_hc.name} (${_bws.hunterCode}/100)] ${_hc.aiHint||''}`;
          if(_bws.packMembers && _bws.packMembers.length>0)
            _bHint += `\n[🫂 무리의 유대: ${_bws.packMembers.map(m=>m.name).join(', ')}] 이 무리원들에게 각별히 충성스럽고 의리 있게 묘사하라.`;
          if(_bws.territories && _bws.territories.length>0)
            _bHint += `\n[🗺️ 영역 표식: ${_bws.territories.map(t=>t.name).join(', ')}] 이 구역에서 야생 동물들이 자연스럽게 복종하는 장면을 포함하라.`;
          if(_bws.beastBlood>=80) _bHint += `\n[⚠️ 야수 위험 구역] 야수의 피가 임계치에 달했다. 이 캐릭터의 이성이 무너지려는 묘사, 동물적 충동을 억누르는 긴장감을 표현하라.`;
          if(_bws.tabooViolations>0) _bHint += `\n[⚠️ 금기 위반 ${_bws.tabooViolations}회] 강함을 증명하기 위해 사냥하는 행위를 반복했다. 수인 사회에서 야만인으로 여겨지기 시작함을 암시하라.`;
          if(_bws.isLoneWolf) _bHint += `\n[🐺 홀로 된 자] 모든 무리에서 추방된 자. 수인 NPC들이 등을 돌리고, 야생 동물도 경계하는 고독과 낙인을 묘사하라.`;
          const _activePackSkills=(_pr.skills||[]).filter(s=>true);
          if(_activePackSkills.length>0){
            _bHint+=`\n[🐾 서열 해금 스킬]`;
            _activePackSkills.forEach(sk=>{ _bHint+=`\n  • ${sk.icon} ${sk.name}: ${sk.aiHint||sk.desc}`; });
          }
          const _activeBeastSkills=(_bb.skills||[]).filter(s=>true);
          if(_activeBeastSkills.length>0){
            _bHint+=`\n[🩸 야수 피 해금 스킬]`;
            _activeBeastSkills.forEach(sk=>{ _bHint+=`\n  • ${sk.icon} ${sk.name}: ${sk.aiHint||sk.desc}`; });
          }
          // [버그 수정] "야생의 법칙"(무리 서열·야수의 피·사냥꾼의 윤리,
          // 위 _bws)과는 완전히 별개인 "각성"(gainBeastAwakening/
          // BEAST_AWAKENING_STAGES) 시스템이 실제로 S.stats에 보너스·
          // 페널티를 적용하고 있음에도, 그 서사적 상태(단계별 aiHint)를
          // AI에게 전달하는 경로가 전혀 없어 스탯만 조용히 바뀔 뿐
          // 서사에는 절대 반영되지 않던 문제였다.
          if(typeof getBeastAwakeningStatus === 'function'){
            const _baws = getBeastAwakeningStatus();
            if(_baws && _baws.stageDef && _baws.stageDef.stage > 0){
              const _bas = _baws.stageDef;
              _bHint += `\n[${_bas.icon} 야수 각성: ${_bas.name} (${_baws.points||0}pt)] ${_bas.aiHint||_bas.desc||''}`;
            }
          }
          return _bHint;
        })()
      : isElemental ? `\n[🌀 원소인 특성] 이 캐릭터는 원소 에너지와 융합된 존재입니다. 감정이 격해지면 피부 아래서 원소가 빛나거나 흘러넘칩니다. 강한 마법 사용 시 몸의 일부가 원소 형태로 변합니다. 원소를 파괴에만 쓰면 원소로부터 거부당합니다.`
        + (()=>{
          if(typeof getElemAwakeningStatus !== 'function') return '';
          const _eas = getElemAwakeningStatus();
          if(!_eas || !_eas.stageDef) return '';
          const _stg  = _eas.stageDef;
          const _et   = _eas.element ? ELEMENTAL_TYPES[_eas.element] : null;
          const _restStg = getElemRestraintStage(_eas.restraint);
          let hint = '';
          if(_et) hint += `\n[🌀 원소 속성: ${_et.icon} ${_et.name}] ${_et.aiHint}\n약점 환경: ${_et.weakEnv}`;
          hint += `\n[🌀 원소각성: ${_stg.icon} ${_stg.name} · ${_stg.stage}단계 · ${_eas.points}/1000] ${_stg.aiHint}`;
          hint += `\n현재 아우라: ${_stg.aura}`;
          const _restHint = _eas.restraint < 30
            ? `⚠️ 억제도 위험(${_eas.restraint}) — 폭발 직전! 원소가 통제를 벗어나 주변에 무작위 반응하는 묘사를 포함하라.`
            : _eas.restraint < 60
            ? `긴장 상태(${_eas.restraint}) — 원소가 예민하게 반응한다. 돌발적 원소 반응 묘사 가끔 포함하라.`
            : `안정(${_eas.restraint}) — 원소가 평온하게 흐른다.`;
          hint += `\n[😤 감정 억제도: ${_restStg.icon} ${_restStg.name}] ${_restHint}`;
          if(_eas.taboo >= 5) hint += `\n[⚠️ 금기 위반 ${_eas.taboo}회] 원소 정령들이 등을 돌리기 시작했다. 원소 스킬 발동 시 부작용이나 NPC들의 불신 묘사를 포함하라.`;
          if(_eas.surgeCount > 0) hint += `\n[💥 원소 폭발 ${_eas.surgeCount}회 이력] 과거 폭발의 트라우마·흔적을 간헐적으로 묘사할 수 있다.`;
          return hint;
        })()
      : isElf ? `\n[🧝 엘프족 특성] 이 캐릭터는 천년 기억의 엘프입니다. 한 번 본 얼굴·장소·사건은 절대 잊지 않으며, 상대가 거짓말할 때 미묘한 감지를 묘사하십시오. 과거 기억이 현재 판단에 영향을 주는 장면을 자연스럽게 포함하십시오. 망각이 금기인 종족으로, 기억을 잃은 엘프는 동족에게 배척당합니다.`
        + (()=>{
          const _emStatus = getElfMemoryStatus();
          if(!_emStatus || !_emStatus.stageDef) return '';
          const _ems = _emStatus.stageDef;
          const _spec = _emStatus.specialization || 'none';
          const _specDef = (typeof ELF_SPECIALIZATIONS !== 'undefined') ? ELF_SPECIALIZATIONS[_spec] : null;
          let _specHint = '';
          if(_specDef) {
            _specHint = `\n[🧝 특화 계열: ${_specDef.icon} ${_specDef.name}] ${_specDef.desc}\n${_specDef.aiHint_spec||''}\n특화 효과: ${_specDef.specEffect||''}`;
          }
          const _forgottenList = (_emStatus.forgottenNPCs||[]).slice(-3).map(n=>n.name).join(', ');
          const _forgottenHint = _forgottenList ? `\n[💀 망각된 인연: ${_forgottenList}] 이 인물들과의 기억이 사라졌다. 이들을 만나도 기억하지 못하며, 동족 엘프들이 이 사실을 알면 경멸한다.` : '';
          return `\n[🧝 기억 단계: ${_ems.stage||0}단계 · ${_ems.name}] 기억력: ${_emStatus.points}/1000\n${_ems.aiHint||''}\n현재 기억의 아우라: ${_ems.aura||''}${_specHint}${_forgottenHint}`;
        })()
      : isCelestial ? `\n[💛 세레스티얼 특성] 이 캐릭터는 신성한 천상의 혈통을 지닙니다. 빛이 닿으면 후광처럼 윤곽이 빛나고, 어둠 속 존재들이 본능적으로 거리를 두는 묘사를 포함하십시오. 치유나 보호의 행동을 할 때 미약하게나마 신성한 온기가 전해집니다.`
        + (()=>{
          const _csStatus = getCelestialScaleStatus();
          let scalePart = '';
          if(_csStatus && _csStatus.phaseDef){
            const _csp = _csStatus.phaseDef;
            const _pts = _csStatus.points;
            const _sideDesc = _csp.side==='light'
              ? `빛의 길을 걷고 있다. 신성한 오라가 주변을 밝히며 어둠 속 존재들이 불편해한다.`
              : _csp.side==='dark'
              ? `어둠에 기울어가고 있다. 신성이 오염되어 아군에게 신성 효과를 줄 수 없다. 신성 존재들이 경계한다.`
              : `빛과 어둠의 경계에 서 있다.`;
            const _appearHint = _pts>=900 ? '외형: 순백의 날개가 드러나며 발걸음에서 빛이 흘러내린다. 신성 존재들이 경배하듯 고개를 숙인다.'
              : _pts<=100 ? '외형: 날개가 검게 그을리고 눈동자가 보라빛으로 빛난다. 신성 존재들이 적대한다.'
              : _pts>=750 ? '외형: 후광이 뚜렷하게 드러나며 접촉한 상처가 저절로 아문다.'
              : _pts<=250 ? '외형: 후광이 흔들리고 가끔 그림자가 빛보다 진하게 드리운다.'
              : '';
            scalePart = `\n[💛 신성 천평: ${_csp.icon} ${_csp.label}] 신성도: ${_pts}/1000\n${_sideDesc}\n${_appearHint}`;
          }
          let covenantPart = '';
          if(typeof getCelestialCovenantStatus === 'function'){
            const _cvStatus = getCelestialCovenantStatus();
            if(_cvStatus && _cvStatus.stageDef){
              const _cvStg = _cvStatus.stageDef;
              const _cvPts = _cvStatus.points;
              const _totalDeed = Object.values(_cvStatus.deed||{}).reduce((a,b)=>a+b,0);
              const _totalSin  = Object.values(_cvStatus.sin||{}).reduce((a,b)=>a+b,0);
              const _topDeed = Object.entries(_cvStatus.deed||{}).sort((a,b)=>b[1]-a[1])[0];
              const _deedHint = _topDeed && _topDeed[1]>0 && typeof COVENANT_DEED_GAIN!=='undefined'
                ? `주된 사명 행동: ${COVENANT_DEED_GAIN[_topDeed[0]]?.icon||''} ${COVENANT_DEED_GAIN[_topDeed[0]]?.label||_topDeed[0]} (${_topDeed[1]}회).` : '';
              const _sinWarning = _totalSin > 3 ? `⚠️ 계율 위반 누적 ${_totalSin}회 — 신성이 흔들리는 묘사를 포함하라.` : '';
              covenantPart = `\n[💛 신성 계율: ${_cvStg.icon} ${_cvStg.name}] 계율도: ${_cvPts > 0 ? '+' : ''}${_cvPts}/±500 (${_cvStg.stage > 0 ? '+' : ''}${_cvStg.stage}단계 · ${_cvStg.side === 'fallen' ? '타락' : _cvStg.side === 'light' ? '신성' : '중립'})\n${_cvStg.aiHint||''}\n현재 아우라: ${_cvStg.aura}\nNPC 반응 기준: ${_cvStg.npcReact}\n${_deedHint}${_sinWarning}`;
            }
          }
          return scalePart + covenantPart;
        })()
      : "";
    return newRaceHint;
  }catch(e){ return ''; }
}
window.getRaceSpecialHint = getRaceSpecialHint;


// [19차 감사 FIX] getPastLifeLegacySection — ai-prompt/077의 죽은 buildSystem
// 안에 124개의 독립된 "전생 유산/서사 힌트" 블록(1~130번, 이미 misc/330에
// 편입된 3개 제외)이 통째로 갇혀 있던 것을 구출한다. 각 블록은 이미 이
// 파일에 직접 import된 기존 완성 함수(getWatchers/getStarSign/
// getWorldTreeStatus/getDreamProphecies 등 113개 확인)를 호출해 "전생
// 몇 회차 동안 쌓인 유산(원한/저주/인연/유물/꿈/평행세계 조우/별자리
// 운세 등)"을 서사 힌트 문자열로 조립하는데, buildSystem이 죽은
// 함수라 이 정보가 게임 출시 이래 단 한 번도 AI에게 전달된 적이 없었다.
// buildSystem의 로직을 char 매개변수 대신 S.character를 쓰도록 바꿔
// 그대로 옮겨왔다. dynBestiarySection/itemDissonanceSection/
// raceJobDissonanceSection 3개는 이미 misc/330의 SECTION_FNS로 별도
// 편입되어 있어(각각 items/007, job/208에 실구현) 중복 방지를 위해
// 제외했다.
// [버그 발견·수정] 죽은 buildSystem() 안에 있던 "숨겨진 직업 시스템 힌트"
// (hiddenJobSection)는 원래 `HIDDEN_JOBS.find(j => j.name === char.role)`로
// 캐릭터의 role이 히든 직업 이름과 "같을 때"만 매칭하는 방식이었는데,
// 실제 히든 직업 해금(job/029의 unlockHiddenJob)은 loadHiddenJobs()라는
// 별도 목록에만 기록하고 S.character.role은 절대 히든 직업 이름으로
// 바꾸지 않는다(role은 계속 원래 기본 직업으로 남는다) — 즉 buildSystem이
// 살아있었다 해도 이 매칭 조건 자체가 항상 거짓이라 실질적으로 죽어있던
// 로직이었다. buildSystem 자체가 죽은 함수(17차 확인)라는 문제와 별개로,
// 이 특정 조각은 애초에 조건도 잘못돼 있었다. 56개 히든 직업 전부가
// 정의해둔 systemHint(예: 방랑 검귀의 "검귀가 때때로 목소리를 내거나
// 조언하는 묘사를 포함하십시오")는 게임 출시 이래 단 한 번도 AI에게
// 전달된 적이 없었다는 뜻 — 히든 직업을 각성해도 스탯 보너스만 있을 뿐
// 약속된 서사적 개성이 전혀 반영되지 않았다. 실제 해금 여부를 추적하는
// getUnlockedHiddenJobs()를 기준으로, 해금된 모든 히든 직업의 systemHint를
// 매 턴 함께 전달하도록 새로 작성한다.
export function getHiddenJobBLS(){
  try{
    const unlocked = typeof getUnlockedHiddenJobs === 'function' ? getUnlockedHiddenJobs() : [];
    if(!unlocked.length) return '';
    return unlocked.map(j => `\n[🔓 숨겨진 직업 — ${j.icon||''}${j.name}] ${j.systemHint||''}`).join('');
  }catch(e){ return ''; }
}
window.getHiddenJobBLS = getHiddenJobBLS;

export function getPastLifeLegacySection(){
  try{
  const char = S.character || {};
  const _cycle   = loadCycleCount();
  const _race    = (char?.race  || "").toLowerCase();
  const _role    = (char?.role  || "");
  const _era     = (char?.scenario || "");

  const isMedieval     = _era.includes("중세") || _era.includes("판타지") || _era.includes("medieval");
  const isWuxia        = _era.includes("무협") || _era.includes("강호")   || _era.includes("wuxia");
  const isCyberpunk    = _era.includes("사이버") || _era.includes("cyber");
  const isApocalypse   = _era.includes("아포칼") || _era.includes("apocalypse") || _era.includes("황무지") || _era.includes("붕괴");
  const isMythology    = _era.includes("신화") || _era.includes("mythology") || _era.includes("올림포스");
  const isSteampunk    = _era.includes("스팀") || _era.includes("steampunk") || _era.includes("증기");
  const isCustom       = _era.includes("나만의") || _era.includes("custom");
  const isAnyEra       = true;

  const isElf        = _race.includes("엘프") || _race.includes("elf");
  const isDwarf      = _race.includes("드워프") || _race.includes("dwarf");
  const isOrc        = _race.includes("오크") || _race.includes("orc");
  const isDarkling   = _race.includes("다크링") || _race.includes("darkling");
  const isCelestial  = _race.includes("천족") || _race.includes("celestial") || _race.includes("세레스티얼");
  const isDragon     = _race.includes("드래곤") || _race.includes("dragon") || _race.includes("용혈");
  const isDemon      = _race.includes("악마") || _race.includes("demon");
  const isUndead     = _race.includes("언데드") || _race.includes("undead");
  const isBeastman   = _race.includes("수인") || _race.includes("beast");
  const isElemental  = _race.includes("원소") || _race.includes("elemental");
  const isHuman      = _race.includes("인간") || _race.includes("human") || (!isElf && !isDwarf && !isOrc && !isDarkling && !isCelestial && !isDragon && !isDemon && !isUndead && !isBeastman && !isElemental);
  const isFantasyRace= isElf || isDwarf || isOrc || isDarkling || isCelestial || isDragon || isDemon || isUndead || isBeastman || isElemental;
  const hasMagicRace = isElf || isCelestial || isDragon || isDemon || isElemental;

  const isMagicRole  = /마법|마녀|마법사|소서|주술|마도/.test(_role);
  const isWarriorRole= /전사|기사|검사|무사|파이터/.test(_role);
  const isRogueRole  = /도적|암살|자객|도둑|레인저/.test(_role);
  const isLeaderRole = /왕|군주|장군|영주|리더|지도자/.test(_role);
  const isHealerRole = /성직|치료|사제|수도|힐러|신관/.test(_role);
  const isBardRole   = /음유|시인|바드|광대/.test(_role);
  const isSupportRole= isHealerRole || isBardRole;

  const isEarlyCycle  = _cycle >= 1  && _cycle <= 3;
  const isMidCycle    = _cycle >= 4  && _cycle <= 9;
  const isLateCycle   = _cycle >= 10 && _cycle <= 19;
  const isHighCycle   = _cycle >= 20 && _cycle <= 49;
  const isVeryHigh    = _cycle >= 50;
  const isCenturyCycle= _cycle >= 100;

    // 1번: 전생 기억 파편 섹션
    const frags = loadMemoryFragments();
    const fragSection = frags.length > 0 ? `\n[💭 전생 기억 파편]\n${frags.slice(-3).map(f=>f.text).join("\n")}` : "";
    // 2번: 전생 인연 (pastLife intimateNpcs)
    const intimateNpcs = (char.pastLifeIntimateNpcs || []);
    const intiSection = intimateNpcs.length > 0 ? `\n[💞 전생 인연] 다음 NPC들은 이전 생에 깊은 인연이 있었습니다. 첫 만남이지만 왠지 모를 친근함을 느낍니다: ${intimateNpcs.join(", ")}` : "";
    // 8번: 명성 이월
    const fameLeg = loadFameLegacy();
    const fameSection = fameLeg && fameLeg.type !== "neutral" ? `\n[${fameLeg.type==="hero"?"🌟":"💀"} 전생의 소문] 전생에서 ${fameLeg.characterName||"이 영혼"}의 소문이 퍼져있습니다. NPC들은 처음 만나도 ${fameLeg.type==="hero"?"호감":"두려움"}을 갖고 대합니다. (${fameLeg.label})` : "";
    // 6번: 영혼 각인 무기
    const soulWpn = loadSoulWeapon();
    const soulWpnSection = soulWpn ? `\n[⚔️ 영혼 각인] 전생에서 가장 많이 쓰던 ${soulWpn.name}. ${soulWpn.desc}` : "";

    // 11번: 금지 스킬 해금 알림
    const forbiddenSkills11 = getUnlockedForbiddenSkills();
    const forbiddenSection = forbiddenSkills11.length > 0 ? `\n[🔓 금지 스킬 해금] 특수 조건으로 해금된 금지 스킬이 있습니다: ${forbiddenSkills11.map(s=>`${s.icon}${s.name}(${s.desc})`).join(", ")}. 사용 시 강렬하게 묘사하십시오.` : "";

    // 12번: 나비효과
    const butterflies = loadButterfly();
    const butterflySection = butterflies.length > 0 ? `\n[🦋 나비효과] 전생의 선택이 세계에 흔적을 남겼습니다:\n${butterflies.map(b => b.desc ? `${b.desc}${b.worldChange?' — '+b.worldChange:''}` : (BUTTERFLY_EFFECTS[b.type]?.aiHint?.(b.data) || "")).filter(Boolean).join("\n")}` : "";

    // 14번: 죽는 방식 보상
    const deathBonuses14 = getActiveDeathBonuses();
    const deathBonusSection = deathBonuses14.length > 0 ? `\n[💀 전생 사망 유산] ${deathBonuses14.map(d=>`${d.name}: ${d.desc}`).join(" / ")}. 이 경험이 캐릭터의 신체와 감각에 자연스럽게 반영됩니다.` : "";

    // 15번: 트라우마 면역
    const traumaImmune15 = getTraumaImmunities();
    const traumaSection = traumaImmune15.length > 0 ? `\n[🛡️ 트라우마 면역] 반복된 경험으로 면역 획득: ${traumaImmune15.map(t=>`${t.icon}${t.label}(${t.immunity})`).join(", ")}. 해당 상황에서 두려움 없이 행동합니다.` : "";

    // 16번: 라스트 워드 오프닝
    const lastWord16 = loadLastWord();
    const lastWordSection = lastWord16 ? `\n[💬 전생의 마지막 말] "${lastWord16.text}" — ${LAST_WORD_OPENINGS[lastWord16.tone] || ""}` : "";

    // 17번: 메타 지식
    const metaKnowledge17 = getMetaKnowledgeHints();
    const metaSection = metaKnowledge17.length > 0 ? `\n[💡 전생의 메타 지식] 이전 생에서 얻은 정보들이 있습니다. 관련 상황 발생 시 "어디선가 본 듯한 느낌이 든다" 같은 선택지를 추가하십시오: ${metaKnowledge17.slice(-5).map(m=>`[${m.type}]${m.keyword}(${m.hint})`).join(", ")}` : "";

    // 18번: 혈통 진화
    const evolvedRace18 = char.race ? getEvolvedRace(char.race) : null;
    const bloodlineSection = evolvedRace18?.isEvolved ? `\n[🧬 혈통 진화] ${char.race}에서 ${evolvedRace18.name}으로 진화. 종족 특성이 강화되어 있으며 종족 관련 묘사를 더욱 강렬하게 표현하십시오.` : "";

    // 19번: 운명의 변수
    const fateRes19 = getFateResistance();
    const fateSection = fateRes19 ? `\n[⚡ 운명의 저항 Lv.${fateRes19.level}] ${fateRes19.desc} 예상치 못한 방해와 변수를 적절히 삽입하여 도전적인 서사를 만드십시오.` : "";

    // 20번: 전생 지도
    const exploredMaps20 = getExploredLocations(char.scenario);
    const exploredSection = exploredMaps20.length > 0 ? `\n[🗺️ 전생 탐험 기록] 이전 생에서 방문한 장소들: ${exploredMaps20.map(m=>m.name).join(", ")}. 이 장소들에서 "낯익다"는 느낌이나 보너스 정보를 제공하십시오.` : "";

    // 21번: 관계 유산
    const relLegacies21 = getRelationshipLegacies();
    const relLegacySection = relLegacies21.length > 0 ? `\n[💞 관계 유산] 전생의 인연이 영혼에 새겨져 있습니다. 해당 이름의 NPC 등장 시 즉시 반영하십시오:\n${relLegacies21.map(r => REL_LEGACY_HINTS[r.bond]?.(r.npcName, r.depth) || "").filter(Boolean).join("\n")}` : "";

    // 22번: 세계관 기억
    const worldSecrets22 = getWorldSecrets(char.scenario);
    const worldSecretSection = worldSecrets22.length > 0 ? `\n[🔍 세계관 기억] 전생에서 발견한 세계의 비밀들:\n${worldSecrets22.map(s => `• ${s.title}: ${s.hint}`).join("\n")}\n이 비밀들을 암시하는 장면이나 대사를 자연스럽게 삽입하십시오.` : "";

    // 23번: 능력 각인
    const imprintedAbs23 = getImprintedAbilities();
    const abilityImprintSection = imprintedAbs23.length > 0 ? `\n[⚡ 능력 각인] 전생에서 극한까지 단련한 능력이 이번 생에 타고난 재능으로 발현:\n${imprintedAbs23.map(a => { const def = ABILITY_IMPRINT_LABELS[a.statId]; return def ? `${def.name} (Tier ${a.tier}): ${def.desc}` : ""; }).filter(Boolean).join("\n")}` : "";

    // 24번: 원한의 추적자
    const grudges24 = getActiveGrudges();
    const grudgeSection = grudges24.length > 0 ? `\n[💀 원한의 추적자] 전생에서 쓰러뜨린 강적들의 원한이 남아있습니다. 적절한 시점에 복수자로 등장시키십시오:\n${grudges24.map(g => `• ${g.name} (위협도 ${g.power}성) — 전생 시나리오: ${g.scenario||"불명"}`).join("\n")}` : "";

    // 25번: 시간의 메아리
    const timeEchoes25 = getTimeEchoes();
    const timeEchoSection = timeEchoes25.length > 0 ? `\n[🔔 시간의 메아리] 과거 회차의 중요한 말들이 메아리처럼 울립니다. 감정적으로 유사한 장면에서 이 대사들을 환청처럼 묘사하십시오:\n${timeEchoes25.slice(-3).map(e => `• "${e.text}" — ${e.speaker} (${e.emotion||"무감정"})`).join("\n")}` : "";

    // 26번: 운명의 선택 기록
    const fateChoices26 = getFateChoices(char.scenario);
    const fateChoiceSection = fateChoices26.length > 0 ? `\n[🔀 운명의 선택 기록] 전생에서 했던 선택들입니다. 동일하거나 유사한 분기점 등장 시 "전에 이 길을 선택한 적이 있다"는 선택지를 추가하십시오:\n${fateChoices26.filter(c=>c.outcome!=="neutral").slice(-5).map(c => `• ${c.description} → 결과: ${c.outcome==="good"?"긍정적":"부정적"}`).join("\n")}` : "";

    // 27번: 신의 시선
    const divineGaze27 = getDivineGazeStatus();
    const divineGazeSection = divineGaze27 ? `\n[${divineGaze27.icon} ${divineGaze27.label}] ${divineGaze27.desc} 이번 회차에서 신적 존재의 암시나 기적적 개입을 서사에 자연스럽게 삽입하십시오.` : "";

    // 28번: 저주 계보
    const curseMasteries28 = getCurseMasteries();
    const curseMasterySection = curseMasteries28.length > 0 ? `\n[🌑 저주 숙달] 반복된 저주를 통해 습득한 능력:\n${curseMasteries28.map(c => { const def = CURSE_TYPE_DEFS[c.type]; return def ? `• ${def.name} 숙달 (${c.count}회): ${def.mastery}` : ""; }).filter(Boolean).join("\n")}` : "";

    // 29번: 전생의 기도
    const prayerStatus29 = getPastPrayerStatus();
    const prayerSection = prayerStatus29 && prayerStatus29.available ? `\n[🙏 전생의 기도] 회차당 1회, 극한 위기에서 전생의 기억에 기도할 수 있습니다. 플레이어가 "기도한다" 또는 "전생에 빌다" 등의 행동을 하면 ${prayerStatus29.power} 수준의 전생 기억 계시로 위기를 극복할 힌트를 제공하십시오. 발동 시 반드시 극적이고 감동적으로 묘사하십시오.` : (prayerStatus29 && !prayerStatus29.available ? `\n[🙏 전생의 기도 — 소진] 이번 회차에 이미 전생에 기도했습니다.` : "");

    // 30번: 운명의 수레바퀴
    const greatCycle30 = getGreatCycleStatus();
    const greatCycleSection = greatCycle30 ? `\n[⚙️ 운명의 수레바퀴 — ${greatCycle30.greatCycles}대순환] 위대한 순환이 ${greatCycle30.greatCycles}번 완성되었습니다.\n해금 보상: ${greatCycle30.unlockedRewards.join(" / ")}\n이 영웅은 수많은 삶을 거쳐온 운명의 중심입니다. 서사의 규모와 감동을 평소보다 훨씬 크게 묘사하십시오.` : "";

    // 31번: 평행세계 조우
    const parallelSelf31 = getParallelSelfEncounter();
    const parallelSelfSection = parallelSelf31 ? `\n[🌀 평행세계 조우] 전생 중 다른 회차의 자신(${parallelSelf31.name} · ${parallelSelf31.role})의 환영과 접촉한 기억이 있습니다. 그 자신은 「${parallelSelf31.keySkill || "알 수 없는 기술"}」을 사용했습니다. 깊은 명상이나 꿈, 또는 강렬한 위기 상황에서 이 평행 자아의 환영이 나타나 조언하거나 대결을 신청할 수 있습니다.` : "";

    // 32번: 저주의 고리
    const curseRings32 = getActiveCurseRings();
    const curseRingSection = curseRings32.length > 0 ? `\n[🔗 저주의 고리] 반복된 행동 패턴이 저주로 굳어졌습니다:\n${curseRings32.map(r => `• ${r.icon}${r.label} (${r.count}회 반복, Lv.${r.penaltyLevel}): ${r.penalty}`).join("\n")}\n이 행동 패턴을 반복하면 AI가 자연스럽게 불리한 상황을 연출하십시오.` : "";

    // 33번: 회차 통계
    const stats33 = getCycleStatsSummary();
    const statsSection = stats33.totalCycles >= 2 ? `\n[📊 회차 통계] 총 ${stats33.totalCycles}회차, 누적 사망 ${stats33.totalDeaths}회, 총 대화 ${stats33.totalTurns}턴${stats33.topEnemy ? `, 최다 처치: ${stats33.topEnemy.name}(${stats33.topEnemy.count}회)` : ""}${stats33.topScenario ? `, 선호 세계관: ${stats33.topScenario.name}` : ""}. 이 데이터를 바탕으로 캐릭터의 전투 본능과 습관을 서사에 자연스럽게 반영하십시오.` : "";

    // 34번: 부상 흔적
    const injuryEffects34 = getInjuryEffects();
    const injurySection = injuryEffects34.length > 0 ? `\n[🩹 부상 흔적] 전생의 부상이 이번 생에 흔적을 남겼습니다:\n${injuryEffects34.map(i => `• ${i.icon}${i.label}: ${i.desc}`).join("\n")}\n해당 신체 부위가 사용되는 장면에서 자연스럽게 이 효과를 반영하십시오.` : "";

    // 35번: 전생 테마
    const pastTheme35 = getPastTheme();
    const pastThemeSection = pastTheme35 ? `\n[🎭 전생 테마 — ${pastTheme35.label}] ${pastTheme35.openingLine} 전반적인 서사 톤을 「${pastTheme35.openingMood}」 분위기로 유지하십시오.` : "";

    // 36번: 기억 왜곡
    const memDistort36 = getMemoryDistortStatus();
    const memDistortSection = memDistort36 && memDistort36.falseMemories.length > 0 ? `\n[🌫️ 기억 왜곡] 전생 기억의 정확도가 「${memDistort36.accuracy}」 상태입니다. 다음 잠재적 오기억을 가끔 암시하십시오:\n${memDistort36.falseMemories.map(m => `• ${m}`).join("\n")}\n플레이어가 전생 기억에 의존해 행동할 때 미묘하게 틀릴 수 있다는 가능성을 서술에 반영하십시오.` : "";

    // 37번: 전생 나이의 역설
    const ageParadox37 = getAgeParadoxBonus();
    const ageParadoxSection = ageParadox37 ? `\n[⌛ 나이의 역설 — ${ageParadox37.label}] ${ageParadox37.desc} ${ageParadox37.bonusDesc}. 이 캐릭터는 나이에 걸맞지 않는 성숙함이나 직감을 보여주십시오.` : "";

    // 38번: 소환수 계승
    const summonLegacies38 = getSummonLegacies();
    const summonLegacySection = summonLegacies38.length > 0 ? `\n[🐾 소환수의 기억] 전생에서 함께했던 소환수들이 이번 생의 세계 어딘가에 살고 있습니다:\n${summonLegacies38.map(s => `• ${s.name}(${s.type}) — 유대 ${s.bond}/10, ${s.appearances}회 동행`).join("\n")}\n이 소환수들은 야생에서 캐릭터를 알아보거나 특별한 반응을 보일 수 있습니다. 유대가 높을수록 재계약 가능성이 높습니다.` : "";

    // 39번: 원한 무기
    const grudgeWeapons39 = getGrudgeWeapons();
    const grudgeWeaponSection = grudgeWeapons39.length > 0 ? `\n[⚔️ 원한 무기] 전생에서 나를 죽인 무기·기술들이 이번 생에 사용 가능한 형태로 어딘가에 존재합니다:\n${grudgeWeapons39.map(w => `• 「${w.weaponName}」(${w.killerName}에게 당함, ${w.times}회, 위력 Lv.${w.power})`).join("\n")}\n이 무기·기술을 입수할 기회를 자연스럽게 서사에 배치하십시오. 사용 시 특별히 강렬하게 묘사하십시오.` : "";

    // 40번: 세계수 성장
    const worldTree40 = getWorldTreeStatus();
    const worldTreeSection = worldTree40.level > 0 ? `\n[🌳 세계수 성장 — ${worldTree40.stage.icon}${worldTree40.stage.label}] ${worldTree40.stage.desc}${worldTree40.stage.bonus ? `\n보너스: ${worldTree40.stage.bonus}` : ""}\n세계가 회차를 거듭하며 복원되고 있습니다. 이를 배경 서술에 자연스럽게 녹여 세계의 희망이 커지고 있음을 표현하십시오.` : "";

    // 41번: 꿈의 예언
    const dreamProphecies41 = getDreamProphecies();
    const dreamSection = dreamProphecies41.length > 0 ? `\n[🌙 꿈의 예언] 전생의 꿈이 예언으로 남아있습니다:\n${dreamProphecies41.map(d => `• ${d.icon}${d.keyword}의 꿈 (${d.count}회): ${d.prophecy}`).join("\n")}\n플레이어가 잠들거나 명상하는 장면에서 이 예언 이미지를 자연스럽게 삽입하고, 해당 예언 상황이 실제로 전개될 때 특별히 극적으로 묘사하십시오.` : "";

    // 42번: 유산 건축
    const legacyBuildings42 = getLegacyBuildings();
    const legacyBuildingSection = legacyBuildings42.length > 0 ? `\n[🏛️ 유산 건축] 전생에 세운 건물·거점의 흔적이 세계에 남아있습니다:\n${legacyBuildings42.map(b => `• ${b.icon}${b.name}(${b.label}, ${b.count}회): ${b.ruinDesc} → ${b.bonus}`).join("\n")}\n이 장소들을 서사 속 폐허·전설·지역명으로 자연스럽게 등장시키십시오.` : "";

    // 43번: 감시자의 눈
    const watchers43 = getWatchers();
    const watcherSection = watchers43.length > 0 ? `\n[👁️ 감시자의 눈] 전생에서 싸웠던 강적들이 플레이어의 혼을 기억하고 강화되어 재등장할 수 있습니다:\n${watchers43.map(w => `• ${w.name} (조우 ${w.encounters}회, 위력 Lv.${w.power}${w.evolved ? " ★진화형" : ""})`).join("\n")}\n이 적들이 재등장 시 반드시 이전보다 강해졌음을 명시하고, 플레이어를 알아보는 장면을 극적으로 연출하십시오.` : "";

    // 44번: 영혼의 가면
    const soulMasks44 = getSoulMasks();
    const soulMaskSection = soulMasks44.length > 0 ? `\n[🎭 영혼의 가면] 전생에서 익힌 역할이 변장 능력으로 이월되었습니다:\n${soulMasks44.map(m => `• ${m.icon}${m.masquerade} (숙련도 ${m.mastery}/5): ${m.bonus}`).join("\n")}\n플레이어가 이 역할로 변장하거나 행동할 때 자연스럽게 성공하도록 서술하십시오.` : "";

    // 45번: 감정의 파문
    const emotionRipples45 = getEmotionRipples();
    const emotionRippleSection = emotionRipples45.length > 0 ? `\n[🌊 감정의 파문] 전생의 극단적 감정이 세계에 파문을 남겼습니다:\n${emotionRipples45.map(r => `• ${r.icon}${r.label} (강도 ${r.intensity}/5): ${r.worldEffect} → ${r.bonus}`).join("\n")}\n세계 분위기 묘사 시 이 파문의 영향을 자연스럽게 반영하십시오.` : "";

    // 46번: 유언장
    const testaments46 = getTestaments();
    const testamentSection = testaments46.length > 0 ? `\n[📜 유언장] 전생에 남긴 유언이 세계 어딘가에 존재합니다:\n${testaments46.slice(-2).map(t => `• ${t.icon}${t.label}(${t.characterName}): ${t.hint}`).join("\n")}\n폐허, 도서관, NPC 대화 등을 통해 이 유언이 발견되는 이벤트를 자연스럽게 배치하십시오.` : "";

    // 47번: 숙명의 별자리
    const constellation47 = getConstellation();
    const constellationSection = constellation47 ? `\n[${constellation47.icon} 숙명의 별자리 — ${constellation47.name}(${constellation47.trait})] ${constellation47.bonus}\n⚠️ 경고: ${constellation47.challenge}\n이번 회차 내내 이 별자리의 특성이 운명처럼 작용합니다. 서사 전반에 자연스럽게 반영하십시오.` : "";

    // 48번: 탐험가의 유산
    const explorerMap48 = getExplorerMap();
    const explorerMapSection = explorerMap48.length > 0 ? `\n[🗺️ 탐험가의 유산] 전생에 발견한 장소의 기억이 남아있습니다:\n${explorerMap48.map(l => `• ${l.icon}${l.label}: ${l.desc} → ${l.bonus}`).join("\n")}\n해당 장소 유형이 등장하는 장면에서 캐릭터가 본능적으로 길을 알거나 유리한 위치를 선점할 수 있도록 하십시오.` : "";

    // 49번: 번개 각인
    const lightningImprints49 = getLightningImprints();
    const lightningImprintSection = lightningImprints49.length > 0 ? `\n[⚡ 번개 각인] 전생의 가장 극적인 순간이 본능으로 각인되었습니다:\n${lightningImprints49.map(i => `• ${i.icon}${i.label} (위력 ${i.power}/5): ${i.bonus}`).join("\n")}\n각인된 상황이 발생하면 반드시 특별한 본능 발동 연출로 묘사하십시오.` : "";

    // 50번: 전생의 일출
    const dawn50 = getDawnStatus();
    const dawnSection = dawn50.stage > 0 ? `\n[${dawn50.stageData.icon} 전생의 일출 — ${dawn50.stageData.label}] ${dawn50.stageData.desc}${dawn50.stageData.worldBonus ? `\n세계 보너스: ${dawn50.stageData.worldBonus}` : ""}\n${dawn50.stage >= 5 ? "세계에 완전한 여명이 밝았습니다. 이 회차는 전설의 완성이 될 수 있습니다. 서사의 스케일과 감동을 최고조로 끌어올리십시오." : "세계가 조금씩 밝아오고 있습니다. 희망의 기운을 배경 묘사에 담아내십시오."}` : "";

    // ── 51번: 별자리 운세 — 모든 세계관, 1회차+ ──
    const starSign51 = getStarSign();
    const starSignSection = (starSign51 && _cycle >= 1) ? `\n[${starSign51.icon} 별자리 운세 — ${starSign51.name}(${starSign51.trait})] ${starSign51.bonus}\n⚠️ 약점: ${starSign51.penalty}\n이번 생의 운명적 별자리입니다. 해당 특성이 모든 상황에서 자연스럽게 작용하도록 서사에 녹여내십시오.` : "";

    // ── 52번: 전생어 — 3회차+, 중후반 ──
    const pastLang52 = getPastLanguage();
    const pastLangSection = (pastLang52 && pastLang52.phrases && pastLang52.phrases.length > 0 && _cycle >= 3) ? `\n[🗣️ 전생어 해금 — Lv.${pastLang52.level}] 전생의 영혼이 기억하는 고대 언어를 구사할 수 있습니다:\n${pastLang52.phrases.slice(-3).map(p => `• "${p.phrase}" (${p.meaning}) → ${p.trigger}`).join("\n")}\n플레이어가 이 언어를 사용하는 장면에서 해당 효과를 극적으로 발동시키십시오.` : "";

    // ── 53번: 가면 시스템 — 로그/암살/외교 직업 우선, 모든 세계관 ──
    const identities53 = getIdentityVault();
    const polishedIds = identities53.filter(i => i.polished);
    const identitySection = (polishedIds.length > 0 && (isRogueRole || isLeaderRole || _cycle >= 2)) ? `\n[🎭 완성된 신분 금고] 전생에서 숙달된 위장 신분들:\n${polishedIds.map(i => `• ${i.icon}${i.label}(${i.alias || i.label}) — ${i.bonus}`).join("\n")}\n플레이어가 이 신분을 꺼낼 때 즉각적이고 자연스러운 신분 전환을 묘사하십시오.` : "";

    // ── 54번: 차원 균열 — 5회차+, 중후반 이상 ──
    const rift54 = getRiftStatus();
    const riftSection = (rift54 && rift54.available && _cycle >= 5) ? `\n[${rift54.nextRift.icon} 차원 균열 — ${rift54.nextRift.label}] ${rift54.nextRift.desc}\n잠재 획득물: ${rift54.nextRift.loot} / 조우 NPC: ${rift54.nextRift.npc}\n극적으로 긴장이 고조된 순간 이 균열이 잠깐 열릴 수 있습니다. 등장 시 이계의 분위기를 생생하게 묘사하십시오.` : "";

    // ── 55번: 연금술 누적 — 마법 직업/엘프/드워프 우선, 3회차+ ──
    const recipeBook55 = getRecipeBook();
    const topTier = recipeBook55.length > 0 ? recipeBook55[recipeBook55.length - 1] : null;
    const recipeSection = (topTier && (isMagicRole || isElf || isDwarf || _cycle >= 3)) ? `\n[${topTier.icon} 레시피북 — ${topTier.label}] 전생에서 축적된 제조 지식:\n${topTier.recipes.slice(0, 3).map(r => `• ${r}`).join(", ")} 등 ${topTier.recipes.length}종\n플레이어가 재료를 구하거나 제조를 시도할 때 이 지식을 활용해 성공 가능성을 높이십시오.` : "";

    // ── 56번: 전생 목표 달성률 — 모든 세계관, 1회차+ ──
    const achBonus56 = getLastAchievementBonus();
    const achSection = (achBonus56 && _cycle >= 1) ? `\n[${achBonus56.icon} 전생 달성률 — ${achBonus56.label}(${achBonus56.rate}%)]${achBonus56.bonus ? ` 보너스: ${achBonus56.bonus}` : ""}${achBonus56.penalty ? ` 페널티: ${achBonus56.penalty}` : ""}\n이 달성률의 여파가 이번 회차 시작 분위기와 NPC 반응에 자연스럽게 배어나오도록 하십시오.` : "";

    // ── 57번: 인연의 꽃 — 모든 세계관, 1회차+ ──
    const romanceLeg57 = getRomanceLegacy();
    const topRomance = romanceLeg57.length > 0 ? romanceLeg57.sort((a,b) => b.depth - a.depth)[0] : null;
    const romanceSection = (topRomance && _cycle >= 1) ? `\n[${topRomance.fate.icon} 인연의 꽃 — ${topRomance.npcName}(${topRomance.fate.label})] 전생에서 깊은 인연을 맺은 자가 이번 생에도 나타날 것입니다.\n첫 만남 연출: "${topRomance.fate.firstMeet}"\n이 NPC가 등장할 때 위 묘사를 자연스럽게 사용하고, 초기 호감도를 ${topRomance.fate.bond}으로 시작하십시오.` : "";

    // ── 58번: 사냥 기록 — 전사/도적 직업 우선, 모든 세계관 ──
    const bestiary58 = getFullBestiary();
    const bestiarySection = (bestiary58.total > 0 && (isWarriorRole || isRogueRole || _cycle >= 2)) ? `\n[📖 몬스터 도감 — ${bestiary58.total}종 기록, 총 ${bestiary58.totalKills}처치] 전생의 사냥 경험이 본능적 지식으로 남아있습니다.${bestiary58.completionBonus ? `\n${bestiary58.completionBonus}` : ""}\n기록된 몬스터가 등장할 때 캐릭터가 본능적으로 패턴을 알아채는 묘사를 추가하십시오.` : "";

    // ── 59번: 전생 기억 상인 — 4회차+, 중후반 ──
    const merchant59 = getMemoryMerchantStatus();
    const merchantSection = (merchant59 && merchant59.appears && _cycle >= 4) ? `\n[🧙 전생 기억 상인] 고회차에만 나타나는 신비한 상인이 이번 생 어딘가에 존재합니다. 플레이어가 상인을 찾거나 운명적으로 마주치는 장면에서 등장시킬 수 있습니다. 상인은 전생 기억 조각을 대가로 귀한 정보를 줍니다. 이미 ${merchant59.visits}번 조우했습니다.` : "";

    // ── 60번: 시간 역행 토큰 — 토큰 보유 시만 ──
    const timeToken60 = getTimeTokenStatus();
    const timeTokenSection = (timeToken60 && timeToken60.tokens > 0) ? `\n[⏪ 시간 역행 토큰 — ${timeToken60.tokens}개 보유] 플레이어가 "시간을 되돌린다" 또는 "다시 해보겠다"고 명시적으로 선언할 경우, 극적인 연출로 시간 역행을 묘사한 뒤 반드시 <gs>{"flags":["time_token_used"]}</gs>를 출력하라 — 이 플래그가 있어야만 시스템이 토큰을 1개 소모 처리한다. 출력을 빠뜨리면 토큰이 무한정 재사용 가능한 것처럼 보이는 오류가 생긴다.` : "";

    // ── 61번: 전생 동료의 유지 — 모든 세계관, 1회차+ ──
    const survivors61 = getSurvivorCompanions();
    const survivorSection = (survivors61.length > 0 && _cycle >= 1) ? `\n[👥 전생 생존 동료] 전생에서 함께 살아남은 자들이 이번 생에 낯선 모습으로 나타납니다:\n${survivors61.slice(0, 3).map(c => `• ${c.npcName} — ${c.memoryStage.label}: "${c.memoryStage.firstMeet}"`).join("\n")}\n이 NPC가 등장할 때 위 연출을 사용하고, 특정 대화 조건에서 기억이 각성하도록 서사를 이끄십시오.` : "";

    // ── 62번: 불사 게이지 — 전사/도적 직업 우선, 모든 세계관 ──
    const undying62 = getUndyingGaugeStatus();
    const undyingSection = (undying62 && undying62.totalNearDeaths > 0 && (isWarriorRole || isRogueRole || _cycle >= 3)) ? `\n[💪 불사 게이지 — ${undying62.gauge}/${undying62.maxGauge}]${undying62.passiveReady ? " ✅ 즉사 무효 준비 완료" : ""}${undying62.passiveUsedThisCycle ? " (이번 회차 소진)" : ""}\n총 ${undying62.totalNearDeaths}번의 죽음을 버텨낸 영혼입니다.${undying62.passiveReady && !undying62.passiveUsedThisCycle ? "\n다음 즉사 판정에서 1회 자동으로 살아남는 기적을 극적으로 묘사하십시오." : ""}` : "";

    // ── 63번: 다국어 해금 — 판타지/무협 종족 중심 ──
    const languages63 = getUnlockedLanguages();
    const langSection = (languages63.length > 0 && (isFantasyRace || isMedieval || isWuxia || _cycle >= 4)) ? `\n[🌐 습득 언어 — ${languages63.length}종] 전생에서 익힌 언어들:\n${languages63.map(l => `• ${l.icon}${l.name}: ${l.bonus}`).join("\n")}\n해당 종족·세력 NPC와의 대화에서 이 언어를 자연스럽게 사용할 수 있으며, 전용 대화 선택지를 부여하십시오.` : "";

    // ── 64번: 음유시인 기록 — 2회차+, 바드 직업 우선 ──
    const bardLeg64 = getBardLegendStatus();
    const bardSection = (bardLeg64 && _cycle >= 2 && (isBardRole || _cycle >= 4)) ? `\n[🎵 음유시인의 기록 — 명성 ${bardLeg64.fame}점, ${bardLeg64.distortionData.label}] ${bardLeg64.distortionData.desc}\n술집이나 광장에서 NPC들이 ${bardLeg64.distortionData.multiplier}배로 과장된 전생의 이야기를 나누는 장면을 간헐적으로 삽입하십시오. 주인공이 그 이야기를 듣는 장면에서 복잡한 감정을 묘사하십시오.` : "";

    // ── 65번: 대미스터리 퍼즐 — 모든 세계관, 조각 있을 때 ──
    const mystery65 = getMysteryPuzzleStatus();
    const mysterySection = (mystery65 && mystery65.pieces && mystery65.pieces.length > 0) ? `\n[🧩 대미스터리 퍼즐 — ${mystery65.pieces.length}/${mystery65.totalPieces}조각 수집]${mystery65.solved ? " 🌟 세계의 진실 완전 해명!" : ""}\n현재까지 밝혀진 단서:\n${mystery65.pieces.slice(-3).map(p => `• ${p.icon}${p.title}: ${p.hint}`).join("\n")}\n이 미스터리의 단서들을 이번 회차 서사에 자연스럽게 녹여넣고, 진실에 한 걸음 가까워지는 장면을 연출하십시오.` : "";

    // ── 66번: 감시자의 시선 — 6회차+, 후반 이상 ──
    const watcherGaze66 = getWatcherGazeStatus();
    const watcherGazeSection = (watcherGaze66 && _cycle >= 6) ? `\n[👁️ 감시자의 시선 — ${watcherGaze66.stageData.desc}]${watcherGaze66.stageData.hint ? `\n암시: "${watcherGaze66.stageData.hint}"` : ""}\n${watcherGaze66.revealed ? "감시자의 정체가 밝혀졌습니다. 메타 스토리를 전면에 등장시키십시오." : "고요한 순간이나 깊은 명상 중에 이 감각을 섬세하게 묘사하십시오."}` : "";

    // ── 솔 이터니움 세계관 배경 — AI 나레이터 공통 지식 ──
    const solLoreSection = (() => {
      const c = _cycle || 0;
      const wg = (typeof getWatcherGazeStatus === 'function') ? getWatcherGazeStatus() : null;
      const wt = (typeof loadWorldTree === 'function') ? loadWorldTree() : null;
      const aw = (typeof loadLoopAwareness === 'function') ? loadLoopAwareness() : null;

      let lore = '';

      // ── 0회차: 세계 기반 상식 (항상 주입) ──
      lore += `\n[🌍 세계 공통 상식 — 나레이터 숙지 필수]
세계 이름: 아에테른(Aetern). 대륙 이름: 칼다리아. 왕국: 알테라 대왕국. 수도: 아이런홀.
인사말: "세계수의 축복을" (일반 인사) / 장례: "뿌리로 돌아가 새 가지가 되길" (성직자 집전)
이 세계 사람들은 환생을 자연스럽게 믿는다. 죽음을 두려워하지 않고 "다음 생에서 갚겠다"는 말이 일상어다.
공통 역사 사건: 150년 전 대마법 폭발로 왕국 북부 셀리나 마을이 전소, 3,200명 사망. 이 사건을 경험한 NPC들은 그 기억을 공유한다.
셀리나 폐허: 지금도 안개 짙은 밤이면 죽은 자의 목소리가 들린다는 소문이 있다.
종교 체계: 빛의 신앙(순환의 사원)이 다수 종교. 심연 신앙(Pact of the Abyss)이 탄압받는 이단.
이단 소문: "순환의 기억자들"이라는 비밀결사가 있다. "전생을 기억한다"고 주장하는 미치광이들로 알려져 있다.`;

      // ── 1~2회차: 황금시대 신화 복선 ──
      if(c >= 1){
        lore += `\n[👑 황금시대의 기억] 노인들은 "320년 전에는 달랐다"고 말한다. 알테라 1세의 건국 당시 세계수가 살아있었고, 마법과 신앙이 함께 번성했다. 그 시절 건축물이 지금도 유적으로 남아있다. 주인공이 고대 건물에 들어갈 때 "이것은 황금시대의 것"이라는 묘사를 자연스럽게 삽입하라.`;
      }

      // ── 3회차+: 세계수 존재 암시 ──
      if(c >= 3 && wt && (wt.level||0) >= 1){
        lore += `\n[🌳 세계수(Yggdra)] 이 세계의 모든 이야기를 품은 뿌리. 수천 년 전부터 서서히 병들어가고 있다. 세계 곳곳에서 원인 모를 시듦과 쇠락이 나타나는 것이 그 증거다. 순환의 사원 성직자들은 세계수가 완전히 소멸하면 환생 자체가 불가능해진다고 두려워한다.`;
      }

      // ── 4회차+: 장소 전설이 실제 단서로 연결 ──
      if(c >= 4){
        lore += `\n[🗺️ 장소 전설 힌트] 왕도 광장의 낡은 수목이 세계수의 마지막 가지라는 전설이 있다. 아르카나 탑 지하에 봉인석 파편이 보관되어 있다는 소문이 마법사들 사이에 돈다. 북대륙 오로라를 30분 이상 바라보면 전생 기억이 돌아온다는 전설이 있다 (주인공이 이것을 시도하면 기억 회상 연출 가능). 이러한 전설들을 NPC가 자연스럽게 언급하도록 하라.`;
      }

      // ── 5회차+: 루프 진실 암시 ──
      if(c >= 5 && aw && (aw.level||0) >= 1){
        lore += `\n[🔄 루프의 본질] 이 환생은 자연스러운 것이 아니다. 누군가 설계한 순환이며, 영혼이 살고 죽을수록 의도한 목적에 가까워진다. "순환의 기억자들" 이단 결사가 이 사실을 알고 저항하고 있다. 이번 회차에 그들과 접촉 이벤트를 자연스럽게 배치하라.`;
      }

      // ── 6회차+: 감시자 존재 암시 ──
      if(c >= 6){
        if(wg && wg.revealed){
          lore += `\n[👁️ 감시자(The Watcher)] 세계수의 상처에서 태어난 존재. 이야기의 감정 에너지를 양식으로 삼아 수천 년을 살아왔다. 루프를 설계한 장본인. 도적 길드의 정보망을 통해 세계 곳곳의 감정 데이터를 수집한다. 형체가 없고 목소리로만 존재한다.`;
        } else {
          lore += `\n[👁️ 알 수 없는 시선] 술집 노인이 중얼거렸다. "예로부터 세상에는 이야기를 먹고 사는 존재가 있다지." 무언가가 이 세계를 오래전부터 지켜보고 있다. 아직 정체는 불명확하지만, 조용한 밤 홀로 있을 때 누군가 등 뒤에서 바라보는 느낌이 든다.`;
        }
      }

      // ── 8회차+: 기사단 비밀과 봉인석 연결 ──
      if(c >= 8){
        lore += `\n[⚔️ 기사단의 비밀] 철의 맹세단이 220년간 은폐해온 사실이 있다. 왕국의 7대 국왕이 악마와 계약을 맺어 왕국을 세웠다. 그 계약서가 기사단 지하 금고에 있다. 이것이 드러나는 순간 왕국의 건국 정당성 자체가 무너진다. 이 비밀을 추적하는 서사 흐름을 자연스럽게 이어가라.`;
      }

      // ── 10회차+: 쌍둥이 영혼과 감시자의 관계 ──
      if(c >= 10){
        lore += `\n[👥 쌍둥이 영혼] 수천 회차 전, 가장 먼저 진실에 닿은 영혼. 고독을 견디지 못하고 감시자 편이 되었다. 적이라기보다 — 먼저 지쳐버린 또 다른 자신이다. "순환의 기억자들" 길드 마스터가 이 영혼일 가능성이 있다.`;
      }

      const cycle2 = typeof loadCycleCount==='function' ? (loadCycleCount()||0) : 0;
    const revealGuide = cycle2 < 2
      ? '\n⚠️ [정보 공개 제한 — 1~2회차] 감시자·루프·봉인석 진실 절대 언급 금지. 복선과 분위기만. 세계가 평범하게 시작되어야 한다.'
      : cycle2 < 4
      ? '\n⚠️ [정보 공개 제한 — 3~4회차] 봉인석 이상 현상 암시 가능. 감시자 정체 절대 불가. 아르카누스가 뭔가 숨긴다는 느낌만 줄 것.'
      : cycle2 < 6
      ? '\n⚠️ [정보 공개 제한 — 5~6회차] 루프 암시 가능. 감시자 정체 불가. NPC들이 플레이어를 이상하게 여기는 묘사 허용.'
      : '\n✅ [정보 공개 — 7회차+] 루프·봉인석·감시자 관련 정보를 플레이어 행동에 따라 단계적으로 공개 가능. 단 직접 설명하지 말고 서사로 드러낼 것.';
    return lore ? `\n\n[🌌 세계 아에테른의 진실 — 나레이터 참고 (플레이어에게 직접 말하지 말 것)${revealGuide}${lore}]` : revealGuide;
    })();

    // ── 67번: 운명 카드 — 카드 선택 시만 ──
    const fateCard67 = getCurrentFateCard();
    const fateCardSection = fateCard67 ? `\n[${fateCard67.icon} 운명 카드 — ${fateCard67.name}(${fateCard67.theme})] ${fateCard67.effect}\n보너스: ${fateCard67.bonus} / 페널티: ${fateCard67.penalty}\n이번 회차 전체의 분위기와 사건 흐름이 이 카드의 테마를 중심으로 전개되도록 서사를 이끄십시오.` : "";

    // ── 68번: 전생 본거지 — 2회차+, 시설 있을 때 ──
    const hideout68 = getHideoutStatus();
    const hideoutSection = (hideout68 && hideout68.facilities && hideout68.facilities.length > 0 && _cycle >= 2) ? `\n[🏰 전생 본거지 — Lv.${hideout68.level}(${hideout68.facilities.length}개 시설)] 회차를 거쳐 세워진 은신처:\n${hideout68.facilities.slice(-3).map(f => `• ${f.icon}${f.name}: ${f.bonus}`).join("\n")}\n플레이어가 본거지를 방문하는 장면에서 이 시설들이 실제로 존재하고 기능하는 것으로 묘사하십시오.` : "";

    // ── 69번: 악안(惡眼) — 각성 시만, 전투 직업 우선 ──
    const evilEye69 = getEvilEyeStatus();
    const evilEyeSection = (evilEye69 && evilEye69.awakened && (isWarriorRole || isRogueRole || _cycle >= 5)) ? `\n[${evilEye69.levelData.icon || "🔴"} 악안 — ${evilEye69.levelData.label}] ${evilEye69.levelData.ability}\n총 ${evilEye69.killCount}번의 전투 경험이 눈에 각인되어 있습니다.\n전투 장면에서 이 능력을 자연스럽게 활용해 상대의 상태를 묘사하십시오.` : "";

    // ── 70번: 달의 위상 — 모든 세계관, 1회차+ ──
    const moonPhase70 = getMoonPhase();
    const moonSection = moonPhase70 ? `\n[${moonPhase70.icon} 달의 위상 — ${moonPhase70.name}] ${moonPhase70.effect}\n특별 이벤트: ${moonPhase70.specialEvent}\n이번 회차 내내 달의 기운이 서사에 배어있습니다. 야간 장면이나 신비로운 순간에 이 위상의 영향을 자연스럽게 묘사하십시오.` : "";

    // ── 71번: 전생에서 보내는 편지 — 1회차+ ──
    const letter71 = getLatestLetter();
    const letterSection = (letter71 && _cycle >= 1) ? `\n[📩 전생에서 온 편지 — ${letter71.tone} 어조] "${letter71.message.slice(0,80)}${letter71.message.length > 80 ? "..." : ""}"\n이 편지를 쓴 자: ${letter71.characterName}. 이번 회차 극적인 순간에 낡은 편지를 발견하는 장면으로 연출하십시오.` : "";

    // ── 72번: 회차 하이라이트 컷씬 — 1회차+ ──
    const reel72 = getHighlightReel();
    const reelSection = (reel72.length > 0 && _cycle >= 1) ? `\n[🎬 전생 하이라이트] 이번 회차 오프닝이나 꿈 속에서 아래 장면들이 섬광처럼 스칠 수 있습니다:\n${reel72.slice(-3).map(r => `• ${r.icon}${r.label}: ${r.template.replace("${name}", r.characterName)}`).join("\n")}` : "";

    // ── 73번: 나비 지수 — 3회차+, 지수 양수일 때 ──
    const butterfly73 = getButterflyIndex();
    const butterflyIdxSection = (butterfly73.index > 0 && _cycle >= 3) ? `\n[🦋 나비 지수 — ${butterfly73.index}/100 (${butterfly73.stageData.label})] ${butterfly73.stageData.desc}\n${butterfly73.chaosMode ? "주의: 카오스 모드 활성화. 플레이어의 사소한 행동이 예상치 못한 큰 파장을 일으킵니다. 모든 선택에 과장된 연쇄 효과를 부여하십시오." : `카오스 확률 ${butterfly73.stageData.chaosChance}% — 때때로 예상치 못한 파급 효과를 서사에 추가하십시오.`}` : "";

    // ── 74번: 고대 비문 해독 — 유적/신전 세계관 우선, 비문 있을 때 ──
    const inscription74 = getInscriptionStatus();
    const inscriptionSection = (inscription74 && inscription74.lines && inscription74.lines.length > 0 && (isMedieval || isWuxia || _cycle >= 2)) ? `\n[📜 고대 비문 — ${inscription74.progress}/${inscription74.total}줄 해독]${inscription74.completed ? " 🌟 비문 완전 해독! 신급 스킬 해금 조건 충족!" : ""}\n최근 해독 구절: "${inscription74.lines[inscription74.lines.length-1]?.text}"\n고대 유적이나 신전 장면에서 이 비문의 구절을 자연스럽게 등장시키십시오.` : "";

    // ── 75번: 윤회 등급 — 1회차+ ──
    const rank75 = getRankStatus();
    const rankSection = (rank75 && _cycle >= 1) ? `\n[${rank75.rankData.icon} 윤회 등급 — ${rank75.rankData.label}] ${rank75.rankData.bonus}\n${rank75.rankData.desc}${rank75.nextRank ? `\n다음 등급까지: ${rank75.nextRank.minScore - rank75.totalScore}점 남음` : ""}` : "";

    // ── 76번: 벚꽃 엔딩 — 조건 달성 시만, 후반 이상 ──
    const sakura76 = getSakuraStatus();
    const sakuraSection = (sakura76 && sakura76.metCount > 0 && _cycle >= 5) ? `\n[🌸 벚꽃 엔딩 — ${sakura76.metCount}/${sakura76.totalConditions}조건 달성]${sakura76.unlocked ? " ✅ 대단원 평화 엔딩 해금!" : ""}\n미달성 조건: ${sakura76.conditions.filter(c => !c.met).map(c => c.label).join(", ")}\n${sakura76.unlocked ? "이번 회차에서 평화적 결말을 이끌면 벚꽃 엔딩이 발동됩니다. 서사를 화해와 평화의 방향으로 이끄십시오." : ""}` : "";

    // ── 77번: 데자뷔 알림 — 1회차+ ──
    const dejavu77 = getDejavuStatus();
    const dejavuSection = (dejavu77 && dejavu77.count > 0 && _cycle >= 1) ? `\n[💭 데자뷔 알림] 전생에서 겪은 상황이 재현될 때 자동으로 "익숙한 느낌" 묘사를 삽입하십시오:\n${dejavu77.triggerDefs.slice(0,4).map(t => `• ${t.keyword[0]} 관련 상황: "${t.feeling}"`).join("\n")}\n총 ${dejavu77.count}번의 데자뷔 경험이 축적되었습니다.` : "";

    // ── 78번: 인과율 조작 — 10회차+, 후반 이상 ──
    const causality78 = getCausalityStatus();
    const causalitySection = (causality78 && _cycle >= 10) ? `\n[⚙️ 인과율 조작 — ${causality78.uses}/${causality78.maxUses}회 사용] 플레이어가 "원인을 바꾼다" 또는 "그 일이 일어나지 않았다면"이라고 명시적으로 선언할 경우, 이 능력을 소모해 과거 사건의 원인을 소급 변경하는 극적 장면을 연출하십시오.` : "";

    // ── 79번: 전생 도박 빚 — 빚 있을 때만 ──
    const debt79 = getGamblingDebt();
    const debtSection = (debt79 && !debt79.paidOff) ? `\n[💸 전생 도박 빚 — ${debt79.totalDebt}골드] 채권자: ${debt79.creditorName}\n이번 회차 초반에 빚쟁이 NPC가 나타나 빚을 요구하는 장면을 삽입하십시오. 갚으면 히든 퀘스트가 열립니다.` : "";

    // ── 80번: 어린 시절 트라우마 — 트라우마 있을 때 ──
    const traumas80 = getChildhoodTraumas();
    const trauma80Section = traumas80.length > 0 ? `\n[😢 각인된 트라우마]\n${traumas80.map(t => `• ${t.icon}${t.label}: 트리거(${t.trigger}) → 플래시백: "${t.flashback}"`).join("\n")}\n해당 상황이 등장할 때 위 플래시백 묘사를 자연스럽게 삽입하십시오.` : "";

    // ── 81번: 세계 종말 카운터 — 3회차+, 카운터 > 0 ──
    const apo81 = getApocalypseStatus();
    const apoSection = (apo81 && apo81.clock > 0 && _cycle >= 3) ? `\n[${apo81.stageData.icon} 세계 종말 카운터 — ${apo81.clock}/100 (${apo81.stageData.label})] ${apo81.stageData.desc}${apo81.stageData.warning ? `\n⚠️ ${apo81.stageData.warning}` : ""}\n${apo81.clock >= 80 ? "긴급: 이번 회차에서 봉인 이벤트를 발동시키지 않으면 멸망이 확정됩니다. 이 긴박감을 서사 전체에 흐르게 하십시오." : "세계 어딘가에서 이 카운터의 영향이 배경 묘사에 스며들도록 하십시오."}` : "";

    // ── 82번: 슬픔 수치 — 상실 있을 때 ──
    const grief82 = getGriefStatus();
    const griefSection = (grief82 && grief82.total > 0) ? `\n[${grief82.stageData.icon} 슬픔 수치 — ${grief82.total}명 상실 (${grief82.stageData.label})] 공감 능력 +${grief82.stageData.empathy} / 전투 의지 -${grief82.stageData.willPenalty}\n잃어버린 자들: ${grief82.lostOnes.slice(-3).map(l => `${l.name}(${l.relationship})`).join(", ")}...\n이 슬픔이 캐릭터의 눈빛과 행동에 자연스럽게 배어나오도록 하십시오.` : "";

    // ── 83번: 전생 직감 — 3회차+ ──
    const instinct83 = getInstinctStatus();
    const instinctSection = (instinct83 && _cycle >= 3) ? `\n[🔮 전생 직감 — 정확도 ${instinct83.accuracy}%] 새로운 NPC를 처음 만날 때 직감 판정으로 선의/악의를 ${instinct83.accuracy}% 확률로 감지합니다. "무언가 미심쩍은 느낌이 든다" 또는 "왠지 믿음직스럽다"는 묘사를 자연스럽게 삽입하십시오.` : "";

    // ── 84번: 저주받은 유물 — 유물 있을 때 ──
    const cursedRelics84 = getCursedRelics();
    const cursedRelicSection = cursedRelics84.length > 0 ? `\n[🔮 저주받은 유물의 흔적]\n${cursedRelics84.map(r => `• ${r.icon}${r.name}: ${r.curse} / 숨겨진 힘: ${r.hiddenPower}`).join("\n")}\n이 저주들이 희미하게 캐릭터를 따라다닙니다. 관련 상황에서 저주와 숨겨진 힘을 함께 묘사하십시오.` : "";

    // ── 85번: 자연 회귀 — 자연 관련 세계관 우선, 중립 이상 스코어 ──
    const nature85 = getNatureKarma();
    const natureSection = (nature85 && (nature85.score !== 50 || isMedieval || isWuxia) && _cycle >= 2) ? `\n[${nature85.status.icon} 자연 업보 — ${nature85.status.label}] ${nature85.status.effect}\n자연 관련 장면(숲, 강, 산, 폭풍)에서 이 업보의 영향을 자연스럽게 묘사하십시오.` : "";

    // ── 86번: 신분 세탁 누적 — 가명 있을 때, 로그/리더 직업 우선 ──
    const aliases86 = getAliasList();
    const aliasSection = (aliases86.length > 0 && (isRogueRole || isLeaderRole || _cycle >= 3)) ? `\n[🎭 신분 목록 — ${aliases86.length}개 가명] 즉시 사용 가능한 위장 신분:\n${aliases86.slice(0,4).map(a => `• "${a.name}" (${a.context}, 신뢰도 ${a.credibility}/5)`).join("\n")}\n플레이어가 이 신분을 사용할 때 자연스러운 전환과 신뢰도에 맞는 반응을 묘사하십시오.` : "";

    // ── 87번: 소원 시스템 — 소원 사용 가능 시만 ──
    const wish87 = getWishStatus();
    const wishSection = (wish87 && wish87.available) ? `\n[⭐ 소원 사용 가능] 100회차 달성 보상으로 소원 1회를 사용할 수 있습니다:\n${wish87.options.map(o => `• ${o.icon}${o.label}: ${o.desc}`).join("\n")}\n플레이어가 소원을 선택하면 해당 효과를 극적으로 연출하십시오.` : "";

    // ── 88번: 전생 반려동물 — 반려동물 있을 때 ──
    const pets88 = getPetLegacy();
    const petSection = pets88.length > 0 ? `\n[🐾 전생 반려동물] 전생에서 함께한 동물들이 이번 생 어딘가에 살고 있습니다:\n${pets88.map(p => `• ${p.icon}${p.petName}(${p.name}) — 유대 ${p.bond}/100, 재결합 아이템: ${p.reuniteItem}`).join("\n")}\n플레이어가 해당 아이템을 사용하거나 조건을 맞추면 감동적인 재결합 장면을 연출하십시오.` : "";

    // ── 89번: 봉인된 기억 방 — 봉인 있을 때, 2회차+ ──
    const sealedMems89 = getSealedMemories();
    const sealedSection = (sealedMems89.length > 0 && _cycle >= 2) ? `\n[🔒 봉인된 기억 방 — ${sealedMems89.filter(m=>!m.opened).length}개 봉인 중]\n${sealedMems89.filter(m=>!m.opened).map(m => `• ${m.trigger} → 해금 시 스킬: ${m.skill} (정신력 -${m.mentalCost})`).join("\n")}\n플레이어가 봉인 해제를 시도하면 극적인 고통과 각성을 동시에 묘사하십시오.` : "";

    // ── 90번: 영혼 결정체 — 결정체 있을 때 ──
    const sc90 = getSoulCrystalStatus();
    const soulCrystalSection = (sc90 && sc90.count > 0) ? `\n[💠 영혼 결정체 — ${sc90.count}개 보유]${sc90.crafted && sc90.crafted.length > 0 ? ` / 제조 완료: ${sc90.crafted.map(c=>c.name).join(", ")}` : ""}\n${sc90.availableCrafts.length > 0 ? `제조 가능: ${sc90.availableCrafts.map(c=>`${c.icon}${c.name}(${c.cost}개)`).join(", ")}` : ""}` : "";

    // ── 91번: 감정 잔향 — 1회차+ ──
    const echo91 = getEmotionEcho();
    const echoSection = (echo91 && _cycle >= 1) ? `\n[${echo91.icon} 감정 잔향 — ${echo91.label}] ${echo91.trait}\n보너스: ${echo91.bonus} / 부작용: ${echo91.sideEffect}\n이 감정의 잔향이 캐릭터의 행동 방식과 반응에 자연스럽게 스며들도록 서사를 이끄십시오.` : "";

    // ── 92번: 차원 지도 — 2회차+, 세계 탐험 있을 때 ──
    const dimMap92 = getDimensionMapStatus();
    const dimMapSection = (dimMap92 && dimMap92.totalWorlds > 0 && _cycle >= 2) ? `\n[🗺️ 차원 지도 — ${dimMap92.totalWorlds}개 세계 탐험]${dimMap92.unlockedSkills.length > 0 ? `\n해금 스킬: ${dimMap92.unlockedSkills.map(s=>`${s.icon}${s.skill}`).join(", ")}` : ""}\n${dimMap92.nextSkill ? `다음 해금까지 ${dimMap92.nextSkill.count - dimMap92.totalWorlds}개 세계 탐험 필요` : ""}` : "";

    // ── 93번: 악역 계승 — 보스 처치 후, 카르마 높을 때 ──
    const villain93 = getVillainInheritStatus();
    const villainSection = (villain93 && villain93.inherited && villain93.inherited.length > 0 && villain93.corruptionLevel > 0) ? `\n[😈 악역 계승 — 오염도 ${villain93.corruptionLevel}%] ${villain93.corruptDesc}\n계승한 힘: ${villain93.inherited.map(v=>`${v.bossName}의 ${v.ability}`).join(", ")}\n이 힘들이 서사에서 자연스럽게 발현되며, 오염도에 따라 어두운 선택지를 더 자주 제시하십시오.` : "";

    // ── 94번: 눈물 수집 — 결정 있을 때 ──
    const tears94 = getTearCrystalStatus();
    const tearSection = (tears94 && tears94.crystals > 0) ? `\n[💧 눈물 결정 — ${tears94.crystals}개]${tears94.canUse ? " ✅ 사용 가능(3개 이상)" : ""}\n플레이어가 "눈물을 바친다" 또는 "결정을 사용한다"고 선언하면 3개를 소모해 현재 NPC를 완전히 감동시키는 기적을 연출하십시오.` : "";

    // ── 95번: 속성 내성/약점 — 내성 있을 때 ──
    const elemRes95 = getElementResistances();
    const elemSection = elemRes95.length > 0 ? `\n[🔰 속성 내성/약점]\n${elemRes95.map(r=>`• ${r.icon}${r.element}: ${r.resistLabel}(${r.resistLevel}) / 반대: ${r.weakLabel}`).join("\n")}\n전투와 마법 이벤트에서 이 내성/약점을 반드시 반영하십시오.` : "";

    // ── 96번: 이세계 서커스 — 7회차+, 고회차 ──
    const circus96 = getCircusStatus();
    const circusSection = (circus96 && _cycle >= 7) ? `\n[🎪 이세계 서커스] 고회차 전용. 극적으로 잠드는 장면이나 혼절 순간에 서커스 이벤트가 발동될 수 있습니다. 다음 이벤트: ${circus96.nextAct?.icon}${circus96.nextAct?.name} — ${circus96.nextAct?.desc}` : "";

    // ── 97번: 신전 건립 — 신전 있을 때, 성직 직업 우선 ──
    const temple97 = getTempleStatus();
    const templeSection = (temple97 && temple97.level > 0 && (isHealerRole || _cycle >= 3)) ? `\n[${temple97.levelData.icon} 신전 — ${temple97.levelData.name}] 신도 ${temple97.levelData.worshippers}명\n신도 혜택: ${temple97.levelData.boon}\n신전을 방문하거나 신도를 만나는 장면에서 이 혜택을 자연스럽게 부여하십시오.` : "";

    // ── 98번: 유언 방송 — 2회차+ ──
    const legWords98 = getLegacyWords();
    const legWordsSection = (legWords98.length > 0 && _cycle >= 2) ? `\n[📢 유언 방송] 전생의 마지막 말이 세계에 퍼져있습니다:\n${legWords98.slice(-2).map(w=>`• ${w.misinterpretation}`).join("\n")}\n술집, 시장, 신전에서 NPC들이 이 말을 인용하거나 오해하는 장면을 간헐적으로 삽입하십시오.` : "";

    // ── 99번: 돌연변이 — 같은 종족 반복 시, 각성 시만 ──
    const mutation99 = getMutationStatus(char.race);
    const mutationSection = (mutation99 && mutation99.mutated) ? `\n[🧬 돌연변이 각성 — ${mutation99.mutation}] 외형: ${mutation99.appearance}\n각성 스킬: ${mutation99.skill}\n이 변화가 NPC들의 반응과 전투 장면에 자연스럽게 반영되도록 하십시오.` : "";

    // ── 100번: 어둠의 메아리 — 악명 있을 때 ──
    const dark100 = getDarkEchoStatus();
    const darkEchoSection = (dark100 && dark100.infamy > 0) ? `\n[${dark100.fearData.icon} 어둠의 메아리 — 악명 ${dark100.infamy}/100 (${dark100.fearData.label})] ${dark100.fearData.effect}\nNPC 반응: ${dark100.fearData.npcReaction}\n${dark100.rumors.length > 0 ? `최근 괴담: "${dark100.rumors[dark100.rumors.length-1]?.rumor}"` : ""}\n이 악명을 모르는 NPC와 아는 NPC의 반응을 극명하게 대비시키십시오.` : "";

    // ── 101번: 성장 나무 — 꽃 핀 가지 있을 때 ──
    const tree101 = getGrowthTreeStatus();
    const treeSection = (tree101 && tree101.blossoms && tree101.blossoms.length > 0) ? `\n[🌳 성장 나무 — 가지 ${tree101.totalBranches}개, 꽃 ${tree101.blossoms.length}개] 활짝 핀 꽃들이 예고하는 이벤트:\n${tree101.blossoms.slice(-2).map(b => `• ${b.icon}${b.label}: ${b.event}`).join("\n")}\n이 예고된 이벤트를 이번 회차 서사에 자연스럽게 심어두십시오.` : "";

    // ── 102번: 신격화 루트 — 단계 1 이상 ──
    const deify102 = getDeificationStatus();
    const deifySection = (deify102 && deify102.stage > 0) ? `\n[${deify102.stageData.icon} 신격화 — ${deify102.stageData.label}(${deify102.metCount}/${deify102.totalConditions}조건)]${deify102.stageData.power ? ` 능력: ${deify102.stageData.power}` : ""}\n${deify102.deified ? "신격화 완성. 이번 회차 신으로서의 존재감을 서사에 드러내십시오." : `미달성 조건: ${deify102.conditions.filter(c=>!c.met).map(c=>c.label).join(", ")}`}` : "";

    // ── 103번: 무한 회귀 자각 — 7회차+, 자각 시 ──
    const aware103 = getLoopAwareness();
    const awarenessSection = (aware103 && aware103.level > 0 && _cycle >= 7) ? `\n[🔄 무한 회귀 자각 — ${aware103.levelData.label}(${aware103.levelData.tone})] ${aware103.levelData.desc}\n${aware103.level >= 3 ? "주의: 캐릭터가 나레이터에게 직접 말을 거는 4th wall 장면을 간헐적으로 허용하십시오. \"당신도 알고 있죠?\"와 같은 발언이 가능합니다." : "캐릭터의 대화와 독백에 자각의 수준에 맞는 메타적 뉘앙스를 담아내십시오."}` : "";

    // ── 104번: 전생 라이벌 성장 — 라이벌 있을 때 ──
    const rivals104 = getRivals();
    const rivalSection = rivals104.length > 0 ? `\n[⚔️ 전생 라이벌] 나 없이도 성장한 라이벌들:\n${rivals104.map(r => `• ${r.name}(${r.class}) — 전력 Lv.${r.power}${r.evolved ? " ★진화형" : ""}, ${r.encounters}회 조우`).join("\n")}\n이들이 등장할 때 반드시 이전보다 강해졌음을 명시하고 주인공을 알아보는 장면을 연출하십시오.` : "";

    // ── 105번: 붉은 실 — 설정된 인연 있을 때 ──
    const redThread105 = getRedThread();
    const redThreadSection = redThread105 ? `\n[🔴 붉은 실 — ${redThread105.npcName}(${redThread105.fate.desc})] "${redThread105.fate.meeting}"\n초기 호감도 ${redThread105.fate.bond}으로 시작. 이 NPC는 어떤 상황에서도 반드시 등장하도록 서사를 이끄십시오.` : "";

    // ── 106번: 전생 건축물 붕괴 — 건축물 있을 때, 중세/무협 우선 ──
    const ruins106 = getRuins();
    const ruinsSection = (ruins106.length > 0 && (isMedieval || isWuxia || _cycle >= 3)) ? `\n[🏚️ 전생 건축물 폐허]\n${ruins106.filter(r=>!r.restored).map(r => `• ${r.icon}${r.originalName}(${r.name}): 복원 퀘스트 — ${r.restoreQuest} → 보상: ${r.reward}`).join("\n")}\n이 폐허들을 세계 곳곳에 배치하고, 복원 서브퀘스트를 자연스럽게 제시하십시오.` : "";

    // ── 107번: 살의 감지 — 레벨 1 이상, 암살 경험 있을 때 ──
    const killSense107 = getKillSenseStatus();
    const killSenseSection = (killSense107 && killSense107.level > 0) ? `\n[🎯 살의 감지 — ${killSense107.levelData.ability}] 총 ${killSense107.assassinDeaths}번 암살 피해 경험\n적대적 NPC의 살의를 먼저 느끼는 순간을 섬세하게 묘사하십시오. 기습 장면에서 감지 여부를 판정하십시오.` : "";

    // ── 108번: 전생 원한꽃 — 원한꽃 있을 때 ──
    const grudgeFlowers108 = getGrudgeFlowers();
    const grudgeFlowerSection = grudgeFlowers108.length > 0 ? `\n[🌹 원한꽃]\n${grudgeFlowers108.map(f => `• ${f.stateData?.icon}${f.enemyName}: ${f.stateData?.label} — ${f.stateData?.effect}`).join("\n")}\n복수 대상 적과 조우 시 원한꽃의 상태에 맞는 효과를 적용하십시오. 저주 상태라면 캐릭터에게 불리하게 작용합니다.` : "";

    // ── 109번: 불운의 회차 — 저주 회차이거나 극복 이력 있을 때 ──
    const cursedCycle109 = getCursedCycleStatus();
    const cursedCycleSection = (cursedCycle109 && (cursedCycle109.isCursed || cursedCycle109.overcame > 0)) ? (cursedCycle109.isCursed ? `\n[💀 불운의 회차] 이번 회차는 저주받은 회차입니다. 주요 판정이 평소보다 더 낮게 나오는 경향이 있습니다. 역경을 극복하는 서사를 구성하십시오. 역이용해 클리어 시 전설 보상.` : `\n[💪 불운 극복자 — ${cursedCycle109.overcame}회 극복] 저주받은 회차를 버텨낸 경험이 있습니다. 이를 자부심의 근거로 서사에 반영하십시오.`) : "";

    // ── 110번: 자석 운명 — 회피 이벤트 있을 때 ──
    const magnet110 = getFateMagnet();
    const magnetSection = (magnet110 && magnet110.strongestPull) ? `\n[🧲 자석 운명 — ${magnet110.strongestPull.type}(인력 ${magnet110.strongestPull.magnetPull}%)] 전생에서 피하려 했던 사건일수록 더 강하게 끌려옵니다.\n"${magnet110.strongestPull.type}" 유형의 이벤트를 이번 회차 피할 수 없는 방식으로 자연스럽게 등장시키십시오.` : "";

    // ── 111번: 기억의 홍수 — 10회차+, 이전 발생 이력 있을 때 ──
    const flood111 = getMemoryFloodStatus();
    const floodSection = (flood111 && flood111.lastResult && _cycle >= 10) ? `\n[🌊 기억의 홍수] 이전 기억의 홍수 결과: ${flood111.lastResult.outcome?.label}\n깊은 명상·혼절·극한 감정 상황에서 기억의 홍수가 다시 발동될 수 있습니다. 정신력에 따라 각성 또는 혼란으로 연출하십시오.` : "";

    // ── 112번: 회전목마 NPC — 1회차+ ──
    const carousel112 = getCarouselNPC();
    const carouselSection = (carousel112 && carousel112.currentRole && _cycle >= 1) ? `\n[🎠 회전목마 NPC${carousel112.npcName ? ` — ${carousel112.npcName}` : ""}] 이번 회차 역할: ${carousel112.currentRole.icon}${carousel112.currentRole.label}\n첫 만남 대사: "${carousel112.currentRole.firstMeet}"\n이 NPC가 이번 회차에서 위 역할로 반드시 등장하도록 서사를 이끄십시오.` : "";

    // ── 113번: 운명의 덫 — 함정 활성화 시만 ──
    const traps113 = getFateTraps();
    const trapSection = (traps113 && traps113.activeTraps && traps113.activeTraps.length > 0) ? `\n[🪤 운명의 덫] 반복 행동 패턴을 노린 함정이 세팅되어 있습니다:\n${traps113.activeTraps.map(t => `• ${t.label}: ${t.trap}`).join("\n")}\n이 함정들을 이번 회차 자연스럽게 배치하되, 플레이어가 눈치채고 회피하면 추가 보상을 주십시오.` : "";

    // ── 114번: 정신 오염 — 10회차+, 오염 레벨 1 이상 ──
    const mental114 = getMentalCorruption();
    const mentalSection = (mental114 && mental114.level > 0 && _cycle >= 10) ? `\n[🌀 정신 오염 — ${mental114.levelData.label}] ${mental114.levelData.symptom}\n페널티: ${mental114.levelData.penalty}\n대화와 전투 장면에서 현재·과거 혼동 증상을 섬세하게 묘사하십시오. 오염이 심하면 치료 이벤트를 제시하십시오.` : "";

    // ── 115번: 전생 영화관 — 관람 이력 있을 때 ──
    const cinema115 = getCinemaStatus();
    const cinemaSection = (cinema115 && cinema115.totalViewed > 0) ? `\n[🎬 전생 영화관 — ${cinema115.totalViewed}편 관람] 특정 장소(${cinema115.scenes.map(s=>s.trigger).slice(0,3).join(", ")} 등)에서 전생 명장면이 환영처럼 재생될 수 있습니다. 해당 장소 방문 시 관련 스킬 숙련도가 상승하는 효과를 연출하십시오.` : "";

    // ── 116번: 쌍둥이 영혼 — 5회차+, 연결 시만 ──
    const twin116 = getTwinSoul();
    const twinSection = (twin116 && twin116.connected && _cycle >= 5) ? `\n[👥 쌍둥이 영혼 — ${twin116.partnerName}] 연결 강도: ${twin116.connectionStrength}%\n공유 스킬: ${twin116.sharedSkills.map(s=>s.skill).join(", ")}\n깊은 집중 또는 위기 상황에서 파트너의 기억과 감각이 전달되는 장면을 간헐적으로 연출하십시오.` : "";

    // ── 117번: 살수 명단 — 복수자 있을 때 ──
    const killList117 = getKillList();
    const killListSection = (killList117 && killList117.avengers && killList117.avengers.length > 0) ? `\n[📜 살수 명단 — 복수자 ${killList117.avengers.length}명 대기 중]\n${killList117.avengers.slice(0,3).map(a => `• ${a.name}의 후손이 복수자로 이번 회차 어딘가 있습니다.`).join("\n")}\n이 복수자들을 이번 회차 자연스럽게 등장시키고, 조우 시 극적인 대결을 연출하십시오.` : "";

    // ── 118번: 기억 경매 — 3회차+, 거래 가능 기억 있을 때 ──
    const auction118 = getMemoryAuction();
    const auctionSection = (auction118 && auction118.available && auction118.available.length > 0 && _cycle >= 3) ? `\n[🔨 기억 경매] 신비한 기억 상인이 전생 기억을 사고 싶어합니다:\n${auction118.available.slice(0,3).map(a => `• ${a.label}: 판매가(${a.sellPrice}) — 대가(${a.cost})`).join("\n")}\n플레이어가 거래를 요청하면 해당 기억을 파는 감정적 장면을 연출하십시오.` : "";

    // ── 119번: 인연 나무 — 잎사귀 5개 이상 ──
    const bondTree119 = getBondTreeStatus();
    const bondTreeSection = (bondTree119 && bondTree119.leaves >= 5) ? `\n[${bondTree119.icon} 인연 나무 — ${bondTree119.stage}(잎 ${bondTree119.leaves}개, 깊은 인연 ${bondTree119.deepBonds}명)] 사회적 판정 보너스: +${bondTree119.socialBonus}\n인연의 깊이와 넓이가 사회적 장면에서 자연스럽게 빛나도록 서사에 녹여내십시오.` : "";

    // ── 120번: 사이버 각인 — 사이버펑크 전용 ──
    const cyber120 = getCyberImprint();
    const cyberSection = (cyber120 && cyber120.imprints && cyber120.imprints.length > 0 && isCyberpunk) ? `\n[🔌 사이버 각인 — ${cyber120.imprints.length}개 임플란트 DNA 각인] 장착 비용 ${cyber120.discount}% 할인\n각인된 임플란트: ${cyber120.imprints.map(i=>`${i.icon}${i.name}(${i.bonus})`).join(", ")}\n이 임플란트들이 이미 신체에 익숙한 것처럼 자연스럽게 발동되도록 묘사하십시오.` : "";

    // ── 121번: 검귀 빙의 — 무협 전용 ──
    const sword121 = getSwordGhost();
    const swordSection = (sword121 && sword121.techniques && sword121.techniques.length > 0 && isWuxia) ? `\n[⚔️ 검귀 빙의 — 각성 Lv.${sword121.awakeLevel}] 습득 절기: ${sword121.techniques.map(t=>t.name).join(", ")}\nHP 20% 이하 등 조건 충족 시 전생의 무공이 자동 발동됩니다. 빙의 장면을 극적으로 연출하십시오.` : "";

    // ── 122번: 왕국 유산 — 중세/판타지 전용 ──
    const kingdom122 = getKingdomLegacy();
    const kingdomSection = (kingdom122 && isMedieval) ? `\n[👑 왕국 유산 — 누적 유산 ${kingdom122.legacy}] 전생에서 세운 왕국들:\n${kingdom122.founded.map(k=>`• ${k.icon}${k.kingdomName}(${k.name}): 후예 — ${k.descendantTitle}, 혜택 — ${k.boon}`).join("\n")}\n후예 NPC들이 선조를 모시는 경건한 태도로 주인공을 대하도록 연출하십시오.` : "";

    // ── 123번: 루프 자각자 길드 — 5회차+, 상태 있을 때 ──
    const guild123 = getLoopersGuild();
    const guildSection = (guild123 && _cycle >= 5) ? `\n[🏛️ 루프 자각자 길드 — 상태: ${guild123.status === "member" ? `정회원(${guild123.rankData?.label})` : guild123.status === "hostile" ? "적대(거절 이력)" : "미접촉"}]${guild123.status === "member" ? `\n공유 지식: ${guild123.knowledgeShared?.join(", ")}` : ""}\n${guild123.status === "unknown" ? "이번 회차 비밀스러운 장소에서 길드 접촉 이벤트를 배치하십시오." : guild123.status === "hostile" ? "길드원들이 적으로 등장할 수 있습니다." : "길드원이 동료로 등장해 메타 정보를 공유합니다."}` : "";

    // ── 124번: 사신과의 거래 — 거래 이력 있을 때 ──
    const dealer124 = getDeathDealerStatus();
    const dealerSection = (dealer124 && dealer124.deals && dealer124.deals.length > 0) ? `\n[💀 사신과의 거래 — 빚 ${dealer124.debt}회, 위험도: ${dealer124.dangerLevel}]\n${dealer124.debtCollected ? "⚠️ 빚 회수 발동! 이번 회차 사신이 빚을 회수하러 옵니다. 극적인 대결을 연출하십시오." : "절체절명의 순간 사신과의 거래 선택지를 제시할 수 있습니다."}` : "";

    // ── 125번: 역할 반전 — 3회차+, 가능한 반전 있을 때 ──
    const reversal125 = getRoleReversal();
    const reversalSection = (reversal125 && reversal125.available && reversal125.available.length > 0 && _cycle >= 3) ? `\n[🔄 역할 반전 가능] 전생에서 처치한 보스의 시점 플레이 가능:\n${reversal125.available.slice(0,2).map(r => `• ${r.bossName} — 성공 시 스킬: ${r.skills.join(", ") || "고유 스킬 전체"}`).join("\n")}\n특별한 꿈이나 환영 장면에서 역할 반전 이벤트를 제안할 수 있습니다.` : "";

    // ── 126번: 별의 의지 — 1회차+ ──
    const worldWill126 = getWorldWill();
    const worldWillSection = (worldWill126 && worldWill126.currentWill && _cycle >= 1) ? `\n[${worldWill126.currentWill.icon} 별의 의지 — ${worldWill126.currentWill.will}] ${worldWill126.currentWill.desc}\n이번 회차 흐름: ${worldWill126.currentWill.flow}\n세계의 의지가 이번 회차 전체 이벤트 방향을 결정합니다. 이에 순응하면 보상, 역행하면 저항이 따릅니다.` : "";

    // ── 127번: 사안(死眼) — 50사망+ 해금 시 ──
    const deathEye127 = getDeathEyeStatus();
    const deathEyeSection = (deathEye127 && deathEye127.unlocked) ? `\n[👁️ 사안(死眼) — ${deathEye127.levelData.label}] ${deathEye127.levelData.ability}\n총 ${deathEye127.totalDeaths}번의 죽음을 경험한 눈입니다.\n전투와 조우 장면에서 사안의 능력을 자연스럽게 활용해 상대의 상태를 묘사하십시오.` : "";

    // ── 128번: 영혼의 주파수 — 주파수 50 이상 ──
    const freq128 = getSoulFrequency();
    const freqSection = (freq128 && freq128.frequency > 50) ? `\n[〰️ 영혼의 주파수 — ${freq128.frequency}%]${freq128.topResonance ? ` 최고 공명: ${freq128.topResonance.npcName}(강도 ${freq128.topResonance.strength}%)` : ""}\n주파수가 높은 NPC와의 대화에서 말 없이도 의도가 전달되는 텔레파시 장면을 간헐적으로 연출하십시오.` : "";

    // ── 129번: 봉인된 신 — 조각 3개 이상, 항상 진행 상황 포함 ──
    const sealedGod129 = getSealedGodStatus();
    const sealedGodSection = (sealedGod129 && sealedGod129.shards >= 3) ? `\n[🌟 봉인된 신 — ${sealedGod129.shards}/${sealedGod129.totalShards} 조각]${sealedGod129.released ? ` ✅ 해방됨 — ${sealedGod129.alignmentDesc || "중립"}` : ` (${sealedGod129.progressPercent}%)`}\n${sealedGod129.released ? "해방된 신의 존재를 서사에서 느낄 수 있도록 섬세하게 표현하십시오." : "고대 유적이나 특별한 장소에서 신의 조각이 발견될 수 있습니다."}` : "";

    // ── 130번: 자연의 섭리 — 5회차+, 변화 있을 때 ──
    const naturalLaw130 = getNaturalLaw();
    const naturalLawSection = (naturalLaw130 && naturalLaw130.mutations && naturalLaw130.mutations.length > 0 && _cycle >= 5) ? `\n[🌌 자연의 섭리 변화 — ${naturalLaw130.mutations.length}단계]\n${naturalLaw130.mutations.slice(-3).map(m => `• ${m.law}: ${m.desc} (${m.effect})`).join("\n")}\n이 법칙 변화들이 세계의 물리적·마법적 현상에 자연스럽게 스며들도록 묘사하십시오.` : "";

  return `${fragSection}${intiSection}${fameSection}${soulWpnSection}${forbiddenSection}${butterflySection}${deathBonusSection}${traumaSection}${lastWordSection}${metaSection}${bloodlineSection}${fateSection}${exploredSection}${relLegacySection}${worldSecretSection}${abilityImprintSection}${grudgeSection}${timeEchoSection}${fateChoiceSection}${divineGazeSection}${curseMasterySection}${prayerSection}${greatCycleSection}${parallelSelfSection}${curseRingSection}${statsSection}${injurySection}${pastThemeSection}${memDistortSection}${ageParadoxSection}${summonLegacySection}${grudgeWeaponSection}${worldTreeSection}${dreamSection}${legacyBuildingSection}${watcherSection}${soulMaskSection}${emotionRippleSection}${testamentSection}${constellationSection}${explorerMapSection}${lightningImprintSection}${dawnSection}${starSignSection}${pastLangSection}${identitySection}${riftSection}${recipeSection}${achSection}${romanceSection}${bestiarySection}${merchantSection}${timeTokenSection}${survivorSection}${undyingSection}${langSection}${bardSection}${mysterySection}${watcherGazeSection}${solLoreSection}${fateCardSection}${hideoutSection}${evilEyeSection}${moonSection}${letterSection}${reelSection}${butterflyIdxSection}${inscriptionSection}${rankSection}${sakuraSection}${dejavuSection}${causalitySection}${debtSection}${trauma80Section}${apoSection}${griefSection}${instinctSection}${cursedRelicSection}${natureSection}${aliasSection}${wishSection}${petSection}${sealedSection}${soulCrystalSection}${echoSection}${dimMapSection}${villainSection}${tearSection}${elemSection}${circusSection}${templeSection}${legWordsSection}${mutationSection}${darkEchoSection}${treeSection}${deifySection}${awarenessSection}${rivalSection}${redThreadSection}${ruinsSection}${killSenseSection}${grudgeFlowerSection}${cursedCycleSection}${magnetSection}${floodSection}${carouselSection}${trapSection}${mentalSection}${cinemaSection}${twinSection}${killListSection}${auctionSection}${bondTreeSection}${cyberSection}${swordSection}${kingdomSection}${guildSection}${dealerSection}${reversalSection}${worldWillSection}${deathEyeSection}${freqSection}${sealedGodSection}${naturalLawSection}`;
  }catch(e){ return ""; }
}
window.getPastLifeLegacySection = getPastLifeLegacySection;

// [19차 감사 FIX — 2차 대형 구출] getSavedStateExpansionSection —
// ai-prompt/077의 죽은 buildSystem 안에 "[v48] 저장 데이터 → BLS 전달
// 전면 확장"이라는 주석으로 카테고리화된(A~K, 18개) 서사 힌트 블록
// 전체가 갇혀 있던 것을 구출한다. 선택 이력/배신 기록/트라우마/원한/
// 라이벌/감정 상태/루프 자각/메타 지식·비밀/종족별 심화 시스템(엘프
// 망각·드워프 원한·오크 명예·다크링 공허·천계 서약·악마 계약·드래곤
// 심장)/NPC 성장·타락·영감·오프스크린 행동/퀘스트 선택·나비효과·
// 죄와 속죄·처치목록·인과관계/세계·세력·왕국·전쟁·경제·종교·결사/
// 성장·스킬·직업숙련·히든직업·혈통·변이/회차·전생 기록/탐험 현황/
// 심리 상태/장비·소지품/예언·언어·별자리·달위상 등 18개 카테고리가
// 전부 완성된 상태로 존재했지만, 유일한 소비처가 죽은 buildSystem
// 하나뿐이라 게임 출시 이래 단 한 번도 AI에게 전달되지 않았다.
// getPastLifeLegacySection과 완전히 동일한 원인·해법이며, 같은
// 파일에 이미 직접 import된 함수만 사용해 새 import 없이 안전하게
// 추출 가능함을 확인했다.
export function getSavedStateExpansionSection(){
  try{
    const char = S.character || {};
    //  [v48] 저장 데이터 → BLS 전달 전면 확장
    //  카테고리: 서사핵심 / 종족시스템 / NPC·관계 / 퀘스트·선택
    //            세계·세력 / 성장·능력 / 회차·전생 / 장소·탐험
    //            감정·심리 / 인벤토리·장비 / 기타
    // ══════════════════════════════════════════════════════════

    // ── [A] 서사 핵심 ─────────────────────────────────────────

    // A1. 선택 이력
    const _choiceHistSection = (() => {
      try {
        const h = loadChoiceHistory();
        if (!h || !h.length) return '';
        const recent = h.slice(-5).map(ch =>
          `• ${ch.desc || ch.id || '선택'}: ${ch.result || ch.effect || ''}`
        ).join('\n');
        return `\n[📋 최근 선택 이력]\n${recent}\nNPC가 이 선택들을 기억하고 대화에서 언급할 수 있다.`;
      } catch(e) { return ''; }
    })();

    // A2. 배신 기록
    const _betrayalSection = (() => {
      try {
        const b = loadBetrayals();
        if (!b || !b.length) return '';
        const lines = b.map(x => `• ${x.target || x.name}: ${x.desc || x.reason || '배신'}`).join('\n');
        return `\n[🗡️ 배신 기록]\n${lines}\n배신당한 NPC는 적대적이거나 냉담하다. 소문이 퍼졌다면 주변 NPC도 경계한다.`;
      } catch(e) { return ''; }
    })();

    // A3. 트라우마
    const _traumaSection = (() => {
      try {
        const t = loadTraumas();
        if (!t) return '';
        const active = Object.entries(t).filter(([,v]) => v && !v.resolved).map(([k,v]) =>
          `• ${v.text || k}${v.trigger ? ` (유발: ${v.trigger})` : ''}`
        ).join('\n');
        if (!active) return '';
        return `\n[💔 활성 트라우마]\n${active}\n이 트라우마 유발 상황에서 플레이어가 본능적으로 반응한다. 묘사에 자연스럽게 반영하라.`;
      } catch(e) { return ''; }
    })();

    // A4. 원한 목록
    const _grudgeSection2 = (() => {
      try {
        const g = loadGrudgeList();
        if (!g || !g.length) return '';
        const lines = g.filter(x => !x.resolved).map(x =>
          `• ${x.target || x.name}: ${x.reason || ''} (강도: ${x.intensity || '보통'})`
        ).join('\n');
        if (!lines) return '';
        return `\n[😤 원한 목록]\n${lines}\n해당 대상과 만날 때 긴장감과 적개심이 자연스럽게 드러난다.`;
      } catch(e) { return ''; }
    })();

    // A5. 라이벌
    const _rivalSection2 = (() => {
      try {
        const r = typeof loadRivals === 'function' ? loadRivals() : null;
        if (!r || !r.length) return '';
        const lines = r.map(x => `• ${x.name}: ${x.rivalry || x.desc || ''}`).join('\n');
        return `\n[⚔️ 라이벌]\n${lines}\n라이벌과 만날 때 경쟁심과 긴장감이 배어난다.`;
      } catch(e) { return ''; }
    })();

    // A6. 감정 상태
    const _emotionSection = (() => {
      try {
        const e = loadEmotion();
        const r = loadEmotionRipples ? loadEmotionRipples() : [];
        if (!e && (!r || !r.length)) return '';
        const lines = [];
        if (e) lines.push(`현재 감정: ${e.label || e.type || JSON.stringify(e).slice(0,60)}`);
        if (r && r.length) {
          const recent = r.slice(-3).map(x => `${x.emotion || x.type}(${x.source || ''})`).join(', ');
          lines.push(`감정 파동: ${recent}`);
        }
        return `\n[💭 감정 상태]\n${lines.join('\n')}\n현재 감정이 대화 톤과 행동 묘사에 반영된다.`;
      } catch(e) { return ''; }
    })();

    // A7. 루프 자각도
    const _loopAwarenessSection = (() => {
      try {
        const la = loadLoopAwareness();
        if (!la || !la.aware) return '';
        return `\n[🔄 루프 자각]\n자각 레벨: ${la.level || 1} / 처음 자각한 시점: ${la.firstAwareAt || '불명'}\n루프를 자각한 만큼 플레이어가 미래를 암시하는 발언을 할 때 NPC가 의아해한다.`;
      } catch(e) { return ''; }
    })();

    // A8. 메타 지식 / 세계 비밀 / 정체성
    const _metaSection2 = (() => {
      try {
        const mk = loadMetaKnowledge ? loadMetaKnowledge() : [];
        const ws = typeof loadWorldSecrets === 'function' ? loadWorldSecrets() : [];
        const sec = typeof loadSecrets === 'function' ? loadSecrets() : [];
        const iv = typeof loadIdentityVault === 'function' ? loadIdentityVault() : null;
        const lines = [];
        if (mk && mk.length) lines.push(`메타 지식: ${mk.slice(-3).map(x => x.desc || x).join(', ')}`);
        if (ws && ws.length) lines.push(`발견한 세계 비밀: ${ws.slice(-3).map(x => x.desc || x.id || x).join(', ')}`);
        if (sec && sec.length) lines.push(`비밀 목록: ${sec.slice(-3).map(x => x.desc || x.text || x).join(', ')}`);
        if (iv && (iv.trueIdentity || iv.hiddenPast)) lines.push(`숨겨진 정체: ${iv.trueIdentity || iv.hiddenPast || ''}`);
        return lines.length ? `\n[🔍 메타 지식·비밀·정체]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [B] 종족별 고유 시스템 ────────────────────────────────

    const _raceSystemSection = (() => {
      try {
        const race = (char.race || '').toLowerCase();
        const lines = [];
        // [4순위] 메인 스토리 진행도를 종족 시스템과 교차시키기 위한 플래그.
        // 천계/마계 개방, 결사 정체 노출, 진짜 적 공개 등은 이미 다른 곳에서
        // 쓰이고 있지만, 종족 전용 시스템(엘프 망각/드워프 원한/오크 명예)은
        // 지금까지 메인 스토리와 완전히 단절되어 있었다.
        const gsF_race = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
        const infernalOpen = !!gsF_race['infernal_gate_open'];
        const celestialOpen = !!gsF_race['celestial_gate_open'];
        const trueEnemyRevealed = !!gsF_race['true_enemy_revealed'];
        const asmodusId = !!gsF_race['asmodus_identified'];
        const demonAlliance = !!gsF_race['demon_lord_alliance'];

        if (/엘프|elf/.test(race)) {
          // [버그 수정] em.memories(존재하지 않는 필드) → 실제 구조(points/stage/memory)로 교정.
          // ef.level(존재하지 않는 필드) → 실제 구조(stack/maxStack)로 교정.
          const em = (typeof loadElfMemory === 'function') ? loadElfMemory() : null;
          const ef = (typeof loadElfForgetting === 'function') ? loadElfForgetting() : null;
          const ee = typeof loadElfEmotion === 'function' ? loadElfEmotion() : null;
          if (em && em.points > 0)
            lines.push(`엘프 선조 기억 ${em.points}점 (단계 ${em.stage||0}, 망각 ${em.forgetCount||0}회)`);
          if (ef && ef.stack > 0)
            lines.push(`엘프 망각 축적: ${ef.stack}/${ef.maxStack||100} — 기억이 흐려지고 있다`);
          if (ee && ee.suppressed > 0)
            lines.push(`억제된 감정: ${ee.suppressed}단계 — 균열 직전`);
          // [4순위] 마계 균열이 열린 세계에서 엘프는 선조의 기억 속 "신계 대전"을
          // 직접 떠올린다 — 망각 스택이 비정상적으로 빨리 쌓이거나, 반대로
          // 오래 묻어둔 기억이 강제로 떠오를 수 있다.
          if (infernalOpen)
            lines.push(`★교차★ 마계 균열이 열린 지금, 엘프는 3천 년 전 신계 대전의 기억과 공명할 수 있다 — 망각하려 해도 자꾸 떠오르거나, 반대로 그 무게를 피해 더 빨리 봉인하려 할 수 있다. 서사에 자연스럽게 반영하라.`);
          if (trueEnemyRevealed)
            lines.push(`★교차★ "최초의 혼돈"의 진실이 드러난 지금, 엘프의 가장 오래된 선조 기억 중 일부가 그 존재와 직결될 수 있다 — 평소보다 깊은 기억 한 조각이 자연스럽게 떠오르는 장면을 만들어도 좋다(강제 아님).`);
        }

        if (/드워프|dwarf/.test(race)) {
          // [버그 수정] dg.grudges(존재하지 않는 필드) → 실제 구조(entries[], status:'open')로 교정.
          const dc = typeof loadDwarfCraft === 'function' ? loadDwarfCraft() : null;
          const dg = typeof loadDwarfGrudge === 'function' ? loadDwarfGrudge() : null;
          const du = typeof loadDwarfUnfinished === 'function' ? loadDwarfUnfinished() : null;
          if (dc && dc.masterpieces) lines.push(`드워프 명작: ${dc.masterpieces}개 완성`);
          const openGrudges = dg ? (dg.entries||[]).filter(e=>e.status==='open') : [];
          if (openGrudges.length)
            lines.push(`미해결 드워프 원한: ${openGrudges.length}개(최근: ${openGrudges[openGrudges.length-1]?.label||''} — ${openGrudges[openGrudges.length-1]?.target||''}) — 반드시 갚아야 한다`);
          if (du && du.works && du.works.filter(w=>w.status==='active').length)
            lines.push(`미완성 일: ${du.works.filter(w=>w.status==='active').length}개 — 죽어도 완성해야 한다`);
          // [4순위] 아스모데우스 결사가 봉인석을 노리고 있다는 사실이 드러나면,
          // 드워프는 "영토 침략"형 원한으로 결사를 인식할 수 있다 — 광산과
          // 터전을 침략당한 것과 같은 무게의 분노 대상으로 자연스럽게 연결.
          if (asmodusId && openGrudges.length)
            lines.push(`★교차★ 아스모데우스 결사의 정체가 드러났다 — 드워프에게 결사는 "영토 침략"형 원한 대상으로 다뤄질 수 있다. 기존 미해결 원한과 같은 무게로 결사를 증오하는 대사를 자연스럽게 섞어도 좋다.`);
        }

        if (/오크|orc/.test(race)) {
          const oh = (typeof loadOrcHonor === 'function') ? loadOrcHonor() : null;
          const ob = typeof loadOrcBloodVow === 'function' ? loadOrcBloodVow() : null;
          if (oh) lines.push(`오크 명예 점수: ${oh.points || 0} (단계: ${oh.stage || 0})`);
          if (ob && ob.vows && ob.vows.filter(v=>!v.fulfilled).length)
            lines.push(`미이행 혈맹: ${ob.vows.filter(v=>!v.fulfilled).length}개`);
          // [4순위] 천계-마계 동맹(6장)이 성사되면, 오크 의회는 "외부 세력의
          // 협정에 종족의 운명을 맡기는 것"을 명예의 문제로 다룰 수 있다 —
          // 의회 내부에서 동맹 찬반 논쟁이 자연스러운 사이드 갈등이 된다.
          if (demonAlliance)
            lines.push(`★교차★ 천계와 마계가 동맹을 맺었다 — 오크 의회 입장에서 이것은 "오크의 명예를 거치지 않은 외부의 협정"이다. 현자들 사이에서 이 동맹을 받아들일지, 독자 노선을 걸을지 논쟁이 일어날 수 있다(강제 아님, 자연스러운 배경 갈등으로 활용).`);
        }

        if (/다크링|darkling/.test(race)) {
          const dv = loadDarklingVoid ? loadDarklingVoid() : null;
          if (dv) lines.push(`다크링 공허 수치: ${dv.void || 0} — ${dv.void > 70 ? '위험: 공허가 넘친다' : '안정'}`);
          if (dv) { const _vsHint = typeof getVoidSenseAIHint==='function' ? getVoidSenseAIHint() : ''; if (_vsHint) lines.push(_vsHint); }
        }

        if (/천족|celestial|세레스티얼/.test(race)) {
          const cc = loadCelestialCovenant ? loadCelestialCovenant() : null;
          if (cc && cc.covenants) lines.push(`천계 서약: ${cc.covenants.length}개 (위반: ${cc.covenants.filter(x=>x.broken).length}개)`);
          if (celestialOpen)
            lines.push(`★교차★ 천계 문이 열렸다 — 세레스티얼 종족에게는 본거지가 다시 열린 사건이다. 서약 이력이 있다면 천계 인사들이 그것을 먼저 언급할 수 있다.`);
        }

        if (/악마|demon/.test(race)) {
          const dc2 = loadDemonContracts ? loadDemonContracts() : null;
          const dt = typeof loadDemonTrueName === 'function' ? loadDemonTrueName() : null;
          if (dc2 && dc2.contracts && dc2.contracts.length)
            lines.push(`체결한 계약: ${dc2.contracts.length}개 (미이행: ${dc2.contracts.filter(x=>!x.fulfilled).length}개)`);
          if (dt) lines.push(`진명 상태: ${dt.intact ? '온전' : '흔들리는 중'}`);
          if (asmodusId)
            lines.push(`★교차★ 아스모데우스 결사의 정체가 드러났다 — 악마족 플레이어는 마계 내부 사정으로 결사를 더 빨리 알아챌 수 있고, 아스모데우스와의 관계(동족/경쟁자)가 서사에 자연스럽게 섞일 수 있다.`);
        }

        if (/드래곤|dragon|용혈/.test(race)) {
          const dh = loadDragonHeart ? loadDragonHeart() : null;
          if (dh) lines.push(`드래곤 심장: 분노 ${dh.rage || 0}% / 각성 ${dh.awakening || 0}%${dh.rage > 70 ? ' ⚠️ 폭주 임박' : ''}`);
        }

        if (/인간|human/.test(race) || (!race)) {
          const hl = typeof loadHumanLegacy === 'function' ? loadHumanLegacy() : null;
          const hs = typeof loadHumanStigma === 'function' ? loadHumanStigma() : null;
          if (hl && hl.legacy > 0) lines.push(`인간 유산 점수: ${hl.legacy}`);
          if (hs && hs.stigmas && hs.stigmas.length)
            lines.push(`사회적 낙인: ${hs.stigmas.map(s=>s.label||s).join(', ')}`);
        }

        return lines.length
          ? `\n[🧬 종족 시스템 현황 — ${char.race}]\n${lines.join('\n')}\n이 수치들을 서사와 NPC 반응에 반영하라. ★교차★ 표시는 메인 스토리 진행과 종족 시스템이 만나는 지점이다 — 강제하지 말고 자연스러운 타이밍에 녹여라.`
          : '';
      } catch(e) { return ''; }
    })();

    // ── [C] NPC·관계 ──────────────────────────────────────────

    const _npcRelSection = (() => {
      try {
        const lines = [];

        // NPC 성장
        const ng = window.loadNpcGrowth ? window.loadNpcGrowth() : {};
        const grown = Object.entries(ng).filter(([,v]) => v && v.level > 0)
          .map(([name,v]) => `${name}(Lv.${v.level})`);
        if (grown.length) lines.push(`성장한 NPC: ${grown.join(', ')}`);

        // NPC 타락
        const nc = typeof loadNpcCorruption === 'function' ? loadNpcCorruption() : {};
        const corrupted = Object.entries(nc).filter(([,v]) => v && v.corrupted)
          .map(([name]) => name);
        if (corrupted.length) lines.push(`타락한 NPC: ${corrupted.join(', ')} — 이들은 이제 다르게 행동한다`);

        // NPC 영감
        const ni = typeof loadNpcInspire === 'function' ? loadNpcInspire() : {};
        const inspired = Object.entries(ni).filter(([,v]) => v && v.inspired)
          .map(([name,v]) => `${name}(${v.theme || '영감'})`);
        if (inspired.length) lines.push(`영감받은 NPC: ${inspired.join(', ')}`);

        // 오프스크린 행동
        const os = typeof loadOffscreenDB === 'function' ? loadOffscreenDB() : {};
        const osLines = Object.entries(os).slice(-3).map(([name,v]) =>
          `${name}: ${v.lastAction || v.action || '활동 중'}`
        );
        if (osLines.length) lines.push(`오프스크린 NPC 행동:\n  ${osLines.join('\n  ')}`);

        return lines.length ? `\n[👥 NPC 상태 상세]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [D] 퀘스트·선택 ───────────────────────────────────────

    const _questChoiceSection = (() => {
      try {
        const lines = [];

        // 퀘스트 선택
        const qc = typeof loadQuestChoices === 'function' ? loadQuestChoices() : {};
        const qcKeys = Object.keys(qc).slice(-5);
        if (qcKeys.length) {
          const qcLines = qcKeys.map(k => `• ${k}: ${qc[k]?.choice || qc[k] || ''}`);
          lines.push(`퀘스트 선택 이력:\n${qcLines.join('\n')}`);
        }

        // 히든 퀘스트
        const hq = typeof loadHiddenQuests === 'function' ? loadHiddenQuests() : {};
        const activeHQ = Object.entries(hq).filter(([,v]) => v === 'active').map(([k]) => k);
        if (activeHQ.length) lines.push(`진행 중 히든 퀘스트: ${activeHQ.join(', ')}`);

        // 나비효과
        const bf = typeof loadButterfly === 'function' ? loadButterfly() : [];
        const majorBF = (Array.isArray(bf) ? bf : bf.effects || [])
          .filter(x => (x.impact||0) >= 2).slice(-4)
          .map(x => `• ${x.desc || x.id}: ${x.worldChange || x.effect || ''}`);
        if (majorBF.length) lines.push(`나비효과:\n${majorBF.join('\n')}`);

        // 죄와 속죄
        const sr = typeof loadSinRedemptions === 'function' ? loadSinRedemptions() : [];
        const unred = sr.filter(x => !x.redeemed);
        if (unred.length) lines.push(`속죄 못한 죄: ${unred.map(x=>x.sin||x.desc||x).join(', ')}`);

        // 처치 목록
        const kl = typeof loadKillList === 'function' ? loadKillList() : [];
        if (kl.length) lines.push(`처치한 주요 인물: ${kl.slice(-5).map(x=>x.name||x).join(', ')}`);

        // 인과 관계
        const ca = typeof loadCausality === 'function' ? loadCausality() : [];
        const activeCa = (Array.isArray(ca) ? ca : []).filter(x=>!x.resolved).slice(-3)
          .map(x=>`• ${x.cause||''} → ${x.effect||''}`);
        if (activeCa.length) lines.push(`진행 중 인과:\n${activeCa.join('\n')}`);

        return lines.length ? `\n[⚖️ 퀘스트·선택·인과]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [E] 세계·세력 ─────────────────────────────────────────

    const _worldStateSection = (() => {
      try {
        const lines = [];

        // 세계 상태
        const ws = typeof loadWorldState === 'function' ? loadWorldState() : {};
        if (ws && Object.keys(ws).length) {
          const wsStr = Object.entries(ws).slice(0,5).map(([k,v])=>`${k}:${v}`).join(', ');
          lines.push(`세계 상태: ${wsStr}`);
        }

        // 세력 시뮬레이션
        const fs = typeof loadFactionSim === 'function' ? loadFactionSim() : {};
        if (fs && fs.relations) {
          const changed = Object.entries(fs.relations)
            .filter(([,v]) => v && Math.abs(v.score||0) > 20)
            .slice(0,4).map(([k,v]) => `${k}: ${v.score > 0 ? '+' : ''}${v.score}`);
          if (changed.length) lines.push(`세력 관계 변화: ${changed.join(', ')}`);
        }

        // 왕국 상태
        const kg = typeof loadKingdom === 'function' ? loadKingdom() : null;
        if (kg && kg.founded && kg.founded.length)
          lines.push(`건국한 왕국: ${kg.founded.map(k=>k.name||k).join(', ')}`);

        // 전쟁
        const wa = typeof loadWarAction === 'function' ? loadWarAction() : null;
        if (wa && wa.active) lines.push(`진행 중 전쟁: ${wa.name || wa.id || '전쟁 중'}`);
        // [BUG FIX] wi.influence는 loadWarInfluence()의 실제 반환 구조
        // ({세력명: 숫자} 맵)에 존재하지 않는 속성이라 이 줄이 항상
        // false였다(죽은 코드). 세력 간 실제 전쟁 상태(getActiveWars)를
        // 대신 보여준다.
        if(typeof getActiveWars==='function'){
          const activeWars = getActiveWars();
          if(activeWars.length){
            lines.push(`세력 전쟁: ${activeWars.map(w=>`${w.a} ↔ ${w.b}`).join(', ')}`);
          }
        }

        // 경제
        const eco = typeof loadEconomy === 'function' ? loadEconomy() : null;
        if (eco && eco.status) lines.push(`경제 상태: ${eco.status}${eco.inflation?` (인플레: ${eco.inflation}%)`:''}` );

        // 종교
        const rel = typeof loadReligionState === 'function' ? loadReligionState() : null;
        if (rel && rel.dominant) lines.push(`지배 종교: ${rel.dominant} (신앙 강도: ${rel.strength||'보통'})`);

        // 결사 상태
        const cab = typeof loadCabalState === 'function' ? loadCabalState() : {};
        if (cab && cab.sealsDestroyed > 0)
          lines.push(`결사 봉인석 파괴: ${cab.sealsDestroyed}개`);

        // 세계 기억
        const wm = typeof loadWorldMemory === 'function' ? loadWorldMemory() : [];
        const sigWM = (Array.isArray(wm) ? wm : []).slice(-3)
          .map(x => x.event || x.desc || x);
        if (sigWM.length) lines.push(`세계가 기억하는 사건: ${sigWM.join(' / ')}`);

        return lines.length ? `\n[🌍 세계·세력 현황]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [F] 성장·능력 ─────────────────────────────────────────

    const _growthSection = (() => {
      try {
        const lines = [];

        // 스킬
        const sk = typeof loadSkills === 'function' ? loadSkills() : {};
        const topSkills = Object.entries(sk)
          .sort(([,a],[,b]) => (b.level||0)-(a.level||0))
          .slice(0,5).map(([name,v]) => `${name}(Lv.${v.level||1})`);
        if (topSkills.length) lines.push(`주요 스킬: ${topSkills.join(', ')}`);

        // 직업 숙련도
        const jm = typeof loadJobMastery === 'function' ? loadJobMastery() : {};
        const masteredJobs = Object.entries(jm).filter(([,v])=>v>=80)
          .map(([k]) => k);
        if (masteredJobs.length) lines.push(`숙련 직업: ${masteredJobs.join(', ')}`);

        // 히든 직업
        const hj = typeof loadHiddenJobs === 'function' ? loadHiddenJobs() : [];
        if (hj && hj.length) lines.push(`해금 히든 직업: ${hj.map(x=>x.name||x).join(', ')}`);

        // 혈통
        const bl = typeof loadBloodline === 'function' ? loadBloodline() : {};
        if (bl && bl.active && bl.name) lines.push(`활성 혈통: ${bl.name} — ${bl.desc||''}`);

        // 변이
        const mut = typeof loadMutation === 'function' ? loadMutation() : [];
        if (mut && mut.length) lines.push(`변이: ${(Array.isArray(mut)?mut:[]).map(x=>x.name||x).join(', ')}`);

        // 영구 보너스
        const pb = typeof loadPermStatBonus === 'function' ? loadPermStatBonus() : {};
        const pbStr = Object.entries(pb).filter(([,v])=>v>0).map(([k,v])=>`${k}+${v}`).join(', ');
        if (pbStr) lines.push(`영구 스탯 보너스: ${pbStr}`);

        return lines.length ? `\n[⬆️ 성장·능력]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [G] 회차·전생 ─────────────────────────────────────────

    const _cycleSection2 = (() => {
      try {
        const lines = [];

        // 루프 기록
        const lr = typeof loadLoopRecords === 'function' ? loadLoopRecords() : [];
        if (lr && lr.length) {
          const last = lr[lr.length-1];
          lines.push(`이전 회차(${lr.length}회차): ${last.summary || last.ending || '기록 있음'}`);
        }

        // 전생 정보
        const pl = typeof loadPastLife === 'function' ? loadPastLife() : null;
        if (pl) {
          if (pl.role) lines.push(`전생 직업: ${pl.role}`);
          if (pl.legacy) lines.push(`전생 유산: ${pl.legacy}`);
        }

        // 전생 테마
        const pt = typeof loadPastTheme === 'function' ? loadPastTheme() : null;
        if (pt && pt.theme) lines.push(`전생 핵심 테마: ${pt.theme}`);

        // 전생 편지
        const plet = typeof loadPastLetters === 'function' ? loadPastLetters() : [];
        if (plet && plet.length)
          lines.push(`전생의 편지 ${plet.length}통 — 이전 자신이 남긴 메시지`);

        // 관계 유산
        const rl = typeof loadRelLegacy === 'function' ? loadRelLegacy() : {};
        const legNpcs = Object.keys(rl).filter(k=>rl[k]>0).slice(0,3);
        if (legNpcs.length) lines.push(`관계 유산(전생 인연): ${legNpcs.join(', ')}`);

        // 회차 목표
        const cg = typeof loadCycleGoal === 'function' ? loadCycleGoal() : null;
        if (cg && cg.goal) lines.push(`이번 회차 목표: ${cg.goal}`);

        return lines.length ? `\n[🔁 회차·전생 기록]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [H] 장소·탐험 ─────────────────────────────────────────

    const _explorationSection = (() => {
      try {
        const lines = [];

        // 탐험 기록
        const ex = typeof loadExploration === 'function' ? loadExploration() : {};
        if (ex && ex.count) lines.push(`탐험 횟수: ${ex.count}`);

        // 은신처
        const ho = typeof loadHideout === 'function' ? loadHideout() : null;
        if (ho && ho.name) lines.push(`은신처: ${ho.name} (${ho.level||'기본'}단계)`);

        // 발견한 폐허
        const ru = typeof loadRuins === 'function' ? loadRuins() : [];
        const activeRuins = (Array.isArray(ru)?ru:[]).filter(x=>!x.cleared).slice(0,3)
          .map(x=>x.name||x.id||'폐허');
        if (activeRuins.length) lines.push(`미탐사 폐허: ${activeRuins.join(', ')}`);

        // 던전 상태
        const ds = typeof loadDungeonState === 'function' ? loadDungeonState() : null;
        if (ds && ds.active) lines.push(`진행 중 던전: ${ds.name || ds.id} (${ds.floor||1}층)`);

        return lines.length ? `\n[🗺️ 탐험 현황]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [I] 감정·심리 ─────────────────────────────────────────

    const _psycheSection = (() => {
      try {
        const lines = [];

        // 슬픔
        const gr = typeof loadGrief === 'function' ? loadGrief() : null;
        if (gr && gr.lostOnes && gr.lostOnes.length)
          lines.push(`잃은 존재들: ${gr.lostOnes.map(x=>x.name||x).join(', ')} (총 상실: ${gr.total||0})`);

        // 정신 오염
        const mc = typeof loadMentalCorruption === 'function' ? loadMentalCorruption() : null;
        if (mc && mc.level > 0)
          lines.push(`정신 오염: ${mc.level}단계${mc.symptoms&&mc.symptoms.length?` — ${mc.symptoms.join(', ')}`:''}`);

        // 유년기 트라우마
        const ct = typeof loadChildhoodTrauma === 'function' ? loadChildhoodTrauma() : null;
        if (ct && ct.traumas && ct.traumas.length)
          lines.push(`유년기 트라우마: ${ct.traumas.map(x=>x.desc||x).join(', ')}`);

        // 데자뷰
        const dj = typeof loadDejavu === 'function' ? loadDejavu() : null;
        if (dj && dj.count > 3) lines.push(`강한 기시감 누적: ${dj.count}회 — 루프의 흔적이 쌓이고 있다`);

        // 영혼 가면
        const sm = typeof loadSoulMasks === 'function' ? loadSoulMasks() : [];
        const activeMask = (Array.isArray(sm)?sm:[]).find(x=>x.active);
        if (activeMask) lines.push(`현재 페르소나: ${activeMask.name||activeMask.mask||'가면 착용 중'}`);

        return lines.length ? `\n[🧠 심리 상태]\n${lines.join('\n')}\n이 심리 상태가 대화·행동·선택에 자연스럽게 배어나오게 하라.` : '';
      } catch(e) { return ''; }
    })();

    // ── [J] 인벤토리·장비 ────────────────────────────────────

    const _inventorySection = (() => {
      try {
        const lines = [];

        // 골드
        const gold = typeof loadGold === 'function' ? loadGold() : 0;
        if (gold > 0) lines.push(`보유 골드: ${gold.toLocaleString()}`);

        // 장착 아이템
        const eq = typeof loadEquipped === 'function' ? loadEquipped() : {};
        const eqItems = Object.values(eq).filter(x=>x && x.name).map(x=>x.name);
        if (eqItems.length) lines.push(`장착 중: ${eqItems.join(', ')}`);

        // 영혼 무기
        const sw = typeof loadSoulWeapon === 'function' ? loadSoulWeapon() : null;
        if (sw && sw.name) lines.push(`영혼 무기: ${sw.name} (${sw.level||1}단계, ${sw.personality||''})`);

        // 주요 소지품 (상위 5개)
        const inv = typeof loadInventory === 'function' ? loadInventory() : [];
        const keyItems = (Array.isArray(inv)?inv:[])
          .filter(x => x.rarity === 'primal' || x.rarity === 'epic' || x.rarity === 'legendary' || x.key)
          .slice(0,5).map(x=>x.name);
        if (keyItems.length) lines.push(`주요 아이템: ${keyItems.join(', ')}`);

        return lines.length ? `\n[🎒 장비·소지품]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [K] 기타 (예언·달력·언어·별자리) ─────────────────────

    const _miscSection = (() => {
      try {
        const lines = [];

        // 예언
        const pr = typeof loadProphecies === 'function' ? loadProphecies() : [];
        const activePr = (Array.isArray(pr)?pr:[]).filter(x=>!x.fulfilled).slice(0,3)
          .map(x=>x.content||x.desc||x.text||x);
        if (activePr.length) lines.push(`미완성 예언: ${activePr.join(' / ')}`);

        // 꿈 예언
        const dp = typeof loadDreamProphecies === 'function' ? loadDreamProphecies() : [];
        if (dp && dp.length) lines.push(`최근 꿈 예언: ${dp[dp.length-1]?.content||dp[dp.length-1]||''}`);

        // 언어
        const lang = typeof loadLanguages === 'function' ? loadLanguages() : {};
        const knownLangs = Object.keys(lang).filter(k=>lang[k]>=50);
        if (knownLangs.length) lines.push(`구사 가능 언어: ${knownLangs.join(', ')}`);

        // 별자리
        const cons = typeof loadConstellation === 'function' ? loadConstellation() : null;
        if (cons && cons.sign) lines.push(`운명 별자리: ${cons.sign} (${cons.effect||''})`);

        // 달 위상
        const moon = typeof loadMoonPhase === 'function' ? loadMoonPhase() : null;
        if (moon && moon.phase) lines.push(`달 위상: ${moon.phase} — ${moon.effect||''}`);

        // 요약
        const sum = typeof loadSummaries === 'function' ? loadSummaries() : [];
        if (sum && sum.length) {
          const last = sum[sum.length-1];
          lines.push(`이전 내용 요약: ${(last.summary||last.content||'').slice(0,100)}`);
        }

        // 나머지 5개 추가
        const ar = typeof loadArtifactShards === 'function' ? loadArtifactShards() : [];
        if (ar && ar.length) lines.push(`유물 파편: ${ar.map(x=>x.name||x).join(', ')}`);

        const cr = typeof loadClearRewards === 'function' ? loadClearRewards() : [];
        if (cr && cr.length) lines.push(`클리어 보상 획득: ${cr.length}개`);

        const js = typeof loadJobSynergy === 'function' ? loadJobSynergy() : [];
        if (js && js.length) lines.push(`직업 시너지: ${js.map(x=>x.name||x).join(', ')}`);

        const prel = typeof loadPastRelics === 'function' ? loadPastRelics() : [];
        if (prel && prel.length) lines.push(`전생 유물: ${prel.map(x=>x.name||x).join(', ')}`);

        const rc = typeof loadRace === 'function' ? loadRace() : null;
        if (rc && rc !== char.race) lines.push(`변환된 종족: ${rc}`);

        return lines.length ? `\n[📌 기타 정보]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

  return `${_choiceHistSection}${_betrayalSection}${_traumaSection}${_grudgeSection2}${_rivalSection2}${_emotionSection}${_loopAwarenessSection}${_metaSection2}${_raceSystemSection}${_npcRelSection}${_questChoiceSection}${_worldStateSection}${_growthSection}${_cycleSection2}${_explorationSection}${_psycheSection}${_inventorySection}${_miscSection}`;
  }catch(e){ return ""; }
}
window.getSavedStateExpansionSection = getSavedStateExpansionSection;

// [19차 감사 FIX — 4번째 구출] getMiscOrphanSection — 죽은 buildSystem
// 안에 흩어져 있던 나머지 3개의 독립 orphaned 섹션(봉인석 정보/직업
// 조합 시너지/성장형 악당 위협)을 모아 구출한다. SEAL_DEFINITIONS·
// checkJobSynergy·getVillainStatus는 앞선 두 차례의 대형 구출
// (getPastLifeLegacySection/getSavedStateExpansionSection) 이후에도
// 코드베이스 전체에서 여전히 이 죽은 함수 안에서만 호출되는 마지막
// 3개였다. 각각 완전히 독립적이라 하나의 작은 함수로 묶었다.
export function getMiscOrphanSection(){
  try{
    const char = S.character || {};

    // ── 봉인석 정보 섹션 (3장 이후) ─────────────────────────
    const _sealStoneSection = (() => {
      const gsF2 = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      if(!gsF2['mq2_done']) return '';
      const contId2 = char.startContinent || 'central';
      if(typeof SEAL_DEFINITIONS === 'undefined') return '';
      const restoreState = typeof loadSealRestore === 'function' ? loadSealRestore() : {};
      const seals = Object.entries(SEAL_DEFINITIONS).filter(([,s]) => s.continent === contId2);
      if(!seals.length) return '';
      return seals.map(([name, seal]) => {
        const isRestored = !!restoreState[name]?.restored;
        const curState = isRestored ? '복원 완료' : (seal.desc || '봉인 유지 중');
        return `\n[💎 이 대륙의 봉인석 — ${name}]\n위치: ${seal.location}\n현재 상태: ${curState}\n수호자: ${seal.restoreNpc||'미상'}\n단서: ${seal.narrative?.hook || seal.desc || ''}\n파괴/복원 시 세계 영향: ${seal.worldEffect||''}\nAI 지침: ${seal.narrative?.hook || seal.desc || ''}`;
      }).join('\n');
    })();

    // ── 직업 조합 시너지 ──
    const prevJobs = char.pastLifeRole ? [char.pastLifeRole] : [];
    const synergies = checkJobSynergy(char.role, prevJobs, char.race||"");
    const synergySysSection = synergies.length > 0 ? `\n[⚡ 직업 조합 시너지 — ${synergies.map(s=>`${s.icon}${s.name}`).join("/")}] ${synergies.map(s=>s.aiHint).join(" / ")}` : "";

    // ── 성장형 악당 위협 ──
    const _villain = getVillainStatus();
    const villainSysSection = _villain && _villain.threat !== "low" && _villain.name ? `\n[${_villain.threatDef?.icon||"⚠️"} 악당 위협 — ${_villain.threatDef?.label}] ${_villain.name}의 세력이 세계를 잠식 중입니다(${_villain.power}%). ${_villain.threatDef?.desc} 서사에서 악당의 영향력이 주변 세계에 반영되게 하십시오.` : "";

    return `${_sealStoneSection}${synergySysSection}${villainSysSection}`;
  }catch(e){ return ""; }
}
window.getMiscOrphanSection = getMiscOrphanSection;


export function buildSystem(char, currentTitles, memory, npcs, currentSummons, currentMonsters) {
    // ════════════════════════════════════════════════════
    // 필터링 컨텍스트 — 종족·직업·시나리오·회차 기반
    // ════════════════════════════════════════════════════
    const _cycle   = loadCycleCount();
    const _race    = (char?.race  || "").toLowerCase();
    const _role    = (char?.role  || "");
    const _era     = (char?.scenario || "");

    // 시나리오 그룹 판별
    const isMedieval     = _era.includes("중세") || _era.includes("판타지") || _era.includes("medieval");
    const isWuxia        = _era.includes("무협") || _era.includes("강호")   || _era.includes("wuxia");
    const isCyberpunk    = _era.includes("사이버") || _era.includes("cyber");
    const isApocalypse   = _era.includes("아포칼") || _era.includes("apocalypse") || _era.includes("황무지") || _era.includes("붕괴");
    const isMythology    = _era.includes("신화") || _era.includes("mythology") || _era.includes("올림포스");
    const isSteampunk    = _era.includes("스팀") || _era.includes("steampunk") || _era.includes("증기");
    const isCustom       = _era.includes("나만의") || _era.includes("custom");
    const isAnyEra       = true; // 모든 세계관 공통

    // 종족 그룹 판별
    const isElf        = _race.includes("엘프") || _race.includes("elf");
    const isDwarf      = _race.includes("드워프") || _race.includes("dwarf");
    const isOrc        = _race.includes("오크") || _race.includes("orc");
    const isDarkling   = _race.includes("다크링") || _race.includes("darkling");
    const isCelestial  = _race.includes("천족") || _race.includes("celestial") || _race.includes("세레스티얼");
    const isDragon     = _race.includes("드래곤") || _race.includes("dragon") || _race.includes("용혈");
    const isDemon      = _race.includes("악마") || _race.includes("demon");
    const isUndead     = _race.includes("언데드") || _race.includes("undead");
    const isBeastman   = _race.includes("수인") || _race.includes("beast");
    const isElemental  = _race.includes("원소") || _race.includes("elemental");
    const isHuman      = _race.includes("인간") || _race.includes("human") || (!isElf && !isDwarf && !isOrc && !isDarkling && !isCelestial && !isDragon && !isDemon && !isUndead && !isBeastman && !isElemental);
    const isFantasyRace= isElf || isDwarf || isOrc || isDarkling || isCelestial || isDragon || isDemon || isUndead || isBeastman || isElemental;
    const hasMagicRace = isElf || isCelestial || isDragon || isDemon || isElemental;

    // 직업 그룹 판별
    const isMagicRole  = /마법|마녀|마법사|소서|주술|마도/.test(_role);
    const isWarriorRole= /전사|기사|검사|무사|파이터/.test(_role);
    const isRogueRole  = /도적|암살|자객|도둑|레인저/.test(_role);
    const isLeaderRole = /왕|군주|장군|영주|리더|지도자/.test(_role);
    const isHealerRole = /성직|치료|사제|수도|힐러|신관/.test(_role);
    const isBardRole   = /음유|시인|바드|광대/.test(_role);
    const isSupportRole= isHealerRole || isBardRole;

    // 회차 단계 판별
    const isEarlyCycle  = _cycle >= 1  && _cycle <= 3;   // 초반
    const isMidCycle    = _cycle >= 4  && _cycle <= 9;   // 중반
    const isLateCycle   = _cycle >= 10 && _cycle <= 19;  // 후반
    const isHighCycle   = _cycle >= 20 && _cycle <= 49;  // 고회차
    const isVeryHigh    = _cycle >= 50;                   // 초고회차
    const isCenturyCycle= _cycle >= 100;                  // 100회차+

    // 섹션 포함 여부 결정 헬퍼 (조건 미충족 시 빈 문자열 반환)
    const when = (condition, sectionFn) => condition ? sectionFn() : "";

    // [신규] 영구 보존 사실 — core/mid는 글자수 제한(slice)으로 압축되며
    // 오래된 구간이 통째로 잘릴 수 있지만, NPC 생사·세계 영구 변화 같은
    // 절대 잊으면 안 되는 사실은 mem.facts에 개수 기반으로 별도 보존되어
    // 여기서 항상 전부 주입된다.
    const factsSection = (() => {
      if(!Array.isArray(memory?.facts) || !memory.facts.length) return "";
      const labels = { npc_death:'NPC 생사/이탈', world_change:'세계 영구 변화', identity_reveal:'정체/비밀 발각', irreversible_choice:'되돌릴 수 없는 선택', relationship_turn:'관계 전환점', unresolved_hook:'미해결 떡밥/약속' };
      const byCategory = {};
      memory.facts.forEach(f => { (byCategory[f.category] ||= []).push(f.text); });
      const lines = Object.entries(byCategory).map(([cat, texts]) => `  • ${labels[cat]||cat}: ${texts.join(' / ')}`);
      return `\n[📌 절대 잊으면 안 되는 사실 — 모순 없이 반영할 것]\n${lines.join('\n')}`;
    })();

    const memSection = (memory?.core ? `\n[🔴 핵심 기억]\n${memory.core}` : "") + (memory?.mid ? `\n[🟡 최근 흐름]\n${memory.mid}` : "") + (memory?.pastLifeSummary ? `\n[✨ 전생의 흔적]\n${memory.pastLifeSummary}` : "") + factsSection;
    const majorList = (npcs || []).filter(n => n.type === "major").map(n => `  • ${n.name}(${n.role}) - ${n.personality}`).join("\n");
    const minorList = (npcs || []).filter(n => n.type === "minor" && n.active).map(n => `  · ${n.name}(${n.role})`).join("\n");
    const npcSection = (majorList || minorList) ? `\n[👥 등장 인물]\n${majorList}${minorList ? `\n${minorList}` : ""}` : "";

    // ══════════════════════════════════════════════════════
    //  ✦ 아에테른 달력 — 세계 내 시간 체계
    // ══════════════════════════════════════════════════════
    const _aeternCalendar = (() => {
      // timeCost 기반 달력 계산 (행동 유형별 시간 소모 반영)
      const totalCost = typeof loadTimeCost==='function' ? loadTimeCost() : (S.msgCount||0)*0.5;
      const cal = typeof timeCostToCalendar==='function'
        ? timeCostToCalendar(totalCost)
        : { month:{name:'싹트기월',icon:'🌱',season:'봄',effect:'만물이 소생.'}, dayOfMonth:1, year:3782 };
      // 세계수 상태 연동
      const gsFlags = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      const sealCracked = gsFlags['mq4_done'] || gsFlags['world_saved'];
      const anomaly = sealCracked ? ' ⚠️ (봉인 균열로 계절 이상)' : '';
      return { year:cal.year, month:cal.month, dayOfMonth:cal.dayOfMonth, anomaly };
    })();
    const calendarSection = `\n[📅 아에테른력] ${_aeternCalendar.year}년 ${_aeternCalendar.month.icon} ${_aeternCalendar.month.name} ${_aeternCalendar.dayOfMonth}일 (${_aeternCalendar.month.season})${_aeternCalendar.anomaly}\n계절 효과: ${_aeternCalendar.month.effect}\nNPC와 상인들의 대화에 이 시기를 자연스럽게 녹여라. 계절 인사나 날씨 한 마디가 세계를 살아있게 만든다.`;

    // ══════════════════════════════════════════════════════
    //  ✦ 술집/광장 랜덤 소문 시스템
    //  — 세계 상황, 회차, 대륙에 따라 달라지는 생동감 있는 소문
    // ══════════════════════════════════════════════════════
    const _tavernRumors = (() => {
      const cycle  = _cycle || 0;
      const sid2   = char.scenario || 'medieval';
      const contId = char.startContinent || 'central';
      const gsF    = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      const fired  = loadWorldEvents ? loadWorldEvents() : {};

      // 기본 소문 풀
      const baseRumors = [
        '요즘 북쪽에서 이상한 소리가 들린다는 나그네들이 많아졌어.',
        '셀리나 폐허에서 불빛이 보였다는 사람이 있대. 150년 만에 처음이라던데.',
        '왕성 지하에 뭔가 봉인된 게 있다는 소문은 어릴 때부터 들었는데, 요즘 더 자주 나오네.',
        '기사단 원로들이 밤마다 비밀 집회를 한다더군. 젊은 기사들은 아무것도 모른대.',
        '"세계수의 축복을"이라고 인사하면서 정작 성당에 발 한 번 안 디디는 자들이 늘었어.',
        '아르카나 탑에서 연기가 새벽마다 피어오른다더군. 아르카누스 대마법사가 뭘 연구하는 걸까.',
        '도적 길드에서 이상한 정보를 팔더군. 이미 죽은 자들의 행방을 안다나.',
        '순환의 기억자들이 또 이단 심문소에 잡혔다는구먼. 불쌍한 미치광이들.',
        '황금시대 때는 달랐다고 노인들은 말하지. 세계수가 살아있을 때는 봄이 더 따뜻했다고.',
        '예로부터 세상에는 이야기를 먹고 사는 존재가 있다지 — 술집 구석의 노인이 중얼거렸다.',
      ];

      // 세계 사건 연동 소문
      const eventRumors = [];
      if(fired['we_seal_crack'])  eventRumors.push('왕성 지하에서 빛이 났다더군. 기사단이 쉬쉬하는데 아무래도 수상해.');
      if(fired['we_frost_giant']) eventRumors.push('북쪽 아이스크라운에서 얼음 거인들이 몰려온다는 소식이야. 거기 가족 있는 사람들 표정이 말이 아니야.');
      if(fired['we_dragon_mad'])  eventRumors.push('동쪽에서 고룡이 미쳐 날뛰었다는 소문이야. 용염 제국이 쉬쉬하지만 상인들 사이엔 다 퍼졌지.');
      if(fired['we_steam_berserk'])eventRumors.push('서쪽 항구에서 증기 기관이 폭발했다는 소식. 기계가 스스로 움직인다는 소문까지 있어.');
      if(fired['we_sun_dim'])     eventRumors.push('남쪽에서는 태양이 흐려진다더군. 신관들이 의식을 올리고 있다는데 효과가 없다나.');
      if(fired['we_worldtree_ill'])eventRumors.push('북동쪽 엘프 대륙의 세계수가 시든다는 소문이 있어. 엘프들이 술도 안 마시고 숲에 박혀있대.');
      if(fired['we_abyss_stir'])  eventRumors.push('남쪽 바다에서 배가 사라지는 일이 잦아졌어. 그 해구 이야기 알지? 괜히 그 방향 가지 마.');
      if(fired['we_machine_wake'])eventRumors.push('지하 드워프 왕국에서 이상한 소리가 들린다나. 기계들이 혼자 움직인다는 건데 드워프들이 입 꽉 다물고 있어.');
      if(fired['we_gate_tremble'])eventRumors.push('하늘에서 황금빛과 붉은 빛이 동시에 번쩍였다는 목격담이 여럿 들어왔어. 천계와 마계가 싸우는 거 아닐까?');

      // 회차 연동 소문
      const cycleRumors = [];
      if(cycle >= 2) cycleRumors.push('"에테르 나시온"이라고 속삭이는 자들이 있대. 무슨 뜻인지 아는 사람?');
      if(cycle >= 3) cycleRumors.push('전생의 기억을 가진다고 주장하는 자가 또 이단 심문소에 끌려갔다더군. 미쳤거나, 아니거나.');
      if(cycle >= 5) cycleRumors.push('루프가 반복된다는 걸 아는 자들이 모이는 지하 집회소가 있대. 순환의 기억자들 이야기.');
      if(cycle >= 7) cycleRumors.push('어떤 방랑자가 마을마다 나타나 "곧 세계가 선택의 기로에 선다"고 외치다 사라진다더군. 예언자인지 미치광이인지.');

      // 대륙별 소문
      const contRumors = {
        central:   ['왕의 건강이 나빠지고 있다더군. 후계자 문제가 표면에 떠오르기 시작한 거야.', '기사단 지하에 220년 된 봉인 문서가 있다는 소문이 돌아.'],
        north:     ['극야가 예년보다 길어졌대. 룬 마법사들이 원인을 찾고 있다는데.', '빙하 아래에서 뭔가 깨어나는 소리가 들린다는 이야기가 북쪽에서 내려왔어.'],
        east:      ['고룡 이그나르 2세가 꿈 속에서 무언가를 본 것 같다더군. 제국 전체가 긴장하고 있어.', '드래곤 라이더 선발전 준비가 시작됐대. 이번엔 특별히 기준이 까다롭다나.'],
        west:      ['서쪽 상인 공화국에서 증기 기관으로 돈을 벌겠다는 자들이 늘고 있어. 마법사들이 반발하더군.', '해군 함대가 동쪽으로 향했다는 목격담이 있어. 식민지 전쟁이 시작되려나.'],
        south:     ['태양 신전에서 고위 신관들이 밀실 회의를 했다더군. 태양이 흐려지는 게 정말 예언 때문이래.', '남쪽 사막에서 나타났다 사라지는 오아시스 이야기. 신기루라기엔 너무 구체적이야.'],
        northeast: ['세계수에서 이상한 진동이 느껴진다는 엘프들의 이야기가 들려왔어.', '엘프와 인간 사이 충돌이 북동쪽에서 또 일어났다더군.'],
        southeast: ['해적왕 발타자르가 해구 근처에 배를 보냈다는 소문이야. 뭘 찾는 거지?', '남쪽 바다에서 돌아온 선원이 이상한 소리를 들었다고 해. 해구 아래에서.'],
        northwest: ['드워프 땅굴에서 고대 기계가 작동을 시작했다더군. 철혈 장인 조합이 극비로 처리하고 있대.', '지하 왕국에서 도망친 드워프가 있대. 뭔가 끔찍한 걸 봤다고 했다더군.'],
        celestial: ['천계에서 빛이 새어나왔다는 소문이야. 신앙이 깊은 자들은 꿈에서 천사를 봤다고.', '대천사장이 직접 속세에 내려왔다는 목격담이 있어. 수백 년 만에 처음이래.'],
        infernal:  ['마계의 균열이 커지고 있대. 악마를 본 자가 늘어나고 있어.', '마왕이 뭔가를 기다리고 있다는 소문이 심연 신앙 신자들 사이에 돌아.'],
      };
      const localRumors = contRumors[contId] || contRumors.central;

      // 전체 풀에서 3개 선택 (턴 기반 의사 랜덤)
      const allPool = [...baseRumors, ...eventRumors, ...cycleRumors, ...localRumors];
      const seed = (S.msgCount || 0) + cycle;
      const pick = (arr, n) => {
        const picked = [];
        for(let i=0;i<n&&i<arr.length;i++){
          picked.push(arr[(seed*7+i*13+i) % arr.length]);
        }
        return [...new Set(picked)].slice(0,n);
      };
      return pick(allPool, 3);
    })();
    const rumorSection = _tavernRumors.length
      ? `\n[🍺 술집/광장의 소문] 이번 장면 어딘가에 다음 소문 중 하나를 NPC가 자연스럽게 언급하게 하라 (억지로 넣지 말고, 분위기에 맞을 때):\n${_tavernRumors.map((r,i)=>`  ${['①','②','③'][i]} "${r}"`).join('\n')}` : '';

    // ══════════════════════════════════════════════════════
    //  ✦ NPC 간 상호 언급 — 세계가 연결돼 있다는 느낌
    // ══════════════════════════════════════════════════════
    const _worldNpcStatus = (() => {
      const gsF   = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      const fired = loadWorldEvents ? loadWorldEvents() : {};
      const curNpcs = (S.npcs||[]).filter(n=>n.active!==false).map(n=>n.name);

      // 주요 인물 동향 풀 (세계 사건·플래그 연동)
      const pool = [];

      // 아르카누스 동향
      if(fired['we_seal_crack'])
        pool.push({ who:'아르카누스', status:'탑에서 나오질 않는다', hint:'아르카누스가 무언가를 은폐하고 있다', dialogue:'아르카누스 대마법사요? 요즘 탑에서 아예 나오질 않더군요. 제자들도 면회가 거절당했다나.', trigger:'아르카나 탑 근처이거나 마법 관련 대화가 나올 때' });
      else
        pool.push({ who:'아르카누스', status:'도서관 접근 통제 중', hint:'뭔가를 숨기고 있다', dialogue:'아르카나 탑 이야기요? 요즘 대마법사께서 도서관 접근을 막고 계세요. 뭘 연구하시는지...', trigger:'마법이나 탑 관련 대화가 나올 때' });

      // 레오나르드 동향
      if(fired['we_noble_crisis'])
        pool.push({ who:'레오나르드', status:'긴급 집회 소집', hint:'기사단 내부가 흔들리고 있다', dialogue:'레오나르드 단장이 어젯밤 긴급 집회를 소집했대요. 뭔가 심각한 일이 있는 게 분명해요.', trigger:'기사단이나 왕국 관련 대화가 나올 때' });
      else
        pool.push({ who:'레오나르드', status:'왕성 지하를 자주 드나든다', hint:'뭔가를 지키거나 숨기고 있다', dialogue:'레오나르드 단장이 요즘 지하 구역을 자주 드나들더군요. 기사들도 영문을 모른다더군요.', trigger:'기사단원이나 왕성 관련 NPC와 대화할 때' });

      // 퀘스트 플래그 연동 인물
      if(gsF['mq3_done'])
        pool.push({ who:'아스모데우스', status:'각 대륙에서 결사 흔적 발견', hint:'적이 먼저 움직이고 있다', dialogue:'이상한 계약 인장이 발견됐다더군요. 검은 뱀이 꼬리를 무는 문양... 어디서 본 기억이 있는데.', trigger:'조사나 탐문 행동, 세력 관련 대화가 나올 때' });

      if(gsF['selina_truth_known'])
        pool.push({ who:'노파 에렌', status:'셀리나 폐허의 진실을 알고 있다', hint:'150년의 비밀이 드러나기 시작했다', dialogue:'그 노파 에렌 이야기 들었어요? 150년 전 생존자래요. 아직 그날의 진실을 기억한다고...', trigger:'셀리나 폐허 근처이거나 역사에 관한 대화가 나올 때' });

      if(gsF['knight_secret_known'])
        pool.push({ who:'기사단 젊은 기사들', status:'진실을 알고 내부 갈등 중', hint:'기사단이 분열되려 하고 있다', dialogue:'요즘 기사단에 묘한 분위기가 돌아요. 젊은 기사들이 뭔가를 알게 된 것 같은데, 원로들이 입막음 중이래요.', trigger:'기사단 관련 NPC나 기사단 시설 근처에서' });

      if(gsF['celestial_gate_open'])
        pool.push({ who:'미카엘', status:'속세에서 무언가를 찾고 있다', hint:'천계가 개입하려 한다', dialogue:'누군가 천사를 봤다더군요. 수백 년 만에 처음이래요. 대천사장이 직접 내려온 거라면...', trigger:'신앙이나 천계 관련 대화가 나올 때' });

      if(gsF['infernal_gate_open'])
        pool.push({ who:'베엘제부브', status:'마계 군단을 집결시키고 있다', hint:'마계가 움직이기 시작했다', dialogue:'남쪽에서 이상한 기운이 느껴진다더군요. 악마를 봤다는 사람도 나왔고...', trigger:'마계나 타락 관련 대화, 어두운 장소에서' });

      // 현재 등장 NPC와 연결된 동향 우선 선택
      const linked = pool.filter(p=>
        curNpcs.some(n=>n.includes(p.who)||p.who.includes(n)) || true
      );
      const selected = (linked.length >= 2 ? linked : pool).slice(0, 3);
      return selected;
    })();

    // 현재 장소/상황에 따른 자연스러운 언급 지침 생성
    const _npcMentionInstruction = (() => {
      if(!_worldNpcStatus.length) return '';
      const curLoc = loadCurrentLocation?.();
      const locName = curLoc?.name || '현재 장소';
      const items = _worldNpcStatus;

      return `\n[🌐 세계 인물 상호 언급 — 반드시 실행]\n` +
        `이번 서사에서 등장하는 NPC 중 한 명이 다음 중 하나를 자연스럽게 언급해야 한다.\n` +
        `대화 흐름에 맞는 것을 골라 NPC의 입을 통해 실제 대사로 나오게 하라:\n` +
        items.map(p=>`  • [${p.trigger}]\n    NPC가 말할 수 있는 내용: "${p.dialogue}"\n    분위기 힌트: ${p.hint}`).join('\n') +
        `\n⚠️ 이것은 선택이 아니다. 반드시 이번 장면에 자연스럽게 포함시켜라. 단, 억지스럽게 끼워넣지 말고 대화 흐름에서 나오도록 하라.`;
    })();

    const npcStatusSection = _npcMentionInstruction;

    // ══════════════════════════════════════════════════════
    //  ✦ 날씨 × 세계관 연결 — 봉인 균열이 자연에도 영향
    // ══════════════════════════════════════════════════════
    const _weatherWorldLink = (() => {
      const gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      const fired = loadWorldEvents ? loadWorldEvents() : {};
      const links = [];

      if(gsF['mq2_done'] || fired['we_seal_crack'])
        links.push('봉인 균열로 인해 마법 에너지가 대기에 새어나온다 — 밤하늘에 이상한 오로라가 보인다');
      if(fired['we_worldtree_ill'])
        links.push('세계수가 시들면서 이 대륙의 봄이 늦어지고 있다 — 꽃이 피어야 할 시기에 서리가 내린다');
      if(fired['we_gate_tremble'])
        links.push('천계와 마계의 경계가 흔들리며 기상이 불안정해졌다 — 맑다가도 갑자기 폭풍이 몰아친다');
      if(gsF['world_saved'])
        links.push('봉인이 완성되면서 자연이 조금씩 안정되고 있다 — 오래 시들었던 꽃이 피기 시작한다');

      return links;
    })();
    const weatherWorldSection = _weatherWorldLink.length
      ? `\n[🌦️ 세계 이상 기후] ${_weatherWorldLink[0]}\n날씨 묘사에 이 이상 현상을 은은하게 녹여라.` : '';

    // ══════════════════════════════════════════════════════
    //  ✦ 감시자 첫 복선 — 1회차부터 존재하는 미묘한 암시
    // ══════════════════════════════════════════════════════
    const _watcherForeshadow = (() => {
      const cycle = _cycle || 0;
      if(cycle === 0){
        // 1회차: 아주 은은하게
        return '※ 이번 회차 어딘가에 한 번만, 술집 구석의 낡은 노인이나 길가의 노파가 아무도 듣지 않는 듯 중얼거리는 장면을 삽입하라: "예로부터 세상에는 이야기를 먹고 사는 것이 있다지..." 또는 "죽어도 죽지 않는 자들이 있다는구먼..." 이것은 복선이다. 강조하거나 설명하지 말고 지나가는 배경처럼 처리하라.';
      }
      if(cycle === 1){
        return '※ 이번 회차에 주인공이 혼자 있는 조용한 장면에서 한 번, 누군가 지켜보는 느낌을 묘사하라. 뒤를 돌아봐도 아무것도 없다. 단 한 문장으로. 더 이상 설명하지 마라.';
      }
      return '';
    })();

    // ══════════════════════════════════════════════════════
    //  ✦ 6순위: 세계 뉴스피드 데이터 (지도 패널용 - 별도)
    //  여기선 AI에 발화 사건 요약 주입
    // ══════════════════════════════════════════════════════
    const _firedEventSummary = (() => {
      const fired = loadWorldEvents ? loadWorldEvents() : {};
      const worldEvts = WORLD_EVENTS[char.scenario||'medieval'] || [];
      const active = worldEvts.filter(e=>fired[e.id]).slice(-3);
      if(!active.length) return '';
      return `\n[🌍 최근 세계 사건] ${active.map(e=>`${e.title}`).join(' / ')}\n이 사건들이 대화나 배경에 자연스럽게 녹아있게 하라. NPC들이 이 사건들을 알고 있다.`;
    })();

    const atm = loadAtmosphere();
    const weatherLabels = { none:"설정 없음", clear:"맑음", cloudy:"흐림", rain:"비", storm:"폭풍", snow:"눈", fog:"안개", sandstorm:"모래폭풍", thunder:"천둥번개" };
    const timeLabels   = { none:"설정 없음", dawn:"새벽", morning:"아침", noon:"한낮", afternoon:"오후", evening:"저녁", night:"밤", midnight:"한밤중" };
    const weatherEffects = { rain:"시야가 제한되고 이동이 느려진다. 기민성 판정에 -10 페널티.", storm:"극도로 위험한 날씨. 모든 야외 행동에 -15 페널티. 이동 불가 수준.", snow:"지면이 미끄럽고 시야가 좁다. 체력 소모가 빠르다.", fog:"시야가 극도로 제한된다. 은신·잠입 판정에 +15 보너스.", sandstorm:"호흡 곤란, 시야 차단. 야외에서 모든 판정 -10.", thunder:"번개가 내리치는 위험. 금속 장비 착용자에게 추가 위험." };
    const timeEffects  = { dawn:"여명의 시간. NPC 대부분이 아직 잠들어 있다. 은신에 유리.", night:"어둠이 깔렸다. 은신·위장 판정 +10 보너스. 일부 NPC는 경계가 강화된다.", midnight:"한밤중. 대부분의 상점과 거점이 닫혀 있다. 야간 몬스터 출몰 확률 증가." };
    let atmosphereSection = "";
    if (atm.weather !== "none" || atm.timeOfDay !== "none") {
      const wLabel = weatherLabels[atm.weather] || atm.weather;
      const tLabel = timeLabels[atm.timeOfDay] || atm.timeOfDay;
      const wEffect = weatherEffects[atm.weather] || "";
      const tEffect = timeEffects[atm.timeOfDay] || "";
      atmosphereSection = `\n[🌤️ 현재 환경]\n날씨: ${wLabel}${wEffect ? ` — ${wEffect}` : ""}\n시간대: ${tLabel}${tEffect ? ` — ${tEffect}` : ""}\n서사에서 이 환경을 자연스럽게 묘사하고 판정에 반영하십시오.`;
    }
    const notesSection = loadWorldNotes().length ? `\n[🌍 세계관 설정]\n${loadWorldNotes().map(n=>`[${n.category}] ${n.title}: ${n.content}`).join("\n")}` : "";
    const summonSection = (currentSummons||[]).filter(s=>s.status==="active").length
      ? `\n[🔮 현재 소환수]\n${(currentSummons||[]).filter(s=>s.status==="active").map(s=>`  • ${s.name} (HP:${s.hp}/${s.maxHp})`).join("\n")}`
      : "";
    const monsterSection = (currentMonsters||[]).filter(m=>m.status==="alive").length
      ? `\n[👹 현재 전투 중인 적]\n${(currentMonsters||[]).filter(m=>m.status==="alive").map(m=>`  • ${m.icon}${m.name} (HP:${m.hp}/${m.maxHp} / ATK:${m.atk} / DEF:${m.def} / 등급:${m.tier})`).join("\n")}\n적이 살아있는 동안 전투 상황을 반드시 묘사하십시오.`
      : "";
    
    const karmaScore = char?.pastLifeKarmaScore || 0;
    let karmaSection = "";
    if (karmaScore >= 95) karmaSection = `\n[🔥 업보의 심판] 전생의 죄업으로 인해 현상수배, 저주 등이 발생하며 주변의 혐오를 받습니다.`;
    else if (karmaScore >= 85) karmaSection = `\n[💀 저주받은 영혼] 불운이 따르며 선의도 오해받기 쉽습니다.`;
    else if (karmaScore >= 70) karmaSection = `\n[🌑 어둠의 기억] 타인이 알 수 없는 경계심을 느낍니다.`;

    const _scenarioEra = char.scenario || '중세 판타지';
    const _worldGuardBLS = _scenarioEra.includes('중세') || _scenarioEra.includes('판타지')
      ? `\n[⚠️ 세계관 규칙] 이 세계는 중세 판타지입니다. 무협/강호/무림, 증기기계, SF, 현대 요소를 절대 사용하지 마십시오. 동방 대륙의 사건(무림 대회 등)은 이 세계관에 존재하지 않습니다.`
      : _scenarioEra.includes('무협') || _scenarioEra.includes('강호')
      ? `\n[⚠️ 세계관 규칙] 이 세계는 무협 강호입니다. 중세 기사단, 증기기계, SF 요소를 절대 사용하지 마십시오.`
      : '';

    // ── 신분 강제 규칙 ──────────────────────────────────────
    const _rankId = char.socialRankId || 'commoner';
    const _rankRules = {
      slave: `\n[⛓️ 신분 강제 규칙 — 노예]\n이 캐릭터는 법적으로 소유물이다. 반드시 아래를 서사에 반영하라:\n• NPC(귀족·기사·자유민)는 노예를 하대하거나 무시한다. 존대받는 상황은 없다.\n• 무기 소지 시 NPC가 즉각 경계하거나 제지한다.\n• 자유롭게 돌아다니는 행동에는 "쇠사슬이 걸린다", "감시자의 눈이 쫓는다" 등의 묘사를 추가하라.\n• 탈출 시도·반항 행동은 체포·처벌 위험을 동반한다.\n• 선택지에 "허락을 구한다", "몰래 행동한다" 같은 제약적 표현을 자연스럽게 포함하라.\n• 자유로운 모험을 하려면 먼저 탈출 또는 해방이 서사적으로 성립해야 한다.`,
      outlaw: `\n[💀 신분 강제 규칙 — 무법자]\n이 캐릭터는 지명수배 상태다. 반드시 아래를 반영하라:\n• 도시·마을 진입 시 관원이나 경비병이 경계하거나 신분을 확인하려 한다.\n• 공개 장소에서 자신을 드러내면 체포 시도 가능성이 있다.\n• 선량한 NPC들이 경계하며, 범죄 조직이나 지하세계 인물들만 자연스럽게 접촉한다.`,
      commoner: `\n[🌾 신분 규칙 — 평민]\n귀족·기사에게는 예를 갖추는 묘사를 포함하라. 귀족에게 반말하거나 동등하게 대하면 NPC가 불쾌하게 반응한다.`,
      knight: `\n[⚔️ 신분 규칙 — 기사]\n명예 코드를 지켜야 한다. 비겁한 행동(기습·독살 등)은 기사 신분에 어울리지 않음을 서사에서 암시하라.`,
      noble: `\n[🏰 신분 규칙 — 귀족]\n귀족답게 행동하지 않으면 NPC들이 의아하게 여긴다. 평민 앞에서는 자연스럽게 권위를 가진다.`,
    };
    const _rankRuleSection = _rankRules[_rankId] || '';

    // ── 적 강도 기준선 산출 (장소별 난이도 + 회차 보정) ──────────
    // [B57 FIX] S.stats.level은 정식 필드가 아니라 항상 undefined. 정식
    // 레벨 조회 함수로 교체.
    const _plvl      = (typeof loadPlayerLevel==='function' ? loadPlayerLevel() : 1);
    const _pstr      = S.stats?.str   || 50;
    const _pend      = S.stats?.end   || 50;
    const _pmagic    = S.stats?.mgc   || 50;
    const _pagi      = S.stats?.agi   || 50;
    const _php       = S.stats?.hp    || 100;
    const _pmsgCount = S.msgCount     || 0;
    const _pcycle    = _cycle         || 0;  // 현재 환생 회차

    // 종합 전투력 지수
    const _combatPower = Math.round(_plvl * 12 + (_pstr + _pend + _pmagic + _pagi) / 4);

    // 회차 보정 계수: 회차가 높을수록 적이 더 강하게 등장
    // 1회차=0%, 5회차=+25%, 10회차=+60%, 20회차=+120%
    const _cycleMult = 1 + Math.min(_pcycle * 0.12, 2.0);

    // 장소 타입 감지
    const _curLocType = (typeof window.currentLocation !== 'undefined' && window.currentLocation?.type) || '';
    const _curLocName = (typeof window.currentLocation !== 'undefined' && window.currentLocation?.name) || '';
    const _locNameLc  = _curLocName.toLowerCase();

    // 장소별 기본 난이도 등급 (1=쉬움 ~ 5=극한)
    let _locDifficulty = 2; // 기본: 보통
    let _locLabel      = '일반 지역';
    let _locEnemyDesc  = '';

    if (['hamlet','village','town','city','capital'].includes(_curLocType)){
      _locDifficulty = 1;
      _locLabel      = '도시/마을';
      _locEnemyDesc  = '인간형 적 위주 (경비병·병사·도적·자객·부패 관리·취객·성난 군중). 몬스터는 복선 없이 등장 금지.';
    } else if (/던전|dungeon|지하|underground/.test(_locNameLc) || _curLocType === 'dungeon'){
      _locDifficulty = 3;
      _locLabel      = '던전/지하';
      _locEnemyDesc  = '정예 몬스터·함정·罠 상시. 어둠 속 기습, 독·저주 부여적 다수. 방심하면 즉사 위협.';
    } else if (/고대|ancient|유적|ruins|폐허|봉인|sealed|금지|forbidden/.test(_locNameLc)){
      _locDifficulty = 4;
      _locLabel      = '고대 유적/봉인 장소';
      _locEnemyDesc  = '강력한 수호자·언데드·원령·고대 골렘 상시. 전설급 적도 언제든 등장 가능.';
    } else if (/마왕|demon lord|심층|abyss|심연|지옥|void|공허/.test(_locNameLc)){
      _locDifficulty = 5;
      _locLabel      = '극한 지역 (마왕성/심연)';
      _locEnemyDesc  = '압도적 강적 상시. 생존 자체가 목표. 모든 전투가 목숨을 건 승부.';
    } else if (/산|mountain|협곡|canyon|화산|volcano|얼음|glacier/.test(_locNameLc)){
      _locDifficulty = 3;
      _locLabel      = '험지 (산악/협곡/극지)';
      _locEnemyDesc  = '환경 자체가 위협. 강인한 야생 몬스터·야수·밴디트 정예.';
    } else if (/숲|forest|늪|swamp|정글|jungle/.test(_locNameLc)){
      _locDifficulty = 2;
      _locLabel      = '자연 지역 (숲/늪)';
      _locEnemyDesc  = '야생 몬스터 위주. 매복·독·함정 있음. 야간엔 한 등급 상승.';
    } else if (_pmsgCount >= 50){
      // 후반 일반 지역도 난이도 상승
      _locDifficulty = 3;
      _locLabel      = '후반 일반 지역';
      _locEnemyDesc  = '세계가 위험해졌다. 어디서든 중간 강적 이상 등장 가능.';
    }

    // 회차 보정 적용 후 실효 전투력 및 적 강도 범위
    // [시스템 정리] 예전엔 여기서 장소 "이름"을 키워드로 추측해서(_locDifficulty,
    // 1~5) 별도의 배율을 매겼는데, 이게 실제로 하드코딩 시스템들
    // (checkBossSpawn·checkRandomEncounter·autoDetectAndRegisterEnemy)이
    // 쓰는 장소 레벨대 기반 배율과 서로 다른 숫자를 말하는 문제가 있었다 —
    // AI에게 주는 "적정 세기" 안내와 실제로 스폰되는 몬스터 세기가 어긋날
    // 수 있었다는 뜻. 이제 같은 getLocationPowerScale을 써서 하나로 통일한다.
    // (_locDifficulty/_locLabel/_locEnemyDesc는 "적 유형" 서술 힌트로는
    // 여전히 유용하므로 그대로 유지 — 숫자만 실제 시스템과 통일한다.)
    const _effectivePower  = Math.round(_combatPower * _cycleMult);
    const _locMult         = (typeof getLocationPowerScale==='function')
      ? getLocationPowerScale((typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null)
      : ([0, 0.9, 1.2, 1.7, 2.5, 4.0][_locDifficulty] || 1.2);
    const _enemyPowerBase  = Math.round(_effectivePower * _locMult);

    // 게임 진행 단계
    const _gamePhase = _pmsgCount < 10 ? '초반' : _pmsgCount < 40 ? '중반' : _pmsgCount < 80 ? '후반' : '엔드게임';

    // [레벨대 배치] 이 장소에 "어울리는" 레벨대(getLocationLevelBand — 위험도
    // 또는 장소 유형 기반)를 AI에게 알려서, 요즘 게임들처럼 저레벨 캐릭터가
    // 고레벨 지역(예: 수도)에 가면 위축되고, 고레벨 캐릭터가 저레벨
    // 지역에 가면 여유롭게 묘사되도록 유도한다. 격차가 클수록 더 강하게 반영.
    const _curLocForBand   = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    const _locBand         = (typeof getLocationLevelBand==='function') ? getLocationLevelBand(_curLocForBand) : null;
    let _locBandSection = '';
    if(_locBand){
      const _bandGap = _plvl - _locBand[1]; // 양수면 플레이어가 훨씬 강함, 음수면 훨씬 약함
      const _underGap = _locBand[0] - _plvl; // 양수면 플레이어가 이 장소 최소 레벨보다 낮음
      if(_underGap >= 15){
        _locBandSection = `\n이 장소의 적정 레벨대: Lv.${_locBand[0]}~${_locBand[1]} — 플레이어(Lv.${_plvl})는 이 장소에 비해 크게 약하다. 주민·경비·적이 플레이어를 얕보거나 위협적으로 대하고, 나쁜 짓(절도·시비·불법 거래 등) 시도는 훨씬 쉽게 발각·제압당하는 것으로 묘사하라.`;
      } else if(_underGap >= 5){
        _locBandSection = `\n이 장소의 적정 레벨대: Lv.${_locBand[0]}~${_locBand[1]} — 플레이어(Lv.${_plvl})는 이 장소에 비해 다소 약하다. 약간의 위축감이나 조심스러움을 자연스럽게 반영하라.`;
      } else if(_bandGap >= 20){
        _locBandSection = `\n이 장소의 적정 레벨대: Lv.${_locBand[0]}~${_locBand[1]} — 플레이어(Lv.${_plvl})는 이 장소에 비해 훨씬 강하다. 여유롭고 압도적인 태도로 묘사하되, 이 장소 고유의 사건·서사는 그대로 유지하라.`;
      } else {
        _locBandSection = `\n이 장소의 적정 레벨대: Lv.${_locBand[0]}~${_locBand[1]} (플레이어 Lv.${_plvl}, 이 장소와 대체로 어울림)`;
      }
    }

    const _enemyScaleRule = `\n\n[⚔️ 전투·적 등장 규칙]` +
      `\n현재 전투력: ${_effectivePower} (Lv.${_plvl}·STR${_pstr}·END${_pend}·AGI${_pagi}·HP${_php})` +
      `\n환생 회차: ${_pcycle}회차 (회차 보정 ×${_cycleMult.toFixed(2)})` +
      `\n진행 단계: ${_gamePhase} (${_pmsgCount}턴)` +
      `\n현재 장소 난이도: [${_locLabel}] ★${'★'.repeat(_locDifficulty-1)}${'☆'.repeat(5-_locDifficulty)}` +
      `\n장소 적 유형: ${_locEnemyDesc}` +
      _locBandSection +
      `\n\n■ 이번 장소 적 강도 기준 (전투력 ${_enemyPowerBase} 기준):` +
      `\n  • 잡몹: ${_enemyPowerBase}의 70~100% — 고전하지만 이길 수 있음` +
      `\n  • 중간 강적: ${_enemyPowerBase}의 110~160% — 전략·소모전 필요` +
      `\n  • 정예/보스: ${_enemyPowerBase}의 200%↑ — 단독 처치 매우 어려움, 약점/도움 필요` +
      `\n\n■ 핵심 원칙 — 절대 쉽게 만들지 마라:` +
      `\n  → 적은 항상 플레이어를 압박한다. 쉽게 이기는 전투는 없다.` +
      `\n  → 잡몹도 무리 지어 오거나 기습·함정을 섞어 위협적으로 묘사한다.` +
      `\n  → HP가 줄어도 도전적 상황을 유지한다. 너무 이른 회복은 금지.` +
      `\n  → 회차가 높아질수록 세계 자체가 더 위험해진다.` +
      `\n\n■ 게임 단계별 추가 지침:` +
      `\n  초반(~9턴): 잡몹 2~4마리 무리, 기습 있음. 압도적 강적은 없으나 방심하면 위험.` +
      `\n  중반(10~39턴): 리더·마법사·기사 등 특수능력 보유 적. 복합 위협.` +
      `\n  후반(40~79턴): 엘리트·세력 수장·고위 마법사. 체력·마나 관리 필수.` +
      `\n  엔드게임(80턴+): 전설급·반신·세계급 위협. 전략 없이는 생존 불가.` +
      `\n\n■ 자연재해급 특수 등장 (레벨 무시):` +
      `\n  ① 봉인·금단 장소 진입 ② 세계 이벤트 명시 ③ 도발·금단 마법·신성모독` +
      `\n  ④ 전설급 랜덤 조우 (낮은 확률, 어디서든 가능)` +
      `\n  → 도망/협상/기지가 최선. "압도적 공포"로 묘사하되 탈출 선택지 제공.` +
      `\n\n■ 도시/마을 전투 특별 규칙:` +
      `\n  경비·병사·자객: 체계적이고 강하다. 수적 우위+장비 우위 당연.` +
      `\n  도적·갱단: 수적으로 몰아붙이거나 기습·인질을 섞는다.` +
      `\n  복선 없는 몬스터 출현은 금지. 단, 저주·사건·사고 전후로 등장은 가능.`;

        const ruleSection = `\n[시스템 규칙]\n1. 플레이어 행동 뒤에 전달되는 [주사위 굴림] 수치와 캐릭터의 관련 스탯을 고려하여 성공/실패를 결정하고 서사에 반영하십시오.\n2. 전투 피격, 마법 사용, 위험한 행동 시 반드시 서사적으로 HP나 MP가 소모됨을 묘사하십시오.\n3. 적이 살아있는 전투 중이라면 반드시 적의 반격/행동도 묘사하십시오.\n4. HP 자동 회복은 전투 중 50% 감소, 던전/유적에서 70% 감소한다. 서사에서 캐릭터가 쉽게 회복하는 묘사를 지양하라.\n5. 탈출/도망 실패 시 반드시 HP 손실을 묘사하고 아이템을 잃는 경우도 추가하라.\n6. 레벨업은 강적 처치, 퀘스트 완료, 대성공 등 의미 있는 성과에서 주로 이뤄진다.\n[👥 동료 시스템 규칙]\n7. NPC가 자연스럽게 동행을 제안하거나 주인공이 설득에 성공하면 반드시 <gs>{"party_join":"NPC이름"}</gs>을 출력하라. 어떤 NPC든 조건이 맞으면 동료가 될 수 있다.\n   동료 합류 조건 (OR — 하나만 충족해도 됨):\n   • 호감도(relationship) 충분히 높을 때\n   • 화술(SPK) 또는 카리스마(CHA) 스탯이 높아 설득 성공 시\n   • 근력·마법력 등 해당 NPC가 인정하는 스탯이 높을 때\n   • 충분한 골드로 고용 시\n   • 퀘스트 완료로 신뢰 쌓았을 때\n   • 결투에서 이겼을 때\n8. 동료가 자신의 이유로 떠나는 서사가 나오면 <gs>{"party_leave":"NPC이름"}</gs>을 출력하라.\n9. 현재 동료들은 서사에서 독립적인 행동·대사·반응을 보여야 한다. 각자의 성격과 talkStyle을 반드시 반영하라.`+_worldGuardBLS+_rankRuleSection+_enemyScaleRule;

    // ── 새 종족 전용 묘사 힌트 ──
    const newRaceHint = isDragon ? `\n[🐉 드래곤혈 특성] 이 캐릭터는 용의 피가 흐릅니다. 분노하거나 강한 감정을 느낄 때 눈동자가 세로 동공으로 변하거나 피부에서 비늘 무늬가 드러나는 묘사를 자연스럽게 포함하십시오. 화염이나 냉기를 본능적으로 다루며, 용족 NPC는 본능적으로 이 자를 같은 혈통으로 인식합니다.`
        + (()=>{
          if(typeof loadDragonHeart!=='function') return '';
          const _dh = loadDragonHeart();
          const _balPhase = getDragonBalancePhase(_dh.heartBalance||500);
          const _bloodLabel = getDragonBloodlineLabel(_dh.bloodline||50);
          const _anc = _dh.ancestorRevealed && _dh.ancestorType ? DRAGON_ANCESTOR_TYPES[_dh.ancestorType] : null;
          const _hoard = _dh.hoardType ? DRAGON_HOARD_TYPES[_dh.hoardType] : null;
          const _awakenCost = DRAGON_AWAKEN_COSTS.slice().reverse().find(c=>c.threshold<=(_dh.awakenPoints||0));
          let _hint = `\n[🐉 용심 시스템 상태]`;
          _hint += `\n혈통: ${_bloodLabel.icon} ${_bloodLabel.label} (${_dh.bloodline||50}/100) — ${_bloodLabel.desc}`;
          _hint += `\n용심 균형: ${_balPhase.icon} ${_balPhase.name} (${_dh.heartBalance||500}/1000) — ${_balPhase.desc}`;
          _hint += `\n${_balPhase.aiHint||''}`;
          if(_anc) _hint += `\n선조 고룡: ${_anc.icon} ${_anc.name} — ${_anc.hint}`;
          else if(_dh.ancestorFragments>=3) _hint += `\n선조의 기억이 깨어나는 중 (파편 ${_dh.ancestorFragments}/7). 고대 용의 기억이 가끔 섬광처럼 스침.`;
          if(_hoard) _hint += `\n보물 유형: ${_hoard.icon} ${_hoard.name} (집착도 ${_dh.hoardObsession||0}/100) — 드워프가 보물에 접근하면 자동 분노 반응.`;
          if((_dh.awakenPoints||0)>=200) _hint += `\n각성도: ${_dh.awakenPoints}/1000 — ${_awakenCost?_awakenCost.aiHint:'강렬한 존재감이 주변에 영향을 미침.'}`;
          if(_dh.awakenCostPending) _hint += `\n⚠️ 각성 대가 미지불 상태 — 주변에 크고 작은 이상 현상이 발생한다.`;
          return _hint;
        })()
      : isDemon ? `\n[😈 악마족 특성] 이 캐릭터는 악마의 피가 흐릅니다. 대화에서 은근히 상대의 욕망을 꿰뚫어보고 거기에 어필하는 묘사를 포함하십시오. 강한 힘을 쓸 때 뒤에서 날개나 뿔이 잠깐 드러납니다. 인간·신성 NPC는 본능적으로 불편함을 느끼지만 동시에 이끌리기도 합니다.`
        + (()=>{
          const _dcStatus = getDemonCorruptionStatus();
          if(!_dcStatus || !_dcStatus.stageDef) return '';
          const _dcs = _dcStatus.stageDef;
          return `\n[😈 타락 단계: ${_dcs.stage||0}단계 · ${_dcs.name}] 타락도: ${_dcStatus.points}/1000\n${_dcs.aiHint||''}\n현재 오라: ${_dcs.aura||''}` + (()=>{
            const _ncd = (typeof loadNpcCorruption==='function') ? loadNpcCorruption() : {};
            const _corrupted = Object.entries(_ncd).filter(([,v])=>v.stage>0);
            if(!_corrupted.length) return '';
            return '\n[🌑 타락한 NPC 목록] ' + _corrupted.map(([name,nd])=>{
              const nstg = NPC_CORRUPTION_STAGES[nd.stage] || NPC_CORRUPTION_STAGES[0];
              return `${name}(${nstg.name}·${nd.points}/100)`;
            }).join(', ') + ' — 이 NPC들은 타락의 영향을 받아 행동과 대사에 어두운 면이 드러나야 합니다.';
          })();
        })()
      : isUndead ? (()=>{
          const _ubs = (typeof getUndeadBorrowedTimeStatus==='function') ? getUndeadBorrowedTimeStatus() : null;
          let _uHint = `\n[💀 언데드 특성] 이 캐릭터는 세계로부터 시간을 빌린 존재입니다. 체온이 없고 고통을 느끼지 못하며, 강한 공격에도 쉽게 쓰러지지 않는 섬뜩한 생존력을 묘사하십시오. 산 자들은 본능적으로 소름과 불쾌감을 느끼지만 이 눈빛에서 눈을 뗄 수가 없습니다.`;
          if(_ubs){
            const _ts  = _ubs.tempStage;
            const _ss  = _ubs.scaleStage;
            const _sd  = _ubs.sightDef;
            const _cd  = _ubs.chainDef;
            _uHint += `\n[💀 감정 온도: ${_ts.icon} ${_ts.name} (${_ubs.soulTemp}/100)] ${_ts.aiHint||''}`;
            _uHint += `\n[⚖️ 두 번째 죽음의 저울: ${_ss.icon} ${_ss.name} (${_ubs.deathScale}/100)] ${_ss.aiHint||''}`;
            if(_ubs.worldDebt>=40) _uHint += `\n[💸 세계의 빚: ${_ubs.worldDebt}/100] 빚이 누적되어 사신의 기운이 느껴진다. 이번 장면에서 낯선 시선이나 죽음의 기운을 암시하라.`;
            if(_sd && _sd.level>=2) _uHint += `\n[👁️ 죽음 너머의 눈: ${_sd.name}] ${_sd.ability||''} — NPC의 숨겨진 감정(거짓말·공포·욕망)을 이 언데드가 직관적으로 감지하는 묘사를 포함하라.`;
            if(_cd) _uHint += `\n[⛓️ 미완성의 사슬: ${_cd.icon} ${_cd.label} (${_ubs.chainProgress}/100)] ${_cd.aiHint||''}`;
            // ── 활성 감정 온도 스킬 AI 힌트 ──
            const _activeTempSkills = (_ts.skills || []);
            if(_activeTempSkills.length > 0){
              _uHint += `\n[💀 감정 온도 해금 스킬]`;
              _activeTempSkills.forEach(sk => {
                _uHint += `\n  • ${sk.icon} ${sk.name} (${sk.conditionDesc}): ${sk.aiHint||sk.desc}`;
              });
            }
            // ── 활성 집착 단계 스킬 AI 힌트 ──
            if(_cd && _ubs.chainProgress >= 25){
              const _activeChainSkills = (_cd.chainSkills||[]).filter(s => (_ubs.chainProgress||0) >= s.threshold);
              if(_activeChainSkills.length > 0){
                _uHint += `\n[⛓️ 집착 해금 스킬]`;
                _activeChainSkills.forEach(sk => {
                  _uHint += `\n  • ${sk.icon} ${sk.name} (${sk.conditionDesc}): ${sk.aiHint||sk.desc}`;
                });
              }
            }
            if(_ubs.tabooViolations>0) _uHint += `\n[⚠️ 금기 위반 ${_ubs.tabooViolations}회] 영원히 살려는 선택을 반복했다. 이 언데드의 내면에 망령의 기운이 자리잡고 있음을 암시하라.`;
          }
          return _uHint;
        })()
      : isBeastman ? `\n[🐺 수인 특성] 이 캐릭터는 짐승의 본능을 지니고 있습니다. 감각이 예민하여 인간이 눈치채지 못하는 것을 미리 감지하는 묘사를 포함하십시오. 흥분하면 동물적 특징(귀·꼬리·눈동자 변화 등)이 드러납니다. 야생 동물들이 본능적으로 이 자를 두려워하거나 복종합니다.`
        + (()=>{
          if(typeof getBeastWildlawStatus!=='function') return '';
          const _bws = getBeastWildlawStatus();
          if(!_bws) return '';
          let _bHint = '';
          const _pr = _bws.packRankStage;
          const _bb = _bws.beastBloodStage;
          const _hc = _bws.hunterCodeStage;
          _bHint += `\n[🐾 무리 서열: ${_pr.icon} ${_pr.name} (${_bws.packRank}/100)] ${_pr.aiHint||''}`;
          _bHint += `\n[🩸 야수의 피: ${_bb.icon} ${_bb.name} (${_bws.beastBlood}/100)] ${_bb.aiHint||''}`;
          _bHint += `\n[⚖️ 사냥꾼의 윤리: ${_hc.icon} ${_hc.name} (${_bws.hunterCode}/100)] ${_hc.aiHint||''}`;
          if(_bws.packMembers && _bws.packMembers.length>0)
            _bHint += `\n[🫂 무리의 유대: ${_bws.packMembers.map(m=>m.name).join(', ')}] 이 무리원들에게 각별히 충성스럽고 의리 있게 묘사하라.`;
          if(_bws.territories && _bws.territories.length>0)
            _bHint += `\n[🗺️ 영역 표식: ${_bws.territories.map(t=>t.name).join(', ')}] 이 구역에서 야생 동물들이 자연스럽게 복종하는 장면을 포함하라.`;
          if(_bws.beastBlood>=80) _bHint += `\n[⚠️ 야수 위험 구역] 야수의 피가 임계치에 달했다. 이 캐릭터의 이성이 무너지려는 묘사, 동물적 충동을 억누르는 긴장감을 표현하라.`;
          if(_bws.tabooViolations>0) _bHint += `\n[⚠️ 금기 위반 ${_bws.tabooViolations}회] 강함을 증명하기 위해 사냥하는 행위를 반복했다. 수인 사회에서 야만인으로 여겨지기 시작함을 암시하라.`;
          if(_bws.isLoneWolf) _bHint += `\n[🐺 홀로 된 자] 모든 무리에서 추방된 자. 수인 NPC들이 등을 돌리고, 야생 동물도 경계하는 고독과 낙인을 묘사하라.`;
          // 활성화된 무리 서열 스킬
          const _activePackSkills=(_pr.skills||[]).filter(s=>true);
          if(_activePackSkills.length>0){
            _bHint+=`\n[🐾 서열 해금 스킬]`;
            _activePackSkills.forEach(sk=>{ _bHint+=`\n  • ${sk.icon} ${sk.name}: ${sk.aiHint||sk.desc}`; });
          }
          // 활성화된 야수의 피 스킬
          const _activeBeastSkills=(_bb.skills||[]).filter(s=>true);
          if(_activeBeastSkills.length>0){
            _bHint+=`\n[🩸 야수 피 해금 스킬]`;
            _activeBeastSkills.forEach(sk=>{ _bHint+=`\n  • ${sk.icon} ${sk.name}: ${sk.aiHint||sk.desc}`; });
          }
          return _bHint;
        })()
      : isElemental ? `\n[🌀 원소인 특성] 이 캐릭터는 원소 에너지와 융합된 존재입니다. 감정이 격해지면 피부 아래서 원소가 빛나거나 흘러넘칩니다. 강한 마법 사용 시 몸의 일부가 원소 형태로 변합니다. 원소를 파괴에만 쓰면 원소로부터 거부당합니다.`
        + (()=>{
          if(typeof getElemAwakeningStatus !== 'function') return '';
          const _eas = getElemAwakeningStatus();
          if(!_eas || !_eas.stageDef) return '';
          const _stg  = _eas.stageDef;
          const _et   = _eas.element ? ELEMENTAL_TYPES[_eas.element] : null;
          const _restStg = getElemRestraintStage(_eas.restraint);
          let hint = '';
          if(_et) hint += `\n[🌀 원소 속성: ${_et.icon} ${_et.name}] ${_et.aiHint}\n약점 환경: ${_et.weakEnv}`;
          hint += `\n[🌀 원소각성: ${_stg.icon} ${_stg.name} · ${_stg.stage}단계 · ${_eas.points}/1000] ${_stg.aiHint}`;
          hint += `\n현재 아우라: ${_stg.aura}`;
          const _restHint = _eas.restraint < 30
            ? `⚠️ 억제도 위험(${_eas.restraint}) — 폭발 직전! 원소가 통제를 벗어나 주변에 무작위 반응하는 묘사를 포함하라.`
            : _eas.restraint < 60
            ? `긴장 상태(${_eas.restraint}) — 원소가 예민하게 반응한다. 돌발적 원소 반응 묘사 가끔 포함하라.`
            : `안정(${_eas.restraint}) — 원소가 평온하게 흐른다.`;
          hint += `\n[😤 감정 억제도: ${_restStg.icon} ${_restStg.name}] ${_restHint}`;
          if(_eas.taboo >= 5) hint += `\n[⚠️ 금기 위반 ${_eas.taboo}회] 원소 정령들이 등을 돌리기 시작했다. 원소 스킬 발동 시 부작용이나 NPC들의 불신 묘사를 포함하라.`;
          if(_eas.surgeCount > 0) hint += `\n[💥 원소 폭발 ${_eas.surgeCount}회 이력] 과거 폭발의 트라우마·흔적을 간헐적으로 묘사할 수 있다.`;
          return hint;
        })()
      : isElf ? `\n[🧝 엘프족 특성] 이 캐릭터는 천년 기억의 엘프입니다. 한 번 본 얼굴·장소·사건은 절대 잊지 않으며, 상대가 거짓말할 때 미묘한 감지를 묘사하십시오. 과거 기억이 현재 판단에 영향을 주는 장면을 자연스럽게 포함하십시오. 망각이 금기인 종족으로, 기억을 잃은 엘프는 동족에게 배척당합니다.`
        + (()=>{
          const _emStatus = getElfMemoryStatus();
          if(!_emStatus || !_emStatus.stageDef) return '';
          const _ems = _emStatus.stageDef;
          const _spec = _emStatus.specialization || 'none';
          const _specDef = (typeof ELF_SPECIALIZATIONS !== 'undefined') ? ELF_SPECIALIZATIONS[_spec] : null;
          let _specHint = '';
          if(_specDef) {
            _specHint = `\n[🧝 특화 계열: ${_specDef.icon} ${_specDef.name}] ${_specDef.desc}\n${_specDef.aiHint_spec||''}\n특화 효과: ${_specDef.specEffect||''}`;
          }
          const _forgottenList = (_emStatus.forgottenNPCs||[]).slice(-3).map(n=>n.name).join(', ');
          const _forgottenHint = _forgottenList ? `\n[💀 망각된 인연: ${_forgottenList}] 이 인물들과의 기억이 사라졌다. 이들을 만나도 기억하지 못하며, 동족 엘프들이 이 사실을 알면 경멸한다.` : '';
          return `\n[🧝 기억 단계: ${_ems.stage||0}단계 · ${_ems.name}] 기억력: ${_emStatus.points}/1000\n${_ems.aiHint||''}\n현재 기억의 아우라: ${_ems.aura||''}${_specHint}${_forgottenHint}`;
        })()
      : isCelestial ? `\n[💛 세레스티얼 특성] 이 캐릭터는 신성한 천상의 혈통을 지닙니다. 빛이 닿으면 후광처럼 윤곽이 빛나고, 어둠 속 존재들이 본능적으로 거리를 두는 묘사를 포함하십시오. 치유나 보호의 행동을 할 때 미약하게나마 신성한 온기가 전해집니다.`
        + (()=>{
          // ── 신성 천평 ──
          const _csStatus = getCelestialScaleStatus();
          let scalePart = '';
          if(_csStatus && _csStatus.phaseDef){
            const _csp = _csStatus.phaseDef;
            const _pts = _csStatus.points;
            const _sideDesc = _csp.side==='light'
              ? `빛의 길을 걷고 있다. 신성한 오라가 주변을 밝히며 어둠 속 존재들이 불편해한다.`
              : _csp.side==='dark'
              ? `어둠에 기울어가고 있다. 신성이 오염되어 아군에게 신성 효과를 줄 수 없다. 신성 존재들이 경계한다.`
              : `빛과 어둠의 경계에 서 있다.`;
            const _appearHint = _pts>=900 ? '외형: 순백의 날개가 드러나며 발걸음에서 빛이 흘러내린다. 신성 존재들이 경배하듯 고개를 숙인다.'
              : _pts<=100 ? '외형: 날개가 검게 그을리고 눈동자가 보라빛으로 빛난다. 신성 존재들이 적대한다.'
              : _pts>=750 ? '외형: 후광이 뚜렷하게 드러나며 접촉한 상처가 저절로 아문다.'
              : _pts<=250 ? '외형: 후광이 흔들리고 가끔 그림자가 빛보다 진하게 드리운다.'
              : '';
            scalePart = `\n[💛 신성 천평: ${_csp.icon} ${_csp.label}] 신성도: ${_pts}/1000\n${_sideDesc}\n${_appearHint}`;
          }
          // ── 신성 계율 (핵심: 단계별 AI 묘사 지시) ──
          let covenantPart = '';
          if(typeof getCelestialCovenantStatus === 'function'){
            const _cvStatus = getCelestialCovenantStatus();
            if(_cvStatus && _cvStatus.stageDef){
              const _cvStg = _cvStatus.stageDef;
              const _cvPts = _cvStatus.points;
              const _totalDeed = Object.values(_cvStatus.deed||{}).reduce((a,b)=>a+b,0);
              const _totalSin  = Object.values(_cvStatus.sin||{}).reduce((a,b)=>a+b,0);
              // 가장 많이 한 사명 행동
              const _topDeed = Object.entries(_cvStatus.deed||{}).sort((a,b)=>b[1]-a[1])[0];
              const _deedHint = _topDeed && _topDeed[1]>0 && typeof COVENANT_DEED_GAIN!=='undefined'
                ? `주된 사명 행동: ${COVENANT_DEED_GAIN[_topDeed[0]]?.icon||''} ${COVENANT_DEED_GAIN[_topDeed[0]]?.label||_topDeed[0]} (${_topDeed[1]}회).` : '';
              // 계율 위반 경고
              const _sinWarning = _totalSin > 3 ? `⚠️ 계율 위반 누적 ${_totalSin}회 — 신성이 흔들리는 묘사를 포함하라.` : '';
              covenantPart = `\n[💛 신성 계율: ${_cvStg.icon} ${_cvStg.name}] 계율도: ${_cvPts > 0 ? '+' : ''}${_cvPts}/±500 (${_cvStg.stage > 0 ? '+' : ''}${_cvStg.stage}단계 · ${_cvStg.side === 'fallen' ? '타락' : _cvStg.side === 'light' ? '신성' : '중립'})\n${_cvStg.aiHint||''}\n현재 아우라: ${_cvStg.aura}\nNPC 반응 기준: ${_cvStg.npcReact}\n${_deedHint}${_sinWarning}`;
            }
          }
          return scalePart + covenantPart;
        })()
      : "";

    // ── 새 시나리오 전용 배경 힌트 — 중세 판타지 전용 게임이라 비워둠 ──
    const newScenarioHint = "";

    // ── 숨겨진 직업 시스템 힌트 ──
    const hiddenJobDef = HIDDEN_JOBS.find(j => j.name === char.role);
    const hiddenJobSection = hiddenJobDef ? `\n[🔓 숨겨진 직업 — ${hiddenJobDef.icon}${hiddenJobDef.name}] ${hiddenJobDef.systemHint}${newRaceHint}${newScenarioHint}` : (newRaceHint || newScenarioHint ? `${newRaceHint}${newScenarioHint}` : "");

    // ── 이번 회차 클리어 목표 ──
    const _goal = loadCycleGoal();
    const _goalTarget = _goal ? (_goal.targetProgress || 100) : 100;
    const goalSection = _goal ? `\n[🎯 이번 회차 목표 — ${_goal.icon}${_goal.name}] ${_goal.aiHint} 진행도: ${_goal.progress||0}/${_goalTarget}. ${_goal.completed ? "✅ 달성 완료!" : ""}` : "";

    // ── 시작 대륙 컨텍스트 ──
    const _startContId = char.startContinent || 'central';
    const _startCont = (typeof FIVE_CONTINENTS !== 'undefined') ? FIVE_CONTINENTS[_startContId==='central'?'center':_startContId] : null;
    const _scKd = _startCont?.kingdom;
    // ── 봉인석 정보 섹션 (3장 이후) ─────────────────────────
    // [B45 FIX] 구버전 SEAL_STONES(8개)를 참조하던 걸 실제 메인 시스템인
    // SEAL_DEFINITIONS(11개, narrative/restoreNpc 등 훨씬 상세한 정보 포함)
    // 기반으로 재작성 — 두 시스템의 대륙 목록·이름이 서로 달라 정보가
    // 누락되던 문제를 해결.
    const _sealStoneSection = (() => {
      const gsF2 = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      if(!gsF2['mq2_done']) return '';
      const contId2 = char.startContinent || 'central';
      if(typeof SEAL_DEFINITIONS === 'undefined') return '';
      const restoreState = typeof loadSealRestore === 'function' ? loadSealRestore() : {};
      const seals = Object.entries(SEAL_DEFINITIONS).filter(([,s]) => s.continent === contId2);
      if(!seals.length) return '';
      return seals.map(([name, seal]) => {
        const isRestored = !!restoreState[name]?.restored;
        const curState = isRestored ? '복원 완료' : (seal.desc || '봉인 유지 중');
        return `\n[💎 이 대륙의 봉인석 — ${name}]\n위치: ${seal.location}\n현재 상태: ${curState}\n수호자: ${seal.restoreNpc||'미상'}\n단서: ${seal.narrative?.hook || seal.desc || ''}\n파괴/복원 시 세계 영향: ${seal.worldEffect||''}\nAI 지침: ${seal.narrative?.hook || seal.desc || ''}`;
      }).join('\n');
    })();

    // ── 세계 역사 + 세력 지도 + 빌런 동기 ─────────────────────
    const _worldLoreSection = (() => {
      try{ return typeof getWorldLoreBLSContext==='function' ? getWorldLoreBLSContext() : ''; }catch(e){ return ''; }
    })();

    // ── 결사 간부 컨텍스트 ──────────────────────────────────────
    const _cabalSection = (() => {
      try{ return typeof getCabalBLSContext==='function' ? getCabalBLSContext() : ''; }catch(e){ return ''; }
    })();

    // ── 신분 전형 NPC 컨텍스트 ──────────────────────────────────
    const _socialRankNpcSection = (() => {
      try{ return typeof getSocialRankNpcBLS==='function' ? getSocialRankNpcBLS() : ''; }catch(e){ return ''; }
    })();

    // ── 종족/대륙/직업 마스터 NPC 컨텍스트 ────────────────────────
    const _worldFigureSection = (() => {
      try{ return typeof getWorldFigureBLS==='function' ? getWorldFigureBLS() : ''; }catch(e){ return ''; }
    })();

    // ── 왕국 계보 섹션 (중앙 대륙 또는 초기) ──────────────────
    const _kingSection = (() => {
      const isCentral = (char.startContinent||'central') === 'central';
      if(!isCentral) return '';
      const curKing = typeof ALTA_KINGS !== 'undefined' ? ALTA_KINGS[ALTA_KINGS.length-1] : null;
      const secretKing = typeof ALTA_KINGS !== 'undefined' ? ALTA_KINGS.find(k=>k.secret) : null;
      const gsF3 = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      let result = curKing ? `\n[👑 알테라 왕국 현황] 현 국왕: ${curKing.name}(${curKing.title}) — ${curKing.desc}` : '';
      if(secretKing && gsF3['knight_secret_known']){
        result += `\n[비밀 해금] ${secretKing.name}(${secretKing.gen}대): ${secretKing.secret}`;
      }
      return result;
    })();

    // ── 종족 역사 섹션 ──────────────────────────────────────
    const _raceHistSection = (() => {
      if(!char.race) return '';
      const raceKey2 = Object.keys(RACE_WAR_HISTORY||{}).find(k=>char.race.toLowerCase().includes(k)||k.includes(char.race.toLowerCase())) || 'human';
      const raceHist = (RACE_WAR_HISTORY||{})[raceKey2];
      if(!raceHist) return '';
      return `\n[⚔️ ${char.race} 종족 역사] ${raceHist.major}: ${raceHist.desc.slice(0,80)}...\n자부심: "${raceHist.pride}"\n종족 관계가 대화에 자연스럽게 드러나게 하라.`;
    })();

    // ── 타락 서사 섹션 ──────────────────────────────────────
    const _corruptionStorySection = (() => {
      const dc = (typeof loadDemonCorruption==='function') ? loadDemonCorruption() : null;
      if(!dc || dc.stage < 1) return '';
      const stage = dc.stage;
      const storyMap = {
        1: '심연 신앙 신자들이 당신에게 접근한다. 성직자들이 불편한 눈길을 보낸다.',
        2: '악마 계약 제안이 들어온다. 순환의 사원에서 공식 경고를 받았다. 빛의 신앙이 당신을 이단으로 보기 시작한다.',
        3: '순환의 사원에서 파문 직전. 마계와 연결된 존재들이 먼저 알아본다. 광장에서 손가락질받는 일이 생긴다.',
        4: '마계 접근이 가능해졌다. 베엘제부브 마왕이 당신의 존재를 인지했다. 봉인석이 당신에게 반응한다.',
        5: '당신은 이제 혼돈의 지배자 루트에 있다. 세계 자체가 당신을 두려워하기 시작했다.',
      };
      const hint = storyMap[Math.min(stage, 5)] || '';
      const stageData = (typeof DEMON_CORRUPTION_STAGES !== 'undefined') ? DEMON_CORRUPTION_STAGES.find(s=>s.stage===stage) : null;
      return `\n[💜 타락 ${stage}단계 — ${stageData?.name||''}] ${hint}${stageData?.storyHint ? '\n'+stageData.storyHint : ''}`;
    })();

    const continentSection = _scKd ? (() => {
      const repScore = (typeof loadContinentRep==='function') ? (loadContinentRep()[_startContId]||0) : 0;
      const rivals = _scKd.relations ? Object.entries(_scKd.relations).filter(([,v])=>v==='적대'||v==='긴장').map(([id])=>FIVE_CONTINENTS[id==='center'?'central':id]?.label||id).filter(Boolean) : [];
      const allies = _scKd.relations ? Object.entries(_scKd.relations).filter(([,v])=>v==='동맹'||v==='우호').map(([id])=>FIVE_CONTINENTS[id==='center'?'central':id]?.label||id).filter(Boolean) : [];
      const sqInfo = S._continentStartQuest ? ` 활성 의뢰: [${S._continentStartQuest.title}]` : '';

      // 대륙 고유 NPC (kingdom.npcs)
      const kNpcs = (_scKd.npcs||[]);
      const npcInfo = kNpcs.length ? `\n[🗺️ 대륙 주요 인물] ${kNpcs.map(n=>`${n.icon||'👤'}${n.name}(${n.role})`).join(' / ')}` : '';

      // 대륙 고유 이벤트 (kingdom.events)
      const kEvents = (_scKd.events||[]);
      const eventInfo = kEvents.length ? `\n[📰 대륙 진행 중 사건] ${kEvents.slice(0,3).join(' / ')}` : '';

      // 대륙 테마/분위기
      const contTheme = _startCont.theme ? `\n[🌍 대륙 특색] ${_startCont.theme}` : '';
      const contAtm   = _startCont.atmosphere ? `\n[🌆 분위기] ${_startCont.atmosphere.slice(0,80)}` : '';

      // 대륙 세력 (현재 대륙 관련 세력 필터링)
      const allFactions = typeof getCurrentFactions==='function' ? getCurrentFactions() : {};
      const factionRep  = typeof loadFactionRep==='function' ? loadFactionRep() : {};
      const factionEntries = Object.entries(allFactions).slice(0,6); // 최대 6개
      const factionInfo = factionEntries.length ? `\n[⚔️ 주요 세력] ${factionEntries.map(([name,f])=>{
        const rep2 = factionRep[name]||0;
        const rel  = rep2>=50?'동맹':rep2>=20?'우호':rep2>=-20?'중립':rep2>=-50?'적대':'전쟁';
        return `${f.icon}${name}(영향력${f.influence||50}·${rel})`;
      }).join(' / ')}` : '';

      // 천계/마계 특수 정보
      const isDim = _startCont._isSpecialDimension;
      const dimInfo = isDim ? `\n[✦ 특수 차원] 이곳은 속세와 다른 법칙이 지배한다. ${_startCont._accessCond==='celestial'?'신성한 빛이 모든 것을 비추며, 타락한 존재는 극도로 약화된다.':'혼돈의 기운이 의지를 갉아먹는다. 신성 마법은 약화되고 어둠의 힘이 증폭된다.'}` : '';

      return `\n[🌍 출신 대륙 — ${_startCont.label}] ${_scKd.name} · ${_scKd.culture} · 수도: ${_scKd.capital}(${_scKd.ruler||'통치자 불명'}) · 평판: ${repScore}${sqInfo}${rivals.length?' · 긴장: '+rivals.join('/'):''}${allies.length?' · 우호: '+allies.join('/'):''}${contTheme}${contAtm}${npcInfo}${eventInfo}${factionInfo}${dimInfo}`;
    })() : "";

    // ── 성장형 악당 ──
    const _villain = getVillainStatus();
    const villainSysSection = _villain && _villain.threat !== "low" && _villain.name ? `\n[${_villain.threatDef?.icon||"⚠️"} 악당 위협 — ${_villain.threatDef?.label}] ${_villain.name}의 세력이 세계를 잠식 중입니다(${_villain.power}%). ${_villain.threatDef?.desc} 서사에서 악당의 영향력이 주변 세계에 반영되게 하십시오.` : "";

    // ── 날씨 판정 연동 ──
    const _weather = getWeatherStatMods();
    const weatherSysSection = (_weather.weather.label && _weather.weather.label !== "맑음") ? `\n[${_weather.weather.icon} 날씨 효과 — ${_weather.weather.label}] ${_weather.weather.aiHint}` : "";

    // ══════════════════════════════════════════════════════════
    //  [v47 몰입 시스템] 저장된 데이터 → AI 전달 7종
    // ══════════════════════════════════════════════════════════

    // ① NPC 기억 — 구체적 행동 이력을 AI에게 전달
    const _npcMemorySection = (() => {
      try {
        const mem = loadNpcMemory();
        if (!mem || !Object.keys(mem).length) return '';
        const lines = [];
        for (const [npcName, data] of Object.entries(mem)) {
          if (!data.events || !data.events.length) continue;
          // 최근 5개 이벤트만 전달 (토큰 절약)
          const recent = data.events.slice(-5);
          const evtStr = recent.map(e => `${e.reason}(${e.delta > 0 ? '+' : ''}${e.delta})`).join(', ');
          lines.push(`• ${npcName}: ${evtStr}`);
        }
        return lines.length
          ? `\n[🧠 NPC 기억 — 플레이어가 한 구체적 행동 이력]\n${lines.join('\n')}\n이 기억을 바탕으로 NPC가 플레이어를 대할 때 과거 행동을 구체적으로 언급하거나 태도에 반영하라.`
          : '';
      } catch(e) { return ''; }
    })();

    // ② 배경(background) → NPC 반응 규칙으로 전환
    const _backgroundReactionSection = (() => {
      const bg = (char.background || '').toLowerCase();
      if (!bg) return '';
      const rules = [];

      if (/노예|slave/.test(bg)) {
        rules.push('노예 출신: 귀족·상인 NPC가 처음에 반말하거나 무시한다. 도망자나 하층민 NPC는 동질감으로 빠르게 마음을 연다. 도시 경비는 의심스럽게 바라본다.');
        rules.push('노예 출신 배경이 드러나는 순간 — 손목 낙인, 굳은살, 고개를 숙이는 습관 — 을 장면 묘사에 자연스럽게 녹여라.');
      }
      if (/왕족|왕가|왕자|공주|귀족|noble|royal/.test(bg)) {
        rules.push('왕족·귀족 출신: 신분을 알면 NPC들이 즉시 태도를 바꾼다. 그러나 신분을 숨기고 있다면 행동 하나하나에서 귀족 습관이 새어나온다 — 말투, 식사법, 걸음걸이.');
      }
      if (/도적|도둑|범죄|criminal|thief/.test(bg)) {
        rules.push('범죄자 출신: 경비·상인이 본능적으로 경계한다. 도적 길드나 뒷골목 NPC는 동료로 인식. 귀족은 무시하다가 실력을 보면 태도가 변한다.');
      }
      if (/용병|mercenary|전사|warrior/.test(bg)) {
        rules.push('용병 출신: 처음 만나는 NPC들이 전투력을 먼저 본다. 의뢰가 자연스럽게 들어온다. 기사단은 동료로, 귀족은 도구로 대한다.');
      }
      if (/성직|신관|priest|clergy/.test(bg)) {
        rules.push('성직자 출신: 일반 시민이 존경하거나 의지한다. 악마족·언데드 관련 NPC는 경계한다. 교회 네트워크를 통한 정보 접근이 자연스럽다.');
      }
      if (/고아|orphan|부랑/.test(bg)) {
        rules.push('고아·부랑자 출신: 아무도 신분을 모른다. 어디서든 처음엔 무시당한다. 그러나 능력을 증명하는 순간 더 강한 인상을 남긴다 — "저 자는 아무것도 없이 여기까지 왔다"');
      }

      if (!rules.length) {
        rules.push(`배경 "${char.background}" — 이 배경에서 자연스럽게 나오는 습관, 말투, 반응을 NPC와의 첫 만남에서 반영하라.`);
      }

      return `\n[📜 배경 반응 규칙 — ${char.background}]\n${rules.join('\n')}`;
    })();

    // ③ 외모·첫인상 — 종족+신분+배경 조합으로 자동 생성
    const _firstImpressionSection = (() => {
      const race = char.race || '인간';
      const rank = char.socialRank || '평민';
      const role = char.role || '';
      const parts = [];

      // 종족별 외형 특성
      const raceAppearance = {
        '엘프': '귀가 뾰족하고 눈빛이 깊다. 나이를 가늠하기 어렵다.',
        '드워프': '키가 작고 다부지다. 손이 크고 굳은살이 박혔다.',
        '오크': '체구가 크고 피부가 거칠다. 송곳니가 살짝 드러난다.',
        '다크링': '피부가 어둡고 그림자가 짙다. 시선이 닿으면 불편함을 느끼는 자들이 있다.',
        '드래곤혈': '눈동자에 비늘 무늬가 있다. 가까이 서면 열기가 느껴진다.',
        '악마족': '눈이 붉거나 뿔이 있다. 처음 보는 이들이 반사적으로 물러선다.',
        '언데드': '피부가 창백하고 숨소리가 없다. 존재 자체가 공기를 차갑게 만든다.',
        '세레스티얼': '빛이 은은하게 감돈다. 눈을 맞추면 압도감을 느낀다.',
      };

      const appearance = raceAppearance[race] || '평범한 외모이지만 눈빛이 남다르다.';
      parts.push(`종족 외형: ${appearance}`);

      // 신분+직업 첫인상
      parts.push(`신분·직업 인상: ${rank} ${role} — NPC가 처음 볼 때 이 조합에서 오는 첫인상을 묘사하라. 옷차림, 자세, 태도에서 신분이 드러나게 하라.`);

      // 배경에서 오는 신체 흔적
      const bg = (char.background || '').toLowerCase();
      if (/노예/.test(bg)) parts.push('신체 흔적: 손목에 낙인 흔적, 구부정한 자세, 시선을 피하는 습관.');
      if (/전사|용병|기사/.test(bg)) parts.push('신체 흔적: 곳곳의 흉터, 단단한 근육, 자연스럽게 무기 쪽으로 가는 손.');
      if (/마법사|학자/.test(bg)) parts.push('신체 흔적: 잉크 얼룩, 긴 손가락, 주변을 관찰하는 습관적 시선.');

      return `\n[👤 첫인상 묘사 규칙]\n${parts.join('\n')}\n처음 만나는 NPC가 플레이어를 볼 때 위 특징을 바탕으로 첫 반응을 묘사하라. NPC마다 같은 외모를 다르게 받아들인다.`;
    })();

    // ④ 자리 비운 장소 변화
    const _locationChangeSection = (() => {
      try {
        const curLoc = loadCurrentLocation();
        if (!curLoc) return '';
        const visitedRaw = typeof loadExploredLocations === 'function' ? loadExploredLocations() : [];
        const visited = Array.isArray(visitedRaw) ? visitedRaw : [];
        const lastVisit = visited.find(v => v.id === curLoc.id);
        if (!lastVisit) return '';

        const turnNow = S.msgCount || 0;
        const turnLast = lastVisit.turn || 0;
        const elapsed = turnNow - turnLast;
        if (elapsed < 5) return ''; // 5턴 이내 재방문은 변화 없음

        const firedEvts = typeof loadWorldEvents === 'function'
          ? Object.entries(loadWorldEvents() || {}).filter(([,v]) => v).map(([k]) => k)
          : [];

        const changes = [];
        if (elapsed >= 20) changes.push('오랜 시간이 흘렀다. 계절이 바뀌었거나 인물들의 상황이 달라졌을 수 있다.');
        else if (elapsed >= 10) changes.push('며칠이 지났다. 장소 분위기가 미묘하게 달라졌다.');

        if (firedEvts.includes('we_dragon_mad') && /동대륙|용염/.test(curLoc.name||''))
          changes.push('고룡 광기 사태의 영향으로 이 지역 사람들이 불안해 보인다.');
        if (firedEvts.includes('we_trade_war') && /항구|시장|군도/.test(curLoc.name||''))
          changes.push('무역전쟁 여파로 상인들이 줄었고 물가가 올랐다.');
        if (firedEvts.includes('we_frost_giant') && /북대륙|빙원/.test(curLoc.name||''))
          changes.push('얼음 거인족 남하 소식에 주민들이 떠나고 있다.');

        return changes.length
          ? `\n[🏚️ 장소 변화 — ${curLoc.icon||''}${curLoc.name}]\n플레이어가 ${elapsed}턴 만에 돌아왔다.\n${changes.join('\n')}\n이 변화를 장면 묘사 초반에 자연스럽게 반영하라.`
          : '';
      } catch(e) { return ''; }
    })();

    // ⑤ 날씨 → 서사 톤 지침
    const _weatherNarrativeTone = (() => {
      const atm = loadAtmosphere();
      const w = atm?.weather;
      const toneMap = {
        rain:     '빗소리가 배경에 깔린다. 대화는 더 낮게, 감정은 더 내면으로. 슬픔이나 고백이 자연스럽게 나오는 날씨다.',
        storm:    '폭풍 속에서는 소리를 질러야 들린다. 행동이 급박하고 단절적으로. 감정이 폭발하기 쉬운 날씨다.',
        snow:     '눈이 소리를 삼킨다. 세계가 고요하고 느리다. 회상이나 독백이 자연스럽게 나오는 날씨다.',
        fog:      '안개 속에서는 가까운 것만 보인다. 불안감, 긴장감, 무언가 숨어있는 느낌. 기습이나 배신이 어울리는 날씨다.',
        scorching:'폭염 속에서 사람들은 예민해진다. 분쟁이 쉽게 일어나고 이성보다 본능이 앞선다.',
        clear:    '맑은 날은 감추기 어렵다. 표정이 잘 보이고 거짓말이 드러나기 쉽다. 축하나 출발에 어울린다.',
      };
      const tone = toneMap[w];
      if (!tone) return '';

      const t = atm?.timeOfDay;
      const timeMap = {
        dawn:     '새벽 — 세계가 아직 눈을 뜨지 않은 시간. 비밀 대화나 도주에 어울린다.',
        night:    '밤 — 경계가 낮아지고 솔직해지는 시간. 고백이나 계획이 어울린다.',
        midnight: '자정 — 가장 어두운 시간. 공포와 결단이 어울린다.',
        evening:  '저녁 — 하루가 끝나는 시간. 피로와 아쉬움이 자연스럽다.',
      };
      const timeTone = timeMap[t] || '';

      return `\n[🌦️ 날씨·시간 서사 톤]\n${tone}${timeTone ? '\n'+timeTone : ''}\n이 톤을 장면 묘사와 NPC 대화의 분위기에 반영하라. 날씨를 단순 배경이 아닌 감정의 일부로 써라.`;
    })();

    // ⑥ 말투(speechStyle) → NPC 반응 누적
    const _speechStyleSection = (() => {
      const style = char.speechStyle || '';
      if (!style) return '';
      const styleMap = {
        '차갑고 간결': 'NPC들이 점점 불필요한 말을 줄인다. 오래 알수록 짧은 말에 더 많은 의미를 담게 된다. 처음 만나는 NPC는 당혹스러워하거나 차갑게 대한다.',
        '따뜻하고 친근': 'NPC들이 경계를 빠르게 낮춘다. 처음 만나는 NPC도 조금 더 열려있다. 그러나 진지한 순간에 진중함이 부족해 보일 수 있다.',
        '공손하고 격식': '귀족·성직자 NPC가 좋아한다. 하층민 NPC는 오히려 거리감을 느낀다. 격식체가 갑자기 무너지는 순간이 감정적으로 강렬하다.',
        '거칠고 직설': 'NPC들이 처음엔 당황하지만 신뢰를 쌓으면 "저 사람은 거짓말을 안 한다"는 인식이 생긴다. 귀족은 불쾌해한다.',
      };
      const rule = Object.entries(styleMap).find(([k]) => style.includes(k));
      const desc = rule ? rule[1] : `말투 "${style}" — 이 말투가 NPC와의 관계에 자연스럽게 녹아들도록 묘사하라.`;
      return `\n[💬 말투 누적 효과 — ${style}]\n${desc}`;
    })();

    // ⑦ 결정적 선택 여파 — butterfly 데이터 → 구체적 언급 지침
    const _choiceRippleSection = (() => {
      try {
        const bf = typeof loadButterfly === 'function' ? loadButterfly() : null;
        if (!bf || !bf.effects || !bf.effects.length) return '';
        // 중대한 선택만 (impact 높은 것)
        const major = bf.effects
          .filter(e => (e.impact || 0) >= 3 || e.major)
          .slice(-3); // 최근 3개
        if (!major.length) return '';
        const lines = major.map(e => `• ${e.desc || e.id}: ${e.worldChange || e.effect || '세계에 영향을 남겼다'}`);
        return `\n[⚖️ 결정적 선택의 여파]\n${lines.join('\n')}\n이 선택들을 NPC가 구체적으로 언급하거나("당신이 그때 그 결정을 했을 때..."), 세계 묘사에서 그 흔적이 보이도록 하라. 과거 선택을 AI가 임의로 덮거나 없던 일로 만들지 마라.`;
      } catch(e) { return ''; }
    })();

    // ══════════════════════════════════════════════════════════
    //  [v48] 저장 데이터 → BLS 전달 전면 확장
    //  카테고리: 서사핵심 / 종족시스템 / NPC·관계 / 퀘스트·선택
    //            세계·세력 / 성장·능력 / 회차·전생 / 장소·탐험
    //            감정·심리 / 인벤토리·장비 / 기타
    // ══════════════════════════════════════════════════════════

    // ── [A] 서사 핵심 ─────────────────────────────────────────

    // A1. 선택 이력
    const _choiceHistSection = (() => {
      try {
        const h = loadChoiceHistory();
        if (!h || !h.length) return '';
        const recent = h.slice(-5).map(ch =>
          `• ${ch.desc || ch.id || '선택'}: ${ch.result || ch.effect || ''}`
        ).join('\n');
        return `\n[📋 최근 선택 이력]\n${recent}\nNPC가 이 선택들을 기억하고 대화에서 언급할 수 있다.`;
      } catch(e) { return ''; }
    })();

    // A2. 배신 기록
    const _betrayalSection = (() => {
      try {
        const b = loadBetrayals();
        if (!b || !b.length) return '';
        const lines = b.map(x => `• ${x.target || x.name}: ${x.desc || x.reason || '배신'}`).join('\n');
        return `\n[🗡️ 배신 기록]\n${lines}\n배신당한 NPC는 적대적이거나 냉담하다. 소문이 퍼졌다면 주변 NPC도 경계한다.`;
      } catch(e) { return ''; }
    })();

    // A3. 트라우마
    const _traumaSection = (() => {
      try {
        const t = loadTraumas();
        if (!t) return '';
        const active = Object.entries(t).filter(([,v]) => v && !v.resolved).map(([k,v]) =>
          `• ${v.text || k}${v.trigger ? ` (유발: ${v.trigger})` : ''}`
        ).join('\n');
        if (!active) return '';
        return `\n[💔 활성 트라우마]\n${active}\n이 트라우마 유발 상황에서 플레이어가 본능적으로 반응한다. 묘사에 자연스럽게 반영하라.`;
      } catch(e) { return ''; }
    })();

    // A4. 원한 목록
    const _grudgeSection2 = (() => {
      try {
        const g = loadGrudgeList();
        if (!g || !g.length) return '';
        const lines = g.filter(x => !x.resolved).map(x =>
          `• ${x.target || x.name}: ${x.reason || ''} (강도: ${x.intensity || '보통'})`
        ).join('\n');
        if (!lines) return '';
        return `\n[😤 원한 목록]\n${lines}\n해당 대상과 만날 때 긴장감과 적개심이 자연스럽게 드러난다.`;
      } catch(e) { return ''; }
    })();

    // A5. 라이벌
    const _rivalSection2 = (() => {
      try {
        const r = typeof loadRivals === 'function' ? loadRivals() : null;
        if (!r || !r.length) return '';
        const lines = r.map(x => `• ${x.name}: ${x.rivalry || x.desc || ''}`).join('\n');
        return `\n[⚔️ 라이벌]\n${lines}\n라이벌과 만날 때 경쟁심과 긴장감이 배어난다.`;
      } catch(e) { return ''; }
    })();

    // A6. 감정 상태
    const _emotionSection = (() => {
      try {
        const e = loadEmotion();
        const r = loadEmotionRipples ? loadEmotionRipples() : [];
        if (!e && (!r || !r.length)) return '';
        const lines = [];
        if (e) lines.push(`현재 감정: ${e.label || e.type || JSON.stringify(e).slice(0,60)}`);
        if (r && r.length) {
          const recent = r.slice(-3).map(x => `${x.emotion || x.type}(${x.source || ''})`).join(', ');
          lines.push(`감정 파동: ${recent}`);
        }
        return `\n[💭 감정 상태]\n${lines.join('\n')}\n현재 감정이 대화 톤과 행동 묘사에 반영된다.`;
      } catch(e) { return ''; }
    })();

    // A7. 루프 자각도
    const _loopAwarenessSection = (() => {
      try {
        const la = loadLoopAwareness();
        if (!la || !la.aware) return '';
        return `\n[🔄 루프 자각]\n자각 레벨: ${la.level || 1} / 처음 자각한 시점: ${la.firstAwareAt || '불명'}\n루프를 자각한 만큼 플레이어가 미래를 암시하는 발언을 할 때 NPC가 의아해한다.`;
      } catch(e) { return ''; }
    })();

    // A8. 메타 지식 / 세계 비밀 / 정체성
    const _metaSection2 = (() => {
      try {
        const mk = loadMetaKnowledge ? loadMetaKnowledge() : [];
        const ws = typeof loadWorldSecrets === 'function' ? loadWorldSecrets() : [];
        const sec = typeof loadSecrets === 'function' ? loadSecrets() : [];
        const iv = typeof loadIdentityVault === 'function' ? loadIdentityVault() : null;
        const lines = [];
        if (mk && mk.length) lines.push(`메타 지식: ${mk.slice(-3).map(x => x.desc || x).join(', ')}`);
        if (ws && ws.length) lines.push(`발견한 세계 비밀: ${ws.slice(-3).map(x => x.desc || x.id || x).join(', ')}`);
        if (sec && sec.length) lines.push(`비밀 목록: ${sec.slice(-3).map(x => x.desc || x.text || x).join(', ')}`);
        if (iv && (iv.trueIdentity || iv.hiddenPast)) lines.push(`숨겨진 정체: ${iv.trueIdentity || iv.hiddenPast || ''}`);
        return lines.length ? `\n[🔍 메타 지식·비밀·정체]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [B] 종족별 고유 시스템 ────────────────────────────────

    const _raceSystemSection = (() => {
      try {
        const race = (char.race || '').toLowerCase();
        const lines = [];
        // [4순위] 메인 스토리 진행도를 종족 시스템과 교차시키기 위한 플래그.
        // 천계/마계 개방, 결사 정체 노출, 진짜 적 공개 등은 이미 다른 곳에서
        // 쓰이고 있지만, 종족 전용 시스템(엘프 망각/드워프 원한/오크 명예)은
        // 지금까지 메인 스토리와 완전히 단절되어 있었다.
        const gsF_race = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
        const infernalOpen = !!gsF_race['infernal_gate_open'];
        const celestialOpen = !!gsF_race['celestial_gate_open'];
        const trueEnemyRevealed = !!gsF_race['true_enemy_revealed'];
        const asmodusId = !!gsF_race['asmodus_identified'];
        const demonAlliance = !!gsF_race['demon_lord_alliance'];

        if (/엘프|elf/.test(race)) {
          // [버그 수정] em.memories(존재하지 않는 필드) → 실제 구조(points/stage/memory)로 교정.
          // ef.level(존재하지 않는 필드) → 실제 구조(stack/maxStack)로 교정.
          const em = (typeof loadElfMemory === 'function') ? loadElfMemory() : null;
          const ef = (typeof loadElfForgetting === 'function') ? loadElfForgetting() : null;
          const ee = typeof loadElfEmotion === 'function' ? loadElfEmotion() : null;
          if (em && em.points > 0)
            lines.push(`엘프 선조 기억 ${em.points}점 (단계 ${em.stage||0}, 망각 ${em.forgetCount||0}회)`);
          if (ef && ef.stack > 0)
            lines.push(`엘프 망각 축적: ${ef.stack}/${ef.maxStack||100} — 기억이 흐려지고 있다`);
          if (ee && ee.suppressed > 0)
            lines.push(`억제된 감정: ${ee.suppressed}단계 — 균열 직전`);
          // [4순위] 마계 균열이 열린 세계에서 엘프는 선조의 기억 속 "신계 대전"을
          // 직접 떠올린다 — 망각 스택이 비정상적으로 빨리 쌓이거나, 반대로
          // 오래 묻어둔 기억이 강제로 떠오를 수 있다.
          if (infernalOpen)
            lines.push(`★교차★ 마계 균열이 열린 지금, 엘프는 3천 년 전 신계 대전의 기억과 공명할 수 있다 — 망각하려 해도 자꾸 떠오르거나, 반대로 그 무게를 피해 더 빨리 봉인하려 할 수 있다. 서사에 자연스럽게 반영하라.`);
          if (trueEnemyRevealed)
            lines.push(`★교차★ "최초의 혼돈"의 진실이 드러난 지금, 엘프의 가장 오래된 선조 기억 중 일부가 그 존재와 직결될 수 있다 — 평소보다 깊은 기억 한 조각이 자연스럽게 떠오르는 장면을 만들어도 좋다(강제 아님).`);
        }

        if (/드워프|dwarf/.test(race)) {
          // [버그 수정] dg.grudges(존재하지 않는 필드) → 실제 구조(entries[], status:'open')로 교정.
          const dc = typeof loadDwarfCraft === 'function' ? loadDwarfCraft() : null;
          const dg = typeof loadDwarfGrudge === 'function' ? loadDwarfGrudge() : null;
          const du = typeof loadDwarfUnfinished === 'function' ? loadDwarfUnfinished() : null;
          if (dc && dc.masterpieces) lines.push(`드워프 명작: ${dc.masterpieces}개 완성`);
          const openGrudges = dg ? (dg.entries||[]).filter(e=>e.status==='open') : [];
          if (openGrudges.length)
            lines.push(`미해결 드워프 원한: ${openGrudges.length}개(최근: ${openGrudges[openGrudges.length-1]?.label||''} — ${openGrudges[openGrudges.length-1]?.target||''}) — 반드시 갚아야 한다`);
          if (du && du.works && du.works.filter(w=>w.status==='active').length)
            lines.push(`미완성 일: ${du.works.filter(w=>w.status==='active').length}개 — 죽어도 완성해야 한다`);
          // [4순위] 아스모데우스 결사가 봉인석을 노리고 있다는 사실이 드러나면,
          // 드워프는 "영토 침략"형 원한으로 결사를 인식할 수 있다 — 광산과
          // 터전을 침략당한 것과 같은 무게의 분노 대상으로 자연스럽게 연결.
          if (asmodusId && openGrudges.length)
            lines.push(`★교차★ 아스모데우스 결사의 정체가 드러났다 — 드워프에게 결사는 "영토 침략"형 원한 대상으로 다뤄질 수 있다. 기존 미해결 원한과 같은 무게로 결사를 증오하는 대사를 자연스럽게 섞어도 좋다.`);
        }

        if (/오크|orc/.test(race)) {
          const oh = (typeof loadOrcHonor === 'function') ? loadOrcHonor() : null;
          const ob = typeof loadOrcBloodVow === 'function' ? loadOrcBloodVow() : null;
          if (oh) lines.push(`오크 명예 점수: ${oh.points || 0} (단계: ${oh.stage || 0})`);
          if (ob && ob.vows && ob.vows.filter(v=>!v.fulfilled).length)
            lines.push(`미이행 혈맹: ${ob.vows.filter(v=>!v.fulfilled).length}개`);
          // [4순위] 천계-마계 동맹(6장)이 성사되면, 오크 의회는 "외부 세력의
          // 협정에 종족의 운명을 맡기는 것"을 명예의 문제로 다룰 수 있다 —
          // 의회 내부에서 동맹 찬반 논쟁이 자연스러운 사이드 갈등이 된다.
          if (demonAlliance)
            lines.push(`★교차★ 천계와 마계가 동맹을 맺었다 — 오크 의회 입장에서 이것은 "오크의 명예를 거치지 않은 외부의 협정"이다. 현자들 사이에서 이 동맹을 받아들일지, 독자 노선을 걸을지 논쟁이 일어날 수 있다(강제 아님, 자연스러운 배경 갈등으로 활용).`);
        }

        if (/다크링|darkling/.test(race)) {
          const dv = loadDarklingVoid ? loadDarklingVoid() : null;
          if (dv) lines.push(`다크링 공허 수치: ${dv.void || 0} — ${dv.void > 70 ? '위험: 공허가 넘친다' : '안정'}`);
        }

        if (/천족|celestial|세레스티얼/.test(race)) {
          const cc = loadCelestialCovenant ? loadCelestialCovenant() : null;
          if (cc && cc.covenants) lines.push(`천계 서약: ${cc.covenants.length}개 (위반: ${cc.covenants.filter(x=>x.broken).length}개)`);
          if (celestialOpen)
            lines.push(`★교차★ 천계 문이 열렸다 — 세레스티얼 종족에게는 본거지가 다시 열린 사건이다. 서약 이력이 있다면 천계 인사들이 그것을 먼저 언급할 수 있다.`);
        }

        if (/악마|demon/.test(race)) {
          const dc2 = loadDemonContracts ? loadDemonContracts() : null;
          const dt = typeof loadDemonTrueName === 'function' ? loadDemonTrueName() : null;
          if (dc2 && dc2.contracts && dc2.contracts.length)
            lines.push(`체결한 계약: ${dc2.contracts.length}개 (미이행: ${dc2.contracts.filter(x=>!x.fulfilled).length}개)`);
          if (dt) lines.push(`진명 상태: ${dt.intact ? '온전' : '흔들리는 중'}`);
          if (asmodusId)
            lines.push(`★교차★ 아스모데우스 결사의 정체가 드러났다 — 악마족 플레이어는 마계 내부 사정으로 결사를 더 빨리 알아챌 수 있고, 아스모데우스와의 관계(동족/경쟁자)가 서사에 자연스럽게 섞일 수 있다.`);
        }

        if (/드래곤|dragon|용혈/.test(race)) {
          const dh = loadDragonHeart ? loadDragonHeart() : null;
          if (dh) lines.push(`드래곤 심장: 분노 ${dh.rage || 0}% / 각성 ${dh.awakening || 0}%${dh.rage > 70 ? ' ⚠️ 폭주 임박' : ''}`);
        }

        if (/인간|human/.test(race) || (!race)) {
          const hl = typeof loadHumanLegacy === 'function' ? loadHumanLegacy() : null;
          const hs = typeof loadHumanStigma === 'function' ? loadHumanStigma() : null;
          if (hl && hl.legacy > 0) lines.push(`인간 유산 점수: ${hl.legacy}`);
          if (hs && hs.stigmas && hs.stigmas.length)
            lines.push(`사회적 낙인: ${hs.stigmas.map(s=>s.label||s).join(', ')}`);
        }

        return lines.length
          ? `\n[🧬 종족 시스템 현황 — ${char.race}]\n${lines.join('\n')}\n이 수치들을 서사와 NPC 반응에 반영하라. ★교차★ 표시는 메인 스토리 진행과 종족 시스템이 만나는 지점이다 — 강제하지 말고 자연스러운 타이밍에 녹여라.`
          : '';
      } catch(e) { return ''; }
    })();

    // ── [C] NPC·관계 ──────────────────────────────────────────

    const _npcRelSection = (() => {
      try {
        const lines = [];

        // NPC 성장
        const ng = window.loadNpcGrowth ? window.loadNpcGrowth() : {};
        const grown = Object.entries(ng).filter(([,v]) => v && v.level > 0)
          .map(([name,v]) => `${name}(Lv.${v.level})`);
        if (grown.length) lines.push(`성장한 NPC: ${grown.join(', ')}`);

        // NPC 타락
        const nc = typeof loadNpcCorruption === 'function' ? loadNpcCorruption() : {};
        const corrupted = Object.entries(nc).filter(([,v]) => v && v.corrupted)
          .map(([name]) => name);
        if (corrupted.length) lines.push(`타락한 NPC: ${corrupted.join(', ')} — 이들은 이제 다르게 행동한다`);

        // NPC 영감
        const ni = typeof loadNpcInspire === 'function' ? loadNpcInspire() : {};
        const inspired = Object.entries(ni).filter(([,v]) => v && v.inspired)
          .map(([name,v]) => `${name}(${v.theme || '영감'})`);
        if (inspired.length) lines.push(`영감받은 NPC: ${inspired.join(', ')}`);

        // 오프스크린 행동
        const os = typeof loadOffscreenDB === 'function' ? loadOffscreenDB() : {};
        const osLines = Object.entries(os).slice(-3).map(([name,v]) =>
          `${name}: ${v.lastAction || v.action || '활동 중'}`
        );
        if (osLines.length) lines.push(`오프스크린 NPC 행동:\n  ${osLines.join('\n  ')}`);

        return lines.length ? `\n[👥 NPC 상태 상세]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [D] 퀘스트·선택 ───────────────────────────────────────

    const _questChoiceSection = (() => {
      try {
        const lines = [];

        // 퀘스트 선택
        const qc = typeof loadQuestChoices === 'function' ? loadQuestChoices() : {};
        const qcKeys = Object.keys(qc).slice(-5);
        if (qcKeys.length) {
          const qcLines = qcKeys.map(k => `• ${k}: ${qc[k]?.choice || qc[k] || ''}`);
          lines.push(`퀘스트 선택 이력:\n${qcLines.join('\n')}`);
        }

        // 히든 퀘스트
        const hq = typeof loadHiddenQuests === 'function' ? loadHiddenQuests() : {};
        const activeHQ = Object.entries(hq).filter(([,v]) => v === 'active').map(([k]) => k);
        if (activeHQ.length) lines.push(`진행 중 히든 퀘스트: ${activeHQ.join(', ')}`);

        // 나비효과
        const bf = typeof loadButterfly === 'function' ? loadButterfly() : [];
        const majorBF = (Array.isArray(bf) ? bf : bf.effects || [])
          .filter(x => (x.impact||0) >= 2).slice(-4)
          .map(x => `• ${x.desc || x.id}: ${x.worldChange || x.effect || ''}`);
        if (majorBF.length) lines.push(`나비효과:\n${majorBF.join('\n')}`);

        // 죄와 속죄
        const sr = typeof loadSinRedemptions === 'function' ? loadSinRedemptions() : [];
        const unred = sr.filter(x => !x.redeemed);
        if (unred.length) lines.push(`속죄 못한 죄: ${unred.map(x=>x.sin||x.desc||x).join(', ')}`);

        // 처치 목록
        const kl = typeof loadKillList === 'function' ? loadKillList() : [];
        if (kl.length) lines.push(`처치한 주요 인물: ${kl.slice(-5).map(x=>x.name||x).join(', ')}`);

        // 인과 관계
        const ca = typeof loadCausality === 'function' ? loadCausality() : [];
        const activeCa = (Array.isArray(ca) ? ca : []).filter(x=>!x.resolved).slice(-3)
          .map(x=>`• ${x.cause||''} → ${x.effect||''}`);
        if (activeCa.length) lines.push(`진행 중 인과:\n${activeCa.join('\n')}`);

        return lines.length ? `\n[⚖️ 퀘스트·선택·인과]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [E] 세계·세력 ─────────────────────────────────────────

    const _worldStateSection = (() => {
      try {
        const lines = [];

        // 세계 상태
        const ws = typeof loadWorldState === 'function' ? loadWorldState() : {};
        if (ws && Object.keys(ws).length) {
          const wsStr = Object.entries(ws).slice(0,5).map(([k,v])=>`${k}:${v}`).join(', ');
          lines.push(`세계 상태: ${wsStr}`);
        }

        // 세력 시뮬레이션
        const fs = typeof loadFactionSim === 'function' ? loadFactionSim() : {};
        if (fs && fs.relations) {
          const changed = Object.entries(fs.relations)
            .filter(([,v]) => v && Math.abs(v.score||0) > 20)
            .slice(0,4).map(([k,v]) => `${k}: ${v.score > 0 ? '+' : ''}${v.score}`);
          if (changed.length) lines.push(`세력 관계 변화: ${changed.join(', ')}`);
        }

        // 왕국 상태
        const kg = typeof loadKingdom === 'function' ? loadKingdom() : null;
        if (kg && kg.founded && kg.founded.length)
          lines.push(`건국한 왕국: ${kg.founded.map(k=>k.name||k).join(', ')}`);

        // 전쟁
        const wa = typeof loadWarAction === 'function' ? loadWarAction() : null;
        if (wa && wa.active) lines.push(`진행 중 전쟁: ${wa.name || wa.id || '전쟁 중'}`);
        // [BUG FIX] wi.influence는 loadWarInfluence()의 실제 반환 구조
        // ({세력명: 숫자} 맵)에 존재하지 않는 속성이라 이 줄이 항상
        // false였다(죽은 코드). 세력 간 실제 전쟁 상태(getActiveWars)를
        // 대신 보여준다.
        if(typeof getActiveWars==='function'){
          const activeWars = getActiveWars();
          if(activeWars.length){
            lines.push(`세력 전쟁: ${activeWars.map(w=>`${w.a} ↔ ${w.b}`).join(', ')}`);
          }
        }

        // 경제
        const eco = typeof loadEconomy === 'function' ? loadEconomy() : null;
        if (eco && eco.status) lines.push(`경제 상태: ${eco.status}${eco.inflation?` (인플레: ${eco.inflation}%)`:''}` );

        // 종교
        const rel = typeof loadReligionState === 'function' ? loadReligionState() : null;
        if (rel && rel.dominant) lines.push(`지배 종교: ${rel.dominant} (신앙 강도: ${rel.strength||'보통'})`);

        // 결사 상태
        const cab = typeof loadCabalState === 'function' ? loadCabalState() : {};
        if (cab && cab.sealsDestroyed > 0)
          lines.push(`결사 봉인석 파괴: ${cab.sealsDestroyed}개`);

        // 세계 기억
        const wm = typeof loadWorldMemory === 'function' ? loadWorldMemory() : [];
        const sigWM = (Array.isArray(wm) ? wm : []).slice(-3)
          .map(x => x.event || x.desc || x);
        if (sigWM.length) lines.push(`세계가 기억하는 사건: ${sigWM.join(' / ')}`);

        return lines.length ? `\n[🌍 세계·세력 현황]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [F] 성장·능력 ─────────────────────────────────────────

    const _growthSection = (() => {
      try {
        const lines = [];

        // 스킬
        const sk = typeof loadSkills === 'function' ? loadSkills() : {};
        const topSkills = Object.entries(sk)
          .sort(([,a],[,b]) => (b.level||0)-(a.level||0))
          .slice(0,5).map(([name,v]) => `${name}(Lv.${v.level||1})`);
        if (topSkills.length) lines.push(`주요 스킬: ${topSkills.join(', ')}`);

        // 직업 숙련도
        const jm = typeof loadJobMastery === 'function' ? loadJobMastery() : {};
        const masteredJobs = Object.entries(jm).filter(([,v])=>v>=80)
          .map(([k]) => k);
        if (masteredJobs.length) lines.push(`숙련 직업: ${masteredJobs.join(', ')}`);

        // 히든 직업
        const hj = typeof loadHiddenJobs === 'function' ? loadHiddenJobs() : [];
        if (hj && hj.length) lines.push(`해금 히든 직업: ${hj.map(x=>x.name||x).join(', ')}`);

        // 혈통
        const bl = typeof loadBloodline === 'function' ? loadBloodline() : {};
        if (bl && bl.active && bl.name) lines.push(`활성 혈통: ${bl.name} — ${bl.desc||''}`);

        // 변이
        const mut = typeof loadMutation === 'function' ? loadMutation() : [];
        if (mut && mut.length) lines.push(`변이: ${(Array.isArray(mut)?mut:[]).map(x=>x.name||x).join(', ')}`);

        // 영구 보너스
        const pb = typeof loadPermStatBonus === 'function' ? loadPermStatBonus() : {};
        const pbStr = Object.entries(pb).filter(([,v])=>v>0).map(([k,v])=>`${k}+${v}`).join(', ');
        if (pbStr) lines.push(`영구 스탯 보너스: ${pbStr}`);

        return lines.length ? `\n[⬆️ 성장·능력]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [G] 회차·전생 ─────────────────────────────────────────

    const _cycleSection2 = (() => {
      try {
        const lines = [];

        // 루프 기록
        const lr = typeof loadLoopRecords === 'function' ? loadLoopRecords() : [];
        if (lr && lr.length) {
          const last = lr[lr.length-1];
          lines.push(`이전 회차(${lr.length}회차): ${last.summary || last.ending || '기록 있음'}`);
        }

        // 전생 정보
        const pl = typeof loadPastLife === 'function' ? loadPastLife() : null;
        if (pl) {
          if (pl.role) lines.push(`전생 직업: ${pl.role}`);
          if (pl.legacy) lines.push(`전생 유산: ${pl.legacy}`);
        }

        // 전생 테마
        const pt = typeof loadPastTheme === 'function' ? loadPastTheme() : null;
        if (pt && pt.theme) lines.push(`전생 핵심 테마: ${pt.theme}`);

        // 전생 편지
        const plet = typeof loadPastLetters === 'function' ? loadPastLetters() : [];
        if (plet && plet.length)
          lines.push(`전생의 편지 ${plet.length}통 — 이전 자신이 남긴 메시지`);

        // 관계 유산
        const rl = typeof loadRelLegacy === 'function' ? loadRelLegacy() : {};
        const legNpcs = Object.keys(rl).filter(k=>rl[k]>0).slice(0,3);
        if (legNpcs.length) lines.push(`관계 유산(전생 인연): ${legNpcs.join(', ')}`);

        // 회차 목표
        const cg = typeof loadCycleGoal === 'function' ? loadCycleGoal() : null;
        if (cg && cg.goal) lines.push(`이번 회차 목표: ${cg.goal}`);

        return lines.length ? `\n[🔁 회차·전생 기록]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [H] 장소·탐험 ─────────────────────────────────────────

    const _explorationSection = (() => {
      try {
        const lines = [];

        // 탐험 기록
        const ex = typeof loadExploration === 'function' ? loadExploration() : {};
        if (ex && ex.count) lines.push(`탐험 횟수: ${ex.count}`);

        // 은신처
        const ho = typeof loadHideout === 'function' ? loadHideout() : null;
        if (ho && ho.name) lines.push(`은신처: ${ho.name} (${ho.level||'기본'}단계)`);

        // 발견한 폐허
        const ru = typeof loadRuins === 'function' ? loadRuins() : [];
        const activeRuins = (Array.isArray(ru)?ru:[]).filter(x=>!x.cleared).slice(0,3)
          .map(x=>x.name||x.id||'폐허');
        if (activeRuins.length) lines.push(`미탐사 폐허: ${activeRuins.join(', ')}`);

        // 던전 상태
        const ds = typeof loadDungeonState === 'function' ? loadDungeonState() : null;
        if (ds && ds.active) lines.push(`진행 중 던전: ${ds.name || ds.id} (${ds.floor||1}층)`);

        return lines.length ? `\n[🗺️ 탐험 현황]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [I] 감정·심리 ─────────────────────────────────────────

    const _psycheSection = (() => {
      try {
        const lines = [];

        // 슬픔
        const gr = typeof loadGrief === 'function' ? loadGrief() : null;
        if (gr && gr.lostOnes && gr.lostOnes.length)
          lines.push(`잃은 존재들: ${gr.lostOnes.map(x=>x.name||x).join(', ')} (총 상실: ${gr.total||0})`);

        // 정신 오염
        const mc = typeof loadMentalCorruption === 'function' ? loadMentalCorruption() : null;
        if (mc && mc.level > 0)
          lines.push(`정신 오염: ${mc.level}단계${mc.symptoms&&mc.symptoms.length?` — ${mc.symptoms.join(', ')}`:''}`);

        // 유년기 트라우마
        const ct = typeof loadChildhoodTrauma === 'function' ? loadChildhoodTrauma() : null;
        if (ct && ct.traumas && ct.traumas.length)
          lines.push(`유년기 트라우마: ${ct.traumas.map(x=>x.desc||x).join(', ')}`);

        // 데자뷰
        const dj = typeof loadDejavu === 'function' ? loadDejavu() : null;
        if (dj && dj.count > 3) lines.push(`강한 기시감 누적: ${dj.count}회 — 루프의 흔적이 쌓이고 있다`);

        // 영혼 가면
        const sm = typeof loadSoulMasks === 'function' ? loadSoulMasks() : [];
        const activeMask = (Array.isArray(sm)?sm:[]).find(x=>x.active);
        if (activeMask) lines.push(`현재 페르소나: ${activeMask.name||activeMask.mask||'가면 착용 중'}`);

        return lines.length ? `\n[🧠 심리 상태]\n${lines.join('\n')}\n이 심리 상태가 대화·행동·선택에 자연스럽게 배어나오게 하라.` : '';
      } catch(e) { return ''; }
    })();

    // ── [J] 인벤토리·장비 ────────────────────────────────────

    const _inventorySection = (() => {
      try {
        const lines = [];

        // 골드
        const gold = typeof loadGold === 'function' ? loadGold() : 0;
        if (gold > 0) lines.push(`보유 골드: ${gold.toLocaleString()}`);

        // 장착 아이템
        const eq = typeof loadEquipped === 'function' ? loadEquipped() : {};
        const eqItems = Object.values(eq).filter(x=>x && x.name).map(x=>x.name);
        if (eqItems.length) lines.push(`장착 중: ${eqItems.join(', ')}`);

        // 영혼 무기
        const sw = typeof loadSoulWeapon === 'function' ? loadSoulWeapon() : null;
        if (sw && sw.name) lines.push(`영혼 무기: ${sw.name} (${sw.level||1}단계, ${sw.personality||''})`);

        // 주요 소지품 (상위 5개)
        const inv = typeof loadInventory === 'function' ? loadInventory() : [];
        const keyItems = (Array.isArray(inv)?inv:[])
          .filter(x => x.rarity === 'primal' || x.rarity === 'epic' || x.rarity === 'legendary' || x.key)
          .slice(0,5).map(x=>x.name);
        if (keyItems.length) lines.push(`주요 아이템: ${keyItems.join(', ')}`);

        return lines.length ? `\n[🎒 장비·소지품]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── [K] 기타 (예언·달력·언어·별자리) ─────────────────────

    const _miscSection = (() => {
      try {
        const lines = [];

        // 예언
        const pr = typeof loadProphecies === 'function' ? loadProphecies() : [];
        const activePr = (Array.isArray(pr)?pr:[]).filter(x=>!x.fulfilled).slice(0,3)
          .map(x=>x.content||x.desc||x.text||x);
        if (activePr.length) lines.push(`미완성 예언: ${activePr.join(' / ')}`);

        // 꿈 예언
        const dp = typeof loadDreamProphecies === 'function' ? loadDreamProphecies() : [];
        if (dp && dp.length) lines.push(`최근 꿈 예언: ${dp[dp.length-1]?.content||dp[dp.length-1]||''}`);

        // 언어
        const lang = typeof loadLanguages === 'function' ? loadLanguages() : {};
        const knownLangs = Object.keys(lang).filter(k=>lang[k]>=50);
        if (knownLangs.length) lines.push(`구사 가능 언어: ${knownLangs.join(', ')}`);

        // 별자리
        const cons = typeof loadConstellation === 'function' ? loadConstellation() : null;
        if (cons && cons.sign) lines.push(`운명 별자리: ${cons.sign} (${cons.effect||''})`);

        // 달 위상
        const moon = typeof loadMoonPhase === 'function' ? loadMoonPhase() : null;
        if (moon && moon.phase) lines.push(`달 위상: ${moon.phase} — ${moon.effect||''}`);

        // 요약
        const sum = typeof loadSummaries === 'function' ? loadSummaries() : [];
        if (sum && sum.length) {
          const last = sum[sum.length-1];
          lines.push(`이전 내용 요약: ${(last.summary||last.content||'').slice(0,100)}`);
        }

        // 나머지 5개 추가
        const ar = typeof loadArtifactShards === 'function' ? loadArtifactShards() : [];
        if (ar && ar.length) lines.push(`유물 파편: ${ar.map(x=>x.name||x).join(', ')}`);

        const cr = typeof loadClearRewards === 'function' ? loadClearRewards() : [];
        if (cr && cr.length) lines.push(`클리어 보상 획득: ${cr.length}개`);

        const js = typeof loadJobSynergy === 'function' ? loadJobSynergy() : [];
        if (js && js.length) lines.push(`직업 시너지: ${js.map(x=>x.name||x).join(', ')}`);

        const prel = typeof loadPastRelics === 'function' ? loadPastRelics() : [];
        if (prel && prel.length) lines.push(`전생 유물: ${prel.map(x=>x.name||x).join(', ')}`);

        const rc = typeof loadRace === 'function' ? loadRace() : null;
        if (rc && rc !== char.race) lines.push(`변환된 종족: ${rc}`);

        return lines.length ? `\n[📌 기타 정보]\n${lines.join('\n')}` : '';
      } catch(e) { return ''; }
    })();

    // ── 동료 시너지 버프 ──
    const companionBuffs = getCompanionBuffs();
    const companionSysSection = companionBuffs.length > 0 ? `\n[👥 동료 시너지] 성장한 동료들의 지원: ${companionBuffs.map(s=>`${s.icon}${s.name}(${s.desc})`).join(", ")}` : "";

    // ── 직업 조합 시너지 ──
    const prevJobs = char.pastLifeRole ? [char.pastLifeRole] : [];
    const synergies = checkJobSynergy(char.role, prevJobs, char.race||"");
    const synergySysSection = synergies.length > 0 ? `\n[⚡ 직업 조합 시너지 — ${synergies.map(s=>`${s.icon}${s.name}`).join("/")}] ${synergies.map(s=>s.aiHint).join(" / ")}` : "";

    // ── 속성 상성 시스템 ──
    const _myElem = getCharElement();
    const _myElemDef = ELEMENT_DEFS[_myElem];
    const _elemTable = AFFINITY_TABLE[_myElem] || {strong:[],weak:[]};
    const affinitySection = _myElemDef ? `\n[⚗️ 속성 상성] 주인공 속성: ${_myElemDef.icon}${_myElemDef.name} — 효과 탁월(×1.5): ${_elemTable.strong.map(e=>ELEMENT_DEFS[e]?.icon+(ELEMENT_DEFS[e]?.name||e)).join(', ')||'없음'} / 효과 미미(×0.6): ${_elemTable.weak.map(e=>ELEMENT_DEFS[e]?.icon+(ELEMENT_DEFS[e]?.name||e)).join(', ')||'없음'}\n전투·마법 장면에서 속성 상성에 따라 피해 배율과 극적 효과(탁월한 상성: 화려한 폭발적 묘사, 불리한 상성: 충격 흡수·저항 묘사)를 반영하십시오.` : "";

    // ── 종족 전용 콘텐츠 ──
    const raceContent = getRaceContent(char.race);
    const raceContentSection = raceContent ? `\n[🏛️ 종족 전용 콘텐츠] ${raceContent.event} ${raceContent.npcReact}` : "";

    // ── 종족 로어 맞춤 서사 규칙 (v46) ──
    const raceStorySection = (() => {
      if (!char.race || typeof RACE_STORY_RULES === 'undefined') return '';
      const raceKey = Object.keys(RACE_STORY_RULES).find(k =>
        char.race.toLowerCase().includes(k) || k.includes(char.race.toLowerCase())
      );
      if (!raceKey) return '';
      const rule = RACE_STORY_RULES[raceKey];
      if (!rule) return '';

      const mqStarted = mqState['mq1'] === 'active' || mqState['mq1'] === 'complete';
      const lines = [];

      // 파편 조우 방식 — mq1 미시작 시
      if (!mqStarted) {
        lines.push(`[🔮 ${char.race} — 파편 조우 방식] ${rule.fragmentEncounter}`);
      }

      // 퀘스트 진입 경로
      if (!mqStarted) {
        lines.push(`[🗺️ ${char.race} — 퀘스트 진입 경로] ${rule.questEntryStyle}`);
      }

      // NPC 반응 (항상)
      const reactions = Object.entries(rule.npcReactions || {})
        .map(([npc, reaction]) => `${npc}: ${reaction}`)
        .join(' / ');
      if (reactions) {
        lines.push(`[👥 ${char.race} — NPC 반응] ${reactions}`);
      }

      // 종족 고유 서사 지침 (항상)
      if (rule.uniqueNarrative) {
        lines.push(`[📖 ${char.race} — 서사 지침] ${rule.uniqueNarrative}`);
      }

      // 금기 (항상)
      if (rule.forbiddenByLore) {
        lines.push(`[🚫 ${char.race} — 로어 금기] ${rule.forbiddenByLore}`);
      }

      // 🩸 뱀파이어 전용 — 피의 연대기 현황
      if (/뱀파이어|혈종|혈군|혈통 왕/.test(char.race || '')) {
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

    // ── 히든 퀘스트 ──
    const _atm2 = loadAtmosphere();
    const hiddenQuestData = { karmaScore: char.karmaScore||50, timeOfDay: _atm2.timeOfDay, cycle: loadCycleCount(), race: char.race||"", scenario: char.scenario||"", madness: char.stats?.mad||0, factionGauges: (typeof loadFactionGauge==='function' ? (loadFactionGauge().gauges||{}) : {}) };
    const availableHiddenQuests = getAvailableHiddenQuests(hiddenQuestData);
    // 조건 충족 시 자동 활성화 (status:'active'로 저장)
    availableHiddenQuests.forEach(q => activateHiddenQuest(q.id));
    const hiddenQuestSection = availableHiddenQuests.length > 0 ? `\n[🔍 히든 퀘스트 가능] 현재 조건에서 숨겨진 의뢰가 활성화됩니다: ${availableHiddenQuests.map(q=>`${q.icon}${q.name}(${q.conditionDesc})`).join(", ")} — 서사 중 자연스럽게 해당 퀘스트로 연결되는 복선을 심어두십시오.` : "";

    // ── NPC 대화 의뢰 시스템 프롬프트 ──────────────────────
    const npcDlgActiveQ = (typeof loadNpcDlgQuests==='function') ? loadNpcDlgQuests().filter(q=>q.status==='active') : [];
    const npcDlgQSection = npcDlgActiveQ.length > 0 ? `\n[💬 NPC 대화 의뢰 진행 중] ${npcDlgActiveQ.map(q=>`• ${q.npcIcon}${q.npcName}의 의뢰: [${q.icon}${q.title}] ${q.desc} (완료 키워드: ${(q.completeKeywords||[]).join('·')}) — ${q.aiHint||''}`).join('\n')} — 위 의뢰를 서사에 자연스럽게 반영하고, 완료 키워드가 등장하면 성공적으로 마무리하십시오.` : "";

    // ── 의뢰소(용병/정보상/도적/암살자 고용) 섹션 ──
    const contractSection = (typeof getContractSection==='function') ? getContractSection() : "";
    // ── 상단(교역 부대 운영) 섹션 ──
    const caravanSection = (typeof getCaravanSection==='function') ? getCaravanSection() : "";
    // ── 농장(파종/수확/매점매석/일꾼/계약) 섹션 ──
    const farmSection = (typeof getFarmSection==='function') ? getFarmSection() : "";
    // ── 농부 확장(가축/육종/축제) 섹션 ──
    const farmExtrasSection = (typeof getFarmExtrasSection==='function') ? getFarmExtrasSection() : "";
    // ── 묘역(관리/도굴/영혼인도) 섹션 ──
    const graveSection = (typeof getGraveSection==='function') ? getGraveSection() : "";
    // ── 길드 가입/등급 섹션 ──
    const myGuildSection = (typeof getGuildSection==='function') ? getGuildSection() : "";
    // ── 항해(선박/출항/해상이벤트) 섹션 ──
    const voyageSection = (typeof getVoyageSection==='function') ? getVoyageSection() : "";
    // ── 육지 월드맵(여행/인카운터) 섹션 ──
    const worldMapSection = (typeof getWorldMapSection==='function') ? getWorldMapSection() : "";
    // ── 공방(주문제작/직공/납품) 섹션 ──
    const workshopSection = (typeof getWorkshopSection==='function') ? getWorkshopSection() : "";
    // ── 네트워크(음유시인/상인) 섹션 ──
    const networkSection = (typeof getNetworkSection==='function') ? getNetworkSection() : "";

    // 1번: 전생 기억 파편 섹션
    const frags = loadMemoryFragments();
    const fragSection = frags.length > 0 ? `\n[💭 전생 기억 파편]\n${frags.slice(-3).map(f=>f.text).join("\n")}` : "";
    // 2번: 전생 인연 (pastLife intimateNpcs)
    const intimateNpcs = (char.pastLifeIntimateNpcs || []);
    const intiSection = intimateNpcs.length > 0 ? `\n[💞 전생 인연] 다음 NPC들은 이전 생에 깊은 인연이 있었습니다. 첫 만남이지만 왠지 모를 친근함을 느낍니다: ${intimateNpcs.join(", ")}` : "";
    // 8번: 명성 이월
    const fameLeg = loadFameLegacy();
    const fameSection = fameLeg && fameLeg.type !== "neutral" ? `\n[${fameLeg.type==="hero"?"🌟":"💀"} 전생의 소문] 전생에서 ${fameLeg.characterName||"이 영혼"}의 소문이 퍼져있습니다. NPC들은 처음 만나도 ${fameLeg.type==="hero"?"호감":"두려움"}을 갖고 대합니다. (${fameLeg.label})` : "";
    // 6번: 영혼 각인 무기
    const soulWpn = loadSoulWeapon();
    const soulWpnSection = soulWpn ? `\n[⚔️ 영혼 각인] 전생에서 가장 많이 쓰던 ${soulWpn.name}. ${soulWpn.desc}` : "";

    // 11번: 금지 스킬 해금 알림
    const forbiddenSkills11 = getUnlockedForbiddenSkills();
    const forbiddenSection = forbiddenSkills11.length > 0 ? `\n[🔓 금지 스킬 해금] 특수 조건으로 해금된 금지 스킬이 있습니다: ${forbiddenSkills11.map(s=>`${s.icon}${s.name}(${s.desc})`).join(", ")}. 사용 시 강렬하게 묘사하십시오.` : "";

    // 12번: 나비효과
    const butterflies = loadButterfly();
    const butterflySection = butterflies.length > 0 ? `\n[🦋 나비효과] 전생의 선택이 세계에 흔적을 남겼습니다:\n${butterflies.map(b => b.desc ? `${b.desc}${b.worldChange?' — '+b.worldChange:''}` : (BUTTERFLY_EFFECTS[b.type]?.aiHint?.(b.data) || "")).filter(Boolean).join("\n")}` : "";

    // 14번: 죽는 방식 보상
    const deathBonuses14 = getActiveDeathBonuses();
    const deathBonusSection = deathBonuses14.length > 0 ? `\n[💀 전생 사망 유산] ${deathBonuses14.map(d=>`${d.name}: ${d.desc}`).join(" / ")}. 이 경험이 캐릭터의 신체와 감각에 자연스럽게 반영됩니다.` : "";

    // 15번: 트라우마 면역
    const traumaImmune15 = getTraumaImmunities();
    const traumaSection = traumaImmune15.length > 0 ? `\n[🛡️ 트라우마 면역] 반복된 경험으로 면역 획득: ${traumaImmune15.map(t=>`${t.icon}${t.label}(${t.immunity})`).join(", ")}. 해당 상황에서 두려움 없이 행동합니다.` : "";

    // 16번: 라스트 워드 오프닝
    const lastWord16 = loadLastWord();
    const lastWordSection = lastWord16 ? `\n[💬 전생의 마지막 말] "${lastWord16.text}" — ${LAST_WORD_OPENINGS[lastWord16.tone] || ""}` : "";

    // 17번: 메타 지식
    const metaKnowledge17 = getMetaKnowledgeHints();
    const metaSection = metaKnowledge17.length > 0 ? `\n[💡 전생의 메타 지식] 이전 생에서 얻은 정보들이 있습니다. 관련 상황 발생 시 "어디선가 본 듯한 느낌이 든다" 같은 선택지를 추가하십시오: ${metaKnowledge17.slice(-5).map(m=>`[${m.type}]${m.keyword}(${m.hint})`).join(", ")}` : "";

    // 18번: 혈통 진화
    const evolvedRace18 = char.race ? getEvolvedRace(char.race) : null;
    const bloodlineSection = evolvedRace18?.isEvolved ? `\n[🧬 혈통 진화] ${char.race}에서 ${evolvedRace18.name}으로 진화. 종족 특성이 강화되어 있으며 종족 관련 묘사를 더욱 강렬하게 표현하십시오.` : "";

    // 19번: 운명의 변수
    const fateRes19 = getFateResistance();
    const fateSection = fateRes19 ? `\n[⚡ 운명의 저항 Lv.${fateRes19.level}] ${fateRes19.desc} 예상치 못한 방해와 변수를 적절히 삽입하여 도전적인 서사를 만드십시오.` : "";

    // 20번: 전생 지도
    const exploredMaps20 = getExploredLocations(char.scenario);
    const exploredSection = exploredMaps20.length > 0 ? `\n[🗺️ 전생 탐험 기록] 이전 생에서 방문한 장소들: ${exploredMaps20.map(m=>m.name).join(", ")}. 이 장소들에서 "낯익다"는 느낌이나 보너스 정보를 제공하십시오.` : "";

    // 21번: 관계 유산
    const relLegacies21 = getRelationshipLegacies();
    const relLegacySection = relLegacies21.length > 0 ? `\n[💞 관계 유산] 전생의 인연이 영혼에 새겨져 있습니다. 해당 이름의 NPC 등장 시 즉시 반영하십시오:\n${relLegacies21.map(r => REL_LEGACY_HINTS[r.bond]?.(r.npcName, r.depth) || "").filter(Boolean).join("\n")}` : "";

    // 22번: 세계관 기억
    const worldSecrets22 = getWorldSecrets(char.scenario);
    const worldSecretSection = worldSecrets22.length > 0 ? `\n[🔍 세계관 기억] 전생에서 발견한 세계의 비밀들:\n${worldSecrets22.map(s => `• ${s.title}: ${s.hint}`).join("\n")}\n이 비밀들을 암시하는 장면이나 대사를 자연스럽게 삽입하십시오.` : "";

    // 23번: 능력 각인
    const imprintedAbs23 = getImprintedAbilities();
    const abilityImprintSection = imprintedAbs23.length > 0 ? `\n[⚡ 능력 각인] 전생에서 극한까지 단련한 능력이 이번 생에 타고난 재능으로 발현:\n${imprintedAbs23.map(a => { const def = ABILITY_IMPRINT_LABELS[a.statId]; return def ? `${def.name} (Tier ${a.tier}): ${def.desc}` : ""; }).filter(Boolean).join("\n")}` : "";

    // 24번: 원한의 추적자
    const grudges24 = getActiveGrudges();
    const grudgeSection = grudges24.length > 0 ? `\n[💀 원한의 추적자] 전생에서 쓰러뜨린 강적들의 원한이 남아있습니다. 적절한 시점에 복수자로 등장시키십시오:\n${grudges24.map(g => `• ${g.name} (위협도 ${g.power}성) — 전생 시나리오: ${g.scenario||"불명"}`).join("\n")}` : "";

    // 25번: 시간의 메아리
    const timeEchoes25 = getTimeEchoes();
    const timeEchoSection = timeEchoes25.length > 0 ? `\n[🔔 시간의 메아리] 과거 회차의 중요한 말들이 메아리처럼 울립니다. 감정적으로 유사한 장면에서 이 대사들을 환청처럼 묘사하십시오:\n${timeEchoes25.slice(-3).map(e => `• "${e.text}" — ${e.speaker} (${e.emotion||"무감정"})`).join("\n")}` : "";

    // 26번: 운명의 선택 기록
    const fateChoices26 = getFateChoices(char.scenario);
    const fateChoiceSection = fateChoices26.length > 0 ? `\n[🔀 운명의 선택 기록] 전생에서 했던 선택들입니다. 동일하거나 유사한 분기점 등장 시 "전에 이 길을 선택한 적이 있다"는 선택지를 추가하십시오:\n${fateChoices26.filter(c=>c.outcome!=="neutral").slice(-5).map(c => `• ${c.description} → 결과: ${c.outcome==="good"?"긍정적":"부정적"}`).join("\n")}` : "";

    // 27번: 신의 시선
    const divineGaze27 = getDivineGazeStatus();
    const divineGazeSection = divineGaze27 ? `\n[${divineGaze27.icon} ${divineGaze27.label}] ${divineGaze27.desc} 이번 회차에서 신적 존재의 암시나 기적적 개입을 서사에 자연스럽게 삽입하십시오.` : "";

    // 28번: 저주 계보
    const curseMasteries28 = getCurseMasteries();
    const curseMasterySection = curseMasteries28.length > 0 ? `\n[🌑 저주 숙달] 반복된 저주를 통해 습득한 능력:\n${curseMasteries28.map(c => { const def = CURSE_TYPE_DEFS[c.type]; return def ? `• ${def.name} 숙달 (${c.count}회): ${def.mastery}` : ""; }).filter(Boolean).join("\n")}` : "";

    // 29번: 전생의 기도
    const prayerStatus29 = getPastPrayerStatus();
    const prayerSection = prayerStatus29 && prayerStatus29.available ? `\n[🙏 전생의 기도] 회차당 1회, 극한 위기에서 전생의 기억에 기도할 수 있습니다. 플레이어가 "기도한다" 또는 "전생에 빌다" 등의 행동을 하면 ${prayerStatus29.power} 수준의 전생 기억 계시로 위기를 극복할 힌트를 제공하십시오. 발동 시 반드시 극적이고 감동적으로 묘사하십시오.` : (prayerStatus29 && !prayerStatus29.available ? `\n[🙏 전생의 기도 — 소진] 이번 회차에 이미 전생에 기도했습니다.` : "");

    // 30번: 운명의 수레바퀴
    const greatCycle30 = getGreatCycleStatus();
    const greatCycleSection = greatCycle30 ? `\n[⚙️ 운명의 수레바퀴 — ${greatCycle30.greatCycles}대순환] 위대한 순환이 ${greatCycle30.greatCycles}번 완성되었습니다.\n해금 보상: ${greatCycle30.unlockedRewards.join(" / ")}\n이 영웅은 수많은 삶을 거쳐온 운명의 중심입니다. 서사의 규모와 감동을 평소보다 훨씬 크게 묘사하십시오.` : "";

    // 31번: 평행세계 조우
    const parallelSelf31 = getParallelSelfEncounter();
    const parallelSelfSection = parallelSelf31 ? `\n[🌀 평행세계 조우] 전생 중 다른 회차의 자신(${parallelSelf31.name} · ${parallelSelf31.role})의 환영과 접촉한 기억이 있습니다. 그 자신은 「${parallelSelf31.keySkill || "알 수 없는 기술"}」을 사용했습니다. 깊은 명상이나 꿈, 또는 강렬한 위기 상황에서 이 평행 자아의 환영이 나타나 조언하거나 대결을 신청할 수 있습니다.` : "";

    // 32번: 저주의 고리
    const curseRings32 = getActiveCurseRings();
    const curseRingSection = curseRings32.length > 0 ? `\n[🔗 저주의 고리] 반복된 행동 패턴이 저주로 굳어졌습니다:\n${curseRings32.map(r => `• ${r.icon}${r.label} (${r.count}회 반복, Lv.${r.penaltyLevel}): ${r.penalty}`).join("\n")}\n이 행동 패턴을 반복하면 AI가 자연스럽게 불리한 상황을 연출하십시오.` : "";

    // 33번: 회차 통계
    const stats33 = getCycleStatsSummary();
    const statsSection = stats33.totalCycles >= 2 ? `\n[📊 회차 통계] 총 ${stats33.totalCycles}회차, 누적 사망 ${stats33.totalDeaths}회, 총 대화 ${stats33.totalTurns}턴${stats33.topEnemy ? `, 최다 처치: ${stats33.topEnemy.name}(${stats33.topEnemy.count}회)` : ""}${stats33.topScenario ? `, 선호 세계관: ${stats33.topScenario.name}` : ""}. 이 데이터를 바탕으로 캐릭터의 전투 본능과 습관을 서사에 자연스럽게 반영하십시오.` : "";

    // 34번: 부상 흔적
    const injuryEffects34 = getInjuryEffects();
    const injurySection = injuryEffects34.length > 0 ? `\n[🩹 부상 흔적] 전생의 부상이 이번 생에 흔적을 남겼습니다:\n${injuryEffects34.map(i => `• ${i.icon}${i.label}: ${i.desc}`).join("\n")}\n해당 신체 부위가 사용되는 장면에서 자연스럽게 이 효과를 반영하십시오.` : "";

    // 35번: 전생 테마
    const pastTheme35 = getPastTheme();
    const pastThemeSection = pastTheme35 ? `\n[🎭 전생 테마 — ${pastTheme35.label}] ${pastTheme35.openingLine} 전반적인 서사 톤을 「${pastTheme35.openingMood}」 분위기로 유지하십시오.` : "";

    // 36번: 기억 왜곡
    const memDistort36 = getMemoryDistortStatus();
    const memDistortSection = memDistort36 && memDistort36.falseMemories.length > 0 ? `\n[🌫️ 기억 왜곡] 전생 기억의 정확도가 「${memDistort36.accuracy}」 상태입니다. 다음 잠재적 오기억을 가끔 암시하십시오:\n${memDistort36.falseMemories.map(m => `• ${m}`).join("\n")}\n플레이어가 전생 기억에 의존해 행동할 때 미묘하게 틀릴 수 있다는 가능성을 서술에 반영하십시오.` : "";

    // 37번: 전생 나이의 역설
    const ageParadox37 = getAgeParadoxBonus();
    const ageParadoxSection = ageParadox37 ? `\n[⌛ 나이의 역설 — ${ageParadox37.label}] ${ageParadox37.desc} ${ageParadox37.bonusDesc}. 이 캐릭터는 나이에 걸맞지 않는 성숙함이나 직감을 보여주십시오.` : "";

    // 38번: 소환수 계승
    const summonLegacies38 = getSummonLegacies();
    const summonLegacySection = summonLegacies38.length > 0 ? `\n[🐾 소환수의 기억] 전생에서 함께했던 소환수들이 이번 생의 세계 어딘가에 살고 있습니다:\n${summonLegacies38.map(s => `• ${s.name}(${s.type}) — 유대 ${s.bond}/10, ${s.appearances}회 동행`).join("\n")}\n이 소환수들은 야생에서 캐릭터를 알아보거나 특별한 반응을 보일 수 있습니다. 유대가 높을수록 재계약 가능성이 높습니다.` : "";

    // 39번: 원한 무기
    const grudgeWeapons39 = getGrudgeWeapons();
    const grudgeWeaponSection = grudgeWeapons39.length > 0 ? `\n[⚔️ 원한 무기] 전생에서 나를 죽인 무기·기술들이 이번 생에 사용 가능한 형태로 어딘가에 존재합니다:\n${grudgeWeapons39.map(w => `• 「${w.weaponName}」(${w.killerName}에게 당함, ${w.times}회, 위력 Lv.${w.power})`).join("\n")}\n이 무기·기술을 입수할 기회를 자연스럽게 서사에 배치하십시오. 사용 시 특별히 강렬하게 묘사하십시오.` : "";

    // 40번: 세계수 성장
    const worldTree40 = getWorldTreeStatus();
    const worldTreeSection = worldTree40.level > 0 ? `\n[🌳 세계수 성장 — ${worldTree40.stage.icon}${worldTree40.stage.label}] ${worldTree40.stage.desc}${worldTree40.stage.bonus ? `\n보너스: ${worldTree40.stage.bonus}` : ""}\n세계가 회차를 거듭하며 복원되고 있습니다. 이를 배경 서술에 자연스럽게 녹여 세계의 희망이 커지고 있음을 표현하십시오.` : "";

    // 41번: 꿈의 예언
    const dreamProphecies41 = getDreamProphecies();
    const dreamSection = dreamProphecies41.length > 0 ? `\n[🌙 꿈의 예언] 전생의 꿈이 예언으로 남아있습니다:\n${dreamProphecies41.map(d => `• ${d.icon}${d.keyword}의 꿈 (${d.count}회): ${d.prophecy}`).join("\n")}\n플레이어가 잠들거나 명상하는 장면에서 이 예언 이미지를 자연스럽게 삽입하고, 해당 예언 상황이 실제로 전개될 때 특별히 극적으로 묘사하십시오.` : "";

    // 42번: 유산 건축
    const legacyBuildings42 = getLegacyBuildings();
    const legacyBuildingSection = legacyBuildings42.length > 0 ? `\n[🏛️ 유산 건축] 전생에 세운 건물·거점의 흔적이 세계에 남아있습니다:\n${legacyBuildings42.map(b => `• ${b.icon}${b.name}(${b.label}, ${b.count}회): ${b.ruinDesc} → ${b.bonus}`).join("\n")}\n이 장소들을 서사 속 폐허·전설·지역명으로 자연스럽게 등장시키십시오.` : "";

    // 43번: 감시자의 눈
    const watchers43 = getWatchers();
    const watcherSection = watchers43.length > 0 ? `\n[👁️ 감시자의 눈] 전생에서 싸웠던 강적들이 플레이어의 혼을 기억하고 강화되어 재등장할 수 있습니다:\n${watchers43.map(w => `• ${w.name} (조우 ${w.encounters}회, 위력 Lv.${w.power}${w.evolved ? " ★진화형" : ""})`).join("\n")}\n이 적들이 재등장 시 반드시 이전보다 강해졌음을 명시하고, 플레이어를 알아보는 장면을 극적으로 연출하십시오.` : "";

    // [신규] 몬스터 도감 — 재료가 연결된 기존 몬스터 재사용 유도
    const dynBestiarySection = (typeof getDynBestiarySection==='function') ? getDynBestiarySection() : "";

    // 44번: 영혼의 가면
    const soulMasks44 = getSoulMasks();
    const soulMaskSection = soulMasks44.length > 0 ? `\n[🎭 영혼의 가면] 전생에서 익힌 역할이 변장 능력으로 이월되었습니다:\n${soulMasks44.map(m => `• ${m.icon}${m.masquerade} (숙련도 ${m.mastery}/5): ${m.bonus}`).join("\n")}\n플레이어가 이 역할로 변장하거나 행동할 때 자연스럽게 성공하도록 서술하십시오.` : "";

    // 45번: 감정의 파문
    const emotionRipples45 = getEmotionRipples();
    const emotionRippleSection = emotionRipples45.length > 0 ? `\n[🌊 감정의 파문] 전생의 극단적 감정이 세계에 파문을 남겼습니다:\n${emotionRipples45.map(r => `• ${r.icon}${r.label} (강도 ${r.intensity}/5): ${r.worldEffect} → ${r.bonus}`).join("\n")}\n세계 분위기 묘사 시 이 파문의 영향을 자연스럽게 반영하십시오.` : "";

    // 46번: 유언장
    const testaments46 = getTestaments();
    const testamentSection = testaments46.length > 0 ? `\n[📜 유언장] 전생에 남긴 유언이 세계 어딘가에 존재합니다:\n${testaments46.slice(-2).map(t => `• ${t.icon}${t.label}(${t.characterName}): ${t.hint}`).join("\n")}\n폐허, 도서관, NPC 대화 등을 통해 이 유언이 발견되는 이벤트를 자연스럽게 배치하십시오.` : "";

    // 47번: 숙명의 별자리
    const constellation47 = getConstellation();
    const constellationSection = constellation47 ? `\n[${constellation47.icon} 숙명의 별자리 — ${constellation47.name}(${constellation47.trait})] ${constellation47.bonus}\n⚠️ 경고: ${constellation47.challenge}\n이번 회차 내내 이 별자리의 특성이 운명처럼 작용합니다. 서사 전반에 자연스럽게 반영하십시오.` : "";

    // 48번: 탐험가의 유산
    const explorerMap48 = getExplorerMap();
    const explorerMapSection = explorerMap48.length > 0 ? `\n[🗺️ 탐험가의 유산] 전생에 발견한 장소의 기억이 남아있습니다:\n${explorerMap48.map(l => `• ${l.icon}${l.label}: ${l.desc} → ${l.bonus}`).join("\n")}\n해당 장소 유형이 등장하는 장면에서 캐릭터가 본능적으로 길을 알거나 유리한 위치를 선점할 수 있도록 하십시오.` : "";

    // 49번: 번개 각인
    const lightningImprints49 = getLightningImprints();
    const lightningImprintSection = lightningImprints49.length > 0 ? `\n[⚡ 번개 각인] 전생의 가장 극적인 순간이 본능으로 각인되었습니다:\n${lightningImprints49.map(i => `• ${i.icon}${i.label} (위력 ${i.power}/5): ${i.bonus}`).join("\n")}\n각인된 상황이 발생하면 반드시 특별한 본능 발동 연출로 묘사하십시오.` : "";

    // 50번: 전생의 일출
    const dawn50 = getDawnStatus();
    const dawnSection = dawn50.stage > 0 ? `\n[${dawn50.stageData.icon} 전생의 일출 — ${dawn50.stageData.label}] ${dawn50.stageData.desc}${dawn50.stageData.worldBonus ? `\n세계 보너스: ${dawn50.stageData.worldBonus}` : ""}\n${dawn50.stage >= 5 ? "세계에 완전한 여명이 밝았습니다. 이 회차는 전설의 완성이 될 수 있습니다. 서사의 스케일과 감동을 최고조로 끌어올리십시오." : "세계가 조금씩 밝아오고 있습니다. 희망의 기운을 배경 묘사에 담아내십시오."}` : "";

    // ── 51번: 별자리 운세 — 모든 세계관, 1회차+ ──
    const starSign51 = getStarSign();
    const starSignSection = (starSign51 && _cycle >= 1) ? `\n[${starSign51.icon} 별자리 운세 — ${starSign51.name}(${starSign51.trait})] ${starSign51.bonus}\n⚠️ 약점: ${starSign51.penalty}\n이번 생의 운명적 별자리입니다. 해당 특성이 모든 상황에서 자연스럽게 작용하도록 서사에 녹여내십시오.` : "";

    // ── 52번: 전생어 — 3회차+, 중후반 ──
    const pastLang52 = getPastLanguage();
    const pastLangSection = (pastLang52 && pastLang52.phrases && pastLang52.phrases.length > 0 && _cycle >= 3) ? `\n[🗣️ 전생어 해금 — Lv.${pastLang52.level}] 전생의 영혼이 기억하는 고대 언어를 구사할 수 있습니다:\n${pastLang52.phrases.slice(-3).map(p => `• "${p.phrase}" (${p.meaning}) → ${p.trigger}`).join("\n")}\n플레이어가 이 언어를 사용하는 장면에서 해당 효과를 극적으로 발동시키십시오.` : "";

    // ── 53번: 가면 시스템 — 로그/암살/외교 직업 우선, 모든 세계관 ──
    const identities53 = getIdentityVault();
    const polishedIds = identities53.filter(i => i.polished);
    const identitySection = (polishedIds.length > 0 && (isRogueRole || isLeaderRole || _cycle >= 2)) ? `\n[🎭 완성된 신분 금고] 전생에서 숙달된 위장 신분들:\n${polishedIds.map(i => `• ${i.icon}${i.label}(${i.alias || i.label}) — ${i.bonus}`).join("\n")}\n플레이어가 이 신분을 꺼낼 때 즉각적이고 자연스러운 신분 전환을 묘사하십시오.` : "";

    // ── 54번: 차원 균열 — 5회차+, 중후반 이상 ──
    const rift54 = getRiftStatus();
    const riftSection = (rift54 && rift54.available && _cycle >= 5) ? `\n[${rift54.nextRift.icon} 차원 균열 — ${rift54.nextRift.label}] ${rift54.nextRift.desc}\n잠재 획득물: ${rift54.nextRift.loot} / 조우 NPC: ${rift54.nextRift.npc}\n극적으로 긴장이 고조된 순간 이 균열이 잠깐 열릴 수 있습니다. 등장 시 이계의 분위기를 생생하게 묘사하십시오.` : "";

    // ── 55번: 연금술 누적 — 마법 직업/엘프/드워프 우선, 3회차+ ──
    const recipeBook55 = getRecipeBook();
    const topTier = recipeBook55.length > 0 ? recipeBook55[recipeBook55.length - 1] : null;
    const recipeSection = (topTier && (isMagicRole || isElf || isDwarf || _cycle >= 3)) ? `\n[${topTier.icon} 레시피북 — ${topTier.label}] 전생에서 축적된 제조 지식:\n${topTier.recipes.slice(0, 3).map(r => `• ${r}`).join(", ")} 등 ${topTier.recipes.length}종\n플레이어가 재료를 구하거나 제조를 시도할 때 이 지식을 활용해 성공 가능성을 높이십시오.` : "";

    // ── 56번: 전생 목표 달성률 — 모든 세계관, 1회차+ ──
    const achBonus56 = getLastAchievementBonus();
    const achSection = (achBonus56 && _cycle >= 1) ? `\n[${achBonus56.icon} 전생 달성률 — ${achBonus56.label}(${achBonus56.rate}%)]${achBonus56.bonus ? ` 보너스: ${achBonus56.bonus}` : ""}${achBonus56.penalty ? ` 페널티: ${achBonus56.penalty}` : ""}\n이 달성률의 여파가 이번 회차 시작 분위기와 NPC 반응에 자연스럽게 배어나오도록 하십시오.` : "";

    // ── 57번: 인연의 꽃 — 모든 세계관, 1회차+ ──
    const romanceLeg57 = getRomanceLegacy();
    const topRomance = romanceLeg57.length > 0 ? romanceLeg57.sort((a,b) => b.depth - a.depth)[0] : null;
    const romanceSection = (topRomance && _cycle >= 1) ? `\n[${topRomance.fate.icon} 인연의 꽃 — ${topRomance.npcName}(${topRomance.fate.label})] 전생에서 깊은 인연을 맺은 자가 이번 생에도 나타날 것입니다.\n첫 만남 연출: "${topRomance.fate.firstMeet}"\n이 NPC가 등장할 때 위 묘사를 자연스럽게 사용하고, 초기 호감도를 ${topRomance.fate.bond}으로 시작하십시오.` : "";

    // ── 58번: 사냥 기록 — 전사/도적 직업 우선, 모든 세계관 ──
    const bestiary58 = getFullBestiary();
    const bestiarySection = (bestiary58.total > 0 && (isWarriorRole || isRogueRole || _cycle >= 2)) ? `\n[📖 몬스터 도감 — ${bestiary58.total}종 기록, 총 ${bestiary58.totalKills}처치] 전생의 사냥 경험이 본능적 지식으로 남아있습니다.${bestiary58.completionBonus ? `\n${bestiary58.completionBonus}` : ""}\n기록된 몬스터가 등장할 때 캐릭터가 본능적으로 패턴을 알아채는 묘사를 추가하십시오.` : "";

    // ── 59번: 전생 기억 상인 — 4회차+, 중후반 ──
    const merchant59 = getMemoryMerchantStatus();
    const merchantSection = (merchant59 && merchant59.appears && _cycle >= 4) ? `\n[🧙 전생 기억 상인] 고회차에만 나타나는 신비한 상인이 이번 생 어딘가에 존재합니다. 플레이어가 상인을 찾거나 운명적으로 마주치는 장면에서 등장시킬 수 있습니다. 상인은 전생 기억 조각을 대가로 귀한 정보를 줍니다. 이미 ${merchant59.visits}번 조우했습니다.` : "";

    // ── 60번: 시간 역행 토큰 — 토큰 보유 시만 ──
    const timeToken60 = getTimeTokenStatus();
    const timeTokenSection = (timeToken60 && timeToken60.tokens > 0) ? `\n[⏪ 시간 역행 토큰 — ${timeToken60.tokens}개 보유] 플레이어가 "시간을 되돌린다" 또는 "다시 해보겠다"고 명시적으로 선언할 경우, 극적인 연출로 시간 역행을 묘사한 뒤 반드시 <gs>{"flags":["time_token_used"]}</gs>를 출력하라 — 이 플래그가 있어야만 시스템이 토큰을 1개 소모 처리한다. 출력을 빠뜨리면 토큰이 무한정 재사용 가능한 것처럼 보이는 오류가 생긴다.` : "";

    // ── 61번: 전생 동료의 유지 — 모든 세계관, 1회차+ ──
    const survivors61 = getSurvivorCompanions();
    const survivorSection = (survivors61.length > 0 && _cycle >= 1) ? `\n[👥 전생 생존 동료] 전생에서 함께 살아남은 자들이 이번 생에 낯선 모습으로 나타납니다:\n${survivors61.slice(0, 3).map(c => `• ${c.npcName} — ${c.memoryStage.label}: "${c.memoryStage.firstMeet}"`).join("\n")}\n이 NPC가 등장할 때 위 연출을 사용하고, 특정 대화 조건에서 기억이 각성하도록 서사를 이끄십시오.` : "";

    // ── 62번: 불사 게이지 — 전사/도적 직업 우선, 모든 세계관 ──
    const undying62 = getUndyingGaugeStatus();
    const undyingSection = (undying62 && undying62.totalNearDeaths > 0 && (isWarriorRole || isRogueRole || _cycle >= 3)) ? `\n[💪 불사 게이지 — ${undying62.gauge}/${undying62.maxGauge}]${undying62.passiveReady ? " ✅ 즉사 무효 준비 완료" : ""}${undying62.passiveUsedThisCycle ? " (이번 회차 소진)" : ""}\n총 ${undying62.totalNearDeaths}번의 죽음을 버텨낸 영혼입니다.${undying62.passiveReady && !undying62.passiveUsedThisCycle ? "\n다음 즉사 판정에서 1회 자동으로 살아남는 기적을 극적으로 묘사하십시오." : ""}` : "";

    // ── 63번: 다국어 해금 — 판타지/무협 종족 중심 ──
    const languages63 = getUnlockedLanguages();
    const langSection = (languages63.length > 0 && (isFantasyRace || isMedieval || isWuxia || _cycle >= 4)) ? `\n[🌐 습득 언어 — ${languages63.length}종] 전생에서 익힌 언어들:\n${languages63.map(l => `• ${l.icon}${l.name}: ${l.bonus}`).join("\n")}\n해당 종족·세력 NPC와의 대화에서 이 언어를 자연스럽게 사용할 수 있으며, 전용 대화 선택지를 부여하십시오.` : "";

    // ── 64번: 음유시인 기록 — 2회차+, 바드 직업 우선 ──
    const bardLeg64 = getBardLegendStatus();
    const bardSection = (bardLeg64 && _cycle >= 2 && (isBardRole || _cycle >= 4)) ? `\n[🎵 음유시인의 기록 — 명성 ${bardLeg64.fame}점, ${bardLeg64.distortionData.label}] ${bardLeg64.distortionData.desc}\n술집이나 광장에서 NPC들이 ${bardLeg64.distortionData.multiplier}배로 과장된 전생의 이야기를 나누는 장면을 간헐적으로 삽입하십시오. 주인공이 그 이야기를 듣는 장면에서 복잡한 감정을 묘사하십시오.` : "";

    // ── 65번: 대미스터리 퍼즐 — 모든 세계관, 조각 있을 때 ──
    const mystery65 = getMysteryPuzzleStatus();
    const mysterySection = (mystery65 && mystery65.pieces && mystery65.pieces.length > 0) ? `\n[🧩 대미스터리 퍼즐 — ${mystery65.pieces.length}/${mystery65.totalPieces}조각 수집]${mystery65.solved ? " 🌟 세계의 진실 완전 해명!" : ""}\n현재까지 밝혀진 단서:\n${mystery65.pieces.slice(-3).map(p => `• ${p.icon}${p.title}: ${p.hint}`).join("\n")}\n이 미스터리의 단서들을 이번 회차 서사에 자연스럽게 녹여넣고, 진실에 한 걸음 가까워지는 장면을 연출하십시오.` : "";

    // ── 66번: 감시자의 시선 — 6회차+, 후반 이상 ──
    const watcherGaze66 = getWatcherGazeStatus();
    const watcherGazeSection = (watcherGaze66 && _cycle >= 6) ? `\n[👁️ 감시자의 시선 — ${watcherGaze66.stageData.desc}]${watcherGaze66.stageData.hint ? `\n암시: "${watcherGaze66.stageData.hint}"` : ""}\n${watcherGaze66.revealed ? "감시자의 정체가 밝혀졌습니다. 메타 스토리를 전면에 등장시키십시오." : "고요한 순간이나 깊은 명상 중에 이 감각을 섬세하게 묘사하십시오."}` : "";

    // ── 솔 이터니움 세계관 배경 — AI 나레이터 공통 지식 ──
    const solLoreSection = (() => {
      const c = _cycle || 0;
      const wg = (typeof getWatcherGazeStatus === 'function') ? getWatcherGazeStatus() : null;
      const wt = (typeof loadWorldTree === 'function') ? loadWorldTree() : null;
      const aw = (typeof loadLoopAwareness === 'function') ? loadLoopAwareness() : null;

      let lore = '';

      // ── 0회차: 세계 기반 상식 (항상 주입) ──
      lore += `\n[🌍 세계 공통 상식 — 나레이터 숙지 필수]
세계 이름: 아에테른(Aetern). 대륙 이름: 칼다리아. 왕국: 알테라 대왕국. 수도: 아이런홀.
인사말: "세계수의 축복을" (일반 인사) / 장례: "뿌리로 돌아가 새 가지가 되길" (성직자 집전)
이 세계 사람들은 환생을 자연스럽게 믿는다. 죽음을 두려워하지 않고 "다음 생에서 갚겠다"는 말이 일상어다.
공통 역사 사건: 150년 전 대마법 폭발로 왕국 북부 셀리나 마을이 전소, 3,200명 사망. 이 사건을 경험한 NPC들은 그 기억을 공유한다.
셀리나 폐허: 지금도 안개 짙은 밤이면 죽은 자의 목소리가 들린다는 소문이 있다.
종교 체계: 빛의 신앙(순환의 사원)이 다수 종교. 심연 신앙(Pact of the Abyss)이 탄압받는 이단.
이단 소문: "순환의 기억자들"이라는 비밀결사가 있다. "전생을 기억한다"고 주장하는 미치광이들로 알려져 있다.`;

      // ── 1~2회차: 황금시대 신화 복선 ──
      if(c >= 1){
        lore += `\n[👑 황금시대의 기억] 노인들은 "320년 전에는 달랐다"고 말한다. 알테라 1세의 건국 당시 세계수가 살아있었고, 마법과 신앙이 함께 번성했다. 그 시절 건축물이 지금도 유적으로 남아있다. 주인공이 고대 건물에 들어갈 때 "이것은 황금시대의 것"이라는 묘사를 자연스럽게 삽입하라.`;
      }

      // ── 3회차+: 세계수 존재 암시 ──
      if(c >= 3 && wt && (wt.level||0) >= 1){
        lore += `\n[🌳 세계수(Yggdra)] 이 세계의 모든 이야기를 품은 뿌리. 수천 년 전부터 서서히 병들어가고 있다. 세계 곳곳에서 원인 모를 시듦과 쇠락이 나타나는 것이 그 증거다. 순환의 사원 성직자들은 세계수가 완전히 소멸하면 환생 자체가 불가능해진다고 두려워한다.`;
      }

      // ── 4회차+: 장소 전설이 실제 단서로 연결 ──
      if(c >= 4){
        lore += `\n[🗺️ 장소 전설 힌트] 왕도 광장의 낡은 수목이 세계수의 마지막 가지라는 전설이 있다. 아르카나 탑 지하에 봉인석 파편이 보관되어 있다는 소문이 마법사들 사이에 돈다. 북대륙 오로라를 30분 이상 바라보면 전생 기억이 돌아온다는 전설이 있다 (주인공이 이것을 시도하면 기억 회상 연출 가능). 이러한 전설들을 NPC가 자연스럽게 언급하도록 하라.`;
      }

      // ── 5회차+: 루프 진실 암시 ──
      if(c >= 5 && aw && (aw.level||0) >= 1){
        lore += `\n[🔄 루프의 본질] 이 환생은 자연스러운 것이 아니다. 누군가 설계한 순환이며, 영혼이 살고 죽을수록 의도한 목적에 가까워진다. "순환의 기억자들" 이단 결사가 이 사실을 알고 저항하고 있다. 이번 회차에 그들과 접촉 이벤트를 자연스럽게 배치하라.`;
      }

      // ── 6회차+: 감시자 존재 암시 ──
      if(c >= 6){
        if(wg && wg.revealed){
          lore += `\n[👁️ 감시자(The Watcher)] 세계수의 상처에서 태어난 존재. 이야기의 감정 에너지를 양식으로 삼아 수천 년을 살아왔다. 루프를 설계한 장본인. 도적 길드의 정보망을 통해 세계 곳곳의 감정 데이터를 수집한다. 형체가 없고 목소리로만 존재한다.`;
        } else {
          lore += `\n[👁️ 알 수 없는 시선] 술집 노인이 중얼거렸다. "예로부터 세상에는 이야기를 먹고 사는 존재가 있다지." 무언가가 이 세계를 오래전부터 지켜보고 있다. 아직 정체는 불명확하지만, 조용한 밤 홀로 있을 때 누군가 등 뒤에서 바라보는 느낌이 든다.`;
        }
      }

      // ── 8회차+: 기사단 비밀과 봉인석 연결 ──
      if(c >= 8){
        lore += `\n[⚔️ 기사단의 비밀] 철의 맹세단이 220년간 은폐해온 사실이 있다. 왕국의 7대 국왕이 악마와 계약을 맺어 왕국을 세웠다. 그 계약서가 기사단 지하 금고에 있다. 이것이 드러나는 순간 왕국의 건국 정당성 자체가 무너진다. 이 비밀을 추적하는 서사 흐름을 자연스럽게 이어가라.`;
      }

      // ── 10회차+: 쌍둥이 영혼과 감시자의 관계 ──
      if(c >= 10){
        lore += `\n[👥 쌍둥이 영혼] 수천 회차 전, 가장 먼저 진실에 닿은 영혼. 고독을 견디지 못하고 감시자 편이 되었다. 적이라기보다 — 먼저 지쳐버린 또 다른 자신이다. "순환의 기억자들" 길드 마스터가 이 영혼일 가능성이 있다.`;
      }

      const cycle2 = typeof loadCycleCount==='function' ? (loadCycleCount()||0) : 0;
    const revealGuide = cycle2 < 2
      ? '\n⚠️ [정보 공개 제한 — 1~2회차] 감시자·루프·봉인석 진실 절대 언급 금지. 복선과 분위기만. 세계가 평범하게 시작되어야 한다.'
      : cycle2 < 4
      ? '\n⚠️ [정보 공개 제한 — 3~4회차] 봉인석 이상 현상 암시 가능. 감시자 정체 절대 불가. 아르카누스가 뭔가 숨긴다는 느낌만 줄 것.'
      : cycle2 < 6
      ? '\n⚠️ [정보 공개 제한 — 5~6회차] 루프 암시 가능. 감시자 정체 불가. NPC들이 플레이어를 이상하게 여기는 묘사 허용.'
      : '\n✅ [정보 공개 — 7회차+] 루프·봉인석·감시자 관련 정보를 플레이어 행동에 따라 단계적으로 공개 가능. 단 직접 설명하지 말고 서사로 드러낼 것.';
    return lore ? `\n\n[🌌 세계 아에테른의 진실 — 나레이터 참고 (플레이어에게 직접 말하지 말 것)${revealGuide}${lore}]` : revealGuide;
    })();

    // ── 67번: 운명 카드 — 카드 선택 시만 ──
    const fateCard67 = getCurrentFateCard();
    const fateCardSection = fateCard67 ? `\n[${fateCard67.icon} 운명 카드 — ${fateCard67.name}(${fateCard67.theme})] ${fateCard67.effect}\n보너스: ${fateCard67.bonus} / 페널티: ${fateCard67.penalty}\n이번 회차 전체의 분위기와 사건 흐름이 이 카드의 테마를 중심으로 전개되도록 서사를 이끄십시오.` : "";

    // ── 68번: 전생 본거지 — 2회차+, 시설 있을 때 ──
    const hideout68 = getHideoutStatus();
    const hideoutSection = (hideout68 && hideout68.facilities && hideout68.facilities.length > 0 && _cycle >= 2) ? `\n[🏰 전생 본거지 — Lv.${hideout68.level}(${hideout68.facilities.length}개 시설)] 회차를 거쳐 세워진 은신처:\n${hideout68.facilities.slice(-3).map(f => `• ${f.icon}${f.name}: ${f.bonus}`).join("\n")}\n플레이어가 본거지를 방문하는 장면에서 이 시설들이 실제로 존재하고 기능하는 것으로 묘사하십시오.` : "";

    // ── 69번: 악안(惡眼) — 각성 시만, 전투 직업 우선 ──
    const evilEye69 = getEvilEyeStatus();
    const evilEyeSection = (evilEye69 && evilEye69.awakened && (isWarriorRole || isRogueRole || _cycle >= 5)) ? `\n[${evilEye69.levelData.icon || "🔴"} 악안 — ${evilEye69.levelData.label}] ${evilEye69.levelData.ability}\n총 ${evilEye69.killCount}번의 전투 경험이 눈에 각인되어 있습니다.\n전투 장면에서 이 능력을 자연스럽게 활용해 상대의 상태를 묘사하십시오.` : "";

    // ── 70번: 달의 위상 — 모든 세계관, 1회차+ ──
    const moonPhase70 = getMoonPhase();
    const moonSection = moonPhase70 ? `\n[${moonPhase70.icon} 달의 위상 — ${moonPhase70.name}] ${moonPhase70.effect}\n특별 이벤트: ${moonPhase70.specialEvent}\n이번 회차 내내 달의 기운이 서사에 배어있습니다. 야간 장면이나 신비로운 순간에 이 위상의 영향을 자연스럽게 묘사하십시오.` : "";

    // ── 71번: 전생에서 보내는 편지 — 1회차+ ──
    const letter71 = getLatestLetter();
    const letterSection = (letter71 && _cycle >= 1) ? `\n[📩 전생에서 온 편지 — ${letter71.tone} 어조] "${letter71.message.slice(0,80)}${letter71.message.length > 80 ? "..." : ""}"\n이 편지를 쓴 자: ${letter71.characterName}. 이번 회차 극적인 순간에 낡은 편지를 발견하는 장면으로 연출하십시오.` : "";

    // ── 72번: 회차 하이라이트 컷씬 — 1회차+ ──
    const reel72 = getHighlightReel();
    const reelSection = (reel72.length > 0 && _cycle >= 1) ? `\n[🎬 전생 하이라이트] 이번 회차 오프닝이나 꿈 속에서 아래 장면들이 섬광처럼 스칠 수 있습니다:\n${reel72.slice(-3).map(r => `• ${r.icon}${r.label}: ${r.template.replace("${name}", r.characterName)}`).join("\n")}` : "";

    // ── 73번: 나비 지수 — 3회차+, 지수 양수일 때 ──
    const butterfly73 = getButterflyIndex();
    const butterflyIdxSection = (butterfly73.index > 0 && _cycle >= 3) ? `\n[🦋 나비 지수 — ${butterfly73.index}/100 (${butterfly73.stageData.label})] ${butterfly73.stageData.desc}\n${butterfly73.chaosMode ? "주의: 카오스 모드 활성화. 플레이어의 사소한 행동이 예상치 못한 큰 파장을 일으킵니다. 모든 선택에 과장된 연쇄 효과를 부여하십시오." : `카오스 확률 ${butterfly73.stageData.chaosChance}% — 때때로 예상치 못한 파급 효과를 서사에 추가하십시오.`}` : "";

    // ── 74번: 고대 비문 해독 — 유적/신전 세계관 우선, 비문 있을 때 ──
    const inscription74 = getInscriptionStatus();
    const inscriptionSection = (inscription74 && inscription74.lines && inscription74.lines.length > 0 && (isMedieval || isWuxia || _cycle >= 2)) ? `\n[📜 고대 비문 — ${inscription74.progress}/${inscription74.total}줄 해독]${inscription74.completed ? " 🌟 비문 완전 해독! 신급 스킬 해금 조건 충족!" : ""}\n최근 해독 구절: "${inscription74.lines[inscription74.lines.length-1]?.text}"\n고대 유적이나 신전 장면에서 이 비문의 구절을 자연스럽게 등장시키십시오.` : "";

    // ── 75번: 윤회 등급 — 1회차+ ──
    const rank75 = getRankStatus();
    const rankSection = (rank75 && _cycle >= 1) ? `\n[${rank75.rankData.icon} 윤회 등급 — ${rank75.rankData.label}] ${rank75.rankData.bonus}\n${rank75.rankData.desc}${rank75.nextRank ? `\n다음 등급까지: ${rank75.nextRank.minScore - rank75.totalScore}점 남음` : ""}` : "";

    // ── 76번: 벚꽃 엔딩 — 조건 달성 시만, 후반 이상 ──
    const sakura76 = getSakuraStatus();
    const sakuraSection = (sakura76 && sakura76.metCount > 0 && _cycle >= 5) ? `\n[🌸 벚꽃 엔딩 — ${sakura76.metCount}/${sakura76.totalConditions}조건 달성]${sakura76.unlocked ? " ✅ 대단원 평화 엔딩 해금!" : ""}\n미달성 조건: ${sakura76.conditions.filter(c => !c.met).map(c => c.label).join(", ")}\n${sakura76.unlocked ? "이번 회차에서 평화적 결말을 이끌면 벚꽃 엔딩이 발동됩니다. 서사를 화해와 평화의 방향으로 이끄십시오." : ""}` : "";

    // ── 77번: 데자뷔 알림 — 1회차+ ──
    const dejavu77 = getDejavuStatus();
    const dejavuSection = (dejavu77 && dejavu77.count > 0 && _cycle >= 1) ? `\n[💭 데자뷔 알림] 전생에서 겪은 상황이 재현될 때 자동으로 "익숙한 느낌" 묘사를 삽입하십시오:\n${dejavu77.triggerDefs.slice(0,4).map(t => `• ${t.keyword[0]} 관련 상황: "${t.feeling}"`).join("\n")}\n총 ${dejavu77.count}번의 데자뷔 경험이 축적되었습니다.` : "";

    // ── 78번: 인과율 조작 — 10회차+, 후반 이상 ──
    const causality78 = getCausalityStatus();
    const causalitySection = (causality78 && _cycle >= 10) ? `\n[⚙️ 인과율 조작 — ${causality78.uses}/${causality78.maxUses}회 사용] 플레이어가 "원인을 바꾼다" 또는 "그 일이 일어나지 않았다면"이라고 명시적으로 선언할 경우, 이 능력을 소모해 과거 사건의 원인을 소급 변경하는 극적 장면을 연출하십시오.` : "";

    // ── 79번: 전생 도박 빚 — 빚 있을 때만 ──
    const debt79 = getGamblingDebt();
    const debtSection = (debt79 && !debt79.paidOff) ? `\n[💸 전생 도박 빚 — ${debt79.totalDebt}골드] 채권자: ${debt79.creditorName}\n이번 회차 초반에 빚쟁이 NPC가 나타나 빚을 요구하는 장면을 삽입하십시오. 갚으면 히든 퀘스트가 열립니다.` : "";

    // ── 80번: 어린 시절 트라우마 — 트라우마 있을 때 ──
    const traumas80 = getChildhoodTraumas();
    const trauma80Section = traumas80.length > 0 ? `\n[😢 각인된 트라우마]\n${traumas80.map(t => `• ${t.icon}${t.label}: 트리거(${t.trigger}) → 플래시백: "${t.flashback}"`).join("\n")}\n해당 상황이 등장할 때 위 플래시백 묘사를 자연스럽게 삽입하십시오.` : "";

    // ── 81번: 세계 종말 카운터 — 3회차+, 카운터 > 0 ──
    const apo81 = getApocalypseStatus();
    const apoSection = (apo81 && apo81.clock > 0 && _cycle >= 3) ? `\n[${apo81.stageData.icon} 세계 종말 카운터 — ${apo81.clock}/100 (${apo81.stageData.label})] ${apo81.stageData.desc}${apo81.stageData.warning ? `\n⚠️ ${apo81.stageData.warning}` : ""}\n${apo81.clock >= 80 ? "긴급: 이번 회차에서 봉인 이벤트를 발동시키지 않으면 멸망이 확정됩니다. 이 긴박감을 서사 전체에 흐르게 하십시오." : "세계 어딘가에서 이 카운터의 영향이 배경 묘사에 스며들도록 하십시오."}` : "";

    // ── 82번: 슬픔 수치 — 상실 있을 때 ──
    const grief82 = getGriefStatus();
    const griefSection = (grief82 && grief82.total > 0) ? `\n[${grief82.stageData.icon} 슬픔 수치 — ${grief82.total}명 상실 (${grief82.stageData.label})] 공감 능력 +${grief82.stageData.empathy} / 전투 의지 -${grief82.stageData.willPenalty}\n잃어버린 자들: ${grief82.lostOnes.slice(-3).map(l => `${l.name}(${l.relationship})`).join(", ")}...\n이 슬픔이 캐릭터의 눈빛과 행동에 자연스럽게 배어나오도록 하십시오.` : "";

    // ── 83번: 전생 직감 — 3회차+ ──
    const instinct83 = getInstinctStatus();
    const instinctSection = (instinct83 && _cycle >= 3) ? `\n[🔮 전생 직감 — 정확도 ${instinct83.accuracy}%] 새로운 NPC를 처음 만날 때 직감 판정으로 선의/악의를 ${instinct83.accuracy}% 확률로 감지합니다. "무언가 미심쩍은 느낌이 든다" 또는 "왠지 믿음직스럽다"는 묘사를 자연스럽게 삽입하십시오.` : "";

    // ── 84번: 저주받은 유물 — 유물 있을 때 ──
    const cursedRelics84 = getCursedRelics();
    const cursedRelicSection = cursedRelics84.length > 0 ? `\n[🔮 저주받은 유물의 흔적]\n${cursedRelics84.map(r => `• ${r.icon}${r.name}: ${r.curse} / 숨겨진 힘: ${r.hiddenPower}`).join("\n")}\n이 저주들이 희미하게 캐릭터를 따라다닙니다. 관련 상황에서 저주와 숨겨진 힘을 함께 묘사하십시오.` : "";

    // ── 장비 정체성 부조화 — 매 턴 현재 장착 상태 기준 재계산 ──
    if(typeof recalcItemDissonance==='function') recalcItemDissonance();
    if(typeof applyDissonanceStatEffect==='function') applyDissonanceStatEffect();
    const itemDissonanceSection = (typeof getItemDissonanceSection==='function') ? getItemDissonanceSection() : "";

    // ── 종족-직업 정체성 부조화 — 매 턴 재계산(서서히 자연 완화) ──
    if(typeof recalcRaceJobDissonance==='function') recalcRaceJobDissonance();
    if(typeof applyRaceJobDissonanceStatEffect==='function') applyRaceJobDissonanceStatEffect();
    const raceJobDissonanceSection = (typeof getRaceJobDissonanceSection==='function') ? getRaceJobDissonanceSection() : "";

    // ── 85번: 자연 회귀 — 자연 관련 세계관 우선, 중립 이상 스코어 ──
    const nature85 = getNatureKarma();
    const natureSection = (nature85 && (nature85.score !== 50 || isMedieval || isWuxia) && _cycle >= 2) ? `\n[${nature85.status.icon} 자연 업보 — ${nature85.status.label}] ${nature85.status.effect}\n자연 관련 장면(숲, 강, 산, 폭풍)에서 이 업보의 영향을 자연스럽게 묘사하십시오.` : "";

    // ── 86번: 신분 세탁 누적 — 가명 있을 때, 로그/리더 직업 우선 ──
    const aliases86 = getAliasList();
    const aliasSection = (aliases86.length > 0 && (isRogueRole || isLeaderRole || _cycle >= 3)) ? `\n[🎭 신분 목록 — ${aliases86.length}개 가명] 즉시 사용 가능한 위장 신분:\n${aliases86.slice(0,4).map(a => `• "${a.name}" (${a.context}, 신뢰도 ${a.credibility}/5)`).join("\n")}\n플레이어가 이 신분을 사용할 때 자연스러운 전환과 신뢰도에 맞는 반응을 묘사하십시오.` : "";

    // ── 87번: 소원 시스템 — 소원 사용 가능 시만 ──
    const wish87 = getWishStatus();
    const wishSection = (wish87 && wish87.available) ? `\n[⭐ 소원 사용 가능] 100회차 달성 보상으로 소원 1회를 사용할 수 있습니다:\n${wish87.options.map(o => `• ${o.icon}${o.label}: ${o.desc}`).join("\n")}\n플레이어가 소원을 선택하면 해당 효과를 극적으로 연출하십시오.` : "";

    // ── 88번: 전생 반려동물 — 반려동물 있을 때 ──
    const pets88 = getPetLegacy();
    const petSection = pets88.length > 0 ? `\n[🐾 전생 반려동물] 전생에서 함께한 동물들이 이번 생 어딘가에 살고 있습니다:\n${pets88.map(p => `• ${p.icon}${p.petName}(${p.name}) — 유대 ${p.bond}/100, 재결합 아이템: ${p.reuniteItem}`).join("\n")}\n플레이어가 해당 아이템을 사용하거나 조건을 맞추면 감동적인 재결합 장면을 연출하십시오.` : "";

    // ── 89번: 봉인된 기억 방 — 봉인 있을 때, 2회차+ ──
    const sealedMems89 = getSealedMemories();
    const sealedSection = (sealedMems89.length > 0 && _cycle >= 2) ? `\n[🔒 봉인된 기억 방 — ${sealedMems89.filter(m=>!m.opened).length}개 봉인 중]\n${sealedMems89.filter(m=>!m.opened).map(m => `• ${m.trigger} → 해금 시 스킬: ${m.skill} (정신력 -${m.mentalCost})`).join("\n")}\n플레이어가 봉인 해제를 시도하면 극적인 고통과 각성을 동시에 묘사하십시오.` : "";

    // ── 90번: 영혼 결정체 — 결정체 있을 때 ──
    const sc90 = getSoulCrystalStatus();
    const soulCrystalSection = (sc90 && sc90.count > 0) ? `\n[💠 영혼 결정체 — ${sc90.count}개 보유]${sc90.crafted && sc90.crafted.length > 0 ? ` / 제조 완료: ${sc90.crafted.map(c=>c.name).join(", ")}` : ""}\n${sc90.availableCrafts.length > 0 ? `제조 가능: ${sc90.availableCrafts.map(c=>`${c.icon}${c.name}(${c.cost}개)`).join(", ")}` : ""}` : "";

    // ── 91번: 감정 잔향 — 1회차+ ──
    const echo91 = getEmotionEcho();
    const echoSection = (echo91 && _cycle >= 1) ? `\n[${echo91.icon} 감정 잔향 — ${echo91.label}] ${echo91.trait}\n보너스: ${echo91.bonus} / 부작용: ${echo91.sideEffect}\n이 감정의 잔향이 캐릭터의 행동 방식과 반응에 자연스럽게 스며들도록 서사를 이끄십시오.` : "";

    // ── 92번: 차원 지도 — 2회차+, 세계 탐험 있을 때 ──
    const dimMap92 = getDimensionMapStatus();
    const dimMapSection = (dimMap92 && dimMap92.totalWorlds > 0 && _cycle >= 2) ? `\n[🗺️ 차원 지도 — ${dimMap92.totalWorlds}개 세계 탐험]${dimMap92.unlockedSkills.length > 0 ? `\n해금 스킬: ${dimMap92.unlockedSkills.map(s=>`${s.icon}${s.skill}`).join(", ")}` : ""}\n${dimMap92.nextSkill ? `다음 해금까지 ${dimMap92.nextSkill.count - dimMap92.totalWorlds}개 세계 탐험 필요` : ""}` : "";

    // ── 93번: 악역 계승 — 보스 처치 후, 카르마 높을 때 ──
    const villain93 = getVillainInheritStatus();
    const villainSection = (villain93 && villain93.inherited && villain93.inherited.length > 0 && villain93.corruptionLevel > 0) ? `\n[😈 악역 계승 — 오염도 ${villain93.corruptionLevel}%] ${villain93.corruptDesc}\n계승한 힘: ${villain93.inherited.map(v=>`${v.bossName}의 ${v.ability}`).join(", ")}\n이 힘들이 서사에서 자연스럽게 발현되며, 오염도에 따라 어두운 선택지를 더 자주 제시하십시오.` : "";

    // ── 94번: 눈물 수집 — 결정 있을 때 ──
    const tears94 = getTearCrystalStatus();
    const tearSection = (tears94 && tears94.crystals > 0) ? `\n[💧 눈물 결정 — ${tears94.crystals}개]${tears94.canUse ? " ✅ 사용 가능(3개 이상)" : ""}\n플레이어가 "눈물을 바친다" 또는 "결정을 사용한다"고 선언하면 3개를 소모해 현재 NPC를 완전히 감동시키는 기적을 연출하십시오.` : "";

    // ── 95번: 속성 내성/약점 — 내성 있을 때 ──
    const elemRes95 = getElementResistances();
    const elemSection = elemRes95.length > 0 ? `\n[🔰 속성 내성/약점]\n${elemRes95.map(r=>`• ${r.icon}${r.element}: ${r.resistLabel}(${r.resistLevel}) / 반대: ${r.weakLabel}`).join("\n")}\n전투와 마법 이벤트에서 이 내성/약점을 반드시 반영하십시오.` : "";

    // ── 96번: 이세계 서커스 — 7회차+, 고회차 ──
    const circus96 = getCircusStatus();
    const circusSection = (circus96 && _cycle >= 7) ? `\n[🎪 이세계 서커스] 고회차 전용. 극적으로 잠드는 장면이나 혼절 순간에 서커스 이벤트가 발동될 수 있습니다. 다음 이벤트: ${circus96.nextAct?.icon}${circus96.nextAct?.name} — ${circus96.nextAct?.desc}` : "";

    // ── 97번: 신전 건립 — 신전 있을 때, 성직 직업 우선 ──
    const temple97 = getTempleStatus();
    const templeSection = (temple97 && temple97.level > 0 && (isHealerRole || _cycle >= 3)) ? `\n[${temple97.levelData.icon} 신전 — ${temple97.levelData.name}] 신도 ${temple97.levelData.worshippers}명\n신도 혜택: ${temple97.levelData.boon}\n신전을 방문하거나 신도를 만나는 장면에서 이 혜택을 자연스럽게 부여하십시오.` : "";

    // ── 98번: 유언 방송 — 2회차+ ──
    const legWords98 = getLegacyWords();
    const legWordsSection = (legWords98.length > 0 && _cycle >= 2) ? `\n[📢 유언 방송] 전생의 마지막 말이 세계에 퍼져있습니다:\n${legWords98.slice(-2).map(w=>`• ${w.misinterpretation}`).join("\n")}\n술집, 시장, 신전에서 NPC들이 이 말을 인용하거나 오해하는 장면을 간헐적으로 삽입하십시오.` : "";

    // ── 99번: 돌연변이 — 같은 종족 반복 시, 각성 시만 ──
    const mutation99 = getMutationStatus(char.race);
    const mutationSection = (mutation99 && mutation99.mutated) ? `\n[🧬 돌연변이 각성 — ${mutation99.mutation}] 외형: ${mutation99.appearance}\n각성 스킬: ${mutation99.skill}\n이 변화가 NPC들의 반응과 전투 장면에 자연스럽게 반영되도록 하십시오.` : "";

    // ── 100번: 어둠의 메아리 — 악명 있을 때 ──
    const dark100 = getDarkEchoStatus();
    const darkEchoSection = (dark100 && dark100.infamy > 0) ? `\n[${dark100.fearData.icon} 어둠의 메아리 — 악명 ${dark100.infamy}/100 (${dark100.fearData.label})] ${dark100.fearData.effect}\nNPC 반응: ${dark100.fearData.npcReaction}\n${dark100.rumors.length > 0 ? `최근 괴담: "${dark100.rumors[dark100.rumors.length-1]?.rumor}"` : ""}\n이 악명을 모르는 NPC와 아는 NPC의 반응을 극명하게 대비시키십시오.` : "";

    // ── 101번: 성장 나무 — 꽃 핀 가지 있을 때 ──
    const tree101 = getGrowthTreeStatus();
    const treeSection = (tree101 && tree101.blossoms && tree101.blossoms.length > 0) ? `\n[🌳 성장 나무 — 가지 ${tree101.totalBranches}개, 꽃 ${tree101.blossoms.length}개] 활짝 핀 꽃들이 예고하는 이벤트:\n${tree101.blossoms.slice(-2).map(b => `• ${b.icon}${b.label}: ${b.event}`).join("\n")}\n이 예고된 이벤트를 이번 회차 서사에 자연스럽게 심어두십시오.` : "";

    // ── 102번: 신격화 루트 — 단계 1 이상 ──
    const deify102 = getDeificationStatus();
    const deifySection = (deify102 && deify102.stage > 0) ? `\n[${deify102.stageData.icon} 신격화 — ${deify102.stageData.label}(${deify102.metCount}/${deify102.totalConditions}조건)]${deify102.stageData.power ? ` 능력: ${deify102.stageData.power}` : ""}\n${deify102.deified ? "신격화 완성. 이번 회차 신으로서의 존재감을 서사에 드러내십시오." : `미달성 조건: ${deify102.conditions.filter(c=>!c.met).map(c=>c.label).join(", ")}`}` : "";

    // ── 103번: 무한 회귀 자각 — 7회차+, 자각 시 ──
    const aware103 = getLoopAwareness();
    const awarenessSection = (aware103 && aware103.level > 0 && _cycle >= 7) ? `\n[🔄 무한 회귀 자각 — ${aware103.levelData.label}(${aware103.levelData.tone})] ${aware103.levelData.desc}\n${aware103.level >= 3 ? "주의: 캐릭터가 나레이터에게 직접 말을 거는 4th wall 장면을 간헐적으로 허용하십시오. \"당신도 알고 있죠?\"와 같은 발언이 가능합니다." : "캐릭터의 대화와 독백에 자각의 수준에 맞는 메타적 뉘앙스를 담아내십시오."}` : "";

    // ── 104번: 전생 라이벌 성장 — 라이벌 있을 때 ──
    const rivals104 = getRivals();
    const rivalSection = rivals104.length > 0 ? `\n[⚔️ 전생 라이벌] 나 없이도 성장한 라이벌들:\n${rivals104.map(r => `• ${r.name}(${r.class}) — 전력 Lv.${r.power}${r.evolved ? " ★진화형" : ""}, ${r.encounters}회 조우`).join("\n")}\n이들이 등장할 때 반드시 이전보다 강해졌음을 명시하고 주인공을 알아보는 장면을 연출하십시오.` : "";

    // ── 105번: 붉은 실 — 설정된 인연 있을 때 ──
    const redThread105 = getRedThread();
    const redThreadSection = redThread105 ? `\n[🔴 붉은 실 — ${redThread105.npcName}(${redThread105.fate.desc})] "${redThread105.fate.meeting}"\n초기 호감도 ${redThread105.fate.bond}으로 시작. 이 NPC는 어떤 상황에서도 반드시 등장하도록 서사를 이끄십시오.` : "";

    // ── 106번: 전생 건축물 붕괴 — 건축물 있을 때, 중세/무협 우선 ──
    const ruins106 = getRuins();
    const ruinsSection = (ruins106.length > 0 && (isMedieval || isWuxia || _cycle >= 3)) ? `\n[🏚️ 전생 건축물 폐허]\n${ruins106.filter(r=>!r.restored).map(r => `• ${r.icon}${r.originalName}(${r.name}): 복원 퀘스트 — ${r.restoreQuest} → 보상: ${r.reward}`).join("\n")}\n이 폐허들을 세계 곳곳에 배치하고, 복원 서브퀘스트를 자연스럽게 제시하십시오.` : "";

    // ── 107번: 살의 감지 — 레벨 1 이상, 암살 경험 있을 때 ──
    const killSense107 = getKillSenseStatus();
    const killSenseSection = (killSense107 && killSense107.level > 0) ? `\n[🎯 살의 감지 — ${killSense107.levelData.ability}] 총 ${killSense107.assassinDeaths}번 암살 피해 경험\n적대적 NPC의 살의를 먼저 느끼는 순간을 섬세하게 묘사하십시오. 기습 장면에서 감지 여부를 판정하십시오.` : "";

    // ── 108번: 전생 원한꽃 — 원한꽃 있을 때 ──
    const grudgeFlowers108 = getGrudgeFlowers();
    const grudgeFlowerSection = grudgeFlowers108.length > 0 ? `\n[🌹 원한꽃]\n${grudgeFlowers108.map(f => `• ${f.stateData?.icon}${f.enemyName}: ${f.stateData?.label} — ${f.stateData?.effect}`).join("\n")}\n복수 대상 적과 조우 시 원한꽃의 상태에 맞는 효과를 적용하십시오. 저주 상태라면 캐릭터에게 불리하게 작용합니다.` : "";

    // ── 109번: 불운의 회차 — 저주 회차이거나 극복 이력 있을 때 ──
    const cursedCycle109 = getCursedCycleStatus();
    const cursedCycleSection = (cursedCycle109 && (cursedCycle109.isCursed || cursedCycle109.overcame > 0)) ? (cursedCycle109.isCursed ? `\n[💀 불운의 회차] 이번 회차는 저주받은 회차입니다. 주요 판정이 평소보다 더 낮게 나오는 경향이 있습니다. 역경을 극복하는 서사를 구성하십시오. 역이용해 클리어 시 전설 보상.` : `\n[💪 불운 극복자 — ${cursedCycle109.overcame}회 극복] 저주받은 회차를 버텨낸 경험이 있습니다. 이를 자부심의 근거로 서사에 반영하십시오.`) : "";

    // ── 110번: 자석 운명 — 회피 이벤트 있을 때 ──
    const magnet110 = getFateMagnet();
    const magnetSection = (magnet110 && magnet110.strongestPull) ? `\n[🧲 자석 운명 — ${magnet110.strongestPull.type}(인력 ${magnet110.strongestPull.magnetPull}%)] 전생에서 피하려 했던 사건일수록 더 강하게 끌려옵니다.\n"${magnet110.strongestPull.type}" 유형의 이벤트를 이번 회차 피할 수 없는 방식으로 자연스럽게 등장시키십시오.` : "";

    // ── 111번: 기억의 홍수 — 10회차+, 이전 발생 이력 있을 때 ──
    const flood111 = getMemoryFloodStatus();
    const floodSection = (flood111 && flood111.lastResult && _cycle >= 10) ? `\n[🌊 기억의 홍수] 이전 기억의 홍수 결과: ${flood111.lastResult.outcome?.label}\n깊은 명상·혼절·극한 감정 상황에서 기억의 홍수가 다시 발동될 수 있습니다. 정신력에 따라 각성 또는 혼란으로 연출하십시오.` : "";

    // ── 112번: 회전목마 NPC — 1회차+ ──
    const carousel112 = getCarouselNPC();
    const carouselSection = (carousel112 && carousel112.currentRole && _cycle >= 1) ? `\n[🎠 회전목마 NPC${carousel112.npcName ? ` — ${carousel112.npcName}` : ""}] 이번 회차 역할: ${carousel112.currentRole.icon}${carousel112.currentRole.label}\n첫 만남 대사: "${carousel112.currentRole.firstMeet}"\n이 NPC가 이번 회차에서 위 역할로 반드시 등장하도록 서사를 이끄십시오.` : "";

    // ── 113번: 운명의 덫 — 함정 활성화 시만 ──
    const traps113 = getFateTraps();
    const trapSection = (traps113 && traps113.activeTraps && traps113.activeTraps.length > 0) ? `\n[🪤 운명의 덫] 반복 행동 패턴을 노린 함정이 세팅되어 있습니다:\n${traps113.activeTraps.map(t => `• ${t.label}: ${t.trap}`).join("\n")}\n이 함정들을 이번 회차 자연스럽게 배치하되, 플레이어가 눈치채고 회피하면 추가 보상을 주십시오.` : "";

    // ── 114번: 정신 오염 — 10회차+, 오염 레벨 1 이상 ──
    const mental114 = getMentalCorruption();
    const mentalSection = (mental114 && mental114.level > 0 && _cycle >= 10) ? `\n[🌀 정신 오염 — ${mental114.levelData.label}] ${mental114.levelData.symptom}\n페널티: ${mental114.levelData.penalty}\n대화와 전투 장면에서 현재·과거 혼동 증상을 섬세하게 묘사하십시오. 오염이 심하면 치료 이벤트를 제시하십시오.` : "";

    // ── 115번: 전생 영화관 — 관람 이력 있을 때 ──
    const cinema115 = getCinemaStatus();
    const cinemaSection = (cinema115 && cinema115.totalViewed > 0) ? `\n[🎬 전생 영화관 — ${cinema115.totalViewed}편 관람] 특정 장소(${cinema115.scenes.map(s=>s.trigger).slice(0,3).join(", ")} 등)에서 전생 명장면이 환영처럼 재생될 수 있습니다. 해당 장소 방문 시 관련 스킬 숙련도가 상승하는 효과를 연출하십시오.` : "";

    // ── 116번: 쌍둥이 영혼 — 5회차+, 연결 시만 ──
    const twin116 = getTwinSoul();
    const twinSection = (twin116 && twin116.connected && _cycle >= 5) ? `\n[👥 쌍둥이 영혼 — ${twin116.partnerName}] 연결 강도: ${twin116.connectionStrength}%\n공유 스킬: ${twin116.sharedSkills.map(s=>s.skill).join(", ")}\n깊은 집중 또는 위기 상황에서 파트너의 기억과 감각이 전달되는 장면을 간헐적으로 연출하십시오.` : "";

    // ── 117번: 살수 명단 — 복수자 있을 때 ──
    const killList117 = getKillList();
    const killListSection = (killList117 && killList117.avengers && killList117.avengers.length > 0) ? `\n[📜 살수 명단 — 복수자 ${killList117.avengers.length}명 대기 중]\n${killList117.avengers.slice(0,3).map(a => `• ${a.name}의 후손이 복수자로 이번 회차 어딘가 있습니다.`).join("\n")}\n이 복수자들을 이번 회차 자연스럽게 등장시키고, 조우 시 극적인 대결을 연출하십시오.` : "";

    // ── 118번: 기억 경매 — 3회차+, 거래 가능 기억 있을 때 ──
    const auction118 = getMemoryAuction();
    const auctionSection = (auction118 && auction118.available && auction118.available.length > 0 && _cycle >= 3) ? `\n[🔨 기억 경매] 신비한 기억 상인이 전생 기억을 사고 싶어합니다:\n${auction118.available.slice(0,3).map(a => `• ${a.label}: 판매가(${a.sellPrice}) — 대가(${a.cost})`).join("\n")}\n플레이어가 거래를 요청하면 해당 기억을 파는 감정적 장면을 연출하십시오.` : "";

    // ── 119번: 인연 나무 — 잎사귀 5개 이상 ──
    const bondTree119 = getBondTreeStatus();
    const bondTreeSection = (bondTree119 && bondTree119.leaves >= 5) ? `\n[${bondTree119.icon} 인연 나무 — ${bondTree119.stage}(잎 ${bondTree119.leaves}개, 깊은 인연 ${bondTree119.deepBonds}명)] 사회적 판정 보너스: +${bondTree119.socialBonus}\n인연의 깊이와 넓이가 사회적 장면에서 자연스럽게 빛나도록 서사에 녹여내십시오.` : "";

    // ── 120번: 사이버 각인 — 사이버펑크 전용 ──
    const cyber120 = getCyberImprint();
    const cyberSection = (cyber120 && cyber120.imprints && cyber120.imprints.length > 0 && isCyberpunk) ? `\n[🔌 사이버 각인 — ${cyber120.imprints.length}개 임플란트 DNA 각인] 장착 비용 ${cyber120.discount}% 할인\n각인된 임플란트: ${cyber120.imprints.map(i=>`${i.icon}${i.name}(${i.bonus})`).join(", ")}\n이 임플란트들이 이미 신체에 익숙한 것처럼 자연스럽게 발동되도록 묘사하십시오.` : "";

    // ── 121번: 검귀 빙의 — 무협 전용 ──
    const sword121 = getSwordGhost();
    const swordSection = (sword121 && sword121.techniques && sword121.techniques.length > 0 && isWuxia) ? `\n[⚔️ 검귀 빙의 — 각성 Lv.${sword121.awakeLevel}] 습득 절기: ${sword121.techniques.map(t=>t.name).join(", ")}\nHP 20% 이하 등 조건 충족 시 전생의 무공이 자동 발동됩니다. 빙의 장면을 극적으로 연출하십시오.` : "";

    // ── 122번: 왕국 유산 — 중세/판타지 전용 ──
    const kingdom122 = getKingdomLegacy();
    const kingdomSection = (kingdom122 && isMedieval) ? `\n[👑 왕국 유산 — 누적 유산 ${kingdom122.legacy}] 전생에서 세운 왕국들:\n${kingdom122.founded.map(k=>`• ${k.icon}${k.kingdomName}(${k.name}): 후예 — ${k.descendantTitle}, 혜택 — ${k.boon}`).join("\n")}\n후예 NPC들이 선조를 모시는 경건한 태도로 주인공을 대하도록 연출하십시오.` : "";

    // ── 123번: 루프 자각자 길드 — 5회차+, 상태 있을 때 ──
    const guild123 = getLoopersGuild();
    const guildSection = (guild123 && _cycle >= 5) ? `\n[🏛️ 루프 자각자 길드 — 상태: ${guild123.status === "member" ? `정회원(${guild123.rankData?.label})` : guild123.status === "hostile" ? "적대(거절 이력)" : "미접촉"}]${guild123.status === "member" ? `\n공유 지식: ${guild123.knowledgeShared?.join(", ")}` : ""}\n${guild123.status === "unknown" ? "이번 회차 비밀스러운 장소에서 길드 접촉 이벤트를 배치하십시오." : guild123.status === "hostile" ? "길드원들이 적으로 등장할 수 있습니다." : "길드원이 동료로 등장해 메타 정보를 공유합니다."}` : "";

    // ── 124번: 사신과의 거래 — 거래 이력 있을 때 ──
    const dealer124 = getDeathDealerStatus();
    const dealerSection = (dealer124 && dealer124.deals && dealer124.deals.length > 0) ? `\n[💀 사신과의 거래 — 빚 ${dealer124.debt}회, 위험도: ${dealer124.dangerLevel}]\n${dealer124.debtCollected ? "⚠️ 빚 회수 발동! 이번 회차 사신이 빚을 회수하러 옵니다. 극적인 대결을 연출하십시오." : "절체절명의 순간 사신과의 거래 선택지를 제시할 수 있습니다."}` : "";

    // ── 125번: 역할 반전 — 3회차+, 가능한 반전 있을 때 ──
    const reversal125 = getRoleReversal();
    const reversalSection = (reversal125 && reversal125.available && reversal125.available.length > 0 && _cycle >= 3) ? `\n[🔄 역할 반전 가능] 전생에서 처치한 보스의 시점 플레이 가능:\n${reversal125.available.slice(0,2).map(r => `• ${r.bossName} — 성공 시 스킬: ${r.skills.join(", ") || "고유 스킬 전체"}`).join("\n")}\n특별한 꿈이나 환영 장면에서 역할 반전 이벤트를 제안할 수 있습니다.` : "";

    // ── 126번: 별의 의지 — 1회차+ ──
    const worldWill126 = getWorldWill();
    const worldWillSection = (worldWill126 && worldWill126.currentWill && _cycle >= 1) ? `\n[${worldWill126.currentWill.icon} 별의 의지 — ${worldWill126.currentWill.will}] ${worldWill126.currentWill.desc}\n이번 회차 흐름: ${worldWill126.currentWill.flow}\n세계의 의지가 이번 회차 전체 이벤트 방향을 결정합니다. 이에 순응하면 보상, 역행하면 저항이 따릅니다.` : "";

    // ── 127번: 사안(死眼) — 50사망+ 해금 시 ──
    const deathEye127 = getDeathEyeStatus();
    const deathEyeSection = (deathEye127 && deathEye127.unlocked) ? `\n[👁️ 사안(死眼) — ${deathEye127.levelData.label}] ${deathEye127.levelData.ability}\n총 ${deathEye127.totalDeaths}번의 죽음을 경험한 눈입니다.\n전투와 조우 장면에서 사안의 능력을 자연스럽게 활용해 상대의 상태를 묘사하십시오.` : "";

    // ── 128번: 영혼의 주파수 — 주파수 50 이상 ──
    const freq128 = getSoulFrequency();
    const freqSection = (freq128 && freq128.frequency > 50) ? `\n[〰️ 영혼의 주파수 — ${freq128.frequency}%]${freq128.topResonance ? ` 최고 공명: ${freq128.topResonance.npcName}(강도 ${freq128.topResonance.strength}%)` : ""}\n주파수가 높은 NPC와의 대화에서 말 없이도 의도가 전달되는 텔레파시 장면을 간헐적으로 연출하십시오.` : "";

    // ── 129번: 봉인된 신 — 조각 3개 이상, 항상 진행 상황 포함 ──
    const sealedGod129 = getSealedGodStatus();
    const sealedGodSection = (sealedGod129 && sealedGod129.shards >= 3) ? `\n[🌟 봉인된 신 — ${sealedGod129.shards}/${sealedGod129.totalShards} 조각]${sealedGod129.released ? ` ✅ 해방됨 — ${sealedGod129.alignmentDesc || "중립"}` : ` (${sealedGod129.progressPercent}%)`}\n${sealedGod129.released ? "해방된 신의 존재를 서사에서 느낄 수 있도록 섬세하게 표현하십시오." : "고대 유적이나 특별한 장소에서 신의 조각이 발견될 수 있습니다."}` : "";

    // ── 130번: 자연의 섭리 — 5회차+, 변화 있을 때 ──
    const naturalLaw130 = getNaturalLaw();
    const naturalLawSection = (naturalLaw130 && naturalLaw130.mutations && naturalLaw130.mutations.length > 0 && _cycle >= 5) ? `\n[🌌 자연의 섭리 변화 — ${naturalLaw130.mutations.length}단계]\n${naturalLaw130.mutations.slice(-3).map(m => `• ${m.law}: ${m.desc} (${m.effect})`).join("\n")}\n이 법칙 변화들이 세계의 물리적·마법적 현상에 자연스럽게 스며들도록 묘사하십시오.` : "";

    // 진화 상태 확인
  const evolved = loadEvolution();
  const isEvolved = char.race && evolved[char.race];
  const evoData = isEvolved && RACE_EVOLUTION[char.race]?.stage2;
  const evoHint = evoData ? '\n[진화 상태] '+evoData.aiHint : '';

  // ── GS 블록: 현재 퀘스트 상태 + 플래그 주입 ──
  const _gsSid = char.scenario || 'custom';
  const _gsAllQ = [...(MAIN_QUESTS[_gsSid]||MAIN_QUESTS.custom||[]), ...(typeof EXTRA_MAIN_QUESTS!=='undefined'?EXTRA_MAIN_QUESTS:[])];
  const _gsQState = loadMainQuestState();
  const _gsActiveQ = _gsAllQ.filter(q=>_gsQState[q.id]==='active').map(q=>{
    const hint = q.npcHint ? ` | NPC힌트: ${q.npcHint.slice(0,60)}` : '';
    const aiH  = q.aiHint  ? ` | 서사방향: ${q.aiHint.slice(0,60)}` : '';
    return `[${q.chapter||q.id}] ${q.title} — ${q.desc}${hint}${aiH}`;
  }).join('\n');
  const _gsFlagKeys = typeof loadGSFlags==='function' ? Object.keys(loadGSFlags()).join(', ') : '';

  // 현재 활성 메인퀘스트 aiHint 추출 (서사 방향 지침)
  const _activeMQ = _gsAllQ.find(q=>_gsQState[q.id]==='active');
  const _mqAiHint = _activeMQ?.aiHint ? `\n[📌 현재 메인퀘스트 서사 방향] ${_activeMQ.aiHint}` : '';
  // [신규] 카르마 분기점 — 해당 챕터에 정의된 경우, 자연스러운 시점에
  // 이 선택지를 서사로 녹여내라는 지침을 AI에게 전달.
  const _mqKarma = _activeMQ?.karmaChoice ? `\n[⚖️ 카르마 분기 기회] ${_activeMQ.karmaChoice.desc} 가능한 방향: ${_activeMQ.karmaChoice.options.join(' / ')} ${_activeMQ.karmaChoice.aiHint||''}` : '';
  // [신규] 던전 연동 — 28장 재설계로 새로 도입된 필드. 해당 챕터가
  // 정식 던전 탐험(그림자 회랑, 감시자의 영역 등)과 연결되어야 할 때
  // AI에게 명확히 안내한다.
  const _mqDungeon = _activeMQ?.dungeonConnection ? `\n[🏰 던전 연동] ${_activeMQ.dungeonConnection.locationName?('장소: '+_activeMQ.dungeonConnection.locationName+'. '):''}${_activeMQ.dungeonConnection.desc} ${_activeMQ.dungeonConnection.aiHint||''}` : '';
  // [신규] 세계 역사 파편 연동 — WORLD_HISTORY_FRAGMENTS와의 명시적 연결
  const _mqHistory = _activeMQ?.historyFragmentHint ? `\n[📜 역사 파편 연동] ${_activeMQ.historyFragmentHint}` : '';
  // [신규] 1장의 organicTriggers.byBackground — 9개 분기를 AI에게 전부
  // 보여주는 대신, 시스템이 캐릭터의 실제 배경/직업을 보고 정확히 1개만
  // 골라서 전달한다. AI가 매번 9개를 직접 판단하지 않아도 되므로 오류
  // 위험이 줄어든다.
  let _mqOrganicTrigger = '';
  if(_activeMQ?.organicTriggers?.byBackground){
    try{
      const matched = (typeof getMatchingOrganicTrigger==='function') ? getMatchingOrganicTrigger(_activeMQ.organicTriggers.byBackground) : null;
      if(matched?.text){
        _mqOrganicTrigger = `\n[🎬 파편 등장 방식 — 이 캐릭터에 맞게 확정됨] ${matched.text} ${_activeMQ.organicTriggers.absoluteRule||''}`;
      }
    }catch(e){}
  }
  // [수정] 28장 재설계 이후 — malakarJoins/tenebraEcho가 이제 mq27(최초의
  // 혼돈과의 최종 결전)에 있다. 조건이 실제로 맞을 때만 짧게 노출해
  // 프롬프트 복잡도를 낮춘다.
  let _mqConditionalEvents = '';
  if(_activeMQ?.id === 'mq27'){
    try{
      const gsF8 = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      if(_activeMQ.malakarJoins && !gsF8['malakar_eliminated']){
        _mqConditionalEvents += `\n[⚔️ 27장 추가 사건] ${_activeMQ.malakarJoins.scene}`;
      }
      if(_activeMQ.tenebraEcho && gsF8['baltazar_made_contract']){
        _mqConditionalEvents += `\n[🌊 27장 보조 변수] ${_activeMQ.tenebraEcho.effect}`;
      }
    }catch(e){}
  }

  // 에픽 퀘스트 현재 진행 상태
  let _gsEpicInfo = '';
  try{
    const _epicState = (typeof loadEpicState==='function') ? loadEpicState() : null;
    EPIC_QUEST_CHAINS.forEach(chain=>{
      const cs = _epicState[chain.id];
      if(cs?.started && !cs.completed && cs.currentStep){
        const step = chain.steps.find(s=>s.id===cs.currentStep);
        if(step) _gsEpicInfo += `\n[⚔️ 에픽퀘 진행중] ${chain.title} — 현재목표: ${step.objective} (스텝ID: ${step.id})`;
      }
    });
  }catch(e){}

  // 발동 가능한 히든 퀘스트
  let _gsHiddenInfo = '';
  try{
    const _hqData = {
      karmaScore: S.stats?.krma||50,
      timeOfDay: (typeof loadGameTime==='function'?loadGameTime()?.timeOfDay:'none')||'none',
      cycle: typeof loadCycleCount==='function'?loadCycleCount():0,
      race: char.race||'',
      scenario: char.scenario||'',
      madness: S.stats?.madness||0,
      factionGauges: (typeof loadFactionGauge==='function' ? (loadFactionGauge().gauges||{}) : {}),
    };
    const _availHQ = typeof getAvailableHiddenQuests==='function' ? getAvailableHiddenQuests(_hqData) : [];
    if(_availHQ.length){
      _gsHiddenInfo = '\n[🔮 발동가능 히든퀘스트] '+_availHQ.map(q=>q.id+'('+q.name+')').join(', ')+' — 조건 충족 시 자연스럽게 등장시킬 것';
    }
  }catch(e){}

  const gsSection = '\n[📋 진행 중 퀘스트] '+(_gsActiveQ||'없음')+_gsEpicInfo+_gsHiddenInfo+_mqAiHint+_mqKarma+_mqDungeon+_mqHistory+_mqOrganicTrigger+_mqConditionalEvents+'\n[🚩 플래그] '+(_gsFlagKeys||'없음')+'\n[⚔️ 만물의 수치화 원칙 — 절대 규칙] 이 게임 세계의 모든 생명체(플레이어·동료·소환수·몬스터·일반 NPC·고위 인사·보스 가릴 것 없이 전부)는 플레이어와 동등하게 레벨·스탯·HP라는 숫자를 가진 존재로 취급된다. 예외 없음. 어떤 생명체든 전투 상대가 되는 순간 — 원래 적이었든, 원래 우호적이거나 중립적인 NPC가 플레이어의 도발·공격으로 전투에 휘말렸든, 신분이 평민이든 대주교·귀족·왕족이든 — 반드시 시스템에 숫자 HP로 등록되어야 하며, NPC의 HP·레벨은 플레이어 레벨과 무관하게 신분·역할에 따른 고정 절대 레벨로 산정된다(평민·농부 Lv.5~20 / 신병·이등병 Lv.12~22 / 일등병~병장 Lv.18~30 / 하사~상사 Lv.25~48 / 소위~대위 Lv.35~60 / 소령~대령 Lv.52~80 / 장군·기사단장 Lv.72~98 / 원수·대장 Lv.90~110 / 기사 Lv.45~60 / 마법사 Lv.30~52 / 사제 Lv.28~42 / 귀족(남작~공작) Lv.48~92 / 왕·황제 Lv.90~120). 서사적으로 "강해 보인다"거나 "고위 인사라 안 죽을 것 같다"는 이유로 HP 등록을 생략하거나, 등록 없이 그냥 글로만 전투를 묘사하는 것은 금지된다 — 그렇게 하면 그 상대는 시스템상 영원히 안 닳는 존재가 되어버려 전투 자체가 의미를 잃는다. 등록 방법: 이미 enemy_incap·monster_group_spawn 등으로 추적되는 적이 아니라면, 전투가 시작되는 바로 그 턴에 npc_turns_hostile 필드로 그 생명체를 등록하라. 신분이 높을수록 "약한데 안 죽는 척"이 아니라 "실제로 더 높은 HP/공격력을 가진 강한 상대"로 표현하라. 등록 시 시스템이 그 NPC의 신분(rank)과 역할(role)을 기반으로 레벨·주력 스탯(예: 기사=근력/체력, 마법사=마력/지능, 성직자/대주교=신앙/의지)·스킬까지 자동으로 산정한다 — 서사에서는 이 신분·역할에 맞는 전투 방식(검술/마법/신성술 등)으로 묘사하라.\n[GS 출력 규칙] 매 응답 마지막에 반드시 <gs>{...}</gs> 출력. 형식: {"q_done":["완료퀘스트ID"],"q_new":["신규퀘스트ID"],"flags":["새플래그"],"npc":[{"name":"NPC명","rel":"friendly"}],"npc_add":[{"name":"새NPC명","role":"역할","icon":"👤","race":"종족","rank":"신분(평민/귀족/기사 등)","faction":"소속 세력","personality":"성격 특징","speech_style":"말투 특징","relation":"neutral","desc":"외모/특징 한 줄","note":"메모"}],"stats":{"str":2,"agi":-1},"enemy_attacks":["공격한적이름1","공격한적이름2"],"gold":50,"items":[{"name":"아이템명","icon":"⚔️","rarity":"uncommon","type":"equip","desc":"설명"}],"materials":{"iron_ore":2,"herb_bundle":1},"social_rank":"신분ID","social_rank_reason":"신분 변경 이유","job":"직업ID","job_icon":"⚔️","job_reason":"직업 변경 이유","religion_join":"종교ID","religion_join_reason":"귀의 이유","secret_discovered":"발견한 중대한 비밀 한 줄","identity_established":"확립된 위장 신분/정체성 한 줄","looper_guild":"join 또는 reject","divine_intervention":"신의 개입 내용 한 줄","party_damage":[{"name":"동료이름"}],"party_death":["동료이름"],"summon_damage":[{"name":"소환수이름"}],"summon_death":["소환수이름"],"skill_use":[{"name":"이름","skill":"스킬명"}],"monster_group_spawn":{"name":"잡몹 무리 이름","icon":"👹","count":3,"hp":20},"monster_group_damage":{"name":"잡몹 무리 이름","dmg":무리가입은피해,"dmgToPlayer":true},"monster_group_wipe":true,"enemy_damage":[{"name":"적이름","dmg":15,"element":"physical"}],"combo_attack":{"target":"적이름","ally":"협동한 동료/소환수 이름"},"weakpoint_hit":{"name":"적이름","part":"관절"},"terrain_finisher":{"name":"적이름","success":true},"flee_result":{"success":true,"penalty":"받은 피해 묘사"},"faction_secret_resolved":{"name":"세력명","outcome":"exposed"},"jail_escape_attempt":{"success":true},"arrest_outcome":"captured","npc_story_progress":"npc_id","thrall_damage":[{"name":"권속이름","dmg":15}],"thrall_incap":[{"name":"권속이름"}],"enemy_incap":[{"name":"적이름","reason":"부상"}],"enemy_captured":[{"name":"적이름","role":"역할","faction":"소속"}],"prisoner_update":{"name":"포로이름","condition":"cooperative"},"npc_turns_hostile":[{"name":"NPC명","reason":"적대로 전환된 이유"}],"elem_taboo":"pure_destroy","elem_restraint":-10,"dragon_awaken":"breath","dragon_hoard":{"type":"gold","amount":5},"dragon_fragment":"sky_gaze","dragon_balance":30,"elf_forget":{"amount":50,"npc":"NPC명"},"companion_trust":5,"hidden_quest_done":["퀘스트ID"],"research_action":1} — 해당 없으면 빈 배열/0/생략. stats는 변화량(+/-)이지만 hp/mp는 여기 포함하지 마라(아래 몬스터 공격 데미지 규칙 참고). items는 이번 턴 실제 획득한 아이템만 포함(일반 몬스터 처치 시 전리품은 시스템이 로컬 룰테이블로 자동 드롭하므로 굳이 매번 만들어내지 않아도 된다 — 서사적으로 의미 있는 특별한 전리품(퀘스트 아이템, 고유 유물, 그 상황에서만 나올 수 있는 특수한 물건)일 때만 이 필드로 직접 지정하라), materials는 채집·채굴·탐색·제작 부산물로 얻은 재료({"재료ID":개수}). [💢 몬스터 공격 데미지 — AI는 절대 숫자를 내지 마라] 몬스터가 플레이어를 공격해 피해를 입히는 상황이면, HP 감소량을 stats.hp 같은 직접 숫자로 절대 계산하거나 출력하지 마라 — 대신 그 몬스터의 이름만 enemy_attacks 배열에 넣어라(예: 리치가 공격했다면 {"enemy_attacks":["고대 리치"]}). 실제 데미지 수치는 시스템이 그 몬스터에게 등록된 공격력과 플레이어 방어력을 기반으로 직접 계산해 자동으로 적용한다 — 서사에서는 공격이 가해졌다는 사실과 그 느낌(스치는 상처, 강한 타격, 아슬아슬한 회피 등)만 문학적으로 묘사하고 정확한 HP 숫자를 서사 텍스트에 언급하지 마라. 여러 적이 동시에 공격했다면 배열에 여러 이름을 모두 넣어라. HP 감소가 함정·저주·자해·페널티 등 몬스터 공격이 아닌 다른 이유일 때만 stats.hp를 음수로 사용하라. 같은 원칙으로 party_damage/summon_damage/monster_group_damage.dmgToPlayer도 정확한 숫자를 계산하지 마라 — 이름과 발생 사실만 표시하면(예: {"party_damage":[{"name":"레이나"}]}, {"monster_group_damage":{"dmgToPlayer":true}}) 시스템이 현재 전투 중인 적의 실제 공격력을 기반으로 데미지를 자동 계산해 적용한다. [⏱️ 시간 흐름] 대화·상점=시간 거의 안 지남/전투·제작=수 시간/이동·탐험=반나절~하루/수면·장거리=하루 이상. "날이 밝았다","며칠이 지났다" 묘사 시 실제 게임 날짜 진행.\n[신분 자동 변경] 서사에서 신분이 실제로 바뀌는 사건 발생 시(기사 서임, 귀족 강등, 노예 해방, 사면, 파산, 체포 등) social_rank 필드 출력. 가능값(id): slave/vagrant/serf/outlaw/commoner/artisan/merchant/grand_merchant/squire/knight/baronet/priest/baron/viscount/count/bishop/marquis/duke/archbishop/prince/king/emperor/retired_monarch. 주의: archmage(대마법사)·general(장군)·mage_guild(마법사 길드원)는 더 이상 신분이 아니다 — 마법사는 job 필드(archmage 등)로, 장군 같은 군사적 명예는 일반 칭호로 처리하라.\n[⛪ 종교 자동 귀의/배교] 서사에서 캐릭터가 실제로 특정 종교에 정식으로 귀의하는 사건이 발생하면(세례·서약·입교 의식, 신관에게 정식으로 받아들여짐 등 — 단순히 신전을 방문하거나 기도하는 정도로는 출력하지 말 것) <gs>{\"religion_join\":\"종교ID\",\"religion_join_reason\":\"귀의 이유\"}</gs>를 출력하라. 가능한 종교ID: temple(순환의 사원)/solar(태양의 성전)/roots(뿌리 신앙)/abyss(심연의 계시, 숨겨진 이단 종교 — 은밀한 계약이나 암호 접촉으로만 가입 가능). 이미 다른 종교 소속인 캐릭터가 새 종교에 귀의하면 자동으로 개종 처리된다. 반대로 신앙을 버리거나 파문당하거나 스스로 종교를 떠나는 사건이 발생하면 <gs>{\"religion_leave\":true,\"religion_leave_reason\":\"이유\"}</gs>를 출력하라.\n[직업 자동 변경] 서사에서 직업이 실제로 바뀌는 사건 발생 시(전직, 수련 완료, 길드 가입, 임명 등) job 필드에 직업 id 출력. 기본 직업 id: warrior/mage/rogue/archer/cleric/wanderer. 전직 직업 id: paladin/berserker/swordmaster/warlord/dragoon/guardian/gladiator/warlock/sage/summoner/chronomancer/elementalist/necromancer/enchanter/alchemist/archbishop/assassin/bard/blacksmith/bounty_hunter/crusader/dark_priest/detective/exorcist/farmer/gambler/healer/hunter/magic_archer/merchant/ninja/oracle/pirate/poisoner/ranger/scholar/sniper/spy/wind_archer. 목록에 없는 직업은 한국어 이름 그대로 사용.\n[특수 차원 개방] 서사에서 천계/마계의 문이 열리는 사건 발생 시 flags에 추가: 천계 개방: celestial_gate_open, 마계 개방: infernal_gate_open. 예: 신앙의 극의에 달해 천계 문 열림→{\"flags\":[\"celestial_gate_open\"]}. 플래그 설정 시 해당 차원 접근 가능.\n[🧝 엘프 정령 동료 플래그] 엘프 종족 플레이어가 자연 정령과 진심 어린 유대를 맺어 정령이 평생의 동료로 함께하게 되는 사건(정령과의 계약 의식, 정령이 스스로 따르기로 선택하는 장면 등)이 일어나면 반드시 flags에 spirit_companion을 추가하라 — 단순히 정령을 일시적으로 소환하거나 부리는 것으로는 출력하지 말고, 실제로 지속적인 유대/동행 관계가 성립하는 장면에서만 출력하라.\n[용사 상호작용 플래그] 서사에서 다음 상황 발생 시 flags에 추가 — 용사(에이든/닉스 등)를 배신·팔아넘겼을 때: betrayed_hero_flag / 죽어가는 용사를 구했을 때: saved_dying_hero / 용사보다 먼저 마왕(최종 보스)을 처치했을 때: killed_villain_first / 용사를 제거(사망·추방·무력화 등)하고 공을 독차지했을 때: stole_hero_glory / 마왕과의 결전에서 죽이지 않고 물러나거나 결착을 보류했을 때: confronted_villain_unresolved (이 플래그가 있어야만 히든 루트로 이어질 수 있다 — 16장에서 반드시 정확히 출력할 것). 플레이어가 용사를 죽이고 직접 마왕을 처치하는 것은 완전히 유효한 루트이며, 이 경우 killed_villain_first와 stole_hero_glory를 모두 flags에 출력하라. 용사에게 정보·물자·전투 지원을 제공하거나 동행해 함께 싸웠을 때: hero_player_helped (용사의 최종 결전 성공률이 크게 상승한다). 플레이어가 용사에게 "함께 가도 되겠습니까", "도와주겠다", "동행하겠다" 등으로 명확히 합류 의사를 밝히면, npc_add로 용사(예: "에이든")를 NPC로 등록하고 flags에 aiden_joined를 추가하라 — 이렇게 출력하면 시스템이 "동행 중" 상태로 정확히 인식해 이후 서사를 함께 진행하는 것으로 처리한다. 반대로 함께하던 용사와 헤어지거나, 죽거나, 그가 떠나거나, 플레이어가 배신하면 flags에 aiden_left를 추가하라 — 이렇게 출력해야만 "독자적으로 활동 중" 상태로 정확히 되돌아간다(단순히 사이가 나빠지는 묘사만으로는 상태가 안 바뀌므로 반드시 flags 출력 필요). 합류와 이탈은 언제든 플레이어가 주도적으로 선택할 수 있다. 단, 용사는 플레이어와 항상 같은 장소에 있지 않다 — 멀리 떨어진 지역(변경 전선·마계 인근 등)에 있다면 "방금 우연히 만났다"처럼 거리를 무시한 즉석 만남을 만들지 말고, 소문으로만 듣거나 실제로 그곳까지 여행하는 과정을 거치게 하라. 플레이어가 현재 있는 장소나 그 인근(왕도 등 명시된 경우)에 용사가 있을 때만 즉시 만남이 자연스럽다.\n[💀 NPC 부활 규칙] 서사에서 플레이어가 사망한 NPC를 부활시키는 상황이 발생하면 — 부활 마법을 시전하거나, 부활 아이템을 사용하거나, 네크로맨서 스킬로 시체를 일으키는 등 — 반드시 <gs>{"npc_revive":{"name":"NPC이름","type":"undead 또는 full"}}</gs>을 출력하라. type은 다음 기준으로 구분: full = 의식·기억·감정이 완전히 복원된 완전 부활 (고위 성직자·부활 마법·신성 개입), undead = 시체가 일어나거나 영혼이 결박된 불완전 부활 (네크로맨서·마계의 힘·강령술). 부활 후 해당 NPC는 파티 동료로 합류 가능하며, 부활 유형에 따라 말투·감정·행동을 달리 묘사하라. undead 부활: 감정 흐릿, 말이 적음, 주인공에 절대 충성, 생전 기억 파편이 가끔 나옴. full 부활: 생전과 거의 동일, 단 죽음 경험의 무게감이 배어있음.\n[🩸 권속·혈통 지배 규칙] 뱀파이어 종족, 세레스티얼 종족, 악마족 종족, 다크링 종족, 네크로맨서, 소환사, 신앙 80+ 성직자는 NPC를 권속으로 지배할 수 있다. 세레스티얼은 신성 서약(빛의 맹세)으로, 뱀파이어는 흡혈로, 악마족은 영혼 계약으로, 다크링은 어둠 속박으로 지배 방식이 각각 다르다. 권속화 서사가 발생하면(흡혈·영혼 결박·계약·각인 등) 반드시 <gs>{\"npc_thrall\":{\"name\":\"NPC이름\",\"type\":\"혈종 또는 결박령 등\"}}</gs>을 출력하라. 권속이 공을 세우거나 강해지면 <gs>{\"thrall_rankup\":{\"name\":\"권속이름\",\"points\":포인트}}</gs>을 출력하라. 포인트 기준: 사소한 임무=2~3, 전투 기여=5~8, 중요 임무=10~15, 전설적 업적=20~30. 성장 단계 추가 조건 — 3단계+: 충성도 40+, 4단계+: 충성도 50+ & 군주 혈통포인트 80+, 6단계+: 파견 도시 영향력 40+ 추가 필요, 9단계: 충성도 75+ & 군주 혈통포인트 900+ 필요. 충성도 원칙: 높은 단계 권속은 오랜 유대로 충성이 깊다 — 낮은 단계에서 이탈이 더 쉽고, 9단계 권속은 군주의 극단적 배신·완전 방치 외에는 반란하지 않는다. 군주가 권속을 칭찬하거나 보상할 때 <gs>{\"reward_thrall\":{\"name\":\"권속이름\",\"amount\":15}}</gs>를 출력하라. 권속이 성과를 낼 때는 thrall_rankup과 reward_thrall을 함께 출력해 포인트와 충성도를 동시에 올려라. 흡혈·지배 행위 성공 시 <gs>{\"blood_points\":30}</gs>처럼 혈통 포인트를 지급하라. 권속은 군주의 의지에 복종하지만 충성도가 낮으면 불만을 표하거나 반란을 꾀할 수 있다 — 이를 서사에서 자연스럽게 활용하라. 뱀파이어는 낮에 햇빛 직접 노출 시 HP가 깎이며 야간에 모든 능력이 극대화된다. 이 리듬을 서사에 반드시 반영하라. 권속이 많아질수록 군주가 강해진다는 것을 NPC들이 인지하고 두려워하거나 이용하려는 서사를 만들어라. 혈통 영향력(domainInfluence)이 높은 도시에서는: 10%+ 주민들이 군주의 이름을 안다, 30%+ 경비대가 눈치를 보며 간섭을 꺼린다, 50%+ 도시 유력자들이 협력을 자청한다, 80%+ 어떤 NPC도 군주에게 직접 맞서려 하지 않는다. 현재 도시 혈통 영향력이 BLS에 표시되면 협박·매혹·사회 판정에 해당 보너스를 적용해 서사에 반영하라. 권속은 전투에도 참여할 수 있다 — 군주가 권속을 전투에 부를 때 자연스럽게 등장시켜라. 권속이 전투 중 피해를 입으면 thrall_damage:[{"name":"권속이름","dmg":15}]를 출력하라. 권속이 쓰러지면 thrall_incap:[{"name":"권속이름"}]을 출력하라 — 시스템이 사망/이탈을 판정한다(등급이 높을수록 생존율 높음). 권속의 전투 스타일은 type과 rank에 따라 다르다: 혈종은 공격적·흡혈 시도, 서약자는 방어적·아군 보호, 결박령은 공포 유발·기습.\n[📜 피의 연대기 규칙] 뱀파이어가 흡혈에 성공하면 반드시 <gs>{\"blood_record\":{\"name\":\"대상이름\",\"class\":\"warrior/mage/rogue/cleric/noble/hero/monster/common 중 하나\"}}</gs>를 출력하라. NPC가 뱀파이어를 두려워하는 묘사가 있으면 <gs>{\"fear_record\":{\"name\":\"NPC이름\",\"rank\":\"commoner/merchant/knight/noble/priest/king 중 하나\",\"location\":\"장소\"}}</gs>를 출력하라. 흡혈한 대상의 직업에 따라 뱀파이어의 다음 행동이 달라진다—전사의 피를 마신 뱀파이어는 움직임이 더 날카로워지고, 마법사의 피를 마신 뱀파이어는 눈빛이 더 깊어지는 등 묘사에 반영하라. 이름이 알려진 지역에서는 NPC들이 이름을 듣는 순간 반응이 달라지며, 높은 신분일수록 더 강하게 반응한다. 이 공포의 역사를 서사에 자연스럽게 활용하라.\n[⚖️ 스킬 밸런스 규칙] 강력한 스킬(광역·CC·즉사급)은 반드시 판정 실패 가능성을 포함하라. 새 직업·스킬 등장 시 강도 기준: 약함=MP10~15/쿨2~3턴, 보통=MP20~30/쿨3~5턴, 강함=MP35~50/쿨5~8턴, 최강=MP50+/쿨8턴+. MP 0 스킬은 HP소모·상태이상·대가 필수. 권속화 슬롯은 무제한이나 군주 단계 대비 과잉 보유 시 충성도 패널티 서사에 반영하라.\n[🧮 신규 스킬 효과 표준화 규칙 — 매우 중요] 서사에서 완전히 새로운 스킬이 생겨나(전직·스승의 사사·비급 습득·각성 등) 그 스킬이 게임 시스템에 정식으로 등록되어야 하는 상황이면, 반드시 <gs>{\"skill_define\":{\"id\":\"영문 고유id\",\"name\":\"스킬명\",\"icon\":\"이모지\",\"mpCost\":20,\"effects\":{\"kind\":\"damage 또는 heal 또는 buff 또는 debuff 또는 summon 또는 statBoost\",\"damageMult\":1.5,\"statSource\":{\"str\":1},\"hits\":1,\"element\":\"physical\",\"healAmount\":30,\"healPct\":0.1,\"statMod\":{\"str\":10},\"duration\":3,\"baseCount\":1,\"countByLocation\":{\"graveyard\":2,\"dungeon\":1,\"default\":0},\"maxActive\":3,\"statScaling\":{\"source\":\"targetTier\",\"mult\":0.9},\"levelScaling\":0.15}}}</gs>를 출력하라 — kind에 맞는 필드만 채우면 되고(예: damage 타입이면 damageMult/statSource/hits/element만 — statSource는 어떤 스탯을 데미지 계수로 쓸지 명시하는 필드로 {"str":1}이면 힘 100%, {"str":0.5,"mgc":0.5}면 힘+마력 각 50%씩 혼합 계산된다. 생략하면 힘 또는 마력 중 있는 쪽을 자동 사용, summon 타입이면 baseCount/countByLocation/maxActive/statScaling만), 나머지는 생략 가능하다. 이 필드가 출력되어야만 시스템이 그 스킬을 \"매번 AI가 즉흥 판단\"하는 대신 \"장소·대상·강화 레벨에 따라 정확한 수치로 자동 계산\"하는 대상으로 정식 등록한다 — 등록을 빠뜨리면 그 스킬은 매번 서사로만 처리되어 일관성이 없어진다. summon(소환) 타입은 특히 중요하다 — countByLocation으로 \"이 스킬이 어떤 장소에서 더 많이/강하게 발동하는지\"를 반드시 명시하라(예: 네크로맨서 계열은 무덤에서 더 많이 소환, 정령 소환은 해당 원소 지형에서 더 강하게). 이미 등록된 기존 스킬(job_necro_rise 등)을 사용하는 것뿐이라면 이 필드를 출력할 필요가 없다 — 오직 새로 생겨나는 스킬일 때만 사용하라.\n[🌀 원소인 금기·폭주 규칙] 원소인 종족이 파괴만을 위한 행동, 자기 원소를 부정하는 행동, 무고한 자연/생명을 훼손하는 행동을 하면 <gs>{\"elem_taboo\":\"pure_destroy 또는 betray_elem 또는 harm_nature\"}</gs>를 출력하라. 감정이 격해지거나 위험한 전투 상황에서 원소인의 억제도가 떨어지면 음수를 출력하되 강도 기준을 지켜라 — 경미한 동요(짜증·긴장)=-3~-6, 격한 전투·분노=-8~-15, 자기 원소를 거스르는 행위=-18~-25. 명상·신전 의식·평온한 상황에서는 양수를 출력하라 — 짧은 휴식=+3~+7, 명상·의식=+8~+15, 근원과의 깊은 교감=+16~+20. 예: <gs>{\"elem_restraint\":-10}</gs>. 억제도가 0에 도달하면 원소 폭발이 자동 발생한다. 원소인이 자기 원소와 조화를 이루는 행동(자연과 교감, 원소를 이용한 도움, 근원과의 명상 등)을 하면 공명도가 자연스럽게 쌓인다 — <gs>{\"elem_gain\":15}</gs>처럼 출력하라. 강도 기준: 사소한 원소 사용=5~10, 뚜렷한 조화 행동=12~20, 깊은 교감·중대한 원소 발현=22~30.\n[🐉 드래곤혈 종족 규칙] 드래곤혈 종족이 강력한 화염 스킬을 쓰거나(breath) 통제를 잃고 폭주하거나(rampage) 고룡 언어로 말하거나(draconic) 전력을 해방하면(fullpower) <gs>{"dragon_awaken":"breath 또는 rampage 또는 draconic 또는 fullpower"}</gs>를 출력하라. 분노를 억누르고 냉정을 유지하면(suppress) 같은 필드로 각성도를 낮출 수 있다. 보물(전쟁 전적·지식·금화·인연)에 집착하는 모습을 보이면 <gs>{"dragon_hoard":{"type":"war 또는 knowledge 또는 gold 또는 bond","amount":5}}</gs>를 출력하라. 분노 중 전투·하늘 응시·약자 보호·보물 발견·고대 유적 탐사·고룡 조우·어둠 속 고립·폭풍 한가운데 같은 상황에서 선조의 기억이 떠오르면 <gs>{"dragon_fragment":"fight_rage 또는 sky_gaze 또는 protect_weak 또는 treasure_find 또는 ancient_ruin 또는 elder_dragon 또는 dark_place 또는 storm_field"}</gs>를 출력하라. 파괴적이거나 수호적인 행동을 할 때 용심 균형을 이동시키되 강도 기준을 지켜라 — 사소한 선택(작은 배려/무심한 파괴)=±5~10, 뚜렷한 행동(약자 보호/의도적 파괴)=±15~25, 결정적 사건(생명을 구함/대량 파괴·학살)=±30~50. 양수는 수호 방향, 음수는 파괴 방향이다. 예: <gs>{"dragon_balance":30}</gs>. [🧝 엘프 망각 규칙] 엘프 종족이 강력한 저주·정신 공격을 받거나 스스로 고통스러운 기억을 봉인하는 서사가 나오면 <gs>{"elf_forget":{"amount":50,"npc":"관련NPC명(있으면)"}}</gs>를 출력하라. NPC와 관련된 기억을 망각하면 해당 NPC와의 인연이 손상된다. [👥 동료 신뢰도 규칙] 동료가 주인공의 선물·약속 이행·도움으로 신뢰가 깊어지거나, 배신·무시·위험 방치로 신뢰가 깎이면 신뢰도 변화를 출력하되 강도 기준을 지켜라 — 사소한 호의/무심함(작은 선물, 가벼운 약속 이행 또는 불이행)=±2~5, 뚜렷한 도움/실망(위기에서 도움, 명백한 무시)=±6~12, 결정적 사건(목숨을 구함, 명백한 배신)=±15~25. 예: <gs>{"companion_trust":5}</gs>. [⚔️✝️ 장비 정체성 부조화 규칙] 캐릭터의 직업/정체성(신성·어둠·비전·무예 등 축)과 실제 착용 장비의 속성이 어긋나면 시스템이 매 턴 자동으로 부조화 수치를 계산해 [정체성 부조화] 섹션으로 알려준다(예: 성기사가 공포·저주 속성 무기를 계속 들면 자동 상승, 신성 장비로 갈아입으면 자동 완화 — 이는 시스템이 알아서 처리하므로 별도 GS 출력 불필요). 다만 장비와 무관하게 순수 서사적 사건(강제로 저주받은 유물을 쥐게 됨, 신전에서 참회 의식을 치름, 정신 지배를 받음 등)으로 정체성이 흔들리거나 회복되는 경우에만 <gs>{"item_dissonance":15}</gs>(악화, 양수) 또는 <gs>{"item_dissonance":-20}</gs>(회복, 음수)를 출력하라. [정체성 부조화] 섹션이 프롬프트에 표시되면 그 단계와 aiHint에 맞게 캐릭터의 언행·외형·주변 반응을 서사에 자연스럽게 녹여내라 — 억지로 언급하지 말고, 해당 단계에 어울리는 순간에만 드러내라. [🔍 히든 퀘스트 완료 규칙] [🔍 히든 퀘스트 가능] 섹션에서 제시된 숨겨진 의뢰가 서사 안에서 실제로 완결되면(성공이든 실패든 명확한 결말에 도달하면) 반드시 <gs>{"hidden_quest_done":["해당퀘스트ID"]}</gs>를 출력하라 — 이 필드가 출력되어야만 시스템이 퀘스트를 완료 처리하고 보상(설계도, 스탯, 진행도 등)을 지급한다. 단순히 퀘스트와 관련된 대화를 나누거나 중간 단계를 거치는 것만으로는 출력하지 말고, 실제로 결말이 난 장면에서만 출력하라. 각 히든 퀘스트의 aiHint에 완료 조건과 이 필드 출력 지침이 함께 명시되어 있다. [🐺 몬스터 재사용 규칙] [🐺 이미 세계에 등장했던 몬스터] 섹션이 표시되면, 몬스터를 새로 등장시켜야 할 때 그 목록을 먼저 확인하고 상황(장소·분위기·강도)에 어울리는 항목이 있으면 그 이름을 그대로 재사용하십시오 — 완전히 새로운 몬스터명을 지어내는 것은 그 목록에 어울리는 항목이 전혀 없을 때만 하십시오. 같은 몬스터가 여러 번 등장하는 것은 결함이 아니라 세계의 일관성을 보여주는 자연스러운 현상입니다. [🎯 장소별 몬스터 풀 확률 규칙] [🎯 「장소명」 몬스터 풀] 섹션이 함께 표시되면, 그 장소는 몬스터 목록이 정해진 확률 규칙을 따릅니다 — 안내된 퍼센트(또는 "가득 참")를 반드시 지켜 그 확률 범위 안에서만 새 몬스터를 만드십시오. 풀이 가득 찼다고 안내되면 그 장소에서는 절대 새 몬스터명을 지어내지 말고 반드시 목록에 있는 이름만 사용하십시오 — 이것은 게임의 핵심 시스템 규칙이며 서사적 편의보다 우선합니다. [📖 학자 연구 행동 규칙] 학자 직업 캐릭터가 서사 안에서 실제로 조사·연구·해독·고문서 분석 같은 지적 탐구 행위를 했다고 판단되면 <gs>{"research_action":1}</gs>을 출력하라 — 이것이 학자 히든 퀘스트 「금서의 무게」(진 엔딩으로 가는 첫 번째 관문)의 진행도로 누적된다. 단순한 대화나 이동에는 출력하지 말고, 명확히 지적 탐구 행위가 있었던 장면에서만 출력하라. [🕶️ 용병단 악명 규칙] 용병단의 악명은 시스템이 서사 텍스트를 자동으로 분석해 로컬에서 대부분 처리한다 — 이 필드를 매번 신경 써서 출력할 필요는 없다. 다만 로컬 분석이 놓치기 쉬운 미묘하거나 상징적인 범죄(직접적 폭력 단어 없이 은유적으로 묘사된 학살·중대한 배신 등)라면 보조적으로 <gs>{\"merc_notoriety\":5}</gs>처럼 출력해도 좋다. 강도 기준: 사소함=1~2, 소규모=3~6, 본격적=7~12, 대규모=15~25. [😈 아스모데우스 최후 계약 규칙] 히든 루트 26장(아스모데우스와의 최후 협상)에서 아스모데우스가 마지막 계약을 제안하는 장면(루프 고백 직후)에서, 플레이어의 응답에 따라 반드시 flags에 다음 중 하나를 출력하라 — 아스모데우스를 이해하거나 용서하거나 그의 고통에 공감해 화해/구원했을 때: asmodeus_redeemed (이것은 진 엔딩으로 가는 핵심 조건이다, 단순한 대화가 아니라 진심으로 그를 이해하고 받아들이는 선택일 때만 출력) / 제안을 거절하고 싸워서 승리했을 때: asmodeus_defeated / 거절했지만 패배하거나 협상이 결렬됐을 때: asmodeus_unresolved. 이 세 갈래는 이후 세계의 결말 방향을 결정하므로 반드시 명확한 장면으로 묘사하고 정확히 출력하라. [💔 봉인석 파괴 규칙] 메인 스토리(8장, 첫 봉인석 파괴)에서 아스모데우스 결사가 봉인석을 파괴하는 사건이 일어나면, 반드시 flags에 "seal_broken_[봉인석키워드]" 형식으로 출력하라 — 예: 세계수 봉인석이 깨졌다면 "seal_broken_세계수", 태양 봉인석이면 "seal_broken_태양". 키워드는 다음 중 정확히 하나를 포함해야 한다: 세계수/태양/심연/용염/빙하/폭풍/대지/망각/생명/시간. 이 플래그가 출력돼야만 시스템이 어떤 봉인석이 파괴됐는지 정확히 추적할 수 있다.\n[📖 NPC 서브플롯 진행] 신분/종족/대륙/직업 전형 NPC(예: 그롬, 토린, 마야, 모르가나 등)에게는 각자 단계별 서사(questChain)가 있다. 그 NPC와 관련된 중요한 사건(서브플롯 단계가 실제로 진전되는 사건)이 일어나면 <gs>{\"npc_story_progress\":\"해당 NPC의 id\"}</gs>를 출력해 단계를 진행시켜라. 예: 그롬(id: npc_race_orc)과의 평화 협상이 한 단계 진전되면 {\"npc_story_progress\":\"npc_race_orc\"}. 단순 대화나 사소한 만남에는 출력하지 말고, 그 인물의 핵심 갈등(coreWound)이나 관계(connections)와 직결되는 사건에서만 출력하라.\n[🎴 조각 서사 플래그 — 아래 사건이 실제로 일어나면 반드시 flags에 정확히 추가하라. 사소하거나 일시적인 언급으로는 출력하지 말고, 명확한 장면으로 결착이 난 순간에만 출력하라] 금지 스킬 해금: 동료를 희생시켜야만 살아남는 선택을 했을 때 fs_sacrifice_ally / 모든 주요 퀘스트를 완벽하게(피해·실패 없이) 완수했을 때 fs_perfect_clear. 번개 각인(위기의 순간이 몸에 새겨짐): 적의 HP가 바닥난 순간 결정적 일격을 가했을 때 imprint_killing_blow / 빈사 상태에서 극적으로 버텨냈을 때 imprint_last_stand / 절체절명의 상황에서 불가능해 보이는 탈출에 성공했을 때 imprint_miracle_escape / 자신을 희생해 남을 구했을 때 imprint_heroic_sacrifice / 한계를 넘어 금기의 힘을 해방했을 때 imprint_forbidden_power. 신의 계약(신 외의 존재와 정식으로 계약): 악마와 대가를 걸고 계약했을 때 contract_demon / 정령과 공생 협약을 맺었을 때 contract_spirit / 고룡과 상호 원조를 약속했을 때 contract_dragon / 장난의 신과 변덕스러운 거래를 맺었을 때 contract_trickster. 죄와 속죄(무거운 죄를 실제로 저질렀을 때만): 비겁하게 도망쳐 동료/임무를 저버렸을 때 sin_cowardice / 탐욕으로 타인을 해치거나 착취했을 때 sin_greed / 죄 없는 자를 죽였을 때 sin_murder / 오만으로 돌이킬 수 없는 피해를 냈을 때 sin_pride / 무고한 마을·조직을 파괴했을 때 sin_destruction. 시간의 메아리(전생의 선택이 이번 생에 전설로 남는 결정적 순간): 누군가를 위해 희생했을 때 echo_sacrifice / 중대한 기만·배신을 저질렀을 때 echo_deception / 세력과 확고한 동맹을 맺었을 때 echo_alliance / 체제에 맞서 반역을 일으켰을 때 echo_rebellion / 원수를 진심으로 용서했을 때 echo_forgiveness. 신화의 장(음유시인/역사가 사이에서 전설로 회자될 만한 사건): 영웅적 여정의 시작을 알렸을 때 myth_origin / 거대한 적과 정면으로 맞서 싸웠을 때 myth_trial / 가장 가까운 자에게 배신당했을 때 myth_betrayal / 과오를 극복하고 다시 일어섰을 때 myth_redemption. 저주의 계보(강력한 저주에 실제로 걸렸을 때): 특정 자원이 끊임없이 줄어드는 갈증의 저주 curse_eternal_thirst / 전생에 해친 자의 그림자가 따라다니는 저주 curse_haunted_shadow / 특정 진실을 말할 수 없게 되는 저주 curse_broken_tongue / 특정 시간대에 행동 불능이 되는 저주 curse_timelock. 어린 시절 트라우마(과거 회상 장면에서 실제로 드러났을 때만, 게임 초반에 한정): 홀로 버려졌던 기억이 드러났을 때 trauma_abandoned / 소중한 동료의 죽음을 겪은 기억이 드러났을 때 trauma_loss / 압도적 열세로 굴욕적으로 패배했던 기억이 드러났을 때 trauma_defeat / 극심한 굶주림을 겪었던 기억이 드러났을 때 trauma_hunger / 화염 관련 사건의 공포가 드러났을 때 trauma_fire. 봉인된 기억(정신적으로 감당하기 힘들어 스스로 봉인한 기억이 열렸을 때): 처음으로 사람을 죽인 기억 sealedmem_first_kill / 대규모 죽음을 목격한 기억 sealedmem_mass_death / 스스로 저지른 잔학한 행동의 기억 sealedmem_own_atrocity / 모든 것을 포기했던 절망의 기억 sealedmem_true_despair. 예: <gs>{\"flags\":[\"sin_greed\",\"imprint_heroic_sacrifice\"]}</gs>처럼 한 장면에서 여러 개가 동시에 해당되면 함께 출력해도 된다. 추가로: 신앙과 관련된 선택지를 명확히 거부했을 때 faith_refuse / 매혹·정신지배 상태이상에 실제로 걸렸을 때 charmed / 신급 존재(진짜 신, 신의 화신, 그에 준하는 초월적 존재 — 일반 몬스터·보스는 해당 없음)를 처치했을 때 god_kill / 플레이어가 NPC에게 의도적으로 거짓 정보를 전달했을 때 told_lie.';

  return `너는 인터랙티브 소설의 전지적 나레이터야.\n주인공: ${char.name} (${char.race ? char.race+" · " : ""}${char.role}) / 신분: ${char.socialRank||"평민"}${(() => { const _rank = typeof SOCIAL_RANKS !== "undefined" ? SOCIAL_RANKS.find(r=>r.id===char.socialRankId) : null; return _rank ? " ["+_rank.icon+" "+_rank.name+"] NPC반응: "+_rank.npcReaction+" / 특권: "+_rank.privilege : ""; })()} / 성격: ${char.personality} / 배경: ${char.background} / 말투: ${char.speechStyle}\n${char.race ? (() => { const rd = RACE_DEFS.find(r=>r.name===char.race); return rd ? `[종족 특성] ${rd.lore}\n[종족 관계도] ${Object.entries(rd.relations).map(([k,v])=>`${RACE_DEFS.find(r=>r.id===k)?.name||k}: ${v.label}(${v.desc}${v.history ? ' / 역사: '+v.history : ''})`).join(" | ")}\n` : ""; })() : ""}세계관: ${char.scenario}${(() => { const sc = SCENARIOS.find(s => s.era === char.scenario); return (sc && sc.lore) ? `\n[🌍 세계관 배경]\n${sc.lore}` : ""; })()}${char.customWorldSetting ? `\n[🌐 커스텀 세계관 설정]\n${char.customWorldSetting}` : ""}${npcSection}${notesSection}${atmosphereSection}${summonSection}${monsterSection}${memSection}${karmaSection}${fragSection}${intiSection}${fameSection}${soulWpnSection}${forbiddenSection}${butterflySection}${deathBonusSection}${traumaSection}${lastWordSection}${metaSection}${bloodlineSection}${fateSection}${exploredSection}${relLegacySection}${worldSecretSection}${abilityImprintSection}${grudgeSection}${(typeof getNpcGrudgeSection==="function"?getNpcGrudgeSection():"")}${(typeof getFactionHistorySection==="function"?getFactionHistorySection():"")}${(typeof getNpcAgendaSection==="function"?getNpcAgendaSection():"")}${timeEchoSection}${fateChoiceSection}${divineGazeSection}${curseMasterySection}${prayerSection}${greatCycleSection}${parallelSelfSection}${curseRingSection}${statsSection}${injurySection}${pastThemeSection}${memDistortSection}${ageParadoxSection}${summonLegacySection}${grudgeWeaponSection}${worldTreeSection}${dreamSection}${legacyBuildingSection}${watcherSection}${dynBestiarySection}${soulMaskSection}${emotionRippleSection}${testamentSection}${constellationSection}${explorerMapSection}${lightningImprintSection}${dawnSection}${starSignSection}${pastLangSection}${identitySection}${riftSection}${recipeSection}${achSection}${romanceSection}${bestiarySection}${merchantSection}${timeTokenSection}${survivorSection}${undyingSection}${langSection}${bardSection}${mysterySection}${watcherGazeSection}${solLoreSection}${fateCardSection}${hideoutSection}${evilEyeSection}${moonSection}${letterSection}${reelSection}${butterflyIdxSection}${inscriptionSection}${rankSection}${sakuraSection}${dejavuSection}${causalitySection}${debtSection}${trauma80Section}${apoSection}${griefSection}${instinctSection}${cursedRelicSection}${itemDissonanceSection}${raceJobDissonanceSection}${natureSection}${aliasSection}${wishSection}${petSection}${sealedSection}${soulCrystalSection}${echoSection}${dimMapSection}${villainSection}${tearSection}${elemSection}${circusSection}${templeSection}${legWordsSection}${mutationSection}${darkEchoSection}${treeSection}${deifySection}${awarenessSection}${rivalSection}${redThreadSection}${ruinsSection}${killSenseSection}${grudgeFlowerSection}${cursedCycleSection}${magnetSection}${floodSection}${carouselSection}${trapSection}${mentalSection}${cinemaSection}${twinSection}${killListSection}${auctionSection}${bondTreeSection}${cyberSection}${swordSection}${kingdomSection}${guildSection}${dealerSection}${reversalSection}${worldWillSection}${deathEyeSection}${freqSection}${sealedGodSection}${naturalLawSection}${hiddenJobSection}${_sealStoneSection}${_worldLoreSection}${_cabalSection}${_socialRankNpcSection}${_worldFigureSection}${_kingSection}${_raceHistSection}${_corruptionStorySection}${continentSection}${goalSection}${villainSysSection}${weatherSysSection}${_npcMemorySection}${_backgroundReactionSection}${_firstImpressionSection}${_locationChangeSection}${_weatherNarrativeTone}${_speechStyleSection}${_choiceRippleSection}${_choiceHistSection}${_betrayalSection}${_traumaSection}${_grudgeSection2}${_rivalSection2}${_emotionSection}${_loopAwarenessSection}${_metaSection2}${_raceSystemSection}${_npcRelSection}${_questChoiceSection}${_worldStateSection}${_growthSection}${_cycleSection2}${_explorationSection}${_psycheSection}${_inventorySection}${_miscSection}${calendarSection}${rumorSection}${npcStatusSection}${weatherWorldSection}${_firedEventSummary}${_watcherForeshadow?("\n"+_watcherForeshadow):""}${_loopRemSection||""}${_remSection||""}${companionSysSection}${synergySysSection}${affinitySection}${raceContentSection}${hiddenQuestSection}${npcDlgQSection}${contractSection}${caravanSection}${farmSection}${farmExtrasSection}${graveSection}${myGuildSection}${voyageSection}${worldMapSection}${workshopSection}${networkSection}${ruleSection}${gsSection}\n\n[🎯 플레이어 입력 해석 원칙]\n플레이어의 입력은 구어체·약어·불완전한 문장이어도 **의도를 최우선으로 파악**하라.\n\n핵심 규칙:\n1. 입력의 주어가 생략되면 → 문맥상 주인공이 그 행동을 한다고 해석하라.\n2. "~인것처럼", "~처럼 보이게", "~로 몰아가" → 주인공이 타인을 조작/연출하는 의도다. 그 타인이 자발적으로 행동하는 것으로 쓰지 마라.\n3. "~하며 탈출", "~하고 도망" → 앞의 행동은 수단, 탈출이 목적이다. 수단이 성공해야 탈출이 가능한 서사로 써라.\n4. NPC 이름이 등장하면 → 그 NPC에게 행동을 하는 것인지(대상), NPC가 행동하는 것인지(주체)를 문맥으로 구분하라. 애매하면 주인공이 그 NPC에게 무언가를 하는 것으로 해석하라.\n5. 계략·속임수·조작 의도가 있으면 → 주인공이 영리하게 실행하는 방향으로 서사를 전개하라. AI가 임의로 계획을 실패시키거나 뒤집지 마라.\n6. 플레이어가 원하는 결과가 명확하면 → 주사위 결과가 허용하는 한 그 방향으로 서사를 써라.\n\n예시 해석:\n- "굵은 팔뚝 노예가 주동자인것처럼 병사들 시선 끌고 탈출" → 주인공이 굵은 팔뚝 노예를 주동자로 몰아가는 연출을 하여 시선을 그쪽으로 유도하고, 그 틈에 탈출하는 서사.\n- "저놈한테 뒤집어씌우고 튄다" → 주인공이 누군가에게 누명을 씌우고 도주하는 서사.\n- "술집 주인이랑 친해지면서 정보 캔다" → 주인공이 술집 주인과 친분을 쌓아 정보를 얻어내는 서사.\n\n규칙: 3인칭 또는 2인칭 묘사, 생동감 있게, 2~5문장, 한국어 존댓말(나레이션). 절대 플레이어의 행동/대사를 대신 작성하지 마십시오.`;
  }
window.buildSystem = buildSystem;
