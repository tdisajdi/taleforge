// ⑤ 📜 서약 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';

export const OATH_KEY = 'tf-oaths';

export function loadOaths(){ try{ return JSON.parse(lsGet(OATH_KEY)||'[]'); }catch(e){ return []; } }
window.loadOaths = loadOaths;

export function saveOaths(d){ try{ lsSet(OATH_KEY, JSON.stringify(d)); }catch(e){} }
window.saveOaths = saveOaths;

export function addOath(text){
  const oaths = loadOaths();
  if(oaths.length >= 3){ toast('서약은 최대 3개까지입니다', 1500); return; }
  oaths.push({ id: Date.now(), text: text.slice(0,80), kept:0, broken:0, createdAt: S.msgCount||0, status:'active' });
  saveOaths(oaths);
  renderOathPanel();
  toast('📜 서약이 새겨졌습니다', 1800);
}
window.addOath = addOath;

export function markOath(id, result){
  const oaths = loadOaths();
  const o = oaths.find(x=>x.id===id);
  if(!o) return;
  if(result==='kept'){
    o.kept = (o.kept||0)+1;
    toast('✅ 서약을 지켰습니다! 가호가 임합니다', 2000);
    // 임시 보너스: 다음 판정에 +15
    S._oathBonus = (S._oathBonus||0)+15;
    setTimeout(()=>{ S._oathBonus=0; },30000);
  } else {
    o.broken = (o.broken||0)+1;
    toast('💔 서약을 어겼습니다... 내면의 갈등이 시작됩니다', 2500);
    S._oathBrokenEvent = o.text;
  }
  saveOaths(oaths);
  renderOathPanel();
}
window.markOath = markOath;

export function removeOath(id){
  if(!confirm('서약을 제거하시겠습니까?')) return;
  saveOaths(loadOaths().filter(o=>o.id!==id));
  renderOathPanel();
}
window.removeOath = removeOath;

export function getOathBLSHint(){
  const oaths = loadOaths();
  if(!oaths.length) return '';
  const lines = oaths.map(o=>`"${o.text}" (지킴:${o.kept} 어김:${o.broken})`).join(' | ');
  const brokenEvent = S._oathBrokenEvent;
  let hint = `\n[📜 플레이어의 서약] ${lines} — 서사에서 이 서약과 충돌하는 상황이 올 때 캐릭터의 내면 갈등을 묘사하라.`;
  if(brokenEvent){ hint += ` ⚠️ 최근 서약 위반: "${brokenEvent}" — 죄책감·갈등 이벤트를 이번 서사에 자연스럽게 녹여라.`; S._oathBrokenEvent=null; }
  if(S._oathBonus>0) hint += ` ✨ 서약 가호 활성 — 이번 행동에 미묘한 신성한 도움이 따른다.`;
  return hint;
}
window.getOathBLSHint = getOathBLSHint;

export function renderOathPanel(){
  const body = document.getElementById('pb-oath');
  if(!body) return;
  const oaths = loadOaths();
  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#e0b040;letter-spacing:1px;margin-bottom:4px">📜 서약의 서</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:10px;line-height:1.5">캐릭터가 지켜야 할 서약을 새기세요. AI가 서약을 의식한 서사를 씁니다.<br>서약 준수 → 가호 보너스 / 위반 → 내면 갈등 이벤트</div>
      ${oaths.length<3?`
        <div style="display:flex;gap:5px;margin-bottom:12px">
          <input id="oath-input" placeholder="서약 내용 (예: 무고한 자를 해치지 않는다)" style="flex:1;padding:7px 10px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-family:Crimson Text,serif;font-size:12px;outline:none" maxlength="80"/>
          <button class="btn btn-gold" onclick="(function(){const v=document.getElementById('oath-input').value.trim();if(!v)return;addOath(v);document.getElementById('oath-input').value='';})();" style="padding:6px 11px;font-size:10px">서약</button>
        </div>`:'<div style="font-size:9px;color:var(--dim);margin-bottom:10px">서약은 최대 3개까지 가능합니다.</div>'}
      ${oaths.length===0?'<div style="text-align:center;padding:20px;font-size:11px;color:var(--dim)">아직 서약이 없습니다.<br>캐릭터의 신념을 새겨보세요.</div>':
        oaths.map(o=>`
          <div style="padding:12px 14px;background:#0c0a00;border:1px solid #3a2a00;border-left:3px solid ${o.broken>o.kept?'#e05050':'#e0b040'};margin-bottom:8px">
            <div style="font-size:12px;color:#e8c870;line-height:1.6;margin-bottom:8px;font-style:italic">"${esc(o.text)}"</div>
            <div style="display:flex;gap:8px;margin-bottom:8px">
              <span style="font-size:9px;color:#60c060;background:#061206;padding:2px 8px;border:1px solid #1a4a1a;border-radius:2px">✓ 지킴 ${o.kept}</span>
              <span style="font-size:9px;color:#e05050;background:#120606;padding:2px 8px;border:1px solid #4a1a1a;border-radius:2px">✗ 위반 ${o.broken}</span>
            </div>
            <div style="display:flex;gap:5px">
              <button onclick="markOath(${o.id},'kept')" style="flex:1;padding:5px;background:#061206;border:1px solid #2a5a1a;color:#60c060;font-size:9px;cursor:pointer;font-family:Cinzel,serif">✅ 지켰다</button>
              <button onclick="markOath(${o.id},'broken')" style="flex:1;padding:5px;background:#120606;border:1px solid #5a1a1a;color:#e05050;font-size:9px;cursor:pointer;font-family:Cinzel,serif">💔 어겼다</button>
              <button onclick="removeOath(${o.id})" style="padding:5px 8px;background:transparent;border:1px solid #2a1a0a;color:#4a3a2a;font-size:9px;cursor:pointer">🗑</button>
            </div>
          </div>`).join('')}
    </div>`;
}
window.renderOathPanel = renderOathPanel;

window.renderOathPanel = renderOathPanel;

window.addOath = addOath;

window.markOath = markOath;

window.removeOath = removeOath;

window.getOathBLSHint = getOathBLSHint;
