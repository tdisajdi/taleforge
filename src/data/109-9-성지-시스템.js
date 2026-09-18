// 9. 성지 시스템 — data
// Pure data split out of religion/109-9-성지-시스템.js (see generate.js).

export const SHRINE_DEFS = {
  temple: { name:'순환의 성지', icon:'⛪', effect:{wil:3, fath:5},    blessing:'매 10턴 HP+10 회복', evangelBonus:10 },
  solar:  { name:'태양 신전',  icon:'☀️', effect:{str:3, rep:5},     blessing:'판정 시 STR+3 보너스', evangelBonus:8 },
  roots:  { name:'조상신 석상',icon:'🌿', effect:{per:3, luk:3},     blessing:'자연 지역 모든 판정+5', evangelBonus:8 },
  abyss:  { name:'심연의 제단',icon:'😈', effect:{neg:5, str:3},     blessing:'협상 판정 항상+8', evangelBonus:12, hidden:true },
};
