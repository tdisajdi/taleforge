// ★ NEW 6: 세력 전쟁 영구 반영 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { getCurrentFactions, loadFactionRep, saveFactionRep } from '../npc/067-③-NPC-관계망-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadGSFlags, saveGSFlags } from './145-⑥-세계-상태-DB.js';

export const FACTION_HISTORY_KEY = 'tf-faction-history';

export function loadFactionHistory(){ try{ return JSON.parse(lsGet(FACTION_HISTORY_KEY)||'[]'); }catch(e){ return []; } }
window.loadFactionHistory = loadFactionHistory;

export function saveFactionHistory(d){ lsSet(FACTION_HISTORY_KEY, JSON.stringify(d.slice(0,100))); }
window.saveFactionHistory = saveFactionHistory;

export function recordFactionEvent(type, factionA, factionB, extra){
  const hist = loadFactionHistory();
  hist.unshift({
    type, factionA, factionB,
    turn: S.msgCount||0,
    extra: extra||{},
    savedAt: new Date().toISOString(),
  });
  saveFactionHistory(hist);
}
window.recordFactionEvent = recordFactionEvent;

export function applyFactionWarResult(winner, loser, warTurns){
  const factions = typeof getCurrentFactions==='function' ? getCurrentFactions() : {};
  if(factions[loser]){
    // 패배 세력 영향력 감소
    const rep = typeof loadFactionRep==='function' ? loadFactionRep() : {};
    if(rep[loser]) rep[loser] = Math.max(-100, (rep[loser]||0) - 20);
    if(typeof saveFactionRep==='function') saveFactionRep(rep);
    recordFactionEvent('war_end', winner, loser, { warTurns, result:'loser_weakened' });
    toast(`⚔️ ${winner}이(가) ${loser}와의 전쟁에서 승리했습니다!`, 3000);
    // AI 프롬프트용 플래그
    if(typeof saveGSFlags==='function'){
      const flags = typeof loadGSFlags==='function' ? loadGSFlags() : {};
      flags[`faction_war_${winner}_won`] = true;
      flags[`faction_weakened_${loser}`] = true;
      saveGSFlags(flags);
    }
  }
}
window.applyFactionWarResult = applyFactionWarResult;

window.applyFactionWarResult = applyFactionWarResult;

export function getFactionHistorySection(){
  const hist = loadFactionHistory().slice(0, 5);
  if(!hist.length) return '';
  return `\n[📜 세력 역사]\n${hist.map(h=>{
    if(h.type==='war_end') return `• 턴${h.turn}: ${h.factionA}이(가) ${h.factionB}에 승리 (전쟁 지속 ${h.extra?.warTurns||'?'}턴)`;
    return `• 턴${h.turn}: ${h.factionA} ↔ ${h.factionB} — ${h.type}`;
  }).join('\n')}\n위 역사는 세계에 영구적인 영향을 미칩니다. 관련 NPC들의 태도에 반영하십시오.`;
}
window.getFactionHistorySection = getFactionHistorySection;

window.getFactionHistorySection = getFactionHistorySection;

// [버그 수정 — 제거] 여기 있던 hookFactionWarPermanence는 window.
// tickFactionSimulation을 감싸는 방식이었는데, 이 함수의 실제 호출부
// (quest/086·misc/068)는 전부 `import { tickFactionSimulation } from
// '../npc/067-...js'`로 직접 바인딩해 bare 식별자로 호출하는 구조라 —
// 다른 죽은 훅들과 동일한 원인 — window 쪽 재할당이 한 번도 실행된 적이
// 없었다. 설령 도달했더라도 이벤트 객체에 winner/loser 필드가 없어
// `ev.winner || ev.a`로 항상 a를 승자로 잘못 단정했을 것이다(실제 승패와
// 무관하게 절반 확률로 패자에게 보상). applyFactionWarResult는 이제
// misc/068의 applyWarDamage() 안, 승패가 실제로 확정되는 바로 그 지점에서
// 올바른 winner/loser로 직접 호출한다.
