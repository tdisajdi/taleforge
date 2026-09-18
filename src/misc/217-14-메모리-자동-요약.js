// [14] 메모리 자동 요약
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { FACT_CATEGORY_PRIORITY, IMMEDIATE_HOOK_PATTERNS } from '../data/217-14-메모리-자동-요약.js';
import { loadMemory, saveMemory } from '../job/010-스킬-강화-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';

export function trimMidByTurnBlocks(text, maxLen){
  if(!text || text.length <= maxLen) return text;
  const marker = /\n*─── 턴 \d+~\d+ 요약 ───\n/;
  // 구분자로 분리 — 첫 조각은 구분자 이전(보통 빈 문자열)
  const parts = text.split(/(?=\n*─── 턴 \d+~\d+ 요약 ───\n)/);
  let blocks = parts.filter(p => p.trim());
  // 뒤에서부터(최신부터) 채워가며 maxLen을 넘지 않는 만큼만 유지
  let kept = [];
  let total = 0;
  for(let i = blocks.length - 1; i >= 0; i--){
    total += blocks[i].length;
    if(total > maxLen && kept.length > 0) break; // 최소 1블록은 보존
    kept.unshift(blocks[i]);
    if(total > maxLen) break;
  }
  return kept.join('');
}
window.trimMidByTurnBlocks = trimMidByTurnBlocks;

window.trimMidByTurnBlocks = trimMidByTurnBlocks;

export function addToMemory(key, value) {
  try {
    const mem = typeof loadMemory === 'function' ? loadMemory() : {};
    if (!mem.notes) mem.notes = {};
    mem.notes[key] = value;
    if (typeof saveMemory === 'function') saveMemory(mem);
  } catch(e) {}
}
window.addToMemory = addToMemory;

export function compressMemory() {
  try {
    const mem = typeof loadMemory === 'function' ? loadMemory() : {};
    if (mem.mid && mem.mid.trim()) return; // 이미 AI 요약이 있으면 절대 건드리지 않음
    const msgs = S?.messages || [];
    if (msgs.length < 20) return;
    // 최근 10개 메시지에서 핵심 추출 (AI 요약이 전혀 없을 때만의 임시 폴백)
    const recent = msgs.slice(-10).map(m => m.content || '').join(' ').slice(0, 500);
    mem.mid = recent.slice(0, 300);
    if (typeof saveMemory === 'function') saveMemory(mem);
  } catch(e) {}
}
window.compressMemory = compressMemory;

export function summarizeHistory() {
  try {
    const mem = typeof loadMemory === 'function' ? loadMemory() : {};
    return mem.core || mem.mid || '';
  } catch(e) { return ''; }
}
window.summarizeHistory = summarizeHistory;

export function autoSummarize() {
  try {
    const turn = S?.msgCount || 0;
    if (turn > 0 && turn % 20 === 0) compressMemory();
  } catch(e) {}
}
window.autoSummarize = autoSummarize;

export const RESOLVED_HOOKS_KEY = 'tf-resolved-hooks';

export function loadResolvedHooks(){ try{ return JSON.parse(lsGet(RESOLVED_HOOKS_KEY)||'[]'); }catch(e){ return []; } }
window.loadResolvedHooks = loadResolvedHooks;

export function saveResolvedHooks(d){ try{ lsSet(RESOLVED_HOOKS_KEY, JSON.stringify(d)); }catch(e){} }
window.saveResolvedHooks = saveResolvedHooks;

export function logResolvedHook(originalHook, resolution, turnRaised, turnResolved){
  try{
    const log = loadResolvedHooks();
    log.push({ originalHook, resolution, turnRaised: turnRaised||0, turnResolved: turnResolved||(S?.msgCount||0) });
    saveResolvedHooks(log); // 글자수/개수 제한 없음 — 하드코딩 소스용 영구 누적
  }catch(e){ console.warn('[logResolvedHook]', e); }
}
window.logResolvedHook = logResolvedHook;

window.logResolvedHook = logResolvedHook;

window.loadResolvedHooks = loadResolvedHooks;

export function addPermanentFact(category, text, turn){
  try{
    if(!text || !text.trim()) return;
    const mem = loadMemory();
    if(!Array.isArray(mem.facts)) mem.facts = [];
    // 같은 텍스트 중복 방지
    if(mem.facts.some(f => f.text === text)) return;
    mem.facts.push({ turn: turn||S?.msgCount||0, category: category||'unresolved_hook', text: text.slice(0,200) });
    // [설계 변경] 이 게임은 AI 생성 데이터를 무제한 누적해 추후 하드코딩
    // 소스로 활용하는 것이 목표(R10/R12)이므로, 인위적인 개수 제한으로
    // 사실을 강제 삭제하지 않는다. npc_death·world_change·identity_reveal·
    // irreversible_choice·relationship_turn 5개 카테고리는 영구적인
    // 사실이라 시간이 지나도 틀려질 일이 없어 무제한 보존해도 안전하다.
    // unresolved_hook(미해결 떡밥)만 자연스럽게 줄어드는데, 이는 개수
    // 제한이 아니라 processResolvedHooks()가 "실제로 해결됐을 때"만
    // 정확하게 제거하기 때문이다(해결된 떡밥은 RESOLVED_HOOKS_KEY에
    // 별도로 무제한 보존되어 데이터 손실도 없다).
    saveMemory(mem);
  }catch(e){ console.warn('[addPermanentFact]', e); }
}
window.addPermanentFact = addPermanentFact;

window.addPermanentFact = addPermanentFact;

export function detectImmediateNarrativeHook(cleanText, userMsg){
  try{
    if(!cleanText) return;
    for(const pat of IMMEDIATE_HOOK_PATTERNS){
      const m = cleanText.match(pat.re);
      if(!m) continue;
      // 매칭된 부분 주변 문맥(앞뒤 합쳐 약 60자)을 떡밥 원문으로 보존
      const idx = cleanText.indexOf(m[0]);
      const context = cleanText.slice(Math.max(0, idx-20), idx + m[0].length + 30).trim();
      if(typeof addPermanentFact==='function'){
        addPermanentFact('unresolved_hook', `[${pat.label}] ${context}`, S?.msgCount||0);
      }
      // 한 턴에 여러 패턴이 동시에 매칭될 수 있으니 break 없이 계속 검사
    }
  }catch(e){ console.warn('[detectImmediateNarrativeHook]', e); }
}
window.detectImmediateNarrativeHook = detectImmediateNarrativeHook;

window.detectImmediateNarrativeHook = detectImmediateNarrativeHook;

export function checkWorldConsistency(cleanText){
  try{
    if(!cleanText) return;
    const mem = typeof loadMemory==='function' ? loadMemory() : {};
    const deathFacts = (mem.facts||[]).filter(f=>f.category==='npc_death');
    if(!deathFacts.length) return;
    // "OOO이 죽었다/사망했다"는 기록에서 이름으로 추정되는 첫 2~6자
    // 한글 토큰을 추출 (완벽하지 않지만 보수적인 휴리스틱)
    const aliveActionPattern = /(이|가|은|는)\s*(말했다|웃었다|걸어왔다|다가왔다|손을 내밀었다|대답했다|숨을 쉬었다|눈을 떴다)/;
    deathFacts.forEach(f => {
      const nameMatch = f.text.match(/^([가-힣]{2,8})/);
      if(!nameMatch) return;
      // [BUG FIX] f.text가 "그레이먼이 사망했다"처럼 조사가 붙은 형태로
      // 저장돼 있으면 이름이 "그레이먼이"로 잘못 추출되어, 본문에서
      // 정확한 이름("그레이먼")과 매칭이 안 되거나 어색하게 매칭될 수
      // 있었다. 흔한 조사(이/가/은/는/을/를/께서/님이)를 제거해 순수
      // 이름만 남긴다.
      const name = nameMatch[1].replace(/(이|가|은|는|을|를|께서|님이)$/, '');
      if(name.length < 2) return;
      if(!cleanText.includes(name)) return;
      const idx = cleanText.indexOf(name);
      const nearby = cleanText.slice(idx, idx + 40);
      if(aliveActionPattern.test(nearby)){
        console.warn('[세계관 일관성 경고] "'+name+'"은 사망 기록이 있는데(턴 '+f.turn+': '+f.text+') 살아있는 듯한 묘사가 감지됨: '+nearby);
        toast('⚠️ 일관성 주의: "'+name+'"의 사망 기록과 충돌 가능성 (콘솔 확인)', 4000);
      }
    });
  }catch(e){ console.warn('[checkWorldConsistency]', e); }
}
window.checkWorldConsistency = checkWorldConsistency;

window.checkWorldConsistency = checkWorldConsistency;

export function setRecentShock(description, turn){
  try{
    if(!S) return;
    S._recentShock = { description, turn: turn||S?.msgCount||0 };
  }catch(e){}
}
window.setRecentShock = setRecentShock;

window.setRecentShock = setRecentShock;

export function getRecentShockBLS(){
  try{
    if(!S?._recentShock) return '';
    const elapsed = (S.msgCount||0) - S._recentShock.turn;
    if(elapsed < 0 || elapsed > 5) { S._recentShock = null; return ''; } // 5턴 지나면 자연 해제
    const intensity = elapsed <= 1 ? '방금 일어난 일이라 동요가 매우 크다'
      : elapsed <= 3 ? '아직 충격이 가시지 않았다'
      : '서서히 가라앉고 있지만 여운이 남아있다';
    return `\n[💔 단기 감정 잔상] "${S._recentShock.description}" — ${intensity}. 캐릭터의 말투·집중력·여유에 그 영향이 자연스럽게 묻어나야 한다. 갑자기 평범하고 가벼운 대화로 완전히 돌아가지 말고, 이 사건의 무게를 의식하는 태도를 유지하라(과장된 슬픔 연기를 매 문장 반복하라는 뜻은 아니다 — 자연스러운 정도로).`;
  }catch(e){ return ''; }
}
window.getRecentShockBLS = getRecentShockBLS;

window.getRecentShockBLS = getRecentShockBLS;

export function extractAndStorePermanentFacts(summaryText, turn){
  try{
    if(!summaryText) return;
    const m = summaryText.match(/\[영구기록\]([\s\S]*?)(?:\n\[|$)/);
    if(!m) return;
    const lines = m[1].split('\n').map(l=>l.trim()).filter(Boolean);
    const validCategories = new Set(Object.keys(FACT_CATEGORY_PRIORITY));
    lines.forEach(line => {
      const idx = line.indexOf('|');
      if(idx < 0) return;
      const cat = line.slice(0, idx).trim();
      const text = line.slice(idx+1).trim();
      if(!validCategories.has(cat) || !text) return;
      addPermanentFact(cat, text, turn);
    });
  }catch(e){ console.warn('[extractAndStorePermanentFacts]', e); }
}
window.extractAndStorePermanentFacts = extractAndStorePermanentFacts;

window.extractAndStorePermanentFacts = extractAndStorePermanentFacts;

export function processResolvedHooks(summaryText, hookSnapshot){
  try{
    if(!summaryText || !hookSnapshot || !hookSnapshot.length) return;
    const m = summaryText.match(/\[해결됨\]([\s\S]*?)(?:\n\[|$)/);
    if(!m) return;
    const lines = m[1].split('\n').map(l=>l.trim()).filter(Boolean);
    if(!lines.length) return;
    const mem = loadMemory();
    let changed = false;
    lines.forEach(line => {
      const idx = line.indexOf('|');
      if(idx < 0) return;
      const numStr = line.slice(0, idx).trim();
      const resolution = line.slice(idx+1).trim();
      const num = parseInt(numStr, 10);
      if(isNaN(num) || num < 1 || num > hookSnapshot.length || !resolution) return;
      const hook = hookSnapshot[num-1];
      if(!hook) return;
      // mem.facts에서 해당 떡밥 제거 (텍스트로 정확히 매칭)
      const before = mem.facts.length;
      mem.facts = mem.facts.filter(f => !(f.category==='unresolved_hook' && f.text===hook.text));
      if(mem.facts.length < before){
        changed = true;
        // 영구 로그로 이전 — 토큰은 안 쓰지만(facts에서 빠짐) 데이터는
        // 무제한 보존(하드코딩 소스 활용 가치가 더 높은 형태로 변환)
        if(typeof logResolvedHook==='function') logResolvedHook(hook.text, resolution, hook.turn, S?.msgCount||0);
      }
    });
    if(changed) saveMemory(mem);
  }catch(e){ console.warn('[processResolvedHooks]', e); }
}
window.processResolvedHooks = processResolvedHooks;

window.processResolvedHooks = processResolvedHooks;

export function getMemoryBLS() {
  try {
    const mem = typeof loadMemory === 'function' ? loadMemory() : {};
    let out = mem.core ? `\n[🧠 핵심기억] ${mem.core}` : '';
    // [신규] 영구 보존 사실 — 글자수 제한과 무관하게 항상 전부 주입된다.
    // core/mid가 압축되며 잘려도 이 사실들은 사라지지 않는다.
    if(Array.isArray(mem.facts) && mem.facts.length){
      const byCategory = {};
      mem.facts.forEach(f => { (byCategory[f.category] ||= []).push(f.text); });
      const labels = { npc_death:'NPC 생사/이탈', world_change:'세계 영구 변화', identity_reveal:'정체/비밀 발각', irreversible_choice:'되돌릴 수 없는 선택', relationship_turn:'관계 전환점', unresolved_hook:'미해결 떡밥/약속' };
      const lines = Object.entries(byCategory).map(([cat, texts]) => `${labels[cat]||cat}: ${texts.join(' / ')}`);
      out += `\n[📌 절대 잊으면 안 되는 사실 — 모순 없이 반영할 것]\n${lines.join('\n')}`;
    }
    return out;
  } catch(e) { return ''; }
}
window.getMemoryBLS = getMemoryBLS;

window.addToMemory    = addToMemory;

window.compressMemory = compressMemory;

window.summarizeHistory = summarizeHistory;

window.autoSummarize  = autoSummarize;

window.getMemoryBLS   = getMemoryBLS;
