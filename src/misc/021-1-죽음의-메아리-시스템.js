// 💀 1. 죽음의 메아리 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { ECHO_ABILITY_POOL, ECHO_MILESTONES } from '../data/021-1-죽음의-메아리-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveSkills } from '../job/002-스킬-시스템.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { gainDarklingVoid } from '../progression/020-101130번-환생-누적-시스템.js';
import { lsDel, lsGet, lsSet, toast } from '../utils.js';

export const DEATH_ECHO_KEY  = 'tf-darkling-echo';

export const loadDeathEcho   = () => { try { const r = lsGet(DEATH_ECHO_KEY); return r ? JSON.parse(r) : { stacks: 0, absorbed: [], history: [], totalKills: 0, activeEchoes: [] }; } catch(e) { return { stacks: 0, absorbed: [], history: [], totalKills: 0, activeEchoes: [] }; } };

export const saveDeathEcho   = (d) => { try { lsSet(DEATH_ECHO_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearDeathEcho  = () => lsDel(DEATH_ECHO_KEY);

export function gainDeathEcho(enemyName, enemyType) {
  const race = S.character?.race || '';
  if (!race.includes('다크링') && !race.includes('darkling')) return;
  const echo = loadDeathEcho();
  echo.stacks = (echo.stacks || 0) + 1;
  echo.totalKills = (echo.totalKills || 0) + 1;
  // 흡수 능력 랜덤 결정
  const absorbed = ECHO_ABILITY_POOL[Math.floor(Math.random() * ECHO_ABILITY_POOL.length)];
  const absorbEntry = { id: absorbed.id, name: absorbed.name, icon: absorbed.icon, stat: absorbed.stat, gain: absorbed.gain, from: enemyName || '알 수 없는 존재', at: new Date().toISOString().slice(0, 16) };
  echo.absorbed = echo.absorbed || [];
  echo.absorbed.push(absorbEntry);
  
  // 스탯 반영
  S.stats[absorbed.stat] = Math.min(999, (S.stats[absorbed.stat] || 50) + absorbed.gain);
  echo.history = echo.history || [];
  echo.history.push({ name: enemyName || '적', type: enemyType || '일반', absorbed: absorbed.name, stack: echo.stacks, at: absorbEntry.at });
  
  // 마일스톤 체크
  const prev = echo.stacks - 1;
  for (const ms of ECHO_MILESTONES) {
    if (echo.stacks >= ms.stacks && prev < ms.stacks) {
      // 보너스 스탯 적용
      Object.entries(ms.bonus).forEach(([k, v]) => { S.stats[k] = Math.min(999, (S.stats[k] || 50) + v); });
      // 스킬 해금
      if (!S.unlockedSkills[ms.skillId]) {
        S.unlockedSkills[ms.skillId] = true;
        saveSkills(S.unlockedSkills);
        setTimeout(() => toast(`💀 메아리 해금: ${ms.skillIcon} ${ms.skillName} (${echo.stacks}스택 돌파!)`, 4000), 800);
      }
      setTimeout(() => toastHTML(`👻 메아리 마일스톤! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(ms,{size:14}):(ms.icon)} "${esc(ms.name)}" 달성 (${esc(echo.stacks)}스택)`, 3500), 300);
    }
  }
  if (typeof saveStats === 'function') saveStats(S.stats);
  saveDeathEcho(echo);
  window.updateHeader();
  // 공허도 소량 상승 (죽음에 접촉)
  gainDarklingVoid('void_touch', 3);
  toastHTML(`💀 메아리 흡수: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(absorbed,{size:14}):(absorbed.icon)} ${esc(absorbed.name)} (스택 ${esc(echo.stacks)}) — ${esc(absorbed.stat.toUpperCase())} +${esc(absorbed.gain)}`, 3000);
  return echo;
}
window.gainDeathEcho = gainDeathEcho;

export function getDeathEchoStatus() {
  const race = S.character?.race || '';
  if (!race.includes('다크링') && !race.includes('darkling')) return null;
  return loadDeathEcho();
}
window.getDeathEchoStatus = getDeathEchoStatus;

export function detectDeathEchoFromText(text) {
  if (!text) return;
  const race = S.character?.race || '';
  if (!race.includes('다크링') && !race.includes('darkling')) return;
  const killPatterns = /쓰러뜨|처치|죽였|숨을 거두|목숨을 빼앗|생명이 꺼|절명|쓰러졌다|죽음을 맞|최후를 맞/;
  if (killPatterns.test(text) && Math.random() < 0.6) {
    // 적 이름 추출 시도
    const match = text.match(/([가-힣a-zA-Z]{2,8})(?:이|가|은|는|을|를)?\s*(?:쓰러뜨|처치|죽였|숨을 거두|절명)/);
    const enemyName = match ? match[1] : null;
    gainDeathEcho(enemyName, null);
  }
}
window.detectDeathEchoFromText = detectDeathEchoFromText;

export function renderDeathEchoPanel(containerId) {
  const body = document.getElementById(containerId);
  if (!body) return;
  const echo = getDeathEchoStatus();
  if (!echo) { body.innerHTML = '<div style="text-align:center;padding:20px;color:#304060;font-size:10px">다크링 전용 시스템</div>'; return; }
  const color = '#6090e0';
  const nextMs = ECHO_MILESTONES.find(ms => ms.stacks > echo.stacks);
  const currentMs = [...ECHO_MILESTONES].reverse().find(ms => echo.stacks >= ms.stacks);
  body.innerHTML = `
    <div style="padding:12px;background:linear-gradient(135deg,#000510,#000820);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:26px">💀</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:${color}">죽음의 메아리</div>
          <div style="font-size:9px;color:#304060">총 ${echo.totalKills}체 처치 · ${echo.stacks}스택 누적</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:20px;color:${color}">${echo.stacks}<span style="font-size:9px;color:#304060"> stack</span></div>
        </div>
      </div>
      ${nextMs ? `
      <div style="height:5px;background:#000510;border-radius:3px;overflow:hidden;margin-bottom:3px">
        <div style="width:${Math.min(100, Math.round(((echo.stacks - (currentMs?.stacks||0)) / (nextMs.stacks - (currentMs?.stacks||0))) * 100))}%;height:100%;background:linear-gradient(90deg,#204080,${color});border-radius:3px;transition:width .4s"></div>
      </div>
      <div style="font-size:8px;color:#203050">다음 마일스톤: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(nextMs,{size:8}):(nextMs.icon)} ${nextMs.name} (${nextMs.stacks}스택)</div>
      ` : `<div style="font-size:9px;color:${color};text-align:center">💀 모든 메아리 마일스톤 달성</div>`}
    </div>
    <!-- 마일스톤 -->
    <div style="padding:10px 12px;border-bottom:1px solid #0a1030">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 마일스톤 & 해금 스킬 ──</div>
      ${ECHO_MILESTONES.map(ms => {
        const done = echo.stacks >= ms.stacks;
        return `<div style="padding:7px 9px;background:${done?'#000c18':'#000508'};border:1px solid ${done?color+'55':'#0a1020'};margin-bottom:4px;border-radius:2px;opacity:${done?1:0.45}">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(ms,{size:14}):(ms.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:10px;color:${done?color:'#304060'}">${ms.name}</span>
            <span style="font-size:8px;color:#203050;margin-left:2px">(${ms.stacks}스택)</span>
            ${done ? '<span style="font-size:10px;margin-left:auto;color:#40d060">✓</span>' : ''}
          </div>
          <div style="font-size:9px;color:#304060">${ms.skillIcon} <b style="color:${done?color:'#304060'}">${ms.skillName}</b> — ${ms.skillDesc}</div>
        </div>`;
      }).join('')}
    </div>
    <!-- 최근 흡수 기록 -->
    ${echo.absorbed && echo.absorbed.length ? `
    <div style="padding:10px 12px;border-bottom:1px solid #0a1030">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 최근 흡수 (최대 10개) ──</div>
      ${[...echo.absorbed].reverse().slice(0, 10).map(a => `
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #00050f;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(a,{size:16}):(a.icon)}</span>
          <span style="flex:1;color:#304060">${a.name}</span>
          <span style="color:#5080c0;font-size:8px">from ${a.from || '?'}</span>
          <span style="color:#40a0d0;font-family:'Cinzel',serif">+${a.gain}</span>
        </div>`).join('')}
    </div>` : ''}
    <!-- [F2 FIX] gainDeathEcho가 detectDeathEchoFromText(AI 서사 감지)에서만
         호출되고 수동 트리거가 전혀 없었다 — finishLocalCombat(로컬 전투 승리
         처리, misc/328)에도 다크링 승리 시 자동으로 걸리게 연결했지만, 그와는
         별개로 이 패널에도 같은 함수를 직접 부르는 버튼을 둔다(이 파일/시스템의
         기존 관례상 보조 경로). -->
    <div style="padding:8px 12px">
      <button onclick="gainDeathEcho('직접 처치', null);renderDeathEchoPanel('${containerId}')"
        style="width:100%;padding:7px;background:#000a18;border:1px solid ${color}66;color:${color};font-size:9px;cursor:pointer;font-family:'Crimson Text',serif;border-radius:2px">
        💀 처치 기록 — 메아리 흡수
      </button>
    </div>
  `;
}
window.renderDeathEchoPanel = renderDeathEchoPanel;
