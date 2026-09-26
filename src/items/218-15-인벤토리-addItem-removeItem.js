// [15] 인벤토리 addItem / removeItem
// Auto-extracted from taleforge.html (original section banner preserved above).
import { TRANSPORT_CONFIG } from '../data/054-이동수단-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { ITEM_RARITY, SOUL_AUTO_TAG_KEYWORDS, SOUL_LEVEL_REQUIREMENTS, SOUL_PURITY_STAGES, SOUL_TAGS } from '../data/218-15-인벤토리-addItem-removeItem.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { getCurrentEncounterMult } from '../world/214-11-날씨-자동-순환.js';
import { getItemSlot, loadInventory, saveInventory } from './007-동적-아이템-생성-시스템-무제한-영구-캐시.js';

window.ITEM_RARITY = ITEM_RARITY;

export function addItem(item) {
  try {
    const inv = typeof loadInventory === 'function' ? loadInventory() : [];
    const newItem = {
      id: item.id || ('item_'+Date.now()),
      name: item.name, icon: item.icon || '📦',
      rarity: item.rarity || 'common', type: item.type || 'misc',
      desc: item.desc || '', quantity: item.quantity || 1,
      obtainedAt: S?.msgCount || 0,
    };
    const existing = inv.find(i => i.name === item.name && i.type === item.type);
    if (existing && item.stackable !== false) {
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
    } else {
      inv.push(newItem);
    }
    if (typeof saveInventory === 'function') saveInventory(inv);
    toast(`${item.name} 획득`, 2000, item);
    return newItem;
  } catch(e) { return null; }
}
window.addItem = addItem;

export function removeItem(itemId, quantity=1) {
  try {
    const inv = typeof loadInventory === 'function' ? loadInventory() : [];
    const idx = inv.findIndex(i => i.id === itemId || i.name === itemId);
    if (idx === -1) return false;
    if ((inv[idx].quantity || 1) <= quantity) {
      inv.splice(idx, 1);
    } else {
      inv[idx].quantity -= quantity;
    }
    if (typeof saveInventory === 'function') saveInventory(inv);
    return true;
  } catch(e) { return false; }
}
window.removeItem = removeItem;

export function getItemBLS() {
  try {
    const inv = typeof loadInventory === 'function' ? loadInventory() : [];
    const key = inv.filter(i => i.rarity === 'primal' || i.rarity === 'epic' || i.rarity === 'legendary')
                   .map(i => `${i.icon}${i.name}`).join(', ');
    return key ? `\n[🎒 주요 아이템] ${key}` : '';
  } catch(e) { return ''; }
}
window.getItemBLS = getItemBLS;

window.addItem    = addItem;

window.removeItem = removeItem;

window.getItemBLS = getItemBLS;

export const SOULS_KEY = 'tf-souls';

export const SOUL_WEAPON_LINK_KEY = 'tf-soul-weapon-link';

export const SOUL_EVOLUTION_CACHE_KEY = 'tf-soul-evolution-cache';

export const SOUL_EVOLUTION_LOG_KEY = 'tf-soul-evolution-log';

export function loadSouls(){ try{ return JSON.parse(lsGet(SOULS_KEY)||'{}'); }catch(e){ return {}; } }
window.loadSouls = loadSouls;

export function saveSouls(d){ lsSet(SOULS_KEY, JSON.stringify(d||{})); }
window.saveSouls = saveSouls;

export function loadSoulWeaponLink(){ try{ return JSON.parse(lsGet(SOUL_WEAPON_LINK_KEY)||'{}'); }catch(e){ return {}; } }
window.loadSoulWeaponLink = loadSoulWeaponLink;

export function saveSoulWeaponLink(d){ lsSet(SOUL_WEAPON_LINK_KEY, JSON.stringify(d||{})); }
window.saveSoulWeaponLink = saveSoulWeaponLink;

export function loadSoulEvoCache(){ try{ return JSON.parse(lsGet(SOUL_EVOLUTION_CACHE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadSoulEvoCache = loadSoulEvoCache;

export function saveSoulEvoCache(d){ lsSet(SOUL_EVOLUTION_CACHE_KEY, JSON.stringify(d||{})); }
window.saveSoulEvoCache = saveSoulEvoCache;

export function loadSoulEvoLog(){ try{ return JSON.parse(lsGet(SOUL_EVOLUTION_LOG_KEY)||'[]'); }catch(e){ return []; } }
window.loadSoulEvoLog = loadSoulEvoLog;

export function saveSoulEvoLog(d){ lsSet(SOUL_EVOLUTION_LOG_KEY, JSON.stringify(d||[])); }
window.saveSoulEvoLog = saveSoulEvoLog;

window.loadSouls = loadSouls;

window.loadSoulWeaponLink = loadSoulWeaponLink;

window.loadSoulEvoCache = loadSoulEvoCache;

window.loadSoulEvoLog = loadSoulEvoLog;

export function isWeaponEligibleForSoul(item){
  if(!item) return false;
  return ['rare','epic','legendary'].includes(item.rarity);
}
window.isWeaponEligibleForSoul = isWeaponEligibleForSoul;

window.isWeaponEligibleForSoul = isWeaponEligibleForSoul;

window.SOUL_TAGS = SOUL_TAGS;

window.SOUL_LEVEL_REQUIREMENTS = SOUL_LEVEL_REQUIREMENTS;

export const SOUL_MAX_LEVEL = SOUL_LEVEL_REQUIREMENTS.length - 1;

window.SOUL_PURITY_STAGES = SOUL_PURITY_STAGES;

export const SOUL_MAX_PURITY = SOUL_PURITY_STAGES.length - 1;

export function getSoulPurityInfo(soul){
  return SOUL_PURITY_STAGES[soul?.purity||1] || SOUL_PURITY_STAGES[1];
}
window.getSoulPurityInfo = getSoulPurityInfo;

window.getSoulPurityInfo = getSoulPurityInfo;

export function applyPurityMultiplier(baseBonus, purity){
  const mult = (SOUL_PURITY_STAGES[purity]||SOUL_PURITY_STAGES[1]).mult;
  const result = {};
  Object.entries(baseBonus||{}).forEach(([k,v])=>{ result[k] = Math.round((Number(v)||0) * mult); });
  return result;
}
window.applyPurityMultiplier = applyPurityMultiplier;

window.applyPurityMultiplier = applyPurityMultiplier;

export function canFuseSouls(soulIds){
  try{
    if(!Array.isArray(soulIds) || soulIds.length !== 3) return { ok:false, reason:'정확히 3개를 선택해야 합니다.' };
    const souls = loadSouls();
    const list = soulIds.map(id=>souls[id]).filter(Boolean);
    if(list.length !== 3) return { ok:false, reason:'소울을 찾을 수 없습니다.' };
    if(list.some(s=>s.weaponItemId)) return { ok:false, reason:'무기에 깃든 소울은 합성할 수 없습니다 — 먼저 분리하세요.' };
    if(list.some(s=>getDominantTagInfo(s).count===0)) return { ok:false, reason:'아직 색이 정해지지 않은 소울은 합성할 수 없습니다(5단계 이후만).' };
    if(list.some(s=>s.level < 5)) return { ok:false, reason:'아직 분기(5단계)에 도달하지 않은 소울은 합성할 수 없습니다.' };
    const purities = list.map(s=>s.purity||1);
    if(new Set(purities).size !== 1) return { ok:false, reason:'정화도가 같은 소울만 합성할 수 있습니다.' };
    const purity = purities[0];
    if(purity >= SOUL_MAX_PURITY) return { ok:false, reason:'태초의 넋은 더 이상 합성할 수 없습니다 — 이미 최종 단계입니다.' };
    const dominants = list.map(s=>getDominantTagInfo(s).tag);
    if(new Set(dominants).size !== 1) return { ok:false, reason:'같은 계열(우세 행동)의 소울만 합성할 수 있습니다.' };
    return { ok:true, purity, dominant:dominants[0] };
  }catch(e){ return { ok:false, reason:'알 수 없는 오류' }; }
}
window.canFuseSouls = canFuseSouls;

window.canFuseSouls = canFuseSouls;

export function fuseSouls(soulIds){
  try{
    const check = canFuseSouls(soulIds);
    if(!check.ok){ toast(`🔥 합성 불가: ${check.reason}`, 3500); return false; }

    const souls = loadSouls();
    const list = soulIds.map(id=>souls[id]);
    // 베이스 선정: 레벨이 가장 높은 것, 동일하면 태그 총합이 가장 많은 것
    list.sort((a,b)=> (b.level-a.level) || (Object.values(b.tags||{}).reduce((x,y)=>x+y,0) - Object.values(a.tags||{}).reduce((x,y)=>x+y,0)));
    const base = list[0];
    const fodder = list.slice(1);

    // 태그/로그 흡수
    fodder.forEach(f=>{
      Object.entries(f.tags||{}).forEach(([tag,count])=>{
        base.tags[tag] = (base.tags[tag]||0) + count;
      });
      base.log = (base.log||[]).concat((f.log||[]).map(e=>({...e, fusedFrom:f.id})));
    });

    const prevPurity = base.purity||1;
    base.purity = prevPurity + 1;
    const newStage = getSoulPurityInfo(base);

    // 합성 직후 보너스를 정화도 배율로 정확히 재계산(baseBonus가 있으면
    // 그 원본 기준으로, 없으면 기존 bonus를 임시 원본으로 취급).
    if(!base.baseBonus) base.baseBonus = base.bonus || {};
    base.bonus = applyPurityMultiplier(base.baseBonus, base.purity);

    // 재료(fodder) 소울은 소멸 + 무기 연결도 정리(이미 분리된 상태만
    // 합성 가능하므로 link 정리는 안전망 차원)
    const link = loadSoulWeaponLink();
    fodder.forEach(f=>{
      if(f.weaponItemId) delete link[f.weaponItemId];
      delete souls[f.id];
    });
    souls[base.id] = base;
    saveSouls(souls);
    saveSoulWeaponLink(link);

    const dom = getDominantTagInfo(base);
    toast(`🔥 세 영혼이 하나로 녹아들었습니다 — [${newStage.name}]에 도달했습니다!`, 5000);

    const log = loadSoulEvoLog();
    log.push({ type:'fusion', soulId:base.id, fusedFrom:fodder.map(f=>f.id), prevPurity, newPurity:base.purity, dominantTag:dom.tag, turn:S?.msgCount||0, at:Date.now() });
    saveSoulEvoLog(log);

    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[🔥 소울 합성] 같은 ${SOUL_TAGS[dom.tag]?.label||dom.tag} 계열의 영혼 세 개가 하나로 합쳐져 [${newStage.name}] 단계에 도달했다. 세 영혼이 녹아드는 장면을 짧게 서사화하라 — 무기를 다시 만들 필요는 없다.`;

    // 합성도 진화의 한 형태 — 새 정체성(이름/스킬/보너스)을 AI에게
    // 다시 요청한다(기존 진화 후보 3개 시스템 재사용).
    requestSoulEvolutionCandidates(base.id);
    return true;
  }catch(e){ return false; }
}
window.fuseSouls = fuseSouls;

window.fuseSouls = fuseSouls;

export function updateSoulFuseUI(){
  try{
    const checked = Array.from(document.querySelectorAll('.soul-fuse-pick:checked'));
    const bar = document.getElementById('soul-fuse-bar');
    const allBoxes = document.querySelectorAll('.soul-fuse-pick');
    if(bar) bar.style.display = allBoxes.length ? 'block' : 'none';
    if(checked.length > 3){
      checked[0].checked = false;
      return updateSoulFuseUI();
    }
    const btn = document.getElementById('soul-fuse-btn');
    const statusEl = document.getElementById('soul-fuse-status');
    if(!btn) return;
    if(checked.length === 3){
      const ids = checked.map(c=>c.dataset.soulId);
      const check = canFuseSouls(ids);
      if(check.ok){
        btn.disabled = false;
        btn.style.cursor = 'pointer';
        btn.style.background = '#1a1000';
        btn.style.borderColor = '#d0b070';
        btn.style.color = '#d0b070';
        btn.textContent = `선택한 세 영혼을 하나로 (${SOUL_TAGS[check.dominant]?.label||''} 계열)`;
        if(statusEl) statusEl.textContent = '';
      } else {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.textContent = '선택한 영혼을 하나로 (3/3 필요)';
        if(statusEl) statusEl.textContent = `⚠️ ${check.reason}`;
      }
    } else {
      btn.disabled = true;
      btn.style.cursor = 'not-allowed';
      btn.textContent = `선택한 영혼을 하나로 (${checked.length}/3 필요)`;
      if(statusEl) statusEl.textContent = '';
    }
  }catch(e){}
}
window.updateSoulFuseUI = updateSoulFuseUI;

window.updateSoulFuseUI = updateSoulFuseUI;

export function tryExecuteFusion(){
  try{
    const checked = Array.from(document.querySelectorAll('.soul-fuse-pick:checked'));
    if(checked.length !== 3) return;
    const ids = checked.map(c=>c.dataset.soulId);
    if(fuseSouls(ids)) renderSoulWeaponPanel();
  }catch(e){}
}
window.tryExecuteFusion = tryExecuteFusion;

window.tryExecuteFusion = tryExecuteFusion;

export function grantSoul(originText){
  try{
    const soulId = 'soul_' + Date.now() + '_' + Math.random().toString(36).slice(2,5);
    const souls = loadSouls();
    souls[soulId] = {
      id: soulId,
      name: '이름 없는 혼',
      level: 1,
      purity: 1,                   // [v9] 정화도 1~7 — "여린 넋" 단계. 합성으로만 오름.
      progressCount: 0,           // 현재 레벨에서 조건에 맞게 누적된 횟수
      tags: {},                    // { tagKey: count } — 전체 태그 누적(정체성 판정용)
      log: [],                     // 전체 행동 이력 — 무제한 보존
      evolutions: [],
      bonus: {}, skill: null,
      pendingCandidates: null, pendingSource: null,
      bornAt: S?.msgCount||0,
      originText: originText || '',
      weaponItemId: null,
    };
    saveSouls(souls);
    toast(`👻 새로운 소울이 깨어났습니다.`, 4500);
    if(typeof unlockAchievement==='function') unlockAchievement('soul_weapon');
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[👻 소울 탄생] 새로운 소울이 태어났다. (계기: ${originText||'알 수 없는 계기'})`
      + `\n이 소울은 아무 성격도 없는 빈 그릇이다 — 이름이나 정체성을 미리 부여하지 마라. 탄생 자체만 짧게 묘사하라.`;
    return soulId;
  }catch(e){ return null; }
}
window.grantSoul = grantSoul;

window.grantSoul = grantSoul;

// [2026-09-26, 무기 영혼 시스템 완전 무-API 보강] grantSoul()로 만들어지는
// 소울은 이름 없는 빈 그릇(level 1, bonus/skill 전혀 없음)이고, 실제로
// 성능을 갖추려면 recordSoulAction→checkSoulLevelUp→
// requestSoulEvolutionCandidates 흐름을 거쳐야 하는데, 이 흐름은
// hookSoulGS(아래)를 통해 AI가 실제 <gs> 태그를 낸 턴에만 진행된다 —
// 완전 무-API 플레이에서는 사실상 영원히 안 돈다. 사용자 요청("낮은
// 확률로 나오고 준수한 성능이면서 환생해도 유지되는 것")에 맞춰, 이
// 함수는 grantSoul()로 만든 빈 그릇에 AI 진화 후보 흐름과 똑같은 형태
// (name/baseBonus/bonus/skill/evolutions)를 즉석에서 채워, 첫 진화를
// 거친 것과 동등한 수준의 실사용 가능한 소울을 만든다 — 새 성장
// 시스템을 만드는 게 아니라, AI가 못 채워주는 지점만 로컬 값으로
// 대신 메운다(레벨/정화도/진화 흐름 자체는 그대로 두어, 나중에 AI가
// 있을 때 정상적으로 더 진화할 수도 있다).
const SOUL_LOCAL_AWAKEN_POOL = [
  { stat:'str', amount:15, skill:{ name:'거친 울림',     desc:'묵직한 타격을 주고받을 때마다 낮게 공명한다.' } },
  { stat:'agi', amount:15, skill:{ name:'그림자 맞장구', desc:'재빠른 몸놀림에 반응해 옅게 떨린다.' } },
  { stat:'int', amount:15, skill:{ name:'서늘한 속삭임', desc:'복잡한 상황을 마주할 때마다 서늘하게 속삭인다.' } },
  { stat:'mgc', amount:12, skill:{ name:'마력의 잔향',   desc:'마법이 발휘될 때마다 옅은 빛으로 반응한다.' } },
];
export function grantLocalWeaponSoul(originText){
  try{
    const soulId = grantSoul(originText);
    if(!soulId) return null;
    const souls = loadSouls();
    const soul = souls[soulId];
    if(!soul) return soulId;
    const pick = SOUL_LOCAL_AWAKEN_POOL[Math.floor(Math.random()*SOUL_LOCAL_AWAKEN_POOL.length)];
    soul.name = '각성한 혼';
    soul.baseBonus = { [pick.stat]: pick.amount };
    soul.bonus = applyPurityMultiplier(soul.baseBonus, soul.purity||1);
    soul.skill = pick.skill;
    soul.evolutions = soul.evolutions || [];
    soul.evolutions.push({ level:soul.level, purity:soul.purity||1, name:soul.name, desc:'무기 없이도 이미 옅은 힘을 품은 채 나타난 드문 혼.', bonus:soul.baseBonus, skill:pick.skill, source:'local', at:S?.msgCount||0 });
    saveSouls(souls);
    toast(`✨ 이 혼은 이미 옅은 힘을 머금고 있다 — 무기에 깃들게 할 수 있습니다.`, 4200);
    return soulId;
  }catch(e){ return null; }
}
window.grantLocalWeaponSoul = grantLocalWeaponSoul;

window.grantLocalWeaponSoul = grantLocalWeaponSoul;

export function tryGrantSoulFromNpc(){ /* removed in v10 */ }
window.tryGrantSoulFromNpc = tryGrantSoulFromNpc;

window.tryGrantSoulFromNpc = tryGrantSoulFromNpc;

export function scanAllNpcsForSoulGrant(){ /* removed in v10 */ }
window.scanAllNpcsForSoulGrant = scanAllNpcsForSoulGrant;

window.scanAllNpcsForSoulGrant = scanAllNpcsForSoulGrant;

export function handleSoulGrantGS(originText){
  try{ if(typeof originText === 'string') grantSoul(originText); }catch(e){}
}
window.handleSoulGrantGS = handleSoulGrantGS;

window.handleSoulGrantGS = handleSoulGrantGS;

export function applySoulToWeapon(soulId, weaponItemId){
  try{
    const souls = loadSouls();
    const soul = souls[soulId];
    if(!soul){ toast('해당 소울을 찾을 수 없습니다.', 2000); return false; }
    const inv = (typeof loadInventory==='function') ? loadInventory() : (S.inventory||[]);
    const weapon = inv.find(it=>it.id===weaponItemId);
    if(!weapon){ toast('해당 무기를 인벤토리에서 찾을 수 없습니다.', 2000); return false; }
    if(!weapon.id){
      weapon.id = 'wpn_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
      if(typeof saveInventory==='function') saveInventory(inv);
      S.inventory = inv;
      weaponItemId = weapon.id;
    }
    if(!isWeaponEligibleForSoul(weapon)){
      toast(`${weapon.name}은(는) 영혼을 받아들일 만큼 강하지 않습니다. (레어 등급 이상 필요)`, 3200);
      return false;
    }
    const link = loadSoulWeaponLink();
    const prevSoulId = link[weaponItemId];
    if(prevSoulId && prevSoulId !== soulId && souls[prevSoulId]) souls[prevSoulId].weaponItemId = null;
    if(soul.weaponItemId && soul.weaponItemId !== weaponItemId) delete link[soul.weaponItemId];
    soul.weaponItemId = weaponItemId;
    link[weaponItemId] = soulId;
    saveSouls(souls);
    saveSoulWeaponLink(link);
    syncSoulWeaponEquip();
    toast(`👻 소울이 ${weapon.name}에 깃들었습니다.`, 3500);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[👻 소울 결속] 플레이어가 무기 "${weapon.name}"에 소울을 끼웠다. 짧은 적응 의식처럼 그려라.`;
    return true;
  }catch(e){ return false; }
}
window.applySoulToWeapon = applySoulToWeapon;

window.applySoulToWeapon = applySoulToWeapon;

export function detachSoulFromWeapon(soulId){
  try{
    const souls = loadSouls();
    const soul = souls[soulId];
    if(!soul || !soul.weaponItemId) return false;
    const link = loadSoulWeaponLink();
    delete link[soul.weaponItemId];
    soul.weaponItemId = null;
    saveSouls(souls);
    saveSoulWeaponLink(link);
    syncSoulWeaponEquip();
    toast(`👻 소울이 무기에서 분리되어 당신 곁으로 돌아왔습니다.`, 3000);
    return true;
  }catch(e){ return false; }
}
window.detachSoulFromWeapon = detachSoulFromWeapon;

window.detachSoulFromWeapon = detachSoulFromWeapon;

export function getActiveSoul(){
  try{
    const weapon = S?.equipped?.weapon;
    if(!weapon) return null;
    const link = loadSoulWeaponLink();
    const soulId = link[weapon.id];
    if(!soulId) return null;
    const souls = loadSouls();
    return souls[soulId] ? { ...souls[soulId], _weaponName: weapon.name } : null;
  }catch(e){ return null; }
}
window.getActiveSoul = getActiveSoul;

window.getActiveSoul = getActiveSoul;

export function recordSoulAction(soulId, tagKey, difficulty=0, source='ai'){
  try{
    if(!SOUL_TAGS[tagKey]) return;
    const souls = loadSouls();
    const soul = souls[soulId];
    if(!soul || soul.level >= SOUL_MAX_LEVEL) return;

    soul.tags = soul.tags || {};
    soul.tags[tagKey] = (soul.tags[tagKey]||0) + 1;
    soul.log = soul.log || [];
    soul.log.push({ tag:tagKey, difficulty, turn:S?.msgCount||0, source, at:Date.now() });

    const req = SOUL_LEVEL_REQUIREMENTS[soul.level];
    const meetsBar = (difficulty||0) >= (req?.minDifficulty||0);
    if(meetsBar){
      soul.progressCount = (soul.progressCount||0) + 1;
      saveSouls(souls);
      checkSoulLevelUp(soulId);
    } else {
      saveSouls(souls);
      const def = SOUL_TAGS[tagKey];
      if(def.usesEnemyLevel){
        toast(`기록은 남았지만, 상대가 너무 약해 진화에는 도움이 되지 않았습니다. (필요: Lv.${req?.minDifficulty||0}+)`, 2800, def);
      }
    }
  }catch(e){}
}
window.recordSoulAction = recordSoulAction;

window.recordSoulAction = recordSoulAction;

export function recordActiveSoulAction(tagKey, difficulty=0, source='ai'){
  const soul = getActiveSoul();
  if(soul) recordSoulAction(soul.id, tagKey, difficulty, source);
}
window.recordActiveSoulAction = recordActiveSoulAction;

window.recordActiveSoulAction = recordActiveSoulAction;

export function autoEstimateSoulTagFromText(text){
  if(!text) return null;
  for(const [tag, patterns] of Object.entries(SOUL_AUTO_TAG_KEYWORDS)){
    if(patterns.some(p=>p.test(text))) return tag;
  }
  return null;
}
window.autoEstimateSoulTagFromText = autoEstimateSoulTagFromText;

window.autoEstimateSoulTagFromText = autoEstimateSoulTagFromText;

export function tryAutoTagActiveSoul(aiText){
  try{
    const soul = getActiveSoul();
    if(!soul) return;
    const totalTags = Object.values(soul.tags||{}).reduce((a,b)=>a+b,0);
    if((soul.level||1) < 3 || totalTags < 5) return;
    const tag = autoEstimateSoulTagFromText(aiText);
    if(!tag) return;
    // 키워드 추정 시 난이도는 플레이어 현재 레벨에 보수적으로 맞춰
    // 추정한다(과대평가 방지) — AI 명시 보고보다 약간 낮게 잡는다.
    const estDifficulty = Math.max(0, (typeof loadPlayerLevel==='function' ? loadPlayerLevel() : 1) - 5);
    recordSoulAction(soul.id, tag, estDifficulty, 'auto');
  }catch(e){}
}
window.tryAutoTagActiveSoul = tryAutoTagActiveSoul;

window.tryAutoTagActiveSoul = tryAutoTagActiveSoul;

export function checkSoulLevelUp(soulId){
  try{
    const souls = loadSouls();
    const soul = souls[soulId];
    if(!soul || soul.level >= SOUL_MAX_LEVEL) return;
    const req = SOUL_LEVEL_REQUIREMENTS[soul.level];
    if(!req) return;
    if((soul.progressCount||0) >= req.needCount){
      soul.level += 1;
      soul.progressCount = 0; // 다음 레벨 조건을 위해 리셋(태그 누적인 soul.tags는 그대로 유지)
      saveSouls(souls);
      requestSoulEvolutionCandidates(soulId);
    } else {
      saveSouls(souls);
    }
  }catch(e){}
}
window.checkSoulLevelUp = checkSoulLevelUp;

window.checkSoulLevelUp = checkSoulLevelUp;

export function getDominantTagInfo(soul){
  const entries = Object.entries(soul.tags||{});
  if(!entries.length) return { tag:null, count:0, label:'미정' };
  entries.sort((a,b)=>b[1]-a[1]);
  const [tag,count] = entries[0];
  return { tag, count, label: SOUL_TAGS[tag]?.label || tag };
}
window.getDominantTagInfo = getDominantTagInfo;

window.getDominantTagInfo = getDominantTagInfo;

export function getSoulEvoCacheKey(level, dominantTag){
  return `${level}_${dominantTag||'none'}`;
}
window.getSoulEvoCacheKey = getSoulEvoCacheKey;

window.getSoulEvoCacheKey = getSoulEvoCacheKey;

export function requestSoulEvolutionCandidates(soulId){
  try{
    const souls = loadSouls();
    const soul = souls[soulId];
    if(!soul) return;
    const dom = getDominantTagInfo(soul);
    const cacheKey = getSoulEvoCacheKey(soul.level, dom.tag);
    const cache = loadSoulEvoCache();
    const cachedSets = cache[cacheKey];

    if(cachedSets && cachedSets.length){
      const pick = cachedSets[Math.floor(Math.random()*cachedSets.length)];
      soul.pendingCandidates = pick;
      soul.pendingSource = 'cache';
      saveSouls(souls);
      toast(`📦 소울이 갈림길에 섰습니다 — 과거의 기록에서 진화 후보를 불러왔습니다.`, 4000);
      return;
    }

    soul.pendingSource = 'ai_waiting';
    saveSouls(souls);
    toast(`⚡ 소울이 Lv.${soul.level}에 도달했습니다 — 진화 후보를 떠올리는 중...`, 4000);
    const tagSummary = Object.entries(soul.tags||{}).map(([t,c])=>`${SOUL_TAGS[t]?.label||t} ${c}회`).join(', ') || '아직 뚜렷한 행동 기록 없음';
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[⚡ 소울 진화 — 후보 3개 요청] 무기에 깃든 소울이 Lv.${soul.level}에 도달했다. 지금까지 누적된 행동: ${tagSummary} (가장 우세함: ${dom.label}).`
      + `\n이 흐름에 어울리는 진화 방향 3가지를 서로 다른 개성으로 제시하라. 각 후보는 이름, 짧은 설명, 스탯 보너스, 스킬/특성을 모두 포함해야 한다.`
      + `\nGS: {"soul_evolve_candidates":{"soulId":"${soul.id}","candidates":[{"name":"진화명1","desc":"설명1","bonus":{"str":15},"skill":{"name":"스킬명1","desc":"효과 설명1"}},{"name":"진화명2","desc":"설명2","bonus":{"int":15},"skill":{"name":"스킬명2","desc":"효과 설명2"}},{"name":"진화명3","desc":"설명3","bonus":{"agi":15},"skill":{"name":"스킬명3","desc":"효과 설명3"}}]}} 형태로 정확히 3개를 출력하라.`;
  }catch(e){}
}
window.requestSoulEvolutionCandidates = requestSoulEvolutionCandidates;

window.requestSoulEvolutionCandidates = requestSoulEvolutionCandidates;

export function handleSoulEvolveCandidatesGS(payload){
  try{
    if(!payload || !payload.soulId || !Array.isArray(payload.candidates)) return;
    const souls = loadSouls();
    const soul = souls[payload.soulId];
    if(!soul) return;
    const cands = payload.candidates.slice(0,3).map(c=>({
      name: c.name || '이름 없는 진화',
      desc: c.desc || '',
      bonus: c.bonus || {},
      skill: c.skill ? { name:c.skill.name||'', desc:c.skill.desc||'' } : null,
    }));
    if(cands.length < 3) return;
    soul.pendingCandidates = cands;
    soul.pendingSource = 'ai';
    saveSouls(souls);
    toast(`✨ 소울 진화 후보 3가지가 도착했습니다 — 소울 패널에서 선택하세요.`, 4500);
  }catch(e){}
}
window.handleSoulEvolveCandidatesGS = handleSoulEvolveCandidatesGS;

window.handleSoulEvolveCandidatesGS = handleSoulEvolveCandidatesGS;

export function chooseSoulEvolution(soulId, choiceIdx){
  try{
    const souls = loadSouls();
    const soul = souls[soulId];
    if(!soul || !soul.pendingCandidates || !soul.pendingCandidates[choiceIdx]) return false;
    const chosen = soul.pendingCandidates[choiceIdx];
    const dom = getDominantTagInfo(soul);

    soul.name = chosen.name;
    soul.baseBonus = chosen.bonus || {}; // AI가 준 원본 보너스 — 정화도 배율 적용 전
    soul.bonus = applyPurityMultiplier(soul.baseBonus, soul.purity||1); // 실제 적용 보너스
    soul.skill = chosen.skill || null;
    soul.evolutions = soul.evolutions || [];
    soul.evolutions.push({ level:soul.level, purity:soul.purity||1, name:chosen.name, desc:chosen.desc, bonus:chosen.bonus, skill:chosen.skill, at:S?.msgCount||0 });

    if(soul.pendingSource === 'ai'){
      const cache = loadSoulEvoCache();
      const cacheKey = getSoulEvoCacheKey(soul.level, dom.tag);
      cache[cacheKey] = cache[cacheKey] || [];
      cache[cacheKey].push(soul.pendingCandidates);
      if(cache[cacheKey].length > 20) cache[cacheKey] = cache[cacheKey].slice(-20);
      saveSoulEvoCache(cache);
    }

    const log = loadSoulEvoLog();
    log.push({
      soulId, level:soul.level, dominantTag:dom.tag, dominantCount:dom.count,
      candidates: soul.pendingCandidates, chosenIdx: choiceIdx, chosenName: chosen.name,
      source: soul.pendingSource, turn: S?.msgCount||0, at: Date.now(),
    });
    saveSoulEvoLog(log);

    soul.pendingCandidates = null;
    soul.pendingSource = null;
    saveSouls(souls);
    syncSoulWeaponEquip();
    toast(`✨ 소울이 [${chosen.name}]으로 진화했습니다!`, 4500);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[✨ 소울 진화 확정] 소울이 "${chosen.name}"으로 진화했다. (${chosen.desc}) 이 변화를 무기에 반영해 짧게 묘사하라.`;
    return true;
  }catch(e){ return false; }
}
window.chooseSoulEvolution = chooseSoulEvolution;

window.chooseSoulEvolution = chooseSoulEvolution;

export function getSoulStageInfo(soul){
  if(!soul) return null;
  const dom = getDominantTagInfo(soul);
  const purityInfo = getSoulPurityInfo(soul);
  return {
    name: soul.name || '이름 없는 혼',
    icon: dom.tag ? (SOUL_TAGS[dom.tag]?.icon||'👻') : '👻',
    narrative: soul.evolutions && soul.evolutions.length ? soul.evolutions[soul.evolutions.length-1].desc : '',
    bonus: soul.bonus || {},
    skill: soul.skill || null,
    dominantLabel: dom.tag ? dom.label : null,
    purityName: purityInfo.name,
    purityStage: purityInfo.stage,
    purityMult: purityInfo.mult,
  };
}
window.getSoulStageInfo = getSoulStageInfo;

window.getSoulStageInfo = getSoulStageInfo;

export function syncSoulWeaponEquip(){
  try{
    if(!S?.stats) return;
    if(S._soulWeaponBonus){
      Object.entries(S._soulWeaponBonus).forEach(([k,v])=>{
        if(S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v);
      });
      S._soulWeaponBonus = null;
    }
    const soul = getActiveSoul();
    if(soul){
      const info = getSoulStageInfo(soul);
      const applied = {};
      if(info) Object.entries(info.bonus||{}).forEach(([k,v])=>{
        if(S.stats[k]!==undefined){ S.stats[k]=Math.min(999,S.stats[k]+(Number(v)||0)); applied[k]=Number(v)||0; }
      });
      S._soulWeaponBonus = applied;
    }
    if(typeof window.updateHeader==='function') window.updateHeader();
  }catch(e){}
}
window.syncSoulWeaponEquip = syncSoulWeaponEquip;

window.syncSoulWeaponEquip = syncSoulWeaponEquip;

export function getSoulBLS(){
  try{
    const lines = [];
    const soul = getActiveSoul();
    if(soul){
      const info = getSoulStageInfo(soul);
      const totalTags = Object.values(soul.tags||{}).reduce((a,b)=>a+b,0);
      const req = soul.level < SOUL_MAX_LEVEL ? SOUL_LEVEL_REQUIREMENTS[soul.level] : null;
      lines.push(`[👻 깃든 소울] "${soul.name}" Lv.${soul.level}/${SOUL_MAX_LEVEL} · 정화도: ${info?.purityName||'여린 넋'}(${info?.purityStage||1}/${SOUL_MAX_PURITY}) (총 행동 ${totalTags}회 기록됨)`);
      if(info?.dominantLabel) lines.push(`  현재 색: ${info.dominantLabel}`);
      if(info?.skill?.name) lines.push(`  스킬: ${info.skill.name} — ${info.skill.desc}`);
      if(req) lines.push(`  다음 진화까지: ${soul.progressCount||0}/${req.needCount}회 (단, 난이도 ${req.minDifficulty}+ 인 행동만 인정됨)`);
      if(soul.pendingCandidates) lines.push(`  ⏳ 진화 후보 3개 대기 중 — 플레이어가 소울 패널에서 선택해야 함`);
      else if(soul.pendingSource === 'ai_waiting') lines.push(`  ⏳ 진화 후보 응답 대기 중 — 이번 응답에 soul_evolve_candidates GS를 포함하라.`);
    }
    const souls = loadSouls();
    const dormant = Object.values(souls).filter(s=>!s.weaponItemId);
    if(dormant.length) lines.push(`[👻 미적용 소울 보유] ${dormant.length}개 — 인벤토리에서 무기에 적용 가능.`);
    return lines.length ? '\n' + lines.join('\n') : '';
  }catch(e){ return ''; }
}
window.getSoulBLS = getSoulBLS;

window.getSoulBLS = getSoulBLS;

export function getSoulWeaponProgressBLS(){
  try{
    const lines = ['[👻 소울 시스템 가이드]'];
    lines.push('소울은 미리 정해진 종류가 없다 — 다음 계기로만 생긴다: (1) 히든 퀘스트 완수 시 {"soul_grant":"계기 한 줄 설명"}, (2) 숨겨진 장소의 특별한 발견 시 동일하게. 캠페인 전체에서 드물게만.');
    const soul = getActiveSoul();
    if(soul){
      const req = soul.level < SOUL_MAX_LEVEL ? SOUL_LEVEL_REQUIREMENTS[soul.level] : null;
      const tagList = Object.entries(SOUL_TAGS).map(([k,v])=>`${k}(${v.label})`).join(', ');
      lines.push(`현재 장착된 소울이 있다 — 의미 있는 행동을 할 때마다 {"soul_action":{"tag":"태그키","difficulty":숫자}} 출력. 태그: ${tagList}.`);
      lines.push(`difficulty는: 전투 태그(combat_human/monster/undead)는 상대의 절대 레벨(예: 평민=10, 기사=55, 기사단장=80 등 — 이미 알고 있는 신분별 레벨 기준 그대로). 비전투 태그(dialogue/deception/exploration/protection)는 그 행동의 비중을 1~3으로(1=가벼움, 3=결정적).`);
      if(req) lines.push(`이 소울의 다음 진화 조건: 난이도 ${req.minDifficulty} 이상인 행동을 ${req.needCount}회 — 너무 약한 상대/가벼운 행동은 기록은 남지만 진화에는 반영되지 않는다. 거짓으로 과장하지 말 것.`);
      lines.push('조건이 채워지면 시스템이 자동으로 레벨업과 진화 후보 요청을 트리거한다 — 그 요청이 컨텍스트에 나타나면 soul_evolve_candidates GS로 응답하라.');
    }
    return '\n' + lines.join('\n');
  }catch(e){ return ''; }
}
window.getSoulWeaponProgressBLS = getSoulWeaponProgressBLS;

window.getSoulWeaponProgressBLS = getSoulWeaponProgressBLS;

export function getSoulWeaponBLS(){ return getSoulBLS(); }
window.getSoulWeaponBLS = getSoulWeaponBLS;

window.getSoulWeaponBLS = getSoulWeaponBLS;

export function activateSoulWeapon(){ return null; }
window.activateSoulWeapon = activateSoulWeapon;

window.activateSoulWeapon = activateSoulWeapon;

export function levelUpSoulWeapon(){ /* deprecated in v8 — 횟수 기반으로 대체됨, soul_action만 사용 */ }
window.levelUpSoulWeapon = levelUpSoulWeapon;

window.levelUpSoulWeapon = levelUpSoulWeapon;

export function levelUpActiveSoul(){ /* deprecated in v8 */ }
window.levelUpActiveSoul = levelUpActiveSoul;

window.levelUpActiveSoul = levelUpActiveSoul;

export function tickSoulWeaponBossKill(){ /* deprecated */ }
window.tickSoulWeaponBossKill = tickSoulWeaponBossKill;

window.tickSoulWeaponBossKill = tickSoulWeaponBossKill;

export function reincarnateSoulCarry(){
  try{
    const souls = loadSouls();
    let any = false;
    Object.values(souls).forEach(soul=>{ if(soul.weaponItemId){ soul.weaponItemId = null; any = true; } });
    saveSouls(souls);
    saveSoulWeaponLink({});
    if(any) toast(`👻 전생의 소울이 무기에서 풀려나 당신 곁에 남았습니다. 새 무기에 다시 깃들게 할 수 있습니다.`, 5000);
  }catch(e){}
}
window.reincarnateSoulCarry = reincarnateSoulCarry;

window.reincarnateSoulCarry = reincarnateSoulCarry;

(function hookReincarnationSoul(){
  setTimeout(()=>{
    const orig = window.doReincarnate;
    if(typeof orig==='function' && !orig._soulReincHooked){
      window.doReincarnate = function(){
        const r = orig.apply(this, arguments);
        setTimeout(()=>{ try{ reincarnateSoulCarry(); }catch(e){} }, 600);
        return r;
      };
      window.doReincarnate._soulReincHooked = true;
    }
  }, 2400);
})();

(function hookSoulGS(){
  setTimeout(()=>{
    const orig = window.processGSToAllDBs;
    if(typeof orig==='function' && !orig._soulGSHooked){
      window.processGSToAllDBs = function(gs){
        const result = orig.apply(this, arguments);
        try{
          if(typeof gs.soul_grant === 'string') handleSoulGrantGS(gs.soul_grant);
          if(gs.soul_action){
            // 새 형식: {"soul_action":{"tag":"combat_human","difficulty":65}}
            // 구버전 호환: {"soul_action":"combat_human"} (difficulty=0으로 처리,
            // 즉 1레벨 조건에서만 카운트됨 — 점진적 폐기 유도).
            if(typeof gs.soul_action === 'object' && gs.soul_action.tag){
              recordActiveSoulAction(gs.soul_action.tag, Number(gs.soul_action.difficulty)||0, 'ai');
            } else if(typeof gs.soul_action === 'string'){
              recordActiveSoulAction(gs.soul_action, 0, 'ai');
            }
          }
          if(gs.soul_evolve_candidates) handleSoulEvolveCandidatesGS(gs.soul_evolve_candidates);
          if(!gs.soul_action && typeof gs._narrativeText === 'string') tryAutoTagActiveSoul(gs._narrativeText);
        }catch(e){}
        return result;
      };
      window.processGSToAllDBs._soulGSHooked = true;
    }
  }, 2300);
})();

(function hookSoulToBLS(){
  setTimeout(()=>{
    const fn = typeof window.buildLightSystem==='function'?'buildLightSystem'
             : typeof window.buildSystemPrompt==='function'?'buildSystemPrompt'
             : typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn) return;
    const orig = window[fn];
    if(typeof orig==='function' && !orig._soulBLSHooked){
      window[fn] = function(){
        const r = orig.apply(this, arguments);
        try{
          let extra = '';
          const activeSoulBLS = getSoulBLS(); if(activeSoulBLS) extra += activeSoulBLS;
          const progressBLS = getSoulWeaponProgressBLS(); if(progressBLS) extra += progressBLS;
          return extra && typeof r==='string' ? r+extra : r;
        }catch(e){ return r; }
      };
      window[fn]._soulBLSHooked = true;
    }
  }, 4750);
})();

export function renderSoulWeaponPanel(){
  if(!document.getElementById('pb-soulweapon')){
    const el = document.createElement('div');
    el.className='panel-ov'; el.id='p-soulweapon';
    el.innerHTML=`<div class="panel"><div class="p-head"><span class="p-title">👻 소울</span><button class="p-close" onclick="closeP('soulweapon')">✕</button></div><div class="p-body scrollable" id="pb-soulweapon"></div></div>`;
    document.body.appendChild(el);
  }
  const body = document.getElementById('pb-soulweapon');
  if(!body) return;

  const souls = loadSouls();
  const soulList = Object.values(souls);
  const inv = (typeof loadInventory==='function') ? loadInventory() : (S.inventory||[]);
  let invChanged = false;
  inv.forEach(it=>{ if(it.type==='equip' && !it.id){ it.id = 'wpn_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); invChanged = true; } });
  if(invChanged){ if(typeof saveInventory==='function') saveInventory(inv); S.inventory = inv; }
  const eligibleWeapons = inv.filter(it=>it.type==='equip' && (it.slot==='weapon' || (typeof getItemSlot==='function' && getItemSlot(it)==='weapon')) && isWeaponEligibleForSoul(it));

  if(!soulList.length){
    const rumorState = (typeof loadSoulRumorState==='function') ? loadSoulRumorState() : {};
    const dungeonState = (typeof loadSoulDungeonState==='function') ? loadSoulDungeonState() : {};
    const heard = (typeof loadSoulRumorHeard==='function') ? loadSoulRumorHeard() : [];
    const continentNames = { central:'중앙대륙', north:'북대륙', east:'동대륙', west:'서대륙', south:'남대륙', northeast:'북동대륙', southeast:'남동대륙', northwest:'북서대륙' };

    body.innerHTML = `<div style="padding:14px">
      <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:10px">👻 소울</div>
      <div style="font-size:9px;color:var(--dim);line-height:1.7;margin-bottom:12px">
        소울은 룬과 같습니다 — 무기에 끼우고, 그 무기로 무엇을 하느냐에 따라 스스로 진화합니다. 일반적인 방법으로는 얻을 수 없고, 모험 그 자체를 통해서만 발견됩니다.
      </div>

      <div style="margin-bottom:10px">
        <div style="font-size:9px;color:#c8a96e;margin-bottom:6px">📜 소문에서 시작되는 히든 퀘스트</div>
        ${rumorState.active ? `
          <div style="padding:8px 10px;background:#0a0810;border:1px solid #c8a96e;border-radius:2px;font-size:9px;color:#d0b070">
            진행 중인 사연이 있습니다 — 끝까지 따라가 보세요.
          </div>
        ` : `
          <div style="padding:8px 10px;background:#080600;border:1px solid #2a2000;border-radius:2px;font-size:9px;color:#8a7a5a">
            주점, 시장, 항구 같은 곳에서 우연히 흘러나오는 소문에 귀를 기울이세요. (지금까지 들은 소문: ${heard.length}개)
          </div>
        `}
      </div>

      <div>
        <div style="font-size:9px;color:#c8a96e;margin-bottom:6px">🗺️ 대륙에 숨겨진 던전</div>
        ${Object.entries(window.SOUL_HIDDEN_DUNGEONS||{}).map(([cont,def])=>{
          const entry = dungeonState[cont]||{};
          const label = entry.cleared ? `<span style="color:#60c060">완파됨</span>`
            : entry.revealed ? `<span style="color:#e0a040">입구 발견됨</span>`
            : `<span style="color:#5a4a3a">아직 흔적 없음 (${entry.activity||0}/${def.revealThreshold})</span>`;
          return `<div style="display:flex;justify-content:space-between;padding:5px 8px;background:#060400;border:1px solid #1a1400;border-radius:2px;margin-bottom:3px;font-size:8px">
            <span style="color:#8a7a5a">${continentNames[cont]||cont}</span>
            <span>${label}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
    return;
  }


  body.innerHTML = `<div style="padding:14px">
    <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:10px">👻 소울 (${soulList.length}개 보유)</div>

    <div id="soul-fuse-bar" style="display:none;padding:8px 10px;background:#0a0810;border:1px solid #d0b070;border-radius:2px;margin-bottom:10px">
      <div style="font-size:9px;color:#d0b070;margin-bottom:6px">🔥 합성: 같은 정화도 · 같은 계열 · 5단계 이상 · 무기에서 분리된 소울 3개를 선택하세요.</div>
      <div id="soul-fuse-status" style="font-size:8px;color:var(--dim);margin-bottom:6px"></div>
      <button id="soul-fuse-btn" onclick="tryExecuteFusion()" disabled style="padding:5px 12px;background:#1a1000;border:1px solid #5a4a2a;color:#6a5a3a;font-size:9px;cursor:not-allowed">선택한 영혼을 하나로 (3/3 필요)</button>
    </div>

    ${soulList.map(soul=>{
      const info = getSoulStageInfo(soul);
      const weapon = soul.weaponItemId ? inv.find(it=>it.id===soul.weaponItemId) : null;
      const isEquippedNow = !!(weapon && S?.equipped?.weapon?.id === weapon.id);
      const tagEntries = Object.entries(soul.tags||{}).sort((a,b)=>b[1]-a[1]);
      const totalTags = tagEntries.reduce((a,[,c])=>a+c,0);
      const req = soul.level < SOUL_MAX_LEVEL ? SOUL_LEVEL_REQUIREMENTS[soul.level] : null;
      const progressPct = req ? Math.min(100, Math.round((soul.progressCount||0)/req.needCount*100)) : 100;

      if(soul.pendingCandidates && soul.pendingCandidates.length===3){
        return `<div style="padding:12px;background:#0a0810;border:2px solid #c8a96e;border-radius:3px;margin-bottom:10px">
          <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;margin-bottom:4px">⚡ "${esc(soul.name)}" 진화의 갈림길 (Lv.${soul.level})</div>
          <div style="font-size:8px;color:var(--dim);margin-bottom:10px">${soul.pendingSource==='cache'?'📦 과거의 기록에서 불러온 후보입니다.':'✨ AI가 지금까지의 행동을 보고 제안한 후보입니다.'} 하나를 선택하면 되돌릴 수 없습니다.</div>
          ${soul.pendingCandidates.map((cand,idx)=>`
            <div style="padding:10px;background:#080600;border:1px solid #3a2a1a;border-radius:2px;margin-bottom:8px">
              <div style="font-size:10px;color:#c8a96e;font-family:Cinzel,serif;margin-bottom:4px">${idx+1}. ${esc(cand.name)}</div>
              <div style="font-size:8px;color:#8a7a5a;margin-bottom:6px">${esc(cand.desc||'')}</div>
              <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:6px">
                ${Object.entries(cand.bonus||{}).map(([k,v])=>`<span style="font-size:7px;padding:2px 5px;background:#0a0800;border:1px solid #2a2000;color:#c8a96e">${String(k).toUpperCase()} +${v}</span>`).join('')}
              </div>
              ${cand.skill?.name?`<div style="font-size:8px;color:#9080c0;margin-bottom:6px">🔹 ${esc(cand.skill.name)} — ${esc(cand.skill.desc||'')}</div>`:''}
              <button onclick="chooseSoulEvolution('${soul.id}', ${idx});renderSoulWeaponPanel()" style="padding:4px 10px;background:#1a1000;border:1px solid #c8a96e;color:#c8a96e;font-size:8px;cursor:pointer">이 길을 선택</button>
            </div>
          `).join('')}
        </div>`;
      }

      return `<div style="padding:12px;background:#080600;border:1px solid ${isEquippedNow?'#c8a96e88':'#3a2a1a'};border-left:3px solid ${isEquippedNow?'#c8a96e':soul.weaponItemId?'#7a6a4a':'#4a3a2a'};border-radius:2px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:20px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(info,{size:14}):(info?.icon||'👻')}</span>
          <div style="flex:1">
            <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e">${esc(soul.name)}</div>
            <div style="font-size:8px;color:var(--dim)">Lv.${soul.level}/${SOUL_MAX_LEVEL} · <span style="color:#d0b070">${info?.purityName||'여린 넋'}</span>(${info?.purityStage||1}/${SOUL_MAX_PURITY})${info?.dominantLabel?` · ${info.dominantLabel} 우세`:''}</div>
          </div>
          ${getDominantTagInfo(soul).count>0 && soul.level>=5 && (soul.purity||1)<SOUL_MAX_PURITY && !soul.weaponItemId?`<label style="font-size:8px;color:#d0b070;display:flex;align-items:center;gap:3px;cursor:pointer"><input type="checkbox" class="soul-fuse-pick" data-soul-id="${soul.id}" onchange="updateSoulFuseUI()" style="cursor:pointer"> 합성 선택</label>`:''}
        </div>
        ${info?.purityMult && info.purityMult>1?`<div style="font-size:7px;color:#7a6a4a;margin-bottom:4px">정화도 배율 ×${info.purityMult.toFixed(1)} 적용 중</div>`:''}
        ${info?.narrative?`<div style="font-size:8px;color:#8a7a5a;font-style:italic;margin-bottom:6px">"${esc(info.narrative)}"</div>`:''}
        ${info?.skill?.name?`<div style="font-size:8px;color:#9080c0;margin-bottom:6px">🔹 ${esc(info.skill.name)} — ${esc(info.skill.desc||'')}</div>`:''}

        ${soul.pendingSource==='ai_waiting'?`<div style="font-size:8px;color:#e0a040;margin-bottom:6px">⏳ AI가 진화 후보를 떠올리는 중... (다음 응답을 기다려주세요)</div>`:''}

        ${tagEntries.length?`
          <div style="margin-bottom:8px">
            <div style="font-size:8px;color:var(--dim);margin-bottom:3px">행동 기록 (총 ${totalTags}회)</div>
            ${tagEntries.map(([tag,count])=>{
              const def = SOUL_TAGS[tag]; if(!def) return '';
              const pct = totalTags ? Math.round(count/totalTags*100) : 0;
              const isDom = tagEntries[0][0] === tag;
              return `<div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">
                <span style="font-size:8px;width:60px;color:${isDom?'#c8a96e':'#8a7a5a'}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:8}):(def.icon)} ${def.label}</span>
                <div style="flex:1;height:3px;background:#1a1200;border-radius:2px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${isDom?'#c8a96e':'#5a4a3a'}"></div></div>
                <span style="font-size:7px;color:var(--dim);width:24px;text-align:right">${count}회</span>
              </div>`;
            }).join('')}
          </div>
        `:`<div style="font-size:8px;color:#5a4a3a;margin-bottom:8px">아직 아무 행동도 기록되지 않았습니다. 무기에 끼우고 플레이하면 색이 생깁니다.</div>`}

        ${req?`
          <div style="margin-bottom:6px">
            <div style="display:flex;justify-content:space-between;font-size:7px;color:var(--dim);margin-bottom:2px">
              <span>다음 진화 조건: 난이도 ${req.minDifficulty}+ 행동</span><span>${soul.progressCount||0}/${req.needCount}회</span>
            </div>
            <div style="height:4px;background:#1a1200;border-radius:2px;overflow:hidden">
              <div style="height:100%;width:${progressPct}%;background:#c8a96e;border-radius:2px"></div>
            </div>
          </div>
        `:`<div style="font-size:8px;color:#c8a96e;text-align:center;margin-bottom:6px">👑 최고 단계 도달</div>`}

        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
          ${Object.entries(info?.bonus||{}).map(([k,v])=>Number(v)>0?`<span style="font-size:8px;padding:2px 6px;background:#0a0800;border:1px solid #2a2000;color:#c8a96e;border-radius:2px">${String(k).toUpperCase()} +${v}</span>`:'').join('')}
        </div>

        ${soul.evolutions && soul.evolutions.length?`
          <details style="margin-bottom:6px">
            <summary style="font-size:7px;color:#4a3a2a;cursor:pointer">진화 이력 보기 (${soul.evolutions.length}단계) ▾</summary>
            <div style="margin-top:4px">
              ${soul.evolutions.map(ev=>`<div style="font-size:7px;color:#6a5a4a;padding:2px 0">Lv.${ev.level} → ${esc(ev.name)}</div>`).join('')}
            </div>
          </details>
        `:''}

        <div style="font-size:8px;color:#6a5a4a;margin-bottom:8px">
          ${weapon ? `현재 무기: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(weapon,{size:16}):(weapon.icon||"⚔️")} ${weapon.name} ${isEquippedNow?'<span style=\"color:#60c060\">(장착 중)</span>':'<span style=\"color:#e09050\">(장착 해제됨)</span>'}` : '<span style="color:#a08060">무기에 깃들지 않은 상태</span>'}
        </div>

        <div style="display:flex;gap:5px;flex-wrap:wrap">
          ${weapon?`<button onclick="detachSoulFromWeapon('${soul.id}');renderSoulWeaponPanel()" style="padding:4px 9px;background:#1a0a00;border:1px solid #3a2000;color:#c89060;font-size:8px;cursor:pointer">무기에서 분리</button>`:
            eligibleWeapons.length?`<select onchange="if(this.value){applySoulToWeapon('${soul.id}', this.value); renderSoulWeaponPanel();}" style="padding:3px 6px;background:#0a0800;border:1px solid #3a2a1a;color:#c8a96e;font-size:8px">
              <option value="">무기에 적용...</option>
              ${eligibleWeapons.map(w=>`<option value="${w.id}">${w.icon||'⚔️'} ${w.name}</option>`).join('')}
            </select>`:`<span style="font-size:8px;color:#5a4a3a">적용 가능한 레어+ 무기가 없습니다</span>`}
        </div>
      </div>`;
    }).join('')}

    <div style="font-size:8px;color:#4a3a2a;margin-top:8px;text-align:center">소울은 환생해도 사라지지 않습니다. 무기만 새로 마련하면 됩니다.</div>
  </div>`;
  setTimeout(updateSoulFuseUI, 0);
}
window.renderSoulWeaponPanel = renderSoulWeaponPanel;

window.renderSoulWeaponPanel = renderSoulWeaponPanel;

(function hookSoulWeaponPanelOpen(){
  setTimeout(()=>{
    const orig = window.openP;
    if(typeof orig==='function' && !orig._soulWeaponPanelHooked){
      window.openP = function(id){
        const r = orig.apply(this, arguments);
        if(id==='soulweapon') setTimeout(renderSoulWeaponPanel, 50);
        return r;
      };
      window.openP._soulWeaponPanelHooked = true;
    }
  }, 4300);
})();

document.addEventListener('DOMContentLoaded', ()=>{
  setTimeout(()=>{
    if(!document.querySelector(".pc-menu-btn[onclick*=\"openP('soulweapon')\"]")){
      const ref = document.querySelector('.pc-menu-btn[onclick*="inventory"]');
      if(ref){
        const btn = document.createElement('button');
        btn.className='pc-menu-btn';
        btn.setAttribute('onclick',"openP('soulweapon');renderSoulWeaponPanel()");
        btn.innerHTML='<span class="pc-ico">👻</span><span class="pc-lbl">소울</span>';
        ref.parentNode.insertBefore(btn, ref.nextSibling);
      }
    }
  }, 2150);
});

(function hookEquipForSoul(){
  setTimeout(()=>{
    if(typeof window.equipItem==='function' && !window.equipItem._soulHooked){
      const origEquip = window.equipItem;
      window.equipItem = function(idx){
        const r = origEquip.apply(this, arguments);
        try{ syncSoulWeaponEquip(); }catch(e){}
        return r;
      };
      window.equipItem._soulHooked = true;
    }
    if(typeof window.unequipItem==='function' && !window.unequipItem._soulHooked){
      const origUnequip = window.unequipItem;
      window.unequipItem = function(sl){
        const r = origUnequip.apply(this, arguments);
        try{ syncSoulWeaponEquip(); }catch(e){}
        return r;
      };
      window.unequipItem._soulHooked = true;
    }
  }, 3000);
})();

document.addEventListener('DOMContentLoaded', ()=>{
  setTimeout(()=>{ try{ if(typeof syncSoulWeaponEquip==='function') syncSoulWeaponEquip(); }catch(e){} }, 3500);
});

console.log('[16]소울 시스템(v8:횟수기반진화조건,난이도단계적강화,AI진화후보3종+캐싱,환생이월)');

(function(){

// ── 저장 구조 ─────────────────────────────────────────────
const SOUL_RUMOR_KEY = 'tf-soul-rumor-state';     // 현재 활성화된 소문/퀘스트 진행 상태
const SOUL_RUMOR_HEARD_KEY = 'tf-soul-rumor-heard'; // 들은 소문 ID 목록(중복 방지, 영구)
const SOUL_DUNGEON_KEY = 'tf-soul-dungeon-state';  // 대륙별 던전 발견/완파 상태

function loadSoulRumorState(){ try{ return JSON.parse(lsGet(SOUL_RUMOR_KEY)||'{}'); }catch(e){ return {}; } }
function saveSoulRumorState(d){ lsSet(SOUL_RUMOR_KEY, JSON.stringify(d||{})); }
function loadSoulRumorHeard(){ try{ return JSON.parse(lsGet(SOUL_RUMOR_HEARD_KEY)||'[]'); }catch(e){ return []; } }
function saveSoulRumorHeard(d){ lsSet(SOUL_RUMOR_HEARD_KEY, JSON.stringify(d||[])); }
function loadSoulDungeonState(){ try{ return JSON.parse(lsGet(SOUL_DUNGEON_KEY)||'{}'); }catch(e){ return {}; } }
function saveSoulDungeonState(d){ lsSet(SOUL_DUNGEON_KEY, JSON.stringify(d||{})); }
window.loadSoulRumorState = loadSoulRumorState;
window.loadSoulDungeonState = loadSoulDungeonState;
window.loadSoulRumorHeard = loadSoulRumorHeard;

// ── 경로 1: 소문 → 히든 사이드퀘스트 ───────────────────────────
// 각 소문은 "어디서/어떻게 들리는지"와 "그 소문이 가리키는 사연"을
// 갖는다. 들은 뒤 AI가 적절한 시점(플레이어가 그 단서를 따라갈 때)에
// 구체적인 퀘스트로 발전시키고, 완수하면 소울을 내린다.
const SOUL_RUMOR_POOL = [
  { id:'sr_weeping_sword',  icon:'⚔️', hearWhere:'tavern',
    rumorText:'어느 주점에서, 변경의 한 마을에 "스스로 우는 검"이 있다는 이야기가 떠돈다. 주인을 여럿 잡아먹었다고도 한다.',
    questHint:'그 마을을 찾아가 검의 사연을 추적하는 퀘스트로 발전. 검에 깃든 원한 혹은 슬픔의 정체를 밝히는 내용.' },
  { id:'sr_orphan_oracle',  icon:'👁️', hearWhere:'market',
    rumorText:'시장 한구석에서, 부모를 잃은 한 아이가 "보이지 않는 것을 본다"는 소문이 돈다. 사제들이 그 아이를 두려워한다고.',
    questHint:'그 아이를 찾아 진실을 확인하는 퀘스트. 신성한 힘인지 저주인지 밝혀지는 과정.' },
  { id:'sr_drowned_chapel', icon:'⛪', hearWhere:'dock',
    rumorText:'항구의 늙은 어부가, 폭풍이 칠 때마다 바닷속에서 종소리가 들리는 가라앉은 예배당 이야기를 한다.',
    questHint:'가라앉은 예배당을 직접 탐색하는 퀘스트. 그곳에 잠든 사연을 건져올리는 내용.' },
  { id:'sr_traitor_knight', icon:'🗡️', hearWhere:'barracks',
    rumorText:'병영에서, 수십 년 전 동료를 배신한 기사의 갑주가 아직도 전장 어딘가에 버려져 있다는 이야기가 돈다.',
    questHint:'그 갑주를 찾아가는 퀘스트. 배신의 진실과 그 기사가 진짜 배신자였는지를 밝히는 내용.' },
  { id:'sr_forgotten_choir', icon:'🎵', hearWhere:'shrine',
    rumorText:'신전 관리인이, 폐허가 된 옛 성가대 자리에서 아무도 없는데 노랫소리가 들린다는 소문을 전한다.',
    questHint:'폐허가 된 성가대 자리를 조사하는 퀘스트. 사라진 성가대의 마지막 사연을 밝히는 내용.' },
  { id:'sr_miners_pact',    icon:'⛏️', hearWhere:'mine',
    rumorText:'광부들 사이에서, 갱도 깊은 곳에서 "댓가를 치르면 무엇이든 캐낼 수 있다"는 목소리를 들었다는 이야기가 돈다.',
    questHint:'갱도 깊은 곳을 탐사하는 퀘스트. 그 목소리의 정체와 과거에 댓가를 치른 광부들의 흔적을 밝히는 내용.' },
];
window.SOUL_RUMOR_POOL = SOUL_RUMOR_POOL;

// 마을/도시 등 일반 장소를 방문할 때 낮은 확률로 소문을 들려준다.
// hearWhere는 서사적 분위기 힌트일 뿐 — 장소 타입을 엄격히 매칭하지
// 않고, 사람이 모이는 곳이면 어디서든 들릴 수 있게 한다.
const SOUL_RUMOR_CHANCE = 0.04; // 매 위치 방문/대화 시 4%
function tryHearSoulRumor(){
  try{
    const heard = loadSoulRumorHeard();
    const state = loadSoulRumorState();
    if(state.active) return; // 이미 진행 중인 소울 퀘스트가 있으면 새 소문 안 띄움
    const candidates = SOUL_RUMOR_POOL.filter(r=>!heard.includes(r.id));
    if(!candidates.length) return; // 전부 들었으면 끝(영구 — 다음 생에서도 안 반복)
    if(Math.random() > SOUL_RUMOR_CHANCE) return;
    const pick = candidates[Math.floor(Math.random()*candidates.length)];
    heard.push(pick.id);
    saveSoulRumorHeard(heard);
    state.active = { rumorId: pick.id, stage:'rumor_heard', heardAt: S?.msgCount||0 };
    saveSoulRumorState(state);
    toast(`우연히 흥미로운 소문을 들었다...`, 3500, pick);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[💬 소문] ${pick.rumorText} 이 소문을 짧게 서사로 흘려라(직접 NPC 대화나 분위기로). 플레이어가 이 단서를 따라가고 싶어하면, 이후 응답에서 ${pick.questHint} 형태의 구체적인 히든 퀘스트로 발전시키고 <gs>{"soul_quest_start":"${pick.id}"}</gs>를 출력하라. 플레이어가 무시하면 그냥 흘러가도 된다 — 강제하지 마라.`;
  }catch(e){}
}
window.tryHearSoulRumor = tryHearSoulRumor;

function handleSoulQuestStart(rumorId){
  try{
    const def = SOUL_RUMOR_POOL.find(r=>r.id===rumorId);
    if(!def) return;
    const state = loadSoulRumorState();
    state.active = { rumorId, stage:'quest_active', startedAt: S?.msgCount||0 };
    saveSoulRumorState(state);
    toast(`📜 히든 퀘스트 시작: 소문의 진상을 추적합니다.`, 3500);
  }catch(e){}
}
window.handleSoulQuestStart = handleSoulQuestStart;

function handleSoulQuestComplete(rumorId){
  try{
    const def = SOUL_RUMOR_POOL.find(r=>r.id===rumorId);
    const state = loadSoulRumorState();
    if(!state.active || state.active.rumorId !== rumorId) return; // 활성 상태와 다르면 무시(오작동 방지)
    state.active = null;
    saveSoulRumorState(state);
    grantSoul(`히든 퀘스트 완수 — "${def?.rumorText?.slice(0,30)||rumorId}..."에서 시작된 사연의 끝`);
  }catch(e){}
}
window.handleSoulQuestComplete = handleSoulQuestComplete;

// ── 경로 2: 대륙별 고등급 히든 던전 (8개 대륙 × 1개) ──────────────
// 일반 탐험으로는 입구가 보이지 않고, 그 대륙에서 충분한 활동(전투
// 승리 또는 탐험 누적)을 쌓아야 입구의 존재가 드러난다. 던전 자체의
// 전투 진행은 기존 전투/탐험 시스템에 맡기고, 완파 시 AI가
// soul_dungeon_clear GS를 출력하면 소울을 내린다.
const SOUL_HIDDEN_DUNGEONS = {
  central:    { id:'sd_central',    icon:'🏰', name:'폐위된 왕의 지하묘', revealThreshold:25,
                hint:'중앙 대륙 왕도 인근 — 역사에서 지워진 폐위된 왕의 묘가 있다는 단서들이 쌓여간다.' },
  north:      { id:'sd_north',      icon:'❄️', name:'얼어붙은 거인의 심장', revealThreshold:25,
                hint:'북대륙 설원 깊은 곳 — 거인의 심장이라 불리는 거대한 빙하 동굴의 존재가 드러난다.' },
  east:       { id:'sd_east',       icon:'🐉', name:'잠든 고룡의 영묘', revealThreshold:25,
                hint:'동대륙 — 고룡들이 죽으면 묻힌다는 전설의 영묘가 실재한다는 흔적이 쌓인다.' },
  west:       { id:'sd_west',       icon:'⚓', name:'침몰한 함대의 묘지', revealThreshold:25,
                hint:'서대륙 해안 — 수백 년 전 침몰한 함대 전체가 가라앉은 해저 묘지가 있다.' },
  south:      { id:'sd_south',      icon:'☀️', name:'태양에 잊힌 신전', revealThreshold:25,
                hint:'남대륙 사막 깊은 곳 — 태양신을 섬기다 잊혀진 고대 신전의 위치가 서서히 드러난다.' },
  northeast:  { id:'sd_northeast',  icon:'🌿', name:'태초의 숲 깊은 곳', revealThreshold:25,
                hint:'북동 대륙 엘프 고원 — 어떤 엘프도 다시 돌아오지 못했다는 태초의 숲 심장부.' },
  southeast:  { id:'sd_southeast',  icon:'🌑', name:'균열 아래의 안식처', revealThreshold:25,
                hint:'남동 대륙 — 다크링들도 꺼리는, 균열 아래 깊은 곳의 봉인된 안식처.' },
  northwest:  { id:'sd_northwest',  icon:'⚙️', name:'발명가들의 무덤', revealThreshold:25,
                hint:'북서 대륙 — 금지된 기술을 연구하다 사라진 발명가들의 비밀 연구소.' },
};
window.SOUL_HIDDEN_DUNGEONS = SOUL_HIDDEN_DUNGEONS;

// 대륙별 활동 카운터 누적(전투 승리 또는 탐험 행동 1회당 +1) — 기존
// 소울 행동 태그 기록(tryAutoTagActiveSoul 등)과는 별개로, 단순히
// "이 대륙에서 얼마나 활동했는지"만 누적한다.
function tickContinentActivity(){
  try{
    const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    const continent = loc?.continent;
    if(!continent || !SOUL_HIDDEN_DUNGEONS[continent]) return;
    const state = loadSoulDungeonState();
    const entry = state[continent] || { activity:0, revealed:false, cleared:false };
    if(entry.cleared || entry.revealed) return; // 이미 발견/완파했으면 카운트 불필요
    entry.activity = (entry.activity||0) + 1;
    const def = SOUL_HIDDEN_DUNGEONS[continent];
    if(entry.activity >= def.revealThreshold){
      entry.revealed = true;
      toastHTML(`🗺️ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} 이 대륙 어딘가에 숨겨진 장소의 흔적을 느꼈다...`, 4000);
      S._nextInjectedContext = (S._nextInjectedContext||'')
        + `\n[🗺️ 히든 던전 발견 가능] 플레이어가 이 대륙에서 충분히 활동했다 — "${def.name}"(${def.hint})의 존재가 드러날 시점이다. 적절한 시점에 소문이나 단서로 그 장소의 입구를 암시하라. 플레이어가 실제로 입구를 찾아 들어가면 <gs>{"flags":["dungeon_found_${def.id}"]}</gs>를 출력하라.`;
    }
    state[continent] = entry;
    saveSoulDungeonState(state);
  }catch(e){}
}
window.tickContinentActivity = tickContinentActivity;

function handleSoulDungeonClear(dungeonId){
  try{
    const entry = Object.entries(SOUL_HIDDEN_DUNGEONS).find(([,d])=>d.id===dungeonId);
    if(!entry) return;
    const [continent, def] = entry;
    const state = loadSoulDungeonState();
    const cState = state[continent] || {};
    if(cState.cleared) return; // 이미 완파한 던전은 중복 보상 없음
    cState.cleared = true;
    state[continent] = cState;
    saveSoulDungeonState(state);
    grantSoul(`${def.name} 완파 — ${def.hint}`);
  }catch(e){}
}
window.handleSoulDungeonClear = handleSoulDungeonClear;

// ── BLS 가이드 — 위 두 경로의 GS 사용법을 AI에게 안내 ──────────
function getSoulAcquisitionBLS(){
  try{
    const lines = [];
    const rumorState = loadSoulRumorState();
    if(rumorState.active){
      const def = SOUL_RUMOR_POOL.find(r=>r.id===rumorState.active.rumorId);
      if(def) lines.push(`[📜 진행 중인 소울 히든 퀘스트] "${def.rumorText.slice(0,40)}..." 관련 사연. 완수되면 <gs>{"soul_quest_complete":"${def.id}"}</gs>를 출력하라.`);
    }
    const dungeonState = loadSoulDungeonState();
    const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    const continent = loc?.continent;
    if(continent && SOUL_HIDDEN_DUNGEONS[continent]){
      const def = SOUL_HIDDEN_DUNGEONS[continent];
      const entry = dungeonState[continent];
      if(entry?.revealed && !entry?.cleared){
        lines.push(`[🗺️ 발견 가능한 히든 던전] 이 대륙에 "${def.name}"이 있다. 플레이어가 그 안에서 강력한 수호자를 완전히 쓰러뜨리면 <gs>{"flags":["dungeon_cleared_${def.id}"]}</gs>를 출력하라.`);
      }
    }
    if(lines.length) lines.push('소울 획득 경로는 위 두 가지(히든 퀘스트 완수, 히든 던전 완파)뿐이다 — 일반 NPC 호감도로는 더 이상 얻을 수 없다.');
    return lines.length ? '\n' + lines.join('\n') : '';
  }catch(e){ return ''; }
}
window.getSoulAcquisitionBLS = getSoulAcquisitionBLS;

// ── GS 훅 ──────────────────────────────────────────────────
(function hookSoulAcquisitionGS(){
  setTimeout(()=>{
    const orig = window.processGSToAllDBs;
    if(typeof orig==='function' && !orig._soulAcqGSHooked){
      window.processGSToAllDBs = function(gs){
        const result = orig.apply(this, arguments);
        try{
          if(typeof gs.soul_quest_start === 'string') handleSoulQuestStart(gs.soul_quest_start);
          if(typeof gs.soul_quest_complete === 'string') handleSoulQuestComplete(gs.soul_quest_complete);
          // 던전 발견/완파는 flags 배열로 옴 (dungeon_found_sd_xxx / dungeon_cleared_sd_xxx)
          if(Array.isArray(gs.flags)){
            gs.flags.forEach(f=>{
              const clearMatch = /^dungeon_cleared_(sd_\w+)$/.exec(f);
              if(clearMatch) handleSoulDungeonClear(clearMatch[1]);
            });
          }
          // 소문 발생 시도 + 대륙 활동 누적은 매 턴 자연스럽게 체크
          tryHearSoulRumor();
          tickContinentActivity();
        }catch(e){}
        return result;
      };
      window.processGSToAllDBs._soulAcqGSHooked = true;
    }
  }, 2250);
})();

(function hookSoulAcquisitionToBLS(){
  setTimeout(()=>{
    const fn = typeof window.buildLightSystem==='function'?'buildLightSystem'
             : typeof window.buildSystemPrompt==='function'?'buildSystemPrompt'
             : typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn) return;
    const orig = window[fn];
    if(typeof orig==='function' && !orig._soulAcqBLSHooked){
      window[fn] = function(){
        const r = orig.apply(this, arguments);
        try{ const b=getSoulAcquisitionBLS(); return b&&typeof r==='string'?r+b:r; }catch(e){ return r; }
      };
      window[fn]._soulAcqBLSHooked = true;
    }
  }, 4780);
})();

console.log('[16-B]소울 획득(v10:소문→히든퀘 6종 + 대륙별 히든던전 8종, NPC경로 제거)');

// ══════════════════════════════════════════════════════════════
//  [16-C] 능동적 정보 획득 (v11) — 인간형 인카운터 + 매복/수색 + 조각 정보
//  [설계 변경] v10은 "야외에서 AI가 자유 서사로 만든 NPC를 마주칠 때"만
//  작동했는데, 실제로는 야외 랜덤 인카운터 풀(checkRandomEncounter의
//  ENCOUNTER_POOL)이 전부 적대 몬스터/동물뿐이라 일반 인간형 NPC를
//  마주칠 확률이 거의 없었다. v11은:
//   1) 사람을 마주칠 수 있는 별도 인카운터 풀을 신설
//   2) "매복한다/수색한다" 같은 능동적 행동에 확률 보너스(사기적이지
//      않게 적당한 +%p, 상한 있음)를 주어 무작정 돌아다니지 않아도 됨
//   3) 한 번에 완전한 답을 주지 않고 "조각(파편)"으로 나눠 여러 번
//      모아야 완성되며, NPC 신뢰도에 따라 틀린 파편(가짜 정보)도 나옴
//   4) 소울 관련 정보 외에 일반 정보(세력 동향, 위험 경고, 거래 정보
//      등)도 같은 캐묻기 행동에서 나올 수 있게 확장
// ══════════════════════════════════════════════════════════════

// ── 인간형 인카운터 풀 — 적대/중립 혼재 ───────────────────────
// hostile: true면 처음부터 전투로 시작(도적 등), false면 중립적 만남
// (대화·협박·회유·기습 모두 플레이어가 선택 가능).
const SOUL_HUMAN_ENCOUNTER_POOL = [
  // ── 일반/중립 — 협박·회유·대화 모두 가능 ──
  { id:'enc_wanderer',   icon:'🚶', name:'떠돌이 모험가', hostile:false, knowledge:0.7,  rankText:'용병',          guarded:false },
  { id:'enc_merchant',   icon:'🛒', name:'행상인',        hostile:false, knowledge:0.5,  rankText:'상인',          guarded:false },
  { id:'enc_pilgrim',    icon:'🙏', name:'순례자',        hostile:false, knowledge:0.4,  rankText:'평민',          guarded:false },
  { id:'enc_scout',      icon:'🏹', name:'정찰병',        hostile:false, knowledge:0.6,  rankText:'파수꾼',        guarded:false },
  { id:'enc_courier',    icon:'✉️', name:'전령',          hostile:false, knowledge:0.5,  rankText:'평민',          guarded:false },
  { id:'enc_priest',     icon:'⛪', name:'떠돌이 성직자', hostile:false, knowledge:0.45, rankText:'사제',          guarded:false },
  { id:'enc_knight',     icon:'🛡️', name:'편력 기사',     hostile:false, knowledge:0.5,  rankText:'기사',          guarded:false },
  { id:'enc_smuggler',   icon:'📦', name:'밀수업자',      hostile:false, knowledge:0.6,  rankText:'상인',          guarded:false, wary:true },
  // ── 호위를 동반한 행렬 — 협박/약탈 시 호위와의 전투로 이어질 위험이 있음 ──
  { id:'enc_noble_caravan', icon:'👑', name:'귀족의 행렬',   hostile:false, knowledge:0.5, rankText:'남작',  guarded:true,  guardRank:'기사단원' },
  { id:'enc_mercenary_band', icon:'⚔️', name:'용병단',       hostile:false, knowledge:0.55, rankText:'용병단장', guarded:true, guardRank:'베테랑 용병' },
  // ── 적대 — 먼저 전투로 시작될 수 있음 ──
  { id:'enc_bandit',     icon:'🗡️', name:'산적',          hostile:true,  knowledge:0.6,  rankText:'도적',          guarded:false },
  { id:'enc_deserter',   icon:'🪖', name:'탈영병',        hostile:true,  knowledge:0.65, rankText:'이등병',        guarded:false },
  { id:'enc_slaver',     icon:'⛓️', name:'노예 상인',     hostile:true,  knowledge:0.55, rankText:'상인',          guarded:true, guardRank:'용병' },
  { id:'enc_grave_robber', icon:'⚱️', name:'무덤 도굴꾼',  hostile:true,  knowledge:0.65, rankText:'도적',          guarded:false },
  { id:'enc_inquisitor', icon:'🔥', name:'이단 심문관',   hostile:true,  knowledge:0.7,  rankText:'주교',          guarded:true, guardRank:'성기사', highRisk:true },
];
window.SOUL_HUMAN_ENCOUNTER_POOL = SOUL_HUMAN_ENCOUNTER_POOL;

// 신분 텍스트(rankText)로 절대 레벨을 산정 — 기존 NPC_RANK_LEVEL_TABLE을
// 그대로 재사용해, 새로 레벨 수치를 하드코딩하지 않는다.
function getEncounterLevel(encDef){
  try{
    return (typeof getNpcAbsoluteLevel==='function') ? getNpcAbsoluteLevel(encDef.rankText) : 20;
  }catch(e){ return 20; }
}
window.getEncounterLevel = getEncounterLevel;

// 인간형 인카운터 기본 확률(이동 입력 시) — 기존 몬스터 인카운터
// (checkRandomEncounter)와는 독립적으로 별도 판정한다. 매복/수색 보너스가
// 여기에 더해진다(아래 활성 행동 보너스 참고).
const SOUL_HUMAN_ENCOUNTER_BASE = 0.05; // 기본 5%
const SOUL_HUMAN_ENCOUNTER_ACTIVE_BONUS = 0.15; // 매복/수색 시 +15%p
const SOUL_HUMAN_ENCOUNTER_CAP = 0.35; // 아무리 보너스를 쌓아도 최대 35% — 사기적이지 않게 상한

// 플레이어가 "매복한다/수색한다/길목을 지킨다"는 의도로 행동했는지 감지.
// AI가 직접 GS로 보고하는 게 정확하지만, 텍스트 키워드로도 보조 감지한다.
const AMBUSH_INTENT_RE = /매복|잠복|숨어서\s*기다|길목을\s*지키|길목에서\s*기다|지나가는\s*사람을\s*기다|덫을\s*놓|함정을\s*파|망을\s*보|수색한다|뒤져본다|주변을\s*살펴|순찰로를\s*추적/;
window.AMBUSH_INTENT_RE = AMBUSH_INTENT_RE;

function tryHumanEncounter(isActiveAttempt){
  try{
    if(S?._inCombat) return false;
    const isInCombat = (typeof loadMonsters==='function') && (loadMonsters()||[]).some(m=>m.status==='alive');
    if(isInCombat) return false;

    let chance = SOUL_HUMAN_ENCOUNTER_BASE;
    if(isActiveAttempt) chance += SOUL_HUMAN_ENCOUNTER_ACTIVE_BONUS;
    chance = Math.min(SOUL_HUMAN_ENCOUNTER_CAP, chance);
    const _mult = (typeof getCurrentEncounterMult==='function') ? getCurrentEncounterMult() : 1.0;
    if(_mult <= 0) return false; // 비행 등 지상 인카운터 완전 차단 수단
    chance *= _mult;
    if(Math.random() > chance) return false;

    const pick = SOUL_HUMAN_ENCOUNTER_POOL[Math.floor(Math.random()*SOUL_HUMAN_ENCOUNTER_POOL.length)];
    const encId = 'human_enc_' + Date.now();
    const lvl = getEncounterLevel(pick);
    S._pendingHumanEncounter = { ...pick, encId, level: lvl };

    toast(`${pick.name}과(와) 마주쳤다.`, 3200, pick);
    const guardNote = pick.guarded ? ` 이 인물은 호위(${pick.guardRank||'경비'})를 동반하고 있다 — 협박이나 약탈을 시도하면 호위와의 전투로 번질 수 있다.` : '';
    const wantedNote = pick.highRisk ? ` 이 인물은 상당히 위험한 상대다 — 함부로 건드리면 큰 대가를 치를 수 있음을 암시하라.` : '';
    const waryNote = pick.wary ? ` 이 인물은 경계심이 많아 처음엔 말을 아낀다 — 신뢰를 얻거나 위협이 확실해야 입을 연다.` : '';
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[${pick.icon} 인적 조우] ${isActiveAttempt?'매복/수색 끝에':'길을 가다 우연히'} ${pick.name}(${pick.rankText}, Lv.${lvl} 상당)과(와) 마주쳤다. ${pick.hostile?'이 인물은 적대적이다 — 전투로 이어질 수 있다.':'이 인물은 적대적이지 않다 — 대화, 협박, 회유, 기습 중 플레이어가 무엇을 선택하든 자연스럽게 받아들여라.'}${guardNote}${wantedNote}${waryNote} 플레이어가 위협·협박·회유·심문으로 정보를 캐내려 하면, 명확히 성공했을 때 <gs>{"soul_info_extract":{"npcName":"${pick.name}","method":"intimidation 또는 persuasion 또는 robbery 또는 dialogue"}}</gs>를 출력하라.`;
    return true;
  }catch(e){ return false; }
}
window.tryHumanEncounter = tryHumanEncounter;


// [버그 수정] 이 자리에 있던 hookHumanEncounterToSendMsg는
// window.checkRandomEncounter를 감싸는 방식이었다. checkRandomEncounter가
// quest/086에 로컬 선언돼 있고 그 파일의 실제 호출도 bare 식별자라 이
// 감싸기가 절대 적용되지 못했다(다른 죽은 훅들과 동일한 원인). 같은
// 로직을 quest/086의 실제 호출 지점에 네이티브로 옮겼다.

// ── 조각 정보(파편) 시스템 ────────────────────────────────────
// 소문 하나(SOUL_RUMOR_POOL의 각 항목)를 3개 파편으로 나눈다. 파편은
// 고정 텍스트가 아니라 "어느 조각인지(0/1/2)"만 추적하고, 실제 텍스트는
// AI가 그때그때 그 조각에 맞게 서술한다(완전한 정답을 미리 다 주지
// 않기 위함). NPC 신뢰도(knowledge)가 낮을수록 틀린 파편(가짜)을 줄
// 확률이 높다 — 가짜 파편은 진짜 파편 수에 포함되지 않고, 플레이어가
// 모았다고 착각할 수 있는 함정 정보로 작동한다.
const SOUL_FRAGMENT_KEY = 'tf-soul-fragments'; // { rumorId: { collected:[0,1,2], fakeCount } }
function loadSoulFragments(){ try{ return JSON.parse(lsGet(SOUL_FRAGMENT_KEY)||'{}'); }catch(e){ return {}; } }
function saveSoulFragments(d){ lsSet(SOUL_FRAGMENT_KEY, JSON.stringify(d||{})); }
window.loadSoulFragments = loadSoulFragments;

// ── 일반 정보 풀 (소울과 무관, 잡담형 세계 정보) ───────────────
// 이런 정보는 파편화하지 않고 1회성으로 바로 제공된다 — 소울처럼 큰
// 보상이 아니라 분위기/실용 정보이므로 단순하게 처리.
const GENERAL_INFO_POOL = [
  { id:'gi_price_surge', text:'최근 이 지역 곡물 가격이 들썩이고 있다는 이야기 — 어딘가 흉작이 들었거나, 누군가 사재기를 하고 있다는 뜻이다.' },
  { id:'gi_patrol_route', text:'순찰대가 평소와 다른 경로로 움직이고 있다는 이야기 — 뭔가를 경계하고 있는 듯하다.' },
  { id:'gi_faction_tension', text:'이 지역 세력들 사이에 긴장감이 흐른다는 이야기 — 곧 무슨 일이 생길 것 같다.' },
  { id:'gi_danger_zone', text:'근방의 특정 길목에서 최근 여행자들이 실종됐다는 소문 — 그곳을 지날 때는 주의해야 한다.' },
  { id:'gi_hidden_shop', text:'간판 없는 가게가 어디 있는지, 그곳에서 뭘 파는지에 대한 귀띔.' },
];
window.GENERAL_INFO_POOL = GENERAL_INFO_POOL;

// ── 정보 추출 처리 — soul_info_extract GS를 받아 실제로 무엇을 줄지 결정.
// 우선순위: (1) 진행 중인 소문 퀘스트가 있으면 그 파편 시도 (2) 없으면
// 새 소문의 첫 파편 시도 또는 일반 정보 — NPC의 knowledge에 따라 확률 분배.
function handleSoulInfoExtractGS(payload){
  try{
    if(!payload || !payload.npcName) return;
    const extracted = loadSoulInfoExtracted();
    if(extracted.includes(payload.npcName)){
      toast(`💬 ${payload.npcName}은(는) 이미 알고 있는 것을 다 털어놓았다.`, 2800);
      return;
    }
    extracted.push(payload.npcName);
    saveSoulInfoExtracted(extracted);

    // 마주친 NPC의 신뢰도(knowledge) — 직접 명시되지 않으면 보통 수준(0.55)
    const pending = S?._pendingHumanEncounter;
    const knowledge = (pending && pending.name===payload.npcName) ? pending.knowledge : 0.55;
    const methodLabel = payload.method==='intimidation' ? '협박' : payload.method==='persuasion' ? '회유' : payload.method==='robbery' ? '약탈' : '대화';

    const rumorState = loadSoulRumorState();
    const fragments = loadSoulFragments();

    // 진행 중인 소문이 있으면 그 파편을 시도 (이미 다 모았으면 일반 정보로 폴백)
    let targetRumorId = rumorState.active?.rumorId || null;
    if(!targetRumorId){
      const heard = loadSoulRumorHeard();
      const candidates = SOUL_RUMOR_POOL.filter(r=>!heard.includes(r.id) && !fragments[r.id]?.completed);
      if(candidates.length) targetRumorId = candidates[Math.floor(Math.random()*candidates.length)].id;
    }

    // 30% 확률로 소울 정보 대신 일반 정보를 줌(소울 정보로만 채워지지
    // 않도록 — 말씀하신 "다른 정보도 얻을 수 있게").
    const giveGeneral = !targetRumorId || Math.random() < 0.3;
    if(giveGeneral){
      const info = GENERAL_INFO_POOL[Math.floor(Math.random()*GENERAL_INFO_POOL.length)];
      toast(`💬 ${methodLabel} 끝에 ${payload.npcName}에게서 잡다한 정보를 들었다.`, 3500);
      S._nextInjectedContext = (S._nextInjectedContext||'')
        + `\n[💬 일반 정보 — ${methodLabel}] ${payload.npcName}이(가) 다음 이야기를 전했다: ${info.text} 이 정보를 NPC의 입을 통해 짧게 서사화하라. 즉시 사용 가능한 분위기/단서 정보이며, 별도 GS 출력은 필요 없다.`;
      return;
    }

    const def = SOUL_RUMOR_POOL.find(r=>r.id===targetRumorId);
    if(!def) return;
    const entry = fragments[targetRumorId] || { collected:[], fakeCount:0 };

    // 신뢰도가 낮을수록 가짜 파편을 줄 확률이 높음 (knowledge가 낮을수록 위험)
    const fakeChance = Math.max(0, 0.5 - knowledge*0.5); // knowledge 1.0→0%, knowledge 0.4→30%, knowledge 0→50%
    const isFake = Math.random() < fakeChance;

    if(isFake){
      entry.fakeCount = (entry.fakeCount||0) + 1;
      fragments[targetRumorId] = entry;
      saveSoulFragments(fragments);
      toast(`💬 ${methodLabel} 끝에 ${payload.npcName}에게서 단서를 얻었지만... 확신은 들지 않는다.`, 3500);
      S._nextInjectedContext = (S._nextInjectedContext||'')
        + `\n[💬 불확실한 정보 — ${methodLabel}] ${payload.npcName}이(가) "${def.rumorText.slice(0,25)}..."와 관련된 것처럼 들리는 이야기를 했지만, 이 인물은 사실 잘 모르고 떠도는 말을 옮긴 것뿐이다(신뢰도 낮음). 자신 없어 하거나 앞뒤가 안 맞는 느낌으로 서술하라 — 플레이어에게 "이 정보가 진짜인지 의심할 거리"를 남겨라. 진짜 정보가 아니므로 soul_quest_start를 출력하지 마라.`;
      return;
    }

    const missing = [0,1,2].filter(i=>!entry.collected.includes(i));
    const fragIdx = missing.length ? missing[Math.floor(Math.random()*missing.length)] : null;
    if(fragIdx === null){
      // 이미 다 모았는데 또 캐낸 경우 — 같은 사연 재확인으로 처리
      toast(`💬 ${payload.npcName}의 이야기는 이미 알고 있는 내용과 같았다.`, 3000);
      return;
    }
    entry.collected.push(fragIdx);
    fragments[targetRumorId] = entry;
    saveSoulFragments(fragments);

    const fragLabels = ['시작(누가/어디서)', '경과(무슨 일이 있었는지)', '결정적 단서(지금 어디로 가야 하는지)'];
    const isComplete = entry.collected.length >= 3;

    toast(`${methodLabel} 끝에 단서 조각을 얻었다 (${entry.collected.length}/3)`, 4000, def);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[💬 단서 조각 ${entry.collected.length}/3 — ${methodLabel}] ${payload.npcName}이(가) 다음 사연의 한 조각("${fragLabels[fragIdx]}" 부분)을 들려준다: ${def.rumorText} 이번엔 그 사연의 "${fragLabels[fragIdx]}" 측면만 짧게 서술하라 — 전체를 한 번에 다 풀지 마라.`
      + (isComplete
          ? ` 이것으로 세 조각이 모두 모였다 — 이제 플레이어가 충분한 정보를 얻었으니, 다음 응답에서 ${def.questHint} 형태로 구체적인 히든 퀘스트로 발전시키고 <gs>{"soul_quest_start":"${def.id}"}</gs>를 출력하라.`
          : ` 아직 전체 사연은 다 드러나지 않았다 — 더 캐물어야 완성된다는 인상을 남겨라.`);
  }catch(e){}
}
window.handleSoulInfoExtractGS = handleSoulInfoExtractGS;

const SOUL_INFO_EXTRACTED_KEY = 'tf-soul-info-extracted';
function loadSoulInfoExtracted(){ try{ return JSON.parse(lsGet(SOUL_INFO_EXTRACTED_KEY)||'[]'); }catch(e){ return []; } }
function saveSoulInfoExtracted(d){ lsSet(SOUL_INFO_EXTRACTED_KEY, JSON.stringify(d||[])); }
window.loadSoulInfoExtracted = loadSoulInfoExtracted;

(function hookSoulInfoExtractGS(){
  setTimeout(()=>{
    const orig = window.processGSToAllDBs;
    if(typeof orig==='function' && !orig._soulInfoGSHooked){
      window.processGSToAllDBs = function(gs){
        const result = orig.apply(this, arguments);
        try{
          if(gs.soul_info_extract) handleSoulInfoExtractGS(gs.soul_info_extract);
        }catch(e){}
        return result;
      };
      window.processGSToAllDBs._soulInfoGSHooked = true;
    }
  }, 2280);
})();

// BLS 가이드 — 매복/수색 행동도 함께 안내(텍스트 키워드 외에 명시적
// GS로도 보고할 수 있게).
function getSoulInfoExtractBLS(){
  try{
    const lines = [];
    lines.push(`[💬 능동적 정보 획득] 플레이어가 야외에서 매복하거나 길목을 지키거나 주변을 수색하면, 사람을 마주칠 확률이 평소보다 올라간다(과하지 않은 수준). 마주친 인물을 협박·회유·심문·기습해 정보를 캐내려는 시도가 명확히 성공하면 <gs>{"soul_info_extract":{"npcName":"NPC이름","method":"intimidation 또는 persuasion 또는 robbery 또는 dialogue"}}</gs>를 출력하라. 매번 완전한 정답이 나오는 게 아니라 조각조각 모이거나, 가끔 틀린 정보일 수도 있다는 점을 서사로 자연스럽게 드러내라(시스템이 어느 쪽인지는 알려준다). 이 경로는 마을 출입이 막힌 범죄자 플레이에게도 항상 열려 있다.`);
    return '\n' + lines.join('\n');
  }catch(e){ return ''; }
}
window.getSoulInfoExtractBLS = getSoulInfoExtractBLS;

(function hookSoulInfoExtractToBLS(){
  setTimeout(()=>{
    const fn = typeof window.buildLightSystem==='function'?'buildLightSystem'
             : typeof window.buildSystemPrompt==='function'?'buildSystemPrompt'
             : typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn) return;
    const orig = window[fn];
    if(typeof orig==='function' && !orig._soulInfoBLSHooked){
      window[fn] = function(){
        const r = orig.apply(this, arguments);
        try{ const b=getSoulInfoExtractBLS(); return b&&typeof r==='string'?r+b:r; }catch(e){ return r; }
      };
      window[fn]._soulInfoBLSHooked = true;
    }
  }, 4790);
})();

console.log('[16-C]능동적 정보 획득(v11:인간형인카운터+매복수색보너스+조각정보3개+가짜정보+일반정보)');
// ══════════════════════════════════════════════════════════════
//  [16-D] 목격형 인카운터 — NPC끼리 충돌하는 현장을 마주침 (v12)
//  [설계] 지금까지는 플레이어가 항상 1:1로 NPC를 마주쳤다. 실제로는
//  세계가 플레이어 없이도 돌아가야 한다 — 이단 심문관이 이교도를
//  추궁하거나, 탈영병이 행상인을 약탈하거나, 산적이 편력 기사와
//  맞서는 장면을 플레이어가 "목격"할 수 있다. 플레이어는 개입해서
//  한쪽을 돕거나, 숨어 지켜보다 끝난 뒤 접근하거나, 그냥 지나갈 수
//  있다. 어느 쪽을 도왔는지에 따라 그 생존자와의 관계와 캐낼 수 있는
//  정보의 질이 달라진다.
// ══════════════════════════════════════════════════════════════

// ── 대립 쌍 정의 — 공격자(aggressor)와 피해자(victim) 역할이 고정된
// 조합. 누가 이기는지는 정해지지 않고, 개입 여부와 전투 결과로 갈린다.
const SOUL_WITNESS_PAIRS = [
  { id:'wp_inquisitor_priest', aggressor:'enc_inquisitor', victim:'enc_priest',
    desc:'이단 심문관이 떠돌이 성직자를 이교 혐의로 추궁하며 위협하고 있다.' },
  { id:'wp_deserter_merchant', aggressor:'enc_deserter', victim:'enc_merchant',
    desc:'탈영병이 행상인의 짐수레를 약탈하려 칼을 빼들고 있다.' },
  { id:'wp_bandit_knight', aggressor:'enc_bandit', victim:'enc_knight',
    desc:'산적 무리가 편력 기사를 둘러싸고 통행료를 요구하며 위협한다.' },
  { id:'wp_slaver_pilgrim', aggressor:'enc_slaver', victim:'enc_pilgrim',
    desc:'노예 상인의 호위가 홀로 다니는 순례자를 붙잡아 끌고 가려 한다.' },
  { id:'wp_graverobber_priest', aggressor:'enc_grave_robber', victim:'enc_priest',
    desc:'무덤 도굴꾼이 묘지를 지키던 떠돌이 성직자와 몸싸움을 벌이고 있다.' },
  { id:'wp_mercenary_smuggler', aggressor:'enc_mercenary_band', victim:'enc_smuggler',
    desc:'용병단이 밀수업자의 뒤를 쫓아와 짐을 빼앗으려 추궁하고 있다.' },
  { id:'wp_inquisitor_smuggler', aggressor:'enc_inquisitor', victim:'enc_smuggler',
    desc:'이단 심문관이 밀수업자의 짐에서 금지된 물건을 찾아내고 그를 체포하려 한다.' },
  { id:'wp_deserter_pilgrim', aggressor:'enc_deserter', victim:'enc_pilgrim',
    desc:'탈영병이 굶주림에 순례자의 식량을 강탈하려 위협한다.' },
  { id:'wp_bandit_courier', aggressor:'enc_bandit', victim:'enc_courier',
    desc:'산적이 급히 달리는 전령을 가로막고 서신을 빼앗으려 한다.' },
  { id:'wp_slaver_wanderer', aggressor:'enc_slaver', victim:'enc_wanderer',
    desc:'노예 상인 일행이 혼자 다니는 떠돌이 모험가를 노예로 팔아넘기려 포박하려 한다.' },
  { id:'wp_graverobber_scout', aggressor:'enc_grave_robber', victim:'enc_scout',
    desc:'무덤 도굴꾼이 자신을 발견한 정찰병의 입을 막으려 덤벼들고 있다.' },
  { id:'wp_noble_bandit', aggressor:'enc_bandit', victim:'enc_noble_caravan',
    desc:'산적 무리가 귀족의 행렬을 매복 습격해 호위들과 교전 중이다.' },
];
window.SOUL_WITNESS_PAIRS = SOUL_WITNESS_PAIRS;

const SOUL_WITNESS_BASE = 0.04; // 기본 4% — 인간형 1:1 인카운터(5%)보다 약간 드물게
const SOUL_WITNESS_ACTIVE_BONUS = 0.10; // 매복/수색 시 +10%p

function getEncounterDefById(encId){
  return SOUL_HUMAN_ENCOUNTER_POOL.find(e=>e.id===encId);
}
window.getEncounterDefById = getEncounterDefById;

function tryWitnessEncounter(isActiveAttempt){
  try{
    if(S?._inCombat) return false;
    const isInCombat = (typeof loadMonsters==='function') && (loadMonsters()||[]).some(m=>m.status==='alive');
    if(isInCombat) return false;
    if(S?._pendingHumanEncounter || S?._pendingWitnessEncounter) return false; // 이미 다른 조우가 대기 중이면 중복 방지

    let chance = SOUL_WITNESS_BASE;
    if(isActiveAttempt) chance += SOUL_WITNESS_ACTIVE_BONUS;
    const _mult = (typeof getCurrentEncounterMult==='function') ? getCurrentEncounterMult() : 1.0;
    if(_mult <= 0) return false;
    chance *= _mult;
    if(Math.random() > chance) return false;

    const pair = SOUL_WITNESS_PAIRS[Math.floor(Math.random()*SOUL_WITNESS_PAIRS.length)];
    const aggDef = getEncounterDefById(pair.aggressor);
    const vicDef = getEncounterDefById(pair.victim);
    if(!aggDef || !vicDef) return false;

    const aggLv = getEncounterLevel(aggDef);
    const vicLv = getEncounterLevel(vicDef);
    const witnessId = 'witness_' + Date.now();
    S._pendingWitnessEncounter = { pairId:pair.id, witnessId, aggressor:{...aggDef, level:aggLv}, victim:{...vicDef, level:vicLv}, resolved:false };

    toast(`👁️ 멀지 않은 곳에서 ${aggDef.name}과(와) ${vicDef.name} 사이의 충돌을 목격했다.`, 4000);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[👁️ 목격 — 제3자 충돌] ${isActiveAttempt?'매복/수색 중':'길을 가다'} ${pair.desc} 플레이어는 아직 이 장면에 끼어들지 않은 관찰자다. 플레이어가 선택할 수 있는 방향(강요하지 말고 자연스럽게):`
      + `\n• 개입해서 ${vicDef.name}(약자, Lv.${vicLv} 상당)을 돕는다 — ${aggDef.name}(Lv.${aggLv} 상당)과의 전투로 이어진다. 돕고 승리하면 <gs>{"witness_outcome":{"witnessId":"${witnessId}","result":"helped_victim"}}</gs>를 출력하라.`
      + `\n• 개입해서 오히려 ${aggDef.name}에 가담하거나 어부지리를 노린다 — <gs>{"witness_outcome":{"witnessId":"${witnessId}","result":"joined_aggressor"}}</gs>를 출력하라.`
      + `\n• 숨어서 끝까지 지켜본다 — 결과는 시스템이 무작위로 판정한다(개입 없음). 지켜본 뒤 살아남은 쪽에게 다가가 말을 걸거나 정보를 캐낼 수 있다.`
      + `\n• 그냥 지나간다 — 이 장면은 아무 영향 없이 흘러간다.`
      + `\n어느 쪽을 택하든 자연스럽게 받아들이고, 개입하지 않고 지켜보기를 택하면 <gs>{"witness_outcome":{"witnessId":"${witnessId}","result":"observed"}}</gs>를 출력하라.`;
    return true;
  }catch(e){ return false; }
}
window.tryWitnessEncounter = tryWitnessEncounter;

// [버그 수정] 이 자리에 있던 hookWitnessEncounterToSendMsg도 같은 원인
// (window.checkRandomEncounter 감싸기가 bare 호출에 절대 도달 못 함)으로
// 죽어있었다. 같은 로직을 quest/086의 실제 호출 지점에 네이티브로 옮겼다.

// ── 목격 결과 처리 — 개입 결과에 따라 생존자가 정해지고, 그 생존자가
// 이후 정보 추출(soul_info_extract) 대상이 될 수 있다. 돕거나 지켜본
// 결과로 생존한 NPC는 신뢰도가 보정된다 — 도와준 쪽은 더 솔직해지고
// (가짜 정보 확률 감소), 어부지리를 노린 쪽에게서 캐내면 더 의심받는다
// (가짜 정보 확률 증가).
function handleWitnessOutcomeGS(payload){
  try{
    if(!payload || !payload.witnessId) return;
    const pending = S?._pendingWitnessEncounter;
    if(!pending || pending.witnessId !== payload.witnessId) return; // 불일치 시 무시(오작동 방지)
    if(pending.resolved) return;
    pending.resolved = true;

    const { aggressor, victim } = pending;
    let survivor = null, survivorRole = null, trustMod = 0;

    if(payload.result === 'helped_victim'){
      survivor = victim; survivorRole = 'victim'; trustMod = +0.15; // 도와줬으니 더 솔직해짐
      toast(`🤝 ${victim.name}을(를) 도왔다 — 위기를 함께 넘긴 사이가 됐다.`, 3500);
    } else if(payload.result === 'joined_aggressor'){
      survivor = aggressor; survivorRole = 'aggressor'; trustMod = -0.1; // 가담했으니 신뢰 낮음(거래 관계일 뿐)
      toast(`💰 ${aggressor.name}에 가담했다 — 떳떳하지 못한 동맹이다.`, 3500);
    } else if(payload.result === 'observed'){
      // 개입 없이 지켜봄 — 시스템이 무작위로 승자를 판정(레벨 차이를 약하게 반영)
      const aggPower = aggressor.level + Math.random()*15;
      const vicPower = victim.level + Math.random()*15;
      if(aggPower >= vicPower){
        survivor = aggressor; survivorRole = 'aggressor'; trustMod = 0;
        toast(`👁️ 지켜본 결과 — ${aggressor.name}이(가) 이겼다.`, 3200);
      } else {
        survivor = victim; survivorRole = 'victim'; trustMod = +0.05; // 위기를 넘긴 직후라 약간 더 솔직함
        toast(`👁️ 지켜본 결과 — ${victim.name}이(가) 위기를 넘겼다.`, 3200);
      }
      S._nextInjectedContext = (S._nextInjectedContext||'')
        + `\n[👁️ 목격 결과] ${survivor.name}이(가) 이 충돌에서 살아남았다(개입 없이 지켜봄). 플레이어가 원하면 이제 다가가 말을 걸거나 정보를 캐낼 수 있다.`;
    }

    if(survivor){
      // 이후 soul_info_extract에서 이 NPC를 대상으로 할 때 보정된 신뢰도를
      // 사용하도록 S._pendingHumanEncounter에 등록(기존 1:1 인카운터
      // 처리 경로를 그대로 재사용 — 별도 분기를 늘리지 않는다).
      S._pendingHumanEncounter = {
        ...survivor,
        name: survivor.name,
        knowledge: Math.max(0.1, Math.min(0.95, (survivor.knowledge||0.5) + trustMod)),
        encId: 'witness_survivor_' + Date.now(),
        fromWitness: true, witnessRole: survivorRole,
      };
    }
    S._pendingWitnessEncounter = null;
  }catch(e){}
}
window.handleWitnessOutcomeGS = handleWitnessOutcomeGS;

(function hookWitnessOutcomeGS(){
  setTimeout(()=>{
    const orig = window.processGSToAllDBs;
    if(typeof orig==='function' && !orig._witnessGSHooked){
      window.processGSToAllDBs = function(gs){
        const result = orig.apply(this, arguments);
        try{
          if(gs.witness_outcome) handleWitnessOutcomeGS(gs.witness_outcome);
        }catch(e){}
        return result;
      };
      window.processGSToAllDBs._witnessGSHooked = true;
    }
  }, 2290);
})();

console.log('[16-D]목격형 인카운터(v12:NPC간 충돌 12쌍, 개입/방관/가담 분기, 생존자 정보추출 연동)');
// ══════════════════════════════════════════════════════════════
//  [16-E] 탑승물 확장 — 비행/마법 이동 + 공중 전용 위험 (v13)
//  [설계] speedMult가 정의만 있고 실제로 쓰이지 않던 죽은 데이터였다.
//  이제 실제 시간 소모(detectActionTimeCost 후킹)와 인카운터 확률
//  (getCurrentEncounterMult)에 모두 반영된다. 비행 탑승물(그리핀/
//  페가수스/와이번)은 지상 인카운터를 완전히 차단하는 대신, 하늘에서
//  만날 수 있는 별도의 공중 전용 위험(다른 비행 몬스터, 폭풍, 공중
//  도적)으로 대체한다. 마법진 텔레포트는 거리 무관 즉시 이동이지만
//  막대한 골드 비용과 재사용 쿨다운(30턴)이 있다.
// ══════════════════════════════════════════════════════════════

// ── 특수 탑승물 소유 — 인벤토리에 해당 "탑승 계약/조련 증표" 아이템을
// 가지고 있으면 그 탑승물을 쓸 수 있다. 소모되지 않는 영구 자산이다.
const SPECIAL_MOUNT_ITEM_NAMES = {
  griffin: ['그리핀 조련 증표', '그리핀의 깃털 인장'],
  pegasus: ['페가수스 굴레', '천마의 인장'],
  wyvern:  ['와이번 조련 증표', '비룡의 비늘 인장'],
  teleport:['대마법사의 마법진 인장', '순간이동 주문서'],
};
function getOwnedSpecialMounts(){
  try{
    const inv = (typeof loadInventory==='function') ? loadInventory() : (S?.inventory||[]);
    const owned = [];
    Object.entries(SPECIAL_MOUNT_ITEM_NAMES).forEach(([type, names])=>{
      if(inv.some(it=>names.includes(it.name))) owned.push(type);
    });
    return owned;
  }catch(e){ return []; }
}
window.getOwnedSpecialMounts = getOwnedSpecialMounts;

// ── 텔레포트 웨이포인트 네트워크 ────────────────────────────
// [21-7 재설계, "기워붙인 곳" 6/6] 예전엔 아이템+쿨다운(30턴)만
// 채우면 대륙 어디든 무료로 순간이동했다 — 운임 체계가 전혀 없어
// "유료"라는 설정 텍스트와 실제 동작이 따로 놀았다. 직접 방문해서
// 등록한 정착지(마을/도시/수도/항구/영지)끼리만, 그것도 현재 위치
// 자체가 등록된 웨이포인트일 때만, 거리에 비례한 골드를 내고 이동
// 하는 진짜 웨이포인트 네트워크로 교체한다.
const WAYPOINT_ELIGIBLE_TYPES = ['hamlet','village','town','city','major','capital','port'];
const TELEPORT_WAYPOINTS_KEY = 'tf-teleport-waypoints';

function loadTeleportWaypoints(){
  try{ return JSON.parse(lsGet(TELEPORT_WAYPOINTS_KEY)||'[]'); }catch(e){ return []; }
}
window.loadTeleportWaypoints = loadTeleportWaypoints;

function saveTeleportWaypoints(list){
  try{ lsSet(TELEPORT_WAYPOINTS_KEY, JSON.stringify(list||[])); }catch(e){}
}
window.saveTeleportWaypoints = saveTeleportWaypoints;

// saveCurrentLocation(world/052)이 모든 위치 저장 경로를 공통으로
// 지나므로(대륙 방문 도전과제와 같은 패턴), 그 함수에서 이걸 호출해
// 이동/AI 텍스트 감지/체포 등 어느 경로로 도착하든 빠짐없이 등록되게 한다.
function registerTeleportWaypoint(loc){
  try{
    if(!loc || !loc.id) return;
    if(!(WAYPOINT_ELIGIBLE_TYPES.includes(loc.type) || loc.isDemesne)) return;
    const list = loadTeleportWaypoints();
    if(list.some(w=>w.id===loc.id)) return;
    list.push({ id:loc.id, name:loc.name, icon:loc.icon, continent:loc.continent });
    saveTeleportWaypoints(list);
    if(typeof toast==='function') toast(`🌀 웨이포인트 등록: ${loc.name}`, 2600);
  }catch(e){}
}
window.registerTeleportWaypoint = registerTeleportWaypoint;

function isRegisteredWaypoint(locId){
  try{ return loadTeleportWaypoints().some(w=>w.id===locId); }catch(e){ return false; }
}
window.isRegisteredWaypoint = isRegisteredWaypoint;

// 운임 — 같은 대륙 기준가, 다른 대륙이면 배율(배·대형선의 거리 배율과
// 같은 원리). 등록된 웨이포인트끼리만 쓰는 네트워크라 자유 순간이동보다
// 저렴하게 잡아도 남용 위험이 적다.
function getWaypointTeleportCost(fromLoc, toLoc){
  try{
    const base = 40;
    const sameContinent = fromLoc?.continent === toLoc?.continent;
    return Math.round(base * (sameContinent ? 1.0 : 2.5));
  }catch(e){ return 40; }
}
window.getWaypointTeleportCost = getWaypointTeleportCost;

// ── 공중 전용 위험 — 그리핀/페가수스/와이번으로 이동할 때만 발동.
// 지상 몬스터/인간형/목격형 인카운터는 비행 중엔 전혀 안 일어나고,
// 대신 이 풀에서만 발동한다. 와이번(isDangerousMount)은 자체적으로
// 위험 확률이 더 높다 — "다루기 위험하다"는 설정을 반영.
const AIR_ENCOUNTER_POOL = [
  { id:'air_wyvern_wild', icon:'🐉', name:'야생 와이번', desc:'야생 와이번 한 마리가 영역을 침범한 당신의 탑승물에 적대적으로 접근한다.' },
  { id:'air_griffin_rival', icon:'🦅', name:'경쟁 그리핀', desc:'다른 그리핀 조련사가 하늘에서 시비를 건다 — 공중 추격전이 벌어질 수 있다.' },
  { id:'air_storm', icon:'⛈️', name:'돌풍', desc:'갑작스러운 돌풍과 번개가 탑승물을 흔든다 — 조종이 불안정해진다.' },
  { id:'air_sky_pirate', icon:'🏴', name:'공중 해적', desc:'와이번을 탄 공중 해적단이 통행료를 요구하며 접근한다.' },
  { id:'air_roc', icon:'🦅', name:'거대 로크 새', desc:'전설적인 크기의 로크 새가 탑승물을 먹이로 오인해 달려든다.' },
];
const AIR_ENCOUNTER_BASE = 0.06;
const AIR_ENCOUNTER_DANGEROUS_BONUS = 0.05; // 와이번 탑승 시 추가 위험

function tryAirEncounter(transportType){
  try{
    const t = TRANSPORT_CONFIG[transportType];
    if(!t || !t.isAir) return false;
    if(S?._inCombat) return false;

    let chance = AIR_ENCOUNTER_BASE;
    if(t.isDangerousMount) chance += AIR_ENCOUNTER_DANGEROUS_BONUS;
    if(Math.random() > chance) return false;

    const pick = AIR_ENCOUNTER_POOL[Math.floor(Math.random()*AIR_ENCOUNTER_POOL.length)];
    toast(`비행 중 ${pick.name}과(와) 마주쳤다!`, 3500, pick);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[${pick.icon} 공중 조우] ${t.icon} ${t.name}을 타고 비행하는 중 ${pick.desc} 지상이 아닌 하늘 위라는 점을 살려 긴박하고 입체적으로 묘사하라 — 추락 위험, 탑승물과의 협동, 고도 차이를 이용한 전술 등을 활용할 수 있다.`;
    return true;
  }catch(e){ return false; }
}
window.tryAirEncounter = tryAirEncounter;

// ── BLS 가이드 — AI에게 특수 탑승물 입수 방법과 텔레포트 비용을 안내.
// 플레이어가 아직 못 가진 탑승물도 "어떻게 얻을 수 있는지" AI가
// 알아야 퀘스트/보상으로 자연스럽게 제시할 수 있다.
function getMountAcquisitionBLS(){
  try{
    const owned = getOwnedSpecialMounts();
    const lines = [];
    if(!owned.includes('griffin')) lines.push('그리핀: 그리핀 둥지를 찾아 알을 얻거나 조련사에게 인정받으면 "그리핀 조련 증표"를 얻을 수 있다.');
    if(!owned.includes('pegasus')) lines.push('페가수스: 신성한 의식이나 순수한 마음을 증명하는 시험을 통과하면 "페가수스 굴레"를 얻을 수 있다.');
    if(!owned.includes('wyvern')) lines.push('와이번: 야생 와이번을 제압하거나 비룡 조련사의 시험을 통과하면 "와이번 조련 증표"를 얻을 수 있다.');
    if(!owned.includes('teleport')) lines.push('마법진 이동: 대마법사에게 사사하거나 고대 마법진의 비밀을 풀면 "대마법사의 마법진 인장"을 얻을 수 있다.');
    if(!lines.length) return '';
    return `\n[🐎 특수 탑승물 — 아직 보유하지 않음] 플레이어가 보유하지 않은 탑승물은 다음과 같이 얻을 수 있다(강요하지 말고 적절한 보상/퀘스트 기회에 자연스럽게 활용): ${lines.join(' ')} 실제로 획득하는 서사가 일어나면 <gs>{"items":[{"name":"정확한 아이템명","icon":"적절한 아이콘","rarity":"legendary","type":"misc","desc":"탑승 계약 증표"}]}</gs>로 지급하라.`;
  }catch(e){ return ''; }
}
window.getMountAcquisitionBLS = getMountAcquisitionBLS;

(function hookMountAcquisitionToBLS(){
  setTimeout(()=>{
    const fn = typeof window.buildLightSystem==='function'?'buildLightSystem'
             : typeof window.buildSystemPrompt==='function'?'buildSystemPrompt'
             : typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn) return;
    const orig = window[fn];
    if(typeof orig==='function' && !orig._mountAcqBLSHooked){
      window[fn] = function(){
        const r = orig.apply(this, arguments);
        try{ const b=getMountAcquisitionBLS(); return b&&typeof r==='string'?r+b:r; }catch(e){ return r; }
      };
      window[fn]._mountAcqBLSHooked = true;
    }
  }, 4800);
})();

console.log('[16-E]탑승물 확장(v13:speedMult실제연동,인카운터배율4종+비행3종+텔레포트,공중전용위험5종)');

// ══════════════════════════════════════════════════════════════
//  [16-F] 탑승물 임대료 시스템 (v14) — 말 등급 4종 + 선박은 매번 대여
//  [설계] 그리핀/페가수스/와이번처럼 영구 소유하는 특수 탑승물과 달리,
//  말과 선박은 매번 그 자리에서 돈을 내고 빌려 타는 방식이다. 말은
//  등급(짐말~명마)에 따라, 선박은 목적지가 같은 대륙인지 다른 대륙인지
//  (거리)에 따라 가격이 달라진다. 단, 인벤토리에 "내 말" 같은 개인
//  소유 증표가 있으면 그 등급의 말은 무료로 탈 수 있다(구매 후 영구
//  소유 옵션 — 동결된 자산이 아니라 실제로 산 말이라는 의미).
// ══════════════════════════════════════════════════════════════

const TRANSPORT_RENTAL_BASE = {
  horse_draft: 10,   horse: 25,   horse_war: 55,   horse_noble: 110,
  carriage: 15,
  boat: 18, ship: 60, // 기본가 — 실제로는 거리 배율이 곱해짐
};
window.TRANSPORT_RENTAL_BASE = TRANSPORT_RENTAL_BASE;

// 개인 소유 말 증표 — 말 등급별로 별도 구매 가능(상점에서 "내 말 — 군마"
// 같은 형태로 판매한다고 가정. 인벤토리에 있으면 그 등급은 평생 무료).
const PERSONAL_MOUNT_ITEM_NAMES = {
  horse_draft: ['나의 짐말'],
  horse:       ['나의 준마'],
  horse_war:   ['나의 군마'],
  horse_noble: ['나의 명마'],
};
function ownsPersonalMount(transportType){
  try{
    const names = PERSONAL_MOUNT_ITEM_NAMES[transportType];
    if(!names) return false; // 마차/선박/비행 등은 개인 소유 개념 없음(매번 대여 또는 별도 증표 체계)
    const inv = (typeof loadInventory==='function') ? loadInventory() : (S?.inventory||[]);
    return inv.some(it=>names.includes(it.name));
  }catch(e){ return false; }
}
window.ownsPersonalMount = ownsPersonalMount;

// 임대료 계산 — 말은 고정가, 선박은 거리(같은 대륙=1배, 다른 대륙=2.2배,
// requiresSeaAccess 대형선은 추가로 1.5배)에 따라 가산된다.
function getTransportRentalCost(transportType, fromLoc, toLoc){
  try{
    const base = TRANSPORT_RENTAL_BASE[transportType];
    if(base === undefined) return 0; // 비행/마법/도보는 별도 체계(소유 또는 쿨다운)
    if(transportType === 'boat' || transportType === 'ship'){
      const sameContinent = fromLoc?.continent === toLoc?.continent;
      let mult = sameContinent ? 1.0 : 2.2;
      if(transportType === 'ship') mult *= 1.5;
      return Math.round(base * mult);
    }
    return base;
  }catch(e){ return 0; }
}
window.getTransportRentalCost = getTransportRentalCost;

// BLS 가이드 — 개인 소유 말 구매 옵션을 AI에게 안내(상점 등에서 자연스럽게 제안 가능)
function getMountPurchaseBLS(){
  try{
    const lines = [];
    Object.entries(PERSONAL_MOUNT_ITEM_NAMES).forEach(([type, names])=>{
      if(!ownsPersonalMount(type)){
        const cfg = TRANSPORT_CONFIG[type];
        const price = (TRANSPORT_RENTAL_BASE[type]||20) * 35; // 매번 빌리는 것보다 약 35회분 비용으로 영구 구매
        lines.push(`${cfg?.name||type}(${names[0]}, 약 ${price}G) — 구매하면 이후 ${cfg?.name||type}을 영구적으로 무료 이용 가능.`);
      }
    });
    if(!lines.length) return '';
    return `\n[🐴 개인 소유 말 구매 옵션] 마구간이나 상점에서 다음을 판매할 수 있다(강요하지 말고 적절한 상황에서만 제안): ${lines.join(' ')} 구매 시 <gs>{"items":[{"name":"정확한 아이템명","icon":"🐴","rarity":"rare","type":"misc","desc":"개인 소유 탑승 증표"}]}</gs>로 지급하고 골드를 차감하라.`;
  }catch(e){ return ''; }
}
window.getMountPurchaseBLS = getMountPurchaseBLS;

(function hookMountPurchaseToBLS(){
  setTimeout(()=>{
    const fn = typeof window.buildLightSystem==='function'?'buildLightSystem'
             : typeof window.buildSystemPrompt==='function'?'buildSystemPrompt'
             : typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn) return;
    const orig = window[fn];
    if(typeof orig==='function' && !orig._mountPurchaseBLSHooked){
      window[fn] = function(){
        const r = orig.apply(this, arguments);
        try{ const b=getMountPurchaseBLS(); return b&&typeof r==='string'?r+b:r; }catch(e){ return r; }
      };
      window[fn]._mountPurchaseBLSHooked = true;
    }
  }, 4810);
})();

console.log('[16-F]탑승물 임대료(v14:말4등급고정가,선박거리배율,개인소유말구매옵션)');



window.SOUL_ACQUISITION_API = { loadSoulRumorState, loadSoulDungeonState, tryHearSoulRumor, tickContinentActivity,
  handleSoulQuestStart, handleSoulQuestComplete, handleSoulDungeonClear, getSoulAcquisitionBLS,
  tryHumanEncounter, loadSoulFragments, handleSoulInfoExtractGS,
  tryWitnessEncounter, handleWitnessOutcomeGS, getEncounterDefById };

})();
