// [7] 전투 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
//
// [17차 감사 FIX — 정리] 이 파일은 원래 COMBAT_STATE 기반의 독자적인 턴제
// 전투 루프(startCombat/processCombatTurn/checkCombatEnd/endCombat/
// getCombatState/saveCombatState/loadCombatState/applyDamage)였다. 하지만
// 실제 게임이 쓰는 전투는 misc/327~328의 로컬 서술 전투 엔진으로 완전히
// 대체됐고, 이 COMBAT_STATE(및 관련 함수 전부)는 정의 파일 밖 어디서도
// 호출되지 않는 완전한 고아 코드였다(전체 코드베이스 스캔으로 확인).
// 유일하게 실전에서 쓰이는 건 calcDamage 하나뿐(misc/327:371,385,
// misc/328:691에서 데미지 공식으로 재사용) — 그것만 남기고 나머지는 제거.

export function calcDamage(attacker, defender, skill=null) {
  try {
    const base = (attacker.str || attacker.atk || 10);
    const def = (defender.def || 0);
    const roll = Math.floor(Math.random() * 20) + 1;
    const dmg = Math.max(1, base - def + Math.floor(roll / 5));
    return { dmg, roll, crit: roll === 20 };
  } catch(e) { return { dmg: 5, roll: 10, crit: false }; }
}
window.calcDamage = calcDamage;
