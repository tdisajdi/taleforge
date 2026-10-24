// 🏠 주택/하우징 시스템 (62-1번 섹션 신설)
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { FURNITURE_DEFS, HOUSE_BUY_LOCATION_TYPES, HOUSE_PRICE } from '../data/333-주택-하우징-시스템.js';
import { getSocialRankMechanics } from '../core/084-TaleForge-순수-JS-엔진.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';

export const HOUSE_KEY = 'tf-house';

export function loadHouse(){ try{ return JSON.parse(lsGet(HOUSE_KEY)||'null'); }catch(e){ return null; } }
window.loadHouse = loadHouse;

export function saveHouse(d){ try{ lsSet(HOUSE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveHouse = saveHouse;

export function buyHouse(){
  if(loadHouse()){ toast('이미 집을 소유하고 있습니다'); return; }
  // [2026-10-24 신설, 75번 섹션] 신분별 mechanics.canOwnProperty(노예/
  // 부랑자/농노/무법자=false)가 정의돼 있었는데 코드 어디서도 읽히지
  // 않던 죽은 데이터 — 재산 소유가 가장 직접적으로 연결되는 지점인
  // 집 구매에 처음 연결한다.
  const mech = (typeof getSocialRankMechanics==='function') ? getSocialRankMechanics() : null;
  if(mech && mech.canOwnProperty===false){ toast('🚫 당신의 신분으로는 재산을 소유할 수 없습니다'); return; }
  const loc = loadCurrentLocation();
  if(!loc || !HOUSE_BUY_LOCATION_TYPES.includes(loc.type)){
    toast('🏠 마을이나 도시 등 정착지에서만 집을 살 수 있습니다'); return;
  }
  if((S.gold||0) < HOUSE_PRICE){ toast(`골드가 부족합니다 (${HOUSE_PRICE}G 필요)`); return; }
  S.gold -= HOUSE_PRICE; saveGold(S.gold); window.updateHeader();
  saveHouse({ established:true, locId:loc.id, locName:loc.name, continent:loc.continent||null, furniture:[], establishedAt:S.msgCount||0 });
  if(typeof window.toastHTML==='function') window.toastHTML(`🏠 "${esc(loc.name)}"에 나만의 집을 마련했다!`, 3000);
  else toast(`🏠 "${loc.name}"에 나만의 집을 마련했다!`, 3000);
  renderHousingPanel();
}
window.buyHouse = buyHouse;

export function buyFurniture(fid){
  const h = loadHouse();
  if(!h){ toast('먼저 집을 구매하세요'); return; }
  if(h.furniture.includes(fid)){ toast('이미 설치된 가구입니다'); return; }
  const def = FURNITURE_DEFS.find(f=>f.id===fid);
  if(!def){ toast('알 수 없는 가구'); return; }
  if((S.gold||0) < def.cost){ toast(`골드가 부족합니다 (${def.cost}G 필요)`); return; }
  S.gold -= def.cost; saveGold(S.gold); window.updateHeader();
  h.furniture.push(fid); saveHouse(h);
  if(def.bonus && S.stats){
    Object.entries(def.bonus).forEach(([k,v])=>{
      if(S.stats[k]!==undefined) S.stats[k] = Math.min(999, (S.stats[k]||0) + v);
    });
    window.updateHeader();
  }
  if(typeof window.toastHTML==='function') window.toastHTML(`${typeof window.getEntityIconHTML==='function'?window.getEntityIconHTML(def,{size:14}):def.icon} ${esc(def.name)} 설치 완료!`, 2500);
  else toast(`${def.icon} ${def.name} 설치 완료!`, 2500);
  renderHousingPanel();
}
window.buyFurniture = buyFurniture;

export function restAtHouse(){
  const h = loadHouse();
  if(!h){ toast('먼저 집을 구매하세요'); return; }
  const loc = loadCurrentLocation();
  if(!loc || loc.id !== h.locId){ toast(`집(${h.locName})에서만 무료로 쉴 수 있습니다`); return; }
  const maxHp = S.stats.maxHp || 100;
  const maxMp = S.stats.maxMp || 50;
  S.stats.hp = maxHp;
  S.stats.mp = maxMp;
  try{
    if(typeof window.loadStatusEffects==='function' && typeof window.saveStatusEffects==='function'){
      const state = window.loadStatusEffects();
      if(state['player']) state['player'] = state['player'].filter(e => !['poison','burn','bleed'].includes(e.id));
      window.saveStatusEffects(state);
    }
  }catch(e2){}
  window.updateHeader();
  if(typeof window.saveSession==='function') window.saveSession();
  toast('🛏️ 내 집에서 편히 쉬었다. HP+MP 완전 회복! (무료)', 2500);
}
window.restAtHouse = restAtHouse;

export function renderHousingPanel(){
  const body = document.getElementById('pb-housing');
  if(!body) return;
  const h = loadHouse();
  const gold = S.gold||0;
  const loc = loadCurrentLocation();
  if(!h){
    const canBuyHere = loc && HOUSE_BUY_LOCATION_TYPES.includes(loc.type);
    body.innerHTML = `
      <div style="padding:20px;text-align:center">
        <div style="font-size:40px;margin-bottom:12px">🏠</div>
        <div style="font-family:Cinzel,serif;font-size:12px;color:#c8a040;margin-bottom:8px">나만의 집</div>
        <div style="font-size:11px;color:var(--dim);line-height:1.6;margin-bottom:16px">
          마을이나 도시에 집을 마련하면 그곳에서 언제든 무료로 쉴 수 있고,<br>가구를 사서 영구 스탯 보너스로 꾸밀 수 있다.<br>
          가격: ${HOUSE_PRICE}G (보유: ${gold}G)
        </div>
        ${canBuyHere
          ? `<button class="btn btn-gold" onclick="buyHouse()">🏠 이곳에 집 사기 (${esc(loc.name)})</button>`
          : `<div style="font-size:10px;color:#e06060">마을·도시 등 정착지에서만 구매할 수 있습니다 (현재: ${loc?esc(loc.name)+' - '+esc(loc.type||'?'):'알 수 없는 장소'})</div>`}
      </div>`;
    return;
  }
  const atHome = loc && loc.id === h.locId;
  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a040">🏠 ${esc(h.locName)}의 집</div>
        <div style="font-size:9px;color:var(--dim)">보유: ${gold}G</div>
      </div>
      <button class="btn ${atHome?'btn-gold':'btn-dark'}" style="width:100%;margin-bottom:10px" ${atHome?'':'disabled'} onclick="restAtHouse()">
        🛏️ ${atHome?'무료로 쉬기 (HP+MP 완전 회복)':'집에 있을 때만 쉴 수 있습니다'}
      </button>
      <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:6px">가구 (영구 스탯 보너스)</div>
      ${FURNITURE_DEFS.map(f=>{
        const owned = h.furniture.includes(f.id);
        const bonusStr = Object.entries(f.bonus||{}).map(([k,v])=>`${k.toUpperCase()}+${v}`).join(' ');
        return `
        <div style="padding:9px 11px;background:#0d0800;border:1px solid ${owned?'#806020':'var(--border)'};margin-bottom:6px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:16px">${typeof window.getEntityIconHTML==='function'?window.getEntityIconHTML(f,{size:16}):f.icon}</span>
            <div style="flex:1">
              <div style="font-family:Cinzel,serif;font-size:10px;color:${owned?'#e0a030':'var(--gold)'}">${esc(f.name)}${owned?' ✅':''}</div>
              <div style="font-size:9px;color:var(--dim)">${esc(f.desc)} · ${bonusStr}</div>
            </div>
            ${owned?'':`<button class="btn btn-gold" style="padding:5px 9px;font-size:9px;flex-shrink:0" onclick="buyFurniture('${f.id}')">${f.cost}G</button>`}
          </div>
        </div>`;
      }).join('')}
    </div>`;
}
window.renderHousingPanel = renderHousingPanel;
