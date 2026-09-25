// TaleForge v58 — 매판 진득하게 살 수 있는 10가지 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { HISTORY_TRIGGERS, MOMENT_TRIGGERS, SEASON_EVENTS_DEFS } from '../data/322-TaleForge-v58-매판-진득하게-살-수-있는-10가지-시스템.js';
import { loadProphecy } from '../lore/301-①-예언운명-시스템.js';
import { loadNPCs, saveSession } from '../misc/001-block0-preamble.js';
import { loadGoals } from '../misc/318-⑩-플레이어-목표-노트.js';
import { saveNpcGrowth } from '../npc/031-NEW-NPC-성장-시스템-동료-레벨업-버프.js';
import { loadCycleCount, loadFameLegacy } from '../progression/014-환생-누적-시스템-110번.js';
import { callGeminiDirect } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { callLocalModelJSON, tryCloudThenLocalModelThenBank } from '../quest/331-로컬-AI-모델-엔진.js';
import { recordMarkovSample } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { getThrallBLS } from '../ui/026-renderHumanAwakeningPanel-완전-재정의.js';
import { esc, toast } from '../utils.js';

export const _v58lsGet = k => { try{ return localStorage.getItem(k); }catch(e){ return null; } };

export const _v58lsSet = (k,v) => { try{ localStorage.setItem(k,v); }catch(e){} };

export const _v58load  = k => { try{ return JSON.parse(_v58lsGet(k)||'null'); }catch(e){ return null; } };

export const _v58save  = (k,d) => _v58lsSet(k, JSON.stringify(d));

export const NPC_LEGACY_KEY = 'tf-npc-legacy-v2';

export function loadNpcLegacies(){ return _v58load(NPC_LEGACY_KEY)||[]; }
window.loadNpcLegacies = loadNpcLegacies;

export function saveNpcLegacies(d){ _v58save(NPC_LEGACY_KEY, (d||[]).slice(-50)); }
window.saveNpcLegacies = saveNpcLegacies;

// ══════════════════════════════════════════════════════════════════
// 로컬 유산 생성 엔진 (AI 미사용) — 사인(사망/작별) × 유산 종류
// (아이템/스킬힌트/비밀/스탯) 조합으로 뱅크에서 조합한다.
// ══════════════════════════════════════════════════════════════════
const NPC_FAREWELL_MESSAGE_BANK = {
  사망: ['부디... 나머지는... 당신에게 맡길게...', '후회는... 없어. 당신을 만나서...', '...고마웠다. 그거면... 충분해.', '이 다음은... 당신의 몫이야.', '나는... 여기까지인가 보다.', '괜찮아... 각오는... 하고 있었으니까.', '당신이... 있어서... 다행이었어.', '...미안, 여기서 헤어져야겠다.'],
  작별: ['여기까지가 내 몫인 것 같다.', '당신과 함께한 시간, 잊지 않을게.', '다음에 또 만날 날이 있겠지.', '이제 나는 나의 길을 가야겠다.', '고마웠어. 정말로.', '이젠 각자의 길을 가야 할 때인 것 같다.', '짧았지만 후회 없는 시간이었어.', '어디에 있든 당신을 응원할게.'],
};
const NPC_LEGACY_DESC_BANK = {
  아이템:   ['오랫동안 지니고 있던 물건을 건넸다.', '손때 묻은 소지품 하나를 남겼다.', '품 안에 소중히 지니던 것이었다.', '대대로 전해지던 물건이라고 했다.', '늘 곁에 두던 물건을 조용히 내밀었다.', '낡았지만 아끼던 물건이라며 건넸다.', '오래도록 몸에 지니고 다니던 것이었다.'],
  스킬힌트: ['평생 갈고닦은 기술의 요령을 알려주었다.', '자신만의 비법을 짧게 전수해주었다.', '오래 연습한 끝에 터득한 감각을 나눠주었다.', '마지막으로 한 수 가르쳐주고 싶어했다.', '수많은 시행착오 끝에 얻은 요령을 짚어주었다.', '자신이 겪은 실패담과 함께 요령을 알려주었다.', '몸으로 익힌 감각을 말로 옮기려 애써주었다.'],
  비밀:     ['오랫동안 감춰온 이야기를 털어놓았다.', '아무에게도 말하지 않았던 사실을 전했다.', '줄곧 숨겨온 진실 하나를 남겼다.', '마음 한구석에 묻어둔 이야기를 꺼냈다.', '누구에게도 꺼내지 못했던 사연을 들려주었다.', '평생 혼자 짊어졌던 이야기를 풀어놓았다.', '오래 묵혀둔 속내를 처음으로 털어놓았다.'],
  스탯:     ['자신이 쌓아온 힘의 일부를 나눠주었다.', '오랜 수련의 결과를 물려주었다.', '몸에 익은 감각이 자연스레 전해지는 듯했다.', '마지막 순간까지 자신의 것을 아낌없이 내주었다.', '평생 갈고닦은 기운이 스며드는 듯했다.', '자신이 지닌 것 중 가장 값진 것을 나눠주었다.', '오랜 세월 쌓아온 것을 아낌없이 물려주었다.'],
};
const NPC_LEGACY_STAT_POOL = ['str','agi','int','luk','wil','cha','per'];
// [버그 수정] 클라우드 프롬프트는 npc.role을 넣어 그 NPC다운 유언을
// 만들게 하는데, 로컬 폴백은 사망/작별 여부로만 갈릴 뿐 role은 아예
// 안 봐서 전사든 상인이든 똑같은 유산 문구가 나왔다(전수조사로 발견).
// "{role}로"처럼 조사를 직접 붙이면 받침 유무 처리가 필요해지므로,
// 조사 없이도 자연스러운 "{role} 일을 해온" 형태로 붙인다.
function composeLocalNpcLegacy(reason, npc){
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const legacyType = pick(['아이템','스킬힌트','비밀','스탯']);
  const isDeath = /사망/.test(reason||'');
  const baseDesc = pick(NPC_LEGACY_DESC_BANK[legacyType]);
  const legacyDesc = npc?.role ? `${npc.role} 일을 오래 해온 사람만이 보여줄 수 있는 방식이었다. ${baseDesc}` : baseDesc;
  return {
    message: pick(NPC_FAREWELL_MESSAGE_BANK[isDeath?'사망':'작별']),
    legacyType,
    legacyDesc,
    statBonus: { stat: pick(NPC_LEGACY_STAT_POOL), amount: 3 + Math.floor(Math.random()*4) },
  };
}
window.composeLocalNpcLegacy = composeLocalNpcLegacy;

export async function generateNpcLegacy(npcName, reason){
  const npcs = (typeof loadNPCs==='function') ? loadNPCs()||[] : [];
  const npc  = npcs.find(n=>n.name===npcName);
  if(!npc || (npc.relationship||0)<60) return;
  // [복원] AI 우선 — 키가 있으면 NPC 성격/관계를 반영한 진짜 작별
  // 메시지·유산을 시도하고, 없거나 실패하면 로컬 조합 폴백.
  const isDeath = /사망/.test(reason||'');
  const legacyPrompt = `당신은 TaleForge RPG의 서사 작가입니다. NPC "${npcName}"(${npc.role||'동료'})이(가) ${isDeath?'죽음을 앞두고':'작별을 앞두고'} 플레이어에게 남기는 마지막 말과 유산을 JSON으로 생성하세요.
관계도: ${npc.relationship||60}
반드시 다음 JSON만 출력하세요:
{"message":"마지막 대사 1문장","legacyType":"아이템|스킬힌트|비밀|스탯","legacyDesc":"유산 내용 1문장","statBonus":{"stat":"str|agi|int|luk|wil|cha|per 중 1개","amount":3~6 사이 숫자}}`;
  const _shapeLegacy = (raw)=>{
    if(!raw || !raw.message || !raw.legacyDesc) return null;
    // [패턴 학습] 진짜 AI가 쓴 유언/유산 설명만 코퍼스에 누적.
    recordMarkovSample('npc_legacy_message', raw.message);
    recordMarkovSample('npc_legacy_desc', raw.legacyDesc);
    return {
      message: raw.message, legacyType: raw.legacyType||'비밀', legacyDesc: raw.legacyDesc,
      statBonus: { stat: raw.statBonus?.stat||'wil', amount: Math.max(3, Math.min(6, raw.statBonus?.amount||4)) },
    };
  };
  const r = await tryCloudThenLocalModelThenBank(
    async () => _shapeLegacy(await callGeminiDirect(legacyPrompt)),
    async () => _shapeLegacy(await callLocalModelJSON(legacyPrompt, { maxTokens: 250 })),
    () => composeLocalNpcLegacy(reason, npc),
    'NPC 유산 생성'
  );
  const legacy = { npc:npcName, role:npc.role||'?', rel:npc.relationship||0,
    message:r.message, legacyType:r.legacyType, legacyDesc:r.legacyDesc,
    statBonus:r.statBonus, cycle:loadCycleCount()||0, turn:S.msgCount||0,
    applied:false, at:new Date().toLocaleString('ko-KR') };
  const legacies = loadNpcLegacies();
  legacies.push(legacy);
  saveNpcLegacies(legacies);
  toast(`🌱 ${npcName}이(가) 유산을 남겼습니다`, 3000);
  if(typeof renderNpcLegacyPanel==='function') renderNpcLegacyPanel();
}
window.generateNpcLegacy = generateNpcLegacy;

window.generateNpcLegacy = generateNpcLegacy;

export function applyNpcLegacy(idx){
  const legacies = loadNpcLegacies();
  const l = legacies[idx];
  if(!l || l.applied) return;
  if(l.statBonus && S.stats){
    const {stat,amount} = l.statBonus;
    S.stats[stat] = Math.min(999, (S.stats[stat]||0)+(amount||3));
    if(typeof window.updateHeader==='function') window.updateHeader();
    if(typeof saveSession==='function') saveSession();
  }
  l.applied = true;
  saveNpcLegacies(legacies);
  toast(`💝 ${l.npc}의 유산 적용: ${l.statBonus?.stat||''}+${l.statBonus?.amount||3}`, 2500);
  if(typeof renderNpcLegacyPanel==='function') renderNpcLegacyPanel();
}
window.applyNpcLegacy = applyNpcLegacy;

window.applyNpcLegacy = applyNpcLegacy;

export function renderNpcLegacyPanel(){
  const body = document.getElementById('pb-npc-legacy');
  if(!body) return;
  const legacies = loadNpcLegacies().slice().reverse();
  const typeColor = {아이템:'#c0a030',스킬힌트:'#4090d0',비밀:'#9060c0',스탯:'#60c060'};
  body.innerHTML=`<div style="padding:10px 14px">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#a0c040;letter-spacing:1px;margin-bottom:4px">🌱 NPC 유산 (${legacies.length}개)</div>
    <div style="font-size:9px;color:var(--dim);margin-bottom:12px">관계도 60+ NPC와 이별·사망 시 자동 생성. 환생 후에도 영구 보존.</div>
    ${legacies.length===0?'<div style="text-align:center;padding:20px;font-size:11px;color:var(--dim)">아직 받은 유산이 없습니다.</div>':
      legacies.map((l,i)=>`
        <div style="padding:11px 13px;background:${l.applied?'#060a04':'#0a0c00'};border:1px solid ${l.applied?'#2a4010':'#3a3000'};margin-bottom:6px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:5px">
            <span style="font-size:16px">${{아이템:'🎁',스킬힌트:'📖',비밀:'🔓',스탯:'⚡'}[l.legacyType]||'💝'}</span>
            <span style="font-family:Cinzel,serif;font-size:10px;color:${typeColor[l.legacyType]||'#a0c040'}">${esc(l.npc)}</span>
            <span style="font-size:8px;color:var(--dim)">${l.role} · ${l.cycle}회차</span>
            ${l.applied?'<span style="margin-left:auto;font-size:8px;color:#60c060">✓ 적용됨</span>':''}
          </div>
          <div style="font-size:10px;color:#c8d090;font-style:italic;margin-bottom:5px">"${esc(l.message||'')}"</div>
          <div style="font-size:9px;color:var(--dim);margin-bottom:6px">${esc(l.legacyDesc||'')}</div>
          ${l.statBonus&&!l.applied?`<button onclick="applyNpcLegacy(${legacies.length-1-i})" style="padding:4px 12px;background:#0a1a04;border:1px solid #3a6010;color:#80c040;font-size:9px;cursor:pointer;font-family:Cinzel,serif">💝 유산 수령 (${l.statBonus.stat} +${l.statBonus.amount})</button>`:l.applied?`<div style="font-size:9px;color:#406020">${l.statBonus?.stat||''} +${l.statBonus?.amount||3} 적용 완료</div>`:''}
        </div>`).join('')}
  </div>`;
}
window.renderNpcLegacyPanel = renderNpcLegacyPanel;

window.renderNpcLegacyPanel = renderNpcLegacyPanel;

(function hookNpcLegacyObs(){
  const ob = new MutationObserver(muts=>{
    for(const m of muts){ for(const node of m.addedNodes){
      if(node.nodeType!==1) continue;
      const bubble=node.classList?.contains('msg-ai')?node:node.querySelector?.('.msg-ai');
      if(!bubble) continue;
      const text=bubble.innerText||'';
      if(!/작별|떠나|죽었|사망|이별|헤어|사라졌/.test(text)) continue;
      const npcs=(typeof loadNPCs==='function')?loadNPCs()||[]:[];
      for(const npc of npcs){ if((npc.relationship||0)>=60&&text.includes(npc.name)){
        setTimeout(()=>generateNpcLegacy(npc.name,/죽었|사망/.test(text)?'사망':'작별'),1500); break;
      }}
    }}
  });
  const tryA=()=>{ const el=document.getElementById('msgs'); if(el) ob.observe(el,{childList:true,subtree:true}); else setTimeout(tryA,800); };
  tryA();
})();

export const MOMENTS_KEY = 'tf-moments-v2';

export function loadMoments(){ return _v58load(MOMENTS_KEY)||[]; }
window.loadMoments = loadMoments;

export function saveMoments(d){ _v58save(MOMENTS_KEY,(d||[]).slice(-100)); }
window.saveMoments = saveMoments;

// ══════════════════════════════════════════════════════════════════
// 로컬 명장면 압축 엔진 (AI 미사용) — 정확히 이 텍스트를 요약하는 건
// AI의 이해력이 필요한 일이라 똑같이는 못 하지만, MOMENT_TRIGGERS가
// 이미 8가지 카테고리(전설적/감동/승리/인연/배신/각성/희생/첫경험)로
// 텍스트를 분류해준 상태이므로, 그 카테고리에 맞는 문학적 한 문장을
// 뱅크에서 조합한다.
// ══════════════════════════════════════════════════════════════════
const MOMENT_SENTENCE_BANK = {
  '⚡ 전설적 순간': ['모든 것이 완벽하게 맞아떨어진, 다시없을 한 방이었다.', '그 순간만큼은 누구도 부정할 수 없는 압도적인 일격이었다.', '전설이라 불릴 만한 장면이 그렇게 완성되었다.'],
  '💧 감동의 순간': ['참아왔던 감정이 결국 눈물이 되어 흘러내렸다.', '말보다 먼저 눈물이 모든 것을 대신 말해주었다.', '그 순간의 울림은 오래도록 가슴에 남을 것이었다.'],
  '⚔️ 승리의 순간': ['긴 사투 끝에, 마침내 무너뜨렸다.', '그 강대한 존재가 결국 무릎을 꿇는 순간이었다.', '피와 땀으로 얻어낸, 값진 승리였다.'],
  '💕 인연의 순간': ['마음속에만 담아뒀던 말을 마침내 꺼냈다.', '두 사람 사이의 거리가 그 한마디로 사라졌다.', '오래 망설였던 마음이 마침내 전해졌다.'],
  '💔 배신의 순간': ['믿었던 만큼, 그 배신은 더욱 깊이 박혔다.', '가장 가까이 있던 이의 칼끝이 등을 향해 있었다.', '신뢰가 무너지는 소리는 그 무엇보다도 컸다.'],
  '✨ 각성의 순간': ['한계라 믿었던 벽을 마침내 넘어섰다.', '무언가가 깨어나며 완전히 다른 존재가 되어가고 있었다.', '그 순간, 스스로도 몰랐던 힘이 눈을 떴다.'],
  '🌟 희생의 순간': ['자신을 던져서라도 지켜야 할 것이 있었다.', '망설임 없이, 가장 소중한 것을 위해 몸을 던졌다.', '그 희생이 남긴 무게는 결코 가볍지 않았다.'],
  '🌅 첫 번째 순간': ['태어나 처음 겪는 감정이었다.', '생애 처음이라는 말이 이토록 무겁게 느껴진 적은 없었다.', '처음이라는 사실만으로도 그 순간은 특별했다.'],
};
function composeLocalMomentSentence(tag){
  const bank = MOMENT_SENTENCE_BANK[tag];
  if(!bank || !bank.length) return null;
  return bank[Math.floor(Math.random()*bank.length)];
}
window.composeLocalMomentSentence = composeLocalMomentSentence;

export async function captureHallOfMemory(aiText){
  if(!aiText||aiText.length<50) return;
  const matched=MOMENT_TRIGGERS.find(t=>t.re.test(aiText));
  if(!matched) return;
  const moments=loadMoments();
  const lastTurn=moments.length>0?moments[moments.length-1].turn:-99;
  if((S.msgCount||0)-lastTurn<3) return;
  // [복원] AI 우선 — 키가 있으면 실제로 벌어진 장면(aiText)을 압축한
  // 진짜 문학적 한 문장을 시도하고, 없거나 실패하면 로컬 조합 폴백.
  const momentPrompt = `당신은 TaleForge RPG의 문학적 순간 포착가입니다. 아래 장면을 극적인 한 문장으로 압축하세요.
[태그] ${matched.tag}
[장면] ${aiText.slice(0,400)}
반드시 다음 JSON만 출력하세요: {"sentence":"문학적인 한 문장"}`;
  const sentence = await tryCloudThenLocalModelThenBank(
    async () => {
      const raw = await callGeminiDirect(momentPrompt);
      if(raw && raw.sentence) recordMarkovSample('moment_sentence', raw.sentence);
      return (raw && raw.sentence) ? raw.sentence : null;
    },
    async () => {
      const raw = await callLocalModelJSON(momentPrompt, { maxTokens: 150 });
      if(raw && raw.sentence) recordMarkovSample('moment_sentence', raw.sentence);
      return (raw && raw.sentence) ? raw.sentence : null;
    },
    () => composeLocalMomentSentence(matched.tag),
    '명장면 생성'
  );
  if(!sentence) return;
  moments.push({tag:matched.tag,sentence,cycle:loadCycleCount()||0,
    turn:S.msgCount||0,char:`${S.character?.name||'?'} (${S.character?.role||'?'})`,
    at:new Date().toLocaleString('ko-KR')});
  saveMoments(moments);
  toast(`📸 명장면 포착: ${matched.tag}`,2000);
}
window.captureHallOfMemory = captureHallOfMemory;

window.captureHallOfMemory=captureHallOfMemory;

export function renderMomentsPanel(){
  const body=document.getElementById('pb-moments'); if(!body) return;
  const moments=loadMoments().slice().reverse();
  const tagColor={'⚡ 전설적 순간':'#e0c040','💧 감동의 순간':'#60a0e0','⚔️ 승리의 순간':'#e05050','💕 인연의 순간':'#e060a0','💔 배신의 순간':'#a040a0','✨ 각성의 순간':'#80e0c0','🌟 희생의 순간':'#e0e060','🌅 첫 번째 순간':'#c080e0'};
  body.innerHTML=`<div style="padding:10px 14px">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#e0b040;letter-spacing:1px;margin-bottom:4px">📸 명장면 앨범 (${moments.length}장)</div>
    <div style="font-size:9px;color:var(--dim);margin-bottom:12px">감정적 순간이 자동으로 포착됩니다. 환생 후에도 영구 보존.</div>
    ${moments.length===0?'<div style="text-align:center;padding:20px;font-size:11px;color:var(--dim)">아직 포착된 명장면이 없습니다.</div>':
      moments.map(m=>{const tc=tagColor[m.tag]||'#e0b040'; return `
        <div style="padding:11px 13px;background:#0a0800;border:1px solid #2a1800;border-left:3px solid ${tc};margin-bottom:6px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
            <span style="font-size:9px;padding:1px 7px;background:${tc}18;border:1px solid ${tc}44;color:${tc};border-radius:10px;font-family:Cinzel,serif">${m.tag}</span>
            <span style="font-size:8px;color:var(--dim);margin-left:auto">${m.cycle}회차 턴${m.turn}</span>
          </div>
          <div style="font-size:11px;color:#d4b870;line-height:1.7;font-style:italic">"${esc(m.sentence)}"</div>
          <div style="font-size:8px;color:var(--dim);margin-top:4px">${esc(m.char)} · ${m.at}</div>
        </div>`;}).join('')}
  </div>`;
}
window.renderMomentsPanel = renderMomentsPanel;

window.renderMomentsPanel=renderMomentsPanel;

export const UNFINISHED_KEY='tf-unfinished-goals';

export function loadUnfinished(){ return _v58load(UNFINISHED_KEY)||[]; }
window.loadUnfinished = loadUnfinished;

export function saveUnfinished(d){ _v58save(UNFINISHED_KEY,(d||[]).slice(-20)); }
window.saveUnfinished = saveUnfinished;

export function saveUnfinishedGoals(){
  const goals=(typeof loadGoals==='function')?loadGoals():[];
  const undone=goals.filter(g=>!g.done);
  if(!undone.length) return;
  const existing=loadUnfinished();
  const char=S.character||{};
  for(const g of undone.slice(0,5)){
    existing.push({text:g.text,priority:g.priority||'normal',
      fromChar:`${char.name||'?'} (${char.role||'?'})`,
      cycle:loadCycleCount()||0,turn:S.msgCount||0,resolved:false,
      at:new Date().toLocaleString('ko-KR')});
  }
  saveUnfinished(existing.slice(-20));
}
window.saveUnfinishedGoals = saveUnfinishedGoals;

window.saveUnfinishedGoals=saveUnfinishedGoals;

export function resolveUnfinished(idx){
  const list=loadUnfinished(); if(list[idx]) list[idx].resolved=true;
  saveUnfinished(list); renderUnfinishedPanel?.();
  toast('✅ 전생의 미련을 해소했습니다!',2000);
}
window.resolveUnfinished = resolveUnfinished;

window.resolveUnfinished=resolveUnfinished;

export function getUnfinishedBLS(){
  const list=loadUnfinished().filter(u=>!u.resolved);
  if(!list.length) return '';
  const items=list.slice(0,3).map(u=>`"${u.text}"(${u.fromChar}의 미련)`).join(' / ');
  return `\n[⏳ 전생의 미련] ${items} — 이 목표들이 이번 생에 달성될 수 있도록 자연스럽게 기회를 만들어라. 강제 금지, 복선으로만.`;
}
window.getUnfinishedBLS = getUnfinishedBLS;

window.getUnfinishedBLS=getUnfinishedBLS;

export function renderUnfinishedPanel(){
  const body=document.getElementById('pb-unfinished'); if(!body) return;
  const list=loadUnfinished().slice().reverse();
  const prioColor={high:'#e0a030',normal:'#60a0c0',low:'#6a6a6a'};
  body.innerHTML=`<div style="padding:10px 14px">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#9060c0;letter-spacing:1px;margin-bottom:4px">⏳ 전생의 미련</div>
    <div style="font-size:9px;color:var(--dim);margin-bottom:12px">환생 시 미완료 목표가 이월됩니다. AI가 서사에서 자연스럽게 기회를 만들어줍니다.</div>
    ${list.length===0?'<div style="text-align:center;padding:20px;font-size:11px;color:var(--dim)">전생의 미련이 없습니다.</div>':
      list.map((u,i)=>`
        <div style="padding:10px 12px;background:${u.resolved?'#060c06':'#0a0010'};border:1px solid ${u.resolved?'#1a4a1a':'#3a1060'};margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:9px;color:${prioColor[u.priority]||'#60a0c0'};background:${prioColor[u.priority]||'#60a0c0'}18;padding:1px 6px;border-radius:2px">${{high:'★최우선',normal:'일반',low:'낮음'}[u.priority]||'일반'}</span>
            <span style="font-size:8px;color:var(--dim);margin-left:auto">${u.cycle}회차</span>
          </div>
          <div style="font-size:10px;color:${u.resolved?'var(--dim)':'#c090e0'};${u.resolved?'text-decoration:line-through':''}">${esc(u.text)}</div>
          <div style="font-size:8px;color:var(--dim);margin-top:3px">${esc(u.fromChar)}</div>
          ${!u.resolved?`<button onclick="resolveUnfinished(${list.length-1-i})" style="margin-top:6px;padding:3px 10px;background:#0a1a0a;border:1px solid #2a5a1a;color:#60c060;font-size:8px;cursor:pointer;font-family:Cinzel,serif">✅ 이번 생에 해결함</button>`:''}
        </div>`).join('')}
  </div>`;
}
window.renderUnfinishedPanel = renderUnfinishedPanel;

window.renderUnfinishedPanel=renderUnfinishedPanel;

export const WORLD_HISTORY_KEY='tf-world-history';

export function loadWorldHistory(){ return _v58load(WORLD_HISTORY_KEY)||[]; }
window.loadWorldHistory = loadWorldHistory;

export function saveWorldHistory(d){ _v58save(WORLD_HISTORY_KEY,(d||[]).slice(-50)); }
window.saveWorldHistory = saveWorldHistory;

export function recordWorldHistory(aiText){
  const matched=HISTORY_TRIGGERS.find(t=>t.re.test(aiText)); if(!matched) return;
  const hist=loadWorldHistory();
  if(hist.some(h=>h.cat===matched.cat&&(S.msgCount||0)-h.turn<3)) return;
  hist.push({cat:matched.cat,label:matched.label,cycle:loadCycleCount()||0,
    turn:S.msgCount||0,char:`${S.character?.name||'?'} (${S.character?.role||'?'})`,
    snippet:aiText.slice(0,80),at:new Date().toLocaleString('ko-KR')});
  saveWorldHistory(hist);
}
window.recordWorldHistory = recordWorldHistory;

window.recordWorldHistory=recordWorldHistory;

export function renderWorldHistoryPanel(){
  const body=document.getElementById('pb-world-history'); if(!body) return;
  const hist=loadWorldHistory().slice().reverse();
  const catColor={'👑 정치':'#e0c040','⚔️ 전투':'#e05050','🌌 엔딩':'#8060c0','🤝 외교':'#60c080','🗝️ 탐험':'#4090d0','🔥 혁명':'#e06020','⭐ 신성':'#e0d060'};
  const byCycle={};
  for(const h of hist.slice().reverse()){ if(!byCycle[h.cycle]) byCycle[h.cycle]=[]; byCycle[h.cycle].push(h); }
  body.innerHTML=`<div style="padding:10px 14px">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#60a080;letter-spacing:1px;margin-bottom:4px">🏛️ 세계 역사 (${hist.length}건)</div>
    <div style="font-size:9px;color:var(--dim);margin-bottom:12px">주요 사건이 자동으로 기록됩니다. 모든 회차 누적.</div>
    ${hist.length===0?'<div style="text-align:center;padding:20px;font-size:11px;color:var(--dim)">아직 기록된 역사가 없습니다.</div>':
      Object.entries(byCycle).sort((a,b)=>Number(b[0])-Number(a[0])).map(([cycle,events])=>`
        <div style="margin-bottom:12px">
          <div style="font-family:Cinzel,serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:5px;padding-bottom:3px;border-bottom:1px solid #2a1a05">${cycle}회차</div>
          ${events.map(h=>{const cc=catColor[h.cat]||'#8a8a6a'; return `
            <div style="padding:7px 10px;background:#060a04;border:1px solid #1a2010;border-left:2px solid ${cc}88;margin-bottom:4px;display:flex;gap:8px">
              <div style="min-width:50px;font-size:8px;color:${cc};font-family:Cinzel,serif">${h.cat}</div>
              <div><div style="font-size:9px;color:${cc}">${esc(h.label)}</div>
              <div style="font-size:8px;color:var(--dim)">${esc(h.snippet)}...</div></div>
            </div>`;}).join('')}
        </div>`).join('')}
  </div>`;
}
window.renderWorldHistoryPanel = renderWorldHistoryPanel;

window.renderWorldHistoryPanel=renderWorldHistoryPanel;

export const SEEN_EVENTS_KEY='tf-seen-season-events';

export function loadSeenEvents(){ return _v58load(SEEN_EVENTS_KEY)||{}; }
window.loadSeenEvents = loadSeenEvents;

export function markEventSeen(key){ const d=loadSeenEvents(); d[key]=true; _v58save(SEEN_EVENTS_KEY,d); }
window.markEventSeen = markEventSeen;

export function checkSeasonEvents(){
  const gt=(typeof loadGameTime==='function')?loadGameTime():null; if(!gt) return;
  const {season,day}=gt; const cycle=loadCycleCount()||0; const seen=loadSeenEvents();
  SEASON_EVENTS_DEFS.filter(e=>e.season===season&&e.day===day).forEach(ev=>{
    const key=`${cycle}-${season}-${ev.day}-${ev.name}`;
    if(!seen[key]){ markEventSeen(key);
      toastHTML(`🗓️ [${esc(season)} ${esc(day)}일] ${typeof getEntityIconHTML==='function'?getEntityIconHTML(ev,{size:14}):(ev.icon)} ${esc(ev.name)} — ${esc(ev.desc.slice(0,40))}`,4000);
      S._seasonEventToday=`${ev.icon} ${ev.name}: ${ev.desc.slice(0,60)}`;
      setTimeout(()=>{ S._seasonEventToday=null; },120000);
    }
  });
}
window.checkSeasonEvents = checkSeasonEvents;

window.checkSeasonEvents=checkSeasonEvents;

export function renderSeasonEventsPanel(){
  const body=document.getElementById('pb-season-events'); if(!body) return;
  const gt=(typeof loadGameTime==='function')?loadGameTime():{season:'봄',day:1,year:1};
  const seen=loadSeenEvents(); const cycle=loadCycleCount()||0;
  const seasons=['봄','여름','가을','겨울'];
  const sc={봄:'#e060a0',여름:'#e09030',가을:'#c06020',겨울:'#4080c0'};
  body.innerHTML=`<div style="padding:10px 14px">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#60a0c0;letter-spacing:1px;margin-bottom:6px">🌙 계절 이벤트</div>
    <div style="padding:7px 10px;background:#00080c;border:1px solid #1a4060;margin-bottom:12px;text-align:center;font-family:Cinzel,serif;font-size:11px;color:#80b0e0">현재: ${gt.season||'봄'} ${gt.year||1}년 ${gt.day||1}일</div>
    ${seasons.map(season=>{
      const color=sc[season]||'#808080';
      const events=SEASON_EVENTS_DEFS.filter(e=>e.season===season);
      return `<div style="margin-bottom:10px">
        <div style="font-family:Cinzel,serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px;border-bottom:1px solid ${color}44;padding-bottom:3px">${season}</div>
        ${events.map(ev=>{
          const key=`${cycle}-${season}-${ev.day}-${ev.name}`;
          const hasSeen=!!seen[key]; const isToday=gt.season===season&&gt.day===ev.day;
          const isPast=gt.season===season&&gt.day>ev.day;
          return `<div style="padding:6px 10px;background:${isToday?'#0a1018':'#04060c'};border:1px solid ${isToday?'#4080c0':hasSeen?'#1a3010':'#1a1a2a'};margin-bottom:3px;display:flex;gap:8px">
            <div style="min-width:28px;font-size:9px;color:${isToday?'#e0c040':color};font-family:Cinzel,serif">${ev.day}일</div>
            <div style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(ev,{size:14}):(ev.icon)}</div>
            <div style="flex:1">
              <div style="font-size:9px;color:${isToday?'#e8d070':hasSeen?'#60a040':isPast?'var(--dim)':color}">
                ${isToday?'▶':hasSeen?'✓':isPast?'✗':''} ${esc(ev.name)} ${ev.rare?'<span style="font-size:7px;color:#c06080">★희귀</span>':''}
              </div>
              <div style="font-size:8px;color:var(--dim)">${esc(ev.desc)}</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
    }).join('')}
  </div>`;
}
window.renderSeasonEventsPanel = renderSeasonEventsPanel;

window.renderSeasonEventsPanel=renderSeasonEventsPanel;

export function recordNpcGrowthSnapshot(){
  const npcs=(typeof loadNPCs==='function')?loadNPCs()||[]:[];
  if(!npcs.length) return;
  const growth=window.loadNpcGrowth(); const cycle=loadCycleCount()||0;
  for(const npc of npcs.slice(0,10)){
    if(!growth[npc.name]) growth[npc.name]={history:[],influenced:[]};
    growth[npc.name].history.push({cycle,rel:npc.relationship||0,role:npc.role||'?',turn:S.msgCount||0});
    if((npc.relationship||0)>=70) growth[npc.name].influenced.push({cycle,rel:npc.relationship||0});
  }
  saveNpcGrowth(growth);
}
window.recordNpcGrowthSnapshot = recordNpcGrowthSnapshot;

window.recordNpcGrowthSnapshot=recordNpcGrowthSnapshot;

export function getNpcGrowthBLS(){
  const growth=window.loadNpcGrowth(); const cycle=loadCycleCount()||0;
  if(cycle<1) return '';
  const grown=Object.entries(growth).filter(([,g])=>g.influenced&&g.influenced.some(i=>i.cycle<cycle))
    .map(([name,g])=>{const pr=g.influenced.filter(i=>i.cycle<cycle).slice(-1)[0]; return `${name}(전생${pr?.rel||0})`;}).slice(0,3);
  if(!grown.length) return '';
  return `\n[🎭 전생 인연 NPC] ${grown.join(', ')} — 이 NPC들은 전생에 깊은 인연이 있었다. 다시 만났을 때 왠지 모를 친근함이나 변화한 모습을 암시하라.`;
}
window.getNpcGrowthBLS = getNpcGrowthBLS;

window.getNpcGrowthBLS=getNpcGrowthBLS;

export function renderNpcGrowthPanel(){
  const body=document.getElementById('pb-npc-growth'); if(!body) return;
  const growth=window.loadNpcGrowth();
  const entries=Object.entries(growth).filter(([,g])=>g.history&&g.history.length>0);
  body.innerHTML=`<div style="padding:10px 14px">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#c080e0;letter-spacing:1px;margin-bottom:4px">🎭 NPC 성장 기록</div>
    <div style="font-size:9px;color:var(--dim);margin-bottom:12px">NPC들이 회차마다 어떻게 변화했는지 기록됩니다.</div>
    ${entries.length===0?'<div style="text-align:center;padding:20px;font-size:11px;color:var(--dim)">아직 기록이 없습니다.</div>':
      entries.map(([name,g])=>{
        const hist=(g.history||[]).slice(-5);
        const maxRel=Math.max(...hist.map(h=>h.rel||0));
        const influenced=(g.influenced||[]).length>0;
        return `<div style="padding:10px 12px;background:#0a0010;border:1px solid ${influenced?'#503080':'#1a1028'};margin-bottom:6px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:5px">
            <span style="font-family:Cinzel,serif;font-size:10px;color:${influenced?'#c080e0':'var(--dim)'}">${esc(name)}</span>
            ${influenced?'<span style="font-size:7px;color:#c080e0;background:#3a1060;padding:1px 5px;border-radius:2px">깊은 인연</span>':''}
            <span style="font-size:8px;color:var(--dim);margin-left:auto">최고 관계도 ${maxRel}</span>
          </div>
          <div style="display:flex;gap:3px;flex-wrap:wrap">
            ${hist.map(h=>`<div style="padding:3px 7px;background:#06000c;border:1px solid #2a1040;border-radius:2px;font-size:8px;color:var(--dim)">${h.cycle}회차 <span style="color:${h.rel>=70?'#c080e0':h.rel>=40?'#806090':'#3a2a4a'}">${h.rel}</span></div>`).join('')}
          </div>
        </div>`;
      }).join('')}
  </div>`;
}
window.renderNpcGrowthPanel = renderNpcGrowthPanel;

window.renderNpcGrowthPanel=renderNpcGrowthPanel;

export const COLLECTION_KEY='tf-collection-v2';

export function loadCollection(){ return _v58load(COLLECTION_KEY)||{items:{},enemies:{},locations:{}}; }
window.loadCollection = loadCollection;

export function saveCollection(d){ _v58save(COLLECTION_KEY,d); }
window.saveCollection = saveCollection;

export function recordCollectionItem(type,name){
  if(!name||name.length<2) return;
  const col=loadCollection();
  if(!col[type]) col[type]={};
  if(!col[type][name]){
    col[type][name]={first:loadCycleCount()||0,count:1};
    saveCollection(col);
    const total=Object.keys(col[type]).length;
    if([10,25,50,100].includes(total)){
      toast(`💎 ${type==='items'?'아이템':type==='enemies'?'적':type==='locations'?'장소':'수집'} 도감 ${total}개 달성!`,2500);
      if(S.stats){const bs={items:'luk',enemies:'str',locations:'agi'}[type]||'luk';S.stats[bs]=Math.min(999,(S.stats[bs]||0)+3);if(typeof window.updateHeader==='function')window.updateHeader();}
    }
  } else { col[type][name].count=(col[type][name].count||1)+1; saveCollection(col); }
}
window.recordCollectionItem = recordCollectionItem;

window.recordCollectionItem=recordCollectionItem;

export function renderCollectionPanel(){
  const body=document.getElementById('pb-collection'); if(!body) return;
  const col=loadCollection();
  const sections=[{key:'items',label:'아이템',icon:'⚗️',color:'#c0a030',target:100},{key:'enemies',label:'적',icon:'💀',color:'#e05050',target:50},{key:'locations',label:'장소',icon:'🗺️',color:'#60a0c0',target:40}];
  body.innerHTML=`<div style="padding:10px 14px">
    <div style="font-family:Cinzel,serif;font-size:10px;color:#d09030;letter-spacing:1px;margin-bottom:4px">💎 수집 도감</div>
    <div style="font-size:9px;color:var(--dim);margin-bottom:12px">발견한 것들이 자동으로 수집됩니다. 환생 후에도 누적됩니다.</div>
    ${sections.map(s=>{
      const entries=Object.entries(col[s.key]||{});
      const pct=Math.min(100,Math.round(entries.length/s.target*100));
      return `<div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-family:Cinzel,serif;font-size:9px;color:${s.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:9}):(s.icon)} ${s.label}</span>
          <span style="font-size:9px;color:${pct>=100?'#60c060':s.color}">${entries.length}/${s.target} (${pct}%)</span>
        </div>
        <div style="height:5px;background:#1a0800;border-radius:3px;overflow:hidden;margin-bottom:5px">
          <div style="height:100%;width:${pct}%;background:${s.color};transition:width .4s"></div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:3px">
          ${entries.slice(0,30).map(([name])=>`<div style="padding:2px 6px;background:#0a0600;border:1px solid ${s.color}33;border-radius:2px;font-size:8px;color:${s.color}99">${esc(name.slice(0,10))}</div>`).join('')}
          ${entries.length>30?`<div style="font-size:8px;color:var(--dim);padding:2px">+${entries.length-30}개</div>`:''}
        </div>
      </div>`;
    }).join('')}
    <div style="padding:7px 10px;background:#04040a;border:1px dashed #1a1a2a;font-size:9px;color:var(--dim)">💡 마일스톤: 아이템→LUK+3, 적→STR+3, 장소→AGI+3</div>
  </div>`;
}
window.renderCollectionPanel = renderCollectionPanel;

window.renderCollectionPanel=renderCollectionPanel;

export function getPastFameBLS(){
  const f=(typeof loadFameLegacy==='function')?loadFameLegacy():null;
  if(!f||(loadCycleCount()||0)<1) return '';
  return f.fameName?`\n[🗣️ 전생 명성] "${f.fameName}"의 이름이 세계에 전설처럼 남아있다. 오래된 NPC들이 그 이름에 반응할 수 있다. 직접 언급 최소화, 소문으로만.`:'';
}
window.getPastFameBLS = getPastFameBLS;

window.getPastFameBLS=getPastFameBLS;

export const PAST_PROPHECY_KEY='tf-past-prophecy';

export function loadPastProphecy(){ return _v58load(PAST_PROPHECY_KEY)||[]; }
window.loadPastProphecy = loadPastProphecy;

export function savePastProphecyCarryover(){
  const proph=(typeof loadProphecy==='function')?loadProphecy():null;
  if(!proph||!proph.prophecies) return;
  const unfulfilled=proph.prophecies.filter(p=>!p.fulfilled);
  if(!unfulfilled.length) return;
  const existing=loadPastProphecy(); const cycle=loadCycleCount()||0;
  for(const p of unfulfilled.slice(0,2)) existing.push({text:p.text,theme:p.theme||'운명',cycle,failedAt:S.msgCount||0});
  _v58save(PAST_PROPHECY_KEY,existing.slice(-10));
}
window.savePastProphecyCarryover = savePastProphecyCarryover;

window.savePastProphecyCarryover=savePastProphecyCarryover;

export function getPastProphecyBLS(){
  const past=loadPastProphecy().filter(p=>p.cycle<(loadCycleCount()||0));
  if(!past.length) return '';
  const items=past.slice(-2).map(p=>`"${p.text.slice(0,40)}"`).join(' / ');
  return `\n[🔮 이월된 예언] 전생에 실현되지 못한 예언: ${items} — 이번 생에 복선만 심어라. 강제 금지.`;
}
window.getPastProphecyBLS = getPastProphecyBLS;

window.getPastProphecyBLS=getPastProphecyBLS;

(function wrapBLSV58(){
  if(window._v58BLSWrapped) return;
  window._v58BLSWrapped=true;
  const check=()=>{
    if(typeof window.buildLightSystem!=='function'){ setTimeout(check,500); return; }
    const orig=window.buildLightSystem;
    window.buildLightSystem=function(...args){
      let r=orig.apply(this,args);
      try{const h=getUnfinishedBLS();if(h)r+=h;}catch(e){}
      try{const h=getPastFameBLS();if(h)r+=h;}catch(e){}
      try{const h=getPastProphecyBLS();if(h)r+=h;}catch(e){}
      try{const h=getNpcGrowthBLS();if(h)r+=h;}catch(e){}
      try{if(typeof getThrallBLS==='function'){const h=getThrallBLS();if(h)r+=h;}}catch(e){}
      // [19차 감사 FIX] bare 식별자(getPrisonerBLS/getVampireCharonicleBLS)는
      // 다른 모듈(ai-prompt/148, progression/020)에서 window.X로만
      // 노출돼 있어 여기서 한 번도 resolve된 적이 없었다(try/catch에
      // 조용히 삼켜짐) — 포로 상태·뱀파이어 연대기가 AI 서사에 단 한
      // 번도 전달되지 못하고 있었다. window.X로 교정.
      try{if(typeof window.getPrisonerBLS==='function'){const h=window.getPrisonerBLS();if(h)r+=h;}}catch(e){}
      try{if(typeof window.getVampireCharonicleBLS==='function'){const h=window.getVampireCharonicleBLS();if(h)r+=h;}}catch(e){}
      if(S._seasonEventToday) r+=`\n[🌙 오늘의 계절 이벤트] ${S._seasonEventToday} — 서사에 반영하라.`;
      return r;
    };
  };
  check();
})();

(function hookV58(){
  if(window._v58Hooked) return;
  window._v58Hooked=true;
  const ob=new MutationObserver(muts=>{
    for(const m of muts){ for(const node of m.addedNodes){
      if(node.nodeType!==1) continue;
      const bubble=node.classList?.contains('msg-ai')?node:node.querySelector?.('.msg-ai');
      if(!bubble) continue;
      const text=bubble.innerText||bubble.textContent||'';
      if(!text||text.length<20) continue;
      captureHallOfMemory(text);
      recordWorldHistory(text);
      checkSeasonEvents();
      const itemM=text.match(/([가-힣a-zA-Z]{2,10})(을|를)\s*(획득|발견|얻었|주웠)/);
      if(itemM) recordCollectionItem('items',itemM[1]);
      const enemyM=text.match(/([가-힣a-zA-Z]{2,8})(이|가)\s*(쓰러졌|처치|패배|죽었)/);
      if(enemyM) recordCollectionItem('enemies',enemyM[1]);
    }}
  });
  const tryA=()=>{ const el=document.getElementById('msgs'); if(el) ob.observe(el,{childList:true,subtree:true}); else setTimeout(tryA,800); };
  tryA();
})();

setTimeout(function(){
  if(window._v58ReincHooked) return;
  window._v58ReincHooked=true;
  const orig=window.doReincarnate;
  if(typeof orig!=='function') return;
  window.doReincarnate=function(...args){
    saveUnfinishedGoals();
    savePastProphecyCarryover();
    recordNpcGrowthSnapshot();
    return orig.apply(this,args);
  };
},150);
