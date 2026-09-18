// 🌸 동대륙 추가 장소 (+4)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { LOCATION_DATA } from '../data/042-직업-시스템-무한-파생-도감.js';
import { SPECIAL_LOCATIONS } from '../data/052-동대륙-추가-장소-4.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { LOCAL_JAIL_ACTIONS, MAXSEC_JAIL_ACTIONS, MAXSEC_JAIL_DEF } from '../data/086-퀘스트임무-수락-팝업-시스템.js';
import { addExploredLocation } from '../misc/015-시스템-1120.js';
import { recordExploredLocation } from '../misc/017-4150번-시스템.js';
import { getOrAssignLocNpcs, getPlayerNpcsAtLoc, renderLocationInteractions, renderLocationNpcs, renderLocationShops } from '../misc/053-게시판-시스템.js';
import { loadLocations, renderTransportBar, saveLocations } from '../misc/054-이동수단-시스템.js';
import { updateChallenge } from '../misc/164-도전-과제-달성률-시스템.js';
import { recordRuin } from '../progression/020-101130번-환생-누적-시스템.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { loadJailState } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { _renderDemesneLocationBlock } from '../race/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js';
import { DEMESNE_TIERS, POP_STAGES } from '../race/260-수인족-패널-렌더.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadGSFlags } from './145-⑥-세계-상태-DB.js';

export const CURRENT_LOC_KEY = 'tf-current-location';

window.currentLocation = null;

export function loadCurrentLocation(){ try{ return JSON.parse(lsGet(CURRENT_LOC_KEY)||'null'); }catch(e){ return null; } }
window.loadCurrentLocation = loadCurrentLocation;

export function saveCurrentLocation(d){
  try{
    lsSet(CURRENT_LOC_KEY, d?JSON.stringify(d):'null');
    // 위치가 저장되는 모든 경로(이동, AI 텍스트 감지, 체포/석방, 특수 이벤트 등)에서
    // 공통으로 "지도가 보여주는 대륙"을 실제 위치의 대륙과 맞춘다. moveToLocation
    // 한 곳에만 넣으면 나머지 8개 saveCurrentLocation 호출 경로가 누락되므로
    // 이 함수 자체에서 처리해 모든 경로를 커버한다.
    if(d && d.continent && typeof S!=='undefined'){
      S._landMapSelectedContinent = d.continent;
    }
    // [B67 FIX] "세계 탐험가"(대륙 8개 방문) 도전 과제 트래킹 — 실제로
    // updateChallenge('continents_visited', ...)를 호출하는 코드가 어디에도
    // 없어 영원히 미달성이었다. 위치가 저장되는 모든 경로를 이미 공통으로
    // 지나는 이 함수에서 방문한 대륙 집합을 누적한다.
    if(d && d.continent && typeof updateChallenge==='function'){
      const visited = JSON.parse(lsGet('tf-visited-continents')||'[]');
      if(!visited.includes(d.continent)){
        visited.push(d.continent);
        lsSet('tf-visited-continents', JSON.stringify(visited));
      }
      updateChallenge('continents_visited', visited.length);
    }
  }catch(e){}
}
window.saveCurrentLocation = saveCurrentLocation;

// [레벨대 배치] 장소 "유형"별 전체 범위(envelope) — 이 유형의 장소들이
// 게임 전체에서 대략 어느 레벨 구간에 걸쳐 분포하는지를 나타낸다. 실제
// 개별 장소의 레벨대는 이 범위 "안"에서 장소마다 다르게 좁혀진다(아래
// getLocationLevelBand 참고) — 그래야 같은 "town" 유형이어도 초반 마을과
// 후반 마을이 서로 다른 레벨대를 갖는다. dangerLevel이 없는 장소(전체
// 105개 중 63개, 특히 수도 3곳 전부)에 쓰는 폴백.
export const LOC_TYPE_LEVEL_BAND = {
  hamlet:  [1, 10],
  village: [5, 20],
  town:    [12, 35],
  city:    [25, 55],
  major:   [25, 55],
  capital: [50, 100],
  shrine:  [8, 30],
  dungeon: [10, 45],
  event:   [15, 50],
  special: [15, 50],
  jail:    [25, 55],
  port:    [15, 40],
  wilderness: [5, 45],
};

// [레벨대 배치] dangerLevel(1~6)이 있는 장소(주로 던전·사건 지역 — 이미
// 세밀하게 손으로 매겨져 있음)에 쓰는 우선 전체 범위(envelope). type
// 폴백보다 더 정확한 신호이므로 있으면 이쪽을 먼저 쓴다.
export const LOC_DANGER_LEVEL_BAND = {
  1: [1, 15],
  2: [10, 25],
  3: [20, 40],
  4: [35, 55],
  5: [50, 75],
  6: [65, 100],
};

// 장소 고유 id/이름에서 결정적(deterministic) 시드를 뽑는다 — 같은 장소는
// 언제 다시 방문해도 항상 같은 시드가 나와야 레벨대가 안 흔들린다.
function _locBandSeed(loc){
  const s = String(loc.id || loc.name || '');
  let h = 0;
  for(let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// [레벨대 배치] 이 장소에 "어울리는" 캐릭터 레벨대를 돌려준다 — 요즘 나오는
// 다른 게임들처럼, 한 구역에서 만나는 몬스터는 레벨 차이가 1~2 정도밖에
// 안 나는 좁은 레벨대를 갖게 하기 위함(기존에는 몬스터 스탯이 그 순간의
// 플레이어 레벨에서만 나와서, 같은 "토끼"가 누가 보느냐에 따라 1레벨도
// 80레벨도 되는 문제가 있었다). type/dangerLevel로 정한 "이 유형이 대략
// 걸쳐 있는 넓은 범위"(envelope) 안에서, 그 장소 고유의 id/이름을 시드로
// 삼아 폭 2짜리 좁은 구간을 하나 골라 고정한다 — 그래서 (1) 같은 장소는
// 항상 같은 레벨대를 유지하고, (2) 같은 유형이어도 장소마다 서로 다른
// 레벨대를 가지며, (3) 장소 105개 전부에 손으로 새 필드를 매길 필요가 없다.
export function getLocationLevelBand(loc){
  if(!loc) return [1, 3];
  const envelope = (typeof loc.dangerLevel === 'number' && LOC_DANGER_LEVEL_BAND[loc.dangerLevel])
    ? LOC_DANGER_LEVEL_BAND[loc.dangerLevel]
    : (LOC_TYPE_LEVEL_BAND[loc.type] || [1, 30]);
  const WINDOW = 2; // 이 장소 안에서 몬스터 레벨 차이는 최대 2
  const span = Math.max(1, (envelope[1] - envelope[0]) - WINDOW);
  const base = envelope[0] + (_locBandSeed(loc) % (span + 1));
  return [base, base + WINDOW];
}
window.getLocationLevelBand = getLocationLevelBand;

// [시스템 정리] "이 장소가 몬스터 스탯을 얼마나 배율로 끌어올리는가"를
// 계산하는 공식이 예전엔 여러 군데(getEnemyScaleMultiplier의 dangerLevel
// 직접 계산, autoDetectAndRegisterEnemy의 자체 계산, AI 프롬프트의 별도
// 키워드 추측)에 따로따로 있었고, 서로 다른 숫자를 말하는 문제가 있었다.
// 이제 이 함수 하나로 통일한다 — getLocationLevelBand(장소 정체성)를
// 기반으로, 게임 전역에서 이미 쓰는 것과 같은 완만한 제곱근 곡선
// (getEnemyScaleMultiplier의 levelMult와 동일한 형태)을 적용한다.
export function getLocationPowerScale(loc){
  const band = getLocationLevelBand(loc);
  const lv = Math.round((band[0] + band[1]) / 2);
  return 1 + Math.sqrt(Math.max(0, lv - 1)) * 0.2;
}
window.getLocationPowerScale = getLocationPowerScale;

// [생태계 시스템] 장소별로 "이 몬스터가 최근 얼마나 흔한지"(abundance,
// 0~100)를 추적한다. 이름별로 관리하는 이유는 AI가 그때그때 서술하는
// 이름이 자유형이라 티어 묶음으로만 관리하면 이름 정체성이 흐려지기
// 때문 — 대신 각 이름의 MONSTER_TIER_TABLE 등급(tier)을 함께 저장해서
// 포식 관계·회복 속도를 등급으로 계산한다. loc.id 기준으로 저장하므로
// AI가 즉석에서 만든 장소든 원래 있던 장소든 구분 없이 동일하게 동작한다.
export const LOC_ECO_KEY = 'tf-loc-ecosystem';

export function loadLocEco(){ try{ return JSON.parse(lsGet(LOC_ECO_KEY)||'{}'); }catch(e){ return {}; } }
window.loadLocEco = loadLocEco;

export function saveLocEco(d){ try{ lsSet(LOC_ECO_KEY, JSON.stringify(d)); }catch(e){} }
window.saveLocEco = saveLocEco;

// 등급이 낮을수록(약할수록) 원래 그 자리에 있어야 할 "평형 개체수"가 높고,
// 회복도 빠르다(토끼처럼 빨리 번식) — 등급이 높을수록(강할수록) 평형
// 개체수는 낮고 회복도 느리다(늑대·곰 같은 상위 포식자는 천천히 는다).
function _ecoDefaultsForTier(tier){
  const t = Math.min(13, Math.max(1, tier||3));
  const equilibrium  = Math.max(15, 90 - t*6);
  const regenPerTurn = Math.max(0.3, 4 - t*0.3);
  return { equilibrium, regenPerTurn };
}
window._ecoDefaultsForTier = _ecoDefaultsForTier;

// 이 장소에서 이 이름의 몬스터가 처음 목격됐을 때 개체수 기록을 만든다.
// 이미 있으면 아무것도 하지 않는다(기존 개체수를 존중).
export function registerLocEcoEncounter(locId, name, tier, curTurn){
  if(!locId || !name) return;
  const eco = loadLocEco();
  if(!eco[locId]) eco[locId] = {};
  if(!eco[locId][name]){
    const { equilibrium } = _ecoDefaultsForTier(tier);
    eco[locId][name] = { abundance: equilibrium, tier: tier||3, lastTick: curTurn||0 };
    saveLocEco(eco);
  }
}
window.registerLocEcoEncounter = registerLocEcoEncounter;

// 시간(턴)이 지난 만큼 각 개체수를 평형치를 향해 서서히 회복시킨다 —
// 사냥해서 줄어든 개체수는 시간이 지나면 자연히 다시 늘어난다.
export function tickLocEcosystem(locId, curTurn){
  if(!locId) return;
  const eco = loadLocEco();
  const rec = eco[locId];
  if(!rec) return;
  let changed = false;
  Object.values(rec).forEach(e => {
    const dt = Math.max(0, (curTurn||0) - (e.lastTick||0));
    if(dt <= 0) return;
    const { equilibrium, regenPerTurn } = _ecoDefaultsForTier(e.tier);
    if(e.abundance < equilibrium){
      e.abundance = Math.min(equilibrium, e.abundance + regenPerTurn*dt);
      changed = true;
    }
    e.lastTick = curTurn||0;
  });
  if(changed) saveLocEco(eco);
}
window.tickLocEcosystem = tickLocEcosystem;

// 몬스터가 죽으면: (1) 그 이름 자체의 개체수가 줄고 (2) 그보다 낮은
// 등급(먹이 관계상 하위)의 개체수는 포식 압박이 줄어드니 소폭 늘어난다 —
// 늑대를 많이 잡으면 토끼가 느는, 흔한 생태계 법칙을 그대로 반영.
export function onLocMonsterKilled(locId, name, tier, curTurn){
  if(!locId || !name) return;
  const eco = loadLocEco();
  const rec = eco[locId];
  if(!rec) return;
  if(rec[name]){
    rec[name].abundance = Math.max(0, rec[name].abundance - 15);
    rec[name].lastTick = curTurn||rec[name].lastTick||0;
  }
  Object.entries(rec).forEach(([n, e]) => {
    if(n === name) return;
    if((e.tier||3) < (tier||3)) e.abundance = Math.min(100, e.abundance + 3);
  });
  saveLocEco(eco);
}
window.onLocMonsterKilled = onLocMonsterKilled;

// 후보 이름 목록 중 하나를, 그 장소에서의 현재 개체수(abundance)에 비례한
// 확률로 골라준다 — 기록이 없는 이름은 중간값(50) 취급. 흔한 놈이 자주
// 나오고, 씨가 마른 놈은 거의 안 나오게 된다.
export function pickWeightedLocEcoName(locId, candidateNames){
  if(!candidateNames || !candidateNames.length) return null;
  const eco = loadLocEco();
  const rec = (locId && eco[locId]) || {};
  const weights = candidateNames.map(n => Math.max(1, rec[n]?.abundance ?? 50));
  const total = weights.reduce((a,b)=>a+b, 0);
  let r = Math.random() * total;
  for(let i=0; i<candidateNames.length; i++){
    r -= weights[i];
    if(r <= 0) return candidateNames[i];
  }
  return candidateNames[candidateNames.length-1];
}
window.pickWeightedLocEcoName = pickWeightedLocEcoName;

export function renderLocationPanel(){
  const body = document.getElementById('pb-location');
  if(!body) return;
  const loc = window.currentLocation || loadCurrentLocation();
  const visited = loadLocations();

  if(!loc){
    body.innerHTML = `
      <div style="text-align:center;padding:20px;color:var(--dim);font-size:11px">현재 특정 장소에 있지 않습니다.<br>이동하거나 탐험하면 장소가 감지됩니다.</div>
      ${visited.length>0?`
        <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin:10px 0 6px;letter-spacing:1px">방문한 장소 (${visited.length})</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          ${visited.map(v=>`<div style="padding:4px 9px;background:#0d0800;border:1px solid var(--border);border-radius:2px;font-size:11px;cursor:pointer" onclick="(window.beginJourneyTo||moveToLocation)('${esc(v.name)}')">${typeof getEntityIconHTML==='function'?getEntityIconHTML(v,{size:11}):(v.icon)} ${esc(v.name)}</div>`).join('')}
        </div>`:''}
    `;
    return;
  }

  body.innerHTML = `
    <!-- 현재 위치 -->
    <div style="padding:12px;background:#1a1005;border:1px solid var(--gold);margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:26px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:26}):loc.icon}</span>
        <div>
          <div style="font-family:Cinzel,serif;font-size:13px;color:var(--gold)">${esc(loc.name)}</div>
          <div style="font-size:10px;color:var(--dim)">${
            loc.type==='city'?'🏙️ 도시':
            loc.type==='capital'?'🏰 수도':
            loc.type==='town'?'🏘️ 중소도시':
            loc.type==='village'?'🏚️ 마을':
            loc.type==='hamlet'?'🛖 소촌':
            loc.type==='dungeon'?'🗝️ 던전':
            loc.type==='shrine'?'⛩️ 성소':
            loc.type==='event'?'⚔️ 이벤트 장소':
            loc.type==='port'?'⚓ 항구':
            loc.type==='wilderness'?'🌾 황야':'✨ 특수 장소'
          }${loc.population ? ' · 👥 '+loc.population : ''} ${loc.dangerLevel?'· 위험도 '+'⚠️'.repeat(loc.dangerLevel):''} ${
            loc.continent==='central'?'· 🏰 중앙대륙':
            loc.continent==='north'?'· ❄️ 북대륙':
            loc.continent==='west'?'· ⚓ 서대륙':
            loc.continent==='south'?'· 🌴 남대륙':
            loc.continent==='east'?'· 🌸 동대륙':''
          }</div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--dim);line-height:1.5">${esc(loc.desc)}</div>
    </div>

    <!-- ★ 영지 전용 패널 -->
    ${loc.isDemesne ? _renderDemesneLocationBlock() : ''}

    <!-- 이동수단 바 -->
    ${renderTransportBar()}

    <!-- 탭 -->
    ${(()=>{
      const locNpcs = getOrAssignLocNpcs(loc);
      const playerNpcsHere = getPlayerNpcsAtLoc(loc);
      const hasLocNpcs = locNpcs.length > 0 || playerNpcsHere.length > 0;
      const npcCount = locNpcs.length + playerNpcsHere.length;
      return `<div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap">
      <button class="m-tab act" id="loc-tab-shop" onclick="switchLocTab('shop',this)" style="flex:1;min-width:60px">🏪 상점</button>
      <button class="m-tab" id="loc-tab-interact" onclick="switchLocTab('interact',this)" style="flex:1;min-width:60px">💬 상호작용</button>
      ${hasLocNpcs
        ? `<button class="m-tab" id="loc-tab-npc" onclick="switchLocTab('npc',this)" style="flex:1;min-width:60px">👥 NPC <span style="font-size:8px;background:#2a4a2a;border-radius:8px;padding:1px 5px;color:#80d080">${npcCount}</span></button>`
        : `<button class="m-tab" id="loc-tab-npc-empty" disabled style="flex:1;min-width:60px;opacity:0.35;cursor:not-allowed" title="이 장소에 NPC가 없습니다">👥 NPC</button>`
      }
      ${['hamlet','village','town','city','capital','port'].includes(loc.type)?`<button class="m-tab" id="loc-tab-bulletin" onclick="switchLocTab('bulletin',this)" style="flex:1;min-width:60px">📋 게시판</button>`:''}
    </div>`;
    })()}

    <div id="loc-shop-content">${renderLocationShops(loc)}</div>
    <div id="loc-interact-content" style="display:none">${renderLocationInteractions(loc)}</div>
    <div id="loc-npc-content" style="display:none">${renderLocationNpcs(loc)}</div>
    <div id="loc-bulletin-content" style="display:none">${['hamlet','village','town','city','capital','port'].includes(loc.type)?window.renderBulletinBoard(loc):''}</div>
  `;
}
window.renderLocationPanel = renderLocationPanel;

export function switchLocTab(tab, el){
  if(el && el.disabled) return;
  document.querySelectorAll('#pb-location .m-tab:not([disabled])').forEach(t=>t.classList.remove('act'));
  el?.classList.add('act');
  document.getElementById('loc-shop-content').style.display = tab==='shop'?'block':'none';
  document.getElementById('loc-interact-content').style.display = tab==='interact'?'block':'none';
  const nc = document.getElementById('loc-npc-content');
  if(nc) nc.style.display = tab==='npc'?'block':'none';
  const bc = document.getElementById('loc-bulletin-content');
  if(bc) bc.style.display = tab==='bulletin'?'block':'none';
}
window.switchLocTab = switchLocTab;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_39(){
function getAllLocations(){
  const sid = S.scenario?.id||'medieval';
  const scenarioLocs = LOCATION_DATA[sid]||LOCATION_DATA.medieval;
  const extra = [];
  // ★ 영지 지도 연동: 영지가 개설되어 있으면 장소 목록에 동적 추가
  try{
    const _d = JSON.parse(lsGet('tf-demesne')||'null');
    if(_d && _d.established){
      // [B39 FIX] POP_STAGES/DEMESNE_TIERS는 최상위 const라 window.POP_STAGES로
      // 노출되지 않아 항상 폴백값만 쓰이던 버그. window. 없이 직접 참조.
      const _stage = (typeof POP_STAGES!=='undefined'?POP_STAGES:[])[Math.min(_d.popStage||0,4)] || {name:'마을',icon:'🏘️'};
      const _tier  = (typeof DEMESNE_TIERS!=='undefined'?DEMESNE_TIERS:[])[(_d.tier||1)-1] || {name:'영지',icon:'🏰'};
      extra.push({
        id:   'loc_demesne',
        name: _d.name || '나의 영지',
        icon: _d.popStage>=4?'👑':_d.popStage>=3?'🌇':_d.popStage>=2?'🌆':_d.popStage>=1?'🏙️':'🏘️',
        type: _d.popStage>=3?'city':_d.popStage>=1?'town':'village',
        continent: 'central',
        desc: `${_tier.name} · ${_stage.name} · 인구 ${window._fmtPop?window._fmtPop(_d.population||500):(_d.population||500)+'명'}`,
        population: `${window._fmtPop?window._fmtPop(_d.population||500):(_d.population||500)}명`,
        triggerKeywords: [
          (_d.name||'영지').toLowerCase(),
          '나의 영지','내 영지','영지로','영지에','영지를','본거지','영주의 성','영주 성','영주관','영주의 저택',
        ],
        shops: [], interactions: [],
        priceModifier: 0.9,
        isDemesne: true,
      });
    }
  }catch(e){}

  // [재설계] 감옥 — 단일 감옥이 아니라 등급이 나뉜다. 평소엔 그 지역
  // 대륙의 지방 감옥에 갇히지만, 누적 악명(ws.evilActs — 이미 존재하던
  // "선택할 때마다 쌓이는 악행 카운터")이 높거나 과거 탈출 전적이 있으면
  // 중앙대륙의 최고 보안 감옥(MAXSEC_JAIL_DEFS)으로 압송된다. 등급 판단
  // 로직은 checkArrestCondition()에 있고, 여기서는 이미 저장된
  // jail.tier 값을 그대로 반영해 장소를 구성한다.
  try{
    const jail = (typeof loadJailState==='function') ? loadJailState() : {};
    if(jail.jailed){
      const isMaxSec = jail.tier === 'maxsec';
      if(isMaxSec){
        const def = (typeof MAXSEC_JAIL_DEF !== 'undefined') ? MAXSEC_JAIL_DEF : null;
        extra.push({
          id: 'loc_jail',
          name: def?.name || '심연의 탑',
          icon: '⛓️',
          type: 'jail',
          continent: 'central',
          desc: def?.desc || '대륙 전역에서 악명 높은 죄수들이 압송되는 최고 보안 감옥. 살아서 나간 자가 거의 없다는 소문이 돈다.',
          triggerKeywords: ['최고보안감옥','심연의 탑','중앙감옥','대감옥'],
          shops: [],
          interactions: (typeof MAXSEC_JAIL_ACTIONS!=='undefined') ? MAXSEC_JAIL_ACTIONS : [],
          quests: [], infos: [],
          priceModifier: 1.0,
          isJail: true, isMaxSec: true,
        });
      } else {
        extra.push({
          id: 'loc_jail',
          name: (jail.location||'어딘가') + ' 감옥',
          icon: '🔒',
          type: 'jail',
          continent: jail.continent || 'central',
          desc: `차갑고 어두운 지방 감옥. 형기를 마치거나 탈출해야 벗어날 수 있다.`,
          triggerKeywords: ['감옥','수감','옥사','독방','형장'],
          shops: [],
          interactions: (typeof LOCAL_JAIL_ACTIONS!=='undefined') ? LOCAL_JAIL_ACTIONS : [],
          quests: [], infos: [],
          priceModifier: 1.0,
          isJail: true,
        });
      }
    }
  }catch(e){}

  // ★ 천계/마계 조건부 접근
  try{
    const race = (S.character?.race||'').toLowerCase();
    const flags = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
    const fath  = S.stats?.fath||0;

    // 천계 접근 조건: 세레스티얼 종족 OR 신앙 80+ OR 플래그 celestial_gate_open
    const canCelestial = race.includes('세레스티얼') || race.includes('celestial') ||
                         fath >= 80 || flags['celestial_gate_open'];
    if(canCelestial){
      extra.push(...(LOCATION_DATA.celestial||[]));
    }

    // 마계 접근 조건: 악마족 종족 OR 타락 4단계+ OR 플래그 infernal_gate_open
    const demonCorruptStage = (() => {
      try{ return JSON.parse(lsGet('tf-demon-corruption')||'{}').stage||0; }catch(e){ return 0; }
    })();
    const canInfernal = race.includes('악마') || race.includes('demon') ||
                        demonCorruptStage >= 4 || flags['infernal_gate_open'];
    if(canInfernal){
      extra.push(...(LOCATION_DATA.infernal||[]));
    }
  }catch(e){}

  // [신규] 숨겨진 종족 거주지(오크/다크링/언데드/뱀파이어) 필터링 —
  // hiddenUntilDiscovered:true인 장소는 tf-discovered-hidden-locs에
  // 등재되기 전까지 getAllLocations() 결과에서 제외된다. 이렇게 해야
  // 지도/이동 메뉴에 "발견 전엔 안 보인다"가 시스템적으로 강제된다.
  // 이 키는 환생 시 초기화된다(다음 생에서 다시 발견해야 함).
  const discoveredHidden = (()=>{ try{ return JSON.parse(lsGet('tf-discovered-hidden-locs')||'[]'); }catch(e){ return []; } })();
  const visibleScenarioLocs = scenarioLocs.filter(loc => !loc.hiddenUntilDiscovered || discoveredHidden.includes(loc.id));
  // [신규] SPECIAL_LOCATIONS(감시자의 영역 등 세계관 공통 특수 장소)도
  // 동일한 hidden 필터를 통과해야 한다. 다만 이런 장소는 "한 번 자격을
  // 증명하면 이후 모든 생에서 계속 보여야 하는" 영구 발견이어야 하므로
  // (예: 학자 히든 퀘스트로 여는 감시자의 영역 — 매 생 다시 학자를 해서
  // 깨야 한다면 사실상 그 생에서만 진 엔딩에 갈 수 있다는 뜻이 되어버려
  // 의도와 어긋난다), 환생 시 지워지는 discoveredHidden이 아니라 별도의
  // 영구 보존 키(tf-permanent-unlocked-locs, ALL_KEYS의 clear 대상이 아님)
  // 를 함께 확인한다. 두 키 중 하나에라도 등재돼 있으면 노출된다.
  const permanentlyUnlocked = (()=>{ try{ return JSON.parse(lsGet('tf-permanent-unlocked-locs')||'[]'); }catch(e){ return []; } })();
  const visibleSpecialLocs = SPECIAL_LOCATIONS.filter(loc => !loc.hiddenUntilDiscovered || discoveredHidden.includes(loc.id) || permanentlyUnlocked.includes(loc.id));

  return [...visibleScenarioLocs, ...visibleSpecialLocs, ...extra];
}
window.getAllLocations = getAllLocations;

function detectAndSetLocation(aiText){
  const lc = (aiText||'').toLowerCase();
  const allLocs = window.getAllLocations();
  for(const loc of allLocs){
    if(loc.triggerKeywords.some(kw=>lc.includes(kw))){
      if(!window.currentLocation || window.currentLocation.id !== loc.id){
        window.currentLocation = loc;
        saveCurrentLocation(loc);
        // 방문 기록
        const visited = loadLocations();
        if(!visited.find(v=>v.name===loc.name)){
          visited.push({ name:loc.name, icon:loc.icon, visitedAt:new Date().toISOString(), turn:S.msgCount });
          saveLocations(visited);
          toastHTML(`📍 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:14}):(loc.icon)} ${esc(loc.name)} 도착!`, 2500);
          if(typeof addExploredLocation==='function') addExploredLocation(loc.name, S.scenario?.id, loc.type);
          if(typeof recordExploredLocation==='function'){
            const _locTypeMap = {dungeon:'hidden_dungeon',shrine:'power_spot',ruins:'ancient_ruin',city:'trading_hub',village:'trading_hub'};
            const _mapType = _locTypeMap[loc.type];
            if(_mapType) recordExploredLocation(_mapType, S.scenario?.id);
          }
          if(loc.type==='ruins' && typeof recordRuin==='function'){
            const _ruinKwMap = {guild:['길드','조합'],castle:['성','궁전','요새'],temple:['신전','사원'],village:['마을','촌락'],library:['서고','도서관'],port:['항구','부두']};
            let _ruinType = 'castle';
            for(const [rtype,kws] of Object.entries(_ruinKwMap)){
              if(kws.some(kw=>loc.name.includes(kw))){ _ruinType = rtype; break; }
            }
            recordRuin(_ruinType, loc.name, S.scenario?.id);
          }
          // 특수 장소 업적
          if(loc.type==='dungeon') unlockAchievement('enter_dungeon');
          if(loc.type==='shrine') unlockAchievement('find_shrine');
        }
      }
      break;
    }
  }
}
window.detectAndSetLocation = detectAndSetLocation;
}

