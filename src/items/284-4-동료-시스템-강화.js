// 4. 동료 시스템 강화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { COMPANION_PERSONALITIES } from '../data/284-4-동료-시스템-강화.js';
import { applyPartyBonus, loadParty, saveParty } from '../misc/054-이동수단-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const COMPANION_DATA_KEY = 'tf-companion-ext';

export const COMP_PERSONALITY_KEY = 'tf-comp-personality';

export const COMP_GROWTH_KEY      = 'tf-comp-growth';

export function loadCompanionExt(){
  try{
    const per = lsGet(COMP_PERSONALITY_KEY); const grw = lsGet(COMP_GROWTH_KEY);
    if (per) {
      const pObj = JSON.parse(per); const gObj = grw ? JSON.parse(grw) : {};
      const merged = {};
      const allNames = new Set([...Object.keys(pObj), ...Object.keys(gObj)]);
      allNames.forEach(n => { merged[n] = { personality: pObj[n]||'', ...(gObj[n]||{growth:0,subQuestDone:false,trustLevel:0}) }; });
      return merged;
    }
    return JSON.parse(lsGet(COMPANION_DATA_KEY)||'{}');
  }catch(e){ return {}; }
}
window.loadCompanionExt = loadCompanionExt;

export function saveCompanionExt(d){
  try{
    const per={}; const grw={};
    Object.keys(d).forEach(n => { per[n]=d[n].personality||''; grw[n]={growth:d[n].growth||0,subQuestDone:d[n].subQuestDone||false,trustLevel:d[n].trustLevel||0}; });
    lsSet(COMP_PERSONALITY_KEY, JSON.stringify(per));
    lsSet(COMP_GROWTH_KEY,      JSON.stringify(grw));
    lsSet(COMPANION_DATA_KEY,   JSON.stringify(d)); // 하위호환
  }catch(e){}
}
window.saveCompanionExt = saveCompanionExt;

export function assignCompanionPersonality(npcName){
  const ext = loadCompanionExt();
  if(ext[npcName]?.personality) return ext[npcName].personality;
  const types = Object.keys(COMPANION_PERSONALITIES);
  const assigned = types[Math.floor(Math.random()*types.length)];
  ext[npcName] = { ...ext[npcName], personality:assigned, growth:0, subQuestDone:false, trustLevel:0 };
  saveCompanionExt(ext);
  return assigned;
}
window.assignCompanionPersonality = assignCompanionPersonality;

window.assignCompanionPersonality = assignCompanionPersonality;

export function growCompanions(){
  const party = typeof loadParty==='function' ? loadParty() : [];
  if(!party.length) return;
  const ext = loadCompanionExt();
  let changed = false;

  party.forEach(member=>{
    const pType = assignCompanionPersonality(member.name);
    const pDef  = COMPANION_PERSONALITIES[pType];
    if(!pDef) return;
    if(!ext[member.name]) ext[member.name] = { personality:pType, growth:0, subQuestDone:false, trustLevel:0 };
    const e = ext[member.name];
    e.growth = (e.growth||0) + 1;
    // 10 성장마다 스탯 보너스 +2
    if(e.growth % 10 === 0){
      member.statBonus = member.statBonus || {};
      member.statBonus[pDef.growthStat] = (member.statBonus[pDef.growthStat]||0) + 2;
      if(S.stats?.[pDef.growthStat] !== undefined)
        S.stats[pDef.growthStat] = Math.min(999, (S.stats[pDef.growthStat]||10) + 2);
      toast(`${member.name} 성장! ${pDef.growthStat.toUpperCase()} +2`, 3000, member);
      changed = true;
    }
    // 신뢰도 증가
    e.trustLevel = Math.min(100, (e.trustLevel||0) + 1);
    // 서브퀘스트 제안 (신뢰도 50 이상, 미완료)
    if(e.trustLevel >= 50 && !e.subQuestDone && !e._subQuestPending){
      e._subQuestPending = true;
      setTimeout(()=>{
        S._nextInjectedContext = (S._nextInjectedContext||'') +
          ` [👥 동료 서브퀘스트: ${member.icon}${member.name}] 신뢰도가 쌓였다. ${pDef.subQuestHint} 다음 장면에서 ${member.name}이 주인공에게 개인적인 부탁이나 고백을 꺼내는 자연스러운 계기를 만들어라.`;
      }, 500);
    }
  });

  if(changed){
    if(typeof saveParty==='function') saveParty(party);
    if(typeof applyPartyBonus==='function') applyPartyBonus();
  }
  saveCompanionExt(ext);
}
window.growCompanions = growCompanions;

window.growCompanions = growCompanions;

export function checkCompanionLeave(userMsg){
  const party = typeof loadParty==='function' ? loadParty() : [];
  if(!party.length) return;
  const ext = loadCompanionExt();
  const lc = userMsg.toLowerCase();

  party.forEach(member=>{
    const pType = ext[member.name]?.personality;
    if(!pType) return;
    const pDef = COMPANION_PERSONALITIES[pType];
    if(!pDef) return;
    const triggered = pDef.leaveTrigger.some(t=>lc.includes(t.toLowerCase()));
    if(triggered && Math.random() < 0.3){
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        ` [💔 동료 이탈 경고: ${member.icon}${member.name}] ${member.name}의 성격(${pDef.label})과 충돌하는 상황이다. 표정이 굳어지거나 거리를 두는 묘사를 추가하라. 계속되면 이탈할 수 있다.`;
    }
  });
}
window.checkCompanionLeave = checkCompanionLeave;

window.checkCompanionLeave = checkCompanionLeave;
