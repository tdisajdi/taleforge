// ⑦ 대화 DB — NPC별 실제 대화 전문 보존
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { MEMDB } from '../data/139-스토어-키.js';
import { dbGet, dbSet } from '../utils.js';

export function loadDialogDB(){ return dbGet(MEMDB.DIALOG)||{}; }
window.loadDialogDB = loadDialogDB;

export function saveDialogDB(d){ dbSet(MEMDB.DIALOG,d); }
window.saveDialogDB = saveDialogDB;

export function addNpcDialog(npcName, player, npc, topic, emotion){
  const db  = loadDialogDB();
  const t   = S.msgCount||0;
  if(!db[npcName]) db[npcName]=[];
  db[npcName].push({ turn:t, player:player.slice(0,150), npc:npc.slice(0,300), topic:topic||'', emotion:emotion||'neutral' });
  if(db[npcName].length>100) db[npcName]=db[npcName].slice(-100);
  saveDialogDB(db);
}
window.addNpcDialog = addNpcDialog;

window.addNpcDialog = addNpcDialog;

export function getRecentNpcDialogs(npcName, limit=5){
  const db=loadDialogDB();
  return (db[npcName]||[]).slice(-limit);
}
window.getRecentNpcDialogs = getRecentNpcDialogs;

window.getRecentNpcDialogs = getRecentNpcDialogs;
