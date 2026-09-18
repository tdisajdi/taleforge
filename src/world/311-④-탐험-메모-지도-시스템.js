// ④ 🗺️ 탐험 메모 지도 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from './052-동대륙-추가-장소-4.js';

export const MAPNOTES_KEY = 'tf-mapnotes';

export function loadMapNotes(){ try{ return JSON.parse(lsGet(MAPNOTES_KEY)||'[]'); }catch(e){ return []; } }
window.loadMapNotes = loadMapNotes;

export function saveMapNotes(d){ try{ lsSet(MAPNOTES_KEY, JSON.stringify(d)); }catch(e){} }
window.saveMapNotes = saveMapNotes;

export function addMapNote(locName, text, isAuto=false){
  const notes = loadMapNotes();
  notes.push({
    id: Date.now(),
    location: locName || (typeof loadCurrentLocation==='function' ? loadCurrentLocation()?.name||'알 수 없는 곳' : '알 수 없는 곳'),
    text: (text||'').slice(0,120),
    isAuto,
    turn: S.msgCount||0,
    at: new Date().toLocaleString('ko-KR'),
    pinColor: isAuto ? '#e0a040' : '#60c0e0'
  });
  saveMapNotes(notes);
}
window.addMapNote = addMapNote;

export function deleteMapNote(id){
  const notes = loadMapNotes().filter(n=>n.id!==id);
  saveMapNotes(notes);
  renderMapNotesPanel();
}
window.deleteMapNote = deleteMapNote;

export function autoMapPin(aiText){
  const lc = aiText||'';
  const importantPatterns = [
    { re:/비밀\s*통로|숨겨진\s*문|비밀\s*방/, note:'🚪 비밀 통로/방 발견' },
    { re:/함정|트랩|지뢰/, note:'⚠️ 함정 발견! 주의' },
    { re:/보물\s*상자|금고|숨겨진\s*보물/, note:'💰 보물 위치' },
    { re:/봉인|고대.*봉인|마법.*봉인/, note:'🔒 봉인 장소' },
    { re:/강력한.*적|두목|우두머리|보스/, note:'⚔️ 강적 출몰 지역' },
    { re:/안전.*쉼터|피신.*장소|은신처/, note:'🏠 안전 지대' },
  ];
  for(const p of importantPatterns){
    if(p.re.test(lc)){
      const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation()?.name||'현재 위치' : '현재 위치';
      addMapNote(loc, p.note, true);
      toast('🗺️ 지도에 자동 핀 추가됨', 1200);
      break;
    }
  }
}
window.autoMapPin = autoMapPin;

export function renderMapNotesPanel(){
  const body = document.getElementById('pb-mapnotes');
  if(!body) return;
  const notes = loadMapNotes().slice().reverse();
  const curLoc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation()?.name||'' : '';
  const grouped = {};
  for(const n of notes){
    if(!grouped[n.location]) grouped[n.location]=[];
    grouped[n.location].push(n);
  }
  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#70c0e0;letter-spacing:1px;margin-bottom:6px">🗺️ 탐험 메모 지도 (${notes.length}개)</div>
      <!-- 새 메모 추가 -->
      <div style="display:flex;gap:5px;margin-bottom:12px">
        <input id="mapnote-input" placeholder="현재 위치에 메모..." style="flex:1;padding:7px 10px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-family:Crimson Text,serif;font-size:12px;outline:none" maxlength="100"/>
        <button class="btn btn-gold" onclick="(function(){const v=document.getElementById('mapnote-input').value.trim();if(!v)return;addMapNote('',''+v);renderMapNotesPanel();document.getElementById('mapnote-input').value='';toast('📍 메모 추가됨',1000);})()" style="padding:6px 12px;font-size:10px">📍추가</button>
      </div>
      ${Object.keys(grouped).length===0
        ?'<div style="text-align:center;padding:20px;font-size:11px;color:var(--dim)">아직 메모가 없습니다.<br>중요한 장소에 메모를 남겨보세요!</div>'
        :Object.entries(grouped).map(([loc,locNotes])=>`
          <div style="margin-bottom:12px">
            <div style="font-family:Cinzel,serif;font-size:9px;color:#4090b0;letter-spacing:1px;margin-bottom:5px;display:flex;align-items:center;gap:5px">
              📍 ${esc(loc)} ${loc===curLoc?'<span style="font-size:8px;color:#60c060;background:#0a200a;padding:1px 5px;border-radius:2px">현재 위치</span>':''}
            </div>
            ${locNotes.map(n=>`
              <div style="padding:7px 10px;background:#060c10;border:1px solid #1a3040;border-left:3px solid ${n.pinColor};margin-bottom:4px;display:flex;align-items:flex-start;gap:8px">
                <div style="flex:1">
                  <div style="font-size:10px;color:${n.isAuto?'#e0a040':'#90c8e0'};line-height:1.5">${n.isAuto?'🤖 ':''}${esc(n.text)}</div>
                  <div style="font-size:8px;color:var(--dim);margin-top:2px">턴${n.turn} · ${n.at}</div>
                </div>
                <button onclick="deleteMapNote(${n.id})" style="background:none;border:none;color:#5a3a2a;cursor:pointer;font-size:13px;padding:0;line-height:1;flex-shrink:0">×</button>
              </div>`).join('')}
          </div>`).join('')}
      <div style="margin-top:8px;padding:7px 10px;background:#04080c;border:1px dashed #1a3040;font-size:9px;color:var(--dim);line-height:1.6">
        💡 AI가 함정·비밀 통로·강적·보물을 감지하면 자동으로 핀을 추가합니다
      </div>
    </div>`;
}
window.renderMapNotesPanel = renderMapNotesPanel;

window.renderMapNotesPanel = renderMapNotesPanel;

window.addMapNote = addMapNote;

window.deleteMapNote = deleteMapNote;

window.autoMapPin = autoMapPin;
