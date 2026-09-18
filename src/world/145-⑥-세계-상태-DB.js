// ⑥ 세계 상태 DB
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { MEMDB } from '../data/139-스토어-키.js';
import { addEvent } from '../misc/142-③-사건-DB-태그-인덱스-전문-검색.js';
import { dbGet, dbSet } from '../utils.js';

export function loadWorldDB(){ return dbGet(MEMDB.WORLD)||initWorldDB(); }
window.loadWorldDB = loadWorldDB;

export function saveWorldDB(d){ dbSet(MEMDB.WORLD,d); }
window.saveWorldDB = saveWorldDB;

export function loadGSFlags(){
  try{
    const db = loadWorldDB();
    const out = {};
    Object.entries(db.flags||{}).forEach(([k,v])=>{ out[k] = !!(v && v.set); });
    return out;
  }catch(e){ return {}; }
}
window.loadGSFlags = loadGSFlags;

export function saveGSFlags(flagsObj){
  try{
    if(!flagsObj || typeof flagsObj !== 'object') return;
    const db = loadWorldDB();
    db.flags = db.flags || {};
    const t = (typeof S !== 'undefined' && S.msgCount) || 0;
    Object.entries(flagsObj).forEach(([k,v])=>{
      if(v){
        if(!db.flags[k]) db.flags[k] = { set:true, turn:t, desc:'' };
        else db.flags[k].set = true;
      } else if(db.flags[k]){
        db.flags[k].set = false;
      }
    });
    saveWorldDB(db);
  }catch(e){}
}
window.saveGSFlags = saveGSFlags;

window.loadGSFlags = loadGSFlags;

window.saveGSFlags = saveGSFlags;

export function initWorldDB(){
  return {
    seals:{}, loop:{ current:0, totalMemory:0, changes:[] },
    geography:{ visitedLocations:[], currentLocation:'' },
    politics:{ factionChanges:[], wars:[], treaties:[] },
    religion:{ shareHistory:[], tensions:[], wars:[] },
    flags:{},
    timeline:[],
  };
}
window.initWorldDB = initWorldDB;

export function updateWorldDB(patch){
  const db = loadWorldDB();
  const t  = S.msgCount||0;

  // 봉인석
  if(patch.sealBroken){
    const brokenCount = Object.values(db.seals).filter(s=>s.broken).length;
    db.seals[patch.sealBroken]={ broken:true, brokenTurn:t, brokenOrder:brokenCount+1, effect:patch.sealEffect||'', worldConsequence:patch.sealConsequence||'' };
    // addEvent와 연동
    addEvent({ title:patch.sealBroken+' 파괴', desc:patch.sealEffect||'봉인석이 파괴됐다', impact:'심각', tags:['봉인석','세계변화'], category:'world', worldImpact:8 });
  }

  // 루프
  if(patch.loopCycle!=null) db.loop.current=patch.loopCycle;
  if(patch.loopChange)      db.loop.changes.push({ cycle:db.loop.current, ...patch.loopChange });

  // 장소
  if(patch.location){
    db.geography.currentLocation=patch.location;
    const existing=db.geography.visitedLocations.find(l=>l.id===patch.location||l.name===patch.location);
    if(existing) existing.lastVisit=t;
    else db.geography.visitedLocations.push({ id:patch.location, name:patch.location, firstVisit:t, lastVisit:t, events:[] });
  }

  // 파벌 변화
  if(patch.factionChange) db.politics.factionChanges.push({ turn:t, ...patch.factionChange });

  // 전쟁
  if(patch.warStart) db.politics.wars.push({ sides:patch.warStart, startTurn:t, endTurn:null, outcome:null });
  if(patch.warEnd){
    const w=db.politics.wars.find(w=>!w.endTurn);
    if(w){ w.endTurn=t; w.outcome=patch.warEnd; }
  }

  // 조약
  if(patch.treaty) db.politics.treaties.push({ parties:patch.treaty.parties||[], desc:patch.treaty.desc||'', turn:t, broken:false });

  // 종교 변화
  if(patch.religionDelta) db.religion.shareHistory.push({ turn:t, ...patch.religionDelta });

  // 플래그
  if(patch.flag) db.flags[patch.flag]={ set:true, turn:t, desc:patch.flagDesc||'' };
  if(patch.unsetFlag && db.flags[patch.unsetFlag]) db.flags[patch.unsetFlag].set=false;

  // 타임라인
  if(patch.timeline) db.timeline.push({ turn:t, ...patch.timeline });
  

  saveWorldDB(db);
}
window.updateWorldDB = updateWorldDB;

window.updateWorldDB = updateWorldDB;
