// 환생 누적 시스템 (1~10번) — data
// Pure data split out of progression/014-환생-누적-시스템-110번.js (see generate.js).

export const KARMA_EFFECTS = {
  // karmaScore 0~100 (높을수록 악)
  blessing: { threshold: 0, maxThreshold: 30, label:"축복받은 영혼", icon:"✨", color:"#c8e066",
    statBonus: { luk:5, trst:5, rep:5 }, desc:"전생의 선행이 이번 생에 축복을 내린다. 행운·신뢰·평판 +5." },
  neutral:  { threshold: 31, maxThreshold: 69, label:"평범한 영혼", icon:"⚖️", color:"#c8a96e",
    statBonus: {}, desc:"전생의 업보가 평범하다. 특별한 보너스도 패널티도 없다." },
  cursed1:  { threshold: 70, maxThreshold: 84, label:"어둠의 기억", icon:"🌑", color:"#aa6644",
    statPenalty: { trst:-5, rep:-5 }, desc:"전생의 악행 잔향. 첫 만남에서 NPC들이 근거 없이 경계한다." },
  cursed2:  { threshold: 85, maxThreshold: 94, label:"저주받은 영혼", icon:"💀", color:"#cc4444",
    statPenalty: { trst:-10, rep:-10, luk:-5 }, desc:"무거운 죄업. 주변의 시선이 차갑고 운도 따르지 않는다." },
  condemned:{ threshold: 95, maxThreshold: 100, label:"업보의 심판", icon:"🔥", color:"#ff4444",
    statPenalty: { trst:-10, rep:-10, luk:-5, mad:10, crse:10 }, desc:"전생의 극악한 업보. 현상수배·저주·광기로 시작한다." },
};

export const RELIC_DEFS = [
  { id:"relic_hero_sword",   name:"어디선가 본 듯한 검",    icon:"⚔️", rarity:"rare",      condition:"duel_winner",    conditionDesc:"전생에서 결투에서 승리", desc:"전생에서 쓰던 검인 것 같다. 손에 익숙한 무게감이 있다.",         effects:{str:8, crit:6} },
  { id:"relic_traveler_map", name:"바래진 지도",             icon:"🗺️", rarity:"uncommon",  condition:"explorer",       conditionDesc:"전생에서 탐험가 칭호 획득", desc:"전생에서 직접 그린 것 같은 낡은 지도. 어딘가 익숙하다.",         effects:{per:6, luk:4} },
  { id:"relic_dark_tome",    name:"검은 표지의 책",          icon:"📕", rarity:"rare",      condition:"hidden_silence", conditionDesc:"전생에서 비밀을 지켜냄", desc:"전생에서 읽었던 것 같은 금서. 내용이 기억날 듯 말 듯 하다.",       effects:{mgc:8, mad:3} },
  { id:"relic_lucky_coin",   name:"낡은 금화",               icon:"🪙", rarity:"common",    condition:"karma_good",     conditionDesc:"전생 업보 30 이하", desc:"전생에서 늘 갖고 다니던 금화인 것 같다. 왠지 버릴 수가 없다.",     effects:{luk:8, gold:100} },
  { id:"relic_cursed_ring",  name:"기억이 없는 반지",        icon:"💍", rarity:"legendary", condition:"karma_bad",      conditionDesc:"전생 업보 80 이상", desc:"어떻게 손가락에 끼워졌는지 모르겠다. 벗기려 하면 손이 떨린다.",   effects:{str:5, mad:8, crse:5} },
];

export const ARTIFACT_COMPLETE = {
  name:"봉인된 유물 — 완전체", icon:"🏺", rarity:"legendary",
  desc:"다섯 회차에 걸쳐 모은 파편이 하나로 합쳐졌다. 압도적인 힘이 느껴진다.",
  effects:{ str:15, mgc:15, luk:10, end:10, hp:20 }
};

export const WEAPON_TYPES = {
  sword:  { name:"검",   icon:"⚔️", bonus:{str:8, crit:6},  desc:"전생에서 검을 주로 썼다. 손에 익숙하다." },
  staff:  { name:"지팡이",icon:"🪄", bonus:{mgc:8, mp:10},   desc:"전생에서 마법을 즐겨 썼다. 집중력이 높아진다." },
  bow:    { name:"활",   icon:"🏹", bonus:{agi:8, per:6},   desc:"전생에서 활을 주로 썼다. 원거리 감각이 살아있다." },
  dagger: { name:"단검", icon:"🗡️", bonus:{agi:6, disg:6}, desc:"전생에서 단검을 선호했다. 빠른 손놀림이 익숙하다." },
  fist:   { name:"맨손", icon:"👊", bonus:{str:6, end:8},   desc:"전생에서 맨손 전투를 즐겼다. 몸이 먼저 반응한다." },
};

export const _FAME_LABELS = {
  hero:    ['소문난 용사','용맹한 전사','이름난 영웅','왕국의 영웅','전설의 영웅'],
  villain: ['악명 높은 자','공포의 대상','두려운 악당','잔혹한 마왕','공포의 군주'],
};

export const AWAKENED_JOBS = [
  { id:"reincarnator",  name:"환생자",    icon:"♾️", minCycle:3,  rarity:"rare",
    desc:"여러 생을 거친 자. 전생 기억에서 지식을 끌어낸다.",
    bonus:{luk:8, per:8, int:5}, hint:"전생 기억을 실전에 활용합니다." },
  { id:"prophet",       name:"예언자",    icon:"🔮", minCycle:5,  rarity:"rare",
    desc:"운명의 흐름을 읽는 자. 앞일을 희미하게 예감한다.",
    bonus:{per:10, int:8, wil:6}, hint:"미래의 단서를 포착합니다." },
  { id:"soul_walker",   name:"영혼 방랑자",icon:"👻", minCycle:7,  rarity:"legendary",
    desc:"삶과 죽음의 경계를 자유로이 걷는 자.",
    bonus:{mgc:12, mad:8, per:8}, hint:"죽음에 가까울수록 힘이 강해집니다." },
  { id:"fate_weaver",   name:"운명의 직조자",icon:"🕸️", minCycle:10, rarity:"legendary",
    desc:"인과율을 손으로 짜듯 조종할 수 있는 극소수의 존재.",
    bonus:{luk:15, per:12, wil:10}, hint:"운명의 실을 느낄 수 있습니다." },
];
