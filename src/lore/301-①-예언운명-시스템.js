// ① 🔮 예언/운명 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { accumulateDivineAttention } from '../misc/016-2130번-시스템.js';
import { saveDiaryEntry } from '../misc/076-파트2-D-일기기록-시스템.js';
import { pickGeneratedObject, recordGeneratedObject, recordMarkovSample } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { callGeminiDirect } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { callLocalModelJSON, tryCloudThenLocalModelThenBank } from '../quest/331-로컬-AI-모델-엔진.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadProphecies, saveProphecies } from './157-예언-성취-추적-시스템.js';

export const MY_PROPHECY_KEY = 'tf-prophecy';

export function loadProphecy(){ try{ return JSON.parse(lsGet(MY_PROPHECY_KEY)||'null'); }catch(e){ return null; } }
window.loadProphecy = loadProphecy;

export function saveProphecy(d){ try{ lsSet(MY_PROPHECY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveProphecy = saveProphecy;

// ══════════════════════════════════════════════════════════════════
// 로컬 예언 생성 엔진 (AI 미사용) — 원래도 "모호하고 시적으로, 뒤틀린
// 방식으로 실현될 수 있게"가 규칙이었다. 즉 캐릭터별로 딱 맞는 구체적인
// 문장일 필요가 없다 — 주제(죽음/선택/배신/영광/사랑/상실)별 시적인
// 문장 뱅크에서 매번 서로 다른 4개를 뽑아 조합한다.
// ══════════════════════════════════════════════════════════════════
const PROPHECY_BANK = {
  죽음: [
    '한 번은 죽음의 문턱을 넘나들 것이나, 그 문이 닫히는 날은 스스로 정하지 못하리라.',
    '검은 그림자가 세 번 그대를 스칠 것이나, 세 번째에는 다른 이의 것이리라.',
    '숨이 멎는 순간, 가장 가까운 이의 이름을 부르게 되리라.',
    '죽음은 끝이 아니라 다른 문의 시작임을, 그대는 몸소 알게 되리라.',
  ],
  선택: [
    '두 갈래 길 앞에서, 옳은 것과 원하는 것 중 하나를 버려야 하리라.',
    '가장 쉬운 선택이 가장 무거운 대가를 남기리라.',
    '한 번의 결정이 천 개의 운명을 갈라놓으리라.',
    '망설임이야말로 그대의 가장 큰 적이 되는 순간이 오리라.',
  ],
  배신: [
    '믿었던 손이 등 뒤에서 칼을 쥐는 날이 오리라.',
    '가장 가까운 곳에서 가장 깊은 상처가 시작되리라.',
    '충성을 맹세한 자 중 하나가 진실을 감추고 있으리라.',
    '배신자를 알아보는 눈은, 이미 늦은 뒤에야 뜨이리라.',
  ],
  영광: [
    '그대의 이름이 노래로 남아 다음 세대까지 불리게 되리라.',
    '패배처럼 보이는 순간이, 훗날 가장 빛나는 전설이 되리라.',
    '왕관이 아니어도, 그대는 이미 누군가의 영웅이 되어 있으리라.',
    '가장 낮은 곳에서 시작해 가장 높은 곳에 이름을 새기리라.',
  ],
  사랑: [
    '마음을 준 자에게서 뜻밖의 진실을 듣게 되리라.',
    '가장 늦게 깨달은 마음이 가장 오래 남으리라.',
    '함께 걷는 길의 끝에서, 예상치 못한 이별 혹은 재회가 기다리리라.',
    '침묵 속에 감춰둔 마음이 결국 드러나는 날이 오리라.',
  ],
  상실: [
    '소중히 여기던 것 하나를 내려놓아야 다음 걸음을 뗄 수 있으리라.',
    '잃은 뒤에야 그 무게를 진정으로 알게 되는 것이 있으리라.',
    '되찾을 수 없는 것을 두고 떠나야 하는 순간이 오리라.',
    '상실의 끝에서 뜻밖의 것을 얻게 되리라.',
  ],
};
function composeLocalProphecies(count=4){
  const themes = Object.keys(PROPHECY_BANK).sort(()=>Math.random()-0.5).slice(0, count);
  return themes.map(theme=>{
    const bank = PROPHECY_BANK[theme];
    return { text: bank[Math.floor(Math.random()*bank.length)], theme, fulfilled:false };
  });
}
window.composeLocalProphecies = composeLocalProphecies;

export async function generateProphecy(){
  const char = S.character;
  if(!char){ toast('캐릭터를 먼저 생성하세요', 1500); return; }
  toast('🔮 예언을 새기는 중...', 800);
  const btn = document.getElementById('prophecy-gen-btn');
  if(btn) btn.disabled = true;

  // 예언은 원래도 "모호하고 시적으로" 짓게 되어있어 이름이 문장에 안
  // 박히므로, 종족+직업 버킷만으로 안전하게 재사용 가능하다.
  const prophecyBucketKey = 'prophecy|'+char.race+'|'+char.role;
  const reusedProphecy = pickGeneratedObject(prophecyBucketKey);
  // [복원] AI 우선 — 키가 있으면 캐릭터에 맞는 진짜 시적 예언 4개를
  // 시도하고, 없거나 실패·형식오류면 로컬 조합 폴백.
  const prophecyPrompt = `당신은 TaleForge RPG의 예언자입니다. 캐릭터를 위한 모호하고 시적인 예언 4개를 JSON으로 생성하세요. 이름이 직접 언급되지 않게, 뒤틀린 방식으로 실현될 수 있는 여지를 남기세요.
[캐릭터] ${char.race} ${char.role}
반드시 다음 JSON만 출력하세요:
{"prophecies":[{"text":"시적인 예언 문장","theme":"죽음|선택|배신|영광|사랑|상실 중 1개"}]} (정확히 4개)`;
  const _shapeProphecies = (raw)=>{
    const arr = Array.isArray(raw?.prophecies) ? raw.prophecies : null;
    if(!arr || arr.length<4) return null;
    const valid = arr.filter(p=>p && p.text).slice(0,4).map(p=>({ text:p.text, theme:p.theme||'운명', fulfilled:false }));
    if(valid.length!==4) return null;
    // [패턴 학습] 진짜 AI가 쓴 예언 문장만 코퍼스에 누적.
    valid.forEach(p=>recordMarkovSample('prophecy_text', p.text));
    return valid;
  };
  const prophecies = reusedProphecy ? reusedProphecy.prophecies : await tryCloudThenLocalModelThenBank(
    async () => _shapeProphecies(await callGeminiDirect(prophecyPrompt)),
    async () => _shapeProphecies(await callLocalModelJSON(prophecyPrompt, { maxTokens: 400 })),
    () => composeLocalProphecies(4),
    '예언 생성'
  );
  if(!reusedProphecy) recordGeneratedObject(prophecyBucketKey, { prophecies });

  saveProphecy({ prophecies, createdAt: Date.now(), charName: char.name });
  renderProphecyPanel();
  toast('🔮 예언이 새겨졌습니다', 2000);
  if(btn) btn.disabled = false;
}
window.generateProphecy = generateProphecy;

export function renderProphecyPanel(){
  const body = document.getElementById('pb-prophecy');
  if(!body) return;
  const p = loadProphecy();
  if(!p || !p.prophecies){
    body.innerHTML = `
      <div style="padding:20px;text-align:center">
        <div style="font-size:40px;margin-bottom:12px">🔮</div>
        <div style="font-family:Cinzel,serif;font-size:12px;color:var(--gold);margin-bottom:8px">운명의 예언</div>
        <div style="font-size:11px;color:var(--dim);line-height:1.6;margin-bottom:16px">게임 시작 시 AI가 캐릭터 전용 예언을 생성합니다.<br>예언은 플레이 중 모호한 방식으로 실현됩니다.</div>
        <button id="prophecy-gen-btn" class="btn btn-gold" onclick="generateProphecy()">🔮 예언 생성하기</button>
      </div>`;
    return;
  }
  const fulfilled = p.prophecies.filter(x=>x.fulfilled).length;
  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#c080ff;letter-spacing:1px;margin-bottom:4px">🔮 ${esc(p.charName||'')}의 운명</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:12px">${fulfilled}/${p.prophecies.length} 예언 실현됨</div>
      ${p.prophecies.map((pr,i)=>`
        <div style="padding:12px 14px;background:${pr.fulfilled?'#0a0820':'#060010'};border:1px solid ${pr.fulfilled?'#6040c0':'#3020a0'};margin-bottom:8px;border-radius:2px;position:relative">
          ${pr.fulfilled?'<div style="position:absolute;top:6px;right:8px;font-size:9px;color:#c080ff;font-family:Cinzel,serif">✓ 실현됨 (턴 '+pr.fulfilledAt+')</div>':''}
          <div style="font-size:10px;color:${pr.fulfilled?'#a060d0':'#8040b0'};margin-bottom:6px;font-family:Cinzel,serif;letter-spacing:.5px">${pr.theme||'운명'}</div>
          <div style="font-size:12px;color:${pr.fulfilled?'#c090e0':'#d0b0f0'};line-height:1.7;font-style:italic">"${esc(pr.text)}"</div>
          ${!pr.fulfilled?`<button onclick="fulfillProphecy(${i})" style="margin-top:8px;padding:3px 10px;font-size:8px;background:#1a0a30;border:1px solid #6040a0;color:#a060d0;cursor:pointer;font-family:Cinzel,serif;border-radius:2px">✓ 실현됨으로 표시</button>`:''}
        </div>`).join('')}
      <div style="margin-top:12px;text-align:center">
        <button id="prophecy-gen-btn" class="btn btn-dark" onclick="generateProphecy()" style="font-size:9px">🔮 새 예언 생성</button>
      </div>
    </div>`;
}
window.renderProphecyPanel = renderProphecyPanel;

window.renderProphecyPanel = renderProphecyPanel;

window.generateProphecy = generateProphecy;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_270(){
function fulfillProphecy(idOrIdx, howFulfilled, twisted){
  // [버그 수정] misc/298의 hookProphecyAnim이 이 함수(정의된 곳 밖)에서
  // window.fulfillProphecy를 감싸 실현 연출(animProphecyGlow)을 트리거
  // 하려 했지만, 이 함수의 실제 호출부가 bare 식별자라 그 감싸기가
  // 적용된 적이 없다 — 예언이 실현돼도 연출이 한 번도 재생되지 않았다.
  // 실제 정의부 맨 앞에 직접 연결한다.
  if(typeof window.animProphecyGlow==='function') window.animProphecyGlow();
  // [CRITICAL BUG FIX] fulfillProphecy가 두 군데 다른 시그니처/데이터구조로 중복
  // 정의돼 있었음. 호이스팅으로 이 버전(idx 기반, UI 버튼용)이 항상 이겨서
  // GS 핸들러의 (id, howFulfilled, twisted) 3개 인자 호출이 깨져 AI가 예언
  // 실현을 알려도 시스템이 반응 안 하던 버그. 두 데이터 구조를 모두 지원하도록 통합.
  if (typeof idOrIdx === 'string' && typeof loadProphecies === 'function') {
    // 텍스트(id) 기반 — GS 핸들러 경로 (loadProphecies 배열 구조)
    const proph = loadProphecies();
    const p = proph.find(x => x.id === idOrIdx);
    if (!p) return;
    if (twisted) {
      p.twisted = true;
      p.twistedDesc = howFulfilled;
      S._nextInjectedContext = (S._nextInjectedContext||'')
        +'\n\n[🔮 예언 반전!]\n예언 "'+p.text+'"이(가) 뒤틀린 방식으로 성취됐다:\n'+howFulfilled
        +'\n이 반전을 극적으로, 충격적으로 서사화하라. 예언이 틀린 게 아니라 해석이 달랐다.';
      toast('🔮 예언이 뒤틀린 방식으로 성취됐다!', 4500);
    } else {
      p.fulfilled = true;
      p.fulfillTurn = S.msgCount||0;
      S._nextInjectedContext = (S._nextInjectedContext||'')
        +'\n\n[🔮 예언 성취!]\n예언 "'+p.text+'"이(가) 성취됐다.\n'+(howFulfilled||'')
        +'\n이 순간을 장엄하게, 운명적으로 묘사하라.';
      toast('🔮 예언이 성취됐습니다!', 4000);
    }
    saveProphecies(proph);
    if (typeof addTimelineEvent==='function') addTimelineEvent('prophecy', '예언 성취: '+p.text.slice(0,20), {icon:'🔮'});
    if (typeof accumulateDivineAttention==='function') accumulateDivineAttention(twisted?15:10);
    return;
  }
  // 인덱스 기반 — UI 버튼 경로 (loadProphecy 단수 객체 구조)
  const idx = idOrIdx;
  const p = loadProphecy();
  if(!p || !p.prophecies[idx]) return;
  p.prophecies[idx].fulfilled = true;
  p.prophecies[idx].fulfilledAt = S.msgCount||0;
  saveProphecy(p);
  if (typeof accumulateDivineAttention==='function') accumulateDivineAttention(10);
  renderProphecyPanel();
  toast('🔮 예언이 실현되었습니다!', 2500);
  if(typeof saveDiaryEntry==='function'){
    saveDiaryEntry('event','[예언 실현] '+p.prophecies[idx].text);
  }
}
window.fulfillProphecy = fulfillProphecy;

window.fulfillProphecy = window.fulfillProphecy;
}

