// 파트2-C: 크래프팅 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { BLUEPRINT_SHOP, CRAFT_RECIPES, MATERIALS } from '../data/075-파트2-C-크래프팅-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { ALCHEMY_MATERIALS, REMEDY_MATERIALS } from '../data/253-SVG-타일-렌더링-작물-단계별-애니메이션.js';
import { INTEL_MATERIALS, TALE_MATERIALS } from '../data/255-상인-거래소-교역-지부-확장.js';
import { addToItemCache, loadDynMaterials, saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { getAvailableRecipes } from '../job/029-숨겨진-직업-시스템.js';
import { renderShop } from '../job/087-전직-조건-저장로드-헬퍼-퀘스트아이템장소-등.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';

export const CRAFT_KEY = 'tf-crafted';

export function loadCrafted(){ try{ return JSON.parse(lsGet(CRAFT_KEY)||'[]'); }catch(e){ return []; } }
window.loadCrafted = loadCrafted;

export function saveCrafted(d){ try{ lsSet(CRAFT_KEY, JSON.stringify(d)); }catch(e){} }
window.saveCrafted = saveCrafted;

export const BLUEPRINT_KEY = 'tf-blueprints';

export function loadBlueprints(){ try{ return JSON.parse(lsGet(BLUEPRINT_KEY)||'[]'); }catch(e){ return []; } }
window.loadBlueprints = loadBlueprints;

export function saveBlueprints(d){ try{ lsSet(BLUEPRINT_KEY, JSON.stringify(d)); }catch(e){} }
window.saveBlueprints = saveBlueprints;

export function hasBlueprint(id){ return loadBlueprints().includes(id); }
window.hasBlueprint = hasBlueprint;

export function unlockBlueprint(id){
  const bp = loadBlueprints();
  if(bp.includes(id)) return false;
  bp.push(id);
  saveBlueprints(bp);
  return true;
}
window.unlockBlueprint = unlockBlueprint;

export const BP_DROP_POOLS = {
  common:    Object.keys(BLUEPRINT_SHOP).filter(k=>BLUEPRINT_SHOP[k].dropTier==='common'),
  uncommon:  Object.keys(BLUEPRINT_SHOP).filter(k=>BLUEPRINT_SHOP[k].dropTier==='uncommon'),
  rare:      Object.keys(BLUEPRINT_SHOP).filter(k=>BLUEPRINT_SHOP[k].dropTier==='rare'),
  legendary: Object.keys(BLUEPRINT_SHOP).filter(k=>BLUEPRINT_SHOP[k].dropTier==='legendary'),
};

export function rollBlueprintDrop(monsterRarity='common'){
  const tierMap = { common:[{tier:'common',w:70},{tier:'uncommon',w:25},{tier:'rare',w:5}],
                    uncommon:[{tier:'common',w:40},{tier:'uncommon',w:45},{tier:'rare',w:14},{tier:'legendary',w:1}],
                    rare:[{tier:'uncommon',w:35},{tier:'rare',w:55},{tier:'legendary',w:10}],
                    legendary:[{tier:'rare',w:40},{tier:'legendary',w:60}] };
  const rolls = tierMap[monsterRarity]||tierMap['common'];
  const totalW = rolls.reduce((a,b)=>a+b.w,0);
  let r = Math.random()*totalW, chosen = rolls[0].tier;
  for(const t of rolls){ r-=t.w; if(r<=0){ chosen=t.tier; break; } }
  const pool = BP_DROP_POOLS[chosen]||[];
  if(!pool.length) return;
  const bpId = pool[Math.floor(Math.random()*pool.length)];
  const bp = BLUEPRINT_SHOP[bpId];
  if(!bp) return;
  const dropChance = bp.dropRate || 0.1;
  if(Math.random() > dropChance) return;
  if(unlockBlueprint(bpId)){
    toast(`📜 설계도 발견! [${bp.rarity.toUpperCase()}] ${bp.name}`, 4000);
  }
}
window.rollBlueprintDrop = rollBlueprintDrop;

export function giveBlueprint(bpId){
  const bp = BLUEPRINT_SHOP[bpId];
  if(!bp) return;
  if(unlockBlueprint(bpId)){
    toastHTML(`📜 설계도 획득! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(bp,{size:14}):(bp.icon)} ${esc(bp.name)}`, 4000);
  }
}
window.giveBlueprint = giveBlueprint;

export function buyBlueprint(bpId){
  const bp = BLUEPRINT_SHOP[bpId];
  if(!bp) return;
  if(hasBlueprint(bpId)){ toast('이미 보유한 설계도입니다'); return; }
  if(bp.price<=0){ toast('이 설계도는 구매 불가 — 특수 보상으로만 획득 가능합니다'); return; }
  if(!S||!S.gold||S.gold<bp.price){ toast(`골드 부족 (필요: ${bp.price}G)`); return; }
  S.gold -= bp.price;
  saveGold && saveGold(S.gold);
  unlockBlueprint(bpId);
  toast(`📜 구매 완료! ${bp.name} (${bp.price}G 소모)`, 3000);
  if(document.getElementById('p-craft')?.classList.contains('open')) renderCraftPanel();
  if(document.getElementById('p-shop')?.classList.contains('open')) renderShop&&renderShop();
}
window.buyBlueprint = buyBlueprint;

export function rollEventBlueprint(){
  if(Math.random()>0.12) return;
  const eventPool = Object.keys(BLUEPRINT_SHOP).filter(k=>BLUEPRINT_SHOP[k].howToGet.includes('event'));
  if(!eventPool.length) return;
  const bpId = eventPool[Math.floor(Math.random()*eventPool.length)];
  giveBlueprint(bpId);
}
window.rollEventBlueprint = rollEventBlueprint;

export const MATERIAL_BAG_KEY = 'tf-materials';

export function loadMaterials(){ try{ return JSON.parse(lsGet(MATERIAL_BAG_KEY)||'{}'); }catch(e){ return {}; } }
window.loadMaterials = loadMaterials;

export function saveMaterials(d){ try{ lsSet(MATERIAL_BAG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveMaterials = saveMaterials;

export function addMaterial(id, count=1){
  const bag = loadMaterials();
  bag[id] = (bag[id]||0) + count;
  saveMaterials(bag);
  const mat = MATERIALS[id];
  if(mat) toast(`${mat.name} ×${count} 획득!`, 2000, mat);
}
window.addMaterial = addMaterial;

export function craftItem(recipeId){
  const recipe = CRAFT_RECIPES.find(r=>r.id===recipeId);
  if(!recipe){ toast('레시피를 찾을 수 없습니다'); return; }

  // 설계도 확인
  if(recipe.bpId && !hasBlueprint(recipe.bpId)){
    const bp = BLUEPRINT_SHOP[recipe.bpId];
    toast(`📜 설계도 필요: ${bp?.name||'알 수 없는 설계도'}`); return;
  }

  const bag = loadMaterials();
  const missing = [];
  Object.entries(recipe.materials).forEach(([matId, need])=>{
    const have = bag[matId]||0;
    if(have < need) missing.push(`${MATERIALS[matId]?.name||loadDynMaterials()[matId]?.name||matId} ${need-have}개 부족`);
  });

  if(missing.length){ toast(`재료 부족: ${missing.join(', ')}`); return; }

  Object.entries(recipe.materials).forEach(([matId, need])=>{ bag[matId]-=need; });
  saveMaterials(bag);

  const item = {...recipe.result};
  S.inventory.push(item);
  saveInventory(S.inventory);
  addToItemCache(item);

  const crafted = loadCrafted();
  crafted.push(recipeId);
  saveCrafted(crafted);

  unlockAchievement('first_craft');
  // [B71 FIX] craftCount 통계가 어디서도 갱신되지 않아 "전설의 장인"
  // 업적(제작 100회)이 영원히 달성 불가능하던 버그.
  if(typeof window.updateStats==='function') window.updateStats('craftCount', 1);
  toastHTML(`⚗️ 제작 성공! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon)} ${esc(item.name)}`, 3000);
  renderCraftPanel();
}
window.craftItem = craftItem;

export function rollMaterialDrop(monsterRarity='common'){
  const tierMats = {
    common:    ['iron_ore','herb_bundle','ancient_wood','brimstone'],
    uncommon:  ['iron_ore','magic_stone','herb_bundle','silver_ore','shadow_silk','monster_bone'],
    rare:      ['magic_stone','rare_gem','silver_ore','shadow_silk','monster_bone','star_crystal','moonwater','titan_bone'],
    legendary: ['dragon_scale','void_shard','star_crystal','titan_bone','philosophers_ore'],
  };
  const dropChance = { common:0.30, uncommon:0.22, rare:0.16, legendary:0.10 };
  if(Math.random() > (dropChance[monsterRarity]||0.25)) return;
  const pool = tierMats[monsterRarity] || tierMats['common'];
  const matId = pool[Math.floor(Math.random()*pool.length)];
  addMaterial(matId, 1);
  rollBlueprintDrop(monsterRarity);
}
window.rollMaterialDrop = rollMaterialDrop;

export let _craftTab = 'craft';

export const PRIMAL_MATERIAL_IDS_FOR_LORE = new Set(['philosophers_ore','titan_bone','dragon_scale','void_shard','star_crystal','monster_bone']);

export const TOP_TIER_MATERIAL_IDS_BY_DICT = {
  REMEDY_MATERIALS:  new Set(['forbidden_herb','ancient_remedy']),
  ALCHEMY_MATERIALS: new Set(['forbidden_flesh','philosopher_dust','lost_formula']),
  TALE_MATERIALS:    new Set(['forbidden_lore','ancient_verse']),
  INTEL_MATERIALS:   new Set(['war_supply_intel','crown_ledger']),
};

export function showMaterialLore(matId, dictName){
  let mat, isTopTier;
  if(!dictName || dictName==='MATERIALS'){
    mat = MATERIALS[matId] || (typeof loadDynMaterials==='function' ? loadDynMaterials()[matId] : null);
    isTopTier = PRIMAL_MATERIAL_IDS_FOR_LORE.has(matId);
  } else {
    const DICT_MAP = {
      REMEDY_MATERIALS:  (typeof REMEDY_MATERIALS!=='undefined')  ? REMEDY_MATERIALS  : null,
      ALCHEMY_MATERIALS: (typeof ALCHEMY_MATERIALS!=='undefined') ? ALCHEMY_MATERIALS : null,
      TALE_MATERIALS:    (typeof TALE_MATERIALS!=='undefined')    ? TALE_MATERIALS    : null,
      INTEL_MATERIALS:   (typeof INTEL_MATERIALS!=='undefined')   ? INTEL_MATERIALS   : null,
    };
    const dict = DICT_MAP[dictName];
    mat = dict ? dict[matId] : null;
    isTopTier = (TOP_TIER_MATERIAL_IDS_BY_DICT[dictName]||new Set()).has(matId);
  }
  if(!mat) return;
  document.querySelectorAll('.material-lore-popup').forEach(el=>el.remove());
  const accentColor = isTopTier ? '#e0483c' : '#80c040';
  const popup = document.createElement('div');
  popup.className = 'material-lore-popup';
  popup.style.cssText = 'position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s';
  popup.innerHTML =
    `<div style="width:100%;max-width:340px;background:#0d0800;border:2px solid ${accentColor};box-shadow:0 0 40px ${accentColor}44;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1a0f00,#2a1a05);padding:18px 16px;text-align:center;border-bottom:1px solid ${accentColor}44">
        <div style="font-size:40px;margin-bottom:8px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(mat,{size:40}):(mat.icon||"📦")}</div>
        <div style="font-family:'Cinzel',serif;font-size:14px;color:${accentColor}">${esc(mat.name||matId)}</div>
        ${isTopTier ? `<div style="font-size:8px;color:${accentColor};letter-spacing:2px;margin-top:4px">✦ 최상급 소재 ✦</div>` : ''}
      </div>
      <div style="padding:16px">
        <div style="font-size:9px;color:var(--dim);margin-bottom:10px">${esc(mat.desc||'')}</div>
        ${mat.lore ? `<div style="font-size:10px;color:#c0b080;line-height:1.8;font-style:italic;padding:10px;background:#0a0500;border-left:3px solid ${accentColor}">${esc(mat.lore)}</div>` : ''}
        <button onclick="this.closest('.material-lore-popup').remove()" style="width:100%;margin-top:14px;padding:9px;background:linear-gradient(135deg,#2a1f0d,#3a2a10);border:1px solid ${accentColor};color:${accentColor};font-family:'Cinzel',serif;font-size:10px;cursor:pointer;letter-spacing:1px">확인</button>
      </div>
    </div>`;
  document.body.appendChild(popup);
  popup.addEventListener('click', e=>{ if(e.target===popup) popup.remove(); });
}
window.showMaterialLore = showMaterialLore;

window.showMaterialLore = showMaterialLore;

export function renderCraftPanel(){
  const body = document.getElementById('pb-craft');
  if(!body) return;

  const bag      = loadMaterials();
  const crafted  = new Set(loadCrafted());
  const ownedBps = new Set(loadBlueprints());

  const rarityColor = {common:'#8a9a8a',uncommon:'#4a9a6a',rare:'#4a6fa5',epic:'#9060c0',legendary:'#c8a96e',primal:'#e0483c'};
  const rarityLabel = {common:'일반',uncommon:'고급',rare:'희귀',epic:'영웅',legendary:'전설',primal:'태초'};

  const tabStyle = (t) => `padding:5px 8px;background:${_craftTab===t?'#2a1f0a':'#0d0800'};border:1px solid ${_craftTab===t?'var(--gold)':'var(--border)'};color:${_craftTab===t?'var(--gold)':'var(--dim)'};font-family:Cinzel,serif;font-size:9px;cursor:pointer;border-radius:2px;`;

  // 재료 요약 — 클릭하면 로어 팝업이 뜬다. 태초급 재료(philosophers_ore 등)는
  // 강조색으로 표시해 무심코 얻어도 눈길이 가도록 한다.
  const PRIMAL_MATERIAL_IDS = new Set(['philosophers_ore','titan_bone','dragon_scale','void_shard','star_crystal','monster_bone']);
  const matSummary = Object.entries(MATERIALS).map(([id,mat])=>{
    const cnt = bag[id]||0;
    if(cnt===0) return '';
    const isPrimal = PRIMAL_MATERIAL_IDS.has(id);
    const borderColor = isPrimal ? '#e0483c' : '#3a5a2a';
    const textColor = isPrimal ? '#e0a080' : '#80c040';
    return `<div onclick="showMaterialLore('${id}')" style="padding:2px 7px;background:#0d0800;border:1px solid ${borderColor};border-radius:2px;font-size:9px;color:${textColor};cursor:pointer">${typeof getEntityIconHTML==='function'?getEntityIconHTML(mat,{size:9}):(mat.icon)} ${mat.name} ×${cnt}</div>`;
  }).filter(Boolean).join('');

  // 레시피 카드 렌더러
  const recipeCard = (r) => {
    const canCraft = r.bpId && !ownedBps.has(r.bpId) ? false
                   : Object.entries(r.materials).every(([id,n])=>(bag[id]||0)>=n);
    const locked   = r.bpId && !ownedBps.has(r.bpId);
    const isDone   = crafted.has(r.id);
    const rc = rarityColor[r.result.rarity]||'#8a9a8a';
    const rl = rarityLabel[r.result.rarity]||'일반';
    const matList = Object.entries(r.materials).map(([id,n])=>{
      const have = bag[id]||0;
      return `<span style="color:${have>=n?'#70c050':'#e05050'}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(MATERIALS[id],{size:14}):(MATERIALS[id]?.icon||'')}${MATERIALS[id]?.name||id}×${n}(${have})</span>`;
    }).join(' ');

    if(locked){
      const bp = BLUEPRINT_SHOP[r.bpId];
      return `<div style="padding:9px;background:#080500;border:1px solid #1a1005;margin-bottom:4px;opacity:0.65">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:16px;filter:grayscale(1)">🔒</span>
          <div style="flex:1">
            <div style="font-family:Cinzel,serif;font-size:9px;color:#4a3a2a">${esc(r.name)} <span style="color:#604020;font-size:8px">[${rl}]</span></div>
            <div style="font-size:8px;color:#3a2a1a">설계도 필요: ${bp?.name||'?'}</div>
            <div style="font-size:8px;color:#3a2a1a">획득처: ${(bp?.howToGet||[]).map(h=>({shop:'🛒상점',drop:'⚔️몬스터드롭',quest:'📜퀘스트',event:'🎲이벤트',raid:'👑레이드'}[h]||h)).join(' · ')}</div>
          </div>
          ${bp?.price>0?`<button style="padding:3px 7px;background:#1a0f00;border:1px solid #3a2a0a;color:#604020;font-size:8px;cursor:pointer;border-radius:2px" onclick="buyBlueprint('${r.bpId}')">🛒 ${bp.price}G</button>`:''}
        </div>
      </div>`;
    }

    return `<div style="padding:9px;background:#0d0800;border:1px solid ${canCraft?'#3a5a2a':'var(--border)'};margin-bottom:4px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span style="font-size:17px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:17}):(r.icon)}</span>
        <div style="flex:1">
          <div style="font-family:Cinzel,serif;font-size:9px;color:${rc}">${esc(r.name)} <span style="font-size:8px">[${rl}]</span>${isDone?' <span style="color:#60a060;font-size:8px">✓</span>':''}</div>
          <div style="font-size:8px;color:var(--dim)">${esc(r.result.desc)}</div>
        </div>
      </div>
      <div style="font-size:8px;margin-bottom:5px">${matList}</div>
      <button class="btn ${canCraft?'btn-gold':'btn-dark'}" style="width:100%;padding:6px;font-size:9px" onclick="craftItem('${r.id}')" ${canCraft?'':'disabled'}>
        ${canCraft?'⚗️ 제작하기':'재료 부족'}
      </button>
    </div>`;
  };

  // 탭별 콘텐츠
  let tabContent = '';

  if(_craftTab==='craft'){
    const cats = [{k:'weapon',l:'⚔️ 무기'},{k:'armor',l:'🛡️ 방어구'},{k:'accessory',l:'💍 장신구'},{k:'consume',l:'🧪 소모품'}];
    const _availableRecipes = (typeof getAvailableRecipes==='function')
      ? getAvailableRecipes(S.scenario?.name||S.scenario?.id, (typeof loadCycleCount==='function')?loadCycleCount():0)
      : CRAFT_RECIPES;
    tabContent = cats.map(({k,l})=>{
      const rs = _availableRecipes.filter(r=>r.category===k);
      if(!rs.length) return '';
      return `<div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin:8px 0 5px;letter-spacing:1px">${l}</div>${rs.map(recipeCard).join('')}`;
    }).join('');
  } else if(_craftTab==='alchemy'){
    const rs = CRAFT_RECIPES.filter(r=>r.category==='alchemy');
    tabContent = `<div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:8px;letter-spacing:1px">⚗️ 연금술 레시피</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:8px;line-height:1.5">연금술은 재료를 변환해 강력한 약품·폭발물·마법 물질을 만든다.<br>연금 설계도는 상점, 이벤트, 퀘스트, 레이드로 획득.</div>
      ${rs.map(recipeCard).join('')}`;
  } else if(_craftTab==='blueprints'){
    const myBps = Array.from(ownedBps);
    if(!myBps.length){
      tabContent = `<div style="color:var(--dim);text-align:center;padding:20px;font-size:11px">보유한 설계도가 없습니다.<br>상점 구매 · 몬스터 처치 · 퀘스트 · 이벤트로 획득하세요.</div>`;
    } else {
      tabContent = `<div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:8px;letter-spacing:1px">📜 보유 설계도 (${myBps.length}종)</div>`;
      tabContent += myBps.map(bpId=>{
        const bp = BLUEPRINT_SHOP[bpId];
        if(!bp) return '';
        const rc = rarityColor[bp.rarity]||'#8a9a8a';
        return `<div style="padding:7px 9px;background:#0d0800;border:1px solid var(--border);margin-bottom:3px;display:flex;align-items:center;gap:6px">
          <span style="font-size:14px">📜</span>
          <div style="flex:1"><div style="font-size:9px;color:${rc}">${esc(bp.name)}</div>
          <div style="font-size:8px;color:var(--dim)">[${rarityLabel[bp.rarity]||bp.rarity}] ${(bp.howToGet||[]).map(h=>({shop:'상점',drop:'드롭',quest:'퀘스트',event:'이벤트',raid:'레이드'}[h]||h)).join('·')}</div></div>
        </div>`;
      }).join('');
    }
  } else if(_craftTab==='shop'){
    const shopBps = Object.entries(BLUEPRINT_SHOP).filter(([,bp])=>bp.howToGet.includes('shop')&&bp.price>0);
    tabContent = `<div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:6px;letter-spacing:1px">🛒 설계도 상점</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:8px">레이드 전용 설계도는 상점에서 구매 불가. 등급 높을수록 고가.</div>
      ${shopBps.map(([bpId,bp])=>{
        const owned = ownedBps.has(bpId);
        const rc = rarityColor[bp.rarity]||'#8a9a8a';
        return `<div style="padding:7px 9px;background:#0d0800;border:1px solid ${owned?'#3a5a2a':'var(--border)'};margin-bottom:3px;display:flex;align-items:center;gap:6px">
          <span style="font-size:13px">📜</span>
          <div style="flex:1">
            <div style="font-size:9px;color:${rc}">${esc(bp.name)}</div>
            <div style="font-size:8px;color:var(--dim)">[${rarityLabel[bp.rarity]||bp.rarity}]</div>
          </div>
          ${owned
            ? `<span style="font-size:9px;color:#60a060">✓ 보유</span>`
            : `<button class="btn btn-gold" style="padding:3px 8px;font-size:9px" onclick="buyBlueprint('${bpId}')">${bp.price}G</button>`
          }
        </div>`;
      }).join('')}`;
  }

  body.innerHTML = `
    <div style="margin-bottom:8px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:5px;letter-spacing:1px">📦 보유 재료</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:10px">
        ${matSummary||'<span style="font-size:9px;color:var(--dim)">재료 없음 — 탐색/전투로 획득</span>'}
      </div>
    </div>
    <div style="display:flex;gap:4px;margin-bottom:10px;flex-wrap:wrap">
      <button style="${tabStyle('craft')}"   onclick="_craftTab='craft';   renderCraftPanel()">⚔️ 제작</button>
      <button style="${tabStyle('alchemy')}" onclick="_craftTab='alchemy'; renderCraftPanel()">⚗️ 연금술</button>
      <button style="${tabStyle('shop')}"    onclick="_craftTab='shop';    renderCraftPanel()">🛒 설계도 상점</button>
      <button style="${tabStyle('blueprints')}" onclick="_craftTab='blueprints'; renderCraftPanel()">📜 내 설계도</button>
    </div>
    ${tabContent}
  `;
}
window.renderCraftPanel = renderCraftPanel;
