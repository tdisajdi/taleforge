// 룬 정의 (30종) — data
// Pure data split out of items/174-룬-정의-30종.js (see generate.js).

export const RUNE_DEFS = {
  // ─ 전투 룬 ─────────────────────────────────
  rune_sol:    { name:'솔 룬',    icon:'☀️', tier:'C', effect:'ATK +8',         stat:{atk:8},   slotType:'weapon' },
  rune_eld:    { name:'엘드 룬',  icon:'🔥', tier:'C', effect:'화염 피해 +10%', stat:{fire:10}, slotType:'weapon' },
  rune_tir:    { name:'티르 룬',  icon:'⚡', tier:'C', effect:'공격 속도 +1',   stat:{spd:1},   slotType:'weapon' },
  rune_nef:    { name:'네프 룬',  icon:'🌊', tier:'C', effect:'DEF +6',         stat:{def:6},   slotType:'armor'  },
  rune_eth:    { name:'에스 룬',  icon:'💨', tier:'C', effect:'회피율 +5%',     stat:{eva:5},   slotType:'armor'  },
  rune_ith:    { name:'이스 룬',  icon:'❄️', tier:'C', effect:'빙결 저항 +15%', stat:{ice_res:15}, slotType:'armor' },
  rune_tal:    { name:'탈 룬',    icon:'☠️', tier:'C', effect:'독 피해 +8%',    stat:{poison:8},slotType:'weapon' },
  rune_ral:    { name:'랄 룬',    icon:'⛈️', tier:'C', effect:'번개 피해 +10%', stat:{lightning:10}, slotType:'weapon' },

  // ─ B급 룬 ──────────────────────────────────
  rune_ort:    { name:'오트 룬',  icon:'🔮', tier:'B', effect:'마력 재생 +5/턴', stat:{mp_regen:5}, slotType:'any' },
  rune_thul:   { name:'툴 룬',    icon:'💎', tier:'B', effect:'HP +30',          stat:{hp:30},  slotType:'armor'  },
  rune_amn:    { name:'암 룬',    icon:'💉', tier:'B', effect:'적중 시 HP 흡수 3%', stat:{lifesteal:3}, slotType:'weapon' },
  rune_sol2:   { name:'솔 룬+',   icon:'🌟', tier:'B', effect:'ATK +15, 빛 속성 +5%', stat:{atk:15,light:5}, slotType:'weapon' },
  rune_shael:  { name:'샤엘 룬',  icon:'💨', tier:'B', effect:'행동 속도 +10%',  stat:{spd:3},  slotType:'any'    },
  rune_dol:    { name:'돌 룬',    icon:'🐺', tier:'B', effect:'소환수 ATK +12%', stat:{summon_atk:12}, slotType:'accessory' },
  rune_hel:    { name:'헬 룬',    icon:'🛡️', tier:'B', effect:'장비 강화 실패율 -10%', stat:{enhance_safe:10}, slotType:'any' },
  rune_io:     { name:'이오 룬',  icon:'💫', tier:'B', effect:'소환수 HP +20%',  stat:{summon_hp:20}, slotType:'accessory' },

  // ─ A급 룬 ──────────────────────────────────
  rune_lum:    { name:'룸 룬',    icon:'💡', tier:'A', effect:'크리티컬 확률 +8%', stat:{crit:8}, slotType:'weapon' },
  rune_ko:     { name:'코 룬',    icon:'👁️', tier:'A', effect:'적 약점 자동 감지', stat:{detect:1}, slotType:'helmet' },
  rune_fal:    { name:'팔 룬',    icon:'🌱', tier:'A', effect:'봉인석 에너지 감지', stat:{seal_sense:1}, slotType:'accessory' },
  rune_lem:    { name:'렘 룬',    icon:'💰', tier:'A', effect:'골드 획득 +25%',   stat:{gold_bonus:25}, slotType:'accessory' },
  rune_pul:    { name:'풀 룬',    icon:'🔥', tier:'A', effect:'모든 속성 피해 +8%', stat:{all_elem:8}, slotType:'weapon' },
  rune_um:     { name:'움 룬',    icon:'🛡️', tier:'A', effect:'모든 저항 +10%',   stat:{all_res:10}, slotType:'armor' },

  // ─ S급 룬 (희귀) ───────────────────────────
  rune_gul:    { name:'굴 룬',    icon:'👑', tier:'S', effect:'경험치 획득 +20%, 소환수 EXP +20%', stat:{exp_bonus:20,summon_exp:20}, slotType:'any' },
  rune_vex:    { name:'벡스 룬',  icon:'🌑', tier:'S', effect:'빙결·공황 면역',   stat:{freeze_imm:1,fear_imm:1}, slotType:'armor' },
  rune_ohm:    { name:'옴 룬',    icon:'⚡', tier:'S', effect:'ATK +25, 번개 속성 추가', stat:{atk:25,lightning_extra:1}, slotType:'weapon' },
  rune_lo:     { name:'로 룬',    icon:'🌟', tier:'S', effect:'크리티컬 피해 +50%', stat:{crit_dmg:50}, slotType:'weapon' },
  rune_sur:    { name:'수르 룬',  icon:'💎', tier:'S', effect:'HP +80, 사망 시 30% 확률로 소생', stat:{hp:80,revive:30}, slotType:'armor' },
  rune_ber:    { name:'베르 룬',  icon:'🩸', tier:'S', effect:'전 스탯 +10',       stat:{all_stat:10}, slotType:'any' },
  rune_jah:    { name:'야 룬',    icon:'☄️', tier:'S', effect:'적 DEF 무시 공격 가능', stat:{armor_pierce:1}, slotType:'weapon' },

  // ─ 특수 룬 (조합 전용) ─────────────────────
  rune_zod:    { name:'조드 룬',  icon:'♾️', tier:'S+', effect:'장비 파괴 불가, 강화 +15 고정', stat:{indestructible:1,enhance_lock:1}, slotType:'any', craftOnly:true },
};

export const RUNE_RECIPES = [
  { result:'rune_sol2',  materials:['rune_sol','rune_sol'],   desc:'솔 룬 2개 → 솔 룬+' },
  { result:'rune_pul',   materials:['rune_um','rune_fal'],    desc:'움+팔 → 풀 룬 (전속성)' },
  { result:'rune_gul',   materials:['rune_lem','rune_pul','rune_dol'], desc:'렘+풀+돌 → 굴 룬 (경험치)' },
  { result:'rune_ber',   materials:['rune_sur','rune_ohm','rune_lo'],  desc:'수르+옴+로 → 베르 룬 (전스탯)' },
  { result:'rune_zod',   materials:['rune_jah','rune_ber','rune_gul'], desc:'야+베르+굴 → 조드 룬 (완성)' },
];
