// 동적 아이템 생성 시스템 (무제한 + 영구 캐시)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { ITEM_POOL } from '../data/006-세트-아이템-시스템.js';
import { DYN_MAT_TEMPLATES, RC_POINT_COST } from '../data/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { LEGEND_ARTIFACTS } from '../data/017-4150번-시스템.js';
import { CURSED_RELIC_TYPES } from '../data/019-71100번-환생-누적-시스템.js';
import { BLUEPRINT_SHOP, CRAFT_RECIPES, MATERIALS } from '../data/075-파트2-C-크래프팅-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RC } from '../data/086-퀘스트임무-수락-팝업-시스템.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { recordLegendShard } from '../misc/017-4150번-시스템.js';
import { addMaterial, loadBlueprints, renderCraftPanel, unlockBlueprint } from '../misc/075-파트2-C-크래프팅-시스템.js';
import { renderWorkshopPanel } from '../misc/253-SVG-타일-렌더링-작물-단계별-애니메이션.js';
import { recordCursedRelic } from '../progression/019-71100번-환생-누적-시스템.js';
import { getDynamicPriceMultiplier, getLearnedText, pickGeneratedObject, recordGeneratedObject, recordMarkovSample } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { esc, lsDel, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { applyLocationStockCut, getLocationPriceMult } from '../economy/332-정착지-경제-평판-시스템.js';
import { EQUIPPED_KEY, GOLD_KEY, INVENTORY_KEY } from './003-골드-인벤토리-시스템.js';
import { EQUIP_SLOTS } from './004-장비-슬롯-시스템-12종.js';
import { callGeminiDirect } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { callLocalModelJSON, tryCloudThenLocalModelThenBank } from '../quest/331-로컬-AI-모델-엔진.js';
import { generateItem, getAllSetItems } from './006-세트-아이템-시스템.js';

export const ITEM_CACHE_KEY = 'tf-item-cache';

export const ITEM_CACHE_VERSION = 1;

export function loadItemCache(){
  try{
    const d = JSON.parse(lsGet(ITEM_CACHE_KEY)||'{"v":1,"items":{}}');
    return d.items || {};
  }catch(e){ return {}; }
}
window.loadItemCache = loadItemCache;

export function saveItemCache(items){
  try{ lsSet(ITEM_CACHE_KEY, JSON.stringify({v:ITEM_CACHE_VERSION, items})); }catch(e){}
}
window.saveItemCache = saveItemCache;

export const REINC_CRAFT_PT_KEY = 'tf-reinc-craft-points';

export const REINC_CRAFT_UNLOCKED_KEY = 'tf-reinc-craft-unlocked';

export function loadRCPoints(){ try{ return parseInt(lsGet(REINC_CRAFT_PT_KEY)||'0'); }catch(e){ return 0; } }
window.loadRCPoints = loadRCPoints;

export function saveRCPoints(n){ try{ lsSet(REINC_CRAFT_PT_KEY, String(Math.max(0,n))); }catch(e){} }
window.saveRCPoints = saveRCPoints;

export function loadRCUnlocked(){ try{ return JSON.parse(lsGet(REINC_CRAFT_UNLOCKED_KEY)||'[]'); }catch(e){ return []; } }
window.loadRCUnlocked = loadRCUnlocked;

export function saveRCUnlocked(arr){ try{ lsSet(REINC_CRAFT_UNLOCKED_KEY, JSON.stringify(arr)); }catch(e){} }
window.saveRCUnlocked = saveRCUnlocked;

export function calcReincCraftPoints(cycle){
  // 기본 3pt + 10회차마다 +1 (최대 +9)
  return 3 + Math.min(9, Math.floor((cycle) / 10));
}
window.calcReincCraftPoints = calcReincCraftPoints;

export function unlockRecipeWithPoints(bpId){
  const dynBps = loadDynBlueprints();
  let saved = dynBps[bpId];
  // 동적 설계도에 없으면 정적 BLUEPRINT_SHOP에서 찾아 임시 saved 객체 구성
  if(!saved?.bpEntry){
    const staticBp = (typeof BLUEPRINT_SHOP!=='undefined') ? BLUEPRINT_SHOP[bpId] : null;
    if(staticBp){
      const recipe = (typeof CRAFT_RECIPES!=='undefined') ? CRAFT_RECIPES.find(r=>r.bpId===bpId) : null;
      saved = { bpEntry: staticBp, recipe: recipe || { icon: staticBp.icon, materials:{} } };
    }
  }
  if(!saved?.bpEntry) { toast('알 수 없는 설계도'); return; }

  const rarity = saved.bpEntry.rarity || 'common';
  const cost = RC_POINT_COST[rarity] || 1;
  const pts = loadRCPoints();

  if(pts < cost){ toast(`포인트 부족 (필요 ${cost}pt, 보유 ${pts}pt)`); return; }

  const unlocked = loadRCUnlocked();
  if(unlocked.includes(bpId)){ toast('이미 해금된 설계도'); return; }

  saveRCPoints(pts - cost);
  unlocked.push(bpId);
  saveRCUnlocked(unlocked);

  // 설계도도 함께 해금
  unlockBlueprint(bpId);

  toast(`🔓 설계도 해금! ${saved.bpEntry.name} (${cost}pt 소모, 잔여 ${pts-cost}pt)`, 4000);
  if(document.getElementById('p-craft')?.classList.contains('open')) renderCraftPanel();
  if(document.getElementById('p-workshop')?.classList.contains('open') && typeof renderWorkshopPanel==='function') renderWorkshopPanel();
  renderRCShopPanel && renderRCShopPanel();
}
window.unlockRecipeWithPoints = unlockRecipeWithPoints;

export function renderRCShopPanel(){
  const body = document.getElementById('pb-rc-shop');
  if(!body) return;

  const pts = loadRCPoints();
  const dynBps = loadDynBlueprints();
  const unlocked = new Set(loadRCUnlocked());
  const ownedBps = new Set(loadBlueprints());

  const rarityColor = {common:'#8a9a8a',uncommon:'#4a9a6a',rare:'#4a6fa5',epic:'#9060c0',legendary:'#c8a96e',primal:'#e0483c'};
  const rarityLabel = {common:'일반',uncommon:'고급',rare:'희귀',epic:'영웅',legendary:'전설',primal:'태초'};

  const entries = Object.entries(dynBps);
  if(!entries.length){
    body.innerHTML = `<div style="text-align:center;color:var(--dim);padding:30px;font-size:11px">
      아직 해금 가능한 설계도가 없습니다.<br>스토리에서 아이템을 발견하면 등록됩니다.
    </div>`;
    return;
  }

  const cards = entries.map(([bpId, saved]) => {
    if(!saved?.bpEntry || !saved?.recipe) return '';
    const bp = saved.bpEntry;
    const recipe = saved.recipe;
    const rarity = bp.rarity || 'common';
    const cost = RC_POINT_COST[rarity] || 1;
    const rc = rarityColor[rarity] || '#8a9a8a';
    const rl = rarityLabel[rarity] || '일반';
    const isUnlocked = ownedBps.has(bpId);
    const canAfford = pts >= cost;

    const matList = Object.entries(recipe.materials||{}).map(([id,n]) =>
      `${MATERIALS[id]?.icon||''}${MATERIALS[id]?.name||id}×${n}`
    ).join(', ');

    if(isUnlocked){
      return `<div style="padding:9px;background:#0a0800;border:1px solid #2a2010;margin-bottom:5px;opacity:0.5;border-radius:2px">
        <div style="display:flex;align-items:center;gap:7px">
          <span style="font-size:18px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(recipe,{size:18}):(recipe.icon||"📦")}</span>
          <div style="flex:1">
            <div style="font-family:Cinzel,serif;font-size:9px;color:${rc}">${esc(bp.name)} <span style="font-size:8px">[${rl}]</span></div>
            <div style="font-size:9px;color:var(--dim);margin-top:2px">${esc(matList)}</div>
          </div>
          <span style="font-size:9px;color:#4a8a4a;font-family:Cinzel,serif">✓ 해금</span>
        </div>
      </div>`;
    }

    return `<div style="padding:9px;background:#0d0900;border:1px solid ${canAfford?'#3a2a10':'#1a1005'};margin-bottom:5px;border-radius:2px;transition:border-color .2s">
      <div style="display:flex;align-items:center;gap:7px">
        <span style="font-size:18px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(recipe,{size:18}):(recipe.icon||"📦")}</span>
        <div style="flex:1">
          <div style="font-family:Cinzel,serif;font-size:9px;color:${rc}">${esc(bp.name)} <span style="font-size:8px">[${rl}]</span></div>
          <div style="font-size:9px;color:var(--dim);margin-top:2px">재료: ${esc(matList)}</div>
        </div>
        <button onclick="unlockRecipeWithPoints('${bpId}')"
          style="padding:5px 9px;background:${canAfford?'linear-gradient(135deg,#2a1f0a,#3a2a10)':'#0d0800'};border:1px solid ${canAfford?'var(--gold)':'#2a1a05'};color:${canAfford?'var(--gold)':'#4a3a20'};font-family:Cinzel,serif;font-size:9px;cursor:${canAfford?'pointer':'not-allowed'};border-radius:2px;white-space:nowrap">
          🔓 ${cost}pt
        </button>
      </div>
    </div>`;
  }).join('');

  body.innerHTML = `
    <div style="padding:10px 12px;background:#0a0700;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <span style="font-family:Cinzel,serif;font-size:10px;color:var(--gold)">✨ 환생 포인트</span>
      <span style="font-family:Cinzel,serif;font-size:14px;color:var(--gold)">${pts}<span style="font-size:9px;color:var(--dim)"> pt</span></span>
    </div>
    <div style="padding:0 10px 4px;font-size:9px;color:var(--dim);margin-bottom:6px">
      환생할 때마다 포인트 획득 · 등급이 높을수록 많은 포인트 필요
      <div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px">
        ${Object.entries(RC_POINT_COST).map(([r,c])=>`<span style="padding:2px 6px;background:#0d0800;border:1px solid #2a1a05;border-radius:2px;font-size:8px;color:${rarityColor[r]}">${rarityLabel[r]} ${c}pt</span>`).join('')}
      </div>
    </div>
    <div style="padding:0 8px">${cards}</div>
  `;
}
window.renderRCShopPanel = renderRCShopPanel;

export const DYN_MAT_KEY      = 'tf-dynamic-materials';

export const DYN_ENEMY_KEY    = 'tf-dynamic-enemies';

export const DYN_NPC_KEY      = 'tf-dynamic-npcs';

export const DYN_ENCOUNTER_KEY= 'tf-dynamic-encounters';

export function loadDynMaterials()  { try{ return JSON.parse(lsGet(DYN_MAT_KEY)     ||'{}'); }catch(e){ return {}; } }
window.loadDynMaterials = loadDynMaterials;

export function saveDynMaterials(d) { try{ lsSet(DYN_MAT_KEY,      JSON.stringify(d)); }catch(e){} }
window.saveDynMaterials = saveDynMaterials;

export function loadDynEnemies()    { try{ return JSON.parse(lsGet(DYN_ENEMY_KEY)   ||'{}'); }catch(e){ return {}; } }
window.loadDynEnemies = loadDynEnemies;

export function saveDynEnemies(d)   { try{ lsSet(DYN_ENEMY_KEY,    JSON.stringify(d)); }catch(e){} }
window.saveDynEnemies = saveDynEnemies;

export function loadDynNpcs()       { try{ return JSON.parse(lsGet(DYN_NPC_KEY)     ||'{}'); }catch(e){ return {}; } }
window.loadDynNpcs = loadDynNpcs;

export function saveDynNpcs(d)      { try{ lsSet(DYN_NPC_KEY,      JSON.stringify(d)); }catch(e){} }
window.saveDynNpcs = saveDynNpcs;

export function loadDynEncounters() { try{ return JSON.parse(lsGet(DYN_ENCOUNTER_KEY)||'[]'); }catch(e){ return []; } }
window.loadDynEncounters = loadDynEncounters;

export function saveDynEncounters(d){ try{ lsSet(DYN_ENCOUNTER_KEY,JSON.stringify(d)); }catch(e){} }
window.saveDynEncounters = saveDynEncounters;

export function registerDynNpcFromText(name, type, contextSnippet) {
  if (!name || name.length < 2) return;
  const npcId = 'npc_' + name.trim().toLowerCase()
    .replace(/[^가-힣a-z0-9]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'').slice(0,30)
    + '_' + name.charCodeAt(0);

  const dynNpcs = loadDynNpcs();
  const loc  = (typeof loadCurrentLocation === 'function' ? loadCurrentLocation() : null);
  const locName = loc ? (loc.name || '') : '';
  const scenario = S.scenario?.id || 'custom';
  const turn = S.msgCount || 0;

  if (dynNpcs[npcId]) {
    // 이미 있으면 등장 횟수·최근 문맥만 업데이트
    dynNpcs[npcId].appearances = (dynNpcs[npcId].appearances || 1) + 1;
    dynNpcs[npcId].lastContext = contextSnippet.slice(0, 200);
    dynNpcs[npcId].lastSeen = new Date().toISOString();
    dynNpcs[npcId].lastTurn = turn;
  } else {
    dynNpcs[npcId] = {
      id:          npcId,
      name:        name,
      type:        type,           // 'enemy' | 'npc' | 'boss' | 'humanoid'
      scenario:    scenario,
      location:    locName,
      firstContext:contextSnippet.slice(0, 200),
      lastContext: contextSnippet.slice(0, 200),
      appearances: 1,
      firstSeen:   new Date().toISOString(),
      lastSeen:    new Date().toISOString(),
      firstTurn:   turn,
      lastTurn:    turn,
      dynamic:     true,
    };
  }
  saveDynNpcs(dynNpcs);

  // 조우 로그에도 한 줄 추가
  const encounters = loadDynEncounters();
  encounters.push({ turn, name, type, location: locName, scenario, context: contextSnippet.slice(0,150), at: new Date().toISOString() });
  // 무제한 저장 (하드코딩 소스 데이터 수집용)
  saveDynEncounters(encounters);
}
window.registerDynNpcFromText = registerDynNpcFromText;

export function restoreDynamicMaterials(){
  const saved = loadDynMaterials();
  Object.entries(saved).forEach(([id, mat]) => {
    if(!MATERIALS[id]) MATERIALS[id] = mat;
  });
}
window.restoreDynamicMaterials = restoreDynamicMaterials;

export function restoreDynamicEnemies(){
  // 재료 복원만 하면 됨 - 드롭은 런타임에 loadDynEnemies()로 참조
}
window.restoreDynamicEnemies = restoreDynamicEnemies;

export function enemyNameToId(name){
  if(!name) return 'unknown';
  return 'enemy_' + name.trim()
    .toLowerCase()
    .replace(/[^가-힣a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 30);
}
window.enemyNameToId = enemyNameToId;

export function getOrCreateEnemyMaterials(enemyName, rarity='common'){
  if(!enemyName) return [];
  const enemyId = enemyNameToId(enemyName);
  const saved = loadDynEnemies();
  const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  const locName = loc ? (loc.name||'') : '';
  const turn = S?.msgCount || 0;

  // 이미 있으면 조우 정보만 갱신하고 그대로 반환 (재료는 재생성하지 않음)
  if(saved[enemyId]){
    saved[enemyId].encounters = (saved[enemyId].encounters||1) + 1;
    saved[enemyId].lastSeenTurn = turn;
    if(locName) saved[enemyId].lastLocation = locName;
    saveDynEnemies(saved);
    return saved[enemyId].materialIds || [];
  }

  // 재료 생성
  const dynMats = loadDynMaterials();
  const templates = DYN_MAT_TEMPLATES[rarity] || DYN_MAT_TEMPLATES['common'];
  // 등급에 따라 재료 2~3종
  const count = (rarity === 'legendary' || rarity === 'epic') ? 3 : 2;
  // 결정적(deterministic) 선택 — 같은 적은 항상 같은 재료
  const seed = enemyName.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const picked = [];
  for(let i=0; i<count; i++){
    picked.push(templates[(seed + i * 7) % templates.length]);
  }
  // 중복 제거
  const unique = [...new Map(picked.map(t=>[t.suffix,t])).values()];

  const materialIds = unique.map(tmpl => {
    const matId = enemyId + '_' + tmpl.suffix.replace(/[^가-힣a-z]/g,'_');
    if(!dynMats[matId]){
      const matDef = {
        id: matId,
        name: enemyName + tmpl.suffix,
        icon: tmpl.icon,
        desc: tmpl.desc + ` (${enemyName} 처치 시 획득)`,
        lore: (tmpl.loreTpl||'').replace(/\{name\}/g, enemyName),
        sourceEnemy: enemyName,
        rarity,
        dynamic: true,
      };
      dynMats[matId] = matDef;
      MATERIALS[matId] = matDef; // 런타임 즉시 등록
    }
    return matId;
  });

  // 적 등록 — 조우 횟수/최초·최근 등장 턴/위치까지 함께 기록
  saved[enemyId] = {
    id: enemyId, name: enemyName, rarity, materialIds,
    encounters: 1, firstSeenTurn: turn, lastSeenTurn: turn,
    lastLocation: locName,
  };
  saveDynEnemies(saved);
  saveDynMaterials(dynMats);

  return materialIds;
}
window.getOrCreateEnemyMaterials = getOrCreateEnemyMaterials;

export function getDynBestiarySection(){
  try{
    const saved = loadDynEnemies();
    const entries = Object.values(saved||{});

    const curLoc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    const curLocName = curLoc ? (curLoc.name||'') : '';

    // [신규] 현재 장소의 몬스터 풀 상태를 확인해, 신규 생성 확률을
    // 구체적인 수치로 AI에게 안내한다. 풀이 가득 찼으면(8/8) 절대
    // 새 몬스터를 만들지 말라고 강하게 지시해 확률 로직을 실질적으로
    // 강제한다.
    let poolSection = '';
    if(curLocName && typeof getLocationMonsterPool==='function'){
      const pool = getLocationMonsterPool(curLocName);
      const n = pool.length;
      const MAX = (typeof MAX_LOCATION_MONSTER_POOL_SIZE!=='undefined') ? MAX_LOCATION_MONSTER_POOL_SIZE : 8;
      if(n > 0){
        if(n >= MAX){
          poolSection = `\n[🎯 「${curLocName}」 몬스터 풀 가득 참 (${n}/${MAX})] 이 장소는 이미 몬스터 목록이 가득 찼습니다: ${pool.join(', ')}. 이 장소에서 몬스터를 등장시킬 때는 반드시 이 목록 중에서만 고르십시오 — 새로운 몬스터명을 지어내지 마십시오 (외부에서 흘러든 특별한 서사적 사건이 아니라면).`;
        } else {
          const chancePct = Math.round(100/(n+1));
          poolSection = `\n[🎯 「${curLocName}」 몬스터 풀 (${n}/${MAX})] 이 장소에 이미 등장한 몬스터: ${pool.join(', ')}. 새로운 몬스터를 지어낼 확률은 약 ${chancePct}%로 제한하십시오 — 대략 ${n+1}번에 1번 정도만 새 몬스터를 만들고, 나머지는 위 목록에서 재사용하십시오.`;
        }
      }
    }

    if(!entries.length) return poolSection;

    const sorted = entries.slice().sort((a,b)=>{
      const aHere = curLocName && a.lastLocation===curLocName ? 1 : 0;
      const bHere = curLocName && b.lastLocation===curLocName ? 1 : 0;
      if(aHere !== bHere) return bHere - aHere; // 현재 위치 몬스터 우선
      return (b.lastSeenTurn||0) - (a.lastSeenTurn||0); // 최근 조우 우선
    }).slice(0, 12);

    const lines = sorted.map(e=>{
      const hereTag = (curLocName && e.lastLocation===curLocName) ? ' 📍현재 위치' : (e.lastLocation ? ` (${e.lastLocation})` : '');
      return `• ${e.name} [${e.rarity}] — 조우 ${e.encounters||1}회${hereTag}`;
    }).join('\n');

    return `\n[🐺 이미 세계에 등장했던 몬스터] 아래는 이전에 실제로 등장해 재료가 확인된 몬스터들입니다. 완전히 새로운 몬스터를 매번 지어내는 대신, 상황과 장소가 어울린다면 이 목록의 몬스터를 우선적으로 재등장시키십시오 — 같은 몬스터가 다시 나타나면 세계가 일관되게 느껴지고, 그 몬스터 전용 재료도 계속 획득할 기회가 생깁니다. 물론 서사적으로 완전히 새로운 몬스터가 필요한 상황(새로운 지역, 새로운 사건)이라면 새로 지어내도 좋습니다.\n${lines}${poolSection}`;
  }catch(e){ return ''; }
}
window.getDynBestiarySection = getDynBestiarySection;

window.getDynBestiarySection = getDynBestiarySection;

export const LOCATION_MONSTER_POOL_KEY = 'tf-location-monster-pool';

export const MAX_LOCATION_MONSTER_POOL_SIZE = 8;

export function loadLocationMonsterPools(){ try{ return JSON.parse(lsGet(LOCATION_MONSTER_POOL_KEY)||'{}'); }catch(e){ return {}; } }
window.loadLocationMonsterPools = loadLocationMonsterPools;

export function saveLocationMonsterPools(d){ try{ lsSet(LOCATION_MONSTER_POOL_KEY, JSON.stringify(d)); }catch(e){} }
window.saveLocationMonsterPools = saveLocationMonsterPools;

export function getLocationMonsterPool(locationName){
  if(!locationName) return [];
  const pools = loadLocationMonsterPools();
  return pools[locationName]?.monsters || [];
}
window.getLocationMonsterPool = getLocationMonsterPool;

export function shouldGenerateNewMonster(locationName){
  if(!locationName) return true; // 위치 정보가 없으면 기존 동작(항상 신규 허용) 유지
  const pool = getLocationMonsterPool(locationName);
  const n = pool.length;
  if(n >= MAX_LOCATION_MONSTER_POOL_SIZE) return false; // 풀 가득 참 — 신규 생성 완전 차단
  const chance = 1 / (n + 1);
  return Math.random() < chance;
}
window.shouldGenerateNewMonster = shouldGenerateNewMonster;

export function pickExistingLocationMonster(locationName){
  const pool = getLocationMonsterPool(locationName);
  if(!pool.length) return null;
  return pool[Math.floor(Math.random()*pool.length)];
}
window.pickExistingLocationMonster = pickExistingLocationMonster;

export function registerLocationMonster(locationName, monsterName){
  if(!locationName || !monsterName) return;
  const pools = loadLocationMonsterPools();
  if(!pools[locationName]) pools[locationName] = { monsters: [], createdAt: new Date().toISOString() };
  if(!pools[locationName].monsters.includes(monsterName)){
    pools[locationName].monsters.push(monsterName);
  }
  saveLocationMonsterPools(pools);
}
window.registerLocationMonster = registerLocationMonster;

window.loadLocationMonsterPools = loadLocationMonsterPools;

window.getLocationMonsterPool = getLocationMonsterPool;

window.shouldGenerateNewMonster = shouldGenerateNewMonster;

window.pickExistingLocationMonster = pickExistingLocationMonster;

window.registerLocationMonster = registerLocationMonster;

export function rollDynamicMaterialDrop(enemyName, monsterRarity='common'){
  if(!enemyName) return;
  const matIds = getOrCreateEnemyMaterials(enemyName, monsterRarity);
  if(!matIds.length) return;

  const dropChance = { common:0.40, uncommon:0.30, rare:0.22, epic:0.15, legendary:0.10 };
  if(Math.random() > (dropChance[monsterRarity] || 0.30)) return;

  // matIds 중 랜덤 1개 드롭
  const matId = matIds[Math.floor(Math.random() * matIds.length)];
  addMaterial(matId, 1);

  // 이 재료를 사용하는 동적 레시피가 있으면 힌트
  const relatedRecipes = CRAFT_RECIPES.filter(r =>
    r.dynamic && r.materials && r.materials[matId]
  );
  if(relatedRecipes.length){
    setTimeout(()=>toast(`💡 ${MATERIALS[matId]?.name} — 제작에 활용할 수 있습니다`, 2500), 2200);
  }
}
window.rollDynamicMaterialDrop = rollDynamicMaterialDrop;

export function extractDefeatedEnemyName(text){
  if(!text) return null;
  // "X을/를 쓰러뜨", "X이/가 쓰러졌", "X을/를 처치", "X을/를 물리쳤" 패턴
  const patterns = [
    /([가-힣a-zA-Z\s]{2,12})(?:을|를)\s*(?:쓰러뜨|처치|물리쳤|해치웠|죽였|베었|쓰러트)/,
    /([가-힣a-zA-Z\s]{2,12})(?:이|가)\s*(?:쓰러졌|죽었|패배|쓰러지며|쓰러지고|사망)/,
    /(?:쓰러뜨린|처치한|물리친|죽인)\s*([가-힣a-zA-Z\s]{2,12})/,
  ];
  for(const pat of patterns){
    const m = text.match(pat);
    if(m){
      const name = (m[1]||m[2]||'').trim().replace(/^(그|저|이|적|한|어느|한|두)\s*/,'');
      if(name.length >= 2) return name;
    }
  }
  return null;
}
window.extractDefeatedEnemyName = extractDefeatedEnemyName;

export const DYN_BP_KEY = 'tf-dynamic-blueprints';

export function loadDynBlueprints(){ try{ return JSON.parse(lsGet(DYN_BP_KEY)||'{}'); }catch(e){ return {}; } }
window.loadDynBlueprints = loadDynBlueprints;

export function saveDynBlueprints(d){ try{ lsSet(DYN_BP_KEY, JSON.stringify(d)); }catch(e){} }
window.saveDynBlueprints = saveDynBlueprints;

export function registerDynamicBlueprint(item){
  if(!item?.id || !item?.name) return;
  const bpId = 'bp_dyn_' + item.id;
  const dynBps = loadDynBlueprints();
  if(dynBps[bpId]) return; // 이미 등록됐으면 스킵

  // 희귀도 기반 재료 자동 결정
  const rarity = item.rarity || 'common';

  // [수정] 이 아이템의 드롭 출처 적(item.sourceEnemy)이 있으면 동적 재료를
  // 우선 사용한다 — rollDynamicLoot()가 아이템 생성 시점에 이미 sourceEnemy를
  // 채워 넣으므로, "몬스터 → 재료 → 아이템/설계도"의 순서가 항상 보장된다.
  // getOrCreateEnemyMaterials()는 이미 그 몬스터의 재료가 존재하면(즉
  // rollDynamicLoot의 STEP 1에서 이미 확보됐으면) 캐시를 그대로 재사용하고
  // 새로 만들지 않으므로 중복 생성 걱정은 없다.
  const _srcEnemy = item.sourceEnemy || item.droppedBy || null;
  let mats;
  if(_srcEnemy){
    const _dynMatIds = getOrCreateEnemyMaterials(_srcEnemy, rarity);
    if(_dynMatIds.length){
      mats = {};
      _dynMatIds.forEach((mid, i) => { mats[mid] = i === 0 ? 2 : 1; });
    }
  }
  // 동적 재료 없으면 고정 재료 fallback
  if(!mats){
    const rarityMatMap = {
      common:    { herb_bundle:2 },
      uncommon:  { iron_ore:2, herb_bundle:1 },
      rare:      { magic_stone:2, silver_ore:1, rare_gem:1 },
      epic:      { magic_stone:3, void_shard:1, rare_gem:2 },
      legendary: { dragon_scale:2, void_shard:2, philosophers_ore:1 },
    };
    mats = rarityMatMap[rarity] || rarityMatMap['common'];
  }

  const bpEntry = {
    name: item.name + ' 설계도',
    icon: '📜',
    rarity,
    price: 0,
    howToGet: ['story'],
    dropRate: 0,
    dropTier: rarity === 'legendary' ? 'legendary' : rarity === 'epic' || rarity === 'rare' ? 'rare' : rarity,
    dynamic: true,
  };

  const recipeId = 'craft_dyn_' + item.id;
  const recipeEntry = {
    id: recipeId,
    bpId,
    name: item.name,
    icon: item.icon || '⚔️',
    category: item.slot || item.type || 'misc',
    materials: mats,
    result: { ...item },
    dynamic: true,
  };

  // 런타임 등록
  BLUEPRINT_SHOP[bpId] = bpEntry;
  if(!CRAFT_RECIPES.find(r => r.id === recipeId)){
    CRAFT_RECIPES.push(recipeEntry);
  }

  // localStorage에 설계도 + 레시피 전체 저장
  dynBps[bpId] = { bpEntry, recipe: recipeEntry };
  saveDynBlueprints(dynBps);

  // 설계도 자동 해금
  if(unlockBlueprint(bpId)){
    toastHTML(`📜 설계도 해금! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon||"")} ${esc(item.name)} 제작법 습득`, 3500);
  }
}
window.registerDynamicBlueprint = registerDynamicBlueprint;

export function restoreDynamicBlueprints(){
  const dynBps = loadDynBlueprints();
  Object.entries(dynBps).forEach(([bpId, saved]) => {
    if(!saved?.bpEntry || !saved?.recipe) return;
    // BLUEPRINT_SHOP 복원
    BLUEPRINT_SHOP[bpId] = saved.bpEntry;
    // CRAFT_RECIPES 복원 (중복 방지)
    if(!CRAFT_RECIPES.find(r => r.id === saved.recipe.id)){
      CRAFT_RECIPES.push(saved.recipe);
    }
  });
}
window.restoreDynamicBlueprints = restoreDynamicBlueprints;

export function addToItemCache(item){
  if(!item?.id) return;
  const cache = loadItemCache();
  if(!cache[item.id]){
    cache[item.id] = item;
    saveItemCache(cache);
    // AI가 생성한 아이템이면 동적 설계도 자동 등록
    registerDynamicBlueprint(item);
  }
}
window.addToItemCache = addToItemCache;

export function getAllCachedItems(){
  return Object.values(loadItemCache());
}
window.getAllCachedItems = getAllCachedItems;

// ══════════════════════════════════════════════════════════════════
// 로컬 아이템 생성 엔진 (AI 미사용) — 슬롯×희귀도 조합 기반 이름/능력치/
// 설명/배경 서사 조합. 전투 서술 로컬화(misc/328)와 같은 원리: 매번
// 조합이 달라지되 AI 호출이 전혀 없다. 학습 캐시(pickGeneratedObject)가
// 이미 쌓아둔 과거 항목을 우선 재사용하고, 그래도 부족한 만큼만 이
// 엔진이 새로 채운다.
// ══════════════════════════════════════════════════════════════════
function _itJosa(word, type){
  const ch = String(word).charCodeAt(String(word).length-1);
  const hasBatchim = ch>=0xAC00 && ch<=0xD7A3 && (ch-0xAC00)%28!==0;
  if(type==='을를') return hasBatchim ? '을' : '를';
  if(type==='이가') return hasBatchim ? '이' : '가';
  return '';
}
function _itFill(tpl, itemName){
  return tpl
    .replace(/\{item:을를\}/g, itemName+_itJosa(itemName,'을를'))
    .replace(/\{item:이가\}/g, itemName+_itJosa(itemName,'이가'))
    .replace(/\{item\}/g, itemName);
}
// noun과 icon을 쌍으로 묶어둔다 — 따로 뽑으면 "활 아이콘 + 철퇴 이름" 같은
// 불일치가 생길 수 있어(실제로 초기 버전에서 발생 확인), 항상 같은 쌍에서 고른다.
const LOCAL_ITEM_FORM_BANK = {
  weapon:    [['검','⚔️'],['장검','⚔️'],['단검','🗡️'],['도끼','🪓'],['창','🔱'],['활','🏹'],['철퇴','🔨'],['지팡이','🪄']],
  subweapon: [['방패','🛡️'],['토템','🗿'],['오브','🔮'],['부적','📜']],
  helmet:    [['투구','⛑️'],['후드','🥷'],['왕관','👑'],['가면','🎭']],
  armor:     [['갑옷','🥋'],['로브','🥼'],['조끼','🦺'],['흉갑','🛡️']],
  gloves:    [['장갑','🧤'],['건틀렛','🧤']],
  boots:     [['장화','👢'],['부츠','🥾']],
  cloak:     [['망토','🧣'],['외투','🧥']],
  necklace:  [['목걸이','📿'],['펜던트','📿']],
  ring1:     [['반지','💍']],
  ring2:     [['반지','💍']],
  belt:      [['허리띠','🪢'],['벨트','🪢']],
  trinket:   [['부적','📜'],['유물','🏺'],['장신구','🔮']],
};
const LOCAL_ITEM_STAT_POOL = {
  weapon:['str','agi','crit'], subweapon:['end','wil'], helmet:['end','per'],
  armor:['end','hp'], gloves:['agi','str'], boots:['agi'], cloak:['agi','wil'],
  necklace:['mgc','int'], ring1:['luk','crit'], ring2:['luk','crit'],
  belt:['end','str'], trinket:['mgc','fath'],
};
const LOCAL_ITEM_RARITY_PREFIX = {
  common:    ['낡은','투박한','평범한','가벼운'],
  uncommon:  ['정교한','단련된','예리한','견고한'],
  rare:      ['빛나는','마력이 깃든','서리 맺힌','불꽃을 두른'],
  epic:      ['심연에서 벼려진','영혼이 깃든','폭풍을 머금은'],
  legendary: ['태초의','신화 속','별빛의','세상을 가른'],
};
const LOCAL_ITEM_ORIGIN_BANK = ['멸망한 왕국의','잊혀진 마법사의','고대 용의','태고의 정령의','전설 속 기사의','심연에서 건져올린'];
const LOCAL_ITEM_RARITY_TIER = {
  common:    { statCount:1, mag:[2,5] },
  uncommon:  { statCount:2, mag:[3,8] },
  rare:      { statCount:2, mag:[6,14] },
  epic:      { statCount:3, mag:[10,20] },
  legendary: { statCount:3, mag:[15,30] },
};
const LOCAL_ITEM_DESC_BANK = {
  common:    ['어디서나 볼 수 있는 흔한 물건이다.','오래 써서 손에 익은 도구다.','투박하지만 제 몫은 한다.'],
  uncommon:  ['제법 손이 많이 간 물건이다.','전문 장인의 손길이 느껴진다.','평범한 물건보다는 한 수 위다.'],
  rare:      ['희귀한 재료로 만들어져 독특한 기운이 감돈다.','평범한 물건과는 격이 다르다.','손에 쥐는 순간 다른 무게감이 느껴진다.'],
  epic:      ['보는 것만으로도 위압감이 느껴진다.','아무나 다룰 수 없는 물건이다.','범상치 않은 기운이 은은하게 감돈다.'],
  legendary: ['전설로만 전해지던 물건이 눈앞에 있다.','시대를 초월한 존재감을 뿜어낸다.','역사에 이름을 남긴 물건임이 분명하다.'],
};
const LOCAL_ITEM_LORE_OPEN = [
  '{item:이가} 만들어진 경위는 정확히 전해지지 않는다.',
  '한때 이름 없는 장인의 손끝에서 태어났다고 한다.',
  '혼란스러운 시절, 누군가의 손에서 완성되었다고 전해진다.',
  '오래된 기록 어딘가에 이 물건에 대한 짧은 언급이 남아 있다.',
];
const LOCAL_ITEM_LORE_EVENT = [
  '한 차례 큰 전투를 거치며 그 존재가 세상에 알려졌다고 한다.',
  '주인이 몇 번이나 바뀌며 여러 이야기를 거쳐왔다.',
  '한동안 자취를 감췄다가 뜻밖의 장소에서 다시 발견되었다.',
  '이것을 두고 다툼이 벌어졌다는 이야기도 전해진다.',
];
const LOCAL_ITEM_LORE_CLOSE = [
  '지금도 그 진짜 내력을 아는 이는 많지 않다.',
  '{item:이가} 다시 누군가의 손에 들렸다는 사실만으로도 충분히 의미가 있다.',
  '전해지는 이야기의 진위는 확인할 길이 없지만, 그 존재감만은 부정할 수 없다.',
  '언젠가 또 다른 이야기를 새기게 될지도 모른다.',
];
function composeLocalItemLore(itemName, rarity){
  const parts = [_itFill(LOCAL_ITEM_LORE_OPEN[Math.floor(Math.random()*LOCAL_ITEM_LORE_OPEN.length)], itemName)];
  if(rarity==='rare' || rarity==='epic' || rarity==='legendary'){
    parts.push(_itFill(LOCAL_ITEM_LORE_EVENT[Math.floor(Math.random()*LOCAL_ITEM_LORE_EVENT.length)], itemName));
  }
  if(rarity==='legendary' || (rarity==='epic' && Math.random()<0.5)){
    parts.push(_itFill(LOCAL_ITEM_LORE_CLOSE[Math.floor(Math.random()*LOCAL_ITEM_LORE_CLOSE.length)], itemName));
  }
  return parts.join(' ');
}
// context(job/race/era)/slot/rarity를 받아 아이템 하나를 완전히
// 로컬로(AI 호출 없이) 생성한다 — 매번 이름·능력치·설명·배경 조합이 달라진다.
export function generateLocalItem(context, slot, rarity){
  const formBank = LOCAL_ITEM_FORM_BANK[slot] || LOCAL_ITEM_FORM_BANK.trinket;
  const [noun, icon] = formBank[Math.floor(Math.random()*formBank.length)];
  const prefixBank = LOCAL_ITEM_RARITY_PREFIX[rarity] || LOCAL_ITEM_RARITY_PREFIX.common;
  const prefix = prefixBank[Math.floor(Math.random()*prefixBank.length)];
  const useOrigin = (rarity==='rare'||rarity==='epic'||rarity==='legendary') && Math.random()<0.4;
  const origin = useOrigin ? LOCAL_ITEM_ORIGIN_BANK[Math.floor(Math.random()*LOCAL_ITEM_ORIGIN_BANK.length)]+' ' : '';
  const name = `${origin}${prefix} ${noun}`;

  const tier = LOCAL_ITEM_RARITY_TIER[rarity] || LOCAL_ITEM_RARITY_TIER.common;
  const statPool = (LOCAL_ITEM_STAT_POOL[slot] || LOCAL_ITEM_STAT_POOL.trinket).slice();
  const statCount = Math.min(tier.statCount, statPool.length);
  const effects = {};
  for(let i=0; i<statCount; i++){
    const idx = Math.floor(Math.random()*statPool.length);
    const stat = statPool.splice(idx,1)[0];
    effects[stat] = tier.mag[0] + Math.floor(Math.random()*(tier.mag[1]-tier.mag[0]+1));
  }

  // [패턴 학습] 실제 AI가 쓴 설명 문장이 충분히 쌓였으면(item_desc
  // 코퍼스) 그 패턴으로 새 문장을 즉석 생성해 40% 확률로 뱅크 대신
  // 사용 — 완전히 대체하지 않고 섞는 이유는 학습 코퍼스가 다시
  // 얇아지는 시기(예: 오랫동안 키를 안 쓴 경우)에도 항상 뱅크 문장이
  // 안전망으로 남아있게 하기 위함.
  const learnedDesc = Math.random()<0.4 ? getLearnedText('item_desc') : null;
  const descBank = LOCAL_ITEM_DESC_BANK[rarity] || LOCAL_ITEM_DESC_BANK.common;
  const desc = learnedDesc || descBank[Math.floor(Math.random()*descBank.length)];

  return {
    id: 'ai_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
    name, icon, rarity, slot, type:'equip', effects, desc,
    lore: composeLocalItemLore(name, rarity),
    _job: context.job||'', _era: context.era||'',
    // [버그 수정] 이 함수는 tryCloudThenLocalModelThenBank의 최종
    // "로컬 조합" 폴백인데 _aiGenerated:true로 잘못 표시하고 있었다.
    // 호출부(generateItemBatch)가 `if(item._aiGenerated) recordMarkovSample(...)`
    // 로 학습 코퍼스 기록 여부를 판단하므로, 이 값이 true인 채로 있으면
    // 뱅크 템플릿 문장이 "실제 AI가 쓴 문장"인 것처럼 코퍼스에 계속
    // 섞여 들어간다 — 다른 모든 생성 시스템에서 지켜온 "로컬 조합
    // 결과는 절대 학습 재료로 안 쓴다" 원칙이 아이템만 깨져 있었다.
    _aiGenerated: false,
  };
}
window.generateLocalItem = generateLocalItem;

export async function generateItemBatch(context={}, count=5, slots=null){
  const job     = context.job     || S.character?.role    || '모험가';
  const race    = context.race    || S.character?.race    || '인간';
  const era     = context.era     || S.scenario?.era      || '중세 판타지';
  const sid     = context.sid     || S.scenario?.id       || 'custom';
  const level   = context.level   || loadPlayerLevel()    || 1;
  const trigger = context.trigger || '일반';

  // 슬롯 자동 결정 (없으면 랜덤 분산)
  const allSlots = ['weapon','subweapon','helmet','armor','gloves','boots','cloak','necklace','ring1','belt','trinket'];
  const targetSlots = slots || Array.from({length:count},()=> allSlots[Math.floor(Math.random()*allSlots.length)]);

  // 희귀도 가중치 (레벨 기반)
  const rarityGuide = level<5  ? {common:0.50,uncommon:0.35,rare:0.13,legendary:0.02}
                    : level<10 ? {common:0.30,uncommon:0.40,rare:0.25,legendary:0.05}
                    : level<20 ? {common:0.15,uncommon:0.35,rare:0.38,legendary:0.12}
                    :            {common:0.05,uncommon:0.25,rare:0.45,legendary:0.25};
  function rollRarity(){
    const r = Math.random();
    let acc = 0;
    for(const [k,p] of Object.entries(rarityGuide)){ acc += p; if(r < acc) return k; }
    return 'common';
  }

  // 트리거 문자열엔 매번 달라지는 구체적 서사가 섞여있어 그대로는 버킷
  // 키로 못 쓴다(예: '전투 후 드롭. 검은 늑대를 쓰러뜨렸다') — 앞부분
  // "종류"만 남긴다. 레벨은 10단위로 묶어 밴드화.
  const triggerKind = String(trigger).split(/[.,:(]/)[0].trim() || '일반';
  const lvBand = Math.floor((level||1)/10);
  const itemBucketKey = 'itembatch|'+job+'|'+race+'|'+era+'|'+triggerKind+'|'+lvBand;
  const reusedBatch = [];
  for(let i=0;i<count;i++){
    const r = pickGeneratedObject(itemBucketKey);
    if(!r) break;
    reusedBatch.push({ ...r, id:'ai_'+Date.now()+'_'+Math.random().toString(36).slice(2,7), _aiGenerated:true, reusedFromLearning:true });
  }
  // 요청한 개수만큼 학습 캐시로 재사용 가능하면 그대로 반환 — 부족한
  // 만큼만 아래에서 로컬 생성 엔진으로 채운다(AI 호출은 어디에도 없음).
  if(reusedBatch.length === count){
    reusedBatch.forEach(it=>addToItemCache(it));
    return reusedBatch;
  }

  reusedBatch.forEach(it=>addToItemCache(it));
  const need = count - reusedBatch.length;
  const newItems = [];
  for(let i=0; i<need; i++){
    const slot = targetSlots[reusedBatch.length+i] || allSlots[Math.floor(Math.random()*allSlots.length)];
    const rarity = rollRarity();
    // [복원] AI 우선 — 키가 있으면 job/race/era/트리거를 반영한 진짜
    // 아이템을 시도하고, 없거나 실패·형식오류면 로컬 조합으로 폴백.
    const itemPrompt = `당신은 TaleForge RPG의 아이템 디자이너입니다. 아래 조건에 맞는 장비 1개를 JSON으로 생성하세요.
[세계관] ${era}
[캐릭터] ${race} ${job} (Lv.${level})
[슬롯] ${slot}
[희귀도] ${rarity}
[생성 계기] ${trigger}
반드시 다음 JSON만 출력하세요(다른 텍스트 금지):
{"name":"아이템 이름","icon":"이모지1개","effects":{"스탯키":수치},"desc":"1문장 설명","lore":"1문장 배경 설정"}
효과 스탯키는 str/agi/end/mgc/int/luk/per/wil/hp/mp 중에서 슬롯에 어울리는 것만 1~3개.`;
    const _shapeItem = (raw)=>{
      if(!raw || !raw.name) return null;
      return {
        id: 'ai_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
        name: raw.name, icon: raw.icon||'❔', rarity, slot, type:'equip',
        effects: raw.effects||{}, desc: raw.desc||'', lore: raw.lore||'',
        _job: job, _era: era, _aiGenerated: true,
      };
    };
    const item = await tryCloudThenLocalModelThenBank(
      async () => _shapeItem(await callGeminiDirect(itemPrompt)),
      async () => _shapeItem(await callLocalModelJSON(itemPrompt, { maxTokens: 300 })),
      () => generateLocalItem({job,race,era,sid,level}, slot, rarity),
      '아이템 생성'
    );
    addToItemCache(item); // 영구 캐시 저장 — 다음부턴 학습 재사용 대상이 됨
    recordGeneratedObject(itemBucketKey, { name:item.name, icon:item.icon, rarity:item.rarity, slot:item.slot, type:'equip', effects:item.effects, desc:item.desc, lore:item.lore });
    // [패턴 학습] 진짜 AI가 쓴 문장만 코퍼스에 누적 — 로컬 조합 문장을
    // 다시 학습 재료로 쓰면 뱅크 문장이 그대로 도돌이표로 순환될 뿐이라
    // "진짜 학습"이 아니게 됨.
    if(item._aiGenerated){
      if(item.desc) recordMarkovSample('item_desc', item.desc);
      if(item.lore) recordMarkovSample('item_lore', item.lore);
    }
    newItems.push(item);
  }

  return [...reusedBatch, ...newItems];
}
window.generateItemBatch = generateItemBatch;

export const SHOP_STOCK_CACHE_KEY = 'tf-shop-stock-cache';

export function loadShopStockCache(){ try{ return JSON.parse(lsGet(SHOP_STOCK_CACHE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadShopStockCache = loadShopStockCache;

export function saveShopStockCache(d){ try{ lsSet(SHOP_STOCK_CACHE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveShopStockCache = saveShopStockCache;

export async function getDynamicShopStock(){
  const base = getShopStock(); // 기존 고정 재고
  const loc = loadCurrentLocation();
  const locKey = (loc?.id||loc?.name||'unknown').replace(/[^a-z0-9가-힣]/gi,'_');
  const cacheStore = loadShopStockCache();
  const cached_shop = cacheStore[locKey];
  const turn = S.msgCount||0;

  // 같은 장소 20턴 이내면 캐시 재사용
  if(cached_shop && (turn - (cached_shop.turn||0)) < 20 && cached_shop.items?.length){
    const priceBase = {common:30,uncommon:70,rare:150,legendary:350};
    // [10번 후속 라운드] 고정 priceModifier·전역 동적배율 위에 "이 장소
    // 실제 번영도/교역로" 배율(economy/332)을 곱으로 추가.
    const locMod = (loc?.priceModifier||1.0) * getLocationPriceMult(loc?.id||locKey);
    const dynMod = typeof getDynamicPriceMultiplier==='function' ? getDynamicPriceMultiplier('misc') : 1.0;
    const modifier = locMod * dynMod;
    const withPrice = (items) => items.map(it=>({...it, price:Math.round((priceBase[it.rarity]||50)*modifier)}));
    // base는 getShopStock() 안에서 이미 이 장소의 재고 배율만큼 잘려서
    // 나온다 — 여기서 다시 자르면 이중으로 줄어드니 병합 결과는 그대로 둔다.
    return [...withPrice(base), ...withPrice(cached_shop.items)]
      .filter((it,i,arr)=>arr.findIndex(x=>x.id===it.id)===i);
  }

  // 아이템 캐시에서 직업/세계관 맞는 것 최대 4개 우선 사용
  const itemCache = getAllCachedItems().filter(it=>{
    return it._era === S.scenario?.era || it._job === S.character?.role;
  }).slice(0, 4);

  // 캐시 부족분만 AI 신규 생성 (최대 6개 → 부족분만)
  const need = Math.max(0, 6 - itemCache.length);
  let aiItems = [];
  if(need > 0){
    aiItems = await generateItemBatch(
      {trigger:'상점 방문. '+(loc?.name||'일반 상점')},
      need,
      ['weapon','armor','helmet','necklace','ring1','trinket'].slice(0, need)
    );
  }

  const newStock = [...itemCache, ...aiItems].filter((it,i,arr)=>arr.findIndex(x=>x.id===it.id)===i);

  // 장소별 캐시 저장 (20턴 유효)
  cacheStore[locKey] = { items: newStock, turn, locName: loc?.name||'' };
  // 오래된 캐시 정리 (10개 이상이면 가장 오래된 것 제거)
  const keys = Object.keys(cacheStore);
  if(keys.length > 10){
    const oldest = keys.sort((a,b)=>(cacheStore[a].turn||0)-(cacheStore[b].turn||0))[0];
    delete cacheStore[oldest];
  }
  saveShopStockCache(cacheStore);

  const priceBase = {common:30,uncommon:70,rare:150,legendary:350};
  // [10번 후속 라운드] 여기도 동일하게 economy/332의 실제 번영도/교역로
  // 배율을 곱한다.
  const locMod = (loc?.priceModifier||1.0) * getLocationPriceMult(loc?.id||locKey);
  const dynMod = typeof getDynamicPriceMultiplier==='function' ? getDynamicPriceMultiplier('misc') : 1.0;
  const modifier = locMod * dynMod;
  const withPrice = (items) => items.map(it=>({...it, price:Math.round((priceBase[it.rarity]||50)*modifier)}));

  // base는 getShopStock() 안에서 이미 재고 배율만큼 잘려 나온다 — 새로
  // 생성/캐시에서 가져온 newStock 쪽만 여기서 한 번 더 잘라준다(이중
  // 적용 방지).
  return [...withPrice(base), ...withPrice(applyLocationStockCut(newStock, loc?.id||locKey))]
    .filter((it,i,arr)=>arr.findIndex(x=>x.id===it.id)===i);
}
window.getDynamicShopStock = getDynamicShopStock;

export async function rollDynamicLoot(context='', isBoss=false, enemyName=null){
  const count = isBoss ? 2 : (Math.random()<0.35 ? 1 : 0);
  if(!count) return [];

  const rarityHint = isBoss
    ? ['rare','rare','legendary'][Math.floor(Math.random()*3)]
    : Math.random()<0.6?'common':'uncommon';

  // 10% 확률로 세트 아이템 드롭
  if(isBoss && Math.random()<0.15){
    const allSetItems = getAllSetItems();
    const rareOrLegendary = allSetItems.filter(it=>it.rarity==='rare'||it.rarity==='legendary');
    if(rareOrLegendary.length) return [rareOrLegendary[Math.floor(Math.random()*rareOrLegendary.length)]];
  }
  // [연결] 보스 처치 시 낮은 확률로 전설 유물 조각 획득
  if(isBoss && Math.random()<0.12 && typeof recordLegendShard==='function' && typeof LEGEND_ARTIFACTS!=='undefined'){
    const _artifact = LEGEND_ARTIFACTS[Math.floor(Math.random()*LEGEND_ARTIFACTS.length)];
    if(_artifact) recordLegendShard(_artifact.id, S.scenario?.id);
  }
  if(isBoss && Math.random()<0.06 && typeof recordCursedRelic==='function' && typeof CURSED_RELIC_TYPES!=='undefined'){
    const _relic = CURSED_RELIC_TYPES[Math.floor(Math.random()*CURSED_RELIC_TYPES.length)];
    if(_relic){
      recordCursedRelic(_relic.id, S.scenario?.id);
      setTimeout(()=>toastHTML(`👁️ 저주받은 유물을 발견했다: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(_relic,{size:14}):(_relic.icon)} ${esc(_relic.name)}`, 4000), 1500);
    }
  }
  // 50% 확률로 캐시에서, 50%로 AI 신규 생성
  if(Math.random()<0.5){
    const cached = getAllCachedItems().filter(it=>it.rarity===rarityHint||(!isBoss&&it.rarity==='common'));
    if(cached.length) return [cached[Math.floor(Math.random()*cached.length)]];
  }

  // ── STEP 1: 몬스터 → 재료 먼저 확보 (신규 몬스터면 생성, 기존이면 캐시 재사용) ──
  if(enemyName && typeof getOrCreateEnemyMaterials==='function'){
    getOrCreateEnemyMaterials(enemyName, rarityHint);
  }

  // ── STEP 2: 재료 → 아이템 생성 (AI 호출, 동시 중복 생성 방지 가드) ──
  if(S._itemGenBusy) return [];
  S._itemGenBusy = true;
  let newItems;
  try{
    newItems = await generateItemBatch({trigger:'전투 후 드롭. '+context, era:S.scenario?.era||'중세 판타지'}, count);
  } finally{
    S._itemGenBusy = false;
  }

  // ── STEP 3: 아이템에 sourceEnemy를 명시적으로 채워, addToItemCache가
  //    호출하는 registerDynamicBlueprint가 정확히 이 몬스터의 재료를
  //    요구하는 설계도를 만들도록 연결한다. ──
  if(enemyName){
    newItems.forEach(it=>{ if(it && !it.sourceEnemy) it.sourceEnemy = enemyName; });
  }

  newItems.forEach(it=>addToItemCache(it));
  return newItems;
}
window.rollDynamicLoot = rollDynamicLoot;

export async function rollDynamicScavenge(locationType='dungeon'){
  const rateMap={dungeon:0.55,ruins:0.45,battlefield:0.4,shrine:0.3,village:0.15,city:0.1};
  if(Math.random()>(rateMap[locationType]||0.2)) return null;

  // 60% 캐시, 40% AI 신규
  if(Math.random()<0.6){
    const cached = getAllCachedItems();
    if(cached.length) return cached[Math.floor(Math.random()*cached.length)];
  }

  const items = await (async()=>{
    if(S._itemGenBusy) return [];
    S._itemGenBusy = true;
    try{
      return await generateItemBatch(
        {trigger:'탐색 발견. 장소: '+(loadCurrentLocation()?.name||locationType)},
        1
      );
    } finally{
      S._itemGenBusy = false;
    }
  })();
  return items[0]||null;
}
window.rollDynamicScavenge = rollDynamicScavenge;

export function renderItemCodex(){
  const body = document.getElementById('pb-itemcodex');
  if(!body) return;
  const cached = getAllCachedItems();
  const pool = Object.values(ITEM_POOL).flat().filter(it=>it.name);

  // 슬롯별 분류
  const bySlot = {};
  [...pool, ...cached].forEach(it=>{
    const sl = it.slot||'trinket';
    if(!bySlot[sl]) bySlot[sl]=[];
    if(!bySlot[sl].find(x=>x.id===it.id)) bySlot[sl].push(it);
  });

  body.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);margin-bottom:8px;letter-spacing:1px">
      📖 아이템 도감 — ${pool.length}개 기본 · ${cached.length}개 발견
    </div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">
      ${Object.keys(bySlot).map(sl=>{
        const def = EQUIP_SLOTS.find(s=>s.id===sl);
        return `<button class="btn btn-dark" style="padding:3px 8px;font-size:9px" onclick="filterCodex('${sl}')">${def?.icon||'📦'} ${def?.label||sl}(${bySlot[sl].length})</button>`;
      }).join('')}
    </div>
    <div id="codex-list">
      ${renderCodexSlot(Object.keys(bySlot)[0]||'weapon', bySlot)}
    </div>
  `;
  window._codexBySlot = bySlot;
}
window.renderItemCodex = renderItemCodex;

export function filterCodex(sl){
  const div = document.getElementById('codex-list');
  if(div && window._codexBySlot) div.innerHTML = renderCodexSlot(sl, window._codexBySlot);
}
window.filterCodex = filterCodex;

export function renderCodexSlot(sl, bySlot){
  const items = bySlot[sl]||[];
  const rarityOrder = {common:0,uncommon:1,rare:2,epic:3,legendary:4,primal:5};
  return items.sort((a,b)=>(rarityOrder[a.rarity]||0)-(rarityOrder[b.rarity]||0))
    .map(it=>{
      const rc = RC[it.rarity]||RC.common;
      return `<div style="padding:7px 9px;background:#0d0800;border:1px solid ${rc}33;margin-bottom:3px;display:flex;align-items:center;gap:7px">
        <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(it,{size:16}):(it.icon||"📦")}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:10px;color:${rc};font-family:'Cinzel',serif">${esc(it.name)}</div>
          <div style="font-size:9px;color:var(--dim)">${esc(it.desc||'')}</div>
          ${it.lore?`<div style="font-size:8px;color:#5a4a2a;font-style:italic;line-height:1.4;margin-top:2px;border-left:2px solid #2a1a05;padding-left:4px">${esc(it.lore)}</div>`:''}
          ${it.effects?`<div style="font-size:8px;color:#4a6fa5">${Object.entries(it.effects).filter(([k,v])=>v>0).map(([k,v])=>k.toUpperCase()+'+'+v).join(' ')}</div>`:''}
          ${it._aiGenerated?`<div style="font-size:8px;color:#a080e0">✨ ${esc(it._job||'')} ${esc(it._era||'')}</div>`:''}
        </div>
        <span style="font-size:8px;color:${rc};font-family:'Cinzel',serif">${it.rarity}</span>
      </div>`;
    }).join('') || '<div style="color:var(--dim);font-size:11px;padding:8px">없음</div>';
}
window.renderCodexSlot = renderCodexSlot;

export function getShopStock(locationId=null, scenarioId=null){
  const sid = scenarioId || S.scenario?.id || 'medieval';
  const loc = locationId || loadCurrentLocation()?.id || '';
  // 장소별 가격 배율
  const priceMap = { loc_capital:1.0, loc_village:1.3, loc_dungeon_ruins:1.5, loc_magic_tower:1.8, loc_settlement:0.8, loc_neon_district:1.3, loc_jianghu:0.9 };
  // [10번 후속 라운드] economy/332의 "그 장소 실제 번영도/교역로 상태"
  // 배율을 기존 고정 priceMap 위에 곱으로 얹는다 — 습격 피해로 번영도가
  // 떨어지면 이 상점 가격도 실제로 오르고, 회복되면 다시 내려간다.
  const modifier = (priceMap[loc] || 1.0) * getLocationPriceMult(loc);

  // 세계관별 기본 재고 (8~10개)
  const baseStock = {
    medieval: ['cs_001','cs_002','cs_003','wp_002','wp_016','ar_001','ar_004','hm_001','bt_001','tr_001'],
  };

  const ids = baseStock[sid] || baseStock.medieval;

  // 모든 풀에서 아이템 검색
  const allItems = Object.values(ITEM_POOL).flat();
  const items = ids.map(id=>{
    const it = allItems.find(x=>x.id===id);
    if(!it) return null;
    const basePrices = {common:30,uncommon:70,rare:150,legendary:350};
    const price = Math.round((basePrices[it.rarity]||50) * modifier);
    return {...it, price};
  }).filter(Boolean);
  // 번영도가 낮으면(경기 침체) 상인이 물건을 덜 들여놓는다 — 재고 종류
  // 수를 실제로 줄인다.
  return applyLocationStockCut(items, loc);
}
window.getShopStock = getShopStock;

export function rollLoot(monsterLevel=1, isBoss=false){
  const drops = [];
  // 보스: 2~3개 드롭 (희귀도 높음)
  // 일반: 30% 확률로 1개
  if(isBoss){
    const count = 2 + Math.floor(Math.random()*2);
    for(let i=0;i<count;i++){
      const rarity = Math.random()<0.5?'rare':'legendary';
      const item = generateItem(null, rarity);
      if(item) drops.push(item);
    }
  } else {
    if(Math.random()<0.3){
      const rarity = Math.random()<0.7?'common':(Math.random()<0.7?'uncommon':'rare');
      const item = generateItem(null, rarity);
      if(item) drops.push(item);
    }
  }
  return drops;
}
window.rollLoot = rollLoot;

export function rollScavenge(locationType='dungeon'){
  const rateMap = {dungeon:0.5, ruins:0.4, battlefield:0.35, village:0.15, city:0.1};
  const rate = rateMap[locationType]||0.2;
  if(Math.random()>rate) return null;
  const rarity = Math.random()<0.5?'common':(Math.random()<0.6?'uncommon':'rare');
  return generateItem(null, rarity);
}
window.rollScavenge = rollScavenge;

export function rollEventReward(eventType='quest'){
  const rarityMap = {quest:'uncommon', mainQuest:'rare', secretEnding:'legendary', npcQuest:'uncommon', bossKill:'rare'};
  const rarity = rarityMap[eventType]||'uncommon';
  return generateItem(null, rarity);
}
window.rollEventReward = rollEventReward;

export function detectItemDrop(aiText){
  const lc = (aiText||'').toLowerCase();
  const drops = [
    {keywords:['아이템','장비','획득','얻었','발견','떨어뜨','드롭'], fn:()=>generateItem()},
    {keywords:['포션','약'],fn:()=>({...ITEM_POOL.consume[Math.floor(Math.random()*3)],type:'consume'})},
    {keywords:['골드','금화'], fn:null}, // 골드는 goldM에서 처리
  ];
  for(const d of drops){
    if(d.fn && d.keywords.some(k=>lc.includes(k))){
      // 이미 sendMsg에서 골드/HP 파싱하므로 중복 방지
      if(lc.includes('획득')&&lc.includes('아이템')&&Math.random()<0.3){
        const item = d.fn();
        if(item&&item.name){
          S.inventory.push(item);
          saveInventory(S.inventory);
          toastHTML(`🎁 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon)} ${esc(item.name)} 획득!`,2500);
        }
      }
      break;
    }
  }
  // 탐색/수색 서사 감지 시 현재 장소 유형에 따라 스카빈지 드롭 시도
  if(['탐색','수색','뒤지','살펴보','뒤졌'].some(k=>lc.includes(k))){
    try{
      const locType = (window.currentLocation||loadCurrentLocation?.())?.type || 'dungeon';
      const item = typeof rollScavenge==='function' ? rollScavenge(locType) : null;
      if(item&&item.name){
        S.inventory.push(item);
        saveInventory(S.inventory);
        toastHTML(`🔍 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon)} ${esc(item.name)} 발견!`,2500);
      }
    }catch(e){}
  }
}
window.detectItemDrop = detectItemDrop;

export function mapOldSlot(item){
  if(!item.slot) return 'trinket';
  if(item.slot==='weapon') return 'weapon';
  if(item.slot==='armor'){
    // 이름으로 세분화
    const n = item.name||'';
    if(/투구|헬멧|모자|왕관|관/.test(n)) return 'helmet';
    if(/장갑|건틀렛/.test(n)) return 'gloves';
    if(/신발|부츠|장화/.test(n)) return 'boots';
    if(/망토|클로크|클록|외투|로브/.test(n)) return 'cloak';
    if(/방패|실드/.test(n)) return 'subweapon';
    return 'armor';
  }
  if(item.slot==='accessory'){
    const n = item.name||'';
    if(/목걸이|펜던트|초커/.test(n)) return 'necklace';
    if(/반지|링/.test(n)) return 'ring1';
    if(/허리|벨트|띠/.test(n)) return 'belt';
    // [B4 FIX] 'bracelet'은 EQUIP_SLOTS(12슬롯)에 없는 슬롯이라, 이 분기를
    // 타면 S.equipped['bracelet']이라는 존재하지 않는 슬롯에 저장되어
    // 장비창에 표시 안 되고 장착이 사실상 무효화될 잠재 위험이 있었다.
    // 다른 액세서리처럼 trinket으로 통일.
    if(/팔찌|브레이슬릿/.test(n)) return 'trinket';
    return 'trinket';
  }
  return item.slot;
}
window.mapOldSlot = mapOldSlot;

export function getItemSlot(item){
  if(item.slot && EQUIP_SLOTS.find(s=>s.id===item.slot)) return item.slot;
  return mapOldSlot(item);
}
window.getItemSlot = getItemSlot;

export const loadGold       = () => { const r = lsGet(GOLD_KEY); return r ? parseInt(r, 10) : 0; };

export const saveGold       = (n) => lsSet(GOLD_KEY, String(n));

export const clearGold      = () => lsDel(GOLD_KEY);

export const loadInventory  = () => { const r = lsGet(INVENTORY_KEY); return r ? JSON.parse(r) : []; };

export const saveInventory  = (inv) => lsSet(INVENTORY_KEY, JSON.stringify(inv));

export const clearInventory = () => lsDel(INVENTORY_KEY);

export const loadEquipped = () => {
  const r = lsGet(EQUIPPED_KEY);
  if(r){ try{
    const p = JSON.parse(r);
    // 구버전 3슬롯 → 12슬롯 마이그레이션
    const isOldFormat = p && !('helmet' in p) && !('gloves' in p);
    if(isOldFormat){
      const m = Object.fromEntries(EQUIP_SLOTS.map(s=>[s.id,null]));
      if(p.weapon) m.weapon = p.weapon;
      if(p.armor)  m.armor  = p.armor;
      if(p.accessory) m.trinket = p.accessory;
      lsSet(EQUIPPED_KEY, JSON.stringify(m));
      return m;
    }
    return Object.fromEntries(EQUIP_SLOTS.map(s=>[s.id, p[s.id]||null]));
  }catch(e){} }
  return Object.fromEntries(EQUIP_SLOTS.map(s=>[s.id,null]));
};

export const saveEquipped   = (eq) => lsSet(EQUIPPED_KEY, JSON.stringify(eq));

export const clearEquipped  = () => lsDel(EQUIPPED_KEY);

export const SAVE_VERSION = '2.0';

export const SAVE_VER_KEY = 'tf-save-version';

export function checkSaveVersion(){
  const saved = lsGet(SAVE_VER_KEY);
  if(saved !== SAVE_VERSION){
    // 버전 불일치 - 스탯 스케일이 변경됨
    if(saved && saved < '2.0'){
      // 구버전 stats 마이그레이션: 값들이 너무 작을 수 있음
      console.log('TaleForge: 저장 버전 마이그레이션', saved, '→', SAVE_VERSION);
    }
    lsSet(SAVE_VER_KEY, SAVE_VERSION);
  }
}
window.checkSaveVersion = checkSaveVersion;
