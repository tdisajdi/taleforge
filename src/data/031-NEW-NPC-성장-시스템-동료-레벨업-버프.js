// [NEW] NPC 성장 시스템 (동료 레벨업 + 버프) — data
// Pure data split out of npc/031-NEW-NPC-성장-시스템-동료-레벨업-버프.js (see generate.js).

export const NPC_GROWTH_SKILLS = [
  { level:2, id:"npc_cover",    name:"동료 방어",   icon:"🛡️", desc:"동료가 피격 순간 앞에 나서 피해를 반감한다. END +5 버프." },
  { level:3, id:"npc_assist",   name:"측면 지원",   icon:"⚔️", desc:"동료가 적의 빈틈을 공략. 주인공 CRIT +8 버프." },
  { level:4, id:"npc_rally",    name:"사기 고취",   icon:"📣", desc:"동료의 외침이 주인공을 북돋운다. WIL +8, CAL +5 버프." },
  { level:5, id:"npc_synergy",  name:"완전 공조",   icon:"✨", desc:"호흡이 완전히 맞은 동료와의 협공. 모든 판정 +10 버프." },
];
