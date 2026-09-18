// 보석 박기
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { GEM_GRADES, GEM_TYPES, GEM_UPGRADE_COST } from '../data/175-보석-정의-5종-5등급.js';
import { renderRuneGemPanel } from '../ui/181-UI-패널.js';
import { toast } from '../utils.js';
import { loadEquipped, loadInventory, saveEquipped, saveGold, saveInventory } from './007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { gemEffectText, initItemSockets } from './175-보석-정의-5종-5등급.js';
import { updateRuneGemBonuses } from './179-총-룬보석-보너스-계산-적용.js';

export function socketGem(itemKey, slotIdx, gemTypeId, gemGrade){
  const inv  = typeof loadInventory==='function' ? loadInventory() : [];
  const equip= typeof loadEquipped==='function'  ? loadEquipped()  : {};
  let item   = equip[itemKey];
  let inInv=false, invIdx=-1;
  if(!item){ invIdx=inv.findIndex(function(i){ return i&&(i.id===itemKey||i.name===itemKey); }); if(invIdx!==-1){item=inv[invIdx];inInv=true;} }
  if(!item){ toast('⚠️ 장비를 찾을 수 없습니다', 2000); return false; }
  initItemSockets(item);

  // 보석 보유 체크
  const gemKey = gemTypeId+'_'+gemGrade;
  const gemInvIdx = inv.findIndex(function(i){ return i&&i.gemKey===gemKey; });
  if(gemInvIdx===-1){ toast('⚠️ 해당 보석이 인벤토리에 없습니다', 2000); return false; }
  if(slotIdx<0||slotIdx>=item.sockets.gems.length){ toast('⚠️ 잘못된 보석 슬롯', 2000); return false; }
  if(item.sockets.gems[slotIdx]!==null){ toast('⚠️ 해당 슬롯에 이미 보석이 있습니다', 2500); return false; }

  const gemDef = GEM_TYPES[gemTypeId];
  item.sockets.gems[slotIdx] = { typeId:gemTypeId, grade:gemGrade };
  inv.splice(gemInvIdx,1);

  if(inInv){ inv[invIdx]=item; if(typeof saveInventory==='function') saveInventory(inv); }
  else { equip[itemKey]=item; if(typeof saveEquipped==='function') saveEquipped(equip); }

  const effText = gemEffectText(gemTypeId,gemGrade);
  toast((gemDef?gemDef.icon:'💎')+' '+(gemDef?gemDef.name:gemTypeId)+' ['+gemGrade+'급] 장착! '+effText, 3500);
  renderRuneGemPanel();
  updateRuneGemBonuses();
  return true;
}
window.socketGem = socketGem;

window.socketGem = socketGem;

export function removeGem(itemKey, slotIdx){
  const removeCost = 150;
  if((S.gold||0)<removeCost){ toast('⚠️ 골드 부족 ('+removeCost+'G)', 2000); return false; }
  const equip= typeof loadEquipped==='function' ? loadEquipped() : {};
  const inv  = typeof loadInventory==='function' ? loadInventory() : [];
  let item   = equip[itemKey];
  let inInv=false, invIdx=-1;
  if(!item){ invIdx=inv.findIndex(function(i){ return i&&(i.id===itemKey||i.name===itemKey); }); if(invIdx!==-1){item=inv[invIdx];inInv=true;} }
  if(!item||!item.sockets){ toast('⚠️ 장비를 찾을 수 없습니다', 2000); return false; }
  const gem = item.sockets.gems[slotIdx];
  if(!gem){ toast('⚠️ 해당 슬롯에 보석이 없습니다', 2000); return false; }

  item.sockets.gems[slotIdx]=null;
  S.gold -= removeCost;
  // [버그 수정] else if라서 saveGold가 있으면(항상 있음) updateHeader가
  // 절대 실행되지 않아 헤더의 골드 표시가 갱신되지 않던 문제 — 둘 다
  // 실행하도록 분리.
  if(typeof saveGold==='function') saveGold(S.gold);
  if(typeof window.updateHeader==='function') window.updateHeader();

  // 보석 반환
  const gemKey = gem.typeId+'_'+gem.grade;
  const gemDef = GEM_TYPES[gem.typeId];
  inv.push({ name:(gemDef?gemDef.name:gem.typeId)+' ['+gem.grade+'급]', icon:(gemDef?gemDef.icon:'💎'), gemKey, gemTypeId:gem.typeId, gemGrade:gem.grade, type:'gem', desc:gemEffectText(gem.typeId,gem.grade) });
  if(typeof saveInventory==='function') saveInventory(inv);
  if(inInv){ inv[invIdx]=item; if(typeof saveInventory==='function') saveInventory(inv); }
  else { equip[itemKey]=item; if(typeof saveEquipped==='function') saveEquipped(equip); }
  toast('💎 보석 제거 완료 (-'+removeCost+'G)', 2500);
  renderRuneGemPanel();
  updateRuneGemBonuses();
  return true;
}
window.removeGem = removeGem;

window.removeGem = removeGem;

export function upgradeGem(gemInvIdx){
  const inv = typeof loadInventory==='function' ? loadInventory() : [];
  const gem = inv[gemInvIdx];
  if(!gem||gem.type!=='gem'){ toast('⚠️ 보석이 아닙니다', 2000); return false; }
  const curGrade = gem.gemGrade||'D';
  const nextIdx  = GEM_GRADES.indexOf(curGrade)+1;
  if(nextIdx>=GEM_GRADES.length){ toast('⚠️ 이미 최고 등급입니다 (S급)', 2000); return false; }
  const nextGrade = GEM_GRADES[nextIdx];
  const cost      = GEM_UPGRADE_COST[curGrade]||0;
  // 재료: 같은 보석 3개 필요
  const sameGems = inv.reduce(function(acc,item,i){ if(item&&item.gemKey===gem.gemKey&&i!==gemInvIdx) acc.push(i); return acc; },[]);
  if(sameGems.length<2){ toast('⚠️ 같은 등급 '+gem.gemTypeId+' 보석 3개 필요 (현재 '+(sameGems.length+1)+'개)', 2500); return false; }
  if((S.gold||0)<cost){ toast('⚠️ 골드 부족 ('+cost+'G 필요)', 2000); return false; }

  // 업그레이드
  const gemDef   = GEM_TYPES[gem.gemTypeId];
  const newGemKey= gem.gemTypeId+'_'+nextGrade;
  inv.splice(Math.max(...sameGems.slice(0,2)),1);
  inv.splice(Math.min(...sameGems.slice(0,2)),1);
  // 원본 업그레이드
  gem.gemGrade  = nextGrade;
  gem.gemKey    = newGemKey;
  gem.name      = (gemDef?gemDef.name:gem.gemTypeId)+' ['+nextGrade+'급]';
  gem.desc      = gemEffectText(gem.gemTypeId,nextGrade);
  S.gold -= cost;
  if(typeof saveGold==='function') saveGold(S.gold);
  if(typeof saveInventory==='function') saveInventory(inv);
  toast((gemDef?gemDef.icon:'💎')+' 보석 업그레이드! '+curGrade+'→'+nextGrade+'급 (-'+cost+'G)', 4000);
  renderRuneGemPanel();
  return true;
}
window.upgradeGem = upgradeGem;

window.upgradeGem = upgradeGem;
