// ⑥ 스탯 성장 미니 스파크라인 그래프 (renderStats 보강)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { STAT_DEFS } from '../data/010-스킬-강화-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { lsGet, lsSet } from '../utils.js';

export const STAT_HISTORY_KEY = 'tf-stat-history';

export function loadStatHistory(){ try{ return JSON.parse(lsGet(STAT_HISTORY_KEY)||'{}'); }catch(e){ return {}; } }
window.loadStatHistory = loadStatHistory;

export function saveStatHistory(d){ try{ lsSet(STAT_HISTORY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveStatHistory = saveStatHistory;

export function recordStatSnapshot(){
  if(!S?.stats) return;
  const h = loadStatHistory();
  const turn = S.msgCount || 0;
  // 10턴마다 스냅샷
  if(turn % 10 !== 0) return;
  const key = String(turn);
  const snap = {};
  ['str','agi','end','mgc','int','per','luk','wil'].forEach(k=>{ snap[k] = S.stats[k]||50; });
  h[key] = snap;
  // 최근 10개만 유지
  const keys = Object.keys(h).sort((a,b)=>+a-+b);
  if(keys.length > 10) keys.slice(0,-10).forEach(k=>delete h[k]);
  saveStatHistory(h);
}
window.recordStatSnapshot = recordStatSnapshot;

export function getStatSparkline(statKey){
  const h = loadStatHistory();
  const vals = Object.keys(h).sort((a,b)=>+a-+b).map(k=>h[k][statKey]).filter(v=>v!==undefined);
  if(vals.length < 2) return '';
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const w = 40, ht = 12;
  const pts = vals.map((v,i)=>`${Math.round(i/(vals.length-1)*w)},${Math.round((1-(v-min)/range)*ht)}`).join(' ');
  const trend = vals[vals.length-1] > vals[0] ? '#60d060' : vals[vals.length-1] < vals[0] ? '#e05050' : '#8a8a6a';
  return `<svg width="${w}" height="${ht}" style="vertical-align:middle;opacity:.7"><polyline points="${pts}" fill="none" stroke="${trend}" stroke-width="1.5"/></svg>`;
}
window.getStatSparkline = getStatSparkline;

// [버그 수정] _origRenderStats를 모듈 최상위(top-level)에서 캡처하고
// 있었는데, 진짜 renderStats(items/189)는 그 자체가 __tfDeferred_166
// 안에서 정의·할당된다 — 즉 이 파일의 최상위 코드가 실행되는 시점에는
// 모든 모듈의 최상위 코드는 물론 어떤 deferred 함수도 아직 하나도
// 실행되지 않은 상태라 window.renderStats는 항상 undefined였다.
// 결과적으로 _origRenderStats가 영원히 null로 고정되고, 이후
// __tfDeferred_209가 실행돼 window.renderStats를 이 래퍼로 덮어쓰면
// "진짜 스탯 패널을 그리는 코드"가 이제 아무도 호출할 수 없게 되어
// ⚙️ 스탯 패널을 열어도(openP('stats') → window.renderStats()) 완전히
// 빈 화면만 나오는 심각한 버그였다. __tfDeferred_166이 __tfDeferred_209보다
// 먼저 실행되므로(main.js의 배열 순서), 캡처를 deferred 함수 안으로
// 옮기기만 하면 그 시점엔 이미 진짜 renderStats가 할당돼 있어 정상 동작한다.
// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_209(){
const _origRenderStats = window.renderStats;
window.renderStats = function(){
  if(typeof _origRenderStats==='function') _origRenderStats.call(this);
  // 스파크라인 주입
  try{
    // STAT_DEFS에서 id→statKey 매핑 생성
    const nameToKey = {};
    if(typeof STAT_DEFS !== 'undefined'){
      Object.values(STAT_DEFS).flat().forEach(d=>{ if(d.name && d.id) nameToKey[d.name] = d.id; });
    }
    const rows = document.querySelectorAll('.stat-row');
    rows.forEach(row=>{
      const nm = row.querySelector('.st-nm');
      if(!nm) return;
      const statKey = nameToKey[nm.textContent.trim()];
      if(!statKey) return;
      const spark = getStatSparkline(statKey);
      if(!spark) return;
      const valEl = row.querySelector('.st-val');
      if(valEl && !valEl.querySelector('svg')){
        valEl.insertAdjacentHTML('beforebegin', `<span style="margin-right:4px">${spark}</span>`);
      }
    });
  }catch(e){}
};
}

