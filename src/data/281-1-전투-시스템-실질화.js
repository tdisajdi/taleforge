// 1. 전투 시스템 실질화 — data
// Pure data split out of combat/281-1-전투-시스템-실질화.js (see generate.js).

export const COMBAT_ACTIONS = {
  attack:  { label:'⚔️ 공격',    keys:['공격','베','찌르','때려','쳐'], statKey:'str', mpCost:0 },
  skill:   { label:'✨ 스킬',    keys:['스킬','마법','주문','시전'],    statKey:'mgc', mpCost:15 },
  defend:  { label:'🛡️ 방어',   keys:['방어','막아','버텨','가드'],    statKey:'end', mpCost:0 },
  dodge:   { label:'💨 회피',    keys:['피해','회피','도망','달려'],    statKey:'agi', mpCost:0 },
  item:    { label:'🎒 아이템',  keys:['포션','약','먹어','사용'],      statKey:null,  mpCost:0 },
  taunt:   { label:'😤 도발',    keys:['도발','유인','주의끌','소리'], statKey:'spk', mpCost:0 },
};
