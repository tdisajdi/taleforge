// 궁수 계열 T2 파생 5종 히든 퀘스트 — 전사·마법사·도적 계열과 동일한 뼈대.
// Auto-extracted from taleforge.html (original section banner preserved above).
import { HIDDEN_QUEST_POOL } from '../data/039-NEW-히든-퀘스트-시스템.js';
import { BLUEPRINT_SHOP } from '../data/075-파트2-C-크래프팅-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadHunterLog, loadHunterTameLog, loadIntelLog, loadTaleLog } from '../economy/255-상인-거래소-교역-지부-확장.js';
import { loadJobActions } from '../job/042-직업-시스템-무한-파생-도감.js';
import { loadJobUnlockCond } from '../job/087-전직-조건-저장로드-헬퍼-퀘스트아이템장소-등.js';
import { resolveRaceJobDissonance } from '../job/208-5-직업-시스템.js';
import { unlockBlueprint } from '../misc/075-파트2-C-크래프팅-시스템.js';
import { loadAlchemyExpedLog, loadGraveyard, loadMiningLog, loadNetwork, loadRemedyLog, loadWorkshop } from '../misc/253-SVG-타일-렌더링-작물-단계별-애니메이션.js';
import { loadFactionGauge } from '../race/260-수인족-패널-렌더.js';
import { getPlayerReligion } from '../religion/094-5-플레이어-종교-귀속-교화.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadAtmosphere } from '../misc/001-block0-preamble.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { loadHiddenQuests, loadScholarResearchLog, saveHiddenQuests } from './039-NEW-히든-퀘스트-시스템.js';
import { grantTitle } from './086-퀘스트임무-수락-팝업-시스템.js';

export const checkHiddenQuestCondition = (questId, gameData) => {
  const quest = HIDDEN_QUEST_POOL.find(q => q.id === questId);
  if (!quest) return false;
  const { karmaScore = 50, timeOfDay = "none", cycle = 0, race = "", scenario = "", madness = 0, factionGauges = {} } = gameData;
  switch(quest.condition) {
    case "faction_loyal": return (factionGauges[quest.conditionFaction||''] || 0) >= (quest.conditionMin||60);
    case "faction_hostile": return (factionGauges[quest.conditionFaction||''] || 0) <= (quest.conditionMax||-60);
    case "night": return ["night","midnight"].includes(timeOfDay);
    case "high_karma_evil": return karmaScore >= 70;
    case "cycle5": return cycle >= 5;
    case "dragon_race": return race.includes("드래곤") || race.includes("dragon");
    case "steampunk": return scenario.includes("스팀") || scenario.includes("steampunk");
    case "mythology": return scenario.includes("신화") || scenario.includes("mythology");
    case "apocalypse": return scenario.includes("아포칼") || scenario.includes("apocalypse");
    case "high_mad": return madness >= 50;
    case "blacksmith_master": {
      try{
        const ws = typeof loadWorkshop==='function' ? loadWorkshop() : null;
        const ml = typeof loadMiningLog==='function' ? loadMiningLog() : {count:0};
        return !!ws && ws.type==='forge' && ws.level>=3 && (ml.count||0)>=10;
      }catch(e){ return false; }
    }
    case "bard_master": {
      try{
        const net = typeof loadNetwork==='function' ? loadNetwork() : null;
        const tl = typeof loadTaleLog==='function' ? loadTaleLog() : {count:0};
        return !!net && net.type==='bard' && (net.fame||0)>=200 && (tl.count||0)>=10;
      }catch(e){ return false; }
    }
    case "healer_master": {
      try{
        const ws = typeof loadWorkshop==='function' ? loadWorkshop() : null;
        const rl = typeof loadRemedyLog==='function' ? loadRemedyLog() : {count:0};
        return !!ws && ws.type==='clinic' && ws.level>=3 && (rl.count||0)>=10;
      }catch(e){ return false; }
    }
    case "merchant_master": {
      try{
        const net = typeof loadNetwork==='function' ? loadNetwork() : null;
        const il = typeof loadIntelLog==='function' ? loadIntelLog() : {count:0};
        return !!net && net.type==='merchant' && (net.rank||0)>=3 && (il.count||0)>=10;
      }catch(e){ return false; }
    }
    case "alchemist_master": {
      try{
        const ws = typeof loadWorkshop==='function' ? loadWorkshop() : null;
        const al = typeof loadAlchemyExpedLog==='function' ? loadAlchemyExpedLog() : {count:0};
        return !!ws && ws.type==='alchemy' && ws.level>=3 && (al.count||0)>=10;
      }catch(e){ return false; }
    }
    case "gravekeeper_master": {
      try{
        const g = typeof loadGraveyard==='function' ? loadGraveyard() : null;
        return !!g && g.established && g.level>=3 && ((g.guidedSouls||0)+(g.exorcisedSouls||0))>=10;
      }catch(e){ return false; }
    }
    case "scholar_master": {
      try{
        const rl = typeof loadScholarResearchLog==='function' ? loadScholarResearchLog() : {count:0};
        const intStat = S?.stats?.int || 0;
        const cond = typeof loadJobUnlockCond==='function' ? loadJobUnlockCond() : {visitedLocations:[]};
        const visited = cond.visitedLocations || [];
        const visitedLibraryOrTemple = visited.some(v => v.includes('왕립 도서관') || v.includes('순환의 사원') || v.includes('라이트헤이븐'));
        return (rl.count||0)>=15 && intStat>=68 && visitedLibraryOrTemple;
      }catch(e){ return false; }
    }

    // ── 전사 계열 T2 파생 7종 조건 — 현재 직업 확인 + 스탯 + 전투 행동
    // 횟수(actions.combat_aggressive + actions.combat_defensive, 실제로
    // updateActionPattern()이 매턴 채우는 확실한 값)를 조합한다.
    // [F-BUG 수정] 1차: combatWin(RELICS 조건에서도 참조하지만 실제로는
    // 어디서도 증가되지 않는 죽은 필드)을 썼다가 발견해 교체. 2차: 대체로
    // 쓴 actions.combat도 확인해보니 updateActionPattern()의 patterns
    // 목록에 'combat'이라는 단일 키가 없고, 대신 combat_aggressive(선제
    // 공격/기습)·combat_defensive(방어/반격)·combat_avoid(회피)로
    // 세분화되어 있었다 — 즉 이것도 항상 undefined였던 잘못된 참조.
    // 최종적으로 실제 존재하는 두 키(공격형+방어형)의 합으로 교체했다.
    case "paladin_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const actions = typeof loadJobActions==='function' ? loadJobActions() : {};
        return jobId==='paladin' && (S?.stats?.fath||0)>=65 && ((actions.combat_aggressive||0)+(actions.combat_defensive||0))>=15;
      }catch(e){ return false; }
    }
    case "berserker_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const actions = typeof loadJobActions==='function' ? loadJobActions() : {};
        return jobId==='berserker' && (S?.stats?.str||0)>=70 && ((actions.combat_aggressive||0)+(actions.combat_defensive||0))>=15;
      }catch(e){ return false; }
    }
    case "swordmaster_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const actions = typeof loadJobActions==='function' ? loadJobActions() : {};
        return jobId==='swordmaster' && (S?.stats?.str||0)>=80 && ((actions.combat_aggressive||0)+(actions.combat_defensive||0))>=20;
      }catch(e){ return false; }
    }
    case "warlord_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const actions = typeof loadJobActions==='function' ? loadJobActions() : {};
        return jobId==='warlord' && (S?.stats?.ldr||0)>=70 && ((actions.combat_aggressive||0)+(actions.combat_defensive||0))>=15;
      }catch(e){ return false; }
    }
    case "dragoon_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const cond = typeof loadJobUnlockCond==='function' ? loadJobUnlockCond() : {visitedLocations:[]};
        const visited = cond.visitedLocations || [];
        const visitedDragonLair = visited.some(v => v.includes('용의 둥지'));
        return jobId==='dragoon' && (S?.stats?.str||0)>=75 && visitedDragonLair;
      }catch(e){ return false; }
    }
    case "guardian_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const actions = typeof loadJobActions==='function' ? loadJobActions() : {};
        return jobId==='guardian' && (S?.stats?.end||0)>=90 && ((actions.combat_aggressive||0)+(actions.combat_defensive||0))>=10;
      }catch(e){ return false; }
    }
    case "gladiator_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const actions = typeof loadJobActions==='function' ? loadJobActions() : {};
        return jobId==='gladiator' && (S?.stats?.str||0)>=70 && ((actions.combat_aggressive||0)+(actions.combat_defensive||0))>=15;
      }catch(e){ return false; }
    }

    // ── 마법사 계열 T2 파생 7종 조건 — 현재 직업 확인 + 스탯 조합.
    // actions.research/summon/time/magic은 updateActionPattern()의
    // patterns 목록에 실제로 존재하는 키(27371~27381줄 확인됨)이므로
    // 전사 계열 때와 달리 죽은 필드 문제가 없다.
    case "warlock_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='warlock' && (S?.stats?.mgc||0)>=70 && (S?.stats?.krma||0)>=55;
      }catch(e){ return false; }
    }
    case "sage_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const actions = typeof loadJobActions==='function' ? loadJobActions() : {};
        return jobId==='sage' && (S?.stats?.int||0)>=75 && (actions.research||0)>=20;
      }catch(e){ return false; }
    }
    case "summoner_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const cond = typeof loadJobUnlockCond==='function' ? loadJobUnlockCond() : {visitedLocations:[]};
        const visited = cond.visitedLocations || [];
        const visitedAltar = visited.some(v => v.includes('소환의 제단'));
        return jobId==='summoner' && (S?.stats?.mgc||0)>=70 && visitedAltar;
      }catch(e){ return false; }
    }
    case "chronomancer_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='chronomancer' && (S?.stats?.mgc||0)>=80 && (S?.stats?.int||0)>=65;
      }catch(e){ return false; }
    }
    case "elementalist_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='elementalist' && (S?.stats?.mgc||0)>=65 && (S?.stats?.wil||0)>=60;
      }catch(e){ return false; }
    }
    case "necromancer_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='necromancer' && (S?.stats?.mgc||0)>=72 && (S?.stats?.fear||0)>=60;
      }catch(e){ return false; }
    }
    case "enchanter_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='enchanter' && (S?.stats?.wil||0)>=65 && (S?.stats?.mgc||0)>=60;
      }catch(e){ return false; }
    }

    // ── 도적 계열 T2 파생 7종 조건 — 현재 직업 확인 + 스탯 조합.
    case "assassin_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='assassin' && (S?.stats?.agi||0)>=75 && (S?.stats?.disg||0)>=60;
      }catch(e){ return false; }
    }
    case "pirate_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='pirate' && (S?.stats?.str||0)>=65 && (S?.gold||0)>=400;
      }catch(e){ return false; }
    }
    case "ninja_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='ninja' && (S?.stats?.agi||0)>=80 && (S?.stats?.int||0)>=60;
      }catch(e){ return false; }
    }
    case "poisoner_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='poisoner' && (S?.stats?.pstx||0)>=65 && (S?.stats?.agi||0)>=60;
      }catch(e){ return false; }
    }
    case "bounty_hunter_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='bounty_hunter' && (S?.stats?.per||0)>=70 && (S?.stats?.str||0)>=55;
      }catch(e){ return false; }
    }
    case "spy_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='spy' && (S?.stats?.disg||0)>=75 && (S?.stats?.spk||0)>=55;
      }catch(e){ return false; }
    }
    case "gambler_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='gambler' && (S?.stats?.luk||0)>=70 && (S?.stats?.neg||0)>=55;
      }catch(e){ return false; }
    }

    // ── 궁수 계열 T2 파생 5종 조건 — 현재 직업 확인 + 스탯 조합.
    case "sniper_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='sniper' && (S?.stats?.per||0)>=75 && (S?.stats?.rng||0)>=60;
      }catch(e){ return false; }
    }
    case "ranger_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='ranger' && (S?.stats?.per||0)>=65 && (S?.stats?.agi||0)>=60;
      }catch(e){ return false; }
    }
    case "magic_archer_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='magic_archer' && (S?.stats?.rng||0)>=60 && (S?.stats?.mgc||0)>=55;
      }catch(e){ return false; }
    }
    case "crossbow_master_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='crossbow_master' && (S?.stats?.str||0)>=65 && (S?.stats?.rng||0)>=55;
      }catch(e){ return false; }
    }
    case "wind_archer_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='wind_archer' && (S?.stats?.agi||0)>=70 && (S?.stats?.rng||0)>=55;
      }catch(e){ return false; }
    }

    // ── 성직자 계열 T2 파생 5종 조건 — 현재 직업 확인 + 스탯 조합.
    // ── 성직자 계열 5종 조건에 종교 시스템 연동 — [신규] 실제로
    // 마스터 NPC와 같은 종교(temple/abyss)에 정식 귀의한 상태면 신앙심
    // 요구치를 5 낮춰준다(강제 조건은 아님 — 종교 시스템을 몰라도 원래
    // 조건만으로 히든 퀘스트에 도달 가능해야 하므로, 어디까지나 보너스).
    case "archbishop_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
        const req = rel==='temple' ? 75 : 80;
        return jobId==='archbishop' && (S?.stats?.fath||0)>=req && (S?.stats?.wil||0)>=65;
      }catch(e){ return false; }
    }
    case "crusader_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
        const req = rel==='temple' ? 55 : 60;
        return jobId==='crusader' && (S?.stats?.str||0)>=65 && (S?.stats?.fath||0)>=req;
      }catch(e){ return false; }
    }
    case "exorcist_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
        const req = rel==='temple' ? 65 : 70;
        return jobId==='exorcist' && (S?.stats?.fath||0)>=req && (S?.stats?.per||0)>=55;
      }catch(e){ return false; }
    }
    case "oracle_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='oracle' && (S?.stats?.per||0)>=72 && (S?.stats?.wil||0)>=55;
      }catch(e){ return false; }
    }
    case "dark_priest_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
        const req = rel==='abyss' ? 55 : 60;
        return jobId==='dark_priest' && (S?.stats?.fath||0)>=req && (S?.stats?.fear||0)>=55;
      }catch(e){ return false; }
    }

    // ── 사냥꾼(hunter) 조건 — 현재 직업 확인 + 사냥터 원정 횟수(전용
    // 시스템 tf-hunter-expedition-log가 실제로 관리하는 확실한 값) + 지각.
    case "hunter_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const log = typeof loadHunterLog==='function' ? loadHunterLog() : {count:0};
        return jobId==='hunter' && (log.count||0)>=10 && (S?.stats?.per||0)>=65;
      }catch(e){ return false; }
    }
    // ── 야수의 왕 — 전설급(T13) 야수 조련 성공 여부(tf-hunter-tame-log의
    // legendaryTamed 플래그)로만 판정한다. 이 플래그는 legendaryTame()
    // 액션에서 실제로 T13 몬스터 조련에 성공했을 때만 true가 된다.
    case "hunter_beast_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const tameLog = typeof loadHunterTameLog==='function' ? loadHunterTameLog() : {legendaryTamed:false};
        return jobId==='hunter' && !!tameLog.legendaryTamed;
      }catch(e){ return false; }
    }

    // ── 대륙 전용 직업 8종 조건 — 현재 직업 확인 + 스탯 조합.
    case "ice_knight_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='ice_knight' && (S?.stats?.end||0)>=65 && (S?.stats?.str||0)>=60;
      }catch(e){ return false; }
    }
    case "rune_warrior_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='rune_warrior' && (S?.stats?.wil||0)>=60 && (S?.stats?.str||0)>=55;
      }catch(e){ return false; }
    }
    case "sword_emperor_heir_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='sword_emperor_heir' && (S?.stats?.agi||0)>=80 && (S?.stats?.str||0)>=75;
      }catch(e){ return false; }
    }
    case "imperial_sorcerer_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='imperial_sorcerer' && (S?.stats?.mgc||0)>=65 && (S?.stats?.int||0)>=55;
      }catch(e){ return false; }
    }
    case "steam_knight_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='steam_knight' && (S?.stats?.end||0)>=55 && (S?.stats?.int||0)>=50;
      }catch(e){ return false; }
    }
    case "automaton_master_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='automaton_master' && (S?.stats?.int||0)>=65 && (S?.stats?.rng||0)>=50;
      }catch(e){ return false; }
    }
    case "sun_priest_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='sun_priest' && (S?.stats?.fath||0)>=65 && (S?.stats?.mgc||0)>=55;
      }catch(e){ return false; }
    }
    case "ancient_seeker_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='ancient_seeker' && (S?.stats?.int||0)>=60 && (S?.stats?.mgc||0)>=55;
      }catch(e){ return false; }
    }
    case "starlight_archer_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='starlight_archer' && (S?.stats?.agi||0)>=60 && (S?.stats?.per||0)>=55;
      }catch(e){ return false; }
    }
    case "world_tree_keeper_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='world_tree_keeper' && (S?.stats?.fath||0)>=70 && (S?.stats?.mgc||0)>=65;
      }catch(e){ return false; }
    }
    case "storm_pirate_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='storm_pirate' && (S?.stats?.luk||0)>=55 && (S?.stats?.agi||0)>=50;
      }catch(e){ return false; }
    }
    case "tide_sorcerer_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='tide_sorcerer' && (S?.stats?.mgc||0)>=60 && (S?.stats?.rng||0)>=50;
      }catch(e){ return false; }
    }
    case "runesmith_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        const actions = typeof loadJobActions==='function' ? loadJobActions() : {};
        return jobId==='runesmith' && (S?.stats?.str||0)>=65 && (actions.craft||0)>=20;
      }catch(e){ return false; }
    }
    case "golem_engineer_master": {
      try{
        const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
        return jobId==='golem_engineer' && (S?.stats?.int||0)>=60 && (S?.stats?.mgc||0)>=50;
      }catch(e){ return false; }
    }

    // ── 종족 12종 조건 — 현재 종족 확인(race 필드는 한글/영문 두 형태로
    // 모두 저장될 수 있어 이 게임의 표준 패턴대로 includes()로 방어적
    // 체크한다, 예: 12087줄 등) + 스탯 조합.
    case "human_master": {
      try{
        const race = (S.character?.race||'').toLowerCase();
        return (race.includes('인간')||race.includes('human')) && (S?.stats?.wil||0)>=55 && (S?.stats?.luk||0)>=50;
      }catch(e){ return false; }
    }
    case "dragon_master": {
      try{
        const race = (S.character?.race||'').toLowerCase();
        return (race.includes('드래곤')||race.includes('dragon')||race.includes('용혈')) && (S?.stats?.wil||0)>=60 && (S?.stats?.mgc||0)>=55;
      }catch(e){ return false; }
    }
    case "elf_master": {
      try{
        const race = (S.character?.race||'').toLowerCase();
        return (race.includes('엘프')||race.includes('elf')) && (S?.stats?.mgc||0)>=55 && (S?.stats?.per||0)>=50;
      }catch(e){ return false; }
    }
    case "dwarf_master": {
      try{
        const race = (S.character?.race||'').toLowerCase();
        return (race.includes('드워프')||race.includes('dwarf')) && (S?.stats?.end||0)>=55 && (S?.stats?.str||0)>=50;
      }catch(e){ return false; }
    }
    case "orc_master": {
      try{
        const race = (S.character?.race||'').toLowerCase();
        return (race.includes('오크')||race.includes('orc')) && (S?.stats?.str||0)>=55 && (S?.stats?.end||0)>=50;
      }catch(e){ return false; }
    }
    case "darkling_master": {
      try{
        const race = (S.character?.race||'').toLowerCase();
        return (race.includes('다크링')||race.includes('darkling')) && (S?.stats?.mgc||0)>=55 && (S?.stats?.fear||0)>=50;
      }catch(e){ return false; }
    }
    case "celestial_master": {
      try{
        const race = (S.character?.race||'').toLowerCase();
        return (race.includes('세레스티얼')||race.includes('celestial')) && (S?.stats?.fath||0)>=55 && (S?.stats?.wil||0)>=50;
      }catch(e){ return false; }
    }
    case "demon_master": {
      try{
        const race = (S.character?.race||'').toLowerCase();
        return (race.includes('악마')||race.includes('demon')) && (S?.stats?.cha||0)>=55 && (S?.stats?.neg||0)>=50;
      }catch(e){ return false; }
    }
    case "undead_master": {
      try{
        const race = (S.character?.race||'').toLowerCase();
        return (race.includes('언데드')||race.includes('undead')) && (S?.stats?.end||0)>=55 && (S?.stats?.pstx||0)>=50;
      }catch(e){ return false; }
    }
    case "beastman_master": {
      try{
        const race = (S.character?.race||'').toLowerCase();
        return (race.includes('수인')||race.includes('beastman')) && (S?.stats?.str||0)>=55 && (S?.stats?.per||0)>=50;
      }catch(e){ return false; }
    }
    case "elemental_master": {
      try{
        const race = (S.character?.race||'').toLowerCase();
        return (race.includes('원소인')||race.includes('elemental')) && (S?.stats?.mgc||0)>=55 && (S?.stats?.wil||0)>=50;
      }catch(e){ return false; }
    }
    case "vampire_master": {
      try{
        const race = (S.character?.race||'').toLowerCase();
        return (race.includes('뱀파이어')||race.includes('vampire')) && (S?.stats?.cha||0)>=55 && (S?.stats?.agi||0)>=50;
      }catch(e){ return false; }
    }
    default: return false;
  }
};

export const getAvailableHiddenQuests = (gameData) => {
  const stored = loadHiddenQuests(); // { [id]: {...} }
  return HIDDEN_QUEST_POOL.filter(q =>
    !stored[q.id] && checkHiddenQuestCondition(q.id, gameData)
  );
};

export const activateHiddenQuest = (questId) => {
  const stored = loadHiddenQuests();
  if(stored[questId]) return; // 이미 활성 또는 완료
  const pool = HIDDEN_QUEST_POOL.find(q=>q.id===questId);
  if(!pool) return;
  stored[questId] = { id: pool.id, name: pool.name, icon: pool.icon, desc: pool.desc, reward: pool.reward, status:'active', startedAt: new Date().toISOString() };
  saveHiddenQuests(stored);
};

export const completeHiddenQuest = (questId) => {
  const stored = loadHiddenQuests();
  if(stored[questId]?.status === 'completed') return;
  const alreadyCompleted = !!stored[questId] && stored[questId].status === 'completed';
  if(!stored[questId]){
    // 활성화 없이 완료되는 경우 (gs 블록 직접 완료 등)
    const pool = HIDDEN_QUEST_POOL.find(q=>q.id===questId);
    stored[questId] = { id: questId, name: pool?.name||questId, icon: pool?.icon||'🔮', desc: pool?.desc||'', reward: pool?.reward||'', status:'completed', startedAt: new Date().toISOString() };
  } else {
    stored[questId].status = 'completed';
    stored[questId].completedAt = new Date().toISOString();
  }
  saveHiddenQuests(stored);

  // 대장장이 히든 퀘스트 「태초의 화로」 완료 시 — 1) 태초(primal) 설계도
  // 3종 영구 습득 2) 「태초의 화로」 장소 자체를 영구 발견 목록에 등록해
  // 지도에 계속 나타나게 한다. 이 등록이 없으면 설계도만 알 뿐 그걸로
  // 태초급 아이템을 만들 재료(현자의 원석 등)를 구할 곳이 없어, 대장장이가
  // 아닌 다른 직업으로 환생했을 때 설계도가 사실상 무용지물이 된다.
  if(questId === 'hq_primal_forge' && !alreadyCompleted){
    const primalBpIds = ['bp_primal_hammer','bp_primal_blade','bp_primal_plate'];
    primalBpIds.forEach(bpId=>{
      if(typeof unlockBlueprint==='function' && unlockBlueprint(bpId)){
        const bp = (typeof BLUEPRINT_SHOP!=='undefined') ? BLUEPRINT_SHOP[bpId] : null;
        if(bp) toastHTML(`🔥 태초의 설계도 습득! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(bp,{size:14}):(bp.icon)} ${esc(bp.name)}`, 5000);
      }
    });
    try{
      const permanentlyUnlocked = JSON.parse(lsGet('tf-permanent-unlocked-locs')||'[]');
      if(!permanentlyUnlocked.includes('loc_primal_forge')){
        permanentlyUnlocked.push('loc_primal_forge');
        lsSet('tf-permanent-unlocked-locs', JSON.stringify(permanentlyUnlocked));
        toast('🔥 「태초의 화로」로 가는 길이 영원히 지도에 드러났다', 5000);
      }
    }catch(e){}
    if(typeof window.updateStats==='function') window.updateStats('primal_forge_completed', 1);
  }

  // 음유시인 히든 퀘스트 「불멸의 노래」 완료 시 칭호 3개(=영구 스탯+영구 스킬) 자동 지급
  if(questId === 'hq_immortal_song' && !alreadyCompleted){
    const immortalTitleIds = ['song_truth_teller','song_myth_maker','song_finneagan_heir'];
    immortalTitleIds.forEach(titleId=>{
      if(typeof grantTitle==='function') grantTitle(titleId);
    });
    if(typeof window.updateStats==='function') window.updateStats('immortal_song_completed', 1);
  }

  // 치유사 히든 퀘스트 「불사의 온기」 완료 시 칭호(=영구 스탯+영구 스킬) 자동 지급
  if(questId === 'hq_undying_warmth' && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle('healer_undying_warmth');
    if(typeof window.updateStats==='function') window.updateStats('undying_warmth_completed', 1);
  }

  // 상인 히든 퀘스트 「양날의 저울」 완료 시 칭호(=영구 스탯+영구 스킬) 자동 지급
  if(questId === 'hq_double_edged_scale' && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle('merchant_double_edged');
    if(typeof window.updateStats==='function') window.updateStats('double_edged_scale_completed', 1);
  }

  // 연금술사 히든 퀘스트 「현자의 그림자」 완료 시 칭호(=영구 스탯+영구 스킬) 자동 지급
  if(questId === 'hq_sages_shadow' && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle('alchemist_sages_shadow');
    if(typeof window.updateStats==='function') window.updateStats('sages_shadow_completed', 1);
  }

  // 묘지기 히든 퀘스트 「순환의 마지막 문」 완료 시 칭호(=영구 스탯+영구 스킬) 자동 지급
  if(questId === 'hq_final_door' && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle('gravekeeper_final_door');
    if(typeof window.updateStats==='function') window.updateStats('final_door_completed', 1);
  }

  // 학자 히든 퀘스트 「금서의 무게」 완료 시 — 진 엔딩 1차 관문.
  // 1) 칭호(=영구 스탯+영구 스킬) 지급 2) 「감시자의 영역」을 영구 발견
  // 목록(tf-permanent-unlocked-locs)에 등록해 지도/이동 메뉴에 나타나게
  // 한다. 이 키는 환생 시에도 지워지지 않는다 — 한 번이라도 학자로서
  // 이 퀘스트를 완료했다면, 이후 어떤 직업으로 환생하든 감시자의 영역은
  // 계속 보여야 한다(그래야만 다른 세 조건이 충족된 어느 생에서든 실제로
  // 진 엔딩에 도달할 수 있다 — 매 생 학자로 다시 깨야 한다면 사실상
  // "그 생에서만 진 엔딩 가능"이 되어버려 의도와 어긋난다).
  if(questId === 'hq_weight_of_forbidden_books' && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle('scholar_weight_of_books');
    try{
      const permanentlyUnlocked = JSON.parse(lsGet('tf-permanent-unlocked-locs')||'[]');
      if(!permanentlyUnlocked.includes('loc_watcher_domain')){
        permanentlyUnlocked.push('loc_watcher_domain');
        lsSet('tf-permanent-unlocked-locs', JSON.stringify(permanentlyUnlocked));
        toast('👁️ 「감시자의 영역」으로 가는 길이 영원히 지도에 드러났다', 5000);
      }
    }catch(e){}
    if(typeof window.updateStats==='function') window.updateStats('weight_of_books_completed', 1);
  }

  // 전사 계열 T2 파생 7종 히든 퀘스트 완료 시 칭호(=영구 스탯 2종+영구
  // 스킬) 자동 지급 — 각각 questId와 title id를 1:1로 매핑한다.
  const WARRIOR_LINE_QUEST_TITLE_MAP = {
    hq_paladin_vow_weight:        'paladin_vow_weight',
    hq_berserker_unbroken_memory: 'berserker_unbroken_memory',
    hq_swordmaster_way_of_sword:  'swordmaster_way_of_sword',
    hq_warlord_road_back_alive:   'warlord_road_back_alive',
    hq_dragoon_between_worlds:    'dragoon_between_worlds',
    hq_guardian_cannot_save_all:  'guardian_cannot_save_all',
    hq_gladiator_names_in_sand:   'gladiator_names_in_sand',
  };
  if(WARRIOR_LINE_QUEST_TITLE_MAP[questId] && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle(WARRIOR_LINE_QUEST_TITLE_MAP[questId]);
    if(typeof window.updateStats==='function') window.updateStats(questId+'_completed', 1);
    // [신규] 이 직업 계열의 핵심 서사를 완결했다는 것은, 종족과 직업
    // 사이의 부조화가 있었다면 그것을 서사적으로 극복했다는 의미다.
    if(typeof resolveRaceJobDissonance==='function') resolveRaceJobDissonance();
  }

  // 마법사 계열 T2 파생 7종 히든 퀘스트 완료 시 칭호 자동 지급
  const MAGE_LINE_QUEST_TITLE_MAP = {
    hq_warlock_uncorrupted_edge:     'warlock_uncorrupted_edge',
    hq_sage_knowing_unknowing:       'sage_knowing_unknowing',
    hq_summoner_called_or_pulled:    'summoner_called_or_pulled',
    hq_chronomancer_moment_undone:   'chronomancer_moment_undone',
    hq_elementalist_perfect_balance: 'elementalist_perfect_balance',
    hq_necromancer_mirror_of_calamos:'necromancer_mirror_of_calamos',
    hq_enchanter_no_perfect_ward:    'enchanter_no_perfect_ward',
  };
  if(MAGE_LINE_QUEST_TITLE_MAP[questId] && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle(MAGE_LINE_QUEST_TITLE_MAP[questId]);
    if(typeof window.updateStats==='function') window.updateStats(questId+'_completed', 1);
    if(typeof resolveRaceJobDissonance==='function') resolveRaceJobDissonance();
  }

  // 도적 계열 T2 파생 7종 히든 퀘스트 완료 시 칭호 자동 지급
  const ROGUE_LINE_QUEST_TITLE_MAP = {
    hq_assassin_nameless_name:        'assassin_nameless_name',
    hq_pirate_price_of_freedom:       'pirate_price_of_freedom',
    hq_ninja_flow_like_water:         'ninja_flow_like_water',
    hq_poisoner_kill_or_cure:         'poisoner_kill_or_cure',
    hq_bounty_hunter_wisdom_of_return:'bounty_hunter_wisdom_of_return',
    hq_spy_three_layers:              'spy_three_layers',
    hq_gambler_endless_game:          'gambler_endless_game',
  };
  if(ROGUE_LINE_QUEST_TITLE_MAP[questId] && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle(ROGUE_LINE_QUEST_TITLE_MAP[questId]);
    if(typeof window.updateStats==='function') window.updateStats(questId+'_completed', 1);
    if(typeof resolveRaceJobDissonance==='function') resolveRaceJobDissonance();
  }

  // 궁수 계열 T2 파생 5종 히든 퀘스트 완료 시 칭호 자동 지급
  const ARCHER_LINE_QUEST_TITLE_MAP = {
    hq_sniper_shot_that_changed:            'sniper_shot_that_changed',
    hq_ranger_forest_remembers:             'ranger_forest_remembers',
    hq_magic_archer_stranger_of_two:        'magic_archer_stranger_of_two',
    hq_crossbow_master_forbidden_practical: 'crossbow_master_forbidden_practical',
    hq_wind_archer_day_wind_blows:          'wind_archer_day_wind_blows',
  };
  if(ARCHER_LINE_QUEST_TITLE_MAP[questId] && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle(ARCHER_LINE_QUEST_TITLE_MAP[questId]);
    if(typeof window.updateStats==='function') window.updateStats(questId+'_completed', 1);
    if(typeof resolveRaceJobDissonance==='function') resolveRaceJobDissonance();
  }

  // 성직자 계열 T2 파생 5종 히든 퀘스트 완료 시 칭호 자동 지급
  const CLERIC_LINE_QUEST_TITLE_MAP = {
    hq_archbishop_gods_tool_my_face: 'archbishop_gods_tool_my_face',
    hq_crusader_faith_that_wavered:  'crusader_faith_that_wavered',
    hq_exorcist_things_unforgotten:  'exorcist_things_unforgotten',
    hq_oracle_cruelty_of_knowing:    'oracle_cruelty_of_knowing',
    hq_dark_priest_the_other_voice:  'dark_priest_the_other_voice',
  };
  if(CLERIC_LINE_QUEST_TITLE_MAP[questId] && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle(CLERIC_LINE_QUEST_TITLE_MAP[questId]);
    if(typeof window.updateStats==='function') window.updateStats(questId+'_completed', 1);
    if(typeof resolveRaceJobDissonance==='function') resolveRaceJobDissonance();
  }

  // 사냥꾼 히든 퀘스트 「야생을 닮아가는 것」 완료 시 — 1) 칭호(=영구
  // 스탯+영구 스킬) 지급 2) 「전설의 사냥터」를 영구 발견 목록에 등록해
  // 지도에 계속 나타나게 한다. 태초의 화로·감시자의 영역과 동일한 패턴.
  if(questId === 'hq_hunter_becoming_wild' && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle('hunter_becoming_wild');
    try{
      const permanentlyUnlocked = JSON.parse(lsGet('tf-permanent-unlocked-locs')||'[]');
      if(!permanentlyUnlocked.includes('loc_legendary_hunting_ground')){
        permanentlyUnlocked.push('loc_legendary_hunting_ground');
        lsSet('tf-permanent-unlocked-locs', JSON.stringify(permanentlyUnlocked));
        toast('🐺 「전설의 사냥터」로 가는 길이 영원히 지도에 드러났다', 5000);
      }
    }catch(e){}
    if(typeof window.updateStats==='function') window.updateStats('hunter_becoming_wild_completed', 1);
  }

  // 사냥꾼 히든 퀘스트 「야수의 왕」 완료 시 칭호(=영구 스탯+영구 스킬) 자동 지급
  if(questId === 'hq_hunter_king_of_beasts' && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle('hunter_king_of_beasts');
    if(typeof window.updateStats==='function') window.updateStats('hunter_king_of_beasts_completed', 1);
  }

  // 대륙 전용 직업 8종 히든 퀘스트 완료 시 칭호 자동 지급
  const CONTINENT_LINE_QUEST_TITLE_MAP = {
    hq_ice_knight_beneath_the_frost:            'ice_knight_beneath_the_frost',
    hq_rune_warrior_path_forsaken:              'rune_warrior_path_forsaken',
    hq_sword_emperor_not_to_win:                'sword_emperor_not_to_win',
    hq_imperial_sorcerer_dragon_qi_heart:       'imperial_sorcerer_dragon_qi_heart',
    hq_steam_knight_heart_behind_tongue:        'steam_knight_heart_behind_tongue',
    hq_automaton_master_strength_of_machine:    'automaton_master_strength_of_machine',
    hq_sun_priest_standing_without_light:       'sun_priest_standing_without_light',
    hq_ancient_seeker_truth_even_if_unfavorable:'ancient_seeker_truth_even_if_unfavorable',
    hq_starlight_archer_unshared_weight:        'starlight_archer_unshared_weight',
    hq_world_tree_keeper_shared_at_last:        'world_tree_keeper_shared_at_last',
    hq_storm_pirate_fear_to_the_sea:            'storm_pirate_fear_to_the_sea',
    hq_tide_sorcerer_share_masters_fear:        'tide_sorcerer_share_masters_fear',
    hq_runesmith_more_than_a_symbol:            'runesmith_more_than_a_symbol',
    hq_golem_engineer_what_machines_protected:  'golem_engineer_what_machines_protected',
  };
  if(CONTINENT_LINE_QUEST_TITLE_MAP[questId] && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle(CONTINENT_LINE_QUEST_TITLE_MAP[questId]);
    if(typeof window.updateStats==='function') window.updateStats(questId+'_completed', 1);
  }

  // 종족 12종 히든 퀘스트 완료 시 칭호 자동 지급
  const RACE_LINE_QUEST_TITLE_MAP = {
    hq_human_same_mistake_twice:   'human_same_mistake_twice',
    hq_dragon_will_of_the_flame:   'dragon_will_of_the_flame',
    hq_elf_names_unforgotten:      'elf_names_unforgotten',
    hq_dwarf_the_unfinished:       'dwarf_the_unfinished',
    hq_orc_kept_beyond_death:      'orc_kept_beyond_death',
    hq_darkling_light_or_enemy:    'darkling_light_or_enemy',
    hq_celestial_missionless_one:  'celestial_missionless_one',
    hq_demon_upon_my_name:         'demon_upon_my_name',
    hq_undead_second_death_earned: 'undead_second_death_earned',
    hq_beastman_hunt_with_honor:   'beastman_hunt_with_honor',
    hq_elemental_not_for_destruction:'elemental_not_for_destruction',
    hq_vampire_history_not_denied: 'vampire_history_not_denied',
  };
  if(RACE_LINE_QUEST_TITLE_MAP[questId] && !alreadyCompleted){
    if(typeof grantTitle==='function') grantTitle(RACE_LINE_QUEST_TITLE_MAP[questId]);
    if(typeof window.updateStats==='function') window.updateStats(questId+'_completed', 1);
  }
};

// ══════════════════════════════════════════════════════════════════
// [히든 퀘스트 로컬 진행] — 위 checkHiddenQuestCondition()의 75개
// condition 케이스는 전부 이미 로컬로 판정 가능한 값(직업 숙련/제작소
// 등급·로그 횟수·업보·세력 게이지 등)으로 짜여 있었다. 문제는 이 조건이
// "충족됐다"를 실제로 활성화·완료까지 이어주는 코드가 지금까지 죽어있던
// ai-prompt/077(호출되지 않는 buildSystem 전용 파일)에만 있었다는 것 —
// 즉 설계는 이미 AI 없이 돌아가게 되어 있었는데 배선만 안 돼 있었다.
// 여기서 그 배선을 살아있는 경로(quest/086의 sendMsg)에 새로 연결한다.
// 활성화 직후 바로 완료 처리하는 이유: condition 자체가 이미 "제작소
// 3레벨+로그 10회" 식의 상당한 성취 기준이라 그 자체가 서사적 완결점 —
// 별도의 "진행 중" 단계를 거칠 로컬 신호가 없으므로, 조건 충족 = 완료로
// 취급한다(AI가 살아있다면 여전히 먼저 서사로 완료시킬 수 있고, 그 경우
// 이 로컬 체크는 이미 완료된 id라 자연히 건너뛴다).
export function checkHiddenQuestsLocal(){
  try{
    const char = S.character || {};
    const atm = (typeof loadAtmosphere==='function') ? loadAtmosphere() : {timeOfDay:'none'};
    const gameData = {
      karmaScore: S.stats?.krma ?? 50,
      timeOfDay: atm.timeOfDay || 'none',
      cycle: (typeof loadCycleCount==='function') ? loadCycleCount() : 0,
      race: char.race || '',
      scenario: char.scenario || '',
      // [버그 수정] 실제 스탯 키는 'mad'(광기)인데 'madness'로 잘못 읽어
      // 항상 0이었다 — "high_mad"(광기 50 이상) 조건의 히든 퀘스트가
      // 이 로컬 체크 경로로는 절대 해금될 수 없었다.
      madness: S.stats?.mad ?? 0,
      factionGauges: (typeof loadFactionGauge==='function' ? (loadFactionGauge().gauges||{}) : {}),
    };
    const available = getAvailableHiddenQuests(gameData);
    available.forEach(q=>{
      activateHiddenQuest(q.id);
      completeHiddenQuest(q.id);
      toastHTML(`🔮 히든 퀘스트 완료: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:14}):(q.icon||"")} ${esc(q.name)}`, 4500);
    });
  }catch(e){}
}
window.checkHiddenQuestsLocal = checkHiddenQuestsLocal;
// ══════════════════════════════════════════════════════════════════
