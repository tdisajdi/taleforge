// 파트1-B: 랜덤 이벤트 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { RANDOM_EVENTS } from '../data/072-파트1-B-랜덤-이벤트-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { sendMsg } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { esc, isBlockingPopupOpen, lsGet, lsSet, toast } from '../utils.js';
import { recordChoice } from './066-②-선택-결과-추적-시스템.js';

export const RANDOM_EVENT_KEY = 'tf-rand-events';

export function loadFiredEvents(){ try{ return JSON.parse(lsGet(RANDOM_EVENT_KEY)||'[]'); }catch(e){ return []; } }
window.loadFiredEvents = loadFiredEvents;

export function saveFiredEvents(d){ try{ lsSet(RANDOM_EVENT_KEY, JSON.stringify(d)); }catch(e){} }
window.saveFiredEvents = saveFiredEvents;

window._lastEventTurn = 0;

export function getEventSceneState(recentText){
  if(S._inCombat) return 'tense';
  const t = recentText || '';
  // 결박/감금/포로 상태로 추정되는 서술 키워드
  if(/사슬|쇠사슬|결박|포로|감금|노예|구속|묶인|묶여|족쇄|투옥|감옥|인질/.test(t)) return 'tense';
  // 명시적 전투 키워드 (보강용)
  if(/전투|싸움|공격|방어|베었|강타|쓰러뜨|적이 나타|습격/.test(t)) return 'tense';
  return 'calm';
}
window.getEventSceneState = getEventSceneState;

export function checkRandomEvents(recentText){
  if(S.msgCount - window._lastEventTurn < 3) return; // 최소 3턴 간격
  if(Math.random() > 0.35) return; // 35% 확률

  const sceneState = getEventSceneState(recentText);

  const sid = S.scenario?.id || 'custom';
  const fired = new Set(loadFiredEvents());
  const pool  = [...(RANDOM_EVENTS.common||[]), ...(RANDOM_EVENTS[sid]||[])];
  const candidates = pool.filter(e=>
    !fired.has(e.id) &&
    S.msgCount >= e.minTurn &&
    Math.random() < e.chance &&
    (e.scene || 'calm') === sceneState
  );

  if(!candidates.length) return;
  const event = candidates[Math.floor(Math.random()*candidates.length)];

  window._lastEventTurn = S.msgCount;
  S._lastEventResult = '[랜덤이벤트: '+(event?.title||'이벤트')+']';
  showRandomEventPopup(event);
}
window.checkRandomEvents = checkRandomEvents;

export function showRandomEventPopup(event){
  // [버그 수정] 다른 전체화면 팝업(퀘스트 수락·전직 제안 등)이 이미 열려
  // 있으면 겹쳐 뜨지 않도록 잠시 후 재시도한다.
  if(isBlockingPopupOpen('rand-event-popup')){
    setTimeout(()=>showRandomEventPopup(event), 1200);
    return;
  }
  document.getElementById('rand-event-popup')?.remove();
  // 전역 변수에 이벤트/선택지 저장 (함수 참조 포함, JSON 직렬화 불필요)
  window._randEvt = event;
  window._randEvtChoices = event.choices || [];
  const popup = document.createElement('div');
  popup.id = 'rand-event-popup';
  popup.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;padding:16px';

  popup.innerHTML = `<div style="width:100%;max-width:360px;background:#050200;border:2px solid #c8a96e;border-radius:4px;overflow:hidden;animation:fadeIn .3s ease">
    <div style="padding:12px 14px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <div style="font-family:Cinzel,serif;font-size:11px;color:var(--gold);letter-spacing:2px">🎲 돌발 이벤트</div>
      <button onclick="document.getElementById('rand-event-popup').remove()" style="background:none;border:none;color:var(--dim);font-size:18px;cursor:pointer">✕</button>
    </div>
    <div style="padding:14px">
      <div style="font-family:Cinzel,serif;font-size:13px;color:var(--gold);margin-bottom:8px">${esc(event.title)}</div>
      <div style="font-size:11px;color:#c8a96e;line-height:1.6;margin-bottom:14px">${esc(event.desc)}</div>
      ${(event.choices||[]).map((c,i)=>{
        const label = typeof c === 'string' ? c : (c.text || '선택');
        return `<button onclick="resolveRandomEvent(window._randEvt, window._randEvtChoices[${i}])"
          style="width:100%;padding:10px 12px;background:#0d0800;border:1px solid var(--border);
          color:#c8a96e;font-size:10px;text-align:left;cursor:pointer;margin-bottom:5px;
          display:block;line-height:1.4;border-radius:2px">
          ${['①','②','③','④'][i]} ${esc(label)}
        </button>`;
      }).join('')}
    </div>
  </div>`;

  document.body.appendChild(popup);
}
window.showRandomEventPopup = showRandomEventPopup;

export function resolveRandomEvent(event, choice){
  document.getElementById('rand-event-popup')?.remove();
  recordChoice&&recordChoice(choice?.text||choice, event.title);

  // EXTRA_RANDOM_EVENTS 방식: choice.effect(result)
  if(choice && typeof choice.effect === 'function'){
    const result = {};
    try{ choice.effect(result); }catch(e){ console.warn('이벤트 효과 오류:', e); }
    if(result.result) toast(`🎲 ${event.title}: ${result.result}`, 3500);
    S._lastEventResult = `[이벤트: ${event.title}] ${result.result||choice.text||choice}`;
  }
  // 기존 방식: event.effects[choiceText]
  else if(event.effects){
    const effectFn = event.effects[choice?.text||choice];
    if(effectFn && typeof effectFn === 'function'){
      try{ effectFn(); }catch(e){ console.warn('이벤트 효과 오류:', e); }
    }
    S._lastEventResult = `[이벤트: ${event.title}] ${choice?.text||choice} 선택`;
  }

  // 발동 기록
  const fired = loadFiredEvents();
  fired.push(event.id);
  saveFiredEvents(fired);
  window.updateHeader&&window.updateHeader();

  // 선택 결과를 채팅에 자연스럽게 반영
  setTimeout(()=>{
    const msg = `[${event.icon||'🎲'} ${event.title}] ${choice?.text||choice}`;
    sendMsg&&sendMsg(msg, false);
  }, 300);
}
window.resolveRandomEvent = resolveRandomEvent;
