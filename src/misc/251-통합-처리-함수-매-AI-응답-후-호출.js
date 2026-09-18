// 통합 처리 함수 — 매 AI 응답 후 호출
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { detectTerrainFromText } from '../combat/245-①-전투-지형-효과.js';
import { checkCombatInjury, tickResidualInjury } from '../combat/247-③-부상-흔적-현재-전투-페널티-연결.js';
import { checkAmbushSystem, checkDefendSystem } from '../combat/248-④-기습선제-공격-시스템.js';
import { rollRareCombatEvent } from '../combat/250-⑥-레어-전투-이벤트.js';
import { INJURY_PART_DEFS } from '../data/016-2130번-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RC } from '../data/086-퀘스트임무-수락-팝업-시스템.js';
import { TERRAIN_EFFECTS_BATTLE } from '../data/245-①-전투-지형-효과.js';
import { CARAVAN_ARCHETYPES, CARAVAN_EVO_STAGE_NAMES, CARAVAN_EVO_THRESHOLDS, CARAVAN_HIREABLE_RANKS, CARAVAN_HQ_BUILDINGS, CARAVAN_JOB_CLIENTS, CARAVAN_MISSIONS, CARAVAN_RARITY, CARAVAN_TRAITS, CONTRACT_DEFS, CONTRACT_ORGS, MERC_ARCHETYPES, MERC_CONTACT_STAGES, MERC_CRIME_JOB_CLIENTS, MERC_CRIME_LORD_BY_SCENARIO, MERC_CRIME_MISSIONS, MERC_EVO_STAGE_NAMES, MERC_EVO_THRESHOLDS, MERC_GEAR_TIERS, MERC_HIREABLE_RANKS, MERC_HQ_BUILDINGS, MERC_JOB_CLIENTS, MERC_MISSIONS, MERC_RARITY, MERC_TRAITS, SKILL_CD_DEFS } from '../data/251-통합-처리-함수-매-AI-응답-후-호출.js';
import { saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { loadFactionRep, updateFactionRep } from '../npc/067-③-NPC-관계망-시스템.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { renderMonsters } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { autoCheckBossPhases } from '../ui/155-⑭-메모리-패널-UI.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { saveNPCs } from './001-block0-preamble.js';
import { getAllSkillDefs } from './009-레벨업-스탯-포인트-배분-시스템.js';
import { recordInjury } from './016-2130번-시스템.js';
import { loadReputation, updateReputation } from './054-이동수단-시스템.js';
import { _isWanderer, loadWdrAxis, renderDoomClockBadge } from './230-방랑자-전용-혼돈질서-슬라이더-개연성P-시스템.js';
import { detectEnemyBehavior } from './246-②-적-AI-행동-패턴.js';
import { updateEnemyMorale } from './249-⑤-적-사기Morale-시스템.js';

export function processCombatSystems(cleanText, userMsg, effectiveSuccess, isCritSuccess, isCritFail){
  if(!S) return;

  // 턴 초기화 플래그
  S._ambushCheckedThisTurn    = S._ambushCheckedThisTurn    || false;
  S._rareCombatEventThisTurn  = S._rareCombatEventThisTurn  || false;
  S._defendCheckedThisTurn    = S._defendCheckedThisTurn    || false;

  const isInCombat = S._inCombat ||
    /전투|싸움|공격|방어|베었|강타|쓰러뜨|적이/.test(cleanText||'');

  // ① 지형 감지 & AI 컨텍스트 주입
  const locName = (typeof window.currentLocation!=='undefined' && window.currentLocation?.name)||'';
  const terrainId = detectTerrainFromText(cleanText, locName);
  if(terrainId && terrainId !== S._terrainId){
    S._terrainId = terrainId;
    const te = TERRAIN_EFFECTS_BATTLE[terrainId];
    S._nextInjectedContext = (S._nextInjectedContext||'') +
      `\n[${te.icon} 전투 지형: ${te.label}] ${te.aiHint}`;
  }

  // ② 적 행동 패턴 감지 & 주입 (전투 시작 시 1회)
  if(isInCombat && !S._enemyBehaviorSet){
    const behavior = detectEnemyBehavior(cleanText);
    if(behavior){
      S._enemyBehaviorSet = behavior.id;
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n[⚔️ 적 행동 패턴: ${behavior.label}] ${behavior.hint}`;
      // [신규] 감지된 행동 패턴을 실제 몬스터 객체에 직접 저장 — 이걸
      // 해야 applyStatusEffect의 면역 체크(골렘 면역, 불사 정신계 면역
      // 등)가 텍스트 재분석 없이 정확하고 빠르게 동작한다.
      try{
        if(typeof loadMonsters==='function' && typeof saveMonsters==='function'){
          const monsters = loadMonsters()||[];
          let changed = false;
          monsters.filter(m=>m.status==='alive' && !m._behaviorId).forEach(m=>{
            m._behaviorId = behavior.id;
            changed = true;
          });
          if(changed) saveMonsters(monsters);
        }
      }catch(e){}
    }
  }
  // 전투 종료 시 패턴 초기화
  // [개선] 전투 종료 시 부상 페널티를 즉시 0으로 초기화하지 않는다.
  // 이전에는 전투가 끝나는 순간 S._combatInjury={}로 완전히 사라져서,
  // "방금 팔이 부러졌는데 전투가 끝나자마자 멀쩡해지는" 부자연스러운
  // 흐름이었다 — 연속 전투에서 만신창이로 들어가는 위험이 전혀 없었다.
  // 이제 전투 종료 시 페널티를 절반으로 줄여 "잔존 부상"으로 남기고,
  // tickResidualInjury()가 매 턴 서서히 회복시킨다. 완전 회복(치료/휴식)
  // 전까지는 다음 전투에도 일정 부분 영향이 이어진다.
  if(!isInCombat){
    S._enemyBehaviorSet = null; S._injuryCheckedThisCombat = false; S._enemyMorale = 80; S._currentTarget = null;
    // [BUG FIX] 이 블록은 isInCombat===false인 매 턴마다 실행되므로,
    // 플래그 없이 *0.5를 적용하면 전투가 끝난 뒤 비전투 상태가 계속될
    // 때마다 반복적으로 절반화되어 부상이 순식간에 사라져버린다.
    // 전투 종료 시점에 단 1회만 절반화하도록 플래그로 막는다.
    if(!S._injuryHalvedAfterCombat && S._combatInjury && Object.keys(S._combatInjury).length){
      const halved = {};
      for(const k in S._combatInjury){
        const v = Math.round(S._combatInjury[k] * 0.5);
        if(v !== 0) halved[k] = v;
      }
      S._combatInjury = halved;
      S._injuryHalvedAfterCombat = true;
    }
  } else {
    S._injuryHalvedAfterCombat = false; // 다음 전투 시작하면 플래그 리셋
  }
  // 비전투 중 잔존 부상 서서히 회복
  if(!isInCombat && typeof tickResidualInjury==='function') tickResidualInjury();

  // ③ 부상 흔적 체크
  if(isInCombat) checkCombatInjury(cleanText);

  // ④ 기습 시스템
  checkAmbushSystem(cleanText, userMsg);

  // ④-2 방어/회피 시스템
  checkDefendSystem(cleanText, userMsg);

  // ⑤ 적 사기 업데이트
  if(isInCombat) updateEnemyMorale(effectiveSuccess, isCritSuccess, isCritFail, cleanText);

  // [신규] ⑤-2 던전/요새 증원(웨이브) 시스템 — "적진이면 적이 계속
  // 나온다"는 TRPG적 긴장감을 구현. 기존에는 모든 전투에 공통으로
  // 적용되는 "지원군 도착"(4% 랜덤 이벤트, RARE_COMBAT_EVENTS)만
  // 있었는데, 이건 지형과 무관한 범용 이벤트라 던전 특유의 압박감을
  // 주지 못했다. dungeon 지형에서만 발동하는 전용 증원 메커니즘을
  // 추가한다 — 4턴마다 30% 확률로 졸병이 추가 등장하되, 지휘관형
  // 적(전투를 지휘하는 존재)을 먼저 처치하면 증원이 끊긴다는 명확한
  // 목표를 제공해 "지휘관을 빨리 잡아야 한다"는 전술적 판단을 유도한다.
  if(isInCombat && S._terrainId === 'dungeon'){
    S._dungeonReinforceTurn = (S._dungeonReinforceTurn||0) + 1;
    const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
    const commanderAlive = monsters.some(m=>m.status==='alive' && m._behaviorId==='commander');
    if(S._dungeonReinforceTurn >= 4){
      S._dungeonReinforceTurn = 0;
      if(commanderAlive && Math.random() < 0.30){
        S._nextInjectedContext = (S._nextInjectedContext||'') +
          `\n[🏰 던전 증원] 지휘관(우두머리)이 아직 살아있어 추가 병력이 도착한다. 졸병급 적 1~2명이 새로 합류하는 장면을 묘사하고, 반드시 npc_to_enemy 또는 monster_group_spawn으로 새 적을 등록하라. 지휘관을 먼저 처치하면 이후 증원이 끊긴다는 것을 서사에서 암시해도 좋다.`;
        toast('🏰 던전 깊은 곳에서 증원이 도착한다!', 3000);
        S._dungeonReinforceFiredThisTurn = true;
      } else if(!commanderAlive){
        S._nextInjectedContext = (S._nextInjectedContext||'') +
          `\n[🏰 던전 — 증원 끊김] 지휘하던 존재가 사라져 더 이상 추가 병력이 오지 않는다. 이 사실을 서사에 짧게 반영해도 좋다(예: "더 이상 호각 소리가 울리지 않는다").`;
      }
    }
  } else if(!isInCombat){
    S._dungeonReinforceTurn = 0;
  }

  // ⑥ 레어 전투 이벤트
  if(isInCombat) rollRareCombatEvent(cleanText);

  // [신규] ⑥-2 enemy_damage 폴백 — AI가 매번 enemy_damage를 정확히
  // 출력한다고 100% 보장할 수 없다. "치명타", "꿰뚫었다", "절명" 같은
  // 명백히 큰 타격을 의미하는 표현이 등장했는데도 이번 턴 GS에
  // enemy_damage가 전혀 없었다면, 보스 HP가 다시 "안 줄어드는" 예전
  // 문제로 되돌아갈 위험이 있다. 과도한 자동 보정은 이중 적용 위험이
  // 있으므로 최대HP의 8%라는 작고 안전한 보정만 1회 적용한다.
  if(isInCombat){
    try{
      const gsHasEnemyDamage = window._lastParsedGS && Array.isArray(window._lastParsedGS.enemy_damage) && window._lastParsedGS.enemy_damage.length > 0;
      const strongHitPattern = /치명타|꿰뚫었다|절명|급소를 찔렀|목을 갈랐|심장을 찔렀|단숨에 베었/;
      if(!gsHasEnemyDamage && strongHitPattern.test(cleanText||'')){
        const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
        const alive = monsters.filter(m=>m.status==='alive');
        // 텍스트에 이름이 직접 언급된 적이 있으면 그 적에게, 없으면
        // (적이 1명뿐인 경우만) 유일한 적에게 적용 — 다수일 때 누구인지
        // 특정 못 하면 잘못된 대상에게 피해를 줄 위험이 있어 건너뛴다.
        let target = alive.find(m => cleanText.includes(m.name));
        if(!target && alive.length === 1) target = alive[0];
        if(target){
          const bonusDmg = Math.round((target.maxHp||target.hp||100) * 0.08);
          target.hp = Math.max(1, target.hp - bonusDmg);
          saveMonsters(monsters);
          if(typeof renderMonsters==='function') renderMonsters();
          if(target.isBoss && typeof autoCheckBossPhases==='function') autoCheckBossPhases();
        }
      }
    }catch(e){ console.warn('[enemy_damage fallback]', e); }
  }

  // 다음 턴 플래그 초기화
  setTimeout(()=>{
    if(S){ S._ambushCheckedThisTurn = false; S._rareCombatEventThisTurn = false; S._defendCheckedThisTurn = false; S._dungeonReinforceFiredThisTurn = false; }
  }, 100);

  // 지형 보너스를 effStat에 반영하기 위해 S._terrainBonus 갱신
  if(S._terrainId){
    const te = TERRAIN_EFFECTS_BATTLE[S._terrainId];
    S._terrainBonus = te ? te.bonus : {};
    S._terrainPenalty = te ? te.penalty : {};
  }
}
window.processCombatSystems = processCombatSystems;

window.processCombatSystems = processCombatSystems;

export function tickNearDeathPenalty(){
  if(!S||!S.stats) return;
  const hp=S.stats.hp||0, maxHp=S.stats.maxHp||100;
  const pct=hp/maxHp;
  if(pct<=0.10){
    S._nearDeathTurns=(S._nearDeathTurns||0)+1;
    const t=S._nearDeathTurns;
    if(t===1){
      toast('❤️ 빈사 상태! 즉시 치료가 필요하다!',3000);
      S._nextInjectedContext=(S._nextInjectedContext||'')+'\n[❤️ 빈사] 극한 부상. 모든 행동이 고통스럽다. 치료 선택지를 자연스럽게 포함.';
    } else if(t===3){
      const parts=Object.keys(INJURY_PART_DEFS);
      const part=parts[Math.floor(Math.random()*parts.length)];
      if(typeof recordInjury==='function') recordInjury(part);
      S._combatInjury=S._combatInjury||{};
      const def=INJURY_PART_DEFS[part];
      S._combatInjury[def.statWeak]=(S._combatInjury[def.statWeak]||0)-20;
      toastHTML(`🩸 빈사 3턴! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)}${esc(def.label)} 부상 악화!`,3500);
    } else if(t>=5 && !S._skillSealedByNearDeath){
      const skills=Object.keys(S.unlockedSkills||{}).filter(k=>S.unlockedSkills[k]);
      if(skills.length>0){
        const sealed=skills[Math.floor(Math.random()*skills.length)];
        S._skillSealedByNearDeath=sealed;
        toast(`💀 빈사 5턴! ${sealed} 스킬 봉인됨!`,4000);
        S._nextInjectedContext=(S._nextInjectedContext||'')+'\n[💀 극한 빈사] 의식이 흐릿하고 스킬 발동 불가. 즉시 치료하지 않으면 의식을 잃는다.';
      }
    }
  } else {
    if(S._nearDeathTurns>0){ S._nearDeathTurns=0; }
    if(S._skillSealedByNearDeath){ S._skillSealedByNearDeath=null; toast('💚 빈사 해제!',2000); }
  }
}
window.tickNearDeathPenalty = tickNearDeathPenalty;

export function getOverweightPenalty(statKey){
  if(typeof WEIGHT_SYSTEM==='undefined') return 0;
  const cur=WEIGHT_SYSTEM.getCurrentWeight(), max=WEIGHT_SYSTEM.getMaxWeight();
  const pct=max>0?cur/max:0;
  if(pct<0.80) return 0;
  if(!['agi','end','rng','disg'].includes(statKey)) return 0;
  if(pct>=1.00) return -25;
  if(pct>=0.90) return -12;
  return -5;
}
window.getOverweightPenalty = getOverweightPenalty;

window.getOverweightPenalty=getOverweightPenalty;

window._pursuitCooldown = 0;

export function checkFactionPursuit(){
  if(!S||!S.msgCount) return;
  if((S.msgCount-window._pursuitCooldown)<8) return;
  window._pursuitCooldown=S.msgCount;
  const rep=(typeof loadFactionRep==='function')?loadFactionRep():{};
  const hostile=Object.entries(rep).filter(([,v])=>v<=-50);
  const atWar=Object.entries(rep).filter(([,v])=>v<=-80);
  if(!hostile.length) return;
  const baseChance=Math.min(0.65,hostile.length*0.12+atWar.length*0.18);
  if(Math.random()>baseChance) return;
  const isAmbush=atWar.length>0&&Math.random()<0.5;
  const pool=atWar.length>0?atWar:hostile;
  const fName=pool[Math.floor(Math.random()*pool.length)][0];
  const msgs=isAmbush
    ?[`${fName}의 암살단이 기습을 준비 중`,`${fName}이 보낸 현상금 사냥꾼이 매복 중`]
    :[`${fName}의 추격대가 뒤를 쫓고 있다`,`${fName}이 현상금을 걸었다`];
  const msg=msgs[Math.floor(Math.random()*msgs.length)];
  toast(`⚠️ [세력 추격] ${msg}`,4000);
  S._nextInjectedContext=(S._nextInjectedContext||'')+
    `
[⚠️ 세력 추격] ${msg}. ${isAmbush?'이번 씬에 실제 전투나 기습':'다음 씬에서 조우'}. 긴박하게 묘사.`;
}
window.checkFactionPursuit = checkFactionPursuit;

export function tickSkillCooldowns(){
  if(!S||!S._skillCooldowns) return;
  Object.keys(S._skillCooldowns).forEach(k=>{
    if(S._skillCooldowns[k]>0){ S._skillCooldowns[k]--; if(S._skillCooldowns[k]===0){ toast(`✅ ${k} 쿨다운 완료!`,1800); delete S._skillCooldowns[k]; } }
  });
}
window.tickSkillCooldowns = tickSkillCooldowns;

export function calcSkillCooldown(skill){
  if(!skill) return 3;
  const rarity = skill.rarity || 'common';
  const rarityBonus = { common:0, uncommon:0, rare:1, legendary:2 }[rarity] || 0;
  const mp = skill.mpCost || 0;
  if(mp <= 0){
    return { common:2, uncommon:3, rare:4, legendary:6 }[rarity] || 3;
  }
  return Math.max(1, Math.ceil(mp/8) + rarityBonus);
}
window.calcSkillCooldown = calcSkillCooldown;

window.calcSkillCooldown = calcSkillCooldown;

export const SKILL_COOLDOWN_MP_THRESHOLD = 15;

export function shouldApplyCooldown(skill){
  if(!skill) return true;
  return (skill.mpCost||0) < SKILL_COOLDOWN_MP_THRESHOLD;
}
window.shouldApplyCooldown = shouldApplyCooldown;

window.shouldApplyCooldown = shouldApplyCooldown;

export function applySkillCooldown(id, skill){
  const manual = SKILL_CD_DEFS[id];
  const def = skill || (typeof getAllSkillDefs==='function' ? getAllSkillDefs().find(s=>s.id===id) : null);
  if(!manual && !shouldApplyCooldown(def)) return; // MP 소모가 충분해 쿨다운 불필요
  const cd = manual ? manual.cd : calcSkillCooldown(def);
  if(!cd || cd <= 0) return; // cd:0으로 명시된 스킬(즉시재사용 의도)은 쿨다운 안 걺
  if(!S._skillCooldowns) S._skillCooldowns={};
  S._skillCooldowns[id]=cd;
  toast(`⏳ ${id} ${cd}턴 쿨다운`,1800);
}
window.applySkillCooldown = applySkillCooldown;

export function isSkillOnCooldown(id){ return !!(S&&S._skillCooldowns&&S._skillCooldowns[id]>0); }
window.isSkillOnCooldown = isSkillOnCooldown;

export function getSkillCooldownRemaining(id){ return (S&&S._skillCooldowns&&S._skillCooldowns[id])||0; }
window.getSkillCooldownRemaining = getSkillCooldownRemaining;

window.applySkillCooldown=applySkillCooldown;

window.isSkillOnCooldown=isSkillOnCooldown;

window.getSkillCooldownRemaining=getSkillCooldownRemaining;

window.tickSkillCooldowns=tickSkillCooldowns;

export const WORLD_TIMER_KEY='tf-world-timer';

export function loadWorldTimer(){ try{ return JSON.parse(lsGet(WORLD_TIMER_KEY)||'null')||{doomClock:0,warProgress:0,sealDecay:0,events:[]}; }catch(e){ return {doomClock:0,warProgress:0,sealDecay:0,events:[]}; } }
window.loadWorldTimer = loadWorldTimer;

export function saveWorldTimer(d){ try{ lsSet(WORLD_TIMER_KEY,JSON.stringify(d)); }catch(e){} }
window.saveWorldTimer = saveWorldTimer;

export function tickWorldTimer(text){
  const wt=loadWorldTimer();
  if((S&&S.msgCount||0)%10!==0 || !(S&&S.msgCount>0)) return;
  const evil=/마왕.*섬기|봉인.*해제|세력.*배신|학살/.test(text||'');
  const hero=/봉인.*강화|마왕.*저지|평화.*이뤘/.test(text||'');
  const di=evil?8:hero?-3:2;
  wt.doomClock=Math.max(0,Math.min(100,(wt.doomClock||0)+di));
  wt.warProgress=Math.max(0,Math.min(100,(wt.warProgress||0)+(evil?5:1)));
  wt.sealDecay=Math.max(0,Math.min(100,(wt.sealDecay||0)+(hero?-2:3)));
  const doom=wt.doomClock;
  if(doom>=90&&!(wt.events||[]).includes('doom_imminent')){ wt.events=[...(wt.events||[]),'doom_imminent']; S._nextInjectedContext=(S._nextInjectedContext||'')+'\n[💀 둠 클락 90%] 세계 종말 임박. 강력한 적이 더 자주 나타난다.'; toast('💀 세계 종말 임박! 둠 클락 90%!',4000); }
  else if(doom>=70&&!(wt.events||[]).includes('doom_critical')){ wt.events=[...(wt.events||[]),'doom_critical']; toast('⚠️ 둠 클락 70% — 세계가 흔들린다',3500); }
  else if(doom>=50&&!(wt.events||[]).includes('doom_warning')){ wt.events=[...(wt.events||[]),'doom_warning']; toast('🌑 둠 클락 50%',2500); }
  if(wt.warProgress>=80&&!(wt.events||[]).includes('war_peak')){ wt.events=[...(wt.events||[]),'war_peak']; S._nextInjectedContext=(S._nextInjectedContext||'')+'\n[⚔️ 세력 대전쟁] 전면전 발발. 어디서든 전투가 벌어진다.'; toast('⚔️ 세력 대전쟁 발발!',4000); }
  saveWorldTimer(wt);
  if((S&&S.msgCount||0)%25===0 && wt.doomClock>30)
    S._nextInjectedContext=(S._nextInjectedContext||'')+`\n[🌍 세계 상태] 둠:${wt.doomClock}% / 전쟁:${wt.warProgress}% / 봉인붕괴:${wt.sealDecay}%`;
  // 헤더 배지 갱신
  if(typeof renderDoomClockBadge==='function') setTimeout(renderDoomClockBadge, 100);
}
window.tickWorldTimer = tickWorldTimer;

window.loadWorldTimer=loadWorldTimer;

window.tickWorldTimer=tickWorldTimer;

export const FOOD_KEY='tf-food-water';

export function loadFoodWater(){ try{ return JSON.parse(lsGet(FOOD_KEY)||'null')||{food:100,water:100}; }catch(e){ return {food:100,water:100}; } }
window.loadFoodWater = loadFoodWater;

export function saveFoodWater(d){ try{ lsSet(FOOD_KEY,JSON.stringify(d)); }catch(e){} }
window.saveFoodWater = saveFoodWater;

export function tickFoodWater(text){
  const fw=loadFoodWater();
  const lc=(text||'').toLowerCase();
  const ate=/먹었|식사|음식|밥을|고기를|빵을|요리를/.test(lc);
  const drank=/마셨|물을|음료|술을|포도주|차를/.test(lc);
  const hard=/전투|달렸|등반|던전|장거리/.test(lc);
  if(ate) fw.food=Math.min(100,fw.food+30);
  if(drank) fw.water=Math.min(100,fw.water+35);
  fw.food=Math.max(0,fw.food-(hard?6:3));
  fw.water=Math.max(0,fw.water-(hard?8:4));
  saveFoodWater(fw);
  if(fw.food<=0||fw.water<=0){
    const dmg=fw.food<=0&&fw.water<=0?8:4;
    S.stats.hp=Math.max(1,(S.stats.hp||100)-dmg);
    toast(`${fw.food<=0?'🍖 굶주림':'💧 갈증'}으로 HP -${dmg}!`,3000);
    S._nextInjectedContext=(S._nextInjectedContext||'')+`
[😵 생존 위기] ${fw.food<=0?'굶주림':'갈증'}으로 HP 자동 감소. 즉시 식량/물이 필요하다.`;
  } else {
    const w=[];
    if(fw.food<=20) w.push('🍖 배고픔');
    if(fw.water<=20) w.push('💧 갈증');
    if(w.length) toast(w.join(' | '),2000);
  }
  S._foodWaterPenalty=0;
  if(fw.food<=20) S._foodWaterPenalty-=5;
  if(fw.food<=0)  S._foodWaterPenalty-=15;
  if(fw.water<=20) S._foodWaterPenalty-=5;
  if(fw.water<=0)  S._foodWaterPenalty-=15;
  // 작은 바 표시
  let bar=document.getElementById('food-water-bar');
  if(!bar){ bar=document.createElement('div'); bar.id='food-water-bar'; bar.style.cssText='position:fixed;bottom:44px;left:0;right:0;z-index:280;pointer-events:none;display:flex;height:2px'; document.body.appendChild(bar); }
  const fc=fw.food<=0?'#e03030':fw.food<=20?'#e08030':'#6a9a3a';
  const wc=fw.water<=0?'#e03030':fw.water<=20?'#e08030':'#3a7aaa';
  bar.innerHTML=`<div style="flex:1;height:2px;background:${fc};opacity:${fw.food<50?1:0.3}"></div><div style="width:1px;background:#0a0800"></div><div style="flex:1;height:2px;background:${wc};opacity:${fw.water<50?1:0.3}"></div>`;
}
window.tickFoodWater = tickFoodWater;

export function getFoodWaterPenalty(k){ if(!['str','end','agi','wil'].includes(k)) return 0; return S&&S._foodWaterPenalty||0; }
window.getFoodWaterPenalty = getFoodWaterPenalty;

window.getFoodWaterPenalty=getFoodWaterPenalty;

window.tickFoodWater=tickFoodWater;

export const BM_KEY='tf-black-market';

export function loadBM(){ try{ return JSON.parse(lsGet(BM_KEY)||'null')||{stock:[],last:0}; }catch(e){ return {stock:[],last:0}; } }
window.loadBM = loadBM;

export function saveBM(d){ try{ lsSet(BM_KEY,JSON.stringify(d)); }catch(e){} }
window.saveBM = saveBM;

export function markItemStolen(item){ if(item){ item._stolen=true; } return item; }
window.markItemStolen = markItemStolen;

export function isStolenItem(item){ return !!(item&&item._stolen); }
window.isStolenItem = isStolenItem;

export function refreshBlackMarket(){
  const bm=loadBM(); const now=S&&S.msgCount||0;
  if(now-bm.last<10) return;
  const cycle=(typeof loadCycleCount==='function')?(loadCycleCount()||0):0;
  const inv=S&&S.inventory||[];
  const stolen=inv.filter(i=>i._stolen);
  const base=[
    {id:'bm_poison_blade',name:'독칼',icon:'🗡️',type:'weapon',rarity:'uncommon',price:80,desc:'독이 발린 단검.',effects:{str:8,agi:5}},
    {id:'bm_fake_id',name:'위조 신분증',icon:'📋',type:'trinket',rarity:'rare',price:150,desc:'완벽히 위조된 신분증.',effects:{disg:20}},
    {id:'bm_dark_tome',name:'금서',icon:'📕',type:'consume',rarity:'rare',price:200,desc:'마탑에서 금지된 마법서.',effects:{mgc:15,int:10}},
    {id:'bm_shadow_cloak',name:'그림자 망토',icon:'🌑',type:'cloak',rarity:'rare',price:250,desc:'착용자를 반투명하게 만든다.',effects:{disg:25,agi:10}},
    {id:'bm_antidote',name:'희귀 해독제',icon:'🧪',type:'consume',rarity:'rare',price:120,desc:'어떤 독도 중화한다.',effects:{hp:30}},
  ];
  if(cycle>=3) base.push({id:'bm_cursed_relic',name:'저주받은 유물',icon:'💀',type:'trinket',rarity:'legendary',price:400+cycle*50,desc:'강력하지만 착용자를 갉아먹는다.',effects:{str:25,mgc:20,hp:-5}});
  bm.stock=[...stolen.map(i=>({...i,price:Math.floor((i.price||50)*0.4)})),...base.slice(0,4+Math.min(cycle,3))];
  bm.last=now; saveBM(bm);
}
window.refreshBlackMarket = refreshBlackMarket;

export function renderBlackMarketPanel(){
  const body=document.getElementById('pb-black-market'); if(!body) return;
  refreshBlackMarket();
  const bm=loadBM(); const inv=S&&S.inventory||[];
  const sellable=inv.filter(i=>i._stolen);
  body.innerHTML=`<div style="padding:8px 12px;background:#050200;border-bottom:1px solid #2a1005;font-size:9px;color:#6a4a2a;line-height:1.6">🌑 암시장 — 출처를 묻지 않는 거래. 경비 발각 시 즉시 체포.</div>
  ${sellable.length?`<div style="padding:10px 12px;border-bottom:1px solid #1a0a05"><div style="font-family:Cinzel,serif;font-size:9px;color:#c07020;margin-bottom:6px">🗡️ 장물 처분</div>${sellable.map(item=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #0a0500"><span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon||"📦")}</span><div style="flex:1;font-size:10px;color:var(--text)">${esc(item.name)}</div><span style="font-size:9px;color:#c0a030">${Math.floor((item.price||50)*0.4)}G</span><button onclick="sellStolenItem('${item.id}')" style="padding:3px 8px;background:#1a0800;border:1px solid #5a3010;color:#c07020;font-size:8px;cursor:pointer">팔기</button></div>`).join('')}</div>`:''}
  <div style="padding:10px 12px"><div style="font-family:Cinzel,serif;font-size:9px;color:#c03030;margin-bottom:6px">💀 암시장 재고</div>${bm.stock.filter(i=>!i._stolen).map(item=>`<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #0a0500"><span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon||"📦")}</span><div style="flex:1"><div style="font-size:10px;color:var(--text)">${esc(item.name)}</div><div style="font-size:9px;color:var(--dim)">${esc(item.desc||'')}</div></div><div style="text-align:right;flex-shrink:0"><div style="font-size:10px;color:#c0a030;font-family:Cinzel,serif">${item.price}G</div><button onclick="buyBMItem('${item.id}')" style="padding:3px 8px;background:#1a0500;border:1px solid #5a1010;color:#c03030;font-size:8px;cursor:pointer;margin-top:2px">구매</button></div></div>`).join('')}</div>
  <div style="padding:8px 12px;text-align:center"><button onclick="saveBM({...loadBM(),last:0});renderBlackMarketPanel()" style="padding:5px 14px;background:#0a0500;border:1px solid #3a1a05;color:#5a3a1a;font-size:8px;font-family:Cinzel,serif;cursor:pointer">🔄 새로고침</button></div>`;
}
window.renderBlackMarketPanel = renderBlackMarketPanel;

export function buyBMItem(id){
  refreshBlackMarket(); const bm=loadBM(); const item=bm.stock.find(i=>i.id===id);
  if(!item){ toast('재고 없음'); return; }
  if((S&&S.gold||0)<item.price){ toast(`골드 부족 (${item.price}G 필요)`); return; }
  S.gold-=item.price; if(typeof saveGold==='function') saveGold(S.gold);
  const ni={...item,id:item.id+'_'+Date.now(),_blackMarket:true}; delete ni.price;
  S.inventory=[...(S&&S.inventory||[]),ni]; if(typeof saveInventory==='function') saveInventory(S.inventory);
  window.updateHeader&&window.updateHeader(); bm.stock=bm.stock.filter(i=>i.id!==id); saveBM(bm);
  toastHTML(`🌑 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon)} ${esc(item.name)} 구매 (-${esc(item.price)}G)`,2500); renderBlackMarketPanel();
}
window.buyBMItem = buyBMItem;

export function sellStolenItem(id){
  const inv=S&&S.inventory||[]; const idx=inv.findIndex(i=>i.id===id); if(idx===-1){ toast('없음'); return; }
  const item=inv[idx]; const price=Math.floor((item.price||50)*0.4);
  inv.splice(idx,1); S.inventory=inv; if(typeof saveInventory==='function') saveInventory(inv);
  S.gold=(S&&S.gold||0)+price; if(typeof saveGold==='function') saveGold(S.gold);
  window.updateHeader&&window.updateHeader(); toastHTML(`💰 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon||"📦")} ${esc(item.name)} 처분 (+${esc(price)}G)`,2500); renderBlackMarketPanel&&renderBlackMarketPanel();
}
window.sellStolenItem = sellStolenItem;

export function detectStolenItems(text){
  if(!/훔쳤|도둑질|약탈|빼앗|털었|강탈/.test(text||'')) return;
  const inv=S&&S.inventory||[];
  [...inv].reverse().slice(0,2).forEach(item=>{ if(!item._stolen&&!item._blackMarket){ item._stolen=true; item._stolenAt=S&&S.msgCount||0; } });
  if(typeof saveInventory==='function') saveInventory(inv);
}
window.detectStolenItems = detectStolenItems;

(function(){
  if(document.getElementById('p-black-market')) return;
  const div=document.createElement('div'); div.className='panel-ov'; div.id='p-black-market';
  div.innerHTML=`<div class="panel"><div class="p-hdr"><span class="p-title">🌑 암시장</span><button class="p-close" onclick="closeP('black-market')">✕</button></div><div class="p-body scrollable" id="pb-black-market"></div></div>`;
  document.body.appendChild(div);
})();

setTimeout(function(){
  try{
    const b=document.querySelector('.btm-bar'); if(!b) return;
    const isW=typeof _isWanderer==='function'&&_isWanderer();
    const ax=typeof loadWdrAxis==='function'?loadWdrAxis():0;
    if((isW||ax<=-30)&&!document.getElementById('btn-bm')){
      const bn=document.createElement('button'); bn.id='btn-bm'; bn.className='bb';
      bn.style.cssText='color:#c03030;border-color:#3a1005'; bn.textContent='🌑암시장'; bn.title='암시장';
      bn.onclick=function(){ window.openP('black-market'); renderBlackMarketPanel(); }; b.appendChild(bn);
    }
  }catch(e){}
},6000);

window.markItemStolen=markItemStolen;

window.isStolenItem=isStolenItem;

window.buyBMItem=buyBMItem;

window.sellStolenItem=sellStolenItem;

window.renderBlackMarketPanel=renderBlackMarketPanel;

window.detectStolenItems=detectStolenItems;

window.refreshBlackMarket=refreshBlackMarket;

export const CONTRACT_LOG_KEY='tf-contracts-log';

export const CONTRACT_ORG_KEY='tf-contracts-orgctrl';

export const MERC_BAND_KEY='tf-mercband';

export const MERC_ARCHETYPE_KEYS = Object.keys(MERC_ARCHETYPES);

export const MERC_RARITY_KEYS = Object.keys(MERC_RARITY);

export function rollMercRarity(){
  const total = MERC_RARITY_KEYS.reduce((s,k)=>s+MERC_RARITY[k].weight, 0);
  let roll = Math.random()*total;
  for(const k of MERC_RARITY_KEYS){
    roll -= MERC_RARITY[k].weight;
    if(roll<=0) return k;
  }
  return 'common';
}
window.rollMercRarity = rollMercRarity;

export function rollMercRarityForNpc(npc, offerGold){
  const highRanks = ['기사','귀족','장인','상인','왕족'];
  const rankBoost = (npc.rank && highRanks.some(r=>String(npc.rank).includes(r))) ? 1.8 : 1.0;
  const payBoost = 1 + Math.min(1.2, Math.max(0, (offerGold-30)/150)); // 급여 후할수록↑
  const boost = rankBoost * payBoost;
  const weights = MERC_RARITY_KEYS.map(k=>{
    // common/uncommon은 보정 반대로(고급일수록 낮은 등급 비중이 줄어듦), rare 이상은 boost 그대로 곱함
    const isLow = (k==='common'||k==='uncommon');
    return { key:k, w: MERC_RARITY[k].weight * (isLow ? Math.max(0.3, 1/boost) : boost) };
  });
  const total = weights.reduce((s,w)=>s+w.w, 0);
  let roll = Math.random()*total;
  for(const w of weights){ roll -= w.w; if(roll<=0) return w.key; }
  return 'common';
}
window.rollMercRarityForNpc = rollMercRarityForNpc;

export const MERC_TRAIT_KEYS = Object.keys(MERC_TRAITS);

export function mercXpToNext(level){ return 20 + (level-1)*15; }
window.mercXpToNext = mercXpToNext;

export function canMercEvolve(m){
  const threshold = MERC_EVO_THRESHOLDS[m.evoCount||0];
  if(threshold===undefined) return false;
  // 등급별 각성 상한 — 낮은 등급은 일찍 성장이 막힌다("이 녀석은 여기까지").
  const rarity = MERC_RARITY[m.rarity] || MERC_RARITY.common;
  if((m.evoCount||0) >= rarity.maxEvo) return false;
  return (m.level||1)>=threshold;
}
window.canMercEvolve = canMercEvolve;

export function loadContractLog(){ try{ return JSON.parse(lsGet(CONTRACT_LOG_KEY)||'[]'); }catch(e){ return []; } }
window.loadContractLog = loadContractLog;

export function saveContractLog(d){ try{ lsSet(CONTRACT_LOG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveContractLog = saveContractLog;

export function loadOrgControl(){ try{ return JSON.parse(lsGet(CONTRACT_ORG_KEY)||'[]'); }catch(e){ return []; } }
window.loadOrgControl = loadOrgControl;

export function saveOrgControl(d){ try{ lsSet(CONTRACT_ORG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveOrgControl = saveOrgControl;

export function loadMercBand(){
  let d;
  try{ d = JSON.parse(lsGet(MERC_BAND_KEY)||'null')||{members:[],upkeepDue:0,alignment:'lawful',established:false}; }
  catch(e){ d = {members:[],upkeepDue:0,alignment:'lawful',established:false}; }
  // [마이그레이션] established 필드 도입 이전에 이미 7명 이상 모았던 기존
  // 유저가 이 필드가 없다고 갑자기 기능이 잠기는 걸 방지 — 조건을 이미
  // 만족했다면 자동으로 정식 출범 처리한다. 저장까지는 하지 않고(다음
  // 실제 변경 시점에 자연히 저장됨) 메모리 상에서만 보정한다.
  if(d.established===undefined || d.established===null){
    d.established = (d.members||[]).length >= 7;
  }
  return d;
}
window.loadMercBand = loadMercBand;

export function saveMercBand(d){ try{ lsSet(MERC_BAND_KEY, JSON.stringify(d)); }catch(e){} }
window.saveMercBand = saveMercBand;

export function getMercCrimeLord(){
  const sid = S.scenario?.id || 'medieval';
  return MERC_CRIME_LORD_BY_SCENARIO[sid] || MERC_CRIME_LORD_BY_SCENARIO.custom;
}
window.getMercCrimeLord = getMercCrimeLord;

export function isOrgAbsorbed(orgKey){ return loadOrgControl().includes(orgKey); }
window.isOrgAbsorbed = isOrgAbsorbed;

export function isContractUnlocked(def){
  const org = def.org==='__any__' ? null : CONTRACT_ORGS[def.org];
  const karma = (S.character && S.character.karmaScore) || 50;
  if(org && karma < (org.karmaReq||0)) return false;
  if(def.id==='org_absorb'){
    // 흡수 의뢰: 카르마 80+ & 평판 300+ & 골드 1000+ 필요
    const rep = loadReputation();
    return karma>=80 && (rep.score||0)>=300 && (S.gold||0)>=1000;
  }
  return true;
}
window.isContractUnlocked = isContractUnlocked;

export function calcContractSuccess(def){
  const stat = (S.stats && S.stats[def.statBonus]) || 50;
  const statMod = (stat-50)/250; // 스탯 50 기준 ±0.2 보정
  const rep = loadReputation();
  const repMod = Math.min(0.15, (rep.score||0)/2000);
  const karma = (S.character && S.character.karmaScore) || 50;
  const karmaMod = (def.org==='thieves'||def.org==='assassins') ? Math.min(0.1, karma/1000) : 0;
  const absorbedBonus = (def.org!=='__any__' && isOrgAbsorbed(def.org)) ? 0.2 : 0;
  return Math.max(0.05, Math.min(0.97, def.successBase + statMod + repMod + karmaMod + absorbedBonus));
}
window.calcContractSuccess = calcContractSuccess;

export function executeContract(defId){
  const def = CONTRACT_DEFS.find(d=>d.id===defId);
  if(!def){ toast('알 수 없는 의뢰'); return; }
  if(!isContractUnlocked(def)){ toast('🔒 아직 이 의뢰에 접근할 자격이 없습니다.'); return; }
  const cost = isOrgAbsorbed(def.org) ? Math.floor(def.cost*0.5) : def.cost;
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  const succRate = calcContractSuccess(def);
  const roll = Math.random();
  const success = roll < succRate;
  const log = loadContractLog();
  const entry = { id:'log_'+Date.now(), contractId:def.id, name:def.name, org:def.org, cost, success, at:S.msgCount||0 };

  if(success){
    toastHTML(`✅ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} ${esc(def.name)} 성공!`, 3000);
    if(typeof window.updateStats==='function') window.updateStats('contract_success_count', 1);
    if(def.karmaGainOnSuccess && S.character){ S.character.karmaScore = Math.min(100,(S.character.karmaScore||50)+def.karmaGainOnSuccess); }
    if(def.id==='org_absorb'){
      const orgCtrl = loadOrgControl();
      // 가장 최근에 거래한 조직 또는 도적/암살 계열 우선 흡수
      const target = (S._lastContractOrg && S._lastContractOrg!=='__any__') ? S._lastContractOrg : 'thieves';
      if(!orgCtrl.includes(target)){ orgCtrl.push(target); saveOrgControl(orgCtrl); }
      toast(`👑 ${CONTRACT_ORGS[target]?.name||target} 조직을 흡수했습니다! 이후 의뢰 비용 50% 할인, 정기 수입 발생.`, 4000);
      entry.absorbedOrg = target;
    } else if(def.org!=='__any__'){
      S._lastContractOrg = def.org;
      updateFactionRep&&updateFactionRep(CONTRACT_ORGS[def.org].factionName, 5);
    }
    // [개편] merc_band(정식 고용)만 확정 합류. merc_escort/intimidate 같은
    // 1회성 외주 의뢰는 그 일만 처리하는 게 자연스러우므로 확정 합류 대상이
    // 아니다 — 대신 낮은 확률로 "이번 일로 눈에 들어 자청해 남는" 스카우트
    // 텍스트를 붙여 완전히 배제하지는 않는다.
    if(def.recruitChance>0 && Math.random()<def.recruitChance){
      const scouted = def.id!=='merc_band';
      recruitMercenary(def, scouted);
      entry.recruited=true;
    }
    entry.narrativeHint = def.successHint;
  } else {
    toastHTML(`❌ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} ${esc(def.name)} 실패...`, 3000);
    if(def.repPenaltyOnFail) updateReputation(-def.repPenaltyOnFail);
    if(def.jailRiskOnFail && Math.random()<def.jailRiskOnFail){
      entry.triggeredJail=true;
      toast('🚨 의뢰가 발각되어 경비대가 당신을 추적합니다!', 3500);
      try{ if(typeof checkFactionPursuit==='function') checkFactionPursuit(); }catch(e){}
    }
    entry.narrativeHint = def.failHint;
  }
  log.push(entry); saveContractLog(log);
  S._pendingContractHint = entry.narrativeHint; // 다음 AI 호출 시 1회 소비
  renderContractsPanel();
}
window.executeContract = executeContract;

export function recruitMercenary(def, scouted){
  const band = loadMercBand();
  const names=['그릭','데번','마라','코르빈','아셰라','바딘','롭사','테오','유나','칼릭스','네사','오린'];
  const archKey = MERC_ARCHETYPE_KEYS[Math.floor(Math.random()*MERC_ARCHETYPE_KEYS.length)];
  const arch = MERC_ARCHETYPES[archKey];
  const traitKey = MERC_TRAIT_KEYS[Math.floor(Math.random()*MERC_TRAIT_KEYS.length)];
  const trait = MERC_TRAITS[traitKey];
  const rarityKey = (typeof rollMercRarity==='function') ? rollMercRarity() : 'common';
  const rarity = MERC_RARITY[rarityKey];
  const member = {
    id:'merc_'+Date.now()+'_'+Math.floor(Math.random()*1000),
    name:names[Math.floor(Math.random()*names.length)]+' 용병',
    icon:arch.icon, archetype:archKey, trait:traitKey, rarity:rarityKey,
    level:1, xp:0,
    loyalty:60+Math.floor(Math.random()*20),
    upkeep:Math.round((8+Math.floor(Math.random()*6)) * (trait.upkeepMult||1) * (rarity.upkeepMult||1)),
    joinedAt:S.msgCount||0,
  };
  band.members.push(member);
  if(typeof updateMercCaptain==='function') updateMercCaptain(band);
  if(typeof checkMercBandEstablished==='function') checkMercBandEstablished(band);
  saveMercBand(band);
  if(typeof window.updateStats==='function') window.updateStats('merc_recruit_count', 1);
  const joinText = scouted
    ? `이번 일로 ${member.name}이 마음에 들어 자청해 용병단에 합류했습니다!`
    : `${member.icon} ${member.name}이 용병단에 합류했습니다!`;
  const rarityTag = (rarityKey==='epic'||rarityKey==='legendary'||rarityKey==='primal') ? ` ✨${rarity.label}` : '';
  toast(`🤝 ${joinText} (${rarity.label} ${arch.label}·${trait.label}, 현재 ${band.members.length}명)${rarityTag}`, 4000);
}
window.recruitMercenary = recruitMercenary;

export function getHireableNpcs(){
  const npcs = S.npcs || [];
  const bandIds = new Set((loadMercBand().members||[]).map(m=>m.sourceNpc).filter(Boolean));
  return npcs.filter(n=>{
    if(n.active===false || n.inParty || n.inMercBand) return false;
    if(bandIds.has(n.name)) return false;
    if(n.relationship!==undefined && n.relationship<30) return false;
    // 신분이 아예 기록되지 않은 NPC(단역 등)는 신분 불명 취급해 통과시키되,
    // 신분이 명시돼 있다면 반드시 고용 가능한 신분이어야 한다.
    const rank = n.rank || n.socialRank || '';
    if(rank && !MERC_HIREABLE_RANKS.includes(rank)) return false;
    return true;
  });
}
window.getHireableNpcs = getHireableNpcs;

export function guessMercArchetypeFromRole(npc){
  const text = ((npc.role||'')+' '+(npc.faction||'')+' '+(npc.personality||'')).toLowerCase();
  if(/기사|전사|용병|경비|검|근위/.test(text)) return 'vanguard';
  if(/궁수|사냥꾼|저격|정찰/.test(text)) return 'archer';
  if(/치유|신관|사제|의술|약초/.test(text)) return 'medic';
  if(/도적|암살|첩보|잠입|은신/.test(text)) return 'skirmisher';
  return MERC_ARCHETYPE_KEYS[Math.floor(Math.random()*MERC_ARCHETYPE_KEYS.length)];
}
window.guessMercArchetypeFromRole = guessMercArchetypeFromRole;

export function proposeHire(npcName, offerGold){
  const npcs = S.npcs || [];
  const npc = npcs.find(n=>n.name===npcName);
  if(!npc){ toast('해당 인물을 찾을 수 없습니다.'); return; }
  if((S.gold||0) < offerGold){ toast(`골드 부족 (${offerGold}G 필요)`); return; }

  const rel = npc.relationship!==undefined ? npc.relationship : 50;
  const relMod = Math.max(-0.3, Math.min(0.45, (rel-50)/150)); // 호감도 50 기준 ±
  const payMod = Math.min(0.3, Math.max(0, (offerGold-30)/300)); // 급여를 후하게 줄수록 승낙률↑
  const chance = Math.max(0.05, Math.min(0.95, 0.4 + relMod + payMod));

  S.gold -= offerGold; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  if(Math.random() >= chance){
    toast(`❌ ${npcName}이(가) 제안을 거절했습니다. (승낙 확률 ${Math.round(chance*100)}%)`, 3500);
    S._pendingContractHint = `주인공이 ${npcName}에게 용병 합류를 제안했으나 거절당했다.`;
    return;
  }

  const band = loadMercBand();
  const archKey = guessMercArchetypeFromRole(npc);
  const arch = MERC_ARCHETYPES[archKey];
  const traitKey = MERC_TRAIT_KEYS[Math.floor(Math.random()*MERC_TRAIT_KEYS.length)];
  const trait = MERC_TRAITS[traitKey];
  const rarityKey = (typeof rollMercRarityForNpc==='function') ? rollMercRarityForNpc(npc, offerGold) : 'common';
  const rarity = MERC_RARITY[rarityKey];
  // 호감도가 높을수록 초기 충성도도 더 높게 시작 (기존 관계가 반영됨)
  const startLoyalty = Math.min(95, 50 + Math.round(rel*0.4));
  const member = {
    id:'merc_'+Date.now()+'_'+Math.floor(Math.random()*1000),
    name:npc.name, sourceNpc:npc.name,
    icon:npc.icon||arch.icon, archetype:archKey, trait:traitKey, rarity:rarityKey,
    level:1, xp:0,
    loyalty:startLoyalty,
    upkeep:Math.round((10+Math.floor(offerGold/20)) * (trait.upkeepMult||1) * (rarity.upkeepMult||1)),
    joinedAt:S.msgCount||0,
  };
  band.members.push(member);
  if(typeof updateMercCaptain==='function') updateMercCaptain(band);
  if(typeof checkMercBandEstablished==='function') checkMercBandEstablished(band);
  saveMercBand(band);
  // NPC를 용병단 소속으로 표시 — 다른 시스템에서 중복 영입/파티 합류 등과 충돌하지 않도록
  npc.inMercBand = true;
  if(typeof saveNPCs==='function') saveNPCs(npcs);
  if(typeof window.updateStats==='function') window.updateStats('merc_recruit_count', 1);
  toast(`🤝 ${npc.name}이(가) 용병단 합류를 승낙했습니다! (${rarity.label} ${arch.label}·${trait.label})`, 4000);
  S._pendingContractHint = `${npc.name}이 정식으로 용병단에 합류해 주인공과 함께하기 시작했다.`;
  renderContractsPanel();
}
window.proposeHire = proposeHire;

window.proposeHire = proposeHire;

window.getHireableNpcs = getHireableNpcs;

export function getMercMemberPower(m, gearMult){
  const arch = MERC_ARCHETYPES[m.archetype] || MERC_ARCHETYPES.vanguard;
  const trait = MERC_TRAITS[m.trait] || {};
  const rarity = MERC_RARITY[m.rarity] || MERC_RARITY.common;
  const lvl = m.level||1;
  const loyaltyMod = m.loyalty>=50 ? 1 : 0.4;
  const base = (2 + lvl*0.6 + (m.evoBonus||0)) * (trait.bonusMult||1) * (rarity.bonusMult||1) * loyaltyMod * (gearMult||1);
  return { statKeys: arch.statKeys, amount: Math.max(0, Math.round(base)) };
}
window.getMercMemberPower = getMercMemberPower;

export function getMercBandBonus(){
  const band = loadMercBand();
  const resident = (typeof getResidentMembers==='function') ? getResidentMembers(band) : band.members;
  if(!resident.length) return {str:0,end:0,agi:0,per:0,rng:0,fath:0,wil:0,count:0};
  const gearMult = (typeof getMercGearTier==='function') ? getMercGearTier(band).bonusMult : 1;
  const totals = {str:0,end:0,agi:0,per:0,rng:0,fath:0,wil:0};
  resident.forEach(m=>{
    const p = getMercMemberPower(m, gearMult);
    p.statKeys.forEach(k=>{ if(totals[k]!==undefined) totals[k]+=p.amount; });
  });
  totals.count = resident.length;
  return totals;
}
window.getMercBandBonus = getMercBandBonus;

export function grantMercBandXp(amount){
  const band = loadMercBand();
  if(!band.members.length) return;
  let leveled = [];
  let evolving = [];
  const hqEff = (typeof getMercHqEffects==='function') ? getMercHqEffects(band) : {xpBonus:0};
  band.members.forEach(m=>{
    const trait = MERC_TRAITS[m.trait] || {};
    m.xp = (m.xp||0) + Math.round(amount * (trait.xpMult||1) * (1+hqEff.xpBonus));
    let need = mercXpToNext(m.level||1);
    while(m.xp >= need){
      m.xp -= need; m.level = (m.level||1) + 1;
      leveled.push(m.name+' Lv.'+m.level);
      need = mercXpToNext(m.level);
    }
    if(typeof canMercEvolve==='function' && canMercEvolve(m)) evolving.push(m);
  });
  saveMercBand(band);
  if(leveled.length) toast(`📈 ${leveled.join(', ')} 레벨업!`, 3500);
  // 진화 대상은 한 번에 하나씩만 처리(여러 명이 동시에 각성하면 AI 프롬프트가
  // 과도하게 복잡해지므로, 가장 레벨 높은 한 명만 이번 턴에 진화 요청한다)
  if(evolving.length && typeof requestAIMercEvolution==='function'){
    const top = evolving.sort((a,b)=>(b.level||1)-(a.level||1))[0];
    requestAIMercEvolution(top);
  }
}
window.grantMercBandXp = grantMercBandXp;

window.grantMercBandXp = grantMercBandXp;

export const MERC_EVO_LOG_KEY = 'tf-merc-evo-log';

export const MERC_EVO_LOCAL_MIN_SAMPLES = 4;

export function loadMercEvoLog(){ try{ return JSON.parse(lsGet(MERC_EVO_LOG_KEY)||'{}'); }catch(e){ return {}; } }
window.loadMercEvoLog = loadMercEvoLog;

export function saveMercEvoLog(d){ try{ lsSet(MERC_EVO_LOG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveMercEvoLog = saveMercEvoLog;

export function mercEvoLogKey(archetype, evoCount, rarityTier){ return archetype+'_'+evoCount+'_'+(rarityTier||'low'); }
window.mercEvoLogKey = mercEvoLogKey;

export function requestAIMercEvolution(m){
  const evoCount = m.evoCount||0;
  const stageName = MERC_EVO_STAGE_NAMES[evoCount] || (evoCount+1)+'차';
  const arch = MERC_ARCHETYPES[m.archetype] || MERC_ARCHETYPES.vanguard;
  const trait = MERC_TRAITS[m.trait] || {};
  const rarity = MERC_RARITY[m.rarity] || MERC_RARITY.common;
  // 등급을 낮은/높은 2그룹으로만 묶어 로그 키에 반영 — 등급별로 완전히
  // 쪼개면 데이터가 너무 희소해져 로컬 재사용이 거의 일어나지 않으므로,
  // "흔한 계열(common~rare)"과 "귀한 계열(epic 이상)" 두 묶음만 구분한다.
  const rarityTier = ['epic','legendary','primal'].includes(m.rarity) ? 'high' : 'low';

  // ── 로컬 매칭 우선 시도 — 같은 (직군, 각성단계, 등급군) 조합 로그가
  //    충분히 쌓여 있으면 AI를 호출하지 않고 그 풀에서 하나를 골라 즉시 적용한다.
  const log = loadMercEvoLog();
  const pool = log[mercEvoLogKey(m.archetype, evoCount, rarityTier)] || [];
  if(pool.length >= MERC_EVO_LOCAL_MIN_SAMPLES){
    const picked = pool[Math.floor(Math.random()*pool.length)];
    if(typeof handleMercEvolve==='function'){
      handleMercEvolve([{ name:m.name, newDesc:picked.newDesc, newSkill:picked.newSkill, newSkillDesc:picked.newSkillDesc, statBoost:picked.statBoost }], /*fromLocal=*/true);
    }
    return;
  }

  const scaleGuide = [
    '1차=각성(전투 방식에 자기만의 색이 생김)',
    '2차=개화(고유 별명이나 명성이 붙기 시작, 부대 내 입지 확립)',
    '3차=군림(주변 NPC나 다른 용병들이 이 인물을 알아보고 반응)',
    '4차=초월(직군의 한계를 넘어선 독자적인 전투 스타일 확립)',
    '5차=신화(지역 전역에 이름이 알려진 전설적 용병)',
    '6차=현현(세력·역사에 기록될 만한 존재로 완성)',
  ];
  const rarityGuide = rarity.maxEvo>=6
    ? '이 용병은 "'+rarity.label+'" 등급 — 최고 등급이라 현현(6차)까지 성장할 수 있는 특별한 그릇이다. 각성 묘사도 그에 걸맞게 더 극적이고 인상적으로.'
    : '이 용병은 "'+rarity.label+'" 등급 — 이번이 이 용병이 도달할 수 있는 마지막 각성(최대 '+rarity.maxEvo+'차)일 수 있다. 등급에 맞는 수수하거나 적당한 성장으로 묘사하라(전설급처럼 과장하지 말 것).';
  const prompt = '\n[⚔️ '+m.name+' '+stageName+' 각성 — 지금 즉시 서사에서 묘사하고 GS 출력]\n'
    +'용병 정보: 이름='+m.name+', 등급='+rarity.label+', 직군='+arch.label+', 특성='+(trait.label||'')+'('+(trait.desc||'')+')\n'
    +'현재 Lv.'+(m.level||1)+', 충성도='+(m.loyalty||60)+'\n'
    +'이번 각성: '+stageName+' ('+(evoCount+1)+'/6단, 이 용병의 각성 상한: '+rarity.maxEvo+'단)\n'
    +'스케일 기준: '+(scaleGuide[evoCount]||'')+'\n'
    +rarityGuide+'\n'
    +'지금까지의 서사 맥락, 이 용병의 직군·특성·소속(용병단/범죄 조직), 함께한 전투를 반영해\n'
    +'이 인물이 한 단계 더 강하고 개성 있는 존재로 성장하는 장면을 그려라.\n'
    +'이름이 바뀔 필요는 없지만(원한다면 별명/이명을 붙여도 좋다), 외형 묘사나 전투 스타일, 고유 스킬이\n'
    +'뚜렷하게 발전해야 한다. 각성 장면을 극적으로 묘사한 뒤 반드시 <gs>에 출력:\n'
    +'"merc_evolve":[{"name":"'+m.name+'","newName":"이명이 붙은 이름(선택, 없으면 생략)","newIcon":"이모지(선택)","newDesc":"외형·전투스타일 묘사 2줄","newSkill":"고유 스킬명","newSkillDesc":"스킬 설명","statBoost":{"amount":3}}]\n'
    +'5차(amount:8+), 6차(amount:12+)로 스탯 부스트 스케일도 올려라.';
  S._nextInjectedContext = (S._nextInjectedContext||'') + prompt;
  setTimeout(()=>toast(`✨ ${m.name} ${stageName} 각성 준비! 다음 행동에서 각성합니다`, 4500), 500);
}
window.requestAIMercEvolution = requestAIMercEvolution;

window.requestAIMercEvolution = requestAIMercEvolution;

export function handleMercEvolve(evoList, fromLocal){
  if(!Array.isArray(evoList)) return;
  const band = loadMercBand();
  let changed = false;
  const evoLog = fromLocal ? null : loadMercEvoLog();
  evoList.forEach(ev=>{
    if(!ev || !ev.name) return;
    const m = band.members.find(x=>x.name && x.name.includes(String(ev.name).slice(0,4)));
    if(!m) return;
    const oldName = m.name, oldIcon = m.icon;
    const evoCountBefore = m.evoCount||0;
    if(ev.newName) m.name = ev.newName;
    if(ev.newIcon) m.icon = ev.newIcon;
    if(ev.newDesc) m.evoDesc = ev.newDesc;
    if(ev.newSkill){ m.evoSkill = ev.newSkill; m.evoSkillDesc = ev.newSkillDesc||''; }
    const boost = ev.statBoost || {};
    m.evoBonus = (m.evoBonus||0) + (boost.amount||3); // getMercMemberPower에 가산되는 진화 보너스
    m.loyalty = Math.min(100, (m.loyalty||60)+10);
    m.evoCount = (m.evoCount||0) + 1;
    m.evoHistory = m.evoHistory || [];
    m.evoHistory.push({from:oldName, to:m.name, fromIcon:oldIcon, toIcon:m.icon, atLevel:m.level, skill:m.evoSkill, at:new Date().toLocaleString('ko-KR'), source:fromLocal?'local':'ai'});
    changed = true;
    // [AI 호출 절감 축적] AI가 방금 생성한 결과를 (직군, 각성단계, 등급군) 로그에
    // 저장 — 이 조합의 로그가 충분히 쌓이면 다음부터는 로컬에서 재사용된다.
    if(evoLog && ev.newDesc){
      const rarityTier = ['epic','legendary','primal'].includes(m.rarity) ? 'high' : 'low';
      const key = mercEvoLogKey(m.archetype, evoCountBefore, rarityTier);
      if(!evoLog[key]) evoLog[key] = [];
      // 완전히 같은 묘사가 이미 있으면 중복 저장하지 않음(풀 다양성 확보)
      if(!evoLog[key].some(p=>p.newDesc===ev.newDesc)){
        evoLog[key].push({ newDesc:ev.newDesc, newSkill:ev.newSkill, newSkillDesc:ev.newSkillDesc, statBoost:boost });
        if(evoLog[key].length > 20) evoLog[key].shift(); // 풀 크기 상한
      }
    }
    if(typeof showMercEvoPopup==='function') showMercEvoPopup(m, oldName, oldIcon, ev);
    if(typeof addTimelineEvent==='function') addTimelineEvent('merc_evo', oldName+' → '+m.name, {icon:m.icon||'⚔️'});
  });
  if(evoLog) saveMercEvoLog(evoLog);
  if(changed){ saveMercBand(band); if(typeof renderContractsPanel==='function') renderContractsPanel(); }
}
window.handleMercEvolve = handleMercEvolve;

window.handleMercEvolve = handleMercEvolve;

export function showMercEvoPopup(m, oldName, oldIcon, ev){
  document.querySelectorAll('.merc-evo-popup').forEach(el=>el.remove());
  const arch = MERC_ARCHETYPES[m.archetype] || MERC_ARCHETYPES.vanguard;
  const trait = MERC_TRAITS[m.trait] || {};
  const archColorMap = { vanguard:'#c8a96e', skirmisher:'#8a9a6a', archer:'#6a9ac0', medic:'#8ac0a0' };
  const archColor = archColorMap[m.archetype] || '#c8a96e';
  const stageLabel = MERC_EVO_STAGE_NAMES[(m.evoCount||1)-1] || '';
  const popup = document.createElement('div');
  popup.className = 'merc-evo-popup';
  popup.style.cssText = 'position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .3s';
  popup.innerHTML =
    '<div style="width:100%;max-width:340px;background:#0d0800;border:2px solid '+archColor+';box-shadow:0 0 60px '+archColor+'55;overflow:hidden">'
    +'<div style="background:linear-gradient(135deg,#1a0f00,#2a1a05);padding:16px;text-align:center;border-bottom:1px solid '+archColor+'44">'
    +'<div style="font-family:\'Cinzel\',serif;font-size:9px;color:'+archColor+';letter-spacing:3px;margin-bottom:6px">✦ '+stageLabel+' AWAKENING ✦</div>'
    +'<div style="display:flex;align-items:center;justify-content:center;gap:14px;margin:8px 0">'
    +'<div style="opacity:.4;text-align:center"><div style="font-size:28px">'+(oldIcon||'⚔️')+'</div><div style="font-size:8px;color:#5a4a2a;margin-top:2px">'+esc(oldName)+'</div></div>'
    +'<div style="color:'+archColor+';font-size:20px">→</div>'
    +'<div style="text-align:center"><div style="font-size:44px;filter:drop-shadow(0 0 16px '+archColor+')">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:14}):(m?.icon||'✨'))+'</div><div style="font-family:\'Cinzel\',serif;font-size:13px;color:#e8d89e;margin-top:4px">'+esc(m.name)+'</div></div>'
    +'</div>'
    +'<div style="font-size:9px;color:#8a7a4a">Lv.'+(m.level||1)+' · '+arch.label+' · '+stageLabel+' 각성 ('+(m.evoCount||1)+'/6)</div>'
    +'</div>'
    +'<div style="padding:14px 16px">'
    +(m.evoDesc?'<div style="font-size:10px;color:#c0b080;line-height:1.7;margin-bottom:10px;text-align:center;font-style:italic">'+esc(m.evoDesc)+'</div>':'')
    +(m.evoSkill?'<div style="padding:8px 10px;background:#0a0500;border-left:3px solid '+archColor+';margin-bottom:10px"><div style="font-size:9px;color:'+archColor+';margin-bottom:2px">✦ 새 스킬</div><div style="font-size:11px;color:#d0b0f0">'+esc(m.evoSkill)+'</div>'+(m.evoSkillDesc?'<div style="font-size:9px;color:#8060a0;margin-top:2px">'+esc(m.evoSkillDesc)+'</div>':'')+'</div>':'')
    +'<div style="font-size:9px;color:#8a7a4a;margin-bottom:10px">🏷️ '+arch.label+' · '+(typeof getEntityIconHTML==='function'?getEntityIconHTML(trait,{size:14}):(trait?.icon||''))+' '+(trait.label||'')+'</div>'
    +'<div style="display:flex;gap:5px;font-size:9px;color:#80c080;flex-wrap:wrap;margin-bottom:12px"><span>⚔️ 전투력+'+((ev.statBoost&&ev.statBoost.amount)||3)+'</span><span>💛 충성+10</span></div>'
    +'<button onclick="this.closest(\'.merc-evo-popup\').remove()" style="width:100%;padding:10px;background:linear-gradient(135deg,#2a1f0d,#3a2a10);border:1px solid '+archColor+';color:'+archColor+';font-family:\'Cinzel\',serif;font-size:11px;cursor:pointer;letter-spacing:1px">확인</button>'
    +'</div></div>';
  document.body.appendChild(popup);
  popup.addEventListener('click', e=>{ if(e.target===popup) popup.remove(); });
}
window.showMercEvoPopup = showMercEvoPopup;

window.showMercEvoPopup = showMercEvoPopup;

export function tickMercWalkIns(){
  const band = loadMercBand();
  const influence = (typeof getMercBandInfluenceTier==='function') ? getMercBandInfluenceTier(band.members.length) : null;
  if(!influence) return; // 아직 이름이 알려질 정도가 아니면 찾아오는 사람도 없다
  const hqEff = (typeof getMercHqEffects==='function') ? getMercHqEffects(band) : {walkInBonus:0};

  // 1) 이미 만난 NPC 중 하나가 소문을 듣고 먼저 합류를 제안하는 경우 (더 개연성 있음)
  if(Math.random() < (0.04 + hqEff.walkInBonus)){
    const candidates = (typeof getHireableNpcs==='function') ? getHireableNpcs() : [];
    const good = candidates.filter(n=>(n.relationship||50) >= 55);
    if(good.length){
      const npc = good[Math.floor(Math.random()*good.length)];
      S._pendingMercWalkIn = { type:'npc', name:npc.name };
      S._pendingContractHint = `${npc.name}이 용병단의 소문을 듣고 먼저 합류를 청해왔다. 주인공이 이를 받아들일지 대화로 결정할 수 있다.`;
      toast(`📢 ${npc.name}이 용병단 합류를 자청했습니다! 대화로 응답해보세요.`, 4000);
      return;
    }
  }
  // 2) 이름 모를 지원자가 소문만 듣고 찾아오는 경우 (게시판과 별개로 즉시 합류 제안)
  if(Math.random() < (0.03 + hqEff.walkInBonus)){
    S._pendingMercWalkIn = { type:'stranger' };
    S._pendingContractHint = `용병단의 명성을 듣고 낯선 지원자가 찾아와 합류를 청했다. 주인공이 대화로 받아들이거나 거절할 수 있다.`;
    toast(`📢 낯선 지원자가 용병단에 합류를 청하러 왔습니다!`, 4000);
  }
}
window.tickMercWalkIns = tickMercWalkIns;

window.tickMercWalkIns = tickMercWalkIns;

export function acceptMercWalkIn(){
  const pending = S._pendingMercWalkIn;
  if(!pending){ toast('현재 대기 중인 지원자가 없습니다.'); return; }
  if(pending.type==='npc' && pending.name){
    // 급여 없이(자원) 합류 — proposeHire와 달리 승낙률 판정도 생략(이미 본인이 청한 것이므로)
    const npcs = S.npcs || [];
    const npc = npcs.find(n=>n.name===pending.name);
    if(!npc){ toast('해당 인물을 더 이상 찾을 수 없습니다.'); S._pendingMercWalkIn=null; return; }
    const band = loadMercBand();
    const archKey = (typeof guessMercArchetypeFromRole==='function') ? guessMercArchetypeFromRole(npc) : 'vanguard';
    const arch = MERC_ARCHETYPES[archKey];
    const traitKey = MERC_TRAIT_KEYS[Math.floor(Math.random()*MERC_TRAIT_KEYS.length)];
    const trait = MERC_TRAITS[traitKey];
    const rel = npc.relationship!==undefined ? npc.relationship : 50;
    const rarityKey = (typeof rollMercRarityForNpc==='function') ? rollMercRarityForNpc(npc, 0) : 'common';
    const rarity = MERC_RARITY[rarityKey];
    const member = {
      id:'merc_'+Date.now()+'_'+Math.floor(Math.random()*1000),
      name:npc.name, sourceNpc:npc.name,
      icon:npc.icon||arch.icon, archetype:archKey, trait:traitKey, rarity:rarityKey,
      level:1, xp:0, loyalty:Math.min(95, 55+Math.round(rel*0.3)),
      upkeep:Math.round((10+Math.floor(Math.random()*6)) * (rarity.upkeepMult||1)),
      joinedAt:S.msgCount||0,
    };
    band.members.push(member);
    if(typeof updateMercCaptain==='function') updateMercCaptain(band);
    if(typeof checkMercBandEstablished==='function') checkMercBandEstablished(band);
    saveMercBand(band);
    npc.inMercBand = true;
    if(typeof saveNPCs==='function') saveNPCs(npcs);
    toast(`🤝 ${npc.name}이(가) 용병단에 합류했습니다! (${rarity.label} ${arch.label}·${trait.label})`, 4000);
  } else {
    // 낯선 지원자 — 기존 뽑기 방식(익명 랜덤 생성) 재사용
    recruitMercenary({}, false);
  }
  S._pendingMercWalkIn = null;
  renderContractsPanel();
}
window.acceptMercWalkIn = acceptMercWalkIn;

window.acceptMercWalkIn = acceptMercWalkIn;

export function declineMercWalkIn(){
  S._pendingMercWalkIn = null;
  toast('지원자를 돌려보냈습니다.', 2000);
  renderContractsPanel();
}
window.declineMercWalkIn = declineMercWalkIn;

window.declineMercWalkIn = declineMercWalkIn;

export function tickMercBand(){
  const band = loadMercBand();
  // [마이그레이션 확정 저장] loadMercBand가 메모리상으로만 보정한
  // established 값을 실제 저장소에 반영해 이후 매번 재계산하지 않도록 한다.
  const rawSaved = (()=>{ try{ return JSON.parse(lsGet(MERC_BAND_KEY)||'null'); }catch(e){ return null; } })();
  if(rawSaved && (rawSaved.established===undefined || rawSaved.established===null) && band.members.length>0){
    saveMercBand(band);
  }
  if(typeof tickMercDeployments==='function') tickMercDeployments();
  if(typeof tickMercJobBoard==='function') tickMercJobBoard(); // 파견 유무와 무관하게 게시판은 항상 갱신
  if(typeof tickMercWalkIns==='function' && !S._pendingMercWalkIn) tickMercWalkIns();
  if(!band.members.length) return;
  const resident = (typeof getResidentMembers==='function') ? getResidentMembers(band) : band.members;
  if(!resident.length) return;
  const hqEff = (typeof getMercHqEffects==='function') ? getMercHqEffects(band) : {upkeepDiscount:0};
  const totalUpkeep = Math.round(resident.reduce((s,m)=>s+m.upkeep,0) * (1-hqEff.upkeepDiscount));
  if((S.gold||0) >= totalUpkeep){
    S.gold -= totalUpkeep; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
    resident.forEach(m=>{ m.loyalty = Math.min(100, m.loyalty + 1); });
  } else {
    // 유지비 미지급 — 충성도 급감(특성별 감쇠율 + 대장 보너스 반영), 이탈/배신 위험
    const captainBonus = (typeof getMercCaptainBonus==='function') ? getMercCaptainBonus(band) : {loyaltyDecayReduce:0};
    resident.forEach(m=>{
      const trait = MERC_TRAITS[m.trait] || {};
      const decay = 15 * (trait.loyaltyDecayMult||1) * (1-captainBonus.loyaltyDecayReduce);
      m.loyalty = Math.max(0, m.loyalty - decay);
    });
    const deserter = resident.find(m=>m.loyalty<=0);
    if(deserter){
      const trait = MERC_TRAITS[deserter.trait] || {};
      const desertRoll = Math.random() * (trait.desertChanceMult!==undefined ? trait.desertChanceMult : 1);
      band.members = band.members.filter(m=>m.id!==deserter.id);
      if(desertRoll < 0.3){
        toast(`⚠️ ${deserter.name}이 등을 돌리고 도적이 되어 떠났다! 평판-10`, 4000);
        updateReputation(-10);
        S._pendingContractHint = `${deserter.name}이라는 이름의 용병이 임금을 받지 못해 배신하고 떠났다. 그가 적이 되어 다시 등장할 수도 있다.`;
      } else {
        toast(`💸 ${deserter.name}이 임금 미지급으로 용병단을 떠났다.`, 3000);
      }
      if(typeof updateMercCaptain==='function') updateMercCaptain(band);
    }
  }
  saveMercBand(band);
}
window.tickMercBand = tickMercBand;

export function getMercBandStatBonus(statKey){
  const bonus = getMercBandBonus();
  return bonus[statKey] || 0;
}
window.getMercBandStatBonus = getMercBandStatBonus;

window.getMercBandStatBonus = getMercBandStatBonus;

window._tickMercBand = tickMercBand;

export const MERC_MISSION_KEYS = Object.keys(MERC_MISSIONS);

export const MERC_CRIME_MISSION_KEYS = Object.keys(MERC_CRIME_MISSIONS);

export function getActiveMercMissions(){
  const band = loadMercBand();
  return (band.alignment==='criminal') ? MERC_CRIME_MISSIONS : MERC_MISSIONS;
}
window.getActiveMercMissions = getActiveMercMissions;

export function findMercMissionDef(key){
  return MERC_MISSIONS[key] || MERC_CRIME_MISSIONS[key] || null;
}
window.findMercMissionDef = findMercMissionDef;

export const MERC_NOTORIETY_KEY = 'tf-mercnotoriety';

export function loadMercNotoriety(){ try{ return parseInt(lsGet(MERC_NOTORIETY_KEY)||'0')||0; }catch(e){ return 0; } }
window.loadMercNotoriety = loadMercNotoriety;

export function saveMercNotoriety(v){ try{ lsSet(MERC_NOTORIETY_KEY, String(Math.max(0,v))); }catch(e){} }
window.saveMercNotoriety = saveMercNotoriety;

export function getMercNotorietyTier(v){
  if(v>=150) return { label:'전설적 무법자', desc:'대륙 전역에 이름이 퍼진 공포의 대상이다.' };
  if(v>=80)  return { label:'악명 높은 두목', desc:'여러 지역의 경비대가 현상금을 걸고 쫓는다.' };
  if(v>=35)  return { label:'알려진 범죄자', desc:'지역 상인과 경비대 사이에서 이름이 오르내린다.' };
  if(v>=10)  return { label:'풋내기 무법자', desc:'몇몇 사건으로 조금씩 이름이 알려지기 시작했다.' };
  return null;
}
window.getMercNotorietyTier = getMercNotorietyTier;

export function detectMercNotorietyFromText(text){
  if(!text) return;
  const band = (typeof loadMercBand==='function') ? loadMercBand() : {members:[]};
  if(!band.members.length) return; // 용병단이 없으면 감지할 이유가 없음
  let gain = 0;
  if(/학살|몰살|도시.*불태|마을.*불태|떼죽음/.test(text) && Math.random()<0.4) gain += 15+Math.floor(Math.random()*10);
  else if(/습격|약탈했|약탈하|털었다|덮쳤다/.test(text) && Math.random()<0.45) gain += 7+Math.floor(Math.random()*5);
  else if(/강탈|빼앗았|뜯어냈|삥뜯|갈취/.test(text) && Math.random()<0.45) gain += 3+Math.floor(Math.random()*3);
  else if(/밀수|밀매|뒷거래|불법.*거래/.test(text) && Math.random()<0.4) gain += 3+Math.floor(Math.random()*3);
  else if(/협박했|위협했|겁박했/.test(text) && Math.random()<0.35) gain += 1+Math.floor(Math.random()*2);
  if(gain>0){
    const cur = loadMercNotoriety();
    const next = cur + gain;
    saveMercNotoriety(next);
    const tier = getMercNotorietyTier(next);
    toast(`🕶️ 악명 +${gain}${tier?` — "${tier.label}"`:''}`, 2200);
  }
}
window.detectMercNotorietyFromText = detectMercNotorietyFromText;

window.detectMercNotorietyFromText = detectMercNotorietyFromText;

export const MERC_DEPLOY_KEY = 'tf-mercdeploy';

export function convertMercToCriminal(){
  const band = loadMercBand();
  if(!band.members.length){ toast('먼저 용병을 고용하세요.'); return; }
  if(!band.established){ toast('아직 정식 용병단이 아닙니다. 7명이 모이면 전향이 가능해집니다.'); return; }
  if(band.alignment==='criminal'){ toast('이미 범죄 조직으로 전향했습니다.'); return; }
  const notoriety = (typeof loadMercNotoriety==='function') ? loadMercNotoriety() : 0;
  const req = (typeof getCrimeConversionReq==='function') ? getCrimeConversionReq() : 5;
  if(notoriety < req){ toast(`아직 부하들이 범죄를 받아들일 만큼 물이 들지 않았습니다. (악명 ${req} 이상 필요, 현재 ${notoriety})`, 3500); return; }
  band.alignment = 'criminal';
  saveMercBand(band);
  // 진행 중이던 정규 게시판은 정리 (성향에 안 맞는 의뢰가 남아있지 않도록)
  saveMercJobBoard({jobs:[], lastRefreshTurn:0});
  const lord = getMercCrimeLord();
  toast(`🏴 용병단이 범죄 조직으로 전향했습니다. 이제 ${lord.faction}의 그늘 아래에서 활동합니다.`, 4500);
  S._pendingContractHint = `${band.members.map(m=>m.name).join(', ')}이 이끄는 부대가 정식으로 범죄의 길에 들어섰다. 더 이상 정직한 의뢰를 받지 않고, 뒷골목과 범죄 조직의 일감을 받기 시작했다.`;
  renderContractsPanel();
}
window.convertMercToCriminal = convertMercToCriminal;

window.convertMercToCriminal = convertMercToCriminal;

export function revertMercToLawful(){
  const band = loadMercBand();
  if(band.alignment!=='criminal'){ toast('이미 정규 노선입니다.'); return; }
  band.alignment = 'lawful';
  saveMercBand(band);
  saveMercJobBoard({jobs:[], lastRefreshTurn:0});
  toast('⚖️ 용병단이 다시 정규 노선으로 돌아왔습니다.', 3500);
  S._pendingContractHint = `${band.members.map(m=>m.name).join(', ')}이 범죄에서 손을 떼고 다시 정직한 용병 일을 시작했다.`;
  renderContractsPanel();
}
window.revertMercToLawful = revertMercToLawful;

window.revertMercToLawful = revertMercToLawful;

export function getCrimeConversionReq(){ return 5; }
window.getCrimeConversionReq = getCrimeConversionReq;

export function getCrimeLordChallengeReq(){
  return { notoriety:80, members:6 };
}
window.getCrimeLordChallengeReq = getCrimeLordChallengeReq;

export function canChallengeCrimeLord(){
  const band = loadMercBand();
  if(band.alignment!=='criminal') return false;
  const req = getCrimeLordChallengeReq();
  const notoriety = loadMercNotoriety();
  const resident = (typeof getResidentMembers==='function') ? getResidentMembers(band) : band.members;
  return notoriety>=req.notoriety && resident.length>=req.members;
}
window.canChallengeCrimeLord = canChallengeCrimeLord;

window.canChallengeCrimeLord = canChallengeCrimeLord;

export function challengeCrimeLord(){
  if(!canChallengeCrimeLord()){ toast('아직 도전할 자격이 되지 않습니다.'); return; }
  const band = loadMercBand();
  const resident = getResidentMembers(band);
  const lord = getMercCrimeLord();
  const notoriety = loadMercNotoriety();

  const avgLevel = resident.reduce((s,m)=>s+(m.level||1),0)/resident.length;
  const sizeBonus = Math.min(0.25, resident.length*0.02);
  const levelBonus = Math.min(0.3, avgLevel*0.02);
  const notorietyBonus = Math.min(0.2, notoriety/500);
  const successRate = Math.max(0.15, Math.min(0.85, 0.25 + sizeBonus + levelBonus + notorietyBonus));

  const success = Math.random() < successRate;
  if(success){
    const orgCtrl = loadOrgControl();
    if(!orgCtrl.includes(lord.faction)) { orgCtrl.push(lord.faction); saveOrgControl(orgCtrl); }
    if(typeof updateFactionRep==='function') updateFactionRep(lord.faction, 80); // 사실상 장악
    S._mercDomainTitle = lord.domainTitle;
    toast(`👑 ${lord.leaderName}(${lord.leaderTitle})을 쓰러뜨리고 ${lord.faction}을 장악했습니다! 이제 "${lord.domainTitle}"입니다.`, 6000);
    S._pendingContractHint = `${band.members.map(m=>m.name).join(', ')}이 이끄는 부대가 ${lord.leaderName}과의 결전에서 승리해 ${lord.faction}을 완전히 장악했다. 주인공은 이제 "${lord.domainTitle}"로 불린다. 이 사건은 대륙 전역에 소식으로 퍼져나가야 한다.`;
  } else {
    // 패배 — 부대원 일부 이탈/부상, 악명 대폭 하락(위신 실추)
    const lostCount = Math.min(resident.length-1, 1+Math.floor(Math.random()*2));
    const lost = resident.slice(0, lostCount);
    band.members = band.members.filter(m=>!lost.some(l=>l.id===m.id));
    if(typeof updateMercCaptain==='function') updateMercCaptain(band);
    saveMercBand(band);
    saveMercNotoriety(Math.max(0, notoriety - 30));
    toast(`💀 ${lord.leaderName}에게 패배했습니다. ${lost.map(m=>m.name).join(', ')}을 잃고 물러났습니다.`, 5500);
    S._pendingContractHint = `${lord.leaderName}과의 결전에서 참패했다. ${lost.map(m=>m.name).join(', ')}을 잃고 굴욕적으로 후퇴했다. 소문이 퍼지며 위신이 크게 실추됐다.`;
  }
  renderContractsPanel();
}
window.challengeCrimeLord = challengeCrimeLord;

window.challengeCrimeLord = challengeCrimeLord;

export function loadMercDeployments(){ try{ return JSON.parse(lsGet(MERC_DEPLOY_KEY)||'[]'); }catch(e){ return []; } }
window.loadMercDeployments = loadMercDeployments;

export function saveMercDeployments(d){ try{ lsSet(MERC_DEPLOY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveMercDeployments = saveMercDeployments;

export function getDeployedMemberIds(){
  const deps = loadMercDeployments();
  const ids = new Set();
  deps.forEach(d=>d.memberIds.forEach(id=>ids.add(id)));
  // 배치(garrison) 중인 용병도 파견과 마찬가지로 부대에 없는 것으로 취급
  const garrisons = (typeof loadMercGarrisons==='function') ? loadMercGarrisons() : [];
  garrisons.forEach(g=>ids.add(g.memberId));
  return ids;
}
window.getDeployedMemberIds = getDeployedMemberIds;

export function getResidentMembers(band){
  const deployed = getDeployedMemberIds();
  return band.members.filter(m=>!deployed.has(m.id));
}
window.getResidentMembers = getResidentMembers;

export const MERC_GARRISON_KEY = 'tf-mercgarrison';

export function loadMercGarrisons(){ try{ return JSON.parse(lsGet(MERC_GARRISON_KEY)||'[]'); }catch(e){ return []; } }
window.loadMercGarrisons = loadMercGarrisons;

export function saveMercGarrisons(d){ try{ lsSet(MERC_GARRISON_KEY, JSON.stringify(d)); }catch(e){} }
window.saveMercGarrisons = saveMercGarrisons;

export function garrisonMerc(memberId, siteType, siteId, siteLabel){
  const band = loadMercBand();
  if(!band.established){ toast('아직 정식 용병단이 아닙니다. 7명이 모이면 배치가 가능해집니다.'); return false; }
  const member = band.members.find(m=>m.id===memberId);
  if(!member){ toast('해당 용병을 찾을 수 없습니다.'); return false; }
  const already = getDeployedMemberIds();
  if(already.has(memberId)){ toast('이미 파견 또는 배치 중인 용병입니다.'); return false; }
  const garrisons = loadMercGarrisons();
  if(garrisons.some(g=>g.siteType===siteType && g.siteId===siteId)){
    toast('이 장소에는 이미 배치된 용병이 있습니다.'); return false;
  }
  garrisons.push({ id:'gar_'+Date.now(), memberId, siteType, siteId, siteLabel:siteLabel||siteId, since:S.msgCount||0 });
  saveMercGarrisons(garrisons);
  toast(`🛡️ ${member.name}이(가) ${siteLabel||siteId}에 배치되었습니다.`, 3500);
  return true;
}
window.garrisonMerc = garrisonMerc;

window.garrisonMerc = garrisonMerc;

export function ungarrisonMerc(siteType, siteId){
  const garrisons = loadMercGarrisons();
  const g = garrisons.find(x=>x.siteType===siteType && x.siteId===siteId);
  if(!g){ toast('배치된 용병이 없습니다.'); return; }
  const band = loadMercBand();
  const member = band.members.find(m=>m.id===g.memberId);
  saveMercGarrisons(garrisons.filter(x=>x.id!==g.id));
  toast(`${member?member.name:'용병'}이(가) 배치 해제되어 복귀했습니다.`, 3000);
}
window.ungarrisonMerc = ungarrisonMerc;

window.ungarrisonMerc = ungarrisonMerc;

export function getGarrisonDefense(siteType, siteId){
  const garrisons = loadMercGarrisons();
  const g = garrisons.find(x=>x.siteType===siteType && x.siteId===siteId);
  if(!g) return 0;
  const band = loadMercBand();
  const member = band.members.find(m=>m.id===g.memberId);
  if(!member) return 0;
  const power = (typeof getMercMemberPower==='function') ? getMercMemberPower(member, 1) : {amount:0};
  const hqEff = (typeof getMercHqEffects==='function') ? getMercHqEffects(band) : {garrisonDefBonus:0};
  // 방어 성공률 — 용병 전투력에 비례 + 초소 보너스, 상한 90%
  return Math.min(0.90, 0.25 + power.amount*0.03 + hqEff.garrisonDefBonus);
}
window.getGarrisonDefense = getGarrisonDefense;

window.getGarrisonDefense = getGarrisonDefense;

export function updateMercCaptain(band){
  if(!band.members.length){ band.captainId=null; return; }
  const best = [...band.members].sort((a,b)=>(b.level||1)-(a.level||1))[0];
  band.captainId = best.id;
}
window.updateMercCaptain = updateMercCaptain;

export function checkMercBandEstablished(band){
  if(band.established) return; // 이미 출범했으면 다시 처리하지 않음
  if(band.members.length < 7) return;
  band.established = true;
  band.establishedAt = S.msgCount||0;
  // 거점 부지 생성 — 현재 위치를 본거지로 삼는다
  const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  band.hqLocation = loc ? loc.name : '정처 없는 야영지';
  band.hqBuildings = {}; // 건물 시스템 — { barracks:{level:1,builtAt:N}, ... }
  setTimeout(()=>{
    toast(`🏕️ 용병단이 정식으로 결성되었습니다! ${band.hqLocation}에 거점을 마련했습니다.`, 5500);
  }, 300);
  S._pendingContractHint = `그동안 하나둘 모아온 인원이 어느새 ${band.members.length}명에 달해, 정식으로 용병단이 결성되었다. ${band.hqLocation}에 거점을 마련하고 이제 명실상부한 조직으로 활동을 시작한다.`;
}
window.checkMercBandEstablished = checkMercBandEstablished;

export const MERC_HQ_BUILDING_KEYS = Object.keys(MERC_HQ_BUILDINGS);

export function getMercHqEffects(band){
  const totals = { upkeepDiscount:0, xpBonus:0, gearDiscount:0, walkInBonus:0, garrisonDefBonus:0 };
  const buildings = band.hqBuildings||{};
  Object.entries(buildings).forEach(([bid, b])=>{
    const def = MERC_HQ_BUILDINGS[bid];
    if(!def) return;
    const eff = def.effect(b.level||1);
    Object.entries(eff).forEach(([k,v])=>{ if(totals[k]!==undefined) totals[k]+=v; });
  });
  // 상한 — 유지비/장비할인은 60%, 경험치/지원확률/방어는 100%까지만
  totals.upkeepDiscount = Math.min(0.6, totals.upkeepDiscount);
  totals.gearDiscount = Math.min(0.6, totals.gearDiscount);
  return totals;
}
window.getMercHqEffects = getMercHqEffects;

window.getMercHqEffects = getMercHqEffects;

export function buildMercHq(bid){
  const band = loadMercBand();
  if(!band.established){ toast('아직 정식 용병단이 아닙니다. 7명이 모이면 거점을 지을 수 있습니다.'); return; }
  const def = MERC_HQ_BUILDINGS[bid];
  if(!def){ toast('알 수 없는 건물'); return; }
  band.hqBuildings = band.hqBuildings || {};
  const existing = band.hqBuildings[bid];
  const level = existing ? existing.level : 0;
  if(level >= def.maxLevel){ toast(`${def.name}은 이미 최대 레벨입니다.`); return; }
  const cost = def.baseCost * (level+1);
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  band.hqBuildings[bid] = { level: level+1, builtAt: S.msgCount||0 };
  saveMercBand(band);
  toast(`${def.name} Lv.${level+1} 건설 완료! (-${cost}G)`, 3500, def);
  S._pendingContractHint = `용병단 거점에 ${def.name}이(가) 새로 지어졌다(Lv.${level+1}). ${def.desc}`;
  renderContractsPanel();
}
window.buildMercHq = buildMercHq;

window.buildMercHq = buildMercHq;

export function demolishMercHq(bid){
  const band = loadMercBand();
  const def = MERC_HQ_BUILDINGS[bid];
  if(!def){ toast('알 수 없는 건물'); return; }
  const existing = (band.hqBuildings||{})[bid];
  if(!existing){ toast('건설된 건물이 아닙니다.'); return; }
  const totalCost = def.baseCost * (existing.level*(existing.level+1)/2);
  const refund = Math.floor(totalCost*0.5);
  S.gold = (S.gold||0) + refund; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  delete band.hqBuildings[bid];
  saveMercBand(band);
  toast(`🔨 ${def.name} 철거 (+${refund}G 환불)`, 3000);
  renderContractsPanel();
}
window.demolishMercHq = demolishMercHq;

window.demolishMercHq = demolishMercHq;

export function deployMercSquad(missionKey, memberIds){
  const mission = findMercMissionDef(missionKey);
  if(!mission){ toast('알 수 없는 임무'); return; }
  const band = loadMercBand();
  if(!band.established){ toast('아직 정식 용병단이 아닙니다. 7명이 모이면 파견이 가능해집니다.'); return; }
  const already = getDeployedMemberIds();
  const validIds = memberIds.filter(id=>band.members.some(m=>m.id===id) && !already.has(id));
  if(validIds.length < mission.minMembers){
    toast(`⚠️ 이 임무는 최소 ${mission.minMembers}명이 필요합니다.`, 3000); return;
  }
  const deps = loadMercDeployments();
  deps.push({
    id:'dep_'+Date.now(), missionKey, memberIds:validIds,
    startedAt:S.msgCount||0, daysLeft:mission.days, totalDays:mission.days,
  });
  saveMercDeployments(deps);
  const names = band.members.filter(m=>validIds.includes(m.id)).map(m=>m.name).join(', ');
  toast(`${names} — ${mission.label} 출발! (${mission.days}일 소요)`, 3500, mission);
  renderContractsPanel();
}
window.deployMercSquad = deployMercSquad;

window.deployMercSquad = deployMercSquad;

export function deploySelectedMerc(missionKey){
  const checked = Array.from(document.querySelectorAll('.merc-deploy-chk:checked'));
  const ids = checked.map(el=>el.getAttribute('data-mid'));
  if(!ids.length){ toast('파견할 용병을 먼저 선택하세요.', 2500); return; }
  deployMercSquad(missionKey, ids);
}
window.deploySelectedMerc = deploySelectedMerc;

window.deploySelectedMerc = deploySelectedMerc;

export const MERC_JOB_BOARD_KEY = 'tf-mercjobs';

export function loadMercJobBoard(){ try{ return JSON.parse(lsGet(MERC_JOB_BOARD_KEY)||'null')||{jobs:[],lastRefreshTurn:0}; }catch(e){ return {jobs:[],lastRefreshTurn:0}; } }
window.loadMercJobBoard = loadMercJobBoard;

export function saveMercJobBoard(d){ try{ lsSet(MERC_JOB_BOARD_KEY, JSON.stringify(d)); }catch(e){} }
window.saveMercJobBoard = saveMercJobBoard;

export const MERC_CONTACT_CHAIN_KEY = 'tf-merccontact';

export function loadMercContactChain(){ try{ return JSON.parse(lsGet(MERC_CONTACT_CHAIN_KEY)||'null')||{stage:0}; }catch(e){ return {stage:0}; } }
window.loadMercContactChain = loadMercContactChain;

export function saveMercContactChain(d){ try{ lsSet(MERC_CONTACT_CHAIN_KEY, JSON.stringify(d)); }catch(e){} }
window.saveMercContactChain = saveMercContactChain;

export function getMercContactStageDef(stageNum){ return MERC_CONTACT_STAGES.find(s=>s.stage===stageNum) || null; }
window.getMercContactStageDef = getMercContactStageDef;

export function refreshMercJobBoard(){
  const board = loadMercJobBoard();
  const turnsSince = (S.msgCount||0) - (board.lastRefreshTurn||0);
  if(turnsSince < 5 && board.jobs.length>0) return; // 너무 자주 갱신되지 않도록
  const band = loadMercBand();
  const influenceCount = band.members.length;
  const slots = Math.min(4, 2 + Math.floor(influenceCount/4)); // 용병단이 클수록 의뢰도 많이 들어옴
  const isCriminal = band.alignment==='criminal';
  const missionKeys = isCriminal ? MERC_CRIME_MISSION_KEYS : MERC_MISSION_KEYS;
  const missions = isCriminal ? MERC_CRIME_MISSIONS : MERC_MISSIONS;
  const clients = isCriminal ? MERC_CRIME_JOB_CLIENTS : MERC_JOB_CLIENTS;

  const jobs = [];
  for(let i=0;i<slots;i++){
    const missionKey = missionKeys[Math.floor(Math.random()*missionKeys.length)];
    const mission = missions[missionKey];
    const client = clients[Math.floor(Math.random()*clients.length)];
    // 보수는 기본 임무 보수에 약간의 변동(±20%)을 줘서 매번 똑같지 않게
    const payMult = 0.8 + Math.random()*0.4;
    jobs.push({
      id:'job_'+Date.now()+'_'+i,
      missionKey, clientLabel:client.label, reason:client.reason,
      payMult:Math.round(payMult*100)/100,
      postedAt:S.msgCount||0,
      expiresAt:(S.msgCount||0) + 15, // 15턴 내 수락 안 하면 사라짐
      alignment:isCriminal?'criminal':'lawful',
    });
  }

  // [악명 진입로 1] "수상한 접촉" 체인 — 현재 진행 단계(chain.stage)의
  // 바로 다음 단계만 게시판에 노출한다. 이미 전향했어도(criminal) 체인은
  // 계속 진행될 수 있다 — 조직이 주인공을 시험하고 정식으로 받아들이는
  // 과정은 전향 여부와 별개의 서사이기 때문이다.
  const chain = (typeof loadMercContactChain==='function') ? loadMercContactChain() : {stage:0};
  const nextStageDef = (typeof getMercContactStageDef==='function') ? getMercContactStageDef((chain.stage||0)+1) : null;
  if(nextStageDef && band.members.length>0 && Math.random()<nextStageDef.chance){
    jobs.push({
      id:'job_contact_'+Date.now(),
      isContact:true, contactStage:nextStageDef.stage,
      clientLabel:nextStageDef.clientLabel,
      reason:nextStageDef.reason,
      notorietyGain:nextStageDef.notorietyGain,
      postedAt:S.msgCount||0,
      expiresAt:(S.msgCount||0) + 10,
      alignment:'contact',
    });
  }

  board.jobs = jobs;
  board.lastRefreshTurn = S.msgCount||0;
  saveMercJobBoard(board);
}
window.refreshMercJobBoard = refreshMercJobBoard;

export function tickMercJobBoard(){
  const board = loadMercJobBoard();
  const before = board.jobs.length;
  board.jobs = board.jobs.filter(j=>j.expiresAt > (S.msgCount||0));
  if(board.jobs.length !== before) saveMercJobBoard(board);
  refreshMercJobBoard();
}
window.tickMercJobBoard = tickMercJobBoard;

export function acceptMercJob(jobId, memberIds){
  const board = loadMercJobBoard();
  const job = board.jobs.find(j=>j.id===jobId);
  if(!job){ toast('이미 사라진 의뢰입니다.'); return; }
  if(job.isContact){ toast('이 제안은 "받아들이기" 버튼으로 응답하세요.'); return; }
  const mission = findMercMissionDef(job.missionKey);
  const band = loadMercBand();
  if(!band.established){ toast('아직 정식 용병단이 아닙니다. 7명이 모이면 의뢰 수행이 가능해집니다.'); return; }
  const already = getDeployedMemberIds();
  const validIds = memberIds.filter(id=>band.members.some(m=>m.id===id) && !already.has(id));
  if(validIds.length < mission.minMembers){
    toast(`⚠️ 이 의뢰는 최소 ${mission.minMembers}명이 필요합니다.`, 3000); return;
  }
  const deps = loadMercDeployments();
  deps.push({
    id:'dep_'+Date.now(), missionKey:job.missionKey, memberIds:validIds,
    startedAt:S.msgCount||0, daysLeft:mission.days, totalDays:mission.days,
    jobId:job.id, payMult:job.payMult, clientLabel:job.clientLabel,
  });
  saveMercDeployments(deps);
  board.jobs = board.jobs.filter(j=>j.id!==jobId);
  saveMercJobBoard(board);
  const names = band.members.filter(m=>validIds.includes(m.id)).map(m=>m.name).join(', ');
  toast(`📜 ${job.clientLabel}의 의뢰 수락! ${names} 출발 (${mission.days}일 소요)`, 3500);
  renderContractsPanel();
}
window.acceptMercJob = acceptMercJob;

window.acceptMercJob = acceptMercJob;

export function acceptMercContact(jobId){
  const board = loadMercJobBoard();
  const job = board.jobs.find(j=>j.id===jobId);
  if(!job || !job.isContact){ toast('이미 사라진 제안입니다.'); return; }
  const stageDef = (typeof getMercContactStageDef==='function') ? getMercContactStageDef(job.contactStage||1) : null;
  board.jobs = board.jobs.filter(j=>j.id!==jobId);
  saveMercJobBoard(board);

  const chain = (typeof loadMercContactChain==='function') ? loadMercContactChain() : {stage:0};
  const cur = (typeof loadMercNotoriety==='function') ? loadMercNotoriety() : 0;

  // 3단계(정식 초대)는 실패 없이, 수락하는 순간 자동 전향까지 이어진다
  if((job.contactStage||1) === 3){
    const next = cur + (job.notorietyGain||10);
    saveMercNotoriety(next);
    chain.stage = 3;
    saveMercContactChain(chain);
    const band = loadMercBand();
    if(band.members.length>0 && band.alignment!=='criminal'){
      band.alignment = 'criminal';
      saveMercBand(band);
      saveMercJobBoard({jobs:[], lastRefreshTurn:0});
    }
    const lord = (typeof getMercCrimeLord==='function') ? getMercCrimeLord() : null;
    toast(`🏴 정식으로 조직에 받아들여졌습니다. 이제 ${lord?.faction||'그림자 조직'}의 일원입니다.`, 5000);
    S._pendingContractHint = `주인공이 그림자 조직의 정식 초대를 받아들였다. 접선책이 앞으로의 연락 방법을 알려주며, 이제 조직의 정식 일원으로 대우받는다. 이 사실은 은밀하지만 확실하게 퍼져나가야 한다.`;
    renderContractsPanel();
    return;
  }

  // 2단계(시험)는 실패 확률이 있다
  if(stageDef && stageDef.riskOfFail && Math.random() < stageDef.riskOfFail){
    toast(`⚠️ 시험에 실패했습니다. 조직이 실망했지만 기회는 남아있습니다.`, 4000);
    S._pendingContractHint = stageDef.onFail || '시험에 실패했지만 조직과의 연결이 완전히 끊기지는 않았다.';
    renderContractsPanel();
    return;
  }

  // 통과 — 악명 획득 + 다음 단계로 진행
  const gain = job.notorietyGain || (stageDef?.notorietyGain) || 3;
  const next = cur + gain;
  saveMercNotoriety(next);
  chain.stage = job.contactStage || 1;
  saveMercContactChain(chain);
  toast(`🕶️ 제안을 받아들였습니다. 악명 +${gain} (현재 ${next})`, 3500);
  S._pendingContractHint = (stageDef && stageDef.onAccept) || `주인공이 그림자 속 인물의 제안을 받아들였다.`;
  renderContractsPanel();
}
window.acceptMercContact = acceptMercContact;

window.acceptMercContact = acceptMercContact;

export function declineMercContact(jobId){
  const board = loadMercJobBoard();
  board.jobs = board.jobs.filter(j=>j.id!==jobId);
  saveMercJobBoard(board);
  toast('제안을 거절했습니다.', 2000);
  renderContractsPanel();
}
window.declineMercContact = declineMercContact;

window.declineMercContact = declineMercContact;

export function acceptSelectedMercJob(jobId){
  const checked = Array.from(document.querySelectorAll('.merc-deploy-chk:checked'));
  const ids = checked.map(el=>el.getAttribute('data-mid'));
  if(!ids.length){ toast('보낼 용병을 먼저 선택하세요.', 2500); return; }
  acceptMercJob(jobId, ids);
}
window.acceptSelectedMercJob = acceptSelectedMercJob;

window.acceptSelectedMercJob = acceptSelectedMercJob;

export function tickMercDeployments(){
  const deps = loadMercDeployments();
  if(!deps.length) return;
  const band = loadMercBand();
  let changed = false;
  const remaining = [];
  deps.forEach(dep=>{
    dep.daysLeft -= 1;
    if(dep.daysLeft > 0){ remaining.push(dep); return; }
    // 임무 완료 처리
    changed = true;
    const mission = findMercMissionDef(dep.missionKey);
    const squad = band.members.filter(m=>dep.memberIds.includes(m.id));
    if(!squad.length) return; // 이미 이탈한 인원뿐이면 조용히 소멸

    const avgLevel = squad.reduce((s,m)=>s+(m.level||1),0)/squad.length;
    const riskMod = Math.max(0.02, mission.riskBase - avgLevel*0.015); // 레벨 높을수록 안전
    const payMult = dep.payMult || 1;
    const goldReward = Math.round(mission.goldPerDay * mission.totalDays * squad.length * (0.8+Math.random()*0.4) * payMult);
    const xpReward = Math.round(mission.xpPerDay * mission.totalDays);
    const clientTag = dep.clientLabel ? `${dep.clientLabel}의 의뢰로 나갔던 ` : '';

    let casualty = null;
    squad.forEach(m=>{
      const trait = MERC_TRAITS[m.trait]||{};
      const personalRisk = riskMod * (trait.bonusMult && trait.loyaltyDecayMult>1 ? 1.3 : 1); // 만용 특성은 위험 가중
      if(Math.random() < personalRisk){
        casualty = m;
      }
    });

    if(casualty){
      // 부상(80%) 또는 전사(20%) — 전사 시 부대에서 완전히 제외
      if(Math.random() < 0.8){
        casualty.loyalty = Math.max(0, casualty.loyalty - 10);
        S._pendingContractHint = `${mission.icon} ${clientTag}${mission.label}을 마친 ${casualty.name}이 부상을 입고 돌아왔다. (충성도 소폭 하락)`;
        toast(`🩹 ${casualty.name}이 ${mission.label} 중 부상을 입었다.`, 3500);
      } else {
        band.members = band.members.filter(x=>x.id!==casualty.id);
        S._pendingContractHint = `${mission.icon} ${clientTag}${mission.label}을 나갔던 ${casualty.name}이 돌아오지 못했다. 전사 소식이 부대에 전해졌다.`;
        toast(`💀 ${casualty.name}이 ${mission.label} 중 전사했다...`, 4500);
        updateMercCaptain(band);
      }
    } else {
      S.gold = (S.gold||0) + goldReward;
      if(typeof saveGold==='function') saveGold(S.gold);
      window.updateHeader&&window.updateHeader();
      squad.forEach(m=>{
        m.xp = (m.xp||0) + Math.round(xpReward * ((MERC_TRAITS[m.trait]||{}).xpMult||1));
        let need = mercXpToNext(m.level||1);
        while(m.xp >= need){ m.xp -= need; m.level=(m.level||1)+1; need = mercXpToNext(m.level); }
      });
      let extraHint = '';
      // 범죄 임무였다면 악명 축적 + 세력 적대도 반영 (카르마와는 무관)
      if(mission.notorietyGain){
        const cur = (typeof loadMercNotoriety==='function') ? loadMercNotoriety() : 0;
        const next = cur + mission.notorietyGain;
        if(typeof saveMercNotoriety==='function') saveMercNotoriety(next);
        const crimeLord = (typeof getMercCrimeLord==='function') ? getMercCrimeLord() : null;
        if(crimeLord && typeof updateFactionRep==='function' && crimeLord.lawFaction){
          // 치안을 담당하는 정규 세력과의 관계가 나빠진다
          updateFactionRep(crimeLord.lawFaction, -2);
        }
        const tier = (typeof getMercNotorietyTier==='function') ? getMercNotorietyTier(next) : null;
        if(tier) extraHint = ` 악명이 쌓여 이제 "${tier.label}"(으)로 불린다.`;
      }
      S._pendingContractHint = `${mission.icon} ${clientTag}${squad.map(m=>m.name).join(', ')}이 ${mission.label}을 무사히 마치고 골드 ${goldReward}G를 벌어왔다.${extraHint}`;
      toast(`✅ ${clientTag}${mission.label} 완료! ${squad.map(m=>m.name).join(', ')} 귀환, 골드 +${goldReward}G${extraHint?' · 악명 상승':''}`, 4000);
    }
  });
  if(changed){ saveMercDeployments(remaining); saveMercBand(band); }
  else if(remaining.length !== deps.length){ saveMercDeployments(remaining); }
}
window.tickMercDeployments = tickMercDeployments;

export function getMercGearTier(band){ return MERC_GEAR_TIERS[Math.min(band.gearTier||0, MERC_GEAR_TIERS.length-1)]; }
window.getMercGearTier = getMercGearTier;

export function upgradeMercGear(){
  const band = loadMercBand();
  if(!band.members.length){ toast('용병단이 없습니다.'); return; }
  if(!band.established){ toast('아직 정식 용병단이 아닙니다. 7명이 모이면 장비 보급이 가능해집니다.'); return; }
  const cur = band.gearTier||0;
  if(cur >= MERC_GEAR_TIERS.length-1){ toast('이미 최고 등급 장비입니다.'); return; }
  const next = MERC_GEAR_TIERS[cur+1];
  const hqEff = (typeof getMercHqEffects==='function') ? getMercHqEffects(band) : {gearDiscount:0};
  const actualCost = Math.round(next.upgradeCost * (1-hqEff.gearDiscount));
  if((S.gold||0) < actualCost){ toast(`골드 부족 (${actualCost}G 필요)`); return; }
  S.gold -= actualCost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  band.gearTier = cur+1;
  // 유지비도 등급만큼 소폭 상승 (더 좋은 장비는 관리비도 든다)
  band.members.forEach(m=>{ m.upkeep = (m.upkeep||8) + (next.upkeepAdd - (MERC_GEAR_TIERS[cur].upkeepAdd||0)); });
  saveMercBand(band);
  toast(`⚒️ 용병단 장비를 ${next.label}(으)로 업그레이드했습니다! (-${actualCost}G)`, 3500);
  renderContractsPanel();
}
window.upgradeMercGear = upgradeMercGear;

window.upgradeMercGear = upgradeMercGear;

export function getMercBandInfluenceTier(count){
  if(count>=10) return { label:'하나의 군세', desc:'왕국이 주목할 규모의 무력 집단으로 성장했다.' };
  if(count>=6)  return { label:'이름난 용병단', desc:'지역에서 이름이 알려진 용병단으로 인정받는다.' };
  if(count>=3)  return { label:'소규모 부대', desc:'제법 갖춰진 소규모 무력 집단이다.' };
  if(count>=1)  return { label:'개인 호위', desc:'혼자보다는 든든한 소수의 동행이다.' };
  return null;
}
window.getMercBandInfluenceTier = getMercBandInfluenceTier;

export function getMercCaptainBonus(band){
  if(!band.captainId) return { loyaltyDecayReduce:0, label:null };
  const captain = band.members.find(m=>m.id===band.captainId);
  if(!captain) return { loyaltyDecayReduce:0, label:null };
  return { loyaltyDecayReduce:0.2, label:captain.name, level:captain.level||1 };
}
window.getMercCaptainBonus = getMercCaptainBonus;

export function getContractSection(){
  const band = loadMercBand();
  const orgCtrl = loadOrgControl();
  const pendingHint = S._pendingContractHint;
  let lines=[];
  if(band.members.length>0){
    const resident = (typeof getResidentMembers==='function') ? getResidentMembers(band) : band.members;
    const avgLoy = resident.length ? Math.round(resident.reduce((s,m)=>s+m.loyalty,0)/resident.length) : 0;
    const roster = resident.map(m=>{
      const arch = MERC_ARCHETYPES[m.archetype]||MERC_ARCHETYPES.vanguard;
      const trait = MERC_TRAITS[m.trait]||{};
      const rarity = MERC_RARITY[m.rarity]||MERC_RARITY.common;
      const captainTag = (band.captainId===m.id) ? '★대장 ' : '';
      const evoTag = m.evoCount ? ` [${MERC_EVO_STAGE_NAMES[m.evoCount-1]||m.evoCount+'차'} 각성]` : '';
      return `${captainTag}${m.name}(${rarity.label} ${arch.label} Lv.${m.level||1}, ${trait.label||''})${evoTag}`;
    }).join(', ');
    const influence = (typeof getMercBandInfluenceTier==='function') ? getMercBandInfluenceTier(band.members.length) : null;
    const gear = (typeof getMercGearTier==='function') ? getMercGearTier(band) : null;
    const isCriminal = band.alignment==='criminal';
    let line;
    if(!band.established){
      line = `[🚶 고용한 인원] 주인공이 개인적으로 고용한 인원 ${band.members.length}명 — 아직 정식 용병단은 아니다(7명 이상 모여야 정식 결성). ${roster||'전원 파견 중'} (평균 충성도 ${avgLoy}). 조직으로서의 위세나 이름은 아직 없고, 개인적으로 데리고 다니는 일꾼 정도로 취급하라.`;
    } else {
    line = `[${isCriminal?'🏴 범죄 조직':'⚔️ 용병단'}] 주인공이 거느린 ${isCriminal?'범죄 조직':'용병단'} ${band.members.length}명, 거점은 ${band.hqLocation||'미상'}`;
    if(influence) line += ` — ${influence.label}(${influence.desc})`;
    line += `. 현재 곁에 있는 인원: ${roster||'전원 파견 중'} (평균 충성도 ${avgLoy})`;
    if(gear && gear.tier>0) line += `, 장비 수준: ${gear.label}`;
    const hqBuildingNames = Object.entries(band.hqBuildings||{}).map(([bid,b])=>{
      const def = (typeof MERC_HQ_BUILDINGS!=='undefined') ? MERC_HQ_BUILDINGS[bid] : null;
      return def ? `${def.name} Lv.${b.level}` : null;
    }).filter(Boolean);
    if(hqBuildingNames.length) line += `, 거점 건물: ${hqBuildingNames.join(', ')}`;
    if(isCriminal){
      const notoriety = (typeof loadMercNotoriety==='function') ? loadMercNotoriety() : 0;
      const tier = (typeof getMercNotorietyTier==='function') ? getMercNotorietyTier(notoriety) : null;
      const lord = (typeof getMercCrimeLord==='function') ? getMercCrimeLord() : null;
      line += `. 정규 용병이 아니라 범죄 조직으로 전향한 상태이며, 악명 ${notoriety}${tier?`("${tier.label}")`:''}`;
      if(lord) line += `. 이 세계의 범죄 대부는 ${lord.leaderName}(${lord.leaderTitle}, ${lord.faction})이다`;
      if(S._mercDomainTitle) line += `. 주인공은 이미 이 세력을 장악해 "${S._mercDomainTitle}"로 불린다 — NPC들이 이 칭호를 알아보고 두려워하거나 경외해야 한다`;
      line += '. 전투 시 동행하며, 범죄 조직다운 거칠고 위협적인 언행으로 묘사하라.';
    } else {
      line += '. 전투 시 동행하며, 각자의 직군·개성·계급(대장 여부)에 맞게 묘사하라.';
    }
    }
    // 이미 각성한 용병의 고유 스킬/외형은 서사에서 계속 일관되게 반영해야 한다
    const evolved = resident.filter(m=>m.evoCount>0);
    if(evolved.length){
      line += ' 각성한 용병의 특징: ' + evolved.map(m=>`${m.name}(${m.evoDesc||''}${m.evoSkill?' · 스킬:'+m.evoSkill:''})`).join(' / ') + '.';
    }
    lines.push(line);
  }
  const deps = (typeof loadMercDeployments==='function') ? loadMercDeployments() : [];
  if(deps.length>0){
    const depNames = band.members.filter(m=>deps.some(d=>d.memberIds.includes(m.id))).map(m=>m.name);
    lines.push(`[🗺️ 파견 중인 용병] ${depNames.join(', ')}은(는) 현재 임무로 자리를 비웠다. 주인공 곁에 없는 것으로 취급하라.`);
  }
  const garrisons = (typeof loadMercGarrisons==='function') ? loadMercGarrisons() : [];
  if(garrisons.length>0){
    const garrisonDesc = garrisons.map(g=>{
      const gm = band.members.find(m=>m.id===g.memberId);
      return gm ? `${gm.name}(${g.siteLabel} 호위 중)` : null;
    }).filter(Boolean).join(', ');
    if(garrisonDesc) lines.push(`[🛡️ 배치된 용병] ${garrisonDesc}. 이들은 해당 장소를 지키느라 주인공과 함께 다니지 않는다.`);
  }
  const jobBoard = (typeof loadMercJobBoard==='function') ? loadMercJobBoard() : {jobs:[]};
  if(jobBoard.jobs.length>0 && band.members.length>0){
    lines.push(`[📜 용병단 의뢰 게시판] 마을에 ${jobBoard.jobs.map(j=>`${j.clientLabel}(${findMercMissionDef(j.missionKey)?.label||j.missionKey})`).join(', ')} 의뢰가 붙어 있다. NPC가 이를 언급하거나, 주인공이 게시판을 보면 자연스럽게 노출하라.`);
  }
  if(orgCtrl.length>0){
    lines.push(`[👑 흡수한 조직] ${orgCtrl.map(k=>CONTRACT_ORGS[k]?.name||k).join(', ')} — 주인공의 산하 조직. NPC들은 이를 알면 두려움이나 경외를 보인다.`);
  }
  if(pendingHint){
    lines.push(`[📜 의뢰 결과 반영] ${pendingHint}`);
    S._pendingContractHint = null; // 1회 소비
  }
  return lines.length ? '\n'+lines.join('\n') : '';
}
window.getContractSection = getContractSection;

window.getContractSection = getContractSection;

export const CARAVAN_KEY = 'tf-caravan';

export const CARAVAN_ARCHETYPE_KEYS = Object.keys(CARAVAN_ARCHETYPES);

export const CARAVAN_RARITY_KEYS = Object.keys(CARAVAN_RARITY);

export function rollCaravanRarity(){
  const total = CARAVAN_RARITY_KEYS.reduce((s,k)=>s+CARAVAN_RARITY[k].weight, 0);
  let roll = Math.random()*total;
  for(const k of CARAVAN_RARITY_KEYS){ roll -= CARAVAN_RARITY[k].weight; if(roll<=0) return k; }
  return 'common';
}
window.rollCaravanRarity = rollCaravanRarity;

export function rollCaravanRarityForNpc(npc, offerGold){
  const highRanks = ['상인','기사','귀족','장인','왕족'];
  const rankBoost = (npc.rank && highRanks.some(r=>String(npc.rank).includes(r))) ? 1.8 : 1.0;
  const payBoost = 1 + Math.min(1.2, Math.max(0, (offerGold-30)/150));
  const boost = rankBoost * payBoost;
  const weights = CARAVAN_RARITY_KEYS.map(k=>{
    const isLow = (k==='common'||k==='uncommon');
    return { key:k, w: CARAVAN_RARITY[k].weight * (isLow ? Math.max(0.3, 1/boost) : boost) };
  });
  const total = weights.reduce((s,w)=>s+w.w, 0);
  let roll = Math.random()*total;
  for(const w of weights){ roll -= w.w; if(roll<=0) return w.key; }
  return 'common';
}
window.rollCaravanRarityForNpc = rollCaravanRarityForNpc;

export const CARAVAN_TRAIT_KEYS = Object.keys(CARAVAN_TRAITS);

export function caravanXpToNext(level){ return 20 + (level-1)*15; }
window.caravanXpToNext = caravanXpToNext;

export function canCaravanEvolve(m){
  const threshold = CARAVAN_EVO_THRESHOLDS[m.evoCount||0];
  if(threshold===undefined) return false;
  const rarity = CARAVAN_RARITY[m.rarity] || CARAVAN_RARITY.common;
  if((m.evoCount||0) >= rarity.maxEvo) return false;
  return (m.level||1)>=threshold;
}
window.canCaravanEvolve = canCaravanEvolve;

export function loadCaravan(){
  let d;
  try{ d = JSON.parse(lsGet(CARAVAN_KEY)||'null')||{members:[],upkeepDue:0,established:false}; }
  catch(e){ d = {members:[],upkeepDue:0,established:false}; }
  if(d.established===undefined || d.established===null){
    d.established = (d.members||[]).length >= 7;
  }
  return d;
}
window.loadCaravan = loadCaravan;

export function saveCaravan(d){ try{ lsSet(CARAVAN_KEY, JSON.stringify(d)); }catch(e){} }
window.saveCaravan = saveCaravan;

export const CARAVAN_HQ_BUILDING_KEYS = Object.keys(CARAVAN_HQ_BUILDINGS);

export function getCaravanHqEffects(band){
  const totals = { upkeepDiscount:0, xpBonus:0, gearDiscount:0, walkInBonus:0, garrisonDefBonus:0 };
  const buildings = band.hqBuildings||{};
  Object.entries(buildings).forEach(([bid, b])=>{
    const def = CARAVAN_HQ_BUILDINGS[bid];
    if(!def) return;
    const eff = def.effect(b.level||1);
    Object.entries(eff).forEach(([k,v])=>{ if(totals[k]!==undefined) totals[k]+=v; });
  });
  totals.upkeepDiscount = Math.min(0.6, totals.upkeepDiscount);
  totals.gearDiscount = Math.min(0.6, totals.gearDiscount);
  return totals;
}
window.getCaravanHqEffects = getCaravanHqEffects;

window.getCaravanHqEffects = getCaravanHqEffects;

export function buildCaravanHq(bid){
  const band = loadCaravan();
  if(!band.established){ toast('아직 정식 상단이 아닙니다. 7명이 모이면 거점을 지을 수 있습니다.'); return; }
  const def = CARAVAN_HQ_BUILDINGS[bid];
  if(!def){ toast('알 수 없는 건물'); return; }
  band.hqBuildings = band.hqBuildings || {};
  const existing = band.hqBuildings[bid];
  const level = existing ? existing.level : 0;
  if(level >= def.maxLevel){ toast(`${def.name}은 이미 최대 레벨입니다.`); return; }
  const cost = def.baseCost * (level+1);
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  band.hqBuildings[bid] = { level: level+1, builtAt: S.msgCount||0 };
  saveCaravan(band);
  toast(`${def.name} Lv.${level+1} 건설 완료! (-${cost}G)`, 3500, def);
  S._pendingContractHint = `상단 거점에 ${def.name}이(가) 새로 지어졌다(Lv.${level+1}). ${def.desc}`;
  renderContractsPanel();
}
window.buildCaravanHq = buildCaravanHq;

window.buildCaravanHq = buildCaravanHq;

export function demolishCaravanHq(bid){
  const band = loadCaravan();
  const def = CARAVAN_HQ_BUILDINGS[bid];
  if(!def){ toast('알 수 없는 건물'); return; }
  const existing = (band.hqBuildings||{})[bid];
  if(!existing){ toast('건설된 건물이 아닙니다.'); return; }
  const totalCost = def.baseCost * (existing.level*(existing.level+1)/2);
  const refund = Math.floor(totalCost*0.5);
  S.gold = (S.gold||0) + refund; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  delete band.hqBuildings[bid];
  saveCaravan(band);
  toast(`🔨 ${def.name} 철거 (+${refund}G 환불)`, 3000);
  renderContractsPanel();
}
window.demolishCaravanHq = demolishCaravanHq;

window.demolishCaravanHq = demolishCaravanHq;

export function updateCaravanCaptain(band){
  if(!band.members.length){ band.captainId=null; return; }
  const best = [...band.members].sort((a,b)=>(b.level||1)-(a.level||1))[0];
  band.captainId = best.id;
}
window.updateCaravanCaptain = updateCaravanCaptain;

export function checkCaravanEstablished(band){
  if(band.established) return;
  if(band.members.length < 7) return;
  band.established = true;
  band.establishedAt = S.msgCount||0;
  const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  band.hqLocation = loc ? loc.name : '정처 없는 야영지';
  band.hqBuildings = {};
  setTimeout(()=>{
    toast(`🏬 상단이 정식으로 결성되었습니다! ${band.hqLocation}에 거점을 마련했습니다.`, 5500);
  }, 300);
  S._pendingContractHint = `그동안 하나둘 모아온 인원이 어느새 ${band.members.length}명에 달해, 정식으로 상단이 결성됐다. ${band.hqLocation}에 거점을 마련하고 이제 명실상부한 교역 조직으로 활동을 시작한다.`;
}
window.checkCaravanEstablished = checkCaravanEstablished;

export function recruitCaravanMember(scouted){
  const band = loadCaravan();
  const names=['델리아','코슨','바르트','예니','하브록','실라','토빈','마루','에스텔','고든','피오나','락슬리'];
  const archKey = CARAVAN_ARCHETYPE_KEYS[Math.floor(Math.random()*CARAVAN_ARCHETYPE_KEYS.length)];
  const arch = CARAVAN_ARCHETYPES[archKey];
  const traitKey = CARAVAN_TRAIT_KEYS[Math.floor(Math.random()*CARAVAN_TRAIT_KEYS.length)];
  const trait = CARAVAN_TRAITS[traitKey];
  const rarityKey = (typeof rollCaravanRarity==='function') ? rollCaravanRarity() : 'common';
  const rarity = CARAVAN_RARITY[rarityKey];
  const member = {
    id:'car_'+Date.now()+'_'+Math.floor(Math.random()*1000),
    name:names[Math.floor(Math.random()*names.length)]+' 상인',
    icon:arch.icon, archetype:archKey, trait:traitKey, rarity:rarityKey,
    level:1, xp:0,
    loyalty:60+Math.floor(Math.random()*20),
    upkeep:Math.round((8+Math.floor(Math.random()*6)) * (trait.upkeepMult||1) * (rarity.upkeepMult||1)),
    joinedAt:S.msgCount||0,
  };
  band.members.push(member);
  if(typeof updateCaravanCaptain==='function') updateCaravanCaptain(band);
  if(typeof checkCaravanEstablished==='function') checkCaravanEstablished(band);
  saveCaravan(band);
  if(typeof window.updateStats==='function') window.updateStats('caravan_recruit_count', 1);
  const joinText = scouted
    ? `이번 일로 ${member.name}이 마음에 들어 자청해 상단에 합류했습니다!`
    : `${member.icon} ${member.name}이 상단에 합류했습니다!`;
  const rarityTag = (rarityKey==='epic'||rarityKey==='legendary'||rarityKey==='primal') ? ` ✨${rarity.label}` : '';
  toast(`🤝 ${joinText} (${rarity.label} ${arch.label}·${trait.label}, 현재 ${band.members.length}명)${rarityTag}`, 4000);
}
window.recruitCaravanMember = recruitCaravanMember;

window.recruitCaravanMember = recruitCaravanMember;

export function getCaravanHireableNpcs(){
  const npcs = S.npcs || [];
  const bandIds = new Set((loadCaravan().members||[]).map(m=>m.sourceNpc).filter(Boolean));
  return npcs.filter(n=>{
    if(n.active===false || n.inParty || n.inCaravan) return false;
    if(bandIds.has(n.name)) return false;
    if(n.relationship!==undefined && n.relationship<30) return false;
    const rank = n.rank || n.socialRank || '';
    if(rank && !CARAVAN_HIREABLE_RANKS.includes(rank)) return false;
    return true;
  });
}
window.getCaravanHireableNpcs = getCaravanHireableNpcs;

window.getCaravanHireableNpcs = getCaravanHireableNpcs;

export function guessCaravanArchetypeFromRole(npc){
  const text = ((npc.role||'')+' '+(npc.faction||'')+' '+(npc.personality||'')).toLowerCase();
  if(/상인|장사|거래|행상/.test(text)) return 'trader';
  if(/짐꾼|일꾼|인부|하역/.test(text)) return 'porter';
  if(/길잡이|안내|정찰|여행/.test(text)) return 'scout';
  if(/경리|장부|서기|회계/.test(text)) return 'clerk';
  return CARAVAN_ARCHETYPE_KEYS[Math.floor(Math.random()*CARAVAN_ARCHETYPE_KEYS.length)];
}
window.guessCaravanArchetypeFromRole = guessCaravanArchetypeFromRole;

export function proposeCaravanHire(npcName, offerGold){
  const npcs = S.npcs || [];
  const npc = npcs.find(n=>n.name===npcName);
  if(!npc){ toast('해당 인물을 찾을 수 없습니다.'); return; }
  if((S.gold||0) < offerGold){ toast(`골드 부족 (${offerGold}G 필요)`); return; }

  const rel = npc.relationship!==undefined ? npc.relationship : 50;
  const relMod = Math.max(-0.3, Math.min(0.45, (rel-50)/150));
  const payMod = Math.min(0.3, Math.max(0, (offerGold-30)/300));
  const chance = Math.max(0.05, Math.min(0.95, 0.4 + relMod + payMod));

  S.gold -= offerGold; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  if(Math.random() >= chance){
    toast(`❌ ${npcName}이(가) 제안을 거절했습니다. (승낙 확률 ${Math.round(chance*100)}%)`, 3500);
    S._pendingContractHint = `주인공이 ${npcName}에게 상단 합류를 제안했으나 거절당했다.`;
    return;
  }

  const band = loadCaravan();
  const archKey = guessCaravanArchetypeFromRole(npc);
  const arch = CARAVAN_ARCHETYPES[archKey];
  const traitKey = CARAVAN_TRAIT_KEYS[Math.floor(Math.random()*CARAVAN_TRAIT_KEYS.length)];
  const trait = CARAVAN_TRAITS[traitKey];
  const rarityKey = (typeof rollCaravanRarityForNpc==='function') ? rollCaravanRarityForNpc(npc, offerGold) : 'common';
  const rarity = CARAVAN_RARITY[rarityKey];
  const startLoyalty = Math.min(95, 50 + Math.round(rel*0.4));
  const member = {
    id:'car_'+Date.now()+'_'+Math.floor(Math.random()*1000),
    name:npc.name, sourceNpc:npc.name,
    icon:npc.icon||arch.icon, archetype:archKey, trait:traitKey, rarity:rarityKey,
    level:1, xp:0,
    loyalty:startLoyalty,
    upkeep:Math.round((10+Math.floor(offerGold/20)) * (trait.upkeepMult||1) * (rarity.upkeepMult||1)),
    joinedAt:S.msgCount||0,
  };
  band.members.push(member);
  if(typeof updateCaravanCaptain==='function') updateCaravanCaptain(band);
  if(typeof checkCaravanEstablished==='function') checkCaravanEstablished(band);
  saveCaravan(band);
  npc.inCaravan = true;
  if(typeof saveNPCs==='function') saveNPCs(npcs);
  if(typeof window.updateStats==='function') window.updateStats('caravan_recruit_count', 1);
  toast(`🤝 ${npc.name}이(가) 상단 합류를 승낙했습니다! (${rarity.label} ${arch.label}·${trait.label})`, 4000);
  S._pendingContractHint = `${npc.name}이 정식으로 상단에 합류해 주인공과 함께하기 시작했다.`;
  renderContractsPanel();
}
window.proposeCaravanHire = proposeCaravanHire;

window.proposeCaravanHire = proposeCaravanHire;

export function getCaravanInfluenceTier(count){
  if(count>=10) return { label:'하나의 상회', desc:'왕국이 주목할 규모의 교역 조직으로 성장했다.' };
  if(count>=6)  return { label:'이름난 상단', desc:'지역에서 이름이 알려진 상단으로 인정받는다.' };
  if(count>=3)  return { label:'소규모 상단', desc:'제법 갖춰진 소규모 교역 조직이다.' };
  if(count>=1)  return { label:'동행 상인', desc:'혼자보다는 든든한 소수의 동행이다.' };
  return null;
}
window.getCaravanInfluenceTier = getCaravanInfluenceTier;

export function tickCaravanWalkIns(){
  const band = loadCaravan();
  const influence = getCaravanInfluenceTier(band.members.length);
  if(!influence) return;
  const hqEff = (typeof getCaravanHqEffects==='function') ? getCaravanHqEffects(band) : {walkInBonus:0};

  if(Math.random() < (0.04 + hqEff.walkInBonus)){
    const candidates = (typeof getCaravanHireableNpcs==='function') ? getCaravanHireableNpcs() : [];
    const good = candidates.filter(n=>(n.relationship||50) >= 55);
    if(good.length){
      const npc = good[Math.floor(Math.random()*good.length)];
      S._pendingCaravanWalkIn = { type:'npc', name:npc.name };
      S._pendingContractHint = `${npc.name}이 상단의 소문을 듣고 먼저 합류를 청해왔다. 주인공이 이를 받아들일지 대화로 결정할 수 있다.`;
      toast(`📢 ${npc.name}이 상단 합류를 자청했습니다! 대화로 응답해보세요.`, 4000);
      return;
    }
  }
  if(Math.random() < (0.03 + hqEff.walkInBonus)){
    S._pendingCaravanWalkIn = { type:'stranger' };
    S._pendingContractHint = `상단의 명성을 듣고 낯선 지원자가 찾아와 합류를 청했다. 주인공이 대화로 받아들이거나 거절할 수 있다.`;
    toast(`📢 낯선 지원자가 상단에 합류를 청하러 왔습니다!`, 4000);
  }
}
window.tickCaravanWalkIns = tickCaravanWalkIns;

window.tickCaravanWalkIns = tickCaravanWalkIns;

export function acceptCaravanWalkIn(){
  const pending = S._pendingCaravanWalkIn;
  if(!pending){ toast('현재 대기 중인 지원자가 없습니다.'); return; }
  if(pending.type==='npc' && pending.name){
    const npcs = S.npcs || [];
    const npc = npcs.find(n=>n.name===pending.name);
    if(!npc){ toast('해당 인물을 더 이상 찾을 수 없습니다.'); S._pendingCaravanWalkIn=null; return; }
    const band = loadCaravan();
    const archKey = (typeof guessCaravanArchetypeFromRole==='function') ? guessCaravanArchetypeFromRole(npc) : 'trader';
    const arch = CARAVAN_ARCHETYPES[archKey];
    const traitKey = CARAVAN_TRAIT_KEYS[Math.floor(Math.random()*CARAVAN_TRAIT_KEYS.length)];
    const trait = CARAVAN_TRAITS[traitKey];
    const rel = npc.relationship!==undefined ? npc.relationship : 50;
    const rarityKey = (typeof rollCaravanRarityForNpc==='function') ? rollCaravanRarityForNpc(npc, 0) : 'common';
    const rarity = CARAVAN_RARITY[rarityKey];
    const member = {
      id:'car_'+Date.now()+'_'+Math.floor(Math.random()*1000),
      name:npc.name, sourceNpc:npc.name,
      icon:npc.icon||arch.icon, archetype:archKey, trait:traitKey, rarity:rarityKey,
      level:1, xp:0, loyalty:Math.min(95, 55+Math.round(rel*0.3)),
      upkeep:Math.round((10+Math.floor(Math.random()*6)) * (rarity.upkeepMult||1)),
      joinedAt:S.msgCount||0,
    };
    band.members.push(member);
    if(typeof updateCaravanCaptain==='function') updateCaravanCaptain(band);
    if(typeof checkCaravanEstablished==='function') checkCaravanEstablished(band);
    saveCaravan(band);
    npc.inCaravan = true;
    if(typeof saveNPCs==='function') saveNPCs(npcs);
    toast(`🤝 ${npc.name}이(가) 상단에 합류했습니다! (${rarity.label} ${arch.label}·${trait.label})`, 4000);
  } else {
    recruitCaravanMember(false);
  }
  S._pendingCaravanWalkIn = null;
  renderContractsPanel();
}
window.acceptCaravanWalkIn = acceptCaravanWalkIn;

window.acceptCaravanWalkIn = acceptCaravanWalkIn;

export function declineCaravanWalkIn(){
  S._pendingCaravanWalkIn = null;
  toast('지원자를 돌려보냈습니다.', 2000);
  renderContractsPanel();
}
window.declineCaravanWalkIn = declineCaravanWalkIn;

window.declineCaravanWalkIn = declineCaravanWalkIn;

export const CARAVAN_DEPLOY_KEY = 'tf-caravandeploy';

export function loadCaravanDeployments(){ try{ return JSON.parse(lsGet(CARAVAN_DEPLOY_KEY)||'[]'); }catch(e){ return []; } }
window.loadCaravanDeployments = loadCaravanDeployments;

export function saveCaravanDeployments(d){ try{ lsSet(CARAVAN_DEPLOY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveCaravanDeployments = saveCaravanDeployments;

export const CARAVAN_GARRISON_KEY = 'tf-caravangarrison';

export function loadCaravanGarrisons(){ try{ return JSON.parse(lsGet(CARAVAN_GARRISON_KEY)||'[]'); }catch(e){ return []; } }
window.loadCaravanGarrisons = loadCaravanGarrisons;

export function saveCaravanGarrisons(d){ try{ lsSet(CARAVAN_GARRISON_KEY, JSON.stringify(d)); }catch(e){} }
window.saveCaravanGarrisons = saveCaravanGarrisons;

export function getCaravanDeployedMemberIds(){
  const deps = loadCaravanDeployments();
  const ids = new Set();
  deps.forEach(d=>d.memberIds.forEach(id=>ids.add(id)));
  const garrisons = loadCaravanGarrisons();
  garrisons.forEach(g=>ids.add(g.memberId));
  return ids;
}
window.getCaravanDeployedMemberIds = getCaravanDeployedMemberIds;

export function getCaravanResidentMembers(band){
  const deployed = getCaravanDeployedMemberIds();
  return band.members.filter(m=>!deployed.has(m.id));
}
window.getCaravanResidentMembers = getCaravanResidentMembers;

window.getCaravanResidentMembers = getCaravanResidentMembers;

export function garrisonCaravan(memberId, siteType, siteId, siteLabel){
  const band = loadCaravan();
  if(!band.established){ toast('아직 정식 상단이 아닙니다. 7명이 모이면 배치가 가능해집니다.'); return false; }
  const member = band.members.find(m=>m.id===memberId);
  if(!member){ toast('해당 상인을 찾을 수 없습니다.'); return false; }
  const already = getCaravanDeployedMemberIds();
  if(already.has(memberId)){ toast('이미 파견 또는 배치 중인 인원입니다.'); return false; }
  const garrisons = loadCaravanGarrisons();
  if(garrisons.some(g=>g.siteType===siteType && g.siteId===siteId)){
    toast('이 장소에는 이미 배치된 인원이 있습니다.'); return false;
  }
  garrisons.push({ id:'gar_'+Date.now(), memberId, siteType, siteId, siteLabel:siteLabel||siteId, since:S.msgCount||0 });
  saveCaravanGarrisons(garrisons);
  toast(`🛡️ ${member.name}이(가) ${siteLabel||siteId}에 배치되었습니다.`, 3500);
  return true;
}
window.garrisonCaravan = garrisonCaravan;

window.garrisonCaravan = garrisonCaravan;

export function ungarrisonCaravan(siteType, siteId){
  const garrisons = loadCaravanGarrisons();
  const g = garrisons.find(x=>x.siteType===siteType && x.siteId===siteId);
  if(!g){ toast('배치된 인원이 없습니다.'); return; }
  const band = loadCaravan();
  const member = band.members.find(m=>m.id===g.memberId);
  saveCaravanGarrisons(garrisons.filter(x=>x.id!==g.id));
  toast(`${member?member.name:'인원'}이(가) 배치 해제되어 복귀했습니다.`, 3000);
}
window.ungarrisonCaravan = ungarrisonCaravan;

window.ungarrisonCaravan = ungarrisonCaravan;

export function getCaravanGarrisonDefense(siteType, siteId){
  const garrisons = loadCaravanGarrisons();
  const g = garrisons.find(x=>x.siteType===siteType && x.siteId===siteId);
  if(!g) return 0;
  const band = loadCaravan();
  const member = band.members.find(m=>m.id===g.memberId);
  if(!member) return 0;
  const power = (typeof getCaravanMemberPower==='function') ? getCaravanMemberPower(member, 1) : {amount:0};
  const hqEff = (typeof getCaravanHqEffects==='function') ? getCaravanHqEffects(band) : {garrisonDefBonus:0};
  return Math.min(0.90, 0.25 + power.amount*0.03 + hqEff.garrisonDefBonus);
}
window.getCaravanGarrisonDefense = getCaravanGarrisonDefense;

window.getCaravanGarrisonDefense = getCaravanGarrisonDefense;

export function getCaravanMemberPower(m, gearMult){
  const arch = CARAVAN_ARCHETYPES[m.archetype] || CARAVAN_ARCHETYPES.trader;
  const trait = CARAVAN_TRAITS[m.trait] || {};
  const rarity = CARAVAN_RARITY[m.rarity] || CARAVAN_RARITY.common;
  const lvl = m.level||1;
  const loyaltyMod = m.loyalty>=50 ? 1 : 0.4;
  const base = (2 + lvl*0.6 + (m.evoBonus||0)) * (trait.bonusMult||1) * (rarity.bonusMult||1) * loyaltyMod * (gearMult||1);
  return { statKeys: arch.statKeys, amount: Math.max(0, Math.round(base)) };
}
window.getCaravanMemberPower = getCaravanMemberPower;

export function getCaravanBandBonus(){
  const band = loadCaravan();
  const resident = getCaravanResidentMembers(band);
  if(!resident.length) return {cha:0,luk:0,str:0,end:0,agi:0,per:0,int:0,count:0};
  const totals = {cha:0,luk:0,str:0,end:0,agi:0,per:0,int:0};
  resident.forEach(m=>{
    const p = getCaravanMemberPower(m, 1);
    p.statKeys.forEach(k=>{ if(totals[k]!==undefined) totals[k]+=p.amount; });
  });
  totals.count = resident.length;
  return totals;
}
window.getCaravanBandBonus = getCaravanBandBonus;

window.getCaravanBandBonus = getCaravanBandBonus;

export function grantCaravanXp(amount){
  const band = loadCaravan();
  if(!band.members.length) return;
  let leveled = [];
  let evolving = [];
  const hqEff = (typeof getCaravanHqEffects==='function') ? getCaravanHqEffects(band) : {xpBonus:0};
  band.members.forEach(m=>{
    const trait = CARAVAN_TRAITS[m.trait] || {};
    m.xp = (m.xp||0) + Math.round(amount * (trait.xpMult||1) * (1+hqEff.xpBonus));
    let need = caravanXpToNext(m.level||1);
    while(m.xp >= need){
      m.xp -= need; m.level = (m.level||1) + 1;
      leveled.push(m.name+' Lv.'+m.level);
      need = caravanXpToNext(m.level);
    }
    if(typeof canCaravanEvolve==='function' && canCaravanEvolve(m)) evolving.push(m);
  });
  saveCaravan(band);
  if(leveled.length) toast(`📈 ${leveled.join(', ')} 레벨업!`, 3500);
  if(evolving.length && typeof requestAICaravanEvolution==='function'){
    const top = evolving.sort((a,b)=>(b.level||1)-(a.level||1))[0];
    requestAICaravanEvolution(top);
  }
}
window.grantCaravanXp = grantCaravanXp;

window.grantCaravanXp = grantCaravanXp;

export function tickCaravan(){
  const band = loadCaravan();
  const rawSaved = (()=>{ try{ return JSON.parse(lsGet(CARAVAN_KEY)||'null'); }catch(e){ return null; } })();
  if(rawSaved && (rawSaved.established===undefined || rawSaved.established===null) && band.members.length>0){
    saveCaravan(band);
  }
  if(typeof tickCaravanDeployments==='function') tickCaravanDeployments();
  if(typeof tickCaravanJobBoard==='function') tickCaravanJobBoard();
  if(typeof tickCaravanWalkIns==='function' && !S._pendingCaravanWalkIn) tickCaravanWalkIns();
  if(!band.members.length) return;
  const resident = getCaravanResidentMembers(band);
  if(!resident.length) return;
  const hqEff = (typeof getCaravanHqEffects==='function') ? getCaravanHqEffects(band) : {upkeepDiscount:0};
  const totalUpkeep = Math.round(resident.reduce((s,m)=>s+m.upkeep,0) * (1-hqEff.upkeepDiscount));
  if((S.gold||0) >= totalUpkeep){
    S.gold -= totalUpkeep; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
    resident.forEach(m=>{ m.loyalty = Math.min(100, m.loyalty + 1); });
  } else {
    resident.forEach(m=>{
      const trait = CARAVAN_TRAITS[m.trait] || {};
      const decay = 15 * (trait.loyaltyDecayMult||1);
      m.loyalty = Math.max(0, m.loyalty - decay);
    });
    const deserter = resident.find(m=>m.loyalty<=0);
    if(deserter){
      const trait = CARAVAN_TRAITS[deserter.trait] || {};
      const desertRoll = Math.random() * (trait.desertChanceMult!==undefined ? trait.desertChanceMult : 1);
      band.members = band.members.filter(m=>m.id!==deserter.id);
      if(desertRoll < 0.3){
        toast(`⚠️ ${deserter.name}이 등을 돌리고 경쟁 상단으로 떠났다!`, 4000);
        S._pendingContractHint = `${deserter.name}이라는 이름의 상인이 삯을 받지 못해 등을 돌리고 경쟁 상단으로 떠났다.`;
      } else {
        toast(`💸 ${deserter.name}이 삯 미지급으로 상단을 떠났다.`, 3000);
      }
      if(typeof updateCaravanCaptain==='function') updateCaravanCaptain(band);
    }
  }
  saveCaravan(band);
}
window.tickCaravan = tickCaravan;

window._tickCaravan = tickCaravan;

export const CARAVAN_EVO_LOG_KEY = 'tf-caravan-evo-log';

export const CARAVAN_EVO_LOCAL_MIN_SAMPLES = 4;

export function loadCaravanEvoLog(){ try{ return JSON.parse(lsGet(CARAVAN_EVO_LOG_KEY)||'{}'); }catch(e){ return {}; } }
window.loadCaravanEvoLog = loadCaravanEvoLog;

export function saveCaravanEvoLog(d){ try{ lsSet(CARAVAN_EVO_LOG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveCaravanEvoLog = saveCaravanEvoLog;

export function caravanEvoLogKey(archetype, evoCount, rarityTier){ return archetype+'_'+evoCount+'_'+(rarityTier||'low'); }
window.caravanEvoLogKey = caravanEvoLogKey;

export function requestAICaravanEvolution(m){
  const evoCount = m.evoCount||0;
  const stageName = CARAVAN_EVO_STAGE_NAMES[evoCount] || (evoCount+1)+'차';
  const arch = CARAVAN_ARCHETYPES[m.archetype] || CARAVAN_ARCHETYPES.trader;
  const trait = CARAVAN_TRAITS[m.trait] || {};
  const rarity = CARAVAN_RARITY[m.rarity] || CARAVAN_RARITY.common;
  const rarityTier = ['epic','legendary','primal'].includes(m.rarity) ? 'high' : 'low';

  const log = loadCaravanEvoLog();
  const pool = log[caravanEvoLogKey(m.archetype, evoCount, rarityTier)] || [];
  if(pool.length >= CARAVAN_EVO_LOCAL_MIN_SAMPLES){
    const picked = pool[Math.floor(Math.random()*pool.length)];
    if(typeof handleCaravanEvolve==='function'){
      handleCaravanEvolve([{ name:m.name, newDesc:picked.newDesc, newSkill:picked.newSkill, newSkillDesc:picked.newSkillDesc, statBoost:picked.statBoost }], true);
    }
    return;
  }

  const scaleGuide = [
    '1차=성장(자기만의 거래 수완이 생김)',
    '2차=숙련(단골이 생기고 상단 내 입지 확립)',
    '3차=명성(주변 상인들이 이 인물을 알아보고 반응)',
    '4차=거상(직군의 한계를 넘어선 독자적인 교역 수완 확립)',
    '5차=전설(지역 전역에 이름이 알려진 전설적 상인)',
    '6차=대상회주(세력·역사에 기록될 만한 존재로 완성)',
  ];
  const rarityGuide = rarity.maxEvo>=6
    ? '이 상인은 "'+rarity.label+'" 등급 — 최고 등급이라 대상회주(6차)까지 성장할 수 있는 특별한 그릇이다. 성장 묘사도 그에 걸맞게 더 극적이고 인상적으로.'
    : '이 상인은 "'+rarity.label+'" 등급 — 이번이 도달할 수 있는 마지막 성장(최대 '+rarity.maxEvo+'차)일 수 있다. 등급에 맞는 수수하거나 적당한 성장으로 묘사하라(전설급처럼 과장하지 말 것).';
  const prompt = '\n[💰 '+m.name+' '+stageName+' — 지금 즉시 서사에서 묘사하고 GS 출력]\n'
    +'상단원 정보: 이름='+m.name+', 등급='+rarity.label+', 직군='+arch.label+', 특성='+(trait.label||'')+'('+(trait.desc||'')+')\n'
    +'현재 Lv.'+(m.level||1)+', 충성도='+(m.loyalty||60)+'\n'
    +'이번 성장: '+stageName+' ('+(evoCount+1)+'/6단, 이 인물의 성장 상한: '+rarity.maxEvo+'단)\n'
    +'스케일 기준: '+(scaleGuide[evoCount]||'')+'\n'
    +rarityGuide+'\n'
    +'지금까지의 서사 맥락, 이 인물의 직군·특성·소속(상단), 함께한 거래를 반영해\n'
    +'이 인물이 한 단계 더 뛰어나고 개성 있는 상인으로 성장하는 장면을 그려라.\n'
    +'이름이 바뀔 필요는 없지만(원한다면 별명/이명을 붙여도 좋다), 외형 묘사나 거래 스타일, 고유 특기가\n'
    +'뚜렷하게 발전해야 한다. 성장 장면을 인상적으로 묘사한 뒤 반드시 <gs>에 출력:\n'
    +'"caravan_evolve":[{"name":"'+m.name+'","newName":"이명이 붙은 이름(선택, 없으면 생략)","newIcon":"이모지(선택)","newDesc":"외형·거래스타일 묘사 2줄","newSkill":"고유 특기명","newSkillDesc":"특기 설명","statBoost":{"amount":3}}]\n'
    +'5차(amount:8+), 6차(amount:12+)로 스탯 부스트 스케일도 올려라.';
  S._nextInjectedContext = (S._nextInjectedContext||'') + prompt;
  setTimeout(()=>toast(`✨ ${m.name} ${stageName} 준비! 다음 행동에서 성장합니다`, 4500), 500);
}
window.requestAICaravanEvolution = requestAICaravanEvolution;

window.requestAICaravanEvolution = requestAICaravanEvolution;

export function handleCaravanEvolve(evoList, fromLocal){
  if(!Array.isArray(evoList)) return;
  const band = loadCaravan();
  let changed = false;
  const evoLog = fromLocal ? null : loadCaravanEvoLog();
  evoList.forEach(ev=>{
    if(!ev || !ev.name) return;
    const m = band.members.find(x=>x.name && x.name.includes(String(ev.name).slice(0,4)));
    if(!m) return;
    const oldName = m.name, oldIcon = m.icon;
    const evoCountBefore = m.evoCount||0;
    if(ev.newName) m.name = ev.newName;
    if(ev.newIcon) m.icon = ev.newIcon;
    if(ev.newDesc) m.evoDesc = ev.newDesc;
    if(ev.newSkill){ m.evoSkill = ev.newSkill; m.evoSkillDesc = ev.newSkillDesc||''; }
    const boost = ev.statBoost || {};
    m.evoBonus = (m.evoBonus||0) + (boost.amount||3);
    m.loyalty = Math.min(100, (m.loyalty||60)+10);
    m.evoCount = (m.evoCount||0) + 1;
    m.evoHistory = m.evoHistory || [];
    m.evoHistory.push({from:oldName, to:m.name, fromIcon:oldIcon, toIcon:m.icon, atLevel:m.level, skill:m.evoSkill, at:new Date().toLocaleString('ko-KR'), source:fromLocal?'local':'ai'});
    changed = true;
    if(evoLog && ev.newDesc){
      const rarityTier = ['epic','legendary','primal'].includes(m.rarity) ? 'high' : 'low';
      const key = caravanEvoLogKey(m.archetype, evoCountBefore, rarityTier);
      if(!evoLog[key]) evoLog[key] = [];
      if(!evoLog[key].some(p=>p.newDesc===ev.newDesc)){
        evoLog[key].push({ newDesc:ev.newDesc, newSkill:ev.newSkill, newSkillDesc:ev.newSkillDesc, statBoost:boost });
        if(evoLog[key].length > 20) evoLog[key].shift();
      }
    }
    if(typeof showCaravanEvoPopup==='function') showCaravanEvoPopup(m, oldName, oldIcon, ev);
    if(typeof addTimelineEvent==='function') addTimelineEvent('caravan_evo', oldName+' → '+m.name, {icon:m.icon||'💰'});
  });
  if(evoLog) saveCaravanEvoLog(evoLog);
  if(changed){ saveCaravan(band); if(typeof renderContractsPanel==='function') renderContractsPanel(); }
}
window.handleCaravanEvolve = handleCaravanEvolve;

window.handleCaravanEvolve = handleCaravanEvolve;

export function showCaravanEvoPopup(m, oldName, oldIcon, ev){
  document.querySelectorAll('.caravan-evo-popup').forEach(el=>el.remove());
  const arch = CARAVAN_ARCHETYPES[m.archetype] || CARAVAN_ARCHETYPES.trader;
  const trait = CARAVAN_TRAITS[m.trait] || {};
  const archColorMap = { trader:'#c8a96e', porter:'#8a9a6a', scout:'#6a9ac0', clerk:'#8ac0a0' };
  const archColor = archColorMap[m.archetype] || '#c8a96e';
  const stageLabel = CARAVAN_EVO_STAGE_NAMES[(m.evoCount||1)-1] || '';
  const popup = document.createElement('div');
  popup.className = 'caravan-evo-popup';
  popup.style.cssText = 'position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .3s';
  popup.innerHTML =
    '<div style="width:100%;max-width:340px;background:#0d0800;border:2px solid '+archColor+';box-shadow:0 0 60px '+archColor+'55;overflow:hidden">'
    +'<div style="background:linear-gradient(135deg,#1a0f00,#2a1a05);padding:16px;text-align:center;border-bottom:1px solid '+archColor+'44">'
    +'<div style="font-family:\'Cinzel\',serif;font-size:9px;color:'+archColor+';letter-spacing:3px;margin-bottom:6px">✦ '+stageLabel+' GROWTH ✦</div>'
    +'<div style="display:flex;align-items:center;justify-content:center;gap:14px;margin:8px 0">'
    +'<div style="opacity:.4;text-align:center"><div style="font-size:28px">'+(oldIcon||'💰')+'</div><div style="font-size:8px;color:#5a4a2a;margin-top:2px">'+esc(oldName)+'</div></div>'
    +'<div style="color:'+archColor+';font-size:20px">→</div>'
    +'<div style="text-align:center"><div style="font-size:44px;filter:drop-shadow(0 0 16px '+archColor+')">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:14}):(m?.icon||'✨'))+'</div><div style="font-family:\'Cinzel\',serif;font-size:13px;color:#e8d89e;margin-top:4px">'+esc(m.name)+'</div></div>'
    +'</div>'
    +'<div style="font-size:9px;color:#8a7a4a">Lv.'+(m.level||1)+' · '+arch.label+' · '+stageLabel+' ('+(m.evoCount||1)+'/6)</div>'
    +'</div>'
    +'<div style="padding:14px 16px">'
    +(m.evoDesc?'<div style="font-size:10px;color:#c0b080;line-height:1.7;margin-bottom:10px;text-align:center;font-style:italic">'+esc(m.evoDesc)+'</div>':'')
    +(m.evoSkill?'<div style="padding:8px 10px;background:#0a0500;border-left:3px solid '+archColor+';margin-bottom:10px"><div style="font-size:9px;color:'+archColor+';margin-bottom:2px">✦ 새 특기</div><div style="font-size:11px;color:#d0b0f0">'+esc(m.evoSkill)+'</div>'+(m.evoSkillDesc?'<div style="font-size:9px;color:#8060a0;margin-top:2px">'+esc(m.evoSkillDesc)+'</div>':'')+'</div>':'')
    +'<div style="font-size:9px;color:#8a7a4a;margin-bottom:10px">🏷️ '+arch.label+' · '+(typeof getEntityIconHTML==='function'?getEntityIconHTML(trait,{size:14}):(trait?.icon||''))+' '+(trait.label||'')+'</div>'
    +'<div style="display:flex;gap:5px;font-size:9px;color:#80c080;flex-wrap:wrap;margin-bottom:12px"><span>💰 교역력+'+((ev.statBoost&&ev.statBoost.amount)||3)+'</span><span>💛 충성+10</span></div>'
    +'<button onclick="this.closest(\'.caravan-evo-popup\').remove()" style="width:100%;padding:10px;background:linear-gradient(135deg,#2a1f0d,#3a2a10);border:1px solid '+archColor+';color:'+archColor+';font-family:\'Cinzel\',serif;font-size:11px;cursor:pointer;letter-spacing:1px">확인</button>'
    +'</div></div>';
  document.body.appendChild(popup);
  popup.addEventListener('click', e=>{ if(e.target===popup) popup.remove(); });
}
window.showCaravanEvoPopup = showCaravanEvoPopup;

window.showCaravanEvoPopup = showCaravanEvoPopup;

export const CARAVAN_MISSION_KEYS = Object.keys(CARAVAN_MISSIONS);

export function findCaravanMissionDef(key){ return CARAVAN_MISSIONS[key] || null; }
window.findCaravanMissionDef = findCaravanMissionDef;

export function deployCaravanSquad(missionKey, memberIds){
  const mission = findCaravanMissionDef(missionKey);
  if(!mission){ toast('알 수 없는 임무'); return; }
  const band = loadCaravan();
  if(!band.established){ toast('아직 정식 상단이 아닙니다. 7명이 모이면 파견이 가능해집니다.'); return; }
  const already = getCaravanDeployedMemberIds();
  const validIds = memberIds.filter(id=>band.members.some(m=>m.id===id) && !already.has(id));
  if(validIds.length < mission.minMembers){
    toast(`⚠️ 이 임무는 최소 ${mission.minMembers}명이 필요합니다.`, 3000); return;
  }
  const deps = loadCaravanDeployments();
  deps.push({
    id:'dep_'+Date.now(), missionKey, memberIds:validIds,
    startedAt:S.msgCount||0, daysLeft:mission.days, totalDays:mission.days,
  });
  saveCaravanDeployments(deps);
  const names = band.members.filter(m=>validIds.includes(m.id)).map(m=>m.name).join(', ');
  toast(`${names} — ${mission.label} 출발! (${mission.days}일 소요)`, 3500, mission);
  renderContractsPanel();
}
window.deployCaravanSquad = deployCaravanSquad;

window.deployCaravanSquad = deployCaravanSquad;

export function deploySelectedCaravan(missionKey){
  const checked = Array.from(document.querySelectorAll('.caravan-deploy-chk:checked'));
  const ids = checked.map(el=>el.getAttribute('data-mid'));
  if(!ids.length){ toast('파견할 인원을 먼저 선택하세요.', 2500); return; }
  deployCaravanSquad(missionKey, ids);
}
window.deploySelectedCaravan = deploySelectedCaravan;

window.deploySelectedCaravan = deploySelectedCaravan;

export function tickCaravanDeployments(){
  const deps = loadCaravanDeployments();
  if(!deps.length) return;
  const band = loadCaravan();
  let changed = false;
  const remaining = [];
  deps.forEach(dep=>{
    dep.daysLeft -= 1;
    if(dep.daysLeft > 0){ remaining.push(dep); return; }
    changed = true;
    const mission = findCaravanMissionDef(dep.missionKey);
    const squad = band.members.filter(m=>dep.memberIds.includes(m.id));
    if(!squad.length) return;

    const avgLevel = squad.reduce((s,m)=>s+(m.level||1),0)/squad.length;
    const riskMod = Math.max(0.02, mission.riskBase - avgLevel*0.015);
    const payMult = dep.payMult || 1;
    const goldReward = Math.round(mission.goldPerDay * mission.totalDays * squad.length * (0.8+Math.random()*0.4) * payMult);
    const xpReward = Math.round(mission.xpPerDay * mission.totalDays);
    const clientTag = dep.clientLabel ? `${dep.clientLabel}의 의뢰로 나갔던 ` : '';

    let mishap = null;
    squad.forEach(m=>{
      const trait = CARAVAN_TRAITS[m.trait]||{};
      const personalRisk = riskMod * (trait.bonusMult && trait.loyaltyDecayMult>1 ? 1.3 : 1);
      if(Math.random() < personalRisk){ mishap = m; }
    });

    if(mishap){
      // 상단은 전투 조직이 아니므로 "부상/전사" 대신 "약탈당함/이탈" 결과
      if(Math.random() < 0.8){
        mishap.loyalty = Math.max(0, mishap.loyalty - 10);
        const lostGold = Math.round(mission.goldPerDay * mission.totalDays * 0.5);
        S.gold = Math.max(0, (S.gold||0) - lostGold);
        if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
        S._pendingContractHint = `${mission.icon} ${clientTag}${mission.label}을 마친 ${mishap.name}이 도적에게 물자를 약탈당하고 돌아왔다. (손실 ${lostGold}G)`;
        toast(`🏴 ${mishap.name}이 ${mission.label} 중 도적을 만나 물자를 잃었다. (-${lostGold}G)`, 3500);
      } else {
        band.members = band.members.filter(x=>x.id!==mishap.id);
        S._pendingContractHint = `${mission.icon} ${clientTag}${mission.label}을 나갔던 ${mishap.name}이 돌아오지 않았다. 소식이 끊긴 채 상단에 안타까움이 남았다.`;
        toast(`💔 ${mishap.name}이 ${mission.label} 중 소식이 끊겼다...`, 4500);
        updateCaravanCaptain(band);
      }
    } else {
      S.gold = (S.gold||0) + goldReward;
      if(typeof saveGold==='function') saveGold(S.gold);
      window.updateHeader&&window.updateHeader();
      squad.forEach(m=>{
        m.xp = (m.xp||0) + Math.round(xpReward * ((CARAVAN_TRAITS[m.trait]||{}).xpMult||1));
        let need = caravanXpToNext(m.level||1);
        while(m.xp >= need){ m.xp -= need; m.level=(m.level||1)+1; need = caravanXpToNext(m.level); }
      });
      S._pendingContractHint = `${mission.icon} ${clientTag}${squad.map(m=>m.name).join(', ')}이 ${mission.label}을 무사히 마치고 골드 ${goldReward}G를 벌어왔다.`;
      toast(`✅ ${clientTag}${mission.label} 완료! ${squad.map(m=>m.name).join(', ')} 귀환, 골드 +${goldReward}G`, 4000);
    }
  });
  if(changed){ saveCaravanDeployments(remaining); saveCaravan(band); }
  else if(remaining.length !== deps.length){ saveCaravanDeployments(remaining); }
}
window.tickCaravanDeployments = tickCaravanDeployments;

export const CARAVAN_JOB_BOARD_KEY = 'tf-caravanjobs';

export function loadCaravanJobBoard(){ try{ return JSON.parse(lsGet(CARAVAN_JOB_BOARD_KEY)||'null')||{jobs:[],lastRefreshTurn:0}; }catch(e){ return {jobs:[],lastRefreshTurn:0}; } }
window.loadCaravanJobBoard = loadCaravanJobBoard;

export function saveCaravanJobBoard(d){ try{ lsSet(CARAVAN_JOB_BOARD_KEY, JSON.stringify(d)); }catch(e){} }
window.saveCaravanJobBoard = saveCaravanJobBoard;

export function refreshCaravanJobBoard(){
  const board = loadCaravanJobBoard();
  const turnsSince = (S.msgCount||0) - (board.lastRefreshTurn||0);
  if(turnsSince < 5 && board.jobs.length>0) return;
  const band = loadCaravan();
  const influenceCount = band.members.length;
  const slots = Math.min(4, 2 + Math.floor(influenceCount/4));

  const jobs = [];
  for(let i=0;i<slots;i++){
    const missionKey = CARAVAN_MISSION_KEYS[Math.floor(Math.random()*CARAVAN_MISSION_KEYS.length)];
    const client = CARAVAN_JOB_CLIENTS[Math.floor(Math.random()*CARAVAN_JOB_CLIENTS.length)];
    const payMult = 0.8 + Math.random()*0.4;
    jobs.push({
      id:'cjob_'+Date.now()+'_'+i,
      missionKey, clientLabel:client.label, reason:client.reason,
      payMult:Math.round(payMult*100)/100,
      postedAt:S.msgCount||0,
      expiresAt:(S.msgCount||0) + 15,
    });
  }
  board.jobs = jobs;
  board.lastRefreshTurn = S.msgCount||0;
  saveCaravanJobBoard(board);
}
window.refreshCaravanJobBoard = refreshCaravanJobBoard;

export function tickCaravanJobBoard(){
  const board = loadCaravanJobBoard();
  const before = board.jobs.length;
  board.jobs = board.jobs.filter(j=>j.expiresAt > (S.msgCount||0));
  if(board.jobs.length !== before) saveCaravanJobBoard(board);
  refreshCaravanJobBoard();
}
window.tickCaravanJobBoard = tickCaravanJobBoard;

export function acceptCaravanJob(jobId, memberIds){
  const board = loadCaravanJobBoard();
  const job = board.jobs.find(j=>j.id===jobId);
  if(!job){ toast('이미 사라진 의뢰입니다.'); return; }
  const mission = findCaravanMissionDef(job.missionKey);
  const band = loadCaravan();
  if(!band.established){ toast('아직 정식 상단이 아닙니다. 7명이 모이면 의뢰 수행이 가능해집니다.'); return; }
  const already = getCaravanDeployedMemberIds();
  const validIds = memberIds.filter(id=>band.members.some(m=>m.id===id) && !already.has(id));
  if(validIds.length < mission.minMembers){
    toast(`⚠️ 이 의뢰는 최소 ${mission.minMembers}명이 필요합니다.`, 3000); return;
  }
  const deps = loadCaravanDeployments();
  deps.push({
    id:'dep_'+Date.now(), missionKey:job.missionKey, memberIds:validIds,
    startedAt:S.msgCount||0, daysLeft:mission.days, totalDays:mission.days,
    jobId:job.id, payMult:job.payMult, clientLabel:job.clientLabel,
  });
  saveCaravanDeployments(deps);
  board.jobs = board.jobs.filter(j=>j.id!==jobId);
  saveCaravanJobBoard(board);
  const names = band.members.filter(m=>validIds.includes(m.id)).map(m=>m.name).join(', ');
  toast(`📜 ${job.clientLabel}의 의뢰 수락! ${names} 출발 (${mission.days}일 소요)`, 3500);
  renderContractsPanel();
}
window.acceptCaravanJob = acceptCaravanJob;

window.acceptCaravanJob = acceptCaravanJob;

export function acceptSelectedCaravanJob(jobId){
  const checked = Array.from(document.querySelectorAll('.caravan-deploy-chk:checked'));
  const ids = checked.map(el=>el.getAttribute('data-mid'));
  if(!ids.length){ toast('보낼 인원을 먼저 선택하세요.', 2500); return; }
  acceptCaravanJob(jobId, ids);
}
window.acceptSelectedCaravanJob = acceptSelectedCaravanJob;

window.acceptSelectedCaravanJob = acceptSelectedCaravanJob;

export function getCaravanSection(){
  const band = loadCaravan();
  const pendingHint = S._pendingContractHint; // 용병단과 공유하는 1회성 힌트 슬롯
  let lines=[];
  if(band.members.length>0){
    const resident = getCaravanResidentMembers(band);
    const avgLoy = resident.length ? Math.round(resident.reduce((s,m)=>s+m.loyalty,0)/resident.length) : 0;
    const roster = resident.map(m=>{
      const arch = CARAVAN_ARCHETYPES[m.archetype]||CARAVAN_ARCHETYPES.trader;
      const trait = CARAVAN_TRAITS[m.trait]||{};
      const rarity = CARAVAN_RARITY[m.rarity]||CARAVAN_RARITY.common;
      const captainTag = (band.captainId===m.id) ? '★단장 ' : '';
      const evoTag = m.evoCount ? ` [${CARAVAN_EVO_STAGE_NAMES[m.evoCount-1]||m.evoCount+'차'}]` : '';
      return `${captainTag}${m.name}(${rarity.label} ${arch.label} Lv.${m.level||1}, ${trait.label||''})${evoTag}`;
    }).join(', ');
    const influence = getCaravanInfluenceTier(band.members.length);
    let line = `[🏬 상단] 주인공이 거느린 상단 ${band.members.length}명, 거점은 ${band.hqLocation||'미상'}`;
    if(influence) line += ` — ${influence.label}(${influence.desc})`;
    line += `. 현재 곁에 있는 인원: ${roster||'전원 파견 중'} (평균 충성도 ${avgLoy})`;
    line += '. 전투 조직이 아니라 교역 조직이므로, 물건을 사고팔거나 짐을 나르는 등 상업적인 언행으로 묘사하라.';
    const evolved = resident.filter(m=>m.evoCount>0);
    if(evolved.length){
      line += ' 성장한 상단원의 특징: ' + evolved.map(m=>`${m.name}(${m.evoDesc||''}${m.evoSkill?' · 특기:'+m.evoSkill:''})`).join(' / ') + '.';
    }
    lines.push(line);
  } else if(!band.established){
    // 용병단과 달리 상단은 별도 안내 없이도 자연스러움 — 아직 인원이 없으면 언급 생략
  }
  const deps = loadCaravanDeployments();
  if(deps.length>0){
    const depNames = band.members.filter(m=>deps.some(d=>d.memberIds.includes(m.id))).map(m=>m.name);
    if(depNames.length) lines.push(`[🐪 파견 중인 상단원] ${depNames.join(', ')}은(는) 현재 교역 임무로 자리를 비웠다. 주인공 곁에 없는 것으로 취급하라.`);
  }
  const jobBoard = loadCaravanJobBoard();
  if(jobBoard.jobs.length>0 && band.members.length>0){
    lines.push(`[📜 상단 의뢰 게시판] 마을에 ${jobBoard.jobs.map(j=>`${j.clientLabel}(${findCaravanMissionDef(j.missionKey)?.label||j.missionKey})`).join(', ')} 의뢰가 붙어 있다. NPC가 이를 언급하거나, 주인공이 게시판을 보면 자연스럽게 노출하라.`);
  }
  return lines.length ? '\n'+lines.join('\n') : '';
}
window.getCaravanSection = getCaravanSection;

window.getCaravanSection = getCaravanSection;

export function renderContractsPanel(){
  const body=document.getElementById('pb-contracts'); if(!body) return;
  const karma = (S.character && S.character.karmaScore) || 50;
  const band = loadMercBand();
  const orgCtrl = loadOrgControl();

  let html = `<div style="padding:8px 12px;background:#0a0500;border-bottom:1px solid #2a1a05;font-size:9px;color:#8a6a3a;line-height:1.6">💼 의뢰소 — 돈으로 폭력·정보·범죄를 외주화한다. 카르마(악행도)와 평판에 따라 접근 가능한 의뢰가 달라진다.</div>`;

  // 자발적 지원자 — 소문을 듣고 스스로 찾아온 경우, 상단에 눈에 띄게 알림
  if(S._pendingMercWalkIn){
    const w = S._pendingMercWalkIn;
    const label = w.type==='npc' ? `${w.name}이(가) 소문을 듣고 합류를 자청했습니다.` : '낯선 지원자가 합류를 청하러 왔습니다.';
    html += `<div style="padding:10px 12px;background:#0f1a0a;border-bottom:1px solid #2a5a1a">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#8aca6a;margin-bottom:5px">📢 자발적 지원</div>
      <div style="font-size:9px;color:var(--text);margin-bottom:8px">${label}</div>
      <div style="display:flex;gap:6px">
        <button onclick="acceptMercWalkIn()" style="flex:1;padding:5px;background:#0a150a;border:1px solid #2a5a1a;color:#6aca6a;font-size:9px;cursor:pointer">받아들이기</button>
        <button onclick="declineMercWalkIn()" style="flex:1;padding:5px;background:#150a0a;border:1px solid #5a2a1a;color:#ca6a6a;font-size:9px;cursor:pointer">거절하기</button>
      </div>
    </div>`;
  }

  // 지명 고용 — 만난 NPC 중 원하는 인물을 직접 골라 스카우트
  const hireable = (typeof getHireableNpcs==='function') ? getHireableNpcs() : [];
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">🤝 지명 고용</div>
    <div style="font-size:8px;color:var(--dim);margin-bottom:8px">뽑기가 아니다 — 만난 인물 중 마음에 드는 사람을 직접 골라 급여를 제시한다. 호감도가 높을수록, 급여를 후하게 줄수록 승낙 확률이 오른다.</div>
    ${hireable.length ? hireable.map(n=>{
      const rel = n.relationship!==undefined ? n.relationship : 50;
      return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-top:1px solid #0a0500">
        <span style="font-size:13px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(n,{size:13}):(n.icon||"👤")}</span>
        <span style="flex:1;font-size:9px;color:var(--text)">${esc(n.name)} <span style="color:#8a7a5a">${esc(n.role||'')}</span></span>
        <span style="font-size:8px;color:${rel>=60?'#6aca6a':'#c0a030'}">호감 ${rel}</span>
        <button onclick="const g=prompt('제시할 급여(G)를 입력하세요 (권장 30~100G):','50'); if(g)proposeHire('${esc(n.name)}', parseInt(g)||0)" style="padding:2px 7px;background:#0a0f1a;border:1px solid #1a3a5a;color:#6a9ac0;font-size:8px;cursor:pointer">제안하기</button>
      </div>`;
    }).join('') : `<div style="font-size:9px;color:var(--dim);padding:6px 0">아직 고용을 제안할 만큼 가까워진 인물이 없습니다. (호감도 30 이상 필요)</div>`}
  </div>`;

  if(!band.established){
    if(!band.members.length){
      html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005;font-size:9px;color:var(--dim);line-height:1.6">💡 아직 정식 용병단이 아닙니다. 지명 고용이나 선술집의 소문을 통해 사람을 하나씩 구할 수 있습니다. 7명이 모이면 정식으로 용병단이 결성되어 거점을 마련하고, 파견·의뢰판 같은 본격적인 운영이 가능해집니다.</div>`;
    } else {
      const need = 7 - band.members.length;
      html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
        <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">🚶 모여드는 사람들 (${band.members.length}/7)</div>
        <div style="font-size:8px;color:var(--dim);margin-bottom:8px">아직 정식 용병단은 아닙니다. ${need}명이 더 모이면 정식으로 결성되어 거점이 생기고, 파견·의뢰판·장비 같은 조직 운영이 열립니다.</div>
        ${band.members.map(m=>{
          const arch = MERC_ARCHETYPES[m.archetype]||MERC_ARCHETYPES.vanguard;
          const rarity = MERC_RARITY[m.rarity]||MERC_RARITY.common;
          const rColor = (typeof RC!=='undefined') ? (RC[m.rarity]||RC.common) : '#8a9a8a';
          return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-top:1px solid #0a0500">
            <span style="font-size:13px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:13}):(m.icon)}</span>
            <span style="flex:1;font-size:9px;color:var(--text)"><span style="color:${rColor}">[${rarity.label}]</span> ${esc(m.name)} <span style="color:#8a7a5a">· ${arch.label} Lv.${m.level||1}</span></span>
          </div>`;
        }).join('')}
      </div>`;
    }
  }

  // 용병단 현황 (정식 출범 후에만 전체 운영 기능 노출)
  if(band.members.length>0 && band.established){
    const bonus = getMercBandBonus();
    const bonusText = Object.entries({str:'STR',end:'END',agi:'AGI',per:'PER',rng:'RNG',fath:'FATH',wil:'WIL'})
      .filter(([k])=>bonus[k]>0).map(([k,label])=>`${label}+${bonus[k]}`).join(' ');
    const deployedIds = (typeof getDeployedMemberIds==='function') ? getDeployedMemberIds() : new Set();
    const resident = band.members.filter(m=>!deployedIds.has(m.id));
    const influence = (typeof getMercBandInfluenceTier==='function') ? getMercBandInfluenceTier(band.members.length) : null;
    const gear = (typeof getMercGearTier==='function') ? getMercGearTier(band) : {label:'허름한 장비',tier:0};
    const nextGear = (typeof MERC_GEAR_TIERS!=='undefined') ? MERC_GEAR_TIERS[Math.min((band.gearTier||0)+1, MERC_GEAR_TIERS.length-1)] : null;
    const hqEff = (typeof getMercHqEffects==='function') ? getMercHqEffects(band) : {upkeepDiscount:0,gearDiscount:0};
    const rawUpkeep = resident.reduce((s,m)=>s+m.upkeep,0);
    const actualUpkeep = Math.round(rawUpkeep * (1-hqEff.upkeepDiscount));
    const nextGearCost = nextGear ? Math.round(nextGear.upgradeCost*(1-hqEff.gearDiscount)) : 0;

    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span style="font-family:Cinzel,serif;font-size:10px;color:#c0a030">⚔️ 내 용병단 (${band.members.length}명)</span>
        ${influence?`<span style="font-size:8px;color:#c8a96e;padding:1px 6px;background:#1a1000;border:1px solid #3a2a05">${influence.label}</span>`:''}
      </div>
      ${influence?`<div style="font-size:8px;color:var(--dim);margin-bottom:6px">${influence.desc}</div>`:''}
      <div style="font-size:8px;color:#8a7a5a;margin-bottom:6px">🏕️ 거점: ${band.hqLocation||'미상'}</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:6px">전투 보너스(상주 인원 기준): ${bonusText||'없음'} · 매 턴 유지비 ${actualUpkeep}G${hqEff.upkeepDiscount>0?` (막사 할인 -${Math.round(hqEff.upkeepDiscount*100)}%)`:''}</div>

      <div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:#0a0500;border:1px solid #2a1a05;margin-bottom:8px">
        <span style="font-size:9px;color:var(--text);flex:1">⚒️ ${gear.label}</span>
        ${nextGear && (band.gearTier||0) < MERC_GEAR_TIERS.length-1
          ? `<button onclick="upgradeMercGear()" style="padding:3px 8px;background:#1a0f00;border:1px solid #5a3a10;color:#c0a030;font-size:8px;cursor:pointer">다음 등급(${nextGearCost}G)</button>`
          : `<span style="font-size:8px;color:#6aca6a">최고 등급</span>`}
      </div>

      ${band.members.map(m=>{
        const arch = MERC_ARCHETYPES[m.archetype]||MERC_ARCHETYPES.vanguard;
        const trait = MERC_TRAITS[m.trait]||{};
        const rarity = MERC_RARITY[m.rarity]||MERC_RARITY.common;
        const rColor = (typeof RC!=='undefined') ? (RC[m.rarity]||RC.common) : '#8a9a8a';
        const need = mercXpToNext(m.level||1);
        const xpPct = Math.min(100, Math.round(((m.xp||0)/need)*100));
        const isDeployed = deployedIds.has(m.id);
        const isCaptain = band.captainId===m.id;
        const evoStage = m.evoCount ? (MERC_EVO_STAGE_NAMES[m.evoCount-1]||m.evoCount+'차') : null;
        const nextEvoLv = (typeof MERC_EVO_THRESHOLDS!=='undefined') ? MERC_EVO_THRESHOLDS[m.evoCount||0] : null;
        return `<div style="padding:6px 0;border-top:1px solid #0a0500;${isDeployed?'opacity:0.5':''}">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:13px;text-shadow:0 0 4px ${rColor}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:13}):(m.icon)}</span>
            <span style="flex:1;font-size:9px;color:var(--text)">${isCaptain?'★ ':''}<span style="color:${rColor}">[${rarity.label}]</span> ${esc(m.name)} <span style="color:#8a7a5a">· ${arch.label} Lv.${m.level||1}</span>${evoStage?` <span style="color:#c8a96e">✦${evoStage}</span>`:''}</span>
            ${isDeployed?`<span style="font-size:8px;color:#6a8ac0">파견중</span>`:`
            <span style="font-size:8px;color:${m.loyalty>=50?'#6aca6a':'#e08030'}">충성 ${Math.round(m.loyalty)}</span>
            <span style="font-size:8px;color:#c0a030">${m.upkeep}G/턴</span>`}
          </div>
          ${m.evoDesc?`<div style="font-size:8px;color:#8a7a4a;font-style:italic;margin-bottom:3px">${esc(m.evoDesc)}</div>`:''}
          ${m.evoSkill?`<div style="font-size:8px;color:#d0b0f0;margin-bottom:3px">✦ ${esc(m.evoSkill)}</div>`:''}
          <div style="display:flex;align-items:center;gap:5px">
            <span style="font-size:8px;color:#a080d0;padding:1px 5px;background:#150a20;border:1px solid #3a1a50">${typeof getEntityIconHTML==='function'?getEntityIconHTML(trait,{size:8}):(trait.icon||"")} ${trait.label||''}</span>
            <div style="flex:1;height:4px;background:#1a1005;border-radius:2px;overflow:hidden">
              <div style="width:${xpPct}%;height:100%;background:${rColor}"></div>
            </div>
            <span style="font-size:7px;color:var(--dim)">${nextEvoLv?`Lv${nextEvoLv} 각성까지`:'각성 만렙'} ${m.xp||0}/${need}xp</span>
            ${!isDeployed?`<label style="font-size:8px;color:var(--dim);display:flex;align-items:center;gap:2px;cursor:pointer"><input type="checkbox" class="merc-deploy-chk" data-mid="${m.id}" style="margin:0"> 선택</label>`:''}
          </div>
        </div>`;
      }).join('')}

      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #1a1005">
        <div style="font-size:8px;color:var(--dim);margin-bottom:5px">${band.alignment==='criminal'?'🏴 선택한 인원 파견 (범죄)':'🗺️ 선택한 인원 파견'}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${Object.entries(getActiveMercMissions()).map(([key,mis])=>
            `<button onclick="deploySelectedMerc('${key}')" style="padding:3px 7px;background:${band.alignment==='criminal'?'#1a0a0a':'#0a0f1a'};border:1px solid ${band.alignment==='criminal'?'#5a1a1a':'#1a3a5a'};color:${band.alignment==='criminal'?'#ca6a6a':'#6a9ac0'};font-size:8px;cursor:pointer">${mis.icon} ${mis.label}</button>`
          ).join('')}
        </div>
      </div>
    </div>`;

    // 거점 건물
    (function(){
      const buildings = band.hqBuildings||{};
      html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
        <div style="font-family:Cinzel,serif;font-size:10px;color:#c8a96e;margin-bottom:6px">🏗️ 거점 건물 (${band.hqLocation||'미상'})</div>
        <div style="font-size:8px;color:var(--dim);margin-bottom:8px">거점에 건물을 지으면 용병단 운영이 편해집니다.</div>
        ${MERC_HQ_BUILDING_KEYS.map(bid=>{
          const def = MERC_HQ_BUILDINGS[bid];
          const existing = buildings[bid];
          const level = existing ? existing.level : 0;
          const isMax = level >= def.maxLevel;
          const cost = def.baseCost * (level+1);
          return `<div style="padding:6px 8px;background:#0a0805;border:1px solid #2a1f10;margin-bottom:5px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
              <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:16}):(def.icon)}</span>
              <span style="flex:1;font-size:9px;color:var(--text)">${def.name}${level>0?` <span style="color:#c8a96e">Lv.${level}</span>`:''}</span>
              ${level>0?`<button onclick="demolishMercHq('${bid}')" style="padding:2px 6px;background:#150a0a;border:1px solid #3a1515;color:#a05050;font-size:7px;cursor:pointer">철거</button>`:''}
            </div>
            <div style="font-size:8px;color:var(--dim);margin-bottom:4px">${def.desc}</div>
            ${isMax
              ? `<span style="font-size:8px;color:#6aca6a">최고 레벨</span>`
              : `<button onclick="buildMercHq('${bid}')" style="width:100%;padding:4px;background:#150f05;border:1px solid #4a3510;color:#c8a96e;font-size:8px;cursor:pointer">${level>0?'업그레이드':'건설'} (${cost}G)</button>`}
          </div>`;
        }).join('')}
      </div>`;
    })();

    // 성향(정규/범죄) 전향 카드
    const notoriety = (typeof loadMercNotoriety==='function') ? loadMercNotoriety() : 0;
    const notorietyTier = (typeof getMercNotorietyTier==='function') ? getMercNotorietyTier(notoriety) : null;
    const crimeLord = (typeof getMercCrimeLord==='function') ? getMercCrimeLord() : null;
    const conversionReq = (typeof getCrimeConversionReq==='function') ? getCrimeConversionReq() : 5;
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
      <div style="font-family:Cinzel,serif;font-size:10px;color:${band.alignment==='criminal'?'#ca6a6a':'#8a9aca'};margin-bottom:6px">${band.alignment==='criminal'?'🏴 범죄 조직':'⚖️ 정규 용병단'}</div>
      <div style="font-size:9px;color:var(--text);margin-bottom:4px">악명: ${notoriety}${notorietyTier?` — <span style="color:#ca6a6a">${notorietyTier.label}</span>`:''}</div>
      ${notorietyTier?`<div style="font-size:8px;color:var(--dim);margin-bottom:8px">${notorietyTier.desc}</div>`:''}
      ${band.alignment==='criminal' ? `
        ${(typeof canChallengeCrimeLord==='function' && canChallengeCrimeLord()) ? `
          <div style="padding:7px 8px;background:#1a0808;border:1px solid #5a1a1a;margin-bottom:6px">
            <div style="font-size:9px;color:#e08080;margin-bottom:4px">⚔️ ${crimeLord?.leaderName}(${crimeLord?.leaderTitle})에게 도전할 수 있습니다!</div>
            <button onclick="challengeCrimeLord()" style="width:100%;padding:5px;background:#2a0a0a;border:1px solid #7a2a2a;color:#f0a0a0;font-size:9px;cursor:pointer">${crimeLord?.faction} 도전하기</button>
          </div>` : `
          <div style="font-size:8px;color:var(--dim);margin-bottom:6px">${crimeLord?.faction} 도전 조건: 악명 ${getCrimeLordChallengeReq().notoriety} 이상, 상주 인원 ${getCrimeLordChallengeReq().members}명 이상</div>`}
        <button onclick="revertMercToLawful()" style="width:100%;padding:4px;background:#0a0a0a;border:1px solid #2a2a2a;color:#8a8a8a;font-size:8px;cursor:pointer">정규 노선으로 되돌리기</button>
      ` : `
        <div style="font-size:8px;color:var(--dim);margin-bottom:8px">악명이 ${conversionReq} 이상이면 용병단을 범죄 조직으로 전향시킬 수 있습니다. 악명은 게시판에 가끔 뜨는 "수상한 접촉"을 받아들이거나, 서사 중 실제로 약탈·강탈 행위를 저지르면 쌓입니다. 전향하면 더 위험하지만 보수가 큰 범죄 임무를 받게 되고, 세력을 키우면 이 시나리오의 범죄 대부(${crimeLord?.faction})에게 도전할 수 있습니다.</div>
        ${notoriety>=conversionReq
          ? `<button onclick="convertMercToCriminal()" style="width:100%;padding:5px;background:#150a0a;border:1px solid #3a1a1a;color:#ca6a6a;font-size:9px;cursor:pointer">🏴 범죄 조직으로 전향</button>`
          : `<div style="font-size:8px;color:#6a5a3a;text-align:center;padding:5px">전향에는 악명 ${conversionReq} 이상이 필요합니다 (현재 ${notoriety})</div>`}
      `}
    </div>`;

    // 파견 현황
    const deps = (typeof loadMercDeployments==='function') ? loadMercDeployments() : [];
    if(deps.length>0){
      html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
        <div style="font-family:Cinzel,serif;font-size:10px;color:#6a9ac0;margin-bottom:6px">🗺️ 파견 현황</div>
        ${deps.map(d=>{
          const mis = findMercMissionDef(d.missionKey);
          const names = band.members.filter(m=>d.memberIds.includes(m.id)).map(m=>m.name).join(', ');
          const clientTag = d.clientLabel ? `${d.clientLabel} · ` : '';
          return `<div style="font-size:9px;color:var(--text);padding:3px 0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(mis,{size:14}):(mis?.icon||'🗺️')} ${clientTag}${names} — ${mis?.label||d.missionKey} (남은 ${d.daysLeft}일)</div>`;
        }).join('')}
      </div>`;
    }

    // 의뢰 게시판 — 마을에서 들어오는 일감. 이게 진짜 수입원이다.
    if(typeof tickMercJobBoard==='function') tickMercJobBoard();
    const jobBoard = (typeof loadMercJobBoard==='function') ? loadMercJobBoard() : {jobs:[]};
    const isCrimeBand = band.alignment==='criminal';
    const boardColor = isCrimeBand ? '#ca6a6a' : '#6aca6a';
    const boardBg = isCrimeBand ? '#0a0505' : '#050a05';
    const boardBorder = isCrimeBand ? '#2a1414' : '#1a2a14';
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
      <div style="font-family:Cinzel,serif;font-size:10px;color:${boardColor};margin-bottom:4px">${isCrimeBand?'🏴 뒷골목 일감':'📜 의뢰 게시판'}</div>
      <div style="font-size:8px;color:var(--dim);margin-bottom:8px">${isCrimeBand?'뒷골목과 범죄 조직에서 들어온 일이다. 위험하지만 보수가 크고, 성공할수록 악명이 쌓인다.':'마을 곳곳에서 들어온 일감이다. 인원을 선택하고 수락하면 보수를 받는다. 용병단이 클수록 더 많은 의뢰가 들어온다.'}</div>
      ${jobBoard.jobs.length ? jobBoard.jobs.map(j=>{
        if(j.isContact){
          return `<div style="padding:6px 8px;background:#0a0810;border:1px solid #3a2a5a;margin-bottom:5px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
              <span>🕶️</span>
              <span style="flex:1;font-size:9px;color:#c0a0e0">${j.clientLabel} <span style="color:#6a5a8a">(${j.contactStage||1}/3단계)</span></span>
              <span style="font-size:8px;color:#c0a030">악명+${j.notorietyGain}</span>
            </div>
            <div style="font-size:8px;color:var(--dim);margin-bottom:5px">${j.reason}</div>
            <div style="display:flex;gap:6px">
              <button onclick="acceptMercContact('${j.id}')" style="flex:1;padding:4px;background:#150a20;border:1px solid #3a1a5a;color:#c0a0e0;font-size:8px;cursor:pointer">받아들이기</button>
              <button onclick="declineMercContact('${j.id}')" style="flex:1;padding:4px;background:#0a0a0a;border:1px solid #2a2a2a;color:#8a8a8a;font-size:8px;cursor:pointer">거절하기</button>
            </div>
          </div>`;
        }
        const mis = findMercMissionDef(j.missionKey);
        const estGold = Math.round(mis.goldPerDay * mis.days * j.payMult);
        return `<div style="padding:6px 8px;background:${boardBg};border:1px solid ${boardBorder};margin-bottom:5px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
            <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(mis,{size:16}):(mis.icon)}</span>
            <span style="flex:1;font-size:9px;color:var(--text)">${j.clientLabel} — ${mis.label}</span>
            <span style="font-size:8px;color:#c0a030">약 ${estGold}G${mis.notorietyGain?` · 악명+${mis.notorietyGain}`:''}</span>
          </div>
          <div style="font-size:8px;color:var(--dim);margin-bottom:5px">${j.reason} (최소 ${mis.minMembers}명, ${mis.days}일 소요)</div>
          <button onclick="acceptSelectedMercJob('${j.id}')" style="width:100%;padding:4px;background:${isCrimeBand?'#150a0a':'#0a150a'};border:1px solid ${isCrimeBand?'#5a1a1a':'#2a5a1a'};color:${boardColor};font-size:8px;cursor:pointer">선택한 인원으로 수락</button>
        </div>`;
      }).join('') : `<div style="font-size:9px;color:var(--dim);padding:4px 0">지금은 들어온 의뢰가 없습니다. 시간이 지나면 새로 올라옵니다.</div>`}
    </div>`;
  }

  // 흡수한 조직
  if(orgCtrl.length>0){
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#c03030;margin-bottom:6px">👑 흡수한 조직</div>
      ${orgCtrl.map(k=>`<div style="font-size:9px;color:var(--text);padding:3px 0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(CONTRACT_ORGS[k],{size:14}):(CONTRACT_ORGS[k]?.icon||'')} ${CONTRACT_ORGS[k]?.name||k} — 의뢰 비용 50% 할인 적용 중</div>`).join('')}
    </div>`;
  }

  // 조직별 의뢰 목록
  Object.entries(CONTRACT_ORGS).forEach(([orgKey, org])=>{
    const locked = karma < (org.karmaReq||0);
    const defs = CONTRACT_DEFS.filter(d=>d.org===orgKey);
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005;${locked?'opacity:0.5':''}">
      <div style="font-family:Cinzel,serif;font-size:10px;color:${org.color};margin-bottom:3px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(org,{size:10}):(org.icon)} ${org.name} ${isOrgAbsorbed(orgKey)?'<span style="font-size:8px;color:#c03030">[흡수됨]</span>':''}</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:6px">${esc(org.desc)}</div>
      ${locked?`<div style="font-size:8px;color:#aa4444">🔒 카르마(악행도) ${org.karmaReq} 이상 필요 (현재 ${karma})</div>`:
        defs.map(def=>{
          const unlocked = isContractUnlocked(def);
          const cost = isOrgAbsorbed(orgKey) ? Math.floor(def.cost*0.5) : def.cost;
          const succ = Math.round(calcContractSuccess(def)*100);
          return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid #0a0500;${unlocked?'':'opacity:0.4'}">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)}</span>
            <div style="flex:1">
              <div style="font-size:10px;color:var(--text)">${esc(def.name)}</div>
              <div style="font-size:8px;color:var(--dim)">${esc(def.desc)} · 위험도 ${def.riskLabel} · 성공률 ${succ}%</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:10px;color:#c0a030">${cost}G</div>
              <button onclick="executeContract('${def.id}')" style="padding:3px 8px;background:#1a0f00;border:1px solid #5a3a10;color:${org.color};font-size:8px;cursor:pointer;margin-top:2px" ${unlocked?'':'disabled'}>의뢰</button>
            </div>
          </div>`;
        }).join('')}
    </div>`;
  });

  // 조직 흡수 (최고 등급, 조건 충족시만 표시)
  const absorbDef = CONTRACT_DEFS.find(d=>d.id==='org_absorb');
  if(isContractUnlocked(absorbDef)){
    const succ = Math.round(calcContractSuccess(absorbDef)*100);
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005;background:#0a0005">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#c03030;margin-bottom:3px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(absorbDef,{size:10}):(absorbDef.icon)} ${absorbDef.name}</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:6px">${esc(absorbDef.desc)} · 성공률 ${succ}%</div>
      <button onclick="executeContract('${absorbDef.id}')" style="width:100%;padding:6px;background:#1a0000;border:1px solid #6a1010;color:#e04040;font-size:9px;cursor:pointer">조직 흡수 시도 (무료, 단 실패 시 관계 악화)</button>
    </div>`;
  }

  // ══════════════════════════════════════════════════════════════
  //  상단(Caravan) UI — 용병단 UI와 대칭 구조
  // ══════════════════════════════════════════════════════════════
  const cBand = loadCaravan();

  // 자발적 지원 알림
  if(S._pendingCaravanWalkIn){
    const w = S._pendingCaravanWalkIn;
    const label = w.type==='npc' ? `${w.name}이(가) 소문을 듣고 합류를 자청했습니다.` : '낯선 지원자가 합류를 청하러 왔습니다.';
    html += `<div style="padding:10px 12px;background:#0f1a0a;border-bottom:1px solid #2a5a1a">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#8aca6a;margin-bottom:5px">📢 상단 자발적 지원</div>
      <div style="font-size:9px;color:var(--text);margin-bottom:8px">${label}</div>
      <div style="display:flex;gap:6px">
        <button onclick="acceptCaravanWalkIn()" style="flex:1;padding:5px;background:#0a150a;border:1px solid #2a5a1a;color:#6aca6a;font-size:9px;cursor:pointer">받아들이기</button>
        <button onclick="declineCaravanWalkIn()" style="flex:1;padding:5px;background:#150a0a;border:1px solid #5a2a1a;color:#ca6a6a;font-size:9px;cursor:pointer">거절하기</button>
      </div>
    </div>`;
  }

  // 지명 고용
  const cHireable = (typeof getCaravanHireableNpcs==='function') ? getCaravanHireableNpcs() : [];
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">🏬 상단 — 지명 고용</div>
    <div style="font-size:8px;color:var(--dim);margin-bottom:8px">교역에 어울리는 인물을 직접 골라 급여를 제시한다. 호감도·급여가 높을수록 승낙 확률이 오른다.</div>
    ${cHireable.length ? cHireable.map(n=>{
      const rel = n.relationship!==undefined ? n.relationship : 50;
      return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-top:1px solid #0a0500">
        <span style="font-size:13px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(n,{size:13}):(n.icon||"👤")}</span>
        <span style="flex:1;font-size:9px;color:var(--text)">${esc(n.name)} <span style="color:#8a7a5a">${esc(n.role||'')}</span></span>
        <span style="font-size:8px;color:${rel>=60?'#6aca6a':'#c0a030'}">호감 ${rel}</span>
        <button onclick="const g=prompt('제시할 급여(G)를 입력하세요 (권장 30~100G):','50'); if(g)proposeCaravanHire('${esc(n.name)}', parseInt(g)||0)" style="padding:2px 7px;background:#0a0f1a;border:1px solid #1a3a5a;color:#6a9ac0;font-size:8px;cursor:pointer">제안하기</button>
      </div>`;
    }).join('') : `<div style="font-size:9px;color:var(--dim);padding:6px 0">아직 고용을 제안할 만큼 가까워진 인물이 없습니다. (호감도 30 이상 필요)</div>`}
  </div>`;

  if(!cBand.established){
    if(!cBand.members.length){
      html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005;font-size:9px;color:var(--dim);line-height:1.6">💡 아직 정식 상단이 아닙니다. 지명 고용이나 소문을 통해 사람을 하나씩 구할 수 있습니다. 7명이 모이면 정식으로 상단이 결성되어 거점을 마련하고, 파견·의뢰판 같은 본격적인 운영이 가능해집니다.</div>`;
    } else {
      const need = 7 - cBand.members.length;
      html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
        <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">🚶 모여드는 사람들 (${cBand.members.length}/7)</div>
        <div style="font-size:8px;color:var(--dim);margin-bottom:8px">아직 정식 상단은 아닙니다. ${need}명이 더 모이면 정식으로 결성되어 거점이 생기고, 파견·의뢰판·거점 건물 같은 운영이 열립니다.</div>
        ${cBand.members.map(m=>{
          const arch = CARAVAN_ARCHETYPES[m.archetype]||CARAVAN_ARCHETYPES.trader;
          const rarity = CARAVAN_RARITY[m.rarity]||CARAVAN_RARITY.common;
          const rColor = (typeof RC!=='undefined') ? (RC[m.rarity]||RC.common) : '#8a9a8a';
          return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-top:1px solid #0a0500">
            <span style="font-size:13px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:13}):(m.icon)}</span>
            <span style="flex:1;font-size:9px;color:var(--text)"><span style="color:${rColor}">[${rarity.label}]</span> ${esc(m.name)} <span style="color:#8a7a5a">· ${arch.label} Lv.${m.level||1}</span></span>
          </div>`;
        }).join('')}
      </div>`;
    }
  }

  if(cBand.members.length>0 && cBand.established){
    const cBonus = getCaravanBandBonus();
    const cBonusText = Object.entries({cha:'CHA',luk:'LUK',str:'STR',end:'END',agi:'AGI',per:'PER',int:'INT'})
      .filter(([k])=>cBonus[k]>0).map(([k,label])=>`${label}+${cBonus[k]}`).join(' ');
    const cDeployedIds = getCaravanDeployedMemberIds();
    const cResident = cBand.members.filter(m=>!cDeployedIds.has(m.id));
    const cInfluence = getCaravanInfluenceTier(cBand.members.length);
    const cHqEff = getCaravanHqEffects(cBand);
    const cRawUpkeep = cResident.reduce((s,m)=>s+m.upkeep,0);
    const cActualUpkeep = Math.round(cRawUpkeep * (1-cHqEff.upkeepDiscount));

    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span style="font-family:Cinzel,serif;font-size:10px;color:#c0a030">🏬 내 상단 (${cBand.members.length}명)</span>
        ${cInfluence?`<span style="font-size:8px;color:#c8a96e;padding:1px 6px;background:#1a1000;border:1px solid #3a2a05">${cInfluence.label}</span>`:''}
      </div>
      ${cInfluence?`<div style="font-size:8px;color:var(--dim);margin-bottom:6px">${cInfluence.desc}</div>`:''}
      <div style="font-size:8px;color:#8a7a5a;margin-bottom:6px">🏬 거점: ${cBand.hqLocation||'미상'}</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:8px">교역 보너스(상주 인원 기준): ${cBonusText||'없음'} · 매 턴 유지비 ${cActualUpkeep}G${cHqEff.upkeepDiscount>0?` (창고 할인 -${Math.round(cHqEff.upkeepDiscount*100)}%)`:''}</div>

      ${cBand.members.map(m=>{
        const arch = CARAVAN_ARCHETYPES[m.archetype]||CARAVAN_ARCHETYPES.trader;
        const trait = CARAVAN_TRAITS[m.trait]||{};
        const rarity = CARAVAN_RARITY[m.rarity]||CARAVAN_RARITY.common;
        const rColor = (typeof RC!=='undefined') ? (RC[m.rarity]||RC.common) : '#8a9a8a';
        const need = caravanXpToNext(m.level||1);
        const xpPct = Math.min(100, Math.round(((m.xp||0)/need)*100));
        const isDeployed = cDeployedIds.has(m.id);
        const isCaptain = cBand.captainId===m.id;
        const evoStage = m.evoCount ? (CARAVAN_EVO_STAGE_NAMES[m.evoCount-1]||m.evoCount+'차') : null;
        const nextEvoLv = CARAVAN_EVO_THRESHOLDS[m.evoCount||0];
        return `<div style="padding:6px 0;border-top:1px solid #0a0500;${isDeployed?'opacity:0.5':''}">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:13px;text-shadow:0 0 4px ${rColor}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:13}):(m.icon)}</span>
            <span style="flex:1;font-size:9px;color:var(--text)">${isCaptain?'★ ':''}<span style="color:${rColor}">[${rarity.label}]</span> ${esc(m.name)} <span style="color:#8a7a5a">· ${arch.label} Lv.${m.level||1}</span>${evoStage?` <span style="color:#c8a96e">✦${evoStage}</span>`:''}</span>
            ${isDeployed?`<span style="font-size:8px;color:#6a8ac0">파견중</span>`:`
            <span style="font-size:8px;color:${m.loyalty>=50?'#6aca6a':'#e08030'}">충성 ${Math.round(m.loyalty)}</span>
            <span style="font-size:8px;color:#c0a030">${m.upkeep}G/턴</span>`}
          </div>
          ${m.evoDesc?`<div style="font-size:8px;color:#8a7a4a;font-style:italic;margin-bottom:3px">${esc(m.evoDesc)}</div>`:''}
          ${m.evoSkill?`<div style="font-size:8px;color:#d0b0f0;margin-bottom:3px">✦ ${esc(m.evoSkill)}</div>`:''}
          <div style="display:flex;align-items:center;gap:5px">
            <span style="font-size:8px;color:#a080d0;padding:1px 5px;background:#150a20;border:1px solid #3a1a50">${typeof getEntityIconHTML==='function'?getEntityIconHTML(trait,{size:8}):(trait.icon||"")} ${trait.label||''}</span>
            <div style="flex:1;height:4px;background:#1a1005;border-radius:2px;overflow:hidden">
              <div style="width:${xpPct}%;height:100%;background:${rColor}"></div>
            </div>
            <span style="font-size:7px;color:var(--dim)">${nextEvoLv?`Lv${nextEvoLv} 성장까지`:'성장 만렙'} ${m.xp||0}/${need}xp</span>
            ${!isDeployed?`<label style="font-size:8px;color:var(--dim);display:flex;align-items:center;gap:2px;cursor:pointer"><input type="checkbox" class="caravan-deploy-chk" data-mid="${m.id}" style="margin:0"> 선택</label>`:''}
          </div>
        </div>`;
      }).join('')}

      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #1a1005">
        <div style="font-size:8px;color:var(--dim);margin-bottom:5px">🐪 선택한 인원 파견</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${Object.entries(CARAVAN_MISSIONS).map(([key,mis])=>
            `<button onclick="deploySelectedCaravan('${key}')" style="padding:3px 7px;background:#0a0f1a;border:1px solid #1a3a5a;color:#6a9ac0;font-size:8px;cursor:pointer">${mis.icon} ${mis.label}</button>`
          ).join('')}
        </div>
      </div>
    </div>`;

    // 거점 건물
    (function(){
      const buildings = cBand.hqBuildings||{};
      html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
        <div style="font-family:Cinzel,serif;font-size:10px;color:#c8a96e;margin-bottom:6px">🏗️ 상단 거점 건물 (${cBand.hqLocation||'미상'})</div>
        <div style="font-size:8px;color:var(--dim);margin-bottom:8px">거점에 건물을 지으면 상단 운영이 편해집니다.</div>
        ${CARAVAN_HQ_BUILDING_KEYS.map(bid=>{
          const def = CARAVAN_HQ_BUILDINGS[bid];
          const existing = buildings[bid];
          const level = existing ? existing.level : 0;
          const isMax = level >= def.maxLevel;
          const cost = def.baseCost * (level+1);
          return `<div style="padding:6px 8px;background:#0a0805;border:1px solid #2a1f10;margin-bottom:5px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
              <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:16}):(def.icon)}</span>
              <span style="flex:1;font-size:9px;color:var(--text)">${def.name}${level>0?` <span style="color:#c8a96e">Lv.${level}</span>`:''}</span>
              ${level>0?`<button onclick="demolishCaravanHq('${bid}')" style="padding:2px 6px;background:#150a0a;border:1px solid #3a1515;color:#a05050;font-size:7px;cursor:pointer">철거</button>`:''}
            </div>
            <div style="font-size:8px;color:var(--dim);margin-bottom:4px">${def.desc}</div>
            ${isMax
              ? `<span style="font-size:8px;color:#6aca6a">최고 레벨</span>`
              : `<button onclick="buildCaravanHq('${bid}')" style="width:100%;padding:4px;background:#150f05;border:1px solid #4a3510;color:#c8a96e;font-size:8px;cursor:pointer">${level>0?'업그레이드':'건설'} (${cost}G)</button>`}
          </div>`;
        }).join('')}
      </div>`;
    })();

    // 파견 현황
    const cDeps = loadCaravanDeployments();
    if(cDeps.length>0){
      html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
        <div style="font-family:Cinzel,serif;font-size:10px;color:#6a9ac0;margin-bottom:6px">🐪 파견 현황</div>
        ${cDeps.map(d=>{
          const mis = findCaravanMissionDef(d.missionKey);
          const names = cBand.members.filter(m=>d.memberIds.includes(m.id)).map(m=>m.name).join(', ');
          const clientTag = d.clientLabel ? `${d.clientLabel} · ` : '';
          return `<div style="font-size:9px;color:var(--text);padding:3px 0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(mis,{size:14}):(mis?.icon||'🐪')} ${clientTag}${names} — ${mis?.label||d.missionKey} (남은 ${d.daysLeft}일)</div>`;
        }).join('')}
      </div>`;
    }

    // 의뢰 게시판
    if(typeof tickCaravanJobBoard==='function') tickCaravanJobBoard();
    const cJobBoard = loadCaravanJobBoard();
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#6aca6a;margin-bottom:4px">📜 상단 의뢰 게시판</div>
      <div style="font-size:8px;color:var(--dim);margin-bottom:8px">마을 곳곳에서 들어온 교역 일감이다. 인원을 선택하고 수락하면 보수를 받는다.</div>
      ${cJobBoard.jobs.length ? cJobBoard.jobs.map(j=>{
        const mis = findCaravanMissionDef(j.missionKey);
        const estGold = Math.round(mis.goldPerDay * mis.days * j.payMult);
        return `<div style="padding:6px 8px;background:#050a05;border:1px solid #1a2a14;margin-bottom:5px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
            <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(mis,{size:16}):(mis.icon)}</span>
            <span style="flex:1;font-size:9px;color:var(--text)">${j.clientLabel} — ${mis.label}</span>
            <span style="font-size:8px;color:#c0a030">약 ${estGold}G</span>
          </div>
          <div style="font-size:8px;color:var(--dim);margin-bottom:5px">${j.reason} (최소 ${mis.minMembers}명, ${mis.days}일 소요)</div>
          <button onclick="acceptSelectedCaravanJob('${j.id}')" style="width:100%;padding:4px;background:#0a150a;border:1px solid #2a5a1a;color:#6aca6a;font-size:8px;cursor:pointer">선택한 인원으로 수락</button>
        </div>`;
      }).join('') : `<div style="font-size:9px;color:var(--dim);padding:4px 0">지금은 들어온 의뢰가 없습니다. 시간이 지나면 새로 올라옵니다.</div>`}
    </div>`;
  }

  html += `<div style="padding:8px 12px;text-align:center"><button onclick="renderContractsPanel()" style="padding:5px 14px;background:#0a0500;border:1px solid #3a1a05;color:#5a3a1a;font-size:8px;font-family:Cinzel,serif;cursor:pointer">🔄 새로고침</button></div>`;

  body.innerHTML = html;
}
window.renderContractsPanel = renderContractsPanel;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_225(){
window.getTerrainBonus = function(statKey){
  // [BUG FIX] S._terrainPenalty[statKey]도 이미 음수로 저장돼 있다.
  // "tb - tp"로 계산하면 음수를 한 번 더 빼서 페널티가 보너스로
  // 뒤집히는 동일한 부호 오류가 발생했다 — 더하기로 수정.
  const tb = (S._terrainBonus && S._terrainBonus[statKey]) || 0;
  const tp = (S._terrainPenalty && S._terrainPenalty[statKey]) || 0;
  return tb + tp;
};

const _origUseWdrSkill2=window.useWdrSkill;

if(typeof _origUseWdrSkill2==='function'){
  window.useWdrSkill=function(id){
    if(isSkillOnCooldown(id)){ toast(`⏳ 쿨다운 중 (${getSkillCooldownRemaining(id)}턴 남음)`,2000); return; }
    const r=_origUseWdrSkill2.call(this,id);
    applySkillCooldown(id);
    return r;
  };
}
}

