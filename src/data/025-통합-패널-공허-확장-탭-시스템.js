// 🌑 통합 패널 — 공허 확장 탭 시스템 — data
// Pure data split out of ui/025-통합-패널-공허-확장-탭-시스템.js (see generate.js).

export const ELF_MEMORY_GAIN = {
  bond:      { label:"인연의 기억",  icon:"💞", gain:8,  desc:"NPC와 깊은 대화, 감정적 교류, 관계 형성",
               specLabel:"기억의 수호자", specColor:"#ff80c0",
               specEffect:"과거에 잃은 NPC를 영령으로 소환. 소환된 영령은 3턴간 전투/외교 지원." },
  knowledge: { label:"지식의 기억",  icon:"📚", gain:10, desc:"마법·역사·세계관 지식 습득, 배움의 순간",
               specLabel:"고대 현자",   specColor:"#80c0ff",
               specEffect:"마법 스킬 MP 소모 -30%. 적이 스킬 사용 시 1회 자동 카운터 판정." },
  loss:      { label:"상실의 기억",  icon:"💔", gain:12, desc:"동료 사망, 이별, 배신당함, 깊은 상실",
               specLabel:"비탄의 전사", specColor:"#ff6060",
               specEffect:"HP 50% 이하 시 STR·MGC +40. 죽은 동료의 이름을 부르면 1턴간 그 동료의 스킬 1개 사용 가능." },
  oath:      { label:"서약의 기억",  icon:"⚔️", gain:9,  desc:"맹세, 약속, 계약 체결, 서약 이행",
               specLabel:"불멸의 맹서", specColor:"#ffd060",
               specEffect:"서약한 목표에 대한 모든 판정 +35. 배신한 자에게 저주 자동 반사(FATH·WIL -20/턴)." },
  place:     { label:"장소의 기억",  icon:"🗺️", gain:6,  desc:"새 장소 탐험, 역사적 장소 방문, 자연과의 교감",
               specLabel:"자연의 화신", specColor:"#80ffb0",
               specEffect:"자연 환경에서 매 턴 HP +8, MP +6 자동 회복. 지형 마법 판정 +30. 숲·산·바다에서 추가 스킬 사용 가능." }
};

export const ELF_SPECIALIZATIONS = {
  bond: {
    id:"bond", name:"기억의 수호자", icon:"💞👑", svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19 C12 19 4 14 4 9 C4 6.2 6.2 4 9 4 C10.4 4 11.5 4.7 12 5.7 C12.5 4.7 13.6 4 15 4 C17.8 4 20 6.2 20 9 C20 14 12 19 12 19 Z" stroke-linejoin="round"/><path d="M3 21 L3 15 L7.5 19 L12 12 L16.5 19 L21 15 L21 21 Z" stroke-linejoin="round" stroke-width="1.1" opacity="0.7"/></svg>', color:"#ff80c0",
    desc:"잃은 이들을 기억하고 그 힘을 빌린다. 인연이 무기가 된다.",
    threshold: 15,  // specPoints.bond 이 수치 이상이면 특화 확정
    stage3Skill: {
      id:"spec_bond_s3", name:"영령 소환", icon:"👻", type:"active",
      desc:"MP 25. 과거에 만났거나 잃은 NPC의 영령을 3턴간 소환. 전투 지원 또는 NPC 설득에 사용. 단, 소환된 영령은 소멸 후 영원히 사라진다.",
      rarity:"epic", mpCost:25, conditionDesc:"직접 발동", statBoost:{}
    },
    stage5Skill: {
      id:"spec_bond_s5", name:"인연의 사슬", icon:"⛓️💞", type:"passive",
      desc:"과거에 감정적 유대를 쌓은 NPC는 생사를 막론하고 위기 시 '공명' 발동. 50% 확률로 그 NPC의 기억에서 힘을 끌어 모든 스탯 +20 (3턴).",
      rarity:"legendary", mpCost:0, condition:"always", conditionDesc:"항시 발동", statBoost:{trst:200, per:150}
    },
    aiHint_spec:"[인연 특화] 과거에 만난 사람들의 잔상이 캐릭터 주변에 어른거린다. 위기 상황에서 죽은 동료의 목소리가 들린다. NPC와의 유대가 깊을수록 캐릭터가 더 강해지는 묘사를 자연스럽게 포함하라."
  },
  knowledge: {
    id:"knowledge", name:"고대 현자", icon:"📚✨", svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L4 19 L11 19 L11 4 Z" stroke-linejoin="round"/><path d="M13 4 L13 19 L20 19 L20 4 Z" stroke-linejoin="round"/><path d="M16.5 1.5 L17.5 3.8 L20 4 L18.2 5.6 L18.7 8 L16.5 6.8 L14.3 8 L14.8 5.6 L13 4 L15.5 3.8 Z" stroke-width="1.1"/></svg>', color:"#80c0ff",
    desc:"수천 년의 지식이 몸에 새겨졌다. 마법의 원리를 꿰뚫어본다.",
    threshold: 15,
    stage3Skill: {
      id:"spec_know_s3", name:"마법 카운터", icon:"🔮⚡", type:"passive",
      desc:"적이 마법 스킬을 사용할 때 INT 판정 성공 시 자동 카운터 발동. 카운터 성공 시 적 마법 무효화 + MP 10 흡수.",
      rarity:"epic", mpCost:0, condition:"enemy_magic", conditionDesc:"적 마법 사용 시", statBoost:{int:160, mgc:120}
    },
    stage5Skill: {
      id:"spec_know_s5", name:"금지된 지식", icon:"📜🔥", type:"active",
      desc:"HP 30 소모. 세계의 금지된 마법 지식 1개를 임시 해금. 해금 마법은 이 전투·장면 한정으로 사용 가능. 매우 강력하지만 WIS -10 페널티.",
      rarity:"legendary", mpCost:0, condition:null, conditionDesc:null, statBoost:{}
    },
    aiHint_spec:"[지식 특화] 캐릭터의 손에서 책의 페이지가 펼쳐지는 듯한 빛이 난다. 상대가 마법을 쓰려는 순간 그 마법의 원리를 꿰뚫어보는 묘사. 금지된 지식을 사용할 때 눈이 빛나며 고대 언어가 허공에 떠오른다."
  },
  loss: {
    id:"loss", name:"비탄의 전사", icon:"💔⚔️", svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19 C12 19 4 14 4 9 C4 6.2 6.2 4 9 4 C10.4 4 11.5 4.7 12 5.7 C12.5 4.7 13.6 4 15 4 C17.8 4 20 6.2 20 9 C20 14 12 19 12 19 Z" stroke-linejoin="round"/><path d="M9 8 L15 15 M15 8 L9 15" stroke-width="1.2"/></svg>', color:"#ff6060",
    desc:"상실이 칼이 된다. 슬픔이 깊을수록 강해진다.",
    threshold: 15,
    stage3Skill: {
      id:"spec_loss_s3", name:"비탄의 폭발", icon:"💔💥", type:"active",
      desc:"MP 0, HP 20 소모. 지금까지 쌓인 상실 기억 횟수 × 8만큼 STR·MGC 판정에 보너스 적용. HP가 낮을수록 효과 2배. 사용 후 슬픔 이모션.",
      rarity:"epic", mpCost:0, condition:null, conditionDesc:null, statBoost:{}
    },
    stage5Skill: {
      id:"spec_loss_s5", name:"죽은 자의 의지", icon:"👤💔", type:"active",
      desc:"MP 35. 죽은 동료의 이름을 부르며 그 동료의 스킬 1개를 현재 몸에 빙의시킨다. 3턴간 해당 스킬 사용 가능. 사용 후 깊은 슬픔 이모션 발동.",
      rarity:"legendary", mpCost:35, condition:null, conditionDesc:null, statBoost:{}
    },
    aiHint_spec:"[상실 특화] HP가 낮아질수록 캐릭터의 눈빛이 더 차갑고 강렬해진다. 잃은 이들의 이름을 중얼거리는 묘사. 슬픔이 분노로 바뀌는 순간을 극적으로 묘사하라. 눈물 자국 같은 흉터가 빛난다."
  },
  oath: {
    id:"oath", name:"불멸의 맹서", icon:"⚔️🔱", svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 L14 8 L18 8 L15 11 L16.5 15 L12 12.5 L7.5 15 L9 11 L6 8 L10 8 Z" stroke-linejoin="round"/><path d="M12 15 L12 21" stroke-width="1.3"/></svg>', color:"#ffd060",
    desc:"서약이 법이 된다. 맹서한 것은 세계의 진실이 된다.",
    threshold: 15,
    stage3Skill: {
      id:"spec_oath_s3", name:"저주 반사", icon:"🔱💥", type:"passive",
      desc:"자신이나 서약한 대상을 배신·공격한 자에게 저주 자동 반사. 배신자는 매 턴 FATH -8, WIL -8. 저주는 서약이 끝날 때까지 지속.",
      rarity:"epic", mpCost:0, condition:"betrayed", conditionDesc:"배신 당했을 때", statBoost:{wis:140, wil:100}
    },
    stage5Skill: {
      id:"spec_oath_s5", name:"불멸의 계약", icon:"📜♾️", type:"active",
      desc:"HP 25, MP 40 소모. NPC와 '불멸의 계약'을 맺는다. 계약자는 계약 기간 동안 모든 스탯 +15를 공유. 계약을 어기면 즉시 HP 절반 손실.",
      rarity:"legendary", mpCost:40, condition:null, conditionDesc:null, statBoost:{}
    },
    aiHint_spec:"[서약 특화] 손목이나 가슴에 계약 룬이 빛난다. 맹세할 때 공기가 진동하는 묘사. 배신한 상대를 바라볼 때 눈에서 금빛 빛이 나며 그 자가 저주를 받는 묘사."
  },
  place: {
    id:"place", name:"자연의 화신", icon:"🌿🌍", svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></svg>', color:"#80ffb0",
    desc:"땅과 하나가 된다. 자연이 이 엘프를 수호하고, 이 엘프가 자연을 수호한다.",
    threshold: 15,
    stage3Skill: {
      id:"spec_place_s3", name:"지형 장악", icon:"🌿⚡", type:"active",
      desc:"MP 20. 현재 자연 지형(숲·산·바다·초원)을 3턴간 완전히 장악. 아군 모든 스탯 +12, 적 이동력 반감. 던전·도시에서는 효과 없음.",
      rarity:"epic", mpCost:20, condition:"natural_area", conditionDesc:"자연 지형에서", statBoost:{}
    },
    stage5Skill: {
      id:"spec_place_s5", name:"대지의 분노", icon:"🌍💥", type:"active",
      desc:"MP 50, HP 20 소모. 자연의 힘을 완전히 해방. 지진·뿌리·폭풍 중 하나 선택해 전장 장악. 사용 후 자연이 1시간 동안 이 엘프의 명령을 따른다.",
      rarity:"legendary", mpCost:50, condition:null, conditionDesc:null, statBoost:{}
    },
    aiHint_spec:"[자연 특화] 이 엘프가 걷는 곳마다 풀이 돋고 꽃이 핀다. 나무가 말을 걸어오는 묘사. 전투에서 덩굴이 적을 옭아매거나 바람이 화살을 막아주는 장면."
  }
};

export const ELF_RESTORE_METHODS = [
  { id:"restore_meditation", name:"기억 명상",    icon:"🧘", cost:{}, reduce:30,
    desc:"고요한 장소에서 명상으로 봉인된 기억을 되살린다. 기억력 +30, INT+5.",
    req:"조용한 장소(숲, 도서관, 신전)", hpCost:0, goldCost:0 },
  { id:"restore_reunion",    name:"인연 재회",    icon:"💞", cost:{}, reduce:22,
    desc:"소중한 인물과 재회하거나 과거 기억을 공유해 기억력 회복. 기억력 +22.",
    req:"인연 있는 NPC와 대화 시 자동 적용", hpCost:0, goldCost:0 },
  { id:"restore_chronicle",  name:"기억 결정화",  icon:"💎", cost:{gold:400}, reduce:55,
    desc:"기억의 수정으로 흩어진 기억을 결정화. 기억력 +55. 단 3턴간 새 기억 각인 불가.",
    req:"기억의 수정 1개 필요", hpCost:0, goldCost:400 },
  { id:"restore_vow",        name:"서약 갱신",    icon:"📜", cost:{hp:25}, reduce:42,
    desc:"과거의 서약을 되새기며 기억의 뿌리를 강화. 기억력 +42, HP -25.",
    req:"언제든 사용 가능 (HP 25 이상)", hpCost:25, goldCost:0 },
];

export const EMOTION_SKILLS = {
  // 억제 스킬
  em_sup_cold_logic: { id:'em_sup_cold_logic', name:'냉철한 논리', icon:'🧊', type:'active', rarity:'rare',
    desc:'MP 15. 감정을 완전히 배제한 냉철한 판단. 협상·외교·마법 판정 +25. 상대가 감정에 호소해도 효과 없음.',
    mpCost:15, statBoost:{neg:120, int:80}, condition:null, conditionDesc:'직접 발동',
    aiHint:'냉철한 논리 발동! 엘프의 눈에서 모든 감정이 사라지고 순수한 계산만 남는다.' },
  em_sup_iron_will:  { id:'em_sup_iron_will',  name:'강철 의지', icon:'💎', type:'passive', rarity:'epic',
    desc:'감정적 공격·유혹·공포 완전 면역. WIL +20 상시. 억제도가 높을수록 강화.',
    mpCost:0, statBoost:{wil:160, mgc:80}, condition:'always', conditionDesc:'항시 발동',
    aiHint:'강철 의지 발동! 어떤 감정적 압박도 이 엘프를 흔들지 못한다.' },
  // 감정 해방 스킬
  em_rel_empathy:    { id:'em_rel_empathy',     name:'깊은 공감', icon:'💗', type:'passive', rarity:'rare',
    desc:'타인의 감정을 완전히 이해. 대화 상대의 진심과 숨은 감정 자동 감지. 신뢰도 +15 상시.',
    mpCost:0, statBoost:{cha:120, trst:96}, condition:'always', conditionDesc:'항시 발동',
    aiHint:'깊은 공감 발동! 이 엘프는 상대가 말하지 않은 감정까지 느낀다.' },
  em_rel_passion:    { id:'em_rel_passion',     name:'열정의 마법', icon:'🔥', type:'active', rarity:'rare',
    desc:'MP 20. 감정 에너지를 마법으로 변환. 불안정하지만 강력한 마법 폭발. 주사위 결과 2배 또는 0.',
    mpCost:20, statBoost:{mgc:200, fear:80}, condition:null, conditionDesc:'직접 발동',
    aiHint:'열정의 마법 발동! 감정이 마법으로 변환되어 폭발적인 힘으로 방출된다. 불안정하지만 강렬하다.' },
  em_rel_eruption:   { id:'em_rel_eruption',    name:'감정 폭발', icon:'💥', type:'event', rarity:'legendary',
    desc:'감정이 임계점을 넘어 폭발. STR·MGC·FEAR 모두 +35 일시. 단, 이후 2턴 탈진.',
    mpCost:0, statBoost:{mgc:280, str:200, fear:160}, condition:'emotion_overflow', conditionDesc:'감정 넘칠 때',
    aiHint:'감정 폭발! 억누르던 감정이 한꺼번에 분출된다. 압도적인 힘이 발현되지만 대가가 따른다.' },
};

export const HUMAN_FATE_PATHS = {
  warrior: {
    label: "전사형", icon: "⚔️", svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></svg>', color: "#e05030",
    desc: "육체와 전투의 길. 강함으로 운명을 개척한다.",
    stats: { str: 8, end: 8, crit: 6, agi: 4 },
    skillUnlock: "ha_fate_warrior_resolve",
    titleUnlock: "ha_warrior_path"
  },
  mage: {
    label: "마법사형", icon: "🔮", svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></svg>', color: "#6040d0",
    desc: "지혜와 마법의 길. 이해로 세계를 바꾼다.",
    stats: { mgc: 8, int: 8, mp: 30, per: 4 },
    skillUnlock: "ha_fate_mage_insight",
    titleUnlock: "ha_mage_path"
  },
  diplomat: {
    label: "외교관형", icon: "🤝", svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 L9 12 L11 9 L13 15 L15 12 L22 12" stroke-linejoin="round"/><circle cx="6" cy="8" r="2.2"/><circle cx="18" cy="8" r="2.2"/></svg>', color: "#30b060",
    desc: "언변과 인연의 길. 관계로 역사를 만든다.",
    stats: { cha: 8, neg: 8, rep: 6, luk: 4 },
    skillUnlock: "ha_fate_diplomat_word",
    titleUnlock: "ha_diplomat_path"
  }
};

export const HUMAN_PATH_SKILLS = {
  ha_fate_warrior_resolve: {
    id:"ha_fate_warrior_resolve", name:"전사의 결의", icon:"⚔️", type:"passive",
    desc:"전투에서 HP가 절반 이하일 때 STR·END +20. 고통이 힘이 된다.",
    rarity:"rare", mpCost:0, condition:"low_hp", conditionDesc:"HP 절반 이하 시",
    statBoost:{str:160, end:160}
  },
  ha_fate_mage_insight: {
    id:"ha_fate_mage_insight", name:"마법사의 통찰", icon:"🔮", type:"passive",
    desc:"마법·지식 관련 판정 항상 +20. 고대 문자·마법진 자동 해독.",
    rarity:"rare", mpCost:0, condition:"always", conditionDesc:"항시 발동",
    statBoost:{mgc:160, int:160}
  },
  ha_fate_diplomat_word: {
    id:"ha_fate_diplomat_word", name:"외교관의 한마디", icon:"🤝", type:"active",
    desc:"MP 20. 적대적 NPC를 중립화. 전투 상황에서도 대화의 기회 강제 생성.",
    rarity:"rare", mpCost:20, condition:null, conditionDesc:null,
    statBoost:{}
  }
};

export const HUMAN_DEED_GAIN = {
  growth:    { label:"성장·극복",      icon:"📈", gain:8,  desc:"한계를 극복하거나 새로운 것을 배움" },
  courage:   { label:"용기 있는 행동", icon:"🔥", gain:10, desc:"두려움을 극복하고 위험을 무릅씀" },
  bond:      { label:"인연·우정",      icon:"🤝", gain:6,  desc:"새로운 인연을 맺거나 동료를 지킴" },
  triumph:   { label:"위업 달성",      icon:"🏆", gain:12, desc:"불가능해 보이던 목표를 이룸" },
  sacrifice: { label:"희생·헌신",      icon:"💗", gain:9,  desc:"자신을 희생해 타인을 구함" },
};

export const AWAKENING_POWER_SKILLS = [
  // ── 1단계 스킬 (각성도 50+ 필요)
  {
    id: "aps_battle_cry",
    name: "전장의 외침",
    icon: "📣⚔️",
    reqStage: 1, cost: 15,
    rarity: "uncommon",
    type: "active",
    targetable: false,
    desc: "인간의 불굴 의지를 담은 함성. 아군 전체 다음 판정 +20. 적의 사기 -10.",
    aiHint: "전장의 외침 발동! 캐릭터의 목소리에 담긴 인간의 집념이 전장을 울린다. 쓰러지기 직전이던 동료들의 눈빛에 불꽃이 되살아나고, 적들이 주춤하며 뒤를 돌아본다."
  },
  {
    id: "aps_second_wind",
    name: "두 번째 바람",
    icon: "💨🔥",
    reqStage: 1, cost: 20,
    rarity: "uncommon",
    type: "active",
    targetable: false,
    desc: "인간 특유의 회복력으로 한계를 돌파. HP +25, 이번 턴 피로·부상 무시.",
    aiHint: "두 번째 바람 발동! 모든 것을 쏟아부어 한계에 달했다고 생각한 순간, 인간의 몸 어딘가에서 아직 꺼지지 않은 불씨가 타오른다. 숨이 고르게 가다듬어지고 쓰라린 상처가 의식 뒤편으로 밀려난다."
  },
  // ── 2단계 스킬 (각성도 120+ 필요)
  {
    id: "aps_hero_declaration",
    name: "영웅 선언",
    icon: "⭐🗡️",
    reqStage: 2, cost: 30,
    rarity: "rare",
    type: "active",
    targetable: false,
    desc: "스스로의 의지를 선언하며 운명에 도전. 다음 3턴 모든 판정 +15, REP +5 영구 상승.",
    aiHint: "영웅 선언 발동! 캐릭터가 주변 모든 시선 앞에서 자신의 신념을 외친다. 그 순간 공기가 진동하고 목격한 이들의 마음에 무언가가 새겨진다. 이 선언이 역사에 기록될 것임을 모두가 직감한다."
  },
  {
    id: "aps_tactical_genius",
    name: "전술적 천재성",
    icon: "🧠⚡",
    reqStage: 2, cost: 25,
    rarity: "rare",
    type: "active",
    targetable: false,
    desc: "인간의 뛰어난 지략으로 상황을 분석. 이번 전투·협상의 적 약점 자동 파악, 판정 +25.",
    aiHint: "전술적 천재성 발동! 캐릭터의 눈이 빠르게 상황을 훑는다. 적의 진형 빈틈, 협상자의 감춰진 패, 지형의 이점이 한꺼번에 머릿속에서 그림처럼 정리된다. 인간의 유연한 사고가 어떤 계산기보다 빠르게 돌아간다."
  },
  // ── 3단계 스킬 (각성도 220+ 필요)
  {
    id: "aps_fate_push",
    name: "운명 밀어붙이기",
    icon: "💫🔱",
    reqStage: 3, cost: 45,
    rarity: "rare",
    type: "active",
    targetable: false,
    desc: "불리한 운명의 흐름을 인간의 의지로 강제 반전. 현재 판정을 실패→성공으로 전환. 1회.",
    aiHint: "운명 밀어붙이기 발동! 모든 것이 최악으로 치닫는 그 순간, 캐릭터가 이를 악물고 한 걸음을 더 내딛는다. 불가능하다는 법칙이 인간의 집념 앞에서 잠시 멈칫한다. 흐름이 뒤집어진다."
  },
  {
    id: "aps_inspire_speech",
    name: "혼을 담은 연설",
    icon: "🎤🌟",
    reqStage: 3, cost: 40,
    rarity: "rare",
    type: "active",
    targetable: true,
    desc: "영혼을 뒤흔드는 말로 대상을 일깨운다. 적대적 NPC를 중립으로, 중립 NPC를 우호적으로 전환.",
    aiHint: "혼을 담은 연설 발동! 캐릭터의 말 한 마디가 칼보다 날카롭게 상대의 가슴을 파고든다. 꺼져있던 눈빛에 불이 켜지고, 굳게 닫혔던 마음의 문이 삐걱거리며 열리기 시작한다."
  },
  // ── 4단계 스킬 (각성도 350+ 필요)
  {
    id: "aps_legend_presence",
    name: "전설의 위압",
    icon: "👑⚡",
    reqStage: 4, cost: 60,
    rarity: "epic",
    type: "active",
    targetable: false,
    desc: "전설로 불리는 이름의 무게를 쏟아낸다. 현장 모든 존재 위압, 약한 적 즉시 전의 상실.",
    aiHint: "전설의 위압 발동! 캐릭터가 천천히 몸을 세우자 공기 자체가 달라진다. 이 이름이 만들어온 역사의 무게가 현재로 쏟아져, 적들이 자신도 모르게 한 발 물러선다. 이 자와 싸운다는 것이 얼마나 무모한 일인지를 본능이 먼저 알아챈다."
  },
  {
    id: "aps_miracle_moment",
    name: "기적의 순간 창조",
    icon: "✨🌠",
    reqStage: 4, cost: 70,
    rarity: "epic",
    type: "active",
    targetable: false,
    desc: "인간이 만들어내는 기적. 현재 장면에서 불가능한 일 하나를 강제로 성공시킨다.",
    aiHint: "기적의 순간 창조 발동! 논리와 확률이 '불가능하다'고 외치는 그 순간에 인간이 기적을 만들어낸다. 이건 신의 가호도, 마법도 아니다. 오직 한 인간의 의지가 현실의 법칙을 잠시 구부린 것이다."
  },
  // ── 5단계 스킬 (각성도 520+ 필요)
  {
    id: "aps_human_legacy",
    name: "인간의 유산",
    icon: "📜🌍",
    reqStage: 5, cost: 80,
    rarity: "legendary",
    type: "active",
    targetable: false,
    desc: "이 순간이 역사가 된다. 현재 행동이 세계 설정에 영구 기록. 관련 판정 영구 +10.",
    aiHint: "인간의 유산 발동! 이 행동이 단순한 선택을 넘어 역사의 한 페이지가 되는 순간이다. 목격한 모든 이들이 훗날 이 장면을 떠올릴 것이고, 세상은 이 전과 이 후로 나뉘게 될 것이다."
  },
  {
    id: "aps_rally_world",
    name: "세계를 일으키다",
    icon: "🌍💪",
    reqStage: 5, cost: 100,
    rarity: "legendary",
    type: "active",
    targetable: false,
    desc: "현재 지역 모든 인간과 중립 세력을 분기시킨다. 대규모 지원군·동맹 결성 가능.",
    aiHint: "세계를 일으키다 발동! 캐릭터의 행동이 파문처럼 퍼져나간다. 각자의 삶을 살던 사람들이 하나의 방향을 바라보기 시작한다. 혼자서 시작한 일이 세상을 움직이는 물결이 된다."
  },
  // ── 6단계 스킬 (각성도 750+ 필요)
  {
    id: "aps_epoch_change",
    name: "시대 전환",
    icon: "⏳🌟",
    reqStage: 6, cost: 120,
    rarity: "legendary",
    type: "active",
    targetable: false,
    desc: "시대의 흐름 자체를 바꾼다. 현재 진행 중인 전쟁·분쟁·위기의 결말을 강제로 유리하게 전환.",
    aiHint: "시대 전환 발동! 역사가들이 훗날 '이 날 이 순간부터 모든 것이 달라졌다'고 기록할 것이다. 캐릭터는 지금 개인이 아닌 시대를 움직이는 힘 그 자체가 되었다."
  },
  // ── 7단계 스킬 (각성도 1000 필요)
  {
    id: "aps_human_apex",
    name: "인류의 정점",
    icon: "👑🌌",
    reqStage: 7, cost: 150,
    rarity: "legendary",
    type: "active",
    targetable: false,
    desc: "인간이라는 종족이 도달할 수 있는 극한 발현. 1턴간 모든 스탯 무한대 취급, 어떤 존재도 맞설 수 없다.",
    aiHint: "인류의 정점 발동! 한 인간이 종족 전체의 가능성을 한순간에 집약시킨다. 신들이 침묵하고 악마들이 뒤로 물러난다. 이것은 마법도, 신성도 아니다. 인간이 인간이기에 가능한, 그 무엇도 흉내낼 수 없는 빛이다."
  },
];

export const NPC_INSPIRE_STAGES = [
  { stage: 0, name: "무관심",   icon: "😐", color: "#808080", threshold: 0,
    desc: "감화의 영향을 받지 않은 상태.",
    aiHint: "NPC가 아직 특별한 감화를 받지 않았다. 원래 성격대로 행동한다." },
  { stage: 1, name: "호기심",   icon: "🤔", color: "#80a040", threshold: 20,
    desc: "이 인간에게서 무언가 특별한 것을 느끼기 시작했다.",
    aiHint: "NPC의 눈빛이 캐릭터에게 향할 때 미묘하게 달라진다. 말 한 마디를 더 귀기울여 듣는다." },
  { stage: 2, name: "신뢰",     icon: "🤝", color: "#40a060", threshold: 45,
    desc: "진심으로 이 인간을 믿기 시작했다. 위험도 함께 나누려 한다.",
    aiHint: "NPC가 자발적으로 비밀을 털어놓거나 도움을 자처한다. 이 인간을 위해서라면 평소엔 하지 않을 행동도 한다." },
  { stage: 3, name: "헌신",     icon: "💗", color: "#40b080", threshold: 75,
    desc: "삶의 방향 자체가 바뀌었다. 이 인간의 뜻이 자신의 뜻이 됐다.",
    aiHint: "NPC가 완전히 다른 사람으로 피어났다. 소극적이던 자가 용감해지고, 방황하던 자가 목표를 갖게 되었다." },
  { stage: 4, name: "영원한 동료", icon: "⭐", color: "#60d090", threshold: 100,
    desc: "삶을 걸고 함께 한다. 이 인간이 만들어가는 역사의 한 페이지가 되기로 결심했다.",
    aiHint: "NPC가 영원한 동료가 되었다. 어떤 고난이 와도 이 인간의 곁을 지키겠다는 의지가 흔들리지 않는다." },
];

export const NPC_INSPIRE_METHODS = [
  { id: "kind_word",    name: "진심 어린 말",   icon: "💬", cost: 10, power: 15,
    reqStage: 1, desc: "마음에서 우러난 한 마디로 상대의 마음을 건드린다.",
    aiHint: "캐릭터가 꾸밈없는 진심을 담아 말을 건넨다. 상대가 오랫동안 듣고 싶었던 말이었는지, 눈빛이 흔들린다." },
  { id: "shared_trial", name: "함께 겪는 시련",  icon: "🔥", cost: 20, power: 20,
    reqStage: 1, desc: "같은 위험을 함께 넘어서며 유대감을 쌓는다.",
    aiHint: "극한의 상황을 함께 헤쳐나오면서 두 사람 사이에 말로 설명할 수 없는 신뢰가 싹튼다." },
  { id: "personal_story", name: "내 이야기",     icon: "📖", cost: 25, power: 25,
    reqStage: 2, desc: "자신의 상처와 성장을 솔직하게 나눈다. 상대의 마음을 열게 한다.",
    aiHint: "캐릭터가 자신의 가장 아픈 기억과 그것을 극복한 이야기를 꺼낸다. 상대의 눈에 공감의 빛이 맺힌다." },
  { id: "stand_for",    name: "나서서 지키기",   icon: "🛡️", cost: 30, power: 30,
    reqStage: 2, desc: "상대를 위해 자신을 위험에 내던진다. 행동으로 보여주는 신뢰.",
    aiHint: "말이 아닌 몸으로 보여준다. 캐릭터가 자신을 아랑곳하지 않고 상대를 위해 나서자, 상대의 가슴 깊은 곳이 진동한다." },
  { id: "shared_dream", name: "꿈 나누기",       icon: "🌟", cost: 40, power: 40,
    reqStage: 3, desc: "자신이 꿈꾸는 세상을 생생하게 전한다. 상대도 그 꿈의 일부가 되고 싶어진다.",
    aiHint: "캐릭터가 빛나는 눈으로 꿈을 이야기한다. 들을수록 그 세계가 실제로 가능할 것 같아지고, 상대는 자신도 그 꿈의 주인공이 되고 싶다는 충동을 느낀다." },
  { id: "life_change",  name: "삶을 바꾼 한 마디", icon: "💡", cost: 60, power: 55,
    reqStage: 4, desc: "상대의 세계관과 삶의 방향을 송두리째 바꿀 말을 전한다.",
    aiHint: "한 마디가 운명처럼 꽂힌다. 상대는 훗날 이 순간을 자신의 삶이 바뀐 날로 기억하게 될 것이다." },
];
