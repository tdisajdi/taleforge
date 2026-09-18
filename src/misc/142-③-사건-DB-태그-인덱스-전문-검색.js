// ③ 사건 DB — 태그 인덱스 + 전문 검색
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { MEMDB } from '../data/139-스토어-키.js';
import { dbGet, dbSet } from '../utils.js';

export function loadEventData(){ return dbGet(MEMDB.EVENT) || {}; }
window.loadEventData = loadEventData;

export function loadEventIdx(){  return dbGet(MEMDB.EVENT_IDX) || { byTag:{}, byNpc:{}, byQuest:{}, recent:[] }; }
window.loadEventIdx = loadEventIdx;

export function saveEventData(d){ dbSet(MEMDB.EVENT, d); }
window.saveEventData = saveEventData;

export function saveEventIdx(d){  dbSet(MEMDB.EVENT_IDX, d); }
window.saveEventIdx = saveEventIdx;

export function addEvent(data){
  if(!data||!data.title) return null;
  const id  = 'evt_'+(S.msgCount||0)+'_'+Date.now().toString(36).slice(-4);
  const ev  = {
    id,
    title:      data.title,
    desc:       data.desc||'',
    impact:     data.impact||'',
    turn:       S.msgCount||0,
    location:   data.location||'',
    involvedNpcs:  data.npcs||[],
    relatedQuests: data.quests||[],
    tags:          data.tags||[],
    category:      data.category||'general',
    worldImpact:   data.worldImpact||1,
    isWorldEvent:  data.isWorldEvent||false,
    consequences:  [],
    archived:      false,
  };
  const edb = loadEventData();
  const idx = loadEventIdx();

  edb[id] = ev;

  // 인덱스 업데이트
  ev.tags.forEach(tag=>{
    if(!idx.byTag[tag]) idx.byTag[tag]=[];
    idx.byTag[tag].push(id);
    if(idx.byTag[tag].length>200) idx.byTag[tag]=idx.byTag[tag].slice(-200);
  });
  ev.involvedNpcs.forEach(npc=>{
    if(!idx.byNpc[npc]) idx.byNpc[npc]=[];
    idx.byNpc[npc].push(id);
    if(idx.byNpc[npc].length>100) idx.byNpc[npc]=idx.byNpc[npc].slice(-100);
  });
  ev.relatedQuests.forEach(qid=>{
    if(!idx.byQuest[qid]) idx.byQuest[qid]=[];
    idx.byQuest[qid].push(id);
  });
  idx.recent.push(id);
  if(idx.recent.length>200) idx.recent=idx.recent.slice(-200);

  saveEventData(edb);
  saveEventIdx(idx);
  return id;
}
window.addEvent = addEvent;

window.addEvent = addEvent;

export function searchEvents({ tags, npc, quest, recent, limit=10 }={}){
  const idx = loadEventIdx();
  const edb = loadEventData();
  let ids = [];

  if(tags&&tags.length){
    ids = tags.flatMap(t=>idx.byTag[t]||[]);
  } else if(npc){
    ids = idx.byNpc[npc]||[];
  } else if(quest){
    ids = idx.byQuest[quest]||[];
  } else {
    ids = (idx.recent||[]).slice(-limit*2);
  }

  // 중복 제거, 최신순
  const unique = [...new Set(ids)].reverse().slice(0,limit);
  return unique.map(id=>edb[id]).filter(Boolean);
}
window.searchEvents = searchEvents;

window.searchEvents = searchEvents;
