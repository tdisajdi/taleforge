// ⑭ 메모리 패널 UI
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { clearDungeonState, loadDungeonState, saveDungeonState } from '../combat/256-회차가-높을수록-보스가-더-빨리-더-강하게-스폰됨.js';
import { CLEAR_ITEMS } from '../data/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { KINGDOM_TYPES } from '../data/028-악마족-진명-시스템-Demon-True-Name.js';
import { LOCATION_DATA, SECRET_ENDINGS } from '../data/042-직업-시스템-무한-파생-도감.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { SUMMON_CATEGORY } from '../data/089-칭호-시스템-완전판-1개-활성화-스탯-효과-적용.js';
import { AFTER_BATTLE_OPTIONS, ALL_STORE_KEYS, BG_TRIGGER_KEYWORDS, BOSS_PHASE_DEFINITIONS, ENDING_DEFINITIONS, GENERIC_BOSS_PHASES, NPC_OFFSCREEN_ACTIONS, SEAL_DEFINITIONS, SUMMON_SYNERGIES, TERRAIN_EFFECTS } from '../data/155-⑭-메모리-패널-UI.js';
import { ACHIEVEMENT_DEFS } from '../data/187-2-업적-시스템.js';
import { TERRAIN_EFFECTS_BATTLE } from '../data/245-①-전투-지형-효과.js';
import { checkSaveVersion, saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { loadClearRewards, saveClearRewards } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadHighlights, loadMemory } from '../job/010-스킬-강화-시스템.js';
import { getNPCHeroBLSContext, getWorldBackgroundPrompt, loadJobActions, tickNPCHero } from '../job/042-직업-시스템-무한-파생-도감.js';
import { loadAtmosphere, loadNPCs, loadSession } from '../misc/001-block0-preamble.js';
import { recordClearQuality, unlockForbiddenSkill } from '../misc/015-시스템-1120.js';
import { getActiveGrudges, growWorldTree, recordPastTheme, recordSummonLegacy } from '../misc/016-2130번-시스템.js';
import { growDawn, recordMythChapter } from '../misc/017-4150번-시스템.js';
import { loadCycleGoal } from '../misc/030-NEW-동적-클리어-목표-시스템.js';
import { RESISTABLE_EFFECTS, calcPstxResist, checkPartyLeave, loadLocations, loadParty, saveParty } from '../misc/054-이동수단-시스템.js';
import { addEvent } from '../misc/142-③-사건-DB-태그-인덱스-전문-검색.js';
import { loadPlayerDB, updatePlayerDB } from '../misc/144-⑤-플레이어-상태-DB.js';
import { updateChallenge } from '../misc/164-도전-과제-달성률-시스템.js';
import { loadEvolution } from '../misc/206-3-진화Evolution-시스템.js';
import { renderMemoryEnhanced } from '../misc/277-PM-수동-편집-헬퍼-함수.js';
import { buildNpcNetwork } from '../npc/067-③-NPC-관계망-시스템.js';
import { loadNpcDB, upsertNpc } from '../npc/140-①-NPC-DB-가장-세분화.js';
import { determineFame, loadCycleCount, saveFameLegacy, v36_getReincarnationCount } from '../progression/014-환생-누적-시스템-110번.js';
import { earnTimeToken, recordAchievementRate, recordSurvivorCompanion } from '../progression/018-5170번-환생-누적-시스템.js';
import { addDimensionPin, addHighlightReel, earnSoulCrystal, updateRank, updateSakuraProgress } from '../progression/019-71100번-환생-누적-시스템.js';
import { tickEraRecord, updateDeification } from '../progression/020-101130번-환생-누적-시스템.js';
import { recordAnnalEntry } from '../progression/037-NEW-회차-연보-엔딩-히스토리-갤러리.js';
import { renderSummons } from '../progression/089-칭호-시스템-완전판-1개-활성화-스탯-효과-적용.js';
import { loadAchievements } from '../progression/187-2-업적-시스템.js';
import { checkCatastropheEvent, getWorldCrisisLevel, grantTitle, renderMsgs, sendMsg, tickCatastropheState } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { upsertQuest } from '../quest/141-②-퀘스트-DB.js';
import { generateAILocation, loadAILocations, saveAILocations } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { foundKingdom, setGodAlignment } from '../race/028-악마족-진명-시스템-Demon-True-Name.js';
import { checkDemesneUnlockTrigger } from '../race/260-수인족-패널-렌더.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { loadGSFlags, loadWorldDB, saveGSFlags, updateWorldDB } from '../world/145-⑥-세계-상태-DB.js';
import { loadMilestones } from '../world/165-저장소.js';
import { tickThrallDomainWSI, tickThrallLoyalty } from './026-renderHumanAwakeningPanel-완전-재정의.js';

(function injectMemPanelDOM(){
  const tryInject=function(){
    if(window._memDB2DOMInjected) return;
    if(!document.body){ setTimeout(tryInject,500); return; }
    if(!document.getElementById('pb-memory')){
      const ref=document.getElementById('p-religion')||document.querySelector('.panel-ov');
      if(!ref){ setTimeout(tryInject,1000); return; }
      const div=document.createElement('div');
      div.className='panel-ov'; div.id='p-memory';
      div.innerHTML='<div class="panel"><div class="p-hdr"><span class="p-title">🧠 메모리</span><button class="p-close" onclick="closeP(\'memory\')">✕</button></div><div class="p-body scrollable" id="pb-memory"></div></div>';
      ref.parentNode.insertBefore(div,ref.nextSibling);
    }
    const relBtn=document.querySelector('.grp-sub-btn[onclick*="religion"]');
    if(relBtn&&!document.querySelector('.grp-sub-btn[onclick*="memory"]')){
      const btn=document.createElement('button');
      btn.className='grp-sub-btn';
      btn.setAttribute('onclick',"openP('memory');closeGrp()");
      btn.innerHTML='🧠 메모리';
      relBtn.parentNode.insertBefore(btn,relBtn.nextSibling);
    }
    window._memDB2DOMInjected=true;
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',tryInject);
  else setTimeout(tryInject,1600);
})();

(function hookMemOpenP(){
  const t=function(){
    if(window._memDB2OpenHooked) return;
    if(typeof window.openP!=='function'){ setTimeout(t,1500); return; }
    window._memDB2OpenHooked=true;
    const _o=window.openP;
    window.openP=function(name,...args){ const r=_o.call(this,name,...args); if(name==='memory' && typeof window.renderMemoryEnhanced==='function') setTimeout(window.renderMemoryEnhanced,100); return r; };
  };
  setTimeout(t,2200);
})();

console.log('[TaleForge] 외부 메모리 DB + BLS 최적화 + 자동 요약 압축 로드 완료 ✓');

export const EXPORT_VERSION = '3.0';

export function exportAllData(){
  const data = {
    _meta: {
      version:     EXPORT_VERSION,
      exportedAt:  new Date().toISOString(),
      gameTitle:   'TaleForge',
      character:   S.character ? {
        name: S.character.name,
        race: S.character.race,
        job:  S.character.role || S.character.job,
      } : null,
      msgCount:    S.msgCount || 0,
      loopCount:   typeof loadCycleCount==='function' ? loadCycleCount() : 0,
    },
    stores: {},
    messages:     S.messages     || [],   // 전체 대화 히스토리
    fullMessages: S.fullMessages || [],   // 전체 원문 히스토리
  };

  // 모든 키 수집
  ALL_STORE_KEYS.forEach(key=>{
    try{
      const val = lsGet(key);
      if(val) data.stores[key] = JSON.parse(val);
    }catch(e){}
  });

  // localStorage 전체 스캔 (위 목록 외 taleforge- / tf- 키도 수집)
  // ※ API 키는 보안상 제외
  const API_KEY_PATTERNS = ['apikey','api-key','api_key','gemini-key','openai-key','taleforge-apikeys','taleforge-keyindex'];
  try{
    for(let i=0;i<localStorage.length;i++){
      const key = localStorage.key(i);
      if(!key) continue;
      const keyLower = key.toLowerCase();
      // API 키 관련 키는 절대 내보내지 않음
      if(API_KEY_PATTERNS.some(p=>keyLower.includes(p))) continue;
      if((key.startsWith('taleforge-')||key.startsWith('tf-'))&&!data.stores[key]){
        try{ data.stores[key]=JSON.parse(localStorage.getItem(key)||'null'); }catch(e){}
      }
    }
  }catch(e){}

  const json    = JSON.stringify(data, null, 2);
  const blob    = new Blob([json], { type:'application/json' });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  const charName= (S.character&&S.character.name)||'unknown';
  const date    = new Date().toISOString().slice(0,10);
  a.href        = url;
  a.download    = 'taleforge_'+charName+'_'+date+'.json';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 3000);
  const msgCount=(S.messages||[]).length;
  toast('💾 저장 완료! ('+(json.length/1024).toFixed(1)+'KB · 대화 '+msgCount+'개 포함)', 3500);
}
window.exportAllData = exportAllData;

window.exportAllData = exportAllData;

export function importAllData(file){
  // [버그 수정] template.html의 "✦ 봉인 해제" 버튼은 파일 인자 없이
  // importAllData()를 그대로 호출하는데, 여기서 곧장 return해버려서
  // 버튼을 눌러도 파일 선택창조차 열리지 않았다. 게다가 실제 파일을
  // 넘겨받아야 할 <input id="import-file-input">의 onchange가 호출하는
  // handleImportFile 함수 자체가 코드베이스 어디에도 정의돼 있지 않아,
  // 설령 파일을 골랐어도 ReferenceError로 조용히(콘솔에만) 실패했을
  // 것이다 — "가져오기 기능이 통째로 죽어있던" 경우. 파일 없이 호출된
  // 경우는 숨겨진 파일 선택창을 여는 것으로, handleImportFile은 그
  // 선택창의 onchange를 받아 실제 파일로 이 함수를 다시 호출하는
  // 다리 역할로 새로 만든다.
  if(!file){
    const inp = document.getElementById('import-file-input');
    if(inp) inp.click();
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const data = JSON.parse(e.target.result);
      if(!data._meta || !data.stores){
        toast('⚠️ 올바른 TaleForge 저장 파일이 아닙니다', 3000);
        return;
      }

      // 버전 확인
      const ver = data._meta.version||'1.0';
      const confirmed = confirm(
        'TaleForge 저장 파일을 불러옵니다.\n\n'
        +'캐릭터: '+(data._meta.character?data._meta.character.name:'알 수 없음')+'\n'
        +'저장 시각: '+(data._meta.exportedAt||'알 수 없음')+'\n'
        +'진행 턴: '+(data._meta.msgCount||0)+'턴\n'
        +'대화 기록: '+(data.messages&&data.messages.length||0)+'개\n'
        +'버전: '+ver+'\n\n'
        +'현재 진행 중인 데이터가 덮어씌워집니다. 계속하시겠습니까?'
      );
      if(!confirmed) return;

      // 모든 스토어 복원 (API 키 관련은 절대 덮어쓰지 않음)
      const _API_SKIP = ['apikey','api-key','api_key','gemini-key','openai-key','taleforge-apikeys','taleforge-keyindex'];
      let count = 0;
      Object.entries(data.stores).forEach(([key, val])=>{
        try{
          const kl = key.toLowerCase();
          if(_API_SKIP.some(p=>kl.includes(p))) return; // API 키 건너뜀
          if(val!=null){ lsSet(key, JSON.stringify(val)); count++; }
        }catch(e){ console.warn('import key failed:',key,e); }
      });

      // 대화 복원 (전체)
      if(data.messages&&data.messages.length){
        S.messages     = data.messages;
        S.fullMessages = data.fullMessages && data.fullMessages.length
                         ? data.fullMessages
                         : data.messages;
      }

      // 세션 복원 후 화면 갱신
      toast('📂 불러오기 완료! ('+count+'개 데이터)', 3000);
      setTimeout(()=>{
        try{
          // 패널들 갱신
          if(typeof renderSummons==='function')     renderSummons();
          if(typeof window.renderReligionPanel==='function') window.renderReligionPanel();
          if(typeof renderMemoryEnhanced==='function')  renderMemoryEnhanced();
          if(typeof renderMsgs==='function')         renderMsgs();
          if(typeof window.updateHeader==='function')       window.updateHeader();
          // 세션에서 캐릭터 복원
          if(typeof loadSession==='function'){
            const sess = loadSession();
            if(sess&&sess.character){
              S.character  = sess.character;
              S.stats      = sess.stats || S.stats;
              S.gold       = sess.gold  || S.gold;
              S.inventory  = sess.inventory || S.inventory;
              S.msgCount   = sess.msgCount  || S.msgCount;
              if(typeof window.updateHeader==='function') window.updateHeader();
            }
          }
          toast('✅ 데이터 복원 완료', 2500);
        }catch(re){ console.warn('restore err',re); }
      }, 500);

    }catch(err){
      toast('⚠️ 불러오기 실패: '+err.message, 4000);
      console.error('[Import]', err);
    }
  };
  reader.readAsText(file);
}
window.importAllData = importAllData;

window.importAllData = importAllData;

// [버그 수정] template.html의 <input id="import-file-input" onchange=
// "handleImportFile(event)">가 호출하는 이 함수 자체가 없었다 — 선택창을
// 열 방법조차 없던 것과 별개로, 설령 열렸어도 이 다리 함수가 없어 파일을
// 골라도 아무 일도 일어나지 않았을 것이다. 선택된 파일을 실제 처리
// 함수(importAllData)로 넘겨준다.
export function handleImportFile(event){
  const file = event?.target?.files?.[0];
  if(file) importAllData(file);
  if(event?.target) event.target.value = ''; // 같은 파일을 다시 선택해도 onchange가 또 발생하도록 초기화
}
window.handleImportFile = handleImportFile;

export function exportDB(dbName){
  const keyMap = {
    npc:      'tf-db-npc',
    quest:    'tf-db-quest',
    event:    'tf-db-event',
    player:   'tf-db-player',
    world:    'tf-db-world',
    summon:   'tf-summons-v3',
    religion: 'tf-religion-state',
    summary:  'tf-db-summary',
  };
  const key  = keyMap[dbName] || dbName;
  const val  = lsGet(key);
  if(!val){ toast('⚠️ 해당 DB가 비어있습니다', 2000); return; }
  const json = JSON.stringify({ _meta:{ db:dbName, exportedAt:new Date().toISOString() }, data:JSON.parse(val) }, null, 2);
  const blob = new Blob([json],{type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href=url; a.download='taleforge_'+dbName+'_'+new Date().toISOString().slice(0,10)+'.json'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
  toast('💾 '+dbName+' DB 내보내기 완료 ('+(json.length/1024).toFixed(1)+'KB)',2500);
}
window.exportDB = exportDB;

window.exportDB = exportDB;

(function injectSavePanelDOM(){
  const tryInject=function(){
    if(window._savePanelInjected) return;
    if(!document.body){ setTimeout(tryInject,500); return; }
    if(!document.getElementById('pb-save')){
      const ref=document.getElementById('p-memory')||document.getElementById('p-religion')||document.querySelector('.panel-ov');
      if(!ref){ setTimeout(tryInject,1000); return; }
      const div=document.createElement('div');
      div.className='panel-ov'; div.id='p-save';
      div.innerHTML='<div class="panel"><div class="p-hdr"><span class="p-title">💾 저장</span><button class="p-close" onclick="closeP(\'save\')">✕</button></div><div class="p-body scrollable" id="pb-save"></div></div>';
      ref.parentNode.insertBefore(div,ref.nextSibling);
    }
    // 그룹 메뉴 버튼
    const memBtn=document.querySelector('.grp-sub-btn[onclick*="memory"]');
    if(memBtn&&!document.querySelector('.grp-sub-btn[onclick*="save"]')){
      const btn=document.createElement('button');
      btn.className='grp-sub-btn';
      btn.setAttribute('onclick',"openP('save');closeGrp()");
      btn.innerHTML='💾 저장';
      memBtn.parentNode.insertBefore(btn,memBtn.nextSibling);
    }
    // PC 메뉴
    const pcMem=document.querySelector('.pc-menu-btn[onclick*="memory"]');
    if(pcMem&&!document.querySelector('.pc-menu-btn[onclick*="save"]')){
      const btn=document.createElement('button');
      btn.className='pc-menu-btn';
      btn.setAttribute('onclick',"openP('save')");
      btn.innerHTML='<span class="pc-ico">💾</span><span class="pc-lbl">저장</span>';
      pcMem.parentNode.insertBefore(btn,pcMem.nextSibling);
    }
    window._savePanelInjected=true;
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',tryInject);
  else setTimeout(tryInject,1800);
})();

(function hookSaveOpenP(){
  const t=function(){
    if(window._saveOpenHooked) return;
    if(typeof window.openP!=='function'){ setTimeout(t,1500); return; }
    window._saveOpenHooked=true;
    const _o=window.openP;
    window.openP=function(name,...args){
      const r=_o.call(this,name,...args);
      if(name==='save') setTimeout(renderSavePanel,100);
      return r;
    };
  };
  setTimeout(t,2300);
})();

document.addEventListener('keydown',function(e){
  if((e.ctrlKey||e.metaKey)&&e.key==='s'){
    e.preventDefault();
    exportAllData();
  }
});

console.log('[TaleForge] 내보내기/불러오기 시스템 로드 완료 ✓ (Ctrl+S로 즉시 저장)');

export const SEAL_RESTORE_KEY = 'tf-seal-restore';

export function loadSealRestore(){ try{ return JSON.parse(lsGet(SEAL_RESTORE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadSealRestore = loadSealRestore;

export function loadSealOrder(){
  try{
    const state = loadSealRestore();
    return Object.entries(state)
      .filter(([,v]) => v?.restored)
      .sort((a,b) => (a[1].restoredAt||0) - (b[1].restoredAt||0))
      .map(([name, v]) => ({ name, restoredAt: v.restoredAt }));
  }catch(e){ return []; }
}
window.loadSealOrder = loadSealOrder;

window.loadSealOrder = loadSealOrder;

export function getSealOrderBLS(){
  try{
    const order = loadSealOrder();
    if(!order.length) return '';
    return '\n\n[🗝️ 봉인석 복원 순서]\n' + order.map((s,i) => `${i+1}. ${s.name}`).join('\n');
  }catch(e){ return ''; }
}
window.getSealOrderBLS = getSealOrderBLS;

window.getSealOrderBLS = getSealOrderBLS;

export function saveSealRestore(d){ try{ lsSet(SEAL_RESTORE_KEY,JSON.stringify(d)); }catch(e){} }
window.saveSealRestore = saveSealRestore;

export function attemptSealRestore(sealName){
  const def = SEAL_DEFINITIONS[sealName];
  if(!def){ toast('⚠️ 알 수 없는 봉인석: '+sealName, 2000); return false; }

  const restoreState = loadSealRestore();
  if(restoreState[sealName]?.restored){
    toast('✅ '+sealName+'은(는) 이미 복원됐습니다', 2000); return false;
  }

  // 복원 조건 체크는 AI가 서사적으로 판단 — 시스템은 기록만
  restoreState[sealName] = {
    restored: true,
    restoredAt: S.msgCount||0,
    restoredTurn: new Date().toISOString(),
  };
  saveSealRestore(restoreState);

  // 세계 DB에도 기록
  if(typeof updateWorldDB==='function') updateWorldDB({ flag: 'seal_restored_'+sealName.slice(0,4) });
  if(typeof addEvent==='function') addEvent({ title:sealName+' 복원!', desc:def.worldEffect, tags:['봉인석','복원','세계변화'], category:'world', worldImpact:9, isWorldEvent:true });
  if(typeof addTimelineEvent==='function') addTimelineEvent('seal_restore', sealName+' 복원', {icon:def.icon});

  renderSealProgress();
  checkTrueEndingCondition();

  // [B67 FIX] 도전 과제 "봉인의 수호자"(seals_restored)가 어디서도
  // updateChallenge()로 갱신되지 않아 11개를 전부 복원해도 영원히
  // 미달성으로 남던 버그.
  if(typeof updateChallenge==='function'){
    const _restoredCount = Object.values(loadSealRestore()).filter(v=>v?.restored).length;
    updateChallenge('seals_restored', _restoredCount);
  }

  toast(def.icon+' '+sealName+' 복원 완료!', 4000);
  return true;
}
window.attemptSealRestore = attemptSealRestore;

window.attemptSealRestore = attemptSealRestore;

export function checkTrueEndingCondition(){
  // [버그 수정 - 구조적 충돌] 이 진엔딩 조건(봉인석 전부복원+15회차+화해)은
  // 원래 checkTrueEndingCondition 하나로 독립 판정되어, 조건만 맞으면
  // 28장 스토리 진행과 무관하게 언제든(심지어 mq17 히든 루트 진입 전에도)
  // "감시자와의 대면" 클라이맥스를 시작해버릴 수 있었다. 이는 mq17~mq28
  // (히든 루트 순차 스토리)과 완전히 별개의 경로로 같은 결말에 도달하려는
  // 구조적 충돌이었다. mq20_done(스토리 안에서 이미 감시자를 만난 상태)
  // 이후로만 이 클라이맥스가 진행되도록 제한해, 이 시스템이 mq28(세계의
  // 의지와의 대면)의 심화 연출로만 작동하게 한다.
  const gsF = typeof loadGSFlags==='function' ? loadGSFlags() : {};
  if(!gsF['mq20_done']) return;

  // [B69 FIX] "루프의 주인"(15회차) 마일스톤이 약속하는 "봉인석 8개만
  // 복원해도 진엔딩 가능" 특전이 정의만 있고 실제 판정에서 전혀 쓰이지
  // 않던 버그. 마일스톤 달성 여부에 따라 필요 봉인석 수를 낮춘다.
  const totalSealsFull = Object.keys(SEAL_DEFINITIONS).length;
  const ms = typeof loadMilestones==='function' ? loadMilestones() : [];
  const totalSeals = ms.includes('master_of_loops') ? Math.min(8, totalSealsFull) : totalSealsFull;
  const restoreState = loadSealRestore();
  const restored = Object.values(restoreState).filter(v=>v?.restored).length;
  const loopCount = typeof v36_getReincarnationCount==='function' ? v36_getReincarnationCount() : 0;

  // [2026-09-25 추가] mq18-1(세계수의 부름)/hq_weight_of_forbidden_books가
  // 서사로 "실라리엘 유대도 90+가 진엔딩에 필수"라고 명시적으로 약속하는데,
  // 이 함수의 실제 판정에는 전혀 반영돼 있지 않던 서사-시스템 불일치를
  // 여기서 바로잡는다 — 조회 방식은 world/055의 hist_ws_002(같은 "실라리엘
  // 신뢰 90+" 조건) 발견 로직과 완전히 동일하게 재사용한다.
  const npcsForEnding = typeof loadNPCs==='function' ? loadNPCs() : (S.npcs||[]);
  const silarielBond = npcsForEnding.find(n=>n.name==='실라리엘')?.relationship || 0;
  const silarielBondReady = silarielBond >= 90;

  // 봉인석 복원 진행 안내 — 일반엔딩(세계 회복도)과 연결되는 순수한 진행 알림
  if(restored>=5 && restored<totalSeals){
    toast(`💔 봉인석 ${restored}/${totalSeals} 복원. 세계가 안정을 되찾고 있다`, 3000);
  } else if(restored===totalSeals){
    toast(`✨ 봉인석 ${totalSeals}개 전부 복원! 세계가 완전한 평온을 되찾았다`, 4000);
    // 나머지 조건(15회차+화해)은 갖췄는데 실라리엘 유대만 부족한 경우,
    // 왜 진엔딩이 아직 안 열리는지 플레이어가 알 수 있게 1회만 안내한다.
    if(loopCount>=15 && gsF['asmodeus_redeemed'] && !silarielBondReady && !gsF['_silariel_bond_hint_shown']){
      toast(`🌙 실라리엘과의 유대가 아직 부족하다(현재 ${silarielBond}/90). 세계수 봉인석 서사를 더 깊이 쌓아야 진 엔딩에 닿을 수 있다`, 5000);
      try{ const gsF2 = loadGSFlags(); gsF2['_silariel_bond_hint_shown']=true; saveGSFlags(gsF2); }catch(e){}
    }
  }

  // [재조정] 진엔딩 조건에 봉인석 전부 복원을 다시 포함 — 9챕터(감시자
  // 대면)로 넘어가는 트리거. 루프 인지(15회차+)와 화해, 그리고 실라리엘
  // 유대(세계수 봉인석 서사가 명시적으로 약속한 조건)까지 모두 채워야 함.
  if(restored>=totalSeals && loopCount>=15 && gsF['asmodeus_redeemed'] && silarielBondReady){
    // [CRITICAL BUG FIX] 진엔딩 조건 달성 시 일반적인 안내만 주고, 시간
    // 봉인석의 narrative(stage1~stage4_5~stage5, finalChoice, resolution)
    // 가 전혀 BLS에 전달되지 않던 버그. getSealRestoreBLS()의 pending
    // 로직은 NPC relationship 기반이라 "감시자"에게는 적용되지 않아
    // 이 5단계 클라이맥스 전체가 죽어있었다. 진행 단계를 별도로 추적해
    // 정확한 단계의 narrative를 직접 노출한다. 매 턴 호출되더라도 최소
    // 2턴 간격을 둬서 무거운 대화가 한 번에 전부 진행되지 않게 한다.
    const timeNarrative = (typeof SEAL_DEFINITIONS !== 'undefined') ? SEAL_DEFINITIONS['시간 봉인석']?.narrative : null;
    if(timeNarrative){
      const watcherProgress = (()=>{ try{ return parseInt(lsGet('tf-watcher-stage')||'0'); }catch(e){ return 0; } })();
      const lastTick = (()=>{ try{ return parseInt(lsGet('tf-watcher-stage-turn')||'-99'); }catch(e){ return -99; } })();
      const stageKeys = ['hook','buildup','stage1','stage2','stage3','stage4','stage4_5','stage5'];
      const isComplete = watcherProgress >= stageKeys.length-1;
      const canAdvance = (S.msgCount||0) - lastTick >= 2; // 최소 2턴 간격
      if(!isComplete && canAdvance){
        const currentKey = stageKeys[watcherProgress];
        S._nextInjectedContext = (S._nextInjectedContext||'')
          + `\n\n[🌟 감시자와의 대면 — 진행 단계 ${watcherProgress+1}/${stageKeys.length}] ${timeNarrative[currentKey]||''}`;
        lsSet('tf-watcher-stage', String(watcherProgress+1));
        lsSet('tf-watcher-stage-turn', String(S.msgCount||0));
        if(watcherProgress === 0) toast('🌟 진 엔딩 조건 달성! 감시자가 직접 대면을 청한다', 5000); // 최초 1회만
      } else if(isComplete){
        S._nextInjectedContext = (S._nextInjectedContext||'')
          + `\n\n[⚖️ 최종 선택 — 이미 모든 대화가 끝났다면 결론을 내려라] ${timeNarrative.finalChoice}`;
        // [신규] 진엔딩 클리어 보상 지급 — CLEAR_ITEMS(시나리오별 클리어
        // 전용 아이템 10종)와 loadClearRewards/saveClearRewards(수령
        // 기록)는 정의만 있고 실제로 지급하는 로직이 어디에도 없어서,
        // 진엔딩에 도달해도 그 보상을 영원히 받을 수 없던 빈틈이었다.
        // 1회만 지급되도록 수령 기록으로 중복 방지한다.
        try{
          const cr = typeof loadClearRewards==='function' ? loadClearRewards() : [];
          const sid = S.scenario?.id || 'medieval';
          if(!cr.includes(sid)){
            const pool = (typeof CLEAR_ITEMS!=='undefined' ? CLEAR_ITEMS[sid] : null) || [];
            if(pool.length){
              pool.forEach(item => {
                S.inventory.push({...item});
              });
              saveInventory(S.inventory);
              cr.push(sid);
              saveClearRewards(cr);
              toast(`🏆 진 엔딩 달성! 클리어 보상 ${pool.length}종을 획득했다.`, 5000);
            }
          }
        }catch(e){ console.warn('[진엔딩 클리어 보상 지급 실패]', e); }
      }
    }
    if(typeof addTimelineEvent==='function') addTimelineEvent('true_ending', '진 엔딩 조건 달성', {icon:'🌟'});
  } else if(loopCount>=6){
    // 6~14회차 — 아직 완전한 대면은 아니지만 감시자의 기척이 느껴지는 단계
    // (WATCHER_IDENTITY.revealStages 참고) — 매 봉인석 복원 시점에 가볍게 암시
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n\n[👁️ 희미한 기척] ${loopCount}회차를 살아온 주인공은 가끔 누군가 지켜보는 듯한 시선을 느낀다. 정체는 알 수 없다. 짧고 분위기 있게 한 줄 정도만 암시하라(WATCHER_IDENTITY.revealStages 참고) — 직접적인 설명은 절대 하지 말 것.`;
  }
}
window.checkTrueEndingCondition = checkTrueEndingCondition;

window.checkTrueEndingCondition = checkTrueEndingCondition;

export function renderSealProgress(){
  const body = document.getElementById('pb-seals') || document.getElementById('pb-world');
  if(!body) return;

  const restoreState = loadSealRestore();
  // [CRITICAL BUG FIX] sealOrder(loadSealOrder, "복원된" 목록)를 "파괴된"
  // 목록처럼 써서 패널에 표시되는 ✗파괴 숫자가 실제로는 복원 수와 같은
  // 값을 중복 표시하던 버그. 진짜 파괴 데이터(worldDB.seals)로 교체.
  const worldDBForSeals = typeof loadWorldDB==='function' ? loadWorldDB() : {};
  const brokenMap    = worldDBForSeals.seals||{};

  const totalSealsCount = (typeof SEAL_DEFINITIONS!=='undefined') ? Object.keys(SEAL_DEFINITIONS).length : 10;
  const restored = Object.values(restoreState).filter(v=>v?.restored).length;
  const broken   = Object.values(brokenMap).filter(s=>s&&s.broken).length;
  const intact   = totalSealsCount - restored - broken;

  let html = '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">💔 봉인석 현황</div>';

  // 진행도 바
  html += '<div style="padding:8px 10px;background:#090600;border:1px solid #2a1a05;margin-bottom:10px">';
  html += '<div style="display:flex;gap:4px;margin-bottom:6px;font-size:9px;font-family:\'Cinzel\',serif">';
  html += '<span style="color:#60a060">✓복원 '+restored+'</span><span style="color:var(--dim)"> / </span>';
  html += '<span style="color:#e05050">✗파괴 '+broken+'</span><span style="color:var(--dim)"> / </span>';
  html += '<span style="color:#888">○온전 '+intact+'</span>';
  html += '</div>';
  const pct = Math.round(restored/totalSealsCount*100);
  html += '<div style="height:6px;background:#1a1005;border-radius:3px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:linear-gradient(90deg,#40a040,#60c060);border-radius:3px;transition:width 1s"></div></div>';
  html += '<div style="font-size:8px;color:var(--dim);margin-top:3px;text-align:right">복원 '+pct+'%</div>';
  html += '</div>';

  // 각 봉인석
  Object.entries(SEAL_DEFINITIONS).forEach(([name,def])=>{
    const isRestored = restoreState[name]?.restored;
    const isBroken   = !!brokenMap[name];
    const isIntact   = !isRestored && !isBroken;
    const borderColor= isRestored?'#40a040':isBroken?'#e05050':'#3a2a1a';
    const statusIcon = isRestored?'✅':isBroken?'💔':'🔒';
    const statusText = isRestored?'복원됨':isBroken?'파괴됨':'봉인 중';
    const statusColor= isRestored?'#60a060':isBroken?'#e05050':'#888';

    html += '<div style="padding:8px 10px;background:#090600;border:1px solid '+borderColor+'44;border-left:3px solid '+borderColor+';margin-bottom:5px">';
    html += '<div style="display:flex;align-items:center;gap:7px;margin-bottom:3px">';
    html += '<span style="font-size:18px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def?.icon))+'</span>';
    html += '<div style="flex:1"><div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold)">'+esc(name)+'</div>';
    html += '<div style="font-size:8px;color:'+statusColor+'">'+statusIcon+' '+statusText+' · '+esc(def.location)+'</div></div>';
    if(def.trueEndingRequired) html += '<span style="font-size:8px;color:#c8a96e;background:#1a1000;padding:1px 4px;border-radius:2px">★핵심</span>';
    html += '</div>';
    html += '<div style="font-size:9px;color:var(--dim);line-height:1.4;margin-bottom:3px">'+esc(def.desc)+'</div>';
    if(isIntact){
      html += '<div style="font-size:8px;color:#6a5a3a">복원 조건: '+esc(def.restoreCondition)+'</div>';
      html += '<div style="font-size:8px;color:#5a4a2a">필요 아이템: '+def.restoreItems.join(', ')+'</div>';
    }
    if(isRestored){
      html += '<div style="font-size:9px;color:#60a060;margin-top:3px">'+esc(def.worldEffect)+'</div>';
    }
    if(isBroken){
      const bo = brokenMap[name];
      html += '<div style="font-size:8px;color:#e05050;margin-top:2px">'+(bo.brokenOrder||'?')+'번째 파괴 · '+esc(def.worldEffect.replace('복원 시','파괴 시').slice(0,50))+'</div>';
    }
    html += '</div>';
  });

  // [수정] 진엔딩 조건에서 봉인석을 완전히 분리했으므로, 더 이상 "진엔딩
  // 필수"라는 표현은 정확하지 않다. 세계 회복에 특히 중요한 핵심 봉인석
  // 정도의 의미로 표현 변경. 진엔딩 조건(15회차+화해)은 별도로 안내.
  const coreSeals = Object.entries(SEAL_DEFINITIONS).filter(([,v])=>v.trueEndingRequired).map(([k])=>k);
  html += '<div style="margin-top:8px;padding:7px 9px;background:#0a0a00;border:1px dashed #3a3000;font-size:8px;color:var(--dim)">';
  html += '★ 세계 회복 핵심 봉인석: '+coreSeals.join(' / ')+'<br>';
  html += '(진 엔딩은 봉인석과 무관 — 충분한 루프 경험과 다른 조건이 필요하다)';
  html += '</div>';

  body.innerHTML = html;
}
window.renderSealProgress = renderSealProgress;

window.renderSealProgress = renderSealProgress;

export const SEAL_DISCOVERY_KEY = 'tf-seal-discovery';

export function loadSealDiscovery(){ try{ return JSON.parse(lsGet(SEAL_DISCOVERY_KEY)||'{}'); }catch(e){ return {}; } }
window.loadSealDiscovery = loadSealDiscovery;

export function saveSealDiscovery(d){ try{ lsSet(SEAL_DISCOVERY_KEY, JSON.stringify(d||{})); }catch(e){} }
window.saveSealDiscovery = saveSealDiscovery;

window.loadSealDiscovery = loadSealDiscovery;

window.saveSealDiscovery = saveSealDiscovery;

export async function handleSealHint(sealName, hintContext){
  try{
    const def = SEAL_DEFINITIONS[sealName];
    if(!def) return;
    const discovery = loadSealDiscovery();
    if(discovery[sealName]) return; // 이미 발견됨

    // generateAILocation으로 그 봉인석에 맞는 장소를 즉석 생성
    const trigger = `봉인석 단서 발견. "${sealName}"의 행방에 대한 단서를 NPC 또는 서사를 통해 들었다.`;
    // [버그 수정] continent를 명시적으로 강하게 지정 — 안 그러면 AI가 임의로
    // 정하거나 비워서 지도에 전부 중앙대륙으로 뭉쳐 표시되는 문제가 있었음.
    const context = `${def.desc} 분위기: ${def.location}. 이 장소는 ${sealName}을 품고 있는 신비롭고 의미 있는 곳이어야 한다. 반드시 continent 필드를 "${def.continent || 'central'}"로 설정하라 — 이 봉인석의 설정상 위치이기 때문이다.${def.narrative?.hook ? ' 배경 서사: ' + def.narrative.hook : ''}`;
    let loc = null;
    if(typeof generateAILocation === 'function'){
      loc = await generateAILocation(trigger, context);
      // 안전망: AI가 continent를 빠뜨리거나 다르게 출력했어도, 봉인석의
      // 정해진 대륙으로 강제 보정 — 지도 배치가 항상 정확하게 일어나도록.
      if(loc && def.continent && loc.continent !== def.continent){
        loc.continent = def.continent;
        try{
          const pool = (typeof loadAILocations === 'function') ? loadAILocations() : [];
          const idx = pool.findIndex(l => l.id === loc.id);
          if(idx >= 0){ pool[idx].continent = def.continent; if(typeof saveAILocations === 'function') saveAILocations(pool); }
        }catch(e){}
      }
    }

    discovery[sealName] = {
      discoveredAt: S.msgCount||0,
      via: hintContext || 'narrative',
      locationId: loc?.id || null,
      locationName: loc?.name || null,
    };
    saveSealDiscovery(discovery);
    toast(`🗝️ 단서를 발견했다: ${sealName}${loc ? ' — ' + loc.name : ''}`, 4000);

    // [신규] 보조/대립 NPC가 있으면 발견 시점에 함께 등장할 수 있음을 AI에게
    // 알려준다 — 단일 NPC와의 단순한 호감도 채우기가 아니라, 다른 시선을
    // 가진 인물과의 갈등/대화가 있는 입체적인 사이드 스토리로 만들기 위함.
    if(def.supportingNpcs && def.supportingNpcs.length){
      const npcIntro = def.supportingNpcs.map(n => `${n.icon} ${n.name}(${n.role}, ${n.stance}): ${n.note}`).join(' / ');
      S._nextInjectedContext = (S._nextInjectedContext||'')
        + `\n\n[👥 관련 인물] 이 봉인석 퀘스트에는 주요 NPC(${def.restoreNpc}) 외에도 다음 인물이 자연스럽게 얽힐 수 있다: ${npcIntro}`;
    }
  }catch(e){ console.warn('[handleSealHint]', e); }
}
window.handleSealHint = handleSealHint;

window.handleSealHint = handleSealHint;

export function getSilverSealPrice(){
  const loopCount = typeof v36_getReincarnationCount==='function' ? v36_getReincarnationCount() : 0;
  // 기본 800골드, 회차가 쌓일수록 최대 60%까지 할인 (실버가 "기억하는 자"를 알아봄)
  const discount = Math.min(0.6, loopCount * 0.04);
  return Math.round(800 * (1 - discount));
}
window.getSilverSealPrice = getSilverSealPrice;

window.getSilverSealPrice = getSilverSealPrice;

export async function buySealHintFromSilver(){
  try{
    const discovery = (typeof loadSealDiscovery === 'function') ? loadSealDiscovery() : {};
    const undiscovered = Object.keys(SEAL_DEFINITIONS).filter(k => !discovery[k]);
    if(!undiscovered.length){
      toast('실버: "이미 다 아시는군요. 더 팔 게 없습니다."', 3000);
      return;
    }
    const price = getSilverSealPrice();
    if((S.gold||0) < price){
      toast(`실버: "정보는 공짜가 아닙니다. ${price}골드가 필요합니다."`, 3000);
      return;
    }
    // 미발견 봉인석 중 무작위 하나의 단서를 판매 — 실버 본인도 "어느 것을
    // 알려줄지"는 우연이라는 느낌을 주기 위해 무작위로 처리.
    const pick = undiscovered[Math.floor(Math.random()*undiscovered.length)];
    S.gold -= price;
    if(typeof saveGold === 'function') saveGold(S.gold);
    if(typeof window.updateHeader === 'function') window.updateHeader();
    await handleSealHint(pick, 'silver_broker');
    toast(`🕵️ 실버에게 ${price}골드를 지불하고 단서를 구매했다: ${pick}`, 4000);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n\n[🕵️ 정보상 실버] 플레이어가 실버에게 ${price}골드를 지불하고 "${pick}"의 행방에 대한 정보를 구매했다. 실버는 항상 사실만 말한다는 원칙을 갖고 있다 — 거래는 깔끔하고 신뢰감 있게 묘사하라. 그가 루프를 자각한 자라는 사실을 플레이어가 알아챈 회차(15회차 이상)라면, 그가 살짝 의미심장한 미소를 짓는 디테일을 추가해도 좋다.`;
  }catch(e){ console.warn('[buySealHintFromSilver]', e); }
}
window.buySealHintFromSilver = buySealHintFromSilver;

window.buySealHintFromSilver = buySealHintFromSilver;

export function getMatchingOrganicTrigger(byBackgroundObj){
  try{
    const text = ((S.character?.background||'') + ' ' + (S.character?.job||S.character?.jobId||'') + ' ' + (S.character?.role||'')).toLowerCase();
    for(const [key, keywords] of Object.entries(BG_TRIGGER_KEYWORDS)){
      if(keywords.some(kw => text.includes(kw))){
        return { key, text: byBackgroundObj[key] };
      }
    }
    return { key: '그_외_모든_배경', text: byBackgroundObj['그_외_모든_배경'] };
  }catch(e){
    return { key: '그_외_모든_배경', text: byBackgroundObj['그_외_모든_배경'] };
  }
}
window.getMatchingOrganicTrigger = getMatchingOrganicTrigger;

window.getMatchingOrganicTrigger = getMatchingOrganicTrigger;

export function getHiddenLocationBLS(){
  try{
    const discovered = (()=>{ try{ return JSON.parse(lsGet('tf-discovered-hidden-locs')||'[]'); }catch(e){ return []; } })();
    const sid = S.scenario?.id||'medieval';
    const allScenarioLocs = LOCATION_DATA[sid]||LOCATION_DATA.medieval;
    const hiddenLocs = allScenarioLocs.filter(l => l.hiddenUntilDiscovered && !discovered.includes(l.id));

    // [버그 수정] deeperOriginHint(다크링 등 발견 이후의 심화 떡밥)가 정의는
    // 됐지만 어디서도 읽히지 않던 죽은 데이터였음. 이미 발견한 장소 중
    // deeperOriginHint가 있는 곳을 낮은 확률로 노출한다.
    const discoveredWithDeepHint = allScenarioLocs.filter(l => discovered.includes(l.id) && l.deeperOriginHint);
    if(discoveredWithDeepHint.length && Math.random() < 0.06){
      const dPick = discoveredWithDeepHint[Math.floor(Math.random()*discoveredWithDeepHint.length)];
      return `\n\n[🗝️ 심화 전승 가능] ${dPick.deeperOriginHint} ${dPick.deeperOriginAiHint||''}`;
    }

    if(!hiddenLocs.length) return '';
    // 매 턴 전달하면 너무 노골적이므로 8% 확률로만, 그것도 1곳만 살짝 암시
    if(Math.random() > 0.08) return '';
    const pick = hiddenLocs[Math.floor(Math.random()*hiddenLocs.length)];
    return `\n\n[🗝️ 숨겨진 거주지 단서 가능] ${pick.discoveryHint || ''}`;
  }catch(e){ return ''; }
}
window.getHiddenLocationBLS = getHiddenLocationBLS;

window.getHiddenLocationBLS = getHiddenLocationBLS;

export function getSealRestoreBLS(){
  const discovery = loadSealDiscovery();
  const discoveredNames = Object.keys(discovery);

  const restoreState = loadSealRestore();
  const restored = Object.entries(restoreState).filter(([,v])=>v?.restored).map(([k])=>k);
  const sealOrder = typeof loadSealOrder==='function' ? loadSealOrder() : [];
  const broken    = sealOrder.map(s=>s.name);
  const totalSeals = (typeof SEAL_DEFINITIONS !== 'undefined') ? Object.keys(SEAL_DEFINITIONS).length : 10;

  const lines = [];
  if(restored.length) lines.push(`복원된 봉인석(${restored.length}/${totalSeals}): `+restored.join(', '));
  if(broken.length)   lines.push('파괴된 봉인석('+broken.length+'): '+broken.join(', '));

  // [재설계] "환생했다"가 아니라 "이 특정 봉인석을 전생에서 한 번이라도
  // 실제로 복원해본 적이 있는가"를 정확히 추적한다 (tf-seal-mastered).
  // 위치를 아는 것(discovery)과 복원 경험이 있는 것(mastered)은 다른
  // 개념 — 위치만 알면 NPC를 통해 정상적으로 진행해야 하고, 실제로
  // 복원까지 성공해본 적이 있어야만 NPC 없이 혼자 재건할 수 있다.
  const masteredSeals = (()=>{ try{ return JSON.parse(lsGet('tf-seal-mastered')||'[]'); }catch(e){ return []; } })();
  const masteredPending = discoveredNames.filter(k => masteredSeals.includes(k) && !restored.includes(k) && !broken.includes(k));
  if(masteredPending.length){
    const memoryDetail = masteredPending.map(k => {
      const locName = discovery[k]?.locationName;
      return locName ? `${k}(${locName})` : k;
    }).join(', ');
    lines.push(`【재건의 기억】 전생에서 이미 한 번 이상 복원해본 적 있는 봉인석: ${memoryDetail} — 위치는 이미 지도에 표시되어 있고, 복원 의식의 방법도 몸이 기억하고 있다. NPC의 도움 없이 혼자서도 재건할 수 있다. 단, 이번엔 NPC 없이 혼자 해내는 것이므로, 단순히 의식을 치르는 게 아니라 "혼자서도 해낼 수 있다는 걸 증명하는" 짧은 특수 이벤트(예: 잠들었던 손의 기억이 되살아나며 의식이 저절로 진행되는 장면, 또는 과거의 잔상이 잠깐 겹쳐 보이는 장면)로 묘사하라.`);
  }

  // [핵심] "발견된" 봉인석 중에서만 복원 조건과 생성된 장소를 노출 — 미발견
  // 봉인석은 존재 자체가 AI에게도 보이지 않는다.
  const npcsForStage = (typeof loadNPCs === 'function') ? loadNPCs() : [];
  const pending = discoveredNames
    .filter(k=>!restored.includes(k)&&!broken.includes(k))
    .slice(0,3)
    .map(k => {
      const d = discovery[k];
      const def = SEAL_DEFINITIONS[k];
      const locInfo = d.locationName ? ` [장소: ${d.locationName}]` : '';
      const isMastered = masteredSeals.includes(k);
      // [재설계] 이 특정 봉인석을 전생에서 복원해본 적이 있을 때만 NPC
      // 신뢰도 조건을 면제한다 — 단순히 환생했다고 모든 봉인석이 면제되는
      // 것이 아니라, "그 봉인석만" 개별적으로 면제된다.
      if(isMastered){
        const ritualOnly = def.restoreCondition
          .replace(/[가-힣]+(?:신뢰|호감도|유대도)\s*\d+\+?\s*AND\s*/,'')
          .replace(/[가-힣\s]+(?:우호|중립 이상)\s*AND\s*/,'');
        return k+'(조건: '+ritualOnly+' — 재건 경험이 있어 NPC 신뢰는 다시 필요 없음, 혼자 재건 가능)'+locInfo;
      }
      // 관련 NPC 신뢰도로 현재 narrative 단계를 추정해 풍부한 맥락 제공
      let stageInfo = '';
      if(def.narrative && def.restoreNpc){
        const relNpc = npcsForStage.find(n => def.restoreNpc.includes(n.name));
        const rel = relNpc?.relationship || 0;
        if(rel >= 80 && def.narrative.stage3) stageInfo = ` [진행: ${def.narrative.stage3.slice(0,60)}...]`;
        else if(rel >= 40 && def.narrative.stage2) stageInfo = ` [진행: ${def.narrative.stage2.slice(0,60)}...]`;
        else if(def.narrative.stage1) stageInfo = ` [진행: ${def.narrative.stage1.slice(0,60)}...]`;
      }
      // [버그 수정] foundingHeroTwist(알테라 봉인석의 건국전쟁 진실 떡밥)가
      // 정의는 됐지만 어디서도 읽히지 않던 죽은 데이터였음. 알테라 봉인석
      // 단서를 발견한 플레이어에게만 낮은 확률로 추가 노출.
      if(k === '알테라 봉인석' && def.foundingHeroTwist && Math.random() < 0.15){
        stageInfo += ` [📜 도서관 단서 가능: ${def.foundingHeroTwist.slice(0,80)}... ${def.foundingHeroAiHint||''}]`;
      }
      return k+'(조건:'+def.restoreCondition.slice(0,30)+')'+locInfo+stageInfo;
    });
  if(pending.length) lines.push('단서를 발견한 다음 단계: '+pending.join(' / '));

  // [신규] 진행 중인 봉인석 중 대사 샘플이 있는 경우, 인물의 말투/태도를
  // 일관되게 유지하도록 참고용으로 1개만 가볍게 노출 (너무 많으면 장황해짐)
  // 이미 재건 경험이 있는 봉인석(mastered)은 NPC와의 신뢰 형성 자체가
  // 더 이상 핵심이 아니므로 대사 샘플 노출 대상에서 제외한다.
  const inProgress = discoveredNames.find(k => !restored.includes(k) && !broken.includes(k) && !masteredSeals.includes(k) && SEAL_DEFINITIONS[k]?.dialogueSamples?.length);
  if(inProgress){
    const sample = SEAL_DEFINITIONS[inProgress].dialogueSamples[0];
    lines.push(`(참고 어투: ${sample})`);
  }

  if(!lines.length) return '';
  const npcRoleNote = masteredPending.length
    ? '\n【중요】 NPC(실라리엘 등)는 봉인석 위치를 알려주는 정보원 역할이 본질이다. 전생에서 이미 복원해본 적 있는 봉인석이라면, 그 NPC와의 신뢰도를 처음부터 다시 쌓을 필요가 없다 — 장소에 도착해 직접 의식을 수행하는 특수 이벤트(몸이 기억하는 의식)만으로 복원 시도가 가능하다. 단, 한 번도 복원해본 적 없는 봉인석이라면 평소대로 NPC 신뢰도를 처음부터 쌓아야 한다.'
    : '';
  return '\n\n[💔 봉인석 복원 현황 — 발견한 단서만 표시]\n'+lines.join('\n')
    +'\n【GS 단서 발견】서사에서 NPC가 봉인석의 구체적인 행방을 알려주거나, 고대 문헌·유적에서 단서를 발견하는 장면이 나오면: "seal_hint":"봉인석명" 출력 — 시스템이 그 즉시 해당 장소를 생성한다. 절대 매 턴 먼저 알려주지 말고, NPC와의 깊은 대화나 탐험의 결과로만 자연스럽게 등장시켜라.'
    +'\n【GS 봉인석 복원】단서를 발견한 봉인석에 대해, 서사에서 복원 조건이 충족되면: "seal_restore":["봉인석명"] 출력'
    +'\n복원 조건 달성 여부는 서사 맥락·보유 아이템·NPC 관계를 종합 판단하라.'
    +npcRoleNote;
}
window.getSealRestoreBLS = getSealRestoreBLS;

window.getSealRestoreBLS = getSealRestoreBLS;

(function hookSealRestoreGS(){
  // [버그 수정] 원래 window.sendMsg를 감싸는 방식이었는데, sendMsg()는 quest/086
  // 안에서 모듈 바인딩으로 직접 호출돼(다른 죽은 훅들과 동일 원인) 이 래핑이
  // 실제로는 한 번도 실행되지 않았다. quest/086의 <gs> 파싱부는 정확히 같은
  // 이유로 이미 "window.processGSBlock(gs)"처럼 명시적으로 window를 통해
  // 호출하도록 고쳐져 있었다(주석: "식별자 직접 호출 시 후속 래퍼가 전부
  // 무시됨") — 그 지점을 대신 감싼다. gs 객체를 인자로 직접 받으므로
  // window._lastParsedGS를 다시 읽을 필요도 없다.
  const tryHook=function(){
    if(window._sealRestoreHooked) return;
    if(typeof window.processGSBlock!=='function'){ setTimeout(tryHook,1500); return; }
    window._sealRestoreHooked=true;
    const _o=window.processGSBlock;
    window.processGSBlock=function(gs){
      const r=_o.apply(this,arguments);
      try{
        if(gs){
          if(gs&&Array.isArray(gs.seal_restore)){
            gs.seal_restore.forEach(function(name){ attemptSealRestore(name); });
          }
          // [신규] seal_hint — AI가 NPC 대화/탐험을 통해 봉인석 단서를 흘렸을 때
          // 동적으로 장소를 생성하는 핸들러 (handleSealHint, 비동기)
          if(gs && typeof gs.seal_hint === 'string' && typeof handleSealHint === 'function'){
            handleSealHint(gs.seal_hint, 'narrative');
          }
          // [신규] hidden_location_found — 숨겨진 종족 거주지(오크/다크링/
          // 언데드/뱀파이어)를 AI가 서사적으로 발견시켰을 때 출력하는
          // 플래그. 이게 출력돼야만 그 장소가 지도/이동 메뉴에 보이게 된다.
          if(gs && typeof gs.hidden_location_found === 'string'){
            try{
              // [안전장치] 「감시자의 영역」은 학자 히든 퀘스트 「금서의 무게」
              // 완료(completeHiddenQuest)를 통해서만 발견될 수 있다 — 이
              // 범용 필드로 우회 발견되면 진 엔딩 1차 관문 게이트가
              // 무력화되므로 명시적으로 차단한다.
              if(gs.hidden_location_found === 'loc_watcher_domain'){
                console.warn('[GATE] loc_watcher_domain은 hidden_location_found로 발견할 수 없습니다 — hq_weight_of_forbidden_books 완료 필요');
              } else {
                const discovered = JSON.parse(lsGet('tf-discovered-hidden-locs')||'[]');
                if(!discovered.includes(gs.hidden_location_found)){
                  discovered.push(gs.hidden_location_found);
                  lsSet('tf-discovered-hidden-locs', JSON.stringify(discovered));
                  const loc = (typeof window.getAllLocations==='function') ? window.getAllLocations().find(l=>l.id===gs.hidden_location_found) : null;
                  if(typeof toast==='function') toast(`🗝️ 숨겨진 장소를 발견했다: ${loc?.name||gs.hidden_location_found}`, 4000);
                }
              }
            }catch(e){}
          }
        }
      }catch(e){}
      return r;
    };
  };
  setTimeout(tryHook,2500);
})();

(function hookSealRestoreBLS(){
  const tryHook=function(){
    if(window._sealRestoreBLSHooked) return;
    const fn=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn){ setTimeout(tryHook,3000); return; }
    window._sealRestoreBLSHooked=true;
    const _o=window[fn];
    window[fn]=function(){ const r=_o.apply(this,arguments); try{ const b=getSealRestoreBLS(); return b&&typeof r==='string'?r+b:r; }catch(e){ return r; } };
  };
  setTimeout(tryHook,4500);
})();

(function hookHiddenLocationBLS(){
  const tryHook=function(){
    if(window._hiddenLocBLSHooked) return;
    const fn=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn){ setTimeout(tryHook,3000); return; }
    window._hiddenLocBLSHooked=true;
    const _o=window[fn];
    window[fn]=function(){ const r=_o.apply(this,arguments); try{ const b=getHiddenLocationBLS(); return b&&typeof r==='string'?r+b:r; }catch(e){ return r; } };
  };
  setTimeout(tryHook,5000);
})();

console.log('[TaleForge] 봉인석 복원 시스템 로드 완료 ✓');

export const STATUS_STATE_KEY = 'tf-status-effects';

export function saveStatusEffects(d){ try{ lsSet(STATUS_STATE_KEY,JSON.stringify(d)); }catch(e){} }
window.saveStatusEffects = saveStatusEffects;

export function applyStatusEffect(target, effectId, source){
  // [CRITICAL BUG FIX] 이 함수가 (target,effectId,source) 시그니처로 재정의되면서
  // 기존 14곳의 applyStatusEffect('blessed') 형태(인자 1개, effectId만) 호출이
  // target='blessed', effectId=undefined로 잘못 들어가 전부 무력화되던 버그.
  // STATUS_EFFECTS에 target 인자가 실제 효과ID인 경우(2번째 인자 없음) 자동 보정.
  if(effectId === undefined && window.STATUS_EFFECTS[target]){
    effectId = target;
    target = 'player';
  }
  const def = window.STATUS_EFFECTS[effectId];
  if(!def) return;

  // [신규] 적 행동 패턴 기반 면역 — 그동안 ENEMY_BEHAVIOR_PATTERNS의
  // "골렘 — 상태이상 면역", "불사 — 공포 면역"이라는 설명은 AI 프롬프트
  // 힌트로만 존재했고, AI가 실제로 그걸 지키는지는 보장이 없었다.
  // 여기서 시스템이 직접 면역을 강제해 일관성을 보장한다.
  if(target !== 'player' && !def.positive){
    try{
      const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
      const m = monsters.find(x => x.name && x.name.includes(String(target).slice(0,4)) && x.status==='alive');
      const behaviorId = m?._behaviorId;
      if(behaviorId === 'golem'){
        // 골렘형 — 모든 상태이상 완전 면역
        toast(`🪨 ${target}은(는) 골렘형 — 모든 상태이상에 면역이다`, 2200);
        return;
      }
      if(behaviorId === 'undead' && (effectId==='fear' || effectId==='petrify' || effectId==='poison')){
        // 불사형 — 정신계(공포·석화)와 독에 면역 (생명 활동이 없으므로)
        toastHTML(`💀 ${esc(target)}은(는) 불사형 — ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)}${esc(def.name)}에 면역이다`, 2200);
        return;
      }
    }catch(e){}
  }

  // ── PSTX 저항 판정 (플레이어 대상 부정적 효과에만, 죽은 코드에서 복원) ──
  if(target === 'player' && typeof RESISTABLE_EFFECTS !== 'undefined' && RESISTABLE_EFFECTS.has(effectId) && typeof calcPstxResist === 'function'){
    const pstx = S.stats?.pstx || 50;
    const { fullResist, partResist } = calcPstxResist(pstx);
    const roll = Math.random();
    if(roll < fullResist){
      toastHTML(`🛡️ 완전 저항! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} ${esc(def.name)} 차단 (PSTX ${esc(Math.round(pstx))})`, 2800);
      return;
    }
    if(roll < fullResist + partResist){
      const state = window.loadStatusEffects();
      if(!state[target]) state[target]=[];
      const reduced = Math.max(1, Math.floor(def.duration * 0.5));
      const existing = state[target].findIndex(e => e.id === effectId);
      if(existing >= 0) state[target][existing].remaining = reduced;
      else state[target].push({ id:effectId, remaining:reduced, weakened:true, charges:def.charges||null, source:source||'unknown', appliedAt:S.msgCount||0 });
      saveStatusEffects(state);
      toastHTML(`⚡ 부분 저항! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} ${esc(def.name)} 약화 적용 (${esc(reduced)}턴, PSTX ${esc(Math.round(pstx))})`, 2800);
      return;
    }
  }

  const state = window.loadStatusEffects();
  if(!state[target]) state[target]=[];
  if(!def.stackable && state[target].some(e=>e.id===effectId)) return; // 중복 방지
  state[target].push({ id:effectId, remaining:def.duration, charges:def.charges||null, source:source||'unknown', appliedAt:S.msgCount||0 });
  saveStatusEffects(state);
  toast(def.icon+' '+target+'에게 '+def.name+' 발생!', 2500);
}
window.applyStatusEffect = applyStatusEffect;

window.applyStatusEffect = applyStatusEffect;

export function getActiveEffects(target){
  const state = window.loadStatusEffects();
  return (state[target]||[]).filter(e=>e.remaining>0);
}
window.getActiveEffects = getActiveEffects;

window.getActiveEffects = getActiveEffects;

export function tickStatusEffects(target){
  const state = window.loadStatusEffects();
  if(!state[target]) return;

  // [CRITICAL BUG FIX] 죽은 코드(31712줄 구버전)에 있던 실제 스탯/HP 효과 적용 로직이
  // 이 함수에 빠져있어서, 상태이상이 등록만 되고 화상/독 데미지, 저주/축복 스탯 변화,
  // 빙결/광폭화/은신 보정이 전혀 적용 안 되던 버그. player 대상일 때만 S 전역 상태에 반영.
  if(target === 'player'){
    state[target].forEach(eff=>{
      const def = window.STATUS_EFFECTS[eff.id];
      if(!def || !def.effect) return;
      const halfMod = eff.weakened ? 0.5 : 1.0;

      if(def.effect.hpPerTurn){
        const dmg = Math.round(def.effect.hpPerTurn * halfMod);
        S.stats.hp = Math.max(0, (S.stats.hp||100) + dmg);
      }
      if(def.effect.allStatBonus){
        S._statusStatBonus = (S._statusStatBonus||0) + def.effect.allStatBonus;
      }
      if(def.effect.allStatPenalty){
        const pen = Math.round(Math.abs(def.effect.allStatPenalty) * halfMod);
        S._statusStatPenalty = (S._statusStatPenalty||0) + pen;
      }
      if(eff.id === 'burn'){
        S._statusStatPenalty = (S._statusStatPenalty||0) + Math.round(10 * halfMod);
      }
      if(eff.id === 'freeze' && eff.weakened){
        S._statusStatPenalty = (S._statusStatPenalty||0) + 30;
      }
      if(eff.id === 'berserk'){
        S._statusStatBonus = (S._statusStatBonus||0) + Math.round(30 * halfMod);
        if(!eff.weakened) S._isUncontrolled = true;
      }
      if(eff.id === 'invisible'){
        S._statusStatBonus = (S._statusStatBonus||0) + 40;
      }
    });
  }

  state[target] = state[target]
    .map(e=>({ ...e, remaining:e.remaining-1 }))
    .filter(e=>{
      if(e.remaining>0) return true;
      const def = window.STATUS_EFFECTS[e.id];
      if(def) toast(`${def.name} 상태이상 해제`, 1500, def);
      if(e.id === 'berserk') S._isUncontrolled = false;
      return false;
    });
  saveStatusEffects(state);
  if(target === 'player' && typeof window.updateHeader === 'function') window.updateHeader();
}
window.tickStatusEffects = tickStatusEffects;

export function clearStatusEffects(target){
  const state = window.loadStatusEffects();
  state[target]=[];
  saveStatusEffects(state);
}
window.clearStatusEffects = clearStatusEffects;

window.clearStatusEffects = clearStatusEffects;

export function clearStatusEffect(effectId){
  try{
    const state = window.loadStatusEffects();
    if(state['player']) state['player'] = state['player'].filter(e => e.id !== effectId);
    saveStatusEffects(state);
  }catch(e){ console.warn('[clearStatusEffect]', e); }
}
window.clearStatusEffect = clearStatusEffect;

window.clearStatusEffect = clearStatusEffect;

export function getStatusBLS(){
  const state = window.loadStatusEffects();
  const player = getActiveEffects('player');
  const enemies = Object.entries(state).filter(([k])=>k!=='player').map(([k,v])=>[k,v.filter(e=>e.remaining>0)]).filter(([,v])=>v.length);

  const parts=[];
  if(player.length){
    parts.push('[플레이어 상태이상] '+player.map(e=>{ const d=window.STATUS_EFFECTS[e.id]; return (d?d.icon+d.name:'?')+'('+e.remaining+'턴)'; }).join(' / '));
  }
  if(enemies.length){
    parts.push('[적 상태이상] '+enemies.map(([name,effs])=>name+': '+effs.map(e=>{ const d=window.STATUS_EFFECTS[e.id]; return d?d.name:'?'; }).join(',')).join(' / '));
  }
  if(!parts.length) return '';
  return '\n\n[⚡ 상태이상 현황]\n'+parts.join('\n')
    +'\n【GS 상태이상】"apply_status":[{"target":"player|적이름","effect":"poison|burn|freeze|paralysis|stun|bleed|curse|fear|petrify|silence|bless|haste|barrier"}]'
    +'\n"remove_status":[{"target":"player|적이름","effect":"effectId"}]';
}
window.getStatusBLS = getStatusBLS;

window.getStatusBLS = getStatusBLS;

export const BOSS_PHASE_KEY = 'tf-boss-phase';

export function loadBossPhase(){ try{ return JSON.parse(lsGet(BOSS_PHASE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadBossPhase = loadBossPhase;

export function saveBossPhase(d){ try{ lsSet(BOSS_PHASE_KEY,JSON.stringify(d)); }catch(e){} }
window.saveBossPhase = saveBossPhase;

window.BOSS_PHASE_DEFINITIONS = BOSS_PHASE_DEFINITIONS;

export function checkBossPhase(bossId, currentHpPct){
  // BOSS_PHASE_DEFINITIONS에 정의가 없으면 범용 페이즈로 폴백 — 이게
  // 모든 보스전에 최소한의 단계 전환을 보장하는 핵심 변경점.
  const def = BOSS_PHASE_DEFINITIONS[bossId] || GENERIC_BOSS_PHASES;
  const state = loadBossPhase();
  if(!state[bossId]) state[bossId]={ currentPhase:1, triggered:[] };

  const nextPhase = def.phases.slice().reverse().find(p=>currentHpPct<=p.hpThreshold && !state[bossId].triggered.includes(p.phase));
  if(!nextPhase) return null;

  state[bossId].currentPhase = nextPhase.phase;
  state[bossId].triggered.push(nextPhase.phase);
  saveBossPhase(state);

  if(nextPhase.announcement){
    S._nextInjectedContext = (S._nextInjectedContext||'')
      +'\n[⚡ 보스 페이즈 전환 — 즉시 서사화 필수]\n'+def.name+' '+nextPhase.phase+'페이즈 진입: '+nextPhase.name
      +'\n외형 변화: '+nextPhase.desc
      +'\n선언: '+nextPhase.announcement
      +(nextPhase.newSkill?'\n새 스킬: '+nextPhase.newSkill:'')
      +(nextPhase.immunity?.length?'\n이 페이즈에서 면역: '+nextPhase.immunity.join(', '):'')
      +(nextPhase.canRecruit?'\n★ 이번 페이즈에서 설득/공감 선택지를 주면 동료 영입 가능':'');
  }
  toast('⚡ '+def.name+' '+nextPhase.phase+'페이즈! — '+nextPhase.name, 4000);
  return nextPhase;
}
window.checkBossPhase = checkBossPhase;

window.checkBossPhase = checkBossPhase;

export function autoCheckBossPhases(){
  try{
    const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
    monsters.filter(m=>m.isBoss && m.status==='alive').forEach(b=>{
      const pct = Math.max(0, Math.round((b.hp / (b.maxHp||b.hp||1)) * 100));
      const bossId = b.id || (b.name||'').toLowerCase().replace(/\s/g,'_');
      checkBossPhase(bossId, pct);
    });
  }catch(e){ console.warn('[autoCheckBossPhases]', e); }
}
window.autoCheckBossPhases = autoCheckBossPhases;

window.autoCheckBossPhases = autoCheckBossPhases;

export function getBossPhaseBLS(){
  const monsters = typeof loadMonsters==='function' ? loadMonsters()||[] : [];
  const bosses = monsters.filter(m=>m.isBoss&&m.status==='alive');
  if(!bosses.length) return '';
  const state = loadBossPhase();
  const lines = bosses.map(b=>{
    const def = BOSS_PHASE_DEFINITIONS[b.id||b.name?.toLowerCase().replace(/\s/g,'_')];
    if(!def) return null;
    const ps = state[b.id||b.name?.toLowerCase().replace(/\s/g,'_')]||{currentPhase:1};
    const curDef = def.phases.find(p=>p.phase===ps.currentPhase)||def.phases[0];
    return def.name+' '+curDef.phase+'페이즈('+curDef.name+'): '+curDef.desc+'\n  현재 면역: '+(curDef.immunity?.join(',')||'없음')+' / 약점: '+(curDef.weakness?.join(',')||'없음');
  }).filter(Boolean);
  if(!lines.length) return '';
  return '\n\n[⚡ 보스 페이즈 현황]\n'+lines.join('\n')
    +'\n보스 HP가 임계값에 도달하면 페이즈 전환을 서사화하라. GS: "boss_hp_pct":{"id":"boss_id","pct":45}';
}
window.getBossPhaseBLS = getBossPhaseBLS;

window.getBossPhaseBLS = getBossPhaseBLS;

export const TERRAIN_KEY = 'tf-battle-terrain';

export function loadBattleTerrain(){ try{ return lsGet(TERRAIN_KEY)||null; }catch(e){ return null; } }
window.loadBattleTerrain = loadBattleTerrain;

export function setBattleTerrain(id){ try{ lsSet(TERRAIN_KEY,id); }catch(e){} }
window.setBattleTerrain = setBattleTerrain;

window.setBattleTerrain = setBattleTerrain;

export function getTerrainBLS(){
  // 1순위: 자동 감지된 전투 지형 (TERRAIN_EFFECTS_BATTLE, finisher 포함)
  const autoId = S._terrainId;
  if(autoId && typeof TERRAIN_EFFECTS_BATTLE !== 'undefined' && TERRAIN_EFFECTS_BATTLE[autoId]){
    const def = TERRAIN_EFFECTS_BATTLE[autoId];
    let out = '\n\n[🗺️ 전투 지형: '+def.icon+' '+def.label+']\n'+def.aiHint;

    // [신규] 날씨·시간 × 지형 상호작용 — 기존 지형 시스템은 날씨/시간과
    // 완전히 분리되어 있었다(비가 오나 밤이 오나 지형 효과는 똑같았음).
    // 이미 있는 날씨·시간 시스템(loadAtmosphere)을 결합해 같은 지형이라도
    // 상황에 따라 다르게 느껴지도록 한다.
    try{
      const atm = (typeof loadAtmosphere==='function') ? loadAtmosphere() : null;
      const weather = atm?.weather || 'none';
      const timeOfDay = atm?.timeOfDay || 'none';
      const combos = [];
      if((autoId==='ice' || autoId==='cliff' || autoId==='rooftop') && (weather==='rain'||weather==='storm'||weather==='snow')){
        combos.push('비/폭풍으로 지면이 더 미끄럽다 — 균형을 잃을 위험이 더 커지지만, 그만큼 적도 똑같이 불안정해진다.');
      }
      if(autoId==='volcanic' && (weather==='rain'||weather==='storm')){
        combos.push('비가 용암과 만나 자욱한 수증기와 화산재가 시야를 가린다 — 기습이 유리해지지만 자신도 길을 잃기 쉽다.');
      }
      if((autoId==='underground' || autoId==='dungeon' || autoId==='ruins') && timeOfDay==='night'){
        combos.push('밤이 깊어 어둠이 한층 짙다 — 언데드·악마형 적은 더 강력해지고, 시야 의존 행동은 더 불리해진다.');
      }
      if(autoId==='forest' && timeOfDay==='night'){
        combos.push('숲의 밤은 매복하는 쪽에 절대적으로 유리하다 — 은신·기습 행동에 추가 보정을 주는 것이 적절하다.');
      }
      if(autoId==='water' && (weather==='storm')){
        combos.push('폭풍우로 물살이 거세다 — 익사 시도(필살 행동)의 위험 부담과 보상이 동시에 커진다.');
      }
      if(combos.length){
        out += '\n[🌦️ 날씨·시간 결합 효과] ' + combos.join(' ');
      }
    }catch(e){}

    if(def.finisher){
      out += '\n[⚡ 이 지형의 필살 행동 — "'+def.finisher.label+'"] '+def.finisher.desc
        + ' (위험 부담: '+def.finisher.riskNote+')'
        + ' 플레이어의 행동이나 상황이 이 필살 행동에 자연스럽게 들어맞을 때만'
        + ' 선택지나 서사 제안으로 녹여서 제시하라 — 매 전투마다 강제로 등장시키지 말고,'
        + ' 지형을 진짜로 활용하는 창의적인 행동일 때 보상하라.'
        + ' 성공 판정 시 <gs>{"terrain_finisher":{"name":"적이름","success":true}}</gs>를,'
        + ' 시도했지만 실패했다면 <gs>{"terrain_finisher":{"name":"적이름","success":false}}</gs>를 출력하라.'
        + ' 일반 잡몹은 성공 시 그 자리에서 즉시 처치되고, 보스급은 죽지 않는 대신'
        + ' 큰 피해를 입고 분노/격분 상태로 전환되어 이후 더 위협적으로 돌변한다 —'
        + ' 이 차이를 서사에 반드시 반영하라(잡몹: 절명/추락/매몰 묘사, 보스: 가까스로'
        + ' 버텨내며 더 흉포해지는 묘사). 실패 시에는 그 위험 부담이 실제로 플레이어'
        + ' 자신에게 돌아오는 역효과를 묘사하라.';
    }
    return out;
  }
  // 2순위: AI가 직접 set_terrain GS로 선언한 구버전 지형 (폴백)
  const terrain = loadBattleTerrain();
  if(!terrain) return '';
  const def = TERRAIN_EFFECTS[terrain];
  if(!def) return '';
  return '\n\n[🗺️ 전투 지형: '+def.icon+' '+def.name+']\n'+def.desc+'\n이 지형 효과를 전투 묘사에 반영하라. 지형을 활용하는 창의적 행동에 보너스를 부여하라.';
}
window.getTerrainBLS = getTerrainBLS;

window.getTerrainBLS = getTerrainBLS;

export function triggerAfterBattleChoice(enemyName, canRecruit){
  const opts = Object.entries(AFTER_BATTLE_OPTIONS).filter(([k])=>canRecruit||k!=='recruit');
  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n\n[⚔️ 전투 후 선택] '+enemyName+'을(를) 쓰러뜨렸다. 플레이어에게 반드시 선택지를 제시하라:\n'
    +opts.map(([k,v])=>'• '+v.icon+' '+v.label+': '+v.desc).join('\n')
    +'\n선택에 따라 GS: "after_battle":{"choice":"mercy|execute|recruit|interrogate|release","target":"'+enemyName+'"}';
  toast('⚔️ 전투 승리! 처리 방식을 선택하세요', 3000);
}
window.triggerAfterBattleChoice = triggerAfterBattleChoice;

window.triggerAfterBattleChoice = triggerAfterBattleChoice;

export function attemptFlee(){
  if(S.loading) return;
  const monsters = typeof loadMonsters==='function' ? loadMonsters()||[] : [];
  const aliveMonsters = monsters.filter(m=>m.status==='alive');
  if(!aliveMonsters.length){ toast('전투 중이 아닙니다'); return; }

  // [B64 FIX] 'spd'는 정식 스탯(ALL_STAT_KEYS)에 없는 필드라 항상 폴백값(10)
  // 고정이었고, 몬스터 데이터(MONSTER_TIER_TABLE)에도 speed 지표가 없어
  // 양쪽 다 상쇄되던 죽은 항이었다. 실제로 존재하는 agi만으로 계산한다.
  const agi   = S.stats?.agi||10;
  const avgEnemyAgi = 10;
  const baseRate = Math.min(85, Math.max(15, 40 + agi/2 - avgEnemyAgi/2));
  const fear = (typeof getActiveEffects==='function' && getActiveEffects('player').some(e=>e.id==='fear')) ? 20 : 0;
  const rate = Math.min(95, baseRate + fear);

  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n\n[🏃 도망 시도] 플레이어가 도망을 시도한다.\n'
    +'도망 성공률: '+Math.round(rate)+'% (AGI 기준)\n'
    +'주사위를 굴려 성공/실패를 결정하라. 성공이면 전투 종료. 실패면 적이 추가 공격 기회를 얻는다.\n'
    +'GS: "flee_result":{"success":true|false,"penalty":"받은 피해 묘사"}';

  toast(`🏃 도망 시도 중... (성공률 약 ${Math.round(rate)}%)`, 2000);
  if(typeof sendMsg==='function') sendMsg('전투에서 벗어나기 위해 도망친다.', false);
}
window.attemptFlee = attemptFlee;

window.attemptFlee = attemptFlee;

export function getCombatSystemBLS(){
  const monsters = typeof loadMonsters==='function' ? loadMonsters()||[] : [];
  const alive = monsters.filter(m=>m.status==='alive');
  if(!alive.length) return '';

  const parts=[];
  const statusBLS = getStatusBLS();
  if(statusBLS) parts.push(statusBLS);
  const terrainBLS = getTerrainBLS();
  if(terrainBLS) parts.push(terrainBLS);
  const bossBLS = getBossPhaseBLS();
  if(bossBLS) parts.push(bossBLS);

  parts.push('\n\n[⚔️ 전투 시스템 GS 필드]'
    +'\n• apply_status:[{target,effect}] — 상태이상 부여'
    +'\n• boss_hp_pct:{id,pct} — 보스 체력% 보고 (페이즈 전환 트리거)'
    +'\n• after_battle:{choice,target} — 전투 후 처리'
    +'\n• flee_result:{success,penalty} — 도망 결과'
    +'\n• set_terrain:"terrain_id" — 전투 지형 설정'
    +'\n전투 묘사에 상태이상·지형·보스 페이즈를 적극 활용하라.');

  return parts.join('');
}
window.getCombatSystemBLS = getCombatSystemBLS;

window.getCombatSystemBLS = getCombatSystemBLS;

(function hookCombatGS(){
  // [버그 수정] window.sendMsg 래핑은 sendMsg()가 quest/086 안에서 모듈
  // 바인딩으로 직접 호출돼 한 번도 실행되지 않았다 — quest/086의 <gs>
  // 파싱부가 이미 명시적으로 여는 "window.processGSBlock(gs)"를 대신
  // 감싼다(다른 곳들도 이미 이렇게 11군데가 정상 연결돼 있다).
  const t=function(){
    if(window._combatSysHooked) return;
    if(typeof window.processGSBlock!=='function'){ setTimeout(t,1500); return; }
    window._combatSysHooked=true;
    const _o=window.processGSBlock;
    window.processGSBlock=function(gs){
      const r=_o.apply(this,arguments);
      try{
        if(gs){
          if(gs){
            // 상태이상
            if(Array.isArray(gs.apply_status)) gs.apply_status.forEach(function(s){ if(s.target&&s.effect) applyStatusEffect(s.target,s.effect,'battle'); });
            if(Array.isArray(gs.remove_status)) gs.remove_status.forEach(function(s){ if(s.target&&s.effect){ const st=window.loadStatusEffects(); if(st[s.target]) st[s.target]=st[s.target].filter(function(e){ return e.id!==s.effect; }); saveStatusEffects(st); } });
            // 보스 페이즈
            if(gs.boss_hp_pct){ const b=gs.boss_hp_pct; checkBossPhase(b.id||b.name,b.pct||50); }
            // 전투 후 선택
            if(gs.after_battle && gs.after_battle.choice){
              const opt=AFTER_BATTLE_OPTIONS[gs.after_battle.choice];
              if(opt && typeof updatePlayerDB==='function') updatePlayerDB({choice:gs.after_battle.choice+'_'+gs.after_battle.target, moralScore:opt.moralDelta});
            }
            // 지형 설정
            if(gs.set_terrain) setBattleTerrain(gs.set_terrain);
          }
        }
        // 전투 키워드로 자동 상태이상 제거
        // [B65 FIX] txt가 이 스코프에 선언된 적이 없어 ReferenceError로
        // 이 블록이 항상 조용히 실패하던 버그.
        const txt = (S.messages||[]).filter(m=>m.role==='assistant').slice(-1)[0]?.content || '';
        if(txt.includes('전투 종료')||txt.includes('전투가 끝')) {
          clearStatusEffects('player');
          if(typeof checkPostCombatCapture==='function') checkPostCombatCapture();
        }
      }catch(e){}
      return r;
    };
  };
  setTimeout(t,2500);
})();

(function hookCombatBLS(){
  const t=function(){
    if(window._combatBLSHooked) return;
    const fn=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn){ setTimeout(t,3000); return; }
    window._combatBLSHooked=true;
    const _o=window[fn];
    window[fn]=function(){
      const r=_o.apply(this,arguments);
      try{
        const monsters=typeof loadMonsters==='function'?loadMonsters()||[]:[];
        if(monsters.some(function(m){ return m.status==='alive'; })){
          const b=getCombatSystemBLS(); return b&&typeof r==='string'?r+b:r;
        }
      }catch(e){}
      return r;
    };
  };
  setTimeout(t,4500);
})();

console.log('[TaleForge] 전투 심화 시스템 로드 완료 ✓');

export const SAVE_SLOTS_KEY  = 'tf-save-slots-meta';

export const SAVE_SLOT_PREFIX = 'tf-save-slot-';

export const AUTO_SAVE_KEY   = 'tf-autosave';

export const MAX_SLOTS       = 5;

export function loadSaveMeta(){ try{ return JSON.parse(lsGet(SAVE_SLOTS_KEY)||'[]'); }catch(e){ return []; } }
window.loadSaveMeta = loadSaveMeta;

export function saveSaveMeta(d){ try{ lsSet(SAVE_SLOTS_KEY,JSON.stringify(d)); }catch(e){} }
window.saveSaveMeta = saveSaveMeta;

export function saveToSlot(slotIdx, label){
  const meta = loadSaveMeta();
  const allKeys = {};
  try{
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(!k) continue;
      const kl=k.toLowerCase();
      if(['apikey','api-key','api_key','taleforge-apikeys','taleforge-keyindex'].some(function(p){ return kl.includes(p); })) continue;
      if(k.startsWith('taleforge-')||k.startsWith('tf-')){
        // 다른 슬롯 데이터는 제외
        if(k.startsWith(SAVE_SLOT_PREFIX)||k===SAVE_SLOTS_KEY) continue;
        try{ allKeys[k]=JSON.parse(localStorage.getItem(k)||'null'); }catch(e){}
      }
    }
  }catch(e){}

  const slotData = {
    stores: allKeys,
    messages: S.messages||[],
    meta: {
      slotIdx,
      label: label||('슬롯 '+(slotIdx+1)),
      character: S.character ? { name:S.character.name, race:S.character.race, role:S.character.role||S.character.job } : null,
      msgCount: S.msgCount||0,
      location: typeof loadCurrentLocation==='function' ? (loadCurrentLocation()||{}).name||'' : '',
      loopCount: typeof v36_getReincarnationCount==='function' ? v36_getReincarnationCount() : 0,
      savedAt: new Date().toISOString(),
      playtime: S.msgCount||0,
    }
  };

  try{ lsSet(SAVE_SLOT_PREFIX+slotIdx, JSON.stringify(slotData)); }catch(e){ toast('⚠️ 저장 실패: 용량 부족일 수 있습니다', 3000); return false; }

  // 메타 업데이트
  while(meta.length<=slotIdx) meta.push(null);
  meta[slotIdx] = slotData.meta;
  saveSaveMeta(meta);
  toast('💾 슬롯 '+(slotIdx+1)+' 저장 완료!', 2500);
  renderSaveSlotPanel();
  return true;
}
window.saveToSlot = saveToSlot;

window.saveToSlot = saveToSlot;

export function loadFromSlot(slotIdx){
  const raw = lsGet(SAVE_SLOT_PREFIX+slotIdx);
  if(!raw){ toast('⚠️ 슬롯 '+(slotIdx+1)+' 이(가) 비어있습니다', 2000); return; }
  let slotData; try{ slotData=JSON.parse(raw); }catch(e){ toast('⚠️ 저장 데이터 손상', 2000); return; }

  const meta = slotData.meta||{};
  const confirmed = confirm(
    '슬롯 '+(slotIdx+1)+' 불러오기\n\n'
    +'캐릭터: '+(meta.character?meta.character.name:'알 수 없음')+'\n'
    +'저장 시각: '+(meta.savedAt?new Date(meta.savedAt).toLocaleString('ko-KR'):'알 수 없음')+'\n'
    +'진행 턴: '+(meta.msgCount||0)+'턴 / '+(meta.loopCount||0)+'회차\n\n'
    +'현재 데이터가 덮어씌워집니다. 계속하시겠습니까?'
  );
  if(!confirmed) return;

  // 복원
  const skip = ['apikey','api-key','api_key','taleforge-apikeys','taleforge-keyindex'];
  let count=0;
  Object.entries(slotData.stores||{}).forEach(function(kv){
    const k=kv[0], v=kv[1];
    try{
      if(skip.some(function(p){ return k.toLowerCase().includes(p); })) return;
      if(v!=null){ lsSet(k,JSON.stringify(v)); count++; }
    }catch(e){}
  });

  if(slotData.messages) S.messages=slotData.messages;
  toast('📂 슬롯 '+(slotIdx+1)+' 불러오기 완료! ('+count+'개 데이터)', 3000);

  setTimeout(function(){
    try{
      if(typeof renderSummons==='function') renderSummons();
      if(typeof window.renderReligionPanel==='function') window.renderReligionPanel();
      if(typeof renderMemoryEnhanced==='function') renderMemoryEnhanced();
      if(typeof renderSealProgress==='function') renderSealProgress();
      if(typeof renderMsgs==='function') renderMsgs();
      if(typeof window.updateHeader==='function') window.updateHeader();
      if(typeof loadSession==='function'){
        const sess=loadSession();
        if(sess&&sess.character){
          S.character=sess.character; S.stats=sess.stats||S.stats;
          S.gold=sess.gold||S.gold; S.inventory=sess.inventory||S.inventory;
          S.msgCount=sess.msgCount||S.msgCount;
          if(typeof window.updateHeader==='function') window.updateHeader();
        }
      }
      // 불러온 세이브가 구버전(스탯 스케일 변경 전)이면 마이그레이션 로그 기록
      if(typeof checkSaveVersion==='function') checkSaveVersion();
    }catch(e){}
  }, 500);
}
window.loadFromSlot = loadFromSlot;

window.loadFromSlot = loadFromSlot;

export function deleteSlot(slotIdx){
  if(!confirm('슬롯 '+(slotIdx+1)+' 삭제하시겠습니까?')) return;
  try{ localStorage.removeItem(SAVE_SLOT_PREFIX+slotIdx); }catch(e){}
  const meta=loadSaveMeta();
  if(meta[slotIdx]) meta[slotIdx]=null;
  saveSaveMeta(meta);
  toast('🗑️ 슬롯 '+(slotIdx+1)+' 삭제됨', 2000);
  renderSaveSlotPanel();
}
window.deleteSlot = deleteSlot;

window.deleteSlot = deleteSlot;

export function renameSlot(slotIdx){
  const meta=loadSaveMeta();
  const current=(meta[slotIdx]?.label)||('슬롯 '+(slotIdx+1));
  const newName=prompt('슬롯 이름 변경:', current);
  if(!newName||!newName.trim()) return;
  if(meta[slotIdx]) meta[slotIdx].label=newName.trim();
  saveSaveMeta(meta);
  renderSaveSlotPanel();
}
window.renameSlot = renameSlot;

window.renameSlot = renameSlot;


// [버그 수정] 원래 window.sendMsg를 감싸 5턴마다 자동 저장 슬롯에 저장하려
// 했는데, 이 래핑은 한 번도 실행되지 않았다("자동 저장" 슬롯이 항상 비어
// 있었을 것). 이 훅은 turnsSinceAutoSave라는 클로저 변수를 썼는데, S.msgCount가
// 이미 매 턴 증가하는 턴 카운터이므로 그걸로 대체해 quest/086의 sendMsg()
// 안에 네이티브로 옮겼다(다른 매턴 훅들과 같은 자리) — 별도 상태 변수 없이
// S.msgCount % 5 === 0으로 동일하게 판정한다.
export function runAutoSaveSnapshot(){
  try{
    const allKeys={};
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(!k) continue;
      const kl=k.toLowerCase();
      if(['apikey','api-key'].some(function(p){ return kl.includes(p); })) continue;
      if((k.startsWith('taleforge-')||k.startsWith('tf-'))&&!k.startsWith(SAVE_SLOT_PREFIX)&&k!==SAVE_SLOTS_KEY){
        try{ allKeys[k]=JSON.parse(localStorage.getItem(k)||'null'); }catch(e){}
      }
    }
    lsSet(AUTO_SAVE_KEY, JSON.stringify({
      stores:allKeys, messages:(S.messages||[]).slice(-100),
      meta:{ character:S.character?{name:S.character.name}:null, msgCount:S.msgCount||0, savedAt:new Date().toISOString() }
    }));
    if((S.msgCount||0)%10===0) toast('💾 자동 저장됨 ('+(S.msgCount||0)+'턴)', 1500);
  }catch(e){}
}
window.runAutoSaveSnapshot = runAutoSaveSnapshot;

export function renderSaveSlotPanel(){
  // [버그 수정] 실제 DOM에 주입되는 저장 패널의 id는 'p-save'/'pb-save'
  // (단수)인데 이 함수는 'pb-saves'(복수)를 찾고 있어서, 저장 패널을 열면
  // 항상 빈 화면이 뜨던 버그였다.
  const body=document.getElementById('pb-save');
  if(!body) return;

  const meta=loadSaveMeta();
  const autoRaw=lsGet(AUTO_SAVE_KEY);
  let autoMeta=null;
  try{ const ad=JSON.parse(autoRaw||'null'); autoMeta=ad?.meta||null; }catch(e){}

  const charName=(S.character&&S.character.name)||'캐릭터 없음';
  const loopCount=typeof v36_getReincarnationCount==='function'?v36_getReincarnationCount():0;

  // 용량 계산
  let totalBytes=0;
  try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k) totalBytes+=(localStorage.getItem(k)||'').length; } }catch(e){}

  let html='<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">💾 저장 / 불러오기</div>';

  // 현재 세션 정보
  html+='<div style="padding:8px 10px;background:#090600;border:1px solid #2a1a05;margin-bottom:10px">';
  html+='<div style="font-size:9px;color:var(--gold);margin-bottom:3px">'+esc(charName)+'</div>';
  html+='<div style="font-size:9px;color:var(--dim)">턴: '+(S.msgCount||0)+' · 회차: '+loopCount+' · 데이터: '+(totalBytes/1024).toFixed(1)+'KB</div>';
  html+='</div>';

  // 전체 JSON 내보내기/불러오기
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:12px">';
  html+='<button onclick="exportAllData()" style="padding:9px;background:#0a1020;border:1px solid #204060;color:#60a0e0;font-family:\'Cinzel\',serif;font-size:9px;cursor:pointer">💾 전체 내보내기<br><span style="font-size:7px;opacity:.7">JSON 파일 다운로드</span></button>';
  html+='<label style="padding:9px;background:#0a1808;border:1px solid #204020;color:#60c060;font-family:\'Cinzel\',serif;font-size:9px;cursor:pointer;text-align:center;display:block">📂 전체 불러오기<br><span style="font-size:7px;opacity:.7">JSON 파일 선택</span><input type="file" accept=".json" onchange="importAllData(this.files[0])" style="display:none"></label>';
  html+='</div>';

  // 자동 저장 표시
  html+='<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">🔄 자동 저장 (5턴마다)</div>';
  html+='<div style="padding:7px 9px;background:#080600;border:1px solid #1a1005;margin-bottom:10px">';
  if(autoMeta){
    html+='<div style="font-size:9px;color:#80a060">'+(autoMeta.character?autoMeta.character.name:'?')+' · '+(autoMeta.msgCount||0)+'턴</div>';
    html+='<div style="font-size:8px;color:var(--dim)">'+(autoMeta.savedAt?new Date(autoMeta.savedAt).toLocaleString('ko-KR'):'알 수 없음')+'</div>';
  } else {
    html+='<div style="font-size:9px;color:var(--dim)">아직 자동 저장 없음</div>';
  }
  html+='</div>';

  // 수동 저장 슬롯 5개
  html+='<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">📁 저장 슬롯 ('+MAX_SLOTS+'개)</div>';
  for(let i=0;i<MAX_SLOTS;i++){
    const m=meta[i]||null;
    html+='<div style="padding:8px 10px;background:#090600;border:1px solid '+(m?'#3a2a10':'#1a1005')+';margin-bottom:5px">';
    if(m){
      html+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">';
      html+='<div style="flex:1"><div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold)">'+esc(m.label||'슬롯 '+(i+1))+'</div>';
      html+='<div style="font-size:8px;color:var(--dim)">'+(m.character?m.character.name+' · ':'')+(m.msgCount||0)+'턴 / '+(m.loopCount||0)+'회차</div>';
      html+='<div style="font-size:8px;color:#5a4a2a">'+(m.savedAt?new Date(m.savedAt).toLocaleString('ko-KR'):'')+'</div></div></div>';
      html+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:3px">';
      html+='<button onclick="saveToSlot('+i+')" style="padding:4px;background:#0a1808;border:1px solid #1a3010;color:#60a060;font-size:8px;cursor:pointer">💾 덮어쓰기</button>';
      html+='<button onclick="loadFromSlot('+i+')" style="padding:4px;background:#0a1020;border:1px solid #102030;color:#6090c0;font-size:8px;cursor:pointer">📂 불러오기</button>';
      html+='<button onclick="renameSlot('+i+')" style="padding:4px;background:#1a1008;border:1px solid #2a2010;color:#a09040;font-size:8px;cursor:pointer">✏️ 이름</button>';
      html+='<button onclick="deleteSlot('+i+')" style="padding:4px;background:#1a0808;border:1px solid #2a1010;color:#a04040;font-size:8px;cursor:pointer">🗑️ 삭제</button>';
      html+='</div>';
    } else {
      html+='<div style="display:flex;align-items:center;gap:6px">';
      html+='<div style="flex:1;font-size:9px;color:var(--dim)">슬롯 '+(i+1)+' — 비어있음</div>';
      html+='<button onclick="saveToSlot('+i+')" style="padding:5px 10px;background:#0a1205;border:1px solid #1a3010;color:#60a060;font-size:9px;cursor:pointer">💾 저장</button>';
      html+='</div>';
    }
    html+='</div>';
  }

  html+='<div style="margin-top:8px;padding:6px 9px;background:#0a0a0a;border:1px dashed #2a2010;font-size:8px;color:var(--dim)">💡 브라우저 데이터 삭제 방지를 위해 중요 세이브는 전체 내보내기로 백업하세요</div>';
  body.innerHTML=html;
}
window.renderSaveSlotPanel = renderSaveSlotPanel;

window.renderSaveSlotPanel = renderSaveSlotPanel;

(function hookSaveSlotOpenP(){
  const t=function(){
    if(window._saveSlotOpenHooked) return;
    if(typeof window.openP!=='function'){ setTimeout(t,1500); return; }
    window._saveSlotOpenHooked=true;
    const _o=window.openP;
    window.openP=function(name){
      const r=_o.apply(this,arguments);
      if(name==='saves') setTimeout(renderSaveSlotPanel,100);
      return r;
    };
  };
  setTimeout(t,2500);
})();

console.log('[TaleForge] 다중 저장 슬롯 + 자동 저장 로드 완료 ✓');

export const SUMMON_DEPTH_KEY = 'tf-summon-depth';

export function loadSummonDepth(){ try{ return JSON.parse(lsGet(SUMMON_DEPTH_KEY)||'{}'); }catch(e){ return {}; } }
window.loadSummonDepth = loadSummonDepth;

export function saveSummonDepth(d){ try{ lsSet(SUMMON_DEPTH_KEY,JSON.stringify(d)); }catch(e){} }
window.saveSummonDepth = saveSummonDepth;

export function triggerSummonSecretStory(summonId){
  const summons = typeof window.loadSummons==='function' ? window.loadSummons() : [];
  const s = summons.find(function(x){ return x.id===summonId; });
  if(!s) return;

  const displayName = (s.customName||s.name);
  const catLabel = (typeof SUMMON_CATEGORY!=='undefined'&&SUMMON_CATEGORY[s.category]?SUMMON_CATEGORY[s.category].label:s.category)||'소환수';

  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n\n[💔 소환수 비밀 스토리 — 즉시 서사화 필수]\n'
    +displayName+'('+catLabel+' '+s.evoCount+'차 진화)이 처음으로 스스로 말을 꺼낸다.\n'
    +'이 소환수의 기원·원한·과거의 비밀을 지금까지의 서사 맥락에 맞게 창조하라.\n'
    +'단순한 설정 공개가 아니라 감정적으로 무게 있는 장면이어야 한다.\n'
    +'비밀 공개 후 플레이어와의 유대가 깊어지거나, 새로운 갈등이 생기거나, 한정 퀘스트가 시작된다.\n'
    +'GS: "summon_secret":{' +
    '"name":"'+displayName+'",' +
    '"secret":"비밀 내용",' +
    '"questUnlock":"한정 퀘스트 제목 (있으면)",' +
    '"affectionChange":20,' +
    '"loyaltyChange":15}';

  // 상태 기록
  const depth = loadSummonDepth();
  if(!depth[summonId]) depth[summonId]={secretRevealed:false,questActive:false,isDead:false,bonds:[]};
  depth[summonId].secretTriggered=true;
  saveSummonDepth(depth);

  toast('💔 '+(s.icon||'🔮')+' '+displayName+'이(가) 처음으로 과거를 털어놓으려 한다...', 5000);
}
window.triggerSummonSecretStory = triggerSummonSecretStory;

window.triggerSummonSecretStory = triggerSummonSecretStory;

// [버그 수정] 여기 있던 patchSummonEvoWithSecret(4차 진화 시 소환수 비밀
// 스토리 트리거)는 requestAISummonEvolution이 정의된 progression/089의
// 실제 호출부가 전부 bare 식별자라 한 번도 적용되지 못했다. 같은 로직을
// 실제 정의부(requestAISummonEvolution 본문)에 네이티브로 옮겼다.

export function checkSummonSynergies(){
  const summons = typeof window.loadSummons==='function' ? window.loadSummons()||[] : [];
  const active  = summons.filter(function(s){ return s.status==='active'; });
  if(active.length<2) return '';

  const results=[];
  SUMMON_SYNERGIES.forEach(function(syn){
    const hasA=active.some(function(s){ return s.category===syn.typeA; });
    const hasB=active.some(function(s){ return s.category===syn.typeB; });
    if(hasA&&hasB&&(syn.typeA!==syn.typeB)){
      results.push(syn.icon+' '+syn.desc);
    } else if(hasA&&hasB&&syn.typeA===syn.typeB&&active.filter(function(s){ return s.category===syn.typeA; }).length>=2){
      results.push(syn.icon+' '+syn.desc);
    }
  });
  return results.length ? '\n[소환수 시너지/충돌]\n'+results.join('\n') : '';
}
window.checkSummonSynergies = checkSummonSynergies;

window.checkSummonSynergies = checkSummonSynergies;

export function triggerSummonDeathStory(summonId){
  const summons = typeof window.loadSummons==='function' ? window.loadSummons() : [];
  const s = summons.find(function(x){ return x.id===summonId; });
  if(!s) return;

  const displayName = s.customName||s.name;
  const depth = loadSummonDepth();
  if(!depth[summonId]) depth[summonId]={secretRevealed:false,questActive:false,isDead:false,bonds:[]};
  if(depth[summonId].isDead) return; // 이미 죽음 처리됨
  depth[summonId].isDead=true;
  saveSummonDepth(depth);

  // 남기는 유물 결정 (카테고리별)
  const relics = {
    undead:    '부서진 갑옷 조각 (착용 시 소환수의 의지가 깃든 방어 효과)',
    spirit:    '정령의 결정 (강화 재료. 동일 계열 소환수에게 사용 시 특별 효과)',
    demon:     '봉인된 계약서 (다음 악마 계약 시 조건이 유리해짐)',
    beast:     '야수의 이빨 (장착 시 ATK +15, 야성 스킬 습득)',
    golem:     '마법진 파편 (구조체 소환 비용 -30%)',
    angel:     '깃털 하나 (신성 속성 +20%, 악마 계열 피해 면역 1회)',
    dragon:    '용린 하나 (장착 시 화염 피해 면역, ATK +20)',
    phantom:   '잔영의 구슬 (죽은 소환수의 스킬을 1회 사용 가능)',
    elemental: '원소의 파편 (원소 속성 공격 +25%)',
    construct: '핵심 마법석 (다음 구조체 제작 시 등급 상승)',
    other:     '기억의 결정 (소환수의 기억을 담은 결정)',
  };

  const relic = relics[s.category]||relics.other;

  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n\n[💀 소환수 죽음 — 극적으로 서사화 필수]\n'
    +displayName+'('+(s.catLabel||s.category)+' Lv.'+(s.level||1)+' '+(s.evoCount||0)+'차 진화)이(가) 쓰러졌다.\n'
    +'지금까지 함께한 모험, 나눈 대화, 성장 과정을 회상하며 마지막 순간을 극적으로 묘사하라.\n'
    +'단순한 소멸이 아니라 의미 있는 희생 또는 비극적 결말이어야 한다.\n'
    +'마지막 대사를 소환수의 성격('+s.personality+')에 맞게 부여하라.\n'
    +'남기는 유물: '+relic+'\n'
    +'GS: "summon_death_story":{"name":"'+displayName+'","lastWords":"마지막 대사","relic":"유물명","relicDesc":"유물 효과"}';

  toast('💀 '+(s.icon||'🔮')+' '+displayName+'... 쓰러졌다.', 5000);
  if(typeof addTimelineEvent==='function')
    addTimelineEvent('summon_death', displayName+' 전사', {icon:'💀'});
}
window.triggerSummonDeathStory = triggerSummonDeathStory;

window.triggerSummonDeathStory = triggerSummonDeathStory;

export function triggerSummonQuest(summonId, questType){
  const summons = typeof window.loadSummons==='function' ? window.loadSummons() : [];
  const s = summons.find(function(x){ return x.id===summonId; });
  if(!s) return;

  const displayName = s.customName||s.name;
  const questTypes = {
    origin:  '기원 탐구 — 이 소환수가 어디서 왔는지, 무엇이었는지 찾아가는 여정',
    revenge: '복수 — 이 소환수를 만들거나 구속했던 존재에 대한 복수',
    freedom: '속박 해방 — 소환수를 묶고 있는 옛 계약이나 저주를 풀어주는 퀘스트',
    bond:    '유대 강화 — 소환수와 더 깊이 연결되는 특별한 경험',
    ascend:  '초월 — 소환수가 자신의 한계를 넘어서기 위한 시련',
  };
  const qType = questType||Object.keys(questTypes)[Math.floor(Math.random()*Object.keys(questTypes).length)];
  const qDesc = questTypes[qType]||questTypes.origin;

  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n\n[⭐ 소환수 한정 퀘스트 발동]\n'
    +displayName+'이(가) 퀘스트를 의뢰한다: '+qDesc+'\n'
    +'이 퀘스트는 '+displayName+'만의 개인 서사와 직결된다.\n'
    +'퀘스트 내용을 서사 맥락에 맞게 자유롭게 설계하고 즉시 시작하라.\n'
    +'GS: "q_new":"summon_quest_'+summonId.slice(-4)+'" AND "summon_exp":[{"name":"'+displayName+'","exp":100}]';

  const depth=loadSummonDepth();
  if(!depth[summonId]) depth[summonId]={};
  depth[summonId].questActive=true;
  depth[summonId].questType=qType;
  saveSummonDepth(depth);

  toast('⭐ '+displayName+'이(가) 퀘스트를 의뢰했다!', 4000);
}
window.triggerSummonQuest = triggerSummonQuest;

window.triggerSummonQuest = triggerSummonQuest;

// [버그 수정] 여기 있던 extendSummonPanel(시너지 정보·소환수 한정 퀘스트
// 버튼 추가)는 renderSummons가 정의된 progression/089의 실제 호출부가
// 전부 bare 식별자라 한 번도 적용되지 못했다. 같은 로직을 실제 정의부
// (renderSummons 본문 끝)에 네이티브로 옮겼다.

(function hookSummonDeathStoryGS(){
  // [버그 수정] window.sendMsg 래핑은 실행된 적이 없었다 — window.processGSBlock(gs)를 대신 감싼다.
  const t=function(){
    if(window._summonDeathStoryHooked) return;
    if(typeof window.processGSBlock!=='function'){ setTimeout(t,1500); return; }
    window._summonDeathStoryHooked=true;
    const _o=window.processGSBlock;
    window.processGSBlock=function(gs){
      const r=_o.apply(this,arguments);
      try{
        if(gs){
          if(gs){
            // 소환수 비밀 공개
            if(gs.summon_secret){
              const sec=gs.summon_secret;
              const summons=typeof window.loadSummons==='function'?window.loadSummons():[];
              const s=summons.find(function(x){ return x.status==='active'&&(x.customName||x.name).includes((sec.name||'').slice(0,4)); });
              if(s){
                if(sec.affectionChange) s.affection=Math.min(100,(s.affection||0)+sec.affectionChange);
                if(sec.loyaltyChange) s.loyalty=Math.min(100,(s.loyalty||70)+sec.loyaltyChange);
                if(typeof window.saveSummons==='function') window.saveSummons(summons);
                if(typeof renderSummons==='function') renderSummons();
                const dep=loadSummonDepth(); if(dep[s.id]) dep[s.id].secretRevealed=true; saveSummonDepth(dep);
              }
            }
            // 소환수 죽음 서사
            if(gs.summon_death_story){
              const sd=gs.summon_death_story;
              if(sd.relic){
                if(Array.isArray(S.inventory)){
                  S.inventory.push({name:sd.relic, desc:sd.relicDesc||'', icon:'💎', rarity:'rare', source:'summon_relic'});
                  if(typeof saveInventory==='function') saveInventory(S.inventory);
                }
                toast('💎 '+sd.relic+' 획득!', 3000);
              }
            }
            // 소환수 죽음 → 죽음 서사 트리거
            if(Array.isArray(gs.summon_death)){
              gs.summon_death.forEach(function(name){
                const summons=typeof window.loadSummons==='function'?window.loadSummons():[];
                const s=summons.find(function(x){ return (x.customName||x.name).includes(name.slice(0,4)); });
                if(s) triggerSummonDeathStory(s.id);
              });
            }
          }
        }
      }catch(e){}
      return r;
    };
  };
  setTimeout(t,3000);
})();

(function hookSummonDepthBLS(){
  const t=function(){
    if(window._summonDepthBLSHooked) return;
    const fn=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn){ setTimeout(t,3000); return; }
    window._summonDepthBLSHooked=true;
    const _o=window[fn];
    window[fn]=function(){
      const r=_o.apply(this,arguments);
      try{
        const syn=checkSummonSynergies();
        const addon=syn?'\n\n'+syn+'\n소환수 시너지/충돌을 전투·대화 서사에 반영하라.':'';
        return addon&&typeof r==='string'?r+addon:r;
      }catch(e){ return r; }
    };
  };
  setTimeout(t,4500);
})();

console.log('[TaleForge] 소환수 심화 시스템 로드 완료 ✓');

export const ENDING_DB_KEY = 'tf-ending-db';

export function loadEndingDB(){ try{ return JSON.parse(lsGet(ENDING_DB_KEY)||'{}'); }catch(e){ return {}; } }
window.loadEndingDB = loadEndingDB;

export function saveEndingDB(d){ try{ lsSet(ENDING_DB_KEY,JSON.stringify(d)); }catch(e){} }
window.saveEndingDB = saveEndingDB;

export function getEndingBLS(){
  // NPC 용사 틱 업데이트
  try{ tickNPCHero(); }catch(e){}
  // 전투불능 동료·소환수 회복 체크
  try{
    if(typeof loadParty==='function'){
      const _party = loadParty();
      let _partyChanged = false;
      _party.forEach(m=>{
        if(m.alive===false && m.incapUntilTurn && (S.msgCount||0) >= m.incapUntilTurn){
          m.alive = true;
          m.hp    = Math.round((m.maxHp||100)*0.3); // 회복 후 HP 30%
          delete m.incapUntilTurn;
          delete m.incapReason;
          toast(`💚 ${m.name} 회복 — 전투에 복귀 가능`, 2500);
          S._nextInjectedContext = (S._nextInjectedContext||'')
            + `
[💚 회복] ${m.name}이(가) 부상에서 회복해 다시 전투에 참여할 수 있게 됐다. 자연스럽게 언급하라.`;
          _partyChanged = true;
        }
      });
      if(_partyChanged && typeof saveParty==='function') saveParty(_party);
    }
  }catch(e){}
  try{ if(typeof tickThrallLoyalty==='function') tickThrallLoyalty(); }catch(e){}
  try{ if(typeof tickEraRecord==='function') tickEraRecord(); }catch(e){}
  try{ if(typeof tickThrallDomainWSI==='function') tickThrallDomainWSI(); }catch(e){}
  // [BUG FIX] checkPartyLeave가 호출처가 전혀 없어 호감도/카르마/타락도/명성
  // 조건에 따른 동료 이탈 로직이 절대 발동하지 않던 버그. 매 턴 체크 추가.
  try{ if(typeof checkPartyLeave==='function') checkPartyLeave(); }catch(e){}
  // [BUG FIX] buildNpcNetwork가 호출처가 전혀 없어 NPC 친구/경쟁자 관계망이
  // 항상 빈 데이터였고, propagateRelationship(관계 변화 파급효과)이 실질적으로
  // 무력화돼 있던 버그. 매 턴 새 NPC에 대해 네트워크 자동 갱신.
  try{ if(typeof buildNpcNetwork==='function') buildNpcNetwork(); }catch(e){}
  // [CRITICAL BUG FIX] checkDemesneUnlockTrigger가 호출처가 전혀 없어 영지 경영이
  // 실제로 해금돼도 플레이어에게 알림 팝업이 절대 뜨지 않던 버그. 영지 패널을
  // 직접 열어보지 않으면 해금 사실 자체를 알 수 없었음.
  try{ if(typeof checkDemesneUnlockTrigger==='function') checkDemesneUnlockTrigger(); }catch(e){}
  // [신규] 재앙급 돌발 사건 — 정해진 턴 없이 극히 낮은 확률로 발동
  try{ if(typeof checkCatastropheEvent==='function') checkCatastropheEvent(); }catch(e){}
  try{ if(typeof tickCatastropheState==='function') tickCatastropheState(); }catch(e){}
  // 봉인석 단서 발견은 이제 GS의 seal_hint 필드(handleSealHint)로 처리됨 — 정적 위치/NPC 매칭 방식 제거

  const possible = window.checkEndingConditions();
  let result = '';

  // NPC 용사 컨텍스트
  try{
    const heroCtx = getNPCHeroBLSContext();
    if(heroCtx) result += heroCtx;
  }catch(e){}

  // [신규] 세계 위기도 — 전투직이든 비전투직(농부·상인·음유시인 등)이든
  // 공통으로 체감해야 하는 환경 변화를 AI에게 명시적으로 지시.
  try{
    const crisis = getWorldCrisisLevel();
    if(crisis >= 20){
      const tier = crisis >= 70 ? '심각' : crisis >= 45 ? '중대' : '경미';
      result += `\n\n[🌍 세계 위기도: ${crisis}/100 (${tier})] 현재 세계는 위기 상황에 있다. 플레이어의 직업·전투 참여 여부와 무관하게 다음을 서사에 자연스럽게 반영하라: `
        + `물가 상승과 생활고(상인의 물건이 잘 안 팔리거나 재료 구하기 어려움), 도적·몬스터 출몰 증가로 인한 이동·치안 불안, `
        + `피난민 유입이나 마을 분위기 침체, NPC들의 불안감과 잦은 위기 관련 대화. `
        + `농부라면 흉작·세금 인상·약탈 위협으로, 상인이라면 물류 차단·가격 폭등으로, 음유시인이라면 우울한 거리 분위기와 위로의 노래 수요 증가로 — `
        + `직업에 맞는 방식으로 위기를 체감하게 하라. 위기도가 높을수록 평화로운 일상 묘사보다 긴장감 있는 묘사를 우선하라.`;
    }
  }catch(e){}

  // 세계 배경 자동 진행 프롬프트
  try{
    const worldBg = getWorldBackgroundPrompt();
    if(worldBg) result += worldBg;
  }catch(e){}

  // 엔딩 암시
  if(possible.length){
    const lines = possible.slice(0,3).map(function(e){
      return (e.icon||'🏁')+' '+e.name+' (달성 가능성 '+e.probability+'%): '+e.desc;
    });
    result += '\n\n[🏁 달성 가능한 엔딩]\n'+lines.join('\n')
      +'\n현재 서사 방향이 위 엔딩 중 하나를 향하고 있다면 자연스럽게 암시하라.';
  }

  return result;
}
window.getEndingBLS = getEndingBLS;

window.getEndingBLS = getEndingBLS;

export function triggerEnding(endingId){
  // ENDING_DEFINITIONS 먼저 확인, 없으면 SECRET_ENDINGS에서 찾기
  let def = ENDING_DEFINITIONS[endingId];
  if(!def && typeof SECRET_ENDINGS !== 'undefined'){
    const se = SECRET_ENDINGS.find(function(e){ return e.id === endingId; });
    if(se) def = { id:se.id, icon:se.icon, name:se.name, desc:se.desc, hidden:true };
  }
  // checkEndingConditions 결과에서도 찾기
  if(!def){
    const cec = window.checkEndingConditions();
    const found = cec.find(function(e){ return e.id === endingId; });
    if(found) def = found;
  }
  if(!def){ toast('⚠️ 알 수 없는 엔딩: '+endingId, 2000); return; }

  const db = loadEndingDB();
  db[endingId]={ triggered:true, triggeredAt:S.msgCount||0, at:new Date().toISOString() };
  saveEndingDB(db);

  // [B67 FIX] 도전 과제 "진 엔딩 달성자"(true_ending_count)가 어디서도
  // 갱신되지 않아 진 엔딩을 달성해도 영원히 미달성으로 남던 버그.
  if(endingId==='true_ending' && typeof updateChallenge==='function') updateChallenge('true_ending_count', 1);

  // 세계 결과 플래그 기록
  try{
    const gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
    if(def.bad) gsF['bad_ending_triggered'] = true;
    else        gsF['good_ending_triggered'] = true;
    gsF['any_ending_triggered'] = endingId;
    if(typeof saveGSFlags==='function') saveGSFlags(gsF);
  }catch(e){}

  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n\n[🏁 엔딩 시작 — 즉시 서사화]\n'+(def.icon||'🏁')+' '+def.name+'\n'+def.desc
    +'\n\n이 엔딩을 극적으로, 감동적으로, 또는 비극적으로 — 그 성격에 맞게 — 완성하라.'
    +(def.bad?'\n이것은 배드 엔딩이다. 무겁고 처연한 분위기. 하지만 선택에는 의미가 있었다.':'')
    +(def.hidden?'\n이것은 히든 엔딩이다. 플레이어만 아는 진실로 마무리하라.':'')
    +'\n엔딩 이후 다음 회차 계승 보상을 GS로 출력: "ending_reward":{"title":"칭호명","bonus":"보너스 내용","legacy":"계승 아이템"}';

  if(typeof addTimelineEvent==='function')
    addTimelineEvent('ending', def.name, {icon:def.icon||'🏁'});
  // [13차 감사 FIX] misc/261의 showEndingCutscene 훅은 window.showEndingCutscene
  // 자체가 어디서도 정의된 적이 없어(엔딩 실행부는 처음부터 이 triggerEnding
  // 하나뿐이고 이름도 달랐다) _origEnding이 항상 undefined였고, 그래서
  // "다이어리 하이라이트·스탯 요약을 보여주는 연출 모달"(showEnhancedEndingCutscene,
  // misc/261에 완성돼 있음)이 한 번도 뜬 적이 없었다. 실제 엔딩 발동 지점인
  // 여기서 직접 호출한다.
  if(typeof window.showEnhancedEndingCutscene==='function')
    setTimeout(()=>window.showEnhancedEndingCutscene(def.name, def.desc), 2000);
  // [연결] 시나리오 클리어 관련 계승 시스템 — 사쿠라 엔딩 진행도, 차원 지도
  try{
    const _karmaForEnding = S.stats?.krma ?? 50;
    const _cycleForEnding = (typeof loadCycleCount==='function') ? loadCycleCount() : 0;
    // [B22 FIX] companionsSaved/grudgesLeft가 항상 null로 고정 전달되어
    // "원한 없는 엔딩"은 항상 통과, "동료 전원 생존"은 절대 통과 못 하던
    // 반대 방향의 두 오류. 실제 게임 상태로 계산해서 전달한다.
    if(typeof updateSakuraProgress==='function')
      updateSakuraProgress(S.scenario?.id, _karmaForEnding, !S._companionDiedThisLoop, (typeof getActiveGrudges==='function'?getActiveGrudges().length:0), _cycleForEnding);
    if(typeof addDimensionPin==='function')
      addDimensionPin(S.scenario?.name||S.scenario?.id, S.scenario?.id);
    if(typeof addHighlightReel==='function')
      addHighlightReel('final_battle', S.character?.name, S.scenario?.id);
    if(typeof earnSoulCrystal==='function') earnSoulCrystal(1);
    if(typeof recordAchievementRate==='function' && typeof ACHIEVEMENT_DEFS!=='undefined'){
      const _achOwned = (typeof loadAchievements==='function') ? Object.keys(loadAchievements()||{}).length : 0;
      const _achTotal = Object.keys(ACHIEVEMENT_DEFS).length || 1;
      const _achRate = (_achOwned/_achTotal)*100;
      recordAchievementRate(_achRate, S.scenario?.id);
      if(typeof recordClearQuality==='function') recordClearQuality(_achRate);
    }
    if(typeof saveFameLegacy==='function' && typeof determineFame==='function'){
      const _fameResult = determineFame(S.stats?.rep||0, S.stats?.fear||0, _karmaForEnding);
      saveFameLegacy(_fameResult);
    }
    if(typeof setGodAlignment==='function') setGodAlignment(_karmaForEnding);
    if(typeof recordSurvivorCompanion==='function' && typeof loadParty==='function'){
      const _survivors = loadParty()||[];
      _survivors.forEach(m=>{
        if(m.alive!==false) recordSurvivorCompanion(m.name, m.relationship||m.trustLevel||50, true, S.scenario?.id);
      });
    }
    if(typeof recordSummonLegacy==='function' && typeof window.loadSummons==='function'){
      const _summons = window.loadSummons()||[];
      _summons.filter(s=>(s.affection||0)>=50 || (s.loyalty||0)>=80).forEach(s=>{
        const _bondScore = Math.max(s.affection||0, s.loyalty||0);
        recordSummonLegacy(s.name, s.category||'미지의 존재', Math.min(10, Math.ceil(_bondScore/10)), S.scenario?.id);
      });
    }
    let _rankResultForDeify = null;
    if(typeof updateRank==='function'){
      const _achOwnedForRank = (typeof loadAchievements==='function') ? Object.keys(loadAchievements()||{}).length : 0;
      const _endingTypeForRank = def.bad ? 'villain' : (def.hidden ? 'sacrifice' : (_karmaForEnding<=30?'hero':'neutral'));
      _rankResultForDeify = updateRank(_cycleForEnding, _endingTypeForRank, _achOwnedForRank);
    }
    if(!def.bad && _karmaForEnding<=20 && typeof foundKingdom==='function' && typeof KINGDOM_TYPES!=='undefined'){
      const _kJobId = (S.character?.jobId||S.character?.role||'').toLowerCase();
      const _kType = /마법|mage/.test(_kJobId) ? 'mage_tower'
        : /사제|성기사|priest|holy/.test(_kJobId) ? 'holy_order'
        : /상인|merchant/.test(_kJobId) ? 'merchant_guild'
        : /기사|knight/.test(_kJobId) ? 'knighthood' : 'kingdom';
      foundKingdom(_kType, S.character?.name?(S.character.name+'의 유산'):null, S.scenario?.id);
    }
    if(typeof unlockForbiddenSkill==='function'){
      unlockForbiddenSkill('any_ending');
      if(def.bad) unlockForbiddenSkill('villain');
      if(_cycleForEnding>=5) unlockForbiddenSkill('5plus_cycles');
    }
    if(typeof updateDeification==='function'){
      if(_cycleForEnding>=100) updateDeification('century_cycle');
      if(_karmaForEnding<=20) updateDeification('karma_pure');
      // [B27 FIX] "신급 윤회자"(rank_divine) 조건 — updateRank()가 방금
      // 계산한 윤회 등급이 3(신급) 이상이면 신격화 조건 충족.
      if((_rankResultForDeify?.rank||0) >= 3) updateDeification('rank_divine');
      // [B27 FIX] "모든 엔딩 경험"(all_endings) 조건 — 일반/영웅/비극/히든
      // 4개 엔딩 유형을 전부 경험했는지 누적 추적.
      try{
        const _endingCatSeen = JSON.parse(lsGet('tf-deify-ending-cats')||'[]');
        const _endingCat = def.hidden ? 'hidden' : (def.bad ? 'tragic' : (_karmaForEnding<=30 ? 'hero' : 'normal'));
        if(!_endingCatSeen.includes(_endingCat)) _endingCatSeen.push(_endingCat);
        lsSet('tf-deify-ending-cats', JSON.stringify(_endingCatSeen));
        if(['hidden','tragic','hero','normal'].every(c=>_endingCatSeen.includes(c))) updateDeification('all_endings');
      }catch(e){}
    }
    if(typeof saveFameLegacy==='function' && typeof determineFame==='function'){
      const _fame = determineFame(S.stats?.rep||0, S.stats?.fear||0, _karmaForEnding);
      saveFameLegacy(_fame);
    }
    if(typeof recordMythChapter==='function') recordMythChapter(def.bad?'sacrifice':'ascension', S.character?.name, S.scenario?.id);
    if(!def.bad && typeof earnTimeToken==='function') earnTimeToken('legendary_act');
    if(typeof growDawn==='function') growDawn(def.bad ? 20 : (_karmaForEnding<=30?90:_karmaForEnding<=50?60:30));
    if(typeof growWorldTree==='function'){
      const _endingTypeForTree = def.bad ? 'villain' : (def.hidden ? 'sacrifice' : (_karmaForEnding<=30?'hero':'neutral'));
      growWorldTree(_endingTypeForTree);
      if(typeof recordPastTheme==='function') recordPastTheme(_endingTypeForTree);
      if(typeof recordAnnalEntry==='function'){
        const _goalForAnnal = (typeof loadCycleGoal==='function') ? loadCycleGoal() : null;
        const _highlightsForAnnal = (typeof loadHighlights==='function') ? loadHighlights() : [];
        recordAnnalEntry(S.character?.name, S.character?.race, S.character?.role,
          S.scenario?.id, _endingTypeForTree, _goalForAnnal?.id, _cycleForEnding, _highlightsForAnnal);
      }
    }
  }catch(e){}
  toast((def.icon||'🏁')+' '+def.name+' 엔딩 시작...', 5000);
}
window.triggerEnding = triggerEnding;

window.triggerEnding = triggerEnding;

export const DUNGEON_STATE_KEY = 'tf-dungeon-state';

export function enterDungeon(dungeonName, totalFloors, theme){
  const state={
    name:       dungeonName,
    theme:      theme||'stone',
    totalFloors: totalFloors||5,
    currentFloor: 1,
    exploredRooms: [],
    secretRooms:   [],
    floorEvents:   {},
    bossFloor:     totalFloors||5,
    enteredAt:     S.msgCount||0,
    explorationRate: 0,
  };
  saveDungeonState(state);

  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n\n[🏚️ 던전 진입: '+dungeonName+'] 총 '+totalFloors+'층. 현재 1층.\n'
    +'각 층에는 다음 중 1~3개가 존재한다: 몬스터 방·함정·비밀 방·상인·보물·보스(마지막 층)\n'
    +'탐험하며 층을 이동할 때마다 GS: "dungeon_floor":{"floor":2,"event":"monster|trap|secret|merchant|treasure|boss"}';

  toast('🏚️ '+dungeonName+' 진입! ('+totalFloors+'층 던전)', 3000);
}
window.enterDungeon = enterDungeon;

window.enterDungeon = enterDungeon;

export function getDungeonBLS(){
  const state = loadDungeonState();
  if(!state) return '';
  return '\n\n[🏚️ 던전 현황: '+state.name+']\n'
    +'현재 '+state.currentFloor+'층 / '+state.totalFloors+'층 · 탐험도 '+Math.round(state.explorationRate)+'%\n'
    +'보스 층: '+state.bossFloor+'층\n'
    +'GS dungeon_floor:{floor:N,event:"monster|trap|secret|merchant|treasure|boss"} — 층 이동 및 이벤트 발생 시';
}
window.getDungeonBLS = getDungeonBLS;

window.getDungeonBLS = getDungeonBLS;

export const EXPLORE_KEY = 'tf-exploration';

export function loadExploration(){ try{ return JSON.parse(lsGet(EXPLORE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadExploration = loadExploration;

export function saveExploration(d){ try{ lsSet(EXPLORE_KEY,JSON.stringify(d)); }catch(e){} }
window.saveExploration = saveExploration;

export function updateExploration(locationId, delta){
  const exp = loadExploration();
  if(!exp[locationId]) exp[locationId]={ rate:0, secrets:[], visits:0 };
  exp[locationId].rate = Math.min(100, (exp[locationId].rate||0)+(delta||10));
  exp[locationId].visits = (exp[locationId].visits||0)+1;

  // 탐험도 달성 시 비밀 장소 힌트
  if(exp[locationId].rate>=50 && !exp[locationId].hinted50){
    exp[locationId].hinted50=true;
    S._nextInjectedContext=(S._nextInjectedContext||'')
      +'\n[🗺️ 탐험도 50%] '+locationId+' 탐험도가 50%에 달했다. 숨겨진 장소나 비밀 통로의 단서를 자연스럽게 암시하라.';
  }
  if(exp[locationId].rate>=100 && !exp[locationId].completed){
    exp[locationId].completed=true;
    S._nextInjectedContext=(S._nextInjectedContext||'')
      +'\n[🗺️ 탐험 완료] '+locationId+' 완전 탐험! 비밀 보상을 서사에 등장시켜라. GS: "exploration_reward":{"location":"'+locationId+'","reward":"보상 내용"}';
    toast('🗺️ '+locationId+' 완전 탐험!', 3000);
  }
  saveExploration(exp);
}
window.updateExploration = updateExploration;

window.updateExploration = updateExploration;

export function getExplorationBLS(){
  const exp = loadExploration();
  const loc = typeof loadCurrentLocation==='function' ? loadCurrentLocation() : null;
  const locId = loc ? (loc.id||loc.name||'unknown') : null;
  if(!locId) return '';
  const locExp = exp[locId]||{rate:0,visits:0};
  if(locExp.rate<5) return '';
  return '\n\n[🗺️ 현재 장소 탐험도: '+Math.round(locExp.rate)+'%]\n'
    +(locExp.rate<50?'아직 많은 곳이 탐험되지 않았다.':locExp.rate<100?'절반 이상 탐험됐다. 숨겨진 장소가 있을 것 같다.':'완전히 탐험됐다. 비밀이 드러났다.')
    +'\nGS: "explored":{"location":"'+locId+'","rate_delta":10} — 탐험 진전 시';
}
window.getExplorationBLS = getExplorationBLS;

window.getExplorationBLS = getExplorationBLS;

// [AI 제거] patchStreamingAI — window.callAI를 감싸 Gemini
// streamGenerateContent로 직접 fetch하던 스트리밍 패치. 이제 callAI
// 자체가 완전히 로컬 조합(quest/086의 composeLocalTurnText)으로만
// 동작하므로, 라이브 AI를 호출할 수 있는 마지막 코드 경로였던 이
// 패치를 통째로 제거한다.

(function hookPatch05BLS(){
  const t=function(){
    if(window._patch05BLSHooked) return;
    const fn=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn){ setTimeout(t,3000); return; }
    window._patch05BLSHooked=true;
    const _o=window[fn];
    window[fn]=function(){
      const r=_o.apply(this,arguments);
      try{
        const parts=[];
        const e=getEndingBLS(); if(e) parts.push(e);
        const d=getDungeonBLS(); if(d) parts.push(d);
        const ex=getExplorationBLS(); if(ex) parts.push(ex);
        if(!parts.length) return r;
        return typeof r==='string'?r+parts.join(''):r;
      }catch(e){ return r; }
    };
  };
  setTimeout(t,4600);
})();

(function hookPatch05GS(){
  // [버그 수정 — 가장 중요] window.sendMsg 래핑은 sendMsg()가 quest/086
  // 안에서 모듈 바인딩으로 직접 호출돼 실행된 적이 없었다. 이 훅이 죽어있는
  // 동안 gs.trigger_ending(엔딩 발동)이 한 번도 처리되지 않아 — AI가
  // <gs>{"trigger_ending":...}</gs>를 출력해도 실제 엔딩 컷신이 절대
  // 뜨지 않았을 것이다. window.processGSBlock(gs)를 대신 감싼다.
  const t=function(){
    if(window._patch05GSHooked) return;
    if(typeof window.processGSBlock!=='function'){ setTimeout(t,1500); return; }
    window._patch05GSHooked=true;
    const _o=window.processGSBlock;
    window.processGSBlock=function(gs){
      const r=_o.apply(this,arguments);
      try{
        if(gs){
          if(gs){
            // 던전 층 이동
            if(gs.dungeon_floor){
              const df=gs.dungeon_floor;
              const state=loadDungeonState();
              if(state){
                state.currentFloor=df.floor||state.currentFloor;
                state.explorationRate=Math.min(100,(state.explorationRate||0)+Math.round(100/state.totalFloors));
                if(df.event) state.floorEvents[df.floor]=df.event;
                if(df.event==='secret'){
                  state.secretRooms.push(df.floor);
                  // [B67 FIX] "비밀 탐정" 도전 과제 트래킹
                  if(typeof updateChallenge==='function'){
                    const src = (parseInt(lsGet('tf-secret-rooms-total')||'0',10)||0) + 1;
                    lsSet('tf-secret-rooms-total', String(src));
                    updateChallenge('secret_rooms_found', src);
                  }
                }
                saveDungeonState(state);
              }
            }
            // 던전 탈출
            if(gs.dungeon_exit) clearDungeonState();
            // 탐험도
            if(gs.explored){
              const ex=gs.explored;
              updateExploration(ex.location||'unknown', ex.rate_delta||10);
            }
            // 엔딩 트리거
            if(gs.trigger_ending) triggerEnding(gs.trigger_ending);
            // 엔딩 보상 (다음 회차 계승)
            if(gs.ending_reward){
              const er=gs.ending_reward;
              if(er.title && typeof grantTitle==='function') grantTitle({id:'ending_'+Date.now(),name:er.title,desc:er.bonus||''});
            }
          }
        }
        // 탐험 키워드 감지
        // [B65 FIX] txt가 이 스코프에 선언된 적이 없어 ReferenceError로
        // 이 블록이 항상 조용히 실패하던 버그.
        const txt = (S.messages||[]).filter(m=>m.role==='assistant').slice(-1)[0]?.content || '';
        if(txt.includes('탐험했')||txt.includes('발견했')||txt.includes('조사했')){
          const loc=typeof loadCurrentLocation==='function'?loadCurrentLocation():null;
          if(loc) updateExploration(loc.id||loc.name||'unknown', 5);
        }
      }catch(e){}
      return r;
    };
  };
  setTimeout(t,2800);
})();

console.log('[TaleForge] 엔딩/던전/탐험/스트리밍 시스템 로드 완료 ✓');

export const NPC_OFFSCREEN_KEY = 'tf-npc-offscreen';

export const NPC_REPORT_KEY    = 'tf-npc-reports';

export function loadOffscreenDB(){ try{ return JSON.parse(lsGet(NPC_OFFSCREEN_KEY)||'{}'); }catch(e){ return {}; } }
window.loadOffscreenDB = loadOffscreenDB;

export function saveOffscreenDB(d){ try{ lsSet(NPC_OFFSCREEN_KEY,JSON.stringify(d)); }catch(e){} }
window.saveOffscreenDB = saveOffscreenDB;

export function loadNpcReports(){ try{ return JSON.parse(lsGet(NPC_REPORT_KEY)||'[]'); }catch(e){ return []; } }
window.loadNpcReports = loadNpcReports;

export function saveNpcReports(d){ try{ lsSet(NPC_REPORT_KEY,JSON.stringify(d)); }catch(e){} }
window.saveNpcReports = saveNpcReports;

export function scheduleNpcOffscreen(npcName, action, turnsLater, context){
  const db = loadOffscreenDB();
  const scheduledTurn = (S.msgCount||0) + (turnsLater||5);
  if(!db[npcName]) db[npcName] = [];
  db[npcName].push({ action, scheduledTurn, context:context||'', done:false, id:'os_'+Date.now() });
  saveOffscreenDB(db);
}
window.scheduleNpcOffscreen = scheduleNpcOffscreen;

window.scheduleNpcOffscreen = scheduleNpcOffscreen;

export function isPlayerCutOffFromNews(){
  if(S._inCombat) return true;
  const lastAi = (S.messages||[]).slice().reverse().find(m=>m && m.role==='assistant');
  const t = (lastAi && lastAi.content) || '';
  return /사슬|쇠사슬|결박|포로|감금|노예|구속|묶인|묶여|족쇄|투옥|감옥|인질/.test(t);
}
window.isPlayerCutOffFromNews = isPlayerCutOffFromNews;

export function checkOffscreenEvents(){
  const db      = loadOffscreenDB();
  const cur     = S.msgCount||0;
  const pending = [];

  Object.entries(db).forEach(function(entry){
    const name = entry[0], events = entry[1];
    events.forEach(function(ev){
      if(!ev.done && cur >= ev.scheduledTurn){
        ev.done = true;
        pending.push({ name, ...ev });
      }
    });
  });
  saveOffscreenDB(db);
  if(!pending.length) return;

  // 플레이어가 지금 외부 소식을 들을 수 없는 상황(포로/결박/전투 등)이면
  // 본문에 끼워넣지 않고 NPC 동향 패널에만 조용히 기록한다.
  if(isPlayerCutOffFromNews()){
    const silentReports = pending.map(function(ev){
      const actDef = NPC_OFFSCREEN_ACTIONS[ev.action]||{label:ev.action, impact:'알 수 없는 결과'};
      return { name:ev.name, result:actDef.label+' 완료 — '+actDef.impact+(ev.context?' ('+ev.context+')':''), impact:'world', severity:'low' };
    });
    processOffscreenReport(silentReports);
    return;
  }

  // AI에게 결과 생성 요청
  const lines = pending.map(function(ev){
    const actDef = NPC_OFFSCREEN_ACTIONS[ev.action]||{label:ev.action, impact:'알 수 없는 결과'};
    return ev.name+'이(가) '+actDef.label+' 행동을 마쳤다. 결과: '+actDef.impact+(ev.context?' (맥락: '+ev.context+')':'');
  });

  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n\n[📨 NPC 오프스크린 행동 결과 — 자연스럽게 보고 형식으로 서사화]\n'
    +lines.join('\n')
    +'\n각 NPC의 행동 결과를 편지·전령·소문·직접 등장 등 다양한 방식으로 플레이어에게 전달하라.'
    +'\nGS: "npc_offscreen_result":[{"name":"NPC명","result":"결과 요약","impact":"world|quest|relation","severity":"low|medium|high"}]';
}
window.checkOffscreenEvents = checkOffscreenEvents;

window.checkOffscreenEvents = checkOffscreenEvents;

window._offscreenSchedulerTurn = 0;

export function runOffscreenScheduler(){
  const cur = S.msgCount||0;
  if(cur - window._offscreenSchedulerTurn < 10) return;
  window._offscreenSchedulerTurn = cur;

  const npcs = typeof loadNPCs==='function' ? loadNPCs()||[] : [];
  const npcDB = typeof loadNpcDB==='function' ? loadNpcDB() : {};

  npcs.slice(0,6).forEach(function(npc){
    if(!npc.name) return;
    const mem = npcDB[npc.name]||{};
    const loyalty = mem.trust||50;
    const betrayRisk = mem.betrayalRisk||0;
    const relation = (mem.relation&&mem.relation.score)||0;

    // 행동 결정 로직
    let action = 'research';
    if(betrayRisk > 60) action = 'betray';
    else if(loyalty > 70 && relation > 50) action = 'grow';
    else if(relation < -30) action = 'conflict';
    else if(mem.fear > 70) action = 'disappear';
    else action = ['investigate','research','negotiate'][Math.floor(Math.random()*3)];

    scheduleNpcOffscreen(npc.name, action, 3+Math.floor(Math.random()*7), '자동 스케줄');
  });
}
window.runOffscreenScheduler = runOffscreenScheduler;

window.runOffscreenScheduler = runOffscreenScheduler;

export function processOffscreenReport(reports){
  if(!Array.isArray(reports)) return;
  const stored = loadNpcReports();
  reports.forEach(function(rep){
    if(!rep||!rep.name) return;
    stored.push({ ...rep, turn:S.msgCount||0, at:new Date().toISOString() });
    // 메모리 DB 반영
    if(typeof upsertNpc==='function'){
      if(rep.impact==='relation') upsertNpc(rep.name,{ fact:'오프스크린: '+rep.result });
      if(rep.impact==='quest' && typeof upsertQuest==='function') upsertQuest('os_'+Date.now(),{ title:'[오프스크린] '+rep.name, moment:rep.result });
    }
    if(rep.severity==='high' && typeof addEvent==='function'){
      addEvent({ title:rep.name+' 오프스크린 사건', desc:rep.result, tags:['npc','offscreen'], worldImpact:5 });
    }
  });
  if(stored.length>100) stored.splice(0,stored.length-100);
  saveNpcReports(stored);
}
window.processOffscreenReport = processOffscreenReport;

window.processOffscreenReport = processOffscreenReport;

export function renderOffscreenPanel(){
  const reports = loadNpcReports().slice(-8).reverse();
  const body = document.getElementById('pb-offscreen');
  if(!body) return;
  let html = '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">📨 NPC 동향</div>';
  if(!reports.length){
    html += '<div style="text-align:center;padding:18px;color:var(--dim);font-size:10px">아직 보고된 NPC 동향이 없습니다</div>';
  } else {
    reports.forEach(function(r){
      const sevColor = r.severity==='high'?'#e05050':r.severity==='medium'?'#c0a030':'#6a8a6a';
      html += '<div style="padding:8px 10px;background:#090600;border:1px solid '+sevColor+'33;border-left:3px solid '+sevColor+';margin-bottom:5px">'
        +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">'
        +'<span style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold)">'+esc(r.name)+'</span>'
        +'<span style="font-size:8px;color:'+sevColor+';background:'+sevColor+'22;padding:1px 4px;border-radius:2px">'+(r.severity==='high'?'⚠️ 긴급':r.severity==='medium'?'📋 보통':'💬 일반')+'</span>'
        +'<span style="font-size:8px;color:var(--dim);margin-left:auto">'+r.turn+'턴</span></div>'
        +'<div style="font-size:9px;color:var(--dim);line-height:1.4">'+esc(r.result||'')+'</div>'
        +'</div>';
    });
  }
  html += '<button onclick="runOffscreenScheduler()" style="width:100%;margin-top:8px;padding:6px;background:#0a0600;border:1px solid #2a1a05;color:#806030;font-size:8px;cursor:pointer">🔄 NPC 행동 갱신</button>';
  body.innerHTML = html;
}
window.renderOffscreenPanel = renderOffscreenPanel;

window.renderOffscreenPanel = renderOffscreenPanel;

(function injectOffscreenPanel(){
  const t=function(){
    if(window._offscreenPanelInjected) return;
    if(!document.getElementById('pb-memory')){ setTimeout(t,1000); return; }
    if(!document.getElementById('pb-offscreen')){
      const ref=document.getElementById('p-memory');
      if(!ref){ setTimeout(t,500); return; }
      const div=document.createElement('div');
      div.className='panel-ov'; div.id='p-offscreen';
      div.innerHTML='<div class="panel"><div class="p-hdr"><span class="p-title">📨 NPC 동향</span><button class="p-close" onclick="closeP(\'offscreen\')">✕</button></div><div class="p-body scrollable" id="pb-offscreen"></div></div>';
      ref.parentNode.insertBefore(div,ref.nextSibling);
    }
    const memBtn=document.querySelector('.grp-sub-btn[onclick*="memory"]');
    if(memBtn&&!document.querySelector('.grp-sub-btn[onclick*="offscreen"]')){
      const btn=document.createElement('button');
      btn.className='grp-sub-btn';
      btn.setAttribute('onclick',"openP('offscreen');closeGrp()");
      btn.innerHTML='📨 NPC 동향';
      memBtn.parentNode.insertBefore(btn,memBtn.nextSibling);
    }
    window._offscreenPanelInjected=true;
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',t);
  else setTimeout(t,2000);
})();

(function hookOffscreenOpenP(){
  const t=function(){
    if(window._offscreenOpenHooked) return;
    if(typeof window.openP!=='function'){ setTimeout(t,1500); return; }
    window._offscreenOpenHooked=true;
    const _o=window.openP;
    window.openP=function(name){
      const r=_o.apply(this,arguments);
      if(name==='offscreen') setTimeout(renderOffscreenPanel,100);
      return r;
    };
  };
  setTimeout(t,2500);
})();

(function hookOffscreenSendMsg(){
  // [버그 수정] window.sendMsg 래핑은 한 번도 실행되지 않았다. gs 필드
  // 처리(npc_offscreen_result)는 window.processGSBlock(gs)를 대신 감싼다.
  // 매 턴 무조건 도는 runOffscreenScheduler/checkOffscreenEvents는 gs와
  // 무관하므로 quest/086의 sendMsg() 안에 네이티브로 옮겼다(다른 매턴
  // 훅들과 같은 자리).
  const t=function(){
    if(window._offscreenSendHooked) return;
    if(typeof window.processGSBlock!=='function'){ setTimeout(t,1500); return; }
    window._offscreenSendHooked=true;
    const _o=window.processGSBlock;
    window.processGSBlock=function(gs){
      const r=_o.apply(this,arguments);
      try{
        if(gs&&gs.npc_offscreen_result) processOffscreenReport(gs.npc_offscreen_result);
      }catch(e){}
      return r;
    };
  };
  setTimeout(t,3000);
})();

(function hookOffscreenBLS(){
  const t=function(){
    if(window._offscreenBLSHooked) return;
    const fn=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn){ setTimeout(t,3000); return; }
    window._offscreenBLSHooked=true;
    const _o=window[fn];
    window[fn]=function(){
      const r=_o.apply(this,arguments);
      try{
        const db=loadOffscreenDB();
        const pending=[];
        const cur=S.msgCount||0;
        Object.entries(db).forEach(function(e){
          e[1].filter(function(ev){ return !ev.done&&ev.scheduledTurn<=cur+3; }).forEach(function(ev){
            const act=NPC_OFFSCREEN_ACTIONS[ev.action]||{label:ev.action};
            pending.push(e[0]+': '+act.label+' 예정');
          });
        });
        if(!pending.length) return r;
        if(typeof isPlayerCutOffFromNews==='function' && isPlayerCutOffFromNews()) return r;
        const bls='\n\n[📨 NPC 오프스크린 예정 행동]\n'+pending.slice(0,5).join('\n')+'\n이 NPC들이 곧 독립 행동을 완료한다. 서사에서 자연스럽게 그 결과가 전달되도록 준비하라.';
        return typeof r==='string'?r+bls:r;
      }catch(e){ return r; }
    };
  };
  setTimeout(t,4700);
})();

console.log('[TaleForge] NPC 오프스크린 시스템 로드 완료 ✓');

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_135(){
function renderSavePanel(){
  const body = document.getElementById('pb-save');
  if(!body) return;

  // 현재 데이터 규모 계산
  let totalBytes = 0;
  const dbSizes  = {};
  try{
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key||((!key.startsWith('taleforge-'))&&(!key.startsWith('tf-')))) continue;
      const val=localStorage.getItem(key)||'';
      totalBytes+=val.length;
      const label=key.replace('taleforge-','').replace('tf-','').replace('db-','').replace('-v3','').replace('-v2','');
      dbSizes[label]=(val.length/1024).toFixed(1)+'KB';
    }
  }catch(e){}

  const charName=(S.character&&S.character.name)||'캐릭터 없음';
  const loopCount=typeof loadCycleCount==='function'?loadCycleCount():0;

  let html='<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">💾 저장 / 불러오기</div>';

  // 현재 저장 상태
  html+='<div style="padding:8px 10px;background:#090600;border:1px solid #2a1a05;margin-bottom:10px">';
  html+='<div style="font-size:9px;color:var(--gold);margin-bottom:4px">'+charName+'</div>';
  html+='<div style="font-size:9px;color:var(--dim)">턴: '+(S.msgCount||0)+' · 회차: '+loopCount+' · 총 데이터: '+(totalBytes/1024).toFixed(1)+'KB</div>';
  html+='</div>';

  // 전체 내보내기/불러오기
  html+='<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">전체 저장/불러오기</div>';
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">';
  html+='<button onclick="exportAllData()" style="padding:10px 6px;background:#0a1020;border:1px solid #204060;color:#60a0e0;font-family:\'Cinzel\',serif;font-size:10px;cursor:pointer">💾 내보내기<br><span style="font-size:8px;opacity:.7">전체 JSON 다운로드</span></button>';
  html+='<label style="padding:10px 6px;background:#0a1808;border:1px solid #204020;color:#60c060;font-family:\'Cinzel\',serif;font-size:10px;cursor:pointer;text-align:center;display:block">📂 불러오기<br><span style="font-size:8px;opacity:.7">JSON 파일 선택</span><input type="file" accept=".json" onchange="importAllData(this.files[0])" style="display:none"></label>';
  html+='</div>';

  // DB별 현황 및 부분 내보내기
  html+='<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">DB별 현황</div>';

  const dbList=[
    {id:'npc',    icon:'👤', label:'NPC DB',      size:dbSizes['db-npc']||'0KB'},
    {id:'quest',  icon:'📜', label:'퀘스트 DB',   size:dbSizes['db-quest']||'0KB'},
    {id:'event',  icon:'⚡', label:'사건 DB',     size:dbSizes['db-event']||'0KB'},
    {id:'player', icon:'🧍', label:'플레이어 DB', size:dbSizes['db-player']||'0KB'},
    {id:'world',  icon:'🌍', label:'세계 DB',     size:dbSizes['db-world']||'0KB'},
    {id:'summon', icon:'🔮', label:'소환수 DB',   size:dbSizes['summons']||'0KB'},
    {id:'religion',icon:'⛪',label:'종교 DB',     size:dbSizes['religion-state']||'0KB'},
    {id:'summary',icon:'📖', label:'요약 DB',     size:dbSizes['db-summary']||'0KB'},
  ];

  html+='<div style="display:flex;flex-direction:column;gap:3px;margin-bottom:10px">';
  dbList.forEach(db=>{
    html+='<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:#090600;border:1px solid #1a1005">'
      +'<span style="font-size:12px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(db,{size:14}):(db?.icon))+'</span>'
      +'<span style="font-size:9px;color:var(--text);flex:1">'+db.label+'</span>'
      +'<span style="font-size:8px;color:var(--dim)">'+db.size+'</span>'
      +'<button onclick="exportDB(\''+db.id+'\')" style="padding:2px 7px;background:#0a0600;border:1px solid #2a1a05;color:#806040;font-size:8px;cursor:pointer">저장</button>'
      +'</div>';
  });
  html+='</div>';

  // 자동저장 안내
  html+='<div style="padding:7px 9px;background:#0a0a0a;border:1px dashed #2a2010;font-size:8px;color:var(--dim);line-height:1.6">'
    +'💡 데이터는 브라우저 localStorage에 자동 저장됩니다.<br>'
    +'브라우저 데이터 삭제 시 초기화되므로 중요한 세이브는 내보내기로 백업하세요.<br>'
    +'내보낸 JSON 파일은 다른 기기에서도 불러올 수 있습니다.</div>';

  body.innerHTML=html;
}
window.renderSavePanel = renderSavePanel;

window.renderSavePanel=renderSavePanel;

window.STATUS_EFFECTS = {
  poison:    { icon:'☠️', name:'독',     color:'#60a020', desc:'매 턴 최대HP의 5% 피해',    duration:3, stat:'def',  stackable:false },
  burn:      { icon:'🔥', name:'화상',   color:'#e06020', desc:'매 턴 HP 8% 피해, DEF -20%', duration:2, stat:'def',  stackable:false },
  freeze:    { icon:'❄️', name:'빙결',   color:'#60c0e0', desc:'행동 불능, 물리 피해 시 해제', duration:1, stat:'spd',  stackable:false },
  paralysis: { icon:'⚡', name:'마비',   color:'#c0a020', desc:'행동 확률 50% 감소',         duration:2, stat:'spd',  stackable:false },
  stun:      { icon:'💫', name:'기절',   color:'#a0a020', desc:'1턴 행동 불능',              duration:1, stat:'spd',  stackable:false },
  bleed:     { icon:'🩸', name:'출혈',   color:'#c02020', desc:'매 턴 고정 피해, 치유 효율 -50%', duration:4, stat:'hp', stackable:true },
  curse:     { icon:'💀', name:'저주',   color:'#800080', desc:'모든 스탯 -30%',             duration:3, stat:'all',  stackable:false },
  fear:      { icon:'😱', name:'공황',   color:'#806020', desc:'공격력 -40%, 도망 확률 +50%', duration:2, stat:'atk',  stackable:false },
  petrify:   { icon:'🪨', name:'석화',   color:'#808060', desc:'완전 행동 불능, DEF +50%',   duration:2, stat:'spd',  stackable:false },
  silence:   { icon:'🔇', name:'침묵',   color:'#606080', desc:'마법·스킬 사용 불가',        duration:2, stat:'mgc',  stackable:false },
  bless:     { icon:'✨', name:'신성 축복', color:'#e0d060', desc:'모든 피해 20% 감소, HP 재생', duration:3, stat:'def', stackable:false, positive:true },
  haste:     { icon:'💨', name:'신속',   color:'#60d060', desc:'SPD +50%, 추가 행동 기회',   duration:2, stat:'spd',  stackable:false, positive:true },
  barrier:   { icon:'🛡️', name:'장벽',   color:'#4060c0', desc:'다음 피해 1회 완전 무효화', duration:999, stat:'def', stackable:false, positive:true, charges:1 },
};

function loadStatusEffects(){ try{ return JSON.parse(lsGet(STATUS_STATE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadStatusEffects = loadStatusEffects;

window.renderSavePanel = renderSaveSlotPanel;

function checkEndingConditions(){
  const restoreState = typeof loadSealRestore==='function' ? loadSealRestore() : {};
  const sealOrder    = typeof loadSealOrder==='function' ? loadSealOrder() : [];
  const loopCount    = typeof v36_getReincarnationCount==='function' ? v36_getReincarnationCount() : 0;
  const worldDB      = typeof loadWorldDB==='function' ? loadWorldDB() : {};
  const playerDB     = typeof loadPlayerDB==='function' ? loadPlayerDB() : {};
  const gsFlags      = typeof loadGSFlags==='function' ? loadGSFlags() : {};
  const actions      = typeof loadJobActions==='function' ? loadJobActions() : {};
  const reinc        = typeof loadCycleCount==='function' ? loadCycleCount() : 0;
  const karmaScore   = (typeof S!=='undefined' && S.stats?.krma) ? S.stats.krma : 50;

  const restoredCount = Object.values(restoreState).filter(function(v){ return v&&v.restored; }).length;
  // [B69 FIX] "루프의 주인"(15회차) 마일스톤의 봉인석 요구치 완화(8개) 특전을
  // checkTrueEndingCondition()과 동일하게 여기에도 반영.
  const totalSealsFullForEnding = (typeof SEAL_DEFINITIONS !== 'undefined') ? Object.keys(SEAL_DEFINITIONS).length : 10;
  const _msForEnding = typeof loadMilestones==='function' ? loadMilestones() : [];
  const totalSealsForEnding = _msForEnding.includes('master_of_loops') ? Math.min(8, totalSealsFullForEnding) : totalSealsFullForEnding;
  // [CRITICAL BUG FIX] sealOrder는 loadSealOrder()가 반환하는 "복원된" 봉인석
  // 목록인데, 이걸 "파괴된" 봉인석 수(brokenCount)로 잘못 사용하고 있었음.
  // 진짜 파괴 데이터는 worldDB.seals(updateWorldDB의 sealBroken 플래그로
  // 기록됨)에 있다 — 이걸로 정확히 교체. 이 버그로 인해 선/배드 엔딩 분기가
  // "복원한 봉인석 수"를 "파괴된 봉인석 수"로 착각해 완전히 잘못 평가되고
  // 있었다(많이 복원할수록 오히려 배드엔딩에 가까워지는 정반대 결과).
  const brokenCount   = Object.values(worldDB.seals||{}).filter(function(s){ return s&&s.broken; }).length;
  const flags         = worldDB.flags||{};

  const wSaved  = !!(gsFlags['world_saved'] || gsFlags['good_ending_triggered'] || gsFlags['true_ending_triggered']);
  const wFailed = !!(gsFlags['world_failed'] || gsFlags['bad_ending_triggered'] || gsFlags['abyss_contract']);

  const results=[];

  // ── 1순위: 특수 분기 플래그 엔딩 ─────────────────────────
  if(gsFlags['betrayed_hero_flag'])
    results.push({ id:'betrayed_hero', icon:'👑🗡️', name:'배신자의 왕관', probability:90,
      desc:'에이든을 팔아넘긴 자의 왕관은 차갑기만 하다.', priority:1 });
  if(gsFlags['saved_dying_hero'])
    results.push({ id:'saved_hero', icon:'🛡️❤️', name:'늦게 온 영웅', probability:85,
      desc:'뒤늦게 합류한 영웅이 더 빛났다.', priority:1 });
  if(gsFlags['killed_villain_first']){
    // 내가 마왕을 처치했으면 세계는 구원된 것 — world_saved 자동 세팅
    if(!gsFlags['world_saved']){
      try{
        const _gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
        _gsF['world_saved'] = true;
        if(typeof saveGSFlags==='function') saveGSFlags(_gsF);
      }catch(e){}
    }
    // 에이든도 제거하고 마왕도 내가 잡은 경우 — 전용 엔딩
    if(gsFlags['stole_hero_glory'])
      results.push({ id:'solo_conqueror', icon:'👑⚔️', name:'혼자서 세계를 구한 자', probability:92,
        desc:'에이든을 제거하고, 마왕도 혼자 쓰러뜨렸다. 세계는 당신을 영웅이라 부르지만 그 무게를 아는 자는 당신뿐이다.', priority:1 });
    else
      results.push({ id:'surpassed_hero', icon:'⭐', name:'진짜 주인공', probability:88,
        desc:'에이든보다 먼저 마왕을 쓰러뜨렸다.', priority:1 });
  }
  // 혈통 지배 엔딩
  if(gsFlags['blood_lord_ascended'])
    results.push({ id:'blood_lord', icon:'👑🩸', name:'밤의 군주', probability:90,
      desc:'권속을 통해 세계를 혈통으로 물들였다. 밤이 오면 모든 것이 당신 것이다.', priority:1 });
  if(gsFlags['thrall_betrayed'])
    results.push({ id:'thrall_betrayal', icon:'⚔️🩸', name:'배신한 혈종', probability:85,
      desc:'권속이 군주를 배신했다. 권속에게 무너진 혈통의 군주.', priority:1, bad:true });
  if(gsFlags['blood_lord_ascended'] && gsFlags['killed_villain_first'])
    results.push({ id:'dark_emperor', icon:'🌑👑', name:'어둠의 황제', probability:95,
      desc:'마왕까지 쓰러뜨리고 권속 군단으로 세계를 지배한다. 이제 당신이 이 세계의 어둠이다.', priority:1 });
  if(gsFlags['stole_hero_glory'] && !gsFlags['killed_villain_first'])
    results.push({ id:'stole_glory', icon:'🏆💧', name:'더러운 승리', probability:85,
      desc:'에이든을 제거하고 혼자 공을 차지했다.', priority:1 });
  if(gsFlags['made_deal_with_villain'])
    results.push({ id:'villain_deal', icon:'📜😈', name:'악마의 계약', probability:90,
      desc:'세계의 절반을 얻고 절반을 잃었다.', priority:1 });
  if(gsFlags['persuaded_villain'])
    results.push({ id:'villain_persuade', icon:'🤝💜', name:'이해한 자', probability:88,
      desc:'이해가 전쟁을 끝냈다.', priority:1 });
  if(gsFlags['joined_villain'])
    results.push({ id:'become_villain', icon:'👿👑', name:'새로운 마왕', probability:92,
      desc:'어둠을 선택한 자의 새로운 시작.', priority:1 });
  if(gsFlags['red_thread_lost'] && gsFlags['revenge_done'])
    results.push({ id:'red_thread_revenge', icon:'🔴⚔️', name:'원한의 끝', probability:88,
      desc:'복수의 끝에 남은 것은 공허뿐.', priority:1 });
  if(gsFlags['fled_with_red_thread'])
    results.push({ id:'red_thread_escape', icon:'❤️🌙', name:'둘만의 세계', probability:85,
      desc:'세계보다 한 사람을 택했다.', priority:1 });
  if(gsFlags['all_companions_lost'])
    results.push({ id:'solo_end', icon:'🕯️', name:'고독한 결말', probability:80,
      desc:'모두를 잃고 혼자 끝냈다.', priority:1 });
  if(gsFlags['loop_fully_destroyed'])
    results.push({ id:'loop_breaker', icon:'🔓🌟', name:'루프 해방자', probability:90,
      desc:'세계가 처음으로 진짜 하루를 맞이했다.', priority:1 });
  if(gsFlags['watcher_persuaded'])
    results.push({ id:'watcher_peace', icon:'👁️✨', name:'감시자와의 화해', probability:88,
      desc:'감시자를 쉬게 해줬다.', priority:1 });
  if(karmaScore <= 15 && wSaved && gsFlags['world_saved_evil'])
    results.push({ id:'evil_savior', icon:'😈🌅', name:'악인의 구원', probability:85,
      desc:'악인이 세상을 구하는 것이 가능하다는 것을 증명했다.', priority:1 });
  if(karmaScore >= 85 && wFailed && gsFlags['world_failed_good'])
    results.push({ id:'good_tragedy', icon:'😇💔', name:'선인의 비극', probability:82,
      desc:'선함이 세상을 구하지 못한다는 것을 증명했다.', priority:1 });

  // 특수 분기 엔딩이 있으면 나머지는 낮은 확률로만 제시
  const hasSpecial = results.some(r=>r.priority===1);

  // ── 2순위: 종족 최종진화 엔딩 ─────────────────────────────
  if(typeof S!=='undefined' && S.character){
    const evolved2   = typeof loadEvolution==='function' ? loadEvolution()||{} : {};
    const race       = S.character.race || '';
    const evoStage   = evolved2[race]?.stage || 1;
    const raceEvoMap = typeof RACE_EVOLUTION!=='undefined' ? RACE_EVOLUTION : {};
    const evoObj     = raceEvoMap[race] || {};
    const stageName  = (evoObj['stage'+evoStage]||{}).name || '';

    if(stageName === '불멸의 용신황')
      results.push({ id:'dragon_god_ending', icon:'🐉', name:'용신황의 군림', probability:hasSpecial?40:85, desc:'하늘과 대지를 가르는 용신황의 군림.' });
    if(race==='demon' && evoStage >= 5)
      results.push({ id:'abyss_lord_ending', icon:'👹', name:'심연의 지배자', probability:hasSpecial?40:85, desc:'악마이기에 악마를 다스릴 수 있었다.' });
    if(race==='orc' && evoStage >= 5)
      results.push({ id:'great_chieftain_ending', icon:'⚔️🪓', name:'위대한 족장', probability:hasSpecial?40:85, desc:'힘과 의지로 세계를 통합했다.' });
    if(race==='elf' && evoStage >= 5)
      results.push({ id:'world_tree_ending', icon:'🌳', name:'세계수의 화신', probability:hasSpecial?40:85, desc:'자아를 잃고 세계 자체가 됐다.' });
    if(stageName === '인류의 정점')
      results.push({ id:'human_transcend_ending', icon:'✨', name:'인간 초월자', probability:hasSpecial?40:88, desc:'인간의 가능성 자체가 됐다.' });
    if(race==='celestial' && evoStage >= 4)
      results.push({ id:'celestial_return_ending', icon:'🌠', name:'천상의 귀환', probability:hasSpecial?40:85, desc:'천상의 사명을 완수했다.' });
  }

  // ── 3순위: 비전투 직업 + 행동 패턴 엔딩 (checkSecretEndings가 처리, 여기선 암시만) ──
  const combatTotal = ((actions.combat_aggressive||0)+(actions.combat_defensive||0)) + (actions.combat_aggressive||0);
  const socialTotal = (actions.social||0);
  const craftTotal  = (actions.craft||0) + (actions.trade||0);
  const exploreLocs = typeof loadLocations==='function' ? (loadLocations()||[]).length : 0;
  const maxAct      = Math.max(combatTotal, socialTotal, craftTotal, exploreLocs);
  let   mainPattern = 'none';
  if(maxAct > 15){
    if(maxAct === combatTotal)  mainPattern = 'combat';
    else if(maxAct === socialTotal)  mainPattern = 'social';
    else if(maxAct === craftTotal)   mainPattern = 'craft';
    else if(maxAct === exploreLocs)  mainPattern = 'explore';
  }
  if(karmaScore < 30) mainPattern = 'dark';

  if(mainPattern !== 'none' && (wSaved || wFailed)){
    const patternEndingMap = {
      combat:  wSaved ? { id:'combat_hero',       icon:'⚔️',     name:'전쟁의 영웅',     prob:75 } : { id:'combat_fallen',      icon:'💀⚔️',   name:'전장의 패배자',   prob:72 },
      social:  wSaved ? { id:'diplomat_hero',     icon:'🤝',     name:'세계의 외교관',   prob:75 } : { id:'diplomat_betrayed', icon:'🗡️😞',  name:'배신당한 자',     prob:72 },
      craft:   wSaved ? { id:'craft_master',      icon:'🌾⚒️',   name:'대지의 주인',     prob:75 } : { id:'craft_survivor',    icon:'🏚️',    name:'폐허 속 생존자',  prob:72 },
      explore: wSaved ? { id:'explorer_witness',  icon:'🗺️',     name:'세계의 목격자',   prob:75 } : { id:'explorer_wanderer', icon:'🌍💨',   name:'끝없는 방랑자',   prob:72 },
      dark:    wSaved ? { id:'dark_savior',       icon:'😈✨',   name:'악인의 구원',     prob:78 } : { id:'dark_destroyer',    icon:'☠️',     name:'공멸의 화신',     prob:80 },
    };
    const pe = patternEndingMap[mainPattern];
    if(pe && !hasSpecial) results.push({ id:pe.id, icon:pe.icon, name:pe.name, probability:pe.prob, desc:'플레이 패턴에 따른 엔딩.' });
  }

  // ── 5순위: 기존 봉인석/루프 메인 엔딩 ─────────────────────
  // [재조정] 봉인석 개수를 진엔딩(9챕터 진입) 트리거로 복원. 단, 일반
  // 엔딩의 선엔딩 조건(restoredCount>=7)과는 다른 더 높은 기준(전부 복원)
  // 을 요구해 두 조건이 여전히 명확히 구분되게 한다. 진엔딩 = 봉인석
  // 전부 복원 + 충분한 루프 경험(15회차+) + 아스모데우스와의 화해.
  if(restoredCount>=totalSealsForEnding && loopCount>=15 && flags['asmodeus_redeemed'])
    results.push({...ENDING_DEFINITIONS.true_ending, probability:95, priority:2});
  if(restoredCount>=7 && brokenCount<=3 && !flags['abyss_contract'])
    results.push({...ENDING_DEFINITIONS.good_ending, probability:80});
  if(brokenCount>=6 && flags['abyss_contract'])
    results.push({...ENDING_DEFINITIONS.bad_ending_abyss, probability:90});
  if(flags['seal_broken_세계수']&&flags['seal_broken_망각'])
    results.push({...ENDING_DEFINITIONS.bad_ending_loop, probability:85});
  if(loopCount>=15 && restoredCount>=8)
    results.push({...ENDING_DEFINITIONS.loop_master_ending, probability:70});

  // ── 6순위: 중립 (아무것도 해당 없을 때) ───────────────────
  if(results.length === 0)
    results.push({...ENDING_DEFINITIONS.neutral_ending, probability:60});

  // 우선순위 정렬 (priority 있는 것 먼저, 그다음 probability 높은 순)
  results.sort((a,b)=>((b.priority||0)-(a.priority||0)) || (b.probability-a.probability));
  return results;
}
window.checkEndingConditions = checkEndingConditions;

window.checkEndingConditions = window.checkEndingConditions;
}

