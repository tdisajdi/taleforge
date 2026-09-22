// 상인 — 거래소 / 교역 / 지부 확장
// Auto-extracted from taleforge.html (original section banner preserved above).
import { TRANSPORT_CONFIG } from '../data/054-이동수단-시스템.js';
import { MATERIALS } from '../data/075-파트2-C-크래프팅-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { CROP_DEFS } from '../data/252-상단Caravan-UI-용병단-UI와-대칭-구조.js';
import { NETWORK_TYPES, TOMB_RELIC_DEFS } from '../data/253-SVG-타일-렌더링-작물-단계별-애니메이션.js';
import { SONG_GENRES } from '../data/254-음유시인-공연-후원자-전설곡.js';
import { CONTINENT_HUB_NAMES, CONTINENT_PROPER_NAME, CONTINENT_PROPER_NAME_ICON, CONTINENT_TERRAIN, CREW_NAMES, CREW_ROLES, DEAL_LORE_SHOP, DUNGEON_TIER_COLORS, ENEMY_SHIP_DEFS, HUNTING_GROUNDS, INTEL_MATERIALS, INTEL_SITES, ISLAND_DEFS, ISLAND_LOOT, MERCHANT_RANKS, NPC_SHIP_KINDS, RECOMPOSE_YIELD_BY_RARITY, ROAD_EDGES, SEA_EVENT_POOL, SHIP_TIERS, SHIP_UPGRADE_BASE_COST, SHIP_UPGRADE_DEFS, SONG_LORE_SHOP, TALE_MATERIALS, TALE_SITES, TRAVEL_ENCOUNTER_POOL, WORLD_MAP_ZONES } from '../data/255-상인-거래소-교역-지부-확장.js';
import { getLocationMonsterPool, getOrCreateEnemyMaterials, registerLocationMonster, saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { moveToLocation } from '../misc/053-게시판-시스템.js';
import { loadParty, saveParty, updateReputation } from '../misc/054-이동수단-시스템.js';
import { loadMaterials, saveMaterials } from '../misc/075-파트2-C-크래프팅-시스템.js';
import { loadDiary } from '../misc/076-파트2-D-일기기록-시스템.js';
import { checkFactionPursuit, detectStolenItems, getCaravanResidentMembers, getGarrisonDefense, getResidentMembers, grantMercBandXp, loadCaravan, loadCaravanGarrisons, loadMercBand, loadMercGarrisons, renderContractsPanel, tickCaravan, tickFoodWater, tickMercBand, tickNearDeathPenalty, tickSkillCooldowns, tickWorldTimer } from '../misc/251-통합-처리-함수-매-AI-응답-후-호출.js';
import { MAX_GUILD_MEMBERSHIPS, checkActivityMastery, checkGuildRankups, ensureFarmButtonVisible, ensureGraveButtonVisible, ensureWorkshopButtonVisible, establishNetwork, joinGuildV2, leaveGuildV2, loadGraveyard, loadGuilds, loadNetwork, renderFarmPanel, renderGravesPanel, renderWorkshopPanel, saveGraveyard, saveNetwork, tickFarmExtras, tickGraveyard, tickWorkshop } from '../misc/253-SVG-타일-렌더링-작물-단계별-애니메이션.js';
import { composeLegendarySong, performSong, seekPatron } from '../misc/254-음유시인-공연-후원자-전설곡.js';
import { loadStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadHiddenQuests } from '../quest/039-NEW-히든-퀘스트-시스템.js';
import { getMonsterTierStats } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { loadAILocations } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { getCropPrice, loadFarmWarehouse, saveFarmWarehouse, tickFarm } from '../ui/252-상단Caravan-UI-용병단-UI와-대칭-구조.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';

export function loadTradeToHere(cropId, qty){
  const net = loadNetwork(); if(!net || net.type!=='merchant') return;
  const wh = (typeof loadFarmWarehouse==='function') ? loadFarmWarehouse() : {};
  const have = wh[cropId]||0;
  if(qty>have){ toast('창고에 재고가 부족합니다.'); return; }
  wh[cropId] = have-qty;
  if(typeof saveFarmWarehouse==='function') saveFarmWarehouse(wh);
  net.warehouse[cropId] = (net.warehouse[cropId]||0)+qty;
  saveNetwork(net);
  toast(`📦 ${CROP_DEFS[cropId]?.name||cropId} ${qty}개를 거래소로 옮겼습니다.`, 2500);
  renderNetworkPanel();
}
window.loadTradeToHere = loadTradeToHere;

export function sellAtBranch(cropId, branchName){
  const net = loadNetwork(); if(!net || net.type!=='merchant') return;
  const have = net.warehouse[cropId]||0;
  if(have<=0){ toast('재고가 없습니다.'); return; }
  const basePrice = (typeof getCropPrice==='function') ? getCropPrice(cropId) : 10;
  const isHome = branchName===net.homeTown;
  const premium = isHome ? 1.0 : 1.5; // 다른 지부에서 팔면 원거리 교역 프리미엄
  const total = Math.round(basePrice*have*premium);
  net.warehouse[cropId] = 0;
  net.totalEarned = (net.totalEarned||0)+total;
  saveNetwork(net);
  S.gold += total; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  if(typeof window.updateStats==='function') window.updateStats('merchant_trades', 1);
  toast(`💰 ${branchName}에서 ${CROP_DEFS[cropId]?.name||cropId} 전량 판매! +${total}G${!isHome?' (원거리 프리미엄)':''}`, 3500);
  renderNetworkPanel();
}
window.sellAtBranch = sellAtBranch;

export function expandBranch(townName){
  const net = loadNetwork(); if(!net || net.type!=='merchant') return;
  if(net.branches.includes(townName)){ toast('이미 지부가 있는 도시입니다.'); return; }
  const baseCost = 150 + net.branches.length*100;
  // 상인 길드 등급이 높을수록 지부 개설 비용 할인 — 길드 가입이 실제
  // 네트워크 경영에 혜택을 주도록 연동한다.
  const merchantGp = (typeof getGuildPlayer==='function') ? getGuildPlayer('merchant') : null;
  const guildDiscount = (merchantGp && merchantGp.status==='member') ? Math.min(0.5, (merchantGp.rank||0)*0.1) : 0;
  const cost = Math.round(baseCost * (1-guildDiscount));
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  net.branches.push(townName);
  if(net.branches.length>=2 && net.rank<1) net.rank=1;
  if(net.branches.length>=3 && net.rank<2) net.rank=2;
  if(net.branches.length>=4 && net.rank<3) net.rank=3;
  if(net.branches.length>=5 && net.rank<4) net.rank=4;
  saveNetwork(net);
  toast(`🏪 ${townName}에 지부를 개설했습니다! (${MERCHANT_RANKS[net.rank]})${guildDiscount>0?` — 길드 할인 -${Math.round(guildDiscount*100)}%`:''}`, 4000);
  S._pendingNetworkHint = `${townName}에 새 지부를 열어 교역망을 확장했다.`;
  if(typeof gainGuildProficiency==='function') gainGuildProficiency('merchant', 15, `지부 개설: ${townName}`);
  renderNetworkPanel();
}
window.expandBranch = expandBranch;

export function tickNetwork(){
  const net = loadNetwork(); if(!net) return;
  if(net.type==='bard' && net.patrons.length>0){
    const income = net.patrons.reduce((s,p)=>s+p.income,0);
    S.gold += income; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
    // 후원자가 가끔 이탈(명성 관리 소홀 시)
    if(Math.random()<0.03 && net.patrons.length>0){
      const lost = net.patrons.pop();
      saveNetwork(net);
      toast(`💔 후원자 ${lost.name}이(가) 후원을 끊었습니다.`, 3000);
    }
  }
  if(net.type==='merchant' && net.branches.length>1){
    // 지부가 많을수록 매 턴 소량의 자동 수입(교역망 효과)
    const passiveIncome = (net.branches.length-1)*3;
    S.gold += passiveIncome; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  }
  // ── 지부 습격 — 재고를 쌓아두거나 지부를 여러 곳 두면 도적의 표적이
  //    된다. 지부에 용병을 배치(garrisonMerc)해두면 방어를 시도한다.
  if(net.type==='merchant' && net.branches.length>0){
    const stockTotal = Object.values(net.warehouse||{}).reduce((s,v)=>s+v,0);
    const raidChance = Math.min(0.12, 0.02 + net.branches.length*0.01 + Math.min(0.05, stockTotal*0.002));
    if(Math.random() < raidChance){
      const targetBranch = net.branches[Math.floor(Math.random()*net.branches.length)];
      const defense = (typeof getGarrisonDefense==='function') ? getGarrisonDefense('branch', targetBranch) : 0;
      if(defense>0 && Math.random()<defense){
        // 방어 성공 — 배치된 용병에게 소량 경험치 지급
        const garrisons = (typeof loadMercGarrisons==='function') ? loadMercGarrisons() : [];
        const g = garrisons.find(x=>x.siteType==='branch'&&x.siteId===targetBranch);
        if(g && typeof grantMercBandXp==='function') grantMercBandXp(2);
        toast(`🛡️ ${targetBranch} 지부가 습격당했지만 배치된 용병이 막아냈습니다!`, 3500);
      } else {
        const cropKeys = Object.keys(net.warehouse||{}).filter(k=>net.warehouse[k]>0);
        if(cropKeys.length){
          const target = cropKeys[Math.floor(Math.random()*cropKeys.length)];
          const lost = Math.ceil((net.warehouse[target]||0)*0.3);
          net.warehouse[target] = Math.max(0,(net.warehouse[target]||0)-lost);
          toast(`🏴 ${targetBranch} 지부가 도적에게 습격당해 ${CROP_DEFS[target]?.name||target} ${lost}개를 약탈당했습니다! (용병을 배치하면 방어 가능)`, 4500);
        } else {
          const goldLost = Math.min(S.gold||0, 20+Math.floor(Math.random()*30));
          if(goldLost>0){ S.gold -= goldLost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader(); }
          toast(`🏴 ${targetBranch} 지부가 도적에게 습격당해 ${goldLost}G를 약탈당했습니다! (용병을 배치하면 방어 가능)`, 4500);
        }
        S._pendingNetworkHint = `${targetBranch} 지부가 도적에게 습격당했다. 상단에 위협을 느끼고 대비책을 고민하는 모습이 서사에 드러날 수 있다.`;
      }
    }
  }
  saveNetwork(net);
}
window.tickNetwork = tickNetwork;

window._tickNetwork = tickNetwork;

export function getNetworkSection(){
  const net = loadNetwork();
  if(!net && !S._pendingNetworkHint) return '';
  let lines=[];
  if(net){
    const def = NETWORK_TYPES[net.type];
    if(net.type==='bard'){
      lines.push(`[${def.icon} 음유시인] 명성 ${net.fame||0}, 후원자 ${net.patrons.length}명, 전설곡 ${net.legendarySongs.length}곡.`);
    } else {
      lines.push(`[${def.icon} 상인] ${MERCHANT_RANKS[net.rank]||'수습 상인'} · 지부 ${net.branches.length}곳(${net.branches.join(', ')}).`);
    }
  }
  if(S._pendingNetworkHint){ lines.push(`[📜 사건] ${S._pendingNetworkHint}`); S._pendingNetworkHint=null; }
  return lines.length ? '\n'+lines.join('\n') : '';
}
window.getNetworkSection = getNetworkSection;

window.getNetworkSection = getNetworkSection;

export function renderNetworkPanel(){
  const body = document.getElementById('pb-network'); if(!body) return;
  const net = loadNetwork();

  let html = `<div style="padding:8px 12px;background:#0a060a;border-bottom:1px solid #2a1a2a;font-size:9px;color:#a070a0;line-height:1.6">🎭 네트워크 — 명성과 인맥을 쌓아 활동 범위를 넓힌다.</div>`;

  if(!net){
    html += `<div style="padding:16px 12px">
      <div style="font-size:9px;color:var(--dim);margin-bottom:10px">아직 활동을 시작하지 않았습니다.</div>
      ${Object.entries(NETWORK_TYPES).map(([type,def])=>`
        <div style="display:flex;align-items:center;gap:8px;padding:10px;border:1px solid ${def.color}44;margin-bottom:8px;border-radius:4px">
          <span style="color:${def.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:16}):(def.svgIcon||def.icon)}</span>
          <div style="flex:1"><div style="font-size:11px;color:${def.color}">${def.name}</div></div>
          <button onclick="establishNetwork('${type}')" style="padding:5px 10px;background:#0a060a;border:1px solid ${def.color}88;color:${def.color};font-size:8px;cursor:pointer">${def.estCost}G</button>
        </div>`).join('')}
    </div>`;
    body.innerHTML = html;
    return;
  }

  const def = NETWORK_TYPES[net.type];

  if(net.type==='bard'){
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a0a1a">
      <div style="font-family:Cinzel,serif;font-size:11px;color:${def.color};margin-bottom:6px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:11}):(def.icon)} 음유시인 — ${net.homeTown}</div>
      <div style="font-size:9px;color:var(--dim)">명성 ${net.fame||0} · 누적 수익 ${net.totalEarned||0}G</div>
    </div>`;

    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a0a1a">
      <div style="font-family:Cinzel,serif;font-size:10px;color:${def.color};margin-bottom:6px">🎵 공연하기</div>
      ${SONG_GENRES.map(g=>`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px solid #0a050a">
        <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(g,{size:16}):(g.icon)}</span>
        <div style="flex:1;font-size:9px;color:var(--text)">${g.name} <span style="color:var(--dim)">(명성+${g.baseFame}, ${g.baseGold[0]}~${g.baseGold[1]}G)</span></div>
        <button onclick="performSong('${g.id}')" style="padding:3px 8px;background:#0a060a;border:1px solid ${def.color}66;color:${def.color};font-size:7px;cursor:pointer">공연</button>
      </div>`).join('')}
    </div>`;

    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a0a1a">
      <div style="font-family:Cinzel,serif;font-size:10px;color:${def.color};margin-bottom:6px">🎩 후원자 (${net.patrons.length}/4)</div>
      ${net.patrons.map(p=>`<div style="font-size:9px;color:var(--text);padding:3px 0">${p.name} — ${p.income}G/턴</div>`).join('')}
      <button onclick="seekPatron()" style="width:100%;margin-top:6px;padding:5px;background:#0a060a;border:1px solid ${def.color}66;color:${def.color};font-size:8px;cursor:pointer">후원자 찾기 (명성 ${30+net.patrons.length*40} 필요)</button>
    </div>`;

    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a0a1a">
      <div style="font-family:Cinzel,serif;font-size:10px;color:${def.color};margin-bottom:6px">🎼 전설곡 (${net.legendarySongs.length}/3)</div>
      ${net.legendarySongs.map(s=>`<div style="font-size:9px;color:#e0c060;padding:3px 0">${s.name}</div>`).join('')}
      <button onclick="composeLegendarySong()" style="width:100%;margin-top:6px;padding:5px;background:#0a060a;border:1px solid ${def.color}66;color:${def.color};font-size:8px;cursor:pointer">작곡하기 (명성 200 필요, 영구 CHA+8)</button>
    </div>`;

    // 음유시인 전용 확장 — 이야기 채집 / 곡조 발견 / 일화 재구성
    if(typeof renderBardTaleSection==='function'){
      html += renderBardTaleSection(net);
    }
  } else {
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1505">
      <div style="font-family:Cinzel,serif;font-size:11px;color:${def.color};margin-bottom:6px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:11}):(def.icon)} ${MERCHANT_RANKS[net.rank]||'수습 상인'}</div>
      <div style="font-size:9px;color:var(--dim)">지부 ${net.branches.length}곳 · 누적 수익 ${net.totalEarned||0}G</div>
    </div>`;

    const stockEntries = Object.entries(net.warehouse||{}).filter(([,v])=>v>0);
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1505">
      <div style="font-family:Cinzel,serif;font-size:10px;color:${def.color};margin-bottom:6px">📦 거래소 재고</div>
      ${stockEntries.length?stockEntries.map(([cropId,qty])=>{
        const price = (typeof getCropPrice==='function') ? getCropPrice(cropId) : 0;
        return `<div style="padding:5px 0;border-top:1px solid #0a0805">
          <div style="font-size:9px;color:var(--text)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(CROP_DEFS[cropId],{size:14}):(CROP_DEFS[cropId]?.icon||'📦')} ${CROP_DEFS[cropId]?.name||cropId} × ${qty} (${price}G/개)</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px">
            ${net.branches.map(b=>`<button onclick="sellAtBranch('${cropId}','${esc(b).replace(/'/g,"\\'")}')" style="padding:2px 6px;background:#0a0800;border:1px solid #4a3a10;color:${def.color};font-size:7px;cursor:pointer">${b} 판매</button>`).join('')}
          </div>
        </div>`;
      }).join(''):'<div style="font-size:9px;color:var(--dim)">재고가 없습니다. 농장 창고에서 옮겨오세요.</div>'}
    </div>`;

    const garrisons = (typeof loadMercGarrisons==='function') ? loadMercGarrisons() : [];
    const band = (typeof loadMercBand==='function') ? loadMercBand() : {members:[]};
    const garrisonableMembers = (typeof getResidentMembers==='function') ? getResidentMembers(band) : band.members;
    const cGarrisons = (typeof loadCaravanGarrisons==='function') ? loadCaravanGarrisons() : [];
    const cBand = (typeof loadCaravan==='function') ? loadCaravan() : {members:[]};
    const cGarrisonableMembers = (typeof getCaravanResidentMembers==='function') ? getCaravanResidentMembers(cBand) : cBand.members;
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1505">
      <div style="font-family:Cinzel,serif;font-size:10px;color:${def.color};margin-bottom:6px">🏪 지부 (${net.branches.length}곳)</div>
      ${net.branches.map(b=>{
        const g = garrisons.find(x=>x.siteType==='branch' && x.siteId===b);
        const guard = g ? band.members.find(m=>m.id===g.memberId) : null;
        const cg = cGarrisons.find(x=>x.siteType==='branch' && x.siteId===b);
        const cGuard = cg ? cBand.members.find(m=>m.id===cg.memberId) : null;
        return `<div style="padding:5px 0;border-top:1px solid #100d05">
          <div style="font-size:9px;color:var(--text);margin-bottom:3px">${b} ${guard?`<span style="color:#6aca6a">🛡️ ${guard.name} 배치중</span>`:''} ${cGuard?`<span style="color:#c0a030">🏬 ${cGuard.name} 관리중</span>`:''}</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${guard
            ? `<button onclick="ungarrisonMerc('branch','${esc(b).replace(/'/g,"\\'")}');renderNetworkPanel()" style="padding:2px 8px;background:#0a0800;border:1px solid #5a2a10;color:#c07030;font-size:7px;cursor:pointer">호위 해제</button>`
            : (garrisonableMembers.length && band.established
                ? `<select onchange="if(this.value){garrisonMerc(this.value,'branch','${esc(b).replace(/'/g,"\\'")}','${esc(b).replace(/'/g,"\\'")}');renderNetworkPanel();}" style="padding:2px 6px;background:#0a0800;border:1px solid #3a2a10;color:${def.color};font-size:7px">
                    <option value="">🛡️ 호위 배치...</option>
                    ${garrisonableMembers.map(m=>`<option value="${m.id}">${m.name} (Lv.${m.level||1})</option>`).join('')}
                  </select>`
                : `<span style="font-size:7px;color:var(--dim)">${band.established?'배치 가능한 용병 없음':'용병단 미결성'}</span>`)
          }
          ${cGuard
            ? `<button onclick="ungarrisonCaravan('branch','${esc(b).replace(/'/g,"\\'")}');renderNetworkPanel()" style="padding:2px 8px;background:#0a0800;border:1px solid #5a2a10;color:#c07030;font-size:7px;cursor:pointer">관리 해제</button>`
            : (cGarrisonableMembers.length && cBand.established
                ? `<select onchange="if(this.value){garrisonCaravan(this.value,'branch','${esc(b).replace(/'/g,"\\'")}','${esc(b).replace(/'/g,"\\'")}');renderNetworkPanel();}" style="padding:2px 6px;background:#0a0800;border:1px solid #3a2a10;color:${def.color};font-size:7px">
                    <option value="">🏬 상단원 배치...</option>
                    ${cGarrisonableMembers.map(m=>`<option value="${m.id}">${m.name} (Lv.${m.level||1})</option>`).join('')}
                  </select>`
                : `<span style="font-size:7px;color:var(--dim)">${cBand.established?'배치 가능한 상단원 없음':'상단 미결성'}</span>`)
          }
          </div>
        </div>`;
      }).join('')}
      <button onclick="expandBranch((typeof loadCurrentLocation==='function'&&loadCurrentLocation())?loadCurrentLocation().name:'')" style="width:100%;margin-top:6px;padding:5px;background:#0a0800;border:1px solid ${def.color}66;color:${def.color};font-size:8px;cursor:pointer">현재 위치에 지부 개설 (${150+net.branches.length*100}G)</button>
    </div>`;

    // 상인 전용 확장 — 정보 수집 / 거래 성사 / 정보 재판매
    if(typeof renderMerchantIntelSection==='function'){
      html += renderMerchantIntelSection(net);
    }
  }

  html += `<div style="padding:8px 12px;text-align:center"><button onclick="renderNetworkPanel()" style="padding:5px 14px;background:#0a060a;border:1px solid #2a1a2a;color:#6a4a6a;font-size:8px;font-family:Cinzel,serif;cursor:pointer">🔄 새로고침</button></div>`;

  body.innerHTML = html;
}
window.renderNetworkPanel = renderNetworkPanel;

window.renderNetworkPanel = renderNetworkPanel;

window.loadTradeToHere=loadTradeToHere;

window.sellAtBranch=sellAtBranch;

window.expandBranch=expandBranch;

(function(){
  if(document.getElementById('p-network')) return;
  const div=document.createElement('div'); div.className='panel-ov'; div.id='p-network';
  div.innerHTML=`<div class="panel"><div class="p-hdr"><span class="p-title">🎭 네트워크</span><button class="p-close" onclick="closeP('network')">✕</button></div><div class="p-body scrollable" id="pb-network"></div></div>`;
  document.body.appendChild(div);
})();

export function ensureNetworkButtonVisible(){
  try{
    const b=document.querySelector('.btm-bar'); if(!b) return;
    const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
    const net = loadNetwork();
    const show = jobId==='bard' || jobId==='merchant' || jobId.includes('음유시인') || jobId.includes('상인') || !!net;
    if(show && !document.getElementById('btn-network')){
      const bn=document.createElement('button'); bn.id='btn-network'; bn.className='bb';
      bn.style.cssText='color:#a070a0;border-color:#3a1a3a'; bn.textContent='🎭네트워크'; bn.title='네트워크 — 공연/거래/인맥';
      bn.onclick=function(){ window.openP('network'); renderNetworkPanel(); }; b.appendChild(bn);
    }
  }catch(e){}
}
window.ensureNetworkButtonVisible = ensureNetworkButtonVisible;

window.ensureNetworkButtonVisible = ensureNetworkButtonVisible;

setTimeout(ensureNetworkButtonVisible, 6000);

export const TALE_LOG_KEY = 'tf-tale-gathering-log';

export function loadTaleLog(){ try{ return JSON.parse(lsGet(TALE_LOG_KEY)||'{"count":0,"lastSite":null}'); }catch(e){ return {count:0,lastSite:null}; } }
window.loadTaleLog = loadTaleLog;

export function saveTaleLog(d){ try{ lsSet(TALE_LOG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveTaleLog = saveTaleLog;

export const TALE_MATERIAL_BAG_KEY = 'tf-tale-materials';

export function loadTaleMaterials(){ try{ return JSON.parse(lsGet(TALE_MATERIAL_BAG_KEY)||'{}'); }catch(e){ return {}; } }
window.loadTaleMaterials = loadTaleMaterials;

export function saveTaleMaterials(d){ try{ lsSet(TALE_MATERIAL_BAG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveTaleMaterials = saveTaleMaterials;

export const SONG_LORE_KEY = 'tf-known-songs';

export function loadKnownSongs(){ try{ return JSON.parse(lsGet(SONG_LORE_KEY)||'[]'); }catch(e){ return []; } }
window.loadKnownSongs = loadKnownSongs;

export function saveKnownSongs(d){ try{ lsSet(SONG_LORE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveKnownSongs = saveKnownSongs;

export function hasKnownSong(id){ return loadKnownSongs().includes(id); }
window.hasKnownSong = hasKnownSong;

export function learnSong(id){
  const arr = loadKnownSongs();
  if(arr.includes(id)) return false;
  arr.push(id); saveKnownSongs(arr); return true;
}
window.learnSong = learnSong;

export function gatherTale(siteId){
  const net = loadNetwork();
  if(!net || net.type!=='bard'){ toast('음유시인 활동을 시작해야 이야기를 채집할 수 있습니다.'); return; }
  const site = TALE_SITES.find(s=>s.id===siteId); if(!site) return;
  if((S.gold||0) < site.cost){ toast(`채집 비용 부족 (${site.cost}G 필요)`); return; }

  S.gold -= site.cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  // 위험 판정 — 정치적 위험(궁정 등)은 HP 대신 평판/관계 리스크로 변형
  const riskChance = Math.max(0.02, site.risk*0.05);
  const backfired = Math.random() < riskChance;

  // 소재 획득 — 플레이어의 실제 diary가 있으면 우선 그걸 이야기로 승화, 없으면 일반 소재
  const mats = loadTaleMaterials();
  const gainCount = 2 + Math.floor(Math.random()*2) + Math.floor((net.fame||0)/100);
  const gained = {};
  for(let i=0;i<gainCount;i++){
    const mid = site.matPool[Math.floor(Math.random()*site.matPool.length)];
    mats[mid] = (mats[mid]||0)+1;
    gained[mid] = (gained[mid]||0)+1;
  }
  saveTaleMaterials(mats);

  const log = loadTaleLog();
  log.count = (log.count||0)+1;
  log.lastSite = site.id;
  saveTaleLog(log);

  // 실제 플레이 사건(diary)에서 소재로 승화될 만한 항목이 있으면 특별 언급
  let realEventNote = '';
  const diary = (typeof loadDiary==='function') ? loadDiary() : [];
  const recentNotable = diary.filter(d=>['quest','npc','combat','event'].includes(d.type)).slice(-5);
  if(recentNotable.length && Math.random()<0.35){
    const pick = recentNotable[Math.floor(Math.random()*recentNotable.length)];
    realEventNote = ` 최근 겪은 「${pick.content.slice(0,40)}...」 사건이 이야기에 살을 붙였다.`;
  }

  const gainedText = Object.entries(gained).map(([id,n])=>`${TALE_MATERIALS[id]?.icon||''}${TALE_MATERIALS[id]?.name||id}×${n}`).join(', ');
  let msg = `${site.icon} ${site.name}에서 이야기 채집 완료! 획득: ${gainedText}`;

  if(backfired){
    const repHit = 2+Math.floor(Math.random()*4)*site.risk;
    if(typeof updateReputation==='function') updateReputation(-repHit);
    msg += ` — ⚠️ 캐묻다가 눈총을 샀다 (평판 -${repHit})`;
  }
  toast(msg, 4500);

  attemptSongDiscovery(site);

  S._pendingNetworkHint = `${site.name}에서 이야기를 채집했다.${backfired?' 캐묻는 과정에서 반감을 사기도 했다.':''} 얻은 소재: ${gainedText}.${realEventNote}`;
  if(typeof window.updateStats==='function') window.updateStats('tales_gathered', 1);
  renderNetworkPanel();
}
window.gatherTale = gatherTale;

export function attemptSongDiscovery(site){
  const known = new Set(loadKnownSongs());
  const candidates = Object.entries(SONG_LORE_SHOP).filter(([id,s]) => site.bpTierPool.includes(s.dropTier) && !known.has(id));
  if(!candidates.length) return;
  const findChance = 0.10 + site.risk*0.03;
  if(Math.random() > findChance) return;
  const [songId, song] = candidates[Math.floor(Math.random()*candidates.length)];
  if(learnSong(songId)){
    toast(`🎼 새 곡조를 떠올렸다! [${song.rarity.toUpperCase()}] ${song.name}`, 4500);
  }
}
window.attemptSongDiscovery = attemptSongDiscovery;

export function searchForSongLore(siteId){
  const net = loadNetwork();
  if(!net || net.type!=='bard'){ toast('음유시인 활동을 시작해야 곡조를 탐색할 수 있습니다.'); return; }
  const site = TALE_SITES.find(s=>s.id===siteId); if(!site) return;
  const cost = Math.round(site.cost*1.4);
  if((S.gold||0) < cost){ toast(`탐색 비용 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  const known = new Set(loadKnownSongs());
  const candidates = Object.entries(SONG_LORE_SHOP).filter(([id,s]) => site.bpTierPool.includes(s.dropTier) && !known.has(id));
  if(!candidates.length){
    toast(`${site.name}에서 더 이상 새로운 곡조를 찾을 수 없다. 이 구역의 이야기는 이미 다 알고 있다.`, 3500);
    renderNetworkPanel();
    return;
  }
  const findChance = 0.22 + site.risk*0.05;
  if(Math.random() < findChance){
    const [songId, song] = candidates[Math.floor(Math.random()*candidates.length)];
    learnSong(songId);
    toast(`🎼 곡조 발견! [${song.rarity.toUpperCase()}] ${song.name}`, 4500);
    S._pendingNetworkHint = `${site.name}에서 잊혀졌던 곡조 「${song.name}」의 실마리를 찾아냈다.`;
  } else {
    toast(`${site.name}을(를) 샅샅이 뒤졌지만 새로운 곡조의 실마리는 찾지 못했다.`, 3500, site);
  }
  renderNetworkPanel();
}
window.searchForSongLore = searchForSongLore;

export function getRecomposeMaterials(songId){
  const song = SONG_LORE_SHOP[songId]; if(!song) return {};
  const rarity = song.rarity || 'common';
  const n = RECOMPOSE_YIELD_BY_RARITY[rarity] || 1;
  let pool;
  if(rarity==='legendary') pool = ['royal_rumor','forbidden_lore','ancient_verse'];
  else if(rarity==='rare') pool = ['heros_deed','tragic_fall','battle_song'];
  else if(rarity==='uncommon') pool = ['battle_song','travel_tale'];
  else pool = ['gossip','travel_tale'];
  const result = {};
  for(let i=0;i<n;i++){
    const mid = pool[Math.floor(Math.random()*pool.length)];
    result[mid] = (result[mid]||0)+1;
  }
  return result;
}
window.getRecomposeMaterials = getRecomposeMaterials;

export function recomposeSong(songId){
  const net = loadNetwork();
  if(!net || net.type!=='bard'){ toast('음유시인 활동을 시작해야 노래를 재구성할 수 있습니다.'); return; }
  if(!hasKnownSong(songId)){ toast('알지 못하는 곡조입니다.'); return; }
  const song = SONG_LORE_SHOP[songId]; if(!song) return;

  const gained = getRecomposeMaterials(songId);
  const mats = loadTaleMaterials();
  Object.entries(gained).forEach(([id,n])=>{ mats[id]=(mats[id]||0)+n; });
  saveTaleMaterials(mats);
  const gainedText = Object.entries(gained).map(([id,n])=>`${TALE_MATERIALS[id]?.icon||''}${TALE_MATERIALS[id]?.name||id}×${n}`).join(', ');

  // 역발상: 낮은 확률로 다른 미보유 곡조를 즉석에서 깨우침
  const rarity = song.rarity || 'common';
  const inspireChance = { common:0.4, uncommon:0.28, rare:0.18, legendary:0.08 }[rarity] || 0.25;
  let inspireMsg = '';
  if(Math.random() < inspireChance){
    const known = new Set(loadKnownSongs());
    const others = Object.entries(SONG_LORE_SHOP).filter(([id])=>!known.has(id) && id!==songId);
    if(others.length){
      const [newId, newSong] = others[Math.floor(Math.random()*others.length)];
      learnSong(newId);
      inspireMsg = ` — 영감이 튀어 새로운 곡조 「${newSong.name}」까지 떠올렸다!`;
    }
  }

  toast(`🎻 「${song.name}」을(를) 해체해 재구성했다. 회수: ${gainedText}${inspireMsg}`, 4500);
  if(inspireMsg) S._pendingNetworkHint = `낡은 곡조를 뜯어보다가 우연히 새로운 가락을 깨우쳤다.`;
  if(typeof window.updateStats==='function') window.updateStats('songs_recomposed', 1);
  renderNetworkPanel();
}
window.recomposeSong = recomposeSong;

export function renderBardTaleSection(net){
  const rarityColor = {common:'#8a9a8a',uncommon:'#4a9a6a',rare:'#4a6fa5',legendary:'#c8a96e'};
  const taleMats = loadTaleMaterials();

  let html = `<div style="padding:10px 12px;border-bottom:1px solid #1a0a1a">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c060a0;margin-bottom:6px">📖 이야기 채집 — 직접 발로 뛰어 소재를 모은다</div>
    <div style="font-size:8px;color:var(--dim);margin-bottom:8px">위험한 곳일수록 희귀한 소재와 곡조 발견 확률이 높아진다. 캐묻다 반감을 살 위험 있음.</div>
    ${TALE_SITES.map(site=>`
      <div style="display:flex;align-items:center;gap:7px;padding:7px 0;border-top:1px solid #0a050a">
        <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(site,{size:16}):(site.icon)}</span>
        <div style="flex:1">
          <div style="font-size:9px;color:var(--text)">${esc(site.name)} <span style="color:#c060a0;font-size:8px">${'⚠️'.repeat(site.risk)}</span></div>
          <div style="font-size:7.5px;color:var(--dim)">${esc(site.desc)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <button onclick="gatherTale('${site.id}')" style="padding:4px 8px;background:#0a060a;border:1px solid #3a1a3a;color:#c060a0;font-size:7px;cursor:pointer;white-space:nowrap">채집 ${site.cost>0?site.cost+'G':'무료'}</button>
          <button onclick="searchForSongLore('${site.id}')" style="padding:4px 8px;background:#0a060a;border:1px solid #3a1a3a;color:#c8a96e;font-size:7px;cursor:pointer;white-space:nowrap">탐색 ${Math.round(site.cost*1.4)||0}G</button>
        </div>
      </div>`).join('')}
  </div>`;

  // 보유 소재 요약
  const matEntries = Object.entries(taleMats).filter(([,n])=>n>0);
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a0a1a">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c060a0;margin-bottom:6px">🎒 보유 이야기 소재</div>
    ${matEntries.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px">${matEntries.map(([id,n])=>`<span onclick="showMaterialLore('${id}','TALE_MATERIALS')" style="padding:3px 7px;background:#0a060a;border:1px solid #2a1a2a;border-radius:2px;font-size:8px;color:var(--text);cursor:pointer">${typeof getEntityIconHTML==='function'?getEntityIconHTML(TALE_MATERIALS[id],{size:14}):(TALE_MATERIALS[id]?.icon||'')}${TALE_MATERIALS[id]?.name||id}×${n}</span>`).join('')}</div>` : `<div style="font-size:8px;color:var(--dim)">아직 채집한 소재가 없습니다.</div>`}
  </div>`;

  // 알고 있는 곡조 — 재구성(분해) 가능 목록
  const known = loadKnownSongs();
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a0a1a">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c060a0;margin-bottom:6px">🎻 아는 곡조 (${known.length}/${Object.keys(SONG_LORE_SHOP).length}) — 재구성 가능</div>
    ${known.length ? known.map(id=>{
      const s = SONG_LORE_SHOP[id]; if(!s) return '';
      const rc = rarityColor[s.rarity]||'#8a9a8a';
      return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:8.5px;border-top:1px solid #0a050a">
        <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:16}):(s.icon)}</span>
        <span style="flex:1;color:${rc}">${esc(s.name)}</span>
        <button onclick="recomposeSong('${id}')" style="padding:3px 7px;background:#0a060a;border:1px solid #3a1a3a;color:#a0709a;font-size:7px;cursor:pointer">재구성</button>
      </div>`;
    }).join('') : `<div style="font-size:8px;color:var(--dim)">아직 아는 곡조가 없습니다.</div>`}
  </div>`;

  // 핀느간의 마지막 제자 히든 퀘스트 진행 상황
  const taleLog = loadTaleLog();
  const hqStored = (typeof loadHiddenQuests==='function') ? loadHiddenQuests() : {};
  const immortalQuest = hqStored['hq_immortal_song'];
  let immortalHtml = '';
  if(immortalQuest?.status === 'completed'){
    immortalHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a0a1a;background:linear-gradient(135deg,#1a0a1a,#0a060a)">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#e0a0c0;margin-bottom:4px">🎶 불멸의 노래 — 완료</div>
      <div style="font-size:8px;color:var(--dim)">불멸의 노래 세 곡을 모두 완성했다. 이 노래들은 이제 세상 어디서든 불릴 것이다.</div>
    </div>`;
  } else if(immortalQuest?.status === 'active'){
    immortalHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a0a1a;background:#0d060d">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#e0a0c0;margin-bottom:4px">🎶 불멸의 노래 — 진행 중</div>
      <div style="font-size:8px;color:var(--dim)">전설의 음유시인 핀느간이 그대를 시험하고 있다. 이야기를 계속 진행하라.</div>
    </div>`;
  } else if((net.fame||0)<200 || (taleLog.count||0)<10){
    immortalHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a0a1a">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#6a4a6a;margin-bottom:4px">🎶 불멸의 노래 — 미발견</div>
      <div style="font-size:8px;color:var(--dim)">명성 ${net.fame||0}/200 · 이야기 채집 ${taleLog.count||0}/10회 — 조건을 채우면 전설의 음유시인 핀느간이 그대를 시험할 것이다.</div>
    </div>`;
  }
  html = immortalHtml + html;

  return html;
}
window.renderBardTaleSection = renderBardTaleSection;

window.gatherTale = gatherTale;

window.searchForSongLore = searchForSongLore;

window.recomposeSong = recomposeSong;

window.renderBardTaleSection = renderBardTaleSection;

export const INTEL_LOG_KEY = 'tf-intel-gathering-log';

export function loadIntelLog(){ try{ return JSON.parse(lsGet(INTEL_LOG_KEY)||'{"count":0,"lastSite":null}'); }catch(e){ return {count:0,lastSite:null}; } }
window.loadIntelLog = loadIntelLog;

export function saveIntelLog(d){ try{ lsSet(INTEL_LOG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveIntelLog = saveIntelLog;

export const INTEL_MATERIAL_BAG_KEY = 'tf-intel-materials';

export function loadIntelMaterials(){ try{ return JSON.parse(lsGet(INTEL_MATERIAL_BAG_KEY)||'{}'); }catch(e){ return {}; } }
window.loadIntelMaterials = loadIntelMaterials;

export function saveIntelMaterials(d){ try{ lsSet(INTEL_MATERIAL_BAG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveIntelMaterials = saveIntelMaterials;

export const DEAL_LORE_KEY = 'tf-known-deals';

export function loadKnownDeals(){ try{ return JSON.parse(lsGet(DEAL_LORE_KEY)||'[]'); }catch(e){ return []; } }
window.loadKnownDeals = loadKnownDeals;

export function saveKnownDeals(d){ try{ lsSet(DEAL_LORE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveKnownDeals = saveKnownDeals;

export function hasKnownDeal(id){ return loadKnownDeals().includes(id); }
window.hasKnownDeal = hasKnownDeal;

export function learnDeal(id){
  const arr = loadKnownDeals();
  if(arr.includes(id)) return false;
  arr.push(id); saveKnownDeals(arr); return true;
}
window.learnDeal = learnDeal;

export function gatherIntel(siteId){
  const net = loadNetwork();
  if(!net || net.type!=='merchant'){ toast('상인 활동을 시작해야 정보를 수집할 수 있습니다.'); return; }
  const site = INTEL_SITES.find(s=>s.id===siteId); if(!site) return;
  if((S.gold||0) < site.cost){ toast(`정보 수집 비용 부족 (${site.cost}G 필요)`); return; }

  S.gold -= site.cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  // 적발 위험 — 대장장이 부상, 치유사 감염과 대칭. 밀수·이중거래가 걸리면 평판 손실.
  // 도적 길드 등급이 높을수록 정보망의 보호를 받아 발각 위험이 줄어든다.
  const thievesGp = (typeof getGuildPlayer==='function') ? getGuildPlayer('thieves') : null;
  const thievesRankDiscount = (thievesGp && thievesGp.status==='member') ? Math.min(0.6, (thievesGp.rank||0)*0.12) : 0;
  const riskChance = Math.max(0.02, site.risk*0.05*(1-thievesRankDiscount));
  const caught = Math.random() < riskChance;

  const mats = loadIntelMaterials();
  const gainCount = 2 + Math.floor(Math.random()*2) + (net.rank||0);
  const gained = {};
  for(let i=0;i<gainCount;i++){
    const mid = site.matPool[Math.floor(Math.random()*site.matPool.length)];
    mats[mid] = (mats[mid]||0)+1;
    gained[mid] = (gained[mid]||0)+1;
  }
  saveIntelMaterials(mats);

  const log = loadIntelLog();
  log.count = (log.count||0)+1;
  log.lastSite = site.id;
  saveIntelLog(log);

  const gainedText = Object.entries(gained).map(([id,n])=>`${INTEL_MATERIALS[id]?.icon||''}${INTEL_MATERIALS[id]?.name||id}×${n}`).join(', ');
  let msg = `${site.icon} ${site.name}에서 정보 수집 완료! 획득: ${gainedText}`;

  if(caught){
    const repHit = 2+Math.floor(Math.random()*4)*site.risk;
    if(typeof updateReputation==='function') updateReputation(-repHit);
    msg += ` — ⚠️ 뒷조사가 발각됐다 (평판 -${repHit})`;
  }
  toast(msg, 4500);

  attemptDealDiscovery(site);

  S._pendingNetworkHint = `${site.name}에서 정보를 캤다.${caught?' 뒷조사가 발각되어 눈총을 사기도 했다.':''} 얻은 정보: ${gainedText}.`;
  if(typeof window.updateStats==='function') window.updateStats('intel_gathered', 1);
  renderNetworkPanel();
}
window.gatherIntel = gatherIntel;

export function attemptDealDiscovery(site){
  const known = new Set(loadKnownDeals());
  const candidates = Object.entries(DEAL_LORE_SHOP).filter(([id,d]) => site.bpTierPool.includes(d.dropTier) && !known.has(id));
  if(!candidates.length) return;
  const findChance = 0.10 + site.risk*0.03;
  if(Math.random() > findChance) return;
  const [dealId, deal] = candidates[Math.floor(Math.random()*candidates.length)];
  if(learnDeal(dealId)){
    toast(`📜 새로운 거래를 포착했다! [${deal.rarity.toUpperCase()}] ${deal.name}`, 4500);
  }
}
window.attemptDealDiscovery = attemptDealDiscovery;

export function pursueDealLore(siteId){
  const net = loadNetwork();
  if(!net || net.type!=='merchant'){ toast('상인 활동을 시작해야 거래를 추적할 수 있습니다.'); return; }
  const site = INTEL_SITES.find(s=>s.id===siteId); if(!site) return;
  const cost = Math.round(site.cost*1.4);
  if((S.gold||0) < cost){ toast(`추적 비용 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  const known = new Set(loadKnownDeals());
  const candidates = Object.entries(DEAL_LORE_SHOP).filter(([id,d]) => site.bpTierPool.includes(d.dropTier) && !known.has(id));
  if(!candidates.length){
    toast(`${site.name}에서 더 이상 새로운 거래를 찾을 수 없다. 이 구역의 정보망은 이미 다 파악했다.`, 3500);
    renderNetworkPanel();
    return;
  }
  const findChance = 0.22 + site.risk*0.05;
  if(Math.random() < findChance){
    const [dealId, deal] = candidates[Math.floor(Math.random()*candidates.length)];
    learnDeal(dealId);
    toast(`📜 거래 포착! [${deal.rarity.toUpperCase()}] ${deal.name}`, 4500);
    S._pendingNetworkHint = `${site.name}에서 은밀한 거래 「${deal.name}」의 실마리를 찾아냈다.`;
  } else {
    toast(`${site.name}을(를) 샅샅이 훑었지만 새로운 거래의 실마리는 찾지 못했다.`, 3500, site);
  }
  renderNetworkPanel();
}
window.pursueDealLore = pursueDealLore;

export function getResellGold(dealId){
  const deal = DEAL_LORE_SHOP[dealId]; if(!deal) return 0;
  const rarity = deal.rarity || 'common';
  const base = { common:20, uncommon:50, rare:120, legendary:300 }[rarity] || 20;
  return base + Math.floor(Math.random()*base*0.5);
}
window.getResellGold = getResellGold;

export function resellIntel(dealId){
  const net = loadNetwork();
  if(!net || net.type!=='merchant'){ toast('상인 활동을 시작해야 정보를 재판매할 수 있습니다.'); return; }
  if(!hasKnownDeal(dealId)){ toast('알지 못하는 거래 정보입니다.'); return; }
  const deal = DEAL_LORE_SHOP[dealId]; if(!deal) return;

  const gold = getResellGold(dealId);
  S.gold += gold; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  net.totalEarned = (net.totalEarned||0) + gold;
  saveNetwork(net);

  // 역발상: 낮은 확률로 다른 미보유 거래를 즉석에서 포착
  const rarity = deal.rarity || 'common';
  const inspireChance = { common:0.4, uncommon:0.28, rare:0.18, legendary:0.08 }[rarity] || 0.25;
  let inspireMsg = '';
  if(Math.random() < inspireChance){
    const known = new Set(loadKnownDeals());
    const others = Object.entries(DEAL_LORE_SHOP).filter(([id])=>!known.has(id) && id!==dealId);
    if(others.length){
      const [newId, newDeal] = others[Math.floor(Math.random()*others.length)];
      learnDeal(newId);
      inspireMsg = ` — 그 과정에서 새로운 거래 「${newDeal.name}」까지 포착했다!`;
    }
  }

  toast(`💰 「${deal.name}」을(를) 재판매해 ${gold}G를 벌었다${inspireMsg}`, 4500);
  if(inspireMsg) S._pendingNetworkHint = `낡은 정보를 되팔다가 우연히 새로운 거래의 냄새를 맡았다.`;
  if(typeof window.updateStats==='function') window.updateStats('intel_resold', 1);
  renderNetworkPanel();
}
window.resellIntel = resellIntel;

export function renderMerchantIntelSection(net){
  const rarityColor = {common:'#8a9a8a',uncommon:'#4a9a6a',rare:'#4a6fa5',legendary:'#c8a96e'};
  const intelMats = loadIntelMaterials();

  let html = `<div style="padding:10px 12px;border-bottom:1px solid #151005">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">🕵️ 정보 수집 — 직접 발로 뛰어 정보를 캔다</div>
    <div style="font-size:8px;color:var(--dim);margin-bottom:8px">위험한 곳일수록 값나가는 정보와 거래 발견 확률이 높아진다. 적발 시 평판 손실 위험.</div>
    ${INTEL_SITES.map(site=>`
      <div style="display:flex;align-items:center;gap:7px;padding:7px 0;border-top:1px solid #100d05">
        <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(site,{size:16}):(site.icon)}</span>
        <div style="flex:1">
          <div style="font-size:9px;color:var(--text)">${esc(site.name)} <span style="color:#c0a030;font-size:8px">${'⚠️'.repeat(site.risk)}</span></div>
          <div style="font-size:7.5px;color:var(--dim)">${esc(site.desc)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <button onclick="gatherIntel('${site.id}')" style="padding:4px 8px;background:#0a0800;border:1px solid #3a2a10;color:#c0a030;font-size:7px;cursor:pointer;white-space:nowrap">수집 ${site.cost>0?site.cost+'G':'무료'}</button>
          <button onclick="pursueDealLore('${site.id}')" style="padding:4px 8px;background:#0a0800;border:1px solid #3a2a10;color:#c8a96e;font-size:7px;cursor:pointer;white-space:nowrap">추적 ${Math.round(site.cost*1.4)||0}G</button>
        </div>
      </div>`).join('')}
  </div>`;

  // 보유 정보 요약
  const matEntries = Object.entries(intelMats).filter(([,n])=>n>0);
  html += `<div style="padding:10px 12px;border-bottom:1px solid #151005">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">🎒 보유 정보</div>
    ${matEntries.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px">${matEntries.map(([id,n])=>`<span onclick="showMaterialLore('${id}','INTEL_MATERIALS')" style="padding:3px 7px;background:#0a0800;border:1px solid #2a2010;border-radius:2px;font-size:8px;color:var(--text);cursor:pointer">${typeof getEntityIconHTML==='function'?getEntityIconHTML(INTEL_MATERIALS[id],{size:14}):(INTEL_MATERIALS[id]?.icon||'')}${INTEL_MATERIALS[id]?.name||id}×${n}</span>`).join('')}</div>` : `<div style="font-size:8px;color:var(--dim)">아직 수집한 정보가 없습니다.</div>`}
  </div>`;

  // 알고 있는 거래 — 재판매 가능 목록
  const known = loadKnownDeals();
  html += `<div style="padding:10px 12px;border-bottom:1px solid #151005">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">📜 포착한 거래 (${known.length}/${Object.keys(DEAL_LORE_SHOP).length}) — 재판매 가능</div>
    ${known.length ? known.map(id=>{
      const d = DEAL_LORE_SHOP[id]; if(!d) return '';
      const rc = rarityColor[d.rarity]||'#8a9a8a';
      return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:8.5px;border-top:1px solid #100d05">
        <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(d,{size:16}):(d.icon)}</span>
        <span style="flex:1;color:${rc}">${esc(d.name)}</span>
        <button onclick="resellIntel('${id}')" style="padding:3px 7px;background:#0a0800;border:1px solid #3a2a10;color:#c0a030;font-size:7px;cursor:pointer">재판매</button>
      </div>`;
    }).join('') : `<div style="font-size:8px;color:var(--dim)">아직 포착한 거래가 없습니다.</div>`}
  </div>`;

  // 양날의 저울 히든 퀘스트 진행 상황
  const intelLog = loadIntelLog();
  const hqStored = (typeof loadHiddenQuests==='function') ? loadHiddenQuests() : {};
  const scaleQuest = hqStored['hq_double_edged_scale'];
  let scaleHtml = '';
  if(scaleQuest?.status === 'completed'){
    scaleHtml = `<div style="padding:10px 12px;border-bottom:1px solid #151005;background:linear-gradient(135deg,#151005,#0a0800)">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:4px">⚖️ 양날의 저울 — 완료</div>
      <div style="font-size:8px;color:var(--dim)">모든 것이 거래가 된다는 이치를 완전히 체득했다. 어떤 협상 자리에서도 우위를 잃지 않는다.</div>
    </div>`;
  } else if(scaleQuest?.status === 'active'){
    scaleHtml = `<div style="padding:10px 12px;border-bottom:1px solid #151005;background:#0a0800">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:4px">⚖️ 양날의 저울 — 진행 중</div>
      <div style="font-size:8px;color:var(--dim)">부단주 다리우스가 그대에게 자신의 비밀을 드러내고 있다. 이야기를 계속 진행하라.</div>
    </div>`;
  } else if((net.rank||0)<3 || (intelLog.count||0)<10){
    scaleHtml = `<div style="padding:10px 12px;border-bottom:1px solid #151005">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#6a5a3a;margin-bottom:4px">⚖️ 양날의 저울 — 미발견</div>
      <div style="font-size:8px;color:var(--dim)">상단 직급 ${MERCHANT_RANKS[net.rank]||'수습 상인'}(3단계 지부장 이상 필요) · 정보 수집 ${intelLog.count||0}/10회 — 조건을 채우면 부단주 다리우스가 그대에게 비밀을 드러낼 것이다.</div>
    </div>`;
  }
  html = scaleHtml + html;

  return html;
}
window.renderMerchantIntelSection = renderMerchantIntelSection;

window.gatherIntel = gatherIntel;

window.pursueDealLore = pursueDealLore;

window.resellIntel = resellIntel;

window.renderMerchantIntelSection = renderMerchantIntelSection;

export const HUNTER_LOG_KEY = 'tf-hunter-expedition-log';

export function loadHunterLog(){ try{ return JSON.parse(lsGet(HUNTER_LOG_KEY)||'{"count":0,"lastSite":null}'); }catch(e){ return {count:0,lastSite:null}; } }
window.loadHunterLog = loadHunterLog;

export function saveHunterLog(d){ try{ lsSet(HUNTER_LOG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveHunterLog = saveHunterLog;

export const HUNTER_TROPHY_KEY = 'tf-hunter-trophies';

export function loadHunterTrophies(){ try{ return JSON.parse(lsGet(HUNTER_TROPHY_KEY)||'{}'); }catch(e){ return {}; } }
window.loadHunterTrophies = loadHunterTrophies;

export function saveHunterTrophies(d){ try{ lsSet(HUNTER_TROPHY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveHunterTrophies = saveHunterTrophies;

export function huntAtGrounds(groundId){
  const ground = HUNTING_GROUNDS.find(g=>g.id===groundId); if(!ground) return;
  const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
  if(jobId!=='hunter'){ toast('사냥꾼이어야 사냥터 원정을 나갈 수 있습니다.'); return; }
  if((S.gold||0) < ground.cost){ toast(`원정 비용 부족 (${ground.cost}G 필요)`); return; }

  S.gold -= ground.cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  // 현재 장소가 그 사냥터와 매핑돼 있다면(즉 실제로 그 장소에 와있다면)
  // 그 장소의 몬스터 풀을 우선 활용, 아니라면 사냥터 자체를 가상의
  // 장소 키로 사용해 독립적인 몬스터 풀을 관리한다.
  const poolKey = '사냥터:' + ground.name;
  const pool = (typeof getLocationMonsterPool==='function') ? getLocationMonsterPool(poolKey) : [];

  const FALLBACK_PREY = { 1:['들토끼','멧닭','다람쥐 마물'], 2:['늑대','멧돼지','여우'], 3:['곰','트롤 새끼','오우거 새끼'], 4:['와이번','만티코어','키메라'] };
  let preyName;
  if(pool.length && Math.random() < 0.7){
    preyName = pool[Math.floor(Math.random()*pool.length)];
  } else {
    const fb = FALLBACK_PREY[ground.risk] || FALLBACK_PREY[1];
    preyName = fb[Math.floor(Math.random()*fb.length)];
    if(typeof registerLocationMonster==='function') registerLocationMonster(poolKey, preyName);
  }

  // 위험 판정 — 대장장이 채광의 부상 위험과 동일한 패턴
  const riskChance = Math.max(0.02, ground.risk*0.05);
  const injured = Math.random() < riskChance;

  // 부산물 획득 — 이미 있는 동적 재료 시스템(getOrCreateEnemyMaterials)을
  // 그대로 재사용한다. 사냥꾼이 사냥한 몬스터도 다른 경로로 처치한
  // 몬스터와 정확히 동일한 재료 풀을 공유해, "이 몬스터의 재료"라는
  // 개념이 시스템 전체에서 일관되게 유지된다.
  const rarity = ground.risk>=4 ? 'legendary' : ground.risk>=3 ? 'rare' : ground.risk>=2 ? 'uncommon' : 'common';
  const matIds = (typeof getOrCreateEnemyMaterials==='function') ? getOrCreateEnemyMaterials(preyName, rarity) : [];
  const mats = (typeof loadMaterials==='function') ? loadMaterials() : {};
  matIds.forEach(mid=>{ mats[mid] = (mats[mid]||0)+1; });
  if(typeof saveMaterials==='function') saveMaterials(mats);

  // 전리품(트로피) 기록 — 이 몬스터를 몇 번 사냥했는지 별도로 추적
  const trophies = loadHunterTrophies();
  trophies[preyName] = (trophies[preyName]||0)+1;
  saveHunterTrophies(trophies);

  const log = loadHunterLog();
  log.count = (log.count||0)+1;
  log.lastSite = ground.id;
  saveHunterLog(log);

  const matNames = matIds.map(mid=>MATERIALS[mid]?.name||mid).join(', ');
  let msg = `${ground.icon} ${ground.name}에서 ${preyName}을(를) 사냥했다! 부산물: ${matNames||'없음'}`;

  if(injured){
    const dmg = 4+Math.floor(Math.random()*8)*ground.risk;
    S.stats.hp = Math.max(1, (S.stats.hp||100) - dmg);
    window.updateHeader && window.updateHeader();
    msg += ` — ⚠️ 사냥 중 부상을 입었다 (HP -${dmg})`;
  }
  toast(msg, 4500);

  S._pendingWorkshopHint = `${ground.name}으로 사냥을 나가 ${preyName}을(를) 잡았다.${injured?' 사냥 중 부상을 입기도 했다.':''} 얻은 부산물: ${matNames||'없음'}.`;
  renderHunterGroundsPanel();
}
window.huntAtGrounds = huntAtGrounds;

export function reprocessTrophy(preyName){
  const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
  if(jobId!=='hunter'){ toast('사냥꾼이어야 전리품을 재구성할 수 있습니다.'); return; }
  const trophies = loadHunterTrophies();
  if(!trophies[preyName] || trophies[preyName]<=0){ toast('보유한 전리품이 없습니다.'); return; }

  trophies[preyName] -= 1;
  saveHunterTrophies(trophies);

  const gold = 15 + Math.floor(Math.random()*30);
  S.gold += gold; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  toast(`🦴 ${preyName}의 전리품을 손질해 ${gold}G를 회수했다.`, 3500);
  renderHunterGroundsPanel();
}
window.reprocessTrophy = reprocessTrophy;

export function renderHunterGroundsPanel(){
  const body = document.getElementById('pb-hunter');
  const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
  const log = loadHunterLog();
  const trophies = loadHunterTrophies();

  let html = `<div style="padding:8px 12px;background:#0a0805;border-bottom:1px solid #2a2010;font-size:9px;color:#a08050;line-height:1.6">🏹 사냥터 — 야생과 문명의 경계에서 몬스터를 사냥하고 부산물을 손질한다.</div>`;

  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1505">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">🏹 사냥터 원정</div>
    <div style="font-size:8px;color:var(--dim);margin-bottom:8px">이미 그 지역에 알려진 몬스터를 우선 사냥합니다. 위험할수록 희귀한 부산물이 나옵니다. '조련'은 죽이지 않고 동료로 길들이는 시도입니다 — 지각·의지가 높을수록, 상대가 약할수록 성공률이 높습니다.</div>
    ${HUNTING_GROUNDS.map(g=>`
      <div style="display:flex;align-items:center;gap:7px;padding:7px 0;border-top:1px solid #100d05">
        <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(g,{size:16}):(g.icon)}</span>
        <div style="flex:1">
          <div style="font-size:9px;color:var(--text)">${esc(g.name)} <span style="color:#c0a030;font-size:8px">${'⚠️'.repeat(g.risk)}</span></div>
          <div style="font-size:7.5px;color:var(--dim)">${esc(g.desc)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <button onclick="huntAtGrounds('${g.id}')" style="padding:4px 8px;background:#0a0800;border:1px solid #3a2a10;color:#c0a030;font-size:7px;cursor:pointer;white-space:nowrap">사냥 ${g.cost>0?g.cost+'G':'무료'}</button>
          <button onclick="tameAtGrounds('${g.id}')" style="padding:4px 8px;background:#050a08;border:1px solid #1a3a2a;color:#40c090;font-size:7px;cursor:pointer;white-space:nowrap">🐾 조련 시도</button>
        </div>
      </div>`).join('')}
  </div>`;

  // 현재 파티에 있는 조련 동료 표시
  const party = (typeof loadParty==='function') ? loadParty() : [];
  const beasts = party.filter(p=>p.type==='beast');
  if(beasts.length){
    html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1505">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#40c090;margin-bottom:6px">🐾 함께하는 야수 (${beasts.length}/4)</div>
      ${beasts.map(b=>`<div style="padding:4px 0;font-size:8.5px;border-top:1px solid #100d05"><span style="color:var(--text)">${esc(b.name)}</span> <span style="color:var(--dim)">T${b.tamedTier||'?'} · 관계 ${b.relationship||50}</span></div>`).join('')}
    </div>`;
  }

  const trophyEntries = Object.entries(trophies).filter(([,n])=>n>0);
  html += `<div style="padding:10px 12px;border-bottom:1px solid #1a1505">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:6px">🦴 전리품 (사냥 ${log.count||0}회 누적)</div>
    ${trophyEntries.length ? trophyEntries.map(([name,n])=>`
      <div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:8.5px;border-top:1px solid #100d05">
        <span style="flex:1;color:var(--text)">${esc(name)} ×${n}</span>
        <button onclick="reprocessTrophy('${esc(name).replace(/'/g,"\\'")}')" style="padding:3px 7px;background:#0a0800;border:1px solid #3a2a10;color:#c0a030;font-size:7px;cursor:pointer">손질</button>
      </div>`).join('') : `<div style="font-size:8px;color:var(--dim)">아직 사냥한 전리품이 없습니다.</div>`}
  </div>`;

  // 야생을 닮아가는 것 히든 퀘스트 진행 상황
  const hqStored = (typeof loadHiddenQuests==='function') ? loadHiddenQuests() : {};
  const wildQuest = hqStored['hq_hunter_becoming_wild'];
  let wildHtml = '';
  if(wildQuest?.status === 'completed'){
    wildHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a1505;background:linear-gradient(135deg,#0a1505,#0a0800)">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#40a060;margin-bottom:4px">🐾 야생을 닮아가는 것 — 완료</div>
      <div style="font-size:8px;color:var(--dim)">경계에 선 삶을 받아들였다. 전설의 사냥터로 가는 길이 영원히 열렸다.</div>
    </div>`;
  } else if(wildQuest?.status === 'active'){
    wildHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a1505;background:#0a0800">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#40a060;margin-bottom:4px">🐾 야생을 닮아가는 것 — 진행 중</div>
      <div style="font-size:8px;color:var(--dim)">경계인 그리젤다가 그대에게 오랜 두려움을 드러내고 있다. 이야기를 계속 진행하라.</div>
    </div>`;
  } else if(jobId==='hunter' && (log.count||0)<10){
    wildHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a1505">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#4a6a4a;margin-bottom:4px">🐾 야생을 닮아가는 것 — 미발견</div>
      <div style="font-size:8px;color:var(--dim)">사냥 ${log.count||0}/10회 — 조건을 채우면 경계인 그리젤다가 그대에게 이야기를 들려줄 것이다.</div>
    </div>`;
  }

  // 야수의 왕 히든 퀘스트 진행 상황 — 전설급(T13) 조련 성공이 조건
  const tameLog = (typeof loadHunterTameLog==='function') ? loadHunterTameLog() : {legendaryTamed:false, highestTier:0};
  const beastQuest = hqStored['hq_hunter_king_of_beasts'];
  let beastHtml = '';
  if(beastQuest?.status === 'completed'){
    beastHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a1505;background:linear-gradient(135deg,#150a05,#0a0800)">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:4px">👑🐾 야수의 왕 — 완료</div>
      <div style="font-size:8px;color:var(--dim)">전설급 야수마저 길들인 자로 인정받았다.</div>
    </div>`;
  } else if(beastQuest?.status === 'active'){
    beastHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a1505;background:#0a0800">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#c0a030;margin-bottom:4px">👑🐾 야수의 왕 — 진행 중</div>
      <div style="font-size:8px;color:var(--dim)">경계인 그리젤다가 그대의 성취에 놀라고 있다. 이야기를 계속 진행하라.</div>
    </div>`;
  } else if(jobId==='hunter' && !tameLog.legendaryTamed){
    beastHtml = `<div style="padding:10px 12px;border-bottom:1px solid #1a1505">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#4a6a4a;margin-bottom:4px">👑🐾 야수의 왕 — 미발견</div>
      <div style="font-size:8px;color:var(--dim)">최고 조련 기록 T${tameLog.highestTier||0}/13 — 「전설의 사냥터」에서 전설급 야수 조련에 성공하면 조건이 채워진다.</div>
    </div>`;
  }
  html = wildHtml + beastHtml + html;

  if(body) body.innerHTML = html;
}
window.renderHunterGroundsPanel = renderHunterGroundsPanel;

window.huntAtGrounds = huntAtGrounds;

window.reprocessTrophy = reprocessTrophy;

window.renderHunterGroundsPanel = renderHunterGroundsPanel;

window.loadHunterLog = loadHunterLog;

window.loadHunterTrophies = loadHunterTrophies;

export function calcTameSuccessChance(preyName){
  try{
    const tier = (typeof getMonsterTierStats==='function') ? getMonsterTierStats(preyName).tier : 3;
    const threshold = 15 + tier*13;
    const hunterPower = ((S?.stats?.per||10) + (S?.stats?.wil||10)) / 2;
    const diff = hunterPower - threshold;
    // 시그모이드: diff=0 → 0.5, diff=+40 → 약 0.90, diff=-40 → 약 0.10
    const chance = 1 / (1 + Math.exp(-diff/17.5));
    return { chance: Math.max(0.02, Math.min(0.95, chance)), tier, threshold, hunterPower };
  }catch(e){ return { chance:0.05, tier:3, threshold:54, hunterPower:0 }; }
}
window.calcTameSuccessChance = calcTameSuccessChance;

window.calcTameSuccessChance = calcTameSuccessChance;

export function tameAtGrounds(groundId){
  const ground = HUNTING_GROUNDS.find(g=>g.id===groundId); if(!ground) return;
  const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
  if(jobId!=='hunter'){ toast('사냥꾼이어야 야수를 조련할 수 있습니다.'); return; }
  if((S.gold||0) < ground.cost){ toast(`원정 비용 부족 (${ground.cost}G 필요)`); return; }

  const party = (typeof loadParty==='function') ? loadParty() : [];
  if(party.length >= 8){ toast('파티가 가득 찼습니다 (최대 8인). 동료를 정리한 후 다시 시도하세요.', 3000); return; }

  S.gold -= ground.cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();

  const poolKey = '사냥터:' + ground.name;
  const pool = (typeof getLocationMonsterPool==='function') ? getLocationMonsterPool(poolKey) : [];
  const FALLBACK_PREY = { 1:['들토끼','멧닭','다람쥐 마물'], 2:['늑대','멧돼지','여우'], 3:['곰','트롤 새끼','오우거 새끼'], 4:['와이번','만티코어','키메라'] };
  let preyName;
  if(pool.length && Math.random() < 0.7){
    preyName = pool[Math.floor(Math.random()*pool.length)];
  } else {
    const fb = FALLBACK_PREY[ground.risk] || FALLBACK_PREY[1];
    preyName = fb[Math.floor(Math.random()*fb.length)];
    if(typeof registerLocationMonster==='function') registerLocationMonster(poolKey, preyName);
  }

  const tameInfo = calcTameSuccessChance(preyName);
  const success = Math.random() < tameInfo.chance;

  const log = loadHunterLog();
  log.count = (log.count||0)+1;
  log.lastSite = ground.id;
  saveHunterLog(log);

  if(success){
    // 조련 성공 — 몬스터 티어에 비례한 스탯 보너스를 계산해 동료로 합류시킨다.
    const tierScale = tameInfo.tier;
    const beastCompanion = {
      name: preyName, icon: '🐾', role: '조련된 야수',
      type: 'beast', typeLabel: '길들인 야수',
      relationship: 55,
      personality: '야생의 본능이 남아있지만 주인에게는 온순하다.',
      statBonus: {
        str: Math.round(4 + tierScale*2.2),
        agi: Math.round(4 + tierScale*1.8),
        end: Math.round(4 + tierScale*1.6),
      },
      battleRole: '전방 돌격·정찰',
      uniqueSkill: '야생의 감각 — 파티 전체 기습 당할 확률 감소',
      leaveCondition: '관계가 크게 악화되면 야생으로 돌아갈 수 있다',
      aiHint: `이 동료는 ${preyName}을(를) 길들인 것이다. 말을 하지 못하며 울음소리·몸짓·눈빛으로 의사를 표현한다. 티어가 높을수록(이번 개체는 T${tierScale}) 더 위압적이고 강한 존재감을 지닌다.`,
      tamedTier: tierScale,
      joinedAt: new Date().toISOString(),
      joinTurn: S.msgCount||0,
      alive: true, mood: 'neutral', trustLevel: 50,
    };
    party.push(beastCompanion);
    if(typeof saveParty==='function') saveParty(party);

    // 조련 기록 — 히든 퀘스트 「야수의 왕」 조건(전설급 조련 여부) 추적용
    const tameLog = loadHunterTameLog();
    tameLog.count = (tameLog.count||0)+1;
    tameLog.highestTier = Math.max(tameLog.highestTier||0, tierScale);
    if(tierScale>=13) tameLog.legendaryTamed = true;
    saveHunterTameLog(tameLog);

    toastHTML(`🐾 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(ground,{size:14}):(ground.icon)} ${esc(ground.name)}에서 ${esc(preyName)}을(를) 길들이는 데 성공했다! (T${esc(tierScale)}, 성공확률 ${esc(Math.round(tameInfo.chance*100))}%)`, 5000);
    S._pendingWorkshopHint = `${ground.name}에서 ${preyName}을(를) 제압하고 길들였다. 이제 동료로서 함께한다.`;
  } else {
    toast(`🐾 ${preyName}을(를) 길들이려 했으나 실패했다 — 놓쳐버렸다. (성공확률 ${Math.round(tameInfo.chance*100)}%)`, 4000);
    S._pendingWorkshopHint = `${ground.name}에서 ${preyName}을(를) 길들이려 했으나 실패해 놓쳐버렸다.`;
  }
  renderHunterGroundsPanel();
}
window.tameAtGrounds = tameAtGrounds;

window.tameAtGrounds = tameAtGrounds;

export const HUNTER_TAME_LOG_KEY = 'tf-hunter-tame-log';

export function loadHunterTameLog(){ try{ return JSON.parse(lsGet(HUNTER_TAME_LOG_KEY)||'{"count":0,"highestTier":0,"legendaryTamed":false}'); }catch(e){ return {count:0,highestTier:0,legendaryTamed:false}; } }
window.loadHunterTameLog = loadHunterTameLog;

export function saveHunterTameLog(d){ try{ lsSet(HUNTER_TAME_LOG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveHunterTameLog = saveHunterTameLog;

window.loadHunterTameLog = loadHunterTameLog;

window.saveHunterTameLog = saveHunterTameLog;

(function(){
  if(document.getElementById('p-hunter')) return;
  const div=document.createElement('div'); div.className='panel-ov'; div.id='p-hunter';
  div.innerHTML=`<div class="panel"><div class="p-hdr"><span class="p-title">🏹 사냥터</span><button class="p-close" onclick="closeP('hunter')">✕</button></div><div class="p-body scrollable" id="pb-hunter"></div></div>`;
  document.body.appendChild(div);
})();

export function ensureHunterButtonVisible(){
  try{
    const b=document.querySelector('.btm-bar'); if(!b) return;
    const jobId = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
    const show = jobId==='hunter' || jobId.includes('사냥꾼');
    if(show && !document.getElementById('btn-hunter')){
      const bn=document.createElement('button'); bn.id='btn-hunter'; bn.className='bb';
      bn.style.cssText='color:#c0a030;border-color:#3a2a10'; bn.textContent='🏹사냥터'; bn.title='사냥터 — 원정/전리품';
      bn.onclick=function(){ window.openP('hunter'); renderHunterGroundsPanel(); }; b.appendChild(bn);
    }
  }catch(e){}
}
window.ensureHunterButtonVisible = ensureHunterButtonVisible;

window.ensureHunterButtonVisible = ensureHunterButtonVisible;

setTimeout(ensureHunterButtonVisible, 6000);

export const FLEET_KEY = 'tf-fleet';

export const ACTIVE_SHIP_KEY = 'tf-active-ship-id';

export function loadFleet(){
  try{ const r = JSON.parse(lsGet(FLEET_KEY)||'[]'); return Array.isArray(r)?r:[]; }catch(e){ return []; }
}
window.loadFleet = loadFleet;

export function saveFleet(d){ try{ lsSet(FLEET_KEY, JSON.stringify(d)); }catch(e){} }
window.saveFleet = saveFleet;

export function getActiveShipId(){ try{ return lsGet(ACTIVE_SHIP_KEY)||null; }catch(e){ return null; } }
window.getActiveShipId = getActiveShipId;

export function setActiveShipId(id){ try{ lsSet(ACTIVE_SHIP_KEY, id||''); }catch(e){} }
window.setActiveShipId = setActiveShipId;

export function loadShip(){
  const fleet = loadFleet();
  if(!fleet.length) return null;
  const activeId = getActiveShipId();
  return fleet.find(s=>s.id===activeId) || fleet[0];
}
window.loadShip = loadShip;

export function saveShip(d){
  if(d===null){
    // 침몰 등으로 현재 탑승 배가 사라지는 경우 — 함대에서 제거
    const fleet = loadFleet();
    const activeId = getActiveShipId();
    const next = fleet.filter(s=>s.id!==activeId);
    saveFleet(next);
    setActiveShipId(next.length ? next[0].id : null);
    return;
  }
  const fleet = loadFleet();
  const idx = fleet.findIndex(s=>s.id===d.id);
  if(idx>=0){ fleet[idx] = d; }
  else { fleet.push(d); setActiveShipId(d.id); }
  saveFleet(fleet);
}
window.saveShip = saveShip;

export const SHIP_KEY = 'tf-ship';

export const MAX_FLEET_SIZE = 5;

export function getPortLocations(){
  try{
    const all = (typeof window.getAllLocations==='function') ? window.getAllLocations() : [];
    return all.filter(l=>l.coastal);
  }catch(e){ return []; }
}
window.getPortLocations = getPortLocations;

// 사용자 요청으로 세계지도 전체 규모를 키움(3000→8000) — 대륙 크기·간격
// 자체가 원래(장소 수 비례) 크기를 유지한 채로 훨씬 넓은 캔버스를 쓴다.
export const WORLD_MAP_SIZE = 8000;

export const WORLD_MAP_NON_PHYSICAL = new Set(['celestial','infernal']);

export const CONTINENT_COASTLINE = {
  central: `M 5021.3 3941.7 Q 5114.2 4013.6 5083.2 4095.0 Q 5052.3 4176.4 5052.8 4263.8 Q 5053.3 4351.3 5111.2 4481.7 Q 5169.1 4612.1 5124.8 4720.3 Q 5080.5 4828.5 4982.0 4905.8 Q 4883.4 4983.1 4708.0 4944.2 Q 4532.5 4905.4 4429.3 4942.1 Q 4326.1 4978.8 4207.7 4928.9 Q 4089.3 4879.0 4000.7 4798.6 Q 3912.1 4718.1 3862.8 4622.9 Q 3813.4 4527.6 3757.4 4509.8 Q 3701.4 4492.0 3643.5 4473.5 Q 3585.6 4454.9 3528.3 4429.1 Q 3470.9 4403.3 3367.5 4393.4 Q 3264.0 4383.4 3183.8 4339.7 Q 3103.5 4296.0 2883.3 4256.8 Q 2663.0 4217.5 2592.8 4115.5 Q 2522.7 4013.6 2543.5 3904.1 Q 2564.4 3794.6 2592.3 3686.0 Q 2620.2 3577.4 2672.1 3473.3 Q 2723.9 3369.2 2806.8 3279.1 Q 2889.7 3189.0 3065.9 3193.9 Q 3242.1 3198.8 3386.1 3225.8 Q 3530.2 3252.9 3648.7 3309.5 Q 3767.2 3366.1 3834.0 3287.5 Q 3900.8 3208.9 3987.9 3241.5 Q 4075.1 3274.2 4148.0 3312.9 Q 4221.0 3351.6 4308.9 3348.6 Q 4396.7 3345.7 4492.6 3355.2 Q 4588.6 3364.6 4680.5 3396.9 Q 4772.5 3429.2 4733.9 3542.5 Q 4695.4 3655.8 4761.9 3701.7 Q 4828.4 3747.5 4878.4 3808.7 Q 4928.4 3869.8 5021.3 3941.7 Z`,
  north: `M 6469.6 2007.5 Q 6445.4 2100.0 6474.7 2192.9 Q 6504.1 2285.8 6332.9 2359.2 Q 6161.8 2432.6 5878.5 2462.7 Q 5595.3 2492.8 5535.0 2563.8 Q 5474.7 2634.8 5323.8 2676.8 Q 5172.8 2718.7 4922.0 2679.3 Q 4671.2 2639.8 4521.5 2634.2 Q 4371.9 2628.6 4249.9 2655.2 Q 4127.9 2681.7 3982.1 2722.1 Q 3836.4 2762.6 3674.3 2764.5 Q 3512.2 2766.5 3433.7 2686.0 Q 3355.2 2605.6 3226.2 2587.0 Q 3097.1 2568.5 2861.0 2580.7 Q 2624.8 2592.8 2588.5 2522.7 Q 2552.1 2452.6 2578.1 2382.6 Q 2604.2 2312.6 2504.3 2265.0 Q 2404.4 2217.4 2262.1 2158.7 Q 2119.8 2100.0 1967.7 2019.6 Q 1815.6 1939.1 1883.2 1863.2 Q 1950.8 1787.3 2089.4 1727.7 Q 2228.1 1668.1 2198.9 1555.6 Q 2169.8 1443.0 2311.9 1368.8 Q 2454.0 1294.6 2761.0 1330.5 Q 3068.0 1366.3 3293.3 1404.3 Q 3518.5 1442.3 3685.6 1474.5 Q 3852.6 1506.7 3986.4 1529.0 Q 4120.1 1551.3 4224.3 1591.5 Q 4328.5 1631.7 4408.8 1668.3 Q 4489.0 1704.8 4576.6 1726.3 Q 4664.1 1747.7 4921.4 1709.8 Q 5178.7 1671.9 5347.3 1699.3 Q 5515.9 1726.7 5734.5 1763.0 Q 5953.1 1799.4 6223.4 1857.2 Q 6493.7 1915.0 6469.6 2007.5 Z`,
  south: `M 5418.0 5573.2 Q 5341.5 5650.0 5157.2 5707.5 Q 4972.9 5765.0 4858.8 5809.2 Q 4744.7 5853.4 4710.5 5905.8 Q 4676.2 5958.3 4569.4 5992.5 Q 4462.5 6026.8 4399.9 6079.2 Q 4337.2 6131.7 4189.0 6138.3 Q 4040.9 6144.9 3958.7 6216.2 Q 3876.6 6287.6 3733.3 6335.7 Q 3590.0 6383.8 3403.0 6448.9 Q 3215.9 6514.0 3013.6 6504.1 Q 2811.3 6494.2 2676.3 6420.6 Q 2541.3 6347.0 2458.7 6271.6 Q 2376.1 6196.2 2377.9 6110.4 Q 2379.7 6024.7 2214.0 6005.2 Q 2048.3 5985.7 1974.0 5934.3 Q 1899.7 5882.8 1794.1 5830.4 Q 1688.5 5778.0 1772.5 5714.0 Q 1856.4 5650.0 1873.5 5593.5 Q 1890.5 5537.0 1807.1 5463.6 Q 1723.6 5390.2 1695.4 5305.5 Q 1667.1 5220.9 1696.9 5130.3 Q 1726.7 5039.7 1963.0 5025.4 Q 2199.3 5011.1 2396.3 5002.8 Q 2593.3 4994.4 2806.1 5044.5 Q 3018.9 5094.5 3150.7 5082.4 Q 3282.5 5070.2 3416.4 5078.0 Q 3550.3 5085.8 3685.0 5088.7 Q 3819.6 5091.6 3948.7 5108.7 Q 4077.8 5125.7 4183.8 5159.5 Q 4289.7 5193.3 4506.2 5186.3 Q 4722.7 5179.3 4894.7 5212.7 Q 5066.7 5246.0 5306.4 5284.9 Q 5546.1 5323.7 5520.3 5410.1 Q 5494.6 5496.4 5418.0 5573.2 Z`,
  east: `M 6379.0 4183.3 Q 6317.9 4350.9 6217.8 4456.9 Q 6117.8 4562.9 6110.0 4670.4 Q 6102.3 4778.0 6044.2 4832.2 Q 5986.1 4886.4 5928.6 4905.6 Q 5871.0 4924.8 5856.5 5015.3 Q 5841.9 5105.8 5836.1 5276.7 Q 5830.2 5447.7 5814.5 5746.1 Q 5798.8 6044.5 5723.0 6124.9 Q 5647.1 6205.2 5561.7 6235.8 Q 5476.3 6266.4 5389.1 6246.9 Q 5302.0 6227.5 5234.3 6103.2 Q 5166.6 5978.8 5143.0 5765.6 Q 5119.3 5552.5 5165.6 5279.0 Q 5211.9 5005.5 5199.2 4916.6 Q 5186.6 4827.6 5145.2 4771.2 Q 5103.8 4714.7 5091.6 4625.3 Q 5079.4 4535.8 5044.1 4443.3 Q 5008.9 4350.9 4979.6 4233.8 Q 4950.3 4116.7 4846.7 3909.0 Q 4743.1 3701.4 4749.1 3514.6 Q 4755.0 3327.9 4838.4 3241.6 Q 4921.7 3155.4 4999.2 3094.6 Q 5076.6 3033.7 5160.2 3036.9 Q 5243.9 3040.0 5309.1 3017.1 Q 5374.3 2994.2 5447.0 3193.1 Q 5519.6 3392.0 5560.6 3447.3 Q 5601.5 3502.7 5645.2 3475.3 Q 5688.8 3447.8 5752.9 3378.0 Q 5817.0 3308.2 5903.1 3252.8 Q 5989.2 3197.3 6035.7 3290.2 Q 6082.3 3383.2 6187.8 3404.8 Q 6293.3 3426.5 6373.1 3536.3 Q 6452.9 3646.1 6446.5 3830.9 Q 6440.2 4015.7 6379.0 4183.3 Z`,
  west: `M 2304.0 3201.8 Q 2315.8 3314.2 2320.5 3432.9 Q 2325.2 3551.7 2388.9 3729.5 Q 2452.6 3907.3 2430.9 4057.3 Q 2409.2 4207.2 2368.7 4342.5 Q 2328.1 4477.8 2229.9 4475.1 Q 2131.7 4472.4 2041.1 4399.1 Q 1950.5 4325.9 1901.8 4355.6 Q 1853.2 4385.3 1802.3 4371.9 Q 1751.5 4358.5 1699.6 4459.1 Q 1647.8 4559.7 1595.1 4518.5 Q 1542.4 4477.3 1493.3 4429.9 Q 1444.2 4382.4 1377.4 4381.5 Q 1310.5 4380.6 1248.1 4330.9 Q 1185.7 4281.2 1077.0 4263.7 Q 968.4 4246.2 947.2 4088.6 Q 926.0 3931.0 943.3 3764.8 Q 960.5 3598.6 1019.8 3456.4 Q 1079.1 3314.2 1147.7 3220.9 Q 1216.3 3127.6 1199.7 3014.4 Q 1183.1 2901.3 1209.8 2811.5 Q 1236.5 2721.8 1243.7 2595.3 Q 1250.9 2468.8 1297.9 2405.0 Q 1345.0 2341.2 1393.0 2287.0 Q 1441.0 2232.9 1468.0 2021.6 Q 1495.0 1810.2 1559.2 1670.7 Q 1623.4 1531.2 1706.8 1474.0 Q 1790.1 1416.7 1873.4 1458.1 Q 1956.6 1499.4 1998.0 1718.2 Q 2039.4 1937.0 2057.4 2123.0 Q 2075.3 2308.9 2069.7 2475.9 Q 2064.2 2642.9 2134.5 2661.5 Q 2204.8 2680.1 2224.3 2783.3 Q 2243.8 2886.5 2268.0 2987.9 Q 2292.2 3089.4 2304.0 3201.8 Z`,
  northeast: `M 6744.3 2028.4 Q 6775.8 2061.9 6764.0 2099.7 Q 6752.2 2137.5 6753.8 2178.7 Q 6755.3 2219.9 6788.7 2291.4 Q 6822.1 2362.9 6801.9 2412.5 Q 6781.8 2462.0 6728.5 2469.8 Q 6675.3 2477.7 6631.1 2480.9 Q 6586.8 2484.1 6547.8 2481.6 Q 6508.8 2479.2 6475.1 2484.9 Q 6441.5 2490.5 6409.8 2463.1 Q 6378.1 2435.7 6359.7 2385.6 Q 6341.2 2335.5 6306.9 2357.7 Q 6272.6 2379.9 6219.0 2409.0 Q 6165.4 2438.1 6135.2 2411.7 Q 6105.1 2385.4 6076.8 2354.0 Q 6048.6 2322.6 6017.5 2288.0 Q 5986.3 2253.3 5960.5 2209.5 Q 5934.7 2165.6 5930.1 2113.7 Q 5925.5 2061.9 5982.8 2021.6 Q 6040.1 1981.3 6084.7 1958.4 Q 6129.3 1935.4 6124.9 1894.4 Q 6120.5 1853.4 6143.6 1828.8 Q 6166.7 1804.3 6200.6 1798.6 Q 6234.4 1792.9 6250.6 1761.6 Q 6266.9 1730.4 6285.2 1681.8 Q 6303.6 1633.3 6332.8 1558.4 Q 6361.9 1483.6 6409.8 1455.1 Q 6457.8 1426.6 6500.1 1466.3 Q 6542.5 1506.0 6584.5 1526.1 Q 6626.5 1546.3 6657.1 1586.6 Q 6687.7 1626.9 6683.0 1699.6 Q 6678.4 1772.4 6667.7 1826.5 Q 6657.1 1880.7 6660.9 1912.9 Q 6664.7 1945.1 6688.8 1970.0 Q 6712.9 1995.0 6744.3 2028.4 Z`,
  northwest: `M 1424.3 621.6 Q 1446.5 663.5 1472.3 716.0 Q 1498.2 768.4 1487.4 819.8 Q 1476.6 871.1 1439.8 906.5 Q 1403.0 941.8 1385.0 988.4 Q 1367.1 1035.0 1310.2 1030.6 Q 1253.2 1026.2 1207.1 1011.3 Q 1161.0 996.3 1130.5 995.5 Q 1100.0 994.6 1074.7 1017.0 Q 1049.4 1039.3 1016.6 1078.7 Q 983.8 1118.2 954.3 1086.2 Q 924.9 1054.3 892.3 1047.3 Q 859.7 1040.4 822.6 1033.8 Q 785.5 1027.3 748.3 1010.3 Q 711.2 993.4 682.5 961.3 Q 653.9 929.2 656.5 878.3 Q 659.1 827.4 619.1 793.7 Q 579.0 760.1 567.9 711.8 Q 556.8 663.5 580.5 617.9 Q 604.2 572.4 651.2 544.9 Q 698.1 517.4 745.0 507.7 Q 791.8 498.0 793.3 460.4 Q 794.7 422.9 820.2 408.1 Q 845.7 393.3 862.6 363.3 Q 879.5 333.3 896.5 279.4 Q 913.5 225.6 944.2 161.2 Q 974.9 96.8 1022.4 62.5 Q 1069.9 28.2 1112.5 66.9 Q 1155.0 105.6 1182.7 160.1 Q 1210.3 214.5 1222.7 271.8 Q 1235.0 329.1 1236.5 379.5 Q 1238.1 430.0 1236.9 468.3 Q 1235.8 506.6 1241.1 533.5 Q 1246.5 560.4 1324.3 570.1 Q 1402.0 579.7 1424.3 621.6 Z`,
  southeast: `M 5973.2 7281.6 Q 5954.8 7336.5 5939.2 7383.9 Q 5923.5 7431.4 5860.6 7453.6 Q 5797.6 7475.9 5746.6 7480.5 Q 5695.6 7485.2 5681.0 7504.7 Q 5666.4 7524.2 5650.2 7541.5 Q 5634.0 7558.8 5633.4 7614.7 Q 5632.7 7670.6 5617.8 7734.4 Q 5602.9 7798.1 5566.4 7814.2 Q 5529.9 7830.2 5490.4 7836.8 Q 5450.9 7843.4 5408.9 7845.4 Q 5367.0 7847.4 5330.0 7824.9 Q 5293.1 7802.4 5256.6 7779.7 Q 5220.1 7757.1 5190.1 7723.6 Q 5160.2 7690.1 5154.6 7637.5 Q 5149.0 7584.8 5133.7 7545.3 Q 5118.4 7505.7 5084.2 7469.5 Q 5050.0 7433.2 5042.7 7384.8 Q 5035.3 7336.5 5055.7 7291.0 Q 5076.1 7245.5 5118.7 7216.2 Q 5161.4 7186.8 5225.2 7188.3 Q 5289.0 7189.9 5302.2 7169.4 Q 5315.4 7148.8 5330.4 7129.6 Q 5345.4 7110.4 5347.0 7055.9 Q 5348.6 7001.3 5367.0 6951.4 Q 5385.4 6901.4 5417.7 6860.5 Q 5450.1 6819.5 5490.8 6821.2 Q 5531.5 6822.9 5569.7 6838.3 Q 5608.0 6853.8 5652.0 6853.5 Q 5696.1 6853.2 5732.0 6879.8 Q 5767.9 6906.3 5785.2 6954.7 Q 5802.6 7003.2 5823.1 7041.8 Q 5843.5 7080.4 5877.3 7113.0 Q 5911.0 7145.6 5951.3 7186.2 Q 5991.6 7226.7 5973.2 7281.6 Z`,
  northeast2: `M 7387.8 2033.4 Q 7424.0 2061.9 7458.4 2105.9 Q 7492.9 2149.9 7484.5 2193.2 Q 7476.0 2236.6 7472.7 2286.4 Q 7469.4 2336.3 7453.9 2384.4 Q 7438.3 2432.6 7415.0 2480.3 Q 7391.7 2528.1 7358.7 2570.6 Q 7325.6 2613.2 7269.6 2588.8 Q 7213.5 2564.5 7168.1 2509.8 Q 7122.7 2455.2 7092.8 2440.1 Q 7062.9 2425.0 7038.3 2404.3 Q 7013.6 2383.5 6990.0 2370.2 Q 6966.3 2357.0 6936.6 2353.0 Q 6906.8 2349.0 6884.3 2328.3 Q 6861.8 2307.6 6809.3 2306.3 Q 6756.8 2305.1 6689.5 2290.1 Q 6622.3 2275.1 6605.9 2223.6 Q 6589.5 2172.0 6595.5 2116.9 Q 6601.5 2061.9 6629.0 2014.2 Q 6656.6 1966.5 6699.8 1935.0 Q 6743.1 1903.5 6763.3 1870.9 Q 6783.5 1838.2 6822.2 1826.7 Q 6860.8 1815.1 6904.6 1827.4 Q 6948.5 1839.6 6961.3 1812.5 Q 6974.2 1785.3 6988.4 1740.4 Q 7002.7 1695.4 7028.6 1644.0 Q 7054.5 1592.6 7095.4 1544.6 Q 7136.3 1496.6 7178.8 1512.0 Q 7221.3 1527.4 7260.0 1550.6 Q 7298.8 1573.7 7343.1 1588.1 Q 7387.4 1602.4 7401.1 1659.4 Q 7414.7 1716.4 7407.2 1777.3 Q 7399.6 1838.2 7385.2 1886.6 Q 7370.8 1935.0 7361.2 1970.0 Q 7351.6 2004.9 7387.8 2033.4 Z`,
  northwest2: `M 2012.5 626.5 Q 1984.1 663.5 1965.8 690.2 Q 1947.5 717.0 1979.2 760.0 Q 2011.0 803.1 2037.1 863.9 Q 2063.3 924.7 2045.1 966.9 Q 2026.9 1009.1 2002.1 1048.8 Q 1977.3 1088.4 1930.9 1088.9 Q 1884.5 1089.3 1850.9 1110.7 Q 1817.4 1132.1 1781.1 1157.9 Q 1744.8 1183.6 1704.0 1180.0 Q 1663.2 1176.3 1623.2 1168.4 Q 1583.1 1160.6 1559.3 1110.2 Q 1535.5 1059.7 1506.4 1037.4 Q 1477.4 1015.1 1459.0 979.9 Q 1440.7 944.7 1430.8 906.8 Q 1420.9 868.9 1414.9 833.2 Q 1408.8 797.5 1427.3 758.8 Q 1445.8 720.0 1418.6 691.8 Q 1391.4 663.5 1359.3 622.2 Q 1327.3 581.0 1282.3 516.3 Q 1237.2 451.5 1239.2 389.6 Q 1241.3 327.6 1278.2 287.8 Q 1315.1 247.9 1373.4 244.6 Q 1431.8 241.2 1498.3 288.7 Q 1564.7 336.2 1599.5 356.6 Q 1634.2 377.1 1657.9 380.3 Q 1681.6 383.5 1704.2 377.0 Q 1726.8 370.5 1759.9 332.9 Q 1793.0 295.3 1831.1 284.6 Q 1869.1 273.8 1930.8 244.3 Q 1992.5 214.9 2047.1 226.4 Q 2101.6 238.0 2131.9 284.2 Q 2162.3 330.5 2159.2 394.2 Q 2156.2 457.9 2098.5 523.7 Q 2040.8 589.6 2012.5 626.5 Z`,
  southeast2: `M 6467.2 7306.2 Q 6483.6 7336.5 6489.2 7371.6 Q 6494.8 7406.6 6502.7 7447.8 Q 6510.7 7489.1 6545.2 7559.8 Q 6579.7 7630.5 6578.1 7698.2 Q 6576.5 7765.9 6523.5 7780.8 Q 6470.6 7795.8 6419.8 7794.8 Q 6369.0 7793.8 6326.2 7788.6 Q 6283.3 7783.3 6244.9 7759.8 Q 6206.5 7736.3 6176.0 7722.5 Q 6145.5 7708.7 6121.5 7682.3 Q 6097.4 7655.9 6083.2 7620.9 Q 6069.0 7585.9 6033.1 7599.2 Q 5997.1 7612.6 5930.9 7640.4 Q 5864.8 7668.1 5821.5 7646.3 Q 5778.3 7624.6 5754.1 7581.6 Q 5730.0 7538.7 5713.9 7489.9 Q 5697.8 7441.1 5707.7 7388.8 Q 5717.6 7336.5 5729.6 7289.0 Q 5741.7 7241.5 5769.0 7203.0 Q 5796.3 7164.5 5862.3 7161.0 Q 5928.3 7157.4 5963.9 7153.1 Q 5999.4 7148.8 6004.2 7113.8 Q 6008.9 7078.7 6018.2 7034.1 Q 6027.6 6989.4 6043.3 6924.3 Q 6059.1 6859.2 6093.5 6800.3 Q 6127.9 6741.4 6175.1 6738.5 Q 6222.4 6735.6 6265.8 6759.0 Q 6309.3 6782.4 6360.8 6779.8 Q 6412.3 6777.2 6435.6 6836.4 Q 6458.8 6895.6 6444.8 6979.2 Q 6430.9 7062.8 6430.3 7107.1 Q 6429.6 7151.5 6437.0 7182.8 Q 6444.3 7214.1 6447.6 7245.0 Q 6450.8 7276.0 6467.2 7306.2 Z`,
};

export const MAP_MARKER_SHAPES = {
  capital:  `<path d="M4 21 L4 9 L6 9 L6 7 L8 7 L8 9 L10.5 9 L10.5 6 L13.5 6 L13.5 9 L16 9 L16 7 L18 7 L18 9 L20 9 L20 21 Z" stroke-linejoin="round"/>`,
  city:     `<path d="M3 8 L12 3 L21 8" stroke-linejoin="round"/><path d="M4 8 L4 20 M8 8 L8 20 M12 8 L12 20 M16 8 L16 20 M20 8 L20 20"/><path d="M3 20 L21 20"/>`,
  town:     `<path d="M4 20 L4 11 L9 7 L14 11 L14 20 Z" stroke-linejoin="round"/><path d="M14 20 L14 14 L19 11 L19 20 Z" stroke-linejoin="round"/>`,
  village:  `<path d="M4 20 L4 12 L10 7 L16 12 L16 20 Z" stroke-linejoin="round"/>`,
  hamlet:   `<path d="M6 20 L6 14 L11 10 L16 14 L16 20 Z" stroke-linejoin="round"/>`,
  dungeon:  `<path d="M4 20 L4 12 C4 7 7.5 3 12 3 C16.5 3 20 7 20 12 L20 20 Z" stroke-linejoin="round"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>`,
  // ── 던전 등급별 변형 (1=초급 동굴 입구 / 2=중급 균열 / 3=고급 해골 표식 / 4=전설급 뿔+광휘) ──
  dungeon1: `<path d="M4 20 L4 12 C4 7 7.5 3 12 3 C16.5 3 20 7 20 12 L20 20 Z" stroke-linejoin="round"/><circle cx="12" cy="13" r="1.6" fill="currentColor" stroke="none"/>`,
  dungeon2: `<path d="M4 20 L4 12 C4 7 7.5 3 12 3 C16.5 3 20 7 20 12 L20 20 Z" stroke-linejoin="round"/><path d="M12 6 L10 13 L13 13 L11 19" stroke-width="1.3"/>`,
  dungeon3: `<path d="M4 20 L4 12 C4 7 7.5 3 12 3 C16.5 3 20 7 20 12 L20 20 Z" stroke-linejoin="round"/><path d="M9 12 C9 10.5 10.3 9.5 12 9.5 C13.7 9.5 15 10.5 15 12 C15 13 14.3 13.3 14.3 14.3 L9.7 14.3 C9.7 13.3 9 13 9 12 Z" stroke-width="1.1"/><circle cx="10.6" cy="12" r="0.7" fill="currentColor" stroke="none"/><circle cx="13.4" cy="12" r="0.7" fill="currentColor" stroke="none"/>`,
  dungeon4: `<path d="M4 20 L4 12 C4 7 7.5 3 12 3 C16.5 3 20 7 20 12 L20 20 Z" stroke-linejoin="round"/><path d="M8 6 L6 2 M16 6 L18 2" stroke-width="1.3"/><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-width="0.8" opacity="0.55"/>`,
  shrine:   `<path d="M2 8 L22 8 M3 5 L21 5"/><path d="M6 8 L6 21 M18 8 L18 21"/>`,
  special:  `<path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/>`,
  event:    `<path d="M12 3 L22 20 L2 20 Z" stroke-linejoin="round"/><path d="M12 9 L12 14 M12 16.5 L12 17" stroke-width="1.6"/>`,
};

window.MAP_MARKER_SHAPES = MAP_MARKER_SHAPES;

window.DUNGEON_TIER_COLORS = DUNGEON_TIER_COLORS;

export function hashStr(s){ let h=0; for(let i=0;i<s.length;i++){ h=((h<<5)-h+s.charCodeAt(i))|0; } return Math.abs(h); }
window.hashStr = hashStr;

// 대륙 하나 안의 장소들을 한꺼번에 배치한다 — 예전 방식(이름 해시로
// 각도/반지름만 계산)은 장소끼리 겹치거나 뭉치는 걸 막는 로직이
// 전혀 없어서 지도가 뒤죽박죽으로 보이는 원인이었다. 이제는 허브
// (수도)를 중심에 고정한 뒤, 나머지 장소들을 이름 해시로 정해지는
// 초기 각도/반지름에서 시작해서 이미 배치된 장소와 너무 가까우면
// 각도를 조금씩 돌리고 반지름을 조금씩 늘려가며 최소 간격을 확보할
// 때까지 밀어낸다(나선형 재시도) — 여전히 이름만 보고 항상 같은
// 결과가 나오는 결정론적 배치이지만, 겹침은 방지된다.
const MAP_MIN_LOC_DIST = 95; // 장소 사이 최소 화면 거리(px, 지도 좌표계 기준)
const MAP_GOLDEN_ANGLE = 2.399963229728653; // 황금각(라디안) — 해바라기씨처럼 후보 지점이 전체 면적에 고르게 퍼지게 함
const MAP_PLACE_CANDIDATES = 200;
const _continentLayoutCache = new Map(); // continentKey -> { sig, layout: Map(name->{x,y}) }

// [버그 수정] 장소 하나의 자리를 "이름 해시로 정한 각도에서 출발해
// 반지름 0부터 점점 넓혀가며 처음으로 빈 자리가 나오는 곳"으로
// 고르던 예전 방식은, 대륙 하나에 장소가 수십 개뿐이면 거의 항상
// 반지름이 작은(대륙 중심 근처) 후보에서 빈 자리가 바로 나와버려서
// — 지도를 화면에 맞춰 축소해서 볼 땐 안 보였지만, 실제 크기로
// 드래그해서 보니 도시들이 죄다 대륙 한가운데에만 몰려 있고 해안선
// 근처 넓은 면적이 텅 비어 보이는 문제로 드러났다(사용자 피드백).
// 이제 "이 장소가 전체 중 몇 번째로 배치되는가"를 기준으로 목표
// 반지름을 해바라기씨 배열 공식(r = sqrt((순번+0.5)/전체개수))으로
// 미리 정해서, 장소 수가 많든 적든 항상 중심부부터 해안선 근처까지
// 면적 전체에 걸쳐 고르게 퍼지게 한다. 최소 간격 확인은 그 목표
// 지점 주변에서 살짝만 흔들어보는 용도로만 남겨둔다(심하게 겹칠
// 때만 미세 조정, 전체 분포 자체를 흔들지 않음).
function pickMapSpot(name, index, total, zone, placed, minDist){
  const h = hashStr(name||'');
  const targetR = Math.sqrt((index+0.5)/Math.max(total,1)) * 0.94;
  const targetAngle = index*MAP_GOLDEN_ANGLE + (h%1000)/1000*0.3; // 약간의 지터로 완전한 격자처럼 안 보이게
  let best = null, bestMinD = -1;
  for(let attempt=0; attempt<MAP_PLACE_CANDIDATES; attempt++){
    const step = Math.ceil(attempt/2) * 0.006;
    const rWiggle = attempt===0 ? 0 : (attempt%2 ? step : -step);
    const aWiggle = attempt===0 ? 0 : (attempt%2 ? step*3 : -step*3);
    const r = Math.max(0, Math.min(0.97, targetR + rWiggle));
    const angle = targetAngle + aWiggle;
    const x = zone.cx + Math.cos(angle)*zone.rx*r;
    const y = zone.cy + Math.sin(angle)*zone.ry*r;
    if(placed.length===0) return { x: Math.round(x), y: Math.round(y) };
    let minD = Infinity;
    for(const p of placed){ const d = Math.hypot(p.x-x,p.y-y); if(d<minD) minD=d; }
    if(minD >= minDist) return { x: Math.round(x), y: Math.round(y) };
    if(minD > bestMinD){ bestMinD = minD; best = { x, y }; }
  }
  return { x: Math.round(best.x), y: Math.round(best.y) };
}

function computeContinentLayout(continentKey){
  const zone = WORLD_MAP_ZONES[continentKey] || WORLD_MAP_ZONES.central;
  const locsInContinent = getAllLandLocations().filter(l=>l.continent===continentKey);
  // 장소 구성이 바뀌면(새 AI 장소 추가 등) 자동으로 다시 배치되도록,
  // 이름 목록 자체를 캐시 키로 쓴다 — 매번 전체 재계산하는 비용을 피하되
  // 새 장소가 생기면 그 즉시 다시 계산된다.
  const sig = locsInContinent.map(l=>l.name).sort().join('|');
  const cached = _continentLayoutCache.get(continentKey);
  if(cached && cached.sig===sig) return cached.layout;

  const hubName = CONTINENT_HUB_NAMES[continentKey];
  const placed = []; // {x,y}
  const layout = new Map();
  if(hubName && locsInContinent.some(l=>l.name===hubName)){
    layout.set(hubName, { x: zone.cx, y: zone.cy });
    placed.push({ x: zone.cx, y: zone.cy });
  }
  // [8-21] "던전이 도시 바로 옆에 있으면 그 동네에 누가 사냐" — 예전엔
  // 정착지(도시·마을·항구 등)와 던전·황무지·사건 현장을 순전히 이름
  // 해시 순서로만 섞어서 배치해서, 해바라기씨 공식상 몇 번째로 놓이든
  // (반지름이 사실상 무작위) 위험 지역이 수도 바로 옆에 나오는 경우가
  // 흔했다. 정착지 유형(수도·도시·마을·촌·항구·특수·사당)을 먼저
  // 배치해 왕국 중심부에 더 가깝게(해바라기씨 반지름 공식이 인덱스가
  // 작을수록 중심에 가깝게 배정함) 두고, 위험 지역(던전·황무지·사건)
  // 은 나중에 배치해 해안선 쪽 바깥 테두리로 밀려나게 했다 — 완전한
  // 두 겹 동심원은 아니고(각도는 여전히 해시로 자연스럽게 흩어짐)
  // "문명은 안쪽, 위험은 바깥쪽"이라는 자연스러운 경향만 만든다.
  const WILD_TYPES = new Set(['dungeon','wilderness','event']);
  const others = locsInContinent
    .filter(l=>l.name!==hubName)
    .sort((a,b)=>{
      const wa = WILD_TYPES.has(a.type) ? 1 : 0, wb = WILD_TYPES.has(b.type) ? 1 : 0;
      if(wa!==wb) return wa-wb;
      return hashStr(a.name) - hashStr(b.name); // 같은 그룹 안에서는 항상 같은 순서(결정론적)
    });
  others.forEach((loc,i)=>{
    const p = pickMapSpot(loc.name||loc.id, i, others.length, zone, placed, MAP_MIN_LOC_DIST);
    layout.set(loc.name, p);
    placed.push(p);
  });

  _continentLayoutCache.set(continentKey, { sig, layout });
  return layout;
}

export function getLocationCoord(loc){
  if(!loc || !loc.continent || WORLD_MAP_NON_PHYSICAL.has(loc.continent)) return null;
  const layout = computeContinentLayout(loc.continent);
  return layout.get(loc.name) || null;
}
window.getLocationCoord = getLocationCoord;

window.getLocationCoord = getLocationCoord;

window.WORLD_MAP_SIZE = WORLD_MAP_SIZE;

window.WORLD_MAP_ZONES = WORLD_MAP_ZONES;

window.CONTINENT_HUB_NAMES = CONTINENT_HUB_NAMES;

export const LAND_TRAVEL_DAY_SCALE = 33.5;

export function getLocationDistanceDays(locA, locB){
  const ca = getLocationCoord(locA), cb = getLocationCoord(locB);
  if(!ca || !cb) return null;
  const dist = Math.hypot(ca.x-cb.x, ca.y-cb.y);
  return Math.max(1, Math.round(dist/LAND_TRAVEL_DAY_SCALE));
}
window.getLocationDistanceDays = getLocationDistanceDays;

window.getLocationDistanceDays = getLocationDistanceDays;

window.LAND_TRAVEL_DAY_SCALE = LAND_TRAVEL_DAY_SCALE;

export function getPortCoord(port){ return getLocationCoord(port) || { x:WORLD_MAP_SIZE/2, y:WORLD_MAP_SIZE/2 }; }
window.getPortCoord = getPortCoord;

export function getNearbyIsland(x, y, radius){
  return ISLAND_DEFS.find(isl=>Math.hypot(isl.x-x, isl.y-y) <= radius) || null;
}
window.getNearbyIsland = getNearbyIsland;

window.getNearbyIsland = getNearbyIsland;

export function exploreIsland(islandId){
  const ship = loadShip(); if(!ship) return;
  const isl = ISLAND_DEFS.find(i=>i.id===islandId); if(!isl) return;
  const loot = ISLAND_LOOT[isl.danger];
  ship.visitedIslands = ship.visitedIslands||[];
  if(!ship.visitedIslands.includes(islandId)) ship.visitedIslands.push(islandId);

  const dangerRoll = Math.random() < loot.dangerChance;
  if(dangerRoll){
    const dmg = 10+Math.floor(Math.random()*30);
    ship.durability = Math.max(0, ship.durability-dmg);
    toast(`⚠️ ${isl.name} 탐험 중 위험에 처했습니다! 선체 손상 -${dmg}`, 4000);
    S._pendingVoyageHint = `${isl.name}을(를) 탐험하던 중 예상치 못한 위험에 휘말렸다.`;
  } else {
    const gold = loot.gold[0]+Math.floor(Math.random()*(loot.gold[1]-loot.gold[0]+1));
    S.gold += gold; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
    let msg = `🏝️ ${isl.name} 탐험 완료! +${gold}G`;
    if(Math.random() < loot.relicChance){
      const g = loadGraveyard ? loadGraveyard() : null;
      if(g){
        g.relicInventory = g.relicInventory||[];
        const tierPool = TOMB_RELIC_DEFS[Math.min(5, Math.ceil(Object.keys(ISLAND_LOOT).indexOf(isl.danger)+2))] || TOMB_RELIC_DEFS[2];
        const relic = tierPool[Math.floor(Math.random()*tierPool.length)];
        g.relicInventory.push({ ...relic, id:'relic_'+Date.now(), fromTier:'island', foundAt:S.msgCount||0 });
        saveGraveyard(g);
        msg += ` 「${relic.icon}${relic.name}」도 발견했습니다!`;
      }
    }
    toast(msg, 4000);
    S._pendingVoyageHint = `${isl.name}을(를) 탐험해 전리품을 찾아냈다.`;
    if(typeof window.updateStats==='function') window.updateStats('islands_explored', 1);
  }
  ship.activeIslandEvent = null;
  saveShip(ship);
  S._mapPopup = null;
  renderVoyagePanel();
}
window.exploreIsland = exploreIsland;

window.exploreIsland = exploreIsland;

export function ignoreIsland(){
  const ship = loadShip(); if(!ship) return;
  ship.activeIslandEvent = null;
  saveShip(ship);
  S._mapPopup = null;
  renderVoyagePanel();
}
window.ignoreIsland = ignoreIsland;

window.ignoreIsland = ignoreIsland;

export const MAP_NEAR_RADIUS = 340;

export function getMapViewBox(ship){
  const mode = S._mapViewMode || 'near';
  if(mode==='world'){
    return { x:0, y:0, w:WORLD_MAP_SIZE, h:WORLD_MAP_SIZE, scale: WORLD_MAP_SIZE/380 };
  }
  // near: 배의 현재 좌표(정박 중이면 그 항구, 항해 중이면 curX/curY) 중심
  let cx = WORLD_MAP_SIZE/2, cy = WORLD_MAP_SIZE/2;
  if(ship){
    if(ship.atSea && ship.curX!==undefined){ cx = ship.curX; cy = ship.curY; }
    else if(ship.currentPort){
      const ports = getPortLocations();
      const cur = ports.find(p=>p.name===ship.currentPort);
      if(cur){ const c = getLocationCoord(cur); if(c){ cx=c.x; cy=c.y; } }
    }
  }
  const half = MAP_NEAR_RADIUS;
  let x = cx-half, y = cy-half;
  x = Math.max(0, Math.min(WORLD_MAP_SIZE-half*2, x));
  y = Math.max(0, Math.min(WORLD_MAP_SIZE-half*2, y));
  return { x, y, w:half*2, h:half*2, scale: (half*2)/380 };
}
window.getMapViewBox = getMapViewBox;

export function toggleMapViewMode(){
  S._mapViewMode = (S._mapViewMode==='world') ? 'near' : 'world';
  renderVoyagePanel();
}
window.toggleMapViewMode = toggleMapViewMode;

window.toggleMapViewMode = toggleMapViewMode;

export function getAllLandLocations(){
  try{
    const fixed = (typeof window.getAllLocations==='function') ? window.getAllLocations() : [];
    const ai = (typeof loadAILocations==='function') ? loadAILocations() : [];
    const curLoc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    const fallbackContinent = (curLoc && curLoc.continent && !WORLD_MAP_NON_PHYSICAL.has(curLoc.continent)) ? curLoc.continent : 'central';
    return [...fixed, ...ai]
      .filter(l=>!l.coastal && !WORLD_MAP_NON_PHYSICAL.has(l.continent))
      .map(l=>{
        // 던전형 등 continent가 비어있는 장소는 현재 위치한 대륙 영역에
        // 임시 배치한다 — 좌표가 없어 지도에서 사라지는 것을 방지.
        if(!l.continent) return { ...l, continent: fallbackContinent };
        return l;
      });
  }catch(e){ return []; }
}
window.getAllLandLocations = getAllLandLocations;

window.getAllLandLocations = getAllLandLocations;

export const TRAVEL_KEY = 'tf-travel-state';

export function loadTravelState(){ try{ return JSON.parse(lsGet(TRAVEL_KEY)||'null'); }catch(e){ return null; } }
window.loadTravelState = loadTravelState;

export function saveTravelState(d){ try{ lsSet(TRAVEL_KEY, JSON.stringify(d)); }catch(e){} }
window.saveTravelState = saveTravelState;

export const ROAD_SPEED_BONUS = 1.6;

export const OFFROAD_PENALTY  = 0.8;

export function buildRoadGraph(){
  const graph = {};
  ROAD_EDGES.forEach(([a,b])=>{
    if(!graph[a]) graph[a]=[];
    if(!graph[b]) graph[b]=[];
    graph[a].push(b); graph[b].push(a);
  });
  return graph;
}
window.buildRoadGraph = buildRoadGraph;

export const ROAD_GRAPH = buildRoadGraph();

window.ROAD_EDGES = ROAD_EDGES;

window.ROAD_GRAPH = ROAD_GRAPH;

export function isOnRoad(nameA, nameB){
  return !!(ROAD_GRAPH[nameA] && ROAD_GRAPH[nameA].includes(nameB));
}
window.isOnRoad = isOnRoad;

window.isOnRoad = isOnRoad;

export function roadEdgeDistance(nameA, nameB){
  const locs = getAllLandLocations();
  const la = locs.find(l=>l.name===nameA), lb = locs.find(l=>l.name===nameB);
  if(!la || !lb) return Infinity;
  const ca = getLocationCoord(la), cb = getLocationCoord(lb);
  if(!ca || !cb) return Infinity;
  return Math.hypot(ca.x-cb.x, ca.y-cb.y);
}
window.roadEdgeDistance = roadEdgeDistance;

export function findRoadRoute(fromLoc, toLoc){
  const nodeNames = Object.keys(ROAD_GRAPH);
  if(!nodeNames.length) return null;
  const locs = getAllLandLocations();
  const fromCoord = getLocationCoord(fromLoc), toCoord = getLocationCoord(toLoc);
  if(!fromCoord || !toCoord) return null;

  // 출발/도착에서 가장 가까운 도로 노드 탐색
  let nearestStart=null, nearestStartDist=Infinity, nearestEnd=null, nearestEndDist=Infinity;
  nodeNames.forEach(n=>{
    const l = locs.find(x=>x.name===n); if(!l) return;
    const c = getLocationCoord(l); if(!c) return;
    const dStart = Math.hypot(c.x-fromCoord.x, c.y-fromCoord.y);
    const dEnd = Math.hypot(c.x-toCoord.x, c.y-toCoord.y);
    if(dStart<nearestStartDist){ nearestStartDist=dStart; nearestStart=n; }
    if(dEnd<nearestEndDist){ nearestEndDist=dEnd; nearestEnd=n; }
  });
  if(!nearestStart || !nearestEnd) return null;

  // 다익스트라
  const dist = {}, prev = {};
  nodeNames.forEach(n=>{ dist[n]=Infinity; });
  dist[nearestStart]=0;
  const visited = new Set();
  while(visited.size < nodeNames.length){
    let u=null, best=Infinity;
    nodeNames.forEach(n=>{ if(!visited.has(n) && dist[n]<best){ best=dist[n]; u=n; } });
    if(u===null) break;
    visited.add(u);
    (ROAD_GRAPH[u]||[]).forEach(v=>{
      const w = roadEdgeDistance(u,v);
      if(dist[u]+w < dist[v]){ dist[v]=dist[u]+w; prev[v]=u; }
    });
  }
  if(dist[nearestEnd]===Infinity) return null;
  const path=[nearestEnd]; let cur=nearestEnd;
  while(prev[cur]){ cur=prev[cur]; path.unshift(cur); }

  return {
    entryOffroadDist: nearestStartDist,  // 출발지 -> 도로 진입까지 거친 길
    exitOffroadDist: nearestEndDist,     // 도로 이탈 -> 목적지까지 거친 길
    roadDist: dist[nearestEnd],          // 도로 위 총 거리
    path,
  };
}
window.findRoadRoute = findRoadRoute;

window.findRoadRoute = findRoadRoute;

export function getTravelDays(destLoc, transportType){
  const curLoc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  if(!curLoc) return 1;
  const t = (typeof TRANSPORT_CONFIG!=='undefined') ? TRANSPORT_CONFIG[transportType||'walk'] : null;
  const mult = t ? t.speedMult : 1.0;

  // [11차 수정] 비행 탑승물(그리핀·페가수스·와이번)은 "지형·날씨 무관 최고속
  // 비행"이 설계 의도인데, 지금까지는 speedMult만 반영하고 도로망 유무는
  // 그대로 따져서 도로 밖 "거친 길" 페널티(OFFROAD_PENALTY)를 육로 탑승물과
  // 똑같이 받고 있었다 — 날아다니는데 비포장길이라 느려지는 건 말이 안
  // 된다. 비행 탑승물은 도로망 탐색 자체를 건너뛰고 직선 거리로 계산하되,
  // ROAD_SPEED_BONUS(포장도로 이점)도 그대로 적용한다 — "직선으로 가로질러
  // 날아가는데, 그마저 도로 위 말보다 못하다"는 게 오히려 부자연스럽다.
  // 그 결과로 명마(도로 위, speedMult 4.0×도로 보너스 1.6)보다도 그리핀
  // (직선, speedMult 5.0×도로 보너스 1.6)이 더 빨라진다 — 의도한 그대로.
  if(t && t.isAir){
    const days = (typeof getLocationDistanceDays==='function') ? getLocationDistanceDays(curLoc, destLoc) : null;
    if(days===null) return 1;
    return Math.max(1, Math.round(days/ROAD_SPEED_BONUS/mult));
  }

  const route = (typeof findRoadRoute==='function') ? findRoadRoute(curLoc, destLoc) : null;
  if(route){
    // 도로 구간은 빠르게, 양 끝의 도로 밖 구간(거친 길)은 느리게 환산해 합산한다.
    const roadDays = (route.roadDist / LAND_TRAVEL_DAY_SCALE) / ROAD_SPEED_BONUS;
    const offroadDays = ((route.entryOffroadDist + route.exitOffroadDist) / LAND_TRAVEL_DAY_SCALE) / OFFROAD_PENALTY;
    const totalDays = Math.max(1, Math.round((roadDays + offroadDays) / mult));
    return totalDays;
  }

  // 도로망에 닿지 않는 경우 — 기존처럼 순수 직선거리(거친 길 기준)로 계산
  const days = getLocationDistanceDays(curLoc, destLoc);
  if(days===null) return 1;
  const offroadDays = Math.round(days / OFFROAD_PENALTY);
  return Math.max(1, Math.round(offroadDays/mult));
}
window.getTravelDays = getTravelDays;

window.getTravelDays = getTravelDays;

export function resolveTravelEncounter(choice){
  const travel = loadTravelState(); if(!travel || !travel.activeEncounter) return;
  const ev = travel.activeEncounter;
  const per = (S.stats&&S.stats.per)||50;
  const str = (S.stats&&S.stats.str)||50;

  if(ev.id==='camp_travelers'){
    if(choice==='join'){
      S.stats.cha = Math.min(999,(S.stats.cha||50)+3);
      if(Math.random()<0.4){ updateReputation(5); toast('🏕️ 여행객들과 정보를 나눴다. 평판+5, CHA+3', 3000); }
      else toast('🏕️ 여행객들과 잠시 어울렸다. CHA+3', 2500);
      S._pendingTravelHint = '야영하던 여행객들과 함께 시간을 보내며 이런저런 이야기를 나눴다.';
    } else { toast('지나쳤다.', 1500); }
  } else if(ev.id==='caravan'){
    if(choice==='escort'){
      const reward = 30+Math.floor(Math.random()*50);
      S.gold += reward; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
      toast(`🐫 캐러밴 호위에 동행해 사례금을 받았다! +${reward}G`, 3000);
      S._pendingTravelHint = '상단 캐러밴을 잠시 호위하며 동행했고, 목적지에서 사례금을 받았다.';
    } else if(choice==='trade'){
      toast('🐫 캐러밴과 간단히 물물교환을 했다.', 2500);
    } else { toast('지나쳤다.', 1500); }
  } else if(ev.id==='patrol'){
    if(choice==='greet'){
      updateReputation(3);
      toast('🛡️ 순찰대와 인사를 나눴다. 평판+3', 2000);
    } else if(choice==='avoid'){
      const karma = (S.character&&S.character.karmaScore)||50;
      if(karma>=60 && Math.random()<0.3){
        toast('🛡️ 순찰대가 수상함을 느끼고 검문을 시도한다!', 3000);
        S._pendingTravelHint = '순찰대를 피해 돌아가려 했지만 수상한 기색을 들켜 검문을 받을 위기에 처했다.';
      } else {
        toast('🛡️ 눈에 띄지 않게 우회했다.', 2000);
      }
    }
  } else if(ev.id==='bandit_ambush'){
    if(choice==='fight'){
      const win = Math.random() < Math.min(0.85, 0.4+(str-50)/200);
      if(win){
        const loot = 40+Math.floor(Math.random()*80);
        S.gold += loot; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
        toast(`⚔️ 산적을 물리치고 노획물을 챙겼다! +${loot}G`, 3000);
        if(typeof window.updateStats==='function') window.updateStats('travel_bandits_defeated', 1);
      } else {
        const lost = Math.min(S.gold||0, 20+Math.floor(Math.random()*40));
        S.gold -= lost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
        toast(`💀 산적에게 당해 금품을 빼앗겼다... -${lost}G`, 3000);
      }
    } else if(choice==='flee'){
      const success = Math.random()<0.6;
      toast(success?'💨 산적의 매복을 피해 달아났다.':'💨 도주에 실패해 약간의 피해를 입었다.', 2500);
      if(!success){ S.stats.hp = Math.max(1,(S.stats.hp||100)-10); window.updateHeader&&window.updateHeader(); }
    } else if(choice==='pay'){
      const tribute = Math.min(S.gold||0, 15+Math.floor(Math.random()*30));
      S.gold -= tribute; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
      toast(`💰 통행료 ${tribute}G를 내고 무사히 지나갔다.`, 2500);
    }
  } else if(ev.id==='wounded_traveler'){
    if(choice==='help'){
      updateReputation(8);
      if(Math.random()<0.3){
        const reward = 20+Math.floor(Math.random()*40);
        S.gold += reward; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
        toast(`🩹 부상자를 치료해줬다. 평판+8, 감사의 표시로 +${reward}G`, 3000);
      } else {
        toast('🩹 부상자를 치료해줬다. 평판+8', 2500);
      }
      S._pendingTravelHint = '길에 쓰러진 부상자를 도와 치료해주었다.';
    } else { toast('지나쳤다.', 1500); }
  } else if(ev.id==='wandering_merchant'){
    if(choice==='trade'){
      toast('🛒 떠돌이 상인과 거래했다. (인벤토리에서 확인)', 2500);
    } else { toast('지나쳤다.', 1500); }
  }

  travel.activeEncounter = null;
  saveTravelState(travel);
  window.renderWorldMapPanel();
}
window.resolveTravelEncounter = resolveTravelEncounter;

window.resolveTravelEncounter = resolveTravelEncounter;

export function startLandTravel(destName, transportType){
  const dest = getAllLandLocations().find(l=>l.name===destName);
  if(!dest){ toast('알 수 없는 목적지입니다.'); return; }
  const curLoc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  const days = getTravelDays(dest, transportType||'walk');
  const route = (typeof findRoadRoute==='function' && curLoc) ? findRoadRoute(curLoc, dest) : null;
  // 전체 이동거리 중 도로가 차지하는 비중 — 인카운터 안전도 계산에 사용
  let roadRatio = 0;
  if(route){
    const total = route.roadDist + route.entryOffroadDist + route.exitOffroadDist;
    roadRatio = total>0 ? route.roadDist/total : 0;
  }
  saveTravelState({ destName: dest.name, daysLeft: days, totalDays: days, transportType: transportType||'walk', activeEncounter:null, startedAt:S.msgCount||0, roadRatio, usedRoad: !!route });
  S._mapPopup = null;
  const roadNote = route ? (roadRatio>0.5 ? ' 정비된 도로를 따라가는 빠른 길입니다.' : ' 도로와 거친 길이 섞인 경로입니다.') : ' 도로가 없는 거친 길입니다.';
  toastHTML(`🚶 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(dest,{size:14}):(dest.icon)} ${esc(dest.name)}을(를) 향해 출발했습니다. (예상 ${esc(days)}일)${esc(roadNote)}`, 4500);
  S._pendingTravelHint = `주인공이 ${dest.name}을(를) 향해 길을 떠났다.`;
  window.renderWorldMapPanel();
}
window.startLandTravel = startLandTravel;

window.startLandTravel = startLandTravel;

export function tickLandTravel(){
  const travel = loadTravelState();
  if(!travel) return;
  if(travel.activeEncounter) return; // 인카운터 응답 대기 중에는 진행 안 함
  travel.daysLeft--;
  if(travel.daysLeft<=0){
    // [12차 수정] 도착은 매 AI 응답 이후 자동으로 도는 틱(misc/251) 안에서
    // 일어난다 — 그 턴의 AI 응답은 이미 "잔여 1일"인 채로 생성된 뒤라,
    // 여기서 moveToLocation에 도착 서술 sendMsg까지 바로 쏘면 플레이어가
    // 아무것도 안 했는데 서술이 하나 더 튀어나와 부자연스럽다. 아래
    // _pendingTravelHint가 다음 실제 플레이어 턴의 프롬프트에 자연스럽게
    // 얹혀 AI가 도착 장면을 이어 쓰게 되므로, moveToLocation엔 그 자동
    // 서술을 건너뛰라고 표시한다(skipArrivalMsg).
    const dest = getAllLandLocations().find(l=>l.name===travel.destName);
    if(dest && typeof moveToLocation==='function') moveToLocation(dest.name, { skipArrivalMsg:true });
    toast(`📍 ${travel.destName}에 도착했습니다!`, 3500);
    S._pendingTravelHint = `긴 여정 끝에 ${travel.destName}에 도착했다.`;
    saveTravelState(null);
    return;
  }
  // 도로 비중이 높을수록 안전(인카운터 확률 감소, 산적 가중치 감소).
  // [11차 수정] 탑승 수단의 encounterMult도 반영한다 — 지금까지는
  // TRANSPORT_CONFIG에 말·마차마다 값이 정의만 돼 있고(예: 명마 0.45,
  // 그리핀 0) 실제 인카운터 확률 계산에서는 전혀 안 쓰였다. 비행
  // 탑승물(encounterMult:0)은 지상 조우를 아예 건너뛴다 — "하늘엔 산적이
  // 없다"는 이미 데이터 주석에 적혀 있던 설계 의도를 그대로 실행한다.
  const roadRatio = travel.roadRatio||0;
  const t = (typeof TRANSPORT_CONFIG!=='undefined') ? TRANSPORT_CONFIG[travel.transportType||'walk'] : null;
  const transportMult = (t && t.encounterMult!=null) ? t.encounterMult : 1;
  const encounterChance = (0.3 - roadRatio*0.15) * transportMult; // 도로 100%면 0.15, 도로 0%면 0.3
  if(Math.random() < encounterChance){
    const pool = roadRatio>0.5
      ? TRAVEL_ENCOUNTER_POOL.map(e=>e.id==='bandit_ambush' ? {...e, weight: Math.max(1, Math.round(e.weight*0.4))} : e)
      : TRAVEL_ENCOUNTER_POOL;
    const totalWeight = pool.reduce((s,e)=>s+e.weight,0);
    let roll = Math.random()*totalWeight, picked = pool[0];
    for(const e of pool){ if(roll<e.weight){ picked=e; break; } roll-=e.weight; }
    travel.activeEncounter = { id:picked.id, icon:picked.icon, name:picked.name, desc:picked.desc };
    toast(`${picked.name}을(를) 마주쳤습니다!`, 4000, picked);
    S._pendingTravelHint = `여행 중 ${picked.desc}`;
  }
  saveTravelState(travel);
}
window.tickLandTravel = tickLandTravel;

window.tickLandTravel = tickLandTravel;

export function getWorldMapSection(){
  const travel = loadTravelState();
  if(!travel && !S._pendingTravelHint && !S._pendingFieldReturnHint) return '';
  let lines=[];
  if(travel){
    lines.push(`[🚶 여행 중] ${travel.destName}을(를) 향해 이동 중 (잔여 ${travel.daysLeft}일).`);
    if(travel.activeEncounter) lines.push(`[👥 여행 중 조우] ${travel.activeEncounter.desc} 이 만남을 서사에 자연스럽게 반영하라.`);
  }
  if(S._pendingTravelHint){ lines.push(`[📜 여행 사건] ${S._pendingTravelHint}`); S._pendingTravelHint=null; }
  // [16번 라운드, #10] 실시간 필드 이동(world/320)에서 대화로 복귀할 때
  // 남기는 힌트 — AI 경로는 여기서, 완전 로컬 경로는 composeLocalTurnText가
  // 직접 소비한다(13번 섹션 발견: 로컬 폴백은 S.system을 안 읽음).
  if(S._pendingFieldReturnHint){ lines.push(`[🗺️ 필드 복귀] ${S._pendingFieldReturnHint} 대화가 끊겼던 것처럼 다루지 말고, 이 일을 자연스럽게 이어서 서술하라.`); S._pendingFieldReturnHint=null; }
  return lines.length ? '\n'+lines.join('\n') : '';
}
window.getWorldMapSection = getWorldMapSection;

window.getWorldMapSection = getWorldMapSection;

// [8-10/8-11] "대륙 하나 = 왕국 하나"였던 구조를 사용자 요청대로 진짜
// "대륙 하나 안에 여러 왕국이 동시에 있고, 왕국 하나 안에 여러 도시가
// 있는" 3단 구조로 바꾼다. 8개 왕국을 4개 대륙으로 묶는다 — 본토
// 5개(중앙·북·남·동·서)는 "아르카디아 대륙" 하나로(이미 서로 인접·
// 중첩하게 배치해둠), 나머지 3개(엘프 숲·드워프 왕국·해적 연합)도
// 처음엔 "장소가 적어서 안 나눔"이라고 남겨뒀었는데 "아시아·아프리카에
// 나라가 하나뿐이냐"는 피드백을 받고, 히스파니올라/보르네오처럼
// 섬 하나에 왕국 두 개가 있는 구조로 마저 쪼갰다(northeast2 등 새
// 왕국 3개 추가) — 그래서 8개 왕국이 전부 "대륙 하나 안에 왕국이
// 여러 개" 구조 안에 들어가 있다(대륙 4개 x 왕국 2~5개).
export const CONTINENT_GROUPS = {
  mainland:  ['central','north','south','east','west'],
  moonisles: ['northeast','northeast2'],
  ironisles: ['northwest','northwest2'],
  windisles: ['southeast','southeast2'],
};
export const CONTINENT_GROUP_NAME = {
  mainland: '아르카디아 대륙', moonisles: '월림 군도', ironisles: '철산 군도', windisles: '남풍 군도',
};
export const KINGDOM_TO_GROUP = {};
Object.entries(CONTINENT_GROUPS).forEach(([g,ks])=>ks.forEach(k=>{ KINGDOM_TO_GROUP[k]=g; }));


export function getLandMapViewBox(){
  const mode = S._landMapViewMode || 'continent';
  if(mode==='world') return { x:0, y:0, w:WORLD_MAP_SIZE, h:WORLD_MAP_SIZE, scale: WORLD_MAP_SIZE/380 };

  // 대륙 전체 뷰(예: 아르카디아 대륙 — 그 대륙에 속한 왕국들을 동시에
  // 보여줌): 왕국 하나를 아직 안 고른 상태(_landMapSelectedContinent
  // 없음)에서 그룹이 정해져 있으면, 그 그룹에 속한 왕국들을 전부
  // 감싸는 범위를 화면 가득 표시.
  if(S._landMapSelectedGroup && !S._landMapSelectedContinent){
    const groupKeys = CONTINENT_GROUPS[S._landMapSelectedGroup] || [];
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    groupKeys.forEach(k=>{
      const z = WORLD_MAP_ZONES[k];
      minX = Math.min(minX, z.cx-z.rx); maxX = Math.max(maxX, z.cx+z.rx);
      minY = Math.min(minY, z.cy-z.ry); maxY = Math.max(maxY, z.cy+z.ry);
    });
    const pad = 1.1; // 왕국 뷰(1.25)보다는 여백을 좁게 — 이미 여러 왕국을 담을 만큼 넓은 범위라서
    const cx=(minX+maxX)/2, cy=(minY+maxY)/2;
    const w=(maxX-minX)*pad, h=(maxY-minY)*pad;
    const x=cx-w/2, y=cy-h/2;
    const refSize = Math.max(w,h);
    return { x, y, w, h, scale: refSize/380 };
  }

  // 왕국 뷰: 선택된 왕국(없으면 현재 위치의 왕국)을 화면 가득 표시
  let contKey = S._landMapSelectedContinent;
  if(!contKey){
    const curLoc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    contKey = (curLoc && curLoc.continent && WORLD_MAP_ZONES[curLoc.continent]) ? curLoc.continent : 'central';
    S._landMapSelectedContinent = contKey;
    S._landMapSelectedGroup = KINGDOM_TO_GROUP[contKey] || null;
  }
  const zone = WORLD_MAP_ZONES[contKey] || WORLD_MAP_ZONES.central;
  const pad = 1.25; // 대륙 영역보다 25% 넉넉하게 여백을 둬서 해안선이 화면 끝에 잘리지 않게
  const w = zone.rx*2*pad, h = zone.ry*2*pad;
  const x = zone.cx - w/2, y = zone.cy - h/2;
  const refSize = Math.max(w,h);
  return { x, y, w, h, scale: refSize/380 };
}
window.getLandMapViewBox = getLandMapViewBox;

// 세계 지도에서 왕국 하나를 눌렀을 때: 그 왕국이 속한 대륙에 왕국이
// 2개 이상이면 먼저 대륙 전체 뷰로 들어가고, 그 왕국 하나뿐이면
// 바로 왕국 상세로 들어간다. (지금은 4개 대륙 전부 왕국이 2개
// 이상이라 실질적으로 항상 대륙 전체 뷰부터 거치지만, 나중에 왕국이
// 하나뿐인 대륙이 생겨도 자연스럽게 동작하도록 이렇게 짰다.)
export function selectMapContinent(contKey){
  const group = KINGDOM_TO_GROUP[contKey];
  if(group && (CONTINENT_GROUPS[group]||[]).length > 1){
    S._landMapSelectedGroup = group;
    S._landMapSelectedContinent = null;
  } else {
    S._landMapSelectedGroup = group||null;
    S._landMapSelectedContinent = contKey;
  }
  S._landMapViewMode = 'continent';
  closeLandMapPopup();
  window.renderWorldMapPanel();
}
window.selectMapContinent = selectMapContinent;

// 대륙 전체 뷰에서 왕국 하나를 눌렀을 때: 그 왕국 하나만 확대해서
// 상세히 본다(도시가 훨씬 크고 또렷하게 보임).
export function selectMapKingdom(contKey){
  S._landMapSelectedContinent = contKey;
  S._landMapViewMode = 'continent';
  closeLandMapPopup();
  window.renderWorldMapPanel();
}
window.selectMapKingdom = selectMapKingdom;

export function toggleLandMapViewMode(){
  if(S._landMapViewMode==='world'){
    // 세계지도에서 안으로 들어가기: 현재 위치 기준으로 적절한 뷰를 고른다
    const curLoc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    const contKey = (curLoc && curLoc.continent && WORLD_MAP_ZONES[curLoc.continent]) ? curLoc.continent : (S._landMapSelectedContinent||'central');
    S._landMapSelectedContinent = contKey;
    S._landMapSelectedGroup = KINGDOM_TO_GROUP[contKey] || null;
    S._landMapViewMode = 'continent';
  } else if(S._landMapSelectedGroup && S._landMapSelectedContinent){
    // 왕국 상세 뷰 -> 한 단계만 나가서 대륙 전체 뷰로
    S._landMapSelectedContinent = null;
  } else {
    // 대륙 전체 뷰 또는 (왕국이 하나뿐인 대륙의) 왕국 뷰 -> 세계 지도로
    S._landMapViewMode = 'world';
    S._landMapSelectedGroup = null;
  }
  closeLandMapPopup();
  window.renderWorldMapPanel();
}
window.toggleLandMapViewMode = toggleLandMapViewMode;

window.toggleLandMapViewMode = toggleLandMapViewMode;

export function renderLandMapSVG(){
  const locs = getAllLandLocations();
  const curLoc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  const travel = loadTravelState();
  const popup = S._landMapPopup;
  const vb = getLandMapViewBox();
  // [8-13] renderWorldMapPanel()이 줌 단계별 실제 렌더 크기(dispW)에 맞춰
  // 미리 계산해둔 보정 배율 — 세계지도처럼 캔버스만 커진 모드에서 아이콘/
  // 글자가 캔버스 크기 그대로 따라 거대해지지 않게 막아준다.
  const k = vb.scale * (S._landMapIconScaleAdj || 1);

  // 대륙마다 실제 테마(설원/열대/숲/해안 등)가 있는데도 전부 똑같은
  // 초록색 그라데이션 하나로 칠해져 있던 것을 대륙별 색으로 갈라놨다 —
  // world/315(정치 지도)는 이미 대륙마다 색이 달랐는데 이 지도만 안
  // 그랬던 차이를 없앤 것.
  const CONTINENT_THEME_COLOR = {
    central:   { a:'#1c2e14', b:'#101a0a', stroke:'#3a5a28', strokeLight:'#5a8a3a' }, // 평원
    north:     { a:'#16242e', b:'#0a141c', stroke:'#3a6a7a', strokeLight:'#6ab0c0' }, // 빙결 설원
    south:     { a:'#2e2410', b:'#1c1608', stroke:'#8a6a20', strokeLight:'#d0a838' }, // 황금 열대
    east:      { a:'#182410', b:'#0e1608', stroke:'#4a6a2a', strokeLight:'#7aaa48' }, // 숲지
    west:      { a:'#2a1c10', b:'#1a1008', stroke:'#8a5a2a', strokeLight:'#c88a48' }, // 항구/해안 모래
    northeast: { a:'#142614', b:'#0a160a', stroke:'#3a7a3a', strokeLight:'#68c068' }, // 엘프 삼림
    northwest: { a:'#20201e', b:'#141412', stroke:'#6a6a68', strokeLight:'#a0a09a' }, // 드워프 산맥
    southeast: { a:'#122028', b:'#0a1218', stroke:'#3a7a8a', strokeLight:'#58b8c8' }, // 남동 군도
    northeast2:{ a:'#1c1830', b:'#100c1e', stroke:'#5a4a9a', strokeLight:'#9a86e0' }, // 은월 왕정 — 보랏빛 밤하늘
    northwest2:{ a:'#241a10', b:'#160e08', stroke:'#8a5a30', strokeLight:'#d09858' }, // 강철턱 부족 — 붉은 대장간 화로
    southeast2:{ a:'#280c10', b:'#1a0608', stroke:'#8a3040', strokeLight:'#d05868' }, // 핏빛 깃발단 — 핏빛 깃발
  };
  // 8개는 전부 "진짜 따로 떨어진 대륙"이다(전 라운드에 5개를 하나로
  // 합쳤더니 "대륙은 대륙으로 남겨두라"는 피드백을 받고 되돌림). 각
  // 대륙 안에는 이번에 새로 추가한 "나라"(country) 하위 구역이 있고,
  // 나라 안에 기존 도시들이 있다 — 대륙(굵은 해안선) → 나라(옅은
  // 점선 경계, 도시들을 각도 기준으로 묶어 즉석에서 계산) → 도시
  // 3단 구조.
  // [8-17] "땅·바다 도트가 뭐야, 진짜 못 만들었다" — terrain-tile-*.png는
  // 애초에 "바닥에 반복해서 까는 지형 텍스처"가 아니라 집·성 모양의
  // 작은 장식 아이콘이라(마을 미니어처처럼 생김), 불투명도를 낮추고
  // 간격을 넓혀봐도 배경으로 쓰면 실제 장소 마커와 헷갈리기만 하고
  // 근본적으로 안 어울렸다. 사용자 제안대로 "땅 도트를 배경으로 깔고
  // 그 위에 도시·마을 도트를 레이어로 얹는" 구조가 맞는데, 그 역할은
  // 이미 markerList가 그리는 장소 마커 레이어(필요하면 PIXEL_ART_
  // MANIFEST의 실제 도트 스프라이트까지 얹힘)가 하고 있다 — 문제는
  // "배경 레이어"에 엉뚱한 아이콘을 억지로 깐 것 자체였다. 배경은
  // 원래대로 평평한 단색(왕국 테마 색)으로 되돌리고, 산·숲 장식은
  // (이건 반복 타일이 아니라 CONTINENT_TERRAIN에 박아둔 몇 개 지점에만
  // 개별 스프라이트로 찍는 방식이라 문제 없었음) 그대로 둔다.
  let svg = `<svg viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" width="100%" height="100%" style="display:block;background:#040a12;border-radius:6px" role="img"><title>월드 지도</title><desc>대륙과 마을·도시·던전 위치를 보여주는 지도. 점을 터치하면 행동을 고를 수 있다.</desc>`;
  svg += `<rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="#040a12" pointer-events="none"/>`;
  svg += `<rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="transparent" onclick="closeLandMapPopup()"/>`;

  const _mapMode = S._landMapViewMode || 'continent';

  Object.entries(WORLD_MAP_ZONES).forEach(([key,z])=>{
    // [8-11] 예전엔 장소가 하나도 없는 왕국은 아예 안 그렸는데, 이제
    // 막 생겨서 아직 도시가 없는 새 왕국(northeast2 등)도 "여기 이런
    // 왕국이 있다"는 게 보여야 하므로(비어있어도 땅과 이름은 있음)
    // 이 조건을 없앴다 — AI가 나중에 이 안에 도시를 채워나간다.
    const _group = S._landMapSelectedGroup;
    if(_mapMode==='continent'){
      if(S._landMapSelectedContinent){
        // [8-14] 예전엔 선택된 왕국 하나만 그려서, 본토처럼 실제로 옆
        // 왕국과 땅이 맞닿은 곳(알테라↔용염 제국·케메트 등)도 왕국
        // 상세 뷰에 들어가면 검은 허공에 뜬 외딴 섬처럼 보였다("이게
        // 섬인지 뭔지 모르겠다"는 지적). 같은 대륙 그룹에 속한 이웃
        // 왕국도 배경 맥락으로 함께 그리되(클릭·마커는 여전히 선택된
        // 왕국 하나에만 적용 — markerList 필터가 이미 그렇게 되어있음),
        // 화면은 선택된 왕국에 맞춰 확대되므로 이웃은 테두리 쪽에
        // 살짝만 보여 "이어진 땅"이라는 걸 알려주는 정도로 그친다.
        const selGroup = KINGDOM_TO_GROUP[S._landMapSelectedContinent];
        const inSameGroup = selGroup && (CONTINENT_GROUPS[selGroup]||[]).includes(key);
        if(key!==S._landMapSelectedContinent && !inSameGroup) return;
      } else if(_group){
        if(!(CONTINENT_GROUPS[_group]||[]).includes(key)) return; // 대륙 전체 뷰: 이 대륙 소속 왕국만
      }
    }
    const coastPath = (typeof CONTINENT_COASTLINE!=='undefined') ? CONTINENT_COASTLINE[key] : null;
    // 세계지도에서는 왕국을 눌러 대륙/왕국 뷰로 들어가고, 대륙 전체
    // 뷰에서는 왕국 하나를 눌러 그 왕국 상세로 더 들어간다.
    const isClickable = _mapMode==='world' || (_mapMode==='continent' && _group==='mainland' && !S._landMapSelectedContinent);
    const clickFn = _mapMode==='world' ? `selectMapContinent('${key}')` : `selectMapKingdom('${key}')`;
    const zoneAttrs = isClickable ? `style="cursor:pointer" onclick="event.stopPropagation();${clickFn}"` : '';
    const theme = CONTINENT_THEME_COLOR[key] || CONTINENT_THEME_COLOR.central;
    svg += `<g ${zoneAttrs}>`;
    if(coastPath){
      // [수정] "이 선 밖으로 나가면 죽나?" — 실제 지도에서 해안선은 땅과
      // 바다가 만나는 색 경계일 뿐 성벽처럼 진하게 두를 이유가 없는데,
      // stroke-width 1.6*k·opacity 0.92짜리 굵은 테두리 + 그 위에 또
      // strokeLight 테두리까지 이중으로 둘러서 각 왕국이 서로 절대
      //못 넘나드는 별개의 벽으로 둘러싸인 섬처럼 보였다(사용자가 보낸
      // 실제 판타지 지도 참고 이미지에도 이런 진한 테두리는 없음).
      // 두 번째 테두리는 없애고, 남은 테두리도 얇고 옅게 낮춰서 색
      // 채움 자체로 육지·바다가 구분되게 한다.
      svg += `<path d="${coastPath}" fill="${theme.a}" stroke="${theme.stroke}" stroke-width="${0.5*k}" opacity="0.75"/>`;
    } else {
      svg += `<ellipse cx="${z.cx}" cy="${z.cy}" rx="${z.rx}" ry="${z.ry}" fill="${theme.a}" stroke="${theme.stroke}" stroke-width="${0.5*k}" opacity="0.6"/>`;
    }
    // 지형 텍스처 — 산맥·숲 (월드뷰에서는 더 흐릿하게, 대륙뷰에서는 또렷하게)
    // [도트 텍스처] 손으로 그린 삼각형/원 뭉치 대신, 생성기가 만든
    // 산/숲 도트 타일 이미지를 같은 좌표·같은 opacity 로직으로 얹는다 —
    // 좌표 배치·클릭 영역 같은 기능은 전혀 안 바꾸고 그림만 바꾼 것.
    const terr = (typeof CONTINENT_TERRAIN!=='undefined') ? CONTINENT_TERRAIN[key] : null;
    const terrOpacity = _mapMode==='world' ? 0.35 : 1;
    if(terr){
      (terr.mountains||[]).forEach(m=>{
        const s = 13*k;
        svg += `<image href="assets/img/ui/terrain-tile-mountain.png" x="${m.x-s}" y="${m.y-s}" width="${s*2}" height="${s*2}" opacity="${0.6*terrOpacity}" style="image-rendering:pixelated" pointer-events="none"/>`;
      });
      (terr.forests||[]).forEach(fo=>{
        const s = 9*k;
        svg += `<image href="assets/img/ui/terrain-tile-forest.png" x="${fo.x-s}" y="${fo.y-s}" width="${s*2}" height="${s*2}" opacity="${0.55*terrOpacity}" style="image-rendering:pixelated" pointer-events="none"/>`;
      });
    }
    // [8-10] 예전엔 여기서 왕국 하나를 파이 조각처럼 잘라 가짜 "나라"
    // 경계를 그렸는데(computeCountrySubregions), 이제 왕국 자체가
    // "나라" 역할을 하므로(대륙=아르카디아 > 왕국=알테라 등 > 도시)
    // 그 가짜 하위 구역은 더 필요 없어 없앴다. 대신 대륙 전체 뷰에서는
    // 왕국 이름을 큼직하게 표시한다(도시는 아래 markerList가 그림).
    if(_mapMode==='continent' && _group==='mainland' && !S._landMapSelectedContinent){
      const kLabel = CONTINENT_PROPER_NAME[key] || key;
      svg += `<text x="${z.cx}" y="${z.cy-z.ry*0.65}" font-size="${15*k}" fill="${theme.strokeLight}" text-anchor="middle" pointer-events="none" style="font-family:'Cinzel',serif;font-weight:bold" opacity="0.92">${esc(kLabel)}</text>`;
    }
    // 월드뷰에서는 대륙 이름과 거점 도시만 표시
    if(_mapMode==='world'){
      const hubName = CONTINENT_HUB_NAMES[key];
      const contLabel = CONTINENT_PROPER_NAME[key] || key;
      svg += `<text x="${z.cx}" y="${z.cy-z.ry*0.55}" font-size="${14*k}" fill="#c8a96e" text-anchor="middle" style="font-family:'Cinzel',serif;font-weight:bold" opacity="0.9">${contLabel}</text>`;
      if(hubName){
        const hc = { x:z.cx, y:z.cy };
        // [8-19] 여기도 손으로 그린 성 모양 벡터 아이콘이었다 — 도트
        // 그림이 있으면 그걸 원형으로 잘라 보여주고, 없으면 단순 점.
        const hubHit = (typeof window!=='undefined' && window.PIXEL_ART_MANIFEST) ? window.PIXEL_ART_MANIFEST.byName[hubName] : null;
        const hubR = 9*k;
        if(hubHit){
          const clipId = 'hubclip-' + esc(hubName).replace(/[^a-zA-Z0-9_-]/g,'');
          svg += `<clipPath id="${clipId}"><circle cx="${hc.x}" cy="${hc.y}" r="${hubR}"/></clipPath>
          <image href="assets/${hubHit.path}" x="${hc.x-hubR}" y="${hc.y-hubR}" width="${hubR*2}" height="${hubR*2}" clip-path="url(#${clipId})" style="image-rendering:pixelated" pointer-events="none"/>`;
        } else {
          svg += `<circle cx="${hc.x}" cy="${hc.y}" r="${hubR*0.6}" fill="#e0c060" stroke="#e0c060" stroke-width="${1*k}" pointer-events="none"/>`;
        }
        svg += `<text x="${hc.x}" y="${hc.y+22*k}" font-size="${9*k}" fill="#e0c060" text-anchor="middle" pointer-events="none" style="font-family:'Cinzel',serif">${esc(hubName)}</text>`;
      }
      // 현재 위치가 이 대륙이면 강조 테두리
      if(curLoc && curLoc.continent===key){
        svg += `<circle cx="${z.cx}" cy="${z.cy}" r="${Math.max(z.rx,z.ry)*1.08}" fill="none" stroke="#c0a030" stroke-width="${1.4*k}" stroke-dasharray="${6*k},${4*k}" opacity="0.7" pointer-events="none"/>`;
      }
    }
    svg += `</g>`;
  });

  // 월드뷰에서 대륙마다(왕국을 2개 이상 묶은 그룹마다) 대륙 이름을
  // 하나 더 크게 얹는다 — 왕국 이름은 각자 표시되니, 이건 "이
  // 왕국들이 사실 하나의 대륙"이라는 걸 한눈에 알려주는 용도.
  if(_mapMode==='world'){
    Object.entries(CONTINENT_GROUPS).forEach(([groupKey,groupKingdoms])=>{
      let minX=Infinity,maxX=-Infinity,minY=Infinity;
      groupKingdoms.forEach(mk=>{
        const z = WORLD_MAP_ZONES[mk];
        minX = Math.min(minX, z.cx-z.rx); maxX = Math.max(maxX, z.cx+z.rx);
        minY = Math.min(minY, z.cy-z.ry);
      });
      const fontSize = groupKey==='mainland' ? 22*k : 14*k;
      svg += `<text x="${(minX+maxX)/2}" y="${minY-(groupKey==='mainland'?40:22)*k}" font-size="${fontSize}" fill="#c8a96e" text-anchor="middle" pointer-events="none" style="font-family:'Cinzel',serif;font-weight:bold;letter-spacing:${2*k}px" opacity="0.55">${esc(CONTINENT_GROUP_NAME[groupKey]||groupKey)}</text>`;
    });
  }

  // 도로망·여행경로는 대륙뷰에서만 의미가 있으므로 그 안에서만 표시
  if(_mapMode==='continent'){
    // 도로망 — 실제 좌표로 연결된 길을 점선이 아닌 실선으로 그려 "정비된 길"임을 표현
    if(typeof ROAD_EDGES!=='undefined'){
      ROAD_EDGES.forEach(([a,b])=>{
        const la = locs.find(l=>l.name===a), lb = locs.find(l=>l.name===b);
        if(!la || !lb) return;
        const ca = getLocationCoord(la), cb = getLocationCoord(lb);
        if(!ca || !cb) return;
        // 최소 한쪽 끝이 현재 대륙 화면 범위 안에 있을 때만 그림 (다른 대륙 간 장거리 도로도 자연스럽게 보이게)
        const inView = (p)=> p.x>=vb.x-50 && p.x<=vb.x+vb.w+50 && p.y>=vb.y-50 && p.y<=vb.y+vb.h+50;
        if(!inView(ca) && !inView(cb)) return;
        svg += `<line x1="${ca.x}" y1="${ca.y}" x2="${cb.x}" y2="${cb.y}" stroke="#8a7a4a" stroke-width="${1.2*k}" opacity="0.45" pointer-events="none"/>`;
      });
    }

    // 여행 중이면 경로 표시
    if(travel && curLoc){
      const dest = locs.find(l=>l.name===travel.destName);
      const cFrom = getLocationCoord(curLoc), cTo = dest?getLocationCoord(dest):null;
      if(cFrom && cTo){
        const destInView = cTo.x>=vb.x && cTo.x<=vb.x+vb.w && cTo.y>=vb.y && cTo.y<=vb.y+vb.h;
        if(destInView){
          const progress = 1-(travel.daysLeft/travel.totalDays);
          const mx=(cFrom.x+cTo.x)/2, my=(cFrom.y+cTo.y)/2-60;
          const t=progress;
          const px=(1-t)*(1-t)*cFrom.x+2*(1-t)*t*mx+t*t*cTo.x;
          const py=(1-t)*(1-t)*cFrom.y+2*(1-t)*t*my+t*t*cTo.y;
          svg += `<path d="M${cFrom.x} ${cFrom.y} Q${mx} ${my} ${cTo.x} ${cTo.y}" fill="none" stroke="#5a8a3a" stroke-width="${1*k}" stroke-dasharray="${3*k},${3*k}" pointer-events="none"/>`;
          svg += `<text x="${px}" y="${py}" font-size="${13*k}" text-anchor="middle" pointer-events="none">🚶</text>`;
        } else {
          // 목적지가 다른 대륙(화면 밖)에 있으면, 그 방향의 화면 가장자리에 화살표와 거리 안내를 표시
          const cx = vb.x+vb.w/2, cy = vb.y+vb.h/2;
          const angle = Math.atan2(cTo.y-cy, cTo.x-cx);
          const edgeR = Math.min(vb.w, vb.h)/2 - 30*k;
          const ex = cx + Math.cos(angle)*edgeR, ey = cy + Math.sin(angle)*edgeR;
          const destContLabel = dest ? (CONTINENT_PROPER_NAME[dest.continent]||dest.continent||'') : '';
          svg += `<g transform="translate(${ex},${ey}) rotate(${angle*180/Math.PI})" pointer-events="none" opacity="0.85">
            <path d="M-10 -7 L10 0 L-10 7 Z" fill="#5a8a3a"/>
          </g>`;
          svg += `<text x="${ex}" y="${ey+18*k}" font-size="${9*k}" fill="#7aaa6a" text-anchor="middle" pointer-events="none" style="font-family:'Cinzel',serif">${destContLabel} 방향 · ${travel.daysLeft}일 남음</text>`;
        }
      }
    }
  }

  if(_mapMode==='continent'){
  // 장소가 많은 대륙(최대 34개)에서는 이름표를 항상 같은 높이에 붙이면
  // 서로 겹쳐서 글씨가 뒤죽박죽 보인다. 마커를 먼저 전부 배치한 뒤,
  // 이름표는 "이미 배치된 다른 이름표 상자와 안 겹치는 가장 가까운 층"을
  // 그리디하게 골라서 세로로 살짝 밀어내는 식으로 충돌을 없앤다
  // (지도 앱에서 흔히 쓰는 라벨 충돌 회피 기법).
  const markerList = locs
    .filter(loc=> S._landMapSelectedContinent ? loc.continent===S._landMapSelectedContinent
      : (S._landMapSelectedGroup ? (CONTINENT_GROUPS[S._landMapSelectedGroup]||[]).includes(loc.continent) : false))
    .map(loc=>{
      const c = getLocationCoord(loc);
      if(!c) return null;
      const isCurrent = !travel && curLoc && loc.name===curLoc.name;
      const isOpen = popup && popup.id===loc.name;
      const isHub = CONTINENT_HUB_NAMES[loc.continent]===loc.name;
      const isDungeon = loc.type==='dungeon';
      const dTier = isDungeon ? (loc.dungeonTier||1) : null;
      const color = isCurrent ? '#c0a030' : isOpen ? '#6aca6a' : isHub ? '#e0c060'
        : (isDungeon && DUNGEON_TIER_COLORS[dTier]) ? DUNGEON_TIER_COLORS[dTier] : '#6a9a5a';
      const baseSize = (isCurrent||isOpen?15:isHub?13:(isDungeon?(9+dTier*1.3):10)) * k;
      const shapeType = isHub ? 'capital'
        : (isDungeon && MAP_MARKER_SHAPES['dungeon'+dTier]) ? 'dungeon'+dTier
        : (loc.type && MAP_MARKER_SHAPES[loc.type]) ? loc.type : 'hamlet';
      const shapePath = (typeof MAP_MARKER_SHAPES!=='undefined' ? MAP_MARKER_SHAPES[shapeType] : null) || MAP_MARKER_SHAPES.hamlet;
      const labelText = `${loc.name}${isDungeon?` (${'★'.repeat(dTier)})`:''}`;
      const fontSize = (isHub?8.5:7) * k;
      return { loc, c, isCurrent, isOpen, isHub, isDungeon, dTier, color, baseSize, shapePath, labelText, fontSize, priority: isHub?0:isCurrent?1:isOpen?2:3 };
    })
    .filter(Boolean);

  // 우선순위(허브/현재위치 먼저) → 화면 y좌표 순으로 배치해서, 중요한
  // 지명이 먼저 좋은 자리를 차지하게 한다.
  // 참고: 다른 마커의 아이콘 자체까지 장애물로 등록하는 방식도 시도해
  // 봤지만, 장소가 촘촘한 대륙(MIN_DIST=95)에서는 아이콘끼리 이미 거의
  // 붙어있어서 오히려 이름표가 계속 튕겨나가 더 지저분해졌다. 그래서
  // 이름표끼리의 충돌만 피하는 쪽으로 되돌렸다 — 아이콘 한두 개와 살짝
  // 겹치는 것보다, 이름표 줄 전체가 널뛰는 게 더 안 좋은 결과였다.
  markerList.forEach((m,i)=>{ m._idx = i; });
  const placedLabels = [];
  const labelPad = 2*k;
  markerList
    .slice()
    .sort((a,b)=> a.priority-b.priority || a.c.y-b.c.y)
    .forEach(m=>{
      const halfW = m.labelText.length * m.fontSize * 0.5 + labelPad;
      const lineH = m.fontSize * 1.25;
      let tier = 0, y = 0, box = null;
      for(; tier<6; tier++){
        y = m.c.y + m.baseSize*0.85 + 8*k + tier*lineH;
        box = { x1:m.c.x-halfW, x2:m.c.x+halfW, y1:y-lineH*0.5, y2:y+lineH*0.5 };
        const hit = placedLabels.some(p=> p.ownerIdx!==m._idx && box.x1<p.x2 && box.x2>p.x1 && box.y1<p.y2 && box.y2>p.y1);
        if(!hit) break;
      }
      placedLabels.push({ ownerIdx:m._idx, ...box });
      m.labelY = y;
    });

  // [19번 라운드, [대기] #15 — 퀘스트 위치 표시, 새 시스템] misc/053이
  // 관리하는 "수락됐지만 아직 안 끝난 게시판 의뢰의 실제 목표 장소"
  // 목록을 읽어, 그 장소의 마커에 ❗ 배지를 얹는다. 텍스트 추측이
  // 아니라 misc/053에서 실제 좌표 데이터로 결정론적으로 고른
  // targetLocationId를 그대로 신뢰한다.
  // [21번 라운드, 시스템 업그레이드 ④] AI 자유생성 퀘스트 쪽 목표
  // 장소(quest/141의 getActiveAIQuestLocationTargets, 같은 결정론적
  // 방식으로 채워짐)도 같은 배지로 합쳐서 표시한다 — 두 출처가 서로
  // 다른 방식으로 "장소 추측"을 하지 않도록 둘 다 이미 확정된 실제
  // locationId만 신뢰한다.
  const questTargetIds = new Set([
    ...(typeof window.getActiveBulletinQuestTargets==='function' ? window.getActiveBulletinQuestTargets() : []),
    ...(typeof window.getActiveAIQuestLocationTargets==='function' ? window.getActiveAIQuestLocationTargets() : []),
  ].map(q=>q.locationId));
  markerList.forEach(m=>{
    const { loc, c, isCurrent, isDungeon, dTier, color, baseSize, shapePath, labelText, fontSize, labelY } = m;
    const hasQuestTarget = questTargetIds.has(loc.id);
    // [버그 수정] world/315(대륙 정치 지도)·combat/257(던전 미니맵)·
    // npc/226(관계도)은 전부 PIXEL_ART_MANIFEST에서 이 장소의 도트 그림을
    // 찾아 마커 안에 깔아주는데, 이 지도(월드맵)만 그 로직이 빠진 채
    // 색깔 있는 SVG 테두리 아이콘만 그리고 있었다(사용자 지적) —
    // "8-1"에서 이 지도에도 아이콘을 입혔지만 그때는 아직 도트 아트
    // 매니페스트 자체가 없던 더 이른 라운드라 벡터 아이콘으로만
    // 끝났던 것으로 보인다. 다른 지도들과 같은 방식(원형으로 잘라
    // 밑에 깔고, 기존 테두리 모양은 그대로 반투명하게 위에 얹기)으로
    // 맞춘다.
    // [8-19] "마커에 SVG 아이콘 그림 왜 남겨놨냐, 그냥 다 도트로 해라" —
    // 도트 그림이 있는 장소는 그 위에 손으로 그린 벡터 아이콘(성·집
    // 모양 실루엣, MAP_MARKER_SHAPES)을 반투명하게 겹쳐 그리고 있었는데,
    // 이것도 결국 SVG 그림이라 지적받은 대로 완전히 뺐다 — 도트 그림이
    // 있으면 그 그림 하나만, 테두리 링만 둘러서 클릭 영역을 표시한다.
    // 도트 그림이 아직 없는 장소(매니페스트 미등록분)는 정교한 아이콘
    // 실루엣 대신 그냥 단순 색점으로 떨어뜨려서, 있는 건 진짜 도트로,
    // 없는 건 최소한의 점으로만 표시하고 손그림 벡터 아이콘 자체를
    // 이 지도에서 없앴다.
    const manifestHit = (typeof window!=='undefined' && window.PIXEL_ART_MANIFEST)
      ? (window.PIXEL_ART_MANIFEST.byId[loc.id] || (loc.name && window.PIXEL_ART_MANIFEST.byName[loc.name]))
      : null;
    let iconImg = '';
    if(manifestHit){
      const iconR = baseSize*0.85;
      const clipId = 'lmclip-' + esc(loc.id||loc.name).replace(/[^a-zA-Z0-9_-]/g,'');
      iconImg = `<clipPath id="${clipId}"><circle cx="${c.x}" cy="${c.y}" r="${iconR}"/></clipPath>
      <image href="assets/${manifestHit.path}" x="${c.x-iconR}" y="${c.y-iconR}" width="${iconR*2}" height="${iconR*2}" clip-path="url(#${clipId})" style="image-rendering:pixelated" pointer-events="none"/>`;
    }
    svg += `<g style="cursor:pointer" onclick="event.stopPropagation();openLandMapPopup('${esc(loc.name).replace(/'/g,"\\'")}',${c.x},${c.y})">
      <circle cx="${c.x}" cy="${c.y}" r="${baseSize*0.85}" fill="#050a05" opacity="${manifestHit?0.15:0.55}"/>
      ${iconImg}
      ${isDungeon && dTier>=4 ? `<circle cx="${c.x}" cy="${c.y}" r="${baseSize*1.15}" fill="none" stroke="${color}" stroke-width="${0.8*k}" opacity="0.4"/>` : ''}
      ${manifestHit
        ? '' /* [8-20] "링도 정신사나워" — 도트 그림 둘레의 색 테두리 링도 뺐다. 클릭 영역은 위의 배경 채움 원(opacity 0.15)이 그대로 담당. */
        : `<circle cx="${c.x}" cy="${c.y}" r="${baseSize*0.55}" fill="${color}" stroke="${color}" stroke-width="${1*k}" opacity="0.9"/>`}
      ${isCurrent?`<circle cx="${c.x}" cy="${c.y}" r="${baseSize*0.95}" fill="none" stroke="${color}" stroke-width="${1*k}"><animate attributeName="r" values="${baseSize*0.8};${baseSize*1.15};${baseSize*0.8}" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite"/></circle>`:''}
      ${hasQuestTarget?`<text x="${c.x+baseSize*0.7}" y="${c.y-baseSize*0.6}" font-size="${13*k}" text-anchor="middle">❗</text>`:''}
      <rect x="${c.x-labelText.length*fontSize*0.5-1.5*k}" y="${labelY-fontSize*0.85}" width="${labelText.length*fontSize+3*k}" height="${fontSize*1.15}" fill="#050a05" opacity="0.5" rx="${2*k}"/>
      <text x="${c.x}" y="${labelY}" font-size="${fontSize}" fill="${color}" text-anchor="middle" style="font-family:'Cinzel',serif">${esc(labelText)}</text>
    </g>`;
  });
  }

  if(popup) svg += renderLandMapPopupSVG(popup, curLoc, travel, k, vb);
  svg += `</svg>`;
  return svg;
}
window.renderLandMapSVG = renderLandMapSVG;

window.renderLandMapSVG = renderLandMapSVG;

export function renderLandMapPopupSVG(popup, curLoc, travel, k, vb){
  const px=popup.x, py=popup.y;
  const loc = getAllLandLocations().find(l=>l.name===popup.id);
  if(!loc) return '';
  let rows = [];
  if(travel){
    rows.push({ label:'여행 중에는 조작할 수 없음', action:null, color:'#888' });
  } else if(curLoc && loc.name===curLoc.name){
    rows.push({ label:'현재 위치', action:null, color:'#c0a030' });
  } else {
    const days = getTravelDays(loc, 'walk');
    const route = (typeof findRoadRoute==='function' && curLoc) ? findRoadRoute(curLoc, loc) : null;
    const roadTag = route ? '🛣️' : '🌿';
    rows.push({ label:`🚶${roadTag} 도보로 이동 (약 ${days}일)`, action:`startLandTravel('${esc(loc.name).replace(/'/g,"\\'")}','walk')`, color:'#6a9a5a' });
  }
  const tierLabel = (loc.type==='dungeon' && loc.dungeonTier) ? ` ${'★'.repeat(loc.dungeonTier)}` : '';
  const title = `${loc.icon} ${loc.name}${tierLabel}`;
  const w=140*k, rowH=18*k, h=26*k+rows.length*rowH;
  let bx=px-w/2, by=py-h-14*k;
  bx = Math.max(vb.x+4*k, Math.min(vb.x+vb.w-w-4*k, bx));
  by = Math.max(vb.y+4*k, by);
  const tipX = Math.max(bx+10*k, Math.min(bx+w-10*k, px));
  let svg = `<g pointer-events="auto">
    <path d="M${bx} ${by} h${w} v${h} h-${w} z M${tipX-6*k} ${by+h} L${px} ${py-10*k} L${tipX+6*k} ${by+h} z" fill="#0a140a" stroke="#2a4a2a" stroke-width="${1*k}"/>
    <text x="${bx+w/2}" y="${by+15*k}" font-size="${9*k}" fill="#c0e0c0" text-anchor="middle" font-weight="bold">${title}</text>`;
  rows.forEach((r,i)=>{
    const ry=by+26*k+i*rowH;
    svg += `<g ${r.action?`style="cursor:pointer" onclick="event.stopPropagation();${r.action};closeLandMapPopup()"`:''}>
      <rect x="${bx+6*k}" y="${ry-11*k}" width="${w-12*k}" height="${15*k}" fill="${r.action?'#0a1a0f':'transparent'}" rx="${2*k}"/>
      <text x="${bx+w/2}" y="${ry}" font-size="${8*k}" fill="${r.color}" text-anchor="middle">${r.label}</text>
    </g>`;
  });
  svg += `<g style="cursor:pointer" onclick="event.stopPropagation();closeLandMapPopup()"><circle cx="${bx+w-8*k}" cy="${by+8*k}" r="${6*k}" fill="#1a1010"/><text x="${bx+w-8*k}" y="${by+11*k}" font-size="${8*k}" fill="#c08080" text-anchor="middle">✕</text></g>`;
  svg += `</g>`;
  return svg;
}
window.renderLandMapPopupSVG = renderLandMapPopupSVG;

export function openLandMapPopup(name,x,y){ S._landMapPopup={id:name,x,y}; window.renderWorldMapPanel(); }
window.openLandMapPopup = openLandMapPopup;

export function closeLandMapPopup(){ S._landMapPopup=null; window.renderWorldMapPanel(); }
window.closeLandMapPopup = closeLandMapPopup;

window.openLandMapPopup = openLandMapPopup;

window.closeLandMapPopup = closeLandMapPopup;

(function(){
  // [버그 수정] p-worldmap 패널 DOM은 template.html에 이미 정적으로
  // 있어서(중복 생성 방지용 이 가드가 원래 의도한 그 상황) 아래 return이
  // 항상 실행됐다. 그런데 정작 하단바에 항상 보이는 "🗺️월드맵" 버튼을
  // 추가하는, 패널 존재 여부와 무관한 별개의 코드가 같은 함수 안에
  // 딸려 들어가 있어서, 이 가드 때문에 그 버튼이 지금까지 한 번도
  // 만들어진 적이 없었다 — 여행 지도로 갈 수 있는 "항상 뜨는" 진입점이
  // 하나 통째로 죽어있던 것. 패널 생성과 버튼 생성을 분리한다.
  if(!document.getElementById('p-worldmap')){
    const div=document.createElement('div'); div.className='panel-ov'; div.id='p-worldmap';
    div.innerHTML=`<div class="panel"><div class="p-hdr"><span class="p-title">🗺️ 월드맵</span><button class="p-close" onclick="closeP('worldmap')">✕</button></div><div class="p-body scrollable" id="pb-worldmap"></div></div>`;
    document.body.appendChild(div);
  }
  setTimeout(()=>{
    try{
      const b=document.querySelector('.btm-bar'); if(!b||document.getElementById('btn-worldmap')) return;
      const bn=document.createElement('button'); bn.id='btn-worldmap'; bn.className='bb';
      bn.style.cssText='color:#7aaa6a;border-color:#1a4a2a'; bn.textContent='🗺️월드맵'; bn.title='월드맵 — 모든 장소를 지도로 보고 이동';
      bn.onclick=function(){ window.openP('worldmap'); window.renderWorldMapPanel(); }; b.appendChild(bn);
    }catch(e){}
  },6000);
})();

export function renderSeaMapSVG(ship, selectedDest){
  const ports = getPortLocations();
  const coords = {};
  ports.forEach(p=>{ coords[p.name] = getLocationCoord(p) || {x:WORLD_MAP_SIZE/2,y:WORLD_MAP_SIZE/2}; });
  const popup = S._mapPopup; // { kind:'port'|'island'|'npc', id:string, x:number, y:number }
  const vb = getMapViewBox(ship);
  const mode = S._mapViewMode || 'near';
  // 줌 배율에 따라 점/텍스트 크기를 보정해 어느 모드에서도 알아볼 수 있게 한다.
  const k = vb.scale; // 1이면 원래 380기준 크기, near 모드는 보통 1.37, world는 5.26

  let svg = `<svg viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" width="100%" style="display:block;background:#01040a;border-radius:6px" role="img"><title>월드 지도</title><desc>항구·무인도·선박·마을 위치를 보여주는 지도. 점을 터치하면 그 자리에서 바로 행동을 고를 수 있다.</desc>`;
  svg += `<defs><marker id="seaArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="#5a9aba" stroke-width="1.5"/></marker></defs>`;

  // 지도 배경 터치 시 팝업 닫기
  svg += `<rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="transparent" onclick="closeMapPopup()"/>`;

  // 대륙 영역(흐릿하게)
  Object.entries(WORLD_MAP_ZONES).forEach(([key,z])=>{
    const hasPort = ports.some(p=>p.continent===key);
    if(!hasPort) return;
    svg += `<ellipse cx="${z.cx}" cy="${z.cy}" rx="${z.rx}" ry="${z.ry}" fill="#0a1a10" stroke="#1a3020" stroke-width="${1*k}" opacity="0.5" pointer-events="none"/>`;
  });

  // 무인도 표시 — 터치 가능
  ISLAND_DEFS.forEach(isl=>{
    const visited = (ship.visitedIslands||[]).includes(isl.id);
    const isOpen = popup && popup.kind==='island' && popup.id===isl.id;
    svg += `<g style="cursor:pointer" onclick="event.stopPropagation();openMapPopup('island','${isl.id}',${isl.x},${isl.y})">
      <circle cx="${isl.x}" cy="${isl.y}" r="${9*k}" fill="transparent"/>
      <text x="${isl.x}" y="${isl.y}" font-size="${(isOpen?13:11)*k}" text-anchor="middle" opacity="${visited?0.5:0.9}">${isl.icon}</text>
    </g>`;
  });

  // NPC 선박 표시 — 가까이 있는 것만 터치 가능
  if(typeof loadNpcShips==='function'){
    const nearbyList = ship.atSea ? (getNearbyNpcShips(ship,210)||[]) : [];
    const nearbyIds = new Set(nearbyList.map(n=>n.npc.id));
    loadNpcShips().forEach(npc=>{
      const c = getNpcShipCoord(npc);
      const isNear = nearbyIds.has(npc.id);
      const isOpen = popup && popup.kind==='npc' && popup.id===npc.id;
      svg += `<g style="${isNear?'cursor:pointer':''}" ${isNear?`onclick="event.stopPropagation();openMapPopup('npc','${npc.id}',${c.x},${c.y})"`:''}>
        <circle cx="${c.x}" cy="${c.y}" r="${8*k}" fill="transparent"/>
        <text x="${c.x}" y="${c.y}" font-size="${(isOpen?11:9)*k}" text-anchor="middle" opacity="${isNear?1:0.3}">${npc.icon}</text>
      </g>`;
    });
  }

  // 현재 항해 중이면 항로(곡선) 그리기 — 실제 보간 좌표(curX,curY) 사용
  if(ship.atSea && ship.voyageTarget && ship.fromCoord && ship.toCoord){
    const from = ship.fromCoord, to = ship.toCoord;
    const mx = (from.x+to.x)/2, my = (from.y+to.y)/2 - 95;
    svg += `<path d="M${from.x} ${from.y} Q${mx} ${my} ${to.x} ${to.y}" fill="none" stroke="#3a8aaa" stroke-width="${1*k}" stroke-dasharray="${3*k},${3*k}" pointer-events="none"/>`;
    const tier = SHIP_TIERS.find(t=>t.id===ship.tierId);
    const px = ship.curX!==undefined ? ship.curX : from.x;
    const py = ship.curY!==undefined ? ship.curY : from.y;
    svg += `<text x="${px}" y="${py}" font-size="${13*k}" text-anchor="middle" pointer-events="none">${tier.icon}</text>`;
  }

  // 항구 점 표시 — 터치하면 그 자리에서 출항/약탈 팝업
  ports.forEach(p=>{
    const c = coords[p.name];
    const isCurrent = !ship.atSea && p.name===ship.currentPort;
    const isOpen = popup && popup.kind==='port' && popup.id===p.name;
    const color = isCurrent ? '#c0a030' : isOpen ? '#6aca6a' : '#5a9aba';
    svg += `<g style="cursor:pointer" onclick="event.stopPropagation();openMapPopup('port','${esc(p.name).replace(/'/g,"\\'")}',${c.x},${c.y})">
      <circle cx="${c.x}" cy="${c.y}" r="${(isCurrent||isOpen?6:4)*k}" fill="${color}" opacity="0.9"/>
      ${isCurrent?`<circle cx="${c.x}" cy="${c.y}" r="${9*k}" fill="none" stroke="${color}" stroke-width="${1*k}"/>`:''}
      <text x="${c.x}" y="${c.y-9*k}" font-size="${8*k}" fill="${color}" text-anchor="middle">${p.icon}</text>
    </g>`;
  });

  // ── 터치 팝업 (말풍선) — 클릭한 점 바로 위에 행동 버튼을 띄운다 ──
  if(popup){
    svg += renderMapPopupSVG(popup, ship, k, vb);
  }

  svg += `</svg>`;
  return svg;
}
window.renderSeaMapSVG = renderSeaMapSVG;

export function renderMapPopupSVG(popup, ship, k, vb){
  k = k||1; vb = vb||{x:0,y:0,w:380,h:360};
  const px = popup.x, py = popup.y;
  let title = '', rows = [];

  if(popup.kind==='port'){
    const port = getPortLocations().find(p=>p.name===popup.id);
    if(!port) return '';
    title = `${port.icon} ${port.name}`;
    if(ship.atSea){
      rows.push({ label:'항해 중에는 조작할 수 없음', action:null, color:'#888' });
    } else if(port.name===ship.currentPort){
      rows.push({ label:'🏴‍☠️ 이 항구 약탈', action:`attemptPlunderPort()`, color:'#e08080' });
    } else {
      rows.push({ label:'⛵ 이곳으로 출항', action:`startVoyage('${esc(port.name).replace(/'/g,"\\'")}')`, color:'#5a9aba' });
    }
  } else if(popup.kind==='island'){
    const isl = ISLAND_DEFS.find(i=>i.id===popup.id);
    if(!isl) return '';
    title = `${isl.icon} ${isl.name}`;
    const isActive = ship.activeIslandEvent===isl.id;
    if(isActive){
      rows.push({ label:'🏝️ 탐험하기', action:`exploreIsland('${isl.id}')`, color:'#6aca8a' });
      rows.push({ label:'지나치기', action:`ignoreIsland()`, color:'#888' });
    } else {
      rows.push({ label:(ship.visitedIslands||[]).includes(isl.id)?'이미 탐험한 섬':'항로가 가까워지면 발견 가능', action:null, color:'#666' });
    }
  } else if(popup.kind==='npc'){
    const npc = loadNpcShips().find(n=>n.id===popup.id);
    if(!npc) return '';
    title = `${npc.icon} ${npc.name}`;
    if(ship.atSea && !ship.activeBattle){
      rows.push({ label:'⚔️ 추격하기', action:`pursueNpcShip('${npc.id}')`, color:'#80c0a0' });
    } else {
      rows.push({ label:'지금은 추격할 수 없음', action:null, color:'#888' });
    }
  }

  const w = 130*k, rowH = 18*k, h = 26*k + rows.length*rowH;
  let bx = px - w/2, by = py - h - 14*k;
  bx = Math.max(vb.x+4*k, Math.min(vb.x+vb.w-w-4*k, bx));
  by = Math.max(vb.y+4*k, by);
  const tipX = Math.max(bx+10*k, Math.min(bx+w-10*k, px));

  let svg = `<g pointer-events="auto">
    <path d="M${bx} ${by} h${w} v${h} h-${w} z M${tipX-6*k} ${by+h} L${px} ${py-10*k} L${tipX+6*k} ${by+h} z" fill="#0a1018" stroke="#2a4a5a" stroke-width="${1*k}"/>
    <text x="${bx+w/2}" y="${by+15*k}" font-size="${9*k}" fill="#c0d0e0" text-anchor="middle" font-weight="bold">${title}</text>`;
  rows.forEach((r,i)=>{
    const ry = by+26*k+i*rowH;
    svg += `<g ${r.action?`style="cursor:pointer" onclick="event.stopPropagation();${r.action};closeMapPopup()"`:''}>
      <rect x="${bx+6*k}" y="${ry-11*k}" width="${w-12*k}" height="${15*k}" fill="${r.action?'#0a1a22':'transparent'}" rx="${2*k}"/>
      <text x="${bx+w/2}" y="${ry}" font-size="${8*k}" fill="${r.color}" text-anchor="middle">${r.label}</text>
    </g>`;
  });
  svg += `<g style="cursor:pointer" onclick="event.stopPropagation();closeMapPopup()"><circle cx="${bx+w-8*k}" cy="${by+8*k}" r="${6*k}" fill="#1a1010"/><text x="${bx+w-8*k}" y="${by+11*k}" font-size="${8*k}" fill="#c08080" text-anchor="middle">✕</text></g>`;
  svg += `</g>`;
  return svg;
}
window.renderMapPopupSVG = renderMapPopupSVG;

export function openMapPopup(kind, id, x, y){
  S._mapPopup = { kind, id, x, y };
  renderVoyagePanel();
}
window.openMapPopup = openMapPopup;

export function closeMapPopup(){
  S._mapPopup = null;
  renderVoyagePanel();
}
window.closeMapPopup = closeMapPopup;

window.openMapPopup = openMapPopup;

window.closeMapPopup = closeMapPopup;

export function buyShip(tierId){
  const tier = SHIP_TIERS.find(t=>t.id===tierId); if(!tier) return;
  const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  if(!loc || !loc.coastal){ toast('⚓ 항구가 있는 해안 지역에서만 선박을 구매할 수 있습니다.'); return; }
  const fleet = loadFleet();
  if(fleet.length >= MAX_FLEET_SIZE){ toast(`⚓ 함대는 최대 ${MAX_FLEET_SIZE}척까지 보유할 수 있습니다.`); return; }
  if((S.gold||0) < tier.price){ toast(`골드 부족 (${tier.price}G 필요)`); return; }
  S.gold -= tier.price; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  const newShip = {
    id: 'ship_'+Date.now(), tierId: tier.id, name: tier.name+(fleet.length>0?' '+(fleet.length+1)+'호':''),
    durability: tier.durability, maxDurability: tier.durability,
    cargo: [], crew: [], homePort: loc.name, currentPort: loc.name,
    atSea: false, voyageTarget: null, voyageTurnsLeft: 0, totalVoyages: 0,
  };
  saveShip(newShip); // saveShip이 신규 id면 함대에 추가하고 자동 탑승 처리
  toast(`${newShip.name}을(를) 구매했습니다! ${loc.name}에 정박 중입니다. (함대 ${fleet.length+1}/${MAX_FLEET_SIZE}척)`, 4000, tier);
  renderVoyagePanel();
}
window.buyShip = buyShip;

export function switchActiveShip(shipId){
  const fleet = loadFleet();
  const target = fleet.find(s=>s.id===shipId);
  if(!target){ toast('해당 선박을 찾을 수 없습니다.'); return; }
  if(target.atSea){ toast('항해 중인 배로는 즉시 전환할 수 없습니다.'); return; }
  setActiveShipId(shipId);
  toast(`🚢 ${target.name}에 탑승했습니다. (현재 위치: ${target.currentPort})`, 3000);
  renderVoyagePanel();
}
window.switchActiveShip = switchActiveShip;

export function sellShip(shipId){
  const fleet = loadFleet();
  const target = fleet.find(s=>s.id===shipId);
  if(!target){ toast('해당 선박을 찾을 수 없습니다.'); return; }
  if(target.atSea){ toast('항해 중인 배는 매각할 수 없습니다.'); return; }
  if(target.cargo.length>0){ toast('화물이 실려 있는 배는 매각할 수 없습니다. 화물을 먼저 처리하세요.'); return; }
  const tier = SHIP_TIERS.find(t=>t.id===target.tierId);
  const refund = Math.round(tier.price * 0.4 * (target.durability/tier.durability));
  const next = fleet.filter(s=>s.id!==shipId);
  saveFleet(next);
  if(getActiveShipId()===shipId){ setActiveShipId(next.length?next[0].id:null); }
  S.gold += refund; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  toast(`💰 ${target.name}을(를) 매각했습니다. +${refund}G (선원은 모두 하선했습니다)`, 3500);
  renderVoyagePanel();
}
window.sellShip = sellShip;

window.switchActiveShip = switchActiveShip;

window.sellShip = sellShip;

window.loadFleet = loadFleet;

export function repairShip(){
  const ship = loadShip(); if(!ship) return;
  const tier = SHIP_TIERS.find(t=>t.id===ship.tierId);
  const maxDur = getShipMaxDurability(ship);
  const missing = maxDur - ship.durability;
  if(missing<=0){ toast('이미 선체가 온전합니다.'); return; }
  const cost = Math.ceil(missing * 2);
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요, 손상 ${missing})`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  ship.durability = maxDur;
  saveShip(ship);
  toast(`🔨 선체를 완전히 수리했습니다. (-${cost}G)`, 3000);
  renderVoyagePanel();
}
window.repairShip = repairShip;

export function getUpgradeCost(part, currentLevel){
  const base = SHIP_UPGRADE_BASE_COST[part];
  return Math.round(base * Math.pow(1.8, currentLevel));
}
window.getUpgradeCost = getUpgradeCost;

export function getShipEffectiveStats(ship){
  const tier = SHIP_TIERS.find(t=>t.id===ship.tierId);
  const upg = ship.upgrades || {};
  let durability = tier.durability, speed = tier.speed, combat = tier.combat, cargo = tier.cargo;
  Object.entries(SHIP_UPGRADE_DEFS).forEach(([part, def])=>{
    const lvl = upg[part]||0;
    const mult = 1 + (def.perLevel[lvl]||0);
    if(def.stat==='durability') durability = Math.round(tier.durability*mult);
    if(def.stat==='speed') speed = +(tier.speed*mult).toFixed(2);
    if(def.stat==='combat') combat = Math.round(tier.combat*mult);
    if(def.stat==='cargo') cargo = Math.round(tier.cargo*mult);
  });
  // 선원 역할 보너스 (포수=전투, 항해사=속도, 갑판장=충성도 — 충성도는 별도 처리)
  const gunners = (ship.crew||[]).filter(c=>c.role==='gunner').length;
  const navigators = (ship.crew||[]).filter(c=>c.role==='navigator').length;
  combat += gunners*4;
  speed = +(speed + navigators*0.15).toFixed(2);
  return { durability, speed, combat, cargo, tier };
}
window.getShipEffectiveStats = getShipEffectiveStats;

export function getShipMaxDurability(ship){ return getShipEffectiveStats(ship).durability; }
window.getShipMaxDurability = getShipMaxDurability;

window.getShipEffectiveStats = getShipEffectiveStats;

window.getShipMaxDurability = getShipMaxDurability;

window.getUpgradeCost = getUpgradeCost;

export function upgradeShipPart(part){
  const ship = loadShip(); if(!ship){ toast('먼저 선박을 구매해야 합니다.'); return; }
  if(ship.atSea){ toast('항해 중에는 개조할 수 없습니다.'); return; }
  const def = SHIP_UPGRADE_DEFS[part]; if(!def) return;
  if(!ship.upgrades) ship.upgrades = {};
  const curLevel = ship.upgrades[part]||0;
  if(curLevel >= 3){ toast('이미 최대 단계입니다.'); return; }
  const cost = getUpgradeCost(part, curLevel);
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  ship.upgrades[part] = curLevel+1;
  // 내구도 보강 시 현재 내구도도 비례해서 증가(다친 채로 보강해도 비율 유지)
  if(part==='hull'){
    const oldMax = getShipMaxDurability({...ship, upgrades:{...ship.upgrades, hull:curLevel}});
    const newMax = getShipMaxDurability(ship);
    ship.durability = Math.min(newMax, ship.durability + (newMax-oldMax));
  }
  saveShip(ship);
  toast(`${def.name} ${curLevel+1}단계 완료! (-${cost}G)`, 3500, def);
  renderVoyagePanel();
}
window.upgradeShipPart = upgradeShipPart;

window.upgradeShipPart = upgradeShipPart;

export function hireCrew(role){
  const ship = loadShip(); if(!ship){ toast('먼저 선박을 구매해야 합니다.'); return; }
  const roleDef = CREW_ROLES[role||'sailor']; if(!roleDef) return;
  const cost = Math.round((60 + ship.crew.length*25) * roleDef.upkeepMod);
  if((S.gold||0) < cost){ toast(`골드 부족 (${cost}G 필요)`); return; }
  if(ship.crew.length >= 10){ toast('이 선박에 더 태울 자리가 없습니다.'); return; }
  S.gold -= cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  ship.crew.push({ id:'crew_'+Date.now(), name:CREW_NAMES[Math.floor(Math.random()*CREW_NAMES.length)]+' '+roleDef.name, icon:roleDef.icon, role:role||'sailor', loyalty:65, upkeep:Math.round((5+Math.floor(Math.random()*4))*roleDef.upkeepMod), joinedAt:S.msgCount||0 });
  saveShip(ship);
  toastHTML(`🤝 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(roleDef,{size:14}):(roleDef.icon)} ${esc(roleDef.name)}이(가) 합류했습니다! (현재 ${esc(ship.crew.length)}명)`, 3000);
  renderVoyagePanel();
}
window.hireCrew = hireCrew;

export function loadCargoFromWarehouse(cropId, qty){
  const ship = loadShip(); if(!ship){ toast('먼저 선박을 구매해야 합니다.'); return; }
  if(ship.atSea){ toast('항해 중에는 화물을 싣거나 내릴 수 없습니다.'); return; }
  const tier = SHIP_TIERS.find(t=>t.id===ship.tierId);
  const curLoad = ship.cargo.reduce((s,c)=>s+c.qty,0);
  if(curLoad+qty > tier.cargo){ toast(`화물칸 부족 (최대 ${tier.cargo}, 현재 ${curLoad})`); return; }
  const wh = (typeof loadFarmWarehouse==='function') ? loadFarmWarehouse() : {};
  const have = wh[cropId]||0;
  if(qty>have){ toast('창고에 재고가 부족합니다.'); return; }
  wh[cropId] = have-qty;
  if(typeof saveFarmWarehouse==='function') saveFarmWarehouse(wh);
  const existing = ship.cargo.find(c=>c.cropId===cropId);
  if(existing) existing.qty += qty; else ship.cargo.push({ cropId, qty });
  saveShip(ship);
  toast(`📦 ${CROP_DEFS[cropId]?.name||cropId} ${qty}개를 선적했습니다.`, 2500);
  renderVoyagePanel();
}
window.loadCargoFromWarehouse = loadCargoFromWarehouse;

export function sellCargoHere(cropId){
  const ship = loadShip(); if(!ship) return;
  const idx = ship.cargo.findIndex(c=>c.cropId===cropId); if(idx===-1) return;
  const item = ship.cargo[idx];
  const basePrice = (typeof getCropPrice==='function') ? getCropPrice(cropId) : 10;
  // 타 대륙에서 판매하면 희소성 프리미엄 (단순화: 출항지와 다른 항구면 +40%)
  const homeContinentBonus = (ship.currentPort !== ship.homePort) ? 1.4 : 1.0;
  const total = Math.round(basePrice * item.qty * homeContinentBonus);
  ship.cargo.splice(idx,1);
  saveShip(ship);
  S.gold += total; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  toast(`💰 타지에서 화물 판매! +${total}G${homeContinentBonus>1?' (원거리 교역 프리미엄)':''}`, 3500);
  if(typeof window.updateStats==='function') window.updateStats('trade_voyage_count', 1);
  renderVoyagePanel();
}
window.sellCargoHere = sellCargoHere;

export function startVoyage(destPortName){
  const ship = loadShip(); if(!ship){ toast('먼저 선박을 구매해야 합니다.'); return; }
  if(ship.atSea){ toast('이미 항해 중입니다.'); return; }
  const ports = getPortLocations();
  const dest = ports.find(p=>p.name===destPortName);
  if(!dest){ toast('알 수 없는 목적지입니다.'); return; }
  if(dest.name === ship.currentPort){ toast('이미 그 항구에 있습니다.'); return; }
  if(ship.durability < 10){ toast('⚠️ 선체 손상이 심각해 출항할 수 없습니다. 수리가 필요합니다.'); return; }
  const tier = SHIP_TIERS.find(t=>t.id===ship.tierId);
  const curLoc = ports.find(p=>p.name===ship.currentPort);
  // ── 실제 좌표 기반 거리 계산 (유클리드 거리를 턴 수로 환산) ──
  const fromCoord = curLoc ? getPortCoord(curLoc) : getPortCoord(dest);
  const toCoord = getPortCoord(dest);
  const dist = Math.hypot(toCoord.x-fromCoord.x, toCoord.y-fromCoord.y);
  const turns = Math.max(1, Math.round(dist / (95*tier.speed)));
  ship.atSea = true; ship.voyageTarget = dest.name; ship.voyageTurnsLeft = turns; ship.voyageTotalTurns = turns;
  ship.voyageStartedAt = S.msgCount||0;
  ship.fromCoord = fromCoord; ship.toCoord = toCoord;
  ship.curX = fromCoord.x; ship.curY = fromCoord.y;
  ship.visitedIslands = ship.visitedIslands || [];
  saveShip(ship);
  S._selectedVoyageDest = null;
  S._mapPopup = null;
  toastHTML(`⛵ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(dest,{size:14}):(dest.icon)} ${esc(dest.name)}을(를) 향해 출항했습니다! (예상 ${esc(turns)}턴, 거리 ${esc(Math.round(dist))})`, 4000);
  S._pendingVoyageHint = `주인공의 배가 ${dest.name}을(를) 향해 망망대해로 출항했다. 육지가 보이지 않는 바다 위에서의 항해가 시작된다.`;
  renderVoyagePanel();
}
window.startVoyage = startVoyage;

export function updateShipCoordinates(ship){
  if(!ship.fromCoord || !ship.toCoord) return;
  const total = ship.voyageTotalTurns||1;
  const progress = Math.min(1, Math.max(0, 1 - (ship.voyageTurnsLeft/total)));
  const from = ship.fromCoord, to = ship.toCoord;
  const mx = (from.x+to.x)/2, my = (from.y+to.y)/2 - 18;
  // 2차 베지어 보간
  const t = progress;
  const x = (1-t)*(1-t)*from.x + 2*(1-t)*t*mx + t*t*to.x;
  const y = (1-t)*(1-t)*from.y + 2*(1-t)*t*my + t*t*to.y;
  ship.curX = Math.round(x); ship.curY = Math.round(y);
}
window.updateShipCoordinates = updateShipCoordinates;

window.updateShipCoordinates = updateShipCoordinates;

export function getSeaWantedLevel(){
  const st = (typeof loadStats==='function') ? loadStats() : {};
  return st.sea_plunder_count||0;
}
window.getSeaWantedLevel = getSeaWantedLevel;

window.getSeaWantedLevel = getSeaWantedLevel;

export function attemptPlunderPort(){
  const ship = loadShip(); if(!ship){ toast('먼저 선박을 구매해야 합니다.'); return; }
  if(ship.atSea){ toast('항해 중에는 항구를 약탈할 수 없습니다.'); return; }
  const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  if(!loc || !loc.coastal){ toast('해안 항구에서만 약탈을 시도할 수 있습니다.'); return; }
  const karma = (S.character && S.character.karmaScore) || 50;
  if(karma < 50){ toast('🔒 카르마(악행도) 50 이상부터 항구 약탈이 가능합니다.'); return; }

  const stats = getShipEffectiveStats(ship);
  const isPirateHaven = (loc.name||'').includes('블러드워터') || (loc.triggerKeywords||[]).some(k=>k.includes('해적'));
  if(isPirateHaven){ toast('⚓ 같은 해적의 항구는 약탈할 수 없습니다.'); return; }

  const defenseRoll = 30 + Math.random()*40; // 항구 자체 방위력(추상치)
  const win = stats.combat > defenseRoll*0.6;
  if(win){
    const loot = 60 + Math.floor(Math.random()*150) + Math.round(stats.combat*1.5);
    S.gold += loot; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
    if(typeof window.updateStats==='function') window.updateStats('sea_plunder_count', 1);
    if(typeof updateReputation==='function') updateReputation(-12);
    toast(`🏴‍☠️ ${loc.name} 약탈 성공! +${loot}G (해상 악명 상승)`, 4000);
    S._pendingVoyageHint = `주인공의 선단이 ${loc.name}을(를) 습격해 약탈했다. 이 소문은 빠르게 퍼져나갈 것이고, 왕국 해군이 주목할 수 있다.`;
  } else {
    const dmg = 20+Math.floor(Math.random()*25);
    ship.durability = Math.max(0, ship.durability-dmg);
    saveShip(ship);
    toast(`⚔️ ${loc.name}의 방위대에 격퇴당했습니다! 선체 손상 -${dmg}`, 4000);
    S._pendingVoyageHint = `${loc.name} 약탈을 시도했으나 방위대의 거센 반격에 밀려 물러났다.`;
  }
  renderVoyagePanel();
}
window.attemptPlunderPort = attemptPlunderPort;

window.attemptPlunderPort = attemptPlunderPort;

export function checkNavyPursuit(){
  const wanted = getSeaWantedLevel();
  if(wanted < 5) return null; // 약탈 5회 미만이면 해군이 신경쓰지 않음
  const chance = Math.min(0.18, 0.03 * Math.floor(wanted/5));
  if(Math.random() < chance) return true;
  return null;
}
window.checkNavyPursuit = checkNavyPursuit;

window.checkNavyPursuit = checkNavyPursuit;

export function spawnEnemyShip(defId, playerCombat){
  const def = ENEMY_SHIP_DEFS.find(e=>e.id===defId) || ENEMY_SHIP_DEFS[1];
  const baseHp = 40 + Math.round(playerCombat*1.2);
  return {
    defId: def.id, name: def.name, icon: def.icon, isNavy: !!def.isNavy,
    hp: Math.round(baseHp*def.hpMult), maxHp: Math.round(baseHp*def.hpMult),
    combat: Math.round((15+playerCombat*0.6)*def.combatMult),
    lootGold: def.lootGold,
  };
}
window.spawnEnemyShip = spawnEnemyShip;

export function resolveSeaBattleRound(tactic){
  const ship = loadShip(); if(!ship || !ship.activeBattle) return;
  const battle = ship.activeBattle;
  const enemy = battle.enemy;
  const stats = getShipEffectiveStats(ship);
  const boarders = (ship.crew||[]).filter(c=>c.role!=='navigator').length; // 백병전 인원으로 환산(항해사 제외)
  let log = [];

  if(tactic==='flee'){
    const fleeChance = Math.min(0.85, 0.35 + (stats.speed-1.0)*0.3);
    if(Math.random() < fleeChance){
      log.push('💨 거리를 벌려 전투에서 완전히 이탈했다.');
      ship.activeBattle = null; ship.activeSeaEvent = null;
      saveShip(ship); renderVoyagePanel();
      toast('💨 전투 이탈에 성공했습니다!', 3000);
      return;
    } else {
      const dmg = Math.round(enemy.combat*0.5);
      ship.durability = Math.max(0, ship.durability-dmg);
      log.push(`💥 이탈에 실패하고 추격 포격을 맞았다! 선체 -${dmg}`);
    }
  } else if(tactic==='cannon'){
    // 포격전: 양측 combat 기반 교환. 화물 손상 약간의 위험.
    const playerDmg = Math.round(stats.combat*(0.8+Math.random()*0.6));
    const enemyDmg = Math.round(enemy.combat*(0.6+Math.random()*0.6));
    enemy.hp = Math.max(0, enemy.hp-playerDmg);
    ship.durability = Math.max(0, ship.durability-enemyDmg);
    log.push(`💣 포격 교환: 적선에 ${playerDmg} 피해, 아군 선체 -${enemyDmg}`);
    if(ship.cargo.length>0 && Math.random()<0.15){
      const lost = ship.cargo[0];
      ship.cargo.shift();
      log.push(`📦 포격 충격으로 화물 ${CROP_DEFS[lost.cropId]?.name||lost.cropId}이(가) 바다에 떨어졌다.`);
    }
  } else if(tactic==='board'){
    // 보딩전: 선원 수 기반 백병전. 이기면 즉시 적선 무력화(나포 가능), 지면 선원 손실 위험.
    const playerPower = stats.combat*0.5 + boarders*8;
    const enemyPower = enemy.combat*0.7;
    const win = Math.random() < playerPower/(playerPower+enemyPower);
    if(win){
      enemy.hp = 0;
      log.push('⚔️ 보딩에 성공해 적 갑판을 장악했다!');
    } else {
      ship.durability = Math.max(0, ship.durability - Math.round(enemy.combat*0.4));
      if(ship.crew.length>0 && Math.random()<0.3){
        const lostCrew = ship.crew[Math.floor(Math.random()*ship.crew.length)];
        ship.crew = ship.crew.filter(c=>c.id!==lostCrew.id);
        log.push(`💀 보딩전에서 밀려났다. 선원 ${lostCrew.name}을(를) 잃었다.`);
      } else {
        log.push('⚔️ 보딩전에서 밀려나 갑판으로 후퇴했다.');
      }
    }
  }

  if(ship.durability<=0){
    log.push('🌊 선체가 한계를 넘었다...');
  }

  battle.round = (battle.round||1)+1;
  battle.log = log;

  if(enemy.hp<=0){
    // 승리 — 나포 또는 격침/격퇴 선택지로 전환
    battle.phase = 'victory';
  } else if(ship.durability<=0){
    battle.phase = 'defeat';
  }
  ship.activeBattle = battle;
  saveShip(ship);
  S._pendingVoyageHint = `해상 전투 ${battle.round-1}라운드: ${log.join(' ')}`;
  renderVoyagePanel();
}
window.resolveSeaBattleRound = resolveSeaBattleRound;

window.resolveSeaBattleRound = resolveSeaBattleRound;

export function concludeSeaBattle(action){
  const ship = loadShip(); if(!ship || !ship.activeBattle) return;
  const battle = ship.activeBattle;
  const enemy = battle.enemy;

  if(action==='capture' && !enemy.isNavy){
    const fleet = loadFleet();
    if(fleet.length >= MAX_FLEET_SIZE){
      toast('⚓ 함대가 가득 차 나포한 선박을 보관할 수 없습니다. 대신 노획물만 챙깁니다.', 3500);
      action = 'loot';
    } else {
      const tierLike = ENEMY_SHIP_DEFS.find(e=>e.id===enemy.defId)?.tierLike || 'caravel';
      const tier = SHIP_TIERS.find(t=>t.id===tierLike);
      const capturedShip = {
        id:'ship_'+Date.now(), tierId: tier.id, name: enemy.name+' (나포)',
        durability: Math.round(tier.durability*0.5), maxDurability: tier.durability,
        cargo: [], crew: [], homePort: ship.currentPort, currentPort: ship.currentPort,
        atSea: false, voyageTarget: null, voyageTurnsLeft: 0, totalVoyages: 0, upgrades:{},
      };
      const newFleet = [...fleet, capturedShip];
      saveFleet(newFleet);
      toast(`🏴‍☠️ ${enemy.name}을(를) 나포했습니다! 함대에 합류했습니다. (절반 손상 상태)`, 4500);
      if(typeof window.updateStats==='function') window.updateStats('ships_captured', 1);
      S._pendingVoyageHint = `해상전에서 승리해 ${enemy.name}을(를) 나포했다. 절반쯤 부서진 적선이 새로운 전리품이 되었다.`;
    }
  }
  if(action==='loot'){
    const goldWon = enemy.lootGold[0]+Math.floor(Math.random()*(enemy.lootGold[1]-enemy.lootGold[0]+1));
    if(goldWon>0){
      S.gold += goldWon; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
      toast(`💰 적선을 격퇴하고 노획물 ${goldWon}G를 획득했습니다!`, 4000);
    } else {
      toast(`⚓ ${enemy.name}을(를) 격퇴했습니다.`, 3500);
    }
  }
  if(enemy.isNavy){
    // 해군 격퇴/나포 시 해상 악명 일부 경감
    const wantedLvl = (typeof getSeaWantedLevel==='function') ? getSeaWantedLevel() : 0;
    if(wantedLvl>0 && typeof updateReputation==='function') updateReputation(5);
    S._pendingVoyageHint = '추격해온 왕국 해군을 따돌렸다. 당분간은 안전하다.';
  }
  if(typeof window.updateStats==='function') window.updateStats('sea_battle_wins', 1);
  ship.activeBattle = null; ship.activeSeaEvent = null;
  saveShip(ship);
  renderVoyagePanel();
}
window.concludeSeaBattle = concludeSeaBattle;

window.concludeSeaBattle = concludeSeaBattle;

export function fleeAfterDefeat(){
  const ship = loadShip(); if(!ship || !ship.activeBattle) return;
  toast('🌊 패배하여 간신히 도주했습니다. 선체가 심각하게 손상된 상태입니다.', 4000);
  S._pendingVoyageHint = '해상 전투에서 패배해 간신히 목숨만 건져 도주했다. 배는 만신창이가 되었다.';
  ship.activeBattle = null; ship.activeSeaEvent = null;
  saveShip(ship);
  renderVoyagePanel();
}
window.fleeAfterDefeat = fleeAfterDefeat;

window.fleeAfterDefeat = fleeAfterDefeat;

export function resolveSeaEvent(choice){
  const ship = loadShip(); if(!ship || !ship.activeSeaEvent) return;
  const ev = ship.activeSeaEvent;
  const stats = getShipEffectiveStats(ship);
  const combatStat = stats.combat;

  if(ev.id==='sea_pirate' || ev.id==='sea_navy'){
    if(choice==='fight'){
      // 다단계 전투 시작
      const enemyDefId = ev.id==='sea_navy' ? 'navy_frigate' : (Math.random()<0.6?'corsair':(Math.random()<0.5?'smuggler':'warship'));
      ship.activeBattle = { round:1, phase:'ongoing', enemy: spawnEnemyShip(enemyDefId, combatStat), log:[] };
      saveShip(ship);
      S._pendingVoyageHint = `${ship.activeBattle.enemy.name}과(와)의 해상 전투가 시작되었다. 포격전으로 거리를 벌릴지, 단숨에 접근해 보딩전을 벌일지 선택의 순간이다.`;
      renderVoyagePanel();
      return; // 전투 UI로 전환, activeSeaEvent는 전투 종료 후 정리
    } else if(choice==='flee'){
      const success = Math.random() < Math.min(0.85, 0.35+(stats.speed-1.0)*0.3);
      if(success){ toast('💨 상대를 따돌렸습니다!', 3000); }
      else { const dmg=10+Math.floor(Math.random()*10); ship.durability=Math.max(0,ship.durability-dmg); toast(`💥 도주 실패! 선체 손상 -${dmg}`,3500); }
    } else if(choice==='pay'){
      const tribute = Math.min(S.gold||0, 50+Math.floor(Math.random()*80));
      S.gold -= tribute; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
      toast(`💰 통행세 ${tribute}G를 지불하고 무사히 지나갔습니다.`, 3000);
    }
  } else if(ev.id==='sea_storm'){
    const dmg = 10+Math.floor(Math.random()*25);
    ship.durability = Math.max(0, ship.durability-dmg);
    toast(`⛈️ 폭풍을 뚫고 나아갔습니다. 선체 손상 -${dmg}`, 3500);
    S._pendingVoyageHint = '거센 폭풍 속에서 선원들과 함께 사투를 벌이며 항해를 이어갔다.';
  } else if(ev.id==='sea_calm'){
    if(Math.random()<0.3){
      const found = 20+Math.floor(Math.random()*40);
      S.gold += found; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
      toast(`🌊 표류 중 바다에서 무언가를 건져올렸습니다! +${found}G`, 3000);
    } else {
      toast('🌊 표류로 항해가 하루 더 지연됩니다.', 2500);
      ship.voyageTurnsLeft += 1;
    }
  } else if(ev.id==='sea_merchant'){
    if(choice==='trade' && ship.cargo.length>0){
      const item = ship.cargo[0];
      const price = Math.round((CROP_DEFS[item.cropId]?.basePrice||10) * item.qty * 1.2);
      ship.cargo.shift();
      S.gold += price; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
      toast(`⛴️ 해상에서 화물을 즉석 거래했습니다! +${price}G`, 3000);
    } else {
      toast('⛴️ 우호적으로 인사를 나누고 각자의 길을 갔습니다.', 2500);
    }
  } else if(ev.id==='sea_monster'){
    const win = Math.random() < Math.min(0.7, 0.25 + combatStat/120);
    if(win){
      toast('🐙 해양 괴물을 물리쳤습니다! 전설로 남을 무용담입니다.', 4000);
      if(typeof updateReputation==='function') updateReputation(15);
      S._pendingVoyageHint = '심해에서 솟아오른 거대한 괴물과의 사투 끝에 승리했다. 이 이야기는 항구마다 퍼질 것이다.';
    } else {
      const dmg = 30+Math.floor(Math.random()*30);
      ship.durability = Math.max(0, ship.durability-dmg);
      toast(`🐙 해양 괴물의 공격으로 선체가 크게 파손되었습니다! -${dmg}`, 4000);
      S._pendingVoyageHint = '거대한 해양 괴물에게 일방적으로 당하며 간신히 도주했다.';
    }
  }
  ship.activeSeaEvent = null;
  saveShip(ship);
  renderVoyagePanel();
}
window.resolveSeaEvent = resolveSeaEvent;

export function tickVoyage(){
  const fleet = loadFleet();
  if(!fleet.length) return;
  const activeId = getActiveShipId();
  let fleetChanged = false;
  let sunkAny = false;

  // 함대의 모든 배를 순회 — 탑승 중인 배뿐 아니라 다른 배가 항해 중이면 그것도 진행시킨다.
  const survivors = [];
  fleet.forEach(ship=>{
    // 선원 유지비 — 정박 중인 배도 최소한의 정박비는 들지만, 단순화를 위해
    // 항해 중이거나 탑승 중인 배만 유지비를 징수한다(보관 중인 배는 비용 없음).
    const isRelevant = ship.atSea || ship.id===activeId;
    if(isRelevant && ship.crew.length>0){
      const upkeep = ship.crew.reduce((s,c)=>s+c.upkeep,0);
      if((S.gold||0) >= upkeep){
        S.gold -= upkeep; if(typeof saveGold==='function') saveGold(S.gold);
        ship.crew.forEach(c=>{ c.loyalty = Math.min(100, c.loyalty+1); });
      } else {
        const hasBosun = ship.crew.some(c=>c.role==='bosun');
        const decay = hasBosun ? 8 : 15;
        ship.crew.forEach(c=>{ c.loyalty = Math.max(0, c.loyalty-decay); });
        const deserter = ship.crew.find(c=>c.loyalty<=0);
        if(deserter){
          ship.crew = ship.crew.filter(c=>c.id!==deserter.id);
          if(ship.id===activeId) toast(`💸 선원 ${deserter.name}이 임금 미지급으로 다음 항구에서 떠났습니다.`, 3000);
          fleetChanged = true;
        }
      }
    }

    if(ship.atSea){
      if(ship.durability<=0){
        // 침몰 처리 — 함대에서 제거
        if(ship.id===activeId){
          toast('🌊 선체가 한계를 넘어 파손되어 침몰했습니다... 화물을 모두 잃었습니다.', 5000);
          S._pendingVoyageHint = '항해 중 배가 침몰했다. 가까스로 목숨만 건져 표류하다 해안으로 떠밀려왔다.'+(ship.cargo.length>0?' 싣고 있던 화물도 모두 바다에 가라앉았다.':'');
        } else {
          toast(`🌊 함대의 ${ship.name}이(가) 침몰했습니다...`, 4000);
        }
        if(typeof updateReputation==='function') updateReputation(-10);
        sunkAny = true; fleetChanged = true;
        return; // survivors에 포함하지 않음 = 함대에서 제거
      }
      if(!ship.activeSeaEvent){
        ship.voyageTurnsLeft--;
        // ── 실제 좌표 보간: 출발항→도착항 사이를 매 턴 실제 (x,y)로 이동 ──
        if(typeof updateShipCoordinates==='function') updateShipCoordinates(ship);
        // ── 무인도 발견 체크: 현재 좌표 근처에 섬이 있으면 발견 가능 ──
        if(ship.id===activeId && !ship.activeIslandEvent && typeof getNearbyIsland==='function'){
          const nearby = getNearbyIsland(ship.curX, ship.curY, 116);
          if(nearby && !(ship.visitedIslands||[]).includes(nearby.id) && Math.random()<0.4){
            ship.activeIslandEvent = nearby.id;
            S._mapPopup = { kind:'island', id:nearby.id, x:nearby.x, y:nearby.y };
            toastHTML(`🏝️ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(nearby,{size:14}):(nearby.icon)} ${esc(nearby.name)}을(를) 발견했습니다! 지도에서 섬을 눌러 탐험 여부를 선택하세요.`, 4500);
            S._pendingVoyageHint = `항해 중 ${nearby.name}이(가) 시야에 들어왔다. ${nearby.desc}`;
          }
        }
        if(ship.voyageTurnsLeft<=0){
          ship.atSea = false; ship.currentPort = ship.voyageTarget; ship.voyageTarget = null;
          ship.totalVoyages = (ship.totalVoyages||0)+1;
          if(typeof window.updateStats==='function') window.updateStats('voyage_count', 1);
          if(ship.id===activeId){
            toast(`⚓ ${ship.currentPort}에 무사히 도착했습니다!`, 4000);
            S._pendingVoyageHint = `배가 ${ship.currentPort} 항구에 입항했다. 긴 항해 끝에 육지를 밟는 안도감이 있다.`;
          } else {
            toast(`⚓ 함대의 ${ship.name}이(가) ${ship.currentPort}에 입항했습니다.`, 3000);
          }
          fleetChanged = true;
        } else if(Math.random() < 0.25){
          const totalWeight = SEA_EVENT_POOL.reduce((s,e)=>s+e.weight,0);
          let roll = Math.random()*totalWeight;
          let picked = SEA_EVENT_POOL[0];
          for(const e of SEA_EVENT_POOL){ if(roll<e.weight){ picked=e; break; } roll-=e.weight; }
          ship.activeSeaEvent = { id:picked.id, icon:picked.icon, name:picked.name, desc:picked.desc };
          if(ship.id===activeId){
            toast(`${picked.name} 발생! 항해 패널에서 대응을 선택하세요.`, 4000, picked);
            S._pendingVoyageHint = `항해 중 ${picked.desc}`;
          } else {
            // 탑승하지 않은 배는 선장(NPC 선원장)이 자동으로 안전한 선택을 한다.
            ship.activeSeaEvent = null;
            const dmg = picked.id==='sea_storm' ? 10+Math.floor(Math.random()*15) : picked.id==='sea_monster' ? 15+Math.floor(Math.random()*20) : 0;
            if(dmg>0) ship.durability = Math.max(0, ship.durability-dmg);
            toast(`${picked.icon} 함대의 ${ship.name}이(가) 항해 중 ${picked.name}을(를) 자동으로 헤쳐나갔습니다.${dmg>0?` (내구도 -${dmg})`:''}`, 3000);
          }
        } else if(ship.id===activeId && typeof checkNavyPursuit==='function' && checkNavyPursuit()){
          // 해상 악명이 쌓이면 왕국 해군이 추격해온다 (육상 현상금사냥꾼과 평행 구조)
          ship.activeSeaEvent = { id:'sea_navy', icon:'⚓', name:'왕국 해군', desc:'해상에서의 약탈 행위를 추적해온 왕국 해군 호위함이 진로를 막아선다. 항복하거나, 싸우거나, 도주를 시도할 수 있다.' };
          toast('⚓ 왕국 해군이 당신의 선단을 발견했습니다! 추격이 시작됩니다.', 4500);
          S._pendingVoyageHint = '해상에서 쌓아온 악명을 추적해온 왕국 해군 호위함이 나타났다. 긴박한 추격전이나 전투가 펼쳐질 수 있다.';
        }
      }
      fleetChanged = true;
    }
    survivors.push(ship);
  });

  if(fleetChanged){
    saveFleet(survivors);
    if(sunkAny && !survivors.find(s=>s.id===activeId)){
      setActiveShipId(survivors.length ? survivors[0].id : null);
    }
  }
}
window.tickVoyage = tickVoyage;

window._tickVoyage = tickVoyage;

export const NPC_SHIPS_KEY = 'tf-npc-ships';

export const MAX_NPC_SHIPS = 6;

export function loadNpcShips(){ try{ const r=JSON.parse(lsGet(NPC_SHIPS_KEY)||'[]'); return Array.isArray(r)?r:[]; }catch(e){ return []; } }
window.loadNpcShips = loadNpcShips;

export function saveNpcShips(d){ try{ lsSet(NPC_SHIPS_KEY, JSON.stringify(d)); }catch(e){} }
window.saveNpcShips = saveNpcShips;

export function spawnNpcShip(){
  const ports = getPortLocations();
  if(ports.length<2) return null;
  const a = ports[Math.floor(Math.random()*ports.length)];
  let b = ports[Math.floor(Math.random()*ports.length)];
  let guard=0; while(b.name===a.name && guard++<10){ b = ports[Math.floor(Math.random()*ports.length)]; }
  const totalWeight = NPC_SHIP_KINDS.reduce((s,k)=>s+k.weight,0);
  let roll = Math.random()*totalWeight, picked = NPC_SHIP_KINDS[0];
  for(const k of NPC_SHIP_KINDS){ if(roll<k.weight){ picked=k; break; } roll-=k.weight; }
  const from = getPortCoord(a), to = getPortCoord(b);
  const hp = 30+Math.floor(Math.random()*40);
  return {
    id:'npc_'+Date.now()+'_'+Math.floor(Math.random()*1000),
    kind: picked.kind, icon: picked.icon, name: picked.name,
    fromCoord: from, toCoord: to, progress: Math.random()*0.6,
    speed: 0.04+Math.random()*0.03,
    combat: picked.combat[0]+Math.floor(Math.random()*(picked.combat[1]-picked.combat[0]+1)),
    cargoValue: picked.cargoValue[0]+Math.floor(Math.random()*(picked.cargoValue[1]-picked.cargoValue[0]+1)),
    hp: hp, maxHp: hp,
  };
}
window.spawnNpcShip = spawnNpcShip;

export function tickNpcShips(){
  let ships = loadNpcShips();
  ships.forEach(s=>{ s.progress = Math.min(1, s.progress+s.speed); });
  ships = ships.filter(s=>s.progress<1);
  while(ships.length < MAX_NPC_SHIPS){
    const ns = spawnNpcShip();
    if(!ns) break;
    ships.push(ns);
  }
  saveNpcShips(ships);
}
window.tickNpcShips = tickNpcShips;

window.tickNpcShips = tickNpcShips;

export function getNpcShipCoord(npc){
  const from=npc.fromCoord, to=npc.toCoord, t=npc.progress;
  const mx=(from.x+to.x)/2, my=(from.y+to.y)/2-15;
  const x=(1-t)*(1-t)*from.x+2*(1-t)*t*mx+t*t*to.x;
  const y=(1-t)*(1-t)*from.y+2*(1-t)*t*my+t*t*to.y;
  return { x:Math.round(x), y:Math.round(y) };
}
window.getNpcShipCoord = getNpcShipCoord;

window.getNpcShipCoord = getNpcShipCoord;

export function getNearbyNpcShips(ship, radius){
  if(ship.curX===undefined) return [];
  return loadNpcShips().map(npc=>({ npc, coord:getNpcShipCoord(npc) }))
    .filter(({coord})=>Math.hypot(coord.x-ship.curX, coord.y-ship.curY)<=radius);
}
window.getNearbyNpcShips = getNearbyNpcShips;

window.getNearbyNpcShips = getNearbyNpcShips;

export function pursueNpcShip(npcId){
  const ship = loadShip(); if(!ship || !ship.atSea){ toast('항해 중일 때만 다른 배를 추격할 수 있습니다.'); return; }
  const npcs = loadNpcShips();
  const npc = npcs.find(n=>n.id===npcId); if(!npc){ toast('대상을 찾을 수 없습니다.'); return; }
  const stats = getShipEffectiveStats(ship);
  const catchChance = Math.min(0.9, 0.4 + (stats.speed-1.2)*0.3);
  if(Math.random() > catchChance){
    toastHTML(`💨 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(npc,{size:14}):(npc.icon)} ${esc(npc.name)}이(가) 더 빨라 따라잡지 못했습니다.`, 3500);
    return;
  }
  ship.activeBattle = {
    round:1, phase:'ongoing',
    enemy: { defId: npc.kind==='navy'?'navy_frigate':(npc.kind==='pirate'?'corsair':'smuggler'),
             name: npc.name, icon: npc.icon, isNavy: npc.kind==='navy',
             hp: npc.hp, maxHp: npc.maxHp, combat: npc.combat,
             lootGold: [Math.round(npc.cargoValue*0.6), npc.cargoValue] },
    log:[],
  };
  saveNpcShips(npcs.filter(n=>n.id!==npcId));
  saveShip(ship);
  toastHTML(`⚔️ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(npc,{size:14}):(npc.icon)} ${esc(npc.name)}을(를) 따라잡아 전투를 시작합니다!`, 4000);
  S._pendingVoyageHint = `바다 위에서 ${npc.name}을(를) 발견하고 직접 추격해 따라잡았다. 곧 전투가 벌어진다.`;
  renderVoyagePanel();
}
window.pursueNpcShip = pursueNpcShip;

window.pursueNpcShip = pursueNpcShip;

export function getVoyageSection(){
  const ship = loadShip();
  const fleet = loadFleet();
  if(!ship && !S._pendingVoyageHint) return '';
  let lines=[];
  if(ship){
    const stats = getShipEffectiveStats(ship);
    const fleetNote = fleet.length>1 ? ` (보유 함대 ${fleet.length}척 중 현재 탑승함)` : '';
    if(ship.activeBattle){
      const b = ship.activeBattle;
      lines.push(`[⚔️ 해상 전투 진행 중] ${b.enemy.icon}${b.enemy.name}과(와) ${b.round}라운드째 교전 중 (적선 내구도 ${b.enemy.hp}/${b.enemy.maxHp}, 아군 선체 ${ship.durability}/${stats.durability}). 포격과 보딩이 오가는 입체적인 해상 전투 장면으로 묘사하라.`);
    } else if(ship.atSea){
      lines.push(`[⛵ 항해 중] ${stats.tier.icon}${stats.tier.name}으로 ${ship.voyageTarget}을(를) 향해 항해 중${fleetNote} (잔여 ${ship.voyageTurnsLeft}턴, 선체 내구도 ${ship.durability}/${stats.durability}). 육지가 보이지 않는 망망대해 묘사가 어울린다.`);
      if(ship.activeSeaEvent) lines.push(`[🌊 해상 이벤트 발생] ${ship.activeSeaEvent.desc} 이 사건을 서사에 긴박하게 반영하라.`);
      if(ship.activeIslandEvent){
        const isl = ISLAND_DEFS.find(i=>i.id===ship.activeIslandEvent);
        if(isl) lines.push(`[🏝️ 무인도 발견] ${isl.name}이(가) 시야에 들어왔다. ${isl.desc} 이 발견을 서사에 자연스럽게 묘사하라.`);
      }
      const nearbyNpc = (typeof getNearbyNpcShips==='function') ? getNearbyNpcShips(ship,210) : [];
      if(nearbyNpc.length>0) lines.push(`[👁️ 근처 선박 발견] 수평선 너머로 ${nearbyNpc.map(n=>n.npc.name).join(', ')}이(가) 보인다. 발견했다는 사실만 묘사하고, 추격 여부는 플레이어의 선택에 맡겨라.`);
    } else {
      lines.push(`[⚓ 정박 중] ${stats.tier.icon}${stats.tier.name}이 ${ship.currentPort}에 정박해 있다${fleetNote}. 선원 ${ship.crew.length}명, 화물 ${ship.cargo.reduce((s,c)=>s+c.qty,0)}개 적재. 전투력 ${stats.combat}.`);
    }
    const wanted = (typeof getSeaWantedLevel==='function') ? getSeaWantedLevel() : 0;
    if(wanted>=5) lines.push(`[🏴‍☠️ 해상 악명] 약탈 ${wanted}회로 왕국 해군이 주시하고 있다. 항해 중 해군의 추격이 등장할 수 있다.`);
  }
  if(S._pendingVoyageHint){ lines.push(`[📜 항해 사건] ${S._pendingVoyageHint}`); S._pendingVoyageHint=null; }
  return lines.length ? '\n'+lines.join('\n') : '';
}
window.getVoyageSection = getVoyageSection;

window.getVoyageSection = getVoyageSection;

export function renderVoyagePanel(){
  const body = document.getElementById('pb-voyage'); if(!body) return;
  const ship = loadShip();
  const fleet = loadFleet();
  const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;

  let html = `<div style="padding:8px 12px;background:#020a14;border-bottom:1px solid #0a2a3a;font-size:9px;color:#5a9aba;line-height:1.6">⛵ 항해 — 누구나 배를 사서 바다를 누빌 수 있다. 해적은 약탈에, 상인은 원거리 교역에, 모험가는 섬 탐험에 쓸 수 있다. 함대는 최대 ${MAX_FLEET_SIZE}척까지 동시 보유 가능.</div>`;

  // 함대 목록 (2척 이상일 때만 표시 — 1척이면 아래 단일 선박 패널이 곧 그 배)
  if(fleet.length>1){
    html += `<div style="padding:10px 12px;border-bottom:2px solid #0a2a3a;background:#010608">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#5a9aba;margin-bottom:6px">🗺️ 내 함대 (${fleet.length}/${MAX_FLEET_SIZE}척)</div>
      ${fleet.map(s=>{
        const t = SHIP_TIERS.find(x=>x.id===s.tierId);
        const sStats = getShipEffectiveStats(s);
        const isActive = ship && s.id===ship.id;
        return `<div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-top:1px solid #051018;${isActive?'background:#031018':''}">
          <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(t,{size:14}):(t.icon)}</span>
          <div style="flex:1">
            <div style="font-size:9px;color:${isActive?'#5a9aba':'var(--text)'}">${esc(s.name)} ${isActive?'<span style="color:#c0a030">[탑승중]</span>':''}</div>
            <div style="font-size:7px;color:var(--dim)">${s.atSea?'🌊 항해중 → '+s.voyageTarget:'⚓ '+s.currentPort} · 내구 ${s.durability}/${sStats.durability}</div>
          </div>
          ${!isActive&&!s.atSea?`<button onclick="switchActiveShip('${s.id}')" style="padding:3px 7px;background:#020a14;border:1px solid #0a4a6a;color:#5a9aba;font-size:7px;cursor:pointer">탑승</button>`:''}
          ${!isActive&&!s.atSea&&s.cargo.length===0?`<button onclick="sellShip('${s.id}')" style="padding:3px 7px;background:#150505;border:1px solid #6a2a2a;color:#e08080;font-size:7px;cursor:pointer">매각</button>`:''}
        </div>`;
      }).join('')}
    </div>`;
  }

  if(!ship){
    if(!loc || !loc.coastal){
      html += `<div style="padding:20px 12px;text-align:center;color:var(--dim);font-size:10px">해안 지역(항구)에서만 선박을 구매할 수 있습니다.</div>`;
    } else {
      html += `<div style="padding:10px 12px"><div style="font-family:Cinzel,serif;font-size:10px;color:#5a9aba;margin-bottom:8px">⚓ ${loc.name}에서 선박 구매</div>`;
      SHIP_TIERS.forEach(t=>{
        html += `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid #051520">
          <span style="color:#5a9aba;display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(t,{size:16}):(t.svgIcon||t.icon)}</span>
          <div style="flex:1"><div style="font-size:10px;color:var(--text)">${t.name}</div>
          <div style="font-size:8px;color:var(--dim)">${esc(t.desc)} · 내구${t.durability} 화물${t.cargo} 전투${t.combat}</div></div>
          <button onclick="buyShip('${t.id}')" style="padding:4px 10px;background:#020a14;border:1px solid #0a4a6a;color:#5a9aba;font-size:8px;cursor:pointer">${t.price}G</button>
        </div>`;
      });
      html += `</div>`;
    }
    body.innerHTML = html;
    return;
  }

  const tier = SHIP_TIERS.find(t=>t.id===ship.tierId);
  const stats = getShipEffectiveStats(ship);

  // 정박 중이고 항구에 있을 때 함대에 배 추가 구매 옵션
  if(!ship.atSea && loc && loc.coastal && fleet.length < MAX_FLEET_SIZE){
    html += `<div style="padding:8px 12px;border-bottom:1px solid #0a1a2a">
      <details>
        <summary style="font-size:9px;color:#5a9aba;cursor:pointer">⚓ ${loc.name}에서 새 선박 추가 구매 (${fleet.length}/${MAX_FLEET_SIZE})</summary>
        <div style="margin-top:6px">
        ${SHIP_TIERS.map(t=>`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px solid #051520">
          <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(t,{size:14}):(t.icon)}</span>
          <div style="flex:1;font-size:8px;color:var(--text)">${t.name}</div>
          <button onclick="buyShip('${t.id}')" style="padding:3px 8px;background:#020a14;border:1px solid #0a4a6a;color:#5a9aba;font-size:7px;cursor:pointer">${t.price}G</button>
        </div>`).join('')}
        </div>
      </details>
    </div>`;
  }

  // ── 해상 전투 UI (다단계 전투가 진행 중이면 최우선 표시) ──
  if(ship.activeBattle){
    const battle = ship.activeBattle;
    const enemy = battle.enemy;
    if(battle.phase==='victory'){
      html += `<div style="padding:12px;border-bottom:2px solid #2a6a2a;background:#020f02">
        <div style="font-family:Cinzel,serif;font-size:11px;color:#6aca6a;margin-bottom:6px">🎉 전투 승리! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(enemy,{size:11}):(enemy.icon)} ${enemy.name} 무력화</div>
        <div style="font-size:9px;color:var(--dim);margin-bottom:8px">${(battle.log||[]).join(' ')}</div>
        <div style="display:flex;gap:4px">
          ${!enemy.isNavy?`<button onclick="concludeSeaBattle('capture')" style="flex:1;padding:7px;background:#050f15;border:1px solid #2a5a6a;color:#80c0e0;font-size:8px;cursor:pointer">🏴‍☠️ 나포 (함대 합류)</button>`:''}
          <button onclick="concludeSeaBattle('loot')" style="flex:1;padding:7px;background:#0a1505;border:1px solid #2a6a2a;color:#80e080;font-size:8px;cursor:pointer">💰 ${enemy.isNavy?'격퇴':'노획'}</button>
        </div>
      </div>`;
    } else if(battle.phase==='defeat'){
      html += `<div style="padding:12px;border-bottom:2px solid #6a2a2a;background:#0f0202">
        <div style="font-family:Cinzel,serif;font-size:11px;color:#e08080;margin-bottom:6px">💀 선체 위기!</div>
        <div style="font-size:9px;color:var(--dim);margin-bottom:8px">${(battle.log||[]).join(' ')} 더 이상 버틸 수 없습니다.</div>
        <button onclick="fleeAfterDefeat()" style="width:100%;padding:7px;background:#150505;border:1px solid #6a2a2a;color:#e08080;font-size:8px;cursor:pointer">🏳️ 도주</button>
      </div>`;
    } else {
      const hpPct = Math.round(enemy.hp/enemy.maxHp*100);
      html += `<div style="padding:12px;border-bottom:2px solid #6a4a1a;background:#0f0a02">
        <div style="font-family:Cinzel,serif;font-size:11px;color:#e0a040;margin-bottom:6px">⚔️ 해상 전투 — ${battle.round}라운드</div>
        <div style="font-size:9px;color:var(--text);margin-bottom:3px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(enemy,{size:9}):(enemy.icon)} ${enemy.name} 내구도 ${enemy.hp}/${enemy.maxHp}</div>
        <div style="background:#0a0a0a;border-radius:3px;height:6px;overflow:hidden;margin-bottom:8px"><div style="width:${hpPct}%;height:100%;background:#e0a040"></div></div>
        ${battle.log&&battle.log.length?`<div style="font-size:8px;color:var(--dim);margin-bottom:8px;padding:6px;background:#020202;border-radius:3px">${battle.log.join('<br>')}</div>`:''}
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button onclick="resolveSeaBattleRound('cannon')" style="flex:1;padding:6px;background:#150a05;border:1px solid #6a4a1a;color:#e0a040;font-size:8px;cursor:pointer">💣 포격전</button>
          <button onclick="resolveSeaBattleRound('board')" style="flex:1;padding:6px;background:#150505;border:1px solid #6a2a2a;color:#e08080;font-size:8px;cursor:pointer">⚔️ 보딩전</button>
          <button onclick="resolveSeaBattleRound('flee')" style="flex:1;padding:6px;background:#0a1505;border:1px solid #2a6a2a;color:#80e080;font-size:8px;cursor:pointer">💨 이탈 시도</button>
        </div>
        <div style="font-size:7px;color:#666;margin-top:6px">포격전: 원거리 교환(화물손상 위험) · 보딩전: 백병전(선원손실 위험, 승리시 즉시무력화) · 이탈: 속도 기반 도주</div>
      </div>`;
    }
  }
  // 해상 이벤트 대응 UI (전투 중이 아닐 때만)
  else if(ship.activeSeaEvent){
    const ev = ship.activeSeaEvent;
    html += `<div style="padding:12px;border-bottom:2px solid #1a4a5a;background:#020810">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#e0a040;margin-bottom:6px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(ev,{size:10}):(ev.icon)} ${ev.name}</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:8px">${esc(ev.desc)}</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        ${(ev.id==='sea_pirate'||ev.id==='sea_navy')?`
          <button onclick="resolveSeaEvent('fight')" style="flex:1;padding:6px;background:#150505;border:1px solid #6a2a2a;color:#e08080;font-size:8px;cursor:pointer">⚔️ 전투</button>
          <button onclick="resolveSeaEvent('flee')" style="flex:1;padding:6px;background:#0a1505;border:1px solid #2a6a2a;color:#80e080;font-size:8px;cursor:pointer">💨 도주</button>
          ${ev.id==='sea_pirate'?`<button onclick="resolveSeaEvent('pay')" style="flex:1;padding:6px;background:#150f05;border:1px solid #6a5a2a;color:#e0c080;font-size:8px;cursor:pointer">💰 통행세</button>`:''}`
        :ev.id==='sea_merchant'?`
          <button onclick="resolveSeaEvent('trade')" style="flex:1;padding:6px;background:#051015;border:1px solid #2a5a6a;color:#80c0e0;font-size:8px;cursor:pointer">⛴️ 즉석 거래</button>
          <button onclick="resolveSeaEvent('ignore')" style="flex:1;padding:6px;background:#0a0a0a;border:1px solid #3a3a3a;color:#888;font-size:8px;cursor:pointer">지나치기</button>`
        :`<button onclick="resolveSeaEvent('accept')" style="flex:1;padding:6px;background:#020a14;border:1px solid #0a4a6a;color:#5a9aba;font-size:8px;cursor:pointer">계속 항해</button>`}
      </div>
    </div>`;
  }

  // 선박 현황 (실효 스탯 기준 표시)
  html += `<div style="padding:10px 12px;border-bottom:1px solid #0a1a2a">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#5a9aba;margin-bottom:6px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(tier,{size:10}):(tier.icon)} ${esc(ship.name||tier.name)}</div>
    <div style="font-size:9px;color:var(--text);margin-bottom:4px">내구도 ${ship.durability}/${stats.durability} ${ship.durability<stats.durability*0.3?'<span style="color:#e04040">⚠️ 위험</span>':''}</div>
    <div style="background:#0a0a0a;border-radius:3px;height:5px;overflow:hidden;margin-bottom:6px"><div style="width:${Math.round(ship.durability/stats.durability*100)}%;height:100%;background:${ship.durability<stats.durability*0.3?'#c04040':'#3a8aaa'}"></div></div>
    <div style="font-size:8px;color:var(--dim);margin-bottom:6px">전투력 ${stats.combat} · 속도 ${stats.speed} · 화물칸 ${stats.cargo}</div>
    ${ship.durability<stats.durability?`<button onclick="repairShip()" style="width:100%;padding:5px;background:#020a14;border:1px solid #0a4a6a;color:#5a9aba;font-size:8px;cursor:pointer;margin-bottom:6px">🔨 수리 (${Math.ceil((stats.durability-ship.durability)*2)}G)</button>`:''}
    <div style="font-size:9px;color:var(--dim)">총 항해 횟수: ${ship.totalVoyages||0} · 해상 약탈 ${(typeof loadStats==='function'?(loadStats().sea_plunder_count||0):0)}회</div>
  </div>`;

  // 선박 개조 (업그레이드)
  if(!ship.atSea){
    html += `<div style="padding:10px 12px;border-bottom:1px solid #0a1a2a">
      <details>
        <summary style="font-family:Cinzel,serif;font-size:10px;color:#5a9aba;cursor:pointer">🔧 선박 개조</summary>
        <div style="margin-top:6px">
        ${Object.entries(SHIP_UPGRADE_DEFS).map(([part,def])=>{
          const lvl = (ship.upgrades&&ship.upgrades[part])||0;
          const maxed = lvl>=3;
          const cost = maxed?0:getUpgradeCost(part, lvl);
          return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid #051520">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)}</span>
            <div style="flex:1">
              <div style="font-size:9px;color:var(--text)">${def.name} <span style="color:#5a9aba">Lv.${lvl}/3</span></div>
              <div style="font-size:7px;color:var(--dim)">${esc(def.desc)}</div>
            </div>
            ${maxed?`<span style="font-size:8px;color:#c0a030">MAX</span>`:`<button onclick="upgradeShipPart('${part}')" style="padding:3px 8px;background:#020a14;border:1px solid #0a4a6a;color:#5a9aba;font-size:7px;cursor:pointer">${cost}G</button>`}
          </div>`;
        }).join('')}
        </div>
      </details>
    </div>`;
  }

  // 출항/위치/약탈/탐험/추격 — SVG 바다지도 위에서 점을 터치하면 그 자리에서 바로 처리
  html += `<div style="padding:10px 12px;border-bottom:1px solid #0a1a2a">
    <div style="display:flex;justify-content:flex-end;margin-bottom:4px">
      <button onclick="toggleMapViewMode()" style="padding:3px 10px;background:#020a14;border:1px solid #0a4a6a;color:#5a9aba;font-size:8px;cursor:pointer;border-radius:3px">${(S._mapViewMode==='world')?'🔍 현재 위치로':'🗺️ 전체 지도'}</button>
    </div>
    ${renderSeaMapSVG(ship, S._selectedVoyageDest)}
    <div style="font-size:7px;color:#557;margin-top:4px;text-align:center">⚓항구 · 🏝️섬 · 🚤⛴️🏴‍☠️⚓다른 선박 — 지도 위 점을 터치하면 행동을 고를 수 있습니다</div>
  </div>`;

  if(ship.atSea){
    html += `<div style="padding:10px 12px;border-bottom:1px solid #0a1a2a;background:#020810">
      <div style="font-size:10px;color:#e0a040">🌊 ${ship.voyageTarget}을(를) 향해 항해 중 — 잔여 ${ship.voyageTurnsLeft}턴</div>
    </div>`;
  } else {
    html += `<div style="padding:10px 12px;border-bottom:1px solid #0a1a2a">
      <div style="font-size:10px;color:#5a9aba">⚓ 현재 정박: ${ship.currentPort}</div>
    </div>`;
  }

  // 선원 (역할 선택 가능)
  html += `<div style="padding:10px 12px;border-bottom:1px solid #0a1a2a">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#5a9aba;margin-bottom:6px">🧑‍✈️ 선원 (${ship.crew.length}/10)</div>
    ${ship.crew.map(c=>`<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:9px"><span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(c,{size:16}):(c.icon)}</span><span style="flex:1;color:var(--text)">${esc(c.name)}</span><span style="color:${c.loyalty>=50?'#6aca6a':'#e08030'}">충성${c.loyalty}</span><span style="color:#5a9aba">${c.upkeep}G/턴</span></div>`).join('')}
    ${!ship.atSea?`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">
      ${Object.entries(CREW_ROLES).map(([role,def])=>`<button onclick="hireCrew('${role}')" style="flex:1;min-width:70px;padding:5px;background:#020a14;border:1px solid #0a4a6a;color:#5a9aba;font-size:7px;cursor:pointer" title="${esc(def.desc)}">${def.icon} ${def.name}</button>`).join('')}
    </div>`:''}
  </div>`;

  // 화물
  html += `<div style="padding:10px 12px">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#5a9aba;margin-bottom:6px">📦 화물칸 (${ship.cargo.reduce((s,c)=>s+c.qty,0)}/${stats.cargo})</div>
    ${ship.cargo.length?ship.cargo.map(c=>`<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:9px"><span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(CROP_DEFS[c.cropId],{size:14}):(CROP_DEFS[c.cropId]?.icon||'📦')}</span><span style="flex:1;color:var(--text)">${CROP_DEFS[c.cropId]?.name||c.cropId} × ${c.qty}</span><button onclick="sellCargoHere('${c.cropId}')" style="padding:2px 6px;background:#020a14;border:1px solid #0a4a6a;color:#5a9aba;font-size:7px;cursor:pointer">판매</button></div>`).join(''):'<div style="font-size:9px;color:var(--dim)">화물이 없습니다.</div>'}
  </div>`;

  html += `<div style="padding:8px 12px;text-align:center"><button onclick="renderVoyagePanel()" style="padding:5px 14px;background:#020a14;border:1px solid #0a2a3a;color:#3a6a8a;font-size:8px;font-family:Cinzel,serif;cursor:pointer">🔄 새로고침</button></div>`;

  body.innerHTML = html;
}
window.renderVoyagePanel = renderVoyagePanel;

window.renderVoyagePanel = renderVoyagePanel;

window.buyShip=buyShip;

window.repairShip=repairShip;

window.hireCrew=hireCrew;

window.loadCargoFromWarehouse=loadCargoFromWarehouse;

window.sellCargoHere=sellCargoHere;

window.startVoyage=startVoyage;

window.resolveSeaEvent=resolveSeaEvent;

window.upgradeShipPart=upgradeShipPart;

window.attemptPlunderPort=attemptPlunderPort;

window.resolveSeaBattleRound=resolveSeaBattleRound;

window.concludeSeaBattle=concludeSeaBattle;

window.fleeAfterDefeat=fleeAfterDefeat;

(function(){
  if(document.getElementById('p-voyage')) return;
  const div=document.createElement('div'); div.className='panel-ov'; div.id='p-voyage';
  div.innerHTML=`<div class="panel"><div class="p-hdr"><span class="p-title">⛵ 항해</span><button class="p-close" onclick="closeP('voyage')">✕</button></div><div class="p-body scrollable" id="pb-voyage"></div></div>`;
  document.body.appendChild(div);
})();

export function ensureVoyageButtonVisible(){
  try{
    const b=document.querySelector('.btm-bar'); if(!b) return;
    const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
    const ship = loadShip();
    const show = ship || (loc && loc.coastal);
    if(show && !document.getElementById('btn-voyage')){
      const bn=document.createElement('button'); bn.id='btn-voyage'; bn.className='bb';
      bn.style.cssText='color:#5a9aba;border-color:#0a4a6a'; bn.textContent='⛵항해'; bn.title='항해 — 선박 소유/출항/해상 이벤트';
      bn.onclick=function(){ window.openP('voyage'); renderVoyagePanel(); }; b.appendChild(bn);
    } else if(!show){
      const existing = document.getElementById('btn-voyage');
      if(existing) existing.remove();
    }
  }catch(e){}
}
window.ensureVoyageButtonVisible = ensureVoyageButtonVisible;

window.ensureVoyageButtonVisible = ensureVoyageButtonVisible;

setTimeout(ensureVoyageButtonVisible, 6000);

export function tickGuildBountyCheck(cleanText){
  if(typeof cleanText !== 'string') return;
  const bountyHit = /현상금 수령|표적을 잡|수배자.{0,10}제압|수배자.{0,10}포획|현상금.{0,10}받|추적.{0,10}성공/.test(cleanText);
  if(bountyHit && typeof window.updateStats==='function') window.updateStats('bounty_kills', 1);
}
window.tickGuildBountyCheck = tickGuildBountyCheck;

window.tickGuildBountyCheck = tickGuildBountyCheck;

export function getGuildSection(){
  const guilds = loadGuilds();
  if(!guilds.length && !S._pendingGuildHint) return '';
  var lines=[];
  if(guilds.length>0){
    var g = guilds.map(function(m){
      var def = GUILD_DEFS[m.id]; if(!def) return null;
      return def.icon+def.name+' '+def.ranks[m.rankIdx];
    }).filter(Boolean);
    lines.push('[🏛️ 가입 길드] '+g.join(' / ')+' — 이 소속은 NPC의 반응과 의뢰 접근권에 영향을 준다.');
  }
  if(S._pendingGuildHint){ lines.push('[📜 길드 사건] '+S._pendingGuildHint); S._pendingGuildHint=null; }
  return lines.length ? '\n'+lines.join('\n') : '';
}
window.getGuildSection = getGuildSection;

window.getGuildSection = getGuildSection;

export function renderGuildPanelV2(){
  var body = document.getElementById('pb-guild'); if(!body) return;
  var guilds = loadGuilds();
  var st = (typeof loadStats==='function') ? loadStats() : {};

  var html = '<div style="padding:8px 12px;background:#0a080a;border-bottom:1px solid #2a1a2a;font-size:9px;color:#9a7a9a;line-height:1.6">🏛️ 길드 — 직업과 무관하게 누구나 가입 가능. 동시 최대 '+MAX_GUILD_MEMBERSHIPS+'개. 탈퇴해도 등급과 숙련도는 유지된다.</div>';

  guilds.forEach(function(m){
    var def = GUILD_DEFS[m.id]; if(!def) return;
    var rank = def.ranks[m.rankIdx]||'견습';
    var nextRankIdx = m.rankIdx+1;
    var hasNext = nextRankIdx < def.ranks.length;
    var cur = st[def.statKey]||0;
    var needed = hasNext ? def.proficiencyPerRank[nextRankIdx] : null;
    var pct = needed ? Math.min(100, Math.round(cur/needed*100)) : 100;
    var nextBonus = (hasNext && def.statBonusPerRank) ? (def.statBonusPerRank[nextRankIdx]||{}) : {};
    var bonusStr = Object.entries(nextBonus).map(function(e){ return e[0].toUpperCase()+'+'+e[1]; }).join(' ');
    html += '<div style="padding:10px 12px;border-bottom:2px solid '+def.color+'44;background:#0f080f">'
      +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">'
      +'<span style="font-size:20px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def?.icon))+'</span>'
      +'<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:11px;color:'+def.color+'">'+def.name+'</div>'
      +'<div style="font-size:9px;color:var(--text)">등급: <strong style="color:'+def.color+'">'+rank+'</strong></div></div>'
      +'<button onclick="leaveGuildV2(\''+m.id+'\')" style="padding:3px 8px;background:#150010;border:1px solid #5a1050;color:#c060a0;font-size:7px;cursor:pointer">탈퇴</button>'
      +'</div>'
      +(hasNext
        ? '<div style="font-size:8px;color:var(--dim);margin-bottom:3px">다음: '+def.ranks[nextRankIdx]+' ('+cur+'/'+needed+')'+(bonusStr?' → '+bonusStr:'')+'</div>'
          +'<div style="background:#0a0a0a;border-radius:3px;height:5px;overflow:hidden;margin-bottom:3px"><div style="width:'+pct+'%;height:100%;background:'+def.color+';border-radius:3px"></div></div>'
          +'<div style="font-size:7px;color:#555">숙련도 기준: '+def.statKey+'</div>'
        : '<div style="font-size:8px;color:#c0a030">✨ 최고 등급!</div>')
      +'<div style="font-size:8px;color:var(--dim);margin-top:4px">'+def.domain+' · '+def.questTypes.join(' · ')+'</div>'
      +'</div>';
  });

  var available = Object.values(GUILD_DEFS).filter(function(def){ return !guilds.find(function(g){ return g.id===def.id; }); });
  if(available.length){
    html += '<div style="padding:8px 12px 4px;font-family:Cinzel,serif;font-size:9px;color:var(--dim)">── 가입 가능한 길드 ──</div>';
    available.forEach(function(def){
      var canJoin = guilds.length < MAX_GUILD_MEMBERSHIPS;
      var cost = (def.joinReq&&def.joinReq.goldCost)||0;
      var cur = st[def.statKey]||0;
      html += '<div style="padding:8px 12px;border-bottom:1px solid #1a0a1a;'+(canJoin?'':'opacity:0.45')+'">'
        +'<div style="display:flex;align-items:center;gap:6px">'
        +'<span style="font-size:16px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def?.icon))+'</span>'
        +'<div style="flex:1"><div style="font-size:10px;color:'+def.color+'">'+def.name+'</div>'
        +'<div style="font-size:8px;color:var(--dim)">'+def.domain+'</div>'
        +'<div style="font-size:7px;color:#888">'+(def.joinReq&&def.joinReq.note||'')+'</div>'
        +(cur>0 ? '<div style="font-size:7px;color:'+def.color+'">기존 숙련도 '+cur+' — 재가입 시 이어서 계산</div>' : '')
        +'</div>'
        +'<button onclick="joinGuildV2(\''+def.id+'\')" style="padding:4px 10px;background:#0a080a;border:1px solid '+def.color+'88;color:'+def.color+';font-size:8px;cursor:pointer;flex-shrink:0" '+(canJoin?'':'disabled')+'>'+(cost>0?cost+'G ':'')+'가입</button>'
        +'</div></div>';
    });
  }
  html += '<div style="padding:8px 12px;text-align:center"><button onclick="renderGuildPanelV2()" style="padding:5px 14px;background:#0a080a;border:1px solid #2a1a2a;color:#6a4a6a;font-size:8px;font-family:Cinzel,serif;cursor:pointer">🔄 새로고침</button></div>';
  body.innerHTML = html;
}
window.renderGuildPanelV2 = renderGuildPanelV2;

window.renderGuildPanelV2 = renderGuildPanelV2;

(function(){
  if(document.getElementById('p-guild')) return;
  var div=document.createElement('div'); div.className='panel-ov'; div.id='p-guild';
  div.innerHTML='<div class="panel"><div class="p-hdr"><span class="p-title">🏛️ 길드</span><button class="p-close" onclick="closeP(\'guild\')">✕</button></div><div class="p-body scrollable" id="pb-guild"></div></div>';
  document.body.appendChild(div);
  setTimeout(function(){
    try{
      var b=document.querySelector('.btm-bar'); if(!b||document.getElementById('btn-guild')) return;
      var bn=document.createElement('button'); bn.id='btn-guild'; bn.className='bb';
      bn.style.cssText='color:#a070c0;border-color:#3a1a3a'; bn.textContent='🏛️길드'; bn.title='길드 — 누구든 가입 가능한 부업';
      bn.onclick=function(){ window.openP('guild'); if(typeof renderGuildPanel==='function') renderGuildPanel(); }; b.appendChild(bn);
    }catch(e){}
  },6000);
})();

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_229(){
window.establishNetwork=establishNetwork;

window.performSong=performSong;

window.seekPatron=seekPatron;

window.composeLegendarySong=composeLegendarySong;

setTimeout(ensureWorkshopButtonVisible, 6000);

function renderWorldMapPanel(){
  const body = document.getElementById('pb-worldmap'); if(!body) return;
  const travel = loadTravelState();
  // 재렌더(팝업 열기/닫기 등) 전에 사용자가 옮겨둔 스크롤 위치를 기억해뒀다가,
  // 대륙/모드가 안 바뀐 경우엔 body.innerHTML로 지도가 통째로 새로
  // 만들어진 뒤에도 그 자리를 그대로 복원한다(안 하면 매번 좌상단으로
  // 튕겨서 드래그해서 본 게 다 헛수고가 됨).
  const _prevScroll = document.getElementById('land-map-scroll');
  const _prevScrollPos = _prevScroll ? { left: _prevScroll.scrollLeft, top: _prevScroll.scrollTop } : null;
  const _vb = getLandMapViewBox(); // S._landMapSelectedContinent 등 상태를 미리 초기화해 헤더 표시에 반영되게 함
  const _curMode = S._landMapViewMode || 'continent';
  // 지도 안 아이콘·글자 크기는 renderLandMapSVG() 안에서 viewBox 크기에
  // 비례한 k값으로 정해진다(원래는 "이 SVG를 화면 폭에 맞게 축소해서
  // 보여준다"는 전제로, viewBox가 커질수록 아이콘도 크게 그려서 축소된
  // 뒤에도 안 작아 보이게 하는 보정값). 그런데 SVG를 실제 크기(viewBox와
  // 1:1)로 그려버리면 이 보정이 취소되지 않고 그대로 남아서 아이콘·
  // 글자가 화면을 뒤덮을 만큼 거대해진다 — 그래서 SVG 자체는 계속
  // width:100%/height:100%(비율 유지)로 그리되, 그 100%의 기준이 되는
  // 부모 박스를 화면 폭보다 넉넉히 큰 고정 크기로 만들어서 "기존과 같은
  // 비율로 그려지지만 그 결과물 자체가 화면보다 커서 드래그가 필요한"
  // 상태를 만든다.
  // [8-13] 예전엔 _dispW가 780으로 줌 단계와 무관하게 항상 고정이었다 —
  // 그래서 좌표계(WORLD_MAP_ZONES) 안에서 대륙·섬 크기를 아무리 키워도
  // 그 780px 박스 "안에서의 비율"만 바뀔 뿐, 실제 화면에 그려지는
  // 픽셀 크기·스크롤해야 하는 범위는 하나도 안 늘어났다(사용자가 정확히
  // 지적한 지점). 와우처럼 "진짜 크고 드래그해서 탐험하는" 느낌을
  // 주려면 줌 단계마다 실제 렌더 크기 자체를 큼직하게 키워야 한다 —
  // 세계지도는 4개 대륙을 다 보려면 화면보다 훨씬 커야 하고, 대륙
  // 전체 뷰도 왕국 여러 개를 오가려면 넉넉해야 한다.
  const _dispW = _curMode==='world' ? 2600
    : (S._landMapSelectedGroup && !S._landMapSelectedContinent) ? 1700
    : 1150;
  const _dispH = Math.round(_dispW * (_vb.h / _vb.w));
  // [8-13] renderLandMapSVG() 안의 아이콘/글자 크기(k = vb.scale)는
  // "svg 좌표 1단위 = dispW/vb.w 픽셀"로 그려지는데, vb.w(줌 범위)가
  // 어떤 모드든 k 자체가 vb.w에 비례해서 커지는 값이라 결국 물리적
  // 픽셀 크기는 vb.w가 아니라 dispW에만 비례하게 된다 — 즉 dispW를
  // 줌 단계별로 다르게 키우면 아이콘·글자도 그 비율 그대로 커진다.
  // 세계지도(2600)를 그대로 뒀더니 왕국 이름 글자가 화면을 뒤덮을
  // 만큼 거대해지는 버그가 실제로 나서(스크린샷으로 확인), 줌아웃된
  // 모드(세계지도·대륙 전체)는 캔버스만 커지고 아이콘 크기는 예전
  // 780 기준과 비슷하게 유지되도록 보정 배율을 곱해준다. 왕국 상세
  // 뷰는 장소가 많이 늘어난 만큼 아이콘이 조금 커지는 게 자연스러워
  // 보정을 약하게만 넣는다.
  const _iconTargetMult = _curMode==='world' ? 1.15
    : (S._landMapSelectedGroup && !S._landMapSelectedContinent) ? 1.2
    : 1.35;
  S._landMapIconScaleAdj = _iconTargetMult * (780 / _dispW);
  // [V1/V2 통합] 지도(SVG) / 세계 소식(뉴스피드·세력반응·선택이력) 탭 전환
  let html = `<div style="display:flex;border-bottom:1px solid #1a2a14;flex-shrink:0">
    <button onclick="renderWorldMapPanel()" style="flex:1;padding:7px 4px;background:#0d1a0a;border:none;border-bottom:2px solid #7aaa6a;color:#7aaa6a;font-family:Cinzel,serif;font-size:9px;cursor:pointer">🗺️ 지도</button>
    <button onclick="renderWorldReactions()" style="flex:1;padding:7px 4px;background:transparent;border:none;border-bottom:2px solid transparent;color:var(--dim);font-family:Cinzel,serif;font-size:9px;cursor:pointer">📰 세계 소식</button>
  </div>`;
  html += `<div style="padding:8px 12px;background:#050a05;border-bottom:1px solid #1a2a14;font-size:9px;color:#7aaa6a;line-height:1.6;flex-shrink:0">🗺️ 월드맵 — ${_curMode==='world' ? '왕국을 터치하면 자세히 볼 수 있습니다.' : (S._landMapSelectedGroup && !S._landMapSelectedContinent) ? `${CONTINENT_GROUP_NAME[S._landMapSelectedGroup]||''} — 왕국을 터치하면 그 왕국 안을 자세히 볼 수 있습니다.` : '이 왕국의 마을·도시·던전이 모두 보입니다. 점을 터치해 이동하세요.'}</div>`;

  if(travel && travel.activeEncounter){
    const ev = travel.activeEncounter;
    html += `<div style="padding:12px;border-bottom:2px solid #4a3a1a;background:#0a0805;flex-shrink:0">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#e0b060;margin-bottom:6px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(ev,{size:10}):(ev.icon)} ${ev.name}</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:8px">${esc(ev.desc)}</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
      ${ev.id==='camp_travelers'?`<button onclick="resolveTravelEncounter('join')" style="flex:1;padding:6px;background:#0a0a05;border:1px solid #4a4a1a;color:#c0c060;font-size:8px;cursor:pointer">🏕️ 어울리기</button><button onclick="resolveTravelEncounter('ignore')" style="flex:1;padding:6px;background:#0a0a0a;border:1px solid #3a3a3a;color:#888;font-size:8px;cursor:pointer">지나치기</button>`
      :ev.id==='caravan'?`<button onclick="resolveTravelEncounter('escort')" style="flex:1;padding:6px;background:#0a0805;border:1px solid #4a3a1a;color:#c0a060;font-size:8px;cursor:pointer">🐫 호위 동행</button><button onclick="resolveTravelEncounter('trade')" style="flex:1;padding:6px;background:#050a0a;border:1px solid #1a4a4a;color:#60c0c0;font-size:8px;cursor:pointer">거래</button><button onclick="resolveTravelEncounter('ignore')" style="flex:1;padding:6px;background:#0a0a0a;border:1px solid #3a3a3a;color:#888;font-size:8px;cursor:pointer">지나치기</button>`
      :ev.id==='patrol'?`<button onclick="resolveTravelEncounter('greet')" style="flex:1;padding:6px;background:#05050a;border:1px solid #1a1a4a;color:#6060c0;font-size:8px;cursor:pointer">🛡️ 인사하기</button><button onclick="resolveTravelEncounter('avoid')" style="flex:1;padding:6px;background:#0a0a0a;border:1px solid #3a3a3a;color:#888;font-size:8px;cursor:pointer">피해가기</button>`
      :ev.id==='bandit_ambush'?`<button onclick="resolveTravelEncounter('fight')" style="flex:1;padding:6px;background:#150505;border:1px solid #6a2a2a;color:#e08080;font-size:8px;cursor:pointer">⚔️ 맞서기</button><button onclick="resolveTravelEncounter('flee')" style="flex:1;padding:6px;background:#0a1505;border:1px solid #2a6a2a;color:#80e080;font-size:8px;cursor:pointer">💨 도주</button><button onclick="resolveTravelEncounter('pay')" style="flex:1;padding:6px;background:#150f05;border:1px solid #6a5a2a;color:#e0c080;font-size:8px;cursor:pointer">💰 통행료</button>`
      :ev.id==='wounded_traveler'?`<button onclick="resolveTravelEncounter('help')" style="flex:1;padding:6px;background:#05100a;border:1px solid #2a5a3a;color:#80c0a0;font-size:8px;cursor:pointer">🩹 도와주기</button><button onclick="resolveTravelEncounter('ignore')" style="flex:1;padding:6px;background:#0a0a0a;border:1px solid #3a3a3a;color:#888;font-size:8px;cursor:pointer">지나치기</button>`
      :`<button onclick="resolveTravelEncounter('trade')" style="flex:1;padding:6px;background:#0a0a05;border:1px solid #4a4a1a;color:#c0c060;font-size:8px;cursor:pointer">🛒 거래</button><button onclick="resolveTravelEncounter('ignore')" style="flex:1;padding:6px;background:#0a0a0a;border:1px solid #3a3a3a;color:#888;font-size:8px;cursor:pointer">지나치기</button>`}
      </div>
    </div>`;
  }

  html += `<div style="padding:10px 12px;flex:1;min-height:0;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;flex-shrink:0">
      <div style="font-size:8px;color:#577">${_curMode==='continent' ? (S._landMapSelectedContinent ? (CONTINENT_PROPER_NAME_ICON[S._landMapSelectedContinent]||'') : (S._landMapSelectedGroup ? '🗺️ '+(CONTINENT_GROUP_NAME[S._landMapSelectedGroup]||'') : '')) : ''}</div>
      <div style="display:flex;gap:5px">
      ${(_curMode==='continent' && S._landMapSelectedContinent) ? (
        (S._fieldEntryWindowUntil && Date.now() < S._fieldEntryWindowUntil)
          ? `<button onclick="S._fieldModeContinent='${S._landMapSelectedContinent}';openP('fieldmove')" style="padding:3px 10px;background:#0a0805;border:1px solid #6a4a1a;color:#e0b060;font-size:8px;cursor:pointer;border-radius:3px">🎮 실시간 필드 이동</button>`
          // [19번 라운드, [대기] #10 나머지 — 필드 진입 게이팅] 사용자 확정
          // 지시("막아줘"): 이야기 속에서 주변을 살펴보거나 움직이는
          // 선택을 성공시킨 직후(quest/086 sendMsg가 세팅하는
          // S._fieldEntryWindowUntil)에만 이 버튼이 활성화된다 — 그
          // 전에는 눌러도 안내만 뜨는 비활성 버튼으로 보여준다(완전히
          // 안 보이게 숨기면 "그런 기능이 있는지조차 모름"이 되어
          // 오히려 발견성이 떨어진다고 판단).
          : `<button onclick="toast('🔒 이야기 속에서 주변을 살펴보거나 움직이는 선택을 골라야 필드로 나갈 수 있습니다', 2800)" style="padding:3px 10px;background:#0a0a0a;border:1px dashed #4a4a3a;color:#6a6455;font-size:8px;cursor:pointer;border-radius:3px">🔒 실시간 필드 이동</button>`
      ) : ''}
      <button onclick="toggleLandMapViewMode()" style="padding:3px 10px;background:#050a05;border:1px solid #1a4a2a;color:#7aaa6a;font-size:8px;cursor:pointer;border-radius:3px">${_curMode==='world' ? '📍 현재 위치로' : (S._landMapSelectedGroup && S._landMapSelectedContinent) ? `← ${CONTINENT_GROUP_NAME[S._landMapSelectedGroup]||''}` : '← 세계 지도'}</button>
      </div>
    </div>
    <div id="land-map-scroll" style="flex:1;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y">
      <div style="width:${_dispW}px;height:${_dispH}px">${renderLandMapSVG()}</div>
    </div>
    ${_curMode!=='world' ? `<div style="display:flex;justify-content:center;gap:8px;margin-top:5px;font-size:6.5px;color:var(--dim);flex-shrink:0">
      <span style="color:${DUNGEON_TIER_COLORS[1]}">●초급</span>
      <span style="color:${DUNGEON_TIER_COLORS[2]}">●중급</span>
      <span style="color:${DUNGEON_TIER_COLORS[3]}">●고급</span>
      <span style="color:${DUNGEON_TIER_COLORS[4]}">●전설급</span>
    </div>` : ''}
    <div style="font-size:7px;color:#577;margin-top:4px;text-align:center;line-height:1.6;flex-shrink:0">${_curMode==='world' ? '대륙을 터치하면 자세히 볼 수 있습니다 · 지도를 드래그하면 옆도 볼 수 있습니다' : '⭐금색=거점도시 · 던전 별표(★~★★★★)=난이도 등급 · 점을 터치하면 행동을 고를 수 있습니다 · 드래그로 이동'}</div>
  </div>`;

  if(travel && !travel.activeEncounter){
    html += `<div style="padding:10px 12px;border-top:1px solid #1a2a14;background:#050a05;flex-shrink:0">
      <div style="font-size:10px;color:#e0b060">🚶 ${travel.destName}을(를) 향해 이동 중 — 잔여 ${travel.daysLeft}일</div>
    </div>`;
  }

  body.innerHTML = html;
  // 지도를 화면에 억지로 맞춰 축소하지 않고 실제 크기로 그린 뒤(위의
  // width/height 고정 svg) 스크롤/드래그로 돌아다니게 바꿨다 — 그러면
  // 처음 열었을 때(또는 다른 대륙/모드로 바뀌었을 때) 스크롤이 항상
  // 좌상단 모서리에 가 있어서 정작 중요한 대륙 중심부가 화면 밖으로
  // 잘려 보인다. 대륙/모드가 실제로 바뀐 경우에만 스크롤 컨테이너를
  // 콘텐츠 한가운데로 맞추고, 팝업만 열고 닫는 재렌더에서는 사용자가
  // 이미 옮겨둔 스크롤 위치를 그대로 둔다(매번 가운데로 되돌리면
  // 오히려 드래그가 무의미해짐). openP()가 "먼저 렌더 → 그다음 .open
  // 클래스 추가(=display:none 해제)" 순서라서 이 시점엔 아직
  // clientWidth가 0일 수 있어 requestAnimationFrame으로 한 프레임 미룬다.
  const _mapCenterSig = _curMode + ':' + (S._landMapSelectedContinent||'');
  const _shouldCenter = S._landMapLastCenterSig !== _mapCenterSig;
  S._landMapLastCenterSig = _mapCenterSig;
  requestAnimationFrame(() => {
    const mapScroll = document.getElementById('land-map-scroll');
    if(!mapScroll || mapScroll.clientWidth <= 0) return;
    if(_shouldCenter){
      mapScroll.scrollLeft = (mapScroll.scrollWidth - mapScroll.clientWidth) / 2;
      mapScroll.scrollTop = (mapScroll.scrollHeight - mapScroll.clientHeight) / 2;
    } else if(_prevScrollPos){
      mapScroll.scrollLeft = _prevScrollPos.left;
      mapScroll.scrollTop = _prevScrollPos.top;
    }
  });
}
window.renderWorldMapPanel = renderWorldMapPanel;

window.renderWorldMapPanel = window.renderWorldMapPanel;

window.joinGuildV2 = joinGuildV2;

window.leaveGuildV2 = leaveGuildV2;

const _prevAH3=window._wandererAxisHook;

window._wandererAxisHook=function(cleanText,userMsg){
  if(_prevAH3) _prevAH3(cleanText,userMsg);
  try{ tickNearDeathPenalty(); }catch(e){}
  try{ checkFactionPursuit(); }catch(e){}
  try{ tickSkillCooldowns(); }catch(e){}
  try{ tickWorldTimer(cleanText); }catch(e){}
  try{ tickFoodWater(cleanText); }catch(e){}
  try{ detectStolenItems(cleanText); }catch(e){}
  try{ tickMercBand(); }catch(e){}
  try{ tickCaravan(); }catch(e){}
  try{ tickFarm(); }catch(e){}
  try{ tickFarmExtras(); }catch(e){}
  try{ ensureFarmButtonVisible(); }catch(e){}
  try{ tickGraveyard(); }catch(e){}
  try{ ensureGraveButtonVisible(); }catch(e){}
  try{ checkActivityMastery(); }catch(e){}
  try{ checkGuildRankups(); }catch(e){}
  try{ tickGuildBountyCheck(cleanText); }catch(e){}
  try{ tickVoyage(); }catch(e){}
  try{ tickLandTravel(); }catch(e){}
  try{ tickNpcShips(); }catch(e){}
  try{ ensureVoyageButtonVisible(); }catch(e){}
  try{ tickWorkshop(); }catch(e){}
  try{ ensureWorkshopButtonVisible(); }catch(e){}
  try{ tickNetwork(); }catch(e){}
  try{ ensureNetworkButtonVisible(); }catch(e){}
  // 패널을 열어둔 채로 턴이 진행돼도 최신 상태가 바로 보이도록 갱신
  try{ if(document.getElementById('p-contracts')?.classList.contains('open')) renderContractsPanel(); }catch(e){}
  try{ if(document.getElementById('p-farm')?.classList.contains('open')) renderFarmPanel(); }catch(e){}
  try{ if(document.getElementById('p-graves')?.classList.contains('open')) renderGravesPanel(); }catch(e){}
  try{ if(document.getElementById('p-workshop')?.classList.contains('open')) renderWorkshopPanel(); }catch(e){}
  try{ if(document.getElementById('p-network')?.classList.contains('open')) renderNetworkPanel(); }catch(e){}
  try{ if(document.getElementById('p-guild')?.classList.contains('open') && typeof renderGuildPanel==='function') renderGuildPanel(); }catch(e){}
  try{ if(document.getElementById('p-voyage')?.classList.contains('open')) renderVoyagePanel(); }catch(e){}
};

window.tickNearDeathPenalty=tickNearDeathPenalty;
}

