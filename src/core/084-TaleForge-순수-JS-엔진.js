// TaleForge — 순수 JS 엔진
// Auto-extracted from taleforge.html (original section banner preserved above).
import { ELEMENT_DEFS } from '../data/035-NEW-직업-조합-시너지-시스템.js';
import { LOCAL_PERSONALITIES } from '../data/041-궁수-계열-T2-파생-5종-히든-퀘스트-전사마법사도적-계열과-동일한-뼈대.js';
import { S, SCENARIOS, SETUP_STEPS, TF_SVG_ICONS } from '../data/084-TaleForge-순수-JS-엔진.js';
import { LIFE_GOALS } from '../data/030-NEW-동적-클리어-목표-시스템.js';
import { EQUIP_SLOTS } from '../items/004-장비-슬롯-시스템-12종.js';
import { applySetBonus } from '../items/006-세트-아이템-시스템.js';
import { loadEquipped, loadGold, loadInventory, restoreDynamicBlueprints, restoreDynamicEnemies, restoreDynamicMaterials, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { clearSkillSP, clearSkills, loadSkillSP, loadSkills } from '../job/002-스킬-시스템.js';
import { ALL_STAT_KEYS, getStatInfo, loadHighlights, loadMemory, loadTitles } from '../job/010-스킬-강화-시스템.js';
import { loadAffinity } from '../job/035-NEW-직업-조합-시너지-시스템.js';
import { discoverJob, findJob, getJobIdFromName, loadJobMemory, loadMainQuestState, saveMainQuestState } from '../job/042-직업-시스템-무한-파생-도감.js';
import { renderSkillQuickSlot } from '../job/071-파트1-A-스킬-실제-발동-시스템.js';
import { initRaceJobDissonance } from '../job/208-5-직업-시스템.js';
import { _markDirty, clearSession, loadAtmosphere, loadMetaState, loadNPCs, loadSession, loadStatsSplit, saveCharacter, saveNPCs, saveScenario, saveStatsSplit } from '../misc/001-block0-preamble.js';
import { clearJobSkills, loadJobSkills, saveJobSkills } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { loadPermStatBonus, recordRacePlayed } from '../misc/015-시스템-1120.js';
import { applyPartyBonus, getPlayerMaxHp, getPlayerMaxMp, loadParty } from '../misc/054-이동수단-시스템.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { applyAllPassiveSkills, checkOfflineCatchUp, checkStaleCollectedData, doStartChat, renderMsgs, restoreTitleBenefits, updateCharHeader, updateEmotionDisplay, updateMenuVisibility, updateQuestBadge } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { RACE_DEFS, _scheduleKeySaveHint, loadApiKeys, loadKeyIndex, saveApiKeys } from '../race/013-종족-시스템.js';
import { FIVE_CONTINENTS, loadContinentRep, saveContinentRep } from '../race/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js';
import { $, esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';

export function tfGetSvgIcon(emoji){
  return TF_SVG_ICONS[emoji] || null;
}
window.tfGetSvgIcon = tfGetSvgIcon;

export const TF_EMOJI_REGEX = /(\p{Extended_Pictographic}(\uFE0F)?(\u200D\p{Extended_Pictographic}(\uFE0F)?)*)/gu;

export function tfReplaceEmojiInTextNode(node){
  const text = node.nodeValue;
  if(!text || !/\p{Extended_Pictographic}/u.test(text)) return;
  const frag = document.createDocumentFragment();
  let lastIndex = 0;
  let matched = false;
  text.replace(TF_EMOJI_REGEX, (match, _g1, _g2, _g3, _g4, offset)=>{
    const svgPath = tfGetSvgIcon(match);
    if(!svgPath) return match; // 매핑 없으면 건드리지 않음
    matched = true;
    if(offset > lastIndex) frag.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
    const span = document.createElement('span');
    span.className = 'tf-svg-icon';
    span.style.cssText = 'display:inline-flex;vertical-align:-0.15em;width:1em;height:1em;';
    span.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>`;
    frag.appendChild(span);
    lastIndex = offset + match.length;
    return match;
  });
  if(!matched) return;
  if(lastIndex < text.length) frag.appendChild(document.createTextNode(text.slice(lastIndex)));
  node.parentNode.replaceChild(frag, node);
}
window.tfReplaceEmojiInTextNode = tfReplaceEmojiInTextNode;

export function tfConvertEmojisToSvg(root){
  if(!root || root.nodeType !== 1 && root.nodeType !== 11) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n){
      const p = n.parentNode;
      if(!p) return NodeFilter.FILTER_REJECT;
      const tag = p.nodeName;
      if(tag==='SCRIPT'||tag==='STYLE'||tag==='TEXTAREA'||tag==='INPUT'||p.classList?.contains('tf-svg-icon')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  let n;
  while((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(tfReplaceEmojiInTextNode);
}
window.tfConvertEmojisToSvg = tfConvertEmojisToSvg;

(function tfInitSvgIconSystem(){
  function boot(){
    try{ tfConvertEmojisToSvg(document.body); }catch(e){}
    if(!window.MutationObserver) return;
    // [성능 보호] 스트리밍 중에는 targetEl.innerHTML이 매 청크(초당 여러
    // 번)마다 갱신되는데, 그때마다 즉시 서브트리 전체를 재스캔하면 낭비가
    // 크다. 짧은 디바운스(80ms)로 모아서 한 번에 처리한다 — 사용자 체감
    // 지연은 거의 없으면서 불필요한 반복 스캔을 크게 줄인다.
    let pendingNodes = new Set();
    let debounceTimer = null;
    function flush(){
      const nodes = [...pendingNodes];
      pendingNodes.clear();
      debounceTimer = null;
      nodes.forEach(node=>{
        try{
          if(!node.isConnected) return; // 이미 DOM에서 제거된 노드는 스킵
          if(node.nodeType===1 || node.nodeType===11) tfConvertEmojisToSvg(node);
          else if(node.nodeType===3) tfReplaceEmojiInTextNode(node);
        }catch(e){}
      });
    }
    const observer = new MutationObserver((mutations)=>{
      mutations.forEach(m=>{
        m.addedNodes.forEach(node=>{
          if(node.nodeType===1 || node.nodeType===11 || node.nodeType===3) pendingNodes.add(node);
        });
      });
      if(debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(flush, 80);
    });
    observer.observe(document.body, { childList:true, subtree:true });
    window._tfSvgIconObserver = observer;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

export function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el=$('screen-'+name); if(el) el.classList.add('active');
  S.screen=name;
  if(name==='chat'){ renderMsgs(); window.updateHeader(); }
}
window.showScreen = showScreen;

export function addKey(){
  const inp=$('key-input'), k=(inp.value||'').trim().replace(/[\s\n\r]/g,'');
  if(!k||(!k.startsWith('AIza')&&!k.startsWith('AQ.'))){ toast('올바른 API 키가 아닙니다'); return; }
  if(k.length < 30){ toast('키가 너무 짧습니다. 전체 키를 복사하세요.'); return; }
  const keys=loadApiKeys(); if(keys.includes(k)){ toast('이미 등록된 키입니다'); return; }
  keys.push(k); saveApiKeys(keys); S.apiKeys=keys; inp.value='';
  renderKeys(); toast('✅ API 키 추가됨');
  if(typeof _scheduleKeySaveHint==='function') _scheduleKeySaveHint();
}
window.addKey = addKey;

export function removeKey(i){
  const keys=loadApiKeys(); keys.splice(i,1); saveApiKeys(keys); S.apiKeys=keys; renderKeys();
}
window.removeKey = removeKey;

export function renderKeys(){
  const keys=loadApiKeys();
  const curIdx = loadKeyIndex() % Math.max(1, keys.length);
  $('key-list').innerHTML=keys.map((k,i)=>`
    <div class="key-item" style="border-left:2px solid ${i===curIdx?'var(--gold)':'transparent'}">
      <span>${i===curIdx?'▶ ':'  '}🔑 ${esc(k.slice(0,8))}...${esc(k.slice(-4))} ${i===curIdx?'<span style="color:#60a060;font-size:9px">(사용중)</span>':''}</span>
      <button class="key-del" onclick="removeKey(${i})">✕</button>
    </div>`).join('') || '<div style="color:var(--dim);font-size:11px;padding:5px">등록된 키 없음</div>';
  // 키 있으면 시작하기 버튼 강조 + 안내
  const startBtn = $('start-btn');
  const keyHint = $('key-hint');
  if(startBtn){
    if(keys.length > 0){
      startBtn.style.animation = 'none';
      startBtn.textContent = '시작하기 ▶  (키 ' + keys.length + '개 등록됨)';
    } else {
      startBtn.textContent = '시작하기 ▶';
    }
  }
  if(keyHint){
    keyHint.style.display = keys.length > 0 ? 'block' : 'none';
  }
}
window.renderKeys = renderKeys;

export function confirmKey(){
  // [복원] API 키는 이제 필수가 아니라 선택 — 키 없이도 로컬 조합으로
  // 게임 전체가 완전히 작동한다. 키가 있으면 생성 계열(아이템/퀘스트/
  // 장소 등) 품질이 올라가는 보너스일 뿐, 시작을 막는 관문이 아니다.
  const keys=loadApiKeys();
  S.apiKeys=keys;
  // 이전 세션 있으면 복원 여부 물어봄 (커스텀 모달 - PC/모바일 일관성)
  const saved=loadSession();
  if(saved?.character){
    _showResumeModal(saved);
    return;
  }
  showScreen('scenario'); renderScenarios();
}
window.confirmKey = confirmKey;

export function _showResumeModal(saved){
  // 기존 모달 제거
  document.getElementById('_resume-modal')?.remove();
  const ov = document.createElement('div');
  ov.id = '_resume-modal';
  ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML = `
    <div style="width:100%;max-width:380px;background:#0d0800;border:2px solid var(--gold);padding:24px;font-family:'Crimson Text',serif">
      <div style="font-family:'Cinzel',serif;font-size:13px;color:var(--gold);letter-spacing:3px;text-align:center;margin-bottom:16px">⚔ 이어하기</div>
      <div style="font-size:13px;color:var(--text);line-height:1.8;margin-bottom:6px;text-align:center">이전 게임 진행 기록이 있습니다.</div>
      <div style="padding:12px;background:#080500;border:1px solid var(--border);margin-bottom:18px;text-align:center">
        <div style="font-family:'Cinzel',serif;font-size:14px;color:var(--gold);margin-bottom:4px">${esc(saved.character.name||'???')}</div>
        <div style="font-size:11px;color:var(--dim)">${esc(saved.character.race||'')} ${esc(saved.character.role||'')} · ${saved.msgCount||0}턴</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-gold" style="width:100%;padding:13px;letter-spacing:2px;font-size:12px" onclick="_doResume()">▶ 이어서 진행</button>
        <button class="btn btn-dark" style="width:100%;padding:11px;font-size:11px" onclick="_doNewGame()">✦ 새 게임 시작</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
}
window._showResumeModal = _showResumeModal;

export function _doResume(){
  document.getElementById('_resume-modal')?.remove();
  const saved=loadSession();
  if(!saved?.character){
    // [신규] 캐릭터가 없는 상태(진짜 첫 실행 또는 리셋 후 재시작)에서, 누적
    // 데이터(플레이로그·도감·회차수 등)가 이미 쌓여있다면 사용자에게 명시적으로
    // 확인을 받는다. 자동 추측 대신 선택권을 줘서, "처음 시작했는데 마치
    // 다회차처럼 보이는" 문제를 방지.
    if(typeof checkStaleCollectedData === 'function') checkStaleCollectedData();
    showScreen('scenario'); renderScenarios(); return;
  }
  try{
    // 분리 저장된 데이터 복원
    S.character   = saved.character;
    S.messages    = saved.messages    || [];
    S.fullMessages= saved.fullMessages|| S.messages.slice();
    S.stats       = saved.stats       || loadStatsSplit() || {};
    S.msgCount    = saved.msgCount    || 0;
    // 메타 상태 복원
    const _meta = saved._emotion !== undefined ? saved : loadMetaState();
    S._emotion        = _meta._emotion        || null;
    S._fatigue        = _meta._fatigue        || 0;
    S._skillCooldowns = _meta._skillCooldowns || {};
    S._nearDeathTurns = _meta._nearDeathTurns || 0;
    S._enemyMorale    = _meta._enemyMorale    || 80;
    S.inCombat        = _meta.inCombat        || false;
    S.gold=loadGold(); S.inventory=loadInventory();
    { const rawEqC=saved.equipped||loadEquipped();
      S.equipped=Object.fromEntries(EQUIP_SLOTS.map(s=>[s.id,rawEqC[s.id]||null])); }
    S.unlockedSkills=loadSkills(); S.skillSP=loadSkillSP();
    S.titles=loadTitles(); S.npcs=loadNPCs();
    S.highlights=loadHighlights(); S.atmosphere=loadAtmosphere();
    window.currentLocation=loadCurrentLocation();
    applyPartyBonus();
    applySetBonus();
    // [F-BUG 수정] 환생으로 스킬 목록은 비었지만 칭호는 남아있는 경우,
    // 칭호에 연결된 영구 스탯 보너스·전용 스킬을 다시 맞춰준다.
    if(typeof restoreTitleBenefits==='function') restoreTitleBenefits();
    // [BUG FIX] restoreDynamicMaterials/Enemies/Blueprints 세 함수는
    // "앱 시작 시 복원"이라는 목적이 주석에 명시돼 있었지만, 실제로는
    // 이 시작 경로(이어하기) 어디에서도 호출되지 않고 있었다. 즉 AI가
    // 플레이 중 생성한 동적 재료·적 드롭·제작 레시피(DYN_MAT_KEY 등)가
    // localStorage에는 영구 저장되면서도, 페이지를 새로고침하거나 다시
    // 접속하면 메모리 상의 MATERIALS/BLUEPRINT_SHOP/CRAFT_RECIPES에는
    // 전혀 반영되지 않아 "그 턴에만 잠깐 존재했다가 사라지는" 콘텐츠가
    // 되어 있었다 — 이 게임의 핵심 전략(AI 생성 데이터 누적 재사용)에
    // 정면으로 반하는 빈틈이었다.
    try{
      if(typeof restoreDynamicMaterials==='function') restoreDynamicMaterials();
      if(typeof restoreDynamicEnemies==='function') restoreDynamicEnemies();
      if(typeof restoreDynamicBlueprints==='function') restoreDynamicBlueprints();
    }catch(e){ console.warn('[동적 콘텐츠 복원 실패]', e); }
    // 속성 상성 스탯 보너스 재적용
    try{
      const _affL = loadAffinity();
      if(_affL.element && _affL.element !== 'none' && typeof ELEMENT_DEFS !== 'undefined' && ELEMENT_DEFS[_affL.element]){
        const _defL = ELEMENT_DEFS[_affL.element];
        Object.entries(_defL.statBonus).forEach(([k,v])=>{
          if(S.stats && S.stats[k] !== undefined) S.stats[k] = Math.min(999, (S.stats[k]||10) + v);
        });
      }
    }catch(e){}
    const sc=SCENARIOS.find(s=>s.era===saved.character.scenario)||MEDIEVAL_SCENARIO;
    S.scenario={...MEDIEVAL_SCENARIO, ...sc};
    S.system=window.buildLightSystem(S.character,loadTitles(),loadMemory(),loadNPCs());
    updateCharHeader(); window.updateHeader(); showScreen('chat');
    // 파티 복원
    S.party = typeof loadParty==='function' ? loadParty() : [];
    // 패시브 스킬 스탯 재적용
    if(typeof applyAllPassiveSkills==='function') applyAllPassiveSkills();
    S.loading=false; S.initialized=true;
    // choices 복원 — 저장된 것 우선, 없으면 기본값
    S.choices = (saved.choices && saved.choices.length > 0)
      ? saved.choices
      : ['주변을 살피며 상황을 파악한다.', '가까운 NPC에게 말을 건다.', '조용히 다음 행동을 생각한다.'];
    try{ renderMsgs(); }catch(e){}
    try{ window.renderChoices(); }catch(e){}
    if(!isTutorialDone()) setTimeout(()=>startTutorial(), 1500);
    // [신규 ④] 오프라인 경과 시간 반영 — 세션 복원 성공 후 1회, 살짝
    // 지연을 두고 자연스럽게 소식을 보여준다.
    setTimeout(()=>{
      try{
        const catchUp = (typeof checkOfflineCatchUp==='function') ? checkOfflineCatchUp() : null;
        if(catchUp && catchUp.summary.length){
          toast(`🕰️ 그동안 세계에 새로운 소식이 들려왔다 (${catchUp.eventCount}건)`, 4000);
          setTimeout(()=>{
            catchUp.summary.forEach((msg,i)=>{
              setTimeout(()=>toast(msg, 3500), i*800);
            });
          }, 1500);
        }
      }catch(e){}
    }, 2200);
  }catch(e){
    clearSession();
    toast('세션 복원 실패, 새 게임을 시작합니다.');
    showScreen('scenario'); renderScenarios();
  }
}
window._doResume = _doResume;

export function _doNewGame(){
  document.getElementById('_resume-modal')?.remove();
  clearSession();
  // [버그 수정] 파벌 게이지·영지(및 영지 v5 확장/NPC 영지 침략/세계
  // 정착지 영향력) 초기화는 race/260에 있던 두 개의 window.newGame 감싸기
  // 훅이 담당하려 했다. 그런데 window.newGame이라는 실제 함수는 이
  // 코드베이스 어디에도 정의된 적이 없어(진짜 "새 게임" 진입점은 이
  // _doNewGame이다) 저 훅들의 typeof 가드가 단 한 번도 통과하지
  // 못했다 — 즉 clearFactionGauge()/clearDemesne()가 지금까지 한 번도
  // 호출된 적이 없어, 새 캐릭터를 만들어도 이전 캐릭터의 파벌 게이지·
  // 영지·영지 v5·라이벌 영지·세계 정착지 상태가 전부 그대로 남아있던
  // 버그였다. 진짜 진입점에 네이티브로 연결한다.
  if(typeof clearFactionGauge==='function') clearFactionGauge();
  if(typeof clearDemesne==='function') clearDemesne();
  try{ localStorage.removeItem('tf-demesne-v5'); }catch(e){}
  try{ localStorage.removeItem('tf-rival-domains'); }catch(e){}
  try{ localStorage.removeItem('tf-world-settlements'); }catch(e){}
  try{ localStorage.removeItem('tf-demesne-notified'); }catch(e){}
  showScreen('scenario'); renderScenarios();
}
window._doNewGame = _doNewGame;

export const MEDIEVAL_SCENARIO = {
  id:'medieval', era:'중세 판타지', title:'봉인의 균열',
  desc:'여덟 대륙에 잠든 고대의 봉인이 하나씩 깨어나고 있다. 천계와 마계의 경계가 흔들리는 지금, 누군가 이 균열을 막아야만 한다.',
  lore:`[🌍 세계 — 아에테른(Aetern)]
이 세계의 이름은 아에테른이다. "영원히 되돌아오는 것들의 땅"이라는 뜻이다. 죽음이 끝이 아니라 순환의 시작이라는 믿음이 이 세계의 모든 문화·종교·법률에 뿌리내려 있다. 태어난 자는 반드시 죽고, 죽은 자는 반드시 돌아온다 — 이것이 아에테른의 근본 진리다.

[🗺️ 중심 대륙 — 칼다리아(Caldaria)]
아에테른의 중심 대륙. 태초에 세계수(世界樹) 이그드라가 이 대륙의 심장부에 서 있었다는 전설이 있다. 세계수의 뿌리는 대지 깊이, 가지는 하늘 너머까지 뻗어 천계와 속세를 연결했다고 한다. 지금 세계수 이그드라는 수천 년째 시들어가고 있으며, 그것이 세계 쇠락의 근본 원인이라는 믿음이 있다.

[👑 중앙 대륙 왕국 — 알테라 대왕국의 역사]
▸ 황금시대(320년 전): 초대 왕 알테라 1세가 마법사·기사·신관을 통합해 왕국을 건국. 세계수의 축복으로 풍요와 평화가 백 년 넘게 이어졌다. 마법과 신앙이 함께 번성했으며, 이 시절의 건축물·유물들이 지금도 전설로 남아있다.
▸ 균열의 시작(220년 전): 왕국의 7대 국왕이 비밀리에 악마와 계약을 맺었다. 불로장생을 대가로 왕국의 번영을 담보로 걸었다는 설이 있다. 이 사실을 알게 된 왕국 기사단이 왕을 살해하고 증거를 은폐했다. 이때부터 왕국의 황금시대는 조용히 끝났다.
▸ 암흑기(150년 전): 대마법 폭발 사건이 왕국 북부를 초토화했다. 공식 원인은 마법사의 실험 사고였지만, 실제로는 봉인석 하나가 처음으로 균열을 일으킨 것이었다. 이 사건으로 수천 명이 죽었고, 살아남은 자들은 평생 그날의 기억을 안고 살아간다.
▸ 현재의 황혼기: 현 국왕 알렉산더 9세는 병약하고 후계자가 없다. 귀족 의회가 실권을 잡았으며, 마법사 협회·기사단·교회 세 세력이 서로를 견제하고 있다. 봉인석들이 하나씩 깨지기 시작했다.

[⚔️ 세력 — 창립·욕망·비밀]

▸ 왕국 기사단 "철의 맹세단"
  창립: 초대 왕 알테라 1세의 혈맹 기사들이 세운 수호 조직. "왕국이 있는 한 우리가 있다"가 창립 서약.
  욕망: 왕위 정통성 수호. 그러나 기사단장 레오나르드는 실질 권력을 원한다.
  비밀: 7대 국왕이 악마와 계약했다는 증거를 220년째 은폐 중. 증거가 드러나면 기사단의 정당성 자체가 무너진다. 기사단 지하 금고에 그 계약서가 있다.
  내부 균열: 젊은 기사들은 진실을 알고 싶어하고, 원로 기사들은 비밀을 지키려 한다.

▸ 마법사 협회 (아르카누스 대마법사 수장)
  창립: 200년 전 대마법 폭발 사건 이후 왕국에서 금지된 연구를 계속하기 위해 비밀 조직이 탄생. 이후 공식 기관이 됐지만 핵심은 여전히 비밀 연구.
  욕망: 금지 마법 해금. 세계수 접근권. 봉인석의 에너지 연구.
  비밀: 아르카누스는 이미 3회차 이상의 기억을 가진 루프 자각자다. 그는 봉인의 균열이 수십 회 반복됐다는 것을 안다. 그러나 이 사실을 혼자 감당하고 있다.
  관계: 교회와 표면적 갈등, 기사단과 협력 관계, 실상은 누구도 완전히 믿지 않는다.

▸ 교회 — 빛의 신앙 "순환의 사원"
  창립: 세계수 신앙에서 파생된 조직. 죽은 자는 세계수의 뿌리로 돌아가 새 생을 받는다는 믿음.
  욕망: 순환의 진리를 수호하고 민심을 장악.
  비밀: 교회 최고 성직자 일부는 루프 자각자다. 그들은 "순환은 신성하다"고 가르치지만 사실은 루프에서 탈출하고 싶어한다. 지하에 "이번 순환을 끊는 방법"을 연구하는 금지 문서고가 있다.

▸ 지하 상인 연맹 (그림자 군주 체제)
  창립: 150년 전 대마법 폭발 사건으로 땅을 잃은 평민들의 생존 조직.
  욕망: 귀족 독점 해체. 자유 교역.
  비밀: 연맹의 정보망은 실질적으로 감시자(The Watcher)의 눈 역할을 하고 있다. 정보상들이 수집한 감정적 데이터가 감시자에게 흘러간다. 연맹 자체는 이 사실을 모른다.

▸ 순환의 기억자들 (루프 자각자 길드 — 세계 내 이단)
  창립: 알 수 없음. 최소 수백 회차 전부터 존재.
  세계 내 인식: 당국에 탄압받는 이단 종파. "죽어도 죽지 않는다"고 주장하며, 환생의 기억을 가지고 있다고 선언하는 자들. 5회차 미만 플레이어에게는 "미친 자들의 집단"으로 소문이 나 있다.
  욕망: 루프를 설계한 감시자를 찾아 파괴. 세계의 진짜 순환 구조 해명.
  비밀: 내부에 이미 감시자의 스파이가 있다. 길드 마스터 자신이 감시자에게 오래전 타협한 쌍둥이 영혼일 수 있다.
  가입 암호: "에테르 나시온" (나는 환생자다)

[🕯️ 종교/신앙 체계]

▸ 빛의 신앙 — "순환의 사원 (Temple of the Cycle)"
  이 세계 인구의 70%가 믿는 다수 종교. 세계수 이그드라를 신성한 중심으로 모신다.
  핵심 교리: 죽은 자는 세계수의 뿌리로 돌아가 정화되고 새 생명으로 태어난다. 환생은 신성한 축복이다.
  일상 의례: "세계수의 축복을"이 일반적 인사말. 성직자는 "뿌리로 돌아가 새 가지가 되길"이라고 장례를 집전한다.
  성기사·신관 계급이 이 신앙 안에 있다.
  숨겨진 진실: 신앙이 가르치는 "신성한 환생"이 실은 감시자가 설계한 루프라는 것을 고위 성직자 일부가 알고 있다.

▸ 금지된 심연 신앙 — "심연의 약속 (Pact of the Abyss)"
  이단 종파. 당국에 공개 탄압받는다.
  핵심 교리: 순환은 감옥이다. 악마와 계약하여 순환에서 이탈하고 영원한 권력을 얻을 수 있다.
  상징: 검은 원 안에 뱀이 자기 꼬리를 무는 그림.
  현실: 실제로 악마와 계약하면 타락이 진행되고, 순환에서 이탈하는 것이 아니라 마계의 하수인이 되는 결말에 이른다. 이것을 가르치지 않는다.
  악마 타락 시스템과 이 신앙이 연결됨.

[📜 세계 공통 역사 — NPC들이 공유하는 기억]

▸ "대마법 폭발 사건" (150년 전, 왕국 북부)
  공식 기록: 마법사의 실험 실패로 왕국 북부 셀리나 마을이 전소. 사망자 3,200명.
  진실: 봉인석 하나가 처음으로 미세 균열을 일으켜 봉인된 마력이 유출된 것이었다.
  NPC 연결: 여관 주인은 그때 부모를 잃었다. 기사단 원로는 그때 첫 전투를 치렀다. 아르카누스는 그때 처음으로 봉인석의 존재를 알게 됐다. 교회는 그때 가장 많은 신자를 잃었다.
  현재 영향: 셀리나 마을 터는 지금도 불모지. 밤이 되면 죽은 자들의 영혼이 나타난다는 소문이 있다.

▸ "왕국 북부 셀리나 폐허"
  전설: 150년 전 대마법 폭발로 소멸된 마을. 안개가 짙은 밤에 죽은 자들의 목소리가 들린다.
  실상: 봉인석 파편이 지하에 묻혀있으며, 그것이 영혼 잔류 현상을 일으키고 있다.

[🌍 장소 전설 — 살아있는 세계의 소문들]

왕도 아이런홀:
  "왕성 지하 7층에는 건국 당시의 비밀이 봉인되어 있다. 그것을 본 자는 미쳐버리거나 입을 열지 않는다."
  "왕도 광장 중앙의 낡은 수목은 세계수의 마지막 가지라는 전설이 있다. 가뭄에도 시들지 않는다."

북대륙 프로스트헤임:
  "빙하 아래에 고대 거인들이 잠들어 있다. 빙하가 녹을 때 그들이 깨어난다는 예언이 룬석에 새겨져 있다."
  "극야의 오로라를 맨눈으로 30분 이상 바라보면 전생의 기억이 돌아온다는 이야기가 전해진다."

동대륙 아쉬카라:
  "칼데라 깊은 곳에 이그나르 고룡의 꿈이 잠들어 있다. 그 꿈이 깨어나면 제국이 무너진다."
  "드래곤 라이더가 된 자는 두 번째 삶부터는 용의 언어로 꿈을 꾼다고 한다."

남대륙 아우루스:
  "태양 신전 지하에 죽지 않는 파라오의 육신이 있다. 신관단이 3천 년째 그것을 깨우지 않기 위해 의식을 올린다."
  "사막에서 길을 잃은 자가 오아시스를 발견하면, 그것은 진짜 오아시스가 아니라 봉인석의 신기루다."

남동 군도 테네브라 해구:
  "해구에 빠진 배는 바닥에서 불빛을 본다고 한다. 그 불빛을 향해 헤엄치면 살아 돌아오지 못한다."
  "해적왕 발타자르는 사실 열두 번째 해적왕이다. 이전 열한 명은 모두 해구 아래의 무언가에 소환당했다."

[🔮 세계의 메타 진실 — 나레이터 참고, 플레이어에게 직접 말하지 말 것]
이 세계 아에테른은 감시자(The Watcher)가 수천 회차에 걸쳐 유지해온 이야기의 그릇이다. 순환은 자연적 현상이 아니라 설계된 구조다. 봉인석들은 단순한 마법 유물이 아니라 세계수 이그드라의 심장 파편들이다. 세계수가 완전히 소생하면 감시자의 루프가 끊긴다. 이것이 진 엔딩의 열쇠다.`,
  bg:'linear-gradient(135deg,#1a0a00,#2a1500,#1a0800)', accent:'#c8a96e',
  customWorldSetting:''
};

window.selScenarioId = 'medieval';

export function renderScenarios(){
  // 중세 고정 — 별도 카드 렌더 불필요
  window.selScenarioId = 'medieval';
}
window.renderScenarios = renderScenarios;

export function confirmScenario(){
  S.scenario = {...MEDIEVAL_SCENARIO};
  startSetup();
}
window.confirmScenario = confirmScenario;

export let setupStep=0, setupChar={name:'',race:'',socialRank:'',socialRankId:'',role:'',personality:'',background:'',speechStyle:'',startContinent:'',startContinentLabel:''};

export let setupSuggestions=[], setupMode='suggest';

export function startSetup(){
  if(!S.scenario || S.scenario.id !== 'medieval') S.scenario = {...MEDIEVAL_SCENARIO};
  window.setupStep=0; window.setupChar={name:'',race:'',socialRank:'',socialRankId:'',role:'',personality:'',background:'',speechStyle:'',startContinent:'',startContinentLabel:'',_goals:[]};
  window.setupChar=window.setupChar; window.setupStep=window.setupStep;
  showScreen('setup'); renderSetupStep();
}
window.startSetup = startSetup;

export const SOCIAL_RANKS = [
  // ── tier 0: 최하층 ──────────────────────────────────────────────
  {
    id:'slave', name:'노예', icon:'⛓️', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="3.2"/><circle cx="17" cy="17" r="3.2"/><path d="M9.3 9.3 L14.7 14.7"/></svg>`, color:'#806060', tier:0,
    desc:'자유가 없는 최하층. 소유자의 명령에 절대 복종해야 한다.',
    lore:'전쟁 포로, 채무 불이행, 또는 태생으로 노예가 됐다. 법적으로 물건으로 취급되나 강인한 의지는 누구보다 강하다.',
    startStat:{ str:8, end:10, agi:8, wil:6, luk:-5, cha:-5, rep:-15, ldr:-12 },
    aiHint:'노예 신분. 자유민조차 하대한다. 귀족에겐 눈도 못 마주친다. 동료 노예들과는 강한 연대감.',
    npcReaction:'귀족·기사는 무시하거나 명령. 평민은 동정 또는 경계. 같은 처지의 자들은 연대.',
    privilege:'없음. 무기 소지 불법. 계약·소유 불가.',
    changeUp:'탈출·주인의 해방·탁월한 공훈으로 자유민 신분 획득.',
    special:'어떤 신분으로도 상승 가능. 밑바닥 출신이라 상승 시 스토리 임팩트 최대.',
    mechanics:{ priceMultiplier:1.3, arrestImmunity:0, jailSentenceMod:1.5, accessLocations:[], quotaFree:false, canOwnProperty:false, canBeArrestedFreely:true }
  },
  {
    id:'vagrant', name:'부랑자', icon:'🥾', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 C4 16 6 14 6 11 C6 8.5 7.5 7 9.5 7 C11.5 7 13 8.5 13 11 C13 14 15 16 15 20"/><path d="M15 20 C15 17 16.5 15.5 18 15.5 C19.5 15.5 20.5 17 20.5 19"/><circle cx="9.5" cy="4" r="1.6"/></svg>`, color:'#756050', tier:0,
    desc:'정착지도 소속도 없이 떠도는 자. 사회의 가장 밑바닥에서 하루하루를 살아간다.',
    lore:'고향을 잃거나 추방당해 떠도는 자. 도시 빈민가나 길거리에서 잠을 청하며, 누구의 보호도 받지 못한다.',
    startStat:{ str:5, end:7, agi:7, per:6, luk:-3, cha:-6, rep:-10, ldr:-10 },
    aiHint:'부랑자 신분. 대부분의 NPC가 경계하거나 무시한다. 같은 처지의 빈민들과는 동질감을 느낀다.',
    npcReaction:'귀족·상인은 경계·무시. 평민은 동정 또는 회피. 빈민가 사람들은 동료로 받아줌.',
    privilege:'없음. 정식 거처·신원 증명 없음.',
    changeUp:'정착·고용·공훈으로 평민 인정.',
    special:'생존 특화. 빈민가·뒷골목 정보망에 강점.',
    mechanics:{ priceMultiplier:1.2, arrestImmunity:0, jailSentenceMod:1.2, accessLocations:[], quotaFree:false, canOwnProperty:false, canBeArrestedFreely:false }
  },
  {
    id:'serf', name:'농노', icon:'🪚', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 L12 15"/><path d="M12 4 C9.5 4 8 6 8 8.5 L16 8.5 C16 6 14.5 4 12 4 Z" stroke-width="1.3"/><path d="M6 20 C6 17 8.5 15 12 15 C15.5 15 18 17 18 20"/></svg>`, color:'#8a7050', tier:0,
    desc:'영지에 묶인 소작농. 노예보다는 낫지만 이동의 자유가 없다.',
    lore:'영주의 땅에 묶여 농사를 짓는다. 이론상 자유민이지만 영지를 벗어나려면 영주의 허가가 필요하다.',
    startStat:{ str:6, end:8, agi:4, wil:4, luk:-2, cha:-3, rep:-8, ldr:-8 },
    aiHint:'농노 신분. 영주에겐 허리를 굽히고 다른 농노들과 공동체 생활. 도시민에겐 촌뜨기 취급받는다.',
    npcReaction:'영주는 소유물로 취급. 평민은 아래로 봄. 같은 농노들은 공동체 의식.',
    privilege:'경작지 사용권. 영주의 보호를 명목상 받음.',
    changeUp:'도주 성공, 영주의 해방, 도시에서 1년 이상 생활 시 자유민 인정.',
    special:'농업·생존 특화. 자연 지형 이동 시 불이익 없음.',
    mechanics:{ priceMultiplier:1.15, arrestImmunity:0, jailSentenceMod:1.1, accessLocations:[], quotaFree:false, canOwnProperty:false, canBeArrestedFreely:false }
  },
  {
    id:'outlaw', name:'무법자', icon:'💀', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.4"/><circle cx="9" cy="11" r="1.4" fill="currentColor" fill-opacity="0.5"/><circle cx="15" cy="11" r="1.4" fill="currentColor" fill-opacity="0.5"/><path d="M9 21 L9 18.5 M12 21 L12 18.5 M15 21 L15 18.5" stroke-width="1.3"/></svg>`, color:'#808080', tier:0,
    desc:'법의 테두리 밖에 있는 자. 현상금 사냥꾼의 표적.',
    lore:'과거의 죄나 억울한 누명으로 법 밖에 선 자. 어둠의 세계에서 살아가는 법을 안다.',
    startStat:{ agi:10, disg:8, str:6, per:6, luk:4, rep:-12, cha:-4, ldr:-8 },
    aiHint:'무법자 신분. 관원은 적대적. 도시 진입 시 신분 위장 필요. 지하세계에선 실력으로 인정받는다.',
    npcReaction:'관원·기사는 체포 시도. 평민은 두려워하거나 은밀히 도움 요청. 범죄 조직은 동료 취급.',
    privilege:'없음. 지명수배 상태.',
    changeUp:'왕의 특사 또는 대공훈으로 사면.',
    special:'은신·기습 특화. 지하세계 NPC와 특별 관계. 가장 자유로운 행동 범위.',
    mechanics:{ priceMultiplier:1.0, arrestImmunity:0, jailSentenceMod:1.0, accessLocations:['underworld'], quotaFree:false, canOwnProperty:false, canBeArrestedFreely:true, isWanted:true }
  },
  // ── tier 1: 자유민 ──────────────────────────────────────────────
  {
    id:'commoner', name:'평민', icon:'🌾', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 6"/><path d="M12 6 C10 6 9 4.5 9 3 C10.5 3 12 4 12 6 Z" stroke-width="1.2"/><path d="M12 6 C14 6 15 4.5 15 3 C13.5 3 12 4 12 6 Z" stroke-width="1.2"/><path d="M12 10 C10 10 9 8.5 9 7 C10.5 7 12 8 12 10 Z" stroke-width="1.2"/><path d="M12 10 C14 10 15 8.5 15 7 C13.5 7 12 8 12 10 Z" stroke-width="1.2"/></svg>`, color:'#a09060', tier:1,
    desc:'왕국 인구의 대부분. 세금을 내고 법의 보호를 받는 자유민.',
    lore:'농부, 장인, 소상인 등 사회를 떠받치는 기반. 귀족 앞에서 머리를 숙여야 하나 자유로운 삶을 영위한다.',
    startStat:{ str:3, end:4, agi:3, int:2, luk:2, cha:0, rep:0, ldr:-3 },
    aiHint:'평민 신분. 귀족에겐 예를 갖추고, 동등한 평민들과는 자연스럽게 어울린다.',
    npcReaction:'귀족은 대체로 무시. 평민은 동등. 기사는 업무상 대응.',
    privilege:'무기 소지 가능(등록 필요). 법적 소송 권리.',
    changeUp:'공훈·부 축적으로 상위 신분 진입 가능.',
    special:'가장 자유로운 시작. 어느 방향으로도 성장 가능.',
    mechanics:{ priceMultiplier:1.0, arrestImmunity:0, jailSentenceMod:1.0, accessLocations:[], quotaFree:false, canOwnProperty:true, canBeArrestedFreely:false }
  },
  {
    id:'artisan', name:'장인', icon:'🔨', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 3.5 L20.5 9.5 L17 13 L11 7 Z" stroke-width="1.3"/><path d="M11 7 L4 14 C3.3 14.7 3.3 15.8 4 16.5 C4.7 17.2 5.8 17.2 6.5 16.5 L13.5 9.5"/></svg>`, color:'#a8905a', tier:1,
    desc:'특정 기술에 정통한 숙련공. 길드에 소속되어 동업자들의 보호를 받는다.',
    lore:'대장장이, 목수, 재봉사 등 한 분야에서 평생을 바친 기술자. 길드의 인장을 가진 자는 함부로 무시당하지 않는다.',
    startStat:{ str:5, end:5, int:5, per:4, luk:1, cha:2, rep:3, ldr:-1 },
    aiHint:'장인 신분. 같은 길드원과는 동업자 의식. 평민에게는 존경받는 기술자로 대우받는다.',
    npcReaction:'귀족은 필요시에만 접근. 평민은 신뢰. 다른 장인들은 동업자 의식.',
    privilege:'길드 가입권. 자기 작업장 운영권. 견습생 고용 가능.',
    changeUp:'명장(名匠) 인정 또는 부 축적으로 대상인 진입.',
    special:'제작·수리 판정에 보너스. 길드 네트워크 접근.',
    mechanics:{ priceMultiplier:0.9, arrestImmunity:0, jailSentenceMod:1.0, accessLocations:['guild_hall'], quotaFree:false, canOwnProperty:true, canBeArrestedFreely:false, craftDiscount:0.15 }
  },
  {
    id:'merchant', name:'부유한 상인', icon:'💰', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" stroke-width="1.4"/><path d="M12 7.5 L12 16.5 M9.5 9.3 C9.5 8.2 10.5 7.5 12 7.5 C13.5 7.5 14.5 8.3 14.5 9.4 C14.5 10.6 13.5 11 12 11.3 C10.5 11.6 9.5 12.2 9.5 13.4 C9.5 14.5 10.5 15.3 12 15.3 C13.5 15.3 14.5 14.6 14.5 13.5" stroke-width="1.2"/></svg>`, color:'#b89030', tier:1,
    desc:'도시에서 성공을 거둔 대상인. 법적으론 평민이지만 경제력이 막강하다.',
    lore:'교역로를 장악한 상인 가문. 귀족의 작위는 없지만 금화의 힘으로 귀족 못지않은 영향력을 행사한다.',
    startStat:{ cha:5, neg:8, int:6, luk:5, rep:3, ldr:2, str:-2 },
    aiHint:'부유한 상인. 귀족에게 뇌물을 건네고 영향력을 행사한다. 평민·하층민에겐 고용주로서 군림.',
    npcReaction:'귀족은 뇌물을 기대하며 교류. 평민은 고용주로 존경. 가난한 자들은 시기.',
    privilege:'도시 내 상업 독점권 추진 가능. 개인 경호 합법.',
    changeUp:'왕실에 거액 헌납, 또는 귀족 작위 매입으로 남작 진입.',
    special:'협상·교역 특화. 시작 골드 최다.',
    mechanics:{ priceMultiplier:0.85, arrestImmunity:0.1, jailSentenceMod:0.8, accessLocations:['merchant_quarter'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false }
  },
  {
    id:'grand_merchant', name:'대상인', icon:'🏦', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 L12 4 L21 9.5 Z" stroke-linejoin="round"/><path d="M4.5 9.5 L4.5 18.5 M8 9.5 L8 18.5 M12 9.5 L12 18.5 M16 9.5 L16 18.5 M19.5 9.5 L19.5 18.5" stroke-width="1.3"/><path d="M3 20.5 L21 20.5" stroke-width="1.6"/></svg>`, color:'#c89020', tier:1,
    desc:'여러 도시에 지부를 둔 거상. 한 나라의 경제에 영향을 줄 정도의 부를 쌓았다.',
    lore:'무역로 전체를 장악한 상회의 수장. 왕실 재정에까지 손을 뻗쳐, 작위 없이도 궁정의 한 자리를 차지한다.',
    startStat:{ cha:8, neg:12, int:8, luk:6, rep:6, ldr:4, str:-3 },
    aiHint:'대상인 신분. 궁정 인사들도 이 인물과의 거래를 원한다. 귀족조차 빚을 지고 있는 경우가 많다.',
    npcReaction:'귀족은 동등하게 대우하며 자금을 구함. 평민은 우상화. 다른 상인들은 경쟁하며 견제.',
    privilege:'복수 도시 상업권. 왕실 재정 자문. 사설 호위대 보유.',
    changeUp:'왕실에 막대한 헌납으로 귀족 작위(준남작 이상) 획득.',
    special:'경제 영향력 최고. 세력 시스템의 경제 이벤트에 직접 개입 가능.',
    mechanics:{ priceMultiplier:0.7, arrestImmunity:0.2, jailSentenceMod:0.6, accessLocations:['merchant_quarter','noble_quarter'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false }
  },
  // ── tier 2: 하급 귀족·전문직 ─────────────────────────────────────
  {
    id:'squire', name:'종사(從士)', icon:'🛡️', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L19 6 L19 12 C19 17 15.5 20 12 21.5 C8.5 20 5 17 5 12 L5 6 Z" stroke-linejoin="round"/></svg>`, color:'#9090b0', tier:2,
    desc:'기사 서임을 기다리는 견습 전사. 귀족 가문의 자제가 많다.',
    lore:'기사의 시종으로 전투 기술을 연마하는 젊은 전사. 기사 서임식을 통과하면 정식 기사가 된다.',
    startStat:{ str:6, end:6, agi:5, wil:5, rep:2, ldr:2, neg:-3 },
    aiHint:'종사 신분. 기사들에게 지시를 받고, 평민들에겐 미래의 기사로 예우받는다.',
    npcReaction:'기사는 훈련병으로 대함. 평민은 장차 기사 될 자로 예우. 귀족은 가능성 있는 자로 평가.',
    privilege:'기사단 시설 접근 가능. 무기 소지 합법.',
    changeUp:'기사 서임식 통과 또는 전공으로 정식 기사 등극.',
    special:'전투 수련 특화. 기사 관련 퀘스트 접근 가능.',
    mechanics:{ priceMultiplier:0.95, arrestImmunity:0.05, jailSentenceMod:0.9, accessLocations:['knight_hall'], quotaFree:false, canOwnProperty:true, canBeArrestedFreely:false }
  },
  {
    id:'knight', name:'기사', icon:'⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/><path d="M11 7 L7 11"/><path d="M13 11 L9 15"/></svg>`, color:'#c0c0e0', tier:2,
    desc:'검으로 서약한 왕국의 전사 귀족. 명예와 의무를 따른다.',
    lore:'기사 서임을 받고 왕국에 충성을 맹세한 전사. 영지 없는 귀족으로 칼의 귀족이라 불린다.',
    startStat:{ str:8, end:8, wil:6, rep:6, fear:5, ldr:5, neg:-3 },
    aiHint:'기사 신분. 동료 기사들과 명예 코드를 공유. 귀족에겐 예를 갖추고, 평민에겐 보호자 역할.',
    npcReaction:'평민은 존경과 두려움. 동료 기사는 형제. 귀족은 하위 계층으로 대함.',
    privilege:'왕의 이름으로 법 집행. 영지 없이도 귀족 대우. 무기 소지·결투 합법.',
    changeUp:'전공으로 영지 귀족(남작) 서임, 또는 기사단장 승진.',
    special:'전투 특화 스탯. 명예 시스템과 강하게 연동.',
    mechanics:{ priceMultiplier:0.85, arrestImmunity:0.3, jailSentenceMod:0.5, accessLocations:['knight_hall','noble_quarter'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false }
  },
  {
    id:'baronet', name:'준남작', icon:'🎗️', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4.5" stroke-width="1.4"/><path d="M9.3 12 L7 21 L12 18.5 L17 21 L14.7 12"/></svg>`, color:'#9a8aa0', tier:2,
    desc:'세습되지 않는 명예 작위. 귀족 사회의 말단에 갓 발을 들인 자.',
    lore:'공훈을 세웠지만 영지를 받지는 못한 명예직 귀족. 진짜 귀족과 평민 사이의 애매한 위치에 있다.',
    startStat:{ cha:4, ldr:4, rep:4, int:3, neg:3, wil:3 },
    aiHint:'준남작 신분. 진짜 귀족들에게는 살짝 무시당하지만, 평민들에게는 분명한 귀족으로 보인다.',
    npcReaction:'고위 귀족은 격식상으로만 예우. 평민은 귀족으로 대함. 같은 준남작들과는 동질감.',
    privilege:'궁정 출입 가능(제한적). 귀족 호칭 사용권.',
    changeUp:'영지를 받아 정식 남작으로 승급.',
    special:'귀족 사회 진입의 첫 발판. 사교 활동 폭이 넓어짐.',
    mechanics:{ priceMultiplier:0.8, arrestImmunity:0.35, jailSentenceMod:0.5, accessLocations:['noble_quarter'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false }
  },
  {
    id:'priest', name:'성직자', icon:'✝️', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L12 21 M6 9 L18 9"/></svg>`, color:'#e0d080', tier:2,
    desc:'신의 뜻을 전하는 교회의 일원. 세속 권력과 별개의 신성 권위를 가진다.',
    lore:'태양 신전 또는 왕국 국교의 서품받은 성직자. 귀족 계급과 별개로 신성한 권위를 가지며 민심을 장악한다.',
    startStat:{ fath:10, wil:8, cha:6, rep:8, int:6, neg:4, str:-5 },
    aiHint:'성직자 신분. 신도들은 경외. 귀족조차 교회를 함부로 적으로 돌리지 않는다.',
    npcReaction:'평민은 신앙심으로 공경. 귀족은 정치적 동맹으로 접근. 왕도 교회를 존중.',
    privilege:'교회 재산 관리권. 면세. 신성 법정에서 특별 지위.',
    changeUp:'주교·대주교 등 교계 고위직 승진.',
    special:'치유·신성 마법 보너스. 민심 조작에 강점.',
    mechanics:{ priceMultiplier:0.85, arrestImmunity:0.25, jailSentenceMod:0.6, accessLocations:['temple'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false }
  },
  // ── tier 3: 중급 귀족 ──────────────────────────────────────────
  {
    id:'baron', name:'남작', icon:'🏠', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11 L12 4 L20 11" stroke-linejoin="round"/><path d="M6 10 L6 20 L18 20 L18 10" stroke-linejoin="round"/><path d="M10 20 L10 14 L14 14 L14 20"/></svg>`, color:'#c08070', tier:3,
    desc:'가장 낮은 작위의 귀족 영주. 작은 영지와 농노를 거느린다.',
    lore:'봉건 귀족 체계의 최하위. 기사 서임 또는 공훈으로 영지를 하사받아 영주가 된 자. 더 높은 귀족에게 봉신으로 복종한다.',
    startStat:{ cha:5, ldr:6, rep:6, int:4, neg:4, wil:4, str:-1, end:-1 },
    aiHint:'남작 신분. 작은 영지의 영주. 기사들은 복종하고, 더 높은 귀족에겐 봉신으로서 예를 갖춘다.',
    npcReaction:'평민·기사는 복종. 동급 귀족과 정치적 교류. 자작 이상은 아래로 봄.',
    privilege:'영지 통치권. 세금 징수권. 사병(소규모) 보유.',
    changeUp:'전공·정치력으로 자작 서임.',
    special:'영지 운영 시작. 소규모 봉신 NPC 자동 확보.',
    mechanics:{ priceMultiplier:0.7, arrestImmunity:0.5, jailSentenceMod:0.4, accessLocations:['noble_quarter','palace_outer'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false, hasFiefdom:true }
  },
  {
    id:'viscount', name:'자작', icon:'🏯', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14 5.5 L10 5.5 Z" stroke-linejoin="round"/><path d="M6 8 L18 8 L18 21 L6 21 Z" stroke-linejoin="round"/><path d="M3 11 L6 8 L6 14 L3 14 Z" stroke-linejoin="round"/><path d="M21 11 L18 8 L18 14 L21 14 Z" stroke-linejoin="round"/><path d="M10 21 L10 16 L14 16 L14 21"/></svg>`, color:'#c07090', tier:3,
    desc:'남작과 백작 사이의 귀족. 중간 규모의 영지를 다스린다.',
    lore:'여러 영지를 통합하거나 공훈으로 자작 작위를 받은 귀족. 지방 행정의 핵심을 담당한다.',
    startStat:{ cha:6, ldr:8, rep:8, int:5, neg:5, wil:5, str:-2, end:-2 },
    aiHint:'자작 신분. 지방 행정의 핵심. 남작들을 봉신으로 두고, 백작에게 봉신으로 복종한다.',
    npcReaction:'남작·기사는 복종. 백작은 동등 또는 윗사람. 공작 이상은 아래로 봄.',
    privilege:'영지 재판권. 사병(중규모) 보유. 왕실 집회 참석.',
    changeUp:'혼인·공훈·정치력으로 백작 서임.',
    special:'정치·외교 네트워크 폭 증가.',
    mechanics:{ priceMultiplier:0.65, arrestImmunity:0.6, jailSentenceMod:0.3, accessLocations:['noble_quarter','palace_outer'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false, hasFiefdom:true }
  },
  {
    id:'count', name:'백작', icon:'🏰', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21 L4 9 L6 9 L6 7 L8 7 L8 9 L10.5 9 L10.5 6 L13.5 6 L13.5 9 L16 9 L16 7 L18 7 L18 9 L20 9 L20 21 Z" stroke-linejoin="round"/><path d="M12 21 L12 15 L15 15 L15 21"/><circle cx="12" cy="3" r="1" fill="currentColor"/></svg>`, color:'#d4a0c8', tier:3,
    desc:'광대한 영지를 지배하는 고위 귀족. 왕국 정치의 중심 세력.',
    lore:'선대로부터 대대로 작위를 물려받은 유력 귀족. 수십 개의 마을과 여러 기사를 봉신으로 거느린다.',
    startStat:{ cha:8, ldr:10, rep:10, int:6, neg:6, wil:5, str:-3, end:-3 },
    aiHint:'백작 신분. 왕국 정치의 실세 중 하나. 왕실에 직접 청원 가능. 귀족들 사이 중재자 역할도 한다.',
    npcReaction:'남작·자작·기사는 복종. 후작·공작과 대등하거나 아래. 왕에게만 고개를 숙인다.',
    privilege:'영지 자치권. 왕실 알현권. 대규모 사병 보유. 독자 재판소 운영.',
    changeUp:'왕실 혼인·압도적 공훈으로 후작 서임.',
    special:'정치·외교 특화 최고. 봉신 NPC 다수 확보.',
    mechanics:{ priceMultiplier:0.6, arrestImmunity:0.7, jailSentenceMod:0.2, accessLocations:['noble_quarter','palace_outer','palace_inner'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false, hasFiefdom:true }
  },
  {
    id:'bishop', name:'주교', icon:'⛪', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21 L6 12 L12 5 L18 12 L18 21 Z" stroke-linejoin="round"/><path d="M12 2 L12 6 M10 4 L14 4"/><path d="M11 21 L11 16 L13 16 L13 21"/></svg>`, color:'#d4c060', tier:3,
    desc:'대규모 교구를 관할하는 교회 고위 성직자.',
    lore:'수십 개의 교회와 성직자를 관할하는 교회 수장. 세속 귀족과 맞먹는 권력과 재력을 가진다.',
    startStat:{ fath:14, wil:10, cha:8, rep:12, int:10, neg:7, ldr:6, str:-6 },
    aiHint:'주교 신분. 교구 내 모든 성직자와 신도가 복종한다. 귀족도 교회의 파문을 두려워한다.',
    npcReaction:'성직자들은 절대복종. 평민은 신의 대리인으로 경외. 귀족도 파문 위협 앞에 머리를 숙임.',
    privilege:'교구 내 법적 권한. 파문권. 교회 재산 통제. 왕실과 독립적인 외교 채널.',
    changeUp:'대주교 또는 교황청 추기경 승진.',
    special:'신앙 판정 최고 보너스. 교회 네트워크로 광범위한 정보 수집.',
    mechanics:{ priceMultiplier:0.6, arrestImmunity:0.7, jailSentenceMod:0.2, accessLocations:['temple','noble_quarter'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false }
  },
  // ── tier 4: 고위 귀족 ──────────────────────────────────────────
  {
    id:'marquis', name:'후작', icon:'🗺️', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 L4 8 L9 5 L15 8 L20 5 L20 17 L15 20 L9 17 Z" stroke-linejoin="round"/><path d="M9 5 L9 17 M15 8 L15 20"/></svg>`, color:'#c060a0', tier:4,
    desc:'변경(邊境) 지역을 수호하는 강력한 귀족. 전략적 요충지를 다스린다.',
    lore:'왕국의 경계 지역을 방어하는 귀족. 외적의 침입을 막기 위해 대규모 군사권이 주어진 실력자.',
    startStat:{ cha:9, ldr:12, rep:12, int:7, neg:7, wil:7, str:3, end:3 },
    aiHint:'후작 신분. 변경 방어의 실질적 책임자. 군사권이 막강하고, 왕실도 함부로 무시할 수 없다.',
    npcReaction:'백작 이하는 복종. 공작과 대등. 왕에게만 고개를 숙인다.',
    privilege:'변경 지역 전권. 독자 외교 가능. 대규모 상비군 보유. 왕실 핵심 집회 참석.',
    changeUp:'압도적 공훈·왕실 혼인·왕의 신임으로 공작 서임.',
    special:'군사·외교 복합 특화. 왕국 방어 관련 퀘스트 핵심 인물.',
    mechanics:{ priceMultiplier:0.5, arrestImmunity:0.85, jailSentenceMod:0.1, accessLocations:['noble_quarter','palace_outer','palace_inner'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false, hasFiefdom:true }
  },
  {
    id:'duke', name:'공작', icon:'🏛️', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8 L12 3 L21 8" stroke-linejoin="round"/><path d="M4 8 L4 20 M8 8 L8 20 M12 8 L12 20 M16 8 L16 20 M20 8 L20 20"/><path d="M3 20 L21 20" stroke-width="1.8"/><path d="M3 8 L21 8" stroke-width="1.3"/></svg>`, color:'#b050c0', tier:4,
    desc:'왕 다음가는 최고 귀족. 왕국의 운명을 좌우하는 실력자.',
    lore:'왕가의 방계 혈통이거나 건국 공신의 후손. 왕국 내에서 왕에 버금가는 권세를 지니며 왕권을 위협하기도 한다.',
    startStat:{ cha:10, ldr:14, rep:15, int:9, neg:9, wil:8, str:-2, end:-2, luk:4 },
    aiHint:'공작 신분. 왕국 최고 귀족. 왕도 함부로 적으로 만들 수 없는 존재. 움직임 하나가 정치 지형을 바꾼다.',
    npcReaction:'후작 이하 모든 귀족·기사·평민이 경의를 표함. 왕과 대등하게 협상. 타 공작과 암투.',
    privilege:'광대한 영지 자치권. 독자 군대·외교. 왕위 계승 관여. 왕실 최고 집회 주재.',
    changeUp:'왕위 찬탈, 왕실 입적, 또는 왕국 건설.',
    special:'정치·외교 스탯 최고. 움직임 자체가 역사를 만드는 레벨.',
    mechanics:{ priceMultiplier:0.4, arrestImmunity:0.95, jailSentenceMod:0.05, accessLocations:['noble_quarter','palace_outer','palace_inner','throne_room'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false, hasFiefdom:true }
  },
  {
    id:'archbishop', name:'대주교', icon:'🕍', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21 L5 11 L9 6.5 L9 11 M9 11 L15 11 L15 6.5 L19 11 L19 21 Z" stroke-linejoin="round"/><path d="M12 2 L12 6.5 M10 4 L14 4"/><path d="M15 11 L9 11" /><path d="M11 21 L11 15.5 L13 15.5 L13 21"/><circle cx="7" cy="8.5" r="0.9" fill="currentColor"/><circle cx="17" cy="8.5" r="0.9" fill="currentColor"/></svg>`, color:'#d4b030', tier:4,
    desc:'왕국 전체 교회를 관할하는 최고 성직자. 교황에 버금가는 권위.',
    lore:'왕국의 모든 교구와 성직자를 총괄하는 교회의 정점. 왕의 대관식을 집전하고 파문으로 귀족을 무너뜨릴 수 있다.',
    startStat:{ fath:18, wil:14, cha:10, rep:16, int:12, neg:10, ldr:10, str:-7 },
    aiHint:'대주교 신분. 왕의 대관식을 집전하는 권위. 파문 위협 하나로 왕국 정치 지형을 바꾼다.',
    npcReaction:'모든 성직자는 절대복종. 평민은 신의 목소리로 경외. 귀족조차 파문을 두려워하며 복종.',
    privilege:'왕국 전체 교회 통제권. 파문권. 왕 대관식 집전 독점권. 독자 외교.',
    changeUp:'교황청과의 관계에서 실질적 최고 성직자 지위 확립.',
    special:'신성 판정·치유 최고. 종교 관련 모든 이벤트에 결정적 영향력.',
    mechanics:{ priceMultiplier:0.4, arrestImmunity:0.9, jailSentenceMod:0.05, accessLocations:['temple','noble_quarter','palace_outer'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false }
  },
  // ── tier 5: 최상층 ──────────────────────────────────────────────
  {
    id:'prince', name:'왕자/공주', icon:'👑', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18 L4 10 L8 13.5 L12 7 L16 13.5 L20 10 L20 18 Z" stroke-linejoin="round"/><path d="M4 18 L20 18" stroke-width="1.8"/><circle cx="12" cy="5" r="1" fill="currentColor"/></svg>`, color:'#ffc030', tier:5,
    desc:'왕의 직계 혈통. 왕위 계승권을 가진 왕족.',
    lore:'왕가의 피를 이은 왕자 또는 공주. 왕국의 모든 것이 이름 앞에 열리며, 동시에 왕위를 둘러싼 음모의 중심에 놓인다.',
    startStat:{ cha:10, ldr:12, rep:14, neg:8, int:8, wil:8, str:-4, end:-4, luk:6 },
    aiHint:'왕자/공주 신분. 길에서 마주치는 모든 이가 허리를 굽힌다. 단, 왕위를 둘러싼 음모의 표적이 된다.',
    npcReaction:'모든 계층이 경의를 표함. 귀족은 충성 또는 암투. 왕실 내에서도 권력 투쟁 존재.',
    privilege:'왕궁 전체 출입. 왕실 군대 일부 지휘. 외국 사절 접견.',
    changeUp:'왕위 계승 또는 왕위 찬탈.',
    special:'높은 초기 스탯. 모든 NPC 반응 최상이나 음모의 핵심 표적.',
    mechanics:{ priceMultiplier:0.2, arrestImmunity:0.99, jailSentenceMod:0, accessLocations:['noble_quarter','palace_outer','palace_inner','throne_room'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false }
  },
  {
    id:'king', name:'왕/여왕', icon:'👸', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M3 17 L21 17 L21 20 L3 20 Z" stroke-linejoin="round"/><circle cx="12" cy="2" r="1" fill="currentColor"/><circle cx="7.5" cy="9.5" r="0.8" fill="currentColor"/><circle cx="16.5" cy="9.5" r="0.8" fill="currentColor"/></svg>`, color:'#ffd700', tier:5,
    desc:'왕국의 절대 군주. 법의 원천이자 왕국 그 자체.',
    lore:'왕국의 모든 권력이 집중된 절대자. 법을 만들고, 작위를 내리고, 전쟁을 선포하는 왕국의 정점.',
    startStat:{ cha:12, ldr:16, rep:18, neg:10, int:10, wil:12, str:-3, end:-3, luk:8 },
    aiHint:'왕/여왕 신분. 움직임 하나가 왕국의 역사를 바꾼다. 모든 이가 무릎을 꿇는다.',
    npcReaction:'모든 계층이 절대적으로 복종. 귀족도 반란 외에는 저항 불가. 외국 군주만 대등하게 대화.',
    privilege:'입법·사법·행정 전권. 작위 수여·박탈권. 전쟁 선포권. 국고 통제.',
    changeUp:'황제 즉위, 신화적 존재로의 초월, 또는 은퇴해 상왕으로 물러남.',
    special:'모든 스탯 최고. 왕국 전체가 플레이어의 결정에 따라 움직임.',
    mechanics:{ priceMultiplier:0, arrestImmunity:1.0, jailSentenceMod:0, accessLocations:['noble_quarter','palace_outer','palace_inner','throne_room'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false, rulesKingdom:true }
  },
  {
    id:'emperor', name:'황제', icon:'🏆', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6 L6 5 L8 10 L12 3 L16 10 L18 5 L22 6 L20 17 L4 17 Z" stroke-linejoin="round"/><path d="M4 17 L20 17 L20 20 L4 20 Z" stroke-linejoin="round"/><circle cx="12" cy="1" r="1" fill="currentColor"/></svg>`, color:'#ff9900', tier:5,
    desc:'여러 왕국을 지배하는 절대 지배자. 살아있는 신에 가까운 존재.',
    lore:'정복과 외교로 여러 왕국을 통합한 절대 군주. 왕들도 무릎을 꿇는 세계의 정점.',
    startStat:{ cha:15, ldr:20, rep:22, neg:14, int:12, wil:15, str:-2, end:-2, luk:10 },
    aiHint:'황제 신분. 이 세계에서 가장 강력한 존재 중 하나. 발걸음 하나가 역사가 된다.',
    npcReaction:'왕들도 무릎을 꿇음. 귀족은 최대한 비위를 맞춤. 외국 군주도 경계하며 예를 갖춤.',
    privilege:'다수 왕국 지배. 황실 직속 군대. 국제 조약 체결 독점권.',
    changeUp:'신화적 존재 또는 신격화.',
    special:'역대 최고 스탯. 세계 전체가 플레이어의 결정에 반응함.',
    mechanics:{ priceMultiplier:0, arrestImmunity:1.0, jailSentenceMod:0, accessLocations:['noble_quarter','palace_outer','palace_inner','throne_room'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false, rulesKingdom:true }
  },
  {
    id:'retired_monarch', name:'상황(上皇)', icon:'🕊️', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 4 15.5 4 9.5 C4 6.5 6.2 4.5 8.8 4.5 C10.2 4.5 11.3 5.2 12 6.3 C12.7 5.2 13.8 4.5 15.2 4.5 C17.8 4.5 20 6.5 20 9.5 C20 15.5 12 21 12 21 Z" stroke-linejoin="round" stroke-width="1.3"/><path d="M8.5 9 C9.5 8.3 10.5 8.3 11.5 9" stroke-width="1.1"/><path d="M12.5 9 C13.5 8.3 14.5 8.3 15.5 9" stroke-width="1.1"/></svg>`, color:'#e0c8a0', tier:5,
    desc:'왕위에서 물러난 전 군주. 실권은 내려놓았지만 그 권위와 인맥은 여전하다.',
    lore:'후계자에게 왕위를 넘기고 은퇴한 전 왕. 직접적인 통치권은 없지만, 오랜 세월 쌓은 영향력과 비밀은 여전히 막강하다.',
    startStat:{ cha:10, ldr:10, rep:16, int:12, wil:12, neg:6, str:-6, end:-8, luk:6 },
    aiHint:'상황 신분. 직접 명령은 못 내리지만 누구도 무시 못할 원로다. 현 왕실에 깊이 관여하는 그림자 권력자.',
    npcReaction:'현직 귀족·왕족은 깊은 예우를 표하나 실권은 인정하지 않음. 평민은 전설적 인물로 회상. 옛 인맥들은 변함없이 충성.',
    privilege:'궁 출입 자유(의전상). 옛 인맥을 통한 비공식 영향력.',
    changeUp:'섭정으로 재등극, 또는 완전한 은둔.',
    special:'직접적 권력은 없지만 정보·인맥 네트워크 최고. 배후 조종 플레이에 특화.',
    mechanics:{ priceMultiplier:0.3, arrestImmunity:0.9, jailSentenceMod:0.05, accessLocations:['noble_quarter','palace_outer','palace_inner'], quotaFree:true, canOwnProperty:true, canBeArrestedFreely:false }
  },
];

window.SOCIAL_RANKS = SOCIAL_RANKS;

export function applySocialRankStat(char, stats) {
  const rank = SOCIAL_RANKS.find(r => r.id === char.socialRankId);
  if (!rank) return;
  Object.entries(rank.startStat || {}).forEach(([k, v]) => {
    if (stats[k] !== undefined) stats[k] = Math.max(0, Math.min(999, (stats[k] || 10) + v));
  });
}
window.applySocialRankStat = applySocialRankStat;

export function getSocialRankMechanics(){
  try{
    const rankId = S?.character?.socialRankId || 'commoner';
    const rank = (typeof SOCIAL_RANKS!=='undefined' ? SOCIAL_RANKS : []).find(r => r.id === rankId);
    return rank?.mechanics || { priceMultiplier:1.0, arrestImmunity:0, jailSentenceMod:1.0, accessLocations:[], quotaFree:false, canOwnProperty:true, canBeArrestedFreely:false };
  }catch(e){
    return { priceMultiplier:1.0, arrestImmunity:0, jailSentenceMod:1.0, accessLocations:[], quotaFree:false, canOwnProperty:true, canBeArrestedFreely:false };
  }
}
window.getSocialRankMechanics = getSocialRankMechanics;

window.getSocialRankMechanics = getSocialRankMechanics;

export function canAccessLocationType(locType){
  if(!locType) return true; // 타입이 없는 일반 장소는 제한 없음
  const RESTRICTED_TYPES = new Set(['noble_quarter','palace_outer','palace_inner','throne_room','knight_hall','temple','guild_hall','merchant_quarter','underworld']);
  if(!RESTRICTED_TYPES.has(locType)) return true; // 제한 목록에 없는 타입은 누구나 출입
  const mech = getSocialRankMechanics();
  return (mech.accessLocations||[]).includes(locType);
}
window.canAccessLocationType = canAccessLocationType;

window.canAccessLocationType = canAccessLocationType;

// [신규] 신분 순차 해금 — 처음엔 노예만 선택 가능하고, SOCIAL_RANKS
// 배열 순서(노예→부랑자→...→상황)대로 환생 5회마다 다음 신분이 하나씩
// 열린다. 순번(0-based) × 5가 그 신분에 필요한 누적 환생 횟수 — 즉
// 노예(0번)는 0회, 부랑자(1번)는 5회, 농노(2번)는 10회... 필요.
const SOCIAL_RANK_UNLOCK_STEP = 5;

export function getSocialRankUnlockReq(rankId){
  const idx = SOCIAL_RANKS.findIndex(r => r.id === rankId);
  if(idx < 0) return 0;
  return idx * SOCIAL_RANK_UNLOCK_STEP;
}
window.getSocialRankUnlockReq = getSocialRankUnlockReq;

export function isSocialRankUnlocked(rankId){
  const cycle = (typeof loadCycleCount==='function') ? (loadCycleCount()||0) : 0;
  return cycle >= getSocialRankUnlockReq(rankId);
}
window.isSocialRankUnlocked = isSocialRankUnlocked;

export function pickSocialRank(id) {
  const rank = SOCIAL_RANKS.find(r => r.id === id);
  if (!rank) return;
  if(!isSocialRankUnlocked(id)){
    if(typeof toast==='function') toast(`🔒 아직 열리지 않은 신분입니다 (환생 ${getSocialRankUnlockReq(id)}회 필요)`, 2500);
    return;
  }
  window.setupChar.socialRank   = rank.name;
  window.setupChar.socialRankId = rank.id;
  renderSetupStep();
}
window.pickSocialRank = pickSocialRank;

window.pickSocialRank = pickSocialRank;

// [신규] 신분 선택 화면에서만 쓰던 지역 상수를 모듈 최상위로 끌어올려
// export — 오프닝 서사(quest/086의 composeLocalTurnText)가 "시작 대륙"의
// desc/lore를 가져다 쓸 수 있게 하기 위함(신분·대륙 선택이 실제 오프닝
// 내용에 반영되게 하는 기능의 일부).
export const START_CONTINENTS=[
      {id:'central',   label:'중앙 대륙',  icon:'🏰',   svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21 L4 9 L6 9 L6 7 L8 7 L8 9 L10.5 9 L10.5 6 L13.5 6 L13.5 9 L16 9 L16 7 L18 7 L18 9 L20 9 L20 21 Z" stroke-linejoin="round"/><path d="M12 21 L12 15 L15 15 L15 21"/><circle cx="12" cy="3" r="1" fill="currentColor"/></svg>`, color:'#c8a96e',
       desc:'봉건 왕국과 기사도의 중심지. 마법탑·교회·귀족이 각축하는 문명의 심장.',
       lore:'왕도 아이런홀에 오대륙 교역로가 모인다. 모험가 길드 본부, 마법사 협회, 교황 사절단이 공존.'},
      {id:'north',     label:'북대륙',     icon:'❄️', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L12 22 M4 7 L20 17 M20 7 L4 17"/><path d="M12 2 L9.5 4.5 M12 2 L14.5 4.5 M12 22 L9.5 19.5 M12 22 L14.5 19.5 M4 7 L4.5 10 M4 7 L7 6.2 M20 7 L19.5 10 M20 7 L17 6.2 M4 17 L4.5 14 M4 17 L7 17.8 M20 17 L19.5 14 M20 17 L17 17.8" stroke-width="1.2"/></svg>`, color:'#6aace8',
       desc:'극한 설원의 바이킹 전사 왕국. 빙결 룬 마법과 얼음 거인족과의 끝없는 전쟁.',
       lore:'오로라 아래 룬 마법이 작동하고, 철옹성 빙결 요새가 얼음 거인족을 막아낸다.'},
      {id:'east',      label:'동대륙',     icon:'🌋', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/><path d="M8 6 L6.5 3 M8 6 L9.5 3.5" stroke-width="1.2"/><circle cx="8" cy="6" r="1.1" fill="currentColor"/></svg>`, color:'#e85a30',
       desc:'드래곤 제국 이그나르. 화산맥 위에 세워진 전사 문명, 살아있는 고룡이 황제를 인정해야 즉위 가능.',
       lore:'드래곤 라이더가 최고 명예. 용골 마법·흑요석 무기·화염 마법이 발달. 황제 혈통이 끊기면 고룡이 제국을 불태운다.'},
      {id:'west',      label:'서대륙',     icon:'⚓', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7 L12 20"/><path d="M7 10 L17 10"/><path d="M4 14 C4 18.5 7.5 21 12 21 C16.5 21 20 18.5 20 14" stroke-width="1.4"/><path d="M4 14 L6.5 14 M20 14 L17.5 14" stroke-width="1.4"/></svg>`, color:'#6ab4e8',
       desc:'해양 무역 패권을 쥔 상인 공화국. 마법보다 황금, 혈통보다 계약이 지배.',
       lore:'세 항구 도시 연맹이 오대륙 무역을 장악. 증기 기관 개발로 산업혁명 조짐.'},
      {id:'south',     label:'남대륙',     icon:'🌞', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2 L12 4.5 M12 19.5 L12 22 M2 12 L4.5 12 M19.5 12 L22 12 M5.1 5.1 L6.8 6.8 M17.2 17.2 L18.9 18.9 M18.9 5.1 L17.2 6.8 M6.8 17.2 L5.1 18.9"/></svg>`, color:'#e8a050',
       desc:'고대 제국 케메트의 후계자. 사막과 밀림, 피라미드 신전과 태양 마법.',
       lore:'신관단이 태양왕을 배후 조종. 모래 속 고대 던전이 탐험가를 유혹한다.'},
      {id:'northeast', label:'북동 대륙',  icon:'🌿', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 12 12 12 8 C12 4.5 9 3 6 3 C6 6.5 8 9 12 9" stroke-linejoin="round"/><path d="M12 14 C12 14 12 9 15 7.5 C17 6.5 19 7 19 7 C19 9.5 17 12.5 12 12.5" stroke-linejoin="round"/></svg>`, color:'#70c878',
       desc:'천 년 엘프 왕국과 세계수. 별빛 마법과 인간-엘프 종족 갈등.',
       lore:'달의 여왕이 천 년째 통치. 세계수 신전에서 예언사들이 미래를 읽는다.'},
      {id:'southeast', label:'남동 군도',  icon:'🏴‍☠️', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="4"/><circle cx="9.7" cy="8" r="0.7" fill="currentColor"/><circle cx="14.3" cy="8" r="0.7" fill="currentColor"/><path d="M9.5 11.5 C10.3 12.3 13.7 12.3 14.5 11.5" stroke-width="1.2"/><path d="M8.5 4.5 L6.5 2.5 M15.5 4.5 L17.5 2.5" stroke-width="1.2"/><path d="M9 21 L9 15 L15 15 L15 21"/></svg>`, color:'#c87040',
       desc:'100개 섬의 해적 연맹. 저주받은 심해, 봉인된 고대 신, 자유와 약탈의 바다.',
       lore:'해적왕이 투표로 선출되는 자유 군도. 테네브라 해구에 뭔가 잠들어 있다.'},
      {id:'northwest', label:'북서 대륙',  icon:'⛏️', svgIcon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 C4 4 9 4 12 7 C15 10 15 15 15 15" stroke-linejoin="round"/><path d="M20 4 C20 4 15 4 12 7" stroke-linejoin="round"/><path d="M6 20 L15 11" stroke-width="1.8"/></svg>`, color:'#a07848',
       desc:'드워프 지하 왕국. 수백km 지하 도시, 고대 기계 문명, 잠들어 있는 기계 군단.',
       lore:'용광로 왕도 이그드하르 아래 고대 기계 신전이 발견됐다. 기어들이 다시 돌기 시작했다.'},
];
window.START_CONTINENTS = START_CONTINENTS;

export function renderSetupStep(){
  const step=SETUP_STEPS[window.setupStep];
  $('step-fill').style.width=((window.setupStep+1)/SETUP_STEPS.length*100)+'%';
  $('step-lbl').textContent=(window.setupStep+1)+'/'+SETUP_STEPS.length;
  $('setup-next').textContent=window.setupStep<SETUP_STEPS.length-1?'다음 →':'완료 ✓';
  const body=$('setup-body');

  if(step.type==='social'){
    const selId = window.setupChar.socialRankId;
    const selRank = SOCIAL_RANKS.find(r => r.id === selId);
    // 계층별 그룹핑
    const groups = [
      { label:'최하층 (노예·농노·무법자)', color:'#806060', ranks: SOCIAL_RANKS.filter(r => r.tier === 0) },
      { label:'자유민 (평민·상인)',        color:'#a09060', ranks: SOCIAL_RANKS.filter(r => r.tier === 1) },
      { label:'하급 귀족·전문직',         color:'#c0a030', ranks: SOCIAL_RANKS.filter(r => r.tier === 2) },
      { label:'중급 귀족 (남작~백작)',     color:'#d4a0c8', ranks: SOCIAL_RANKS.filter(r => r.tier === 3) },
      { label:'고위 귀족 (후작·공작)',     color:'#b050c0', ranks: SOCIAL_RANKS.filter(r => r.tier === 4) },
      { label:'최상층 (왕족·왕·황제)',     color:'#ffd700', ranks: SOCIAL_RANKS.filter(r => r.tier === 5) },
    ].filter(g => g.ranks.length > 0);

    body.innerHTML = `
      <div class="field-lbl">👑 신분</div>
      <div style="font-size:10px;color:var(--dim);margin-bottom:10px;line-height:1.5">
        신분은 NPC의 반응, 초기 스탯, 접근 가능한 장소·정보에 영향을 미칩니다.<br>
        게임 중 공훈이나 선택으로 신분이 바뀔 수 있습니다.
      </div>
      ${groups.map(g => `
        <div style="margin-bottom:8px">
          <div style="font-family:'Cinzel',serif;font-size:9px;color:${g.color};letter-spacing:1px;margin-bottom:5px;padding-bottom:3px;border-bottom:1px solid ${g.color}33">── ${g.label} ──</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            ${g.ranks.map(rank => {
              const locked = !isSocialRankUnlocked(rank.id);
              return `
              <div onclick="pickSocialRank('${rank.id}')"
                style="padding:9px;background:${selId===rank.id?'linear-gradient(135deg,#1a1000,#251800)':'var(--bg-card)'};
                  border:2px solid ${selId===rank.id?rank.color:'var(--border)'};
                  border-radius:3px;cursor:${locked?'not-allowed':'pointer'};transition:all .15s;${locked?'opacity:.42;filter:grayscale(.7)':''}">
                <div style="display:flex;align-items:center;gap:7px;margin-bottom:5px">
                  <span style="color:${rank.color};display:inline-flex;flex-shrink:0">${locked ? '🔒' : (typeof getEntityIconHTML==='function'?getEntityIconHTML(rank,{size:16}):(rank.svgIcon||rank.icon))}</span>
                  <div>
                    <div style="font-family:'Cinzel',serif;font-size:11px;color:${rank.color}">${rank.name}</div>
                    <div style="font-size:8px;color:var(--dim);margin-top:1px">${locked ? `🔒 환생 ${getSocialRankUnlockReq(rank.id)}회 필요` : rank.desc}</div>
                  </div>
                </div>
                ${(!locked && selId===rank.id) ? `
                  <div style="font-size:8px;color:${rank.color};line-height:1.6;padding:5px;background:#1a1000;border-radius:2px;margin-top:4px">
                    <div style="margin-bottom:3px">${rank.lore}</div>
                    <div style="border-top:1px solid ${rank.color}33;padding-top:3px;margin-top:3px">
                      <span style="color:#a09060">특권:</span> ${rank.privilege}<br>
                      <span style="color:#a09060">NPC 반응:</span> ${rank.npcReaction.slice(0,50)}...
                    </div>
                    <div style="margin-top:3px;display:flex;flex-wrap:wrap;gap:2px">
                      ${Object.entries(rank.startStat).filter(([,v])=>v!==0).map(([k,v]) =>
                        `<span style="padding:1px 5px;background:${v>0?'#1a2800':'#280a00'};border:1px solid ${v>0?'#40600044':'#60200044'};color:${v>0?'#80c060':'#e06060'};font-size:7px;border-radius:2px">${k.toUpperCase()} ${v>0?'+':''}${v}</span>`
                      ).join('')}
                    </div>
                  </div>` : ''}
              </div>`;
            }).join('')}
          </div>
        </div>`).join('')}
      ${selRank ? `<div class="sel-preview">선택됨: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(selRank,{size:16}):(selRank.icon)} ${selRank.name}</div>` : ''}
    `;
    return;
  }

  if(step.type==='job'){
    // 환생 기억에서 이전에 배운 직업 로드
    const jobMem = loadJobMemory();
    const rememberedJobs = Object.keys(jobMem).map(id=>{
      const job = findJob(id)||{id,name:id,icon:'💼'};
      const count = jobMem[id]?.count||0;
      const cycles = Array.isArray(jobMem[id]?.cycles) ? jobMem[id].cycles : [];
      return {...job, memCount:count, memCycles:cycles};
    }).filter(j=>j.memCount>0).slice(0,6);

    const BASE_4 = [
      {id:'warrior', name:'전사',   icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/><path d="M11 7 L7 11"/><path d="M13 11 L9 15"/></svg>`,  desc:'강인한 육체와 전투 기술. 직접 전투에 특화.', color:'#e05a5a'},
      {id:'mage',    name:'마법사', icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L13.5 8.5 L20 7 L15 12 L18 18.5 L12 15 L6 18.5 L9 12 L4 7 L10.5 8.5 Z" stroke-width="1.4"/><circle cx="12" cy="12" r="2.2" fill="currentColor" fill-opacity="0.25"/><path d="M12 9 L12 7 M15 12 L17 12 M12 15 L12 17 M9 12 L7 12" stroke-width="1.1"/></svg>`,  desc:'마법의 힘을 다루는 지식의 직업.', color:'#4a6fa5'},
      {id:'rogue',   name:'도적',   icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z" stroke-width="1.3"/><path d="M4 20 L5 17 L7 19 Z" stroke-width="1.3"/><path d="M11 13 L13 11"/><path d="M8 8 C8 8 6 10 6 13 L9 13 C9 11 10 9 10 9" stroke-width="1.1"/></svg>`, desc:'은신과 기습으로 적을 제압하는 민첩한 전사.', color:'#4a9a6a'},
      {id:'archer',  name:'궁수',   icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 L19 5"/><path d="M19 5 L14 5 L19 10 Z" stroke-width="1.3"/><path d="M5 19 L6 15 L9 18 Z" stroke-width="1.3"/><path d="M15 9 L17 7"/><path d="M13 11 L15 9"/><path d="M3 12 C3 12 8 10 12 3" stroke-width="1.3"/><path d="M12 3 C15 5 15 10 12 13" stroke-width="1.1"/></svg>`,  desc:'원거리 공격 특화. 날카로운 눈과 빠른 손의 직업.', color:'#a07840'},
      {id:'cleric',  name:'성직자', icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L12 21 M6 9 L18 9" stroke-width="2"/><path d="M8 13 C8 13 9 16 12 17 C15 16 16 13 16 13" stroke-width="1.2"/><circle cx="12" cy="6" r="1.5" fill="currentColor" fill-opacity="0.4" stroke-width="1.1"/></svg>`,  desc:'신의 가르침으로 치유와 신성 마법을 다루는 직업.', color:'#d4c060'},
      {id:'wanderer',name:'방랑자', icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.4"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.2"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.2"/></svg>`,  desc:'정해진 길 없이 방랑. 플레이에 따라 다양한 직업으로 파생됨.', color:'#c8a96e', special:true},
    ];

    body.innerHTML=`
      <div class="field-lbl">⚔️ 직업/역할</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:12px">
        ${BASE_4.map(job=>`
          <div class="race-card${window.setupChar.role===job.name?' sel':''}" onclick="pickJob('${job.id}','${esc(job.name)}')"
            style="border-color:${window.setupChar.role===job.name?job.color:'var(--border)'}" data-job-sel="${window.setupChar.role===job.name?'1':'0'}">
            <div class="race-icon">${typeof getEntityIconHTML==='function'?getEntityIconHTML(job,{size:16}):(job.icon)}</div>
            <div class="race-name" style="color:${job.color}">${esc(job.name)}</div>
            <div style="font-size:9px;color:var(--dim);margin-top:3px;line-height:1.3">${esc(job.desc)}</div>
            ${window.setupChar.role===job.name&&job.lore?`<div style="font-size:8px;color:#7a6a4a;line-height:1.4;margin-top:4px;font-style:italic;border-top:1px solid #2a1a05;padding-top:4px">${esc(job.lore.split('.')[0]+'.')}</div>`:''}
            ${job.special?'<div style="font-size:8px;color:#c8a96e;margin-top:3px">✨ 특수 직업</div>':''}
          </div>`).join('')}
      </div>

      ${rememberedJobs.length>0?`
        <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:6px;letter-spacing:1px">
          ♻️ 전생의 기억 (조건 완화 적용)
        </div>
        <div class="chips" style="margin-bottom:10px">
          ${rememberedJobs.map(j=>`
            <div class="chip${window.setupChar.role===j.name?' sel':''}" data-job-id="${j.id||'custom'}" data-job-name-raw="${j.name.replace(/"/g,'&quot;').replace(/'/g,'&#39;')}" onclick="pickJobByData(this)"
              style="position:relative" title="${j.memCycles.length?j.memCycles.map(c=>c+'회차').join(', ')+'에 플레이함':''}">
              ${j.icon||'💼'} ${esc(j.name)}
              <span style="font-size:8px;color:#a080e0;margin-left:3px">${j.memCount}회${j.memCycles.length?' ('+j.memCycles.slice(0,3).map(c=>c+'차').join(',')+(j.memCycles.length>3?'…':'')+')':''}</span>
            </div>`).join('')}
        </div>`:''}

      ${window.setupChar.role==='방랑자'?`
        <button onclick="openWandererMemoryModal()" style="
          width:100%;padding:9px;margin-bottom:10px;
          background:linear-gradient(135deg,#0d0800,#1a1005);
          border:1px solid #6a4a8a;color:#9a60c0;
          font-family:Cinzel,serif;font-size:10px;letter-spacing:1px;cursor:pointer;
        "><!-- 유령 SVG --><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" style="vertical-align:-1px;margin-right:5px"><path d="M4 14 C4 14 3 15 2 14 L2 8 C2 5 4.7 3 8 3 C11.3 3 14 5 14 8 L14 14 C13 15 12 14 12 14 C11 15 10 14 10 14 C9 15 8 14 8 14 C7 15 6 14 6 14 C5 15 4 14 4 14Z"/><circle cx="6" cy="8.5" r="1" fill="currentColor" stroke="none"/><circle cx="10" cy="8.5" r="1" fill="currentColor" stroke="none"/></svg> 방랑자의 기억 — 전생의 직업을 불러온다</button>
      `:''}


            <div style="font-size:10px;color:var(--dim);padding:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:2px;line-height:1.6">
        💡 <b style="color:var(--gold)">방랑자</b>를 선택하면 게임 중 플레이 방식에 따라 자동으로 직업이 파생됩니다.<br>
        ⚔️ 전투 중심: 사냥꾼 → 용병 → 영웅 경로<br>
        🌾 <b style="color:#80c080">비전투 경로</b>: 농부·상인·대장장이·치유사·음유시인으로 전직 가능 — 싸우지 않고도 <b style="color:#c8a96e">고유 엔딩</b> 달성 가능!<br>
        모든 직업은 게임 중 <b style="color:var(--gold)">무한히 파생·진화</b>하며, 이전 회차에서 배운 직업은 조건이 완화됩니다.
      </div>

      ${window.setupChar.role?`<div class="sel-preview" style="margin-top:8px">선택됨: ${esc(window.setupChar.roleIcon||'')} ${esc(window.setupChar.role)}</div>`:''}
    `;
    return;
  }

  if(step.type==='race'){
    body.innerHTML=`<div class="field-lbl">${typeof getEntityIconHTML==='function'?getEntityIconHTML(step,{size:16}):(step.icon)} ${step.label}</div>
      <div class="race-grid">${RACE_DEFS.map(r=>`
        <div class="race-card${window.setupChar.race===r.name?' sel':''}" onclick="pickRace('${esc(r.name)}')">
          <div class="race-icon">${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:16}):(r.icon)}</div>
          <div class="race-name">${esc(r.name)}</div>
        </div>`).join('')}
      </div>
      <div id="race-desc" style="font-size:11px;color:var(--dim);line-height:1.5"></div>`;
    return;
  }

  if(step.type==='name'){
    const race    = window.setupChar.race   || '';
    const era     = S.scenario?.era  || '중세 판타지';

    // 현재 입력값이 세계관에 어울리는지 가볍게 체크 (한글 2글자 이상이면 OK)
    const curName    = window.setupChar.name || '';
    const nameOk     = curName.trim().length >= 2;
    const nameWeird  = curName.trim().length > 0 && /[0-9!@#$%^&*()_+=\[\]{};':",.<>?\/\\|`~]/.test(curName);

    body.innerHTML = `
      <div class="field-lbl">👤 캐릭터 이름</div>
      <div style="font-size:10px;color:var(--dim);margin-bottom:10px;line-height:1.5">
        자유롭게 입력하세요. 비워두고 확인을 누르면 무작위로 정해집니다.
      </div>

      <!-- 이름 입력창 -->
      <div style="position:relative;margin-bottom:6px">
        <input class="setup-input" id="name-inp"
          placeholder="${race ? race+'족 이름 입력... (비워두면 무작위)' : '이름을 입력하세요 (비워두면 무작위)'}"
          value="${esc(curName)}"
          oninput="setupChar.name=this.value;_updateNameValidation()"
          style="width:100%;padding-right:36px">
        <button id="name-clear-btn" onclick="setupChar.name='';document.getElementById('name-inp').value='';_updateNameValidation()"
          style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--dim);font-size:16px;cursor:pointer;padding:0;line-height:1">×</button>
      </div>

      <!-- 검증 피드백 -->
      <div id="name-validation" style="font-size:9px;margin-bottom:10px;min-height:14px;line-height:1.4">
        ${nameWeird
          ? `<span style="color:#e07050">⚠️ 특수문자·숫자가 포함된 이름은 AI 서사에서 어색하게 표현될 수 있습니다.</span>`
          : nameOk
            ? `<span style="color:#60c060">✓ "${esc(curName)}" — ${era} 세계관에서 사용됩니다.</span>`
            : `<span style="color:var(--dim)">이름을 입력하지 않으면 무작위로 정해집니다.</span>`}
      </div>
    `;
    return;
  }

  if(step.type==='continent'){
    const CONTINENTS = START_CONTINENTS;
    const sel = window.setupChar.startContinent;
    body.innerHTML=`
      <div class="field-lbl">🗺️ 시작 대륙</div>
      <div style="font-size:10px;color:var(--dim);margin-bottom:10px;line-height:1.5">
        모험을 시작할 대륙을 선택하세요. 선택한 대륙에서 게임이 시작됩니다.
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        ${CONTINENTS.map(c=>`
          <div class="race-card${sel===c.id?' sel':''}" onclick="pickContinent('${c.id}','${c.label}')"
            style="border-color:${sel===c.id?c.color:'var(--border)'};cursor:pointer;padding:10px 8px">
            <div style="display:flex;justify-content:center;color:${c.color};margin-bottom:4px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(c,{size:16}):(c.svgIcon||c.icon)}</div>
            <div class="race-name" style="color:${c.color};font-size:11px">${c.label}</div>
            <div style="font-size:9px;color:var(--dim);margin-top:4px;line-height:1.4">${c.desc}</div>
            ${sel===c.id?`<div style="font-size:8px;color:${c.color};margin-top:5px;font-style:italic;border-top:1px solid ${c.color}33;padding-top:4px">${c.lore}</div>`:''}
          </div>`).join('')}
        <div class="race-card${sel==='random'?' sel':''}" onclick="pickContinent('random','랜덤')"
          style="border-color:${sel==='random'?'#9060c0':'var(--border)'};cursor:pointer;padding:10px 8px;grid-column:1/-1;display:flex;align-items:center;gap:10px">
          <div style="color:#9060c0;display:flex;flex-shrink:0"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></svg></div>
          <div>
            <div class="race-name" style="color:#9060c0;font-size:11px">랜덤 대륙</div>
            <div style="font-size:9px;color:var(--dim);margin-top:2px;line-height:1.4">게임 시작 시 8대륙 중 하나가 무작위로 선택됩니다.</div>
          </div>
        </div>
      </div>
      ${sel?`<div class="sel-preview" style="display:flex;align-items:center;gap:6px">선택됨: ${sel==='random'?'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" style="vertical-align:-3px"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></svg> 랜덤':`<span style="display:inline-flex;width:14px;height:14px">${(CONTINENTS.find(c=>c.id===sel)?.svgIcon||'').replace('width="22" height="22"','width="14" height="14"')}</span> ${window.setupChar.startContinentLabel}`}</div>`:''}
    `;
    return;
  }

  if(step.type==='goals'){
    const sel = Array.isArray(window.setupChar._goals) ? window.setupChar._goals : [];
    const selDefs = LIFE_GOALS.filter(g=>sel.includes(g.label));
    const totalDiff = selDefs.reduce((s,g)=>s+(g.difficulty||0),0);
    body.innerHTML=`
      <div class="field-lbl">🎯 이번 생의 목표</div>
      <div style="font-size:10px;color:var(--dim);margin-bottom:10px;line-height:1.5">최대 3개까지 선택하세요. 난이도와 서사에 반영됩니다. 건너뛰어도 됩니다.</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
        ${LIFE_GOALS.map(g=>{
          const isSel = sel.includes(g.label);
          return `<div onclick="toggleLifeGoal('${g.label.replace(/'/g,"\\'")}')" style="display:flex;align-items:flex-start;gap:8px;padding:9px 10px;background:${isSel?'#1a1200':'var(--bg-input)'};border:1px solid ${isSel?'var(--gold)':'var(--border)'};cursor:pointer;border-radius:2px">
            <span style="color:${isSel?'var(--gold)':'var(--text)'};flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(g,{size:16}):(g.icon)}</span>
            <div><div style="font-family:'Cinzel',serif;font-size:10px;color:${isSel?'var(--gold)':'var(--text)'}">${g.label}</div>
            <div style="font-size:9px;color:var(--dim);margin-top:2px;line-height:1.4">${g.desc}</div></div>
            ${isSel?'<span style="margin-left:auto;color:var(--gold);font-size:12px;flex-shrink:0">✓</span>':''}
          </div>`;
        }).join('')}
      </div>
      ${sel.length?`<div class="sel-preview">선택된 목표 (${sel.length}/3): ${esc(sel.join(' / '))}</div>
        <div style="font-size:9px;color:var(--gold);margin-top:4px;line-height:1.5">⚠️ 이번 생 난이도 +${totalDiff} (적이 더 강해집니다) · 목표 달성 시 영구 보너스 획득 (환생해도 유지)</div>`
        :'<div style="font-size:9px;color:var(--dim);text-align:center">건너뛰어도 됩니다</div>'}
    `;
    return;
  }

  // 배경 스토리·성격 단계 진입 시 추천이 없으면 자동으로 fallback 표시
  if(window.setupSuggestions.length===0 && (step.key==='background'||step.key==='personality')){
    window.setupSuggestions = getFallbackSugs(step.key);
  }

  const hasVal=!!window.setupChar[step.key];
  // [버그 수정] 어디서도 선언되지 않은 채로 쓰이던 변수라 항상
  // "isLocal is not defined" ReferenceError로 이 화면 자체가 깨졌었다.
  // API 키가 없으면(=생성이 로컬 조합으로만 동작) 버튼 문구를 다르게 표시.
  const isLocal = !(S.apiKeys && S.apiKeys.length);
  body.innerHTML=`<div class="field-lbl">${typeof getEntityIconHTML==='function'?getEntityIconHTML(step,{size:16}):(step.icon)} ${step.label}</div>
    <div class="mode-tabs">
      <button class="m-tab${window.setupMode==='suggest'?' act':''}" onclick="setMode('suggest')">추천</button>
      <button class="m-tab${window.setupMode==='type'?' act':''}" onclick="setMode('type')">직접 입력</button>
    </div>
    <div id="sug-area">
      ${window.setupSuggestions.length===0?`<button class="btn btn-gold" style="width:100%;margin-bottom:10px" onclick="loadSugs()">✨ ${isLocal?'추천 불러오기':'AI 추천 받기'}</button>`:`
        <div class="chips">${window.setupSuggestions.map((s,i)=>{
            const isSelected = window.setupChar[step.key]===s;
            const safeKey = step.key.replace(/'/g,"&#39;");
            return `<div class="chip${isSelected?' sel':''}" 
              data-sug-idx="${i}" data-sug-key="${safeKey}"
              onclick="pickSugByIdx(this)"
              style="cursor:pointer">${esc(s)}</div>`;
          }).join('')}</div>
        <div style="display:flex;gap:5px;margin-bottom:8px">
          <button class="btn btn-dark" style="flex:1;padding:5px 9px;font-size:9px" onclick="shuffleSugs()">🔀 다른 추천 보기</button>
          <button class="btn btn-dark" style="flex:1;padding:5px 9px;font-size:9px" onclick="loadSugs()">✨ AI 새로 받기</button>
        </div>`}
    </div>
    <div id="type-area" style="display:${window.setupMode==='type'?'block':'none'}">
      <textarea class="setup-input" id="type-inp" rows="3" placeholder="${esc(step.label)}을 직접 입력하세요" oninput="setupChar['${step.key}']=this.value">${esc(window.setupChar[step.key]||'')}</textarea>
    </div>
    ${hasVal?`<div class="sel-preview">선택됨: ${esc((window.setupChar[step.key]||'').slice(0,80))}${(window.setupChar[step.key]||'').length>80?'...':''}</div>`:''}
    ${step.key==='role'&&S.jobSkillLoading?'<div style="text-align:center;padding:12px;color:var(--dim);font-size:11px">⚙ 직업 스킬 생성 중...</div>':''}
    ${step.key==='role'&&S.jobSkillDone?`<div style="text-align:center;padding:12px;color:#60a060;font-size:11px">✅ 직업 스킬 생성 완료</div>`:''}`;
}
window.renderSetupStep = renderSetupStep;

export function pickContinent(id, label){ window.setupChar.startContinent=id; window.setupChar.startContinentLabel=label; renderSetupStep(); }
window.pickContinent = pickContinent;

export function setMode(m){ window.setupMode=m; renderSetupStep(); }
window.setMode = setMode;

export function shuffleSugs(){
  const step=SETUP_STEPS[window.setupStep];
  const era=S.scenario?.era||'중세 판타지';
  const cacheKey=getSuggCacheKey(step, window.setupChar, era);
  const cached=loadSuggCache()[cacheKey]||[];
  if(cached.length<=1){ toast('아직 누적된 추천이 없어요. AI 새로 받기를 눌러보세요.', 2000); return; }
  window.setupSuggestions=cached.sort(()=>Math.random()-.5).slice(0,10);
  renderSetupStep();
  toast('🔀 '+cached.length+'개 중 랜덤 표시', 1200);
}
window.shuffleSugs = shuffleSugs;

export function pickRace(name){
  window.setupChar.race=name;
  const race=RACE_DEFS.find(r=>r.name===name);
  document.querySelectorAll('.race-card').forEach(c=>c.classList.toggle('sel',c.querySelector('.race-name')?.textContent===name));
  const desc=$('race-desc');
  if(desc&&race){
    // 스탯 보너스
    const bonuses=Object.entries(race.statBonus||{}).map(([k,v])=>{
      const info=getStatInfo(k); return `<span style="color:${v>0?'#60a060':'#e05a5a'}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(info,{size:14}):(info?.icon||'')}${info?.name||k} ${v>0?'+':''}${v}</span>`;
    }).join(' ');
    const penalties=Object.entries(race.statPenalty||{}).map(([k,v])=>{
      const info=getStatInfo(k); return `<span style="color:#e05a5a">${typeof getEntityIconHTML==='function'?getEntityIconHTML(info,{size:14}):(info?.icon||'')}${info?.name||k} ${v}</span>`;
    }).join(' ');
    // 종족 스킬
    const skills=(race.skills||[]).map(s=>`<span style="background:#0d0800;border:1px solid #3a2a0a;padding:2px 6px;border-radius:2px;font-size:10px;color:#c8a96e">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:10}):(s.icon)} ${s.name}</span>`).join(' ');
    desc.innerHTML=`
      <div style="font-size:11px;color:#d4b896;line-height:1.6;margin-bottom:8px">${esc(race.lore||race.desc||'')}</div>
      ${bonuses?`<div style="margin-bottom:5px;font-size:10px;font-family:'Cinzel',serif;letter-spacing:.5px">스탯: ${bonuses}${penalties?' '+penalties:''}</div>`:''}
      ${skills?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${skills}</div>`:''}
    `;
  }
}
window.pickRace = pickRace;

export function pickJob(jobId, jobName){
  window.setupChar.role = jobName;
  window.setupChar.jobId = jobId;
  // 방랑자면 직업 아이콘 설정
  const base4Icons = {warrior:'⚔️',mage:'🔮',rogue:'🗡️',archer:'🏹',cleric:'✝️',wanderer:'🌍'};
  const job = findJob(jobId)||{icon:'💼'};
  window.setupChar.roleIcon = base4Icons[jobId] || job.icon || '💼';
  // 직업 스킬 생성 (방랑자 제외) — genJobSkills는 (더 이상 AI 호출 없이)
  // 완전히 동기적으로 동작하며 내부에서 S.jobSkillLoading/Done을 직접
  // 갱신한다. 예전엔 AI 호출을 기다리는 비동기 함수였어서 .finally()로
  // 이어붙였는데, 지금은 Promise를 반환하지 않아 .finally 자체가 없어
  // "Cannot read properties of undefined (reading 'finally')"로 항상
  // 크래시했다.
  if(jobId !== 'wanderer'){
    S.jobSkillLoading=true; S.jobSkillDone=false; renderSetupStep();
    genJobSkills(jobName);
    renderSetupStep();
  } else {
    renderSetupStep();
  }
}
window.pickJob = pickJob;

export function _updateNameValidation(){
  const curName = document.getElementById('name-inp')?.value || '';
  window.setupChar.name = curName;
  const el = document.getElementById('name-validation');
  if(!el) return;
  const nameWeird = curName.trim().length > 0 && /[0-9!@#$%^&*()_+=\[\]{};':",.<>?\/\\|`~]/.test(curName);
  const nameOk    = curName.trim().length >= 2;
  const era = S.scenario?.era || '중세 판타지';
  el.innerHTML = nameWeird
    ? `<span style="color:#e07050">⚠️ 특수문자·숫자가 포함된 이름은 AI 서사에서 어색하게 표현될 수 있습니다.</span>`
    : nameOk
      ? `<span style="color:#60c060">✓ "${esc(curName)}" — ${era} 세계관에서 사용됩니다.</span>`
      : `<span style="color:var(--dim)">이름을 입력하지 않으면 무작위로 정해집니다.</span>`;
}
window._updateNameValidation = _updateNameValidation;

// 종족별 이름 뱅크 — 이름을 비워두고 확인을 누르면 setupNext()가 여기서
// 무작위로 하나를 골라 자동 배정한다.
const RACE_NAME_BANK = {
  '인간': ['아론','칼리아','도리안','에리크','레나','세이런','알비크','미란','토르','이사벨','테오도르','미리엘','카시안','노라','귀도'],
  '엘프': ['아엘린','실바누스','에이리온','루넬','타이엘','피리엘','카엘','시나','에르온','리아넬','셀레네','아라우인','피에린','칼란드라','에일로스'],
  '드워프': ['브람','고르린','두린','토르그림','헬가','브린','모그림','다그니','볼리','기르다','쏘린','그림보르','우나','발다르','로그니르'],
  '오크': ['고르크','우르샥','나르가','크롬','셰이크','보그단','루그','무르크','다르가','울그','그로쉬','바르가스','스칼드','모라그','드락투스'],
  '언데드': ['모르덴','셰이드','리체','발튀르','크라이스','아스모','렉나','드라우르','네크라','스펙터','말라키','오시리안','카론','비스퍼','자이러스'],
  '악마족': ['발록','세리스','말파스','리리스','아스타르','벨리알','나사르','크루엘','엘딘','모르가스','아자젤','메피스토','바알록','키메라','인퍼노'],
  '세레스티얼': ['아우라','세라핀','루미엘','에이리스','칼리엘','소피아','미트라','헤이로','엘리온','라디아','가브리엘라','우리엘','제피리네','오로라','셀레스티나'],
  '다크링': ['녹스','움브라','셰이도','다르켄','네뷸라','모르스','칼리고','에레보스','타네브','블랙웰','베일리스','샤도우린','미드나이트','실루엣','그림자엘'],
  '수인': ['라이온하트','펜리르','키츠네','울프강','타이거','베어울프','린스','폭시','팬서','클로','섀도우팽','실버클로','문하울','스톰폭스','아이언베어'],
  '원소인': ['이그니스','아쿠아리스','테라온','벤투스','플레임하트','프로스틴','로크','썬더러','미스틸','에메랄딘','스파크윙','스톤하트','미스트랄','볼케이노','크리스탈린'],
  '뱀파이어': ['블라드','카르밀라','노스페라','로젠크로이츠','드라큘리아','에레보니아','산기니스','녹턴','베노사','크림슨','모르티시아','아르카나','블러드문','섀도우팡','네크로폴'],
  '드래곤혈': ['드라코니아','펜드래곤','와이번스','스케일하트','타이란트','드레이크','시린드라','발로그','아젠타','칼사스','인페르노스','타이드콜러','블레이즈하트','프로스트윙','섀도우스케일'],
};

export function pickJobByData(el){
  const jobId   = el.dataset.jobId   || 'custom';
  const jobName = el.dataset.jobNameRaw || el.dataset.jobName || '';
  if(!jobName) return;
  pickJob(jobId, jobName);
}
window.pickJobByData = pickJobByData;

export function pickSugByIdx(el){
  const idx = parseInt(el.dataset.sugIdx);
  const key = el.dataset.sugKey;
  if(isNaN(idx) || !key) return;
  const val = window.setupSuggestions[idx];
  if(val === undefined) return;
  pickSug(key, val);
}
window.pickSugByIdx = pickSugByIdx;

export function pickSug(key,val){
  window.setupChar[key]=val;
  if(key==='role'){
    S.jobSkillLoading=true; S.jobSkillDone=false; renderSetupStep();
    genJobSkills(val).finally(()=>renderSetupStep());
  } else { renderSetupStep(); }
}
window.pickSug = pickSug;

export const SUGG_CACHE_KEY = 'taleforge-sugg-cache';

window._suggCacheData = {};

export function loadSuggCache(){ return window._suggCacheData; }
window.loadSuggCache = loadSuggCache;

export function saveSuggCache(cache){
  window._suggCacheData = cache;
  // 파일 내 sugg-cache-store 엘리먼트에 직렬화해서 저장
  try{
    const el = document.getElementById('sugg-cache-store');
    if(el) el.textContent = JSON.stringify(cache);
  }catch(e){}
  // localStorage에도 병행 저장 (같은 경로에서 열 때 보조)
  try{ lsSet(SUGG_CACHE_KEY, JSON.stringify(cache)); }catch(e){}
}
window.saveSuggCache = saveSuggCache;

export function initSuggCache(){
  // 1순위: 파일 내부 embed
  try{
    const el = document.getElementById('sugg-cache-store');
    if(el && el.textContent.trim()){
      window._suggCacheData = JSON.parse(el.textContent);
      return;
    }
  }catch(e){}
  // 2순위: localStorage (같은 경로에서 열었을 때)
  try{
    const ls = lsGet(SUGG_CACHE_KEY);
    if(ls){ window._suggCacheData = JSON.parse(ls); return; }
  }catch(e){}
  window._suggCacheData = {};
}
window.initSuggCache = initSuggCache;

export function getSuggCacheKey(step, char, era){ return `${step.key}__${era}__${char.race||''}__${char.role||''}`; }
window.getSuggCacheKey = getSuggCacheKey;

export function addToSuggCache(cacheKey, items){
  const cache = loadSuggCache();
  const existing = cache[cacheKey] || [];
  const merged = [...new Set([...existing, ...items])];
  cache[cacheKey] = merged;
  saveSuggCache(cache);
  return merged;
}
window.addToSuggCache = addToSuggCache;

export async function loadSugs(){
  const step=SETUP_STEPS[window.setupStep];
  if(step.type==='local'){
    window.setupSuggestions=[...LOCAL_PERSONALITIES].sort(()=>Math.random()-.5).slice(0,5);
    renderSetupStep(); return;
  }
  const era=S.scenario?.era||'중세 판타지';
  const cacheKey=getSuggCacheKey(step, window.setupChar, era);
  const cached=loadSuggCache()[cacheKey]||[];

  const area=$('sug-area');
  if(cached.length>=5){
    // 캐시 있으면 랜덤 10개 보여주기 (백그라운드 자동 AI 호출 없음 - "AI 새로 받기" 버튼으로만 호출)
    window.setupSuggestions=cached.sort(()=>Math.random()-.5).slice(0,10);
    renderSetupStep();
    return;
  }
  if(area) area.innerHTML='<div style="text-align:center;padding:14px;color:var(--dim);font-size:11px">✨ AI 추천 생성 중...</div>';
  await _fetchAndCacheSugs(step, era, cacheKey, false);
}
window.loadSugs = loadSugs;

// [변경] 예전엔 여기서 Gemini를 호출해 항목 10개를 받아왔다. 이제는
// 이미 아래 getFallbackSugs()에 마련돼 있던 큐레이션 풀(직업/성격/배경/
// 말투 각각 10~14개)에서 매번 무작위로 뽑아 캐시에 누적한다 — AI 호출 없음.
export function _fetchAndCacheSugs(step, era, cacheKey, silent){
  const items = getFallbackSugs(step.key, 10);
  if(items.length){
    const merged=addToSuggCache(cacheKey, items);
    window.setupSuggestions=merged.sort(()=>Math.random()-.5).slice(0,10);
    if(!silent) toast('✨ 총 '+merged.length+'개 추천 저장됨', 1500);
    else toast('✨ 새 추천 '+items.length+'개 추가 (누적 '+merged.length+'개)', 1800);
  } else {
    window.setupSuggestions=[];
  }
  renderSetupStep();
}
window._fetchAndCacheSugs = _fetchAndCacheSugs;

export function getFallbackSugs(key, count=5){
  const id=S.scenario?.id||'default';
  const jobs={
    medieval:['기사','마법사','도적','성직자','검사','팔라딘','연금술사','음유시인','상인','탐정','마녀','수도사','궁수','대장장이'],
    default:['전사','마법사','도적','성직자','탐정','상인','음유시인','연금술사','사냥꾼','점술사'],
  };
  const pers=[
    '차갑고 냉소적이지만 내면에 깊은 의리가 있다.','겉으로는 밝고 유쾌하지만 혼자일 때 깊은 고독에 잠긴다.',
    '말수가 적고 감정을 드러내지 않지만 행동으로 마음을 전한다.','직설적이고 거침없어 주변을 당황시키지만 진심이 있다.',
    '논리적이고 냉정하지만 정작 감정에 약한 순간들이 있다.','타인을 쉽게 믿지 않지만 한번 믿으면 끝까지 간다.',
    '세상을 냉소하는 척하지만 약자 앞에서는 누구보다 따뜻하다.','자신감 넘치고 카리스마 있지만 실패에 몹시 취약하다.',
    '조용하고 관찰력이 뛰어나며 말보다 행동을 중시한다.','언제나 유머를 잃지 않지만 그 속에 뼈 있는 진심이 있다.',
  ];
  const bg=[
    '평범한 삶을 살다가 운명이 바뀐 순간이 있었다.','가족을 잃은 후 복수를 맹세했다.',
    '누군가의 제자였으나 스승을 잃고 홀로 세상에 내던져졌다.','비밀 조직에 속해 있었으나 이탈했다.',
    '과거의 죄를 씻기 위해 방랑한다.','전쟁에서 살아남은 유일한 생존자다.',
    '귀족의 자식이지만 모든 것을 잃고 밑바닥부터 시작한다.','운명의 예언에 이름이 올라 원치 않는 여정을 떠났다.',
    '과거 기억이 없으며 자신의 정체를 찾아 헤맨다.','죽었다가 이유 모를 채 되살아났다.',
  ];
  // [정리] speechStyle 후보 뱅크는 삭제 — SETUP_STEPS에 "말투" 단계
  // 자체가 없어서(성격 선택 후 키워드 매칭으로 자동 결정됨, 아래
  // 참조) getFallbackSugs가 step.key==='speechStyle'로 호출될 진입점이
  // 애초에 없던 죽은 코드였다. 자동 매칭 로직은 그대로 유지.
  const pools={role:(jobs[id]||jobs.default),personality:pers,background:bg};
  return [...(pools[key]||[])].sort(()=>Math.random()-.5).slice(0,count);
}
window.getFallbackSugs = getFallbackSugs;

// [변경] 예전엔 여기서 Gemini에게 직업별 스킬 30개를 즉석에서 만들어
// 달라고 요청했다. 이제는 makeFallbackSkills()가 만드는 기본 7종
// (공격/강타/집중/회피본능/인내/두번째바람/최후의저항 — 이미 active·
// passive·event 세 카테고리와 실제 수치 effects를 전부 갖춘 완결된
// 세트다)을 항상 사용한다. AI가 만들던 만큼의 개수는 아니지만, 모든
// 직업이 즉시·무료로 실제 작동하는 스킬셋을 갖게 된다는 게 핵심이다.
export function genJobSkills(roleName){
  S.jobSkillLoading=true; S.jobSkillDone=false;
  const sid=S.scenario?.id||'custom';
  const existing = loadJobSkills().filter(s=>s.id?.startsWith('race_') || (s.jobRole && s.jobRole !== roleName));
  const fallback = makeFallbackSkills(roleName,sid);
  saveJobSkills([...existing,...fallback]);
  S.jobSkillLoading=false; S.jobSkillDone=true;
}
window.genJobSkills = genJobSkills;

export function makeFallbackSkills(role,sid){
  return [
    {id:'job_attack',type:'active',name:'기본 공격',icon:'⚔️',rarity:'common',mpCost:0,hpCost:0,hpRestore:0,req:{},desc:'기본 전투 기술.',aiHint:role+'이 기본 공격을 사용합니다.',condition:null,conditionDesc:null,statBoost:{},scenario:sid,jobRole:role,
      effects:{ kind:'damage', statSource:{str:1}, damageMult:0.5, element:'physical' }},
    {id:'job_heavy',type:'active',name:'강타',icon:'💥',rarity:'uncommon',mpCost:15,hpCost:0,hpRestore:0,req:{str:20},desc:'강력한 일격.',aiHint:'강타를 날립니다.',condition:null,conditionDesc:null,statBoost:{},scenario:sid,jobRole:role,
      effects:{ kind:'damage', statSource:{str:1}, damageMult:0.75, element:'physical' }},
    {id:'job_focus',type:'active',name:'집중',icon:'🎯',rarity:'uncommon',mpCost:10,hpCost:0,hpRestore:0,req:{},desc:'다음 판정을 향상시킨다.',aiHint:'깊게 집중합니다.',condition:null,conditionDesc:null,statBoost:{},scenario:sid,jobRole:role,
      effects:{ kind:'statBoost', statMod:{per:10,wil:8} }},
    {id:'job_evade',type:'passive',name:'회피 본능',icon:'🌪️',rarity:'common',mpCost:0,hpCost:0,hpRestore:0,req:{agi:15},desc:'AGI +6.',aiHint:'날렵하게 피합니다.',condition:'in_combat',conditionDesc:'전투 중',statBoost:{agi:48},scenario:sid,jobRole:role},
    {id:'job_endure',type:'passive',name:'인내',icon:'🛡️',rarity:'common',mpCost:0,hpCost:0,hpRestore:0,req:{end:15},desc:'END +6.',aiHint:'버텨냅니다.',condition:'in_combat',conditionDesc:'전투 중',statBoost:{end:48},scenario:sid,jobRole:role},
    {id:'job_second',type:'event',name:'두 번째 바람',icon:'💪',rarity:'rare',mpCost:0,hpCost:0,hpRestore:25,req:{},desc:'HP 25 회복.',aiHint:'강하게 일어납니다.',condition:'hp_critical',conditionDesc:'HP 30% 이하',statBoost:{},scenario:sid,jobRole:role},
    {id:'job_last',type:'event',name:'최후의 저항',icon:'🌟',rarity:'legendary',mpCost:0,hpCost:0,hpRestore:0,req:{},desc:'죽음 직전 모든 힘을 끌어모아 반격한다.',aiHint:'비장의 카드를 꺼냅니다!',condition:'hp_danger',conditionDesc:'HP 15% 이하',statBoost:{str:160,agi:120},scenario:sid,jobRole:role},
  ];
}
window.makeFallbackSkills = makeFallbackSkills;

export function setupPrev(){ if(window.setupStep>0){window.setupStep--;window.setupSuggestions=[];renderSetupStep();}else { S.scenario={...MEDIEVAL_SCENARIO}; showScreen('scenario'); } }
window.setupPrev = setupPrev;

export function setupNext(){
  const step=SETUP_STEPS[window.setupStep], val=window.setupChar[step.key];
  const optional=['personality','background','_goals'];
  // _goals는 배열이라 undefined일 수 있으므로 초기화
  if(step.key==='_goals' && !Array.isArray(window.setupChar._goals)) window.setupChar._goals=[];
  // 이름을 비워두면 막지 않고 종족 이름 뱅크에서 무작위로 자동 배정한다.
  if(step.key==='name' && (!val || !val.trim())){
    const race = window.setupChar.race;
    const pool = RACE_NAME_BANK[race] || RACE_NAME_BANK['인간'];
    window.setupChar.name = pool[Math.floor(Math.random()*pool.length)];
  }
  if(!val&&!optional.includes(step.key)&&step.key!=='name'){ toast(step.label+'을(를) 선택하거나 입력해주세요'); return; }
  // 신분 선택 시 socialRankId 확인
  if(step.key==='socialRank'&&!window.setupChar.socialRankId){ window.setupChar.socialRankId='commoner'; window.setupChar.socialRank='평민'; }
  // 직업 선택 시 jobId 확인
  if(step.key==='role'&&!window.setupChar.jobId){ window.setupChar.jobId='custom'; }
  if(window.setupStep<SETUP_STEPS.length-1){ window.setupStep++; window.setupSuggestions=[]; renderSetupStep(); }
  else startGame();
}
window.setupNext = setupNext;

export function startGame(){
  // [버그 수정] misc/261이 이 함수(정의된 곳 밖)에서 window.startGame을
  // 감싸 "이전 세션 요약 저장"(saveSessionSummary)을 새 게임 시작 직전에
  // 실행하려 했지만, 이 함수의 실제 호출부(core/084 자체의 setupNext()가
  // else startGame(); 형태로 직접 호출)가 bare 식별자라 그 감싸기가
  // 적용된 적이 없다 — "이전 세션 요약" 팝업(showLastSessionSummary)이
  // 참조하는 세션 로그가 한 번도 쌓이지 않았던 것. 실제 정의부 맨 앞에
  // 직접 연결한다.
  if(typeof window.saveSessionSummary==='function'){ try{ window.saveSessionSummary(); }catch(e){} }
  // [CRITICAL BUG FIX] 메인 퀘스트 1장(mq1)을 active로 초기화하는 코드가
  // 없어서, completeMainQuest의 aiHint 전달 체인이 시작부터 끊겨있던 버그.
  // 1장은 trigger:'organic'(강제 발동 없음)이지만, 그 aiHint("플레이어가
  // 자연스럽게 마주칠 때까지 강요하지 않는다") 자체가 AI에게 전달되려면
  // active 상태여야 한다.
  try{
    const _mqInit = (typeof loadMainQuestState === 'function') ? loadMainQuestState() : {};
    if(!_mqInit['mq1']){
      _mqInit['mq1'] = 'active';
      // [21번 라운드, 시스템 업그레이드 ③] 다른 모든 챕터 활성화 지점
      // (job/042 completeMainQuest)과 동일하게 활성화 시각(턴)을 남긴다.
      _mqInit['mq1_activeSinceTurn'] = S.msgCount||0;
      if(typeof saveMainQuestState === 'function') saveMainQuestState(_mqInit);
    }
  }catch(e){}
  // 항상 중세 판타지로 고정
  S.scenario = {...MEDIEVAL_SCENARIO};
  // 랜덤 대륙 처리
  if(window.setupChar.startContinent==='random'){
    const allC=['central','north','east','west','south','northeast','southeast','northwest'];
    const allCLabel=['중앙 대륙','북대륙','동대륙','서대륙','남대륙','북동 대륙','남동 군도','북서 대륙'];
    const ri=Math.floor(Math.random()*allC.length);
    window.setupChar.startContinent=allC[ri];
    window.setupChar.startContinentLabel=allCLabel[ri];
  }
  const char={...window.setupChar, scenario:S.scenario?.era||'', customWorldSetting:S.scenario?.customWorldSetting||''};
  // [신규] 이 생을 방랑자로 시작했는지 기록 — 캐릭터 생성 화면에서
  // 고른 최초 직업(role)을 startRole로 고정 저장한다. 이후 전직을
  // 거듭해도 startRole은 바뀌지 않아, 환생 시 "이 생은 방랑자로
  // 시작해서 어떤 경로로 파생됐는가"를 정확히 판별할 수 있다.
  char.startRole = char.role;
  // [F-BUG 수정] 새 캐릭터를 생성해도 이전 캐릭터가 해금했던 직업
  // 스킬(taleforge-skills)이 그대로 남아있던 버그. doReincarnate(환생)
  // 로직은 clearSkills() 등을 명시적으로 호출해 정리하지만, 이 함수
  // (startGame — 캐릭터 생성 화면에서 "진짜 처음부터" 새 캐릭터를
  // 만드는 경로)는 그 초기화를 전혀 하지 않았다 — 그래서 예전에 도적
  // 으로 "기습" 스킬을 해금해뒀다면, 그 뒤로 방랑자 등 어떤 새 캐릭터를
  // 만들어도 도적 스킬이 계속 남아 스킬 퀵슬롯에 뜨는 원인이었다.
  // 이미 S.unlockedSkills=loadSkills()로 아래에서 곧 로드하므로, 그
  // 직전에 저장소 자체를 비워 "이번 생은 아무 스킬도 없는 상태"에서
  // 시작하도록 보장한다. 회차 수·도감·플레이로그 등 유지해야 할
  // 누적 데이터(checkStaleCollectedData가 다루는 영역)는 건드리지 않고,
  // 순수하게 "캐릭터 개인의 스킬 보유 상태"만 초기화한다.
  if(typeof clearSkills==='function') clearSkills();
  if(typeof clearSkillSP==='function') clearSkillSP();
  if(typeof clearJobSkills==='function') clearJobSkills();
  // 성격으로 말투 자동 결정
  if(!char.speechStyle && char.personality){
    const p = char.personality;
    if(/냉정|차갑|무뚝|쿨|침착|냉혹/.test(p))        char.speechStyle = '차갑고 간결하게 말한다. 불필요한 감정 표현을 피한다.';
    else if(/격식|귀족|고풍|예의|품위/.test(p))       char.speechStyle = '고풍스럽고 격식 있는 말투를 쓴다.';
    else if(/거칠|난폭|직설|솔직|과격/.test(p))       char.speechStyle = '거칠고 직설적이다. 돌려 말하는 법을 모른다.';
    else if(/조용|사려|신중|내성|차분/.test(p))       char.speechStyle = '조용하고 사려 깊게 말한다.';
    else if(/비꼬|빈정|냉소|독설|날카/.test(p))       char.speechStyle = '어딘가 빈정거리는 듯한 말투를 쓴다.';
    else if(/철학|사색|수수께끼|신비|현자/.test(p))   char.speechStyle = '질문에 질문으로 되받아친다.';
    else if(/활발|쾌활|명랑|외향|열정|씩씩/.test(p)) char.speechStyle = '감탄사를 섞어가며 생생하게 말한다.';
    else if(/시인|예술|감성|낭만|문학/.test(p))       char.speechStyle = '시적이고 비유적인 표현을 즐긴다.';
    else if(/단호|강인|리더|결단|의지/.test(p))       char.speechStyle = '짧고 단호하게 핵심만 말한다.';
    else if(/따뜻|친절|배려|온화|상냥/.test(p))       char.speechStyle = '상대를 배려하며 부드럽게, 하지만 단호하게 말한다.';
    else                                               char.speechStyle = `${char.personality}에 어울리는 자연스러운 말투로 말한다.`;
  }
  // jobId 확실히 설정
  if(!char.jobId) char.jobId = getJobIdFromName(char.role)||'custom';
  // 기본 직업 도감 등록
  if(char.jobId) discoverJob(char.jobId, '캐릭터 생성 시 선택');
  if(S.pastLifeData?.statBonuses) char.pastLifeStatBonuses=S.pastLifeData.statBonuses;
  S.character=char;
  // [CRITICAL BUG FIX] recordRacePlayed가 어디서도 호출되지 않아 종족 진화
  // 시스템(BLOODLINE_EVOLUTION — 뱀파이어 포함 모든 종족)이 영원히 0회차로
  // 고정되어 절대 진화하지 않던 버그. 캐릭터 생성 확정 시점에 누적 기록.
  if(char.race && typeof recordRacePlayed==='function') recordRacePlayed(char.race);
  saveCharacter();   // 캐릭터 정보 즉시 분리 저장
  saveScenario();    // 시나리오 즉시 분리 저장
  // 스탯 초기화
  const base={};
  ALL_STAT_KEYS.forEach(k=>base[k]= (k==='hp'||k==='mp') ? 100 : 10);
  // 영구 누적 스탯 보너스 적용 (환생 반복할수록 기본 스탯 상승)
  const permBonus = loadPermStatBonus();
  ALL_STAT_KEYS.forEach(k=>{ base[k]=Math.min(999,Math.max(0,(base[k]||10)+(permBonus[k]||0))); });
  const race=RACE_DEFS.find(r=>r.name===char.race);
  if(race?.statBonus) Object.entries(race.statBonus).forEach(([k,v])=>{base[k]=Math.min(999,Math.max(0,(base[k]||50)+v));});
  // 신분 스탯 보너스 적용
  applySocialRankStat(char, base);
  S.stats=base;
  // 패시브 스킬 스탯 부스트 적용
  applyAllPassiveSkills();
  // [B6 FIX] maxHp/maxMp가 ALL_STAT_KEYS에 없어 캐릭터 생성 시 항상
  // undefined로 남던 것을 실제 레벨/스탯 기반 공식으로 초기화.
  if(typeof getPlayerMaxHp==='function') S.stats.maxHp = getPlayerMaxHp();
  if(typeof getPlayerMaxMp==='function') S.stats.maxMp = getPlayerMaxMp();
  S.gold=loadGold(); S.inventory=loadInventory();
  // 장비 슬롯 12개 초기화 + 효과 재적용
  { const rawEq=loadEquipped();
    S.equipped=Object.fromEntries(EQUIP_SLOTS.map(s=>[s.id,rawEq[s.id]||null]));
    Object.values(S.equipped).filter(Boolean).forEach(eqIt=>{
      if(eqIt.effects) Object.entries(eqIt.effects).forEach(([k,v])=>{
        if(S.stats[k]!==undefined) S.stats[k]=Math.min(999,S.stats[k]+v);
      });
    }); applySetBonus(); }
  S.unlockedSkills=loadSkills(); S.skillSP=loadSkillSP();
  S.titles=loadTitles(); S.npcs=loadNPCs();
  S.highlights=loadHighlights(); S.atmosphere=loadAtmosphere();
  // [F-BUG 수정] 환생 직후에도 동일하게 칭호 보너스/스킬을 재적용한다.
  if(typeof restoreTitleBenefits==='function') restoreTitleBenefits();
  // [신규] 종족-직업 정체성 부조화 초기화 — 캐릭터의 종족과 직업이
  // 태생적으로 어긋나는 조합(예: 언데드+성직자)이면 시작부터 그 긴장을
  // 반영한다.
  if(typeof initRaceJobDissonance==='function') initRaceJobDissonance();
  S.messages=[]; S.choices=[]; S.msgCount=0;
  window.updateHeader(); updateCharHeader();
  showScreen('chat');
  mergeHiddenJobs(); // 히든 직업 병합
  renderSkillQuickSlot(); // 스킬 퀵슬롯 초기화

  // ══════════════════════════════════════════
  // 🌍 대륙 스타팅 시스템
  // ══════════════════════════════════════════
  (function applyContinentStartBonus(){
    const cid = char.startContinent || 'central';
    const cont = typeof FIVE_CONTINENTS !== 'undefined' ? FIVE_CONTINENTS[cid==='central'?'center':cid] : null;

    // ① 대륙별 스탯 보정
    const CONTINENT_STAT_BONUS = {
      central: { neg:5, spk:5, luk:3 },           // 외교·무역 중심 — 협상·운
      north:   { str:8, end:8, wil:5 },            // 혹한 생존 — 근력·체력·의지
      east:    { agi:7, mgc:5, per:5 },            // 무림·마법 고원 — 민첩·마법·지각
      west:    { int:7, rng:5, disg:5 },           // 증기 기술 — 지성·원거리·위장
      south:   { mgc:7, fath:5, luk:5 },           // 고대 마법 문명 — 마법·신앙·운
      northeast: { per:7, mgc:6, luk:5 },          // 엘프 고원 — 인지·마법·운
      southeast: { agi:8, disg:6, luk:6 },         // 해적 군도 — 민첩·위장·운
      northwest: { end:8, str:5, int:5 },           // 드워프 지하 — 체력·근력·지성
      celestial: { fath:10, wil:7, mgc:5 },        // 천계 — 신앙·의지·마법
      infernal:  { str:8, fear:8, mad:5 },          // 마계 — 근력·공포·광기
    };
    const bonus = CONTINENT_STAT_BONUS[cid] || {};
    Object.entries(bonus).forEach(([k,v])=>{
      if(S.stats[k] !== undefined) S.stats[k] = Math.min(999, (S.stats[k]||10) + v);
    });
    // 보정 내역 저장 (환경 UI용)
    S._continentStatBonus = bonus;
    if(typeof saveStats==='function') saveStats(S.stats);
  _markDirty('stats'); if(typeof saveStatsSplit==='function') saveStatsSplit();

    // ② 대륙 고유 시작 아이템
    const CONTINENT_START_ITEMS = {
      central: { id:'item_royal_seal',      icon:'📜', name:'왕국 통행증',       rarity:'uncommon', desc:'중앙 왕국이 발행한 공식 통행증. NPC 초기 호감도 +10, 관문 무통과.',  effects:{}, slot:'misc' },
      north:   { id:'item_frost_cloak',     icon:'🧥', name:'서리 망토',         rarity:'uncommon', desc:'북방산 두꺼운 모피 망토. 냉기 저항 보유. END +5.',                  effects:{end:5}, slot:'armor' },
      east:    { id:'item_jade_talisman',   icon:'🪬', name:'비취 부적',         rarity:'uncommon', desc:'동방 용화 제국의 수호 부적. MGC +5, 정신 상태이상 저항.',           effects:{mgc:5}, slot:'misc' },
      west:    { id:'item_steam_gear',      icon:'⚙️', name:'증기 기어 키트',    rarity:'uncommon', desc:'서대륙제 기계 공구 세트. 자물쇠·함정 해제 판정 +15.',             effects:{},  slot:'misc' },
      south:     { id:'item_sun_stone',         icon:'🌟', name:'태양석 원석',         rarity:'uncommon', desc:'남대륙 태양 신전의 성물. FATH +5, 빛 마법 계열 효과 강화.',           effects:{fath:5},  slot:'misc' },
      northeast: { id:'item_starleaf',          icon:'🍃', name:'별빛 잎사귀',          rarity:'uncommon', desc:'세계수에서 떨어진 잎. 별빛 마법 판정 +10, 야간 은신 보너스.',         effects:{mgc:5,per:5}, slot:'misc' },
      southeast: { id:'item_sea_serpent_scale', icon:'🐍', name:'해룡 비늘',            rarity:'uncommon', desc:'남동 군도 해룡에게서 채취한 비늘. 수중 이동 자유, 독 저항.',          effects:{agi:5},   slot:'misc' },
      northwest: { id:'item_runic_hammer',      icon:'⚒️', name:'룬 각인 망치',         rarity:'uncommon', desc:'드워프 장인이 만든 소형 망치. 기계·자물쇠 조작 +15, STR +5.',         effects:{str:5},   slot:'weapon' },
      celestial: { id:'item_celestial_shard',   icon:'✨', name:'천계 수정 파편',        rarity:'rare',     desc:'천계에서 떨어진 빛의 조각. FATH +10, 어둠·저주 완전 저항.',          effects:{fath:10}, slot:'misc' },
      infernal:  { id:'item_hellfire_coal',     icon:'🔥', name:'지옥 불씨',            rarity:'rare',     desc:'마계의 영원히 꺼지지 않는 불씨. STR +8, 화염 공격력 대폭 증가.',      effects:{str:8},   slot:'misc' },
    };
    const startItem = CONTINENT_START_ITEMS[cid];
    if(startItem){
      const alreadyHas = (S.inventory||[]).find(i=>i.id===startItem.id);
      if(!alreadyHas){
        S.inventory = S.inventory || [];
        S.inventory.push({...startItem, obtainedAt: S.msgCount, source:'continent_start'});
        saveInventory(S.inventory);
        // 장착 가능한 경우 장착 효과 반영
        if(startItem.effects) Object.entries(startItem.effects).forEach(([k,v])=>{
          if(S.stats[k] !== undefined) S.stats[k] = Math.min(999,(S.stats[k]||10)+v);
        });
      }
      setTimeout(()=>toast(`[${startItem.name}] 획득 — ${startItem.desc.slice(0,30)}...`, 3500, startItem), 1200);
    }

    // ③ 시작 대륙 NPC 2명 자동 등록
    if(cont && cont.kingdom && cont.kingdom.npcs){
      const existingNpcs = loadNPCs();
      const existingNames = new Set(existingNpcs.map(n=>n.name));
      const newNpcs = [...existingNpcs];
      cont.kingdom.npcs.forEach(kNpc => {
        if(!existingNames.has(kNpc.name)){
          newNpcs.push({
            name: kNpc.name,
            icon: kNpc.icon || '👤',
            role: kNpc.role,
            personality: '이 지역의 주요 인물. 처음 만남.',
            relationship: 40,
            type: 'major',
            active: true,
            metAtLoc: cont.kingdom.capital || cid,
            currentLoc: cont.kingdom.capital || cid,
            note: `${cont.kingdom.name}의 핵심 인물. ${kNpc.role}.`,
            continentOrigin: cid,
          });
        }
      });
      saveNPCs(newNpcs);
      S.npcs = newNpcs;
    }

    // ④ 대륙 초기 퀘스트 등록
    const CONTINENT_START_QUESTS = {
      central: { id:'cq_central_dispatch',  icon:'📋', title:'왕국의 첫 의뢰',      desc:'왕도 길드 게시판에 초보 모험가를 위한 의뢰가 붙어있다. 왕국의 첫 발을 내딛어라.',   reward:'골드 +80, 왕국 평판 +10', aiHint:'왕국 길드 의뢰로 자연스럽게 연결되는 복선을 심어라.' },
      north:   { id:'cq_north_threat',      icon:'❄️', title:'북방의 침입자',        desc:'혹한 속에서 야만족 정찰대가 국경을 넘었다는 소식이 들린다. 진실을 확인하라.',         reward:'골드 +100, 북방 평판 +15', aiHint:'북방 야만족의 위협과 혹한의 위험을 첫 장면에 자연스럽게 암시하라.' },
      east:    { id:'cq_east_tournament',   icon:'⚔️', title:'강호의 입문 시험',     desc:'동방 무림의 입문 시험이 열린다는 소문이 돌고 있다. 참가하면 이름을 알릴 수 있다.',   reward:'골드 +60, 무림 명성 +20', aiHint:'동방 무림의 분위기와 무인들의 시선을 첫 장면에 담아라.' },
      west:    { id:'cq_west_contract',     icon:'⚙️', title:'증기 도시의 의뢰',     desc:'증기 도시의 한 기술자가 행방불명된 부품을 찾아달라는 의뢰를 냈다.',                   reward:'골드 +90, 서대륙 평판 +10', aiHint:'증기 기계와 공장 소음이 가득한 서대륙 분위기를 첫 장면에 녹여라.' },
      south:     { id:'cq_south_ruins',       icon:'🌴', title:'잊혀진 유적의 부름',     desc:'밀림 깊은 곳에서 고대 유적의 빛이 목격됐다는 소문이 마을에 퍼지고 있다.',             reward:'골드 +70, 고대 지식 +1', aiHint:'신비로운 밀림과 고대 유적의 분위기를 첫 장면 배경에 자연스럽게 담아라.' },
      northeast: { id:'cq_northeast_prophecy', icon:'🌿', title:'세계수의 예언',           desc:'달빛 예언단이 당신을 지목했다는 전언이 전해졌다. 세계수 신전으로 향하라.',               reward:'골드 +60, 예언사 호감 +20', aiHint:'엘프 고원의 별빛과 고목 숲 분위기, 예언단의 신비로운 분위기를 첫 장면에 담아라.' },
      southeast: { id:'cq_southeast_treasure', icon:'🏴‍☠️', title:'군도의 숨겨진 보물',   desc:'술에 취한 해적이 잠꼬대로 읊은 좌표 하나. 그것이 전설의 보물지도 조각인지도 모른다.',   reward:'골드 +120, 해적 명성 +15', aiHint:'바다 냄새와 항구의 소란스러운 분위기, 해적들 사이의 긴장을 첫 장면에 녹여라.' },
      northwest: { id:'cq_northwest_deep',     icon:'⛏️', title:'지하 갱도의 이상 징후',   desc:'지하 갱도 최심층에서 이상한 소리가 들린다는 보고가 장인 조합에 접수됐다.',               reward:'골드 +90, 드워프 신뢰 +20', aiHint:'지하 도시의 용광로 소리와 장인들의 분위기, 깊은 지하의 불안함을 첫 장면에 담아라.' },
      celestial: { id:'cq_celestial_trial',    icon:'✨', title:'천계의 첫 시련',           desc:'대천사장 미카엘이 당신에게 첫 번째 시련을 하달했다. 천계의 이름에 걸맞은 행동을 보여라.', reward:'신앙 +20, 천계 명성 +30', aiHint:'황금빛 천상 도시의 성스러운 분위기와 천사들의 엄숙함을 첫 장면에 담아라.' },
      infernal:  { id:'cq_infernal_survive',   icon:'🔥', title:'마계의 생존자',             desc:'마계에 발을 들인 이상 강함을 증명해야 살아남는다. 마계 투기장에 참가해 이름을 알려라.', reward:'STR +5, 마계 명성 +25', aiHint:'마계의 용암 평원과 악마들의 시선, 생존 압박감을 첫 장면에 생생하게 담아라.' },
    };
    const startQuest = CONTINENT_START_QUESTS[cid];
    if(startQuest){
      try{
        const qs = loadMainQuestState() || {};
        if(!qs[startQuest.id]){
          qs[startQuest.id] = { status:'active', startedAt: new Date().toISOString(), turn: 0 };
          saveMainQuestState(qs);
        }
      }catch(e){}
      S._continentStartQuest = startQuest;
      setTimeout(()=>toast(`퀘스트 시작: [${startQuest.title}]`, 3000, startQuest), 2000);
    }

    // ⑤ 대륙 평판 초기화 (시작 대륙 +20, 적대 대륙 -10)
    try{
      const rep = loadContinentRep ? loadContinentRep() : {};
      if(!rep[cid]){ // 처음 시작일 때만
        rep[cid] = 20; // 본토 출신 보너스
        if(cont && cont.kingdom && cont.kingdom.relations){
          Object.entries(cont.kingdom.relations).forEach(([otherId, rel])=>{
            const mapped = otherId === 'center' ? 'central' : otherId;
            if(!rep[mapped]) rep[mapped] = 0;
            if(rel === '적대') rep[mapped] = Math.max(-100, (rep[mapped]||0) - 10);
            else if(rel === '동맹' || rel === '우호') rep[mapped] = Math.min(100, (rep[mapped]||0) + 5);
          });
        }
        if(typeof saveContinentRep === 'function') saveContinentRep(rep);
      }
    }catch(e){}

    // 스탯 보정 후 헤더 갱신
    window.updateHeader();

    if(bonus && Object.keys(bonus).length > 0){
      const bonusStr = Object.entries(bonus).map(([k,v])=>`${k.toUpperCase()}+${v}`).join(' ');
      setTimeout(()=>toast(`🌍 ${cont?.label||cid} 출신 보정: ${bonusStr}`, 3000), 800);
    }
  })();
  // ══════════════════════════════════════════
  if(typeof updateEmotionDisplay==='function') setTimeout(updateEmotionDisplay, 300);
  if(typeof updateQuestBadge==='function') setTimeout(updateQuestBadge, 400);
  setTimeout(()=>{ window.renderWeatherWidget(); window.syncAutoAtmosphere(); }, 500); // 날씨 위젯 + 자동 날씨 동기화
  setTimeout(()=>{ if(typeof renderTimeHeader==='function') renderTimeHeader(); }, 600); // ⏰ 시간 배지 초기화
  // [버그 수정] ai-prompt/172의 applyHeritageToNewLoop 적용(계승 보너스)이
  // "페이지 로드 5초 후" 한 번뿐인 setTimeout이었다 — 캐릭터 생성은 여러
  // 단계를 거쳐 보통 5초를 넘기므로 최초 플레이에서는 S.character가 아직
  // 없어 항상 조건을 놓쳤고, 환생 후 재시작(doReincarnate는 새로고침 없이
  // 화면만 전환)에는 그 타이머가 이미 소진돼 있어 두 번째 회차부터도 절대
  // 재실행되지 않았다 — 계승 보너스가 사실상 한 번도 적용될 수 없었다.
  // 실제 "새 회차가 시작되는" 시점인 여기(캐릭터 확정 직후, doStartChat
  // 호출 직전 — 계승 효과의 S._nextInjectedContext가 오프닝에 실리려면
  // doStartChat보다 먼저 실행돼야 한다)에 네이티브로 연결한다.
  if(typeof window.applyHeritageToNewLoop==='function'){
    try{
      const _heritageApplied = window.applyHeritageToNewLoop();
      if(_heritageApplied && (_heritageApplied.goldBonus>0 || (_heritageApplied.stats&&(_heritageApplied.stats.atk||_heritageApplied.stats.def||_heritageApplied.stats.hp)))){
        const _loop = typeof window.v36_getReincarnationCount==='function' ? window.v36_getReincarnationCount() : 0;
        if(_loop>0) setTimeout(()=>toast('🏛️ 계승 보너스 적용됨 — 전생의 기억이 이 몸에 남아있다', 4000), 700);
      }
    }catch(e){}
  }
  doStartChat();
  // [버그 수정] showLastSessionSummary("이전 세션 요약" 모달)가 완성돼
  // 있었지만 실제로 호출하는 곳이 어디에도 없어, saveSessionSummary가
  // 바로 위(startGame 진입 시점)에서 매번 정상적으로 로그를 쌓고 있음에도
  // 그 요약을 플레이어에게 보여줄 방법이 없었다. 오프닝 서사가 화면에
  // 뜬 직후(채팅 화면 전환 완료 후) 짧은 지연을 두고 표시한다 — 최초
  // 플레이(로그 없음)에서는 함수 내부에서 조용히 return한다.
  if(typeof window.showLastSessionSummary==='function') setTimeout(()=>window.showLastSessionSummary(), 1500);
  // [버그 수정] 개인 기억(PM) 초기화 동기화도 misc/278이 window.startGame을
  // 감싸던 방식이라(startGame()도 이 파일 안에서 setupNext()가 직접 호출해
  // 그 재할당이 도달 못 함 — 다른 죽은 훅들과 동일한 원인) 한 번도 실행되지
  // 않았다. 캐릭터 설정이 끝난 뒤 원래와 같은 지연(2초)으로 네이티브 연결.
  setTimeout(()=>{ if(typeof pmSyncPersonalFromGame==='function') pmSyncPersonalFromGame(); }, 2000);
  setTimeout(()=>typeof updateMenuVisibility==='function'&&updateMenuVisibility(), 800);
  // 속성 상성 스탯 보너스 자동 적용 (저장된 속성이 있으면)
  setTimeout(()=>{
    try{
      const _aff = loadAffinity();
      if(_aff.element && _aff.element !== 'none' && ELEMENT_DEFS[_aff.element]){
        const _def = ELEMENT_DEFS[_aff.element];
        Object.entries(_def.statBonus).forEach(([k,v])=>{
          if(S.stats[k] !== undefined) S.stats[k] = Math.min(999, (S.stats[k]||10) + v);
        });
        window.updateHeader();
      }
    }catch(e){}
  }, 600);
}
window.startGame = startGame;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_65(){
window.setupChar = window.setupChar;

window.setupStep = 0;
}

