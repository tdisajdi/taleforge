// [21] processGSBlock 추가 필드 — 신규 시스템 연동
// Auto-extracted from taleforge.html (original section banner preserved above).
import { IDENTITY_ARCHETYPES } from '../data/018-5170번-환생-누적-시스템.js';
import { JOB_SYNERGIES } from '../data/035-NEW-직업-조합-시너지-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { levelUpSoulWeapon } from '../items/218-15-인벤토리-addItem-removeItem.js';
import { loadSkills, saveSkills } from '../job/002-스킬-시스템.js';
import { loadSecrets, saveSecrets } from '../job/010-스킬-강화-시스템.js';
import { loadJobSynergy, saveJobSynergy } from '../job/035-NEW-직업-조합-시너지-시스템.js';
import { loadJobHistory } from '../job/042-직업-시스템-무한-파생-도감.js';
import { useSkill } from '../job/207-4-스킬-시스템.js';
import { changeJob, checkJobUnlock, getJobDef } from '../job/208-5-직업-시스템.js';
import { recordSoulMask } from '../misc/017-4150번-시스템.js';
import { gainEvoEnergy } from '../misc/206-3-진화Evolution-시스템.js';
import { drawFateCard } from '../misc/216-13-운명-카드-시스템.js';
import { discoverLocation } from '../misc/221-19-탐험-discoverLocation-loadExploredLocat.js';
import { addRomancePoint } from '../npc/211-8-로맨스-시스템.js';
import { loadCycleCount, recordSkillUsage } from '../progression/014-환생-누적-시스템-110번.js';
import { recordIdentity } from '../progression/018-5170번-환생-누적-시스템.js';
import { recordAlias, useCausalityManip } from '../progression/019-71100번-환생-누적-시스템.js';
import { addDeificationIntervention } from '../progression/020-101130번-환생-누적-시스템.js';
import { checkAchievements, unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { abandonQuest, completeQuest, failQuest } from '../quest/209-6-퀘스트-완료실패자동체크.js';
import { joinLoopersGuild, rejectLoopersGuild } from '../race/028-악마족-진명-시스템-Demon-True-Name.js';
import { toast } from '../utils.js';
import { changeFactionRep } from '../world/219-17-세력-명성-변경-상태-조회.js';



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_198(){
(function extendProcessGSBlock() {
  const orig = window.processGSBlock || function(gs){ if(typeof window.processGSToAllDBs==='function') window.processGSToAllDBs(gs); };
  window.processGSBlock = function(gs) {
    orig(gs);
    try {
      // 직업 변경 (processGSBlock에서 이미 처리하지 않는 경우만)
      // [CRITICAL BUG FIX] checkJobUnlock 검증 없이 gs.job으로 즉시 직업이 변경돼
      // 메인 전직 시스템(checkJobCondition의 레벨/스탯/행동 조건)을 완전히 우회할
      // 수 있던 보안/밸런스 버그. 검증 통과 시에만 변경하도록 수정.
      if (gs.job && typeof changeJob === 'function') {
        const _unlockOk = (typeof checkJobUnlock !== 'function') || checkJobUnlock(gs.job);
        if (_unlockOk){
          changeJob(gs.job, gs.job_reason||'');
          // 직업 조합 시너지 체크 — 현재 직업 + 과거 이력에 있는 직업
          if(typeof JOB_SYNERGIES!=='undefined' && typeof loadJobHistory==='function' && typeof loadJobSynergy==='function' && typeof saveJobSynergy==='function'){
            try{
              const _hist = (loadJobHistory()||[]).map(h=>h.role||h.job||h.name).filter(Boolean);
              const _curJobName = (typeof getJobDef==='function' ? getJobDef(S.character?.role)?.name : null) || S.character?.role || '';
              const _pastJobs = new Set(_hist);
              const _existingSynergy = loadJobSynergy();
              JOB_SYNERGIES.forEach(syn=>{
                if(syn.jobs.includes(_curJobName) && syn.jobs.some(j=>j!==_curJobName && _pastJobs.has(j))){
                  if(!_existingSynergy.find(s=>s.id===syn.id)){
                    _existingSynergy.push({ id:syn.id, name:syn.name, activatedAt:S.msgCount||0 });
                    toastHTML(`✨ 직업 시너지 발동: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(syn,{size:14}):(syn.icon)} ${esc(syn.name)}`, 4000);
                  }
                }
              });
              saveJobSynergy(_existingSynergy);
            }catch(e){}
          }
          if(typeof recordSoulMask==='function' && S.character?.role){
            recordSoulMask(S.character.role, S.scenario?.id);
          }
        }
        else console.warn('[changeJob] 잠금 조건 미충족으로 직업 변경 차단:', gs.job);
      }
      // 스킬 사용
      if (gs.skill_use && typeof useSkill === 'function') useSkill(gs.skill_use);
      if (gs.skill_use && typeof recordSkillUsage === 'function') recordSkillUsage(gs.skill_use);
      // 신의 개입 (신격화 완료 상태에서만 유효)
      if (gs.divine_intervention && typeof addDeificationIntervention === 'function') {
        addDeificationIntervention(String(gs.divine_intervention).slice(0,200), (typeof loadCycleCount==='function')?loadCycleCount():0);
        if(typeof useCausalityManip==='function') useCausalityManip(String(gs.divine_intervention).slice(0,100));
      }
      // 환생자 길드 접촉 결과
      if (gs.looper_guild === 'join' && typeof joinLoopersGuild === 'function') {
        joinLoopersGuild();
        toast('🌀 환생자 길드에 가입했다', 3500);
      } else if (gs.looper_guild === 'reject' && typeof rejectLoopersGuild === 'function') {
        rejectLoopersGuild();
        toast('🌀 환생자 길드의 제안을 거절했다', 3000);
      }
      // 비밀 발견 / 정체 확립
      if (gs.secret_discovered && typeof saveSecrets === 'function' && typeof loadSecrets === 'function') {
        const secList = loadSecrets();
        secList.push({ text: String(gs.secret_discovered).slice(0,200), turn: S.msgCount||0 });
        saveSecrets(secList);
      }
      if (gs.identity_established && typeof recordIdentity === 'function' && typeof IDENTITY_ARCHETYPES!=='undefined') {
        const _idText = String(gs.identity_established);
        const _idKwMap = {noble:['귀족','영주'],merchant:['상인','장사꾼'],scholar:['학자','현자'],soldier:['병사','전사'],priest:['사제','성직자'],assassin:['암살자','자객'],wanderer:['방랑자','떠돌이'],bard:['음유시인','악사']};
        for(const [atype,kws] of Object.entries(_idKwMap)){
          if(kws.some(kw=>_idText.includes(kw))){ recordIdentity(atype, _idText.slice(0,50), S.scenario?.id); break; }
        }
        if(typeof recordAlias==='function') recordAlias(_idText.slice(0,50), '정체 확립', S.scenario?.id);
      }
      // 로맨스
      if (gs.romance && typeof gs.romance === 'object') {
        Object.entries(gs.romance).forEach(([npc, delta]) => { try { addRomancePoint(npc, Number(delta)||0); } catch(e2) {} });
      }
      // 세력 명성
      if (gs.faction_rep && typeof gs.faction_rep === 'object') {
        Object.entries(gs.faction_rep).forEach(([fac, delta]) => { try { changeFactionRep(fac, Number(delta)||0); } catch(e2) {} });
      }
      // 영혼 무기 경험치
      if (gs.soul_weapon_exp && typeof levelUpSoulWeapon === 'function') levelUpSoulWeapon(Number(gs.soul_weapon_exp)||5);
      // 운명 카드
      if (gs.draw_fate_card && typeof drawFateCard === 'function') drawFateCard();
      // 장소 발견
      if (gs.discover_location && typeof discoverLocation === 'function') discoverLocation(gs.discover_location, gs.discover_location);
      // 진화 에너지
      if (gs.evo_energy && typeof gainEvoEnergy === 'function') gainEvoEnergy(Number(gs.evo_energy)||0, '이벤트');
      // 퀘스트 완료 — checkQuestCompletion과 중복 방지를 위해 GS 명시 완료만 처리
      if (Array.isArray(gs.q_done)) gs.q_done.forEach(id => { try { completeQuest(id); } catch(e2) {} });
      // [버그 수정] failQuest/abandonQuest는 완성돼 있었지만 q_done과
      // 대칭되는 GS 필드가 아예 없어(q_fail/q_abandon 자체가 존재하지
      // 않았음) AI가 이를 트리거할 방법이 없었다 — 한 번 수락한 퀘스트는
      // 구조적으로 "완료"만 가능하고 "실패"나 "포기"는 절대 일어날 수
      // 없던 문제. q_done과 동일한 형태(id 배열)의 필드를 대칭적으로
      // 추가한다.
      if (Array.isArray(gs.q_fail)) gs.q_fail.forEach(id => { try { failQuest(id, gs.q_fail_reason||''); } catch(e2) {} });
      if (Array.isArray(gs.q_abandon)) gs.q_abandon.forEach(id => { try { abandonQuest(id); } catch(e2) {} });
      // 스킬 획득
      // [버그 수정] 'tf-skills'(존재하지 않는 키) → saveSkills()로 교정.
      if (gs.skill) {
        try {
          const skills = typeof loadSkills === 'function' ? loadSkills() : {};
          if (!skills[gs.skill]) {
            skills[gs.skill] = { level:1, obtainedAt:S?.msgCount||0 };
            if (typeof saveSkills === 'function') saveSkills(skills);
            toast(`✨ 스킬 습득: ${gs.skill}`, 2500);
            unlockAchievement('first_skill');
          }
        } catch(e2) {}
      }
      // [BUG20 FIX] checkAchievements는 여기 한 곳에서만 호출
      try { if(typeof checkAchievements === 'function') checkAchievements(); } catch(e2) {}
    } catch(e) {}
  };
})();
}

