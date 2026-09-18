// ④ 엔딩/클리어 조건 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadFactionRep } from '../npc/067-③-NPC-관계망-시스템.js';
import { renderNpcGraph, showNpcGraphDetail, switchNpcTab } from '../npc/226-①-NPC-관계도-시각화.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { recordHallOfFame } from '../progression/194-NEW-1-명예의-전당-Hall-of-Fame.js';
import { toast } from '../utils.js';
import { loadNPCs } from './001-block0-preamble.js';
import { loadEndings, loadParty, unlockEnding } from './054-이동수단-시스템.js';
import { loadWorldState } from './066-②-선택-결과-추적-시스템.js';
import { saveDiaryEntry } from './076-파트2-D-일기기록-시스템.js';
import { deletePlotHook, detectPlotHooks, manualAddPlotHook, renderPlotHookPanel, togglePlotHookResolved } from './227-②-복선미해결-떡밥-트래커.js';

export const SCENARIO_ENDING_DEFS = {
  medieval: [
    { id:'hero',      icon:'⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></svg>`, name:'왕국의 영웅',     color:'#c8a96e', epilogue:'당신은 왕국의 전설이 되었다. 음유시인들은 당신의 이름을 노래하고, 후대는 당신을 기억한다.', conds:[
      { key:'level',     label:'레벨 20+',              check: ()=> (typeof loadPlayerLevel==='function'?loadPlayerLevel():1) >= 20 },
      { key:'goodActs',  label:'선행 10회 이상',         check: ()=> (typeof loadWorldState==='function'?loadWorldState().goodActs:0) >= 10 },
      { key:'npcFriend', label:'호감도 70+ NPC 3명',    check: ()=> ((typeof loadNPCs==='function'?loadNPCs():[]).filter(n=>(n.relationship||50)>=70).length) >= 3 },
      { key:'quests',    label:'퀘스트 5회 이상 완료',   check: ()=> (S?.questsCompleted||0) >= 5 },
    ]},
    { id:'villain',   icon:'💀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>`, name:'어둠의 군주',      color:'#e05a5a', epilogue:'공포가 왕국을 뒤덮었다. 당신의 이름은 속삭임 속에 전해지고, 어머니들은 아이들에게 당신의 이야기로 겁을 준다.', conds:[
      { key:'level',     label:'레벨 20+',              check: ()=> (typeof loadPlayerLevel==='function'?loadPlayerLevel():1) >= 20 },
      { key:'evilActs',  label:'악행 15회 이상',         check: ()=> (typeof loadWorldState==='function'?loadWorldState().evilActs:0) >= 15 },
      { key:'factions',  label:'세력 2개 이상 적대',     check: ()=> { try{ const rep=typeof loadFactionRep==='function'?loadFactionRep():{};return Object.values(rep).filter(v=>v<-20).length>=2;}catch(e){return false;} } },
    ]},
    { id:'pacifist',  icon:'🕊️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20 C12 20 4 15.5 4 9.5 C4 6.5 6.2 4.5 8.8 4.5 C10.2 4.5 11.3 5.2 12 6.3 C12.7 5.2 13.8 4.5 15.2 4.5 C17.8 4.5 20 6.5 20 9.5 C20 15.5 12 20 12 20 Z" stroke-linejoin="round"/></svg>`, name:'평화의 사도',      color:'#4a9a6a', epilogue:'칼 한 번 들지 않고 세계를 바꿨다. 당신이 걸어간 자리마다 꽃이 피었다.', conds:[
      { key:'neg',       label:'협상 스탯 80+',          check: ()=> (S?.stats?.neg||0) >= 80 },
      { key:'goodActs',  label:'선행 20회 이상',         check: ()=> (typeof loadWorldState==='function'?loadWorldState().goodActs:0) >= 20 },
      { key:'allies',    label:'동맹 세력 2개 이상',     check: ()=> { try{ const rep=typeof loadFactionRep==='function'?loadFactionRep():{};return Object.values(rep).filter(v=>v>=30).length>=2;}catch(e){return false;} } },
    ]},
  ],
};

export function getCurrentEndingDefs() {
  const sid = S?.scenario?.id || '';
  for (const key of Object.keys(SCENARIO_ENDING_DEFS)) {
    if (sid.includes(key)) return SCENARIO_ENDING_DEFS[key];
  }
  // 기본 공통 엔딩
  return [
    { id:'survivor', icon:'🌟', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></svg>', name:'전설의 여정', color:'#c8a96e', epilogue:'긴 여정이 끝났다. 당신이 살아온 이야기는 이 세계의 일부가 되었다.', conds:[
      { key:'level',    label:'레벨 15+',       check: ()=> (typeof loadPlayerLevel==='function'?loadPlayerLevel():1) >= 15 },
      { key:'turn',     label:'80턴 이상 플레이', check: ()=> (S?.msgCount||0) >= 80 },
      { key:'npc',      label:'NPC 5명 이상 만남', check: ()=> ((typeof loadNPCs==='function'?loadNPCs():[]).length) >= 5 },
    ]},
  ];
}
window.getCurrentEndingDefs = getCurrentEndingDefs;

export function renderEndingCondPanel() {
  const body = document.getElementById('pb-endingcond');
  if (!body) return;

  const defs   = getCurrentEndingDefs();
  const endings = typeof loadEndings === 'function' ? loadEndings() : [];
  const charName = S?.character?.name || '주인공';

  let html = `<div style="padding:9px 13px;border-bottom:1px solid var(--border)">
    <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:3px">🏁 엔딩 달성 조건</div>
    <div style="font-size:9px;color:var(--dim)">${charName}의 이야기를 완성하세요. 조건을 모두 충족하면 엔딩 컷신이 열립니다.</div>
  </div>`;

  defs.forEach(def => {
    const checked = def.conds.map(c => { let ok=false; try{ok=c.check();}catch(e){} return {...c, ok}; });
    const passCount = checked.filter(c=>c.ok).length;
    const total = checked.length;
    const allPass = passCount === total;
    const alreadyDone = endings.some(e => e === def.id || e?.id === def.id);

    html += `<div style="padding:11px 13px;border-bottom:1px solid var(--border);${allPass&&!alreadyDone?'background:#0a1a0a;':''}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">
        <span style="color:${def.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:16}):(def.svgIcon||def.icon)}</span>
        <div style="flex:1">
          <div style="font-family:Cinzel,serif;font-size:12px;color:${def.color}">${def.name}</div>
          <div style="font-size:9px;color:var(--dim)">${passCount}/${total} 조건 충족</div>
        </div>
        ${alreadyDone ? '<span style="font-size:9px;color:#60a060;font-family:Cinzel,serif">✓ 달성</span>' : ''}
        ${allPass && !alreadyDone ? `<button onclick="triggerCustomEnding('${def.id.replace(/'/g,"\\'")}','${def.name.replace(/'/g,"\\'")}','${def.icon}','${def.epilogue.replace(/'/g,"\\'").replace(/\n/g,'\\n')}')" style="padding:4px 10px;background:${def.color};color:#0d0800;font-family:Cinzel,serif;font-size:8px;cursor:pointer;border:none;letter-spacing:.5px">엔딩 보기</button>` : ''}
      </div>
      <!-- 진행 바 -->
      <div style="height:3px;background:#1a1005;border-radius:2px;overflow:hidden;margin-bottom:8px">
        <div style="width:${Math.round((passCount/total)*100)}%;height:100%;background:${def.color};border-radius:2px;transition:width .4s"></div>
      </div>
      <!-- 조건 목록 -->
      ${checked.map(c=>`
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <span style="font-size:10px;width:14px;text-align:center">${c.ok?'✅':'⬜'}</span>
          <span style="font-size:10px;color:${c.ok?'var(--text)':'var(--dim)'}">${c.label}</span>
        </div>`).join('')}
    </div>`;
  });

  // 달성한 엔딩 목록
  if (endings.length) {
    html += `<div style="padding:9px 13px;border-bottom:1px solid var(--border)">
      <div style="font-family:Cinzel,serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:6px">달성한 엔딩</div>
      ${endings.map(e=>{
        const d = defs.find(x=>x.id===(e?.id||e)) || {};
        return `<div style="font-size:10px;color:${d.color||'var(--gold)'}">✓ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(d,{size:10}):(d.icon||"🏁")} ${d.name||e?.name||e||'엔딩'}</div>`;
      }).join('')}
    </div>`;
  }

  body.innerHTML = html;
}
window.renderEndingCondPanel = renderEndingCondPanel;

export function triggerCustomEnding(endingId, endingName, icon, epilogue) {
  const charName = S?.character?.name || '주인공';
  const epiText  = epilogue.replace(/\\n/g, '\n');

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;animation:fadeIn 1s;overflow-y:auto;';

  overlay.innerHTML = `
    <div style="text-align:center;max-width:400px;padding:30px 24px;animation:fadeIn .8s ease-out">
      <div style="font-size:64px;margin-bottom:14px;animation:fadeIn 1.2s">${icon}</div>
      <div style="font-family:Cinzel,serif;font-size:10px;color:#8a7a5a;letter-spacing:4px;margin-bottom:8px">— ENDING —</div>
      <div style="font-family:Cinzel,serif;font-size:20px;color:var(--gold);letter-spacing:2px;margin-bottom:6px">${endingName}</div>
      <div style="font-size:9px;color:#6a5a4a;margin-bottom:18px">${charName} · Lv.${typeof loadPlayerLevel==='function'?loadPlayerLevel():1} · ${S?.msgCount||0}턴</div>
      <div style="border-top:1px solid #3a2a0a;border-bottom:1px solid #3a2a0a;padding:18px 0;margin-bottom:20px">
        <div style="font-size:11px;color:#c8b898;line-height:2;white-space:pre-line;text-align:left">${epiText}</div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button onclick="this.closest('div[style*=z-index]').remove()" style="padding:10px 20px;background:linear-gradient(135deg,#2a1f0d,#3a2a10);border:1px solid var(--gold);color:var(--gold);font-family:Cinzel,serif;font-size:10px;cursor:pointer;letter-spacing:1px">계속하기</button>
        <button onclick="_recordAndClose(this,'${endingId.replace(/'/g,"\\'")}','${endingName.replace(/'/g,"\\'")}',this.closest('div[style*=z-index]'))" style="padding:10px 20px;background:#1a3a1a;border:1px solid #4a9a6a;color:#60a060;font-family:Cinzel,serif;font-size:10px;cursor:pointer;letter-spacing:1px">✓ 기록 후 종료</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
}
window.triggerCustomEnding = triggerCustomEnding;

export function _recordAndClose(btn, endingId, endingName, overlay) {
  // 달성 기록
  if (typeof unlockEnding === 'function') unlockEnding(endingId, endingName);
  if (typeof unlockAchievement === 'function') unlockAchievement('ending_cleared');
  if (typeof saveDiaryEntry === 'function') saveDiaryEntry('event', `🏁 엔딩 달성: ${endingName}`, S?.msgCount || 0);
  // [버그 수정] 이 조건부 커스텀 엔딩(triggerCustomEnding) 경로는
  // recordHallOfFame을 한 번도 호출하지 않아, quest/086의 AI 서사 엔딩
  // (triggerStoryEnding, 31탄에서 수정)과 달리 이쪽으로 엔딩을 달성하면
  // 명예의 전당에 영원히 기록되지 않았다. 같은 방식으로 연결한다.
  if (typeof recordHallOfFame === 'function') recordHallOfFame(endingId);
  toast(`🏁 엔딩 달성: ${endingName}`, 3000);
  if (overlay) overlay.remove();
  // 엔딩 조건 패널 갱신
  setTimeout(() => renderEndingCondPanel(), 200);
}
window._recordAndClose = _recordAndClose;

window.renderEndingCondPanel = renderEndingCondPanel;

window.triggerCustomEnding   = triggerCustomEnding;

window._recordAndClose       = _recordAndClose;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_203(){
window.renderNpcGraph        = renderNpcGraph;

window.showNpcGraphDetail    = showNpcGraphDetail;

window.switchNpcTab          = switchNpcTab;

window.renderPlotHookPanel   = renderPlotHookPanel;

window.togglePlotHookResolved= togglePlotHookResolved;

window.deletePlotHook        = deletePlotHook;

window.manualAddPlotHook     = manualAddPlotHook;

window.detectPlotHooks       = detectPlotHooks;
}

