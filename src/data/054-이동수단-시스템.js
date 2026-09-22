// 🚀 이동수단 시스템 — data
// Pure data split out of misc/054-이동수단-시스템.js (see generate.js).

export const TRANSPORT_CONFIG = {
  walk:        { icon:'🚶', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="1.8"/><path d="M10 22 L11 15 L8 12 L9 7 L13 6 L15 9 L18 10" /><path d="M11 15 L15 17 L17 22" /><path d="M9 7 L5 9 L4 14" /></svg>', name:'도보',        desc:'일반 도보 이동.', speedMult:1.0, range:'any', color:'#6a5a3a', encounterMult:1.0 },
  // ── 말 — 등급별로 4종. 중세 판타지 배경에 맞춰 신분/용도에 따라 격차를 둔다.
  horse_draft: { icon:'🐴', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17 L4 20 M8 17 L8 20 M15 17 L15 20 M18 17 L18 20" /><path d="M3 17 C3 12 5 8 9 8 L17 8 C19.5 8 20.5 10 20.5 12 C20.5 14 19 15.5 17 15.5 L17 17 L4 17 Z" stroke-linejoin="round"/><path d="M17 8 L20 4" /></svg>', name:'짐말',        desc:'농가에서 흔히 쓰는 둔중한 말. 느리지만 가장 저렴하다.', speedMult:1.5, range:'land', color:'#8a7050', encounterMult:0.85 },
  horse:       { icon:'🐴', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17 L4 20 M8 17 L8 20 M15 17 L15 20 M18 17 L18 20" /><path d="M3 17 C3 12 5 8 9 8 L17 8 C19.5 8 20.5 10 20.5 12 C20.5 14 19 15.5 17 15.5 L17 17 L4 17 Z" stroke-linejoin="round"/><path d="M17 8 L20 4" /></svg>', name:'준마',        desc:'일반적인 승용마. 적당한 속도와 가격.', speedMult:2.5, range:'land', color:'#c8a030', encounterMult:0.7 },
  horse_war:   { icon:'🐎', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17 L4 20 M8 17 L8 20 M15 17 L15 20 M18 17 L18 20" /><path d="M3 17 C3 11 6 7 10 7 L17 7 C19.5 7 21 9.5 21 12 C21 14.5 19 16 17 16 L17 17 L4 17 Z" stroke-linejoin="round"/><path d="M17 7 L21 2 M13 7 L14 3" /></svg>', name:'군마',        desc:'전장에서 단련된 말. 빠르고 잘 놀라지 않는다.', speedMult:3.2, range:'land', color:'#a04030', encounterMult:0.55 },
  horse_noble: { icon:'🐎', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17 L4 20 M8 17 L8 20 M15 17 L15 20 M18 17 L18 20" /><path d="M3 17 C3 11 6 7 10 7 L17 7 C19.5 7 21 9.5 21 12 C21 14.5 19 16 17 16 L17 17 L4 17 Z" stroke-linejoin="round"/><path d="M17 7 L21 2 M13 7 L14 3 M11 7 L11 3" /></svg>', name:'명마',        desc:'귀족 혈통의 명마. 대륙에서 가장 빠른 지상 이동수단.', speedMult:4.0, range:'land', color:'#e0c850', encounterMult:0.45, isPremiumMount:true },
  carriage:    { icon:'🪄', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16 L4 9 L16 9 L18 16 Z" stroke-linejoin="round"/><circle cx="7" cy="18.5" r="2"/><circle cx="16" cy="18.5" r="2"/><path d="M18 12 L21 12" /></svg>', name:'마차',        desc:'안전하고 편안한 육로 이동. 다수 탑승 가능.', speedMult:1.8, range:'land', color:'#8a7a5a', encounterMult:0.6 },
  // ── 선박 — 소유하는 게 아니라 매번 항구에서 돈을 내고 빌려 타는
  // 방식. 해안/항구가 아닌 곳에서는 탈 수 없다(requiresCoastal/
  // requiresSeaAccess — 장소 데이터의 coastal/seaAccess 필드와 대응).
  boat:        { icon:'⛵', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L12 15" /><path d="M12 4 L18 12 L12 12 Z" stroke-linejoin="round"/><path d="M4 15 L20 15 L17 20 L7 20 Z" stroke-linejoin="round"/></svg>', name:'소형 선박',   desc:'강·해안 이동. 수로를 통한 단거리 항해. 매번 임대료를 낸다.', speedMult:2.0, range:'water', color:'#4a8aaa', encounterMult:0.5, requiresCoastal:true },
  ship:        { icon:'🚢', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12 L19 12 L19 17 L5 17 Z" stroke-linejoin="round"/><path d="M8 12 L8 5 L14 5 L14 12" stroke-linejoin="round"/><path d="M3 17 L21 17 L18 21 L6 21 Z" stroke-linejoin="round"/></svg>', name:'대형 선박',   desc:'원거리 해상 항해. 대륙 간 이동 가능. 매번 임대료를 낸다.', speedMult:3.0, range:'sea', color:'#2a5a8a', encounterMult:0.4, requiresCoastal:true, requiresSeaAccess:true },
  // ── 비행 탑승물 — 지상 인카운터를 완전히 건너뛰고 공중 전용 위험으로 대체 ──
  griffin:  { icon:'🦅', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C8 5 4 9 4 14 C4 17 6 19 8 19" /><path d="M12 3 C16 5 20 9 20 14 C20 17 18 19 16 19" /><path d="M9 21 L12 17 L15 21" stroke-linejoin="round"/><circle cx="12" cy="8" r="2.2"/></svg>', name:'그리핀',      desc:'맹금과 사자의 힘을 가진 공중의 제왕. 날씨·지형 무관 최고속 비행.', speedMult:5.0, range:'air', color:'#d8a850', encounterMult:0, isAir:true, isPremiumMount:true },
  pegasus:  { icon:'🐎', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 C3 11 6 7 10 7 L17 7 C19.5 7 21 9.5 21 12 C21 14.5 19 16 17 16 L17 17 L4 17 Z" stroke-linejoin="round"/><path d="M9 8 C6 6 3 6 2 8 C4 9 6 9.5 8 9" stroke-linejoin="round"/><path d="M17 7 L21 2" /></svg>', name:'페가수스',    desc:'고귀하고 우아한 천마. 빠르지만 전투에는 서툴다.', speedMult:4.0, range:'air', color:'#e8e0f0', encounterMult:0, isAir:true },
  wyvern:   { icon:'🐲', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/><path d="M8 6 L6.5 3 M8 6 L9.5 3.5" stroke-width="1.2"/></svg>', name:'와이번',      desc:'사납고 빠른 비룡. 다루기 위험하지만 그만큼 빠르다.', speedMult:4.5, range:'air', color:'#8a3a3a', encounterMult:0, isAir:true, isDangerousMount:true },
  // ── 마법 이동 — [21-7 재설계] 예전엔 "쿨다운만 지나면 대륙 어디든
  // 무료로 순간이동"이었으나, 직접 방문해 등록한 웨이포인트끼리만,
  // 그것도 현재 위치 자체가 웨이포인트일 때만, 거리 비례 골드를 내고
  // 이동하는 유료 네트워크로 재구현됨(items/218 registerTeleportWaypoint/
  // getWaypointTeleportCost 참고).
  teleport: { icon:'🌀', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M12 12 C12 12 17 8 17 12 C17 16 12 12 12 12 C12 12 7 16 7 12 C7 8 12 12 12 12 Z" stroke-width="1.1"/></svg>', name:'마법진 이동', desc:'등록된 웨이포인트(마법진이 설치된 거점)끼리만, 거리에 비례한 골드를 내고 즉시 이동한다.', speedMult:999, range:'any', color:'#a060d0', encounterMult:0, isTeleport:true },
};

export const ALL_CONTINENTS = ['central','north','east','west','south','northeast','southeast','northwest'];

export const TRANSPORT_DEST_HINTS = {
  walk:        { continents: ALL_CONTINENTS, hint:'모든 지역 이동 가능. 느립니다.' },
  horse_draft: { continents: ALL_CONTINENTS, hint:'육지 장소 어디든 이동 가능합니다. 느리지만 저렴합니다.' },
  horse:       { continents: ALL_CONTINENTS, hint:'육지 장소 어디든 이동 가능합니다.' },
  horse_war:   { continents: ALL_CONTINENTS, hint:'육지 장소 어디든 빠르게 이동 가능합니다.' },
  horse_noble: { continents: ALL_CONTINENTS, hint:'육지에서 가장 빠른 이동수단입니다.' },
  carriage:    { continents:['central','east','west','northeast'], hint:'안전한 육로가 있는 지역 이동에 적합합니다.' },
  boat:        { continents:['west','south','east','southeast'], hint:'해안·강변 장소로 이동할 수 있습니다(해안 지역에서만 임대 가능).' },
  ship:        { continents:['west','south','east','north','southeast'], hint:'대륙 간 해상 이동이 가능합니다(주요 항구에서만 임대 가능).' },
  // ── 비행/마법 — 지형 제약 없이 모든 대륙 이동 가능 ──
  griffin:  { continents: ALL_CONTINENTS, hint:'하늘을 가로질러 어느 대륙이든 최고속으로 이동합니다.' },
  pegasus:  { continents: ALL_CONTINENTS, hint:'하늘을 가로질러 어느 대륙이든 이동 가능합니다.' },
  wyvern:   { continents: ALL_CONTINENTS, hint:'하늘을 가로질러 어느 대륙이든 빠르게 이동하지만 다루기 위험합니다.' },
  teleport: { continents: ALL_CONTINENTS, hint:'현재 위치가 웨이포인트로 등록되어 있어야 하며, 다른 등록된 웨이포인트로만 골드를 내고 이동할 수 있습니다.' },
};

export const GENERIC_MONSTER_SUFFIXES = [
  '늑대','고블린','오크','스켈레톤','좀비','도적','병사','경비','자객','암살자',
  '깡패','야수','늑대인간','뱀파이어','거미','슬라임','박쥐','쥐','곤충','벌레',
  '병졸','졸병','용병','수인','마수','괴물','짐승','악령','유령','정령','짐승',
];

export const STATUS_EFFECTS = {
  poison:    { name:'중독',   icon:'☠️',  color:'#60a060', desc:'매 턴 HP-5',        duration:3, effect:{ hpPerTurn:-5 } },
  burn:      { name:'화상',   icon:'🔥',  color:'#e06030', desc:'매 턴 HP-8, STR-10', duration:2, effect:{ hpPerTurn:-8, str:-10 } },
  freeze:    { name:'빙결',   icon:'❄️',  color:'#60c0e0', desc:'행동 불가',           duration:1, effect:{ stunned:true } },
  curse:     { name:'저주',   icon:'💀',  color:'#9060c0', desc:'모든 판정-20',        duration:4, effect:{ allStatPenalty:-20 } },
  berserk:   { name:'광기',   icon:'😡',  color:'#e04040', desc:'STR+30, 제어 불가',   duration:3, effect:{ str:30, uncontrolled:true } },
  blessed:   { name:'축복',   icon:'✨',  color:'#e0c040', desc:'모든 판정+15',        duration:3, effect:{ allStatBonus:15 } },
  invisible: { name:'은신',   icon:'👻',  color:'#80a0c0', desc:'기습 보정+40',        duration:2, effect:{ stealthBonus:40 } },
  regen:     { name:'재생',   icon:'💚',  color:'#40c060', desc:'매 턴 HP+8',          duration:4, effect:{ hpPerTurn:8 } },
};

export const BOSS_MONSTERS = {
  medieval: [
    // [위치 인식] locTypes: 이 보스는 플레이어가 해당 유형의 장소에 실제로
    // 있을 때만 등장한다 — turnTrigger를 넘겨도 마을/도시 같은 안전 지역에
    // 있으면 대기했다가, 그 장소 유형에 들어서는 순간 등장한다 (checkBossSpawn 참고).
    { id:'boss_knight_fallen', name:'타락한 성기사', icon:'🗡️', hp:120, maxHp:120, atk:22, drops:[{name:'배교자의 대검',icon:'🗡️',rarity:'epic',type:'equip',desc:'한때 신성했던 검. STR+15'}], turnTrigger:20, locTypes:['dungeon','shrine','event'] },
    { id:'boss_dragon', name:'고대 드래곤', icon:'🐉', hp:200, maxHp:200, atk:35, drops:[{name:'용의 비늘',icon:'🐉',rarity:'legendary',type:'equip',desc:'용의 비늘로 만든 방어구. END+20'}], turnTrigger:30, locTypes:['dungeon','event','special'] },
    { id:'boss_lich', name:'고대 리치', icon:'💀', hp:150, maxHp:150, atk:28, drops:[{name:'마왕의 지팡이',icon:'🔮',rarity:'legendary',type:'equip',desc:'강력한 마법 증폭. MGC+25'}], turnTrigger:60, locTypes:['dungeon','shrine','special'] },
    { id:'boss_troll_chief', name:'트롤 족장', icon:'👹', hp:280, maxHp:280, atk:45, drops:[{name:'재생의 심장',icon:'❤️',rarity:'epic',type:'equip',desc:'트롤의 재생력이 깃든 유물. END+18, HP+40'}], turnTrigger:95, locTypes:['dungeon','event'] },
    { id:'boss_witch_marsh', name:'늪지의 마녀', icon:'🧙', hp:240, maxHp:240, atk:50, drops:[{name:'저주받은 부적',icon:'🧿',rarity:'epic',type:'equip',desc:'저주와 마법이 뒤엉킨 부적. MGC+22, WIL+10'}], turnTrigger:135, locTypes:['dungeon','event','special'] },
    { id:'boss_giant_frost', name:'서리 거인', icon:'🧊', hp:420, maxHp:420, atk:60, drops:[{name:'서리거인의 도끼',icon:'🪓',rarity:'epic',type:'equip',desc:'얼어붙은 대형 도끼. STR+22, atk 빙결 확률'}], turnTrigger:180, locTypes:['dungeon','event','special'] },
    { id:'boss_wraith_king', name:'원한의 망령왕', icon:'👻', hp:380, maxHp:380, atk:68, drops:[{name:'망령왕의 왕관',icon:'👑',rarity:'legendary',type:'equip',desc:'죽음의 기운이 서린 왕관. WIL+20, MGC+15'}], turnTrigger:230, locTypes:['dungeon','shrine','special'] },
    { id:'boss_demon_hound', name:'지옥사냥개 무리의 우두머리', icon:'🐺', hp:460, maxHp:460, atk:78, drops:[{name:'지옥불 목걸이',icon:'🔥',rarity:'epic',type:'equip',desc:'불타는 목걸이. atk 화염 피해 추가'}], turnTrigger:285, locTypes:['dungeon','event'] },
    { id:'boss_golem_ancient', name:'고대 룬 골렘', icon:'🗿', hp:600, maxHp:600, atk:70, drops:[{name:'룬 각인 방패',icon:'🛡️',rarity:'legendary',type:'equip',desc:'고대 룬이 새겨진 방패. END+30'}], turnTrigger:345, locTypes:['dungeon','special'] },
    { id:'boss_vampire_countess', name:'심연의 흡혈 백작부인', icon:'🩸', hp:520, maxHp:520, atk:90, drops:[{name:'피의 계약서',icon:'📜',rarity:'legendary',type:'equip',desc:'흡혈 계약이 담긴 유물. 공격 시 HP 흡수'}], turnTrigger:410, locTypes:['dungeon','shrine','special'] },
    { id:'boss_hydra', name:'늪지의 히드라', icon:'🐍', hp:680, maxHp:680, atk:85, drops:[{name:'히드라의 독니',icon:'🦷',rarity:'epic',type:'equip',desc:'맹독이 깃든 이빨. atk 중독 확률'}], turnTrigger:480, locTypes:['dungeon','event'] },
    { id:'boss_cult_leader', name:'광신도 교주', icon:'🩸', hp:560, maxHp:560, atk:100, drops:[{name:'심연의 서',icon:'📖',rarity:'legendary',type:'equip',desc:'금단의 지식이 담긴 책. MGC+30, INT+15'}], turnTrigger:555, locTypes:['shrine','dungeon','special'] },
    { id:'boss_dragon_black', name:'칠흑의 흑룡', icon:'🐲', hp:850, maxHp:850, atk:110, drops:[{name:'흑룡의 심장',icon:'🖤',rarity:'legendary',type:'equip',desc:'모든 스탯을 강화하는 심장. 전 스탯+12'}], turnTrigger:635, locTypes:['dungeon','event','special'] },
    { id:'boss_giant_fire', name:'화염 거인왕', icon:'🔥', hp:780, maxHp:780, atk:120, drops:[{name:'거인왕의 망치',icon:'🔨',rarity:'legendary',type:'equip',desc:'거대한 화염 망치. STR+28, atk 화상 확률'}], turnTrigger:720, locTypes:['dungeon','event','special'] },
    { id:'boss_seraph_fallen', name:'타락한 세라핌', icon:'🪽', hp:900, maxHp:900, atk:125, drops:[{name:'부러진 천사의 날개',icon:'🕊️',rarity:'legendary',type:'equip',desc:'타락한 성력이 깃든 유물. WIL+25, 회피율 증가'}], turnTrigger:810, locTypes:['shrine','dungeon','special'] },
    { id:'boss_leviathan', name:'심해의 리바이어던', icon:'🌊', hp:1050, maxHp:1050, atk:130, drops:[{name:'심해의 눈',icon:'🔵',rarity:'legendary',type:'equip',desc:'깊은 바다의 힘. MGC+25, END+20'}], turnTrigger:900, locTypes:['event','special','dungeon'] },
    { id:'boss_necro_emperor', name:'죽음의 황제', icon:'☠️', hp:1200, maxHp:1200, atk:145, drops:[{name:'황제의 사령홀',icon:'⚱️',rarity:'legendary',type:'equip',desc:'수많은 영혼을 지배하는 홀. 전 스탯+15, 언데드 소환'}], turnTrigger:1000, locTypes:['dungeon','shrine','special'] },
    { id:'boss_dragon_god', name:'용신의 화신', icon:'✨', hp:1500, maxHp:1500, atk:170, drops:[{name:'용신의 인장',icon:'💠',rarity:'legendary',type:'equip',desc:'세계를 뒤흔든 용신의 힘. 전 스탯+20, 궁극기 해금'}], turnTrigger:1100, locTypes:['dungeon','event','special'] },
  ],
};

export const COMPANION_TYPE_DATA = {
  mage:       { label:'마법사',   icon:'\uD83D\uDD2E', statBonus:{mgc:20,int:15,mp:30,per:8},
    recruits:[
      {type:'relationship',min:65,  desc:'호감도 65+'},
      {type:'stat', stat:'mgc', min:30, desc:'마법력 30+'},
      {type:'stat', stat:'int', min:35, desc:'지성 35+'},
      {type:'stat', stat:'spk', min:40, desc:'화술 40+ (설득)'},
      {type:'item', itemId:'magic_tome', desc:'마법서 선물'},
    ],
    uniqueSkill:'마법 조력 — 마법 판정 +15', battleRole:'원거리 마법 지원',
    talkStyle:'분석적·냉정. 드물게 칭찬한다.', leaveMin:35,
    aiHint:'마법 상황에서 전문 의견을 낸다. 감정보다 논리 우선.' },
  warrior:    { label:'전사',     icon:'\u2694\uFE0F', statBonus:{str:25,end:20,fear:15,wil:10},
    recruits:[
      {type:'relationship',min:60,  desc:'호감도 60+'},
      {type:'stat', stat:'str',  min:40, desc:'근력 40+ (실력 인정)'},
      {type:'stat', stat:'fear', min:45, desc:'공포 45+ (강자 인정)'},
      {type:'duel', desc:'결투 승리 (서사 달성)'},
    ],
    uniqueSkill:'방패막이 — 치명타 1회 대신 받음', battleRole:'전방 탱커',
    talkStyle:'직설적·행동으로 말함.', leaveMin:30,
    aiHint:'전투 시 전방에 자청. 비겁함 3회 목격 시 비판.' },
  rogue:      { label:'도적',     icon:'\uD83D\uDDE1\uFE0F', statBonus:{agi:22,disg:20,per:18,luk:12},
    recruits:[
      {type:'relationship',min:70,  desc:'호감도 70+'},
      {type:'stat', stat:'disg', min:35, desc:'위장 35+'},
      {type:'stat', stat:'agi',  min:40, desc:'민첩 40+'},
      {type:'payment', gold:500,        desc:'선불 500G'},
      {type:'quest', questId:'mq_selina_truth', desc:'셀리나 진실 퀘스트 완료'},
    ],
    uniqueSkill:'정찰 — 다음 장소 위험·통로 파악', battleRole:'측면 기습·탐색',
    talkStyle:'냉소적 프로. 감정 드러내지 않음.', leaveMin:40,
    aiHint:'항상 출구와 덫을 먼저 확인.' },
  cleric:     { label:'신관',     icon:'\u271D\uFE0F', statBonus:{fath:25,wil:18,end:15,trst:12},
    recruits:[
      {type:'relationship',min:55,  desc:'호감도 55+'},
      {type:'stat', stat:'fath', min:25, desc:'신앙 25+'},
      {type:'stat', stat:'wil',  min:35, desc:'의지 35+'},
      {type:'karma', maxKarma:40,        desc:'업보 40 이하'},
    ],
    uniqueSkill:'성스러운 치유 — 전투 후 HP 40% 회복', battleRole:'치유·버프·대악마',
    talkStyle:'따뜻하고 판단하지 않음.', leaveMin:0,
    leaveKarma:75, leaveCorrStage:3,
    aiHint:'부상자 먼저 다가감. 잔인한 선택 후 조용히 기도.' },
  merchant:   { label:'상인',     icon:'\uD83D\uDCB0', statBonus:{neg:20,luk:18,spk:15,cha:12},
    recruits:[
      {type:'relationship',min:50,  desc:'호감도 50+'},
      {type:'stat', stat:'neg', min:30, desc:'협상 30+'},
      {type:'stat', stat:'spk', min:35, desc:'화술 35+ (거래 설득)'},
      {type:'stat', stat:'cha', min:40, desc:'카리스마 40+'},
      {type:'payment', gold:300,        desc:'투자금 300G'},
    ],
    uniqueSkill:'상인 네트워크 — 어디서나 10% 할인', battleRole:'후방 아이템 지원',
    talkStyle:'이득 계산. 오래 함께하면 진심 보임.', leaveMin:0,
    aiHint:'협상 장면에서 눈짓으로 신호.' },
  bard:       { label:'음유시인', icon:'\uD83C\uDFB5', statBonus:{cha:22,spk:20,luk:15,wil:10},
    recruits:[
      {type:'relationship',min:60,  desc:'호감도 60+'},
      {type:'fame',  min:50,             desc:'명성 50+'},
      {type:'stat', stat:'spk', min:50, desc:'화술 50+'},
      {type:'stat', stat:'cha', min:45, desc:'카리스마 45+'},
    ],
    uniqueSkill:'전설의 노래 — 전투 시작 시 판정 +10', battleRole:'사기 버프',
    talkStyle:'모든 것을 시적으로.', leaveMin:30, leaveFame:15,
    aiHint:'위험 순간에도 "이건 좋은 이야기가 되겠군" 중얼거림.' },
  scholar:    { label:'학자',     icon:'\uD83D\uDCDA', statBonus:{int:25,per:20,mgc:10,luk:8},
    recruits:[
      {type:'relationship',min:55,  desc:'호감도 55+'},
      {type:'stat', stat:'int', min:35, desc:'지성 35+'},
      {type:'stat', stat:'spk', min:40, desc:'화술 40+ (지적 대화)'},
    ],
    uniqueSkill:'고대 지식 — 유적·던전 숨겨진 정보 자동 감지', battleRole:'적 분석·유물 해독',
    talkStyle:'항상 "왜"를 묻는다.', leaveMin:35,
    aiHint:'고대 유물 앞에서 흥분. 적과도 대화로 해결 시도.' },
  brute:      { label:'강인한 전사',icon:'\uD83D\uDCAA',statBonus:{str:30,end:28,fear:20},
    recruits:[
      {type:'relationship',min:50,  desc:'호감도 50+'},
      {type:'stat', stat:'str', min:60, desc:'근력 60+'},
      {type:'stat', stat:'end', min:55, desc:'인내 55+'},
    ],
    uniqueSkill:'공포 발산 — 약한 적 10% 즉시 도주', battleRole:'강력한 근접·위압',
    talkStyle:'말이 적다. 의리 최고.', leaveMin:0,
    aiHint:'위기 시 아무 말 없이 앞에 선다.' },
  adventurer: { label:'모험가',   icon:'\uD83C\uDF92', statBonus:{str:12,agi:12,end:12,luk:10},
    recruits:[
      {type:'relationship',min:65,  desc:'호감도 65+'},
      {type:'stat', stat:'luk', min:40, desc:'운 40+'},
      {type:'stat', stat:'cha', min:35, desc:'카리스마 35+'},
    ],
    uniqueSkill:'행운의 발견 — 아이템 발견 확률 +20%', battleRole:'전천후 지원',
    talkStyle:'밝고 호기심 많음.', leaveMin:35,
    aiHint:'새로운 장소에서 감탄. 위험 앞에서도 긍정적.' },
  // ── 부활 동료 타입 ──────────────────────────────────────
  undead_revived: { label:'부활한 언데드', icon:'💀', statBonus:{str:20,end:25,fear:20,wil:15},
    recruits:[
      {type:'revive', desc:'사망한 NPC를 부활 조건으로 되살림'},
    ],
    uniqueSkill:'죽음의 기억 — 전투 중 HP 0 시 1회 50% HP로 부활', battleRole:'전방 근접·공포 유발',
    talkStyle:'감정이 흐릿하다. 말이 적고 행동으로 충성을 보인다. 가끔 생전의 기억이 흘러나온다.',
    leaveMin:0,
    aiHint:'이 동료는 죽었다가 부활한 존재다. 감정 표현이 제한적이고, 생전 기억의 파편이 대화 중 불쑥 나온다. 주인공에게 절대적 충성을 보이지만, 가끔 자신이 왜 이렇게 됐는지 혼란스러워한다. 언데드 특성상 신관·성직자 NPC들이 불편해하거나 적대한다.' },
  fully_revived:  { label:'완전 부활', icon:'✨💀', statBonus:{str:15,end:15,mgc:10,wil:20,luk:10},
    recruits:[
      {type:'revive', desc:'완전 부활 마법으로 의식과 기억이 온전히 복원됨'},
    ],
    uniqueSkill:'재생의 의지 — 매 전투 종료 후 HP 20% 자연 회복', battleRole:'전천후 지원',
    talkStyle:'생전과 거의 같다. 단, 죽음을 경험한 자의 무게감이 말에 배어있다.',
    leaveMin:20,
    aiHint:'완전 부활한 동료는 기억과 의식이 온전하다. 자신이 죽었다가 살아났다는 사실을 인지하고 있으며, 그 경험이 성격에 영향을 준다. 삶과 죽음에 대한 철학적 발언을 가끔 한다. 생전의 관계·약속·감정을 모두 기억한다.' },
  // ── 사냥꾼 조련 야수 타입 ────────────────────────────────
  // [신규] 사냥터에서 제압 후 길들인 몬스터가 이 타입으로 파티에
  // 합류한다. 다른 타입과 달리 recruits(호감도/스탯 조건)가 아니라
  // tameAtGrounds()의 자체 성공률 판정으로 영입되므로, recruits는
  // 문서화 목적의 placeholder만 둔다. statBonus는 고정값이 아니라
  // 조련 시점에 몬스터의 실제 티어(getMonsterTierStats)에 비례해
  // 동적으로 계산되어 개별 동료 객체에 저장된다 — 즉 이 타입 정의의
  // statBonus는 fallback 최소값 역할만 한다.
  beast:      { label:'길들인 야수', icon:'🐾', statBonus:{str:10,agi:10,end:10},
    recruits:[
      {type:'tame', desc:'사냥터에서 제압 후 길들이기 성공 (지각·의지 스탯 기반 판정)'},
    ],
    uniqueSkill:'야생의 감각 — 파티 전체 기습 당할 확률 감소', battleRole:'전방 돌격·정찰',
    talkStyle:'말은 못 하지만 행동과 몸짓으로 의사를 표현한다.', leaveMin:0,
    aiHint:'이 동료는 말을 하지 못하는 길들인 야수다. 감정과 의사는 울음소리, 몸짓, 눈빛으로 표현하라. 주인(플레이어)에게 강한 유대를 보이며, 위험을 감지하면 먼저 경계 태세를 취한다. 야생의 본능이 완전히 사라지지 않아 가끔 예측 못 한 행동(먹이를 향한 관심, 낯선 냄새에 대한 경계 등)을 보이기도 한다.' },
};

export const SKILL_COMBOS = [
  { id:'combo_holy_blade', skills:['job_warrior_slash','job_pal_smite'], name:'성검', icon:'⚔️✨', desc:'성스러운 힘이 깃든 검격. 신성+전투 피해.', rarity:'legendary', mpCost:30,
    effects:{ kind:'damage', statSource:{str:0.5,fath:0.5}, damageMult:1.1, element:'light' } },
  { id:'combo_shadow_fire', skills:['job_rogue_stab','active_fireball'], name:'지옥불 기습', icon:'🔥🗡️', desc:'어둠 속에서 지옥불로 기습. 높은 피해.', rarity:'legendary', mpCost:35,
    effects:{ kind:'damage', statSource:{agi:0.5,mgc:0.5}, damageMult:1.2, element:'fire' } },
  { id:'combo_thunder_call', skills:['job_mage_bolt','job_sum_call'], name:'뇌격 소환', icon:'⚡🌀', desc:'번개와 소환수를 동시에 해방.', rarity:'legendary', mpCost:45,
    effects:{ kind:'damage', statSource:{mgc:1}, damageMult:1.15, hits:2, element:'lightning' } },
  { id:'combo_iron_rune', skills:['job_bs_forge','job_alc_trans'], name:'룬 강화', icon:'🔨🔱', desc:'룬이 새겨진 완벽한 장비. 모든 스탯+20.', rarity:'legendary', mpCost:25,
    effects:{ kind:'buff', statMod:{str:8,agi:8,end:8,int:8}, duration:5 } },
  { id:'combo_nature_heal', skills:['job_rng_ambush','job_heal_cure'], name:'자연 치유', icon:'🌿💚', desc:'자연의 힘으로 완전 치유. HP+50.', rarity:'legendary', mpCost:20, hpRestore:50 },
  { id:'combo_death_shadow', skills:['job_necro_legion','active_shadow'], name:'죽음의 그림자', icon:'💀🌑', desc:'어둠과 죽음이 하나가 된 궁극기.', rarity:'legendary', mpCost:60,
    effects:{ kind:'damage', statSource:{fear:0.5,agi:0.5}, damageMult:1.3, hits:2, element:'dark' } },
];

export const RELICS = [
  // ── 기존 유물 ────────────────────────────────────
  { id:'relic_crown',     name:'고대 왕관',          icon:'👑', desc:'왕의 기운이 깃든 관. 리더십 폭발.',          effect:{ spk:30, wil:25, luk:20, ldr:22 }, condition:{ minTitles:10 } },
  { id:'relic_sword',     name:'영웅의 검',           icon:'⚔️', desc:'전설의 영웅이 쓰던 검. 전투력 극대화.',      effect:{ str:37, agi:25, fear:25, crit:20 }, condition:{ minCritSuccess:30 } },
  { id:'relic_grimoire',  name:'금서',                icon:'📕', desc:'금지된 마법이 담긴 책. 마법력 폭발.',        effect:{ mgc:40, int:30, wil:20 }, condition:{ minMagic:85 } },
  { id:'relic_shadow',    name:'그림자 망토',          icon:'🌑', desc:'완전히 빛을 흡수하는 망토. 은신 극한.',      effect:{ disg:37, agi:30, per:20 }, condition:{ minStealthCount:30 } },
  { id:'relic_phoenix',   name:'불사조의 깃털',        icon:'🔥', desc:'부활의 힘이 깃든 깃털.',                    effect:{ end:32, fath:25, hp:60, wil:20 }, condition:{ minDeaths:5 } },
  { id:'relic_hourglass', name:'시간의 모래시계',      icon:'⏳', desc:'시간을 거슬러 올라간 유물.',                 effect:{ luk:35, int:27, per:20, wil:17 }, condition:{ minReinc:3 } },
  // ── 대륙별 전설 유물 ─────────────────────────────
  { id:'relic_leon_blade', name:'레오나르드 경의 성검', icon:'⚔️✨', desc:'왕국 기사단장의 불굴의 의지가 담긴 성검. 기사도의 극의.',
    effect:{ str:45, end:30, wil:30, fear:25, ldr:20 }, condition:{ minCombatWin:50, hasFlag:'mq1_done' } },
  { id:'relic_arcanum_eye', name:'아르카누스의 눈', icon:'🔮', desc:'대마법사가 수십 년간 연구한 마법 결정체. 세계의 진실이 보인다.',
    effect:{ mgc:50, int:40, per:35, wil:20 }, condition:{ minMagic:70, hasFlag:'mq2_done' } },
  { id:'relic_frost_rune', name:'최초의 룬석', icon:'❄️', desc:'북방 고대 룬 마법의 원천. 빙결 마법의 극의.',
    effect:{ mgc:40, wil:35, end:25, str:20 }, condition:{ minCombatWin:30, continent:'north' } },
  { id:'relic_dragon_fang', name:'이그나르의 어금니', icon:'🐉', desc:'고룡 이그나르에게서 얻은 어금니. 용의 힘이 깃든다.',
    effect:{ str:50, fear:40, end:30, mgc:25 }, condition:{ continent:'east', minCombatWin:40 } },
  { id:'relic_steam_core', name:'불멸의 증기 심장', icon:'⚙️', desc:'서대륙 전설의 발명가 에다르손이 만든 영구기관. 지치지 않는다.',
    effect:{ end:55, int:35, str:25, agi:20 }, condition:{ continent:'west', minCraft:20 } },
  { id:'relic_sun_tablet', name:'태양왕의 석판', icon:'☀️', desc:'고대 케메트 제국 태양왕의 석판. 태양 마법의 정수.',
    effect:{ fath:55, mgc:40, wil:30, luk:20 }, condition:{ continent:'south', minFaith:60 } },
  { id:'relic_world_leaf', name:'세계수의 심잎', icon:'🌳', desc:'세계수 이그드라의 핵심 잎사귀. 자연의 모든 것과 연결된다.',
    effect:{ mgc:45, per:40, luk:30, wil:25 }, condition:{ continent:'northeast', hasFlag:'worldtree_seen' } },
  { id:'relic_kraken_core', name:'심해 크라켄의 심장', icon:'🌊', desc:'테네브라 해구의 전설 크라켄에서 얻은 심장. 심해의 힘.',
    effect:{ str:50, end:45, fear:30, agi:20 }, condition:{ continent:'southeast', minCombatWin:45 } },
  { id:'relic_ancient_gear', name:'고대 기계의 핵심 기어', icon:'⚙️', desc:'수만 년 전 문명이 만든 기어. 무한동력의 원리를 담고 있다.',
    effect:{ int:50, end:40, str:30, mgc:25 }, condition:{ continent:'northwest', minCraft:25 } },
  // ── 메인퀘스트 전설 아이템 ───────────────────────
  { id:'fragment_seal',   name:'봉인석 파편',          icon:'💎', desc:'고대 봉인석의 파편. 마계 에너지가 미세하게 새어나온다. [MQ1 보상]',
    effect:{ mgc:20, per:15, int:10 }, condition:{ hasFlag:'mq1_done' } },
  { id:'shadow_contract',  name:'결사의 계약 파편',    icon:'📜', desc:'아스모데우스 결사의 계약서 조각. 마계 존재들이 일시 복종한다. [MQ3 보상]',
    effect:{ neg:30, cha:20, fear:15 }, condition:{ hasFlag:'mq3_done' } },
  { id:'world_fragment',   name:'세계의 파편',          icon:'🌌', desc:'세계의 의지가 깃든 파편. 세계와 공명한다. [MQ5 보상]',
    effect:{ wil:40, mgc:30, int:25, luk:20 }, condition:{ hasFlag:'mq5_done' } },
  { id:'demon_covenant_ring','name':'마왕의 동맹 인장', icon:'💍', desc:'베엘제부브 마왕이 하사한 동맹의 인장. 마계에서 자유롭게 통행한다. [MQ6 보상]',
    effect:{ fear:35, str:25, wil:20, mgc:20 }, condition:{ hasFlag:'mq6_done' } },
  { id:'seal_of_world',    name:'세계 봉인 완성의 인',  icon:'🌏', desc:'세계를 구한 자만이 갖는 인. 이 세계의 모든 것과 연결돼 있다. [MQ8 보상]',
    effect:{ str:50, mgc:50, wil:50, luk:30, fath:30, int:30 }, condition:{ hasFlag:'world_saved' } },
  // ── 천계/마계 전설 유물 ──────────────────────────
  { id:'relic_archangel_blade', name:'대천사장의 성검', icon:'⚔️✨', desc:'미카엘 대천사장의 성검. 어둠의 존재를 즉시 정화한다.',
    effect:{ str:55, fath:50, wil:40, mgc:30 }, condition:{ continent:'celestial', minFaith:80 } },
  { id:'relic_chaos_heart', name:'최초의 혼돈 심장',   icon:'🌑', desc:'최초의 혼돈에서 얻은 심장. 어떤 힘도 흡수한다.',
    effect:{ str:60, mgc:60, wil:50, mad:30 }, condition:{ hasFlag:'world_saved', continent:'infernal' } },
  // ── 메인퀘스트 보상 유물 (추가분) ─────────────────
  { id:'relic_frost_essence', name:'빙하의 정수',        icon:'❄️', desc:'빙하 부족을 구원하고 얻은 얼음 정수. 극한의 냉기가 깃들어 있다. [MQ3-2 보상]',
    effect:{ end:15, wil:12, mgc:8 }, condition:{ hasFlag:'mq3-2_done' } },
  { id:'relic_earth_core',   name:'대지의 핵',           icon:'🗿', desc:'대지의 균열을 잠재우고 얻은 핵. 땅의 힘이 응축되어 있다. [MQ3-3 보상]',
    effect:{ str:15, end:15, wil:10 }, condition:{ hasFlag:'mq3-3_done' } },
  { id:'relic_forgotten_key', name:'망각의 열쇠',        icon:'🔮', desc:'아르카누스가 건넨 열쇠. 잊혀진 루프의 기억을 여는 힘이 있다. [MQ21-1 보상]',
    effect:{ int:20, wil:15, mgc:10 }, condition:{ hasFlag:'mq21-1_done' } },
  { id:'relic_chaos_fragment', name:'최초의 혼돈 파편',  icon:'🌑', desc:'최초의 혼돈과의 결전에서 얻은 파편. 순수한 엔트로피가 담겨 있다. [MQ27 보상]',
    effect:{ str:25, mgc:25, wil:25 }, condition:{ hasFlag:'mq27_done' } },
];

export const REPUTATION_LEVELS = [
  { min:0,    level:'무명',   title:'',           icon:'⚫' },
  { min:50,   level:'신참',   title:'신입 모험가', icon:'⚪' },
  { min:150,  level:'유명',   title:'알려진 용사', icon:'🟢' },
  { min:300,  level:'명성',   title:'전설의 시작', icon:'🔵' },
  { min:500,  level:'영웅',   title:'왕국의 영웅', icon:'🟣' },
  { min:800,  level:'전설',   title:'살아있는 전설',icon:'🟡' },
  { min:1200, level:'신화',   title:'신화의 존재', icon:'🔴' },
  { min:2000, level:'불멸',   title:'불멸의 이름', icon:'⭐' },
];
