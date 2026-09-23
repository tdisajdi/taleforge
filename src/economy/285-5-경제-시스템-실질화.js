// 5. 경제 시스템 실질화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { ECONOMY_ACTIONS } from '../data/285-5-경제-시스템-실질화.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { updateReputation } from '../misc/054-이동수단-시스템.js';
import { sendMsg } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const INVESTMENT_KEY = 'tf-investments';

export function loadInvestments(){ try{ return JSON.parse(lsGet(INVESTMENT_KEY)||'[]'); }catch(e){ return []; } }
window.loadInvestments = loadInvestments;

export function saveInvestments(d){ try{ lsSet(INVESTMENT_KEY, JSON.stringify(d)); }catch(e){} }
window.saveInvestments = saveInvestments;

export function showEconomyMenu(){
  const isLm = document.body.classList.contains('light-mode');
  const bg  = isLm ? '#fdf5e8' : '#050200';
  const brd = isLm ? '#c8a860' : 'var(--gold)';
  const dim = isLm ? '#7a5a30' : 'var(--dim)';
  const gold = S.gold||0;

  const overlay = document.createElement('div');
  overlay.id = 'economy-menu';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:250;background:rgba(0,0,0,.85);display:flex;align-items:flex-end';
  overlay.innerHTML = `
  <div style="width:100%;max-height:75vh;background:${bg};border-top:2px solid ${brd};overflow-y:auto;animation:slideUp .2s ease">
    <div style="padding:12px 16px;border-bottom:1px solid ${brd};display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-family:Cinzel,serif;font-size:13px;color:${brd}">💰 경제 행동</div>
        <div style="font-size:10px;color:${dim};margin-top:2px">보유 골드: ${gold}G</div>
      </div>
      <button onclick="document.getElementById('economy-menu').remove()" style="background:none;border:none;color:${dim};font-size:18px;cursor:pointer">✕</button>
    </div>
    <div style="padding:12px 16px">
      ${Object.entries(ECONOMY_ACTIONS).map(([key,act])=>{
        const canAfford = gold >= act.minGold;
        return `<div style="padding:10px;background:${isLm?'#f5e8d0':'#0d0800'};border:1px solid ${canAfford?(isLm?'#c8a860':'var(--border)'):(isLm?'#d4b880':'#2a1a05')};margin-bottom:6px;border-radius:2px;opacity:${canAfford?1:0.55}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <div style="font-family:Cinzel,serif;font-size:11px;color:${canAfford?brd:dim}">${act.label}</div>
            <div style="font-size:10px;color:${canAfford?'#c08820':dim}">-${act.minGold}G</div>
          </div>
          <div style="font-size:10px;color:${dim};margin-bottom:6px;line-height:1.4">${act.hint}</div>
          <button onclick="doEconomyAction('${key}')" ${canAfford?'':'disabled'} style="width:100%;padding:7px;background:${canAfford?brd:(isLm?'#d4b880':'#2a1a05')};border:none;color:${canAfford?(isLm?'#fff':'#000'):dim};font-family:Cinzel,serif;font-size:10px;cursor:${canAfford?'pointer':'not-allowed'};border-radius:2px">
            ${canAfford?'실행':'골드 부족'}
          </button>
        </div>`;
      }).join('')}
    </div>
  </div>`;
  document.body.appendChild(overlay);
}
window.showEconomyMenu = showEconomyMenu;

window.showEconomyMenu = showEconomyMenu;

export function doEconomyAction(key){
  document.getElementById('economy-menu')?.remove();
  const act = ECONOMY_ACTIONS[key];
  if(!act){ return; }
  if((S.gold||0) < act.minGold){ toast('골드가 부족합니다', 2000); return; }
  S.gold -= act.minGold;
  saveGold(S.gold);
  window.updateHeader();
  if(act.repCost && typeof updateReputation==='function') updateReputation(act.repCost);
  // 투자 기록
  if(key === 'invest'){
    const investments = loadInvestments();
    investments.push({ type:'invest', amount:act.minGold, turn:S.msgCount, returnPerTurn:20, turnsLeft:10 });
    saveInvestments(investments);
  }
  // 고용 기록
  if(key === 'hire'){
    // [20차 감사 FIX] 이미 용병을 고용한 상태(S._hiredMercenary 존재)에서
    // 다시 고용하면, 이전 보너스를 되돌리지 않고 S._hiredMercenary를
    // 그대로 덮어써서 S.stats에는 str/end 보너스가 매번 새로 더해지는데
    // (골드만 있으면 몇 번이고 반복 가능) processMercenary()는 계약이
    // 끝날 때 딱 한 번분(+15/+10)만 되돌려서, 재고용할 때마다 남은
    // 초과분이 영구적으로 스탯에 눌어붙는 문제였다. 재고용 시 기존
    // 보너스를 먼저 되돌린 뒤 새로 적용해, "계약 갱신"이 순수하게
    // 기간만 3턴으로 리셋되도록 교정한다.
    if(S._hiredMercenary && S._hiredMercenary.bonus && S.stats){
      Object.entries(S._hiredMercenary.bonus).forEach(([k,v])=>{
        if(S.stats[k]!==undefined) S.stats[k] = Math.max(0,S.stats[k]-v);
      });
    }
    S._hiredMercenary = { turnsLeft:3, bonus:{ str:15, end:10 } };
    if(S.stats){ S.stats.str = Math.min(999,(S.stats.str||10)+15); S.stats.end = Math.min(999,(S.stats.end||10)+10); }
  }
  S._nextInjectedContext = (S._nextInjectedContext||'') +
    ` [💰 경제 행동: ${act.label}] ${act.hint} ${act.minGold}G 지출. 이 행동의 결과를 서사에 자연스럽게 반영하라.`;
  sendMsg(act.label.replace(/[^가-힣a-zA-Z0-9 ]/g,'').trim()+'을 시도한다.', false);
}
window.doEconomyAction = doEconomyAction;

window.doEconomyAction = doEconomyAction;

export function processInvestments(){
  const investments = loadInvestments();
  if(!investments.length) return;
  let totalReturn = 0;
  const remaining = investments.filter(inv=>{
    if(inv.turnsLeft > 0){
      totalReturn += inv.returnPerTurn||0;
      inv.turnsLeft--;
      return inv.turnsLeft > 0;
    }
    return false;
  });
  if(totalReturn > 0){
    if(typeof addGoldWithExchange==='function') addGoldWithExchange(totalReturn, '투자 수익');
    else { S.gold = (S.gold||0) + totalReturn; saveGold(S.gold); }
    window.updateHeader();
    toast(`🏦 투자 수익: +${totalReturn}G`, 2000);
  }
  saveInvestments(remaining);
}
window.processInvestments = processInvestments;

window.processInvestments = processInvestments;

export function processMercenary(){
  if(!S._hiredMercenary) return;
  S._hiredMercenary.turnsLeft--;
  if(S._hiredMercenary.turnsLeft <= 0){
    if(S.stats && S._hiredMercenary.bonus){
      Object.entries(S._hiredMercenary.bonus).forEach(([k,v])=>{
        if(S.stats[k]!==undefined) S.stats[k] = Math.max(0,S.stats[k]-v);
      });
    }
    S._hiredMercenary = null;
    toast('⚔️ 고용 용병의 계약이 종료됐다.', 2500);
  }
}
window.processMercenary = processMercenary;
