// [v49 ⑥] onclick 연결됐지만 정의 없던 함수들
// Auto-extracted from taleforge.html (original section banner preserved above).
import { CYCLE_RESET_EXTRA_KEYS, SAVE_DATA_ONLY_KEYS } from '../data/183-v49-⑥-onclick-연결됐지만-정의-없던-함수들.js';
import { findJob, loadWandererJobLegacy } from '../job/042-직업-시스템-무한-파생-도감.js';
import { lsSet } from '../utils.js';

export function clearAllGameData(){
  try{
    SAVE_DATA_ONLY_KEYS.forEach(k => { try{ localStorage.removeItem(k); }catch(e){} });
  }catch(e){ console.warn('[clearAllGameData]', e); }
}
window.clearAllGameData = clearAllGameData;

window.clearAllGameData = clearAllGameData;

export function doReset() {
  if (!confirm('정말 초기화하시겠습니까? 캐릭터·세이브 진행 상황이 삭제됩니다.\n(회차 수·도감·누적 플레이 기록은 유지됩니다)')) return;
  try {
    if (typeof clearAllGameData === 'function') clearAllGameData();
    else {
      // 게임 관련 키만 삭제
      Object.keys(localStorage).filter(k => k.startsWith('tf-') || k.startsWith('taleforge')).forEach(k => localStorage.removeItem(k));
    }
    location.reload();
  } catch(e) { location.reload(); }
}
window.doReset = doReset;

window.doReset = doReset;

export function doCycleOnlyReset(){
  if (!confirm('1회차로 돌아갑니다.\n\n초기화: 캐릭터·세이브·회차 수·영구 스탯 보너스·업적·히든직업 등\n유지: 도감·플레이 기록·매칭엔진 데이터 등 AI가 쌓은 모든 데이터\n\n계속하시겠습니까?')) return;
  try{
    [...SAVE_DATA_ONLY_KEYS, ...CYCLE_RESET_EXTRA_KEYS].forEach(k => { try{ localStorage.removeItem(k); }catch(e){} });
    location.reload();
  } catch(e) { location.reload(); }
}
window.doCycleOnlyReset = doCycleOnlyReset;

window.doCycleOnlyReset = doCycleOnlyReset;

export function doFactoryReset(){
  if (!confirm('⚠️ 완전 초기화는 회차 수, 발견한 몬스터/스킬 도감, 누적 플레이 기록까지 전부 삭제합니다.\n정말로 모든 것을 처음 상태로 되돌리시겠습니까? 되돌릴 수 없습니다.')) return;
  if (!confirm('마지막 확인입니다. 정말 모든 데이터를 삭제하시겠습니까?')) return;
  try {
    Object.keys(localStorage).filter(k => k.startsWith('tf-') || k.startsWith('taleforge')).forEach(k => localStorage.removeItem(k));
    location.reload();
  } catch(e) { location.reload(); }
}
window.doFactoryReset = doFactoryReset;

window.doFactoryReset = doFactoryReset;

export function toggleTheme() {
  try {
    const body = document.body;
    const isLight = body.classList.toggle('light-mode');
    if (typeof lsSet === 'function') lsSet('tf-theme', isLight ? 'light' : 'dark');
    const btn = document.querySelector('[onclick*="toggleTheme"]');
    if (btn) btn.textContent = isLight ? '🌙 다크' : '☀️ 라이트';
  } catch(e) {}
}
window.toggleTheme = toggleTheme;

window.toggleTheme = toggleTheme;

export function toggleGrp(id) {
  try {
    // [탭 무응답 FIX] 실제 submenu ID는 'sub-{id}' 형식
    const el = document.getElementById('sub-'+id) || document.getElementById(id);
    if (!el) return;
    const isOpen = el.classList.contains('open');
    // 다른 열린 서브메뉴 먼저 닫기
    document.querySelectorAll('.grp-submenu.open').forEach(m => m.classList.remove('open'));
    if (!isOpen) el.classList.add('open');
  } catch(e) {}
}
window.toggleGrp = toggleGrp;

export function closeGrp() {
  // [closeGrp 미정의 FIX] 모든 서브메뉴 닫기
  document.querySelectorAll('.grp-submenu.open').forEach(m => m.classList.remove('open'));
}
window.closeGrp = closeGrp;

window.toggleGrp = toggleGrp;

window.closeGrp = closeGrp;

export function openKeyPanel() {
  try {
    const panel = document.getElementById('key-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    } else {
      // 동적 생성
      const div = document.createElement('div');
      div.id = 'key-panel';
      div.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--panel);border:1px solid var(--gold);padding:20px;z-index:9999;max-width:400px;border-radius:4px;';
      div.innerHTML = '<h3 style="color:var(--gold);margin:0 0 10px">단축키</h3>' +
        '<p>Enter — 메시지 전송</p>' +
        '<p>Ctrl+Z — 마지막 메시지 취소</p>' +
        '<button onclick="this.parentElement.remove()" style="margin-top:10px;padding:5px 15px;">닫기</button>';
      document.body.appendChild(div);
    }
  } catch(e) {}
}
window.openKeyPanel = openKeyPanel;

window.openKeyPanel = openKeyPanel;

export function openWandererMemoryModal() {
  try {
    const existing = document.getElementById('wanderer-memory-modal');
    if (existing) { existing.remove(); return; }
    const div = document.createElement('div');
    div.id = 'wanderer-memory-modal';
    div.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;';

    const legacy = (typeof loadWandererJobLegacy === 'function') ? loadWandererJobLegacy() : [];
    // 최근 회차부터 보여준다.
    const sorted = [...legacy].sort((a,b)=>(b.cycle||0)-(a.cycle||0)).slice(0,10);

    const rows = sorted.map(entry => {
      const pathNames = (entry.path||[]).map(id=>{
        const job = (typeof findJob==='function') ? findJob(id) : null;
        return job ? `${job.icon||'💼'} ${job.name}` : id;
      }).join(' → ');
      return `<div style="padding:8px 0;border-top:1px solid var(--border)">
        <div style="font-size:9px;color:var(--gold);margin-bottom:3px">${entry.cycle||0}회차</div>
        <div style="font-size:11px;color:var(--text);line-height:1.5">${pathNames || '(기록 없음)'}</div>
      </div>`;
    }).join('');

    div.innerHTML = `<div style="background:var(--panel);border:1px solid var(--gold);padding:20px;max-width:500px;width:90%;border-radius:4px;max-height:80vh;overflow-y:auto;">
      <h3 style="color:var(--gold);">👻 방랑자의 기억</h3>
      <div style="font-size:10px;color:var(--dim);margin-bottom:8px;line-height:1.6">방랑자로 시작했던 지난 생들이 걸어간 직업의 길입니다. 정해진 길 없이 떠돌았던 흔적이 이렇게 남아있습니다.</div>
      ${sorted.length ? rows : `<div style="font-size:11px;color:var(--dim);padding:12px 0;text-align:center">아직 방랑자로 시작해 끝맺은 생이 없습니다.<br>방랑자로 플레이를 마치면 이곳에 그 여정이 기록됩니다.</div>`}
      <button onclick="document.getElementById('wanderer-memory-modal').remove()" style="margin-top:15px;padding:5px 15px;background:var(--gold);border:none;cursor:pointer;">닫기</button>
    </div>`;
    document.body.appendChild(div);
  } catch(e) {}
}
window.openWandererMemoryModal = openWandererMemoryModal;

window.openWandererMemoryModal = openWandererMemoryModal;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_161(){
function wmSwitchTab(tab) {
  try {
    document.querySelectorAll('.wm-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.wm-tab-btn').forEach(el => el.classList.remove('active'));
    const content = document.getElementById('wm-tab-' + tab);
    const btn = document.querySelector(`.wm-tab-btn[data-tab="${tab}"]`);
    if (content) content.style.display = 'block';
    if (btn) btn.classList.add('active');
  } catch(e) {}
}
window.wmSwitchTab = wmSwitchTab;

window.wmSwitchTab = wmSwitchTab;
}

