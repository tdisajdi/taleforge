// 1. 신앙(fath) ↔ 종교 시스템 실제 연동 — data
// Pure data split out of religion/101-1-신앙fath-종교-시스템-실제-연동.js (see generate.js).

export const FAITH_TIERS = [
  { min:0,   max:20,  label:'불신자',   icon:'😶', evangelBonus:-10, miracleChance:0,   curseRisk:0.05 },
  { min:21,  max:40,  label:'회의론자', icon:'🤔', evangelBonus:-5,  miracleChance:0.05,curseRisk:0.02 },
  { min:41,  max:60,  label:'신도',     icon:'🙏', evangelBonus:0,   miracleChance:0.15,curseRisk:0 },
  { min:61,  max:80,  label:'독실한자', icon:'✨', evangelBonus:10,  miracleChance:0.3, curseRisk:0 },
  { min:81,  max:100, label:'성자',     icon:'👼', evangelBonus:20,  miracleChance:0.5, curseRisk:0 },
  { min:101, max:999, label:'신격자',   icon:'🌟', evangelBonus:35,  miracleChance:0.7, curseRisk:0 },
];
