// TaleForge v58 — 매판 진득하게 살 수 있는 10가지 시스템 — data
// Pure data split out of patches/322-TaleForge-v58-매판-진득하게-살-수-있는-10가지-시스템.js (see generate.js).

export const MOMENT_TRIGGERS = [
  {re:/크리티컬|치명타|대성공|완벽한 일격|전설적/,tag:'⚡ 전설적 순간'},
  {re:/눈물|흐느|울었|눈시울|오열|애도/,tag:'💧 감동의 순간'},
  {re:/보스.*처치|처치.*보스|쓰러뜨렸|무너졌다/,tag:'⚔️ 승리의 순간'},
  {re:/사랑|고백|마음을 전|당신을 좋아|연인/,tag:'💕 인연의 순간'},
  {re:/배신|뒤통수|등에 칼|믿었던.*충격/,tag:'💔 배신의 순간'},
  {re:/각성|진화|한계를 넘|초월|깨달음/,tag:'✨ 각성의 순간'},
  {re:/희생|목숨을 바쳐|지키기 위해|장렬/,tag:'🌟 희생의 순간'},
  {re:/처음으로|생애 처음|난생처음/,tag:'🌅 첫 번째 순간'},
];

export const HISTORY_TRIGGERS=[
  {re:/왕국.*세웠|건국|왕조.*시작|즉위/,cat:'👑 정치',label:'왕국 건립'},
  {re:/드래곤.*처치|용.*쓰러뜨|고룡.*패배/,cat:'⚔️ 전투',label:'전설적 처치'},
  {re:/엔딩|세계.*구했|봉인.*완성|결말/,cat:'🌌 엔딩',label:'회차 종료'},
  {re:/동맹.*체결|조약.*맺|평화.*이룩/,cat:'🤝 외교',label:'역사적 동맹'},
  {re:/던전.*정복|고대.*유적.*해독|전설.*유물/,cat:'🗝️ 탐험',label:'위대한 발견'},
  {re:/혁명.*일으|반란.*성공|권력.*뒤집/,cat:'🔥 혁명',label:'세계 변혁'},
  {re:/신.*만났|신탁.*받|신성.*계시/,cat:'⭐ 신성',label:'신의 접촉'},
];

export const SEASON_EVENTS_DEFS=[
  {season:'봄',day:1,name:'봄의 축제',icon:'🌸',desc:'모든 상점 20% 할인. 한정 이벤트 NPC 등장.',reward:'골드 보너스',rare:false},
  {season:'봄',day:15,name:'정령의 춤',icon:'🌊',desc:'정령족 특별한 힘. 마력 관련 스킬 강화.',reward:'마력 판정 +20',rare:true},
  {season:'여름',day:15,name:'하지 대제',icon:'☀️',desc:'화염 마법 강화. 특별 퀘스트 등장.',reward:'화염 마법 ×2',rare:true},
  {season:'여름',day:25,name:'바다 축제',icon:'🌊',desc:'서쪽 항구 해양 축제. 희귀 아이템.',reward:'희귀 아이템 상점',rare:true},
  {season:'가을',day:15,name:'추수제',icon:'🌾',desc:'영지 수입 2배. 모든 NPC 관대함 증가.',reward:'자원 대량 확보',rare:false},
  {season:'가을',day:28,name:'망자의 밤',icon:'💀',desc:'언데드 강화. 죽은 NPC 혼령 등장 가능.',reward:'특수 언데드 이벤트',rare:true},
  {season:'겨울',day:1,name:'동짓날',icon:'❄️',desc:'언데드 강화. 신관 정화 의식.',reward:'신앙 이벤트',rare:false},
  {season:'겨울',day:25,name:'별똥별의 밤',icon:'🌟',desc:'소원을 빌면 이루어진다는 전설.',reward:'판정 +30 (1회)',rare:true},
];
