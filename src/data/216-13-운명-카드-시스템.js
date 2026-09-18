// [13] 운명 카드 시스템 — data
// Pure data split out of misc/216-13-운명-카드-시스템.js (see generate.js).

export const FATE_CARD_DEFS = [
  { id:'fc_star',    name:'별',       icon:'⭐', rarity:'rare',    effect:{ lck:15 },          desc:'행운이 깃든다. 행운+15' },
  { id:'fc_death',   name:'죽음',     icon:'💀', rarity:'common',  effect:{ hp:-20 },           desc:'시련이 찾아온다. HP-20' },
  { id:'fc_world',   name:'세계',     icon:'🌍', rarity:'epic',    effect:{ all:5 },            desc:'모든 것이 균형을 이룬다. 전 스탯+5' },
  { id:'fc_tower',   name:'탑',       icon:'🗼', rarity:'common',  effect:{ chaos:true },       desc:'예상치 못한 변화가 찾아온다.' },
  { id:'fc_sun',     name:'태양',     icon:'☀️',  rarity:'rare',    effect:{ hp:30, fath:10 },   desc:'빛이 내린다. HP+30, 신앙+10' },
  { id:'fc_moon',    name:'달',       icon:'🌙', rarity:'uncommon',effect:{ int:10, wis:10 },   desc:'지혜가 깃든다. INT+10, WIS+10' },
  { id:'fc_emperor', name:'황제',     icon:'👑', rarity:'epic',    effect:{ cha:20, str:10 },   desc:'지도자의 카리스마. CHA+20, STR+10' },
  { id:'fc_fool',    name:'바보',     icon:'🃏', rarity:'uncommon',effect:{ lck:30, sanity:-10},desc:'무모한 행운. LCK+30, 정신력-10' },
  { id:'fc_hermit',  name:'은둔자',   icon:'🧙', rarity:'uncommon',effect:{ int:15, wis:15 },   desc:'고독한 지혜. INT+15, WIS+15' },
  { id:'fc_wheel',   name:'운명의 바퀴',icon:'🎡',rarity:'rare',   effect:{ random:true },      desc:'운명이 바뀐다. 랜덤 효과.' },
];
