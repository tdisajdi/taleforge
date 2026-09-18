// ⑩ 🎯 플레이어 목표 노트
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';

export const GOALS_KEY = 'tf-goals';

export function loadGoals(){ try{ return JSON.parse(lsGet(GOALS_KEY)||'[]'); }catch(e){ return []; } }
window.loadGoals = loadGoals;

export function saveGoals(d){ try{ lsSet(GOALS_KEY, JSON.stringify(d)); }catch(e){} }
window.saveGoals = saveGoals;

export function addGoal(text, priority){
  const g = loadGoals();
  g.push({ id:Date.now(), text:text.slice(0,80), priority:priority||'normal', done:false, turn:S.msgCount||0 });
  saveGoals(g);
  renderGoalsPanel();
  toast('🎯 목표가 추가되었습니다',1200);
}
window.addGoal = addGoal;

export function toggleGoal(id){
  const g = loadGoals();
  const found=g.find(x=>x.id===id);
  if(found){ found.done=!found.done; found.doneTurn=S.msgCount||0; }
  saveGoals(g);
  renderGoalsPanel();
}
window.toggleGoal = toggleGoal;

export function removeGoal(id){
  saveGoals(loadGoals().filter(g=>g.id!==id));
  renderGoalsPanel();
}
window.removeGoal = removeGoal;

export function getGoalsBLS(){
  const g = loadGoals().filter(x=>!x.done);
  if(!g.length) return '';
  const high=g.filter(x=>x.priority==='high').map(x=>x.text);
  const normal=g.filter(x=>x.priority==='normal').map(x=>x.text);
  let hint='\n[🎯 플레이어 목표]';
  if(high.length) hint+=` ★ 최우선: ${high.join(' / ')}`;
  if(normal.length) hint+=` 일반: ${normal.join(' / ')}`;
  hint+=' — 서사에서 이 목표를 향한 진전 또는 장애물을 자연스럽게 녹여라.';
  return hint;
}
window.getGoalsBLS = getGoalsBLS;

export function renderGoalsPanel(){
  const body = document.getElementById('pb-goals');
  if(!body) return;
  const goals = loadGoals();
  const active=goals.filter(g=>!g.done);
  const done=goals.filter(g=>g.done);
  const prioColors={high:'#e0a030',normal:'#60a0c0',low:'#6a6a6a'};
  const prioLabels={high:'★ 최우선',normal:'일반',low:'낮음'};
  body.innerHTML=`
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#a0c040;letter-spacing:1px;margin-bottom:4px">🎯 목표 노트 (${active.length}개 진행중)</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:10px">목표를 적으면 AI가 서사에서 자연스럽게 그 방향으로 이끌어줍니다.</div>
      <!-- 새 목표 -->
      <div style="display:flex;gap:5px;margin-bottom:3px">
        <input id="goal-input" placeholder="목표 입력..." style="flex:1;padding:7px 10px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-family:Crimson Text,serif;font-size:12px;outline:none" maxlength="80"/>
        <select id="goal-prio" style="padding:6px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-size:10px;outline:none">
          <option value="high">★최우선</option>
          <option value="normal" selected>일반</option>
          <option value="low">낮음</option>
        </select>
      </div>
      <button class="btn btn-gold" onclick="(function(){const v=document.getElementById('goal-input').value.trim(),p=document.getElementById('goal-prio').value;if(!v)return;addGoal(v,p);document.getElementById('goal-input').value='';})();" style="width:100%;padding:7px;margin-bottom:12px;font-size:10px">🎯 목표 추가</button>
      <!-- 진행중 목표 -->
      ${active.length===0?'<div style="text-align:center;padding:12px;font-size:11px;color:var(--dim)">진행중인 목표가 없습니다.</div>':
        active.map(g=>`
          <div style="padding:9px 11px;background:#080a00;border:1px solid #2a3000;border-left:3px solid ${prioColors[g.priority]||'#60a0c0'};margin-bottom:5px;display:flex;align-items:flex-start;gap:8px">
            <button onclick="toggleGoal(${g.id})" style="background:none;border:1px solid ${prioColors[g.priority]||'#60a0c0'};color:${prioColors[g.priority]||'#60a0c0'};width:16px;height:16px;cursor:pointer;font-size:9px;flex-shrink:0;margin-top:1px;border-radius:2px"> </button>
            <div style="flex:1">
              <div style="font-size:10px;color:var(--text);line-height:1.5">${esc(g.text)}</div>
              <div style="font-size:8px;color:${prioColors[g.priority]||'#60a0c0'};margin-top:2px">${prioLabels[g.priority]||'일반'} · 턴${g.turn}</div>
            </div>
            <button onclick="removeGoal(${g.id})" style="background:none;border:none;color:#4a3a2a;cursor:pointer;font-size:13px;flex-shrink:0">×</button>
          </div>`).join('')}
      <!-- 완료된 목표 -->
      ${done.length>0?`
        <div style="font-family:Cinzel,serif;font-size:9px;color:var(--dim);margin:10px 0 5px;letter-spacing:1px">✓ 완료 (${done.length})</div>
        ${done.slice(-5).reverse().map(g=>`
          <div style="padding:7px 11px;background:#040600;border:1px solid #1a2000;margin-bottom:3px;display:flex;align-items:center;gap:8px;opacity:.6">
            <span style="color:#60c040;font-size:10px">✓</span>
            <span style="font-size:9px;color:var(--dim);text-decoration:line-through">${esc(g.text)}</span>
            <button onclick="removeGoal(${g.id})" style="background:none;border:none;color:#3a2a1a;cursor:pointer;font-size:12px;margin-left:auto">×</button>
          </div>`).join('')}`:''}
    </div>`;
}
window.renderGoalsPanel = renderGoalsPanel;

window.renderGoalsPanel = renderGoalsPanel;

window.addGoal = addGoal;

window.toggleGoal = toggleGoal;

window.removeGoal = removeGoal;

window.getGoalsBLS = getGoalsBLS;
