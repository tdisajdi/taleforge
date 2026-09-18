// NPC 대화 퀘스트 시스템 (AI 생성)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { BULLETIN_INFO_POOL, BULLETIN_QUEST_POOL } from '../data/053-게시판-시스템.js';
import { WEATHER_EFFECTS } from '../data/032-NEW-날씨계절-판정-연동-시스템.js';
import { BLUEPRINT_SHOP } from '../data/075-파트2-C-크래프팅-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { callLocalModelJSON, tryCloudThenLocalModelThenBank } from './331-로컬-AI-모델-엔진.js';
import { BULLETIN_TRIGGER_PATTERNS, DEPARTURE_PATTERNS, GEMINI_FALLBACK_MODELS, LOC_TRIGGER_PATTERNS, NQD_BP_REWARD_POOL, PLAYER_TRAVEL_PATTERNS, TRAVEL_DISTANCE } from '../data/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { loadIntelLog, loadIntelMaterials, loadKnownDeals, loadKnownSongs, loadTaleLog, loadTaleMaterials } from '../economy/255-상인-거래소-교역-지부-확장.js';
import { loadDynBlueprints, loadDynEncounters, loadDynEnemies, loadDynMaterials, loadDynNpcs, loadInventory, loadLocationMonsterPools, loadRCPoints, loadRCUnlocked, rollEventReward, saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { updateNpcRelationship } from '../items/065-NPC퀘스트-완성도-강화.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadHighlights, loadMemory, loadTitles } from '../job/010-스킬-강화-시스템.js';
import { renderQuests } from '../job/087-전직-조건-저장로드-헬퍼-퀘스트아이템장소-등.js';
import { loadItemDissonance } from '../job/208-5-직업-시스템.js';
import { loadDynQuests, loadNPCs, loadQuests } from '../misc/001-block0-preamble.js';
import { addExp } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { isLocLoreUnlocked } from '../misc/016-2130번-시스템.js';
import { checkDangerLevelWarning, loadAcceptedBulletin } from '../misc/053-게시판-시스템.js';
import { loadLocations, loadReputation, saveLocations } from '../misc/054-이동수단-시스템.js';
import { loadBlueprints, unlockBlueprint } from '../misc/075-파트2-C-크래프팅-시스템.js';
import { loadDiary, saveDiaryEntry } from '../misc/076-파트2-D-일기기록-시스템.js';
import { loadResolvedHooks } from '../misc/217-14-메모리-자동-요약.js';
import { loadAlchemyExpedLog, loadAlchemyExpedMaterials, loadGraveyard, loadKnownFormulas, loadKnownRemedies, loadMiningLog, loadNetwork, loadRemedyLog, loadRemedyMaterials, loadWorkshop } from '../misc/253-SVG-타일-렌더링-작물-단계별-애니메이션.js';
import { loadDemonCorruption, loadDwarfGrudge, loadDwarfUnfinished, loadOrcBloodVow, loadOrcCouncil } from '../progression/020-101130번-환생-누적-시스템.js';
import { loadAchievements, unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { loadApiKeys, loadKeyIndex } from '../race/013-종족-시스템.js';
import { loadDemonContracts } from '../race/027-악마족-계약-장부-시스템-Demon-Contract-Ledger.js';
import { loadDemonTrueName } from '../race/028-악마족-진명-시스템-Demon-True-Name.js';
import { loadBeastLineage, loadBeastPackBond } from '../race/260-수인족-패널-렌더.js';
import { loadElfEmotion, loadElfForgetting } from '../ui/025-통합-패널-공허-확장-탭-시스템.js';
import { loadHumanLegacy, loadHumanStigma, loadNpcCorruption } from '../ui/026-renderHumanAwakeningPanel-완전-재정의.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation, renderLocationPanel, saveCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { enqueueAITask } from '../world/085-대륙-스타팅-시스템.js';
import { renderPoliticalMapPanel } from '../world/315-⑥-대륙-정치-지도.js';
import { loadHiddenQuests, loadScholarResearchLog } from './039-NEW-히든-퀘스트-시스템.js';
import { ME_MIN_SAMPLES, ME_POOL_MIN_SIZE, _meAffinityBand, _meCategoryKey, _meGoldBand, _meHasNegation, _meHpBand, _meIntent, _meTokenize, closeP, getWeatherForecast, pickGeneratedObject, recordGeneratedObject, recordMarkovSample, sendMsg, updateQuestBadge } from './086-퀘스트임무-수락-팝업-시스템.js';

export const NPC_DLG_QUEST_KEY = 'tf-npc-dlg-quests';

export function loadNpcDlgQuests(){ try{ return JSON.parse(lsGet(NPC_DLG_QUEST_KEY)||'[]'); }catch(e){ return []; } }
window.loadNpcDlgQuests = loadNpcDlgQuests;

export function saveNpcDlgQuests(q){ try{ lsSet(NPC_DLG_QUEST_KEY, JSON.stringify(q)); }catch(e){} }
window.saveNpcDlgQuests = saveNpcDlgQuests;

window._nqd = {
  npc: null,       // NPC 객체
  quest: null,     // AI가 제안한 퀘스트 데이터
  phase: 'idle',   // 'idle' | 'loading' | 'offered' | 'accepted' | 'declined'
};

export function _ensureNpcQuestDialog(){
  if(document.getElementById('npc-quest-dialog')) return;
  const el = document.createElement('div');
  el.id = 'npc-quest-dialog';
  el.innerHTML = `
    <div id="npc-quest-dlg-inner">
      <div class="nqd-hdr">
        <div class="nqd-avatar" id="nqd-avatar">👤</div>
        <div style="flex:1;min-width:0">
          <div class="nqd-npcname" id="nqd-npcname">NPC</div>
          <div class="nqd-npcrol" id="nqd-npcrol"></div>
        </div>
        <button class="nqd-btn-close" onclick="_closeNpcQuestDlg()" style="padding:5px 10px;font-size:9px">✕ 닫기</button>
      </div>
      <div class="nqd-chat scrollable" id="nqd-chat"></div>
      <div class="nqd-actions" id="nqd-actions"></div>
    </div>`;
  document.body.appendChild(el);
}
window._ensureNpcQuestDialog = _ensureNpcQuestDialog;

export function _closeNpcQuestDlg(){
  const dlg = document.getElementById('npc-quest-dialog');
  if(dlg) dlg.classList.remove('open');
  window._nqd = { npc:null, quest:null, phase:'idle' };
}
window._closeNpcQuestDlg = _closeNpcQuestDlg;

export function _nqdAddMsg(text, who='npc'){
  const chat = document.getElementById('nqd-chat');
  if(!chat) return;
  const div = document.createElement('div');
  div.className = who==='npc' ? 'nqd-bubble-npc' : 'nqd-bubble-player';
  div.innerHTML = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
window._nqdAddMsg = _nqdAddMsg;

export function _nqdSetActions(html){
  const el = document.getElementById('nqd-actions');
  if(el) el.innerHTML = html;
}
window._nqdSetActions = _nqdSetActions;

export function _nqdSetLoading(show){
  const chat = document.getElementById('nqd-chat');
  if(!chat) return;
  const existing = document.getElementById('nqd-thinking');
  if(show && !existing){
    const div = document.createElement('div');
    div.id = 'nqd-thinking';
    div.className = 'nqd-thinking';
    div.innerHTML = `<span class="dot-anim"></span><span class="dot-anim"></span><span class="dot-anim"></span>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  } else if(!show && existing){
    existing.remove();
  }
}
window._nqdSetLoading = _nqdSetLoading;

export function _pickBlueprintReward(difficulty){
  const tierMap = { easy:'common', normal:'uncommon', hard:'rare', legendary:'epic' };
  const tier = tierMap[difficulty] || 'common';
  const pool = NQD_BP_REWARD_POOL[tier] || NQD_BP_REWARD_POOL.common;
  // 이미 갖고 있는 것 제외
  const have = loadBlueprints()||[];
  const avail = pool.filter(id=>!have.includes(id));
  if(!avail.length) return pool[Math.floor(Math.random()*pool.length)]; // 다 가졌으면 중복 허용
  return avail[Math.floor(Math.random()*avail.length)];
}
window._pickBlueprintReward = _pickBlueprintReward;

export async function openNpcQuestDialog(npcName){
  _ensureNpcQuestDialog();
  const npcs = loadNPCs()||[];
  const npc = npcs.find(n=>n.name===npcName);
  if(!npc){ toast('NPC를 찾을 수 없습니다'); return; }

  // 패널 닫기
  closeP('npcs');

  window._nqd = { npc, quest:null, phase:'loading' };

  // UI 초기화
  document.getElementById('nqd-avatar').textContent = npc.icon||'👤';
  document.getElementById('nqd-npcname').textContent = npc.name;
  document.getElementById('nqd-npcrol').textContent = npc.role||'';
  document.getElementById('nqd-chat').innerHTML = '';
  _nqdSetActions(`<span style="font-size:10px;color:var(--dim);padding:6px">잠시만 기다려주세요...</span>`);

  const dlg = document.getElementById('npc-quest-dialog');
  dlg.classList.add('open');

  // [B57 FIX] S.stats.level은 정식 필드가 아니라 항상 undefined라 AI
  // 퀘스트 생성 시 항상 Lv.1로 전달되던 버그.
  const level = (typeof loadPlayerLevel==='function' ? loadPlayerLevel() : 1);
  const bpRewardId = _pickBlueprintReward('normal');
  const bpRewardDef = (typeof BLUEPRINT_SHOP!=='undefined') ? BLUEPRINT_SHOP[bpRewardId] : null;
  const bpRewardName = bpRewardDef ? bpRewardDef.name : '설계도';

  // [복원] AI 우선 — 키가 있으면 NPC 성격/관계/최근 상황을 반영한 진짜
  // 인사말·퀘스트를 시도하고, 없거나 실패하면 로컬 조합으로 폴백.
  const char  = S?.character||{};
  const rel   = npc.relationship||50;
  const relLabel = rel>=80?'매우 친밀한':rel>=60?'우호적인':rel>=40?'보통의':rel>=20?'서먹한':'적대적인';
  const recentScene = (S?.messages||[]).slice(-3).map(m=>m.content||'').join(' ').slice(0,300);
  const existTitles = loadNpcDlgQuests().filter(q=>q.npcName===npc.name).map(q=>q.title).join(', ');
  const prompt = `당신은 TaleForge RPG에 등장하는 NPC "${npc.name}"(${npc.role||'인물'})입니다.
플레이어 "${char.name||'주인공'}"(${char.race||'인간'} ${char.job||'모험가'}, Lv.${level})와의 관계: ${relLabel}(${rel}점).
최근 상황: ${recentScene||'평범한 하루'}
이미 의뢰한 퀘스트(중복 금지): ${existTitles||'없음'}

당신은 플레이어에게 새로운 퀘스트(의뢰)를 제안하려 합니다.
1. 먼저 NPC 캐릭터답게 자연스럽게 말을 걸어 플레이어를 불러세우는 말 1~2문장 (greeting 필드)
2. 퀘스트 내용을 제안하는 말 2~3문장 (offer 필드) — NPC 말투로, 구체적인 보상(골드, 설계도 "${bpRewardName}" 등)을 언급
3. 퀘스트 데이터 (quest 필드)

반드시 아래 JSON만 출력. 다른 텍스트 절대 금지.

{
  "greeting": "NPC가 플레이어를 부르는 말",
  "offer": "퀘스트 제안 대사 (NPC 말투, 보상 언급 포함)",
  "quest": {
    "title": "의뢰 제목 (15자 이내)",
    "icon": "이모지 1개",
    "desc": "퀘스트 설명 (40~80자, 구체적 목표)",
    "type": "combat|explore|dialog|fetch|protect|mystery|escort|craft",
    "difficulty": "easy|normal|hard|legendary",
    "reward": {
      "gold": 숫자,
      "exp": 숫자,
      "blueprint": "${bpRewardId}",
      "blueprintName": "${bpRewardName}",
      "item": null
    },
    "completeKeywords": ["완료 키워드1","키워드2","키워드3"],
    "failKeywords": ["실패 키워드1","키워드2"],
    "lore": "배경 설명 한 줄",
    "aiHint": "AI 연출 힌트 (40자)"
  }
}`;

  _nqdSetLoading(true);

  // [패턴 학습] 진짜 AI가 쓴 인사말/제안/퀘스트 설명만 코퍼스에 누적.
  const _recordNqdSample = (r)=>{
    if(!r) return;
    if(r.greeting) recordMarkovSample('npc_greeting', r.greeting);
    if(r.offer) recordMarkovSample('npc_quest_offer', r.offer);
    if(r.quest?.desc) recordMarkovSample('quest_desc', r.quest.desc);
  };

  try{
    const result = await tryCloudThenLocalModelThenBank(
      async () => { const r = await callGeminiDirect(prompt); _recordNqdSample(r); return r; },
      async () => { const r = await callLocalModelJSON(prompt, { maxTokens: 350 }); _recordNqdSample(r); return r; },
      () => composeLocalNpcQuestOffer(npc, level, bpRewardId, bpRewardName),
      'NPC 퀘스트 제안'
    );
    if(!result) throw new Error('생성 실패');

    _nqdSetLoading(false);

    // NPC 인사말
    _nqdAddMsg(`"${result.greeting||'어이, 잠깐!'}"`, 'npc');

    // 잠깐 딜레이 후 제안
    await new Promise(r=>setTimeout(r,700));
    _nqdAddMsg(`"${result.offer||'당신에게 부탁이 있소.'}"`, 'npc');

    // 퀘스트 카드 표시
    const q = result.quest;
    const r = q.reward||{};
    const rewardText = [
      r.gold ? `💰 골드 ${r.gold}` : '',
      r.exp  ? `✨ 경험치 ${r.exp}` : '',
      r.blueprintName ? `📜 ${r.blueprintName}` : '',
      r.item ? `🎁 ${r.item}` : '',
    ].filter(Boolean).join(' · ');

    await new Promise(res2=>setTimeout(res2,400));
    const questHtml = `<div class="nqd-quest-card">
      <div class="nqd-qtitle">${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:16}):(q.icon||"📋")} ${q.title||'의뢰'}</div>
      <div class="nqd-qdesc">${q.desc||''}</div>
      <div class="nqd-qreward">보상: ${rewardText||'미정'}</div>
    </div>`;
    _nqdAddMsg(questHtml, 'npc');

    window._nqd.quest = q;
    window._nqd.phase = 'offered';

    // 수락/거절 버튼
    _nqdSetActions(`
      <button class="nqd-btn-accept" onclick="_nqdAccept()">✦ 수락하겠습니다</button>
      <button class="nqd-btn-decline" onclick="_nqdDecline()">✕ 거절합니다</button>
      <button class="nqd-btn-close" onclick="_closeNpcQuestDlg()">닫기</button>
    `);

  }catch(err){
    _nqdSetLoading(false);
    _nqdAddMsg(`"죄송합니다, 지금은 말하기 어렵군요..."`, 'npc');
    _nqdSetActions(`<button class="nqd-btn-close" onclick="_closeNpcQuestDlg()">닫기</button>`);
    if(typeof toast==='function') toast('⚠️ NPC 대화 생성 실패: '+err.message, 2500);
  }
}
window.openNpcQuestDialog = openNpcQuestDialog;

export function _nqdDecline(){
  if(window._nqd.phase !== 'offered') return;
  window._nqd.phase = 'declined';

  _nqdAddMsg('죄송합니다, 지금은 맡기 어렵습니다.', 'player');
  setTimeout(()=>{
    const npc = window._nqd.npc;
    _nqdAddMsg(`"...그렇군요. 언제든 마음이 바뀌면 찾아오시오."`, 'npc');
    if(typeof updateNpcRelationship==='function') updateNpcRelationship(npc.name, -3, '의뢰 거절');
  }, 500);

  setTimeout(()=>{
    _nqdSetActions(`<button class="nqd-btn-close" style="flex:1;padding:10px" onclick="_closeNpcQuestDlg()">대화 종료</button>`);
  }, 1300);
}
window._nqdDecline = _nqdDecline;

export function checkNpcDlgQuestCompletion(aiText){
  if(!aiText) return;
  const quests = loadNpcDlgQuests();
  const active = quests.filter(q=>q.status==='active');
  if(!active.length) return;

  const lc = aiText.toLowerCase();
  const GLOBAL_FAIL = ['실패','포기','취소','죽었','사라졌','불가능','거절'];
  let changed = false;

  active.forEach(q=>{
    if(q._rewardGiven) return; // 중복 완료 방지
    const ckw = (q.completeKeywords||[]).map(k=>k.toLowerCase());
    const fkw = (q.failKeywords||[]).map(k=>k.toLowerCase());
    const npcMentioned = lc.includes((q.npcName||'').toLowerCase());
    // completeKeywords 없으면 제목 단어 + 완료 키워드 조합으로 fallback
    const titleWords = (q.title||'').toLowerCase().split(/\s+/).filter(w=>w.length>=1);
    const hasComplete = ckw.length > 0
      ? ckw.some(k=>lc.includes(k))
      : titleWords.some(w=>lc.includes(w)) && ['완료','성공','해냈','처치','퇴치','해결','전달했','끝냈','마쳤'].some(k=>lc.includes(k));
    const hasFail = fkw.some(k=>lc.includes(k)) || (npcMentioned && GLOBAL_FAIL.some(k=>lc.includes(k)));

    if(hasComplete && !hasFail){
      q.status = 'completed';
      q.completedAt = new Date().toISOString();
      q._rewardGiven = true;
      changed = true;

      // 보상 지급
      const r = q.reward||{};
      if(r.gold){ S.gold=(S.gold||0)+r.gold; if(typeof saveGold==='function') saveGold(S.gold); toast(`💰 의뢰 완료: 골드 +${r.gold}`, 2500); }
      if(r.exp){ if(typeof addExp==='function') addExp(r.exp); toast(`✨ 의뢰 완료: exp +${r.exp}`, 2000); }

      // 설계도 보상
      if(r.blueprint && typeof unlockBlueprint==='function'){
        const bpDef = (typeof BLUEPRINT_SHOP!=='undefined') ? BLUEPRINT_SHOP[r.blueprint] : null;
        if(unlockBlueprint(r.blueprint)){
          toastHTML(`📜 설계도 획득! ${esc(bpDef?.icon||'📜')} ${esc(r.blueprintName||bpDef?.name||r.blueprint)}`, 4000);
        }
      }
      // 아이템 보상
      if(r.item && typeof rollEventReward==='function'){
        const item = rollEventReward('npcQuest');
        if(item){ S.inventory=S.inventory||[]; S.inventory.push(item); if(typeof saveInventory==='function') saveInventory(S.inventory); toastHTML(`🎁 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon)} ${esc(item.name)} 획득!`, 2500); }
      }

      // NPC 관계 상승
      if(typeof updateNpcRelationship==='function') updateNpcRelationship(q.npcName, 20, '의뢰 완료');
      if(typeof window.updateHeader==='function') window.updateHeader();
      toastHTML(`🏆 [${esc(q.npcIcon)}${esc(q.npcName)}] 의뢰 완료: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:14}):(q.icon)} ${esc(q.title)}`, 3500);
      if(typeof unlockAchievement==='function') unlockAchievement('npc_quest_done');
      if(typeof saveDiaryEntry==='function') saveDiaryEntry('quest', `✅ NPC 의뢰 완료: ${q.title} (${q.npcName})`, S.msgCount||0);

    } else if(hasFail){
      q.status = 'failed';
      q.failedAt = new Date().toISOString();
      changed = true;
      if(typeof updateNpcRelationship==='function') updateNpcRelationship(q.npcName, -10, '의뢰 실패');
      toast(`❌ [${q.npcIcon}${q.npcName}] 의뢰 실패: ${q.title}`, 2500);
    }
  });

  if(changed){
    saveNpcDlgQuests(quests);
    if(typeof updateQuestBadge==='function') updateQuestBadge();
  }
}
window.checkNpcDlgQuestCompletion = checkNpcDlgQuestCompletion;

window.completeNpcDlgQuest = function(id){
  const quests = loadNpcDlgQuests();
  const q = quests.find(x=>x.id===id);
  if(!q) return;
  q.status='completed'; q.completedAt=new Date().toISOString();
  const r=q.reward||{};
  if(r.gold){ S.gold=(S.gold||0)+r.gold; if(typeof saveGold==='function') saveGold(S.gold); }
  if(r.exp){ if(typeof addExp==='function') addExp(r.exp); }
  if(r.blueprint && typeof unlockBlueprint==='function'){
    const bpDef=(typeof BLUEPRINT_SHOP!=='undefined')?BLUEPRINT_SHOP[r.blueprint]:null;
    if(unlockBlueprint(r.blueprint)) toast(`📜 설계도 획득! ${r.blueprintName||bpDef?.name||r.blueprint}`, 3500);
  }
  saveNpcDlgQuests(quests);
  toast(`🏆 [${q.npcIcon}${q.npcName}] 의뢰 완료 처리됨`, 2500);
  renderQuests();
};

window.failNpcDlgQuest = function(id){
  const quests = loadNpcDlgQuests();
  const q = quests.find(x=>x.id===id);
  if(!q) return;
  q.status='failed'; q.failedAt=new Date().toISOString();
  saveNpcDlgQuests(quests);
  toast(`❌ 의뢰 실패 처리됨`, 2000);
  renderQuests();
};

window.deleteNpcDlgQuest = function(id){
  if(!confirm('이 의뢰를 삭제할까요?')) return;
  saveNpcDlgQuests(loadNpcDlgQuests().filter(q=>q.id!==id));
  toast('🗑 의뢰 삭제됨', 1500);
  renderQuests();
};

window.openNpcQuestDialog = openNpcQuestDialog;

window._closeNpcQuestDlg  = _closeNpcQuestDlg;

window._nqdDecline        = _nqdDecline;

window.checkNpcDlgQuestCompletion = checkNpcDlgQuestCompletion;

export const AI_LOC_KEY        = 'tf-ai-locations';

export const AI_BULLETIN_KEY   = 'tf-ai-bulletin';

export const AI_LOC_GEN_LOG    = 'tf-ai-locgen-log';

export const AI_LOC_EXPORT_KEY = 'tf-ai-export-snapshot';

export function loadAILocations(){ try{ return JSON.parse(lsGet(AI_LOC_KEY)||'[]'); }catch(e){ return []; } }
window.loadAILocations = loadAILocations;

export function saveAILocations(d){ try{ lsSet(AI_LOC_KEY, JSON.stringify(d)); }catch(e){} }
window.saveAILocations = saveAILocations;

export function loadAIBulletin(){ try{ return JSON.parse(lsGet(AI_BULLETIN_KEY)||'[]'); }catch(e){ return []; } }
window.loadAIBulletin = loadAIBulletin;

export function saveAIBulletin(d){ try{ lsSet(AI_BULLETIN_KEY, JSON.stringify(d)); }catch(e){} }
window.saveAIBulletin = saveAIBulletin;

export function loadAIGenLog(){ try{ return JSON.parse(lsGet(AI_LOC_GEN_LOG)||'[]'); }catch(e){ return []; } }
window.loadAIGenLog = loadAIGenLog;

export function saveAIGenLog(d){ try{ lsSet(AI_LOC_GEN_LOG, JSON.stringify(d)); }catch(e){} }
window.saveAIGenLog = saveAIGenLog;

export function isLocationAlreadyKnown(name){
  const allLocs = window.getAllLocations();
  const aiLocs  = loadAILocations();
  const normalize = s => s.replace(/\s/g,'').toLowerCase();
  const n = normalize(name);
  return allLocs.some(l=>normalize(l.name)===n) || aiLocs.some(l=>normalize(l.name)===n);
}
window.isLocationAlreadyKnown = isLocationAlreadyKnown;

// ══════════════════════════════════════════════════════════════════
// [로컬 장소/게시판/NPC퀘스트 생성 엔진] — 이 파일에 남아있던 마지막
// 3개의 실제 AI 호출(NPC 대화 퀘스트 제안, 장소 생성, 게시판 아이템
// 생성)을 로컬 조합으로 대체한다. 지금까지의 17개 시스템과 같은 원칙:
// AI가 반환하던 것과 같은 데이터 모양을 그대로 반환해 다운스트림
// 코드는 손대지 않는다.
const LOC_GEN_NAME_PREFIX = ['잊혀진','안개 낀','붉은','서리 내린','고요한','그림자 진','낡은','바람 부는','달빛 어린','메마른','이끼 낀','폐허가 된'];
const LOC_GEN_NAME_CORE = {
  dungeon: ['유적','폐허','지하 묘지','고대 신전','버려진 광산','저주받은 성채'],
  wilderness: ['숲','황무지','협곡','늪지','고원','동굴 지대'],
  shrine: ['성소','제단','신단','기도처'],
  event: ['야영지','임시 주둔지','버려진 진지'],
  special: ['균열','비경','봉인된 자리'],
  village: ['마을','촌락'],
  town: ['소읍','장터거리'],
  city: ['거리'],
  capital: ['왕성 외곽'],
  hamlet: ['작은 정착지'],
  port: ['포구'],
};
const LOC_GEN_ICON = { dungeon:'🏰', wilderness:'🌲', shrine:'⛩️', event:'🏕️', special:'🌀', village:'🏘️', town:'🏘️', city:'🏙️', capital:'👑', hamlet:'🛖', port:'⚓' };
const LOC_GEN_DESC_BANK = {
  dungeon: ['오랜 세월 방치된 흔적이 곳곳에 남아있다. 안쪽에서 서늘한 공기가 흘러나온다.', '무너진 돌더미와 깨진 조각상들이 한때의 규모를 짐작케 한다.'],
  wilderness: ['사람의 발길이 뜸한 듯, 자연 그대로의 거친 풍경이 펼쳐진다.', '바람과 풀냄새가 뒤섞여 낯선 정취를 자아낸다.'],
  shrine: ['공기가 유독 조용하고 무겁다. 오래된 신앙의 흔적이 느껴진다.', '누군가 여전히 이곳을 찾아와 기도를 올리는 듯하다.'],
  event: ['최근까지 누군가 머물렀던 흔적이 남아있다.', '급하게 자리를 뜬 듯 어수선한 잔해가 흩어져 있다.'],
  special: ['이 근방과는 확연히 다른 기운이 감돈다.', '설명하기 어려운 이질감이 감도는 곳이다.'],
  village: ['소박하지만 사람 사는 온기가 느껴지는 곳이다.', '작은 집들이 옹기종기 모여 있다.'],
  town: ['오가는 사람들로 제법 활기가 있다.', '장터의 소음과 냄새가 뒤섞여 있다.'],
  city: ['크고 복잡한 거리에 인파가 끊이지 않는다.', '높은 건물들 사이로 다양한 사람들이 오간다.'],
  capital: ['위엄 있는 건축물들이 늘어서 있다.', '왕국의 중심다운 위압감이 느껴진다.'],
  hamlet: ['작고 조용한 정착지다.', '몇 안 되는 집들이 서로 의지하듯 모여 있다.'],
  port: ['짠내 나는 바닷바람과 함께 배들이 드나든다.', '선원과 상인들의 소리로 북적인다.'],
};
const LOC_GEN_LORE_BANK = {
  dungeon: '한때 번성했으나 알 수 없는 이유로 버려졌다는 이야기가 전해진다.',
  wilderness: '오래전부터 이 일대의 사냥꾼과 채집꾼들이 드나들던 곳이다.',
  shrine: '이 땅의 오래된 신앙과 관련이 있다고 전해진다.',
  event: '최근 이 근방에서 일어난 소동의 흔적으로 추정된다.',
  special: '학자들 사이에서도 정체가 분분한 장소다.',
  village: '조상 대대로 이 자리를 지켜온 이들이 산다.',
  town: '교역로가 이어지며 자연스레 커진 마을이다.',
  city: '오랜 역사를 가진 지역 중심지다.',
  capital: '왕국의 역사와 함께해온 상징적인 장소다.',
  hamlet: '외지고 조용해 방문객이 드물다.',
  port: '바닷길을 오가는 이들의 중요한 거점이다.',
};
const LOC_GEN_INTERACTION_BANK = [
  { name:'주변 살피기', icon:'👁️', desc:'이 장소를 자세히 둘러본다.', action:'explore' },
  { name:'사람들과 대화', icon:'💬', desc:'근처 사람들에게서 소문을 듣는다.', action:'talk' },
  { name:'휴식 취하기', icon:'🛌', desc:'잠시 이곳에서 몸을 쉰다.', action:'rest' },
  { name:'흔적 조사하기', icon:'🔍', desc:'이곳에 남은 흔적을 조사한다.', action:'investigate' },
];
const LOC_GEN_INFO_BANK = [
  { tier:'useful', icon:'📜', title:'현지 정보', content:'이곳에 대해 알아두면 도움이 될 만한 이야기가 떠돈다.' },
  { tier:'useful', icon:'🗣️', title:'떠도는 소문', content:'최근 이 근방에서 심상찮은 소문이 돌고 있다.' },
  { tier:'special', icon:'✨', title:'숨겨진 이야기', content:'이곳에는 겉보기와 다른 사연이 숨어 있는 듯하다.' },
];
function _locGenClassify(trigger, context){
  const t = ((trigger||'')+' '+(context||'')).toLowerCase();
  if(/재료|채집|제작|craft|material/.test(t)) return ['wilderness'];
  if(/몬스터|서식|출몰|조우/.test(t)) return ['dungeon','wilderness'];
  if(/퀘스트|의뢰|목적지/.test(t)) return ['dungeon','town'];
  if(/npc|대화/.test(t)) return ['village','town'];
  return ['village','wilderness','shrine','event'];
}
export function composeLocalLocation(trigger, context){
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const candidates = _locGenClassify(trigger, context);
  const type = pick(candidates);
  const core = pick(LOC_GEN_NAME_CORE[type] || LOC_GEN_NAME_CORE.village);
  const name = pick(LOC_GEN_NAME_PREFIX)+' '+core;
  const dangerBase = ['dungeon','wilderness','special'].includes(type) ? 3 : ['event'].includes(type) ? 2 : 1;
  const dangerLevel = Math.min(6, dangerBase + Math.floor(Math.random()*2));
  // [버그 수정] 클라우드 프롬프트는 "현재 위치"를 명시적으로 넣어 그
  // 근방에 있을 법한 장소를 만들게 하는데, 로컬 폴백은 8개 대륙 중
  // 완전히 무작위로 배정하고 있었다 — 지금 서대륙에 있는데 새로 발견한
  // 장소가 북동 대륙으로 찍히는 식의 지리적 모순이 났다(전수조사로
  // 발견). 현재 위치의 대륙 → 없으면 캐릭터가 고른 시작 대륙 순으로
  // 우선하고, 그마저 없을 때만 무작위로 폴백한다.
  const continents = ['central','north','east','west','south','northeast','southeast','northwest'];
  const _curLocForGen = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  const sameContinent = _curLocForGen?.continent || S.character?.startContinent || continents[Math.floor(Math.random()*continents.length)];
  const scenario = S.scenario?.name || '중세 판타지';
  const shopItems = [];
  if(typeof window.generateLocalItem==='function'){
    const slotPool = ['weapon','armor','accessory','consume'];
    for(let i=0;i<3;i++){
      try{ shopItems.push(window.generateLocalItem({job:S.character?.role,race:S.character?.race,era:scenario}, pick(slotPool), 'common')); }catch(e){}
    }
  }
  const quest = (typeof window.composeLocalQuest==='function')
    ? window.composeLocalQuest('B','misc',{goldMin:30,goldMax:120,expMin:50,expMax:150},'normal')
    : null;
  return {
    id: 'ai_loc_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
    name, icon: LOC_GEN_ICON[type]||'🗺️', continent: sameContinent, type,
    desc: pick(LOC_GEN_DESC_BANK[type]||LOC_GEN_DESC_BANK.village),
    triggerKeywords: [core, type, '탐험', '발견'],
    dangerLevel, priceModifier: +(0.8+Math.random()*1.7).toFixed(2),
    atmosphere: pick(LOC_GEN_DESC_BANK[type]||LOC_GEN_DESC_BANK.village),
    lore: LOC_GEN_LORE_BANK[type]||LOC_GEN_LORE_BANK.village,
    shops: shopItems.length ? [{ name:name+'의 상점', items:shopItems }] : [],
    interactions: [pick(LOC_GEN_INTERACTION_BANK), pick(LOC_GEN_INTERACTION_BANK)]
      .filter((v,i,a)=>a.indexOf(v)===i)
      .map(t=>({ id:'int_'+Math.random().toString(36).slice(2,8), ...t })),
    quests: quest ? [{ tier:'common', icon:quest.icon, title:quest.title, desc:quest.desc, rewardMin:quest.reward.gold, rewardMax:quest.reward.gold+40, rewardExtra:'' }] : [],
    infos: [pick(LOC_GEN_INFO_BANK)],
    aiGenerated: true,
    generatedAt: new Date().toISOString(),
    generationTrigger: String(trigger||'').slice(0,60),
    scenario,
  };
}
window.composeLocalLocation = composeLocalLocation;

// [버그 수정] 클라우드 프롬프트는 게시판이 있는 장소의 이름·유형을
// 명시적으로 넣어 그 장소다운 의뢰를 만들게 하는데, 로컬 폴백은
// contextType을 항상 'misc'로 고정해 던전 게시판이든 마을 게시판이든
// 똑같은 무작위 유형의 퀘스트가 나왔다(전수조사로 발견). 장소 유형에
// 맞는 퀘스트 성격으로 최소한의 연결을 만든다.
const LOC_TYPE_TO_QUEST_CTX = {
  dungeon:'combat', wilderness:'combat', special:'mystery', shrine:'mystery',
  event:'mystery', jail:'escape',
};
export function composeLocalBulletinItems(loc, trigger, context){
  const ctxType = LOC_TYPE_TO_QUEST_CTX[loc?.type] || 'misc';
  const quest = (typeof window.composeLocalQuest==='function')
    ? window.composeLocalQuest('B', ctxType, {goldMin:60,goldMax:250,expMin:80,expMax:260},'normal')
    : null;
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  return {
    quests: quest ? [{ tier:'uncommon', icon:quest.icon, title:quest.title, desc:quest.desc, rewardMin:quest.reward.gold, rewardMax:quest.reward.gold+80, rewardExtra:'', tags:[loc?.type||'general'] }] : [],
    infos: [pick(LOC_GEN_INFO_BANK)],
    aiGenerated: true,
    generatedAt: new Date().toISOString(),
    locationId: loc?.id||'', locationName: loc?.name||'',
    scenario: S.scenario?.name || '중세 판타지',
  };
}
window.composeLocalBulletinItems = composeLocalBulletinItems;

// [수정] 예전엔 호감도(관계도)와 무관하게 인사말·제안 대사가 완전히
// 고정된 4개짜리 뱅크에서만 뽑혔다 — 클라우드 프롬프트는 관계도를
// intimate~hostile 5단계(relLabel)로 계산해 넘기는데, 로컬 폴백은
// 그 값을 아예 안 봐서 극혐하는 NPC와 절친한 NPC가 완전히 똑같은
// 말투로 말을 걸었다(전수조사로 발견). 클라우드 쪽의 relLabel 산정
// 기준(rel>=80/60/40/20)과 동일한 5단계로 뱅크를 나눈다.
const NPC_QUEST_GREETING_BANK = {
  intimate: ['오, 자네였군! 마침 잘 됐네, 부탁할 게 하나 있는데.', '이게 누군가, 반갑구먼. 자네한테만 털어놓을 얘기가 있어.'],
  friendly: ['어이, 잠깐 시간 좀 내주겠소?', '마침 잘 왔소. 부탁할 게 하나 있는데.'],
  neutral:  ['저... 잠깐 괜찮으시다면 드릴 말씀이.', '실례지만, 부탁 하나 드려도 될까요.'],
  distant:  ['...당신이라면 어쩔 수 없이 부탁해야겠군.', '탐탁지는 않지만, 달리 부탁할 사람이 없어서.'],
  hostile:  ['흥, 당신 도움을 받고 싶진 않았는데.', '이런 부탁까지 하게 될 줄은 몰랐군, 솔직히.'],
};
const NPC_QUEST_OFFER_BANK = {
  intimate: ['자네니까 믿고 맡기는 걸세. 보상은 섭섭지 않게 두둑이 챙겨주지.', '이런 부탁 자네 말고 누구한테 하겠나. 사례는 확실히 하겠네.'],
  friendly: ['실은 도움이 필요한 일이 하나 있소. 보상은 섭섭지 않게 챙겨주겠소.', '이 일을 해결해주면 정말 큰 도움이 될 걸세. 대가는 확실히 치르겠네.'],
  neutral:  ['도와주신다면 정해진 대로 사례는 하겠습니다.', '부담 없이 들어주시면 감사하겠습니다. 보상은 준비해뒀습니다.'],
  distant:  ['제값은 쳐주겠지만, 그 이상은 기대 말게.', '어차피 거래니 손해는 안 보게 해주겠소.'],
  hostile:  ['어쩔 수 없이 부탁하는 거요. 보상은 약속대로 주겠소.', '이거 하나만 해결해주면 더 볼 일 없을 거요.'],
};
function _npcRelTier(rel){
  return rel>=80?'intimate' : rel>=60?'friendly' : rel>=40?'neutral' : rel>=20?'distant' : 'hostile';
}
export function composeLocalNpcQuestOffer(npc, level, bpRewardId, bpRewardName){
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const tier = _npcRelTier(npc?.relationship||50);
  const rewardRange = {goldMin:30+level*2, goldMax:100+level*4, expMin:40+level*2, expMax:120+level*4};
  const quest = (typeof window.composeLocalQuest==='function')
    ? window.composeLocalQuest('B','npc_trigger', rewardRange, 'normal')
    : { title:'작은 부탁', icon:'📋', desc:'도움이 필요한 일이 있다.', type:'fetch', difficulty:'normal',
        reward:{gold:50,exp:60,item:null}, completeKeywords:['완료','해결'], failKeywords:['실패','포기'], lore:'', aiHint:'' };
  quest.reward = { ...quest.reward, blueprint: bpRewardId, blueprintName: bpRewardName };
  return { greeting: pick(NPC_QUEST_GREETING_BANK[tier]), offer: pick(NPC_QUEST_OFFER_BANK[tier]), quest };
}
window.composeLocalNpcQuestOffer = composeLocalNpcQuestOffer;
// ══════════════════════════════════════════════════════════════════

export function buildLocationGenPrompt(trigger, context){
  const scenario = S.scenario?.name || '중세 판타지';
  const char     = S.character?.name || '모험가';
  const charRole = S.character?.role || '';
  const curLoc   = window.currentLocation?.name || '알 수 없는 장소';
  const existingNames = [...window.getAllLocations(), ...loadAILocations()].map(l=>l.name).join(', ');

  // 인벤토리·제작 맥락 추출
  let craftCtx = '';
  try{
    const inv = typeof loadInventory==='function' ? loadInventory() : [];
    const craftItems = inv.filter(i=>i.type==='material'||i.type==='ingredient').map(i=>i.name).slice(0,5);
    if(craftItems.length) craftCtx = `\n[보유 재료] ${craftItems.join(', ')}`;
  }catch(e){}

  // 현재 퀘스트 맥락
  let questCtx = '';
  try{
    const quests = typeof loadQuests==='function' ? loadQuests().filter(q=>q.status==='active').map(q=>q.title).slice(0,3) : [];
    if(quests.length) questCtx = `\n[진행 중인 퀘스트] ${quests.join(', ')}`;
  }catch(e){}

  // 최근 발견 몬스터 맥락
  let monsterCtx = '';
  try{
    const monsters = typeof loadMonsters==='function' ? loadMonsters().slice(-3).map(m=>m.name) : [];
    if(monsters.length) monsterCtx = `\n[최근 조우 몬스터] ${monsters.join(', ')}`;
  }catch(e){}

  return `당신은 TRPG 세계 건축가입니다. 아래 맥락에서 새로운 장소/던전 데이터를 JSON으로 생성하세요.

[세계관] ${scenario}
[현재 위치] ${curLoc}
[캐릭터] ${char}${charRole ? ' ('+charRole+')' : ''}${craftCtx}${questCtx}${monsterCtx}
[생성 계기] ${trigger}
[서사 맥락] ${context||'없음'}
[이미 존재하는 장소들] ${existingNames}

⚠️ 중요 지침:
- 위 장소들과 이름·설정이 겹치지 않는 완전히 새로운 장소를 1개 생성하세요.
- [생성 계기]와 [서사 맥락]을 반드시 반영하세요. 예: 재료 부족 → 그 재료가 있는 채집지, 몬스터 출몰 → 그 몬스터 서식지, 퀘스트 → 목적지와 연관된 장소.
- 장소는 세계관(${scenario})에 어울리는 고유한 이름과 분위기를 가져야 합니다.
- shops 배열에는 장소 특색에 맞는 아이템을 포함하세요 (채집지라면 재료, 던전이라면 전투용품 등).

반드시 다음 JSON 형식만 반환하세요 (다른 텍스트 없이):
{
  "id": "ai_loc_[고유영문ID]",
  "name": "장소 이름",
  "icon": "이모지1개",
  "continent": "central|north|east|west|south|northeast|southeast|northwest 중 서사 맥락에 가장 어울리는 하나",
  "type": "dungeon|shrine|event|special|village|town|city|capital|hamlet|port|wilderness",
  "desc": "장소 분위기와 특징을 담은 2~3문장 설명",
  "triggerKeywords": ["키워드1","키워드2","키워드3","키워드4"],
  "dangerLevel": 1~6사이정수,
  "priceModifier": 0.8~2.5사이소수,
  "atmosphere": "이 장소의 핵심 분위기 한 문장",
  "lore": "이 장소의 역사나 전설 2문장",
  "shops": [
    {
      "name": "상점 이름",
      "items": [
        {"id":"아이템ID","name":"아이템명","icon":"이모지","rarity":"common|uncommon|rare|legendary","type":"equip|consume","slot":"weapon|armor|accessory","desc":"설명","price":100,"effects":{"str":0,"end":0,"agi":0,"int":0,"mgc":0,"per":0,"wil":0,"luk":0,"hp":0,"mp":0}}
      ]
    }
  ],
  "interactions": [
    {"id":"int_고유ID","name":"상호작용명","icon":"이모지","desc":"설명 (판정 조건 포함)","action":"actionName"}
  ],
  "quests": [
    {"tier":"common|uncommon|rare|legendary","icon":"이모지","title":"퀘스트 제목","desc":"의뢰 내용 2문장","rewardMin":30,"rewardMax":150,"rewardExtra":"추가보상 또는 빈문자열"}
  ],
  "infos": [
    {"tier":"useful|special","icon":"이모지","title":"정보 제목","content":"정보 내용 1~2문장"}
  ],
  "aiGenerated": true,
  "generatedAt": "${new Date().toISOString()}",
  "generationTrigger": "${trigger.replace(/"/g,"'")}",
  "scenario": "${scenario}"
}`;
}
window.buildLocationGenPrompt = buildLocationGenPrompt;

export function buildBulletinGenPrompt(loc, trigger, context){
  const scenario = S.scenario?.name || '중세 판타지';
  return `당신은 TRPG 게임 마스터입니다. 아래 상황에 맞는 게시판 의뢰/정보를 JSON으로 생성하세요.

[세계관] ${scenario}
[장소] ${loc.name} (${loc.type})
[트리거] ${trigger}
[상황 맥락] ${context||'없음'}

의뢰 1~2개와 정보 1개를 생성하세요. 반드시 다음 JSON만 반환하세요:
{
  "quests": [
    {"tier":"uncommon|rare","icon":"이모지","title":"의뢰 제목","desc":"의뢰 내용 (장소/상황 반영)","rewardMin":60,"rewardMax":250,"rewardExtra":"추가보상 또는 빈문자열","tags":["${loc.type}"]}
  ],
  "infos": [
    {"tier":"useful|special","icon":"이모지","title":"정보 제목","content":"상황에 맞는 정보 내용"}
  ],
  "aiGenerated": true,
  "generatedAt": "${new Date().toISOString()}",
  "locationId": "${loc.id||''}",
  "locationName": "${loc.name||''}",
  "scenario": "${scenario}"
}`;
}
window.buildBulletinGenPrompt = buildBulletinGenPrompt;

// [복원] callGeminiDirect/callGeminiDirectText — "생성 계열은 키가 있으면
// AI 우선, 없으면 로컬 폴백"으로 다시 정책이 바뀌어 복원한다. 매 턴 서사
// (quest/086의 callAI)는 여전히 로컬 전용으로 남긴다 — 자유 텍스트를
// 없앤 시점에 이미 그렇게 결정됐던 부분이라 여기엔 해당 없음.
export async function callGeminiDirect(prompt, maxTokens){
  if(!S.apiKeys||!S.apiKeys.length) S.apiKeys = loadApiKeys();
  const k = S.apiKeys[loadKeyIndex()%Math.max(1,S.apiKeys.length)]||'';
  if(!k) throw new Error('API 키 없음');

  let lastErr = null;
  for(const model of GEMINI_FALLBACK_MODELS){
    try{
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent?key='+k,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          contents:[{role:'user',parts:[{text:prompt}]}],
          generationConfig:{temperature:0.95, maxOutputTokens:maxTokens||1500, responseMimeType:'application/json'}
        })
      });
      const d = await res.json();
      if(d.error){ lastErr = new Error(d.error.message||'AI 오류'); continue; } // 다음 모델로 재시도
      const raw = d.candidates?.[0]?.content?.parts?.[0]?.text||'{}';
      return JSON.parse(raw.replace(/```json|```/g,'').trim());
    }catch(e){
      lastErr = e; // 네트워크 오류 등도 다음 모델로 재시도
    }
  }
  throw lastErr || new Error('AI 오류(모든 모델 실패)');
}
window.callGeminiDirect = callGeminiDirect;

export async function callGeminiDirectText(prompt, maxTokens){
  if(!S.apiKeys||!S.apiKeys.length) S.apiKeys = loadApiKeys();
  const k = S.apiKeys[loadKeyIndex()%Math.max(1,S.apiKeys.length)]||'';
  if(!k) throw new Error('API 키 없음');

  let lastErr = null;
  for(const model of GEMINI_FALLBACK_MODELS){
    try{
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent?key='+k,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          contents:[{role:'user',parts:[{text:prompt}]}],
          generationConfig:{temperature:0.7, maxOutputTokens:maxTokens||300}
        })
      });
      const d = await res.json();
      if(d.error){ lastErr = new Error(d.error.message||'AI 오류'); continue; }
      return (d.candidates?.[0]?.content?.parts?.[0]?.text||'').trim();
    }catch(e){
      lastErr = e;
    }
  }
  throw lastErr || new Error('AI 오류(모든 모델 실패)');
}
window.callGeminiDirectText = callGeminiDirectText;

window._aiLocGenBusy = false;

// trigger 문자열엔 턴수·NPC명 등 매번 달라지는 부분이 섞여있어(예: '자동 세계
// 확장 (30턴)', 'NPC 대화 트리거: 촌장') 그대로는 버킷 키로 못 쓴다 —
// ':' 나 '(' 앞부분만 잘라 "트리거 종류"만 남긴다.
function _locGenBucketKind(trigger){
  if(!trigger) return 'other';
  const base = String(trigger).split(/[:(]/)[0].trim();
  return base || 'other';
}
window._locGenBucketKind = _locGenBucketKind;

export async function generateAILocation(trigger, context=''){
  if(window._aiLocGenBusy) return null;
  window._aiLocGenBusy = true;
  try{
    const scenario = S.scenario?.name || '중세 판타지';
    const curLocType = (window.currentLocation||loadCurrentLocation())?.type || 'unknown';
    const bucketKey = 'loc|'+_locGenBucketKind(trigger)+'|'+scenario+'|'+curLocType;

    // 이 종류의 장소 생성 트리거가 이미 충분히(12건 이상) 쌓였으면,
    // AI를 새로 부르지 않고 예전에 만들어둔 결과 중 하나를 재사용한다 —
    // 이 턴은 API 호출 자체가 발생하지 않는다.
    const reused = pickGeneratedObject(bucketKey);
    if(reused && !isLocationAlreadyKnown(reused.name)){
      reused.id = 'ai_loc_'+ Date.now()+'_'+Math.random().toString(36).slice(2,6);
      reused.shops        = reused.shops        || [];
      reused.interactions = reused.interactions || [];
      reused.quests       = reused.quests       || [];
      reused.infos        = reused.infos        || [];
      reused.aiGenerated  = true;
      reused.reusedFromLearning = true;

      const pool0 = loadAILocations();
      pool0.push(reused);
      saveAILocations(pool0);

      const log0 = loadAIGenLog();
      log0.push({ type:'location', name:reused.name, trigger, generatedAt:Date.now(), scenario, reused:true });
      saveAIGenLog(log0);

      toastHTML(`🏚️ 새 장소 발견: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(reused,{size:14}):(reused.icon)} ${esc(reused.name)}`, 3000);
      if(document.getElementById('pb-politicalmap') && typeof renderPoliticalMapPanel==='function'){
        try{ setTimeout(()=>renderPoliticalMapPanel(), 500); }catch(e){}
      }
      if(typeof window._WSI_load==='function' && typeof initSettlement==='function'){
        try{
          const wsi=window._WSI_load();
          if(!wsi[reused.id]) initSettlement(reused.id, reused);
        }catch(e){}
      }
      _scheduleExportSnapshot();
      window._aiLocGenBusy = false;
      return reused;
    }

    toast('✨ 새로운 장소를 탐색 중...', 2000);
    const locPrompt = buildLocationGenPrompt(trigger, context);
    const _recordLocSample = (r)=>{
      if(!r) return;
      if(r.desc) recordMarkovSample('location_desc', r.desc);
      if(r.lore) recordMarkovSample('location_lore', r.lore);
    };
    const loc = await tryCloudThenLocalModelThenBank(
      async () => { const r = await callGeminiDirect(locPrompt); _recordLocSample(r); return r; },
      async () => { const r = await callLocalModelJSON(locPrompt, { maxTokens: 500 }); _recordLocSample(r); return r; },
      () => composeLocalLocation(trigger, context),
      '장소 생성'
    );

    // 유효성 검사
    if(!loc.id||!loc.name||!loc.type) throw new Error('불완전한 장소 데이터');
    if(isLocationAlreadyKnown(loc.name)){
      toast('🗺️ 이미 알려진 장소', 1200);
      window._aiLocGenBusy = false; return null;
    }
    // 중복 ID 방지 (생성 시 항상 새 ID 부여)
    loc.id = 'ai_loc_'+ Date.now()+'_'+Math.random().toString(36).slice(2,6);

    // 기본값 보정
    loc.shops       = loc.shops       || [];
    loc.interactions= loc.interactions|| [];
    loc.quests      = loc.quests      || [];
    loc.infos       = loc.infos       || [];
    loc.aiGenerated = true;

    // 학습 버킷에 기록 — 다음부턴 같은 종류의 트리거에서 재사용 가능
    recordGeneratedObject(bucketKey, loc);

    // 저장
    const pool = loadAILocations();
    pool.push(loc);
    saveAILocations(pool);

    // 생성 로그
    const log = loadAIGenLog();
    log.push({ type:'location', name:loc.name, trigger, generatedAt:loc.generatedAt, scenario:loc.scenario });
    // 개수 제한 없음 (전체 저장)
    saveAIGenLog(log);

    toastHTML(`🏚️ 새 장소 발견: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:14}):(loc.icon)} ${esc(loc.name)}`, 3000);

    // ★ 지도 자동 갱신: AI 생성 장소 즉시 반영
    if(document.getElementById('pb-politicalmap') && typeof renderPoliticalMapPanel==='function'){
      try{ setTimeout(()=>renderPoliticalMapPanel(), 500); }catch(e){}
    }
    // ★ WSI 자동 초기화
    if(typeof window._WSI_load==='function' && typeof initSettlement==='function'){
      try{
        const wsi=window._WSI_load();
        if(!wsi[loc.id]) initSettlement(loc.id, loc);
      }catch(e){}
    }

    // 전체 스냅샷 업데이트
    _scheduleExportSnapshot();
    window._aiLocGenBusy = false;
    return loc;
  }catch(e){
    console.warn('[AI 장소 생성 실패]', e.message);
    window._aiLocGenBusy = false;
    return null;
  }
}
window.generateAILocation = generateAILocation;

window._aiBulletinBusy = false;

export async function generateAIBulletinItems(loc, trigger, context=''){
  if(window._aiBulletinBusy) return null;
  window._aiBulletinBusy = true;
  try{
    // 장소 유형+트리거 종류+세계관으로 버킷화. desc/content가 "상황 반영"
    // 이라곤 하지만 실제로는 장소 타입 수준의 일반적 내용이라(구체적인
    // 사건 텍스트를 인용하지 않음) 재사용에 안전하다고 판단했다.
    const scenario = S.scenario?.name || '중세 판타지';
    const bulletinBucketKey = 'bulletin|'+loc.type+'|'+_locGenBucketKind(trigger)+'|'+scenario;
    const reusedBulletin = pickGeneratedObject(bulletinBucketKey);
    if(reusedBulletin){
      const data = {
        ...reusedBulletin,
        generatedAt: new Date().toISOString(),
        locationId: loc.id||'',
        locationName: loc.name||'',
        reusedFromLearning: true,
      };
      data.quests = (data.quests||[]).map(q=>({...q,uid:'aibq_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),aiGenerated:true}));
      data.infos  = (data.infos||[]).map(i=>({...i,uid:'aibi_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),aiGenerated:true}));
      const pool0 = loadAIBulletin();
      pool0.push(data);
      saveAIBulletin(pool0);
      _scheduleExportSnapshot();
      window._aiBulletinBusy = false;
      return data;
    }

    const bulletinPrompt = buildBulletinGenPrompt(loc, trigger, context);
    const _recordBulletinSample = (r)=>{
      if(!r) return;
      (r.quests||[]).forEach(q=>{ if(q.desc) recordMarkovSample('quest_desc', q.desc); });
      (r.infos||[]).forEach(i=>{ const t = typeof i==='string' ? i : i?.desc; if(t) recordMarkovSample('bulletin_info', t); });
    };
    const data = await tryCloudThenLocalModelThenBank(
      async () => { const r = await callGeminiDirect(bulletinPrompt); _recordBulletinSample(r); return r; },
      async () => { const r = await callLocalModelJSON(bulletinPrompt, { maxTokens: 500 }); _recordBulletinSample(r); return r; },
      () => composeLocalBulletinItems(loc, trigger, context),
      '게시판 생성'
    );
    if(!data.quests && !data.infos){ window._aiBulletinBusy=false; return null; }

    recordGeneratedObject(bulletinBucketKey, { quests: data.quests, infos: data.infos, aiGenerated:true, scenario });

    data.quests = (data.quests||[]).map(q=>({...q,uid:'aibq_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),aiGenerated:true}));
    data.infos  = (data.infos||[]).map(i=>({...i,uid:'aibi_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),aiGenerated:true}));

    const pool = loadAIBulletin();
    pool.push(data);
    // 개수 제한 없음 (전체 저장)
    saveAIBulletin(pool);

    _scheduleExportSnapshot();
    window._aiBulletinBusy = false;
    return data;
  }catch(e){
    console.warn('[AI 게시판 생성 실패]', e.message);
    window._aiBulletinBusy = false;
    return null;
  }
}
window.generateAIBulletinItems = generateAIBulletinItems;

export function getAIBulletinForLoc(locId, locName){
  const pool = loadAIBulletin();
  const matching = pool.filter(b=>b.locationId===locId || (locName && b.locationName===locName));
  const quests = matching.flatMap(b=>b.quests||[]);
  const infos  = matching.flatMap(b=>b.infos||[]);
  return { quests, infos };
}
window.getAIBulletinForLoc = getAIBulletinForLoc;

export const _locTriggerCooldown = new Map();

export function _isLocCooldown(label, currentTurn, cooldownTurns = 8){
  const last = _locTriggerCooldown.get(label) || 0;
  return (currentTurn - last) < cooldownTurns;
}
window._isLocCooldown = _isLocCooldown;

export function _setLocCooldown(label, currentTurn){
  _locTriggerCooldown.set(label, currentTurn);
}
window._setLocCooldown = _setLocCooldown;

export async function checkAndExpandWorld(aiText){
  if(!aiText) return;

  const turnCount = S.msgCount || 0;
  const scenario  = S.scenario?.name || '중세 판타지';

  // 1) 새 장소 생성 트리거 — 매칭된 패턴 중 우선순위 높은 것 선택
  const matched = LOC_TRIGGER_PATTERNS.filter(pat => pat.regex.test(aiText) && !_isLocCooldown(pat.label, turnCount));

  if(matched.length > 0){
    // 첫 번째 매칭 패턴 사용 (배열 순서가 우선순위)
    const pat = matched[0];
    // 트리거 종류별 확률: 직접 발견계 0.6, 재료·생태계 0.5, 역사·기타 0.45
    const directLabels = ['새 장소 발견','입구 발견','미지 장소','우연한 발견','퀘스트 장소','재료 산지 제보'];
    const prob = directLabels.includes(pat.label) ? 0.6 : 0.5;
    if(Math.random() < prob){
      const context = `[트리거: ${pat.label}] ${pat.hint}\n\n[서사 맥락]\n${aiText.slice(0,400)}`;
      await generateAILocation(pat.label, context);
      _setLocCooldown(pat.label, turnCount);
    }
  }

  // 2) 게시판 AI 보강 트리거 (마을·도시 계열 장소에서만)
  const loc = window.currentLocation || loadCurrentLocation();
  if(loc && ['hamlet','village','town','city','capital','port'].includes(loc.type)){
    for(const pat of BULLETIN_TRIGGER_PATTERNS){
      if(pat.regex.test(aiText) && !_isLocCooldown('bulletin_'+pat.label, turnCount)){
        if(Math.random() < 0.4){
          const context = aiText.slice(0,300);
          await generateAIBulletinItems(loc, pat.label, context);
          _setLocCooldown('bulletin_'+pat.label, turnCount);
          break;
        }
      }
    }
  }

  // 3) 주기적 자동 생성 (20턴마다, 60% 확률 — 간격 단축)
  if(turnCount > 0 && turnCount % 20 === 0 && Math.random() < 0.6){
    await generateAILocation('자동 세계 확장 ('+turnCount+'턴)', '현재 시나리오: '+scenario+' / 현재 위치: '+(loc?.name||'알 수 없음'));
  }

  // 4) 게시판 주기적 갱신 — 마을/도시에서 15턴마다 새 의뢰 보충
  //    기존 의뢰는 유지, 새로운 의뢰만 추가 (게시판이 살아있는 느낌)
  if(loc && ['hamlet','village','town','city','capital','port'].includes(loc.type)){
    const BULLETIN_REFRESH_INTERVAL = 15; // 15턴마다
    const lastRefreshKey = 'tf-bulletin-last-refresh-'+(loc.id||loc.name||'').replace(/[^a-z0-9가-힣]/gi,'_');
    const lastRefresh = parseInt(lsGet(lastRefreshKey)||'0');
    if(turnCount > 0 && (turnCount - lastRefresh) >= BULLETIN_REFRESH_INTERVAL){
      lsSet(lastRefreshKey, String(turnCount));
      // 게시판에 새 의뢰 추가 (기존 것은 그대로, 완료된 것만 교체)
      if(Math.random() < 0.6){
        const refreshContext = `${turnCount}턴 경과 — 새로운 소식과 의뢰가 게시판에 추가됐다.`;
        await generateAIBulletinItems(loc, '정기 게시판 갱신', refreshContext);
        toast('📋 게시판에 새 의뢰가 올라왔다', 2000);
      }
    }
  }
}
window.checkAndExpandWorld = checkAndExpandWorld;

export async function checkNPCLocationHint(npcName, dialogText){
  if(!dialogText) return;
  const patterns = [
    /내가 아는 곳이 있는데|비밀 장소를 알고 있소|특별한 곳으로 안내|숨겨진 곳이 있다네/,
    /그곳으로 가면|저기 깊은 곳에|예전에 발견한 장소/,
    /그 재료는|그 약초는|그 광석은|거기서만 구할 수|거기 가면 있을/,
    /옛날에는|전설에 따르면|소문에 의하면|들은 바로는/,
    /조심해|위험한 곳|절대 가지|누구도 살아|아무도 돌아오지/,
  ];
  for(const p of patterns){
    if(p.test(dialogText) && Math.random() < 0.65){
      const context = `NPC [${npcName}] 대화 중 언급:\n${dialogText.slice(0,250)}`;
      await generateAILocation('NPC 대화 힌트', context);
      break;
    }
  }
}
window.checkNPCLocationHint = checkNPCLocationHint;

export async function maybeGenerateQuestLocation(questTitle, questDesc){
  if(Math.random() < 0.55){
    const trigger = `퀘스트 수락: ${questTitle}`;
    const context = `퀘스트: ${questTitle}\n내용: ${questDesc||''}`;
    await generateAILocation(trigger, context);
  }
}
window.maybeGenerateQuestLocation = maybeGenerateQuestLocation;

export function renderAILocationsPanel(){
  const locs = loadAILocations();
  const log  = loadAIGenLog();
  // [13차 감사 FIX] window.manualGenerateLocation(플레이어가 직접 "탐험 요청"
  // 해서 새 장소를 즉시 생성하는 함수)이 완성돼 있었는데 이 패널 어디에도
  // 그걸 부르는 버튼이 없었다 — 새 장소는 오직 다른 트리거로 자동 생성될
  // 때만 늘어났고, 플레이어가 능동적으로 "더 탐험해보기"를 할 방법이 없던
  // 빈틈이었다. 빈 상태/목록 상단 양쪽에 버튼을 추가한다.
  const genBtnHtml = `<button class="btn btn-dark" style="width:100%;margin-bottom:10px;padding:8px;font-size:10px;border-color:#7a5a9a66;color:#a080c0" onclick="manualGenerateLocation()">✨ 지금 새로운 장소 탐험하기</button>`;

  if(!locs.length) return `
    ${genBtnHtml}
    <div style="text-align:center;padding:20px;color:var(--dim);font-size:11px">
      아직 AI가 생성한 장소가 없습니다.<br>
      위 버튼을 누르거나 모험을 계속하면 새로운 장소가 발견됩니다.
    </div>`;

  let html = genBtnHtml + `
    <div style="font-family:Cinzel,serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:8px;opacity:.8">
      ✨ AI 생성 장소 풀 (${locs.length}개)
    </div>`;

  locs.forEach((loc,i)=>{
    const dColor = ['#4a8a4a','#8a8a2a','#8a5a2a','#8a2a2a','#6a1a6a','#4a0a0a'][Math.min((loc.dangerLevel||1)-1,5)];
    html += `
    <div style="padding:11px;background:#090600;border:1px solid ${loc.type==='dungeon'?'#4a3a1a':'#2a2a4a'};margin-bottom:8px;border-radius:2px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="font-size:22px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:22}):loc.icon}</span>
        <div style="flex:1">
          <div style="font-family:Cinzel,serif;font-size:11px;color:var(--gold)">${esc(loc.name)}</div>
          <div style="font-size:9px;color:var(--dim)">${loc.type} · 위험도 ${'⚠️'.repeat(loc.dangerLevel||1)}</div>
        </div>
        <div style="font-size:8px;color:#7a5a9a;flex-shrink:0">✨AI</div>
      </div>
      <div style="font-size:10px;color:var(--dim);line-height:1.5;margin-bottom:5px">${esc(loc.desc||'')}</div>
      ${loc.lore?(isLocLoreUnlocked(loc.id)?`<div style="font-size:9px;color:#6a5a8a;border-left:2px solid #3a2a5a;padding-left:6px;margin-bottom:5px;line-height:1.4">📜 ${esc(loc.lore)}</div>`:`<div style="font-size:9px;color:#3a2a4a;border-left:2px solid #2a1a3a;padding-left:6px;margin-bottom:5px;font-style:italic">🔒 더 깊이 탐험하면 이 장소의 진실이 드러날 것이다...</div>`):''}
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:5px">
        ${(loc.triggerKeywords||[]).map(k=>`<span style="font-size:8px;padding:2px 5px;background:#1a1a0a;border:1px solid #2a2a1a;border-radius:1px;color:var(--dim)">${esc(k)}</span>`).join('')}
      </div>
      <div style="display:flex;gap:4px;margin-top:5px">
        <button class="btn btn-dark" style="flex:1;padding:5px;font-size:8px" onclick="moveToAILocation('${esc(loc.id)}')">이 장소로 이동</button>
        <button class="btn btn-dark" style="padding:5px 8px;font-size:8px" onclick="copyAILocationJSON('${esc(loc.id)}')">JSON 복사</button>
      </div>
    </div>`;
  });

  html += `
    <div style="margin-top:10px;padding:8px;background:#050300;border:1px solid #1a1a08;border-radius:2px">
      <div style="font-family:Cinzel,serif;font-size:9px;color:#5a5a3a;margin-bottom:4px">생성 로그 (최근 ${Math.min(log.length,5)}건)</div>
      ${log.slice(-5).reverse().map(l=>`<div style="font-size:9px;color:var(--dim);padding:2px 0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(l,{size:9}):(l.icon||"📍")} ${esc(l.name||l.trigger)} — ${new Date(l.generatedAt).toLocaleString()}</div>`).join('')}
    </div>
    <button class="btn btn-dark" style="width:100%;margin-top:8px;padding:7px;font-size:9px" onclick="exportAllGameData()">📦 전체 데이터 JSON 내보내기</button>`;

  return html;
}
window.renderAILocationsPanel = renderAILocationsPanel;

window.manualGenerateLocation = async function(){
  const scenario = S.scenario?.name||'중세 판타지';
  const trigger = '수동 요청 — '+scenario+' ('+new Date().toLocaleTimeString()+')';
  const loc = await generateAILocation(trigger, '플레이어가 직접 탐험 요청');
  if(loc){
    // 현재 위치 패널 새로고침
    const pb = document.getElementById('pb-ailocations');
    if(pb) pb.innerHTML = renderAILocationsPanel();
  }
};

window.moveToAILocation = function(locId){
  const locs = loadAILocations();
  const loc = locs.find(l=>l.id===locId);
  if(!loc){ toast('장소를 찾을 수 없습니다',1500); return; }
  window.currentLocation = loc;
  saveCurrentLocation(loc);
  const visited = loadLocations();
  if(!visited.find(v=>v.name===loc.name)){
    visited.push({name:loc.name,icon:loc.icon,visitedAt:new Date().toISOString(),turn:S.msgCount,aiGenerated:true});
    saveLocations(visited);
  }
  toastHTML(`📍 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:14}):(loc.icon)} ${esc(loc.name)} 이동!`, 2500);
  closeP('ailocations');
  window.openP('location');
  renderLocationPanel();
};

window.copyAILocationJSON = function(locId){
  const locs = loadAILocations();
  const loc = locs.find(l=>l.id===locId);
  if(!loc) return;
  navigator.clipboard?.writeText(JSON.stringify(loc,null,2)).then(()=>toast('📋 JSON 복사됨!',1500)).catch(()=>{
    const ta=document.createElement('textarea');
    ta.value=JSON.stringify(loc,null,2);
    document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
    toast('📋 JSON 복사됨!',1500);
  });
};

window.exportAllGameData = function(){
  const snapshot = window.buildFullDataSnapshot();
  const json = JSON.stringify(snapshot, null, 2);

  // 다운로드 — 모바일 Web Share API 우선, 실패 시 일반 다운로드
  const blob = new Blob([json], {type:'application/json'});
  const filename = 'taleforge-data-export-'+new Date().toISOString().slice(0,10)+'.json';
  const url  = URL.createObjectURL(blob);
  if(navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, {type:'application/json'})] })){
    navigator.share({ title:'TaleForge 데이터', files:[new File([blob], filename, {type:'application/json'})] })
      .then(()=>URL.revokeObjectURL(url)).catch(()=>URL.revokeObjectURL(url));
  } else {
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  }

  // 로컬 스냅샷 저장
  try{ lsSet(AI_LOC_EXPORT_KEY, JSON.stringify(snapshot)); }catch(e){}
  toast('📦 전체 데이터 내보내기 완료!', 3000);
};

window._snapshotTimer = null;

export function _scheduleExportSnapshot(){
  clearTimeout(window._snapshotTimer);
  window._snapshotTimer = setTimeout(()=>{
    try{
      const snap = window.buildFullDataSnapshot();
      lsSet(AI_LOC_EXPORT_KEY, JSON.stringify(snap));
    }catch(e){}
  }, 3000);
}
window._scheduleExportSnapshot = _scheduleExportSnapshot;

window.extractHardcodeRules = function(){
  try{
    const playlog = (()=>{ try{ return JSON.parse(lsGet('tf-master-playlog')||'[]'); }catch(e){ return []; } })();
    if(playlog.length < ME_MIN_SAMPLES){
      toast(`⚠️ 데이터 부족 (현재 ${playlog.length}건, 최소 ${ME_MIN_SAMPLES}건 필요)`, 3000);
      return [];
    }

    // ── 카테고리(위치+직업+종족+씬타입+HP구간+행동의도+부정여부+호감도+골드+시간대)로 그룹화 ──
    // [확장] 전투(HP)에만 치우쳐 있던 분류를 경제/관계/시간 차원까지 일반화
    // [핵심] 선택지 입력만 룰화 대상 — 자유 입력 데이터는 다양성 보존을 위해 제외
    const groups = {};
    playlog.forEach(entry => {
      if(!entry.userMsg || !entry.aiText) return;
      if(!entry.isChoiceInput) return; // 자유 입력은 룰 추출 대상에서 제외
      const tokens = _meTokenize(entry.userMsg);
      const intent = _meIntent(tokens, entry.userMsg);
      if(!intent) return; // 알려진 행동 의도가 없으면 룰화 대상에서 제외
      const negation = _meHasNegation(entry.userMsg);
      const hpBand = (entry.hp !== undefined && entry.maxHp) ? _meHpBand(entry.hp / entry.maxHp) : null;
      const affinityBand = _meAffinityBand(entry.npcAffinityScore);
      const goldBand = _meGoldBand(entry.gold);
      const timeBand = entry.timeBand || null;
      const groupKey = _meCategoryKey(entry.location, entry.job, entry.race, entry.sceneType, hpBand, intent, negation, affinityBand, goldBand, timeBand, entry.monsterName);
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(entry);
    });

    // ── 카테고리별 응답 풀 크기 검증 → 충분히 쌓인 카테고리만 룰로 확정 ──
    // ME_POOL_MIN_SIZE는 파일 상단 전역 선언 사용 (매칭 엔진과 완전히 동일한 기준)
    const rules = [];
    Object.entries(groups).forEach(([groupKey, entries]) => {
      if(entries.length < ME_POOL_MIN_SIZE) return; // 풀이 너무 작으면 다양성 보장 안 됨 — 룰화 보류

      const uniqueResponses = new Set(entries.map(e => e.aiText.slice(0,60)));
      const diversityRatio = uniqueResponses.size / entries.length;

      const [location, job, race, sceneType, hpBand, intent, negFlag, affinityBand, goldBand, timeBand] = groupKey.split('::');
      rules.push({
        condition: {
          location: location === '?' ? null : location,
          job: job === '?' ? null : job,
          race: race === '?' ? null : race,
          sceneType: sceneType === '?' ? null : sceneType,
          hpBand: hpBand === '?' ? null : hpBand, // '빈사'/'위급'/'부상'/'양호'/'건강'
          intent: intent === '?' ? null : intent, // 정규화된 행동 의도 (공격/이동/대화 등)
          negation: negFlag === 'NEG',
          affinityBand: affinityBand === '?' ? null : affinityBand, // '적대'~'신뢰'
          goldBand: goldBand === '?' ? null : goldBand, // '빈곤'~'부유'
          timeBand: timeBand === '?' ? null : timeBand, // '아침'/'낮'/'저녁'/'밤'
        },
        // 풀 전체를 보존 — 실제 적용 시 이 풀에서 매번 랜덤 선택해 다양성 유지
        responsePool: entries.map(e => ({
          text: e.aiText,
          safeGs: e.gs ? Object.fromEntries(
            Object.entries(e.gs).filter(([k]) => ['stats','gold','items'].includes(k))
          ) : null,
        })),
        poolSize: entries.length,
        diversityRatio: Math.round(diversityRatio * 100) / 100, // 풀 안에서 응답이 얼마나 다양한지
        firstSeenTurn: Math.min(...entries.map(e => e.turn||0)),
        lastSeenTurn: Math.max(...entries.map(e => e.turn||0)),
      });
    });

    // 풀 크기 큰 순 정렬 (가장 신뢰할 만한 카테고리부터)
    rules.sort((a,b) => b.poolSize - a.poolSize);

    return rules;
  }catch(e){
    console.warn('[RuleExtractor]', e);
    return [];
  }
};

window.exportHardcodeRules = function(){
  const rules = window.extractHardcodeRules();
  if(!rules.length){
    toast('⚠️ 확정된 룰이 없습니다. 더 플레이해서 데이터를 쌓아주세요.', 3500);
    return;
  }

  const jsCode = `// TaleForge 하드코딩 룰 테이블 (풀 방식) — ${new Date().toLocaleString('ko-KR')} 추출
// 총 ${rules.length}개 확정 카테고리 (각 카테고리당 응답 풀 12건 이상)
//
// 사용법: condition(location/job/race/sceneType/hpBand/intent/negation)이
// 현재 상황과 일치하면 responsePool에서 매번 랜덤 선택해 사용.
// 응답 풀 자체가 다양한 표현을 담고 있어 매번 다른 문장이 나옴 (다양성 보존).
// hpBand는 정확한 HP 수치가 아니라 '위급'/'보통'/'건강' 구간 — 세세한 케이스
// 대신 적은 수의 일반화된 규칙으로 매칭되도록 설계됨.
const TALEFORGE_HARDCODE_RULES = ${JSON.stringify(rules, null, 2)};

export default TALEFORGE_HARDCODE_RULES;
`;

  const blob = new Blob([jsCode], { type: 'text/javascript' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `taleforge-hardcode-rules-${Date.now()}.js`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast(`📦 ${rules.length}개 룰 추출 완료 — JS 파일로 내보냄`, 3500);
};

window.previewHardcodeRules = function(){
  const rules = window.extractHardcodeRules();
  const playlog = (()=>{ try{ return JSON.parse(lsGet('tf-master-playlog')||'[]'); }catch(e){ return []; } })();
  const avgDiversity = rules.length ? Math.round(rules.reduce((s,r)=>s+r.diversityRatio,0)/rules.length*100) : 0;
  const coveredSamples = rules.reduce((s,r)=>s+r.poolSize, 0);
  const coverage = playlog.length ? Math.round(coveredSamples/playlog.length*100) : 0;
  toast(`🔍 확정 카테고리 ${rules.length}개 (평균 다양성 ${avgDiversity}%) — 전체 데이터의 ${coverage}% 커버`, 4500);
  return rules;
};

window.toggleMatchingEngine = function(){
  const cur = lsGet('tf-me-enabled') === '1';
  lsSet('tf-me-enabled', cur ? '0' : '1');
  lsSet('tf-me-user-toggled', '1'); // 사용자가 직접 설정을 건드렸음을 기록
  toast(cur ? '🧠 로컬 매칭 엔진 OFF — 항상 AI 사용' : '🧠 로컬 매칭 엔진 ON — 데이터 충분 시 AI 호출 절감', 3000);
  if(typeof window.showCollectionStats === 'function') window.showCollectionStats();
};

window.renderDataCollectPanel = function(){ return window.showCollectionStats(); };

window.showCollectionStats = function(){
  const monsters   = (() => { try { return JSON.parse(lsGet('tf-discovered-monsters') || '[]'); } catch(e) { return []; } })();
  const locs       = (() => { try { return JSON.parse(lsGet('tf-visited-locations') || '[]'); } catch(e) { return []; } })();
  const dialogues  = (() => { try { return JSON.parse(lsGet('tf-npc-dialogues') || '[]'); } catch(e) { return []; } })();
  const skills     = (() => { try { return JSON.parse(lsGet('tf-discovered-skills') || '[]'); } catch(e) { return []; } })();
  const lore       = (() => { try { return JSON.parse(lsGet('tf-lore-database') || '[]'); } catch(e) { return []; } })();
  const worldEvs   = (() => { try { return JSON.parse(lsGet('tf-world-events-log') || '[]'); } catch(e) { return []; } })();
  const questDb    = (() => { try { return JSON.parse(lsGet('tf-quest-database') || '[]'); } catch(e) { return []; } })();
  const playlog    = (() => { try { return JSON.parse(lsGet('tf-master-playlog') || '[]'); } catch(e) { return []; } })();
  const sceneStats = (() => { try { return JSON.parse(lsGet('tf-scene-stats') || '{}'); } catch(e) { return {}; } })();
  const npcs       = loadNPCs() || [];
  const items      = S.inventory || [];

  const rows = [
    { label:'👹 몬스터', count: monsters.length, key: 'tf-discovered-monsters' },
    { label:'📍 방문 장소', count: locs.length, key: 'tf-visited-locations' },
    { label:'👤 NPC', count: npcs.length, key: null },
    { label:'💬 NPC 대사', count: dialogues.length, key: 'tf-npc-dialogues' },
    { label:'⚡ 스킬', count: skills.length, key: 'tf-discovered-skills' },
    { label:'📖 세계관 설정', count: lore.length, key: 'tf-lore-database' },
    { label:'📜 퀘스트 DB', count: questDb.length, key: 'tf-quest-database' },
    { label:'🌍 세계 사건', count: worldEvs.length, key: 'tf-world-events-log' },
    { label:'🎒 아이템', count: items.length, key: null },
    { label:'📋 플레이 로그', count: playlog.length, key: 'tf-master-playlog' },
    { label:'🎬 총 턴 수', count: S.msgCount || 0, key: null },
  ];

  const sceneRows = Object.entries(sceneStats).map(([k,v])=>`<span style="font-size:9px;padding:2px 6px;background:#0d0800;border:1px solid #2a1a05;margin:2px;display:inline-block">${k}: ${v}회</span>`).join('');

  // [신규] 선택지 입력 vs 자유 입력 비율 — 매칭 엔진은 선택지 입력만 사용하므로
  // 이 비율이 높을수록 캐싱 가능한 데이터가 더 빨리 쌓인다는 의미
  const choiceCount = playlog.filter(p => p.isChoiceInput).length;
  const freeCount = playlog.length - choiceCount;
  const choicePct = playlog.length ? Math.round(choiceCount / playlog.length * 100) : 0;

  // 매칭 엔진 상태 + 히트율
  const meEnabled = lsGet('tf-me-enabled') === '1';
  const meStats   = (()=>{ try{ return JSON.parse(lsGet('tf-me-stats')||'{}'); }catch(e){ return {}; } })();
  const meHits    = meStats.hits   || 0;
  const meMisses  = meStats.misses || 0;
  const meTotal   = meHits + meMisses;
  const meRate    = meTotal > 0 ? Math.round((meHits / meTotal) * 100) : 0;

  const html = `
  <div style="padding:12px;font-family:Cinzel,serif">
    <div style="font-size:11px;color:var(--gold);letter-spacing:1px;margin-bottom:10px;text-align:center">📊 하드코딩 데이터 수집 현황</div>
    <div style="font-size:9px;color:#5a4a3a;margin-bottom:8px;text-align:center">플레이할수록 쌓이는 게임 데이터</div>
    ${rows.map(r=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #1a0a00">
        <span style="font-size:10px;color:var(--text)">${r.label}</span>
        <span style="font-size:12px;color:var(--gold);font-weight:bold">${r.count.toLocaleString()}</span>
      </div>`).join('')}
    ${sceneRows ? `<div style="margin-top:8px;font-size:9px;color:#5a4a3a">장면 통계:</div><div style="margin-top:4px">${sceneRows}</div>` : ''}
    ${playlog.length ? `<div style="margin-top:10px;padding:8px;background:#0a0a08;border:1px solid #2a2a1a;border-radius:3px">
      <div style="font-size:9px;color:#8a8a6a;margin-bottom:4px">선택지 입력 ${choicePct}% (${choiceCount}건) / 자유 입력 ${100-choicePct}% (${freeCount}건)</div>
      <div style="font-size:8px;color:#5a5a4a;line-height:1.5">선택지 입력만 캐시 대상입니다 — 자유 입력은 항상 AI를 사용해 다양성을 지킵니다.</div>
    </div>` : ''}

    <div style="margin-top:14px;padding:10px;background:#0a0a14;border:1px solid #2a2a4a;border-radius:3px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:10px;color:#8090e0">🧠 로컬 매칭 엔진 (실험적)</span>
        <button onclick="toggleMatchingEngine()" style="padding:3px 10px;font-size:9px;border-radius:10px;border:1px solid ${meEnabled?'#60c060':'#666'};background:${meEnabled?'#0a2a0a':'#1a1a1a'};color:${meEnabled?'#60c060':'#888'};cursor:pointer">${meEnabled?'ON':'OFF'}</button>
      </div>
      <div style="font-size:8px;color:#6a6a8a;line-height:1.6;margin-bottom:6px">
        같은 종류의 상황(위치·직업·종족·씬·HP구간·행동의도)에 과거 응답이 12개 이상 쌓이면, 그 풀에서 매번 다른 응답을 랜덤 선택해 AI 호출 없이 사용합니다. 같은 문장만 반복되지 않도록 풀 자체의 다양성도 함께 검사합니다.
      </div>
      ${meTotal > 0 ? `
      <div style="display:flex;justify-content:space-between;font-size:9px;color:#8a8aa0">
        <span>AI 호출 절감: <b style="color:#60c060">${meRate}%</b></span>
        <span>${meHits}건 절감 / ${meTotal}건 시도</span>
      </div>` : `<div style="font-size:8px;color:#4a4a5a;text-align:center">아직 시도 기록 없음</div>`}
      <label style="display:flex;align-items:center;gap:5px;margin-top:6px;font-size:8px;color:#6a6a8a;cursor:pointer">
        <input type="checkbox" ${lsGet('tf-me-debug')==='1'?'checked':''} onchange="lsSet('tf-me-debug', this.checked?'1':'0')" style="cursor:pointer">
        매칭 발생 시 알림 표시 (투명성용)
      </label>
    </div>

    <div style="margin-top:10px;padding:10px;background:#0a140a;border:1px solid #2a4a2a;border-radius:3px">
      <div style="font-size:10px;color:#80c080;margin-bottom:6px">🔧 하드코딩 룰 추출기</div>
      <div style="font-size:8px;color:#6a8a6a;line-height:1.6;margin-bottom:8px">
        쌓인 데이터를 같은 종류의 상황으로 묶고, 응답 풀이 12개 이상인 카테고리만 룰로 확정합니다. 풀 안의 다양한 응답을 그대로 보존하므로 외부 앱에서도 매번 다른 문장으로 출력됩니다.
      </div>
      <div style="display:flex;gap:5px">
        <button onclick="previewHardcodeRules()" style="flex:1;padding:6px;font-size:9px;background:#0a1a0a;border:1px solid #2a5a2a;color:#80c080;cursor:pointer;border-radius:2px">🔍 미리보기</button>
        <button onclick="exportHardcodeRules()" style="flex:1;padding:6px;font-size:9px;background:#0a2a0a;border:1px solid #3a7a3a;color:#a0e0a0;cursor:pointer;border-radius:2px">📤 JS로 추출</button>
      </div>
    </div>

    <div style="margin-top:12px;display:flex;flex-direction:column;gap:5px">
      <button class="btn btn-gold" style="width:100%;padding:8px;font-size:10px" onclick="exportAllGameData()">📦 전체 데이터 JSON 내보내기</button>
      <button class="btn btn-dark" style="width:100%;padding:7px;font-size:9px" onclick="exportAllData()">💾 세이브 파일 내보내기</button>
    </div>
    <div style="margin-top:8px;font-size:8px;color:#3a2a1a;text-align:center;line-height:1.5">
      내보낸 JSON을 모아두면 나중에<br>AI 없이 게임을 하드코딩할 수 있습니다
    </div>
  </div>`;

  // 팝업으로 표시 (기존 팝업 있으면 갱신만, 없으면 새로 생성 — 중첩 방지)
  let overlay = document.getElementById('collection-stats-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = 'collection-stats-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `<div style="background:#050200;border:1px solid #2a1a05;max-width:320px;width:90%;max-height:80vh;overflow-y:auto;border-radius:2px">${html}<button class="btn btn-dark" style="width:calc(100% - 24px);margin:0 12px 12px;padding:6px;font-size:9px" onclick="document.getElementById('collection-stats-overlay')?.remove()">닫기</button></div>`;
};

(function injectAILocPanel(){
  // p-ailocations 패널이 없으면 동적으로 삽입
  if(document.getElementById('p-ailocations')) return;
  const div = document.createElement('div');
  div.className = 'panel-ov';
  div.id = 'p-ailocations';
  div.innerHTML = `<div class="panel">
    <div class="p-hdr"><span class="p-title">✨ AI 장소 확장</span><button class="p-close" onclick="closeP('ailocations')">✕</button></div>
    <div class="p-body scrollable" id="pb-ailocations"></div>
  </div>`;
  document.body.appendChild(div);
})();

// [버그 수정] _origOpenP를 모듈 로드 시점에 동기적으로 캡처했었는데,
// 실제 window.openP는 quest/086의 __tfDeferred_67 안에서 나중에(main.js가
// 모든 모듈 로드 후 일괄 호출할 때) 설정된다 — 이 파일이 먼저 로드되는
// 시점엔 아직 window.openP가 존재하지 않아 _origOpenP가 항상 null이
// 되고, 아래 'ailocations' 케이스를 추가하는 감싸기가 절대 설치되지
// 못했다('✨ AI 장소 확장' 패널이 항상 빈 화면으로 열리던 버그). 다른
// 죽은 훅들처럼 재시도 패턴으로 실제 window.openP가 준비될 때까지 기다렸다가 감싼다.
export let _origOpenP = null;
(function hookAILocOpenP(){
  const t=function(){
    if(window._ailocOpenPHooked) return;
    if(typeof window.openP!=='function'){ setTimeout(t,1000); return; }
    window._ailocOpenPHooked=true;
    _origOpenP = window.openP;
    window.openP = function(name){
      _origOpenP(name);
      if(name==='ailocations'){
        const pb = document.getElementById('pb-ailocations');
        if(pb) pb.innerHTML = renderAILocationsPanel();
      }
    };
  };
  setTimeout(t,1000);
})();

(function injectAILocButton(){
  window.addEventListener('DOMContentLoaded', ()=>{
    const btmBar = document.querySelector('.btm-bar');
    if(btmBar && !document.getElementById('btn-ailocations')){
      const btn = document.createElement('button');
      btn.className = 'bb';
      btn.id = 'btn-ailocations';
      btn.textContent = '✨장소확장';
      btn.onclick = ()=>{ window.openP('ailocations'); };
      btmBar.appendChild(btn);
    }
  });
  // DOMContentLoaded 이후에도 시도
  setTimeout(()=>{
    const btmBar = document.querySelector('.btm-bar');
    if(btmBar && !document.getElementById('btn-ailocations')){
      const btn = document.createElement('button');
      btn.className = 'bb';
      btn.id = 'btn-ailocations';
      btn.textContent = '✨장소';
      btn.onclick = ()=>{ window.openP('ailocations'); };
      btmBar.appendChild(btn);
    }
  }, 1500);
})();

setTimeout(()=>{
  const worldSection = document.querySelector('.pc-sidebar');
  if(worldSection && !document.getElementById('pc-ai-loc-btn')){
    const btn = document.createElement('button');
    btn.className = 'pc-menu-btn';
    btn.id = 'pc-ai-loc-btn';
    btn.onclick = ()=>window.openP('ailocations');
    btn.innerHTML = `<span class="pc-ico">✨</span><span class="pc-lbl">AI장소</span>`;
    const worldTitle = worldSection.querySelector('.pc-sec-title');
    if(worldTitle) worldTitle.parentNode.insertBefore(btn, worldTitle.nextSibling);
    else worldSection.appendChild(btn);
  }
}, 2000);

console.log('[TaleForge] ✨ AI 동적 장소/던전 확장 시스템 v1.0 로드 완료');

export const TRAVEL_LOG_KEY    = 'tf-travel-log';

export function loadTravelLog(){ try{ return JSON.parse(lsGet(TRAVEL_LOG_KEY)||'[]'); }catch(e){ return []; } }
window.loadTravelLog = loadTravelLog;

export function saveTravelLog(d){ try{ lsSet(TRAVEL_LOG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveTravelLog = saveTravelLog;

export const MAP_ELIGIBLE_TYPES = new Set([
  'village','hamlet','settlement',
  'town','city','capital',
  'dungeon','cave','ruins',
  'shrine','shrine_area',
  'fort','fortress','garrison',
  'special','port','harbor',
  'camp','outpost','tower',
  'wilderness',
]);

export function isMapEligibleLocation(loc){
  if(!loc) return false;
  // type 기반
  if(MAP_ELIGIBLE_TYPES.has(loc.type)) return true;
  // id 기반 fallback (loc_으로 시작하는 정의 장소)
  if(loc.id && loc.id.startsWith('loc_')) return true;
  return false;
}
window.isMapEligibleLocation = isMapEligibleLocation;

export function updateMapTabState(loc){
  const btn = document.getElementById('gbtn-map');
  if(!btn) return;
  const eligible = isMapEligibleLocation(loc || window.currentLocation || loadCurrentLocation());
  if(eligible){
    btn.style.opacity = '1';
    btn.style.cursor  = 'pointer';
    btn.title = '🗺️ 여행 지도 — 이동할 장소를 선택하세요';
    // 금빛 펄스 효과 (처음 활성화될 때)
    if(!btn._wasEligible){
      btn.style.transition = 'opacity .4s, border-color .4s, color .4s';
      btn.style.borderColor = 'var(--gold)';
      btn.style.color = 'var(--gold)';
      setTimeout(()=>{ btn.style.transition=''; }, 600);
    }
    btn._wasEligible = true;
  } else {
    btn.style.opacity = '0.35';
    btn.style.cursor  = 'not-allowed';
    btn.style.borderColor = '';
    btn.style.color = '';
    btn.title = '이동 가능한 장소(마을·던전·도시 등)에서 활성화됩니다';
    btn._wasEligible = false;
  }
}
window.updateMapTabState = updateMapTabState;

export function onMapTabClick(){
  const loc = window.currentLocation || loadCurrentLocation();
  if(!isMapEligibleLocation(loc)){
    toast('⚠️ 이동 가능한 거점(마을·던전·도시 등)에 있어야 지도를 열 수 있습니다', 2200);
    return;
  }
  openOverworldMap(loc);
}
window.onMapTabClick = onMapTabClick;

window.onMapTabClick = onMapTabClick;

export function getTravelDistance(fromType, toType){
  const key1 = fromType+'-'+toType;
  const key2 = toType+'-'+fromType;
  return TRAVEL_DISTANCE[key1] || TRAVEL_DISTANCE[key2] || TRAVEL_DISTANCE.default;
}
window.getTravelDistance = getTravelDistance;

// [버그 수정] "여행 지도"(openOverworldMap/confirmTravel)는 도보 이동 화면인데도
// TRAVEL_DISTANCE 표가 거리 1(도보 무료 조건) 이하로 잡히는 조합이 사실상
// 'hamlet-village' 하나뿐이라, 마을·도시·수도 이동이 전부 유료로 나왔다.
// "그냥 걷는 것도 돈이 드는 게 이상하다"는 지적이 정확했다 — 실제로 말/마차/
// 배 같은 유료 이동수단은 misc/054(TRANSPORT_CONFIG·openTransportPanel·
// travelByTransport)에 이미 완성돼 있고, 속도(speedMult)와 위험도
// (encounterMult) 이점을 제공하는 진짜 "탈것 대여" 시스템이다. 도보 이동인
// 이 지도에서는 항상 무료로 통일하고, 유료 이동수단은 지도 화면에서 그
// 기존 시스템으로 넘어갈 수 있게 버튼만 추가한다(아래 buildOverworldMapHTML).
export function getTravelCost(fromLoc, toLoc){
  return 0;
}
window.getTravelCost = getTravelCost;

export function getTravelRisk(fromLoc, toLoc){
  const danger = toLoc.dangerLevel || 0;
  if(danger >= 5) return { label:'극위험', color:'#c0303a', icon:'☠️' };
  if(danger >= 4) return { label:'매우위험', color:'#c05030', icon:'💀' };
  if(danger >= 3) return { label:'위험',   color:'#a07020', icon:'⚠️' };
  if(danger >= 2) return { label:'주의',   color:'#707020', icon:'❗' };
  return             { label:'안전',   color:'#3a8a3a', icon:'✅' };
}
window.getTravelRisk = getTravelRisk;

export function getTravelTimeLabel(dist){
  if(dist <= 1) return '가까움 (~1시간)';
  if(dist <= 2) return '반나절 (~4시간)';
  if(dist <= 3) return '하루 (~8시간)';
  if(dist <= 4) return '이틀 (~2일)';
  return '장거리 ('+dist+'일 이상)';
}
window.getTravelTimeLabel = getTravelTimeLabel;

// [버그 수정] 여행 지도(도보 이동 목록)가 window.getAllLocations()만 읽어서
// AI가 그때그때 만들어낸 장소(loadAILocations, ai_loc_* — 카드에는 이미
// "✨AI" 태그까지 붙게 만들어져 있었다)는 이 목록에 단 한 번도 뜬 적이
// 없었다. "모든 맵을 구석구석 가보고 싶다"는 요청대로 AI가 만든 장소까지
// 포함한 전체 장소 풀을 노출한다. confirmTravel()의 조회도 반드시 같은
// 풀을 써야 한다 — 그렇지 않으면 목록엔 뜨는데 클릭하면 "장소를 찾을 수
// 없습니다"로 실패하는, 처음 지적받았던 것과 똑같은 증상이 재발한다.
export function getAllTravelableLocations(){
  const fixed = (typeof window.getAllLocations==='function') ? window.getAllLocations() : [];
  const ai    = loadAILocations();
  return [...fixed, ...ai];
}
window.getAllTravelableLocations = getAllTravelableLocations;

// [10차] "이미 가본 곳"으로 되돌아가는 빠른 이동(게시판/정치지도 버튼,
// misc/053의 moveToLocation)도 순간이동이 아니라 실제 여행으로 통일한다.
// 목적지만 고르면 최단 경로(도로망 다익스트라, findRoadRoute)로 자동
// 이동하고, 지금 타고 있는 탑승 수단(S._activeTransport)이 있으면 그
// 속도를 그대로 이어받는다 — 이미 가본 길이니 "자동 이동"이라 부를 만하다.
// 현재 위치가 아예 감지 안 된 극초반이거나 해안/초자연 realm처럼 도보
// 여정이 성립하지 않는 목적지일 때만 기존 즉시 이동으로 안전하게 대체한다.
export function beginJourneyTo(destName){
  const cur  = window.currentLocation || loadCurrentLocation();
  const dest = getAllTravelableLocations().find(l=>l.name===destName);
  if(!dest){ toast('장소를 찾을 수 없습니다', 1500); return; }
  const canRealJourney = !!cur && !dest.coastal
    && !NON_PHYSICAL_TRAVEL_CONTINENTS.has(dest.continent)
    && typeof window.startLandTravel==='function';
  if(canRealJourney){
    window.startLandTravel(dest.name, S._activeTransport || 'walk');
  } else if(typeof window.moveToLocation==='function'){
    window.moveToLocation(destName);
  }
}
window.beginJourneyTo = beginJourneyTo;

export function getReachableLocations(fromLoc){
  const allLocs = getAllTravelableLocations();
  const visited = loadLocations();
  const visitedNames = new Set(visited.map(v=>v.name));

  return allLocs
    .filter(loc => loc.id !== fromLoc?.id)
    .map(loc => {
      const dist     = getTravelDistance(fromLoc?.type||'default', loc.type||'default');
      const cost     = getTravelCost(fromLoc, loc);
      const risk     = getTravelRisk(fromLoc, loc);
      const isVisited= visitedNames.has(loc.name);
      const canAfford= (S.gold||0) >= cost;
      // [10차] 해안 지역은 배가 있어야 갈 수 있다 — 도보로는 못 감.
      // 천상/지옥처럼 도로가 없는 realm은 애초에 "며칠 걸어서 간다"가
      // 성립하지 않아 즉시 이동(confirmTravel의 _instantRelocate 분기)
      // 대상이다 — 카드에도 도보 일수 대신 "즉시 이동"으로 표시한다.
      const isWalkable = !loc.coastal;
      const isInstant  = isWalkable && (loc.continent==='celestial' || loc.continent==='infernal');
      const estDays = (isWalkable && !isInstant && typeof window.getTravelDays==='function')
        ? window.getTravelDays(loc, 'walk') : null;
      return { ...loc, dist, cost, risk, isVisited, canAfford, isWalkable, isInstant, estDays };
    })
    .sort((a,b) => a.dist - b.dist || a.name.localeCompare(b.name));
}
window.getReachableLocations = getReachableLocations;

export function buildOverworldMapHTML(fromLoc){
  const locs      = getReachableLocations(fromLoc);
  // [B-fix] getWeatherForecast()는 'clear'/'rain' 같은 원시 문자열 배열을
  // 반환하는데(quest/086), 이 함수는 그걸 {icon,weather,eff} 객체로
  // 착각하고 weather.eff.split('—')를 호출해 항상 예외가 나고 있었다 —
  // 세계지도를 열 때마다 발생해서, 지도 자체가 아예 안 열리는 버그였다.
  // WEATHER_EFFECTS로 실제 아이콘·라벨을 조회하도록 고친다.
  const weatherRaw = typeof getWeatherForecast==='function' ? getWeatherForecast()[0] : null;
  const weather   = weatherRaw ? (WEATHER_EFFECTS[weatherRaw] || WEATHER_EFFECTS.none) : null;
  const curGold   = S.gold || 0;
  const fromName  = fromLoc?.name || '현재 위치';
  const fromIcon  = fromLoc?.icon || '📍';
  const isLight   = document.body.classList.contains('light-mode');

  // 라이트/다크 팔레트
  const lm = isLight;
  const bg0        = lm ? 'rgba(255,255,255,.92)' : 'rgba(0,0,0,.85)';
  const bgHeader   = lm ? '#fdf5e8'               : '#050200';
  const bgFilter   = lm ? '#f5e8d0'               : '#080500';
  const bgBody     = lm ? '#faf0e0'               : 'transparent';
  const bgCard     = lm ? '#f5e8d0'               : '#0d0800';
  const bgBtn      = lm ? '#e8d8b8'               : '#0d0800';
  const borderHdr  = lm ? '#c0a060'               : 'var(--border)';
  const borderGrp  = lm ? '#d4b880'               : '#1a1005';
  const textDim    = lm ? '#7a5a30'               : 'var(--dim)';
  const filterAct  = lm ? '#d4a050'               : '#1a1005';
  const filterInact= lm ? '#e8d8b8'               : '#0d0800';
  const cancelTxt  = lm ? '#7a5030'               : '#5a4a2a';
  const cancelBrd  = lm ? '#c0a060'               : '#3a2a0a';
  const cancelBg   = lm ? '#e8d8b8'               : '#0d0800';

  // 타입별 그룹핑
  const groups = {
    '🏙️ 마을·도시': locs.filter(l=>/capital|city|town|village|hamlet|settlement|port/.test(l.type)),
    '⚔️ 던전·탐험': locs.filter(l=>/dungeon|cave|ruins|event/.test(l.type)),
    '🌿 자연·특수': locs.filter(l=>/shrine|special|forest|mountain|wilderness/.test(l.type) || !/capital|city|town|village|hamlet|settlement|port|dungeon|cave|ruins|event/.test(l.type)),
  };

  let html = `
  <div id="overworld-map-ov" style="
    position:fixed;inset:0;background:${bg0};z-index:9999;
    display:flex;flex-direction:column;overflow:hidden;
    animation:fadeIn .25s ease;
  ">
    <!-- 헤더 -->
    <div style="padding:14px 18px 11px;background:${bgHeader};border-bottom:2px solid var(--gold);flex-shrink:0">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="font-size:26px">🗺️</span>
        <div style="flex:1">
          <div style="font-family:Cinzel,serif;font-size:15px;color:var(--gold);letter-spacing:2px">여행 지도</div>
          <div style="font-size:12px;color:${textDim}">${fromIcon} ${esc(fromName)} 에서 출발</div>
        </div>
        <button onclick="closeOverworldMap()" style="background:none;border:1px solid ${borderHdr};color:${textDim};width:32px;height:32px;font-size:16px;cursor:pointer;flex-shrink:0">✕</button>
      </div>
      <!-- 현황 바 -->
      <div style="display:flex;gap:10px;font-size:12px;font-family:Cinzel,serif">
        <span style="color:#c08820">💰 ${curGold}G</span>
        ${weather?`<span style="color:${textDim}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(weather,{size:16}):(weather.icon)} ${weather.label}</span>`:''}
        <span style="color:${textDim};margin-left:auto">장소 선택 후 이동</span>
      </div>
    </div>

    <!-- 필터 탭 -->
    <div style="display:flex;gap:0;padding:7px 12px;background:${bgFilter};border-bottom:1px solid var(--border);flex-shrink:0;overflow-x:auto" id="ow-filter-row">
      <button class="ow-filter-btn act" onclick="owFilter('all',this)" style="padding:6px 14px;font-size:11px;font-family:Cinzel,serif;background:${filterAct};border:1px solid var(--gold);color:var(--gold);cursor:pointer;flex-shrink:0;margin-right:4px">전체</button>
      <button class="ow-filter-btn" onclick="owFilter('visited',this)" style="padding:6px 14px;font-size:11px;font-family:Cinzel,serif;background:${filterInact};border:1px solid var(--border);color:${textDim};cursor:pointer;flex-shrink:0;margin-right:4px">방문함</button>
      <button class="ow-filter-btn" onclick="owFilter('unvisited',this)" style="padding:6px 14px;font-size:11px;font-family:Cinzel,serif;background:${filterInact};border:1px solid var(--border);color:${textDim};cursor:pointer;flex-shrink:0;margin-right:4px">미방문</button>
      <button class="ow-filter-btn" onclick="owFilter('affordable',this)" style="padding:6px 14px;font-size:11px;font-family:Cinzel,serif;background:${filterInact};border:1px solid var(--border);color:${textDim};cursor:pointer;flex-shrink:0">💰가능</button>
    </div>

    <!-- 장소 목록 (스크롤) -->
    <div id="ow-loc-list" style="flex:1;overflow-y:auto;padding:10px 12px;background:${bgBody}">
      ${Object.entries(groups).filter(([,v])=>v.length>0).map(([cat,catLocs])=>`
        <div class="ow-group" style="margin-bottom:14px">
          <div style="font-family:Cinzel,serif;font-size:12px;color:${textDim};letter-spacing:1px;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid ${borderGrp}">${cat} (${catLocs.length})</div>
          ${catLocs.map(loc => buildLocCard(loc, fromLoc, isLight)).join('')}
        </div>`).join('')}
    </div>

    <!-- 하단: 머물기 옵션 -->
    <div style="padding:10px 12px;background:${bgHeader};border-top:1px solid var(--border);flex-shrink:0;display:flex;gap:6px">
      <button onclick="stayAtCurrentLocation()" style="flex:1;padding:11px;background:${bgBtn};border:1px solid var(--border);color:${textDim};font-family:Cinzel,serif;font-size:12px;cursor:pointer;letter-spacing:.5px">
        📍 ${esc(fromName)}에 머물기
      </button>
      <button onclick="closeOverworldMap(); window.openP('location'); renderLocationPanel();" style="padding:11px 12px;background:${bgBtn};border:1px solid ${borderHdr};color:var(--gold);font-family:Cinzel,serif;font-size:11px;cursor:pointer;white-space:nowrap">
        🚀 이동수단 대여
      </button>
      <button onclick="closeOverworldMap()" style="padding:11px 16px;background:${cancelBg};border:1px solid ${cancelBrd};color:${cancelTxt};font-family:Cinzel,serif;font-size:12px;cursor:pointer">
        취소
      </button>
    </div>
  </div>`;
  return html;
}
window.buildOverworldMapHTML = buildOverworldMapHTML;

export function buildLocCard(loc, fromLoc, isLight){
  if(isLight === undefined) isLight = document.body.classList.contains('light-mode');
  // [10차] "이동 가능" 여부에서 골드 여유(canAfford, 어차피 비용은 항상 0)뿐
  // 아니라 걸어서 갈 수 있는 곳인지(isWalkable — 해안 지역은 배가 필요)도
  // 같이 따진다.
  const isAffordable = loc.canAfford && loc.isWalkable;
  const typeLabel = {
    capital:'🏰 수도', city:'🏙️ 도시', town:'🏘️ 중소도시',
    village:'🏚️ 마을', hamlet:'🛖 소촌', dungeon:'🗝️ 던전',
    shrine:'⛩️ 성소', event:'⚔️ 이벤트', special:'✨ 특수',
    port:'⚓ 항구', wilderness:'🌾 황야'
  }[loc.type] || loc.type;

  const distBar = '●'.repeat(Math.min(loc.dist,5)) + '○'.repeat(Math.max(0,5-loc.dist));
  const aiTag   = loc.aiGenerated ? `<span style="font-size:10px;color:#7a5a9a;margin-left:4px">✨AI</span>` : '';
  const visitedTag = loc.isVisited
    ? `<span style="font-size:10px;color:${isLight?'#3a8a3a':'#5a9a5a'};background:${isLight?'#d8f0d8':'#0a1a0a'};padding:2px 6px;border-radius:2px">방문함</span>`
    : `<span style="font-size:10px;color:${isLight?'#7a6a9a':'#5a5a7a'};background:${isLight?'#e8e0f0':'#0a0a1a'};padding:2px 6px;border-radius:2px">미방문</span>`;

  const cardStyle = isAffordable
    ? isLight ? 'background:#fdf5e8;border:1px solid #c8a860' : 'background:#0d0800;border:1px solid #2a2010'
    : isLight ? 'background:#f0e8d8;border:1px solid #d4c090;opacity:.65' : 'background:#080500;border:1px solid #1a1208;opacity:.65';

  const nameColor   = isAffordable ? 'var(--gold)' : (isLight ? '#9a8060' : '#5a4a2a');
  const dimColor    = isLight ? '#7a5a30' : 'var(--dim)';
  const distColor   = isLight ? '#8a7050' : '#5a6a5a';
  const costColor   = isAffordable ? (isLight ? '#a07020' : '#d4a030') : (isLight ? '#9a6040' : '#6a4020');
  const btnBg       = isLight ? 'linear-gradient(135deg,#e8d0a0,#d4b870)' : 'linear-gradient(135deg,#2a1f0d,#3a2a10)';
  const noBg        = isLight ? '#f0e0c0' : '#0a0500';
  const noBrd       = isLight ? '#c8a860' : '#1a1005';
  const noTxt       = isLight ? '#9a6040' : '#4a3020';

  return `
  <div class="ow-loc-card" data-visited="${loc.isVisited}" data-affordable="${isAffordable}" style="${cardStyle};margin-bottom:7px;border-radius:3px;overflow:hidden">
    <div style="display:flex;align-items:flex-start;gap:10px;padding:11px 13px">
      <span style="font-size:26px;flex-shrink:0;margin-top:1px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:26}):loc.icon}</span>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;flex-wrap:wrap">
          <span style="font-family:Cinzel,serif;font-size:13px;color:${nameColor}">${esc(loc.name)}</span>
          ${aiTag}
          ${visitedTag}
        </div>
        <div style="font-size:11px;color:${dimColor};margin-bottom:5px">${typeLabel}</div>
        <div style="font-size:12px;color:${dimColor};line-height:1.5;margin-bottom:7px">${esc((loc.desc||'').slice(0,80))}${(loc.desc||'').length>80?'…':''}</div>
        <!-- 메타 정보 -->
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="font-size:11px;color:${distColor};letter-spacing:.5px" title="거리">${distBar} ${getTravelTimeLabel(loc.dist)}</span>
          <span style="font-size:12px;color:${loc.risk.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc.risk,{size:12}):(loc.risk.icon)} ${loc.risk.label}</span>
          ${loc.isInstant
            ? `<span style="font-size:12px;color:${isLight?'#7a4a9a':'#a070d0'}">✨ 즉시 이동</span>`
            : loc.isWalkable
              ? `<span style="font-size:12px;color:${isLight?'#3a8a3a':'#4a8a4a'}">🚶 도보 약 ${loc.estDays||'?'}일</span>`
              : `<span style="font-size:12px;color:${isLight?'#3a6a9a':'#4a8ac0'}">⚓ 배로만 이동 가능</span>`}
        </div>
      </div>
    </div>
    <!-- 이동 버튼 -->
    <div style="padding:0 13px 10px">
      ${isAffordable
        ? `<button onclick="confirmTravel('${esc(loc.id)}')" style="width:100%;padding:10px;background:${btnBg};border:1px solid var(--gold);color:var(--gold);font-family:Cinzel,serif;font-size:12px;cursor:pointer;letter-spacing:.5px">
            → ${esc(loc.name)} 로 ${loc.isInstant?'즉시 이동':'떠나기 (약 '+(loc.estDays||'?')+'일)'}
           </button>`
        : loc.isWalkable
          ? `<div style="padding:8px;background:${noBg};border:1px solid ${noBrd};text-align:center;font-size:11px;color:${noTxt}">💰 골드 부족 (${loc.cost}G 필요)</div>`
          : `<button onclick="closeOverworldMap();window.openP&&window.openP('voyage');window.renderVoyagePanel&&window.renderVoyagePanel();" style="width:100%;padding:10px;background:${noBg};border:1px solid #3a6a9a;color:#4a8ac0;font-family:Cinzel,serif;font-size:11px;cursor:pointer">
              ⚓ 항해 지도에서 배 타러 가기
             </button>`
      }
    </div>
  </div>`;
}
window.buildLocCard = buildLocCard;

window.owFilter = function(type, btn){
  const lm = document.body.classList.contains('light-mode');
  document.querySelectorAll('.ow-filter-btn').forEach(b=>{
    b.style.background = lm ? '#e8d8b8' : '#0d0800';
    b.style.borderColor = 'var(--border)';
    b.style.color = lm ? '#7a5a30' : 'var(--dim)';
  });
  btn.style.background = lm ? '#d4a050' : '#1a1005';
  btn.style.borderColor = 'var(--gold)';
  btn.style.color = 'var(--gold)';

  document.querySelectorAll('.ow-loc-card').forEach(card=>{
    const visited    = card.dataset.visited==='true';
    const affordable = card.dataset.affordable==='true';
    let show = true;
    if(type==='visited')    show = visited;
    if(type==='unvisited')  show = !visited;
    if(type==='affordable') show = affordable;
    card.closest('.ow-loc-card').style.display = show ? '' : 'none';

    // 그룹 헤더 숨기기 (하위 카드 전부 숨겨지면)
    const group = card.closest('.ow-group');
    if(group){
      const anyVisible = [...group.querySelectorAll('.ow-loc-card')].some(c=>c.style.display!=='none');
      group.style.display = anyVisible ? '' : 'none';
    }
  });
};

// [10차 수정] "여행 지도"는 예전엔 클릭 즉시 그 자리에서 순간이동시키는
// 목록이었다 — 실제로 존재하는 여행 시뮬레이션(startLandTravel이 도로망
// 경로를 계산해 여행을 시작하면, 매 턴 자동으로 실행되는 tickLandTravel이
// 날짜를 줄이고 도중에 진짜 조우 이벤트도 일으키는 시스템, 이미 코드에
// 있었지만 이 순간이동 목록에 가려 실제로는 아무도 안 타던 경로였다)를
// 타는 게 자연스럽다. 순간이동은 두 가지 예외만 남긴다: ① 해안 지역(배가
// 있어야 갈 수 있음 — 항해 시스템으로 안내), ② 천상/지옥처럼 도로 자체가
// 없는 초자연적 realm(그런 곳에 "며칠 걸어서 간다"는 성립하지 않으므로
// 기존처럼 즉시 이동시킨다).
const NON_PHYSICAL_TRAVEL_CONTINENTS = new Set(['celestial','infernal']);

window.confirmTravel = function(locId){
  const allLocs = getAllTravelableLocations();
  const toLoc   = allLocs.find(l=>l.id===locId);
  if(!toLoc){ toast('장소를 찾을 수 없습니다', 1500); return; }

  if(toLoc.coastal){
    toast('⚓ 해안 지역입니다 — 항구에서 배를 타야 갈 수 있습니다', 2600);
    return;
  }

  // [F-BUG 수정] dangerLevel이 이동 시점에 전혀 활용되지 않던 문제 —
  // 이 함수가 실제로 플레이어가 "이동" 버튼을 눌러 타는 메인 경로이므로
  // 여기서 경고를 확인한다.
  if(typeof checkDangerLevelWarning==='function' && !checkDangerLevelWarning(toLoc)) return;

  if(NON_PHYSICAL_TRAVEL_CONTINENTS.has(toLoc.continent)){
    _instantRelocate(toLoc);
    return;
  }

  closeOverworldMap();
  if(typeof window.startLandTravel==='function'){
    window.startLandTravel(toLoc.name, 'walk');
  } else {
    toast('이동 시스템을 불러오지 못했습니다', 2000);
  }
};

// 도로가 없는 초자연적 realm 전용 즉시 이동 — 예전 confirmTravel의 순간이동
// 로직을 그대로 보존한 것. moveToLocation()과 달리 여기선 위험도 경고를
// 이미 위에서 확인했으므로 중복 확인하지 않는다.
function _instantRelocate(toLoc){
  const fromLoc = window.currentLocation || loadCurrentLocation();
  if(S._portalReady) S._portalReady = false;

  window.currentLocation = toLoc;
  saveCurrentLocation(toLoc);

  const visited = loadLocations();
  const alreadyVisited = visited.find(v=>v.name===toLoc.name);
  if(!alreadyVisited){
    visited.push({ name:toLoc.name, icon:toLoc.icon, visitedAt:new Date().toISOString(), turn:S.msgCount, aiGenerated:!!toLoc.aiGenerated });
    saveLocations(visited);
  }

  const log = loadTravelLog();
  log.push({
    from:       fromLoc ? { id:fromLoc.id, name:fromLoc.name, type:fromLoc.type } : null,
    to:         { id:toLoc.id, name:toLoc.name, type:toLoc.type, icon:toLoc.icon },
    cost:       0,
    dist:       getTravelDistance(fromLoc?.type||'default', toLoc.type||'default'),
    traveledAt: new Date().toISOString(),
    turn:       S.msgCount || 0,
    scenario:   S.scenario?.id || 'medieval',
    aiDest:     !!toLoc.aiGenerated,
  });
  saveTravelLog(log);

  if(typeof unlockAchievement==='function') unlockAchievement('travel');
  if(typeof saveDiaryEntry==='function')
    saveDiaryEntry('travel', `🗺️ ${fromLoc?.name||'출발지'} → ${toLoc.name}`, S.msgCount||0);
  if(toLoc.type==='dungeon' && typeof unlockAchievement==='function')
    unlockAchievement('enter_dungeon');

  closeOverworldMap();
  toastHTML(`🗺️ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(toLoc,{size:14}):(toLoc.icon)} ${esc(toLoc.name)} 으로 이동!`, 3000);
  _injectTravelMessage(fromLoc, toLoc, 0);

  setTimeout(()=>{
    if(typeof renderLocationPanel==='function') renderLocationPanel();
    if(typeof window.updateHeader==='function') window.updateHeader();
    updateMapTabState(toLoc);
  }, 400);

  setTimeout(()=>{
    if(typeof sendMsg==='function'){
      sendMsg(`${toLoc.icon} ${toLoc.name}에 도착해 주변을 둘러본다.`, false);
    }
  }, 600);

  if(typeof _scheduleExportSnapshot==='function') _scheduleExportSnapshot();
}
window._instantRelocate = _instantRelocate;

export function _injectTravelMessage(fromLoc, toLoc, cost){
  const msgs = document.getElementById('msgs');
  if(!msgs) return;

  const dist    = getTravelDistance(fromLoc?.type||'default', toLoc.type||'default');
  const timeStr = getTravelTimeLabel(dist);
  const risk    = getTravelRisk(fromLoc, toLoc);
  const weather = typeof getWeatherForecast==='function' ? getWeatherForecast()[0] : null;

  const narratives = [
    `${fromLoc?.icon||'📍'} ${fromLoc?.name||'출발지'}를 뒤로하고 ${toLoc.icon} **${toLoc.name}**을(를) 향해 발길을 옮겼다.`,
    `짐을 꾸려 ${toLoc.icon} **${toLoc.name}**으로 향하는 여정을 시작했다.`,
    `${toLoc.icon} **${toLoc.name}** — 다음 목적지는 정해졌다. 이제 출발이다.`,
  ];
  const narrative = narratives[Math.floor(Math.random()*narratives.length)];

  const div = document.createElement('div');
  div.className = 'msg-ai';
  div.innerHTML = `
    <div class="bubble" style="background:#0a0f0a;border-left:2px solid #3a6a3a;border-top:1px solid #1a3a1a">
      <div style="font-family:Cinzel,serif;font-size:9px;color:#4a8a4a;letter-spacing:1px;margin-bottom:5px">🗺️ 이동</div>
      <div style="font-size:12px;color:var(--text);line-height:1.7;margin-bottom:7px">${narrative.replace(/\*\*(.*?)\*\*/g,'<span style="color:var(--gold);font-family:Cinzel,serif">$1</span>')}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:9px;color:var(--dim)">
        <span>🕐 ${timeStr}</span>
        <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(risk,{size:16}):(risk.icon)} ${risk.label}</span>
        ${weather?`<span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(weather,{size:16}):(weather.icon)} ${weather.weather}</span>`:''}
        ${cost>0?`<span>💰 -${cost}G</span>`:''}
      </div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}
window._injectTravelMessage = _injectTravelMessage;

window.stayAtCurrentLocation = function(){
  closeOverworldMap();
  toast('📍 현재 위치에 머뭅니다', 1500);
};

window._owMapOpen = false;

window.openOverworldMap = function(fromLoc){
  if(window._owMapOpen) return;
  window._owMapOpen = true;
  const from = fromLoc || window.currentLocation || loadCurrentLocation();
  const ov = document.createElement('div');
  ov.id = 'ow-map-root';
  ov.innerHTML = buildOverworldMapHTML(from);
  document.body.appendChild(ov);
};

window.closeOverworldMap = function(){
  const el = document.getElementById('ow-map-root');
  if(el) el.remove();
  window._owMapOpen = false;
};

window._lastDepartureCheck = 0;

export function checkDeparture(aiText){
  if(!aiText) return;
  const now = Date.now();
  // 연속 감지 방지: 10초 이내 중복 차단
  if(now - window._lastDepartureCheck < 10000) return;

  const matched = DEPARTURE_PATTERNS.some(p => p.test(aiText));
  if(!matched) return;

  window._lastDepartureCheck = now;

  // 현재 특정 장소에 있을 때만 (야외 방랑 중엔 X)
  const fromLoc = window.currentLocation || loadCurrentLocation();
  // 밖으로 나간다면 지도 팝업
  setTimeout(()=>{
    openOverworldMap(fromLoc);
  }, 600); // AI 응답 렌더 후 잠시 기다려서 팝업
}
window.checkDeparture = checkDeparture;

export function checkPlayerTravelIntent(playerText){
  if(!playerText) return false;
  return PLAYER_TRAVEL_PATTERNS.some(p => p.test(playerText));
}
window.checkPlayerTravelIntent = checkPlayerTravelIntent;

(function hookSendButton(){
  setTimeout(()=>{
    const sendBtn = document.querySelector('.send-btn');
    const msgInp  = document.querySelector('.msg-inp');
    if(!sendBtn||!msgInp) return;

    const origSend = sendBtn.onclick;
    // keydown 훅
    msgInp.addEventListener('keydown', function(e){
      if(e.key==='Enter' && !e.shiftKey){
        if(checkPlayerTravelIntent(this.value)){
          e.preventDefault();
          openOverworldMap(window.currentLocation || loadCurrentLocation());
        }
      }
    });
  }, 2000);
})();

export function maybeInjectMapChoice(){
  const choices = document.querySelector('.choices');
  if(!choices) return;
  if(document.getElementById('choice-travel-map')) return;

  const allText = choices.innerText || '';
  const travelRelated = /이동|탐험|출발|여행|던전|마을|장소|어디/.test(allText);
  if(!travelRelated) return;

  const btn = document.createElement('button');
  btn.className = 'choice';
  btn.id = 'choice-travel-map';
  btn.style.cssText = 'border-color:#3a5a2a;color:#6a9a5a;font-family:Cinzel,serif;font-size:11px';
  btn.innerHTML = '🗺️ 여행 지도 펼치기 — 행선지 선택';
  btn.onclick = ()=>{ openOverworldMap(window.currentLocation || loadCurrentLocation()); };
  choices.appendChild(btn);
}
window.maybeInjectMapChoice = maybeInjectMapChoice;

export const _owObserver = new MutationObserver(()=>{ maybeInjectMapChoice(); });

setTimeout(()=>{
  const choicesEl = document.querySelector('.choices');
  if(choicesEl) _owObserver.observe(choicesEl, { childList:true, subtree:true });
  // 채팅 영역 전체도 관찰 (choices가 동적으로 생성되므로)
  const msgsEl = document.getElementById('msgs');
  if(msgsEl){
    const msgsObs = new MutationObserver(()=>{ setTimeout(maybeInjectMapChoice, 200); });
    msgsObs.observe(msgsEl, { childList:true, subtree:false });
  }
}, 2500);

console.log('[TaleForge] 🗺️ 오버월드 여행 지도 시스템 v1.1 로드 완료 (지도 탭 활성화 연동)');

window.checkDeparture     = checkDeparture;

window.updateMapTabState  = updateMapTabState;

window.isMapEligibleLocation = isMapEligibleLocation;

window.checkAndExpandWorld    = checkAndExpandWorld;

window.generateAILocation     = generateAILocation;

window.generateAIBulletinItems= generateAIBulletinItems;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_204(){
// [B-fix] 같은 클래스의 버그 — _origRenderBulletinBoard/_origDetectAndSetLocation가
// 예전엔 이 함수 밖(모듈 최상위, Pass 1)에서 캡처되어 있었다. 그 시점엔
// misc/053의 __tfDeferred_40(renderBulletinBoard 실제 구현)과 world/052의
// __tfDeferred_39(detectAndSetLocation 실제 구현)가 아직 실행 전이라 항상
// undefined를 캡처했다 — _origGetAllLocations와 동일한 원인의 버그.
// 이 배열 순서([...,_39,_40,...,_204,...])상 __tfDeferred_39/_40이 이
// 함수보다 먼저 실행되므로, 캡처를 이 함수 안으로 옮기면 실제 함수를 잡는다.
const _origRenderBulletinBoard = window.renderBulletinBoard;
const _origDetectAndSetLocation = window.detectAndSetLocation;
function _nqdAccept(){
  if(window._nqd.phase !== 'offered' || !window._nqd.quest) return;
  const q = window._nqd.quest;
  const npc = window._nqd.npc;

  _nqdAddMsg('알겠습니다. 반드시 해내겠습니다.', 'player');
  window._nqd.phase = 'accepted';

  // 잠깐 후 NPC 반응
  setTimeout(()=>{
    _nqdAddMsg(`"믿고 기다리겠소. 부디 무사히 돌아오시길."`, 'npc');
  }, 500);

  // 퀘스트 저장 (NPC 대화 퀘스트 전용 목록)
  const r = q.reward||{};
  const newQuest = {
    id:       'nqd_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),
    npcName:  npc.name,
    npcIcon:  npc.icon||'👤',
    npcRole:  npc.role||'',
    title:    q.title||'의뢰',
    icon:     q.icon||'📋',
    desc:     q.desc||'',
    type:     q.type||'fetch',
    difficulty: q.difficulty||'normal',
    reward:   r,
    completeKeywords: Array.isArray(q.completeKeywords)?q.completeKeywords:[],
    failKeywords:     Array.isArray(q.failKeywords)?q.failKeywords:[],
    lore:     q.lore||'',
    aiHint:   q.aiHint||'',
    status:   'active',
    acceptedAt: new Date().toISOString(),
    completedAt: null,
    failedAt:    null,
  };

  const all = loadNpcDlgQuests();
  all.push(newQuest);
  saveNpcDlgQuests(all);

  // NPC 관계도 소폭 상승
  if(typeof updateNpcRelationship==='function') updateNpcRelationship(npc.name, 5, '의뢰 수락');

  // 퀘스트 배지 갱신
  if(typeof updateQuestBadge==='function') updateQuestBadge();
  if(typeof toast==='function') toastHTML(`📜 [${esc(npc.name)}]의 의뢰 수락: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:14}):(q.icon)} ${esc(q.title)}`, 3500);

  // 액션 버튼 → 닫기만
  setTimeout(()=>{
    _nqdSetActions(`<button class="nqd-btn-close" style="flex:1;padding:10px" onclick="_closeNpcQuestDlg()">대화 종료</button>`);
  }, 1200);
}
window._nqdAccept = _nqdAccept;

window._nqdAccept         = window._nqdAccept;

// [B-fix] _origGetAllLocations was captured at plain module-top-level
// (`window.getAllLocations` at that point in Pass 1 is always undefined —
// the real getAllLocations only gets assigned by world/052's own deferred
// function in Pass 2, see the file-top comment on this deferred pattern).
// That meant this wrapper always crashed with "_origGetAllLocations is not
// a function" the moment it ran, silently breaking isLocationAlreadyKnown/
// generateAILocation and every other window.getAllLocations() caller in the
// game. Capturing it here instead — inside this same deferred function,
// which main.js runs in file order AFTER world/052's __tfDeferred_39 has
// already installed the real function — captures the correct one.
const _origGetAllLocations = window.getAllLocations;
window.getAllLocations = function(){
  const base = (typeof _origGetAllLocations==='function') ? _origGetAllLocations() : [];
  const ai   = loadAILocations();
  return [...base, ...ai];
};

function buildFullDataSnapshot(){
  return {
    exportedAt: new Date().toISOString(),
    version: '5.6.0',
    scenario: S.scenario?.id || 'medieval',
    // ── AI 생성 데이터 (핵심: 하드코딩 소스) ──
    ai_generated: {
      locations:        loadAILocations(),
      bulletin:         loadAIBulletin(),
      generation_log:   loadAIGenLog(),
      // ▼ 추가: 플레이 중 AI가 생성/등장시킨 모든 데이터
      items:            typeof loadDynBlueprints   === 'function' ? loadDynBlueprints()   : {},
      materials:        typeof loadDynMaterials    === 'function' ? loadDynMaterials()    : {},
      enemies:          typeof loadDynEnemies      === 'function' ? loadDynEnemies()      : {},
      npcs:             typeof loadDynNpcs         === 'function' ? loadDynNpcs()         : {},
      encounter_log:    typeof loadDynEncounters   === 'function' ? loadDynEncounters()   : [],
      quests:           typeof loadDynQuests       === 'function' ? loadDynQuests()       : [],
      dungeon_rooms:    (() => { try { return JSON.parse(lsGet('taleforge-dungeon-db') || 'null') || {}; } catch(e) { return {}; } })(),
      // [버그 수정] AI가 생성한 job 풀의 실제 저장 키는 job/042의
      // AI_JOB_POOL_KEY('tf-ai-job-pool')인데, 존재한 적 없는
      // 'tf-ai-jobs'를 읽고 있어 이 필드가 항상 빈 배열이었다.
      jobs:             (() => { try { return JSON.parse(lsGet('tf-ai-job-pool') || '{}'); } catch(e) { return {}; } })(),
      skills:           (() => { try { return JSON.parse(lsGet('tf-discovered-skills') || '[]'); } catch(e) { return []; } })(),
      // [버그 수정] 실제 세력 평판 저장 키는 npc/067의 FACTION_KEY
      // ('tf-factions')인데 존재한 적 없는 'taleforge-factions'를
      // 읽고 있어 항상 빈 배열이었다.
      factions:         (() => { try { return JSON.parse(lsGet('tf-factions') || '{}'); } catch(e) { return {}; } })(),
      // [버그 수정] 실제 세계 이벤트 상태 저장 키는 job/042의
      // WORLD_EVENT_KEY('tf-world-events')인데 존재한 적 없는
      // 'taleforge-world-events'를 읽고 있어 항상 빈 배열이었다.
      world_events:     (() => { try { return JSON.parse(lsGet('tf-world-events') || '{}'); } catch(e) { return {}; } })(),
      // [신규] 영구 보존 사실 + 해결된 떡밥 로그 — 둘 다 무제한 누적되는
      // 데이터로, "이 세계에서 실제로 일어난 사건"과 "떡밥이 어떻게
      // 풀렸는지"를 기록한 하드코딩 시나리오 원본 자료가 된다.
      permanent_facts:  typeof loadMemory === 'function' ? (loadMemory().facts || []) : [],
      resolved_hooks:   typeof loadResolvedHooks === 'function' ? loadResolvedHooks() : [],
    },
    // ── 기존 정적 데이터 (비교/검증용) ──
    static: {
      location_keys: window.getAllLocations().map(l=>({id:l.id,name:l.name,type:l.type,icon:l.icon})),
      bulletin_quest_count: typeof BULLETIN_QUEST_POOL!=='undefined' ? BULLETIN_QUEST_POOL.length : 0,
      bulletin_info_count:  typeof BULLETIN_INFO_POOL!=='undefined'  ? BULLETIN_INFO_POOL.length  : 0,
    },
    // ── 현재 플레이 세션 데이터 ──
    session: {
      visited_locations: loadLocations(),
      quests:      typeof loadQuests==='function'    ? loadQuests()    : [],
      npcs:        typeof loadNPCs==='function'      ? loadNPCs()      : [],
      npc_quests:  typeof loadNpcDlgQuests==='function' ? loadNpcDlgQuests() : [],
      bulletin_accepted: loadAcceptedBulletin(),
      reputation:  typeof loadReputation==='function' ? loadReputation() : {},
      diary:       typeof loadDiary==='function'     ? loadDiary()     : [],
      highlights:  typeof loadHighlights==='function'? loadHighlights(): [],
      achievements:typeof loadAchievements==='function'? loadAchievements():[],
      inventory:   S.inventory || [],
      gold:        S.gold || 0,
      character:   S.character || {},
      stats:       S.stats || {},
      npc_corruption: typeof loadNpcCorruption==='function' ? loadNpcCorruption() : {},
      demon_corruption: typeof loadDemonCorruption==='function' ? loadDemonCorruption() : {},
      demon_contracts: typeof loadDemonContracts==='function' ? loadDemonContracts() : {},
      demon_truename:  typeof loadDemonTrueName==='function'  ? loadDemonTrueName()  : {},
      beast_packbond:  typeof loadBeastPackBond==='function'  ? loadBeastPackBond()  : {},
      beast_lineage:   typeof loadBeastLineage==='function'   ? loadBeastLineage()   : {},
      orc_bloodvow:    typeof loadOrcBloodVow==='function'    ? loadOrcBloodVow()    : {},
      orc_council:     typeof loadOrcCouncil==='function'     ? loadOrcCouncil()     : {},
      dwarf_grudge:    typeof loadDwarfGrudge==='function'    ? loadDwarfGrudge()    : {},
      dwarf_unfinished:typeof loadDwarfUnfinished==='function'? loadDwarfUnfinished(): {},
      elf_forgetting:  typeof loadElfForgetting==='function'  ? loadElfForgetting()  : {},
      elf_emotion:     typeof loadElfEmotion==='function'     ? loadElfEmotion()     : {},
      human_legacy:    typeof loadHumanLegacy==='function'    ? loadHumanLegacy()    : {},
      human_stigma:    typeof loadHumanStigma==='function'    ? loadHumanStigma()    : {},
      // [F-누락 수정] 대장장이 확장 시스템 — 구조화된 필드로 명시 추출
      // (raw dump에도 포함되지만, 하드코딩 작업 시 바로 쓸 수 있도록 이중 보장)
      workshop:         typeof loadWorkshop==='function'       ? loadWorkshop()       : null,
      mining_log:       typeof loadMiningLog==='function'      ? loadMiningLog()      : {count:0,lastSite:null},
      hidden_quests:    typeof loadHiddenQuests==='function'   ? loadHiddenQuests()   : {},
      item_dissonance:  typeof loadItemDissonance==='function' ? loadItemDissonance() : 0,
      rc_points:        typeof loadRCPoints==='function'       ? loadRCPoints()       : 0,
      rc_unlocked:      typeof loadRCUnlocked==='function'     ? loadRCUnlocked()     : [],
      blueprints_owned: typeof loadBlueprints==='function'     ? loadBlueprints()     : [],
      // [신규] 음유시인 확장 시스템 — 구조화된 필드로 명시 추출
      network:          typeof loadNetwork==='function'        ? loadNetwork()        : null,
      tale_log:         typeof loadTaleLog==='function'        ? loadTaleLog()        : {count:0,lastSite:null},
      tale_materials:   typeof loadTaleMaterials==='function'  ? loadTaleMaterials()  : {},
      known_songs:      typeof loadKnownSongs==='function'     ? loadKnownSongs()     : [],
      // [신규] 치유사 확장 시스템 — 구조화된 필드로 명시 추출
      remedy_log:       typeof loadRemedyLog==='function'       ? loadRemedyLog()      : {count:0,lastSite:null},
      remedy_materials: typeof loadRemedyMaterials==='function' ? loadRemedyMaterials(): {},
      known_remedies:   typeof loadKnownRemedies==='function'   ? loadKnownRemedies()  : [],
      // [신규] 상인 확장 시스템 — 구조화된 필드로 명시 추출
      intel_log:        typeof loadIntelLog==='function'        ? loadIntelLog()       : {count:0,lastSite:null},
      intel_materials:  typeof loadIntelMaterials==='function'  ? loadIntelMaterials() : {},
      known_deals:      typeof loadKnownDeals==='function'      ? loadKnownDeals()     : [],
      // [신규] 연금술사 확장 시스템 — 구조화된 필드로 명시 추출
      alchemy_exped_log:       typeof loadAlchemyExpedLog==='function'       ? loadAlchemyExpedLog()       : {count:0,lastSite:null},
      alchemy_exped_materials: typeof loadAlchemyExpedMaterials==='function' ? loadAlchemyExpedMaterials() : {},
      known_formulas:          typeof loadKnownFormulas==='function'        ? loadKnownFormulas()         : [],
      // [F-누락 수정] 묘역/사자의 안내인 시스템 — 구조화된 필드로 명시 추출
      graveyard:        typeof loadGraveyard==='function'         ? loadGraveyard()      : null,
      // [신규] 학자 확장 시스템 — 구조화된 필드로 명시 추출
      scholar_research_log:   typeof loadScholarResearchLog==='function' ? loadScholarResearchLog() : {count:0},
      discovered_hidden_locs: (()=>{ try{ return JSON.parse(lsGet('tf-discovered-hidden-locs')||'[]'); }catch(e){ return []; } })(),
      permanent_unlocked_locs: (()=>{ try{ return JSON.parse(lsGet('tf-permanent-unlocked-locs')||'[]'); }catch(e){ return []; } })(),
      // [신규] 장소별 몬스터 풀 — 구조화된 필드로 명시 추출
      location_monster_pools: typeof loadLocationMonsterPools==='function' ? loadLocationMonsterPools() : {},
      titles:           typeof loadTitles==='function'         ? loadTitles()         : [],
    },
    // ── GS 태그로 수집된 하드코딩용 마스터 데이터 ──
    hardcoding_data: {
      monsters:       (() => { try { return JSON.parse(lsGet('tf-discovered-monsters') || '[]'); } catch(e) { return []; } })(),
      // [버그 수정] 실제 방문 장소 저장 키는 misc/221의 EXPLORED_KEY
      // ('tf-explored-locations')인데 여기서는 존재한 적 없는
      // 'tf-visited-locations'를 읽고 있어 이 익스포트 필드가 항상
      // 빈 배열이었다(전수조사로 발견).
      visited_locs:   (() => { try { return JSON.parse(lsGet('tf-explored-locations') || '[]'); } catch(e) { return []; } })(),
      npc_dialogues:  (() => { try { return JSON.parse(lsGet('tf-npc-dialogues') || '[]'); } catch(e) { return []; } })(),
      skills:         (() => { try { return JSON.parse(lsGet('tf-discovered-skills') || '[]'); } catch(e) { return []; } })(),
      lore:           (() => { try { return JSON.parse(lsGet('tf-lore-database') || '[]'); } catch(e) { return []; } })(),
      world_events:   (() => { try { return JSON.parse(lsGet('tf-world-events-log') || '[]'); } catch(e) { return []; } })(),
      quest_db:       (() => { try { return JSON.parse(lsGet('tf-quest-database') || '[]'); } catch(e) { return []; } })(),
      master_playlog: (() => { try { return JSON.parse(lsGet('tf-master-playlog') || '[]'); } catch(e) { return []; } })(),
      scene_stats:    (() => { try { return JSON.parse(lsGet('tf-scene-stats') || '{}'); } catch(e) { return {}; } })(),
      // [버그 수정] 실제 타임라인 저장 키는 combat/188의 TIMELINE_KEY
      // ('tf-timeline-v2')인데 구버전 이름 'tf-timeline'을 읽고 있어
      // 항상 빈 배열이었다.
      timeline:       (() => { try { return JSON.parse(lsGet('tf-timeline-v2') || '[]'); } catch(e) { return []; } })(),
      // [버그 수정] 실제로 기록되는(이번 전수조사에서 새로 연결한) 키는
      // 'taleforge-quest-history'다. 'tf-quest-history'는 아무도 쓰지
      // 않는 키였다.
      quest_history:  (() => { try { return JSON.parse(lsGet('taleforge-quest-history') || '[]'); } catch(e) { return []; } })(),
    },
    // ── [추가] 서사 원문 전체 로그 (gs 성공/실패 무관하게 모든 턴 저장) ──
    narrative_log: (() => { try { return JSON.parse(lsGet('tf-narrative-log') || '[]'); } catch(e) { return []; } })(),
    // ── [추가] gs 태그 실패 턴 보조 파싱 결과 ──
    gs_fallback: {
      failed_turns:    (() => { try { return JSON.parse(lsGet('tf-gs-failed-turns') || '[]'); } catch(e) { return []; } })(),
      fallback_locs:   (() => { try { return JSON.parse(lsGet('tf-fallback-locations') || '[]'); } catch(e) { return []; } })(),
      fallback_parse_log: (() => { try { return JSON.parse(lsGet('tf-fallback-parse-log') || '[]'); } catch(e) { return []; } })(),
    },
    // ── [추가] 전체 localStorage 전수 덤프 (누락 방지 완전 백업) ──
    full_storage_dump: (() => {
      const dump = {};
      const ALL_KEYS = [
        'taleforge-session','taleforge-worldnotes','taleforge-bulletin','taleforge-atmosphere',
        'taleforge-pastlife','taleforge-emotion','taleforge-gold','taleforge-inventory',
        'tf-set-bonus','tf-reinc-craft-points','tf-reinc-craft-unlocked','tf-dynamic-blueprints',
        'tf-save-version','taleforge-clearrewards','taleforge-exp','taleforge-secrets',
        'taleforge-highlights','taleforge-memory','tf-legacy-titles','taleforge-memfrags',
        'taleforge-pastrelics','taleforge-artifactshards','taleforge-famelegacy',
        'taleforge-cyclecount','taleforge-butterfly','taleforge-hiddenending',
        'taleforge-deathbonus','taleforge-trauma','taleforge-lastword','taleforge-metaknowledge',
        'taleforge-bloodline','taleforge-fatevariable','taleforge-exploredmaps',
        'taleforge-rellegacy','taleforge-worldsecrets','taleforge-abilityimprint',
        'taleforge-grudge','taleforge-timeecho','taleforge-fatechoices','taleforge-divinegaze',
        'taleforge-curselineage','taleforge-pastprayer','taleforge-wheeloffate',
        'taleforge-parallelself','taleforge-cursering','taleforge-injurymarks',
        'taleforge-pasttheme','taleforge-memorydistort','taleforge-ageparadox',
        'taleforge-summonlegacy','taleforge-worldtree','taleforge-dream-prophecy',
        'taleforge-legacy-building','taleforge-watcher','taleforge-soul-mask',
        'taleforge-emotion-ripple','taleforge-testament','taleforge-constellation',
        'taleforge-explorer-map','taleforge-lightning-imprint',
        'taleforge-kingdom','taleforge-loopers-guild','taleforge-death-dealer',
        'taleforge-role-reversal','taleforge-world-will','taleforge-death-eye',
        'taleforge-soul-frequency','taleforge-sealed-god','taleforge-natural-law',
        'taleforge-forge','taleforge-cycle-goal','taleforge-betrayal','taleforge-affinity',
        'taleforge-villain-growth','taleforge-annals','taleforge-bulletin-accepted',
        'tf-factions','tf-world-events','tf-ai-job-pool','taleforge-dungeon-db',
        'taleforge-watcher-gaze','taleforge-npcs','taleforge-npc-dialogues',
        'taleforge-quests','taleforge-main-quest-state','taleforge-diary',
        'taleforge-quest-history',
        'tf-current-location','tf-party','tf-owned-relics','tf-locations',
        'tf-reputation','tf-endings','tf-continent-rep','tf-choice-history',
        'tf-war-action','tf-economy','tf-world-reactions','tf-crafted',
        'tf-blueprints','tf-materials','tf-achievements','tf-saves',
        'tf-unification','tf-battle-log','tf-jail','tf-academy','tf-timeline-v2',
        'tf-prev-narrations','tf-game-time','tf-explored-locations','tf-world-fame',
        'tf-evo-shards','tf-evo-energy','tf-evo-conditions','tf-gs-flags',
        'tf-true-ending','tf-watcher-reveal','tf-twin-encounter','tf-sol-progress',
        'tf-sol-hint-log','tf-imprint-current','tf-imprint-echoes','tf-imprint-history',
        'tf-wanderer-memory-pick','tf-ai-settings','tf-plothook',
        'tf-ai-jobs','tf-discovered-skills','tf-discovered-monsters','tf-visited-locations',
        'tf-npc-dialogues','tf-lore-database','tf-world-events-log','tf-quest-database',
        'tf-master-playlog','tf-scene-stats','tf-gs-failed-turns','tf-fallback-locations',
        'tf-fallback-parse-log','tf-narrative-log','tf-ai-gen-log','tf-ai-locations',
        'tf-bulletin','tf-npc-quests','tf-dynamic-enemies','tf-dynamic-npcs',
        'tf-dynamic-encounters','tf-dynamic-quests','tf-ai-location-export',
        'tf-dungeon-session','tf-dungeon-state','tf-stat-points','tf-player-level',
        'tf-status-effects','tf-titles','tf-epic-state','tf-hidden-quests',
        'tf-dynamic-materials','tf-job-mastery','tf-job-turns','tf-combat-log',
        'tf-faction-state','tf-world-state','tf-boss-state','tf-npc-corruption',
        'tf-demon-corruption','tf-demon-contract','tf-demon-truename','tf-evolution','tf-fired-events',
        'tf-quest-log-history','tf-gs-flags','tf-affinity-data',
        'taleforge-grudge-weapons','taleforge-survival-companions','taleforge-alias-list',
        'tf-beast-packbond','tf-beast-lineage',
        'tf-orc-bloodvow','tf-orc-council',
        'tf-dwarf-grudge','tf-dwarf-unfinished',
        'tf-elf-forgetting','tf-elf-emotion',
        'tf-human-legacy','tf-human-stigma',
        'taleforge-pet-legacy','taleforge-rivals','taleforge-romance-legacy',
        'taleforge-identity-vault','taleforge-sin-redemption','taleforge-language-memories',
        'taleforge-war-scars','taleforge-divine-contracts',
        // [F-누락 수정] 대장장이 확장(채광/원정/히든퀘스트) + 장비 정체성 부조화 시스템
        // — 신설 당시 전수 백업 목록에서 빠져 있던 키들. 하드코딩 소스 추출 시
        // 반드시 포함되어야 하는 무제한 누적 데이터.
        'tf-workshop','tf-mining-log','taleforge-hidden-quests',
        'tf-item-dissonance','tf-dissonance-stat-applied',
        // [신규] 음유시인 확장(이야기 채집/곡조/불멸의 노래) 시스템 키
        'tf-network','tf-tale-gathering-log','tf-tale-materials','tf-known-songs',
        // [신규] 치유사 확장(왕진/처방/불사의 온기) 시스템 키
        'tf-remedy-gathering-log','tf-remedy-materials','tf-known-remedies',
        // [신규] 상인 확장(정보수집/거래/양날의 저울) 시스템 키
        'tf-intel-gathering-log','tf-intel-materials','tf-known-deals',
        // [신규] 연금술사 확장(재료탐사/비법/현자의 그림자) 시스템 키
        'tf-alchemy-expedition-log','tf-alchemy-expedition-materials','tf-known-formulas',
        // [F-누락 수정] 묘역/사자의 안내인 시스템(p-graves) 키 — 원래부터
        // 존재하던 시스템인데도 전수 백업 목록에 등록돼 있지 않았다.
        'tf-graveyard',
        // [신규] 학자 확장(연구 로그/금서의 무게) 시스템 키. 진 엔딩 1차
        // 관문의 발견 여부를 결정하는 tf-discovered-hidden-locs, 그리고
        // 환생해도 지워지지 않는 tf-permanent-unlocked-locs(감시자의 영역·
        // 태초의 화로 등 "한 번 열면 영구히 열리는" 장소 기록)도 함께 포함.
        'tf-scholar-research-log','tf-discovered-hidden-locs','tf-permanent-unlocked-locs',
        // [신규] 태초의 화로 채집 쿨다운 키
        'tf-primal-forge-last-gather',
        // [신규] 장소별 몬스터 풀 — 확률 기반 AI 의존도 감소 시스템의
        // 핵심 데이터. 장소마다 어떤 몬스터가 등장했는지 영구 기록되며,
        // 이 데이터가 쌓일수록 해당 장소에서 AI가 새 몬스터를 만들
        // 확률이 낮아진다(하드코딩 소스로도 그대로 재사용 가치가 높다).
        'tf-location-monster-pool',
        // [신규] 사냥꾼 확장(사냥터 원정/전리품/야생을 닮아가는 것) 시스템 키.
        'tf-hunter-expedition-log','tf-hunter-trophies','tf-legendary-hunt-last',
        // [신규] 야수 조련 로그 — 「야수의 왕」 히든 퀘스트 조건(전설급
        // T13 조련 성공) 판정에 쓰인다.
        'tf-hunter-tame-log',
        // [신규] 종족-직업 정체성 부조화 시스템 키.
        'tf-race-job-dissonance','tf-race-job-dissonance-resolved','tf-race-job-dissonance-stat-applied',
        // [신규] 방랑자로 시작한 생들의 회차별 실제 전직 경로 영구 기록.
        'tf-wanderer-job-legacy',
      ];
      ALL_KEYS.forEach(k => {
        try {
          const v = lsGet(k);
          if(v) {
            try { dump[k] = JSON.parse(v); }
            catch(e) { dump[k] = v; }
          }
        } catch(e) {}
      });
      return dump;
    })(),
    // ── 수집 통계 ──
    collection_stats: {
      exportedAt: new Date().toISOString(),
      total_turns: S.msgCount || 0,
      monsters_count:      (() => { try { return JSON.parse(lsGet('tf-discovered-monsters') || '[]').length; } catch(e) { return 0; } })(),
      locations_count:     (() => { try { return JSON.parse(lsGet('tf-visited-locations') || '[]').length; } catch(e) { return 0; } })(),
      npc_dialogues_count: (() => { try { return JSON.parse(lsGet('tf-npc-dialogues') || '[]').length; } catch(e) { return 0; } })(),
      skills_count:        (() => { try { return JSON.parse(lsGet('tf-discovered-skills') || '[]').length; } catch(e) { return 0; } })(),
      lore_count:          (() => { try { return JSON.parse(lsGet('tf-lore-database') || '[]').length; } catch(e) { return 0; } })(),
      quests_count:        (() => { try { return JSON.parse(lsGet('tf-quest-database') || '[]').length; } catch(e) { return 0; } })(),
      playlog_count:       (() => { try { return JSON.parse(lsGet('tf-master-playlog') || '[]').length; } catch(e) { return 0; } })(),
      narrative_log_count: (() => { try { return JSON.parse(lsGet('tf-narrative-log') || '[]').length; } catch(e) { return 0; } })(),
      gs_failed_count:     (() => { try { return JSON.parse(lsGet('tf-gs-failed-turns') || '[]').length; } catch(e) { return 0; } })(),
    },
  };
}
window.buildFullDataSnapshot = buildFullDataSnapshot;

window.renderBulletinBoard = function(loc){
  let html = _origRenderBulletinBoard(loc);

  // AI 생성 게시판 아이템 주입
  const aiData = getAIBulletinForLoc(loc.id||loc.name);
  if(aiData.quests.length || aiData.infos.length){
    const tierColor = { common:'#8a9a8a', uncommon:'#4a9a6a', rare:'#5a80d0', legendary:'#c8a96e' };
    const tierLabel = { common:'일반', uncommon:'중급', rare:'고급', legendary:'전설' };
    const acceptedBulletin = loadAcceptedBulletin();

    let aiHtml = `<div style="font-family:Cinzel,serif;font-size:9px;color:#7a5a9a;letter-spacing:1px;margin:10px 0 5px">✨ 긴급 공고 (AI 생성)</div>`;

    aiData.quests.forEach(q=>{
      const isAccepted = acceptedBulletin.some(a=>a.uid===q.uid);
      const tc = tierColor[q.tier]||'#8a9a8a';
      const rewardGold = q.rewardMin + Math.floor(Math.random()*(q.rewardMax-q.rewardMin));
      aiHtml += `
        <div style="padding:10px 11px;background:#0a0514;border:1px solid ${tc}88;margin-bottom:6px;border-radius:2px">
          <div style="display:flex;align-items:flex-start;gap:8px">
            <span style="font-size:20px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(q,{size:20}):(q.icon)}</span>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
                <span style="font-family:Cinzel,serif;font-size:10px;color:${tc}">${esc(q.title)}</span>
                <span style="font-size:8px;padding:1px 5px;background:${tc}22;border-radius:1px;color:${tc}">${tierLabel[q.tier]||q.tier}</span>
                <span style="font-size:8px;color:#7a5a9a;margin-left:auto">✨AI</span>
              </div>
              <div style="font-size:10px;color:var(--dim);line-height:1.5;margin-bottom:4px">${esc(q.desc)}</div>
              <span style="font-size:10px;color:#f1c40f">💰 ${rewardGold}G${q.rewardExtra?` · ${esc(q.rewardExtra)}`:''}</span>
            </div>
          </div>
          <div style="margin-top:7px">
            ${isAccepted
              ? `<div style="padding:5px 10px;background:#0a1a08;border:1px solid #3a6a2a;font-size:9px;color:#60a040;text-align:center">✔ 수락 완료</div>`
              : `<button class="btn btn-gold" style="width:100%;padding:6px;font-size:9px" onclick="acceptBulletinQuest('${esc(q.uid)}','${esc(q.title)}',${rewardGold},'${esc(q.icon)}','${esc(q.desc)}')">의뢰 수락</button>`
            }
          </div>
        </div>`;
    });

    aiData.infos.forEach(info=>{
      aiHtml += `
        <div style="padding:9px 11px;background:#0a0a18;border:1px solid #3a2a5a;margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(info,{size:16}):(info.icon)}</span>
            <span style="font-family:Cinzel,serif;font-size:9px;color:#9a6aaa">${esc(info.title)}</span>
            <span style="font-size:8px;color:#7a5a9a;margin-left:auto">✨특수정보</span>
          </div>
          <div style="font-size:10px;color:#b090d0;line-height:1.55">${esc(info.content)}</div>
        </div>`;
    });

    // 구분자 뒤에 붙이기
    html = html.replace('게시판은 주기적으로 갱신됩니다', aiHtml + '게시판은 주기적으로 갱신됩니다');
  }
  return html;
};

window.detectAndSetLocation = function(aiText){
  _origDetectAndSetLocation(aiText);
  // AI 생성 장소 키워드도 체크
  const lc = (aiText||'').toLowerCase();
  const aiLocs = loadAILocations();
  for(const loc of aiLocs){
    if((loc.triggerKeywords||[]).some(kw=>lc.includes(kw.toLowerCase()))){
      if(!window.currentLocation||window.currentLocation.id!==loc.id){
        window.currentLocation = loc;
        saveCurrentLocation(loc);
        const visited = loadLocations();
        if(!visited.find(v=>v.name===loc.name)){
          visited.push({name:loc.name,icon:loc.icon,visitedAt:new Date().toISOString(),turn:S.msgCount,aiGenerated:true});
          saveLocations(visited);
          toastHTML(`📍 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:14}):(loc.icon)} ${esc(loc.name)} 도착!`, 2500);
        }
      }
      break;
    }
  }
  // 세계 확장 트리거 체크 — 큐에 넣어 메인 callAI와 겹치지 않게 함
  enqueueAITask(()=>checkAndExpandWorld(aiText).catch(()=>{}), '세계 확장');
};

const _origNqdAccept = window._nqdAccept;

window._nqdAccept = function(){
  if(_origNqdAccept) _origNqdAccept();
  const q = window._nqd?.quest;
  if(q) maybeGenerateQuestLocation(q.title||'', q.desc||q.aiHint||'').catch(()=>{});
};

const _origAcceptBulletinQuest = window.acceptBulletinQuest;

window.acceptBulletinQuest = function(uid, title, rewardGold, icon, desc){
  if(_origAcceptBulletinQuest) _origAcceptBulletinQuest(uid, title, rewardGold, icon, desc);
  maybeGenerateQuestLocation(title, desc).catch(()=>{});
};

(function patchDetectForMapTab(){
  const _orig = window.detectAndSetLocation;
  if(_orig){
    window.detectAndSetLocation = function(aiText){
      _orig(aiText);
      updateMapTabState(window.currentLocation || loadCurrentLocation());
    };
  }
  // 페이지 로드 시 즉시 1회 갱신
  setTimeout(()=>{ updateMapTabState(); }, 2600);
})();

const _owOrigDetect = window.detectAndSetLocation;

window.detectAndSetLocation = function(aiText){
  if(_owOrigDetect) _owOrigDetect(aiText);
  checkDeparture(aiText);
  // 위치가 바뀌었으므로 지도 탭 상태 갱신
  setTimeout(()=>{ updateMapTabState(window.currentLocation || loadCurrentLocation()); }, 300);
};

const _owOrigBuildSnapshot = window.buildFullDataSnapshot;

if(_owOrigBuildSnapshot){
  window.buildFullDataSnapshot = function(){
    const snap = _owOrigBuildSnapshot();
    snap.travel = {
      log:    loadTravelLog(),
      routes: []
    };
    return snap;
  };
}
}

