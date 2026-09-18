// 챕터/막 구조 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { CHAPTER_DEFINITIONS } from '../data/163-챕터막-구조-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const CHAPTER_KEY = 'tf-chapters';

export function loadChapterState(){ try{ return JSON.parse(lsGet(CHAPTER_KEY)||'{"current":1,"completed":[],"events":{}}'); }catch(e){ return {current:1,completed:[],events:{}}; } }
window.loadChapterState = loadChapterState;

export function saveChapterState(d){ try{ lsSet(CHAPTER_KEY,JSON.stringify(d)); }catch(e){} }
window.saveChapterState = saveChapterState;

export function advanceChapter(chapterId, triggerDesc){
  const state = loadChapterState();
  if(state.completed.includes(chapterId)) return;

  const prev = CHAPTER_DEFINITIONS.find(function(c){ return c.id===state.current; });
  const next = CHAPTER_DEFINITIONS.find(function(c){ return c.id===chapterId; });
  if(!next) return;

  state.completed.push(state.current);
  state.current = chapterId;
  saveChapterState(state);

  // 챕터 전환 연출
  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n\n[📖 챕터 전환]\n'
    +(prev?prev.icon+' '+prev.title+' 완료\n':'')
    +'→ '+next.icon+' '+next.title+' 시작\n'
    +next.desc+'\n'
    +'챕터 전환을 극적으로 연출하라. 짧은 회상·나레이션·타임스킵 등을 활용해도 좋다.\n'
    +'GS: "chapter_summary":{"chapter":'+chapterId+',"summary":"이번 장 요약"}';

  if(typeof addTimelineEvent==='function')
    addTimelineEvent('chapter', next.title, {icon:next.icon});
  toast(next.icon+' '+next.title+' 시작!', 5000);
}
window.advanceChapter = advanceChapter;

window.advanceChapter = advanceChapter;

export function getChapterBLS(){
  const state = loadChapterState();
  const cur = CHAPTER_DEFINITIONS.find(function(c){ return c.id===state.current; });
  if(!cur) return '';
  return '\n\n[📖 현재 챕터: '+cur.icon+' '+cur.title+']\n'+cur.desc
    +'\n핵심 사건: '+cur.keyEvents.join(' / ')
    +'\n이 챕터의 분위기('+cur.bgmMood+')와 테마에 맞게 서사를 전개하라.';
}
window.getChapterBLS = getChapterBLS;

window.getChapterBLS = getChapterBLS;
