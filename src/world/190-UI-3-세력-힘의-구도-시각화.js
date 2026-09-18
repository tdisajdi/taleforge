// ★ UI-3: 세력 힘의 구도 시각화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { loadWarInfluence } from '../misc/068-전쟁-피해-플레이어-개입-시스템.js';
import { getCurrentFactions, loadFactionRep, loadFactionSim } from '../npc/067-③-NPC-관계망-시스템.js';
import { loadFactionHistory } from './199-NEW-6-세력-전쟁-영구-반영-시스템.js';

export function renderFactionPowerPanel(){
  const body = document.getElementById('pb-factions') || document.getElementById('pb-faction');
  if(!body) return;

  const factions   = typeof getCurrentFactions==='function' ? getCurrentFactions() : {};
  const rep        = typeof loadFactionRep==='function' ? loadFactionRep() : {};
  const warInf     = typeof loadWarInfluence==='function' ? loadWarInfluence() : {};
  const sim        = typeof loadFactionSim==='function' ? loadFactionSim() : {};
  const history    = typeof loadFactionHistory==='function' ? loadFactionHistory() : [];
  const factionNames = Object.keys(factions);

  if(!factionNames.length){
    body.innerHTML = `<div style="padding:20px;text-align:center;color:var(--dim);font-size:11px">세력 정보가 없습니다.</div>`;
    return;
  }

  // 세력별 종합 점수 계산 (플레이어 평판 + 전쟁 영향력)
  const scores = factionNames.map(name=>{
    const f   = factions[name];
    const r   = rep[name]||0;
    const inf = warInf[name]||100;
    const score = Math.round((inf * 0.6) + (r + 100) * 0.2);
    return { name, f, rep:r, inf, score };
  }).sort((a,b)=>b.score-a.score);

  const maxScore = Math.max(...scores.map(s=>s.score), 1);

  // 현재 전쟁 상태 파악
  // [버그 수정] loadFactionSim()이 실제로 반환하는 필드는 sim.tensions가
  // 아니라 sim.relations이고, 그 키도 '__'가 아니라 _simKey()가 만드는
  // '|||' 구분자다(npc/067 참고) — 그 결과 이 패널은 항상 빈 객체만
  // 읽어 실제 전쟁 여부와 무관하게 "⚔️ 현재 전쟁" 배너·전쟁중 표시가
  // 한 번도 뜬 적이 없었다.
  const relations = sim.relations||{};
  const wars = [];
  Object.entries(relations).forEach(([k,t])=>{
    if(t>=90){
      const [a,b] = k.split('|||');
      if(a&&b) wars.push({a,b});
    }
  });

  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <button onclick="if(typeof renderFactionPanel==='function'){window._factionView='list';renderFactionPanel();}"
          style="background:none;border:1px solid var(--border);color:var(--dim);font-size:10px;padding:3px 8px;cursor:pointer;font-family:'Cinzel',serif">◀ 목록</button>
        <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;flex:1">🌍 세력 힘의 구도</div>
      </div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:12px">영향력 · 플레이어 평판 · 전쟁 현황</div>

      ${wars.length?`<div style="padding:6px 10px;background:#1a0500;border:1px solid #5a1010;margin-bottom:10px;font-size:9px;color:#e05050">
        ⚔️ 현재 전쟁: ${wars.map(w=>`${w.a} ↔ ${w.b}`).join(' / ')}
      </div>`:''}

      <!-- 힘의 구도 바 차트 -->
      ${scores.map((s,i)=>{
        const barPct = Math.round(s.score/maxScore*100);
        const repColor = s.rep>=50?'#60c060':s.rep>=0?'#c8a96e':s.rep>=-50?'#e08050':'#e05050';
        const repLabel = s.rep>=50?'동맹':s.rep>=20?'우호':s.rep>=-20?'중립':s.rep>=-50?'적대':'전쟁';
        const isWar = wars.some(w=>w.a===s.name||w.b===s.name);
        return `
          <div style="margin-bottom:10px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
              <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s.f,{size:14}):(s.f?.icon||'🏴')}</span>
              <div style="flex:1">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="font-family:Cinzel,serif;font-size:10px;color:#c8a96e">${s.name}</span>
                  <div style="display:flex;gap:6px;font-size:8px">
                    ${isWar?'<span style="color:#e05050">⚔️ 전쟁중</span>':''}
                    <span style="color:${repColor}">${repLabel} (${s.rep>0?'+':''}${s.rep})</span>
                  </div>
                </div>
                <div style="font-size:8px;color:var(--dim)">${s.f?.desc||''}</div>
              </div>
              <span style="font-size:9px;color:#a08040;width:24px;text-align:right">#${i+1}</span>
            </div>
            <!-- 영향력 바 -->
            <div style="display:flex;gap:4px;align-items:center">
              <div style="flex:1;height:6px;background:#1a1200;border-radius:3px;overflow:hidden">
                <div style="width:${barPct}%;height:100%;background:linear-gradient(90deg,${isWar?'#8a1010':'#4a6a20'},${isWar?'#e05050':'#80c040'});border-radius:3px;transition:width .5s"></div>
              </div>
              <span style="font-size:8px;color:var(--dim);width:28px;text-align:right">${s.score}</span>
            </div>
            <!-- 플레이어 평판 바 -->
            <div style="display:flex;gap:4px;align-items:center;margin-top:2px">
              <span style="font-size:7px;color:var(--dim);width:32px">나와</span>
              <div style="flex:1;height:3px;background:#1a1200;border-radius:2px;overflow:hidden;position:relative">
                <div style="position:absolute;left:50%;width:1px;height:100%;background:#2a2000"></div>
                ${s.rep>=0
                  ?`<div style="position:absolute;left:50%;width:${s.rep/2}%;height:100%;background:${repColor};border-radius:0 2px 2px 0"></div>`
                  :`<div style="position:absolute;right:50%;width:${-s.rep/2}%;height:100%;background:${repColor};border-radius:2px 0 0 2px"></div>`
                }
              </div>
              <span style="font-size:7px;color:${repColor};width:28px;text-align:right">${s.rep>0?'+':''}${s.rep}</span>
            </div>
          </div>`;
      }).join('')}

      <!-- 세력 역사 -->
      ${history.length?`
        <div style="margin-top:12px;border-top:1px solid #2a2000;padding-top:10px">
          <div style="font-family:Cinzel,serif;font-size:9px;color:#a08040;margin-bottom:6px">📜 최근 세력 사건</div>
          ${history.slice(0,5).map(h=>`
            <div style="font-size:9px;color:var(--dim);padding:3px 0;border-bottom:1px solid #0f0c00">
              <span style="color:#6a5a3a">턴${h.turn}</span>
              ${h.type==='war_end'?` ⚔️ ${h.factionA}이(가) ${h.factionB}에 승리`:`${h.factionA} ↔ ${h.factionB}`}
            </div>`).join('')}
        </div>
      `:''}
    </div>`;
}
window.renderFactionPowerPanel = renderFactionPowerPanel;

window.renderFactionPowerPanel = renderFactionPowerPanel;
