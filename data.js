
const STORAGE_KEY          = "taleforge-session";
const API_KEYS_STORAGE     = "taleforge-apikeys";
const API_KEY_INDEX_STORAGE = "taleforge-keyindex";

const _memStore = {};
const lsGet = (k) => { try { const v = localStorage.getItem(k); if (v !== null) return v; } catch {} return _memStore[k] ?? null; };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} _memStore[k] = v; return true; };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch {} delete _memStore[k]; };

const saveSession  = (data) => lsSet(STORAGE_KEY, JSON.stringify(data));
const loadSession  = () => { const r = lsGet(STORAGE_KEY); return r ? JSON.parse(r) : null; };
const clearSession = () => lsDel(STORAGE_KEY);

const WNOTES_KEY    = "taleforge-worldnotes";
const loadWorldNotes = () => { const r = lsGet(WNOTES_KEY); return r ? JSON.parse(r) : []; };
const saveWorldNotes = (n) => lsSet(WNOTES_KEY, JSON.stringify(n));
const clearWorldNotes = () => lsDel(WNOTES_KEY);

const QUESTS_KEY    = "taleforge-quests";
const loadQuests    = () => { const r = lsGet(QUESTS_KEY); return r ? JSON.parse(r) : []; };
const saveQuests    = (q) => lsSet(QUESTS_KEY, JSON.stringify(q));
const clearQuests   = () => lsDel(QUESTS_KEY);

const ATMOSPHERE_KEY  = "taleforge-atmosphere";
const loadAtmosphere  = () => { const r = lsGet(ATMOSPHERE_KEY); return r ? JSON.parse(r) : { weather:"none", timeOfDay:"none" }; };
const saveAtmosphere  = (a) => lsSet(ATMOSPHERE_KEY, JSON.stringify(a));
const clearAtmosphere = () => lsDel(ATMOSPHERE_KEY);

const NPC_KEY      = "taleforge-npcs";
const loadNPCs     = () => { const r = lsGet(NPC_KEY); return r ? JSON.parse(r) : []; };
const saveNPCs     = (n) => lsSet(NPC_KEY, JSON.stringify(n));
const clearNPCs    = () => lsDel(NPC_KEY);

const PAST_LIFE_KEY  = "taleforge-pastlife";
const loadPastLife   = () => { const r = lsGet(PAST_LIFE_KEY); return r ? JSON.parse(r) : null; };
const savePastLife   = (p) => lsSet(PAST_LIFE_KEY, JSON.stringify(p));
const clearPastLife  = () => lsDel(PAST_LIFE_KEY);

const EMOTION_KEY   = "taleforge-emotion";
const loadEmotion   = () => { const r = lsGet(EMOTION_KEY); return r ? JSON.parse(r) : null; };
const saveEmotion   = (e) => lsSet(EMOTION_KEY, JSON.stringify(e));
const clearEmotion  = () => lsDel(EMOTION_KEY);

const EMOTION_DEFS = [
  { id:"joy",        label:"기쁨",       icon:"😊", color:"#f1c40f" },
  { id:"anger",      label:"분노",       icon:"😠", color:"#e74c3c" },
  { id:"sadness",    label:"슬픔",       icon:"😢", color:"#3498db" },
  { id:"fear",       label:"두려움",     icon:"😨", color:"#9b59b6" },
  { id:"disgust",    label:"불쾌",       icon:"😒", color:"#7f8c8d" },
  { id:"surprise",   label:"놀람",       icon:"😲", color:"#e67e22" },
  { id:"affection",  label:"애정",       icon:"🥰", color:"#e91e63" },
  { id:"longing",    label:"그리움",     icon:"🌙", color:"#5c6bc0" },
  { id:"anxiety",    label:"불안",       icon:"😰", color:"#78909c" },
  { id:"calm",       label:"평온",       icon:"😌", color:"#26a69a" },
  { id:"excited",    label:"설렘",       icon:"✨", color:"#ff8f00" },
  { id:"suspicious", label:"경계",       icon:"🤨", color:"#795548" },
  { id:"guilty",     label:"죄책감",     icon:"😞", color:"#546e7a" },
  { id:"proud",      label:"자부심",     icon:"😤", color:"#c0392b" },
  { id:"confused",   label:"혼란",       icon:"😵", color:"#8d6e63" },
];

// ══════════════════════════════════════════════════════
//  스킬 시스템
// ══════════════════════════════════════════════════════
const SKILLS_KEY     = "taleforge-skills";
const SKILL_SP_KEY   = "taleforge-skillsp";
const loadSkills     = () => { const r = lsGet(SKILLS_KEY); return r ? JSON.parse(r) : {}; };
const saveSkills     = (s) => lsSet(SKILLS_KEY, JSON.stringify(s));
const clearSkills    = () => lsDel(SKILLS_KEY);
const loadSkillSP    = () => { const r = lsGet(SKILL_SP_KEY); return r ? parseInt(r,10) : 0; };
const saveSkillSP    = (n) => lsSet(SKILL_SP_KEY, String(n));
const clearSkillSP   = () => lsDel(SKILL_SP_KEY);

// ══════════════════════════════════════════════════════
//  골드 & 인벤토리 시스템
// ══════════════════════════════════════════════════════
const GOLD_KEY       = "taleforge-gold";
const INVENTORY_KEY  = "taleforge-inventory";
const loadGold       = () => { const r = lsGet(GOLD_KEY); return r ? parseInt(r, 10) : 0; };
const saveGold       = (n) => lsSet(GOLD_KEY, String(n));
const clearGold      = () => lsDel(GOLD_KEY);
const loadInventory  = () => { const r = lsGet(INVENTORY_KEY); return r ? JSON.parse(r) : []; };
const saveInventory  = (inv) => lsSet(INVENTORY_KEY, JSON.stringify(inv));
const clearInventory = () => lsDel(INVENTORY_KEY);

// ══════════════════════════════════════════════════════
//  클리어 보상 시스템 (시나리오 클리어 시 영구 아이템/스킬)
// ══════════════════════════════════════════════════════
const CLEAR_REWARDS_KEY   = "taleforge-clearrewards";
const loadClearRewards    = () => { const r = lsGet(CLEAR_REWARDS_KEY); return r ? JSON.parse(r) : []; };
const saveClearRewards    = (r) => lsSet(CLEAR_REWARDS_KEY, JSON.stringify(r));

// 시나리오별 클리어 특수 아이템 (10개씩)
const CLEAR_ITEMS = {
  medieval: [
    { id:"ci_mf_hero_crest",    name:"왕국 영웅 휘장",    icon:"⚜️",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ ldr:6, rep:5, fear:3 },                 desc:"왕국을 구한 영웅만이 달 수 있는 휘장. 통솔·평판·공포 강화.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_dragon_fang",   name:"용의 이빨 목걸이",  icon:"🐲",  rarity:"legendary", type:"equip",  slot:"accessory", effects:{ str:8, mgc:6, crit:5 },                 desc:"드래곤의 이빨로 만든 목걸이. 강력한 전투력을 부여한다.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_ancient_crown", name:"고대 왕관 파편",     icon:"👑",  rarity:"legendary", type:"equip",  slot:"accessory", effects:{ ldr:10, int:6, wil:5 },                 desc:"고대 왕국의 왕관 파편. 지도자의 기운을 발산한다.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_holy_water",    name:"성수 플라스크",      icon:"✨",  rarity:"rare",      type:"consume", effects:{ hp:50, fath:10, crse:-15 },                              desc:"신전에서 봉인된 성수. HP 회복과 저주 정화 효과.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_rune_blade",    name:"룬 문자 단검",       icon:"🗡️", rarity:"rare",      type:"equip",  slot:"weapon",    effects:{ str:10, crit:8, mgc:4 },                desc:"마법 룬이 새겨진 단검. 마법과 물리 양면의 위력.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_knight_shield", name:"기사단 방패",         icon:"🛡️", rarity:"rare",      type:"equip",  slot:"armor",     effects:{ end:12, hp:10, wil:4 },                 desc:"왕국 최정예 기사단의 방패. 견고한 방어력.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_fate_scroll",   name:"운명의 두루마리",    icon:"📜",  rarity:"legendary", type:"consume", effects:{ luk:20, wil:8, per:6 },                                  desc:"예언이 적힌 두루마리. 사용 시 운명이 요동친다.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_elixir",        name:"불로 영약",          icon:"🧪",  rarity:"legendary", type:"consume", effects:{ hp:60, mp:40, end:10, wil:8 },                           desc:"전설 속 불로장생의 영약. 막대한 회복 효과.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_spirit_ring",   name:"정령의 반지",         icon:"💍",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ mgc:8, per:6, luk:5 },                  desc:"숲의 정령이 깃든 반지. 마법과 감각을 예리하게 한다.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_war_medal",     name:"전쟁 훈장",           icon:"🎖️", rarity:"uncommon",  type:"equip",  slot:"accessory", effects:{ str:4, end:4, rep:6 },                  desc:"전장에서의 공훈을 기리는 훈장. 평판과 전투력 향상.", clearDesc:"중세 판타지 클리어 보상" },
  ],
  wuxia: [
    { id:"ci_wx_jade_token",    name:"무림맹 옥패",         icon:"🧧",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ rep:8, ldr:5, neg:4 },                  desc:"무림맹주가 하사한 옥패. 강호에서 절대적인 신분증.", clearDesc:"무협 강호 클리어 보상" },
    { id:"ci_wx_divine_sword",  name:"천하제일 신검",        icon:"⚔️", rarity:"legendary", type:"equip",  slot:"weapon",    effects:{ str:12, crit:10, agi:6 },               desc:"천하에 하나뿐인 신검. 사용자의 무공을 극한까지 끌어올린다.", clearDesc:"무협 강호 클리어 보상" },
    { id:"ci_wx_inner_pill",    name:"내단 응결환",          icon:"💊",  rarity:"legendary", type:"consume", effects:{ mp:60, str:10, wil:8, cal:6 },                           desc:"수십 년 내공이 응결된 환약. 복용 시 내공이 폭발적으로 증가.", clearDesc:"무협 강호 클리어 보상" },
    { id:"ci_wx_ghost_robe",    name:"귀신 도포",            icon:"👘",  rarity:"rare",      type:"equip",  slot:"armor",     effects:{ agi:10, disg:8, cal:4 },                desc:"귀신처럼 자취를 감추는 도포. 움직임이 바람처럼 가벼워진다.", clearDesc:"무협 강호 클리어 보상" },
    { id:"ci_wx_blood_ginseng", name:"천년 혈삼",            icon:"🌿",  rarity:"rare",      type:"consume", effects:{ hp:40, mp:30, end:8, regen:6 },                          desc:"천 년 묵은 혈삼. 심각한 부상도 빠르게 회복시킨다.", clearDesc:"무협 강호 클리어 보상" },
    { id:"ci_wx_poison_ring",   name:"독뱀 반지",            icon:"🐍",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ pstx:10, crit:6, fear:4 },              desc:"독을 머금은 뱀 형상의 반지. 공격에 독 효과 부여.", clearDesc:"무협 강호 클리어 보상" },
    { id:"ci_wx_manual_frag",   name:"태극 비급 파편",       icon:"📖",  rarity:"legendary", type:"equip",  slot:"accessory", effects:{ mp:10, cal:8, wil:7, per:5 },           desc:"태극 신공 비급의 파편. 내공 운용에 심오한 원리를 깨닫게 한다.", clearDesc:"무협 강호 클리어 보상" },
    { id:"ci_wx_hero_seal",     name:"협객 인장",            icon:"🏯",  rarity:"uncommon",  type:"equip",  slot:"accessory", effects:{ rep:6, trst:5, cha:4 },                 desc:"강호에서 의협으로 이름난 자의 인장. 신뢰와 명성을 높인다.", clearDesc:"무협 강호 클리어 보상" },
    { id:"ci_wx_tiger_claw",    name:"백호 손톱 부적",       icon:"🐯",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ str:7, end:5, fear:5 },                 desc:"백호의 손톱으로 만든 부적. 전투에서 맹수의 기운을 발산.", clearDesc:"무협 강호 클리어 보상" },
    { id:"ci_wx_crane_fan",     name:"학선 (鶴扇)",          icon:"🪭",  rarity:"uncommon",  type:"equip",  slot:"weapon",    effects:{ agi:6, cal:5, disg:5 },                 desc:"학의 깃털로 만든 부채. 경공과 위장에 탁월한 효과.", clearDesc:"무협 강호 클리어 보상" },
  ],
  cyberpunk: [
    { id:"ci_cp_neuro_chip",    name:"최상급 신경 칩",       icon:"🧠",  rarity:"legendary", type:"equip",  slot:"accessory", effects:{ int:10, per:8, agi:5 },                 desc:"군사용 신경 칩. 모든 반응과 판단이 한 차원 빨라진다.", clearDesc:"사이버펑크 클리어 보상" },
    { id:"ci_cp_phantom_blade", name:"모노필라멘트 와이어",  icon:"⚡",  rarity:"rare",      type:"equip",  slot:"weapon",    effects:{ str:8, crit:12, agi:6 },                desc:"보이지 않는 극세 와이어 무기. 치명적인 절삭력.", clearDesc:"사이버펑크 클리어 보상" },
    { id:"ci_cp_ghost_cloak",   name:"광학 미채 외투",       icon:"🌫️", rarity:"legendary", type:"equip",  slot:"armor",     effects:{ disg:12, agi:7, per:5 },                desc:"빛을 굴절시켜 완전 투명화. 은신·잠입의 최강 장비.", clearDesc:"사이버펑크 클리어 보상" },
    { id:"ci_cp_stim_pack",     name:"군용 스팀팩",          icon:"💉",  rarity:"rare",      type:"consume", effects:{ hp:50, str:8, agi:8, ftg:-20 },                          desc:"특수 부대용 전투 촉진제. 즉각적인 신체 능력 극대화.", clearDesc:"사이버펑크 클리어 보상" },
    { id:"ci_cp_black_icepick", name:"블랙 아이스픽",        icon:"💾",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ int:8, mgc:6, fear:5 },                 desc:"전설의 해커 도구. 어떤 시스템도 뚫을 수 있다는 소문.", clearDesc:"사이버펑크 클리어 보상" },
    { id:"ci_cp_corpo_badge",   name:"특급 기업 배지",       icon:"🏢",  rarity:"uncommon",  type:"equip",  slot:"accessory", effects:{ neg:6, rep:5, disg:4 },                 desc:"최고 등급 기업 신분증. 대부분의 시설에 접근 가능.", clearDesc:"사이버펑크 클리어 보상" },
    { id:"ci_cp_syn_blood",     name:"합성 혈액 팩",         icon:"🩸",  rarity:"rare",      type:"consume", effects:{ hp:45, end:8, pstx:6 },                                  desc:"나노봇이 포함된 합성 혈액. 빠른 상처 봉합과 독소 중화.", clearDesc:"사이버펑크 클리어 보상" },
    { id:"ci_cp_echo_implant",  name:"에코 임플란트",        icon:"👁️", rarity:"rare",      type:"equip",  slot:"accessory", effects:{ per:10, intn:6, cal:4 },                desc:"주변 360도를 탐지하는 감각 임플란트. 매복·기습이 불가능해진다.", clearDesc:"사이버펑크 클리어 보상" },
    { id:"ci_cp_ai_core",       name:"탈취한 AI 코어",       icon:"🤖",  rarity:"legendary", type:"equip",  slot:"accessory", effects:{ int:12, mgc:8, wil:5 },                 desc:"자의식이 깃든 AI 코어. 착용자의 지능과 판단력을 크게 강화.", clearDesc:"사이버펑크 클리어 보상" },
    { id:"ci_cp_rebel_patch",   name:"반란군 패치",          icon:"✊",  rarity:"uncommon",  type:"equip",  slot:"accessory", effects:{ ldr:5, wil:5, rep:4, fear:3 },          desc:"반란을 이끈 자들의 표식. 하층민들에게 강한 카리스마를 발휘.", clearDesc:"사이버펑크 클리어 보상" },
  ],
  apocalypse: [
    { id:"ci_ap_survivor_coat",  name:"생존자의 코트",         icon:"🧥",  rarity:"rare",      type:"equip",  slot:"armor",     effects:{ end:12, pstx:8, agi:5 },                desc:"폐허를 살아남은 자의 코트. 방사능·독에 강한 저항력.", clearDesc:"아포칼립스 클리어 보상" },
    { id:"ci_ap_scrap_blade",    name:"고철 대검",             icon:"🗡️", rarity:"uncommon",  type:"equip",  slot:"weapon",    effects:{ str:10, crit:6 },                        desc:"폐허에서 주워 만든 거대한 고철 검. 투박하지만 파괴력이 크다.", clearDesc:"아포칼립스 클리어 보상" },
    { id:"ci_ap_vault_key",      name:"비밀 금고 열쇠",        icon:"🗝️", rarity:"legendary", type:"equip",  slot:"accessory", effects:{ luk:15, int:8, per:6 },                 desc:"전쟁 이전 문명의 비밀 금고 열쇠. 숨겨진 자원에 접근 가능.", clearDesc:"아포칼립스 클리어 보상" },
    { id:"ci_ap_mutagen",        name:"변이 혈청",             icon:"🧬",  rarity:"legendary", type:"consume", effects:{ str:10, end:10, mgc:8, mad:5 },                          desc:"방사능으로 변이된 혈청. 신체를 극단적으로 강화하지만 부작용이 있다.", clearDesc:"아포칼립스 클리어 보상" },
    { id:"ci_ap_ration_pack",    name:"비상 식량 팩",          icon:"🥫",  rarity:"common",    type:"consume", effects:{ hp:30, end:8, ftg:-20 },                                 desc:"전쟁 전 비축된 비상 식량. 생존에 필요한 모든 것이 들어있다.", clearDesc:"아포칼립스 클리어 보상" },
    { id:"ci_ap_signal_jammer",  name:"신호 교란기",           icon:"📡",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ disg:10, per:6, int:5 },                desc:"적의 탐지 장비를 교란하는 장치. 은신과 잠입에 유용하다.", clearDesc:"아포칼립스 클리어 보상" },
    { id:"ci_ap_wasteland_map",  name:"황무지 생존 지도",      icon:"🗺️", rarity:"rare",      type:"equip",  slot:"accessory", effects:{ luk:8, per:10, agi:4 },                 desc:"살아남은 자들이 손으로 그린 지도. 안전한 루트와 위험 구역이 표시되어 있다.", clearDesc:"아포칼립스 클리어 보상" },
    { id:"ci_ap_fallout_armor",  name:"방사능 방호복",         icon:"☢️",  rarity:"rare",      type:"equip",  slot:"armor",     effects:{ end:10, pstx:12, wil:4 },               desc:"방사능 피해를 완전히 차단하는 특수 방호복.", clearDesc:"아포칼립스 클리어 보상" },
    { id:"ci_ap_emp_grenade",    name:"EMP 수류탄",            icon:"💣",  rarity:"rare",      type:"consume", effects:{ int:6, fear:8, agi:4 },                                  desc:"전자기 펄스로 기계 적을 순간 마비시키는 수류탄.", clearDesc:"아포칼립스 클리어 보상" },
    { id:"ci_ap_last_beacon",    name:"마지막 신호탄",         icon:"🔦",  rarity:"legendary", type:"equip",  slot:"accessory", effects:{ rep:20, ldr:10, trst:8 },                desc:"문명 이전의 빛. 절망 속에서 희망을 밝히는 신호탄.", clearDesc:"아포칼립스 클리어 보상" },
  ],
  mythology: [
    { id:"ci_my_olympus_spear",  name:"올림포스 신창",         icon:"⚡",  rarity:"legendary", type:"equip",  slot:"weapon",    effects:{ str:14, mgc:10, crit:8, fear:6 },       desc:"신들의 산에서 내려온 창. 번개를 다루는 신성한 무기.", clearDesc:"신화 세계관 클리어 보상" },
    { id:"ci_my_ambrosia",       name:"암브로시아",            icon:"🏺",  rarity:"legendary", type:"consume", effects:{ hp:80, mp:60, end:15, wil:10 },                          desc:"신들의 음식. 인간이 먹으면 일시적으로 신에 가까운 능력을 얻는다.", clearDesc:"신화 세계관 클리어 보상" },
    { id:"ci_my_fate_thread",    name:"운명의 실",             icon:"🧵",  rarity:"legendary", type:"equip",  slot:"accessory", effects:{ luk:20, per:12, wil:8 },                desc:"운명의 여신이 자아낸 실. 사용자의 운명을 미세하게 조작한다.", clearDesc:"신화 세계관 클리어 보상" },
    { id:"ci_my_hero_shield",    name:"영웅의 방패",           icon:"🛡️", rarity:"rare",      type:"equip",  slot:"armor",     effects:{ end:14, wil:10, fath:6 },               desc:"전설의 영웅이 사용하던 방패. 신성한 가호가 깃들어 있다.", clearDesc:"신화 세계관 클리어 보상" },
    { id:"ci_my_oracle_ring",    name:"신탁의 반지",           icon:"💍",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ per:12, int:10, luk:8 },                desc:"신의 말씀을 전하는 반지. 착용자에게 예언의 단편이 보인다.", clearDesc:"신화 세계관 클리어 보상" },
    { id:"ci_my_titan_bone",     name:"티탄의 뼈 부적",        icon:"💀",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ str:10, end:10, fear:8 },               desc:"태초의 거인 티탄의 뼈로 만든 부적. 압도적인 기세를 발산한다.", clearDesc:"신화 세계관 클리어 보상" },
    { id:"ci_my_hades_coin",     name:"저승사자의 동전",       icon:"🪙",  rarity:"legendary", type:"equip",  slot:"accessory", effects:{ fear:15, mgc:10, crse:8, hp:10 },       desc:"죽음의 신과 거래할 때 쓰는 동전. 죽음을 한 번 미룰 수 있다.", clearDesc:"신화 세계관 클리어 보상" },
    { id:"ci_my_chaos_seed",     name:"카오스의 씨앗",         icon:"🌀",  rarity:"legendary", type:"consume", effects:{ mgc:15, luk:15, mad:10, wil:-5 },                        desc:"세계의 시작인 혼돈에서 온 씨앗. 예측 불가능한 힘이 폭발한다.", clearDesc:"신화 세계관 클리어 보상" },
    { id:"ci_my_phoenix_feather",name:"불사조의 깃털",         icon:"🔥",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ hp:15, regen:10, wil:8 },                desc:"불사조에게서 얻은 깃털. 착용자의 생명력을 강화한다.", clearDesc:"신화 세계관 클리어 보상" },
    { id:"ci_my_divine_seal",    name:"신성 봉인 인장",        icon:"⚜️",  rarity:"uncommon",  type:"equip",  slot:"accessory", effects:{ fath:8, wil:6, rep:5 },                 desc:"신이 내린 봉인의 인장. 악한 존재를 억제하는 힘이 있다.", clearDesc:"신화 세계관 클리어 보상" },
  ],
  steampunk: [
    { id:"ci_sp_gear_heart",     name:"기계 심장",             icon:"⚙️",  rarity:"legendary", type:"equip",  slot:"accessory", effects:{ end:12, regen:10, int:8, agi:5 },        desc:"증기 동력 기계 심장. 신체 능력을 지속적으로 강화한다.", clearDesc:"스팀펑크 클리어 보상" },
    { id:"ci_sp_aether_gun",     name:"에테르 권총",           icon:"🔫",  rarity:"rare",      type:"equip",  slot:"weapon",    effects:{ str:8, crit:12, int:6 },                 desc:"에테르 에너지를 탄환으로 발사하는 권총. 마법과 기술이 결합된 무기.", clearDesc:"스팀펑크 클리어 보상" },
    { id:"ci_sp_inventors_goggles",name:"발명가의 고글",       icon:"🥽",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ per:12, int:10, crit:6 },                desc:"증기 구동 분석 고글. 대상의 약점과 구조를 파악한다.", clearDesc:"스팀펑크 클리어 보상" },
    { id:"ci_sp_lightning_rod",  name:"번개 지팡이",           icon:"⚡",  rarity:"legendary", type:"equip",  slot:"weapon",    effects:{ mgc:12, str:8, crit:10 },                desc:"번개를 모아 방전하는 지팡이. 전도성 적에게 치명적.", clearDesc:"스팀펑크 클리어 보상" },
    { id:"ci_sp_mechanical_arm", name:"기계 의수",             icon:"🦾",  rarity:"rare",      type:"equip",  slot:"armor",     effects:{ str:14, crit:8, end:5 },                 desc:"증기 동력 기계 팔. 인간의 한계를 넘는 악력과 정밀성.", clearDesc:"스팀펑크 클리어 보상" },
    { id:"ci_sp_cogwork_compass",name:"톱니 나침반",           icon:"🧭",  rarity:"uncommon",  type:"equip",  slot:"accessory", effects:{ per:8, luk:6, agi:4 },                   desc:"어떤 목적지든 찾아주는 마법 나침반. 황동 톱니바퀴로 구동된다.", clearDesc:"스팀펑크 클리어 보상" },
    { id:"ci_sp_alchemist_flask",name:"연금술사의 플라스크",   icon:"🧪",  rarity:"rare",      type:"consume", effects:{ hp:40, mp:30, int:8, regen:6 },                          desc:"만능 연금술 플라스크. 부상 회복과 능력 향상에 모두 사용 가능.", clearDesc:"스팀펑크 클리어 보상" },
    { id:"ci_sp_clockwork_puppet",name:"태엽 인형",            icon:"🤖",  rarity:"legendary", type:"equip",  slot:"accessory", effects:{ ldr:10, fear:6, int:8 },                 desc:"자율적으로 움직이는 태엽 인형 부하. 명령에 충실히 따른다.", clearDesc:"스팀펑크 클리어 보상" },
    { id:"ci_sp_steam_core",     name:"증기 코어",             icon:"💨",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ end:10, str:6, agi:6, regen:5 },         desc:"고압 증기 에너지 코어. 착용자의 체력과 움직임을 강화한다.", clearDesc:"스팀펑크 클리어 보상" },
    { id:"ci_sp_noble_monocle",  name:"귀족 모노클",           icon:"🔎",  rarity:"uncommon",  type:"equip",  slot:"accessory", effects:{ neg:8, rep:6, cha:5 },                   desc:"상류층을 위한 고급 단안경. 착용자의 사회적 지위를 높여 보인다.", clearDesc:"스팀펑크 클리어 보상" },
  ],
};

// 시나리오별 클리어 특수 스킬 (10개씩)
const CLEAR_SKILLS = {
  medieval: [
    { id:"cs_mf_dragon_roar",   type:"active",  name:"용의 포효",     icon:"🐲", rarity:"legendary", mpCost:35, req:{}, scenario:"medieval", desc:"드래곤의 기운으로 포효. 범위 내 모든 적의 사기를 꺾고 공포를 심는다.",            aiHint:"용의 포효 발동! 거대한 용의 울부짖음이 전장을 뒤덮어 적들을 공포에 빠뜨립니다.", clearDesc:"중세 판타지 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_mf_holy_barrier",  type:"active",  name:"성광 결계",     icon:"✨", rarity:"legendary", mpCost:40, req:{}, scenario:"medieval", desc:"신성한 빛으로 결계를 펼쳐 한 턴간 모든 피해를 차단한다.",                       aiHint:"성광 결계 발동! 눈부신 빛의 방벽이 캐릭터를 완전히 감쌉니다.", clearDesc:"중세 판타지 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_mf_royal_decree",  type:"active",  name:"왕명 선포",     icon:"👑", rarity:"rare",      mpCost:20, req:{}, scenario:"medieval", desc:"왕의 이름으로 명령을 내려 NPC들의 행동을 통제하거나 협력을 이끌어낸다.",          aiHint:"왕명 선포 발동! 왕실의 권위가 주변 인물들을 압도합니다.", clearDesc:"중세 판타지 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_mf_rune_burst",    type:"active",  name:"룬 폭발",       icon:"💥", rarity:"rare",      mpCost:28, req:{}, scenario:"medieval", desc:"무기에 새긴 룬을 폭발시켜 강력한 마법 파동을 일으킨다.",                        aiHint:"룬 폭발 발동! 무기에서 룬 마법이 폭발하며 강렬한 파동이 쏟아집니다.", clearDesc:"중세 판타지 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_mf_undying_oath",  type:"passive", name:"기사의 맹세",   icon:"⚔️", rarity:"rare",      mpCost:0,  req:{}, scenario:"medieval", desc:"죽음에 맞서는 기사 정신. HP 25% 이하 시 STR·END +15 자동 강화.",               aiHint:"기사의 맹세 발동! 죽음을 불사하는 기사의 의지가 불타오릅니다.", clearDesc:"중세 판타지 클리어 보상", condition:"hp_low", conditionDesc:"HP 25% 이하", statBoost:{str:15, end:15} },
    { id:"cs_mf_realm_sight",   type:"passive", name:"세계의 눈",     icon:"👁️", rarity:"rare",      mpCost:0,  req:{}, scenario:"medieval", desc:"세계를 꿰뚫어 보는 눈. 모든 판정 PER·INT +10 상시 보너스.",                    aiHint:"세계의 눈 발동! 숨겨진 진실이 눈앞에 펼쳐집니다.", clearDesc:"중세 판타지 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{per:10, int:10} },
    { id:"cs_mf_legend_aura",   type:"passive", name:"전설의 기운",   icon:"⭐", rarity:"legendary", mpCost:0,  req:{}, scenario:"medieval", desc:"전설로 남은 영웅의 기운. REP·LDR +12 상시 효과. NPC들이 자연스레 따른다.",       aiHint:"전설의 기운 발동! 강렬한 영웅의 기운이 주변을 압도합니다.", clearDesc:"중세 판타지 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{rep:12, ldr:12} },
    { id:"cs_mf_fate_reversal", type:"event",   name:"운명 역전",     icon:"🔮", rarity:"legendary", mpCost:0,  req:{}, scenario:"medieval", desc:"한 번의 치명적 실패를 완전한 성공으로 뒤바꾼다. 1회 한정.",                    aiHint:"운명 역전 발동! 불가능해 보였던 순간, 기적이 일어납니다!", clearDesc:"중세 판타지 클리어 보상", condition:"crit_fail", conditionDesc:"대실패 시 1회 전환", statBoost:{} },
    { id:"cs_mf_ancient_power", type:"event",   name:"고대의 힘",     icon:"🏺", rarity:"legendary", mpCost:30, req:{}, scenario:"medieval", desc:"잠들어 있던 고대 마법의 힘을 해방. 모든 스탯 +20, 1턴간 최강 상태.",            aiHint:"고대의 힘 해방! 고대 문명의 마법이 폭발적으로 각성합니다.", clearDesc:"중세 판타지 클리어 보상", condition:"activate", conditionDesc:"직접 발동", statBoost:{} },
    { id:"cs_mf_kingdom_will",  type:"passive", name:"왕국의 의지",   icon:"🏰", rarity:"rare",      mpCost:0,  req:{}, scenario:"medieval", desc:"왕국을 지켜낸 자의 의지. WIL·CAL +10 상시 강화. 공포·저주 저항 강화.",          aiHint:"왕국의 의지 발동! 왕국을 수호한 강인한 의지가 빛납니다.", clearDesc:"중세 판타지 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{wil:10, cal:10} },
  ],
  wuxia: [
    { id:"cs_wx_heaven_slash",  type:"active",  name:"천검일식",      icon:"🌟", rarity:"legendary", mpCost:45, req:{}, scenario:"wuxia", desc:"하늘을 가르는 검기를 방출. 천지를 뒤흔드는 절대 일격.",                          aiHint:"천검일식 발동! 눈부신 검기가 하늘을 가르며 내리칩니다!", clearDesc:"무협 강호 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_wx_void_step",     type:"active",  name:"무극보법",      icon:"🌀", rarity:"rare",      mpCost:20, req:{}, scenario:"wuxia", desc:"허공을 걷는 보법. 어떠한 물리 공격도 회피하는 경지.",                            aiHint:"무극보법 발동! 바람처럼 공격을 피하며 허공을 걷습니다.", clearDesc:"무협 강호 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_wx_qi_explosion",  type:"active",  name:"내공 대폭발",   icon:"💨", rarity:"legendary", mpCost:50, req:{}, scenario:"wuxia", desc:"수십 년 내공을 한꺼번에 방출. 반경 내 모든 것을 날려버리는 폭발적 기파.",        aiHint:"내공 대폭발 발동! 수십 년 내공이 한꺼번에 해방됩니다!", clearDesc:"무협 강호 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_wx_phoenix_rise",  type:"event",   name:"불사조 환생",   icon:"🔥", rarity:"legendary", mpCost:0,  req:{}, scenario:"wuxia", desc:"죽음의 순간, 불사조의 기운으로 HP 완전 회복. 1회 한정 발동.",                    aiHint:"불사조 환생 발동! 죽음의 불꽃 속에서 다시 살아납니다!", clearDesc:"무협 강호 클리어 보상", condition:"death", conditionDesc:"사망 직전 1회", statBoost:{} },
    { id:"cs_wx_river_sense",   type:"passive", name:"강호의 기감",   icon:"🌊", rarity:"rare",      mpCost:0,  req:{}, scenario:"wuxia", desc:"강호 수십 년 경험에서 오는 육감. PER·INTN +12 상시 효과.",                      aiHint:"강호의 기감 발동! 오랜 강호 경험의 직감이 위험을 미리 감지합니다.", clearDesc:"무협 강호 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{per:12, intn:12} },
    { id:"cs_wx_iron_curtain",  type:"passive", name:"금강장 방어",   icon:"🪨", rarity:"rare",      mpCost:0,  req:{}, scenario:"wuxia", desc:"금강불괴의 경지. 모든 피해 15% 자동 감소. END·HP 최대치 상시 강화.",              aiHint:"금강장 방어 발동! 금강불괴의 경지가 피해를 흡수합니다.", clearDesc:"무협 강호 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{end:8, hp:5} },
    { id:"cs_wx_wulin_prestige",type:"passive", name:"무림 위명",     icon:"🏅", rarity:"rare",      mpCost:0,  req:{}, scenario:"wuxia", desc:"강호에 이름을 날린 무림인의 위엄. REP·FEAR +12 상시 효과.",                      aiHint:"무림 위명 발동! 강호의 이름이 적들을 압도합니다.", clearDesc:"무협 강호 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{rep:12, fear:12} },
    { id:"cs_wx_poison_immunity",type:"passive",name:"백독불침",      icon:"🧪", rarity:"rare",      mpCost:0,  req:{}, scenario:"wuxia", desc:"백 가지 독을 이겨낸 신체. PSTX +20 상시 효과. 독·저주에 완전 면역.",              aiHint:"백독불침 발동! 어떤 독도 이 몸을 해치지 못합니다.", clearDesc:"무협 강호 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{pstx:20} },
    { id:"cs_wx_sword_heart",   type:"event",   name:"검심(劍心)",    icon:"💎", rarity:"legendary", mpCost:40, req:{}, scenario:"wuxia", desc:"검과 하나가 되는 경지. 1회 발동 시 모든 공격 대성공, 적의 방어 무효화.",          aiHint:"검심 발동! 검과 마음이 하나가 되어 완벽한 일격을 날립니다.", clearDesc:"무협 강호 클리어 보상", condition:"activate", conditionDesc:"직접 발동", statBoost:{} },
    { id:"cs_wx_natural_qi",    type:"passive", name:"자연 내공",     icon:"☯️", rarity:"rare",      mpCost:0,  req:{}, scenario:"wuxia", desc:"자연과 하나된 내공 순환. 3턴마다 MP +15 자동 회복. CAL +8 상시.",               aiHint:"자연 내공 발동! 천지의 기운이 자연스럽게 몸속을 순환합니다.", clearDesc:"무협 강호 클리어 보상", condition:"every3turn", conditionDesc:"3턴마다 MP 회복", statBoost:{cal:8} },
  ],
  cyberpunk: [
    { id:"cs_cp_god_protocol",  type:"active",  name:"갓 프로토콜",   icon:"🌐", rarity:"legendary", mpCost:50, req:{}, scenario:"cyberpunk", desc:"도시 전체 네트워크를 장악. 모든 전자 기기와 임플란트를 일시 제어.",             aiHint:"갓 프로토콜 발동! 모든 네트워크가 순식간에 장악됩니다!", clearDesc:"사이버펑크 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_cp_chrome_reflex", type:"active",  name:"크롬 반사",     icon:"⚙️", rarity:"rare",      mpCost:18, req:{}, scenario:"cyberpunk", desc:"강화 사이버네틱의 반사 신경을 최대로 가동. 이번 턴 모든 공격 회피.",           aiHint:"크롬 반사 발동! 기계적인 반사로 모든 공격을 피해냅니다.", clearDesc:"사이버펑크 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_cp_neural_storm2", type:"active",  name:"초신경폭풍",    icon:"🧠", rarity:"legendary", mpCost:45, req:{}, scenario:"cyberpunk", desc:"진화된 해킹. 반경 내 모든 적 임플란트를 동시에 폭주시킨다.",                   aiHint:"초신경폭풍 발동! 강화된 해킹 파동이 주변 모든 임플란트를 터뜨립니다!", clearDesc:"사이버펑크 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_cp_data_ghost",    type:"active",  name:"데이터 유령",   icon:"👾", rarity:"rare",      mpCost:25, req:{}, scenario:"cyberpunk", desc:"자신의 존재를 디지털로 분산. 일시적으로 추적·탐지 완전 불가.",                  aiHint:"데이터 유령 발동! 존재가 데이터로 분산되어 완전히 사라집니다.", clearDesc:"사이버펑크 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_cp_corp_override", type:"event",   name:"기업 오버라이드",icon:"🏢", rarity:"legendary", mpCost:0,  req:{}, scenario:"cyberpunk", desc:"빼앗은 기업 권한으로 1회 불가능한 요청을 가능하게 만든다.",                   aiHint:"기업 오버라이드 발동! 최상위 기업 권한이 모든 장벽을 무너뜨립니다.", clearDesc:"사이버펑크 클리어 보상", condition:"activate", conditionDesc:"직접 발동", statBoost:{} },
    { id:"cs_cp_street_legend2",type:"passive", name:"전설의 스트리터",icon:"🌃", rarity:"rare",      mpCost:0,  req:{}, scenario:"cyberpunk", desc:"도시 하층민의 신화. CHA·REP +12 상시 효과. 하층민 NPC가 무조건 협력.",         aiHint:"전설의 스트리터 발동! 도시 하층민들이 전설을 알아보고 따릅니다.", clearDesc:"사이버펑크 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{cha:12, rep:12} },
    { id:"cs_cp_overclock_max", type:"passive", name:"최대 오버클럭", icon:"⚡", rarity:"rare",      mpCost:0,  req:{}, scenario:"cyberpunk", desc:"신체 임플란트 풀 오버클럭. STR·AGI·END +8 상시 강화.",                        aiHint:"최대 오버클럭 발동! 모든 임플란트가 한계를 넘어 가동됩니다.", clearDesc:"사이버펑크 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{str:8, agi:8, end:8} },
    { id:"cs_cp_deep_scan",     type:"passive", name:"딥 스캔",       icon:"👁️", rarity:"rare",      mpCost:0,  req:{}, scenario:"cyberpunk", desc:"감각 임플란트 최고 등급 업그레이드. PER·INTN +14 상시 효과.",                  aiHint:"딥 스캔 발동! 모든 정보가 선명하게 스캔됩니다.", clearDesc:"사이버펑크 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{per:14, intn:14} },
    { id:"cs_cp_ghost_mode",    type:"event",   name:"고스트 모드",   icon:"🌫️", rarity:"legendary", mpCost:30, req:{}, scenario:"cyberpunk", desc:"완전 투명화 + 전파 차단 + 발소리 소거. 2턴간 완벽 은신.",                    aiHint:"고스트 모드 발동! 완전한 투명화로 모든 탐지 수단을 무력화합니다.", clearDesc:"사이버펑크 클리어 보상", condition:"activate", conditionDesc:"직접 발동", statBoost:{} },
    { id:"cs_cp_iron_will",     type:"passive", name:"강철 정신",     icon:"🔩", rarity:"rare",      mpCost:0,  req:{}, scenario:"cyberpunk", desc:"사이버화된 정신. 해킹·공포·조종 완전 면역. WIL·MAD저항 +15.",               aiHint:"강철 정신 발동! 기계화된 의지가 모든 정신 공격을 차단합니다.", clearDesc:"사이버펑크 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{wil:15} },
  ],
  apocalypse: [
    { id:"cs_ap_last_stand2",   type:"active",  name:"최후의 항전",   icon:"🔫", rarity:"legendary", mpCost:0,  req:{}, scenario:"apocalypse", desc:"죽을 것 같은 상황에서 오히려 전투력이 폭발. HP가 낮을수록 STR·AGI·END +20.", aiHint:"최후의 항전 발동! 폐허의 생존자가 한계를 넘어 싸웁니다!", clearDesc:"아포칼립스 클리어 보상", condition:"hp_low", conditionDesc:"HP 25% 이하", statBoost:{str:20,agi:15,end:15} },
    { id:"cs_ap_survivor_will", type:"passive", name:"생존자의 의지", icon:"💪", rarity:"rare",      mpCost:0,  req:{}, scenario:"apocalypse", desc:"폐허를 살아남은 자의 의지. END·WIL +15 상시 강화. 굶주림·독·방사능 저항.", aiHint:"생존자의 의지 발동! 폐허의 의지가 모든 것을 견뎌냅니다.", clearDesc:"아포칼립스 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{end:15,wil:15} },
    { id:"cs_ap_scavenger",     type:"active",  name:"약탈자의 직감", icon:"🗺️", rarity:"rare",      mpCost:15, req:{}, scenario:"apocalypse", desc:"폐허에서 자원을 탐지. 주변 아이템 발견 확률 +50%, LUK +10.", aiHint:"약탈자의 직감 발동! 폐허 속 숨겨진 자원이 눈에 들어옵니다.", clearDesc:"아포칼립스 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_ap_rad_immunity",  type:"passive", name:"방사능 면역",   icon:"☢️", rarity:"rare",      mpCost:0,  req:{}, scenario:"apocalypse", desc:"변이가 진행된 몸. 방사능·독 완전 면역. END +10, HP 최대치 +15 상시.", aiHint:"방사능 면역 발동! 이미 변이된 몸은 방사능을 두려워하지 않습니다.", clearDesc:"아포칼립스 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{end:10,hp:5} },
    { id:"cs_ap_war_cry",       type:"active",  name:"전쟁의 절규",   icon:"😱", rarity:"legendary", mpCost:30, req:{}, scenario:"apocalypse", desc:"폐허의 절망을 절규로 바꾼다. 범위 내 적 FEAR -25, 아군 STR·END +10.", aiHint:"전쟁의 절규 발동! 폐허를 가르는 절규가 전장을 뒤흔듭니다!", clearDesc:"아포칼립스 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_ap_tunnel_vision", type:"passive", name:"생존 본능",     icon:"👁️", rarity:"rare",      mpCost:0,  req:{}, scenario:"apocalypse", desc:"위험을 미리 감지하는 생존 본능. PER +15, 기습 공격 당하지 않음.", aiHint:"생존 본능 발동! 폐허의 감각이 위험을 미리 감지합니다.", clearDesc:"아포칼립스 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{per:15} },
    { id:"cs_ap_hope_beacon",   type:"event",   name:"희망의 봉화",   icon:"🔦", rarity:"legendary", mpCost:40, req:{}, scenario:"apocalypse", desc:"절망 속에서 희망의 빛을 밝힌다. 아군 모두 HP 완전 회복. 한 번만 사용 가능.", aiHint:"희망의 봉화 발동! 폐허 속 빛이 모든 상처를 치유합니다.", clearDesc:"아포칼립스 클리어 보상", condition:"activate", conditionDesc:"직접 발동 1회", statBoost:{} },
    { id:"cs_ap_mutation",      type:"event",   name:"변이 폭발",     icon:"🧬", rarity:"legendary", mpCost:45, req:{}, scenario:"apocalypse", desc:"방사능 변이가 극적으로 폭발. STR·MGC·END +25, 2턴 지속. 부작용: HP -10.", aiHint:"변이 폭발 발동! 방사능이 몸을 완전히 장악하며 힘이 폭발합니다!", clearDesc:"아포칼립스 클리어 보상", condition:"activate", conditionDesc:"직접 발동", statBoost:{} },
    { id:"cs_ap_dead_reckoning",type:"passive", name:"폐허의 항법",   icon:"🧭", rarity:"rare",      mpCost:0,  req:{}, scenario:"apocalypse", desc:"지도 없이도 길을 찾는다. 탐색·탈출 판정 +20. 함정 자동 감지.", aiHint:"폐허의 항법 발동! 폐허 속에서도 길을 잃지 않습니다.", clearDesc:"아포칼립스 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{per:8} },
    { id:"cs_ap_warlord_aura",  type:"passive", name:"황무지 군주",   icon:"⚔️", rarity:"legendary", mpCost:0,  req:{}, scenario:"apocalypse", desc:"폐허의 지배자 기운. REP·LDR·FEAR +15 상시. 생존자 NPC들이 자발적으로 따른다.", aiHint:"황무지 군주의 기운! 폐허의 지배자가 모습을 드러냅니다.", clearDesc:"아포칼립스 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{rep:15,ldr:15,fear:15} },
  ],
  mythology: [
    { id:"cs_my_divine_wrath",  type:"active",  name:"신의 분노",     icon:"⚡", rarity:"legendary", mpCost:50, req:{}, scenario:"mythology", desc:"신들의 분노를 지상에 소환. 번개로 범위 공격. 신성 존재에 2배 피해.", aiHint:"신의 분노 발동! 하늘에서 번개가 내려쳐 대지를 불태웁니다!", clearDesc:"신화 세계관 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_my_fate_read",     type:"active",  name:"운명 독해",     icon:"🔮", rarity:"rare",      mpCost:20, req:{}, scenario:"mythology", desc:"운명의 실을 읽어 다음 판정 결과를 미리 안다. LUK +15, 다음 판정 대성공.", aiHint:"운명 독해 발동! 운명의 여신이 귓속에 속삭입니다.", clearDesc:"신화 세계관 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_my_immortal_body", type:"passive", name:"불멸의 육체",   icon:"✨", rarity:"legendary", mpCost:0,  req:{}, scenario:"mythology", desc:"신의 피가 섞인 몸. 모든 피해 20% 감소, HP 자동 회복 가속, 독·저주 면역.", aiHint:"불멸의 육체 발동! 신의 피가 상처를 봉합합니다.", clearDesc:"신화 세계관 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{end:12,fath:10} },
    { id:"cs_my_prophecy_eyes", type:"passive", name:"예언의 눈",     icon:"👁️", rarity:"rare",      mpCost:0,  req:{}, scenario:"mythology", desc:"운명을 미리 보는 눈. PER·INT +15 상시. 함정·매복·배신 자동 감지.", aiHint:"예언의 눈 발동! 아직 일어나지 않은 일이 보입니다.", clearDesc:"신화 세계관 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{per:15,int:15} },
    { id:"cs_my_titan_strength",type:"active",  name:"티탄의 힘",     icon:"💪", rarity:"legendary", mpCost:40, req:{}, scenario:"mythology", desc:"태초 거인의 힘을 일시 각성. STR·END +30, 주변 모든 것을 날려버린다.", aiHint:"티탄의 힘 발동! 대지가 흔들리며 태초의 힘이 해방됩니다!", clearDesc:"신화 세계관 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_my_divine_charm",  type:"passive", name:"신성의 카리스마",icon:"💛", rarity:"rare",      mpCost:0,  req:{}, scenario:"mythology", desc:"신의 후예가 지닌 카리스마. CHA·REP +15 상시. 신성한 존재들이 호감을 갖는다.", aiHint:"신성의 카리스마 발동! 주변이 자연스럽게 이 존재에게 이끌립니다.", clearDesc:"신화 세계관 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{cha:15,rep:15} },
    { id:"cs_my_chaos_unleash", type:"event",   name:"카오스 해방",   icon:"🌀", rarity:"legendary", mpCost:0,  req:{}, scenario:"mythology", desc:"세계의 혼돈을 해방. 1회 발동, 모든 스탯 +20, 3턴간 판정 결과 예측 불가.", aiHint:"카오스 해방! 세계의 질서가 무너지며 카오스가 흘러넘칩니다!", clearDesc:"신화 세계관 클리어 보상", condition:"activate", conditionDesc:"직접 발동 1회", statBoost:{} },
    { id:"cs_my_underworld_pact",type:"event",  name:"명계의 계약",   icon:"💀", rarity:"legendary", mpCost:35, req:{}, scenario:"mythology", desc:"죽음의 신과 계약. 죽음 직전 HP 완전 회복. 대신 수명이 줄어든다는 묘사.", aiHint:"명계의 계약 발동! 죽음의 신이 한 번의 죽음을 되돌려 줍니다.", clearDesc:"신화 세계관 클리어 보상", condition:"death", conditionDesc:"사망 직전 1회", statBoost:{} },
    { id:"cs_my_olympian_aura", type:"passive", name:"올림포스의 기운",icon:"🏛️", rarity:"rare",      mpCost:0,  req:{}, scenario:"mythology", desc:"신들의 산 올림포스에서 온 기운. FATH·WIL +15 상시 강화. 악한 존재를 본능적으로 꺼려하게 만든다.", aiHint:"올림포스의 기운 발동! 신들의 위엄이 주변을 압도합니다.", clearDesc:"신화 세계관 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{fath:15,wil:15} },
    { id:"cs_my_myth_born",     type:"passive", name:"신화의 탄생",   icon:"🌟", rarity:"legendary", mpCost:0,  req:{}, scenario:"mythology", desc:"신화의 주인공으로 태어난 자의 운명. REP·LDR·LUK +15 상시. 세계가 이 자를 중심으로 돌아간다.", aiHint:"신화의 탄생 발동! 이 존재의 이름이 전설이 됩니다.", clearDesc:"신화 세계관 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{rep:15,ldr:15,luk:15} },
  ],
  steampunk: [
    { id:"cs_sp_steam_blast",   type:"active",  name:"증기 폭발",     icon:"💨", rarity:"rare",      mpCost:25, req:{}, scenario:"steampunk", desc:"고압 증기를 폭발적으로 방출. 범위 공격 및 적 이동 봉쇄.", aiHint:"증기 폭발 발동! 고압 증기가 폭발적으로 분출됩니다!", clearDesc:"스팀펑크 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_sp_overclock2",    type:"active",  name:"기계 오버드라이브",icon:"⚙️",rarity:"legendary",mpCost:30, req:{}, scenario:"steampunk", desc:"기계 신체를 한계 이상으로 가동. STR·AGI·INT +20, 2턴 지속. 과열 위험.", aiHint:"기계 오버드라이브 발동! 모든 기계가 한계를 초과하여 가동됩니다!", clearDesc:"스팀펑크 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_sp_gadgeteer",     type:"passive", name:"발명가의 직관", icon:"🔧", rarity:"rare",      mpCost:0,  req:{}, scenario:"steampunk", desc:"어떤 기계도 즉석에서 수리·개조. INT +12 상시. 기계 장치 판정 +20.", aiHint:"발명가의 직관 발동! 기계의 구조가 한눈에 들어옵니다.", clearDesc:"스팀펑크 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{int:12} },
    { id:"cs_sp_aether_surge",  type:"active",  name:"에테르 폭풍",   icon:"⚡", rarity:"legendary", mpCost:45, req:{}, scenario:"steampunk", desc:"에테르 에너지를 폭주시켜 거대한 전기 폭풍 소환. 범위 내 모든 적 마비.", aiHint:"에테르 폭풍 발동! 전기 에너지가 폭주하며 폭풍이 몰아칩니다!", clearDesc:"스팀펑크 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_sp_clockwork_army",type:"event",   name:"태엽 군단",     icon:"🤖", rarity:"legendary", mpCost:50, req:{}, scenario:"steampunk", desc:"미리 제작한 태엽 인형 군단 소환. 1회 발동, 3턴간 강력한 기계 부하 3체 소환.", aiHint:"태엽 군단 발동! 자동화 태엽 인형들이 전장에 나타납니다!", clearDesc:"스팀펑크 클리어 보상", condition:"activate", conditionDesc:"직접 발동 1회", statBoost:{} },
    { id:"cs_sp_analysis",      type:"active",  name:"전술 분석",     icon:"🔭", rarity:"rare",      mpCost:18, req:{}, scenario:"steampunk", desc:"상대를 분석해 약점 파악. 다음 공격 치명타 확정, INT 판정 +15.", aiHint:"전술 분석 발동! 고글이 빛나며 대상의 약점이 표시됩니다.", clearDesc:"스팀펑크 클리어 보상", condition:null, conditionDesc:null, statBoost:{} },
    { id:"cs_sp_noble_protocol",type:"passive", name:"귀족 의전",     icon:"🎩", rarity:"rare",      mpCost:0,  req:{}, scenario:"steampunk", desc:"상류층의 예절과 권위. CHA·NEG·REP +12 상시 효과. 귀족 NPC와의 교섭 +20.", aiHint:"귀족 의전 발동! 우아한 태도가 상대를 압도합니다.", clearDesc:"스팀펑크 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{cha:12,neg:12,rep:12} },
    { id:"cs_sp_iron_resolve",  type:"passive", name:"강철 의지",     icon:"🔩", rarity:"rare",      mpCost:0,  req:{}, scenario:"steampunk", desc:"기계처럼 냉정한 의지. WIL·CAL +15 상시 강화. 감정 조작·공포·혼란 면역.", aiHint:"강철 의지 발동! 기계 같은 냉정함이 정신적 공격을 차단합니다.", clearDesc:"스팀펑크 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{wil:15,cal:15} },
    { id:"cs_sp_patent_master", type:"event",   name:"특허 발동",     icon:"📜", rarity:"legendary", mpCost:0,  req:{}, scenario:"steampunk", desc:"비장의 발명품 특허를 발동. 1회 사용, 불가능한 기술적 문제를 즉시 해결.", aiHint:"특허 발동! 아무도 본 적 없는 발명품이 세상에 등장합니다!", clearDesc:"스팀펑크 클리어 보상", condition:"activate", conditionDesc:"직접 발동 1회", statBoost:{} },
    { id:"cs_sp_grand_design",  type:"passive", name:"위대한 설계",   icon:"📐", rarity:"legendary", mpCost:0,  req:{}, scenario:"steampunk", desc:"모든 것을 설계도로 보는 눈. INT·PER +18 상시 강화. 모든 구조물·기계의 약점 자동 파악.", aiHint:"위대한 설계 발동! 세계가 설계도로 보이기 시작합니다.", clearDesc:"스팀펑크 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{int:18,per:18} },
  ],
};

// 클리어 보상 스킬을 getAllSkillDefs에 포함시키기 위한 헬퍼
const getAllClearSkillDefs = () => {
  return [...Object.values(CLEAR_SKILLS).flat()];
};


// 레벨 & 경험치 저장
const LEVEL_KEY      = "taleforge-level";
const EXP_KEY        = "taleforge-exp";
const loadPlayerLevel = () => { const r = lsGet(LEVEL_KEY); return r ? parseInt(r, 10) : 1; };
const savePlayerLevel = (n) => lsSet(LEVEL_KEY, String(n));
const loadPlayerExp   = () => { const r = lsGet(EXP_KEY);   return r ? parseInt(r, 10) : 0; };
const savePlayerExp   = (n) => lsSet(EXP_KEY,   String(n));
const clearPlayerLevel = () => lsDel(LEVEL_KEY);
const clearPlayerExp   = () => lsDel(EXP_KEY);

// 등급별 보상 테이블
const REWARD_TABLE = {
  weak:   { goldMin:3,   goldMax:12,  expMin:5,   expMax:15,  spChance:0,    itemChance:0.10, itemPool:["허름한 단검","낡은 갑옷 조각","잡초 약초","돌멩이"] },
  normal: { goldMin:10,  goldMax:35,  expMin:15,  expMax:40,  spChance:0.1,  itemChance:0.25, itemPool:["철제 검","가죽 갑옷","치유 포션","마나 포션","독 주머니"] },
  elite:  { goldMin:35,  goldMax:90,  expMin:40,  expMax:100, spChance:0.4,  itemChance:0.55, itemPool:["강철 검","사슬 갑옷","고급 치유 포션","마법석","희귀 약초","비밀 지도"] },
  boss:   { goldMin:80,  goldMax:200, expMin:100, expMax:250, spChance:0.8,  itemChance:0.85, itemPool:["전설의 검 파편","보스의 심장석","희귀 마법서","정예 갑옷","봉인된 마석","칭호 증서"] },
  legend: { goldMin:200, goldMax:500, expMin:250, expMax:600, spChance:1.0,  itemChance:1.00, itemPool:["전설 유물","용의 비늘","불멸의 결정","고대 마법서","전설 장비 설계도","신성한 유물"] },
};
const ITEM_RARITY_BY_TIER = {
  weak:"common", normal:"common", elite:"uncommon", boss:"rare", legend:"legendary"
};

// 직업 전용 스킬 저장 (AI 생성)
const JOB_SKILLS_KEY   = "taleforge-jobskills";
const loadJobSkills    = () => { const r = lsGet(JOB_SKILLS_KEY); return r ? JSON.parse(r) : []; };
const saveJobSkills    = (s) => lsSet(JOB_SKILLS_KEY, JSON.stringify(s));
const clearJobSkills   = () => lsDel(JOB_SKILLS_KEY);

// 전체 스킬 목록 (기본 + 직업 전용 + 클리어 보상 합산)
const getAllSkillDefs = () => [...SKILL_DEFS, ...loadJobSkills(), ...getAllClearSkillDefs()];

// 스킬 레어도 색
const SKILL_RARITY_COLOR = { common:"#8a9a8a", uncommon:"#4a9a6a", rare:"#4a6fa5", legendary:"#c8a96e", event:"#e05a5a" };

// 스킬 정의 (능동/패시브/이벤트 포함)
const SKILL_DEFS = [
  // ── 능동 스킬 (Active) ──────────────────────────────────
  { id:"active_strike",    type:"active",  name:"강격",         icon:"⚔️",  rarity:"common",    mpCost:10, req:{str:30},          scenario:null, desc:"힘을 담아 강하게 내리친다. 서사에 강한 물리 타격이 반영된다.",          aiHint:"강격 스킬 사용! 강렬한 물리 공격을 묘사하십시오. 피해 증폭 효과." },
  { id:"active_fireball",  type:"active",  name:"화염구",       icon:"🔥",  rarity:"uncommon",  mpCost:20, req:{mgc:35},          scenario:null, desc:"마나를 집중시켜 화염구를 발사한다.",                                    aiHint:"화염구 스킬 사용! 강렬한 화염 마법을 묘사하십시오. 범위 피해." },
  { id:"active_shadow",    type:"active",  name:"암영 이동",    icon:"🌑",  rarity:"uncommon",  mpCost:15, req:{agi:40},          scenario:null, desc:"어둠 속으로 녹아들어 순간적으로 이동한다.",                            aiHint:"암영 이동 사용! 순식간에 그림자처럼 사라졌다가 다른 위치에 나타납니다." },
  { id:"active_heal",      type:"active",  name:"치유 기도",    icon:"💚",  rarity:"uncommon",  mpCost:20, req:{fath:40},         scenario:null, desc:"신성한 빛으로 체력을 회복한다. HP +15 회복.",                          aiHint:"치유 기도 사용! 신성한 빛이 상처를 치유합니다.", hpRestore:15 },
  { id:"active_taunt",     type:"active",  name:"도발",         icon:"😤",  rarity:"common",    mpCost:8,  req:{fear:30},         scenario:null, desc:"적의 주의를 끌어 아군을 보호한다.",                                     aiHint:"도발 스킬 사용! 적의 분노가 이 캐릭터에게 집중됩니다." },
  { id:"active_poison",    type:"active",  name:"독 투척",      icon:"🧪",  rarity:"uncommon",  mpCost:12, req:{pstx:35},         scenario:null, desc:"맹독 물약을 투척해 적에게 지속 피해를 준다.",                          aiHint:"독 투척 사용! 독이 퍼져나가며 적이 서서히 약해집니다." },
  { id:"active_inspire",   type:"active",  name:"영웅 연설",    icon:"📣",  rarity:"rare",      mpCost:25, req:{spk:50,ldr:40},   scenario:null, desc:"불꽃 같은 연설로 아군의 사기를 드높인다.",                             aiHint:"영웅 연설 사용! 주변 아군이 감동받아 사기가 솟구칩니다." },
  { id:"active_mirage",    type:"active",  name:"환영 분신",    icon:"✨",  rarity:"rare",      mpCost:30, req:{mgc:50,disg:40},  scenario:null, desc:"마법으로 분신을 만들어 적을 혼란에 빠뜨린다.",                         aiHint:"환영 분신 사용! 여러 개의 분신이 나타나 적을 혼란에 빠뜨립니다." },
  { id:"active_assassin",  type:"active",  name:"암살",         icon:"🗡️", rarity:"rare",      mpCost:18, req:{crit:50,agi:45},  scenario:null, desc:"급소를 노린 치명적인 일격. 대성공 확률 대폭 상승.",                   aiHint:"암살 스킬 사용! 급소를 노린 치명타입니다. 반드시 결정적 피해를 줍니다." },
  { id:"active_blizzard",  type:"active",  name:"눈보라",       icon:"❄️",  rarity:"legendary", mpCost:40, req:{mgc:65,wil:50},   scenario:null, desc:"광역 빙결 마법으로 모든 적을 얼린다.",                                 aiHint:"눈보라 사용! 거대한 눈보라가 적 전체를 덮쳐 얼려버립니다." },
  { id:"active_berserk",   type:"active",  name:"광전사",       icon:"💢",  rarity:"rare",      mpCost:0,  req:{str:55,end:45},   scenario:null, desc:"HP를 10 소모하고 STR +20 효과를 얻는 광란의 상태로 돌입.", hpCost:10,  aiHint:"광전사 돌입! HP를 대가로 공격력이 폭발적으로 상승했습니다." },
  { id:"active_stealth",   type:"active",  name:"은신",         icon:"👥",  rarity:"uncommon",  mpCost:15, req:{disg:40,agi:35},  scenario:null, desc:"완전히 몸을 숨겨 적의 탐지를 피한다.",                                aiHint:"은신 사용! 완전히 모습을 감추고 적의 시야에서 사라집니다." },

  // ── 중세 판타지 전용 능동 스킬
  { id:"active_holy_smite",type:"active",  name:"성광 심판",    icon:"⚡",  rarity:"rare",      mpCost:25, req:{fath:55},         scenario:"medieval", desc:"신의 심판으로 사악한 존재에게 강렬한 빛의 피해를 준다.", aiHint:"성광 심판 사용! 신성한 빛이 내려쳐 사악한 존재를 강타합니다." },
  { id:"active_dragon_breath",type:"active",name:"용의 숨결",   icon:"🐲",  rarity:"legendary", mpCost:45, req:{mgc:70,str:55},   scenario:"medieval", desc:"용혈의 힘으로 강렬한 불꽃을 내뿜는다.", aiHint:"용의 숨결 사용! 용의 피가 각성해 거대한 불꽃이 쏟아집니다." },

  // ── 무협 전용 능동 스킬
  { id:"active_qi_burst",  type:"active",  name:"내공 폭발",    icon:"💨",  rarity:"rare",      mpCost:30, req:{mp:60,wil:45},    scenario:"wuxia",    desc:"축적된 내공을 한꺼번에 방출해 주변을 날려버린다.", aiHint:"내공 폭발 사용! 강력한 기의 파동이 사방으로 퍼져나갑니다." },
  { id:"active_phantom_blade",type:"active",name:"귀검 섬광",   icon:"🌟",  rarity:"legendary", mpCost:35, req:{agi:65,crit:55},  scenario:"wuxia",    desc:"눈에 보이지 않는 속도로 검을 휘두르는 절기.", aiHint:"귀검 섬광 사용! 빛보다 빠른 검격이 적을 스쳐지나갑니다." },

  // ── 사이버펑크 전용 능동 스킬
  { id:"active_neural_hack",type:"active", name:"신경망 해킹",  icon:"🧠",  rarity:"rare",      mpCost:28, req:{int:55,mgc:40},   scenario:"cyberpunk",desc:"상대의 신경 임플란트를 해킹해 잠시 마비시킨다.", aiHint:"신경망 해킹 사용! 적의 임플란트가 오작동하며 잠시 마비됩니다." },
  { id:"active_overclock",  type:"active", name:"오버클럭",     icon:"⚙️",  rarity:"rare",      mpCost:20, req:{end:50,agi:45},   scenario:"cyberpunk",desc:"신체 강화 임플란트를 한계 이상으로 가동한다.", aiHint:"오버클럭 사용! 모든 신체 능력이 과부하 상태로 가동됩니다." },

  // ── 패시브 스킬 (Passive) ──────────────────────────────
  { id:"passive_iron_will", type:"passive", name:"강철 의지",    icon:"🔥",  rarity:"common",    req:{wil:35},         scenario:null,       desc:"HP 30% 이하 시 자동 발동 — 의지력 +20, 모든 판정에 보너스.", condition:"hp_low",     conditionDesc:"HP 30% 이하", statBoost:{wil:20} },
  { id:"passive_bloodlust", type:"passive", name:"혈기",         icon:"🩸",  rarity:"uncommon",  req:{str:45},         scenario:null,       desc:"전투 대성공 시 자동 발동 — STR +10, 다음 행동에 기세.", condition:"crit_success", conditionDesc:"대성공 달성", statBoost:{str:10} },
  { id:"passive_mana_flow", type:"passive", name:"마나 흐름",    icon:"💙",  rarity:"uncommon",  req:{mgc:40,mp:40},   scenario:null,       desc:"매 5턴마다 MP +10 추가 회복.", condition:"every5turn",   conditionDesc:"5턴마다", mpBonus:10 },
  { id:"passive_sixth_sense",type:"passive",name:"육감",         icon:"👁️", rarity:"rare",       req:{per:50,intn:40}, scenario:null,       desc:"위험한 상황에서 자동 경고 — 실패를 1번 성공으로 전환.", condition:"danger",      conditionDesc:"실패 시 1회 전환" },
  { id:"passive_undying",   type:"passive", name:"불사",         icon:"💀",  rarity:"legendary", req:{end:65,wil:60},  scenario:null,       desc:"HP가 0이 될 때 1번 자동 발동 — HP 1로 부활.", condition:"death",       conditionDesc:"사망 직전 1회" },
  { id:"passive_last_stand",type:"passive", name:"최후의 저항",  icon:"🛡️", rarity:"rare",       req:{end:50,str:40},  scenario:null,       desc:"HP 20 이하 시 END +30 자동 강화.", condition:"hp_critical",  conditionDesc:"HP 20 이하", statBoost:{end:30} },
  { id:"passive_lucky",     type:"passive", name:"행운아",       icon:"🍀",  rarity:"uncommon",  req:{luk:55},         scenario:null,       desc:"대실패(96-100) 발생 시 자동 재롤. 1전투 1회 한정.", condition:"crit_fail",   conditionDesc:"대실패 시 재롤" },
  { id:"passive_calm_mind", type:"passive", name:"평심",         icon:"🌊",  rarity:"common",    req:{cal:40},         scenario:null,       desc:"감정 강도가 80 이상일 때 CAL +15 자동 발동.", condition:"high_emotion", conditionDesc:"감정 강도 80 이상", statBoost:{cal:15} },
  { id:"passive_dark_power",type:"passive", name:"어둠의 힘",    icon:"🖤",  rarity:"legendary", req:{mad:60},         scenario:null,       desc:"광기 60 이상일 때 MAD +10, MGC +15 자동 강화. 단, HP 최대치 감소.", condition:"high_mad",   conditionDesc:"광기 60 이상", statBoost:{mad:10,mgc:15} },
  { id:"passive_regen_plus",type:"passive", name:"생명력 넘침",  icon:"❤️",  rarity:"uncommon",  req:{regen:55},       scenario:null,       desc:"회복 주기가 5턴→3턴으로 단축된다.", condition:"always",      conditionDesc:"항시 발동" },

  // ── 이벤트 스킬 (특정 업적/조건 달성 시 해금) ──────────────
  { id:"event_dragon_aura", type:"event",   name:"용의 기운",    icon:"🐲",  rarity:"legendary", req:{},               scenario:"medieval", unlockTitle:"mf_dragon_blood", desc:"용의 피를 얻은 자만이 쓸 수 있는 위압적 기운. 적 사기를 대폭 저하.", aiHint:"용의 기운 발동! 강렬한 용의 위압감이 적들을 공포에 떨게 합니다.", mpCost:30 },
  { id:"event_holy_shield", type:"event",   name:"성광의 방패",  icon:"✨",  rarity:"legendary", req:{},               scenario:"medieval", unlockTitle:"mf_holy_light",   desc:"신의 선택을 받은 자의 보호막. 치명상을 1회 막는다.", aiHint:"성광의 방패 발동! 눈부신 빛의 방패가 치명타를 막아냈습니다.", mpCost:35 },
  { id:"event_dark_contract",type:"event",  name:"어둠의 계약",  icon:"🖤",  rarity:"legendary", req:{},               scenario:"medieval", unlockTitle:"mf_dark_pact",    desc:"어둠과 계약한 자의 힘. 강대한 어둠의 에너지를 폭발시킨다.", aiHint:"어둠의 계약 발동! 계약의 힘이 해방되며 강렬한 어둠이 용솟음칩니다.", mpCost:40 },
  { id:"event_qi_awakening",type:"event",   name:"내공 각성",    icon:"💨",  rarity:"legendary", req:{},               scenario:"wuxia",    unlockTitle:"wx_qi_awakened",  desc:"각성한 내공으로 공간을 가르는 기공파를 발사.", aiHint:"내공 각성 발동! 각성된 내공이 공간을 찢을 듯한 기공파가 됩니다.", mpCost:45 },
  { id:"event_enlighten",   type:"event",   name:"무의 경지",    icon:"☯️",  rarity:"legendary", req:{},               scenario:"wuxia",    unlockTitle:"wx_enlightenment",desc:"무의 경지에서 나오는 완벽한 수비와 반격. 다음 공격을 완전히 흡수.", aiHint:"무의 경지 발동! 완전한 무의 상태로 적의 공격을 흡수하고 반격합니다.", mpCost:0 },
  { id:"event_neural_storm",type:"event",   name:"신경폭풍",     icon:"🧠",  rarity:"legendary", req:{},               scenario:"cyberpunk",unlockTitle:"cp_neural_hack",   desc:"해킹 능력을 극한으로 끌어올려 주변 모든 임플란트를 마비시킨다.", aiHint:"신경폭풍 발동! 광역 해킹이 주변 모든 전자 임플란트를 오작동시킵니다.", mpCost:50 },
  { id:"event_ghost_step",  type:"event",   name:"고스트 스텝",  icon:"🌫️", rarity:"legendary", req:{},               scenario:"cyberpunk",unlockTitle:"cp_ghost_protocol",desc:"존재 자체가 지워진 자의 능력. 완전한 추적 불가 이동.", aiHint:"고스트 스텝 발동! 모든 센서와 시야에서 완전히 사라집니다.", mpCost:30 },
  { id:"event_karma_burst", type:"event",   name:"업보의 폭발",  icon:"⚖️",  rarity:"legendary", req:{},               scenario:null,       unlockTitle:"hidden_silence",   desc:"쌓인 업보의 무게를 폭발적인 힘으로 전환시킨다.", aiHint:"업보의 폭발! 선악의 업보가 거대한 에너지로 변환되어 터집니다.", mpCost:35 },
  { id:"event_soul_bond_skill",type:"event",name:"영혼 공명",   icon:"⛓️",  rarity:"legendary", req:{},               scenario:null,       unlockTitle:"soul_bond",        desc:"깊은 유대를 맺은 존재와 공명해 힘을 끌어올린다.", aiHint:"영혼 공명 발동! 유대의 힘이 공명하며 기적적인 강화가 일어납니다.", mpCost:25 },
  { id:"event_prophecy_power",type:"event", name:"예언의 힘",    icon:"🔮",  rarity:"legendary", req:{},               scenario:null,       unlockTitle:"prophecy",         desc:"예언의 주인공으로서 운명의 힘을 발현시킨다. LUK 최대화.", aiHint:"예언의 힘 발동! 운명이 이 존재를 선택했습니다. 기적이 일어납니다.", mpCost:20 },
];

// 스킬 트리 — 특정 스킬 해금에 필요한 선행 스킬
const SKILL_TREE = {
  active_fireball:   ["active_strike"],
  active_blizzard:   ["active_fireball"],
  active_shadow:     ["active_stealth"],
  active_mirage:     ["active_shadow"],
  active_assassin:   ["active_shadow","active_strike"],
  active_inspire:    ["active_taunt"],
  active_heal:       [],
  active_berserk:    ["active_strike","passive_iron_will"],
  passive_bloodlust: ["passive_iron_will"],
  passive_undying:   ["passive_last_stand","passive_iron_will"],
  passive_dark_power:["passive_iron_will"],
  active_holy_smite: ["active_heal"],
  active_dragon_breath:["active_fireball","event_dragon_aura"],
  active_qi_burst:   ["passive_mana_flow"],
  active_phantom_blade:["active_shadow","active_qi_burst"],
  active_neural_hack:["active_stealth"],
  active_overclock:  ["passive_last_stand"],
};

const getSkillUnlockable = (skillId, unlockedSkills, stats, titles) => {
  const def = getAllSkillDefs().find(s => s.id === skillId);
  if (!def) return false;
  if (unlockedSkills[skillId]) return false; // 이미 해금됨

  // 이벤트 스킬: 칭호 필요
  if (def.type === "event") {
    if (!def.unlockTitle) return true;
    return !!titles.find(t => t.id === def.unlockTitle);
  }

  // 스탯 요구 조건
  const statOk = Object.entries(def.req || {}).every(([k, v]) => (stats[k] || 0) >= v);
  if (!statOk) return false;

  // 선행 스킬 조건
  const prereqs = SKILL_TREE[skillId] || [];
  return prereqs.every(pid => !!unlockedSkills[pid]);
};

const SKILL_TREE_SP_COST = (def) => {
  if (def.type === "event") return 0;
  const costs = { common:1, uncommon:2, rare:3, legendary:5 };
  return costs[def.rarity] || 1;
};

const SECRETS_KEY   = "taleforge-secrets";
const loadSecrets   = () => { const r = lsGet(SECRETS_KEY); return r ? JSON.parse(r) : []; };
const saveSecrets   = (s) => lsSet(SECRETS_KEY, JSON.stringify(s));
const clearSecrets  = () => lsDel(SECRETS_KEY);

const HIGHLIGHTS_KEY  = "taleforge-highlights";
const loadHighlights  = () => { const r = lsGet(HIGHLIGHTS_KEY); return r ? JSON.parse(r) : []; };
const saveHighlights  = (h) => lsSet(HIGHLIGHTS_KEY, JSON.stringify(h));
const clearHighlights = () => lsDel(HIGHLIGHTS_KEY);

const MEMORY_KEY = "taleforge-memory";
const EMPTY_MEMORY = () => ({ core:"", mid:"", coreUpdatedAt:0, midUpdatedAt:0, coreTurn:0, midTurn:0 });
const loadMemory  = () => { const r = lsGet(MEMORY_KEY); return r ? JSON.parse(r) : EMPTY_MEMORY(); };
const saveMemory  = (m) => lsSet(MEMORY_KEY, JSON.stringify(m));
const clearMemory = () => lsDel(MEMORY_KEY);

const TITLES_STORAGE = "taleforge-titles";
const loadTitles = () => { const r = lsGet(TITLES_STORAGE); return r ? JSON.parse(r) : []; };
const saveTitles = (t) => lsSet(TITLES_STORAGE, JSON.stringify(t));
const addTitle   = (title) => {
  const existing = loadTitles();
  if (existing.find(t => t.id === title.id)) return false;
  saveTitles([...existing, { ...title, earnedAt: new Date().toISOString() }]);
  return true;
};

const STAT_DEFS = {
  combat: [
    { id: "hp", name: "체력", icon: "❤️", color: "#e74c3c", desc: "물리적 생명력과 지구력" },
    { id: "mp", name: "마나/기력", icon: "✨", color: "#3498db", desc: "마법 및 특수 능력 자원" },
    { id: "str", name: "근력", icon: "💪", color: "#e67e22", desc: "물리적 힘과 파괴력" },
    { id: "agi", name: "민첩", icon: "⚡", color: "#f1c40f", desc: "속도, 회피율, 반응 속도" },
    { id: "end", name: "인내", icon: "🛡️", color: "#95a5a6", desc: "방어력 및 고통 내성" },
    { id: "crit", name: "치명", icon: "🗡️", color: "#c0392b", desc: "급소 공격 / 암살 특화" },
    { id: "rng", name: "사거리", icon: "🏹", color: "#27ae60", desc: "원거리 전투, 도주 능력" },
    { id: "regen", name: "생명력재생", icon: "🩸", color: "#c0392b", desc: "전투 후 회복 속도" }
  ],
  social: [
    { id: "cha", name: "매력", icon: "🌹", color: "#e91e63", desc: "호감도 및 외적 이끌림" },
    { id: "spk", name: "화술", icon: "🗣️", color: "#9b59b6", desc: "설득, 기만, 언변력" },
    { id: "ldr", name: "통솔", icon: "👑", color: "#f39c12", desc: "타인을 이끄는 카리스마" },
    { id: "neg", name: "교섭", icon: "🤝", color: "#1abc9c", desc: "거래 및 협상 능력" },
    { id: "rep", name: "평판", icon: "📜", color: "#34495e", desc: "세간의 신용 및 인지도" },
    { id: "disg", name: "위장", icon: "🎭", color: "#8e44ad", desc: "신분 속이기, 변장, 잠입" },
    { id: "fear", name: "공포", icon: "😈", color: "#2c3e50", desc: "협박, 위압감, 적 사기 저하" },
    { id: "trst", name: "신뢰도", icon: "🕊️", color: "#bdc3c7", desc: "NPC가 비밀 털어놓는 정도" }
  ],
  mental: [
    { id: "int", name: "지력", icon: "🧠", color: "#2ecc71", desc: "지식, 기억력, 추리력" },
    { id: "per", name: "통찰", icon: "👁️", color: "#00bcd4", desc: "숨겨진 것을 꿰뚫어보는 눈" },
    { id: "wil", name: "의지", icon: "🔥", color: "#673ab7", desc: "정신적 저항력 및 신념" },
    { id: "cal", name: "평정", icon: "🌊", color: "#607d8b", desc: "위기 상황에서의 냉정함" },
    { id: "luk", name: "행운", icon: "🍀", color: "#ffc107", desc: "운명적 가호 및 우연" },
    { id: "intn", name: "직감", icon: "🌀", color: "#2980b9", desc: "함정/거짓말 탐지, 선택 예감" },
    { id: "fath", name: "신앙", icon: "📿", color: "#f1c40f", desc: "신/저주/성물 관련 판정" },
    { id: "mad", name: "광기", icon: "🖤", color: "#34495e", desc: "높을수록 금기 능력 해금, 위험" }
  ],
  survival: [
    { id: "food", name: "포만감", icon: "🍖", color: "#d35400", desc: "배고픔, 체력 회복 연동" },
    { id: "ftg", name: "피로도", icon: "💤", color: "#7f8c8d", desc: "높으면 모든 판정 페널티" },
    { id: "pstx", name: "독내성", icon: "🧪", color: "#2ecc71", desc: "독/술/약물 저항" }
  ],
  mystery: [
    { id: "mgc", name: "마법친화", icon: "🔮", color: "#9b59b6", desc: "마법 아이템 반응, 각성 확률" },
    { id: "crse", name: "저주도", icon: "👁️‍🗨️", color: "#8e44ad", desc: "누적될수록 불운 / 저주 시나리오 트리거" },
    { id: "krma", name: "업보", icon: "⚖️", color: "#bdc3c7", desc: "선악 행동 누적, 엔딩 분기에 영향" }
  ]
};

const ALL_STAT_KEYS = [...STAT_DEFS.combat, ...STAT_DEFS.social, ...STAT_DEFS.mental, ...STAT_DEFS.survival, ...STAT_DEFS.mystery].map(s => s.id);
const getStatInfo = (id) => {
  return [...STAT_DEFS.combat, ...STAT_DEFS.social, ...STAT_DEFS.mental, ...STAT_DEFS.survival, ...STAT_DEFS.mystery].find(s => s.id === id);
};

const calcTitleBonuses = (titles) => titles.reduce((acc, t) => {
  const def = TITLE_DEFS.find(d => d.id === t.id);
  if (def?.bonus) Object.entries(def.bonus).forEach(([k, v]) => { acc[k] = (acc[k]||0) + v; });
  return acc;
}, {});

const stripTitleBonuses = (stats, titles) => {
  const bonuses = calcTitleBonuses(titles);
  const base = { ...stats };
  ALL_STAT_KEYS.forEach(k => { base[k] = Math.round((base[k]||50) - (bonuses[k]||0)); });
  return base;
};

const applyTitleBonuses = (baseStats, titles) => {
  const bonuses = calcTitleBonuses(titles);
  const result = { ...baseStats };
  ALL_STAT_KEYS.forEach(k => { result[k] = Math.min(100, Math.max(0, (result[k]||50) + (bonuses[k]||0))); });
  return result;
};

const TITLE_DEFS = [
  { id:"first_blood", name:"첫 만남", icon:"🌱", rarity:"common", cat:"관계", desc:"첫 번째 대화를 나눴다", bonus:{cha:1, rep:1 }, aiHint:"처음 만난 사람에게 약간 더 친절하게" },
  { id:"heartbreaker", name:"심장 도둑", icon:"💘", rarity:"rare", cat:"관계", desc:"호감도 90 이상 달성", bonus:{cha:5, rep:2 }, aiHint:"이 사람에게 설레는 감정을 숨기지 못한다" },
  { id:"trusted_one", name:"신뢰받는 자", icon:"🤝", rarity:"rare", cat:"관계", desc:"신뢰도 90 이상 달성", bonus:{rep:5, ldr:3}, aiHint:"이 사람의 말을 깊이 신뢰하고 비밀도 털어놓는다" },
  { id:"soul_bond", name:"영혼의 유대", icon:"⛓️", rarity:"legendary", cat:"관계", desc:"호감도+신뢰도 합산 180 이상", bonus:{cha:5, rep:5, wil:5}, aiHint:"이 사람과는 말하지 않아도 통하는 것이 있다" },
  { id:"confessor", name:"고백자", icon:"💌", rarity:"rare", cat:"관계", desc:"고백에 성공했다", bonus:{cha:3, rep:2}, aiHint:"이 사람의 고백을 기억하며 더 애틋하게 대한다" },
  { id:"heartbroken", name:"상처받은 마음", icon:"💔", rarity:"common", cat:"관계", desc:"거절당하거나 이별을 경험했다", bonus:{cal:-2, wil:3 }, aiHint:"이 사람에게 미안함과 복잡한 감정을 느낀다" },
  { id:"duel_winner", name:"결투의 승자", icon:"⚔️", rarity:"rare", cat:"전투", desc:"결투 또는 대립에서 승리했다", bonus:{str:3, rep:3}, aiHint:"이 사람의 실력을 인정하고 함부로 대하지 않는다" },
  { id:"pacifist", name:"평화주의자", icon:"🕊️", rarity:"uncommon", cat:"전투", desc:"싸움을 대화로 해결했다", bonus:{neg:4, rep:2}, aiHint:"이 사람의 온화함에 감화되어 더 부드럽게 대한다" },
  { id:"defender", name:"수호자", icon:"🛡️", rarity:"rare", cat:"전투", desc:"위기에서 캐릭터를 구했다", bonus:{end:3, rep:4}, aiHint:"이 사람이 자신을 구해준 것을 잊지 못하고 충성을 다한다" },
  { id:"secret_keeper", name:"비밀의 수호자", icon:"🔐", rarity:"uncommon", cat:"탐험", desc:"캐릭터의 비밀을 알게 됐다", bonus:{per:3, rep:2}, aiHint:"이 사람에게 비밀을 털어놨으므로 더 깊이 연결됐다" },
  { id:"explorer", name:"개척자", icon:"🗺️", rarity:"common", cat:"탐험", desc:"새로운 세계나 장소를 발견했다", bonus:{agi:2, luk:1 }, aiHint:"이 사람과 함께 미지의 것을 탐험한 기억이 있다" },
  { id:"prophecy", name:"예언의 주인공", icon:"🔮", rarity:"legendary", cat:"탐험", desc:"운명적인 예언과 관련된 사건이 벌어졌다", bonus:{int:3, luk:5}, aiHint:"이 사람이 운명과 관련된 존재라는 것을 직감한다" },
  { id:"chatterbox", name:"이야기꾼", icon:"💬", rarity:"common", cat:"성장", desc:"50번 이상 대화를 나눴다", bonus:{spk:3}, aiHint:"이 사람과 오래 이야기한 터라 편안하게 대한다" },
  { id:"storyteller", name:"전설의 화자", icon:"📜", rarity:"uncommon", cat:"성장", desc:"100번 이상 대화를 나눴다", bonus:{spk:5, int:2 }, aiHint:"이 사람과의 긴 대화들이 쌓여 특별한 유대가 생겼다" },
  { id:"legend", name:"전설", icon:"👑", rarity:"legendary", cat:"성장", desc:"200번 이상 대화를 나눴다", bonus:{ldr:5, rep:5}, aiHint:"이 사람과의 긴 인연을 소중히 여기며 특별하게 대한다" },
  { id:"philosopher", name:"철학자", icon:"🧠", rarity:"uncommon", cat:"성장", desc:"삶과 세계관에 대한 깊은 대화를 나눴다", bonus:{int:4, cal:2}, aiHint:"이 사람과 나눈 깊은 이야기가 마음에 남아있다" },
  { id:"laughter", name:"웃음", icon:"😂", rarity:"common", cat:"성장", desc:"함께 크게 웃는 순간이 있었다", bonus:{cha:3, cal:2}, aiHint:"이 사람과 함께 웃은 기억이 있어 편안함을 느낀다" },
  { id:"hidden_goodbye", name:"마지막 인사", icon:"🌅", rarity:"legendary", cat:"숨김", desc:"진심 어린 작별 인사를 나눴다", bonus:{wil:5, cal:5}, aiHint:"진심으로 작별한 이 사람을 언제나 그리워한다" },
  { id:"hidden_silence", name:"침묵의 언어", icon:"🌌", rarity:"rare", cat:"숨김", desc:"말 없이도 서로를 이해하는 순간이 왔다", bonus:{per:5, wil:3}, aiHint:"침묵만으로 통하는 이 사람과의 관계는 언어를 초월했다" },
  { id:"hidden_name", name:"진짜 이름", icon:"🏷️", rarity:"legendary", cat:"숨김", desc:"캐릭터의 진짜 이름이나 정체를 알게 됐다", bonus:{int:3, rep:5}, aiHint:"자신의 진짜 이름을 아는 이 사람에게 특별한 신뢰를 느낀다" },

  // ──────── 중세 판타지 전용 업적 ────────
  { id:"mf_knighted", name:"기사 서임", icon:"🗡️", rarity:"rare", cat:"중세", scenario:"medieval", desc:"왕 혹은 영주로부터 기사 작위를 받았다", bonus:{str:4, rep:5, ldr:3}, aiHint:"기사 작위를 받은 이 사람을 주변 인물들이 예우한다" },
  { id:"mf_dragon_blood", name:"용의 피", icon:"🐲", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"드래곤과 직접 마주하거나 그 피를 얻었다", bonus:{str:5, mgc:5, wil:5}, aiHint:"용과 연관된 이 사람에게서 강렬한 기운이 느껴진다" },
  { id:"mf_holy_light", name:"성광의 선택", icon:"✨", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"성스러운 빛 혹은 신의 계시를 받았다", bonus:{fath:8, wil:4, mad:-5}, aiHint:"신의 가호를 받은 자로 숭앙받는다" },
  { id:"mf_dark_pact", name:"어둠과의 계약", icon:"🖤", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"악마 또는 어둠의 존재와 계약을 맺었다", bonus:{mgc:6, str:4, mad:8, fath:-5}, aiHint:"어둠의 힘을 느끼며 불안하게 대한다" },
  { id:"mf_siege_hero", name:"공성의 영웅", icon:"🏰", rarity:"rare", cat:"중세", scenario:"medieval", desc:"성 공방전에서 결정적인 역할을 했다", bonus:{str:4, end:3, rep:5}, aiHint:"전장에서 큰 활약을 한 영웅으로 기억한다" },
  { id:"mf_crown_pretender", name:"왕위 주장자", icon:"👑", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"왕좌를 향한 야망을 드러냈다", bonus:{ldr:6, rep:4, fear:4}, aiHint:"이 사람의 야망을 두려움 또는 기대로 바라본다" },
  { id:"mf_curse_broken", name:"저주 해방자", icon:"🔓", rarity:"rare", cat:"중세", scenario:"medieval", desc:"오랫동안 이어진 저주를 풀었다", bonus:{fath:4, wil:4, crse:-10}, aiHint:"저주에서 해방된 이 사람을 구원자로 여긴다" },
  { id:"mf_forbidden_magic", name:"금기 마법사", icon:"🔮", rarity:"rare", cat:"중세", scenario:"medieval", desc:"금지된 마법을 사용했다", bonus:{mgc:6, int:4, mad:5, rep:-3}, aiHint:"금기를 어긴 마법사를 경계하면서도 경외한다" },
  { id:"mf_dungeon_diver", name:"던전 탐험가", icon:"🗝️", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"던전 깊은 곳까지 탐험했다", bonus:{agi:3, per:3, luk:2}, aiHint:"지하 탐험에서 단련된 담대함이 느껴진다" },
  { id:"mf_tournament_champion", name:"마상 대회의 패자", icon:"🏆", rarity:"rare", cat:"중세", scenario:"medieval", desc:"마상 대회 또는 무술 대회에서 우승했다", bonus:{str:4, agi:3, rep:4}, aiHint:"대회의 패자로서 명성이 높다는 것을 알고 있다" },
  { id:"mf_guild_master", name:"길드 마스터", icon:"📋", rarity:"rare", cat:"중세", scenario:"medieval", desc:"길드를 이끄는 자리에 올랐다", bonus:{ldr:5, neg:3, rep:4}, aiHint:"길드를 이끄는 이 사람의 결정에 귀를 기울인다" },
  { id:"mf_ancient_relic", name:"고대 유물의 주인", icon:"🏺", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"전설의 고대 유물을 소유하게 됐다", bonus:{mgc:4, int:4, luk:4}, aiHint:"전설의 유물을 가진 이 사람을 특별하게 여긴다" },
  { id:"mf_poison_master", name:"독의 달인", icon:"🧪", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"독을 이용해 위기를 돌파했다", bonus:{pstx:6, disg:3, crit:3}, aiHint:"독을 다루는 이 사람을 경계한다" },
  { id:"mf_tavern_legend", name:"여관의 전설", icon:"🍺", rarity:"common", cat:"중세", scenario:"medieval", desc:"여관에서 잊지 못할 사건을 일으켰다", bonus:{spk:3, cha:2, rep:2}, aiHint:"여관에서의 전설적인 일화를 알고 있다" },
  { id:"mf_witch_hunt", name:"마녀 재판", icon:"🔥", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"마녀 사냥 또는 이단 심문과 연루됐다", bonus:{fear:4, disg:3, wil:3}, aiHint:"마녀 재판에 연루된 이 사람에게 묘한 시선을 보낸다" },
  { id:"mf_noble_blood", name:"귀족의 피", icon:"🌹", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"귀족 신분임이 밝혀졌다", bonus:{cha:3, rep:4, neg:2}, aiHint:"귀족 출신임을 알게 되어 다소 예의를 갖춘다" },
  { id:"mf_mercenary_veteran", name:"용병의 고참", icon:"⚔️", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"수많은 전쟁을 살아남은 베테랑이 됐다", bonus:{str:3, end:4, cal:3}, aiHint:"베테랑 용병의 눈빛에서 경험의 깊이를 느낀다" },
  { id:"mf_spy_network", name:"첩보망 구축", icon:"🕵️", rarity:"rare", cat:"중세", scenario:"medieval", desc:"왕국에 걸친 첩보 네트워크를 만들었다", bonus:{disg:5, per:4, rep:3}, aiHint:"이 사람이 많은 정보를 쥐고 있다는 것을 느낀다" },
  { id:"mf_chosen_one", name:"선택받은 자", icon:"⭐", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"예언에 언급된 선택받은 자임이 드러났다", bonus:{luk:6, wil:5, rep:5}, aiHint:"운명에 선택받은 존재라는 경외감을 느낀다" },
  { id:"mf_betrayed", name:"배신의 상처", icon:"🗡️", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"가까운 자에게 배신당했다", bonus:{per:4, wil:3, cal:2, trst:-5}, aiHint:"배신을 당한 이 사람의 눈에서 경계심이 보인다" },
  { id:"mf_healer", name:"성스러운 치유사", icon:"💊", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"기적적인 치유로 많은 사람을 구했다", bonus:{fath:5, rep:4, trst:3}, aiHint:"치유사로서의 성명을 알고 깊이 감사한다" },
  { id:"mf_monster_slayer", name:"마수 사냥꾼", icon:"👹", rarity:"rare", cat:"중세", scenario:"medieval", desc:"전설적인 마수를 처치했다", bonus:{str:5, end:3, rep:5}, aiHint:"마수를 처치한 전사로서 두려움과 존경을 받는다" },
  { id:"mf_war_general", name:"전쟁의 지휘관", icon:"🎖️", rarity:"rare", cat:"중세", scenario:"medieval", desc:"전투에서 군대를 지휘했다", bonus:{ldr:6, str:3, fear:3}, aiHint:"군대를 지휘한 경험이 있는 강인함이 느껴진다" },
  { id:"mf_plague_survivor", name:"흑사병 생존자", icon:"☠️", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"역병에서 살아남았다", bonus:{end:5, pstx:4, wil:3}, aiHint:"생사의 고비를 넘긴 이 사람에게서 강인함이 느껴진다" },
  { id:"mf_sorcerer_apprentice", name:"마법사의 제자", icon:"📚", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"위대한 마법사의 제자로 받아들여졌다", bonus:{mgc:4, int:5, wil:2}, aiHint:"마법사의 제자라는 것을 알고 학식을 인정한다" },
  { id:"mf_bandit_king", name:"산적의 왕", icon:"🗿", rarity:"rare", cat:"중세", scenario:"medieval", desc:"산적 무리를 이끄는 수장이 됐다", bonus:{fear:5, ldr:4, str:3, rep:-3}, aiHint:"산적의 왕이라는 이름에 경계심을 품는다" },
  { id:"mf_enchanter", name:"인챈터", icon:"💎", rarity:"rare", cat:"중세", scenario:"medieval", desc:"무기나 방어구에 마법을 부여했다", bonus:{mgc:5, int:3, neg:2}, aiHint:"마법 부여사로서의 솜씨를 알아보고 존중한다" },
  { id:"mf_pilgrimage", name:"성지 순례", icon:"🛕", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"먼 성지까지 순례를 완수했다", bonus:{fath:5, wil:3, luk:2}, aiHint:"순례를 마친 신실한 자로서 경건함이 느껴진다" },
  { id:"mf_arcane_secret", name:"마법의 비밀", icon:"📜", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"세계의 근간을 이루는 마법의 비밀을 알게 됐다", bonus:{mgc:6, int:6, mad:5, wil:4}, aiHint:"세계의 비밀을 아는 이 사람을 신비롭게 바라본다" },
  { id:"mf_regicide", name:"왕의 심판자", icon:"⚖️", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"왕이나 군주를 심판했다", bonus:{wil:5, fear:6, rep:-5, ldr:5}, aiHint:"왕을 심판한 대담함에 경이로움과 두려움을 느낀다" },

  // ──────── 무협 강호 전용 업적 ────────
  { id:"wx_qi_awakened", name:"내공 각성", icon:"💨", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"잠든 내공이 각성하며 새로운 경지에 올랐다", bonus:{mp:6, wil:5, mgc:4}, aiHint:"내공이 각성한 이 사람에게서 강렬한 기운이 느껴진다" },
  { id:"wx_top_ranking", name:"강호 십대 고수", icon:"🏅", rarity:"legendary", cat:"무협", scenario:"wuxia", desc:"강호 고수 순위권에 이름을 올렸다", bonus:{str:5, rep:7, fear:4}, aiHint:"강호 고수로 이름난 이 사람을 경외와 경계로 대한다" },
  { id:"wx_secret_manual", name:"비전 무공서", icon:"📖", rarity:"legendary", cat:"무협", scenario:"wuxia", desc:"전설의 무공 비급을 입수했다", bonus:{str:5, agi:5, int:4}, aiHint:"비전 무공을 터득한 이 사람을 경계하고 주목한다" },
  { id:"wx_blood_feud", name:"혈맹의 복수", icon:"🩸", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"원한을 품고 복수의 길에 나섰다", bonus:{str:4, wil:5, cal:-2}, aiHint:"복수심에 불타는 이 사람의 눈빛을 두려워한다" },
  { id:"wx_sect_master", name:"문파 장로", icon:"⛩️", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"무림 문파의 장로 또는 문주가 됐다", bonus:{ldr:6, rep:5, str:3}, aiHint:"문파를 이끄는 권위 있는 존재로 예우한다" },
  { id:"wx_wulin_hero", name:"무림 의협", icon:"🦅", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"의로운 행동으로 강호의 귀감이 됐다", bonus:{rep:6, wil:4, trst:4}, aiHint:"의협으로 이름난 이 사람을 존경하고 따른다" },
  { id:"wx_poison_master", name:"독공 달인", icon:"🐍", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"희귀한 독공을 완성했다", bonus:{crit:5, pstx:5, fear:3}, aiHint:"독을 다루는 이 사람을 조심하며 대한다" },
  { id:"wx_enlightenment", name:"무의 깨달음", icon:"☯️", rarity:"legendary", cat:"무협", scenario:"wuxia", desc:"무의 경지에서 깨달음을 얻었다", bonus:{cal:7, wil:5, per:5}, aiHint:"깨달음을 얻은 고수로서 경외감을 느낀다" },
  { id:"wx_demon_path", name:"마도 입문", icon:"😈", rarity:"legendary", cat:"무협", scenario:"wuxia", desc:"금기된 마도를 걷기 시작했다", bonus:{str:6, mgc:5, mad:8, rep:-4}, aiHint:"마도에 물든 이 사람을 두려워하고 경계한다" },
  { id:"wx_lone_wolf", name:"독고검신", icon:"🐺", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"스승도 문파도 없이 독자적인 검법을 완성했다", bonus:{str:5, cal:4, wil:4}, aiHint:"독고검신의 고독함과 강인함을 느낀다" },
  { id:"wx_dragon_subdued", name:"항룡십팔장", icon:"🐉", rarity:"legendary", cat:"무협", scenario:"wuxia", desc:"전설의 용을 상대로 한 수를 걸었다", bonus:{str:6, end:5, rep:5}, aiHint:"용을 제압한 전설을 알고 깊이 경외한다" },
  { id:"wx_underworld", name:"흑도 거물", icon:"🌑", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"강호 흑도의 거물로 인정받았다", bonus:{fear:6, ldr:4, disg:4, rep:-3}, aiHint:"흑도 거물이라는 이름에 두려움을 품는다" },
  { id:"wx_peach_blossom", name:"도화운", icon:"🌸", rarity:"uncommon", cat:"무협", scenario:"wuxia", desc:"여러 인연과 깊은 감정적 교류를 가졌다", bonus:{cha:6, spk:3, affection:4}, aiHint:"많은 인연을 지닌 이 사람의 매력에 이끌린다" },
  { id:"wx_wine_hero", name:"주중협객", icon:"🍷", rarity:"uncommon", cat:"무협", scenario:"wuxia", desc:"술에 취해도 흐트러지지 않는 무공을 보였다", bonus:{end:4, cal:4, cha:3}, aiHint:"주중협객의 호쾌함을 좋아하거나 신기해한다" },
  { id:"wx_hidden_identity", name:"복면검협", icon:"🎭", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"정체를 숨기고 의로운 일을 했다", bonus:{disg:6, per:3, rep:4}, aiHint:"복면 뒤의 정체에 호기심과 경이를 느낀다" },
  { id:"wx_thousand_li", name:"천리 독행", icon:"🛤️", rarity:"uncommon", cat:"무협", scenario:"wuxia", desc:"혼자서 천 리 길을 완주했다", bonus:{end:4, wil:4, agi:3}, aiHint:"고독한 여정을 마친 강인함이 느껴진다" },
  { id:"wx_ghost_blade", name:"귀검", icon:"👻", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"보이지 않는 검법으로 적을 제압했다", bonus:{agi:5, crit:5, disg:3}, aiHint:"귀검이라는 소문을 듣고 경계하며 대한다" },
  { id:"wx_mountain_hermit", name:"산중 은거", icon:"🏔️", rarity:"uncommon", cat:"무협", scenario:"wuxia", desc:"세속을 떠나 산중에서 무공을 닦았다", bonus:{wil:4, cal:5, int:3}, aiHint:"세속과 거리를 둔 고결함을 느낀다" },
  { id:"wx_tournament_king", name:"무림 대회 패왕", icon:"🥋", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"무림 대규모 비무에서 왕좌를 차지했다", bonus:{str:5, agi:4, rep:6}, aiHint:"무림 대회의 패왕을 경외하고 도전해보고 싶어 한다" },
  { id:"wx_medic_saint", name:"의성", icon:"⚕️", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"강호에서 의성으로 이름을 떨쳤다", bonus:{int:5, fath:4, rep:5, trst:4}, aiHint:"의성의 명성을 알고 깊은 감사와 신뢰를 보낸다" },
  { id:"wx_venomous_beauty", name:"독수", icon:"🌺", rarity:"uncommon", cat:"무협", scenario:"wuxia", desc:"아름다움으로 적을 유인해 제압했다", bonus:{cha:6, disg:4, crit:3}, aiHint:"독수의 미소 뒤에 숨은 위험을 직감한다" },
  { id:"wx_iron_body", name:"금강불괴", icon:"🪨", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"금강불괴의 경지에 이르렀다", bonus:{end:7, hp:5, str:3}, aiHint:"금강불괴의 경지를 경외하며 함부로 대하지 않는다" },
  { id:"wx_celestial_art", name:"천하제일 신공", icon:"🌟", rarity:"legendary", cat:"무협", scenario:"wuxia", desc:"세상에 하나뿐인 신공을 완성했다", bonus:{str:6, mgc:6, wil:5, rep:5}, aiHint:"천하제일 신공의 소문을 듣고 강한 경외를 느낀다" },
  { id:"wx_spy_romance", name:"간첩의 밀회", icon:"🕯️", rarity:"uncommon", cat:"무협", scenario:"wuxia", desc:"적진에서 운명적인 사람을 만났다", bonus:{disg:4, cha:4, cal:3}, aiHint:"적과의 사이에서 피어난 감정의 깊이를 느낀다" },
  { id:"wx_sword_broken", name:"절검의 결의", icon:"💔", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"검을 꺾고 모든 것을 버린 결의를 했다", bonus:{wil:6, cal:5, mad:-5, str:-3}, aiHint:"모든 것을 내려놓은 결의의 무거움을 느낀다" },
  { id:"wx_revenge_completed", name:"복수 완수", icon:"⚖️", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"오랜 복수를 마침내 완수했다", bonus:{wil:5, cal:3, krma:5}, aiHint:"긴 복수를 마친 이 사람의 허탈함과 해방감을 느낀다" },
  { id:"wx_gang_boss", name:"방주", icon:"🏯", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"무림의 한 방파를 이끄는 방주가 됐다", bonus:{ldr:6, fear:4, rep:4}, aiHint:"방주의 권위를 인정하며 그 아래에서 충성을 다한다" },
  { id:"wx_death_defying", name:"사지 탈출", icon:"🌊", rarity:"uncommon", cat:"무협", scenario:"wuxia", desc:"죽음의 위기에서 기적적으로 살아남았다", bonus:{luk:5, wil:4, end:3}, aiHint:"죽음에서 돌아온 이 사람에게 신비로움을 느낀다" },
  { id:"wx_jade_scroll", name:"옥간 해독", icon:"🧧", rarity:"rare", cat:"무협", scenario:"wuxia", desc:"고대 옥간의 비문을 해독했다", bonus:{int:6, mgc:3, luk:3}, aiHint:"고대 비문을 해독한 학식에 경이를 느낀다" },
  { id:"wx_phantom_step", name:"귀신보법", icon:"🌫️", rarity:"legendary", cat:"무협", scenario:"wuxia", desc:"보이지 않게 움직이는 신비의 보법을 터득했다", bonus:{agi:7, disg:5, crit:4}, aiHint:"귀신보법 소문에 적들이 극도로 경계한다" },

  // ──────── 사이버펑크 전용 업적 ────────
  { id:"cp_neural_hack", name:"신경망 해킹", icon:"🧠", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"타인의 신경 임플란트를 해킹했다", bonus:{int:5, per:4, mgc:3}, aiHint:"신경망 해커로서의 위험성을 느끼며 경계한다" },
  { id:"cp_corpo_betrayal", name:"코퍼레이트 배신자", icon:"🏢", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"대기업을 배신하고 독립했다", bonus:{wil:5, rep:3, fear:4, disg:3}, aiHint:"코퍼레이트를 배신한 자를 위험하지만 존중한다" },
  { id:"cp_chrome_body", name:"전신 사이보그", icon:"🤖", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"신체 대부분을 사이버네틱으로 교체했다", bonus:{str:5, end:5, pstx:4, cal:3}, aiHint:"전신 사이보그의 강인함에 경이와 두려움을 느낀다" },
  { id:"cp_net_phantom", name:"넷 유령", icon:"👾", rarity:"legendary", cat:"사이버펑크", scenario:"cyberpunk", desc:"사이버공간에서 전설적인 해커로 이름을 떨쳤다", bonus:{int:6, disg:6, rep:5}, aiHint:"넷 유령의 전설을 알고 두려움과 존경을 느낀다" },
  { id:"cp_gang_leader", name:"갱단의 수장", icon:"🔱", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"도시 갱단의 리더가 됐다", bonus:{fear:6, ldr:5, str:4, rep:-2}, aiHint:"갱단 수장의 위협에 복종하거나 도전하려 한다" },
  { id:"cp_black_market", name:"블랙마켓 왕", icon:"💰", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"블랙마켓에서 독점적 지위를 확보했다", bonus:{neg:6, disg:4, rep:3}, aiHint:"블랙마켓 왕의 정보망을 이용하려 접근한다" },
  { id:"cp_ai_communion", name:"AI와의 교감", icon:"🤝", rarity:"legendary", cat:"사이버펑크", scenario:"cyberpunk", desc:"독자적인 AI와 진정한 교감을 나눴다", bonus:{int:6, per:5, mgc:4, wil:3}, aiHint:"AI와 교감한 이 사람을 특이하게 바라본다" },
  { id:"cp_memory_lost", name:"기억 분열", icon:"💭", rarity:"uncommon", cat:"사이버펑크", scenario:"cyberpunk", desc:"해킹이나 사고로 기억 일부가 손상됐다", bonus:{mad:5, int:-3, per:4}, aiHint:"기억을 잃은 이 사람의 불안정함에 연민을 느낀다" },
  { id:"cp_street_legend", name:"스트리트 레전드", icon:"🌃", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"도시 하층민들 사이에서 전설이 됐다", bonus:{rep:6, cha:4, ldr:4}, aiHint:"스트리트 레전드로서 하층민의 존경을 받는다" },
  { id:"cp_corpo_spy", name:"기업 스파이", icon:"🕶️", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"대기업 내부에서 스파이 활동을 했다", bonus:{disg:6, per:5, int:3}, aiHint:"기업 스파이의 위험한 이중 생활을 알고 경계한다" },
  { id:"cp_virus_creator", name:"바이러스 설계자", icon:"🦠", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"강력한 디지털 바이러스를 설계했다", bonus:{int:6, mgc:4, fear:4, rep:-3}, aiHint:"바이러스 설계자를 두려워하며 조심스럽게 대한다" },
  { id:"cp_implant_overload", name:"임플란트 과부하", icon:"⚡", rarity:"uncommon", cat:"사이버펑크", scenario:"cyberpunk", desc:"임플란트 과부하를 극복하고 새로운 한계에 도달했다", bonus:{end:5, wil:4, mad:3}, aiHint:"한계를 넘은 이 사람의 집착과 강인함을 느낀다" },
  { id:"cp_rogue_ai", name:"로그 AI 해방", icon:"🔓", rarity:"legendary", cat:"사이버펑크", scenario:"cyberpunk", desc:"통제를 벗어난 AI를 해방시키거나 제압했다", bonus:{int:5, wil:5, mgc:4, rep:4}, aiHint:"로그 AI와 마주한 이 사람의 결단력을 경외한다" },
  { id:"cp_neon_runner", name:"네온 러너", icon:"🏃", rarity:"uncommon", cat:"사이버펑크", scenario:"cyberpunk", desc:"경찰이나 기업 추격을 따돌리고 도주에 성공했다", bonus:{agi:5, cal:3, luk:3}, aiHint:"추격전에서 살아남은 생존력을 인정한다" },
  { id:"cp_datacore_breach", name:"데이터코어 침투", icon:"💾", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"최고 보안의 기업 데이터코어에 침투했다", bonus:{int:6, per:4, agi:3}, aiHint:"데이터코어 침투를 성공한 실력에 경이를 느낀다" },
  { id:"cp_underground_doc", name:"언더그라운드 의사", icon:"💉", rarity:"uncommon", cat:"사이버펑크", scenario:"cyberpunk", desc:"비인가 수술로 동료를 살렸다", bonus:{int:4, fath:4, trst:5, rep:3}, aiHint:"비공식 의사에게 목숨을 빚진 사람처럼 신뢰한다" },
  { id:"cp_psycho_survived", name:"싸이코 생존자", icon:"🩺", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"사이버 사이코시스 발현 후 정신을 유지했다", bonus:{wil:6, mad:-5, end:4}, aiHint:"광기의 경계에서 돌아온 이 사람을 경외하며 걱정한다" },
  { id:"cp_media_sensation", name:"미디어 센세이션", icon:"📡", rarity:"uncommon", cat:"사이버펑크", scenario:"cyberpunk", desc:"미디어에 의해 유명 인사가 됐다", bonus:{cha:5, rep:6, fear:3}, aiHint:"미디어 스타로서의 명성을 알고 주목한다" },
  { id:"cp_net_architect", name:"넷 설계자", icon:"🌐", rarity:"legendary", cat:"사이버펑크", scenario:"cyberpunk", desc:"사이버공간의 구조 자체를 바꿀 코드를 설계했다", bonus:{int:7, mgc:5, rep:5, wil:4}, aiHint:"사이버공간을 설계하는 천재에게 경외를 느낀다" },
  { id:"cp_clone_mystery", name:"클론의 비밀", icon:"👥", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"자신의 클론 또는 복제물의 존재를 알게 됐다", bonus:{per:5, wil:4, mad:4}, aiHint:"클론의 비밀을 알게 된 이 사람의 혼란을 느낀다" },
  { id:"cp_drug_lord", name:"약물 군주", icon:"💊", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"강화 약물의 제조 및 유통망을 장악했다", bonus:{neg:5, fear:5, pstx:4, rep:-3}, aiHint:"약물 군주의 거래를 조심스럽게 받아들인다" },
  { id:"cp_rebel_hero", name:"반란의 영웅", icon:"✊", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"기업 독재에 맞선 반란을 이끌었다", bonus:{ldr:6, wil:5, rep:5, fear:3}, aiHint:"반란의 영웅으로서 강렬한 동경과 지지를 받는다" },
  { id:"cp_ghost_protocol", name:"고스트 프로토콜", icon:"🌫️", rarity:"legendary", cat:"사이버펑크", scenario:"cyberpunk", desc:"공식 기록에서 완전히 지워졌다", bonus:{disg:8, per:5, agi:4}, aiHint:"존재가 지워진 이 사람의 정체에 호기심을 느낀다" },
  { id:"cp_enhanced_senses", name:"강화 감각", icon:"👁️", rarity:"uncommon", cat:"사이버펑크", scenario:"cyberpunk", desc:"감각 임플란트로 인지 능력이 극대화됐다", bonus:{per:7, intn:4, agi:2}, aiHint:"강화된 감각을 가진 이 사람에게서 예리함이 느껴진다" },
  { id:"cp_corpo_exec", name:"코퍼레이트 임원", icon:"👔", rarity:"rare", cat:"사이버펑크", scenario:"cyberpunk", desc:"대기업의 고위 임원 자리에 올랐다", bonus:{ldr:5, neg:5, rep:4}, aiHint:"임원의 권위를 인정하며 유리하게 활용하려 한다" },
  { id:"cp_salvager", name:"폐허 수집가", icon:"🔧", rarity:"common", cat:"사이버펑크", scenario:"cyberpunk", desc:"폐허에서 귀중한 기술 유물을 발굴했다", bonus:{int:3, per:3, luk:3}, aiHint:"폐허 수집가의 발견물에 흥미를 보인다" },
  { id:"cp_digital_ghost", name:"디지털 망령", icon:"💀", rarity:"legendary", cat:"사이버펑크", scenario:"cyberpunk", desc:"의식이 사이버공간에 복사됐다", bonus:{int:6, mgc:5, mad:6, wil:5}, aiHint:"디지털 망령의 존재에 경외와 두려움을 동시에 느낀다" },
  { id:"cp_last_human", name:"마지막 순수 인간", icon:"🧬", rarity:"legendary", cat:"사이버펚크", scenario:"cyberpunk", desc:"임플란트 없이 순수한 인간으로 살아가기로 결심했다", bonus:{wil:6, cal:5, luk:4, fath:3}, aiHint:"순수 인간으로 살아가는 선택에 깊은 존경을 느낀다" },
  { id:"cp_revolution", name:"혁명의 불씨", icon:"🔥", rarity:"legendary", cat:"사이버펑크", scenario:"cyberpunk", desc:"도시 전체를 뒤흔드는 혁명을 일으켰다", bonus:{ldr:7, wil:5, rep:6, fear:5}, aiHint:"혁명을 일으킨 이 사람을 두려워하거나 따르고 싶어한다" },
];

const RARITY_COLOR = { common:"#8a9a8a", uncommon:"#4a9a6a", rare:"#4a6fa5", legendary:"#c8a96e" };

// ══════════════════════════════════════════════════════
//  종족 시스템
// ══════════════════════════════════════════════════════
const RACE_DEFS = [
  {
    id: "human",
    name: "인간",
    icon: "🧑",
    color: "#c8a96e",
    accent: "#2a1f0d",
    desc: "적응력과 의지가 뛰어난 만물의 영장. 어떤 환경에서도 살아남는 균형의 종족.",
    lore: "인간은 마법도, 신체 능력도 특출나지 않지만 그 어떤 종족보다 빠르게 배우고 성장한다. 역사 속 대부분의 영웅들이 인간이었다는 사실이 이를 증명한다.",
    statBonus: { wil:5, luk:5, spk:3, neg:3, rep:2 },
    statPenalty: {},
    relations: {
      elf: { score: 30, label: "중립적 경계", desc: "오랜 역사 속 갈등과 교류가 혼재. 엘프는 인간의 짧은 수명을 안타까워한다." },
      dwarf: { score: 60, label: "우호 동맹", desc: "교역과 전투에서 수백 년 협력한 동반자 관계." },
      orc: { score: -40, label: "긴장된 적대", desc: "오랜 전쟁의 상흔이 남아있다. 일부 오크 부족과는 화평 중." },
      darkling: { score: -60, label: "깊은 불신", desc: "어둠의 종족과는 본능적 경계심이 있다." },
      celestial: { score: 20, label: "경외와 거리감", desc: "신성한 종족에 대한 존경과 두려움이 공존한다." },
    },
    skills: [
      { id:"race_human_adapt",   type:"passive", name:"빠른 적응",     icon:"🔄", rarity:"uncommon", req:{}, desc:"새로운 환경/직업에 적응 시 모든 스탯 판정에 +5 보너스.", condition:"new_situation", conditionDesc:"새로운 상황 진입 시", statBoost:{wil:5}, scenario:null, mpCost:0, aiHint:"빠른 적응 발동! 인간 특유의 적응력으로 상황을 빠르게 파악합니다." },
      { id:"race_human_will",    type:"active",  name:"불굴의 의지",   icon:"🔥", rarity:"uncommon", req:{wil:20}, mpCost:15, desc:"의지를 불태워 1턴간 모든 판정에 +10. HP가 낮을수록 효과 상승.", scenario:null, aiHint:"불굴의 의지 발동! 한계를 넘어서는 인간의 의지가 빛납니다." },
      { id:"race_human_destiny", type:"event",   name:"운명의 주인공", icon:"⭐", rarity:"rare",     req:{}, mpCost:0, desc:"인간은 운명을 스스로 개척한다. LUK +10, 다음 판정 대성공 확률 2배.", unlockTitle:"prophecy", scenario:null, aiHint:"운명의 주인공 발동! 인간의 운명이 스스로를 향해 빛납니다." },
    ],
  },
  {
    id: "elf",
    name: "엘프",
    icon: "🧝",
    color: "#7adf9a",
    accent: "#0a1f0f",
    desc: "수천 년을 사는 장수의 종족. 마법과 자연에 친화적이며 뛰어난 감각을 지닌다.",
    lore: "엘프는 오랜 삶 속에서 쌓인 지혜와 마법 친화력을 바탕으로 고대 문명을 이끌었다. 그러나 그만큼 감정을 억제하는 경향이 있으며, 단명하는 종족을 내심 가련히 여긴다.",
    statBonus: { mgc:8, per:6, agi:5, int:5, crse:-5 },
    statPenalty: { str:-3, end:-3 },
    relations: {
      human: { score: 30, label: "온화한 거리감", desc: "인간을 다소 유치하게 보지만 그 잠재력을 인정한다." },
      dwarf: { score: -30, label: "문화적 갈등", desc: "자연을 훼손하는 드워프 광업에 반감이 크다." },
      orc: { score: -70, label: "오랜 적대", desc: "역사적으로 가장 오래된 전쟁 상대. 본능적 혐오." },
      darkling: { score: -80, label: "빛과 어둠의 대립", desc: "근원적인 세계관의 충돌. 협력 거의 불가." },
      celestial: { score: 70, label: "신성한 친족", desc: "먼 혈통의 친척. 서로를 높이 여기며 협력한다." },
    },
    skills: [
      { id:"race_elf_arcane",   type:"passive", name:"마법 친화",     icon:"🔮", rarity:"uncommon", req:{mgc:20}, desc:"마법 스킬 사용 시 MP 소모 -5, 마법 판정 +8 보너스.", condition:"magic_use", conditionDesc:"마법 스킬 사용 시", statBoost:{mgc:8}, scenario:null, mpCost:0, aiHint:"마법 친화 발동! 엘프의 타고난 마법 친화력이 효과를 증폭시킵니다." },
      { id:"race_elf_truesight",type:"active",  name:"진실의 눈",     icon:"👁️", rarity:"rare",     req:{per:30}, mpCost:20, desc:"주변의 환상, 위장, 거짓을 꿰뚫어본다. PER +20, DISG 저항.", scenario:null, aiHint:"진실의 눈 발동! 엘프의 예리한 시야가 모든 환상을 걷어냅니다." },
      { id:"race_elf_forest",   type:"event",   name:"숲의 축복",     icon:"🌿", rarity:"rare",     req:{}, mpCost:0, desc:"자연 환경에서 HP/MP 자동 회복. 숲이나 자연 속에서 강력한 힘을 발휘.", unlockTitle:"explorer", scenario:null, aiHint:"숲의 축복 발동! 자연과 교감하며 엘프의 생명력이 회복됩니다." },
    ],
  },
  {
    id: "dwarf",
    name: "드워프",
    icon: "⛏️",
    color: "#c87a3a",
    accent: "#1a0f05",
    desc: "강인한 육체와 단단한 의지를 가진 대장장이 종족. 독과 마법에 강한 저항력을 보인다.",
    lore: "드워프는 산 속 깊은 곳에서 금속을 다루며 수천 년의 문명을 쌓았다. 느리지만 정확하고, 한 번 맺은 동맹은 절대 배신하지 않는다. 하지만 원한도 절대 잊지 않는다.",
    statBonus: { end:8, str:6, pstx:6, wil:5, regen:4 },
    statPenalty: { agi:-5, mgc:-4 },
    relations: {
      human: { score: 60, label: "신뢰의 동맹", desc: "오랜 교역 파트너. 서로의 단점을 보완하는 관계." },
      elf: { score: -30, label: "자존심 충돌", desc: "서로를 미개하다/거만하다고 본다. 협력은 하지만 불편하다." },
      orc: { score: -50, label: "영토 분쟁", desc: "산악 지대 자원을 두고 끊임없이 충돌." },
      darkling: { score: -60, label: "본능적 혐오", desc: "지하 세계를 공유하지만 사상이 완전히 다르다." },
      celestial: { score: 10, label: "어색한 존중", desc: "신성함보다 실리를 추구하는 드워프에겐 다소 낯선 존재." },
    },
    skills: [
      { id:"race_dwarf_forge",    type:"active",  name:"단조의 기예",   icon:"🔨", rarity:"uncommon", req:{str:25}, mpCost:10, desc:"전투 중 무기를 즉석 강화. STR +10, CRIT +8이 1턴 지속.", scenario:null, aiHint:"단조의 기예 발동! 드워프의 장인 기술로 무기가 순간 강화됩니다." },
      { id:"race_dwarf_resist",   type:"passive", name:"철벽 저항",     icon:"🛡️", rarity:"rare",     req:{end:30}, desc:"독/저주/마법 피해 25% 감소. PSTX, CRSE 저항 상시 적용.", condition:"always", conditionDesc:"항시 발동", statBoost:{end:5, pstx:5}, scenario:null, mpCost:0, aiHint:"철벽 저항 발동! 드워프의 강인한 체질이 피해를 흡수합니다." },
      { id:"race_dwarf_ancestor", type:"event",   name:"선조의 분노",   icon:"🪨", rarity:"legendary", req:{}, mpCost:0, desc:"HP가 30 이하가 되면 드워프 선조의 힘이 깨어나 STR +15, END +15.", unlockTitle:"duel_winner", scenario:null, aiHint:"선조의 분노 발동! 드워프 선조들의 투지가 깨어나 폭발합니다." },
    ],
  },
  {
    id: "orc",
    name: "오크",
    icon: "💀",
    color: "#5aaa3a",
    accent: "#0a1505",
    desc: "타고난 전사 종족. 전투에서 전혀 물러서지 않으며 압도적인 근력과 공포감을 발산한다.",
    lore: "오크는 오랫동안 미개한 약탈자로 오해받았지만, 사실 치밀한 전략과 강력한 부족 체계를 가진 종족이다. 힘이 곧 정의인 그들의 세계에서 강자는 존경받고 약자는 짐이 된다.",
    statBonus: { str:10, end:7, fear:6, hp:5, crit:4 },
    statPenalty: { cha:-5, spk:-4, mgc:-5 },
    relations: {
      human: { score: -40, label: "불안한 휴전", desc: "전쟁의 상흔이 남아있다. 신뢰하긴 어렵지만 이해관계가 맞으면 협력." },
      elf: { score: -70, label: "오랜 원수", desc: "수백 년의 전쟁. 화해는 거의 불가능에 가깝다." },
      dwarf: { score: -50, label: "자원 쟁탈", desc: "산악 자원을 두고 끊임없이 충돌한다." },
      darkling: { score: 20, label: "힘의 연대", desc: "약자를 무시하는 세계관이 비슷해 드물게 협력한다." },
      celestial: { score: -80, label: "신성의 거부", desc: "천상 종족의 권위와 우월감을 극도로 거부한다." },
    },
    skills: [
      { id:"race_orc_rage",    type:"active",  name:"전쟁의 함성",   icon:"😤", rarity:"uncommon", req:{str:30}, mpCost:0, desc:"전투 시작 시 함성을 질러 STR +15, FEAR +10. 적의 판정에 -8 패널티 부여.", scenario:null, aiHint:"전쟁의 함성 발동! 오크의 광포한 함성이 전장을 뒤덮습니다." },
      { id:"race_orc_blood",   type:"passive", name:"전투의 피",     icon:"🩸", rarity:"rare",     req:{end:30}, desc:"전투 중 피해를 받을수록 STR +2씩 누적 상승 (최대 +20).", condition:"taking_damage", conditionDesc:"피해 받을 때마다", statBoost:{str:2}, scenario:null, mpCost:0, aiHint:"전투의 피 발동! 오크의 야성이 깨어나 강해집니다." },
      { id:"race_orc_berserker",type:"event",  name:"광전사 각성",  icon:"💢", rarity:"legendary", req:{}, mpCost:0, desc:"HP 20 이하에서 광전사 상태 돌입. STR +25, END +20, 하지만 통제 불능.", unlockTitle:"duel_winner", scenario:null, aiHint:"광전사 각성 발동! 오크의 본능이 완전히 해방되어 폭주합니다." },
    ],
  },
  {
    id: "darkling",
    name: "다크링",
    icon: "🌑",
    color: "#9a6adf",
    accent: "#0a050f",
    desc: "어둠에서 태어난 신비로운 존재. 그림자와 죽음을 다루며 공포와 저주를 자유롭게 사용한다.",
    lore: "다크링은 어둠 세계와 현실 세계 사이의 균열에서 탄생했다. 그들은 죽음을 두려워하지 않으며, 오히려 죽음과의 교감으로 힘을 끌어낸다. 다른 종족에게 본능적 공포를 자아내지만, 내면은 오히려 깊은 철학과 고독함을 담고 있다.",
    statBonus: { mgc:8, mad:6, fear:7, per:5, crse:5 },
    statPenalty: { fath:-8, trst:-5, luk:-3 },
    relations: {
      human: { score: -60, label: "두려움과 혐오", desc: "인간은 다크링을 본능적으로 두려워하고 기피한다." },
      elf: { score: -80, label: "빛과 어둠의 대립", desc: "엘프의 순수한 마법이 다크링과 충돌한다." },
      dwarf: { score: -60, label: "저주의 적", desc: "드워프는 저주를 가장 두려워한다." },
      orc: { score: 20, label: "힘의 동족", desc: "서로의 어두운 본성을 인정하며 드물게 협력." },
      celestial: { score: -100, label: "불구대천의 원수", desc: "존재 자체가 상반된다. 공존 불가." },
    },
    skills: [
      { id:"race_darkling_shadow",  type:"active",  name:"그림자 지배",   icon:"🌑", rarity:"rare",     req:{mgc:30, mad:20}, mpCost:25, desc:"주변 그림자를 지배해 적을 속박하거나 도망친다. AGI +15, DISG +10.", scenario:null, aiHint:"그림자 지배 발동! 다크링의 어둠이 주변 그림자를 장악합니다." },
      { id:"race_darkling_curse",   type:"active",  name:"공포의 저주",   icon:"😱", rarity:"rare",     req:{fear:30, crse:20}, mpCost:20, desc:"대상에게 공포 저주를 걸어 모든 판정 -15. FEAR +10 추가.", scenario:null, aiHint:"공포의 저주 발동! 다크링의 저주가 대상의 정신을 옥죕니다." },
      { id:"race_darkling_undeath", type:"event",   name:"불멸의 각성",   icon:"💀", rarity:"legendary", req:{}, mpCost:0, desc:"사망 직전 한 번 더 부활. HP 1로 생존하며 MAD +15, MGC +10 폭발 상승.", unlockTitle:"hidden_silence", scenario:null, aiHint:"불멸의 각성 발동! 다크링이 죽음의 경계에서 귀환했습니다." },
    ],
  },
  {
    id: "celestial",
    name: "세레스티얼",
    icon: "✨",
    color: "#ffe066",
    accent: "#1a1a00",
    desc: "신성한 빛으로 이루어진 천상의 종족. 치유와 신앙의 힘이 탁월하며 축복을 내리는 존재.",
    lore: "세레스티얼은 신의 의지가 깃든 천상 존재의 후손이다. 빛과 생명의 원천에 가까워 강력한 치유와 신앙 능력을 보유하지만, 그 순수함 때문에 어둠과 부패에 극도로 취약하다. 지상에서 살아가는 것 자체가 그들에게 시련이다.",
    statBonus: { fath:10, mgc:6, trst:7, rep:5, wil:4 },
    statPenalty: { mad:-10, fear:-5, str:-3 },
    relations: {
      human: { score: 20, label: "축복의 시선", desc: "인간을 가련히 여기지만 보호하고 인도하려 한다." },
      elf: { score: 70, label: "친족의 유대", desc: "같은 빛의 계보를 잇는 존재로 서로를 높이 여긴다." },
      dwarf: { score: 10, label: "어색한 존중", desc: "실용적인 드워프와 결이 다르지만 선의가 있다." },
      orc: { score: -80, label: "정화 대상", desc: "오크의 폭력성을 정화해야 할 악으로 본다." },
      darkling: { score: -100, label: "존재의 대립", desc: "빛과 어둠은 공존 불가. 반드시 한쪽이 사라져야 한다." },
    },
    skills: [
      { id:"race_celestial_light",  type:"active",  name:"성광 치유",     icon:"💛", rarity:"uncommon", req:{fath:25}, mpCost:20, hpRestore:20, desc:"신성한 빛으로 HP +20 회복. 저주와 독도 동시에 정화한다.", scenario:null, aiHint:"성광 치유 발동! 세레스티얼의 빛이 상처와 저주를 정화합니다." },
      { id:"race_celestial_aura",   type:"passive", name:"신성의 오라",   icon:"✨", rarity:"rare",     req:{fath:30}, desc:"아군 전체에 신성 방어막 부여. 저주/독/어둠 피해 30% 감소.", condition:"always", conditionDesc:"항시 발동", statBoost:{fath:5}, scenario:null, mpCost:0, aiHint:"신성의 오라 발동! 세레스티얼의 신성한 기운이 아군을 보호합니다." },
      { id:"race_celestial_grace",  type:"event",   name:"신의 가호",     icon:"🌟", rarity:"legendary", req:{}, mpCost:0, desc:"위기의 순간 신의 가호가 내려와 모든 스탯 +15, 1턴간 무적.", unlockTitle:"mf_holy_light", scenario:null, aiHint:"신의 가호 발동! 신성한 빛이 세레스티얼을 감싸며 기적이 일어납니다." },
    ],
  },
  {
    id: "dragon",
    name: "드래곤혈",
    icon: "🐉",
    color: "#e06030",
    accent: "#1a0800",
    desc: "용의 피가 흐르는 반룡 종족. 화염과 냉기를 자유롭게 다루며 압도적인 존재감을 발산한다.",
    lore: "먼 옛날 인간과 고룡의 결합에서 탄생한 종족. 완전한 드래곤도, 완전한 인간도 아니지만 그 어느 쪽보다 강렬하게 세상을 불태우는 존재들이다. 분노할수록 드래곤의 본능이 눈을 뜬다.",
    statBonus: { str:8, mgc:8, fear:8, end:5, crit:5 },
    statPenalty: { trst:-6, cha:-3, cal:-5 },
    relations: {
      human: { score: -20, label: "공포의 대상", desc: "인간은 드래곤혈을 경외하며 두려워한다." },
      elf: { score: -10, label: "고대의 라이벌", desc: "고대부터 용과 엘프는 마법의 패권을 다퉜다." },
      dwarf: { score: -30, label: "숙적", desc: "드워프는 용의 보물을 탐내고, 용은 드워프의 탐욕을 혐오한다." },
      orc: { score: 30, label: "힘의 경외", desc: "오크는 드래곤혈의 힘을 진심으로 존경한다." },
      darkling: { score: -10, label: "어둠과 불꽃", desc: "서로의 파괴적 본성을 인정하나 협력은 드물다." },
      celestial: { score: -50, label: "천상과 용의 대립", desc: "천상의 질서와 용의 혼돈 본능은 충돌한다." },
    },
    skills: [
      { id:"race_dragon_breath", type:"active", name:"용의 숨결", icon:"🔥", rarity:"rare", req:{mgc:25}, mpCost:25, desc:"화염 혹은 냉기 숨결을 내뿜어 범위 피해. 적에게 공포 상태를 부여한다.", scenario:null, aiHint:"용의 숨결 발동! 드래곤의 불꽃이 적을 집어삼킵니다." },
      { id:"race_dragon_scale",  type:"passive", name:"용린 방어", icon:"🐉", rarity:"rare",   req:{end:25}, desc:"용의 비늘이 물리·마법 피해를 15% 감소. STR, END 판정 +6 상시 보너스.", condition:"always", conditionDesc:"항시 발동", statBoost:{str:6,end:6}, scenario:null, mpCost:0, aiHint:"용린 방어 발동! 비늘이 빛나며 피해를 흡수합니다." },
      { id:"race_dragon_awaken", type:"event", name:"용신 각성", icon:"🌋", rarity:"legendary", req:{}, mpCost:0, desc:"HP 25% 이하에서 진정한 드래곤 혈통이 깨어난다. STR·MGC·FEAR +20, 2턴 지속.", unlockTitle:"mf_dragon_blood", scenario:null, aiHint:"용신 각성! 드래곤의 진혈이 폭발적으로 해방됩니다!" },
    ],
  },
  {
    id: "demon",
    name: "악마족",
    icon: "😈",
    color: "#cc2244",
    accent: "#1a0005",
    desc: "심연에서 온 계약의 종족. 욕망과 거래를 통해 힘을 쌓으며 강렬한 카리스마로 타인을 지배한다.",
    lore: "악마족은 탄생부터 계약의 존재다. 원하는 것을 얻기 위해 반드시 무언가를 내주어야 한다는 불변의 법칙 속에서 살아간다. 가장 위험한 것은 그들의 날카로운 지성과 말재주다.",
    statBonus: { mgc:7, neg:8, cha:7, fear:6, mad:5 },
    statPenalty: { fath:-12, trst:-8, wil:-3 },
    relations: {
      human: { score: -30, label: "먹잇감과 계약자", desc: "악마에게 인간은 계약 대상이자 욕망의 원천." },
      elf: { score: -50, label: "순수함의 적", desc: "엘프의 순수한 마법과 악마의 부패한 힘은 상극." },
      dwarf: { score: -20, label: "거래 상대", desc: "드워프의 탐욕은 악마에게 좋은 협상 카드가 된다." },
      orc: { score: 10, label: "힘의 동맹", desc: "오크의 폭력성과 악마의 잔혹함은 때때로 맞닿는다." },
      darkling: { score: 50, label: "어둠의 동족", desc: "같은 어둠에서 태어난 동족. 음모를 공유한다." },
      celestial: { score: -100, label: "영원한 적", desc: "천상과 심연은 존재 자체로 충돌한다." },
    },
    skills: [
      { id:"race_demon_contract", type:"active", name:"계약 강요", icon:"📜", rarity:"rare",    req:{neg:30,cha:25}, mpCost:20, desc:"대화 중 상대에게 불리한 계약을 강요. NEG +20, CHA +15 판정 보너스.", scenario:null, aiHint:"계약 강요 발동! 악마의 말이 상대의 의지를 옥죄기 시작합니다." },
      { id:"race_demon_corrupt",  type:"passive", name:"부패의 오라", icon:"😈", rarity:"rare",   req:{mad:25}, desc:"주변 적의 신앙(FATH)과 의지(WIL)를 매 턴 -3씩 약화시킨다.", condition:"in_combat", conditionDesc:"전투 중 항시", statBoost:{fear:5}, scenario:null, mpCost:0, aiHint:"부패의 오라 발동! 주변의 의지와 신앙심이 서서히 썩어갑니다." },
      { id:"race_demon_pureform", type:"event",  name:"진상 해방", icon:"🔴", rarity:"legendary", req:{}, mpCost:0, desc:"HP 15 이하 시 악마의 진짜 모습으로 변신. 모든 스탯 +15, 저주·공포 면역, 1회 사용.", unlockTitle:"mf_dark_pact", scenario:null, aiHint:"진상 해방! 악마의 본 모습이 드러나며 공기가 부패합니다!" },
    ],
  },
  {
    id: "undead",
    name: "언데드",
    icon: "💀",
    color: "#7788aa",
    accent: "#050810",
    desc: "죽음과 삶의 경계를 넘나드는 존재. 고통을 느끼지 못하며 저주와 독에 완전 면역이다.",
    lore: "언데드는 강렬한 집착이나 비극적 죽음으로 인해 저승의 문을 통과하지 못한 존재들이다. 죽음을 이미 경험했기에 두려움이란 없다. 그러나 그 대가로 살아있는 존재와의 깊은 유대는 불가능에 가깝다.",
    statBonus: { end:10, pstx:15, wil:6, crse:6, hp:10 },
    statPenalty: { cha:-8, trst:-10, fath:-8, regen:-5 },
    relations: {
      human: { score: -70, label: "공포의 원천", desc: "살아있는 인간들은 언데드를 본능적으로 혐오한다." },
      elf: { score: -60, label: "삶의 적", desc: "생명의 수호자인 엘프는 언데드를 정화 대상으로 본다." },
      dwarf: { score: -50, label: "지하의 공포", desc: "지하에서 자주 마주치는 위협. 드워프의 주요 적." },
      orc: { score: -20, label: "무서운 존재", desc: "오크도 언데드를 쉽게 대하지 못한다." },
      darkling: { score: 60, label: "죽음의 동족", desc: "죽음과 가장 친숙한 다크링은 언데드를 이해한다." },
      celestial: { score: -100, label: "정화 대상", desc: "천상의 존재에게 언데드는 반드시 소멸시켜야 할 존재." },
    },
    skills: [
      { id:"race_undead_undying",  type:"passive", name:"죽지 않는 몸", icon:"💀", rarity:"rare",    req:{end:20}, desc:"독·저주 완전 면역. HP가 0이 되어도 1회 자동으로 HP 5로 부활.", condition:"death", conditionDesc:"사망 직전 1회", statBoost:{end:8}, scenario:null, mpCost:0, aiHint:"죽지 않는 몸 발동! 언데드는 쉽게 죽지 않습니다." },
      { id:"race_undead_drain",    type:"active",  name:"생명 흡수", icon:"🩸", rarity:"uncommon",  req:{mgc:20}, mpCost:15, desc:"적의 생명력을 흡수. 적 HP -10, 자신 HP +10. 저주 판정 +12.", scenario:null, aiHint:"생명 흡수 발동! 언데드의 손에서 차가운 기운이 뻗어나갑니다." },
      { id:"race_undead_terror",   type:"event",   name:"죽음의 위압", icon:"☠️", rarity:"legendary", req:{}, mpCost:0, desc:"진정한 공포를 발산. 범위 내 모든 적 FEAR 판정 -20, 적이 공격 포기 가능.", unlockTitle:"hidden_silence", scenario:null, aiHint:"죽음의 위압 발동! 죽음의 기운이 적들의 전의를 꺾습니다." },
    ],
  },
  {
    id: "beastman",
    name: "수인",
    icon: "🐺",
    color: "#aa8844",
    accent: "#100a00",
    desc: "짐승의 본능과 인간의 이성을 겸비한 종족. 뛰어난 감각과 야생 전투 능력을 가진다.",
    lore: "수인은 인간과 짐승의 혼혈로 탄생한 다양한 종족을 통칭한다. 늑대인간, 호랑이인간, 독수리인간 등 그 형태는 다양하지만 공통적으로 날카로운 감각과 야생의 전투 본능을 공유한다.",
    statBonus: { str:7, agi:8, per:8, end:5, crit:5 },
    statPenalty: { mgc:-6, neg:-4, spk:-3 },
    relations: {
      human: { score: 10, label: "불안한 공존", desc: "인간 사회와 공존하지만 차별과 편견이 존재한다." },
      elf: { score: 30, label: "자연의 친족", desc: "자연과 가까운 두 종족은 의외로 잘 어울린다." },
      dwarf: { score: -20, label: "문화 충돌", desc: "기계적인 드워프 문명과 야생 수인 문화가 충돌한다." },
      orc: { score: 50, label: "야생의 동족", desc: "같은 전사 종족으로서 서로를 강자로 인정한다." },
      darkling: { score: -30, label: "어둠의 위협", desc: "야생의 본능이 어둠의 존재에 강한 경계심을 보낸다." },
      celestial: { score: 20, label: "순수함의 인정", desc: "야생의 순수함을 천상도 어느 정도 인정한다." },
    },
    skills: [
      { id:"race_beast_instinct", type:"passive", name:"야생의 직감", icon:"🐺", rarity:"uncommon", req:{per:25}, desc:"기습·매복 당할 확률 0. 선제공격 시 CRIT +10 보너스.", condition:"always", conditionDesc:"항시 발동", statBoost:{per:5,crit:5}, scenario:null, mpCost:0, aiHint:"야생의 직감 발동! 수인의 날카로운 감각이 위험을 미리 감지합니다." },
      { id:"race_beast_frenzy",   type:"active",  name:"야수 광란", icon:"🔴", rarity:"rare",    req:{str:30}, mpCost:0, desc:"야수의 본능으로 광란. STR +15, AGI +10. 하지만 이성 판정 -10.", scenario:null, aiHint:"야수 광란 발동! 수인의 야성이 완전히 해방되어 날뛰기 시작합니다." },
      { id:"race_beast_hunt",     type:"event",   name:"사냥꾼의 표식", icon:"🎯", rarity:"legendary", req:{}, mpCost:0, desc:"한 적을 '사냥감'으로 지정. 해당 적에 대한 모든 판정 +20, 도주 불가 상태 부여.", unlockTitle:"duel_winner", scenario:null, aiHint:"사냥꾼의 표식 발동! 수인의 눈에 사냥감이 포착되었습니다." },
    ],
  },
  {
    id: "elemental",
    name: "원소인",
    icon: "🌀",
    color: "#44aacc",
    accent: "#001520",
    desc: "자연 원소와 융합된 존재. 불·물·바람·대지 중 하나와 공명하며 그 원소를 자유롭게 다룬다.",
    lore: "원소인은 고대 마법 실험이나 강렬한 원소 노출로 인해 원소 에너지가 체내에 스며든 존재들이다. 자신이 공명하는 원소에선 무적에 가깝지만 반대 원소에는 치명적인 약점을 가진다.",
    statBonus: { mgc:10, mp:15, per:6, agi:5 },
    statPenalty: { end:-5, hp:-5, trst:-3 },
    relations: {
      human: { score: 20, label: "신기함과 경외", desc: "인간은 원소인을 신기하면서도 무서워한다." },
      elf: { score: 60, label: "자연의 친족", desc: "자연과 가까운 엘프는 원소인과 깊이 교감한다." },
      dwarf: { score: -20, label: "위험한 존재", desc: "불을 다루는 원소인은 드워프 광산에 위협이 된다." },
      orc: { score: -10, label: "낯선 힘", desc: "오크는 원소인의 힘을 이해하기 어렵다." },
      darkling: { score: -20, label: "빛과 원소의 충돌", desc: "자연의 순수한 힘은 어둠을 밀어낸다." },
      celestial: { score: 40, label: "자연의 신성", desc: "자연 원소의 순수함을 천상이 인정한다." },
    },
    skills: [
      { id:"race_elem_resonance", type:"passive", name:"원소 공명", icon:"🌀", rarity:"rare",    req:{mgc:25}, desc:"자신의 원소 속성 스킬 사용 시 효과 +30%. MP 소모 -8.", condition:"magic_use", conditionDesc:"원소 스킬 사용 시", statBoost:{mgc:8}, scenario:null, mpCost:0, aiHint:"원소 공명 발동! 몸 속 원소 에너지가 공명하며 증폭됩니다." },
      { id:"race_elem_burst",     type:"active",  name:"원소 폭발", icon:"💥", rarity:"rare",    req:{mgc:30,mp:30}, mpCost:30, desc:"내재된 원소를 폭발시켜 범위 공격. 마법 피해 최대화.", scenario:null, aiHint:"원소 폭발 발동! 원소 에너지가 한꺼번에 해방되며 폭발합니다!" },
      { id:"race_elem_form",      type:"event",   name:"원소 변신", icon:"⚡", rarity:"legendary", req:{}, mpCost:0, desc:"3턴간 순수 원소 형태로 변신. 모든 원소 피해 무효, MGC·PER +20.", unlockTitle:"wx_qi_awakened", scenario:null, aiHint:"원소 변신 발동! 육체가 사라지고 순수한 원소 에너지체가 됩니다!" },
    ],
  },
];

const RACE_KEY = "taleforge-race";
const loadRace = () => { const r = lsGet(RACE_KEY); return r ? JSON.parse(r) : null; };
const saveRace = (race) => lsSet(RACE_KEY, JSON.stringify(race));
const clearRace = () => lsDel(RACE_KEY);

const saveApiKeys  = (keys) => lsSet(API_KEYS_STORAGE, JSON.stringify(keys));
const loadApiKeys  = () => { const r = lsGet(API_KEYS_STORAGE); return r ? JSON.parse(r) : []; };
const saveKeyIndex = (i) => lsSet(API_KEY_INDEX_STORAGE, String(i));
const loadKeyIndex = () => { const r = lsGet(API_KEY_INDEX_STORAGE); return r ? parseInt(r, 10) : 0; };

// ══════════════════════════════════════════════════════
//  환생 누적 시스템 (1~10번)
// ══════════════════════════════════════════════════════

// ── 1번: 전생 기억 열람 ──
// pastLife.summary 에 이미 저장됨. 추가로 "기억 파편" 목록 저장
const MEMORY_FRAGMENTS_KEY = "taleforge-memfrags";
const loadMemoryFragments = () => { const r = lsGet(MEMORY_FRAGMENTS_KEY); return r ? JSON.parse(r) : []; };
const saveMemoryFragments = (f) => lsSet(MEMORY_FRAGMENTS_KEY, JSON.stringify(f));
const clearMemoryFragments = () => lsDel(MEMORY_FRAGMENTS_KEY);
// 기억 파편 추가 유틸
const addMemoryFragment = (text, type="general") => {
  const frags = loadMemoryFragments();
  const newFrag = { id: Date.now(), text: text.slice(0, 120), type, createdAt: new Date().toISOString() };
  saveMemoryFragments([...frags.slice(-29), newFrag]); // 최대 30개
};

// ── 2번: 전생 인연 ──
// pastLife 안에 intimateNpcs 배열로 저장: [{ name, affinity }]
// 환생 후 첫 만남에서 호감도 보너스 적용

// ── 3번: 업보/카르마 ──
// 이미 stats.krma 로 관리됨. 환생 시 pastLife.karmaScore 로 이월.
// 업보 효과 정의
const KARMA_EFFECTS = {
  // karmaScore 0~100 (높을수록 악)
  blessing: { threshold: 0, maxThreshold: 30, label:"축복받은 영혼", icon:"✨", color:"#c8e066",
    statBonus: { luk:5, trst:5, rep:5 }, desc:"전생의 선행이 이번 생에 축복을 내린다. 행운·신뢰·평판 +5." },
  neutral:  { threshold: 31, maxThreshold: 69, label:"평범한 영혼", icon:"⚖️", color:"#c8a96e",
    statBonus: {}, desc:"전생의 업보가 평범하다. 특별한 보너스도 패널티도 없다." },
  cursed1:  { threshold: 70, maxThreshold: 84, label:"어둠의 기억", icon:"🌑", color:"#aa6644",
    statPenalty: { trst:-5, rep:-5 }, desc:"전생의 악행 잔향. 첫 만남에서 NPC들이 근거 없이 경계한다." },
  cursed2:  { threshold: 85, maxThreshold: 94, label:"저주받은 영혼", icon:"💀", color:"#cc4444",
    statPenalty: { trst:-10, rep:-10, luk:-5 }, desc:"무거운 죄업. 주변의 시선이 차갑고 운도 따르지 않는다." },
  condemned:{ threshold: 95, maxThreshold: 100, label:"업보의 심판", icon:"🔥", color:"#ff4444",
    statPenalty: { trst:-10, rep:-10, luk:-5, mad:10, crse:10 }, desc:"전생의 극악한 업보. 현상수배·저주·광기로 시작한다." },
};
const getKarmaEffect = (score) => Object.values(KARMA_EFFECTS).find(e => score >= e.threshold && score <= e.maxThreshold) || KARMA_EFFECTS.neutral;

// ── 4번: 전생 유물 ──
const PAST_RELICS_KEY = "taleforge-pastrelics";
const loadPastRelics = () => { const r = lsGet(PAST_RELICS_KEY); return r ? JSON.parse(r) : []; };
const savePastRelics = (v) => lsSet(PAST_RELICS_KEY, JSON.stringify(v));
const clearPastRelics = () => lsDel(PAST_RELICS_KEY);
// 유물 정의 (특정 조건 달성 시 다음 생에 인벤토리 등장)
const RELIC_DEFS = [
  { id:"relic_hero_sword",   name:"어디선가 본 듯한 검",    icon:"⚔️", rarity:"rare",      condition:"duel_winner",    conditionDesc:"전생에서 결투에서 승리", desc:"전생에서 쓰던 검인 것 같다. 손에 익숙한 무게감이 있다.",         effects:{str:8, crit:6} },
  { id:"relic_traveler_map", name:"바래진 지도",             icon:"🗺️", rarity:"uncommon",  condition:"explorer",       conditionDesc:"전생에서 탐험가 칭호 획득", desc:"전생에서 직접 그린 것 같은 낡은 지도. 어딘가 익숙하다.",         effects:{per:6, luk:4} },
  { id:"relic_dark_tome",    name:"검은 표지의 책",          icon:"📕", rarity:"rare",      condition:"hidden_silence", conditionDesc:"전생에서 비밀을 지켜냄", desc:"전생에서 읽었던 것 같은 금서. 내용이 기억날 듯 말 듯 하다.",       effects:{mgc:8, mad:3} },
  { id:"relic_lucky_coin",   name:"낡은 금화",               icon:"🪙", rarity:"common",    condition:"karma_good",     conditionDesc:"전생 업보 30 이하", desc:"전생에서 늘 갖고 다니던 금화인 것 같다. 왠지 버릴 수가 없다.",     effects:{luk:8, gold:100} },
  { id:"relic_cursed_ring",  name:"기억이 없는 반지",        icon:"💍", rarity:"legendary", condition:"karma_bad",      conditionDesc:"전생 업보 80 이상", desc:"어떻게 손가락에 끼워졌는지 모르겠다. 벗기려 하면 손이 떨린다.",   effects:{str:5, mad:8, crse:5} },
];
// 전생 조건 달성 여부로 유물 지급
const checkRelicCondition = (pastLife, condition) => {
  if (!pastLife) return false;
  if (condition === "karma_good")  return (pastLife.karmaScore || 50) <= 30;
  if (condition === "karma_bad")   return (pastLife.karmaScore || 50) >= 80;
  const titles = pastLife.titles || [];
  return titles.some(t => t.id === condition);
};

// ── 5번: 파괴된 아티팩트 복원 ──
const ARTIFACT_SHARDS_KEY = "taleforge-artifactshards";
const loadArtifactShards = () => { const r = lsGet(ARTIFACT_SHARDS_KEY); return r ? JSON.parse(r) : 0; };
const saveArtifactShards = (n) => lsSet(ARTIFACT_SHARDS_KEY, String(n));
const clearArtifactShards = () => lsDel(ARTIFACT_SHARDS_KEY);
const ARTIFACT_MAX_SHARDS = 5; // 5회차에 완성
const ARTIFACT_COMPLETE = {
  name:"봉인된 유물 — 완전체", icon:"🏺", rarity:"legendary",
  desc:"다섯 회차에 걸쳐 모은 파편이 하나로 합쳐졌다. 압도적인 힘이 느껴진다.",
  effects:{ str:15, mgc:15, luk:10, end:10, hp:20 }
};

// ── 6번: 영혼 각인 무기 ──
const SOUL_WEAPON_KEY = "taleforge-soulweapon";
const loadSoulWeapon = () => { const r = lsGet(SOUL_WEAPON_KEY); return r ? JSON.parse(r) : null; };
const saveSoulWeapon = (w) => lsSet(SOUL_WEAPON_KEY, JSON.stringify(w));
const clearSoulWeapon = () => lsDel(SOUL_WEAPON_KEY);
// 전생에서 가장 많이 쓴 무기 계열 추적
const WEAPON_AFFINITY_KEY = "taleforge-weaponaffinity";
const loadWeaponAffinity = () => { const r = lsGet(WEAPON_AFFINITY_KEY); return r ? JSON.parse(r) : {}; };
const saveWeaponAffinity = (w) => lsSet(WEAPON_AFFINITY_KEY, JSON.stringify(w));
const clearWeaponAffinity = () => lsDel(WEAPON_AFFINITY_KEY);
// 무기 계열 정의
const WEAPON_TYPES = {
  sword:  { name:"검",   icon:"⚔️", bonus:{str:8, crit:6},  desc:"전생에서 검을 주로 썼다. 손에 익숙하다." },
  staff:  { name:"지팡이",icon:"🪄", bonus:{mgc:8, mp:10},   desc:"전생에서 마법을 즐겨 썼다. 집중력이 높아진다." },
  bow:    { name:"활",   icon:"🏹", bonus:{agi:8, per:6},   desc:"전생에서 활을 주로 썼다. 원거리 감각이 살아있다." },
  dagger: { name:"단검", icon:"🗡️", bonus:{agi:6, disg:6}, desc:"전생에서 단검을 선호했다. 빠른 손놀림이 익숙하다." },
  fist:   { name:"맨손", icon:"👊", bonus:{str:6, end:8},   desc:"전생에서 맨손 전투를 즐겼다. 몸이 먼저 반응한다." },
};
const incrementWeaponAffinity = (type) => {
  if (!WEAPON_TYPES[type]) return;
  const aff = loadWeaponAffinity();
  aff[type] = (aff[type] || 0) + 1;
  saveWeaponAffinity(aff);
};
const getTopWeapon = () => {
  const aff = loadWeaponAffinity();
  if (!Object.keys(aff).length) return null;
  return Object.entries(aff).sort((a,b) => b[1]-a[1])[0][0];
};

// ── 7번: 전생 칭호 계승 ──
// 이미 ReincarnationScreen에서 최대 5개 선택 가능. 칭호별 패시브 효과 추가.
// TITLE_DEFS에 passiveBonus 필드 추가 (app.js에서 처리)

// ── 8번: 악명/명성 이월 ──
const FAME_LEGACY_KEY = "taleforge-famelegacy";
const loadFameLegacy = () => { const r = lsGet(FAME_LEGACY_KEY); return r ? JSON.parse(r) : null; };
const saveFameLegacy = (f) => lsSet(FAME_LEGACY_KEY, JSON.stringify(f));
const clearFameLegacy = () => lsDel(FAME_LEGACY_KEY);
// fame: { type: "hero"|"villain"|"neutral", level: 1~5, characterName, scenario }
const FAME_LEVELS = {
  hero:    [
    { level:1, label:"덕망 있는 이",   npcReaction:"약간 친근하게",    repBonus:5  },
    { level:2, label:"알려진 영웅",    npcReaction:"호감을 갖고",       repBonus:10 },
    { level:3, label:"유명한 영웅",    npcReaction:"존경하며",          repBonus:15 },
    { level:4, label:"전설의 영웅",    npcReaction:"경외심을 갖고",     repBonus:20 },
    { level:5, label:"불멸의 영웅",    npcReaction:"성인처럼 대하며",   repBonus:25 },
  ],
  villain: [
    { level:1, label:"수상한 자",      npcReaction:"경계하며",          fearBonus:5  },
    { level:2, label:"악명 높은 자",   npcReaction:"두려워하며",        fearBonus:10 },
    { level:3, label:"공포의 존재",    npcReaction:"벌벌 떨며",         fearBonus:15 },
    { level:4, label:"전설의 악인",    npcReaction:"도망치려 하며",     fearBonus:20 },
    { level:5, label:"재앙의 화신",    npcReaction:"공황 상태로",       fearBonus:25 },
  ],
};
// rep/fear 기준으로 fame 결정
const determineFame = (rep, fear, karmaScore) => {
  if (rep >= fear && rep >= 60) {
    const level = Math.min(5, Math.ceil(rep / 20));
    return { type:"hero",    level, label: FAME_LEVELS.hero[level-1]?.label };
  } else if (fear > rep && fear >= 60) {
    const level = Math.min(5, Math.ceil(fear / 20));
    return { type:"villain", level, label: FAME_LEVELS.villain[level-1]?.label };
  }
  return { type:"neutral", level:0, label:"무명인" };
};

// ── 9번: 회차별 숨겨진 직업 ──
const CYCLE_COUNT_KEY = "taleforge-cyclecount";
const loadCycleCount = () => { const r = lsGet(CYCLE_COUNT_KEY); return r ? parseInt(r,10) : 0; };
const saveCycleCount = (n) => lsSet(CYCLE_COUNT_KEY, String(n));
// 각성 클래스 정의 (회차별 해금)
const AWAKENED_JOBS = [
  { id:"reincarnator",  name:"환생자",    icon:"♾️", minCycle:3,  rarity:"rare",
    desc:"여러 생을 거친 자. 전생 기억에서 지식을 끌어낸다.",
    bonus:{luk:8, per:8, int:5}, hint:"전생 기억을 실전에 활용합니다." },
  { id:"prophet",       name:"예언자",    icon:"🔮", minCycle:5,  rarity:"rare",
    desc:"운명의 흐름을 읽는 자. 앞일을 희미하게 예감한다.",
    bonus:{per:10, int:8, wil:6}, hint:"미래의 단서를 포착합니다." },
  { id:"soul_walker",   name:"영혼 방랑자",icon:"👻", minCycle:7,  rarity:"legendary",
    desc:"삶과 죽음의 경계를 자유로이 걷는 자.",
    bonus:{mgc:12, mad:8, per:8}, hint:"죽음에 가까울수록 힘이 강해집니다." },
  { id:"fate_weaver",   name:"운명의 직조자",icon:"🕸️", minCycle:10, rarity:"legendary",
    desc:"인과율을 손으로 짜듯 조종할 수 있는 극소수의 존재.",
    bonus:{luk:15, per:12, wil:10}, hint:"운명의 실을 느낄 수 있습니다." },
];
const getUnlockedAwakenedJobs = () => {
  const cycle = loadCycleCount();
  return AWAKENED_JOBS.filter(j => cycle >= j.minCycle);
};

// ── 10번: 스킬 진화 ──
const SKILL_USAGE_KEY = "taleforge-skillusage";
const loadSkillUsage = () => { const r = lsGet(SKILL_USAGE_KEY); return r ? JSON.parse(r) : {}; };
const saveSkillUsage = (u) => lsSet(SKILL_USAGE_KEY, JSON.stringify(u));
const clearSkillUsage = () => lsDel(SKILL_USAGE_KEY);
// 스킬 사용 횟수 누적 (여러 회차에 걸쳐 누적)
const recordSkillUsage = (skillId) => {
  const usage = loadSkillUsage();
  usage[skillId] = (usage[skillId] || 0) + 1;
  saveSkillUsage(usage);
};
// 스킬 진화 정의 (기존 스킬 id → 진화 조건 & 결과)
const SKILL_EVOLUTIONS = [
  { fromId:"race_orc_rage",     toName:"전쟁신의 함성",   toIcon:"🌋", reqUsage:5,  reqCycle:2, bonus:{str:5, fear:5}, desc:"같은 함성을 반복하니 전쟁신이 응답하기 시작했다." },
  { fromId:"race_elf_arcane",   toName:"마법의 근원",      toIcon:"🌌", reqUsage:5,  reqCycle:2, bonus:{mgc:5, mp:10},  desc:"마법 친화력이 극에 달해 마법의 근원에 닿았다." },
  { fromId:"race_dwarf_forge",  toName:"신화 단조",        toIcon:"⚒️", reqUsage:5,  reqCycle:2, bonus:{str:5, end:5},  desc:"대장장이의 기예가 신화의 경지에 이르렀다." },
  { fromId:"race_orc_blood",    toName:"불사의 피",        toIcon:"🩸", reqUsage:8,  reqCycle:3, bonus:{str:5, end:8},  desc:"전투의 피가 진화해 죽음에 가까울수록 더욱 강해진다." },
  { fromId:"race_darkling_curse",toName:"절망의 저주",     toIcon:"😈", reqUsage:5,  reqCycle:2, bonus:{mad:5, crse:8}, desc:"공포의 저주가 절망으로 진화했다. 걸린 자는 의지를 잃는다." },
];
// 진화 가능 여부 체크
const checkSkillEvolution = (skillId) => {
  const usage = loadSkillUsage();
  const cycle = loadCycleCount();
  return SKILL_EVOLUTIONS.filter(ev => ev.fromId === skillId && (usage[skillId]||0) >= ev.reqUsage && cycle >= ev.reqCycle);
};

// ══════════════════════════════════════════════════════
//  시스템 11~20
// ══════════════════════════════════════════════════════

// ── 11번: 금지 스킬 해금 ──
// 특정 엔딩 조건 달성 시 다음 생에 해금되는 강력 스킬
const FORBIDDEN_SKILLS_KEY = "taleforge-forbiddenskills";
const loadForbiddenSkills = () => { const r = lsGet(FORBIDDEN_SKILLS_KEY); return r ? JSON.parse(r) : []; };
const saveForbiddenSkills = (s) => lsSet(FORBIDDEN_SKILLS_KEY, JSON.stringify(s));
const clearForbiddenSkills = () => lsDel(FORBIDDEN_SKILLS_KEY);

const FORBIDDEN_SKILL_DEFS = [
  {
    id:"fs_death_kiss", name:"죽음의 입맞춤", icon:"💀", rarity:"legendary",
    type:"active", mpCost:60, scenario:null,
    unlockCondition:"villain", unlockDesc:"전생에서 악당 루트로 엔딩 달성",
    desc:"적의 생명력을 직접 흡수. 대상 HP의 30%를 빼앗아 자신이 회복한다.",
    aiHint:"죽음의 입맞춤 발동! 금지된 어둠의 마법이 생명력을 빨아들입니다.",
    req:{}, condition:null, conditionDesc:null, statBoost:{}
  },
  {
    id:"fs_rewind_3s", name:"시간 역행 3초", icon:"⏪", rarity:"legendary",
    type:"event", mpCost:0, scenario:null,
    unlockCondition:"any_ending", unlockDesc:"어떤 엔딩이든 3회 이상 달성",
    desc:"직전 행동의 결과를 없던 일로 되돌린다. 대실패를 무효화. 1회 한정.",
    aiHint:"시간 역행 발동! 시간이 거꾸로 흐르며 방금의 순간이 지워집니다.",
    req:{}, condition:"crit_fail", conditionDesc:"대실패 직후 1회", statBoost:{}
  },
  {
    id:"fs_soul_devour", name:"영혼 잠식", icon:"🌑", rarity:"legendary",
    type:"active", mpCost:50, scenario:null,
    unlockCondition:"sacrifice_ally", unlockDesc:"전생에서 동료를 희생시켜 엔딩 달성",
    desc:"대상의 영혼을 일부 흡수. 그 NPC의 스탯 중 가장 높은 능력치를 영구 획득.",
    aiHint:"영혼 잠식 발동! 어둠의 힘이 상대의 영혼을 갉아먹습니다.",
    req:{mad:60}, condition:null, conditionDesc:null, statBoost:{}
  },
  {
    id:"fs_world_pause", name:"세계 정지", icon:"⏸️", rarity:"legendary",
    type:"active", mpCost:80, scenario:null,
    unlockCondition:"perfect_clear", unlockDesc:"전생에서 모든 퀘스트 완료 후 엔딩 달성",
    desc:"1턴간 세계의 시간을 멈춘다. 그 사이 자유롭게 행동 1회 추가.",
    aiHint:"세계 정지 발동! 온 세상이 멈추고 오직 당신만이 움직입니다.",
    req:{mgc:70}, condition:null, conditionDesc:null, statBoost:{}
  },
  {
    id:"fs_fate_pierce", name:"운명 관통", icon:"🗡️", rarity:"legendary",
    type:"active", mpCost:40, scenario:null,
    unlockCondition:"5plus_cycles", unlockDesc:"5회차 이상 플레이",
    desc:"어떤 방어도 무시하는 절대 일격. 대상 방어 스탯 완전 무효화 후 공격.",
    aiHint:"운명 관통 발동! 운명의 칼날이 모든 방어를 뚫고 심장을 겨냥합니다.",
    req:{str:50, crit:40}, condition:null, conditionDesc:null, statBoost:{}
  },
];

const unlockForbiddenSkill = (conditionKey) => {
  const already = loadForbiddenSkills();
  const toUnlock = FORBIDDEN_SKILL_DEFS.filter(f =>
    f.unlockCondition === conditionKey && !already.includes(f.id)
  );
  if (toUnlock.length > 0) {
    saveForbiddenSkills([...already, ...toUnlock.map(f => f.id)]);
  }
  return toUnlock;
};

const getUnlockedForbiddenSkills = () => {
  const ids = loadForbiddenSkills();
  return FORBIDDEN_SKILL_DEFS.filter(f => ids.includes(f.id));
};

// ── 12번: 나비효과 ──
// 이전 회차 중요 선택이 세계에 흔적으로 남음
const BUTTERFLY_KEY = "taleforge-butterfly";
const loadButterfly = () => { const r = lsGet(BUTTERFLY_KEY); return r ? JSON.parse(r) : []; };
const saveButterfly = (b) => lsSet(BUTTERFLY_KEY, JSON.stringify(b));
const clearButterfly = () => lsDel(BUTTERFLY_KEY);

// 나비효과 이벤트 정의 (타입별)
const BUTTERFLY_EFFECTS = {
  boss_killed: {
    label:"처치한 보스의 후계자",
    worldEcho: (data) => `전생에서 ${data.bossName}을 처치한 소문이 퍼졌다. 그의 후계자가 복수를 다짐하며 더욱 강하게 성장했다.`,
    aiHint: (data) => `전생 나비효과: ${data.bossName}의 후계자가 더 강해진 상태로 등장합니다. 복수심을 품고 있습니다.`,
  },
  saved_village: {
    label:"구한 마을의 전설",
    worldEcho: (data) => `전생에서 구한 마을이 당신의 이름을 전설로 기억한다. 그 마을의 후손들이 세계 어딘가에 살고 있다.`,
    aiHint: () => `전생 나비효과: 어딘가에서 당신을 기억하는 마을 후손이 나타나 은혜를 갚으려 합니다.`,
  },
  destroyed_artifact: {
    label:"파괴된 유물의 여파",
    worldEcho: (data) => `전생에서 파괴된 유물의 균열이 세계 어딘가에 남아있다. 예상치 못한 곳에서 영향이 나타날 수 있다.`,
    aiHint: () => `전생 나비효과: 세계 어딘가에 예상치 못한 균열이나 이상 현상이 발생합니다.`,
  },
  betrayed_ally: {
    label:"배신당한 동료의 원한",
    worldEcho: (data) => `전생에서 배신한 ${data.npcName}의 원한이 세계에 스며들었다. 그 기억이 이상한 형태로 반향한다.`,
    aiHint: (data) => `전생 나비효과: ${data.npcName}과 닮은 NPC가 처음부터 당신에게 적대적인 태도를 보입니다.`,
  },
};

const addButterflyEffect = (type, data) => {
  const list = loadButterfly();
  list.push({ type, data, addedAt: new Date().toISOString() });
  if (list.length > 5) list.shift(); // 최대 5개 유지
  saveButterfly(list);
};

// ── 13번: 히든 엔딩 조각 ──
const HIDDEN_ENDING_KEY = "taleforge-hiddenending";
const loadHiddenEndingPieces = () => { const r = lsGet(HIDDEN_ENDING_KEY); return r ? JSON.parse(r) : []; };
const saveHiddenEndingPieces = (p) => lsSet(HIDDEN_ENDING_KEY, JSON.stringify(p));
const clearHiddenEndingPieces = () => lsDel(HIDDEN_ENDING_KEY);

const HIDDEN_ENDING_TOTAL = 7; // 7조각 모으면 진엔딩 해금

// 히든 엔딩 조각 조건
const HIDDEN_ENDING_PIECES = [
  { id:"hep_1", name:"운명의 파편 1", icon:"🔮", condition:"first_ending",    conditionDesc:"첫 번째 엔딩 달성" },
  { id:"hep_2", name:"운명의 파편 2", icon:"🔮", condition:"villain_ending",  conditionDesc:"악당 루트 엔딩 달성" },
  { id:"hep_3", name:"운명의 파편 3", icon:"🔮", condition:"sacrifice_end",   conditionDesc:"자기희생 엔딩 달성" },
  { id:"hep_4", name:"운명의 파편 4", icon:"🔮", condition:"5_cycles",        conditionDesc:"5회차 이상 플레이" },
  { id:"hep_5", name:"운명의 파편 5", icon:"🔮", condition:"ally_survived",   conditionDesc:"동료 전원 생존 엔딩" },
  { id:"hep_6", name:"운명의 파편 6", icon:"🔮", condition:"10_cycles",       conditionDesc:"10회차 이상 플레이" },
  { id:"hep_7", name:"운명의 파편 7", icon:"🔮", condition:"all_scenarios",   conditionDesc:"모든 시나리오 1회 이상 클리어" },
];

const checkHiddenEndingPiece = (conditionKey) => {
  const pieces = loadHiddenEndingPieces();
  const piece = HIDDEN_ENDING_PIECES.find(p => p.condition === conditionKey && !pieces.includes(p.id));
  if (piece) { saveHiddenEndingPieces([...pieces, piece.id]); return piece; }
  return null;
};

const isHiddenEndingUnlocked = () => loadHiddenEndingPieces().length >= HIDDEN_ENDING_TOTAL;

// ── 14번: 죽는 방식에 따른 보상 ──
const DEATH_BONUS_KEY = "taleforge-deathbonus";
const loadDeathBonuses = () => { const r = lsGet(DEATH_BONUS_KEY); return r ? JSON.parse(r) : []; };
const saveDeathBonuses = (b) => lsSet(DEATH_BONUS_KEY, JSON.stringify(b));
const clearDeathBonuses = () => lsDel(DEATH_BONUS_KEY);

const DEATH_BONUS_DEFS = [
  { id:"db_combat",   trigger:"combat",    icon:"⚔️", name:"전사의 유산",   bonus:{str:4, end:3},        desc:"전투 중 사망. 다음 생에 전사의 기질이 몸에 배어있다." },
  { id:"db_poison",   trigger:"poison",    icon:"🧪", name:"독에 단련된 몸", bonus:{pstx:8, end:3},       desc:"독에 당해 사망. 다음 생에 독 내성이 강화된다." },
  { id:"db_starved",  trigger:"starved",   icon:"🍖", name:"생존 본능",      bonus:{food:10, end:5},      desc:"굶어서 사망. 다음 생에 생존 본능이 강화된다." },
  { id:"db_betrayed", trigger:"betrayed",  icon:"🕊️", name:"배신자 감지",    bonus:{per:6, intn:5},       desc:"배신당해 사망. 다음 생에 타인의 의도를 더 잘 읽는다." },
  { id:"db_magic",    trigger:"magic",     icon:"🔮", name:"마법 적응",       bonus:{mgc:6, wil:4},        desc:"마법에 당해 사망. 다음 생에 마법 적응력이 생긴다." },
  { id:"db_fall",     trigger:"fall",      icon:"🌊", name:"낙사의 기억",    bonus:{agi:5, cal:4},         desc:"높은 곳에서 추락사. 다음 생에 균형 감각이 발달한다." },
  { id:"db_curse",    trigger:"curse",     icon:"🌑", name:"저주 면역 시작", bonus:{crse:-10, wil:5},      desc:"저주로 사망. 다음 생에 저주에 약간의 저항이 생긴다." },
  { id:"db_old_age",  trigger:"old_age",   icon:"⏳", name:"노장의 지혜",    bonus:{int:6, cal:5, wil:4}, desc:"노화로 자연사. 다음 생에 지혜롭게 태어난다." },
];

const recordDeathCause = (trigger) => {
  const bonuses = loadDeathBonuses();
  const def = DEATH_BONUS_DEFS.find(d => d.trigger === trigger);
  if (def && !bonuses.includes(def.id)) {
    saveDeathBonuses([...bonuses, def.id]);
    return def;
  }
  // 이미 있으면 스택 보너스 (절반)
  return def || null;
};

const getActiveDeathBonuses = () => {
  const ids = loadDeathBonuses();
  return DEATH_BONUS_DEFS.filter(d => ids.includes(d.id));
};

// ── 15번: 트라우마 → 면역 ──
const TRAUMA_KEY = "taleforge-trauma";
const loadTraumas = () => { const r = lsGet(TRAUMA_KEY); return r ? JSON.parse(r) : {}; };
const saveTraumas = (t) => lsSet(TRAUMA_KEY, JSON.stringify(t));
const clearTraumas = () => lsDel(TRAUMA_KEY);

// traumaType: "fire","ice","fall","ambush","curse","betrayal","crowd"
// count 3이상 → 면역 획득
const TRAUMA_IMMUNITY_THRESHOLD = 3;
const TRAUMA_DEFS = {
  fire:     { label:"화염",   icon:"🔥", immunity:"화염 내성 +20, 냉기 내성 -10", statBonus:{end:5},    statPenalty:{}     },
  ice:      { label:"냉기",   icon:"❄️", immunity:"냉기 내성 +20, 화염 내성 -10", statBonus:{cal:5},    statPenalty:{}     },
  fall:     { label:"추락",   icon:"🌊", immunity:"추락 무효, 균형 감각 +10",      statBonus:{agi:8},    statPenalty:{}     },
  ambush:   { label:"기습",   icon:"🗡️", immunity:"기습 감지율 80%, 선제 반격",   statBonus:{per:8},    statPenalty:{}     },
  curse:    { label:"저주",   icon:"🌑", immunity:"저주 내성 +25",                  statBonus:{wil:6},    statPenalty:{}     },
  betrayal: { label:"배신",   icon:"🕊️", immunity:"배신자 감지 자동 발동",         statBonus:{intn:8},   statPenalty:{trst:-5} },
  crowd:    { label:"군중",   icon:"👥", immunity:"군중 압박 면역, 단독행동 보너스",statBonus:{cal:6},    statPenalty:{}     },
};

const recordTrauma = (type) => {
  if (!TRAUMA_DEFS[type]) return null;
  const traumas = loadTraumas();
  traumas[type] = (traumas[type] || 0) + 1;
  saveTraumas(traumas);
  if (traumas[type] >= TRAUMA_IMMUNITY_THRESHOLD) {
    return { ...TRAUMA_DEFS[type], type, immune: true, count: traumas[type] };
  }
  return { ...TRAUMA_DEFS[type], type, immune: false, count: traumas[type] };
};

const getTraumaImmunities = () => {
  const traumas = loadTraumas();
  return Object.entries(traumas)
    .filter(([,count]) => count >= TRAUMA_IMMUNITY_THRESHOLD)
    .map(([type]) => ({ type, ...TRAUMA_DEFS[type] }));
};

// ── 16번: 라스트 워드 ──
// 사망 직전 마지막 행동/대사가 다음 회차 오프닝에 영향
const LAST_WORD_KEY = "taleforge-lastword";
const loadLastWord = () => { const r = lsGet(LAST_WORD_KEY); return r ? JSON.parse(r) : null; };
const saveLastWord = (w) => lsSet(LAST_WORD_KEY, JSON.stringify(w));
const clearLastWord = () => lsDel(LAST_WORD_KEY);

// lastWord: { text, tone, characterName, scenario, savedAt }
// tone: "heroic"|"vengeful"|"peaceful"|"tragic"|"humorous"
const classifyLastWordTone = (text) => {
  const t = text.toLowerCase();
  if (t.includes("복수") || t.includes("원한") || t.includes("반드시")) return "vengeful";
  if (t.includes("평화") || t.includes("좋았") || t.includes("행복") || t.includes("감사")) return "peaceful";
  if (t.includes("웃") || t.includes("ㅋ") || t.includes("재미")) return "humorous";
  if (t.includes("영웅") || t.includes("지키") || t.includes("위해")) return "heroic";
  return "tragic";
};

const LAST_WORD_OPENINGS = {
  heroic:   "전생에서 당신은 마지막 순간까지 누군가를 지키려 했다. 그 기억이 이번 생의 심장 어딘가에 새겨져 있다.",
  vengeful: "전생의 마지막 말은 복수에 대한 것이었다. 그 원한이 이번 생을 시작하는 불씨가 된다.",
  peaceful: "전생의 마지막 순간은 평온했다. 그 평화로운 기억이 이번 생에 잔잔한 용기를 준다.",
  tragic:   "전생은 비극으로 끝났다. 그 슬픔이 이번 생의 어딘가에 그림자처럼 드리워져 있다.",
  humorous: "전생의 마지막 순간조차 유쾌했다. 그 낙관적인 기운이 이번 생에도 이어진다.",
};

// ── 17번: 메타 지식 활용 ──
// 전생 이벤트 재등장 시 "어디선가 본 듯한 느낌" 선택지 추가
const META_KNOWLEDGE_KEY = "taleforge-metaknowledge";
const loadMetaKnowledge = () => { const r = lsGet(META_KNOWLEDGE_KEY); return r ? JSON.parse(r) : []; };
const saveMetaKnowledge = (m) => lsSet(META_KNOWLEDGE_KEY, JSON.stringify(m));
const clearMetaKnowledge = () => lsDel(META_KNOWLEDGE_KEY);

// 메타 지식 항목: { type, keyword, hint, addedAt }
// type: "trap","treasure","npc","event","boss"
const addMetaKnowledge = (type, keyword, hint) => {
  const list = loadMetaKnowledge();
  if (!list.some(m => m.keyword === keyword)) {
    list.push({ type, keyword, hint, addedAt: new Date().toISOString() });
    if (list.length > 20) list.shift();
    saveMetaKnowledge(list);
  }
};

const getMetaKnowledgeHints = () => {
  const list = loadMetaKnowledge();
  const cycle = loadCycleCount();
  if (cycle < 1 || list.length === 0) return [];
  return list;
};

// ── 18번: 혈통 진화 ──
// 같은 종족으로 반복 플레이할수록 종족이 진화
const BLOODLINE_KEY = "taleforge-bloodline";
const loadBloodline = () => { const r = lsGet(BLOODLINE_KEY); return r ? JSON.parse(r) : {}; };
const saveBloodline = (b) => lsSet(BLOODLINE_KEY, JSON.stringify(b));
const clearBloodline = () => lsDel(BLOODLINE_KEY);

// race → 진화 경로 (회차 누적)
const BLOODLINE_EVOLUTION = {
  "인간":     { 2:"반혼혈인", 4:"각성 인간", 7:"초월자" },
  "엘프":     { 2:"반요정", 4:"고대 요정혈통", 7:"별의 화신" },
  "드워프":   { 2:"철혈 드워프", 4:"강철 군주", 7:"산의 신" },
  "오크":     { 2:"전쟁오크", 4:"혈전 군주", 7:"전쟁신의 화신" },
  "다크링":   { 2:"심연 다크링", 4:"공허의 군주", 7:"어둠의 신격" },
  "반인반수": { 2:"야수 반인", 4:"원시 군주", 7:"야수의 신" },
};

const recordRacePlayed = (race) => {
  const bloodline = loadBloodline();
  bloodline[race] = (bloodline[race] || 0) + 1;
  saveBloodline(bloodline);
  return bloodline[race];
};

const getEvolvedRace = (race) => {
  const bloodline = loadBloodline();
  const count = bloodline[race] || 0;
  const evolutions = BLOODLINE_EVOLUTION[race] || {};
  let evolved = race;
  let bonusMultiplier = 1;
  for (const [reqCount, name] of Object.entries(evolutions).sort((a,b) => parseInt(a)-parseInt(b))) {
    if (count >= parseInt(reqCount)) { evolved = name; bonusMultiplier = parseInt(reqCount) / 2; }
  }
  return { name: evolved, count, bonusMultiplier, isEvolved: evolved !== race };
};

// ── 19번: 운명의 변수 ──
// 너무 완벽하게 클리어하면 다음 회차 난이도 상승
const FATE_VARIABLE_KEY = "taleforge-fatevariable";
const loadFateVariable = () => { const r = lsGet(FATE_VARIABLE_KEY); return r ? JSON.parse(r) : { perfectClears:0, resistanceLevel:0 } };
const saveFateVariable = (f) => lsSet(FATE_VARIABLE_KEY, JSON.stringify(f));
const clearFateVariable = () => lsDel(FATE_VARIABLE_KEY);

// perfectScore: 0~100. 70이상 = 퍼펙트 클리어
const recordClearQuality = (score) => {
  const fv = loadFateVariable();
  if (score >= 70) {
    fv.perfectClears = (fv.perfectClears || 0) + 1;
    fv.resistanceLevel = Math.min(5, Math.floor(fv.perfectClears / 2));
  } else {
    fv.perfectClears = Math.max(0, (fv.perfectClears || 0) - 1);
    fv.resistanceLevel = Math.max(0, Math.floor((fv.perfectClears||0) / 2));
  }
  saveFateVariable(fv);
  return fv;
};

const getFateResistance = () => {
  const fv = loadFateVariable();
  const level = fv.resistanceLevel || 0;
  if (level === 0) return null;
  const labels = ["", "약한 저항", "중간 저항", "강한 저항", "극한 저항", "세계의 분노"];
  const descriptions = [
    "",
    "세계가 당신의 패턴을 학습하기 시작했다. 판정이 약간 까다로워진다.",
    "세계가 당신에게 저항한다. 예상치 못한 변수가 자주 발생한다.",
    "세계가 강하게 저항한다. NPC들이 당신의 계획을 방해하려 한다.",
    "세계가 극렬히 저항한다. 행운이 등을 돌리고 함정이 곳곳에 깔린다.",
    "세계 전체가 당신에게 분노한다. 모든 것이 뒤틀린다. 하지만 성공하면 전설적인 보상.",
  ];
  return { level, label: labels[level], desc: descriptions[level] };
};

// ── 20번: 전생 지도 ──
// 전생에서 탐험한 장소들이 다음 회차에 기억됨
const EXPLORED_MAPS_KEY = "taleforge-exploredmaps";
const loadExploredMaps = () => { const r = lsGet(EXPLORED_MAPS_KEY); return r ? JSON.parse(r) : []; };
const saveExploredMaps = (m) => lsSet(EXPLORED_MAPS_KEY, JSON.stringify(m));
const clearExploredMaps = () => lsDel(EXPLORED_MAPS_KEY);

const addExploredLocation = (locationName, scenario, hint) => {
  const maps = loadExploredMaps();
  if (!maps.some(m => m.name === locationName)) {
    maps.push({ name:locationName, scenario, hint: hint||"", exploredAt: new Date().toISOString() });
    if (maps.length > 30) maps.shift();
    saveExploredMaps(maps);
  }
};

const getExploredLocations = (scenario) => {
  const maps = loadExploredMaps();
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return scenario ? maps.filter(m => m.scenario === scenario || !m.scenario) : maps;
};

// ══════════════════════════════════════════════════════
//  21~30번 시스템
// ══════════════════════════════════════════════════════

// ── 21번: 관계 유산 ──
// 전생에서 맺은 관계의 깊이가 다음 생에 영향을 미침
// 적이었던 자는 경계심, 동료였던 자는 신뢰감으로 시작
const RELATIONSHIP_LEGACY_KEY = "taleforge-rellegacy";
const loadRelLegacy   = () => { const r = lsGet(RELATIONSHIP_LEGACY_KEY); return r ? JSON.parse(r) : []; };
const saveRelLegacy   = (l) => lsSet(RELATIONSHIP_LEGACY_KEY, JSON.stringify(l));
const clearRelLegacy  = () => lsDel(RELATIONSHIP_LEGACY_KEY);

// { npcName, bond:"ally"|"rival"|"love"|"enemy"|"mentor", depth:1~5, scenario, savedAt }
const recordRelationshipLegacy = (npcName, bond, depth, scenario) => {
  const list = loadRelLegacy();
  const existing = list.find(r => r.npcName === npcName);
  if (existing) {
    existing.depth = Math.min(5, existing.depth + 1);
    existing.bond = bond;
  } else {
    list.push({ npcName, bond, depth: Math.min(5, depth||1), scenario: scenario||"", savedAt: new Date().toISOString() });
    if (list.length > 20) list.shift();
  }
  saveRelLegacy(list);
};

const getRelationshipLegacies = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadRelLegacy();
};

const REL_LEGACY_HINTS = {
  ally:   (name, depth) => `${name}는 전생의 동료였습니다. 처음 만났을 때부터 묘한 신뢰감이 든다. (깊이 ${depth}성)`,
  rival:  (name, depth) => `${name}는 전생의 라이벌이었습니다. 처음 만나도 묘한 경쟁심이 솟구친다. (깊이 ${depth}성)`,
  love:   (name, depth) => `${name}는 전생의 연인이었습니다. 첫 만남임에도 가슴이 저릿하다. (깊이 ${depth}성)`,
  enemy:  (name, depth) => `${name}는 전생의 원수였습니다. 이름을 들으면 본능적으로 경계심이 솟는다. (깊이 ${depth}성)`,
  mentor: (name, depth) => `${name}는 전생의 스승이었습니다. 그의 말은 왠지 모르게 귀에 잘 들어온다. (깊이 ${depth}성)`,
};

// ── 22번: 세계관 기억 ──
// 전생에서 알아낸 세계의 비밀/규칙이 다음 생에 힌트로 남음
const WORLD_SECRETS_KEY  = "taleforge-worldsecrets";
const loadWorldSecrets   = () => { const r = lsGet(WORLD_SECRETS_KEY); return r ? JSON.parse(r) : []; };
const saveWorldSecrets   = (s) => lsSet(WORLD_SECRETS_KEY, JSON.stringify(s));
const clearWorldSecrets  = () => lsDel(WORLD_SECRETS_KEY);

// { secretId, title, hint, scenario, discoveredAt }
const recordWorldSecret = (secretId, title, hint, scenario) => {
  const secrets = loadWorldSecrets();
  if (!secrets.some(s => s.secretId === secretId)) {
    secrets.push({ secretId, title, hint: hint||"", scenario: scenario||"", discoveredAt: new Date().toISOString() });
    if (secrets.length > 15) secrets.shift();
    saveWorldSecrets(secrets);
  }
};

const getWorldSecrets = (scenario) => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  const all = loadWorldSecrets();
  return scenario ? all.filter(s => !s.scenario || s.scenario === scenario) : all;
};

// ── 23번: 능력 각인 ──
// 전생에서 극한까지 쓴 능력이 다음 생에 "기묘한 재능"으로 발현
const ABILITY_IMPRINT_KEY  = "taleforge-abilityimprint";
const loadAbilityImprint   = () => { const r = lsGet(ABILITY_IMPRINT_KEY); return r ? JSON.parse(r) : {}; };
const saveAbilityImprint   = (a) => lsSet(ABILITY_IMPRINT_KEY, JSON.stringify(a));
const clearAbilityImprint  = () => lsDel(ABILITY_IMPRINT_KEY);

// { statId: totalUsageCount }
const recordStatUsage = (statId, amount=1) => {
  const imp = loadAbilityImprint();
  imp[statId] = (imp[statId] || 0) + amount;
  saveAbilityImprint(imp);
};

const ABILITY_IMPRINT_THRESHOLD = 100; // 누적 100 이상 → 각인 발현
const getImprintedAbilities = () => {
  const imp = loadAbilityImprint();
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return Object.entries(imp)
    .filter(([, count]) => count >= ABILITY_IMPRINT_THRESHOLD)
    .map(([statId, count]) => ({ statId, count, tier: Math.min(3, Math.floor(count / ABILITY_IMPRINT_THRESHOLD)) }));
};

const ABILITY_IMPRINT_LABELS = {
  str: { name:"육체 각인", desc:"전생에서 갈고닦은 근력이 이번 생에 타고난 신체 능력으로 발현된다." },
  int: { name:"지식 각인", desc:"전생의 방대한 지식이 이번 생의 직관력으로 녹아있다." },
  agi: { name:"속도 각인", desc:"전생의 반사 신경이 이번 생에 천재적인 운동 감각으로 나타난다." },
  mgc: { name:"마력 각인", desc:"전생에서 다룬 마법의 흔적이 이번 생의 몸 어딘가에 새겨져 있다." },
  cal: { name:"내공 각인", desc:"전생에서 쌓은 내공의 기억이 이번 생의 호흡에 남아있다." },
  ldr: { name:"지도력 각인", desc:"전생에서 이끌었던 경험이 이번 생의 카리스마로 드러난다." },
};

// ── 24번: 원한의 추적자 ──
// 전생에서 죽인 강적의 영혼이 다음 생에 추적자로 등장
const GRUDGE_TRACKER_KEY  = "taleforge-grudge";
const loadGrudgeList      = () => { const r = lsGet(GRUDGE_TRACKER_KEY); return r ? JSON.parse(r) : []; };
const saveGrudgeList      = (g) => lsSet(GRUDGE_TRACKER_KEY, JSON.stringify(g));
const clearGrudgeList     = () => lsDel(GRUDGE_TRACKER_KEY);

// { name, power:1~5, scenario, killedAt, resolved:bool }
const addGrudge = (name, power, scenario) => {
  const list = loadGrudgeList();
  if (!list.some(g => g.name === name)) {
    list.push({ name, power: Math.min(5, power||1), scenario: scenario||"", killedAt: new Date().toISOString(), resolved: false });
    if (list.length > 10) list.shift();
    saveGrudgeList(list);
  }
};

const resolveGrudge = (name) => {
  const list = loadGrudgeList();
  const g = list.find(g => g.name === name);
  if (g) { g.resolved = true; saveGrudgeList(list); }
};

const getActiveGrudges = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadGrudgeList().filter(g => !g.resolved);
};

// ── 25번: 시간의 메아리 ──
// 과거 회차의 중요 대화가 메아리처럼 현재에 울림
const TIME_ECHO_KEY   = "taleforge-timeecho";
const loadTimeEchoes  = () => { const r = lsGet(TIME_ECHO_KEY); return r ? JSON.parse(r) : []; };
const saveTimeEchoes  = (e) => lsSet(TIME_ECHO_KEY, JSON.stringify(e));
const clearTimeEchoes = () => lsDel(TIME_ECHO_KEY);

// { text, speaker, emotion, scenario, savedAt }
const addTimeEcho = (text, speaker, emotion, scenario) => {
  const echoes = loadTimeEchoes();
  echoes.push({ text, speaker: speaker||"???", emotion: emotion||"", scenario: scenario||"", savedAt: new Date().toISOString() });
  if (echoes.length > 10) echoes.shift();
  saveTimeEchoes(echoes);
};

const getTimeEchoes = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadTimeEchoes();
};

// ── 26번: 운명의 선택 기록 ──
// 중요한 분기점에서 한 선택이 다음 회차에 "이미 해봤다"는 선택지 추가
const FATE_CHOICES_KEY   = "taleforge-fatechoices";
const loadFateChoices    = () => { const r = lsGet(FATE_CHOICES_KEY); return r ? JSON.parse(r) : []; };
const saveFateChoices    = (c) => lsSet(FATE_CHOICES_KEY, JSON.stringify(c));
const clearFateChoices   = () => lsDel(FATE_CHOICES_KEY);

// { choiceId, description, outcome:"good"|"bad"|"neutral", scenario, chosenAt }
const recordFateChoice = (choiceId, description, outcome, scenario) => {
  const choices = loadFateChoices();
  if (!choices.some(c => c.choiceId === choiceId)) {
    choices.push({ choiceId, description: description||"", outcome: outcome||"neutral", scenario: scenario||"", chosenAt: new Date().toISOString() });
    if (choices.length > 20) choices.shift();
    saveFateChoices(choices);
  }
};

const getFateChoices = (scenario) => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  const all = loadFateChoices();
  return scenario ? all.filter(c => !c.scenario || c.scenario === scenario) : all;
};

// ── 27번: 신의 시선 ──
// 회차가 쌓일수록 "어떤 존재"가 주인공을 주시하고 있음을 암시
// 관심도가 높아지면 신적 개입 이벤트 발생
const DIVINE_GAZE_KEY   = "taleforge-divinegaze";
const loadDivineGaze    = () => { const r = lsGet(DIVINE_GAZE_KEY); return r ? JSON.parse(r) : { attention:0, interventions:0, favored: false } };
const saveDivineGaze    = (g) => lsSet(DIVINE_GAZE_KEY, JSON.stringify(g));
const clearDivineGaze   = () => lsDel(DIVINE_GAZE_KEY);

const accumulateDivineAttention = (amount=1) => {
  const g = loadDivineGaze();
  g.attention = Math.min(100, (g.attention||0) + amount);
  if (g.attention >= 50 && !g.favored) g.favored = true;
  saveDivineGaze(g);
  return g;
};

const recordDivineIntervention = () => {
  const g = loadDivineGaze();
  g.interventions = (g.interventions||0) + 1;
  g.attention = Math.max(0, g.attention - 20); // 개입 후 관심도 소모
  saveDivineGaze(g);
};

const getDivineGazeStatus = () => {
  const g = loadDivineGaze();
  const cycle = loadCycleCount();
  const att = g.attention || 0;
  if (cycle < 2 || att < 10) return null;
  const levels = [
    { min:10, max:29, label:"신의 시선", desc:"어딘가에서 당신을 지켜보는 시선이 느껴진다.", icon:"👁️" },
    { min:30, max:59, label:"신의 관심", desc:"어떤 존재가 당신의 행보에 흥미를 보이고 있다.", icon:"🌟" },
    { min:60, max:84, label:"신의 총애", desc:"신적 존재가 당신을 특별히 여기고 있다. 때로 기적이 일어난다.", icon:"✨" },
    { min:85, max:100, label:"신의 선택받은 자", desc:"신이 당신을 도구로 삼으려 한다. 거대한 역할이 기다리고 있다.", icon:"⚡" },
  ];
  return levels.find(l => att >= l.min && att <= l.max) || null;
};

// ── 28번: 저주 계보 ──
// 특정 종류의 저주를 반복해서 받으면 오히려 저주를 다루는 능력 습득
const CURSE_LINEAGE_KEY  = "taleforge-curselineage";
const loadCurseLineage   = () => { const r = lsGet(CURSE_LINEAGE_KEY); return r ? JSON.parse(r) : {}; };
const saveCurseLineage   = (c) => lsSet(CURSE_LINEAGE_KEY, JSON.stringify(c));
const clearCurseLineage  = () => lsDel(CURSE_LINEAGE_KEY);

// { curseType: count }
const CURSE_MASTERY_THRESHOLD = 3; // 3번 받으면 숙달
const recordCurse = (curseType) => {
  const cl = loadCurseLineage();
  cl[curseType] = (cl[curseType]||0) + 1;
  saveCurseLineage(cl);
  return cl[curseType];
};

const getCurseMasteries = () => {
  const cl = loadCurseLineage();
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return Object.entries(cl)
    .filter(([,count]) => count >= CURSE_MASTERY_THRESHOLD)
    .map(([type, count]) => ({ type, count, mastered: true }));
};

const CURSE_TYPE_DEFS = {
  death:    { name:"사신의 저주", mastery:"죽음을 직시하는 눈 — 죽음의 기운을 감지하고 일부 무효화한다." },
  darkness: { name:"어둠의 저주", mastery:"어둠 친화 — 어둠 속에서 능력이 강화되고 암시야를 얻는다." },
  silence:  { name:"침묵의 저주", mastery:"무언의 의사소통 — 말 없이도 의도를 전달하는 초감각이 생긴다." },
  madness:  { name:"광기의 저주", mastery:"제어된 광기 — 극한 상황에서 광기를 폭발력으로 전환한다." },
  binding:  { name:"속박의 저주", mastery:"사슬 파괴자 — 구속·결박 계열 마법에 대한 저항력이 생긴다." },
  plague:   { name:"역병의 저주", mastery:"역병 면역 — 독·병·오염에 강한 저항성을 가진다." },
};

// ── 29번: 전생의 기도 ──
// 극한의 상황에서 기도를 올리면 전생의 기억이 도움으로 화답
// 회차당 1회만 발동 가능
const PAST_PRAYER_KEY   = "taleforge-pastprayer";
const loadPastPrayer    = () => { const r = lsGet(PAST_PRAYER_KEY); return r ? JSON.parse(r) : { usedThisCycle: false, totalPrayers:0 } };
const savePastPrayer    = (p) => lsSet(PAST_PRAYER_KEY, JSON.stringify(p));
const clearPastPrayer   = () => lsDel(PAST_PRAYER_KEY);

const usePastPrayer = () => {
  const p = loadPastPrayer();
  if (p.usedThisCycle) return false;
  p.usedThisCycle = true;
  p.totalPrayers = (p.totalPrayers||0) + 1;
  savePastPrayer(p);
  return true;
};

const resetPastPrayerCycle = () => {
  const p = loadPastPrayer();
  p.usedThisCycle = false;
  savePastPrayer(p);
};

const getPastPrayerStatus = () => {
  const p = loadPastPrayer();
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const total = p.totalPrayers || 0;
  const power = total <= 2 ? "약한" : total <= 5 ? "보통" : total <= 9 ? "강한" : "전설적인";
  return { usedThisCycle: p.usedThisCycle||false, total, power, available: !p.usedThisCycle };
};

// ── 30번: 운명의 수레바퀴 ──
// 10회차마다 세계가 리셋되고 특별한 "운명의 기회" 발생
// 모든 영구 기록이 초기화되지만 특수 보상 잠금 해제
const WHEEL_OF_FATE_KEY   = "taleforge-wheeloffate";
const loadWheelOfFate     = () => { const r = lsGet(WHEEL_OF_FATE_KEY); return r ? JSON.parse(r) : { greatCycles:0, totalCycles:0 } };
const saveWheelOfFate     = (w) => lsSet(WHEEL_OF_FATE_KEY, JSON.stringify(w));
// 수레바퀴는 clearAll해도 초기화되지 않음 (의도적)

const GREAT_CYCLE_THRESHOLD = 10; // 10회차 = 1 대순환
const checkGreatCycleReset = (currentCycle) => {
  const w = loadWheelOfFate();
  w.totalCycles = currentCycle;
  if (currentCycle > 0 && currentCycle % GREAT_CYCLE_THRESHOLD === 0) {
    w.greatCycles = Math.floor(currentCycle / GREAT_CYCLE_THRESHOLD);
    saveWheelOfFate(w);
    return { isGreatCycle: true, greatCycleNumber: w.greatCycles };
  }
  saveWheelOfFate(w);
  return { isGreatCycle: false, greatCycleNumber: w.greatCycles };
};

const getGreatCycleStatus = () => {
  const w = loadWheelOfFate();
  const gc = w.greatCycles || 0;
  if (gc === 0) return null;
  const rewards = [
    "1대순환 달성: 전설급 특성 해금 — 한 번 죽어도 부활하는 「불사의 기억」",
    "2대순환 달성: 신화급 특성 해금 — 스탯 상한이 해제되는 「초월의 각인」",
    "3대순환 달성: 창조자급 특성 해금 — 세계 규칙을 일시 무시하는 「인과율 파괴」",
  ];
  return {
    greatCycles: gc,
    totalCycles: w.totalCycles || 0,
    nextThreshold: (gc + 1) * GREAT_CYCLE_THRESHOLD,
    unlockedRewards: rewards.slice(0, Math.min(gc, rewards.length)),
  };
};

// ── 31번: 평행세계 조우 ──
// 고회차에서 다른 회차의 자신과 환영으로 조우. 조언 획득 or 싸워서 스킬 빼앗음
const PARALLEL_SELF_KEY   = "taleforge-parallelself";
const loadParallelSelves  = () => { const r = lsGet(PARALLEL_SELF_KEY); return r ? JSON.parse(r) : []; };
const saveParallelSelves  = (p) => lsSet(PARALLEL_SELF_KEY, JSON.stringify(p));
const clearParallelSelves = () => lsDel(PARALLEL_SELF_KEY);

// { name, role, scenario, keySkill, outcome:"advice"|"battle", savedAt }
const recordParallelSelf = (name, role, scenario, keySkill) => {
  const selves = loadParallelSelves();
  selves.push({ name: name||"???", role: role||"알 수 없음", scenario: scenario||"", keySkill: keySkill||"", savedAt: new Date().toISOString() });
  if (selves.length > 5) selves.shift();
  saveParallelSelves(selves);
};

const getParallelSelfEncounter = () => {
  const cycle = loadCycleCount();
  if (cycle < 4) return null; // 4회차부터 등장
  const selves = loadParallelSelves();
  if (selves.length === 0) return null;
  return selves[selves.length - 1];
};

// ── 32번: 저주의 고리 ──
// 특정 행동 반복할수록 해당 행동에 패널티 누적. 같은 방식으로만 플레이 불가
const CURSE_RING_KEY   = "taleforge-cursering";
const loadCurseRing    = () => { const r = lsGet(CURSE_RING_KEY); return r ? JSON.parse(r) : {}; };
const saveCurseRing    = (c) => lsSet(CURSE_RING_KEY, JSON.stringify(c));
const clearCurseRing   = () => lsDel(CURSE_RING_KEY);

// { actionType: { count, penaltyLevel } }
const CURSE_RING_ACTIONS = {
  always_attack:  { label:"무조건 공격",    icon:"⚔️",  threshold:3, penalty:"전투 판정 -10%, 적이 패턴에 익숙해져 선제 반격 확률 상승" },
  always_flee:    { label:"항상 도주",      icon:"🏃",  threshold:3, penalty:"도주 판정 -15%, '겁쟁이'라는 평판이 퍼져 NPC 호감도 하락" },
  always_deceive: { label:"항상 속임수",    icon:"🎭",  threshold:3, penalty:"설득·협상 판정 -20%, 주변인들이 경계하며 정보 차단" },
  always_solo:    { label:"항상 혼자 행동", icon:"👤",  threshold:3, penalty:"동료 없이 판정 시 -10%, 고독의 기운이 주변을 짓누름" },
  always_bribe:   { label:"항상 뇌물",      icon:"💰",  threshold:3, penalty:"골드 효율 -30%, 부패한 자로 알려져 청렴한 NPC 적대" },
};

const recordCurseRingAction = (actionType) => {
  const ring = loadCurseRing();
  if (!ring[actionType]) ring[actionType] = { count: 0, penaltyLevel: 0 };
  ring[actionType].count++;
  const def = CURSE_RING_ACTIONS[actionType];
  if (def && ring[actionType].count >= def.threshold) {
    ring[actionType].penaltyLevel = Math.floor(ring[actionType].count / def.threshold);
  }
  saveCurseRing(ring);
  return ring[actionType];
};

const getActiveCurseRings = () => {
  const ring = loadCurseRing();
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return Object.entries(ring)
    .filter(([, v]) => v.penaltyLevel > 0)
    .map(([type, v]) => ({ type, ...v, ...CURSE_RING_ACTIONS[type] }));
};

// ── 33번: 회차 통계 열람 ──
// 총 사망 횟수, 가장 많이 죽인 적, 총 대화 턴수 등 누적 통계
const CYCLE_STATS_KEY   = "taleforge-cyclestats";
const loadCycleStats    = () => { const r = lsGet(CYCLE_STATS_KEY); return r ? JSON.parse(r) : { totalDeaths:0, totalTurns:0, killedEnemies:{}, usedSkills:{}, visitedScenarios:{} }; };
const saveCycleStats    = (s) => lsSet(CYCLE_STATS_KEY, JSON.stringify(s));
const clearCycleStats   = () => lsDel(CYCLE_STATS_KEY);

const recordStatDeath = () => {
  const s = loadCycleStats();
  s.totalDeaths = (s.totalDeaths||0) + 1;
  saveCycleStats(s);
};

const recordStatTurn = () => {
  const s = loadCycleStats();
  s.totalTurns = (s.totalTurns||0) + 1;
  saveCycleStats(s);
};

const recordStatKill = (enemyName) => {
  if (!enemyName) return;
  const s = loadCycleStats();
  if (!s.killedEnemies) s.killedEnemies = {};
  s.killedEnemies[enemyName] = (s.killedEnemies[enemyName]||0) + 1;
  saveCycleStats(s);
};

const recordStatScenario = (scenarioName) => {
  if (!scenarioName) return;
  const s = loadCycleStats();
  if (!s.visitedScenarios) s.visitedScenarios = {};
  s.visitedScenarios[scenarioName] = (s.visitedScenarios[scenarioName]||0) + 1;
  saveCycleStats(s);
};

const getCycleStatsSummary = () => {
  const s = loadCycleStats();
  const cycle = loadCycleCount();
  const topEnemy = Object.entries(s.killedEnemies||{}).sort((a,b)=>b[1]-a[1])[0];
  const topScenario = Object.entries(s.visitedScenarios||{}).sort((a,b)=>b[1]-a[1])[0];
  return {
    totalDeaths: s.totalDeaths||0,
    totalTurns: s.totalTurns||0,
    totalCycles: cycle,
    topEnemy: topEnemy ? { name: topEnemy[0], count: topEnemy[1] } : null,
    topScenario: topScenario ? { name: topScenario[0], count: topScenario[1] } : null,
  };
};

// ── 34번: 부상 흔적 ──
// 전생에서 크게 다친 부위가 다음 생에 약점 or 단련되어 강점
const INJURY_MARK_KEY   = "taleforge-injurymarks";
const loadInjuryMarks   = () => { const r = lsGet(INJURY_MARK_KEY); return r ? JSON.parse(r) : []; };
const saveInjuryMarks   = (m) => lsSet(INJURY_MARK_KEY, JSON.stringify(m));
const clearInjuryMarks  = () => lsDel(INJURY_MARK_KEY);

// { part, count, isStrength (count>=3 → 강점으로 역전) }
const INJURY_PART_DEFS = {
  arm:     { label:"팔",    icon:"💪", weakDesc:"전생의 팔 부상이 남아 STR 판정 -5", strongDesc:"팔의 단련으로 STR 판정 +8, 무기 조작 특화", statWeak:"str", statStrong:"str", bonusWeak:-5, bonusStrong:8 },
  leg:     { label:"다리",  icon:"🦵", weakDesc:"전생의 다리 부상으로 AGI 판정 -5", strongDesc:"다리의 강화로 AGI 판정 +8, 도주·추격 특화", statWeak:"agi", statStrong:"agi", bonusWeak:-5, bonusStrong:8 },
  eye:     { label:"눈",    icon:"👁️", weakDesc:"전생의 눈 부상으로 PER 판정 -5", strongDesc:"한쪽 눈의 예민함으로 PER 판정 +10, 급소 포착 특화", statWeak:"per", statStrong:"per", bonusWeak:-5, bonusStrong:10 },
  mind:    { label:"정신",  icon:"🧠", weakDesc:"전생의 정신적 상처로 WIL 판정 -5", strongDesc:"극복한 정신력으로 WIL 판정 +10, 공포·저주 저항", statWeak:"wil", statStrong:"wil", bonusWeak:-5, bonusStrong:10 },
  chest:   { label:"흉부",  icon:"🫀", weakDesc:"전생의 심한 흉부 부상으로 END 판정 -5", strongDesc:"단련된 체간으로 END 판정 +8, 치명상 생존율 상승", statWeak:"end", statStrong:"end", bonusWeak:-5, bonusStrong:8 },
  throat:  { label:"목",    icon:"🗣️", weakDesc:"전생의 목 부상으로 SPK 판정 -5", strongDesc:"단련된 목소리로 SPK 판정 +8, 협상·위협 특화", statWeak:"spk", statStrong:"spk", bonusWeak:-5, bonusStrong:8 },
};

const recordInjury = (part) => {
  if (!INJURY_PART_DEFS[part]) return;
  const marks = loadInjuryMarks();
  const existing = marks.find(m => m.part === part);
  if (existing) {
    existing.count++;
    if (existing.count >= 3) existing.isStrength = true;
  } else {
    marks.push({ part, count: 1, isStrength: false });
  }
  saveInjuryMarks(marks);
};

const getInjuryEffects = () => {
  const marks = loadInjuryMarks();
  const cycle = loadCycleCount();
  if (cycle < 1 || marks.length === 0) return [];
  return marks.map(m => {
    const def = INJURY_PART_DEFS[m.part];
    if (!def) return null;
    return { ...m, ...def, desc: m.isStrength ? def.strongDesc : def.weakDesc, bonus: m.isStrength ? def.bonusStrong : def.bonusWeak };
  }).filter(Boolean);
};

// ── 35번: 전생 테마/분위기 ──
// 전생 엔딩 유형에 따라 다음 회차 시작 분위기가 달라짐
const PAST_THEME_KEY   = "taleforge-pasttheme";
const loadPastTheme    = () => { const r = lsGet(PAST_THEME_KEY); return r ? JSON.parse(r) : null; };
const savePastTheme    = (t) => lsSet(PAST_THEME_KEY, JSON.stringify(t));
const clearPastTheme   = () => lsDel(PAST_THEME_KEY);

const ENDING_THEMES = {
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

const recordPastTheme = (endingType) => {
  const theme = ENDING_THEMES[endingType] || ENDING_THEMES.neutral;
  savePastTheme({ type: endingType, ...theme, recordedAt: new Date().toISOString() });
};

const getPastTheme = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadPastTheme();
};

// ── 36번: 기억 왜곡 ──
// 전생 기억이 100% 정확하지 않음. 기억력 스탯 높을수록 정확도 상승
const MEMORY_DISTORT_KEY   = "taleforge-memorydistort";
const loadMemoryDistort    = () => { const r = lsGet(MEMORY_DISTORT_KEY); return r ? JSON.parse(r) : { distortionLevel: 0, falseMemories: [] }; };
const saveMemoryDistort    = (d) => lsSet(MEMORY_DISTORT_KEY, JSON.stringify(d));
const clearMemoryDistort   = () => lsDel(MEMORY_DISTORT_KEY);

// distortionLevel: 0~100 (낮을수록 정확, 높을수록 왜곡)
const FALSE_MEMORY_POOL = [
  "전생에서 배신당한 동료가 사실은 나를 지켜주려 했을 수 있다.",
  "기억 속 보물의 위치가 실제와 다를 수 있다.",
  "전생의 적이 사실 무고했을 가능성이 있다.",
  "기억 속 지름길이 함정일 수 있다.",
  "전생에서 죽인 자가 나의 숨겨진 은인이었을지도 모른다.",
  "전생의 사건 순서가 실제와 뒤바뀌어 기억될 수 있다.",
  "기억 속 인물의 얼굴이 실제 다른 사람과 혼동될 수 있다.",
];

const recordMemoryDistort = (wil) => {
  const d = loadMemoryDistort();
  // WIL 스탯이 높을수록 왜곡 감소
  const distortionBase = Math.max(0, 60 - (wil || 30));
  const distortionNoise = Math.floor(Math.random() * 20) - 10;
  d.distortionLevel = Math.max(0, Math.min(100, distortionBase + distortionNoise));
  // 왜곡 수준이 40 이상이면 거짓 기억 1개 주입
  if (d.distortionLevel >= 40) {
    const fm = FALSE_MEMORY_POOL[Math.floor(Math.random() * FALSE_MEMORY_POOL.length)];
    if (!d.falseMemories.includes(fm)) {
      d.falseMemories.push(fm);
      if (d.falseMemories.length > 3) d.falseMemories.shift();
    }
  }
  saveMemoryDistort(d);
};

const getMemoryDistortStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const d = loadMemoryDistort();
  const lvl = d.distortionLevel || 0;
  const accuracy = lvl < 20 ? "선명한" : lvl < 40 ? "약간 흐릿한" : lvl < 70 ? "많이 왜곡된" : "심하게 왜곡된";
  return { distortionLevel: lvl, accuracy, falseMemories: d.falseMemories||[] };
};

// ── 37번: 전생 나이의 역설 ──
// 노인으로 죽으면 다음 생에 조숙한 보너스, 어려서 죽으면 노련함 보너스
const AGE_PARADOX_KEY   = "taleforge-ageparadox";
const loadAgeParadox    = () => { const r = lsGet(AGE_PARADOX_KEY); return r ? JSON.parse(r) : null; };
const saveAgeParadox    = (a) => lsSet(AGE_PARADOX_KEY, JSON.stringify(a));
const clearAgeParadox   = () => lsDel(AGE_PARADOX_KEY);

const AGE_PARADOX_DEFS = {
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

const recordAgeParadox = (deathAgeType) => {
  // deathAgeType: "elder"|"young"|"prime"
  const def = AGE_PARADOX_DEFS[deathAgeType];
  if (!def) return;
  saveAgeParadox({ type: deathAgeType, ...def, recordedAt: new Date().toISOString() });
};

const getAgeParadoxBonus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadAgeParadox();
};

// ── 38번: 소환수 계승 ──
// 전생에서 함께한 소환수가 다음 회차에 야생으로 등장. 조건 충족 시 재계약
const SUMMON_LEGACY_KEY   = "taleforge-summonlegacy";
const loadSummonLegacy    = () => { const r = lsGet(SUMMON_LEGACY_KEY); return r ? JSON.parse(r) : []; };
const saveSummonLegacy    = (s) => lsSet(SUMMON_LEGACY_KEY, JSON.stringify(s));
const clearSummonLegacy   = () => lsDel(SUMMON_LEGACY_KEY);

// { name, type, bond (1~10), scenario, recordedAt }
const recordSummonLegacy = (name, type, bond, scenario) => {
  if (!name) return;
  const legacy = loadSummonLegacy();
  const existing = legacy.find(s => s.name === name);
  if (existing) {
    existing.bond = Math.min(10, (existing.bond||1) + 1);
    existing.appearances = (existing.appearances||1) + 1;
  } else {
    legacy.push({ name, type: type||"미지의 존재", bond: bond||1, scenario: scenario||"", appearances: 1, recordedAt: new Date().toISOString() });
  }
  if (legacy.length > 5) legacy.sort((a,b)=>b.bond-a.bond).splice(5);
  saveSummonLegacy(legacy);
};

const getSummonLegacies = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadSummonLegacy().filter(s => s.bond >= 2); // 유대 2 이상만 표시
};

// ── 39번: 원한 무기 ──
// 나를 죽인 무기/스킬이 다음 회차에 내가 쓸 수 있는 형태로 등장
const GRUDGE_WEAPON_KEY   = "taleforge-grudgeweapon";
const loadGrudgeWeapons   = () => { const r = lsGet(GRUDGE_WEAPON_KEY); return r ? JSON.parse(r) : []; };
const saveGrudgeWeapons   = (w) => lsSet(GRUDGE_WEAPON_KEY, JSON.stringify(w));
const clearGrudgeWeapons  = () => lsDel(GRUDGE_WEAPON_KEY);

// { weaponName, killerName, power (1~5), scenario, times }
const recordGrudgeWeapon = (weaponName, killerName, scenario) => {
  if (!weaponName) return;
  const weapons = loadGrudgeWeapons();
  const existing = weapons.find(w => w.weaponName === weaponName);
  if (existing) {
    existing.times = (existing.times||1) + 1;
    existing.power = Math.min(5, Math.floor(existing.times / 2) + 1);
  } else {
    weapons.push({ weaponName, killerName: killerName||"알 수 없는 적", power: 1, scenario: scenario||"", times: 1, recordedAt: new Date().toISOString() });
  }
  if (weapons.length > 5) weapons.sort((a,b)=>b.times-a.times).splice(5);
  saveGrudgeWeapons(weapons);
};

const getGrudgeWeapons = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadGrudgeWeapons();
};

// ── 40번: 세계수 성장 ──
// 회차마다 황폐한 세계가 점점 복원되는 메타 스토리
const WORLD_TREE_KEY   = "taleforge-worldtree";
const loadWorldTree    = () => { const r = lsGet(WORLD_TREE_KEY); return r ? JSON.parse(r) : { level:0, totalRestored:0, branches:[] }; };
const saveWorldTree    = (t) => lsSet(WORLD_TREE_KEY, JSON.stringify(t));
// 세계수는 clearAll 해도 초기화되지 않음 (의도적)

const WORLD_TREE_STAGES = [
  { level:0,  label:"황폐한 그루터기",     icon:"🪨", desc:"세계가 황폐하다. 생명의 기운이 거의 느껴지지 않는다.", restoreDesc:"" },
  { level:1,  label:"새싹의 세계",         icon:"🌱", desc:"작은 새싹이 돋아났다. 세상 어딘가에 생명이 깃들기 시작한다.", restoreDesc:"처음 새싹이 움텄다.", bonus:"자연 지역에서 회복 아이템 발견 확률 +10%" },
  { level:2,  label:"어린나무의 세계",     icon:"🌿", desc:"가느다란 나무가 자랐다. 동물들이 돌아오기 시작했다.", restoreDesc:"나무가 성장했다.", bonus:"소환수·동물 NPC 호감도 +15" },
  { level:3,  label:"울창한 숲의 세계",   icon:"🌲", desc:"숲이 우거졌다. 세계의 자연 균형이 서서히 회복된다.", restoreDesc:"숲이 우거졌다.", bonus:"자연 관련 스킬 판정 +10, 비밀 숲 경로 등장" },
  { level:4,  label:"꽃이 핀 세계",       icon:"🌸", desc:"꽃이 만개한 세계. 사람들의 얼굴에 희망이 돌아왔다.", restoreDesc:"꽃이 피었다.", bonus:"NPC 전체 호감도 +10, 행복 결말 분기 확률 상승" },
  { level:5,  label:"황금 세계수의 세계", icon:"🌳", desc:"거대한 황금 세계수가 우뚝 섰다. 세계가 완전히 복원되었다. 전설이 완성되었다.", restoreDesc:"세계수가 완성되었다!", bonus:"전설 클래스 해금, 모든 스탯 +5, 진엔딩 경로 강화" },
];

const growWorldTree = (endingType) => {
  const tree = loadWorldTree();
  const gain = endingType === "hero" ? 2 : endingType === "sacrifice" ? 2 : endingType === "villain" ? 0 : 1;
  tree.totalRestored = (tree.totalRestored||0) + gain;
  const newLevel = Math.min(5, Math.floor(tree.totalRestored / 3));
  const didLevelUp = newLevel > (tree.level||0);
  tree.level = newLevel;
  if (didLevelUp) {
    const stage = WORLD_TREE_STAGES[newLevel];
    tree.branches = tree.branches || [];
    tree.branches.push({ level: newLevel, label: stage.label, recordedAt: new Date().toISOString() });
  }
  saveWorldTree(tree);
  return { level: newLevel, didLevelUp, stage: WORLD_TREE_STAGES[newLevel] };
};

const getWorldTreeStatus = () => {
  const tree = loadWorldTree();
  const level = tree.level || 0;
  return { ...tree, stage: WORLD_TREE_STAGES[level] };
};


// ════════════════════════════════════════════════════════════
// ── 41~50번 시스템 ──
// ════════════════════════════════════════════════════════════

// ── 41번: 꿈의 예언 ──
// 전생의 마지막 꿈이 다음 회차에 예언으로 남아 중요한 순간을 경고/안내
const DREAM_PROPHECY_KEY  = "taleforge-dream-prophecy";
const loadDreamProphecies = () => { const r = lsGet(DREAM_PROPHECY_KEY); return r ? JSON.parse(r) : []; };
const saveDreamProphecies = (d) => lsSet(DREAM_PROPHECY_KEY, JSON.stringify(d));
const clearDreamProphecies = () => lsDel(DREAM_PROPHECY_KEY);

const DREAM_TYPES = [
  { id:"flood",    icon:"🌊", keyword:"물",   prophecy:"거대한 물결이 모든 것을 삼키는 꿈. 홍수 혹은 압도적인 힘의 충돌이 예고된다." },
  { id:"fire",     icon:"🔥", keyword:"불",   prophecy:"불길 속에서 무언가가 태어나는 꿈. 시련 뒤에 변혁이 기다린다." },
  { id:"mirror",   icon:"🪞", keyword:"거울", prophecy:"거울 속 자신이 다르게 보이는 꿈. 정체성의 위기 혹은 이중성과 맞닥뜨린다." },
  { id:"tower",    icon:"🗼", keyword:"탑",   prophecy:"무너지는 탑 꿈. 오만이나 과도한 야망이 붕괴를 부른다." },
  { id:"star",     icon:"⭐", keyword:"별",   prophecy:"별이 떨어지는 꿈. 위대한 존재의 종말 혹은 새로운 시대의 시작." },
  { id:"void",     icon:"🌑", keyword:"어둠", prophecy:"아무것도 없는 어둠 속에서 목소리가 들리는 꿈. 잊혀진 진실이 입을 연다." },
  { id:"child",    icon:"👶", keyword:"아이", prophecy:"웃는 아이의 꿈. 순수함 혹은 새로운 시작이 열쇠가 된다." },
  { id:"labyrinth",icon:"🌀", keyword:"미로", prophecy:"끝없는 미로를 헤매는 꿈. 선택지마다 함정이 숨어있을 수 있다." },
];

const recordDreamProphecy = (wilScore, scenario) => {
  const dreams = loadDreamProphecies();
  const idx = Math.floor((wilScore + dreams.length) % DREAM_TYPES.length);
  const dtype = DREAM_TYPES[idx];
  // 이미 같은 꿈 있으면 count만 증가
  const existing = dreams.find(d => d.id === dtype.id);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.scenarios = existing.scenarios || [];
    if (scenario && !existing.scenarios.includes(scenario)) existing.scenarios.push(scenario);
  } else {
    dreams.push({ ...dtype, count: 1, scenarios: scenario ? [scenario] : [], recordedAt: new Date().toISOString() });
  }
  if (dreams.length > 5) dreams.splice(0, dreams.length - 5);
  saveDreamProphecies(dreams);
};

const getDreamProphecies = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadDreamProphecies();
};

// ── 42번: 유산 건축 ──
// 전생에 세운 건물·거점·조직이 이번 생 세계에 폐허나 전설로 남음
const LEGACY_BUILDING_KEY  = "taleforge-legacy-building";
const loadLegacyBuildings  = () => { const r = lsGet(LEGACY_BUILDING_KEY); return r ? JSON.parse(r) : []; };
const saveLegacyBuildings  = (b) => lsSet(LEGACY_BUILDING_KEY, JSON.stringify(b));
const clearLegacyBuildings = () => lsDel(LEGACY_BUILDING_KEY);

const BUILDING_TYPES = {
  tavern:    { icon:"🍺", label:"선술집",    ruinDesc:"폐허가 된 선술집. 벽에 이전 주인의 이름이 희미하게 새겨져 있다.", bonus:"상인·여행자 NPC 친화도 +10" },
  fortress:  { icon:"🏰", label:"요새",      ruinDesc:"허물어진 요새. 전략적 요충지로 가끔 언급된다.", bonus:"방어 전투 시 병력 보너스 가능" },
  library:   { icon:"📚", label:"도서관",    ruinDesc:"불탄 도서관의 잔해. 일부 서적이 남아있을 수 있다.", bonus:"지식 탐색 시 단서 +1" },
  guild:     { icon:"⚔️", label:"길드",      ruinDesc:"해산된 모험가 길드의 흔적. 구성원의 후손이 살아있다.", bonus:"길드 관련 퀘스트 등장 확률 상승" },
  temple:    { icon:"⛪", label:"신전",      ruinDesc:"오래된 신전. 지역민이 여전히 제물을 올린다.", bonus:"신앙 판정 +10, 은신처 제공" },
  village:   { icon:"🏘️", label:"마을",      ruinDesc:"개척한 마을이 작은 도시로 성장했다.", bonus:"마을 주민 초기 호감도 +20" },
  ship:      { icon:"⛵", label:"선단",      ruinDesc:"해적·상단의 전설로 남은 선단.", bonus:"항해·해상 루트 정보 획득 가능" },
};

const recordLegacyBuilding = (buildingType, name, scenario) => {
  const buildings = loadLegacyBuildings();
  const bdef = BUILDING_TYPES[buildingType];
  if (!bdef) return;
  const existing = buildings.find(b => b.type === buildingType);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
  } else {
    buildings.push({ type: buildingType, name: name || bdef.label, ...bdef, scenario: scenario || "", count: 1, recordedAt: new Date().toISOString() });
  }
  if (buildings.length > 6) buildings.shift();
  saveLegacyBuildings(buildings);
};

const getLegacyBuildings = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadLegacyBuildings();
};

// ── 43번: 감시자의 눈 ──
// 강적이 플레이어(의 혼)를 기억하고 다음 생에 강화되어 재등장
const WATCHER_KEY  = "taleforge-watcher";
const loadWatchers = () => { const r = lsGet(WATCHER_KEY); return r ? JSON.parse(r) : []; };
const saveWatchers = (w) => lsSet(WATCHER_KEY, JSON.stringify(w));
const clearWatchers = () => lsDel(WATCHER_KEY);

const recordWatcher = (enemyName, power, scenario) => {
  if (!enemyName) return;
  const watchers = loadWatchers();
  const existing = watchers.find(w => w.name === enemyName);
  if (existing) {
    existing.encounters = (existing.encounters || 1) + 1;
    existing.power = Math.min(10, (existing.power || 1) + 1);
    existing.evolved = existing.encounters >= 3;
  } else {
    watchers.push({ name: enemyName, power: Math.min(10, power || 1), encounters: 1, scenario: scenario || "", evolved: false, recordedAt: new Date().toISOString() });
  }
  if (watchers.length > 4) watchers.sort((a,b)=>b.power-a.power).splice(4);
  saveWatchers(watchers);
};

const getWatchers = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadWatchers();
};

// ── 44번: 영혼의 가면 ──
// 전생에서 맡았던 직업·역할이 이번 생에서 변장·연기 능력으로 이월
const SOUL_MASK_KEY  = "taleforge-soul-mask";
const loadSoulMasks  = () => { const r = lsGet(SOUL_MASK_KEY); return r ? JSON.parse(r) : []; };
const saveSoulMasks  = (m) => lsSet(SOUL_MASK_KEY, JSON.stringify(m));
const clearSoulMasks = () => lsDel(SOUL_MASK_KEY);

const ROLE_TO_MASK = {
  "상인":    { icon:"💰", masquerade:"상인 행세",     bonus:"상거래·가격 협상 시 유리한 위치, 상인 신뢰도 높음" },
  "기사":    { icon:"🛡️", masquerade:"기사 행세",     bonus:"귀족·군인 NPC에게 신뢰도 +15, 위기 시 리더십 발휘" },
  "마법사":  { icon:"🔮", masquerade:"학자 행세",     bonus:"마법 지식 판정 우대, 마법사 조합 접근 가능" },
  "도적":    { icon:"🗡️", masquerade:"도적 행세",     bonus:"지하조직 정보 접근, 잠금장치 관련 판정 +10" },
  "사제":    { icon:"⛪", masquerade:"성직자 행세",   bonus:"민간인 신뢰도 +20, 치유·축복 서비스 요청 가능" },
  "음유시인":{ icon:"🎵", masquerade:"음유시인 행세", bonus:"어느 세력에도 자연스럽게 접근, 소문 수집 용이" },
  "용병":    { icon:"⚔️", masquerade:"용병 행세",     bonus:"용병 조합 정보망 활용, 분쟁 지역 자유 이동" },
};

const recordSoulMask = (role, scenario) => {
  if (!role) return;
  const masks = loadSoulMasks();
  const mdef = Object.entries(ROLE_TO_MASK).find(([key]) => role.includes(key));
  if (!mdef) return;
  const [roleKey, maskData] = mdef;
  const existing = masks.find(m => m.roleKey === roleKey);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.mastery = Math.min(5, Math.floor(existing.count / 2) + 1);
  } else {
    masks.push({ roleKey, role, ...maskData, count: 1, mastery: 1, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  if (masks.length > 5) masks.sort((a,b)=>b.mastery-a.mastery).splice(5);
  saveSoulMasks(masks);
};

const getSoulMasks = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadSoulMasks();
};

// ── 45번: 감정의 파문 ──
// 전생의 극단적 감정(기쁨/분노/슬픔)이 세계에 파문을 남겨 특정 지역/사건에 영향
const EMOTION_RIPPLE_KEY  = "taleforge-emotion-ripple";
const loadEmotionRipples  = () => { const r = lsGet(EMOTION_RIPPLE_KEY); return r ? JSON.parse(r) : []; };
const saveEmotionRipples  = (e) => lsSet(EMOTION_RIPPLE_KEY, JSON.stringify(e));
const clearEmotionRipples = () => lsDel(EMOTION_RIPPLE_KEY);

const EMOTION_RIPPLE_DEFS = {
  joy:     { icon:"✨", label:"기쁨의 파문",  worldEffect:"그 지역에 번영의 기운이 감돈다. 축제나 결혼식 같은 경사가 잦다.", bonus:"해당 세계관에서 우호적 이벤트 확률 +15%" },
  rage:    { icon:"🔥", label:"분노의 파문",  worldEffect:"땅에 균열이 생기거나 폭풍이 잦아졌다. 분쟁과 갈등이 끊이지 않는다.", bonus:"전투 이벤트 빈도 상승, 적 드롭 +10%" },
  sorrow:  { icon:"🌧️", label:"슬픔의 파문", worldEffect:"그 지역에 안개가 걷히지 않는다. 사람들이 이유 모를 그리움을 느낀다.", bonus:"감성적 선택지 등장, 슬픔 관련 NPC 공감 +20%" },
  fear:    { icon:"🌑", label:"공포의 파문",  worldEffect:"지역민이 이유 없이 두려워한다. 밤에 외출을 삼간다.", bonus:"공포 판정 시 적 위축 효과 발생 가능" },
  pride:   { icon:"👑", label:"자부심의 파문",worldEffect:"영웅 전설이 구전으로 퍼졌다. 민중이 이름 없는 영웅을 기린다.", bonus:"평판 판정 +10, 영웅 호칭 획득 가능" },
  despair: { icon:"💀", label:"절망의 파문",  worldEffect:"그 지역 사람들은 체념한 얼굴이다. 희망을 주면 강렬하게 반응한다.", bonus:"희망 관련 선택지 강화, 역경 극복 서사 보정" },
};

const recordEmotionRipple = (dominantEmotion, scenario) => {
  if (!dominantEmotion) return;
  const ripples = loadEmotionRipples();
  const rdef = EMOTION_RIPPLE_DEFS[dominantEmotion];
  if (!rdef) return;
  const existing = ripples.find(r => r.id === dominantEmotion);
  if (existing) {
    existing.intensity = Math.min(5, (existing.intensity || 1) + 1);
    existing.scenarios = existing.scenarios || [];
    if (scenario && !existing.scenarios.includes(scenario)) existing.scenarios.push(scenario);
  } else {
    ripples.push({ id: dominantEmotion, ...rdef, intensity: 1, scenarios: scenario ? [scenario] : [], recordedAt: new Date().toISOString() });
  }
  if (ripples.length > 3) ripples.sort((a,b)=>b.intensity-a.intensity).splice(3);
  saveEmotionRipples(ripples);
};

const getEmotionRipples = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadEmotionRipples();
};

// ── 46번: 유언장 ──
// 전생에 남긴 유언이 이번 생에 어딘가에서 발견되어 힌트·아이템·NPC 반응 유발
const TESTAMENT_KEY  = "taleforge-testament";
const loadTestaments = () => { const r = lsGet(TESTAMENT_KEY); return r ? JSON.parse(r) : []; };
const saveTestaments = (t) => lsSet(TESTAMENT_KEY, JSON.stringify(t));
const clearTestaments = () => lsDel(TESTAMENT_KEY);

const TESTAMENT_TONES = {
  heroic:   { icon:"⚔️", label:"영웅의 유언",   hint:"이 세계 어딘가에 전생의 영웅이 남긴 유서가 묻혀있다. 발견 시 용기를 주는 메시지와 함께 유물이 함께 발견된다." },
  regretful:{ icon:"😔", label:"후회의 유언",   hint:"전생의 미완 과업을 암시하는 쪽지가 폐허에서 발견될 수 있다. 해결 시 카르마 보너스." },
  vengeful: { icon:"🗡️", label:"복수의 유언",   hint:"전생의 원한을 담은 유서. 특정 악당 혹은 세력에 대한 경고와 약점 정보가 담겨있다." },
  hopeful:  { icon:"🌅", label:"희망의 유언",   hint:"세계에 대한 희망을 담은 유서. 어두운 순간에 NPC가 이 유서를 언급하며 플레이어를 고무시킨다." },
  cryptic:  { icon:"🔮", label:"수수께끼 유언", hint:"해독해야 하는 암호화된 유서. 핵심 비밀로 향하는 열쇠를 담고 있다." },
};

const recordTestament = (lastWordTone, characterName, scenario) => {
  const tests = loadTestaments();
  const tdef = TESTAMENT_TONES[lastWordTone] || TESTAMENT_TONES.hopeful;
  tests.push({ ...tdef, characterName: characterName || "전생의 나", scenario: scenario || "", recordedAt: new Date().toISOString() });
  if (tests.length > 5) tests.shift();
  saveTestaments(tests);
};

const getTestaments = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadTestaments();
};

// ── 47번: 숙명의 별자리 ──
// 회차 수 기반으로 별자리 운세가 배정되어 이번 회차 특수 효과 부여
const CONSTELLATION_KEY  = "taleforge-constellation";
const loadConstellation  = () => { const r = lsGet(CONSTELLATION_KEY); return r ? JSON.parse(r) : null; };
const saveConstellation  = (c) => lsSet(CONSTELLATION_KEY, JSON.stringify(c));
const clearConstellation = () => lsDel(CONSTELLATION_KEY);

const CONSTELLATIONS = [
  { id:"aries",     icon:"♈", name:"양자리",   trait:"개척자",  bonus:"처음 도전하는 행동에 판정 보너스 +15",          challenge:"익숙한 것에 안주하면 불운이 따른다." },
  { id:"taurus",    icon:"♉", name:"황소자리", trait:"수호자",  bonus:"방어·생존 판정 우대, HP 최대치 +5",              challenge:"변화에 저항하면 기회를 놓친다." },
  { id:"gemini",    icon:"♊", name:"쌍둥이자리",trait:"사기꾼", bonus:"변장·협상·정보 수집 판정 +10",                   challenge:"이중적 행동이 신뢰를 해칠 수 있다." },
  { id:"cancer",    icon:"♋", name:"게자리",   trait:"수호신",  bonus:"아군 NPC 보호 행동 시 강화, 치유 효과 +10%",    challenge:"집착이 발목을 잡을 수 있다." },
  { id:"leo",       icon:"♌", name:"사자자리", trait:"영웅",    bonus:"공개적 행동·연설·전투 선언 시 판정 +15",         challenge:"오만이 적을 단합시킬 수 있다." },
  { id:"virgo",     icon:"♍", name:"처녀자리", trait:"현자",    bonus:"분석·탐색·함정 탐지 판정 +15",                   challenge:"완벽주의가 결단을 늦출 수 있다." },
  { id:"libra",     icon:"♎", name:"천칭자리", trait:"조율사",  bonus:"협상·외교·중재 판정 +15, 양측 호감도 보정",      challenge:"우유부단이 결정적 순간을 놓친다." },
  { id:"scorpio",   icon:"♏", name:"전갈자리", trait:"암살자",  bonus:"기습·비밀 수집·독 관련 판정 +15",               challenge:"집착과 복수심이 화를 부른다." },
  { id:"sagittarius",icon:"♐",name:"사수자리", trait:"탐험가", bonus:"새 지역 탐험 시 희귀 이벤트 확률 상승",           challenge:"경솔한 행동이 발목을 잡는다." },
  { id:"capricorn", icon:"♑", name:"염소자리", trait:"전략가", bonus:"장기 계획·자원 관리 판정 +15",                    challenge:"냉정함이 동료를 멀리할 수 있다." },
  { id:"aquarius",  icon:"♒", name:"물병자리", trait:"혁명가", bonus:"기존 질서 타파·반란·창의적 행동 판정 +15",        challenge:"고집이 협력을 방해할 수 있다." },
  { id:"pisces",    icon:"♓", name:"물고기자리",trait:"예언자", bonus:"꿈·예언·신비 관련 이벤트 강화, 직관 판정 +15",  challenge:"현실 감각을 잃으면 위험하다." },
];

const assignConstellation = () => {
  const cycle = loadCycleCount();
  const cIdx = cycle % CONSTELLATIONS.length;
  const constellation = CONSTELLATIONS[cIdx];
  saveConstellation({ ...constellation, assignedAt: new Date().toISOString(), cycle });
  return constellation;
};

const getConstellation = () => {
  return loadConstellation();
};

// ── 48번: 탐험가의 유산 ──
// 전생에 발견·개척한 장소가 지도 정보로 이월되어 이번 생에 유리한 위치 정보 제공
const EXPLORER_MAP_KEY  = "taleforge-explorer-map";
const loadExplorerMap   = () => { const r = lsGet(EXPLORER_MAP_KEY); return r ? JSON.parse(r) : []; };
const saveExplorerMap   = (m) => lsSet(EXPLORER_MAP_KEY, JSON.stringify(m));
const clearExplorerMap  = () => lsDel(EXPLORER_MAP_KEY);

const MAP_LOCATION_TYPES = [
  { id:"secret_passage", icon:"🕳️", label:"비밀 통로",   desc:"이전 회차에 발견한 비밀 통로의 위치를 기억한다.",    bonus:"탈출·기습 루트 정보 보유, 추격전 자동 성공 가능" },
  { id:"hidden_dungeon", icon:"🏚️", label:"숨겨진 던전", desc:"지도에 없는 던전의 입구를 알고 있다.",               bonus:"희귀 아이템 던전 접근 가능, 탐색 판정 +20" },
  { id:"safe_haven",     icon:"🏕️", label:"안전 은신처", desc:"위기 시 몸을 숨길 수 있는 은신처 위치.",             bonus:"적 추격 시 1회 안전 은신 가능" },
  { id:"ancient_ruin",   icon:"🏛️", label:"고대 유적",   desc:"고대 문명의 유적 위치를 알고 있다.",                 bonus:"고대 지식 관련 이벤트 트리거 가능" },
  { id:"trading_hub",    icon:"🏪", label:"암시장",       desc:"공식 지도에 없는 암시장의 위치.",                    bonus:"희귀 물품 거래 접근권, 가격 흥정 +15%" },
  { id:"power_spot",     icon:"💫", label:"기운 지점",    desc:"마력이나 기운이 집중된 장소.",                       bonus:"해당 장소 근처 스킬/마법 판정 +10" },
];

const recordExploredLocation = (locationType, scenario) => {
  const map = loadExplorerMap();
  const ldef = MAP_LOCATION_TYPES.find(l => l.id === locationType);
  if (!ldef) return;
  const existing = map.find(l => l.id === locationType);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.scenarios = existing.scenarios || [];
    if (scenario && !existing.scenarios.includes(scenario)) existing.scenarios.push(scenario);
  } else {
    map.push({ ...ldef, count: 1, scenarios: scenario ? [scenario] : [], recordedAt: new Date().toISOString() });
  }
  if (map.length > 6) map.shift();
  saveExplorerMap(map);
};

const getExplorerMap = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadExplorerMap();
};

// ── 49번: 번개 각인 ──
// 전생의 가장 극적인 순간(크리티컬/영웅적 행동)이 기술/본능으로 각인
const LIGHTNING_IMPRINT_KEY  = "taleforge-lightning-imprint";
const loadLightningImprints  = () => { const r = lsGet(LIGHTNING_IMPRINT_KEY); return r ? JSON.parse(r) : []; };
const saveLightningImprints  = (i) => lsSet(LIGHTNING_IMPRINT_KEY, JSON.stringify(i));
const clearLightningImprints = () => lsDel(LIGHTNING_IMPRINT_KEY);

const IMPRINT_TYPES = [
  { id:"killing_blow",    icon:"⚡", label:"결정타 각인",     desc:"전생의 최후 일격이 각인됨.",                        bonus:"HP 20% 이하 적에게 공격 시 자동 크리티컬 확률 +20%" },
  { id:"last_stand",      icon:"🛡️", label:"최후 방어 각인",  desc:"죽음의 순간 버텨낸 기억이 각인됨.",                  bonus:"HP 10 이하 시 피해 30% 자동 감소 (1회/전투)" },
  { id:"miracle_escape",  icon:"💨", label:"기적 탈출 각인",  desc:"불가능한 탈출에 성공한 기억이 각인됨.",              bonus:"포위·함정 상황에서 탈출 판정 자동 보너스" },
  { id:"heroic_sacrifice",icon:"✨", label:"희생 각인",        desc:"타인을 위한 희생 순간이 각인됨.",                    bonus:"아군 보호 행동 시 판정 무조건 성공 (1회/시나리오)" },
  { id:"forbidden_power", icon:"💀", label:"금기 해방 각인",  desc:"한계를 초월한 순간의 기억이 각인됨.",               bonus:"위기 시 금기 스킬 임시 해금 가능 (카르마 소모)" },
  { id:"perfect_strike",  icon:"🎯", label:"완벽한 일격 각인",desc:"완벽한 판단과 타이밍이 각인됨.",                    bonus:"선제 공격 판정 +25, 기습 성공률 상승" },
];

const recordLightningImprint = (imprintType, scenario) => {
  if (!imprintType) return;
  const imprints = loadLightningImprints();
  const idef = IMPRINT_TYPES.find(i => i.id === imprintType);
  if (!idef) return;
  const existing = imprints.find(i => i.id === imprintType);
  if (existing) {
    existing.power = Math.min(5, (existing.power || 1) + 1);
    existing.count = (existing.count || 1) + 1;
  } else {
    imprints.push({ ...idef, power: 1, count: 1, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  if (imprints.length > 4) imprints.sort((a,b)=>b.power-a.power).splice(4);
  saveLightningImprints(imprints);
};

const getLightningImprints = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadLightningImprints();
};

// ── 50번: 전생의 일출 ──
// 누적 회차가 쌓일수록 세계 전체에 여명이 밝아오는 대단원 시스템
// 세계수(40번)와 연계하여 최고 단계에서 진엔딩 루트 강화
const DAWN_KEY  = "taleforge-dawn-of-ages";
const loadDawn  = () => { const r = lsGet(DAWN_KEY); return r ? JSON.parse(r) : { totalLight: 0, stage: 0, milestones: [] }; };
const saveDawn  = (d) => lsSet(DAWN_KEY, JSON.stringify(d));
// 50번 시스템은 의도적으로 clearAll에 포함시키지 않음 (세계수처럼 누적 유지)

const DAWN_STAGES = [
  { stage:0, label:"칠흑의 밤",       icon:"🌑", color:"#1a1a2e", desc:"세계는 어둠에 잠겨있다. 아직 여명의 기미가 없다.",                         worldBonus:null },
  { stage:1, label:"새벽빛의 떨림",   icon:"🌒", color:"#2e2a4a", desc:"지평선 너머 아주 희미한 빛. 희망의 첫 씨앗이 뿌려졌다.",                   worldBonus:"위기 상황에서 갑작스러운 조력자 등장 확률 상승" },
  { stage:2, label:"여명의 시작",     icon:"🌓", color:"#4a3a2e", desc:"하늘이 점차 밝아온다. 세계 곳곳에서 변화의 바람이 분다.",                   worldBonus:"선량한 NPC 호감도 전체 +10, 악의 세력 약간 위축" },
  { stage:3, label:"붉은 새벽",       icon:"🌔", color:"#6a4a2e", desc:"붉은 새벽이 세계를 물들인다. 영웅의 이야기가 전설로 퍼진다.",               worldBonus:"퀘스트 보상 +20%, 명성 획득량 증가" },
  { stage:4, label:"황금빛 여명",     icon:"🌕", color:"#8a7a2e", desc:"황금빛 여명. 세계 전역에서 사람들이 하늘을 올려다본다.",                    worldBonus:"전투 승리 시 추가 SP, 모든 판정 보너스 +5" },
  { stage:5, label:"완전한 일출",     icon:"🌅", color:"#c8a96e", desc:"드디어 태양이 지평선 위로 완전히 떠올랐다. 세계가 다시 빛 속에 잠긴다. 전설이 완성되었다.", worldBonus:"진엔딩 분기 해금, 모든 시스템 최고 보너스 활성화, 세계수와 연동 시 불멸의 전설 칭호" },
];

const growDawn = (heroicScore) => {
  const dawn = loadDawn();
  // 영웅적 회차일수록 더 많은 빛
  const gain = heroicScore >= 80 ? 3 : heroicScore >= 60 ? 2 : heroicScore >= 40 ? 1 : 0;
  dawn.totalLight = (dawn.totalLight || 0) + gain;
  const newStage = Math.min(5, Math.floor(dawn.totalLight / 4));
  const didLevelUp = newStage > (dawn.stage || 0);
  dawn.stage = newStage;
  if (didLevelUp) {
    dawn.milestones = dawn.milestones || [];
    dawn.milestones.push({ stage: newStage, label: DAWN_STAGES[newStage].label, recordedAt: new Date().toISOString() });
  }
  saveDawn(dawn);
  return { stage: newStage, didLevelUp, stageData: DAWN_STAGES[newStage] };
};

const getDawnStatus = () => {
  const dawn = loadDawn();
  const stage = dawn.stage || 0;
  return { ...dawn, stageData: DAWN_STAGES[stage] };
};


// ── 51~60번 시스템 ──
// ════════════════════════════════════════════════════════════

// ── 51번: 전쟁의 흉터 ──
// 전생에서 참전한 전쟁의 흔적이 이번 생에 세계 지형·정치에 영향을 미침
const WAR_SCAR_KEY  = "taleforge-war-scar";
const loadWarScars  = () => { const r = lsGet(WAR_SCAR_KEY); return r ? JSON.parse(r) : []; };
const saveWarScars  = (w) => lsSet(WAR_SCAR_KEY, JSON.stringify(w));
const clearWarScars = () => lsDel(WAR_SCAR_KEY);

const WAR_SCAR_TYPES = [
  { id:"siege",       icon:"🏰", label:"공성전 흔적",    worldEffect:"함락된 성이 폐허로 남아 이번 생의 무법 지대가 됐다.",       bonus:"폐허 탐색 시 희귀 유물 발견 확률 +25%, 무법 지대 자유 행동" },
  { id:"plague_war",  icon:"☠️", label:"역병 전쟁 흔적", worldEffect:"전쟁 중 퍼진 역병의 후유증이 지역에 남아있다.",             bonus:"의료·치유 판정 +15, 역병 면역 NPC 정보망 접근" },
  { id:"revolution",  icon:"🔥", label:"혁명의 흔적",    worldEffect:"전생의 혁명으로 뒤바뀐 권력 구도가 이번 생에도 지속된다.", bonus:"반체제 세력 호감도 +20, 귀족 초기 경계심 +10" },
  { id:"naval_battle",icon:"⛵", label:"해전 흔적",       worldEffect:"침몰한 함선들이 해저 유적이 되어 보물을 품고 있다.",         bonus:"항해·잠수 관련 탐색 시 보물 이벤트 확률 상승" },
  { id:"border_war",  icon:"🗺️", label:"국경 분쟁 흔적", worldEffect:"전생에 다툰 국경 지대가 긴장 상태로 이어진다.",             bonus:"국경 지대 밀수 루트 정보 보유, 밀입국 판정 자동 성공" },
  { id:"dragon_war",  icon:"🐉", label:"용과의 전쟁 흔적",worldEffect:"용과 싸운 전장에 고농도 마력이 잔류한다.",                   bonus:"마법 판정 전체 +10, 드래곤 관련 이벤트 조기 해금" },
];

const recordWarScar = (warType, scenario) => {
  if (!warType) return;
  const scars = loadWarScars();
  const wdef = WAR_SCAR_TYPES.find(w => w.id === warType);
  if (!wdef) return;
  const existing = scars.find(s => s.id === warType);
  if (existing) {
    existing.severity = Math.min(5, (existing.severity || 1) + 1);
    existing.scenarios = existing.scenarios || [];
    if (scenario && !existing.scenarios.includes(scenario)) existing.scenarios.push(scenario);
  } else {
    scars.push({ ...wdef, severity: 1, scenarios: scenario ? [scenario] : [], recordedAt: new Date().toISOString() });
  }
  if (scars.length > 4) scars.sort((a,b) => b.severity - a.severity).splice(4);
  saveWarScars(scars);
};

const getWarScars = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadWarScars();
};

// ── 52번: 신의 계약 ──
// 전생에서 신·악마·정령과 맺은 계약이 다음 생에서도 효력을 유지
const DIVINE_CONTRACT_KEY  = "taleforge-divine-contract";
const loadDivineContracts  = () => { const r = lsGet(DIVINE_CONTRACT_KEY); return r ? JSON.parse(r) : []; };
const saveDivineContracts  = (c) => lsSet(DIVINE_CONTRACT_KEY, JSON.stringify(c));
const clearDivineContracts = () => lsDel(DIVINE_CONTRACT_KEY);

const CONTRACT_ENTITIES = {
  god:     { icon:"✨", label:"신의 계약",   terms:"신의 뜻에 따른 행동 시 기적 발동 가능.",      penalty:"신의 뜻을 거스르면 저주 축적.",         bonus:"신앙 판정 +20, 기적 이벤트 트리거 확률 상승" },
  demon:   { icon:"😈", label:"악마의 계약", terms:"악마에게 특정 대가를 약속했다.",              penalty:"계약 불이행 시 재앙 이벤트 발생.",        bonus:"금기 스킬 즉시 해금, 어둠 판정 +15" },
  spirit:  { icon:"🌿", label:"정령의 계약", terms:"자연 정령과 공생 협약을 맺었다.",             penalty:"자연 파괴 행위 시 정령이 등을 돌린다.",   bonus:"자연·탐색 판정 +15, 정령 조력자 등장 가능" },
  dragon:  { icon:"🐉", label:"용의 계약",   terms:"고룡과 상호 원조 협약.",                     penalty:"용의 명예를 손상하면 적으로 돌아선다.",   bonus:"용 관련 이벤트 조력, 불 저항 +20%" },
  trickster:{ icon:"🃏",label:"트릭스터 계약",terms:"장난의 신과 변덕스러운 거래를 맺었다.",      penalty:"계약 내용은 매 회차 무작위로 바뀐다.",    bonus:"행운 판정 극대화 가능, 랜덤 보너스 이벤트" },
};

const recordDivineContract = (entityType, contractDetail, scenario) => {
  if (!entityType) return;
  const contracts = loadDivineContracts();
  const cdef = CONTRACT_ENTITIES[entityType];
  if (!cdef) return;
  const existing = contracts.find(c => c.entityType === entityType);
  if (existing) {
    existing.renewals = (existing.renewals || 0) + 1;
    existing.power = Math.min(5, (existing.power || 1) + 1);
  } else {
    contracts.push({ entityType, ...cdef, contractDetail: contractDetail || "", power: 1, renewals: 0, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  if (contracts.length > 3) contracts.sort((a,b) => b.power - a.power).splice(3);
  saveDivineContracts(contracts);
};

const getDivineContracts = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadDivineContracts();
};

// ── 53번: 언어의 기억 ──
// 전생에서 터득한 언어·암호·고대 문자가 다음 생에 독해 능력으로 이월
const LANGUAGE_MEMORY_KEY  = "taleforge-language-memory";
const loadLanguageMemories = () => { const r = lsGet(LANGUAGE_MEMORY_KEY); return r ? JSON.parse(r) : []; };
const saveLanguageMemories = (l) => lsSet(LANGUAGE_MEMORY_KEY, JSON.stringify(l));
const clearLanguageMemories = () => lsDel(LANGUAGE_MEMORY_KEY);

const KNOWN_LANGUAGES = [
  { id:"ancient_rune",  icon:"🔤", label:"고대 룬 문자",  desc:"전생에서 고대 룬을 해독했다.",           bonus:"유적·석판 자동 해독, 마법 진 이해 +15" },
  { id:"draconic",      icon:"🐉", label:"용의 언어",     desc:"용과 교류하며 용어를 익혔다.",             bonus:"용 NPC 대화 가능, 용의 가르침 퀘스트 해금" },
  { id:"shadow_tongue",  icon:"🌑", label:"어둠의 언어",   desc:"지하 세계 세력의 은어를 익혔다.",          bonus:"암흑 조직 정보망 접근, 밀서 해독 가능" },
  { id:"nature_speech",  icon:"🌿", label:"자연의 말",     desc:"정령과 교감하며 자연어를 배웠다.",         bonus:"동물·정령과 의사소통, 자연 탐색 보너스" },
  { id:"celestial",     icon:"⭐", label:"천상의 언어",   desc:"신성한 존재와 대화하며 익힌 말.",           bonus:"신전 고문서 해독, 신성 판정 +10" },
  { id:"mechanical",    icon:"⚙️", label:"기계 언어",     desc:"사이버 공간과 기계를 다루며 익힌 언어.",    bonus:"해킹·기계 조작 판정 +15, 고대 장치 이해" },
];

const recordLanguageMemory = (languageId, scenario) => {
  if (!languageId) return;
  const memories = loadLanguageMemories();
  const ldef = KNOWN_LANGUAGES.find(l => l.id === languageId);
  if (!ldef) return;
  if (memories.some(m => m.id === languageId)) {
    const existing = memories.find(m => m.id === languageId);
    existing.fluency = Math.min(5, (existing.fluency || 1) + 1);
    return;
  }
  memories.push({ ...ldef, fluency: 1, scenario: scenario || "", recordedAt: new Date().toISOString() });
  if (memories.length > 6) memories.shift();
  saveLanguageMemories(memories);
};

const getLanguageMemories = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadLanguageMemories();
};

// ── 54번: 죄와 속죄 ──
// 전생에서 저지른 큰 죄가 이번 생에 속죄 퀘스트로 이월, 완수 시 강력한 보상
const SIN_REDEMPTION_KEY  = "taleforge-sin-redemption";
const loadSinRedemptions  = () => { const r = lsGet(SIN_REDEMPTION_KEY); return r ? JSON.parse(r) : []; };
const saveSinRedemptions  = (s) => lsSet(SIN_REDEMPTION_KEY, JSON.stringify(s));
const clearSinRedemptions = () => lsDel(SIN_REDEMPTION_KEY);

const SIN_TYPES = {
  betrayal:   { icon:"🗡️", label:"배신의 죄",   quest:"배신한 자의 후손을 돕는다.",          redemptionBonus:"카르마 +30, 신뢰 관련 판정 영구 +10" },
  cowardice:  { icon:"💨", label:"비겁함의 죄",  quest:"도망쳤던 전장을 다시 마주한다.",       redemptionBonus:"용기 관련 판정 +20, 전투 공포 면역" },
  greed:      { icon:"💰", label:"탐욕의 죄",    quest:"모은 재물을 궁핍한 자에게 나눈다.",    redemptionBonus:"카르마 +25, 상거래 운 영구 상승" },
  murder:     { icon:"💀", label:"살인의 죄",    quest:"억울하게 죽인 자의 원혼을 달랜다.",    redemptionBonus:"저주도 초기화, 혼백 관련 이벤트 해금" },
  pride:      { icon:"👑", label:"오만의 죄",    quest:"자신보다 낮은 자를 진심으로 섬긴다.", redemptionBonus:"리더십 판정 +15, 동료 사기 버프 강화" },
  destruction:{ icon:"🔥", label:"파괴의 죄",    quest:"파괴한 마을·조직을 재건한다.",         redemptionBonus:"건설 관련 이벤트 활성화, 민심 판정 +20" },
};

const recordSin = (sinType, targetName, scenario) => {
  if (!sinType) return;
  const sins = loadSinRedemptions();
  const sdef = SIN_TYPES[sinType];
  if (!sdef) return;
  const existing = sins.find(s => s.sinType === sinType);
  if (existing) {
    existing.weight = Math.min(5, (existing.weight || 1) + 1);
    existing.redeemed = false; // 새 죄 추가 시 속죄 리셋
  } else {
    sins.push({ sinType, ...sdef, targetName: targetName || "알 수 없는 자", weight: 1, redeemed: false, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  if (sins.length > 5) sins.sort((a,b) => b.weight - a.weight).splice(5);
  saveSinRedemptions(sins);
};

const redeemSin = (sinType) => {
  const sins = loadSinRedemptions();
  const sin = sins.find(s => s.sinType === sinType);
  if (sin) { sin.redeemed = true; saveSinRedemptions(sins); }
};

const getSinRedemptions = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadSinRedemptions();
};

// ── 55번: 전설의 조각 ──
// 전생에서 파편화된 전설 유물의 조각을 모을수록 이번 생에 완전한 유물로 복원
const LEGEND_SHARD_KEY  = "taleforge-legend-shard";
const loadLegendShards  = () => { const r = lsGet(LEGEND_SHARD_KEY); return r ? JSON.parse(r) : []; };
const saveLegendShards  = (s) => lsSet(LEGEND_SHARD_KEY, JSON.stringify(s));
const clearLegendShards = () => lsDel(LEGEND_SHARD_KEY);

const LEGEND_ARTIFACTS = [
  { id:"broken_crown",    icon:"👑", label:"부서진 왕관",     totalShards:5, completedBonus:"고대 왕국의 왕관 복원. 모든 귀족 NPC 초기 복종, LDR +20 영구 부여." },
  { id:"shattered_blade", icon:"⚔️", label:"산산조각 난 검",   totalShards:5, completedBonus:"전설의 검 복원. STR +25, 모든 전투 판정 최고 보너스 영구 부여." },
  { id:"cracked_tome",    icon:"📖", label:"갈라진 고대 서",   totalShards:4, completedBonus:"금지된 마법서 복원. MGC +20, 봉인된 마법 전체 해금." },
  { id:"split_compass",   icon:"🧭", label:"쪼개진 나침반",    totalShards:3, completedBonus:"어디든 찾아가는 나침반 복원. 탐색 판정 항상 성공, 숨겨진 장소 자동 발견." },
  { id:"torn_map",        icon:"🗺️", label:"찢긴 세계 지도",   totalShards:6, completedBonus:"완전한 세계 지도 복원. 모든 지역 정보 즉시 획득, 이동 비용 0." },
];

const recordLegendShard = (artifactId, scenario) => {
  if (!artifactId) return;
  const shards = loadLegendShards();
  const adef = LEGEND_ARTIFACTS.find(a => a.id === artifactId);
  if (!adef) return;
  const existing = shards.find(s => s.id === artifactId);
  if (existing) {
    if (existing.collected < existing.totalShards) {
      existing.collected += 1;
      existing.completed = existing.collected >= existing.totalShards;
      existing.scenarios = existing.scenarios || [];
      if (scenario && !existing.scenarios.includes(scenario)) existing.scenarios.push(scenario);
    }
  } else {
    shards.push({ ...adef, collected: 1, completed: adef.totalShards === 1, scenarios: scenario ? [scenario] : [], recordedAt: new Date().toISOString() });
  }
  saveLegendShards(shards);
};

const getLegendShards = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadLegendShards();
};

// ── 56번: 시간의 메아리 ──
// 전생에서 한 중요한 선택이 이번 생에 다른 형태로 메아리처럼 돌아옴
// (TIME_ECHO_KEY, loadTimeEchoes, saveTimeEchoes, clearTimeEchoes 위에서 이미 선언됨)

const ECHO_CHOICE_TYPES = {
  mercy:     { icon:"🕊️", label:"자비의 메아리",  echo:"전생에 살려준 자의 후손이 결정적 순간에 은혜를 갚는다.",       bonus:"위기 시 구원자 NPC 1회 등장 보장" },
  sacrifice: { icon:"✨", label:"희생의 메아리",   echo:"전생의 희생이 전설로 전해져 이름 없는 지지를 받는다.",         bonus:"민심 판정 +15, 집단전 지원군 등장 확률 상승" },
  deception: { icon:"🃏", label:"기만의 메아리",   echo:"전생의 속임수가 후세에 알려져 초기 신뢰도에 영향을 준다.",     bonus:"기만 판정 +20, 단 초기 NPC 신뢰도 -10" },
  alliance:  { icon:"🤝", label:"동맹의 메아리",   echo:"전생의 동맹 조약이 이번 생 세력 관계에 이어진다.",             bonus:"특정 세력 초기 우호도 +30, 공동 작전 제안 가능" },
  rebellion: { icon:"🔥", label:"반역의 메아리",   echo:"전생의 반역이 민중 사이에 혁명 정신으로 남아있다.",            bonus:"반체제 세력 즉각 동조, 민중 봉기 유도 가능" },
  forgiveness:{ icon:"💙",label:"용서의 메아리",   echo:"전생에 용서한 자가 진심으로 개과천선하여 이번 생에 조력자로 등장한다.", bonus:"개과천선 NPC 동료 획득 가능, 카르마 +20" },
};

const recordTimeEcho = (choiceType, context, scenario) => {
  if (!choiceType) return;
  const echoes = loadTimeEchoes();
  const edef = ECHO_CHOICE_TYPES[choiceType];
  if (!edef) return;
  echoes.push({ choiceType, ...edef, context: context || "", scenario: scenario || "", recordedAt: new Date().toISOString() });
  if (echoes.length > 5) echoes.shift();
  saveTimeEchoes(echoes);
};

// getTimeEchoes는 위(1559번 줄)에서 이미 선언됨

// ── 57번: 신화 작가 ──
// 회차를 거듭할수록 플레이어의 이야기가 세계 신화로 편입되어 NPC들이 전설을 아는 채로 등장
const MYTH_WRITER_KEY  = "taleforge-myth-writer";
const loadMythChapters = () => { const r = lsGet(MYTH_WRITER_KEY); return r ? JSON.parse(r) : { chapters: [], mythName: null, totalEpics: 0 }; };
const saveMythChapters = (m) => lsSet(MYTH_WRITER_KEY, JSON.stringify(m));
const clearMythChapters = () => lsDel(MYTH_WRITER_KEY);

const MYTH_CHAPTER_TYPES = [
  { id:"origin",      icon:"🌅", label:"기원의 장",   desc:"영웅의 탄생과 첫 시련을 다룬 장.", npcHint:"이 땅에 전설의 영웅이 처음 나타났을 때…" },
  { id:"trial",       icon:"⚔️", label:"시련의 장",   desc:"거대한 적에 맞서 싸운 이야기.",     npcHint:"그는 누구도 이길 수 없다던 적을 홀로 맞닥뜨렸다고 합니다…" },
  { id:"betrayal",    icon:"🗡️", label:"배신의 장",   desc:"믿었던 자의 배신과 극복.",          npcHint:"전설 속 영웅도 가장 가까운 자에게 배신을 당했다지요…" },
  { id:"redemption",  icon:"✨", label:"속죄의 장",   desc:"과오를 극복하고 다시 일어선 이야기.",npcHint:"그가 스스로의 죄를 인정하고 속죄에 나섰을 때, 세상이 달라졌습니다…" },
  { id:"sacrifice",   icon:"💙", label:"희생의 장",   desc:"모든 것을 걸고 타인을 구한 순간.",   npcHint:"전설의 영웅은 자신의 목숨보다 동료를 더 소중히 여겼다고…" },
  { id:"ascension",   icon:"🌟", label:"승천의 장",   desc:"한계를 초월해 전설이 된 순간.",      npcHint:"그 순간, 하늘이 갈라지고 새로운 전설이 시작되었다고 전해집니다…" },
];

const recordMythChapter = (chapterType, heroName, scenario) => {
  if (!chapterType) return;
  const myth = loadMythChapters();
  const cdef = MYTH_CHAPTER_TYPES.find(c => c.id === chapterType);
  if (!cdef) return;
  if (!myth.mythName && heroName) myth.mythName = heroName;
  myth.chapters = myth.chapters || [];
  if (!myth.chapters.some(c => c.id === chapterType)) {
    myth.chapters.push({ ...cdef, heroName: heroName || "전생의 나", scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  myth.totalEpics = (myth.totalEpics || 0) + 1;
  saveMythChapters(myth);
};

const getMythChapters = () => {
  const cycle = loadCycleCount();
  if (cycle < 2) return { chapters: [], mythName: null, totalEpics: 0 };
  return loadMythChapters();
};

// ── 58번: 혈맥의 유산 ──
// 전생의 혈통·가문이 이번 생에 가문으로 이어져 귀족·씨족 네트워크와 연결
// (BLOODLINE_KEY, loadBloodline, saveBloodline, clearBloodline 위에서 이미 선언됨)

const BLOODLINE_TRAITS = [
  { id:"warrior",    icon:"⚔️", label:"전사 혈통",   trait:"무인의 피가 흐른다.",                     bonus:"STR·END 초기값 +5, 전사 계층 NPC 초기 우호" },
  { id:"mage",       icon:"🔮", label:"마법사 혈통",  trait:"마법 친화적 피를 타고났다.",              bonus:"MGC·INT 초기값 +5, 마법사 조합 초기 접근권" },
  { id:"noble",      icon:"👑", label:"귀족 혈통",    trait:"귀족의 피와 예법을 타고났다.",            bonus:"LDR·SPK 초기값 +5, 귀족 사교계 초기 입장 가능" },
  { id:"rogue",      icon:"🗡️", label:"도적 혈통",   trait:"그림자 속에서 사는 가문의 피.",           bonus:"AGI·DISG 초기값 +5, 지하 조직 초기 정보망" },
  { id:"healer",     icon:"💚", label:"치유사 혈통",  trait:"치유의 소명이 피에 새겨졌다.",            bonus:"WIL·REGEN 초기값 +5, 의료 NPC 초기 신뢰" },
  { id:"merchant",   icon:"💰", label:"상인 혈통",    trait:"타고난 장사 감각이 피에 흐른다.",         bonus:"LUK·SPK 초기값 +5, 상인 조합 초기 할인 혜택" },
  { id:"wanderer",   icon:"🧭", label:"방랑자 혈통",  trait:"정착 없이 세상을 떠돈 가문의 피.",        bonus:"PER·AGI 초기값 +5, 다양한 지역 언어 파편 습득" },
];

const recordBloodlineTrait = (traitId, clanName, scenario) => {
  if (!traitId) return;
  const bloodline = loadBloodline();
  const tdef = BLOODLINE_TRAITS.find(t => t.id === traitId);
  if (!tdef) return;
  bloodline.lineage = bloodline.lineage || [];
  if (!bloodline.lineage.some(l => l.id === traitId)) {
    bloodline.lineage.push({ ...tdef, clanName: clanName || "이름 없는 가문", scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  bloodline.totalGenerations = (bloodline.totalGenerations || 0) + 1;
  if (!bloodline.dominantTrait && bloodline.lineage.length > 0) {
    bloodline.dominantTrait = bloodline.lineage[bloodline.lineage.length - 1].id;
  }
  saveBloodline(bloodline);
};

const getBloodline = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return { lineage: [], totalGenerations: 0 };
  return loadBloodline();
};

// ── 59번: 저주의 계보 ──
// 전생에서 받거나 건 강력한 저주가 이번 생에 변형되어 지속
// (CURSE_LINEAGE_KEY, loadCurseLineage, saveCurseLineage, clearCurseLineage 위에서 이미 선언됨)

const CURSE_TYPES = [
  { id:"eternal_thirst",  icon:"💧", label:"영원한 갈증 저주",  effect:"특정 자원이 끊임없이 줄어드는 감각. 단, 결핍을 극복할 때마다 강해진다.",         debuff:"매 30턴 MP -5", hiddenBonus:"저주 극복 시 WIL +10 영구 부여" },
  { id:"haunted_shadow",  icon:"👥", label:"그림자 저주",        effect:"전생에 해친 자의 그림자가 따라다닌다. 단, 그림자는 때로 경고를 준다.",         debuff:"어두운 장소에서 판정 -10", hiddenBonus:"매복·암습 사전 경고 (1회/시나리오)" },
  { id:"marked_by_death", icon:"💀", label:"죽음의 낙인 저주",   effect:"죽음 관련 이벤트에 더 자주 연루된다. 단, 죽음을 마주할수록 담대해진다.",       debuff:"사망 관련 이벤트 빈도 상승", hiddenBonus:"END +15, 공포 면역 누적" },
  { id:"broken_tongue",   icon:"🔇", label:"언어 저주",          effect:"특정 진실을 말할 수 없다. 단, 행동으로 보여줄 때 더 강한 설득력이 생긴다.",    debuff:"특정 정보 공유 제한", hiddenBonus:"비언어 설득 판정 +20" },
  { id:"timelock",        icon:"⏳", label:"시간 봉인 저주",     effect:"특정 시간대에 행동 불능. 단, 그 시간에 명상하면 강력한 통찰을 얻는다.",         debuff:"특정 시간 행동 제한", hiddenBonus:"직관 판정 +15, 예언 이벤트 해금" },
];

const recordCurseLineage = (curseType, curseSource, scenario) => {
  if (!curseType) return;
  const curses = loadCurseLineage();
  const cdef = CURSE_TYPES.find(c => c.id === curseType);
  if (!cdef) return;
  const existing = curses.find(c => c.id === curseType);
  if (existing) {
    existing.depth = Math.min(5, (existing.depth || 1) + 1);
    existing.partiallyOvercome = existing.depth >= 3;
  } else {
    curses.push({ ...cdef, curseSource: curseSource || "알 수 없는 저주", depth: 1, partiallyOvercome: false, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  if (curses.length > 3) curses.sort((a,b) => b.depth - a.depth).splice(3);
  saveCurseLineage(curses);
};

const getCurseLineage = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadCurseLineage();
};

// ── 60번: 세계의 기억 ──
// 수많은 회차를 거친 영혼이 세계 자체에 각인되어 이번 생에 세계가 플레이어를 '기억'하는 현상
// (세계수·전생의 일출과 연계, 회차 누적의 최종 결실 시스템)
const WORLD_MEMORY_KEY  = "taleforge-world-memory";
const loadWorldMemory   = () => { const r = lsGet(WORLD_MEMORY_KEY); return r ? JSON.parse(r) : { echoes: 0, stage: 0, phenomena: [], totalCycles: 0 }; };
const saveWorldMemory   = (w) => lsSet(WORLD_MEMORY_KEY, JSON.stringify(w));
// 60번 시스템도 세계수·전생의 일출과 함께 clearAll에 포함시키지 않음 (영구 누적)

const WORLD_MEMORY_STAGES = [
  { stage:0, label:"무관심한 세계",     icon:"🌍", color:"#2c3e50", desc:"세계는 아직 이 영혼을 모른다.",                                  phenomenon:null },
  { stage:1, label:"어렴풋한 기억",     icon:"🌫️", color:"#34495e", desc:"세계 어딘가에서 모르는 사람이 당신에게 친근감을 느낀다.",        phenomenon:"낯선 NPC가 처음 만남에도 반갑게 인사한다." },
  { stage:2, label:"세계의 속삭임",     icon:"🌐", color:"#1a5276", desc:"자연과 사물이 당신에게 신호를 보내기 시작한다.",                  phenomenon:"탐색 판정 없이 숨겨진 물건이 저절로 눈에 띈다." },
  { stage:3, label:"전설의 공명",       icon:"✨", color:"#154360", desc:"세계 전역에서 당신의 귀환을 감지한다. 전설이 살아 돌아왔다.",     phenomenon:"영웅 관련 NPC가 자발적으로 조력을 요청한다." },
  { stage:4, label:"세계의 각인",       icon:"🌟", color:"#1b4f72", desc:"세계 자체가 당신의 존재를 기록한다. 세계가 당신 편이다.",         phenomenon:"위기 시 환경(날씨·지형)이 유리하게 변한다." },
  { stage:5, label:"세계와의 합일",     icon:"🌈", color:"#17202a", desc:"영혼과 세계가 하나가 되었다. 이 세계에서 당신은 전설 그 자체다.", phenomenon:"모든 생명체가 당신을 전설로 인식. 최종 엔딩 해금." },
];

const WORLD_MEMORY_PHENOMENA = [
  { id:"deja_vu_place",  icon:"🏛️", label:"장소의 기시감",  desc:"처음 방문하는 장소인데 모든 구조를 알고 있다.",                 bonus:"해당 장소 함정·비밀 자동 파악" },
  { id:"deja_vu_person", icon:"👤", label:"인물의 기시감",   desc:"처음 보는 얼굴인데 영혼 깊이에서 알고 있다는 느낌.",            bonus:"해당 NPC의 진심·의도 자동 파악 가능" },
  { id:"world_whisper",  icon:"🌬️", label:"세계의 속삭임",  desc:"바람 소리, 물소리에서 경고나 힌트가 들려온다.",                 bonus:"다음 이벤트 분기 예고 (1회/시나리오)" },
  { id:"fate_pull",      icon:"🧲", label:"운명의 끌어당김", desc:"특정 장소나 NPC에게 이유 없이 이끌린다. 그곳에 열쇠가 있다.",  bonus:"핵심 퀘스트 오브젝트 자동 발견" },
  { id:"memory_flash",   icon:"⚡", label:"기억 섬광",        desc:"위기 순간 전생의 해결책이 번개처럼 떠오른다.",                  bonus:"위기 판정 1회 자동 대성공 전환" },
];

const growWorldMemory = (cycleScore, totalCycles) => {
  const wm = loadWorldMemory();
  wm.totalCycles = totalCycles || (wm.totalCycles || 0) + 1;
  const gain = cycleScore >= 80 ? 4 : cycleScore >= 60 ? 3 : cycleScore >= 40 ? 2 : 1;
  wm.echoes = (wm.echoes || 0) + gain;
  const newStage = Math.min(5, Math.floor(wm.echoes / 5));
  const didLevelUp = newStage > (wm.stage || 0);
  wm.stage = newStage;

  // 새 현상 추가
  if (wm.echoes % 3 === 0) {
    wm.phenomena = wm.phenomena || [];
    const nextPhenomenon = WORLD_MEMORY_PHENOMENA[wm.phenomena.length % WORLD_MEMORY_PHENOMENA.length];
    if (!wm.phenomena.some(p => p.id === nextPhenomenon.id)) {
      wm.phenomena.push({ ...nextPhenomenon, unlockedAt: new Date().toISOString() });
    }
  }

  saveWorldMemory(wm);
  return { stage: newStage, didLevelUp, stageData: WORLD_MEMORY_STAGES[newStage], echoes: wm.echoes };
};

const getWorldMemoryStatus = () => {
  const wm = loadWorldMemory();
  const stage = wm.stage || 0;
  return { ...wm, stageData: WORLD_MEMORY_STAGES[stage], phenomena: wm.phenomena || [] };
};


// ══════════════════════════════════════════════════════════════
// 51~70번 환생 누적 시스템
// ══════════════════════════════════════════════════════════════

// ── 51번: 별자리 운세 ──
// 전생 사망 날짜 기반으로 이번 생의 별자리 결정. 별자리마다 보너스/패널티
const STAR_SIGN_KEY   = "taleforge-star-sign";
const loadStarSign    = () => { const r = lsGet(STAR_SIGN_KEY); return r ? JSON.parse(r) : null; };
const saveStarSign    = (s) => lsSet(STAR_SIGN_KEY, JSON.stringify(s));
const clearStarSign   = () => lsDel(STAR_SIGN_KEY);

const STAR_SIGNS = [
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

const assignStarSign = (deathMonth) => {
  const month = deathMonth !== undefined ? deathMonth : new Date().getMonth();
  const idx = month % STAR_SIGNS.length;
  const sign = STAR_SIGNS[idx];
  saveStarSign({ ...sign, assignedAt: new Date().toISOString() });
  return sign;
};

const getStarSign = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadStarSign();
};

// ── 52번: 전생어 ──
// 고회차 전용 숨겨진 언어. 특정 NPC에게 전생어로 말 걸면 히든 퀘스트 발동
const PAST_LANGUAGE_KEY  = "taleforge-past-language";
const loadPastLanguage   = () => { const r = lsGet(PAST_LANGUAGE_KEY); return r ? JSON.parse(r) : { level: 0, phrases: [], unlockedAt: null }; };
const savePastLanguage   = (l) => lsSet(PAST_LANGUAGE_KEY, JSON.stringify(l));
const clearPastLanguage  = () => lsDel(PAST_LANGUAGE_KEY);

const PAST_LANGUAGE_PHRASES = [
  { level:3,  phrase:"아노스 티르",   meaning:"나는 이곳을 안다",       trigger:"고대 유적·신전 NPC에게 사용 시 히든 퀘스트" },
  { level:4,  phrase:"멜리아 소론",   meaning:"우리는 이전에 만났다",   trigger:"전생 인연 NPC 조우 시 기억 각성" },
  { level:5,  phrase:"카이로스 엔드", meaning:"시간은 반복된다",         trigger:"시간 관련 보스·이벤트에서 사용 시 약점 노출" },
  { level:6,  phrase:"에테르 나시온", meaning:"나는 환생자다",           trigger:"루프 자각자 길드 입장 코드" },
  { level:7,  phrase:"오메가 리툼",   meaning:"세계의 끝을 보았다",      trigger:"최종 보스에게 사용 시 특수 대화 루트" },
  { level:8,  phrase:"아크 디비누스", meaning:"신은 거짓이다",           trigger:"신화 세계관 시나리오 히든 루트 해금" },
  { level:9,  phrase:"레비 아스칼",   meaning:"나는 모든 것을 기억한다", trigger:"무한 회귀 자각 이벤트 트리거" },
  { level:10, phrase:"솔 이터니움",   meaning:"영원한 영혼",             trigger:"해탈 엔딩 루트 해금 키" },
];

const growPastLanguage = (cycle) => {
  const lang = loadPastLanguage();
  const newLevel = Math.min(10, Math.floor(cycle / 2));
  if (newLevel > (lang.level || 0)) {
    lang.level = newLevel;
    lang.unlockedAt = new Date().toISOString();
    const newPhrases = PAST_LANGUAGE_PHRASES.filter(p => p.level <= newLevel);
    lang.phrases = newPhrases;
    savePastLanguage(lang);
  }
  return lang;
};

const getPastLanguage = () => {
  const cycle = loadCycleCount();
  if (cycle < 3) return null;
  return loadPastLanguage();
};

// ── 53번: 가면 시스템 ──
// 전생에서 사용한 위장 신분들이 저장. 다음 회차에서 즉시 꺼내 쓸 수 있는 완성된 신분
const IDENTITY_VAULT_KEY  = "taleforge-identity-vault";
const loadIdentityVault   = () => { const r = lsGet(IDENTITY_VAULT_KEY); return r ? JSON.parse(r) : []; };
const saveIdentityVault   = (v) => lsSet(IDENTITY_VAULT_KEY, JSON.stringify(v));
const clearIdentityVault  = () => lsDel(IDENTITY_VAULT_KEY);

const IDENTITY_ARCHETYPES = [
  { id:"noble",      icon:"👑", label:"귀족 신분",   desc:"상류층 접근 가능, 의심 없이 성·저택 출입",   bonus:"사교 판정 +20, 귀족 NPC 초기 호감" },
  { id:"merchant",   icon:"💰", label:"상인 신분",   desc:"시장·항구 자유 접근, 거래 시 유리한 위치",   bonus:"거래 판정 +15, 정보 구매 할인" },
  { id:"scholar",    icon:"📚", label:"학자 신분",   desc:"도서관·마법탑 접근, 고대 문헌 열람 권한",    bonus:"지식 판정 +15, 비밀 문서 접근" },
  { id:"soldier",    icon:"⚔️", label:"병사 신분",   desc:"군사 시설 접근, 무기 소지 합법화",           bonus:"군사 NPC 협력, 순찰 무시" },
  { id:"priest",     icon:"⛪", label:"사제 신분",   desc:"신전·성소 접근, 일반인 신뢰 자동 획득",      bonus:"치유 관련 판정 +10, 악령 퇴치 권한" },
  { id:"assassin",   icon:"🗡️", label:"암살자 신분", desc:"지하세계 접근, 정보 브로커와 연결",          bonus:"은신 판정 +15, 킬 의뢰 수락" },
  { id:"wanderer",   icon:"🌍", label:"방랑자 신분", desc:"어느 세력에도 속하지 않음. 자유로운 이동",   bonus:"이동 판정 +10, 중립 지역 어디서나 환영" },
  { id:"bard",       icon:"🎵", label:"음유시인 신분", desc:"각지 소문 수집, 공연으로 NPC 주의 분산",   bonus:"정보 수집 +15, 군중 매혹 판정" },
];

const recordIdentity = (identityType, alias, scenario) => {
  if (!identityType) return;
  const vault = loadIdentityVault();
  const archetype = IDENTITY_ARCHETYPES.find(a => a.id === identityType);
  if (!archetype) return;
  const existing = vault.find(v => v.id === identityType);
  if (existing) {
    existing.useCount = (existing.useCount || 1) + 1;
    existing.polished = existing.useCount >= 3; // 3회 사용 시 "완성된 신분"
  } else {
    vault.push({ ...archetype, alias: alias || archetype.label, useCount: 1, polished: false, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  if (vault.length > 8) vault.sort((a,b) => b.useCount - a.useCount).splice(8);
  saveIdentityVault(vault);
};

const getIdentityVault = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadIdentityVault();
};

// ── 54번: 차원 균열 ──
// 고회차에서만 등장. 다른 시나리오 세계가 잠깐 겹치며 이계 NPC·아이템 등장
const RIFT_KEY   = "taleforge-dimensional-rift";
const loadRifts  = () => { const r = lsGet(RIFT_KEY); return r ? JSON.parse(r) : { totalRifts: 0, encounters: [] }; };
const saveRifts  = (r) => lsSet(RIFT_KEY, JSON.stringify(r));
const clearRifts = () => lsDel(RIFT_KEY);

const RIFT_SCENARIOS = [
  { id:"cyberpunk_bleed",  icon:"🌆", label:"사이버펑크 균열",  desc:"홀로그램 광고와 드론이 잠깐 겹쳐 보인다.",       loot:"사이버 부품 / AI 코어",     npc:"데이터 브로커" },
  { id:"medieval_bleed",   icon:"🏰", label:"중세 균열",        desc:"기사와 성벽의 잔상이 현재 세계에 투영된다.",     loot:"마법 검 파편 / 고대 문서",  npc:"방랑 기사" },
  { id:"apocalypse_bleed", icon:"☢️", label:"종말 균열",        desc:"폐허와 먼지 냄새가 잠깐 공기를 물든다.",         loot:"생존 키트 / 변이 혈청",     npc:"생존자 전사" },
  { id:"fantasy_bleed",    icon:"🧙", label:"마법 세계 균열",   desc:"정령의 노래와 마법진 잔광이 희미하게 보인다.",   loot:"마법석 / 희귀 약초",        npc:"떠도는 마법사" },
  { id:"mythology_bleed",  icon:"⚡", label:"신화 세계 균열",   desc:"신들의 언어가 바람에 섞여 들려온다.",             loot:"신의 유물 파편 / 암브로시아", npc:"신의 전령" },
  { id:"void_bleed",       icon:"🌌", label:"허공 균열",        desc:"완전한 어둠 속에서 형언할 수 없는 존재의 숨결.", loot:"허공의 결정 / 봉인 문양",   npc:"공허의 감시자" },
];

const recordRiftEncounter = (scenarioId, cycle) => {
  const rifts = loadRifts();
  rifts.totalRifts = (rifts.totalRifts || 0) + 1;
  const scenario = RIFT_SCENARIOS.find(s => s.id === scenarioId) || RIFT_SCENARIOS[rifts.totalRifts % RIFT_SCENARIOS.length];
  rifts.encounters = rifts.encounters || [];
  rifts.encounters.push({ ...scenario, cycle: cycle || loadCycleCount(), encounteredAt: new Date().toISOString() });
  if (rifts.encounters.length > 10) rifts.encounters.splice(0, rifts.encounters.length - 10);
  saveRifts(rifts);
};

const getRiftStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 5) return null; // 5회차 이상에서만 등장
  const rifts = loadRifts();
  const nextRift = RIFT_SCENARIOS[rifts.totalRifts % RIFT_SCENARIOS.length];
  return { ...rifts, nextRift, available: cycle >= 5 };
};

// ── 55번: 연금술 누적 ──
// 전생에서 발견한 제조법이 레시피북에 누적. 고회차엔 희귀 아이템 제조 가능
const RECIPE_BOOK_KEY  = "taleforge-recipe-book";
const loadRecipeBook   = () => { const r = lsGet(RECIPE_BOOK_KEY); return r ? JSON.parse(r) : []; };
const saveRecipeBook   = (b) => lsSet(RECIPE_BOOK_KEY, JSON.stringify(b));
const clearRecipeBook  = () => lsDel(RECIPE_BOOK_KEY);

const RECIPE_TIERS = [
  { tier:1, icon:"🧪", label:"일반 제조법",   minCycle:1,  recipes:["체력 포션","해독제","횃불","식량 압축","기초 독약"] },
  { tier:2, icon:"⚗️", label:"고급 제조법",   minCycle:3,  recipes:["강화 포션","원소 탄환","마법 잉크","식물 촉진제","방어 부적"] },
  { tier:3, icon:"🔮", label:"희귀 제조법",   minCycle:5,  recipes:["엘릭서","환영 폭탄","영혼 결정 조각","시간 지연 약","정신 강화제"] },
  { tier:4, icon:"💎", label:"전설 제조법",   minCycle:8,  recipes:["불사의 약초","차원 절단기","운명 변환제","신의 분노 결정","기억 결정"] },
  { tier:5, icon:"🌟", label:"신화 제조법",   minCycle:12, recipes:["세계 종말 억제제","영혼 부활약","시간 역행 촉매","신격화 엘릭서","공허 봉인재"] },
];

const updateRecipeBook = (cycle) => {
  const book = loadRecipeBook();
  const newTiers = RECIPE_TIERS.filter(t => t.minCycle <= cycle && !book.find(b => b.tier === t.tier));
  newTiers.forEach(t => book.push({ ...t, unlockedAt: new Date().toISOString(), discoveredCycle: cycle }));
  saveRecipeBook(book);
  return book;
};

const getRecipeBook = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadRecipeBook();
};

// ── 56번: 전생 목표 달성률 ──
// 전생 퀘스트 달성률 % 기록. 높으면 다음 회차 시작 보너스, 낮으면 패널티
const ACHIEVEMENT_RATE_KEY  = "taleforge-achievement-rate";
const loadAchievementRates  = () => { const r = lsGet(ACHIEVEMENT_RATE_KEY); return r ? JSON.parse(r) : []; };
const saveAchievementRates  = (a) => lsSet(ACHIEVEMENT_RATE_KEY, JSON.stringify(a));
const clearAchievementRates = () => lsDel(ACHIEVEMENT_RATE_KEY);

const getAchievementBonus = (rate) => {
  if (rate >= 90) return { icon:"🏆", label:"완전 달성",     bonus:"다음 회차 시작 스탯 +5 전체, 골드 +200",    penalty:null };
  if (rate >= 70) return { icon:"⭐", label:"우수 달성",     bonus:"다음 회차 시작 스탯 +3 전체",               penalty:null };
  if (rate >= 50) return { icon:"✅", label:"보통 달성",     bonus:"다음 회차 시작 스탯 +1 전체",               penalty:null };
  if (rate >= 30) return { icon:"⚠️", label:"부진 달성",    bonus:null,                                        penalty:"다음 회차 시작 스탯 -2 전체" };
  return           { icon:"💀", label:"실패",             bonus:null,                                        penalty:"다음 회차 시작 스탯 -5, NPC 신뢰도 하락" };
};

const recordAchievementRate = (rate, scenario) => {
  const rates = loadAchievementRates();
  rates.push({ rate: Math.round(rate), scenario: scenario || "", recordedAt: new Date().toISOString(), bonus: getAchievementBonus(rate) });
  if (rates.length > 20) rates.splice(0, rates.length - 20);
  saveAchievementRates(rates);
};

const getLastAchievementBonus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const rates = loadAchievementRates();
  if (!rates.length) return null;
  const last = rates[rates.length - 1];
  return { ...last, ...getAchievementBonus(last.rate) };
};

// ── 57번: 인연의 꽃 ──
// 전생에서 로맨스 플래그 NPC가 다음 회차에 운명적으로 재등장. 관계에 따라 첫 만남 반응 다름
const ROMANCE_LEGACY_KEY  = "taleforge-romance-legacy";
const loadRomanceLegacy   = () => { const r = lsGet(ROMANCE_LEGACY_KEY); return r ? JSON.parse(r) : []; };
const saveRomanceLegacy   = (l) => lsSet(ROMANCE_LEGACY_KEY, JSON.stringify(l));
const clearRomanceLegacy  = () => lsDel(ROMANCE_LEGACY_KEY);

const ROMANCE_FATES = [
  { depth:1, icon:"🌸", label:"설렘",       firstMeet:"처음 만나는데도 어딘가 편안한 느낌을 받는다.",                bond:15 },
  { depth:2, icon:"💐", label:"인연",       firstMeet:"눈이 마주치는 순간, 심장이 이상하게 뛴다.",                    bond:25 },
  { depth:3, icon:"💕", label:"깊은 인연",  firstMeet:"\"어디선가 당신을 본 것 같아요\"라고 말을 건넨다.",             bond:40 },
  { depth:4, icon:"💞", label:"운명",       firstMeet:"이 사람과 함께라면 무엇이든 할 수 있다는 확신이 든다.",         bond:55 },
  { depth:5, icon:"💖", label:"영원한 인연", firstMeet:"서로가 서로를 알아본다. 말 없이도 모든 게 전달된다.",          bond:70 },
];

const recordRomanceLegacy = (npcName, depth, scenario) => {
  if (!npcName || depth < 1) return;
  const legacy = loadRomanceLegacy();
  const existing = legacy.find(l => l.npcName === npcName);
  if (existing) {
    existing.depth = Math.min(5, (existing.depth || 1) + 1);
    existing.encounters = (existing.encounters || 1) + 1;
  } else {
    const fate = ROMANCE_FATES[Math.min(4, Math.max(0, depth - 1))];
    legacy.push({ npcName, depth: Math.min(5, depth), encounters: 1, scenario: scenario || "", fate, recordedAt: new Date().toISOString() });
  }
  if (legacy.length > 5) legacy.sort((a,b) => b.depth - a.depth).splice(5);
  saveRomanceLegacy(legacy);
};

const getRomanceLegacy = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadRomanceLegacy().map(l => ({ ...l, fate: ROMANCE_FATES[Math.min(4, (l.depth||1) - 1)] }));
};

// ── 58번: 사냥 기록 ──
// 처치한 몬스터 도감 누적. 완성도에 따라 해당 몬스터 약점 정보 미리 공개
const BESTIARY_KEY  = "taleforge-bestiary";
const loadBestiary  = () => { const r = lsGet(BESTIARY_KEY); return r ? JSON.parse(r) : {}; };
const saveBestiary  = (b) => lsSet(BESTIARY_KEY, JSON.stringify(b));
const clearBestiary = () => lsDel(BESTIARY_KEY);

const getBestiaryInsight = (killCount) => {
  if (killCount >= 20) return { level:"전문가", icon:"💀", desc:"이 몬스터의 모든 약점과 패턴을 꿰뚫고 있다.", bonus:"해당 몬스터 전투 판정 +25" };
  if (killCount >= 10) return { level:"숙련",   icon:"⚔️", desc:"주요 약점을 파악하고 있다.",                   bonus:"해당 몬스터 전투 판정 +15" };
  if (killCount >= 5)  return { level:"익숙",   icon:"🗡️", desc:"기본 패턴 정도는 알고 있다.",                 bonus:"해당 몬스터 전투 판정 +8" };
  if (killCount >= 2)  return { level:"경험",   icon:"👁️", desc:"이 몬스터를 본 적이 있다.",                   bonus:"기습 피해 확률 감소" };
  return                       { level:"초면",   icon:"❓", desc:"처음 보는 몬스터다.",                         bonus:"없음" };
};

const recordMonsterKill = (monsterName, monsterType) => {
  if (!monsterName) return;
  const bestiary = loadBestiary();
  if (!bestiary[monsterName]) {
    bestiary[monsterName] = { name: monsterName, type: monsterType || "일반", killCount: 0, firstKill: new Date().toISOString() };
  }
  bestiary[monsterName].killCount = (bestiary[monsterName].killCount || 0) + 1;
  bestiary[monsterName].lastKill = new Date().toISOString();
  saveBestiary(bestiary);
};

const getBestiaryStatus = (monsterName) => {
  if (!monsterName) return null;
  const bestiary = loadBestiary();
  const entry = bestiary[monsterName];
  if (!entry) return { name: monsterName, killCount: 0, insight: getBestiaryInsight(0) };
  return { ...entry, insight: getBestiaryInsight(entry.killCount) };
};

const getFullBestiary = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return {};
  const bestiary = loadBestiary();
  const total = Object.keys(bestiary).length;
  const totalKills = Object.values(bestiary).reduce((sum, e) => sum + (e.killCount || 0), 0);
  return { entries: bestiary, total, totalKills, completionBonus: total >= 20 ? "도감 완성: 모든 몬스터 전투 판정 +5" : null };
};

// ── 59번: 전생 기억 상인 ──
// 고회차에만 등장하는 특수 NPC. 전생 기억을 힌트로 주는 신비한 상인
const MEMORY_MERCHANT_KEY  = "taleforge-memory-merchant";
const loadMemoryMerchant   = () => { const r = lsGet(MEMORY_MERCHANT_KEY); return r ? JSON.parse(r) : { visits: 0, purchasedHints: [] }; };
const saveMemoryMerchant   = (m) => lsSet(MEMORY_MERCHANT_KEY, JSON.stringify(m));
const clearMemoryMerchant  = () => lsDel(MEMORY_MERCHANT_KEY);

const MERCHANT_HINTS = [
  { id:"trap_location",   icon:"⚠️", label:"함정 위치 힌트",     cost:"기억 파편 1개",   desc:"이번 시나리오 주요 함정 위치를 알려준다." },
  { id:"boss_weakness",   icon:"⚔️", label:"보스 약점 힌트",     cost:"기억 파편 2개",   desc:"현재 최종 보스의 핵심 약점을 알려준다." },
  { id:"npc_secret",      icon:"🗝️", label:"NPC 비밀",          cost:"기억 파편 1개",   desc:"주요 NPC의 숨겨진 정체나 동기를 알려준다." },
  { id:"hidden_path",     icon:"🗺️", label:"숨겨진 길",          cost:"기억 파편 1개",   desc:"일반 탐색으로는 찾기 어려운 지름길을 알려준다." },
  { id:"item_location",   icon:"💎", label:"희귀 아이템 위치",   cost:"기억 파편 2개",   desc:"이번 회차 숨겨진 레어 아이템 위치를 알려준다." },
  { id:"fate_preview",    icon:"🔮", label:"운명의 미리보기",    cost:"기억 파편 3개",   desc:"이번 회차 중요 분기점 중 하나를 미리 알려준다." },
  { id:"ending_hint",     icon:"🌟", label:"엔딩 힌트",          cost:"기억 파편 4개",   desc:"히든 엔딩 조건 중 하나를 알려준다." },
];

const visitMemoryMerchant = (purchasedHintId) => {
  const merchant = loadMemoryMerchant();
  merchant.visits = (merchant.visits || 0) + 1;
  merchant.lastVisit = new Date().toISOString();
  if (purchasedHintId && !merchant.purchasedHints.includes(purchasedHintId)) {
    merchant.purchasedHints.push(purchasedHintId);
  }
  saveMemoryMerchant(merchant);
  return merchant;
};

const getMemoryMerchantStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 4) return null; // 4회차부터 등장
  const merchant = loadMemoryMerchant();
  return { ...merchant, availableHints: MERCHANT_HINTS, appears: cycle >= 4 };
};

// ── 60번: 시간 역행 토큰 ──
// 특정 조건 달성 시 획득. 이번 회차 안에서 최대 3턴 되돌리기 가능
const TIME_TOKEN_KEY  = "taleforge-time-token";
const loadTimeTokens  = () => { const r = lsGet(TIME_TOKEN_KEY); return r ? JSON.parse(r) : { tokens: 0, used: 0, totalEarned: 0 }; };
const saveTimeTokens  = (t) => lsSet(TIME_TOKEN_KEY, JSON.stringify(t));
const clearTimeTokens = () => lsDel(TIME_TOKEN_KEY);

const TIME_TOKEN_CONDITIONS = [
  { id:"perfect_escape",  label:"기적의 탈출",      desc:"절체절명의 순간을 극적으로 돌파 시" },
  { id:"tragic_sacrifice", label:"비극적 희생",     desc:"소중한 NPC를 잃는 비극적 순간에" },
  { id:"legendary_act",   label:"전설적 행동",      desc:"세계사에 남을 위업을 달성 시" },
  { id:"cycle_milestone", label:"회차 마일스톤",    desc:"특정 회차(5, 10, 20...) 도달 시 자동 지급" },
];

const earnTimeToken = (conditionId) => {
  const tokens = loadTimeTokens();
  if ((tokens.tokens || 0) >= 3) return false; // 최대 3개
  tokens.tokens = (tokens.tokens || 0) + 1;
  tokens.totalEarned = (tokens.totalEarned || 0) + 1;
  tokens.lastEarned = { conditionId, earnedAt: new Date().toISOString() };
  saveTimeTokens(tokens);
  return true;
};

const useTimeToken = () => {
  const tokens = loadTimeTokens();
  if ((tokens.tokens || 0) <= 0) return false;
  tokens.tokens -= 1;
  tokens.used = (tokens.used || 0) + 1;
  tokens.lastUsed = new Date().toISOString();
  saveTimeTokens(tokens);
  return true;
};

const resetTimeTokens = () => {
  // 새 회차 시작 시 미사용 토큰 초기화 (사용한 토큰 기록은 유지)
  const tokens = loadTimeTokens();
  tokens.tokens = 0;
  saveTimeTokens(tokens);
};

const getTimeTokenStatus = () => {
  return loadTimeTokens();
};

// ── 61번: 전생 동료의 유지 ──
// 전생에서 살아남은 동료 NPC가 다음 회차에 "낯익은 이방인"으로 등장
const SURVIVOR_COMPANIONS_KEY  = "taleforge-survivor-companions";
const loadSurvivorCompanions   = () => { const r = lsGet(SURVIVOR_COMPANIONS_KEY); return r ? JSON.parse(r) : []; };
const saveSurvivorCompanions   = (c) => lsSet(SURVIVOR_COMPANIONS_KEY, JSON.stringify(c));
const clearSurvivorCompanions  = () => lsDel(SURVIVOR_COMPANIONS_KEY);

const COMPANION_MEMORY_STAGES = [
  { stage:0, label:"낯익은 이방인",   firstMeet:"처음 보는 사람인데, 어딘가 낯이 익다.",                           bond:10 },
  { stage:1, label:"기억의 조각",     firstMeet:"당신을 보자 손을 떠는 낯선 이. \"혹시... 아닌가요?\"",             bond:20 },
  { stage:2, label:"희미한 각성",     firstMeet:"\"당신을 어딘가서 본 것 같아요. 꿈에서?\" 눈빛이 흔들린다.",       bond:35 },
  { stage:3, label:"강한 각성",       firstMeet:"\"...기억나요. 당신이잖아요. 다시 만났네요.\" 눈물이 고인다.",      bond:55 },
  { stage:4, label:"완전한 기억 각성", firstMeet:"\"몇 번의 생을 건너도 결국 다시 만나는군요.\" 환하게 웃는다.",    bond:75 },
];

const recordSurvivorCompanion = (npcName, bond, survived, scenario) => {
  if (!npcName || !survived) return;
  const companions = loadSurvivorCompanions();
  const existing = companions.find(c => c.npcName === npcName);
  if (existing) {
    existing.encounters = (existing.encounters || 1) + 1;
    existing.stage = Math.min(4, (existing.stage || 0) + 1);
    existing.bond = Math.min(100, (existing.bond || bond) + 10);
  } else {
    companions.push({ npcName, bond: bond || 30, survived: true, encounters: 1, stage: 0, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  if (companions.length > 6) companions.sort((a,b) => b.bond - a.bond).splice(6);
  saveSurvivorCompanions(companions);
};

const getSurvivorCompanions = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadSurvivorCompanions().map(c => ({ ...c, memoryStage: COMPANION_MEMORY_STAGES[Math.min(4, c.stage || 0)] }));
};

// ── 62번: 불사 게이지 ──
// 죽을 뻔한 순간 버텨낼 때마다 누적. 가득 차면 즉사 무효 패시브 발동
const UNDYING_GAUGE_KEY  = "taleforge-undying-gauge";
const loadUndyingGauge   = () => { const r = lsGet(UNDYING_GAUGE_KEY); return r ? JSON.parse(r) : { gauge: 0, maxGauge: 10, passiveReady: false, passiveUsedThisCycle: false, totalNearDeaths: 0 }; };
const saveUndyingGauge   = (g) => lsSet(UNDYING_GAUGE_KEY, JSON.stringify(g));
const clearUndyingGauge  = () => lsDel(UNDYING_GAUGE_KEY);

const fillUndyingGauge = (amount) => {
  const g = loadUndyingGauge();
  g.gauge = Math.min(g.maxGauge || 10, (g.gauge || 0) + (amount || 1));
  g.totalNearDeaths = (g.totalNearDeaths || 0) + 1;
  g.passiveReady = g.gauge >= (g.maxGauge || 10);
  saveUndyingGauge(g);
  return g;
};

const triggerUndyingPassive = () => {
  const g = loadUndyingGauge();
  if (!g.passiveReady || g.passiveUsedThisCycle) return false;
  g.passiveUsedThisCycle = true;
  g.passiveReady = false;
  g.gauge = 0;
  saveUndyingGauge(g);
  return true; // 즉사 무효 발동
};

const resetUndyingGaugeCycle = () => {
  const g = loadUndyingGauge();
  g.passiveUsedThisCycle = false;
  // 게이지는 회차 간 유지 (누적)
  saveUndyingGauge(g);
};

const getUndyingGaugeStatus = () => loadUndyingGauge();

// ── 63번: 다국어 해금 ──
// 특정 종족·세력과 깊이 교류하면 해당 언어 습득. 다음 회차 전용 대화 선택지 해금
const LANGUAGE_UNLOCK_KEY  = "taleforge-languages";
const loadLanguages        = () => { const r = lsGet(LANGUAGE_UNLOCK_KEY); return r ? JSON.parse(r) : []; };
const saveLanguages        = (l) => lsSet(LANGUAGE_UNLOCK_KEY, JSON.stringify(l));
const clearLanguages       = () => lsDel(LANGUAGE_UNLOCK_KEY);

const LANGUAGE_DEFS = [
  { id:"elvish",    icon:"🌿", name:"엘프어",     race:"엘프",       minBond:30, bonus:"엘프 NPC와 깊은 대화, 숲·자연 관련 히든 정보" },
  { id:"dwarvish",  icon:"⚒️", name:"드워프어",   race:"드워프",     minBond:30, bonus:"드워프 장인과 특수 제작, 지하 지도 열람" },
  { id:"draconic",  icon:"🐉", name:"용어",       race:"드래곤혈",   minBond:40, bonus:"용족 NPC 교섭, 고대 마법 주문 발동" },
  { id:"celestial", icon:"✨", name:"천상어",     race:"신족",       minBond:50, bonus:"신의 전령과 대화, 성소 히든 의식 참여" },
  { id:"infernal",  icon:"🔥", name:"심연어",     race:"악마족",     minBond:40, bonus:"악마 계약 직접 협상, 금지 지식 열람" },
  { id:"ancient",   icon:"📜", name:"고대어",     race:"없음",       minBond:60, bonus:"고대 유적 비문 독해, 신급 마법 주문 해독" },
  { id:"beast",     icon:"🐾", name:"야수어",     race:"수인족",     minBond:25, bonus:"야생 동물 대화, 비공개 사냥터 안내" },
  { id:"void",      icon:"🌌", name:"공허어",     race:"공허존재",   minBond:70, bonus:"공허 차원 NPC 대화, 차원 균열 제어" },
];

const unlockLanguage = (languageId, bondLevel, scenario) => {
  if (!languageId) return;
  const langs = loadLanguages();
  const def = LANGUAGE_DEFS.find(l => l.id === languageId);
  if (!def || bondLevel < def.minBond) return;
  if (langs.find(l => l.id === languageId)) return; // 이미 해금
  langs.push({ ...def, bondLevel, scenario: scenario || "", unlockedAt: new Date().toISOString() });
  saveLanguages(langs);
};

const getUnlockedLanguages = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadLanguages();
};

// ── 64번: 음유시인 기록 ──
// 내 전생 이야기가 세계에 노래로 퍼짐. 고회차일수록 과장·왜곡된 형태로 NPC 입에 오름
const BARD_LEGEND_KEY  = "taleforge-bard-legend";
const loadBardLegend   = () => { const r = lsGet(BARD_LEGEND_KEY); return r ? JSON.parse(r) : { verses: [], fame: 0, distortionLevel: 0 }; };
const saveBardLegend   = (l) => lsSet(BARD_LEGEND_KEY, JSON.stringify(l));
const clearBardLegend  = () => lsDel(BARD_LEGEND_KEY);

const LEGEND_DISTORTION_LEVELS = [
  { level:0, label:"사실에 가까운 소문",   multiplier:1.0, desc:"비교적 정확한 이야기가 퍼진다." },
  { level:1, label:"약간 과장된 소문",     multiplier:1.3, desc:"공적이 조금 부풀려졌다." },
  { level:2, label:"꽤 과장된 전설",       multiplier:1.8, desc:"영웅적 행동이 신화처럼 묘사된다." },
  { level:3, label:"심하게 왜곡된 전설",   multiplier:2.5, desc:"실제와 다른 내용이 절반 이상을 차지한다." },
  { level:4, label:"완전히 신화화",        multiplier:4.0, desc:"당신은 이미 인간을 초월한 존재로 알려져 있다." },
];

const addBardVerse = (event, characterName, scenario) => {
  if (!event) return;
  const legend = loadBardLegend();
  legend.fame = (legend.fame || 0) + 10;
  legend.distortionLevel = Math.min(4, Math.floor((legend.fame || 0) / 30));
  legend.verses = legend.verses || [];
  const distortion = LEGEND_DISTORTION_LEVELS[legend.distortionLevel];
  legend.verses.push({ event, characterName: characterName || "전생의 영웅", scenario: scenario || "", distortion: distortion.label, addedAt: new Date().toISOString() });
  if (legend.verses.length > 10) legend.verses.splice(0, legend.verses.length - 10);
  saveBardLegend(legend);
};

const getBardLegendStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 2) return null;
  const legend = loadBardLegend();
  const distortion = LEGEND_DISTORTION_LEVELS[legend.distortionLevel || 0];
  return { ...legend, distortionData: distortion };
};

// ── 65번: 대미스터리 퍼즐 ──
// 시나리오 전체를 관통하는 미스터리. 회차마다 조각 1개씩 획득, 전부 모으면 세계의 진실 공개
const MYSTERY_PUZZLE_KEY  = "taleforge-mystery-puzzle";
const loadMysteryPuzzle   = () => { const r = lsGet(MYSTERY_PUZZLE_KEY); return r ? JSON.parse(r) : { pieces: [], totalPieces: 12, solved: false }; };
const saveMysteryPuzzle   = (p) => lsSet(MYSTERY_PUZZLE_KEY, JSON.stringify(p));
const clearMysteryPuzzle  = () => lsDel(MYSTERY_PUZZLE_KEY);

const MYSTERY_PIECES = [
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

const collectMysteryPiece = (cycle) => {
  const puzzle = loadMysteryPuzzle();
  const piece = MYSTERY_PIECES.find(p => p.revealAt === cycle && !puzzle.pieces.find(pp => pp.id === p.id));
  if (piece) {
    puzzle.pieces.push({ ...piece, collectedAt: new Date().toISOString(), cycle });
    puzzle.solved = puzzle.pieces.length >= puzzle.totalPieces;
    saveMysteryPuzzle(puzzle);
    return piece;
  }
  return null;
};

const getMysteryPuzzleStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const puzzle = loadMysteryPuzzle();
  return { ...puzzle, nextPiece: MYSTERY_PIECES.find(p => p.revealAt === cycle + 1) };
};

// ── 66번: 감시자의 시선 ──
// 고회차에서만 느껴지는 "누군가 나를 지켜본다" 이벤트. 정체 밝히면 메타 스토리 개막
const WATCHER_GAZE_KEY  = "taleforge-watcher-gaze";
const loadWatcherGaze   = () => { const r = lsGet(WATCHER_GAZE_KEY); return r ? JSON.parse(r) : { gazeCount: 0, revealed: false, stage: 0 }; };
const saveWatcherGaze   = (w) => lsSet(WATCHER_GAZE_KEY, JSON.stringify(w));
const clearWatcherGaze  = () => lsDel(WATCHER_GAZE_KEY);

const WATCHER_STAGES = [
  { stage:0, desc:"아직 아무것도 느끼지 못한다.",                       hint:null },
  { stage:1, desc:"때때로 누군가의 시선이 느껴진다.",                   hint:"고요한 순간, 등 뒤가 서늘해진다." },
  { stage:2, desc:"분명히 무언가가 나를 관찰하고 있다.",                 hint:"꿈 속에서 수많은 눈동자가 나를 바라본다." },
  { stage:3, desc:"그것이 나의 모든 회차를 지켜봐 왔다는 걸 안다.",     hint:"거울에 비친 내 눈이 잠깐 다른 색으로 빛난다." },
  { stage:4, desc:"그것의 정체를 거의 알 것 같다. 곧 만날 수 있다.",   hint:"세계의 끝 어딘가에서 목소리가 들린다. '이제 때가 되었다.'" },
  { stage:5, desc:"감시자의 정체가 밝혀졌다. 메타 스토리가 시작된다.",  hint:"모든 것이 연결된다." },
];

const progressWatcherGaze = (cycle) => {
  const gaze = loadWatcherGaze();
  if (cycle < 6) return null; // 6회차부터 시작
  const newStage = Math.min(5, Math.floor((cycle - 6) / 2));
  if (newStage > (gaze.stage || 0)) {
    gaze.stage = newStage;
    gaze.gazeCount = (gaze.gazeCount || 0) + 1;
    if (newStage >= 5) gaze.revealed = true;
    saveWatcherGaze(gaze);
  }
  return { ...gaze, stageData: WATCHER_STAGES[gaze.stage || 0] };
};

const getWatcherGazeStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 6) return null;
  const gaze = loadWatcherGaze();
  return { ...gaze, stageData: WATCHER_STAGES[gaze.stage || 0] };
};

// ── 67번: 운명 카드 ──
// 회차 시작 시 카드 3장 중 1장 선택. 이번 회차 전체 색깔 결정
const FATE_CARD_KEY  = "taleforge-fate-card";
const loadFateCard   = () => { const r = lsGet(FATE_CARD_KEY); return r ? JSON.parse(r) : null; };
const saveFateCard   = (c) => lsSet(FATE_CARD_KEY, JSON.stringify(c));
const clearFateCard  = () => lsDel(FATE_CARD_KEY);

const FATE_CARD_POOL = [
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

const drawFateCards = () => {
  const shuffled = [...FATE_CARD_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3); // 3장 중 1장 선택
};

const selectFateCard = (cardId) => {
  const card = FATE_CARD_POOL.find(c => c.id === cardId);
  if (!card) return null;
  saveFateCard({ ...card, selectedAt: new Date().toISOString(), cycle: loadCycleCount() });
  return card;
};

const getCurrentFateCard = () => {
  return loadFateCard();
};

const clearFateCardOnReincarnate = () => {
  clearFateCard(); // 새 회차 시 카드 초기화
};

// ── 68번: 전생 본거지 업그레이드 ──
// 회차마다 시설 하나씩 추가. 도서관·단련장·상점·치료소 등. 고회차엔 완전한 요새
const HIDEOUT_KEY  = "taleforge-hideout";
const loadHideout  = () => { const r = lsGet(HIDEOUT_KEY); return r ? JSON.parse(r) : { facilities: [], level: 0, totalUpgrades: 0 }; };
const saveHideout  = (h) => lsSet(HIDEOUT_KEY, JSON.stringify(h));
const clearHideout = () => lsDel(HIDEOUT_KEY);

const HIDEOUT_FACILITIES = [
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

const upgradeHideout = (cycle) => {
  const hideout = loadHideout();
  const newFacilities = HIDEOUT_FACILITIES.filter(f => f.unlockCycle <= cycle && !hideout.facilities.find(hf => hf.id === f.id));
  newFacilities.forEach(f => {
    hideout.facilities.push({ ...f, unlockedAt: new Date().toISOString(), unlockedCycle: cycle });
    hideout.totalUpgrades = (hideout.totalUpgrades || 0) + 1;
  });
  hideout.level = hideout.facilities.length;
  saveHideout(hideout);
  return { newFacilities, hideout };
};

const getHideoutStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const hideout = loadHideout();
  const nextFacility = HIDEOUT_FACILITIES.find(f => f.unlockCycle > cycle && !hideout.facilities.find(hf => hf.id === f.id));
  return { ...hideout, nextFacility };
};

// ── 69번: 악안(惡眼) ──
// 전생에서 너무 많이 죽인 캐릭터에게 각성. 상대 약점과 HP를 수치로 볼 수 있는 능력
const EVIL_EYE_KEY  = "taleforge-evil-eye";
const loadEvilEye   = () => { const r = lsGet(EVIL_EYE_KEY); return r ? JSON.parse(r) : { killCount: 0, awakened: false, level: 0 }; };
const saveEvilEye   = (e) => lsSet(EVIL_EYE_KEY, JSON.stringify(e));
const clearEvilEye  = () => lsDel(EVIL_EYE_KEY);

const EVIL_EYE_LEVELS = [
  { level:0, killsRequired:0,   label:"봉인됨",       ability:"없음",                                                desc:"아직 각성하지 않았다." },
  { level:1, killsRequired:10,  label:"미약한 악안",  ability:"상대 HP 대략 파악 (많음/보통/적음)",                  desc:"눈이 가끔 붉게 빛난다." },
  { level:2, killsRequired:25,  label:"성장하는 악안", ability:"상대 HP 퍼센트 파악, 주요 약점 1개 감지",            desc:"눈 흰자위에 핏줄이 선다." },
  { level:3, killsRequired:50,  label:"완성된 악안",  ability:"상대 HP 수치, 모든 약점, 다음 행동 패턴 예측",        desc:"한쪽 눈이 항상 붉다." },
  { level:4, killsRequired:100, label:"저주받은 악안", ability:"즉사 공격 조건 파악, 상대 운명까지 어렴풋이 감지",   desc:"두 눈 모두 깊은 붉은색. 보는 자들이 두려워한다." },
];

const recordEvilEyeKill = (count) => {
  const eye = loadEvilEye();
  eye.killCount = (eye.killCount || 0) + (count || 1);
  const newLevel = EVIL_EYE_LEVELS.reduce((acc, l) => eye.killCount >= l.killsRequired ? l.level : acc, 0);
  const didAwaken = newLevel > (eye.level || 0);
  eye.level = newLevel;
  eye.awakened = newLevel > 0;
  if (didAwaken) eye.awakenedAt = new Date().toISOString();
  saveEvilEye(eye);
  return { ...eye, levelData: EVIL_EYE_LEVELS[eye.level], didAwaken };
};

const getEvilEyeStatus = () => {
  const eye = loadEvilEye();
  return { ...eye, levelData: EVIL_EYE_LEVELS[eye.level || 0], nextLevel: EVIL_EYE_LEVELS[(eye.level || 0) + 1] || null };
};

// ── 70번: 달의 위상 ──
// 전생 사망 시점의 달 위상이 다음 회차에 영향. 보름달에 죽으면 늑대인간 이벤트 확률 상승
const MOON_PHASE_KEY  = "taleforge-moon-phase";
const loadMoonPhase   = () => { const r = lsGet(MOON_PHASE_KEY); return r ? JSON.parse(r) : null; };
const saveMoonPhase   = (m) => lsSet(MOON_PHASE_KEY, JSON.stringify(m));
const clearMoonPhase  = () => lsDel(MOON_PHASE_KEY);

const MOON_PHASES = [
  { id:"new",         icon:"🌑", name:"초승달 (삭)",  effect:"어둠 속 행동 +10, 은신·잠입 보너스",                specialEvent:"그림자 정령 출몰 확률 상승" },
  { id:"crescent",    icon:"🌒", name:"초생달",       effect:"새 시작 판정 +5, 첫 만남 NPC 반응 호의적",          specialEvent:"방랑자와의 특별 만남" },
  { id:"quarter1",    icon:"🌓", name:"상현달",       effect:"성장 판정 +8, 학습·훈련 효과 +20%",                 specialEvent:"스승 NPC 등장 확률 상승" },
  { id:"gibbous1",    icon:"🌔", name:"상현망간달",   effect:"전투력 성장 +10, 강해지는 느낌",                    specialEvent:"강적과의 조우 증가" },
  { id:"full",        icon:"🌕", name:"보름달",       effect:"모든 능력치 최고조, 하지만 야생의 기운 충만",       specialEvent:"늑대인간·야수 이벤트 확률 대폭 상승" },
  { id:"gibbous2",    icon:"🌖", name:"하현망간달",   effect:"직관 +10, 숨겨진 것들이 보인다",                    specialEvent:"비밀·음모 관련 이벤트 증가" },
  { id:"quarter2",    icon:"🌗", name:"하현달",       effect:"지혜 판정 +8, 과거 기억 접근성 향상",               specialEvent:"전생 기억 이벤트 발생률 상승" },
  { id:"crescent2",   icon:"🌘", name:"그믐달",       effect:"마지막 기회 판정 +15, 역전 가능성 증가",            specialEvent:"최후의 일전 이벤트 강화" },
];

const assignMoonPhase = (deathTimestamp) => {
  const date = deathTimestamp ? new Date(deathTimestamp) : new Date();
  const day = date.getDate();
  const phaseIdx = Math.floor((day / 30) * 8) % 8;
  const phase = MOON_PHASES[phaseIdx];
  saveMoonPhase({ ...phase, assignedAt: new Date().toISOString(), deathDay: day });
  return phase;
};

const getMoonPhase = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadMoonPhase();
};


// ══════════════════════════════════════════════════════════════
// 71~100번 환생 누적 시스템
// ══════════════════════════════════════════════════════════════

// ── 71번: 전생에서 보내는 편지 ──
// 전생 종료 시 다음 생의 자신에게 메모 작성. 다음 회차 특정 시점에 "오래된 편지"로 발견
const PAST_LETTER_KEY  = "taleforge-past-letter";
const loadPastLetters  = () => { const r = lsGet(PAST_LETTER_KEY); return r ? JSON.parse(r) : []; };
const savePastLetters  = (l) => lsSet(PAST_LETTER_KEY, JSON.stringify(l));
const clearPastLetters = () => lsDel(PAST_LETTER_KEY);

const recordPastLetter = (message, characterName, scenario, karmaScore) => {
  if (!message) return;
  const letters = loadPastLetters();
  const tone = karmaScore >= 80 ? "절박한" : karmaScore >= 60 ? "경고하는" : karmaScore <= 30 ? "따뜻한" : "담담한";
  letters.push({ message: message.slice(0, 200), characterName: characterName || "전생의 나", scenario: scenario || "", tone, writtenAt: new Date().toISOString() });
  if (letters.length > 10) letters.splice(0, letters.length - 10);
  savePastLetters(letters);
};

const getLatestLetter = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const letters = loadPastLetters();
  return letters.length > 0 ? letters[letters.length - 1] : null;
};

// ── 72번: 회차 하이라이트 컷씬 ──
// 전생 주요 선택들을 텍스트 컷씬으로 요약해 다음 회차 오프닝에 재생
const HIGHLIGHT_REEL_KEY  = "taleforge-highlight-reel";
const loadHighlightReel   = () => { const r = lsGet(HIGHLIGHT_REEL_KEY); return r ? JSON.parse(r) : []; };
const saveHighlightReel   = (h) => lsSet(HIGHLIGHT_REEL_KEY, JSON.stringify(h));
const clearHighlightReel  = () => lsDel(HIGHLIGHT_REEL_KEY);

const HIGHLIGHT_TYPES = [
  { id:"first_kill",     icon:"⚔️", label:"첫 번째 전투",     template:"${name}이(가) 처음으로 칼을 들었던 그 순간—" },
  { id:"betrayal",       icon:"🗡️", label:"배신의 순간",       template:"믿었던 자의 칼날이 등을 향하던 순간—" },
  { id:"sacrifice",      icon:"🌹", label:"희생의 선택",       template:"모든 것을 내려놓고 타인을 위해 몸을 던지던 순간—" },
  { id:"final_battle",   icon:"🔥", label:"최후의 전투",       template:"모든 것을 걸고 마지막 적과 맞섰던 그 순간—" },
  { id:"reunion",        icon:"💕", label:"재회의 순간",       template:"오랜 이별 끝에 다시 만났던 그 눈빛—" },
  { id:"revelation",     icon:"💡", label:"진실의 발견",       template:"감춰진 진실이 드러나 모든 것이 뒤바뀌던 순간—" },
  { id:"death",          icon:"💀", label:"죽음의 순간",       template:"마지막 숨을 내쉬며 눈을 감던 그 순간—" },
  { id:"victory",        icon:"🏆", label:"승리의 순간",       template:"불가능을 가능으로 만들었던 바로 그 순간—" },
];

const addHighlightReel = (type, characterName, scenario) => {
  if (!type) return;
  const reel = loadHighlightReel();
  const def = HIGHLIGHT_TYPES.find(h => h.id === type) || HIGHLIGHT_TYPES[reel.length % HIGHLIGHT_TYPES.length];
  reel.push({ ...def, characterName: characterName || "전생의 나", scenario: scenario || "", addedAt: new Date().toISOString() });
  if (reel.length > 8) reel.splice(0, reel.length - 8);
  saveHighlightReel(reel);
};

const getHighlightReel = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadHighlightReel();
};

// ── 73번: 나비 지수 ──
// 내 선택이 세계에 미친 영향력 수치. 높을수록 작은 행동도 큰 파장 — 카오스 모드
const BUTTERFLY_INDEX_KEY  = "taleforge-butterfly-index";
const loadButterflyIndex   = () => { const r = lsGet(BUTTERFLY_INDEX_KEY); return r ? JSON.parse(r) : { index: 0, chaosMode: false, impacts: [] }; };
const saveButterflyIndex   = (b) => lsSet(BUTTERFLY_INDEX_KEY, JSON.stringify(b));
const clearButterflyIndex  = () => lsDel(BUTTERFLY_INDEX_KEY);

const BUTTERFLY_STAGES = [
  { stage:0, range:[0,20],   label:"잔잔한 물결",   desc:"선택이 주변에 작은 파문을 만든다.",              chaosChance:0 },
  { stage:1, range:[21,40],  label:"퍼지는 파문",    desc:"하나의 선택이 예상치 못한 곳에서 반응을 낳는다.", chaosChance:10 },
  { stage:2, range:[41,60],  label:"연쇄 반응",      desc:"행동 하나가 연달아 여러 사건을 일으킨다.",        chaosChance:25 },
  { stage:3, range:[61,80],  label:"태풍의 눈",      desc:"당신의 존재 자체가 세계를 뒤흔든다.",             chaosChance:45 },
  { stage:4, range:[81,100], label:"카오스 모드",    desc:"작은 말 한마디가 역사를 바꾼다. 세계가 혼돈이다.", chaosChance:70 },
];

const growButterflyIndex = (impactScore) => {
  const bi = loadButterflyIndex();
  bi.index = Math.min(100, (bi.index || 0) + (impactScore || 5));
  bi.chaosMode = bi.index >= 81;
  const stage = BUTTERFLY_STAGES.find(s => bi.index >= s.range[0] && bi.index <= s.range[1]) || BUTTERFLY_STAGES[4];
  bi.impacts = bi.impacts || [];
  bi.impacts.push({ score: impactScore, total: bi.index, recordedAt: new Date().toISOString() });
  if (bi.impacts.length > 20) bi.impacts.splice(0, bi.impacts.length - 20);
  saveButterflyIndex(bi);
  return { ...bi, stageData: stage };
};

const getButterflyIndex = () => {
  const bi = loadButterflyIndex();
  const stage = BUTTERFLY_STAGES.find(s => (bi.index||0) >= s.range[0] && (bi.index||0) <= s.range[1]) || BUTTERFLY_STAGES[0];
  return { ...bi, stageData: stage };
};

// ── 74번: 고대 비문 해독 ──
// 회차마다 비문 한 줄씩 해독 가능. 전부 모으면 신급 스킬 해금
const INSCRIPTION_KEY  = "taleforge-inscription";
const loadInscription  = () => { const r = lsGet(INSCRIPTION_KEY); return r ? JSON.parse(r) : { lines: [], completed: false }; };
const saveInscription  = (i) => lsSet(INSCRIPTION_KEY, JSON.stringify(i));
const clearInscription = () => lsDel(INSCRIPTION_KEY);

const INSCRIPTION_LINES = [
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

const decipherInscriptionLine = (cycle) => {
  const ins = loadInscription();
  const lineIdx = (cycle - 1) % INSCRIPTION_LINES.length;
  const line = INSCRIPTION_LINES[lineIdx];
  if (!ins.lines.find(l => l.line === line.line)) {
    ins.lines.push({ ...line, decipheredAt: new Date().toISOString(), cycle });
    ins.completed = ins.lines.length >= INSCRIPTION_LINES.length;
    saveInscription(ins);
  }
  return { line, isNew: true, completed: ins.completed };
};

const getInscriptionStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const ins = loadInscription();
  return { ...ins, total: INSCRIPTION_LINES.length, progress: ins.lines.length };
};

// ── 75번: 윤회 등급 ──
// 총 회차·업적·엔딩 종류 종합해 등급 산정. 하급→중급→상급→신급→해탈
const REINCARNATION_RANK_KEY  = "taleforge-reincarnation-rank";
const loadRankData            = () => { const r = lsGet(REINCARNATION_RANK_KEY); return r ? JSON.parse(r) : { rank: 0, totalScore: 0, endingTypes: [] }; };
const saveRankData            = (d) => lsSet(REINCARNATION_RANK_KEY, JSON.stringify(d));
const clearRankData           = () => lsDel(REINCARNATION_RANK_KEY);

const REINCARNATION_RANKS = [
  { rank:0, icon:"🪨", label:"하급 윤회자",   minScore:0,   bonus:"없음",                                 desc:"이제 막 순환을 시작한 영혼." },
  { rank:1, icon:"🌿", label:"중급 윤회자",   minScore:50,  bonus:"시작 스탯 +3 전체",                    desc:"여러 생을 거쳐 성장한 영혼." },
  { rank:2, icon:"⭐", label:"상급 윤회자",   minScore:150, bonus:"시작 스탯 +5, 히든 선택지 추가",       desc:"세계가 인정하는 강한 영혼." },
  { rank:3, icon:"💎", label:"신급 윤회자",   minScore:300, bonus:"시작 스탯 +8, 신급 스킬 1개 해금",     desc:"신의 영역에 발을 들인 영혼." },
  { rank:4, icon:"🌈", label:"해탈",          minScore:500, bonus:"모든 제약 해제, 진 엔딩 루트 해금",   desc:"순환을 초월한 자유로운 영혼." },
];

const updateRank = (cycleCount, endingType, achievementCount) => {
  const data = loadRankData();
  const score = (cycleCount * 10) + (achievementCount * 5) + (endingType === "hero" ? 20 : endingType === "hidden" ? 30 : 10);
  data.totalScore = (data.totalScore || 0) + score;
  if (endingType && !data.endingTypes.includes(endingType)) data.endingTypes.push(endingType);
  const newRank = REINCARNATION_RANKS.reduce((acc, r) => data.totalScore >= r.minScore ? r.rank : acc, 0);
  const didRankUp = newRank > (data.rank || 0);
  data.rank = newRank;
  saveRankData(data);
  return { ...data, rankData: REINCARNATION_RANKS[data.rank], didRankUp };
};

const getRankStatus = () => {
  const data = loadRankData();
  return { ...data, rankData: REINCARNATION_RANKS[data.rank || 0], nextRank: REINCARNATION_RANKS[(data.rank || 0) + 1] || null };
};

// ── 76번: 벚꽃 엔딩 ──
// 모든 시나리오 최소 1회씩 클리어 + 특정 조건 달성 시에만 열리는 대단원 평화 엔딩
const SAKURA_ENDING_KEY  = "taleforge-sakura-ending";
const loadSakuraData     = () => { const r = lsGet(SAKURA_ENDING_KEY); return r ? JSON.parse(r) : { clearedScenarios: [], conditions: {}, unlocked: false }; };
const saveSakuraData     = (d) => lsSet(SAKURA_ENDING_KEY, JSON.stringify(d));
const clearSakuraData    = () => lsDel(SAKURA_ENDING_KEY);

const SAKURA_CONDITIONS = [
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

const updateSakuraProgress = (scenario, karmaScore, companionsSaved, grudgesLeft, cycleCount) => {
  const data = loadSakuraData();
  if (scenario && !data.clearedScenarios.includes(scenario)) data.clearedScenarios.push(scenario);
  if (karmaScore >= 40 && karmaScore <= 60) data.conditions.karma_balance = (data.conditions.karma_balance || 0) + 1;
  if (!grudgesLeft) data.conditions.no_grudge = (data.conditions.no_grudge || 0) + 1;
  if (companionsSaved) data.conditions.companion_saved = true;
  if (cycleCount >= 20) data.conditions.cycle_twenty = true;
  const allScenariosClear = data.clearedScenarios.length >= 4; // 최소 4개 세계관
  if (allScenariosClear) data.conditions.all_scenarios = true;
  const allConditionsMet = data.conditions.all_scenarios && (data.conditions.karma_balance >= 3) && (data.conditions.no_grudge >= 2) && data.conditions.companion_saved && data.conditions.cycle_twenty;
  if (allConditionsMet) data.unlocked = true;
  saveSakuraData(data);
  return data;
};

const getSakuraStatus = () => {
  const data = loadSakuraData();
  const metCount = Object.values(data.conditions).filter(v => v === true || v >= 1).length;
  return { ...data, metCount, totalConditions: SAKURA_CONDITIONS.length, conditions: SAKURA_CONDITIONS.map(c => ({ ...c, met: !!data.conditions[c.id] })) };
};

// ── 77번: 데자뷔 알림 ──
// 전생에서 겪은 상황과 동일한 장면 연출 시 "익숙한 느낌이 든다" 텍스트 자동 삽입
const DEJAVU_KEY  = "taleforge-dejavu";
const loadDejavu  = () => { const r = lsGet(DEJAVU_KEY); return r ? JSON.parse(r) : { triggers: [], count: 0 }; };
const saveDejavu  = (d) => lsSet(DEJAVU_KEY, JSON.stringify(d));
const clearDejavu = () => lsDel(DEJAVU_KEY);

const DEJAVU_TRIGGERS = [
  { id:"tavern_entrance",  keyword:["술집","주점","여관"],        feeling:"이 냄새... 어딘가 전에 맡아본 것 같다." },
  { id:"dark_corridor",    keyword:["어두운","복도","지하"],      feeling:"이 어둠의 질감이 손에 잡힐 듯 익숙하다." },
  { id:"sword_clash",      keyword:["칼","검","충돌","전투"],     feeling:"이 금속 소리... 몇 번이나 들었던 것 같다." },
  { id:"betrayal_scene",   keyword:["배신","뒤통수","속임"],      feeling:"예상했다. 왜인지 모르게 처음부터 알고 있었다." },
  { id:"ancient_ruin",     keyword:["유적","고대","폐허"],        feeling:"이 돌의 결... 손으로 더듬어본 적 있다는 확신이 든다." },
  { id:"dying_npc",        keyword:["죽어","숨이","마지막"],      feeling:"이 장면이 꿈에 나왔다. 분명히 꿈에서 보았다." },
  { id:"final_boss",       keyword:["최종","보스","마왕","악마"], feeling:"이 존재를 이미 알고 있다. 그리고 이 자와의 싸움도." },
  { id:"reunion",          keyword:["재회","다시만","오랜만"],    feeling:"이 만남이... 처음이 아니다. 처음일 리가 없다." },
];

const recordDejavuEvent = (triggerId, scenario) => {
  const dv = loadDejavu();
  dv.count = (dv.count || 0) + 1;
  dv.triggers = dv.triggers || [];
  const trigger = DEJAVU_TRIGGERS.find(t => t.id === triggerId);
  if (trigger && !dv.triggers.find(t => t.id === triggerId)) {
    dv.triggers.push({ ...trigger, scenario, triggeredAt: new Date().toISOString() });
  }
  saveDejavu(dv);
};

const getDejavuStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return { ...loadDejavu(), triggerDefs: DEJAVU_TRIGGERS };
};

// ── 78번: 인과율 조작 ──
// 고회차 전용 스킬. 특정 사건의 원인을 소급해서 바꾸는 선택지 등장
const CAUSALITY_KEY  = "taleforge-causality";
const loadCausality  = () => { const r = lsGet(CAUSALITY_KEY); return r ? JSON.parse(r) : { uses: 0, maxUses: 3, history: [] }; };
const saveCausality  = (c) => lsSet(CAUSALITY_KEY, JSON.stringify(c));
const clearCausality = () => lsDel(CAUSALITY_KEY);

const useCausalityManip = (eventDesc) => {
  const c = loadCausality();
  if ((c.uses || 0) >= (c.maxUses || 3)) return false;
  c.uses = (c.uses || 0) + 1;
  c.history = c.history || [];
  c.history.push({ eventDesc: eventDesc || "사건 변경", usedAt: new Date().toISOString() });
  saveCausality(c);
  return true;
};

const resetCausalityOnReincarnate = (cycle) => {
  const c = loadCausality();
  c.uses = 0;
  c.maxUses = Math.min(5, Math.floor(cycle / 5) + 1); // 회차마다 최대 사용 횟수 증가
  saveCausality(c);
};

const getCausalityStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 10) return null; // 10회차부터 해금
  return loadCausality();
};

// ── 79번: 전생 도박 빚 ──
// 전생에서 도박으로 큰돈 잃으면 다음 회차 시작 시 빚쟁이 NPC 등장
const GAMBLING_DEBT_KEY  = "taleforge-gambling-debt";
const loadGamblingDebt   = () => { const r = lsGet(GAMBLING_DEBT_KEY); return r ? JSON.parse(r) : { totalDebt: 0, paidOff: false, creditorName: null }; };
const saveGamblingDebt   = (d) => lsSet(GAMBLING_DEBT_KEY, JSON.stringify(d));
const clearGamblingDebt  = () => lsDel(GAMBLING_DEBT_KEY);

const CREDITOR_NAMES = ["그라마스 빚 추심단","어둠의 거래소","세계 은행 특별 수금팀","운명의 빚쟁이","전생 채무 정리 기관"];

const recordGamblingDebt = (amount, scenario) => {
  if (!amount || amount <= 0) return;
  const debt = loadGamblingDebt();
  debt.totalDebt = (debt.totalDebt || 0) + amount;
  debt.paidOff = false;
  if (!debt.creditorName) debt.creditorName = CREDITOR_NAMES[Math.floor(Math.random() * CREDITOR_NAMES.length)];
  debt.scenario = scenario || "";
  debt.incurredAt = new Date().toISOString();
  saveGamblingDebt(debt);
};

const payOffDebt = () => {
  const debt = loadGamblingDebt();
  debt.paidOff = true;
  debt.paidAt = new Date().toISOString();
  saveGamblingDebt(debt);
};

const getGamblingDebt = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const debt = loadGamblingDebt();
  if (!debt.totalDebt || debt.totalDebt <= 0) return null;
  return debt;
};

// ── 80번: 어린 시절 트라우마 ──
// 전생 초반부 선택이 다음 회차 캐릭터의 트라우마로 반영. 플래시백 이벤트 발동
const CHILDHOOD_TRAUMA_KEY  = "taleforge-childhood-trauma";
const loadChildhoodTrauma   = () => { const r = lsGet(CHILDHOOD_TRAUMA_KEY); return r ? JSON.parse(r) : []; };
const saveChildhoodTrauma   = (t) => lsSet(CHILDHOOD_TRAUMA_KEY, JSON.stringify(t));
const clearChildhoodTrauma  = () => lsDel(CHILDHOOD_TRAUMA_KEY);

const TRAUMA_DEFS80 = [
  { id:"abandoned",   icon:"😢", label:"버려진 기억",    trigger:"홀로 남겨지는 상황",  flashback:"어릴 때 어둠 속에 혼자 남겨졌던 그 밤이 스쳐 지나간다.",  effect:"단독 행동 시 불안 +10" },
  { id:"betrayed",    icon:"💔", label:"배신의 상처",    trigger:"믿었던 자의 배신",   flashback:"처음으로 등에 칼이 꽂혔던 순간이 선명하게 떠오른다.",        effect:"새 NPC 신뢰 형성 시간 증가" },
  { id:"loss",        icon:"🕯️", label:"소중한 이의 죽음", trigger:"동료의 사망",     flashback:"그 차가운 손의 감촉이 아직도 잊혀지지 않는다.",              effect:"동료 사망 시 행동 불능 위험" },
  { id:"defeat",      icon:"⚔️", label:"굴욕적 패배",    trigger:"압도적 열세의 전투", flashback:"무력하게 쓰러졌던 그 순간, 발밑의 흙냄새가 생생하다.",       effect:"압도적 적 앞에서 떨림" },
  { id:"hunger",      icon:"🍞", label:"굶주림의 기억",  trigger:"자원 부족 상황",    flashback:"배고픔으로 의식이 흐릿해지던 그날의 감각이 되살아난다.",      effect:"식량 부족 시 판정 -10" },
  { id:"fire",        icon:"🔥", label:"불의 공포",      trigger:"화염 관련 이벤트",  flashback:"모든 것이 타오르던 그날 밤의 냄새가 코를 찌른다.",            effect:"화염 마법/이벤트 시 공황" },
];

const recordChildhoodTrauma = (traumaId, scenario) => {
  if (!traumaId) return;
  const traumas = loadChildhoodTrauma();
  const def = TRAUMA_DEFS80.find(t => t.id === traumaId);
  if (!def) return;
  if (!traumas.find(t => t.id === traumaId)) {
    traumas.push({ ...def, scenario: scenario || "", recordedAt: new Date().toISOString(), triggered: false });
  }
  if (traumas.length > 3) traumas.splice(0, traumas.length - 3);
  saveChildhoodTrauma(traumas);
};

const getChildhoodTraumas = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadChildhoodTrauma();
};

// ── 81번: 세계 종말 카운터 ──
// 회차마다 종말 시계 앞당겨짐. 방치하면 진짜 멸망 엔딩. 특정 회차에서 봉인 이벤트 필요
const APOCALYPSE_KEY  = "taleforge-apocalypse";
const loadApocalypse  = () => { const r = lsGet(APOCALYPSE_KEY); return r ? JSON.parse(r) : { clock: 0, sealed: false, sealCount: 0 }; };
const saveApocalypse  = (a) => lsSet(APOCALYPSE_KEY, JSON.stringify(a));
const clearApocalypse = () => lsDel(APOCALYPSE_KEY);

const APOCALYPSE_STAGES = [
  { stage:0, clock:[0,20],  icon:"🌍", label:"평화로운 세계",    desc:"아직 이상이 없다.",                           warning:null },
  { stage:1, clock:[21,40], icon:"⚠️", label:"불길한 징조",      desc:"세계 곳곳에서 이상한 일들이 일어나기 시작한다.", warning:"자연재해가 소폭 증가한다." },
  { stage:2, clock:[41,60], icon:"🌩️", label:"균열의 시작",      desc:"현실의 균열이 눈에 보이기 시작한다.",            warning:"강력한 몬스터들이 각성한다." },
  { stage:3, clock:[61,80], icon:"🌑", label:"어둠의 확산",      desc:"빛이 줄어들고 어둠이 세계를 잠식한다.",          warning:"NPC들이 공황 상태에 빠진다." },
  { stage:4, clock:[81,99], icon:"☄️", label:"종말의 전야",      desc:"세계의 끝이 보인다. 지금 당장 봉인해야 한다.",   warning:"최종 봉인 이벤트를 활성화하지 않으면 멸망이 확정된다." },
  { stage:5, clock:[100,100], icon:"💀", label:"세계 멸망",      desc:"세계가 멸망했다. 특별 엔딩이 발동된다.",         warning:"멸망 엔딩 고유 보상 존재." },
];

const tickApocalypse = (karmaScore, questRate, sealed) => {
  const apo = loadApocalypse();
  if (sealed) {
    apo.sealed = true;
    apo.sealCount = (apo.sealCount || 0) + 1;
    apo.clock = Math.max(0, (apo.clock || 0) - 15); // 봉인 시 시계 후퇴
  } else {
    const tick = karmaScore >= 70 ? 8 : questRate >= 70 ? 3 : 5;
    apo.clock = Math.min(100, (apo.clock || 0) + tick);
  }
  saveApocalypse(apo);
  const stage = APOCALYPSE_STAGES.find(s => (apo.clock||0) >= s.clock[0] && (apo.clock||0) <= s.clock[1]) || APOCALYPSE_STAGES[5];
  return { ...apo, stageData: stage };
};

const getApocalypseStatus = () => {
  const apo = loadApocalypse();
  const stage = APOCALYPSE_STAGES.find(s => (apo.clock||0) >= s.clock[0] && (apo.clock||0) <= s.clock[1]) || APOCALYPSE_STAGES[0];
  return { ...apo, stageData: stage };
};

// ── 82번: 슬픔 수치 ──
// 전생에서 잃은 동료·연인 수 누적. 일정 이상이면 공감 능력 폭발 상승 대신 전투 의지 하락
const GRIEF_KEY  = "taleforge-grief";
const loadGrief  = () => { const r = lsGet(GRIEF_KEY); return r ? JSON.parse(r) : { lostOnes: [], total: 0 }; };
const saveGrief  = (g) => lsSet(GRIEF_KEY, JSON.stringify(g));
const clearGrief = () => lsDel(GRIEF_KEY);

const GRIEF_STAGES = [
  { stage:0, range:[0,2],   icon:"😐", label:"담담함",   empathy:0,  willPenalty:0,  desc:"아직 잃은 자가 없거나 적다." },
  { stage:1, range:[3,5],   icon:"😔", label:"상실감",   empathy:10, willPenalty:5,  desc:"슬픔이 가슴 한편에 자리 잡았다." },
  { stage:2, range:[6,10],  icon:"😢", label:"깊은 슬픔", empathy:20, willPenalty:10, desc:"잃은 자들의 얼굴이 꿈에 나온다." },
  { stage:3, range:[11,20], icon:"💔", label:"통곡",     empathy:35, willPenalty:20, desc:"이 많은 죽음을 어떻게 감당하는가." },
  { stage:4, range:[21,99], icon:"🕯️", label:"초월적 슬픔", empathy:50, willPenalty:5, desc:"슬픔이 너무 커서 오히려 고요해진다. 다시는 잃지 않겠다는 의지." },
];

const recordLoss = (npcName, relationship) => {
  if (!npcName) return;
  const grief = loadGrief();
  grief.lostOnes = grief.lostOnes || [];
  if (!grief.lostOnes.find(l => l.name === npcName)) {
    grief.lostOnes.push({ name: npcName, relationship: relationship || "동료", lostAt: new Date().toISOString() });
    grief.total = grief.lostOnes.length;
  }
  saveGrief(grief);
};

const getGriefStatus = () => {
  const grief = loadGrief();
  const total = grief.total || 0;
  const stage = GRIEF_STAGES.find(s => total >= s.range[0] && total <= s.range[1]) || GRIEF_STAGES[4];
  return { ...grief, stageData: stage };
};

// ── 83번: 전생 직감 ──
// 전생 횟수 많을수록 첫 만남 NPC의 선의/악의 여부를 퍼센트로 표시
const INSTINCT_KEY  = "taleforge-instinct";
const loadInstinct  = () => { const r = lsGet(INSTINCT_KEY); return r ? JSON.parse(r) : { level: 0, accuracy: 50 }; };
const saveInstinct  = (i) => lsSet(INSTINCT_KEY, JSON.stringify(i));
const clearInstinct = () => lsDel(INSTINCT_KEY);

const growInstinct = (cycle) => {
  const inst = loadInstinct();
  inst.level = Math.min(10, Math.floor(cycle / 3));
  inst.accuracy = Math.min(95, 50 + (inst.level * 5));
  saveInstinct(inst);
  return inst;
};

const getInstinctStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 3) return null;
  const inst = loadInstinct();
  return { ...inst, desc: `첫 만남 NPC 의도 파악 정확도 ${inst.accuracy}%` };
};

// ── 84번: 저주받은 유물 ──
// 전생에서 저주 아이템 쓰다 죽으면 그 저주가 다음 생에도 희미하게 따라옴
const CURSED_RELIC_KEY  = "taleforge-cursed-relic";
const loadCursedRelics  = () => { const r = lsGet(CURSED_RELIC_KEY); return r ? JSON.parse(r) : []; };
const saveCursedRelics  = (r) => lsSet(CURSED_RELIC_KEY, JSON.stringify(r));
const clearCursedRelics = () => lsDel(CURSED_RELIC_KEY);

const CURSED_RELIC_TYPES = [
  { id:"shadow_ring",   icon:"💍", name:"그림자 반지",   curse:"어두운 장소에서 형체가 흐릿해진다.",        hiddenPower:"그림자 이동 능력 (50% 확률)" },
  { id:"blood_sword",   icon:"⚔️", name:"피의 검",        curse:"전투 중 자신도 피를 흘린다.",              hiddenPower:"적에게 출혈 상태 부여" },
  { id:"eye_of_madness",icon:"👁️", name:"광기의 눈",     curse:"너무 많이 보면 현실 인식이 흐려진다.",     hiddenPower:"감춰진 것들이 보인다" },
  { id:"hunger_crown",  icon:"👑", name:"굶주림의 왕관", curse:"항상 무언가를 원하게 된다.",               hiddenPower:"욕망이 강해져 의지력 +15" },
  { id:"void_cloak",    icon:"🌑", name:"공허의 망토",   curse:"존재감이 옅어져 NPC가 무시하기 쉽다.",    hiddenPower:"완전 은신 (단시간)" },
];

const recordCursedRelic = (relicId, scenario) => {
  if (!relicId) return;
  const relics = loadCursedRelics();
  const def = CURSED_RELIC_TYPES.find(r => r.id === relicId);
  if (!def) return;
  if (!relics.find(r => r.id === relicId)) {
    relics.push({ ...def, scenario: scenario || "", recordedAt: new Date().toISOString(), intensity: 1 });
  } else {
    const existing = relics.find(r => r.id === relicId);
    existing.intensity = Math.min(3, (existing.intensity || 1) + 1);
  }
  if (relics.length > 3) relics.splice(0, relics.length - 3);
  saveCursedRelics(relics);
};

const getCursedRelics = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadCursedRelics();
};

// ── 85번: 자연 회귀 ──
// 전생에서 자연 파괴 많으면 다음 회차 자연재해 빈도 상승. 보호하면 숲·강에서 특별 아이템
const NATURE_KARMA_KEY  = "taleforge-nature-karma";
const loadNatureKarma   = () => { const r = lsGet(NATURE_KARMA_KEY); return r ? JSON.parse(r) : { score: 50, disasters: 0, gifts: 0 }; };
const saveNatureKarma   = (n) => lsSet(NATURE_KARMA_KEY, JSON.stringify(n));
const clearNatureKarma  = () => lsDel(NATURE_KARMA_KEY);

const recordNatureAction = (action) => {
  const nk = loadNatureKarma();
  if (action === "destroy") {
    nk.score = Math.max(0, (nk.score || 50) - 10);
    nk.disasters = (nk.disasters || 0) + 1;
  } else if (action === "protect") {
    nk.score = Math.min(100, (nk.score || 50) + 8);
    nk.gifts = (nk.gifts || 0) + 1;
  }
  saveNatureKarma(nk);
};

const getNatureKarma = () => {
  const nk = loadNatureKarma();
  const score = nk.score || 50;
  const status = score >= 70 ? { icon:"🌿", label:"자연의 수호자", effect:"숲·강에서 희귀 아이템 자동 발견", disaster:false }
    : score >= 40 ? { icon:"🌳", label:"자연과 공존", effect:"자연 관련 판정 보너스", disaster:false }
    : score >= 20 ? { icon:"⚠️", label:"자연의 경고", effect:"자연재해 빈도 증가", disaster:true }
    : { icon:"🌪️", label:"자연의 분노", effect:"매 회차 자연재해 강제 발생", disaster:true };
  return { ...nk, status };
};

// ── 86번: 신분 세탁 누적 ──
// 전생에서 사용한 가명·위장 신분들이 목록에 저장. 다음 회차에서 즉시 활용 (53번과 연계)
const ALIAS_LIST_KEY  = "taleforge-alias-list";
const loadAliasList   = () => { const r = lsGet(ALIAS_LIST_KEY); return r ? JSON.parse(r) : []; };
const saveAliasList   = (a) => lsSet(ALIAS_LIST_KEY, JSON.stringify(a));
const clearAliasList  = () => lsDel(ALIAS_LIST_KEY);

const recordAlias = (aliasName, context, scenario) => {
  if (!aliasName) return;
  const list = loadAliasList();
  if (!list.find(a => a.name === aliasName)) {
    list.push({ name: aliasName, context: context || "위장 신분", scenario: scenario || "", usedAt: new Date().toISOString(), credibility: 1 });
  } else {
    const existing = list.find(a => a.name === aliasName);
    existing.credibility = Math.min(5, (existing.credibility || 1) + 1);
  }
  if (list.length > 15) list.sort((a,b) => b.credibility - a.credibility).splice(15);
  saveAliasList(list);
};

const getAliasList = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadAliasList();
};

// ── 87번: 소원 시스템 ──
// 100회차마다 소원 1회. 스탯 초기화, 특정 NPC 부활, 잃어버린 아이템 복구 등
const WISH_KEY  = "taleforge-wish";
const loadWish  = () => { const r = lsGet(WISH_KEY); return r ? JSON.parse(r) : { wishesGranted: 0, nextWishAt: 100, history: [] }; };
const saveWish  = (w) => lsSet(WISH_KEY, JSON.stringify(w));
const clearWish = () => lsDel(WISH_KEY);

const WISH_OPTIONS = [
  { id:"stat_reset",    icon:"🔄", label:"스탯 완전 초기화",     desc:"누적 페널티와 패시브 저주를 모두 초기화한다." },
  { id:"npc_revive",    icon:"💫", label:"NPC 부활",             desc:"전생에서 잃은 중요 NPC 한 명을 이번 회차에 되살린다." },
  { id:"item_restore",  icon:"💎", label:"잃어버린 아이템 복구",  desc:"전생에서 잃거나 파괴된 아이템 하나를 되찾는다." },
  { id:"cycle_skip",    icon:"⏩", label:"저주 회차 면제",        desc:"다음 한 회차의 모든 페널티와 저주를 면제받는다." },
  { id:"hidden_ending", icon:"🌈", label:"히든 엔딩 조건 1개 완성", desc:"현재 미완성인 히든 엔딩 조건 중 하나를 자동 달성한다." },
];

const checkWishAvailable = (cycleCount) => {
  const wish = loadWish();
  return cycleCount > 0 && cycleCount % 100 === 0;
};

const grantWish = (wishId, cycleCount) => {
  const wish = loadWish();
  const option = WISH_OPTIONS.find(w => w.id === wishId);
  if (!option) return false;
  wish.wishesGranted = (wish.wishesGranted || 0) + 1;
  wish.nextWishAt = Math.ceil((cycleCount + 1) / 100) * 100;
  wish.history = wish.history || [];
  wish.history.push({ ...option, grantedAt: new Date().toISOString(), cycle: cycleCount });
  saveWish(wish);
  return true;
};

const getWishStatus = () => {
  const cycle = loadCycleCount();
  const wish = loadWish();
  return { ...wish, available: checkWishAvailable(cycle), options: WISH_OPTIONS };
};

// ── 88번: 전생 반려동물 ──
// 전생에서 키운 동물이 다음 회차에 야생으로 등장. 특정 아이템 주면 재결합
const PET_LEGACY_KEY  = "taleforge-pet-legacy";
const loadPetLegacy   = () => { const r = lsGet(PET_LEGACY_KEY); return r ? JSON.parse(r) : []; };
const savePetLegacy   = (p) => lsSet(PET_LEGACY_KEY, JSON.stringify(p));
const clearPetLegacy  = () => lsDel(PET_LEGACY_KEY);

const PET_TYPES = [
  { id:"wolf",    icon:"🐺", name:"늑대",    bond:"전투 시 본능적으로 옆에서 싸운다.",     reuniteItem:"날고기 또는 뼈" },
  { id:"raven",   icon:"🦅", name:"까마귀",  bond:"정보를 물어다 준다. 적 위치 정찰.",    reuniteItem:"반짝이는 물건" },
  { id:"cat",     icon:"🐱", name:"고양이",  bond:"위험 감지 능력. 함정·독 사전 경고.",   reuniteItem:"생선 또는 밀크" },
  { id:"horse",   icon:"🐴", name:"말",       bond:"이동 속도 상승. 전투 중 돌격 보조.",   reuniteItem:"사과 또는 당근" },
  { id:"owl",     icon:"🦉", name:"올빼미",  bond:"야간 탐색 능력. 어두운 곳에서 길 안내.", reuniteItem:"쥐 또는 고기 조각" },
  { id:"dragon_whelp", icon:"🐲", name:"아기 용", bond:"화염 보조 공격. 강력하지만 관리 어려움.", reuniteItem:"불꽃 결정" },
];

const recordPetLegacy = (petType, petName, bond, scenario) => {
  if (!petType) return;
  const pets = loadPetLegacy();
  const def = PET_TYPES.find(p => p.id === petType);
  if (!def) return;
  const existing = pets.find(p => p.id === petType);
  if (existing) {
    existing.encounters = (existing.encounters || 1) + 1;
    existing.bond = Math.min(100, (existing.bond || bond) + 15);
  } else {
    pets.push({ ...def, petName: petName || def.name, bond: bond || 30, encounters: 1, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  if (pets.length > 4) pets.sort((a,b) => b.bond - a.bond).splice(4);
  savePetLegacy(pets);
};

const getPetLegacy = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadPetLegacy();
};

// ── 89번: 봉인된 기억 방 ──
// 너무 충격적인 사건은 자동 봉인. 특정 조건 달성 시 열람 — 강력한 스킬 해금 대신 정신력 타격
const SEALED_MEMORY_KEY  = "taleforge-sealed-memory";
const loadSealedMemories = () => { const r = lsGet(SEALED_MEMORY_KEY); return r ? JSON.parse(r) : []; };
const saveSealedMemories = (m) => lsSet(SEALED_MEMORY_KEY, JSON.stringify(m));
const clearSealedMemories= () => lsDel(SEALED_MEMORY_KEY);

const SEALED_MEMORY_TYPES = [
  { id:"first_kill",     trigger:"처음으로 사람을 죽인 기억",      skill:"살인자의 냉정 — 감정 소모 없이 전투 가능",       mentalCost:20 },
  { id:"betrayal_pain",  trigger:"가장 아꼈던 자에게 배신당한 기억", skill:"배신의 면역 — 신뢰 판정 대신 독립 행동 보너스", mentalCost:25 },
  { id:"mass_death",     trigger:"대규모 죽음을 목격한 기억",        skill:"죽음의 관찰자 — 사망 원인과 HP 수치 감지",       mentalCost:30 },
  { id:"own_atrocity",   trigger:"스스로 저지른 잔학한 행동의 기억", skill:"어둠의 힘 — 카르마 소모로 강력한 기술 발동",    mentalCost:35 },
  { id:"true_despair",   trigger:"모든 것을 포기했던 절망의 기억",    skill:"절망의 극복 — 위기 시 모든 스탯 일시 2배",      mentalCost:40 },
];

const sealMemory = (memoryType, scenario) => {
  if (!memoryType) return;
  const memories = loadSealedMemories();
  const def = SEALED_MEMORY_TYPES.find(m => m.id === memoryType);
  if (!def || memories.find(m => m.id === memoryType)) return;
  memories.push({ ...def, scenario: scenario || "", sealed: true, sealedAt: new Date().toISOString(), opened: false });
  saveSealedMemories(memories);
};

const openSealedMemory = (memoryId) => {
  const memories = loadSealedMemories();
  const mem = memories.find(m => m.id === memoryId);
  if (!mem || mem.opened) return null;
  mem.opened = true;
  mem.openedAt = new Date().toISOString();
  saveSealedMemories(memories);
  return mem;
};

const getSealedMemories = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadSealedMemories();
};

// ── 90번: 영혼 결정체 ──
// 회차 클리어 시 1개 획득. 모아서 특정 개수 달성 시 전설급 아티팩트 제조
const SOUL_CRYSTAL_KEY  = "taleforge-soul-crystal";
const loadSoulCrystals  = () => { const r = lsGet(SOUL_CRYSTAL_KEY); return r ? JSON.parse(r) : { count: 0, crafted: [] }; };
const saveSoulCrystals  = (c) => lsSet(SOUL_CRYSTAL_KEY, JSON.stringify(c));
const clearSoulCrystals = () => lsDel(SOUL_CRYSTAL_KEY);

const SOUL_CRYSTAL_CRAFTS = [
  { id:"memory_gem",    cost:3,  icon:"💎", name:"기억의 보석",     effect:"전생 기억 열람 시 정확도 100%", bonus:"기억 왜곡 면역" },
  { id:"fate_shield",   cost:5,  icon:"🛡️", name:"운명의 방패",     effect:"즉사 판정 무효 1회 추가",       bonus:"매 회차 추가 보유" },
  { id:"soul_crown",    cost:8,  icon:"👑", name:"영혼의 왕관",     effect:"모든 스탯 +10 영구",            bonus:"윤회 등급 1 상승" },
  { id:"time_hourglass",cost:12, icon:"⏳", name:"시간의 모래시계", effect:"시간 역행 토큰 +2 추가",        bonus:"토큰 최대치 +2" },
  { id:"world_orb",     cost:20, icon:"🌐", name:"세계의 구슬",     effect:"봉인된 신 해방 조건 달성",      bonus:"메타 스토리 개막" },
];

const earnSoulCrystal = (amount) => {
  const sc = loadSoulCrystals();
  sc.count = (sc.count || 0) + (amount || 1);
  saveSoulCrystals(sc);
  return sc;
};

const craftWithSoulCrystal = (craftId) => {
  const sc = loadSoulCrystals();
  const craft = SOUL_CRYSTAL_CRAFTS.find(c => c.id === craftId);
  if (!craft || (sc.count || 0) < craft.cost) return false;
  sc.count -= craft.cost;
  sc.crafted = sc.crafted || [];
  sc.crafted.push({ ...craft, craftedAt: new Date().toISOString() });
  saveSoulCrystals(sc);
  return true;
};

const getSoulCrystalStatus = () => {
  const sc = loadSoulCrystals();
  return { ...sc, availableCrafts: SOUL_CRYSTAL_CRAFTS.filter(c => (sc.count || 0) >= c.cost) };
};

// ── 91번: 감정 잔향 ──
// 전생에서 가장 강하게 느낀 감정이 다음 회차 특성으로 남음
const EMOTION_ECHO_KEY  = "taleforge-emotion-echo";
const loadEmotionEcho   = () => { const r = lsGet(EMOTION_ECHO_KEY); return r ? JSON.parse(r) : null; };
const saveEmotionEcho   = (e) => lsSet(EMOTION_ECHO_KEY, JSON.stringify(e));
const clearEmotionEcho  = () => lsDel(EMOTION_ECHO_KEY);

const EMOTION_ECHOES = {
  rage:    { icon:"🔥", label:"분노의 잔향",  trait:"분노 게이지 시스템 추가. 분노가 쌓일수록 전투력 상승.",  bonus:"전투 판정 +15 (분노 상태)", sideEffect:"냉정한 판단 -10" },
  sorrow:  { icon:"💧", label:"슬픔의 잔향",  trait:"공감 능력 극대화. NPC의 감정을 본능적으로 읽는다.",      bonus:"대화 판정 +15",             sideEffect:"슬픈 이벤트에서 행동력 -10" },
  joy:     { icon:"✨", label:"기쁨의 잔향",  trait:"행운 수치 상승. 작은 일에도 긍정적 파급 효과.",          bonus:"행운 판정 +10 전체",        sideEffect:"위험 감지 -5" },
  fear:    { icon:"😰", label:"공포의 잔향",  trait:"위험 감지 본능. 함정·위협을 직감적으로 느낀다.",         bonus:"위험 감지 +20",             sideEffect:"새로운 도전 판정 -5" },
  pride:   { icon:"👑", label:"자부심의 잔향", trait:"카리스마 폭발. 말 한마디가 군중을 움직인다.",            bonus:"리더십 판정 +20",           sideEffect:"협력 요청 거부 본능" },
  despair: { icon:"🌑", label:"절망의 잔향",  trait:"극한 상황에서 각성. 죽을 것 같을 때 오히려 강해진다.",  bonus:"위기 판정 +25",             sideEffect:"평상시 의욕 -10" },
  love:    { icon:"💕", label:"사랑의 잔향",  trait:"강한 인연 형성. NPC와의 유대 상승 속도 2배.",           bonus:"인연 관련 판정 +20",        sideEffect:"인연 잃으면 큰 타격" },
  hatred:  { icon:"💀", label:"증오의 잔향",  trait:"복수 의지. 목표가 생기면 모든 능력이 집중된다.",         bonus:"대상 지정 판정 +25",        sideEffect:"대상 없으면 방황" },
};

const recordEmotionEcho = (dominantEmotion) => {
  if (!dominantEmotion || !EMOTION_ECHOES[dominantEmotion]) return;
  const echo = EMOTION_ECHOES[dominantEmotion];
  saveEmotionEcho({ id: dominantEmotion, ...echo, recordedAt: new Date().toISOString() });
};

const getEmotionEcho = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadEmotionEcho();
};

// ── 92번: 차원 지도 ──
// 회차마다 방문한 장소가 멀티버스 지도에 핀으로 표시. 완성도에 따라 차원 이동 스킬 해금
const DIMENSION_MAP_KEY  = "taleforge-dimension-map";
const loadDimensionMap   = () => { const r = lsGet(DIMENSION_MAP_KEY); return r ? JSON.parse(r) : { pins: [], totalWorlds: 0 }; };
const saveDimensionMap   = (m) => lsSet(DIMENSION_MAP_KEY, JSON.stringify(m));
const clearDimensionMap  = () => lsDel(DIMENSION_MAP_KEY);

const DIMENSION_UNLOCK_STAGES = [
  { count:3,  icon:"🗺️", skill:"차원 감지",       desc:"다른 세계의 기운을 어렴풋이 느낄 수 있다." },
  { count:6,  icon:"🌀", skill:"균열 탐지",         desc:"차원 균열이 생기는 위치를 미리 감지한다." },
  { count:10, icon:"🌌", skill:"차원 보행",          desc:"짧은 거리의 차원 이동이 가능해진다." },
  { count:15, icon:"🌐", skill:"멀티버스 항법",      desc:"원하는 시나리오 세계로 이동 확률 상승." },
  { count:20, icon:"♾️", skill:"차원의 지배자",      desc:"어느 세계에서도 처음부터 지식을 가진 채 시작." },
];

const addDimensionPin = (worldName, scenario) => {
  if (!worldName) return;
  const map = loadDimensionMap();
  if (!map.pins.find(p => p.world === worldName)) {
    map.pins.push({ world: worldName, scenario: scenario || "", pinnedAt: new Date().toISOString() });
    map.totalWorlds = map.pins.length;
  }
  saveDimensionMap(map);
};

const getDimensionMapStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const map = loadDimensionMap();
  const total = map.totalWorlds || 0;
  const unlockedSkills = DIMENSION_UNLOCK_STAGES.filter(s => total >= s.count);
  const nextSkill = DIMENSION_UNLOCK_STAGES.find(s => total < s.count);
  return { ...map, unlockedSkills, nextSkill };
};

// ── 93번: 악역 계승 ──
// 내가 처치한 최종보스의 힘 일부가 이월. 하지만 점점 악으로 물들이는 이벤트 발생
const VILLAIN_INHERIT_KEY  = "taleforge-villain-inherit";
const loadVillainInherit   = () => { const r = lsGet(VILLAIN_INHERIT_KEY); return r ? JSON.parse(r) : { inherited: [], corruptionLevel: 0 }; };
const saveVillainInherit   = (v) => lsSet(VILLAIN_INHERIT_KEY, JSON.stringify(v));
const clearVillainInherit  = () => lsDel(VILLAIN_INHERIT_KEY);

const inheritVillainPower = (bossName, bossAbility, scenario) => {
  if (!bossName) return;
  const vi = loadVillainInherit();
  vi.inherited = vi.inherited || [];
  if (!vi.inherited.find(v => v.bossName === bossName)) {
    vi.inherited.push({ bossName, ability: bossAbility || "알 수 없는 힘", scenario: scenario || "", inheritedAt: new Date().toISOString() });
    vi.corruptionLevel = Math.min(100, (vi.corruptionLevel || 0) + 15);
  }
  saveVillainInherit(vi);
};

const getVillainInheritStatus = () => {
  const vi = loadVillainInherit();
  const corruption = vi.corruptionLevel || 0;
  const corruptDesc = corruption >= 80 ? "당신 안의 악이 거의 지배적이다. 인성 선택지가 줄어든다."
    : corruption >= 50 ? "악의 목소리가 점점 커진다. 어두운 선택지가 자주 나타난다."
    : corruption >= 20 ? "처치한 적의 힘이 희미하게 느껴진다."
    : "아직 영향이 없다.";
  return { ...vi, corruptDesc };
};

// ── 94번: 눈물 수집 ──
// 전생에서 울었던 순간들이 "눈물 결정"으로 저장. 모아서 쓰면 어떤 NPC도 감동시키는 1회용 아이템
const TEAR_CRYSTAL_KEY  = "taleforge-tear-crystals";
const loadTearCrystals  = () => { const r = lsGet(TEAR_CRYSTAL_KEY); return r ? JSON.parse(r) : { crystals: 0, memories: [] }; };
const saveTearCrystals  = (t) => lsSet(TEAR_CRYSTAL_KEY, JSON.stringify(t));
const clearTearCrystals = () => lsDel(TEAR_CRYSTAL_KEY);

const earnTearCrystal = (reason, scenario) => {
  const tc = loadTearCrystals();
  tc.crystals = (tc.crystals || 0) + 1;
  tc.memories = tc.memories || [];
  tc.memories.push({ reason: reason || "이유 없는 눈물", scenario: scenario || "", earnedAt: new Date().toISOString() });
  if (tc.memories.length > 20) tc.memories.splice(0, tc.memories.length - 20);
  saveTearCrystals(tc);
};

const useTearCrystal = (count) => {
  const tc = loadTearCrystals();
  const use = count || 1;
  if ((tc.crystals || 0) < use) return false;
  tc.crystals -= use;
  saveTearCrystals(tc);
  return true; // 사용 시 어떤 NPC도 감동시킴
};

const getTearCrystalStatus = () => {
  const tc = loadTearCrystals();
  return { ...tc, canUse: (tc.crystals || 0) >= 3 };
};

// ── 95번: 냉기/화염 트라우마 → 내성 ──
// 특정 속성으로 반복 사망하면 해당 속성 내성 생기는 대신 반대 속성에 약해짐
const ELEMENT_TRAUMA_KEY  = "taleforge-element-trauma";
const loadElementTrauma   = () => { const r = lsGet(ELEMENT_TRAUMA_KEY); return r ? JSON.parse(r) : {}; };
const saveElementTrauma   = (e) => lsSet(ELEMENT_TRAUMA_KEY, JSON.stringify(e));
const clearElementTrauma  = () => lsDel(ELEMENT_TRAUMA_KEY);

const ELEMENT_PAIRS = {
  fire:    { opposite:"ice",     resistLabel:"화염 내성",   weakLabel:"냉기 약점",   icon:"🔥" },
  ice:     { opposite:"fire",    resistLabel:"냉기 내성",   weakLabel:"화염 약점",   icon:"❄️" },
  lightning:{ opposite:"earth",  resistLabel:"번개 내성",   weakLabel:"대지 약점",   icon:"⚡" },
  earth:   { opposite:"lightning",resistLabel:"대지 내성",  weakLabel:"번개 약점",   icon:"🌍" },
  poison:  { opposite:"holy",    resistLabel:"독 내성",     weakLabel:"신성 약점",   icon:"☠️" },
  holy:    { opposite:"poison",  resistLabel:"신성 내성",   weakLabel:"독 약점",     icon:"✨" },
  darkness:{ opposite:"light",   resistLabel:"암흑 내성",   weakLabel:"빛 약점",     icon:"🌑" },
  light:   { opposite:"darkness",resistLabel:"빛 내성",     weakLabel:"암흑 약점",   icon:"☀️" },
};

const recordElementDeath = (element) => {
  if (!element || !ELEMENT_PAIRS[element]) return;
  const et = loadElementTrauma();
  et[element] = (et[element] || 0) + 1;
  saveElementTrauma(et);
};

const getElementResistances = () => {
  const et = loadElementTrauma();
  const resistances = [];
  Object.entries(et).forEach(([elem, count]) => {
    if (count >= 3 && ELEMENT_PAIRS[elem]) {
      const def = ELEMENT_PAIRS[elem];
      resistances.push({ element: elem, count, ...def, resistLevel: count >= 8 ? "완전 면역" : count >= 5 ? "강한 내성" : "약한 내성" });
    }
  });
  return resistances;
};

// ── 96번: 이세계 서커스 ──
// 고회차 한정 랜덤 이벤트. 전생 NPC들이 뒤틀린 형태로 등장하는 꿈 속 서커스
const CIRCUS_KEY  = "taleforge-circus";
const loadCircus  = () => { const r = lsGet(CIRCUS_KEY); return r ? JSON.parse(r) : { visited: 0, lastVisit: null }; };
const saveCircus  = (c) => lsSet(CIRCUS_KEY, JSON.stringify(c));
const clearCircus = () => lsDel(CIRCUS_KEY);

const CIRCUS_ACTS = [
  { id:"mirror_act",   icon:"🪞", name:"거울 묘기사",    desc:"전생의 자신이 광대 분장으로 마주 서 있다.",          reward:"전생 기억 파편 1개", challenge:"자신과의 의지력 대결" },
  { id:"tightrope",    icon:"🎪", name:"줄타기",          desc:"삶과 죽음의 경계 위를 걷는다.",                      reward:"불사 게이지 +3",     challenge:"균형 판정 3회 연속 성공" },
  { id:"fire_eater",   icon:"🔥", name:"불 삼키기",       desc:"전생에서 죽인 적이 불을 뿜는다.",                    reward:"화염 내성",           challenge:"화염 판정 극복" },
  { id:"juggler",      icon:"🎭", name:"마왕 저글러",     desc:"처치한 보스들이 어릿광대로 등장해 실력을 겨룬다.",   reward:"보스 고유 스킬 1개",  challenge:"세 가지 판정 동시 성공" },
  { id:"ringmaster",   icon:"🎩", name:"단장",            desc:"정체불명의 단장이 한 가지 비밀을 알려준다.",          reward:"대미스터리 조각 1개", challenge:"없음" },
];

const visitCircus = (cycle) => {
  const circus = loadCircus();
  circus.visited = (circus.visited || 0) + 1;
  circus.lastVisit = { cycle, visitedAt: new Date().toISOString() };
  const act = CIRCUS_ACTS[circus.visited % CIRCUS_ACTS.length];
  saveCircus(circus);
  return act;
};

const getCircusStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 7) return null; // 7회차 이상에서만
  return { ...loadCircus(), nextAct: CIRCUS_ACTS[((loadCircus().visited||0) + 1) % CIRCUS_ACTS.length] };
};

// ── 97번: 신전 건립 ──
// 전생에서 신앙 수치 높으면 다음 회차에 내 이름을 딴 신전 존재. 신도들이 버프 제공
const TEMPLE_KEY  = "taleforge-temple";
const loadTemple  = () => { const r = lsGet(TEMPLE_KEY); return r ? JSON.parse(r) : { faithScore: 0, level: 0, worshippers: 0 }; };
const saveTemple  = (t) => lsSet(TEMPLE_KEY, JSON.stringify(t));
const clearTemple = () => lsDel(TEMPLE_KEY);

const TEMPLE_LEVELS = [
  { level:0, faith:0,   icon:"🕯️", name:"없음",       worshippers:0,    boon:null },
  { level:1, faith:20,  icon:"⛩️", name:"작은 사당",  worshippers:5,    boon:"소소한 치유 (HP +20 회복)" },
  { level:2, faith:50,  icon:"🏛️", name:"소신전",    worshippers:30,   boon:"신도 버프 (전투 판정 +5)" },
  { level:3, faith:80,  icon:"🕌", name:"대신전",    worshippers:200,  boon:"신성한 가호 (즉사 판정 -30%)" },
  { level:4, faith:120, icon:"🏰", name:"성지",      worshippers:1000, boon:"신의 대리자 (모든 판정 +10)" },
  { level:5, faith:200, icon:"👑", name:"신화의 성지", worshippers:9999, boon:"신격화 준비 완료. 다음 회차 진 엔딩 루트 해금." },
];

const growFaith = (faithGain) => {
  const t = loadTemple();
  t.faithScore = (t.faithScore || 0) + (faithGain || 5);
  const newLevel = TEMPLE_LEVELS.reduce((acc, l) => t.faithScore >= l.faith ? l.level : acc, 0);
  const didLevelUp = newLevel > (t.level || 0);
  t.level = newLevel;
  t.worshippers = TEMPLE_LEVELS[newLevel].worshippers;
  saveTemple(t);
  return { ...t, levelData: TEMPLE_LEVELS[newLevel], didLevelUp };
};

const getTempleStatus = () => {
  const t = loadTemple();
  return { ...t, levelData: TEMPLE_LEVELS[t.level || 0], nextLevel: TEMPLE_LEVELS[(t.level || 0) + 1] || null };
};

// ── 98번: 유언 방송 ──
// 전생 마지막 대사가 세계에 전설로 퍼짐. NPC들이 그 대사를 인용하거나 오해
const LEGACY_WORDS_KEY  = "taleforge-legacy-words";
const loadLegacyWords   = () => { const r = lsGet(LEGACY_WORDS_KEY); return r ? JSON.parse(r) : []; };
const saveLegacyWords   = (w) => lsSet(LEGACY_WORDS_KEY, JSON.stringify(w));
const clearLegacyWords  = () => lsDel(LEGACY_WORDS_KEY);

const recordLegacyWord = (lastWords, characterName, scenario, karmaScore) => {
  if (!lastWords) return;
  const words = loadLegacyWords();
  const misinterpretation = karmaScore >= 70
    ? `"${lastWords.slice(0,30)}..." — 이 말을 두고 사람들은 그가 저주를 내렸다고 믿는다.`
    : karmaScore <= 30
    ? `"${lastWords.slice(0,30)}..." — 이 말이 전설이 되어 희망의 구호로 쓰인다.`
    : `"${lastWords.slice(0,30)}..." — 이 말의 뜻을 놓고 학자들이 아직도 논쟁한다.`;
  words.push({ original: lastWords.slice(0, 100), characterName: characterName || "전생의 영웅", scenario: scenario || "", misinterpretation, recordedAt: new Date().toISOString() });
  if (words.length > 10) words.splice(0, words.length - 10);
  saveLegacyWords(words);
};

const getLegacyWords = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadLegacyWords();
};

// ── 99번: 돌연변이 확률 ──
// 같은 종족으로 반복 플레이 시 돌연변이 이벤트 발생. 성공하면 유니크 외형+전용 스킬
const MUTATION_KEY  = "taleforge-mutation";
const loadMutation  = () => { const r = lsGet(MUTATION_KEY); return r ? JSON.parse(r) : {}; };
const saveMutation  = (m) => lsSet(MUTATION_KEY, JSON.stringify(m));
const clearMutation = () => lsDel(MUTATION_KEY);

const MUTATION_DEFS = {
  human:    { threshold:5,  mutation:"반신 각성",      appearance:"눈동자가 금빛으로 변하고 등에서 희미한 빛이 난다.",  skill:"반신의 의지 — 판정 실패를 1회 재도전" },
  elf:      { threshold:4,  mutation:"고대 요정 회귀", appearance:"귀가 더 길어지고 피부에서 별빛이 난다.",              skill:"별의 은총 — 야간 모든 판정 +20" },
  dwarf:    { threshold:4,  mutation:"강철 혈통",       appearance:"피부 일부가 금속처럼 굳어진다.",                     skill:"강철 피부 — 물리 피해 -30%" },
  dragon:   { threshold:3,  mutation:"용신 각성",       appearance:"작은 뿔이 자라고 눈이 세로 동공으로 변한다.",        skill:"용의 숨결 — 화염/냉기 중 선택 방출" },
  demon:    { threshold:3,  mutation:"순수 악마화",     appearance:"날개가 완전히 자라고 검은 오라가 방출된다.",          skill:"악마의 진상 — 한 턴 모든 능력 2배" },
  beastkin: { threshold:4,  mutation:"야수 해방",       appearance:"야수 특성이 강화되어 반야수 형태로 변신 가능.",      skill:"야수 변신 — 전투력 3배, 이성 일시 하락" },
};

const recordRaceForMutation = (race) => {
  if (!race) return;
  const mutation = loadMutation();
  mutation[race] = (mutation[race] || 0) + 1;
  saveMutation(mutation);
  const def = MUTATION_DEFS[race];
  if (def && mutation[race] >= def.threshold) {
    return { mutated: true, race, ...def };
  }
  return { mutated: false, race, count: mutation[race], threshold: def?.threshold };
};

const getMutationStatus = (race) => {
  const mutation = loadMutation();
  if (!race) return mutation;
  const count = mutation[race] || 0;
  const def = MUTATION_DEFS[race];
  if (!def) return null;
  return { race, count, threshold: def.threshold, mutated: count >= def.threshold, ...def };
};

// ── 100번: 어둠의 메아리 ──
// 전생 악행이 다음 회차에 괴담·소문으로 퍼짐. NPC들이 두려워하거나 피함 — 공포 플레이 강화
const DARK_ECHO_KEY  = "taleforge-dark-echo";
const loadDarkEcho   = () => { const r = lsGet(DARK_ECHO_KEY); return r ? JSON.parse(r) : { infamy: 0, rumors: [], fearLevel: 0 }; };
const saveDarkEcho   = (d) => lsSet(DARK_ECHO_KEY, JSON.stringify(d));
const clearDarkEcho  = () => lsDel(DARK_ECHO_KEY);

const DARK_ECHO_RUMORS = [
  { infamyRequired:10,  rumor:"마을에 낯선 이방인이 나타나면 재앙이 따른다는 소문이 돈다." },
  { infamyRequired:25,  rumor:"그 이름만 들어도 아이들이 울음을 그친다는 말이 있다." },
  { infamyRequired:40,  rumor:"죽은 자들이 그의 이름을 저주했다는 이야기가 노래로 남았다." },
  { infamyRequired:60,  rumor:"그가 지나간 자리에는 삼 년간 꽃이 피지 않는다고 한다." },
  { infamyRequired:80,  rumor:"신전의 사제들이 그의 도래를 예언으로 기록해두었다 — 재앙의 전조로." },
  { infamyRequired:100, rumor:"세계 각지의 악인들이 그를 전설로 모시기 시작했다. 악의 왕이 돌아왔다." },
];

const DARK_FEAR_LEVELS = [
  { level:0, label:"무명",         effect:"아직 악명이 없다.",                      npcReaction:"일반 반응" },
  { level:1, label:"불길한 이방인", effect:"일부 NPC가 경계한다.",                   npcReaction:"경계+의심" },
  { level:2, label:"악명 높은 자",  effect:"대부분의 NPC가 먼저 시선을 피한다.",     npcReaction:"회피+공포" },
  { level:3, label:"공포의 전설",   effect:"NPC들이 이름만 들어도 두려워한다.",      npcReaction:"공황+복종" },
  { level:4, label:"살아있는 재앙", effect:"악인들이 복종하고 선인들이 토벌단을 꾼다.", npcReaction:"악당 결집+영웅 적대" },
];

const growDarkEcho = (infamyGain, evilAct) => {
  const de = loadDarkEcho();
  de.infamy = Math.min(100, (de.infamy || 0) + (infamyGain || 5));
  de.fearLevel = Math.min(4, Math.floor((de.infamy || 0) / 25));
  const newRumors = DARK_ECHO_RUMORS.filter(r => (de.infamy||0) >= r.infamyRequired && !de.rumors.find(dr => dr.rumor === r.rumor));
  newRumors.forEach(r => (de.rumors = de.rumors || []).push({ ...r, spreadAt: new Date().toISOString() }));
  if (evilAct) de.lastEvilAct = evilAct;
  saveDarkEcho(de);
  return { ...de, fearData: DARK_FEAR_LEVELS[de.fearLevel] };
};

const getDarkEchoStatus = () => {
  const de = loadDarkEcho();
  return { ...de, fearData: DARK_FEAR_LEVELS[de.fearLevel || 0] };
};


// ══════════════════════════════════════════════════════════════
// 101~130번 환생 누적 시스템
// ══════════════════════════════════════════════════════════════

// ── 101번: 성장 나무 ──
// 회차마다 나무에 가지 하나씩 추가. 특정 가지에 꽃 피면 희귀 이벤트 예고
const GROWTH_TREE_KEY  = "taleforge-growth-tree";
const loadGrowthTree   = () => { const r = lsGet(GROWTH_TREE_KEY); return r ? JSON.parse(r) : { branches: [], blossoms: [], totalBranches: 0 }; };
const saveGrowthTree   = (t) => lsSet(GROWTH_TREE_KEY, JSON.stringify(t));
const clearGrowthTree  = () => lsDel(GROWTH_TREE_KEY);

const TREE_BRANCH_TYPES = [
  { id:"courage",    icon:"🌿", label:"용기의 가지",     bloomAt:3,  event:"역경을 극복하는 희귀 이벤트 예고" },
  { id:"wisdom",     icon:"🍃", label:"지혜의 가지",     bloomAt:5,  event:"고대 지식 획득 이벤트 예고" },
  { id:"bond",       icon:"🌱", label:"인연의 가지",     bloomAt:4,  event:"운명적 재회 이벤트 예고" },
  { id:"sacrifice",  icon:"🌾", label:"희생의 가지",     bloomAt:2,  event:"영웅적 희생 이벤트 예고" },
  { id:"darkness",   icon:"🖤", label:"어둠의 가지",     bloomAt:4,  event:"금기 해금 이벤트 예고" },
  { id:"hope",       icon:"🌸", label:"희망의 가지",     bloomAt:6,  event:"진 엔딩 루트 예고" },
  { id:"power",      icon:"⚡", label:"힘의 가지",       bloomAt:5,  event:"각성 이벤트 예고" },
  { id:"mystery",    icon:"🔮", label:"신비의 가지",     bloomAt:7,  event:"세계의 비밀 공개 이벤트 예고" },
];

const growTreeBranch = (branchType, scenario) => {
  const tree = loadGrowthTree();
  const def = TREE_BRANCH_TYPES.find(b => b.id === branchType) || TREE_BRANCH_TYPES[tree.totalBranches % TREE_BRANCH_TYPES.length];
  const existing = tree.branches.find(b => b.id === def.id);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    if (existing.count >= def.bloomAt && !tree.blossoms.find(bl => bl.id === def.id)) {
      tree.blossoms.push({ ...def, bloomedAt: new Date().toISOString(), scenario });
    }
  } else {
    tree.branches.push({ ...def, count: 1, scenario, addedAt: new Date().toISOString() });
  }
  tree.totalBranches = (tree.totalBranches || 0) + 1;
  saveGrowthTree(tree);
  return tree;
};

const getGrowthTreeStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const tree = loadGrowthTree();
  return { ...tree, nextBlossom: TREE_BRANCH_TYPES.find(b => !tree.blossoms.find(bl => bl.id === b.id)) };
};

// ── 102번: 신격화 루트 ──
// 업보·명성·클리어 횟수 모두 최고치 도달 시 해금. 캐릭터가 신이 되어 이후 회차 타 캐릭터 운명에 개입
const DEIFICATION_KEY  = "taleforge-deification";
const loadDeification  = () => { const r = lsGet(DEIFICATION_KEY); return r ? JSON.parse(r) : { stage: 0, conditions: {}, deified: false, interventions: [] }; };
const saveDeification  = (d) => lsSet(DEIFICATION_KEY, JSON.stringify(d));
const clearDeification = () => lsDel(DEIFICATION_KEY);

const DEIFICATION_CONDITIONS = [
  { id:"karma_pure",    label:"순수한 업보",    desc:"카르마 점수 20 이하 엔딩 5회 이상" },
  { id:"rank_divine",   label:"신급 윤회자",    desc:"윤회 등급 신급 이상 달성" },
  { id:"all_endings",   label:"모든 엔딩 경험", desc:"일반·영웅·비극·히든 엔딩 모두 경험" },
  { id:"century_cycle", label:"백 번의 생",     desc:"100회차 이상 도달" },
  { id:"world_saved",   label:"세계 구원",      desc:"종말 카운터 봉인 3회 이상" },
];

const DEIFICATION_STAGES = [
  { stage:0, icon:"👤", label:"인간",        power:null },
  { stage:1, icon:"⭐", label:"반신",        power:"인간 NPC에게 꿈에서 계시 전달 가능" },
  { stage:2, icon:"🌟", label:"하위신",      power:"소규모 이벤트에 직접 개입 가능" },
  { stage:3, icon:"✨", label:"상위신",      power:"회차 내 운명 분기점 1회 변경 가능" },
  { stage:4, icon:"🌈", label:"주신",        power:"어느 회차에도 현현하여 결정적 개입 가능" },
];

const updateDeification = (conditionId) => {
  const d = loadDeification();
  if (conditionId) d.conditions[conditionId] = true;
  const metCount = Object.values(d.conditions).filter(Boolean).length;
  d.stage = Math.min(4, Math.floor(metCount / 1.25));
  if (metCount >= DEIFICATION_CONDITIONS.length) d.deified = true;
  saveDeification(d);
  return { ...d, stageData: DEIFICATION_STAGES[d.stage], metCount };
};

const addDeificationIntervention = (desc, targetCycle) => {
  const d = loadDeification();
  if (!d.deified) return false;
  d.interventions = d.interventions || [];
  d.interventions.push({ desc, targetCycle, addedAt: new Date().toISOString() });
  saveDeification(d);
  return true;
};

const getDeificationStatus = () => {
  const d = loadDeification();
  const metCount = Object.values(d.conditions).filter(Boolean).length;
  return { ...d, stageData: DEIFICATION_STAGES[d.stage || 0], metCount, totalConditions: DEIFICATION_CONDITIONS.length, conditions: DEIFICATION_CONDITIONS.map(c => ({ ...c, met: !!d.conditions[c.id] })) };
};

// ── 103번: 무한 회귀 자각 ──
// 특정 조건에서 캐릭터 스스로 환생 중임을 인지. AI가 4th wall 느낌으로 반응. 대화 톤 완전히 달라짐
const LOOP_AWARENESS_KEY  = "taleforge-loop-awareness";
const loadLoopAwareness   = () => { const r = lsGet(LOOP_AWARENESS_KEY); return r ? JSON.parse(r) : { aware: false, level: 0, firstAwareAt: null }; };
const saveLoopAwareness   = (l) => lsSet(LOOP_AWARENESS_KEY, JSON.stringify(l));
const clearLoopAwareness  = () => lsDel(LOOP_AWARENESS_KEY);

const AWARENESS_LEVELS = [
  { level:0, label:"무자각",        tone:"일반 서사",          desc:"아직 순환을 인식하지 못한다." },
  { level:1, label:"어렴풋한 의심", tone:"불안한 서사",        desc:"\"왜 이게 익숙하지?\" 수준의 의심." },
  { level:2, label:"부분 자각",     tone:"메타적 서사",        desc:"\"내가... 전에 이걸 겪었다\"를 확신한다." },
  { level:3, label:"완전 자각",     tone:"4th wall 서사",      desc:"순환 자체를 완전히 인식. 나레이터에게 말을 건다." },
  { level:4, label:"초월 자각",     tone:"메타 파괴 서사",     desc:"게임과 현실의 경계를 인식. 최종 진실에 접근한다." },
];

const awakenLoopAwareness = (cycle) => {
  const la = loadLoopAwareness();
  const newLevel = cycle >= 20 ? 4 : cycle >= 15 ? 3 : cycle >= 10 ? 2 : cycle >= 7 ? 1 : 0;
  if (newLevel > (la.level || 0)) {
    la.level = newLevel;
    la.aware = newLevel > 0;
    if (!la.firstAwareAt && newLevel > 0) la.firstAwareAt = new Date().toISOString();
    saveLoopAwareness(la);
  }
  return { ...la, levelData: AWARENESS_LEVELS[la.level || 0] };
};

const getLoopAwareness = () => {
  const cycle = loadCycleCount();
  if (cycle < 7) return null;
  const la = loadLoopAwareness();
  return { ...la, levelData: AWARENESS_LEVELS[la.level || 0] };
};

// ── 104번: 전생 라이벌 성장 ──
// 경쟁했던 NPC가 나 없이도 혼자 성장해서 등장. 내가 강할수록 라이벌도 강해짐
const RIVAL_KEY  = "taleforge-rival";
const loadRivals = () => { const r = lsGet(RIVAL_KEY); return r ? JSON.parse(r) : []; };
const saveRivals = (rv) => lsSet(RIVAL_KEY, JSON.stringify(rv));
const clearRivals= () => lsDel(RIVAL_KEY);

const recordRival = (rivalName, rivalClass, lastPower, scenario) => {
  if (!rivalName) return;
  const rivals = loadRivals();
  const existing = rivals.find(r => r.name === rivalName);
  if (existing) {
    existing.encounters = (existing.encounters || 1) + 1;
    existing.power = Math.min(100, (existing.power || lastPower || 30) + 8);
    existing.evolved = existing.power >= 70;
  } else {
    rivals.push({ name: rivalName, class: rivalClass || "알 수 없음", power: lastPower || 30, encounters: 1, evolved: false, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  if (rivals.length > 3) rivals.sort((a,b) => b.power - a.power).splice(3);
  saveRivals(rivals);
};

const getRivals = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadRivals();
};

// ── 105번: 붉은 실 ──
// 전생에서 가장 강한 인연이 "붉은 실"로 표시. 어느 회차에서든 반드시 만나게 되는 운명 이벤트
const RED_THREAD_KEY  = "taleforge-red-thread";
const loadRedThread   = () => { const r = lsGet(RED_THREAD_KEY); return r ? JSON.parse(r) : null; };
const saveRedThread   = (t) => lsSet(RED_THREAD_KEY, JSON.stringify(t));
const clearRedThread  = () => lsDel(RED_THREAD_KEY);

const RED_THREAD_FATES = [
  { strength:1, desc:"희미한 인연",    meeting:"어딘가 본 것 같은 낯선 이와 스친다.",                                  bond:20 },
  { strength:2, desc:"강한 인연",      meeting:"운명처럼 같은 장소에서 만나게 된다.",                                   bond:40 },
  { strength:3, desc:"불가분의 인연",  meeting:"어떤 상황에서도 같은 편에 서게 된다.",                                  bond:60 },
  { strength:4, desc:"붉은 실의 완성", meeting:"이 사람 없이는 진 엔딩이 열리지 않는다. 반드시 찾아야 한다.",          bond:80 },
];

const setRedThread = (npcName, bondStrength, scenario) => {
  if (!npcName) return;
  const existing = loadRedThread();
  if (existing && existing.bondStrength >= bondStrength) return; // 더 강한 인연만 갱신
  const strength = Math.min(4, Math.floor(bondStrength / 25) + 1);
  saveRedThread({ npcName, bondStrength, strength, fate: RED_THREAD_FATES[strength - 1], scenario: scenario || "", setAt: new Date().toISOString() });
};

const getRedThread = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadRedThread();
};

// ── 106번: 전생 건축물 붕괴 ──
// 내가 세운 건물·조직·국가가 다음 회차에 폐허로 등장. 복원하는 서브퀘스트 발생
const RUINS_KEY  = "taleforge-ruins";
const loadRuins  = () => { const r = lsGet(RUINS_KEY); return r ? JSON.parse(r) : []; };
const saveRuins  = (ru) => lsSet(RUINS_KEY, JSON.stringify(ru));
const clearRuins = () => lsDel(RUINS_KEY);

const RUIN_TYPES = [
  { id:"guild",    icon:"🏛️", name:"길드 폐허",    restoreQuest:"흩어진 길드원을 모아 재건한다.",    reward:"길드 멤버 자동 합류" },
  { id:"castle",   icon:"🏰", name:"성 폐허",      restoreQuest:"성벽을 수리하고 영주권을 주장한다.", reward:"근거지로 사용 가능" },
  { id:"temple",   icon:"⛩️", name:"신전 폐허",    restoreQuest:"신전을 정화하고 신앙을 되살린다.",   reward:"신앙 수치 대폭 상승" },
  { id:"village",  icon:"🏘️", name:"마을 폐허",    restoreQuest:"주민들을 돌아오게 하여 마을을 재건.", reward:"식량·자원 공급처 확보" },
  { id:"library",  icon:"📚", name:"도서관 폐허",  restoreQuest:"흩어진 서적을 모아 도서관을 복원.",   reward:"지식 판정 +20 영구" },
  { id:"port",     icon:"⚓", name:"항구 폐허",    restoreQuest:"부두를 수리하고 상인들을 불러들임.",  reward:"무역 루트 개설" },
];

const recordRuin = (structureType, structureName, scenario) => {
  if (!structureType) return;
  const ruins = loadRuins();
  const def = RUIN_TYPES.find(r => r.id === structureType);
  if (!def) return;
  if (!ruins.find(r => r.id === structureType)) {
    ruins.push({ ...def, originalName: structureName || def.name, scenario: scenario || "", collapsed: true, restored: false, recordedAt: new Date().toISOString() });
  }
  if (ruins.length > 5) ruins.splice(0, ruins.length - 5);
  saveRuins(ruins);
};

const restoreRuin = (structureType) => {
  const ruins = loadRuins();
  const ruin = ruins.find(r => r.id === structureType);
  if (!ruin) return false;
  ruin.restored = true;
  ruin.restoredAt = new Date().toISOString();
  saveRuins(ruins);
  return ruin;
};

const getRuins = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadRuins();
};

// ── 107번: 살의 감지 ──
// 전생에서 암살로 죽은 횟수 누적될수록 뒤통수 공격 사전 감지 확률 상승
const KILL_SENSE_KEY  = "taleforge-kill-sense";
const loadKillSense   = () => { const r = lsGet(KILL_SENSE_KEY); return r ? JSON.parse(r) : { assassinDeaths: 0, level: 0 }; };
const saveKillSense   = (k) => lsSet(KILL_SENSE_KEY, JSON.stringify(k));
const clearKillSense  = () => lsDel(KILL_SENSE_KEY);

const KILL_SENSE_LEVELS = [
  { level:0, deaths:0,  ability:"없음",                               detectChance:0 },
  { level:1, deaths:2,  ability:"뒤통수 공격 감지 (30%)",             detectChance:30 },
  { level:2, deaths:4,  ability:"암살 시도 사전 감지 (55%)",          detectChance:55 },
  { level:3, deaths:7,  ability:"살의 오라 감지 (75%)",               detectChance:75 },
  { level:4, deaths:10, ability:"완전한 살의 감지 — 기습 면역 (95%)", detectChance:95 },
];

const recordAssassinDeath = () => {
  const ks = loadKillSense();
  ks.assassinDeaths = (ks.assassinDeaths || 0) + 1;
  ks.level = KILL_SENSE_LEVELS.reduce((acc, l) => ks.assassinDeaths >= l.deaths ? l.level : acc, 0);
  saveKillSense(ks);
  return ks;
};

const getKillSenseStatus = () => {
  const ks = loadKillSense();
  return { ...ks, levelData: KILL_SENSE_LEVELS[ks.level || 0] };
};

// ── 108번: 전생 원한꽃 ──
// 나를 죽인 적의 이름이 꽃으로 피어남. 복수하면 강력한 버프, 그냥 두면 저주로 변함
const GRUDGE_FLOWER_KEY  = "taleforge-grudge-flower";
const loadGrudgeFlowers  = () => { const r = lsGet(GRUDGE_FLOWER_KEY); return r ? JSON.parse(r) : []; };
const saveGrudgeFlowers  = (f) => lsSet(GRUDGE_FLOWER_KEY, JSON.stringify(f));
const clearGrudgeFlowers = () => lsDel(GRUDGE_FLOWER_KEY);

const GRUDGE_FLOWER_STATES = [
  { state:"blooming", icon:"🌹", label:"복수의 꽃",   desc:"꽃이 활짝 피었다. 복수의 의지가 불타오른다.",      effect:"대상과의 전투 판정 +20" },
  { state:"withering",icon:"🥀", label:"시들어가는 꽃", desc:"너무 오래 두었다. 꽃이 시들기 시작한다.",         effect:"판정 보너스 감소 중" },
  { state:"cursed",   icon:"💀", label:"저주의 꽃",   desc:"꽃이 썩어 저주로 변했다. 자신에게 해가 된다.",     effect:"모든 판정 -5 페널티" },
  { state:"avenged",  icon:"🌸", label:"성취된 복수", desc:"복수를 이뤘다. 꽃이 아름답게 산화한다.",           effect:"복수 완수 보너스 획득" },
];

const bloomGrudgeFlower = (enemyName, scenario) => {
  if (!enemyName) return;
  const flowers = loadGrudgeFlowers();
  if (!flowers.find(f => f.enemyName === enemyName)) {
    flowers.push({ enemyName, state: "blooming", scenario: scenario || "", bloomedAt: new Date().toISOString(), turnsWithered: 0 });
  }
  if (flowers.length > 5) flowers.splice(0, flowers.length - 5);
  saveGrudgeFlowers(flowers);
};

const avengeGrudgeFlower = (enemyName) => {
  const flowers = loadGrudgeFlowers();
  const flower = flowers.find(f => f.enemyName === enemyName);
  if (flower) { flower.state = "avenged"; flower.avengedAt = new Date().toISOString(); saveGrudgeFlowers(flowers); return true; }
  return false;
};

const witherGrudgeFlowers = () => {
  const flowers = loadGrudgeFlowers();
  flowers.forEach(f => {
    if (f.state === "blooming") { f.turnsWithered = (f.turnsWithered || 0) + 1; if (f.turnsWithered >= 3) f.state = "withering"; }
    else if (f.state === "withering") { f.turnsWithered = (f.turnsWithered || 0) + 1; if (f.turnsWithered >= 6) f.state = "cursed"; }
  });
  saveGrudgeFlowers(flowers);
};

const getGrudgeFlowers = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadGrudgeFlowers().map(f => ({ ...f, stateData: GRUDGE_FLOWER_STATES.find(s => s.state === f.state) }));
};

// ── 109번: 불운의 회차 ──
// 특정 회차에서 판정이 계속 낮게 나오는 저주 발동. 역이용해 클리어하면 전설 보상
const CURSED_CYCLE_KEY  = "taleforge-cursed-cycle";
const loadCursedCycle   = () => { const r = lsGet(CURSED_CYCLE_KEY); return r ? JSON.parse(r) : { cursedCycles: [], currentlyCursed: false, overcame: 0 }; };
const saveCursedCycle   = (c) => lsSet(CURSED_CYCLE_KEY, JSON.stringify(c));
const clearCursedCycle  = () => lsDel(CURSED_CYCLE_KEY);

const checkCursedCycle = (cycle) => {
  // 7의 배수 또는 13의 배수 회차가 불운의 회차
  const isCursed = (cycle % 7 === 0 || cycle % 13 === 0) && cycle > 0;
  const cc = loadCursedCycle();
  cc.currentlyCursed = isCursed;
  if (isCursed && !cc.cursedCycles.includes(cycle)) cc.cursedCycles.push(cycle);
  saveCursedCycle(cc);
  return isCursed;
};

const overcameCursedCycle = (cycle) => {
  const cc = loadCursedCycle();
  if (!cc.cursedCycles.includes(cycle)) return false;
  cc.overcame = (cc.overcame || 0) + 1;
  cc.lastOvercame = cycle;
  saveCursedCycle(cc);
  return true;
};

const getCursedCycleStatus = () => {
  const cycle = loadCycleCount();
  const cc = loadCursedCycle();
  const isCursed = checkCursedCycle(cycle);
  return { ...cc, isCursed, legendaryReward: cc.overcame >= 3 ? "저주 극복자 칭호 + 전설급 아티팩트" : null };
};

// ── 110번: 자석 운명 ──
// 전생에서 피하려 했던 사건일수록 다음 회차에 더 강하게 끌려옴
const FATE_MAGNET_KEY  = "taleforge-fate-magnet";
const loadFateMagnet   = () => { const r = lsGet(FATE_MAGNET_KEY); return r ? JSON.parse(r) : { avoided: [], magnetStrength: 0 }; };
const saveFateMagnet   = (m) => lsSet(FATE_MAGNET_KEY, JSON.stringify(m));
const clearFateMagnet  = () => lsDel(FATE_MAGNET_KEY);

const recordAvoidedFate = (eventType, scenario) => {
  if (!eventType) return;
  const fm = loadFateMagnet();
  fm.avoided = fm.avoided || [];
  const existing = fm.avoided.find(a => a.type === eventType);
  if (existing) {
    existing.avoidCount = (existing.avoidCount || 1) + 1;
    existing.magnetPull = Math.min(100, (existing.magnetPull || 10) + 15);
  } else {
    fm.avoided.push({ type: eventType, avoidCount: 1, magnetPull: 10, scenario: scenario || "", firstAvoided: new Date().toISOString() });
  }
  fm.magnetStrength = Math.min(100, fm.avoided.reduce((sum, a) => sum + (a.magnetPull || 0), 0) / fm.avoided.length);
  saveFateMagnet(fm);
};

const getFateMagnet = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const fm = loadFateMagnet();
  const strongestPull = fm.avoided && fm.avoided.length > 0 ? fm.avoided.sort((a,b) => b.magnetPull - a.magnetPull)[0] : null;
  return { ...fm, strongestPull };
};

// ── 111번: 기억의 홍수 ──
// 고회차에서 전생 기억이 한꺼번에 쏟아지는 이벤트. 정신력에 따라 각성 or 발광
const MEMORY_FLOOD_KEY  = "taleforge-memory-flood";
const loadMemoryFlood   = () => { const r = lsGet(MEMORY_FLOOD_KEY); return r ? JSON.parse(r) : { floodCount: 0, lastResult: null }; };
const saveMemoryFlood   = (f) => lsSet(MEMORY_FLOOD_KEY, JSON.stringify(f));
const clearMemoryFlood  = () => lsDel(MEMORY_FLOOD_KEY);

const triggerMemoryFlood = (willStat, cycle) => {
  if (cycle < 10) return null;
  const mf = loadMemoryFlood();
  const result = willStat >= 70 ? "awakening" : willStat >= 40 ? "partial" : "madness";
  const outcomes = {
    awakening: { icon:"✨", label:"완전 각성",   effect:"모든 전생 기억이 선명해진다. 이번 회차 판정 +15 전체.", mentalCost:0 },
    partial:   { icon:"🌊", label:"부분 각성",   effect:"중요 기억만 떠오른다. 핵심 정보 3가지 획득.",          mentalCost:15 },
    madness:   { icon:"🌀", label:"정신 붕괴 위기", effect:"너무 많은 기억이 한꺼번에. 한 턴 행동 불능 위험.",  mentalCost:30 },
  };
  mf.floodCount = (mf.floodCount || 0) + 1;
  mf.lastResult = { result, outcome: outcomes[result], triggeredAt: new Date().toISOString(), cycle };
  saveMemoryFlood(mf);
  return mf.lastResult;
};

const getMemoryFloodStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 10) return null;
  return loadMemoryFlood();
};

// ── 112번: 회전목마 NPC ──
// 매 회차마다 다른 역할로 등장하는 고정 NPC 1명. 상인·보스·구원자 등 랜덤
const CAROUSEL_NPC_KEY  = "taleforge-carousel-npc";
const loadCarouselNPC   = () => { const r = lsGet(CAROUSEL_NPC_KEY); return r ? JSON.parse(r) : { npcName: null, roles: [], currentRole: null }; };
const saveCarouselNPC   = (n) => lsSet(CAROUSEL_NPC_KEY, JSON.stringify(n));
const clearCarouselNPC  = () => lsDel(CAROUSEL_NPC_KEY);

const CAROUSEL_ROLES = [
  { role:"merchant",  icon:"💰", label:"신비한 상인",   firstMeet:"\"어서오세요. 당신이 찾는 게 뭔지는 이미 알고 있죠.\"" },
  { role:"guardian",  icon:"🛡️", label:"정체불명의 수호자", firstMeet:"위기의 순간, 그가 나타나 당신을 구한다." },
  { role:"villain",   icon:"😈", label:"이번 회차의 악당", firstMeet:"그가 이번엔 당신의 적으로 서 있다." },
  { role:"mentor",    icon:"🧙", label:"스승",           firstMeet:"\"내가 가르쳐줄 수 있는 건 딱 하나야.\"" },
  { role:"trickster", icon:"🃏", label:"트릭스터",       firstMeet:"\"이번엔 어떤 역할을 맡았는지 궁금하지 않아?\"" },
  { role:"sacrifice",  icon:"🕯️", label:"희생자",        firstMeet:"그는 이번 회차에서 당신을 위해 죽을 운명이다." },
  { role:"wanderer",  icon:"🌍", label:"떠돌이",          firstMeet:"\"세계가 몇 번이나 바뀌어도 여전히 길 위에 있군.\"" },
];

const assignCarouselRole = (npcName, cycle) => {
  const cn = loadCarouselNPC();
  if (!cn.npcName && npcName) cn.npcName = npcName;
  const roleIdx = cycle % CAROUSEL_ROLES.length;
  const role = CAROUSEL_ROLES[roleIdx];
  cn.currentRole = { ...role, cycle, assignedAt: new Date().toISOString() };
  cn.roles = cn.roles || [];
  cn.roles.push({ ...role, cycle });
  if (cn.roles.length > 20) cn.roles.splice(0, cn.roles.length - 20);
  saveCarouselNPC(cn);
  return role;
};

const getCarouselNPC = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const cn = loadCarouselNPC();
  if (!cn.currentRole) assignCarouselRole(null, cycle);
  return loadCarouselNPC();
};

// ── 113번: 운명의 덫 ──
// 특정 패턴으로 반복 행동하면 다음 회차에 그 패턴을 노린 함정이 세팅됨
const FATE_TRAP_KEY  = "taleforge-fate-trap";
const loadFateTraps  = () => { const r = lsGet(FATE_TRAP_KEY); return r ? JSON.parse(r) : { patterns: {}, activeTraps: [] }; };
const saveFateTraps  = (t) => lsSet(FATE_TRAP_KEY, JSON.stringify(t));
const clearFateTraps = () => lsDel(FATE_TRAP_KEY);

const TRAP_PATTERNS = [
  { id:"always_attack",  label:"항상 정면 돌파",  trap:"이번 회차 정면 루트에 강력한 복병 배치" },
  { id:"always_stealth", label:"항상 은신 우선",  trap:"은신 탐지 NPC가 요소요소 배치됨" },
  { id:"always_trust",   label:"항상 NPC 신뢰",  trap:"가장 믿음직스러운 NPC가 배신자" },
  { id:"always_solo",    label:"항상 단독 행동",  trap:"혼자선 절대 못 넘는 장애물 추가" },
  { id:"always_flee",    label:"항상 도망 선택",  trap:"도주 루트가 모두 막혀있음" },
  { id:"always_rich",    label:"항상 돈 우선",    trap:"돈 관련 함정·사기꾼 집중 등장" },
];

const recordActionPattern = (patternId) => {
  if (!patternId) return;
  const ft = loadFateTraps();
  ft.patterns = ft.patterns || {};
  ft.patterns[patternId] = (ft.patterns[patternId] || 0) + 1;
  if (ft.patterns[patternId] >= 3) {
    const trap = TRAP_PATTERNS.find(p => p.id === patternId);
    if (trap && !ft.activeTraps.find(t => t.id === patternId)) {
      ft.activeTraps = ft.activeTraps || [];
      ft.activeTraps.push({ ...trap, activatedAt: new Date().toISOString() });
    }
  }
  saveFateTraps(ft);
};

const getFateTraps = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadFateTraps();
};

// ── 114번: 정신 오염 ──
// 고회차일수록 현재와 과거를 혼동하는 이벤트 발생. 치료 안 하면 행동 불능
const MENTAL_CORRUPTION_KEY  = "taleforge-mental-corruption";
const loadMentalCorruption   = () => { const r = lsGet(MENTAL_CORRUPTION_KEY); return r ? JSON.parse(r) : { level: 0, symptoms: [], cured: 0 }; };
const saveMentalCorruption   = (m) => lsSet(MENTAL_CORRUPTION_KEY, JSON.stringify(m));
const clearMentalCorruption  = () => lsDel(MENTAL_CORRUPTION_KEY);

const CORRUPTION_LEVELS = [
  { level:0, label:"맑음",           threshold:0,  symptom:null,                                    penalty:null },
  { level:1, label:"경미한 혼란",    threshold:15, symptom:"가끔 전생과 현재를 혼동한다.",          penalty:"특정 판정 -5" },
  { level:2, label:"중간 오염",      threshold:30, symptom:"현재 NPC를 전생 NPC로 착각하는 일이 잦다.", penalty:"NPC 대화 판정 -10" },
  { level:3, label:"심한 오염",      threshold:50, symptom:"전투 중 환각이 보인다.",                 penalty:"전투 판정 -15, 가끔 행동 불능" },
  { level:4, label:"위험 수준",      threshold:70, symptom:"현실과 과거 구분이 거의 불가능하다.",   penalty:"모든 판정 -20, 치료 필수" },
  { level:5, label:"정신 붕괴",      threshold:90, symptom:"완전한 정신 붕괴. 즉각 치료하지 않으면 게임오버.", penalty:"행동 불능" },
];

const growMentalCorruption = (cycle) => {
  const mc = loadMentalCorruption();
  const gain = Math.max(0, cycle - 10) * 2; // 10회차 이후부터 누적
  mc.level = Math.min(5, CORRUPTION_LEVELS.reduce((acc, l) => (mc.level || 0) * 10 >= l.threshold ? l.level : acc, 0));
  if (gain > 0) mc.symptoms = mc.symptoms || [];
  saveMentalCorruption(mc);
  return mc;
};

const cureMentalCorruption = (amount) => {
  const mc = loadMentalCorruption();
  mc.level = Math.max(0, (mc.level || 0) - (amount || 1));
  mc.cured = (mc.cured || 0) + 1;
  saveMentalCorruption(mc);
};

const getMentalCorruption = () => {
  const cycle = loadCycleCount();
  if (cycle < 10) return null;
  const mc = loadMentalCorruption();
  return { ...mc, levelData: CORRUPTION_LEVELS[mc.level || 0] };
};

// ── 115번: 전생 영화관 ──
// 특정 장소에서 전생의 명장면을 영상처럼 재생. 해당 상황 관련 스킬 숙련도 상승
const CINEMA_KEY  = "taleforge-cinema";
const loadCinema  = () => { const r = lsGet(CINEMA_KEY); return r ? JSON.parse(r) : { screenings: [], totalViewed: 0 }; };
const saveCinema  = (c) => lsSet(CINEMA_KEY, JSON.stringify(c));
const clearCinema = () => lsDel(CINEMA_KEY);

const CINEMA_SCENES = [
  { id:"great_battle",   icon:"⚔️", title:"전설의 전투",    skill:"전투 숙련도 +20",       trigger:"전장·결투 장소" },
  { id:"grand_speech",   icon:"🎤", title:"운명의 연설",    skill:"웅변 숙련도 +20",       trigger:"광장·집회 장소" },
  { id:"secret_meeting", icon:"🤫", title:"비밀 회동",      skill:"잠입 숙련도 +20",       trigger:"어두운 장소·지하" },
  { id:"healing_moment", icon:"💚", title:"치유의 순간",    skill:"치유 숙련도 +20",       trigger:"신전·치료소" },
  { id:"forbidden_magic",icon:"🔮", title:"금기의 마법",    skill:"마법 숙련도 +20",       trigger:"마법진·연구실" },
  { id:"last_stand",     icon:"🌅", title:"마지막 사수",    skill:"의지력 숙련도 +20",     trigger:"막다른 곳·절벽" },
  { id:"discovery",      icon:"💡", title:"진실의 발견",    skill:"탐색 숙련도 +20",       trigger:"도서관·유적" },
];

const viewCinemaScene = (sceneId, location) => {
  const cinema = loadCinema();
  const scene = CINEMA_SCENES.find(s => s.id === sceneId) || CINEMA_SCENES[cinema.totalViewed % CINEMA_SCENES.length];
  cinema.screenings = cinema.screenings || [];
  cinema.screenings.push({ ...scene, location: location || "전생의 기억 속", viewedAt: new Date().toISOString() });
  cinema.totalViewed = (cinema.totalViewed || 0) + 1;
  if (cinema.screenings.length > 10) cinema.screenings.splice(0, cinema.screenings.length - 10);
  saveCinema(cinema);
  return scene;
};

const getCinemaStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return { ...loadCinema(), scenes: CINEMA_SCENES };
};

// ── 116번: 쌍둥이 영혼 ──
// 특정 조건에서 평행 자아와 영혼 연결. 서로의 스킬 1개씩 공유
const TWIN_SOUL_KEY  = "taleforge-twin-soul";
const loadTwinSoul   = () => { const r = lsGet(TWIN_SOUL_KEY); return r ? JSON.parse(r) : { connected: false, partnerName: null, sharedSkills: [], connectionStrength: 0 }; };
const saveTwinSoul   = (t) => lsSet(TWIN_SOUL_KEY, JSON.stringify(t));
const clearTwinSoul  = () => lsDel(TWIN_SOUL_KEY);

const connectTwinSoul = (partnerName, partnerSkill, mySkill) => {
  if (!partnerName) return;
  const ts = loadTwinSoul();
  ts.connected = true;
  ts.partnerName = partnerName;
  ts.connectionStrength = Math.min(100, (ts.connectionStrength || 0) + 20);
  ts.sharedSkills = ts.sharedSkills || [];
  if (partnerSkill && !ts.sharedSkills.find(s => s.skill === partnerSkill)) {
    ts.sharedSkills.push({ skill: partnerSkill, from: partnerName, sharedAt: new Date().toISOString() });
  }
  if (mySkill) ts.gaveSkill = mySkill;
  saveTwinSoul(ts);
};

const getTwinSoul = () => {
  const cycle = loadCycleCount();
  if (cycle < 5) return null;
  return loadTwinSoul();
};

// ── 117번: 살수 명단 ──
// 전생에서 처치한 목표들의 명단 누적. 후손이 다음 회차에 복수자로 등장
const KILL_LIST_KEY  = "taleforge-kill-list";
const loadKillList   = () => { const r = lsGet(KILL_LIST_KEY); return r ? JSON.parse(r) : []; };
const saveKillList   = (k) => lsSet(KILL_LIST_KEY, JSON.stringify(k));
const clearKillList  = () => lsDel(KILL_LIST_KEY);

const addToKillList = (targetName, targetRole, scenario) => {
  if (!targetName) return;
  const list = loadKillList();
  const existing = list.find(l => l.name === targetName);
  if (existing) { existing.kills = (existing.kills || 1) + 1; }
  else { list.push({ name: targetName, role: targetRole || "적", kills: 1, scenario: scenario || "", hasDescendant: Math.random() > 0.5, addedAt: new Date().toISOString() }); }
  if (list.length > 20) list.splice(0, list.length - 20);
  saveKillList(list);
};

const getKillList = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  const list = loadKillList();
  const avengers = list.filter(l => l.hasDescendant);
  return { list, avengers };
};

// ── 118번: 기억 경매 ──
// 특정 NPC가 전생 기억을 사고파는 이벤트. 기억 팔면 스탯·골드 획득 대신 해당 경험 소멸
const MEMORY_AUCTION_KEY  = "taleforge-memory-auction";
const loadMemoryAuction   = () => { const r = lsGet(MEMORY_AUCTION_KEY); return r ? JSON.parse(r) : { sold: [], bought: [], balance: 0 }; };
const saveMemoryAuction   = (a) => lsSet(MEMORY_AUCTION_KEY, JSON.stringify(a));
const clearMemoryAuction  = () => lsDel(MEMORY_AUCTION_KEY);

const AUCTIONABLE_MEMORIES = [
  { id:"first_love",   label:"첫사랑의 기억",    sellPrice:"골드 500 + CHA +5", cost:"로맨스 계통 판정 -10 영구" },
  { id:"worst_defeat", label:"최악의 패배 기억", sellPrice:"STR +8 즉시",       cost:"패배 공포 트라우마 소멸" },
  { id:"childhood",    label:"행복한 어린 시절", sellPrice:"운 +10 영구",       cost:"낙관적 판단력 영구 감소" },
  { id:"best_victory", label:"최고의 승리 기억", sellPrice:"골드 1000",         cost:"승리 감각 둔화, 전투 쾌감 감소" },
  { id:"true_friend",  label:"진정한 우정의 기억", sellPrice:"WIL +5 영구",    cost:"우정 관련 NPC 신뢰 감소" },
];

const sellMemory = (memoryId) => {
  const ma = loadMemoryAuction();
  const mem = AUCTIONABLE_MEMORIES.find(m => m.id === memoryId);
  if (!mem) return false;
  ma.sold = ma.sold || [];
  ma.sold.push({ ...mem, soldAt: new Date().toISOString() });
  ma.balance = (ma.balance || 0) + 1;
  saveMemoryAuction(ma);
  return mem;
};

const getMemoryAuction = () => {
  const cycle = loadCycleCount();
  if (cycle < 3) return null;
  const ma = loadMemoryAuction();
  const available = AUCTIONABLE_MEMORIES.filter(m => !ma.sold.find(s => s.id === m.id));
  return { ...ma, available };
};

// ── 119번: 인연 나무 ──
// 만난 NPC 수·관계 깊이에 따라 나무 성장. 잎사귀 많을수록 사회적 스킬 보너스
const BOND_TREE_KEY  = "taleforge-bond-tree";
const loadBondTree   = () => { const r = lsGet(BOND_TREE_KEY); return r ? JSON.parse(r) : { leaves: 0, deepBonds: 0, socialBonus: 0 }; };
const saveBondTree   = (t) => lsSet(BOND_TREE_KEY, JSON.stringify(t));
const clearBondTree  = () => lsDel(BOND_TREE_KEY);

const growBondTree = (npcCount, deepBondCount) => {
  const bt = loadBondTree();
  bt.leaves = (bt.leaves || 0) + (npcCount || 1);
  bt.deepBonds = (bt.deepBonds || 0) + (deepBondCount || 0);
  bt.socialBonus = Math.min(50, Math.floor((bt.leaves || 0) / 10) * 3 + (bt.deepBonds || 0) * 2);
  saveBondTree(bt);
  return bt;
};

const getBondTreeStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const bt = loadBondTree();
  const stage = bt.leaves >= 100 ? "거대한 나무" : bt.leaves >= 50 ? "성숙한 나무" : bt.leaves >= 20 ? "자라는 나무" : "새싹";
  return { ...bt, stage, icon: bt.leaves >= 100 ? "🌳" : bt.leaves >= 50 ? "🌲" : bt.leaves >= 20 ? "🌿" : "🌱" };
};

// ── 120번: 사이버 각인 (사이버펑크 전용) ──
// 전생 임플란트 데이터가 DNA에 각인. 다음 회차 장착 비용 50% 할인
const CYBER_IMPRINT_KEY  = "taleforge-cyber-imprint";
const loadCyberImprint   = () => { const r = lsGet(CYBER_IMPRINT_KEY); return r ? JSON.parse(r) : { imprints: [], discount: 0 }; };
const saveCyberImprint   = (c) => lsSet(CYBER_IMPRINT_KEY, JSON.stringify(c));
const clearCyberImprint  = () => lsDel(CYBER_IMPRINT_KEY);

const CYBER_IMPLANTS = [
  { id:"neural_link",  icon:"🧠", name:"신경 링크",    bonus:"해킹 판정 +20, AI 대화 가능" },
  { id:"arm_blade",    icon:"⚔️", name:"팔 블레이드",  bonus:"근접 전투 +15, 은닉 무기" },
  { id:"eye_scanner",  icon:"👁️", name:"스캐너 눈",    bonus:"대상 분석 즉시, 약점 파악" },
  { id:"speed_legs",   icon:"🦿", name:"가속 다리",    bonus:"이동 속도 +30, 도주 판정 +20" },
  { id:"shield_gen",   icon:"🛡️", name:"실드 발생기",  bonus:"총기 피해 -30%, 물리 방어 상승" },
];

const recordCyberImprint = (implantId, scenario) => {
  if (!implantId) return;
  const ci = loadCyberImprint();
  const def = CYBER_IMPLANTS.find(i => i.id === implantId);
  if (!def) return;
  if (!ci.imprints.find(i => i.id === implantId)) {
    ci.imprints.push({ ...def, scenario: scenario || "", imprintedAt: new Date().toISOString() });
    ci.discount = Math.min(75, (ci.discount || 0) + 10);
  }
  saveCyberImprint(ci);
};

const getCyberImprint = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadCyberImprint();
};

// ── 121번: 검귀 빙의 (무협 전용) ──
// 전생 절명 직전 극한의 무공이 영혼에 새겨짐. 위기 상황에서 전생의 나가 자동 발동
const SWORD_GHOST_KEY  = "taleforge-sword-ghost";
const loadSwordGhost   = () => { const r = lsGet(SWORD_GHOST_KEY); return r ? JSON.parse(r) : { techniques: [], possessionCount: 0, awakeLevel: 0 }; };
const saveSwordGhost   = (g) => lsSet(SWORD_GHOST_KEY, JSON.stringify(g));
const clearSwordGhost  = () => lsDel(SWORD_GHOST_KEY);

const SWORD_TECHNIQUES = [
  { id:"killing_edge",    name:"살인검",     power:"적 HP 30% 즉시 감소",        condition:"HP 20% 이하" },
  { id:"wind_step",       name:"풍뢰보",     power:"전투 이탈 확정 성공",         condition:"포위 상황" },
  { id:"iron_defense",    name:"철벽방어",   power:"다음 3회 피해 무효",          condition:"연속 피격" },
  { id:"soul_slash",      name:"혼절검",     power:"대상 정신력 공격, 혼절 확률", condition:"정신 전투" },
  { id:"final_form",      name:"절명일격",   power:"현재 HP 비례 최대 피해",      condition:"생사의 기로" },
];

const recordSwordTechnique = (techniqueId, scenario) => {
  if (!techniqueId) return;
  const sg = loadSwordGhost();
  const def = SWORD_TECHNIQUES.find(t => t.id === techniqueId);
  if (!def || sg.techniques.find(t => t.id === techniqueId)) return;
  sg.techniques.push({ ...def, scenario: scenario || "", learnedAt: new Date().toISOString() });
  sg.awakeLevel = Math.min(5, sg.techniques.length);
  saveSwordGhost(sg);
};

const triggerSwordGhost = () => {
  const sg = loadSwordGhost();
  if (!sg.techniques.length) return null;
  sg.possessionCount = (sg.possessionCount || 0) + 1;
  const technique = sg.techniques[sg.possessionCount % sg.techniques.length];
  saveSwordGhost(sg);
  return technique;
};

const getSwordGhost = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadSwordGhost();
};

// ── 122번: 왕국 유산 (중세 전용) ──
// 전생에서 세운 왕국·기사단이 역사로 기록됨. 후예 NPC가 나를 선조로 모심
const KINGDOM_KEY  = "taleforge-kingdom";
const loadKingdom  = () => { const r = lsGet(KINGDOM_KEY); return r ? JSON.parse(r) : { founded: [], legacy: 0 }; };
const saveKingdom  = (k) => lsSet(KINGDOM_KEY, JSON.stringify(k));
const clearKingdom = () => lsDel(KINGDOM_KEY);

const KINGDOM_TYPES = [
  { id:"kingdom",   icon:"👑", name:"왕국",       legacy:30, descendantTitle:"왕가의 후예",  boon:"귀족 NPC 자동 호감, 성 접근 가능" },
  { id:"knighthood",icon:"⚔️", name:"기사단",     legacy:20, descendantTitle:"기사단의 후예", boon:"기사 NPC 동료 합류 확률 상승" },
  { id:"merchant_guild",icon:"💰",name:"상인 연맹",legacy:15, descendantTitle:"연맹의 후예",  boon:"거래 가격 -25%, 상인 정보망" },
  { id:"mage_tower", icon:"🗼", name:"마법탑",     legacy:25, descendantTitle:"마법탑 계승자",boon:"마법 관련 NPC 즉시 신뢰, 고급 마법 열람" },
  { id:"holy_order", icon:"✝️", name:"성기사단",   legacy:25, descendantTitle:"성인의 후예",  boon:"신성 관련 판정 +15, 악마 퇴치 권한" },
];

const foundKingdom = (kingdomType, kingdomName, scenario) => {
  if (!kingdomType) return;
  const k = loadKingdom();
  const def = KINGDOM_TYPES.find(t => t.id === kingdomType);
  if (!def) return;
  if (!k.founded.find(f => f.id === kingdomType)) {
    k.founded.push({ ...def, kingdomName: kingdomName || def.name, scenario: scenario || "", foundedAt: new Date().toISOString() });
    k.legacy = (k.legacy || 0) + def.legacy;
  }
  saveKingdom(k);
};

const getKingdomLegacy = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const k = loadKingdom();
  if (!k.founded.length) return null;
  return k;
};

// ── 123번: 루프 자각자 길드 ──
// 여러 회차를 거친 환생자 NPC들이 모인 비밀 길드. 가입하면 메타 정보 공유, 거절하면 적대
const LOOPERS_GUILD_KEY  = "taleforge-loopers-guild";
const loadLoopersGuild   = () => { const r = lsGet(LOOPERS_GUILD_KEY); return r ? JSON.parse(r) : { status: "unknown", joinedAt: null, rank: 0, knowledgeShared: [] }; };
const saveLoopersGuild   = (g) => lsSet(LOOPERS_GUILD_KEY, JSON.stringify(g));
const clearLoopersGuild  = () => lsDel(LOOPERS_GUILD_KEY);

const GUILD_RANKS = [
  { rank:0, label:"신입",    knowledge:"루프 기초 — 환생 시스템 개요" },
  { rank:1, label:"견습",    knowledge:"패턴 공유 — 반복되는 이벤트 목록" },
  { rank:2, label:"정회원",  knowledge:"세계 비밀 — 대미스터리 힌트 3개" },
  { rank:3, label:"장로",    knowledge:"루프 탈출 조건 — 해탈 엔딩 힌트" },
  { rank:4, label:"수장 대리", knowledge:"감시자의 정체 — 진짜 세계의 지배자" },
];

const joinLoopersGuild = () => {
  const g = loadLoopersGuild();
  if (g.status === "member") return g;
  g.status = "member";
  g.joinedAt = new Date().toISOString();
  g.rank = 0;
  g.knowledgeShared = [GUILD_RANKS[0].knowledge];
  saveLoopersGuild(g);
  return g;
};

const rejectLoopersGuild = () => {
  const g = loadLoopersGuild();
  g.status = "hostile";
  saveLoopersGuild(g);
};

const rankUpGuild = () => {
  const g = loadLoopersGuild();
  if (g.status !== "member" || (g.rank || 0) >= 4) return false;
  g.rank = (g.rank || 0) + 1;
  g.knowledgeShared = g.knowledgeShared || [];
  g.knowledgeShared.push(GUILD_RANKS[g.rank].knowledge);
  saveLoopersGuild(g);
  return GUILD_RANKS[g.rank];
};

const getLoopersGuild = () => {
  const cycle = loadCycleCount();
  if (cycle < 5) return null;
  const g = loadLoopersGuild();
  return { ...g, rankData: GUILD_RANKS[g.rank || 0], ranks: GUILD_RANKS };
};

// ── 124번: 사신과의 거래 ──
// 죽을 때마다 사신과 협상. 목숨 대신 기억·스킬·인연 중 하나를 내놓으면 부활. 너무 많이 거래하면 빚 회수
const DEATH_DEALER_KEY  = "taleforge-death-dealer";
const loadDeathDealer   = () => { const r = lsGet(DEATH_DEALER_KEY); return r ? JSON.parse(r) : { deals: [], debt: 0, debtCollected: false }; };
const saveDeathDealer   = (d) => lsSet(DEATH_DEALER_KEY, JSON.stringify(d));
const clearDeathDealer  = () => lsDel(DEATH_DEALER_KEY);

const DEATH_DEAL_OPTIONS = [
  { id:"memory",    sacrifice:"기억 일부 소멸",  grant:"즉시 부활 + HP 50% 회복" },
  { id:"skill",     sacrifice:"스킬 1개 망각",   grant:"즉시 부활 + HP 30% 회복" },
  { id:"bond",      sacrifice:"인연 1명 기억 소멸", grant:"즉시 부활 + HP 70% 회복" },
  { id:"lifespan",  sacrifice:"다음 회차 수명 감소", grant:"즉시 부활 + HP 100% 회복" },
];

const makeDealWithDeath = (dealType) => {
  const dd = loadDeathDealer();
  const deal = DEATH_DEAL_OPTIONS.find(d => d.id === dealType);
  if (!deal) return false;
  dd.deals = dd.deals || [];
  dd.deals.push({ ...deal, dealDate: new Date().toISOString() });
  dd.debt = (dd.debt || 0) + 1;
  if (dd.debt >= 7) dd.debtCollected = true; // 7번 이상 거래 시 빚 회수
  saveDeathDealer(dd);
  return { ...deal, totalDebt: dd.debt, debtWarning: dd.debt >= 5 };
};

const getDeathDealerStatus = () => {
  const dd = loadDeathDealer();
  return { ...dd, options: DEATH_DEAL_OPTIONS, dangerLevel: dd.debt >= 7 ? "빚 회수 위험" : dd.debt >= 5 ? "위험" : dd.debt >= 3 ? "주의" : "안전" };
};

// ── 125번: 역할 반전 ──
// 특정 회차에서 내가 처치한 보스의 입장이 되어 플레이. 성공하면 해당 보스의 모든 스킬 습득
const ROLE_REVERSAL_KEY  = "taleforge-role-reversal";
const loadRoleReversal   = () => { const r = lsGet(ROLE_REVERSAL_KEY); return r ? JSON.parse(r) : { available: [], completed: [] }; };
const saveRoleReversal   = (rv) => lsSet(ROLE_REVERSAL_KEY, JSON.stringify(rv));
const clearRoleReversal  = () => lsDel(ROLE_REVERSAL_KEY);

const addRoleReversal = (bossName, bossSkills, scenario) => {
  if (!bossName) return;
  const rv = loadRoleReversal();
  rv.available = rv.available || [];
  if (!rv.available.find(r => r.bossName === bossName) && !rv.completed.find(r => r.bossName === bossName)) {
    rv.available.push({ bossName, skills: bossSkills || [], scenario: scenario || "", addedAt: new Date().toISOString() });
  }
  if (rv.available.length > 5) rv.available.splice(0, rv.available.length - 5);
  saveRoleReversal(rv);
};

const completeRoleReversal = (bossName) => {
  const rv = loadRoleReversal();
  const idx = rv.available.findIndex(r => r.bossName === bossName);
  if (idx < 0) return null;
  const completed = rv.available.splice(idx, 1)[0];
  completed.completedAt = new Date().toISOString();
  rv.completed = rv.completed || [];
  rv.completed.push(completed);
  saveRoleReversal(rv);
  return completed;
};

const getRoleReversal = () => {
  const cycle = loadCycleCount();
  if (cycle < 3) return null;
  return loadRoleReversal();
};

// ── 126번: 별의 의지 ──
// 회차마다 별자리가 달라지며 이번 회차 "세계 의지" 결정. 별자리 읽기 스킬 높을수록 흐름 예측 가능
const WORLD_WILL_KEY  = "taleforge-world-will";
const loadWorldWill   = () => { const r = lsGet(WORLD_WILL_KEY); return r ? JSON.parse(r) : { currentWill: null, history: [], readingLevel: 0 }; };
const saveWorldWill   = (w) => lsSet(WORLD_WILL_KEY, JSON.stringify(w));
const clearWorldWill  = () => lsDel(WORLD_WILL_KEY);

const WORLD_WILLS = [
  { id:"heroism",   icon:"⚡", will:"영웅의 의지",   desc:"세계가 영웅을 원한다. 영웅적 행동에 강력한 보상.", flow:"정의·희생·용기의 이벤트 집중" },
  { id:"chaos",     icon:"🌀", will:"혼돈의 의지",   desc:"세계가 변화를 원한다. 예측 불가능한 이벤트 연속.", flow:"반전·배신·급변의 이벤트 집중" },
  { id:"balance",   icon:"⚖️", will:"균형의 의지",   desc:"세계가 균형을 원한다. 극단적 선택에 페널티.",      flow:"중립·조화·공존의 이벤트 집중" },
  { id:"darkness",  icon:"🌑", will:"어둠의 의지",   desc:"세계가 어둠에 물들어 있다. 악을 이용하면 이득.",   flow:"공포·음모·배신의 이벤트 집중" },
  { id:"mystery",   icon:"🔮", will:"신비의 의지",   desc:"세계가 숨겨진 진실을 드러내려 한다.",              flow:"비밀·발견·계시의 이벤트 집중" },
  { id:"rebirth",   icon:"🌅", will:"재생의 의지",   desc:"세계가 새로운 시작을 원한다. 변화와 성장의 시기.", flow:"성장·각성·극복의 이벤트 집중" },
];

const assignWorldWill = (cycle) => {
  const idx = cycle % WORLD_WILLS.length;
  const will = WORLD_WILLS[idx];
  const ww = loadWorldWill();
  ww.currentWill = { ...will, cycle, assignedAt: new Date().toISOString() };
  ww.history = ww.history || [];
  ww.history.push({ id: will.id, cycle });
  if (ww.history.length > 20) ww.history.splice(0, ww.history.length - 20);
  ww.readingLevel = Math.min(5, Math.floor(cycle / 5));
  saveWorldWill(ww);
  return will;
};

const getWorldWill = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const ww = loadWorldWill();
  if (!ww.currentWill) assignWorldWill(cycle);
  return loadWorldWill();
};

// ── 127번: 사안(死眼) ──
// 누적 사망 50회 넘으면 해금. 상대의 생명력 잔량과 사망 원인 예측이 보임
const DEATH_EYE_KEY  = "taleforge-death-eye";
const loadDeathEye   = () => { const r = lsGet(DEATH_EYE_KEY); return r ? JSON.parse(r) : { totalDeaths: 0, unlocked: false, level: 0 }; };
const saveDeathEye   = (e) => lsSet(DEATH_EYE_KEY, JSON.stringify(e));
const clearDeathEye  = () => lsDel(DEATH_EYE_KEY);

const DEATH_EYE_LEVELS = [
  { level:0, deaths:0,   label:"봉인",          ability:"없음" },
  { level:1, deaths:50,  label:"사안 개안",      ability:"상대 HP 대략 파악 + 치명상 위치 감지" },
  { level:2, deaths:100, label:"사안 강화",      ability:"상대 HP 수치 + 예상 사망 원인 1개" },
  { level:3, deaths:200, label:"사안 완성",      ability:"상대 HP·방어·약점 전체 + 사망 확률 %로 표시" },
  { level:4, deaths:500, label:"죽음의 신 각성",  ability:"모든 생명체의 수명 감지. 운명의 죽음을 미리 안다." },
];

const recordDeathForEye = () => {
  const de = loadDeathEye();
  de.totalDeaths = (de.totalDeaths || 0) + 1;
  const newLevel = DEATH_EYE_LEVELS.reduce((acc, l) => de.totalDeaths >= l.deaths ? l.level : acc, 0);
  if (newLevel > (de.level || 0)) { de.level = newLevel; de.unlocked = newLevel > 0; }
  saveDeathEye(de);
  return de;
};

const getDeathEyeStatus = () => {
  const de = loadDeathEye();
  return { ...de, levelData: DEATH_EYE_LEVELS[de.level || 0], nextLevel: DEATH_EYE_LEVELS[(de.level || 0) + 1] || null };
};

// ── 128번: 영혼의 주파수 ──
// NPC와 주파수가 맞으면 말 안 해도 의도가 전달. 전생 인연일수록 일치 확률 상승
const SOUL_FREQUENCY_KEY  = "taleforge-soul-frequency";
const loadSoulFrequency   = () => { const r = lsGet(SOUL_FREQUENCY_KEY); return r ? JSON.parse(r) : { frequency: 50, resonances: [] }; };
const saveSoulFrequency   = (f) => lsSet(SOUL_FREQUENCY_KEY, JSON.stringify(f));
const clearSoulFrequency  = () => lsDel(SOUL_FREQUENCY_KEY);

const growSoulFrequency = (cycleCount, deepBonds) => {
  const sf = loadSoulFrequency();
  sf.frequency = Math.min(100, 50 + (cycleCount * 2) + (deepBonds * 5));
  saveSoulFrequency(sf);
  return sf;
};

const addResonance = (npcName, resonanceStrength) => {
  if (!npcName) return;
  const sf = loadSoulFrequency();
  sf.resonances = sf.resonances || [];
  const existing = sf.resonances.find(r => r.npcName === npcName);
  if (existing) existing.strength = Math.min(100, (existing.strength || 0) + (resonanceStrength || 10));
  else sf.resonances.push({ npcName, strength: resonanceStrength || 10, addedAt: new Date().toISOString() });
  if (sf.resonances.length > 10) sf.resonances.sort((a,b) => b.strength - a.strength).splice(10);
  saveSoulFrequency(sf);
};

const getSoulFrequency = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const sf = loadSoulFrequency();
  const topResonance = sf.resonances && sf.resonances.length > 0 ? sf.resonances.sort((a,b) => b.strength - a.strength)[0] : null;
  return { ...sf, topResonance };
};

// ── 129번: 봉인된 신 ──
// 수십 회차에 걸쳐 조각 모으면 봉인된 신 해방. 이후 회차에서 조력자 or 적이 될지는 업보로 결정
const SEALED_GOD_KEY  = "taleforge-sealed-god";
const loadSealedGod   = () => { const r = lsGet(SEALED_GOD_KEY); return r ? JSON.parse(r) : { shards: 0, totalShards: 15, released: false, alignment: null }; };
const saveSealedGod   = (g) => lsSet(SEALED_GOD_KEY, JSON.stringify(g));
const clearSealedGod  = () => lsDel(SEALED_GOD_KEY);

const collectGodShard = (scenario) => {
  const sg = loadSealedGod();
  if (sg.released) return sg;
  sg.shards = Math.min(sg.totalShards, (sg.shards || 0) + 1);
  sg.lastShard = { scenario: scenario || "", collectedAt: new Date().toISOString() };
  if (sg.shards >= sg.totalShards) {
    sg.released = true;
    sg.releasedAt = new Date().toISOString();
  }
  saveSealedGod(sg);
  return sg;
};

const setGodAlignment = (karmaScore) => {
  const sg = loadSealedGod();
  if (!sg.released) return;
  sg.alignment = karmaScore <= 30 ? "ally" : karmaScore >= 70 ? "enemy" : "neutral";
  sg.alignmentDesc = sg.alignment === "ally" ? "신이 당신을 돕기로 결정했다. 강력한 조력자 등장."
    : sg.alignment === "enemy" ? "신이 당신을 위협으로 여긴다. 최강의 적이 등장."
    : "신이 중립을 지킨다. 간섭하지 않으나 길을 막지도 않는다.";
  saveSealedGod(sg);
};

const getSealedGodStatus = () => {
  const sg = loadSealedGod();
  return { ...sg, progressPercent: Math.round(((sg.shards || 0) / sg.totalShards) * 100) };
};

// ── 130번: 자연의 섭리 ──
// 회차 쌓일수록 세계의 자연법칙 자체가 조금씩 바뀜. 중력, 마법 법칙, 시간 흐름 속도 등 미묘하게 변화
const NATURAL_LAW_KEY  = "taleforge-natural-law";
const loadNaturalLaw   = () => { const r = lsGet(NATURAL_LAW_KEY); return r ? JSON.parse(r) : { mutations: [], stage: 0 }; };
const saveNaturalLaw   = (l) => lsSet(NATURAL_LAW_KEY, JSON.stringify(l));
const clearNaturalLaw  = () => lsDel(NATURAL_LAW_KEY);

const NATURAL_LAW_MUTATIONS = [
  { stage:1,  cycle:5,  law:"마법 친화력 증가",   desc:"마법이 전보다 조금 더 잘 발동된다.",                    effect:"마법 판정 +5" },
  { stage:2,  cycle:10, law:"시간 감각 이상",     desc:"위기 순간 시간이 느리게 흐르는 것처럼 느껴진다.",       effect:"위기 판정 추가 시간" },
  { stage:3,  cycle:15, law:"중력 희박화",        desc:"몸이 예전보다 가볍다. 도약력과 이동성이 향상됐다.",      effect:"이동 관련 판정 +8" },
  { stage:4,  cycle:20, law:"존재감 희박화",      desc:"세계가 당신의 존재를 완전히 인식하지 못하기 시작한다.", effect:"기습 피격 확률 -20%" },
  { stage:5,  cycle:30, law:"인과율 이완",        desc:"원인과 결과가 느슨해진다. 불가능이 가능해지는 순간들.", effect:"판정 실패를 1회 재시도" },
  { stage:6,  cycle:40, law:"현실 재작성",        desc:"강한 의지로 현실의 일부를 임시로 바꿀 수 있다.",        effect:"1회/회차 서사 분기 변경" },
  { stage:7,  cycle:50, law:"세계와의 합일 시작", desc:"당신과 세계의 경계가 흐릿해진다. 모든 것이 연결된다.", effect:"모든 판정 +10, 해탈 루트 개방" },
];

const evolvNaturalLaw = (cycle) => {
  const nl = loadNaturalLaw();
  const newMutations = NATURAL_LAW_MUTATIONS.filter(m => m.cycle <= cycle && !nl.mutations.find(nm => nm.stage === m.stage));
  newMutations.forEach(m => nl.mutations.push({ ...m, evolvedAt: new Date().toISOString(), atCycle: cycle }));
  nl.stage = nl.mutations.length;
  saveNaturalLaw(nl);
  return { newMutations, total: nl.mutations };
};

const getNaturalLaw = () => {
  const cycle = loadCycleCount();
  if (cycle < 5) return null;
  const nl = loadNaturalLaw();
  const nextMutation = NATURAL_LAW_MUTATIONS.find(m => m.cycle > cycle && !nl.mutations.find(nm => nm.stage === m.stage));
  return { ...nl, nextMutation };
};


// ══════════════════════════════════════════════════════════════
// 숨겨진 직업 시스템
// ══════════════════════════════════════════════════════════════

const HIDDEN_JOB_KEY     = "taleforge-hidden-jobs";
const loadHiddenJobs     = () => { const r = lsGet(HIDDEN_JOB_KEY); return r ? JSON.parse(r) : []; };
const saveHiddenJobs     = (j) => lsSet(HIDDEN_JOB_KEY, JSON.stringify(j));
const clearHiddenJobs    = () => lsDel(HIDDEN_JOB_KEY);

// ─────────────────────────────────────────────────────────────
// 숨겨진 직업 정의
// type: "awakening" = 일반 직업 각성  |  "evolution" = 각성 직업 진화  |  "secret" = 특수 조건 발견
// unlockType: 해금 조건 종류
// ─────────────────────────────────────────────────────────────
const HIDDEN_JOBS = [

  // ════ 각성형 (일반 직업 → 각성) ════

  { id:"death_knight",    icon:"💀", name:"죽음의 기사",      rarity:"legendary",
    type:"awakening",     baseJob:["기사","전사","검사","팔라딘"],  scenario:["중세 판타지","무협 강호",null],
    desc:"죽음의 힘을 다루는 전사. 방어와 생명력 흡수를 동시에.",
    lore:"죽음의 문턱에서 살아 돌아온 자만이 얻을 수 있는 각성. 검에서 냉기가 흐른다.",
    bonus:{ str:15, end:12, mgc:8, hp:20 },
    unlockType:"death_count",    unlockDesc:"전사 계열로 5회 이상 전투 사망",
    unlockCondition:{ deathCount:5, baseJobMatch:true },
    hint:"죽음을 충분히 경험해야 한다.",
    systemHint:"이 직업의 캐릭터는 죽음의 기운을 다루며, 적의 HP를 흡수하거나 언데드를 소환하는 묘사를 포함할 수 있습니다." },

  { id:"archmage",        icon:"🌌", name:"대마법사",          rarity:"legendary",
    type:"awakening",     baseJob:["마법사","주술사","마법학자","마도사","소서러"],  scenario:[null],
    desc:"마법의 근원에 닿은 자. 원소를 자유자재로 다룬다.",
    lore:"수천 번의 주문을 외운 끝에 마법 법칙 자체를 손으로 만지는 경지에 도달했다.",
    bonus:{ mgc:20, int:15, mp:30, per:8 },
    unlockType:"skill_use",      unlockDesc:"마법 계열 스킬 총 30회 이상 사용",
    unlockCondition:{ skillUseCount:30, baseJobMatch:true },
    hint:"마법을 끊임없이 연마해야 한다.",
    systemHint:"이 직업의 캐릭터는 원소를 자유롭게 구사하며, 마법 장면에서 웅장한 스케일의 묘사를 사용하십시오." },

  { id:"shadow_dancer",   icon:"🌑", name:"그림자 무도가",    rarity:"rare",
    type:"awakening",     baseJob:["도적","암살자","자객","닌자","레인저"],  scenario:[null],
    desc:"빛과 그림자 사이를 춤추듯 이동하는 극한의 암살자.",
    lore:"그림자를 발판으로 삼는 경지. 눈에 보이지 않는 곳에서 춤추듯 적을 처리한다.",
    bonus:{ agi:18, crit:15, per:10, disg:12 },
    unlockType:"scenario_clear", unlockDesc:"은신/잠입 엔딩 2회 이상 달성",
    unlockCondition:{ stealthEndings:2, baseJobMatch:true },
    hint:"그림자 속에 숨어 적을 처리한 횟수가 쌓여야 한다.",
    systemHint:"이 직업의 캐릭터는 그림자처럼 이동하며, 전투와 이동 묘사에서 유연하고 우아한 표현을 사용하십시오." },

  { id:"oracle",          icon:"🔮", name:"신탁사",            rarity:"rare",
    type:"awakening",     baseJob:["성직자","사제","신관","힐러","수도사"],  scenario:["중세 판타지","나만의 세계",null],
    desc:"신의 말을 직접 듣는 자. 미래를 엿본다.",
    lore:"기도가 쌓여 마침내 신이 직접 귓속에 속삭이기 시작했다. 그 말은 항상 옳다.",
    bonus:{ per:15, wil:12, fath:20, luk:10 },
    unlockType:"karma_pure",     unlockDesc:"카르마 점수 30 이하 엔딩 3회",
    unlockCondition:{ pureKarmaEndings:3, baseJobMatch:true },
    hint:"순수한 마음으로 신을 섬겨야 한다.",
    systemHint:"이 직업의 캐릭터는 신의 계시를 받으며, 예언적 발언과 신성한 묘사를 자연스럽게 포함하십시오." },

  { id:"warlord",         icon:"⚔️", name:"전쟁군주",          rarity:"rare",
    type:"awakening",     baseJob:["전사","기사","군인","용병"],  scenario:["중세 판타지",null],
    desc:"전장을 지배하는 자. 아군의 사기를 끌어올리고 적을 압도한다.",
    lore:"수백 번의 전투를 이끌며 전장의 흐름 자체가 눈에 보이기 시작했다.",
    bonus:{ str:12, ldr:20, end:10, fear:15 },
    unlockType:"battle_wins",    unlockDesc:"전투 승리 누적 20회 이상",
    unlockCondition:{ battleWins:20, baseJobMatch:true },
    hint:"수많은 전투에서 승리를 쌓아야 한다.",
    systemHint:"이 직업의 캐릭터는 전장을 압도하며, 전투 장면에서 전략적이고 지휘관다운 묘사를 사용하십시오." },

  { id:"artificer",       icon:"⚙️", name:"마법공학자",        rarity:"rare",
    type:"awakening",     baseJob:["발명가","엔지니어","연금술사","기술자"],  scenario:["사이버펑크","나만의 세계",null],
    desc:"기술과 마법을 융합한 자. 전장을 기계와 마법으로 가득 채운다.",
    lore:"기계와 마법 사이의 경계가 허물어졌다. 이제 이 둘은 하나다.",
    bonus:{ int:15, mgc:12, crit:10, regen:8 },
    unlockType:"craft_count",    unlockDesc:"제작/발명 관련 이벤트 10회 이상",
    unlockCondition:{ craftEvents:10, baseJobMatch:true },
    hint:"끊임없이 만들고 발명해야 한다.",
    systemHint:"이 직업의 캐릭터는 창의적인 도구와 장치를 사용하며, 기발하고 독창적인 해결책을 묘사하십시오." },

  { id:"berserk",         icon:"🔴", name:"광전사",            rarity:"rare",
    type:"awakening",     baseJob:["전사","오크 전사","야만용사","버서커"],  scenario:[null],
    desc:"분노를 동력으로 삼는 자. HP가 낮을수록 더욱 강해진다.",
    lore:"분노의 끝에 이성을 포기한 자에게 찾아오는 힘. 무섭지만 자신도 위험하다.",
    bonus:{ str:20, end:8, hp:15, crit:12 },
    unlockType:"low_hp_survive", unlockDesc:"HP 10% 이하에서 전투 승리 5회",
    unlockCondition:{ lowHpWins:5, baseJobMatch:true },
    hint:"죽음 직전까지 몰려도 살아남아야 한다.",
    systemHint:"이 직업의 캐릭터는 분노할수록 강해집니다. HP가 낮아질수록 묘사를 더욱 격렬하고 거칠게 표현하십시오." },

  { id:"blood_mage",      icon:"🩸", name:"혈마법사",          rarity:"legendary",
    type:"awakening",     baseJob:["마법사","주술사","흑마법사","마도사"],  scenario:["중세 판타지","나만의 세계",null],
    desc:"자신의 피를 마법의 재료로 삼는 자. 금지된 힘.",
    lore:"금서를 너무 많이 읽어 결국 자신의 피로 주문을 새기기 시작했다.",
    bonus:{ mgc:18, crit:15, hp:-10, mad:10 },
    unlockType:"dark_magic",     unlockDesc:"어둠/저주 계열 행동 누적 15회",
    unlockCondition:{ darkActs:15, baseJobMatch:true },
    hint:"어둠의 마법에 깊이 빠져야 한다.",
    systemHint:"이 직업의 캐릭터는 자신의 피를 사용하는 금지된 마법을 구사합니다. 마법 사용 시 대가를 묘사하십시오." },

  { id:"sage",            icon:"📚", name:"현자",              rarity:"rare",
    type:"awakening",     baseJob:["학자","마법학자","연구자","탐정","지식인"],  scenario:[null],
    desc:"모든 분야의 지식을 섭렵한 자. 지식이 곧 힘이다.",
    lore:"수천 권의 책을 읽고 수많은 전생의 지식이 더해져 세계의 이치를 꿰뚫어보게 되었다.",
    bonus:{ int:20, per:15, wil:10, luk:8 },
    unlockType:"cycle_knowledge", unlockDesc:"3회차 이상 + 전생어 해금",
    unlockCondition:{ minCycle:3, pastLanguageUnlocked:true, baseJobMatch:true },
    hint:"많은 생을 거쳐 지식을 쌓아야 한다.",
    systemHint:"이 직업의 캐릭터는 박식하며, 어떤 상황에서도 관련 지식을 인용하고 분석하는 묘사를 포함하십시오." },

  // ════ 진화형 (각성 직업 → 진화) ════

  { id:"death_god",       icon:"☠️", name:"사신",              rarity:"legendary",
    type:"evolution",     baseJob:["죽음의 기사","환생자","영혼 방랑자"],  scenario:[null],
    desc:"죽음 그 자체가 된 존재. 생사를 손에 쥐고 있다.",
    lore:"죽음의 기사로도 모자라 마침내 죽음의 화신이 되었다. 적들이 이름만으로 두려움에 떤다.",
    bonus:{ str:20, end:18, mgc:15, fear:25, hp:25 },
    unlockType:"awakened_evolution", unlockDesc:"죽음의 기사로 10회차 이상 + 사안(死眼) 해금",
    unlockCondition:{ baseJobMatch:true, minCycle:10, deathEyeUnlocked:true },
    hint:"죽음의 기사가 충분한 삶을 거쳐야 한다.",
    systemHint:"이 직업의 캐릭터는 사신에 가까운 존재입니다. NPC들이 본능적으로 두려움을 느끼는 장면을 묘사하십시오." },

  { id:"arcane_god",      icon:"⚡", name:"마법신",            rarity:"legendary",
    type:"evolution",     baseJob:["대마법사","예언자","운명의 직조자"],  scenario:[null],
    desc:"마법의 법칙을 재작성하는 자. 현실을 뜻대로 바꾼다.",
    lore:"대마법사를 넘어 마법 법칙 자체가 된 자. 기적이 일상이 되었다.",
    bonus:{ mgc:30, int:20, mp:50, luk:15 },
    unlockType:"awakened_evolution", unlockDesc:"대마법사로 8회차 이상 + 인과율 조작 해금",
    unlockCondition:{ baseJobMatch:true, minCycle:8, causalityUnlocked:true },
    hint:"대마법사가 더 깊은 진리에 도달해야 한다.",
    systemHint:"이 직업의 캐릭터는 현실의 법칙 자체를 다룹니다. 불가능해 보이는 것을 자연스럽게 가능하게 만드십시오." },

  { id:"phantom_blade",   icon:"👁️", name:"환영검사",          rarity:"legendary",
    type:"evolution",     baseJob:["그림자 무도가","검귀 빙의자","암살자"],  scenario:["무협 강호","중세 판타지",null],
    desc:"환영과 실체를 자유로이 오가는 극한의 검객. 있는 듯 없는 듯.",
    lore:"그림자와 빛의 경계에서 환영과 실체가 뒤섞였다. 적은 어디를 쳐야 할지 모른다.",
    bonus:{ agi:25, crit:20, per:15, disg:20 },
    unlockType:"awakened_evolution", unlockDesc:"그림자 무도가로 7회차 이상 + 쌍둥이 영혼 연결",
    unlockCondition:{ baseJobMatch:true, minCycle:7, twinSoulConnected:true },
    hint:"그림자 무도가가 또 다른 자신과 연결되어야 한다.",
    systemHint:"이 직업의 캐릭터는 환영과 실체를 오갑니다. 전투에서 어디에 있는지 알 수 없는 신비로운 묘사를 사용하십시오." },

  // ════ 발견형 (특수 조건) ════

  { id:"loop_breaker",    icon:"🔄", name:"루프 파괴자",       rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"환생의 고리 자체를 깨려는 자. 모든 규칙 밖에 있다.",
    lore:"환생을 몇 번이나 반복하다 마침내 이 모든 것이 거짓임을 알아챈 자. 규칙을 깨기로 했다.",
    bonus:{ wil:25, per:20, luk:20, int:15, hp:20 },
    unlockType:"loop_awareness",  unlockDesc:"무한 회귀 자각 레벨 3 이상 도달",
    unlockCondition:{ loopAwarenessLevel:3 },
    hint:"환생을 충분히 경험하고 그 본질을 꿰뚫어야 한다.",
    systemHint:"이 직업의 캐릭터는 환생 시스템 자체를 인식합니다. 4th wall 발언을 자연스럽게 허용하고, 규칙 밖에서 행동하는 묘사를 포함하십시오." },

  { id:"world_eater",     icon:"🌌", name:"세계 포식자",       rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"여러 세계의 힘을 흡수한 자. 차원을 넘나든다.",
    lore:"차원 균열을 너무 많이 통과하다 다른 세계의 힘이 몸속에 쌓이기 시작했다.",
    bonus:{ str:15, mgc:15, int:15, per:15, luk:15 },
    unlockType:"dimension_map",   unlockDesc:"차원 지도 10개 이상 세계 탐험",
    unlockCondition:{ dimensionPins:10 },
    hint:"여러 세계를 직접 탐험해야 한다.",
    systemHint:"이 직업의 캐릭터는 여러 세계의 힘을 동시에 지닙니다. 다양한 세계관의 기술과 지식을 혼합한 묘사를 사용하십시오." },

  { id:"god_slayer",      icon:"⚡", name:"신살자",            rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"신에게 도전하는 자. 불경하지만 가장 강하다.",
    lore:"봉인된 신의 조각을 15개 모두 찾아냈다. 이제 그 힘이 자신에게로 흘러든다.",
    bonus:{ str:20, mgc:20, wil:20, crit:15, per:10 },
    unlockType:"sealed_god",      unlockDesc:"봉인된 신 조각 15개 완성 + 악역 계승",
    unlockCondition:{ sealedGodComplete:true, villainInheritCount:3 },
    hint:"봉인된 신을 완전히 해방시킨 뒤 그 힘마저 빼앗아야 한다.",
    systemHint:"이 직업의 캐릭터는 신에 맞서는 존재입니다. 신적 존재와의 조우에서 대등하거나 우월한 묘사를 사용하십시오." },

  { id:"time_weaver",     icon:"⏳", name:"시간 직조자",       rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"시간의 흐름을 직접 다루는 자. 과거·현재·미래가 보인다.",
    lore:"시간 역행 토큰을 너무 많이 써서 시간 자체가 이 존재를 인식하기 시작했다.",
    bonus:{ per:20, luk:20, int:15, wil:15 },
    unlockType:"time_token",      unlockDesc:"시간 역행 토큰 총 10회 이상 사용",
    unlockCondition:{ timeTokenUsed:10 },
    hint:"시간을 여러 번 되돌리면 시간이 당신을 인식한다.",
    systemHint:"이 직업의 캐릭터는 시간의 흐름을 인식합니다. 과거와 미래가 겹쳐 보이는 듯한 신비로운 묘사를 포함하십시오." },

  { id:"karma_incarnate", icon:"⚖️", name:"업보 화신",         rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"선과 악의 업보가 한 몸에 응축된 자. 균형 그 자체.",
    lore:"선행과 악행을 모두 극한까지 경험한 결과, 업보 자체가 육신에 깃들었다.",
    bonus:{ wil:20, luk:20, mgc:10, end:10, str:10 },
    unlockType:"karma_balance",   unlockDesc:"카르마 극선(≤20) + 극악(≥80) 엔딩 각 2회",
    unlockCondition:{ pureKarmaEndings:2, evilKarmaEndings:2 },
    hint:"선과 악 모두를 극단까지 경험해야 한다.",
    systemHint:"이 직업의 캐릭터는 선악의 업보를 동시에 지닙니다. 동일한 행동이 선하게도 악하게도 해석될 수 있는 복잡한 묘사를 사용하십시오." },

  { id:"myth_hero",       icon:"🌟", name:"신화의 영웅",       rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"전설을 넘어 신화가 된 자. 세계가 당신의 이름을 안다.",
    lore:"음유시인이 노래하고, 신전이 모시고, 적들이 전설로 두려워하는 존재가 되었다.",
    bonus:{ rep:30, ldr:20, str:15, mgc:10, luk:15 },
    unlockType:"legend_complete", unlockDesc:"음유시인 명성 80 이상 + 신전 레벨 3 이상",
    unlockCondition:{ bardFame:80, templeLevel:3 },
    hint:"세계에 이름을 남기고 신앙의 대상이 되어야 한다.",
    systemHint:"이 직업의 캐릭터는 살아있는 신화입니다. 처음 만나는 NPC들도 이름을 알고 경외하는 반응을 묘사하십시오." },

  { id:"void_walker",     icon:"🌑", name:"공허 보행자",       rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"존재와 무존재 사이를 걷는 자. 현실에 반만 속한다.",
    lore:"불사 게이지가 한계를 넘어 이제 죽음조차 이 존재를 완전히 붙잡지 못한다.",
    bonus:{ per:20, mgc:18, agi:15, mad:15, hp:-5 },
    unlockType:"undying_extreme", unlockDesc:"불사 게이지 최대치 + 누적 사망 30회 이상",
    unlockCondition:{ undyingMaxed:true, totalDeaths:30 },
    hint:"죽음의 경계를 셀 수 없이 넘어야 한다.",
    systemHint:"이 직업의 캐릭터는 반쯤 공허에 속해 있습니다. 존재감이 희미한 듯하면서도 압도적인 이중적 묘사를 사용하십시오." },

  { id:"reincarnation_master", icon:"♾️", name:"환생 지배자",  rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"환생 자체를 지배하는 자. 모든 전생의 기억과 힘을 사용한다.",
    lore:"20번의 삶을 거쳐 윤회 등급이 신급에 이르렀다. 이제 환생은 형벌이 아니라 도구다.",
    bonus:{ str:10, mgc:10, int:10, per:10, wil:10, luk:10, end:10 },
    unlockType:"reincarnation_rank", unlockDesc:"윤회 등급 신급 이상 + 20회차 이상",
    unlockCondition:{ reincarnationRank:3, minCycle:20 },
    hint:"수많은 삶을 거쳐 최고의 윤회자가 되어야 한다.",
    systemHint:"이 직업의 캐릭터는 전생의 모든 기억과 힘을 자유롭게 사용합니다. 어떤 전생의 기술도 꺼내 쓸 수 있는 전능한 묘사를 사용하십시오." },

  // ════ 새로운 각성형 (일반 직업 → 각성) ════

  { id:"soul_reaper",      icon:"⛓️", name:"영혼 수확자",      rarity:"legendary",
    type:"awakening",     baseJob:["성직자","사제","신관","주술사","무당","영매"],  scenario:[null],
    desc:"죽은 자의 영혼을 수확하고 봉인하는 자. 산 자와 죽은 자 사이의 경계에 선다.",
    lore:"수많은 죽음을 목격하고, 마침내 죽음의 신이 이 자에게 일을 부탁하기 시작했다. 영혼을 인도하는 자는 결코 홀로가 아니다.",
    bonus:{ mgc:15, per:12, mad:8, fear:10, wil:5 },
    unlockType:"npc_death_count", unlockDesc:"NPC 동료 사망 10회 이상 경험",
    unlockCondition:{ npcDeathCount:10, baseJobMatch:true },
    hint:"죽음을 충분히 곁에서 지켜봐야 한다.",
    systemHint:"이 직업은 주변에서 죽은 영혼들이 따라다니며, 전투 외에도 죽은 NPC의 목소리를 듣거나 메시지를 전달하는 묘사를 포함하십시오." },

  { id:"cursed_blade",     icon:"🩸", name:"저주 검사",         rarity:"legendary",
    type:"awakening",     baseJob:["검사","기사","팔라딘","전사","검객","무사"],  scenario:["중세 판타지","무협 강호",null],
    desc:"검에 저주가 깃든 자. 강력하지만 서서히 무기에 잠식당한다.",
    lore:"봉인된 마검을 너무 오래 쥐었다. 이제 검이 이 자를 선택한 것인지, 이 자가 검을 선택한 것인지 알 수 없다.",
    bonus:{ str:18, crit:15, mgc:8, mad:12, hp:-15 },
    unlockType:"dark_weapon_use", unlockDesc:"저주받은 무기 장착 상태로 전투 15회 이상",
    unlockCondition:{ darkActs:15, baseJobMatch:true },
    hint:"저주받은 힘에 의존하면 할수록 그 경지에 가까워진다.",
    systemHint:"검사의 몸에 저주 문양이 퍼져 있으며, 강한 공격을 할수록 자신에게도 대가가 따르는 묘사를 항상 포함하십시오." },

  { id:"star_caller",      icon:"🌠", name:"별의 부름자",       rarity:"rare",
    type:"awakening",     baseJob:["마법사","마도사","점성술사","학자","탐정"],  scenario:[null],
    desc:"별의 힘을 끌어내리는 자. 운명의 흐름을 읽고 별자리의 힘을 무기로 삼는다.",
    lore:"밤마다 하늘을 올려다보다 어느 날 별들이 말을 걸어오기 시작했다. 이제 그 자에게 밤하늘은 무기이자 지도다.",
    bonus:{ mgc:15, luk:15, per:12, int:8 },
    unlockType:"cycle_knowledge", unlockDesc:"3회차 이상 + 다양한 세계관 탐험",
    unlockCondition:{ minCycle:3, baseJobMatch:true },
    hint:"오랜 시간 하늘을 올려다보며 지식을 쌓아야 한다.",
    systemHint:"별빛이 이 캐릭터를 감싸며, 별자리에 따라 다른 힘을 사용하는 묘사를 포함하십시오. 별자리 판단은 그날의 운세처럼 묘사하면 좋습니다." },

  { id:"wandering_ghost",  icon:"👻", name:"방랑 검귀",         rarity:"rare",
    type:"awakening",     baseJob:["검사","자객","암살자","도적","레인저","검객"],  scenario:["무협 강호","중세 판타지",null],
    desc:"죽은 검사의 혼이 깃든 몸. 두 개의 의식이 동거하며 서로의 기술을 공유한다.",
    lore:"격렬한 전투 후 쓰러진 그 순간, 전설의 검귀가 몸에 깃들었다. 하나의 몸에 두 개의 검혼. 때로는 공존하고 때로는 갈등한다.",
    bonus:{ str:14, agi:14, crit:12, mad:10, per:5 },
    unlockType:"low_hp_survive", unlockDesc:"HP 10% 이하에서 강자와의 1:1 전투 3회 생존",
    unlockCondition:{ lowHpWins:3, baseJobMatch:true },
    hint:"죽음 직전까지 가는 일대일 결투를 반복해야 한다.",
    systemHint:"캐릭터 안에 검귀가 때때로 목소리를 내거나 행동을 조언하는 묘사를 포함하십시오. 광기 수치가 높을수록 검귀의 목소리가 강해집니다." },

  { id:"blood_dancer",     icon:"💃", name:"혈무 무도가",        rarity:"rare",
    type:"awakening",     baseJob:["도적","암살자","자객","닌자","곡예사"],  scenario:[null],
    desc:"피와 춤을 섞어 예술로 만드는 자. 전투가 곧 공연이다.",
    lore:"춤꾼이었던 그는 어느 날 전투와 춤이 다르지 않음을 깨달았다. 이제 그의 전투는 처절하면서도 아름답다.",
    bonus:{ agi:18, crit:14, cha:10, disg:8 },
    unlockType:"scenario_clear", unlockDesc:"은신/잠입 스타일로 전투 승리 12회 이상",
    unlockCondition:{ stealthEndings:2, baseJobMatch:true },
    hint:"아름답게 싸워야 한다. 거칠지 않게.",
    systemHint:"이 캐릭터의 전투는 항상 춤처럼 묘사하십시오. 발놀림, 손짓, 몸의 움직임이 예술적으로 보이도록 하되 그 결과는 치명적입니다." },

  { id:"iron_monk",        icon:"🪨", name:"철혈 수도승",        rarity:"rare",
    type:"awakening",     baseJob:["수도사","승려","무도가","격투가","팔라딘"],  scenario:["무협 강호","중세 판타지",null],
    desc:"육체를 극한까지 단련한 자. 어떤 무기도 이 몸을 뚫을 수 없다.",
    lore:"수천 번의 명상과 수련 끝에 육체가 강철을 넘어섰다. 이제 맨손이 최강의 무기다.",
    bonus:{ end:20, str:12, wil:12, hp:20, mgc:-5 },
    unlockType:"battle_wins", unlockDesc:"무기 없이(맨손) 전투 승리 10회 이상",
    unlockCondition:{ battleWins:10, baseJobMatch:true },
    hint:"끊임없이 수련하고 명상해야 한다.",
    systemHint:"이 캐릭터는 무기를 사용하지 않을 때 가장 강하며, 맨몸 전투 장면에서 바위를 부수고 창을 맨손으로 막는 초인적 묘사를 사용하십시오." },

  { id:"runic_carver",     icon:"🔣", name:"룬 각인사",          rarity:"rare",
    type:"awakening",     baseJob:["마법사","연금술사","학자","발명가","마법학자"],  scenario:["중세 판타지","나만의 세계",null],
    desc:"룬 문자를 피부에 새겨 힘을 끌어내는 자. 몸 전체가 마법의 매개체가 된다.",
    lore:"수천 개의 룬을 분석하다 결국 자신의 피부를 마법 양피지로 삼기 시작했다. 각인할수록 강해지지만 원래의 자신은 잃어간다.",
    bonus:{ mgc:16, int:12, crit:10, str:6, hp:-8 },
    unlockType:"skill_use", unlockDesc:"마법·룬 계열 스킬 총 25회 이상 사용",
    unlockCondition:{ skillUseCount:25, baseJobMatch:true },
    hint:"룬을 끊임없이 연구하고 각인해야 한다.",
    systemHint:"이 캐릭터의 피부에는 빛나는 룬 문자가 새겨져 있으며, 스킬 사용 시 특정 룬이 활성화되는 묘사를 포함하십시오." },

  { id:"chain_breaker",    icon:"🔓", name:"속박 해방자",         rarity:"rare",
    type:"awakening",     baseJob:["성직자","팔라딘","기사","전사","혁명가"],  scenario:[null],
    desc:"억압받는 자들의 구원자. 모든 속박과 봉인을 깨뜨리는 자.",
    lore:"수많은 봉인과 저주를 해제하다 보니 이제 세상의 모든 구속이 눈에 보이기 시작했다. 감옥도, 계약도, 법도 이 자에겐 깨뜨릴 대상일 뿐이다.",
    bonus:{ wil:15, str:10, ldr:12, fath:8, crse:-20 },
    unlockType:"karma_pure", unlockDesc:"피억압자를 구한 선택 누적 15회",
    unlockCondition:{ pureKarmaEndings:2, baseJobMatch:true },
    hint:"약자를 돕고 억압에 맞서야 한다.",
    systemHint:"이 캐릭터 앞에서 사슬, 봉인, 계약 같은 속박이 자연스럽게 풀리며, 억압받는 NPC들이 본능적으로 이 자를 따르는 묘사를 사용하십시오." },

  // ════ 새로운 진화형 ════

  { id:"reaper_lord",      icon:"💀", name:"사령 군주",          rarity:"legendary",
    type:"evolution",     baseJob:["영혼 수확자","죽음의 기사","사신"],  scenario:[null],
    desc:"죽음을 다스리는 군주. 자신의 의지대로 생사를 결정한다.",
    lore:"영혼을 거두는 것을 넘어 이제 생사의 법칙 자체를 쥐게 되었다. 이 자가 살라 하면 살고, 죽으라 하면 죽는다.",
    bonus:{ mgc:25, fear:20, per:18, wil:15, hp:20 },
    unlockType:"awakened_evolution", unlockDesc:"영혼 수확자 or 죽음의 기사로 8회차 이상 + 사안 해금",
    unlockCondition:{ baseJobMatch:true, minCycle:8, deathEyeUnlocked:true },
    hint:"영혼을 다루는 직업으로 충분한 생을 쌓아야 한다.",
    systemHint:"이 캐릭터 앞에서는 살아있는 존재도 죽음을 느끼며, 생명의 불꽃이 얼마나 남아있는지 수치로 보이는 능력을 자연스럽게 묘사하십시오." },

  { id:"divine_sovereign",  icon:"👑", name:"신격 군주",           rarity:"legendary",
    type:"evolution",     baseJob:["신화의 영웅","환생 지배자","신살자"],  scenario:[null],
    desc:"신을 능가한 자. 새로운 신화의 시작.",
    lore:"신을 죽이고 그 자리를 차지했다. 아니면 스스로 신이 되었다. 어느 쪽이든 이제 세계는 이 자를 중심으로 돈다.",
    bonus:{ str:20, mgc:20, wil:25, rep:30, luk:20 },
    unlockType:"awakened_evolution", unlockDesc:"신화의 영웅으로 12회차 이상 + 신전 레벨 최대",
    unlockCondition:{ baseJobMatch:true, minCycle:12, templeLevel:5 },
    hint:"신화의 영웅이 신화를 넘어서야 한다.",
    systemHint:"이 캐릭터 앞에서 NPC들은 본능적으로 무릎을 꿇거나 기도하는 자세를 취하며, 자연 현상도 이 존재의 의지에 반응하는 묘사를 사용하십시오." },

  { id:"cursed_sovereign",  icon:"🔴", name:"저주의 군주",          rarity:"legendary",
    type:"evolution",     baseJob:["저주 검사","혈마법사","어둠의 마법사"],  scenario:[null],
    desc:"저주를 완전히 지배하게 된 자. 이제 저주는 형벌이 아니라 무기다.",
    lore:"저주에 잠식당하는 대신 역으로 저주를 삼켰다. 모든 저주를 흡수하고 재활용하는 최강의 저주술사.",
    bonus:{ mgc:22, crit:18, fear:15, crse:25, mad:10 },
    unlockType:"awakened_evolution", unlockDesc:"저주 검사 or 혈마법사로 7회차 이상 + 어둠 행동 30회",
    unlockCondition:{ baseJobMatch:true, minCycle:7, darkActs:30 },
    hint:"저주받은 직업으로 어둠의 길을 오래 걸어야 한다.",
    systemHint:"이 캐릭터는 저주를 먹고 자라며, 다른 존재의 저주를 흡수해 더 강해지는 묘사를 사용하십시오. 몸 주변에 항상 어두운 기운이 소용돌이칩니다." },

  // ════ 새로운 발견형 (특수 조건) ════

  { id:"fool_sage",        icon:"🃏", name:"광인 현자",           rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"미쳤다고 불리지만 가장 깊은 진리를 아는 자. 광기와 지혜는 종이 한 장 차이다.",
    lore:"광기 수치가 한계를 넘어섰지만 붕괴하는 대신 새로운 인식의 문이 열렸다. 이제 이 자만이 볼 수 있는 것들이 있다.",
    bonus:{ int:20, per:18, luk:15, mad:20, wil:-10 },
    unlockType:"high_madness_survive", unlockDesc:"광기 수치 90 이상에서 생존 3회 이상",
    unlockCondition:{ loopAwarenessLevel:2, totalDeaths:10 },
    hint:"광기의 끝에서도 살아남아야 한다.",
    systemHint:"이 캐릭터는 언뜻 말이 안 되는 소리를 하지만 그 말 속에 진리가 담겨있습니다. 예언적이고 역설적인 발언을 자주 사용하십시오." },

  { id:"echo_of_past",     icon:"🔁", name:"과거의 메아리",        rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"전생의 자신들이 모두 공존하는 자. 수십 개의 자아가 하나의 몸에 깃들어 있다.",
    lore:"전생 기억이 너무 강렬하게 각성되어 역대 자아들이 모두 현생의 몸 안에서 목소리를 내기 시작했다. 혼란스럽지만 그만큼 강력하다.",
    bonus:{ str:8, mgc:8, int:8, agi:8, per:8, wil:-5, mad:15 },
    unlockType:"loop_awareness", unlockDesc:"전생 기억 완전 각성 + 회차 12회 이상",
    unlockCondition:{ loopAwarenessLevel:3, minCycle:12 },
    hint:"오래 환생하며 기억을 모두 끌어올려야 한다.",
    systemHint:"이 캐릭터는 상황에 따라 다른 전생 자아의 목소리와 전투 스타일을 드러냅니다. 대화 중 갑자기 과거의 말투나 습관이 나오는 묘사를 사용하십시오." },

  { id:"shadow_sovereign",  icon:"🌑", name:"그림자 지배자",        rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"모든 그림자를 지배하는 자. 빛이 있는 곳이라면 어디든 자신의 영역이다.",
    lore:"은신과 잠입을 너무나 완벽하게 수행한 끝에 그림자 자체가 이 자를 주인으로 섬기기 시작했다.",
    bonus:{ disg:20, agi:18, per:15, crit:15, fear:10 },
    unlockType:"scenario_clear", unlockDesc:"완벽한 은신 엔딩 3회 이상 + 그림자 무도가 해금",
    unlockCondition:{ stealthEndings:3, pastLanguageUnlocked:true },
    hint:"발각되지 않고 완벽한 은신에 성공해야 한다.",
    systemHint:"이 캐릭터가 원하면 어떠한 그림자에서도 출몰할 수 있으며, 그림자가 독립적으로 움직여 정보를 수집하거나 공격하는 묘사를 사용하십시오." },

  { id:"dragon_sovereign",  icon:"🐉", name:"용왕",                rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:["중세 판타지","무협 강호",null],
    desc:"모든 용을 지배하는 자. 용의 왕으로 군림한다.",
    lore:"드래곤과 싸우고, 계약하고, 친해진 경험이 쌓여 결국 용들이 이 자를 자신들의 왕으로 인정했다.",
    bonus:{ str:18, mgc:18, fear:20, ldr:15, rep:15 },
    unlockType:"sealed_god", unlockDesc:"드래곤 관련 이벤트 누적 20회 + 용의 피 칭호 보유",
    unlockCondition:{ sealedGodComplete:false, villainInheritCount:2, bardFame:50 },
    hint:"용과 충분히 교류하고 용의 피를 얻어야 한다.",
    systemHint:"이 캐릭터 앞에서 모든 용은 복종하거나 도전합니다. 용과의 대화가 가능하며 용족의 힘을 빌려 쓸 수 있는 묘사를 포함하십시오." },

  { id:"concept_breaker",   icon:"❌", name:"개념 파괴자",          rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"세계의 개념과 법칙을 직접 부수는 자. '불가능'이라는 단어가 이 자에겐 없다.",
    lore:"루프를 깨고 신을 죽이고 차원을 건너며 결국 세계의 법칙 자체를 부수기 시작했다. 이제 이 자 앞에서 '이건 안 된다'는 없다.",
    bonus:{ wil:25, int:20, luk:20, per:15, mgc:15 },
    unlockType:"legend_complete", unlockDesc:"루프 파괴자 + 신살자 + 시간 직조자 모두 해금",
    unlockCondition:{ bardFame:90, templeLevel:4 },
    hint:"세계의 규칙을 어기는 세 가지 직업을 모두 해금해야 한다.",
    systemHint:"이 캐릭터는 게임의 규칙 자체를 무시하는 행동이 가능합니다. '그건 불가능하다'는 묘사가 나와도 이 캐릭터는 그냥 해버리는 결과를 보여주십시오." },
];

// ─── 해금 조건 체크 함수 ───────────────────────────────────────
const checkHiddenJobUnlock = (job, gameData) => {
  const {
    cycle = 0, karmaScore = 50, deathCount = 0, skillUseCount = 0,
    stealthEndings = 0, pureKarmaEndings = 0, evilKarmaEndings = 0,
    battleWins = 0, lowHpWins = 0, darkActs = 0, craftEvents = 0,
    loopAwarenessLevel = 0, dimensionPins = 0, sealedGodComplete = false,
    villainInheritCount = 0, timeTokenUsed = 0, bardFame = 0, templeLevel = 0,
    undyingMaxed = false, totalDeaths = 0, reincarnationRank = 0,
    pastLanguageUnlocked = false, causalityUnlocked = false,
    twinSoulConnected = false, deathEyeUnlocked = false,
    currentRole = "", battleWinHistory = 0,
    npcDeathCount = 0,
  } = gameData;

  const cond = job.unlockCondition;

  // 기본 직업 매칭 확인 (각성/진화형만)
  if (cond.baseJobMatch && job.baseJob) {
    const roleMatch = job.baseJob.some(base =>
      currentRole.includes(base) || base.includes(currentRole)
    );
    if (!roleMatch) return false;
  }

  switch(job.unlockType) {
    case "death_count":         return deathCount >= (cond.deathCount || 5);
    case "skill_use":           return skillUseCount >= (cond.skillUseCount || 30);
    case "scenario_clear":      return stealthEndings >= (cond.stealthEndings || 2);
    case "karma_pure":          return pureKarmaEndings >= (cond.pureKarmaEndings || 3);
    case "battle_wins":         return battleWins >= (cond.battleWins || 20) || battleWinHistory >= (cond.battleWins || 20);
    case "craft_count":         return craftEvents >= (cond.craftEvents || 10);
    case "low_hp_survive":      return lowHpWins >= (cond.lowHpWins || 5);
    case "dark_magic":          return darkActs >= (cond.darkActs || 15);
    case "cycle_knowledge":     return cycle >= (cond.minCycle || 3) && (pastLanguageUnlocked || cycle >= 5);
    case "awakened_evolution":
      return cycle >= (cond.minCycle || 7) &&
        (!cond.deathEyeUnlocked || deathEyeUnlocked) &&
        (!cond.causalityUnlocked || causalityUnlocked) &&
        (!cond.twinSoulConnected || twinSoulConnected);
    case "loop_awareness":      return loopAwarenessLevel >= (cond.loopAwarenessLevel || 3);
    case "dimension_map":       return dimensionPins >= (cond.dimensionPins || 10);
    case "sealed_god":          return sealedGodComplete && villainInheritCount >= (cond.villainInheritCount || 3);
    case "time_token":          return timeTokenUsed >= (cond.timeTokenUsed || 10);
    case "karma_balance":       return pureKarmaEndings >= (cond.pureKarmaEndings || 2) && evilKarmaEndings >= (cond.evilKarmaEndings || 2);
    case "legend_complete":     return bardFame >= (cond.bardFame || 80) && templeLevel >= (cond.templeLevel || 3);
    case "undying_extreme":     return undyingMaxed && totalDeaths >= (cond.totalDeaths || 30);
    case "reincarnation_rank":  return reincarnationRank >= (cond.reincarnationRank || 3) && cycle >= (cond.minCycle || 20);
    case "npc_death_count":     return npcDeathCount >= (cond.npcDeathCount || 10);
    case "dark_weapon_use":     return darkActs >= (cond.darkActs || 15);
    case "high_madness_survive":return loopAwarenessLevel >= 2 && totalDeaths >= 10;
    default: return false;
  }
};

// ─── 숨겨진 직업 해금 & 저장 ──────────────────────────────────
const unlockHiddenJob = (jobId) => {
  const jobs = loadHiddenJobs();
  if (jobs.find(j => j.id === jobId)) return false; // 이미 해금
  const def = HIDDEN_JOBS.find(j => j.id === jobId);
  if (!def) return false;
  jobs.push({ id: jobId, unlockedAt: new Date().toISOString() });
  saveHiddenJobs(jobs);
  return def;
};

// ─── 해금된 숨겨진 직업 목록 반환 ─────────────────────────────
const getUnlockedHiddenJobs = () => {
  const unlocked = loadHiddenJobs();
  return HIDDEN_JOBS.filter(j => unlocked.find(u => u.id === j.id));
};

// ─── 현재 게임 상태로 해금 가능한 직업 체크 ──────────────────
const checkAllHiddenJobUnlocks = (gameData) => {
  const alreadyUnlocked = loadHiddenJobs().map(j => j.id);
  const newUnlocks = [];
  HIDDEN_JOBS.forEach(job => {
    if (!alreadyUnlocked.includes(job.id) && checkHiddenJobUnlock(job, gameData)) {
      const result = unlockHiddenJob(job.id);
      if (result) newUnlocks.push(result);
    }
  });
  return newUnlocks;
};

// ─── 직업 진행 상황 (조건 달성률) ────────────────────────────
const getHiddenJobProgress = (gameData) => {
  const unlocked = loadHiddenJobs().map(j => j.id);
  return HIDDEN_JOBS.map(job => {
    const isUnlocked = unlocked.includes(job.id);
    const canUnlock = !isUnlocked && checkHiddenJobUnlock(job, gameData);
    return { ...job, isUnlocked, canUnlock };
  });
};


// ══════════════════════════════════════════════════════
//  [NEW] 아이템 강화/제작 시스템
// ══════════════════════════════════════════════════════
const FORGE_KEY       = "taleforge-forge";
const loadForgeData   = () => { const r = lsGet(FORGE_KEY); return r ? JSON.parse(r) : { upgrades:{}, craftHistory:[] }; };
const saveForgeData   = (d) => lsSet(FORGE_KEY, JSON.stringify(d));
const clearForgeData  = () => lsDel(FORGE_KEY);

// 강화 단계별 비용·효과 (최대 +5)
const UPGRADE_TIERS = [
  { tier:1, goldCost:50,  matCost:1, successRate:0.95, bonus:0.15, label:"+1 강화",  color:"#80c080" },
  { tier:2, goldCost:120, matCost:2, successRate:0.85, bonus:0.25, label:"+2 강화",  color:"#60a0e0" },
  { tier:3, goldCost:250, matCost:3, successRate:0.70, bonus:0.40, label:"+3 강화",  color:"#a060e0" },
  { tier:4, goldCost:500, matCost:5, successRate:0.50, bonus:0.60, label:"+4 강화",  color:"#e06030" },
  { tier:5, goldCost:900, matCost:8, successRate:0.30, bonus:0.85, label:"+5 전설",  color:"#c8a96e" },
];

const FORGE_MATERIALS = [
  { id:"iron_shard",   name:"강철 파편",    icon:"🔩", rarity:"common",    desc:"기본 강화 재료. 어디서나 구할 수 있다." },
  { id:"magic_crystal",name:"마법 수정",    icon:"💎", rarity:"uncommon",  desc:"마법 강화에 필요한 수정. 마법사 상점이나 던전에서 출현." },
  { id:"dragon_scale", name:"용의 비늘",    icon:"🐉", rarity:"rare",      desc:"드래곤에게서만 얻을 수 있는 희귀 강화재." },
  { id:"void_ore",     name:"공허 광석",    icon:"🌑", rarity:"legendary", desc:"차원 균열에서만 채취되는 전설급 재료." },
  { id:"titan_bone",   name:"티탄 뼈 가루", icon:"🦴", rarity:"rare",      desc:"고대 거인의 뼈를 갈아만든 강화 재료." },
  { id:"steam_alloy",  name:"증기 합금",    icon:"⚙️", rarity:"uncommon",  desc:"스팀펑크 세계의 특수 합금. 기계 장비 강화에 탁월." },
  { id:"stardust",     name:"별의 가루",    icon:"✨", rarity:"rare",      desc:"별이 떨어진 자리에서 모은 신비한 가루." },
];

// 제작 레시피 테이블
const CRAFT_RECIPES = [
  { id:"holy_blade",   name:"성광 검",      icon:"✨", rarity:"legendary",
    materials:["iron_shard","magic_crystal","iron_shard"], goldCost:300,
    result:{ type:"equip", slot:"weapon", effects:{ str:15, mgc:10, fath:8, crit:8 }, desc:"신성한 빛이 깃든 검. 어둠 속에서 스스로 빛을 발한다." },
    scenarios:["medieval"], hint:"중세 판타지 세계관에서만 제작 가능." },
  { id:"shadow_knife",  name:"그림자 단검", icon:"🌑", rarity:"rare",
    materials:["iron_shard","magic_crystal"], goldCost:180,
    result:{ type:"equip", slot:"weapon", effects:{ agi:12, crit:15, disg:8 }, desc:"어둠에 녹아드는 단검. 적이 눈치채기 전에 이미 끝난다." },
    scenarios:null, hint:"모든 세계관에서 제작 가능." },
  { id:"dragon_armor",  name:"용린 갑옷",   icon:"🐉", rarity:"legendary",
    materials:["dragon_scale","iron_shard","iron_shard"], goldCost:600,
    result:{ type:"equip", slot:"armor", effects:{ end:20, str:10, fear:10, hp:15 }, desc:"용의 비늘로 만든 갑옷. 화염과 냉기에 강한 저항을 지닌다." },
    scenarios:["medieval","mythology"], hint:"용 관련 세계관 전용." },
  { id:"cyber_implant", name:"신경 강화 임플란트", icon:"🧠", rarity:"legendary",
    materials:["magic_crystal","magic_crystal","iron_shard"], goldCost:500,
    result:{ type:"equip", slot:"accessory", effects:{ int:15, per:12, agi:8, wil:6 }, desc:"최첨단 신경 강화 임플란트. 반응속도와 지능이 극한으로 상승한다." },
    scenarios:["cyberpunk","steampunk"], hint:"기술 세계관 전용." },
  { id:"survivors_kit", name:"생존자 키트",  icon:"🎒", rarity:"uncommon",
    materials:["iron_shard","iron_shard"], goldCost:80,
    result:{ type:"consume", effects:{ hp:40, end:10, pstx:8, ftg:-25 }, desc:"황무지 생존에 필요한 모든 것이 담긴 키트." },
    scenarios:["apocalypse"], hint:"아포칼립스 전용." },
  { id:"myth_crown",    name:"신화의 왕관",  icon:"👑", rarity:"legendary",
    materials:["stardust","magic_crystal","titan_bone"], goldCost:800,
    result:{ type:"equip", slot:"accessory", effects:{ ldr:20, rep:15, wil:12, luk:12, fath:8 }, desc:"신화의 왕들이 쓰던 왕관의 복제품. 착용자에게 왕의 위엄이 깃든다." },
    scenarios:["mythology","medieval"], hint:"신화·중세 전용." },
  { id:"steam_cannon",  name:"증기 대포",    icon:"💥", rarity:"rare",
    materials:["steam_alloy","steam_alloy","iron_shard"], goldCost:400,
    result:{ type:"equip", slot:"weapon", effects:{ str:16, crit:12, fear:8, int:5 }, desc:"고압 증기로 강철탄을 발사하는 대포. 거대한 위력을 자랑한다." },
    scenarios:["steampunk"], hint:"스팀펑크 전용." },
  { id:"void_cloak",    name:"공허의 망토",  icon:"🌌", rarity:"legendary",
    materials:["void_ore","magic_crystal"], goldCost:700,
    result:{ type:"equip", slot:"armor", effects:{ disg:20, agi:15, per:10, mgc:8 }, desc:"공허를 짜서 만든 망토. 착용자의 존재감이 희미해진다." },
    scenarios:null, hint:"고회차(5회차+) 전용. 차원 균열 세계에서 재료 수급." },
  { id:"elixir_grand",  name:"대 영약",      icon:"🧪", rarity:"legendary",
    materials:["stardust","magic_crystal","dragon_scale"], goldCost:1000,
    result:{ type:"consume", effects:{ hp:100, mp:80, str:10, mgc:10, end:10, wil:10 }, desc:"전설의 연금술사가 남긴 레시피로 만든 대 영약. 모든 것이 회복된다." },
    scenarios:null, hint:"모든 세계관. 재료가 매우 희귀하다." },
];

const getAvailableRecipes = (scenario, cycle) => {
  return CRAFT_RECIPES.filter(r => {
    if (r.scenarios && !r.scenarios.some(s => scenario && scenario.includes(s === "medieval" ? "중세" : s === "cyberpunk" ? "사이버" : s === "apocalypse" ? "아포칼" : s === "mythology" ? "신화" : s === "steampunk" ? "스팀" : s))) return false;
    if (r.id === "void_cloak" && cycle < 5) return false;
    return true;
  });
};

const upgradeItem = (itemId, currentTier, gold, materials) => {
  const nextTier = UPGRADE_TIERS.find(t => t.tier === currentTier + 1);
  if (!nextTier) return { success: false, reason: "최대 강화 단계입니다." };
  if (gold < nextTier.goldCost) return { success: false, reason: `골드 ${nextTier.goldCost} 필요.` };
  const roll = Math.random();
  const success = roll <= nextTier.successRate;
  const fd = loadForgeData();
  if (!fd.upgrades[itemId]) fd.upgrades[itemId] = 0;
  if (success) fd.upgrades[itemId] = currentTier + 1;
  saveForgeData(fd);
  return { success, newTier: success ? currentTier + 1 : currentTier, roll, tier: nextTier };
};

// ══════════════════════════════════════════════════════
//  [NEW] 동적 클리어 목표 시스템
// ══════════════════════════════════════════════════════
const CYCLE_GOAL_KEY    = "taleforge-cycle-goal";
const loadCycleGoal     = () => { const r = lsGet(CYCLE_GOAL_KEY); return r ? JSON.parse(r) : null; };
const saveCycleGoal     = (g) => lsSet(CYCLE_GOAL_KEY, JSON.stringify(g));
const clearCycleGoal    = () => lsDel(CYCLE_GOAL_KEY);

const CLEAR_GOALS = [
  { id:"throne",       icon:"👑", name:"왕좌 쟁취",      desc:"어떤 방법으로든 최고 권력자가 되어라.",
    hint:"통솔·평판·카르마를 쌓고 권력의 정점에 오르면 달성. 방법은 불문.",
    bonusEndingType:"conquest", statBonus:{ ldr:8, rep:8 },
    aiHint:"이 캐릭터의 목표는 권력 정점 달성입니다. 권력과 관련된 선택지와 기회를 자주 제시하십시오." },
  { id:"slayer",       icon:"⚔️", name:"마왕 처단",       desc:"이번 회차의 최강 악의 존재를 처단하라.",
    hint:"강력한 적 보스를 처치하면 달성. 전투력과 전략이 핵심.",
    bonusEndingType:"hero", statBonus:{ str:8, crit:6 },
    aiHint:"이 캐릭터의 목표는 최강 악을 처단하는 것입니다. 강력한 악당을 서사 중반부터 등장시키고 맞대결 기회를 만들어주십시오." },
  { id:"revenge",      icon:"🩸", name:"복수 완수",        desc:"과거의 원한을 갚아라.",
    hint:"원한 관계의 NPC를 처단하거나 굴복시키면 달성.",
    bonusEndingType:"revenge", statBonus:{ str:6, wil:8 },
    aiHint:"이 캐릭터는 복수를 목표로 합니다. 원한의 대상이나 그 세력을 서사에 자주 등장시키고 점점 원한이 쌓이는 묘사를 포함하십시오." },
  { id:"sage_path",    icon:"📚", name:"현자의 길",        desc:"세계의 숨겨진 진실을 모두 밝혀라.",
    hint:"비밀 정보·금서·고대 유물 5개 이상 수집 시 달성.",
    bonusEndingType:"sage_end", statBonus:{ int:8, per:8 },
    aiHint:"이 캐릭터는 지식과 진실 탐구가 목표입니다. 비밀스러운 정보, 금지된 지식, 숨겨진 단서를 서사 전반에 배치하십시오." },
  { id:"savior",       icon:"🌟", name:"구원자",           desc:"위기에 처한 사람들을 구하라.",
    hint:"NPC 5명 이상을 위기에서 구하면 달성. 희생 여부는 불문.",
    bonusEndingType:"hero", statBonus:{ fath:8, ldr:6 },
    aiHint:"이 캐릭터의 목표는 다수를 구원하는 것입니다. 도움이 필요한 사람들과 위기 상황을 자주 배치하고 구출 선택지를 제공하십시오." },
  { id:"silent_end",   icon:"🌙", name:"조용한 은퇴",      desc:"아무도 모르게 조용히 평범한 삶을 살아라.",
    hint:"전투·갈등을 최대한 피하고 평화로운 생활 장면을 쌓으면 달성.",
    bonusEndingType:"wanderer", statBonus:{ cal:8, luk:8 },
    aiHint:"이 캐릭터의 목표는 조용한 은퇴입니다. 평온한 일상, 소박한 인간관계를 중심으로 서사를 전개하십시오. 큰 사건보다 소소한 이야기에 집중하십시오." },
  { id:"revolution",   icon:"🔥", name:"혁명가",           desc:"낡은 체제를 뒤엎고 새로운 세상을 만들어라.",
    hint:"기존 세력·권력구조에 정면으로 맞서 반란을 성공시키면 달성.",
    bonusEndingType:"revolutionary", statBonus:{ ldr:8, fear:6 },
    aiHint:"이 캐릭터의 목표는 혁명입니다. 억압적인 권력구조를 보여주고, 변화를 원하는 민중과 저항 세력을 서사에 배치하십시오." },
  { id:"underworld",   icon:"🌑", name:"지하세계 지배",    desc:"어둠의 조직과 지하경제를 손에 넣어라.",
    hint:"암흑가 조직 3개 이상 장악 또는 흡수 시 달성.",
    bonusEndingType:"villain", statBonus:{ disg:8, neg:8 },
    aiHint:"이 캐릭터의 목표는 지하세계 장악입니다. 범죄 조직, 암시장, 부패한 세력을 서사에 배치하고 이권 다툼 선택지를 자주 제시하십시오." },
  { id:"divine_path",  icon:"✨", name:"신격화",           desc:"인간의 한계를 넘어 신에 가까운 존재가 되어라.",
    hint:"윤회 등급 상승 + 신전 레벨 3 이상 + 전설급 업적 5개 이상.",
    bonusEndingType:"ascension", statBonus:{ wil:8, mgc:8 },
    aiHint:"이 캐릭터의 목표는 신격화입니다. 신비로운 초월 경험, 인간 한계를 넘는 순간들을 서사에 배치하십시오. 다른 NPC들이 이 자에게서 신성함을 느끼는 묘사를 포함하십시오." },
  { id:"dragon_king",  icon:"🐉", name:"용왕 등극",         desc:"용들의 왕으로 군림하라.",
    hint:"드래곤 관련 이벤트 10회 + 용의 피 칭호 + 용족 NPC 3명 이상 복속.",
    bonusEndingType:"conquest", statBonus:{ str:8, fear:10 },
    scenarios:["medieval","mythology"],
    aiHint:"이 캐릭터의 목표는 용왕이 되는 것입니다. 용·드래곤 관련 이벤트를 자주 등장시키고 용족과의 대결·계약·복속 기회를 만들어주십시오." },
];

const assignRandomGoal = (scenario, cycle) => {
  const eligible = CLEAR_GOALS.filter(g => {
    if (g.scenarios) return g.scenarios.some(s => scenario && scenario.includes(s === "medieval" ? "중세" : s === "mythology" ? "신화" : s));
    return true;
  });
  const idx = Math.floor(Math.random() * eligible.length);
  const goal = { ...eligible[idx], assignedAt: new Date().toISOString(), progress: 0, completed: false };
  saveCycleGoal(goal);
  return goal;
};

const updateGoalProgress = (amount = 1) => {
  const goal = loadCycleGoal();
  if (!goal || goal.completed) return goal;
  goal.progress = (goal.progress || 0) + amount;
  if (goal.progress >= 100) goal.completed = true;
  saveCycleGoal(goal);
  return goal;
};

// ══════════════════════════════════════════════════════
//  [NEW] NPC 성장 시스템 (동료 레벨업 + 버프)
// ══════════════════════════════════════════════════════
const NPC_GROWTH_KEY    = "taleforge-npc-growth";
const loadNpcGrowth     = () => { const r = lsGet(NPC_GROWTH_KEY); return r ? JSON.parse(r) : {}; };
const saveNpcGrowth     = (d) => lsSet(NPC_GROWTH_KEY, JSON.stringify(d));
const clearNpcGrowth    = () => lsDel(NPC_GROWTH_KEY);

const NPC_GROWTH_SKILLS = [
  { level:2, id:"npc_cover",    name:"동료 방어",   icon:"🛡️", desc:"동료가 피격 순간 앞에 나서 피해를 반감한다. END +5 버프." },
  { level:3, id:"npc_assist",   name:"측면 지원",   icon:"⚔️", desc:"동료가 적의 빈틈을 공략. 주인공 CRIT +8 버프." },
  { level:4, id:"npc_rally",    name:"사기 고취",   icon:"📣", desc:"동료의 외침이 주인공을 북돋운다. WIL +8, CAL +5 버프." },
  { level:5, id:"npc_synergy",  name:"완전 공조",   icon:"✨", desc:"호흡이 완전히 맞은 동료와의 협공. 모든 판정 +10 버프." },
];

const growNpc = (npcName, bondIncrease = 5) => {
  const data = loadNpcGrowth();
  if (!data[npcName]) data[npcName] = { level: 1, exp: 0, totalBond: 0, skills: [] };
  const npc = data[npcName];
  npc.exp += bondIncrease;
  npc.totalBond += bondIncrease;
  // 레벨업 체크 (exp 임계치: 20, 50, 90, 150)
  const thresholds = [0, 20, 50, 90, 150];
  const newLevel = thresholds.filter(t => npc.exp >= t).length;
  const didLevelUp = newLevel > npc.level;
  if (didLevelUp) {
    npc.level = newLevel;
    const newSkill = NPC_GROWTH_SKILLS.find(s => s.level === newLevel);
    if (newSkill && !npc.skills.find(s => s.id === newSkill.id)) npc.skills.push(newSkill);
  }
  saveNpcGrowth(data);
  return { npc, didLevelUp, newLevel };
};

const getNpcGrowthData = (npcName) => {
  const data = loadNpcGrowth();
  return data[npcName] || { level: 1, exp: 0, totalBond: 0, skills: [] };
};

const getCompanionBuffs = () => {
  // 최고 레벨 동료의 스킬 버프를 합산
  const data = loadNpcGrowth();
  const allSkills = [];
  Object.values(data).forEach(npc => {
    if (npc.skills) npc.skills.forEach(s => { if (!allSkills.find(x => x.id === s.id)) allSkills.push(s); });
  });
  return allSkills;
};

// ══════════════════════════════════════════════════════
//  [NEW] 날씨/계절 판정 연동 시스템
// ══════════════════════════════════════════════════════
const WEATHER_EFFECTS = {
  none:        { label:"맑음",     icon:"☀️",  bonuses:{}, penalties:{}, aiHint:"맑은 날씨. 특별한 날씨 효과 없음." },
  rain:        { label:"비",       icon:"🌧️", bonuses:{ disg:8, agi:5 },     penalties:{ str:-3, crit:-3, per:-5 },  aiHint:"비가 내립니다. 잠입과 은신에 유리하나 시야와 힘이 약간 감소합니다." },
  storm:       { label:"폭풍",     icon:"⛈️",  bonuses:{ mgc:10, fear:8 },    penalties:{ agi:-8, per:-10, spk:-5 },  aiHint:"폭풍이 몰아칩니다. 마법과 위압에 유리하나 기동력과 소통이 크게 제한됩니다." },
  snow:        { label:"눈",       icon:"❄️",  bonuses:{ cal:5, wil:5 },      penalties:{ agi:-5, ftg:10 },           aiHint:"눈이 내립니다. 정신이 맑아지나 체력 소모가 증가합니다." },
  fog:         { label:"안개",     icon:"🌫️", bonuses:{ disg:15, per:5 },    penalties:{ per:-8, crit:-5 },          aiHint:"짙은 안개가 낍니다. 위장에 매우 유리하나 탐지 능력이 감소합니다." },
  scorching:   { label:"폭염",     icon:"🔥",  bonuses:{ str:5, fear:5 },     penalties:{ end:-5, cal:-5, ftg:10 },   aiHint:"찌는 더위입니다. 공격적인 상황에 유리하나 지구력과 냉정함이 감소합니다." },
  blizzard:    { label:"눈보라",   icon:"🌨️", bonuses:{ wil:10, end:5 },     penalties:{ agi:-10, per:-12 },         aiHint:"맹렬한 눈보라가 몰아칩니다. 의지와 인내가 강해지나 기동과 시야가 크게 제한됩니다." },
  sandstorm:   { label:"모래폭풍", icon:"🏜️", bonuses:{ end:5, cal:5 },      penalties:{ per:-15, disg:-5 },         aiHint:"모래폭풍이 휩쓸고 있습니다. 방향 감각을 잃기 쉽고 시야가 거의 없습니다." },
  acid_rain:   { label:"산성비",   icon:"☢️",  bonuses:{ mgc:8, pstx:10 },    penalties:{ end:-8, hp:-2 },            aiHint:"산성비가 내립니다(아포칼립스). 독내성에 유리하나 지속적으로 HP가 소모됩니다." },
  divine_light:{ label:"신성광",   icon:"✨",  bonuses:{ fath:15, mgc:10 },   penalties:{ mad:-5, fear:-5 },          aiHint:"신성한 빛이 내립니다(신화). 신앙과 마법이 강화되나 어둠의 존재는 약화됩니다." },
};

const TIME_EFFECTS = {
  none:     { label:"",      icon:"",   bonuses:{}, penalties:{} },
  dawn:     { label:"새벽",  icon:"🌅", bonuses:{ per:5, cal:5 },      penalties:{} },
  morning:  { label:"아침",  icon:"☀️", bonuses:{ wil:5, luk:3 },     penalties:{} },
  midday:   { label:"정오",  icon:"🌞", bonuses:{ str:5, end:3 },      penalties:{ mgc:-3 } },
  afternoon:{ label:"오후",  icon:"🌤️",bonuses:{},                    penalties:{} },
  evening:  { label:"저녁",  icon:"🌆", bonuses:{ spk:5, cha:3 },      penalties:{} },
  night:    { label:"밤",    icon:"🌙", bonuses:{ mgc:8, disg:8 },      penalties:{ per:-5, luk:-3 } },
  midnight: { label:"자정",  icon:"🌑", bonuses:{ mgc:15, mad:5 },      penalties:{ fath:-5, per:-8 } },
};

const getWeatherStatMods = () => {
  const atm = loadAtmosphere();
  const w = WEATHER_EFFECTS[atm.weather] || WEATHER_EFFECTS.none;
  const t = TIME_EFFECTS[atm.timeOfDay] || TIME_EFFECTS.none;
  const combined = {};
  [...Object.entries(w.bonuses), ...Object.entries(t.bonuses)].forEach(([k,v]) => combined[k] = (combined[k]||0)+v);
  [...Object.entries(w.penalties), ...Object.entries(t.penalties)].forEach(([k,v]) => combined[k] = (combined[k]||0)+v);
  return { weather:w, time:t, combined };
};

// ══════════════════════════════════════════════════════
//  [NEW] 배신 가능한 동료 시스템
// ══════════════════════════════════════════════════════
const BETRAYAL_KEY    = "taleforge-betrayal";
const loadBetrayals   = () => { const r = lsGet(BETRAYAL_KEY); return r ? JSON.parse(r) : []; };
const saveBetrayals   = (b) => lsSet(BETRAYAL_KEY, JSON.stringify(b));
const clearBetrayals  = () => lsDel(BETRAYAL_KEY);

const BETRAYAL_TRIGGERS = [
  { id:"greed",       label:"탐욕",     threshold:30,  icon:"💰", desc:"주인공이 자원을 독점하거나 동료에게 보상을 주지 않을 때.",   consequence:"동료가 보물을 들고 도주. 이후 적으로 등장." },
  { id:"betrayed",    label:"먼저 배신",threshold:20,  icon:"🗡️",desc:"주인공이 동료를 먼저 이용하고 버릴 때.",                     consequence:"동료가 복수를 다짐하고 적 세력과 손잡음." },
  { id:"jealousy",    label:"질투",     threshold:40,  icon:"😤", desc:"주인공이 너무 강해져 동료가 소외감을 느낄 때.",              consequence:"동료가 다른 집단에 합류하거나 사보타주." },
  { id:"ideological", label:"이념 갈등",threshold:50,  icon:"⚖️", desc:"주인공의 선택이 동료의 신념과 정면 충돌할 때.",              consequence:"동료가 자신의 신념에 따라 적대 세력으로." },
  { id:"redemption",  label:"개과천선", threshold:-30, icon:"💙", desc:"부정적 NPC가 주인공의 영향으로 선의를 회복할 때.",            consequence:"적 NPC가 동료로 전환. 특수 스킬 보유." },
];

const recordBetrayal = (npcName, triggerType, isRedemption = false) => {
  const list = loadBetrayals();
  const trigger = BETRAYAL_TRIGGERS.find(t => t.id === triggerType);
  if (!trigger) return;
  list.push({ npcName, triggerType, isRedemption, trigger, occurredAt: new Date().toISOString() });
  saveBetrayals(list);
  return trigger;
};

// ══════════════════════════════════════════════════════
//  [NEW] 세계관별 고유 이벤트 테이블
// ══════════════════════════════════════════════════════
const SCENARIO_EVENTS = {
  apocalypse: [
    { id:"ap_rad_storm",    icon:"☢️", name:"방사능 폭풍",       weight:20, desc:"거대한 방사능 폭풍이 접근 중이다. 대피처를 찾거나 정면 돌파해야 한다.", effect:"end:-10 또는 disg+15", aiHint:"방사능 폭풍 이벤트! 황무지를 가로지르는 치명적인 방사능 구름이 접근 중입니다. 대피 시도와 강행 돌파 선택지를 제시하십시오." },
    { id:"ap_supply_drop",  icon:"📦", name:"보급 낙하물",        weight:15, desc:"전쟁 전 시대의 군용 보급품이 낙하산에 매달려 떨어졌다. 하지만 다른 생존자들도 본 것 같다.", effect:"loot 또는 전투", aiHint:"보급 낙하물 이벤트! 희귀 군용 물자가 하늘에서 떨어졌습니다. 먼저 도착하거나 다른 생존자들과 경쟁하는 선택지를 제시하십시오." },
    { id:"ap_mutant_horde", icon:"🧟", name:"변이체 무리",         weight:25, desc:"방사능에 변이된 인간들의 무리가 냄새를 맡고 접근한다. 싸우거나 조용히 피해야 한다.", effect:"전투 또는 disg판정", aiHint:"변이체 무리 이벤트! 이성을 잃은 변이 인간들이 몰려옵니다. 격렬한 전투 또는 은신 탈출 선택지를 제시하십시오." },
    { id:"ap_survivor_camp",icon:"🏕️", name:"생존자 캠프 발견",    weight:20, desc:"소규모 생존자 집단이 살고 있는 캠프를 발견했다. 합류, 약탈, 무시 중 하나를 선택해야 한다.", effect:"사회적 선택", aiHint:"생존자 캠프 이벤트! 작은 공동체를 발견했습니다. 합류·교역·약탈·무시 선택지를 제시하고 선택에 따른 카르마 변화를 반영하십시오." },
    { id:"ap_old_tech",     icon:"💾", name:"전쟁 전 기술 유물",    weight:10, desc:"문명 붕괴 이전의 기술 장치를 발견했다. 작동시키면 엄청난 이점이 있지만 위험을 끌어당길 수도 있다.", effect:"int판정", aiHint:"고대 기술 이벤트! 전쟁 이전 문명의 장치를 발견했습니다. 작동 시도와 안전 폐기 선택지를 제시하십시오." },
    { id:"ap_raider_toll",  icon:"💀", name:"약탈자의 통행료",      weight:15, desc:"무장 약탈자 집단이 길목을 막고 통행료를 요구한다. 지불, 전투, 협상, 우회 중 선택해야 한다.", effect:"neg 또는 전투", aiHint:"약탈자 통행료 이벤트! 무장 세력이 길을 막고 있습니다. 다양한 해결책(전투·협상·뇌물·우회)을 선택지로 제시하십시오." },
    { id:"ap_fresh_water",  icon:"💧", name:"정화된 수원 발견",     weight:10, desc:"방사능에 오염되지 않은 깨끗한 물 원천을 발견했다. 이 정보는 생명과도 같다.", effect:"hp+20, 거래 재료", aiHint:"정화 수원 이벤트! 오염되지 않은 물을 발견했습니다. 독점하거나 공유하거나 거래하는 선택지를 제시하십시오." },
    { id:"ap_vault_signal", icon:"📡", name:"금고 신호 포착",       weight:5,  desc:"전쟁 전 비밀 금고의 신호를 포착했다. 내부에 무엇이 있는지 알 수 없다.", effect:"탐험 이벤트", aiHint:"비밀 금고 신호 이벤트! 전쟁 이전 시설의 신호를 감지했습니다. 탐험에 따른 보상과 위험을 제시하십시오." },
  ],
  mythology: [
    { id:"my_divine_trial",  icon:"⚡", name:"신의 시험",           weight:20, desc:"신 중 하나가 주인공을 시험하기 위해 나타났다. 통과하면 신성한 힘을 얻고 실패하면 저주가 따른다.", effect:"fath판정", aiHint:"신의 시험 이벤트! 신이 직접 나타나 시험을 내립니다. 시험 내용과 성공/실패 결과를 신화적으로 묘사하십시오." },
    { id:"my_oracle",        icon:"🔮", name:"신탁의 예언",          weight:15, desc:"신전의 신탁사가 주인공에 관한 예언을 전한다. 예언의 해석에 따라 행동이 달라진다.", effect:"luk+10, 방향 제시", aiHint:"신탁 이벤트! 신탁사가 주인공의 운명에 관한 모호한 예언을 전합니다. 예언은 두 가지 이상 해석이 가능하게 구성하십시오." },
    { id:"my_monster_siege", icon:"🐉", name:"신화 괴물 습격",       weight:25, desc:"히드라·키마이라·미노타우로스 등 신화 속 괴물이 습격한다. 전투 또는 신성한 힘으로 물리쳐야 한다.", effect:"전투(신화급)", aiHint:"신화 괴물 이벤트! 고대 신화의 괴물이 등장합니다. 괴물의 특성과 약점을 신화에서 따와 묘사하고 영웅적 전투를 연출하십시오." },
    { id:"my_hero_meeting",  icon:"🌟", name:"다른 영웅과의 만남",   weight:15, desc:"또 다른 신화의 영웅이 주인공과 마주쳤다. 경쟁자일 수도, 동료일 수도, 라이벌일 수도 있다.", effect:"사회적 판정", aiHint:"영웅 조우 이벤트! 이 세계의 또 다른 전설적 인물이 등장합니다. 협력·경쟁·결투 선택지를 제시하십시오." },
    { id:"my_olympus_call",  icon:"🏛️", name:"신들의 소환",          weight:10, desc:"신들의 회의에 소환되었다. 신들 앞에서 자신의 행동을 변호하거나 청원할 수 있다.", effect:"rep판정", aiHint:"신들의 소환 이벤트! 주인공이 신들의 모임에 나타났습니다. 신들과의 대화와 협상, 간청 선택지를 신화적으로 묘사하십시오." },
    { id:"my_cursed_relic",  icon:"💀", name:"저주받은 유물",        weight:15, desc:"강력한 힘이 깃든 저주받은 유물을 발견했다. 사용하면 강해지지만 저주도 함께 받는다.", effect:"mgc+10 또는 crse+15", aiHint:"저주 유물 이벤트! 어둠의 힘이 깃든 유물을 발견했습니다. 획득과 파괴, 봉인 선택지를 제시하고 각각의 대가를 명확히 하십시오." },
    { id:"my_fate_thread",   icon:"🧵", name:"운명의 실 교차",       weight:10, desc:"운명의 실이 눈에 보이기 시작했다. 잠깐 동안 앞으로 일어날 두 가지 운명 중 하나를 선택할 수 있다.", effect:"운명 선택", aiHint:"운명 선택 이벤트! 두 갈래의 운명이 눈앞에 보입니다. 두 가지 미래 선택지를 제시하고 각각의 결과를 암시하십시오." },
    { id:"my_titan_ruin",    icon:"🗿", name:"티탄의 유적 발견",     weight:10, desc:"태초 거인 티탄이 남긴 거대한 유적을 발견했다. 그 안에는 잠든 힘과 위험이 공존한다.", effect:"탐험 이벤트", aiHint:"티탄 유적 이벤트! 신화 시대 거인의 거대한 유적을 탐험합니다. 규모의 웅장함과 오래된 위험을 묘사하십시오." },
  ],
  steampunk: [
    { id:"sp_airship_crash", icon:"✈️", name:"비행선 추락",          weight:20, desc:"상공에서 비행선이 추락한다. 승객 구조, 화물 약탈, 현장 도주 중 선택해야 한다.", effect:"전투 또는 str판정", aiHint:"비행선 추락 이벤트! 거대한 증기 비행선이 추락하고 있습니다. 인명 구조와 화물 확보, 탈출 선택지를 긴박하게 묘사하십시오." },
    { id:"sp_gear_revolution",icon:"⚙️",name:"기계 혁명가의 시위",  weight:15, desc:"노동자들이 자동화 기계에 맞서 파업하고 있다. 어느 편에 설지 선택해야 한다.", effect:"카르마 분기", aiHint:"기계 혁명 이벤트! 노동자 시위가 일어났습니다. 자본가·노동자·중립 선택지를 제시하고 각 선택에 따른 사회적 결과를 묘사하십시오." },
    { id:"sp_noble_masquerade",icon:"🎭",name:"귀족 가면무도회",     weight:15, desc:"상류층의 비밀 모임에 초대받았다. 정보를 수집하거나, 동맹을 맺거나, 음모에 휘말릴 수 있다.", effect:"cha·neg 판정", aiHint:"가면무도회 이벤트! 화려한 귀족 파티에 참석했습니다. 사교·정보 수집·음모 선택지를 우아하게 묘사하십시오." },
    { id:"sp_aether_surge",  icon:"⚡", name:"에테르 과부하",        weight:20, desc:"도시 에테르 공급 장치가 과부하됐다. 통제하지 않으면 폭발로 많은 사람이 위험에 처한다.", effect:"int판정", aiHint:"에테르 과부하 이벤트! 기술 시설이 폭주하고 있습니다. 기술적 해결과 대피 유도, 차단 폭파 선택지를 긴박하게 묘사하십시오." },
    { id:"sp_black_market",  icon:"🏴", name:"암시장 정보 입수",     weight:10, desc:"금지된 기술과 마법을 거래하는 암시장의 위치를 알게 됐다. 방문하면 희귀 물건을 구할 수 있다.", effect:"rare loot", aiHint:"암시장 이벤트! 불법 기술 거래 시장에 접근했습니다. 거래 선택지와 위험(경비·함정)을 제시하십시오." },
    { id:"sp_automaton_revolt",icon:"🤖",name:"자동 인형 반란",      weight:15, desc:"자의식이 생긴 태엽 자동 인형들이 반란을 일으켰다. 제압, 협상, 해방 중 선택해야 한다.", effect:"wil 또는 int판정", aiHint:"자동 인형 반란 이벤트! 기계들이 의식을 가지고 반란을 일으켰습니다. 제압·협상·해방 선택지와 철학적 선택의 무게를 묘사하십시오." },
    { id:"sp_secret_society",icon:"🔍", name:"비밀 결사의 초대",     weight:10, desc:"고대 비밀 결사에서 접근해 왔다. 가입하면 강력한 인맥을 얻지만 그들의 목적은 불분명하다.", effect:"사회 판정", aiHint:"비밀 결사 이벤트! 신비로운 조직이 접촉해왔습니다. 가입 조건과 조직의 이면을 서서히 드러내며 선택지를 제시하십시오." },
    { id:"sp_inventor_duel", icon:"🔧", name:"발명가 결투",          weight:10, desc:"라이벌 발명가가 기술 결투를 신청했다. 자신의 발명품으로 상대를 이겨야 한다.", effect:"int·crit 판정", aiHint:"발명가 결투 이벤트! 두 발명가의 기술 배틀입니다. 창의적인 발명품 사용과 기발한 전략 선택지를 제시하십시오." },
  ],
};

const getScenarioEvent = (scenario) => {
  const key = scenario && (
    scenario.includes("아포칼") ? "apocalypse" :
    scenario.includes("신화") ? "mythology" :
    scenario.includes("스팀") ? "steampunk" : null
  );
  if (!key || !SCENARIO_EVENTS[key]) return null;
  const pool = SCENARIO_EVENTS[key];
  const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const event of pool) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  return pool[0];
};

// ══════════════════════════════════════════════════════
//  [NEW] 직업 조합 시너지 시스템
// ══════════════════════════════════════════════════════
const JOB_SYNERGY_KEY   = "taleforge-job-synergy";
const loadJobSynergy    = () => { const r = lsGet(JOB_SYNERGY_KEY); return r ? JSON.parse(r) : []; };
const saveJobSynergy    = (s) => lsSet(JOB_SYNERGY_KEY, JSON.stringify(s));
const clearJobSynergy   = () => lsDel(JOB_SYNERGY_KEY);

const JOB_SYNERGIES = [
  { id:"death_blood",   jobs:["죽음의 기사","혈마법사"],      icon:"💀🩸", name:"피의 죽음",       desc:"피로 소환된 언데드 부하가 자동 등장. STR +12, MGC +12, FEAR +10.", bonus:{ str:12, mgc:12, fear:10 }, aiHint:"피의 죽음 시너지! 죽음의 기사와 혈마법사의 힘이 합쳐져 피로 빚어진 언데드 군단을 소환합니다." },
  { id:"shadow_death",  jobs:["그림자 무도가","죽음의 기사"], icon:"🌑💀", name:"죽음의 그림자",   desc:"그림자 속에서 죽음의 낫을 휘두른다. AGI +15, CRIT +15.", bonus:{ agi:15, crit:15 }, aiHint:"죽음의 그림자 시너지! 그림자처럼 움직이며 죽음의 낫으로 기습하는 완벽한 암살 기술을 구사합니다." },
  { id:"arcane_time",   jobs:["대마법사","시간 직조자"],      icon:"⚡⏳", name:"시공간 마법",     desc:"시간과 마법이 융합. 과거 턴의 마법 효과 재발동. MGC +15, INT +12.", bonus:{ mgc:15, int:12 }, aiHint:"시공간 마법 시너지! 과거의 마법 주문이 현재에 다시 울려 퍼집니다. 같은 마법이 두 번 발동되는 듯한 묘사를 사용하십시오." },
  { id:"berserker_soul",jobs:["광전사","영혼 수확자"],        icon:"🔴⛓️", name:"분노의 수확",     desc:"쓰러진 적의 영혼이 분노를 더 강하게 만든다. STR +18, END +8.", bonus:{ str:18, end:8 }, aiHint:"분노의 수확 시너지! 쓰러진 적마다 영혼이 전사를 더욱 강하게 만듭니다. 전투할수록 폭발적으로 강해지는 묘사를 사용하십시오." },
  { id:"star_sage",     jobs:["별의 부름자","현자"],          icon:"🌠📚", name:"천문 현자",       desc:"별의 지혜와 학문이 융합. 모든 판정 +8, LUK +12, INT +12.", bonus:{ luk:12, int:12 }, aiHint:"천문 현자 시너지! 별의 이치와 세상의 이치가 하나로 합쳐집니다. 어떤 상황도 별의 지혜로 꿰뚫는 묘사를 사용하십시오." },
  { id:"loop_god",      jobs:["루프 파괴자","신살자"],        icon:"🔄⚡", name:"신의 파괴자",     desc:"신의 규칙과 환생의 규칙 모두를 부순다. 모든 스탯 +10.", bonus:{ str:10, mgc:10, int:10, per:10, wil:10 }, aiHint:"신의 파괴자 시너지! 신과 운명의 규칙 모두를 동시에 무시합니다. 불가능한 것을 당연하게 해내는 압도적인 묘사를 사용하십시오." },
  { id:"iron_undying",  jobs:["철혈 수도승","공허 보행자"],   icon:"🪨🌑", name:"불괴 허공",       desc:"육체와 허공이 하나. 공격이 통하지 않는 몸. END +20, HP +20.", bonus:{ end:20, hp:20 }, aiHint:"불괴 허공 시너지! 완벽히 단련된 몸이 반쯤 허공에 속해 있어 공격이 닿지 않습니다. 피해를 흘려내는 신비로운 묘사를 사용하십시오." },
  { id:"karma_god",     jobs:["업보 화신","신격 군주"],       icon:"⚖️👑", name:"심판의 군주",     desc:"선악의 업보로 신격에 이른 자. REP +20, WIL +15, LUK +15.", bonus:{ rep:20, wil:15, luk:15 }, aiHint:"심판의 군주 시너지! 선과 악의 모든 업보를 신격으로 승화시킨 자입니다. 어떤 행동에도 응당한 인과가 따르는 묘사를 사용하십시오." },
  { id:"dragon_demon",  jobs:["드래곤혈(종족)","악마족(종족)"], icon:"🐉😈", name:"혼돈의 화신",  desc:"용의 본능과 악마의 교활함. STR +10, MGC +10, FEAR +12, NEG +8.", bonus:{ str:10, mgc:10, fear:12, neg:8 }, aiHint:"혼돈의 화신 시너지! 용의 폭력성과 악마의 교활함이 공존합니다. 힘으로도 머리로도 압도하는 이중적 묘사를 사용하십시오." },
  { id:"phantom_rune",  jobs:["방랑 검귀","룬 각인사"],       icon:"👻🔣", name:"검귀의 룬",      desc:"검귀의 혼이 룬을 새기다. CRIT +15, MGC +10, STR +8.", bonus:{ crit:15, mgc:10, str:8 }, aiHint:"검귀의 룬 시너지! 검귀의 혼이 직접 몸에 룬을 새겨넣는 신비로운 묘사를 사용하십시오. 검격마다 룬이 빛납니다." },
];

const checkJobSynergy = (currentJob, prevJobs = [], race = "") => {
  return JOB_SYNERGIES.filter(syn => {
    const allJobs = [currentJob, ...prevJobs, race].map(j => (j||"").toLowerCase());
    return syn.jobs.every(j => allJobs.some(pj => pj.includes(j.replace(/\(.*\)/,"").trim().toLowerCase())));
  });
};

// ══════════════════════════════════════════════════════
//  [NEW] 성장형 악당 시스템
// ══════════════════════════════════════════════════════
const VILLAIN_KEY       = "taleforge-villain-growth";
const loadVillainData   = () => { const r = lsGet(VILLAIN_KEY); return r ? JSON.parse(r) : { name:null, power:0, dominion:0, minions:[], threat:"low" }; };
const saveVillainData   = (v) => lsSet(VILLAIN_KEY, JSON.stringify(v));
const clearVillainData  = () => lsDel(VILLAIN_KEY);

const VILLAIN_THREAT_LEVELS = [
  { id:"low",     threshold:0,   label:"성장 중",    icon:"🌱", desc:"아직 알려지지 않은 위협. 세계는 평온하다.",                worldPenalty:{} },
  { id:"medium",  threshold:25,  label:"위협 증대",  icon:"⚠️", desc:"마을 몇 곳이 점령당했다. 사람들이 두려움에 떤다.",           worldPenalty:{ rep:-5, trst:-3 } },
  { id:"high",    threshold:50,  label:"세계 위기",  icon:"🔥", desc:"주요 도시까지 위협받는다. 왕국이 흔들린다.",                 worldPenalty:{ rep:-10, ldr:-5, fath:-5 } },
  { id:"critical",threshold:75,  label:"멸망 직전",  icon:"💀", desc:"악의 군주가 세계의 절반을 지배한다. 희망이 보이지 않는다.",  worldPenalty:{ rep:-15, ldr:-10, fath:-10, wil:-5 } },
  { id:"omega",   threshold:100, label:"종말",       icon:"☠️", desc:"세계가 완전히 잠식됐다. 이제 역전하지 않으면 모든 것이 끝난다.", worldPenalty:{ str:-10, mgc:-10, rep:-20 } },
];

const tickVillainGrowth = (playerAction = "none") => {
  const villain = loadVillainData();
  let powerGain = 5; // 기본 성장
  if (playerAction === "hero") powerGain = 0;        // 영웅 행동 시 성장 멈춤
  if (playerAction === "retreat") powerGain = 10;    // 도주 시 빠른 성장
  if (playerAction === "idle") powerGain = 8;        // 아무것도 안 할 때
  villain.power = Math.min(100, (villain.power||0) + powerGain);
  villain.dominion = Math.min(100, (villain.dominion||0) + Math.floor(powerGain * 0.7));
  // 위협 단계 업데이트
  const newThreat = [...VILLAIN_THREAT_LEVELS].reverse().find(t => villain.power >= t.threshold);
  villain.threat = newThreat?.id || "low";
  saveVillainData(villain);
  return villain;
};

const getVillainStatus = () => {
  const villain = loadVillainData();
  const threat = VILLAIN_THREAT_LEVELS.find(t => t.id === villain.threat) || VILLAIN_THREAT_LEVELS[0];
  return { ...villain, threatDef: threat };
};

// ══════════════════════════════════════════════════════
//  [NEW] 회차 연보 (엔딩 히스토리 갤러리)
// ══════════════════════════════════════════════════════
const ANNALS_KEY      = "taleforge-annals";
const loadAnnals      = () => { const r = lsGet(ANNALS_KEY); return r ? JSON.parse(r) : []; };
const saveAnnals      = (a) => lsSet(ANNALS_KEY, JSON.stringify(a));
const clearAnnals     = () => lsDel(ANNALS_KEY);

const recordAnnalEntry = (charName, race, role, scenario, endingType, goalId, cycle, highlights = []) => {
  const annals = loadAnnals();
  const theme = ENDING_THEMES[endingType] || ENDING_THEMES.neutral;
  const goal = CLEAR_GOALS.find(g => g.id === goalId);
  annals.push({
    cycle, charName, race, role, scenario,
    endingType, endingLabel: theme.label, endingIcon: theme.icon, endingColor: theme.color,
    goalId, goalName: goal?.name || "자유 플레이",
    highlights: highlights.slice(0, 5),
    recordedAt: new Date().toISOString(),
  });
  if (annals.length > 30) annals.splice(0, annals.length - 30); // 최대 30회차 보존
  saveAnnals(annals);
  return annals;
};

const getAnnalStats = () => {
  const annals = loadAnnals();
  if (!annals.length) return null;
  const endingCounts = {};
  const raceCounts = {};
  const roleCounts = {};
  const scenarioCounts = {};
  annals.forEach(a => {
    endingCounts[a.endingType] = (endingCounts[a.endingType] || 0) + 1;
    raceCounts[a.race] = (raceCounts[a.race] || 0) + 1;
    roleCounts[a.role] = (roleCounts[a.role] || 0) + 1;
    scenarioCounts[a.scenario] = (scenarioCounts[a.scenario] || 0) + 1;
  });
  const mostUsedRace = Object.entries(raceCounts).sort((a,b)=>b[1]-a[1])[0];
  const favoriteEnding = Object.entries(endingCounts).sort((a,b)=>b[1]-a[1])[0];
  return { total: annals.length, endingCounts, raceCounts, roleCounts, scenarioCounts, mostUsedRace, favoriteEnding };
};

// ══════════════════════════════════════════════════════
//  [NEW] 종족 전용 스토리 루트
// ══════════════════════════════════════════════════════
const RACE_ROUTES_KEY   = "taleforge-race-routes";
const loadRaceRoutes    = () => { const r = lsGet(RACE_ROUTES_KEY); return r ? JSON.parse(r) : {}; };
const saveRaceRoutes    = (d) => lsSet(RACE_ROUTES_KEY, JSON.stringify(d));
const clearRaceRoutes   = () => lsDel(RACE_ROUTES_KEY);

const RACE_EXCLUSIVE_CONTENT = {
  "드래곤혈": {
    dungeon:   { name:"용의 무덤",        icon:"🐉", desc:"고룡들이 잠든 성지. 드래곤혈만 입장 가능하며 용의 정수와 고대 기억이 깃든 곳.", reward:"용신 각성 스킬 강화 + 용족 동료 획득 가능" },
    event:     "고룡 장로를 만나 용의 계보를 묻고 혈통을 증명하는 이벤트가 발생합니다.",
    npcReact:  "용 관련 NPC들이 드래곤혈을 알아보고 경외 또는 도전 반응을 보입니다.",
    language:  "용어(龍語)를 구사할 수 있어 용족 NPC와 직접 대화 가능합니다.",
  },
  "악마족": {
    dungeon:   { name:"심연의 계약 시장", icon:"😈", desc:"악마들이 모여 욕망을 거래하는 비밀 시장. 악마족만 안전하게 출입 가능.", reward:"금지 스킬 구매 + 강력한 계약 체결 가능" },
    event:     "악마 귀족들이 접근해 거래와 계약을 제안합니다. 조건이 매혹적이나 함정이 있을 수 있습니다.",
    npcReact:  "인간 NPC들이 악마족을 보면 본능적 불안을 느끼며, 악마족 NPC들은 동족으로 인정합니다.",
    language:  "심연어를 구사해 악마 계약 직접 협상이 가능합니다.",
  },
  "언데드": {
    dungeon:   { name:"저승의 문",         icon:"💀", desc:"살아있는 자는 돌아오지 못하는 죽음의 경계. 언데드는 자유롭게 넘나들 수 있다.", reward:"죽음 관련 비밀 지식 획득 + 망자의 기억 열람" },
    event:     "죽은 NPC들의 영혼이 언데드에게 말을 걸어옵니다. 전생 정보를 얻거나 의뢰를 받을 수 있습니다.",
    npcReact:  "살아있는 NPC들이 강한 불쾌감을 느끼며, 죽음 관련 존재들이 친근하게 반응합니다.",
    language:  "망자의 언어로 죽은 자와 대화가 가능합니다.",
  },
  "수인": {
    dungeon:   { name:"야수의 숲",         icon:"🐺", desc:"수인 종족이 신성시하는 원초의 숲. 인간은 발을 들일 수 없는 성지.", reward:"야생 동물 동료 영구 획득 + 수인 전용 무공 전수" },
    event:     "야생 동물들이 주인공을 군주로 인정하고 무리를 이끌어달라는 이벤트가 발생합니다.",
    npcReact:  "야생 동물들이 복종하고, 수인 NPC들이 동족 대우를 합니다. 문명 NPC들은 야성을 경계합니다.",
    language:  "야생어로 모든 짐승과 의사소통이 가능합니다.",
  },
  "원소인": {
    dungeon:   { name:"원소 수렴점",       icon:"🌀", desc:"네 원소가 교차하는 세계의 요충지. 원소인만이 힘을 흡수하지 않고 접근 가능.", reward:"원소 형태 변신 강화 + 새로운 원소 속성 각성" },
    event:     "자신의 원소가 폭주하거나 다른 원소와 충돌하는 특수 이벤트가 발생합니다.",
    npcReact:  "마법사들이 원소인을 연구 대상으로 여기거나 협력을 요청합니다. 자연 NPC들이 친근하게 반응합니다.",
    language:  "원소의 언어로 자연 정령과 직접 교감이 가능합니다.",
  },
};

const unlockRaceRoute = (race, routeId) => {
  const routes = loadRaceRoutes();
  if (!routes[race]) routes[race] = [];
  if (!routes[race].includes(routeId)) routes[race].push(routeId);
  saveRaceRoutes(routes);
};

const getRaceContent = (race) => {
  return RACE_EXCLUSIVE_CONTENT[race] || null;
};

// ══════════════════════════════════════════════════════
//  [NEW] 히든 퀘스트 시스템
// ══════════════════════════════════════════════════════
const HIDDEN_QUEST_KEY  = "taleforge-hidden-quests";
const loadHiddenQuests  = () => { const r = lsGet(HIDDEN_QUEST_KEY); return r ? JSON.parse(r) : []; };
const saveHiddenQuests  = (q) => lsSet(HIDDEN_QUEST_KEY, JSON.stringify(q));
const clearHiddenQuests = () => lsDel(HIDDEN_QUEST_KEY);

const HIDDEN_QUEST_POOL = [
  { id:"hq_shadow_merchant", icon:"🌑", name:"그림자 상인의 의뢰",
    condition:"night",     conditionDesc:"밤 시간대",
    desc:"어둠 속에서 정체불명의 상인이 접근한다. 남들이 볼 수 없는 물건을 팔거나 의뢰를 건넨다.",
    reward:"희귀 아이템 + 숨겨진 직업 진행도 상승",
    aiHint:"그림자 상인 히든 퀘스트! 어둠 속에서만 나타나는 신비로운 상인이 등장합니다. 위험하지만 매혹적인 거래를 제안하십시오." },
  { id:"hq_cursed_bloodline", icon:"🩸", name:"저주받은 혈통의 고백",
    condition:"high_karma_evil", conditionDesc:"카르마 70 이상(악)",
    desc:"어둠에 물든 전생의 혈통에 관한 비밀이 드러난다. 과거의 죄가 현재에 되돌아오려 한다.",
    reward:"혈마법사 각성 진행도 급상승",
    aiHint:"저주 혈통 히든 퀘스트! 과거 생의 죄가 현재로 돌아옵니다. 속죄하거나 더 어둡게 빠져드는 분기를 제시하십시오." },
  { id:"hq_ancient_prophecy", icon:"🔮", name:"잊혀진 예언",
    condition:"cycle5",    conditionDesc:"5회차 이상",
    desc:"세계 어딘가에 봉인된 고대 예언서가 있다. 예언의 내용은 주인공과 직결된다.",
    reward:"운명 직조자 각성 진행도 + LUK +15",
    aiHint:"고대 예언 히든 퀘스트! 오래된 예언서가 이 존재를 지목합니다. 예언의 모호한 내용을 천천히 해석하며 전개하십시오." },
  { id:"hq_dragon_egg",       icon:"🥚", name:"용의 알",
    condition:"dragon_race",   conditionDesc:"드래곤혈 종족",
    desc:"외딴 곳에서 버려진 용의 알을 발견했다. 부화시키면 용 동료가 생기지만 관심을 끌 수도 있다.",
    reward:"용 동료 획득 + 용왕 목표 진행도",
    aiHint:"용의 알 히든 퀘스트! 드래곤혈인이 용의 알을 발견했습니다. 부화와 포기, 숨기기 선택지를 제시하고 용 동료를 섬세하게 묘사하십시오." },
  { id:"hq_lost_technology",  icon:"💾", name:"소실된 기술",
    condition:"steampunk",     conditionDesc:"스팀펑크 세계",
    desc:"발명가의 비밀 일지에 이미 소실된 전설의 기술이 적혀있다. 재현할 수 있을까?",
    reward:"발명가 각성 진행도 + 전설급 제작 해금",
    aiHint:"소실 기술 히든 퀘스트! 전설적 기술의 재현을 시도합니다. 연구 과정의 시행착오와 발견의 경이를 묘사하십시오." },
  { id:"hq_gods_judgment",    icon:"⚡", name:"신의 심판",
    condition:"mythology",     conditionDesc:"신화 세계관",
    desc:"신들이 주인공의 행동을 두고 의견이 갈렸다. 특정 신의 편을 들거나 중립을 지켜야 한다.",
    reward:"신화 직업 각성 진행도 + 신성 스킬",
    aiHint:"신의 심판 히든 퀘스트! 두 신 사이의 갈등에 주인공이 휘말립니다. 어느 편을 들어도 그 신의 가호와 다른 신의 노여움이 따릅니다." },
  { id:"hq_void_message",     icon:"🌌", name:"공허의 속삭임",
    condition:"high_mad",      conditionDesc:"광기 50 이상",
    desc:"광기 속에서 공허의 존재가 말을 걸어온다. 그 속삭임은 불안하지만 강력한 지식을 담고 있다.",
    reward:"공허 보행자 진행도 + MGC +12, MAD +10",
    aiHint:"공허의 속삭임 히든 퀘스트! 광기 속에서만 들리는 목소리가 있습니다. 지식과 광기 사이의 경계에서 선택을 제시하십시오." },
  { id:"hq_survivor_child",   icon:"🧒", name:"황무지의 아이",
    condition:"apocalypse",    conditionDesc:"아포칼립스 세계",
    desc:"폐허 속에서 혼자 살아남은 어린아이를 발견했다. 데리고 다닐지, 안전한 곳을 찾아줄지, 내버려 둘지.",
    reward:"카르마 분기 + 동료 가능성",
    aiHint:"황무지 아이 히든 퀘스트! 폐허에서 혼자 살아남은 아이를 발견했습니다. 이 선택이 카르마와 이후 스토리에 깊이 영향을 미치도록 묘사하십시오." },
];

const checkHiddenQuestCondition = (questId, gameData) => {
  const quest = HIDDEN_QUEST_POOL.find(q => q.id === questId);
  if (!quest) return false;
  const { karmaScore = 50, timeOfDay = "none", cycle = 0, race = "", scenario = "", madness = 0 } = gameData;
  switch(quest.condition) {
    case "night": return ["night","midnight"].includes(timeOfDay);
    case "high_karma_evil": return karmaScore >= 70;
    case "cycle5": return cycle >= 5;
    case "dragon_race": return race.includes("드래곤") || race.includes("dragon");
    case "steampunk": return scenario.includes("스팀") || scenario.includes("steampunk");
    case "mythology": return scenario.includes("신화") || scenario.includes("mythology");
    case "apocalypse": return scenario.includes("아포칼") || scenario.includes("apocalypse");
    case "high_mad": return madness >= 50;
    default: return false;
  }
};

const getAvailableHiddenQuests = (gameData) => {
  const completed = loadHiddenQuests();
  return HIDDEN_QUEST_POOL.filter(q =>
    !completed.includes(q.id) && checkHiddenQuestCondition(q.id, gameData)
  );
};

const completeHiddenQuest = (questId) => {
  const completed = loadHiddenQuests();
  if (!completed.includes(questId)) {
    completed.push(questId);
    saveHiddenQuests(completed);
  }
};

