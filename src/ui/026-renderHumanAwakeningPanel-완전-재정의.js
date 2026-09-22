// 🌟 renderHumanAwakeningPanel 완전 재정의
// Auto-extracted from taleforge.html (original section banner preserved above).
import { SOCIAL_RANKS } from '../core/084-TaleForge-순수-JS-엔진.js';
import { pmLoad, pmSave } from '../core/267-저장로드초기화.js';
import { RARITY_COLOR } from '../data/012-궁수-계열-T2-파생-5종-칭호-전사마법사도적-계열과-동일한-절제-원칙.js';
import { DEMON_PURIFY_METHODS, DEMON_SIN_GAIN } from '../data/020-101130번-환생-누적-시스템.js';
import { AWAKENING_POWER_SKILLS, HUMAN_FATE_PATHS, NPC_INSPIRE_STAGES } from '../data/025-통합-패널-공허-확장-탭-시스템.js';
import { CORRUPTION_POWER_SKILLS, DOMINATION_METHODS, LEGACY_ACTIONS, LEGACY_PATHS, NPC_CORRUPTION_STAGES, NPC_CORRUPT_METHODS, STIGMA_TYPES, THRALL_RANKS, THRALL_RANK_DEFAULT, THRALL_RANK_TABLES } from '../data/026-renderHumanAwakeningPanel-완전-재정의.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { registerDynNpcFromText } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { loadSkills, saveSkills } from '../job/002-스킬-시스템.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadNPCs, saveNPCs } from '../misc/001-block0-preamble.js';
import { loadJobSkills, saveJobSkills } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { getEnemyScaleMultiplier } from '../misc/054-이동수단-시스템.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { DEMON_CORRUPTION_STAGES, applyDemonCorruptionStats, getDemonCorruptionStatus, loadDemonCorruption, saveDemonCorruption } from '../progression/020-101130번-환생-누적-시스템.js';
import { getMonsterTierStats, renderSkills, updateCharHeader } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { loadDemesne, saveDemesne } from '../race/260-수인족-패널-렌더.js';
import { esc, lsDel, lsGet, lsSet, toast } from '../utils.js';
import { getLocationLevelBand, getLocationPowerScale, loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { loadGSFlags } from '../world/145-⑥-세계-상태-DB.js';
import { HUMAN_AWAKENING_STAGES, clearNpcInspire, gainHumanAwakening, getHumanAwakeningStatus, inspireNpc, loadNpcInspire, openApsSkillModal, openNpcInspireModal, useApsSkill } from './025-통합-패널-공허-확장-탭-시스템.js';

window.renderHumanAwakeningPanel = function() {
  const body = document.getElementById('pb-human-awakening');
  if (!body) return;
  const status = getHumanAwakeningStatus();
  if (!status) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">🌟</div>
      <div>인간족 캐릭터에게만 활성화됩니다.</div>
    </div>`;
    return;
  }
  const ha = status;
  const stg = ha.stageDef;
  const nextStg = ha.nextStage;
  const color = stg.color;
  const nid = loadNpcInspire();
  const inspiredNpcs = Object.entries(nid).filter(([,v]) => v.stage > 0);
  const stageSkills = HUMAN_AWAKENING_STAGES.slice(0, (ha.stage || 0) + 1).flatMap(s => s.skills);
  const availableApsSkills = AWAKENING_POWER_SKILLS.filter(s => s.reqStage <= (ha.stage || 0));
  const totalDeeds = Object.values(ha.deed || {}).reduce((a, v) => a + v, 0);
  const toNextFate = 10 - (totalDeeds % 10);
  const currentPath = ha.path && ha.path !== 'none' ? HUMAN_FATE_PATHS[ha.path] : null;
  const RARITY_COLOR = { uncommon: "#4a9a6a", rare: "#4a6fa5", epic: "#8a40c0", legendary: "#c8a96e" };

  body.innerHTML = `
    <!-- ① 헤더 -->
    <div style="padding:14px;background:linear-gradient(135deg,#1a1000,#2a1a00);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#8a7040;margin-top:2px">${ha.stage}단계 / 7단계</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:${color}">${ha.points}<span style="font-size:9px;color:#6a5030"> / 1000</span></div>
          <div style="font-size:8px;color:#6a5030">보유 각성도</div>
        </div>
      </div>
      <div style="height:6px;background:#1a1000;border-radius:3px;overflow:hidden;margin-bottom:4px">
        <div style="width:${Math.min(100, Math.round(ha.points / 10))}%;height:100%;background:linear-gradient(90deg,#806010,${color});border-radius:3px;transition:width .4s"></div>
      </div>
      ${nextStg ? `<div style="display:flex;justify-content:space-between;font-size:8px;color:#6a5030">
        <span>현재: ${ha.points}</span><span>다음 단계: ${nextStg.threshold}</span>
      </div>` : `<div style="font-size:8px;color:${color};text-align:center">⭐ 인류의 정점 도달</div>`}
      <div style="margin-top:8px;font-size:10px;color:#9a8050;line-height:1.6;font-style:italic">"${stg.desc}"</div>
    </div>

    <!-- ② 오라 + 단계 표시 -->
    <div style="padding:7px 12px;background:#0d0a00;border-bottom:1px solid #2a1800;font-size:10px;color:#7a6040">
      ✨ <span style="font-style:italic">${stg.aura}</span>
    </div>
    <div style="padding:8px 12px;border-bottom:1px solid #1a1500">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 각성 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${HUMAN_AWAKENING_STAGES.map((s, i) => {
          const active = i === ha.stage;
          const passed = i < ha.stage;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#1a1500':passed?'#0f0c00':'#0a0900'};border:1px solid ${active?s.color:passed?s.color+'44':'#1a1500'};border-radius:2px;opacity:${active?1:passed?0.7:0.35}">
            <span style="display:inline-flex;width:12px;height:12px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:12}):((s.svgIcon||'').replace('width="20" height="20"','width="12" height="12"')||s.icon)}</span>
            <div style="flex:1"><span style="font-family:'Cinzel',serif;font-size:9px;color:${active?s.color:passed?s.color:'#4a3a20'}">${s.name}</span><span style="font-size:8px;color:#4a3a20;margin-left:5px">(${s.threshold})</span></div>
            ${active ? `<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀ 현재</span>` : ''}
            ${passed ? `<span style="font-size:9px;color:${s.color}">✓</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ③ 스탯 보너스 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1500">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 각성 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(stg.statBonus || {}).map(([k,v])=>`<div style="padding:3px 7px;background:#0d0a00;border:1px solid #2a2000;border-radius:2px;font-size:9px"><span style="color:${color}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:4px">+${v}</span></div>`).join('')}
      </div>
      ${Object.keys(stg.statBonus||{}).length===0 ? `<div style="font-size:9px;color:#4a3a20;text-align:center;padding:4px">각성도를 쌓아 스탯 보너스를 해금하세요</div>` : ''}
    </div>

    <!-- ④ 각성력 소모 스킬 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1500">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:8px">── 🌟 각성력 소모 스킬 ──</div>
      ${availableApsSkills.length === 0 ? `<div style="font-size:9px;color:#4a3a20;text-align:center;padding:8px">각성 단계를 올려 스킬을 해금하세요</div>` : ''}
      ${availableApsSkills.map(sk => {
        const canUse = ha.points >= sk.cost;
        const rc = RARITY_COLOR[sk.rarity] || '#8a9a8a';
        return `<div style="padding:8px 10px;background:${canUse?'#150d03':'#0a0900'};border:1px solid ${canUse?rc+'55':'#1a1500'};margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:16}):(sk.icon)}</span>
            <div style="flex:1">
              <span style="font-family:'Cinzel',serif;font-size:10px;color:${canUse?rc:'#4a3a20'}">${esc(sk.name)}</span>
              <span style="font-size:8px;padding:1px 4px;background:${rc}22;color:${rc};border:1px solid ${rc}44;border-radius:2px;margin-left:4px">${sk.rarity}</span>
            </div>
            <div style="text-align:right">
              <div style="font-family:'Cinzel',serif;font-size:11px;color:${canUse?'#e08020':'#4a3a20'}">-${sk.cost}</div>
              <div style="font-size:7px;color:#4a3a20">각성도</div>
            </div>
          </div>
          <div style="font-size:9px;color:#7a6040;margin-bottom:6px;line-height:1.5">${esc(sk.desc)}</div>
          <button onclick="openApsSkillModal('${sk.id}')"
            style="width:100%;padding:5px;background:${canUse?'linear-gradient(135deg,#2a1800,#3a2200)':'#0a0900'};border:1px solid ${canUse?rc:'#1a1500'};color:${canUse?rc:'#3a2a10'};font-family:'Cinzel',serif;font-size:9px;cursor:${canUse?'pointer':'not-allowed'};border-radius:2px"
            ${canUse?'':'disabled'}>
            ${sk.targetable ? '🎯 대상 선택 후 발동' : '⚡ 즉시 발동'} ${canUse?'':'(각성도 부족)'}
          </button>
        </div>`;
      }).join('')}
      ${ha.stage < 7 ? `<div style="font-size:8px;color:#4a3a20;text-align:center;margin-top:5px">다음 단계(${(ha.stage||0)+1}단계)에서 추가 스킬 해금</div>` : ''}
    </div>

    <!-- ⑤ NPC 감화 시스템 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1500">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:8px">── 💗 NPC 감화 시스템 ──</div>
      ${inspiredNpcs.length > 0 ? `
        <div style="margin-bottom:8px">
          <div style="font-size:8px;color:#6a5a30;margin-bottom:5px">감화 진행 중인 NPC (${inspiredNpcs.length}명)</div>
          ${inspiredNpcs.map(([name, nd]) => {
            const nstg = NPC_INSPIRE_STAGES[nd.stage] || NPC_INSPIRE_STAGES[0];
            return `<div style="display:flex;align-items:center;gap:7px;padding:5px 8px;background:#0d0a00;border:1px solid ${nstg.color}44;margin-bottom:3px;border-radius:2px">
              <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(nstg,{size:16}):(nstg.icon)}</span>
              <div style="flex:1">
                <div style="font-size:9px;color:${nstg.color}">${esc(name)}</div>
                <div style="height:3px;background:#1a1000;border-radius:2px;margin-top:2px">
                  <div style="width:${nd.points}%;height:100%;background:${nstg.color};border-radius:2px"></div>
                </div>
              </div>
              <div style="font-size:8px;color:${nstg.color};font-family:'Cinzel',serif">${nd.points}/100</div>
              <div style="font-size:8px;color:#4a3a20">${nstg.name}</div>
            </div>`;
          }).join('')}
        </div>
      ` : `<div style="font-size:9px;color:#4a3a20;text-align:center;padding:6px">아직 감화시킨 NPC가 없습니다</div>`}
      <button onclick="openNpcInspireModal()"
        style="width:100%;padding:8px;background:linear-gradient(135deg,#1a1200,#2a1800);border:1px solid ${color}55;color:${color};font-family:'Cinzel',serif;font-size:10px;cursor:pointer;border-radius:2px;letter-spacing:0.5px">
        💗 NPC 감화 시전하기
      </button>
    </div>

    <!-- ⑥ 운명의 선택지 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1500">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── ⭐ 운명의 선택지 ──</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div style="flex:1">
          <div style="font-size:9px;color:#8a7040;margin-bottom:3px">다음 운명 선택까지 (${10 - toNextFate}/10)</div>
          <div style="height:5px;background:#1a1500;border-radius:3px;overflow:hidden">
            <div style="width:${Math.min(100, Math.round(((10 - toNextFate) / 10) * 100))}%;height:100%;background:linear-gradient(90deg,#806010,${color});border-radius:3px"></div>
          </div>
        </div>
      </div>
      ${currentPath ? `
        <div style="padding:7px 10px;background:#150d03;border:1px solid ${currentPath.color}55;border-radius:2px;margin-bottom:7px">
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(currentPath,{size:16}):(currentPath.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:11px;color:${currentPath.color}">${currentPath.label}</span>
            <span style="font-size:8px;color:#4a3a20;margin-left:auto">${ha.choiceCount||0}회 · ${Object.entries(currentPath.stats).map(([s,v])=>`${s.toUpperCase()} +${v}`).join(' · ')} × ${ha.pathBonus?.[ha.path]||1}</span>
          </div>
        </div>
      ` : ''}
      <button onclick="openHumanFateChoice()"
        style="width:100%;padding:8px;background:#1a1200;border:1px solid ${color}66;color:${color};font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">
        ⭐ 운명의 선택지 열기
      </button>
    </div>

    <!-- ⑦ 각성 단계 패시브 스킬 -->
    ${stageSkills.length ? `
    <div style="padding:10px 12px;border-bottom:1px solid #1a1500">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 각성 단계 패시브 스킬 ──</div>
      ${stageSkills.map(sk => {
        if(!S.unlockedSkills) S.unlockedSkills = {}; // [F-12 FIX]
        const unlocked = !!S.unlockedSkills[sk.id];
        return `<div style="padding:6px 9px;background:${unlocked?'#150d03':'#0a0900'};border:1px solid ${unlocked?color+'55':'#1a1500'};margin-bottom:4px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
            <span style="font-size:13px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:13}):(sk.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:9px;color:${color}">${esc(sk.name)}</span>
            <span style="font-size:7px;padding:1px 4px;background:${color}22;color:${color};border:1px solid ${color}44;border-radius:2px;margin-left:auto">${sk.rarity}</span>
            ${unlocked ? '<span style="font-size:9px;color:#60d060">✓</span>' : '<span style="font-size:9px;color:#4a3a20">🔒</span>'}
          </div>
          <div style="font-size:9px;color:#7a6a40;line-height:1.4">${esc(sk.desc)}</div>
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- ⑧ 행적 행동 자동 전용 -->
    <div style="padding:8px 12px;border-bottom:1px solid #1a1500">
      <div style="font-size:9px;color:#5a4a20;font-style:italic;text-align:center;padding:4px 0">🌟 각성도는 AI 서사에서 자동으로 쌓입니다</div>
    </div>

    <!-- ⑨ 최근 기록 -->
    ${ha.history && ha.history.length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 최근 기록 ──</div>
      ${[...ha.history].reverse().slice(0, 12).map(h => `
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0d0a00;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#6a5a30">${esc(h.label)}</span>
          <span style="color:${h.gain > 0 ? '#60d060' : '#e08020'};font-family:'Cinzel',serif">${h.gain > 0 ? '+' : ''}${h.gain}</span>
          <span style="color:#3a2a10;font-size:8px">(${h.total})</span>
        </div>`).join('')}
    </div>` : ''}
  `;
};

export const HUMAN_LEGACY_KEY   = 'tf-human-legacy';

export const HL_RECORDS_KEY     = 'tf-hl-records';

export const HL_POINTS_KEY      = 'tf-hl-points';

export const HL_HISTORY_KEY     = 'tf-hl-history';

export function loadHumanLegacy() {
  try {
    const rec=lsGet(HL_RECORDS_KEY); const pts=lsGet(HL_POINTS_KEY); const hist=lsGet(HL_HISTORY_KEY);
    if (rec!==null) return { records:JSON.parse(rec||'[]'), ...(pts?JSON.parse(pts):{points:{warrior:0,sage:0,diplomat:0,martyr:0},lockedPath:null,pathLevel:0,totalPoints:0}), history:JSON.parse(hist||'[]') };
    return JSON.parse(lsGet(HUMAN_LEGACY_KEY)||'{"records":[],"points":{"warrior":0,"sage":0,"diplomat":0,"martyr":0},"lockedPath":null,"pathLevel":0,"totalPoints":0,"history":[]}');
  } catch(e) { return {records:[],points:{warrior:0,sage:0,diplomat:0,martyr:0},lockedPath:null,pathLevel:0,totalPoints:0,history:[]}; }
}
window.loadHumanLegacy = loadHumanLegacy;

export function saveHumanLegacy(d) {
  try {
    lsSet(HL_RECORDS_KEY, JSON.stringify(d.records||[]));
    lsSet(HL_POINTS_KEY,  JSON.stringify({points:d.points||{warrior:0,sage:0,diplomat:0,martyr:0},lockedPath:d.lockedPath||null,pathLevel:d.pathLevel||0,totalPoints:d.totalPoints||0}));
    lsSet(HL_HISTORY_KEY, JSON.stringify(d.history||[]));
    lsSet(HUMAN_LEGACY_KEY,JSON.stringify(d));
  } catch(e) {}
}
window.saveHumanLegacy = saveHumanLegacy;

export const clearHumanLegacy = () => { lsDel(HUMAN_LEGACY_KEY); lsDel(HL_RECORDS_KEY); lsDel(HL_POINTS_KEY); lsDel(HL_HISTORY_KEY); };

export function isHumanRace() {
  const r = S.character?.race || '';
  return r.includes('인간') || r.toLowerCase().includes('human') || r === '';
}
window.isHumanRace = isHumanRace;

export function getDominantLegacyPath(hl) {
  const pts = hl.points || {};
  const entries = Object.entries(pts).sort((a,b) => b[1]-a[1]);
  return entries[0]?.[0] || null;
}
window.getDominantLegacyPath = getDominantLegacyPath;

export function recordLegacyAction(actionId, note) {
  if (!isHumanRace()) return;
  const hl = loadHumanLegacy();
  const def = LEGACY_ACTIONS.find(a => a.id === actionId);
  if (!def) return;

  hl.points = hl.points || {warrior:0, sage:0, diplomat:0, martyr:0};
  hl.points[def.path] = (hl.points[def.path] || 0) + def.points;
  hl.totalPoints = (hl.totalPoints || 0) + def.points;

  hl.records = hl.records || [];
  hl.records.push({
    id: actionId, label: def.label, icon: def.icon, path: def.path,
    points: def.points, note: note || '', at: new Date().toISOString().slice(0, 10)
  });
  

  hl.history = hl.history || [];
  hl.history.push({ label: def.label, icon: def.icon, path: def.path, points: def.points, at: new Date().toISOString().slice(0,16) });
  

  // 경로 확정 체크
  if (!hl.lockedPath) {
    const dom = getDominantLegacyPath(hl);
    const pd = LEGACY_PATHS[dom];
    if (dom && pd && (hl.points[dom] || 0) >= pd.thresholdToLock) {
      hl.lockedPath = dom;
      hl.pathLevel = 1;
      saveHumanLegacy(hl);
      applyHumanLegacyStats();
      setTimeout(() => toastHTML(`📜 운명의 분기! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(pd,{size:14}):(pd.icon)} ${esc(pd.label)} 경로가 확정됐습니다!`, 5000), 400);
      // 각성 스킬 연동
      if (typeof gainHumanAwakening === 'function') gainHumanAwakening('triumph', 15);
      return;
    }
  } else {
    // 경로 레벨업
    const pd = LEGACY_PATHS[hl.lockedPath];
    if (pd) {
      const newLevel = Math.min(pd.maxLevel, Math.floor((hl.points[hl.lockedPath] || 0) / 40));
      if (newLevel > (hl.pathLevel || 1)) {
        hl.pathLevel = newLevel;
        setTimeout(() => toastHTML(`📜 유산 경로 강화! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(pd,{size:14}):(pd.icon)} ${esc(pd.label)} Lv.${esc(newLevel)}`, 4000), 400);
      }
    }
  }

  saveHumanLegacy(hl);
  applyHumanLegacyStats();

  // 각성력 연동
  if (def.path === 'warrior' && typeof gainHumanAwakening==='function') gainHumanAwakening('courage', 3);
  if (def.path === 'sage'    && typeof gainHumanAwakening==='function') gainHumanAwakening('growth', 3);
  if (def.path === 'martyr'  && typeof gainHumanAwakening==='function') gainHumanAwakening('sacrifice', 3);
}
window.recordLegacyAction = recordLegacyAction;

export function chooseLegacyPath(pathId) {
  if (!isHumanRace()) return;
  const hl = loadHumanLegacy();
  if (hl.lockedPath) { toast('⚠️ 이미 유산 경로가 확정됐습니다.'); return; }
  const pd = LEGACY_PATHS[pathId];
  if (!pd) return;
  hl.lockedPath = pathId;
  hl.pathLevel = 1;
  hl.points = hl.points || {warrior:0, sage:0, diplomat:0, martyr:0};
  hl.points[pathId] = Math.max(hl.points[pathId] || 0, pd.thresholdToLock);
  saveHumanLegacy(hl);
  applyHumanLegacyStats();
  // 각성 스킬 해금
  if (pd.awakeSkill && (hl.points[pathId]||0) >= pd.thresholdToLock * 2) {
    S.unlockedSkills = S.unlockedSkills || {};
    S.unlockedSkills[pd.awakeSkill.id] = true;
    if (typeof saveSkills==='function') saveSkills(S.unlockedSkills);
    setTimeout(() => toastHTML(`🔓 유산 각성 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(pd.awakeSkill,{size:14}):(pd.awakeSkill.icon)} ${esc(pd.awakeSkill.name)}`, 4000), 600);
  }
  toastHTML(`📜 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(pd,{size:14}):(pd.icon)} ${esc(pd.label)} 유산 경로 선택!`, 4000);
  renderHumanLegacyPanel();
}
window.chooseLegacyPath = chooseLegacyPath;

export function applyHumanLegacyStats() {
  if (!isHumanRace()) return;
  const hl = loadHumanLegacy();
  const prev = S._humanLegacyBonus || {};
  Object.entries(prev).forEach(([k,v]) => { if (S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v); });
  const nb = {};
  if (hl.lockedPath && LEGACY_PATHS[hl.lockedPath]) {
    const pd = LEGACY_PATHS[hl.lockedPath];
    const lv = hl.pathLevel || 1;
    Object.entries(pd.perLevelBonus || {}).forEach(([k,v]) => {
      const total = v * lv;
      S.stats[k] = Math.min(999, (S.stats[k]||50) + total);
      nb[k] = total;
    });
  }
  S._humanLegacyBonus = nb;
  if (typeof saveStats==='function') saveStats(S.stats);
  window.updateHeader();
}
window.applyHumanLegacyStats = applyHumanLegacyStats;

export function detectHumanLegacyFromText(text) {
  if (!text || !isHumanRace()) return;
  if (/싸웠|물러서지 않|용감히|검을 들었/.test(text) && Math.random()<0.4) recordLegacyAction('w_fight');
  if (/배웠|발견했|알게 됐|지식을/.test(text) && Math.random()<0.4) recordLegacyAction('s_discover');
  if (/설득했|말로 해결|협상에 성공/.test(text) && Math.random()<0.4) recordLegacyAction('d_convince');
  if (/희생했|포기했|자신을 던졌|내어줬/.test(text) && Math.random()<0.4) recordLegacyAction('m_sacrifice');
}
window.detectHumanLegacyFromText = detectHumanLegacyFromText;

export function renderHumanLegacyPanel() {
  const body = document.getElementById('pb-human-legacy');
  if (!body) return;
  if (!isHumanRace()) {
    body.innerHTML=`<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px"><div style="font-size:32px;margin-bottom:10px">📜</div><div>인간족 캐릭터에게만 활성화됩니다.</div></div>`;
    return;
  }
  const hl = loadHumanLegacy();
  const dom = getDominantLegacyPath(hl);
  const locked = hl.lockedPath;
  const pd = locked ? LEGACY_PATHS[locked] : null;
  const color = pd ? pd.color : '#e0c060';

  body.innerHTML = `
    <!-- ① 헤더 -->
    <div style="padding:14px;background:linear-gradient(135deg,#100c00,#1a1600);border-bottom:2px solid ${color}">
      ${locked && pd ? `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="color:${pd.color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(pd,{size:16}):(pd.svgIcon||pd.icon)}</span>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:13px;color:${pd.color};letter-spacing:1px">${pd.label} 유산 Lv.${hl.pathLevel||1}</div>
            <div style="font-size:9px;color:#806030;margin-top:2px">경로 포인트 ${hl.points[locked]||0} | 전체 유산 ${hl.totalPoints||0}</div>
          </div>
        </div>
        <div style="height:6px;background:#100800;border-radius:3px;overflow:hidden;margin-bottom:4px;border:1px solid #403010">
          <div style="width:${Math.min(100,Math.round(((hl.points[locked]||0) % 40) / 0.4))}%;height:100%;background:linear-gradient(90deg,#604010,${pd.color});border-radius:3px;transition:width .4s"></div>
        </div>
        <div style="font-size:9px;color:#a08040;font-style:italic">"${pd.lore}"</div>
        ${S.unlockedSkills?.[pd.awakeSkill?.id] ? `
          <div style="margin-top:6px;padding:5px 8px;background:#180e00;border:1px solid ${pd.color}55;border-radius:2px;font-size:9px;color:${pd.color}">
            ✨ 유산 각성 스킬 해금됨: ${pd.awakeSkill.icon} ${pd.awakeSkill.name}
          </div>` : (hl.points[locked]||0)>=pd.thresholdToLock ? `<div style="margin-top:4px;font-size:8px;color:#605030">각성 스킬까지: ${Math.max(0,pd.thresholdToLock*2-(hl.points[locked]||0))} 포인트</div>` : ''}
      ` : `
        <div style="text-align:center;padding:8px">
          <div style="font-size:24px;margin-bottom:8px">📜</div>
          <div style="font-family:'Cinzel',serif;font-size:12px;color:${color}">경로 미확정</div>
          <div style="font-size:9px;color:#806030;margin-top:4px">행동을 쌓거나 직접 선택하세요</div>
        </div>
      `}
    </div>

    <!-- ② 4가지 경로 현황 -->
    <div style="padding:8px 12px;border-bottom:1px solid #1a1200">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 유산 경로 현황 ──</div>
      <div style="display:flex;flex-direction:column;gap:4px">
        ${Object.entries(LEGACY_PATHS).map(([pid, pd2]) => {
          const pts = hl.points?.[pid] || 0;
          const isLocked = locked === pid;
          const isDom = !locked && dom === pid;
          const pct = Math.min(100, Math.round(pts / pd2.thresholdToLock * 100));
          return `<div style="padding:6px 9px;background:${isLocked?'#1a1000':'#0e0c00'};border:1px solid ${isLocked?pd2.color:isDom?pd2.color+'66':'#2a1800'};border-radius:2px">
            <div style="display:flex;align-items:center;gap:7px;margin-bottom:4px">
              <span style="font-size:15px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(pd2,{size:15}):(pd2.icon)}</span>
              <div style="flex:1">
                <span style="font-family:'Cinzel',serif;font-size:10px;color:${pts>0?pd2.color:'#605030'}">${pd2.label}</span>
                ${isLocked?`<span style="font-size:8px;color:${pd2.color};margin-left:5px">✓ 확정됨</span>`:''}
              </div>
              <span style="font-family:'Cinzel',serif;font-size:11px;color:${pd2.color}">${pts}<span style="font-size:8px;color:#604030"> pts</span></span>
            </div>
            <div style="height:4px;background:#0a0800;border-radius:2px;overflow:hidden">
              <div style="width:${pct}%;height:100%;background:${pd2.color};border-radius:2px;transition:width .4s"></div>
            </div>
            ${!locked ? `<button onclick="chooseLegacyPath('${pid}')" style="margin-top:4px;width:100%;padding:3px;background:#0e0c00;border:1px solid ${pd2.color}44;color:${pd2.color};font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">✦ 이 경로 선택</button>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ③ 유산 안내 (자동 전용) -->
    <div style="padding:8px 12px;border-bottom:1px solid #1a1200">
      <div style="font-size:9px;color:#5a4a20;font-style:italic;text-align:center;padding:4px 0">
        📜 유산 행동은 AI 서사에서 자동으로 기록됩니다
      </div>
    </div>

    <!-- ④ 최근 기록 -->
    ${(hl.history||[]).length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 유산 기록 ──</div>
      ${[...hl.history].reverse().slice(0,10).map(h => {
        const pd2 = LEGACY_PATHS[h.path];
        return `<div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0e0c00;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#907040">${esc(h.label)}</span>
          <span style="color:${pd2?.color||color};font-size:8px">${pd2?.label||h.path}</span>
          <span style="color:${pd2?.color||color};font-family:'Cinzel',serif">+${h.points}</span>
        </div>`;
      }).join('')}
    </div>` : ''}
  `;
}
window.renderHumanLegacyPanel = renderHumanLegacyPanel;

window.renderHumanLegacyPanel    = renderHumanLegacyPanel;

window.recordLegacyAction        = recordLegacyAction;

window.chooseLegacyPath          = chooseLegacyPath;

window.applyHumanLegacyStats     = applyHumanLegacyStats;

window.detectHumanLegacyFromText = detectHumanLegacyFromText;

window.loadHumanLegacy           = loadHumanLegacy;

window.clearHumanLegacy          = clearHumanLegacy;

export const HUMAN_STIGMA_KEY = 'tf-human-stigma';

export const loadHumanStigma  = () => {
  try {
    return JSON.parse(lsGet(HUMAN_STIGMA_KEY) ||
      '{"stigmas":{},"proofPoints":0,"proofLevel":0,"history":[],"overcomeCounts":{},"totalStigmaCount":0}');
  } catch(e) {
    return {stigmas:{}, proofPoints:0, proofLevel:0, history:[], overcomeCounts:{}, totalStigmaCount:0};
  }
};

export const saveHumanStigma  = (d) => { try { lsSet(HUMAN_STIGMA_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearHumanStigma = () => lsDel(HUMAN_STIGMA_KEY);

export const HUMAN_PROOF_STAGES = [
  { min:0,   name:'평범한 인간',     icon:'👤', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"/><path d="M6 20 C6 15.5 8.5 13 12 13 C15.5 13 18 15.5 18 20"/></svg>`, color:'#c0a060',
    desc:'아직 자신만의 길이 없다.',
    bonus:{}, aiHint:'평범한 인간. 잠재력은 있지만 아직 드러나지 않았다.' },
  { min:20,  name:'배우는 자',       icon:'📖', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L4 19 L11 19 L11 4 Z" stroke-linejoin="round"/><path d="M13 4 L13 19 L20 19 L20 4 Z" stroke-linejoin="round"/></svg>`, color:'#d0b060',
    desc:'실수에서 배우기 시작했다. 같은 실수를 반복하지 않는다.',
    bonus:{luk:5, per:4, int:4}, aiHint:'실수에서 배우는 인간. 이번엔 다르게 행동한다.' },
  { min:60,  name:'성장하는 자',     icon:'🌱', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 6"/><path d="M12 6 C10 6 9 4.5 9 3 C10.5 3 12 4 12 6 Z" stroke-width="1.2"/><path d="M12 6 C14 6 15 4.5 15 3 C13.5 3 12 4 12 6 Z" stroke-width="1.2"/></svg>`, color:'#e0c040',
    desc:'실패를 발판으로 성장한다. 주변이 이 인간의 성장을 눈치챈다.',
    bonus:{luk:10, per:8, int:8, wil:6, str:5}, aiHint:'눈에 띄게 성장하는 인간. 같은 상황에서 더 현명하게 행동한다.' },
  { min:120, name:'증명된 인간',     icon:'⭐', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4.5" stroke-width="1.4"/><path d="M9.3 12 L7 21 L12 18.5 L17 21 L14.7 12"/></svg>`, color:'#f0c820',
    desc:'실패를 완전히 극복했다. 낙인이 힘으로 바뀌었다.',
    bonus:{luk:18, per:15, int:14, wil:12, str:10, cha:8}, aiHint:'증명된 인간. 한때의 약점이 지금은 강점이 됐다. 낙인의 흔적조차 위엄으로 보인다.' },
  { min:200, name:'전설의 인간',     icon:'🌟', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></svg>`, color:'#ffd700',
    desc:'인간의 한계를 넘었다. 실수조차 전설의 일부가 된다.',
    bonus:{luk:28, per:24, int:22, wil:20, str:16, cha:14, trst:10, rep:10},
    aiHint:'전설적인 인간. 이 인물의 과거 실수와 극복이 이미 사람들 사이에서 이야기로 전해지고 있다.' },
];

export function getProofStage(pts) {
  let s = HUMAN_PROOF_STAGES[0];
  for (const st of HUMAN_PROOF_STAGES) { if (pts >= st.min) s = st; }
  return s;
}
window.getProofStage = getProofStage;

export function addStigma(typeId, note) {
  if (!isHumanRace()) return;
  const hs = loadHumanStigma();
  const def = STIGMA_TYPES.find(t => t.id === typeId);
  if (!def) return;

  hs.stigmas = hs.stigmas || {};
  const prev = hs.stigmas[typeId] || 0;
  hs.stigmas[typeId] = prev + 1;
  hs.totalStigmaCount = (hs.totalStigmaCount||0) + 1;

  // 낙인 패널티 누적 적용
  const stack = hs.stigmas[typeId];
  if (def.penalty) {
    Object.entries(def.penalty).forEach(([k,v]) => {
      S.stats[k] = Math.max(0, (S.stats[k]||50) + v);
    });
    if (typeof saveStats==='function') saveStats(S.stats);
  }

  hs.history = hs.history || [];
  hs.history.push({ type:'낙인', typeId, label:def.label, icon:def.icon, stack, note:note||'', at:new Date().toISOString().slice(0,16) });
  

  saveHumanStigma(hs);
  applyHumanStigmaStats();

  if (stack >= 3) {
    setTimeout(() => toastHTML(`⚠️ 낙인 강화! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} ${esc(def.label)} ${esc(stack)}회 반복 — 패널티 누적!`, 4000), 200);
  } else {
    toastHTML(`🔴 낙인: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} ${esc(def.label)} (${esc(stack)}회)`, 3000);
  }
}
window.addStigma = addStigma;

export function overcomeStigma(typeId) {
  if (!isHumanRace()) return;
  const hs = loadHumanStigma();
  const def = STIGMA_TYPES.find(t => t.id === typeId);
  if (!def) return;
  const count = hs.stigmas?.[typeId] || 0;
  if (count === 0) { toast('⚠️ 이 낙인이 없습니다.'); return; }

  const proofGain = count * 8 + 10;
  hs.stigmas[typeId] = Math.max(0, count - 1);
  hs.proofPoints = Math.min(300, (hs.proofPoints||0) + proofGain);
  hs.overcomeCounts = hs.overcomeCounts || {};
  hs.overcomeCounts[typeId] = (hs.overcomeCounts[typeId]||0) + 1;

  // 패널티 일부 회복
  if (def.penalty) {
    Object.entries(def.penalty).forEach(([k,v]) => {
      S.stats[k] = Math.min(999, (S.stats[k]||50) - v); // 패널티 취소
    });
    if (typeof saveStats==='function') saveStats(S.stats);
  }

  hs.history.push({ type:'극복', typeId, label:def.label, icon:'✅', proofGain, at:new Date().toISOString().slice(0,16) });
  saveHumanStigma(hs);
  applyHumanStigmaStats();

  // 각성력 연동
  if (typeof gainHumanAwakening==='function') gainHumanAwakening('growth', Math.round(proofGain/3));

  const prevStage = getProofStage((hs.proofPoints||0) - proofGain);
  const newStage  = getProofStage(hs.proofPoints||0);
  if (newStage.name !== prevStage.name) {
    setTimeout(() => toastHTML(`🌟 인간의 증명! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(newStage,{size:14}):(newStage.icon)} ${esc(newStage.name)}`, 4000), 300);
  }

  toastHTML(`✅ 낙인 극복! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} ${esc(def.label)} — 인간의 증명 +${esc(proofGain)}`, 4000);
  renderHumanStigmaPanel();
}
window.overcomeStigma = overcomeStigma;

export function applyHumanStigmaStats() {
  if (!isHumanRace()) return;
  const hs = loadHumanStigma();
  const stg = getProofStage(hs.proofPoints||0);
  const prev = S._humanStigmaBonus || {};
  Object.entries(prev).forEach(([k,v]) => { if (S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v); });
  const nb = {};
  Object.entries(stg.bonus||{}).forEach(([k,v]) => { S.stats[k]=Math.min(999,(S.stats[k]||50)+v); nb[k]=v; });
  S._humanStigmaBonus = nb;
  if (typeof saveStats==='function') saveStats(S.stats);
  window.updateHeader();
}
window.applyHumanStigmaStats = applyHumanStigmaStats;

export function detectHumanStigmaFromText(text) {
  if (!text || !isHumanRace()) return;
  if (/도망쳤|겁을 먹고|물러났|두려워서/.test(text) && Math.random()<0.4) addStigma('cowardice', 'AI 감지');
  if (/또 실패|같은 실수|반복됐/.test(text) && Math.random()<0.5) addStigma('failure', 'AI 감지');
  if (/극복했|이겨냈|이번엔 다르게|성장했/.test(text) && Math.random()<0.4) {
    const hs = loadHumanStigma();
    const activeStigmas = Object.entries(hs.stigmas||{}).filter(([,v])=>v>0);
    if (activeStigmas.length > 0) {
      const [tid] = activeStigmas[Math.floor(Math.random()*activeStigmas.length)];
      overcomeStigma(tid);
    }
  }
}
window.detectHumanStigmaFromText = detectHumanStigmaFromText;

export function renderHumanStigmaPanel() {
  const body = document.getElementById('pb-human-stigma');
  if (!body) return;
  if (!isHumanRace()) {
    body.innerHTML=`<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px"><div style="font-size:32px;margin-bottom:10px">🔴</div><div>인간족 캐릭터에게만 활성화됩니다.</div></div>`;
    return;
  }
  const hs = loadHumanStigma();
  const proofPts = hs.proofPoints||0;
  const stg = getProofStage(proofPts);
  const color = stg.color;
  const activeStigmas = Object.entries(hs.stigmas||{}).filter(([,v])=>v>0);
  const totalStigmaStacks = activeStigmas.reduce((a,[,v])=>a+v,0);

  body.innerHTML = `
    <!-- ① 헤더 -->
    <div style="padding:14px;background:linear-gradient(135deg,#180800,#220c00);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#806040;margin-top:2px">인간의 증명 ${proofPts} | 활성 낙인 ${activeStigmas.length}종 (${totalStigmaStacks}스택)</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:${color}">${proofPts}<span style="font-size:9px;color:#605030">/300</span></div>
          <div style="font-size:8px;color:#605030">증명 포인트</div>
        </div>
      </div>
      <div style="height:6px;background:#150800;border-radius:3px;overflow:hidden;margin-bottom:4px;border:1px solid #402010">
        <div style="width:${Math.min(100,Math.round(proofPts/3))}%;height:100%;background:linear-gradient(90deg,#604010,${color});border-radius:3px;transition:width .4s"></div>
      </div>
      <div style="font-size:9px;color:#a07040;font-style:italic;margin-top:4px">"${stg.desc}"</div>
    </div>

    <!-- ② 증명 단계 -->
    <div style="padding:8px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 인간의 증명 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${[...HUMAN_PROOF_STAGES].reverse().map(s => {
          const active = s.name === stg.name;
          const passed = proofPts > s.min && !active;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#1a1000':passed?'#0f0c00':'#0a0800'};border:1px solid ${active?s.color:passed?s.color+'55':'#1a1000'};border-radius:2px;opacity:${active||passed?1:0.4}">
            <span style="display:inline-flex;width:11px;height:11px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:11}):((s.svgIcon||'').replace('width="20" height="20"','width="11" height="11"')||s.icon)}</span>
            <div style="flex:1"><span style="font-family:'Cinzel',serif;font-size:9px;color:${active?s.color:passed?s.color:'#504030'}">${s.name}</span><span style="font-size:8px;color:#3a2010;margin-left:4px">(${s.min}+)</span></div>
            ${active?`<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀</span>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ③ 현재 낙인 목록 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#e06040;letter-spacing:1px;margin-bottom:6px">── 현재 낙인 (${activeStigmas.length}종) ──</div>
      ${activeStigmas.length === 0
        ? `<div style="font-size:9px;color:#4a2010;text-align:center;padding:8px">낙인이 없습니다 ✓</div>`
        : activeStigmas.map(([tid, count]) => {
            const def = STIGMA_TYPES.find(t=>t.id===tid);
            if (!def) return '';
            const severity = count >= 3 ? '#ff4040' : count >= 2 ? '#e06040' : '#c08060';
            return `<div style="padding:7px 9px;background:#1a0800;border:1px solid ${severity}55;margin-bottom:4px;border-radius:2px">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:16}):(def.icon)}</span>
                <div style="flex:1">
                  <div style="font-family:'Cinzel',serif;font-size:10px;color:${severity}">${def.label} <span style="font-size:9px">×${count}</span></div>
                  <div style="font-size:8px;color:#804030">${esc(def.desc)}</div>
                  <div style="font-size:8px;color:#603020;margin-top:1px">${Object.entries(def.penalty).map(([k,v])=>`${k.toUpperCase()} ${v*count}`).join(' ')}</div>
                </div>
                <span style="font-size:8px;color:#4a2a10;font-style:italic">AI 자동 극복</span>
              </div>
            </div>`;
          }).join('')}
    </div>

    <!-- ④ 낙인 안내 (자동 전용) -->
    <div style="padding:8px 12px;border-bottom:1px solid #1a1000">
      <div style="font-size:9px;color:#5a3020;font-style:italic;text-align:center;padding:4px 0">
        🔴 낙인은 AI 서사에서 자동으로 찍히고 극복됩니다
      </div>
    </div>

    <!-- ⑤ 극복 기록 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 극복 기록 ──</div>
      ${Object.entries(hs.overcomeCounts||{}).filter(([,v])=>v>0).length === 0
        ? `<div style="font-size:9px;color:#4a2010;text-align:center;padding:6px">극복 기록이 없습니다</div>`
        : `<div style="display:flex;flex-wrap:wrap;gap:4px">
            ${Object.entries(hs.overcomeCounts||{}).filter(([,v])=>v>0).map(([tid,cnt])=>{
              const def = STIGMA_TYPES.find(t=>t.id===tid);
              return `<div style="padding:3px 8px;background:#001a08;border:1px solid #40c06066;border-radius:2px;font-size:9px;color:#60d090">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def?.icon||'✅')} ${def?.label||tid} ×${cnt}</div>`;
            }).join('')}
          </div>`}
    </div>

    <!-- ⑥ 최근 기록 -->
    ${(hs.history||[]).length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 기록 ──</div>
      ${[...hs.history].reverse().slice(0,10).map(h=>`
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0d0a00;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#907050">${esc(h.label)}</span>
          <span style="color:${h.type==='극복'?'#60d090':'#e06040'}">${h.type}</span>
          ${h.proofGain?`<span style="color:${color};font-family:'Cinzel',serif">+${h.proofGain}</span>`:''}
          <span style="color:#3a2010;font-size:8px">${h.at||''}</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderHumanStigmaPanel = renderHumanStigmaPanel;

window.renderHumanStigmaPanel    = renderHumanStigmaPanel;

window.addStigma                 = addStigma;

window.overcomeStigma            = overcomeStigma;

window.applyHumanStigmaStats     = applyHumanStigmaStats;

window.detectHumanStigmaFromText = detectHumanStigmaFromText;

window.loadHumanStigma           = loadHumanStigma;

window.clearHumanStigma          = clearHumanStigma;

export const SOCIAL_RANK_LOG_KEY = 'tf-social-rank-log';

export const loadSocialRankLog  = () => { try { return JSON.parse(lsGet(SOCIAL_RANK_LOG_KEY)||'[]'); } catch(e) { return []; } };

export const saveSocialRankLog  = (d) => { try { lsSet(SOCIAL_RANK_LOG_KEY, JSON.stringify(d)); } catch(e) {} };

export function changeSocialRank(newRankId, reason) {
  const c = S.character;
  if (!c) return;
  const oldRank = SOCIAL_RANKS.find(r => r.id === c.socialRankId);
  const newRank = SOCIAL_RANKS.find(r => r.id === newRankId);
  if (!newRank) return;

  // 확인 팝업
  const dir = newRank.tier > (oldRank?.tier || 1) ? '⬆️ 상승' : newRank.tier < (oldRank?.tier || 1) ? '⬇️ 하락' : '↔️ 변경';
  const confirmMsg = `👑 신분 ${dir}\n\n${oldRank?.icon||''} ${oldRank?.name||'현재'} → ${newRank.icon} ${newRank.name}\n사유: ${reason||'직접 설정'}\n\n정말 변경하겠습니까?\n(AI 서사에 즉시 반영됩니다)`;
  if (!confirm(confirmMsg)) return;

  // 이전 신분 스탯 제거
  if (oldRank) {
    Object.entries(oldRank.startStat || {}).forEach(([k, v]) => {
      if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v);
    });
  }

  // 새 신분 적용
  c.socialRankId = newRankId;
  c.socialRank   = newRank.name;
  Object.entries(newRank.startStat || {}).forEach(([k, v]) => {
    S.stats[k] = Math.min(999, Math.max(0, (S.stats[k] || 10) + v));
  });

  if (typeof saveStats === 'function') saveStats(S.stats);
  updateCharHeader();
  window.updateHeader();

  // 로그 기록
  const log = loadSocialRankLog();
  log.push({
    from: oldRank ? oldRank.name : '알 수 없음',
    fromIcon: oldRank ? oldRank.icon : '?',
    fromSvgIcon: oldRank ? oldRank.svgIcon : '',
    to: newRank.name, toIcon: newRank.icon, toSvgIcon: newRank.svgIcon,
    reason: reason || '',
    at: new Date().toISOString().slice(0, 16)
  });
  
  saveSocialRankLog(log);

  toastHTML(`👑 신분 ${esc(dir)}! ${esc(oldRank?.icon||'')} ${esc(oldRank?.name||'?')} → ${typeof getEntityIconHTML==='function'?getEntityIconHTML(newRank,{size:14}):(newRank.icon)} ${esc(newRank.name)}`, 4000);

  renderSocialRankPanel();
}
window.changeSocialRank = changeSocialRank;

window.changeSocialRank = changeSocialRank;

export function renderSocialRankPanel() {
  const body = document.getElementById('pb-social-rank');
  if (!body) return;
  const c = S.character;
  if (!c) { body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim)">게임을 시작하면 활성화됩니다.</div>`; return; }

  const curRankId = c.socialRankId || 'commoner';
  const curRank   = SOCIAL_RANKS.find(r => r.id === curRankId) || SOCIAL_RANKS[1];
  const color     = curRank.color;
  const log       = loadSocialRankLog();

  // 신분 변경 이벤트 정의
  const RANK_EVENTS = [
    { id:'re_liberate',  label:'해방·사면',    icon:'🔓', desc:'굴레에서 벗어나 자유를 얻었다.',
      options: [
        {from:['slave'],                    to:'serf',      label:'노예 → 농노 (영지 귀속)'},
        {from:['slave','serf','vagrant'],   to:'commoner',  label:'→ 평민 (완전 해방·정착)'},
        {from:['outlaw'],                   to:'commoner',  label:'무법자 → 평민 (사면)'},
        {from:['vagrant'],                  to:'outlaw',    label:'부랑자 → 무법자 (범죄에 가담)'},
      ]
    },
    { id:'re_knighting', label:'기사 서임',    icon:'⚔️', desc:'왕이나 귀족에게 기사 서임을 받았다.',
      options: [
        {from:['commoner','merchant','squire'], to:'squire', label:'→ 종사(見習) 선발'},
        {from:['squire'],                      to:'knight', label:'종사 → 기사 (서임식)'},
        {from:['commoner','merchant'],         to:'knight', label:'→ 기사 (특별 공훈 서임)'},
      ]
    },
    { id:'re_craft',     label:'직인·상업',    icon:'🔨', desc:'기술이나 장사로 자리를 잡았다.',
      options: [
        {from:['commoner','vagrant'],          to:'artisan',       label:'→ 장인 (길드 가입)'},
        {from:['commoner','artisan'],          to:'merchant',      label:'→ 부유한 상인 (성공적인 사업)'},
        {from:['merchant'],                    to:'grand_merchant',label:'부유한 상인 → 대상인 (무역 제국 건설)'},
      ]
    },
    { id:'re_ennoblement', label:'귀족 서임',  icon:'🏠', desc:'영지와 작위를 하사받아 귀족이 됐다.',
      options: [
        {from:['knight','merchant'],           to:'baronet',  label:'→ 준남작 (명예 작위 수여)'},
        {from:['knight','merchant','baronet'], to:'baron',    label:'→ 남작 (영지 하사)'},
        {from:['grand_merchant'],              to:'baron',    label:'대상인 → 남작 (작위 매입)'},
        {from:['baron'],                       to:'viscount', label:'남작 → 자작 (승작)'},
        {from:['viscount'],                    to:'count',    label:'자작 → 백작 (승작)'},
        {from:['count'],                       to:'marquis',  label:'백작 → 후작 (변경 수호)'},
        {from:['marquis'],                     to:'duke',     label:'후작 → 공작 (최고 승작)'},
      ]
    },
    { id:'re_fall',      label:'몰락·실각',    icon:'📉', desc:'권력을 잃거나 배신으로 신분이 떨어졌다.',
      options: [
        {from:['emperor'],                     to:'king',     label:'황제 → 왕 (제국 붕괴)'},
        {from:['king','prince'],               to:'duke',     label:'왕족 → 공작 (폐위)'},
        {from:['duke'],                        to:'marquis',  label:'공작 → 후작 (실각)'},
        {from:['marquis'],                     to:'count',    label:'후작 → 백작 (강등)'},
        {from:['count'],                       to:'viscount', label:'백작 → 자작 (강등)'},
        {from:['viscount'],                    to:'baron',    label:'자작 → 남작 (강등)'},
        {from:['baron','knight','viscount','count','marquis','duke'], to:'commoner', label:'→ 평민 (몰락·작위 박탈)'},
        {from:['commoner','merchant','artisan'],to:'vagrant',  label:'→ 부랑자 (파산·추방)'},
        {from:['commoner','merchant'],         to:'outlaw',   label:'→ 무법자 (지명수배)'},
        {from:['commoner','knight','baron'],   to:'slave',    label:'→ 노예 (전쟁 포로/빚)'},
      ]
    },
    { id:'re_guild',     label:'교계 승진',  icon:'⛪', desc:'교회 내에서 정식으로 승진했다.',
      options: [
        {from:['commoner','merchant','knight'],                 to:'priest',      label:'→ 성직자 (서품)'},
        {from:['priest'],                                       to:'bishop',      label:'성직자 → 주교 (교계 승진)'},
        {from:['bishop'],                                       to:'archbishop',  label:'주교 → 대주교 (최고 승진)'},
      ]
    },
    { id:'re_royal',     label:'왕실 입적',    icon:'👑', desc:'왕실 혼인이나 입양으로 왕족이 됐다.',
      options: [
        {from:['duke','count','marquis'],      to:'prince',   label:'→ 왕자/공주 (왕실 혼인·입양)'},
        {from:['prince'],                      to:'king',     label:'왕자/공주 → 왕/여왕 (즉위)'},
        {from:['king'],                        to:'emperor',  label:'왕 → 황제 (제국 선포)'},
        {from:['king','emperor'],              to:'retired_monarch', label:'→ 상황 (왕위 은퇴)'},
      ]
    },
  ];

  const tierLabels = ['최하층 (노예·농노·무법자·부랑자)','자유민 (평민·장인·상인)','하급 귀족·전문직 (기사·성직자·준남작)','중급 귀족 (남작·자작·백작·주교)','고위 귀족 (후작·공작·대주교)','최상층 (왕족·왕·황제·상황)'];

  body.innerHTML = `
    <!-- ① 현재 신분 -->
    <div style="padding:14px;background:linear-gradient(135deg,#100800,#1a1000);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.6);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(curRank,{size:16}):(curRank.svgIcon||curRank.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:14px;color:${color};letter-spacing:1px">${curRank.name}</div>
          <div style="font-size:9px;color:#806040;margin-top:2px">${tierLabels[curRank.tier]} · ${curRank.desc}</div>
        </div>
      </div>
      <div style="font-size:10px;color:#a08050;line-height:1.7;font-style:italic;margin-bottom:8px">"${curRank.lore}"</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
        <div style="padding:5px 8px;background:#180e00;border:1px solid #3a2010;border-radius:2px;font-size:9px">
          <div style="color:#806040;margin-bottom:2px">특권</div>
          <div style="color:#c0a050;line-height:1.5">${curRank.privilege}</div>
        </div>
        <div style="padding:5px 8px;background:#180e00;border:1px solid #3a2010;border-radius:2px;font-size:9px">
          <div style="color:#806040;margin-bottom:2px">NPC 반응</div>
          <div style="color:#c0a050;line-height:1.5">${curRank.npcReaction.slice(0,60)}...</div>
        </div>
      </div>
      ${curRank.special ? `<div style="margin-top:6px;padding:5px 8px;background:#1a1200;border:1px solid ${color}55;border-radius:2px;font-size:9px;color:${color}">${curRank.special}</div>` : ''}
    </div>

    <!-- ② 스탯 효과 -->
    <div style="padding:8px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 신분 스탯 효과 ──</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px">
        ${Object.entries(curRank.startStat).filter(([,v])=>v!==0).map(([k,v]) =>
          `<span style="padding:2px 7px;background:${v>0?'#0a1800':'#180a00'};border:1px solid ${v>0?'#306010':'#601010'};color:${v>0?'#80d040':'#e05050'};font-size:9px;border-radius:2px;font-family:'Cinzel',serif">${k.toUpperCase()} ${v>0?'+':''}${v}</span>`
        ).join('')}
      </div>
    </div>

    <!-- ③ 신분 계층 지도 -->
    <div style="padding:8px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 신분 계층 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${[4,3,2,1,0].map(tier => {
          const tierRanks = SOCIAL_RANKS.filter(r => r.tier === tier);
          return `<div style="display:flex;align-items:center;gap:5px;padding:4px 7px;background:${tier===curRank.tier?'#1a1200':'#0e0a00'};border:1px solid ${tier===curRank.tier?color:'#2a1800'};border-radius:2px">
            <span style="font-size:9px;color:#605030;min-width:55px">${tierLabels[tier]}</span>
            <div style="display:flex;flex-wrap:wrap;gap:3px;flex:1">
              ${tierRanks.map(r => `<span style="display:inline-flex;align-items:center;gap:3px;padding:1px 6px;background:${r.id===curRankId?r.color+'33':'transparent'};border:1px solid ${r.id===curRankId?r.color:r.color+'44'};color:${r.id===curRankId?r.color:r.color+'99'};font-size:9px;border-radius:2px"><span style="display:inline-flex;width:11px;height:11px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:11}):((r.svgIcon||'').replace('width="22" height="22"','width="11" height="11"')||r.icon)}</span>${r.name}</span>`).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ④ 신분 변경 이벤트 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 신분 변경 ──</div>
      <div style="font-size:9px;color:#806040;margin-bottom:8px;line-height:1.5">⚠️ 신분 변경은 AI 서사에 즉시 반영됩니다. 게임 중 실제로 신분이 바뀌는 사건이 있었을 때 사용하세요.</div>
      ${RANK_EVENTS.map(ev => {
        // 현재 신분에서 가능한 옵션만 필터
        const available = ev.options.filter(opt =>
          opt.from.includes(curRankId) || opt.from.includes('any')
        );
        if (available.length === 0) return '';
        return `<div style="margin-bottom:6px">
          <div style="font-size:8px;color:#a07040;margin-bottom:3px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(ev,{size:8}):(ev.icon)} ${ev.label} — ${ev.desc}</div>
          ${available.map(opt => {
            const toRank = SOCIAL_RANKS.find(r => r.id === opt.to);
            if (!toRank) return '';
            const isUp = toRank.tier > curRank.tier;
            const isDown = toRank.tier < curRank.tier;
            return `<button onclick="changeSocialRank('${opt.to}','${esc(ev.label)}')"
              style="width:100%;padding:7px 10px;background:#180e00;border:1px solid ${toRank.color}55;color:${toRank.color};font-size:9px;cursor:pointer;font-family:'Crimson Text',serif;text-align:left;border-radius:2px;margin-bottom:3px">
              ${isUp?'⬆️ ':isDown?'⬇️ ':'↔️ '}${toRank.icon} ${toRank.name} — ${esc(opt.label)}
            </button>`;
          }).join('')}
        </div>`;
      }).join('')}

    </div>

    <!-- ⑤ 변경 기록 -->
    ${log.length > 0 ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 신분 변경 기록 ──</div>
      ${[...log].reverse().slice(0, 8).map(l => `
        <div style="display:flex;align-items:center;gap:5px;padding:4px 0;border-bottom:1px solid #0d0a00;font-size:9px">
          <span style="display:inline-flex;width:11px;height:11px">${(l.fromSvgIcon||'').replace('width="22" height="22"','width="11" height="11"')||l.fromIcon}</span>
          <span style="color:#806040">${esc(l.from)}</span>
          <span style="color:#a07030">→</span>
          <span style="display:inline-flex;width:11px;height:11px">${(l.toSvgIcon||'').replace('width="22" height="22"','width="11" height="11"')||l.toIcon}</span>
          <span style="color:#c0a040">${esc(l.to)}</span>
          <span style="flex:1;color:#604030;font-size:8px">${esc(l.reason)}</span>
          <span style="color:#3a2010;font-size:8px">${l.at||''}</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderSocialRankPanel = renderSocialRankPanel;

window.renderSocialRankPanel = renderSocialRankPanel;

export const NPC_CORRUPTION_KEY = "tf-npc-corruption";

export const loadNpcCorruption = () => {
  try { return JSON.parse(lsGet(NPC_CORRUPTION_KEY) || "{}"); }
  catch(e) { return {}; }
};

export const saveNpcCorruption = (d) => { try { lsSet(NPC_CORRUPTION_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearNpcCorruption = () => lsDel(NPC_CORRUPTION_KEY);

export const THRALL_KEY = 'tf-thrall-system';

export const loadThrall  = () => { try{ return JSON.parse(lsGet(THRALL_KEY)||'{}'); }catch(e){ return {}; } };

export const saveThrall  = (d) => { try{ lsSet(THRALL_KEY, JSON.stringify(d)); }catch(e){} };

export const clearThrall = () => lsDel(THRALL_KEY);

export function defaultThrallData() {
  return {
    thralls:       [],       // 권속 목록
    bloodPoints:   0,        // 혈통 포인트 (흡혈/지배 행위로 누적)
    lordStage:     0,        // 군주 단계 0~5
    domainInfluence: {},     // locId → 혈통 영향력 수치
    history:       [],       // 권속화 기록
    totalThrallsEver: 0,     // 누적 권속 수 (계승 계산용)
  };
}
window.defaultThrallData = defaultThrallData;

export const THRALL_LORD_STAGES = [
  { stage:0, name:'입문자',       icon:'🩸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7" stroke-width="1.4"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>`,   threshold:0,    thrallSlots:2,  statBonus:{},                          desc:'아직 혈통의 힘에 눈뜨지 못했다.' },
  { stage:1, name:'혈종 귀족',    icon:'🦇', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 4 15.5 4 9.5 C4 6.5 6.2 4.5 8.8 4.5 C10.2 4.5 11.3 5.2 12 6.3 C12.7 5.2 13.8 4.5 15.2 4.5 C17.8 4.5 20 6.5 20 9.5 C20 15.5 12 21 12 21 Z" stroke-linejoin="round"/></svg>`,   threshold:50,   thrallSlots:5,  statBonus:{str:5,agi:5,per:8,cha:5},   desc:'권속이 생기고 혈통의 힘이 눈에 띄게 강해졌다.' },
  { stage:2, name:'피의 군주',    icon:'🌙', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" stroke-width="1.3"/><path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12" stroke-width="1"/></svg>`,   threshold:150,  thrallSlots:10, statBonus:{str:12,agi:10,per:15,cha:12,fear:10}, desc:'권속들이 자신의 의지를 느끼기 시작한다.' },
  { stage:3, name:'혈통 왕',      icon:'👑🩸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><circle cx="12" cy="21" r="1.4" fill="currentColor" stroke="none"/></svg>`, threshold:350,  thrallSlots:20, statBonus:{str:20,agi:18,per:22,cha:20,fear:18,mgc:15}, desc:'왕국 하나를 혈통으로 물들일 수 있다.' },
  { stage:4, name:'고대 혈군',    icon:'🌑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.2"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.3"/></svg>`,   threshold:700,  thrallSlots:50, statBonus:{str:30,agi:28,per:35,cha:30,fear:30,mgc:25,wil:20}, desc:'이름만으로도 공포가 퍼진다.' },
  { stage:5, name:'원초의 밤',    icon:'☠️🩸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.4"/><circle cx="9" cy="11" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.4" fill="currentColor" stroke="none"/></svg>`, threshold:1200, thrallSlots:999,statBonus:{str:50,agi:45,per:60,cha:50,fear:50,mgc:40,wil:35,luk:20}, desc:'세계의 밤이 곧 자신의 영토다.' },
];

export function getThrallRankName(thrallType, rankIdx) {
  const table = THRALL_RANK_TABLES[thrallType] || THRALL_RANK_DEFAULT;
  return table[Math.min(rankIdx, table.length - 1)] || THRALL_RANK_DEFAULT[Math.min(rankIdx, 9)] || '권속';
}
window.getThrallRankName = getThrallRankName;

window.getThrallRankName = getThrallRankName;

export function loadThrallData() {
  const raw = loadThrall();
  if (!raw.thralls) return Object.assign(defaultThrallData(), raw);
  return raw;
}
window.loadThrallData = loadThrallData;

export function saveThrallData(d) { saveThrall(d); }
window.saveThrallData = saveThrallData;

export function checkDominationAbility() {
  const job   = (typeof S !== 'undefined' && S.job) || '';
  const race  = (typeof S !== 'undefined' && S.character?.race) || '';
  const stats = (typeof S !== 'undefined' && S.stats) || {};
  const gsF   = (typeof loadGSFlags === 'function') ? loadGSFlags() : {};

  if (race === '뱀파이어' || race.includes('혈종') || race.includes('혈군') || race.includes('혈통'))
    return { ok:true, method: DOMINATION_METHODS.vampire,    source:'vampire' };
  // 세레스티얼 종족 + 진화 계열 — 신성 서약으로 지배
  if (race === '세레스티얼' || race.includes('세레스티얼') || race.includes('천사') ||
      race.includes('대천사') || race.includes('신의 화신') || race.includes('빛의 수호자') ||
      race.includes('성스러운 심판자') || race.includes('빛의 근원') || race.includes('불멸의 창조신'))
    return { ok:true, method: DOMINATION_METHODS.celestial,  source:'celestial_race' };
  if (job === 'necromancer')
    return { ok:true, method: DOMINATION_METHODS.necromancer, source:'necromancer' };
  // 성직자 직업 + 신앙 80+ (세레스티얼 종족은 위에서 처리)
  if (['cleric','archbishop','dark_priest'].includes(job) && (stats.fath||0) >= 80)
    return { ok:true, method: DOMINATION_METHODS.celestial,  source:'celestial_job' };
  if (job === 'summoner')
    return { ok:true, method: DOMINATION_METHODS.summoner,   source:'summoner' };
  if (race === '악마족' || race.includes('악마') || race.includes('마왕') || race.includes('혼돈의 신'))
    return { ok:true, method: DOMINATION_METHODS.demon,      source:'demon' };
  if (race === '다크링' || race.includes('다크링') || race.includes('심연') || race.includes('공허의 군주'))
    return { ok:true, method: DOMINATION_METHODS.darkling,   source:'darkling' };
  if (gsF['learned_domination_magic'])
    return { ok:true, method: DOMINATION_METHODS.vampire,    source:'magic' };

  return { ok:false, reason:'지배 능력 없음 (뱀파이어·세레스티얼·악마족·다크링 종족, 네크로맨서·소환사·신앙 80+ 성직자 직업 중 하나 필요)' };
}
window.checkDominationAbility = checkDominationAbility;

window.checkDominationAbility = checkDominationAbility;

export function gainBloodPoints(amount, reason) {
  const d = loadThrallData();
  d.bloodPoints = (d.bloodPoints || 0) + amount;
  // 군주 단계 업데이트
  let newStage = 0;
  for (const s of THRALL_LORD_STAGES) {
    if (d.bloodPoints >= s.threshold) newStage = s.stage;
  }
  const prevStage = d.lordStage || 0;
  d.lordStage = newStage;
  saveThrallData(d);

  if (newStage > prevStage) {
    const stageDef = THRALL_LORD_STAGES[newStage];
    toastHTML(`🩸 군주 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stageDef,{size:14}):(stageDef.icon)} ${esc(stageDef.name)}`, 5000);
    S._nextInjectedContext = (S._nextInjectedContext || '')
      + `\n[🩸 혈통 군주 단계 상승] ${stageDef.name} 단계에 도달했다. ${stageDef.desc} 이 변화를 서사에 극적으로 묘사하라.`;
    // 스탯 보너스 적용
    if (stageDef.statBonus && typeof S !== 'undefined' && S.stats) {
      Object.entries(stageDef.statBonus).forEach(([k, v]) => {
        if (S.stats[k] !== undefined) S.stats[k] = Math.min(999, (S.stats[k] || 0) + v);
      });
      if (typeof saveStats === 'function') saveStats(S.stats);
    }
  }
  return d;
}
window.gainBloodPoints = gainBloodPoints;

window.gainBloodPoints = gainBloodPoints;

export function addThrall(npcName, thrallType, reason) {
  const domCheck = checkDominationAbility();
  if (!domCheck.ok) { toast('⚠️ ' + domCheck.reason, 4000); return false; }

  const d = loadThrallData();
  if (d.thralls.find(t => t.name === npcName)) {
    toast(`${npcName}은(는) 이미 권속입니다`, 2500); return false;
  }
  // 슬롯 제한 없음 — 단, 낮은 군주 단계에서 많은 권속은 충성도 패널티

  const _thrallType = thrallType || domCheck.method.thrallType;
  const newThrall = {
    name:      npcName,
    type:      _thrallType,
    rank:      getThrallRankName(_thrallType, 0),
    rankIdx:   0,
    rankPoints: 0,
    loyalty:   80,
    location:  (typeof S !== 'undefined' && S.currentLocation?.name) || '불명',
    addedTurn: (typeof S !== 'undefined' && S.msgCount) || 0,
    isDeployed: false,
    deployedAt: null,
  };

  d.thralls.push(newThrall);
  d.totalThrallsEver = (d.totalThrallsEver || 0) + 1;
  d.history.push({ name:npcName, type:newThrall.type, turn:newThrall.addedTurn, reason: reason||'권속화' });

  // 혈통 포인트 획득
  gainBloodPoints(domCheck.method.cost, `${npcName} 권속화`);
  saveThrallData(d);

  // pm-npc에 권속 마킹
  try {
    const pmD = (typeof pmLoad === 'function') ? pmLoad('npc') : {};
    if (!pmD[npcName]) pmD[npcName] = {};
    pmD[npcName].isThrall    = true;
    pmD[npcName].thrallType  = newThrall.type;
    pmD[npcName].thrallRank  = getThrallRankName(_thrallType || newThrall?.type || '', 0);
    pmD[npcName].thrallTurn  = newThrall.addedTurn;
    if (typeof pmSave === 'function') pmSave('npc', pmD);
  } catch(e) {}

  // NPC 상태 변경
  try {
    const npcs = (typeof loadNPCs === 'function' ? loadNPCs() : []) || [];
    const npc = npcs.find(n => n.name === npcName);
    if (npc) { npc.isThrall = true; npc.thrallRank = newThrall.rank; if (typeof saveNPCs === 'function') saveNPCs(npcs); }
  } catch(e) {}

  toast(`🩸 ${npcName}이(가) ${newThrall.type}(으)로 권속화됐습니다!`, 4500);
  return true;
}
window.addThrall = addThrall;

window.addThrall = addThrall;

export function rankUpThrall(npcName, points) {
  const d = loadThrallData();
  const thrall = d.thralls.find(t => t.name === npcName);
  if (!thrall) return;
  thrall.rankPoints = (thrall.rankPoints || 0) + (points || 1);

  const curIdx  = thrall.rankIdx || 0;
  const nextDef = THRALL_RANKS[curIdx + 1];
  if (nextDef && thrall.rankPoints >= nextDef.threshold) {
    // ── 다중 조건 체크 ──────────────────────────────────
    const loyaltyOk  = (thrall.loyalty || 80) >= (nextDef.loyaltyReq || 0);
    const lordBpOk   = (typeof loadThrallData === 'function')
      ? ((loadThrallData().bloodPoints || 0) >= (nextDef.lordBpReq || 0))
      : true;
    const domainOk   = !nextDef.domainReq || (() => {
      if (!thrall.isDeployed || !thrall.deployedAt) return false;
      const d2 = loadThrallData();
      return (d2.domainInfluence[thrall.deployedAt] || 0) >= 40;
    })();

    if (!loyaltyOk) {
      toast(`⚠️ ${npcName} 성장 불가 — 충성도 ${nextDef.loyaltyReq}+ 필요 (현재 ${thrall.loyalty})`, 3000);
      saveThrallData(d); return;
    }
    if (!lordBpOk) {
      toast(`⚠️ ${npcName} 성장 불가 — 군주 혈통 포인트 ${nextDef.lordBpReq}+ 필요`, 3000);
      saveThrallData(d); return;
    }
    if (!domainOk) {
      toast(`⚠️ ${npcName} 성장 불가 — 파견 도시 영향력 40+ 필요 (6단계+)`, 3000);
      saveThrallData(d); return;
    }
    thrall.rankIdx = curIdx + 1;
    const newRankName = getThrallRankName(thrall.type, thrall.rankIdx);
    thrall.rank = newRankName;
    // 높은 단계일수록 더 많은 혈통 포인트 보상
    const bpReward = 20 + thrall.rankIdx * 8;
    toast(`⬆️ ${npcName}: ${newRankName} (${thrall.rankIdx}/9)`, 4000);
    gainBloodPoints(bpReward, `${npcName} 성장`);

    let ctxMsg = `\n[⬆️ 권속 성장 — ${npcName}] ${newRankName}(${thrall.rankIdx}단계). ${nextDef.desc}`;
    // 8단계 이상 — 독립 의지 경고
    if (thrall.rankIdx >= 8) {
      ctxMsg += ` 이 존재는 이제 군주와 대등하다. 충성도(${thrall.loyalty})가 낮으면 독립 선언이나 반란을 서사에 자연스럽게 암시하라.`;
    }
    // 9단계 — 반란 가능성 강력 경고
    if (thrall.rankIdx >= 9) {
      ctxMsg += ` ⚠️ 최고 단계 도달. 이 권속은 군주를 능가할 잠재력이 있다. 충성도가 50 미만이면 반란을 일으킬 수 있다.`;
    }
    S._nextInjectedContext = (S._nextInjectedContext || '') + ctxMsg;

    try {
      const pmD = pmLoad('npc');
      if (pmD[npcName]) { pmD[npcName].thrallRank = newRankName; pmD[npcName].thrallRankIdx = thrall.rankIdx; pmSave('npc', pmD); }
    } catch(e) {}
  }
  saveThrallData(d);
}
window.rankUpThrall = rankUpThrall;

window.rankUpThrall = rankUpThrall;

export function deployThrall(npcName, locId) {
  const d = loadThrallData();
  const thrall = d.thralls.find(t => t.name === npcName);
  if (!thrall) { toast('해당 권속을 찾을 수 없습니다', 2500); return; }
  thrall.isDeployed = true;
  thrall.deployedAt = locId;
  // 혈통 영향력 증가
  d.domainInfluence[locId] = Math.min(100, (d.domainInfluence[locId] || 0) + 15);
  saveThrallData(d);
  gainBloodPoints(10, `${npcName} ${locId} 파견`);
  toast(`🗺️ ${npcName}이(가) ${locId}에 파견됐습니다. 혈통 영향력 +15`, 3500);
}
window.deployThrall = deployThrall;

window.deployThrall = deployThrall;

export function tickThrallLoyalty() {
  const d = loadThrallData();
  if (!d.thralls.length) return;
  let changed = false;
  // 군주 단계 대비 권속 과잉 시 충성도 추가 감소
  const stage     = d.lordStage || 0;
  const stageData = THRALL_LORD_STAGES[stage];
  const softCap   = stageData ? stageData.thrallSlots : 2;
  const overCount = Math.max(0, d.thralls.length - softCap);
  const overPenalty = overCount > 0 ? Math.min(5, Math.floor(overCount / 2) + 1) : 0;

  d.thralls.forEach(t => {
    const rankDef   = THRALL_RANKS[t.rankIdx || 0] || THRALL_RANKS[0];
    // 9단계 충성도 100 고정
    if ((t.rankIdx || 0) >= 9) { t.loyalty = 100; return; }
    const baseDecay = rankDef.loyaltyDecayPerTurn || 1;
    const totalDecay = baseDecay + overPenalty;

    // 파견 중이면 감소 완화 (임무가 있으면 이탈 이유가 줄어듦)
    const deployBonus = t.isDeployed ? 0.5 : 0;
    const finalDecay  = Math.max(0, totalDecay - deployBonus);

    t.loyalty = Math.max(0, (t.loyalty || rankDef.baseLoyalty || 70) - finalDecay);

    // 자동 충성도 상승 — 10턴마다 소폭 회복 (유대 축적)
    if ((S?.msgCount || 0) % 10 === 0) {
      const autoGain = Math.floor((t.rankIdx || 0) * 0.5) + 1; // 단계가 높을수록 더 회복
      t.loyalty = Math.min(100, t.loyalty + autoGain);
    }

    // 반란 체크 — 단계에 따라 기준이 다름
    const rebelThreshold = Math.max(5, 30 - (t.rankIdx || 0) * 3); // 단계 높을수록 임계값 낮아짐
    const rebelChance    = (t.rankIdx || 0) >= 8
      ? (t.loyalty <= 15 ? 0.08 : 0)       // 8~9단계: 극단적 상황에서만
      : (t.loyalty <= rebelThreshold ? 0.12 : 0); // 낮은 단계: 더 쉽게 이탈

    if (rebelChance > 0 && Math.random() < rebelChance) {
      const isHighRank = (t.rankIdx || 0) >= 7;
      const rebelMsg   = isHighRank
        ? `\n[⚔️ 고위 권속 이반] ${t.name}(${t.rank})이(가) 군주에게 등을 돌렸다. 오랜 유대가 무너지는 서사를 장엄하게 전개하라.`
        : `\n[⚔️ 권속 이탈] ${t.name}(${t.rank})의 충성도가 바닥나 이탈했다. 간단한 서사로 처리하라.`;
      toast(`⚠️ ${t.name}이(가) ${isHighRank ? '군주에게 등을 돌렸다!' : '이탈했다!'}`, 5000);
      S._nextInjectedContext = (S._nextInjectedContext || '') + rebelMsg;
      d.thralls = d.thralls.filter(x => x.name !== t.name);
      changed = true;
    }
  });
  if (changed) saveThrallData(d);
}
window.tickThrallLoyalty = tickThrallLoyalty;

window.tickThrallLoyalty = tickThrallLoyalty;

export function tickThrallDomainWSI() {
  const d = loadThrallData();
  if (!Object.keys(d.domainInfluence || {}).length) return;
  try {
    const wsi = (typeof loadWSI === 'function') ? loadWSI() : {};
    let changed = false;
    Object.entries(d.domainInfluence).forEach(([locId, inf]) => {
      if (!wsi[locId]) return;
      const prev = wsi[locId].playerInfluence || 0;
      wsi[locId].bloodInfluence = inf;
      // 혈통 영향력 → WSI playerInfluence 직접 반영 (최대 기여 50%)
      const bloodBonus = Math.floor(inf * 0.5);
      wsi[locId].playerInfluence = Math.min(100, Math.max(prev, bloodBonus));
      // 영향력 임계값별 controlLevel 자동 상승
      const pi = wsi[locId].playerInfluence;
      if (pi >= 80 && (wsi[locId].controlLevel || 0) < 4)
        wsi[locId].controlLevel = Math.max(wsi[locId].controlLevel || 0, 3);
      else if (pi >= 50 && (wsi[locId].controlLevel || 0) < 3)
        wsi[locId].controlLevel = Math.max(wsi[locId].controlLevel || 0, 2);
      else if (pi >= 20 && (wsi[locId].controlLevel || 0) < 2)
        wsi[locId].controlLevel = Math.max(wsi[locId].controlLevel || 0, 1);
      if (wsi[locId].playerInfluence !== prev) changed = true;
    });
    if (changed && typeof saveWSI === 'function') saveWSI(wsi);

    // 영지 연동 — 혈통 영향권이 영지에 미치는 효과
    try {
      if (typeof loadDemesne === 'function' && typeof saveDemesne === 'function') {
        const dem = loadDemesne();
        if (dem && dem.established) {
          // 혈통 영향권 도시 수에 따른 영지 보너스
          const highInflCount = Object.values(d.domainInfluence || {}).filter(v => v >= 40).length;
          if (highInflCount > 0) {
            dem.tax        = Math.min(100, (dem.tax || 50) + highInflCount * 0.5);
            dem.defense    = Math.min(100, (dem.defense || 50) + highInflCount * 0.3);
            dem.prosperity = Math.min(100, (dem.prosperity || 50) + highInflCount * 0.2);
            saveDemesne(dem);
          }
        }
      }
    } catch(e) {}
  } catch(e) {}
}
window.tickThrallDomainWSI = tickThrallDomainWSI;

window.tickThrallDomainWSI = tickThrallDomainWSI;

export function getThrallBLS() {
  const d = loadThrallData();
  if (!d.thralls || !d.thralls.length) return '';
  const stageDef = THRALL_LORD_STAGES[d.lordStage || 0];
  const thrallList = d.thralls.map(t =>
    `${t.name}(${t.rank}·${t.type}·충성${t.loyalty}${t.deployedBattle?'·전투중':t.isDeployed?'·'+t.deployedAt+'파견':''})`
  ).join(', ');
  const domainList = Object.entries(d.domainInfluence || {}).filter(([,v]) => v >= 20)
    .map(([k, v]) => `${k}(혈통영향력${v})`).join(', ');

  let bls = `\n[🩸 혈통 지배 — ${stageDef.icon}${stageDef.name}(혈통포인트:${d.bloodPoints})] 권속(${d.thralls.length}명): ${thrallList}`;
  if (domainList) bls += ` | 혈통 영향권: ${domainList}`;

  // ── ① 현재 도시 판정 보너스 ──────────────────────────────
  // [버그 수정] _curLoc()이라는 존재하지 않는 함수를 호출하고 있었음.
  // 실제 현재 위치는 전역 변수 currentLocation(또는 S.currentLocation)임.
  try {
    const cur = (typeof window.currentLocation !== 'undefined' && window.currentLocation) ? window.currentLocation : (S?.currentLocation || null);
    if (cur) {
      const curInf = (d.domainInfluence || {})[cur.id] || 0;
      if (curInf >= 10) {
        const bonus = Math.round(curInf * 0.3);
        bls += `\n[🩸 현재 도시 혈통 영향력 ${curInf}%] 이 도시에서 협박·매혹·사회 판정에 +${bonus} 보너스. 주민들이 군주의 이름을 알고 두려워하거나 복종하는 분위기가 있다.`;
        if (curInf >= 50) bls += ' 이 도시는 이미 혈통의 영역 — 경비대조차 눈치를 보며 간섭하지 않는다.';
        if (curInf >= 80) bls += ' 도시 전체가 군주를 인정한다. 어떤 NPC와도 첫 대면부터 경계심이 낮다.';
      }
    }
  } catch(e) {}

  // ── ② 정보 자동 수집 — 영향력 30+ 도시 소문 ───────────────
  try {
    const highInfDomains = Object.entries(d.domainInfluence || {}).filter(([,v]) => v >= 30);
    if (highInfDomains.length && (typeof S !== 'undefined') && (S.msgCount || 0) % 8 === 0) {
      const wsi = (typeof loadWSI === 'function') ? loadWSI() : {};
      const rumors = highInfDomains.slice(0, 3).map(([locId, inf]) => {
        const s = wsi[locId];
        if (!s) return null;
        // 도시 상황에 따른 동향 정보
        let info = s.name + ':';
        if (s.prosperity < 30) info += '경제 침체(번영' + s.prosperity + ')';
        else if (s.loyalty < 40) info += '민심 불안(민심' + s.loyalty + ')';
        else if (s.defense >= 70) info += '방어 강화(방어' + s.defense + ')';
        else info += '영향력' + inf + '% — 안정적';
        return info;
      }).filter(Boolean);
      if (rumors.length) {
        bls += `\n[📡 혈통 첩보망 — 파견 권속 보고] ${rumors.join(' / ')} — 이 정보를 서사에 자연스럽게 활용할 수 있다.`;
      }
    }
  } catch(e) {}

  bls += ` — 권속들은 군주의 의지에 복종하며 서사에서 자연스럽게 등장·행동한다. 충성도가 낮은 권속은 불만을 드러낼 수 있다.`;
  return bls;
}
window.getThrallBLS = getThrallBLS;

window.getThrallBLS = getThrallBLS;

export function rewardThrall(npcName, amount, reason) {
  const d = loadThrallData();
  const thrall = d.thralls.find(t => t.name === npcName);
  if (!thrall) return;
  const prev = thrall.loyalty;
  thrall.loyalty = Math.min(100, (thrall.loyalty || 70) + (amount || 10));
  saveThrallData(d);
  toast(`💛 ${npcName} 충성도 +${thrall.loyalty - prev} (${thrall.loyalty})`, 2500);
}
window.rewardThrall = rewardThrall;

window.rewardThrall = rewardThrall;

export function processEnemyRevivalGrantGS(gs){
  try{
    const rg = gs.enemy_revival_grant;
    if(!rg || !rg.name) return;
    const monsters = typeof loadMonsters==='function' ? loadMonsters() : [];
    const m = monsters.find(x=>x.name && x.name.includes(String(rg.name).slice(0,4)));
    if(!m) return;
    m.reviveChance = Math.max(0, Math.min(1, Number(rg.chance)||0.3));
    if(typeof saveMonsters==='function') saveMonsters(monsters);
    toast(`🔮 ${m.name}에게 부활의 힘이 깃들었다.`, 2500);
  }catch(e){ console.warn('[processEnemyRevivalGrantGS]', e); }
}
window.processEnemyRevivalGrantGS = processEnemyRevivalGrantGS;

window.processEnemyRevivalGrantGS = processEnemyRevivalGrantGS;

export function processSkillDefineGS(gs){
  try{
    const sd = gs.skill_define;
    if(!sd || !sd.id || !sd.name) return;
    if(!sd.effects || !sd.effects.kind) return; // 표준 스키마 없이는 등록하지 않음

    // [보안/안정성 수정] AI가 프롬프트 지시(영문 고유id)를 안 지키고
    // 따옴표·특수문자가 섞인 id를 보내면, 이 id가 나중에 로컬 전투 UI의
    // onclick="processLocalCombatTurn('skill', null, null, '${id}')" 안에
    // 그대로 삽입되어 HTML/JS 구문이 깨질 수 있다. 영문·숫자·언더스코어만
    // 남기고, 그 결과가 비어버리면 등록 자체를 거부한다.
    const safeId = String(sd.id).replace(/[^a-zA-Z0-9_]/g, '');
    if(!safeId) return;

    const jobSkills = typeof loadJobSkills==='function' ? loadJobSkills() : [];
    if(jobSkills.some(s=>s.id===safeId)) return; // 이미 등록된 스킬이면 중복 등록 방지

    const newSkill = {
      id: safeId,
      name: sd.name,
      icon: sd.icon || '✨',
      type: 'active',
      desc: sd.desc || `${sd.name} — 새로 습득한 스킬`,
      mpCost: sd.mpCost || 20,
      rarity: sd.rarity || 'uncommon',
      effects: sd.effects,
      scenario: S.scenario?.id || 'custom',
      jobRole: (S.character && (S.character.role||S.character.job)) || '',
    };
    saveJobSkills([...jobSkills, newSkill]);

    // 즉시 해금 처리 — 서사에서 이미 습득한 것으로 처리된 스킬이므로
    const unlocked = typeof loadSkills==='function' ? loadSkills() : {};
    unlocked[safeId] = true;
    if(typeof saveSkills==='function') saveSkills(unlocked);
    if(typeof S!=='undefined') S.unlockedSkills = unlocked;

    toastHTML(`📖 새 스킬 「${typeof getEntityIconHTML==='function'?getEntityIconHTML(sd,{size:14}):(sd.icon||"✨")} ${esc(sd.name)}」이(가) 시스템에 등록되었습니다.`, 3000);
    if(typeof renderSkills==='function') renderSkills();
  }catch(e){ console.warn('[processSkillDefineGS]', e); }
}
window.processSkillDefineGS = processSkillDefineGS;

window.processSkillDefineGS = processSkillDefineGS;

export function processThrallGS(gs) {
  if (!gs) return;
  // AI가 권속화 서사를 쓰면 npc_thrall 태그로 알림
  if (gs.npc_thrall) {
    const name = typeof gs.npc_thrall === 'string' ? gs.npc_thrall : gs.npc_thrall.name;
    const type = typeof gs.npc_thrall === 'object' ? gs.npc_thrall.type : null;
    if (name) addThrall(name, type);
  }
  // 권속 등급 상승
  if (gs.thrall_rankup) {
    const name = typeof gs.thrall_rankup === 'string' ? gs.thrall_rankup : gs.thrall_rankup.name;
    const pts  = typeof gs.thrall_rankup === 'object' ? (gs.thrall_rankup.points || 3) : 3;
    if (name) rankUpThrall(name, pts);
  }
  // 혈통 포인트 획득
  if (gs.blood_points) gainBloodPoints(Number(gs.blood_points) || 0, 'GS 보상');
  // 권속 반란
  // 권속 보상 — 충성도 상승
  if (gs.reward_thrall) {
    const name   = typeof gs.reward_thrall === 'string' ? gs.reward_thrall : gs.reward_thrall.name;
    const amount = typeof gs.reward_thrall === 'object' ? (gs.reward_thrall.amount || 10) : 10;
    if (name && typeof rewardThrall === 'function') rewardThrall(name, amount);
  }
  if (gs.thrall_revolt) {
    const name = gs.thrall_revolt;
    const d = loadThrallData();
    const thrall = d.thralls.find(t => t.name === name);
    if (thrall) { thrall.loyalty = 0; saveThrallData(d); }
  }
}
window.processThrallGS = processThrallGS;

window.processThrallGS = processThrallGS;

export function corruptNpc(npcName, methodId, customPower) {
  const dc = loadDemonCorruption();
  const myStage = dc.stage || 0;
  const method = NPC_CORRUPT_METHODS.find(m => m.id === methodId);
  if (!method) return;
  if (myStage < method.reqStage) {
    toast(`⚠️ 타락 단계 부족 (필요: ${method.reqStage}단계)`); return;
  }
  if (dc.points < method.cost) {
    toast(`⚠️ 타락도 부족 (필요: ${method.cost}, 현재: ${dc.points})`); return;
  }
  // 타락도 소모
  dc.points = Math.max(0, dc.points - method.cost);
  saveDemonCorruption(dc);
  applyDemonCorruptionStats();

  // NPC 타락도 증가
  const ncd = loadNpcCorruption();
  if (!ncd[npcName]) ncd[npcName] = { points: 0, stage: 0, history: [], corrupted: false };
  const prev = ncd[npcName];
  const power = customPower !== undefined ? customPower : method.power;
  prev.points = Math.min(100, (prev.points || 0) + power);

  // 단계 계산
  const prevStage = prev.stage || 0;
  let newStage = 0;
  for (let i = NPC_CORRUPTION_STAGES.length - 1; i >= 0; i--) {
    if (prev.points >= NPC_CORRUPTION_STAGES[i].threshold) { newStage = i; break; }
  }
  prev.stage = newStage;
  prev.corrupted = newStage >= 4;
  prev.history = prev.history || [];
  prev.history.push({
    method: method.name, icon: method.icon, power,
    total: prev.points, at: new Date().toISOString().slice(0, 16)
  });
  
  ncd[npcName] = prev;
  saveNpcCorruption(ncd);

  // 단계 상승 알림
  if (newStage > prevStage) {
    const stg = NPC_CORRUPTION_STAGES[newStage];
    setTimeout(() => toastHTML(`🖤 ${esc(npcName)}의 타락 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)} (${esc(newStage)}단계)`, 3500), 300);
    // AI 컨텍스트에 주입
    if (S._nextInjectedContext !== undefined) {
      S._nextInjectedContext = (S._nextInjectedContext || '') +
        ` [NPC 타락 진행: ${npcName} → ${stg.name}(${newStage}단계)] ${stg.aiHint}`;
    }
  } else {
    toastHTML(`🌑 ${esc(npcName)}에게 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(method,{size:14}):(method.icon)} ${esc(method.name)} 시전! (타락도 +${esc(power)} → ${esc(prev.points)}/100)`, 2500);
    if (S._nextInjectedContext !== undefined) {
      S._nextInjectedContext = (S._nextInjectedContext || '') +
        ` [NPC 타락 행동: ${npcName}에게 ${method.name} 시전. ${method.aiHint}]`;
    }
  }
  return prev;
}
window.corruptNpc = corruptNpc;

export function useCpsSkill(skillId, targetNpcName) {
  const skill = CORRUPTION_POWER_SKILLS.find(s => s.id === skillId);
  if (!skill) return;
  const dc = loadDemonCorruption();
  if ((dc.stage || 0) < skill.reqStage) {
    toast(`⚠️ 필요 타락 단계: ${skill.reqStage}단계 (현재: ${dc.stage || 0}단계)`); return;
  }
  if (dc.points < skill.cost) {
    toast(`⚠️ 타락도 부족! 필요: ${skill.cost}, 현재: ${dc.points}`); return;
  }
  dc.points = Math.max(0, dc.points - skill.cost);
  dc.history = dc.history || [];
  dc.history.push({
    type: "skill_use", gain: -skill.cost,
    label: `스킬: ${skill.name}`, icon: skill.icon,
    total: dc.points, at: new Date().toISOString().slice(0, 16)
  });
  
  saveDemonCorruption(dc);
  applyDemonCorruptionStats();

  const targetTxt = targetNpcName ? ` 대상: ${targetNpcName}` : "";
  if (S._nextInjectedContext !== undefined) {
    S._nextInjectedContext = (S._nextInjectedContext || '') +
      ` [타락력 스킬 발동: ${skill.icon} ${skill.name}${targetTxt}] ${skill.aiHint}`;
  }
  toast(`${skill.name} 발동! (타락도 -${skill.cost} → 잔여: ${dc.points})`, 3000, skill);
  renderDemonCorruptionPanel();
}
window.useCpsSkill = useCpsSkill;

export function openCpsSkillModal(skillId) {
  const skill = CORRUPTION_POWER_SKILLS.find(s => s.id === skillId);
  if (!skill) return;
  if (skill.targetable) {
    // 대상 선택 모달 표시
    const npcs = loadNPCs();
    const existingModal = document.getElementById('cps-target-modal');
    if (existingModal) existingModal.remove();
    const modal = document.createElement('div');
    modal.id = 'cps-target-modal';
    modal.style.cssText = `position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;`;
    const stageColor = DEMON_CORRUPTION_STAGES[loadDemonCorruption().stage || 0]?.color || '#c060d0';
    let npcButtons = npcs.length
      ? npcs.map(n => `<button onclick="useCpsSkill('${skillId}','${esc(n.name)}');document.getElementById('cps-target-modal').remove();renderDemonCorruptionPanel()"
          style="display:block;width:100%;padding:8px 12px;margin-bottom:5px;background:#1a0018;border:1px solid ${stageColor}55;color:${stageColor};font-size:11px;cursor:pointer;text-align:left;border-radius:2px">
          ${typeof getEntityIconHTML==='function'?getEntityIconHTML(n,{size:9}):(n.icon||"👤")} ${esc(n.name)} <span style="color:#4a2a4a;font-size:9px">${esc(n.role||'')}</span>
        </button>`).join('')
      : '<div style="color:#4a2a4a;font-size:10px;text-align:center;padding:10px">등록된 NPC가 없습니다</div>';
    modal.innerHTML = `<div style="background:#100010;border:2px solid ${stageColor};padding:18px;max-width:300px;width:90%;max-height:80vh;overflow-y:auto;border-radius:3px">
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${stageColor};margin-bottom:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(skill,{size:12}):(skill.icon)} ${skill.name} — 대상 선택</div>
      <div style="font-size:10px;color:#8050a0;margin-bottom:10px">${esc(skill.desc)}</div>
      ${npcButtons}
      <button onclick="useCpsSkill('${skillId}',null);document.getElementById('cps-target-modal').remove();renderDemonCorruptionPanel()"
        style="display:block;width:100%;padding:7px;margin-top:8px;background:#0a0020;border:1px solid #3a1a5a;color:#6040a0;font-size:10px;cursor:pointer;border-radius:2px">
        🌍 대상 없이 발동 (서사 내 지정)
      </button>
      <button onclick="document.getElementById('cps-target-modal').remove()"
        style="display:block;width:100%;padding:6px;margin-top:5px;background:transparent;border:1px solid #2a0020;color:#3a1a3a;font-size:10px;cursor:pointer;border-radius:2px">
        ✕ 취소
      </button>
    </div>`;
    document.body.appendChild(modal);
  } else {
    useCpsSkill(skillId, null);
  }
}
window.openCpsSkillModal = openCpsSkillModal;

export function openNpcCorruptModal() {
  const npcs = loadNPCs();
  const ncd = loadNpcCorruption();
  const dc = loadDemonCorruption();
  const myStage = dc.stage || 0;
  const stageColor = DEMON_CORRUPTION_STAGES[myStage]?.color || '#c060d0';

  const existingModal = document.getElementById('npc-corrupt-modal');
  if (existingModal) existingModal.remove();
  const modal = document.createElement('div');
  modal.id = 'npc-corrupt-modal';
  modal.style.cssText = `position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.92);display:flex;align-items:flex-end;justify-content:center;`;

  const npcList = npcs.length
    ? npcs.map(n => {
        const nd = ncd[n.name] || { points: 0, stage: 0 };
        const nstg = NPC_CORRUPTION_STAGES[nd.stage] || NPC_CORRUPTION_STAGES[0];
        const pct = Math.min(100, nd.points);
        return `<div style="padding:8px 10px;background:#0d0010;border:1px solid ${nd.stage > 0 ? nstg.color + '55' : '#2a0020'};margin-bottom:6px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <span style="font-size:18px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(n,{size:18}):(n.icon||"👤")}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${nstg.color}">${esc(n.name)}</div>
              <div style="font-size:8px;color:#6a406a">${esc(n.role||'')} · ${typeof getEntityIconHTML==='function'?getEntityIconHTML(nstg,{size:8}):(nstg.icon)} ${nstg.name}</div>
            </div>
            <div style="font-family:'Cinzel',serif;font-size:12px;color:${nstg.color}">${nd.points}<span style="font-size:8px;color:#4a2a4a">/100</span></div>
          </div>
          <div style="height:4px;background:#1a0010;border-radius:2px;overflow:hidden;margin-bottom:6px">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#6020a0,${nstg.color});border-radius:2px"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
            ${NPC_CORRUPT_METHODS.filter(m => myStage >= m.reqStage).map(m => {
              const canAfford = dc.points >= m.cost;
              return `<button onclick="corruptNpc('${esc(n.name)}','${m.id}');document.getElementById('npc-corrupt-modal').remove();renderDemonCorruptionPanel()"
                style="padding:5px 4px;background:${canAfford ? '#15000f' : '#0a0008'};border:1px solid ${canAfford ? stageColor+'44' : '#1a0015'};color:${canAfford ? stageColor : '#3a1a3a'};font-size:8px;cursor:${canAfford ? 'pointer' : 'not-allowed'};border-radius:2px;text-align:left"
                ${canAfford ? '' : 'disabled'}>
                ${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:16}):(m.icon)} ${m.name}<span style="color:#4a2a4a;float:right">-${m.cost}</span>
              </button>`;
            }).join('')}
          </div>
          ${nd.history && nd.history.length ? `<div style="margin-top:5px;font-size:8px;color:#4a2a4a">최근: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(nd.history[nd.history.length-1],{size:14}):(nd.history[nd.history.length-1]?.icon)} ${esc(nd.history[nd.history.length-1].method)}</div>` : ''}
        </div>`;
      }).join('')
    : '<div style="text-align:center;padding:20px;color:#4a2a4a;font-size:10px">등록된 NPC가 없습니다.<br>NPC와 대화를 나누면 자동 등록됩니다.</div>';

  modal.innerHTML = `<div style="background:linear-gradient(180deg,#100010,#0a0008);border-top:2px solid ${stageColor};padding:14px;width:100%;max-width:500px;max-height:85vh;overflow-y:auto;border-radius:3px 3px 0 0">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${stageColor}">🌑 NPC 타락 시스템</div>
      <div style="font-size:9px;color:#6a406a">보유 타락도: <span style="color:${stageColor};font-family:'Cinzel',serif">${dc.points}</span></div>
      <button onclick="document.getElementById('npc-corrupt-modal').remove()" style="background:none;border:none;color:#6a406a;font-size:14px;cursor:pointer">✕</button>
    </div>
    <div style="font-size:9px;color:#6a406a;margin-bottom:10px;font-style:italic">타락도를 소모해 NPC를 단계적으로 타락시킵니다. 완전 타락한 NPC는 영원한 추종자가 됩니다.</div>
    ${npcList}
  </div>`;
  document.body.appendChild(modal);
}
window.openNpcCorruptModal = openNpcCorruptModal;

window.renderDemonCorruptionPanel = function() {
  const body = document.getElementById('pb-demon-corruption');
  if (!body) return;
  const status = getDemonCorruptionStatus();
  if (!status) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">😇</div>
      <div>악마족 캐릭터에게만 활성화됩니다.</div>
      <div style="margin-top:6px;font-size:10px">캐릭터 설정에서 종족을 악마족으로 선택하세요.</div>
    </div>`;
    return;
  }
  const dc = status;
  const stg = dc.stageDef;
  const nextStg = dc.nextStage;
  const color = stg.color;
  const ncd = loadNpcCorruption();
  const corruptedNpcs = Object.entries(ncd).filter(([,v]) => v.stage > 0);

  // 해금된 스킬 (기존 타락 단계 스킬)
  const stageSkills = DEMON_CORRUPTION_STAGES.slice(0, (dc.stage || 0) + 1).flatMap(s => s.skills);

  // 해금된 타락력 소모 스킬
  const availableCpsSkills = CORRUPTION_POWER_SKILLS.filter(s => s.reqStage <= (dc.stage || 0));

  // 죄악 통계
  const sinEntries = Object.entries(dc.sin || {});
  const totalSin = sinEntries.reduce((a, [, v]) => a + v, 0);

  const RARITY_COLOR = { uncommon: "#4a9a6a", rare: "#4a6fa5", epic: "#8a40c0", legendary: "#c8a96e" };

  body.innerHTML = `
    <!-- ① 헤더: 현재 타락 단계 -->
    <div style="padding:14px;background:linear-gradient(135deg,#1a0010,#2a001a);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#a060a0;margin-top:2px">${dc.stage}단계 / 7단계</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:${color}">${dc.points}<span style="font-size:9px;color:#6a406a"> / 1000</span></div>
          <div style="font-size:8px;color:#6a406a">보유 타락도</div>
        </div>
      </div>
      <div style="height:6px;background:#1a0010;border-radius:3px;overflow:hidden;margin-bottom:4px">
        <div style="width:${Math.min(100, Math.round(dc.points / 10))}%;height:100%;background:linear-gradient(90deg,#6020a0,${color});border-radius:3px;transition:width .4s"></div>
      </div>
      ${nextStg ? `<div style="display:flex;justify-content:space-between;font-size:8px;color:#6a406a">
        <span>현재: ${dc.points}</span><span>다음 단계: ${nextStg.threshold}</span>
      </div>` : `<div style="font-size:8px;color:${color};text-align:center">⚠️ 최고 타락 단계 도달</div>`}
      <div style="margin-top:8px;font-size:10px;color:#9050a0;line-height:1.6;font-style:italic">"${stg.desc}"</div>
    </div>

    <!-- ② 오라 + 단계 표시 -->
    <div style="padding:7px 12px;background:#0d0008;border-bottom:1px solid #2a0020;font-size:10px;color:#7040a0">
      🌑 <span style="font-style:italic">${stg.aura}</span>
    </div>
    <div style="padding:8px 12px;border-bottom:1px solid #1a0015">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 타락 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${DEMON_CORRUPTION_STAGES.map((s, i) => {
          const active = i === dc.stage;
          const passed = i < dc.stage;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#1a0018':passed?'#0d000e':'#0a0008'};border:1px solid ${active?s.color:passed?s.color+'44':'#1a0015'};border-radius:2px;opacity:${active?1:passed?0.7:0.35}">
            <span style="display:inline-flex;width:12px;height:12px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:12}):((s.svgIcon||'').replace('width="20" height="20"','width="12" height="12"')||s.icon)}</span>
            <div style="flex:1"><span style="font-family:'Cinzel',serif;font-size:9px;color:${active?s.color:passed?s.color:'#4a2a4a'}">${s.name}</span><span style="font-size:8px;color:#4a2a4a;margin-left:5px">(${s.threshold})</span></div>
            ${active ? `<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀ 현재</span>` : ''}
            ${passed ? `<span style="font-size:9px;color:${s.color}">✓</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ③ 스탯 보너스/페널티 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0015">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 타락 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(stg.statBonus || {}).map(([k,v])=>`<div style="padding:3px 7px;background:#0d0a00;border:1px solid #3a2a0a;border-radius:2px;font-size:9px"><span style="color:${color}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:4px">+${v}</span></div>`).join('')}
        ${Object.entries(stg.statPenalty || {}).map(([k,v])=>`<div style="padding:3px 7px;background:#0d0000;border:1px solid #3a0a0a;border-radius:2px;font-size:9px"><span style="color:#a06060">${k.toUpperCase()}</span><span style="color:#e05050;margin-left:4px">${v}</span></div>`).join('')}
      </div>
    </div>

    <!-- ④ 타락력 소모 스킬 (신규) -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0015">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:8px">── 😈 타락력 소모 스킬 ──</div>
      ${availableCpsSkills.length === 0 ? `<div style="font-size:9px;color:#3a1a3a;text-align:center;padding:8px">타락 단계를 올려 스킬을 해금하세요</div>` : ''}
      ${availableCpsSkills.map(sk => {
        const canUse = dc.points >= sk.cost;
        const rc = RARITY_COLOR[sk.rarity] || '#8a9a8a';
        return `<div style="padding:8px 10px;background:${canUse?'#150010':'#0a0008'};border:1px solid ${canUse?rc+'55':'#1a0015'};margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:16}):(sk.icon)}</span>
            <div style="flex:1">
              <span style="font-family:'Cinzel',serif;font-size:10px;color:${canUse?rc:'#4a2a4a'}">${esc(sk.name)}</span>
              <span style="font-size:8px;padding:1px 4px;background:${rc}22;color:${rc};border:1px solid ${rc}44;border-radius:2px;margin-left:4px">${sk.rarity}</span>
            </div>
            <div style="text-align:right">
              <div style="font-family:'Cinzel',serif;font-size:11px;color:${canUse?'#d04080':'#4a2a4a'}">-${sk.cost}</div>
              <div style="font-size:7px;color:#4a2a4a">타락도</div>
            </div>
          </div>
          <div style="font-size:9px;color:#6040a0;margin-bottom:6px;line-height:1.5">${esc(sk.desc)}</div>
          <button onclick="openCpsSkillModal('${sk.id}')"
            style="width:100%;padding:5px;background:${canUse?'linear-gradient(135deg,#2a0020,#3a0030)':'#0a0008'};border:1px solid ${canUse?rc:'#1a0015'};color:${canUse?rc:'#3a1a3a'};font-family:'Cinzel',serif;font-size:9px;cursor:${canUse?'pointer':'not-allowed'};border-radius:2px"
            ${canUse?'':'disabled'}>
            ${sk.targetable ? '🎯 대상 선택 후 발동' : '⚡ 즉시 발동'} ${canUse?'':'(타락도 부족)'}
          </button>
        </div>`;
      }).join('')}
      ${dc.stage < 7 ? `<div style="font-size:8px;color:#3a1a3a;text-align:center;margin-top:5px">다음 단계(${(dc.stage||0)+1}단계)에서 추가 스킬 해금</div>` : ''}
    </div>

    <!-- ⑤ NPC 타락 시스템 (신규) -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0015">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:8px">── 🌑 NPC 타락 시스템 ──</div>
      ${corruptedNpcs.length > 0 ? `
        <div style="margin-bottom:8px">
          <div style="font-size:8px;color:#6a406a;margin-bottom:5px">타락 진행 중인 NPC (${corruptedNpcs.length}명)</div>
          ${corruptedNpcs.map(([name, nd]) => {
            const nstg = NPC_CORRUPTION_STAGES[nd.stage] || NPC_CORRUPTION_STAGES[0];
            return `<div style="display:flex;align-items:center;gap:7px;padding:5px 8px;background:#0d0010;border:1px solid ${nstg.color}44;margin-bottom:3px;border-radius:2px">
              <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(nstg,{size:16}):(nstg.icon)}</span>
              <div style="flex:1">
                <div style="font-size:9px;color:${nstg.color}">${esc(name)}</div>
                <div style="height:3px;background:#1a0010;border-radius:2px;margin-top:2px">
                  <div style="width:${nd.points}%;height:100%;background:${nstg.color};border-radius:2px"></div>
                </div>
              </div>
              <div style="font-size:8px;color:${nstg.color};font-family:'Cinzel',serif">${nd.points}/100</div>
              <div style="font-size:8px;color:#4a2a4a">${nstg.name}</div>
            </div>`;
          }).join('')}
        </div>
      ` : `<div style="font-size:9px;color:#3a1a3a;text-align:center;padding:6px">아직 타락시킨 NPC가 없습니다</div>`}
      <button onclick="openNpcCorruptModal()"
        style="width:100%;padding:8px;background:linear-gradient(135deg,#1a0015,#2a0020);border:1px solid ${color}55;color:${color};font-family:'Cinzel',serif;font-size:10px;cursor:pointer;border-radius:2px;letter-spacing:0.5px">
        🌑 NPC 타락 시전하기
      </button>
    </div>

    <!-- ⑥ 기존 타락 단계 스킬 -->
    ${stageSkills.length ? `
    <div style="padding:10px 12px;border-bottom:1px solid #1a0015">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 타락 단계 패시브 스킬 ──</div>
      ${stageSkills.map(sk => {
        if(!S.unlockedSkills) S.unlockedSkills = {}; // [F-12 FIX]
        const unlocked = !!S.unlockedSkills[sk.id];
        return `<div style="padding:6px 9px;background:${unlocked?'#150010':'#0a0008'};border:1px solid ${unlocked?color+'55':'#1a0015'};margin-bottom:4px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
            <span style="font-size:13px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:13}):(sk.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:9px;color:${color}">${esc(sk.name)}</span>
            <span style="font-size:7px;padding:1px 4px;background:${color}22;color:${color};border:1px solid ${color}44;border-radius:2px;margin-left:auto">${sk.rarity}</span>
            ${unlocked ? '<span style="font-size:9px;color:#60d060">✓</span>' : '<span style="font-size:9px;color:#4a2a4a">🔒</span>'}
          </div>
          <div style="font-size:9px;color:#7050a0;line-height:1.4">${esc(sk.desc)}</div>
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- ⑦ 죄악 행동 버튼 (AI 없이도 진행되도록 하는 수동 트리거 — 기존엔 detectDemonSinFromText의
         AI 서사 감지에만 의존해 no-API 모드에서 타락도가 영구 정지했음) -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0015">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 😈 죄악 행동 (수동) ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
        ${Object.entries(DEMON_SIN_GAIN).map(([sinType, def]) => `
          <button onclick="gainDemonCorruption('${sinType}');renderDemonCorruptionPanel()"
            style="padding:7px;background:#150010;border:1px solid ${color}44;color:#e05050;font-size:9px;cursor:pointer;font-family:'Crimson Text',serif;text-align:left;border-radius:2px;line-height:1.4">
            ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:7}):(def.icon)} ${def.label}<br><span style="font-size:7px;color:#603040">${esc(def.desc)}</span>
            <span style="float:right;font-family:'Cinzel',serif;font-size:9px;color:#e05050">+${def.gain}</span>
          </button>`).join('')}
      </div>
    </div>

    <!-- ⑧ 타락 정화 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0015">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 타락 정화 ──</div>
      ${DEMON_PURIFY_METHODS.map(m => {
        const canAfford = !m.cost.gold || S.gold >= m.cost.gold;
        const canHp = !m.cost.hp || (S.stats.hp || 100) > m.cost.hp + 10;
        const canUse = canAfford && canHp && dc.points > 0;
        return `<div style="padding:7px 9px;background:#0a0010;border:1px solid ${canUse?'#3a208a':'#1a0020'};margin-bottom:4px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
            <span style="font-size:13px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:13}):(m.icon)}</span>
            <div style="flex:1"><div style="font-family:'Cinzel',serif;font-size:9px;color:${canUse?'#9070d0':'#4a2a6a'}">${m.name}</div></div>
            <span style="font-size:9px;color:#40a080;font-family:'Cinzel',serif">-${m.reduce}</span>
          </div>
          <div style="font-size:8px;color:#6040a0;margin-bottom:4px">${esc(m.desc)}</div>
          <button onclick="demonPurify('${m.id}');renderDemonCorruptionPanel()"
            style="width:100%;padding:4px;background:${canUse?'#1a0a3a':'#0a0010'};border:1px solid ${canUse?'#5030a0':'#1a0020'};color:${canUse?'#9070d0':'#3a1a5a'};font-family:'Cinzel',serif;font-size:8px;cursor:${canUse?'pointer':'not-allowed'};border-radius:2px"
            ${canUse?'':'disabled'}>${canUse ? '✨ 정화하기' : '조건 미충족'}${m.cost.gold?` (${m.cost.gold}G)`:''}${m.cost.hp?` (HP -${m.cost.hp})`:''}
          </button>
        </div>`;
      }).join('')}
    </div>

    <!-- ⑨ 최근 기록 -->
    ${dc.history && dc.history.length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 최근 기록 ──</div>
      ${[...dc.history].reverse().slice(0, 12).map(h => `
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0d0010;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#6a406a">${esc(h.label)}</span>
          <span style="color:${h.gain > 0 ? '#d04080' : '#40a080'};font-family:'Cinzel',serif">${h.gain > 0 ? '+' : ''}${h.gain}</span>
          <span style="color:#3a1a3a;font-size:8px">(${h.total})</span>
        </div>`).join('')}
    </div>` : ''}
  `;
};

window.useCpsSkill          = useCpsSkill;

window.openCpsSkillModal    = openCpsSkillModal;

window.corruptNpc           = corruptNpc;

window.openNpcCorruptModal  = openNpcCorruptModal;

window.loadNpcCorruption    = loadNpcCorruption;

window.clearNpcCorruption   = clearNpcCorruption;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_23(){
window.useApsSkill           = useApsSkill;

window.openApsSkillModal     = openApsSkillModal;

window.inspireNpc            = inspireNpc;

window.openNpcInspireModal   = openNpcInspireModal;

window.renderHumanAwakeningPanel = window.renderHumanAwakeningPanel;

window.loadNpcInspire        = loadNpcInspire;

window.clearNpcInspire       = clearNpcInspire;

const _origDetectHumanDeed = window.detectHumanDeedFromText;

window.detectHumanDeedFromText = function(text) {
  if (_origDetectHumanDeed) _origDetectHumanDeed(text);
  detectHumanLegacyFromText(text);
  detectHumanStigmaFromText(text);
};

function autoDetectAndRegisterEnemy(text) {
  if (!text) return;

  // 조우 패턴: "X이/가 나타났다/등장했다/달려든다/막아섰다/앞을 가로막/덮쳐왔다/포위했다"
  const ENCOUNTER_PATTERNS = [
    /([가-힣a-zA-Z\s]{2,12})(?:이|가)\s*(?:나타났|나타나|등장했|등장하|달려들|달려왔|막아섰|앞을\s*가로막|덮쳐왔|포위했|가로막았|출현했|나타나며|뛰어들)/,
    /(?:눈앞에|앞에|정면에|갑자기)\s*([가-힣a-zA-Z\s]{2,12})(?:이|가)\s*(?:서있|서 있|나타|등장|모습을\s*드러)/,
    /([가-힣a-zA-Z\s]{2,12})(?:이|가)\s*(?:우리|당신|캐릭터|그)?\s*(?:앞을|앞에|길을|통로를)\s*(?:막|가로막|차단)/,
  ];

  // [신규] 제압/피습 패턴: 신규 등장이 아니라 "이미 알고 있는 인물"이
  // 플레이어에게 공격·제압당하는 상황. ENCOUNTER_PATTERNS는 전부
  // "나타났다/달려들다" 같은 신규 출현 동사만 잡아서, "쇠사슬로 다리를
  // 얽어매 쓰러뜨린다", "감독관을 향해 주먹을 휘둘렀다"처럼 기존 인물을
  // 대상으로 한 전투 개시 묘사는 어느 패턴에도 걸리지 않고 빠져나갔다.
  // 이 경우 npc_turns_hostile GS도 AI가 빠뜨리면 시스템이 전혀 인식하지
  // 못해 HP바가 끝까지 표시되지 않는 사각지대가 됐다.
  const VICTIM_PATTERNS = [
    /([가-힣]{2,8})(?:을|를)\s*(?:향해\s*)?(?:공격했|찔렀|베었|후려쳤|밀쳤|걷어찼|넘어뜨렸|쓰러뜨렸|제압했|묶었|붙잡았|위협했|협박했)/,
    /([가-힣]{2,8})(?:에게|한테)\s*(?:달려들|덤벼들|달려가)/,
    /([가-힣]{2,8})(?:의)\s*[가-힣]{1,6}(?:을|를)\s*(?:얽어매|걸었|붙잡|움켜쥐|짓눌렀|내리쳤|잡았)/,
    /([가-힣]{2,8})(?:은|는|이|가)\s*(?:[가-힣\s]{0,15})(?:고꾸라졌|처박혔|나동그라졌|쓰러졌|무너졌|꼬꾸라졌|널브러졌)/,
    /([가-힣]{2,8})(?:을|를)\s*향해\s*[가-힣\s]{0,15}(?:휘둘렀|내질렀|날렸|가했|퍼부었|찔렀|베었|쏘았|던졌)/,
  ];

  const SKIP_KEYWORDS = ['그','저','이','적','한','두','그가','그녀','그들','우리','당신','모두','아무','누군가','목소리','시선','손','발','눈','입','몸','그림자','빛','어둠','바람','불','물','땅','공기','알비르'];

  const npcs = loadNPCs();
  const existingNames = new Set(npcs.map(n => n.name));
  const playerName = S.character?.name || '';
  const race = S.character?.race || '';
  const isDemon = race.includes('악마') || race.includes('demon');
  let registered = [];
  // [신규] VICTIM_PATTERNS로 잡힌 "기존에 알던 인물이 전투 대상이 된" 이름들.
  // 신규 등장(ENCOUNTER_PATTERNS)과는 구분해 별도로 추적 — 이미 NPC로
  // 등록돼 있던 경우 그 NPC의 기존 정보(아이콘 등)를 활용해야 더 정확하다.
  let victimRegistered = [];

  for (const pat of ENCOUNTER_PATTERNS) {
    const matches = text.matchAll(new RegExp(pat.source, 'g'));
    for (const m of matches) {
      const raw = (m[1] || '').trim().replace(/^(그|저|이|적|한|두|어느|어떤)\s*/, '').trim();
      if (raw.length < 2 || raw.length > 12) continue;
      if (SKIP_KEYWORDS.includes(raw)) continue;
      if (registered.includes(raw)) continue;

      const surroundCtx = text.slice(Math.max(0, text.indexOf(raw)-30), text.indexOf(raw)+60);
      const isHumanoid = /전사|마법사|도적|궁수|기사|용병|암살|주술|성직|사제|악당|두목|수장|장군|대장|병사|경비|검사|파수꾼|지배자|왕|왕자|공주|귀족|상인|강도|산적|해적|마왕|군주|수하|부하|추종자|인간|엘프|드워프|하프|혼혈|사람|남자|여자|소년|소녀|노인|청년|여인|남성|여성/.test(surroundCtx);
      const type = isHumanoid ? 'humanoid' : 'enemy';

      // ① 동적 NPC DB 저장 (모든 종족, 하드코딩 소스용)
      if (typeof registerDynNpcFromText === 'function') {
        registerDynNpcFromText(raw, type, text.slice(0, 300));
      }

      // ② NPC 목록 등록 (모든 종족)
      if (!existingNames.has(raw)) {
        const newNpc = {
          name: raw,
          role: isHumanoid ? '적대적 인물' : '조우한 적',
          icon: isHumanoid ? '⚔️' : '👾',
          personality: '적대적',
          relationship: 10,
          type: 'enemy',
          active: true,
          autoRegistered: true,
          note: `AI 서사에서 자동 등록된 적. (${new Date().toLocaleString('ko-KR', {month:'numeric',day:'numeric',hour:'numeric',minute:'numeric'})})`
        };
        npcs.push(newNpc);
        existingNames.add(raw);
        registered.push(raw);
      }
    }
  }

  // [신규] 기존 인물 피습 패턴 검사 — 이름이 플레이어 이름과 같으면 제외(자해 오인 방지),
  // 너무 흔한 단어는 SKIP_KEYWORDS로 걸러진다.
  for (const pat of VICTIM_PATTERNS) {
    const matches = text.matchAll(new RegExp(pat.source, 'g'));
    for (const m of matches) {
      const raw = (m[1] || '').trim();
      if (raw.length < 2 || raw.length > 8) continue;
      if (SKIP_KEYWORDS.includes(raw)) continue;
      if (playerName && raw === playerName) continue;
      if (registered.includes(raw) || victimRegistered.includes(raw)) continue;
      victimRegistered.push(raw);
    }
  }

  if (registered.length > 0) {
    saveNPCs(npcs);
    if (S.npcs) S.npcs = npcs;
    registered.forEach((name, i) => {
      const label = isDemon ? `👾 ${name} 등록됨 (타락 시전 가능)` : `👾 ${name} 등록됨`;
      setTimeout(() => toast(label, 2000), i * 600);
    });

    // [CRITICAL BUG FIX] 이 함수는 NPC 목록(loadNPCs/saveNPCs)에만 등록하고
    // 실제 전투 시스템(loadMonsters/saveMonsters — HP바·전투UI가 의존하는
    // 그 시스템)에는 전혀 추가하지 않던 버그. AI가 "적이 나타났다"고 서술해도
    // 시스템상 전투가 시작된 적이 없어 HP 표시가 안 되고 실제 전투로 이어지지
    // 않던 문제의 직접 원인.
    // [수정] ENCOUNTER_PATTERNS(나타났다·달려들다·막아섰다·덮쳐왔다 등) 자체가
    // 이미 적대적 조우를 의미하므로, 추가 교전동사 필터는 불필요하게 좁혔던
    // 중복 조건이었음 — 제거. 패턴에 매칭된 모든 적(잡몹 포함)을 예외 없이
    // 몬스터 시스템에도 등록해 실제 전투가 항상 일어나게 한다.
    try{
      if(typeof loadMonsters === 'function' && typeof saveMonsters === 'function'){
        const monsters = loadMonsters() || [];
        const playerLv = (typeof loadPlayerLevel === 'function') ? (loadPlayerLevel() || 1) : 1;
        // [레벨대 배치] 예전에는 여기서 곧장 플레이어의 "그 순간 레벨"을
        // 썼다 — 그래서 같은 "토끼"가 만나는 사람 레벨에 따라 1레벨도
        // 80레벨도 되는, 장소에 정체성이 전혀 없는 문제가 있었다. 이제는
        // 이 장소의 레벨대(getLocationLevelBand — dangerLevel 또는
        // type 기반, 마을·수도마다 다름)를 우선 쓰고, 플레이어 레벨은
        // 장소 정보가 아예 없을 때만(예: 게임 시작 직후) 보조로 쓴다.
        const _curLocForEnemyLv = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
        const _band = (typeof getLocationLevelBand==='function') ? getLocationLevelBand(_curLocForEnemyLv) : null;
        const lv = _band ? Math.round((_band[0] + _band[1]) / 2) : playerLv;
        // [레벨대 배치] 장소 레벨을 곧장 스탯 공식에 대입하면(예전 방식) 이름의
        // 정체성이 사라져서, 같은 장소의 "토끼"와 "늑대"가 서로 다른 강함이어야
        // 자연스러운데도 완전히 같은 스탯이 되어버렸다. 요즘 다른 게임들처럼
        // "이 구역은 대략 이 레벨대"이면서도 "그 안에서 몹마다 상대적 강함
        // 차이는 유지"되게 하려면 두 신호를 분리해야 한다 — 이름 자체의
        // 상대적 세기는 이미 있는 MONSTER_TIER_TABLE(토끼=극하급, 늑대=그보다
        // 위 등급 식으로 이름마다 고정된 티어)로 정하고, 장소는 그 위에 곱해지는
        // "이 구역 전체의 배율"만 담당하게 한다 — 이 배율 공식은 게임 전역에서
        // 하나로 통일해서 쓴다(getLocationPowerScale, world/052).
        const _locLevelScale = (typeof getLocationPowerScale==='function') ? getLocationPowerScale(_curLocForEnemyLv) : (1 + Math.sqrt(Math.max(0, lv - 1)) * 0.2);
        // [밸런스 수정] 회차 배율만 추가 — 기본값(40+lv*8 등)에 레벨이
        // 이미 들어있어 levelMult까지 곱하면 레벨이 이중 반영됨. 회차
        // 보너스만 추가해 다회차 캐릭터의 강해진 만큼 난이도도 따라온다.
        const _scale = (typeof getEnemyScaleMultiplier==='function') ? getEnemyScaleMultiplier() : {cycleMult:1};
        registered.forEach(name => {
          if(monsters.find(m => m.name === name && m.status === 'alive')) return; // 중복 방지
          const _tier = (typeof getMonsterTierStats==='function') ? getMonsterTierStats(name) : null;
          const _mult = _locLevelScale * _scale.cycleMult;
          const baseHp = _tier ? Math.round(_tier.hp * _mult) : Math.round((40 + lv * 8) * _scale.cycleMult);
          monsters.push({
            id: name + '_' + Date.now(),
            name, icon: '👾',
            hp: baseHp, maxHp: baseHp,
            atk: _tier ? Math.round(_tier.atk * _mult) : Math.round((8 + lv * 1.5) * _scale.cycleMult),
            def: _tier ? Math.round(_tier.def * _mult) : Math.round((3 + lv * 0.5) * _scale.cycleMult),
            status: 'alive', isBoss: false, isNamed: false,
            autoRegistered: true,
            ...(_tier ? { tier: _tier.tier, element: _tier.element, weakElement: _tier.weakElement, resistElement: _tier.resistElement, skills: _tier.skills, trait: _tier.trait } : {}),
          });
        });
        saveMonsters(monsters);
      }
    }catch(e){ console.warn('[autoDetectAndRegisterEnemy] 몬스터 등록 실패:', e); }
  }

  // [신규] 기존 인물 피습 케이스 처리 — npc_turns_hostile GS와 동일한
  // 경로(processNpcTurnsHostileGS)로 보내 NPC 신분 기반 스탯을 부여하고
  // monsters 시스템에 등록 + renderMonsters()까지 일관되게 수행한다.
  // AI가 npc_turns_hostile을 빠뜨려도 텍스트만으로 HP바가 뜨도록 하는
  // 핵심 안전망 — 이게 빠져 있던 게 "전투인데 HP가 안 보이는" 문제의
  // 실제 원인 중 하나였다(특히 "이미 등장했던 인물"을 텍스트만으로
  // 제압하는 묘사에서, npc_add로 정식 등록되지 않은 단역인 경우 더 잘 발생).
  if (victimRegistered.length > 0) {
    try{
      if (typeof processNpcTurnsHostileGS === 'function') {
        processNpcTurnsHostileGS({
          npc_turns_hostile: victimRegistered.map(name => ({ name, reason: '보조 감지(피습 텍스트 패턴)' }))
        });
      }
    }catch(e){ console.warn('[autoDetectAndRegisterEnemy] 피습 패턴 처리 실패:', e); }
  }
}
window.autoDetectAndRegisterEnemy = autoDetectAndRegisterEnemy;

window.autoDetectAndRegisterEnemy = window.autoDetectAndRegisterEnemy;
}

