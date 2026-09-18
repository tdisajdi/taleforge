// ★ UI-1: 타임라인 + 전투로그 데이터 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { TL_ICONS } from '../data/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { loadDiary } from '../misc/076-파트2-D-일기기록-시스템.js';
import { lsGet, lsSet } from '../utils.js';

export const TIMELINE_KEY    = 'tf-timeline-v2';

export const BATTLE_LOG_KEY  = 'tf-battle-log-v2';

export function loadTimeline(){ try{ return JSON.parse(lsGet(TIMELINE_KEY)||'[]'); }catch(e){ return []; } }
window.loadTimeline = loadTimeline;

export function saveTimeline(d){ lsSet(TIMELINE_KEY, JSON.stringify((d||[]).slice(-200))); }
window.saveTimeline = saveTimeline;

export function loadBattleLog(){ try{ return JSON.parse(lsGet(BATTLE_LOG_KEY)||'[]'); }catch(e){ return []; } }
window.loadBattleLog = loadBattleLog;

export function saveBattleLog(d){ lsSet(BATTLE_LOG_KEY, JSON.stringify((d||[]).slice(-100))); }
window.saveBattleLog = saveBattleLog;

export function addTimelineEvent(type, label, data){
  try{
    const tl = loadTimeline();
    tl.push({
      type, label, data:data||{},
      turn: S.msgCount||0,
      icon: (data&&data.icon) || TL_ICONS[type] || TL_ICONS.default,
      ts:   Date.now(),
    });
    saveTimeline(tl);
  }catch(e){}
}
window.addTimelineEvent = addTimelineEvent;

window.addTimelineEvent = addTimelineEvent;

export function _addTimelineOnDeath(){
  try{ addTimelineEvent('death', '캐릭터가 사망했다', {}); }catch(e){}
}
window._addTimelineOnDeath = _addTimelineOnDeath;

window._addTimelineOnDeath = _addTimelineOnDeath;

export function _addTimelineOnJob(jobName, jobIcon){
  try{ addTimelineEvent('job', `${jobIcon||''} ${jobName} 직업 획득`, {jobName, jobIcon}); }catch(e){}
}
window._addTimelineOnJob = _addTimelineOnJob;

window._addTimelineOnJob = _addTimelineOnJob;

export function _addTimelineOnLevelUp(prevLv, newLv){
  try{ addTimelineEvent('levelup', `Lv.${prevLv} → Lv.${newLv}`, {prevLv, newLv}); }catch(e){}
}
window._addTimelineOnLevelUp = _addTimelineOnLevelUp;

window._addTimelineOnLevelUp = _addTimelineOnLevelUp;

export function addBattleLogEntry(entry){
  try{
    const log = loadBattleLog();
    log.push({
      turn:       S.msgCount||0,
      action:     entry.action||'',
      result:     entry.result||'',
      roll:       entry.roll||null,
      hpChange:   entry.hpChange||0,
      goldChange: entry.goldChange||0,
      ts:         Date.now(),
    });
    saveBattleLog(log);
  }catch(e){}
}
window.addBattleLogEntry = addBattleLogEntry;

window.addBattleLogEntry = addBattleLogEntry;

export function renderTimelinePanel(){
  const body = document.getElementById('pb-timeline');
  if(!body) return;

  // 타임라인 + 다이어리 합쳐서 표시
  const tl    = loadTimeline();
  const diary = typeof loadDiary==='function' ? loadDiary() : [];

  // 다이어리 항목을 타임라인 형식으로 변환
  // [20차 감사 FIX] saveDiaryEntry()는 metadata 인자로 무엇이 오든 항상
  // 실제 턴 번호를 d.turn(=S.msgCount)에 정확히 저장한다. 그런데 이 코드는
  // "typeof d.metadata==='object'"일 때 d.turn 대신 d.metadata 객체 자체를
  // turn 필드에 넣고 있었다 — misc/076 내부 호출들의 metadata는 항상 객체
  // ({action:...} 등, 기본값도 {})라서 이 분기가 사실상 항상 참이 되어,
  // 대부분의 다이어리 항목이 숫자가 아니라 객체를 turn으로 갖게 됐다.
  // 그 결과 아래 정렬(turn 뺄셈)과 10턴 그룹화(turn/10)가 NaN이 되어
  // 다이어리 기반 연대기 항목들이 순서 없이 뒤섞이고 "턴 NaN~NaN"
  // 그룹에 몰리던 문제였다. metadata의 타입과 무관하게 항상 정확한
  // d.turn을 쓰도록 교정한다.
  const diaryTL = diary.map(d=>({
    type:  d.type||'event',
    label: (d.content||'').slice(0,60),
    icon:  TL_ICONS[d.type]||TL_ICONS.default,
    turn:  d.turn||0,
    ts:    d.savedAt ? new Date(d.savedAt).getTime() : 0,
  }));

  const all = [...tl, ...diaryTL]
    .sort((a,b)=> (b.turn||0)-(a.turn||0) || (b.ts||0)-(a.ts||0))
    .slice(0, 100);

  if(!all.length){
    body.innerHTML = `<div style="padding:30px;text-align:center;color:var(--dim);font-size:11px">
      아직 기록이 없습니다.<br>플레이하면 자동으로 쌓입니다.</div>`;
    return;
  }

  // 턴 기준으로 그룹화 (10턴 단위)
  const groups = {};
  all.forEach(e=>{
    const grp = Math.floor((e.turn||0)/10)*10;
    if(!groups[grp]) groups[grp] = [];
    groups[grp].push(e);
  });

  const TYPE_COLOR = {
    levelup:'#a0d060', quest:'#f1c40f', npc:'#60a0e0', battle:'#e05050',
    ending:'#c8a96e', evolution:'#d060ff', job:'#60c0c0', skill:'#80c0ff',
    title:'#c8a96e', death:'#888', item:'#80c060', gold:'#c8a96e',
    summon:'#80d0a0', prophecy:'#a060ff', event:'#c8a96e', default:'#6a8a6a',
  };

  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:12px">
        📜 연대기 <span style="font-size:9px;color:var(--dim);font-family:inherit">(${all.length}개 기록)</span>
      </div>
      ${Object.keys(groups).sort((a,b)=>+b-+a).map(grp=>{
        const items = groups[grp];
        return `
          <div style="margin-bottom:14px">
            <div style="font-size:9px;color:#6a5a3a;font-family:Cinzel,serif;letter-spacing:1px;margin-bottom:6px;display:flex;align-items:center;gap:6px">
              <div style="flex:1;height:1px;background:#2a2000"></div>
              <span>턴 ${grp}~${+grp+9}</span>
              <div style="flex:1;height:1px;background:#2a2000"></div>
            </div>
            ${items.map(e=>{
              const color = TYPE_COLOR[e.type]||TYPE_COLOR.default;
              return `<div style="display:flex;gap:8px;align-items:flex-start;padding:5px 0;border-bottom:1px solid #0f0c00">
                <span style="font-size:14px;flex-shrink:0;margin-top:1px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(e,{size:14}):(e.icon)}</span>
                <div style="flex:1;min-width:0">
                  <div style="font-size:10px;color:${color};line-height:1.4">${e.label||''}</div>
                  <div style="font-size:8px;color:#3a3020;margin-top:1px">턴 ${e.turn||0}</div>
                </div>
              </div>`;
            }).join('')}
          </div>`;
      }).join('')}
    </div>`;
}
window.renderTimelinePanel = renderTimelinePanel;

window.renderTimelinePanel = renderTimelinePanel;

export function renderBattleLogPanel(){
  const body = document.getElementById('pb-battlelog');
  if(!body) return;
  const log = loadBattleLog().slice().reverse(); // 최신 순

  if(!log.length){
    body.innerHTML = `<div style="padding:30px;text-align:center;color:var(--dim);font-size:11px">
      아직 전투 기록이 없습니다.</div>`;
    return;
  }

  // 요약 통계
  const wins   = log.filter(l=>l.result==='success'||l.result==='crit').length;
  const crits  = log.filter(l=>l.result==='crit').length;
  const fails  = log.filter(l=>l.result==='fail'||l.result==='critFail').length;
  const totalHp = log.reduce((s,l)=>s+(l.hpChange||0),0);
  const totalGold = log.reduce((s,l)=>s+(l.goldChange||0),0);

  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:10px">⚔️ 전투 로그</div>

      <!-- 요약 -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:12px">
        ${[
          ['🌟','대성공',crits],
          ['✅','성공',wins],
          ['❌','실패',fails],
          ['❤️','HP 변화',totalHp>0?'+'+totalHp:totalHp],
          ['💰','골드 변화',totalGold>0?'+'+totalGold:totalGold],
          ['📊','총 기록',log.length],
        ].map(([icon,label,val])=>`
          <div style="padding:6px;background:#0a0600;border:1px solid #1a1005;text-align:center">
            <div style="font-size:12px">${icon}</div>
            <div style="font-size:10px;color:#c8a96e">${val}</div>
            <div style="font-size:7px;color:var(--dim)">${label}</div>
          </div>`).join('')}
      </div>

      <!-- 로그 목록 -->
      ${log.slice(0,50).map(l=>{
        const res = l.result||'';
        const resColor = res==='crit'?'#c8a96e':res==='success'?'#60c060':res==='critFail'?'#e05050':'#888';
        const resIcon  = res==='crit'?'🌟':res==='success'?'✅':res==='critFail'?'💀':res==='fail'?'❌':'—';
        const hpStr    = l.hpChange ? (l.hpChange>0?`<span style="color:#60c060">HP +${l.hpChange}</span>`:`<span style="color:#e05050">HP ${l.hpChange}</span>`) : '';
        const goldStr  = l.goldChange ? (l.goldChange>0?`<span style="color:#c8a96e">G +${l.goldChange}</span>`:`<span style="color:#e08050">G ${l.goldChange}</span>`) : '';
        return `<div style="padding:7px 8px;background:#080600;border:1px solid #1a1200;margin-bottom:3px;display:flex;align-items:center;gap:8px">
          <span style="font-size:14px">${resIcon}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:10px;color:${resColor};line-height:1.4">${l.action||'알 수 없는 행동'}</div>
            <div style="display:flex;gap:6px;margin-top:2px;font-size:8px">${hpStr}${goldStr}</div>
          </div>
          <div style="font-size:8px;color:var(--dim);flex-shrink:0">턴${l.turn}</div>
        </div>`;
      }).join('')}
    </div>`;
}
window.renderBattleLogPanel = renderBattleLogPanel;

window.renderBattleLogPanel = renderBattleLogPanel;
