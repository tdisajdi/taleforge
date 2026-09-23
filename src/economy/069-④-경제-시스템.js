// ④ 경제 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { getSocialRankMechanics } from '../core/084-TaleForge-순수-JS-엔진.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { renderInventory } from '../job/087-전직-조건-저장로드-헬퍼-퀘스트아이템장소-등.js';
import { getActiveWars } from '../npc/067-③-NPC-관계망-시스템.js';
import { getDynamicPriceMultiplier } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { getLocationPriceMult } from './332-정착지-경제-평판-시스템.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';

export const ECONOMY_KEY = 'tf-economy';

export const ECO_INFLATION_KEY   = 'tf-eco-inflation';

export const ECO_TREND_KEY       = 'tf-eco-trend';

export const ECO_TAX_KEY         = 'tf-eco-tax';

export function loadEconomy() {
  try {
    const inf=lsGet(ECO_INFLATION_KEY); const tr=lsGet(ECO_TREND_KEY); const tx=lsGet(ECO_TAX_KEY);
    if (inf!==null) return { inflation:parseFloat(inf)||1.0, marketTrend:tr||'stable', taxRate:parseFloat(tx)||0.1 };
    return JSON.parse(lsGet(ECONOMY_KEY)||'{"inflation":1.0,"marketTrend":"stable","taxRate":0.1}');
  } catch(e) { return {inflation:1.0,marketTrend:'stable',taxRate:0.1}; }
}
window.loadEconomy = loadEconomy;

export function saveEconomy(d) {
  try {
    lsSet(ECO_INFLATION_KEY, String(d.inflation||1.0));
    lsSet(ECO_TREND_KEY,     d.marketTrend||'stable');
    lsSet(ECO_TAX_KEY,       String(d.taxRate||0.1));
    lsSet(ECONOMY_KEY,       JSON.stringify(d));
  } catch(e) {}
}
window.saveEconomy = saveEconomy;

export function getDynamicPrice(basePrice, itemRarity){
  const eco = loadEconomy();
  let price = Math.round(basePrice * eco.inflation);

  // 시장 트렌드
  if(eco.marketTrend === 'boom')   price = Math.round(price * 1.3);
  if(eco.marketTrend === 'crisis') price = Math.round(price * 0.7);

  // 희귀 아이템은 인플레 더 민감
  if(itemRarity === 'legendary') price = Math.round(price * 1.5);
  if(itemRarity === 'rare')      price = Math.round(price * 1.2);

  // [신규] 전쟁 영향 — 세력 전쟁(긴장도 90+)이 있으면 물자 부족으로
  // 물가가 오른다. 기존엔 전쟁이 세력 시뮬레이션 내부 숫자로만 존재해
  // 실제 게임 체감 요소(가격)로 전혀 퍼지지 않던 부분을 메운다. 전쟁
  // 개수에 비례하되 과도해지지 않도록 상한을 둔다(최대 +30%).
  if(typeof getActiveWars==='function'){
    const wars = getActiveWars();
    if(wars.length){
      const warMult = Math.min(1.3, 1 + wars.length * 0.1);
      price = Math.round(price * warMult);
    }
  }

  // 동적 가격 배율 적용 (함수가 존재하는 경우)
  if(typeof getDynamicPriceMultiplier==='function'){
    const _m = getDynamicPriceMultiplier(itemRarity||'misc');
    price = Math.round(price * _m);
  }

  // [10번 후속 라운드] 지금 있는 장소 자체의 실제 번영도/교역로 차단
  // 여부(economy/332) — 습격 피해로 그 장소가 침체되면 여기서 계산되는
  // "현재 시장 물가"(economy/191 패널에 그대로 노출됨)에도 실제로 반영된다.
  try{
    const curLoc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    if(curLoc?.id) price = Math.round(price * getLocationPriceMult(curLoc.id));
  }catch(e){}

  // [신규] 신분별 가격 배율 — 기존엔 신분 텍스트(privilege)에 "면세",
  // "상업 독점권" 같은 설명이 있어도 실제 가격에는 전혀 반영되지 않았다.
  // 노예·부랑자는 더 비싸게 거래당하고, 귀족·왕족은 할인되거나(왕족은
  // 사실상 무료 취급) 실제로 체감되도록 연결한다.
  if(typeof getSocialRankMechanics==='function'){
    const mech = getSocialRankMechanics();
    if(typeof mech.priceMultiplier === 'number'){
      price = Math.round(price * mech.priceMultiplier);
    }
  }
  return Math.max(1, price);
}
window.getDynamicPrice = getDynamicPrice;

export function sellItem(inventoryIdx){
  const item = S.inventory[inventoryIdx];
  if(!item){ toast('아이템을 찾을 수 없습니다'); return; }
  if(item.type === 'key'){ toast('이 아이템은 팔 수 없습니다'); return; }

  // 판매가 = 구매가의 40~60%
  const basePrices = {common:25, uncommon:55, rare:120, epic:200, legendary:280, primal:400};
  const base = basePrices[item.rarity]||25;
  const eco = loadEconomy();
  const sellPrice = Math.round(base * 0.5 * eco.inflation);

  if(!confirm(`${item.icon} ${item.name}\n판매가: 💰${sellPrice}\n판매하겠습니까?`)) return;

  S.inventory.splice(inventoryIdx, 1);
  saveInventory(S.inventory);
  if(typeof addGoldWithExchange==='function') addGoldWithExchange(sellPrice, '아이템 판매');
  else { S.gold += sellPrice; saveGold(S.gold); }
  window.updateStats('totalGoldEarned', sellPrice);
  window.updateHeader();
  toast(`💰 ${item.name} 판매 → +${sellPrice} 골드`, 2000);
  renderInventory();
}
window.sellItem = sellItem;

export function enhanceItem(inventoryIdx){
  const item = S.inventory[inventoryIdx];
  if(!item || item.type !== 'equip'){ toast('장비 아이템만 강화 가능합니다'); return; }

  const enhanceLevel = item._enhanceLevel||0;
  if(enhanceLevel >= 10){ toast('최대 강화 단계에 도달했습니다 (+10)'); return; }

  // 강화 비용: 레벨당 50골드, 희귀도별 추가
  // [13차 감사 FIX] epic·primal 등급이 빠져 있어서(바로 위 sellItem의
  // basePrices엔 있는 등급인데 여기만 없음) 이 두 등급 장비는 강화 비용이
  // ||1 폴백으로 common과 똑같이 계산되던 불균형을 바로잡는다 — rare(4)와
  // legendary(8) 사이/위로 자연스럽게 이어지는 값.
  const rarityMult = {common:1, uncommon:2, rare:4, epic:6, legendary:8, primal:10}[item.rarity]||1;
  const cost = Math.round(50 * rarityMult * (enhanceLevel+1));
  // 성공률: +0~+5 100%, +6~+7 80%, +8 60%, +9 40%, +10 20%
  const successRate = enhanceLevel < 6 ? 100 : enhanceLevel < 8 ? 80 : enhanceLevel < 9 ? 60 : enhanceLevel < 10 ? 40 : 20;

  if(!confirm(`${item.icon} ${item.name} +${enhanceLevel} → +${enhanceLevel+1}\n비용: 💰${cost}\n성공률: ${successRate}%\n강화하겠습니까?`)) return;

  if(S.gold < cost){ toast(`골드가 부족합니다 (${cost} 필요)`); return; }
  S.gold -= cost;
  saveGold(S.gold);

  if(Math.random()*100 < successRate){
    item._enhanceLevel = enhanceLevel+1;
    // 효과 증가 (15%씩)
    if(item.effects){
      Object.keys(item.effects).forEach(k=>{
        if(item.effects[k]>0) item.effects[k] = Math.round(item.effects[k]*1.15);
      });
    }
    item.name = item.name.replace(/ \+\d+$/,'') + ` +${item._enhanceLevel}`;
    saveInventory(S.inventory);
    window.updateHeader();
    toast(`✨ 강화 성공! ${item.name}`, 3000);
  } else {
    toast(`❌ 강화 실패... 골드만 소모됨`, 2500);
  }
  renderInventory();
}
window.enhanceItem = enhanceItem;

export function fusionItems(){
  const inv = S.inventory;
  const groups = {};
  inv.forEach((item,i)=>{
    if(item.type!=='equip') return;
    const key = item.id+'_'+item.rarity;
    if(!groups[key]) groups[key]=[];
    groups[key].push(i);
  });

  const fusionCandidates = Object.entries(groups).filter(([,idxs])=>idxs.length>=3);
  if(!fusionCandidates.length){ toast('합성 가능한 아이템이 없습니다 (같은 아이템 3개 필요)'); return; }

  const [key, indices] = fusionCandidates[0];
  const baseItem = inv[indices[0]];
  // [13차 감사 FIX] 등급 사슬이 rare 다음 바로 legendary로 건너뛰어
  // epic 등급을 완전히 건너뛰고 있었고, legendary 위의 primal(sellItem
  // basePrices엔 있는 이 게임의 실제 최고 등급)로는 아예 합성이 안 됐다.
  // 실제 존재하는 6등급(common~primal) 전체를 한 단계씩 잇는다.
  const nextRarity = {common:'uncommon',uncommon:'rare',rare:'epic',epic:'legendary',legendary:'primal'}[baseItem.rarity];
  if(!nextRarity){ toast('이미 최고 등급 아이템입니다'); return; }

  if(!confirm(`${baseItem.icon} ${baseItem.name} 3개를 합성하여 ${nextRarity} 등급으로 올리겠습니까?`)) return;

  // 3개 제거 후 상위 등급 추가
  const removed = indices.slice(0,3).sort((a,b)=>b-a);
  removed.forEach(i=>S.inventory.splice(i,1));

  const newItem = {...baseItem, rarity: nextRarity, _enhanced:true};
  // 효과 증가
  if(newItem.effects) Object.keys(newItem.effects).forEach(k=>{
    if(newItem.effects[k]>0) newItem.effects[k] = Math.round(newItem.effects[k]*1.5);
  });
  S.inventory.push(newItem);
  saveInventory(S.inventory);
  toastHTML(`⚗️ 합성 성공! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(newItem,{size:14}):(newItem.icon)} ${esc(newItem.name)} (${esc(nextRarity)})`, 3500);
  renderInventory();
}
window.fusionItems = fusionItems;
