// ④ 관계 DB — NPC 간 관계망
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { MEMDB } from '../data/139-스토어-키.js';
import { dbGet, dbSet } from '../utils.js';

export function loadRelationDB(){ return dbGet(MEMDB.RELATION)||{}; }
window.loadRelationDB = loadRelationDB;

export function saveRelationDB(d){ dbSet(MEMDB.RELATION,d); }
window.saveRelationDB = saveRelationDB;

export function upsertRelation(npcA, npcB, patch){
  if(!npcA||!npcB) return;
  const db  = loadRelationDB();
  const key = [npcA,npcB].sort().join('|');
  const t   = S.msgCount||0;
  if(!db[key]) db[key]={ npcA, npcB, relation:{ score:0, type:'neutral', desc:'' }, history:[], sharedSecrets:[], conflicts:[], alliances:[] };
  const r = db[key];

  if(patch.delta!=null){
    const prev = r.relation.score;
    r.relation.score = Math.min(100,Math.max(-100,prev+patch.delta));
    const sc=r.relation.score;
    r.relation.type = sc>=70?'ally':sc>=30?'friendly':sc>=-30?'neutral':sc>=-70?'unfriendly':'hostile';
    r.history.push({ turn:t, prev, next:r.relation.score, event:patch.event||'', desc:patch.desc||'' });
    
  }
  if(patch.desc) r.relation.desc = patch.desc;
  if(patch.secret && !r.sharedSecrets.includes(patch.secret)) r.sharedSecrets.push(patch.secret);
  if(patch.conflict) r.conflicts.push({ desc:patch.conflict, resolved:false, turn:t });
  if(patch.alliance) r.alliances.push({ desc:patch.alliance, turn:t });

  saveRelationDB(db);
}
window.upsertRelation = upsertRelation;

window.upsertRelation = upsertRelation;

export function getRelation(npcA,npcB){
  const db=loadRelationDB();
  const key=[npcA,npcB].sort().join('|');
  return db[key]||null;
}
window.getRelation = getRelation;

window.getRelation=getRelation;

export function getNpcRelations(name){
  const db=loadRelationDB();
  return Object.values(db).filter(r=>r.npcA===name||r.npcB===name);
}
window.getNpcRelations = getNpcRelations;

window.getNpcRelations=getNpcRelations;
