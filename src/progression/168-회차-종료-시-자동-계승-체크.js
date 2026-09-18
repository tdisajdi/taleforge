// 회차 종료 시 자동 계승 체크
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { SEAL_DEFINITIONS } from '../data/155-⑭-메모리-패널-UI.js';
import { MILESTONES } from '../data/165-저장소.js';
import { earnHeritageItem } from '../items/167-계승-아이템-획득.js';
import { loadPlayerDB } from '../misc/144-⑤-플레이어-상태-DB.js';
import { loadNpcDB } from '../npc/140-①-NPC-DB-가장-세분화.js';
import { loadStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadSealRestore, loadSummonDepth } from '../ui/155-⑭-메모리-패널-UI.js';
import { toast } from '../utils.js';
import { loadWorldDB } from '../world/145-⑥-세계-상태-DB.js';
import { loadHeritage, loadLoopRecords, loadMilestones, saveLoopRecords, saveMilestones } from '../world/165-저장소.js';
import { v36_getReincarnationCount } from './014-환생-누적-시스템-110번.js';
import { saveLoopLegacy } from './156-NG-회차-계승-시스템.js';

export function processEndOfLoop(endingId){
  const h       = loadHeritage();
  const player  = typeof loadPlayerDB==='function' ? loadPlayerDB() : {};
  const world   = typeof loadWorldDB==='function'  ? loadWorldDB()  : {};
  const seals   = typeof loadSealRestore==='function' ? loadSealRestore() : {};
  const summons = typeof window.loadSummons==='function'  ? window.loadSummons()||[] : [];
  const loop    = typeof v36_getReincarnationCount==='function' ? v36_getReincarnationCount() : 0;
  const stats   = typeof loadStats==='function' ? loadStats() : {};

  const earned = [];

  // 엔딩별 S급 계승
  if(endingId==='true_ending')                         { earnHeritageItem('watcher_sigil','진 엔딩'); earned.push('watcher_sigil'); }
  if(world.flags?.asmodeus_recruited?.set)             { earnHeritageItem('asmodeus_pact','아스모데우스 영입'); earned.push('asmodeus_pact'); }

  // 세계수 씨앗 조건
  const restoreCount = Object.values(seals).filter(function(v){ return v&&v.restored; }).length;
  // [B44 FIX] "봉인석 전부 복원"을 뜻하는 조건이 실제 총량(11, 세계수/태양/
  // 심연/용염/빙하/폭풍/대지/망각/생명/알테라/시간)보다 하나 적은 10으로
  // 하드코딩되어 있던 버그. SEAL_DEFINITIONS 기준으로 동적 계산.
  const _totalSealsB44 = (typeof SEAL_DEFINITIONS!=='undefined') ? Object.keys(SEAL_DEFINITIONS).length : 11;
  if(restoreCount>=_totalSealsB44){
    const slEl = typeof loadNpcDB==='function' ? (loadNpcDB()||{})['실라리엘'] : null;
    if(slEl&&(slEl.affection||0)>=90) { earnHeritageItem('world_tree_seed','봉인석 전복원+실라리엘'); earned.push('world_tree_seed'); }
  }

  // A급 조건 체크
  if(player.moralAlignment>=90)  { earnHeritageItem('saints_reputation','선한 엔딩'); earned.push('saints_reputation'); }
  if(player.moralAlignment<=-80) { earnHeritageItem('demon_legacy','악의 엔딩'); earned.push('demon_legacy'); }
  if((S.gold||0)>=100000)        { earnHeritageItem('merchant_eye','골드 10만'); earned.push('merchant_eye'); }
  if(restoreCount>=5)            { earnHeritageItem('seal_intuition','봉인석 5개 복원'); earned.push('seal_intuition'); }

  // 전투 통계
  const totalBattles = stats.totalBattles||0;
  if(totalBattles>=50)  { earnHeritageItem('veteran_body','전투 50회'); earned.push('veteran_body'); }
  if(totalBattles>=100) { earnHeritageItem('scarred_soul','전투 100회'); earned.push('scarred_soul'); }

  // 소환수 관련
  const deepDB = typeof loadSummonDepth==='function' ? loadSummonDepth() : {};
  const deathCount = Object.values(deepDB).filter(function(d){ return d.isDead; }).length;
  if(deathCount>=3) { earnHeritageItem('phantom_bond','소환수 죽음 3회'); earned.push('phantom_bond'); }

  // 루프 횟수 마일스톤 체크
  checkLoopMilestones(loop+1);

  // 회차 기록 저장
  const records = loadLoopRecords();
  records.push({
    loop, endingId,
    restoreCount,
    moral: player.moralAlignment||0,
    totalBattles,
    heritage: earned,
    turn: S.msgCount||0,
    at: new Date().toISOString(),
  });
  if(records.length>30) records.splice(0,records.length-30);
  saveLoopRecords(records);

  // NG+ 계승 저장
  if(typeof saveLoopLegacy==='function') saveLoopLegacy(endingId);

  toast('📖 이번 회차 기록 완료. 계승 아이템 '+earned.length+'개 획득', 4000);
}
window.processEndOfLoop = processEndOfLoop;

window.processEndOfLoop = processEndOfLoop;

export function checkLoopMilestones(nextLoop){
  const ms = loadMilestones();
  MILESTONES.forEach(function(m){
    if(nextLoop>=m.loop && !ms.includes(m.id)){
      ms.push(m.id);
      saveMilestones(ms);
      toast(m.icon+' 마일스톤 달성! '+m.name+' — '+m.reward, 6000);
      S._nextInjectedContext = (S._nextInjectedContext||'')
        +'\n\n[👑 루프 마일스톤: '+m.name+']\n'+m.desc+'\n보상: '+m.reward
        +'\n이 마일스톤을 극적으로 서사화하라. 감시자 또는 아르카누스가 언급할 수 있다.';
      if(typeof addTimelineEvent==='function')
        addTimelineEvent('milestone',m.name,{icon:m.icon});
    }
  });
}
window.checkLoopMilestones = checkLoopMilestones;

window.checkLoopMilestones = checkLoopMilestones;
