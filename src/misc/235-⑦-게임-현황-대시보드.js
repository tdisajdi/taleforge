// ⑦ 게임 현황 대시보드
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadPlayerExp, loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { getActiveEffects } from '../ui/155-⑭-메모리-패널-UI.js';
import { esc } from '../utils.js';
import { loadDynQuests, loadNPCs } from './001-block0-preamble.js';
import { loadParty } from './054-이동수단-시스템.js';
import { loadFoodWater, loadWorldTimer } from './251-통합-처리-함수-매-AI-응답-후-호출.js';

export function renderDashboard(){
  let panel = document.getElementById('p-dashboard');
  if(!panel){
    panel = document.createElement('div');
    panel.className='panel-ov'; panel.id='p-dashboard';
    panel.innerHTML=`<div class="panel">
      <div class="p-hdr"><span class="p-title">📊 게임 현황</span><button class="p-close" onclick="closeP('dashboard')">✕</button></div>
      <div class="p-body scrollable" id="pb-dashboard"></div>
    </div>`;
    document.body.appendChild(panel);
  }

  const body = document.getElementById('pb-dashboard');
  if(!body) return;

  const lv    = (typeof loadPlayerLevel==='function') ? loadPlayerLevel() : 1;
  const exp   = (typeof loadPlayerExp==='function') ? loadPlayerExp() : 0;
  const cycle = (typeof loadCycleCount==='function') ? loadCycleCount() : 0;
  const wt    = (typeof loadWorldTimer==='function') ? loadWorldTimer() : {};
  const fw    = (typeof loadFoodWater==='function') ? loadFoodWater() : {food:100,water:100};
  const fat   = S?._fatigue || 0;
  const activeQ = (typeof loadDynQuests==='function') ? loadDynQuests().filter(q=>q.status==='active') : [];
  const npcs  = (typeof loadNPCs==='function') ? loadNPCs() : [];
  const party = (typeof loadParty==='function') ? loadParty() : [];
  const effects = (typeof getActiveEffects==='function') ? getActiveEffects('player') : [];
  const hp    = S?.stats?.hp || 0;
  const maxHp = S?.stats?.maxHp || 100;
  const mp    = S?.stats?.mp || 0;
  const gold  = S?.gold || 0;
  const turn  = S?.msgCount || 0;
  const doom  = wt?.doomClock || 0;

  const bar = (v, max, color, width=100) => {
    const pct = Math.max(0,Math.min(100,v/max*100));
    return `<div style="height:4px;background:#0a0800;border-radius:2px;width:${width}px;display:inline-block;vertical-align:middle">
      <div style="width:${pct}%;height:100%;background:${color};border-radius:2px"></div>
    </div>`;
  };

  body.innerHTML = `
    <!-- 캐릭터 요약 -->
    <div style="padding:10px 12px;background:#0d0800;border:1px solid var(--border);margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:28px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(S?.character,{size:14}):(S?.character?.icon||'👤')}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:var(--gold)">${esc(S?.character?.name||'?')}</div>
          <div style="font-size:9px;color:var(--dim)">${esc(S?.character?.race||'')} ${esc(S?.character?.role||'')} · ${esc(S?.character?.socialRank||'')}</div>
          <div style="font-size:9px;color:#a080e0;margin-top:1px">⭐ Lv.${lv} · ${cycle}회차 · ${turn}턴</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:#f1c40f">💰 ${gold}G</div>
        </div>
      </div>
      <!-- HP/MP -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
        <div><div style="font-size:8px;color:var(--dim);margin-bottom:2px">❤️ HP ${hp}/${maxHp}</div>${bar(hp,maxHp,'#e05050')}</div>
        <div><div style="font-size:8px;color:var(--dim);margin-bottom:2px">💙 MP ${mp}/100</div>${bar(mp,100,'#4080d0')}</div>
      </div>
      <!-- 피로/식량/수분 -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
        <div><div style="font-size:8px;color:var(--dim);margin-bottom:2px">😓 피로 ${fat}</div>${bar(fat,100,fat>=50?'#e07030':'#8a8a3a',64)}</div>
        <div><div style="font-size:8px;color:var(--dim);margin-bottom:2px">🍖 식량 ${fw.food}</div>${bar(fw.food,100,fw.food<=20?'#e03030':'#6a9a3a',64)}</div>
        <div><div style="font-size:8px;color:var(--dim);margin-bottom:2px">💧 수분 ${fw.water}</div>${bar(fw.water,100,fw.water<=20?'#e03030':'#3a7aaa',64)}</div>
      </div>
    </div>

    <!-- 세계 상태 -->
    ${doom > 0 ? `
    <div style="padding:8px 12px;background:#0d0500;border:1px solid #3a1005;margin-bottom:8px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#c03030;margin-bottom:6px">🌍 세계 위기</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
        <div><div style="font-size:8px;color:var(--dim)">💀 둠 ${doom}%</div>${bar(doom,100,doom>=70?'#e03030':'#c07030')}</div>
        <div><div style="font-size:8px;color:var(--dim)">⚔️ 전쟁 ${wt.warProgress||0}%</div>${bar(wt.warProgress||0,100,'#e07030')}</div>
        <div><div style="font-size:8px;color:var(--dim)">🔮 봉인 ${wt.sealDecay||0}%</div>${bar(wt.sealDecay||0,100,'#9040c0')}</div>
      </div>
    </div>` : ''}

    <!-- 퀘스트 요약 -->
    <div style="padding:8px 12px;background:#080d05;border:1px solid #1a2a0a;margin-bottom:8px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#60a030;margin-bottom:5px">📜 진행 퀘스트 (${activeQ.length})</div>
      ${activeQ.length
        ? activeQ.slice(0,3).map(q=>`
          <div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid #0a1205">
            <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:16}):(q.icon||"📋")}</span>
            <div style="flex:1;font-size:9px;color:var(--text)">${esc(q.title)}</div>
            <span class="quest-grade-badge qgb-${q.grade||'B'}">${q.grade||'B'}</span>
          </div>`).join('')
        : '<div style="font-size:9px;color:var(--dim)">진행 중인 퀘스트 없음</div>'}
    </div>

    <!-- 상태이상 -->
    ${effects.length ? `
    <div style="padding:8px 12px;background:#0d0808;border:1px solid #2a1010;margin-bottom:8px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#e05050;margin-bottom:5px">⚡ 상태이상</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${effects.map(e=>{
          const def = (typeof window.STATUS_EFFECTS!=='undefined') ? window.STATUS_EFFECTS[e.id] : null;
          return `<span style="padding:2px 7px;background:${def?.color||'#4a4a4a'}22;border:1px solid ${def?.color||'#4a4a4a'}66;color:${def?.color||'#aaa'};font-size:9px;border-radius:2px">
            ${def?.icon||'?'} ${def?.name||e.id} (${e.duration||0}턴)
          </span>`;
        }).join('')}
      </div>
    </div>` : ''}

    <!-- 파티 -->
    ${party.length ? `
    <div style="padding:8px 12px;background:#050d08;border:1px solid #0a2a10;margin-bottom:8px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#40a060;margin-bottom:5px">⚔️ 파티 (${party.length}/8)</div>
      <div style="display:flex;gap:8px">
        ${party.map(m=>`<div style="text-align:center"><div style="font-size:18px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:18}):(m.icon||"👤")}</div><div style="font-size:8px;color:var(--dim)">${esc(m.name)}</div></div>`).join('')}
      </div>
    </div>` : ''}

    <!-- 스탯 쿨다운 -->
    ${Object.keys(S?._skillCooldowns||{}).length ? `
    <div style="padding:8px 12px;background:#05080d;border:1px solid #0a1a2a;margin-bottom:8px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#4a80d0;margin-bottom:5px">⏳ 스킬 쿨다운</div>
      ${Object.entries(S._skillCooldowns).map(([k,v])=>`
        <div style="display:flex;align-items:center;gap:6px;padding:2px 0">
          <span style="font-size:9px;color:var(--text);flex:1">${k}</span>
          <span style="font-size:9px;color:#4a80d0">${v}턴</span>
        </div>`).join('')}
    </div>` : ''}

    <div style="padding:8px 12px;text-align:center">
      <button onclick="renderDashboard()" style="padding:5px 14px;background:var(--bg-input);border:1px solid var(--border);color:var(--dim);font-size:8px;font-family:'Cinzel',serif;cursor:pointer">🔄 새로고침</button>
    </div>`;
}
window.renderDashboard = renderDashboard;

window.renderDashboard = renderDashboard;
