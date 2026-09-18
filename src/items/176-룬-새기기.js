// 룬 새기기
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RUNE_DEFS } from '../data/174-룬-정의-30종.js';
import { renderRuneGemPanel } from '../ui/181-UI-패널.js';
import { toast } from '../utils.js';
import { loadEquipped, loadInventory, saveEquipped, saveGold, saveInventory } from './007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { initItemSockets } from './175-보석-정의-5종-5등급.js';
import { updateRuneGemBonuses } from './179-총-룬보석-보너스-계산-적용.js';

export function engraveRune(itemKey, slotIdx, runeId){
  const inv  = typeof loadInventory==='function' ? loadInventory() : [];
  const equip= typeof loadEquipped==='function'  ? loadEquipped()  : {};

  // 장비 찾기 (인벤 또는 장착 중)
  let item = equip[itemKey];
  let inInv = false;
  let invIdx = -1;
  if(!item){
    invIdx = inv.findIndex(function(i){ return i&&(i.id===itemKey||i.name===itemKey); });
    if(invIdx!==-1){ item=inv[invIdx]; inInv=true; }
  }
  if(!item){ toast('⚠️ 장비를 찾을 수 없습니다', 2000); return false; }
  initItemSockets(item);

  // 룬 보유 체크
  const runeInvIdx = inv.findIndex(function(i){ return i&&i.runeId===runeId; });
  if(runeInvIdx===-1){ toast('⚠️ 해당 룬이 인벤토리에 없습니다', 2000); return false; }

  // 슬롯 유효성
  if(slotIdx<0||slotIdx>=item.sockets.runes.length){ toast('⚠️ 잘못된 룬 슬롯', 2000); return false; }
  if(item.sockets.runes[slotIdx]!==null){ toast('⚠️ 해당 슬롯에 이미 룬이 새겨져 있습니다. 추출 후 사용하세요', 2500); return false; }

  const runeDef = RUNE_DEFS[runeId];
  if(runeDef&&runeDef.slotType!=='any'&&runeDef.slotType!==(item.slotType||item.slot)){
    toast('⚠️ '+runeDef.name+'은(는) '+runeDef.slotType+' 슬롯 전용입니다', 2500); return false;
  }

  // 새기기
  item.sockets.runes[slotIdx] = runeId;
  inv.splice(runeInvIdx,1);

  if(inInv){ inv[invIdx]=item; if(typeof saveInventory==='function') saveInventory(inv); }
  else { equip[itemKey]=item; if(typeof saveEquipped==='function') saveEquipped(equip); }

  toast((runeDef?runeDef.icon:'🔮')+' '+(runeDef?runeDef.name:runeId)+' 새기기 완료!', 3000);
  renderRuneGemPanel();
  updateRuneGemBonuses();
  return true;
}
window.engraveRune = engraveRune;

window.engraveRune = engraveRune;

export function extractRune(itemKey, slotIdx){
  const extractCost = 200;
  if((S.gold||0)<extractCost){ toast('⚠️ 골드 부족 ('+extractCost+'G 필요)', 2000); return false; }

  const equip = typeof loadEquipped==='function' ? loadEquipped() : {};
  const inv   = typeof loadInventory==='function' ? loadInventory() : [];
  let item    = equip[itemKey];
  let inInv=false, invIdx=-1;
  if(!item){ invIdx=inv.findIndex(function(i){ return i&&(i.id===itemKey||i.name===itemKey); }); if(invIdx!==-1){item=inv[invIdx];inInv=true;} }
  if(!item||!item.sockets){ toast('⚠️ 장비를 찾을 수 없습니다', 2000); return false; }

  const runeId = item.sockets.runes[slotIdx];
  if(!runeId){ toast('⚠️ 해당 슬롯에 룬이 없습니다', 2000); return false; }

  // 추출 (50% 확률로 파괴)
  const survive = Math.random()>0.5;
  item.sockets.runes[slotIdx]=null;
  S.gold -= extractCost;
  // [버그 수정] else if라서 saveGold가 있으면(항상 있음) updateHeader가
  // 절대 실행되지 않아 헤더의 골드 표시가 갱신되지 않던 문제 — 둘 다
  // 실행하도록 분리.
  if(typeof saveGold==='function') saveGold(S.gold);
  if(typeof window.updateHeader==='function') window.updateHeader();

  if(survive){
    const runeDef = RUNE_DEFS[runeId];
    inv.push({ name:(runeDef?runeDef.name:runeId), icon:(runeDef?runeDef.icon:'🔮'), runeId, type:'rune', desc:(runeDef?runeDef.effect:'') });
    if(typeof saveInventory==='function') saveInventory(inv);
    toast('✅ 룬 추출 성공! (-'+extractCost+'G)', 3000);
  } else {
    toast('💔 룬 추출 중 파괴됐습니다... (-'+extractCost+'G)', 3000);
  }
  if(inInv){ inv[invIdx]=item; if(typeof saveInventory==='function') saveInventory(inv); }
  else { equip[itemKey]=item; if(typeof saveEquipped==='function') saveEquipped(equip); }
  renderRuneGemPanel();
  updateRuneGemBonuses();
  return true;
}
window.extractRune = extractRune;

window.extractRune = extractRune;
