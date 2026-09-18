// 밸런스 상한선 (과도한 누적 방지) — data
// Pure data split out of core/166-밸런스-상한선-과도한-누적-방지.js (see generate.js).

export const HERITAGE_CAPS = {
  max_stat_bonus_atk: 100,  // ATK 계승 보너스 최대
  max_stat_bonus_def: 80,   // DEF 계승 보너스 최대
  max_stat_bonus_hp:  400,  // HP 계승 보너스 최대
  max_faction_bonus:  50,   // 파벌 관계 계승 최대
  max_exp_mult:       2.0,  // 경험치 배율 최대 (100% 증가까지)
  max_gold_start:     5000, // 시작 골드 최대
  max_summon_slot:    5,    // 소환수 슬롯 추가 최대
};
