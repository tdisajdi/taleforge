// 🎖️ 칭호 시스템 (완전판) — 1개 활성화, 스탯 효과 적용 — data
// Pure data split out of progression/089-칭호-시스템-완전판-1개-활성화-스탯-효과-적용.js (see generate.js).

export const SUMMON_CATEGORY = {
  undead:    {label:'언데드',    color:'#9a60c0',icon:'💀',maxSlots:6},
  spirit:    {label:'정령',      color:'#60a0e0',icon:'🌀',maxSlots:4},
  demon:     {label:'악마',      color:'#e05050',icon:'😈',maxSlots:3},
  beast:     {label:'마수',      color:'#80c040',icon:'🐺',maxSlots:5},
  golem:     {label:'골렘',      color:'#c08040',icon:'🪨',maxSlots:3},
  angel:     {label:'천사',      color:'#e0d060',icon:'👼',maxSlots:3},
  dragon:    {label:'용',        color:'#e07030',icon:'🐉',maxSlots:2},
  phantom:   {label:'환령',      color:'#a0a0d0',icon:'👻',maxSlots:4},
  elemental: {label:'원소 정령', color:'#40d0c0',icon:'⚡',maxSlots:4},
  construct: {label:'마법 구조체',color:'#d0b040',icon:'⚙️',maxSlots:3},
  other:     {label:'기타',      color:'#c8a96e',icon:'🔮',maxSlots:8},
};

export const SUMMON_JOB_CONFIG = {
  necromancer:{allowed:['undead','phantom'],bonus:'언데드 슬롯+2, HP 30%↑',hpMult:1.3,slotBonus:2},
  summoner:   {allowed:['spirit','beast','demon','angel','dragon','elemental'],bonus:'전 계열 소환, ATK 20%↑',atkMult:1.2},
  warlock:    {allowed:['demon','phantom'],bonus:'악마 계열 강화',hpMult:1.15},
  druid:      {allowed:['beast','elemental','spirit'],bonus:'자연 계열 특화',durationMult:2},
  dark_priest:{allowed:['undead','phantom','demon'],bonus:'어둠 계열 강화',hpMult:1.2},
  alchemist:  {allowed:['golem','construct'],bonus:'구조체 특화, DEF 50%↑',defMult:1.5},
  mage:       {allowed:['elemental','spirit'],bonus:'원소 정령 소환'},
  enchanter:  {allowed:['spirit','phantom','elemental'],bonus:'정신체 계열 강화'},
  sage:       {allowed:['spirit','elemental','phantom'],bonus:'지식 계열 강화'},
  chronomancer:{allowed:['phantom','spirit'],bonus:'시간 정령 소환'},
};

export const SUMMON_PERSONALITY_POOL = [
  {id:'loyal',    label:'충성스러운',  desc:'주인의 명령이라면 무엇이든 따른다. 칭찬에 기뻐하고 위험에 본능적으로 뛰어든다.'},
  {id:'proud',    label:'오만한',      desc:'강자만 인정한다. 처음엔 반항적이지만 진심으로 강해질수록 인정하기 시작한다.'},
  {id:'curious',  label:'호기심 많은', desc:'새로운 것에 흥미를 보인다. 탐험지에서 먼저 달려나가려 한다.'},
  {id:'stoic',    label:'무뚝뚝한',    desc:'말이 없고 감정을 드러내지 않는다. 하지만 위기 때 가장 먼저 나선다.'},
  {id:'timid',    label:'겁 많은',     desc:'처음엔 두려움이 많다. 하지만 유대가 쌓일수록 누구보다 용감해진다.'},
  {id:'playful',  label:'장난스러운',  desc:'전투도 놀이처럼 즐긴다. 유머 감각이 있어 분위기를 띄운다.'},
  {id:'ancient',  label:'고대적인',    desc:'오래 살아온 자의 침착함. 세계의 비밀을 알고 있을 것 같은 눈빛이다.'},
  {id:'vengeful', label:'복수심 가득한',desc:'과거의 한을 품고 있다. 특정 존재(적 계열)에게 본능적 적의를 드러낸다.'},
  {id:'gentle',   label:'온화한',      desc:'전투와 거리가 멀어 보이지만, 아군을 지키는 능력이 탁월하다.'},
  {id:'wild',     label:'야성적인',    desc:'완전히 길들여지지 않았다. 충성도가 낮으면 예측 불가하게 행동한다.'},
];

export const SUMMON_LEVELUP_STAT = {
  undead:    {hp:18,atk:4, def:2, spd:1},
  spirit:    {hp:12,atk:3, def:1, spd:3},
  demon:     {hp:15,atk:6, def:2, spd:2},
  beast:     {hp:20,atk:5, def:3, spd:3},
  golem:     {hp:30,atk:3, def:6, spd:0},
  angel:     {hp:14,atk:4, def:3, spd:2},
  dragon:    {hp:25,atk:7, def:4, spd:2},
  phantom:   {hp:10,atk:5, def:1, spd:4},
  elemental: {hp:13,atk:5, def:2, spd:3},
  construct: {hp:22,atk:3, def:5, spd:1},
  other:     {hp:15,atk:4, def:2, spd:2},
};

export const SUMMON_EVO_THRESHOLDS = [5,12,20,30,45,65];

export const MISSION_TYPES = [
  {id:'scout',    label:'정찰',     icon:'🔍', minLv:1,  duration:3,  desc:'지정 지역을 정찰한다. 소문·지형 정보 수집.',
   rewards:['지역 정보 입수','희귀 장소 발견','적 배치 파악']},
  {id:'hunt',     label:'사냥',     icon:'🗡️', minLv:3,  duration:5,  desc:'야생 마수 사냥. 재료와 경험치를 가져온다.',
   rewards:['사냥 재료 획득','소환수 EXP +50','몬스터 정보 수집']},
  {id:'gather',   label:'채집',     icon:'🌿', minLv:2,  duration:4,  desc:'특수 재료 채집. 강화 에센스 등 소환수 강화 재료.',
   rewards:['강화 에센스 획득','마력 결정 획득','희귀 약초 발견']},
  {id:'guard',    label:'경계',     icon:'🛡️', minLv:5,  duration:6,  desc:'거점을 지킨다. 충성도와 방어 기여.',
   rewards:['충성도 +10','적 침입 저지','동료 NPC 호감도 상승']},
  {id:'spy',      label:'첩보',     icon:'🕵️', minLv:8,  duration:8,  desc:'적 세력 정보 수집. 봉인석 위치 단서 등.',
   rewards:['봉인석 단서 획득','세력 정보','희귀 아이템 절취']},
  {id:'special',  label:'특수 임무',icon:'⭐', minLv:15, duration:12, desc:'소환수 고유 특성에 맞는 특별 임무.',
   rewards:['고급 마력 결정','소환수 고유 아이템','EXP 대량 획득']},
];

export const SUMMON_ENHANCE_MATERIALS={
  '마력 결정':{exp:50},'강화 에센스':{exp:100},'고급 마력 결정':{exp:200},
  '신성한 결정':{exp:500},'어둠의 수정':{exp:150},'세계수 씨앗':{exp:400},
  '드래곤 스케일':{exp:350},'봉인석 파편':{exp:800},
};

export const MOOD_INFO={
  happy:   {icon:'😊',label:'기쁨',    color:'#80c080'},
  excited: {icon:'⚡',label:'흥분',    color:'#e0c040'},
  neutral: {icon:'😐',label:'평온',    color:'#8a8a6a'},
  sulk:    {icon:'😒',label:'토라짐',  color:'#e08050'},
  wary:    {icon:'👀',label:'경계',    color:'#a060c0'},
};
