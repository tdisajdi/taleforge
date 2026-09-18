// 6. 종교 사이드 퀘스트 20개 (세계관 이해 연동)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RELIGION_SIDE_QUESTS } from '../data/119-6-종교-사이드-퀘스트-20개-세계관-이해-연동.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { loadAchievements } from '../progression/187-2-업적-시스템.js';
import { grantTitle } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { upsertQuest } from '../quest/141-②-퀘스트-DB.js';
import { completeQuest } from '../quest/209-6-퀘스트-완료실패자동체크.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { unlockHiddenMyth } from '../world/115-2-창세신화-세계관-역사.js';
import { loadGSFlags } from '../world/145-⑥-세계-상태-DB.js';
import { loadCodex } from '../world/304-④-세계-신화-백과사전.js';
import { getPlayerReligion } from './094-5-플레이어-종교-귀속-교화.js';

window.RELIGION_SIDE_QUESTS = RELIGION_SIDE_QUESTS;

export const RELIGION_SQ_KEY = 'tf-religion-sq';

export function loadReligionSQ(){ try{ return JSON.parse(lsGet(RELIGION_SQ_KEY)||'{}'); }catch(e){ return {}; } }
window.loadReligionSQ = loadReligionSQ;

export function saveReligionSQ(d){ lsSet(RELIGION_SQ_KEY, JSON.stringify(d)); }
window.saveReligionSQ = saveReligionSQ;

export function checkReligionSideQuests(){
  const rel   = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  const fath  = S.stats?.fath||50;
  const turn  = S.msgCount||0;
  const cycle = typeof loadCycleCount==='function' ? loadCycleCount() : 0;
  const ach   = loadAchievements()||{};
  const codex = typeof loadCodex==='function' ? loadCodex() : {};
  const done  = loadReligionSQ();
  const evangelCount = S.character?.evangelCount||0;

  RELIGION_SIDE_QUESTS.forEach(sq=>{
    if(done[sq.id]) return; // 이미 발동됨

    const t = sq.trigger||{};
    // 조건 체크
    if(t.religion && t.religion !== 'none' && t.religion !== rel) return;
    if(t.fath && fath < t.fath) return;
    if(t.turn && turn < t.turn) return;
    if(t.cycle && cycle < t.cycle) return;
    if(t.evangelCount && evangelCount < t.evangelCount) return;
    if(t.int && (S.stats?.int||10) < t.int) return;
    if(t.codexUnlock && !codex[t.codexUnlock]) return;
    if(t.flag){
      const gsFlags = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      if(!gsFlags[t.flag]) return;
    }

    // 퀘스트 발동
    done[sq.id] = 'discovered';
    saveReligionSQ(done);

    // 게임 퀘스트 시스템에 등록
    if(typeof upsertQuest==='function'){
      upsertQuest(sq.id, {
        title:    sq.title,
        category: 'side',
        status:   'active',
        description: sq.worldLore,
        objective:sq.phases[0],
        phases:   sq.phases.map((p,i)=>({phase:i+1,desc:p,done:false})),
        religion: sq.religion,
      });
    }

    toast(`사이드 퀘스트 시작: ${sq.title}`, 4000, sq);
    if(typeof addTimelineEvent==='function')
      addTimelineEvent('quest', sq.title, {icon:sq.icon});

    S._nextInjectedContext = (S._nextInjectedContext||'')
      +`\n[${sq.icon} 종교 사이드 퀘스트 발동] "${sq.title}"\n${sq.aiHint}\n`
      +`퀘스트 1단계: ${sq.phases[0]}\n`
      +`세계관 배경: ${sq.worldLore}\n`
      +`이 퀘스트를 자연스러운 서사 흐름 속에 제시하라. GS: q_new:["${sq.id}"] 출력.`;
  });
}
window.checkReligionSideQuests = checkReligionSideQuests;

window.checkReligionSideQuests = checkReligionSideQuests;

export function completeReligionSideQuest(sqId){
  const done = loadReligionSQ();
  if(done[sqId]==='completed') return;
  done[sqId] = 'completed';
  saveReligionSQ(done);

  const sq = RELIGION_SIDE_QUESTS.find(q=>q.id===sqId);
  if(!sq) return;

  // 보상 적용
  const r = sq.reward||{};
  if(S.stats) Object.entries(r).forEach(([k,v])=>{
    if(typeof v==='number' && S.stats[k]!==undefined)
      S.stats[k] = Math.min(999,Math.max(0,(S.stats[k]||0)+v));
  });
  if(r.title && typeof grantTitle==='function') grantTitle(r.title);

  // 코덱스 해금
  if(r.codexUnlock) unlockHiddenMyth(r.codexUnlock);

  // 퀘스트 완료
  if(typeof completeQuest==='function') completeQuest(sqId);

  toast(`✨ 종교 사이드 퀘스트 완료: ${sq.title}`, 4000);
  if(typeof addTimelineEvent==='function')
    addTimelineEvent('quest', `${sq.title} 완료`, {icon:'✅'});
}
window.completeReligionSideQuest = completeReligionSideQuest;

window.completeReligionSideQuest = completeReligionSideQuest;
