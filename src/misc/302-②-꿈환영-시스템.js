// ② 🌙 꿈/환영 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RACE_DEFS } from '../race/013-종족-시스템.js';
import { getLearnedText, recordMarkovSample } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { callGeminiDirect } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { callLocalModelJSON, tryCloudThenLocalModelThenBank } from '../quest/331-로컬-AI-모델-엔진.js';
import { getActiveEffects } from '../ui/155-⑭-메모리-패널-UI.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';

export const DREAM_KEY = 'tf-dreams';

export function loadDreams(){ try{ return JSON.parse(lsGet(DREAM_KEY)||'[]'); }catch(e){ return []; } }
window.loadDreams = loadDreams;

export function saveDreams(d){ try{ lsSet(DREAM_KEY, JSON.stringify(d.slice(-20))); }catch(e){} }
window.saveDreams = saveDreams;

export function checkDreamTrigger(aiText, turn){
  // [버그 수정] 이 함수는 AI 메시지 말풍선이 DOM에 새로 추가될 때마다
  // (misc/308의 MutationObserver) 매번 호출된다 — 한 턴에 말풍선이
  // 여러 개 생기는 경우(주사위 결과 박스 + 서사 본문 등)도 있고, HP가
  // 낮은 상태로 여러 턴이 이어지면 매 말풍선마다 50% 확률로 새 꿈을
  // 또 발동시켰다. 쿨다운/재진입 방지가 전혀 없어서, HP가 낮은 채로
  // 여러 턴 머물면 triggerDream()이 초 단위로 수십~수백 번 겹쳐 호출되고
  // (실제 사용자 로그에서 228회 확인), 그때마다 로컬모델+클라우드 API를
  // 각각 두드리다 클라우드 무료 할당량까지 소진시켜 다른 생성(퀘스트·
  // 매턴 서사)까지 연쇄로 실패하게 만들었다. 또한 각 triggerDream() 호출이
  // 비동기로 서로 다른 시점에 끝나면서 먼저 뜬 꿈 팝업을 나중에 끝난
  // 호출이 조용히 덮어써 "마지막 팝업만 눌리고 눌러도 반응 없음" 현상의
  // 원인이 됐다. 아래 두 가지 가드를 추가한다:
  // ① 이미 꿈 팝업이 떠 있거나 생성 중이면(_dreamInFlight) 새로 시도하지
  //    않는다 — 팝업은 사용자가 선택하거나 닫아야 _dreamInFlight가 풀린다.
  // ② 같은 턴(msgCount) 안에서는 다시 시도하지 않고, 마지막 꿈 이후
  //    최소 5턴은 지나야 다시 시도한다(주기 발동 30턴 조건과는 별개로
  //    hp10처럼 매 턴 조건이 계속 참인 사유가 폭주하는 것을 막는다).
  if(S._dreamInFlight) return;
  if(S._lastDreamTurn != null && (turn - S._lastDreamTurn) < 5) return;

  const hp = S.stats?.hp || 100;
  const maxHp = S.stats?.maxHp || 100;
  const hpPct = hp / Math.max(maxHp, 1) * 100;
  // [CRITICAL BUG FIX] loadStatusEffects가 56555줄 정의(객체 반환)로 덮어써져서
  // 원래 기대하던 배열 .some() 호출 시 TypeError 발생 → MutationObserver 콜백 중단되던 버그.
  // getActiveEffects('player')는 배열을 반환하므로 이걸로 교체.
  const curseActive = (typeof getActiveEffects==='function') && getActiveEffects('player').some(e=>e.id&&e.id.includes('curse'));
  const aiLc = (aiText||'').toLowerCase();
  const npcDeath = /사망|죽었|목숨을 잃|숨을 거두|쓰러졌/.test(aiLc);

  const reasons = [];
  if(hpPct <= 10) reasons.push('hp10');
  if(curseActive && /잠을 청|휴식을 취|밤을 보내/.test(aiLc)) reasons.push('curse_sleep');
  if(npcDeath) reasons.push('npc_death');
  if(turn > 0 && turn % 30 === 0) reasons.push('periodic');

  // [변경] 예전엔 API 한도를 아끼려고 자동 발동을 꺼뒀었다(triggerDream이
  // Gemini를 직접 호출했었기 때문). 이제 triggerDream은 AI 호출이 전혀
  // 없는 로컬 조합 방식이라 그 제약이 사라져 다시 켠다.
  // [2026-08-27] 50% → 20%로 하향. 위의 재진입/쿨다운 가드로 폭주 자체는
  // 막았지만, HP가 낮은 위기 상황이 여러 턴 이어질 때 매번 붙는 5턴
  // 쿨다운마다 50% 확률로 계속 꿈이 끼어드는 것도 그 자체로 거슬린다는
  // 피드백을 반영 — 확률을 낮춰 "가끔 일어나는 특별한 일"에 가깝게 조정.
  if(reasons.length && Math.random() < 0.2){
    triggerDream(reasons[0]);
  }
}
window.checkDreamTrigger = checkDreamTrigger;

// ══════════════════════════════════════════════════════════════════
// 로컬 꿈 생성 엔진 (AI 미사용) — 발생 사유(reason)에 따라 어울리는 꿈
// 유형(전생/신탁/예시)을 가중치로 고르고, 문장 뱅크를 조합해 매번
// 다른 장면을 만든다. 전투/아이템 로컬화와 같은 원리.
// ══════════════════════════════════════════════════════════════════
const DREAM_TITLE_BANK = {
  전생: ['잊혀진 이름','오래된 맹세','낯선 얼굴의 기억','먼지 쌓인 기억','또 다른 삶의 조각'],
  신탁: ['속삭이는 목소리','별빛의 경고','침묵 속의 부름','운명의 갈림길','하늘이 전한 말'],
  예시: ['흐릿한 미래','아직 오지 않은 길','안개 속의 그림자','다가올 발자국','조각난 내일'],
};
const DREAM_OPEN_BANK = {
  전생: [
    '낯선 풍경 속에 서 있었다. 분명 처음 보는 곳인데, 몸이 그곳을 알고 있었다.',
    '누군가의 눈으로 세상을 보고 있었다. 그것이 자신이라는 확신이 들었다.',
    '오래된 목소리가 귓가에 맴돌았다 — 분명 들어본 적 없는 목소리인데도.',
  ],
  신탁: [
    '빛도 어둠도 아닌 공간에서, 목소리 하나가 또렷하게 울렸다.',
    '하늘이 갈라지며 무언가 거대한 존재의 시선이 느껴졌다.',
    '온 세상이 숨을 죽인 듯한 침묵 속에서, 말이 아닌 뜻이 전해졌다.',
  ],
  예시: [
    '눈앞의 풍경이 안개처럼 흐려졌다 선명해지길 반복했다.',
    '아직 일어나지 않은 어떤 순간이 스쳐 지나갔다.',
    '발밑의 길이 여러 갈래로 갈라지는 것이 보였다.',
  ],
};
const DREAM_MID_BANK = {
  전생: [
    '손끝에 익숙한 무게가 느껴졌다 — 지금은 가지고 있지 않은 무언가였다.',
    '누군가 이름을 불렀다. 낯설지만 분명 자신을 부르는 소리였다.',
    '그 순간의 감정만이 선명하게 남았다 — 후회인지 그리움인지 알 수 없었다.',
  ],
  신탁: [
    '말은 없었지만 뜻은 분명했다 — 아직 정해지지 않은 무언가가 있다는 것.',
    '경고인지 예언인지 모를 뜻이 마음 깊은 곳에 새겨졌다.',
    '그 존재는 아무것도 요구하지 않았다. 다만 지켜보고 있을 뿐이었다.',
  ],
  예시: [
    '익숙한 얼굴 하나가 스쳐 지나갔다. 지금과는 다른 표정을 하고 있었다.',
    '결정의 순간이 다가오고 있다는 감각만이 남았다.',
    '아직 일어나지 않은 일인데도, 이미 겪은 것처럼 생생했다.',
  ],
};
const DREAM_EFFECT_BANK = [
  '마음 한구석에 이상한 확신이 자리 잡았다.',
  '이유 모를 불안이 옅게 남았다.',
  '왠지 모를 용기가 솟아났다.',
  '무언가 놓치고 있다는 감각이 사라지지 않았다.',
];
const DREAM_CHOICES_BASE = [
  { text:'꿈의 의미를 곱씹어본다', result:'꿈의 잔상이 마음에 오래 남았다.' },
  { text:'대수롭지 않게 여기고 잊는다', result:'애써 눈을 감고 다시 잠을 청했다.' },
];
const DREAM_CHOICE_SHARE = { text:'누군가에게 이 꿈에 대해 이야기한다', result:'말로 옮기고 나니 한결 마음이 가벼워졌다.' };
const DREAM_REASON_TYPE_BIAS = {
  hp10: ['신탁','예시'],
  curse_sleep: ['신탁','전생'],
  npc_death: ['전생','신탁'],
  periodic: ['전생','신탁','예시'],
};

function composeLocalDream(reason){
  const typePool = DREAM_REASON_TYPE_BIAS[reason] || ['전생','신탁','예시'];
  const type = typePool[Math.floor(Math.random()*typePool.length)];
  const title = DREAM_TITLE_BANK[type][Math.floor(Math.random()*DREAM_TITLE_BANK[type].length)];
  const open = DREAM_OPEN_BANK[type][Math.floor(Math.random()*DREAM_OPEN_BANK[type].length)];
  const mid = DREAM_MID_BANK[type][Math.floor(Math.random()*DREAM_MID_BANK[type].length)];
  const effect = Math.random() < 0.7 ? DREAM_EFFECT_BANK[Math.floor(Math.random()*DREAM_EFFECT_BANK.length)] : '';
  const choices = DREAM_CHOICES_BASE.slice();
  if(Math.random() < 0.4) choices.push(DREAM_CHOICE_SHARE);
  // [버그 수정] 클라우드 프롬프트는 char.race/char.role을 넣어 개인화된
  // 꿈을 만들게 하는데, 로컬 폴백은 trigger(reason)로만 갈릴 뿐 종족은
  // 전혀 참조하지 않았다(전수조사로 발견). "전생의 기억" 유형은 종족과
  // 엮으면 자연스러우므로, 그 유형일 때만 30% 확률로 짧은 한 문장을 덧붙인다.
  const char = S.character||{};
  const race = (type==='전생' && char.race) ? RACE_DEFS.find(r=>r.name===char.race) : null;
  const raceHint = (race && Math.random()<0.3) ? ` ${char.race}의 피가 그 기억을 알아보는 듯했다.` : '';
  // [패턴 학습] 실제 AI가 쓴 꿈 묘사가 충분히 쌓였으면 35% 확률로 그
  // 패턴으로 즉석 생성한 묘사를 뱅크 대신 사용.
  const learnedDesc = Math.random()<0.35 ? getLearnedText('dream_desc') : null;
  return { title, desc: learnedDesc || (open+' '+mid+raceHint), type, effect, choices };
}
window.composeLocalDream = composeLocalDream;

export async function triggerDream(reason){
  const char = S.character;
  if(!char) return;
  // [버그 수정] 이 플래그가 true인 동안엔 checkDreamTrigger가 새 꿈을
  // 시도하지 않는다 — 생성이 끝난 뒤에도 플레이어가 팝업을 실제로
  // 닫을 때까지(chooseDream/dismissDreamPopup) 계속 true로 유지해,
  // 아직 화면에 떠 있는 팝업이 다른 비동기 호출에 의해 조용히
  // 덮어써지는 일이 없도록 한다.
  S._dreamInFlight = true;
  S._lastDreamTurn = S.msgCount||0;
  // [복원] AI 우선 — 키가 있으면 캐릭터/사유를 반영한 진짜 꿈 서사를
  // 시도하고, 없거나 실패·형식오류면 로컬 조합으로 폴백.
  const reasonLabel = {hp10:'생사의 갈림길',curse_sleep:'저주에 걸린 채 잠듦',npc_death:'가까운 이의 죽음을 목격',periodic:'긴 여정 중 문득 찾아온'}[reason]||'알 수 없는 계기';
  const dreamPrompt = `당신은 TaleForge RPG의 몽환적 서사 작가입니다. 캐릭터가 꾸는 상징적인 꿈 하나를 JSON으로 생성하세요.
[캐릭터] ${char.name||'주인공'} (${char.race||'인간'} ${char.role||'모험가'})
[꿈의 계기] ${reasonLabel}
반드시 다음 JSON만 출력하세요:
{"title":"꿈 제목 (10자 이내)","desc":"꿈 내용 묘사 2~3문장, 몽환적이고 상징적으로","type":"전생|신탁|예시","effect":"깨어난 뒤 남는 여운 1문장 (선택, 없으면 빈 문자열)"}`;
  const _shapeDream = (raw)=>{
    if(!raw || !raw.title || !raw.desc) return null;
    const choices = [
      { text:'꿈의 의미를 곱씹어본다', result:'꿈의 잔상이 마음에 오래 남았다.' },
      { text:'대수롭지 않게 여기고 잊는다', result:'애써 눈을 감고 다시 잠을 청했다.' },
    ];
    if(Math.random()<0.4) choices.push({ text:'누군가에게 이 꿈에 대해 이야기한다', result:'말로 옮기고 나니 한결 마음이 가벼워졌다.' });
    return { title:raw.title, desc:raw.desc, type:raw.type||'예시', effect:raw.effect||'', choices, _aiGenerated:true };
  };
  // [안전장치] 이 블록에서 예상 못한 예외가 나면(정상 흐름에선 bankFn이
  // 항상 성공해서 일어날 일이 없지만) 팝업을 못 띄운 채 _dreamInFlight만
  // true로 영구히 남아 이후 꿈이 전부 막히는 사고를 방지한다.
  try{
    const dream = await tryCloudThenLocalModelThenBank(
      async () => _shapeDream(await callGeminiDirect(dreamPrompt)),
      async () => _shapeDream(await callLocalModelJSON(dreamPrompt, { maxTokens: 250 })),
      () => composeLocalDream(reason),
      '꿈 생성'
    );
    // [패턴 학습] 실제 AI가 쓴 꿈 묘사만 코퍼스에 누적.
    if(dream._aiGenerated && dream.desc) recordMarkovSample('dream_desc', dream.desc);
    dream.turn = S.msgCount||0;
    dream.reason = reason;
    dream.at = new Date().toLocaleString('ko-KR');
    const dreams = loadDreams();
    dreams.push(dream);
    saveDreams(dreams);
    showDreamPopup(dream);
  }catch(e){
    console.warn('[triggerDream]', e);
    S._dreamInFlight = false;
  }
}
window.triggerDream = triggerDream;

export function showDreamPopup(dream){
  const existing = document.getElementById('dream-popup-ov');
  if(existing) existing.remove();
  const ov = document.createElement('div');
  ov.id = 'dream-popup-ov';
  ov.style.cssText = 'position:fixed;inset:0;z-index:900;background:rgba(0,5,20,.92);display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .5s ease';
  const typeLabel = {전생:'🌀 전생의 기억',신탁:'⭐ 신의 목소리',예시:'🌊 미래의 단편'}[dream.type]||'🌙 꿈';
  ov.innerHTML = `
    <div style="width:100%;max-width:360px;background:linear-gradient(160deg,#020818,#040a20);border:1px solid #3060a0;box-shadow:0 0 40px rgba(80,120,200,.3);padding:0;overflow:hidden">
      <div style="padding:12px 16px 10px;background:linear-gradient(90deg,#030a20,#050e28);border-bottom:1px solid #2050a0;text-align:center">
        <div style="font-size:9px;color:#6090c0;letter-spacing:2px;font-family:Cinzel,serif;margin-bottom:4px">${typeLabel}</div>
        <div style="font-size:14px;color:#a0c8f0;font-family:Cinzel,serif;letter-spacing:1px">${esc(dream.title||'꿈')}</div>
      </div>
      <div style="padding:16px;font-size:12px;color:#8ab0d8;line-height:1.8;font-style:italic">${esc(dream.desc||'')}</div>
      ${dream.effect?`<div style="padding:0 16px 12px;font-size:10px;color:#5080a0;line-height:1.5">✦ ${esc(dream.effect)}</div>`:''}
      <div style="padding:0 16px 16px;display:flex;flex-direction:column;gap:6px">
        ${(dream.choices||[]).map((c,i)=>`
          <button onclick="chooseDream(${i})" style="padding:10px 14px;background:#030c1e;border:1px solid #2a4870;color:#80a8d0;font-size:11px;cursor:pointer;text-align:left;transition:all .15s;border-radius:2px" onmouseover="this.style.borderColor='#4a80b0'" onmouseout="this.style.borderColor='#2a4870'">
            ${esc(c.text)}
          </button>`).join('')}
        <button onclick="dismissDreamPopup()" style="padding:8px;background:transparent;border:1px solid #1a3050;color:#3a6090;font-size:10px;cursor:pointer;font-family:Cinzel,serif;margin-top:2px">꿈에서 깨어난다</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  window._currentDreamChoices = dream.choices||[];
}
window.showDreamPopup = showDreamPopup;

// [버그 수정] 팝업이 실제로 닫힐 때(선택하거나 그냥 닫을 때) _dreamInFlight를
// 풀어줘야 다음 꿈이 다시 발동할 수 있다 — checkDreamTrigger의 재진입
// 방지 가드와 짝을 이루는 함수.
export function dismissDreamPopup(){
  document.getElementById('dream-popup-ov')?.remove();
  S._dreamInFlight = false;
}
window.dismissDreamPopup = dismissDreamPopup;

export function chooseDream(idx){
  const choices = window._currentDreamChoices||[];
  const choice = choices[idx];
  dismissDreamPopup();
  if(choice?.result){
    toast('🌙 '+choice.result.slice(0,60), 3000);
    // 꿈 선택을 BLS에 일시 주입
    S._dreamEffect = choice.result;
    setTimeout(()=>{ S._dreamEffect = null; }, 60000);
  }
}
window.chooseDream = chooseDream;

window.chooseDream = chooseDream;

export function renderDreamPanel(){
  const body = document.getElementById('pb-dream');
  if(!body) return;
  const dreams = loadDreams().slice().reverse();
  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#80c0ff;letter-spacing:1px;margin-bottom:4px">🌙 꿈의 기록</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:12px;line-height:1.5">특정 조건(HP 위기·저주·NPC 사망·30턴 주기)에서 자동 발생합니다.</div>
      ${dreams.length===0?`<div style="text-align:center;padding:20px;font-size:11px;color:var(--dim)">아직 꿈을 꾸지 않았습니다.</div>`:
      dreams.map(d=>{
        const typeLabel = {전생:'🌀',신탁:'⭐',예시:'🌊'}[d.type]||'🌙';
        return `<div style="padding:11px 13px;background:#030810;border:1px solid #1a3860;margin-bottom:8px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
            <span style="font-size:16px">${typeLabel}</span>
            <span style="font-size:10px;color:#6090b0;font-family:Cinzel,serif">${esc(d.title||'꿈')}</span>
            <span style="font-size:8px;color:var(--dim);margin-left:auto">턴 ${d.turn}</span>
          </div>
          <div style="font-size:10px;color:#7090b8;line-height:1.6;font-style:italic">${esc(d.desc||'')}</div>
          <div style="font-size:8px;color:var(--dim);margin-top:4px">${d.at||''}</div>
        </div>`;
      }).join('')}
    </div>`;
}
window.renderDreamPanel = renderDreamPanel;

window.renderDreamPanel = renderDreamPanel;
