// 전직 조건 저장/로드 헬퍼 (퀘스트·아이템·장소 등)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { SLOT_CATEGORY } from '../data/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { EPIC_QUEST_CHAINS } from '../data/009-레벨업-스탯-포인트-배분-시스템.js';
import { BLUEPRINT_SHOP } from '../data/075-파트2-C-크래프팅-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RACE_DEFS } from '../race/013-종족-시스템.js';
import { RC } from '../data/086-퀘스트임무-수락-팝업-시스템.js';
import { RELICS } from '../data/054-이동수단-시스템.js';
import { QUEST_GRADES, TL, TL_ICON, TL_TEXT, WL, WL_ICON, WL_TEXT } from '../data/087-전직-조건-저장로드-헬퍼-퀘스트아이템장소-등.js';
import { ALIGN_AXES } from '../data/208-5-직업-시스템.js';
import { EQUIP_SLOTS } from '../items/004-장비-슬롯-시스템-12종.js';
import { SET_DEFS, applySetBonus, calcSetBonus, generateAIItem } from '../items/006-세트-아이템-시스템.js';
import { getDynamicShopStock, getItemSlot, getShopStock, rollEventReward, saveEquipped, saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { _markDirty, loadAtmosphere, loadDynQuests, loadNPCs, loadQuests, saveAtmosphere, saveDynQuests, saveQuests, saveStatsSplit } from '../misc/001-block0-preamble.js';
import { SKILL_TREE_SP_COST, addExp, getAllSkillDefs, loadEpicState } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { loadAcceptedBulletin, saveAcceptedBulletin } from '../misc/053-게시판-시스템.js';
import { loadLocations, loadOwnedRelics, updateReputation } from '../misc/054-이동수단-시스템.js';
import { loadBlueprints } from '../misc/075-파트2-C-크래프팅-시스템.js';
import { saveDiaryEntry } from '../misc/076-파트2-D-일기기록-시스템.js';
import { loadFactionRep } from '../npc/067-③-NPC-관계망-시스템.js';
import { loadStats, saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { loadHiddenQuests } from '../quest/039-NEW-히든-퀘스트-시스템.js';
import { closeP, getSortedFilteredInv, getWeatherForecast, loadWorldQuests, pickGeneratedObject, recordGeneratedObject, recordMarkovSample, renderInvSortBar, renderSkills, showQuestAcceptPopup, updateQuestBadge } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { callGeminiDirect, loadNpcDlgQuests, maybeGenerateQuestLocation } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { callLocalModelJSON, tryCloudThenLocalModelThenBank } from '../quest/331-로컬-AI-모델-엔진.js';
import { $, esc, lsGet, lsSet, toast } from '../utils.js';
import { getWeatherStatMods } from '../world/032-NEW-날씨계절-판정-연동-시스템.js';
import { loadCurrentLocation, renderLocationPanel } from '../world/052-동대륙-추가-장소-4.js';
import { enqueueAITask } from '../world/085-대륙-스타팅-시스템.js';
import { saveSkillSP, saveSkills } from './002-스킬-시스템.js';
import { loadPlayerLevel } from './008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { enhanceSkill, loadHighlights, loadMemory, loadTitles, saveMemory } from './010-스킬-강화-시스템.js';
import { getJobUnlockDiscount, loadJobActions, loadJobHistory, loadJobMemory } from './042-직업-시스템-무한-파생-도감.js';
import { getDissonanceStage, getJobAlignment, loadItemDissonance, onEquipmentAlignmentChanged } from './208-5-직업-시스템.js';

export const JOB_UNLOCK_COND_KEY = 'tf-job-unlock-cond';

export function loadJobUnlockCond(){ try{ return JSON.parse(lsGet(JOB_UNLOCK_COND_KEY)||'{}'); }catch(e){ return {}; } }
window.loadJobUnlockCond = loadJobUnlockCond;

export function saveJobUnlockCond(d){ try{ lsSet(JOB_UNLOCK_COND_KEY, JSON.stringify(d)); }catch(e){} }
window.saveJobUnlockCond = saveJobUnlockCond;

export function hasCompletedQuest(questKeyword){
  try{
    const kw = questKeyword;
    // 1) 히든 퀘스트 (객체 맵): { [id]: { name, status:'completed', ... } }
    if(typeof loadHiddenQuests==='function'){
      const hMap = loadHiddenQuests();
      if(Object.values(hMap).some(q=>q.status==='completed' &&
        ((q.name||'').includes(kw)||(q.id||'').includes(kw)||(q.title||'').includes(kw))))
        return true;
    }
    // 2) 일반 퀘스트 배열 (loadQuests): [{ name, status:'completed', ... }]
    if(typeof loadQuests==='function'){
      const qs = loadQuests()||[];
      if(qs.some(q=>q.status==='completed' &&
        ((q.name||'').includes(kw)||(q.id||'').includes(kw)||(q.title||'').includes(kw))))
        return true;
    }
    // 3) NPC/월드 퀘스트 배열 (loadWorldQuests): [{ title, ... }]
    if(typeof loadWorldQuests==='function'){
      const wqs = (typeof loadWorldQuests==='function' ? loadWorldQuests() : [])||[];
      if(wqs.some(q=>q.status==='completed' &&
        ((q.title||'').includes(kw)||(q.name||'').includes(kw)||(q.id||'').includes(kw))))
        return true;
    }
    return false;
  }catch(e){ return false; }
}
window.hasCompletedQuest = hasCompletedQuest;

export function hasItemInInventory(itemKeyword){
  try{
    const inv = S?.inventory||[];
    const relics = typeof loadOwnedRelics==='function' ? loadOwnedRelics() : [];
    const inInv = inv.some(it=>(it.name||'').includes(itemKeyword)||(it.id||'').includes(itemKeyword));
    const inRelics = relics.some(r=>{
      const relicId = typeof r==='string' ? r : (r?.id||'');
      if(relicId.includes(itemKeyword)) return true;
      const def = RELICS.find(rd=>rd.id===relicId);
      return !!(def && (def.name||'').includes(itemKeyword));
    });
    return inInv || inRelics;
  }catch(e){ return false; }
}
window.hasItemInInventory = hasItemInInventory;

export function hasNpcAffection(npcNameKeyword, minAffection){
  try{
    const npcs = typeof loadNPCs==='function' ? loadNPCs() : [];
    return npcs.some(n=>(n.name||'').includes(npcNameKeyword) && (n.relationship||n.affection||0)>=minAffection);
  }catch(e){ return false; }
}
window.hasNpcAffection = hasNpcAffection;

export function hasVisitedLocation(locationKeyword){
  try{
    // 1) detectAndSetLocation이 저장하는 실제 방문 기록 (tf-locations)
    if(typeof loadLocations==='function'){
      const visited = loadLocations()||[];
      if(visited.some(v=>(v.name||'').includes(locationKeyword))) return true;
    }
    // 2) recordLocationVisit이 저장한 보조 기록 (tf-job-unlock-cond)
    const cond = loadJobUnlockCond();
    const extra = cond.visitedLocations||[];
    if(extra.some(v=>v.includes(locationKeyword))) return true;
    // 3) 현재 위치 (currentLocation 전역 변수 또는 S.location)
    if(typeof window.currentLocation!=='undefined' && window.currentLocation?.name){
      if(window.currentLocation.name.includes(locationKeyword)) return true;
    }
    const curLoc = S?.location || '';
    return (typeof curLoc==='string'?curLoc:(curLoc?.name||'')).includes(locationKeyword);
  }catch(e){ return false; }
}
window.hasVisitedLocation = hasVisitedLocation;

export function hasJoinedFaction(factionKeyword){
  try{
    // loadFactionRep()이 실제 존재하는 함수: { '왕국 기사단': 45, ... } 형태로 호감도 저장
    const rep = typeof loadFactionRep==='function' ? loadFactionRep() : {};
    // 호감도 20 이상(우호 이상)이면 가입 상태로 간주
    return Object.keys(rep).some(k=>k.includes(factionKeyword) && rep[k]>=20);
  }catch(e){ return false; }
}
window.hasJoinedFaction = hasJoinedFaction;

export function recordLocationVisit(locationName){
  if(!locationName) return;
  const cond = loadJobUnlockCond();
  if(!cond.visitedLocations) cond.visitedLocations = [];
  if(!cond.visitedLocations.includes(locationName)){
    cond.visitedLocations.push(locationName);
    saveJobUnlockCond(cond);
  }
}
window.recordLocationVisit = recordLocationVisit;

export function getSkillUnlockInfo(sk){
  if(!sk) return {canUnlock:false,reason:'스킬 없음',bypass:false};
  const unlocked=S.unlockedSkills||{}, stats=S.stats||{};
  const titles=loadTitles()||[], lv=loadPlayerLevel()||1;
  const relics=loadOwnedRelics()||[];
  if(unlocked[sk.id]) return {canUnlock:false,reason:'이미 해금됨',unlocked:true};
  const cost=SKILL_TREE_SP_COST(sk);
  if(S.skillSP<cost) return {canUnlock:false,reason:'SP 부족',spShort:true,cost};
  const hasBypass=relics.includes('relic_crown')||relics.includes('relic_grimoire')||relics.includes('relic_sword')||titles.some(t=>['legend','myth','godhood'].includes(t.id));
  const failed=[], statMap={str:'근력',agi:'민첩',end:'인내',mgc:'마법',int:'지성',per:'지각',fath:'신앙',disg:'위장',luk:'행운',wil:'의지'};
  if(sk.req){ if(sk.req.level&&lv<sk.req.level) failed.push('레벨 '+sk.req.level+' 필요'); Object.entries(sk.req).forEach(([k,v])=>{ if(k==='level'||typeof v!=='number') return; if((stats[k]||0)<v) failed.push((statMap[k]||k)+' '+v+' 필요'); }); }
  if(sk.unlockTitle&&!titles.some(t=>t.id===sk.unlockTitle)) failed.push('칭호 필요');
  if(sk.jobRole&&sk.jobRole!=='combo'){ const cur=S.character?.role||'', hist=loadJobHistory()||[]; if(cur!==sk.jobRole&&!hist.some(h=>h.jobName===sk.jobRole)) failed.push('직업: '+sk.jobRole); }
  if(failed.length===0) return {canUnlock:true,bypass:false,cost};
  if(hasBypass) return {canUnlock:true,reason:'아티팩트/칭호로 조건 우회',failed,bypass:true,cost};
  return {canUnlock:false,reason:failed.join(', '),failed,bypass:false,cost};
}
window.getSkillUnlockInfo = getSkillUnlockInfo;

export function doEnhanceSkill(skillId, evt){
  if(evt){ evt.stopPropagation(); }
  const sk = getAllSkillDefs().find(s=>s.id===skillId);
  if(!sk){ toast('스킬을 찾을 수 없습니다'); return; }
  if(!S.unlockedSkills[skillId]){ toast('스킬을 먼저 해금하세요'); return; }
  const result = enhanceSkill(skillId);
  if(!result.success){ toast('⚠️ '+result.reason); return; }
  const colors=['#80c080','#60a0e0','#a060e0','#e06030','#c8a96e'];
  const col = colors[result.newLevel-1] || '#c8a96e';
  const label = result.newLevel >= 5 ? 'MAX' : 'Lv.'+result.newLevel;
  toastHTML(`✨ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)} 강화 → <span style="color:${esc(col)}">${esc(label)}</span>! (${esc(result.tier.desc)})`, 2500);
  window.updateHeader();
  renderSkills();
}
window.doEnhanceSkill = doEnhanceSkill;

export function renderInventory(){
  const body=$('pb-inventory'), goldEl=$('inv-gold');
  if(!body) return;
  if(goldEl) goldEl.textContent=S.gold;

  // 모든 슬롯 초기화
  if(!S.equipped) S.equipped={};
  // 정렬 바 렌더링
  if(typeof renderInvSortBar==='function') renderInvSortBar();
  EQUIP_SLOTS.forEach(s=>{ if(S.equipped[s.id]===undefined) S.equipped[s.id]=null; });

  // 슬롯 섹션 HTML 생성
  const cats = ['weapon','armor','acc'];
  // 세트 보너스 표시
  const {activeSetBonus} = calcSetBonus();
  const activeSets = Object.entries(activeSetBonus);
  let slotHtml = `<div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:1px;margin-bottom:8px">── 장비 슬롯 ──</div>`;
  if(activeSets.length>0){
    slotHtml += `<div style="padding:6px 9px;background:#1a2a0a;border:1px solid #3a5a2a;margin-bottom:8px;border-radius:2px">
      <div style="font-size:9px;color:#60a060;font-family:'Cinzel',serif;margin-bottom:3px">✨ 세트 보너스 활성</div>
      ${activeSets.map(([sid,info])=>`<div style="font-size:9px;color:#4a9a6a">${typeof getEntityIconHTML==='function'?getEntityIconHTML(info,{size:9}):(info.icon)} ${esc(info.name)} ${info.count}/${info.total}</div>`).join('')}
    </div>`;
  }

  // 장비 정체성 부조화 표시
  if(typeof getJobAlignment==='function'){
    const _jobId = (S?.character && (S.character.jobId || S.character.role)) || '';
    const _jobAlign = getJobAlignment(_jobId);
    if(_jobAlign){
      const _val = loadItemDissonance();
      const _stage = getDissonanceStage(_val);
      const _axisDef = ALIGN_AXES[_jobAlign.axis];
      if(_stage.stage > 0){
        const _stageColor = _stage.stage>=3 ? '#e0483c' : _stage.stage===2 ? '#e08030' : '#c8a96e';
        slotHtml += `<div style="padding:6px 9px;background:#1a0805;border:1px solid ${_stageColor}66;margin-bottom:8px;border-radius:2px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
            <span style="font-size:9px;color:${_stageColor};font-family:'Cinzel',serif">${typeof getEntityIconHTML==='function'?getEntityIconHTML(_axisDef,{size:9}):(_axisDef.icon)} 정체성 부조화 — ${_stage.label} (${_stage.stage}/4)</span>
            <span style="font-size:8px;color:var(--dim)">${Math.round(_val)}/100</span>
          </div>
          <div style="height:3px;background:#0d0800;border-radius:2px;margin-bottom:3px"><div style="width:${_val}%;height:100%;background:${_stageColor};border-radius:2px"></div></div>
          <div style="font-size:8px;color:var(--dim)">${esc(_stage.desc)}</div>
        </div>`;
      }
    }
  }

  cats.forEach(cat=>{
    const slots = EQUIP_SLOTS.filter(s=>s.category===cat);
    slotHtml += `<div style="font-size:9px;color:var(--dim);font-family:'Cinzel',serif;letter-spacing:1px;margin-bottom:4px;margin-top:8px">${SLOT_CATEGORY[cat]}</div>`;
    slotHtml += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:4px">`;
    slots.forEach(sl=>{
      const it = S.equipped[sl.id];
      const rc = it ? (RC[it.rarity]||RC.common) : '#2a1a05';
      slotHtml += `<div style="padding:6px 8px;background:#0d0800;border:1px solid ${it?rc+'66':'#1a1005'};border-radius:2px;min-height:48px">
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
          <span style="font-size:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(it||sl,{size:12}):(it?(it.icon||sl.icon):sl.icon)}</span>
          <span style="font-size:8px;color:var(--dim);font-family:'Cinzel',serif">${sl.label}</span>
          ${it?`<button onclick="unequipItem('${sl.id}')" style="margin-left:auto;background:none;border:none;color:#e05050;font-size:9px;cursor:pointer;padding:0">✕</button>`:''}
        </div>
        ${it
          ? `<div style="font-size:9px;color:${rc};line-height:1.3">${esc(it.name)}</div>
             ${it._durability!==undefined&&it._durability<100?`<div style="margin-top:2px"><div style="display:flex;justify-content:space-between;font-size:7px;color:var(--dim)"><span>내구</span><span style="color:${it._durability>50?'#60a060':it._durability>20?'#e08050':'#e05050'}">${it._durability}%</span></div><div style="height:2px;background:#1a1005"><div style="width:${it._durability}%;height:100%;background:${it._durability>50?'#60a060':it._durability>20?'#e08050':'#e05050'}"></div></div></div>`:''}
             ${it.effects?`<div style="font-size:8px;color:#4a6fa5">${Object.entries(it.effects).filter(([k,v])=>v>0).slice(0,3).map(([k,v])=>k.toUpperCase()+'+'+v).join(' ')}</div>`:''}`
          : `<div style="font-size:9px;color:#2a1a05">비어 있음</div>`
        }
      </div>`;
    });
    slotHtml += `</div>`;
  });

  slotHtml += `<div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:1px;margin:10px 0 7px">── 인벤토리 ──</div>`;

  // 정렬/필터 적용
  const _invDisplay = typeof getSortedFilteredInv==='function' ? getSortedFilteredInv() : (S.inventory||[]);
  if(!_invDisplay.length){
    body.innerHTML = slotHtml + '<div style="text-align:center;padding:12px;color:var(--dim);font-size:11px">인벤토리가 비어 있습니다</div>';
    return;
  }

  // 합성 버튼
  const fusionBtn = `<button class="btn btn-dark" style="width:100%;padding:8px;font-size:9px;margin-bottom:8px" onclick="fusionItems()">⚗️ 같은 아이템 3개 합성 (등급 상승)</button>`;
  body.innerHTML = slotHtml + fusionBtn + S.inventory.map((item,i)=>{
    const rc = RC[item.rarity]||RC.common;
    const sl = getItemSlot(item);
    const slotDef = EQUIP_SLOTS.find(s=>s.id===sl);
    const isEquipType = item.type==='equip';
    const isEquipped = isEquipType && S.equipped[sl] && S.equipped[sl]._invIdx===i;
    // ring2 체크
    const isEquippedRing2 = sl==='ring1' && S.equipped['ring2'] && S.equipped['ring2']._invIdx===i;
    const actualEquipped = isEquipped || isEquippedRing2;
    return `<div class="inv-item" style="border-color:${rc}44${actualEquipped?';background:#1a1505':''}">
      <span style="font-size:19px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:19}):(item.icon||'📦')}</span>
      <div style="flex:1;min-width:0">
        <div style="font-family:'Cinzel',serif;font-size:10px;color:${rc}">${esc(item.name)}${actualEquipped?` <span style="color:#c8a96e;font-size:8px">[장착중]</span>`:''}</div>
        <div style="font-size:9px;color:var(--dim)">${esc(item.desc||'')}</div>
        ${item.lore?`<div style="font-size:9px;color:#5a4a2a;font-style:italic;line-height:1.5;margin-top:3px;border-left:2px solid #3a2a0a;padding-left:5px">${esc(item.lore)}</div>`:''}
        ${item.effects?`<div style="font-size:9px;color:#4a6fa5;margin-top:1px">${Object.entries(item.effects).map(([k,v])=>k.toUpperCase()+(v>0?'+':'')+v).join(' · ')}</div>`:''}
        ${slotDef?`<div style="font-size:8px;color:#3a2a0a;margin-top:1px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(slotDef,{size:8}):(slotDef.icon)} ${slotDef.label}</div>`:''}
      </div>
      <div style="display:flex;flex-direction:column;gap:3px;flex-shrink:0">
        ${item.type==='consume'?`<button class="inv-use" onclick="useItem(${i})">사용</button>`:''}
        ${isEquipType&&!actualEquipped?`<button class="inv-use" style="background:#1a2a0a;border-color:#3a5a1a;color:#80c040;font-size:9px;padding:3px 7px" onclick="(typeof showItemCompare==='function'&&it&&(it.slot||it.type)&&S.equipped)?showItemCompare(it):equipItem(${i})">장착</button>`:''}
        ${isEquipType&&actualEquipped?`<button class="inv-use" style="background:#2a0a0a;border-color:#5a2020;color:#e05050;font-size:9px;padding:3px 7px" onclick="unequipItem('${sl}')">해제</button>`:''}
        ${isEquipType?`<button class="inv-use" style="background:#0a1a2a;border-color:#1a3a5a;color:#4a8ac8;font-size:9px;padding:3px 7px" onclick="enhanceItem(${i})">+강화</button>`:''}
        <button class="inv-use" style="background:#1a0a0a;border-color:#3a1a1a;color:#c06040;font-size:9px;padding:3px 7px" onclick="sellItem(${i})">판매</button>
      </div>
    </div>`;
  }).join('');
}
window.renderInventory = renderInventory;

export function equipItem(idx){
  const item=S.inventory[idx]; if(!item||item.type!=='equip') return;
  const sl = getItemSlot(item);
  if(!S.equipped) S.equipped={};

  // 반지는 빈 슬롯 찾아서 장착
  let targetSlot = sl;
  if(sl==='ring1'){
    if(S.equipped['ring1'] && !S.equipped['ring2']) targetSlot='ring2';
    else if(S.equipped['ring2'] && !S.equipped['ring1']) targetSlot='ring1';
    else targetSlot='ring1';
  }

  // 기존 장착 해제
  const prev=S.equipped[targetSlot];
  if(prev&&prev.effects){ Object.entries(prev.effects).forEach(([k,v])=>{ if(S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v); }); }

  // 새 아이템 장착
  if(item.effects){ Object.entries(item.effects).forEach(([k,v])=>{ if(S.stats[k]!==undefined) S.stats[k]=Math.min(999,S.stats[k]+v); }); }
  S.equipped[targetSlot]={...item, _invIdx:idx};
  saveEquipped(S.equipped);
  applySetBonus(); // 세트 보너스 재계산
  if(typeof onEquipmentAlignmentChanged==='function') onEquipmentAlignmentChanged(); // 정체성 부조화 재계산
  window.updateHeader();
  const slotDef=EQUIP_SLOTS.find(s=>s.id===targetSlot);
  // 세트 달성 체크
  const {activeSetBonus} = calcSetBonus();
  const newSet = Object.entries(activeSetBonus).find(([,v])=>v.count===parseInt(Object.keys(SET_DEFS[Object.keys(activeSetBonus)[0]]?.bonus||{})[0]));
  toast(`${item.name} → ${slotDef?.label||targetSlot} 장착!`, undefined, item);
  renderInventory();
}
window.equipItem = equipItem;

export function unequipItem(sl){
  if(!S.equipped) return;
  const prev=S.equipped[sl]; if(!prev) return;
  if(prev.effects){ Object.entries(prev.effects).forEach(([k,v])=>{ if(S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v); }); }
  S.equipped[sl]=null;
  saveEquipped(S.equipped);
  applySetBonus(); // 세트 보너스 재계산
  if(typeof onEquipmentAlignmentChanged==='function') onEquipmentAlignmentChanged(); // 정체성 부조화 재계산
  window.updateHeader();
  toast(`${prev.name} 해제`, undefined, prev);
  renderInventory();
}
window.unequipItem = unequipItem;

export function useItem(idx){
  const item=S.inventory[idx]; if(!item||item.type!=='consume') return;
  if(item.effects){
    Object.entries(item.effects).forEach(([k,v])=>{
      // [D11 FIX] gold는 S.stats에 속하지 않는 최상위 필드라 조용히 무시되던
      // 것을 특수 케이스로 처리(예: relic_lucky_coin의 effects.gold:100).
      if(k==='gold'){ S.gold=(S.gold||0)+v; if(typeof saveGold==='function') saveGold(S.gold); return; }
      if(S.stats[k]!==undefined){
        // [F-3 FIX] hp/mp는 최대치 상한 적용, 나머지 스탯도 999 상한
        if(k==='hp') S.stats.hp = Math.min(S.stats.maxHp||999, Math.max(0, S.stats.hp+v));
        else if(k==='mp') S.stats.mp = Math.min(S.stats.maxMp||999, Math.max(0, S.stats.mp+v));
        else S.stats[k]=Math.min(999,Math.max(0,S.stats[k]+v));
      }
    });
    window.updateHeader();
  }

  // ── 특정 아이템 사용 시 SP 지급 ──────────────────────────
  // 희귀도별 SP 보상 (스킬 관련 소모품만)
  const SP_ITEM_KEYWORDS = /마법서|비전서|스킬북|기술서|무공서|비급|주문서|계시록|각성석|능력 결정|지식의|비밀 문서|고대 서판|봉인된 지식|깨달음/;
  if(SP_ITEM_KEYWORDS.test(item.name) || item._spReward){
    const spGain = item._spReward || (item.rarity==='primal'?5 : item.rarity==='legendary'?3 : item.rarity==='rare'?2 : item.rarity==='uncommon'?1 : 0);
    if(spGain > 0){
      S.skillSP = (S.skillSP||0) + spGain;
      saveSkillSP(S.skillSP);
      toast(`📖 ${item.name} 습득 완료! 스킬 포인트 +${spGain} SP`, 3000);
    }
  }
  // 희귀/전설 등급 소모품은 소량 SP 지급 (각성 유물 등)
  else if((item.rarity==='primal' || item.rarity==='legendary' || item.rarity==='rare') && item.type==='consume'){
    const spGain = item.rarity==='primal' ? 4 : item.rarity==='legendary' ? 2 : 1;
    S.skillSP = (S.skillSP||0) + spGain;
    saveSkillSP(S.skillSP);
    setTimeout(()=> toast(`✨ 희귀 아이템 효과: 스킬 포인트 +${spGain} SP`, 2500), 800);
  }

  // 장착된 아이템의 _invIdx 재조정 (삭제된 인덱스 이후)
  if(S.equipped){ Object.keys(S.equipped).forEach(sl=>{ if(S.equipped[sl]&&S.equipped[sl]._invIdx>idx) S.equipped[sl]._invIdx--; }); saveEquipped(S.equipped); }
  S.inventory.splice(idx,1); saveInventory(S.inventory);
  toast('✅ '+item.icon+' '+item.name+' 사용!'); renderInventory();
}
window.useItem = useItem;

export function renderShop(){
  const body=$('pb-shop'), goldEl=$('shop-gold');
  if(!body) return;
  if(goldEl) goldEl.textContent=S.gold;

  const loc = loadCurrentLocation();
  const locName = loc ? loc.name : '일반 상점';

  // 로딩 표시 후 동적 재고 로드
  body.innerHTML='<div style="text-align:center;padding:18px;color:var(--dim);font-size:11px">⚙ 재고 확인 중...</div>';
  getDynamicShopStock().then(items=>{
    _renderShopItems(items, locName, loc);
  }).catch(()=>{
    _renderShopItems(getShopStock(), locName, loc);
  });
}
window.renderShop = renderShop;

export function _renderShopItems(items, locName, loc){
  const body=$('pb-shop'), goldEl=$('shop-gold');
  if(!body) return;
  if(goldEl) goldEl.textContent=S.gold;

  if(!items.length){
    body.innerHTML='<div style="text-align:center;padding:18px;color:var(--dim);font-size:11px">상품이 없습니다</div>';
    return;
  }

  // 상점 재고를 임시 저장
  window._shopItems = items;
  const modifier = loc?.priceModifier||1.0;
  const modText = modifier>1.0?'<span style="color:#e05a5a;font-size:9px"> ↑ 비쌈</span>':modifier<1.0?'<span style="color:#60a060;font-size:9px"> ↓ 저렴</span>':'';

  if(!items.length){
    body.innerHTML='<div style="text-align:center;padding:18px;color:var(--dim);font-size:11px">상품이 없습니다</div>';
    return;
  }

  body.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);margin-bottom:8px;letter-spacing:1px">
      🏪 ${esc(locName)}${modText}
    </div>` +
  items.map((item,i)=>{
    const rc = RC[item.rarity]||RC.common;
    const afford = S.gold >= item.price;
    const slotDef = EQUIP_SLOTS.find(s=>s.id===item.slot);
    return `<div class="shop-item" style="opacity:${afford?1:0.5}">
      <span style="font-size:19px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:19}):(item.icon||'📦')}</span>
      <div style="flex:1;min-width:0">
        <div style="font-family:'Cinzel',serif;font-size:10px;color:${rc}">${esc(item.name)}</div>
        <div style="font-size:9px;color:var(--dim)">${esc(item.desc||'')}</div>
        ${item.lore?`<div style="font-size:9px;color:#5a4a2a;font-style:italic;line-height:1.5;margin-top:3px;border-left:2px solid #3a2a0a;padding-left:5px">${esc(item.lore)}</div>`:''}
        ${item.effects?`<div style="font-size:9px;color:#4a6fa5">${Object.entries(item.effects).filter(([k,v])=>v>0).map(([k,v])=>k.toUpperCase()+'+'+v).join(' · ')}</div>`:''}
        ${slotDef?`<div style="font-size:8px;color:#3a2a0a">${typeof getEntityIconHTML==='function'?getEntityIconHTML(slotDef,{size:8}):(slotDef.icon)} ${slotDef.label}</div>`:''}
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-family:'Cinzel',serif;font-size:10px;color:#f1c40f">💰${item.price}</div>
        <button class="btn btn-gold" style="padding:3px 8px;font-size:9px;margin-top:4px" onclick="buyShopItem(${i})" ${afford?'':'disabled'}>구매</button>
      </div>
    </div>`;
  }).join('') +
  // ── 설계도 상점 섹션 ──
  `<div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin:14px 0 6px;letter-spacing:1px;border-top:1px solid var(--border);padding-top:10px">📜 설계도 상점</div>
  <div style="font-size:9px;color:var(--dim);margin-bottom:8px">설계도 보유 시 제작 패널에서 제작 가능. 전설/레이드 등급은 상점 구매 불가.</div>` +
  (()=>{
    const ownedBps = new Set(loadBlueprints());
    const rarityColor = {common:'#8a9a8a',uncommon:'#4a9a6a',rare:'#4a6fa5',epic:'#9060c0',legendary:'#c8a96e',primal:'#e0483c'};
    const rarityLabel = {common:'일반',uncommon:'고급',rare:'희귀',epic:'영웅',legendary:'전설',primal:'태초'};
    return Object.entries(BLUEPRINT_SHOP)
      .filter(([,bp])=>bp.howToGet.includes('shop')&&bp.price>0)
      .map(([bpId,bp])=>{
        const owned = ownedBps.has(bpId);
        const afford = S.gold >= bp.price;
        const rc = rarityColor[bp.rarity]||'#8a9a8a';
        return `<div style="padding:6px 9px;background:#0d0800;border:1px solid ${owned?'#3a5a2a':'var(--border)'};margin-bottom:3px;display:flex;align-items:center;gap:6px;opacity:${owned||afford?1:0.5}">
          <span style="font-size:12px">📜</span>
          <div style="flex:1">
            <div style="font-size:9px;color:${rc}">${esc(bp.name)}</div>
            <div style="font-size:8px;color:var(--dim)">[${rarityLabel[bp.rarity]||bp.rarity}]</div>
          </div>
          ${owned
            ? `<span style="font-size:9px;color:#60a060">✓ 보유</span>`
            : `<div style="text-align:right"><div style="font-size:9px;color:#f1c40f">💰${bp.price}</div><button class="btn btn-gold" style="padding:2px 7px;font-size:8px;margin-top:2px" onclick="buyBlueprint('${bpId}')" ${afford?'':'disabled'}>구매</button></div>`
          }
        </div>`;
      }).join('');
  })() +
  `<button class="btn btn-dark" style="width:100%;padding:8px;font-size:9px;margin-top:10px" onclick="refreshShop()">🔄 재고 새로고침</button>`;
}
window._renderShopItems = _renderShopItems;

export function buyShopItem(idx){
  const items = window._shopItems || getShopStock();
  const item = items[idx];
  if(!item){ toast('아이템을 찾을 수 없습니다'); return; }
  if(S.gold < item.price){ toast('골드가 부족합니다'); return; }
  S.gold -= item.price;
  saveGold(S.gold);
  const inv = {...item};
  delete inv.price;
  S.inventory.push(inv);
  saveInventory(S.inventory);
  window.updateHeader();
  toastHTML(`✅ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon)} ${esc(item.name)} 구매! (-💰${esc(item.price)})`, 2500);
  renderShop();
}
window.buyShopItem = buyShopItem;

window._shopStock = null;

export function refreshShop(){
  window._shopStock = null;
  renderShop();
  toast('🔄 재고 새로고침', 1500);
}
window.refreshShop = refreshShop;

export function renderHighlights(){
  const body=$('pb-highlights'); if(!body) return;
  const hl=loadHighlights();
  if(!hl.length){ body.innerHTML='<div style="text-align:center;padding:18px;color:var(--dim);font-size:11px">아직 명장면이 없습니다</div>'; return; }
  body.innerHTML=[...hl].reverse().map(h=>`
    <div class="hl-card" style="border-color:${h.type==='crit_success'?'var(--gold)':'#e74c3c'}">
      <div style="font-size:9px;color:var(--dim);margin-bottom:3px;font-family:'Cinzel',serif">${h.type==='crit_success'?'✨ 대성공':'💥 대실패'} · 턴 ${h.turn}</div>
      <div style="font-size:12px;color:var(--text);line-height:1.5">${esc(h.text)}...</div>
    </div>`).join('');
}
window.renderHighlights = renderHighlights;

export function applyWeatherStats(){
  try {
    const prev = S._weatherStatBonus || {};
    // 이전 보정 제거
    Object.entries(prev).forEach(([k,v])=>{
      if(S.stats[k]!==undefined) S.stats[k] = Math.max(0, S.stats[k] - v);
    });
    const mods = getWeatherStatMods();
    const combined = mods.combined || {};
    const newBonus = {};
    Object.entries(combined).forEach(([k,v])=>{
      if(v && S.stats[k]!==undefined){
        S.stats[k] = Math.min(999, Math.max(0, S.stats[k] + v));
        newBonus[k] = v;
      }
    });
    S._weatherStatBonus = newBonus;
    if(typeof saveStats==='function') saveStats(S.stats);
  _markDirty('stats'); if(typeof saveStatsSplit==='function') saveStatsSplit();
    window.updateHeader();
  } catch(e) {}
}
window.applyWeatherStats = applyWeatherStats;

window.applyWeatherStats = applyWeatherStats;

export function saveMemPanel(){
  const core=($('mem-core')||$('mem-core-legacy'))?.value||'', mid=($('mem-mid')||$('mem-mid-legacy'))?.value||'';
  saveMemory({...loadMemory(),core,mid,coreUpdatedAt:Date.now(),midUpdatedAt:Date.now()});
  toast('✅ 기억 저장됨'); closeP('memory');
}
window.saveMemPanel = saveMemPanel;

window._dynQuestCooldown = 0;

window._lastSQuestTurn = -999;

window._lastAQuestTurn = -50;

window._questGenBusy = false;

export function analyzeQuestNeed(){
  if(!S?.character || !S?.stats) return null;

  const char     = S.character;
  const rankId   = (char.socialRankId||'commoner').toLowerCase();
  const role     = (char.role||'').toLowerCase();
  const bg       = (char.background||'').toLowerCase();
  const scenario = (char.scenario||'').toLowerCase();
  const turn     = S.msgCount || 0;
  const recentText = (S.messages||[]).slice(-3).map(m=>m.content||'').join(' ').toLowerCase();

  const active = loadDynQuests().filter(q=>q.status==='active');
  const activeS = active.filter(q=>q.grade==='S').length;
  const activeA = active.filter(q=>q.grade==='A').length;

  // ── S등급 트리거: 신분/상황 정체성과 직결된 서사 퀘스트 ──
  // S등급은 아직 없거나 완료됐을 때 + 서사적 맥락이 충분할 때만
  const sGradeCooldown = 40; // S등급은 40턴 이후 재생성 가능
  const canGenerateS = activeS < QUEST_GRADES.S.maxActive && (turn - window._lastSQuestTurn) > sGradeCooldown;

  if(canGenerateS){
    // 신분 기반 핵심 서사 트리거
    if(/노예|slave|포로|죄수|죄인/.test(rankId+' '+bg)){
      // 탈출/해방 퀘스트 — 노예 신분이면 3턴 이후 즉시 생성
      if(turn >= 3) return { grade:'S', contextType:'slave_escape',
        hint:'노예·죄수 신분에서 탈출, 해방, 자유를 쟁취하는 서사 핵심 퀘스트. 탈옥, 신분 세탁, 조력자 확보, 추격 회피 등을 포함할 것' };
    }
    if(/무법자|outlaw|도적|현상금/.test(rankId+' '+bg)){
      if(turn >= 5) return { grade:'S', contextType:'outlaw_survival',
        hint:'현상금 사냥꾼에게 쫓기거나 오해를 풀거나, 진짜 악인을 밝혀 명예를 회복하는 서사 핵심 퀘스트' };
    }
    if(/복수|원수|원한|배신|망한|멸문|죽인/.test(bg)){
      if(turn >= 5) return { grade:'S', contextType:'revenge',
        hint:'캐릭터 배경의 원한·배신·멸문 등 핵심 동기에서 비롯된 복수 서사 퀘스트. 단순 전투가 아닌 진실 추적과 감정 깊이를 담을 것' };
    }
    if(/예언|선택받|운명|저주|혈통|각성/.test(bg+' '+recentText)){
      if(turn >= 8) return { grade:'S', contextType:'destiny',
        hint:'예언·혈통·운명에 관한 핵심 서사 퀘스트. 주인공이 자신의 정체와 역할을 자각하는 전환점이 될 것' };
    }
    // 최근 서사에서 S등급 트리거 감지
    if(/세계.*위기|마왕|봉인.*풀|신.*잠에서|재앙.*징조|멸망/.test(recentText) && turn >= 10){
      return { grade:'S', contextType:'world_crisis',
        hint:'세계적 위기·마왕·봉인 해제 등 거대 서사 핵심 퀘스트. 주인공이 이 사건에 어떻게 개입할지 선택하는 갈림길' };
    }
  }

  // ── A등급 트리거: 중요 NPC·세력·사건 관련 ──
  const aGradeCooldown = 15; // A등급은 15턴 후 재생성
  const canGenerateA = activeA < QUEST_GRADES.A.maxActive && (turn - window._lastAQuestTurn) > aGradeCooldown;

  if(canGenerateA){
    // 최근 서사에서 A등급 트리거 감지
    if(/세력.*갈등|전쟁.*소식|반란|음모|암살/.test(recentText)){
      return { grade:'A', contextType:'faction_event',
        hint:'세력 갈등·전쟁·반란·음모 등 중요 사건에 플레이어가 개입하는 퀘스트. 선택에 따라 세력 관계가 변화함' };
    }
    if(/비밀.*드러|진실.*숨겨|의문.*죽음|실종|조사/.test(recentText)){
      return { grade:'A', contextType:'investigation',
        hint:'의문스러운 죽음·실종·비밀 폭로 등을 조사하는 중요 퀘스트. 단서를 따라가다 더 큰 음모가 드러남' };
    }
    if(/동료.*위험|동료.*납치|동료.*다쳤|중요한.*사람/.test(recentText)){
      return { grade:'A', contextType:'rescue',
        hint:'중요 NPC나 동료가 위기에 처한 구조 퀘스트. 시간 제한이 있고 선택에 따라 결과가 크게 달라짐' };
    }
    // 일정 턴마다 세계관 사건 기반 A등급 생성
    if(turn >= 10 && Math.random() < 0.4){
      return { grade:'A', contextType:'world_event',
        hint:'현재 세계관의 중요 사건(축제·재판·습격·유물 발견 등)에서 비롯된 퀘스트. 주인공의 명성에 영향을 줌' };
    }
  }

  // ── B등급 이하: 일반 사이드 퀘스트 ──
  const activeTotal = active.length;
  if(activeTotal >= 4) return null; // 퀘스트가 4개 이상이면 생성 안 함

  // 최근 서사 키워드 기반 B등급
  if(/상인|물건.*찾|재료.*구해|약초|광물|부탁/.test(recentText) && Math.random() < 0.35){
    return { grade:'B', contextType:'fetch',
      hint:'아이템 수집·심부름 의뢰. 간단하지만 보상이 있고 상인/NPC와 관계가 쌓임' };
  }
  if(/몬스터.*출몰|위험한.*숲|던전.*소문|토벌/.test(recentText) && Math.random() < 0.35){
    return { grade:'B', contextType:'combat',
      hint:'인근 몬스터 토벌·위험 지역 탐색 의뢰. 전투 중심이지만 배경 정보가 포함됨' };
  }

  // 랜덤 C등급 생성 (낮은 확률, 맥락 무관)
  if(Math.random() < 0.08) return { grade:'C', contextType:'misc',
    hint:'소소한 심부름이나 분위기 퀘스트. 짧고 가볍게 해결 가능하며 세계관 분위기를 살려줌' };

  return null;
}
window.analyzeQuestNeed = analyzeQuestNeed;

export function shouldAutoGenerateQuest(){
  if(!S?.character || !S?.stats) return false;
  if(window._questGenBusy) return false;
  // 최소 2턴 이후부터 허용
  if((S.msgCount||0) < 2) return false;
  return analyzeQuestNeed() !== null;
}
window.shouldAutoGenerateQuest = shouldAutoGenerateQuest;

// ══════════════════════════════════════════════════════════════════
// 로컬 퀘스트 생성 엔진 (AI 미사용) — 퀘스트를 발생시킨 상황(contextType,
// 예: slave_escape/revenge/investigation/combat 등)을 게임 타입(q.type:
// combat/explore/dialog/fetch/protect/mystery/escort/craft/escape/
// survival)으로 매핑하고, 타입별 제목·설명·완료조건·로어 뱅크를
// 등급(S~D — 이미 이 파일 위에 정의된 gradeDesc 톤)과 조합한다.
// ══════════════════════════════════════════════════════════════════
const QUEST_CONTEXT_TO_TYPE = {
  slave_escape: 'escape', outlaw_survival: 'survival', revenge: 'combat',
  destiny: 'mystery', world_crisis: 'protect', faction_event: 'dialog',
  investigation: 'mystery', rescue: 'protect', world_event: 'explore',
  fetch: 'fetch', combat: 'combat', npc_trigger: 'dialog',
};
const QUEST_TYPE_LIST = ['combat','explore','dialog','fetch','protect','mystery','escort','craft','escape','survival'];
const QUEST_TYPE_ICON = { combat:'⚔️', explore:'🧭', dialog:'💬', fetch:'📦', protect:'🛡️', mystery:'❓', escort:'🚶', craft:'🔨', escape:'🏃', survival:'⏳' };
const QUEST_TITLE_BANK = {
  combat:   ['위협의 근원','숨어있는 적','토벌 의뢰','그림자의 습격','피의 대가','마지막 저항','숨통을 끊어라','정면 돌파'],
  explore:  ['미지의 흔적','잊혀진 장소','탐사 요청','지도 밖의 땅','첫 발자국','흔적을 좇아','잠든 유적','낯선 길목'],
  dialog:   ['전할 말','오해를 풀며','진심을 담아','얽힌 사연','숨겨둔 진심','마음을 여는 법','돌아온 인연','조용한 부탁'],
  fetch:    ['찾아야 할 물건','잃어버린 것','수집 의뢰','손에 넣어야 할 것','사라진 흔적','뒤쫓는 물건','값진 대가','은밀한 거래'],
  protect:  ['지켜야 할 이','호위 임무','위험으로부터','방패가 되어','마지막 보루','무사히 지켜라','위태로운 목숨','숨겨야 할 존재'],
  mystery:  ['풀리지 않는 수수께끼','기묘한 사건','석연찮은 소문','감춰진 진실','어긋난 조각들','말 못할 비밀','뒤틀린 소문','드러나지 않은 것'],
  escort:   ['안전한 길','동행 의뢰','목적지까지','위험한 여정','발맞춰 걷다','끝까지 함께','길잡이의 의무','무사 귀환'],
  craft:    ['제작 의뢰','필요한 물건','장인의 부탁','솜씨를 시험하다','정성 들인 작품','주문받은 물건','장인의 자존심','마무리의 손길'],
  escape:   ['탈출로','벗어나야 할 곳','도주 의뢰','마지막 기회','포위망을 뚫고','그림자 속으로','자유를 향해','추적을 따돌리며'],
  survival: ['버텨내야 할 시간','생존의 기로','한계를 넘어','끝나지 않는 밤','마지막 한 걸음','버림받은 자리','견뎌야 할 고통','살아남을 방법'],
};
const QUEST_DESC_BANK = {
  combat:   ['근방에 위협이 되는 존재를 처치해야 한다.','피해가 커지기 전에 문제의 근원을 없애야 한다.','더 이상 방치할 수 없는 위험이 도사리고 있다.','힘을 앞세운 자를 그대로 둘 수는 없다.','사람들을 위협하는 무리를 상대해야 한다.','칼을 뽑아야 할 순간이 다가오고 있다.','누군가는 나서서 이 위협을 끝내야 한다.','물러설수록 피해는 배로 불어날 것이다.'],
  explore:  ['아직 아무도 밟지 않은 곳을 살펴봐야 한다.','알려지지 않은 장소의 실체를 확인해야 한다.','기록에도 없는 곳을 직접 확인할 필요가 있다.','소문으로만 떠도는 장소를 직접 눈으로 봐야 한다.','지도에 없는 길을 따라가야 할 때가 있다.','누구도 확인하지 못한 것을 밝혀내야 한다.','발길이 끊긴 곳에 무엇이 남았는지 알아야 한다.','호기심만으로는 부족한, 실질적인 확인이 필요하다.'],
  dialog:   ['누군가에게 반드시 전해야 할 말이 있다.','오해를 풀기 위해 직접 대화가 필요하다.','말 한마디가 상황을 크게 바꿀 수 있다.','침묵보다는 솔직한 말이 나을 때가 있다.','서로의 입장을 확인할 자리가 필요하다.','마음에 담아둔 말을 꺼내야 할 순간이다.','어긋난 사이를 풀 실마리는 대화뿐이다.','전하지 않으면 후회할 말이 있다.'],
  fetch:    ['잃어버린 물건을 되찾아야 한다.','반드시 필요한 것을 구해와야 한다.','누군가 애타게 찾고 있는 물건이 있다.','손에 넣기까지 만만치 않은 여정이 될 것이다.','어디 있는지조차 모르는 것을 찾아야 한다.','값을 매기기 힘든 물건이 걸려 있다.','제때 구하지 못하면 곤란해질 것이다.','누군가의 손에서 되찾아와야 하는 물건이다.'],
  protect:  ['위험에 처한 이를 지켜야 한다.','누군가의 안전이 걸린 일이다.','지키지 못하면 돌이킬 수 없는 일이 벌어진다.','한시도 방심할 수 없는 경계가 필요하다.','누군가의 목숨이 온전히 그 손에 달려 있다.','위협이 언제 닥칠지 알 수 없는 상황이다.','지켜야 할 것을 끝까지 놓지 말아야 한다.','작은 방심이 큰 화를 부를 수 있다.'],
  mystery:  ['앞뒤가 맞지 않는 사건의 진상을 밝혀야 한다.','석연찮은 소문의 진위를 확인해야 한다.','겉보기와 다른 무언가가 숨겨져 있다.','누구도 속 시원히 설명하지 못하는 일이 있다.','사소해 보이는 단서 하나가 실마리가 될지 모른다.','진실을 파헤치려는 자에게는 위험이 따른다.','밝혀지지 않은 진실이 누군가를 괴롭히고 있다.','겉으로 드러난 것만이 전부는 아니다.'],
  escort:   ['목적지까지 무사히 데려다줘야 한다.','길 위의 위험으로부터 지켜내야 한다.','동행하는 내내 방심할 수 없다.','낯선 길일수록 신중함이 필요하다.','함께하는 이의 안전이 최우선이다.','예상치 못한 위험이 도사릴 수 있다.','목적지에 닿을 때까지 긴장을 놓지 말아야 한다.','동행자의 걸음에 맞춰 나아가야 한다.'],
  craft:    ['필요한 것을 직접 만들어내야 한다.','장인의 솜씨가 필요한 부탁이다.','손끝의 정성이 결과를 좌우할 것이다.','재료를 모으는 것부터가 쉽지 않은 일이다.','세심한 손길이 필요한 작업이다.','제대로 된 것을 만들어내야 인정받을 수 있다.','주문한 이의 기대에 부응해야 한다.','서두르면 그르치는 섬세한 일이다.'],
  escape:   ['위험한 곳에서 무사히 벗어나야 한다.','시간이 얼마 남지 않았다.','붙잡히기 전에 빠져나가야 한다.','한 걸음이라도 늦으면 돌이킬 수 없다.','추격의 눈길을 피해야 한다.','무사히 빠져나갈 길을 찾아야 한다.','붙잡히는 순간 모든 게 끝이다.','서두르되 침착함을 잃지 말아야 한다.'],
  survival: ['정해진 시간을 버텨내야 한다.','한계까지 몰아붙이는 상황을 이겨내야 한다.','포기하지 않고 끝까지 버텨야 한다.','몸도 마음도 한계에 다다른 상태다.','버티는 것 자체가 이미 큰 싸움이다.','끝이 보이지 않아도 나아가야 한다.','쓰러지는 순간 모든 것이 무너진다.','살아남는 것만으로도 값진 일이다.'],
};
const QUEST_KEYWORD_BANK = {
  combat:   { complete:['처치','쓰러뜨렸','물리쳤'], fail:['놓쳤','실패','도망'] },
  explore:  { complete:['발견','확인했','찾아냈'], fail:['길을 잃','포기','실패'] },
  dialog:   { complete:['전했','설득','대화를 마쳤'], fail:['거절당했','실패','오해가 깊어'] },
  fetch:    { complete:['구했','되찾았','손에 넣었'], fail:['잃어버렸','놓쳤','실패'] },
  protect:  { complete:['지켜냈','무사히','보호했'], fail:['다쳤','잃었','실패'] },
  mystery:  { complete:['밝혀냈','진상을 알','해결했'], fail:['미궁','포기','실패'] },
  escort:   { complete:['도착했','무사히 데려','호위를 마쳤'], fail:['습격당했','놓쳤','실패'] },
  craft:    { complete:['완성했','제작을 마쳤','만들어냈'], fail:['실패했','망쳤','포기'] },
  escape:   { complete:['탈출했','빠져나왔','벗어났'], fail:['붙잡혔','갇혔','실패'] },
  survival: { complete:['버텨냈','살아남았','견뎌냈'], fail:['쓰러졌','실패','포기'] },
};
const QUEST_LORE_BANK = {
  combat: ['위협이 방치될수록 피해는 커지기 마련이다.','칼을 뽑는 데는 그만한 이유가 있는 법이다.','힘없는 자들은 누군가의 용기에 기대어 산다.','싸움을 피할 수 없다면 제대로 맞서야 한다.','위험을 외면한 대가는 언젠가 되돌아온다.'],
  explore: ['기록되지 않은 곳에는 늘 사연이 숨어 있다.','아무도 가지 않은 길에는 그만한 이유가 있을지 모른다.','세상은 아직 다 밝혀지지 않은 곳투성이다.','오래된 흔적은 말없이도 많은 것을 전한다.','발견은 늘 작은 호기심에서 시작된다.'],
  dialog: ['말 한마디가 관계의 방향을 바꾸기도 한다.','진심은 결국 전해지기 마련이다.','침묵이 길어질수록 오해도 깊어진다.','누군가에게는 그 한마디가 전부일 수 있다.','말로 풀리지 않는 매듭은 드물다.'],
  fetch: ['누군가에게는 사소해 보여도 다른 이에겐 절실한 법이다.','잃어버린 것의 가치는 되찾을 때 비로소 드러난다.','누군가의 절실함이 부탁이 되어 돌아온다.','작은 물건 하나에도 사연이 담겨 있다.','찾는 이의 마음이 간절할수록 발걸음도 무거워진다.'],
  protect: ['지키는 자가 있어야 지켜지는 것들이 있다.','지켜야 할 이유가 있는 자는 강해지기 마련이다.','누군가의 하루는 그렇게 지켜져 이어진다.','위험 앞에서 등을 돌리지 않는 이가 있다.','평온함은 누군가의 경계 위에 서 있다.'],
  mystery: ['이상한 일에는 대개 그럴 만한 이유가 있다.','진실은 언젠가 스스로 모습을 드러낸다.','캐물을수록 더 깊은 의문이 따라온다.','모든 소문에는 씨앗이 되는 사실이 있다.','수수께끼는 풀리기 전까지 사람을 붙잡아 둔다.'],
  escort: ['길 위에서는 무슨 일이 벌어질지 아무도 모른다.','함께 걷는 길은 혼자 걷는 길보다 무겁다.','무사히 도착하는 것, 그것만으로도 충분한 보람이다.','길동무의 안전이 곧 여정의 목적이 된다.','평탄해 보이는 길도 끝까지 가봐야 아는 법이다.'],
  craft: ['정성이 담긴 것은 결과로 드러나기 마련이다.','손끝에서 태어난 것은 오래도록 남는다.','정성을 들인 물건은 말이 없어도 티가 난다.','서두른 솜씨는 결국 티가 나기 마련이다.','누군가의 필요가 장인의 손을 움직인다.'],
  escape: ['벗어나야 할 때를 놓치면 돌이킬 수 없다.','벗어나려는 마음이 간절할수록 길은 열리기 마련이다.','위기의 순간에도 침착함이 살길을 만든다.','도망친다고 해서 부끄러운 것은 아니다.','살아남는 것이 먼저, 나머지는 그 다음이다.'],
  survival: ['버텨낸 자만이 다음을 기약할 수 있다.','버텨낸 시간은 결코 헛되지 않는다.','한계는 넘어서는 순간 새로운 시작이 된다.','살아남은 자만이 이야기를 남길 수 있다.','끝까지 버틴 이에게는 그만한 몫이 돌아온다.'],
};
const QUEST_AI_HINT_BANK = {
  combat:'전투의 긴장감과 위험을 생생하게 묘사하라.', explore:'미지의 장소를 탐색하는 호기심과 긴장을 살려라.',
  dialog:'대화의 뉘앙스와 감정선을 세심하게 그려라.', fetch:'물건을 찾는 과정의 우여곡절을 담아라.',
  protect:'보호 대상의 안위에 대한 긴장감을 유지하라.', mystery:'단서가 하나씩 드러나는 전개로 호기심을 자극하라.',
  escort:'이동 중 발생하는 돌발 상황을 자연스럽게 녹여라.', craft:'제작 과정의 디테일과 정성을 묘사하라.',
  escape:'시간 압박과 긴박감을 살려서 묘사하라.', survival:'한계에 몰린 상황의 절박함을 그려라.',
};
const QUEST_GRADE_INTENSITY = {
  S:'이 세계의 향방을 좌우할 만큼 중대한 사안이다.', A:'많은 이들의 이목이 쏠려 있는 중요한 사안이다.',
  B:'적잖은 보상이 걸린 만만찮은 의뢰다.', C:'가볍게 처리할 수 있는 자잘한 일이다.', D:'분위기를 채워주는 사소한 일이다.',
};
const QUEST_ITEM_REWARD_BANK = ['쓸만한 장비 한 점','귀중한 재료','작은 사례품','오래된 물건','희귀한 재료 묶음','수집가가 탐낼 물건','정성이 담긴 손수 제작품','기념될 만한 증표','작은 마법 물품','값나가는 장신구'];
// [버그 수정] 이 함수는 NPC 퀘스트 제안/장소 생성/게시판/자동 퀘스트
// 생성까지 4곳에서 공유하는 로컬 폴백인데, 클라우드 프롬프트가 넣는
// char.race/job/level/최근 서사를 전혀 참조하지 않았다(전수조사로
// 발견). S.character는 어디서든 접근 가능하므로 호출부를 전부 고칠
// 필요 없이 여기서 직접 읽어 4곳 모두에 한 번에 적용한다 — 매번
// 붙이면 반복되므로 25% 확률로 종족 언급 한 문장만 덧붙인다.
function composeLocalQuest(grade, contextType, rewardRange, diffDefault){
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const type = QUEST_CONTEXT_TO_TYPE[contextType] || pick(QUEST_TYPE_LIST);
  const title = pick(QUEST_TITLE_BANK[type]);
  const char = S.character||{};
  const race = char.race ? RACE_DEFS.find(r=>r.name===char.race) : null;
  const raceClause = (race && Math.random()<0.25) ? ` ${char.race}인 이의 손을 거쳐야만 풀릴 일이라는 말도 있다.` : '';
  const desc = `${pick(QUEST_DESC_BANK[type])} ${QUEST_GRADE_INTENSITY[grade] || QUEST_GRADE_INTENSITY.B}${raceClause}`;
  const kw = QUEST_KEYWORD_BANK[type];
  const gold = Math.round(rewardRange.goldMin + Math.random()*(rewardRange.goldMax-rewardRange.goldMin));
  const exp = Math.round(rewardRange.expMin + Math.random()*(rewardRange.expMax-rewardRange.expMin));
  const item = Math.random() < 0.3 ? pick(QUEST_ITEM_REWARD_BANK) : null;
  return {
    title, icon: QUEST_TYPE_ICON[type] || '📋', desc, type, difficulty: diffDefault,
    reward: { gold, exp, item },
    completeKeywords: kw.complete.slice(), failKeywords: kw.fail.slice(),
    lore: QUEST_LORE_BANK[type] ? pick(QUEST_LORE_BANK[type]) : '', aiHint: QUEST_AI_HINT_BANK[type] || '',
  };
}
window.composeLocalQuest = composeLocalQuest;

export async function generateAIQuest(silent=false, forcedNeed=null){
  if(window._questGenBusy){ return; }

  // 어떤 등급/컨텍스트 퀘스트를 만들지 결정
  const need = forcedNeed || analyzeQuestNeed();
  if(!need && !forcedNeed) return;
  const grade       = (need && need.grade) || 'B';
  const contextType = (need && need.contextType) || 'misc';
  const contextHint = (need && need.hint) || '';
  const gradeInfo   = QUEST_GRADES[grade] || QUEST_GRADES.B;

  window._questGenBusy = true;
  const btn = document.getElementById('btn-gen-quest');
  if(btn){ btn.disabled=true; btn.textContent='⏳ 생성 중...'; }

  try{
    const char       = S.character || {};
    const sid        = S.scenario?.id || 'custom';
    // [B57 FIX] S.stats.level은 정식 필드가 아니라 항상 undefined라 AI
    // 퀘스트 생성 시 항상 Lv.1로 전달되던 버그.
    const level      = (typeof loadPlayerLevel==='function' ? loadPlayerLevel() : 1);
    const job        = char.job || char.role || '모험가';
    const race       = char.race || '인간';
    const existQuests= loadDynQuests();
    const existTitles= existQuests.map(q=>q.title).join(', ');

    // 이 (등급+상황종류+세계관) 조합의 퀘스트가 이미 12건 이상 쌓였으면,
    // AI를 새로 부르지 않고 예전에 만든 내용 중 하나를 재사용한다 —
    // 제목·보상·완료조건 등 '내용'만 재사용하고 id·상태·타임스탬프는
    // 매번 새로 부여한다. 이번 턴은 API 호출 자체가 발생하지 않는다.
    const questBucketKey = 'quest|'+grade+'|'+contextType+'|'+sid;
    const reusedContent = pickGeneratedObject(questBucketKey);
    if(reusedContent && !existTitles.includes(reusedContent.title)){
      const reusedQuest = {
        ...reusedContent,
        id:       'aidq_' + Date.now() + '_' + Math.random().toString(36).slice(2,5),
        grade:    grade,
        status:   'pending_accept',
        contextType,
        ctx: { scenario:sid, job, race, level, charName:char.name||'', turn:S.msgCount||0 },
        generatedAt: new Date().toISOString(),
        completedAt: null, failedAt: null,
        reusedFromLearning: true,
      };
      showQuestAcceptPopup(
        reusedQuest,
        function(){ // 수락
          reusedQuest.status = 'active';
          const all = loadDynQuests();
          all.push(reusedQuest);
          saveDynQuests(all);
          if(grade==='S') window._lastSQuestTurn = S.msgCount||0;
          if(grade==='A') window._lastAQuestTurn = S.msgCount||0;
          window._dynQuestCooldown = S.msgCount||0;
          toast(`[${grade}등급] 퀘스트 수락: ${reusedQuest.title}`, 3500, reusedQuest);
          const pb = document.getElementById('pb-quests');
          if(pb && pb.offsetParent !== null) renderQuests();
          if(typeof updateQuestBadge==='function') updateQuestBadge();
          S._nextInjectedContext = (S._nextInjectedContext||'') +
            ` [📋 새 퀘스트 수락: ${reusedQuest.icon}${reusedQuest.title}] ${reusedQuest.aiHint||reusedQuest.desc.slice(0,60)} — 다음 서사에 이 퀘스트 시작을 자연스럽게 반영하라.`;
          if(typeof maybeGenerateQuestLocation==='function' && ['S','A'].includes(grade))
            enqueueAITask(()=>maybeGenerateQuestLocation(reusedQuest.title, reusedQuest.desc), '퀘스트 장소 생성');
        },
        function(){ // 거절
          if(grade==='S') window._lastSQuestTurn = (S.msgCount||0) - 20;
          if(grade==='A') window._lastAQuestTurn = (S.msgCount||0) - 8;
          window._dynQuestCooldown = S.msgCount||0;
          toast(`✕ 퀘스트 거절: ${reusedQuest.title}`, 1800);
        }
      );
      return; // finally 블록에서 _questGenBusy·버튼 상태 복구됨
    }

    // 등급별 reward 범위
    const rewardRange = {
      S:{ goldMin:200, goldMax:800, expMin:300, expMax:1000 },
      A:{ goldMin:80,  goldMax:300, expMin:120, expMax:400  },
      B:{ goldMin:30,  goldMax:120, expMin:50,  expMax:150  },
      C:{ goldMin:10,  goldMax:50,  expMin:20,  expMax:70   },
      D:{ goldMin:0,   goldMax:20,  expMin:5,   expMax:30   },
    }[grade] || { goldMin:30, goldMax:100, expMin:50, expMax:150 };

    // 등급별 difficulty 기본값
    const diffDefault = { S:'legendary', A:'hard', B:'normal', C:'easy', D:'easy' }[grade] || 'normal';

    // [복원] AI 우선 — 키가 있으면 캐릭터 상황(신분/최근 서사)까지 반영한
    // 진짜 퀘스트를 시도하고, 없거나 실패하면 로컬 조합으로 폴백.
    const recentScene = (S?.messages||[]).slice(-3).map(m=>m.content||'').join(' ').slice(0,300);
    const questPrompt = `당신은 TaleForge RPG의 퀘스트 설계자입니다. 아래 상황에 맞는 퀘스트 1개를 JSON으로 생성하세요.

[세계관] ${sid}
[캐릭터] ${char.name||'주인공'} (${race} ${job}, Lv.${level})
[등급] ${grade} (${gradeInfo.label||grade})
[상황 종류] ${contextType}
[상황 힌트] ${contextHint||'없음'}
[최근 서사] ${recentScene||'없음'}
[이미 있는 퀘스트 제목(중복 금지)] ${existTitles||'없음'}

반드시 다음 JSON만 출력하세요:
{
  "title": "퀘스트 제목 (15자 이내)",
  "icon": "이모지 1개",
  "desc": "퀘스트 설명 (40~80자, 구체적 목표, 캐릭터 상황 반영)",
  "type": "combat|explore|dialog|fetch|protect|mystery|escort|craft|escape|survival",
  "difficulty": "${diffDefault}",
  "reward": {"gold": ${rewardRange.goldMin}~${rewardRange.goldMax} 사이 숫자, "exp": ${rewardRange.expMin}~${rewardRange.expMax} 사이 숫자, "item": null},
  "completeKeywords": ["완료로 판정할 키워드1","키워드2","키워드3"],
  "failKeywords": ["실패로 판정할 키워드1","키워드2"],
  "lore": "배경 설명 한 줄",
  "aiHint": "서사 연출 힌트 (40자)"
}`;

    const _recordQuestSample = (r)=>{
      if(!r) return;
      if(r.desc) recordMarkovSample('quest_desc', r.desc);
      if(r.lore) recordMarkovSample('quest_lore', r.lore);
    };
    const q = await tryCloudThenLocalModelThenBank(
      async () => { const r = await callGeminiDirect(questPrompt); _recordQuestSample(r); return r; },
      async () => { const r = await callLocalModelJSON(questPrompt, { maxTokens: 400 }); _recordQuestSample(r); return r; },
      () => composeLocalQuest(grade, contextType, rewardRange, diffDefault),
      '퀘스트 생성'
    );
    if(!q || !q.title || !q.desc) throw new Error('퀘스트 데이터 불완전');

    const newQuest = {
      id:       'aidq_' + Date.now() + '_' + Math.random().toString(36).slice(2,5),
      grade:    grade,
      title:    q.title,
      icon:     q.icon || (grade==='S'?'⚔️':grade==='A'?'📜':'📋'),
      desc:     q.desc,
      type:     q.type || 'general',
      difficulty: q.difficulty || diffDefault,
      reward:   q.reward || { gold: rewardRange.goldMin, exp: rewardRange.expMin, item:null },
      completeKeywords: Array.isArray(q.completeKeywords) ? q.completeKeywords : [],
      failKeywords:     Array.isArray(q.failKeywords)     ? q.failKeywords     : [],
      lore:     q.lore   || '',
      aiHint:   q.aiHint || '',
      status:   'pending_accept', // 수락 전 상태
      contextType,
      ctx: { scenario:sid, job, race, level, charName:char.name||'', turn:S.msgCount||0 },
      generatedAt: new Date().toISOString(),
      completedAt: null, failedAt: null,
    };

    // 학습 버킷에 '내용'만 기록 — id·상태·타임스탬프는 재사용 시 매번 새로 부여하므로 제외
    recordGeneratedObject(questBucketKey, {
      title: newQuest.title, icon: newQuest.icon, desc: newQuest.desc, type: newQuest.type,
      difficulty: newQuest.difficulty, reward: newQuest.reward,
      completeKeywords: newQuest.completeKeywords, failKeywords: newQuest.failKeywords,
      lore: newQuest.lore, aiHint: newQuest.aiHint,
    });

    // ── 팝업으로 수락 여부 확인 ──
    showQuestAcceptPopup(
      newQuest,
      function(){ // 수락
        newQuest.status = 'active';
        const all = loadDynQuests();
        all.push(newQuest);
        saveDynQuests(all);
        // 등급별 쿨다운 갱신
        if(grade==='S') window._lastSQuestTurn = S.msgCount||0;
        if(grade==='A') window._lastAQuestTurn = S.msgCount||0;
        window._dynQuestCooldown = S.msgCount||0;
        const gradeCol = gradeInfo.color;
        toast(`[${grade}등급] 퀘스트 수락: ${newQuest.title}`, 3500, newQuest);
        const pb = document.getElementById('pb-quests');
        if(pb && pb.offsetParent !== null) renderQuests();
        if(typeof updateQuestBadge==='function') updateQuestBadge();
        // 퀘스트 수락 시 미리보기 컨텍스트 주입
        S._nextInjectedContext = (S._nextInjectedContext||'') +
          ` [📋 새 퀘스트 수락: ${newQuest.icon}${newQuest.title}] ${newQuest.aiHint||newQuest.desc.slice(0,60)} — 다음 서사에 이 퀘스트 시작을 자연스럽게 반영하라.`;
        if(typeof maybeGenerateQuestLocation==='function' && ['S','A'].includes(grade))
          enqueueAITask(()=>maybeGenerateQuestLocation(newQuest.title, newQuest.desc), '퀘스트 장소 생성');
      },
      function(){ // 거절
        // S/A등급 거절해도 쿨다운 절반만 갱신 (다음 기회에 다시 제안)
        if(grade==='S') window._lastSQuestTurn = (S.msgCount||0) - 20;
        if(grade==='A') window._lastAQuestTurn = (S.msgCount||0) - 8;
        window._dynQuestCooldown = S.msgCount||0;
        toast(`✕ 퀘스트 거절: ${newQuest.title}`, 1800);
      }
    );

  }catch(e){
    if(!silent) toast('⚠️ 퀘스트 생성 실패: '+e.message, 3000);
    console.warn('[generateAIQuest]', e);
  }finally{
    window._questGenBusy = false;
    if(btn){ btn.disabled=false; btn.textContent='✦ AI 퀘스트 생성'; }
  }
}
window.generateAIQuest = generateAIQuest;

export function checkBulletinQuestCompletion(aiText){
  if(!aiText) return;
  const quests = loadQuests();
  const active = quests.filter(q=>q.type==='bulletin' && q.status==='active');
  if(!active.length) return;

  const lc = aiText.toLowerCase();
  const FAIL_KW = ['실패','포기','취소','죽었','사라졌','불가능','거절','못했','안됐'];
  const COMPLETE_KW = ['완료','성공','해냈','처치했','처치','전달했','찾았','퇴치','해결','돌아왔','가져왔','끝냈','마쳤','마무리'];
  let changed = false;

  active.forEach(q=>{
    if(q._rewardGiven) return; // 중복 완료 방지
    const titleLc = (q.title||'').toLowerCase();
    // 핵심 단어 추출 (1글자 이상, 빈 배열이면 제목 전체로 fallback)
    const titleWords = titleLc.split(/\s+/).filter(w=>w.length>=1);
    const titleMentioned = titleWords.length > 0 ? titleWords.some(w=>lc.includes(w)) : lc.includes(titleLc);
    const hasComplete = COMPLETE_KW.some(k=>lc.includes(k));
    const hasFail = FAIL_KW.some(k=>lc.includes(k));

    if(titleMentioned && hasComplete && !hasFail){
      q.status = 'completed';
      q.completedAt = new Date().toISOString();
      q._rewardGiven = true;
      changed = true;

      // 수락 목록에도 완료 동기화 (게시판 UI 반영)
      const accepted = loadAcceptedBulletin();
      const uid = q.id.replace('bulletin_','');
      const acc = accepted.find(a=>a.uid===uid);
      if(acc){ acc.completed=true; acc.completedAt=Date.now(); saveAcceptedBulletin(accepted); }

      // 보상 지급
      const rewardGold = q.reward || 0;
      if(rewardGold > 0){
        S.gold = (S.gold||0) + rewardGold;
        saveGold(S.gold);
        if(typeof window.updateHeader==='function') window.updateHeader();
        toast(`💰 게시판 의뢰 완료: 골드 +${rewardGold}`, 3000);
      }
      // 경험치
      const expGain = Math.floor(rewardGold * 0.5) || 30;
      if(typeof window.updateStats==='function') window.updateStats('totalExp', expGain);
      // 평판
      if(typeof updateReputation==='function') updateReputation(10);
      // 랜덤 아이템 보상 (레어 이상 의뢰만)
      if(q.tier && ['rare','legendary'].includes(q.tier)){
        if(typeof rollEventReward==='function'){
          const item = rollEventReward('bulletin');
          if(item){ S.inventory.push(item); saveInventory(S.inventory); toastHTML(`🎁 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon)} ${esc(item.name)} 획득!`, 2500); }
        }
      }
      toastHTML(`🏆 게시판 의뢰 완료: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:14}):(q.icon||"📋")} ${esc(q.title)}`, 3500);
      if(typeof unlockAchievement==='function') unlockAchievement('first_quest');
      if(typeof saveDiaryEntry==='function') saveDiaryEntry('quest', `✅ 게시판 의뢰 완료: ${q.title}`, S.msgCount||0);
      // 게시판 UI 갱신
      if(typeof renderLocationPanel==='function') setTimeout(renderLocationPanel, 100);
    } else if(hasFail && titleMentioned){
      q.status = 'failed';
      q.failedAt = new Date().toISOString();
      changed = true;
      toast(`❌ 게시판 의뢰 실패: ${q.title}`, 2500);
    }
  });

  if(changed){
    saveQuests(quests);
    if(typeof updateQuestBadge==='function') updateQuestBadge();
  }
}
window.checkBulletinQuestCompletion = checkBulletinQuestCompletion;

window.checkBulletinQuestCompletion = checkBulletinQuestCompletion;

export function checkDynQuestCompletion(aiText){
  if(!aiText) return;
  const quests = loadDynQuests();
  const active = quests.filter(q=>q.status==='active');
  if(!active.length) return;

  const lc = aiText.toLowerCase();
  let changed = false;

  // 실패 컨텍스트 키워드
  const GLOBAL_FAIL = ['실패','포기','취소','죽었','사라졌','불가능','불능','거절'];

  active.forEach(q => {
    if(q._rewardGiven) return; // 중복 완료 방지
    const ckw = (q.completeKeywords||[]).map(k=>k.toLowerCase());
    const fkw = (q.failKeywords||[]).map(k=>k.toLowerCase());
    // completeKeywords 없으면 제목 단어로 fallback
    const titleWords = (q.title||'').toLowerCase().split(/\s+/).filter(w=>w.length>=1);
    const hasComplete = ckw.length > 0
      ? ckw.some(k=>lc.includes(k))
      : titleWords.some(w=>lc.includes(w)) && ['완료','성공','해냈','처치','퇴치','해결','끝냈','마쳤'].some(k=>lc.includes(k));
    const hasFail = fkw.some(k=>lc.includes(k)) || GLOBAL_FAIL.some(k=>{
      const idx = lc.indexOf(k);
      if(idx<0) return false;
      const ctx = lc.slice(Math.max(0,idx-40), idx+40);
      const refWords = ckw.length>0 ? ckw : titleWords;
      return refWords.some(ck=>ctx.includes(ck));
    });

    if(hasComplete && !hasFail){
      q.status      = 'completed';
      q.completedAt = new Date().toISOString();
      q._rewardGiven = true;
      changed = true;

      // 보상 지급
      const r = q.reward||{};
      if(r.gold){ S.gold=(S.gold||0)+r.gold; saveGold(S.gold); if(typeof window.updateHeader==='function') window.updateHeader(); toast(`💰 퀘스트 완료: 골드 +${r.gold}`, 2500); }
      if(r.exp){ if(typeof addExp==='function') addExp(r.exp); toast(`✨ 퀘스트 완료: exp +${r.exp}`, 2000); }
      if(r.item){
        // 아이템명이 있으면 AI로 생성해서 실제 지급
        (async()=>{
          try{
            const qItem = typeof generateAIItem==='function'
              ? await generateAIItem(`퀘스트 보상: ${q.title}`, null)
              : null;
            if(qItem){
              qItem.name = r.item !== null && typeof r.item === 'string' ? r.item : qItem.name;
              S.inventory = S.inventory||[];
              S.inventory.push(qItem);
              saveInventory(S.inventory);
              toastHTML(`🎁 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(qItem,{size:14}):(qItem.icon||"📦")} ${esc(qItem.name)} 획득! (퀘스트 보상)`, 3000);
            } else {
              toast(`🎁 퀘스트 보상: ${r.item}`, 2500);
            }
          }catch(e){ toast(`🎁 퀘스트 보상: ${r.item}`, 2500); }
        })();
      }
      toastHTML(`🏆 [${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:14}):(q.icon)}${esc(q.title)}] 퀘스트 완료!`, 3000);
      if(typeof unlockAchievement==='function') unlockAchievement('first_quest');
      if(typeof saveDiaryEntry==='function') saveDiaryEntry('quest', `✅ 퀘스트 완료: ${q.title}`, S.msgCount||0);
    } else if(hasFail){
      q.status   = 'failed';
      q.failedAt = new Date().toISOString();
      changed    = true;
      toastHTML(`❌ [${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:14}):(q.icon)}${esc(q.title)}] 퀘스트 실패`, 2500);
    }
  });

  if(changed){
    saveDynQuests(quests);
    if(typeof updateQuestBadge==='function') updateQuestBadge();
  }
}
window.checkDynQuestCompletion = checkDynQuestCompletion;

window.completeDynQuest = function(id){
  const quests = loadDynQuests();
  const q = quests.find(x=>x.id===id);
  if(!q) return;
  // [A-1, A-5 FIX] 이미 완료/실패된 퀘스트 중복 처리 방지
  if(q.status === 'completed'){ toast('이미 완료된 퀘스트입니다', 1500); return; }
  if(q.status === 'failed'){ toast('실패한 퀘스트는 완료 처리할 수 없습니다', 1500); return; }
  // active 상태일 때만 보상 지급
  const r = q.reward||{};
  q.status = 'completed'; q.completedAt = new Date().toISOString();
  saveDynQuests(quests);
  if(r.gold){ S.gold=(S.gold||0)+r.gold; saveGold(S.gold); }
  if(r.exp && typeof addExp==='function') addExp(r.exp);
  toastHTML(`🏆 [${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:14}):(q.icon||"")}${esc(q.title)}] 완료 처리됨`, 2500);
  renderQuests();
};

window.failDynQuest = function(id){
  const quests = loadDynQuests();
  const q = quests.find(x=>x.id===id);
  if(!q) return;
  // [A-1 FIX] 이미 종료된 퀘스트 중복 처리 방지
  if(q.status === 'completed' || q.status === 'failed'){
    toast('이미 종료된 퀘스트입니다', 1500); return;
  }
  q.status = 'failed'; q.failedAt = new Date().toISOString();
  saveDynQuests(quests);
  toastHTML(`❌ [${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:14}):(q.icon||"")}${esc(q.title)}] 실패 처리됨`, 2000);
  renderQuests();
};

window.deleteDynQuest = function(id){
  if(!confirm('이 퀘스트를 삭제할까요?')) return;
  saveDynQuests(loadDynQuests().filter(q=>q.id!==id));
  toast('🗑 퀘스트 삭제됨', 1500);
  renderQuests();
};

window.generateAIQuest = generateAIQuest;

export function renderQuests(){
  const body=$('pb-quests'); if(!body) return;

  // ── 퀘스트 히스토리 로드 ──
  let _qHistory = [];
  try{ _qHistory = JSON.parse(lsGet('taleforge-quest-history')||'[]'); }catch(e){}
  const histByQid = {};
  _qHistory.forEach(h=>{ if(!histByQid[h.qid]) histByQid[h.qid]=[]; histByQid[h.qid].push(h); });

  const sc = {active:'#c8a96e', complete:'#60a060', completed:'#60a060', failed:'#e05a5a'};
  const sl = {active:'진행중', complete:'완료', completed:'완료', failed:'실패'};

  let sections = [];

  // ── 0. 메인 스토리 진행(28장 고정 캠페인, MAIN_QUESTS) — 아래
  // "★ 메인 퀘스트"(S등급 AI 동적 퀘스트, 별개 시스템)와 이름이
  // 헷갈리지 않도록 "📖 메인 스토리"로 구분해서 별도 표시한다.
  // [21번 라운드, 시스템 업그레이드 ③] 지금까지 이 28장짜리 고정
  // 캠페인은 AI의 q_done 판정에서만 진행됐고 플레이어가 직접 볼 수
  // 있는 화면이 어디에도 없었다 — 여기서 처음으로 현재 활성 장과
  // 수동 진행 버튼을 노출한다.
  try{
    const chapter = (typeof window.getActiveMainQuestChapter==='function') ? window.getActiveMainQuestChapter() : null;
    if(chapter){
      sections.push(`<div style="font-family:'Cinzel',serif;font-size:9px;color:#e0b060;letter-spacing:2px;margin:10px 0 6px;opacity:.9">📖 메인 스토리</div>`);
      sections.push(`<div style="padding:10px 11px;background:#0d0800;border:1px solid #e0b06044;border-left:3px solid #e0b060;margin-bottom:5px">
        <div style="display:flex;align-items:center;gap:7px;margin-bottom:5px">
          <span style="font-size:16px">${esc(chapter.icon||'📖')}</span>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:10px;color:#e0b060">${esc(chapter.chapter||'')} · ${esc(chapter.title||'')}</div>
            <div style="font-size:8px;color:#e0b06088;margin-top:1px">진행중</div>
          </div>
        </div>
        <div style="font-size:11px;color:var(--dim);line-height:1.6">${esc(chapter.desc||'')}</div>
        <div style="margin-top:7px">
          ${chapter.canAdvance
            ? `<button onclick="advanceMainQuestChapter('${esc(chapter.id)}')" style="width:100%;padding:6px;background:#1a1200;border:1px solid #e0b06066;color:#e0b060;font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">📖 이 장을 마무리하고 다음으로 넘어가기</button>`
            : `<div style="padding:5px 8px;background:#0a0a0a;border:1px solid #3a3a3a;font-size:9px;color:#606060;font-family:'Cinzel',serif;text-align:center">이야기가 조금 더 진행되면 다음으로 넘어갈 수 있습니다 (${chapter.turnsElapsed}/${chapter.turnsNeeded}턴)</div>`}
        </div>
      </div>`);
    }
  }catch(e){}

  // ── 1. 메인 퀘스트 — S등급 AI 동적 퀘스트로 표시 ──
  try{
    const sQuests = loadDynQuests().filter(q => q.grade === 'S' && (q.status === 'active' || q.status === 'completed'));
    if(sQuests.length){
      sections.push(`<div style="font-family:'Cinzel',serif;font-size:9px;color:#ff6060;letter-spacing:2px;margin:10px 0 6px;opacity:.9">★ 메인 퀘스트</div>`);
      sections.push(sQuests.map(q=>{
        const done = q.status === 'completed';
        const col = done ? '#60a060' : '#ff6060';
        const stLabel = done ? '완료' : '진행중';
        const hist = histByQid[q.id]||[];
        return `<div style="padding:10px 11px;background:#0d0800;border:1px solid ${col}44;border-left:3px solid ${col};margin-bottom:5px">
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:5px">
            <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:16}):(q.icon||"⚔️")}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${col}">${esc(q.title)}</div>
              <div style="font-size:8px;color:${col}88;margin-top:1px">★ S등급 · ${stLabel}</div>
            </div>
            ${done?'<span style="color:#60a060;font-size:13px">✓</span>':''}
          </div>
          <div style="font-size:11px;color:var(--dim);line-height:1.6">${esc(q.desc||'')}</div>
          ${q.reward?.gold||q.reward?.exp?`<div style="font-size:9px;color:#f1c40f;margin-top:5px">보상: ${q.reward.gold?'💰'+q.reward.gold:''}${q.reward.exp?' ✨'+q.reward.exp+'exp':''}</div>`:''}
          ${hist.length?`<div style="margin-top:6px;padding:5px 7px;background:#0a0800;border:1px solid #2a1a05;border-radius:2px">
            <div style="font-size:8px;color:var(--dim);margin-bottom:3px;font-family:'Cinzel',serif">진행 기록</div>
            ${hist.slice(-2).map(h=>`<div style="font-size:9px;color:#6a5a3a;line-height:1.5;margin-bottom:2px">
              <span style="color:var(--dim)">턴 ${h.turn}</span> · ${esc((h.userMsg||'').slice(0,30))}
              ${h.scene?`<div style="font-size:9px;color:#4a3a2a;line-height:1.4;margin-top:1px">${esc(h.scene.slice(0,80))}...</div>`:''}
            </div>`).join('')}
          </div>`:''}
        </div>`;
      }).join(''));
    } else {
      // S등급 퀘스트 없으면 안내 + 즉시 생성 트리거
      sections.push(`<div style="font-family:'Cinzel',serif;font-size:9px;color:#ff6060;letter-spacing:2px;margin:10px 0 6px;opacity:.9">★ 메인 퀘스트</div>`);
      sections.push(`<div style="padding:10px 12px;background:#0d0500;border:1px dashed #ff606044;border-left:3px solid #ff606066;margin-bottom:5px;font-size:10px;color:var(--dim);line-height:1.6">
        현재 상황을 분석하여 메인 퀘스트를 생성 중입니다...
        <div style="margin-top:6px">
          <button onclick="generateAIQuest(false,{grade:'S',contextType:'auto',hint:'현재 진행 중인 서사와 캐릭터 상황에서 자연스럽게 이어지는 핵심 서사 퀘스트를 만드세요. 캐릭터의 신분·배경·최근 상황을 반드시 반영할 것'})" style="padding:5px 12px;background:#1a0500;border:1px solid #ff606066;color:#ff8060;font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px;letter-spacing:.5px">⚔️ 지금 생성하기</button>
        </div>
      </div>`);
      // [F-1 FIX] 자동 생성 트리거 — 패널 열 때마다 쿨다운 체크 (10턴에 한 번)
      const _lastQuestGenTurn = window._lastAutoQuestGenTurn || -999;
      const _questGenCooldown = 10; // 10턴 쿨다운
      if(typeof generateAIQuest==='function' && !window._questGenBusy && (S.msgCount||0) >= 3
        && (S.msgCount||0) - _lastQuestGenTurn >= _questGenCooldown){
        window._lastAutoQuestGenTurn = S.msgCount||0;
        setTimeout(()=>generateAIQuest(true,{grade:'S',contextType:'auto',hint:'현재 진행 중인 서사와 캐릭터 상황에서 자연스럽게 이어지는 핵심 서사 퀘스트를 만드세요. 캐릭터의 신분·배경·최근 상황을 반드시 반영할 것'}), 800);
      }
    }
  }catch(e){}

  // ── 2. 에픽 퀘스트 ──
  try{
    const epicState = loadEpicState();
    const sid2 = S.scenario?.id || 'medieval';
    const activeEpic = EPIC_QUEST_CHAINS.filter(c=>{
      const cs = epicState[c.id];
      return cs?.started;
    });
    if(activeEpic.length){
      sections.push(`<div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:2px;margin:12px 0 6px;opacity:.8">⚔️ 대서사시 퀘스트</div>`);
      sections.push(activeEpic.map(chain=>{
        const cs = epicState[chain.id]||{};
        const done = cs.completed;
        const col = done ? '#60a060' : 'var(--gold)';
        const pct = Math.round((cs.completedSteps?.length||0)/chain.steps.length*100);
        const curStep = chain.steps.find(s=>s.id===cs.currentStep);
        const stepHist = (cs.completedSteps||[]).flatMap(sid=>histByQid[sid]||[]);
        return `<div style="padding:10px 11px;background:#0d0800;border:1px solid ${col}44;border-left:3px solid ${col};margin-bottom:5px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <span style="font-size:18px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(chain,{size:18}):(chain.icon)}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${col}">${esc(chain.title)}</div>
              <div style="font-size:8px;color:var(--dim)">${done?'완료':'진행중'} · ${cs.completedSteps?.length||0}/${chain.steps.length}단계</div>
            </div>
            ${done?'<span style="color:#60a060">✓</span>':''}
          </div>
          <div style="height:3px;background:#1a1005;border-radius:2px;margin-bottom:5px">
            <div style="width:${pct}%;height:100%;background:${col};border-radius:2px"></div>
          </div>
          ${curStep&&!done?`<div style="font-size:9px;color:var(--gold);margin-bottom:3px">▶ ${esc(curStep.title)}</div>
          <div style="font-size:9px;color:var(--dim)">${esc(curStep.desc||'')}</div>`:''}
          ${stepHist.length?`<div style="margin-top:6px;padding:5px 7px;background:#0a0800;border:1px solid #2a1a05;border-radius:2px">
            <div style="font-size:8px;color:var(--dim);margin-bottom:3px;font-family:'Cinzel',serif">완료 단계 기록</div>
            ${stepHist.slice(-3).map(h=>`<div style="font-size:9px;color:#4a3a2a;margin-bottom:2px">턴 ${h.turn} · ${esc((h.scene||'').slice(0,60))}...</div>`).join('')}
          </div>`:''}
        </div>`;
      }).join(''));
    }
  }catch(e){}

  // ── 3. 히든 퀘스트 ──
  try{
    const hiddenMap = loadHiddenQuests(); // { [id]: { id, name, icon, desc, reward, status, ... } }
    const activeHidden = Object.values(hiddenMap).filter(q=>q.status==='active'||q.status==='completed');
    if(activeHidden.length){
      sections.push(`<div style="font-family:'Cinzel',serif;font-size:9px;color:#8e44ad;letter-spacing:2px;margin:12px 0 6px;opacity:.8">🔮 히든 퀘스트</div>`);
      sections.push(activeHidden.map(q=>{
        const col = q.status==='completed'?'#60a060':'#8e44ad';
        const hist = histByQid[q.id]||[];
        return `<div style="padding:10px 11px;background:#0d0800;border:1px solid ${col}44;border-left:3px solid ${col};margin-bottom:5px">
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:4px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:14}):(q.icon||"🔮")}</span>
            <span style="font-family:'Cinzel',serif;font-size:10px;color:${col}">${esc(q.name||q.id||'히든 퀘스트')}</span>
            <span style="font-size:8px;padding:1px 5px;border-radius:2px;background:${col}22;color:${col}">${sl[q.status]||q.status}</span>
          </div>
          <div style="font-size:11px;color:var(--dim);line-height:1.5">${esc(q.desc||'')}</div>
          ${q.reward?`<div style="font-size:9px;color:#f1c40f;margin-top:3px">보상: ${esc(String(q.reward))}</div>`:''}
          ${hist.length?`<div style="margin-top:5px;font-size:9px;color:#4a3a2a">턴 ${hist[0].turn} · ${esc((hist[0].scene||'').slice(0,60))}...</div>`:''}
        </div>`;
      }).join(''));
    }
  }catch(e){}

  // ── 4. NPC 퀘스트 (기존 loadQuests / loadWorldQuests) ──
  try{
    const npcQs = [...(loadQuests()||[]).filter(q=>q.type!=='bulletin'), ...(loadWorldQuests()||[])];
    if(npcQs.length){
      sections.push(`<div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:2px;margin:12px 0 6px;opacity:.8">💬 NPC 퀘스트</div>`);
      sections.push(npcQs.map(q=>{
        const col = sc[q.status]||'var(--gold)';
        return `<div style="padding:10px 11px;background:#0d0800;border:1px solid ${col}33;border-left:3px solid ${col};margin-bottom:5px">
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:4px">
            <span style="font-family:'Cinzel',serif;font-size:10px;color:${col}">${esc(q.title||q.name||'퀘스트')}</span>
            <span style="font-size:8px;padding:1px 5px;border-radius:2px;background:${col}22;color:${col}">${sl[q.status]||q.status}</span>
          </div>
          <div style="font-size:11px;color:var(--dim);line-height:1.5">${esc(q.desc||q.description||'')}</div>
          ${q.reward?`<div style="font-size:10px;color:#f1c40f;margin-top:4px">보상: ${esc(String(q.reward))}</div>`:''}
        </div>`;
      }).join(''));
    }
  }catch(e){}

  // ── 4-B. NPC 대화 의뢰 (AI 생성) ──
  try{
    const dlgQs = loadNpcDlgQuests();
    if(dlgQs.length){
      const diffColor = { easy:'#60a060', normal:'#c8a96e', hard:'#e08050', legendary:'#c040c0' };
      const diffLabel = { easy:'쉬움', normal:'보통', hard:'어려움', legendary:'전설' };
      sections.push(`<div style="font-family:'Cinzel',serif;font-size:9px;color:#60c0d0;letter-spacing:2px;margin:12px 0 6px;opacity:.9">💬 NPC 의뢰 (대화 퀘스트)</div>`);
      const sorted2 = [...dlgQs].sort((a,b)=>{ const o={active:0,completed:1,failed:2}; return (o[a.status]||3)-(o[b.status]||3); });
      sections.push(sorted2.map(q=>{
        const col2 = q.status==='completed'?'#60a060':q.status==='failed'?'#e05a5a':'#60c0d0';
        const stL = q.status==='completed'?'완료':q.status==='failed'?'실패':'진행중';
        const dc = diffColor[q.difficulty]||'var(--gold)';
        const dl = diffLabel[q.difficulty]||q.difficulty;
        const r2 = q.reward||{};
        const isAct = q.status==='active';
        const rewardHtml = [
          r2.gold ? `💰${r2.gold}` : '',
          r2.exp  ? `✨${r2.exp}exp` : '',
          r2.blueprintName ? `📜${r2.blueprintName}` : '',
          r2.item ? `🎁${r2.item}` : '',
        ].filter(Boolean).join(' ');
        return `<div style="padding:10px 11px;background:#050f1a;border:1px solid ${col2}44;border-left:3px solid ${col2};margin-bottom:5px">
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:4px">
            <span style="font-size:14px">${q.npcIcon||'👤'}</span>
            <div style="flex:1;min-width:0">
              <div style="font-size:9px;color:${col2};font-family:'Cinzel',serif;opacity:.8">${esc(q.npcName||'')} 의뢰</div>
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${col2};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:10}):(q.icon||"📋")} ${esc(q.title)}</div>
              <div style="display:flex;gap:4px;margin-top:2px;flex-wrap:wrap">
                <span style="font-size:7px;padding:1px 5px;border-radius:2px;background:${col2}22;color:${col2}">${stL}</span>
                <span style="font-size:7px;padding:1px 5px;border-radius:2px;background:${dc}22;color:${dc}">${dl}</span>
              </div>
            </div>
          </div>
          <div style="font-size:11px;color:var(--dim);line-height:1.5;margin-bottom:4px">${esc(q.desc||'')}</div>
          ${q.lore?`<div style="font-size:9px;color:#3a4a5a;font-style:italic;margin-bottom:3px">${esc(q.lore)}</div>`:''}
          ${rewardHtml?`<div style="font-size:9px;color:#f1c40f;margin-bottom:5px">보상: ${rewardHtml}</div>`:''}
          ${isAct?`<div style="display:flex;align-items:center;gap:6px">
              <div style="flex:1;padding:3px 8px;background:#050f1a;border:1px solid #2a4a5a;font-size:8px;color:#4a8a9a;font-family:'Cinzel',serif;text-align:center">✔ 진행 중 (조건 달성 시 자동 완료)</div>
              <button onclick="if(confirm('이 의뢰를 완료 처리할까요? (수동 완료는 서사 판정 없이 즉시 보상이 지급됩니다)'))completeNpcDlgQuest('${esc(q.id)}')" style="padding:3px 8px;background:#0a1a0a;border:1px solid #3a6a3a;color:#70c070;font-size:8px;cursor:pointer;border-radius:2px;white-space:nowrap">✓ 완료</button>
              <button onclick="if(confirm('이 의뢰를 포기할까요?'))failNpcDlgQuest('${esc(q.id)}')" style="padding:3px 8px;background:#1a0a0a;border:1px solid #6a3a3a;color:#c07070;font-size:8px;cursor:pointer;border-radius:2px;white-space:nowrap">✕ 포기</button>
            </div>`
            :`<div style="display:flex;align-items:center;gap:6px">
              <div style="flex:1;font-size:8px;color:#3a3a3a;margin-top:2px">${stL} · ${(q.completedAt||q.failedAt||'').slice(0,10)}</div>
              <button onclick="deleteNpcDlgQuest('${esc(q.id)}')" style="padding:2px 7px;background:transparent;border:1px solid #3a3a3a;color:#5a5a5a;font-size:8px;cursor:pointer;border-radius:2px">🗑</button>
            </div>`}
        </div>`;
      }).join(''));
    }
  }catch(e){}

  if(!sections.length){
    body.innerHTML='<div style="text-align:center;padding:20px;color:var(--dim);font-size:11px">진행 중인 퀘스트가 없습니다</div>';
    return;
  }

  // ── 5. AI 동적 생성 퀘스트 ──
  try{
    const dynQuests = loadDynQuests().filter(q => q.grade !== 'S'); // S등급은 메인 퀘스트 섹션에 표시
    if(dynQuests.length){
      const diffColor  = { easy:'#60a060', normal:'#c8a96e', hard:'#e08050', legendary:'#c040c0' };
      const diffLabel  = { easy:'쉬움', normal:'보통', hard:'어려움', legendary:'전설' };
      const typeLabel  = { combat:'전투', explore:'탐험', dialog:'대화', fetch:'수집', protect:'호위', mystery:'미스터리', escort:'에스코트', craft:'제작', escape:'탈출', survival:'생존', general:'일반' };
      const gradeOrder = { S:0, A:1, B:2, C:3, D:4 };
      sections.push(`<div style="font-family:'Cinzel',serif;font-size:9px;color:#80c040;letter-spacing:2px;margin:12px 0 6px;opacity:.9">✦ AI 생성 퀘스트</div>`);
      // S/A 우선, 활성→완료→실패 정렬
      const sorted = [...dynQuests].sort((a,b)=>{
        const gA = gradeOrder[a.grade]||5, gB = gradeOrder[b.grade]||5;
        if(gA !== gB) return gA - gB;
        const order = {active:0, completed:1, failed:2};
        return (order[a.status]||3)-(order[b.status]||3);
      });
      sections.push(sorted.map(q=>{
        const grade   = q.grade || 'B';
        const gi      = (typeof QUEST_GRADES!=='undefined') ? QUEST_GRADES[grade] : null;
        const gradeColor = gi ? gi.color : '#80c040';
        const gradeBadge = gi ? gi.badge : grade;
        const col     = q.status==='completed'?'#60a060':q.status==='failed'?'#e05a5a':gradeColor;
        const stLabel = q.status==='completed'?'완료':q.status==='failed'?'실패':'진행중';
        const dc      = diffColor[q.difficulty]||'var(--gold)';
        const dl      = diffLabel[q.difficulty]||q.difficulty;
        const tl      = typeLabel[q.type]||q.type||'일반';
        const r       = q.reward||{};
        const isActive= q.status==='active';
        const borderLeft = grade==='S' ? `3px solid ${col}` : `2px solid ${col}88`;
        const bgColor    = grade==='S' ? '#0d0200' : grade==='A' ? '#0a0a00' : '#0a1a05';
        return `<div style="padding:10px 11px;background:${bgColor};border:1px solid ${col}44;border-left:${borderLeft};margin-bottom:5px">
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:4px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:14}):(q.icon||"📋")}</span>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">
                <span class="quest-grade-badge qgb-${grade}">${gradeBadge}</span>
                <span style="font-family:'Cinzel',serif;font-size:10px;color:${col};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(q.title)}</span>
              </div>
              <div style="display:flex;gap:4px;flex-wrap:wrap">
                <span style="font-size:7px;padding:1px 5px;border-radius:2px;background:${col}22;color:${col}">${stLabel}</span>
                <span style="font-size:7px;padding:1px 5px;border-radius:2px;background:${dc}22;color:${dc}">${dl}</span>
                <span style="font-size:7px;padding:1px 5px;border-radius:2px;background:#2a2a2a;color:var(--dim)">${tl}</span>
              </div>
            </div>
          </div>
          <div style="font-size:11px;color:var(--dim);line-height:1.5;margin-bottom:4px">${esc(q.desc||'')}</div>
          ${q.lore?`<div style="font-size:9px;color:#4a4a4a;font-style:italic;margin-bottom:4px">${esc(q.lore)}</div>`:''}
          ${(r.gold||r.exp||r.item)?`<div style="font-size:9px;color:#f1c40f;margin-bottom:5px">보상: ${r.gold?'💰'+r.gold:''}${r.exp?' ✨'+r.exp+'exp':''}${r.item?' 🎁'+esc(r.item):''}</div>`:''}
          ${isActive?`<div style="display:flex;align-items:center;gap:6px">
              <div style="flex:1;padding:3px 8px;background:${gradeColor}11;border:1px solid ${gradeColor}33;font-size:8px;color:${gradeColor};font-family:'Cinzel',serif;text-align:center">✔ 진행 중 (조건 달성 시 자동 완료)</div>
              <button onclick="if(confirm('이 퀘스트를 완료 처리할까요? (수동 완료는 서사 판정 없이 즉시 보상이 지급됩니다)'))completeDynQuest('${esc(q.id)}')" style="padding:3px 8px;background:#0a1a0a;border:1px solid #3a6a3a;color:#70c070;font-size:8px;cursor:pointer;border-radius:2px;white-space:nowrap">✓ 완료</button>
              <button onclick="if(confirm('이 퀘스트를 포기할까요?'))failDynQuest('${esc(q.id)}')" style="padding:3px 8px;background:#1a0a0a;border:1px solid #6a3a3a;color:#c07070;font-size:8px;cursor:pointer;border-radius:2px;white-space:nowrap">✕ 포기</button>
            </div>`
            :`<div style="display:flex;align-items:center;gap:6px">
              <div style="flex:1;font-size:8px;color:#3a3a3a;margin-top:2px">${q.status==='completed'?'완료됨':'실패됨'} · ${(q.completedAt||q.failedAt||'').slice(0,10)}</div>
              <button onclick="deleteDynQuest('${esc(q.id)}')" style="padding:2px 7px;background:transparent;border:1px solid #3a3a3a;color:#5a5a5a;font-size:8px;cursor:pointer;border-radius:2px">🗑</button>
            </div>`}
        </div>`;
      }).join(''));
    }
  }catch(e){}


  body.innerHTML = sections.join('');
}
window.renderQuests = renderQuests;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_68(){
function checkJobCondition(job){
  const stats = S.stats||{};
  const lv = loadPlayerLevel()||1;
  const actions = loadJobActions()||{};
  const mem = loadJobMemory()||{};
  const relics = loadOwnedRelics()||[];
  const titles = loadTitles()||[];
  const st = loadStats()||{};

  // 아티팩트/칭호 우회
  const hasBypass = relics.includes('relic_crown')||relics.includes('relic_sword')||
    titles.some(t=>['legend','myth'].includes(t.id));

  const discount = getJobUnlockDiscount(job.id);
  const cond = job.unlockCondition||{};
  const failed = [];

  // 기본 직업은 조건 없음
  if(cond.type==='default') return { met:true, bypass:false, failed:[] };

  // ── 스탯 조건 ──
  if(cond.minStr){ const need=Math.ceil(cond.minStr*discount); if((stats.str||0)<need) failed.push(`근력 ${need}`); }
  if(cond.minAgi){ const need=Math.ceil(cond.minAgi*discount); if((stats.agi||0)<need) failed.push(`민첩 ${need}`); }
  if(cond.minMagic){ const need=Math.ceil(cond.minMagic*discount); if((stats.mgc||0)<need) failed.push(`마법 ${need}`); }
  if(cond.minInt){ const need=Math.ceil(cond.minInt*discount); if((stats.int||0)<need) failed.push(`지성 ${need}`); }
  if(cond.minFaith){ const need=Math.ceil(cond.minFaith*discount); if((stats.fath||0)<need) failed.push(`신앙 ${need}`); }
  if(cond.minPer){ const need=Math.ceil(cond.minPer*discount); if((stats.per||0)<need) failed.push(`지각 ${need}`); }
  if(cond.minLdr){ const need=Math.ceil(cond.minLdr*discount); if((stats.ldr||0)<need) failed.push(`리더십 ${need}`); }
  if(cond.minWil){ const need=Math.ceil(cond.minWil*discount); if((stats.wil||0)<need) failed.push(`의지 ${need}`); }
  if(cond.minEnd){ const need=Math.ceil(cond.minEnd*discount); if((stats.end||0)<need) failed.push(`체력 ${need}`); }
  if(cond.minLevel){ if(lv<cond.minLevel) failed.push(`레벨 ${cond.minLevel}`); }

  // ── 행동 조건 ──
  if(cond.pattern){ const need=Math.ceil((cond.minCount||10)*discount); if((actions[cond.pattern]||0)<need) failed.push(`${cond.pattern} 행동 ${need}회`); }
  if(cond.minInvestCount){ const need=Math.ceil(cond.minInvestCount*discount); if((actions.investigate||0)<need) failed.push(`조사 ${need}회`); }
  if(cond.minHealCount){ const need=Math.ceil(cond.minHealCount*discount); if((actions.heal||0)<need) failed.push(`치유 ${need}회`); }
  if(cond.minSummonCount){ const need=Math.ceil(cond.minSummonCount*discount); if((actions.summon||actions.magic||0)<need) failed.push(`소환 ${need}회`); }
  if(cond.minStealthCount){ const need=Math.ceil(cond.minStealthCount*discount); if((actions.stealth||0)<need) failed.push(`은신 ${need}회`); }
  if(cond.minTradeCount){ const need=Math.ceil(cond.minTradeCount*discount); if((actions.trade||0)<need) failed.push(`거래 ${need}회`); }
  if(cond.minCraftCount){ const need=Math.ceil(cond.minCraftCount*discount); if((actions.craft||0)<need) failed.push(`제작 ${need}회`); }
  if(cond.minResearchCount){ const need=Math.ceil(cond.minResearchCount*discount); if((actions.research||0)<need) failed.push(`연구 ${need}회`); }
  if(cond.minSocialCount){ const need=Math.ceil(cond.minSocialCount*discount); if((actions.social||0)<need) failed.push(`대화/설득 ${need}회`); }
  if(cond.minHuntCount){ const need=Math.ceil(cond.minHuntCount*discount); if((actions.hunt||0)<need) failed.push(`사냥 ${need}회`); }
  if(cond.minRangeCrit){ const need=Math.ceil(cond.minRangeCrit*discount); if((st.rangeCritCount||actions.ranged||0)<need) failed.push(`원거리 대성공 ${need}회`); }
  if(cond.minTimeCount){ const need=Math.ceil(cond.minTimeCount*discount); if((actions.time||actions.magic||0)<need) failed.push(`시공 행동 ${need}회`); }

  // ── 골드 ──
  if(cond.minGold){ const need=Math.ceil(cond.minGold*discount); if((S.gold||0)<need) failed.push(`골드 ${need}`); }

  // ── 사망/대성공 ──
  if(cond.minDeaths){ const need=Math.ceil(cond.minDeaths*discount); if((st.deathCount||0)<need) failed.push(`전투 사망 ${need}회`); }
  if(cond.minCritSuccess){ const need=Math.ceil(cond.minCritSuccess*discount); if((st.critSuccessCount||0)<need) failed.push(`대성공 ${need}회`); }
  if(cond.minConsecCrit){ if((st.critSuccessCount||0)<(cond.minConsecCrit*discount)) failed.push(`연속 대성공 ${cond.minConsecCrit}회`); }
  if(cond.minBattleWins){ const need=Math.ceil(cond.minBattleWins*discount); if((st.battleWins||st.winCount||0)<need) failed.push(`전투 승리 ${need}회`); }

  // ── 업보 ──
  if(cond.minKarma){ if((stats.krma||0)<cond.minKarma) failed.push(`업보 ${cond.minKarma}`); }
  if(cond.maxKarma !== undefined){ if((stats.krma||0)>cond.maxKarma) failed.push(`업보 ${cond.maxKarma} 이하`); }

  // ── NPC 조건 ──
  if(cond.minEnemyNpc){ const npcs=loadNPCs()||[]; if(npcs.filter(n=>(n.relationship||50)<40).length<cond.minEnemyNpc) failed.push(`적대 NPC ${cond.minEnemyNpc}명`); }
  if(cond.minAllyNpc){ const npcs=loadNPCs()||[]; if(npcs.filter(n=>(n.relationship||50)>=70).length<cond.minAllyNpc) failed.push(`우호 NPC ${cond.minAllyNpc}명`); }
  if(cond.npcAffection){
    const {name, min} = cond.npcAffection;
    if(!hasNpcAffection(name, min)) failed.push(`'${name}' 호감도 ${min} 이상`);
  }

  // ── 📜 퀘스트 완료 조건 ── (NEW)
  if(cond.requireQuest){
    const quests = Array.isArray(cond.requireQuest) ? cond.requireQuest : [cond.requireQuest];
    quests.forEach(qk=>{
      if(!hasCompletedQuest(qk)) failed.push(`퀘스트 완료: 「${qk}」`);
    });
  }

  // ── 🎒 특정 아이템 보유 조건 ── (NEW)
  if(cond.requireItem){
    const items = Array.isArray(cond.requireItem) ? cond.requireItem : [cond.requireItem];
    items.forEach(ik=>{
      if(!hasItemInInventory(ik)) failed.push(`아이템 보유: 「${ik}」`);
    });
  }

  // ── 🗺️ 장소 방문 조건 ── (NEW)
  if(cond.requireLocation){
    const locs = Array.isArray(cond.requireLocation) ? cond.requireLocation : [cond.requireLocation];
    locs.forEach(lk=>{
      if(!hasVisitedLocation(lk)) failed.push(`장소 방문: 「${lk}」`);
    });
  }

  // ── 🏰 세력 가입 조건 ── (NEW)
  if(cond.requireFaction){
    const facs = Array.isArray(cond.requireFaction) ? cond.requireFaction : [cond.requireFaction];
    facs.forEach(fk=>{
      if(!hasJoinedFaction(fk)) failed.push(`세력 가입: 「${fk}」`);
    });
  }

  // ── 🧬 칭호 보유 조건 ── (NEW)
  if(cond.requireTitle){
    const needed = Array.isArray(cond.requireTitle) ? cond.requireTitle : [cond.requireTitle];
    needed.forEach(tk=>{
      if(!titles.some(t=>(t.id||'').includes(tk)||(t.name||'').includes(tk)))
        failed.push(`칭호 보유: 「${tk}」`);
    });
  }

  // ── 🌀 회차 조건 ──
  if(cond.minCycle){
    const cycle = typeof loadCycleCount==='function' ? loadCycleCount() : (S?.cycle||0);
    if(cycle < cond.minCycle) failed.push(`${cond.minCycle}회차 이상`);
  }

  // ── 📅 생존 턴수 조건 ── (NEW)
  if(cond.minTurns){
    if((S?.msgCount||0) < cond.minTurns) failed.push(`${cond.minTurns}턴 이상 생존`);
  }

  if(failed.length===0) return { met:true, bypass:false, failed:[] };
  if(hasBypass) return { met:false, bypass:true, failed };
  return { met:false, bypass:false, failed };
}
window.checkJobCondition = checkJobCondition;

function unlockSkill(sid){
  const sk=getAllSkillDefs().find(s=>s.id===sid); if(!sk) return;
  const info=getSkillUnlockInfo(sk);
  if(!info.canUnlock){ toast(info.spShort?'SP '+info.cost+' 필요 (현재 '+S.skillSP+')':'🔒 '+info.reason); return; }
  const cost=SKILL_TREE_SP_COST(sk);
  if(S.skillSP<cost){ toast('SP '+cost+' 필요'); return; }
  S.unlockedSkills[sid]=true; saveSkills(S.unlockedSkills);
  S.skillSP-=cost; saveSkillSP(S.skillSP);
  toast((info.bypass?'✨ ':'⚡ ')+sk.icon+' '+sk.name+' 해금!'+(info.bypass?' (조건 우회)':''));
  renderSkills();
}
window.unlockSkill = unlockSkill;

function renderWeatherWidget(){
  const widget = document.getElementById('weather-widget');
  if(!widget) return;
  const atm = (typeof loadAtmosphere==='function') ? loadAtmosphere() : {weather:'none',timeOfDay:'none'};
  if(!atm || (atm.weather==='none' && atm.timeOfDay==='none')){
    widget.style.display = 'none';
    return;
  }
  const iconEl = document.getElementById('wx-icon');
  const labelEl = document.getElementById('wx-label');
  if(iconEl) iconEl.textContent = TL_ICON[atm.timeOfDay] || WL_ICON[atm.weather] || '🌍';
  if(labelEl){
    const parts = [];
    if(atm.timeOfDay!=='none') parts.push(TL_TEXT[atm.timeOfDay] || atm.timeOfDay);
    if(atm.weather!=='none' && atm.weather!=='clear') parts.push(WL_TEXT[atm.weather] || atm.weather);
    labelEl.textContent = parts.join(' · ') || '맑음';
  }
  widget.title = [atm.timeOfDay!=='none'?(TL[atm.timeOfDay]||''):'', atm.weather!=='none'?(WL[atm.weather]||''):''].filter(Boolean).join(' / ');
  widget.style.display = 'flex';
}
window.renderWeatherWidget = renderWeatherWidget;

window.renderWeatherWidget = window.renderWeatherWidget;

function syncAutoAtmosphere(){
  const wLabelToKey = { '없음':'none','비':'rain','폭풍':'storm','눈':'snow','안개':'fog','폭염':'scorching','맑음':'clear','흐림':'clear','구름':'clear','천둥':'storm' };
  const forecast = (typeof getWeatherForecast === 'function') ? getWeatherForecast() : [];
  const todayWeatherLabel = forecast[0]?.weather || '맑음';
  const autoWeather = wLabelToKey[todayWeatherLabel] || 'none';
  // ▶ 게임 내 시간 시스템에서 시간대 가져오기 (실제 시각 대신)
  const autoTime = (typeof getCurrentTimePhase==='function')
    ? getCurrentTimePhase().atmoKey
    : (() => { const h=new Date().getHours(); return h<5?'midnight':h<8?'dawn':h<11?'morning':h<13?'midday':h<17?'afternoon':h<19?'evening':h<22?'night':'midnight'; })();
  S.atmosphere = { weather: autoWeather, timeOfDay: autoTime };
  saveAtmosphere(S.atmosphere);
  // [E-1 FIX] 날씨 변경 시 스탯 즉시 재적용
  setTimeout(()=>{ if(typeof applyWeatherStats==='function') applyWeatherStats(); }, 0);
}
window.syncAutoAtmosphere = syncAutoAtmosphere;
}

