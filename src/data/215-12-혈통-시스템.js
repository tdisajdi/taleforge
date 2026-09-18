// [12] 혈통 시스템 — data
// Pure data split out of summon/215-12-혈통-시스템.js (see generate.js).

export const BLOODLINE_DEFS = {
  dragon:    { name:'용의 후손',   icon:'🐉', bonus:{ str:20, fear:15 },     awaken:30, desc:'용의 피가 흐른다. 분노할수록 강해진다.' },
  celestial: { name:'천계의 혈통', icon:'👼', bonus:{ fath:20, wis:15 },     awaken:20, desc:'신성한 빛이 내재되어 있다.' },
  demon:     { name:'악마의 후예', icon:'😈', bonus:{ int:15, fear:20 },     awaken:25, desc:'계약의 피가 흐른다.' },
  ancient:   { name:'고대의 혈통', icon:'🌟', bonus:{ int:20, lck:20 },      awaken:40, desc:'사라진 문명의 피를 잇는다.' },
  undead:    { name:'불사의 혈통', icon:'💀', bonus:{ str:10, sanity:-10 },  awaken:15, desc:'죽음을 거스르는 힘이 있다.' },
};
