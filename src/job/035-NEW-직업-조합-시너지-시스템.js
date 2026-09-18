// [NEW] 직업 조합 시너지 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { AFFINITY_TABLE, ELEMENT_DEFS, JOB_ELEMENT_MAP, JOB_SYNERGIES, RACE_ELEMENT_MAP } from '../data/035-NEW-직업-조합-시너지-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { lsDel, lsGet, lsSet, toast } from '../utils.js';

export const JOB_SYNERGY_KEY   = "taleforge-job-synergy";

export const loadJobSynergy    = () => { const r = lsGet(JOB_SYNERGY_KEY); return r ? JSON.parse(r) : []; };

export const saveJobSynergy    = (s) => lsSet(JOB_SYNERGY_KEY, JSON.stringify(s));


export const checkJobSynergy = (currentJob, prevJobs = [], race = "") => {
  return JOB_SYNERGIES.filter(syn => {
    const allJobs = [currentJob, ...prevJobs, race].map(j => (j||"").toLowerCase());
    return syn.jobs.every(j => allJobs.some(pj => pj.includes(j.replace(/\(.*\)/,"").trim().toLowerCase())));
  });
};

export const AFFINITY_KEY     = "taleforge-affinity";

export const loadAffinity     = () => { try{ const r=lsGet(AFFINITY_KEY); return r?JSON.parse(r):{element:'none',resistances:{},weaknesses:{},immunities:[],bonuses:{}}; }catch(e){ return {element:'none',resistances:{},weaknesses:{},immunities:[],bonuses:{}}; } };

export const saveAffinity     = (a) => lsSet(AFFINITY_KEY, JSON.stringify(a));

export const clearAffinity    = () => lsDel(AFFINITY_KEY);

export function calcAffinityMod(attackElem, defenseElem) {
  if (!attackElem || attackElem === 'none' || !defenseElem || defenseElem === 'none') return { mod: 1.0, label: '일반', color: '#888' };
  // [B34 FIX] UI(상성 대조표)는 "동속성 ×0.8"이라 안내하지만 실제로는 동속성을
  // 별도 처리하는 분기가 없어, weak 배열에 자기 자신이 우연히 포함된 4개
  // 속성만 0.6배가 적용되고 나머지 8개는 1.0배로 처리되던 불일치. UI 안내와
  // 일치하도록 명시적 동속성 분기를 추가한다.
  if (attackElem === defenseElem) return { mod: 0.8, label: '동속성', color: '#c8a96e' };
  const tbl = AFFINITY_TABLE[attackElem];
  if (!tbl) return { mod: 1.0, label: '일반', color: '#888' };
  if (tbl.strong.includes(defenseElem)) return { mod: 1.5, label: '효과 탁월!', color: '#60ff60' };
  if (tbl.weak.includes(defenseElem))   return { mod: 0.6, label: '효과 미미...', color: '#ff6060' };
  return { mod: 1.0, label: '보통', color: '#c8a96e' };
}
window.calcAffinityMod = calcAffinityMod;

export function getCharElement() {
  const aff = loadAffinity();
  if (aff.element && aff.element !== 'none') return aff.element;
  const race = S.character?.race || '';
  const role = S.character?.role || '';
  for (const [key, elem] of Object.entries(RACE_ELEMENT_MAP)) {
    if (race.includes(key)) return elem;
  }
  for (const [key, elem] of Object.entries(JOB_ELEMENT_MAP)) {
    if (role.includes(key)) return elem;
  }
  return 'physical';
}
window.getCharElement = getCharElement;

export function setCharElement(elemId) {
  const aff = loadAffinity();
  const def = ELEMENT_DEFS[elemId];
  if (!def) return;
  // 이전 속성 보너스를 먼저 제거
  if (S.stats && aff.element && aff.element !== 'none' && aff.element !== elemId) {
    const prevDef = ELEMENT_DEFS[aff.element];
    if (prevDef) {
      Object.entries(prevDef.statBonus).forEach(([k, v]) => {
        if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v);
      });
    }
  }
  aff.element = elemId;
  // 새 속성 보너스 적용 (처음 설정이거나 다른 속성으로 변경 시만)
  if (S.stats) {
    Object.entries(def.statBonus).forEach(([k, v]) => {
      if (S.stats[k] !== undefined) S.stats[k] = Math.min(999, (S.stats[k]||50) + v);
    });
    window.updateHeader();
  }
  saveAffinity(aff);
  toast(`속성 설정: ${def.name} 속성! (${Object.entries(def.statBonus).map(([k,v])=>k.toUpperCase()+'+'+v).join(', ')})`, 3500, def);
  // DOM에 직접 반영
  const pb = document.getElementById('pb-affinity');
  if (pb) pb.innerHTML = renderAffinityPanel();
}
window.setCharElement = setCharElement;

export function getAffinityBattleInfo(enemyElement) {
  const myElem = getCharElement();
  const attackMod = calcAffinityMod(myElem, enemyElement);   // 내가 공격할 때
  const defenseMod = calcAffinityMod(enemyElement, myElem);  // 적이 공격할 때 (역상성)
  const myDef = ELEMENT_DEFS[myElem];
  const enDef = ELEMENT_DEFS[enemyElement];
  return { myElem, enemyElement, myDef, enDef, attackMod, defenseMod };
}
window.getAffinityBattleInfo = getAffinityBattleInfo;

export function renderAffinityPanel() {
  const aff = loadAffinity();
  const currentElem = getCharElement();
  const myDef = ELEMENT_DEFS[currentElem] || ELEMENT_DEFS.physical;
  const table = AFFINITY_TABLE[currentElem] || { strong:[], weak:[], neutral:[] };

  return `<div style="margin-bottom:14px">
    <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:8px;letter-spacing:1px">⚗️ 속성 상성 시스템</div>
    
    <!-- 현재 속성 표시 -->
    <div style="padding:10px 12px;background:${myDef.bgColor};border:2px solid ${myDef.color};border-radius:3px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="color:${myDef.color};display:inline-flex;flex-shrink:0;transform:scale(1.09)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(myDef,{size:16}):(myDef.svgIcon||myDef.icon)}</span>
        <div>
          <div style="font-family:Cinzel,serif;font-size:12px;color:${myDef.color}">나의 속성: ${myDef.name}</div>
          <div style="font-size:9px;color:var(--dim);margin-top:1px">${myDef.desc}</div>
        </div>
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:5px">
        ${Object.entries(myDef.statBonus).map(([k,v])=>`<span style="font-size:9px;padding:2px 6px;background:${myDef.color}22;border:1px solid ${myDef.color}55;color:${myDef.color};border-radius:2px">${k.toUpperCase()} +${v}</span>`).join('')}
      </div>
      <!-- 강점/약점 -->
      <div style="font-size:9px;color:#60ff60;margin-bottom:3px">✅ 강세 (1.5×): ${table.strong.map(e=>(typeof getEntityIconHTML==='function'?getEntityIconHTML(ELEMENT_DEFS[e],{size:12}):(ELEMENT_DEFS[e]?.icon||''))+' '+ELEMENT_DEFS[e]?.name).join(', ')||'없음'}</div>
      <div style="font-size:9px;color:#ff6060">❌ 약세 (0.6×): ${table.weak.map(e=>(typeof getEntityIconHTML==='function'?getEntityIconHTML(ELEMENT_DEFS[e],{size:12}):(ELEMENT_DEFS[e]?.icon||''))+' '+ELEMENT_DEFS[e]?.name).join(', ')||'없음'}</div>
    </div>

    <!-- 속성 선택 그리드 -->
    <div style="font-family:Cinzel,serif;font-size:9px;color:var(--dim);margin-bottom:6px;letter-spacing:1px">속성 변경</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:10px">
      ${Object.values(ELEMENT_DEFS).map(def=>`
        <div onclick="setCharElement('${def.id}')" style="cursor:pointer;padding:6px 4px;background:${def.id===currentElem?def.bgColor:'#0d0800'};border:2px solid ${def.id===currentElem?def.color:'#2a1a05'};border-radius:3px;text-align:center;transition:all .15s" onmouseover="this.style.borderColor='${def.color}'" onmouseout="this.style.borderColor='${def.id===currentElem?def.color:'#2a1a05'}'">
          <div style="font-size:16px;margin-bottom:2px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:16}):(def.icon)}</div>
          <div style="font-family:Cinzel,serif;font-size:8px;color:${def.color}">${def.name}</div>
        </div>`).join('')}
    </div>

    <!-- 상성 대조표 -->
    <div style="font-family:Cinzel,serif;font-size:9px;color:var(--dim);margin-bottom:6px;letter-spacing:1px">⚔️ 속성 상성 대조표</div>
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:8px">
        <thead>
          <tr>
            <th style="padding:3px 5px;background:#150d03;color:var(--gold);font-family:Cinzel,serif;text-align:left;border:1px solid #2a1a05">공격↓ / 방어→</th>
            ${Object.values(ELEMENT_DEFS).map(d=>`<th style="padding:3px 4px;background:#150d03;color:${d.color};border:1px solid #2a1a05;text-align:center" title="${d.name}">${d.icon}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${Object.values(ELEMENT_DEFS).map(atk=>{
            const row = AFFINITY_TABLE[atk.id];
            return `<tr>
              <td style="padding:3px 5px;background:#0d0800;color:${atk.color};border:1px solid #2a1a05;font-size:9px">${atk.icon} ${atk.name}</td>
              ${Object.values(ELEMENT_DEFS).map(def=>{
                const isStrong = row?.strong?.includes(def.id);
                const isWeak   = row?.weak?.includes(def.id);
                const isSame   = atk.id === def.id;
                const bg = isStrong?'#0a3a0a':isWeak?'#3a0a0a':isSame?'#1a1505':'#0d0800';
                const txt = isStrong?'🟢':isWeak?'🔴':isSame?'🟡':'⚪';
                const val = isStrong?'×1.5':isWeak?'×0.6':isSame?'×0.8':'×1.0';
                return `<td style="padding:3px;background:${bg};border:1px solid #2a1a05;text-align:center" title="${val}">${txt}</td>`;
              }).join('')}
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:5px;display:flex;gap:8px;font-size:9px;color:var(--dim)">
      <span>🟢 효과 탁월 ×1.5</span><span>🔴 효과 미미 ×0.6</span><span>🟡 동속성 ×0.8</span><span>⚪ 보통 ×1.0</span>
    </div>
  </div>`;
}
window.renderAffinityPanel = renderAffinityPanel;

window.renderAffinityPanel = renderAffinityPanel;

window.setCharElement      = setCharElement;

window.getCharElement      = getCharElement;

window.calcAffinityMod     = calcAffinityMod;

window.getAffinityBattleInfo = getAffinityBattleInfo;
