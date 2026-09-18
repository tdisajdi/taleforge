// ④ 기습/선제 공격 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { toast } from '../utils.js';

export function checkAmbushSystem(cleanText, userMsg){
  if(!S?.stats) return;
  const lc = (userMsg||'').toLowerCase();
  const isAmbushAttempt = /기습|선제|먼저 공격|몰래 공격|뒤에서|은신.*공격|숨어.*공격/.test(lc);
  if(!isAmbushAttempt) return;
  if(S._ambushCheckedThisTurn) return;
  S._ambushCheckedThisTurn = true;

  const agiStat = S.stats.agi || 50;
  const perStat = S.stats.per || 50;
  // 기습 판정: (AGI + PER) / 2 vs d100
  const ambushRoll = Math.floor(Math.random()*100)+1;
  const ambushStat = Math.floor((agiStat + perStat) / 2);

  if(ambushRoll <= ambushStat){
    // 기습 성공
    const bonusDmg = Math.floor(agiStat * 0.3);
    S._ambushBonus = bonusDmg;
    const isCrit = ambushRoll <= Math.floor(ambushStat/5);
    if(isCrit){
      toast(`⚡ 완벽한 기습! 첫 공격 +${bonusDmg}% + 적 반격 없음!`, 3000);
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n[⚡ 완벽한 기습 성공] 주인공이 완벽한 선제 공격을 가했다. 이번 공격 피해 +30%, 적은 반격할 수 없다. 압도적이고 날카로운 기습 장면을 묘사하라.`;
    } else {
      toast(`🗡️ 기습 성공! 선제 공격 우위 확보`, 2500);
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n[🗡️ 기습 성공] 주인공이 선제 공격 우위를 잡았다. 이번 턴 적의 반격이 약하거나 지연된다.`;
    }
  } else {
    // 기습 실패 → 역기습
    toast(`💀 기습 실패! 오히려 역기습 당했다!`, 3000);
    const dmgPenalty = Math.max(5, Math.floor((S.stats.hp||100)*0.12));
    S.stats.hp = Math.max(1, S.stats.hp - dmgPenalty);
    S._nextInjectedContext = (S._nextInjectedContext||'') +
      `\n[💀 기습 실패/역기습] 주인공의 기습이 들켰다. 오히려 적이 먼저 공격했다. HP -${dmgPenalty}. 당황하고 방어 자세가 무너진 장면을 묘사하라.`;
  }
}
window.checkAmbushSystem = checkAmbushSystem;

export function checkDefendSystem(cleanText, userMsg){
  if(!S?.stats) return;
  if(!S._inCombat) return;
  const lc = (userMsg||'').toLowerCase();
  const isDefendAttempt = /방어|막는다|버틴다|버틴|수비|방패.*들|몸을 사리|회피.*집중|피하는 데 집중/.test(lc);
  if(!isDefendAttempt) return;
  if(S._defendCheckedThisTurn) return;
  S._defendCheckedThisTurn = true;

  const defStat = S.stats.end || 50;
  const agiStat = S.stats.agi || 50;
  // 방어 판정: (DEF + AGI) / 2 vs d100 — 높을수록 안정적으로 방어 성공
  const defendRoll = Math.floor(Math.random()*100)+1;
  const defendStat = Math.floor((defStat + agiStat) / 2);

  if(defendRoll <= defendStat){
    // 방어 성공 — 이번 턴 받는 피해 대폭 감소 + 다음 턴 반격 보너스
    S._defendActive = true;
    const isCrit = defendRoll <= Math.floor(defendStat/5);
    if(isCrit){
      toast(`🛡️ 완벽한 방어! 받는 피해 대폭 감소 + 다음 반격 강화`, 3000);
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n[🛡️ 완벽한 방어 성공] 주인공이 적의 공격을 완벽히 막아내거나 흘려낸다. 이번 턴 받는 피해를 60~80% 줄여서 묘사하고, 적의 빈틈을 만들어 다음 턴 반격에 보너스가 있음을 암시하라.`;
    } else {
      toast(`🛡️ 방어 성공! 받는 피해 감소`, 2500);
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n[🛡️ 방어 성공] 주인공이 안정적으로 방어 태세를 유지한다. 이번 턴 받는 피해를 30~40% 줄여서 묘사하라.`;
    }
  } else {
    // 방어 실패 — 그래도 약간의 피해 감소는 있되, 자세가 무너짐
    toast(`⚠️ 방어 자세가 무너졌다`, 2500);
    S._nextInjectedContext = (S._nextInjectedContext||'') +
      `\n[⚠️ 방어 실패] 방어를 시도했지만 적의 공격이 자세를 무너뜨린다. 피해 감소는 미미하고(10% 이하), 균형을 잃은 틈을 보이는 장면을 묘사하라.`;
  }
}
window.checkDefendSystem = checkDefendSystem;
