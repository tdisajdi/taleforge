// ② 복선/미해결 떡밥 트래커
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const PLOT_HOOK_KEY = 'tf-plothook';

export function loadPlotHooks()  { try { return JSON.parse(lsGet(PLOT_HOOK_KEY) || '[]'); } catch(e) { return []; } }
window.loadPlotHooks = loadPlotHooks;

export function savePlotHooks(d) { try { lsSet(PLOT_HOOK_KEY, JSON.stringify(d)); } catch(e) {} }
window.savePlotHooks = savePlotHooks;

export function detectPlotHooks(aiText) {
  if (!aiText) return;
  const lc = aiText;

  const PATTERNS = [
    { re: /그\s*이유는\s*(?:아직|나중에|언젠가)[^。\.。\n]{0,40}/g,       tag: '❓ 미공개 이유' },
    { re: /(?:언젠가|반드시|꼭)\s*(?:돌아오|갚아|복수하|밝혀)[^。\.。\n]{0,40}/g, tag: '🔮 예고된 귀환' },
    { re: /(?:비밀|숨겨진|감춰진)\s*(?:진실|과거|정체)[^。\.。\n]{0,40}/g, tag: '🗝️ 숨겨진 진실' },
    { re: /(?:저주|봉인|금기)[^。\.。\n]{0,40}/g,                          tag: '💀 저주·봉인' },
    { re: /(?:예언|계시|신탁|운명)[^。\.。\n]{0,40}/g,                     tag: '🌟 예언·운명' },
    { re: /(?:정체불명|알 수 없는|미지의)\s*[가나다라마바사아자차카타파하\w]+[^。\.。\n]{0,40}/g, tag: '👁️ 불명의 존재' },
    { re: /(?:아직 끝나지 않|이 일은 여기서 끝이 아)[^。\.。\n]{0,40}/g,  tag: '⚠️ 미완결' },
    { re: /(?:왜|어째서)\s*[^？\?。\.。\n]{5,40}[？\?]/g,                  tag: '❔ 미해결 질문' },
  ];

  const hooks = loadPlotHooks();
  const maxHooks = 30;
  let added = 0;

  PATTERNS.forEach(({ re, tag }) => {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(lc)) !== null) {
      const snippet = m[0].trim().slice(0, 60);
      if (snippet.length < 5) continue;
      // 중복 방지
      const isDup = hooks.some(h => h.snippet === snippet);
      if (isDup) continue;
      hooks.unshift({ id: Date.now() + added, tag, snippet, turn: S?.msgCount || 0, resolved: false, addedAt: new Date().toLocaleString('ko-KR', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' }) });
      added++;
      if (hooks.length > maxHooks) hooks.pop();
    }
  });

  if (added > 0) {
    savePlotHooks(hooks);
    toast(`🔍 복선 ${added}개 감지됨`, 1800);
  }
}
window.detectPlotHooks = detectPlotHooks;

export function renderPlotHookPanel() {
  const body = document.getElementById('pb-plothook');
  if (!body) return;
  const hooks = loadPlotHooks();

  const unresolved = hooks.filter(h => !h.resolved);
  const resolved   = hooks.filter(h =>  h.resolved);

  if (!hooks.length) {
    body.innerHTML = `<div style="text-align:center;padding:20px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:8px">🔍</div>
      아직 감지된 복선이 없습니다.<br>
      <span style="font-size:9px">AI 응답에서 예언·비밀·저주·미완결 내용이 나오면 자동으로 등록됩니다.</span><br><br>
      <button onclick="manualAddPlotHook()" style="padding:5px 12px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-size:9px;cursor:pointer">✍️ 직접 추가</button>
    </div>`;
    return;
  }

  const renderHooks = (list, isResolved) => list.map(h => `
    <div style="padding:9px 11px;background:${isResolved ? '#0a0a0a' : 'var(--bg-bubble-ai)'};border:1px solid ${isResolved ? '#2a1a05' : h.resolved ? '#2a1a05' : 'var(--border)'};margin-bottom:6px;opacity:${isResolved ? .5 : 1}">
      <div style="display:flex;align-items:flex-start;gap:7px">
        <span style="font-size:11px;flex-shrink:0">${h.tag.split(' ')[0]}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:9px;color:var(--gold);font-family:Cinzel,serif;margin-bottom:2px">${h.tag.slice(h.tag.indexOf(' ')+1)}</div>
          <div style="font-size:10px;color:var(--text);line-height:1.5">${h.snippet}</div>
          <div style="font-size:8px;color:var(--dim);margin-top:3px">턴 ${h.turn} · ${h.addedAt || ''}</div>
        </div>
      </div>
      <div style="display:flex;gap:5px;margin-top:6px">
        ${isResolved
          ? `<button onclick="togglePlotHookResolved(${h.id})" style="flex:1;padding:3px 6px;background:var(--bg-input);border:1px solid var(--border);color:var(--dim);font-size:8px;cursor:pointer">↩ 미해결로</button>`
          : `<button onclick="togglePlotHookResolved(${h.id})" style="flex:1;padding:3px 6px;background:#0a2010;border:1px solid #2a5a2a;color:#60a060;font-size:8px;cursor:pointer">✓ 해결됨</button>`
        }
        <button onclick="deletePlotHook(${h.id})" style="padding:3px 6px;background:var(--bg-input);border:1px solid var(--border);color:#6a3a3a;font-size:8px;cursor:pointer">✕</button>
      </div>
    </div>`).join('');

  body.innerHTML = `
    <div style="padding:8px 11px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
      <div style="font-size:9px;color:var(--dim)">미해결 <b style="color:var(--gold)">${unresolved.length}</b>건 · 해결 ${resolved.length}건</div>
      <button onclick="manualAddPlotHook()" style="padding:3px 8px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-size:8px;cursor:pointer">✍️ 직접 추가</button>
    </div>
    ${unresolved.length ? renderHooks(unresolved, false) : '<div style="padding:12px 13px;color:var(--dim);font-size:10px;text-align:center">미해결 복선 없음</div>'}
    ${resolved.length ? `<div style="padding:6px 11px;font-size:9px;color:var(--dim);border-top:1px solid var(--border);margin-top:4px">✓ 해결된 복선</div>${renderHooks(resolved, true)}` : ''}`;
}
window.renderPlotHookPanel = renderPlotHookPanel;

export function togglePlotHookResolved(id) {
  const hooks = loadPlotHooks();
  const h = hooks.find(x => x.id === id);
  if (h) h.resolved = !h.resolved;
  savePlotHooks(hooks);
  renderPlotHookPanel();
}
window.togglePlotHookResolved = togglePlotHookResolved;

export function deletePlotHook(id) {
  savePlotHooks(loadPlotHooks().filter(x => x.id !== id));
  renderPlotHookPanel();
}
window.deletePlotHook = deletePlotHook;

export function manualAddPlotHook() {
  const txt = prompt('복선 내용을 입력하세요:');
  if (!txt?.trim()) return;
  const hooks = loadPlotHooks();
  hooks.unshift({ id: Date.now(), tag: '✍️ 수동 등록', snippet: txt.trim().slice(0, 80), turn: S?.msgCount || 0, resolved: false, addedAt: new Date().toLocaleString('ko-KR', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' }) });
  savePlotHooks(hooks);
  renderPlotHookPanel();
}
window.manualAddPlotHook = manualAddPlotHook;

// [버그 수정] 이 자리에 있던 patchAIResponseForPlotHooks IIFE는 [B77 FIX]로
// 게이트 조건은 한 번 고쳤지만, window.detectConsequences를 감싸는 방식
// 자체가 여전히 죽은 코드였다 — quest/086이 detectConsequences를 직접
// import해 bare 호출하므로 이 재할당이 절대 도달하지 못했다(다른 죽은
// 훅들과 동일한 원인). detectPlotHooks(cleanText)는 quest/086에서
// detectConsequences(cleanText)를 실제로 호출하는 지점 바로 뒤에
// 네이티브로 옮겨 연결했다.
