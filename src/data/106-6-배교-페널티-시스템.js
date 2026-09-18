// 6. 배교 페널티 시스템 — data
// Pure data split out of religion/106-6-배교-페널티-시스템.js (see generate.js).

export const APOSTASY_PENALTY = {
  temple: { rep:-20, fath:-30, msg:'순환의 사원이 당신을 파문했다. 평판-20 신앙-30. 성직자 NPC들이 냉대한다.' },
  solar:  { rep:-25, fath:-30, msg:'태양신의 율법을 저버렸다. 이단 심문소의 주의 대상이 됐다.' },
  roots:  { rep:-10, fath:-20, msg:'조상신이 등을 돌렸다. 자연 지역 NPC들이 멀리한다.' },
  abyss:  { rep:0,  fath:-10,  str:-10, msg:'😈 심연과의 계약을 파기했다! 힘의 반발로 STR-10.' },
};

export const APOSTASY_COOLDOWN = {};
