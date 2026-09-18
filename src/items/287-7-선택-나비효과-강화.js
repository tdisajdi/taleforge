// 7. 선택 나비효과 강화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { BUTTERFLY_TRIGGERS } from '../data/287-7-선택-나비효과-강화.js';
import { lsGet, lsSet } from '../utils.js';

export const BUTTERFLY_MEMORY_KEY = 'tf-butterfly-memory';

export function loadButterflyMemory(){ try{ return JSON.parse(lsGet(BUTTERFLY_MEMORY_KEY)||'[]'); }catch(e){ return []; } }
window.loadButterflyMemory = loadButterflyMemory;

export function saveButterflyMemory(d){ try{ lsSet(BUTTERFLY_MEMORY_KEY, JSON.stringify(d.slice(-20))); }catch(e){} }
window.saveButterflyMemory = saveButterflyMemory;

export function recordButterflyEvent(userMsg){
  const lc = userMsg.toLowerCase();
  for(const trigger of BUTTERFLY_TRIGGERS){
    if(trigger.pattern.test(lc)){
      const memory = loadButterflyMemory();
      memory.push({ tag:trigger.tag, memo:trigger.memo(userMsg), turn:S.msgCount, at:new Date().toISOString() });
      saveButterflyMemory(memory);
      break;
    }
  }
}
window.recordButterflyEvent = recordButterflyEvent;

window.recordButterflyEvent = recordButterflyEvent;

export function buildButterflyContext(){
  try{
    const memory = loadButterflyMemory();
    const now = S.msgCount||0;
    // 10턴 이상 전의 중요 선택
    const old = memory.filter(m=>(now - (m.turn||0)) >= 10);
    if(!old.length) return '';
    // 가장 최근의 오래된 선택 1개
    const pick = old[old.length-1];
    const CONSEQUENCE_HINTS = {
      killed:    '과거에 처치한 존재의 지인이나 복수자가 나타날 수 있다. 서사에서 그 그림자를 암시하라.',
      betrayal:  '과거의 배신이 소문으로 퍼져 일부 NPC가 경계심을 보일 수 있다.',
      saved:     '과거에 구해준 자가 감사를 표하거나 도움을 줄 기회를 만들어라.',
      oath:      '과거에 한 약속이 아직 이행되지 않았다. 서사에서 그 무게를 암시하라.',
      destroyed: '파괴한 것의 여파가 세계 어딘가에 흔적을 남기고 있다.',
      secret:    '알게 된 비밀이 새로운 사건의 열쇠가 될 수 있다. 적절한 시점에 활용하라.',
    };
    const hint = CONSEQUENCE_HINTS[pick.tag]||'';
    return `\n[🦋 나비효과] ${pick.memo}(${pick.turn}턴). ${hint}`;
  }catch(e){ return ''; }
}
window.buildButterflyContext = buildButterflyContext;

window.buildButterflyContext = buildButterflyContext;
