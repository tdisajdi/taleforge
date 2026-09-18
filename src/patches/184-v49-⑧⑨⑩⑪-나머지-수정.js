// [v49 ⑧⑨⑩⑪] 나머지 수정
// Auto-extracted from taleforge.html (original section banner preserved above).
import { checkWorldEventTriggers, fireWorldEvent } from '../ai-prompt/148-⑨-GS-DB-자동-파싱-모든-GS-필드-처리.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { unlockForbiddenSkill } from '../misc/015-시스템-1120.js';
import { recordCurseLineage, recordDivineContract, recordLightningImprint, recordMythChapter, recordSin, recordTimeEcho } from '../misc/017-4150번-시스템.js';
import { recordChildhoodTrauma, sealMemory } from '../progression/019-71100번-환생-누적-시스템.js';
import { initDemonAllSystems } from '../race/028-악마족-진명-시스템-Demon-True-Name.js';
import { loadCabalState, saveCabalState } from '../religion/061-볼린-드워프-기계-사제-프로필-패치-v40.js';
import { loadSealRestore } from '../ui/155-⑭-메모리-패널-UI.js';
import { lsSet, toast } from '../utils.js';

(function fixStatusEffectsKeyConflict() {
  try {
    const raw = localStorage.getItem('tf-status-effects');
    if (!raw) return;
    const data = JSON.parse(raw);
    // 배열이면 효과 목록, 객체면 상태 맵 — 통합
    if (Array.isArray(data)) {
      // 배열 형식 → 객체 형식으로 변환
      const obj = {};
      data.forEach(e => { if(e.id) obj[e.id] = e; });
      localStorage.setItem('tf-status-effects', JSON.stringify(obj));
    }
  } catch(e) {}
})();

(function hookGSFlagChecks() {
  const origProcessGSToAllDBs = window.processGSToAllDBs;
  window.processGSToAllDBs = function(gs) {
    origProcessGSToAllDBs(gs);
    // 플래그 세팅 후 연관 로직 실행
    if (!Array.isArray(gs.flags)) return;
    gs.flags.forEach(flag => {
      try {
        // 봉인석 복원
        if (flag.startsWith('seal_') && flag.endsWith('_restored')) {
          const sealId = flag.replace('_restored','');
          const sr = typeof loadSealRestore==='function' ? loadSealRestore() : {};
          sr[sealId] = true;
          if (typeof lsSet==='function') lsSet('tf-seal-restore', JSON.stringify(sr));
          toast('🔮 봉인석이 복원됐다!', 3000);
        }
        // 봉인석 파괴
        if (flag.startsWith('seal_') && flag.endsWith('_broken')) {
          const sealId = flag.replace('_broken','');
          const sr = typeof loadSealRestore==='function' ? loadSealRestore() : {};
          sr[sealId] = false;
          if (typeof lsSet==='function') lsSet('tf-seal-restore', JSON.stringify(sr));
          toast('💥 봉인석이 파괴됐다!', 3500);
          setTimeout(checkWorldEventTriggers, 300);
        }
        // [BUG FIX] 결사 간부 포섭/이탈 — 이전엔 토스트만 뜨고 실제
        // cabalState에 저장하는 코드가 없어서, getCabalBLSContext()가
        // 항상 "적대" 상태로만 표시했다(saveCabalState가 정의는 됐지만
        // 한 번도 호출되지 않고 있었음). 또한 cabal_kross는 플래그명이
        // 'cabal_kross_turned'인데 getCabalBLSContext가 읽는 키는
        // 'cabal_kross_defected'라서 이름 자체가 불일치했다 — 저장 시
        // getCabalBLSContext가 실제로 읽는 키 이름('_defected')으로
        // 통일해서 저장한다.
        if (flag === 'cabal_lira_defected'){
          toast('🗡️ 리라 블레이드빌이 결사를 이탈했다', 3000);
          try{ const cs = loadCabalState(); cs['cabal_lira_defected'] = true; saveCabalState(cs); }catch(e){}
        }
        if (flag === 'cabal_kross_turned'){
          toast('⚔️ 크로스가 결사를 등졌다', 3000);
          try{ const cs = loadCabalState(); cs['cabal_kross_defected'] = true; saveCabalState(cs); }catch(e){}
        }
        if (flag === 'cabal_sera_awakened'){
          toast('🔮 세라 에코가 각성했다', 3000);
          try{ const cs = loadCabalState(); cs['cabal_sera_defected'] = true; saveCabalState(cs); }catch(e){}
        }
        if (flag === 'cabal_vorn_bought'){
          toast('💰 보른 더스크가 협력한다', 3000);
          try{ const cs = loadCabalState(); cs['cabal_vorn_defected'] = true; saveCabalState(cs); }catch(e){}
        }
        // 메인퀘스트 완료 → 세계 이벤트
        if (flag === 'mq1_done') setTimeout(()=>checkWorldEventTriggers(), 500);
        if (flag === 'mq3_done') setTimeout(()=>fireWorldEvent('we_dragon_mad'), 800);
        if (flag === 'mq5_done') setTimeout(()=>fireWorldEvent('we_gate_tremble'), 800);
        // 감시자 관련
        if (flag === 'watcher_contacted') toast('👁️ 감시자와 접촉했다...', 3000);
        if (flag === 'watcher_peace')     toast('👁️ 감시자와 화해했다', 3000);
      } catch(e) {}
    });
  };
  window.processGSToAllDBs = window.processGSToAllDBs;
})();

(function hookLoreTriggerFlags() {
  const origProcessGSToAllDBs = window.processGSToAllDBs;
  window.processGSToAllDBs = function(gs) {
    origProcessGSToAllDBs(gs);
    if (!Array.isArray(gs.flags)) return;
    const sid = S.scenario?.id;
    gs.flags.forEach(flag => {
      try {
        // B8: 금지 스킬 해금 조건 2종
        if (flag === 'fs_sacrifice_ally' && typeof unlockForbiddenSkill==='function') unlockForbiddenSkill('sacrifice_ally');
        if (flag === 'fs_perfect_clear' && typeof unlockForbiddenSkill==='function') unlockForbiddenSkill('perfect_clear');
        // B14: 번개 각인 5종 (perfect_strike는 크리티컬 성공 시 이미 자동 기록됨)
        if (flag.startsWith('imprint_') && typeof recordLightningImprint==='function') {
          recordLightningImprint(flag.slice('imprint_'.length), sid);
        }
        // B16: 신의 계약 4종 (god는 신의 개입 시 이미 자동 기록됨)
        if (flag.startsWith('contract_') && typeof recordDivineContract==='function') {
          recordDivineContract(flag.slice('contract_'.length), 'AI 서사에서 계약 성립', sid);
        }
        // B17: 죄와 속죄 5종 (betrayal은 이미 자동 기록됨)
        if (flag.startsWith('sin_') && typeof recordSin==='function') {
          recordSin(flag.slice('sin_'.length), null, sid);
        }
        // B18: 시간의 메아리 5종 (mercy는 이미 자동 기록됨)
        if (flag.startsWith('echo_') && typeof recordTimeEcho==='function') {
          recordTimeEcho(flag.slice('echo_'.length), 'AI 서사 판단', sid);
        }
        // B19: 신화 챕터 4종 (sacrifice/ascension은 엔딩 처리 시 이미 자동 기록됨)
        if (flag.startsWith('myth_') && typeof recordMythChapter==='function') {
          recordMythChapter(flag.slice('myth_'.length), S.character?.name, sid);
        }
        // B20: 저주의 계보 4종 (marked_by_death는 저주사 감지 시 이미 자동 기록됨)
        if (flag.startsWith('curse_') && typeof recordCurseLineage==='function') {
          recordCurseLineage(flag.slice('curse_'.length), 'AI 서사에서 저주 성립', sid);
        }
        // B23: 어린 시절 트라우마 5종 (betrayed는 이미 자동 기록됨)
        if (flag.startsWith('trauma_') && typeof recordChildhoodTrauma==='function') {
          recordChildhoodTrauma(flag.slice('trauma_'.length), sid);
        }
        // B25: 봉인된 기억 방 4종 (betrayal_pain은 이미 자동 기록됨)
        if (flag.startsWith('sealedmem_') && typeof sealMemory==='function') {
          sealMemory(flag.slice('sealedmem_'.length), sid);
        }
        // B71: 히든 업적 트래킹 4종 — 서사적 판단이 필요해 기계적으로
        // 감지할 수 없는 사건들이라 AI의 명시적 flags 보고에 의존한다.
        if (flag === 'faith_refuse' && typeof window.updateStats==='function') window.updateStats('faithRefuseCount', 1);
        if (flag === 'charmed' && typeof window.updateStats==='function') window.updateStats('charmCount', 1);
        if (flag === 'god_kill' && typeof window.updateStats==='function') window.updateStats('godKillCount', 1);
        if (flag === 'told_lie' && typeof window.updateStats==='function') window.updateStats('lieCount', 1);
      } catch(e) {}
    });
  };
  window.processGSToAllDBs = window.processGSToAllDBs;
})();

(function() {
  if (typeof initDemonAllSystems === 'function') {
    const char = typeof S !== 'undefined' ? S.character : null;
    if (char && char.race && /악마|demon/i.test(char.race)) {
      setTimeout(initDemonAllSystems, 2000);
    }
  }
})();

(function addMissingGSFieldsToRule() {
  const tryHook = () => {
    const fn = typeof window.buildLightSystem === 'function' ? 'buildLightSystem' : null;
    if (!fn) { setTimeout(tryHook, 3000); return; }
    if (window._v49GsRuleHooked) return;
    window._v49GsRuleHooked = true;
    const _orig = window[fn];
    window[fn] = function() {
      const base = _orig.apply(this, arguments);
      if (typeof base !== 'string') return base;
      const extra = `\n[GS 추가 필드 안내] 다음 필드도 사용 가능:\n` +
        `materials: {"재료ID":개수} — 재료 획득. 채집/채굴/제작 부산물/탐색 발견 시 사용. ` +
        `사용 가능한 재료ID: iron_ore(철광석), magic_stone(마석), herb_bundle(약초), dragon_scale(드래곤 비늘), ` +
        `monster_bone(몬스터 뼈), rare_gem(희귀 보석), void_shard(공허 파편), silver_ore(은광석), ` +
        `star_crystal(별의 수정), shadow_silk(그림자 비단), titan_bone(티탄 뼈), ancient_wood(고대 나무), ` +
        `moonwater(달빛 물), brimstone(유황석), philosophers_ore(현자 광석)\n` +
        `convert_npc: "NPC명" — NPC 진영 전환\n` +
        `location_visit: {name:"장소명",type:"town"} — 장소 방문 기록\n` +
        `npc_dialogue: [{name:"NPC명",line:"대사",emotion:"감정",context:"맥락"}] — NPC 대사 저장\n` +
        `pm_npc: [{name:"NPC명",emotion:"감정",topic:"주제",favor:"호의",grudge:"원한"}] — NPC 상태 상세\n` +
        `pm_quest: [{title:"퀘스트명",clue:"단서",moment:"결정적 순간"}] — 퀘스트 상세\n` +
        `pm_personal: {injury:"부상",trauma:"트라우마",grudge:"원한",mental_corruption:true,meta_knowledge:"발견한 비밀",skill:"습득 스킬"} — 플레이어 상태\n` +
        `events_add: [{title:"사건명",desc:"설명",category:"world",impact:3}] — 세계 사건 기록\n` +
        `religion_share_delta: {temple:5,solar:-3} — 종교 세력 변화\n` +
        `summon_add/summon_damage/summon_evolve — 소환수 관련`;
      return base + extra;
    };
  };
  setTimeout(tryHook, 5000);
})();

console.log('[TaleForge v50] 미구현 시스템 21종 전면 구현 완료 ✓');

console.log('① processGSBlock 정의 ② GS 8필드(stats/gold/items/job/rank/skill/damage/death)');

console.log('③ addButterflyEffect 자동 연결 ④ addCausality/addGrudge/addMentalCorruption/awakenLoopAwareness');

console.log('⑤ fireWorldEvent+자동트리거 ⑥ onclick 9개 함수 ⑦ 자동 레벨업 ⑧ 배신 기록');

console.log('⑨ 키충돌 수정 ⑩ GS 플래그 체크 ⑪ initDemonAllSystems ⑫ AI 누락 필드 안내');
