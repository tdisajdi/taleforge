// 📊 플레이 통계 + 성향 분석 시스템 (v57 완전판)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { STAT_ACHIEVEMENTS } from '../data/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { toggleEruda } from '../ui/296-AI설정-패널-개발-콘솔eruda-토글.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const _PSTATS_KEY    = 'tf-play-stats-v2';

export const _SNAPSHOTS_KEY = 'tf-cycle-snapshots';

export function _loadPStats(){ try{ return JSON.parse(lsGet(_PSTATS_KEY)||'{}'); }catch(e){ return {}; } }
window._loadPStats = _loadPStats;

export function _savePStats(d){ try{ lsSet(_PSTATS_KEY, JSON.stringify(d)); }catch(e){} }
window._savePStats = _savePStats;

export function loadStats(){ return _loadPStats(); }
window.loadStats = loadStats;

export function saveStats(d){ _savePStats(d); }
window.saveStats = saveStats;

window.loadStats = loadStats;

window.saveStats = saveStats;

export function _loadSnapshots(){ try{ return JSON.parse(lsGet(_SNAPSHOTS_KEY)||'[]'); }catch(e){ return []; } }
window._loadSnapshots = _loadSnapshots;

export function _saveSnapshots(d){ try{ lsSet(_SNAPSHOTS_KEY, JSON.stringify(d.slice(-20))); }catch(e){} }
window._saveSnapshots = _saveSnapshots;

export function analyzePlaystyle(){
  const d    = _loadPStats();
  const cur  = S.character || {};
  const curRole = (cur.role||'').toLowerCase();
  const turns  = d.totalTurns||1;

  // 현재 회차 직업 분류
  const isMagic   = /마법|마나|주술|소환|신관|성직|연금/.test(curRole);
  const isFighter = /전사|기사|무도|검|용병|사냥/.test(curRole);
  const isRogue   = /도적|암살|첩자|도둑|닌자/.test(curRole);
  const isCivil   = /농부|상인|대장장이|음유|치유|방랑/.test(curRole);

  // 전투 성향 (현재 회차 기준 70%)
  const battleRate  = (d.battleWins||0) / turns;
  const deathRate   = (d.deathCount||0) / Math.max(d.reincarnationCount||1, 1);
  const critRate    = (d.critSuccessCount||0) / Math.max(turns, 1);
  const comboMax    = d.maxCombo||0;
  const mpRate      = (d.totalMpUsed||0) / Math.max(turns, 1);
  const goldRate    = (d.totalGoldEarned||0) / Math.max(turns, 1);

  // 성향 점수
  const styles = {
    aggressive : battleRate > 0.4 && deathRate < 3 ? 3 : battleRate > 0.2 ? 1 : 0,
    reckless   : deathRate >= 5 ? 3 : deathRate >= 3 ? 1 : 0,
    tactical   : comboMax >= 10 ? 3 : comboMax >= 5 ? 1 : 0,
    diplomatic : battleRate < 0.1 && turns > 20 ? 3 : battleRate < 0.2 ? 1 : 0,
    magical    : mpRate > 0.5 || isMagic ? 3 : mpRate > 0.2 ? 1 : 0,
    merchant   : goldRate > 50 || isCivil ? 2 : goldRate > 20 ? 1 : 0,
  };

  // 상위 2개 성향
  const sorted = Object.entries(styles).sort((a,b)=>b[1]-a[1]);
  const primary   = sorted[0][0];
  const secondary = sorted[1][1] >= 2 ? sorted[1][0] : null;

  // 전생 누적 이력 (30% 영향)
  const snaps = _loadSnapshots();
  const pastRoles = snaps.map(s=>s.role||'').filter(Boolean);
  const hadMagic    = pastRoles.some(r=>/마법|마나|신관|성직/.test(r));
  const hadFighter  = pastRoles.some(r=>/전사|기사|무도|검/.test(r));
  const hadCivil    = pastRoles.some(r=>/농부|상인|음유|치유/.test(r));
  const cycleCount  = snaps.length;

  return {
    primary, secondary,
    isMagic, isFighter, isRogue, isCivil,
    hadMagic, hadFighter, hadCivil,
    cycleCount,
    battleRate, deathRate, critRate, comboMax,
    turns, d
  };
}
window.analyzePlaystyle = analyzePlaystyle;

window.analyzePlaystyle = analyzePlaystyle;

export function getPlaystyleBLS(){
  try{
    const ps = analyzePlaystyle();
    const cur = S.character||{};

    // 라벨 맵
    const styleLabel = {
      aggressive:'공격형', reckless:'무모형', tactical:'전략형',
      diplomatic:'외교형', magical:'마법형', merchant:'상인형'
    };

    // ① 현재 회차 직업이 메인 (70%)
    let currentHint = '';
    if(ps.isCivil){
      currentHint = `현재 캐릭터는 비전투 직업(${cur.role})으로 살아가고 있다. 전투보다 생활·관계·생존이 중심이 되어야 한다. 전투 장면보다 일상·감정·사회적 갈등을 풍부하게 묘사하라.`;
    } else if(ps.isMagic){
      currentHint = `현재 캐릭터는 마법 계열(${cur.role})이다. 마법적 감각과 MP 소모, 주문의 부작용을 자주 묘사하라.`;
    } else if(ps.isFighter){
      currentHint = `현재 캐릭터는 전투 계열(${cur.role})이다. 몸의 감각, 전술, 무기의 무게감을 생생하게 묘사하라.`;
    } else if(ps.isRogue){
      currentHint = `현재 캐릭터는 은신 계열(${cur.role})이다. 그림자, 기습, 정보전의 긴장감을 중심으로 서사를 전개하라.`;
    }

    // ② 플레이 성향 보조 (현재 회차 행동 기반)
    let behaviorHint = '';
    if(ps.primary==='reckless' && ps.deathRate >= 3){
      behaviorHint = `이 플레이어는 무모한 돌진을 즐긴다(사망 ${Math.round(ps.deathRate)}회/회차). 위험한 선택지와 예상치 못한 복병을 자주 배치하되, 죽음 직전 탈출구도 열어두어라.`;
    } else if(ps.primary==='diplomatic' && ps.battleRate < 0.1){
      behaviorHint = `이 플레이어는 대화와 외교를 선호한다. 전투 없이 해결할 수 있는 경로를 항상 열어두고, NPC가 협상에 응하는 빈도를 높여라.`;
    } else if(ps.primary==='tactical' && ps.comboMax >= 5){
      behaviorHint = `이 플레이어는 콤보와 전략을 즐긴다. 전투 묘사 시 적의 패턴과 약점을 암시하고, 연계 공격이 가능한 상황을 자주 만들어라.`;
    } else if(ps.primary==='aggressive'){
      behaviorHint = `이 플레이어는 직접 전투를 즐긴다. 전투 장면을 박진감 있게 묘사하고 강한 적들을 자주 등장시켜라.`;
    } else if(ps.primary==='merchant' || ps.isCivil){
      behaviorHint = `이 플레이어는 경제·생활 경로를 즐긴다. 거래·협상·정보 수집 기회를 자주 제공하고, 골드나 물자로 해결할 수 있는 상황을 만들어라.`;
    }

    // ③ 전생 이력 (30% — 가볍게 복선으로만)
    let pastHint = '';
    if(ps.cycleCount >= 1){
      const pastEcho = [];
      if(ps.hadMagic && !ps.isMagic){
        pastEcho.push('전생에 마법을 다뤘던 흔적이 있어 마법적 현상에 묘하게 익숙한 반응을 보일 수 있다');
      }
      if(ps.hadFighter && ps.isCivil){
        pastEcho.push('전생에 전사였던 기억이 몸에 남아 위기 상황에서 본능적으로 전투 자세를 취하는 순간이 있을 수 있다');
      }
      if(ps.hadCivil && ps.isFighter){
        pastEcho.push('전생에 평범하게 살았던 기억이 있어 무고한 자를 해치는 것에 더 강한 심리적 저항을 느낄 수 있다');
      }
      if(pastEcho.length){
        pastHint = `\n[🌀 전생의 잔향 — 복선으로만 가볍게] ${pastEcho.join(' / ')} — 직접 언급 금지, 행동·반응으로만 암시.`;
      }
    }

    // ④ 사망 패턴 힌트
    let deathHint = '';
    if(ps.deathRate >= 5){
      deathHint = `\n[⚠️ 고난도 플레이어] 이 플레이어는 자주 죽는 것을 감안하고 있다. 생존 불가능한 무리한 상황은 지양하되, 긴장감은 최대로 유지하라.`;
    }

    let result = '';
    if(currentHint)  result += `\n[🎭 현재 직업 서사 방향] ${currentHint}`;
    if(behaviorHint) result += `\n[🎮 플레이 성향] ${behaviorHint}`;
    if(pastHint)     result += pastHint;
    if(deathHint)    result += deathHint;
    return result;
  }catch(e){ return ''; }
}
window.getPlaystyleBLS = getPlaystyleBLS;

window.getPlaystyleBLS = getPlaystyleBLS;

export function saveCurrentCycleSnapshot(){
  const d    = _loadPStats();
  const char = S.character||{};
  const snap = {
    cycle    : (loadCycleCount()||0),
    role     : char.role||'',
    race     : char.race||'',
    name     : char.name||'',
    turns    : d.totalTurns||0,
    battleWins: d.battleWins||0,
    deathCount: d.deathCount||0,
    totalGold : d.totalGoldEarned||0,
    totalExp  : d.totalExp||0,
    maxCombo  : d.maxCombo||0,
    endingCount:d.endingCount||0,
    playMs    : d.totalPlayMs||0,
    savedAt   : new Date().toISOString(),
  };
  const snaps = _loadSnapshots();
  snaps.push(snap);
  _saveSnapshots(snaps);
  // 회차 종료 후 현재 통계 중 누적분 외 회차별 수치 리셋
  const keep = {
    reincarnationCount: d.reincarnationCount||0,
    totalApiCalls:      d.totalApiCalls||0,
    endingCount:        d.endingCount||0,  // 누적 유지
  };
  _savePStats(keep);
}
window.saveCurrentCycleSnapshot = saveCurrentCycleSnapshot;

window.saveCurrentCycleSnapshot = saveCurrentCycleSnapshot;

setTimeout(function hookReincForSnapshot(){
  if(window._snapshotReincHooked) return;
  window._snapshotReincHooked = true;
  const orig = window.doReincarnate;
  if(typeof orig!=='function') return;
  window.doReincarnate = function(...args){
    saveCurrentCycleSnapshot();
    return orig.apply(this, args);
  };
}, 0);

export function checkStatAchievements(){
  const d    = _loadPStats();
  const done = JSON.parse(lsGet('tf-stat-ach')||'{}');
  let newUnlocked = false;
  for(const ach of STAT_ACHIEVEMENTS){
    if(!done[ach.key] && ach.cond(d)){
      done[ach.key] = true;
      lsSet('tf-stat-ach', JSON.stringify(done));
      if(typeof unlockAchievement==='function') unlockAchievement(ach.key);
      // addTitle에 올바른 객체 형태로 전달
      if(typeof window.addTitle==='function') window.addTitle(ach.titleObj);
      toast(`🏆 숨겨진 업적: ${ach.label}\n${ach.reward}`, 4000);
      newUnlocked = true;
    }
  }
  return newUnlocked;
}
window.checkStatAchievements = checkStatAchievements;

window.checkStatAchievements = checkStatAchievements;

(function wrapBLSForPlaystyle(){
  if(window._playstyleBLSWrapped) return;
  window._playstyleBLSWrapped = true;
  const checkAndWrap = ()=>{
    if(typeof window.buildLightSystem!=='function'){ setTimeout(checkAndWrap,500); return; }
    const orig = window.buildLightSystem;
    window.buildLightSystem = function(...args){
      let r = orig.apply(this, args);
      try{ const h = getPlaystyleBLS(); if(h) r += h; }catch(e){}
      return r;
    };
  };
  checkAndWrap();
})();

export function renderPlayStatsPanel(){
  const body = document.getElementById('pb-playstats');
  if(!body) return;
  const d     = _loadPStats();
  const snaps = _loadSnapshots();
  const done  = JSON.parse(lsGet('tf-stat-ach')||'{}');
  const ps    = analyzePlaystyle();

  // 플레이 시간 포맷
  const fmtTime = ms => {
    if(!ms) return '0분';
    const h = Math.floor(ms/3600000);
    const m = Math.floor((ms%3600000)/60000);
    return h>0 ? `${h}시간 ${m}분` : `${m}분`;
  };
  const fmtNum = n => (n||0).toLocaleString();

  // 성향 라벨
  const styleInfo = {
    aggressive:{label:'공격형',icon:'⚔️',svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></svg>',color:'#e05050'},
    reckless:  {label:'무모형',icon:'💀',svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>',color:'#c04040'},
    tactical:  {label:'전략형',icon:'🎯',svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>',color:'#4090d0'},
    diplomatic:{label:'외교형',icon:'🕊️',svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20 C12 20 4 15.5 4 9.5 C4 6.5 6.2 4.5 8.8 4.5 C10.2 4.5 11.3 5.2 12 6.3 C12.7 5.2 13.8 4.5 15.2 4.5 C17.8 4.5 20 6.5 20 9.5 C20 15.5 12 20 12 20 Z" stroke-linejoin="round"/></svg>',color:'#60c080'},
    magical:   {label:'마법형',icon:'✨',svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L13.5 8.5 L20 7 L15 12 L18 18.5 L12 15 L6 18.5 L9 12 L4 7 L10.5 8.5 Z" stroke-linejoin="round"/></svg>',color:'#9060e0'},
    merchant:  {label:'상인형',icon:'💰',svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" stroke-width="1.4"/><path d="M12 7.5 L12 16.5 M9.5 9.3 C9.5 8.2 10.5 7.5 12 7.5 C13.5 7.5 14.5 8.3 14.5 9.4 C14.5 10.6 13.5 11 12 11.3 C10.5 11.6 9.5 12.2 9.5 13.4 C9.5 14.5 10.5 15.3 12 15.3 C13.5 15.3 14.5 14.6 14.5 13.5" stroke-width="1.2"/></svg>',color:'#c0a030'},
  };
  const psi = styleInfo[ps.primary]||{label:'?',icon:'❓',color:'#888'};
  const ssi = ps.secondary ? (styleInfo[ps.secondary]||null) : null;

  // 현재 회차 통계
  const curStats = [
    {icon:'🔄',label:'이번 회차 턴',    val:fmtNum(d.totalTurns)},
    {icon:'⚔️',label:'전투 승리',        val:fmtNum(d.battleWins)},
    {icon:'💀',label:'사망 횟수',        val:fmtNum(d.deathCount)},
    {icon:'⭐',label:'크리티컬 성공',    val:fmtNum(d.critSuccessCount)},
    {icon:'💔',label:'크리티컬 실패',    val:fmtNum(d.critFailCount)},
    {icon:'💰',label:'획득 골드',        val:fmtNum(d.totalGoldEarned)+'G'},
    {icon:'✨',label:'획득 경험치',      val:fmtNum(d.totalExp)+' EXP'},
    {icon:'💠',label:'MP 소모',          val:fmtNum(d.totalMpUsed)},
    {icon:'🔥',label:'최대 콤보',        val:fmtNum(d.maxCombo)},
    {icon:'⏱️',label:'플레이 시간',      val:fmtTime(d.totalPlayMs)},
  ];

  // 전체 누적 통계
  const allTurns   = snaps.reduce((a,s)=>a+(s.turns||0),0)+(d.totalTurns||0);
  const allBattles = snaps.reduce((a,s)=>a+(s.battleWins||0),0)+(d.battleWins||0);
  const allGold    = snaps.reduce((a,s)=>a+(s.totalGold||0),0)+(d.totalGoldEarned||0);
  const allMs      = snaps.reduce((a,s)=>a+(s.playMs||0),0)+(d.totalPlayMs||0);

  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);letter-spacing:1px;margin-bottom:10px">📊 플레이 통계</div>

      <!-- 성향 카드 -->
      <div style="padding:11px 14px;background:linear-gradient(135deg,#0a0800,#161000);border:1px solid ${psi.color}66;margin-bottom:12px">
        <div style="font-size:9px;color:var(--dim);font-family:Cinzel,serif;letter-spacing:1px;margin-bottom:5px">🎮 플레이 성향 분석</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="color:${psi.color};display:inline-flex;flex-shrink:0;transform:scale(1.09)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(psi,{size:16}):(psi.svgIcon||psi.icon)}</span>
          <div>
            <div style="font-family:Cinzel,serif;font-size:13px;color:${psi.color}">${psi.label}</div>
            ${ssi?`<div style="font-size:9px;color:${ssi.color};margin-top:2px;display:flex;align-items:center;gap:3px">부 성향: <span style="display:inline-flex;width:10px;height:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(ssi,{size:10}):((ssi.svgIcon||'').replace('width="20" height="20"','width="10" height="10"')||ssi.icon)}</span> ${ssi.label}</div>`:''}
          </div>
          <div style="margin-left:auto;text-align:right">
            <div style="font-size:9px;color:var(--dim)">현재 직업</div>
            <div style="font-size:10px;color:var(--gold)">${S.character?.role||'?'}</div>
          </div>
        </div>
        <div style="font-size:9px;color:var(--dim);line-height:1.5;margin-top:4px;padding-top:6px;border-top:1px solid ${psi.color}33">
          ${ps.isCivil?'🌾 비전투 경로 — AI가 일상·관계 중심으로 서사를 전개합니다':
            ps.isMagic?'✨ 마법 경로 — AI가 마법적 감각을 중심으로 묘사합니다':
            ps.isFighter?'⚔️ 전투 경로 — AI가 전투 긴장감을 극대화합니다':
            ps.isRogue?'🗡️ 은신 경로 — AI가 정보전과 기습을 중심으로 전개합니다':
            '❓ 성향 미확정 — 더 플레이하면 분석됩니다'}
          ${ps.hadMagic&&!ps.isMagic?'<br>🌀 전생의 마법 흔적이 서사에 복선으로 녹아듭니다':''}
          ${ps.hadFighter&&ps.isCivil?'<br>🌀 전생의 전투 기억이 위기 순간에 본능으로 나타납니다':''}
        </div>
      </div>

      <!-- 이번 회차 통계 -->
      <div style="font-family:Cinzel,serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">이번 회차</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:12px">
        ${curStats.map(r=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;background:#0a0800;border:1px solid var(--border);border-radius:2px">
            <div style="display:flex;align-items:center;gap:5px">
              <span style="font-size:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:12}):(r.icon)}</span>
              <span style="font-size:9px;color:var(--dim)">${r.label}</span>
            </div>
            <span style="font-family:Cinzel,serif;font-size:10px;color:var(--gold)">${r.val||'0'}</span>
          </div>`).join('')}
      </div>

      <!-- 전체 누적 -->
      <div style="padding:9px 12px;background:#06080a;border:1px solid #1a2a3a;margin-bottom:12px">
        <div style="font-family:Cinzel,serif;font-size:9px;color:#4080a0;letter-spacing:1px;margin-bottom:6px">🌐 전체 누적 (${snaps.length+1}회차)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
          ${[
            {icon:'🔄',label:'총 턴',    val:fmtNum(allTurns)},
            {icon:'⚔️',label:'총 전투승', val:fmtNum(allBattles)},
            {icon:'💰',label:'총 골드',   val:fmtNum(allGold)+'G'},
            {icon:'⏱️',label:'총 시간',   val:fmtTime(allMs)},
            {icon:'🔁',label:'환생 횟수', val:fmtNum(d.reincarnationCount)},
            {icon:'🌌',label:'달성 엔딩', val:fmtNum(d.endingCount)},
          ].map(r=>`
            <div style="display:flex;justify-content:space-between;padding:4px 6px;background:#0a0c10;border:1px solid #1a2a3a;border-radius:2px">
              <span style="font-size:9px;color:var(--dim)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:9}):(r.icon)} ${r.label}</span>
              <span style="font-size:9px;color:#4080a0;font-family:Cinzel,serif">${r.val}</span>
            </div>`).join('')}
        </div>
      </div>

      <!-- 회차별 기록 -->
      ${snaps.length>0?`
        <div style="font-family:Cinzel,serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">📜 회차별 기록</div>
        <div style="max-height:200px;overflow-y:auto;margin-bottom:12px">
          ${snaps.slice().reverse().map((s,i)=>{
            const ci = snaps.length-i;
            const better = i>0 && s.turns > (snaps[snaps.length-i-1]?.turns||0);
            return `<div style="padding:7px 10px;background:#0a0800;border:1px solid var(--border);margin-bottom:3px;display:flex;align-items:center;gap:8px">
              <div style="font-family:Cinzel,serif;font-size:9px;color:var(--dim);min-width:30px">${ci}회차</div>
              <div style="flex:1">
                <div style="font-size:9px;color:var(--gold)">${s.race||''} ${s.role||''} — ${s.name||'?'}</div>
                <div style="font-size:8px;color:var(--dim)">턴${fmtNum(s.turns)} · 전투${fmtNum(s.battleWins)}승 · ${fmtNum(s.totalGold)}G</div>
              </div>
              ${better?'<span style="font-size:8px;color:#60c060">↑</span>':''}
            </div>`;
          }).join('')}
        </div>`:''}

      <!-- 숨겨진 업적 -->
      <div style="font-family:Cinzel,serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">🏆 숨겨진 업적 (${Object.keys(done).length}/${STAT_ACHIEVEMENTS.length})</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">
        ${STAT_ACHIEVEMENTS.map(ach=>`
          <div style="padding:5px 9px;background:${done[ach.key]?'#1a1200':'#0a0800'};border:1px solid ${done[ach.key]?'#806020':'var(--border)'};border-radius:2px">
            <div style="font-size:9px;color:${done[ach.key]?'var(--gold)':'var(--dim)'}">${done[ach.key]?ach.label:'???'}</div>
            ${done[ach.key]?`<div style="font-size:8px;color:var(--dim);margin-top:1px">${ach.reward}</div>`:''}
          </div>`).join('')}
      </div>

      <div style="text-align:center">
        <button class="btn btn-dark" onclick="if(confirm('이번 회차 통계를 초기화하시겠습니까?\\n(전체 누적·회차 기록·업적은 유지됩니다)')){const keep={reincarnationCount:(_loadPStats().reincarnationCount||0),totalApiCalls:(_loadPStats().totalApiCalls||0),endingCount:(_loadPStats().endingCount||0)};_savePStats(keep);renderPlayStatsPanel();toast('이번 회차 통계 초기화됨',1500);}" style="font-size:9px">🗑️ 이번 회차 초기화</button>
      </div>
    </div>`;
}
window.renderPlayStatsPanel = renderPlayStatsPanel;

window.renderPlayStatsPanel = renderPlayStatsPanel;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_269(){
function updateStats(key, value, mode){
  const d = _loadPStats();
  const cur = d[key]||0;
  if(mode==='max')      d[key] = Math.max(cur, value);
  else if(mode==='set') d[key] = value;
  else                  d[key] = cur + value;
  _savePStats(d);
}
window.updateStats = updateStats;

window.updateStats = window.updateStats;

// [버그 수정] _origCallAI와 완전히 같은 패턴 — 이 파일 안에서도
// _origUpdateStats가 이 배포 함수(__tfDeferred_269) 밖, 모듈 최상위
// (Pass 1)에서 캡처되고 있었다. 그 시점엔 바로 위 진짜 updateStats
// 정의(407줄)조차 아직 실행 전이라 항상 undefined를 캡처했고, 그 결과
// 스탯이 갱신될 때마다("_origUpdateStats is not a function")
// 플레이 통계 시스템 전체가 크래시했다. 이 배포 함수 안, 실제 사용
// 직전에 새로 캡처하면 이 시점엔 이미 진짜 updateStats가 설정되어
// 있어 정상 동작한다.
const _origUpdateStats = window.updateStats;

window.updateStats = function(key, value, mode){
  _origUpdateStats(key, value, mode);
  // 주요 마일스톤 키일 때만 체크 (매 턴 체크 방지)
  if(['deathCount','battleWins','critSuccessCount','maxCombo','totalGoldEarned','reincarnationCount','totalTurns','endingCount'].includes(key)){
    checkStatAchievements();
  }
};

window.toggleEruda = toggleEruda;
}

