// ② 선택 결과 추적 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { lsGet, lsSet } from '../utils.js';

export const CHOICE_HISTORY_KEY = 'tf-choice-history';

export const WORLD_STATE_KEY    = 'tf-world-state';

export function loadChoiceHistory(){ try{ return JSON.parse(lsGet(CHOICE_HISTORY_KEY)||'[]'); }catch(e){ return []; } }
window.loadChoiceHistory = loadChoiceHistory;

export function saveChoiceHistory(d){ try{ lsSet(CHOICE_HISTORY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveChoiceHistory = saveChoiceHistory;

export const WS_COUNTERS_KEY = 'tf-ws-counters';

export const WS_EVENTS_KEY   = 'tf-ws-events';

export function loadWorldState(){
  try{
    const cnt = lsGet(WS_COUNTERS_KEY); const evs = lsGet(WS_EVENTS_KEY);
    if (cnt) {
      return { ...JSON.parse(cnt), famousEvents: evs ? JSON.parse(evs) : [] };
    }
    return JSON.parse(lsGet(WORLD_STATE_KEY)||'{}');
  }catch(e){ return {}; }
}
window.loadWorldState = loadWorldState;

export function saveWorldState(d){
  try{
    const {famousEvents, ...counters} = d;
    lsSet(WS_COUNTERS_KEY, JSON.stringify(counters||{}));
    lsSet(WS_EVENTS_KEY,   JSON.stringify(famousEvents||[]));
    lsSet(WORLD_STATE_KEY, JSON.stringify(d)); // 하위호환
  }catch(e){}
}
window.saveWorldState = saveWorldState;

export function recordChoice(choice, context){
  const history = loadChoiceHistory();
  // [신규] 선택의 장기 파급력 보장 — 도덕적 무게가 있는 선택을 따로
  // 표시해둔다. 모든 선택을 다 회수 대상으로 삼으면 AI에게 과도한
  // 부담이 되니, "되돌릴 수 없거나 도덕적으로 무거운" 선택만 추적한다.
  const lc = choice.toLowerCase();
  const weighty = /죽|살인|배신|훔|약탈|위협|속이|거짓|도와|구했|살렸|용서|나눠|희생|지켜|맹세|약속|동맹|버렸|외면/.test(lc);
  history.push({
    choice: choice.slice(0,100),
    context: context.slice(0,80),
    turn: S.msgCount,
    at: new Date().toISOString(),
    // 결과 태그 (나중에 AI 응답에서 감지)
    consequence: null,
    weighty,
    // [신규] 장기 파급력 환기가 이미 한 번이라도 됐는지 — 같은 선택을
    // 반복해서 계속 환기시키면 AI에게 잡음이 되므로, 1회만 환기한다.
    longTermSurfaced: false,
  });
  saveChoiceHistory(history);

  // 세계 상태 업데이트
  updateWorldStateFromChoice(choice);
}
window.recordChoice = recordChoice;

export function getLongTermChoiceEcho(){
  try{
    const history = loadChoiceHistory();
    const curTurn = S?.msgCount||0;
    const candidate = history.find(c => c.weighty && !c.longTermSurfaced && (curTurn - (c.turn||0)) >= 25 && (curTurn - (c.turn||0)) <= 200);
    if(!candidate) return '';
    candidate.longTermSurfaced = true;
    saveChoiceHistory(history);
    return `\n[🔁 과거 선택의 파급력] ${candidate.turn}턴 즈음 플레이어는 다음 선택을 했다: "${candidate.choice}". 지금 시점에서 자연스럽게 그 선택의 결과가 다시 영향을 미칠 수 있다면(평판, 그 선택의 대상이 된 인물/세력의 반응, 소문 등) 서사에 가볍게 녹여라. 억지로 끼워넣지는 말고, 정말 자연스러울 때만 반영하라.`;
  }catch(e){ return ''; }
}
window.getLongTermChoiceEcho = getLongTermChoiceEcho;

window.getLongTermChoiceEcho = getLongTermChoiceEcho;

export function updateWorldStateFromChoice(choice){
  const ws = loadWorldState();
  const lc = choice.toLowerCase();

  // 도덕적 선택 추적
  const evil_words  = ['죽','살인','배신','훔','약탈','위협','속','거짓'];
  const good_words  = ['도와','구했','살렸','용서','나눠','희생','지켜'];
  const wise_words  = ['조사','탐구','협상','설득','분석','관찰'];

  if(evil_words.some(w=>lc.includes(w)))  ws.evilActs  = (ws.evilActs||0)+1;
  if(good_words.some(w=>lc.includes(w)))  ws.goodActs  = (ws.goodActs||0)+1;
  if(wise_words.some(w=>lc.includes(w)))  ws.wiseActs  = (ws.wiseActs||0)+1;

  // 주요 결정 기록
  const bigChoices = ['동맹','배신','왕','황제','신','계약','맹세','복수','포기','희생'];
  bigChoices.forEach(kw=>{
    if(lc.includes(kw)) ws['did_'+kw] = (ws['did_'+kw]||0)+1;
  });

  ws.totalChoices = (ws.totalChoices||0)+1;
  saveWorldState(ws);
}
window.updateWorldStateFromChoice = updateWorldStateFromChoice;

export function detectConsequences(aiText){
  const ws  = loadWorldState();
  const lc  = aiText.toLowerCase();
  const history = loadChoiceHistory();

  // 사망자 발생
  if(lc.includes('죽었') || lc.includes('쓰러졌') || lc.includes('사망'))
    ws.deathsWitnessed = (ws.deathsWitnessed||0)+1;

  // 동맹 형성
  if(lc.includes('동맹') || lc.includes('계약') || lc.includes('맹세'))
    ws.alliancesFormed = (ws.alliancesFormed||0)+1;

  // 명성 이벤트
  if(lc.includes('소문') || lc.includes('전설') || lc.includes('영웅'))
    ws.famousEvents = (ws.famousEvents||0)+1;

  saveWorldState(ws);

  // 최근 선택의 결과 태그 업데이트
  if(history.length>0 && !history[history.length-1].consequence){
    const lastChoice = history[history.length-1];
    if(lc.includes('성공') || lc.includes('해냈'))
      lastChoice.consequence = 'success';
    else if(lc.includes('실패') || lc.includes('잘못'))
      lastChoice.consequence = 'failure';
    else
      lastChoice.consequence = 'neutral';
    saveChoiceHistory(history);
  }
}
window.detectConsequences = detectConsequences;

export function getWorldStateDesc(){
  const ws = loadWorldState();
  const history = loadChoiceHistory();
  const parts = [];

  if(ws.evilActs  > 3) parts.push(`악행 ${ws.evilActs}회 (어두운 기운이 쌓임)`);
  if(ws.goodActs  > 3) parts.push(`선행 ${ws.goodActs}회 (선한 기운이 감돌음)`);
  if(ws.wiseActs  > 3) parts.push(`현명한 선택 ${ws.wiseActs}회`);
  if(ws.did_배신)   parts.push(`배신 경험 있음`);
  if(ws.did_희생)   parts.push(`희생 경험 있음`);
  if(ws.did_동맹)   parts.push(`동맹 체결 경험`);
  if(ws.alliancesFormed > 0) parts.push(`동맹 ${ws.alliancesFormed}개`);
  if(ws.deathsWitnessed > 0) parts.push(`목격한 죽음 ${ws.deathsWitnessed}건`);

  // 최근 선택 3개
  const cmap = {success:'성공', failure:'실패', neutral:'', null:'', undefined:''};
  const recent = history.slice(-3)
    .filter(h => h && h.choice)
    .map(h=>{ const tag = h.consequence&&h.consequence!=='neutral'?`(${cmap[h.consequence]||h.consequence})`:''; return `"${(h.choice||'').slice(0,30)}"${tag}`; });
  if(recent.length) parts.push(`최근 선택: ${recent.join(', ')}`);

  return parts.join(' · ')||'없음';
}
window.getWorldStateDesc = getWorldStateDesc;
