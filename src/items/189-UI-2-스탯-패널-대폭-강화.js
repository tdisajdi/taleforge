// ★ UI-2: 스탯 패널 대폭 강화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { STAT_DEFS } from '../data/010-스킬-강화-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadPlayerExp, loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadEmotion } from '../misc/001-block0-preamble.js';
import { getKarmaRollBonus } from '../progression/202-NEW-9-카르마-실제-판정-반영.js';
import { getStatSparkline, loadStatHistory, recordStatSnapshot, saveStatHistory } from '../ui/234-⑥-스탯-성장-미니-스파크라인-그래프-renderStats-보강.js';
import { $ } from '../utils.js';

(function initStatHistory(){
  setTimeout(()=>{
    if(!S?.stats) return;
    const h = loadStatHistory();
    if(Object.keys(h).length === 0){
      const snap = {};
      ['str','agi','end','mgc','int','per','luk','wil'].forEach(k=>{ snap[k]=S.stats[k]||50; });
      h['0'] = snap;
      saveStatHistory(h);
    }
  }, 2000);
})();

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_166(){
function renderStats(){
  const body = $('pb-stats');
  if(!body) return;

  const lv  = loadPlayerLevel()||1;
  const exp = loadPlayerExp()||0;
  const EXP_PER_LEVEL = 100;
  const expPct = Math.min(100, Math.round((exp % EXP_PER_LEVEL) / EXP_PER_LEVEL * 100));
  const expToNext = EXP_PER_LEVEL - (exp % EXP_PER_LEVEL);
  const emotion = typeof loadEmotion==='function' ? loadEmotion() : null;
  const karma = S.stats?.krma??50;
  const karmaLabel = karma>=80?'✨ 선량':karma>=60?'🌟 선':karma>=40?'⚖️ 중립':karma>=20?'🌑 악':'💀 극악';
  const karmaColor = karma>=60?'#60c060':karma>=40?'#a0a060':'#e05050';
  const kb = typeof getKarmaRollBonus==='function' ? getKarmaRollBonus() : {label:''};

  // 스탯 그룹 정의
  const STAT_LABELS = {combat:'⚔️ 전투',social:'🗣️ 사회',mental:'🧠 정신',survival:'🍖 생존',mystery:'🔮 신비'};

  let html = `
    <!-- 레벨/EXP -->
    <div style="padding:10px 14px;background:#08060a;border-bottom:1px solid #1a1020">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div style="font-family:Cinzel,serif;font-size:18px;color:#a080e0">Lv.${lv}</div>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--dim);margin-bottom:3px">
            <span>EXP ${exp}</span><span>다음 레벨까지 ${expToNext}</span>
          </div>
          <div style="height:5px;background:#1a1020;border-radius:3px;overflow:hidden">
            <div style="width:${expPct}%;height:100%;background:linear-gradient(90deg,#6040a0,#a080e0);border-radius:3px;transition:width .5s"></div>
          </div>
        </div>
        ${emotion?`<div style="font-size:11px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(emotion,{size:11}):(emotion.icon||"")}<span style="font-size:8px;color:var(--dim)">${emotion.label||''}</span></div>`:''}
      </div>
      <!-- 카르마 -->
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:9px;color:var(--dim)">카르마</span>
        <div style="flex:1;height:4px;background:#1a1a1a;border-radius:2px;overflow:hidden">
          <div style="width:${Math.max(0,Math.min(100,karma))}%;height:100%;background:${karmaColor};border-radius:2px;transition:width .4s"></div>
        </div>
        <span style="font-size:9px;color:${karmaColor}">${karmaLabel}</span>
        ${kb.label?`<span style="font-size:8px;color:var(--dim)">(${kb.label})</span>`:''}
      </div>
    </div>

    <!-- 스탯 목록 -->
    <div style="padding:8px 14px">`;

  if(typeof STAT_DEFS !== 'undefined'){
    Object.entries(STAT_DEFS).forEach(([grp, defs])=>{
      html += `<div style="font-family:Cinzel,serif;font-size:9px;color:#a08040;letter-spacing:1px;margin:8px 0 5px">${STAT_LABELS[grp]||grp}</div>`;
      defs.forEach(d=>{
        const v   = Math.round(S.stats?.[d.id]||0);
        const pct = Math.min(100, Math.max(0, v/999*100));
        const sparkline = typeof getStatSparkline==='function' ? getStatSparkline(d.id) : '';
        // 기본값(10 또는 50) 대비 보너스 계산
        const base  = (d.id==='hp'||d.id==='mp') ? 100 : 10;
        const bonus = v - base;
        const bonusStr = bonus>0 ? `<span style="color:#60c060;font-size:8px">+${bonus}</span>` :
                         bonus<0 ? `<span style="color:#e05050;font-size:8px">${bonus}</span>` : '';
        html += `
          <div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid #0f0c00">
            <span style="font-size:12px;width:16px;text-align:center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(d,{size:12}):(d.icon)}</span>
            <span style="font-size:9px;color:var(--dim);width:52px;flex-shrink:0">${d.name}</span>
            <div style="flex:1;height:4px;background:#1a1200;border-radius:2px;overflow:hidden">
              <div style="width:${pct}%;height:100%;background:${d.color||'#c8a96e'};border-radius:2px;transition:width .4s"></div>
            </div>
            <span style="font-size:10px;color:${d.color||'#c8a96e'};width:30px;text-align:right">${v}</span>
            ${bonusStr}
            <span style="width:42px;flex-shrink:0">${sparkline}</span>
          </div>`;
      });
    });
  }

  html += `</div>`;
  body.innerHTML = html;

  // 스탯 스냅샷 기록
  if(typeof recordStatSnapshot==='function') recordStatSnapshot();
}
window.renderStats = renderStats;

window.renderStats = window.renderStats;
}

