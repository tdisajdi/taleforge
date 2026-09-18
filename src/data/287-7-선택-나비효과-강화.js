// 7. 선택 나비효과 강화 — data
// Pure data split out of items/287-7-선택-나비효과-강화.js (see generate.js).

export const BUTTERFLY_TRIGGERS = [
  { pattern:/죽였|처치했|살해|제거/, tag:'killed', memo:(msg)=>`NPC를 처치했다: "${msg.slice(0,30)}"` },
  { pattern:/배신|등을 돌|저버린|팔아넘|거짓말/, tag:'betrayal', memo:(msg)=>`배신 행동: "${msg.slice(0,30)}"` },
  { pattern:/구했|도왔|살렸|지켰|보호/, tag:'saved', memo:(msg)=>`누군가를 구했다: "${msg.slice(0,30)}"` },
  { pattern:/맹세|서약|약속|계약.*맺/, tag:'oath', memo:(msg)=>`약속을 했다: "${msg.slice(0,30)}"` },
  { pattern:/파괴|부쉈|불태워|무너뜨/, tag:'destroyed', memo:(msg)=>`무언가를 파괴했다: "${msg.slice(0,30)}"` },
  { pattern:/비밀.*알았|진실.*발견|비밀.*밝혀/, tag:'secret', memo:(msg)=>`비밀을 발견했다: "${msg.slice(0,30)}"` },
];
