// 21~30번 시스템 — data
// Pure data split out of misc/016-2130번-시스템.js (see generate.js).

export const REL_LEGACY_HINTS = {
  ally:   (name, depth) => `${name}는 전생의 동료였습니다. 처음 만났을 때부터 묘한 신뢰감이 든다. (깊이 ${depth}성)`,
  rival:  (name, depth) => `${name}는 전생의 라이벌이었습니다. 처음 만나도 묘한 경쟁심이 솟구친다. (깊이 ${depth}성)`,
  love:   (name, depth) => `${name}는 전생의 연인이었습니다. 첫 만남임에도 가슴이 저릿하다. (깊이 ${depth}성)`,
  enemy:  (name, depth) => `${name}는 전생의 원수였습니다. 이름을 들으면 본능적으로 경계심이 솟는다. (깊이 ${depth}성)`,
  mentor: (name, depth) => `${name}는 전생의 스승이었습니다. 그의 말은 왠지 모르게 귀에 잘 들어온다. (깊이 ${depth}성)`,
};

export const ABILITY_IMPRINT_LABELS = {
  str: { name:"육체 각인", desc:"전생에서 갈고닦은 근력이 이번 생에 타고난 신체 능력으로 발현된다." },
  int: { name:"지식 각인", desc:"전생의 방대한 지식이 이번 생의 직관력으로 녹아있다." },
  agi: { name:"속도 각인", desc:"전생의 반사 신경이 이번 생에 천재적인 운동 감각으로 나타난다." },
  mgc: { name:"마력 각인", desc:"전생에서 다룬 마법의 흔적이 이번 생의 몸 어딘가에 새겨져 있다." },
  cal: { name:"내공 각인", desc:"전생에서 쌓은 내공의 기억이 이번 생의 호흡에 남아있다." },
  ldr: { name:"지도력 각인", desc:"전생에서 이끌었던 경험이 이번 생의 카리스마로 드러난다." },
};

export const CURSE_TYPE_DEFS = {
  death:    { name:"사신의 저주", mastery:"죽음을 직시하는 눈 — 죽음의 기운을 감지하고 일부 무효화한다." },
  darkness: { name:"어둠의 저주", mastery:"어둠 친화 — 어둠 속에서 능력이 강화되고 암시야를 얻는다." },
  silence:  { name:"침묵의 저주", mastery:"무언의 의사소통 — 말 없이도 의도를 전달하는 초감각이 생긴다." },
  madness:  { name:"광기의 저주", mastery:"제어된 광기 — 극한 상황에서 광기를 폭발력으로 전환한다." },
  binding:  { name:"속박의 저주", mastery:"사슬 파괴자 — 구속·결박 계열 마법에 대한 저항력이 생긴다." },
  plague:   { name:"역병의 저주", mastery:"역병 면역 — 독·병·오염에 강한 저항성을 가진다." },
};

export const CURSE_RING_ACTIONS = {
  always_attack:  { label:"무조건 공격",    icon:"⚔️",  threshold:3, penalty:"전투 판정 -10%, 적이 패턴에 익숙해져 선제 반격 확률 상승" },
  always_flee:    { label:"항상 도주",      icon:"🏃",  threshold:3, penalty:"도주 판정 -15%, '겁쟁이'라는 평판이 퍼져 NPC 호감도 하락" },
  always_deceive: { label:"항상 속임수",    icon:"🎭",  threshold:3, penalty:"설득·협상 판정 -20%, 주변인들이 경계하며 정보 차단" },
  always_solo:    { label:"항상 혼자 행동", icon:"👤",  threshold:3, penalty:"동료 없이 판정 시 -10%, 고독의 기운이 주변을 짓누름" },
  always_bribe:   { label:"항상 뇌물",      icon:"💰",  threshold:3, penalty:"골드 효율 -30%, 부패한 자로 알려져 청렴한 NPC 적대" },
};

export const INJURY_PART_DEFS = {
  arm:     { label:"팔",    icon:"💪", weakDesc:"전생의 팔 부상이 남아 STR 판정 -5", strongDesc:"팔의 단련으로 STR 판정 +8, 무기 조작 특화", statWeak:"str", statStrong:"str", bonusWeak:-5, bonusStrong:8 },
  leg:     { label:"다리",  icon:"🦵", weakDesc:"전생의 다리 부상으로 AGI 판정 -5", strongDesc:"다리의 강화로 AGI 판정 +8, 도주·추격 특화", statWeak:"agi", statStrong:"agi", bonusWeak:-5, bonusStrong:8 },
  eye:     { label:"눈",    icon:"👁️", weakDesc:"전생의 눈 부상으로 PER 판정 -5", strongDesc:"한쪽 눈의 예민함으로 PER 판정 +10, 급소 포착 특화", statWeak:"per", statStrong:"per", bonusWeak:-5, bonusStrong:10 },
  mind:    { label:"정신",  icon:"🧠", weakDesc:"전생의 정신적 상처로 WIL 판정 -5", strongDesc:"극복한 정신력으로 WIL 판정 +10, 공포·저주 저항", statWeak:"wil", statStrong:"wil", bonusWeak:-5, bonusStrong:10 },
  chest:   { label:"흉부",  icon:"🫀", weakDesc:"전생의 심한 흉부 부상으로 END 판정 -5", strongDesc:"단련된 체간으로 END 판정 +8, 치명상 생존율 상승", statWeak:"end", statStrong:"end", bonusWeak:-5, bonusStrong:8 },
  throat:  { label:"목",    icon:"🗣️", weakDesc:"전생의 목 부상으로 SPK 판정 -5", strongDesc:"단련된 목소리로 SPK 판정 +8, 협상·위협 특화", statWeak:"spk", statStrong:"spk", bonusWeak:-5, bonusStrong:8 },
};

export const ENDING_THEMES = {
  hero:        { label:"영웅의 귀환",     icon:"🌟", openingMood:"웅장하고 장엄한", openingLine:"전설이 된 영웅의 혼이 다시 한 번 세상에 깃든다. 어디선가 광명이 비치는 듯하다.", color:"#ffd700" },
  tragedy:     { label:"비극적 최후",     icon:"💔", openingMood:"암울하고 애잔한", openingLine:"슬픔을 간직한 영혼이 다시 눈을 떴다. 아직 끝나지 않은 무언가가 남아있는 것 같다.", color:"#8888ff" },
  villain:     { label:"악의 화신",       icon:"💀", openingMood:"불길하고 음울한", openingLine:"어둠 속에서 잠들었던 혼이 다시 깨어났다. 세상이 두려워해야 할 존재가 돌아왔다.", color:"#ff4444" },
  neutral:     { label:"평범한 삶",       icon:"🌿", openingMood:"잔잔하고 평온한", openingLine:"지난 생의 기억이 스쳐 지나간다. 새로운 삶이 조용히 시작된다.", color:"#80c080" },
  sacrifice:   { label:"희생과 헌신",     icon:"✨", openingMood:"숭고하고 신성한", openingLine:"모든 것을 바친 영혼이 다시 태어났다. 그 희생의 빛이 새 생에도 깃들어 있다.", color:"#e0c0ff" },
  mystery:     { label:"미지의 결말",     icon:"🌀", openingMood:"신비롭고 기묘한", openingLine:"기억 속 무언가가 흐릿하다. 알 수 없는 힘이 이번 생을 인도하려는 것 같다.", color:"#80e0ff" },
  revenge:     { label:"복수 완수",       icon:"⚔️", openingMood:"냉혹하고 결연한", openingLine:"이루어진 복수의 잔향이 새 생에도 남아있다. 분노가 식어도 그 힘은 사라지지 않는다.", color:"#cc4444" },
  redemption:  { label:"속죄의 여정",     icon:"🌸", openingMood:"따뜻하고 애틋한", openingLine:"지난 죄를 씻어낸 영혼이 가볍게 깨어났다. 이번 생은 다르게 살아보리라.", color:"#ffb0c0" },
  conquest:    { label:"정복자의 귀환",   icon:"⚡", openingMood:"강렬하고 압도적인", openingLine:"모든 것을 정복한 자가 다시 눈을 떴다. 세상이 다시 이 존재 앞에 무릎을 꿇게 될 것이다.", color:"#ffaa00" },
  ascension:   { label:"신격 상승",       icon:"👑", openingMood:"초월적이고 신성한", openingLine:"인간의 한계를 넘어선 자가 다시 태어났다. 이번 생에는 더 높은 곳을 향하리라.", color:"#ffe090" },
  wanderer:    { label:"방랑자의 길",     icon:"🌙", openingMood:"쓸쓸하고 고독한", openingLine:"정처 없이 걷던 영혼이 다시 길 위에 섰다. 이번에도 어디론가 걷기 시작할 것이다.", color:"#6080aa" },
  stealth:     { label:"그림자 속으로",   icon:"🌑", openingMood:"조용하고 날카로운", openingLine:"아무도 모르게 사라진 자가 다시 그림자 속에서 깨어났다. 이번에도 아무도 모르게.", color:"#445566" },
  revolutionary:{ label:"혁명가의 부활",  icon:"🔥", openingMood:"격렬하고 뜨거운", openingLine:"세상을 뒤집은 불꽃이 다시 타오른다. 또 다른 혁명이 이 손에서 시작될 것이다.", color:"#ff6020" },
  sage_end:    { label:"현자의 은퇴",     icon:"📚", openingMood:"깊고 사려깊은", openingLine:"모든 것을 알게 된 자가 조용히 눈을 감았다. 그 지식이 새 생에도 흐릿하게 남아있다.", color:"#80c0c0" },
};

export const FALSE_MEMORY_POOL = [
  "전생에서 배신당한 동료가 사실은 나를 지켜주려 했을 수 있다.",
  "기억 속 보물의 위치가 실제와 다를 수 있다.",
  "전생의 적이 사실 무고했을 가능성이 있다.",
  "기억 속 지름길이 함정일 수 있다.",
  "전생에서 죽인 자가 나의 숨겨진 은인이었을지도 모른다.",
  "전생의 사건 순서가 실제와 뒤바뀌어 기억될 수 있다.",
  "기억 속 인물의 얼굴이 실제 다른 사람과 혼동될 수 있다.",
];

export const AGE_PARADOX_DEFS = {
  elder: {
    label:"노인의 지혜",
    icon:"🧓",
    desc:"노년의 삶을 살다 죽은 영혼이 다시 태어났습니다. 어린 몸에 노인의 지혜가 깃들어 있습니다.",
    bonus:{ int:8, wil:6, cal:5 },
    bonusDesc:"INT +8, WIL +6, CAL +5 — 조숙한 천재의 면모",
    color:"#ffd0a0"
  },
  young: {
    label:"젊음의 각성",
    icon:"🌱",
    desc:"어린 나이에 죽은 영혼이 다시 태어났습니다. 타고난 직감과 배움의 속도가 남다릅니다.",
    bonus:{ agi:8, per:6, lck:5 },
    bonusDesc:"AGI +8, PER +6, LCK +5 — 천재적 감수성",
    color:"#a0ffa0"
  },
  prime: {
    label:"전성기의 기억",
    icon:"⚡",
    desc:"전성기에 죽은 영혼의 기억이 흘러 들어왔습니다. 육체적 전성기의 감각이 남아있습니다.",
    bonus:{ str:6, end:6, crit:4 },
    bonusDesc:"STR +6, END +6, CRIT +4 — 전성기의 육체 감각",
    color:"#ffb0a0"
  },
};

export const WORLD_TREE_STAGES = [
  { level:0,  label:"황폐한 그루터기",     icon:"🪨", desc:"세계가 황폐하다. 생명의 기운이 거의 느껴지지 않는다.", restoreDesc:"" },
  { level:1,  label:"새싹의 세계",         icon:"🌱", desc:"작은 새싹이 돋아났다. 세상 어딘가에 생명이 깃들기 시작한다.", restoreDesc:"처음 새싹이 움텄다.", bonus:"자연 지역에서 회복 아이템 발견 확률 +10%" },
  { level:2,  label:"어린나무의 세계",     icon:"🌿", desc:"가느다란 나무가 자랐다. 동물들이 돌아오기 시작했다.", restoreDesc:"나무가 성장했다.", bonus:"소환수·동물 NPC 호감도 +15" },
  { level:3,  label:"울창한 숲의 세계",   icon:"🌲", desc:"숲이 우거졌다. 세계의 자연 균형이 서서히 회복된다.", restoreDesc:"숲이 우거졌다.", bonus:"자연 관련 스킬 판정 +10, 비밀 숲 경로 등장" },
  { level:4,  label:"꽃이 핀 세계",       icon:"🌸", desc:"꽃이 만개한 세계. 사람들의 얼굴에 희망이 돌아왔다.", restoreDesc:"꽃이 피었다.", bonus:"NPC 전체 호감도 +10, 행복 결말 분기 확률 상승" },
  { level:5,  label:"황금 세계수의 세계", icon:"🌳", desc:"거대한 황금 세계수가 우뚝 섰다. 세계가 완전히 복원되었다. 전설이 완성되었다.", restoreDesc:"세계수가 완성되었다!", bonus:"전설 클래스 해금, 모든 스탯 +5, 진엔딩 경로 강화" },
];
