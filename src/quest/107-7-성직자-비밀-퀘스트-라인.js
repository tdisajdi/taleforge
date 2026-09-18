// 7. 성직자 비밀 퀘스트 라인
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RELIGION_SECRET_QUESTS } from '../data/107-7-성직자-비밀-퀘스트-라인.js';
import { getPlayerReligion } from '../religion/094-5-플레이어-종교-귀속-교화.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { grantTitle } from './086-퀘스트임무-수락-팝업-시스템.js';

export const RELIGION_QUEST_KEY = 'tf-religion-quests';

export function loadReligionQuests(){ try{ return JSON.parse(lsGet(RELIGION_QUEST_KEY)||'{}'); }catch(e){ return {}; } }
window.loadReligionQuests = loadReligionQuests;

export function saveReligionQuests(d){ lsSet(RELIGION_QUEST_KEY, JSON.stringify(d)); }
window.saveReligionQuests = saveReligionQuests;

export function checkReligionSecretQuests(){
  const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  if(!rel) return;
  const quests = RELIGION_SECRET_QUESTS[rel]||[];
  const done = loadReligionQuests();
  const jobId = (S.character?.jobId||S.character?.role||'').toLowerCase();
  const fath = S.stats?.fath||50;
  const evangelCount = S.character?.evangelCount||0;

  quests.forEach(q=>{
    if(done[q.id]) return;
    const req = q.req||{};
    if(fath < (req.fath||0)) return;
    if(evangelCount < (req.evangelCount||0)) return;
    if(req.jobMatch && !req.jobMatch.includes(jobId) && !req.jobMatch.some(j=>jobId.includes(j))) return;

    // 퀘스트 발견
    done[q.id] = 'discovered';
    saveReligionQuests(done);

    toast(`🔮 비밀 퀘스트 발견: ${q.title}`, 4000);
    if(typeof addTimelineEvent==='function')
      addTimelineEvent('quest', q.title, {icon:'🔮'});

    S._nextInjectedContext = (S._nextInjectedContext||'')
      +`\n[🔮 종교 비밀 퀘스트 발동] "${q.title}"\n${q.aiHint}\n`
      +`이 퀘스트를 자연스럽게 서사 흐름에 녹여 제시하라. 강요하지 말고 기회로 제시할 것.`;
  });
}
window.checkReligionSecretQuests = checkReligionSecretQuests;

window.checkReligionSecretQuests = checkReligionSecretQuests;

export function completeReligionQuest(questId){
  const done = loadReligionQuests();
  if(done[questId]==='completed') return;
  done[questId] = 'completed';
  saveReligionQuests(done);

  // 보상 적용
  const allQuests = Object.values(RELIGION_SECRET_QUESTS).flat();
  const q = allQuests.find(q=>q.id===questId);
  if(!q) return;

  const reward = q.reward||{};
  if(S.stats){
    Object.entries(reward).forEach(([k,v])=>{
      if(typeof v==='number' && S.stats[k]!==undefined)
        S.stats[k] = Math.min(999, Math.max(0,(S.stats[k]||0)+v));
    });
  }
  if(reward.title && typeof grantTitle==='function') grantTitle(reward.title);
  if(q.reward?.cost && S.stats){
    Object.entries(q.reward.cost).forEach(([k,v])=>{
      if(S.stats[k]!==undefined) S.stats[k] = Math.max(0,(S.stats[k]||0)+v);
    });
  }
  toast(`✨ 비밀 퀘스트 완료: ${q.title}`, 4000);
  if(typeof addTimelineEvent==='function')
    addTimelineEvent('quest', `${q.title} 완료`, {icon:'✨'});
}
window.completeReligionQuest = completeReligionQuest;

window.completeReligionQuest = completeReligionQuest;
