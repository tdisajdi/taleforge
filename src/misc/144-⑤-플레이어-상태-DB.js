// ⑤ 플레이어 상태 DB
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { MEMDB } from '../data/139-스토어-키.js';
import { dbGet, dbSet } from '../utils.js';

export function loadPlayerDB(){ return dbGet(MEMDB.PLAYER)||initPlayerDB(); }
window.loadPlayerDB = loadPlayerDB;

export function savePlayerDB(d){ dbSet(MEMDB.PLAYER,d); }
window.savePlayerDB = savePlayerDB;

export function initPlayerDB(){
  return {
    injuries:[], traumas:[], achievements:[], scars:[], bonds:[], skills:[],
    reputation:{},
    mentalState:{ stability:100, traumas:[], currentState:'stable' },
    physicalState:{ conditions:[] },
    choices:[], moralAlignment:0, karmaPoints:0,
  };
}
window.initPlayerDB = initPlayerDB;

export function updatePlayerDB(patch){
  const db = loadPlayerDB();
  const t  = S.msgCount||0;

  // 부상
  if(patch.injury){
    const id='inj_'+t;
    db.injuries.push({ id, text:patch.injury, severity:patch.severity||'medium', turn:t, healed:false, healedTurn:null, healedBy:null });
  }
  if(patch.healed){
    const inj = db.injuries.find(i=>!i.healed&&i.text.includes(patch.healed.slice(0,6)));
    if(inj){ inj.healed=true; inj.healedTurn=t; inj.healedBy=patch.healedBy||''; }
  }

  // 트라우마
  if(patch.trauma){
    db.traumas.push({ id:'trm_'+t, text:patch.trauma, trigger:patch.traumaTrigger||'', turn:t, resolved:false, resolvedTurn:null });
    db.mentalState.stability = Math.max(0, (db.mentalState.stability||100)-10);
    if(db.mentalState.stability<30) db.mentalState.currentState='unstable';
  }
  if(patch.resolveTrauma){
    const tr=db.traumas.find(t=>!t.resolved&&t.text.includes(patch.resolveTrauma.slice(0,6)));
    if(tr){ tr.resolved=true; tr.resolvedTurn=t; db.mentalState.stability=Math.min(100,(db.mentalState.stability||100)+15); }
  }

  // 업적
  if(patch.achievement) db.achievements.push({ id:'ach_'+t, text:patch.achievement, turn:t, category:patch.achCategory||'general', rarity:patch.rarity||'common' });

  // 흉터
  if(patch.scar) db.scars.push({ id:'scar_'+t, text:patch.scar, type:patch.scarType||'physical', turn:t, desc:patch.scarDesc||'' });

  // 유대
  if(patch.bond){
    const existing = db.bonds.find(b=>b.npc===patch.bondNpc&&!b.broken);
    if(existing){ existing.strength=Math.min(100,(existing.strength||0)+(patch.bondDelta||10)); existing.desc=patch.bond; }
    else db.bonds.push({ id:'bnd_'+t, npc:patch.bondNpc||'', desc:patch.bond, strength:patch.bondStrength||30, turn:t, broken:false });
  }
  if(patch.breakBond){
    const bnd=db.bonds.find(b=>b.npc===patch.breakBond&&!b.broken);
    if(bnd) bnd.broken=true;
  }

  // 스킬
  if(patch.skill) db.skills.push({ id:'sk_'+t, name:patch.skill, gainedTurn:t, source:patch.skillSource||'' });

  // 평판
  if(patch.rep){
    if(!db.reputation[patch.rep.faction]) db.reputation[patch.rep.faction]={ score:0, history:[] };
    const prev=db.reputation[patch.rep.faction].score;
    db.reputation[patch.rep.faction].score=Math.min(100,Math.max(-100,prev+(patch.rep.delta||0)));
    db.reputation[patch.rep.faction].history.push({ turn:t, prev, next:db.reputation[patch.rep.faction].score, reason:patch.rep.reason||'' });
    if(db.reputation[patch.rep.faction].history.length>20) db.reputation[patch.rep.faction].history=db.reputation[patch.rep.faction].history.slice(-20);
  }

  // 선택·도덕
  if(patch.choice){
    db.choices.push({ turn:t, desc:patch.choice, outcome:patch.choiceOutcome||'', moralScore:patch.moralScore||0 });
    db.moralAlignment=Math.min(100,Math.max(-100,(db.moralAlignment||0)+(patch.moralScore||0)));
    db.karmaPoints=(db.karmaPoints||0)+(patch.moralScore||0);
    if(db.choices.length>100) db.choices=db.choices.slice(-100);
  }

  savePlayerDB(db);
}
window.updatePlayerDB = updatePlayerDB;

window.updatePlayerDB = updatePlayerDB;
