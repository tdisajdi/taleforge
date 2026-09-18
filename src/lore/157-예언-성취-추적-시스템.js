// 예언 성취 추적 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { addEvent } from '../misc/142-③-사건-DB-태그-인덱스-전문-검색.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const PROPHECY_KEY = 'tf-prophecy-tracker';

export function loadProphecies(){ try{ return JSON.parse(lsGet(PROPHECY_KEY)||'[]'); }catch(e){ return []; } }
window.loadProphecies = loadProphecies;

export function saveProphecies(d){ try{ lsSet(PROPHECY_KEY,JSON.stringify(d)); }catch(e){} }
window.saveProphecies = saveProphecies;

export function addProphecy(text, source, conditions){
  const proph = loadProphecies();
  const id = 'ph_'+Date.now();
  proph.push({
    id, text, source:source||'알 수 없는 예언자',
    conditions: conditions||[],
    fulfilled: false, fulfillTurn: null,
    twisted: false, twistedDesc: null,
    addedTurn: S.msgCount||0,
    at: new Date().toISOString(),
  });
  saveProphecies(proph);
  toast('🔮 예언이 기록됐습니다: "'+text.slice(0,30)+'..."', 3000);
  if(typeof addEvent==='function') addEvent({ title:'예언 등록: '+source, desc:text.slice(0,60), tags:['예언','prophecy'], category:'lore', worldImpact:3 });
  return id;
}
window.addProphecy = addProphecy;

window.addProphecy = addProphecy;

export function getProphecyBLS(){
  const proph = loadProphecies();
  const active = proph.filter(function(p){ return !p.fulfilled&&!p.twisted; });
  if(!active.length) return '';
  const lines = active.slice(0,4).map(function(p){
    return '• "'+p.text.slice(0,60)+'"  (출처: '+p.source+')';
  });
  return '\n\n[🔮 미성취 예언]\n'+lines.join('\n')
    +'\n현재 서사가 예언과 연결될 때 자연스럽게 암시하라. 예언 성취 시 GS: "prophecy_fulfill":{"id":"ph_xxx","how":"성취 방식","twisted":false}';
}
window.getProphecyBLS = getProphecyBLS;

window.getProphecyBLS = getProphecyBLS;
