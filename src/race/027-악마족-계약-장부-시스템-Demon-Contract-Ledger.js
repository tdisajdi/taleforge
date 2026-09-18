// 📜  악마족 계약 장부 시스템 (Demon Contract Ledger)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { DEMON_CONTRACT_TYPES, DEMON_RANK_STAGES } from '../data/027-악마족-계약-장부-시스템-Demon-Contract-Ledger.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { esc, lsDel, lsGet, lsSet, toast } from '../utils.js';

export const DEMON_CONTRACT_KEY = "tf-demon-contract";

export const loadDemonContracts = () => {
  try { return JSON.parse(lsGet(DEMON_CONTRACT_KEY) || '{"rank":0,"rankPoints":0,"contracts":[],"history":[]}'); }
  catch(e) { return {rank:0, rankPoints:0, contracts:[], history:[]}; }
};

export const saveDemonContracts = (d) => { try { lsSet(DEMON_CONTRACT_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearDemonContracts = () => lsDel(DEMON_CONTRACT_KEY);

export function gainDemonContractRank(typeId, customGain) {
  const race = S.character?.race || "";
  const isDemon = race.includes("악마") || race.includes("demon");
  if (!isDemon) return;
  const cd = loadDemonContracts();
  const ctype = DEMON_CONTRACT_TYPES.find(t => t.id === typeId);
  const gain = customGain !== undefined ? customGain : (ctype?.rankGain || 5);
  cd.rankPoints = Math.max(0, Math.min(600, (cd.rankPoints || 0) + gain));

  // 계약 기록 추가
  cd.contracts = cd.contracts || [];
  cd.contracts.push({
    type: typeId, label: ctype?.label || typeId, icon: ctype?.icon || "📜",
    gain, total: cd.rankPoints,
    at: new Date().toISOString().slice(0, 16),
    id: Date.now()
  });
  if (cd.contracts.length > 50) cd.contracts = cd.contracts.slice(-50);

  // 지위 재계산
  const prevRank = cd.rank || 0;
  let newRank = 0;
  for (let i = DEMON_RANK_STAGES.length - 1; i >= 0; i--) {
    if (cd.rankPoints >= DEMON_RANK_STAGES[i].threshold) { newRank = i; break; }
  }
  cd.rank = newRank;
  saveDemonContracts(cd);

  if (newRank > prevRank) {
    const stg = DEMON_RANK_STAGES[newRank];
    setTimeout(() => {
      toastHTML(`📜 지위 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)} (${esc(newRank)}등급)`, 4000);
    }, 400);
  }
  applyDemonContractStats();
  return cd;
}
window.gainDemonContractRank = gainDemonContractRank;

export function applyDemonContractStats() {
  const cd = loadDemonContracts();
  const stg = DEMON_RANK_STAGES[cd.rank || 0];
  if (!stg) return;
  const prev = S._demonContractBonus || {};
  Object.entries(prev).forEach(([k, v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });
  const nb = {};
  Object.entries(stg.bonus || {}).forEach(([k, v]) => { S.stats[k] = Math.min(999, (S.stats[k] || 50) + v); nb[k] = v; });
  Object.entries(stg.penalty || {}).forEach(([k, v]) => { S.stats[k] = Math.max(0, (S.stats[k] || 50) + v); });
  S._demonContractBonus = nb;
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
}
window.applyDemonContractStats = applyDemonContractStats;

export function detectDemonContractFromText(text) {
  if (!text) return;
  const race = S.character?.race || "";
  if (!race.includes("악마") && !race.includes("demon")) return;
  if (/함정|속임수|비밀 조항|숨겨진 조건/.test(text) && Math.random() < 0.5) gainDemonContractRank('trap', 10);
  else if (/계약|서명|협약|거래|합의/.test(text) && Math.random() < 0.4) gainDemonContractRank('advantage', 5);
  if (/영혼|생명|목숨을 담보|영혼을 팔/.test(text) && Math.random() < 0.5) gainDemonContractRank('soul', 15);
  if (/계약 이행|약속 지킴|계약을 완수/.test(text) && Math.random() < 0.4) gainDemonContractRank('fulfilled', 8);
}
window.detectDemonContractFromText = detectDemonContractFromText;

export function renderDemonContractPanel() {
  const body = document.getElementById('pb-demon-contract');
  if (!body) return;
  const race = S.character?.race || "";
  const isDemon = race.includes("악마") || race.includes("demon");
  if (!isDemon) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">📜</div>
      <div>악마족 캐릭터에게만 활성화됩니다.</div></div>`;
    return;
  }
  const cd = loadDemonContracts();
  const stg = DEMON_RANK_STAGES[cd.rank || 0];
  const nextStg = DEMON_RANK_STAGES[(cd.rank || 0) + 1];
  const color = stg.color;
  const RARITY_C = { uncommon:"#4a9a6a", rare:"#4a6fa5", epic:"#8a40c0", legendary:"#c8a96e" };

  body.innerHTML = `
    <!-- ① 헤더: 현재 지위 -->
    <div style="padding:14px;background:linear-gradient(135deg,#1a1000,#251800);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:28px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:28}):(stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#806040;margin-top:2px">악마 사회 지위 ${cd.rank}등급 / 5등급</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:${color}">${cd.rankPoints}<span style="font-size:9px;color:#605030"> / 600</span></div>
          <div style="font-size:8px;color:#605030">계약 공적</div>
        </div>
      </div>
      <div style="height:6px;background:#100800;border-radius:3px;overflow:hidden;margin-bottom:4px">
        <div style="width:${Math.min(100,Math.round(cd.rankPoints/6))}%;height:100%;background:linear-gradient(90deg,#604010,${color});border-radius:3px;transition:width .4s"></div>
      </div>
      ${nextStg ? `<div style="display:flex;justify-content:space-between;font-size:8px;color:#605030">
        <span>현재: ${cd.rankPoints}</span><span>다음 등급: ${nextStg.threshold}</span></div>`
        : `<div style="font-size:8px;color:${color};text-align:center">⚠️ 악마 사회 최고 지위 달성</div>`}
      <div style="margin-top:8px;font-size:10px;color:#a07040;line-height:1.6;font-style:italic">"${stg.desc}"</div>
    </div>

    <!-- ② 오라 -->
    <div style="padding:7px 12px;background:#0d0800;border-bottom:1px solid #2a1800;font-size:10px;color:#806040">
      ⚖️ <span style="font-style:italic">${stg.aura}</span>
    </div>

    <!-- ③ 지위 단계 목록 -->
    <div style="padding:8px 12px;border-bottom:1px solid #1a0e00">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 악마 사회 지위 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${DEMON_RANK_STAGES.map((s,i) => {
          const active = i === cd.rank;
          const passed = i < cd.rank;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#1a1000':passed?'#0f0a00':'#0a0800'};border:1px solid ${active?s.color:passed?s.color+'44':'#1a1000'};border-radius:2px;opacity:${active?1:passed?0.75:0.35}">
            <span style="font-size:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:12}):(s.icon)}</span>
            <div style="flex:1"><span style="font-family:'Cinzel',serif;font-size:9px;color:${active?s.color:passed?s.color:'#504030'}">${s.name}</span><span style="font-size:8px;color:#403020;margin-left:5px">(${s.threshold})</span></div>
            ${active ? `<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀ 현재</span>` : ''}
            ${passed ? `<span style="font-size:9px;color:${s.color}">✓</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ④ 스탯 보너스 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0e00">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 지위 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(stg.bonus || {}).map(([k,v]) => `<div style="padding:3px 7px;background:#0d0a00;border:1px solid #3a2a0a;border-radius:2px;font-size:9px"><span style="color:${color}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:4px">+${v}</span></div>`).join('')}
        ${Object.entries(stg.penalty || {}).map(([k,v]) => `<div style="padding:3px 7px;background:#0d0000;border:1px solid #3a0a0a;border-radius:2px;font-size:9px"><span style="color:#a06060">${k.toUpperCase()}</span><span style="color:#e05050;margin-left:4px">${v}</span></div>`).join('')}
        ${Object.keys({...stg.bonus,...stg.penalty}).length === 0 ? `<div style="grid-column:span 2;font-size:9px;color:#403020;text-align:center;padding:6px">지위를 올려 보너스를 획득하세요</div>` : ''}
      </div>
    </div>

    <!-- ⑤ 계약 자동 전용 -->
    <div style="padding:8px 12px;border-bottom:1px solid #1a0e00">
      <div style="font-size:9px;color:#503a10;font-style:italic;text-align:center;padding:4px 0">📜 계약 공적은 AI 서사에서 자동으로 쌓입니다</div>
    </div>

    <!-- ⑥ 최근 계약 기록 -->
    ${cd.contracts && cd.contracts.length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 계약 기록 (최근 ${Math.min(12, cd.contracts.length)}건) ──</div>
      ${[...cd.contracts].reverse().slice(0, 12).map(c => `
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0d0800;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(c,{size:16}):(c.icon)}</span>
          <span style="flex:1;color:#806040">${esc(c.label)}</span>
          <span style="color:${c.gain > 0 ? '#e0a030' : '#e05050'};font-family:'Cinzel',serif">${c.gain > 0 ? '+' : ''}${c.gain}</span>
          <span style="color:#403020;font-size:8px">(${c.total})</span>
        </div>`).join('')}
    </div>` : `<div style="padding:20px;text-align:center;font-size:10px;color:#403020">아직 계약 기록이 없습니다</div>`}
  `;
}
window.renderDemonContractPanel = renderDemonContractPanel;

window.renderDemonContractPanel = renderDemonContractPanel;

window.gainDemonContractRank    = gainDemonContractRank;

window.applyDemonContractStats  = applyDemonContractStats;

window.detectDemonContractFromText = detectDemonContractFromText;

window.clearDemonContracts      = clearDemonContracts;
