// UI 패널
// Auto-extracted from taleforge.html (original section banner preserved above).
import { CLAN_DEFS, loadClanHistory, loadClanPlayer } from '../core/135-저장-키.js';

export function renderClanPanel(){
  // 패널 없으면 동적 생성
  if(!document.getElementById('pb-clan')){
    const el = document.createElement('div');
    el.className='panel-ov'; el.id='p-clan';
    el.innerHTML=`<div class="panel"><div class="p-head"><span class="p-title">🏴 가문·세력</span><button class="p-close" onclick="closeP('clan')">✕</button></div><div class="p-body scrollable" id="pb-clan"></div></div>`;
    document.body.appendChild(el);
  }
  const body = document.getElementById('pb-clan');
  if(!body) return;

  const cp = loadClanPlayer();
  const GRADE_COLOR = { S:'#c8a020', A:'#a060c0', B:'#4080c0', C:'#408060', D:'#806040' };
  const STATUS_LABEL = { none:'—', member:'소속', allied:'동맹', rival:'경계', enemy:'적대' };

  // 소속 가문 먼저, 나머지 등급순
  const sorted = Object.values(CLAN_DEFS).sort((a,b)=>{
    const order = {S:0,A:1,B:2,C:3,D:4};
    const am = cp[a.id]?.status==='member'?-1:0;
    const bm = cp[b.id]?.status==='member'?-1:0;
    return am-bm || order[a.grade]-order[b.grade];
  });

  body.innerHTML = `<div style="padding:10px 14px">
    <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:4px">🏴 세계의 가문과 세력</div>
    <div style="font-size:9px;color:var(--dim);margin-bottom:12px">가입·의뢰·반목·배신 — 모든 상호작용이 가능합니다</div>

    ${sorted.map(def=>{
      const state  = cp[def.id]||{status:'none',rep:0,rank:0};
      const isMember = state.status==='member';
      const gc     = GRADE_COLOR[def.grade]||'#888';
      const ranks  = def.ranks||[];
      const rankName = ranks[state.rank||0]||'—';
      const repBar = Math.max(0,Math.min(100,(state.rep||0)+100)/2); // -100~100 → 0~100%
      const repColor = (state.rep||0)>=30?'#60c060':(state.rep||0)>=-30?'#c8a96e':'#e05050';

      return `
        <div style="padding:10px 12px;background:#080600;border:1px solid ${isMember?gc+'88':'#1a1400'};margin-bottom:8px;${isMember?'border-left:3px solid '+gc+';':''}">
          <!-- 헤더 -->
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="color:${gc};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:16}):(def.svgIcon||def.icon)}</span>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-family:Cinzel,serif;font-size:11px;color:${gc}">${def.name}</span>
                <span style="font-size:8px;padding:1px 5px;background:${gc}22;border:1px solid ${gc}44;color:${gc}">${def.grade}등급</span>
                ${isMember?`<span style="font-size:8px;color:#60c060">● ${rankName}</span>`:''}
              </div>
              <div style="font-size:8px;color:var(--dim)">${def.domain}</div>
            </div>
            <div style="font-size:9px;color:${repColor};text-align:right">
              ${STATUS_LABEL[state.status||'none']}
              ${isMember?`<br><span style="font-size:8px">평판 ${state.rep||0}</span>`:''}
            </div>
          </div>

          <!-- 설명 -->
          <div style="font-size:9px;color:#8a7a5a;margin-bottom:4px;line-height:1.5">${def.desc}</div>

          ${isMember?`
            <!-- 평판 바 -->
            <div style="margin-bottom:6px">
              <div style="display:flex;justify-content:space-between;font-size:7px;color:var(--dim);margin-bottom:2px">
                <span>적대</span><span>평판 ${state.rep||0}</span><span>신뢰</span>
              </div>
              <div style="height:4px;background:#1a1200;border-radius:2px;overflow:hidden;position:relative">
                <div style="position:absolute;left:50%;width:1px;height:100%;background:#2a2000"></div>
                ${(state.rep||0)>=0
                  ?`<div style="position:absolute;left:50%;width:${(state.rep||0)/2}%;height:100%;background:${repColor};border-radius:0 2px 2px 0"></div>`
                  :`<div style="position:absolute;right:50%;width:${-(state.rep||0)/2}%;height:100%;background:${repColor};border-radius:2px 0 0 2px"></div>`
                }
              </div>
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap">
              <button onclick="leaveClan('${def.id}')" style="padding:3px 8px;background:#1a0800;border:1px solid #3a1a00;color:#a08060;font-size:8px;cursor:pointer">탈퇴</button>
              ${(state.rank||0) < (def.ranks||[]).length-1 && (state.rep||0)>=30
                ?`<button onclick="promoteClan('${def.id}')" style="padding:3px 8px;background:#0a1a0a;border:1px solid #2a4020;color:#60c060;font-size:8px;cursor:pointer">승진 시도</button>`
                :''}
            </div>
          `:state.status==='enemy'?`
            <div style="font-size:9px;color:#e05050;margin-top:4px">⚠️ 적대 상태 — 가입 불가</div>
          `:`
            <!-- 가입 정보 -->
            <details style="margin-top:4px">
              <summary style="font-size:8px;color:var(--dim);cursor:pointer;user-select:none">가입 조건 보기</summary>
              <div style="font-size:8px;color:#8a7a5a;margin-top:4px;padding:6px;background:#050300;border-radius:2px;line-height:1.6">
                ${def.joinReq?.note||'조건 없음'}
              </div>
            </details>
            <button onclick="joinClan('${def.id}')" style="margin-top:6px;padding:4px 10px;background:#0a0800;border:1px solid ${gc}44;color:${gc};font-size:9px;cursor:pointer">
              ${def.icon} 가입 시도
            </button>
          `}

          <!-- 철학 / 비밀 (접기) -->
          <details style="margin-top:6px">
            <summary style="font-size:8px;color:#4a3a2a;cursor:pointer;user-select:none">상세 정보 ▾</summary>
            <div style="margin-top:5px;font-size:8px;color:#6a5a4a;line-height:1.6">
              <div style="margin-bottom:3px">🗺️ <b>영역:</b> ${def.territory}</div>
              <div style="margin-bottom:3px">💭 <b>철학:</b> "${def.philosophy}"</div>
              <div style="margin-bottom:3px">👥 <b>우호:</b> ${(def.allies||[]).map(id=>CLAN_DEFS[id]?.name||id).join(', ')||'없음'}</div>
              <div style="margin-bottom:3px">⚔️ <b>적대:</b> ${(def.rivals||[]).map(id=>CLAN_DEFS[id]?.name||id).join(', ')||'없음'}</div>
              ${isMember?`<div style="margin-top:5px;padding:5px;background:#080600;border:1px solid #2a1a00;color:#a08060;font-style:italic">🔒 내부 비밀: ${def.secret}</div>`:''}
            </div>
          </details>
        </div>`;
    }).join('')}

    <!-- 히스토리 -->
    ${(()=>{
      const hist = loadClanHistory().slice().reverse().slice(0,10);
      if(!hist.length) return '';
      return `<div style="margin-top:12px;border-top:1px solid #2a2000;padding-top:10px">
        <div style="font-family:Cinzel,serif;font-size:9px;color:#a08040;margin-bottom:6px">📜 최근 가문 사건</div>
        ${hist.map(h=>`<div style="font-size:8px;color:var(--dim);padding:3px 0;border-bottom:1px solid #0f0c00">
          <span style="color:#6a5a3a">턴${h.turn}</span>
          <span style="margin-left:6px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(CLAN_DEFS[h.clanId],{size:14}):(CLAN_DEFS[h.clanId]?.icon||'🏴')} ${CLAN_DEFS[h.clanId]?.name||h.clanId}</span>
          <span style="margin-left:6px">${h.text}</span>
        </div>`).join('')}
      </div>`;
    })()}
  </div>`;
}
window.renderClanPanel = renderClanPanel;

window.renderClanPanel = renderClanPanel;

(function hookClanOpenP(){
  setTimeout(()=>{
    const orig = window.openP;
    if(typeof orig==='function' && !orig._clanPanelHooked){
      window.openP = function(id){
        const r = orig.apply(this, arguments);
        if(id==='clan') setTimeout(renderClanPanel, 50);
        return r;
      };
      window.openP._clanPanelHooked = true;
    }
  }, 4200);
})();

document.addEventListener('DOMContentLoaded', ()=>{
  setTimeout(()=>{
    if(!document.querySelector('.pc-menu-btn[onclick*="clan"]')){
      const ref = document.querySelector('.pc-menu-btn[onclick*="factions"]')
               || document.querySelector('.pc-menu-btn[onclick*="religion"]');
      if(ref){
        const btn = document.createElement('button');
        btn.className='pc-menu-btn';
        btn.setAttribute('onclick',"openP('clan');renderClanPanel()");
        btn.innerHTML='<span class="pc-ico">🏴</span><span class="pc-lbl">가문·세력</span>';
        ref.parentNode.insertBefore(btn, ref.nextSibling);
      }
    }
  }, 2000);
});

console.log('[TaleForge] 가문·세력 시스템 v1 로드 완료 ✓ (S~D등급 14개 / 가입·탈퇴·승진·평판·GS·BLS)');
