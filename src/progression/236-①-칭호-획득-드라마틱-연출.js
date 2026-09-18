// ① 칭호 획득 드라마틱 연출
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { esc, lsGet, lsSet } from '../utils.js';
import { loadCycleCount } from './014-환생-누적-시스템-110번.js';

export function showTitleUnlockEffect(title){
  if(!title) return;
  document.getElementById('title-banner')?.remove();
  const banner = document.createElement('div');
  banner.id = 'title-banner';
  banner.style.cssText = `
    position:fixed;top:55px;left:50%;transform:translateX(-50%);
    z-index:7500;width:92%;max-width:330px;
    background:linear-gradient(135deg,#100800,#1a1000);
    border:1px solid #c8a96e;border-top:3px solid #c8a96e;
    padding:10px 14px;animation:fadeIn .35s ease;
    box-shadow:0 4px 24px rgba(200,169,110,.35);
    text-align:center;
  `;
  banner.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:8px;color:#6a5020;letter-spacing:3px;margin-bottom:4px">✦ 칭호 획득 ✦</div>
    <div style="font-family:'Cinzel',serif;font-size:14px;color:#c8a96e;letter-spacing:1px">「${esc(title.name||title)}」</div>
    ${title.desc ? `<div style="font-size:9px;color:var(--dim);margin-top:4px">${esc(title.desc)}</div>` : ''}`;
  document.body.appendChild(banner);
  setTimeout(()=>{ banner.style.opacity='0'; banner.style.transition='opacity .6s';
    setTimeout(()=>banner.remove(),600); }, 4000);
}
window.showTitleUnlockEffect = showTitleUnlockEffect;

window.showTitleUnlockEffect = showTitleUnlockEffect;

export const LAST_MEMORY_KEY = 'tf-last-life-memory';

export function saveLastLifeMemory(){
  if(!S?.messages || !S?.character) return;
  const lastAI = [...S.messages].reverse().find(m=>m.role==='assistant');
  const lastUser = [...S.messages].reverse().find(m=>m.role==='user');
  const memory = {
    charName: S.character.name || '주인공',
    charRole: S.character.role || '',
    lastScene: lastAI?.content?.slice(0,200) || '',
    lastAction: lastUser?.content?.slice(0,80) || '',
    level: typeof loadPlayerLevel==='function' ? loadPlayerLevel() : 1,
    turn: S.msgCount || 0,
    cycle: typeof loadCycleCount==='function' ? loadCycleCount() : 0,
    savedAt: new Date().toISOString(),
  };
  try{ lsSet(LAST_MEMORY_KEY, JSON.stringify(memory)); }catch(e){}
}
window.saveLastLifeMemory = saveLastLifeMemory;

export function loadLastLifeMemory(){
  try{ return JSON.parse(lsGet(LAST_MEMORY_KEY)||'null'); }catch(e){ return null; }
}
window.loadLastLifeMemory = loadLastLifeMemory;

export function getLastLifeMemoryContext(){
  const m = loadLastLifeMemory();
  if(!m || !m.lastScene) return '';
  const cycle = typeof loadCycleCount==='function' ? loadCycleCount() : 0;
  if(cycle < 1) return '';
  return `\n[🌀 전생의 기억 — ${m.cycle}회차 ${m.charName}(${m.charRole}, Lv.${m.level})] ` +
    `마지막 장면: "${m.lastScene.slice(0,100)}..." ` +
    `이 잔상이 꿈처럼 스쳐간다. 현재 서사에서 전생의 기억이 데자뷔처럼 스며드는 묘사를 자연스럽게 1회 포함하라.`;
}
window.getLastLifeMemoryContext = getLastLifeMemoryContext;

window.saveLastLifeMemory = saveLastLifeMemory;

window.loadLastLifeMemory = loadLastLifeMemory;

window.getLastLifeMemoryContext = getLastLifeMemoryContext;

// [19차 감사 FIX — 제거] handleDeath라는 이름의 함수는 이 코드베이스
// 어디에도 정의된 적이 없다(quest/086의 사망 처리부도 같은 이름을
// typeof 방어로 호출만 시도할 뿐, 실체가 없다). 즉 이 블록은 항상
// typeof handleDeath==='undefined'라 한 번도 실행된 적이 없었고,
// saveLastLifeMemory()(전생의 기억 데자뷔 서사 기능, callAI 훅에는
// 이미 정상 연결됨)가 저장될 기회 자체가 없었다. 실제 사망 처리
// 지점(quest/086의 S.stats.hp=0 분기)에서 직접 호출하도록 옮겼다.

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_211(){
if(typeof unlockTitle === 'function'){
  const __origUT = unlockTitle;
  window.unlockTitle = function(titleData){
    const __r = __origUT.call(this, titleData);
    if(__r !== false) try{ setTimeout(()=>showTitleUnlockEffect(titleData), 300); }catch(e){}
    return __r;
  };
} else if(typeof window.addTitle === 'function'){
  // [버그 수정] 이 래퍼가 원본 addTitle의 반환값(true=신규 획득/
  // false=이미 보유)을 버리고 항상 undefined를 반환해서, 이 반환값에
  // if(window.addTitle(def))로 의존하는 grantTitle(quest/086, 실제
  // 칭호 지급의 지배적 경로 — 외부 호출 27곳)의 스탯 보너스/SP
  // 지급/연결 스킬 해금/토스트가 이 연출이 추가된 이후로 매번 조용히
  // 건너뛰어지던 문제. 반환값을 그대로 전달하도록 수정하고, 이미
  // 보유한 칭호(false)일 때는 "획득" 배너도 띄우지 않게 했다.
  const __origAT = window.addTitle;
  window.addTitle = function(titleData){
    const __r = __origAT.call(this, titleData);
    if(__r !== false) try{ setTimeout(()=>showTitleUnlockEffect(titleData), 300); }catch(e){}
    return __r;
  };
}

const _prevCallAI2 = window.callAI;

window.callAI = async function(history, injectedContext='', retryCount=0){
  let ctx = injectedContext;
  if(retryCount === 0 && (S?.msgCount||0) <= 3){
    const lastMem = getLastLifeMemoryContext();
    if(lastMem) ctx = ctx + lastMem;
  }
  return _prevCallAI2.call(this, history, ctx, retryCount);
};
}

