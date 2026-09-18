// ⑦ 🧠 심층 트라우마 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { callGeminiDirect } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { recordMarkovSample } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { callLocalModelJSON, tryCloudThenLocalModelThenBank } from '../quest/331-로컬-AI-모델-엔진.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';

export const TRAUMA_DEEP_KEY = 'tf-trauma-deep';

export function loadTraumaDeep(){ try{ return JSON.parse(lsGet(TRAUMA_DEEP_KEY)||'[]'); }catch(e){ return []; } }
window.loadTraumaDeep = loadTraumaDeep;

export function saveTraumaDeep(d){ try{ lsSet(TRAUMA_DEEP_KEY, JSON.stringify(d)); }catch(e){} }
window.saveTraumaDeep = saveTraumaDeep;

// ══════════════════════════════════════════════════════════════════
// 로컬 트라우마 분석 엔진 (AI 미사용) — 플레이어가 자유롭게 입력한
// 트라우마 텍스트를 완전히 이해해 맞춤 문장을 짓는 건 AI의 언어이해
// 능력이 필요한 일이라 똑같이는 못 한다. 대신 흔한 트라우마 원형
// 9가지(화재/상실/배신/폭력/전쟁/감금/익사/실패/기타)를 키워드로
// 판정해, 그 원형에 맞는 트리거·페널티·치유 힌트를 뱅크에서 조합한다
// — "입력한 단어가 반영된다"는 점은 유지하면서 매번 완전히 다른
// 트라우마를 지어내지는 않는다.
// ══════════════════════════════════════════════════════════════════
const TRAUMA_CATEGORY_PATTERNS = [
  { key:'fire', pattern:/화재|불|타/ },
  { key:'water', pattern:/물|익사|빠지|바다|폭풍우|파도/ },
  { key:'captivity', pattern:/감금|포로|가둬|가두|갇|노예|속박/ },
  { key:'war', pattern:/전쟁|전투|살육|학살/ },
  { key:'violence', pattern:/폭력|맞|고문|폭행|칼|무기/ },
  { key:'betrayal', pattern:/배신|버림|버려|배반/ },
  { key:'death', pattern:/죽|잃|사망|장례|이별/ },
  { key:'failure', pattern:/실패|좌절|무능|패배/ },
];
const TRAUMA_BANK = {
  fire: [
    { name:'화염의 기억', trigger:'불이나 연기를 마주할 때', penalty:'몸이 굳어 순간적으로 반응이 늦어진다', healQuest:'불과 관련된 두려움을 정면으로 마주하는 경험', statPenalty:{stat:'wil', amount:8} },
    { name:'타오르는 악몽', trigger:'화재 현장이나 뜨거운 열기를 느낄 때', penalty:'식은땀과 함께 판단력이 흐려진다', healQuest:'불 속에서 누군가를 구하거나 지켜내는 경험', statPenalty:{stat:'wil', amount:10} },
  ],
  water: [
    { name:'가라앉는 감각', trigger:'깊은 물이나 익사의 위기를 마주할 때', penalty:'숨이 막히는 듯한 공포에 몸이 굳는다', healQuest:'물에 대한 두려움을 극복하는 경험', statPenalty:{stat:'end', amount:8} },
    { name:'파도의 기억', trigger:'거센 물살이나 폭풍우를 만날 때', penalty:'평정심을 잃고 실수가 잦아진다', healQuest:'거친 물길을 스스로의 힘으로 헤쳐나가는 것', statPenalty:{stat:'end', amount:10} },
  ],
  captivity: [
    { name:'갇힌 기억', trigger:'좁고 어두운 공간에 갇힐 때', penalty:'호흡이 가빠지며 집중이 흐트러진다', healQuest:'스스로의 힘으로 갇힌 곳을 벗어나는 경험', statPenalty:{stat:'wil', amount:8} },
    { name:'속박의 흔적', trigger:'자유를 빼앗기는 상황에 처할 때', penalty:'무력감에 사로잡혀 행동이 굼떠진다', healQuest:'누군가를 같은 처지에서 구해내는 것', statPenalty:{stat:'agi', amount:8} },
  ],
  war: [
    { name:'전장의 소음', trigger:'대규모 전투나 함성이 울릴 때', penalty:'과거의 기억이 겹쳐 보여 잠시 혼란스러워진다', healQuest:'전쟁의 원인이 된 사건을 매듭짓는 것', statPenalty:{stat:'wil', amount:10} },
    { name:'살아남은 자의 짐', trigger:'동료를 잃을 위기에 처할 때', penalty:'과거의 상실이 떠올라 판단이 느려진다', healQuest:'그때 지키지 못한 것을 이번에는 지켜내는 것', statPenalty:{stat:'agi', amount:8} },
  ],
  violence: [
    { name:'폭력의 잔상', trigger:'거친 물리적 충돌이 벌어질 때', penalty:'순간적으로 몸이 얼어붙는다', healQuest:'스스로의 힘으로 위험한 상황을 극복하는 경험', statPenalty:{stat:'str', amount:8} },
    { name:'맞섬의 두려움', trigger:'위협적인 존재와 대치할 때', penalty:'손이 떨려 평소만큼의 힘을 내지 못한다', healQuest:'자신을 위협했던 존재와 다시 마주해 이겨내는 것', statPenalty:{stat:'str', amount:10} },
  ],
  betrayal: [
    { name:'믿음의 균열', trigger:'누군가에게 신뢰를 요구받을 때', penalty:'선뜻 믿지 못해 관계 형성이 늦어진다', healQuest:'새로운 신뢰를 쌓아 배신의 기억을 극복하는 것', statPenalty:{stat:'wil', amount:8} },
    { name:'등 뒤의 상처', trigger:'가까운 이가 위험한 제안을 할 때', penalty:'과도하게 경계하며 판단이 흐트러진다', healQuest:'배신한 자와 마주하거나 그 이유를 알아내는 것', statPenalty:{stat:'per', amount:8} },
  ],
  death: [
    { name:'상실의 그림자', trigger:'누군가의 죽음을 목격할 때', penalty:'감정이 마비되어 냉정한 판단이 어려워진다', healQuest:'잃은 이의 뜻을 이어받는 계기를 만드는 것', statPenalty:{stat:'wil', amount:10} },
    { name:'떠나간 자리', trigger:'이별이나 죽음이 언급될 때', penalty:'마음이 무거워져 집중력이 떨어진다', healQuest:'그 죽음의 진실을 마주하고 애도를 마치는 것', statPenalty:{stat:'per', amount:8} },
  ],
  failure: [
    { name:'실패의 그림자', trigger:'중요한 순간에 실수할 위험에 처할 때', penalty:'과도하게 신중해져 기회를 놓친다', healQuest:'같은 종류의 도전에서 확실한 성공을 거두는 것', statPenalty:{stat:'wil', amount:8} },
    { name:'무너진 자신감', trigger:'누군가 자신의 능력을 의심할 때', penalty:'스스로를 의심하며 판단이 흔들린다', healQuest:'자신의 실력을 스스로에게 증명하는 경험', statPenalty:{stat:'per', amount:8} },
  ],
  general: [
    { name:'말 못할 상처', trigger:'그 기억을 떠올리게 하는 상황에 처할 때', penalty:'마음이 흔들려 평소만큼의 실력을 내지 못한다', healQuest:'그 상처와 마주하고 스스로 매듭짓는 경험', statPenalty:{stat:'wil', amount:8} },
    { name:'가슴 속 응어리', trigger:'비슷한 상황이 반복될 때', penalty:'감정이 요동쳐 집중력이 흐트러진다', healQuest:'과거를 극복했음을 스스로 증명하는 계기', statPenalty:{stat:'per', amount:8} },
  ],
};
function composeLocalTrauma(traumaText){
  const cat = TRAUMA_CATEGORY_PATTERNS.find(c=>c.pattern.test(traumaText||''));
  const bank = TRAUMA_BANK[cat?.key || 'general'];
  return bank[Math.floor(Math.random()*bank.length)];
}
window.composeLocalTrauma = composeLocalTrauma;

export async function addTraumaDeep(traumaText){
  const existing = loadTraumaDeep();
  if(existing.length>=5){ toast('트라우마는 최대 5개입니다',1500); return; }
  // [복원] AI 우선 — 플레이어가 직접 쓴 트라우마 텍스트는 자유 서술이라
  // 키가 있으면 그 내용을 실제로 이해해서 맞춤 트리거/페널티/치유법을
  // 시도하고, 없거나 실패하면 키워드 원형 매칭 로컬 조합으로 폴백.
  const traumaPrompt = `당신은 TaleForge RPG의 심리 서사 설계자입니다. 플레이어가 직접 쓴 트라우마를 분석해 게임 데이터로 변환하세요.
[플레이어가 쓴 트라우마] ${traumaText}
반드시 다음 JSON만 출력하세요:
{"name":"트라우마 이름(5자 이내)","trigger":"이 트라우마가 발동하는 상황 1문장","penalty":"발동 시 나타나는 증상 1문장","healQuest":"치유할 수 있는 경험 1문장","statPenalty":{"stat":"str|agi|end|mgc|int|luk|per|wil 중 1개","amount":6~10 사이 숫자}}`;
  const _shapeTrauma = (raw)=>{
    if(!raw || !raw.name || !raw.trigger || !raw.penalty) return null;
    // [패턴 학습] 진짜 AI가 분석한 트리거/증상만 코퍼스에 누적.
    recordMarkovSample('trauma_trigger', raw.trigger);
    recordMarkovSample('trauma_penalty', raw.penalty);
    return {
      name: raw.name, trigger: raw.trigger, penalty: raw.penalty,
      healQuest: raw.healQuest||'', statPenalty: { stat: raw.statPenalty?.stat||'wil', amount: Math.max(6, Math.min(10, raw.statPenalty?.amount||8)) },
    };
  };
  const result = await tryCloudThenLocalModelThenBank(
    async () => _shapeTrauma(await callGeminiDirect(traumaPrompt)),
    async () => _shapeTrauma(await callLocalModelJSON(traumaPrompt, { maxTokens: 250 })),
    () => composeLocalTrauma(traumaText),
    '트라우마 생성'
  );
  existing.push({ ...result, rawText:traumaText, healed:false, addedAt:S.msgCount||0 });
  saveTraumaDeep(existing);
  renderTraumaDeepPanel();
  toast('🧠 트라우마가 기록되었습니다',1800);
}
window.addTraumaDeep = addTraumaDeep;

export function healTrauma(idx){
  const tl = loadTraumaDeep();
  if(!tl[idx]) return;
  if(!confirm(`"${tl[idx].name}" 트라우마를 치유하시겠습니까? (퀘스트 완료 후 사용)`)) return;
  tl[idx].healed = true;
  tl[idx].healedAt = S.msgCount||0;
  saveTraumaDeep(tl);
  renderTraumaDeepPanel();
  toast('💚 트라우마가 치유되었습니다!',2000);
}
window.healTrauma = healTrauma;

export function getTraumaDeepBLS(){
  const tl = loadTraumaDeep().filter(t=>!t.healed);
  if(!tl.length) return '';
  const desc = tl.map(t=>`[${t.name||'트라우마'}: 트리거="${t.trigger||'?'}" 발동시 "${t.penalty||'?'}"]`).join(' ');
  return `\n[🧠 심층 트라우마] ${desc} — 트리거 상황이 발생하면 반드시 트라우마 반응을 서사에 반영하라. 캐릭터가 일시적으로 흔들리거나 페널티를 받는 장면을 묘사.`;
}
window.getTraumaDeepBLS = getTraumaDeepBLS;

export function renderTraumaDeepPanel(){
  const body = document.getElementById('pb-trauma-deep');
  if(!body) return;
  const tl = loadTraumaDeep();
  body.innerHTML=`
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#9060c0;letter-spacing:1px;margin-bottom:4px">🧠 심층 트라우마</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:10px;line-height:1.5">트라우마는 특정 상황에서 판정 페널티를 주고 AI 서사에 반영됩니다.<br>치유 퀘스트를 완료하면 제거됩니다.</div>
      <!-- 새 트라우마 추가 -->
      <div style="display:flex;gap:5px;margin-bottom:12px">
        <input id="trauma-input" placeholder="트라우마 경험 입력 (예: 화재로 가족을 잃은 기억)" style="flex:1;padding:7px 10px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-family:Crimson Text,serif;font-size:12px;outline:none" maxlength="80"/>
        <button class="btn btn-gold" onclick="(function(){const v=document.getElementById('trauma-input').value.trim();if(!v)return;addTraumaDeep(v);document.getElementById('trauma-input').value='';})();" style="padding:6px 10px;font-size:10px">기록</button>
      </div>
      ${tl.length===0?'<div style="text-align:center;padding:20px;font-size:11px;color:var(--dim)">기록된 트라우마가 없습니다.</div>':
        tl.map((t,i)=>`
          <div style="padding:11px 13px;background:${t.healed?'#060c06':'#080010'};border:1px solid ${t.healed?'#2a5a2a':'#3a1060'};margin-bottom:8px;border-radius:2px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:9px;color:${t.healed?'#60c060':'#9060c0'};font-family:Cinzel,serif">${esc(t.name||'트라우마')}</span>
              ${t.healed?'<span style="font-size:8px;color:#60c060;margin-left:auto">💚 치유됨</span>':''}
            </div>
            ${!t.healed?`
              <div style="font-size:9px;color:#c0a0d0;margin-bottom:3px">⚡ 트리거: ${esc(t.trigger||'?')}</div>
              <div style="font-size:9px;color:#e07050;margin-bottom:3px">📉 페널티: ${esc(t.penalty||'?')}</div>
              ${t.statPenalty?`<div style="font-size:9px;color:#e05050;margin-bottom:5px">📊 스탯 페널티: ${t.statPenalty.stat} -${t.statPenalty.amount}</div>`:''}
              <div style="font-size:9px;color:#60a060;margin-bottom:8px">🌱 치유 힌트: ${esc(t.healQuest||'?')}</div>
              <button onclick="healTrauma(${i})" style="padding:4px 12px;background:#060c06;border:1px solid #2a5a1a;color:#60c060;font-size:9px;cursor:pointer;font-family:Cinzel,serif">💚 치유 완료로 표시</button>
            `:`<div style="font-size:9px;color:var(--dim)">"${esc(t.rawText||'')}" — 치유됨 (턴${t.healedAt})</div>`}
          </div>`).join('')}
    </div>`;
}
window.renderTraumaDeepPanel = renderTraumaDeepPanel;

window.renderTraumaDeepPanel = renderTraumaDeepPanel;

window.addTraumaDeep = addTraumaDeep;

window.healTrauma = healTrauma;

window.getTraumaDeepBLS = getTraumaDeepBLS;
