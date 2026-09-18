// ⑨ 🤝 동맹·배신 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadNPCs } from './001-block0-preamble.js';

export const ALLIANCE_KEY = 'tf-alliances';

export function loadAlliances(){ try{ return JSON.parse(lsGet(ALLIANCE_KEY)||'[]'); }catch(e){ return []; } }
window.loadAlliances = loadAlliances;

export function saveAlliances(d){ try{ lsSet(ALLIANCE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveAlliances = saveAlliances;

export function addAlliance(npcName, type, conditions){
  const a = loadAlliances();
  a.push({ id:Date.now(), npc:npcName, type, conditions:conditions||'', status:'active', turn:S.msgCount||0, at:new Date().toLocaleString('ko-KR'), history:[] });
  saveAlliances(a);
  renderAlliancePanel();
  toast(`🤝 ${npcName}와 ${type==='alliance'?'동맹':'계약'}이 체결되었습니다`, 2000);
}
window.addAlliance = addAlliance;

export function recordBetray(id, who, reason){
  const a = loadAlliances();
  const found = a.find(x=>x.id===id);
  if(!found) return;
  found.status='betrayed';
  found.betrayedBy=who;
  found.betrayReason=reason||'';
  found.betrayedAt=S.msgCount||0;
  found.history.push({ event:'배신', by:who, reason, turn:S.msgCount||0 });
  saveAlliances(a);
  renderAlliancePanel();
  toast(`💔 ${who}의 배신이 기록됩니다`, 2000);
}
window.recordBetray = recordBetray;

export function removeAlliance(id){
  saveAlliances(loadAlliances().filter(a=>a.id!==id));
  renderAlliancePanel();
}
window.removeAlliance = removeAlliance;

export function getAllianceBLS(){
  const a = loadAlliances();
  if(!a.length) return '';
  const active=a.filter(x=>x.status==='active').map(x=>`${x.npc}(${x.type==='alliance'?'동맹':'계약'})`).join(', ');
  const betrayed=a.filter(x=>x.status==='betrayed').map(x=>`${x.betrayedBy}가 ${x.npc}를 배신`).join(', ');
  let hint='';
  if(active) hint+=`\n[🤝 활성 동맹·계약] ${active} — 이들과의 약속을 서사에 반영하라.`;
  if(betrayed) hint+=`\n[💔 배신 이력] ${betrayed} — 배신자와의 조우 시 긴장감과 복수심을 묘사하라.`;
  return hint;
}
window.getAllianceBLS = getAllianceBLS;

export function renderAlliancePanel(){
  const body = document.getElementById('pb-alliance');
  if(!body) return;
  const alliances = loadAlliances();
  const npcs=(typeof loadNPCs==='function')?(loadNPCs()||[]):[];
  const npcNames=npcs.map(n=>n.name);
  body.innerHTML=`
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#50b070;letter-spacing:1px;margin-bottom:4px">🤝 동맹·배신 기록</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:10px">체결된 동맹, 계약, 배신 이력을 관리합니다. AI 서사에 자동 반영됩니다.</div>
      <!-- 새 동맹/계약 추가 -->
      <div style="background:#040c08;border:1px solid #1a4030;padding:10px 12px;margin-bottom:12px;border-radius:2px">
        <div style="font-size:9px;color:#4a8060;font-family:Cinzel,serif;margin-bottom:6px">+ 동맹·계약 추가</div>
        <div style="display:flex;gap:5px;margin-bottom:5px">
          <input id="ally-npc" placeholder="NPC 이름" list="ally-npc-list" style="flex:1;padding:6px 8px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-family:Crimson Text,serif;font-size:11px;outline:none" maxlength="30"/>
          <datalist id="ally-npc-list">${npcNames.map(n=>`<option value="${esc(n)}">`).join('')}</datalist>
          <select id="ally-type" style="padding:6px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-size:10px;outline:none">
            <option value="alliance">동맹</option>
            <option value="contract">계약</option>
            <option value="truce">휴전</option>
          </select>
        </div>
        <input id="ally-cond" placeholder="조건/내용 (선택)" style="width:100%;padding:6px 8px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-family:Crimson Text,serif;font-size:11px;outline:none;margin-bottom:6px" maxlength="60"/>
        <button class="btn btn-gold" onclick="(function(){const n=document.getElementById('ally-npc').value.trim(),t=document.getElementById('ally-type').value,c=document.getElementById('ally-cond').value.trim();if(!n)return;addAlliance(n,t,c);document.getElementById('ally-npc').value='';document.getElementById('ally-cond').value='';})();" style="width:100%;padding:6px;font-size:10px">🤝 체결</button>
      </div>
      ${alliances.length===0?'<div style="text-align:center;padding:20px;font-size:11px;color:var(--dim)">체결된 동맹·계약이 없습니다.</div>':
        alliances.map(a=>{
          const statusColor = a.status==='active'?'#50b070':a.status==='betrayed'?'#e05050':'#808080';
          const statusLabel = {active:'✅ 활성',betrayed:'💔 배신당함',ended:'⬜ 종료'}[a.status]||a.status;
          const typeLabel = {alliance:'동맹',contract:'계약',truce:'휴전'}[a.type]||a.type;
          return `
            <div style="padding:11px 13px;background:#040a06;border:1px solid ${statusColor}44;border-left:3px solid ${statusColor};margin-bottom:8px">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
                <span style="font-size:10px;color:${statusColor};font-family:Cinzel,serif">${esc(a.npc)}</span>
                <span style="font-size:8px;padding:1px 6px;background:${statusColor}18;border:1px solid ${statusColor}44;color:${statusColor};border-radius:2px">${typeLabel}</span>
                <span style="font-size:8px;color:${statusColor};margin-left:auto">${statusLabel}</span>
              </div>
              ${a.conditions?`<div style="font-size:9px;color:var(--dim);margin-bottom:5px;font-style:italic">"${esc(a.conditions)}"</div>`:''}
              ${a.status==='betrayed'?`<div style="font-size:9px;color:#e05050;margin-bottom:5px">배신자: ${esc(a.betrayedBy||'?')} — ${esc(a.betrayReason||'')}</div>`:''}
              <div style="font-size:8px;color:var(--dim);margin-bottom:6px">턴${a.turn} · ${a.at}</div>
              ${a.status==='active'?`
                <div style="display:flex;gap:4px">
                  <input id="betray-who-${a.id}" placeholder="배신자 이름" style="flex:1;padding:4px 6px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-size:9px;outline:none"/>
                  <button onclick="(function(){const w=document.getElementById('betray-who-${a.id}').value.trim();if(!w)return;recordBetray(${a.id},w,'');})();" style="padding:4px 8px;background:#120606;border:1px solid #5a1a1a;color:#e05050;font-size:8px;cursor:pointer;font-family:Cinzel,serif">💔 배신</button>
                  <button onclick="removeAlliance(${a.id})" style="padding:4px 6px;background:transparent;border:1px solid #2a1a0a;color:#4a3a2a;font-size:8px;cursor:pointer">🗑</button>
                </div>`:''}
            </div>`;
        }).join('')}
    </div>`;
}
window.renderAlliancePanel = renderAlliancePanel;

window.renderAlliancePanel = renderAlliancePanel;

window.addAlliance = addAlliance;

window.recordBetray = recordBetray;

window.removeAlliance = removeAlliance;

window.getAllianceBLS = getAllianceBLS;
