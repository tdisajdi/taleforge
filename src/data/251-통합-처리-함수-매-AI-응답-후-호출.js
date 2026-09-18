// 통합 처리 함수 — 매 AI 응답 후 호출 — data
// Pure data split out of misc/251-통합-처리-함수-매-AI-응답-후-호출.js (see generate.js).

export const SKILL_CD_DEFS={
  // ── 기존 시스템 스킬 ──────────────────────────────────
  active_burst:{cd:5},active_heal:{cd:3},active_inspire:{cd:6},active_mirage:{cd:4},
  active_poison:{cd:3},active_time_stop:{cd:8},active_summon:{cd:6},
  // ── 기본 active 스킬 ──────────────────────────────────
  active_strike:{cd:2},active_taunt:{cd:2},active_shadow:{cd:3},active_stealth:{cd:3},
  active_berserk:{cd:4},active_fireball:{cd:3},active_assassin:{cd:4},
  active_overclock:{cd:4},active_qi_burst:{cd:4},active_phantom_blade:{cd:5},
  active_holy_smite:{cd:5},active_blizzard:{cd:6},active_dragon_breath:{cd:7},
  active_neural_hack:{cd:5},
  // ── 종족 스킬 ─────────────────────────────────────────
  race_human_will:{cd:4},race_elf_truesight:{cd:4},race_dwarf_forge:{cd:5},
  race_orc_rage:{cd:5},race_beast_frenzy:{cd:5},race_undead_drain:{cd:4},
  race_demon_contract:{cd:5},race_darkling_curse:{cd:4},race_darkling_shadow:{cd:4},
  race_celestial_light:{cd:4},race_dragon_breath:{cd:5},race_elem_burst:{cd:5},
  // 🩸 뱀파이어 전용
  race_vamp_bite:{cd:3},race_vamp_charm:{cd:5},race_vamp_sovereign:{cd:15},
  // 세레스티얼 연대기
  cc_s1_holy_mark:{cd:2},cc_s2_purify_touch:{cd:4},
  // 피의 연대기 단계 스킬
  vc_s1_blood_memory:{cd:4},vc_s2_fear_harvest:{cd:5},vc_s2_night_sovereign:{cd:0},
  vc_s3_ancient_read:{cd:5},vc_s3_named_terror:{cd:6},
  vc_s4_legend_aura:{cd:0},vc_s4_blood_throne:{cd:10},
  vc_s5_chronicle_incarnate:{cd:15},vc_s5_eternal_chronicle:{cd:0},
  // 다크링 공허
  dv_s1_void_step:{cd:3},beast_wild_surge:{cd:6},
  // ── 시나리오별 스킬 ───────────────────────────────────
  cs_chaos_aura:{cd:4},cs_false_quest:{cd:5},cs_butterfly:{cd:6},
  cs_world_flip:{cd:10},cs_entropy:{cd:12},cs_chaos_god:{cd:20},
  cs_mf_royal_decree:{cd:4},cs_mf_rune_burst:{cd:5},
  cs_mf_holy_barrier:{cd:6},cs_mf_dragon_roar:{cd:6},
  cs_my_fate_read:{cd:4},cs_my_titan_strength:{cd:7},cs_my_divine_wrath:{cd:8},
  cs_ap_war_cry:{cd:5},cs_ap_scavenger:{cd:3},cs_ap_last_stand2:{cd:8},
  cs_sp_analysis:{cd:3},cs_sp_overclock2:{cd:5},
  cs_sp_steam_blast:{cd:4},cs_sp_aether_surge:{cd:7},
  cs_cp_chrome_reflex:{cd:4},cs_cp_data_ghost:{cd:5},
  cs_cp_neural_storm2:{cd:7},cs_cp_god_protocol:{cd:9},
  cs_wx_void_step:{cd:4},cs_wx_heaven_slash:{cd:7},cs_wx_qi_explosion:{cd:8},
  os_shield_word:{cd:4},os_law_cite:{cd:5},os_fate_chain:{cd:6},
  os_world_law:{cd:10},os_divine_end:{cd:12},os_order_god:{cd:20},
};

export const CONTRACT_ORGS = {
  mercenary: {
    name:'자유 용병단', icon:'⚔️', color:'#5d4037',
    desc:'돈만 주면 누구든 베어주는 칼잡이들의 연합. 전투·호위·위협을 전문으로 한다.',
    factionName:'용병 길드', // FACTIONS / updateFactionRep 연동 키
    repReq:0, karmaReq:0,    // 접근 자체엔 제약 없음(평판 0 이상이면 누구나)
  },
  informant: {
    name:'정보상 길드', icon:'🕵️', color:'#3a5a7a',
    desc:'뒷골목 정보망. 첩보·미행·뒷조사를 의뢰할 수 있다.',
    factionName:'도적 길드',
    repReq:0, karmaReq:0,
  },
  thieves: {
    name:'도적 길드', icon:'🗡️', color:'#2c3e50',
    desc:'절도·밀수·납치까지 가리지 않는 지하 조직. 악명이 높을수록 신뢰한다.',
    factionName:'도적 길드',
    repReq:0, karmaReq:40, // 카르마(악행도) 40 이상부터 접촉 가능
  },
  assassins: {
    name:'그림자 결사', icon:'🌑', color:'#1a0a1a',
    desc:'존재를 지우는 자들. 암살·실종·증거 인멸을 다룬다. 발각 위험이 가장 크다.',
    factionName:'도적 길드',
    repReq:0, karmaReq:70, // 카르마 70 이상(저주받은 영혼 단계)부터
  },
};

export const CONTRACT_DEFS = [
  // 용병단 — 비교적 안전, 전투/호위 중심
  { id:'merc_escort', org:'mercenary', tier:1, name:'호위 의뢰', icon:'🛡️', cost:60,
    desc:'위험 지역까지 안전하게 호위해줄 용병을 고용한다.',
    successBase:0.85, statBonus:'cha', riskLabel:'낮음',
    successHint:'고용한 용병이 든든하게 호위해주는 장면을 자연스럽게 묘사하라.',
    failHint:'호위 용병이 약속한 만큼 제 역할을 못 해 위기를 겪는 장면을 넣어라.',
    rewardGold:0, recruitChance:0.5 },
  { id:'merc_intimidate', org:'mercenary', tier:1, name:'위협/협박 의뢰', icon:'💪', cost:90,
    desc:'덩치 좋은 용병을 보내 상대를 겁주거나 빚을 받아낸다.',
    successBase:0.7, statBonus:'str', riskLabel:'중간',
    successHint:'고용한 용병이 상대를 위협해 원하는 결과를 받아내는 장면을 묘사하라. 주인공은 직접 손을 더럽히지 않는다.',
    failHint:'협박이 역효과를 낳아 상대가 더 적대적으로 변하거나, 평판에 흠이 가는 장면을 넣어라.',
    rewardGold:0, recruitChance:0.5, repPenaltyOnFail:8 },
  { id:'merc_band', org:'mercenary', tier:2, name:'전투 용병 고용', icon:'⚔️', cost:150,
    desc:'실력있는 전투 용병을 정식으로 고용해 동행시킨다. (용병단 인원으로 합류 가능)',
    successBase:0.9, statBonus:'cha', riskLabel:'낮음',
    successHint:'새로 고용한 용병이 합류하여 주인공의 곁에서 함께 행동하는 장면을 그려라.',
    failHint:'마음에 드는 용병을 찾지 못해 빈손으로 돌아오는 장면을 짧게 묘사하라.',
    rewardGold:0, recruitChance:1.0 },

  // 정보상 — 정보 수집, 비교적 안전
  { id:'info_dig', org:'informant', tier:1, name:'뒷조사 의뢰', icon:'🔍', cost:50,
    desc:'특정 인물이나 사건에 대한 뒷조사를 의뢰한다.',
    successBase:0.8, statBonus:'int', riskLabel:'낮음',
    successHint:'정보상이 캐낸 은밀한 정보를 주인공에게 전달하는 장면을 다음 서사에 자연스럽게 포함하라. 새로운 단서나 비밀 하나를 구체적으로 제시하라.',
    failHint:'정보상이 별 소득 없이 돌아오거나, 엉뚱한 정보를 가져오는 장면을 넣어라.',
    rewardGold:0, recruitChance:0 },
  { id:'info_shadow', org:'informant', tier:2, name:'미행/감시 의뢰', icon:'👁️', cost:100,
    desc:'대상을 은밀히 미행하고 동선을 파악한다.',
    successBase:0.75, statBonus:'per', riskLabel:'중간',
    successHint:'미행을 통해 대상의 비밀스러운 동선이나 행동 패턴이 드러나는 장면을 묘사하라.',
    failHint:'미행이 발각되어 대상이 경계하게 되거나, 의뢰가 실패로 돌아가는 장면을 넣어라.',
    rewardGold:0, recruitChance:0, repPenaltyOnFail:5 },

  // 도적 길드 — 절도/밀수, 카르마 필요
  { id:'thief_steal', org:'thieves', tier:1, name:'절도 의뢰', icon:'🧤', cost:80,
    desc:'특정 물건을 훔쳐오도록 도적을 고용한다.',
    successBase:0.65, statBonus:'agi', riskLabel:'중간',
    successHint:'고용된 도적이 목표물을 성공적으로 훔쳐 주인공에게 가져다주는 장면을 그려라. 훔친 물건은 장물로 취급된다.',
    failHint:'도적이 붙잡혀 주인공의 이름이 거론될 위험에 처하는 장면, 혹은 빈손으로 도망친 도적을 묘사하라.',
    rewardGold:0, recruitChance:0.3, repPenaltyOnFail:10, jailRiskOnFail:0.25 },
  { id:'thief_smuggle', org:'thieves', tier:2, name:'밀수/은닉 의뢰', icon:'📦', cost:120,
    desc:'금지된 물건의 운송이나 증거 은닉을 맡긴다.',
    successBase:0.6, statBonus:'luk', riskLabel:'높음',
    successHint:'밀수가 깔끔하게 처리되어 흔적이 남지 않는 장면을 그려라.',
    failHint:'관계자가 입을 열거나 물건이 발각되어 주인공에게 위협이 돌아오는 장면을 넣어라.',
    rewardGold:0, recruitChance:0.3, repPenaltyOnFail:12, jailRiskOnFail:0.2 },

  // 그림자 결사 — 암살/실종, 카르마 70+ 필요, 가장 위험
  { id:'assn_threaten', org:'assassins', tier:2, name:'협박/경고 의뢰', icon:'🗡️', cost:200,
    desc:'표적에게 돌이킬 수 없는 경고를 보낸다. 죽이지는 않되 공포를 심는다.',
    successBase:0.6, statBonus:'wil', riskLabel:'높음',
    successHint:'표적이 깊은 공포에 질려 더는 주인공을 건드리지 못하게 되는 장면을 그려라. 직접적인 살해 묘사는 피하고 암시적으로 처리하라.',
    failHint:'경고가 잘못 전달되어 표적이 보복을 계획하거나, 그림자 결사와의 신뢰가 흔들리는 장면을 넣어라.',
    rewardGold:0, recruitChance:0, repPenaltyOnFail:15, jailRiskOnFail:0.3 },
  { id:'assn_eliminate', org:'assassins', tier:3, name:'제거 의뢰', icon:'💀', cost:400,
    desc:'표적을 영구히 세상에서 지운다. 가장 무겁고 위험한 의뢰.',
    successBase:0.55, statBonus:'wil', riskLabel:'극도로 높음',
    successHint:'그림자 결사가 표적을 깔끔하게 제거했다는 암시적인 소식이 전해지는 장면을 그려라. 직접적인 폭력 묘사보다는 결과와 그 여파(주변의 반응, 주인공의 심리)에 집중하라.',
    failHint:'암살이 실패하여 결사의 정체가 드러날 위기에 처하거나, 표적이 살아남아 복수를 예고하는 장면을 넣어라.',
    rewardGold:0, recruitChance:0, repPenaltyOnFail:25, jailRiskOnFail:0.4, karmaGainOnSuccess:8 },

  // 조직 병합(흡수) — 모든 조직 공통, 최고 티어
  { id:'org_absorb', org:'__any__', tier:4, name:'조직 흡수', icon:'👑', cost:0,
    desc:'압도적인 악명과 신뢰를 바탕으로 조직 자체를 내 산하로 끌어들인다.',
    successBase:0.5, statBonus:'cha', riskLabel:'조직 전체가 걸림',
    successHint:'조직의 수장이 굴복하거나 충성을 맹세하며, 조직 전체가 주인공의 산하로 들어오는 극적인 장면을 그려라.',
    failHint:'흡수 시도가 거부당해 조직과의 관계가 악화되는 장면을 넣어라.',
    rewardGold:0, recruitChance:0 },
];

export const MERC_ARCHETYPES = {
  vanguard: { label:'전위', icon:'🛡️', statKeys:['str','end'], desc:'앞에서 버티며 적을 붙잡는다.' },
  skirmisher:{ label:'척후', icon:'🗡️', statKeys:['agi','per'], desc:'기습과 교란으로 전투를 흔든다.' },
  archer:    { label:'궁수', icon:'🏹', statKeys:['rng','per'], desc:'원거리에서 지원 사격을 가한다.' },
  medic:     { label:'치유', icon:'🌿', statKeys:['fath','wil'],desc:'부상당한 동료를 돌본다.' },
};

export const MERC_RARITY = {
  common:    { label:'평범한',     weight:50, bonusMult:0.85, maxEvo:2, upkeepMult:0.85 },
  uncommon:  { label:'쓸만한',     weight:28, bonusMult:1.0,  maxEvo:3, upkeepMult:1.0  },
  rare:      { label:'뛰어난',     weight:14, bonusMult:1.2,  maxEvo:4, upkeepMult:1.2  },
  epic:      { label:'출중한',     weight:6,  bonusMult:1.45, maxEvo:5, upkeepMult:1.5  },
  legendary: { label:'전설의',     weight:1.8,bonusMult:1.8,  maxEvo:6, upkeepMult:2.0  },
  primal:    { label:'태초의',     weight:0.2,bonusMult:2.3,  maxEvo:6, upkeepMult:2.6  },
};

export const MERC_TRAITS = {
  veteran:  { label:'역전의 용사', icon:'⭐', desc:'수많은 전장을 겪었다. 충성도가 잘 흔들리지 않는다.', loyaltyDecayMult:0.5 },
  greedy:   { label:'구두쇠',       icon:'💰', desc:'적은 삯에도 만족한다. 유지비가 낮다.', upkeepMult:0.7 },
  reckless: { label:'만용',         icon:'🔥', desc:'물불을 가리지 않는다. 전투 보너스는 높지만 이탈 위험도 크다.', bonusMult:1.4, loyaltyDecayMult:1.5 },
  loyal:    { label:'충직',         icon:'🤝', desc:'한번 따르기로 한 이상 쉽게 등 돌리지 않는다.', desertChanceMult:0.3 },
  ambitious:{ label:'야심가',       icon:'📈', desc:'공을 세울수록 눈에 띄게 성장한다.', xpMult:1.5 },
  frail:    { label:'허약',         icon:'🩹', desc:'전투 보너스가 낮은 대신 유지비도 낮다.', bonusMult:0.7, upkeepMult:0.8 },
};

export const MERC_EVO_THRESHOLDS = [4, 9, 15, 22, 32, 45];

export const MERC_EVO_STAGE_NAMES = ['각성','개화','군림','초월','신화','현현'];

export const MERC_CRIME_LORD_BY_SCENARIO = {
  medieval:   { faction:'도적 길드', leaderName:'외팔이 라곤', leaderTitle:'도적단 두목', domainTitle:'그림자 왕', lawFaction:'왕국 기사단' },
  custom:     { faction:'도적 길드', leaderName:'그림자 두목', leaderTitle:'조직 수장', domainTitle:'그림자 지배자', lawFaction:'왕국 기사단' },
};

export const MERC_HIREABLE_RANKS = ['평민','상인','용병','군인','도적','첩보원'];

export const MERC_MISSIONS = {
  escort:   { label:'호위 임무', icon:'🛡️', minMembers:1, days:2, riskBase:0.10, goldPerDay:15, xpPerDay:2,
              desc:'상단이나 여행자를 목적지까지 호위한다. 비교적 안전.' },
  scout:    { label:'정찰 임무', icon:'👁️', minMembers:1, days:1, riskBase:0.08, goldPerDay:10, xpPerDay:3,
              desc:'인근 지역을 정찰해 정보를 모아온다. 짧고 안전.' },
  patrol:   { label:'토벌 임무', icon:'⚔️', minMembers:2, days:3, riskBase:0.25, goldPerDay:25, xpPerDay:5,
              desc:'몬스터나 도적 무리를 소탕한다. 위험하지만 보수가 좋다.' },
  collect:  { label:'징수 임무', icon:'💰', minMembers:2, days:2, riskBase:0.15, goldPerDay:20, xpPerDay:3,
              desc:'밀린 채무나 통행세를 대신 징수한다. 반발이 있을 수 있다.' },
  guard:    { label:'수비 임무', icon:'🏰', minMembers:1, days:4, riskBase:0.12, goldPerDay:12, xpPerDay:2,
              desc:'거점을 장기간 지킨다. 낮은 위험, 낮은 수익, 안정적.' },
};

export const MERC_CRIME_MISSIONS = {
  raid:     { label:'약탈', icon:'🏴', minMembers:2, days:2, riskBase:0.30, goldPerDay:35, xpPerDay:5, notorietyGain:8,
              desc:'상단이나 마을을 습격해 재물을 강탈한다. 위험하지만 보수가 매우 좋다.' },
  smuggle:  { label:'밀수', icon:'📦', minMembers:1, days:2, riskBase:0.18, goldPerDay:22, xpPerDay:4, notorietyGain:4,
              desc:'금제품을 몰래 운송한다. 발각되면 곤란해지지만 상대적으로 조용하다.' },
  extort:   { label:'강탈', icon:'💰', minMembers:2, days:1, riskBase:0.20, goldPerDay:28, xpPerDay:3, notorietyGain:6,
              desc:'마을이나 상인에게 보호비 명목으로 재물을 강제로 뜯어낸다.' },
};

export const MERC_HQ_BUILDINGS = {
  barracks: { id:'barracks', name:'막사', icon:'🏕️', maxLevel:3, baseCost:200,
    desc:'상주 인원의 숙식을 해결해 유지비를 줄인다.',
    effect:(lv)=>({ upkeepDiscount: lv*0.1 }) }, // 레벨당 유지비 10%↓
  training: { id:'training', name:'훈련장', icon:'🎯', maxLevel:3, baseCost:250,
    desc:'꾸준한 훈련으로 전투 경험치 획득량이 늘어난다.',
    effect:(lv)=>({ xpBonus: lv*0.15 }) }, // 레벨당 경험치 15%↑
  forge: { id:'forge', name:'대장간', icon:'⚒️', maxLevel:3, baseCost:300,
    desc:'자체적으로 장비를 손볼 수 있어 보급 비용이 줄어든다.',
    effect:(lv)=>({ gearDiscount: lv*0.12 }) }, // 레벨당 장비 업그레이드 비용 12%↓
  watchtower: { id:'watchtower', name:'초소', icon:'🗼', maxLevel:3, baseCost:220,
    desc:'거점을 지키는 눈이 늘어 지원자가 더 잘 찾아오고, 배치 방어력도 오른다.',
    effect:(lv)=>({ walkInBonus: lv*0.015, garrisonDefBonus: lv*0.05 }) },
};

export const MERC_JOB_CLIENTS = [
  {label:'상단 조합', reason:'상단의 물자를 옮겨야 합니다'},
  {label:'촌장', reason:'마을 인근에 위협이 나타났습니다'},
  {label:'영주 관저', reason:'영지 관리에 인력이 필요합니다'},
  {label:'여관 주인', reason:'손님이 도움을 청하고 있습니다'},
  {label:'행상인', reason:'혼자 다니기엔 길이 위험합니다'},
  {label:'경비대', reason:'인력이 부족해 지원을 구합니다'},
];

export const MERC_CRIME_JOB_CLIENTS = [
  {label:'뒷골목 정보상', reason:'경쟁 상단의 물건을 가로채야 합니다'},
  {label:'도적 길드 중개인', reason:'변방 마을에서 재물을 거둬야 합니다'},
  {label:'밀수업자', reason:'국경을 넘는 금제품이 있습니다'},
  {label:'수상한 뱃사공', reason:'조용히 처리할 일이 있습니다'},
  {label:'전당포 주인', reason:'빚진 자에게서 대신 받아내야 합니다'},
];

export const MERC_CONTACT_STAGES = [
  // stage 0 → 1: 첫 접촉 (기존 즉시 이벤트, 확률 등장)
  { stage:1, id:'contact_first', clientLabel:'수상한 접촉',
    reason:'그림자 속 누군가 조용히 다가와 "다른 종류의 일"을 제안한다.',
    notorietyGain:3, chance:0.15,
    onAccept:'주인공이 그림자 속 수상한 인물의 제안을 받아들여 은밀한 뒷거래에 손을 댔다. 아직 크게 드러나지는 않았지만, 어둠의 세계에 발을 들이기 시작했다는 소문이 조금씩 돈다.' },
  // stage 1 → 2: 시험 — 작은 범죄를 대신 해달라는 요청 (파견 없이 즉시 처리, 위험 부담 있음)
  { stage:2, id:'contact_test', clientLabel:'그림자의 시험',
    reason:'지난번 그 인물이 다시 찾아와 "믿을 만한지 보고 싶다"며 작은 일을 부탁한다.',
    notorietyGain:6, chance:0.5, riskOfFail:0.25,
    onAccept:'주인공이 그림자 조직이 내준 시험을 통과했다. 조직은 이제 주인공을 눈여겨보기 시작했다.',
    onFail:'시험에 실패했다. 그림자 조직은 실망한 기색을 감추지 않았지만, 완전히 등을 돌리지는 않았다 — 아직 기회가 남아있다.' },
  // stage 2 → 3: 정식 초대 — 수락하면 자동 전향 + 접선책 소개
  { stage:3, id:'contact_invite', clientLabel:'정식 초대',
    reason:'이번엔 다르다 — 조직이 직접 정식으로 가입을 제안해온다. 더 이상 "다른 종류의 일"이 아니라, 확실한 소속이다.',
    notorietyGain:10, chance:0.7,
    onAccept:null, // 특수 처리 (아래 acceptMercContact에서 자동 전향)
  },
];

export const MERC_GEAR_TIERS = [
  { tier:0, label:'허름한 장비',   bonusMult:1.0,  upkeepAdd:0,  upgradeCost:0 },
  { tier:1, label:'표준 장비',     bonusMult:1.15, upkeepAdd:2,  upgradeCost:200 },
  { tier:2, label:'정예 장비',     bonusMult:1.35, upkeepAdd:4,  upgradeCost:500 },
  { tier:3, label:'전설급 장비',   bonusMult:1.6,  upkeepAdd:8,  upgradeCost:1200 },
];

export const CARAVAN_ARCHETYPES = {
  trader:   { label:'행상인', icon:'💰', statKeys:['cha','luk'], desc:'물건을 사고팔며 이문을 남긴다.' },
  porter:   { label:'짐꾼',   icon:'📦', statKeys:['str','end'], desc:'많은 짐을 지고 먼 길을 견딘다.' },
  scout:    { label:'길잡이', icon:'🧭', statKeys:['agi','per'], desc:'안전한 길을 찾고 위험을 미리 감지한다.' },
  clerk:    { label:'경리',   icon:'📋', statKeys:['int','cha'], desc:'장부를 기록하고 거래를 정확히 처리한다.' },
};

export const CARAVAN_RARITY = {
  common:    { label:'평범한', weight:50, bonusMult:0.85, maxEvo:2, upkeepMult:0.85 },
  uncommon:  { label:'쓸만한', weight:28, bonusMult:1.0,  maxEvo:3, upkeepMult:1.0  },
  rare:      { label:'뛰어난', weight:14, bonusMult:1.2,  maxEvo:4, upkeepMult:1.2  },
  epic:      { label:'출중한', weight:6,  bonusMult:1.45, maxEvo:5, upkeepMult:1.5  },
  legendary: { label:'전설의', weight:1.8,bonusMult:1.8,  maxEvo:6, upkeepMult:2.0  },
  primal:    { label:'태초의', weight:0.2,bonusMult:2.3,  maxEvo:6, upkeepMult:2.6  },
};

export const CARAVAN_TRAITS = {
  veteran:  { label:'노련한 여행자', icon:'⭐', desc:'수많은 길을 다녀봤다. 충성도가 잘 흔들리지 않는다.', loyaltyDecayMult:0.5 },
  greedy:   { label:'검소한',        icon:'💰', desc:'적은 삯에도 만족한다. 유지비가 낮다.', upkeepMult:0.7 },
  reckless: { label:'모험적',        icon:'🔥', desc:'위험한 거래도 마다하지 않는다. 이문은 높지만 이탈 위험도 크다.', bonusMult:1.4, loyaltyDecayMult:1.5 },
  loyal:    { label:'충직',          icon:'🤝', desc:'한번 따르기로 한 이상 쉽게 등 돌리지 않는다.', desertChanceMult:0.3 },
  ambitious:{ label:'입지전적',      icon:'📈', desc:'거래를 성사시킬수록 눈에 띄게 성장한다.', xpMult:1.5 },
  frail:    { label:'소심한',        icon:'🩹', desc:'이문은 낮은 대신 유지비도 낮다.', bonusMult:0.7, upkeepMult:0.8 },
};

export const CARAVAN_EVO_THRESHOLDS = [4, 9, 15, 22, 32, 45];

export const CARAVAN_EVO_STAGE_NAMES = ['성장','숙련','명성','거상','전설','대상회주'];

export const CARAVAN_HQ_BUILDINGS = {
  warehouse: { id:'warehouse', name:'창고', icon:'🏬', maxLevel:3, baseCost:200,
    desc:'물자를 안전하게 보관해 유지비를 줄인다.',
    effect:(lv)=>({ upkeepDiscount: lv*0.1 }) },
  ledger_office: { id:'ledger_office', name:'장부소', icon:'📖', maxLevel:3, baseCost:250,
    desc:'거래 기록을 체계화해 경험치 획득량이 늘어난다.',
    effect:(lv)=>({ xpBonus: lv*0.15 }) },
  stable: { id:'stable', name:'마구간', icon:'🐎', maxLevel:3, baseCost:300,
    desc:'좋은 짐수레와 말을 마련해 장비 보급 비용이 줄어든다.',
    effect:(lv)=>({ gearDiscount: lv*0.12 }) },
  watchpost: { id:'watchpost', name:'감시탑', icon:'🗼', maxLevel:3, baseCost:220,
    desc:'거점을 지키는 눈이 늘어 지원자가 더 잘 찾아오고, 배치 방어력도 오른다.',
    effect:(lv)=>({ walkInBonus: lv*0.015, garrisonDefBonus: lv*0.05 }) },
};

export const CARAVAN_HIREABLE_RANKS = ['평민','상인','짐꾼','여행자','안내인'];

export const CARAVAN_MISSIONS = {
  trade_route: { label:'대상행', icon:'🐪', minMembers:2, days:3, riskBase:0.15, goldPerDay:25, xpPerDay:5,
                 desc:'먼 도시까지 교역로를 왕복한다. 이문이 크지만 도적 위험도 있다.' },
  peddling:    { label:'보부상', icon:'🎒', minMembers:1, days:1, riskBase:0.08, goldPerDay:12, xpPerDay:2,
                 desc:'인근 마을을 돌며 소소하게 판다. 짧고 안전.' },
  scouting:    { label:'교역로 정찰', icon:'🧭', minMembers:1, days:1, riskBase:0.06, goldPerDay:8, xpPerDay:3,
                 desc:'새로운 교역로의 안전과 수익성을 미리 살핀다.' },
  bulk_buy:    { label:'도매 매입', icon:'📦', minMembers:2, days:2, riskBase:0.12, goldPerDay:20, xpPerDay:3,
                 desc:'산지에서 물건을 대량으로 사들여 온다.' },
  guard_post:  { label:'거점 경비', icon:'🏰', minMembers:1, days:4, riskBase:0.10, goldPerDay:10, xpPerDay:2,
                 desc:'거점을 장기간 지킨다. 낮은 위험, 낮은 수익, 안정적.' },
};

export const CARAVAN_JOB_CLIENTS = [
  {label:'상인 조합', reason:'대량의 물자를 옮겨야 합니다'},
  {label:'촌장', reason:'마을에 필요한 물자를 구해와야 합니다'},
  {label:'영주 관저', reason:'영지 교역에 인력이 필요합니다'},
  {label:'여관 주인', reason:'특산품을 구해주면 사례하겠다고 합니다'},
  {label:'대장장이', reason:'희귀 재료를 조달해줄 상단을 찾습니다'},
  {label:'항구 관리소', reason:'선적 물자 운송이 필요합니다'},
];
