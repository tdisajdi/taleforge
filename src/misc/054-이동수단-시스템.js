// 🚀 이동수단 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { pmLoad, pmSave } from '../core/267-저장로드초기화.js';
import { BOSS_MONSTERS, COMPANION_TYPE_DATA, GENERIC_MONSTER_SUFFIXES, RELICS, REPUTATION_LEVELS, SKILL_COMBOS, TRANSPORT_CONFIG, TRANSPORT_DEST_HINTS } from '../data/054-이동수단-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RC } from '../data/086-퀘스트임무-수락-팝업-시스템.js';
import { loadInventory, rollLoot, saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { tickSoulWeaponBossKill } from '../items/218-15-인벤토리-addItem-removeItem.js';
import { saveSkills } from '../job/002-스킬-시스템.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { getStatInfo, loadTitles } from '../job/010-스킬-강화-시스템.js';
import { loadJobActions, loadMainQuestState } from '../job/042-직업-시스템-무한-파생-도감.js';
import { getCompanionBuffs } from '../npc/031-NEW-NPC-성장-시스템-동료-레벨업-버프.js';
import { loadStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { addBardVerse } from '../progression/018-5170번-환생-누적-시스템.js';
import { loadDemonCorruption } from '../progression/020-101130번-환생-누적-시스템.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { getSituationBucketKey, getWorldCrisisLevel, pickLearnedSituationExample, showBossEntrance } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { _onArriveAtDemesne, _onDepartDemesne } from '../race/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js';
import { applyStatusEffect, getActiveEffects } from '../ui/155-⑭-메모리-패널-UI.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { getLocationPowerScale, loadCurrentLocation, renderLocationPanel, saveCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { loadGSFlags } from '../world/145-⑥-세계-상태-DB.js';
import { recordTransportTimeCost } from '../world/214-11-날씨-자동-순환.js';
import { loadNPCs, saveNPCs } from './001-block0-preamble.js';
import { gainExpFromKill, getAllSkillDefs, loadJobSkills, saveJobSkills } from './009-레벨업-스탯-포인트-배분-시스템.js';

window.TRANSPORT_CONFIG = TRANSPORT_CONFIG;

export function openTransportPanel(transportType){
  const t = TRANSPORT_CONFIG[transportType] || TRANSPORT_CONFIG.walk;
  const hints = TRANSPORT_DEST_HINTS[transportType] || TRANSPORT_DEST_HINTS.walk;
  const allLocs = window.getAllLocations();
  const currentLoc = loadCurrentLocation();

  // [v14] 선박 출항 제약 — 현재 위치 자체가 해안/항구가 아니면 선박을
  // 탈 수 없다(바다 한가운데서 배를 띄울 수는 없으므로).
  if(t.requiresCoastal && !currentLoc?.coastal){
    const body = document.getElementById('pb-location');
    if(body) body.innerHTML = `
      <div style="padding:14px;background:#1a0805;border:1px solid #a05040;margin-bottom:10px;text-align:center">
        <div style="font-size:24px;margin-bottom:6px">⚠️</div>
        <div style="font-size:11px;color:#e09070;margin-bottom:4px">이곳은 해안이나 항구가 아닙니다.</div>
        <div style="font-size:9px;color:var(--dim)">${t.name}을 타려면 해안 마을이나 항구 도시로 먼저 이동해야 합니다.</div>
        <button class="btn btn-dark" style="width:100%;margin-top:10px;font-size:10px" onclick="renderLocationPanel()">← 돌아가기</button>
      </div>`;
    return;
  }

  // 목적지 필터: 선박은 해안/항구만, 육로·비행 탑승물은 해안 지역 제외
  // (해안 지역은 배로만 간다 — 여행 지도·세계지도와 같은 규칙). 마법진
  // 순간이동만 예외 — "거리·지형과 무관하게 어디든" 즉시 이동이 그
  // 자체로 존재 이유이므로 해안 지역도 그대로 목적지가 될 수 있다.
  const destFilter = t.isTeleport
    ? null
    : t.requiresSeaAccess
      ? (l => l.seaAccess)
      : t.requiresCoastal
        ? (l => l.coastal)
        : (l => !l.coastal);
  const eligibleLocs = destFilter ? allLocs.filter(destFilter) : allLocs;

  // 추천 목적지: 해당 이동수단에 맞는 대륙 장소 우선 표시
  const recommended = eligibleLocs.filter(l => hints.continents.includes(l.continent));
  const others = eligibleLocs.filter(l => !hints.continents.includes(l.continent));
  const currentId = currentLoc?.id;

  const renderLocBtn = (loc) => {
    const isCurrent = loc.id === currentId;
    const contLabel = {central:'🏰중앙',north:'❄️북',west:'⚓서',south:'🌴남',east:'🌸동',northeast:'🌿북동',southeast:'🌑남동',northwest:'⚙️북서'}[loc.continent]||'';
    return `<div onclick="${isCurrent?'':(`travelByTransport('${loc.name.replace(/'/g,"\\'")}','${transportType}')`
    )}" style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:${isCurrent?'#1a1805':'#0d0800'};border:1px solid ${isCurrent?'var(--gold)':'var(--border)'};margin-bottom:3px;cursor:${isCurrent?'default':'pointer'};border-radius:1px">
      <span style="font-size:16px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:16}):loc.icon}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;color:${isCurrent?'var(--gold)':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(loc.name)} ${isCurrent?'<span style="font-size:8px;color:#60a060">◀현재</span>':''}${loc.coastal?' <span style="font-size:8px;color:#4a9ac0">🌊</span>':''}</div>
        <div style="font-size:9px;color:var(--dim)">${contLabel} · ${loc.desc?.slice(0,28)||''}…</div>
      </div>
    </div>`;
  };

  const body = document.getElementById('pb-location');
  if(!body) return;
  body.innerHTML = `
    <div style="padding:10px;background:#1a1005;border:1px solid var(--gold);margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="color:var(--gold);display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(t,{size:16}):(t.svgIcon||t.icon)}</span>
        <div>
          <div style="font-family:Cinzel,serif;font-size:13px;color:var(--gold)">${t.name} 이동</div>
          <div style="font-size:10px;color:var(--dim)">${t.desc}</div>
        </div>
      </div>
      <div style="font-size:10px;color:#6a9a6a;padding:5px 8px;background:#050200;border-radius:2px">💡 ${hints.hint}</div>
    </div>
    ${recommended.length>0?`
    <div style="font-family:Cinzel,serif;font-size:9px;color:${t.color||'var(--gold)'};margin-bottom:5px;letter-spacing:1px">✦ 추천 목적지 (${recommended.length}곳)</div>
    ${recommended.map(renderLocBtn).join('')}`:''}
    ${others.length>0?`
    <div style="font-family:Cinzel,serif;font-size:9px;color:var(--dim);margin:8px 0 5px;letter-spacing:1px">기타 목적지 (${others.length}곳)</div>
    ${others.map(renderLocBtn).join('')}`:''}
    ${(destFilter && eligibleLocs.length===0)?`<div style="padding:10px;text-align:center;font-size:10px;color:var(--dim)">이 수단으로 갈 수 있는 곳이 아직 발견되지 않았습니다.</div>`:''}
    <button class="btn btn-dark" style="width:100%;margin-top:10px;font-size:10px" onclick="renderLocationPanel()">← 돌아가기</button>
  `;
}
window.openTransportPanel = openTransportPanel;

export function travelByTransport(locName, transportType){
  const allLocs = (typeof window.getAllTravelableLocations==='function') ? window.getAllTravelableLocations() : window.getAllLocations();
  const loc = allLocs.find(l=>l.name===locName);
  if(!loc) return;
  const t = TRANSPORT_CONFIG[transportType]||TRANSPORT_CONFIG.walk;
  const prevLoc = loadCurrentLocation();

  // [v13] 텔레포트는 재사용 쿨다운이 있다 — 막대한 비용과 재시전 시간을
  // 반영. 쿨다운 중이면 이동 자체를 막는다.
  if(t.isTeleport && typeof isTeleportOnCooldown==='function' && isTeleportOnCooldown()){
    toast(`🌀 마법진이 아직 재충전 중입니다 — ${getTeleportCooldownRemaining()}턴 후 다시 사용할 수 있습니다.`, 3500);
    return;
  }

  // [v14] 선박 출항 제약 재검증(목적지 클릭 시점에도 한 번 더 — 패널을
  // 열어둔 채 다른 곳으로 이동했을 가능성 방지) + 매번 임대료 지불.
  // 말 등급도 같은 방식으로 매번 임대료가 든다(소유 자산이 아니라 그
  // 자리에서 빌리는 것 — 단, 보유 중인 '내 말' 아이템이 있다면 무료).
  if(t.requiresCoastal && !prevLoc?.coastal){
    toast(`⚠️ 이곳은 해안/항구가 아니라 ${t.name}을 띄울 수 없습니다.`, 3000);
    return;
  }
  if(t.requiresSeaAccess && !loc.seaAccess){
    toast(`⚠️ ${loc.name}은(는) 대형 선박이 정박할 수 있는 항구가 아닙니다.`, 3000);
    return;
  }

  const rentalCost = (typeof getTransportRentalCost==='function') ? getTransportRentalCost(transportType, prevLoc, loc) : 0;
  if(rentalCost > 0){
    const ownsMount = (typeof ownsPersonalMount==='function') && ownsPersonalMount(transportType);
    if(!ownsMount){
      if((S.gold||0) < rentalCost){
        toast(`💰 ${t.name} 임대료(${rentalCost}G)가 부족합니다.`, 3000);
        return;
      }
      S.gold -= rentalCost;
      if(typeof saveGold==='function') saveGold(S.gold);
      if(typeof window.updateHeader==='function') window.updateHeader();
      toast(`💰 ${t.name} 임대료 ${rentalCost}G 지불`, 2200);
    }
  }

  // [11차 수정] 예전엔 탑승 수단 종류와 무관하게 여기서 바로 순간이동시켰다
  // — TRANSPORT_CONFIG에 정의된 speedMult(말 등급별 속도)·encounterMult
  // (탑승 수단별 안전도)가 실제로는 단 한 줄도 쓰이지 않는 죽은 수치였던
  // 것. 배(requiresCoastal/requiresSeaAccess)·마법진(isTeleport)만 그
  // 자체가 "즉시 도착"이 본질이라 순간이동을 유지하고, 그 외(도보~명마,
  // 그리핀~와이번)는 실제 여행 시스템(startLandTravel → 매 턴
  // tickLandTravel)에 태운다 — 이제 명마를 타면 진짜 더 빨리 도착하고,
  // 그리핀을 타면 도로 유무와 무관하게 최고속으로 날아가며 지상 조우도
  // 건너뛴다(둘 다 getTravelDays/tickLandTravel에서 처리).
  S._activeTransport = transportType;
  if(typeof recordTransportTimeCost==='function') recordTransportTimeCost(transportType);
  if(t.isTeleport && typeof markTeleportUsed==='function') markTeleportUsed();
  if(t.isAir && typeof tryAirEncounter==='function') setTimeout(()=>tryAirEncounter(transportType), 100);

  if(!t.isTeleport && !t.requiresCoastal && !t.requiresSeaAccess && typeof window.startLandTravel==='function'){
    toast(`${t.name}을(를) 타고 ${loc.icon} ${loc.name}을(를) 향해 출발합니다.`, 2800, t);
    window.startLandTravel(loc.name, transportType);
    if(typeof closeP==='function') closeP('location');
    return;
  }

  // 배·마법진 — 기존처럼 즉시 이동
  window.currentLocation = loc;
  saveCurrentLocation(loc);
  if(loc.isDemesne){ _onArriveAtDemesne(loc, t); }
  else if(prevLoc?.isDemesne){ _onDepartDemesne(prevLoc); }
  const visited = loadLocations();
  if(!visited.find(v=>v.name===loc.name)){
    visited.push({ name:loc.name, icon:loc.icon, visitedAt:new Date().toISOString(), turn:S.msgCount });
    saveLocations(visited);
  }

  toast(`${t.name}으로 ${loc.icon} ${loc.name}에 도착했습니다!`, 2800, t);
  renderLocationPanel();
}
window.travelByTransport = travelByTransport;

export function renderTransportBar(){
  const vehicles = [
    { type:'horse_draft', label:'짐말' },
    { type:'horse', label:'준마' },
    { type:'horse_war', label:'군마' },
    { type:'horse_noble', label:'명마' },
    { type:'carriage', label:'마차' },
    { type:'boat', label:'선박' },
    { type:'ship', label:'대형선' },
  ];
  // [v13] 비행/마법 탑승물 — 소유했을 때만 활성 버튼으로 노출.
  // 소유 여부는 ownedMounts(인벤토리에 해당 탑승 계약 아이템을 가졌는지)로 판정.
  const owned = (typeof getOwnedSpecialMounts==='function') ? getOwnedSpecialMounts() : [];
  const specialVehicles = [
    { type:'griffin', label:'그리핀' },
    { type:'pegasus', label:'페가수스' },
    { type:'wyvern', label:'와이번' },
    { type:'teleport', label:'마법진' },
  ].filter(v=>owned.includes(v.type));

  return `<div style="margin-bottom:10px">
    <div style="font-family:Cinzel,serif;font-size:9px;color:var(--dim);margin-bottom:5px;letter-spacing:1px">🚀 이동수단 선택</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px">
      ${vehicles.map(v=>{
        const tc = TRANSPORT_CONFIG[v.type];
        return `<button class="btn btn-dark" style="padding:5px 8px;font-size:9px;flex:1;min-width:60px" onclick="openTransportPanel('${v.type}')">${tc.icon} ${v.label}</button>`;
      }).join('')}
    </div>
    ${specialVehicles.length?`
      <div style="font-family:Cinzel,serif;font-size:8px;color:#a070d0;margin:6px 0 4px;letter-spacing:1px">✨ 보유한 특수 탑승물</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${specialVehicles.map(v=>{
          const tc = TRANSPORT_CONFIG[v.type];
          return `<button class="btn btn-dark" style="padding:5px 8px;font-size:9px;flex:1;min-width:60px;border-color:${tc.color}66;color:${tc.color}" onclick="openTransportPanel('${v.type}')">${tc.icon} ${v.label}</button>`;
        }).join('')}
      </div>
    `:''}
  </div>`;
}
window.renderTransportBar = renderTransportBar;

window.comboState = { count:0, lastTurn:0, maxCombo:0 };

export function updateCombo(isSuccess, isCritSuccess){
  if(isSuccess){
    window.comboState.count++;
    window.comboState.lastTurn = S.msgCount;
    if(window.comboState.count > window.comboState.maxCombo){
      window.comboState.maxCombo = window.comboState.count;
      window.updateStats('maxCombo', window.comboState.count, 'max');
    }
    // 콤보 보너스
    if(window.comboState.count >= 3){
      const bonus = Math.floor(window.comboState.count * 2);
      toast(`⚡ ${window.comboState.count}콤보! 다음 판정 +${bonus}`, 1800);
      S._comboBonus = bonus;
    }
    if(window.comboState.count === 5)  { toast('🔥 5연속 성공! 보너스 판정 +10', 2500); S._comboBonus = (S._comboBonus||0) + 10; }
    if(window.comboState.count === 10) { toast('💫 10콤보! 전설 달성!', 3000); unlockAchievement('combo_10'); }
  } else {
    if(window.comboState.count >= 3) toast(`💔 ${window.comboState.count}콤보 종료`, 1500);
    window.comboState.count = 0;
    S._comboBonus = 0;
  }
}
window.updateCombo = updateCombo;

export function classifyMonsterNamed(name, isBoss){
  if(isBoss) return true;
  const n = (name||'').trim();
  if(!n) return false;
  // 종족명 그대로(접미사와 정확히 일치하거나, "검은 늑대"처럼 수식어+종족명뿐인 경우)는 잡몹
  const isGenericExact = GENERIC_MONSTER_SUFFIXES.includes(n);
  // 종족명으로 끝나면서 전체 길이가 짧은 경우(수식어 1~2글자 정도)도 잡몹으로 간주
  const endsWithGeneric = GENERIC_MONSTER_SUFFIXES.some(s => n.endsWith(s) && n.length <= s.length + 2);
  if(isGenericExact || endsWithGeneric) return false;
  return true; // 고유명사가 포함된 이름 → 네임드
}
window.classifyMonsterNamed = classifyMonsterNamed;

export const RESISTABLE_EFFECTS = new Set(['poison','burn','freeze','curse','berserk']);

export function calcPstxResist(pstx){
  // 완전 저항 확률: pstx * 0.22% (최대 50%)
  const fullResist  = Math.min(0.50, pstx * 0.0022);
  // 부분 저항 확률: pstx * 0.30% (완전저항 초과분, 최대 55% 누적)
  const partResist  = Math.min(0.55, pstx * 0.0030) - fullResist;
  return { fullResist: Math.max(0, fullResist), partResist: Math.max(0, partResist) };
}
window.calcPstxResist = calcPstxResist;

export function renderStatusBar(){
  // [BUG FIX] loadStatusEffects()가 객체를 반환하는데 배열 메서드(.map)를 호출하던
  // 버그. getActiveEffects('player')로 player 전용 배열을 가져오도록 수정.
  const effects = (typeof getActiveEffects==='function') ? getActiveEffects('player') : [];
  const bar = document.getElementById('status-effect-bar');
  if(!bar) return;
  // pstx 수치 표시 (60 이상일 때만)
  const pstxVal = Math.round(S.stats?.pstx || 50);
  const pstxChip = pstxVal >= 60
    ? `<span style="padding:2px 6px;background:#1a4a2a;border:1px solid #2ecc7166;border-radius:3px;font-size:9px;color:#2ecc71;font-family:Cinzel,serif" title="상태저항 ${pstxVal}">🧬저항 ${pstxVal}</span>`
    : '';
  bar.innerHTML = pstxChip + effects.map(eff=>{
    const def = window.STATUS_EFFECTS[eff.id];
    if(!def) return '';
    const weakTag = eff.weakened ? '〔약화〕' : '';
    const color = eff.weakened ? def.color+'aa' : def.color;
    return `<span style="padding:2px 6px;background:${color}22;border:1px solid ${color}66;border-radius:3px;font-size:9px;color:${color};font-family:Cinzel,serif">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:9}):(def.icon)}${def.name}${weakTag}(${eff.remaining})</span>`;
  }).join('');
}
window.renderStatusBar = renderStatusBar;

export function detectStatusEffects(aiText){
  const t = aiText || '';
  // 중독: 직접적인 피해/상태이상 표현만. 단순 "독" 단어 절대 금지
  if(/중독(됐|되었|에 걸|상태|이 퍼|이 번)/.test(t) ||
     /독(침에|액이 스며|기운이 온몸|안개가 덮|이 온몸에 퍼)/.test(t)) {
    applyStatusEffect('poison');
  }
  // 화상: 직접 타거나 그을리는 표현
  if(/화상(을 입|이 번|이 퍼|으로 괴)/.test(t) || /불꽃에\s*(휩싸|타오|덮|그을)/.test(t)) applyStatusEffect('burn');
  // 빙결: 얼어붙어 행동 불가 표현
  if(/빙결(됐|되었|에 걸|상태)/.test(t) || /얼어붙(어 버|어 몸이|어 꼼짝)/.test(t)) applyStatusEffect('freeze');
  // 저주: 저주를 명시적으로 받는 맥락
  if(/저주(를 받|에 걸|가 깃들|가 내려|가 발동|이 발동)/.test(t) || /마법에 걸(렸|려)/.test(t)) applyStatusEffect('curse');
  // 축복: 신/빛의 가호를 받는 맥락
  if(/축복(을 받|이 내려|이 깃들|이 임하|받았)/.test(t) || /신의 가호/.test(t)) applyStatusEffect('blessed');
  // 재생: 회복 기운이 발동하는 맥락
  if(/재생(이 발동|의 기운|력이 활성|이 시작)/.test(t) || /회복 기운이/.test(t)) applyStatusEffect('regen');
}
window.detectStatusEffects = detectStatusEffects;

export const BOSS_HP_KEY = 'tf-boss-hp-cache';

export function loadBossHp(){ try{ return JSON.parse(lsGet(BOSS_HP_KEY)||'{}'); }catch(e){ return {}; } }
window.loadBossHp = loadBossHp;

export function saveBossHp(d){ try{ lsSet(BOSS_HP_KEY, JSON.stringify(d||{})); }catch(e){} }
window.saveBossHp = saveBossHp;

window.loadBossHp = loadBossHp;

window.saveBossHp = saveBossHp;

export const BOSS_KEY = 'tf-boss-state';

export function loadBossState(){ try{ return JSON.parse(lsGet(BOSS_KEY)||'{}'); }catch(e){ return {}; } }
window.loadBossState = loadBossState;

export function saveBossState(d){ try{ lsSet(BOSS_KEY, JSON.stringify(d)); }catch(e){} }
window.saveBossState = saveBossState;

export function getEnemyScaleMultiplier(){
  try{
    const lv    = (typeof loadPlayerLevel === 'function') ? (loadPlayerLevel() || 1) : 1;
    const cycle = (typeof loadCycleCount  === 'function') ? (loadCycleCount()  || 0) : 0;

    // 레벨 배율 — 제곱근 곡선 (레벨 1 = 1.0, 레벨 25 = 약 1.8, 레벨 100 = 약 3.0)
    const levelMult = 1 + (Math.sqrt(Math.max(0, lv - 1)) * 0.2);

    // 회차 배율 — 회차당 +12%, 단 최대 3배까지만 (무한 폭증 방지)
    const cycleMult = Math.min(3.0, 1 + cycle * 0.12);

    // [신규] 세계 위기도 배율 — 위기가 심해질수록 도적/몬스터가 더 강하고
    // 위협적으로 느껴지게 함 (최대 +30%). 전투직이든 비전투직이든 위기
    // 단계에서 마주치는 적이 더 거세지는 걸 체감하게 만든다.
    const crisis = (typeof getWorldCrisisLevel === 'function') ? getWorldCrisisLevel() : 0;
    const crisisMult = 1 + (crisis / 100) * 0.3;

    // [시스템 정리] 예전엔 여기서 dangerLevel(1~6)만 보고 독자적인 배율을
    // 계산했는데, 이러면 dangerLevel이 아예 없는 장소(마을·도시·수도 105개
    // 중 63개, 특히 수도 3곳 전부)는 전부 중간값(3) 취급되어 "수도인데
    // 초반 마을과 몬스터 강도가 똑같은" 결함이 있었다. 이제 장소 레벨대
    // 기반의 공용 배율 함수(getLocationPowerScale — dangerLevel/type을
    // 모두 반영하고, autoDetectAndRegisterEnemy·checkRandomEncounter 등
    // 게임 전역이 같은 기준을 쓰게 통일한 함수)로 교체한다.
    const curLocForScale = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    const dangerMult = (typeof getLocationPowerScale==='function') ? getLocationPowerScale(curLocForScale) : 1;

    // [이번 생의 목표 난이도] 캐릭터 생성 때 고른 목표가 어려울수록(목표별 難度 합계,
    // S._goalDifficulty — misc/261 doStartChat 훅에서 설정) 이번 생의 적이 더 강해진다.
    // 난도 1점당 +5%, 최대 +30%로 캡을 두어 과도한 폭증은 막는다.
    const goalMult = 1 + Math.min(0.3, (S._goalDifficulty||0) * 0.05);

    return { levelMult, cycleMult, crisisMult, dangerMult, goalMult, total: levelMult * cycleMult * crisisMult * dangerMult * goalMult };
  }catch(e){ return { levelMult: 1, cycleMult: 1, crisisMult: 1, dangerMult: 1, goalMult: 1, total: 1 }; }
}
window.getEnemyScaleMultiplier = getEnemyScaleMultiplier;

window.getEnemyScaleMultiplier = getEnemyScaleMultiplier;

export const PLAYER_BASE_HP = 100;

export const PLAYER_BASE_MP = 100;

export function getPlayerMaxHp(){
  try{
    const lv = (typeof loadPlayerLevel === 'function') ? (loadPlayerLevel() || 1) : 1;
    const levelMult = 1 + (Math.sqrt(Math.max(0, lv - 1)) * 0.2);
    // END(체력) 스탯도 소폭 반영 — 같은 레벨이라도 체력에 투자한
    // 캐릭터는 조금 더 튼튼하게(기본 50 대비 편차의 최대 30% 가산)
    const endBonus = 1 + Math.max(-0.2, Math.min(0.3, ((S.stats?.end||50) - 50) / 200));
    return Math.round(PLAYER_BASE_HP * levelMult * endBonus);
  }catch(e){ return PLAYER_BASE_HP; }
}
window.getPlayerMaxHp = getPlayerMaxHp;

export function getPlayerMaxMp(){
  try{
    const lv = (typeof loadPlayerLevel === 'function') ? (loadPlayerLevel() || 1) : 1;
    const levelMult = 1 + (Math.sqrt(Math.max(0, lv - 1)) * 0.2);
    const mgcBonus = 1 + Math.max(-0.2, Math.min(0.3, ((S.stats?.mgc||50) - 50) / 200));
    return Math.round(PLAYER_BASE_MP * levelMult * mgcBonus);
  }catch(e){ return PLAYER_BASE_MP; }
}
window.getPlayerMaxMp = getPlayerMaxMp;

window.getPlayerMaxHp = getPlayerMaxHp;

window.getPlayerMaxMp = getPlayerMaxMp;

export function calcMonsterAttackDamage(monster){
  try{
    const baseAtk = monster?.atk || 10;
    // 이미 소환/스폰 시점에 atk가 스케일링되어 저장된 경우가 많으므로
    // (예: boss_lich가 처음엔 28이었다가 스폰 시 48로 스케일링됨),
    // 여기서 다시 전체 배율을 곱하면 이중 스케일링이 된다. 그래서
    // "방어력 경감"과 "판정 편차"만 이 함수의 역할로 한정한다.
    const endDef = (S.stats?.end || 50);
    // 방어력 경감 — END 50 기준 0%, END가 높을수록 최대 35%까지 경감,
    // END가 낮으면 오히려 최대 20%까지 더 받음
    const defenseMult = Math.max(0.65, Math.min(1.2, 1 - (endDef - 50) / 220));
    // 판정 편차 — 매번 완전히 같은 숫자만 나오면 기계적으로 느껴지므로
    // ±15% 랜덤 편차를 둔다(치명타/헛스윙 같은 자연스러운 변동감)
    const variance = 0.85 + Math.random() * 0.3;
    const dmg = Math.max(1, Math.round(baseAtk * defenseMult * variance));
    return dmg;
  }catch(e){ return 10; }
}
window.calcMonsterAttackDamage = calcMonsterAttackDamage;

window.calcMonsterAttackDamage = calcMonsterAttackDamage;

export function processEnemyAttacksGS(gs){
  if (!Array.isArray(gs?.enemy_attacks) || gs.enemy_attacks.length === 0) return;
  S._tookDamageThisCombat = true; // [B67 FIX] "무상처 전사" 도전 과제용 플래그
  try{
    const monsters = (typeof loadMonsters === 'function') ? (loadMonsters() || []) : [];
    let totalDmg = 0;
    const hits = [];
    gs.enemy_attacks.forEach(name => {
      if (!name) return;
      const m = monsters.find(x => x.name && x.name.includes(String(name).slice(0, 4)) && x.status === 'alive');
      if (!m) return;
      const dmg = calcMonsterAttackDamage(m);
      totalDmg += dmg;
      hits.push({ name: m.name, dmg });
    });
    if (totalDmg > 0 && S.stats) {
      S.stats.hp = Math.max(0, (S.stats.hp || 0) - totalDmg);
      hits.forEach(h => { if (typeof toast === 'function') toast(`💢 ${h.name}의 공격! -${h.dmg} HP`, 2200); });
    }
  }catch(e){ console.warn('processEnemyAttacksGS 오류:', e); }
}
window.processEnemyAttacksGS = processEnemyAttacksGS;

window.processEnemyAttacksGS = processEnemyAttacksGS;

export function getActiveEnemyAtk(){
  try{
    let best = 0;
    const monsters = (typeof loadMonsters === 'function') ? (loadMonsters() || []) : [];
    monsters.forEach(m => { if (m.status === 'alive' && (m.atk || 0) > best) best = m.atk || 0; });
    const bossState = (typeof loadBossState === 'function') ? (loadBossState() || {}) : {};
    Object.values(bossState).forEach(b => {
      if (b && typeof b === 'object' && b.active && (b.atk || 0) > best) best = b.atk || 0;
    });
    return best > 0 ? best : 10; // 전투 중인 적을 못 찾으면 기본값 10(경미한 피해)
  }catch(e){ return 10; }
}
window.getActiveEnemyAtk = getActiveEnemyAtk;

window.getActiveEnemyAtk = getActiveEnemyAtk;

export function calcAllyAttackDamage(){
  try{
    const atk = getActiveEnemyAtk();
    const variance = 0.85 + Math.random() * 0.3;
    return Math.max(1, Math.round(atk * 0.9 * variance));
  }catch(e){ return 10; }
}
window.calcAllyAttackDamage = calcAllyAttackDamage;

window.calcAllyAttackDamage = calcAllyAttackDamage;

export function defeatBoss(bossId){
  const sid = S.scenario?.id||'medieval';
  const bosses = BOSS_MONSTERS[sid]||BOSS_MONSTERS.medieval;
  const boss = bosses.find(b=>b.id===bossId);
  if(!boss) return;
  const bossState = loadBossState();
  bossState[bossId] = 'defeated';
  saveBossState(bossState);
  unlockAchievement('boss_defeat');
  // 드롭 아이템 (보스 전용 + 랜덤 루트)
  if(boss.drops){
    boss.drops.forEach(item=>{
      const inv = [...(S.inventory||[]), item];
      saveInventory(inv); S.inventory=inv;
      toastHTML(`🎁 드롭: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon)} ${esc(item.name)}`, 3000);
    });
  }
  // 추가 랜덤 루트
  const extraLoot = rollLoot(10, true);
  extraLoot.forEach(item=>{
    S.inventory.push(item); saveInventory(S.inventory);
    toastHTML(`🎁 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon)} ${esc(item.name)} 드롭!`, 2500);
  });
  S.gold += 200; saveGold(S.gold); window.updateHeader();
  toast(`🏆 보스 처치! ${boss.name} 격파! 골드+200`, 4000);
  // 보스 처치 경험치
  if(typeof gainExpFromKill==='function') gainExpFromKill('boss');
  // [신규] 소울웨폰 각성 조건(보스 누적 처치) 갱신
  if(typeof tickSoulWeaponBossKill==='function') tickSoulWeaponBossKill();
}
window.defeatBoss = defeatBoss;

export const PARTY_KEY = 'tf-party';

export function loadParty(){ try{ return JSON.parse(lsGet(PARTY_KEY)||'[]'); }catch(e){ return []; } }
window.loadParty = loadParty;

export function saveParty(d){ try{ lsSet(PARTY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveParty = saveParty;

export function detectCompanionType(npc){
  const r = ((npc.role||'')+(npc.name||'')).toLowerCase();
  if(/마법사|아르카누스|마나|주문/.test(r))   return 'mage';
  if(/기사|전사|검사|레오나르드|용병/.test(r)) return 'warrior';
  if(/도적|암살|정보|그림자/.test(r))         return 'rogue';
  if(/신관|성직|치유|사제|신앙/.test(r))      return 'cleric';
  if(/상인|장사|교역|실버/.test(r))           return 'merchant';
  if(/예언|시인|음유|바드/.test(r))           return 'bard';
  if(/학자|탐험|박사|발명/.test(r))           return 'scholar';
  if(/거인|오크|드워프|강인/.test(r))         return 'brute';
  return 'adventurer';
}
window.detectCompanionType = detectCompanionType;

export function checkRecruitConditions(npc){
  const type     = detectCompanionType(npc);
  const typeData = COMPANION_TYPE_DATA[type] || COMPANION_TYPE_DATA.adventurer;
  const gsFlags  = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
  const met = [], unmet = [];
  for(const c of (typeData.recruits||[])){
    let ok = false, metMsg='', unmetMsg='';
    if(c.type==='relationship'){
      ok = (npc.relationship||50)>=c.min;
      metMsg   = '호감도 '+c.min+'+ 충족 (현재 '+(npc.relationship||50)+')';
      unmetMsg = '호감도 '+c.min+' 필요 (현재 '+(npc.relationship||50)+')';
    } else if(c.type==='stat'){
      const v=Math.round(S.stats?.[c.stat]||0);
      ok=v>=c.min;
      metMsg   = (c.desc||c.stat+' '+c.min+'+')+' 충족 (현재 '+v+')';
      unmetMsg = (c.desc||c.stat.toUpperCase()+' '+c.min)+' 필요 (현재 '+v+')';
    } else if(c.type==='karma'){
      const k=Math.round(S.stats?.krma??50);
      ok=k<=c.maxKarma;
      metMsg   = '업보 '+c.maxKarma+' 이하 충족 (현재 '+k+')';
      unmetMsg = '업보 '+c.maxKarma+' 이하 필요 (현재 '+k+')';
    } else if(c.type==='fame'){
      const rep=loadReputation?.()?.score||0;
      ok=rep>=c.min;
      metMsg   = '명성 '+c.min+'+ 충족 (현재 '+rep+')';
      unmetMsg = '명성 '+c.min+' 필요 (현재 '+rep+')';
    } else if(c.type==='payment'){
      ok=(S.gold||0)>=c.gold;
      metMsg   = '골드 '+c.gold+' 보유 충족';
      unmetMsg = '골드 '+c.gold+' 필요 (현재 '+(S.gold||0)+')';
    } else if(c.type==='quest'){
      const qState=loadMainQuestState?.()||{};
      ok=qState[c.questId]==='complete'||!!gsFlags[c.questId];
      metMsg   = (c.desc)+' 달성';
      unmetMsg = (c.desc)+' 미달성';
    } else if(c.type==='duel'){
      ok=!!gsFlags['duel_won_'+(npc.name||'').replace(/\s/g,'_').toLowerCase()];
      metMsg   = '결투 승리 달성';
      unmetMsg = '결투 승리 필요 (서사에서 달성 가능)';
    } else {
      metMsg=unmetMsg=(c.desc||'조건')+'(서사 달성 가능)';
    }
    ok?met.push(metMsg):unmet.push(unmetMsg);
  }
  return { type, typeData, met, unmet, canRecruit: met.length>0 };
}
window.checkRecruitConditions = checkRecruitConditions;

export function checkReviveConditions(){
  // [B41 FIX] S.job이라는 필드는 어디에도 대입되지 않음. 실제 직업 id는
  // S.character.jobId에 저장됨.
  const job     = (typeof S!=='undefined' && (S.character?.jobId||S.character?.role)) || '';
  const gsFlags = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
  const items   = (typeof loadInventory==='function') ? loadInventory() : (S.inventory||[]);
  const stats   = (typeof S!=='undefined' && S.stats) || {};

  // 조건 1: 네크로맨서 직업
  if(job === 'necromancer') return { ok:true, type:'undead', reason:'네크로맨서 — 시체 부활 가능' };
  // 조건 2: 고위 부활 마법 플래그 (서사에서 습득)
  if(gsFlags['learned_resurrection_magic']) return { ok:true, type:'full', reason:'부활 마법 습득 — 완전 부활 가능' };
  // 조건 3: 신앙 80+ 클레릭/대신관/아크비숍
  const divineJobs = ['cleric','archbishop','dark_priest','bishop'];
  if(divineJobs.includes(job) && (stats.fath||0) >= 80) return { ok:true, type:'full', reason:'신앙 80+ 성직자 — 신성 부활 가능' };
  // 조건 4: 부활 아이템 소지
  const reviveItem = items.find(i=> i && (
    (i.name||'').includes('부활') || (i.name||'').includes('소생') ||
    (i.name||'').includes('생명의 결정') || (i.name||'').includes('부활의 돌') ||
    (i.id||'').includes('resurrection') || (i.id||'').includes('revive')
  ));
  if(reviveItem) return { ok:true, type:'full', reason:`${reviveItem.name} 사용 — 완전 부활 가능`, consumeItem:reviveItem };
  // 조건 5: 소환사/강령술사 계열
  if(['summoner','necromancer'].includes(job)) return { ok:true, type:'undead', reason:'소환사 — 영혼 결박 가능' };
  // 조건 6: 마계 문 개방 + 악마 부패 3단계 이상
  const corrStage = (typeof loadDemonCorruption==='function') ? (loadDemonCorruption()?.stage||0) : 0;
  if(gsFlags['infernal_gate_open'] && corrStage >= 3) return { ok:true, type:'undead', reason:'마계의 힘 — 어둠의 부활 가능' };

  return { ok:false, reason:'부활 조건 미충족 (네크로맨서 직업, 부활 마법 습득, 신앙 80+ 성직자, 부활 아이템 중 하나 필요)' };
}
window.checkReviveConditions = checkReviveConditions;

window.checkReviveConditions = checkReviveConditions;

export function recruitDeadNpcToParty(npcName, reviveType, npc, party, npcs){
  // 부활 조건 체크
  const revCheck = checkReviveConditions();
  if(!revCheck.ok){
    toast('⚠️ 부활 불가: '+revCheck.reason, 5000);
    return;
  }
  // 아이템 소모
  if(revCheck.consumeItem){
    const inv = (typeof loadInventory==='function') ? loadInventory() : (S.inventory||[]);
    const idx = inv.findIndex(i=>i&&(i.id===revCheck.consumeItem.id||i.name===revCheck.consumeItem.name));
    if(idx>=0){ inv.splice(idx,1); if(typeof saveInventory==='function') saveInventory(inv); }
  }

  const isFullRevive = revCheck.type === 'full' || reviveType === 'full';
  const compType     = isFullRevive ? 'fully_revived' : 'undead_revived';
  const typeData     = (typeof COMPANION_TYPE_DATA!=='undefined') ? COMPANION_TYPE_DATA[compType] : {};

  // NPC 상태 복원
  npc.status = isFullRevive ? 'alive' : 'undead';
  npc.hp     = isFullRevive ? 100 : 80;
  npc.isRevived   = true;
  npc.reviveType  = compType;
  npc.revivedTurn = (typeof S!=='undefined' && S.msgCount) || 0;
  if(typeof saveNPCs==='function') saveNPCs(npcs);

  // pm-npc deceased 해제
  try{
    const pmD = (typeof pmLoad==='function') ? pmLoad('npc') : {};
    if(pmD[npcName]){
      pmD[npcName].deceased    = false;
      pmD[npcName].revived     = true;
      pmD[npcName].reviveType  = compType;
      pmD[npcName].revivedTurn = npc.revivedTurn;
      if(typeof pmSave==='function') pmSave('npc', pmD);
    }
  }catch(e){}

  // 파티 합류
  const member = {
    name: npc.name, icon: npc.icon||'💀', role: npc.role||'동료',
    type: compType, typeLabel: typeData.label||'부활한 동료',
    relationship: npc.relationship||50,
    personality: npc.personality||'',
    statBonus: typeData.statBonus||{},
    battleRole: typeData.battleRole||'전방 근접',
    uniqueSkill: typeData.uniqueSkill||'',
    leaveCondition: isFullRevive ? '호감도 20 미만 시 이탈' : '절대 이탈 없음',
    aiHint: typeData.aiHint||'',
    talkStyle: typeData.talkStyle||'',
    joinedAt: new Date().toISOString(),
    joinTurn: npc.revivedTurn,
    alive: true, mood: isFullRevive?'neutral':'hollow',
    hp: npc.hp, maxHp: 100,
    isRevived: true, reviveType: compType,
  };
  party.push(member);
  if(typeof saveParty==='function') saveParty(party);
  if(typeof applyPartyBonus==='function') applyPartyBonus();

  // NPC inParty 표시
  const ni = npcs.findIndex(n=>n.name===npcName);
  if(ni>=0){ npcs[ni].inParty=true; if(typeof saveNPCs==='function') saveNPCs(npcs); }

  const revLabel = isFullRevive ? '완전 부활' : '언데드 부활';
  toast(`💀✨ ${npc.name}이(가) ${revLabel}하여 동료가 됐습니다! [${typeData.label||'부활한 동료'}]`, 5000);

  // AI 서사 주입
  S._nextInjectedContext = (S._nextInjectedContext||'')
    + `
[💀 부활 동료 합류] ${npc.name}이(가) ${revLabel}하여 파티에 합류했다.`
    + (isFullRevive
      ? ` 기억과 의식이 온전히 복원됐다. 생전과 같은 모습이지만 죽음을 경험한 무게감이 있다. 합류 순간을 극적으로 묘사하라.`
      : ` 생전의 의지는 흐릿하지만 주인공에게 절대적으로 충성한다. 감정 표현이 제한적이며 말이 적다. 가끔 생전 기억의 파편이 흘러나온다. 합류 순간을 묘사하라.`);
}
window.recruitDeadNpcToParty = recruitDeadNpcToParty;

window.recruitDeadNpcToParty = recruitDeadNpcToParty;

export function recruitNpcToParty(npcName, reviveType){
  const npcs = loadNPCs()||[];
  const npc  = npcs.find(n=>n.name===npcName);
  if(!npc){ toast('NPC를 찾을 수 없습니다'); return; }
  const party  = loadParty();
  if(party.find(p=>p.name===npcName)){ toast('이미 함께하고 있습니다'); return; }
  if(party.length >= 8){ toast('파티 최대 인원(8명)입니다'); return; }

  // ── 사망 NPC 부활 경로 ──────────────────────────────────
  if(npc.status === 'dead' || reviveType){
    return recruitDeadNpcToParty(npcName, reviveType, npc, party, npcs);
  }

  const result = checkRecruitConditions(npc);
  if(!result.canRecruit){
    toast('⚠️ 영입 불가: '+result.unmet.slice(0,2).join(' / '), 4000); return;
  }
  // 선불 처리
  const payC = result.typeData.recruits.find(c=>c.type==='payment');
  if(payC && (S.gold||0) >= payC.gold){ S.gold-=payC.gold; saveGold?.(S.gold); window.updateHeader?.(); }

  const member = {
    name:npc.name, icon:npc.icon||'👤', role:npc.role||'동료',
    type:result.type, typeLabel:result.typeData.label,
    relationship:npc.relationship||50,
    personality:npc.personality||'',
    statBonus:{...result.typeData.statBonus},
    battleRole:result.typeData.battleRole,
    uniqueSkill:result.typeData.uniqueSkill,
    leaveCondition:`호감도 ${result.typeData.leaveMin} 미만 시 이탈`,
    aiHint:result.typeData.aiHint,
    talkStyle:result.typeData.talkStyle,
    joinedAt:new Date().toISOString(),
    joinTurn:S.msgCount||0,
    alive:true, mood:'neutral', trustLevel:30,
    hp:100, maxHp:100,
  };
  party.push(member);
  saveParty(party);
  applyPartyBonus();
  const ni=npcs.findIndex(n=>n.name===npcName);
  if(ni>=0){ npcs[ni].inParty=true; saveNPCs?.(npcs); }
  toastHTML(`👥 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(npc,{size:14}):(npc.icon||"👤")} ${esc(npc.name)}이(가) 동행에 합류했습니다! [${esc(result.typeData.label)}]`, 4000);
  unlockAchievement?.('first_party');
  S._nextInjectedContext=(S._nextInjectedContext||'')+
    `\n[👥 동료 합류] ${npc.name}(${result.typeData.label})이(가) 파티에 합류했다. 말투: ${result.typeData.talkStyle} 이번 장면에서 합류 과정을 자연스럽게 묘사하라.`;
}
window.recruitNpcToParty = recruitNpcToParty;

export function checkPartyLeave(){
  const party = loadParty();
  if(!party.length) return;
  const npcs  = loadNPCs()||[];
  const karma = S.stats?.krma??50;
  const corr  = (typeof loadDemonCorruption==='function') ? loadDemonCorruption() : null;
  let changed = false;
  const remaining = party.filter(m=>{
    const npc = npcs.find(n=>n.name===m.name);
    const rel = npc?.relationship ?? m.relationship ?? 50;
    const td  = COMPANION_TYPE_DATA[m.type] || COMPANION_TYPE_DATA.adventurer;
    let leaves = false;
    if(td.leaveMin > 0 && rel < td.leaveMin) leaves = true;
    if(m.type==='cleric' && karma > (td.leaveKarma||75)) leaves = true;
    if(m.type==='cleric' && corr && corr.stage >= (td.leaveCorrStage||3)) leaves = true;
    if(m.type==='bard' && (loadReputation?.()?.score||0) < (td.leaveFame||15)) leaves = true;
    if(leaves){
      changed = true;
      const ni = npcs.findIndex(n=>n.name===m.name);
      if(ni>=0){ npcs[ni].inParty=false; }
      setTimeout(()=>{
        toastHTML(`💔 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:14}):(m.icon)} ${esc(m.name)}이(가) 파티를 떠났습니다`, 4000);
        S._nextInjectedContext=(S._nextInjectedContext||'')+
          `\n[👥 동료 이탈] ${m.name}이(가) 파티를 떠났다. 이별 장면을 감정적으로 묘사하라.`;
      }, 500);
      return false;
    }
    return true;
  });
  if(changed){ saveParty(remaining); saveNPCs?.(npcs); applyPartyBonus(); }
}
window.checkPartyLeave = checkPartyLeave;

export function applyPartyBonus(){
  const party = loadParty();
  let t = {};
  party.forEach(m=>Object.entries(m.statBonus||{}).forEach(([k,v])=>{ t[k]=(t[k]||0)+v; }));
  // [연결] 성장한 동료(growNpc로 누적)의 스킬 버프도 함께 반영
  if(typeof getCompanionBuffs==='function'){
    try{
      const buffs = getCompanionBuffs();
      const _npcSkillStatMap = {
        npc_cover:  {end:5},
        npc_assist: {crit:8},
        npc_rally:  {wil:8, cal:5},
        npc_synergy:{str:10, end:10, mgc:10}, // '모든 판정'을 광범위한 스탯 소폭 보정으로 근사
      };
      (buffs||[]).forEach(b=>{
        const mods = _npcSkillStatMap[b?.id];
        if(mods) Object.entries(mods).forEach(([k,v])=>{ t[k]=(t[k]||0)+v; });
      });
    }catch(e){}
  }
  S._partyBonus = t;
}
window.applyPartyBonus = applyPartyBonus;

export function updateCompanionTrust(delta){
  const party = loadParty();
  if(!party.length) return;
  party.forEach(m=>{
    m.trustLevel = Math.max(0,Math.min(100,(m.trustLevel||30)+delta));
    m.mood = m.trustLevel>70?'happy':m.trustLevel<30?'angry':'neutral';
  });
  saveParty(party);
}
window.updateCompanionTrust = updateCompanionTrust;

window.updateCompanionTrust = updateCompanionTrust;

export function renderPartyPanel(){
  const party = loadParty();
  const npcs  = loadNPCs()||[];
  const moodI = {happy:'😊',neutral:'😐',uneasy:'😟',angry:'😠'};
  const recruitable = npcs.filter(n=>{
    if(n.inParty||party.find(p=>p.name===n.name)) return false;
    return checkRecruitConditions(n).canRecruit;
  });
  const nearly = npcs.filter(n=>{
    if(n.inParty||party.find(p=>p.name===n.name)) return false;
    if(recruitable.find(r=>r.name===n.name)) return false;
    const r=checkRecruitConditions(n);
    return r.unmet.length>0 && r.unmet.length<=2;
  }).slice(0,3);

  return `
    <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:8px;letter-spacing:1px">👥 현재 동행 (${party.length}/8)</div>
    ${!party.length?'<div style="color:var(--dim);font-size:11px;padding:8px;border:1px dashed var(--border);text-align:center">동행이 없습니다</div>':''}
    ${party.map(m=>{
      const tp=m.trustLevel||30;
      const tc=tp>70?'#60a060':tp>40?'#a08040':'#a06060';
      return `<div style="padding:10px 12px;background:#0d0800;border:1px solid #3a5a2a;margin-bottom:6px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:22px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:22}):(m.icon)}</span>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:5px">
              <span style="font-family:Cinzel,serif;font-size:10px;color:var(--gold)">${esc(m.name)}</span>
              <span style="font-size:8px;color:var(--dim)">${m.typeLabel||''}</span>
              <span>${moodI[m.mood||'neutral']}</span>
            </div>
            <div style="font-size:8px;color:var(--dim)">${esc(m.role)}</div>
          </div>
          <button class="btn btn-dark" style="padding:3px 7px;font-size:9px" onclick="dismissPartyMember('${esc(m.name)}')">작별</button>
        </div>
        <div style="margin-bottom:4px">
          <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--dim);margin-bottom:2px"><span>신뢰도</span><span style="color:${tc}">${tp}/100</span></div>
          <div style="height:3px;background:#1a1005;border-radius:2px"><div style="width:${tp}%;height:100%;background:${tc};border-radius:2px"></div></div>
        </div>
        <div style="font-size:8px;color:#7a6a4a;border-top:1px solid var(--border);padding-top:3px">✦ ${esc(m.uniqueSkill||'')}</div>
        <div style="font-size:8px;color:#5a8a5a">${Object.entries(m.statBonus||{}).map(([k,v])=>k.toUpperCase()+'+'+v).join(' · ')}</div>
      </div>`;
    }).join('')}
    ${recruitable.length?`<div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin:10px 0 6px">✦ 동행 가능한 NPC</div>
    ${recruitable.map(n=>{
      const r=checkRecruitConditions(n);
      return `<div style="padding:8px 10px;background:#0d0800;border:1px solid var(--border);margin-bottom:4px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(n,{size:18}):(n.icon||"👤")}</span>
          <div style="flex:1">
            <div style="font-size:10px;color:var(--text)">${esc(n.name)}</div>
            <div style="font-size:8px;color:#60a060">${r.met[0]||''}</div>
            <div style="font-size:8px;color:var(--dim)">${(r.typeData?.battleRole||'').slice(0,30)}</div>
          </div>
          <button class="btn btn-gold" style="padding:4px 8px;font-size:9px" onclick="recruitNpcToParty('${esc(n.name)}')">동행</button>
        </div>
      </div>`;
    }).join('')}`:''}
    ${nearly.length?`<div style="font-size:9px;color:var(--dim);margin:8px 0 4px">○ 조건 미충족 NPC (힌트)</div>
    ${nearly.map(n=>{
      const r=checkRecruitConditions(n);
      return `<div style="padding:6px 10px;background:#080500;border:1px dashed var(--border);margin-bottom:3px;opacity:.8">
        <div style="display:flex;align-items:center;gap:7px">
          <span style="font-size:15px;opacity:.6">${typeof getEntityIconHTML==='function'?getEntityIconHTML(n,{size:15}):(n.icon||"👤")}</span>
          <div><div style="font-size:9px;color:var(--dim)">${esc(n.name)}</div>
          <div style="font-size:8px;color:#6a4a2a">${r.unmet[0]||''}</div></div>
        </div>
      </div>`;
    }).join('')}`:''}
  `;
}
window.renderPartyPanel = renderPartyPanel;

export function dismissPartyMember(name){
  const party=loadParty().filter(p=>p.name!==name);
  saveParty(party); applyPartyBonus();
  const npcs=loadNPCs()||[];
  const ni=npcs.findIndex(n=>n.name===name);
  if(ni>=0){ npcs[ni].inParty=false; saveNPCs?.(npcs); }
  toast(name+'이(가) 파티에서 떠났습니다', 2500);
  S._nextInjectedContext=(S._nextInjectedContext||'')+`\n[👥 동료 작별] 주인공이 ${name}과(와) 작별을 고했다. 짧지만 감정 담긴 작별 장면을 묘사하라.`;
  window.openP('npcs');
}
window.dismissPartyMember = dismissPartyMember;

export const SKILL_COMBO_KEY = 'tf-skill-combos';

export function loadUnlockedCombos(){ try{ return JSON.parse(lsGet(SKILL_COMBO_KEY)||'[]'); }catch(e){ return []; } }
window.loadUnlockedCombos = loadUnlockedCombos;

export function saveUnlockedCombos(d){ try{ lsSet(SKILL_COMBO_KEY, JSON.stringify(d)); }catch(e){} }
window.saveUnlockedCombos = saveUnlockedCombos;

export function renderSkillComboPanel(){
  const body = document.getElementById('pb-skillcombos');
  if(!body) return;
  const discovered = loadUnlockedCombos();
  const allSkills = (typeof getAllSkillDefs==='function') ? getAllSkillDefs() : [];
  const skillName = (sid) => { const s = allSkills.find(x=>x.id===sid); return s ? `${s.icon||''} ${s.name}` : sid; };
  const rc = (typeof RC!=='undefined') ? RC : {};

  const cards = SKILL_COMBOS.map(combo=>{
    const isFound = discovered.includes(combo.id);
    const color = rc[combo.rarity] || '#c8a96e';
    const reqList = (combo.skills||[]).map(sid=>{
      const has = !!(S.unlockedSkills||{})[sid];
      return `<span style="color:${has?'#80c080':'var(--dim)'}">${has?'✓':'✗'} ${esc(skillName(sid))}</span>`;
    }).join(', ');
    if(isFound){
      return `<div class="sk-card unlocked" style="border-color:${color}">
        <div class="sk-top">
          <span class="sk-ico">${typeof getEntityIconHTML==='function'?getEntityIconHTML(combo,{size:16}):(combo.icon)}</span>
          <span class="sk-nm" style="color:${color}">${esc(combo.name)}</span>
          <span class="sk-rar" style="background:${color}22;color:${color};border:1px solid ${color}44">${combo.rarity}</span>
          <span style="color:#60a060;font-size:9px;margin-left:auto">✓발견됨</span>
        </div>
        <div class="sk-desc">${esc(combo.desc)}</div>
        <div class="sk-cost">MP: ${combo.mpCost}</div>
        <div style="font-size:9px;color:#5a4a2a;margin-top:5px">조합: ${reqList}</div>
      </div>`;
    }
    return `<div class="sk-card locked" style="opacity:0.7">
      <div class="sk-top">
        <span class="sk-ico">❓</span>
        <span class="sk-nm" style="color:var(--dim)">미발견 콤보</span>
        <span class="sk-rar" style="background:${color}22;color:${color};border:1px solid ${color}44">${combo.rarity}</span>
      </div>
      <div class="sk-desc" style="color:var(--dim)">두 스킬을 모두 해금하면 자동으로 발견됩니다.</div>
      <div style="font-size:9px;color:#5a4a2a;margin-top:5px">필요 스킬: ${reqList}</div>
    </div>`;
  }).join('');

  body.innerHTML = `<div style="padding:8px 12px;font-size:10px;color:var(--dim)">💥 특정 스킬 조합을 모두 해금하면 강력한 콤보 스킬이 자동으로 열립니다. (${discovered.length}/${SKILL_COMBOS.length} 발견)</div>${cards}`;
}
window.renderSkillComboPanel = renderSkillComboPanel;

window.renderSkillComboPanel = renderSkillComboPanel;

export function checkSkillCombos(){
  const unlocked = S.unlockedSkills||{};
  const discovered = loadUnlockedCombos();
  const recentSkillIds = S._recentSkillIds||[];
  const activeComboIds = [];
  SKILL_COMBOS.forEach(combo=>{
    const _skills = combo.skills||combo.requires||[];
    if(_skills.length && _skills.every(sid=>(S.unlockedSkills||{})[sid]||recentSkillIds.includes(sid)))
      activeComboIds.push(combo.id);
  });
  S._activeComboIds = activeComboIds;

  SKILL_COMBOS.forEach(combo=>{
    if(discovered.includes(combo.id)) return;
    if(combo.skills.every(sid=>unlocked[sid])){
      discovered.push(combo.id);
      saveUnlockedCombos(discovered);
      // 콤보 스킬을 스킬 목록에 추가
      // [버그 수정] 기존엔 combo.effects/combo.hpRestore를 복사하지 않고
      // 항상 hpRestore:0에 effects 필드 자체가 없는 객체를 저장했다 —
      // SKILL_COMBOS 원본에 damage/buff 스키마를 채워도, 실제 해금될 때
      // 저장되는 스킬 레코드에는 반영이 안 되어 콤보를 써도 항상 아무
      // 수치 효과 없이 서사만 나오는 상태였다. 헤드리스 재현으로 확인.
      const comboSkill = { id:combo.id, name:combo.name, icon:combo.icon, type:'active',
        desc:combo.desc, rarity:combo.rarity, mpCost:combo.mpCost, hpCost:combo.hpCost||0, hpRestore:combo.hpRestore||0,
        req:{}, condition:null, conditionDesc:null, statBoost:{}, scenario:'all', jobRole:'combo',
        ...(combo.effects ? {effects:combo.effects} : {}) };
      const jobSkills = loadJobSkills();
      if(!jobSkills.find(s=>s.id===combo.id)) saveJobSkills([...jobSkills, comboSkill]);
      const sk = {...unlocked, [combo.id]:true};
      saveSkills(sk); S.unlockedSkills=sk;
      toastHTML(`✨ 스킬 조합 발견: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(combo,{size:14}):(combo.icon)} ${esc(combo.name)}!`, 4000);
    }
  });
}
window.checkSkillCombos = checkSkillCombos;

export const RELIC_OWNED_KEY = 'tf-owned-relics';

export function loadOwnedRelics(){ try{ return JSON.parse(lsGet(RELIC_OWNED_KEY)||'[]'); }catch(e){ return []; } }
window.loadOwnedRelics = loadOwnedRelics;

export function saveOwnedRelics(d){ try{ lsSet(RELIC_OWNED_KEY, JSON.stringify(d)); }catch(e){} }
window.saveOwnedRelics = saveOwnedRelics;

export function checkRelicUnlock(){
  const owned = loadOwnedRelics();
  const st = loadStats();
  const titles = loadTitles()||[];
  const actions = loadJobActions();
  const reinc = loadCycleCount()||0;
  const gsFlags = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
  const curContinent = (S.character?.startContinent||'central').replace('central','center');
  RELICS.forEach(relic=>{
    if(owned.includes(relic.id)) return;
    const c = relic.condition;
    let met = true;
    if(c.minTitles      && titles.length < c.minTitles) met=false;
    if(c.minCritSuccess && (st.critSuccessCount||0) < c.minCritSuccess) met=false;
    if(c.minMagic       && (S.stats?.mgc||0) < c.minMagic) met=false;
    if(c.minFaith       && (S.stats?.fath||0) < c.minFaith) met=false;
    if(c.minStealthCount&& (actions.stealth||0) < c.minStealthCount) met=false;
    if(c.minDeaths      && (st.deathCount||0) < c.minDeaths) met=false;
    if(c.minReinc       && reinc < c.minReinc) met=false;
    if(c.minCombatWin   && (st.combatWin||0) < c.minCombatWin) met=false;
    if(c.minCraft       && (actions.craft||0) < c.minCraft) met=false;
    if(c.hasFlag        && !gsFlags[c.hasFlag]) met=false;
    if(c.hasFlag2       && !gsFlags[c.hasFlag2]) met=false;
    if(c.continent      && curContinent !== c.continent && c.continent !== (S.character?.startContinent||'central')) met=false;
    if(met){
      owned.push(relic.id);
      saveOwnedRelics(owned);
      Object.entries(relic.effect).forEach(([k,v])=>{
        if(S.stats[k]!==undefined) S.stats[k]=Math.min(999,S.stats[k]+v);
      });
      window.updateHeader();
      toastHTML(`🏛️ 유물 획득: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(relic,{size:14}):(relic.icon)} ${esc(relic.name)}!`, 4000);
      setTimeout(()=>toast(`효과: ${Object.entries(relic.effect).map(([k,v])=>{const i=getStatInfo(k);return (i?.name||k)+'+'+v;}).join(', ')}`, 3000), 2000);
    }
  });
}
window.checkRelicUnlock = checkRelicUnlock;

export const LOCATION_KEY = 'tf-locations';

export function loadLocations(){ try{ return JSON.parse(lsGet(LOCATION_KEY)||'[]'); }catch(e){ return []; } }
window.loadLocations = loadLocations;

export function saveLocations(d){ try{ lsSet(LOCATION_KEY, JSON.stringify(d)); }catch(e){} }
window.saveLocations = saveLocations;

export function detectLocation(aiText){
  const locations = loadLocations();
  const locationKeywords = [
    {name:'시장', icon:'🏪', keywords:['시장','상점','가게','거래소']},
    {name:'던전', icon:'🗝️', keywords:['던전','지하','유적','미궁']},
    {name:'왕궁', icon:'🏰', keywords:['왕궁','성','궁전','왕좌']},
    {name:'숲', icon:'🌲', keywords:['숲','삼림','나무','숲속']},
    {name:'사막', icon:'🏜️', keywords:['사막','모래','오아시스']},
    {name:'바다', icon:'🌊', keywords:['바다','항구','배','해안']},
    {name:'산', icon:'⛰️', keywords:['산','봉우리','절벽','고산']},
    {name:'마을', icon:'🏘️', keywords:['마을','촌락','거리','광장']},
    {name:'신전', icon:'⛩️', keywords:['신전','성당','교회','사원']},
    {name:'전장', icon:'⚔️', keywords:['전장','전쟁터','격전지']},
  ];
  const lc = aiText.toLowerCase();
  locationKeywords.forEach(loc=>{
    if(loc.keywords.some(k=>lc.includes(k)) && !locations.find(l=>l.name===loc.name)){
      locations.push({...loc, visitedAt:new Date().toISOString(), turn:S.msgCount});
      saveLocations(locations);
      toastHTML(`🗺️ 새 장소 발견: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:14}):(loc.icon)} ${esc(loc.name)}`, 2000);
    }
  });
}
window.detectLocation = detectLocation;

export const REPUTATION_KEY = 'tf-reputation';

export const REP_SCORE_KEY = 'tf-rep-score';

export const REP_LEVEL_KEY = 'tf-rep-level';

export const REP_TITLE_KEY = 'tf-rep-title';

export function loadReputation() {
  try {
    const s=lsGet(REP_SCORE_KEY); const l=lsGet(REP_LEVEL_KEY); const t=lsGet(REP_TITLE_KEY);
    if (s!==null) return { score:parseFloat(s)||0, level:l||'무명', title:t||'' };
    return JSON.parse(lsGet(REPUTATION_KEY)||'{"score":0,"level":"무명","title":""}');
  } catch(e) { return {score:0,level:'무명',title:''}; }
}
window.loadReputation = loadReputation;

export function saveReputation(d) {
  try {
    lsSet(REP_SCORE_KEY, String(d.score||0));
    lsSet(REP_LEVEL_KEY, d.level||'무명');
    lsSet(REP_TITLE_KEY, d.title||'');
    lsSet(REPUTATION_KEY, JSON.stringify(d));
  } catch(e) {}
}
window.saveReputation = saveReputation;

export function updateReputation(amount){
  const rep = loadReputation();
  rep.score = (rep.score||0) + amount;
  const newLevel = [...REPUTATION_LEVELS].reverse().find(l=>rep.score>=l.min) || REPUTATION_LEVELS[0];
  if(newLevel.level !== rep.level){
    rep.level = newLevel.level;
    rep.title = newLevel.title;
    toast(`평판 상승: ${newLevel.level} — "${newLevel.title}"`, 4000, newLevel);
    if(typeof addBardVerse==='function') addBardVerse(newLevel.title, S.character?.name, S.scenario?.id);
  }
  saveReputation(rep);
}
window.updateReputation = updateReputation;

export const ENDING_KEY = 'tf-endings';

export function loadEndings(){ try{ return JSON.parse(lsGet(ENDING_KEY)||'[]'); }catch(e){ return []; } }
window.loadEndings = loadEndings;

export function saveEndings(d){ try{ lsSet(ENDING_KEY, JSON.stringify(d)); }catch(e){} }
window.saveEndings = saveEndings;

export function unlockEnding(endingId, endingName){
  const endings = loadEndings();
  if(!endings.find(e=>e.id===endingId)){
    // [20차 감사 FIX] 엔딩 달성 시점의 카르마(krma)를 함께 기록한다.
    // job/029의 히든 직업 unlockCondition 중 pureKarmaEndings/
    // evilKarmaEndings를 요구하는 항목들(오라클·업보 화신·혼돈의 화신 등)이
    // 이 값을 소비하는데, 이전에는 그 값을 계산할 데이터가 어디에도
    // 저장되지 않아(엔딩 기록에 karma 필드 자체가 없었음) 해당 히든
    // 직업들이 자동 감지로는 영원히 해금될 수 없었다. 앞으로 달성하는
    // 엔딩부터는 karma를 함께 남겨 getKarmaEndingCounts()로 집계 가능하게 한다.
    const karma = S.stats?.krma ?? 50;
    endings.push({ id:endingId, name:endingName, unlockedAt:new Date().toISOString(), karma });
    saveEndings(endings);
    toast(`🎭 엔딩 해금: ${endingName}`, 4000);
    window.updateStats('endingCount', 1);
    unlockAchievement('first_ending');
  }
}
window.unlockEnding = unlockEnding;

// [20차 감사 FIX] 카르마 극단(순수/극악) 엔딩 집계 — 위 unlockEnding()이
// 기록한 karma 필드를 기준으로, 30 이하(오라클의 "카르마 점수 30 이하"
// 기준과 동일)면 순수, 70 이상(업보 화신의 "극악 ≥80"과 대칭적인 반대편
// 극단을 100점 만점 기준 중앙값 50에서 균형 있게 잡은 값)이면 극악으로
// 센다. 이 수정 이전에 기록된 엔딩은 karma 필드가 없어 집계에서 제외된다
// (소급 적용 불가 — 기록 자체가 없던 정보라 되돌려 계산할 수 없음).
export function getKarmaEndingCounts(){
  const endings = loadEndings();
  let pureKarmaEndings = 0, evilKarmaEndings = 0;
  endings.forEach(e=>{
    if(typeof e.karma !== 'number') return;
    if(e.karma <= 30) pureKarmaEndings++;
    if(e.karma >= 70) evilKarmaEndings++;
  });
  return { pureKarmaEndings, evilKarmaEndings };
}
window.getKarmaEndingCounts = getKarmaEndingCounts;

export function getReincarnationInheritance(){
  const reinc = loadCycleCount()||0;
  return {
    statRetentionRate: Math.min(0.5, reinc * 0.08), // 최대 50% 스탯 인계
    goldRetention: Math.min(200, reinc * 30),         // 최대 200 골드 인계
    keepRelics: reinc >= 3,                            // 3회차부터 유물 유지
    keepTitles: reinc >= 2,                            // 2회차부터 칭호 일부 유지
    keepSkillMemory: reinc >= 1,                       // 1회차부터 스킬 기억
  };
}
window.getReincarnationInheritance = getReincarnationInheritance;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_41(){
function checkBossSpawn(){
  const sid = S.scenario?.id||'medieval';
  const bosses = BOSS_MONSTERS[sid]||BOSS_MONSTERS.medieval;
  const bossState = loadBossState();
  // [위치 인식] turnTrigger는 "이 시점 이후로 등장 가능"일 뿐, 실제 등장은
  // 플레이어가 boss.locTypes에 맞는 장소(던전/성소/사건 지역 등)에 실제로
  // 있을 때만 일어난다. locTypes가 없는 보스(다른 시나리오 등)는 기존처럼
  // 장소 무관하게 등장 — 하위 호환.
  const _curLocForBoss = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  const _curLocTypeForBoss = _curLocForBoss ? (_curLocForBoss.type||'special') : null;
  // [버그 수정] "고대 드래곤" 같이 이름 자체가 특정 신화적 정체성을 가진
  // 마일스톤 보스가, dungeonTier가 아예 없는 임의의 type:'dungeon' 장소
  // (예: AI가 즉석에서 서술한 노예 노동 갱도·감옥 통로 등 — 실제로는 용과
  // 아무 관련 없는 장면)에서도 turnTrigger만 넘으면 맥락과 무관하게
  // 튀어나오는 문제가 있었다. data/052의 정식 큐레이션된 던전 31곳은
  // 전부 dungeonTier(1~4)가 붙어있으므로, type이 'dungeon'인 경우엔
  // dungeonTier가 실제로 설정된 "진짜 설계된 던전"일 때만 등장을 허용한다.
  // event/special 타입은 기존 동작 유지(별도 티어 필드가 없음).
  const _locIsUnderTieredDungeon = _curLocTypeForBoss === 'dungeon' && (!_curLocForBoss || typeof _curLocForBoss.dungeonTier !== 'number');
  bosses.forEach(boss=>{
    if(bossState[boss.id]) return;
    if(boss.locTypes && (!_curLocTypeForBoss || !boss.locTypes.includes(_curLocTypeForBoss))) return;
    if(_locIsUnderTieredDungeon) return;
    if(S.msgCount >= boss.turnTrigger && !bossState[boss.id+'_spawned']){
      bossState[boss.id+'_spawned'] = true;
      // [밸런스 수정] 보스가 시나리오 정의값(hp:200 등)을 레벨/회차와 무관하게
      // 항상 고정으로 써서, 레벨이 낮은 플레이어에겐 너무 강하고 레벨이 높은
      // 플레이어에겐 너무 시시했던 문제. getEnemyScaleMultiplier로 통일.
      const _scale = (typeof getEnemyScaleMultiplier==='function') ? getEnemyScaleMultiplier() : {total:1};
      const scaledHp  = Math.round((boss.hp||boss.maxHp||1000) * _scale.total);
      const scaledAtk = Math.round((boss.atk||10) * _scale.total);
      // active 플래그 추가 (detectBossDamage/renderBossHpBar가 사용)
      bossState[boss.id] = { ...boss, active: true, hp: scaledHp, maxHp: scaledHp, atk: scaledAtk };
      saveBossState(bossState);
      const _bossHpInit = (typeof loadBossHp==='function') ? loadBossHp() : null;
      _bossHpInit[boss.id] = scaledHp;
      if(typeof saveBossHp==='function') saveBossHp(_bossHpInit);
      setTimeout(()=>{
        toastHTML(`⚠️ 보스 등장: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(boss,{size:14}):(boss.icon)} ${esc(boss.name)}! (강화 x${esc(_scale.total.toFixed(1))})`, 4000);
        if(typeof showBossEntrance==='function') showBossEntrance(boss);
        // 몬스터 목록에 추가
        const monsters = loadMonsters()||[];
        if(!monsters.find(m=>m.id===boss.id)){
          monsters.push({...boss, hp: scaledHp, maxHp: scaledHp, atk: scaledAtk, status:'alive', isBoss:true, isNamed:true});
          saveMonsters(monsters);
        }
        // [게임 전체 학습 시스템] 이 (보스 등장+장소유형+등급) 조합을 AI가
        // 이미 여러 번 서술해봤으면, 새로 지어내는 대신 그 서술을 재사용한다.
        try{
          const _bossBucket = (typeof getSituationBucketKey==='function') ? getSituationBucketKey('boss', _curLocForBoss, boss.tier) : null;
          const _bossLearned = (_bossBucket && typeof pickLearnedSituationExample==='function') ? pickLearnedSituationExample(_bossBucket, boss.name) : null;
          if(_bossLearned){
            S._nextInjectedContext = (S._nextInjectedContext||'') + `\n\n[⚠️ 보스 등장 — 이미 서술 확보됨] ${_bossLearned}`;
          } else {
            S._nextInjectedContext = (S._nextInjectedContext||'') + `\n\n[⚠️ 보스 등장] ${boss.icon} ${boss.name}이(가) 나타났다. 이 장소에 걸맞은 위협적인 등장을 서사로 묘사하라.`;
            S._pendingLearnBucket = _bossBucket;
            S._pendingLearnSubject = boss.name;
          }
        }catch(e){}
      }, 1500);
    }
  });
}
window.checkBossSpawn = checkBossSpawn;
}

