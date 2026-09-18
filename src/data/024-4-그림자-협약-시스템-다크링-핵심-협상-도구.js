// 🖤 4. 그림자 협약 시스템 — 다크링 핵심 협상 도구 — data
// Pure data split out of race/024-4-그림자-협약-시스템-다크링-핵심-협상-도구.js (see generate.js).

export const PACT_TIERS = [
  { stage: 0, name: '그림자 없음',   icon: '🌑', canPact: false, successRate: 0,   curseStrength: 0,  mpCost: 0,  maxPacts: 0, desc: '공허가 깨어나지 않아 그림자 포획이 불가능하다.' },
  { stage: 1, name: '희미한 포획',   icon: '👣', canPact: true,  successRate: 40,  curseStrength: 15, mpCost: 18, maxPacts: 1, desc: '그림자 일부를 희미하게 포획. 상대는 불안함을 느끼지만 이유를 모른다.' },
  { stage: 2, name: '그림자 결박',   icon: '🖤', canPact: true,  successRate: 55,  curseStrength: 25, mpCost: 22, maxPacts: 1, desc: '그림자의 1/3을 포획. 상대는 어둠 속에서 자신이 관찰당하는 느낌을 받는다.' },
  { stage: 3, name: '심연의 쐐기',   icon: '⛓️', canPact: true,  successRate: 70,  curseStrength: 40, mpCost: 28, maxPacts: 2, desc: '그림자 깊은 곳에 공허의 쐐기를 박는다. 상대는 어둠 속에서 공황을 경험한다.' },
  { stage: 4, name: '공허 속박',     icon: '🌀', canPact: true,  successRate: 82,  curseStrength: 60, mpCost: 35, maxPacts: 2, desc: '그림자 전체를 공허에 묶는다. 협약 파기 시 그림자가 상대를 스스로 공격한다.' },
  { stage: 5, name: '영혼 각인',     icon: '💜', canPact: true,  successRate: 90,  curseStrength: 80, mpCost: 42, maxPacts: 3, desc: '그림자와 영혼이 연결된다. 상대가 거짓말할 때 자신도 모르게 몸이 반응한다.' },
  { stage: 6, name: '공허 지배',     icon: '👑', canPact: true,  successRate: 97,  curseStrength: 110,mpCost: 55, maxPacts: 4, desc: '그림자를 완전히 지배한다. 상대는 어디에 있어도 다크링의 시선을 느낀다.' },
  { stage: 7, name: '그림자 합일',   icon: '⚫', canPact: true,  successRate: 100, curseStrength: 150,mpCost: 70, maxPacts: 5, desc: '그림자 자체가 이 다크링의 일부가 된다. 파기는 존재론적 자기 파괴를 의미한다.' },
];
