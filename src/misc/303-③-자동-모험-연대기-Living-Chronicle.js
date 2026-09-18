// ③ ✍️ 자동 모험 연대기 (Living Chronicle)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadProphecy } from '../lore/301-①-예언운명-시스템.js';
import { _simKey, getCurrentFactions, loadFactionSim, loadNpcBonds } from '../npc/067-③-NPC-관계망-시스템.js';
import { loadNpcAgenda } from '../npc/305-⑤-NPC-비밀-아젠다-이중성-시스템.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { callGeminiDirect } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { recordMarkovSample } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { callLocalModelJSON, tryCloudThenLocalModelThenBank } from '../quest/331-로컬-AI-모델-엔진.js';
import { esc, lsGet, lsSet } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { getCalendarEffect } from '../world/306-⑥-세계-시간-달력-시스템-확장.js';
import { loadFactionGoals } from './068-전쟁-피해-플레이어-개입-시스템.js';

export const CHRONICLE_KEY = 'tf-chronicle';

export const CHRONICLE_INTERVAL = 10;

export function loadChronicle(){ try{ return JSON.parse(lsGet(CHRONICLE_KEY)||'[]'); }catch(e){ return []; } }
window.loadChronicle = loadChronicle;

export function saveChronicle(d){ try{ lsSet(CHRONICLE_KEY, JSON.stringify(d.slice(-30))); }catch(e){} }
window.saveChronicle = saveChronicle;

// ══════════════════════════════════════════════════════════════════
// 로컬 연대기 서술 엔진 (AI 미사용) — 최근 대사 텍스트에서 키워드로
// 분위기(mood)를 판정하고, 그 분위기에 맞는 문장 뱅크에서 2문장을
// 조합한다. "일어난 사건을 정확히 요약"하지는 못하지만(그건 AI만
// 가능한 일반 요약 능력이 필요), 캐릭터·위치·분위기가 반영된 그럴듯한
// 서정적 일지 항목을 매번 다르게 만들어낸다.
// ══════════════════════════════════════════════════════════════════
function _chJosa(word, type){
  const ch = String(word).charCodeAt(String(word).length-1);
  const hasBatchim = ch>=0xAC00 && ch<=0xD7A3 && (ch-0xAC00)%28!==0;
  if(type==='은는') return hasBatchim ? '은' : '는';
  if(type==='을를') return hasBatchim ? '을' : '를';
  return '';
}
function _chFill(tpl, name, loc){
  return tpl
    .replace(/\{name:은는\}/g, name+_chJosa(name,'은는'))
    .replace(/\{loc:을를\}/g, loc+_chJosa(loc,'을를'))
    .replace(/\{name\}/g, name)
    .replace(/\{loc\}/g, loc);
}
const CHRONICLE_MOOD_PATTERNS = [
  { mood:'공포', pattern:/소름|섬뜩|공포|무서|괴물|비명|악몽/ },
  { mood:'슬픔', pattern:/눈물|상실|이별|죽음|사망|애도|쓸쓸|그리움/ },
  { mood:'환희', pattern:/축하|기쁨|웃음|승리|축제|환호|성공/ },
  { mood:'경이', pattern:/신비|경이|놀라운|장엄|아름다운|전설|유적/ },
  { mood:'긴장', pattern:/전투|공격|위험|추격|긴박|칼날|무기|경계/ },
];
function classifyChronicleMood(snippet){
  for(const p of CHRONICLE_MOOD_PATTERNS){ if(p.pattern.test(snippet)) return p.mood; }
  return '평온';
}
const CHRONICLE_BANK = {
  긴장: [
    '{name:은는} {loc}에서 숨죽인 채 다음 순간을 기다렸다.',
    '{loc}의 공기가 유독 무겁게 느껴지던 순간이었다.',
    '{name}의 손끝에서 긴장이 가시지 않았다.',
    '한 치 앞을 알 수 없는 상황 속에서 신경이 곤두섰다.',
  ],
  평온: [
    '{name:은는} {loc}에서 오랜만에 편히 숨을 돌렸다.',
    '{loc}의 고요함이 지친 마음을 조금씩 달래주었다.',
    '별다른 사건 없이, 하루가 무사히 저물었다.',
    '{name:은는} 잠시 걸음을 멈추고 주변을 둘러보았다.',
  ],
  슬픔: [
    '{name:은는} {loc}에서 말없이 지난 일을 곱씹었다.',
    '{loc}에 남은 흔적들이 유독 마음을 무겁게 했다.',
    '아무 말 없이, 그저 시간이 흘러가길 기다렸다.',
    '가슴 한구석이 시린 하루였다.',
  ],
  환희: [
    '{name:은는} {loc}에서 오랜만에 웃음을 되찾았다.',
    '{loc:을를} 가득 채운 활기가 마음에도 옮아왔다.',
    '작은 성취였지만, 충분히 벅찬 순간이었다.',
    '{name:은는} 가벼운 발걸음으로 다음 걸음을 내디뎠다.',
  ],
  공포: [
    '{name:은는} {loc}에서 등골이 서늘해지는 순간을 겪었다.',
    '{loc}에 감도는 기운이 심상치 않았다.',
    '애써 태연한 척했지만 손이 떨리고 있었다.',
    '보지 말아야 할 것을 본 듯한 느낌이 가시지 않았다.',
  ],
  경이: [
    '{name:은는} {loc}에서 좀처럼 보기 힘든 광경과 마주했다.',
    '{loc}의 풍경이 발걸음을 멈춰 세웠다.',
    '말로 다 설명하기 힘든 무언가가 주변을 감돌고 있었다.',
    '{name:은는} 한동안 그 자리에서 눈을 떼지 못했다.',
  ],
};
function composeLocalChronicleEntry(name, loc, mood){
  const bank = CHRONICLE_BANK[mood] || CHRONICLE_BANK.평온;
  const idx1 = Math.floor(Math.random()*bank.length);
  let idx2 = Math.floor(Math.random()*bank.length);
  if(bank.length>1) while(idx2===idx1) idx2 = Math.floor(Math.random()*bank.length);
  const s1 = _chFill(bank[idx1], name, loc);
  const s2 = bank.length>1 ? _chFill(bank[idx2], name, loc) : '';
  return [s1, s2].filter(Boolean).join(' ');
}
window.composeLocalChronicleEntry = composeLocalChronicleEntry;

export async function autoGenerateChronicle(recentMessages){
  const char = S.character;
  if(!char) return;
  // 최근 10턴 AI 메시지 요약(분위기 판정용 텍스트)
  const snippet = recentMessages.filter(m=>m.role==='assistant').slice(-10)
    .map(m=>(m.content||'').slice(0,150)).join(' / ');
  if(!snippet.trim()) return;
  const loc = (typeof loadCurrentLocation==='function') ? (loadCurrentLocation()?.name||'알 수 없는 곳') : '모험지';
  const lv = (typeof loadPlayerLevel==='function') ? loadPlayerLevel() : 1;
  const mood = classifyChronicleMood(snippet);
  // [복원] AI 우선 — 키가 있으면 최근 10턴의 실제 사건을 문학적으로
  // 압축한 진짜 연대기 항목을 시도하고, 없거나 실패하면 로컬 조합 폴백.
  const chroniclePrompt = `당신은 TaleForge RPG의 연대기 작가입니다. 아래 최근 사건들을 2문장의 서정적인 연대기 항목으로 압축하세요.
[캐릭터] ${char.name} / [장소] ${loc} / [분위기] ${mood}
[최근 사건 요약] ${snippet.slice(0,500)}
반드시 다음 JSON만 출력하세요: {"text":"2문장 연대기 서술"}`;
  const text = await tryCloudThenLocalModelThenBank(
    async () => {
      const raw = await callGeminiDirect(chroniclePrompt);
      if(raw && raw.text) recordMarkovSample('chronicle_text', raw.text);
      return (raw && raw.text) ? raw.text : null;
    },
    async () => {
      const raw = await callLocalModelJSON(chroniclePrompt, { maxTokens: 200 });
      if(raw && raw.text) recordMarkovSample('chronicle_text', raw.text);
      return (raw && raw.text) ? raw.text : null;
    },
    () => composeLocalChronicleEntry(char.name, loc, mood),
    '연대기 생성'
  );
  const entry = { text, mood, turn: S.msgCount||0, level: lv, location: loc, at: new Date().toLocaleString('ko-KR') };
  const ch = loadChronicle();
  ch.push(entry);
  saveChronicle(ch);
  // UI에 반영
  const badge = document.getElementById('chronicle-badge');
  if(badge){ badge.style.display='flex'; badge.textContent='NEW'; }
}
window.autoGenerateChronicle = autoGenerateChronicle;

export function hasObserverModeAccess(){
  try{
    const role = S.character?.role || '';
    if(role.includes('점성술사')) return true;
    const cycle = (typeof loadCycleCount==='function') ? loadCycleCount() : 0;
    if(cycle >= 5) return true; // "예언자" 칭호 해금 조건과 동일(minCycle:5)
    return false;
  }catch(e){ return false; }
}
window.hasObserverModeAccess = hasObserverModeAccess;

window.hasObserverModeAccess = hasObserverModeAccess;

export function getObserverModeVision(){
  try{
    if(!hasObserverModeAccess()) return null;
    const factions = getCurrentFactions();
    const names = Object.keys(factions);
    const sim = loadFactionSim();
    const goals = (typeof loadFactionGoals==='function') ? loadFactionGoals() : {};
    const bonds = (typeof loadNpcBonds==='function') ? loadNpcBonds() : {};

    const visions = [];

    // 전쟁/긴장 상태인 세력 쌍 중 하나를 무작위로 엿본다
    const tensePairs = [];
    for(let i=0;i<names.length;i++){
      for(let j=i+1;j<names.length;j++){
        const a=names[i], b=names[j];
        const k = _simKey(a,b);
        const t = sim.relations[k];
        if(t !== undefined && t >= 70) tensePairs.push({a,b,t});
      }
    }
    if(tensePairs.length){
      const p = tensePairs[Math.floor(Math.random()*tensePairs.length)];
      const level = p.t >= 90 ? '전면전이 벌어지고' : '군대가 국경에서 대치하고';
      visions.push(`👁️ 저 멀리, ${factions[p.a]?.icon||''}${p.a}와 ${factions[p.b]?.icon||''}${p.b} 사이에 ${level} 있는 모습이 흐릿하게 보인다.`);
    }

    // 진행 중인 세력 목표 하나를 엿본다
    const goalNames = Object.keys(goals);
    if(goalNames.length){
      const gName = goalNames[Math.floor(Math.random()*goalNames.length)];
      const g = goals[gName];
      visions.push(`👁️ ${factions[gName]?.icon||''}${gName}이(가) "${g.goal}"을 향해 은밀히 움직이는 것이 보인다. 아직 결말은 보이지 않는다.`);
    }

    // 진행 중인 NPC 관계 하나를 엿본다
    const bondKeys = Object.keys(bonds).filter(k => ['couple','feud'].includes(bonds[k].status));
    if(bondKeys.length){
      const bk = bondKeys[Math.floor(Math.random()*bondKeys.length)];
      const [a,b] = bk.split('|');
      const bond = bonds[bk];
      const desc = bond.status === 'couple' ? '서로에게 마음이 기울어가는' : '점점 멀어지며 원한이 쌓여가는';
      visions.push(`👁️ ${a}와 ${b}, 두 사람이 ${desc} 모습이 별빛 사이로 비친다.`);
    }

    if(!visions.length) return ['👁️ 별들이 조용하다. 지금은 아무 큰 사건도 흐르지 않는다.'];
    return visions;
  }catch(e){ console.warn('[getObserverModeVision]', e); return null; }
}
window.getObserverModeVision = getObserverModeVision;

window.getObserverModeVision = getObserverModeVision;

export function recordNonPlayerChronicleEntry(eventMsg, moodHint){
  try{
    if(!eventMsg) return;
    // 너무 자주 등재되면 "플레이어의 모험기"라는 본래 정체성이 흐려지므로
    // 25%만 실제로 등재 — 나머지는 그냥 게시판 소식으로만 남는다.
    if(Math.random() > 0.25) return;
    const ch = loadChronicle();
    const entry = {
      text: eventMsg,
      mood: moodHint || '경이',
      turn: S.msgCount || 0,
      level: (typeof loadPlayerLevel==='function') ? loadPlayerLevel() : 1,
      location: '세계 어딘가', // 플레이어가 직접 겪은 게 아니므로 구체적 위치를 명시하지 않음
      at: new Date().toLocaleString('ko-KR'),
      isWorldEvent: true, // 플레이어 모험기와 구분하는 마커
    };
    ch.push(entry);
    saveChronicle(ch);
    const badge = document.getElementById('chronicle-badge');
    if(badge){ badge.style.display='flex'; badge.textContent='NEW'; }
  }catch(e){ console.warn('[recordNonPlayerChronicleEntry]', e); }
}
window.recordNonPlayerChronicleEntry = recordNonPlayerChronicleEntry;

window.recordNonPlayerChronicleEntry = recordNonPlayerChronicleEntry;

export function renderChroniclePanel(){
  const body = document.getElementById('pb-chronicle');
  if(!body) return;
  const badge = document.getElementById('chronicle-badge');
  if(badge) badge.style.display='none';
  const ch = loadChronicle().slice().reverse();
  const moodColors = {긴장:'#e05040',평온:'#60a080',슬픔:'#6080c0',환희:'#e0c040',공포:'#8040b0',경이:'#40b0a0'};
  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#e8c060;letter-spacing:1px;margin-bottom:4px">✍️ 모험 연대기</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:12px">매 10턴마다 AI가 자동으로 이 구간의 서사를 문학적 문체로 기록합니다.</div>
      ${ch.length===0?`<div style="text-align:center;padding:20px;font-size:11px;color:var(--dim)">아직 기록된 연대기가 없습니다.<br>10턴마다 자동 생성됩니다.</div>`:
      ch.map((e,i)=>`
        <div style="padding:12px 14px;background:#0a0800;border:1px solid #2a2000;border-left:3px solid ${moodColors[e.mood]||'#c8a040'};margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="font-size:9px;color:${moodColors[e.mood]||'#c8a040'};background:${(moodColors[e.mood]||'#c8a040')+'18'};border:1px solid ${(moodColors[e.mood]||'#c8a040')+'44'};padding:1px 7px;border-radius:2px;font-family:Cinzel,serif">${e.mood||'평온'}</span>
            ${e.isWorldEvent?'<span style="font-size:8px;color:#8a7a5a;background:#1a1500;border:1px solid #3a3000;padding:1px 6px;border-radius:2px">🌍 세상의 소문</span>':''}
            <span style="font-size:8px;color:var(--dim);margin-left:auto">Lv.${e.level} · 턴${e.turn} · ${e.location}</span>
          </div>
          <div style="font-size:12px;color:#d4b870;line-height:1.8;font-style:italic">"${esc(e.text)}"</div>
          <div style="font-size:8px;color:var(--dim);margin-top:4px">${e.at}</div>
        </div>`).join('')}
    </div>`;
}
window.renderChroniclePanel = renderChroniclePanel;

window.renderChroniclePanel = renderChroniclePanel;

window.autoGenerateChronicle = autoGenerateChronicle;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_272(){
(function(){
  const _origBLS2 = window.buildLightSystem;
  if(_origBLS2 && !window._chronicleBLSWrapped){
    window._chronicleBLSWrapped = true;
    window.buildLightSystem = function(...args){
      let r = _origBLS2.apply(this, args);
      const dreamEff = S._dreamEffect;
      if(dreamEff) r += `\n\n[🌙 꿈의 여운] 최근 꿈에서의 경험: "${dreamEff.slice(0,80)}" — 이 여운이 캐릭터의 현재 태도와 감각에 미묘하게 반영되어 있다.`;
      // 예언 힌트
      const proph = loadProphecy();
      if(proph && proph.prophecies){
        const unfulfilled = proph.prophecies.filter(p=>!p.fulfilled);
        if(unfulfilled.length){
          r += `\n[🔮 미실현 예언] ${unfulfilled.map(p=>'"'+p.text.slice(0,40)+'"').join(' / ')} — 이 예언들이 언젠가 실현될 수 있도록 서사에 복선을 자연스럽게 녹여라. 직접 언급 금지.`;
        }
      }
      // NPC 비밀 아젠다
      const agenda = loadNpcAgenda();
      const visibleSecrets = Object.entries(agenda).filter(([,a])=>a.rel>=80&&!a.revealed).map(([n,a])=>`${n}(비밀:${(a.secret||'').slice(0,30)})`);
      if(visibleSecrets.length) r += `\n[🎭 NPC 비밀 — 관계도 80+] ${visibleSecrets.join(', ')} — 충분한 신뢰가 쌓였다. NPC가 자연스럽게 비밀을 흘릴 수 있다.`;
      // 달력 효과
      const calEff = getCalendarEffect();
      if(calEff) r += `\n[⏳ 달력 효과] ${calEff}`;
      return r;
    };
  }
})();
}

