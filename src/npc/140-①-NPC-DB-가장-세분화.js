// ① NPC DB — 가장 세분화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { MEMDB } from '../data/139-스토어-키.js';
import { dbGet, dbSet } from '../utils.js';

export function loadNpcDB(){ return dbGet(MEMDB.NPC) || {}; }
window.loadNpcDB = loadNpcDB;

export function saveNpcDB(d){ dbSet(MEMDB.NPC, d); }
window.saveNpcDB = saveNpcDB;

export function upsertNpc(name, patch){
  if(!name) return;
  const db = loadNpcDB();
  if(!db[name]) db[name] = {
    name, role:'', icon:'', faction:'',
    personality: { type:'', desc:'', speechStyle:'' },
    relation: { score:0, type:'neutral', trend:'stable', history:[] },
    trust:50, fear:0, respect:50,
    emotions: { current:'neutral', history:[] },
    dialogHistory: [],
    promises: [],
    secrets: { revealed:[], hidden:[], suspected:[] },
    reactPositiveTo:[], reactNegativeTo:[],
    conflicts:[],
    loyaltyBreakpoint:'',
    betrayalRisk:0,
    currentMood:'neutral',
    keyFacts:[],
    firstMet: S.msgCount||0,
    lastSeen: S.msgCount||0,
    totalInteractions:0,
    isAlive:true,
    location:'',
    questLinks:[],
    eventLinks:[],
  };
  const n = db[name];
  const t = S.msgCount||0;

  // 기본 필드
  if(patch.role)      n.role      = patch.role;
  if(patch.icon)      n.icon      = patch.icon;
  if(patch.faction)   n.faction   = patch.faction;
  if(patch.location)  n.location  = patch.location;
  if(patch.isAlive!=null) n.isAlive = patch.isAlive;

  // 성격
  if(patch.personality){
    Object.assign(n.personality, patch.personality);
  }
  if(patch.speechStyle) n.personality.speechStyle = patch.speechStyle;

  // 관계 점수
  if(patch.relationDelta){
    const prev = n.relation.score;
    n.relation.score = Math.min(100, Math.max(-100, prev + patch.relationDelta));
    n.relation.trend = patch.relationDelta>0 ? 'rising' : patch.relationDelta<0 ? 'falling' : 'stable';
    n.relation.history.push({ turn:t, prev, next:n.relation.score, reason:patch.relationReason||'' });
    if(n.relation.history.length>20) n.relation.history = n.relation.history.slice(-20);
    // 관계 타입 자동 갱신
    const sc = n.relation.score;
    n.relation.type = sc>=70?'ally': sc>=30?'friendly': sc>=-30?'neutral': sc>=-70?'unfriendly':'hostile';
  }
  if(patch.relation && typeof patch.relation==='string') n.relation.type = patch.relation;

  // 신뢰·공포·존중
  if(patch.trust!=null)   n.trust   = Math.min(100,Math.max(0,(n.trust||50)+patch.trust));
  if(patch.fear!=null)    n.fear    = Math.min(100,Math.max(0,(n.fear||0)+patch.fear));
  if(patch.respect!=null) n.respect = Math.min(100,Math.max(0,(n.respect||50)+patch.respect));

  // 감정
  if(patch.emotion){
    n.emotions.current = patch.emotion;
    n.emotions.history.push({ turn:t, emotion:patch.emotion });
    if(n.emotions.history.length>30) n.emotions.history = n.emotions.history.slice(-30);
  }
  n.currentMood = patch.mood || n.emotions.current;

  // 대화 이력
  if(patch.dialog){
    n.dialogHistory.push({ turn:t, ...patch.dialog });
    if(n.dialogHistory.length>50) n.dialogHistory = n.dialogHistory.slice(-50);
    n.totalInteractions++;
  }

  // 약속
  if(patch.promise){
    n.promises.push({ text:patch.promise, turn:t, kept:null, resolvedTurn:null });
  }
  if(patch.promiseKept!=null){
    const p = n.promises.find(x=>x.kept==null && (patch.promiseTopic ? x.text.includes(patch.promiseTopic) : true));
    if(p){ p.kept=patch.promiseKept; p.resolvedTurn=t; }
  }

  // 비밀
  if(patch.secretRevealed && !n.secrets.revealed.includes(patch.secretRevealed))
    n.secrets.revealed.push(patch.secretRevealed);
  if(patch.secretHidden && !n.secrets.hidden.includes(patch.secretHidden))
    n.secrets.hidden.push(patch.secretHidden);
  if(patch.secretSuspected && !n.secrets.suspected.includes(patch.secretSuspected))
    n.secrets.suspected.push(patch.secretSuspected);

  // 반응 패턴
  if(patch.reactPos && !n.reactPositiveTo.includes(patch.reactPos)) n.reactPositiveTo.push(patch.reactPos);
  if(patch.reactNeg && !n.reactNegativeTo.includes(patch.reactNeg)) n.reactNegativeTo.push(patch.reactNeg);

  // 배신 위험
  if(patch.betrayalRisk!=null) n.betrayalRisk = Math.min(100,Math.max(0,patch.betrayalRisk));
  if(patch.loyaltyBreakpoint) n.loyaltyBreakpoint = patch.loyaltyBreakpoint;

  // 핵심 사실
  if(patch.fact){
    n.keyFacts.push({ text:patch.fact, turn:t, source:patch.factSource||'' });
    if(n.keyFacts.length>30) n.keyFacts = n.keyFacts.slice(-30);
  }

  // 퀘스트·사건 링크
  if(patch.questLink && !n.questLinks.includes(patch.questLink)) n.questLinks.push(patch.questLink);
  if(patch.eventLink && !n.eventLinks.includes(patch.eventLink)) n.eventLinks.push(patch.eventLink);

  n.lastSeen = t;
  saveNpcDB(db);
}
window.upsertNpc = upsertNpc;

window.upsertNpc = upsertNpc;

export function getNpc(name){
  const db = loadNpcDB();
  return db[name] || Object.values(db).find(n=>n.name&&name&&(n.name.includes(name.slice(0,3))||name.includes(n.name.slice(0,3)))) || null;
}
window.getNpc = getNpc;

window.getNpc = getNpc;

export function getRecentNpcs(limit=8, withinTurns=40){
  const db = loadNpcDB();
  const cur = S.msgCount||0;
  return Object.values(db)
    .filter(n=>n.lastSeen>=cur-withinTurns)
    .sort((a,b)=>b.lastSeen-a.lastSeen)
    .slice(0,limit);
}
window.getRecentNpcs = getRecentNpcs;

window.getRecentNpcs = getRecentNpcs;
