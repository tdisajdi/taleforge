// ★ NEW 3: 속성 상성 심화 매트릭스 UI
// Auto-extracted from taleforge.html (original section banner preserved above).
import { AFFINITY_TABLE, ELEMENT_DEFS } from '../data/035-NEW-직업-조합-시너지-시스템.js';
import { loadAffinity } from '../job/035-NEW-직업-조합-시너지-시스템.js';

export function renderAffinityMatrixPanel(){
  const body = document.getElementById('pb-affinity-matrix');
  if(!body) return;
  const myAff = loadAffinity();
  const myElem = myAff.element||'none';
  const myDef = myElem!=='none' ? ELEMENT_DEFS[myElem] : null;
  const myTable = myElem!=='none' ? AFFINITY_TABLE[myElem] : null;

  const elemList = Object.values(ELEMENT_DEFS);
  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:4px">🔮 속성 상성 매트릭스</div>
      ${myDef?`
        <div style="padding:10px;background:#0a0805;border:1px solid ${myDef.color}44;margin-bottom:12px;border-radius:4px">
          <div style="font-size:12px;color:${myDef.color};margin-bottom:4px;display:flex;align-items:center;gap:4px"><span style="display:inline-flex;width:14px;height:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(myDef,{size:14}):((myDef.svgIcon||'').replace('width="20" height="20"','width="14" height="14"')||myDef.icon)}</span> 내 속성: ${myDef.name}</div>
          <div style="font-size:9px;color:var(--dim);margin-bottom:6px">${myDef.desc}</div>
          ${myTable?`
            <div style="font-size:9px;color:#60c060;margin-bottom:2px">⚡ 유리: ${(myTable.strong||[]).map(e=>(typeof getEntityIconHTML==='function'?getEntityIconHTML(ELEMENT_DEFS[e],{size:12}):(ELEMENT_DEFS[e]?.icon||''))+ELEMENT_DEFS[e]?.name).join(' ')}</div>
            <div style="font-size:9px;color:#e05050;">🛡️ 불리: ${(myTable.weak||[]).map(e=>(typeof getEntityIconHTML==='function'?getEntityIconHTML(ELEMENT_DEFS[e],{size:12}):(ELEMENT_DEFS[e]?.icon||''))+ELEMENT_DEFS[e]?.name).join(' ')}</div>
          `:''}
        </div>
      `:`<div style="font-size:10px;color:var(--dim);margin-bottom:12px;padding:8px;background:#060604;border:1px solid #1a1a1a">속성 미지정 — 종족/직업으로 자동 부여됩니다.</div>`}
      <div style="font-family:Cinzel,serif;font-size:9px;color:#a08040;margin-bottom:8px">전체 상성표</div>
      <div style="overflow-x:auto">
        <table style="border-collapse:collapse;font-size:8px;min-width:100%">
          <tr><th style="padding:3px 5px;color:var(--dim);text-align:left;border-bottom:1px solid #2a2000">공격↓ / 방어→</th>
            ${elemList.map(e=>`<th style="padding:3px 4px;color:${e.color};writing-mode:vertical-lr;font-size:8px;height:50px">${e.icon}</th>`).join('')}
          </tr>
          ${elemList.map(atk=>{
            const table = AFFINITY_TABLE[atk.id]||{strong:[],weak:[],neutral:[]};
            return `<tr style="border-bottom:1px solid #1a1400">
              <td style="padding:3px 6px;color:${atk.color};white-space:nowrap">${atk.icon} ${atk.name}</td>
              ${elemList.map(def=>{
                let bg='#060604', symbol='—', color='#3a3a3a';
                if((table.strong||[]).includes(def.id)){ bg='#0a1a00'; symbol='◎'; color='#60c060'; }
                else if((table.weak||[]).includes(def.id)){ bg='#1a0500'; symbol='✕'; color='#e05050'; }
                const isMe = myElem===atk.id||myElem===def.id;
                return `<td style="padding:3px 4px;text-align:center;background:${bg};${isMe?'outline:1px solid #c8a96e44;':''}"
                  title="${atk.name}→${def.name}: ${(table.strong||[]).includes(def.id)?'유리':(table.weak||[]).includes(def.id)?'불리':'중립'}">
                  <span style="color:${color}">${symbol}</span></td>`;
              }).join('')}
            </tr>`;
          }).join('')}
        </table>
      </div>
      <div style="margin-top:8px;font-size:8px;color:var(--dim)">◎ 유리 (+50% 피해) &nbsp; — 중립 &nbsp; ✕ 불리 (-40% 피해)</div>
    </div>`;
}
window.renderAffinityMatrixPanel = renderAffinityMatrixPanel;

window.renderAffinityMatrixPanel = renderAffinityMatrixPanel;

// [17차 감사 FIX — 제거] 이 함수는 코드베이스 어디서도 호출되지 않는
// 완전한 고아 코드였다. 실제 전투 엔진(misc/328)이 쓰는 속성 상성 계산은
// job/035의 calcAffinityMod(같은 AFFINITY_TABLE 기반, +50%/-40%)이고
// 이 화면(위 매트릭스 UI)의 안내 문구도 "+50%/-40%"로 그 값과 일치한다.
// 반면 이 함수는 +30%/-20%로 값 자체가 다르고 실제로 쓰인 적도 없어
// UI 문구와 실제 전투 계산 어느 쪽과도 안 맞는 죽은 중복 구현이었다.
