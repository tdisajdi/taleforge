// ② 퀘스트 DB
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { MEMDB } from '../data/139-스토어-키.js';
import { dbGet, dbSet } from '../utils.js';

export function loadQuestDB(){ return dbGet(MEMDB.QUEST) || {}; }
window.loadQuestDB = loadQuestDB;

export function saveQuestDB(d){ dbSet(MEMDB.QUEST, d); }
window.saveQuestDB = saveQuestDB;

export function upsertQuest(id, patch){
  if(!id) return;
  const db = loadQuestDB();
  const t  = S.msgCount||0;
  if(!db[id]) db[id] = {
    id, title:'', category:'main', status:'active', priority:2,
    description:'', objective:'',
    phases:[], currentPhase:0,
    clues:[], choices:[],
    failConditions:[], successConditions:[],
    relatedNpcs:{}, relatedLocations:[],
    rewards:{ gold:0, items:[], exp:0, special:'' },
    keyMoments:[],
    outcome:null,
    startTurn:t, endTurn:null,
    timeLimit:null,
    isMainQuest:false,
    parentQuest:null,
    childQuests:[],
    tags:[],
  };
  const q = db[id];

  if(patch.title)       q.title       = patch.title;
  if(patch.category)    q.category    = patch.category;
  if(patch.status){
    q.status = patch.status;
    if(patch.status==='completed'||patch.status==='failed') q.endTurn=t;
  }
  if(patch.priority!=null) q.priority = patch.priority;
  if(patch.description) q.description = patch.description;
  if(patch.objective)   q.objective   = patch.objective;
  if(patch.isMainQuest) q.isMainQuest = patch.isMainQuest;

  // 단계 추가/업데이트
  if(patch.phase){
    const existing = q.phases.find(p=>p.id===patch.phase.id);
    if(existing) Object.assign(existing, patch.phase);
    else q.phases.push({ ...patch.phase, completedTurn:null });
  }
  if(patch.phaseComplete!=null){
    const ph = q.phases.find(p=>p.id===patch.phaseComplete);
    if(ph){ ph.status='completed'; ph.completedTurn=t; q.currentPhase=Math.min(q.phases.length-1, q.currentPhase+1); }
  }

  // 단서
  if(patch.clue) q.clues.push({ text:patch.clue, source:patch.clueSource||'', turn:t, used:false });

  // 선택 기록
  if(patch.choice) q.choices.push({ turn:t, desc:patch.choice, outcome:patch.choiceOutcome||'', impact:patch.choiceImpact||'' });

  // 실패/성공 조건
  if(patch.failCond) q.failConditions.push({ condition:patch.failCond, triggered:false, turn:null });
  if(patch.successCond) q.successConditions.push({ condition:patch.successCond, met:false, turn:null });
  if(patch.failTriggered){
    const fc=q.failConditions.find(c=>c.condition.includes(patch.failTriggered.slice(0,8)));
    if(fc){ fc.triggered=true; fc.turn=t; }
  }

  // 관련 NPC·장소
  if(patch.relatedNpc) q.relatedNpcs[patch.relatedNpc]=patch.relatedNpcRole||'관련';
  if(patch.location && !q.relatedLocations.includes(patch.location)) q.relatedLocations.push(patch.location);

  // 보상
  if(patch.rewards) Object.assign(q.rewards, patch.rewards);

  // 핵심 순간
  if(patch.moment) q.keyMoments.push({ turn:t, desc:patch.moment, impact:patch.momentImpact||'' });

  // 결과
  if(patch.outcome) q.outcome=patch.outcome;

  // 태그
  if(patch.tag && !q.tags.includes(patch.tag)) q.tags.push(patch.tag);

  // 자식 퀘스트
  if(patch.childQuest && !q.childQuests.includes(patch.childQuest)) q.childQuests.push(patch.childQuest);

  saveQuestDB(db);
}
window.upsertQuest = upsertQuest;

window.upsertQuest = upsertQuest;

export function getQuest(id){ return (loadQuestDB())[id]||null; }
window.getQuest = getQuest;

export function getActiveQuests(){ return Object.values(loadQuestDB()).filter(q=>q.status==='active').sort((a,b)=>b.priority-a.priority); }
window.getActiveQuests = getActiveQuests;

window.getQuest=getQuest;

window.getActiveQuests=getActiveQuests;
