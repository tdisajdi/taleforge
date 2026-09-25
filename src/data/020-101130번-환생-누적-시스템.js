// 101~130번 환생 누적 시스템 — data
// Pure data split out of progression/020-101130번-환생-누적-시스템.js (see generate.js).

export const TREE_BRANCH_TYPES = [
  { id:"courage",    icon:"🌿", label:"용기의 가지",     bloomAt:3,  event:"역경을 극복하는 희귀 이벤트 예고" },
  { id:"wisdom",     icon:"🍃", label:"지혜의 가지",     bloomAt:5,  event:"고대 지식 획득 이벤트 예고" },
  { id:"bond",       icon:"🌱", label:"인연의 가지",     bloomAt:4,  event:"운명적 재회 이벤트 예고" },
  { id:"sacrifice",  icon:"🌾", label:"희생의 가지",     bloomAt:2,  event:"영웅적 희생 이벤트 예고" },
  { id:"darkness",   icon:"🖤", label:"어둠의 가지",     bloomAt:4,  event:"금기 해금 이벤트 예고" },
  { id:"hope",       icon:"🌸", label:"희망의 가지",     bloomAt:6,  event:"진 엔딩 루트 예고" },
  { id:"power",      icon:"⚡", label:"힘의 가지",       bloomAt:5,  event:"각성 이벤트 예고" },
  { id:"mystery",    icon:"🔮", label:"신비의 가지",     bloomAt:7,  event:"세계의 비밀 공개 이벤트 예고" },
];

export const DEIFICATION_CONDITIONS = [
  { id:"karma_pure",    label:"순수한 업보",    desc:"카르마 점수 20 이하 엔딩 5회 이상" },
  { id:"rank_divine",   label:"신급 윤회자",    desc:"윤회 등급 신급 이상 달성" },
  { id:"all_endings",   label:"모든 엔딩 경험", desc:"일반·영웅·비극·히든 엔딩 모두 경험" },
  { id:"century_cycle", label:"백 번의 생",     desc:"100회차 이상 도달" },
  { id:"world_saved",   label:"세계 구원",      desc:"종말 카운터 봉인 3회 이상" },
];

export const DEIFICATION_STAGES = [
  { stage:0, icon:"👤", label:"인간",        power:null },
  { stage:1, icon:"⭐", label:"반신",        power:"인간 NPC에게 꿈에서 계시 전달 가능" },
  { stage:2, icon:"🌟", label:"하위신",      power:"소규모 이벤트에 직접 개입 가능" },
  { stage:3, icon:"✨", label:"상위신",      power:"회차 내 운명 분기점 1회 변경 가능" },
  { stage:4, icon:"🌈", label:"주신",        power:"어느 회차에도 현현하여 결정적 개입 가능" },
];

export const AWARENESS_LEVELS = [
  { level:0, label:"무자각",        tone:"일반 서사",          desc:"아직 순환을 인식하지 못한다." },
  { level:1, label:"어렴풋한 의심", tone:"불안한 서사",        desc:"\"왜 이게 익숙하지?\" 수준의 의심." },
  { level:2, label:"부분 자각",     tone:"메타적 서사",        desc:"\"내가... 전에 이걸 겪었다\"를 확신한다." },
  { level:3, label:"완전 자각",     tone:"4th wall 서사",      desc:"순환 자체를 완전히 인식. 나레이터에게 말을 건다." },
  { level:4, label:"초월 자각",     tone:"메타 파괴 서사",     desc:"게임과 현실의 경계를 인식. 최종 진실에 접근한다." },
];

export const RED_THREAD_FATES = [
  { strength:1, desc:"희미한 인연",    meeting:"어딘가 본 것 같은 낯선 이와 스친다.",                                  bond:20 },
  { strength:2, desc:"강한 인연",      meeting:"운명처럼 같은 장소에서 만나게 된다.",                                   bond:40 },
  { strength:3, desc:"불가분의 인연",  meeting:"어떤 상황에서도 같은 편에 서게 된다.",                                  bond:60 },
  { strength:4, desc:"붉은 실의 완성", meeting:"이 사람 없이는 진 엔딩이 열리지 않는다. 반드시 찾아야 한다.",          bond:80 },
];

export const RUIN_TYPES = [
  { id:"guild",    icon:"🏛️", name:"길드 폐허",    restoreQuest:"흩어진 길드원을 모아 재건한다.",    reward:"길드 멤버 자동 합류" },
  { id:"castle",   icon:"🏰", name:"성 폐허",      restoreQuest:"성벽을 수리하고 영주권을 주장한다.", reward:"근거지로 사용 가능" },
  { id:"temple",   icon:"⛩️", name:"신전 폐허",    restoreQuest:"신전을 정화하고 신앙을 되살린다.",   reward:"신앙 수치 대폭 상승" },
  { id:"village",  icon:"🏘️", name:"마을 폐허",    restoreQuest:"주민들을 돌아오게 하여 마을을 재건.", reward:"식량·자원 공급처 확보" },
  { id:"library",  icon:"📚", name:"도서관 폐허",  restoreQuest:"흩어진 서적을 모아 도서관을 복원.",   reward:"지식 판정 +20 영구" },
  { id:"port",     icon:"⚓", name:"항구 폐허",    restoreQuest:"부두를 수리하고 상인들을 불러들임.",  reward:"무역 루트 개설" },
];

export const KILL_SENSE_LEVELS = [
  { level:0, deaths:0,  ability:"없음",                               detectChance:0 },
  { level:1, deaths:2,  ability:"뒤통수 공격 감지 (30%)",             detectChance:30 },
  { level:2, deaths:4,  ability:"암살 시도 사전 감지 (55%)",          detectChance:55 },
  { level:3, deaths:7,  ability:"살의 오라 감지 (75%)",               detectChance:75 },
  { level:4, deaths:10, ability:"완전한 살의 감지 — 기습 면역 (95%)", detectChance:95 },
];

export const GRUDGE_FLOWER_STATES = [
  { state:"blooming", icon:"🌹", label:"복수의 꽃",   desc:"꽃이 활짝 피었다. 복수의 의지가 불타오른다.",      effect:"대상과의 전투 판정 +20" },
  { state:"withering",icon:"🥀", label:"시들어가는 꽃", desc:"너무 오래 두었다. 꽃이 시들기 시작한다.",         effect:"판정 보너스 감소 중" },
  { state:"cursed",   icon:"💀", label:"저주의 꽃",   desc:"꽃이 썩어 저주로 변했다. 자신에게 해가 된다.",     effect:"모든 판정 -5 페널티" },
  { state:"avenged",  icon:"🌸", label:"성취된 복수", desc:"복수를 이뤘다. 꽃이 아름답게 산화한다.",           effect:"복수 완수 보너스 획득" },
];

export const CAROUSEL_ROLES = [
  { role:"merchant",  icon:"💰", label:"신비한 상인",   firstMeet:"\"어서오세요. 당신이 찾는 게 뭔지는 이미 알고 있죠.\"" },
  { role:"guardian",  icon:"🛡️", label:"정체불명의 수호자", firstMeet:"위기의 순간, 그가 나타나 당신을 구한다." },
  { role:"villain",   icon:"😈", label:"이번 회차의 악당", firstMeet:"그가 이번엔 당신의 적으로 서 있다." },
  { role:"mentor",    icon:"🧙", label:"스승",           firstMeet:"\"내가 가르쳐줄 수 있는 건 딱 하나야.\"" },
  { role:"trickster", icon:"🃏", label:"트릭스터",       firstMeet:"\"이번엔 어떤 역할을 맡았는지 궁금하지 않아?\"" },
  { role:"sacrifice",  icon:"🕯️", label:"희생자",        firstMeet:"그는 이번 회차에서 당신을 위해 죽을 운명이다." },
  { role:"wanderer",  icon:"🌍", label:"떠돌이",          firstMeet:"\"세계가 몇 번이나 바뀌어도 여전히 길 위에 있군.\"" },
];

export const TRAP_PATTERNS = [
  { id:"always_attack",  label:"항상 정면 돌파",  trap:"이번 회차 정면 루트에 강력한 복병 배치" },
  { id:"always_stealth", label:"항상 은신 우선",  trap:"은신 탐지 NPC가 요소요소 배치됨" },
  { id:"always_trust",   label:"항상 NPC 신뢰",  trap:"가장 믿음직스러운 NPC가 배신자" },
  { id:"always_solo",    label:"항상 단독 행동",  trap:"혼자선 절대 못 넘는 장애물 추가" },
  { id:"always_flee",    label:"항상 도망 선택",  trap:"도주 루트가 모두 막혀있음" },
  { id:"always_rich",    label:"항상 돈 우선",    trap:"돈 관련 함정·사기꾼 집중 등장" },
];

export const ELEMENTAL_TYPES = {
  fire:  { name:'불꽃',  icon:'🔥', color:'#ff6030', bg:'#200800', border:'#8a2000',
           boost:{str:22,fear:14,crit:12,mgc:8}, weak:{end:-8,neg:-5},
           weakEnv:'물 속성 환경·폭우',
           affinity:'분노·격정·파괴 행동',
           tabooTrigger:'무고한 생명을 소각',
           aiHint:'불꽃 원소인 — 감정이 격해지면 피부 아래 불꽃이 일렁이고 주변 온도가 오른다. 분노·흥분 시 의도치 않게 화염이 튀어나온다.' },
  water: { name:'물결',  icon:'💧', color:'#30a0ff', bg:'#001530', border:'#003a80',
           boost:{mgc:22,neg:14,per:10,fath:6}, weak:{str:-8,fear:-5},
           weakEnv:'건조·사막 환경',
           affinity:'치유·협상·유연한 행동',
           tabooTrigger:'홍수로 무고한 생명 파괴',
           aiHint:'물결 원소인 — 슬픔·공감 시 피부 아래 물결이 흐르고 눈이 짙은 파란빛을 띤다. 주변 수분이 감정에 반응한다.' },
  wind:  { name:'바람',  icon:'🌬️', color:'#80e050', bg:'#081500', border:'#204000',
           boost:{agi:24,per:14,int:10,luk:6}, weak:{end:-8,str:-4},
           weakEnv:'밀폐 공간·무풍지대',
           affinity:'자유로운 이동·정보 수집·회피',
           tabooTrigger:'폭풍으로 마을 파괴',
           aiHint:'바람 원소인 — 기쁨·해방감 시 머리카락과 옷이 나부끼고 주변 공기가 소용돌이친다. 빠른 행동 시 바람 잔상이 남는다.' },
  earth: { name:'대지',  icon:'🪨', color:'#c09040', bg:'#100a00', border:'#503010',
           boost:{end:24,hp:15,wil:12,str:6}, weak:{agi:-10,per:-4},
           weakEnv:'공중전·부유 환경',
           affinity:'수호·방어·인내 행동',
           tabooTrigger:'대지 균열로 생명 위협',
           aiHint:'대지 원소인 — 결의·분노 시 발밑에 균열이 생기고 피부에 돌 같은 질감이 드러난다. 방어·수호 행동 시 바닥이 진동한다.' }
};

export const ELEMENTAL_ACT_GAIN = {
  harmony:    { label:'원소 조화 행동',  icon:'🌿', gain:25, desc:'원소를 창조·치유·수호 목적으로 사용' },
  affinity:   { label:'자연과 교감',     icon:'🍃', gain:15, desc:'자연 환경에 머무르거나 원소 정령과 대화' },
  sacrifice:  { label:'원소를 위한 희생',icon:'💫', gain:40, desc:'원소를 위해 자신을 희생하거나 큰 결단' },
  resonance:  { label:'원소인과 유대',   icon:'🤝', gain:20, desc:'같은 원소를 가진 존재와 깊은 유대 형성' },
  meditation: { label:'원소 명상',       icon:'🧘', gain:10, desc:'원소를 느끼며 명상, 억제도 회복' },
};

export const ELEMENTAL_TABOO_ACTS = {
  pure_destroy: { label:'순수 파괴',    icon:'💀', damage:30, desc:'원소를 파괴에만 사용. 창조적 의도 없음.' },
  betray_elem:  { label:'원소 배신',    icon:'⛔', damage:50, desc:'자신의 원소 속성을 부정하거나 반하는 행동.' },
  harm_nature:  { label:'자연 훼손',    icon:'🔥', damage:20, desc:'무고한 자연과 생명을 원소로 훼손.' },
  lose_control: { label:'감정 폭주',    icon:'💢', damage:15, desc:'억제도 0 도달로 원소 폭발 발생.' },
};

export const ELEMENTAL_RESTORE_METHODS = [
  { id:'restore_nature',   name:'자연 귀의',      icon:'🌿', cost:{}, restore:40,
    desc:'자연 속에서 명상하며 원소와 재연결한다. 공명도 +40, 억제도 +20.',
    req:'자연 지역(숲, 강, 산)' },
  { id:'restore_temple',   name:'원소 신전 의식',  icon:'⛩️', cost:{gold:150}, restore:80,
    desc:'원소 신전에서 정화 의식을 거행한다. 공명도 +80, 금기 -2.',
    req:'원소 신전 방문 + 150G' },
  { id:'restore_pact',     name:'원소 재계약',     icon:'📜', cost:{hp:25}, restore:120,
    desc:'자신의 피로 원소와 재계약한다. 공명도 +120. HP -25.',
    req:'HP 35 이상' },
];

export const DRAGON_ANCESTOR_TYPES = {
  flame:    { name:'화염의 고룡', icon:'🔥', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/></svg>', color:'#ff4010', desc:'파괴와 정화의 불꽃. 세상을 태우고 새로 시작한다.', hint:'적의 방어구가 녹아내리는 화염 속성 묘사, 분노 시 눈에 불꽃이 일렁이는 묘사 포함', statBoost:{str:20, mgc:18, fear:12}, skills:['용염(龍炎)', '화룡 포효'], fragments:['낡은 비늘 조각', '용의 화석', '고대 화염 서판'] },
  storm:    { name:'폭풍의 고룡', icon:'⚡', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 L6 13 L11 13 L10 22 L18 10 L13 10 Z" stroke-linejoin="round"/></svg>', color:'#60a0ff', desc:'하늘을 지배하는 번개와 바람의 제왕.', hint:'이동 시 번개 잔상, 목소리가 멀리 울리는 공명 묘사 포함', statBoost:{agi:20, str:14, per:14}, skills:['천뢰(天雷)', '폭풍 강하'], fragments:['번개에 탄 깃털', '폭풍 핵', '천상 지도'] },
  abyss:    { name:'심연의 고룡', icon:'🌑', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.6" stroke="none"/></svg>', color:'#8040c0', desc:'깊은 바닥에서 올라온 공허. 두려움 자체가 힘.', hint:'그림자가 비정상적으로 길게 뻗어나가는 묘사, 어둠 속에서 눈만 빛나는 묘사 포함', statBoost:{fear:22, mgc:18, mad:12}, skills:['심연 응시', '공포 포효'], fragments:['균열의 파편', '심연 수정', '어둠의 비늘'] },
  time:     { name:'시간의 고룡', icon:'⏳', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3 L18 3 L18 7 L13 12 L18 17 L18 21 L6 21 L6 17 L11 12 L6 7 Z" stroke-linejoin="round"/></svg>', color:'#c0d040', desc:'과거와 미래를 동시에 보는 예지의 존재.', hint:'대화 중 미래를 잠깐 예지하는 묘사, 적의 다음 행동을 직감하는 묘사 포함', statBoost:{per:20, wil:16, int:14}, skills:['시간 감지', '예지의 눈'], fragments:['왜곡된 모래시계', '시간 결정', '선조의 눈동자'] },
  guardian: { name:'수호의 고룡', icon:'🛡️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L19 6 L19 12 C19 17 15.5 20 12 21.5 C8.5 20 5 17 5 12 L5 6 Z" stroke-linejoin="round"/></svg>', color:'#40d080', desc:'세계의 균형을 지키는 가장 오래된 의지.', hint:'아군 보호 시 비늘이 빛나는 묘사, 부상 시 자동으로 방어 자세를 취하는 묘사 포함', statBoost:{end:20, wil:16, fath:12}, skills:['불멸의 비늘', '용의 수호'], fragments:['수호 인장', '고대 서약서', '세계 지도'] },
};

export const DRAGON_FRAGMENT_TRIGGERS = [
  { id:'fight_rage',    label:'분노 중 전투',       icon:'⚔️', types:['flame','abyss'],    desc:'감정이 격해진 상태에서 싸울 때 기억 파편이 떨림.' },
  { id:'sky_gaze',      label:'하늘 응시',          icon:'🌤️', types:['storm','time'],     desc:'높은 곳이나 하늘을 오래 바라볼 때 무언가 울림.' },
  { id:'protect_weak',  label:'약자 보호',          icon:'🛡️', types:['guardian','time'],  desc:'약자를 지켜낼 때 오래된 본능이 깨어남.' },
  { id:'treasure_find', label:'보물 발견',          icon:'💎', types:['flame','guardian'], desc:'귀중한 물건을 발견할 때 선조의 냄새가 느껴짐.' },
  { id:'ancient_ruin',  label:'고대 유적 탐사',     icon:'🏛️', types:['time','abyss'],     desc:'오래된 문명 흔적에서 선조의 기억이 공명함.' },
  { id:'elder_dragon',  label:'고룡 조우',          icon:'🐉', types:['flame','storm','abyss','time','guardian'], desc:'살아있는 고룡을 만났을 때 혈통이 격하게 반응함.' },
  { id:'dark_place',    label:'어둠 속 고립',       icon:'🌑', types:['abyss','time'],     desc:'완전한 어둠 속에서 과거의 기억 파편이 스침.' },
  { id:'storm_field',   label:'폭풍 한가운데',      icon:'⛈️', types:['storm','flame'],    desc:'거센 폭풍 속에서 선조의 포효가 들려오는 듯함.' },
];

export const DRAGON_BALANCE_PHASES = [
  { phase:'destruction', name:'파괴의 용', icon:'🔴', range:[0,200],   color:'#e03010',
    desc:'불꽃은 방향 없이 세상을 태운다. 약육강식이 진리.',
    statBonus:{ str:25, fear:22, mgc:18, crit:15 }, statPenalty:{ trst:-15, cha:-8, fath:-12 },
    skills:[
      { id:'db_destruct_aura',  name:'파멸의 기운',   icon:'💥', type:'passive', rarity:'epic',
        desc:'주변 적이 매 턴 STR -5, FEAR -8. 강한 존재들이 본능적으로 경계한다.',
        mpCost:0, condition:'always', conditionDesc:'항시 발동', statBoost:{str:200,fear:160} },
      { id:'db_destruct_roar',  name:'파멸의 포효',   icon:'🌋', type:'active', rarity:'legendary',
        desc:'MP 40. 세계를 불태울 포효. 범위 내 모든 적 STR·WIL -20, 공포 상태 부여.',
        mpCost:40, statBoost:{},
        effects:{ kind:'damage', statSource:{str:0.6,fear:0.4}, damageMult:0.95, element:'dark' } },
    ],
    aiHint:'파괴 방향 드래곤혈: 움직임에서 야생의 파괴력이 느껴진다. 주변의 잡풀이 타들어가고, 약한 자들이 본능적으로 피한다. 고룡들이 "저 방향을 선택한 자"로 경외한다.'
  },
  { phase:'chaos', name:'혼돈의 용', icon:'🟠', range:[201,400],  color:'#d06010',
    desc:'아직 방향을 찾아가는 중. 불안정하지만 강렬하다.',
    statBonus:{ str:12, mgc:10, fear:10 }, statPenalty:{ trst:-6, cal:-5 },
    skills:[], aiHint:'혼돈 상태 드래곤혈: 행동이 다소 예측불가하고 충동적으로 묘사된다.'
  },
  { phase:'adrift', name:'방향 없는 용', icon:'⬜', range:[401,600], color:'#808080',
    desc:'방향을 선택하지 못한 자. 가장 약하고 외로운 상태.',
    statBonus:{}, statPenalty:{ str:-5, mgc:-5, fear:-5, trst:-8 },
    skills:[], aiHint:'방향 미결정 드래곤혈: NPC들이 "이 자는 무엇을 원하는가"라며 불신한다. 능력이 제대로 발휘되지 않는다.'
  },
  { phase:'harmony', name:'조화의 용', icon:'🟢', range:[601,800], color:'#20a060',
    desc:'수호와 파괴 사이에서 균형을 찾아가는 중.',
    statBonus:{ end:10, wil:10, fath:8 }, statPenalty:{ fear:-4 },
    skills:[], aiHint:'조화 드래곤혈: 행동이 신중하고 목적의식이 있다.'
  },
  { phase:'guardian', name:'수호의 용', icon:'🔵', range:[801,1000], color:'#2060e0',
    desc:'세계를 지키는 자. 동료와 약자에게 절대적 신뢰를 준다.',
    statBonus:{ end:25, wil:22, fath:18, heal:10 }, statPenalty:{ str:-8, fear:-15 },
    skills:[
      { id:'db_guard_aura', name:'수호의 기운', icon:'🛡️', type:'passive', rarity:'epic',
        desc:'아군 전체 피해 20% 감소. 치유 스킬 효과 +30%. 신성 존재들이 신뢰한다.',
        mpCost:0, condition:'always', conditionDesc:'항시 발동', statBoost:{end:200,fath:160} },
      { id:'db_guard_roar', name:'수호의 포효', icon:'💙', type:'active', rarity:'legendary',
        desc:'MP 40. 아군 전체 HP +25 회복, STR·WIL +15. 적의 공격 의지 꺾기.',
        mpCost:40, statBoost:{}, hpRestore:25,
        effects:{ kind:'buff', statMod:{str:15,wil:15}, duration:3 } },
    ],
    aiHint:'수호 방향 드래곤혈: 움직임에서 안정감과 위압감이 동시에 느껴진다. 동료들이 본능적으로 뒤에 서고, 인간·엘프가 신뢰를 보낸다.'
  },
];

export const DRAGON_HOARD_TYPES = {
  war:       { name:'전쟁의 용', icon:'⚔️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></svg>', color:'#e04020', label:'무기 수집가', desc:'강한 무기만이 존재의 증명이다.', statBoost:{str:15,crit:12,fear:10} },
  knowledge: { name:'지식의 용', icon:'📚', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L4 19 L11 19 L11 4 Z" stroke-linejoin="round"/><path d="M13 4 L13 19 L20 19 L20 4 Z" stroke-linejoin="round"/></svg>', color:'#6060d0', label:'지식 수집가', desc:'세계의 비밀을 모두 품은 자가 진정한 강자다.', statBoost:{mgc:15,int:12,per:10} },
  gold:      { name:'황금의 용', icon:'💰', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" stroke-width="1.4"/><path d="M12 7.5 L12 16.5 M9.5 9.3 C9.5 8.2 10.5 7.5 12 7.5 C13.5 7.5 14.5 8.3 14.5 9.4 C14.5 10.6 13.5 11 12 11.3 C10.5 11.6 9.5 12.2 9.5 13.4 C9.5 14.5 10.5 15.3 12 15.3 C13.5 15.3 14.5 14.6 14.5 13.5" stroke-width="1.2"/></svg>', color:'#d0a020', label:'황금 수집가', desc:'황금이 곧 권력이다. 탐욕이 힘이 된다.', statBoost:{neg:15,cha:12,luk:10} },
  bond:      { name:'수호의 용', icon:'❤️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20 C12 20 3 14 3 8.2 C3 5.3 5.3 3 8.2 3 C10 3 11.3 3.9 12 5.2 C12.7 3.9 14 3 15.8 3 C18.7 3 21 5.3 21 8.2 C21 14 12 20 12 20 Z" stroke-linejoin="round"/></svg>', color:'#d04080', label:'인연 수집가', desc:'사람이 가장 귀한 보물이다.', statBoost:{fath:15,trst:12,wil:10} },
};

export const DRAGON_HOARD_OBSESSION_EVENTS = [
  { threshold:30, desc:'귀중한 물건을 볼 때 이유 없이 손이 간다.' },
  { threshold:60, desc:'보물을 잃거나 넘겨줄 때 가슴이 타는 듯한 고통.' },
  { threshold:90, desc:'보물굴이 침탈당하면 즉각 폭주 상태. 드워프에게 자동 분노.' },
];

export const DRAGON_AWAKEN_COSTS = [
  { threshold:200, icon:'👥', title:'공포의 그림자', desc:'다음 마을 방문 시 NPC들이 공포에 질려 도망간다. 상점 이용 불가 1회.', aiHint:'각성도 200: NPC들이 이 인물의 압도적인 존재감에 압도당해 구석으로 피한다.' },
  { threshold:400, icon:'💔', title:'이탈의 공포',   desc:'동료 NPC 중 1명이 두려움에 거리를 두기 시작한다.', aiHint:'각성도 400: 동료 중 하나가 "나는 당신을 따르고 싶지만... 두렵다"고 털어놓는다.' },
  { threshold:600, icon:'⚡', title:'세계의 경고',   desc:'예상치 못한 재난(폭풍, 지진)이 캐릭터 주변에서 발생한다.', aiHint:'각성도 600: 세계 자체가 이 존재를 경고하듯 자연 재해가 인근에 발생한다.' },
  { threshold:800, icon:'🐉', title:'고룡의 소환',   desc:'살아있는 고룡이 나타나 "네 존재가 세계를 불안정하게 만든다"고 경고한다.', aiHint:'각성도 800: 하늘을 가르며 고룡이 강하. "너는 세계를 태울 것인가, 지킬 것인가"라고 묻는다.' },
  { threshold:1000,icon:'🌋', title:'완전 각성',     desc:'모든 대가를 치른 끝에 세계에서 고립된 채 가장 강한 존재가 된다.', aiHint:'각성도 1000: 완전 각성 상태. 신들조차 이 존재의 이름을 기록한다. 하지만 이제 주변에 남은 자는 없다.' },
];

export const DRAGON_AWAKEN_ACTS = {
  breath:   { label:'용의 숨결',    icon:'🔥', gain:30, desc:'강력한 화염 스킬 사용' },
  rampage:  { label:'폭주',         icon:'💢', gain:50, desc:'감정이 격해져 통제를 잃음' },
  draconic: { label:'용어 발화',    icon:'🐲', gain:20, desc:'고룡 언어로 말함' },
  fullpower:{ label:'전력 해방',    icon:'⚡', gain:40, desc:'진정한 드래곤 힘 해방' },
  suppress: { label:'냉정 유지',    icon:'🧊', gain:-15, desc:'분노를 억누르고 냉정함 유지 (각성도 감소)' },
};

// [F1 FIX] shiftDragonBalance(amount)는 gs.dragon_balance(AI 서사 감지)에서만
// 호출되고 로컬 수동 트리거가 전혀 없었다 — AI 프롬프트에도 이 필드가 얼마를
// 움직여야 하는지 정해진 값이 없어(자유 수치) 다른 축 시스템(CELESTIAL_LIGHT_
// GAIN/DARK_GAIN)처럼 그대로 재사용할 표는 없었다. 기존 각성 포인트 행동
// (DRAGON_AWAKEN_ACTS)의 gain 규모(20~50)에 맞춰 새로 정한 대칭 수치.
export const DRAGON_BALANCE_SHIFTS = {
  destroy: { label:'파괴적 행동', icon:'🔥', amount:-30, desc:'약자를 짓밟거나 세상을 파괴하는 선택을 했다' },
  guard:   { label:'수호적 행동', icon:'🛡️', amount:30,  desc:'약자를 지키고 세상을 보호하는 선택을 했다' },
};

export const DEMON_SIN_GAIN = {
  contract:    { label:"계약·협박",     icon:"📜", gain:8,  desc:"불리한 계약 강제, 협박, 공갈" },
  fear:        { label:"공포 조장",      icon:"😱", gain:6,  desc:"상대를 의도적으로 공포에 몰아넣음" },
  betrayal:    { label:"배신·기만",      icon:"🗡️", gain:10, desc:"신뢰를 배신하거나 의도적으로 속임" },
  slaughter:   { label:"학살·잔혹행위", icon:"🩸", gain:12, desc:"필요 이상의 폭력, 무고한 피해" },
  temptation:  { label:"유혹·타락 유도", icon:"🍎", gain:7,  desc:"타인을 어둠으로 유혹하여 타락시킴" },
};

export const DEMON_PURIFY_METHODS = [
  { id:"purify_light",   name:"신성한 빛의 정화", icon:"✨", cost:{gold:200}, reduce:30,
    desc:"성전이나 신성한 장소에서 신성한 빛으로 타락을 씻어낸다. 타락도 -30, WIL+5.",
    req:"신성한 장소(성전, 빛의 신전)" },
  { id:"purify_atonement", name:"속죄의 행동",   icon:"🙏", cost:{}, reduce:20,
    desc:"진심 어린 선행을 통해 타락의 일부를 씻는다. 타락도 -20. 단, 업보 -10.",
    req:"선한 행동 선택 시 자동 적용" },
  { id:"purify_ritual",  name:"마계 억제 의식",  icon:"⛩️", cost:{gold:500, material:"정화의 수정"}, reduce:50,
    desc:"특수 의식으로 마계의 힘을 억제한다. 타락도 -50, 단 3턴간 악마 스킬 봉인.",
    req:"정화의 수정 1개 필요" },
  { id:"purify_seal",    name:"자기 봉인",         icon:"🔯", cost:{hp:30}, reduce:40,
    desc:"자신의 악마 힘을 스스로 봉인한다. 타락도 -40, HP -30. 각성 상태 해제.",
    req:"언제든 사용 가능 (HP 30 이상)" },
];

export const DWARF_CRAFT_TYPES = {
  forge:   { label:"무기 단조",   icon:"⚔️", gain:10, desc:"무기 제작·강화·전투 중 즉석 보강" },
  guard:   { label:"방어구 수호", icon:"🛡️", gain:9,  desc:"방어구 제작·강화·아군 피해 분담" },
  repair:  { label:"장비 수리",   icon:"🔧", gain:7,  desc:"파손 아이템 복원·전투 응급 수리" },
  alch:    { label:"연금 정제",   icon:"⚗️", gain:8,  desc:"광석 정제·합금·특수 물약 내재화" },
  engrave: { label:"룬 각인",     icon:"✍️", gain:9,  desc:"룬으로 아이템에 마법 효과·저주 반사" }
};

export const CRAFT_POWER_SKILLS = [
  // ── 1단계 (각인도 50+)
  {
    id:"cps_dw_material_burst", name:"광맥 감지", icon:"🪨💥",
    reqStage:1, cost:15, rarity:"uncommon", type:"active", targetable:false,
    desc:"주변 지하 광맥과 숨겨진 금속 아이템 위치를 감지. 현재 지역 희귀 아이템 1개 힌트 획득.",
    aiHint:"광맥 감지 발동! 드워프가 땅에 귀를 기울이자 지하 광맥의 맥동이 느껴진다. 근처에 숨겨진 광물이나 아이템의 위치가 직감처럼 느껴진다. 그 위치와 대략적인 내용을 묘사하라."
  },
  {
    id:"cps_dw_hammer_slam", name:"단조 강타", icon:"🔨💥",
    reqStage:1, cost:20, rarity:"uncommon", type:"active", targetable:false,
    desc:"장인의 기술로 강화된 타격. 이번 물리 공격 판정 +25, 적 방어구에 파손 상태이상.",
    aiHint:"단조 강타 발동! 드워프의 무기가 장인의 힘으로 빛나며 내리꽂힌다. 일반 타격과 달리 적 갑옷의 가장 약한 접합부를 정확히 노려 파손 균열을 남긴다."
  },
  // ── 2단계 (각인도 120+)
  {
    id:"cps_dw_emergency_repair", name:"전장 응급 수리", icon:"🔧⚡",
    reqStage:2, cost:25, rarity:"rare", type:"active", targetable:true,
    desc:"전투 중 자신 또는 아군의 파손 장비를 즉시 복원. 복원된 장비 스탯 +15 일시 강화.",
    aiHint:"전장 응급 수리 발동! 드워프의 손이 번개처럼 움직여 파손된 장비를 현장에서 수리한다. 불꽃이 튀고 금속이 맞물리는 소리 후 장비가 단단해지며 빛난다."
  },
  {
    id:"cps_dw_iron_fortify", name:"철벽 강화", icon:"🛡️🔥",
    reqStage:2, cost:30, rarity:"rare", type:"active", targetable:false,
    desc:"자신의 방어구를 순간 강화. 이번 턴 받는 피해 60% 감소. END +20, 3턴 지속.",
    aiHint:"철벽 강화 발동! 드워프가 자신의 갑옷을 손으로 두드리자 금속이 달아오르며 더 단단해진다. 검은 균열들이 스스로 메워지며 강인한 방벽이 완성된다."
  },
  // ── 3단계 (각인도 220+)
  {
    id:"cps_dw_rune_curse_reflect", name:"저주 반사 룬", icon:"✍️🔄",
    reqStage:3, cost:40, rarity:"rare", type:"active", targetable:false,
    desc:"무기나 방어구에 저주 반사 룬을 즉석 각인. 다음 저주·마법 공격 완전 반사. 1회 발동.",
    aiHint:"저주 반사 룬 발동! 드워프가 번개같이 장비에 고대 룬을 새긴다. 룬이 차갑게 빛나며 다음에 날아오는 어둠의 힘이 그 발원지로 되돌아간다."
  },
  {
    id:"cps_dw_alloy_poison", name:"독금 합금 도포", icon:"⚗️☠️",
    reqStage:3, cost:35, rarity:"rare", type:"active", targetable:false,
    desc:"연금 기술로 무기에 독성 합금을 도포. 3턴간 공격마다 독 상태이상 50% 확률 부여.",
    aiHint:"독금 합금 도포 발동! 드워프가 작은 약병에서 불길한 빛을 내는 합금액을 꺼내 무기에 바른다. 금속이 암녹색으로 변하며 공기 중에 쓴 냄새가 퍼진다."
  },
  // ── 4단계 (각인도 350+)
  {
    id:"cps_dw_legend_reforge_active", name:"현장 전설 재단조", icon:"⚔️✨",
    reqStage:4, cost:60, rarity:"epic", type:"active", targetable:false,
    desc:"전투 중에도 발동 가능한 재단조. 장비한 무기 스탯 일시 2배, 5턴 지속.",
    aiHint:"현장 전설 재단조 발동! 전투 한복판에서 드워프가 무기를 꽉 쥐고 장인의 의지를 불어넣는다. 무기가 뜨겁게 달아오르며 금속의 결이 재정렬되어 훨씬 날카롭고 강해진다."
  },
  {
    id:"cps_dw_ancestor_guard", name:"선조의 방패", icon:"🪨🛡️",
    reqStage:4, cost:70, rarity:"epic", type:"active", targetable:true,
    desc:"선조의 혼을 아군 1명에게 빙의시킨다. 대상 END+40, 피해 40% 감소, 3턴 지속.",
    aiHint:"선조의 방패 발동! 드워프가 손을 대상에게 뻗자 드워프 선조의 유령이 대상 주위를 감싼다. 고대 갑옷의 형태가 반투명하게 겹쳐지며 대상이 강인해진다."
  },
  // ── 5단계 (각인도 520+)
  {
    id:"cps_dw_forge_storm", name:"단조 폭풍", icon:"🔥⚒️💥",
    reqStage:5, cost:80, rarity:"legendary", type:"active", targetable:false,
    desc:"축적된 단조 에너지를 전방 폭발로 방출. 범위 내 모든 적 방어구 파괴 + 큰 피해.",
    aiHint:"단조 폭풍 발동! 드워프의 몸에서 용광로의 열기가 폭발적으로 쏟아진다. 불꽃과 쇳가루의 폭풍이 전방을 휩쓸며 적의 갑옷을 녹이고 날려버린다."
  },
  {
    id:"cps_dw_mythic_weapon_grant", name:"신화 무기 하사", icon:"⚔️👑",
    reqStage:5, cost:100, rarity:"legendary", type:"active", targetable:true,
    desc:"즉석에서 신화 등급 임시 무기를 만들어 아군에게 하사. 5턴간 그 아군의 STR+50.",
    aiHint:"신화 무기 하사 발동! 드워프의 손이 허공에서 금속을 끌어모아 번개처럼 무기를 완성한다. 완성된 무기를 아군의 손에 쥐어주자 그 눈이 빛난다."
  },
  // ── 6단계 (각인도 750+)
  {
    id:"cps_dw_mountain_roar", name:"산의 포효", icon:"⛰️📣",
    reqStage:6, cost:120, rarity:"legendary", type:"active", targetable:false,
    desc:"드워프 왕의 포효. 아군 전체 모든 스탯 +30, 적 전체 공포 상태. 5턴 지속.",
    aiHint:"산의 포효 발동! 드워프가 선조들의 이름을 외치며 포효하자 땅이 울린다. 주변 아군들의 눈이 투지로 타오르고 적들은 자신도 모르게 한 발 물러선다."
  },
  // ── 7단계 (각인도 1000)
  {
    id:"cps_dw_world_forge", name:"세계 단조", icon:"🌋⚒️",
    reqStage:7, cost:150, rarity:"legendary", type:"active", targetable:false,
    desc:"대지 자체를 주조한다. 현재 전장의 지형을 드워프에게 유리하게 재성형. 모든 아군 장비 완전 복원.",
    aiHint:"세계 단조 발동! 드워프가 땅을 두드리자 지각이 움직이기 시작한다. 바위가 솟아 방벽을 만들고 지하 광맥이 열리며 용암이 길을 만든다. 대지 자체가 드워프의 의지를 따른다."
  },
];

export const NPC_CRAFT_STAGES = [
  { stage:0, name:"일반인",    icon:"😐", color:"#6060a0", threshold:0,
    desc:"아직 드워프 장인의 손길을 받지 않은 상태.",
    aiHint:"NPC가 평범한 장비를 착용하고 있다. 드워프 장인에게 특별한 신뢰를 갖지 않는다." },
  { stage:1, name:"인연",      icon:"🤝", color:"#a07030", threshold:20,
    desc:"장인의 손길을 한 번 받았다. 장비가 조금 좋아졌고, 드워프에게 호의를 갖는다.",
    aiHint:"NPC가 드워프 장인을 신뢰하며 어느 정도 따른다. 장비도 일반보다 좋아 보인다." },
  { stage:2, name:"단골",      icon:"⭐", color:"#c08030", threshold:45,
    desc:"믿을 수 있는 장인으로 인정했다. 전투·정보 등에서 자발적으로 협력한다.",
    aiHint:"NPC가 드워프 장인을 깊이 신뢰해 어려운 상황에서도 함께한다. 강화된 장비로 더 강하다." },
  { stage:3, name:"충신",      icon:"🛡️", color:"#d8a050", threshold:75,
    desc:"드워프를 주군으로 여긴다. 목숨을 걸고 지키며 비밀 정보를 가져온다.",
    aiHint:"NPC가 드워프를 절대적으로 충성하며 따른다. 명령 없이도 알아서 적을 막는다." },
  { stage:4, name:"의형제",    icon:"⚒️❤️", color:"#f8c850", threshold:100,
    desc:"드워프 혈맹. 선조 앞에 의형제를 맺었다. 언제 어디서든 달려온다.",
    aiHint:"NPC가 드워프와 혈맹을 맺은 의형제가 되었다. 드워프의 이름을 자신의 이름처럼 여긴다." },
];

export const NPC_CRAFT_METHODS = [
  { id:"sharpen",  name:"무기 연마",    icon:"⚔️", cost:10, power:15,
    reqStage:1, desc:"NPC의 무기를 연마해 위력을 높인다. 관계 향상.",
    aiHint:"드워프가 NPC의 무기를 받아 연마하자 날이 서늘하게 빛난다. NPC가 다시 받아들며 고마움을 표한다." },
  { id:"reinforce", name:"방어구 강화",  icon:"🛡️", cost:20, power:20,
    reqStage:1, desc:"NPC의 방어구를 강화해 방어력을 높인다. 신뢰도 상승.",
    aiHint:"드워프의 망치가 NPC 갑옷의 약점을 정확히 보강한다. NPC가 팔을 구부려보며 만족스럽게 끄덕인다." },
  { id:"rune_mark", name:"룬 각인",      icon:"✍️", cost:30, power:30,
    reqStage:2, desc:"NPC 장비에 보호 룬을 새겨 저주·마법 저항을 부여한다. 깊은 신뢰.",
    aiHint:"드워프가 정성스럽게 NPC 장비에 룬을 새긴다. 룬이 따뜻하게 빛나고 NPC가 이것이 무엇을 의미하는지 묻는다. 드워프가 '선조가 지켜줄 것'이라 말한다." },
  { id:"legend_gift", name:"전설 장비 증정", icon:"⭐", cost:50, power:45,
    reqStage:3, desc:"직접 만든 전설 등급 장비를 NPC에게 선물한다. 충성도 대폭 상승.",
    aiHint:"드워프가 직접 만든 전설 장비를 NPC에게 건넨다. NPC의 눈이 빛나고 이 장비를 받을 자격이 있냐고 묻는다. 드워프가 어깨를 두드린다." },
  { id:"blood_pact", name:"혈맹 단조",   icon:"⚒️❤️", cost:80, power:60,
    reqStage:4, desc:"선조의 제단 앞에서 혈맹 무기를 함께 만든다. 의형제 관계 성립.",
    aiHint:"드워프와 NPC가 함께 용광로 앞에 서서 피를 섞어 혈맹 무기를 단조한다. 불꽃이 치솟고 선조들의 이름이 울려 퍼진다." },
];

export const GRUDGE_TYPES = [
  { id:'betrayal',    label:'배신',       icon:'🗡️', weight:3, desc:'신뢰했던 자에게 배신당했다. 가장 무거운 원한.' },
  { id:'theft',       label:'약탈·도둑',  icon:'💰', weight:2, desc:'소유물이나 작품이 탈취당했다.' },
  { id:'insult',      label:'모욕',       icon:'💢', weight:1, desc:'드워프의 명예를 짓밟는 발언이나 행동을 당했다.' },
  { id:'invasion',    label:'영토 침략',  icon:'⚔️', weight:3, desc:'광산이나 터전이 침략당했다.' },
  { id:'disrespect',  label:'장인 비하',  icon:'😤', weight:2, desc:'작품이나 기술이 부당하게 무시당했다.' },
  { id:'broken_deal', label:'계약 불이행',icon:'📜', weight:2, desc:'드워프와 맺은 거래를 상대가 어겼다.' },
];

export const GRUDGE_RESOLUTIONS = [
  { id:'revenge',     label:'복수',    icon:'🩸', bonus:{ str:15, fear:12, crit:10 }, desc:'원한의 원인을 힘으로 응징했다. 분노가 힘이 된다.' },
  { id:'justice',     label:'정의 구현', icon:'⚖️', bonus:{ rep:12, wil:10, ldr:8 }, desc:'공정한 방법으로 원한을 해결했다. 명예가 오른다.' },
  { id:'forgiveness', label:'화해',    icon:'🤝', bonus:{ trst:15, cha:12, rep:10 }, desc:'적을 용서하고 화해했다. 드문 선택이지만 가장 강한 정신력.' },
  { id:'outgrow',     label:'극복',    icon:'⬆️', bonus:{ wil:12, end:10, int:8  }, desc:'원한을 초월해 스스로 강해졌다. 선조들이 인정하는 길.' },
];

export const WORK_DIFFICULTIES = [
  { id:'simple',    label:'간단한 작업',    icon:'🔧', approval:8,  curseIfAbandoned:5,  desc:'단순 수리·소형 제작. 선조도 쉽게 용서한다.' },
  { id:'standard',  label:'일반 단조',      icon:'⚒️', approval:15, curseIfAbandoned:12, desc:'표준 무기·방어구 제작. 완성 시 충분한 인정.' },
  { id:'advanced',  label:'고급 장인 작품', icon:'⚔️', approval:25, curseIfAbandoned:20, desc:'희귀 등급 이상 아이템. 선조가 주목한다.' },
  { id:'legendary', label:'전설 단조',      icon:'✨', approval:45, curseIfAbandoned:40, desc:'전설 아이템·유물 제작. 완성 시 선조 각성.' },
];

export const ORC_LINEAGE_DEFS = {
  honor: {
    label: "명예 업보", icon: "🛡️", color: "#40a0ff",
    desc: "정정당당한 전투, 약자 보호, 맹세 이행",
    gainDesc: "공정한 전투, 포로 살려보내기, 맹세 완수, 약자 구출",
    awakePath: "수호 전사",
    awakeDesc: "전투 중 아군 보호 능력 극대화. 신뢰받는 족장으로 각성.",
    awakeBonus: { wil: 20, end: 20, rep: 15 },
    awakeSkill: { id:"oh_aw_honor_shield", name:"명예의 방패", icon:"🛡️",
      desc:"아군이 피해받을 때 대신 받기. 대신 받은 피해는 30% 감소. 명예업보 비례 강화.",
      rarity:"legendary", mpCost:0 }
  },
  fear: {
    label: "공포 업보", icon: "💀", color: "#e04040",
    desc: "압도적 폭력, 학살, 적 패닉 유도",
    gainDesc: "적 섬멸, 협박, 공포 조장, 무자비한 압도",
    awakePath: "광전사",
    awakeDesc: "전투 폭발력 최대화. 제어 불능이지만 파괴력은 타의 추종 불허.",
    awakeBonus: { str: 30, fear: 25, mad: 15 },
    awakeSkill: { id:"oh_aw_fear_frenzy", name:"공포의 광란", icon:"💢",
      desc:"체력 무관하게 모든 STR·FEAR 판정 +30. 단, 전투 중 아군 명령 무시 가능. 공포업보 비례 강화.",
      rarity:"legendary", mpCost:0 }
  },
  wisdom: {
    label: "지혜 업보", icon: "🦅", color: "#a0d020",
    desc: "전술 승리, 희생, 부족 보호, 지략",
    gainDesc: "전술적 승리, 희생으로 동료 구출, 협상 성공, 적을 지략으로 제압",
    awakePath: "족장",
    awakeDesc: "전략적 판단력과 카리스마 극대화. 전투 외 상황에서도 압도적 영향력.",
    awakeBonus: { wil: 15, cha: 20, int: 15 },
    awakeSkill: { id:"oh_aw_wisdom_lord", name:"족장의 통솔", icon:"🦅",
      desc:"모든 대화·외교 판정 +25. 전투에서 적 2명을 포섭해 아군으로 전환 가능 (1전투 1회). 지혜업보 비례 강화.",
      rarity:"legendary", mpCost:0 }
  }
};

export const ORC_HONOR_GAINS = {
  honorable_duel: { label:"정정당당한 결투",  icon:"⚔️",  lineage:"honor",  gain:10, desc:"동등한 적과 정면 승부" },
  protect_weak:   { label:"약자 보호",         icon:"🛡️", lineage:"honor",  gain:8,  desc:"위험에 처한 약자를 구했다" },
  oath_kept:      { label:"맹세 이행",         icon:"🤝",  lineage:"honor",  gain:12, desc:"선언한 맹세를 지켰다" },
  massacre:       { label:"학살·압도",         icon:"💀",  lineage:"fear",   gain:10, desc:"적을 압도적으로 섬멸했다" },
  terror:         { label:"공포 조장",         icon:"😱",  lineage:"fear",   gain:8,  desc:"적에게 극도의 공포를 심었다" },
  berserker:      { label:"광전사 폭주",       icon:"💢",  lineage:"fear",   gain:12, desc:"통제 불능의 광란 전투" },
  tactical_win:   { label:"전술적 승리",       icon:"🦅",  lineage:"wisdom", gain:10, desc:"지략으로 강한 적을 이겼다" },
  sacrifice:      { label:"희생",              icon:"🌿",  lineage:"wisdom", gain:9,  desc:"동료를 위해 스스로를 희생했다" },
  tribe_protect:  { label:"부족 보호",         icon:"🏕️", lineage:"wisdom", gain:8,  desc:"부족 전체를 위기에서 지켰다" }
};

export const ORC_OATH_TYPES = [
  { id:"oath_victory",  label:"승리의 맹세",  icon:"⚔️",  bonus:{ str:15, fear:10 }, desc:"이 전투에서 반드시 이긴다", lineage:"honor" },
  { id:"oath_protect",  label:"보호의 맹세",  icon:"🛡️", bonus:{ end:15, wil:10  }, desc:"이 자를 반드시 지킨다",     lineage:"honor" },
  { id:"oath_revenge",  label:"복수의 맹세",  icon:"🩸",  bonus:{ str:20, fear:15 }, desc:"이 자를 반드시 쓰러뜨린다", lineage:"fear" },
  { id:"oath_conquest", label:"정복의 맹세",  icon:"🌋",  bonus:{ str:25, mad:10  }, desc:"이 땅을 반드시 정복한다",   lineage:"fear" },
  { id:"oath_wisdom",   label:"지략의 맹세",  icon:"🦅",  bonus:{ wil:15, cha:12  }, desc:"지략으로만 이 목표를 이룬다", lineage:"wisdom" },
  { id:"oath_tribe",    label:"부족의 맹세",  icon:"🏕️", bonus:{ end:10, rep:15  }, desc:"부족을 위해 무엇이든 한다",  lineage:"wisdom" }
];

export const BLOODVOW_PATHS = {
  battle: {
    label:'전투 맹서',   icon:'⚔️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></svg>', color:'#e84040',
    desc:'적을 쓰러뜨리는 것이 맹약의 핵심. 전투력이 폭발적으로 강화된다.',
    bonus:{ str:20, fear:16, crit:12, agi:10 }, penalty:{ trst:-8 },
    awakeSkill:{ id:'bv_battle_oath_strike', name:'혈맹의 일격', icon:'⚔️🩸',
      type:'active', rarity:'legendary', mpCost:0,
      desc:'HP 20 소모. 현재 맹약 목표에 대해 치명타 확정 + 판정 무조건 성공. 맹약 이행 시 HP 즉시 회복.',
      statBoost:{str:360, crit:280, fear:200} }
  },
  protect: {
    label:'수호 맹서',   icon:'🛡️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L19 6 L19 12 C19 17 15.5 20 12 21.5 C8.5 20 5 17 5 12 L5 6 Z" stroke-linejoin="round"/></svg>', color:'#4080e0',
    desc:'지키겠다고 선언한 대상을 위해 어떤 희생도 감수한다. 방어와 의지가 강화된다.',
    bonus:{ end:22, wil:18, rep:14, ldr:10 }, penalty:{ mad:-5 },
    awakeSkill:{ id:'bv_protect_oath_wall', name:'맹약 방벽', icon:'🛡️🩸',
      type:'passive', rarity:'legendary', mpCost:0,
      desc:'보호 대상이 피해받을 때 대신 받음. 대신 받은 피해 40% 감소. 보호 대상이 쓰러지면 분노 자동 발동.',
      statBoost:{end:320, wil:240, rep:160} }
  },
  revenge: {
    label:'복수 맹서',   icon:'🔥', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/></svg>', color:'#e06000',
    desc:'원한 대상을 반드시 쓰러뜨린다. 목표가 살아있는 한 힘이 계속 강화된다.',
    bonus:{ str:18, fear:14, per:12, mad:10 }, penalty:{ cha:-10, luk:-5 },
    awakeSkill:{ id:'bv_revenge_oath_hunt', name:'혈원 추격', icon:'🔥🩸',
      type:'passive', rarity:'legendary', mpCost:0,
      desc:'복수 목표 NPC를 어디서든 추적 가능. 대상과의 전투에서 모든 스탯 +30, 판정 무조건 성공.',
      statBoost:{str:300, per:240, fear:180, mad:80} }
  }
};

export const BLOODVOW_TYPES = [
  { id:'bv_battle_victory', label:'전투 승리',   icon:'⚔️', path:'battle',  cost:20, desc:'이 전투에서 반드시 이긴다. 이행: 업보+12, 고르의 피+20. 위반: STR -10, 선조 낙인.', fulfillBonus:{str:15,crit:10}, breakPenalty:{str:-10} },
  { id:'bv_battle_duel',    label:'결투 승리',   icon:'🗡️', path:'battle',  cost:30, desc:'지명한 적과 1:1 결투에서 이긴다. 이행: 업보+20, 두려움+15. 위반: 두려움 판정 영구-5.', fulfillBonus:{fear:20,str:20}, breakPenalty:{fear:-10} },
  { id:'bv_protect_ally',   label:'동료 수호',   icon:'🛡️', path:'protect', cost:20, desc:'이 동료가 이 전투에서 쓰러지지 않도록 지킨다. 이행: 명예+15, 신뢰도+10.', fulfillBonus:{rep:15,end:12}, breakPenalty:{trst:-15} },
  { id:'bv_protect_tribe',  label:'부족 수호',   icon:'🏕️', path:'protect', cost:35, desc:'부족 전체를 지킨다. 이행: 명예+25, 업보+15. 위반: 부족 신뢰 대폭 하락.', fulfillBonus:{rep:25,ldr:15}, breakPenalty:{rep:-20,ldr:-15} },
  { id:'bv_revenge_enemy',  label:'원수 응징',   icon:'🔥', path:'revenge', cost:25, desc:'지명한 적을 반드시 쓰러뜨린다. 이행: 업보+18, 공포+15. 위반: 광기 누적.', fulfillBonus:{fear:18,str:15}, breakPenalty:{mad:15} },
  { id:'bv_revenge_death',  label:'순사 복수',   icon:'💀', path:'revenge', cost:40, desc:'쓰러진 동료의 죽음을 갚는다. 이행: 업보+25, 강력한 보너스. 위반: STR -15, 정신 이상.', fulfillBonus:{str:25,fear:20}, breakPenalty:{str:-15,mad:20} },
];

export const COUNCIL_SAGES = [
  { id:'war_sage',   name:'전쟁 현자',  icon:'🪖', trait:'전략', desc:'전쟁 판단에 특화. 동의 시 전투 판정 +15.' },
  { id:'peace_sage', name:'평화 현자',  icon:'🕊️', trait:'외교', desc:'외교에 특화. 동의 시 협상 판정 +15.' },
  { id:'spirit_sage',name:'정령 현자',  icon:'🔮', trait:'주술', desc:'주술과 자연에 정통. 동의 시 신앙 판정 +15.' },
  { id:'elder_sage', name:'노장 현자',  icon:'🧓', trait:'경험', desc:'전통의 수호자. 동의 시 업보 +8.' },
];

export const COUNCIL_DECISIONS = [
  { id:'seek_counsel',  label:'현자 자문 구함',    icon:'🦅', gain:8,  trait:'wisdom', desc:'현자의 조언을 먼저 구했다. 전통을 따르는 행동.' },
  { id:'war_with_sage', label:'현자 동의 후 출전', icon:'⚔️', gain:12, trait:'honor',  desc:'현자의 동의를 얻고 전쟁을 결정했다. 가장 존중받는 결정.' },
  { id:'protect_weak',  label:'약자 보호 결정',   icon:'🛡️', gain:10, trait:'honor',  desc:'의회에서 약자 보호를 주도했다. 진정한 전사의 결정.' },
  { id:'war_solo',      label:'단독 전쟁 선포',   icon:'💢', gain:-15, trait:'impulsive', desc:'현자 동의 없이 전쟁을 선포했다. 의회에서 경멸받는다.' },
  { id:'negotiate',     label:'적과 협상 주도',   icon:'🤝', gain:10, trait:'wisdom',  desc:'전쟁 대신 협상을 선택했다. 현자들이 높이 평가한다.' },
  { id:'sacrifice_self',label:'자기희생 결정',    icon:'🌿', gain:14, trait:'honor',   desc:'부족을 위해 스스로를 희생하겠다고 선언했다. 현자들이 경의를 표한다.' },
  { id:'ignore_sage',   label:'현자 의견 무시',   icon:'🚫', gain:-10, trait:'impulsive', desc:'현자의 반대를 무시했다. 의회 신뢰도가 크게 하락한다.' },
];

export const DARKLING_VOID_TYPES = {
  shadow:       { label: "그림자 잠복",   icon: "🌑", gain: 8,  desc: "어둠 속 이동, 그림자 지형에서 행동, 은신 관련 행동" },
  conceal:      { label: "존재 은닉",     icon: "👻", gain: 7,  desc: "존재감 지우기, 감시 회피, 기억 지우기" },
  dread:        { label: "공포 조장",     icon: "😱", gain: 10, desc: "의도적 공포 유발, 심리 압박, 어둠으로 위협" },
  void_touch:   { label: "공허 접촉",     icon: "🖤", gain: 12, desc: "공허 에너지 방출, 공허 아이템 접촉, 균열 열기" },
  emotion_seal: { label: "감정 봉인",     icon: "🔒", gain: 6,  desc: "감정 억제, 냉정 유지, 타인의 감정 무시" },
};

export const DARKLING_LIGHT_EXPOSURE = [
  { id: "light_sunlight",  name: "태양광 노출",     icon: "☀️", reduce: 40,
    desc: "야외 낮 시간대에 직사광선을 받는다. 공허도 -40. 고단계에서는 HP도 감소.",
    req: "낮 시간대 야외 활동", pain: true },
  { id: "light_holy",      name: "신성한 빛 정화", icon: "✨", reduce: 60,
    desc: "세레스티얼의 빛 마법, 신성 제단, 빛의 신전. 공허도 -60. 반드시 고통 수반.",
    req: "성전/빛의 신전/세레스티얼 협조", pain: true },
  { id: "light_dawn",      name: "새벽빛 명상",     icon: "🌅", reduce: 25,
    desc: "새벽 첫 빛 아래 명상. 공허도 -25. 가장 고통이 적은 방법.",
    req: "새벽 시간대 명상 행동", pain: false },
  { id: "light_candle",    name: "촛불 접촉",        icon: "🕯️", reduce: 10,
    desc: "작은 촛불 불꽃에 손을 댄다. 공허도 -10. HP -5. 다크링에게 굴욕적인 방법.",
    req: "언제든 사용 가능 (HP 5 이상)", pain: true },
];

export const BLOOD_CLASSES = {
  warrior:   { label: '전사계', icon: '⚔️',  bonus: { str: 3, end: 2 },        rarity: 'common',   points: 8  },
  mage:      { label: '마법사계', icon: '🔮', bonus: { mgc: 3, int: 2 },        rarity: 'common',   points: 10 },
  rogue:     { label: '도적계', icon: '🗡️',  bonus: { agi: 3, per: 2 },        rarity: 'common',   points: 8  },
  cleric:    { label: '성직자계', icon: '✝️', bonus: { wil: 3, fath: 2 },       rarity: 'uncommon', points: 15, special: '신성 혈액 — 흡혈 시 FEAR +5 추가. 단 HP -3 반작용' },
  noble:     { label: '귀족계', icon: '👑',  bonus: { cha: 4, rep: 3 },         rarity: 'uncommon', points: 18, special: '귀족 혈액 — 공포 기록부에 자동 등록. 사회적 판정 +5' },
  hero:      { label: '영웅계', icon: '🌟',  bonus: { str: 5, wil: 5, luk: 3 }, rarity: 'rare',     points: 30, special: '영웅 혈액 — 흡혈 시 강렬한 기억 유입. 해당 영웅의 스킬 1개 임시 복사 (3턴)' },
  monster:   { label: '괴물계', icon: '👹',  bonus: { str: 4, fear: 4, end: 3 }, rarity: 'uncommon', points: 12 },
  ancient:   { label: '고대존재', icon: '♾️', bonus: { mgc: 6, int: 5, wil: 4 }, rarity: 'legendary', points: 50, special: '고대 혈액 — 시대 기록부에 즉시 +30. 연대기 단계 가속' },
  common:    { label: '평민계', icon: '👤',  bonus: { luk: 1 },                  rarity: 'common',   points: 5  },
};

export const FEAR_RANKS = {
  commoner: { label: '평민', icon: '👤', fearPoints: 3,  cityBonus: 2,  desc: '평민이 두려워한다. 도시 하층민이 이름을 속삭인다.' },
  merchant: { label: '상인', icon: '💰', fearPoints: 5,  cityBonus: 4,  desc: '상인들이 거래를 피한다. 도시 상업 지구에 소문이 퍼진다.' },
  knight:   { label: '기사', icon: '🛡️', fearPoints: 10, cityBonus: 8,  desc: '기사가 두려워한다. 전사들이 경계를 높인다.' },
  noble:    { label: '귀족', icon: '👑', fearPoints: 20, cityBonus: 15, desc: '귀족이 두려워한다. 상류층 사회에 경보가 울린다.' },
  priest:   { label: '성직자', icon: '✝️', fearPoints: 25, cityBonus: 12, desc: '성직자가 두려워한다. 신전에서 퇴마 의식을 준비한다.' },
  king:     { label: '왕족', icon: '♔',  fearPoints: 50, cityBonus: 40, desc: '왕족이 두려워한다. 국가가 대응에 나선다.' },
};

export const CELESTIAL_PHASE_STATS = {
  angel:    { bonus:{fath:50,mgc:40,wil:30,spk:25,luk:20}, penalty:{str:-20,fear:-15,agi:-10} },
  radiant:  { bonus:{fath:30,mgc:25,wil:20,spk:15},        penalty:{str:-10,fear:-8} },
  blessed:  { bonus:{fath:15,mgc:12,wil:10},                penalty:{str:-5} },
  balanced: { bonus:{},                                      penalty:{} },
  shadowed: { bonus:{mgc:12,fear:8,str:8},                  penalty:{fath:-15,wil:-8} },
  tainted:  { bonus:{mgc:25,fear:20,str:15,mad:10},         penalty:{fath:-30,wil:-15,trst:-12} },
  fallen:   { bonus:{mgc:45,fear:38,str:28,mad:22,neg:18},  penalty:{fath:-55,wil:-28,trst:-22,luk:-15} },
};

export const CELESTIAL_PHASE_SKILLS = {
  blessed: [
    { id:'cs_blessed_heal',   name:'신성 치유',     icon:'💚', type:'active',  rarity:'uncommon',
      desc:'MP 15. 신성한 빛으로 아군 HP +30 회복. 저주·독 동시 정화.',
      mpCost:15, statBoost:{fath:80} }
  ],
  radiant: [
    { id:'cs_radiant_shield', name:'빛의 방패',     icon:'🛡️', type:'active',  rarity:'rare',
      desc:'MP 25. 자신 또는 아군 1명에게 2턴간 신성 방벽 부여. 피해 40% 감소, 어둠 면역.',
      mpCost:25, statBoost:{} },
    { id:'cs_radiant_aura',   name:'성광의 오라',   icon:'☀️', type:'passive', rarity:'rare',
      desc:'항시 발동. 주변 어둠 속성 적에게 매 턴 FATH·WIL -8, 아군 HP 매 턴 +5 재생.',
      mpCost:0,  statBoost:{fath:120,wil:80}, condition:'always', conditionDesc:'항시 발동' }
  ],
  angel: [
    { id:'cs_angel_miracle',  name:'기적',           icon:'🌟', type:'active',  rarity:'legendary',
      desc:'HP 50 소모. 아군 전원 완전 회복 + 상태이상 정화. 사망한 아군 1명 부활. 3회 제한.',
      hpCost:50, mpCost:0, statBoost:{} },
    { id:'cs_angel_judgment', name:'천상의 심판',    icon:'⚖️', type:'active',  rarity:'legendary',
      desc:'MP 60. 적의 죄악을 가시화. 악한 행동 누적에 비례한 신성 피해. 극악 존재 즉사 판정.',
      mpCost:60, statBoost:{fath:320,wil:240} }
  ],
  shadowed: [
    { id:'cs_shadow_veil',    name:'타락의 베일',    icon:'🌑', type:'active',  rarity:'rare',
      desc:'MP 18. 빛을 감추고 어둠 속에 잠복. 2턴간 은신. 탐지·신성 감지 무력화.',
      mpCost:18, statBoost:{} }
  ],
  tainted: [
    { id:'cs_tainted_curse',  name:'신성 저주',      icon:'💜', type:'active',  rarity:'rare',
      desc:'MP 28. 신성의 힘을 뒤틀어 대상에게 저주 부여. 매 턴 FATH·HP -8, 5턴 지속.',
      mpCost:28, statBoost:{} },
    { id:'cs_tainted_drain',  name:'빛의 흡수',      icon:'🔮', type:'passive', rarity:'epic',
      desc:'신성 마법 적중 시 MP +15 흡수. 신성 존재와 전투 시 추가로 HP +8 흡수.',
      mpCost:0,  statBoost:{mgc:160,fear:120}, condition:'in_combat', conditionDesc:'전투 중' }
  ],
  fallen: [
    { id:'cs_fallen_wings',   name:'타락한 날개',    icon:'🖤', type:'passive', rarity:'legendary',
      desc:'항시 발동. AGI +25, 비행 가능. 신성 지역 진입 시 통증. 어둠 속 스탯 +15 추가.',
      mpCost:0,  statBoost:{agi:200,fear:160,mgc:120}, condition:'always', conditionDesc:'항시 발동' },
    { id:'cs_fallen_rebuke',  name:'타락의 포효',    icon:'☠️', type:'active',  rarity:'legendary',
      desc:'HP 40 소모. 세레스티얼의 타락이 폭발. 전장 신성 속성 완전 반전. 아군(어둠 계열) 스탯 2배(2턴).',
      hpCost:40, mpCost:0, statBoost:{} }
  ]
};

export const CELESTIAL_LIGHT_GAIN = {
  heal:      { label:'치유·회복',      icon:'💚', gain:8,  desc:'아군·민간인 치유, 저주 정화' },
  protect:   { label:'보호·희생',      icon:'🛡️', gain:10, desc:'약자 보호, 방어, 자기희생' },
  honest:    { label:'정직·정의',      icon:'📖', gain:7,  desc:'진실 고백, 맹세 이행, 공정한 판단' },
  sacrifice:  { label:'헌신·속죄',     icon:'🙏', gain:12, desc:'자신을 희생해 타인을 구함' },
  miracle:   { label:'진정한 기적',    icon:'🌟', gain:15, desc:'절체절명의 순간에 신성한 기적 발휘' },
};

export const CELESTIAL_DARK_GAIN = {
  deceive:   { label:'기만·거짓',      icon:'🎭', gain:-8,  desc:'거짓말, 위장, 위선적 행동' },
  violence:  { label:'과도한 폭력',    icon:'⚔️', gain:-10, desc:'불필요한 살상, 민간인 피해' },
  betray:    { label:'배신·배교',      icon:'🗡️', gain:-12, desc:'동료 배신, 신성 맹세 어김' },
  shadow:    { label:'어둠의 힘 사용', icon:'🌑', gain:-7,  desc:'금기된 어둠 마법, 악마와 협력' },
  selfish:   { label:'이기심·탐욕',   icon:'💰', gain:-6,  desc:'자신의 이익을 위해 타인을 방치' },
};

export const CELESTIAL_RESTORE_METHODS = [
  { id:'restore_prayer',   name:'신성한 기도',     icon:'🙏', gain:+40,
    desc:'성전에서 진심으로 기도. 신성도 +40, FATH +8.',
    req:'성전·빛의 신전 방문', cost:{} },
  { id:'restore_heal',     name:'치유의 기적',     icon:'💚', gain:+25,
    desc:'중상자를 치유. 신성도 +25. 상대 종족·선악 불문 항상 적용.',
    req:'치유 행동 시 자동', cost:{} },
  { id:'restore_vow',      name:'신성 맹세 갱신',  icon:'📖', gain:+30,
    desc:'천상에게 맹세를 갱신. 신성도 +30. 단, 맹세 불이행 시 -50.',
    req:'신성 맹세 상황', cost:{} },
];

export const CELESTIAL_DARKEN_METHODS = [
  { id:'darken_ritual',    name:'금기 의식',        icon:'🌑', gain:-50,
    desc:'어둠의 의식 참여. 신성도 -50, 어둠 스킬 즉시 해금.',
    req:'금기 장소·어둠 존재', cost:{} },
  { id:'darken_pact',      name:'악마와의 계약',    icon:'😈', gain:-70,
    desc:'악마와 직접 계약. 신성도 -70. 어둠 능력 대폭 상승.',
    req:'악마족 NPC 존재', cost:{} },
];

export const COVENANT_DEED_GAIN = {
  heal:      { label: '치유·소생',     icon: '💚', gain: 8,  desc: '아군·민간인·적군 불문 치유, 소생 시도' },
  protect:   { label: '보호·방어',     icon: '🛡️', gain: 10, desc: '약자 보호, 자기희생, 방패 역할' },
  judge:     { label: '심판·정의',     icon: '⚖️', gain: 9,  desc: '악인 심판, 부패 폭로, 진실 강요' },
  sacrifice:  { label: '헌신·속죄',   icon: '🙏', gain: 14, desc: '자신을 희생해 타인을 구함, 대가 지불' },
  miracle:   { label: '진정한 기적',   icon: '🌟', gain: 18, desc: '절체절명의 순간에 신성한 기적 발휘' },
};

export const COVENANT_SIN_LOSS = {
  deceive:  { label: '거짓 기적·위선', icon: '🎭', loss: -12, desc: '능력 없이 기적 약속, 신의 이름으로 사기' },
  violence:  { label: '무고한 학살',   icon: '⚔️', loss: -14, desc: '불필요한 살상, 민간인·무고한 자 피해' },
  betray:   { label: '사명 방기',      icon: '🗡️', loss: -16, desc: '도움을 청하는 자를 외면, 사명 포기' },
  shadow:   { label: '어둠과의 결탁', icon: '🌑', loss: -10, desc: '악마와 협력, 금기 어둠 마법 사용' },
  abandon:  { label: '신성 맹세 위반', icon: '💔', loss: -20, desc: '맹세를 어김, 신성한 계약 파기' },
};

export const COVENANT_ATONEMENT_METHODS = [
  { id: 'atone_prayer',   name: '신성한 기도',   icon: '🙏', gain: 40,
    desc: '성전에서 진심으로 기도. 계율 +40, FATH +10.',
    req: '성전·빛의 신전 방문', cost: {} },
  { id: 'atone_heal',     name: '무상 치유',      icon: '💚', gain: 25,
    desc: '대가 없이 중상자를 치유. 계율 +25. 선악 불문 항상 적용.',
    req: '치유 행동 시 자동', cost: {} },
  { id: 'atone_vow',      name: '신성 맹세 갱신', icon: '📖', gain: 35,
    desc: '천상에 맹세를 갱신. 계율 +35. 불이행 시 -60.',
    req: '신성 맹세 상황', cost: {} },
  { id: 'atone_sacrifice', name: '자기희생',      icon: '🌟', gain: 50,
    desc: 'HP 40 소모. 목숨을 걸고 타인을 구함. 계율 +50.',
    req: '언제든 가능', cost: { hp: 40 } },
];
