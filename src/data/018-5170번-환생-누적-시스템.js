// 51~70번 환생 누적 시스템 — data
// Pure data split out of progression/018-5170번-환생-누적-시스템.js (see generate.js).

export const STAR_SIGNS = [
  { id:"aries",       icon:"♈", name:"양자리",     trait:"전사",     bonus:"전투 판정 +10, 선제 공격 우위",    penalty:"외교 협상 -10" },
  { id:"taurus",      icon:"♉", name:"황소자리",   trait:"수호자",   bonus:"HP 최대치 +20, 방어 판정 +10",     penalty:"민첩 관련 판정 -5" },
  { id:"gemini",      icon:"♊", name:"쌍둥이자리", trait:"변신자",   bonus:"위장·변장 판정 +15, 언어 재능",    penalty:"의지력 판정 -10" },
  { id:"cancer",      icon:"♋", name:"게자리",     trait:"치유사",   bonus:"회복 아이템 효과 +30%, NPC 신뢰",  penalty:"직접 전투 판정 -5" },
  { id:"leo",         icon:"♌", name:"사자자리",   trait:"지도자",   bonus:"카리스마 판정 +15, 동료 사기 상승", penalty:"단독 은신 판정 -10" },
  { id:"virgo",       icon:"♍", name:"처녀자리",   trait:"분석가",   bonus:"정보 수집·분석 판정 +15",           penalty:"충동적 판정 +5 (불리)" },
  { id:"libra",       icon:"♎", name:"천칭자리",   trait:"중재자",   bonus:"협상·중재 판정 +15, 균형의 길",    penalty:"극단적 선택 시 페널티" },
  { id:"scorpio",     icon:"♏", name:"전갈자리",   trait:"암살자",   bonus:"독·함정 판정 +15, 비밀 탐지",      penalty:"빛의 장소에서 판정 -5" },
  { id:"sagittarius", icon:"♐", name:"사수자리",   trait:"탐험가",   bonus:"미지 탐험 판정 +15, 이동 속도",    penalty:"한 곳에 오래 있으면 -5" },
  { id:"capricorn",   icon:"♑", name:"염소자리",   trait:"장인",     bonus:"제작·건설 판정 +15, 체력 지속력",  penalty:"직관 판정 -10" },
  { id:"aquarius",    icon:"♒", name:"물병자리",   trait:"혁신가",   bonus:"마법·기술 판정 +15, 창의적 해결",  penalty:"전통적 방식 판정 -5" },
  { id:"pisces",      icon:"♓", name:"물고기자리", trait:"예언자",   bonus:"예지·직관 판정 +15, 꿈 이벤트 강화", penalty:"현실 인식 판정 -5" },
];

export const PAST_LANGUAGE_PHRASES = [
  { level:3,  phrase:"아노스 티르",   meaning:"나는 이곳을 안다",       trigger:"고대 유적·신전 NPC에게 사용 시 히든 퀘스트" },
  { level:4,  phrase:"멜리아 소론",   meaning:"우리는 이전에 만났다",   trigger:"전생 인연 NPC 조우 시 기억 각성" },
  { level:5,  phrase:"카이로스 엔드", meaning:"시간은 반복된다",         trigger:"시간 관련 보스·이벤트에서 사용 시 약점 노출" },
  { level:6,  phrase:"에테르 나시온", meaning:"나는 환생자다",           trigger:"루프 자각자 길드 입장 코드" },
  { level:7,  phrase:"오메가 리툼",   meaning:"세계의 끝을 보았다",      trigger:"최종 보스에게 사용 시 특수 대화 루트" },
  { level:8,  phrase:"아크 디비누스", meaning:"신은 거짓이다",           trigger:"신화 세계관 시나리오 히든 루트 해금" },
  { level:9,  phrase:"레비 아스칼",   meaning:"나는 모든 것을 기억한다", trigger:"무한 회귀 자각 이벤트 트리거" },
  { level:10, phrase:"솔 이터니움",   meaning:"영원한 영혼",             trigger:"해탈 엔딩 루트 해금 키" },
];

export const IDENTITY_ARCHETYPES = [
  { id:"noble",      icon:"👑", label:"귀족 신분",   desc:"상류층 접근 가능, 의심 없이 성·저택 출입",   bonus:"사교 판정 +20, 귀족 NPC 초기 호감" },
  { id:"merchant",   icon:"💰", label:"상인 신분",   desc:"시장·항구 자유 접근, 거래 시 유리한 위치",   bonus:"거래 판정 +15, 정보 구매 할인" },
  { id:"scholar",    icon:"📚", label:"학자 신분",   desc:"도서관·마법탑 접근, 고대 문헌 열람 권한",    bonus:"지식 판정 +15, 비밀 문서 접근" },
  { id:"soldier",    icon:"⚔️", label:"병사 신분",   desc:"군사 시설 접근, 무기 소지 합법화",           bonus:"군사 NPC 협력, 순찰 무시" },
  { id:"priest",     icon:"⛪", label:"사제 신분",   desc:"신전·성소 접근, 일반인 신뢰 자동 획득",      bonus:"치유 관련 판정 +10, 악령 퇴치 권한" },
  { id:"assassin",   icon:"🗡️", label:"암살자 신분", desc:"지하세계 접근, 정보 브로커와 연결",          bonus:"은신 판정 +15, 킬 의뢰 수락" },
  { id:"wanderer",   icon:"🌍", label:"방랑자 신분", desc:"어느 세력에도 속하지 않음. 자유로운 이동",   bonus:"이동 판정 +10, 중립 지역 어디서나 환영" },
  { id:"bard",       icon:"🎵", label:"음유시인 신분", desc:"각지 소문 수집, 공연으로 NPC 주의 분산",   bonus:"정보 수집 +15, 군중 매혹 판정" },
];

export const RIFT_SCENARIOS = [
  { id:"medieval_bleed",   icon:"🏰", label:"중세 균열",        desc:"기사와 성벽의 잔상이 현재 세계에 투영된다.",     loot:"마법 검 파편 / 고대 문서",  npc:"방랑 기사" },
  { id:"fantasy_bleed",    icon:"🧙", label:"마법 세계 균열",   desc:"정령의 노래와 마법진 잔광이 희미하게 보인다.",   loot:"마법석 / 희귀 약초",        npc:"떠도는 마법사" },
  { id:"void_bleed",       icon:"🌌", label:"허공 균열",        desc:"완전한 어둠 속에서 형언할 수 없는 존재의 숨결.", loot:"허공의 결정 / 봉인 문양",   npc:"공허의 감시자" },
];

export const RECIPE_TIERS = [
  { tier:1, icon:"🧪", label:"일반 제조법",   minCycle:1,  recipes:["체력 포션","해독제","횃불","식량 압축","기초 독약"] },
  { tier:2, icon:"⚗️", label:"고급 제조법",   minCycle:3,  recipes:["강화 포션","원소 탄환","마법 잉크","식물 촉진제","방어 부적"] },
  { tier:3, icon:"🔮", label:"희귀 제조법",   minCycle:5,  recipes:["엘릭서","환영 폭탄","영혼 결정 조각","시간 지연 약","정신 강화제"] },
  { tier:4, icon:"💎", label:"전설 제조법",   minCycle:8,  recipes:["불사의 약초","차원 절단기","운명 변환제","신의 분노 결정","기억 결정"] },
  { tier:5, icon:"🌟", label:"신화 제조법",   minCycle:12, recipes:["세계 종말 억제제","영혼 부활약","시간 역행 촉매","신격화 엘릭서","공허 봉인재"] },
];

export const ROMANCE_FATES = [
  { depth:1, icon:"🌸", label:"설렘",       firstMeet:"처음 만나는데도 어딘가 편안한 느낌을 받는다.",                bond:15 },
  { depth:2, icon:"💐", label:"인연",       firstMeet:"눈이 마주치는 순간, 심장이 이상하게 뛴다.",                    bond:25 },
  { depth:3, icon:"💕", label:"깊은 인연",  firstMeet:"\"어디선가 당신을 본 것 같아요\"라고 말을 건넨다.",             bond:40 },
  { depth:4, icon:"💞", label:"운명",       firstMeet:"이 사람과 함께라면 무엇이든 할 수 있다는 확신이 든다.",         bond:55 },
  { depth:5, icon:"💖", label:"영원한 인연", firstMeet:"서로가 서로를 알아본다. 말 없이도 모든 게 전달된다.",          bond:70 },
];

export const MERCHANT_HINTS = [
  { id:"trap_location",   icon:"⚠️", label:"함정 위치 힌트",     cost:"기억 파편 1개",   desc:"이번 시나리오 주요 함정 위치를 알려준다." },
  { id:"boss_weakness",   icon:"⚔️", label:"보스 약점 힌트",     cost:"기억 파편 2개",   desc:"현재 최종 보스의 핵심 약점을 알려준다." },
  { id:"npc_secret",      icon:"🗝️", label:"NPC 비밀",          cost:"기억 파편 1개",   desc:"주요 NPC의 숨겨진 정체나 동기를 알려준다." },
  { id:"hidden_path",     icon:"🗺️", label:"숨겨진 길",          cost:"기억 파편 1개",   desc:"일반 탐색으로는 찾기 어려운 지름길을 알려준다." },
  { id:"item_location",   icon:"💎", label:"희귀 아이템 위치",   cost:"기억 파편 2개",   desc:"이번 회차 숨겨진 레어 아이템 위치를 알려준다." },
  { id:"fate_preview",    icon:"🔮", label:"운명의 미리보기",    cost:"기억 파편 3개",   desc:"이번 회차 중요 분기점 중 하나를 미리 알려준다." },
  { id:"ending_hint",     icon:"🌟", label:"엔딩 힌트",          cost:"기억 파편 4개",   desc:"히든 엔딩 조건 중 하나를 알려준다." },
];

export const TIME_TOKEN_CONDITIONS = [
  { id:"perfect_escape",  label:"기적의 탈출",      desc:"절체절명의 순간을 극적으로 돌파 시" },
  { id:"tragic_sacrifice", label:"비극적 희생",     desc:"소중한 NPC를 잃는 비극적 순간에" },
  { id:"legendary_act",   label:"전설적 행동",      desc:"세계사에 남을 위업을 달성 시" },
  { id:"cycle_milestone", label:"회차 마일스톤",    desc:"특정 회차(5, 10, 20...) 도달 시 자동 지급" },
];

export const COMPANION_MEMORY_STAGES = [
  { stage:0, label:"낯익은 이방인",   firstMeet:"처음 보는 사람인데, 어딘가 낯이 익다.",                           bond:10 },
  { stage:1, label:"기억의 조각",     firstMeet:"당신을 보자 손을 떠는 낯선 이. \"혹시... 아닌가요?\"",             bond:20 },
  { stage:2, label:"희미한 각성",     firstMeet:"\"당신을 어딘가서 본 것 같아요. 꿈에서?\" 눈빛이 흔들린다.",       bond:35 },
  { stage:3, label:"강한 각성",       firstMeet:"\"...기억나요. 당신이잖아요. 다시 만났네요.\" 눈물이 고인다.",      bond:55 },
  { stage:4, label:"완전한 기억 각성", firstMeet:"\"몇 번의 생을 건너도 결국 다시 만나는군요.\" 환하게 웃는다.",    bond:75 },
];

export const LANGUAGE_DEFS = [
  { id:"elvish",    icon:"🌿", name:"엘프어",     race:"엘프",       minBond:30, bonus:"엘프 NPC와 깊은 대화, 숲·자연 관련 히든 정보" },
  { id:"dwarvish",  icon:"⚒️", name:"드워프어",   race:"드워프",     minBond:30, bonus:"드워프 장인과 특수 제작, 지하 지도 열람" },
  { id:"draconic",  icon:"🐉", name:"용어",       race:"드래곤혈",   minBond:40, bonus:"용족 NPC 교섭, 고대 마법 주문 발동" },
  { id:"celestial", icon:"✨", name:"천상어",     race:"신족",       minBond:50, bonus:"신의 전령과 대화, 성소 히든 의식 참여" },
  { id:"infernal",  icon:"🔥", name:"심연어",     race:"악마족",     minBond:40, bonus:"악마 계약 직접 협상, 금지 지식 열람" },
  { id:"ancient",   icon:"📜", name:"고대어",     race:"없음",       minBond:60, bonus:"고대 유적 비문 독해, 신급 마법 주문 해독" },
  { id:"beast",     icon:"🐾", name:"야수어",     race:"수인족",     minBond:25, bonus:"야생 동물 대화, 비공개 사냥터 안내" },
  { id:"void",      icon:"🌌", name:"공허어",     race:"공허존재",   minBond:70, bonus:"공허 차원 NPC 대화, 차원 균열 제어" },
];

export const LEGEND_DISTORTION_LEVELS = [
  { level:0, label:"사실에 가까운 소문",   multiplier:1.0, desc:"비교적 정확한 이야기가 퍼진다." },
  { level:1, label:"약간 과장된 소문",     multiplier:1.3, desc:"공적이 조금 부풀려졌다." },
  { level:2, label:"꽤 과장된 전설",       multiplier:1.8, desc:"영웅적 행동이 신화처럼 묘사된다." },
  { level:3, label:"심하게 왜곡된 전설",   multiplier:2.5, desc:"실제와 다른 내용이 절반 이상을 차지한다." },
  { level:4, label:"완전히 신화화",        multiplier:4.0, desc:"당신은 이미 인간을 초월한 존재로 알려져 있다." },
];

export const MYSTERY_PIECES = [
  { id:"origin",       icon:"🌌", title:"세계의 기원",       hint:"이 세계는 어디서 왔는가?",                    revealAt:1 },
  { id:"first_death",  icon:"💀", title:"최초의 죽음",       hint:"누가 처음으로 이 순환을 시작했는가?",          revealAt:2 },
  { id:"hidden_god",   icon:"👁️", title:"숨겨진 신",         hint:"진짜 세계를 지배하는 존재는 따로 있다.",       revealAt:3 },
  { id:"true_enemy",   icon:"🔴", title:"진짜 적",           hint:"모든 보스 뒤에 있는 진정한 원인.",             revealAt:4 },
  { id:"loop_reason",  icon:"🔄", title:"환생의 이유",       hint:"왜 이 영혼은 계속 환생하는가?",                revealAt:5 },
  { id:"key_npc",      icon:"🗝️", title:"열쇠를 가진 자",   hint:"진실에 가장 가까이 있는 NPC의 정체.",          revealAt:6 },
  { id:"forbidden",    icon:"🚫", title:"금지된 지식",       hint:"알면 안 되는 것. 하지만 반드시 알아야 한다.",  revealAt:7 },
  { id:"world_curse",  icon:"💜", title:"세계의 저주",       hint:"이 세계 전체에 걸린 고대의 저주.",             revealAt:8 },
  { id:"true_power",   icon:"⚡", title:"진정한 힘의 원천",  hint:"모든 힘은 어디서 오는가?",                    revealAt:9 },
  { id:"sacrifice",    icon:"🌹", title:"최초의 희생",       hint:"이 모든 것의 대가로 무엇이 사라졌는가?",       revealAt:10 },
  { id:"salvation",    icon:"🌟", title:"구원의 조건",       hint:"이 모든 순환을 끝낼 수 있는 단 하나의 방법.", revealAt:11 },
  { id:"truth",        icon:"🌈", title:"궁극의 진실",       hint:"모든 것의 답. 세계의 완전한 진실.",           revealAt:12 },
];

export const WATCHER_STAGES = [
  { stage:0, desc:"아직 아무것도 느끼지 못한다.",                       hint:null },
  { stage:1, desc:"때때로 누군가의 시선이 느껴진다.",                   hint:"고요한 순간, 등 뒤가 서늘해진다." },
  { stage:2, desc:"분명히 무언가가 나를 관찰하고 있다.",                 hint:"꿈 속에서 수많은 눈동자가 나를 바라본다." },
  { stage:3, desc:"그것이 나의 모든 회차를 지켜봐 왔다는 걸 안다.",     hint:"거울에 비친 내 눈이 잠깐 다른 색으로 빛난다." },
  { stage:4, desc:"그것의 정체를 거의 알 것 같다. 곧 만날 수 있다.",   hint:"세계의 끝 어딘가에서 목소리가 들린다. '이제 때가 되었다.'" },
  { stage:5, desc:"감시자의 정체가 밝혀졌다. 메타 스토리가 시작된다.",  hint:"모든 것이 연결된다." },
];

export const FATE_CARD_POOL = [
  { id:"tower",      icon:"🗼", name:"탑",         theme:"붕괴와 재건",   effect:"이번 회차 모든 것이 무너지고 다시 세워진다. 위기가 많지만 보상도 크다.",   bonus:"위기 극복 시 스탯 +5", penalty:"초반 역경 증가" },
  { id:"star",       icon:"⭐", name:"별",          theme:"희망과 인도",   effect:"어두운 순간마다 길을 비추는 빛이 나타난다. 힌트와 조력자가 풍부하다.",   bonus:"NPC 호감 +20% 전체", penalty:"도전 보상 소폭 감소" },
  { id:"moon",       icon:"🌙", name:"달",          theme:"환상과 직관",   effect:"꿈과 현실이 뒤섞인다. 직관이 강해지지만 현실 인식이 흐려진다.",         bonus:"예지 판정 +20", penalty:"현실 판정 -10" },
  { id:"sun",        icon:"☀️", name:"태양",        theme:"승리와 영광",   effect:"이번 회차 영웅적 결말에 가까워진다. 모든 행동이 빛난다.",               bonus:"모든 판정 +5", penalty:"은신·위장 불리" },
  { id:"death",      icon:"💀", name:"죽음",        theme:"변화와 종말",   effect:"이번 회차 큰 변화와 상실이 찾아온다. 하지만 끝은 새 시작이다.",         bonus:"최종 보상 2배", penalty:"동료 희생 가능성 증가" },
  { id:"wheel",      icon:"⚙️", name:"운명의 바퀴", theme:"순환과 전환",   effect:"운명이 빠르게 돌아간다. 상황이 극적으로 뒤바뀌는 순간들이 찾아온다.",   bonus:"역전 판정 +15", penalty:"안정적 진행 불가" },
  { id:"hermit",     icon:"🕯️", name:"은둔자",      theme:"고독과 지혜",   effect:"혼자서 걷는 길. 동료보다 내면의 힘을 키우는 회차.",                     bonus:"단독 판정 +20", penalty:"동료 협력 보너스 감소" },
  { id:"emperor",    icon:"👑", name:"황제",        theme:"지배와 질서",   effect:"이번 회차 권력과 조직을 다루는 이야기가 중심이 된다.",                   bonus:"리더십 판정 +15", penalty:"개인 전투 불리" },
  { id:"lovers",     icon:"💕", name:"연인",        theme:"선택과 인연",   effect:"중요한 인연과의 만남이 핵심이 된다. 선택이 관계를 좌우한다.",           bonus:"로맨스 판정 +25", penalty:"전투 집중력 -5" },
  { id:"strength",   icon:"💪", name:"힘",          theme:"인내와 극복",   effect:"이번 회차 육체와 의지의 한계에 도전한다. 버틸수록 강해진다.",           bonus:"체력 판정 +15", penalty:"정신력 판정 -5" },
  { id:"magician",   icon:"🪄", name:"마법사",      theme:"의지와 창조",   effect:"이번 회차 창의적 해결책과 마법이 핵심이 된다.",                         bonus:"마법·기술 판정 +15", penalty:"정면 돌파 불리" },
  { id:"justice",    icon:"⚖️", name:"정의",        theme:"균형과 심판",   effect:"이번 회차 선악의 균형이 시험된다. 공정한 판단이 보상을 부른다.",        bonus:"도덕적 선택 시 판정 +10", penalty:"불의한 행동 페널티 증가" },
];

export const HIDEOUT_FACILITIES = [
  { id:"campfire",   icon:"🔥", name:"야영지",      unlockCycle:1,  bonus:"회차 시작 시 HP +20% 회복",              desc:"어디서나 쉴 수 있는 작은 불씨." },
  { id:"library",    icon:"📚", name:"도서관",      unlockCycle:2,  bonus:"지식 판정 +10, 전생 힌트 1개 추가",      desc:"전생의 기억이 책으로 쌓인다." },
  { id:"forge",      icon:"⚒️", name:"단련장",      unlockCycle:3,  bonus:"전투 판정 +8, 무기 내구도 +30%",         desc:"몸과 장비를 단련하는 공간." },
  { id:"alchemy",    icon:"⚗️", name:"연금술실",    unlockCycle:4,  bonus:"포션 효과 +20%, 레시피 1개 추가",        desc:"약초와 광석으로 기적을 만든다." },
  { id:"infirmary",  icon:"🏥", name:"치료소",      unlockCycle:5,  bonus:"부상 회복 속도 +50%, HP 최대치 +10",     desc:"상처를 치유하는 신성한 공간." },
  { id:"shrine",     icon:"⛩️", name:"신전",        unlockCycle:6,  bonus:"카르마 판정 +10, 신앙 NPC 호감 상승",   desc:"전생의 영혼을 기리는 성소." },
  { id:"shop",       icon:"🏪", name:"비밀 상점",   unlockCycle:7,  bonus:"아이템 구매가 -20%, 희귀 아이템 등장",   desc:"전생의 인연이 운영하는 상점." },
  { id:"watchtower", icon:"🗼", name:"망루",        unlockCycle:8,  bonus:"탐색 판정 +15, 기습 방어율 +30%",        desc:"세계를 내려다보는 높은 탑." },
  { id:"dungeon",    icon:"🏚️", name:"지하 감옥",   unlockCycle:10, bonus:"심문 판정 +20, 포로 정보 추출",          desc:"비밀을 캐내는 어두운 장소." },
  { id:"portal",     icon:"🌀", name:"차원문",      unlockCycle:12, bonus:"차원 균열 이벤트 발생률 +50%",           desc:"다른 세계로 통하는 균열." },
  { id:"throne",     icon:"👑", name:"왕좌",        unlockCycle:15, bonus:"리더십 판정 +20, NPC 충성도 +20",        desc:"전설이 앉는 권좌." },
  { id:"fortress",   icon:"🏰", name:"요새",        unlockCycle:20, bonus:"모든 판정 +5, 전생 본거지 완성",         desc:"회차를 거쳐 세워진 완전한 요새." },
];

export const EVIL_EYE_LEVELS = [
  { level:0, killsRequired:0,   label:"봉인됨",       ability:"없음",                                                desc:"아직 각성하지 않았다." },
  { level:1, killsRequired:10,  label:"미약한 악안",  ability:"상대 HP 대략 파악 (많음/보통/적음)",                  desc:"눈이 가끔 붉게 빛난다." },
  { level:2, killsRequired:25,  label:"성장하는 악안", ability:"상대 HP 퍼센트 파악, 주요 약점 1개 감지",            desc:"눈 흰자위에 핏줄이 선다." },
  { level:3, killsRequired:50,  label:"완성된 악안",  ability:"상대 HP 수치, 모든 약점, 다음 행동 패턴 예측",        desc:"한쪽 눈이 항상 붉다." },
  { level:4, killsRequired:100, label:"저주받은 악안", ability:"즉사 공격 조건 파악, 상대 운명까지 어렴풋이 감지",   desc:"두 눈 모두 깊은 붉은색. 보는 자들이 두려워한다." },
];

export const MOON_PHASES = [
  { id:"new",         icon:"🌑", name:"초승달 (삭)",  effect:"어둠 속 행동 +10, 은신·잠입 보너스",                specialEvent:"그림자 정령 출몰 확률 상승" },
  { id:"crescent",    icon:"🌒", name:"초생달",       effect:"새 시작 판정 +5, 첫 만남 NPC 반응 호의적",          specialEvent:"방랑자와의 특별 만남" },
  { id:"quarter1",    icon:"🌓", name:"상현달",       effect:"성장 판정 +8, 학습·훈련 효과 +20%",                 specialEvent:"스승 NPC 등장 확률 상승" },
  { id:"gibbous1",    icon:"🌔", name:"상현망간달",   effect:"전투력 성장 +10, 강해지는 느낌",                    specialEvent:"강적과의 조우 증가" },
  { id:"full",        icon:"🌕", name:"보름달",       effect:"모든 능력치 최고조, 하지만 야생의 기운 충만",       specialEvent:"늑대인간·야수 이벤트 확률 대폭 상승" },
  { id:"gibbous2",    icon:"🌖", name:"하현망간달",   effect:"직관 +10, 숨겨진 것들이 보인다",                    specialEvent:"비밀·음모 관련 이벤트 증가" },
  { id:"quarter2",    icon:"🌗", name:"하현달",       effect:"지혜 판정 +8, 과거 기억 접근성 향상",               specialEvent:"전생 기억 이벤트 발생률 상승" },
  { id:"crescent2",   icon:"🌘", name:"그믐달",       effect:"마지막 기회 판정 +15, 역전 가능성 증가",            specialEvent:"최후의 일전 이벤트 강화" },
];
