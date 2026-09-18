// 🌀 3. 균열 소환 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { VOID_SUMMON_POOL } from '../data/023-3-균열-소환-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { gainDarklingVoid, loadDarklingVoid } from '../progression/020-101130번-환생-누적-시스템.js';
import { lsDel, lsGet, lsSet, toast } from '../utils.js';

export const VOID_SUMMON_KEY   = 'tf-darkling-summon';

export const loadVoidSummon    = () => { try { const r = lsGet(VOID_SUMMON_KEY); return r ? JSON.parse(r) : { totalSummons: 0, activeSummons: [], history: [], cooldown: 0 }; } catch(e) { return { totalSummons: 0, activeSummons: [], history: [], cooldown: 0 }; } };

export const saveVoidSummon    = (d) => { try { lsSet(VOID_SUMMON_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearVoidSummon   = () => lsDel(VOID_SUMMON_KEY);

export function getAvailableSummons() {
  const dv = loadDarklingVoid();
  const stage = dv.stage || 0;
  if (stage < 2) return [];
  // 현재 단계 이하의 모든 소환 풀 수집 (중복 제거)
  const pool = {};
  for (let s = 2; s <= stage; s++) {
    (VOID_SUMMON_POOL[s] || []).forEach(e => { pool[e.id] = e; });
  }
  return Object.values(pool);
}
window.getAvailableSummons = getAvailableSummons;

export function activateVoidSummon(summonId) {
  const race = S.character?.race || '';
  if (!race.includes('다크링') && !race.includes('darkling')) return;
  const available = getAvailableSummons();
  const summon = available.find(s => s.id === summonId);
  if (!summon) { toast('소환 불가: 현재 공허 단계가 너무 낮습니다.', 2000); return; }
  const mp = S.stats.mp !== undefined ? S.stats.mp : (S.stats.mgc || 50);
  if (mp < summon.mpCost) { toast(`MP 부족! ${summon.mpCost} MP 필요 (현재: ${mp})`, 2000); return; }
  // MP 차감
  if (S.stats.mp !== undefined) S.stats.mp = Math.max(0, S.stats.mp - summon.mpCost);
  else S.stats.mgc = Math.max(0, (S.stats.mgc || 50) - Math.floor(summon.mpCost / 2));
  const vs = loadVoidSummon();
  const entry = { ...summon, summonedAt: new Date().toISOString().slice(0, 16), duration: 3 };
  vs.activeSummons = vs.activeSummons || [];
  vs.activeSummons.push(entry);
  
  vs.totalSummons = (vs.totalSummons || 0) + 1;
  vs.history = vs.history || [];
  vs.history.push({ name: summon.name, icon: summon.icon, tier: summon.tier, at: entry.summonedAt });
  
  saveVoidSummon(vs);
  if (typeof saveStats === 'function') saveStats(S.stats);
  // 공허도 상승
  gainDarklingVoid('void_touch', summon.tier * 4);
  // AI 컨텍스트 주입
  if (S._nextInjectedContext !== undefined) {
    S._nextInjectedContext = (S._nextInjectedContext || '') + ` [다크링 공허 소환: ${summon.icon} "${summon.name}" 소환! ${summon.desc} MP -${summon.mpCost}]`;
  }
  window.updateHeader();
  toastHTML(`🌀 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(summon,{size:14}):(summon.icon)} ${esc(summon.name)} 소환! (MP -${esc(summon.mpCost)}, 공허도 +${esc(summon.tier*4)})`, 3500);
}
window.activateVoidSummon = activateVoidSummon;

export function dismissVoidSummon(idx) {
  const vs = loadVoidSummon();
  if (!vs.activeSummons || !vs.activeSummons[idx]) return;
  const dismissed = vs.activeSummons.splice(idx, 1)[0];
  saveVoidSummon(vs);
  toastHTML(`🌑 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(dismissed,{size:14}):(dismissed.icon)} ${esc(dismissed.name)} 귀환`, 2000);
}
window.dismissVoidSummon = dismissVoidSummon;

// [버그 수정] activateVoidSummon()이 각 소환체에 duration:3(3턴 지속)을
// 기록해두지만, 이 필드를 매 턴 감소시키거나 소진 시 제거하는 로직이
// 코드베이스 어디에도 없었다(전수조사로 확인) — 그 결과 균열 소환수는
// "3턴 지속"이라는 설계 의도와 달리 플레이어가 수동으로 귀환시키지
// 않는 한 영원히 활성 상태로 남아 계속 누적됐다. 다른 매 턴 tick
// 함수(tickNpcBonds/tickFactionSimulation)와 동일한 패턴으로, 매 턴
// duration을 1씩 줄이고 0 이하가 되면 자동 귀환시킨다.
export function tickVoidSummon() {
  try {
    const vs = loadVoidSummon();
    if (!vs.activeSummons || !vs.activeSummons.length) return;
    const remaining = [];
    const expired = [];
    vs.activeSummons.forEach(s => {
      const d = (s.duration !== undefined ? s.duration : 3) - 1;
      if (d > 0) remaining.push({ ...s, duration: d });
      else expired.push(s);
    });
    vs.activeSummons = remaining;
    saveVoidSummon(vs);
    if (expired.length) {
      expired.forEach(s => toastHTML(`🌑 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:14}):(s.icon||"")} ${esc(s.name)} 소환 지속시간 만료 — 균열 너머로 돌아갔다`, 2500));
    }
  } catch(e) { console.warn('[tickVoidSummon]', e); }
}
window.tickVoidSummon = tickVoidSummon;

export function renderVoidSummonPanel(containerId) {
  const body = document.getElementById(containerId);
  if (!body) return;
  const race = S.character?.race || '';
  if (!race.includes('다크링') && !race.includes('darkling')) {
    body.innerHTML = '<div style="text-align:center;padding:20px;color:#304060;font-size:10px">다크링 전용 시스템</div>';
    return;
  }
  const dv = loadDarklingVoid();
  const vs = loadVoidSummon();
  const stage = dv.stage || 0;
  const color = '#8040e0';
  const available = getAvailableSummons();
  const mp = S.stats.mp !== undefined ? S.stats.mp : (S.stats.mgc || 50);

  body.innerHTML = `
    <div style="padding:12px;background:linear-gradient(135deg,#050010,#0a0020);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:26px">🌀</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:${color}">균열 소환</div>
          <div style="font-size:9px;color:#402060">공허 ${stage}단계 · 소환 가능 ${available.length}종 · 활성 ${(vs.activeSummons||[]).length}체</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:9px;color:#402060">현재 MP</div>
          <div style="font-family:'Cinzel',serif;font-size:14px;color:${color}">${mp}</div>
        </div>
      </div>
      ${stage < 2 ? `<div style="margin-top:8px;padding:6px;background:#05000a;border:1px solid #2a0050;border-radius:2px;font-size:9px;color:#402060">⚠️ 공허 2단계 이상에서 소환이 가능합니다. (현재 ${stage}단계)</div>` : ''}
    </div>
    <!-- 활성 소환 -->
    ${(vs.activeSummons||[]).length > 0 ? `
    <div style="padding:10px 12px;border-bottom:1px solid #0d0020">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 활성 소환체 ──</div>
      ${(vs.activeSummons||[]).map((s, i) => `
        <div style="padding:8px;background:#0a0018;border:1px solid ${color}66;margin-bottom:4px;border-radius:2px;display:flex;align-items:center;gap:8px">
          <span style="color:${color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:16}):(s.svgIcon||s.icon)}</span>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:10px;color:${color}">${s.name}</div>
            <div style="font-size:8px;color:#402060">Tier ${s.tier} · HP ${s.hp} · ATK ${s.atk}</div>
          </div>
          <button onclick="dismissVoidSummon(${i});renderDarklingVoidExtPanel()" style="padding:3px 8px;background:#1a0030;border:1px solid ${color}44;color:${color};font-size:8px;cursor:pointer;border-radius:2px">귀환</button>
        </div>`).join('')}
    </div>` : ''}
    <!-- 소환 가능 목록 -->
    <div style="padding:10px 12px;border-bottom:1px solid #0d0020">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 소환 가능 존재 ──</div>
      ${available.length === 0 ? `<div style="font-size:9px;color:#402060;text-align:center;padding:10px">공허 2단계 이상에서 소환 가능</div>` :
        available.map(s => {
          const canAfford = mp >= s.mpCost;
          return `<div style="padding:8px 10px;background:${canAfford?'#080015':'#04000a'};border:1px solid ${canAfford?color+'44':'#1a0030'};margin-bottom:5px;border-radius:2px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:16}):(s.icon)}</span>
              <div style="flex:1">
                <div style="font-family:'Cinzel',serif;font-size:10px;color:${canAfford?color:'#402060'}">${s.name}</div>
                <div style="font-size:8px;color:#402060">Tier ${s.tier} · HP ${s.hp} · ATK ${s.atk}</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:9px;color:${canAfford?'#a060f0':'#402060'}">MP ${s.mpCost}</div>
              </div>
            </div>
            <div style="font-size:9px;color:#402060;margin-bottom:5px">${s.desc}</div>
            <button onclick="activateVoidSummon('${s.id}');renderDarklingVoidExtPanel()"
              style="width:100%;padding:5px;background:${canAfford?'#120028':'#04000a'};border:1px solid ${canAfford?color+'55':'#1a0030'};color:${canAfford?color:'#402060'};font-family:'Cinzel',serif;font-size:9px;cursor:${canAfford?'pointer':'not-allowed'};border-radius:2px"
              ${canAfford?'':'disabled'}>
              ${canAfford ? `🌀 소환하기 (MP -${s.mpCost})` : `MP 부족 (${s.mpCost} 필요)`}
            </button>
          </div>`;
        }).join('')}
    </div>
    <!-- 소환 기록 -->
    ${(vs.history||[]).length > 0 ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 소환 기록 (총 ${vs.totalSummons}회) ──</div>
      ${[...(vs.history||[])].reverse().slice(0, 8).map(h => `
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #05000f;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#402060">${h.name}</span>
          <span style="color:#6030a0;font-size:8px">Tier ${h.tier}</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderVoidSummonPanel = renderVoidSummonPanel;
