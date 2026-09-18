// [3] 진화(Evolution) 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { EVO_JOBS, EVO_STAGES } from '../data/206-3-진화Evolution-시스템.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { saveSession } from './001-block0-preamble.js';

export const EVO_KEY = 'tf-evolution';

window.EVO_JOBS   = EVO_JOBS;

window.EVO_STAGES = EVO_STAGES;

export function loadEvolution() {
  try {
    const r = lsGet(EVO_KEY);
    return r ? JSON.parse(r) : { stage:0, energy:0, maxEnergy:100, jobType:null };
  } catch(e) { return { stage:0, energy:0, maxEnergy:100, jobType:null }; }
}
window.loadEvolution = loadEvolution;

export function saveEvolution(d) {
  try { lsSet(EVO_KEY, JSON.stringify(d)); } catch(e) {}
}
window.saveEvolution = saveEvolution;

export function isEvoJob() {
  try {
    const role = S?.character?.role || '';
    return EVO_JOBS.some(j => role.toLowerCase().includes(j));
  } catch(e) { return false; }
}
window.isEvoJob = isEvoJob;

export function gainEvoEnergy(amount, reason='') {
  try {
    if (!isEvoJob()) return;
    const evo = loadEvolution();
    evo.energy = (evo.energy || 0) + amount;
    const cur = EVO_STAGES[evo.stage] || EVO_STAGES[0];
    const next = EVO_STAGES[evo.stage + 1];
    if (next && evo.energy >= next.energy) {
      triggerEvolution(evo);
    } else {
      saveEvolution(evo);
    }
    if (reason && amount > 0) {
      const pct = next ? Math.floor((evo.energy / next.energy) * 100) : 100;
      if (S?.msgCount % 10 === 0) toast(`⚡ 진화 에너지 +${amount} (${pct}%)`, 1500);
    }
  } catch(e) {}
}
window.gainEvoEnergy = gainEvoEnergy;

export function triggerEvolution(evo) {
  try {
    evo = evo || loadEvolution();
    const nextStage = EVO_STAGES[evo.stage + 1];
    if (!nextStage) return;
    evo.stage += 1;
    saveEvolution(evo);
    // 보너스 스탯 적용
    if (S?.stats && nextStage.bonus) {
      Object.entries(nextStage.bonus).forEach(([k, v]) => {
        if (S.stats[k] !== undefined) S.stats[k] = Math.min(999, (S.stats[k] || 0) + v);
      });
      if (typeof window.updateHeader === 'function') window.updateHeader();
      if (typeof saveSession === 'function') saveSession();
    }
    toast(`진화! ${nextStage.name} 단계 도달!`, 4000, nextStage);
    if (evo.stage >= 5) unlockAchievement('max_level');
  } catch(e) {}
}
window.triggerEvolution = triggerEvolution;

export function getEvoStage() {
  try {
    const evo = loadEvolution();
    return EVO_STAGES[evo.stage] || EVO_STAGES[0];
  } catch(e) { return EVO_STAGES[0]; }
}
window.getEvoStage = getEvoStage;

export function checkEvoLevel() {
  const evo = loadEvolution();
  const next = EVO_STAGES[evo.stage + 1];
  return next ? (evo.energy / next.energy) : 1;
}
window.checkEvoLevel = checkEvoLevel;

export function renderEvolution(){
  try{
    const body = document.getElementById('pb-evolution');
    if(!body) return;
    if(!isEvoJob()){
      body.innerHTML = `<div style="padding:24px;text-align:center;color:var(--dim);font-size:11px">
        진화 시스템은 특정 전직 직업(전사·마법사·도적·궁수 계열 등)에서만 작동합니다.
      </div>`;
      return;
    }
    const evo = loadEvolution();
    const cur = EVO_STAGES[evo.stage] || EVO_STAGES[0];
    const next = EVO_STAGES[evo.stage + 1];
    const pct = next ? Math.min(100, Math.round((evo.energy / next.energy) * 100)) : 100;

    body.innerHTML = `
      <div style="padding:14px">
        <div style="text-align:center;margin-bottom:14px">
          <div style="display:flex;justify-content:center;color:var(--gold);transform:scale(1.6)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(cur,{size:16}):(cur.svgIcon||cur.icon)}</div>
          <div style="font-family:'Cinzel',serif;font-size:14px;color:var(--gold)">${cur.name} 단계</div>
        </div>
        ${next ? `
          <div style="background:#1a1008;border-radius:3px;height:10px;overflow:hidden;margin-bottom:6px">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#6090c0,#c0a050)"></div>
          </div>
          <div style="font-size:9px;color:var(--dim);text-align:center;margin-bottom:14px">
            ${evo.energy} / ${next.energy} (${pct}%) — 다음 단계: ${next.icon} ${next.name}
          </div>
        ` : `<div style="text-align:center;color:#c0a050;font-size:10px;margin-bottom:14px">최고 단계 도달</div>`}
        <div style="font-size:9px;color:var(--dim);margin-bottom:6px">단계별 보너스</div>
        ${EVO_STAGES.map((s,i) => `
          <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);opacity:${i<=evo.stage?1:0.4}">
            <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:16}):(s.icon)} ${s.name}</span>
            <span style="font-size:9px;color:var(--dim)">${Object.entries(s.bonus).map(([k,v])=>`${k.toUpperCase()}+${v}`).join(' ')||'-'}</span>
          </div>`).join('')}
      </div>`;
  }catch(e){ console.warn('[renderEvolution]', e); }
}
window.renderEvolution = renderEvolution;

window.renderEvolution = renderEvolution;

window.loadEvolution  = loadEvolution;

window.saveEvolution  = saveEvolution;

window.isEvoJob       = isEvoJob;

window.gainEvoEnergy  = gainEvoEnergy;

window.triggerEvolution = triggerEvolution;

window.getEvoStage    = getEvoStage;

window.checkEvoLevel  = checkEvoLevel;
