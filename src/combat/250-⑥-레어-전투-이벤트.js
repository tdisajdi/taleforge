// ⑥ 레어 전투 이벤트
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RARE_COMBAT_EVENTS } from '../data/250-⑥-레어-전투-이벤트.js';
import { toast } from '../utils.js';

export function rollRareCombatEvent(cleanText){
  if(!S._inCombat) return;
  if(S._rareCombatEventThisTurn) return;
  if(Math.random() > 0.18) return; // 18% 확률 체크 진입

  // 실제 이벤트별 확률
  for(const ev of RARE_COMBAT_EVENTS){
    // [신규] 던전 전용 증원이 이번 턴에 이미 발동했다면, 범용
    // "지원군 도착" 이벤트는 건너뛴다 — 같은 턴에 "던전 증원 도착"과
    // "지원군 도착"이 동시에 떠 메시지가 중복되는 것을 방지.
    if(ev.id === 'reinforcements' && S._dungeonReinforceFiredThisTurn) continue;
    if(Math.random() < ev.chance){
      S._rareCombatEventThisTurn = true;
      toast(`[전투 이벤트] ${ev.label}!`, 3500, ev);
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n[${ev.icon} 전투 이벤트: ${ev.label}] ${ev.hint} 이 사건을 현재 전투 장면에 극적으로 삽입하라.`;
      break;
    }
  }
}
window.rollRareCombatEvent = rollRareCombatEvent;
