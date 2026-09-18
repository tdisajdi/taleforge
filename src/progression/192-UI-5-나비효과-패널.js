// ★ UI-5: 나비효과 패널
// Auto-extracted from taleforge.html (original section banner preserved above).
import { BUTTERFLY_EFFECTS } from '../data/015-시스템-1120.js';
import { loadButterfly } from '../misc/015-시스템-1120.js';
import { loadCycleCount } from './014-환생-누적-시스템-110번.js';

export function renderButterflyPanel(){
  const body = document.getElementById('pb-butterfly');
  if(!body){
    if(!document.getElementById('p-butterfly')){
      const el = document.createElement('div');
      el.className='panel-ov'; el.id='p-butterfly';
      el.innerHTML=`<div class="panel"><div class="p-head"><span class="p-title">🦋 나비효과</span><button class="p-close" onclick="closeP('butterfly')">✕</button></div><div class="p-body scrollable" id="pb-butterfly"></div></div>`;
      document.body.appendChild(el);
    }
    return renderButterflyPanel();
  }

  const cycle = typeof loadCycleCount==='function' ? loadCycleCount() : 0;
  const butterflies = typeof loadButterfly==='function' ? loadButterfly() : [];

  if(cycle === 0 || !butterflies.length){
    body.innerHTML = `
      <div style="padding:30px 20px;text-align:center">
        <div style="font-size:40px;margin-bottom:12px;opacity:.3">🦋</div>
        <div style="font-size:11px;color:var(--dim);line-height:1.7">아직 기록된 나비효과가 없습니다.<br>환생을 경험하면 전생의 선택이<br>이 세계에 흔적을 남깁니다.</div>
      </div>`;
    return;
  }

  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:4px">🦋 나비효과</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:12px">전생의 선택이 이 세계에 남긴 흔적 — ${butterflies.length}개</div>
      ${butterflies.map(b=>{
        const def = typeof BUTTERFLY_EFFECTS!=='undefined' ? BUTTERFLY_EFFECTS[b.type] : null;
        const worldEcho = b.worldChange || (def?.worldEcho ? def.worldEcho(b.data||{}) : '');
        const aiHint    = b.desc || (def?.aiHint ? def.aiHint(b.data||{}) : '');
        const label     = b.desc || def?.label || b.type || '알 수 없는 흔적';
        return `
          <div style="padding:10px 12px;background:#080600;border:1px solid #2a1a00;margin-bottom:8px;border-left:3px solid #c8a96e44">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:16px">🦋</span>
              <div>
                <div style="font-family:Cinzel,serif;font-size:10px;color:#c8a96e">${label}</div>
                <div style="font-size:8px;color:var(--dim)">${new Date(b.addedAt||Date.now()).toLocaleDateString('ko-KR')}</div>
              </div>
            </div>
            ${worldEcho?`<div style="font-size:9px;color:#a08040;line-height:1.6;margin-bottom:4px;padding:6px;background:#050300;border-radius:2px">🌍 ${worldEcho}</div>`:''}
            ${aiHint?`<div style="font-size:9px;color:#6a8a6a;line-height:1.6;padding:5px;background:#040500;border-radius:2px">💡 AI 힌트: ${aiHint}</div>`:''}
          </div>`;
      }).join('')}
    </div>`;
}
window.renderButterflyPanel = renderButterflyPanel;

window.renderButterflyPanel = renderButterflyPanel;
