// SVG 타일 렌더링 — 작물 단계별 애니메이션
// Auto-extracted from taleforge.html (original section banner preserved above).
import { RC_POINT_COST } from '../data/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { TITLE_DEFS } from '../data/010-스킬-강화-시스템.js';
import { BLUEPRINT_SHOP, CRAFT_RECIPES, MATERIALS } from '../data/075-파트2-C-크래프팅-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { CROP_DEFS } from '../data/252-상단Caravan-UI-용병단-UI와-대칭-구조.js';
import { ACTIVITY_MASTERY_TIERS, ALCHEMY_MATERIALS, ALCHEMY_SITES, BRED_CROP_NAME_PARTS, BRED_CROP_SUFFIX, CLINIC_PATIENT_NAMES, DISMANTLE_YIELD_BY_RARITY, EXPERIMENT_YIELD_BY_RARITY, FORMULA_LORE_SHOP, LIVESTOCK_DEFS, MINING_SITES, NETWORK_TYPES, ORDER_CUSTOMER_NAMES, REMEDY_LORE_SHOP, REMEDY_MATERIALS, REMEDY_SITES, TOMB_RELIC_DEFS, TOMB_TIERS, WORKER_NAMES_WS, WORKSHOP_TYPES } from '../data/253-SVG-타일-렌더링-작물-단계별-애니메이션.js';
import { renderGuildPanelV2, renderNetworkPanel } from '../economy/255-상인-거래소-교역-지부-확장.js';
import { loadInventory, loadRCPoints, registerDynamicBlueprint, saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { renderInventory } from '../job/087-전직-조건-저장로드-헬퍼-퀘스트아이템장소-등.js';
import { loadStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadHiddenQuests } from '../quest/039-NEW-히든-퀘스트-시스템.js';
import { grantTitle } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { MONOPOLY_THRESHOLD, attemptMonopoly, breakFarmContract, convertCropToMaterial, dismissManager, establishFarmHere, getCropPrice, getFarmTaxRate, getLocFarmSlotInfo, harvestPlotAt, hireFarmWorker, hireManagerFor, loadFarmContract, loadFarmWarehouse, loadFarms, plantCropAt, promoteWorkerToManager, releaseMonopoly, saveFarmWarehouse, sellCrop, signFarmContract } from '../ui/252-상단Caravan-UI-용병단-UI와-대칭-구조.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { loadParty, loadReputation, saveParty, updateReputation } from './054-이동수단-시스템.js';
import { hasBlueprint, loadBlueprints, loadMaterials, saveMaterials, unlockBlueprint } from './075-파트2-C-크래프팅-시스템.js';
import { checkFactionPursuit, getCaravanResidentMembers, getResidentMembers, isOrgAbsorbed, loadCaravan, loadCaravanGarrisons, loadMercBand, loadMercGarrisons } from './251-통합-처리-함수-매-AI-응답-후-호출.js';

export function renderCropSVG(cropId, status){
  const def = CROP_DEFS[cropId]; if(!def) return '';
  const color = def.color||'#6a9a3a';
  if(status==='ready'){
    // 수확 가능: 펄스 글로우 + 풍성한 모양
    return `<svg viewBox="0 0 40 40" width="34" height="34">
      <circle cx="20" cy="22" r="14" fill="${color}" opacity="0.25"><animate attributeName="r" values="13;15;13" dur="1.6s" repeatCount="indefinite"/></circle>
      <ellipse cx="20" cy="26" rx="10" ry="6" fill="${color}"/>
      <path d="M20 26 L20 12" stroke="#5a7a3a" stroke-width="2" stroke-linecap="round"/>
      <circle cx="14" cy="16" r="4" fill="${color}"><animate attributeName="cy" values="16;14;16" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="26" cy="15" r="4.5" fill="${color}"><animate attributeName="cy" values="15;13;15" dur="2.3s" repeatCount="indefinite"/></circle>
      <circle cx="20" cy="10" r="4" fill="${color}"><animate attributeName="cy" values="10;8;10" dur="1.8s" repeatCount="indefinite"/></circle>
    </svg>`;
  }
  if(status==='growing'){
    // 성장중: 작은 새싹이 살짝 흔들림
    return `<svg viewBox="0 0 40 40" width="28" height="28">
      <ellipse cx="20" cy="33" rx="9" ry="3" fill="#3a2a10" opacity="0.5"/>
      <g><animateTransform attributeName="transform" type="rotate" values="-4 20 33;4 20 33;-4 20 33" dur="2.4s" repeatCount="indefinite"/>
        <path d="M20 33 L20 20" stroke="#4a8a3a" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M20 24 Q14 22 13 17" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M20 22 Q26 20 27 15" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>
    </svg>`;
  }
  return '';
}
window.renderCropSVG = renderCropSVG;

export function renderPlotTileSVG(farmId, idx, plot){
  if(!plot){
    return `<div class="farm-tile farm-tile-empty" onclick="openFarmSeedPicker('${farmId}',${idx})" style="cursor:pointer">
      <svg viewBox="0 0 40 40" width="40" height="40"><rect x="2" y="2" width="36" height="36" rx="4" fill="#3a2a10"/><rect x="5" y="22" width="30" height="13" rx="2" fill="#4a3515"/><line x1="9" y1="22" x2="9" y2="35" stroke="#2a1d0a" stroke-width="1"/><line x1="17" y1="22" x2="17" y2="35" stroke="#2a1d0a" stroke-width="1"/><line x1="25" y1="22" x2="25" y2="35" stroke="#2a1d0a" stroke-width="1"/><line x1="33" y1="22" x2="33" y2="35" stroke="#2a1d0a" stroke-width="1"/></svg>
      <div class="farm-tile-plus">+</div>
    </div>`;
  }
  const def = CROP_DEFS[plot.cropId];
  const ready = plot.status==='ready';
  const turnsLeft = Math.max(0, def.growTurns - ((S.msgCount||0)-plot.plantedAt));
  // [도트 아이콘] 성장 애니메이션(흔들림/펄스/열매 튀어오름)은 그대로 두고,
  // 어떤 작물인지 한눈에 알 수 있도록 실제 작물 도트 이미지를 모서리에
  // 작은 배지로 얹는다 — 순수 추가 장식이라 기존 SVG 애니메이션과 클릭/
  // 수확 로직에는 전혀 영향 없음.
  const cropBadge = typeof getEntityIconHTML==='function' ? getEntityIconHTML(def,{size:14}) : '';
  return `<div class="farm-tile ${ready?'farm-tile-ready':'farm-tile-growing'}" onclick="${ready?`harvestPlotAt('${farmId}',${idx})`:`toast('⏳ ${esc(def.name)} — ${turnsLeft}턴 후 수확 가능')`}" style="cursor:pointer" title="${esc(def.name)} ${ready?'(수확 가능)':`(${turnsLeft}턴 남음)`}">
    <svg viewBox="0 0 40 40" width="40" height="40" style="position:absolute;top:0;left:0"><rect x="2" y="2" width="36" height="36" rx="4" fill="${ready?'#1a2a0a':'#2a200a'}"/></svg>
    <div style="position:relative;display:flex;align-items:center;justify-content:center;height:100%">${renderCropSVG(plot.cropId, plot.status)}</div>
    ${cropBadge?`<div style="position:absolute;top:1px;left:1px;line-height:0">${cropBadge}</div>`:''}
  </div>`;
}
window.renderPlotTileSVG = renderPlotTileSVG;

export function openFarmSeedPicker(farmId, plotIdx){
  closeFarmSeedPicker();
  const karma = (S.character && S.character.karmaScore) || 50;
  const div = document.createElement('div'); div.id='farm-seed-picker'; div.className='panel-ov open';
  div.style.cssText='z-index:600';
  div.innerHTML = `<div class="panel" style="max-width:320px;margin:auto">
    <div class="p-hdr"><span class="p-title">🌱 씨앗 선택</span><button class="p-close" onclick="closeFarmSeedPicker()">✕</button></div>
    <div class="p-body" style="padding:10px 12px">
      ${Object.entries(CROP_DEFS).map(([k,d])=>{
        const locked = d.karmaReq && karma<d.karmaReq;
        const needItem = d.requireSeedItem && !(S.inventory||[]).some(i=>i.name===d.requireSeedItem);
        const disabled = locked||needItem;
        return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #1a1a05;${disabled?'opacity:0.4':''}">
          <span style="color:${d.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(d,{size:16}):(d.svgIcon||d.icon)}</span>
          <div style="flex:1">
            <div style="font-size:10px;color:var(--text)">${d.name}</div>
            <div style="font-size:8px;color:var(--dim)">${esc(d.desc)} · ${d.growTurns}턴</div>
            ${locked?`<div style="font-size:8px;color:#e04040">🔒 카르마 ${d.karmaReq}+ 필요</div>`:''}
            ${needItem?`<div style="font-size:8px;color:#e04040">🔒 「${d.requireSeedItem}」 필요</div>`:''}
          </div>
          <div style="text-align:right">
            <div style="font-size:9px;color:#c0a030">${d.seedCost>0?d.seedCost+'G':'특수'}</div>
            <button onclick="plantCropAt('${farmId}',${plotIdx},'${k}')" style="padding:3px 8px;background:#0a1500;border:1px solid #3a6a10;color:#6aca6a;font-size:8px;cursor:pointer;margin-top:2px" ${disabled?'disabled':''}>심기</button>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
  document.body.appendChild(div);
}
window.openFarmSeedPicker = openFarmSeedPicker;

export function closeFarmSeedPicker(){ document.getElementById('farm-seed-picker')?.remove(); }
window.closeFarmSeedPicker = closeFarmSeedPicker;

window.openFarmSeedPicker=openFarmSeedPicker;

window.closeFarmSeedPicker=closeFarmSeedPicker;

export function renderFarmPanel(){
  const body=document.getElementById('pb-farm'); if(!body) return;
  const farms = loadFarms();
  const wh = loadFarmWarehouse();
  const taxRate = getFarmTaxRate();
  const locInfo = getLocFarmSlotInfo();
  const contract = loadFarmContract();

  let html = `<div style="padding:8px 12px;background:#0a0a00;border-bottom:1px solid #2a2a05;font-size:9px;color:#7a8a3a;line-height:1.6">🌾 농장 — 마을마다 한정된 농지 슬롯을 임차해 운영한다. 멀리 있는 농장은 관리자가 있어야 자동으로 돌아간다.${taxRate>0?` <span style="color:#e08030">현재 신분 상납률 ${Math.round(taxRate*100)}%</span>`:''}</div>`;

  // 현재 위치에서 새 농장 개설 가능 여부
  if(locInfo && !locInfo.myFarm){
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1a05;background:#0a0800">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#c0b030;margin-bottom:4px">📍 현재 위치: ${esc(locInfo.loc.name)}</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:6px">농지 슬롯 ${locInfo.otherOccupied}/${locInfo.totalSlots} 다른 지주가 점유 · 여유 ${locInfo.freeSlots}칸</div>
      ${locInfo.freeSlots>0?`<button onclick="establishFarmHere()" style="width:100%;padding:6px;background:#0a1500;border:1px solid #3a6a10;color:#6aca6a;font-size:9px;cursor:pointer">🌾 이곳에 새 농장 개설 (${60+farms.length*120}G)</button>`:`<div style="font-size:8px;color:#e04040;text-align:center">🔒 이 마을의 농지 슬롯이 모두 점유되어 있습니다.</div>`}
    </div>`;
  }

  if(!farms.length){
    html += `<div style="padding:20px 12px;text-align:center;color:var(--dim);font-size:10px">아직 농장이 없습니다. 마을·도시를 방문해 농지 슬롯이 비어있다면 개설할 수 있습니다.</div>`;
  }

  // 농장별 카드
  farms.forEach(farm=>{
    const allStaff = [...(farm.manager?[farm.manager]:[]), ...farm.workers];
    const upkeep = allStaff.reduce((s,w)=>s+w.upkeep,0);
    html += `<div style="padding:10px 12px;border-bottom:2px solid #2a2a05">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="font-size:16px">${farm.locIcon}</span>
        <div style="flex:1;font-family:Cinzel,serif;font-size:10px;color:#c0b030">${esc(farm.locName)} 농장</div>
        ${!farm.manager&&!farm.workers.length?'<span style="font-size:8px;color:#e04040">⚠️ 방치중</span>':''}
      </div>
      <div class="farm-grid">
        ${farm.plots.map((plot,i)=>renderPlotTileSVG(farm.id,i,plot)).join('')}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;font-size:8px;color:var(--dim)">
        <span>유지비 ${upkeep}G/턴 · 인력 ${allStaff.length}명</span>
      </div>
      <div style="margin-top:6px">
        ${farm.manager?
          `<div style="display:flex;align-items:center;gap:6px;padding:5px 0;font-size:9px"><span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(farm.manager,{size:16}):(farm.manager.icon)}</span><span style="flex:1;color:var(--text)">${esc(farm.manager.name)} (역량 ${farm.manager.skill})</span><span style="color:${farm.manager.loyalty>=50?'#6aca6a':'#e08030'}">충성${farm.manager.loyalty}</span><button onclick="dismissManager('${farm.id}')" style="padding:2px 6px;background:#1a0000;border:1px solid #5a1010;color:#c03030;font-size:7px;cursor:pointer">해임</button></div>`
          : `<button onclick="hireManagerFor('${farm.id}')" style="width:100%;padding:5px;background:#0a0800;border:1px solid #4a3a10;color:#c0a030;font-size:8px;cursor:pointer;margin-bottom:4px">🧑‍💼 관리자 고용 (200G) — 자동 파종+수확</button>`}
        ${farm.workers.map(w=>`<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:8px"><span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(w,{size:16}):(w.icon)}</span><span style="flex:1;color:var(--text)">${esc(w.name)}</span><span style="color:${w.loyalty>=50?'#6aca6a':'#e08030'}">충성${w.loyalty}</span>${!farm.manager?`<button onclick="promoteWorkerToManager('${farm.id}','${w.id}')" style="padding:2px 6px;background:#0a0a1a;border:1px solid #3a3a6a;color:#8080e0;font-size:7px;cursor:pointer">관리자승진</button>`:''}</div>`).join('')}
        <button onclick="hireFarmWorker('${farm.id}')" style="width:100%;padding:5px;background:#0a0800;border:1px solid #4a3a10;color:#c0a030;font-size:8px;cursor:pointer;margin-top:4px">🤝 일꾼 고용 (${100+farm.workers.length*40}G)</button>
      </div>
    </div>`;
  });

  // 창고 (전역 공유)
  const stockEntries = Object.entries(wh).filter(([k,v])=>k!=='monopoly'&&v>0);
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1a05">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">📦 통합 창고 &amp; 시세</div>
    ${stockEntries.length?stockEntries.map(([cropId,qty])=>{
      const def=CROP_DEFS[cropId]; const price=getCropPrice(cropId);
      const isMonopoly = wh.monopoly?.[cropId];
      return `<div style="padding:6px 0;border-top:1px solid #0a0a00">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)}</span>
          <div style="flex:1;font-size:9px;color:var(--text)">${def.name} × ${qty}개 ${isMonopoly?'<span style="color:#e04040">[독점중]</span>':''}</div>
          <div style="font-size:9px;color:#c0a030">${price}G/개</div>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button onclick="sellCrop('${cropId}',Math.min(5,${qty}))" style="flex:1;padding:3px;background:#0a0800;border:1px solid #4a3a10;color:#c0a030;font-size:7px;cursor:pointer">5개 판매</button>
          <button onclick="sellCrop('${cropId}',${qty})" style="flex:1;padding:3px;background:#0a0800;border:1px solid #4a3a10;color:#c0a030;font-size:7px;cursor:pointer">전량 판매</button>
          ${def.materialOut?`<button onclick="convertCropToMaterial('${cropId}',Math.min(5,${qty}))" style="flex:1;padding:3px;background:#0a0010;border:1px solid #3a1a4a;color:#a060c0;font-size:7px;cursor:pointer">재료 변환</button>`:''}
          ${qty>=MONOPOLY_THRESHOLD && !isMonopoly?`<button onclick="attemptMonopoly('${cropId}')" style="flex:1;padding:3px;background:#1a0000;border:1px solid #6a1010;color:#e04040;font-size:7px;cursor:pointer">독점 시도</button>`:''}
          ${isMonopoly?`<button onclick="releaseMonopoly('${cropId}')" style="flex:1;padding:3px;background:#001a00;border:1px solid #106a10;color:#40e060;font-size:7px;cursor:pointer">독점 해제</button>`:''}
        </div>
      </div>`;
    }).join(''):'<div style="font-size:9px;color:var(--dim);padding:6px 0">창고가 비어있습니다.</div>'}
  </div>`;

  // 창고 호위 — 용병 배치로 도적 습격 방어
  (function(){
    const garrisons = (typeof loadMercGarrisons==='function') ? loadMercGarrisons() : [];
    const g = garrisons.find(x=>x.siteType==='farm' && x.siteId==='warehouse');
    const band = (typeof loadMercBand==='function') ? loadMercBand() : {members:[]};
    const guard = g ? band.members.find(m=>m.id===g.memberId) : null;
    const garrisonableMembers = (typeof getResidentMembers==='function') ? getResidentMembers(band) : band.members;
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1a05">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">🛡️ 창고 호위</div>
      <div style="font-size:8px;color:var(--dim);margin-bottom:6px">${guard?`${guard.name}이(가) 창고를 지키고 있습니다.`:'도적 습격 위험이 있습니다. 용병을 배치하면 방어할 수 있습니다.'}</div>
      ${guard
        ? `<button onclick="ungarrisonMerc('farm','warehouse');renderFarmPanel()" style="padding:3px 10px;background:#0a0800;border:1px solid #5a2a10;color:#c07030;font-size:7px;cursor:pointer">배치 해제</button>`
        : (garrisonableMembers.length && band.established
            ? `<select onchange="if(this.value){garrisonMerc(this.value,'farm','warehouse','농장 창고');renderFarmPanel();}" style="padding:3px 8px;background:#0a0800;border:1px solid #3a2a10;color:#c0a030;font-size:7px">
                <option value="">🛡️ 호위 배치...</option>
                ${garrisonableMembers.map(m=>`<option value="${m.id}">${m.name} (Lv.${m.level||1})</option>`).join('')}
              </select>`
            : `<span style="font-size:7px;color:var(--dim)">${band.established?'배치 가능한 용병 없음':'용병단이 아직 정식 결성되지 않음'} (의뢰소에서 확인)</span>`)
      }
    </div>`;
  })();

  // 창고 호위 — 상단원 배치로 도적 습격 방어 (용병과는 별도 슬롯)
  (function(){
    const garrisons = (typeof loadCaravanGarrisons==='function') ? loadCaravanGarrisons() : [];
    const g = garrisons.find(x=>x.siteType==='farm' && x.siteId==='warehouse');
    const cBand = (typeof loadCaravan==='function') ? loadCaravan() : {members:[]};
    const guard = g ? cBand.members.find(m=>m.id===g.memberId) : null;
    const garrisonableMembers = (typeof getCaravanResidentMembers==='function') ? getCaravanResidentMembers(cBand) : cBand.members;
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1a05">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">🏬 창고 상단원 배치</div>
      <div style="font-size:8px;color:var(--dim);margin-bottom:6px">${guard?`${guard.name}이(가) 창고를 관리하고 있습니다.`:'상단원을 배치하면 도적 습격을 함께 방어합니다.'}</div>
      ${guard
        ? `<button onclick="ungarrisonCaravan('farm','warehouse');renderFarmPanel()" style="padding:3px 10px;background:#0a0800;border:1px solid #5a2a10;color:#c07030;font-size:7px;cursor:pointer">배치 해제</button>`
        : (garrisonableMembers.length && cBand.established
            ? `<select onchange="if(this.value){garrisonCaravan(this.value,'farm','warehouse','농장 창고');renderFarmPanel();}" style="padding:3px 8px;background:#0a0800;border:1px solid #3a2a10;color:#c0a030;font-size:7px">
                <option value="">🏬 상단원 배치...</option>
                ${garrisonableMembers.map(m=>`<option value="${m.id}">${m.name} (Lv.${m.level||1})</option>`).join('')}
              </select>`
            : `<span style="font-size:7px;color:var(--dim)">${cBand.established?'배치 가능한 상단원 없음':'상단이 아직 정식 결성되지 않음'} (의뢰소에서 확인)</span>`)
      }
    </div>`;
  })();

  // 영주 계약
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1a05">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">📜 영주 공급 계약</div>
    ${contract?`<div style="font-size:9px;color:var(--text);margin-bottom:6px">매 턴 ${contract.income}G 고정 수입 · 남은 ${contract.turnsLeft}턴 · 후려치기 위험 ${Math.round(contract.exploitRisk*100)}%</div>
      <button onclick="breakFarmContract()" style="width:100%;padding:5px;background:#1a0000;border:1px solid #6a1010;color:#e04040;font-size:8px;cursor:pointer">계약 파기</button>`:
      `<div style="font-size:9px;color:var(--dim);margin-bottom:6px">독점 공급 계약을 맺으면 매 턴 안정적인 수입이 생기지만, 영주가 일방적으로 조건을 후려칠 위험이 있습니다.</div>
      <button onclick="signFarmContract()" style="width:100%;padding:5px;background:#0a0a00;border:1px solid #4a4a10;color:#c0b030;font-size:8px;cursor:pointer">계약 체결</button>`}
  </div>`;

  // ── 농부 확장 시스템 (가축 사육 / 씨앗 육종 / 계절 축제) ──
  html += (typeof renderFarmExtrasHTML==='function') ? renderFarmExtrasHTML() : '';

  html += `<div style="padding:8px 12px;text-align:center"><button onclick="renderFarmPanel()" style="padding:5px 14px;background:#0a0a00;border:1px solid #3a3a10;color:#5a5a1a;font-size:8px;font-family:Cinzel,serif;cursor:pointer">🔄 새로고침</button></div>`;

  body.innerHTML = html;
}
window.renderFarmPanel = renderFarmPanel;

window.renderFarmPanel = renderFarmPanel;

(function(){
  if(!document.getElementById('farm-tile-style')){
    const style=document.createElement('style'); style.id='farm-tile-style';
    style.textContent=`
      .farm-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:4px; background:#1a1505; padding:6px; border-radius:4px; }
      .farm-tile{ position:relative; aspect-ratio:1/1; display:flex; align-items:center; justify-content:center; border-radius:3px; transition:transform .15s; }
      .farm-tile:active{ transform:scale(0.92); }
      .farm-tile-empty{ background:#2a1f0a; }
      .farm-tile-plus{ position:absolute; color:#6a5a3a; font-size:16px; opacity:0.6; }
      .farm-tile-growing{ background:#1a2505; }
      .farm-tile-ready{ background:#0a2a05; box-shadow:0 0 8px rgba(106,202,106,0.35); }
    `;
    document.head.appendChild(style);
  }
  if(document.getElementById('p-farm')) return;
  const div=document.createElement('div'); div.className='panel-ov'; div.id='p-farm';
  div.innerHTML=`<div class="panel"><div class="p-hdr"><span class="p-title">🌾 농장</span><button class="p-close" onclick="closeP('farm')">✕</button></div><div class="p-body scrollable" id="pb-farm"></div></div>`;
  document.body.appendChild(div);
})();

export function ensureFarmButtonVisible(){
  try{
    const b=document.querySelector('.btm-bar'); if(!b) return;
    const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
    const farms = loadFarms();
    const isFarmer = jobId==='farmer' || jobId.includes('농부') || farms.length>0;
    if(isFarmer && !document.getElementById('btn-farm')){
      const bn=document.createElement('button'); bn.id='btn-farm'; bn.className='bb';
      bn.style.cssText='color:#c0b030;border-color:#4a4a10'; bn.textContent='🌾농장'; bn.title='농장 — 파종/수확/매점매석/일꾼/관리자/계약';
      bn.onclick=function(){ window.openP('farm'); renderFarmPanel(); }; b.appendChild(bn);
    }
  }catch(e){}
}
window.ensureFarmButtonVisible = ensureFarmButtonVisible;

window.ensureFarmButtonVisible = ensureFarmButtonVisible;

export const LIVESTOCK_KEY = 'tf-livestock';

export function loadLivestock(){ try{ const r=JSON.parse(lsGet(LIVESTOCK_KEY)||'[]'); return Array.isArray(r)?r:[]; }catch(e){ return []; } }
window.loadLivestock = loadLivestock;

export function saveLivestock(d){ try{ lsSet(LIVESTOCK_KEY, JSON.stringify(d)); }catch(e){} }
window.saveLivestock = saveLivestock;

export const LIVESTOCK_PRODUCE_KEY = 'tf-livestock-produce';

export function loadLivestockProduce(){ try{ return JSON.parse(lsGet(LIVESTOCK_PRODUCE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadLivestockProduce = loadLivestockProduce;

export function saveLivestockProduce(d){ try{ lsSet(LIVESTOCK_PRODUCE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveLivestockProduce = saveLivestockProduce;

export function buyLivestock(kind){
  const def = LIVESTOCK_DEFS[kind]; if(!def) return;
  const farms = (typeof loadFarms==='function') ? loadFarms() : [];
  if(!farms.length){ toast('먼저 농장을 보유해야 가축을 들일 수 있습니다.'); return; }
  const livestock = loadLivestock();
  if(livestock.length>=12){ toast('축사가 가득 찼습니다. (최대 12마리)'); return; }
  if((S.gold||0) < def.price){ toast(`골드 부족 (${def.price}G 필요)`); return; }
  S.gold -= def.price; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  livestock.push({ id:'live_'+Date.now()+'_'+Math.floor(Math.random()*1000), kind, health:100, lastYieldAt:S.msgCount||0 });
  saveLivestock(livestock);
  toast(`${def.name}을(를) 들였습니다! (현재 ${livestock.length}마리)`, 3000, def);
  renderFarmPanel();
}
window.buyLivestock = buyLivestock;

export function sellLivestockProduce(productKey, qty){
  const produce = loadLivestockProduce();
  const have = produce[productKey]||0;
  if(qty>have){ toast('재고가 부족합니다.'); return; }
  const def = Object.values(LIVESTOCK_DEFS).find(d=>d.product===productKey);
  if(!def) return;
  const total = def.productPrice*qty;
  produce[productKey] = have-qty;
  saveLivestockProduce(produce);
  S.gold += total; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  toast(`💰 ${def.productIcon} ${def.productName} ${qty}개 판매! +${total}G`, 2500);
  renderFarmPanel();
}
window.sellLivestockProduce = sellLivestockProduce;

export function tickLivestock(){
  const livestock = loadLivestock();
  if(!livestock.length) return;
  const produce = loadLivestockProduce();
  let changed = false;
  livestock.forEach(l=>{
    const def = LIVESTOCK_DEFS[l.kind]; if(!def) return;
    if((S.msgCount||0)-(l.lastYieldAt||0) >= def.yieldTurns){
      produce[def.product] = (produce[def.product]||0)+1;
      l.lastYieldAt = S.msgCount||0;
      changed = true;
    }
  });
  if(changed){ saveLivestock(livestock); saveLivestockProduce(produce); }
}
window.tickLivestock = tickLivestock;

window.tickLivestock = tickLivestock;

window.buyLivestock = buyLivestock;

window.sellLivestockProduce = sellLivestockProduce;

export const BRED_CROPS_KEY = 'tf-bred-crops';

export function loadBredCrops(){ try{ return JSON.parse(lsGet(BRED_CROPS_KEY)||'{}'); }catch(e){ return {}; } }
window.loadBredCrops = loadBredCrops;

export function saveBredCrops(d){ try{ lsSet(BRED_CROPS_KEY, JSON.stringify(d)); }catch(e){} }
window.saveBredCrops = saveBredCrops;

export function breedCrops(cropIdA, cropIdB){
  const wh = (typeof loadFarmWarehouse==='function') ? loadFarmWarehouse() : {};
  if((wh[cropIdA]||0)<5 || (wh[cropIdB]||0)<5){ toast('교배에는 각 작물 5개씩이 필요합니다.'); return; }
  wh[cropIdA] -= 5; wh[cropIdB] -= 5;
  if(typeof saveFarmWarehouse==='function') saveFarmWarehouse(wh);

  const success = Math.random() < 0.4;
  if(!success){
    toast('🌱 교배에 실패했습니다. 재료만 소모되었습니다.', 3000);
    S._pendingFarmHint = '두 작물을 교배해보려 했지만 실패했다.';
    renderFarmPanel();
    return;
  }
  const defA = CROP_DEFS[cropIdA], defB = CROP_DEFS[cropIdB];
  const avgPrice = Math.round((defA.basePrice+defB.basePrice)/2 * (1.3+Math.random()*0.5));
  const newName = BRED_CROP_NAME_PARTS[Math.floor(Math.random()*BRED_CROP_NAME_PARTS.length)]+BRED_CROP_SUFFIX[Math.floor(Math.random()*BRED_CROP_SUFFIX.length)];
  const newId = 'bred_'+Date.now();
  const bred = loadBredCrops();
  bred[newId] = {
    name:newName, icon:'🌟', basePrice:avgPrice, growTurns: Math.round((defA.growTurns+defB.growTurns)/2),
    seedCost: Math.round((defA.seedCost+defB.seedCost)/2)+10, riskMod: (defA.riskMod+defB.riskMod)/2,
    color:'#e0a0e0', desc:`${defA.name}과 ${defB.name}을(를) 교배해 탄생한 희귀 변종.`, isBred:true,
  };
  saveBredCrops(bred);
  // CROP_DEFS에 즉시 반영해서 파종 가능하게(런타임 등록)
  CROP_DEFS[newId] = bred[newId];
  toast(`🌟 교배 성공! 새 작물 「${newName}」을(를) 발견했습니다!`, 4500);
  S._pendingFarmHint = `${defA.name}과 ${defB.name}을(를) 교배해 새로운 작물 「${newName}」을(를) 만들어냈다. 이는 농부 사이에서 큰 화제가 될 일이다.`;
  if(typeof window.updateStats==='function') window.updateStats('crops_bred', 1);
  renderFarmPanel();
}
window.breedCrops = breedCrops;

window.breedCrops = breedCrops;

export function restoreBredCrops(){
  const bred = loadBredCrops();
  Object.entries(bred).forEach(([id,def])=>{ if(!CROP_DEFS[id]) CROP_DEFS[id]=def; });
}
window.restoreBredCrops = restoreBredCrops;

restoreBredCrops();

export const FESTIVAL_KEY = 'tf-festival';

export function loadFestivalState(){ try{ return JSON.parse(lsGet(FESTIVAL_KEY)||'null'); }catch(e){ return null; } }
window.loadFestivalState = loadFestivalState;

export function saveFestivalState(d){ try{ lsSet(FESTIVAL_KEY, JSON.stringify(d)); }catch(e){} }
window.saveFestivalState = saveFestivalState;

export function canHostFestival(){
  const wh = (typeof loadFarmWarehouse==='function') ? loadFarmWarehouse() : {};
  const totalStock = Object.entries(wh).filter(([k])=>k!=='monopoly').reduce((s,[,v])=>s+v,0);
  const rep = (typeof loadReputation==='function') ? loadReputation() : {score:0};
  return totalStock>=40 && (rep.score||0)>=50;
}
window.canHostFestival = canHostFestival;

export function hostFestival(){
  if(!canHostFestival()){ toast('🎪 축제를 열려면 창고 재고 40개 이상, 평판 50 이상이 필요합니다.'); return; }
  const cost = 150;
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  const last = loadFestivalState();
  if(last && (S.msgCount||0)-(last.lastHostedAt||0) < 40){ toast(`🎪 축제는 너무 자주 열 수 없습니다. (${40-((S.msgCount||0)-last.lastHostedAt)}턴 후 가능)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  // 창고 작물 일부를 축제에서 소진하고 큰 보상
  const wh = (typeof loadFarmWarehouse==='function') ? loadFarmWarehouse() : {};
  let consumed = 0, festivalIncome = 0;
  Object.keys(wh).forEach(k=>{
    if(k==='monopoly') return;
    const useQty = Math.min(wh[k], 10);
    if(useQty>0){
      festivalIncome += useQty * (CROP_DEFS[k]?.basePrice||5) * 1.8;
      wh[k] -= useQty; consumed += useQty;
    }
  });
  if(typeof saveFarmWarehouse==='function') saveFarmWarehouse(wh);
  festivalIncome = Math.round(festivalIncome);
  S.gold += festivalIncome; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  if(typeof updateReputation==='function') updateReputation(25);

  saveFestivalState({ lastHostedAt:S.msgCount||0, totalHosted:(last?.totalHosted||0)+1 });
  if(typeof grantTitle==='function' && (last?.totalHosted||0)+1>=3){
    try{ grantTitle('am_festival_patron'); }catch(e){}
  }
  toast(`🎪 수확제를 성공적으로 개최했습니다! 작물 ${consumed}개 소진, +${festivalIncome}G, 평판+25`, 5000);
  S._pendingFarmHint = '주인공이 마을 수확제를 주최했다. 풍성한 작물과 흥겨운 분위기로 마을 전체가 들썩였다. 사람들이 주인공의 이름을 칭송하며 풍년을 기원했다.';
  renderFarmPanel();
}
window.hostFestival = hostFestival;

window.hostFestival = hostFestival;

export function tickFarmExtras(){
  tickLivestock();
}
window.tickFarmExtras = tickFarmExtras;

window.tickFarmExtras = tickFarmExtras;

export function getFarmExtrasSection(){
  let lines=[];
  const livestock = loadLivestock();
  if(livestock.length>0){
    const produce = loadLivestockProduce();
    const produceStr = Object.entries(produce).filter(([,v])=>v>0).map(([k,v])=>{
      const def = Object.values(LIVESTOCK_DEFS).find(d=>d.product===k);
      return `${def?.productName||k} ${v}개`;
    }).join(', ');
    lines.push(`[🐄 축사] ${livestock.length}마리 사육 중.${produceStr?` 생산물: ${produceStr}`:''}`);
  }
  const bred = loadBredCrops();
  if(Object.keys(bred).length>0){
    lines.push(`[🌟 육종 작물] ${Object.values(bred).map(b=>b.name).join(', ')}을(를) 보유 중.`);
  }
  return lines.length ? '\n'+lines.join('\n') : '';
}
window.getFarmExtrasSection = getFarmExtrasSection;

window.getFarmExtrasSection = getFarmExtrasSection;

export function renderFarmExtrasHTML(){
  const livestock = loadLivestock();
  const produce = loadLivestockProduce();
  const wh = (typeof loadFarmWarehouse==='function') ? loadFarmWarehouse() : {};
  const cropEntries = Object.entries(wh).filter(([k,v])=>k!=='monopoly'&&v>=5);

  let html = `<div style="padding:10px 12px;border-bottom:1px solid #1a1a05;background:#0a0a02">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a060;margin-bottom:6px">🐄 축사 (${livestock.length}/12)</div>
    <div style="display:flex;gap:4px;margin-bottom:8px">
      ${Object.entries(LIVESTOCK_DEFS).map(([k,d])=>`<button onclick="buyLivestock('${k}')" style="flex:1;padding:5px;background:#0a0a02;border:1px solid #4a3a10;color:#c0a060;font-size:8px;cursor:pointer">${d.icon} ${d.name} ${d.price}G</button>`).join('')}
    </div>
    ${livestock.length?`<div style="font-size:8px;color:var(--dim);margin-bottom:6px">${Object.entries(LIVESTOCK_DEFS).map(([k,d])=>{ const cnt=livestock.filter(l=>l.kind===k).length; return cnt>0?`${typeof getEntityIconHTML==='function'?getEntityIconHTML(d,{size:8}):(d.icon)}${cnt}마리`:''; }).filter(Boolean).join(' · ')}</div>`:''}
    ${Object.entries(produce).filter(([,v])=>v>0).map(([k,v])=>{
      const def = Object.values(LIVESTOCK_DEFS).find(d=>d.product===k);
      return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:8px">
        <span>${def.productIcon}</span><span style="flex:1;color:var(--text)">${def.productName} × ${v}</span>
        <button onclick="sellLivestockProduce('${k}',${v})" style="padding:2px 6px;background:#0a0a02;border:1px solid #4a3a10;color:#c0a060;font-size:7px;cursor:pointer">판매(${def.productPrice*v}G)</button>
      </div>`;
    }).join('')}
  </div>`;

  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1a05">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c060c0;margin-bottom:6px">🌟 씨앗 육종 (각 작물 5개씩 소모, 성공률 40%)</div>
    ${cropEntries.length>=2?`
      <select id="breed-a" style="width:48%;font-size:8px;background:#0a0a02;color:var(--text);border:1px solid #4a2a4a;margin-right:4%">
        ${cropEntries.map(([k])=>`<option value="${k}">${CROP_DEFS[k]?.icon||''} ${CROP_DEFS[k]?.name||k}</option>`).join('')}
      </select>
      <select id="breed-b" style="width:48%;font-size:8px;background:#0a0a02;color:var(--text);border:1px solid #4a2a4a">
        ${cropEntries.map(([k])=>`<option value="${k}">${CROP_DEFS[k]?.icon||''} ${CROP_DEFS[k]?.name||k}</option>`).join('')}
      </select>
      <button onclick="breedCrops(document.getElementById('breed-a').value, document.getElementById('breed-b').value)" style="width:100%;margin-top:6px;padding:5px;background:#0a0a02;border:1px solid #4a2a4a;color:#c060c0;font-size:8px;cursor:pointer">🌟 교배 시도</button>
    `:`<div style="font-size:8px;color:var(--dim)">교배하려면 두 종류 이상의 작물이 각 5개 이상 필요합니다.</div>`}
    ${Object.values(loadBredCrops()).length?`<div style="font-size:8px;color:#e0a0e0;margin-top:6px">보유 육종 작물: ${Object.values(loadBredCrops()).map(b=>b.name).join(', ')}</div>`:''}
  </div>`;

  const canFest = canHostFestival();
  const festState = loadFestivalState();
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1a05">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#e0a040;margin-bottom:6px">🎪 계절 축제 (개최 ${festState?.totalHosted||0}회)</div>
    <div style="font-size:8px;color:var(--dim);margin-bottom:6px">조건: 창고 재고 40개+ · 평판 50+ · 비용 150G. 재고 일부 소진하고 큰 수익+평판을 얻습니다.</div>
    <button onclick="hostFestival()" style="width:100%;padding:6px;background:${canFest?'#0a0a02':'#0a0a0a'};border:1px solid ${canFest?'#6a5a10':'#3a3a3a'};color:${canFest?'#e0a040':'#666'};font-size:8px;cursor:pointer">🎪 수확제 개최 (150G)</button>
  </div>`;

  return html;
}
window.renderFarmExtrasHTML = renderFarmExtrasHTML;

window.renderFarmExtrasHTML = renderFarmExtrasHTML;

setTimeout(ensureFarmButtonVisible, 6000);

export const GRAVE_KEY = 'tf-graveyard';

export function loadGraveyard(){
  try{
    const r = JSON.parse(lsGet(GRAVE_KEY)||'null');
    if(r) return r;
  }catch(e){}
  return { established:false, level:1, upkeepPaid:true, relicInventory:[], guidedSouls:0, exorcisedSouls:0, ignoredSouls:0, lastEventTurn:0, curseStacks:0 };
}
window.loadGraveyard = loadGraveyard;

export function saveGraveyard(d){ try{ lsSet(GRAVE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveGraveyard = saveGraveyard;

export function establishGraveyard(){
  const g = loadGraveyard();
  if(g.established){ toast('이미 묘역을 관리하고 있습니다.'); return; }
  const cost = 80;
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  g.established = true; g.level=1; g.upkeepPaid=true; g.lastEventTurn = S.msgCount||0;
  saveGraveyard(g);
  toast('⚱️ 작은 묘역을 맡게 되었습니다. 정성껏 돌보면 마을이 평안해지고, 욕심을 내면 다른 길이 열립니다.', 4000);
  renderGravesPanel();
}
window.establishGraveyard = establishGraveyard;

export function upgradeGraveyard(){
  const g = loadGraveyard();
  if(!g.established) return;
  if(g.level>=5){ toast('묘역이 이미 최고 수준입니다.'); return; }
  const cost = 100*g.level;
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  g.level++; saveGraveyard(g);
  toast(`⚱️ 묘역을 정비했습니다. (레벨 ${g.level}) 추모객 수입과 언데드 억제력이 늘어납니다.`, 3000);
  renderGravesPanel();
}
window.upgradeGraveyard = upgradeGraveyard;

export function tendGraveyard(){
  const g = loadGraveyard();
  if(!g.established){ toast('먼저 묘역을 맡아야 합니다.'); return; }
  const income = 10 + g.level*5;
  S.gold += income; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  updateReputation(2);
  if(typeof window.updateStats==='function') window.updateStats('grave_mourn_count', 1);
  toast(`🕯️ 묘역을 정성껏 돌봤습니다. +${income}G, 평판+2`, 2500);
  S._pendingGraveHint = '주인공이 정성껏 묘역을 돌보며 추모객을 맞았다. 마을 사람들이 그 정성을 알아준다.';
  renderGravesPanel();
}
window.tendGraveyard = tendGraveyard;

export function attemptTombRaid(tierId){
  const tier = TOMB_TIERS.find(t=>t.id===tierId); if(!tier) return;
  const karma = (S.character && S.character.karmaScore) || 50;
  if(karma < tier.karmaReq){ toast(`🔒 카르마(악행도) ${tier.karmaReq} 이상 필요`); return; }
  if((S.gold||0) < tier.digCost){ toast(`골드 부족 (${tier.digCost}G 필요 — 도구·뇌물 등)`); return; }
  if(tier.digCost>0){ S.gold -= tier.digCost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader(); }

  const perStat = (S.stats&&S.stats.per)||50;
  let risk = Math.max(0.02, tier.riskBase - (perStat-50)/500);
  // 행동숙련 「도굴꾼의 감」 패시브: 발각 확률 20% 감소
  if(S.unlockedSkills && S.unlockedSkills['event_grave_robber_luck']) risk *= 0.8;
  const caught = Math.random() < risk;
  const g = loadGraveyard();
  if(typeof window.updateStats==='function') window.updateStats('grave_dig_count', 1);

  if(caught){
    updateReputation(-(10+tier.relicTier*5));
    const cursed = Math.random() < 0.3 + tier.relicTier*0.05;
    if(cursed){
      g.curseStacks = (g.curseStacks||0)+1;
      saveGraveyard(g);
      toast(`☠️ 도굴이 발각되었고, ${tier.name}의 저주가 당신에게 옮겨붙었다! (저주 ${g.curseStacks}단계)`, 4000);
      S._pendingGraveHint = `${tier.name}을 도굴하다 발각되어 저주를 받았다. 몸에 불길한 기운이 스며든 것을 주인공 스스로 느껴야 한다.`;
    } else {
      toast(`🚨 ${tier.name} 도굴이 발각되었습니다! 평판 폭락.`, 3500);
      S._pendingGraveHint = `${tier.name}을 도굴하다 발각되어 도망쳤다. "묘지 모독자"라는 소문이 퍼질 수 있다.`;
    }
    try{ if(typeof checkFactionPursuit==='function') checkFactionPursuit(); }catch(e){}
  } else {
    const pool = TOMB_RELIC_DEFS[tier.relicTier]||[];
    const relic = pool[Math.floor(Math.random()*pool.length)];
    g.relicInventory = g.relicInventory||[];
    g.relicInventory.push({ ...relic, id:'relic_'+Date.now(), fromTier:tier.id, foundAt:S.msgCount||0 });
    saveGraveyard(g);
    toastHTML(`⚱️ ${esc(tier.name)}에서 「${typeof getEntityIconHTML==='function'?getEntityIconHTML(relic,{size:14}):(relic.icon)}${esc(relic.name)}」을 발굴했습니다!`, 3500);
    S._pendingGraveHint = `${tier.name}에서 ${relic.name}을 조용히 발굴해 챙겼다. 아무에게도 들키지 않았다.`;
  }
  renderGravesPanel();
}
window.attemptTombRaid = attemptTombRaid;

export function sellTombRelic(relicId){
  const g = loadGraveyard();
  const idx = (g.relicInventory||[]).findIndex(r=>r.id===relicId); if(idx===-1) return;
  const relic = g.relicInventory[idx];
  const toShadow = isOrgAbsorbed && typeof isOrgAbsorbed==='function' && isOrgAbsorbed('assassins');
  const price = toShadow ? Math.round(relic.price*1.4) : relic.price;
  g.relicInventory.splice(idx,1); saveGraveyard(g);
  S.gold += price; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  toast(`💰 「${relic.name}」 판매! +${price}G${toShadow?' (그림자 결사 고가 매입)':''}`, 3000);
  renderGravesPanel();
}
window.sellTombRelic = sellTombRelic;

export function keepTombRelic(relicId){
  const g = loadGraveyard();
  const idx = (g.relicInventory||[]).findIndex(r=>r.id===relicId); if(idx===-1) return;
  const relic = g.relicInventory[idx];
  g.relicInventory.splice(idx,1); saveGraveyard(g);
  if(!S.inventory) S.inventory=[];
  S.inventory.push({ name:relic.name, icon:relic.icon, type:'relic', effects:relic.effects||{}, desc:'무덤에서 발굴한 유물.' });
  if(typeof saveInventory==='function') saveInventory(S.inventory);
  toast(`🎒 「${relic.name}」을 직접 소지합니다.`, 2500);
  renderGravesPanel();
}
window.keepTombRelic = keepTombRelic;

export function resolveSoulEvent(choice){
  const g = loadGraveyard();
  const wil = (S.stats&&S.stats.wil)||50;
  if(choice==='guide'){
    let successRate = 0.5 + (wil-50)/200;
    // 행동숙련 「영혼의 속삭임」 패시브: 인도 성공률 +15%p
    if(S.unlockedSkills && S.unlockedSkills['event_soul_whisper']) successRate += 0.15;
    const success = Math.random() < successRate;
    if(success){
      g.guidedSouls = (g.guidedSouls||0)+1;
      updateReputation(8);
      if(typeof window.updateStats==='function') window.updateStats('grave_soul_guided_count', 1);
      toast('🕯️ 원혼의 사연을 들어주고 순환으로 인도했습니다. 평판+8', 3500);
      S._pendingGraveHint = '주인공이 떠나지 못한 원혼의 사연을 들어주고 마침내 순환으로 보내주었다. 깊은 안도와 잔잔한 슬픔이 함께 남는다.';
    } else {
      toast('🕯️ 원혼을 인도하려 했으나 실패했다. 원혼이 흩어지며 사라졌다.', 3000);
      S._pendingGraveHint = '원혼을 인도하려 했지만 뜻대로 되지 않아, 원혼이 괴로운 잔상만 남기고 흩어졌다.';
    }
  } else if(choice==='exorcise'){
    g.exorcisedSouls = (g.exorcisedSouls||0)+1;
    updateReputation(2);
    toast('⚡ 원혼을 강제로 퇴마했습니다. 평판+2 (인도와는 다른 방식)', 3000);
    S._pendingGraveHint = '주인공이 힘으로 원혼을 억눌러 떠나보냈다. 깨끗하지만 차가운 방식이었다.';
  } else {
    g.ignoredSouls = (g.ignoredSouls||0)+1;
    if(Math.random()<0.4){
      g.curseStacks = (g.curseStacks||0)+1;
      toast('🌫️ 원혼을 외면했습니다. 원한이 당신에게 스며들었다... (저주 +1)', 3000);
      S._pendingGraveHint = '주인공이 원혼을 외면하고 지나쳤다. 그 원한이 옅은 저주로 남았는지도 모른다.';
    } else {
      toast('🌫️ 원혼을 외면했습니다. 별일 없이 지나갔습니다.', 2500);
    }
  }
  g.activeSoulEvent = null;
  saveGraveyard(g);
  renderGravesPanel();
}
window.resolveSoulEvent = resolveSoulEvent;

export function tickGraveyard(){
  const g = loadGraveyard();
  if(!g.established) return;
  // 원혼 이벤트 (확률, 쿨다운 적용)
  if(!g.activeSoulEvent && (S.msgCount||0)-(g.lastEventTurn||0) >= 6 && Math.random()<0.08){
    g.activeSoulEvent = { appearedAt: S.msgCount||0 };
    g.lastEventTurn = S.msgCount||0;
    saveGraveyard(g);
    toast('👻 떠나지 못한 원혼이 묘역에 나타났습니다. [묘역] 패널에서 대응을 선택하세요.', 4000);
    return;
  }
  saveGraveyard(g);
}
window.tickGraveyard = tickGraveyard;

window._tickGraveyard = tickGraveyard;

export function getGraveSection(){
  const g = loadGraveyard();
  let lines=[];
  if(g.established){
    lines.push(`[⚱️ 묘역] 레벨 ${g.level} 묘역을 관리 중. 발굴 유물 ${ (g.relicInventory||[]).length}개 보유. 영혼 인도 ${g.guidedSouls||0}회.`);
    if(g.curseStacks>0) lines.push(`[☠️ 저주] 도굴/외면으로 누적된 저주 ${g.curseStacks}단계. 불길한 징조가 주인공을 따라다닐 수 있다.`);
    if(g.activeSoulEvent) lines.push(`[👻 원혼 출현] 떠나지 못한 원혼이 묘역에 나타나 있다. 이 사실을 서사에 자연스럽게 등장시켜라.`);
  }
  if(S._pendingGraveHint){ lines.push(`[📜 묘역 사건 반영] ${S._pendingGraveHint}`); S._pendingGraveHint=null; }
  return lines.length ? '\n'+lines.join('\n') : '';
}
window.getGraveSection = getGraveSection;

window.getGraveSection = getGraveSection;

export function renderGravesPanel(){
  const body=document.getElementById('pb-graves'); if(!body) return;
  const g = loadGraveyard();
  const karma = (S.character && S.character.karmaScore) || 50;

  let html = `<div style="padding:8px 12px;background:#0a0a0f;border-bottom:1px solid #1a1a2a;font-size:9px;color:#7a7a9a;line-height:1.6">⚱️ 사자의 안내인 — 묘역을 돌보거나, 무덤을 파헤치거나, 떠나지 못한 자를 인도한다. 모든 선택은 잊히지 않는다.</div>`;

  if(!g.established){
    html += `<div style="padding:20px 12px;text-align:center">
      <div style="font-size:9px;color:var(--dim);margin-bottom:10px">아직 맡은 묘역이 없습니다.</div>
      <button onclick="establishGraveyard()" style="padding:8px 16px;background:#0a0a15;border:1px solid #3a3a5a;color:#a0a0d0;font-size:9px;cursor:pointer">⚱️ 묘역 맡기 (80G)</button>
    </div>`;
    body.innerHTML = html;
    return;
  }

  // 원혼 이벤트
  if(g.activeSoulEvent){
    html += `<div style="padding:12px;border-bottom:2px solid #3a1a4a;background:#0a0515">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#c080e0;margin-bottom:6px">👻 떠나지 못한 원혼</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:8px">묘역 한구석에 흐릿한 형체가 서성이고 있다. 어떻게 대응하시겠습니까?</div>
      <div style="display:flex;gap:4px">
        <button onclick="resolveSoulEvent('guide')" style="flex:1;padding:6px;background:#0a1505;border:1px solid #3a6a10;color:#6aca6a;font-size:8px;cursor:pointer">🕯️ 사연을 듣고 인도</button>
        <button onclick="resolveSoulEvent('exorcise')" style="flex:1;padding:6px;background:#150a05;border:1px solid #6a4a10;color:#e0a040;font-size:8px;cursor:pointer">⚡ 강제로 퇴마</button>
        <button onclick="resolveSoulEvent('ignore')" style="flex:1;padding:6px;background:#0a0a0a;border:1px solid #3a3a3a;color:#888;font-size:8px;cursor:pointer">🌫️ 외면</button>
      </div>
    </div>`;
  }

  // 묘지기 히든 퀘스트 「순환의 마지막 문」 진행 상황
  if(typeof renderGravekeeperLegacySection==='function'){
    html += renderGravekeeperLegacySection(g);
  }

  // 묘역 관리
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1a2a">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#a0a0d0;margin-bottom:6px">⚱️ 묘역 (레벨 ${g.level})</div>
    <div style="font-size:9px;color:var(--dim);margin-bottom:8px">인도 ${g.guidedSouls||0}회 · 퇴마 ${g.exorcisedSouls||0}회 · 외면 ${g.ignoredSouls||0}회 ${g.curseStacks>0?`· <span style="color:#c04040">저주 ${g.curseStacks}단계</span>`:''}</div>
    <div style="display:flex;gap:4px">
      <button onclick="tendGraveyard()" style="flex:1;padding:6px;background:#0a0a15;border:1px solid #3a3a5a;color:#a0a0d0;font-size:8px;cursor:pointer">🕯️ 추모객 응대 (+${10+g.level*5}G)</button>
      ${g.level<5?`<button onclick="upgradeGraveyard()" style="flex:1;padding:6px;background:#0a0a15;border:1px solid #3a3a5a;color:#a0a0d0;font-size:8px;cursor:pointer">⬆️ 정비 (${100*g.level}G)</button>`:''}
    </div>
  </div>`;

  // 도굴
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1a2a">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c04040;margin-bottom:6px">⛏️ 도굴 — 카르마(악행도) ${karma}</div>
    ${TOMB_TIERS.map(tier=>{
      const locked = karma < tier.karmaReq;
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid #0a0a10;${locked?'opacity:0.4':''}">
        <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(tier,{size:16}):(tier.icon)}</span>
        <div style="flex:1">
          <div style="font-size:9px;color:var(--text)">${tier.name}</div>
          <div style="font-size:8px;color:var(--dim)">${esc(tier.desc)} · 발각위험 ${Math.round(tier.riskBase*100)}%</div>
          ${locked?`<div style="font-size:8px;color:#e04040">🔒 카르마 ${tier.karmaReq}+ 필요</div>`:''}
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:9px;color:#c0a030">${tier.digCost>0?tier.digCost+'G':'무료'}</div>
          <button onclick="attemptTombRaid('${tier.id}')" style="padding:3px 8px;background:#150a0a;border:1px solid #5a2a2a;color:#e08080;font-size:8px;cursor:pointer;margin-top:2px" ${locked?'disabled':''}>도굴</button>
        </div>
      </div>`;
    }).join('')}
  </div>`;

  // 발굴 유물 보관
  const relics = g.relicInventory||[];
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1a2a">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">🎒 발굴한 유물 (${relics.length}개)</div>
    ${relics.length?relics.map(r=>`<div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-top:1px solid #0a0a10">
      <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:14}):(r.icon)}</span>
      <div style="flex:1;font-size:9px;color:var(--text)">${esc(r.name)}</div>
      <button onclick="sellTombRelic('${r.id}')" style="padding:3px 6px;background:#0a0800;border:1px solid #4a3a10;color:#c0a030;font-size:7px;cursor:pointer">판매 ${r.price}G</button>
      <button onclick="keepTombRelic('${r.id}')" style="padding:3px 6px;background:#0a0010;border:1px solid #3a1a4a;color:#a060c0;font-size:7px;cursor:pointer">소지</button>
    </div>`).join(''):'<div style="font-size:9px;color:var(--dim)">보관 중인 유물이 없습니다.</div>'}
  </div>`;

  html += `<div style="padding:8px 12px;text-align:center"><button onclick="renderGravesPanel()" style="padding:5px 14px;background:#0a0a10;border:1px solid #2a2a3a;color:#6a6a8a;font-size:8px;font-family:Cinzel,serif;cursor:pointer">🔄 새로고침</button></div>`;

  body.innerHTML = html;
}
window.renderGravesPanel = renderGravesPanel;

window.renderGravesPanel = renderGravesPanel;

window.establishGraveyard=establishGraveyard;

window.upgradeGraveyard=upgradeGraveyard;

window.tendGraveyard=tendGraveyard;

window.attemptTombRaid=attemptTombRaid;

window.sellTombRelic=sellTombRelic;

window.keepTombRelic=keepTombRelic;

window.resolveSoulEvent=resolveSoulEvent;

(function(){
  if(document.getElementById('p-graves')) return;
  const div=document.createElement('div'); div.className='panel-ov'; div.id='p-graves';
  div.innerHTML=`<div class="panel"><div class="p-hdr"><span class="p-title">⚱️ 묘역</span><button class="p-close" onclick="closeP('graves')">✕</button></div><div class="p-body scrollable" id="pb-graves"></div></div>`;
  document.body.appendChild(div);
})();

export function ensureGraveButtonVisible(){
  try{
    const b=document.querySelector('.btm-bar'); if(!b) return;
    const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
    const g = loadGraveyard();
    const isGravekeeper = jobId==='gravekeeper' || jobId.includes('안내인') || g.established;
    if(isGravekeeper && !document.getElementById('btn-graves')){
      const bn=document.createElement('button'); bn.id='btn-graves'; bn.className='bb';
      bn.style.cssText='color:#a0a0d0;border-color:#3a3a5a'; bn.textContent='⚱️묘역'; bn.title='묘역 — 관리/도굴/영혼 인도';
      bn.onclick=function(){ window.openP('graves'); renderGravesPanel(); }; b.appendChild(bn);
    }
  }catch(e){}
}
window.ensureGraveButtonVisible = ensureGraveButtonVisible;

window.ensureGraveButtonVisible = ensureGraveButtonVisible;

setTimeout(ensureGraveButtonVisible, 6000);

export function renderGravekeeperLegacySection(g){
  const hqStored = (typeof loadHiddenQuests==='function') ? loadHiddenQuests() : {};
  const doorQuest = hqStored['hq_final_door'];
  let doorHtml = '';
  if(doorQuest?.status === 'completed'){
    doorHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a1a2a;background:linear-gradient(135deg,#0f0a15,#0a0a0f)">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#a0a0d0;margin-bottom:4px">🕯️ 순환의 마지막 문 — 완료</div>
      <div style="font-size:8px;color:var(--dim)">삶과 죽음의 경계에서 흔들리지 않는 눈을 얻었다.</div>
    </div>`;
  } else if(doorQuest?.status === 'active'){
    doorHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a1a2a;background:#0a0a10">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#a0a0d0;margin-bottom:4px">🕯️ 순환의 마지막 문 — 진행 중</div>
      <div style="font-size:8px;color:var(--dim)">늙은 무덤지기 오스카가 그대에게 오래된 이야기를 들려주고 있다. 이야기를 계속 진행하라.</div>
    </div>`;
  } else if(g.level<3 || ((g.guidedSouls||0)+(g.exorcisedSouls||0))<10){
    doorHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a1a2a">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#5a5a7a;margin-bottom:4px">🕯️ 순환의 마지막 문 — 미발견</div>
      <div style="font-size:8px;color:var(--dim)">묘역 레벨 ${g.level}/3 · 원혼 대응 ${(g.guidedSouls||0)+(g.exorcisedSouls||0)}/10회 — 조건을 채우면 늙은 무덤지기 오스카가 그대에게 이야기를 들려줄 것이다.</div>
    </div>`;
  }
  return doorHtml;
}
window.renderGravekeeperLegacySection = renderGravekeeperLegacySection;

window.renderGravekeeperLegacySection = renderGravekeeperLegacySection;

export function checkActivityMastery(){
  try{
    const st = (typeof loadStats==='function') ? loadStats() : {};
    const owned = (S.titles||[]).map(t=>t.id||t);
    ACTIVITY_MASTERY_TIERS.forEach(tier=>{
      if(owned.includes(tier.titleId)) return; // 이미 보유
      const cur = st[tier.statKey]||0;
      if(cur >= tier.threshold){
        if(typeof grantTitle==='function') grantTitle(tier.titleId);
      }
    });
  }catch(e){}
}
window.checkActivityMastery = checkActivityMastery;

window.checkActivityMastery = checkActivityMastery;

export function getActivityMasteryProgress(){
  const st = (typeof loadStats==='function') ? loadStats() : {};
  const owned = (S.titles||[]).map(t=>t.id||t);
  return ACTIVITY_MASTERY_TIERS.map(tier=>{
    const cur = st[tier.statKey]||0;
    const titleDef = (typeof TITLE_DEFS!=='undefined') ? TITLE_DEFS.find(t=>t.id===tier.titleId) : null;
    return { ...tier, current:cur, achieved:owned.includes(tier.titleId), titleDef };
  });
}
window.getActivityMasteryProgress = getActivityMasteryProgress;

window.getActivityMasteryProgress = getActivityMasteryProgress;

export const GUILDS_KEY = 'tf-guilds-v2';

export const MAX_GUILD_MEMBERSHIPS = 2;

export function loadGuilds(){
  try{ return JSON.parse(lsGet(GUILDS_KEY)||'[]'); }catch(e){ return []; }
}
window.loadGuilds = loadGuilds;

export function saveGuilds(d){ try{ lsSet(GUILDS_KEY, JSON.stringify(d)); }catch(e){} }
window.saveGuilds = saveGuilds;

export function joinGuildV2(guildId){
  const def = GUILD_DEFS[guildId]; if(!def){ toast('알 수 없는 길드'); return; }
  const guilds = loadGuilds();
  if(guilds.find(g=>g.id===guildId)){ toast('이미 가입된 길드입니다.'); return; }
  if(guilds.length >= MAX_GUILD_MEMBERSHIPS){
    toast(`최대 ${MAX_GUILD_MEMBERSHIPS}개 길드까지만 동시 가입할 수 있습니다.`); return;
  }
  const cost = def.joinReq?.goldCost||0;
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  if(cost>0){ S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader(); }
  guilds.push({ id:guildId, rankIdx:0, joinedAt:S.msgCount||0, lastRankupAt:0, statGranted:[] });
  saveGuilds(guilds);
  toast(def.icon+' '+def.events.join, 4000);
  S._pendingGuildHint = '주인공이 '+def.name+'에 가입했다. 이 소속이 NPC와의 대화에서 자연스럽게 드러날 수 있다.';
  renderGuildPanelV2();
}
window.joinGuildV2 = joinGuildV2;

export function leaveGuildV2(guildId){
  const def = GUILD_DEFS[guildId]; if(!def) return;
  let guilds = loadGuilds();
  if(!guilds.find(g=>g.id===guildId)){ toast('가입되어 있지 않습니다.'); return; }
  guilds = guilds.filter(g=>g.id!==guildId);
  saveGuilds(guilds);
  toast(def.icon+' '+def.name+'에서 탈퇴했습니다. 등급과 숙련도는 유지됩니다.', 3000);
  S._pendingGuildHint = '주인공이 '+def.name+'을 떠났다. 그 곳에서의 흔적과 평판은 지워지지 않는다.';
  renderGuildPanelV2();
}
window.leaveGuildV2 = leaveGuildV2;

export function checkGuildRankups(){
  const guilds = loadGuilds();
  if(!guilds.length) return;
  const st = (typeof loadStats==='function') ? loadStats() : {};
  let changed = false;
  guilds.forEach(function(m){
    const def = GUILD_DEFS[m.id]; if(!def) return;
    const nextRankIdx = m.rankIdx+1;
    if(nextRankIdx >= def.ranks.length) return;
    const cur = st[def.statKey]||0;
    const needed = def.proficiencyPerRank[nextRankIdx];
    if(cur >= needed){
      m.rankIdx = nextRankIdx; m.lastRankupAt = S.msgCount||0; changed = true;
      toast(def.icon+' ['+def.name+'] 등급 승급! → '+def.ranks[nextRankIdx], 4000);
      const bonusKey = m.id+'_rank'+nextRankIdx;
      if(!m.statGranted.includes(bonusKey)){
        const bonus = (def.statBonusPerRank&&def.statBonusPerRank[nextRankIdx])||{};
        Object.entries(bonus).forEach(function(entry){
          const k=entry[0],v=entry[1];
          if(S.stats && S.stats[k]!==undefined){ S.stats[k] = Math.max(0,Math.min(999,(S.stats[k]||0)+v)); }
        });
        m.statGranted.push(bonusKey);
        try{ window.updateHeader&&window.updateHeader(); }catch(e){}
      }
      const titleId = def.titlePerRank&&def.titlePerRank[nextRankIdx];
      if(titleId && typeof grantTitle==='function') try{ grantTitle(titleId); }catch(e){}
      S._pendingGuildHint = def.name+'에서 '+def.ranks[nextRankIdx]+' 등급으로 승급했다. '+def.events.rank_up;
    }
  });
  if(changed) saveGuilds(guilds);
}
window.checkGuildRankups = checkGuildRankups;

window.checkGuildRankups = checkGuildRankups;

export const WORKSHOP_KEY = 'tf-workshop';

export function loadWorkshop(){
  try{ return JSON.parse(lsGet(WORKSHOP_KEY)||'null'); }catch(e){ return null; }
}
window.loadWorkshop = loadWorkshop;

export function saveWorkshop(d){ try{ lsSet(WORKSHOP_KEY, JSON.stringify(d)); }catch(e){} }
window.saveWorkshop = saveWorkshop;

export function establishWorkshop(type){
  const def = WORKSHOP_TYPES[type]; if(!def) return;
  const existing = loadWorkshop();
  if(existing){ toast('이미 공방을 운영하고 있습니다.'); return; }
  if((S.gold||0) < def.estCost){ toast(`골드 부족 (${def.estCost}G 필요)`); return; }
  S.gold -= def.estCost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  saveWorkshop({
    type, level:1, homeTown: loc?loc.name:'어딘가', orders:[], workers:[], lastOrderTurn:0,
    totalCrafted:0, totalEarned:0,
  });
  toast(`${def.name}을(를) 차렸습니다! ${loc?loc.name+'에 ':''}자리를 잡았습니다.`, 4000, def);
  renderWorkshopPanel();
}
window.establishWorkshop = establishWorkshop;

export function upgradeWorkshop(){
  const ws = loadWorkshop(); if(!ws) return;
  if(ws.level>=5){ toast('공방이 이미 최고 수준입니다.'); return; }
  const cost = 120*ws.level;
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  ws.level++; saveWorkshop(ws);
  toast(`🔧 공방을 확장했습니다. (레벨 ${ws.level}) 주문 빈도와 제작 보너스가 늘어납니다.`, 3500);
  renderWorkshopPanel();
}
window.upgradeWorkshop = upgradeWorkshop;

export function hireWorkshopWorker(){
  const ws = loadWorkshop(); if(!ws){ toast('먼저 공방을 차려야 합니다.'); return; }
  const cost = 90 + ws.workers.length*35;
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  if(ws.workers.length>=4){ toast('이 공방에는 더 이상 직공을 둘 자리가 없습니다.'); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  ws.workers.push({ id:'wsw_'+Date.now(), name:WORKER_NAMES_WS[Math.floor(Math.random()*WORKER_NAMES_WS.length)]+' 직공', icon:'🧑‍🔧', skill:40+Math.floor(Math.random()*20), loyalty:65, upkeep:7+Math.floor(Math.random()*5), joinedAt:S.msgCount||0 });
  saveWorkshop(ws);
  toast(`🤝 직공이 합류했습니다! (현재 ${ws.workers.length}명)`, 3000);
  renderWorkshopPanel();
}
window.hireWorkshopWorker = hireWorkshopWorker;

export function getEligibleRecipes(ws){
  const def = WORKSHOP_TYPES[ws.type];
  return CRAFT_RECIPES.filter(r=>def.categories.includes(r.category));
}
window.getEligibleRecipes = getEligibleRecipes;

export function generateOrder(ws){
  const recipes = getEligibleRecipes(ws);
  if(!recipes.length) return null;
  const recipe = recipes[Math.floor(Math.random()*recipes.length)];
  const qty = 1+Math.floor(Math.random()*2);
  const basePrice = 20 + Object.values(recipe.materials).reduce((s,v)=>s+v,0)*8;
  const reward = Math.round(basePrice*qty*(1+ws.level*0.1));
  const nameList = ws.type==='clinic' ? CLINIC_PATIENT_NAMES : ORDER_CUSTOMER_NAMES;
  return {
    id:'order_'+Date.now()+'_'+Math.floor(Math.random()*1000),
    customer: nameList[Math.floor(Math.random()*nameList.length)],
    recipeId: recipe.id, recipeName: recipe.result.name, recipeIcon: recipe.icon,
    qty, reward, turnsLeft: 12, createdAt: S.msgCount||0,
  };
}
window.generateOrder = generateOrder;

export function fulfillOrder(orderId){
  const ws = loadWorkshop(); if(!ws) return;
  const order = ws.orders.find(o=>o.id===orderId); if(!order) return;
  const recipe = CRAFT_RECIPES.find(r=>r.id===order.recipeId); if(!recipe) return;

  // 인벤토리에 이미 만들어둔 결과물이 있는지 확인
  const haveIdx = (S.inventory||[]).filter(it=>it.name===recipe.result.name).length;
  let madeNow = 0;
  if(haveIdx < order.qty){
    const needed = order.qty - haveIdx;
    const mats = (typeof loadMaterials==='function') ? loadMaterials() : {};
    for(let i=0;i<needed;i++){
      const canMake = Object.entries(recipe.materials).every(([m,q])=>(mats[m]||0)>=q);
      if(!canMake) break;
      Object.entries(recipe.materials).forEach(([m,q])=>{ mats[m]=(mats[m]||0)-q; });
      madeNow++;
    }
    if(typeof saveMaterials==='function') saveMaterials(mats);
  }
  const totalAvailable = haveIdx + madeNow;
  if(totalAvailable < order.qty){
    toast(`🔨 재료/완성품이 부족합니다. (보유 ${totalAvailable}/${order.qty})`); return;
  }
  // 인벤토리에서 결과물 제거(필요한 만큼)
  let removed = 0;
  S.inventory = (S.inventory||[]).filter(it=>{
    if(removed < haveIdx && it.name===recipe.result.name){ removed++; return false; }
    return true;
  });
  if(typeof saveInventory==='function') saveInventory(S.inventory);

  ws.orders = ws.orders.filter(o=>o.id!==orderId);
  ws.totalCrafted = (ws.totalCrafted||0) + order.qty;
  ws.totalEarned = (ws.totalEarned||0) + order.reward;
  saveWorkshop(ws);
  S.gold += order.reward; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  if(typeof updateReputation==='function') updateReputation(4);
  if(typeof window.updateStats==='function') window.updateStats('workshop_orders_fulfilled', 1);
  toast(`✅ ${order.customer}의 주문 「${order.recipeIcon}${order.recipeName}」 납품! +${order.reward}G`, 4000);
  S._pendingWorkshopHint = `${order.customer}의 의뢰로 ${order.recipeName}을(를) 제작해 납품했다. 손님이 만족스러워했다.`;
  renderWorkshopPanel();
}
window.fulfillOrder = fulfillOrder;

export function rejectOrder(orderId){
  const ws = loadWorkshop(); if(!ws) return;
  ws.orders = ws.orders.filter(o=>o.id!==orderId);
  saveWorkshop(ws);
  toast('주문을 거절했습니다.', 2000);
  renderWorkshopPanel();
}
window.rejectOrder = rejectOrder;

export function tickWorkshop(){
  const ws = loadWorkshop(); if(!ws) return;
  let changed = false;

  // 주문 기한 감소 + 만료 처리
  ws.orders.forEach(o=>{ o.turnsLeft--; });
  const expired = ws.orders.filter(o=>o.turnsLeft<=0);
  if(expired.length){
    ws.orders = ws.orders.filter(o=>o.turnsLeft>0);
    if(typeof updateReputation==='function') updateReputation(-2*expired.length);
    toast(`⏰ 주문 ${expired.length}건이 기한을 넘겨 취소되었습니다.`, 3000);
    changed = true;
  }

  // 새 주문 생성 (레벨이 높을수록 자주, 최대 4건 유지)
  if(ws.orders.length<4 && (S.msgCount||0)-(ws.lastOrderTurn||0)>=4 && Math.random()<0.3+ws.level*0.05){
    const order = generateOrder(ws);
    if(order){
      ws.orders.push(order);
      ws.lastOrderTurn = S.msgCount||0;
      toast(`📋 ${order.customer}이(가) 「${order.recipeIcon}${order.recipeName}」 ${order.qty}개를 주문했습니다!`, 3500);
      changed = true;
    }
  }

  // 직공 유지비 + 충성도 + 자동 재료 채집(소량)
  if(ws.workers.length>0){
    const upkeep = ws.workers.reduce((s,w)=>s+w.upkeep,0);
    if((S.gold||0) >= upkeep){
      S.gold -= upkeep; if(typeof saveGold==='function') saveGold(S.gold);
      ws.workers.forEach(w=>{ w.loyalty = Math.min(100, w.loyalty+1); });
      // 직공이 가끔 기초 재료를 채집해온다
      if(Math.random()<0.25){
        const def = WORKSHOP_TYPES[ws.type];
        const basicMat = def.type==='forge' ? 'iron_ore' : 'herb_bundle';
        const mats = (typeof loadMaterials==='function') ? loadMaterials() : {};
        mats[basicMat] = (mats[basicMat]||0)+1;
        if(typeof saveMaterials==='function') saveMaterials(mats);
      }
    } else {
      ws.workers.forEach(w=>{ w.loyalty = Math.max(0, w.loyalty-15); });
      const deserter = ws.workers.find(w=>w.loyalty<=0);
      if(deserter){
        ws.workers = ws.workers.filter(w=>w.id!==deserter.id);
        toast(`💸 직공 ${deserter.name}이 임금 미지급으로 떠났습니다.`, 3000);
      }
    }
    changed = true;
  }

  if(changed) saveWorkshop(ws);
}
window.tickWorkshop = tickWorkshop;

window._tickWorkshop = tickWorkshop;

export function getWorkshopSection(){
  const ws = loadWorkshop();
  if(!ws && !S._pendingWorkshopHint) return '';
  let lines=[];
  if(ws){
    const def = WORKSHOP_TYPES[ws.type];
    lines.push(`[${def.icon} 공방] ${def.name} 레벨 ${ws.level} 운영 중 (${ws.homeTown}). 누적 제작 ${ws.totalCrafted||0}개.`);
    if(ws.orders.length>0) lines.push(`[📋 대기 주문] ${ws.orders.map(o=>`${o.customer}의 ${o.recipeName} ${o.qty}개(남은 ${o.turnsLeft}턴)`).join(', ')}`);
  }
  if(S._pendingWorkshopHint){ lines.push(`[📜 공방 사건] ${S._pendingWorkshopHint}`); S._pendingWorkshopHint=null; }
  return lines.length ? '\n'+lines.join('\n') : '';
}
window.getWorkshopSection = getWorkshopSection;

window.getWorkshopSection = getWorkshopSection;

export function renderWorkshopPanel(){
  const body = document.getElementById('pb-workshop'); if(!body) return;
  const ws = loadWorkshop();

  const isClinicView = ws?.type==='clinic';
  let html = isClinicView
    ? `<div style="padding:8px 12px;background:#050a05;border-bottom:1px solid #1a2a1a;font-size:9px;color:#50a070;line-height:1.6">💚 치유소 — 환자를 받아 부상과 병을 치료하고 처방을 조제한다. 기존 제작(설계도) 시스템과 연동된다.</div>`
    : `<div style="padding:8px 12px;background:#0a0805;border-bottom:1px solid #2a1a0a;font-size:9px;color:#a08050;line-height:1.6">🔨 공방 — 손님의 주문을 받아 무기·방어구·소모품을 제작해 납품한다. 기존 제작(설계도) 시스템과 연동된다.</div>`;

  if(!ws){
    html += `<div style="padding:16px 12px">
      <div style="font-size:9px;color:var(--dim);margin-bottom:10px">아직 공방이 없습니다. 어떤 곳을 차리시겠습니까?</div>
      ${Object.entries(WORKSHOP_TYPES).map(([type,def])=>`
        <div style="display:flex;align-items:center;gap:8px;padding:10px;border:1px solid ${def.color}44;margin-bottom:8px;border-radius:4px">
          <span style="color:${def.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:16}):(def.svgIcon||def.icon)}</span>
          <div style="flex:1">
            <div style="font-size:11px;color:${def.color}">${def.name}</div>
            <div style="font-size:8px;color:var(--dim)">${type==='clinic'?'치료·구호 전문':def.categories.includes('weapon')?'무기·방어구':'포션·장신구'} 제작 전문</div>
          </div>
          <button onclick="establishWorkshop('${type}')" style="padding:5px 10px;background:#0a0805;border:1px solid ${def.color}88;color:${def.color};font-size:8px;cursor:pointer">${def.estCost}G</button>
        </div>`).join('')}
    </div>`;
    body.innerHTML = html;
    return;
  }

  const def = WORKSHOP_TYPES[ws.type];
  const isClinic = ws.type==='clinic';

  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
    <div style="font-family:Cinzel,serif;font-size:11px;color:${def.color};margin-bottom:6px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:11}):(def.icon)} ${def.name} (레벨 ${ws.level}) — ${ws.homeTown}</div>
    <div style="font-size:9px;color:var(--dim);margin-bottom:8px">${isClinic?'누적 치료':'누적 제작'} ${ws.totalCrafted||0}${isClinic?'명':'개'} · 누적 수익 ${ws.totalEarned||0}G</div>
    ${ws.level<5?`<button onclick="upgradeWorkshop()" style="width:100%;padding:5px;background:#0a0805;border:1px solid ${def.color}66;color:${def.color};font-size:8px;cursor:pointer">⬆️ ${isClinic?'치유소':'공방'} 확장 (${120*ws.level}G)</button>`:''}
  </div>`;

  // 대기 주문(치유소는 "환자")
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
    <div style="font-family:Cinzel,serif;font-size:10px;color:${def.color};margin-bottom:6px">${isClinic?'🏥 대기 중인 환자':'📋 대기 중인 주문'} (${ws.orders.length}/4)</div>
    ${ws.orders.length?ws.orders.map(o=>{
      const recipe = CRAFT_RECIPES.find(r=>r.id===o.recipeId);
      const have = (S.inventory||[]).filter(it=>it.name===o.recipeName).length;
      const mats = (typeof loadMaterials==='function') ? loadMaterials() : {};
      const canMakeMore = recipe ? Object.entries(recipe.materials).every(([m,q])=>(mats[m]||0)>=q) : false;
      const fulfillable = have>=o.qty || canMakeMore;
      return `<div style="padding:7px 0;border-top:1px solid #0a0805">
        <div style="font-size:9px;color:var(--text)">${o.customer}${isClinic?'이(가) 필요로 하는 처방':'의 주문'}: ${o.recipeIcon}${o.recipeName} × ${o.qty}</div>
        <div style="font-size:8px;color:var(--dim);margin-bottom:4px">보상 ${o.reward}G · 남은 ${o.turnsLeft}턴 · 보유 ${have}/${o.qty}</div>
        <div style="display:flex;gap:4px">
          <button onclick="fulfillOrder('${o.id}')" style="flex:1;padding:4px;background:${fulfillable?'#0a1505':'#0a0805'};border:1px solid ${fulfillable?'#3a6a10':'#3a2a10'};color:${fulfillable?'#6aca6a':'#888'};font-size:7px;cursor:pointer" ${fulfillable?'':'disabled'}>${isClinic?'치료':'납품'}</button>
          <button onclick="rejectOrder('${o.id}')" style="flex:1;padding:4px;background:#150505;border:1px solid #5a1a1a;color:#c06060;font-size:7px;cursor:pointer">거절</button>
        </div>
      </div>`;
    }).join(''):`<div style="font-size:9px;color:var(--dim)">${isClinic?'대기 중인 환자가 없습니다. 환자가 찾아올 때까지 기다리세요.':'대기 중인 주문이 없습니다. 손님이 찾아올 때까지 기다리세요.'}</div>`}
  </div>`;

  // 직공(치유소는 "보조 의무병")
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
    <div style="font-family:Cinzel,serif;font-size:10px;color:${def.color};margin-bottom:6px">${isClinic?'⚕️ 의무병':'🧑‍🔧 직공'} (${ws.workers.length}/4)</div>
    ${ws.workers.map(w=>`<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:9px"><span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(w,{size:16}):(w.icon)}</span><span style="flex:1;color:var(--text)">${esc(w.name)}</span><span style="color:${w.loyalty>=50?'#6aca6a':'#e08030'}">충성${w.loyalty}</span><span style="color:${def.color}">${w.upkeep}G/턴</span></div>`).join('')}
    <button onclick="hireWorkshopWorker()" style="width:100%;margin-top:6px;padding:5px;background:#0a0805;border:1px solid ${def.color}66;color:${def.color};font-size:8px;cursor:pointer">🤝 ${isClinic?'의무병 고용':'직공 고용'} (${90+ws.workers.length*35}G)</button>
  </div>`;

  // 대장간 전용 확장 — 채광 원정 / 아이템 분해 / 환생포인트 해금
  if(ws.type==='forge' && typeof renderForgeExpeditionSection==='function'){
    html += renderForgeExpeditionSection(ws);
  }
  // 치유소 전용 확장 — 왕진/구호 채집 / 처방 조합 / 응급 처치
  if(ws.type==='clinic' && typeof renderClinicExpeditionSection==='function'){
    html += renderClinicExpeditionSection(ws);
  }
  // 연금술 공방 전용 확장 — 희귀 재료 탐사 / 비법 발견 / 실험 재구성
  if(ws.type==='alchemy' && typeof renderAlchemyExpeditionSection==='function'){
    html += renderAlchemyExpeditionSection(ws);
  }

  html += `<div style="padding:8px 12px;text-align:center;font-size:8px;color:var(--dim)">💡 재료는 일반 제작 패널(🔨 제작/연금술)이나 ${isClinic?'의무병':'직공'}이 자동 채집으로 모을 수 있습니다.</div>`;
  html += `<div style="padding:8px 12px;text-align:center"><button onclick="renderWorkshopPanel()" style="padding:5px 14px;background:#0a0805;border:1px solid #2a1a0a;color:#6a4a2a;font-size:8px;font-family:Cinzel,serif;cursor:pointer">🔄 새로고침</button></div>`;

  body.innerHTML = html;
}
window.renderWorkshopPanel = renderWorkshopPanel;

window.renderWorkshopPanel = renderWorkshopPanel;

window.establishWorkshop=establishWorkshop;

window.upgradeWorkshop=upgradeWorkshop;

window.hireWorkshopWorker=hireWorkshopWorker;

window.fulfillOrder=fulfillOrder;

window.rejectOrder=rejectOrder;

(function(){
  if(document.getElementById('p-workshop')) return;
  const div=document.createElement('div'); div.className='panel-ov'; div.id='p-workshop';
  div.innerHTML=`<div class="panel"><div class="p-hdr"><span class="p-title">🔨 공방</span><button class="p-close" onclick="closeP('workshop')">✕</button></div><div class="p-body scrollable" id="pb-workshop"></div></div>`;
  document.body.appendChild(div);
})();

export function ensureWorkshopButtonVisible(){
  try{
    const b=document.querySelector('.btm-bar'); if(!b) return;
    const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
    const ws = loadWorkshop();
    const show = jobId==='blacksmith' || jobId==='alchemist' || jobId==='healer' || jobId.includes('대장장이') || jobId.includes('연금술사') || jobId.includes('치유사') || !!ws;
    if(show && !document.getElementById('btn-workshop')){
      const isClinic = ws?.type==='clinic';
      const bn=document.createElement('button'); bn.id='btn-workshop'; bn.className='bb';
      bn.style.cssText = isClinic ? 'color:#40a060;border-color:#1a3a1a' : 'color:#c08040;border-color:#3a2a0a';
      bn.textContent = isClinic ? '💚치유소' : '🔨공방';
      bn.title = isClinic ? '치유소 — 진료/처방/구호' : '공방 — 주문 제작/직공/납품';
      bn.onclick=function(){ window.openP('workshop'); renderWorkshopPanel(); }; b.appendChild(bn);
    }
  }catch(e){}
}
window.ensureWorkshopButtonVisible = ensureWorkshopButtonVisible;

window.ensureWorkshopButtonVisible = ensureWorkshopButtonVisible;

export const MINING_KEY = 'tf-mining-log';

export function loadMiningLog(){ try{ return JSON.parse(lsGet(MINING_KEY)||'{"count":0,"lastSite":null}'); }catch(e){ return {count:0,lastSite:null}; } }
window.loadMiningLog = loadMiningLog;

export function saveMiningLog(d){ try{ lsSet(MINING_KEY, JSON.stringify(d)); }catch(e){} }
window.saveMiningLog = saveMiningLog;

export function sendMiningExpedition(siteId){
  const ws = loadWorkshop();
  if(!ws || ws.type!=='forge'){ toast('대장간을 운영해야 채광 원정을 보낼 수 있습니다.'); return; }
  const site = MINING_SITES.find(s=>s.id===siteId); if(!site) return;
  if((S.gold||0) < site.cost){ toast(`원정 비용 부족 (${site.cost}G 필요)`); return; }

  S.gold -= site.cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  // 부상 위험 판정 (위험도 비례, 공방 레벨이 높을수록 감소)
  const injuryChance = Math.max(0.02, site.risk*0.06 - ws.level*0.02);
  const injured = Math.random() < injuryChance;

  // 재료 획득 (위험도가 높을수록 개수/희귀도 상승)
  const mats = (typeof loadMaterials==='function') ? loadMaterials() : {};
  const gainCount = 2 + Math.floor(Math.random()*2) + Math.floor(ws.level/2);
  const gained = {};
  for(let i=0;i<gainCount;i++){
    const mid = site.matPool[Math.floor(Math.random()*site.matPool.length)];
    mats[mid] = (mats[mid]||0)+1;
    gained[mid] = (gained[mid]||0)+1;
  }
  if(typeof saveMaterials==='function') saveMaterials(mats);

  const log = loadMiningLog();
  log.count = (log.count||0)+1;
  log.lastSite = site.id;
  saveMiningLog(log);

  const gainedText = Object.entries(gained).map(([id,n])=>`${MATERIALS[id]?.icon||''}${MATERIALS[id]?.name||id}×${n}`).join(', ');

  let msg = `${site.icon} ${site.name} 원정 완료! 획득: ${gainedText}`;
  if(injured){
    const dmg = 5+Math.floor(Math.random()*10)*site.risk;
    S.stats.hp = Math.max(1, (S.stats.hp||100) - dmg);
    window.updateHeader && window.updateHeader();
    msg += ` — ⚠️ 채굴 중 낙석에 다쳤다 (HP -${dmg})`;
  }
  toast(msg, 4500);

  // 설계도 발견 시도(2번 시스템과 연동)
  attemptBlueprintDiscovery(site);

  S._pendingWorkshopHint = `${site.name}으로 채광 원정을 다녀왔다. ${injured?'낙석에 다쳐 몸이 성치 않다. ':''}획득한 재료: ${gainedText}.`;
  if(typeof window.updateStats==='function') window.updateStats('mining_expeditions', 1);
  renderWorkshopPanel();
}
window.sendMiningExpedition = sendMiningExpedition;

export function attemptBlueprintDiscovery(site){
  // 이 원정지 등급 풀에서 미보유 설계도 후보 추출
  const owned = new Set(loadBlueprints());
  const candidates = Object.entries(BLUEPRINT_SHOP)
    .filter(([id,bp]) => site.bpTierPool.includes(bp.dropTier) && !owned.has(id));
  if(!candidates.length) return;

  const findChance = 0.10 + site.risk*0.03; // 깊이 갈수록 발견 확률 상승
  if(Math.random() > findChance) return;

  const [bpId, bp] = candidates[Math.floor(Math.random()*candidates.length)];
  if(unlockBlueprint(bpId)){
    toast(`📜 탐사 중 설계도를 발견했다! [${bp.rarity.toUpperCase()}] ${bp.name}`, 4500);
  }
}
window.attemptBlueprintDiscovery = attemptBlueprintDiscovery;

export function searchForBlueprint(siteId){
  const ws = loadWorkshop();
  if(!ws || ws.type!=='forge'){ toast('대장간을 운영해야 설계도를 탐색할 수 있습니다.'); return; }
  const site = MINING_SITES.find(s=>s.id===siteId); if(!site) return;
  const cost = Math.round(site.cost*1.4);
  if((S.gold||0) < cost){ toast(`탐색 비용 부족 (${cost}G 필요)`); return; }

  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  const owned = new Set(loadBlueprints());
  const candidates = Object.entries(BLUEPRINT_SHOP)
    .filter(([id,bp]) => site.bpTierPool.includes(bp.dropTier) && !owned.has(id));

  if(!candidates.length){
    toast(`${site.name}에서 더 이상 찾을 새 설계도가 없다. 이미 이 구역의 설계도는 모두 발견했다.`, 3500);
    renderWorkshopPanel();
    return;
  }

  const findChance = 0.22 + site.risk*0.05;
  if(Math.random() < findChance){
    const [bpId, bp] = candidates[Math.floor(Math.random()*candidates.length)];
    unlockBlueprint(bpId);
    toast(`📜 설계도 발견! [${bp.rarity.toUpperCase()}] ${bp.name}`, 4500);
    S._pendingWorkshopHint = `${site.name} 깊은 곳에서 낡은 설계도 「${bp.name}」를 발견했다.`;
  } else {
    toast(`${site.name}을(를) 샅샅이 뒤졌지만 쓸만한 설계도는 찾지 못했다.`, 3500, site);
  }
  renderWorkshopPanel();
}
window.searchForBlueprint = searchForBlueprint;

export function getDismantleMaterials(item){
  const rarity = item.rarity || 'common';
  const n = DISMANTLE_YIELD_BY_RARITY[rarity] || 1;
  // 아이템 슬롯/타입 기반으로 재료 계열 추정
  const slot = item.slot || item.type || '';
  let pool;
  if(slot==='weapon') pool = ['iron_ore','silver_ore','monster_bone'];
  else if(slot==='armor'||slot==='helmet'||slot==='gloves'||slot==='boots') pool = ['iron_ore','dragon_scale','titan_bone'];
  else if(slot==='accessory'||slot==='trinket'||slot==='ring'||slot==='amulet') pool = ['rare_gem','magic_stone','star_crystal'];
  else if(item.type==='consume') pool = ['herb_bundle','moonwater'];
  else pool = ['iron_ore','herb_bundle'];
  if(rarity==='epic'||rarity==='legendary') pool = [...pool,'void_shard','philosophers_ore'];

  const result = {};
  for(let i=0;i<n;i++){
    const mid = pool[Math.floor(Math.random()*pool.length)];
    result[mid] = (result[mid]||0)+1;
  }
  return result;
}
window.getDismantleMaterials = getDismantleMaterials;

export function dismantleItem(itemIndex){
  const ws = loadWorkshop();
  if(!ws || ws.type!=='forge'){ toast('대장간을 운영해야 아이템을 분해할 수 있습니다.'); return; }
  const inv = (typeof loadInventory==='function') ? loadInventory() : (S.inventory||[]);
  const item = inv[itemIndex];
  if(!item){ toast('해당 아이템을 찾을 수 없습니다.'); return; }
  const isEquipped = Object.values(S.equipped||{}).filter(Boolean).some(eq=>eq.id===item.id && eq.name===item.name);
  if(isEquipped){ toast('장착 중인 아이템은 먼저 해제해야 분해할 수 있습니다.'); return; }

  // 인벤토리에서 제거
  inv.splice(itemIndex,1);
  if(typeof saveInventory==='function') saveInventory(inv); else S.inventory = inv;

  // 재료 회수
  const gained = getDismantleMaterials(item);
  const mats = (typeof loadMaterials==='function') ? loadMaterials() : {};
  Object.entries(gained).forEach(([id,n])=>{ mats[id]=(mats[id]||0)+n; });
  if(typeof saveMaterials==='function') saveMaterials(mats);
  const gainedText = Object.entries(gained).map(([id,n])=>`${MATERIALS[id]?.icon||''}${MATERIALS[id]?.name||id}×${n}`).join(', ');

  // 역설계 시도 — 이미 보유한 설계도면 스킵, 미보유 아이템이면 새로 등록해 발견 처리
  const rarity = item.rarity || 'common';
  const reverseEngChance = { common:0.5, uncommon:0.35, rare:0.22, epic:0.12, legendary:0.06 }[rarity] || 0.3;
  let bpMsg = '';
  const existingBpId = 'bp_dyn_' + item.id;
  const alreadyHas = item.id && hasBlueprint(existingBpId);
  if(!alreadyHas && item.id && Math.random() < reverseEngChance){
    if(typeof registerDynamicBlueprint==='function'){
      registerDynamicBlueprint(item);
      bpMsg = ` — 역설계 성공! 「${item.name}」의 제작법을 알아냈다.`;
    }
  }

  toastHTML(`🔨 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon||"📦")} ${esc(item.name)} 분해 완료. 회수: ${esc(gainedText)}${esc(bpMsg)}`, 4500);
  if(bpMsg) S._pendingWorkshopHint = `낡은 「${item.name}」을(를) 분해하다가 우연히 그 제작 원리를 깨우쳤다.`;
  if(typeof window.updateStats==='function') window.updateStats('items_dismantled', 1);
  if(document.getElementById('p-inventory')?.classList.contains('open') && typeof renderInventory==='function') renderInventory();
  renderWorkshopPanel();
}
window.dismantleItem = dismantleItem;

export function renderForgeExpeditionSection(ws){
  const rcPts = loadRCPoints();
  const rarityColor = {common:'#8a9a8a',uncommon:'#4a9a6a',rare:'#4a6fa5',epic:'#9060c0',legendary:'#c8a96e',primal:'#e0483c'};

  let html = `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c08040;margin-bottom:6px">⛏️ 채광 원정 — 직접 재료를 캐러 간다</div>
    <div style="font-size:8px;color:var(--dim);margin-bottom:8px">위험할수록 희귀 재료와 설계도 발견 확률이 높아진다. 부상 위험 있음.</div>
    ${MINING_SITES.map(site=>`
      <div style="display:flex;align-items:center;gap:7px;padding:7px 0;border-top:1px solid #0a0805">
        <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(site,{size:16}):(site.icon)}</span>
        <div style="flex:1">
          <div style="font-size:9px;color:var(--text)">${esc(site.name)} <span style="color:${'#c08040'};font-size:8px">${'⚠️'.repeat(site.risk)}</span></div>
          <div style="font-size:7.5px;color:var(--dim)">${esc(site.desc)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <button onclick="sendMiningExpedition('${site.id}')" style="padding:4px 8px;background:#0a0805;border:1px solid #3a2a10;color:#c08040;font-size:7px;cursor:pointer;white-space:nowrap">채광 ${site.cost>0?site.cost+'G':'무료'}</button>
          <button onclick="searchForBlueprint('${site.id}')" style="padding:4px 8px;background:#0a0805;border:1px solid #3a2a10;color:#c8a96e;font-size:7px;cursor:pointer;white-space:nowrap">탐색 ${Math.round(site.cost*1.4)||0}G</button>
        </div>
      </div>`).join('')}
  </div>`;

  // 아이템 분해 섹션
  const inv = (typeof loadInventory==='function') ? loadInventory() : (S.inventory||[]);
  const equippedSet = new Set(Object.values(S.equipped||{}).filter(Boolean).map(eq=>eq.id+'|'+eq.name));
  const dismantleCandidates = inv.map((it,idx)=>({it,idx})).filter(({it})=>!equippedSet.has(it.id+'|'+it.name) && (it.slot||it.type==='consume'||it.type==='equip'));
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c08040;margin-bottom:6px">🔧 아이템 분해 — 재료 회수 + 역설계 시도</div>
    ${dismantleCandidates.length ? `
      <div style="max-height:160px;overflow-y:auto">
        ${dismantleCandidates.slice(0,20).map(({it,idx})=>{
          const rc = rarityColor[it.rarity||'common'];
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:8.5px;border-top:1px solid #0a0805">
            <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(it,{size:16}):(it.icon||"📦")}</span>
            <span style="flex:1;color:${rc}">${esc(it.name)}</span>
            <button onclick="dismantleItem(${idx})" style="padding:3px 7px;background:#0a0805;border:1px solid #3a2a10;color:#a08050;font-size:7px;cursor:pointer">분해</button>
          </div>`;
        }).join('')}
      </div>` : `<div style="font-size:8px;color:var(--dim)">분해할 수 있는 아이템이 없습니다.</div>`}
  </div>`;

  // 환생포인트 강제 해금 — 등급 이상 설계도만 노출(uncommon 이상)
  const owned = new Set(loadBlueprints());
  const lockedHighTier = Object.entries(BLUEPRINT_SHOP)
    .filter(([id,bp]) => !owned.has(id) && ['uncommon','rare','epic','legendary'].includes(bp.dropTier))
    .slice(0, 12);
  html += `<div style="padding:10px 12px">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c08040;margin-bottom:4px">✨ 환생 포인트로 해금 (보유 ${rcPts}pt)</div>
    <div style="font-size:7.5px;color:var(--dim);margin-bottom:6px">원정으로 못 찾은 고급 설계도를 환생 포인트로 즉시 해금할 수 있다.</div>
    ${lockedHighTier.length ? lockedHighTier.map(([id,bp])=>{
      const cost = RC_POINT_COST[bp.rarity]||RC_POINT_COST[bp.dropTier]||2;
      const canAfford = rcPts>=cost;
      return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:8.5px;border-top:1px solid #0a0805">
        <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(bp,{size:16}):(bp.icon)}</span>
        <span style="flex:1;color:${rarityColor[bp.dropTier]||'#8a9a8a'}">${esc(bp.name)}</span>
        <button onclick="unlockRecipeWithPoints('${id}')" ${canAfford?'':'disabled'} style="padding:3px 7px;background:${canAfford?'#0a0805':'#080604'};border:1px solid ${canAfford?'var(--gold)':'#2a1a05'};color:${canAfford?'var(--gold)':'#4a3a20'};font-size:7px;cursor:${canAfford?'pointer':'not-allowed'}">🔓 ${cost}pt</button>
      </div>`;
    }).join('') : `<div style="font-size:8px;color:var(--dim)">해금 가능한 고급 설계도가 없습니다.</div>`}
  </div>`;

  // 태초의 화로 히든 퀘스트 진행 상황
  const miningLog = (typeof loadMiningLog==='function') ? loadMiningLog() : {count:0};
  const hqStored = (typeof loadHiddenQuests==='function') ? loadHiddenQuests() : {};
  const primalQuest = hqStored['hq_primal_forge'];
  let primalHtml = '';
  if(primalQuest?.status === 'completed'){
    primalHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a1005;background:linear-gradient(135deg,#1a0805,#0a0805)">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#e0483c;margin-bottom:4px">🔥 태초의 화로 — 완료</div>
      <div style="font-size:8px;color:var(--dim)">태초의 설계도를 모두 습득했다. 세계 최초의 대장장이의 기예를 이어받았다.</div>
    </div>`;
  } else if(primalQuest?.status === 'active'){
    primalHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a1005;background:#0d0805">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#e0483c;margin-bottom:4px">🔥 태초의 화로 — 진행 중</div>
      <div style="font-size:8px;color:var(--dim)">명장 헤파이오스가 그대를 시험하고 있다. 이야기를 계속 진행하라.</div>
    </div>`;
  } else if(ws.level<3 || (miningLog.count||0)<10){
    primalHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a1005">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#6a4a3a;margin-bottom:4px">🔥 태초의 화로 — 미발견</div>
      <div style="font-size:8px;color:var(--dim)">공방 레벨 ${ws.level}/3 · 채광 원정 ${miningLog.count||0}/10회 — 조건을 채우면 명장 헤파이오스가 그대를 시험할 것이다.</div>
    </div>`;
  }
  html = primalHtml + html;

  return html;
}
window.renderForgeExpeditionSection = renderForgeExpeditionSection;

window.sendMiningExpedition = sendMiningExpedition;

window.searchForBlueprint = searchForBlueprint;

window.dismantleItem = dismantleItem;

window.renderForgeExpeditionSection = renderForgeExpeditionSection;

export const REMEDY_LOG_KEY = 'tf-remedy-gathering-log';

export function loadRemedyLog(){ try{ return JSON.parse(lsGet(REMEDY_LOG_KEY)||'{"count":0,"lastSite":null}'); }catch(e){ return {count:0,lastSite:null}; } }
window.loadRemedyLog = loadRemedyLog;

export function saveRemedyLog(d){ try{ lsSet(REMEDY_LOG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveRemedyLog = saveRemedyLog;

export const REMEDY_MATERIAL_BAG_KEY = 'tf-remedy-materials';

export function loadRemedyMaterials(){ try{ return JSON.parse(lsGet(REMEDY_MATERIAL_BAG_KEY)||'{}'); }catch(e){ return {}; } }
window.loadRemedyMaterials = loadRemedyMaterials;

export function saveRemedyMaterials(d){ try{ lsSet(REMEDY_MATERIAL_BAG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveRemedyMaterials = saveRemedyMaterials;

export const REMEDY_LORE_KEY = 'tf-known-remedies';

export function loadKnownRemedies(){ try{ return JSON.parse(lsGet(REMEDY_LORE_KEY)||'[]'); }catch(e){ return []; } }
window.loadKnownRemedies = loadKnownRemedies;

export function saveKnownRemedies(d){ try{ lsSet(REMEDY_LORE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveKnownRemedies = saveKnownRemedies;

export function learnRemedy(id){
  const arr = loadKnownRemedies();
  if(arr.includes(id)) return false;
  arr.push(id); saveKnownRemedies(arr); return true;
}
window.learnRemedy = learnRemedy;

export function makeHouseCall(siteId){
  const ws = loadWorkshop();
  if(!ws || ws.type!=='clinic'){ toast('치유소를 운영해야 왕진을 나갈 수 있습니다.'); return; }
  const site = REMEDY_SITES.find(s=>s.id===siteId); if(!site) return;
  if((S.gold||0) < site.cost){ toast(`왕진 비용 부족 (${site.cost}G 필요)`); return; }

  S.gold -= site.cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  // 감염/과로 위험 — 대장장이의 부상 위험과 대칭. HP 대신 본인 컨디션(HP) 소폭 소모.
  const riskChance = Math.max(0.02, site.risk*0.05);
  const gotSick = Math.random() < riskChance;

  const mats = loadRemedyMaterials();
  const gainCount = 2 + Math.floor(Math.random()*2) + Math.floor(ws.level/2);
  const gained = {};
  for(let i=0;i<gainCount;i++){
    const mid = site.matPool[Math.floor(Math.random()*site.matPool.length)];
    mats[mid] = (mats[mid]||0)+1;
    gained[mid] = (gained[mid]||0)+1;
  }
  saveRemedyMaterials(mats);

  const log = loadRemedyLog();
  log.count = (log.count||0)+1;
  log.lastSite = site.id;
  saveRemedyLog(log);

  const gainedText = Object.entries(gained).map(([id,n])=>`${REMEDY_MATERIALS[id]?.icon||''}${REMEDY_MATERIALS[id]?.name||id}×${n}`).join(', ');
  let msg = `${site.icon} ${site.name} 왕진 완료! 획득: ${gainedText}`;

  if(gotSick){
    const dmg = 4+Math.floor(Math.random()*8)*site.risk;
    S.stats.hp = Math.max(1, (S.stats.hp||100) - dmg);
    window.updateHeader && window.updateHeader();
    msg += ` — ⚠️ 간호 중 병이 옮았다 (HP -${dmg})`;
  }
  toast(msg, 4500);

  attemptRemedyDiscovery(site);

  S._pendingWorkshopHint = `${site.name}으로 왕진을 다녀왔다.${gotSick?' 간호 중 몸이 상하기도 했다.':''} 얻은 소재: ${gainedText}.`;
  if(typeof window.updateStats==='function') window.updateStats('house_calls', 1);
  renderWorkshopPanel();
}
window.makeHouseCall = makeHouseCall;

export function attemptRemedyDiscovery(site){
  const known = new Set(loadKnownRemedies());
  const candidates = Object.entries(REMEDY_LORE_SHOP).filter(([id,r]) => site.bpTierPool.includes(r.dropTier) && !known.has(id));
  if(!candidates.length) return;
  const findChance = 0.10 + site.risk*0.03;
  if(Math.random() > findChance) return;
  const [remedyId, remedy] = candidates[Math.floor(Math.random()*candidates.length)];
  if(learnRemedy(remedyId)){
    toast(`📋 새 처방을 익혔다! [${remedy.rarity.toUpperCase()}] ${remedy.name}`, 4500);
  }
}
window.attemptRemedyDiscovery = attemptRemedyDiscovery;

export function searchForRemedyLore(siteId){
  const ws = loadWorkshop();
  if(!ws || ws.type!=='clinic'){ toast('치유소를 운영해야 처방을 탐구할 수 있습니다.'); return; }
  const site = REMEDY_SITES.find(s=>s.id===siteId); if(!site) return;
  const cost = Math.round(site.cost*1.4);
  if((S.gold||0) < cost){ toast(`탐구 비용 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  const known = new Set(loadKnownRemedies());
  const candidates = Object.entries(REMEDY_LORE_SHOP).filter(([id,r]) => site.bpTierPool.includes(r.dropTier) && !known.has(id));
  if(!candidates.length){
    toast(`${site.name}에서 더 이상 새로운 처방을 찾을 수 없다. 이 구역의 의술은 이미 다 익혔다.`, 3500);
    renderWorkshopPanel();
    return;
  }
  const findChance = 0.22 + site.risk*0.05;
  if(Math.random() < findChance){
    const [remedyId, remedy] = candidates[Math.floor(Math.random()*candidates.length)];
    learnRemedy(remedyId);
    toast(`📋 처방 발견! [${remedy.rarity.toUpperCase()}] ${remedy.name}`, 4500);
    S._pendingWorkshopHint = `${site.name}에서 잊혀졌던 처방 「${remedy.name}」의 기록을 찾아냈다.`;
  } else {
    toast(`${site.name}을(를) 샅샅이 살폈지만 새로운 처방의 실마리는 찾지 못했다.`, 3500, site);
  }
  renderWorkshopPanel();
}
window.searchForRemedyLore = searchForRemedyLore;

export function getEmergencyTreatCandidates(){
  const party = (typeof loadParty==='function') ? loadParty() : [];
  const now = S.msgCount||0;
  return party.filter(m => m.incapUntilTurn && m.incapUntilTurn > now);
}
window.getEmergencyTreatCandidates = getEmergencyTreatCandidates;

export function emergencyTreat(memberName){
  const ws = loadWorkshop();
  if(!ws || ws.type!=='clinic'){ toast('치유소를 운영해야 응급 처치를 할 수 있습니다.'); return; }
  const party = (typeof loadParty==='function') ? loadParty() : [];
  const member = party.find(m=>m.name===memberName);
  if(!member || !member.incapUntilTurn){ toast('치료가 필요한 동료가 아닙니다.'); return; }

  // 소재 소모 — 등급 낮은 치유 소재 3종 중 하나라도 있으면 사용
  const mats = loadRemedyMaterials();
  const costPool = ['wild_herb','clean_water','battlefield_salve'];
  const available = costPool.find(id=>(mats[id]||0)>0);
  if(!available){ toast('치료에 쓸 소재가 부족합니다 (들풀 약초/정화수/전장 연고 필요).'); return; }
  mats[available] = mats[available]-1;
  saveRemedyMaterials(mats);

  const now = S.msgCount||0;
  const remainingTurns = member.incapUntilTurn - now;
  member.incapUntilTurn = now; // 즉시 회복
  member.alive = true;
  member.hp = Math.max(member.hp||1, Math.round((member.maxHp||100)*0.4));
  if(typeof saveParty==='function') saveParty(party);

  toast(`⚕️ ${member.name}을(를) 응급 처치했다! 즉시 전선 복귀 (${remainingTurns}턴 단축)`, 4500);
  S._pendingWorkshopHint = `${member.name}을(를) 응급 처치로 되살려 즉시 복귀시켰다. 치유사의 손길이 절박한 순간을 붙잡았다.`;
  if(typeof window.updateStats==='function') window.updateStats('emergency_treatments', 1);
  renderWorkshopPanel();
}
window.emergencyTreat = emergencyTreat;

export function renderClinicExpeditionSection(ws){
  const rarityColor = {common:'#8a9a8a',uncommon:'#4a9a6a',rare:'#4a6fa5',legendary:'#c8a96e'};
  const remedyMats = loadRemedyMaterials();

  let html = `<div style="padding:10px 12px;border-bottom:1px solid #051505">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#40a060;margin-bottom:6px">🏥 왕진/구호 활동 — 직접 나가 환자를 돌본다</div>
    <div style="font-size:8px;color:var(--dim);margin-bottom:8px">위험한 곳일수록 희귀한 치유 소재와 처방 발견 확률이 높아진다. 감염·과로 위험 있음.</div>
    ${REMEDY_SITES.map(site=>`
      <div style="display:flex;align-items:center;gap:7px;padding:7px 0;border-top:1px solid #051005">
        <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(site,{size:16}):(site.icon)}</span>
        <div style="flex:1">
          <div style="font-size:9px;color:var(--text)">${esc(site.name)} <span style="color:#40a060;font-size:8px">${'⚠️'.repeat(site.risk)}</span></div>
          <div style="font-size:7.5px;color:var(--dim)">${esc(site.desc)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <button onclick="makeHouseCall('${site.id}')" style="padding:4px 8px;background:#050a05;border:1px solid #1a3a1a;color:#40a060;font-size:7px;cursor:pointer;white-space:nowrap">왕진 ${site.cost>0?site.cost+'G':'무료'}</button>
          <button onclick="searchForRemedyLore('${site.id}')" style="padding:4px 8px;background:#050a05;border:1px solid #1a3a1a;color:#c8a96e;font-size:7px;cursor:pointer;white-space:nowrap">탐구 ${Math.round(site.cost*1.4)||0}G</button>
        </div>
      </div>`).join('')}
  </div>`;

  // 보유 소재 요약
  const matEntries = Object.entries(remedyMats).filter(([,n])=>n>0);
  html += `<div style="padding:10px 12px;border-bottom:1px solid #051505">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#40a060;margin-bottom:6px">🎒 보유 치유 소재</div>
    ${matEntries.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px">${matEntries.map(([id,n])=>`<span onclick="showMaterialLore('${id}','REMEDY_MATERIALS')" style="padding:3px 7px;background:#050a05;border:1px solid #1a2a1a;border-radius:2px;font-size:8px;color:var(--text);cursor:pointer">${typeof getEntityIconHTML==='function'?getEntityIconHTML(REMEDY_MATERIALS[id],{size:14}):(REMEDY_MATERIALS[id]?.icon||'')}${REMEDY_MATERIALS[id]?.name||id}×${n}</span>`).join('')}</div>` : `<div style="font-size:8px;color:var(--dim)">아직 채집한 소재가 없습니다.</div>`}
  </div>`;

  // 알고 있는 처방
  const known = loadKnownRemedies();
  html += `<div style="padding:10px 12px;border-bottom:1px solid #051505">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#40a060;margin-bottom:6px">📋 아는 처방 (${known.length}/${Object.keys(REMEDY_LORE_SHOP).length})</div>
    ${known.length ? known.map(id=>{
      const r = REMEDY_LORE_SHOP[id]; if(!r) return '';
      const rc = rarityColor[r.rarity]||'#8a9a8a';
      return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:8.5px;border-top:1px solid #051005">
        <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:16}):(r.icon)}</span>
        <span style="flex:1;color:${rc}">${esc(r.name)}</span>
      </div>`;
    }).join('') : `<div style="font-size:8px;color:var(--dim)">아직 아는 처방이 없습니다.</div>`}
  </div>`;

  // 응급 처치 대상 — 전투에서 부상 이탈한 동료
  const candidates = getEmergencyTreatCandidates();
  html += `<div style="padding:10px 12px;border-bottom:1px solid #051505">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#e08030;margin-bottom:6px">⚕️ 응급 처치 — 부상 이탈한 동료를 즉시 복귀시킨다</div>
    ${candidates.length ? candidates.map(m=>{
      const remain = (m.incapUntilTurn||0) - (S.msgCount||0);
      return `<div style="display:flex;align-items:center;gap:6px;padding:5px 0;font-size:8.5px;border-top:1px solid #051005">
        <span>🩹</span>
        <span style="flex:1;color:var(--text)">${esc(m.name)} <span style="color:var(--dim)">(${m.incapReason||'부상'}, 회복까지 ${remain}턴)</span></span>
        <button onclick="emergencyTreat('${esc(m.name).replace(/'/g,"\\'")}')" style="padding:3px 8px;background:#0a1505;border:1px solid #3a6a10;color:#6aca6a;font-size:7px;cursor:pointer">치료</button>
      </div>`;
    }).join('') : `<div style="font-size:8px;color:var(--dim)">부상으로 이탈한 동료가 없습니다.</div>`}
  </div>`;

  // 불사의 온기 히든 퀘스트 진행 상황
  const remedyLog = loadRemedyLog();
  const hqStored = (typeof loadHiddenQuests==='function') ? loadHiddenQuests() : {};
  const warmthQuest = hqStored['hq_undying_warmth'];
  let warmthHtml = '';
  if(warmthQuest?.status === 'completed'){
    warmthHtml = `<div style="padding:10px 12px;border-bottom:1px solid #051505;background:linear-gradient(135deg,#0a150a,#050a05)">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#40a060;margin-bottom:4px">🕯️ 불사의 온기 — 완료</div>
      <div style="font-size:8px;color:var(--dim)">꺼져가는 목숨을 붙잡는 힘을 얻었다. 이제 동료를 잃지 않도록 지켜낼 수 있다.</div>
    </div>`;
  } else if(warmthQuest?.status === 'active'){
    warmthHtml = `<div style="padding:10px 12px;border-bottom:1px solid #051505;background:#050a05">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#40a060;margin-bottom:4px">🕯️ 불사의 온기 — 진행 중</div>
      <div style="font-size:8px;color:var(--dim)">수도원장 셀레네가 그대에게 오랜 이야기를 털어놓고 있다. 이야기를 계속 진행하라.</div>
    </div>`;
  } else if(ws.level<3 || (remedyLog.count||0)<10){
    warmthHtml = `<div style="padding:10px 12px;border-bottom:1px solid #051505">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#4a6a4a;margin-bottom:4px">🕯️ 불사의 온기 — 미발견</div>
      <div style="font-size:8px;color:var(--dim)">치유소 레벨 ${ws.level}/3 · 왕진 ${remedyLog.count||0}/10회 — 조건을 채우면 수도원장 셀레네가 그대에게 오랜 이야기를 털어놓을 것이다.</div>
    </div>`;
  }
  html = warmthHtml + html;

  return html;
}
window.renderClinicExpeditionSection = renderClinicExpeditionSection;

window.makeHouseCall = makeHouseCall;

window.searchForRemedyLore = searchForRemedyLore;

window.emergencyTreat = emergencyTreat;

window.renderClinicExpeditionSection = renderClinicExpeditionSection;

export const ALCHEMY_EXPED_LOG_KEY = 'tf-alchemy-expedition-log';

export function loadAlchemyExpedLog(){ try{ return JSON.parse(lsGet(ALCHEMY_EXPED_LOG_KEY)||'{"count":0,"lastSite":null}'); }catch(e){ return {count:0,lastSite:null}; } }
window.loadAlchemyExpedLog = loadAlchemyExpedLog;

export function saveAlchemyExpedLog(d){ try{ lsSet(ALCHEMY_EXPED_LOG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveAlchemyExpedLog = saveAlchemyExpedLog;

export const ALCHEMY_MATERIAL_BAG_KEY = 'tf-alchemy-expedition-materials';

export function loadAlchemyExpedMaterials(){ try{ return JSON.parse(lsGet(ALCHEMY_MATERIAL_BAG_KEY)||'{}'); }catch(e){ return {}; } }
window.loadAlchemyExpedMaterials = loadAlchemyExpedMaterials;

export function saveAlchemyExpedMaterials(d){ try{ lsSet(ALCHEMY_MATERIAL_BAG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveAlchemyExpedMaterials = saveAlchemyExpedMaterials;

export const FORMULA_LORE_KEY = 'tf-known-formulas';

export function loadKnownFormulas(){ try{ return JSON.parse(lsGet(FORMULA_LORE_KEY)||'[]'); }catch(e){ return []; } }
window.loadKnownFormulas = loadKnownFormulas;

export function saveKnownFormulas(d){ try{ lsSet(FORMULA_LORE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveKnownFormulas = saveKnownFormulas;

export function hasKnownFormula(id){ return loadKnownFormulas().includes(id); }
window.hasKnownFormula = hasKnownFormula;

export function learnFormula(id){
  const arr = loadKnownFormulas();
  if(arr.includes(id)) return false;
  arr.push(id); saveKnownFormulas(arr); return true;
}
window.learnFormula = learnFormula;

export function conductAlchemyExpedition(siteId){
  const ws = loadWorkshop();
  if(!ws || ws.type!=='alchemy'){ toast('연금술 공방을 운영해야 탐사를 나갈 수 있습니다.'); return; }
  const site = ALCHEMY_SITES.find(s=>s.id===siteId); if(!site) return;
  if((S.gold||0) < site.cost){ toast(`탐사 비용 부족 (${site.cost}G 필요)`); return; }

  S.gold -= site.cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  // 오염/중독 위험 — 다른 세 직업의 위험과 대칭
  const riskChance = Math.max(0.02, site.risk*0.05);
  const contaminated = Math.random() < riskChance;

  const mats = loadAlchemyExpedMaterials();
  const gainCount = 2 + Math.floor(Math.random()*2) + Math.floor(ws.level/2);
  const gained = {};
  for(let i=0;i<gainCount;i++){
    const mid = site.matPool[Math.floor(Math.random()*site.matPool.length)];
    mats[mid] = (mats[mid]||0)+1;
    gained[mid] = (gained[mid]||0)+1;
  }
  saveAlchemyExpedMaterials(mats);

  const log = loadAlchemyExpedLog();
  log.count = (log.count||0)+1;
  log.lastSite = site.id;
  saveAlchemyExpedLog(log);

  const gainedText = Object.entries(gained).map(([id,n])=>`${ALCHEMY_MATERIALS[id]?.icon||''}${ALCHEMY_MATERIALS[id]?.name||id}×${n}`).join(', ');
  let msg = `${site.icon} ${site.name} 탐사 완료! 획득: ${gainedText}`;

  if(contaminated){
    const dmg = 4+Math.floor(Math.random()*8)*site.risk;
    S.stats.hp = Math.max(1, (S.stats.hp||100) - dmg);
    window.updateHeader && window.updateHeader();
    msg += ` — ⚠️ 유독 물질에 노출됐다 (HP -${dmg})`;
  }
  toast(msg, 4500);

  attemptFormulaDiscovery(site);

  S._pendingWorkshopHint = `${site.name}으로 재료 탐사를 다녀왔다.${contaminated?' 유독 물질에 노출되어 몸이 상하기도 했다.':''} 얻은 재료: ${gainedText}.`;
  if(typeof window.updateStats==='function') window.updateStats('alchemy_expeditions', 1);
  renderWorkshopPanel();
}
window.conductAlchemyExpedition = conductAlchemyExpedition;

export function attemptFormulaDiscovery(site){
  const known = new Set(loadKnownFormulas());
  const candidates = Object.entries(FORMULA_LORE_SHOP).filter(([id,f]) => site.bpTierPool.includes(f.dropTier) && !known.has(id));
  if(!candidates.length) return;
  const findChance = 0.10 + site.risk*0.03;
  if(Math.random() > findChance) return;
  const [formulaId, formula] = candidates[Math.floor(Math.random()*candidates.length)];
  if(learnFormula(formulaId)){
    toast(`📗 새 비법을 깨우쳤다! [${formula.rarity.toUpperCase()}] ${formula.name}`, 4500);
  }
}
window.attemptFormulaDiscovery = attemptFormulaDiscovery;

export function researchFormulaLore(siteId){
  const ws = loadWorkshop();
  if(!ws || ws.type!=='alchemy'){ toast('연금술 공방을 운영해야 비법을 연구할 수 있습니다.'); return; }
  const site = ALCHEMY_SITES.find(s=>s.id===siteId); if(!site) return;
  const cost = Math.round(site.cost*1.4);
  if((S.gold||0) < cost){ toast(`연구 비용 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  const known = new Set(loadKnownFormulas());
  const candidates = Object.entries(FORMULA_LORE_SHOP).filter(([id,f]) => site.bpTierPool.includes(f.dropTier) && !known.has(id));
  if(!candidates.length){
    toast(`${site.name}에서 더 이상 새로운 비법을 찾을 수 없다. 이 구역의 지식은 이미 다 파악했다.`, 3500);
    renderWorkshopPanel();
    return;
  }
  const findChance = 0.22 + site.risk*0.05;
  if(Math.random() < findChance){
    const [formulaId, formula] = candidates[Math.floor(Math.random()*candidates.length)];
    learnFormula(formulaId);
    toast(`📗 비법 발견! [${formula.rarity.toUpperCase()}] ${formula.name}`, 4500);
    S._pendingWorkshopHint = `${site.name}에서 잊혀졌던 비법 「${formula.name}」의 기록을 찾아냈다.`;
  } else {
    toast(`${site.name}을(를) 샅샅이 조사했지만 새로운 비법의 실마리는 찾지 못했다.`, 3500, site);
  }
  renderWorkshopPanel();
}
window.researchFormulaLore = researchFormulaLore;

export function getExperimentMaterials(formulaId){
  const formula = FORMULA_LORE_SHOP[formulaId]; if(!formula) return {};
  const rarity = formula.rarity || 'common';
  const n = EXPERIMENT_YIELD_BY_RARITY[rarity] || 1;
  let pool;
  if(rarity==='legendary') pool = ['void_essence','forbidden_flesh','lost_formula'];
  else if(rarity==='rare') pool = ['ruin_residue','void_essence','philosopher_dust'];
  else if(rarity==='uncommon') pool = ['toxic_spore','crystal_dust'];
  else pool = ['common_reagent','crystal_dust'];
  const result = {};
  for(let i=0;i<n;i++){
    const mid = pool[Math.floor(Math.random()*pool.length)];
    result[mid] = (result[mid]||0)+1;
  }
  return result;
}
window.getExperimentMaterials = getExperimentMaterials;

export function reconductExperiment(formulaId){
  const ws = loadWorkshop();
  if(!ws || ws.type!=='alchemy'){ toast('연금술 공방을 운영해야 실험을 재구성할 수 있습니다.'); return; }
  if(!hasKnownFormula(formulaId)){ toast('알지 못하는 비법입니다.'); return; }
  const formula = FORMULA_LORE_SHOP[formulaId]; if(!formula) return;

  const gained = getExperimentMaterials(formulaId);
  const mats = loadAlchemyExpedMaterials();
  Object.entries(gained).forEach(([id,n])=>{ mats[id]=(mats[id]||0)+n; });
  saveAlchemyExpedMaterials(mats);
  const gainedText = Object.entries(gained).map(([id,n])=>`${ALCHEMY_MATERIALS[id]?.icon||''}${ALCHEMY_MATERIALS[id]?.name||id}×${n}`).join(', ');

  const rarity = formula.rarity || 'common';
  const inspireChance = { common:0.4, uncommon:0.28, rare:0.18, legendary:0.08 }[rarity] || 0.25;
  let inspireMsg = '';
  if(Math.random() < inspireChance){
    const known = new Set(loadKnownFormulas());
    const others = Object.entries(FORMULA_LORE_SHOP).filter(([id])=>!known.has(id) && id!==formulaId);
    if(others.length){
      const [newId, newFormula] = others[Math.floor(Math.random()*others.length)];
      learnFormula(newId);
      inspireMsg = ` — 그 과정에서 새로운 비법 「${newFormula.name}」까지 깨우쳤다!`;
    }
  }

  toast(`⚗️ 「${formula.name}」실험을 재구성했다. 회수: ${gainedText}${inspireMsg}`, 4500);
  if(inspireMsg) S._pendingWorkshopHint = `낡은 실험 기록을 되짚다가 우연히 새로운 비법을 깨우쳤다.`;
  if(typeof window.updateStats==='function') window.updateStats('experiments_reconducted', 1);
  renderWorkshopPanel();
}
window.reconductExperiment = reconductExperiment;

export function renderAlchemyExpeditionSection(ws){
  const rarityColor = {common:'#8a9a8a',uncommon:'#4a9a6a',rare:'#4a6fa5',legendary:'#c8a96e'};
  const expedMats = loadAlchemyExpedMaterials();

  let html = `<div style="padding:10px 12px;border-bottom:1px solid #0a150d">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#8060c0;margin-bottom:6px">🧪 희귀 재료 탐사 — 직접 나가 재료를 캔다</div>
    <div style="font-size:8px;color:var(--dim);margin-bottom:8px">위험한 곳일수록 희귀한 재료와 비법 발견 확률이 높아진다. 오염·중독 위험 있음.</div>
    ${ALCHEMY_SITES.map(site=>`
      <div style="display:flex;align-items:center;gap:7px;padding:7px 0;border-top:1px solid #08100a">
        <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(site,{size:16}):(site.icon)}</span>
        <div style="flex:1">
          <div style="font-size:9px;color:var(--text)">${esc(site.name)} <span style="color:#8060c0;font-size:8px">${'⚠️'.repeat(site.risk)}</span></div>
          <div style="font-size:7.5px;color:var(--dim)">${esc(site.desc)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <button onclick="conductAlchemyExpedition('${site.id}')" style="padding:4px 8px;background:#0a0810;border:1px solid #2a1a3a;color:#8060c0;font-size:7px;cursor:pointer;white-space:nowrap">탐사 ${site.cost>0?site.cost+'G':'무료'}</button>
          <button onclick="researchFormulaLore('${site.id}')" style="padding:4px 8px;background:#0a0810;border:1px solid #2a1a3a;color:#c8a96e;font-size:7px;cursor:pointer;white-space:nowrap">연구 ${Math.round(site.cost*1.4)||0}G</button>
        </div>
      </div>`).join('')}
  </div>`;

  const matEntries = Object.entries(expedMats).filter(([,n])=>n>0);
  html += `<div style="padding:10px 12px;border-bottom:1px solid #0a150d">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#8060c0;margin-bottom:6px">🎒 보유 희귀 재료</div>
    ${matEntries.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px">${matEntries.map(([id,n])=>`<span onclick="showMaterialLore('${id}','ALCHEMY_MATERIALS')" style="padding:3px 7px;background:#0a0810;border:1px solid #1a1025;border-radius:2px;font-size:8px;color:var(--text);cursor:pointer">${typeof getEntityIconHTML==='function'?getEntityIconHTML(ALCHEMY_MATERIALS[id],{size:14}):(ALCHEMY_MATERIALS[id]?.icon||'')}${ALCHEMY_MATERIALS[id]?.name||id}×${n}</span>`).join('')}</div>` : `<div style="font-size:8px;color:var(--dim)">아직 채집한 재료가 없습니다.</div>`}
  </div>`;

  const known = loadKnownFormulas();
  html += `<div style="padding:10px 12px;border-bottom:1px solid #0a150d">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#8060c0;margin-bottom:6px">📗 아는 비법 (${known.length}/${Object.keys(FORMULA_LORE_SHOP).length}) — 재구성 가능</div>
    ${known.length ? known.map(id=>{
      const f = FORMULA_LORE_SHOP[id]; if(!f) return '';
      const rc = rarityColor[f.rarity]||'#8a9a8a';
      return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:8.5px;border-top:1px solid #08100a">
        <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(f,{size:16}):(f.icon)}</span>
        <span style="flex:1;color:${rc}">${esc(f.name)}</span>
        <button onclick="reconductExperiment('${id}')" style="padding:3px 7px;background:#0a0810;border:1px solid #2a1a3a;color:#8060c0;font-size:7px;cursor:pointer">재구성</button>
      </div>`;
    }).join('') : `<div style="font-size:8px;color:var(--dim)">아직 아는 비법이 없습니다.</div>`}
  </div>`;

  // 현자의 그림자 히든 퀘스트 진행 상황
  const expedLog = loadAlchemyExpedLog();
  const hqStored = (typeof loadHiddenQuests==='function') ? loadHiddenQuests() : {};
  const shadowQuest = hqStored['hq_sages_shadow'];
  let shadowHtml = '';
  if(shadowQuest?.status === 'completed'){
    shadowHtml = `<div style="padding:10px 12px;border-bottom:1px solid #0a150d;background:linear-gradient(135deg,#0f0a15,#0a0810)">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#a080d0;margin-bottom:4px">🌑 현자의 그림자 — 완료</div>
      <div style="font-size:8px;color:var(--dim)">물질의 한계를 넘는 지식과 그 대가를 모두 깨우쳤다.</div>
    </div>`;
  } else if(shadowQuest?.status === 'active'){
    shadowHtml = `<div style="padding:10px 12px;border-bottom:1px solid #0a150d;background:#0a0810">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#a080d0;margin-bottom:4px">🌑 현자의 그림자 — 진행 중</div>
      <div style="font-size:8px;color:var(--dim)">그랜드마스터 베르트랑이 그대에게 금지된 연구를 드러내고 있다. 이야기를 계속 진행하라.</div>
    </div>`;
  } else if(ws.level<3 || (expedLog.count||0)<10){
    shadowHtml = `<div style="padding:10px 12px;border-bottom:1px solid #0a150d">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#5a4a6a;margin-bottom:4px">🌑 현자의 그림자 — 미발견</div>
      <div style="font-size:8px;color:var(--dim)">공방 레벨 ${ws.level}/3 · 재료 탐사 ${expedLog.count||0}/10회 — 조건을 채우면 그랜드마스터 베르트랑이 그대에게 비밀을 드러낼 것이다.</div>
    </div>`;
  }
  html = shadowHtml + html;

  return html;
}
window.renderAlchemyExpeditionSection = renderAlchemyExpeditionSection;

window.conductAlchemyExpedition = conductAlchemyExpedition;

window.researchFormulaLore = researchFormulaLore;

window.reconductExperiment = reconductExperiment;

window.renderAlchemyExpeditionSection = renderAlchemyExpeditionSection;

export const NETWORK_KEY = 'tf-network';

export function loadNetwork(){
  try{ return JSON.parse(lsGet(NETWORK_KEY)||'null'); }catch(e){ return null; }
}
window.loadNetwork = loadNetwork;

export function saveNetwork(d){ try{ lsSet(NETWORK_KEY, JSON.stringify(d)); }catch(e){} }
window.saveNetwork = saveNetwork;

export function establishNetwork(type){
  const def = NETWORK_TYPES[type]; if(!def) return;
  const existing = loadNetwork();
  if(existing){ toast('이미 활동을 시작했습니다.'); return; }
  if((S.gold||0) < def.estCost){ toast(`골드 부족 (${def.estCost}G 필요)`); return; }
  S.gold -= def.estCost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  saveNetwork({
    type, fame:0, homeTown: loc?loc.name:'어딘가',
    // 음유시인 전용
    patrons:[], legendarySongs:[],
    // 상인 전용
    branches: loc?[loc.name]:[], warehouse:{}, rank:0,
    totalEarned:0,
  });
  toast(`${def.name}으로서의 활동을 시작했습니다!`, 4000, def);
  renderNetworkPanel();
}
window.establishNetwork = establishNetwork;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_227(){
window.plantCropAt=plantCropAt;

window.harvestPlotAt=harvestPlotAt;

window.sellCrop=sellCrop;

window.establishFarmHere=establishFarmHere;

window.hireFarmWorker=hireFarmWorker;

window.hireManagerFor=hireManagerFor;

window.promoteWorkerToManager=promoteWorkerToManager;

window.dismissManager=dismissManager;

window.attemptMonopoly=attemptMonopoly;

window.releaseMonopoly=releaseMonopoly;

window.signFarmContract=signFarmContract;

window.breakFarmContract=breakFarmContract;

window.convertCropToMaterial=convertCropToMaterial;
}

