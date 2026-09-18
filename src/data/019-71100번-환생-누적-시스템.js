// 71~100번 환생 누적 시스템 — data
// Pure data split out of progression/019-71100번-환생-누적-시스템.js (see generate.js).

export const HIGHLIGHT_TYPES = [
  { id:"first_kill",     icon:"⚔️", label:"첫 번째 전투",     template:"${name}이(가) 처음으로 칼을 들었던 그 순간—" },
  { id:"betrayal",       icon:"🗡️", label:"배신의 순간",       template:"믿었던 자의 칼날이 등을 향하던 순간—" },
  { id:"sacrifice",      icon:"🌹", label:"희생의 선택",       template:"모든 것을 내려놓고 타인을 위해 몸을 던지던 순간—" },
  { id:"final_battle",   icon:"🔥", label:"최후의 전투",       template:"모든 것을 걸고 마지막 적과 맞섰던 그 순간—" },
  { id:"reunion",        icon:"💕", label:"재회의 순간",       template:"오랜 이별 끝에 다시 만났던 그 눈빛—" },
  { id:"revelation",     icon:"💡", label:"진실의 발견",       template:"감춰진 진실이 드러나 모든 것이 뒤바뀌던 순간—" },
  { id:"death",          icon:"💀", label:"죽음의 순간",       template:"마지막 숨을 내쉬며 눈을 감던 그 순간—" },
  { id:"victory",        icon:"🏆", label:"승리의 순간",       template:"불가능을 가능으로 만들었던 바로 그 순간—" },
];

export const BUTTERFLY_STAGES = [
  { stage:0, range:[0,20],   label:"잔잔한 물결",   desc:"선택이 주변에 작은 파문을 만든다.",              chaosChance:0 },
  { stage:1, range:[21,40],  label:"퍼지는 파문",    desc:"하나의 선택이 예상치 못한 곳에서 반응을 낳는다.", chaosChance:10 },
  { stage:2, range:[41,60],  label:"연쇄 반응",      desc:"행동 하나가 연달아 여러 사건을 일으킨다.",        chaosChance:25 },
  { stage:3, range:[61,80],  label:"태풍의 눈",      desc:"당신의 존재 자체가 세계를 뒤흔든다.",             chaosChance:45 },
  { stage:4, range:[81,100], label:"카오스 모드",    desc:"작은 말 한마디가 역사를 바꾼다. 세계가 혼돈이다.", chaosChance:70 },
];

export const INSCRIPTION_LINES = [
  { line:1,  text:"태초에 빛이 있었고, 빛은 어둠을 낳았다.",                                hint:"세계의 기원에 관한 첫 번째 진실." },
  { line:2,  text:"어둠은 빛을 삼키려 했으나, 빛은 죽지 않았다.",                           hint:"최초의 전쟁에 관한 기록." },
  { line:3,  text:"균형을 지키는 자가 세계의 수호자가 된다.",                                hint:"수호자의 조건." },
  { line:4,  text:"영혼은 죽어도 기억은 남는다. 기억이 곧 힘이다.",                         hint:"환생의 원리." },
  { line:5,  text:"가장 강한 자는 칼을 든 자가 아니라, 내려놓을 줄 아는 자다.",             hint:"진정한 힘의 정의." },
  { line:6,  text:"세계는 순환한다. 끝은 곧 시작이다.",                                     hint:"운명의 수레바퀴." },
  { line:7,  text:"봉인된 신은 잠든 게 아니라 기다리고 있다.",                              hint:"감시자의 정체." },
  { line:8,  text:"진실을 알면 세계가 흔들린다. 그래도 알아야 한다.",                       hint:"금지된 지식의 가치." },
  { line:9,  text:"환생자가 백 번 생을 거치면 세계 자체가 깨어난다.",                       hint:"최종 비밀의 조건." },
  { line:10, text:"모든 것을 기억하는 자만이 모든 것을 내려놓을 수 있다.",                  hint:"해탈의 조건." },
];

export const REINCARNATION_RANKS = [
  { rank:0, icon:"🪨", label:"하급 윤회자",   minScore:0,   bonus:"없음",                                 desc:"이제 막 순환을 시작한 영혼." },
  { rank:1, icon:"🌿", label:"중급 윤회자",   minScore:50,  bonus:"시작 스탯 +3 전체",                    desc:"여러 생을 거쳐 성장한 영혼." },
  { rank:2, icon:"⭐", label:"상급 윤회자",   minScore:150, bonus:"시작 스탯 +5, 히든 선택지 추가",       desc:"세계가 인정하는 강한 영혼." },
  { rank:3, icon:"💎", label:"신급 윤회자",   minScore:300, bonus:"시작 스탯 +8, 신급 스킬 1개 해금",     desc:"신의 영역에 발을 들인 영혼." },
  { rank:4, icon:"🌈", label:"해탈",          minScore:500, bonus:"모든 제약 해제, 진 엔딩 루트 해금",   desc:"순환을 초월한 자유로운 영혼." },
];

export const SAKURA_CONDITIONS = [
  { id:"all_scenarios",     label:"모든 시나리오 클리어",   desc:"모든 세계관에서 최소 1회 생존 엔딩" },
  { id:"karma_balance",     label:"업보의 균형",             desc:"카르마 점수 40~60 사이로 엔딩 3회 이상" },
  { id:"no_grudge",         label:"원한 없는 엔딩",          desc:"적을 용서하고 마무리한 엔딩 2회 이상" },
  { id:"companion_saved",   label:"모두를 지킨 자",          desc:"동료를 한 명도 잃지 않은 회차 1회 이상" },
  { id:"cycle_twenty",      label:"스무 번의 삶",            desc:"20회차 이상 도달" },
  { id:"all_new_scenarios", label:"새 세계관 개척자",        desc:"아포칼립스·신화·스팀펑크 모두 1회 이상 클리어" },
  { id:"villain_end",       label:"악당의 길",               desc:"악당 루트로 엔딩 2회 이상 달성" },
  { id:"sacrifice_end",     label:"희생자의 길",             desc:"자기희생 엔딩 2회 이상 달성" },
  { id:"all_races",         label:"모든 종족 체험",          desc:"6종 이상의 다른 종족으로 플레이" },
  { id:"hidden_job_ten",    label:"비밀 수집가",             desc:"숨겨진 직업 10개 이상 해금" },
];

export const DEJAVU_TRIGGERS = [
  { id:"tavern_entrance",  keyword:["술집","주점","여관"],        feeling:"이 냄새... 어딘가 전에 맡아본 것 같다." },
  { id:"dark_corridor",    keyword:["어두운","복도","지하"],      feeling:"이 어둠의 질감이 손에 잡힐 듯 익숙하다." },
  { id:"sword_clash",      keyword:["칼","검","충돌","전투"],     feeling:"이 금속 소리... 몇 번이나 들었던 것 같다." },
  { id:"betrayal_scene",   keyword:["배신","뒤통수","속임"],      feeling:"예상했다. 왜인지 모르게 처음부터 알고 있었다." },
  { id:"ancient_ruin",     keyword:["유적","고대","폐허"],        feeling:"이 돌의 결... 손으로 더듬어본 적 있다는 확신이 든다." },
  { id:"dying_npc",        keyword:["죽어","숨이","마지막"],      feeling:"이 장면이 꿈에 나왔다. 분명히 꿈에서 보았다." },
  { id:"final_boss",       keyword:["최종","보스","마왕","악마"], feeling:"이 존재를 이미 알고 있다. 그리고 이 자와의 싸움도." },
  { id:"reunion",          keyword:["재회","다시만","오랜만"],    feeling:"이 만남이... 처음이 아니다. 처음일 리가 없다." },
];

export const CREDITOR_NAMES = ["그라마스 빚 추심단","어둠의 거래소","세계 은행 특별 수금팀","운명의 빚쟁이","전생 채무 정리 기관"];

export const TRAUMA_DEFS80 = [
  { id:"abandoned",   icon:"😢", label:"버려진 기억",    trigger:"홀로 남겨지는 상황",  flashback:"어릴 때 어둠 속에 혼자 남겨졌던 그 밤이 스쳐 지나간다.",  effect:"단독 행동 시 불안 +10" },
  { id:"betrayed",    icon:"💔", label:"배신의 상처",    trigger:"믿었던 자의 배신",   flashback:"처음으로 등에 칼이 꽂혔던 순간이 선명하게 떠오른다.",        effect:"새 NPC 신뢰 형성 시간 증가" },
  { id:"loss",        icon:"🕯️", label:"소중한 이의 죽음", trigger:"동료의 사망",     flashback:"그 차가운 손의 감촉이 아직도 잊혀지지 않는다.",              effect:"동료 사망 시 행동 불능 위험" },
  { id:"defeat",      icon:"⚔️", label:"굴욕적 패배",    trigger:"압도적 열세의 전투", flashback:"무력하게 쓰러졌던 그 순간, 발밑의 흙냄새가 생생하다.",       effect:"압도적 적 앞에서 떨림" },
  { id:"hunger",      icon:"🍞", label:"굶주림의 기억",  trigger:"자원 부족 상황",    flashback:"배고픔으로 의식이 흐릿해지던 그날의 감각이 되살아난다.",      effect:"식량 부족 시 판정 -10" },
  { id:"fire",        icon:"🔥", label:"불의 공포",      trigger:"화염 관련 이벤트",  flashback:"모든 것이 타오르던 그날 밤의 냄새가 코를 찌른다.",            effect:"화염 마법/이벤트 시 공황" },
];

export const APOCALYPSE_STAGES = [
  { stage:0, clock:[0,20],  icon:"🌍", label:"평화로운 세계",    desc:"아직 이상이 없다.",                           warning:null },
  { stage:1, clock:[21,40], icon:"⚠️", label:"불길한 징조",      desc:"세계 곳곳에서 이상한 일들이 일어나기 시작한다.", warning:"자연재해가 소폭 증가한다." },
  { stage:2, clock:[41,60], icon:"🌩️", label:"균열의 시작",      desc:"현실의 균열이 눈에 보이기 시작한다.",            warning:"강력한 몬스터들이 각성한다." },
  { stage:3, clock:[61,80], icon:"🌑", label:"어둠의 확산",      desc:"빛이 줄어들고 어둠이 세계를 잠식한다.",          warning:"NPC들이 공황 상태에 빠진다." },
  { stage:4, clock:[81,99], icon:"☄️", label:"종말의 전야",      desc:"세계의 끝이 보인다. 지금 당장 봉인해야 한다.",   warning:"최종 봉인 이벤트를 활성화하지 않으면 멸망이 확정된다." },
  { stage:5, clock:[100,100], icon:"💀", label:"세계 멸망",      desc:"세계가 멸망했다. 특별 엔딩이 발동된다.",         warning:"멸망 엔딩 고유 보상 존재." },
];

export const GRIEF_STAGES = [
  { stage:0, range:[0,2],   icon:"😐", label:"담담함",   empathy:0,  willPenalty:0,  desc:"아직 잃은 자가 없거나 적다." },
  { stage:1, range:[3,5],   icon:"😔", label:"상실감",   empathy:10, willPenalty:5,  desc:"슬픔이 가슴 한편에 자리 잡았다." },
  { stage:2, range:[6,10],  icon:"😢", label:"깊은 슬픔", empathy:20, willPenalty:10, desc:"잃은 자들의 얼굴이 꿈에 나온다." },
  { stage:3, range:[11,20], icon:"💔", label:"통곡",     empathy:35, willPenalty:20, desc:"이 많은 죽음을 어떻게 감당하는가." },
  { stage:4, range:[21,99], icon:"🕯️", label:"초월적 슬픔", empathy:50, willPenalty:5, desc:"슬픔이 너무 커서 오히려 고요해진다. 다시는 잃지 않겠다는 의지." },
];

export const CURSED_RELIC_TYPES = [
  { id:"shadow_ring",   icon:"💍", name:"그림자 반지",   curse:"어두운 장소에서 형체가 흐릿해진다.",        hiddenPower:"그림자 이동 능력 (50% 확률)" },
  { id:"blood_sword",   icon:"⚔️", name:"피의 검",        curse:"전투 중 자신도 피를 흘린다.",              hiddenPower:"적에게 출혈 상태 부여" },
  { id:"eye_of_madness",icon:"👁️", name:"광기의 눈",     curse:"너무 많이 보면 현실 인식이 흐려진다.",     hiddenPower:"감춰진 것들이 보인다" },
  { id:"hunger_crown",  icon:"👑", name:"굶주림의 왕관", curse:"항상 무언가를 원하게 된다.",               hiddenPower:"욕망이 강해져 의지력 +15" },
  { id:"void_cloak",    icon:"🌑", name:"공허의 망토",   curse:"존재감이 옅어져 NPC가 무시하기 쉽다.",    hiddenPower:"완전 은신 (단시간)" },
];

export const WISH_OPTIONS = [
  { id:"stat_reset",    icon:"🔄", label:"스탯 완전 초기화",     desc:"누적 페널티와 패시브 저주를 모두 초기화한다." },
  { id:"npc_revive",    icon:"💫", label:"NPC 부활",             desc:"전생에서 잃은 중요 NPC 한 명을 이번 회차에 되살린다." },
  { id:"item_restore",  icon:"💎", label:"잃어버린 아이템 복구",  desc:"전생에서 잃거나 파괴된 아이템 하나를 되찾는다." },
  { id:"cycle_skip",    icon:"⏩", label:"저주 회차 면제",        desc:"다음 한 회차의 모든 페널티와 저주를 면제받는다." },
  { id:"hidden_ending", icon:"🌈", label:"히든 엔딩 조건 1개 완성", desc:"현재 미완성인 히든 엔딩 조건 중 하나를 자동 달성한다." },
];

export const PET_TYPES = [
  { id:"wolf",    icon:"🐺", name:"늑대",    bond:"전투 시 본능적으로 옆에서 싸운다.",     reuniteItem:"날고기 또는 뼈" },
  { id:"raven",   icon:"🦅", name:"까마귀",  bond:"정보를 물어다 준다. 적 위치 정찰.",    reuniteItem:"반짝이는 물건" },
  { id:"cat",     icon:"🐱", name:"고양이",  bond:"위험 감지 능력. 함정·독 사전 경고.",   reuniteItem:"생선 또는 밀크" },
  { id:"horse",   icon:"🐴", name:"말",       bond:"이동 속도 상승. 전투 중 돌격 보조.",   reuniteItem:"사과 또는 당근" },
  { id:"owl",     icon:"🦉", name:"올빼미",  bond:"야간 탐색 능력. 어두운 곳에서 길 안내.", reuniteItem:"쥐 또는 고기 조각" },
  { id:"dragon_whelp", icon:"🐲", name:"아기 용", bond:"화염 보조 공격. 강력하지만 관리 어려움.", reuniteItem:"불꽃 결정" },
];

export const SEALED_MEMORY_TYPES = [
  { id:"first_kill",     trigger:"처음으로 사람을 죽인 기억",      skill:"살인자의 냉정 — 감정 소모 없이 전투 가능",       mentalCost:20 },
  { id:"betrayal_pain",  trigger:"가장 아꼈던 자에게 배신당한 기억", skill:"배신의 면역 — 신뢰 판정 대신 독립 행동 보너스", mentalCost:25 },
  { id:"mass_death",     trigger:"대규모 죽음을 목격한 기억",        skill:"죽음의 관찰자 — 사망 원인과 HP 수치 감지",       mentalCost:30 },
  { id:"own_atrocity",   trigger:"스스로 저지른 잔학한 행동의 기억", skill:"어둠의 힘 — 카르마 소모로 강력한 기술 발동",    mentalCost:35 },
  { id:"true_despair",   trigger:"모든 것을 포기했던 절망의 기억",    skill:"절망의 극복 — 위기 시 모든 스탯 일시 2배",      mentalCost:40 },
];

export const SOUL_CRYSTAL_CRAFTS = [
  { id:"memory_gem",    cost:3,  icon:"💎", name:"기억의 보석",     effect:"전생 기억 열람 시 정확도 100%", bonus:"기억 왜곡 면역" },
  { id:"fate_shield",   cost:5,  icon:"🛡️", name:"운명의 방패",     effect:"즉사 판정 무효 1회 추가",       bonus:"매 회차 추가 보유" },
  { id:"soul_crown",    cost:8,  icon:"👑", name:"영혼의 왕관",     effect:"모든 스탯 +10 영구",            bonus:"윤회 등급 1 상승" },
  { id:"time_hourglass",cost:12, icon:"⏳", name:"시간의 모래시계", effect:"시간 역행 토큰 +2 추가",        bonus:"토큰 최대치 +2" },
  { id:"world_orb",     cost:20, icon:"🌐", name:"세계의 구슬",     effect:"봉인된 신 해방 조건 달성",      bonus:"메타 스토리 개막" },
];

export const EMOTION_ECHOES = {
  rage:    { icon:"🔥", label:"분노의 잔향",  trait:"분노 게이지 시스템 추가. 분노가 쌓일수록 전투력 상승.",  bonus:"전투 판정 +15 (분노 상태)", sideEffect:"냉정한 판단 -10" },
  sorrow:  { icon:"💧", label:"슬픔의 잔향",  trait:"공감 능력 극대화. NPC의 감정을 본능적으로 읽는다.",      bonus:"대화 판정 +15",             sideEffect:"슬픈 이벤트에서 행동력 -10" },
  joy:     { icon:"✨", label:"기쁨의 잔향",  trait:"행운 수치 상승. 작은 일에도 긍정적 파급 효과.",          bonus:"행운 판정 +10 전체",        sideEffect:"위험 감지 -5" },
  fear:    { icon:"😰", label:"공포의 잔향",  trait:"위험 감지 본능. 함정·위협을 직감적으로 느낀다.",         bonus:"위험 감지 +20",             sideEffect:"새로운 도전 판정 -5" },
  pride:   { icon:"👑", label:"자부심의 잔향", trait:"카리스마 폭발. 말 한마디가 군중을 움직인다.",            bonus:"리더십 판정 +20",           sideEffect:"협력 요청 거부 본능" },
  despair: { icon:"🌑", label:"절망의 잔향",  trait:"극한 상황에서 각성. 죽을 것 같을 때 오히려 강해진다.",  bonus:"위기 판정 +25",             sideEffect:"평상시 의욕 -10" },
  love:    { icon:"💕", label:"사랑의 잔향",  trait:"강한 인연 형성. NPC와의 유대 상승 속도 2배.",           bonus:"인연 관련 판정 +20",        sideEffect:"인연 잃으면 큰 타격" },
  hatred:  { icon:"💀", label:"증오의 잔향",  trait:"복수 의지. 목표가 생기면 모든 능력이 집중된다.",         bonus:"대상 지정 판정 +25",        sideEffect:"대상 없으면 방황" },
};

export const DIMENSION_UNLOCK_STAGES = [
  { count:3,  icon:"🗺️", skill:"차원 감지",       desc:"다른 세계의 기운을 어렴풋이 느낄 수 있다." },
  { count:6,  icon:"🌀", skill:"균열 탐지",         desc:"차원 균열이 생기는 위치를 미리 감지한다." },
  { count:10, icon:"🌌", skill:"차원 보행",          desc:"짧은 거리의 차원 이동이 가능해진다." },
  { count:15, icon:"🌐", skill:"멀티버스 항법",      desc:"원하는 시나리오 세계로 이동 확률 상승." },
  { count:20, icon:"♾️", skill:"차원의 지배자",      desc:"어느 세계에서도 처음부터 지식을 가진 채 시작." },
];

export const ELEMENT_PAIRS = {
  fire:    { opposite:"ice",     resistLabel:"화염 내성",   weakLabel:"냉기 약점",   icon:"🔥" },
  ice:     { opposite:"fire",    resistLabel:"냉기 내성",   weakLabel:"화염 약점",   icon:"❄️" },
  lightning:{ opposite:"earth",  resistLabel:"번개 내성",   weakLabel:"대지 약점",   icon:"⚡" },
  earth:   { opposite:"lightning",resistLabel:"대지 내성",  weakLabel:"번개 약점",   icon:"🌍" },
  poison:  { opposite:"holy",    resistLabel:"상태이상 내성", weakLabel:"신성 약점",   icon:"🧬" },
  holy:    { opposite:"poison",  resistLabel:"신성 내성",   weakLabel:"상태이상 약점", icon:"✨" },
  darkness:{ opposite:"light",   resistLabel:"암흑 내성",   weakLabel:"빛 약점",     icon:"🌑" },
  light:   { opposite:"darkness",resistLabel:"빛 내성",     weakLabel:"암흑 약점",   icon:"☀️" },
};

export const CIRCUS_ACTS = [
  { id:"mirror_act",   icon:"🪞", name:"거울 묘기사",    desc:"전생의 자신이 광대 분장으로 마주 서 있다.",          reward:"전생 기억 파편 1개", challenge:"자신과의 의지력 대결" },
  { id:"tightrope",    icon:"🎪", name:"줄타기",          desc:"삶과 죽음의 경계 위를 걷는다.",                      reward:"불사 게이지 +3",     challenge:"균형 판정 3회 연속 성공" },
  { id:"fire_eater",   icon:"🔥", name:"불 삼키기",       desc:"전생에서 죽인 적이 불을 뿜는다.",                    reward:"화염 내성",           challenge:"화염 판정 극복" },
  { id:"juggler",      icon:"🎭", name:"마왕 저글러",     desc:"처치한 보스들이 어릿광대로 등장해 실력을 겨룬다.",   reward:"보스 고유 스킬 1개",  challenge:"세 가지 판정 동시 성공" },
  { id:"ringmaster",   icon:"🎩", name:"단장",            desc:"정체불명의 단장이 한 가지 비밀을 알려준다.",          reward:"대미스터리 조각 1개", challenge:"없음" },
];

export const TEMPLE_LEVELS = [
  { level:0, faith:0,   icon:"🕯️", name:"없음",       worshippers:0,    boon:null },
  { level:1, faith:20,  icon:"⛩️", name:"작은 사당",  worshippers:5,    boon:"소소한 치유 (HP +20 회복)" },
  { level:2, faith:50,  icon:"🏛️", name:"소신전",    worshippers:30,   boon:"신도 버프 (전투 판정 +5)" },
  { level:3, faith:80,  icon:"🕌", name:"대신전",    worshippers:200,  boon:"신성한 가호 (즉사 판정 -30%)" },
  { level:4, faith:120, icon:"🏰", name:"성지",      worshippers:1000, boon:"신의 대리자 (모든 판정 +10)" },
  { level:5, faith:200, icon:"👑", name:"신화의 성지", worshippers:9999, boon:"신격화 준비 완료. 다음 회차 진 엔딩 루트 해금." },
];

export const MUTATION_DEFS = {
  human:    { threshold:5,  mutation:"반신 각성",      appearance:"눈동자가 금빛으로 변하고 등에서 희미한 빛이 난다.",  skill:"반신의 의지 — 판정 실패를 1회 재도전" },
  elf:      { threshold:4,  mutation:"고대 요정 회귀", appearance:"귀가 더 길어지고 피부에서 별빛이 난다.",              skill:"별의 은총 — 야간 모든 판정 +20" },
  dwarf:    { threshold:4,  mutation:"강철 혈통",       appearance:"피부 일부가 금속처럼 굳어진다.",                     skill:"강철 피부 — 물리 피해 -30%" },
  dragon:   { threshold:3,  mutation:"용신 각성",       appearance:"작은 뿔이 자라고 눈이 세로 동공으로 변한다.",        skill:"용의 숨결 — 화염/냉기 중 선택 방출" },
  demon:    { threshold:3,  mutation:"순수 악마화",     appearance:"날개가 완전히 자라고 검은 오라가 방출된다.",          skill:"악마의 진상 — 한 턴 모든 능력 2배" },
  beastkin: { threshold:4,  mutation:"야수 해방",       appearance:"야수 특성이 강화되어 반야수 형태로 변신 가능.",      skill:"야수 변신 — 전투력 3배, 이성 일시 하락" },
};

export const DARK_ECHO_RUMORS = [
  { infamyRequired:10,  rumor:"마을에 낯선 이방인이 나타나면 재앙이 따른다는 소문이 돈다." },
  { infamyRequired:25,  rumor:"그 이름만 들어도 아이들이 울음을 그친다는 말이 있다." },
  { infamyRequired:40,  rumor:"죽은 자들이 그의 이름을 저주했다는 이야기가 노래로 남았다." },
  { infamyRequired:60,  rumor:"그가 지나간 자리에는 삼 년간 꽃이 피지 않는다고 한다." },
  { infamyRequired:80,  rumor:"신전의 사제들이 그의 도래를 예언으로 기록해두었다 — 재앙의 전조로." },
  { infamyRequired:100, rumor:"세계 각지의 악인들이 그를 전설로 모시기 시작했다. 악의 왕이 돌아왔다." },
];

export const DARK_FEAR_LEVELS = [
  { level:0, label:"무명",         effect:"아직 악명이 없다.",                      npcReaction:"일반 반응" },
  { level:1, label:"불길한 이방인", effect:"일부 NPC가 경계한다.",                   npcReaction:"경계+의심" },
  { level:2, label:"악명 높은 자",  effect:"대부분의 NPC가 먼저 시선을 피한다.",     npcReaction:"회피+공포" },
  { level:3, label:"공포의 전설",   effect:"NPC들이 이름만 들어도 두려워한다.",      npcReaction:"공황+복종" },
  { level:4, label:"살아있는 재앙", effect:"악인들이 복종하고 선인들이 토벌단을 꾼다.", npcReaction:"악당 결집+영웅 적대" },
];
