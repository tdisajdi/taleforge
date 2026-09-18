// 📋 게시판 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { startAIDungeonExplore } from '../combat/257-renderMiniMap-던전-미니맵-일반-미니맵.js';
import { BULLETIN_INFO_POOL, BULLETIN_QUEST_POOL, BULLETIN_SIZE_CONFIG, LOC_NPC_POOL, SCENARIO_NPC_EXTRA } from '../data/053-게시판-시스템.js';
import { MATERIALS } from '../data/075-파트2-C-크래프팅-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { calcTameSuccessChance, loadHunterTameLog, loadHunterTrophies, saveHunterTameLog, saveHunterTrophies } from '../economy/255-상인-거래소-교역-지부-확장.js';
import { getOrCreateEnemyMaterials, rollDynamicScavenge, rollEventReward, saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { saveSkillSP } from '../job/002-스킬-시스템.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { getStatInfo } from '../job/010-스킬-강화-시스템.js';
import { loadFactionNewsQueue, renderFactionNewsBulletin } from '../npc/067-③-NPC-관계망-시스템.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { closeP, grantTitle, huntBountyTarget, loadJailState, refreshBountyBoard, returnFromJail, saveJailState, showQuestAcceptPopup, updateQuestBadge } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { maybeGenerateQuestLocation } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { _onArriveAtDemesne, _onDepartDemesne } from '../race/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js';
import { applyStatusEffect, saveStatusEffects } from '../ui/155-⑭-메모리-패널-UI.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation, renderLocationPanel, saveCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { enqueueAITask } from '../world/085-대륙-스타팅-시스템.js';
import { loadBulletin, loadNPCs, loadQuests, saveBulletin, saveNPCs, saveQuests, saveSession } from './001-block0-preamble.js';
import { getPlayerMaxHp, getPlayerMaxMp, loadLocations, loadParty, openTransportPanel, saveLocations, saveParty, updateReputation } from './054-이동수단-시스템.js';
import { loadMaterials, saveMaterials } from './075-파트2-C-크래프팅-시스템.js';

export function generateBulletinData(loc) {
  const cfg = BULLETIN_SIZE_CONFIG[loc.type] || BULLETIN_SIZE_CONFIG.village;
  const locId = loc.id || loc.name;
  const seed = locId + '_' + Math.floor(Date.now() / (1000 * 60 * 60 * 6)); // 6시간마다 갱신

  // 시드 기반 난수 (간단한 해시)
  function seededRand(str, idx) {
    let h = 0;
    for(let i=0;i<str.length;i++) h = (Math.imul(31,h)+str.charCodeAt(i))|0;
    h = (Math.imul(h, idx+1) ^ (h>>>16)) >>> 0;
    return (h % 10000) / 10000;
  }

  // 의뢰 수 랜덤
  const questCount = cfg.minQuests + Math.floor(seededRand(seed,0) * (cfg.maxQuests - cfg.minQuests + 1));
  // 정보 수 랜덤
  const infoCount  = cfg.minInfo  + Math.floor(seededRand(seed,1) * (cfg.maxInfo  - cfg.minInfo  + 1));

  // 이 장소 타입에 맞는 의뢰 필터
  const eligibleQuests = BULLETIN_QUEST_POOL.filter(q => q.tags.includes(loc.type));
  const pickedQuests = [];
  const usedQ = new Set();
  for(let i=0; i<questCount && i<eligibleQuests.length; i++){
    let idx = Math.floor(seededRand(seed, 100+i) * eligibleQuests.length);
    let tries = 0;
    while(usedQ.has(idx) && tries<30){ idx=(idx+1)%eligibleQuests.length; tries++; }
    usedQ.add(idx);
    const q = eligibleQuests[idx];
    const rewardGold = q.rewardMin + Math.floor(seededRand(seed, 200+i) * (q.rewardMax - q.rewardMin));
    pickedQuests.push({ ...q, rewardGold, uid: locId+'_q_'+i });
  }

  // 정보글: 장소 규모에 따라 희귀 정보 확률 다름
  const specialChance = loc.type==='capital'?0.55: loc.type==='city'?0.35: loc.type==='town'?0.22: loc.type==='village'?0.12: 0.05;
  const usefulChance  = loc.type==='capital'?0.40: loc.type==='city'?0.45: loc.type==='town'?0.40: loc.type==='village'?0.35: 0.25;
  const pickedInfos = [];
  const usedInfo = new Set();
  for(let i=0; i<infoCount; i++){
    let pool;
    const r = seededRand(seed, 300+i);
    if(r < specialChance) pool = BULLETIN_INFO_POOL.filter(x=>x.tier==='special');
    else if(r < specialChance + usefulChance) pool = BULLETIN_INFO_POOL.filter(x=>x.tier==='useful');
    else pool = BULLETIN_INFO_POOL.filter(x=>x.tier==='junk');
    if(!pool.length) pool = BULLETIN_INFO_POOL;
    let idx = Math.floor(seededRand(seed, 400+i) * pool.length);
    let tries = 0;
    while(usedInfo.has(pool[idx]?.title) && tries<20){ idx=(idx+1)%pool.length; tries++; }
    usedInfo.add(pool[idx].title);
    pickedInfos.push({ ...pool[idx], uid: locId+'_info_'+i });
  }

  return { quests: pickedQuests, infos: pickedInfos, generatedAt: Date.now() };
}
window.generateBulletinData = generateBulletinData;

export const ACCEPTED_BULLETIN_KEY = 'taleforge-bulletin-accepted';

export const loadAcceptedBulletin = () => { try{ return JSON.parse(lsGet(ACCEPTED_BULLETIN_KEY)||'[]'); }catch(e){ return []; } };

export const saveAcceptedBulletin = (d) => { try{ lsSet(ACCEPTED_BULLETIN_KEY, JSON.stringify(d)); }catch(e){} };

export function manualCompleteBulletin(uid, title, rewardGold, icon, tier){
  // [A-4 FIX] 수락하지 않은 의뢰는 완료 처리 불가
  const accepted = loadAcceptedBulletin();
  const acc = accepted.find(a=>a.uid===uid);
  if(!acc){
    toast('⚠️ 수락하지 않은 의뢰입니다. 먼저 의뢰를 수락하세요.', 2000);
    return;
  }
  if(acc.completed){
    toast('이미 완료된 의뢰입니다', 1500);
    return;
  }

  const quests = loadQuests();
  const q = quests.find(x=>x.id==='bulletin_'+uid);
  if(q){
    if(q.status==='completed'){ toast('이미 완료된 의뢰입니다', 1500); return; }
    q.status='completed'; q.completedAt=new Date().toISOString(); q._rewardGiven=true;
    saveQuests(quests);
  }
  // 수락 목록에서 완료 표시
  acc.completed=true; acc.completedAt=Date.now(); saveAcceptedBulletin(accepted);

  // [F-2 FIX] 템플릿 리터럴 이스케이프 오류 수정 (\${} → ${})
  if(rewardGold>0){
    S.gold=(S.gold||0)+rewardGold; saveGold(S.gold); window.updateHeader();
    toast(`💰 의뢰 완료: 골드 +${rewardGold}`, 3000);
  }
  const expGain = Math.floor(rewardGold*0.5)||30;
  if(typeof window.updateStats==='function') window.updateStats('totalExp', expGain);
  if(typeof updateReputation==='function') updateReputation(10);
  if(tier && ['rare','legendary'].includes(tier)){
    if(typeof rollEventReward==='function'){
      const item=rollEventReward('bulletin');
      if(item){ S.inventory.push(item); saveInventory(S.inventory); toastHTML(`🎁 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon||"")} ${esc(item.name)} 획득!`, 2500); }
    }
  }
  toast(`🏆 게시판 의뢰 완료: ${icon||'📋'} ${title}`, 3500);
  if(typeof unlockAchievement==='function') unlockAchievement('first_quest');
  if(typeof updateQuestBadge==='function') updateQuestBadge();
  if(S._nextInjectedContext!==undefined) S._nextInjectedContext=(S._nextInjectedContext||'')+` [게시판 의뢰 완료: ${title}, 보상 ${rewardGold}G 수령]`;
  renderLocationPanel();
}
window.manualCompleteBulletin = manualCompleteBulletin;

window.manualCompleteBulletin = manualCompleteBulletin;

export const LOC_NPC_ASSIGN_KEY = 'tf-loc-npc-assign';

export function loadLocNpcAssign(){ try{ return JSON.parse(lsGet(LOC_NPC_ASSIGN_KEY)||'{}'); }catch(e){ return {}; } }
window.loadLocNpcAssign = loadLocNpcAssign;

export function saveLocNpcAssign(d){ try{ lsSet(LOC_NPC_ASSIGN_KEY, JSON.stringify(d)); }catch(e){} }
window.saveLocNpcAssign = saveLocNpcAssign;

export function getOrAssignLocNpcs(loc){
  const assign = loadLocNpcAssign();
  const locKey = loc.id || loc.name;
  if(assign[locKey]) return assign[locKey]; // 이미 배치됨

  const locType = loc.type || 'special';
  const scenarioId = S.scenario?.id || 'medieval';
  const basePool = LOC_NPC_POOL[locType] || LOC_NPC_POOL.special;

  // 장소 규모별 NPC 수
  const countMap = { capital:4, city:3, town:3, village:2, hamlet:2, dungeon:2, shrine:2, event:2, special:2, port:3, wilderness:2 };
  const count = countMap[locType] || 2;

  // 기본 풀에서 랜덤 선택 (시드: 장소 이름 기반)
  const seed = locKey.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const shuffled = [...basePool].sort((a,b)=>{
    const ha = (seed * a.id.length * 31) % 97;
    const hb = (seed * b.id.length * 31) % 97;
    return ha - hb;
  });
  let chosen = shuffled.slice(0, Math.min(count, shuffled.length));

  // 시나리오 추가 NPC
  const extraPool = SCENARIO_NPC_EXTRA[scenarioId] || [];
  const extraForLoc = extraPool.filter(n => (n.locTypes||[]).includes(locType));
  if(extraForLoc.length > 0){
    const extraPick = extraForLoc[(seed * 7) % extraForLoc.length];
    if(!chosen.find(c=>c.id===extraPick.id)) chosen.push(extraPick);
  }

  const result = chosen.map(n => ({ ...n, locKey, relationship: 50, isResident: true }));
  assign[locKey] = result;
  saveLocNpcAssign(assign);
  return result;
}
window.getOrAssignLocNpcs = getOrAssignLocNpcs;

export function getPlayerNpcsAtLoc(loc){
  const allNpcs = loadNPCs() || [];
  const locKey = loc.id || loc.name;
  // 이전에 이 장소에서 만났거나, 이 장소에 배치된 NPC
  return allNpcs.filter(n => n.metAtLoc === locKey || n.currentLoc === locKey);
}
window.getPlayerNpcsAtLoc = getPlayerNpcsAtLoc;

export function renderLocationNpcs(loc){
  const residentNpcs = getOrAssignLocNpcs(loc);
  const playerNpcs = getPlayerNpcsAtLoc(loc);
  const knownNpcs = loadNPCs() || [];

  let html = '';

  // ── 이 장소 상주 NPC ──
  html += `<div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:8px">◆ 이 장소의 상주 인물</div>`;

  residentNpcs.forEach(npc => {
    const known = knownNpcs.find(n => n.name === npc.name);
    const rel = known?.relationship || 50;
    const relColor = rel>=70?'#60a060':rel<30?'#e05a5a':'var(--dim)';
    const relLabel = rel>=70?'우호':'친밀도 '+rel;
    html += `
    <div style="padding:10px 12px;background:#0d0800;border:1px solid ${known?'#3a5a2a':'var(--border)'};margin-bottom:7px">
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:6px">
        <span style="font-size:22px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(npc,{size:22}):(npc.icon)}</span>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Cinzel',serif;font-size:11px;color:var(--gold)">${esc(npc.name)}</div>
          <div style="font-size:9px;color:var(--dim);margin-top:1px">${esc(npc.role)}</div>
          <div style="font-size:9px;color:#4a6a4a;margin-top:1px;font-style:italic">${esc(npc.hint)}</div>
        </div>
        ${known?`<div style="font-size:9px;color:${relColor};flex-shrink:0">${relLabel}</div>`:`<div style="font-size:9px;color:var(--dim);flex-shrink:0">미조우</div>`}
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <button class="btn btn-gold" style="padding:4px 10px;font-size:8px" onclick="startConversationWithResident('${esc(npc.name)}','${esc(npc.role)}','${esc(npc.personality)}','${esc((loc.id||loc.name))}')">💬 대화하기</button>
        ${known && rel>=40 ? `<button class="btn btn-dark" style="padding:4px 8px;font-size:8px;border-color:#3a6a2a;color:#80c040" onclick="openNpcQuestDialog('${esc(npc.name)}')">📜 의뢰</button>` : ''}
        ${known && rel>=50 ? `<button class="btn btn-dark" style="padding:4px 8px;font-size:8px" onclick="giftNpc('${esc(npc.name)}')">🎁 선물</button>` : ''}
      </div>
    </div>`;
  });

  // ── 이 장소에서 만난 플레이어 NPC ──
  if(playerNpcs.length > 0){
    html += `<div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin:12px 0 8px">◆ 이 장소에서 만난 인물</div>`;
    playerNpcs.forEach(npc => {
      const rel = npc.relationship || 50;
      const relColor = rel>=70?'#60a060':rel<30?'#e05a5a':'var(--dim)';
      html += `
      <div style="padding:10px 12px;background:#0a1505;border:1px solid #2a4a2a;margin-bottom:7px">
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:6px">
          <span style="font-size:22px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(npc,{size:22}):(npc.icon||"👤")}</span>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Cinzel',serif;font-size:11px;color:var(--gold)">${esc(npc.name)}</div>
            <div style="font-size:9px;color:var(--dim);margin-top:1px">${esc(npc.role||'')}</div>
          </div>
          <div style="font-size:9px;color:${relColor};flex-shrink:0">${rel}</div>
        </div>
        <div style="display:flex;gap:5px">
          <button class="btn btn-dark" style="padding:4px 8px;font-size:8px" onclick="talkToNpc('${esc(npc.name)}')">💬 대화</button>
          ${rel>=40?`<button class="btn btn-dark" style="padding:4px 8px;font-size:8px;border-color:#3a6a2a;color:#80c040" onclick="openNpcQuestDialog('${esc(npc.name)}')">📜 의뢰</button>`:''}
        </div>
      </div>`;
    });
  }

  if(residentNpcs.length === 0 && playerNpcs.length === 0){
    html = '<div style="color:var(--dim);font-size:11px;padding:14px 0;text-align:center">이 장소에 특별한 인물이 없습니다</div>';
  }

  return html;
}
window.renderLocationNpcs = renderLocationNpcs;

export function startConversationWithResident(npcName, npcRole, npcPersonality, locKey){
  // 기존 NPC 목록에 없으면 추가 (첫 조우)
  const npcs = loadNPCs() || [];
  let npc = npcs.find(n => n.name === npcName);
  if(!npc){
    const assign = loadLocNpcAssign();
    let residentData = null;
    for(const key of Object.keys(assign)){
      const found = assign[key].find(n=>n.name===npcName);
      if(found){ residentData = found; break; }
    }
    npc = {
      name: npcName, role: npcRole, icon: residentData?.icon || '👤',
      personality: npcPersonality, relationship: 50, type: 'minor', active: true,
      metAtLoc: locKey, currentLoc: locKey,
      note: `${npcRole}. ${npcPersonality}`
    };
    npcs.push(npc);
    saveNPCs(npcs);
    if(S.npcs) S.npcs = npcs;
    toast(`👤 ${npcName}을(를) 처음 만났다!`, 2000);
  } else {
    // 현재 장소 업데이트
    npc.currentLoc = locKey;
    saveNPCs(npcs);
  }

  // 채팅 입력창에 대화 행동 채우기
  closeP('location');
  const inp = document.getElementById('msg-inp');
  if(inp){
    inp.value = `${npcName}에게 다가가 말을 건다.`;
    inp.focus();
  }
  toast(`💬 ${npcName}과 대화를 시작한다`, 1800);
}
window.startConversationWithResident = startConversationWithResident;

window.renderLocationNpcs = renderLocationNpcs;

window.startConversationWithResident = startConversationWithResident;

window.getOrAssignLocNpcs = getOrAssignLocNpcs;

export function renderLocationShops(loc){
  if(!loc.shops||!loc.shops.length) return '<div style="color:var(--dim);font-size:11px;padding:10px 0">이 장소에는 상점이 없습니다</div>';
  const modifier = loc.priceModifier||1.0;
  return loc.shops.map(shop=>`
    <div style="margin-bottom:12px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:6px;letter-spacing:1px">${esc(shop.name)}</div>
      ${shop.items.map((item,i)=>{
        const price = Math.round(item.price * modifier);
        const rc = {common:'#8a9a8a',uncommon:'#4a9a6a',rare:'#4a6fa5',legendary:'#c8a96e'}[item.rarity]||'#8a9a8a';
        const canAfford = S.gold >= price;
        return `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#0d0800;border:1px solid ${rc}44;margin-bottom:4px;opacity:${canAfford?1:0.6}">
          <span style="font-size:18px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:18}):(item.icon)}</span>
          <div style="flex:1;min-width:0">
            <div style="font-family:Cinzel,serif;font-size:10px;color:${rc}">${esc(item.name)}</div>
            <div style="font-size:9px;color:var(--dim)">${esc(item.desc)}</div>
            ${item.effects&&Object.keys(item.effects).length?`<div style="font-size:9px;color:#4a6fa5">${Object.entries(item.effects).filter(([k,v])=>v>0).map(([k,v])=>{const info=getStatInfo(k);return (info?.name||k)+'+'+v;}).join(' · ')}</div>`:''}
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-family:Cinzel,serif;font-size:10px;color:#f1c40f">💰${price}</div>
            ${modifier!==1.0?`<div style="font-size:8px;color:${modifier>1?'#e05a5a':'#60a060'}">${modifier>1?'↑비쌈':'↓저렴'}</div>`:''}
            <button class="btn btn-gold" style="padding:3px 7px;font-size:8px;margin-top:3px" onclick="buyLocItem(${JSON.stringify(item).replace(/"/g,'&quot;')},${price})" ${canAfford?'':'disabled'}>구매</button>
          </div>
        </div>`;
      }).join('')}
    </div>`).join('');
}
window.renderLocationShops = renderLocationShops;

export function renderLocationInteractions(loc){
  if(!loc.interactions||!loc.interactions.length) return '<div style="color:var(--dim);font-size:11px;padding:10px 0">이 장소에서 가능한 상호작용이 없습니다</div>';
  return loc.interactions.map(int=>{
    const isTransport = int.action === 'useTransport';
    const btnCall = isTransport
      ? `doInteraction('useTransport',${int.cost||0},'${int.transportType||'walk'}')`
      : `doInteraction('${int.action}',${int.cost||0})`;
    const transportBadge = isTransport
      ? `<span style="font-size:8px;padding:2px 5px;background:#1a2a1a;border:1px solid #3a6a3a;color:#6aca6a;border-radius:2px;margin-left:4px">🚀 이동수단</span>` : '';
    return `
    <div style="padding:10px 11px;background:#0d0800;border:1px solid var(--border);margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="font-size:18px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(int,{size:18}):(int.icon)}</span>
        <div style="flex:1">
          <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold)">${esc(int.name)}${transportBadge}</div>
          <div style="font-size:10px;color:var(--dim)">${esc(int.desc)}</div>
        </div>
        ${int.cost?`<div style="font-size:10px;color:#f1c40f;flex-shrink:0">💰${int.cost}</div>`:''}
      </div>
      <button class="btn btn-gold" style="width:100%;padding:7px;font-size:9px" onclick="${btnCall}">실행</button>
    </div>`;
  }).join('');
}
window.renderLocationInteractions = renderLocationInteractions;

export function buyLocItem(item, price){
  if(S.gold < price){ toast('골드가 부족합니다'); return; }
  S.gold -= price; saveGold(S.gold); window.updateHeader();
  S.inventory.push(item); saveInventory(S.inventory);
  toastHTML(`✅ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon)} ${esc(item.name)} 구매!`); renderLocationPanel();
}
window.buyLocItem = buyLocItem;

export function doInteraction(action, cost=0, transportType='walk'){
  if(cost > 0 && S.gold < cost){ toast('골드가 부족합니다'); return; }
  if(cost > 0){ S.gold -= cost; saveGold(S.gold); window.updateHeader(); }

  const actions = {
    innRest: ()=>{
      // [B-10 FIX] HP/MP를 실제 최대치로 회복
      const maxHp = S.stats.maxHp || 100;
      const maxMp = S.stats.maxMp || 50;
      S.stats.hp = maxHp;
      S.stats.mp = maxMp;
      // 상태이상 일부 해제 (경미한 것)
      try {
        // [BUG FIX] loadStatusEffects/saveStatusEffects가 객체기반(target별) 구조로
        // 동작하는데 배열 메서드를 호출/저장하던 버그. 실제 API(getActiveEffects/
        // tickStatusEffects 등)와 호환되는 객체 구조로 수정.
        if(typeof window.loadStatusEffects==='function' && typeof saveStatusEffects==='function'){
          const state = window.loadStatusEffects();
          if(state['player']) state['player'] = state['player'].filter(e => !['poison','burn','bleed'].includes(e.id));
          saveStatusEffects(state);
        }
      } catch(e2) {}
      window.updateHeader();
      if(typeof saveSession === 'function') saveSession();
      toast('🛏️ 충분히 쉬었다. HP+MP 완전 회복!', 2500);
    },
    pray: ()=>{ S.stats.fath=Math.min(999,(S.stats.fath||50)+10); window.updateHeader(); if(Math.random()<0.6){ applyStatusEffect('blessed'); toast('🙏 기도가 응답받았다. 신앙심+10, 축복!', 2000); } else { toast('🙏 기도를 올렸다. 신앙심+10', 2000); } },
    // [B40 FIX] Object.keys(S.stats)[0~4]는 항상 스탯 객체 생성 순서상 앞쪽
    // 5개(hp/mp/str/agi/end)만 뽑혀 나머지 25개 스탯은 절대 선택되지 않던
    // 버그. 다른 인접 상호작용(altarOffer 등)처럼 명시적 배열로 교체.
    donate: ()=>{ const bonus=Math.floor(Math.random()*20)+10; const keys=['str','agi','end','mgc','int','luk','per','wil','cha']; const key=keys[Math.floor(Math.random()*keys.length)]; S.stats[key]=Math.min(999,(S.stats[key]||50)+bonus); window.updateHeader(); toast(`✨ 봉납의 축복: ${key.toUpperCase()} +${bonus}!`, 3000); },
    farmWork: ()=>{ S.gold+=15; saveGold(S.gold); S.stats.end=Math.min(999,(S.stats.end||50)+20); window.updateHeader(); toast('🌾 열심히 일했다. 골드+15, END+2', 2000); },
    elderTalk: ()=>{ updateReputation(10); toast('👴 장로에게서 귀한 이야기를 들었다. 평판+10', 2500); },
    dungeonExplore: ()=>{ startAIDungeonExplore(); },
    disarmTrap: ()=>{ if((S.stats.agi||50)>60){ S.gold+=50; saveGold(S.gold); window.updateHeader(); toast('⚙️ 함정 해제 성공! 골드+50', 2000); } else { S.stats.hp=Math.max(1,(S.stats.hp||100)-20); window.updateHeader(); toast('❌ 함정 해제 실패! HP-20', 2000); } },
    altarOffer: ()=>{ if(S.gold>=30){ S.gold-=30; saveGold(S.gold); const keys=['str','agi','end','mgc','int','luk']; const k=keys[Math.floor(Math.random()*keys.length)]; S.stats[k]=Math.min(999,(S.stats[k]||50)+50); window.updateHeader(); toast(`⛩️ 제단의 축복: ${k.toUpperCase()} +8!`, 2500); } else toast('골드 30 필요', 1500); },
    scavenge: ()=>{ rollDynamicScavenge(loadCurrentLocation()?.type||'ruins').then(scavItem=>{ if(scavItem){ S.inventory.push(scavItem); saveInventory(S.inventory); toastHTML(`🔍 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(scavItem,{size:14}):(scavItem.icon)} ${esc(scavItem.name)} 발견! (${esc(scavItem.rarity)})`, 2500); } else toast('🔍 수색했지만 아무것도 없었다', 1500); }); },
    payRespects: ()=>{ S.stats.fath=Math.min(999,(S.stats.fath||50)+40); window.updateHeader(); grantTitle('peacemaker'); toast('🪦 망자들의 넋을 기렸다. 신앙심+5', 2500); },
    talkToGhost: ()=>{ updateReputation(15); toast('👻 망자의 영혼이 비밀을 속삭였다. 평판+15', 2500); },
    meditate: ()=>{ const keys=['str','agi','end','mgc','int','luk','per','wil']; keys.forEach(k=>{ S.stats[k]=Math.min(999,(S.stats[k]||50)+15); }); window.updateHeader(); toast('🧘 깊은 명상으로 모든 스탯+2!', 2500); },
    investigateRuins: ()=>{ if((S.stats.int||50)>=60){ S.skillSP+=2; saveSkillSP(S.skillSP); toast('🔍 고대 지식 발견! 스킬 포인트+2', 2500); } else toast('🔍 뭔가 있는 것 같지만 해석하기 어렵다', 1500); },
    ancientRitual: ()=>{ const effects=[()=>{S.stats.mgc=Math.min(999,(S.stats.mgc||50)+80);toast('✨ 고대 마력 흡수! MGC+15',2500);},()=>{applyStatusEffect('blessed');toast('✨ 고대의 축복!',2500);},()=>{S.stats.hp=Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999),(S.stats.hp||100)-20);applyStatusEffect('curse');toast('⚠️ 저주가 깃들었다! HP-20, 저주 발동',2500);}]; effects[Math.floor(Math.random()*effects.length)](); window.updateHeader(); },
    visitBar: ()=>{ S.stats.mp=Math.min((typeof getPlayerMaxMp==='function'?getPlayerMaxMp():999),(S.stats.mp||100)+20); updateReputation(5); toast('🍺 바에서 정보를 들었다. MP+20, 평판+5', 2000); },
    contactFixer: ()=>{ const gold=Math.floor(Math.random()*100)+50; S.gold+=gold; saveGold(S.gold); window.updateHeader(); toast(`🤝 픽서 의뢰 완료! 골드+${gold}`, 2500); },
    guardDuty: ()=>{ S.gold+=20; saveGold(S.gold); updateReputation(8); window.updateHeader(); toast('🛡️ 경비 완료! 골드+20, 평판+8', 2000); },
    barterTrade: ()=>{ toast('🔄 물물교환: 인벤토리 패널에서 아이템을 선택하세요', 2500); window.openP('inventory'); },
    enchantItem: ()=>{ toast('✨ 인벤토리의 장비 아이템에 마법이 깃들었다!', 2500); S.inventory.forEach(item=>{ if(item.type==='equip'&&item.effects){ Object.keys(item.effects).forEach(k=>{ item.effects[k]=(item.effects[k]||0)+3; }); } }); saveInventory(S.inventory); },
    usePortal: ()=>{ toast('🌀 마법진이 활성화됐다. 다음 이동 시 비용 없음.', 2500); S._portalReady=true; },
    identifyItem: ()=>{ toast('🔍 아이템의 숨겨진 효과가 밝혀졌다!', 2000); },
    jianghuDuel: ()=>{ if(Math.random()<0.5){ updateReputation(20); toast('⚔️ 대련 승리! 명성+20', 2500); } else { S.stats.hp=Math.max(1,(S.stats.hp||100)-15); window.updateHeader(); toast('⚔️ 대련 패배... HP-15', 2000); } },
    buyInfo: ()=>{ updateReputation(10); toast('💬 귀한 정보를 얻었다. 평판+10', 2000); },
    joinSect: ()=>{ toast('🐉 문파 가입 조건을 확인하세요. 강한 스탯과 명성이 필요합니다.', 3000); },
    hideout: ()=>{ updateReputation(-2); toast('🌲 은신 중... 추격자를 따돌렸다. 3턴간 안전', 2500); S._hideoutTurns=3; },
    gatherGossip: ()=>{ updateReputation(5); const items=['새로운 퀘스트 힌트','위험 지역 경고','숨겨진 루트 정보','세력 동향 정보']; toast(`💬 소문 수집: ${items[Math.floor(Math.random()*items.length)]}`, 2500); },
    hireBoat: ()=>{ toast('⛵ 뱃길을 예약했다. 다음 이동 시 해안/수로 이동 가능.', 2500); S._boatReady=true; },
    // [버그 수정] openTransportPanel을 이 파일이 직접 import해 bare 호출하면
    // race/064의 patchOpenTransportPanel(영지 이동수단 목록에 내 영지를
    // ★ 강조 표시하는 훅)이 적용된 window.openTransportPanel 재할당을
    // 건너뛴다(다른 죽은 훅들과 동일한 원인). window.openTransportPanel을
    // 우선 사용해 훅이 항상 적용되게 한다.
    useTransport: ()=>{ (typeof window.openTransportPanel==='function'?window.openTransportPanel:openTransportPanel)(transportType); },
    attendAuction: ()=>{ if(Math.random()<0.3){ const gold=Math.floor(Math.random()*200)+50; S.gold-=gold; saveGold(S.gold); window.updateHeader(); const keys=['str','agi','end','mgc','int','luk','per']; const k=keys[Math.floor(Math.random()*keys.length)]; S.stats[k]=Math.min(999,(S.stats[k]||50)+80); toast(`🔨 경매 낙찰! 골드-${gold}, ${k.toUpperCase()}+15 아이템 획득!`, 3000); } else toast('🔨 이번 경매는 낙찰에 실패했다.', 1500); window.updateHeader(); },
    // [버그 수정] huntBountyTarget(name)이 현상금 표적을 실제로 추적해
    // 전투를 시작시키는 함수까지 완성돼 있었는데, 게시판에서 유일하게
    // 현상금을 조회하는 이 액션은 최고액 수배자 정보를 toast로 보여주기만
    // 하고 끝나 실제로 그 표적을 사냥할 방법이 어디에도 없었다 — 현상금
    // 게시판 시스템 전체가 "구경만 가능하고 참여는 불가능한" 반쪽짜리
    // 상태였다. 이 액션(다른 게시판 액션들처럼 "클릭 한 번 = 즉시 결과
    // 하나"인 단발성 상호작용)에서 최고액 표적을 바로 추적하도록 연결한다.
    checkBounty: ()=>{
      updateReputation(5);
      const board = (typeof refreshBountyBoard==='function') ? refreshBountyBoard() : [];
      const active = board.filter(b=>!b.claimed);
      if(!active.length){
        toast('📋 현재 게시판에 활성 수배자가 없습니다. 평판+5', 2500);
      } else {
        const top = active.sort((a,b)=>b.amount-a.amount)[0];
        if(typeof huntBountyTarget==='function') huntBountyTarget(top.name);
        else toastHTML(`📋 현상금 게시판: ${esc(active.length)}명의 수배자 (최고액: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(top,{size:14}):(top.icon)}${esc(top.name)} ${esc(top.amount)}골드). 평판+5`, 3500);
      }
    },
    nobleVisit: ()=>{ if((S.stats.cha||50)>=60){ updateReputation(15); toast('👑 귀족과의 교류 성공! 평판+15', 2500); } else toast('👑 귀족이 당신을 무시했다...', 1500); },
    guildInteract: ()=>{ const gold=Math.floor(Math.random()*80)+40; S.gold+=gold; saveGold(S.gold); window.updateHeader(); toast(`⚔️ 길드 의뢰 완료! 골드+${gold}`, 2500); },
    // [신규] 태초의 화로 전용 — 대장장이 히든 퀘스트 「태초의 화로」 완료로
    // 영구 개방되는 장소. 재료를 확정적으로 지급하는 JS 함수로 구현해
    // AI 서술에 의존하지 않고 항상 동일하게 동작하게 한다.
    // [밸런스 조정] 태초급 레시피 3종의 재료 요구량을 실제로 맞춰봤을 때
    // (망치: 원석3·뼈4·비늘3·파편3·결정3 / 심장검: 원석2·파편4·결정4·몬스터뼈3
    // / 갑주: 원석3·뼈5·비늘4·결정3·파편2), 최초 지급량(각 1~2개)으로는
    // 세 아이템 중 하나조차 만들려면 최소 4회(80턴) 이상 왕복해야 하는
    // 심각한 밸런스 문제가 있었다. 1회 채집으로 심장검(가장 재료가 적은
    // 아이템) 하나는 확실히 만들 수 있는 양으로 상향하고, monster_bone도
    // 누락되어 있어 추가했다. 쿨다운도 20→8턴으로 완화해 여러 번 왕복해도
    // 지치지 않게 한다.
    gatherPrimalForgeMaterials: ()=>{
      const now = S.msgCount||0;
      const lastTurn = (()=>{ try{ return parseInt(lsGet('tf-primal-forge-last-gather')||'-9999'); }catch(e){ return -9999; } })();
      const COOLDOWN = 8;
      if(now - lastTurn < COOLDOWN){
        toast(`🔥 화로의 기운이 아직 회복되지 않았다. (${COOLDOWN-(now-lastTurn)}턴 후 다시 채집 가능)`, 3000);
        return;
      }
      const mats = (typeof loadMaterials==='function') ? loadMaterials() : {};
      const gained = { philosophers_ore:3, titan_bone:2, dragon_scale:2, void_shard:2, star_crystal:2, monster_bone:2 };
      Object.entries(gained).forEach(([id,n])=>{ mats[id]=(mats[id]||0)+n; });
      if(typeof saveMaterials==='function') saveMaterials(mats);
      lsSet('tf-primal-forge-last-gather', String(now));
      const gainedText = Object.entries(gained).map(([id,n])=>`${MATERIALS[id]?.icon||''}${MATERIALS[id]?.name||id}×${n}`).join(', ');
      toast(`🔥 태초의 화로 곁에서 재료를 채집했다! ${gainedText}`, 4000);
    },
    // [신규] 전설의 사냥터 전용 — 사냥꾼 히든 퀘스트 「야생을 닮아가는
    // 것」 완료로 영구 개방되는 장소. 태고의 최상급(T13급) 짐승을
    // 사냥해 그 전용 부산물을 확정적으로 지급한다. 기존
    // getOrCreateEnemyMaterials()를 그대로 재사용해, 이 사냥터의
    // 짐승도 다른 경로로 만난 몬스터와 동일한 재료 체계를 공유한다.
    legendaryHunt: ()=>{
      const now = S.msgCount||0;
      const lastTurn = (()=>{ try{ return parseInt(lsGet('tf-legendary-hunt-last'))||-9999; }catch(e){ return -9999; } })();
      const COOLDOWN = 8;
      if(now - lastTurn < COOLDOWN){
        toast(`🐺 이 땅의 짐승들은 아직 흔적을 드러내지 않는다. (${COOLDOWN-(now-lastTurn)}턴 후 다시 사냥 가능)`, 3000);
        return;
      }
      const LEGENDARY_PREY = ['태고의 늑대왕','천년 묵은 고룡','원초의 대지 정령','명계에서 건너온 사냥개'];
      const preyName = LEGENDARY_PREY[Math.floor(Math.random()*LEGENDARY_PREY.length)];
      const matIds = (typeof getOrCreateEnemyMaterials==='function') ? getOrCreateEnemyMaterials(preyName, 'legendary') : [];
      const mats = (typeof loadMaterials==='function') ? loadMaterials() : {};
      matIds.forEach(mid=>{ mats[mid] = (mats[mid]||0)+1; });
      if(typeof saveMaterials==='function') saveMaterials(mats);
      const trophies = (typeof loadHunterTrophies==='function') ? loadHunterTrophies() : {};
      trophies[preyName] = (trophies[preyName]||0)+1;
      if(typeof saveHunterTrophies==='function') saveHunterTrophies(trophies);
      lsSet('tf-legendary-hunt-last', String(now));
      const matNames = matIds.map(mid=>MATERIALS[mid]?.name||mid).join(', ');
      toast(`🐺 전설의 사냥터에서 ${preyName}을(를) 사냥했다! 부산물: ${matNames||'없음'}`, 4500);
    },
    // [신규] 전설의 사냥터 전용 조련 — T13급 최상급 야수를 길들인다.
    // 사냥꾼 히든 퀘스트 「야수의 왕」의 핵심 콘텐츠. 일반 사냥과
    // 쿨다운을 공유해 무한 반복을 막는다.
    legendaryTame: ()=>{
      const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
      if(jobId!=='hunter'){ toast('사냥꾼이어야 전설급 야수를 조련할 수 있습니다.'); return; }
      const party = (typeof loadParty==='function') ? loadParty() : [];
      if(party.length >= 8){ toast('파티가 가득 찼습니다 (최대 8인). 동료를 정리한 후 다시 시도하세요.', 3000); return; }
      const now = S.msgCount||0;
      const lastTurn = (()=>{ try{ return parseInt(lsGet('tf-legendary-hunt-last'))||-9999; }catch(e){ return -9999; } })();
      const COOLDOWN = 8;
      if(now - lastTurn < COOLDOWN){
        toast(`🐺 이 땅의 짐승들은 아직 흔적을 드러내지 않는다. (${COOLDOWN-(now-lastTurn)}턴 후 다시 시도 가능)`, 3000);
        return;
      }
      const LEGENDARY_PREY = ['태고의 늑대왕','천년 묵은 고룡','원초의 대지 정령','명계에서 건너온 사냥개'];
      const preyName = LEGENDARY_PREY[Math.floor(Math.random()*LEGENDARY_PREY.length)];
      const tameInfo = (typeof calcTameSuccessChance==='function') ? calcTameSuccessChance(preyName) : {chance:0.05, tier:13};
      const success = Math.random() < tameInfo.chance;
      lsSet('tf-legendary-hunt-last', String(now));

      if(success){
        const tierScale = tameInfo.tier;
        party.push({
          name: preyName, icon: '🐾', role: '조련된 전설급 야수',
          type: 'beast', typeLabel: '길들인 야수',
          relationship: 55,
          personality: '태고의 위압감을 지녔지만 주인에게만은 온순하다.',
          statBonus: {
            str: Math.round(4 + tierScale*2.2),
            agi: Math.round(4 + tierScale*1.8),
            end: Math.round(4 + tierScale*1.6),
          },
          battleRole: '전방 돌격·정찰',
          uniqueSkill: '야생의 감각 — 파티 전체 기습 당할 확률 감소',
          leaveCondition: '관계가 크게 악화되면 야생으로 돌아갈 수 있다',
          aiHint: `이 동료는 전설급 ${preyName}을(를) 길들인 것이다(T${tierScale}). 말을 하지 못하며 압도적인 존재감을 지녔지만 주인에게는 절대적으로 온순하다.`,
          tamedTier: tierScale,
          joinedAt: new Date().toISOString(), joinTurn: now,
          alive: true, mood: 'neutral', trustLevel: 50,
        });
        if(typeof saveParty==='function') saveParty(party);
        const tameLog = (typeof loadHunterTameLog==='function') ? loadHunterTameLog() : {count:0,highestTier:0,legendaryTamed:false};
        tameLog.count=(tameLog.count||0)+1; tameLog.highestTier=Math.max(tameLog.highestTier||0,tierScale);
        if(tierScale>=13) tameLog.legendaryTamed = true;
        if(typeof saveHunterTameLog==='function') saveHunterTameLog(tameLog);
        toast(`🐺 전설의 사냥터에서 ${preyName}을(를) 길들이는 데 성공했다! (T${tierScale})`, 5500);
      } else {
        toast(`🐺 ${preyName}을(를) 길들이려 했으나 놓쳐버렸다. (성공확률 ${Math.round(tameInfo.chance*100)}%)`, 4500);
      }
    },
    // [신규] 감옥 전용 행동 6종 — 체포 시스템을 단순 페널티 상태가
    // 아니라 실제로 플레이할 수 있는 서브플롯으로 만든다.
    jailTalkInmate: ()=>{
      const jail = (typeof loadJailState==='function') ? loadJailState() : {};
      if(!jail.jailed) return;
      const roll = Math.random();
      if(roll < 0.3){
        updateReputation(5);
        toast('🗣️ 한 수감자가 탈출 경로에 대한 단서를 알려줬다. (평판+5, 다음 탈출 계획 성공률 상승)', 3000);
        jail.escapeHint = true; saveJailState(jail);
      } else if(roll < 0.6){
        toast('🗣️ 별 소득 없는 대화였지만 시간을 보냈다.', 2000);
      } else {
        S.stats.hp = Math.max(1, (S.stats.hp||100) - 5);
        window.updateHeader();
        toast('🗣️ 시비가 붙어 한바탕 싸웠다. HP-5', 2500);
      }
    },
    jailBribeGuard: ()=>{
      const jail = (typeof loadJailState==='function') ? loadJailState() : {};
      if(!jail.jailed) return;
      // 매수 성공률 — 매력(cha) 스탯 보정
      const cha = S.stats?.cha || 30;
      if(Math.random() < 0.25 + cha*0.005){
        jail.sentenceTurns = Math.max(0, (jail.sentenceTurns||10) - 4);
        saveJailState(jail);
        toast('💰 간수가 못 본 척 해주기로 했다. 형기 -4턴', 3000);
      } else {
        toast('💰 간수가 매수를 거부했다... 돈만 날렸다.', 2500);
      }
    },
    jailPlanEscape: ()=>{
      const jail = (typeof loadJailState==='function') ? loadJailState() : {};
      if(!jail.jailed) return;
      const agi = S.stats?.agi || 30;
      const hintBonus = jail.escapeHint ? 0.2 : 0;
      const chance = Math.min(0.7, 0.15 + agi*0.006 + hintBonus);
      if(Math.random() < chance){
        jail.jailed = false;
        saveJailState(jail);
        toast('🗝️ 경비의 빈틈을 정확히 노려 탈출에 성공했다!', 3500);
        if(typeof returnFromJail==='function') returnFromJail(jail);
      } else {
        jail.sentenceTurns = (jail.sentenceTurns||10) + 3;
        saveJailState(jail);
        toast('🗝️ 탈출 계획이 발각됐다. 형기 +3턴', 3000);
      }
    },
    jailLabor: ()=>{
      const jail = (typeof loadJailState==='function') ? loadJailState() : {};
      if(!jail.jailed) return;
      jail.sentenceTurns = Math.max(0, (jail.sentenceTurns||10) - 2);
      saveJailState(jail);
      S.stats.end = Math.min(999, (S.stats.end||50) + 1);
      window.updateHeader();
      toast('⛏️ 묵묵히 노역을 했다. 형기 -2턴, END+1', 2500);
    },
    jailWait: ()=>{
      toast('⏳ 조용히 시간이 흐르길 기다렸다.', 1800);
    },
    jailRiot: ()=>{
      const jail = (typeof loadJailState==='function') ? loadJailState() : {};
      if(!jail.jailed) return;
      // 고위험 고보상 — 성공률은 낮지만 성공 시 즉시 탈출, 실패 시 큰 페널티
      if(Math.random() < 0.3){
        jail.jailed = false;
        saveJailState(jail);
        toast('🔥 폭동의 혼란 속에서 탈출에 성공했다!', 3500);
        if(typeof returnFromJail==='function') returnFromJail(jail);
      } else {
        S.stats.hp = Math.max(1, (S.stats.hp||100) - 25);
        jail.sentenceTurns = (jail.sentenceTurns||10) + 8;
        saveJailState(jail);
        window.updateHeader();
        toast('🔥 폭동이 진압당했다! HP-25, 형기+8턴', 3500);
      }
    },
    // [신규] 최고 보안 감옥("심연의 탑") 전용 행동 6종 — 일반 지방
    // 감옥보다 전반적으로 성공률이 낮고 비용이 크다. 카시안/베이라는
    // 단순 수치 보너스가 아니라 실제 고정 NPC와의 상호작용으로,
    // 신뢰가 쌓이면(jail.kassianTrust) 더 좋은 정보를 준다.
    jailAskKassian: ()=>{
      const jail = (typeof loadJailState==='function') ? loadJailState() : {};
      if(!jail.jailed) return;
      jail.kassianTrust = (jail.kassianTrust||0) + 1;
      if(jail.kassianTrust >= 2){
        jail.escapeHintMax = true; // 다음 탈출 시도 성공률 크게 상승
        saveJailState(jail);
        toast('🗡️ 카시안이 마침내 진짜 탈출 경로를 알려줬다. 다음 탈출 시도가 훨씬 유리해진다.', 3500);
      } else {
        saveJailState(jail);
        toast('🗡️ 카시안은 "아직 너를 믿을 수 없다"며 의미심장한 미소만 지었다. (신뢰 쌓는 중)', 3000);
      }
    },
    jailTalkVeyra: ()=>{
      const jail = (typeof loadJailState==='function') ? loadJailState() : {};
      if(!jail.jailed) return;
      const roll = Math.random();
      if(roll < 0.35){
        updateReputation(8);
        toast('👁️ 베이라가 탑의 숨겨진 통로에 대해 중얼거렸다. 평판+8, 탈출 단서 획득.', 3200);
        jail.escapeHint = true; saveJailState(jail);
      } else {
        toast('👁️ 베이라는 알 수 없는 말을 중얼거릴 뿐, 의미를 알 수 없었다.', 2500);
      }
    },
    jailBribeGuardMax: ()=>{
      const jail = (typeof loadJailState==='function') ? loadJailState() : {};
      if(!jail.jailed) return;
      const cha = S.stats?.cha || 30;
      // 최고 보안 감옥 간수는 훨씬 매수하기 어렵다
      if(Math.random() < 0.10 + cha*0.003){
        jail.sentenceTurns = Math.max(0, (jail.sentenceTurns||20) - 5);
        saveJailState(jail);
        toast('💰 간수 하나가 위험을 무릅쓰고 편의를 봐줬다. 형기 -5턴', 3000);
      } else {
        toast('💰 이곳의 간수들은 쉽게 매수되지 않는다. 돈만 날렸다.', 2500);
      }
    },
    jailPlanEscapeMax: ()=>{
      const jail = (typeof loadJailState==='function') ? loadJailState() : {};
      if(!jail.jailed) return;
      const agi = S.stats?.agi || 30;
      // 기본 성공률이 지방 감옥보다 훨씬 낮음. 카시안/베이라 단서가 있으면 크게 보정.
      let chance = 0.05 + agi*0.003;
      if(jail.escapeHintMax) chance += 0.35;
      else if(jail.escapeHint) chance += 0.15;
      chance = Math.min(0.6, chance);
      if(Math.random() < chance){
        jail.jailed = false;
        saveJailState(jail);
        toast('🗝️ 겹겹의 경비를 뚫고 심연의 탑을 탈출했다! 전설이 될 만한 일이다.', 4000);
        if(typeof returnFromJail==='function') returnFromJail(jail);
      } else {
        jail.sentenceTurns = (jail.sentenceTurns||20) + 6;
        saveJailState(jail);
        toast('🗝️ 탈출 계획이 발각됐다. 더 엄격한 감시가 시작된다. 형기 +6턴', 3000);
      }
    },
    jailLaborMax: ()=>{
      const jail = (typeof loadJailState==='function') ? loadJailState() : {};
      if(!jail.jailed) return;
      jail.sentenceTurns = Math.max(0, (jail.sentenceTurns||20) - 2);
      saveJailState(jail);
      S.stats.end = Math.min(999, (S.stats.end||50) + 1);
      S.stats.hp = Math.max(1, (S.stats.hp||100) - 3); // 가혹한 노역이라 소폭 HP 손실
      window.updateHeader();
      toast('⛏️ 가혹한 노역을 견뎌냈다. 형기 -2턴, END+1, HP-3', 2800);
    },
    jailRiotMax: ()=>{
      const jail = (typeof loadJailState==='function') ? loadJailState() : {};
      if(!jail.jailed) return;
      // 극히 낮은 성공률, 그러나 성공 시 전설적인 탈출
      if(Math.random() < 0.15){
        jail.jailed = false;
        saveJailState(jail);
        toast('🔥 심연의 탑 전체가 뒤흔들리는 대규모 폭동! 그 혼란 속에서 기적적으로 탈출했다!', 4500);
        if(typeof returnFromJail==='function') returnFromJail(jail);
      } else {
        S.stats.hp = Math.max(1, (S.stats.hp||100) - 40);
        jail.sentenceTurns = (jail.sentenceTurns||20) + 15;
        saveJailState(jail);
        window.updateHeader();
        toast('🔥 폭동은 잔혹하게 진압당했다. HP-40, 형기+15턴', 4000);
      }
    },
  };

  const fn = actions[action];
  if(fn) fn();
  else toast('상호작용 준비 중...', 1500);
  renderLocationPanel();
}
window.doInteraction = doInteraction;

export function checkDangerLevelWarning(loc){
  try{
    if(!loc || !loc.dangerLevel) return true; // 위험도 정보 없으면 통과
    const lv = (typeof loadPlayerLevel==='function') ? (loadPlayerLevel()||1) : 1;
    const expectedDanger = Math.max(1, Math.floor(lv/10) + 1);
    const gap = loc.dangerLevel - expectedDanger;
    if(gap < 2) return true; // 감당 가능한 수준이면 통과
    const riskLabel = loc.dangerLevel>=5 ? '극위험' : loc.dangerLevel>=4 ? '매우 위험' : '위험';
    return confirm(`⚠️ ${loc.icon||''}${loc.name}은(는) 현재 레벨(${lv})에 비해 ${riskLabel}한 지역입니다 (위험도 ${'⚠️'.repeat(loc.dangerLevel)}).\n\n이곳의 몬스터는 훨씬 강할 수 있습니다. 그래도 이동하시겠습니까?`);
  }catch(e){ return true; }
}
window.checkDangerLevelWarning = checkDangerLevelWarning;

window.checkDangerLevelWarning = checkDangerLevelWarning;

// [10차 수정] 이 함수는 실제 여행(tickLandTravel 도착 시점)과 "이미 가본 곳"
// 빠른 이동 단축 버튼(게시판/정치지도) 양쪽에서 최종 도착 처리로 쓰인다.
// 예전엔 confirmTravel(즉시 순간이동 목록)에만 업적·일지·이동 로그·도착
// 서술 기록이 붙어 있고 이 함수는 그게 다 빠진 "가벼운" 버전이라, 도착
// 경로에 따라 기록이 갈리는 문제가 있었다 — 여기 한 곳에 합쳐서 어느
// 경로로 도착하든 결과가 같게 한다. 조회 대상도 고정 장소만 보던
// window.getAllLocations()에서 AI 생성 장소까지 포함한
// getAllTravelableLocations()로 넓혔다(안 그러면 AI 장소로 실제 여행을
// 떠났다가 도착 시점에 "장소를 찾을 수 없음"으로 조용히 실패한다).
// [12차 수정] opts.skipArrivalMsg — tickLandTravel의 도착 분기에서 호출할
// 때는 true로 넘긴다. 실제 여행 도중엔 이미 startLandTravel이
// S._pendingTravelHint("긴 여정 끝에 ...에 도착했다")를 심어뒀고, 이건
// 다음 실제 플레이어 입력의 프롬프트에 자연스럽게 얹혀 AI가 알아서
// 도착 장면을 이어 쓰게 되는 설계다. 그런데 이 함수가 매번 무조건
// setTimeout(600ms) 뒤에 "~에 도착해 주변을 둘러본다"를 sendMsg로 또
// 쏴버리면 — 그 턴은 이미 "[🚶 여행 중] 잔여 1일"로 AI가 방금 응답을
// 만든 직후라, 플레이어가 아무 것도 안 눌렀는데 도착 서술 메시지가
// 예고 없이 하나 더 튀어나오는 걸로 보이고(같은 턴에 서로 다른 서술
// 두 개가 이어붙는 부자연스러움), 그 자동 sendMsg가 자기 프롬프트를
// 만들면서 _pendingTravelHint를 먼저 소비해버려 원래 설계된 "다음
// 플레이어 턴에 자연스럽게 얹기"도 무력화된다. 반면 게시판/정치지도
// 빠른 이동처럼 플레이어가 직접 클릭해서 도착하는 경우는 여행 상태나
// pendingHint가 없으므로 즉시 서술해주는 게 맞다 — 그 경로에서만
// sendMsg를 쏜다.
export function moveToLocation(locName, opts){
  const skipArrivalMsg = !!(opts && opts.skipArrivalMsg);
  const allLocs = (typeof window.getAllTravelableLocations==='function') ? window.getAllTravelableLocations() : window.getAllLocations();
  const loc = allLocs.find(l=>l.name===locName);
  if(!loc) return;
  if(!checkDangerLevelWarning(loc)) return; // 경고 후 취소하면 이동하지 않음
  const prevLoc = loadCurrentLocation();
  window.currentLocation = loc;
  saveCurrentLocation(loc); // 지도의 "보고 있는 대륙" 갱신도 이 안에서 함께 처리됨
  if(loc.isDemesne){ _onArriveAtDemesne(loc); }
  else if(prevLoc?.isDemesne){ _onDepartDemesne(prevLoc); }
  const visited = loadLocations();
  const alreadyVisited = !!visited.find(v=>v.name===loc.name);
  if(!alreadyVisited){
    visited.push({ name:loc.name, icon:loc.icon, visitedAt:new Date().toISOString(), turn:S.msgCount, aiGenerated:!!loc.aiGenerated });
    saveLocations(visited);
  }
  renderLocationPanel();

  try{
    if(typeof window.loadTravelLog==='function' && typeof window.saveTravelLog==='function'){
      const log = window.loadTravelLog();
      log.push({
        from: prevLoc ? { id:prevLoc.id, name:prevLoc.name, type:prevLoc.type } : null,
        to:   { id:loc.id, name:loc.name, type:loc.type, icon:loc.icon },
        cost: 0,
        dist: (typeof window.getTravelDistance==='function') ? window.getTravelDistance(prevLoc?.type||'default', loc.type||'default') : null,
        traveledAt: new Date().toISOString(),
        turn: S.msgCount||0,
        scenario: S.scenario?.id || 'medieval',
        aiDest: !!loc.aiGenerated,
      });
      window.saveTravelLog(log);
    }
  }catch(e){}

  unlockAchievement('travel');
  if(typeof window.saveDiaryEntry==='function')
    window.saveDiaryEntry('travel', `🗺️ ${prevLoc?.name||'출발지'} → ${loc.name}`, S.msgCount||0);
  if(loc.type==='dungeon') unlockAchievement('enter_dungeon');

  if(typeof window._injectTravelMessage==='function') window._injectTravelMessage(prevLoc, loc, 0);
  else toastHTML(`🗺️ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:14}):(loc.icon)} ${esc(loc.name)} 에 도착했습니다!`, 3000);

  setTimeout(()=>{
    if(typeof window.updateHeader==='function') window.updateHeader();
    if(typeof window.updateMapTabState==='function') window.updateMapTabState(loc);
  }, 200);

  // 빠른 이동(직접 클릭)만 즉시 도착 서술 — 실제 여행(tickLandTravel)
  // 도착은 이미 심어둔 _pendingTravelHint가 다음 플레이어 턴에 자연스럽게
  // 얹히므로 여기서 또 쏘지 않는다(위 주석 참고).
  if(!skipArrivalMsg){
    setTimeout(()=>{
      if(typeof window.sendMsg==='function') window.sendMsg(`${loc.icon} ${loc.name}에 도착해 주변을 둘러본다.`, false);
    }, 600);
  }

  if(typeof window._scheduleExportSnapshot==='function') window._scheduleExportSnapshot();
}
window.moveToLocation = moveToLocation;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_40(){
function renderBulletinBoard(loc) {
  const cfg = BULLETIN_SIZE_CONFIG[loc.type] || BULLETIN_SIZE_CONFIG.village;
  const bulletin = loadBulletin();
  const locId = loc.id || loc.name;
  const cacheKey = locId + '_' + Math.floor(Date.now() / (1000 * 60 * 60 * 6));

  // 캐시 or 새 생성
  if(!bulletin[cacheKey]) {
    // 구형 캐시 정리
    Object.keys(bulletin).forEach(k=>{ if(k.startsWith(locId+'_') && k!==cacheKey) delete bulletin[k]; });
    bulletin[cacheKey] = generateBulletinData(loc);
    saveBulletin(bulletin);
  }
  const data = bulletin[cacheKey];
  const acceptedBulletin = loadAcceptedBulletin();

  const tierColor = { common:'#8a9a8a', uncommon:'#4a9a6a', rare:'#5a80d0', legendary:'#c8a96e' };
  const tierLabel = { common:'일반', uncommon:'중급', rare:'고급', legendary:'전설' };
  const infoTierColor = { junk:'#5a5a5a', useful:'#6a8a6a', special:'#9a6aaa' };
  const infoTierLabel = { junk:'공지', useful:'유용', special:'특수정보' };

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:${cfg.color};letter-spacing:1.5px">
        📋 ${esc(loc.name)} 게시판
      </div>
      <div style="font-size:9px;color:var(--dim)">🏘️ ${cfg.label} 규모</div>
    </div>`;

  // 의뢰 섹션
  if(data.quests.length === 0) {
    html += `<div style="padding:8px 10px;background:#0d0800;border:1px dashed #2a2010;margin-bottom:8px;font-size:10px;color:var(--dim);text-align:center">현재 등록된 의뢰가 없습니다</div>`;
  } else {
    html += `<div style="font-family:Cinzel,serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:5px;opacity:.8">⚔️ 의뢰 (${data.quests.length}건)</div>`;
    data.quests.forEach(q => {
      const isAccepted = acceptedBulletin.some(a=>a.uid===q.uid);
      const tc = tierColor[q.tier]||'#8a9a8a';
      html += `
        <div style="padding:10px 11px;background:#090600;border:1px solid ${tc}55;margin-bottom:6px;border-radius:2px;position:relative">
          <div style="display:flex;align-items:flex-start;gap:8px">
            <span style="font-size:20px;flex-shrink:0;margin-top:1px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:20}):(q.icon)}</span>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
                <span style="font-family:Cinzel,serif;font-size:10px;color:${tc}">${esc(q.title)}</span>
                <span style="font-size:8px;color:${tc};background:${tc}22;padding:1px 5px;border-radius:1px">${tierLabel[q.tier]||q.tier}</span>
              </div>
              <div style="font-size:10px;color:var(--dim);line-height:1.5;margin-bottom:5px">${esc(q.desc)}</div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span style="font-size:10px;color:#f1c40f">💰 보상: ${q.rewardGold}G</span>
                ${q.rewardExtra?`<span style="font-size:9px;color:#80c080">✦ ${esc(q.rewardExtra)}</span>`:''}
              </div>
            </div>
          </div>
          <div style="margin-top:7px">
            ${isAccepted
              ? (acceptedBulletin.find(a=>a.uid===q.uid)?.completed
                ? `<div style="padding:5px 8px;background:#0a0a0a;border:1px solid #3a3a3a;font-size:9px;color:#606060;font-family:Cinzel,serif;text-align:center">✅ 완료됨</div>`
                : `<div style="display:flex;align-items:center;gap:6px">
                    <div style="flex:1;padding:5px 8px;background:#0a1a08;border:1px solid #3a6a2a;font-size:9px;color:#60a040;font-family:Cinzel,serif;text-align:center">✔ 진행 중</div>
                    <button onclick="manualCompleteBulletin('${esc(q.uid)}','${esc(q.title)}',${q.rewardGold},'${esc(q.icon)}','${esc(q.tier||'common')}')" style="padding:5px 10px;background:#0a1a0a;border:1px solid #3a6a3a;color:#70c070;font-size:9px;cursor:pointer;border-radius:2px;white-space:nowrap">✓ 완료 처리</button>
                  </div>`)
              : `<button class="btn btn-gold" style="width:100%;padding:6px;font-size:9px" onclick="acceptBulletinQuest('${esc(q.uid)}','${esc(q.title)}',${q.rewardGold},'${esc(q.icon)}','${esc(q.desc)}','${esc(q.tier||'common')}')">의뢰 수락</button>`
            }
          </div>
        </div>`;
    });
  }

  // 정보글 섹션
  if(data.infos.length > 0) {
    html += `<div style="font-family:Cinzel,serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin:10px 0 5px;opacity:.8">📌 공지 / 정보 (${data.infos.length}건)</div>`;
    data.infos.forEach(info => {
      const ic = infoTierColor[info.tier]||'#5a5a5a';
      const isSpecial = info.tier==='special';
      html += `
        <div style="padding:9px 11px;background:${isSpecial?'#0f0a18':'#080600'};border:1px solid ${ic}55;margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(info,{size:16}):(info.icon)}</span>
            <span style="font-family:Cinzel,serif;font-size:9px;color:${ic}">${esc(info.title)}</span>
            <span style="font-size:8px;color:${ic};background:${ic}22;padding:1px 5px;border-radius:1px;margin-left:auto;flex-shrink:0">${infoTierLabel[info.tier]||''}</span>
          </div>
          <div style="font-size:10px;color:${isSpecial?'#b090d0':'var(--dim)'};line-height:1.55">${esc(info.content)}</div>
        </div>`;
    });
  }

  // ── 세력 동향 섹션 (큐에 소식이 있을 때만) ──
  const factionQueue = loadFactionNewsQueue ? loadFactionNewsQueue() : [];
  const unreadCount = factionQueue.filter(n=>!n.read).length;
  if(factionQueue.length > 0){
    html += `<div style="font-family:Cinzel,serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin:10px 0 5px;opacity:.8">
      📰 세력 동향${unreadCount>0?` <span style="color:#e05050;font-size:8px">(새 소식 ${unreadCount}건)</span>`:''}
    </div>`;
    html += renderFactionNewsBulletin ? renderFactionNewsBulletin() : '';
  }

  html += `<div style="font-size:8px;color:var(--dim);text-align:center;margin-top:8px;opacity:.5">게시판은 주기적으로 갱신됩니다</div>`;
  return html;
}
window.renderBulletinBoard = renderBulletinBoard;

function acceptBulletinQuest(uid, title, rewardGold, icon, desc, tier) {
  const accepted = loadAcceptedBulletin();
  if(accepted.some(a=>a.uid===uid)){ toast('이미 수락한 의뢰입니다', 1500); return; }

  // ── 팝업으로 수락 여부 확인 ──
  const questData = {
    title: title,
    icon:  icon || '📋',
    desc:  desc || '',
    difficulty: tier === 'legendary' ? 'legendary' : tier === 'rare' ? 'hard' : tier === 'uncommon' ? 'normal' : 'easy',
    reward: { gold: rewardGold },
    lore: null,
  };

  showQuestAcceptPopup(
    questData,
    // 수락
    function(){
      const accepted2 = loadAcceptedBulletin();
      if(accepted2.some(a=>a.uid===uid)){ return; } // 중복 방지
      // 퀘스트 시스템에 등록
      const quests = loadQuests();
      const newQ = {
        id: 'bulletin_'+uid,
        title: title,
        desc: desc,
        reward: rewardGold,
        icon: icon || '📋',
        tier: tier || 'common',
        type: 'bulletin',
        status: 'active',
        createdAt: Date.now()
      };
      quests.push(newQ);
      saveQuests(quests);
      // 수락 목록에 추가
      accepted2.push({ uid, title, rewardGold, acceptedAt: Date.now() });
      saveAcceptedBulletin(accepted2);
      toast(`📋 의뢰 수락: ${title} (보상 ${rewardGold}G)`, 2500);
      // 연관 장소 생성
      if(typeof maybeGenerateQuestLocation==='function')
        enqueueAITask(()=>maybeGenerateQuestLocation(title, desc), '의뢰 장소 생성');
      // 게시판 재렌더
      const loc = window.currentLocation || loadCurrentLocation();
      if(loc){
        const bc = document.getElementById('loc-bulletin-content');
        if(bc) bc.innerHTML = window.renderBulletinBoard(loc);
      }
      updateQuestBadge();
    },
    // 거절
    function(){
      toast(`✕ 의뢰 거절: ${title}`, 1500);
    }
  );
}
window.acceptBulletinQuest = acceptBulletinQuest;

(function _patchLocNpcSync(){
  const _prev = window.detectAndSetLocation || window.detectAndSetLocation;
  window.detectAndSetLocation = function(aiText){
    _prev(aiText);
    const loc = window.currentLocation || loadCurrentLocation();
    if(!loc) return;
    const npcs = loadNPCs() || [];
    let changed = false;
    npcs.forEach(npc => {
      if(aiText && aiText.includes(npc.name)){
        npc.currentLoc = loc.id || loc.name;
        changed = true;
      }
    });
    if(changed) saveNPCs(npcs);
  };
})();
}

