// 음유시인 — 공연 / 후원자 / 전설곡 — data
// Pure data split out of misc/254-음유시인-공연-후원자-전설곡.js (see generate.js).

export const SONG_GENRES = [
  { id:'ballad', name:'발라드', icon:'🎻', baseFame:3, baseGold:[10,30] },
  { id:'epic',   name:'서사시', icon:'⚔️', baseFame:5, baseGold:[5,20] },
  { id:'tavern', name:'주점가', icon:'🍺', baseFame:2, baseGold:[15,40] },
  { id:'lament', name:'애가',   icon:'🕯️', baseFame:4, baseGold:[8,25] },
];

export const PATRON_CANDIDATES = ['귀족 백작 부인','거상 길드장','은퇴한 장군','왕실 시종장','수도원장'];
