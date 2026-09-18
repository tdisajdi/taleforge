// 7. 만신전 패널 + 신화 패널 렌더링
// Auto-extracted from taleforge.html (original section banner preserved above).
import { RELIGIONS } from '../data/090-1-마스터-데이터.js';
import { RELIGION_WORLD_HISTORY } from '../data/115-2-창세신화-세계관-역사.js';
import { PANTHEON } from '../data/116-3-만신전-신격-존재-정의.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { WORLD_MYTHOLOGY } from '../world/115-2-창세신화-세계관-역사.js';
import { loadCodex } from '../world/304-④-세계-신화-백과사전.js';
import { getPlayerReligion } from './094-5-플레이어-종교-귀속-교화.js';

export function renderPantheonPanel(){
  const body = document.getElementById('pb-pantheon');
  if(!body){
    if(!document.getElementById('p-pantheon')){
      const el = document.createElement('div');
      el.className='panel-ov'; el.id='p-pantheon';
      el.innerHTML=`<div class="panel"><div class="p-head"><span class="p-title">🌌 만신전</span><button class="p-close" onclick="closeP('pantheon')">✕</button></div><div class="p-body scrollable" id="pb-pantheon"></div></div>`;
      document.body.appendChild(el);
    }
    return renderPantheonPanel();
  }

  const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;

  body.innerHTML = `<div style="padding:10px 14px">
    <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:4px">🌌 만신전</div>
    <div style="font-size:9px;color:var(--dim);margin-bottom:12px">이 세계를 움직이는 신격 존재들</div>
    ${Object.values(PANTHEON).map(deity=>{
      const isMine = RELIGIONS[rel]?.id === deity.religion;
      const rc = RELIGIONS[deity.religion]?.color||'#888';
      return `<div style="padding:10px 12px;background:#080600;border:1px solid ${isMine?rc+'88':'#1a1400'};margin-bottom:8px;${isMine?'border-left:3px solid '+rc+';':''}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="color:${rc};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(deity,{size:16}):(deity.svgIcon||deity.icon)}</span>
          <div style="flex:1">
            <div style="font-family:Cinzel,serif;font-size:11px;color:${rc}">${deity.name}</div>
            <div style="font-size:8px;color:var(--dim)">${deity.title} · ${RELIGIONS[deity.religion]?.name||deity.religion} · ${deity.tier}</div>
          </div>
          ${isMine?`<span style="font-size:8px;color:${rc}">내 신</span>`:''}
        </div>
        <div style="font-size:9px;color:var(--dim);margin-bottom:4px;font-style:italic">"${deity.domain.join(' · ')}"</div>
        <div style="font-size:9px;color:#8a7a5a;margin-bottom:3px">${deity.personality}</div>
        <div style="display:flex;gap:10px;font-size:8px">
          <span style="color:#60c060">🙏 ${deity.boonTo}</span>
          <span style="color:#e05050">⚡ ${deity.wrathAt}</span>
        </div>
        <div style="font-size:8px;color:#4a3a2a;margin-top:4px;padding-top:4px;border-top:1px solid #1a1200">${deity.lore}</div>
      </div>`;
    }).join('')}
  </div>`;
}
window.renderPantheonPanel = renderPantheonPanel;

window.renderPantheonPanel = renderPantheonPanel;

export function renderMythologyPanel(){
  const body = document.getElementById('pb-mythology');
  if(!body){
    if(!document.getElementById('p-mythology')){
      const el = document.createElement('div');
      el.className='panel-ov'; el.id='p-mythology';
      el.innerHTML=`<div class="panel"><div class="p-head"><span class="p-title">📖 세계 신화</span><button class="p-close" onclick="closeP('mythology')">✕</button></div><div class="p-body scrollable" id="pb-mythology"></div></div>`;
      document.body.appendChild(el);
    }
    return renderMythologyPanel();
  }

  const cycle = typeof loadCycleCount==='function'?loadCycleCount():0;
  const codex = typeof loadCodex==='function'?loadCodex():{};

  body.innerHTML = `<div style="padding:10px 14px">
    <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:4px">📖 세계 신화</div>
    <div style="font-size:9px;color:var(--dim);margin-bottom:12px">이 세계의 창세기와 역사 — 플레이하며 해금됩니다</div>

    ${Object.values(WORLD_MYTHOLOGY).map(myth=>{
      const unlocked = !myth.hidden || (cycle >= 1 && myth.unlockCondition?.includes('cycle')) || codex[myth.codexKey];
      return `<div style="padding:10px 12px;background:#080600;border:1px solid ${unlocked?'#2a2000':'#0f0c00'};margin-bottom:8px;opacity:${unlocked?1:0.4}">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
          <span style="font-size:16px">${unlocked?(typeof getEntityIconHTML==='function'?getEntityIconHTML(myth,{size:14}):(myth?.icon)):'🔒'}</span>
          <div style="font-family:Cinzel,serif;font-size:10px;color:${unlocked?'#c8a96e':'#3a3020'}">${unlocked?myth.title:'???'}</div>
        </div>
        <div style="font-size:9px;color:${unlocked?'#8a7a5a':'#2a2010'};line-height:1.7;white-space:pre-line">${unlocked?myth.text:'이 신화는 아직 해금되지 않았습니다.'}</div>
      </div>`;
    }).join('')}

    <div style="font-family:Cinzel,serif;font-size:10px;color:#a08040;margin:14px 0 8px">⚔️ 세계관 역사 연대표</div>
    ${RELIGION_WORLD_HISTORY.map(h=>`
      <div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid #0f0c00;font-size:9px">
        <span style="color:#6a5a3a;flex-shrink:0;width:36px">${h.year>0?'+'+h.year:h.year}년</span>
        <span style="font-size:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:12}):(h.icon)}</span>
        <span style="color:var(--dim)">${h.event}</span>
      </div>`).join('')}
  </div>`;
}
window.renderMythologyPanel = renderMythologyPanel;

window.renderMythologyPanel = renderMythologyPanel;
