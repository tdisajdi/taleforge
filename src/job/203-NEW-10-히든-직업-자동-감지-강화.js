// ★ NEW 10: 히든 직업 자동 감지 강화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadCycleStats } from '../misc/016-2130번-시스템.js';
import { loadLanguageMemories } from '../misc/017-4150번-시스템.js';
import { loadCrafted } from '../misc/075-파트2-C-크래프팅-시스템.js';
import { getKarmaEndingCounts } from '../misc/054-이동수단-시스템.js';
import { loadNetwork } from '../misc/253-SVG-타일-렌더링-작물-단계별-애니메이션.js';
import { _loadPStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { loadTimeTokens, loadUndyingGauge } from '../progression/018-5170번-환생-누적-시스템.js';
import { loadCausality, loadDimensionMap, loadRankData, loadTemple, loadVillainInherit } from '../progression/019-71100번-환생-누적-시스템.js';
import { loadCelestialScale, loadLoopAwareness } from '../progression/020-101130번-환생-누적-시스템.js';
import { loadAchievements, unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { getSealedGodStatus, loadDeathEye, loadTwinSoul } from '../race/028-악마족-진명-시스템-Demon-True-Name.js';
import { toast } from '../utils.js';
import { checkAllHiddenJobUnlocks } from './029-숨겨진-직업-시스템.js';

export function _buildHiddenJobGameData(){
  const st = typeof _loadPStats==='function' ? _loadPStats() : {};
  const _villainInherit = typeof loadVillainInherit==='function' ? loadVillainInherit() : {inherited:[]};
  const _sealedGod = typeof getSealedGodStatus==='function' ? getSealedGodStatus() : null;
  return {
    stats:         S.stats||{},
    msgCount:      S.msgCount||0,
    deathCount:    st.deathCount||0,
    battleWins:    st.battleWins||0,
    lowHpWins:     st.lowHpWins||0, // quest/086의 updateStats('lowHpWins',1)가 HP 10% 이하 승리마다 누적
    critSuccessCount: st.critSuccessCount||0,
    skillUseCount: st.skillUseCount||0,
    stealthEndings: st.stealthEndings||0,
    cycle:         typeof loadCycleCount==='function' ? loadCycleCount() : 0,
    character:     S.character||{},
    titles:        S.titles||[],
    achievements:  loadAchievements()||{},
    inventory:     S.inventory||[],
    npcs:          S.npcs||[],
    currentRole:      S.character?.role || S.character?.jobId || "",
    karmaScore:       S.stats?.krma ?? 50,
    craftEvents:      (typeof loadCrafted==='function') ? (loadCrafted()||[]).length : 0,
    loopAwarenessLevel: (typeof loadLoopAwareness==='function') ? (loadLoopAwareness().level||0) : 0,
    dimensionPins:    (typeof loadDimensionMap==='function') ? (loadDimensionMap().pins||[]).length : 0,
    villainInheritCount: (_villainInherit.inherited||[]).length,
    timeTokenUsed:    (typeof loadTimeTokens==='function') ? (loadTimeTokens().used||0) : 0,
    pastLanguageUnlocked: (typeof loadLanguageMemories==='function') ? (loadLanguageMemories()||[]).length > 0 : false,
    twinSoulConnected: (typeof loadTwinSoul==='function') ? !!loadTwinSoul()?.connected : false,
    totalDeaths:      (typeof loadCycleStats==='function') ? (loadCycleStats().totalDeaths||0) : 0,
    deathEyeUnlocked: (typeof loadDeathEye==='function') ? !!loadDeathEye().unlocked : false,
    sealedGodComplete: !!_sealedGod?.released,
    darkActs:         (typeof loadCelestialScale==='function') ? Object.values(loadCelestialScale().darkActs||{}).reduce((a,b)=>a+(b||0),0) : 0,
    causalityUnlocked: (typeof loadCausality==='function') ? ((loadCausality()?.uses||0) > 0) : false,
    // [19차 감사 FIX] 아래 5개 필드는 job/029의 checkHiddenJobUnlock()이
    // unlockCondition에서 실제로 참조하는데, 여기서 한 번도 채워준 적이
    // 없어 항상 기본값(0/false)이라 soul_reaper/myth_hero/void_walker/
    // reincarnation_master 4개 히든 직업이 자동 감지로는 영원히 해금될
    // 수 없었다. 각 값을 담당하는 이미 살아있는 저장소에서 그대로
    // 끌어와 연결한다(새 추적 시스템을 만들지 않음).
    npcDeathCount:    st.npcDeathWitnessed||0, // ai-prompt/148의 updateStats('npcDeathWitnessed',1)가 이미 st에 누적 중
    bardFame:         (typeof loadNetwork==='function' && loadNetwork()?.type==='bard') ? (loadNetwork().fame||0) : 0,
    templeLevel:      (typeof loadTemple==='function') ? (loadTemple().level||0) : 0, // growFaith()가 매턴 갱신하는 실제 신전 레벨
    undyingMaxed:     (typeof loadUndyingGauge==='function') ? (loadUndyingGauge().gauge >= loadUndyingGauge().maxGauge) : false,
    reincarnationRank:(typeof loadRankData==='function') ? (loadRankData().rank||0) : 0,
    // [20차 감사 FIX] pureKarmaEndings/evilKarmaEndings는 job/029의 여러
    // 히든 직업(오라클·업보 화신·혼돈의 화신·속박 해방자 등)이
    // unlockCondition에서 참조하는데, 이 필드 자체를 어디서도 채워준 적이
    // 없어 항상 기본값 0이라 그 직업들이 자동 감지로는 영원히 해금될 수
    // 없었다. misc/054의 unlockEnding()이 이제 엔딩 달성 시점의 카르마를
    // 함께 기록하므로, 그 기록을 집계하는 getKarmaEndingCounts()를 그대로
    // 연결한다(이 수정 이전에 달성한 엔딩은 karma 기록이 없어 집계에서
    // 제외됨 — 소급 적용 불가).
    ...(typeof getKarmaEndingCounts==='function' ? getKarmaEndingCounts() : { pureKarmaEndings:0, evilKarmaEndings:0 }),
  };
}
window._buildHiddenJobGameData = _buildHiddenJobGameData;

window._buildHiddenJobGameData = _buildHiddenJobGameData;

export function checkAllHiddenJobsAuto(){
  if(typeof checkAllHiddenJobUnlocks!=='function') return;
  try{
    const gameData = _buildHiddenJobGameData();
    const newJobs = checkAllHiddenJobUnlocks(gameData);
    if(newJobs && newJobs.length > 0){
      newJobs.forEach(job=>{
        toastHTML(`🔓 히든 직업 해금! [${typeof getEntityIconHTML==='function'?getEntityIconHTML(job,{size:14}):(job.icon)} ${esc(job.name)}] — ${esc(job.hint||'')}`, 4000);
        unlockAchievement('hidden_job_unlock');
      });
    }
  }catch(e){ console.log('checkAllHiddenJobsAuto error:', e); }
}
window.checkAllHiddenJobsAuto = checkAllHiddenJobsAuto;

window.checkAllHiddenJobsAuto = checkAllHiddenJobsAuto;
