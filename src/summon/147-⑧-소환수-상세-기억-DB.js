// ⑧ 소환수 상세 기억 DB
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { MEMDB } from '../data/139-스토어-키.js';
import { dbGet, dbSet } from '../utils.js';

export function loadSummonMemDB(){ return dbGet(MEMDB.SUMMON_MEM)||{}; }
window.loadSummonMemDB = loadSummonMemDB;

export function saveSummonMemDB(d){ dbSet(MEMDB.SUMMON_MEM,d); }
window.saveSummonMemDB = saveSummonMemDB;

export function recordSummonMemory(summonId, patch){
  const db = loadSummonMemDB();
  if(!db[summonId]) db[summonId]={ battleLog:[], missionLog:[], dialogHighlights:[], emotionalMoments:[], bonds:[] };
  const s  = db[summonId];
  const t  = S.msgCount||0;
  if(patch.battle)   { s.battleLog.push({ turn:t, ...patch.battle }); if(s.battleLog.length>50) s.battleLog=s.battleLog.slice(-50); }
  if(patch.mission)  { s.missionLog.push({ turn:t, ...patch.mission }); }
  if(patch.dialog)   { s.dialogHighlights.push({ turn:t, text:patch.dialog });  }
  if(patch.emotion)  { s.emotionalMoments.push({ turn:t, emotion:patch.emotion, cause:patch.cause||'' }); }
  if(patch.bond)     { s.bonds.push({ turn:t, event:patch.bond, bondDelta:patch.bondDelta||5 }); }
  saveSummonMemDB(db);
}
window.recordSummonMemory = recordSummonMemory;

window.recordSummonMemory = recordSummonMemory;
