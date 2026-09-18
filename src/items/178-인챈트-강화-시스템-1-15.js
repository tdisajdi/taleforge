// 인챈트 강화 시스템 (+1 ~ +15)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { ENHANCE_RATES, ENHANCE_STONES } from '../data/178-인챈트-강화-시스템-1-15.js';
import { renderRuneGemPanel } from '../ui/181-UI-패널.js';
import { esc, toast } from '../utils.js';
import { loadEquipped, loadInventory, saveEquipped, saveGold, saveInventory } from './007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { initItemSockets } from './175-보석-정의-5종-5등급.js';
import { updateRuneGemBonuses } from './179-총-룬보석-보너스-계산-적용.js';

export function enhanceItem2(itemKey, useStone){
  const equip = typeof loadEquipped==='function' ? loadEquipped() : {};
  const inv   = typeof loadInventory==='function' ? loadInventory() : [];
  // [BUG8 FIX] 장착 장비 우선 탐색. itemKey는 슬롯ID(weapon/armor 등)
  let item    = equip[itemKey];
  let inInv=false, invIdx=-1;
  if(!item){
    // 인벤토리에서는 id 또는 name으로 검색 (슬롯ID가 아니므로 별도 처리)
    invIdx=inv.findIndex(function(i){ return i&&(i.id===itemKey||i.name===itemKey); });
    if(invIdx!==-1){item=inv[invIdx];inInv=true;}
  }
  if(!item){ toast('⚠️ 장비를 찾을 수 없습니다', 2000); return; }
  initItemSockets(item);

  const curLv  = item.enhanceLevel||0;
  if(curLv>=15){ toast('⚠️ 이미 최대 강화 (+15)', 2000); return; }
  const rate   = ENHANCE_RATES[curLv];
  if(!rate){ return; }
  if((S.gold||0)<rate.cost){ toast('⚠️ 골드 부족 ('+rate.cost+'G 필요)', 2000); return; }

  // 강화석 효과 적용
  let successRate = rate.success;
  let breakProtect = false;
  if(useStone){
    const stoneDef = ENHANCE_STONES[useStone];
    const stoneIdx = inv.findIndex(function(i){ return i&&i.name===useStone; });
    if(stoneIdx!==-1&&stoneDef){
      successRate  += stoneDef.successBonus;
      breakProtect  = stoneDef.breakProtect;
      inv.splice(stoneIdx,1);
      if(typeof saveInventory==='function') saveInventory(inv);
    }
  }
  // 헬 룬 효과 체크
  if(item.sockets&&item.sockets.runes.includes('rune_hel')) successRate+=10;

  S.gold -= rate.cost;
  // [버그 수정] else if라서 saveGold가 있으면(항상 있음) updateHeader가
  // 절대 실행되지 않아 헤더의 골드 표시가 갱신되지 않던 문제 — 둘 다
  // 실행하도록 분리.
  if(typeof saveGold==='function') saveGold(S.gold);
  if(typeof window.updateHeader==='function') window.updateHeader();

  const roll = Math.random()*100;
  if(roll < successRate){
    // 성공
    item.enhanceLevel = curLv+1;
    // 스탯 보너스 (강화 레벨 × 계수)
    const bonus = curLv>=10?3:curLv>=7?2:1;
    item.enhanceAtk  = (item.enhanceAtk||0)+bonus;
    item.enhanceDef  = (item.enhanceDef||0)+(bonus>1?bonus-1:0);
    item.enhanceHp   = (item.enhanceHp||0)+bonus*3;
    if(inInv){ inv[invIdx]=item; if(typeof saveInventory==='function') saveInventory(inv); }
    else { equip[itemKey]=item; if(typeof saveEquipped==='function') saveEquipped(equip); }
    const sparkle = curLv+1>=10?'✨✨':'✨';
    // [B71 FIX] enhanceCount 통계가 어디서도 갱신되지 않아 "강화의 신"
    // 업적(강화 50회)이 영원히 달성 불가능하던 버그.
    if(typeof window.updateStats==='function') window.updateStats('enhanceCount', 1);
    toast(sparkle+' 강화 성공! '+esc(item.name||itemKey)+' +'+(curLv+1)+' (-'+rate.cost+'G)', 4000);
    if(curLv+1>=10 && typeof addTimelineEvent==='function')
      addTimelineEvent('enhance',esc(item.name||itemKey)+' +'+(curLv+1),{icon:'✨'});
  } else if(!breakProtect && Math.random()*100<rate.break_rate){
    // 파괴
    if(inInv){ inv.splice(invIdx,1); if(typeof saveInventory==='function') saveInventory(inv); }
    else { delete equip[itemKey]; if(typeof saveEquipped==='function') saveEquipped(equip); }
    toast('💔 강화 실패... '+esc(item.name||itemKey)+' 파괴됨 (-'+rate.cost+'G)', 5000);
  } else {
    // 실패 (레벨 유지 or -1)
    if(curLv>=7){ item.enhanceLevel=Math.max(0,curLv-1); }
    if(inInv){ inv[invIdx]=item; if(typeof saveInventory==='function') saveInventory(inv); }
    else { equip[itemKey]=item; if(typeof saveEquipped==='function') saveEquipped(equip); }
    toast('😞 강화 실패. '+(curLv>=7?'레벨 -1':'레벨 유지')+' (-'+rate.cost+'G)', 3000);
  }
  renderRuneGemPanel();
  updateRuneGemBonuses();
}
window.enhanceItem2 = enhanceItem2;

window.enhanceItem2 = enhanceItem2;

export function lockEnhance(itemKey){
  const inv  = typeof loadInventory==='function' ? loadInventory() : [];
  const zodInvIdx = inv.findIndex(function(i){ return i&&i.runeId==='rune_zod'; });
  if(zodInvIdx===-1){ toast('⚠️ 조드 룬이 필요합니다', 2000); return; }
  const equip= typeof loadEquipped==='function' ? loadEquipped() : {};
  const item = equip[itemKey];
  if(!item){ toast('⚠️ 장착된 장비만 가능', 2000); return; }
  initItemSockets(item);
  item.zodLocked=true; item.enhanceLevel=15;
  equip[itemKey]=item; if(typeof saveEquipped==='function') saveEquipped(equip);
  inv.splice(zodInvIdx,1); if(typeof saveInventory==='function') saveInventory(inv);
  toast('♾️ 조드 룬으로 강화 +15 고정! 장비가 파괴되지 않습니다.', 5000);
  renderRuneGemPanel();
}
window.lockEnhance = lockEnhance;

window.lockEnhance = lockEnhance;
