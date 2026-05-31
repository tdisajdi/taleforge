
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
];

const RACE_KEY = "taleforge-race";
const loadRace = () => { const r = lsGet(RACE_KEY); return r ? JSON.parse(r) : null; };
const saveRace = (race) => lsSet(RACE_KEY, JSON.stringify(race));
const clearRace = () => lsDel(RACE_KEY);

const saveApiKeys  = (keys) => lsSet(API_KEYS_STORAGE, JSON.stringify(keys));
const loadApiKeys  = () => { const r = lsGet(API_KEYS_STORAGE); return r ? JSON.parse(r) : []; };
const saveKeyIndex = (i) => lsSet(API_KEY_INDEX_STORAGE, String(i));
const loadKeyIndex = () => { const r = lsGet(API_KEY_INDEX_STORAGE); return r ? parseInt(r, 10) : 0; };

