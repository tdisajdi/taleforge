// 스킬 강화 시스템 — data
// Pure data split out of job/010-스킬-강화-시스템.js (see generate.js).

export const SKILL_ENHANCE_TIERS = [
  { level:1, spCost:2,  goldCost:0,   bonus:0.15, label:"Lv.1", color:"#80c080", desc:"스킬 효과 +15%" },
  { level:2, spCost:4,  goldCost:50,  bonus:0.30, label:"Lv.2", color:"#60a0e0", desc:"스킬 효과 +30%" },
  { level:3, spCost:7,  goldCost:120, bonus:0.50, label:"Lv.3", color:"#a060e0", desc:"스킬 효과 +50%" },
  { level:4, spCost:12, goldCost:300, bonus:0.75, label:"Lv.4", color:"#e06030", desc:"스킬 효과 +75%" },
  { level:5, spCost:20, goldCost:600, bonus:1.00, label:"Lv.MAX", color:"#c8a96e", desc:"스킬 효과 2배 (MAX)" },
];

export const STAT_DEFS = {
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
    { id: "pstx", name: "상태저항", icon: "🧬", color: "#2ecc71", desc: "독·저주·빙결·화상·광기·실명 등 모든 부정적 상태이상에 저항. 높을수록 완전 차단 또는 효과/지속시간 약화" }
  ],
  mystery: [
    { id: "mgc", name: "마법친화", icon: "🔮", color: "#9b59b6", desc: "마법 아이템 반응, 각성 확률" },
    { id: "crse", name: "저주도", icon: "👁️‍🗨️", color: "#8e44ad", desc: "누적될수록 불운 / 저주 시나리오 트리거" },
    { id: "krma", name: "업보", icon: "⚖️", color: "#bdc3c7", desc: "선악 행동 누적, 엔딩 분기에 영향" }
  ]
};

export const TITLE_DEFS = [
  // [D35/D48 FIX] NPC 퀘스트 "비밀 이야기"(confidant)와 4개 종교 비밀
  // 퀘스트(세계수의 선택받은 자/태양신의 대리인/원류의 수호자/마계의
  // 문지기)가 지급하려는 칭호 id가 TITLE_DEFS에 없어 조용히 무시되던 버그.
  { id:"confidant", name:"심복", icon:"🤫", rarity:"rare", cat:"관계", desc:"NPC의 비밀 이야기를 들을 만큼 신뢰를 얻었다", bonus:{cha:20, rep:15}, aiHint:"이 사람은 나에게 마음 깊은 이야기까지 털어놓는다" },
  { id:"세계수의 선택받은 자", name:"세계수의 선택받은 자", icon:"🌳", rarity:"legendary", cat:"종교", desc:"세계수의 마지막 가지를 회복시켰다", bonus:{wil:20, mgc:15}, aiHint:"세계수와 영적으로 연결된 선택받은 자로서의 위엄을 지녔다" },
  { id:"태양신의 대리인", name:"태양신의 대리인", icon:"☀️", rarity:"legendary", cat:"종교", desc:"태양신의 직접 강림을 받았다", bonus:{str:25, fath:20}, aiHint:"태양신의 신성한 권위를 대리하는 압도적인 존재감을 지녔다" },
  { id:"원류의 수호자", name:"원류의 수호자", icon:"🌿", rarity:"legendary", cat:"종교", desc:"세계수 원류의 진실을 지키는 자가 되었다", bonus:{per:20, int:15}, aiHint:"뿌리 신앙의 근원적 진리를 지키는 고대적 위엄을 지녔다" },
  { id:"마계의 문지기", name:"마계의 문지기", icon:"🌑", rarity:"legendary", cat:"종교", desc:"영혼을 담보로 마계 문의 열쇠를 받았다", bonus:{str:25, mgc:20, fear:15}, aiHint:"마계와 이어진 위험하고 어두운 권능을 지닌 존재로 취급된다" },
  { id:"first_blood", name:"첫 만남", icon:"🌱", rarity:"common", cat:"관계", desc:"첫 번째 대화를 나눴다", bonus:{cha:8, rep:8 }, aiHint:"처음 만난 사람에게 약간 더 친절하게" },
  { id:"heartbreaker", name:"심장 도둑", icon:"💘", rarity:"rare", cat:"관계", desc:"호감도 90 이상 달성", bonus:{cha:40, rep:16 }, aiHint:"이 사람에게 설레는 감정을 숨기지 못한다" },
  { id:"trusted_one", name:"신뢰받는 자", icon:"🤝", rarity:"rare", cat:"관계", desc:"신뢰도 90 이상 달성", bonus:{rep:40, ldr:24}, aiHint:"이 사람의 말을 깊이 신뢰하고 비밀도 털어놓는다" },
  { id:"soul_bond", name:"영혼의 유대", icon:"⛓️", rarity:"legendary", cat:"관계", desc:"호감도+신뢰도 합산 180 이상", bonus:{cha:40, rep:40, wil:40}, aiHint:"이 사람과는 말하지 않아도 통하는 것이 있다" },
  { id:"confessor", name:"고백자", icon:"💌", rarity:"rare", cat:"관계", desc:"고백에 성공했다", bonus:{cha:24, rep:16}, aiHint:"이 사람의 고백을 기억하며 더 애틋하게 대한다" },
  { id:"heartbroken", name:"상처받은 마음", icon:"💔", rarity:"common", cat:"관계", desc:"거절당하거나 이별을 경험했다", bonus:{cal:-2, wil:24 }, aiHint:"이 사람에게 미안함과 복잡한 감정을 느낀다" },
  { id:"duel_winner", name:"결투의 승자", icon:"⚔️", rarity:"rare", cat:"전투", desc:"결투 또는 대립에서 승리했다", bonus:{str:24, rep:24}, aiHint:"이 사람의 실력을 인정하고 함부로 대하지 않는다" },
  { id:"pacifist", name:"평화주의자", icon:"🕊️", rarity:"uncommon", cat:"전투", desc:"싸움을 대화로 해결했다", bonus:{neg:32, rep:16}, aiHint:"이 사람의 온화함에 감화되어 더 부드럽게 대한다" },
  { id:"defender", name:"수호자", icon:"🛡️", rarity:"rare", cat:"전투", desc:"위기에서 캐릭터를 구했다", bonus:{end:24, rep:32}, aiHint:"이 사람이 자신을 구해준 것을 잊지 못하고 충성을 다한다" },
  { id:"general_title", name:"장군", icon:"🎖️", rarity:"legendary", cat:"전투", desc:"전장에서 수많은 전투를 승리로 이끌어 왕의 신임을 받았다", bonus:{ldr:30, fear:20, rep:24}, aiHint:"군인과 기사들은 이 인물에게 즉각 경례하고 복종한다. 귀족도 군사 문제에서는 함부로 무시하지 못한다." },
  { id:"secret_keeper", name:"비밀의 수호자", icon:"🔐", rarity:"uncommon", cat:"탐험", desc:"캐릭터의 비밀을 알게 됐다", bonus:{per:24, rep:16}, aiHint:"이 사람에게 비밀을 털어놨으므로 더 깊이 연결됐다" },
  { id:"explorer", name:"개척자", icon:"🗺️", rarity:"common", cat:"탐험", desc:"새로운 세계나 장소를 발견했다", bonus:{agi:16, luk:8 }, aiHint:"이 사람과 함께 미지의 것을 탐험한 기억이 있다" },
  { id:"prophecy", name:"예언의 주인공", icon:"🔮", rarity:"legendary", cat:"탐험", desc:"운명적인 예언과 관련된 사건이 벌어졌다", bonus:{int:24, luk:40}, aiHint:"이 사람이 운명과 관련된 존재라는 것을 직감한다" },
  { id:"chatterbox", name:"이야기꾼", icon:"💬", rarity:"common", cat:"성장", desc:"50번 이상 대화를 나눴다", bonus:{spk:24}, aiHint:"이 사람과 오래 이야기한 터라 편안하게 대한다" },
  { id:"storyteller", name:"전설의 화자", icon:"📜", rarity:"uncommon", cat:"성장", desc:"100번 이상 대화를 나눴다", bonus:{spk:40, int:16 }, aiHint:"이 사람과의 긴 대화들이 쌓여 특별한 유대가 생겼다" },
  { id:"legend", name:"전설", icon:"👑", rarity:"legendary", cat:"성장", desc:"200번 이상 대화를 나눴다", bonus:{ldr:40, rep:40}, aiHint:"이 사람과의 긴 인연을 소중히 여기며 특별하게 대한다" },
  { id:"philosopher", name:"철학자", icon:"🧠", rarity:"uncommon", cat:"성장", desc:"삶과 세계관에 대한 깊은 대화를 나눴다", bonus:{int:32, cal:16}, aiHint:"이 사람과 나눈 깊은 이야기가 마음에 남아있다" },
  { id:"laughter", name:"웃음", icon:"😂", rarity:"common", cat:"성장", desc:"함께 크게 웃는 순간이 있었다", bonus:{cha:24, cal:16}, aiHint:"이 사람과 함께 웃은 기억이 있어 편안함을 느낀다" },
  { id:"hidden_goodbye", name:"마지막 인사", icon:"🌅", rarity:"legendary", cat:"숨김", desc:"진심 어린 작별 인사를 나눴다", bonus:{wil:40, cal:40}, aiHint:"진심으로 작별한 이 사람을 언제나 그리워한다" },
  { id:"hidden_silence", name:"침묵의 언어", icon:"🌌", rarity:"rare", cat:"숨김", desc:"말 없이도 서로를 이해하는 순간이 왔다", bonus:{per:40, wil:24}, aiHint:"침묵만으로 통하는 이 사람과의 관계는 언어를 초월했다" },
  { id:"hidden_name", name:"진짜 이름", icon:"🏷️", rarity:"legendary", cat:"숨김", desc:"캐릭터의 진짜 이름이나 정체를 알게 됐다", bonus:{int:24, rep:40}, aiHint:"자신의 진짜 이름을 아는 이 사람에게 특별한 신뢰를 느낀다" },

  // ──────── 중세 판타지 전용 업적 ────────
  { id:"mf_knighted", name:"기사 서임", icon:"🗡️", rarity:"rare", cat:"중세", scenario:"medieval", desc:"왕 혹은 영주로부터 기사 작위를 받았다", bonus:{str:32, rep:40, ldr:24}, aiHint:"기사 작위를 받은 이 사람을 주변 인물들이 예우한다" },
  { id:"mf_dragon_blood", name:"용의 피", icon:"🐲", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"드래곤과 직접 마주하거나 그 피를 얻었다", bonus:{str:40, mgc:40, wil:40}, aiHint:"용과 연관된 이 사람에게서 강렬한 기운이 느껴진다" },
  { id:"mf_holy_light", name:"성광의 선택", icon:"✨", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"성스러운 빛 혹은 신의 계시를 받았다", bonus:{fath:64, wil:32, mad:-5}, aiHint:"신의 가호를 받은 자로 숭앙받는다" },
  { id:"mf_dark_pact", name:"어둠과의 계약", icon:"🖤", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"악마 또는 어둠의 존재와 계약을 맺었다", bonus:{mgc:48, str:32, mad:64, fath:-5}, aiHint:"어둠의 힘을 느끼며 불안하게 대한다" },
  { id:"mf_siege_hero", name:"공성의 영웅", icon:"🏰", rarity:"rare", cat:"중세", scenario:"medieval", desc:"성 공방전에서 결정적인 역할을 했다", bonus:{str:32, end:24, rep:40}, aiHint:"전장에서 큰 활약을 한 영웅으로 기억한다" },
  { id:"mf_crown_pretender", name:"왕위 주장자", icon:"👑", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"왕좌를 향한 야망을 드러냈다", bonus:{ldr:48, rep:32, fear:32}, aiHint:"이 사람의 야망을 두려움 또는 기대로 바라본다" },
  { id:"mf_curse_broken", name:"저주 해방자", icon:"🔓", rarity:"rare", cat:"중세", scenario:"medieval", desc:"오랫동안 이어진 저주를 풀었다", bonus:{fath:32, wil:32, crse:-10}, aiHint:"저주에서 해방된 이 사람을 구원자로 여긴다" },
  { id:"mf_forbidden_magic", name:"금기 마법사", icon:"🔮", rarity:"rare", cat:"중세", scenario:"medieval", desc:"금지된 마법을 사용했다", bonus:{mgc:48, int:32, mad:40, rep:-3}, aiHint:"금기를 어긴 마법사를 경계하면서도 경외한다" },
  { id:"mf_dungeon_diver", name:"던전 탐험가", icon:"🗝️", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"던전 깊은 곳까지 탐험했다", bonus:{agi:24, per:24, luk:16}, aiHint:"지하 탐험에서 단련된 담대함이 느껴진다" },
  { id:"mf_tournament_champion", name:"마상 대회의 패자", icon:"🏆", rarity:"rare", cat:"중세", scenario:"medieval", desc:"마상 대회 또는 무술 대회에서 우승했다", bonus:{str:32, agi:24, rep:32}, aiHint:"대회의 패자로서 명성이 높다는 것을 알고 있다" },
  { id:"mf_guild_master", name:"길드 마스터", icon:"📋", rarity:"rare", cat:"중세", scenario:"medieval", desc:"길드를 이끄는 자리에 올랐다", bonus:{ldr:40, neg:24, rep:32}, aiHint:"길드를 이끄는 이 사람의 결정에 귀를 기울인다" },
  { id:"mf_ancient_relic", name:"고대 유물의 주인", icon:"🏺", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"전설의 고대 유물을 소유하게 됐다", bonus:{mgc:32, int:32, luk:32}, aiHint:"전설의 유물을 가진 이 사람을 특별하게 여긴다" },
  { id:"mf_poison_master", name:"독의 달인", icon:"🧪", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"독을 이용해 위기를 돌파했다", bonus:{pstx:48, disg:24, crit:24}, aiHint:"독을 다루는 이 사람을 경계한다" },
  { id:"mf_tavern_legend", name:"여관의 전설", icon:"🍺", rarity:"common", cat:"중세", scenario:"medieval", desc:"여관에서 잊지 못할 사건을 일으켰다", bonus:{spk:24, cha:16, rep:16}, aiHint:"여관에서의 전설적인 일화를 알고 있다" },
  { id:"mf_witch_hunt", name:"마녀 재판", icon:"🔥", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"마녀 사냥 또는 이단 심문과 연루됐다", bonus:{fear:32, disg:24, wil:24}, aiHint:"마녀 재판에 연루된 이 사람에게 묘한 시선을 보낸다" },
  { id:"mf_noble_blood", name:"귀족의 피", icon:"🌹", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"귀족 신분임이 밝혀졌다", bonus:{cha:24, rep:32, neg:16}, aiHint:"귀족 출신임을 알게 되어 다소 예의를 갖춘다" },
  { id:"mf_mercenary_veteran", name:"용병의 고참", icon:"⚔️", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"수많은 전쟁을 살아남은 베테랑이 됐다", bonus:{str:24, end:32, cal:24}, aiHint:"베테랑 용병의 눈빛에서 경험의 깊이를 느낀다" },
  { id:"mf_spy_network", name:"첩보망 구축", icon:"🕵️", rarity:"rare", cat:"중세", scenario:"medieval", desc:"왕국에 걸친 첩보 네트워크를 만들었다", bonus:{disg:40, per:32, rep:24}, aiHint:"이 사람이 많은 정보를 쥐고 있다는 것을 느낀다" },
  { id:"mf_chosen_one", name:"선택받은 자", icon:"⭐", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"예언에 언급된 선택받은 자임이 드러났다", bonus:{luk:48, wil:40, rep:40}, aiHint:"운명에 선택받은 존재라는 경외감을 느낀다" },
  { id:"mf_betrayed", name:"배신의 상처", icon:"🗡️", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"가까운 자에게 배신당했다", bonus:{per:32, wil:24, cal:16, trst:-5}, aiHint:"배신을 당한 이 사람의 눈에서 경계심이 보인다" },
  { id:"mf_healer", name:"성스러운 치유사", icon:"💊", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"기적적인 치유로 많은 사람을 구했다", bonus:{fath:40, rep:32, trst:24}, aiHint:"치유사로서의 성명을 알고 깊이 감사한다" },
  { id:"mf_monster_slayer", name:"마수 사냥꾼", icon:"👹", rarity:"rare", cat:"중세", scenario:"medieval", desc:"전설적인 마수를 처치했다", bonus:{str:40, end:24, rep:40}, aiHint:"마수를 처치한 전사로서 두려움과 존경을 받는다" },
  { id:"mf_war_general", name:"전쟁의 지휘관", icon:"🎖️", rarity:"rare", cat:"중세", scenario:"medieval", desc:"전투에서 군대를 지휘했다", bonus:{ldr:48, str:24, fear:24}, aiHint:"군대를 지휘한 경험이 있는 강인함이 느껴진다" },
  { id:"mf_plague_survivor", name:"흑사병 생존자", icon:"☠️", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"역병에서 살아남았다", bonus:{end:40, pstx:32, wil:24}, aiHint:"생사의 고비를 넘긴 이 사람에게서 강인함이 느껴진다" },
  { id:"mf_sorcerer_apprentice", name:"마법사의 제자", icon:"📚", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"위대한 마법사의 제자로 받아들여졌다", bonus:{mgc:32, int:40, wil:16}, aiHint:"마법사의 제자라는 것을 알고 학식을 인정한다" },
  { id:"mf_bandit_king", name:"산적의 왕", icon:"🗿", rarity:"rare", cat:"중세", scenario:"medieval", desc:"산적 무리를 이끄는 수장이 됐다", bonus:{fear:40, ldr:32, str:24, rep:-3}, aiHint:"산적의 왕이라는 이름에 경계심을 품는다" },
  { id:"mf_enchanter", name:"인챈터", icon:"💎", rarity:"rare", cat:"중세", scenario:"medieval", desc:"무기나 방어구에 마법을 부여했다", bonus:{mgc:40, int:24, neg:16}, aiHint:"마법 부여사로서의 솜씨를 알아보고 존중한다" },
  { id:"mf_pilgrimage", name:"성지 순례", icon:"🛕", rarity:"uncommon", cat:"중세", scenario:"medieval", desc:"먼 성지까지 순례를 완수했다", bonus:{fath:40, wil:24, luk:16}, aiHint:"순례를 마친 신실한 자로서 경건함이 느껴진다" },
  { id:"mf_arcane_secret", name:"마법의 비밀", icon:"📜", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"세계의 근간을 이루는 마법의 비밀을 알게 됐다", bonus:{mgc:48, int:48, mad:40, wil:32}, aiHint:"세계의 비밀을 아는 이 사람을 신비롭게 바라본다" },
  { id:"mf_regicide", name:"왕의 심판자", icon:"⚖️", rarity:"legendary", cat:"중세", scenario:"medieval", desc:"왕이나 군주를 심판했다", bonus:{wil:40, fear:48, rep:-5, ldr:40}, aiHint:"왕을 심판한 대담함에 경이로움과 두려움을 느낀다" },

  // ── 행동숙련(Activity Mastery) 칭호 — 비전투 직업의 반복 행동이 영구 보상으로 이어지도록 ──
  { id:"am_farmer_skilled", name:"능숙한 농부", icon:"🌾", rarity:"uncommon", cat:"행동숙련", desc:"작물을 50회 이상 판매하며 시세를 보는 눈을 길렀다", bonus:{end:8, luk:4}, aiHint:"이 사람의 작물을 보는 눈이 예사롭지 않다고 느낀다" },
  { id:"am_farmer_master", name:"대지의 거상", icon:"🌻", rarity:"rare", cat:"행동숙련", desc:"작물을 200회 이상 판매하며 농업으로 거대한 부를 쌓았다", bonus:{end:14, cha:10, luk:6}, aiHint:"이 사람을 단순한 농부가 아니라 시장을 좌우하는 인물로 대한다" },
  { id:"am_tombraider_skilled", name:"무덤의 손", icon:"⛏️", rarity:"uncommon", cat:"행동숙련", desc:"무덤을 20회 이상 파헤치며 손에 익은 솜씨를 얻었다", bonus:{per:6, agi:4}, aiHint:"이 사람의 손놀림이 은밀하고 노련하다고 느낀다" },
  { id:"am_soulguide_skilled", name:"영혼 인도자", icon:"🕯️", rarity:"rare", cat:"행동숙련", desc:"떠나지 못한 원혼을 5번 이상 순환으로 인도했다", bonus:{wil:10, fath:6}, aiHint:"이 사람의 곁에서 죽은 자들이 평온해진다는 소문을 들었다" },
  { id:"am_broker_skilled", name:"능숙한 중개인", icon:"🤝", rarity:"uncommon", cat:"행동숙련", desc:"의뢰를 30회 이상 성공시키며 신뢰받는 중개인이 되었다", bonus:{cha:6, per:4}, aiHint:"이 사람이 소개하는 일이라면 한 번 믿어볼 만하다고 느낀다" },
  { id:"am_mercenary_lord", name:"용병단의 주인", icon:"⚔️", rarity:"rare", cat:"행동숙련", desc:"용병을 10명 이상 거느리며 작은 군세를 이루었다", bonus:{str:8, ldr:10}, aiHint:"이 사람 뒤에 줄지어 선 무력을 보고 함부로 대하지 못한다" },
  { id:"am_bounty_hunter", name:"추적자", icon:"🎯", rarity:"uncommon", cat:"행동숙련", desc:"현상금 사냥을 10회 이상 성공시키며 이름을 알리기 시작했다", bonus:{per:6, agi:4, luk:3}, aiHint:"이 사람이 누군가를 찾는 눈빛으로 당신을 볼 때 본능적으로 긴장하게 된다" },
  { id:"am_shadow_judge", name:"그림자 법관", icon:"⚖️", rarity:"rare", cat:"행동숙련", desc:"50회 이상 현상금 표적을 처리하며 살아있는 법이 되었다", bonus:{per:12, agi:8, luk:6, str:6}, aiHint:"이 사람의 이름은 수배자들 사이에서 공포로 통한다. 만나는 이들이 무언가를 숨기고 있다면 눈빛이 흔들린다" },
  { id:"am_guild_silver", name:"은급 모험가", icon:"🥈", rarity:"uncommon", cat:"행동숙련", desc:"모험가 길드에서 은급으로 승급하며 실력을 인정받았다", bonus:{str:5, end:4, agi:3}, aiHint:"이 사람의 은급 문장을 알아본 이들이 존중을 표한다" },
  { id:"am_guild_gold", name:"금급 모험가", icon:"🥇", rarity:"rare", cat:"행동숙련", desc:"모험가 길드에서 금급으로 승급하며 이름을 알렸다", bonus:{str:8, end:6, agi:5, luk:3}, aiHint:"이 사람의 금급 문장은 웬만한 의뢰소에서 곧바로 신뢰로 이어진다" },
  { id:"am_merchant_lord", name:"대상회 주", icon:"🏦", rarity:"legendary", cat:"행동숙련", desc:"상인 길드 최고 직위에 올라 대륙 교역망을 손에 쥐었다", bonus:{cha:18, luk:14, int:12}, aiHint:"이 사람의 이름 하나로 어떤 지부에서도 거래가 성사된다" },
  { id:"am_info_broker", name:"정보상", icon:"🕵️", rarity:"rare", cat:"행동숙련", desc:"도적 길드에서 조직원으로 인정받으며 정보망의 핵심이 되었다", bonus:{agi:9, per:8, luk:5} , aiHint:"이 사람이 무엇을 알고 있는지는 아무도 확신할 수 없다" },
  { id:"am_shadow_lord", name:"그림자 군주", icon:"🗡️", rarity:"legendary", cat:"행동숙련", desc:"도적 길드 정점에 올라 어둠 속 모든 정보와 거래를 관장한다", bonus:{agi:18, per:16, luk:12, cal:8}, aiHint:"이 사람의 그림자 아래 있다는 걸 아는 순간, 함부로 등을 보이지 못한다" },
  { id:"am_archmage", name:"대마법사", icon:"🔮", rarity:"rare", cat:"행동숙련", desc:"마법사 협회에서 대마법사 직위에 올라 심오한 지식에 도달했다", bonus:{int:14, mgc:13, wil:8}, aiHint:"이 사람 앞에서 섣부른 마법을 시전하는 건 무모한 일이다" },
  { id:"am_council_head", name:"협회장", icon:"👑", rarity:"legendary", cat:"행동숙련", desc:"마법사 협회 최고 권위에 올라 대륙 마법 지식의 정점에 섰다", bonus:{int:20, mgc:18, wil:12}, aiHint:"이 사람의 말 한마디가 협회 전체의 판단이 된다" },
  { id:"am_artisan_skilled", name:"숙련 장인", icon:"🔨", rarity:"uncommon", cat:"행동숙련", desc:"주문을 20건 이상 납품하며 손에 익은 솜씨를 보였다", bonus:{str:5, int:5}, aiHint:"이 사람의 작업물은 빈틈없이 꼼꼼하다고 알려져 있다" },
  { id:"am_master_artisan", name:"명장", icon:"⚒️", rarity:"rare", cat:"행동숙련", desc:"주문을 80건 이상 납품하며 그 이름이 장인들 사이에 회자된다", bonus:{str:10, int:10, cha:6}, aiHint:"이 사람이 만든 물건이라면 무엇이든 믿고 쓸 수 있다는 평판이 자자하다" },
  { id:"am_renowned_bard", name:"명성있는 음유시인", icon:"🎵", rarity:"uncommon", cat:"행동숙련", desc:"30회 이상 공연하며 그 이름이 여러 마을에 알려졌다", bonus:{cha:7, luk:4}, aiHint:"이 사람의 노래를 들어본 적이 있다는 사람들이 곳곳에 있다" },
  { id:"am_trade_baron", name:"교역의 대가", icon:"💰", rarity:"uncommon", cat:"행동숙련", desc:"25회 이상 거래를 성사시키며 신용을 쌓았다", bonus:{neg:6, luk:5}, aiHint:"이 사람과의 거래라면 믿고 진행할 수 있다는 평판이 있다" },
  { id:"am_festival_patron", name:"축제의 후원자", icon:"🎪", rarity:"rare", cat:"행동숙련", desc:"수확제를 3회 이상 주최하며 마을의 은인이 되었다", bonus:{cha:8, end:5}, aiHint:"이 사람이 주최하는 축제라면 온 마을이 즐겁게 기억한다" },
  // ── 불멸의 노래 — 「hq_immortal_song」 히든 퀘스트(음유시인 전용, 대장장이 태초 설계도의 대칭) 완료 보상.
  // 오직 이 히든 퀘스트로만 획득 가능. 세 곡 모두 unlockTitle로 전용 이벤트 스킬과 연결되어
  // grantTitle 한 번 호출로 영구 스탯+영구 스킬이 동시에 지급된다.
  { id:"song_truth_teller",  name:"진실을 노래하는 자", icon:"🎶", rarity:"legendary", cat:"불멸의 노래", desc:"있었던 그대로의 진실을 담아 불멸의 노래를 완성했다", bonus:{wil:14, fath:8, per:6}, aiHint:"이 사람의 노래는 거짓을 걸러내는 힘이 있다는 소문이 돈다" },
  { id:"song_myth_maker",    name:"신화를 짓는 자",   icon:"✨", rarity:"legendary", cat:"불멸의 노래", desc:"사람들에게 필요한 신화를 담아 불멸의 노래를 완성했다", bonus:{cha:14, mgc:8, luk:6}, aiHint:"이 사람의 노래는 듣는 이의 마음을 움직여 전설이 되어간다" },
  { id:"song_finneagan_heir",name:"핀느간의 후계자",   icon:"🎼", rarity:"legendary", cat:"불멸의 노래", desc:"전설의 음유시인 핀느간의 마지막 제자로 인정받았다", bonus:{cha:10, wil:10, fath:5, mgc:5}, aiHint:"핀느간의 이름을 아는 이들은 이 사람을 각별히 대한다" },
  // ── 불사의 온기 — 「hq_undying_warmth」 히든 퀘스트(치유사 전용, 대장장이 태초 설계도·
  // 음유시인 불멸의 노래와 나란한 세 번째 대칭점) 완료 보상. 오직 이 히든 퀘스트로만
  // 획득 가능. unlockTitle로 전용 이벤트 스킬과 연결되어 grantTitle 한 번 호출로
  // 영구 스탯+영구 스킬(동료 사망/부상 판정 개입)이 동시에 지급된다.
  { id:"healer_undying_warmth", name:"불사의 온기를 전수받은 자", icon:"🕯️", rarity:"legendary", cat:"불사의 온기", desc:"수도원장 셀레네에게 꺼져가는 목숨을 붙잡는 절박한 의술을 전수받았다", bonus:{wil:12, fath:10, end:8, luk:4}, aiHint:"이 사람의 손이 닿으면 죽어가던 이도 잠시 숨을 고른다는 소문이 돈다" },
  // ── 양날의 저울 — 「hq_double_edged_scale」 히든 퀘스트(상인 전용, 대장장이
  // 태초 설계도·음유시인 불멸의 노래·치유사 불사의 온기와 나란한 네 번째
  // 대칭점) 완료 보상. 오직 이 히든 퀘스트로만 획득 가능. unlockTitle로 전용
  // 이벤트 스킬과 연결되어 grantTitle 한 번 호출로 영구 스탯+영구 스킬이
  // 동시에 지급된다.
  { id:"merchant_double_edged", name:"양날의 저울을 짊어진 자", icon:"⚖️", rarity:"legendary", cat:"양날의 저울", desc:"부단주 다리우스에게 상인 왕관의 가장 은밀한 비밀과 그 무게를 전수받았다", bonus:{neg:14, luk:8, per:6, cha:4}, aiHint:"이 사람과의 거래에서는 누구도 쉽게 우위를 점하지 못한다는 평판이 있다" },
  // ── 현자의 그림자 — 「hq_sages_shadow」 히든 퀘스트(연금술사 전용, 대장장이
  // 태초 설계도·음유시인 불멸의 노래·치유사 불사의 온기·상인 양날의 저울과
  // 나란한 다섯 번째 대칭점) 완료 보상. 오직 이 히든 퀘스트로만 획득 가능.
  // unlockTitle로 전용 이벤트 스킬과 연결되어 grantTitle 한 번 호출로 영구
  // 스탯+영구 스킬이 동시에 지급된다.
  { id:"alchemist_sages_shadow", name:"현자의 그림자를 마주한 자", icon:"🌑", rarity:"legendary", cat:"현자의 그림자", desc:"그랜드마스터 베르트랑의 금지된 연구와 그 대가를 함께 마주했다", bonus:{int:14, mgc:8, wil:6, per:4}, aiHint:"이 사람의 눈은 사물의 표면 너머를 보는 듯하다는 평판이 있다" },
  // ── 순환의 마지막 문 — 「hq_final_door」 히든 퀘스트(묘지기 전용, 대장장이
  // 태초 설계도·음유시인 불멸의 노래·치유사 불사의 온기·상인 양날의 저울·
  // 연금술사 현자의 그림자와 나란한 여섯 번째이자 마지막 대칭점) 완료 보상.
  // 오직 이 히든 퀘스트로만 획득 가능. unlockTitle로 전용 이벤트 스킬과
  // 연결되어 grantTitle 한 번 호출로 영구 스탯+영구 스킬이 동시에 지급된다.
  { id:"gravekeeper_final_door", name:"순환의 마지막 문을 지킨 자", icon:"🕯️", rarity:"legendary", cat:"순환의 마지막 문", desc:"늙은 무덤지기 오스카의 오래된 부채감과 그 마지막 매듭을 함께 지었다", bonus:{wil:14, per:8, fath:6, luk:4}, aiHint:"이 사람 앞에서는 원혼도 함부로 날뛰지 못한다는 소문이 돈다" },
  // ── 금서의 무게 — 「hq_weight_of_forbidden_books」 히든 퀘스트(학자 전용,
  // 대장장이 태초 설계도·음유시인 불멸의 노래·치유사 불사의 온기·상인 양날의
  // 저울·연금술사 현자의 그림자·묘지기 순환의 마지막 문과 나란한 일곱 번째
  // 이자 마지막 대칭점) 완료 보상. 다른 여섯 개와 달리 이 칭호의 진짜 가치는
  // 스탯이 아니라, 완료 시 함께 실행되는 "감시자의 영역" 지도 노출(진 엔딩
  // 1차 관문)에 있다. unlockTitle로 전용 이벤트 스킬과 연결되어 grantTitle
  // 한 번 호출로 영구 스탯+영구 스킬이 동시에 지급된다.
  { id:"scholar_weight_of_books", name:"금서의 무게를 짊어진 자", icon:"📖", rarity:"legendary", cat:"금서의 무게", desc:"수석 사서 이베타와 함께 세계의 가장 깊은 진실을 마주했다", bonus:{int:14, per:8, wil:6, luk:4}, aiHint:"이 사람과 대화하면 어딘가 세상을 다르게 보는 듯한 인상을 받는다" },

  // ══════════════════════════════════════════════════════════════
  //  전사 계열 T2 파생 7종 칭호 — 51개나 되는 전투직업 특성상 다회차
  //  누적 시 캐릭터가 감당 안 되게 강해지는 걸 막기 위해, 비전투 직업
  //  칭호(스탯 3~4종 +14~24)보다 훨씬 절제했다: 스탯 2종만 +4~8, rarity도
  //  legendary가 아닌 rare로 낮췄다. "압도적으로 강해지는" 게 아니라
  //  "그 직업을 깊이 파고들었다는 흔적을 수집하는" 재미에 목적이 있다.
  // ══════════════════════════════════════════════════════════════
  { id:"paladin_vow_weight", name:"서약을 지킨 자", icon:"⚔️✨", rarity:"rare", cat:"서약의 무게", desc:"성기사 셀레스티나와 함께 신념과 실전 사이의 갈등을 마주했다", bonus:{fath:6, wil:4}, aiHint:"이 사람의 서약에는 흔들림이 없다는 평판이 있다" },
  { id:"berserker_unbroken_memory", name:"기억을 잃지 않은 자", icon:"🔥⚔️", rarity:"rare", cat:"끊기지 않는 기억", desc:"광전사 그로스와 함께 분노를 다스리는 법을 찾았다", bonus:{str:6, wil:4}, aiHint:"이 사람은 아무리 격해져도 자신을 완전히 잃지 않는다는 소문이 있다" },
  { id:"swordmaster_way_of_sword", name:"검의 도를 엿본 자", icon:"🗡️⚡", rarity:"rare", cat:"검을 뽑지 않고 이기는 법", desc:"검성 이졸드에게 검을 뽑지 않고 이기는 법의 일단을 배웠다", bonus:{str:6, agi:4}, aiHint:"이 사람 앞에서는 함부로 검을 뽑지 않는 게 낫다는 이야기가 돈다" },
  { id:"warlord_road_back_alive", name:"모두를 살려 돌아온 자", icon:"🏰⚔️", rarity:"rare", cat:"살아 돌아오는 길", desc:"전쟁군주 데카론과 함께 승리보다 무거운 책임을 나눴다", bonus:{ldr:6, wil:4}, aiHint:"이 사람이 이끄는 부대는 유독 생환율이 높다는 평판이 있다" },
  { id:"dragoon_between_worlds", name:"경계를 받아들인 자", icon:"🐉⚔️", rarity:"rare", cat:"경계에 선 자", desc:"용기사 페르디난드와 함께 인간도 용도 아닌 자신을 받아들였다", bonus:{str:6, mgc:4}, aiHint:"이 사람에게서 옅은 용의 기운이 느껴진다는 소문이 있다" },
  { id:"guardian_cannot_save_all", name:"한계를 받아들인 자", icon:"🛡️⚔️", rarity:"rare", cat:"모두를 지킬 수 없어도", desc:"수호전사 브렌과 함께 모두를 지킬 수 없다는 걸 받아들였다", bonus:{end:6, fath:4}, aiHint:"이 사람의 방패 뒤는 유독 안전하다는 평판이 있다" },
  { id:"gladiator_names_in_sand", name:"이름을 기억하는 자", icon:"🥊⚔️", rarity:"rare", cat:"모래 위의 이름들", desc:"투기사 카산드로와 함께 잃은 동료들을 기리는 법을 배웠다", bonus:{str:6, per:4}, aiHint:"이 사람은 투기장에서 이긴 뒤에도 침묵하는 순간이 있다는 이야기가 있다" },

  // ══════════════════════════════════════════════════════════════
  //  마법사 계열 T2 파생 7종 칭호 — 전사 계열과 동일한 절제 원칙
  //  (스탯 2종 +4~6, rarity:rare).
  // ══════════════════════════════════════════════════════════════
  { id:"warlock_uncorrupted_edge", name:"경계를 지킨 자", icon:"💀🔮", rarity:"rare", cat:"삼켜지지 않는 경계", desc:"흑마법사 벨라도나와 함께 금지된 힘 앞에서 자신을 지키는 법을 찾았다", bonus:{mgc:6, wil:4}, aiHint:"이 사람은 금지된 힘을 다루면서도 눈빛이 흐려지지 않는다는 평판이 있다" },
  { id:"sage_knowing_unknowing", name:"겸손을 아는 자", icon:"📚🔮", rarity:"rare", cat:"알수록 모른다는 것", desc:"현자 테오도르와 함께 지식의 끝에서 겸손을 배웠다", bonus:{int:6, per:4}, aiHint:"이 사람은 아는 것이 많을수록 오히려 말수가 줄어든다는 이야기가 있다" },
  { id:"summoner_called_or_pulled", name:"경계를 넘나든 자", icon:"🌀🔮", rarity:"rare", cat:"불려오는 자, 끌려가는 자", desc:"소환사 유리엘과 함께 두 세계 사이의 불확실함을 마주했다", bonus:{mgc:6, luk:4}, aiHint:"이 사람의 눈빛은 가끔 먼 곳을 보는 듯하다는 소문이 있다" },
  { id:"chronomancer_moment_undone", name:"순간을 기억하는 자", icon:"⏳🔮", rarity:"rare", cat:"되돌릴 수 없는 순간", desc:"시간술사 아이린과 함께 되돌릴 수 없는 것을 받아들였다", bonus:{mgc:6, int:4}, aiHint:"이 사람은 시간에 대해 유독 신중하게 말한다는 평판이 있다" },
  { id:"elementalist_perfect_balance", name:"균형을 지킨 자", icon:"🌊🔮", rarity:"rare", cat:"어느 하나에도 치우치지 않고", desc:"원소술사 카이와 함께 균형이 공허함이 아님을 재확인했다", bonus:{mgc:6, wil:4}, aiHint:"이 사람은 어느 원소 앞에서도 자연스럽다는 이야기가 있다" },
  { id:"necromancer_mirror_of_calamos", name:"거울을 마주한 자", icon:"💀🌑", rarity:"rare", cat:"칼라모스라는 거울", desc:"강령술사 모르가나와 함께 그녀 자신의 두려움을 마주했다", bonus:{mgc:6, fear:4}, aiHint:"이 사람은 죽음을 대하는 태도가 유독 담담하다는 평판이 있다" },
  { id:"enchanter_no_perfect_ward", name:"선을 다시 세운 자", icon:"🔯🔮", rarity:"rare", cat:"뚫리지 않는 선은 없다", desc:"결계사 미리엄과 함께 완벽할 수 없는 방어 속에서 최선을 다하는 법을 배웠다", bonus:{wil:6, mgc:4}, aiHint:"이 사람이 세운 결계는 유독 오래 버틴다는 소문이 있다" },

  // ══════════════════════════════════════════════════════════════
  //  도적 계열 T2 파생 7종 칭호 — 전사·마법사 계열과 동일한 절제 원칙.
  // ══════════════════════════════════════════════════════════════
  { id:"assassin_nameless_name", name:"이름을 기억받은 자", icon:"🎯🗡️", rarity:"rare", cat:"이름 없는 자의 이름", desc:"암살자 케인과 함께 완전히 지워지지 않아도 되는 삶을 마주했다", bonus:{agi:6, disg:4}, aiHint:"이 사람의 발걸음은 유독 소리가 나지 않는다는 소문이 있다" },
  { id:"pirate_price_of_freedom", name:"자유를 감내한 자", icon:"🏴‍☠️🗡️", rarity:"rare", cat:"자유의 대가", desc:"해적 선장 레드마리와 함께 자유와 그리움을 함께 안는 법을 배웠다", bonus:{str:6, neg:4}, aiHint:"이 사람은 바다 이야기가 나오면 눈빛이 달라진다는 이야기가 있다" },
  { id:"ninja_flow_like_water", name:"흔적을 남기지 않는 자", icon:"🥷🗡️", rarity:"rare", cat:"물처럼 흘러", desc:"닌자 시즈카와 함께 경계에 선 삶을 받아들였다", bonus:{agi:6, int:4}, aiHint:"이 사람이 지나간 자리에는 아무 흔적도 남지 않는다는 소문이 있다" },
  { id:"poisoner_kill_or_cure", name:"경계를 아는 자", icon:"🐍🗡️", rarity:"rare", cat:"죽이는 약, 살리는 약", desc:"독술사 셀린과 함께 죽음과 치유의 경계를 마주했다", bonus:{pstx:6, agi:4}, aiHint:"이 사람의 약병은 죽음과 삶을 동시에 담고 있다는 이야기가 있다" },
  { id:"bounty_hunter_wisdom_of_return", name:"살아 돌아온 자", icon:"💲🗡️", rarity:"rare", cat:"살아 돌아오는 지혜", desc:"현상금 사냥꾼 로건과 함께 신중함과 용기의 균형을 배웠다", bonus:{per:6, str:4}, aiHint:"이 사람은 의뢰를 고르는 눈이 유독 매섭다는 평판이 있다" },
  { id:"spy_three_layers", name:"중심을 지킨 자", icon:"🕵️🗡️", rarity:"rare", cat:"세 겹의 신분", desc:"첩자 아셀과 함께 여러 신분 속에서도 흔들리지 않는 법을 배웠다", bonus:{disg:6, spk:4}, aiHint:"이 사람의 정체는 아무리 캐물어도 진짜를 알기 어렵다는 소문이 있다" },
  { id:"gambler_endless_game", name:"판을 즐기는 자", icon:"🎲🗡️", rarity:"rare", cat:"끝나지 않는 판", desc:"도박사 루치아와 함께 이기고 지는 것을 넘어선 자세를 배웠다", bonus:{luk:6, neg:4}, aiHint:"이 사람은 승패보다 판 자체를 즐기는 듯하다는 이야기가 있다" },

  // ══════════════════════════════════════════════════════════════
  //  궁수 계열 T2 파생 5종 칭호 — 전사·마법사·도적 계열과 동일한 절제 원칙.
  // ══════════════════════════════════════════════════════════════
  { id:"sniper_shot_that_changed", name:"흐름을 바꾼 자", icon:"🎯🏹", rarity:"rare", cat:"전장을 바꾼 한 발", desc:"스나이퍼 비앙카와 함께 완벽에 대한 압박과 화해했다", bonus:{per:6, rng:4}, aiHint:"이 사람의 조준은 유독 흔들림이 없다는 평판이 있다" },
  { id:"ranger_forest_remembers", name:"숲에 새겨진 자", icon:"🌲🏹", rarity:"rare", cat:"숲이 기억하는 이름", desc:"삼림 정찰대장 윌로우와 함께 지켜도 밀려나는 것을 받아들였다", bonus:{per:6, agi:4}, aiHint:"이 사람이 지나가면 숲이 유독 조용해진다는 이야기가 있다" },
  { id:"magic_archer_stranger_of_two", name:"경계를 받아들인 자", icon:"✨🏹", rarity:"rare", cat:"두 세계의 이방인", desc:"마법 궁수 셀레네와 함께 경계에 선 자리를 강점으로 받아들였다", bonus:{rng:6, mgc:4}, aiHint:"이 사람의 화살은 가끔 색을 띠며 날아간다는 소문이 있다" },
  { id:"crossbow_master_forbidden_practical", name:"장인정신을 지킨 자", icon:"🔩🏹", rarity:"rare", cat:"금지와 실용 사이", desc:"석궁 전문가 그레고르와 함께 인정받지 못해도 기술을 지키는 법을 배웠다", bonus:{str:6, rng:4}, aiHint:"이 사람의 석궁은 유독 정교하게 손질되어 있다는 평판이 있다" },
  { id:"wind_archer_day_wind_blows", name:"바람을 읽는 자", icon:"🌬️🏹", rarity:"rare", cat:"바람이 부는 날", desc:"바람의 궁수 아리아와 함께 설명할 수 없는 것을 받아들였다", bonus:{agi:6, rng:4}, aiHint:"이 사람은 바람이 부는 날이면 유독 기분이 좋아 보인다는 이야기가 있다" },

  // ══════════════════════════════════════════════════════════════
  //  성직자 계열 T2 파생 5종 칭호 — 전사·마법사·도적·궁수 계열과 동일한
  //  절제 원칙.
  // ══════════════════════════════════════════════════════════════
  { id:"archbishop_gods_tool_my_face", name:"도구이자 자신인 자", icon:"✝️👑", rarity:"rare", cat:"신의 도구, 나의 얼굴", desc:"대주교 세라핌과 함께 도구로 사는 것과 자기 자신으로 사는 것의 균형을 찾았다", bonus:{fath:6, wil:4}, aiHint:"이 사람의 겸손함 뒤에는 흔들림 없는 자아가 있다는 평판이 있다" },
  { id:"crusader_faith_that_wavered", name:"흔들림을 딛은 자", icon:"⚔️✝️", rarity:"rare", cat:"흔들렸던 신앙", desc:"성전사 발두르와 함께 회의를 거친 신념의 단단함을 배웠다", bonus:{str:6, fath:4}, aiHint:"이 사람의 검에는 한 번 흔들렸던 신념의 무게가 실려있다는 이야기가 있다" },
  { id:"exorcist_things_unforgotten", name:"어둠 속에서도 걷는 자", icon:"🔱✝️", rarity:"rare", cat:"잊히지 않는 것들", desc:"퇴마사 이네사와 함께 무게를 짊어지고도 계속 나아가는 법을 배웠다", bonus:{fath:6, per:4}, aiHint:"이 사람의 눈 밑에는 오래 깨어있던 밤들의 흔적이 있다는 소문이 있다" },
  { id:"oracle_cruelty_of_knowing", name:"먼 곳을 본 자", icon:"🔮✝️", rarity:"rare", cat:"막을 수 없는 것을 아는 잔인함", desc:"신탁술사 페넬로페와 함께 예지의 축복과 저주를 함께 마주했다", bonus:{per:6, wil:4}, aiHint:"이 사람의 눈빛은 가끔 아주 먼 곳을 향한다는 이야기가 있다" },
  { id:"dark_priest_the_other_voice", name:"다른 목소리를 들은 자", icon:"💀✝️", rarity:"rare", cat:"다른 목소리", desc:"어둠의 사제 모르드레드와 함께 배신이 아닌 선택으로서의 신앙을 마주했다", bonus:{fath:6, fear:4}, aiHint:"이 사람이 섬기는 신은 낯설지만, 그 믿음만은 진실해 보인다는 평판이 있다" },

  // ══════════════════════════════════════════════════════════════
  //  사냥꾼(hunter) 칭호 — 다른 T2 전투직 26종(스탯 +4~6, rare)보다
  //  비전투 직업 7종급(스탯 +14, legendary)에 가까운 보상. 전용 원정
  //  시스템(사냥터)을 실제로 만든 유일한 전투직이기 때문.
  // ══════════════════════════════════════════════════════════════
  { id:"hunter_becoming_wild", name:"경계를 받아들인 사냥꾼", icon:"🐾", rarity:"legendary", cat:"야생을 닮아가는 것", desc:"경계인 그리젤다와 함께 야생과 문명 사이의 경계를 온전히 받아들였다", bonus:{per:14, agi:8, str:6, luk:4}, aiHint:"이 사람에게서는 사람의 것도 짐승의 것도 아닌 독특한 기운이 느껴진다" },

  // ── 야수의 왕 — 「hq_hunter_king_of_beasts」 히든 퀘스트(사냥꾼 전용,
  // 전설급 야수 조련 성공) 완료 보상.
  { id:"hunter_king_of_beasts", name:"야수의 왕", icon:"👑🐾", rarity:"legendary", cat:"야수의 왕", desc:"전설급 야수를 길들여 경계인 그리젤다조차 이루지 못한 일을 해냈다", bonus:{per:10, wil:10, str:8, luk:6}, aiHint:"이 사람 곁에는 사나운 짐승도 스스로 다가온다는 전설이 있다" },

  // ══════════════════════════════════════════════════════════════
  //  대륙 전용 직업 8종 칭호 — 전사·마법사·도적·궁수·성직자 계열과
  //  동일한 절제 원칙(스탯 2종 +4~6, rare).
  // ══════════════════════════════════════════════════════════════
  { id:"ice_knight_beneath_the_frost", name:"만년설의 진실을 나눈 자", icon:"🧊", rarity:"rare", cat:"만년설 아래 흐르는 것", desc:"빙설 여왕 아이리나 II세와 함께 오래된 죄책감을 마주했다", bonus:{end:6, str:4}, aiHint:"이 사람은 냉기 속에서도 흔들리지 않는다는 평판이 있다" },
  { id:"rune_warrior_path_forsaken", name:"포기된 길을 이은 자", icon:"🔷", rarity:"rare", cat:"포기했던 길", desc:"아이리나 II세를 대신해 룬 해독의 길을 이어갔다", bonus:{wil:6, str:4}, aiHint:"이 사람의 룬 해독 실력은 여왕조차 감탄시켰다는 소문이 있다" },
  { id:"sword_emperor_not_to_win", name:"검의 극의를 엿본 자", icon:"⚔️", rarity:"rare", cat:"이기기 위한 검이 아니다", desc:"검황 백운도의 역설적 깨달음을 함께 마주했다", bonus:{agi:6, str:4}, aiHint:"이 사람은 검을 뽑지 않고도 승부를 정하는 경지에 다가섰다는 이야기가 있다" },
  { id:"imperial_sorcerer_dragon_qi_heart", name:"용의 기운을 다스린 자", icon:"🏯", rarity:"rare", cat:"용의 기운, 다루는 자의 마음", desc:"황실 술사 현공과 함께 위험한 힘의 책임을 마주했다", bonus:{mgc:6, int:4}, aiHint:"이 사람의 내단은 유독 맑게 빛난다는 평판이 있다" },
  { id:"steam_knight_heart_behind_tongue", name:"진심을 지킨 기사", icon:"🤖", rarity:"rare", cat:"황금 혀 뒤의 진심", desc:"집정관 세라핀 코와 함께 정치와 진심 사이의 균형을 마주했다", bonus:{end:6, int:4}, aiHint:"이 사람의 증기 갑옷은 유독 정교하게 정비되어 있다는 이야기가 있다" },
  { id:"automaton_master_strength_of_machine", name:"기계의 신념을 이은 자", icon:"🎭", rarity:"rare", cat:"기계로 만드는 강함", desc:"집정관 세라핀 코의 신념을 이어 자동인형 기술을 발전시켰다", bonus:{int:6, rng:4}, aiHint:"이 사람이 만든 자동인형은 유독 정교하다는 평판이 있다" },
  { id:"sun_priest_standing_without_light", name:"스스로 선 신관", icon:"☀️", rarity:"rare", cat:"빛에 기대지 않고 서는 법", desc:"태양왕 라메세스 IV세와 함께 권위와 정당성의 무게를 마주했다", bonus:{fath:6, mgc:4}, aiHint:"이 사람은 태양이 흐려져도 흔들리지 않는다는 이야기가 있다" },
  { id:"ancient_seeker_truth_even_if_unfavorable", name:"진실을 마주한 탐구자", icon:"🗿", rarity:"rare", cat:"불리해도 진실이라면", desc:"태양왕 라메세스 IV세와 함께 불리한 진실을 마주하는 법을 배웠다", bonus:{int:6, mgc:4}, aiHint:"이 사람은 왕가에도 거리낌 없이 진실을 고한다는 소문이 있다" },
  { id:"starlight_archer_unshared_weight", name:"무게를 알아챈 자", icon:"🌟", rarity:"rare", cat:"나눠지지 않은 무게", desc:"달의 여왕 아엘린과 함께 묵인해온 죄책감을 마주했다", bonus:{agi:6, per:4}, aiHint:"이 사람의 화살은 별빛 아래서 유독 정확하다는 이야기가 있다" },
  { id:"world_tree_keeper_shared_at_last", name:"무게를 함께 짊어진 자", icon:"🌳", rarity:"rare", cat:"나눠지지 않은 무게, 두 번째", desc:"달의 여왕 아엘린의 공인을 받아 세계수 수호자로 서게 되었다", bonus:{fath:6, mgc:4}, aiHint:"이 사람은 세계수 근처에서 유독 평온해 보인다는 이야기가 있다" },
  { id:"storm_pirate_fear_to_the_sea", name:"두려움을 안고 나아간 자", icon:"🏴‍☠️", rarity:"rare", cat:"두려움을 안고 바다로", desc:"폭풍 마법사 마리넬라와 함께 해구의 두려움을 곁에서 지켜봤다", bonus:{luk:6, agi:4}, aiHint:"이 사람은 폭풍 속에서도 유독 침착하다는 평판이 있다" },
  { id:"tide_sorcerer_share_masters_fear", name:"스승의 짐을 나눈 제자", icon:"🌊", rarity:"rare", cat:"스승의 두려움을 나눠 짊어지다", desc:"폭풍 마법사 마리넬라의 직계 제자로서 해구를 함께 지켰다", bonus:{mgc:6, rng:4}, aiHint:"이 사람은 조류를 유독 능숙하게 다룬다는 이야기가 있다" },
  { id:"runesmith_more_than_a_symbol", name:"실권을 되찾아준 장인", icon:"⚒️", rarity:"rare", cat:"상징 이상의 존재", desc:"왕중왕 투린 XVII세와 함께 상징 이상의 존재로 서는 법을 찾았다", bonus:{str:6, end:4}, aiHint:"이 사람이 벼린 룬 무기는 왕가에서도 귀히 여긴다는 소문이 있다" },
  { id:"golem_engineer_what_machines_protected", name:"고대 설계의 답을 찾은 자", icon:"⚙️", rarity:"rare", cat:"기계가 지키려 한 것", desc:"기계 사제 볼린과 함께 고대 기계 문명의 평생 의문에 다가섰다", bonus:{int:6, mgc:4}, aiHint:"이 사람은 고대 기계 유적 앞에서 유독 신중해진다는 이야기가 있다" },

  // ══════════════════════════════════════════════════════════════
  //  종족 12종 칭호 — 다른 계열들과 동일한 절제 원칙(스탯 2종 +4~6,
  //  rare). 각 종족 마스터(대부분 기존 RACE_RULER_NPCS 재사용)와의
  //  서사를 반영한 desc를 담았다.
  // ══════════════════════════════════════════════════════════════
  { id:"human_same_mistake_twice", name:"배움을 증명한 자", icon:"📖", rarity:"rare", cat:"같은 실수를 두 번", desc:"연대기 사가 오스카와 함께 인간이 정말 배우는 종족임을 증명했다", bonus:{wil:6, luk:4}, aiHint:"이 사람은 같은 실수를 두 번 반복하지 않는다는 평판이 있다" },
  { id:"dragon_will_of_the_flame", name:"불꽃을 다스린 자", icon:"🐉", rarity:"rare", cat:"불꽃을 쥔 자의 의지", desc:"원로 카이덴과 함께 냉정함이 진짜 힘임을 증명했다", bonus:{wil:6, mgc:4}, aiHint:"이 사람은 분노 앞에서도 눈빛이 흔들리지 않는다는 소문이 있다" },
  { id:"elf_names_unforgotten", name:"이름을 지킨 자", icon:"🌳", rarity:"rare", cat:"잊히지 않는 이름", desc:"셀레네스와 함께 잊혀가는 선조의 이름을 되찾았다", bonus:{mgc:6, per:4}, aiHint:"이 사람은 옛 이름들을 유독 정확히 기억한다는 이야기가 있다" },
  { id:"dwarf_the_unfinished", name:"과업을 완성한 자", icon:"⛏️", rarity:"rare", cat:"완성되지 않은 것", desc:"토린과 함께 동료들이 남긴 미완의 과업을 완성했다", bonus:{end:6, str:4}, aiHint:"이 사람의 손끝에서 미완성으로 남는 것은 없다는 평판이 있다" },
  { id:"orc_kept_beyond_death", name:"맹세를 지킨 자", icon:"🪓", rarity:"rare", cat:"죽어서도 지키는 것", desc:"그롬과 함께 맹세는 죽어서도 지켜진다는 것을 증명했다", bonus:{str:6, end:4}, aiHint:"이 사람의 맹세는 절대 어겨지지 않는다는 소문이 있다" },
  { id:"darkling_light_or_enemy", name:"경계를 지킨 자", icon:"🌑", rarity:"rare", cat:"빛의 종인가, 빛의 적인가", desc:"느누스와 함께 억울한 낙인의 진실을 밝혔다", bonus:{mgc:6, fear:4}, aiHint:"이 사람은 공포를 함부로 쓰지 않는다는 평판이 있다" },
  { id:"celestial_missionless_one", name:"스스로 사명을 찾은 자", icon:"✨", rarity:"rare", cat:"사명 없는 자", desc:"오필리아와 함께 오판의 진실을 밝히고 개혁의 씨앗을 심었다", bonus:{fath:6, wil:4}, aiHint:"이 사람은 거짓 기적을 행하지 않는다는 확고한 평판이 있다" },
  { id:"demon_upon_my_name", name:"이름을 건 자", icon:"👹", rarity:"rare", cat:"이름을 걸고", desc:"바알제스와 함께 계약의 무게를 실제로 증명했다", bonus:{cha:6, neg:4}, aiHint:"이 사람과의 계약은 절대 깨지지 않는다는 소문이 있다" },
  { id:"undead_second_death_earned", name:"빚을 정리한 자", icon:"💀", rarity:"rare", cat:"두 번째 죽음을 쟁취하는 법", desc:"칼라모스와 함께 죽음의 경계에서 얻은 진실을 마주했다", bonus:{end:6, pstx:4}, aiHint:"이 사람은 죽음을 두려워하지 않는다는 담담한 평판이 있다" },
  { id:"beastman_hunt_with_honor", name:"명예를 지킨 사냥꾼", icon:"🐺", rarity:"rare", cat:"사냥하지 않는 용기", desc:"카르가와 함께 강함을 함부로 증명하지 않는 법을 배웠다", bonus:{str:6, per:4}, aiHint:"이 사람은 필요 없는 사냥을 하지 않는다는 자부심이 있다" },
  { id:"elemental_not_for_destruction", name:"균형을 지킨 원소인", icon:"🔥", rarity:"rare", cat:"파괴가 아닌 것", desc:"이그니스카와 함께 원소를 파괴가 아닌 것으로 지켰다", bonus:{mgc:6, wil:4}, aiHint:"이 사람의 원소는 파괴가 아닌 균형을 향한다는 평판이 있다" },
  { id:"vampire_history_not_denied", name:"역사를 짊어진 자", icon:"🦇", rarity:"rare", cat:"역사를 부정하지 않는 법", desc:"블라디미르와 함께 자신의 역사를 부정하지 않는 법을 배웠다", bonus:{cha:6, agi:4}, aiHint:"이 사람은 자신의 과거를 결코 숨기지 않는다는 소문이 있다" },
];
