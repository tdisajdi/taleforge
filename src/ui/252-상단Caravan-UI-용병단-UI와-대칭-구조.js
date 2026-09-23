// 상단(Caravan) UI — 용병단 UI와 대칭 구조
// Auto-extracted from taleforge.html (original section banner preserved above).
import { MATERIALS } from '../data/075-파트2-C-크래프팅-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { CROP_DEFS, FARM_MANAGER_NAMES, FARM_WORKER_NAMES, LOCATION_FARM_SLOTS } from '../data/252-상단Caravan-UI-용병단-UI와-대칭-구조.js';
import { saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { updateReputation } from '../misc/054-이동수단-시스템.js';
import { loadMaterials, saveMaterials } from '../misc/075-파트2-C-크래프팅-시스템.js';
import { executeContract, getGarrisonDefense, grantMercBandXp, loadMercGarrisons, renderContractsPanel } from '../misc/251-통합-처리-함수-매-AI-응답-후-호출.js';
import { closeFarmSeedPicker, renderFarmPanel } from '../misc/253-SVG-타일-렌더링-작물-단계별-애니메이션.js';
import { getDemesneSeason, loadDemesne } from '../race/260-수인족-패널-렌더.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';

(function(){
  if(document.getElementById('p-contracts')) return;
  const div=document.createElement('div'); div.className='panel-ov'; div.id='p-contracts';
  div.innerHTML=`<div class="panel"><div class="p-hdr"><span class="p-title">💼 의뢰소</span><button class="p-close" onclick="closeP('contracts')">✕</button></div><div class="p-body scrollable" id="pb-contracts"></div></div>`;
  document.body.appendChild(div);
})();

setTimeout(function(){
  try{
    const b=document.querySelector('.btm-bar'); if(!b) return;
    if(!document.getElementById('btn-contracts')){
      const bn=document.createElement('button'); bn.id='btn-contracts'; bn.className='bb';
      bn.style.cssText='color:#c0a030;border-color:#3a2a05'; bn.textContent='💼의뢰소'; bn.title='의뢰소 — 용병/정보상/도적/암살자 고용';
      bn.onclick=function(){ window.openP('contracts'); renderContractsPanel(); }; b.appendChild(bn);
    }
  }catch(e){}
},6000);

export const FARM_KEY = 'tf-farms';

export const FARM_WAREHOUSE_KEY = 'tf-farm-warehouse';

export const FARM_PLOT_SIZE = 4;

export function loadFarms(){
  try{
    const r = JSON.parse(lsGet(FARM_KEY)||'null');
    if(Array.isArray(r)) return r;
  }catch(e){}
  return [];
}
window.loadFarms = loadFarms;

export function saveFarms(d){ try{ lsSet(FARM_KEY, JSON.stringify(d)); }catch(e){} }
window.saveFarms = saveFarms;

export function loadFarmWarehouse(){ try{ return JSON.parse(lsGet(FARM_WAREHOUSE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadFarmWarehouse = loadFarmWarehouse;

export function saveFarmWarehouse(d){ try{ lsSet(FARM_WAREHOUSE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveFarmWarehouse = saveFarmWarehouse;

export function getLocFarmSlotInfo(){
  const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  if(!loc) return null;
  const totalSlots = LOCATION_FARM_SLOTS[loc.type];
  if(!totalSlots) return null; // 농지가 없는 장소 타입(던전/특수지형 등)
  const farms = loadFarms();
  const myFarm = farms.find(f=>f.locId===loc.id);
  const otherOccupied = Math.min(totalSlots-(myFarm?0:1), Math.max(0, Math.floor(totalSlots*0.4))); // 다른 지주가 일부 점유 중이라는 설정
  return { loc, totalSlots, myFarm, otherOccupied, freeSlots: Math.max(0, totalSlots - otherOccupied - (myFarm?1:0)) };
}
window.getLocFarmSlotInfo = getLocFarmSlotInfo;

export function establishFarmHere(){
  const info = getLocFarmSlotInfo();
  if(!info){ toast('🌾 이 장소에는 개설 가능한 농지가 없습니다.'); return; }
  if(info.myFarm){ toast('이미 이 마을에 농장을 갖고 있습니다.'); return; }
  if(info.freeSlots<=0){ toast('🔒 이 마을의 농지 슬롯이 모두 점유되어 있습니다.'); return; }
  const farms = loadFarms();
  const cost = 60 + farms.length*120; // 두 번째 농장부터 비용 상승(원격 관리 부담 반영)
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  farms.push({
    id:'farm_'+Date.now(), locId:info.loc.id, locName:info.loc.name, locType:info.loc.type, locIcon:info.loc.icon||'🏘️',
    plots: Array(FARM_PLOT_SIZE*FARM_PLOT_SIZE).fill(null),
    workers: [], manager: null, neglectTurns: 0, establishedAt: S.msgCount||0,
  });
  saveFarms(farms);
  toast(`🌾 ${info.loc.name}에 새 농장을 개설했습니다! (${info.loc.name} 슬롯 ${info.otherOccupied+farms.length}/${info.totalSlots} 사용 중)`, 4000);
  renderFarmPanel();
}
window.establishFarmHere = establishFarmHere;

export function hireManagerFor(farmId){
  const farms = loadFarms();
  const farm = farms.find(f=>f.id===farmId); if(!farm) return;
  if(farm.manager){ toast('이미 관리자가 있습니다.'); return; }
  const cost = 200;
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  farm.manager = { name:FARM_MANAGER_NAMES[Math.floor(Math.random()*FARM_MANAGER_NAMES.length)]+' 관리인', icon:'🧑‍💼', skill:50+Math.floor(Math.random()*20), loyalty:60, upkeep:15, hiredAt:S.msgCount||0 };
  saveFarms(farms);
  toast(`🧑‍💼 ${farm.manager.name}이 ${farm.locName} 농장의 관리를 맡았습니다. 이제 직접 가지 않아도 자동으로 운영됩니다.`, 4000);
  renderFarmPanel();
}
window.hireManagerFor = hireManagerFor;

export function promoteWorkerToManager(farmId, workerId){
  const farms = loadFarms();
  const farm = farms.find(f=>f.id===farmId); if(!farm) return;
  if(farm.manager){ toast('이미 관리자가 있습니다.'); return; }
  const wIdx = farm.workers.findIndex(w=>w.id===workerId); if(wIdx===-1) return;
  const w = farm.workers[wIdx];
  if(w.loyalty<50){ toast('충성도 50 이상인 일꾼만 관리자로 승진시킬 수 있습니다.'); return; }
  farm.manager = { name:w.name.replace('일꾼','관리인'), icon:'🧑‍💼', skill:40+Math.floor(w.loyalty*0.3), loyalty:w.loyalty, upkeep:w.upkeep+8, hiredAt:S.msgCount||0 };
  farm.workers.splice(wIdx,1);
  saveFarms(farms);
  toast(`🎉 ${farm.manager.name}을 관리자로 승진시켰습니다!`, 3000);
  renderFarmPanel();
}
window.promoteWorkerToManager = promoteWorkerToManager;

export function dismissManager(farmId){
  const farms = loadFarms();
  const farm = farms.find(f=>f.id===farmId); if(!farm||!farm.manager) return;
  toast(`${farm.manager.name}을 해임했습니다.`, 2500);
  farm.manager = null; saveFarms(farms);
  renderFarmPanel();
}
window.dismissManager = dismissManager;

export function hireFarmWorker(farmId){
  const farms = loadFarms();
  const farm = farms.find(f=>f.id===farmId); if(!farm) return;
  const cost = 100 + farm.workers.length*40;
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  if(farm.workers.length >= FARM_PLOT_SIZE*FARM_PLOT_SIZE/2){ toast('🌾 이 농장에는 이미 일꾼이 충분합니다.'); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  farm.workers.push({ id:'fw_'+Date.now(), name:FARM_WORKER_NAMES[Math.floor(Math.random()*FARM_WORKER_NAMES.length)]+' 일꾼', icon:'👨‍🌾', loyalty:65, upkeep:6+Math.floor(Math.random()*5), joinedAt:S.msgCount||0 });
  saveFarms(farms);
  toast(`🤝 ${farm.locName} 농장에 일꾼이 합류했습니다! (현재 ${farm.workers.length}명)`, 3500);
  renderFarmPanel();
}
window.hireFarmWorker = hireFarmWorker;

export function getFarmTaxRate(){
  const rankId = S.character?.socialRankId;
  if(rankId==='serf') return 0.35;
  if(rankId==='slave') return 0.6;
  return 0;
}
window.getFarmTaxRate = getFarmTaxRate;

export function getCropPrice(cropId){
  const def = CROP_DEFS[cropId]; if(!def) return 0;
  const wh = loadFarmWarehouse();
  // 영지를 보유 중이면 영지경영의 계절 시계를 그대로 따르고(세계관 일관성 유지),
  // 영지가 없으면 절대 턴수 기준 독립 계절 사이클을 사용한다.
  let season = null;
  try{
    const d = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(d && d.established && typeof getDemesneSeason==='function'){
      season = getDemesneSeason(d.season||0);
    } else if(typeof getDemesneSeason==='function'){
      season = getDemesneSeason(Math.floor((S.msgCount||0)/20));
    }
  }catch(e){}
  let seasonMod = 1.0;
  if(season){
    if(season.name==='가을') seasonMod = 0.8;
    if(season.name==='겨울') seasonMod = 1.4;
    if(season.name==='여름' && cropId==='cashcrop') seasonMod *= 1.1;
  }
  const wobble = 0.85 + (Math.sin((S.msgCount||0)*0.7 + cropId.length)*0.15 + 0.15);
  const monopolyBonus = wh.monopoly?.[cropId] ? 1.6 : 1.0;
  // 행동숙련 「시세 협상」 패시브: 작물 판매가 +5%
  const masteryBonus = (S.unlockedSkills && S.unlockedSkills['event_haggle_master']) ? 1.05 : 1.0;
  return Math.max(1, Math.round(def.basePrice * seasonMod * wobble * monopolyBonus * masteryBonus));
}
window.getCropPrice = getCropPrice;

export function plantCropAt(farmId, plotIdx, cropId){
  const farms = loadFarms();
  const farm = farms.find(f=>f.id===farmId); if(!farm) return;
  const def = CROP_DEFS[cropId]; if(!def){ toast('알 수 없는 작물'); return; }
  if(farm.plots[plotIdx]!==null){ toast('이미 무언가 심어진 칸입니다.'); return; }
  if(def.karmaReq && ((S.character&&S.character.karmaScore)||50) < def.karmaReq){ toast(`🔒 카르마(악행도) ${def.karmaReq} 이상 필요`); return; }
  if(def.requireSeedItem){
    const idx=(S.inventory||[]).findIndex(i=>i.name===def.requireSeedItem);
    if(idx===-1){ toast(`🔒 「${def.requireSeedItem}」 아이템이 필요합니다.`); return; }
    S.inventory.splice(idx,1); if(typeof saveInventory==='function') saveInventory(S.inventory);
  } else if(def.seedCost>0){
    if((S.gold||0) < def.seedCost){ toast(`골드 부족 (${def.seedCost}G 필요)`); return; }
    S.gold -= def.seedCost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  }
  farm.plots[plotIdx] = { cropId, plantedAt: S.msgCount||0, status:'growing' };
  saveFarms(farms);
  toastHTML(`🌱 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} ${esc(def.name)} 파종 완료! ${esc(def.growTurns)}턴 후 수확 가능.`, 3000);
  renderFarmPanel();
  closeFarmSeedPicker();
}
window.plantCropAt = plantCropAt;

export function harvestPlotAt(farmId, plotIdx){
  const farms = loadFarms();
  const farm = farms.find(f=>f.id===farmId); if(!farm) return;
  const plot = farm.plots[plotIdx]; if(!plot || plot.status!=='ready'){ toast('아직 수확할 수 없습니다.'); return; }
  const def = CROP_DEFS[plot.cropId];
  let qty = 3 + Math.floor(Math.random()*3);
  const disasterChance = Math.min(0.4, 0.08 * def.riskMod);
  let disaster = null;
  if(Math.random() < disasterChance){
    const disasters = ['drought','pest','storm'];
    disaster = disasters[Math.floor(Math.random()*disasters.length)];
    qty = Math.max(0, Math.floor(qty*0.3));
  }
  const taxRate = getFarmTaxRate();
  const taxedQty = Math.floor(qty * taxRate);
  const keptQty = qty - taxedQty;

  if(keptQty>0){
    const wh = loadFarmWarehouse();
    wh[plot.cropId] = (wh[plot.cropId]||0) + keptQty;
    saveFarmWarehouse(wh);
  }
  farm.plots[plotIdx] = null;
  saveFarms(farms);

  if(disaster){
    const dmsg = {drought:'가뭄으로', pest:'병충해로', storm:'폭풍으로'}[disaster];
    toast(`⚠️ ${farm.locName}: ${dmsg} ${def.name} 수확이 크게 줄었다... (${qty}개만 수확, 상납 ${taxedQty})`, 3500);
    S._pendingFarmHint = `${farm.locName}의 ${def.name} 밭에 ${dmsg} 큰 피해를 입어 수확량이 크게 줄었다. 이번 계절 농사가 힘들었다는 사실이 주인공의 생활에 묻어나야 한다.`;
  } else {
    toast(`🌾 ${def.icon} ${def.name} 수확! ${keptQty}개 창고 보관${taxedQty>0?` (영주 상납 ${taxedQty}개)`:''}`, 3000);
    S._pendingFarmHint = `${farm.locName}에서 ${def.name} 수확이 순조롭게 끝났다. 창고에 ${keptQty}개가 쌓였다.`;
  }
  renderFarmPanel();
}
window.harvestPlotAt = harvestPlotAt;

export function sellCrop(cropId, qty){
  const wh = loadFarmWarehouse();
  const have = wh[cropId]||0;
  if(qty>have){ toast('재고가 부족합니다.'); return; }
  const price = getCropPrice(cropId);
  const total = price*qty;
  wh[cropId] = have-qty;
  saveFarmWarehouse(wh);
  if(typeof addGoldWithExchange==='function') addGoldWithExchange(total, '작물 판매'); else { S.gold += total; if(typeof saveGold==='function') saveGold(S.gold); } window.updateHeader&&window.updateHeader();
  if(typeof window.updateStats==='function') window.updateStats('farm_sell_count', qty);
  toastHTML(`💰 ${esc(CROP_DEFS[cropId].icon)} ${esc(CROP_DEFS[cropId].name)} ${esc(qty)}개 판매! +${esc(total)}G`, 2500);
  renderFarmPanel();
}
window.sellCrop = sellCrop;

export function convertCropToMaterial(cropId, qty){
  const def = CROP_DEFS[cropId];
  if(!def?.materialOut){ toast('재료로 변환할 수 없는 작물입니다.'); return; }
  const wh = loadFarmWarehouse();
  const have = wh[cropId]||0;
  if(qty>have){ toast('재고가 부족합니다.'); return; }
  wh[cropId] = have-qty;
  saveFarmWarehouse(wh);
  const mats = (typeof loadMaterials==='function') ? loadMaterials() : {};
  mats[def.materialOut] = (mats[def.materialOut]||0)+qty;
  if(typeof saveMaterials==='function') saveMaterials(mats);
  toast(`⚗️ ${def.name} ${qty}개를 재료로 변환! (${MATERIALS[def.materialOut]?.name||def.materialOut} +${qty})`, 3000);
  renderFarmPanel();
}
window.convertCropToMaterial = convertCropToMaterial;

export const MONOPOLY_THRESHOLD = 40;

export function attemptMonopoly(cropId){
  const wh = loadFarmWarehouse();
  const have = wh[cropId]||0;
  if(have < MONOPOLY_THRESHOLD){ toast(`독점에는 최소 ${MONOPOLY_THRESHOLD}개 재고가 필요합니다. (현재 ${have}개)`); return; }
  wh.monopoly = wh.monopoly||{};
  wh.monopoly[cropId] = true;
  saveFarmWarehouse(wh);
  // 행동숙련 「시장 지배」 패시브: 독점 시 평판 손실 절반
  const hasMarketDominance = S.unlockedSkills && S.unlockedSkills['event_market_dominance'];
  updateReputation(hasMarketDominance ? -8 : -15);
  if(typeof window.updateStats==='function') window.updateStats('farm_monopoly_count', 1);
  toast(`📈 ${CROP_DEFS[cropId].name} 시장을 독점했습니다! 가격이 크게 상승하지만 평판이 떨어집니다.${hasMarketDominance?' (시장 지배 패시브로 손실 절반)':''}`, 4000);
  S._pendingFarmHint = `주인공이 ${CROP_DEFS[cropId].name} 시장을 독점해 가격을 인위적으로 올렸다. 마을 사람들이 비싼 가격에 불만을 가질 수 있다. 사재기로 굶주리는 이가 생기면 주인공을 향한 원망이 서사에 드러나야 한다.`;
  renderFarmPanel();
}
window.attemptMonopoly = attemptMonopoly;

export function releaseMonopoly(cropId){
  const wh = loadFarmWarehouse();
  if(wh.monopoly) delete wh.monopoly[cropId];
  saveFarmWarehouse(wh);
  updateReputation(10);
  toast(`🕊️ ${CROP_DEFS[cropId].name} 독점을 풀고 정상가로 돌렸습니다. 평판+10`, 3000);
  renderFarmPanel();
}
window.releaseMonopoly = releaseMonopoly;

export const FARM_CONTRACT_KEY = 'tf-farm-contract';

export function loadFarmContract(){ try{ return JSON.parse(lsGet(FARM_CONTRACT_KEY)||'null'); }catch(e){ return null; } }
window.loadFarmContract = loadFarmContract;

export function saveFarmContract(d){ try{ lsSet(FARM_CONTRACT_KEY, JSON.stringify(d)); }catch(e){} }
window.saveFarmContract = saveFarmContract;

export function signFarmContract(){
  if(loadFarmContract()){ toast('이미 계약이 체결되어 있습니다.'); return; }
  saveFarmContract({ income:25, turnsLeft:30, exploitRisk:0.12, signedAt:S.msgCount||0 });
  toast('📜 영주와 독점 공급 계약을 체결했습니다. 매 턴 25G 고정 수입, 단 후려치기 위험이 있습니다.', 4000);
  renderFarmPanel();
}
window.signFarmContract = signFarmContract;

export function breakFarmContract(){
  if(!loadFarmContract()){ toast('체결된 계약이 없습니다.'); return; }
  saveFarmContract(null);
  updateReputation(-5);
  toast('📜 계약을 파기했습니다. 평판-5, 영주와의 관계가 악화될 수 있습니다.', 3000);
  renderFarmPanel();
}
window.breakFarmContract = breakFarmContract;

export function tickFarm(){
  const farms = loadFarms();
  if(!farms.length){
    // 농장이 없어도 계약/창고 독점은 유지될 수 있으니 별도 처리 없음
  }
  let changed = false;

  farms.forEach(farm=>{
    // 1. 작물 성장
    farm.plots.forEach((plot)=>{
      if(plot && plot.status==='growing'){
        const def = CROP_DEFS[plot.cropId];
        if((S.msgCount||0) - plot.plantedAt >= def.growTurns){ plot.status='ready'; changed=true; }
      }
    });

    const hasOperator = farm.manager || farm.workers.length>0;
    if(!hasOperator){
      // 관리자도 일꾼도 없는 방치 농장 — 방치 턴 누적, 병충해 위험 상승
      farm.neglectTurns = (farm.neglectTurns||0)+1;
      if(farm.neglectTurns>15 && Math.random()<0.05){
        const filledIdx = farm.plots.map((p,i)=>p?i:-1).filter(i=>i>=0);
        if(filledIdx.length){
          const ri = filledIdx[Math.floor(Math.random()*filledIdx.length)];
          farm.plots[ri] = null;
          toast(`🥀 ${farm.locName} 농장이 방치되어 작물이 시들었습니다. 관리자나 일꾼을 두세요.`, 3500);
          changed = true;
        }
      }
      return;
    }
    farm.neglectTurns = 0;

    // 2. 일꾼/관리자 유지비 + 충성도 + 자동 파종/수확
    const allStaff = [...(farm.manager?[farm.manager]:[]), ...farm.workers];
    const totalUpkeep = allStaff.reduce((s,w)=>s+w.upkeep,0);
    if((S.gold||0) >= totalUpkeep){
      if(totalUpkeep>0){ S.gold -= totalUpkeep; if(typeof saveGold==='function') saveGold(S.gold); }
      allStaff.forEach(w=>{ w.loyalty = Math.min(100, w.loyalty+1); });
      // 관리자가 있으면 자동 수확까지, 일꾼만 있으면 자동 파종만
      if(farm.manager){
        farm.plots.forEach((plot,i)=>{
          if(plot && plot.status==='ready'){
            // 관리자 역량에 따라 자동 수확 성공 — 실패하면 그대로 방치(유실 위험)
            if(Math.random() < (farm.manager.skill/100)){
              const def=CROP_DEFS[plot.cropId];
              const qty = 3+Math.floor(Math.random()*3);
              const wh=loadFarmWarehouse(); wh[plot.cropId]=(wh[plot.cropId]||0)+qty; saveFarmWarehouse(wh);
              farm.plots[i]=null; changed=true;
            }
          }
        });
      }
      farm.plots.forEach((plot,i)=>{
        if(plot===null && Math.random()<0.4){ farm.plots[i] = { cropId:'wheat', plantedAt:S.msgCount||0, status:'growing' }; changed=true; }
      });
      window.updateHeader&&window.updateHeader();
    } else {
      allStaff.forEach(w=>{ w.loyalty = Math.max(0, w.loyalty-15); });
      const deserter = allStaff.find(w=>w.loyalty<=0);
      if(deserter){
        if(farm.manager && farm.manager===deserter){ farm.manager=null; toast(`💸 ${deserter.name}이 임금 미지급으로 ${farm.locName} 농장을 떠났습니다.`,3000); }
        else { farm.workers = farm.workers.filter(w=>w.id!==deserter.id); toast(`💸 ${deserter.name}이 임금 미지급으로 떠났습니다.`, 3000); }
        changed = true;
      }
    }
  });
  if(changed) saveFarms(farms);

  // 3. 계약 수입/후려치기 (전역 1개)
  const contract = loadFarmContract();
  if(contract){
    contract.turnsLeft--;
    if(contract.turnsLeft<=0){
      saveFarmContract(null);
      toast('📜 영주와의 공급 계약이 만료되었습니다.', 3000);
    } else if(Math.random() < contract.exploitRisk){
      toast('📜 영주가 계약 조건을 일방적으로 후려쳤습니다! 이번 턴 수입 없음.', 3500);
      S._pendingFarmHint = '영주가 불공정하게 계약 조건을 바꿔 농부의 몫을 줄였다. 부당함에 대한 감정이 서사에 묻어날 수 있다.';
      saveFarmContract(contract);
    } else {
      if(typeof addGoldWithExchange==='function') addGoldWithExchange(contract.income, '공급 계약 수입'); else { S.gold += contract.income; if(typeof saveGold==='function') saveGold(S.gold); } window.updateHeader&&window.updateHeader();
      saveFarmContract(contract);
    }
  }

  // 4. 도적 습격 (전역 창고 기준) — 용병을 배치해두면 방어를 시도한다.
  const wh = loadFarmWarehouse();
  const hasValuable = Object.entries(wh).some(([k,v])=>k!=='monopoly'&&v>20) || (wh.monopoly && Object.keys(wh.monopoly).length>0);
  if(hasValuable && farms.length>0 && Math.random() < 0.04){
    const defense = (typeof getGarrisonDefense==='function') ? getGarrisonDefense('farm','warehouse') : 0;
    if(defense>0 && Math.random()<defense){
      const garrisons = (typeof loadMercGarrisons==='function') ? loadMercGarrisons() : [];
      const g = garrisons.find(x=>x.siteType==='farm'&&x.siteId==='warehouse');
      if(g && typeof grantMercBandXp==='function') grantMercBandXp(2);
      toast(`🛡️ 도적이 농장 창고를 노렸지만 배치된 용병이 막아냈다!`, 3500);
    } else {
      const cropKeys = Object.keys(wh).filter(k=>k!=='monopoly'&&wh[k]>0);
      if(cropKeys.length){
        const target = cropKeys[Math.floor(Math.random()*cropKeys.length)];
        const lost = Math.ceil((wh[target]||0)*0.3);
        wh[target] = Math.max(0,(wh[target]||0)-lost);
        saveFarmWarehouse(wh);
        toast(`🏴 도적이 농장 창고를 습격해 ${CROP_DEFS[target]?.name||target} ${lost}개를 약탈했다! (창고에 용병을 배치하면 방어 가능)`, 4000);
        S._pendingFarmHint = '도적 무리가 농장 창고를 습격해 곡물을 약탈해갔다. 분노와 무력감, 혹은 다음 대비책을 고민하는 모습이 서사에 드러날 수 있다.';
      }
    }
  }
}
window.tickFarm = tickFarm;

window._tickFarm = tickFarm;

export function getFarmSection(){
  const farms = loadFarms();
  const wh = loadFarmWarehouse();
  let lines=[];
  if(farms.length>0){
    const totalReady = farms.reduce((s,f)=>s+f.plots.filter(p=>p&&p.status==='ready').length,0);
    const totalGrowing = farms.reduce((s,f)=>s+f.plots.filter(p=>p&&p.status==='growing').length,0);
    const unmanaged = farms.filter(f=>!f.manager && !f.workers.length);
    lines.push(`[🌾 농장] ${farms.map(f=>f.locName).join(', ')} 등 ${farms.length}곳에 농장 보유 중. 재배중 ${totalGrowing}칸, 수확대기 ${totalReady}칸.`);
    if(unmanaged.length) lines.push(`[⚠️ 방치 농장] ${unmanaged.map(f=>f.locName).join(', ')}에 관리자나 일꾼이 없어 방치되고 있다.`);
  }
  if(wh.monopoly && Object.keys(wh.monopoly).length>0){
    lines.push(`[📈 시장 독점] ${Object.keys(wh.monopoly).map(k=>CROP_DEFS[k]?.name||k).join(', ')} 시장을 독점 중. 마을 사람들이 가격에 불만을 가질 수 있다.`);
  }
  const contract = loadFarmContract();
  if(contract){ lines.push(`[📜 영주 계약] 독점 공급 계약 진행 중 (남은 ${contract.turnsLeft}턴).`); }
  if(S._pendingFarmHint){ lines.push(`[📜 농장 사건 반영] ${S._pendingFarmHint}`); S._pendingFarmHint=null; }
  return lines.length ? '\n'+lines.join('\n') : '';
}
window.getFarmSection = getFarmSection;

window.getFarmSection = getFarmSection;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_226(){
window.renderContractsPanel = renderContractsPanel;

window.executeContract = executeContract;
}

