// NPC/퀘스트 완성도 강화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { enrichAllExistingNPCs } from '../core/244-통합-초기화-매-턴-훅-연결.js';
import { SKILL_DEFS } from '../data/009-레벨업-스탯-포인트-배분-시스템.js';
import { LANGUAGE_DEFS } from '../data/018-5170번-환생-누적-시스템.js';
import { NPC_EMOTIONS, NPC_QUEST_TEMPLATES } from '../data/065-NPC퀘스트-완성도-강화.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadNPCs, saveNPCs } from '../misc/001-block0-preamble.js';
import { recordRelationshipLegacy } from '../misc/016-2130번-시스템.js';
import { getSinRedemptions, redeemSin } from '../misc/017-4150번-시스템.js';
import { loadBetrayals } from '../misc/033-NEW-배신-가능한-동료-시스템.js';
import { loadParty } from '../misc/054-이동수단-시스템.js';
import { updateChallenge } from '../misc/164-도전-과제-달성률-시스템.js';
import { getNpcGrowthData, growNpc } from '../npc/031-NEW-NPC-성장-시스템-동료-레벨업-버프.js';
import { getNpcBondSummary, propagateRelationship } from '../npc/067-③-NPC-관계망-시스템.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { unlockLanguage } from '../progression/018-5170번-환생-누적-시스템.js';
import { recordRival } from '../progression/020-101130번-환생-누적-시스템.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { closeP, grantTitle, showQuestAcceptPopup, updateQuestBadge } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { addResonance, connectTwinSoul, growBondTree, loadTwinSoul } from '../race/028-악마족-진명-시스템-Demon-True-Name.js';
import { $, esc, lsGet, lsSet, toast } from '../utils.js';
import { rollEventReward, saveGold, saveInventory } from './007-동적-아이템-생성-시스템-무제한-영구-캐시.js';

export const NPC_MEMORY_KEY = 'tf-npc-memory';

export function loadNpcMemory(){ try{ return JSON.parse(lsGet(NPC_MEMORY_KEY)||'{}'); }catch(e){ return {}; } }
window.loadNpcMemory = loadNpcMemory;

export function saveNpcMemory(d){ try{ lsSet(NPC_MEMORY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveNpcMemory = saveNpcMemory;

export function getNpcEmotion(relationship){
  const score = relationship||50;
  if(score>=80) return NPC_EMOTIONS.trust;
  if(score>=65) return NPC_EMOTIONS.friendly;
  if(score>=40) return NPC_EMOTIONS.neutral;
  if(score>=25) return NPC_EMOTIONS.cautious;
  return NPC_EMOTIONS.hostile;
}
window.getNpcEmotion = getNpcEmotion;

export function updateNpcRelationship(npcName, delta, reason=''){
  const npcs = loadNPCs()||[];
  const npc = npcs.find(n=>n.name===npcName);
  if(!npc) return;

  const oldRel = npc.relationship||50;
  const newRel = Math.max(0, Math.min(100, oldRel+delta));
  npc.relationship = newRel;

  // 기억에 이유 저장
  const mem = loadNpcMemory();
  if(!mem[npcName]) mem[npcName] = { events:[], questGiven:false, questDone:false };
  if(reason) mem[npcName].events.push({ reason, delta, turn:S.msgCount, at:new Date().toISOString() });
  // mem[npcName].events 무제한 저장 (하드코딩 데이터 수집용)
  saveNpcMemory(mem);

  // 관계 단계 변화 감지
  const oldEmo = getNpcEmotion(oldRel);
  const newEmo = getNpcEmotion(newRel);
  if(oldEmo.label !== newEmo.label){
    toast(`${npcName}과의 관계: ${oldEmo.label} → ${newEmo.label}`, 3000, npc);
    if(newRel>=80) unlockAchievement('npc_trust');
    if(newRel>=80 && typeof addResonance==='function') addResonance(npcName, Math.round((newRel-80)*2));
    if(newRel>=95 && typeof connectTwinSoul==='function' && typeof loadCycleCount==='function' && loadCycleCount()>=5){
      const _ts = (typeof loadTwinSoul==='function') ? loadTwinSoul() : null;
      if(!_ts?.connected){
        // [B31 FIX] partnerSkill/mySkill을 항상 null로 고정 전달해 "서로의
        // 스킬 1개씩 공유"라는 시스템 설명과 달리 sharedSkills/gaveSkill이
        // 항상 빈 상태였던 버그. 실제로 공유할 스킬을 골라 전달한다 —
        // mySkill은 플레이어가 이미 배운 스킬 중 하나, partnerSkill은
        // 아직 배우지 않은 스킬 중 하나(유대를 통해 새로 전수받는 스킬).
        const _myUnlocked = Object.keys(S.unlockedSkills||{}).filter(id=>S.unlockedSkills[id]);
        const _mySkillForTwin = _myUnlocked.length ? _myUnlocked[Math.floor(Math.random()*_myUnlocked.length)] : null;
        const _partnerCandidates = (typeof SKILL_DEFS!=='undefined') ? SKILL_DEFS.filter(sk=>!S.unlockedSkills?.[sk.id]) : [];
        const _partnerSkillForTwin = _partnerCandidates.length ? _partnerCandidates[Math.floor(Math.random()*_partnerCandidates.length)].id : null;
        connectTwinSoul(npcName, _partnerSkillForTwin, _mySkillForTwin);
        setTimeout(()=>toast(`🔗 ${npcName}과(와) 영혼이 연결되었다...`, 4000), 1000);
      }
    }
    if(newRel>=70 && oldRel<70 && typeof redeemSin==='function'){
      const _bt = (typeof loadBetrayals==='function') ? loadBetrayals() : [];
      if(_bt.some(b=>b.target===npcName) && typeof getSinRedemptions==='function'){
        const _sins = getSinRedemptions();
        if(_sins.some(s=>s.sinType==='betrayal' && !s.redeemed)) redeemSin('betrayal');
      }
    }
    if(newRel>=70 && oldRel<70 && typeof growBondTree==='function') growBondTree(1, newRel>=90?1:0);
    if(delta>0 && typeof growNpc==='function') growNpc(npcName, delta);
    // [B10 FIX] 두 번째 인자 자리에 bond(관계유형 문자열)가 아니라 newRel(호감도
    // 숫자)이 그대로 전달되어 REL_LEGACY_HINTS[숫자]가 항상 undefined였다.
    // 호감도 구간에 따라 실제 관계 유형 문자열을 판단해 전달한다.
    if(newRel>=50 && typeof recordRelationshipLegacy==='function') recordRelationshipLegacy(npcName, newRel>=90?'love':'ally', Math.ceil(newRel/20), S.scenario?.id);
    // [B67 FIX] 도전 과제 "모두의 친구"(trusted_npcs)가 어디서도
    // updateChallenge()로 갱신되지 않던 버그. NPC 신뢰도 갱신 시점마다
    // 신뢰도 70+ NPC 수를 재계산해 갱신한다.
    if(typeof updateChallenge==='function'){
      const _trustedCount = (loadNPCs()||[]).filter(n=>(n.relationship||0)>=70).length;
      updateChallenge('trusted_npcs', _trustedCount);
    }
    if(newRel>=30 && npc.race && typeof unlockLanguage==='function' && typeof LANGUAGE_DEFS!=='undefined'){
      const _langDef = LANGUAGE_DEFS.find(l=>l.race && npc.race.includes(l.race));
      if(_langDef && newRel>=_langDef.minBond) unlockLanguage(_langDef.id, newRel, S.scenario?.id);
    }
    if(newRel<30 && oldRel>=30){
      toast(`⚠️ ${npcName}이(가) 적대적으로 돌아섰다!`, 3000);
      if(typeof recordRival==='function') recordRival(npcName, npc.role||null, 30, S.scenario?.id);
    }
  }

  saveNPCs(npcs);
  propagateRelationship(npcName, delta); // 파급 효과
  return newRel;
}
window.updateNpcRelationship = updateNpcRelationship;

export function detectNpcRelationshipChange(aiText, userAction){
  const npcs = loadNPCs()||[];
  const lc = (aiText||'').toLowerCase();
  const ua = (userAction||'').toLowerCase();

  npcs.forEach(npc=>{
    const name_lc = npc.name.toLowerCase();
    if(!lc.includes(name_lc) && !ua.includes(name_lc)) return;

    // 긍정적 행동 감지
    const positive = ['도움','구했','살렸','선물','감사','기뻐','웃','신뢰','믿','도와'];
    const negative = ['공격','위협','거짓','속였','배신','모욕','무시','죽','적대'];

    let delta = 0;
    if(positive.some(k=>lc.includes(k)||ua.includes(k))) delta += 5;
    if(negative.some(k=>lc.includes(k)||ua.includes(k))) delta -= 8;

    if(delta !== 0) updateNpcRelationship(npc.name, delta, delta>0?'우호적 행동':'적대적 행동');
  });
}
window.detectNpcRelationshipChange = detectNpcRelationshipChange;

export const NPC_QUEST_STATE_KEY = 'tf-npc-quest-state';

export function loadNpcQuestState(){ try{ return JSON.parse(lsGet(NPC_QUEST_STATE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadNpcQuestState = loadNpcQuestState;

export function saveNpcQuestState(d){ try{ lsSet(NPC_QUEST_STATE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveNpcQuestState = saveNpcQuestState;

export function checkNpcQuests(){
  const npcs = loadNPCs()||[];
  const questState = loadNpcQuestState();
  const mem = loadNpcMemory();

  npcs.forEach(npc=>{
    const key = 'quest_'+npc.name;
    if(questState[key] === 'active' || questState[key] === 'complete') return;

    // 조건 맞는 퀘스트 템플릿 찾기
    const available = NPC_QUEST_TEMPLATES.filter(t=>typeof t.condition==='function' && t.condition(npc));
    if(!available.length) return;

    // 랜덤으로 하나 선택 (이미 한 것 제외)
    const done = mem[npc.name]?.questsDone||[];
    const candidates = available.filter(t=>!done.includes(t.id));
    if(!candidates.length) return;

    // 확률적으로 제안 (매 턴 10%)
    if(Math.random() > 0.1) return;

    const template = candidates[Math.floor(Math.random()*candidates.length)];
    if(!template || typeof template.generateDesc !== 'function') return;
    const quest = {
      id: template.id+'_'+npc.name,
      npcName: npc.name,
      npcIcon: npc.icon||'👤',
      title: template.title,
      desc: template.generateDesc(npc),
      type: template.type,
      reward: template.reward,
      completeKeywords: template.completeKeywords,
      templateId: template.id,
      startedAt: new Date().toISOString(),
      turn: S.msgCount,
    };

    // ── 팝업으로 수락 여부 확인 후 저장 ──
    const _qsCopy = questState;
    setTimeout(()=>{
      showQuestAcceptPopup(
        {
          title:    quest.title,
          icon:     npc.icon||'👤',
          desc:     quest.desc,
          npcName:  npc.name,
          npcIcon:  npc.icon||'👤',
          difficulty: 'normal',
          reward:   quest.reward || {},
          lore:     null,
        },
        function(){
          _qsCopy[key] = 'active';
          _qsCopy[key+'_data'] = quest;
          saveNpcQuestState(_qsCopy);
          toast('📜 ['+npc.name+'] 의뢰 수락: '+quest.title, 3000);
          if(typeof updateQuestBadge==='function') updateQuestBadge();
        },
        function(){
          toast('✕ ['+npc.name+'] 의뢰 거절', 1500);
        }
      );
    }, 800);
  });
}
window.checkNpcQuests = checkNpcQuests;

export function checkNpcQuestCompletion(aiText){
  const questState = loadNpcQuestState();
  const lc = aiText.toLowerCase();

  // 실패/부정 맥락 키워드 — 이것들이 포함된 문장은 완료로 처리하지 않음
  const FAIL_KEYWORDS = ['실패','거부','거절','불가','죽었','사라졌','포기','취소','불능','못했','안됐','실종','도망'];

  Object.entries(questState).forEach(([key, status])=>{
    if(status !== 'active') return;
    // _data 서픽스 키는 건너뜀
    if(key.endsWith('_data')) return;
    const dataKey = key+'_data';
    const quest = questState[dataKey];
    if(!quest) return;

    const npcMentioned = lc.includes(quest.npcName.toLowerCase());
    const completedKw  = quest.completeKeywords.some(kw=>lc.includes(kw));

    if(!npcMentioned || !completedKw) return;

    // 부정 맥락 체크: 실패/거부 키워드가 있으면 완료 처리 안 함
    const hasFail = FAIL_KEYWORDS.some(fw=>lc.includes(fw));
    if(hasFail) return;

    questState[key] = 'complete';
    saveNpcQuestState(questState);

    // 보상
    const r = quest.reward;
    if(r.gold){ if(typeof addGoldWithExchange==='function') addGoldWithExchange(r.gold, 'NPC 의뢰 완료'); else { S.gold+=r.gold; saveGold(S.gold); } }
    if(r.relBonus) updateNpcRelationship(quest.npcName, r.relBonus, '퀘스트 완료');
    if(r.exp) window.updateStats('totalExp', r.exp);
    if(r.titleId) grantTitle(r.titleId);
    // 퀘스트 완료 아이템 보상 (reward.item 있을 때만)
    if(r.item && typeof rollEventReward==='function'){
      const questItem = rollEventReward('npcQuest');
      if(questItem){ S.inventory.push(questItem); saveInventory(S.inventory); toastHTML(`🎁 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(questItem,{size:14}):(questItem.icon)} ${esc(questItem.name)} 획득!`, 2500); }
    }

    window.updateHeader();
    toast(`✅ ${quest.npcIcon} ${quest.npcName} 퀘스트 완료! 골드+${r.gold||0}`, 4000);
    unlockAchievement('npc_quest_done');

    // NPC 기억에 완료 기록
    const mem = loadNpcMemory();
    if(!mem[quest.npcName]) mem[quest.npcName] = { events:[], questsDone:[] };
    if(!mem[quest.npcName].questsDone) mem[quest.npcName].questsDone=[];
    mem[quest.npcName].questsDone.push(quest.templateId);
    saveNpcMemory(mem);
  });
}
window.checkNpcQuestCompletion = checkNpcQuestCompletion;

export const QUEST_CHOICES_KEY = 'tf-quest-choices';

export function loadQuestChoices(){ try{ return JSON.parse(lsGet(QUEST_CHOICES_KEY)||'{}'); }catch(e){ return {}; } }
window.loadQuestChoices = loadQuestChoices;

export function saveQuestChoices(d){ try{ lsSet(QUEST_CHOICES_KEY, JSON.stringify(d)); }catch(e){} }
window.saveQuestChoices = saveQuestChoices;

export function recordQuestChoice(questId, choice, outcome){
  const choices = loadQuestChoices();
  choices[questId] = { choice, outcome, turn:S.msgCount, at:new Date().toISOString() };
  saveQuestChoices(choices);
}
window.recordQuestChoice = recordQuestChoice;

export function renderNpcs(){
  const body=$('pb-npcs'); if(!body) return;
  const npcs = loadNPCs()||[];
  const mem = loadNpcMemory();
  const questState = loadNpcQuestState();
  const party = loadParty()||[];

  if(!npcs.length){
    body.innerHTML='<div style="text-align:center;padding:18px;color:var(--dim);font-size:11px">아직 만난 NPC가 없습니다</div>';
    return;
  }

  // 미보강 NPC 일괄 처리
  try{ if(typeof enrichAllExistingNPCs==='function') enrichAllExistingNPCs(); }catch(e){}

  // 관계도 순 정렬
  const sorted = [...npcs].sort((a,b)=>(b.relationship||50)-(a.relationship||50));

  body.innerHTML = sorted.map(npc=>{
    const rel = npc.relationship||50;
    const emo = getNpcEmotion(rel);
    const npcMem = mem[npc.name]||{};
    const questKey = 'quest_'+npc.name;
    const hasActiveQuest = questState[questKey]==='active';
    const questData = questState[questKey+'_data'];
    const isInParty = party.some(p=>p.name===npc.name);
    const canRecruit = rel>=70 && !isInParty && party.length<8;
    const recentEvents = (npcMem.events||[]).slice(-3);

    const rankStr    = npc.rank     ? `${npc.rankIcon||''}${npc.rank}` : '';
    const raceStr    = npc.race     ? npc.race : '';
    const factionStr = npc.faction  ? npc.faction : '';
    const persoStr   = npc.personality ? npc.personality : '';
    const speechStr  = npc.speech_style ? npc.speech_style : '';
    const metaLine   = [raceStr, rankStr].filter(Boolean).join(' · ');
    const factionLine= factionStr ? `<div style="font-size:9px;color:#5a7a9a;margin-top:1px">🏴 ${esc(factionStr)}</div>` : '';
    const persoLine  = persoStr   ? `<div style="font-size:9px;margin-top:2px"><span style="color:#a07030">성격:</span> <span style="color:var(--dim)">${esc(persoStr)}</span>${speechStr ? ` <span style="color:#4a4a4a">· ${esc(speechStr)}</span>` : ''}</div>` : '';
    // [신규 ③] NPC-NPC 독립 관계 — 플레이어가 모르는 사이 일어난 일을
    // 패널에서 짧게 드러낸다.
    const bondSummary = (typeof getNpcBondSummary==='function') ? getNpcBondSummary(npc.name) : '';
    const bondLine   = bondSummary ? `<div style="font-size:9px;color:#c08060;margin-top:2px">💞 ${esc(bondSummary)}</div>` : '';
    // 동료 성장 레벨 (파티 참여 중인 NPC만)
    const growthData = (isInParty && typeof getNpcGrowthData==='function') ? getNpcGrowthData(npc.name) : null;
    const growthLine = (growthData && growthData.level>1) ? `<div style="font-size:9px;color:#80a0c0;margin-top:2px">📈 동료 레벨 ${growthData.level} (유대 ${growthData.totalBond||0})</div>` : '';

    return `<div style="padding:11px 13px;background:#0d0800;border:1px solid ${rel>=70?'#3a5a2a':rel<30?'#5a2020':'var(--border)'};margin-bottom:7px">
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:6px">
        <span style="font-size:22px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(npc,{size:22}):(npc.icon||"👤")}</span>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px">
            <span style="font-family:Cinzel,serif;font-size:11px;color:var(--gold)">${esc(npc.name)}</span>
            <span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(emo,{size:10}):(emo.icon)}</span>
            <span style="font-size:9px;color:var(--dim)">${emo.label}</span>
            ${isInParty?'<span style="font-size:9px;color:#60a060;margin-left:auto">⚔️파티</span>':''}
            ${hasActiveQuest?'<span style="font-size:9px;color:#f1c40f;margin-left:auto">📜의뢰</span>':''}
          </div>
          <div style="font-size:9px;color:var(--dim);margin-top:1px">${esc(npc.role||'')}</div>
          ${metaLine ? `<div style="font-size:9px;color:#6a8a6a;margin-top:1px">${esc(metaLine)}</div>` : ''}
          ${factionLine}
          ${persoLine}
          ${bondLine}
          ${growthLine}
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:10px;font-family:Cinzel,serif;color:${rel>=70?'#60a060':rel<30?'#e05a5a':'var(--dim)'}">${rel}</div>
        </div>
      </div>
      <div style="height:4px;background:#1a1005;border-radius:2px;overflow:hidden;margin-bottom:6px">
        <div style="width:${rel}%;height:100%;background:${rel>=70?'#4a9a6a':rel<30?'#e05a5a':'#c8a96e'};border-radius:2px;transition:width .4s"></div>
      </div>
      ${recentEvents.length>0?`<div style="font-size:9px;color:#4a3a2a;margin-bottom:5px;line-height:1.4">${recentEvents.slice(-1)[0].reason} (${recentEvents.slice(-1)[0].delta>0?'+':''}${recentEvents.slice(-1)[0].delta})</div>`:''}
      ${hasActiveQuest&&questData?`<div style="padding:6px 8px;background:#1a1508;border:1px solid #3a2a0a;border-radius:2px;margin-bottom:6px">
        <div style="font-family:Cinzel,serif;font-size:9px;color:#f1c40f;margin-bottom:2px">📜 ${esc(questData.title)}</div>
        <div style="font-size:10px;color:var(--dim);line-height:1.4">${esc(questData.desc)}</div>
        <div style="font-size:9px;color:#60a060;margin-top:2px">보상: 골드${questData.reward?.gold||0} · 관계+${questData.reward?.relBonus||0}</div>
      </div>`:''}
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${canRecruit?`<button class="btn btn-gold" style="padding:4px 8px;font-size:8px" onclick="recruitNpcToParty('${esc(npc.name)}')">⚔️ 영입</button>`:''}
        ${isInParty?`<button class="btn btn-dark" style="padding:4px 8px;font-size:8px" onclick="dismissPartyMember('${esc(npc.name)}')">탈퇴</button>`:''}
        <button class="btn btn-dark" style="padding:4px 8px;font-size:8px" onclick="talkToNpc('${esc(npc.name)}')">💬 대화</button>
        ${rel>=40?`<button class="btn btn-dark" style="padding:4px 8px;font-size:8px;border-color:#3a6a2a;color:#80c040" onclick="openNpcQuestDialog('${esc(npc.name)}')">📜 의뢰</button>`:''}
        ${rel>=50?`<button class="btn btn-dark" style="padding:4px 8px;font-size:8px" onclick="giftNpc('${esc(npc.name)}')">🎁 선물</button>`:''}
      </div>
    </div>`;
  }).join('');
}
window.renderNpcs = renderNpcs;

export function talkToNpc(npcName){
  const npcs = loadNPCs()||[];
  const npc = npcs.find(n=>n.name===npcName);
  if(!npc) return;
  const rel = npc.relationship||50;
  const emo = getNpcEmotion(rel);
  const action = `${npc.name}에게 다가가 말을 건다.`;
  closeP('npcs');
  document.getElementById('msg-inp').value = action;
  document.getElementById('msg-inp').focus();
}
window.talkToNpc = talkToNpc;

export function giftNpc(npcName){
  const inv = S.inventory||[];
  if(!inv.length){ toast('줄 수 있는 아이템이 없습니다'); return; }
  const giftable = inv.filter(i=>i.type!=='equip'||i.rarity!=='common');
  if(!giftable.length){ toast('선물할 아이템이 없습니다'); return; }
  const item = giftable[0];
  const confirm_result = confirm(`${item.icon} ${item.name}을(를) ${npcName}에게 선물하겠습니까?`);
  if(!confirm_result) return;
  S.inventory = inv.filter(i=>i!==item);
  saveInventory(S.inventory);
  const bonus = item.rarity==='primal'?30:item.rarity==='legendary'?20:item.rarity==='rare'?12:item.rarity==='uncommon'?7:4;
  updateNpcRelationship(npcName, bonus, `${item.name} 선물`);
  toast(`🎁 ${npcName}에게 ${item.name}을 선물했다! 관계+${bonus}`, 3000);
  renderNpcs();
}
window.giftNpc = giftNpc;
