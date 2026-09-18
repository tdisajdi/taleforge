// 레벨업 + 스탯 포인트 배분 시스템 — data
// Pure data split out of misc/009-레벨업-스탯-포인트-배분-시스템.js (see generate.js).

export const EPIC_QUEST_CHAINS = [
  {
    id: 'epic_legendary_weapon', icon: '⚔️', title: '전설 무기의 인도자',
    desc: '대륙 곳곳에 흩어진 전설 무기의 조각을 모아 하나로 완성하는 여정.',
    steps: [
      { id:'elw_1', title:'첫 조각의 단서', desc:'전설 무기에 대한 첫 번째 실마리를 발견한다.',
        keywords:['전설의 무기','고대의 검','부러진 검','전설 무기'] },
      { id:'elw_2', title:'대장장이의 기억', desc:'무기를 만든 대장장이의 흔적을 쫓는다.',
        keywords:['대장장이','단조','대장간','벼려낸'] },
      { id:'elw_3', title:'조각 수집', desc:'흩어진 무기 조각을 모은다.',
        keywords:['조각을 발견','조각을 얻','파편을 회수','무기 조각'] },
      { id:'elw_4', title:'봉인 해제', desc:'조각들을 하나로 합칠 봉인 의식을 치른다.',
        keywords:['봉인을 풀','의식을 마치','하나로 합쳐','재탄생'] },
      { id:'elw_5', title:'전설의 완성', desc:'마침내 전설 무기가 완전한 모습을 되찾는다.',
        keywords:['전설이 완성','무기가 깨어','완전한 힘을 되찾'] },
    ],
  },
  {
    id: 'epic_margrave_secrets', icon: '🏰', title: '세 대공령의 비밀',
    desc: '철벽·태양 회랑·무쇠 세 대공령이 각자 숨겨온 비밀을 전부 밝혀내는 여정.',
    steps: [
      { id:'ems_1', title:'철벽의 그림자', desc:'철벽 대공령, 그레고리안이 숨긴 정략동맹의 실체를 파고든다.',
        keywords:['그레고리안','철벽 대공','야만족과의','정략동맹'] },
      { id:'ems_2', title:'태양 회랑의 지하실', desc:'이자벨라가 봉쇄해온 곡물창고 지하의 정체를 밝힌다.',
        keywords:['이자벨라','태양 회랑','지하 곡물창고','봉쇄된 지하실'] },
      { id:'ems_3', title:'무쇠의 과거', desc:'카심의 부대에 얽힌 금지된 마법의 전력을 추적한다.',
        keywords:['카심','무쇠 변경백','금지된 마법','이단 심문소'] },
      { id:'ems_4', title:'세 영주의 회합', desc:'세 대공을 한자리에 모아 진실을 마주하게 한다.',
        keywords:['세 영주','대공들이 모여','회합','동맹을 제안'] },
      { id:'ems_5', title:'변경의 새로운 질서', desc:'대공령들 사이에 새로운 균형이 세워진다.',
        keywords:['새로운 질서','변경의 평화','동맹이 맺어','대공령의 미래'] },
    ],
  },
  {
    id: 'epic_ancient_ruins', icon: '🗿', title: '태초 유적의 발굴자',
    desc: '세계 각지의 고대 유적을 발굴하며 문명 이전의 진실에 다가가는 여정.',
    steps: [
      { id:'aar_1', title:'유적의 발견', desc:'지도에도 없는 고대 유적의 입구를 발견한다.',
        keywords:['고대 유적','잊혀진 유적','유적의 입구','폐허가 된 신전'] },
      { id:'aar_2', title:'문자의 해독', desc:'유적 벽면에 새겨진 태초의 문자를 해독한다.',
        keywords:['고대 문자','벽화를 해독','상형문자','새겨진 글귀'] },
      { id:'aar_3', title:'수호자와의 조우', desc:'유적을 지키는 태초의 수호자와 마주한다.',
        keywords:['유적의 수호자','고대의 파수꾼','수호 기구','태초의 파수병'] },
      { id:'aar_4', title:'깊은 곳의 진실', desc:'유적 최심부에서 문명 이전의 기록을 발견한다.',
        keywords:['최심부','문명 이전','태초의 기록','잊혀진 시대'] },
      { id:'aar_5', title:'발굴의 완성', desc:'유적의 모든 비밀이 밝혀지고 발굴이 완결된다.',
        keywords:['발굴이 완료','유적의 전모','모든 비밀이 밝혀'] },
    ],
  },
];

export const STAT_POINT_ALLOC_KEYS = [
  'str','agi','end','mgc','int','per','fath','luk','wil','disg','fear','neg','crit','rng'
];

export const SKILL_DEFS = [
  // ── 능동 스킬 (Active) ──────────────────────────────────
  { id:"active_strike",    type:"active",  name:"강격",         icon:"⚔️",  rarity:"common",    mpCost:10, req:{str:30},          scenario:null, desc:"힘을 담아 강하게 내리친다. 서사에 강한 물리 타격이 반영된다.",          aiHint:"강격 스킬 사용! 강렬한 물리 공격을 묘사하십시오. 피해 증폭 효과.", effects:{kind:"damage",statSource:{str:1},damageMult:0.6,element:"physical"} },
  { id:"active_fireball",  type:"active",  name:"화염구",       icon:"🔥",  rarity:"uncommon",  mpCost:22, req:{mgc:35},          scenario:null, desc:"마나를 집중시켜 화염구를 발사한다.",                                    aiHint:"화염구 스킬 사용! 강렬한 화염 마법을 묘사하십시오. 범위 피해.", effects:{kind:"damage",statSource:{mgc:1},damageMult:0.75,element:"fire"} },
  { id:"active_shadow",    type:"active",  name:"암영 이동",    icon:"🌑",  rarity:"uncommon",  mpCost:18, req:{agi:40},          scenario:null, desc:"어둠 속으로 녹아들어 순간적으로 이동한다.",                            aiHint:"암영 이동 사용! 순식간에 그림자처럼 사라졌다가 다른 위치에 나타납니다.", effects:{kind:"statBoost",statMod:{agi:8}} },
  { id:"active_heal",      type:"active",  name:"치유 기도",    icon:"💚",  rarity:"uncommon",  mpCost:22, req:{fath:40},         scenario:null, desc:"신성한 빛으로 체력을 회복한다. HP +15 회복.",                          aiHint:"치유 기도 사용! 신성한 빛이 상처를 치유합니다.", hpRestore:15 },
  { id:"active_taunt",     type:"active",  name:"도발",         icon:"😤",  rarity:"common",    mpCost:10,  req:{fear:30},         scenario:null, desc:"적의 주의를 끌어 아군을 보호한다.",                                     aiHint:"도발 스킬 사용! 적의 분노가 이 캐릭터에게 집중됩니다.", effects:{kind:"statBoost",statMod:{end:6}} },
  { id:"active_poison",    type:"active",  name:"독 투척",      icon:"🧪",  rarity:"uncommon",  mpCost:12, req:{int:35},         scenario:null, desc:"맹독 물약을 투척해 적에게 지속 피해를 준다.",                          aiHint:"독 투척 사용! 독이 퍼져나가며 적이 서서히 약해집니다.", effects:{kind:"damage",statSource:{int:1},damageMult:0.55,element:"poison"} },
  { id:"active_inspire",   type:"active",  name:"영웅 연설",    icon:"📣",  rarity:"rare",      mpCost:32, req:{spk:50,ldr:40},   scenario:null, desc:"불꽃 같은 연설로 아군의 사기를 드높인다.",                             aiHint:"영웅 연설 사용! 주변 아군이 감동받아 사기가 솟구칩니다.", effects:{kind:"buff",statMod:{ldr:10,spk:6}} },
  { id:"active_mirage",    type:"active",  name:"환영 분신",    icon:"✨",  rarity:"rare",      mpCost:30, req:{mgc:50,disg:40},  scenario:null, desc:"마법으로 분신을 만들어 적을 혼란에 빠뜨린다.",                         aiHint:"환영 분신 사용! 여러 개의 분신이 나타나 적을 혼란에 빠뜨립니다.", effects:{kind:"statBoost",statMod:{disg:10,agi:6}} },
  { id:"active_assassin",  type:"active",  name:"암살",         icon:"🗡️", rarity:"rare",      mpCost:18, req:{crit:50,agi:45},  scenario:null, desc:"급소를 노린 치명적인 일격. 대성공 확률 대폭 상승.",                   aiHint:"암살 스킬 사용! 급소를 노린 치명타입니다. 반드시 결정적 피해를 줍니다.", effects:{kind:"damage",statSource:{agi:0.5,crit:0.5},damageMult:1.0,element:"physical"} },
  { id:"active_blizzard",  type:"active",  name:"눈보라",       icon:"❄️",  rarity:"legendary", mpCost:40, req:{mgc:65,wil:50},   scenario:null, desc:"광역 빙결 마법으로 모든 적을 얼린다.",                                 aiHint:"눈보라 사용! 거대한 눈보라가 적 전체를 덮쳐 얼려버립니다.", effects:{kind:"damage",statSource:{mgc:1},damageMult:0.7,hits:2,element:"ice"} },
  { id:"active_berserk",   type:"active",  name:"광전사",       icon:"💢",  rarity:"rare",      mpCost:0,  req:{str:55,end:45},   scenario:null, desc:"HP를 10 소모하고 STR +20 효과를 얻는 광란의 상태로 돌입.", hpCost:10,  aiHint:"광전사 돌입! HP를 대가로 공격력이 폭발적으로 상승했습니다.", effects:{kind:"buff",statMod:{str:20}} },
  { id:"active_stealth",   type:"active",  name:"은신",         icon:"👥",  rarity:"uncommon",  mpCost:15, req:{disg:40,agi:35},  scenario:null, desc:"완전히 몸을 숨겨 적의 탐지를 피한다.",                                aiHint:"은신 사용! 완전히 모습을 감추고 적의 시야에서 사라집니다.", effects:{kind:"statBoost",statMod:{disg:8,agi:5}} },

  // ── 중세 판타지 전용 능동 스킬
  { id:"active_holy_smite",type:"active",  name:"성광 심판",    icon:"⚡",  rarity:"rare",      mpCost:25, req:{fath:55},         scenario:"medieval", desc:"신의 심판으로 사악한 존재에게 강렬한 빛의 피해를 준다.", aiHint:"성광 심판 사용! 신성한 빛이 내려쳐 사악한 존재를 강타합니다.", effects:{kind:"damage",statSource:{fath:1},damageMult:0.85,element:"light"} },
  { id:"active_dragon_breath",type:"active",name:"용의 숨결",   icon:"🐲",  rarity:"legendary", mpCost:45, req:{mgc:70,str:55},   scenario:"medieval", desc:"용혈의 힘으로 강렬한 불꽃을 내뿜는다.", aiHint:"용의 숨결 사용! 용의 피가 각성해 거대한 불꽃이 쏟아집니다.", effects:{kind:"damage",statSource:{mgc:0.6,str:0.4},damageMult:0.95,element:"fire"} },


  // ── 패시브 스킬 (Passive) ──────────────────────────────
  { id:"passive_iron_will", type:"passive", name:"강철 의지",    icon:"🔥",  rarity:"common",    req:{wil:35},         scenario:null,       desc:"HP 30% 이하 시 자동 발동 — 의지력 +20, 모든 판정에 보너스.", condition:"hp_low",     conditionDesc:"HP 30% 이하", statBoost:{wil:160} },
  { id:"passive_bloodlust", type:"passive", name:"혈기",         icon:"🩸",  rarity:"uncommon",  req:{str:45},         scenario:null,       desc:"전투 대성공 시 자동 발동 — STR +10, 다음 행동에 기세.", condition:"crit_success", conditionDesc:"대성공 달성", statBoost:{str:80} },
  { id:"passive_mana_flow", type:"passive", name:"마나 흐름",    icon:"💙",  rarity:"uncommon",  req:{mgc:40,mp:40},   scenario:null,       desc:"매 5턴마다 MP +10 추가 회복.", condition:"every5turn",   conditionDesc:"5턴마다", mpBonus:10 },
  { id:"passive_sixth_sense",type:"passive",name:"육감",         icon:"👁️", rarity:"rare",       req:{per:50,intn:40}, scenario:null,       desc:"위험한 상황에서 자동 경고 — 실패를 1번 성공으로 전환.", condition:"danger",      conditionDesc:"실패 시 1회 전환" },
  { id:"passive_undying",   type:"passive", name:"불사",         icon:"💀",  rarity:"legendary", req:{end:65,wil:60},  scenario:null,       desc:"HP가 0이 될 때 1번 자동 발동 — HP 1로 부활.", condition:"death",       conditionDesc:"사망 직전 1회" },
  { id:"passive_last_stand",type:"passive", name:"최후의 저항",  icon:"🛡️", rarity:"rare",       req:{end:50,str:40},  scenario:null,       desc:"HP 20 이하 시 END +30 자동 강화.", condition:"hp_critical",  conditionDesc:"HP 20 이하", statBoost:{end:240} },
  { id:"passive_lucky",     type:"passive", name:"행운아",       icon:"🍀",  rarity:"uncommon",  req:{luk:55},         scenario:null,       desc:"대실패(96-100) 발생 시 자동 재롤. 1전투 1회 한정.", condition:"crit_fail",   conditionDesc:"대실패 시 재롤" },
  { id:"passive_double_luck", type:"passive", name:"행운의 여신", icon:"🎲", rarity:"rare",      req:{luk:65},         scenario:null,       desc:"LUK 65 이상 — 모든 판정에서 주사위를 2번 굴려 유리한 쪽 선택.", condition:"always", conditionDesc:"항시 — 유리한 주사위 선택" },
  { id:"passive_silver_tongue",type:"passive",name:"은빛 혀",      icon:"🪙", rarity:"rare",      req:{spk:65},         scenario:null,       desc:"SPK 65 이상 — 화술 판정 시 주사위를 2번 굴려 유리한 쪽 선택.", condition:"spk_check",  conditionDesc:"화술 판정 시 유리한 주사위" },
  { id:"passive_deal_maker",  type:"passive", name:"계약의 달인", icon:"🤝", rarity:"rare",      req:{neg:65},         scenario:null,       desc:"NEG 65 이상 — 교섭·거래 판정 시 주사위를 2번 굴려 유리한 쪽 선택.", condition:"neg_check",  conditionDesc:"교섭 판정 시 유리한 주사위" },
  { id:"passive_calm_mind", type:"passive", name:"평심",         icon:"🌊",  rarity:"common",    req:{cal:40},         scenario:null,       desc:"감정 강도가 80 이상일 때 CAL +15 자동 발동.", condition:"high_emotion", conditionDesc:"감정 강도 80 이상", statBoost:{cal:120} },
  { id:"passive_dark_power",type:"passive", name:"어둠의 힘",    icon:"🖤",  rarity:"legendary", req:{mad:60},         scenario:null,       desc:"광기 60 이상일 때 MAD +10, MGC +15 자동 강화. 단, HP 최대치 감소.", condition:"high_mad",   conditionDesc:"광기 60 이상", statBoost:{mad:80,mgc:120} },
  { id:"passive_regen_plus",type:"passive", name:"생명력 넘침",  icon:"❤️",  rarity:"uncommon",  req:{regen:55},       scenario:null,       desc:"회복 주기가 5턴→3턴으로 단축된다.", condition:"always",      conditionDesc:"항시 발동" },

  // ── 이벤트 스킬 (특정 업적/조건 달성 시 해금) ──────────────
  { id:"event_dragon_aura", type:"event",   name:"용의 기운",    icon:"🐲",  rarity:"legendary", req:{},               scenario:"medieval", unlockTitle:"mf_dragon_blood", desc:"용의 피를 얻은 자만이 쓸 수 있는 위압적 기운. 적 사기를 대폭 저하.", aiHint:"용의 기운 발동! 강렬한 용의 위압감이 적들을 공포에 떨게 합니다.", mpCost:30 },
  { id:"event_holy_shield", type:"event",   name:"성광의 방패",  icon:"✨",  rarity:"legendary", req:{},               scenario:"medieval", unlockTitle:"mf_holy_light",   desc:"신의 선택을 받은 자의 보호막. 치명상을 1회 막는다.", aiHint:"성광의 방패 발동! 눈부신 빛의 방패가 치명타를 막아냈습니다.", mpCost:35 },
  { id:"event_dark_contract",type:"event",  name:"어둠의 계약",  icon:"🖤",  rarity:"legendary", req:{},               scenario:"medieval", unlockTitle:"mf_dark_pact",    desc:"어둠과 계약한 자의 힘. 강대한 어둠의 에너지를 폭발시킨다.", aiHint:"어둠의 계약 발동! 계약의 힘이 해방되며 강렬한 어둠이 용솟음칩니다.", mpCost:40 },
  { id:"event_karma_burst", type:"event",   name:"업보의 폭발",  icon:"⚖️",  rarity:"legendary", req:{},               scenario:null,       unlockTitle:"hidden_silence",   desc:"쌓인 업보의 무게를 폭발적인 힘으로 전환시킨다.", aiHint:"업보의 폭발! 선악의 업보가 거대한 에너지로 변환되어 터집니다.", mpCost:35 },
  { id:"event_soul_bond_skill",type:"event",name:"영혼 공명",   icon:"⛓️",  rarity:"legendary", req:{},               scenario:null,       unlockTitle:"soul_bond",        desc:"깊은 유대를 맺은 존재와 공명해 힘을 끌어올린다.", aiHint:"영혼 공명 발동! 유대의 힘이 공명하며 기적적인 강화가 일어납니다.", mpCost:25 },
  { id:"event_prophecy_power",type:"event", name:"예언의 힘",    icon:"🔮",  rarity:"legendary", req:{},               scenario:null,       unlockTitle:"prophecy",         desc:"예언의 주인공으로서 운명의 힘을 발현시킨다. LUK 최대화.", aiHint:"예언의 힘 발동! 운명이 이 존재를 선택했습니다. 기적이 일어납니다.", mpCost:20 },
  // ── 행동숙련 전용 패시브 스킬 (칭호 획득과 함께 자동 지급) ──
  { id:"event_haggle_master", type:"event", name:"시세 협상", icon:"🌾", rarity:"uncommon", req:{}, scenario:null, unlockTitle:"am_farmer_skilled", desc:"패시브: 작물 판매가가 항상 5% 더 높게 책정된다.", aiHint:"오랜 거래 경험으로 시세를 보는 눈이 날카롭다.", mpCost:0 },
  { id:"event_market_dominance", type:"event", name:"시장 지배", icon:"🌻", rarity:"rare", req:{}, scenario:null, unlockTitle:"am_farmer_master", desc:"패시브: 독점 시도 시 평판 손실이 절반으로 줄어든다.", aiHint:"이 사람의 말 한마디에 시장 시세가 흔들린다.", mpCost:0 },
  { id:"event_grave_robber_luck", type:"event", name:"도굴꾼의 감", icon:"⛏️", rarity:"uncommon", req:{}, scenario:null, unlockTitle:"am_tombraider_skilled", desc:"패시브: 도굴 발각 확률이 20% 감소한다.", aiHint:"위험을 감지하는 본능적인 감각이 발달했다.", mpCost:0 },
  { id:"event_soul_whisper", type:"event", name:"영혼의 속삭임", icon:"🕯️", rarity:"rare", req:{}, scenario:null, unlockTitle:"am_soulguide_skilled", desc:"패시브: 원혼 인도 성공률이 15%p 상승한다.", aiHint:"죽은 자들의 목소리가 유난히 또렷하게 들린다.", mpCost:0 },
  // ── 불멸의 노래 전용 스킬 — 「hq_immortal_song」 히든 퀘스트(음유시인 전용) 완료 시
  // grantTitle을 통해 자동 지급. 대장장이 태초 설계도의 대칭점으로, 환생해도
  // 사라지지 않는 영구 패시브다.
  { id:"event_truth_song", type:"event", name:"진실의 선율", icon:"🎶", rarity:"legendary", req:{}, scenario:null, unlockTitle:"song_truth_teller", desc:"패시브: NPC의 거짓말이나 숨긴 의도를 알아채는 직감이 크게 예리해진다. 협상·심문 판정 +12%.", aiHint:"진실의 선율이 마음속에 흐른다. 상대의 말 뒤에 숨은 진짜 의도가 어렴풋이 들여다보인다.", mpCost:0 },
  { id:"event_myth_song", type:"event", name:"신화의 선율", icon:"✨", rarity:"legendary", req:{}, scenario:null, unlockTitle:"song_myth_maker", desc:"패시브: 이 사람의 이야기를 들은 NPC는 쉽게 매혹되어 호감도 상승폭이 커진다. 설득·매혹 판정 +12%.", aiHint:"신화의 선율이 흘러나온다. 듣는 이의 마음이 이야기 속으로 자연스럽게 끌려든다.", mpCost:0 },
  { id:"event_finneagan_legacy", type:"event", name:"핀느간의 유산", icon:"🎼", rarity:"legendary", req:{}, scenario:null, unlockTitle:"song_finneagan_heir", desc:"패시브: 대륙 전역에 이름이 알려져, 낯선 지역의 첫 만남에서도 적대감이 한 단계 낮게 시작된다.", aiHint:"핀느간의 이름을 이어받은 이 사람의 노래는 낯선 땅에서도 먼저 도착해 있다. 초면의 NPC조차 어렴풋이 그 이름을 들어본 눈치를 보인다.", mpCost:0 },
  // ── 불사의 온기 전용 스킬 — 「hq_undying_warmth」 히든 퀘스트(치유사 전용) 완료 시
  // grantTitle을 통해 자동 지급. 대장장이 태초 설계도·음유시인 불멸의 노래와
  // 나란한 3번째 대칭점으로, 환생해도 사라지지 않는 영구 패시브다. 이 스킬의
  // 실제 확률 개입 로직은 party_incap 판정부(사망/부상 판정 직전)에 별도로
  // 연결되어 있다 — 여기서는 이벤트 스킬로 "보유 여부"만 등록한다.
  { id:"event_undying_warmth", type:"event", name:"불사의 온기", icon:"🕯️", rarity:"legendary", req:{}, scenario:null, unlockTitle:"healer_undying_warmth", desc:"패시브: 동료가 전투 중 사망하거나 부상 이탈할 위기에 처하면, 낮은 확률로 자동 개입해 목숨을 붙잡아낸다.", aiHint:"꺼져가려던 목숨 위로 따뜻한 기운이 스며든다. 셀레네에게 전수받은 손길이 저도 모르게 움직인다.", mpCost:0 },
  // ── 양날의 저울 전용 스킬 — 「hq_double_edged_scale」 히든 퀘스트(상인 전용)
  // 완료 시 grantTitle을 통해 자동 지급. 대장장이 태초 설계도·음유시인 불멸의
  // 노래·치유사 불사의 온기와 나란한 네 번째 대칭점으로, 환생해도 사라지지
  // 않는 영구 패시브다. merchant_crown의 "모든 것은 거래가 된다"는 철학을
  // 그대로 체화해, 거래·협상·정보 판정 전반에 보정을 준다.
  { id:"event_double_edged_scale", type:"event", name:"양날의 저울", icon:"⚖️", rarity:"legendary", req:{}, scenario:null, unlockTitle:"merchant_double_edged", desc:"패시브: 상대의 이해관계를 꿰뚫어보는 감각이 예리해진다. 거래·협상·정보 판정 +12%.", aiHint:"양날의 저울이 마음속에 자리잡았다. 상대가 무엇을 원하고 무엇을 두려워하는지 자연히 계산이 선다.", mpCost:0 },
  // ── 현자의 그림자 전용 스킬 — 「hq_sages_shadow」 히든 퀘스트(연금술사 전용)
  // 완료 시 grantTitle을 통해 자동 지급. 다섯 번째 대칭점으로, 환생해도
  // 사라지지 않는 영구 패시브다. 물질과 지식의 경계를 탐구한 대가로,
  // 연금 및 지적 판정 전반에 보정을 준다.
  { id:"event_sages_shadow", type:"event", name:"현자의 그림자", icon:"🌑", rarity:"legendary", req:{}, scenario:null, unlockTitle:"alchemist_sages_shadow", desc:"패시브: 물질의 본질을 꿰뚫어보는 통찰이 예리해진다. 연금·조사·지식 판정 +12%.", aiHint:"현자의 그림자가 사고 깊숙이 자리잡았다. 사물의 표면 아래 숨은 본질이 자연히 눈에 들어온다.", mpCost:0 },
  // ── 순환의 마지막 문 전용 스킬 — 「hq_final_door」 히든 퀘스트(묘지기 전용)
  // 완료 시 grantTitle을 통해 자동 지급. 여섯 번째이자 마지막 대칭점으로,
  // 환생해도 사라지지 않는 영구 패시브다. 삶과 죽음의 경계를 오래 지켜온
  // 대가로, 원혼·저주·죽음 관련 판정 전반에 보정을 준다.
  { id:"event_final_door", type:"event", name:"순환의 마지막 문", icon:"🕯️", rarity:"legendary", req:{}, scenario:null, unlockTitle:"gravekeeper_final_door", desc:"패시브: 원혼과 저주를 대하는 감각이 예리해진다. 영혼 인도·저주 저항·죽음 관련 판정 +12%.", aiHint:"순환의 마지막 문을 본 자의 눈빛이 깃든다. 산 자와 죽은 자의 경계에서도 흔들리지 않는다.", mpCost:0 },
  // ── 금서의 무게 전용 스킬 — 「hq_weight_of_forbidden_books」 히든 퀘스트
  // (학자 전용) 완료 시 grantTitle을 통해 자동 지급. 일곱 번째이자 마지막
  // 대칭점이며, 다른 여섯 개와 달리 이 퀘스트의 진짜 보상은 스탯이 아니라
  // "감시자의 영역"이 지도에 드러나는 것(진 엔딩 1차 관문)이다. 스탯 보너스는
  // 부수적으로 함께 지급되는 덤에 가깝다.
  { id:"event_weight_of_books", type:"event", name:"금서의 무게", icon:"📖", rarity:"legendary", req:{}, scenario:null, unlockTitle:"scholar_weight_of_books", desc:"패시브: 숨겨진 진실과 위화감을 알아채는 감각이 예리해진다. 조사·해독·통찰 판정 +12%.", aiHint:"금서의 무게가 사고 깊숙이 자리잡았다. 세상의 표면 아래 숨은 반복과 모순이 자연히 눈에 들어온다.", mpCost:0 },

  // ── 전사 계열 T2 파생 7종 전용 스킬 — 각 직업 히든 퀘스트 완료 시
  // grantTitle을 통해 자동 지급. 51개나 되는 전투직업 특성상 비전투
  // 직업급 강한 보너스(다중 스탯 +14~24)는 피하고, 단일 판정 영역에만
  // 소폭(+8%) 보정을 주는 절제된 패시브로 설계했다 — "수집하는 재미"에
  // 목적이 있지, 캐릭터 파워 인플레를 노리지 않는다.
  { id:"event_vow_weight", type:"event", name:"서약의 무게", icon:"⚔️✨", rarity:"rare", req:{}, scenario:null, unlockTitle:"paladin_vow_weight", desc:"패시브: 신념을 지키려는 의지가 깊어진다. 신앙 관련 판정 +8%.", aiHint:"서약의 무게가 마음에 새겨졌다. 신념과 실전 사이의 갈등을 겪어본 자만이 아는 흔들리지 않는 축.", mpCost:0 },
  { id:"event_unbroken_memory", type:"event", name:"끊기지 않는 기억", icon:"🔥⚔️", rarity:"rare", req:{}, scenario:null, unlockTitle:"berserker_unbroken_memory", desc:"패시브: 분노 속에서도 자신을 잃지 않는 감각이 예리해진다. 분노·전투 관련 판정 +8%.", aiHint:"끊기지 않는 기억이 몸에 새겨졌다. 힘에 삼켜지지 않고 다스리는 법을 안다.", mpCost:0 },
  { id:"event_way_of_sword", type:"event", name:"검을 뽑지 않고 이기는 법", icon:"🗡️⚡", rarity:"rare", req:{}, scenario:null, unlockTitle:"swordmaster_way_of_sword", desc:"패시브: 검의 극의에 다가서는 감각이 예리해진다. 검술·회피 관련 판정 +8%.", aiHint:"검을 뽑지 않고 이기는 법을 어렴풋이 깨우쳤다. 고요함 속에서 승부가 이미 정해져 있다.", mpCost:0 },
  { id:"event_road_back_alive", type:"event", name:"살아 돌아오는 길", icon:"🏰⚔️", rarity:"rare", req:{}, scenario:null, unlockTitle:"warlord_road_back_alive", desc:"패시브: 병력을 이끄는 판단력이 예리해진다. 지휘·통솔 관련 판정 +8%.", aiHint:"살아 돌아오는 길을 아는 지휘관의 무게가 몸에 배었다. 승리보다 무거운 책임을 잊지 않는다.", mpCost:0 },
  { id:"event_between_worlds", type:"event", name:"경계에 선 자", icon:"🐉⚔️", rarity:"rare", req:{}, scenario:null, unlockTitle:"dragoon_between_worlds", desc:"패시브: 용의 기운이 몸에 옅게 흐른다. 용족 관련·화염 저항 판정 +8%.", aiHint:"경계에 선 자의 기운이 느껴진다. 인간도 용도 아닌 존재로서 얻은 감각.", mpCost:0 },
  { id:"event_cannot_save_all", type:"event", name:"모두를 지킬 수 없어도", icon:"🛡️⚔️", rarity:"rare", req:{}, scenario:null, unlockTitle:"guardian_cannot_save_all", desc:"패시브: 한계를 받아들이면서도 굳건히 버티는 감각이 예리해진다. 방어·보호 관련 판정 +8%.", aiHint:"모두를 지킬 수 없다는 걸 받아들인 자의 굳건함이 느껴진다.", mpCost:0 },
  { id:"event_names_in_sand", type:"event", name:"모래 위의 이름들", icon:"🥊⚔️", rarity:"rare", req:{}, scenario:null, unlockTitle:"gladiator_names_in_sand", desc:"패시브: 맨몸으로 부딪히는 감각이 예리해진다. 맨손 격투 관련 판정 +8%.", aiHint:"모래 위에 새겨진 이름들을 기억하는 자의 무게가 느껴진다.", mpCost:0 },

  // ── 마법사 계열 T2 파생 7종 전용 스킬 — 전사 계열과 동일하게 절제된
  // 단일 판정 패시브(+8%)로 설계했다.
  { id:"event_uncorrupted_edge", type:"event", name:"삼켜지지 않는 경계", icon:"💀🔮", rarity:"rare", req:{}, scenario:null, unlockTitle:"warlock_uncorrupted_edge", desc:"패시브: 금지된 힘 앞에서도 자신을 지키는 감각이 예리해진다. 저주·금지 마법 관련 판정 +8%.", aiHint:"삼켜지지 않는 경계가 마음에 새겨졌다. 금지된 힘을 다루면서도 자신을 잃지 않는 법을 안다.", mpCost:0 },
  { id:"event_knowing_unknowing", type:"event", name:"알수록 모른다는 것", icon:"📚🔮", rarity:"rare", req:{}, scenario:null, unlockTitle:"sage_knowing_unknowing", desc:"패시브: 지식의 겸손함이 오히려 통찰을 예리하게 한다. 지식·분석 관련 판정 +8%.", aiHint:"알수록 모른다는 것을 아는 자의 겸손함이 느껴진다.", mpCost:0 },
  { id:"event_called_or_pulled", type:"event", name:"불려오는 자, 끌려가는 자", icon:"🌀🔮", rarity:"rare", req:{}, scenario:null, unlockTitle:"summoner_called_or_pulled", desc:"패시브: 경계를 넘나드는 감각이 예리해진다. 소환 관련 판정 +8%.", aiHint:"두 세계 사이에 걸린 감각이 느껴진다.", mpCost:0 },
  { id:"event_moment_undone", type:"event", name:"되돌릴 수 없는 순간", icon:"⏳🔮", rarity:"rare", req:{}, scenario:null, unlockTitle:"chronomancer_moment_undone", desc:"패시브: 시간의 흐름을 읽는 감각이 예리해진다. 시공 관련 판정 +8%.", aiHint:"되돌릴 수 없는 순간을 기억하는 자의 무게가 느껴진다.", mpCost:0 },
  { id:"event_perfect_balance", type:"event", name:"어느 하나에도 치우치지 않고", icon:"🌊🔮", rarity:"rare", req:{}, scenario:null, unlockTitle:"elementalist_perfect_balance", desc:"패시브: 네 원소의 균형을 다루는 감각이 예리해진다. 원소 마법 관련 판정 +8%.", aiHint:"균형을 잃지 않는 자의 안정감이 느껴진다.", mpCost:0 },
  { id:"event_mirror_of_calamos", type:"event", name:"칼라모스라는 거울", icon:"💀🌑", rarity:"rare", req:{}, scenario:null, unlockTitle:"necromancer_mirror_of_calamos", desc:"패시브: 죽음의 경계를 다루는 감각이 예리해진다. 죽음·언데드 관련 판정 +8%.", aiHint:"죽음을 두려워하지 않는 자의 서늘한 침착함이 느껴진다.", mpCost:0 },
  { id:"event_no_perfect_ward", type:"event", name:"뚫리지 않는 선은 없다", icon:"🔯🔮", rarity:"rare", req:{}, scenario:null, unlockTitle:"enchanter_no_perfect_ward", desc:"패시브: 완벽하지 않아도 최선을 다하는 결계의 감각이 예리해진다. 결계·방어 마법 관련 판정 +8%.", aiHint:"완벽할 수 없음을 받아들인 자의 단단함이 느껴진다.", mpCost:0 },

  // ── 도적 계열 T2 파생 7종 전용 스킬 — 절제된 단일 판정 패시브(+8%).
  { id:"event_nameless_name", type:"event", name:"이름 없는 자의 이름", icon:"🎯🗡️", rarity:"rare", req:{}, scenario:null, unlockTitle:"assassin_nameless_name", desc:"패시브: 존재를 지우는 감각이 예리해진다. 은신·암살 관련 판정 +8%.", aiHint:"이름 없는 자의 고요함이 몸에 배었다.", mpCost:0 },
  { id:"event_price_of_freedom", type:"event", name:"자유의 대가", icon:"🏴‍☠️🗡️", rarity:"rare", req:{}, scenario:null, unlockTitle:"pirate_price_of_freedom", desc:"패시브: 자유를 대가로 얻은 자의 결단력이 예리해진다. 항해·약탈 관련 판정 +8%.", aiHint:"자유의 무게를 아는 자의 대담함이 느껴진다.", mpCost:0 },
  { id:"event_flow_like_water", type:"event", name:"물처럼 흘러", icon:"🥷🗡️", rarity:"rare", req:{}, scenario:null, unlockTitle:"ninja_flow_like_water", desc:"패시브: 흔적을 남기지 않는 감각이 예리해진다. 은신·순보 관련 판정 +8%.", aiHint:"물처럼 흐르는 자의 고요함이 느껴진다.", mpCost:0 },
  { id:"event_kill_or_cure", type:"event", name:"죽이는 약, 살리는 약", icon:"🐍🗡️", rarity:"rare", req:{}, scenario:null, unlockTitle:"poisoner_kill_or_cure", desc:"패시브: 독과 해독의 경계를 다루는 감각이 예리해진다. 독 관련 판정 +8%.", aiHint:"경계 위에 선 자의 침착함이 느껴진다.", mpCost:0 },
  { id:"event_wisdom_of_return", type:"event", name:"살아 돌아오는 지혜", icon:"💲🗡️", rarity:"rare", req:{}, scenario:null, unlockTitle:"bounty_hunter_wisdom_of_return", desc:"패시브: 신중한 판단력이 예리해진다. 추적 관련 판정 +8%.", aiHint:"살아 돌아오는 법을 아는 자의 신중함이 느껴진다.", mpCost:0 },
  { id:"event_three_layers", type:"event", name:"세 겹의 신분", icon:"🕵️🗡️", rarity:"rare", req:{}, scenario:null, unlockTitle:"spy_three_layers", desc:"패시브: 위장 속에서도 흔들리지 않는 감각이 예리해진다. 위장·잠입 관련 판정 +8%.", aiHint:"여러 얼굴 속에서도 흔들리지 않는 중심이 느껴진다.", mpCost:0 },
  { id:"event_endless_game", type:"event", name:"끝나지 않는 판", icon:"🎲🗡️", rarity:"rare", req:{}, scenario:null, unlockTitle:"gambler_endless_game", desc:"패시브: 확률을 무시할 수 있는 대담함이 예리해진다. 도박·확률 관련 판정 +8%.", aiHint:"전부를 걸어본 자의 대담함이 느껴진다.", mpCost:0 },

  // ── 궁수 계열 T2 파생 5종 전용 스킬 — 절제된 단일 판정 패시브(+8%).
  { id:"event_shot_that_changed", type:"event", name:"전장을 바꾼 한 발", icon:"🎯🏹", rarity:"rare", req:{}, scenario:null, unlockTitle:"sniper_shot_that_changed", desc:"패시브: 극도의 집중력이 예리해진다. 저격·정밀 사격 관련 판정 +8%.", aiHint:"단 한 발로 흐름을 바꿔본 자의 집중력이 느껴진다.", mpCost:0 },
  { id:"event_forest_remembers", type:"event", name:"숲이 기억하는 이름", icon:"🌲🏹", rarity:"rare", req:{}, scenario:null, unlockTitle:"ranger_forest_remembers", desc:"패시브: 자연을 읽는 감각이 예리해진다. 자연·정찰 관련 판정 +8%.", aiHint:"숲의 언어를 아는 자의 감각이 느껴진다.", mpCost:0 },
  { id:"event_stranger_of_two", type:"event", name:"두 세계의 이방인", icon:"✨🏹", rarity:"rare", req:{}, scenario:null, unlockTitle:"magic_archer_stranger_of_two", desc:"패시브: 활과 마법을 오가는 감각이 예리해진다. 원소 사격 관련 판정 +8%.", aiHint:"두 세계의 경계에 선 자의 유연함이 느껴진다.", mpCost:0 },
  { id:"event_forbidden_practical", type:"event", name:"금지와 실용 사이", icon:"🔩🏹", rarity:"rare", req:{}, scenario:null, unlockTitle:"crossbow_master_forbidden_practical", desc:"패시브: 관통력을 다루는 감각이 예리해진다. 석궁·관통 사격 관련 판정 +8%.", aiHint:"금지당할 뻔한 기술을 지켜낸 장인의 고집이 느껴진다.", mpCost:0 },
  { id:"event_day_wind_blows", type:"event", name:"바람이 부는 날", icon:"🌬️🏹", rarity:"rare", req:{}, scenario:null, unlockTitle:"wind_archer_day_wind_blows", desc:"패시브: 바람을 읽는 감각이 예리해진다. 바람·연속 사격 관련 판정 +8%.", aiHint:"바람이 부는 날이면 유독 컨디션이 좋아지는 자의 감각이 느껴진다.", mpCost:0 },

  // ── 성직자 계열 T2 파생 5종 전용 스킬 — 절제된 단일 판정 패시브(+8%).
  { id:"event_gods_tool_my_face", type:"event", name:"신의 도구, 나의 얼굴", icon:"✝️👑", rarity:"rare", req:{}, scenario:null, unlockTitle:"archbishop_gods_tool_my_face", desc:"패시브: 신성한 권위와 자기 자신 사이의 균형이 예리해진다. 신성·치유 관련 판정 +8%.", aiHint:"신의 도구이면서도 자신을 잃지 않는 자의 위엄이 느껴진다.", mpCost:0 },
  { id:"event_faith_that_wavered", type:"event", name:"흔들렸던 신앙", icon:"⚔️✝️", rarity:"rare", req:{}, scenario:null, unlockTitle:"crusader_faith_that_wavered", desc:"패시브: 회의를 딛고 단단해진 신앙이 예리해진다. 성전·전투 신앙 관련 판정 +8%.", aiHint:"한 번 흔들렸기에 더 단단해진 신념이 느껴진다.", mpCost:0 },
  { id:"event_things_unforgotten", type:"event", name:"잊히지 않는 것들", icon:"🔱✝️", rarity:"rare", req:{}, scenario:null, unlockTitle:"exorcist_things_unforgotten", desc:"패시브: 어둠 속에서도 깨어있는 감각이 예리해진다. 퇴마·봉인 관련 판정 +8%.", aiHint:"무거운 기억을 안고도 계속 걸어가는 자의 결의가 느껴진다.", mpCost:0 },
  { id:"event_cruelty_of_knowing", type:"event", name:"막을 수 없는 것을 아는 잔인함", icon:"🔮✝️", rarity:"rare", req:{}, scenario:null, unlockTitle:"oracle_cruelty_of_knowing", desc:"패시브: 운명을 읽는 감각이 예리해진다. 예지·운명 관련 판정 +8%.", aiHint:"먼 곳을 보는 눈의 무게가 느껴진다.", mpCost:0 },
  { id:"event_the_other_voice", type:"event", name:"다른 목소리", icon:"💀✝️", rarity:"rare", req:{}, scenario:null, unlockTitle:"dark_priest_the_other_voice", desc:"패시브: 금지된 성스러운 힘을 다루는 감각이 예리해진다. 금지된 신성·저주 관련 판정 +8%.", aiHint:"다른 신을 선택한 자의 서늘한 확신이 느껴진다.", mpCost:0 },

  // ── 사냥꾼 전용 스킬 — 「hq_hunter_becoming_wild」 히든 퀘스트 완료 시
  // grantTitle을 통해 자동 지급. 다른 T2 전투직 26종보다 실용적인 보상
  // (사냥·추적 판정 보정 + 부산물 손질 시 추가 획득 확률 상승)으로 설계했다
  // — 전용 원정 시스템(사냥터)을 실제로 만든 유일한 T2 전투직이기 때문.
  { id:"event_becoming_wild", type:"event", name:"야생을 닮아가는 것", icon:"🐾", rarity:"legendary", req:{}, scenario:null, unlockTitle:"hunter_becoming_wild", desc:"패시브: 야생과 문명의 경계를 넘나드는 감각이 예리해진다. 사냥·추적 판정 +12%. 부산물 손질 시 추가 재료 획득 확률 상승.", aiHint:"야생을 닮아가면서도 사람으로 남아있는 자의 균형이 느껴진다.", mpCost:0 },

  // ── 야수의 왕 전용 스킬 — 「hq_hunter_king_of_beasts」 히든 퀘스트
  // (전설급 조련 성공) 완료 시 grantTitle을 통해 자동 지급.
  { id:"event_king_of_beasts", type:"event", name:"야수의 왕", icon:"👑🐾", rarity:"legendary", req:{}, scenario:null, unlockTitle:"hunter_king_of_beasts", desc:"패시브: 야수와의 유대를 다루는 감각이 예리해진다. 조련 성공률 영구 상승, 야수 동료의 관계 상승 속도 증가.", aiHint:"전설급 야수마저 인정한 자의 위엄이 느껴진다.", mpCost:0 },

  // ── 대륙 전용 직업 8종 전용 스킬 — 절제된 단일 판정 패시브(+8%).
  { id:"event_beneath_the_frost", type:"event", name:"만년설 아래 흐르는 것", icon:"🧊", rarity:"rare", req:{}, scenario:null, unlockTitle:"ice_knight_beneath_the_frost", desc:"패시브: 냉기와 방어의 감각이 예리해진다. 냉기·방어 관련 판정 +8%.", aiHint:"오래된 죄책감을 딛고 선 자의 강인함이 느껴진다.", mpCost:0 },
  { id:"event_path_forsaken", type:"event", name:"포기했던 길", icon:"🔷", rarity:"rare", req:{}, scenario:null, unlockTitle:"rune_warrior_path_forsaken", desc:"패시브: 고대 룬을 읽는 감각이 예리해진다. 룬·고대 문자 관련 판정 +8%.", aiHint:"포기했던 길을 대신 걷는 자에 대한 존중이 느껴진다.", mpCost:0 },
  { id:"event_not_to_win", type:"event", name:"이기기 위한 검이 아니다", icon:"⚔️", rarity:"rare", req:{}, scenario:null, unlockTitle:"sword_emperor_not_to_win", desc:"패시브: 검의 극의를 향한 감각이 예리해진다. 검술·극의 관련 판정 +8%.", aiHint:"이기지 않고도 이기는 법을 아는 자의 여유가 느껴진다.", mpCost:0 },
  { id:"event_dragon_qi_heart", type:"event", name:"용의 기운, 다루는 자의 마음", icon:"🏯", rarity:"rare", req:{}, scenario:null, unlockTitle:"imperial_sorcerer_dragon_qi_heart", desc:"패시브: 용의 기운을 다루는 감각이 예리해진다. 용기(龍氣)·내단 관련 판정 +8%.", aiHint:"위험한 힘 앞에서도 흔들리지 않는 마음가짐이 느껴진다.", mpCost:0 },
  { id:"event_heart_behind_tongue", type:"event", name:"황금 혀 뒤의 진심", icon:"🤖", rarity:"rare", req:{}, scenario:null, unlockTitle:"steam_knight_heart_behind_tongue", desc:"패시브: 정치와 진심 사이의 균형 감각이 예리해진다. 증기 기갑·돌격 관련 판정 +8%.", aiHint:"화려한 언변 뒤에 숨긴 진심이 느껴진다.", mpCost:0 },
  { id:"event_strength_of_machine", type:"event", name:"기계로 만드는 강함", icon:"🎭", rarity:"rare", req:{}, scenario:null, unlockTitle:"automaton_master_strength_of_machine", desc:"패시브: 기계를 다루는 감각이 예리해진다. 자동인형·기계 조종 관련 판정 +8%.", aiHint:"마법 없이도 강한 자의 신념이 느껴진다.", mpCost:0 },
  { id:"event_standing_without_light", type:"event", name:"빛에 기대지 않고 서는 법", icon:"☀️", rarity:"rare", req:{}, scenario:null, unlockTitle:"sun_priest_standing_without_light", desc:"패시브: 태양의 힘을 다루는 감각이 예리해진다. 태양·치유 관련 판정 +8%.", aiHint:"권위에 기대지 않고도 굳건한 자의 태도가 느껴진다.", mpCost:0 },
  { id:"event_truth_even_if_unfavorable", type:"event", name:"불리해도 진실이라면", icon:"🗿", rarity:"rare", req:{}, scenario:null, unlockTitle:"ancient_seeker_truth_even_if_unfavorable", desc:"패시브: 고대 유적을 해독하는 감각이 예리해진다. 유적 해독·고대 지식 관련 판정 +8%.", aiHint:"불리한 진실도 마주할 준비가 된 자의 결기가 느껴진다.", mpCost:0 },
  { id:"event_unshared_weight", type:"event", name:"나눠지지 않은 무게", icon:"🌟", rarity:"rare", req:{}, scenario:null, unlockTitle:"starlight_archer_unshared_weight", desc:"패시브: 별빛을 다루는 감각이 예리해진다. 별빛·정밀 사격 관련 판정 +8%.", aiHint:"묵인해온 무게를 알아챈 자의 섬세함이 느껴진다.", mpCost:0 },
  { id:"event_shared_at_last", type:"event", name:"나눠지지 않은 무게, 두 번째", icon:"🌳", rarity:"rare", req:{}, scenario:null, unlockTitle:"world_tree_keeper_shared_at_last", desc:"패시브: 세계수의 기운을 다루는 감각이 예리해진다. 세계수·봉인 감지 관련 판정 +8%.", aiHint:"마침내 함께 짊어진 무게의 안정감이 느껴진다.", mpCost:0 },
  { id:"event_fear_to_the_sea", type:"event", name:"두려움을 안고 바다로", icon:"🏴‍☠️", rarity:"rare", req:{}, scenario:null, unlockTitle:"storm_pirate_fear_to_the_sea", desc:"패시브: 폭풍 속에서도 나아가는 감각이 예리해진다. 항해·약탈 관련 판정 +8%.", aiHint:"두려움을 안고도 바다로 나가는 자의 용기가 느껴진다.", mpCost:0 },
  { id:"event_share_masters_fear", type:"event", name:"스승의 두려움을 나눠 짊어지다", icon:"🌊", rarity:"rare", req:{}, scenario:null, unlockTitle:"tide_sorcerer_share_masters_fear", desc:"패시브: 조류와 폭풍을 다루는 감각이 예리해진다. 조류·폭풍 마법 관련 판정 +8%.", aiHint:"스승의 짐을 나눠 짊어진 제자의 성숙함이 느껴진다.", mpCost:0 },
  { id:"event_more_than_a_symbol", type:"event", name:"상징 이상의 존재", icon:"⚒️", rarity:"rare", req:{}, scenario:null, unlockTitle:"runesmith_more_than_a_symbol", desc:"패시브: 룬스미싱의 감각이 예리해진다. 룬스미싱·단조 관련 판정 +8%.", aiHint:"상징을 넘어선 실질적 가치를 지닌 자의 무게가 느껴진다.", mpCost:0 },
  { id:"event_what_machines_protected", type:"event", name:"기계가 지키려 한 것", icon:"⚙️", rarity:"rare", req:{}, scenario:null, unlockTitle:"golem_engineer_what_machines_protected", desc:"패시브: 고대 기계를 다루는 감각이 예리해진다. 골렘·고대 기계 관련 판정 +8%.", aiHint:"기계가 지키려 했던 것의 무게를 아는 자의 진지함이 느껴진다.", mpCost:0 },

  // ── 종족 12종 전용 스킬 — 각 종족 히든 퀘스트 완료 시 grantTitle을
  // 통해 자동 지급. 절제된 단일 판정 패시브(+8%)로 설계했다.
  { id:"event_same_mistake_twice", type:"event", name:"같은 실수를 두 번", icon:"📖", rarity:"rare", req:{}, scenario:null, unlockTitle:"human_same_mistake_twice", desc:"패시브: 배움과 적응의 감각이 예리해진다. 적응·학습 관련 판정 +8%.", aiHint:"같은 실수를 반복하지 않는 자의 성숙함이 느껴진다.", mpCost:0 },
  { id:"event_will_of_the_flame", type:"event", name:"불꽃을 쥔 자의 의지", icon:"🐉", rarity:"rare", req:{}, scenario:null, unlockTitle:"dragon_will_of_the_flame", desc:"패시브: 냉정함을 지키는 감각이 예리해진다. 화염·냉정 관련 판정 +8%.", aiHint:"불꽃을 쥐고도 흔들리지 않는 자의 의지가 느껴진다.", mpCost:0 },
  { id:"event_names_unforgotten", type:"event", name:"잊히지 않는 이름", icon:"🌳", rarity:"rare", req:{}, scenario:null, unlockTitle:"elf_names_unforgotten", desc:"패시브: 기억을 지키는 감각이 예리해진다. 마법·기억 관련 판정 +8%.", aiHint:"잊지 않으려는 자의 깊은 다짐이 느껴진다.", mpCost:0 },
  { id:"event_the_unfinished", type:"event", name:"완성되지 않은 것", icon:"⛏️", rarity:"rare", req:{}, scenario:null, unlockTitle:"dwarf_the_unfinished", desc:"패시브: 끝까지 완성하는 감각이 예리해진다. 제작·인내 관련 판정 +8%.", aiHint:"포기하지 않는 자의 단단함이 느껴진다.", mpCost:0 },
  { id:"event_kept_beyond_death", type:"event", name:"죽어서도 지키는 것", icon:"🪓", rarity:"rare", req:{}, scenario:null, unlockTitle:"orc_kept_beyond_death", desc:"패시브: 맹세를 지키는 감각이 예리해진다. 맹세·전투 관련 판정 +8%.", aiHint:"죽어서도 지킬 맹세를 가진 자의 무게가 느껴진다.", mpCost:0 },
  { id:"event_light_or_enemy", type:"event", name:"빛의 종인가, 빛의 적인가", icon:"🌑", rarity:"rare", req:{}, scenario:null, unlockTitle:"darkling_light_or_enemy", desc:"패시브: 어둠을 다루는 감각이 예리해진다. 저주·그림자 관련 판정 +8%.", aiHint:"공포를 함부로 쓰지 않는 자의 절제가 느껴진다.", mpCost:0 },
  { id:"event_missionless_one", type:"event", name:"사명 없는 자", icon:"✨", rarity:"rare", req:{}, scenario:null, unlockTitle:"celestial_missionless_one", desc:"패시브: 신성한 힘을 다루는 감각이 예리해진다. 신성·치유 관련 판정 +8%.", aiHint:"주어지지 않은 사명을 스스로 찾은 자의 진실함이 느껴진다.", mpCost:0 },
  { id:"event_upon_my_name", type:"event", name:"이름을 걸고", icon:"👹", rarity:"rare", req:{}, scenario:null, unlockTitle:"demon_upon_my_name", desc:"패시브: 계약을 다루는 감각이 예리해진다. 계약·협상 관련 판정 +8%.", aiHint:"이름을 걸고 맹세를 지키는 자의 신뢰감이 느껴진다.", mpCost:0 },
  { id:"event_second_death_earned", type:"event", name:"두 번째 죽음을 쟁취하는 법", icon:"💀", rarity:"rare", req:{}, scenario:null, unlockTitle:"undead_second_death_earned", desc:"패시브: 죽음의 경계를 다루는 감각이 예리해진다. 죽음·저주 관련 판정 +8%.", aiHint:"빚을 늘리지 않는 자의 담담함이 느껴진다.", mpCost:0 },
  { id:"event_hunt_with_honor", type:"event", name:"사냥하지 않는 용기", icon:"🐺", rarity:"rare", req:{}, scenario:null, unlockTitle:"beastman_hunt_with_honor", desc:"패시브: 본능을 다스리는 감각이 예리해진다. 야생·본능 관련 판정 +8%.", aiHint:"강함을 함부로 증명하지 않는 자의 자부심이 느껴진다.", mpCost:0 },
  { id:"event_not_for_destruction", type:"event", name:"파괴가 아닌 것", icon:"🔥", rarity:"rare", req:{}, scenario:null, unlockTitle:"elemental_not_for_destruction", desc:"패시브: 원소를 다루는 감각이 예리해진다. 원소·공명 관련 판정 +8%.", aiHint:"원소를 파괴에만 쓰지 않는 자의 균형이 느껴진다.", mpCost:0 },
  { id:"event_history_not_denied", type:"event", name:"역사를 부정하지 않는 법", icon:"🦇", rarity:"rare", req:{}, scenario:null, unlockTitle:"vampire_history_not_denied", desc:"패시브: 자신의 과거를 다루는 감각이 예리해진다. 매혹·권속 관련 판정 +8%.", aiHint:"자신의 역사를 부정하지 않는 자의 깊이가 느껴진다.", mpCost:0 },
];

export const SKILL_TREE = {
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
