// ★ NEW 7: 경제 자동 변동 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadFactionSim } from '../npc/067-③-NPC-관계망-시스템.js';
import { toast } from '../utils.js';
import { loadEconomy, saveEconomy } from './069-④-경제-시스템.js';

export function tickEconomy(){
  if(!S.msgCount || S.msgCount % 5 !== 0) return; // 5턴마다
  const eco = loadEconomy();
  let changed = false;
  let msg = '';

  // 전쟁 중이면 인플레 상승
  // [B50 FIX] loadFactionSim()의 실제 반환 필드는 tensions가 아니라
  // relations라 항상 undefined였고, 전쟁 시 물가 자동 상승 연출이 절대
  // 발동하지 않던 버그.
  const sim = typeof loadFactionSim==='function' ? loadFactionSim() : {};
  const inWar = sim.relations && Object.values(sim.relations).some(t=>t>=90);
  if(inWar && eco.inflation < 2.0){
    eco.inflation = Math.min(2.0, eco.inflation + 0.05);
    eco.marketTrend = 'crisis';
    changed = true; msg = '⚔️ 전쟁으로 물가가 상승했습니다.';
  }
  // 평화 시 인플레 안정화
  else if(!inWar && eco.inflation > 1.0){
    eco.inflation = Math.max(1.0, eco.inflation - 0.02);
    if(eco.inflation <= 1.05) eco.marketTrend = 'stable';
    changed = true;
  }

  // 5% 확률 랜덤 이벤트
  const r = Math.random();
  if(r < 0.03){
    eco.marketTrend = 'boom'; eco.inflation = Math.min(1.8, eco.inflation + 0.1);
    changed = true; msg = '📈 교역 호황으로 물가가 올랐습니다.';
  } else if(r < 0.06){
    eco.marketTrend = 'crisis'; eco.inflation = Math.max(0.7, eco.inflation - 0.1);
    changed = true; msg = '📉 흉작으로 물가가 불안정합니다.';
  } else if(r < 0.08 && eco.marketTrend !== 'stable'){
    eco.marketTrend = 'stable';
    changed = true; msg = '⚖️ 시장이 안정됐습니다.';
  }

  if(changed){ saveEconomy(eco); if(msg) toast(msg, 2500); }
}
window.tickEconomy = tickEconomy;

window.tickEconomy = tickEconomy;

export function getEcoStatusLabel(){
  const eco = loadEconomy();
  const inf = eco.inflation||1.0;
  const trend = eco.marketTrend||'stable';
  const trendLabel = {boom:'📈 호황', stable:'⚖️ 안정', crisis:'📉 불황'}[trend]||'안정';
  const infLabel = inf>=1.5?'🔴 고인플레':inf>=1.2?'🟡 인플레':inf<=0.9?'🟢 디플레':'🟢 정상';
  return `${trendLabel} / ${infLabel} (×${inf.toFixed(2)})`;
}
window.getEcoStatusLabel = getEcoStatusLabel;

window.getEcoStatusLabel = getEcoStatusLabel;
