// [8] 로맨스 시스템 — data
// Pure data split out of npc/211-8-로맨스-시스템.js (see generate.js).

export const ROMANCE_STAGES = [
  { level:0, name:'모름',     threshold:0,   icon:'👤', desc:'아직 인연이 없다' },
  { level:1, name:'안면',     threshold:20,  icon:'🤝', desc:'서로를 알기 시작했다' },
  { level:2, name:'친구',     threshold:40,  icon:'😊', desc:'믿을 수 있는 사이' },
  { level:3, name:'호감',     threshold:60,  icon:'💙', desc:'마음속에 특별한 자리' },
  { level:4, name:'연인',     threshold:80,  icon:'💕', desc:'서로의 곁에 있고 싶다' },
  { level:5, name:'영원한 인연',threshold:100,icon:'💍', desc:'이 생이 끝나도 찾아올 것이다' },
];
