// block7-preamble — data
// Pure data split out of misc/292-block7-preamble.js (see generate.js).

export const CONTINENT_CURRENCY = {
  central:   { name:'왕국 금화',     icon:'🪙', unit:'금화',    exchangeRate:1.0  },
  north:     { name:'얼음 은화',     icon:'❄️', unit:'은화',    exchangeRate:0.85 }, // 타 대륙에서 환율 손해
  east:      { name:'황금 용전',     icon:'🐉', unit:'용전',    exchangeRate:1.15 }, // 희소성으로 약간 이득
  west:      { name:'증기 주화',     icon:'⚙️', unit:'주화',    exchangeRate:0.9  },
  south:     { name:'신전 코인',     icon:'☀️', unit:'코인',    exchangeRate:0.95 },
  northeast: { name:'별빛 수정화',   icon:'🌿', unit:'수정화',  exchangeRate:1.2  }, // 엘프 달빛 숲 — 희귀 마법 재료로 만들어 타 대륙에서 프리미엄
  southeast: { name:'군도 약탈전',   icon:'🏴‍☠️', unit:'약탈전',  exchangeRate:0.8  }, // 해적 군도 — 위조·약탈품 혼재, 신뢰도 낮아 환율 손해
  northwest: { name:'루네스톤 주화', icon:'⛏️', unit:'루네화',  exchangeRate:1.1  }, // 드워프 지하왕국 — 정제 금속 보증, 안정적 가치
};

export const CONTINENT_TABOOS = {
  north: [
    { pattern:/도망|달아|퇴각|포기|항복/, label:'북방 불명예 — 전장 이탈', repDelta:-8, aiHint:'북방에서 도주는 극도의 치욕이다. 주변 전사들의 눈빛이 싸늘해진다.' },
    { pattern:/비겁|겁쟁이|피해/, label:'북방 용기 의심', repDelta:-5, aiHint:'북방인은 두려움을 입 밖에 내지 않는다.' },
  ],
  east: [
    { pattern:/황제|황실|용제.*비판|비난.*황|황.*욕/, label:'동방 황실 모독', repDelta:-15, aiHint:'황실 비판은 반역죄. 주변 인물들이 경계심을 드러낸다.' },
    { pattern:/무림.*무시|고수.*업신|약자.*깔/, label:'동방 무림 예의 위반', repDelta:-8, aiHint:'강호에서 무례함은 목숨을 건 결투로 이어질 수 있다.' },
  ],
  west: [
    { pattern:/마법.*시전|주문.*외우|마력.*발동/, label:'서방 마법 의심', repDelta:-6, aiHint:'서대륙에서 마법 사용자는 잠재적 위협으로 여겨진다. 경비들의 눈이 날카로워진다.' },
    { pattern:/기계.*파괴|자동인형.*부수|증기.*고장/, label:'서방 기계 파손죄', repDelta:-12, aiHint:'서대륙에서 기계 파손은 중범죄다. 기술자들이 적대적으로 반응한다.' },
  ],
  south: [
    { pattern:/유물.*훔|유물.*빼앗|신전.*약탈|고대.*약탈/, label:'남방 성물 약탈', repDelta:-20, aiHint:'고대 신전의 유물을 무단 반출하려 한다. 신전 수호자들이 즉각 출동할 것이다.' },
    { pattern:/정글.*불|밀림.*태우|나무.*베/, label:'남방 자연 훼손', repDelta:-10, aiHint:'자연 숭배 문화권에서 밀림 훼손은 신성 모독이나 다름없다.' },
  ],
  central: [
    { pattern:/반역|왕국.*전복|국왕.*암살/, label:'중앙 반역죄', repDelta:-25, aiHint:'왕국의 심장부에서 반역 의도가 감지됐다. 정보국이 움직이기 시작한다.' },
  ],
  northeast: [
    { pattern:/세계수.*베|나무.*베|숲.*태우|자연.*파괴|고목.*훼손/, label:'달빛 숲 신성 훼손', repDelta:-30, aiHint:'세계수의 후손인 고목을 해친다는 것은 엘프 전체에 대한 선전포고다. 달빛 근위대가 즉각 반응한다.' },
    { pattern:/엘프.*경멸|엘프.*얕|장수.*비웃|예언.*거짓/, label:'엘프 문화 모독', repDelta:-15, aiHint:'수천 년의 역사를 가진 엘프 앞에서 그들의 문화를 무시했다. 주변 엘프들의 눈이 싸늘하게 가라앉는다.' },
  ],
  southeast: [
    { pattern:/계약.*어기|약속.*파기|거래.*배신/, label:'군도 계약 파기', repDelta:-20, aiHint:'해적 군도에서 계약 파기는 목숨을 건 결투를 의미한다. 해적 명예 규약이 발동됐다.' },
    { pattern:/해구.*뛰어들|심연.*가겠|테네브라.*탐험/, label:'봉인의 심연 도발', repDelta:-8, aiHint:'테네브라 해구에 스스로 들어가겠다는 말에 경험 많은 선원들의 얼굴이 굳는다. 그곳으로 간 자는 돌아오지 않는다.' },
  ],
  northwest: [
    { pattern:/기계.*부수|골렘.*파괴|장치.*고장.*내|자동.*기계.*망가/, label:'드워프 기계 파손', repDelta:-25, aiHint:'드워프에게 장인이 만든 기계를 부수는 것은 선조를 모욕하는 행위다. 씨족 전체의 원한을 살 수 있다.' },
    { pattern:/미완성.*버려|작업.*포기|계약.*중도/, label:'드워프 작업 포기 금기', repDelta:-12, aiHint:'드워프 문화에서 미완성 작업을 포기하는 것은 극도의 수치다. 함께 일하던 드워프들이 경멸의 눈빛을 보낸다.' },
  ],
};

export const CONTINENT_DEFAULT_WEATHER = {
  central:   { weather:'clear',    timeOfDay:'morning' },
  north:     { weather:'snow',     timeOfDay:'dawn'    },
  east:      { weather:'none',     timeOfDay:'morning' },
  west:      { weather:'fog',      timeOfDay:'morning' },
  south:     { weather:'scorching',timeOfDay:'midday'  },
  northeast: { weather:'none',     timeOfDay:'night'   }, // 달빛 숲 — 별빛이 가장 아름다운 밤 분위기
  southeast: { weather:'storm',    timeOfDay:'morning' }, // 해적 군도 — 폭풍이 잦은 바다
  northwest: { weather:'fog',      timeOfDay:'dawn'    }, // 드워프 지하왕국 — 지상은 안개 낀 암석 고원
};

export const CONTINENT_EXCLUSIVE_JOBS = {
  north: [
    { id:'ice_knight',      name:'빙설 기사',      icon:'🧊', tier:2, parentId:'warrior',
      desc:'북방의 혹한 속에서 단련된 기사. 얼음 마법과 검술을 융합한다.',
      lore:'수백 년 전 북방 야만족과의 전쟁에서 탄생한 직업. 극야의 어둠 속에서 싸우는 법을 안다.',
      howToGet:'북대륙 출신이거나 북방 기사단 훈련소 방문 + 체력 60 이상',
      requiredContinent:'north', unlockCondition:{ minEnd:60, requiredContinent:'north' },
      statFocus:['str','end'], skills:[
        { id:'skill_frost_slash', name:'서리 참격', icon:'❄️', type:'active', mpCost:18, desc:'칼날에 빙결 마력을 담아 적을 베며 동결시킨다.' },
        { id:'skill_glacier_shield', name:'빙벽 방패', icon:'🛡️', type:'passive', mpCost:0, desc:'END +10. 냉기 피해 30% 감소.' },
        { id:'skill_absolute_zero', name:'절대영도', icon:'🥶', type:'active', mpCost:32, desc:'[서리 참격 선행] 광역 빙결. 적 전체 3턴간 행동속도 절반.', prereq:'skill_frost_slash' },
        { id:'skill_permafrost', name:'영구동토', icon:'🧊', type:'passive', mpCost:0, desc:'[빙벽 방패 선행] END+12. 냉기 지형에서 모든 판정+15%.', prereq:'skill_glacier_shield' },
      ]},
    { id:'rune_warrior',    name:'룬 전사',        icon:'🔷', tier:2, parentId:'warrior',
      desc:'북방 고대 룬 문자의 힘을 몸에 새겨 싸우는 전사.',
      lore:'빙하 속 고대 석판에 새겨진 룬을 해독한 북방 현자들이 전수하는 비전 전투술.',
      howToGet:'북대륙 출신 + 고대 룬 비전서 획득 + 의지 55 이상',
      requiredContinent:'north', unlockCondition:{ minWil:55, requiredContinent:'north', requireItem:'고대 룬 비전서' },
      statFocus:['str','wil'], skills:[
        { id:'skill_rune_burst', name:'룬 폭발', icon:'🔷', type:'active', mpCost:22, desc:'새겨진 룬이 폭발하며 광역 충격파를 방출한다.' },
        { id:'skill_rune_ward', name:'룬 결계', icon:'🛡️', type:'passive', mpCost:0, desc:'WIL+10. 받는 마법 피해 20% 감소.' },
        { id:'skill_rune_awaken', name:'고대 룬 각성', icon:'✨', type:'active', mpCost:34, desc:'[룬 폭발 선행] 전신의 룬이 동시 발동. 물리+마법 복합 대피해.', prereq:'skill_rune_burst' },
        { id:'skill_rune_inscribe', name:'룬 각인술', icon:'📜', type:'passive', mpCost:0, desc:'[룬 결계 선행] STR+10·WIL+8. 무기에 룬 효과를 영구 각인 가능.', prereq:'skill_rune_ward' },
      ]},
  ],
  east: [
    { id:'sword_emperor_heir', name:'검황 후계자', icon:'⚔️', tier:3, parentId:'warrior',
      desc:'무림 최강 검황의 계보를 잇는 후계자. 무림의 정점을 향한 길.',
      lore:'수천 년 강호의 역사 속 단 한 명에게만 전수되는 검황의 비전. 황실도 탐내는 무림의 극의.',
      howToGet:'동대륙 무림 대회 우승 + 검황 백운도와 관계 80 이상 + 민첩 75 이상',
      requiredContinent:'east', unlockCondition:{ minAgi:75, requiredContinent:'east' },
      statFocus:['agi','str'], skills:[
        { id:'skill_sword_emperor_strike', name:'검황 일섬', icon:'⚔️', type:'active', mpCost:30, desc:'검황의 극의를 담은 일격. 회피 불가.' },
        { id:'skill_sword_emperor_stance', name:'무형의 보', icon:'🥋', type:'passive', mpCost:0, desc:'AGI+12. 첫 공격은 항상 선제 적용.' },
        { id:'skill_sword_emperor_void', name:'검황무영', icon:'🌀', type:'active', mpCost:42, desc:'[검황 일섬 선행] 검이 보이지 않는 경지. 3연속 회피불가 타격.', prereq:'skill_sword_emperor_strike' },
        { id:'skill_sword_emperor_legacy', name:'계승의 증표', icon:'👑', type:'passive', mpCost:0, desc:'[무형의 보 선행] STR+12·AGI+8. 검황의 인정을 받아 모든 판정+10%.', prereq:'skill_sword_emperor_stance' },
      ]},
    { id:'imperial_sorcerer', name:'황실 술사',    icon:'🏯', tier:2, parentId:'mage',
      desc:'황실 비술과 무림 내공을 융합한 동방 고유의 마법사.',
      lore:'황실 마법 연구소에서만 전수되는 비전. 용의 기운을 내단에 담는 수련법.',
      howToGet:'동대륙 출신 + 황실 과거 시험 합격 + 마법 60 이상',
      requiredContinent:'east', unlockCondition:{ minMagic:60, requiredContinent:'east' },
      statFocus:['mgc','int'], skills:[
        { id:'skill_dragon_qi', name:'용기 내단', icon:'🐉', type:'passive', mpCost:0, desc:'MGC +12. 용족 NPC와 대화 시 특별 반응 유도.' },
        { id:'skill_imperial_seal', name:'황실 봉인술', icon:'🏯', type:'active', mpCost:24, desc:'적을 황실 인장으로 속박. 3턴간 마법 시전 봉인.' },
        { id:'skill_dragon_breath_qi', name:'용염 내단 폭발', icon:'🔥', type:'active', mpCost:36, desc:'[용기 내단 선행] 내단에 쌓인 용의 기운 방출. 광역 화염 피해.', prereq:'skill_dragon_qi' },
        { id:'skill_imperial_grace', name:'황실의 은총', icon:'✨', type:'passive', mpCost:0, desc:'[황실 봉인술 선행] INT+10. 봉인·결계 계열 스킬 MP 소모 25% 감소.', prereq:'skill_imperial_seal' },
      ]},
  ],
  west: [
    { id:'steam_knight',    name:'증기 기사',      icon:'🤖', tier:2, parentId:'warrior',
      desc:'증기 갑옷으로 무장한 서방 최강의 전사. 마법은 없어도 기계가 그 자리를 채운다.',
      lore:'증기 혁명 이후 탄생한 새로운 기사 계층. 마법사를 견제하기 위해 철왕국이 육성했다.',
      howToGet:'서대륙 출신 + 증기 기어 키트 보유 + 체력 55, 지성 50 이상',
      requiredContinent:'west', unlockCondition:{ minEnd:55, minInt:50, requiredContinent:'west' },
      statFocus:['end','int'], skills:[
        { id:'skill_steam_charge', name:'증기 돌격', icon:'💨', type:'active', mpCost:15, desc:'증기 압력을 폭발시켜 적에게 돌진한다. 관통 피해.' },
        { id:'skill_auto_repair', name:'자동 수리', icon:'⚙️', type:'event', mpCost:0, hpRestore:30, desc:'HP 30% 이하 시 자동 발동. 증기 갑옷 자가 수리.' },
        { id:'skill_steam_cannon', name:'증기포 발사', icon:'💥', type:'active', mpCost:28, desc:'[증기 돌격 선행] 갑옷 내장 대포 발사. 광역 관통 피해.', prereq:'skill_steam_charge' },
        { id:'skill_overdrive', name:'과부하 가동', icon:'🔥', type:'passive', mpCost:0, desc:'[자동 수리 선행] END+12. HP 낮을수록 공격 속도 상승.', prereq:'skill_auto_repair' },
      ]},
    { id:'automaton_master', name:'자동인형 조종사', icon:'🎭', tier:2, parentId:'mage',
      desc:'증기 동력 자동인형을 만들고 조종하는 서방 기술자의 극의.',
      lore:'서대륙 대공창에서만 배울 수 있는 기계 예술. 마법을 기계로 재현한다.',
      howToGet:'서대륙 출신 + 지성 65 + 제작 행동 15회 이상',
      requiredContinent:'west', unlockCondition:{ minInt:65, minCraftCount:15, requiredContinent:'west' },
      statFocus:['int','rng'], skills:[
        { id:'skill_deploy_automaton', name:'자동인형 배치', icon:'🤖', type:'active', mpCost:25, desc:'전투용 자동인형을 배치한다. 3턴간 보조 공격.' },
        { id:'skill_precision_gear', name:'정밀 톱니', icon:'⚙️', type:'passive', mpCost:0, desc:'INT+10. 제작 판정 성공률+25%.' },
        { id:'skill_automaton_swarm', name:'인형 군단', icon:'🎭', type:'active', mpCost:38, desc:'[자동인형 배치 선행] 동시에 3기의 자동인형 배치.', prereq:'skill_deploy_automaton' },
        { id:'skill_master_blueprint', name:'명장의 설계도', icon:'📐', type:'passive', mpCost:0, desc:'[정밀 톱니 선행] INT+12. 자동인형 능력치 영구+30%.', prereq:'skill_precision_gear' },
      ]},
  ],
  south: [
    { id:'sun_priest',      name:'태양 신관',      icon:'☀️', tier:2, parentId:'clergy',
      desc:'고대 태양신을 섬기는 남방 신관. 태양 마법과 치유 기술의 극의를 지닌다.',
      lore:'수천 년 전 대마법 제국이 남긴 태양 신전의 계보. 일식 때 각성하는 특수 능력이 있다.',
      howToGet:'남대륙 출신 + 태양 신전 방문 + 신앙심 65 이상',
      requiredContinent:'south', unlockCondition:{ minFaith:65, requiredContinent:'south' },
      statFocus:['fath','mgc'], skills:[
        { id:'skill_solar_blessing', name:'태양 축복', icon:'☀️', type:'active', mpCost:20, desc:'태양 에너지로 아군 전체 HP +30 회복 및 상태이상 정화.' },
        { id:'skill_sun_radiance', name:'태양의 광휘', icon:'🌟', type:'passive', mpCost:0, desc:'FATH+12. 낮 시간대 전투에서 모든 신성 판정+15%.' },
        { id:'skill_solar_eclipse', name:'일식의 각성', icon:'🌑', type:'active', mpCost:40, desc:'[태양 축복 선행] 일식 상태로 전환. 3턴간 모든 신성 스킬 위력 2배.', prereq:'skill_solar_blessing' },
        { id:'skill_undying_flame', name:'불멸의 성화', icon:'🔥', type:'passive', mpCost:0, desc:'[태양의 광휘 선행] FATH+15. 아군 사망 시 성화가 1회 자동 부활시킴.', prereq:'skill_sun_radiance' },
      ]},
    { id:'ancient_seeker',  name:'고대 마법 탐구자', icon:'🗿', tier:2, parentId:'mage',
      desc:'남방 고대 문명의 잊혀진 마법을 발굴하고 연구하는 탐구자.',
      lore:'대마법 제국의 붕괴 이후 흩어진 비전을 모으는 자들. 위험하지만 그만한 가치가 있다.',
      howToGet:'남대륙 출신 + 고대 유적 방문 2회 이상 + 지성 60, 마법 55 이상',
      requiredContinent:'south', unlockCondition:{ minInt:60, minMagic:55, requiredContinent:'south' },
      statFocus:['int','mgc'], skills:[
        { id:'skill_ruin_reading', name:'유적 해독', icon:'📜', type:'passive', mpCost:0, desc:'INT +8. 고대 유적 탐험 시 추가 정보 획득.' },
        { id:'skill_lost_spell',   name:'잊혀진 주문', icon:'🌀', type:'active', mpCost:35, desc:'고대 문명의 봉인된 주문 해방. 강력하지만 불안정하다.' },
        { id:'skill_forbidden_archive', name:'금단의 서고', icon:'📚', type:'passive', mpCost:0, desc:'[유적 해독 선행] INT+12. 습득한 고대 지식이 영구 스탯으로 전환.', prereq:'skill_ruin_reading' },
        { id:'skill_reconstruction', name:'고대 마법 재현', icon:'🗿', mpCost:42, type:'active', desc:'[잊혀진 주문 선행] 대마법 제국의 봉인 마법 완전 재현. 광역 대피해.', prereq:'skill_lost_spell' },
      ]},
  ],
  northeast: [
    { id:'starlight_archer',  name:'별빛 궁수',       icon:'🌟', tier:2, parentId:'archer',
      desc:'엘프 달빛 숲의 별빛 마법을 활에 담아 쏘는 고대 궁술사.',
      lore:'실버우드 고원의 수천 년 수령 고목에서 만든 활만이 별빛 마력을 담을 수 있다고 전해진다. 인간이 배우려면 엘프의 허락이 필요하다.',
      howToGet:'북동 대륙 방문 + 엘프 NPC 관계 70 이상 + 민첩 60, 지각 55 이상',
      requiredContinent:'northeast', unlockCondition:{ minAgi:60, minPer:55, requiredContinent:'northeast' },
      statFocus:['agi','per'], skills:[
        { id:'skill_starlight_shot', name:'별빛 화살', icon:'✨', type:'active', mpCost:20, desc:'별빛 마력을 담은 화살. 결계와 마법 방어를 관통한다.' },
        { id:'skill_forest_read',   name:'숲의 독법', icon:'🌿', type:'passive', mpCost:0, desc:'PER +10. 숲·자연 지형에서 기척 완전 감지.' },
        { id:'skill_constellation', name:'별자리 소환', icon:'🌌', type:'active', mpCost:36, desc:'[별빛 화살 선행] 별자리 형상의 화살 폭격. 광역 마법 관통 피해.', prereq:'skill_starlight_shot' },
        { id:'skill_moonwood_grace', name:'달빛숲의 가호', icon:'🌙', type:'passive', mpCost:0, desc:'[숲의 독법 선행] AGI+12. 야간 전투 시 모든 판정+20%.', prereq:'skill_forest_read' },
      ]},
    { id:'world_tree_keeper', name:'세계수 수호자',  icon:'🌳', tier:3, parentId:'clergy',
      desc:'세계수 이그드라의 봉인 에너지를 다루는 엘프 최고 신관.',
      lore:'달의 여왕 아엘린만이 공인하는 직위. 세계수의 수액에서 예언을 읽고 봉인석의 균열을 감지한다.',
      howToGet:'북동 대륙 + 세계수 신전 방문 + 신앙심 70, 마법 65 이상 + 실라리엘 관계 80 이상',
      requiredContinent:'northeast', unlockCondition:{ minFaith:70, minMagic:65, requiredContinent:'northeast' },
      statFocus:['fath','mgc'], skills:[
        { id:'skill_seal_read',     name:'봉인석 감지', icon:'🔮', type:'passive', mpCost:0, desc:'주변 봉인석 균열 자동 감지. 세계 이벤트 조기 경보.' },
        { id:'skill_world_tree_heal', name:'세계수 치유', icon:'🌿', type:'active', mpCost:30, desc:'세계수 수액 마력으로 HP·MP 동시 대량 회복.' },
        { id:'skill_yggdra_bond', name:'이그드라와의 교감', icon:'🌳', type:'passive', mpCost:0, desc:'[봉인석 감지 선행] FATH+12. 봉인석 관련 판정에 세계수의 힘 자동 개입.', prereq:'skill_seal_read' },
        { id:'skill_world_tree_bloom', name:'세계수의 개화', icon:'🌸', type:'active', mpCost:44, desc:'[세계수 치유 선행] 아군 전체 완전 회복 + 5턴간 재생 지속.', prereq:'skill_world_tree_heal' },
      ]},
  ],
  southeast: [
    { id:'storm_pirate',     name:'폭풍 해적',       icon:'🏴‍☠️', tier:2, parentId:'rogue',
      desc:'테네브라 해구의 저주받은 바다를 항해하는 전설의 해적.',
      lore:'군도 최강의 해적들도 두려워하는 심해 항로를 개척한 자만이 폭풍 해적의 칭호를 얻는다.',
      howToGet:'남동 군도 출신 + 해적 연합 명성 50 이상 + 행운 55, 민첩 50 이상',
      requiredContinent:'southeast', unlockCondition:{ minLuk:55, minAgi:50, requiredContinent:'southeast' },
      statFocus:['luk','agi'], skills:[
        { id:'skill_plunder',      name:'약탈',         icon:'💰', type:'active', mpCost:0, desc:'전투 승리 시 추가 골드·아이템 획득 확률 +50%.' },
        { id:'skill_sea_legs',     name:'뱃사람 발',    icon:'⚓', type:'passive', mpCost:0, desc:'AGI +8. 선상·해안 전투에서 회피율 +20%.' },
        { id:'skill_deep_curse',   name:'심해의 저주',  icon:'🌊', type:'active', mpCost:25, desc:'테네브라 해구의 저주 에너지를 담아 적에게 방출한다.' },
        { id:'skill_abyss_captain', name:'심연의 선장', icon:'☠️', type:'passive', mpCost:0, desc:'[뱃사람 발 선행] LUK+12. 해상 전투 시 모든 판정 대성공 확률+10%.', prereq:'skill_sea_legs' },
      ]},
    { id:'tide_sorcerer',    name:'조류 술사',       icon:'🌊', tier:2, parentId:'mage',
      desc:'군도의 조류와 폭풍을 조종하는 바다 마법사.',
      lore:'마리넬라 폭풍 마법사단이 전수하는 군도 고유의 기상 마법. 바다에서만 완전한 힘을 발휘한다.',
      howToGet:'남동 군도 방문 + 폭풍 마법사 마리넬라 관계 65 이상 + 마법 60 이상',
      requiredContinent:'southeast', unlockCondition:{ minMagic:60, requiredContinent:'southeast' },
      statFocus:['mgc','rng'], skills:[
        { id:'skill_storm_call',   name:'폭풍 소환',    icon:'⛈️', type:'active', mpCost:28, desc:'국지성 폭풍 생성. 원거리 적에게 광역 피해 + 행동 방해.' },
        { id:'skill_tide_control', name:'조류 조종',   icon:'🌊', type:'passive', mpCost:0, desc:'MGC+10. 물 속성 스킬 위력+20%.' },
        { id:'skill_maelstrom',    name:'대소용돌이',   icon:'🌀', type:'active', mpCost:40, desc:'[폭풍 소환 선행] 거대 소용돌이 생성. 적 전체를 끌어들여 지속 피해.', prereq:'skill_storm_call' },
        { id:'skill_ocean_heart',  name:'대양의 심장',  icon:'💙', type:'passive', mpCost:0, desc:'[조류 조종 선행] MGC+12. 해상·강가에서 MP 회복 속도 2배.', prereq:'skill_tide_control' },
      ]},
  ],
  northwest: [
    { id:'runesmith',        name:'룬 대장장이',     icon:'⚒️', tier:3, parentId:'warrior',
      desc:'드워프 최고의 기술인 룬스미싱을 연마한 장인 전투사.',
      lore:'카라드움 지하 왕국에서 3대 이상 장인 가문만이 배울 수 있는 극의. 무기에 룬을 새겨 마법과 물리의 경계를 허문다.',
      howToGet:'북서 대륙 방문 + 드워프 투린 XVII세 혹은 볼린 관계 75 이상 + 근력 65, 제작 행동 20회 이상',
      requiredContinent:'northwest', unlockCondition:{ minStr:65, minCraftCount:20, requiredContinent:'northwest' },
      statFocus:['str','end'], skills:[
        { id:'skill_rune_forge',   name:'룬 단조',      icon:'🔥', type:'active', mpCost:20, desc:'현재 장착 무기에 룬을 새겨 STR +15 효과를 3턴 부여한다.' },
        { id:'skill_ancestral_wrath', name:'선조의 분노', icon:'⚒️', type:'passive', mpCost:0, desc:'STR+10. 미완성 작업이 있을 때 모든 공격력+20%.' },
        { id:'skill_masterwork', name:'명장의 걸작', icon:'💎', type:'active', mpCost:36, desc:'[룬 단조 선행] 무기에 영구 룬 각인. 이번 전투 내내 STR+20 유지.', prereq:'skill_rune_forge' },
        { id:'skill_dwarven_pride', name:'드워프의 긍지', icon:'🛡️', type:'passive', mpCost:0, desc:'[선조의 분노 선행] END+12. 미완성 작업을 완성할 때마다 영구 스탯 소량 상승.', prereq:'skill_ancestral_wrath' },
      ]},
    { id:'golem_engineer',   name:'골렘 기술자',     icon:'⚙️', tier:2, parentId:'mage',
      desc:'고대 기계 문명의 골렘 제작과 조종을 연구하는 기계 마법사.',
      lore:'기어하트 신전에서 발굴된 고대 설계도를 해석하는 자들. 드워프와 인간 중 소수만이 이 기술을 익힌다.',
      howToGet:'북서 대륙 방문 + 기어하트 신전 탐험 + 지성 60, 마법 50 이상',
      requiredContinent:'northwest', unlockCondition:{ minInt:60, minMagic:50, requiredContinent:'northwest' },
      statFocus:['int','mgc'], skills:[
        { id:'skill_deploy_golem', name:'골렘 소환',    icon:'🤖', type:'active', mpCost:30, desc:'전투용 소형 골렘 1기 소환. 5턴간 보조 공격 및 방어.' },
        { id:'skill_ancient_circuit', name:'고대 회로 해독', icon:'🔱', type:'passive', mpCost:0, desc:'INT +10. 고대 기계 유적 탐험 시 함정 자동 감지.' },
        { id:'skill_golem_overclock', name:'골렘 과가동', icon:'⚡', type:'active', mpCost:40, desc:'[골렘 소환 선행] 소환된 골렘을 강화. 능력치+50%, 지속시간+3턴.', prereq:'skill_deploy_golem' },
        { id:'skill_primal_design', name:'태초의 설계', icon:'📐', type:'passive', mpCost:0, desc:'[고대 회로 해독 선행] MGC+12. 골렘 소환 시 MP 소모 30% 감소.', prereq:'skill_ancient_circuit' },
      ]},
  ],
};

export const CULTURE_SHOCK_HINTS = {
  // [출신대륙][현재대륙] = 힌트
  north: {
    south:   '북방 출신인 이 캐릭터는 남방의 열기와 습기에 적응하지 못하고 있다. END 판정 -5 페널티.',
    east:    '북방의 직설적인 화법이 동방의 예의 문화와 충돌한다. 처음 만나는 동방 NPC는 약간 불편해한다.',
    west:    '북방 전사가 증기와 기계로 가득한 서방 도시에 처음 발을 들였다. 기술 관련 판정 -5.',
  },
  east: {
    north:   '동방의 격식체가 북방의 거친 문화와 어울리지 않는다. 첫 NPC 반응이 다소 당혹스럽다.',
    west:    '동방 황실 문화권 출신이 기계 도시에 들어섰다. 마법을 쓰면 즉각 경계 받는다.',
    south:   '동방의 명분과 체면이 자연 숭배 문화와 충돌한다. 의례적 대화가 먹히지 않는다.',
  },
  west: {
    north:   '기계 기술자가 혹한의 북방에 왔다. 기계가 추위에 오작동할 위험이 있다.',
    east:    '서방의 실용주의가 동방의 예법과 충돌한다. 무림 인들이 서방 출신을 경계한다.',
    south:   '증기 기계가 밀림의 습기에 약하다. 기계 관련 아이템 효율 -10%.',
  },
  south: {
    north:   '남방 출신이 처음 마주하는 혹한. 첫 3턴간 행동에 추위 묘사가 추가된다.',
    east:    '남방의 자유로운 문화가 동방의 엄격한 위계와 부딪힌다.',
    west:    '자연 숭배 문화권 출신이 공장 도시에 왔다. 환경에 강한 거부감을 느낀다.',
  },
  central: {
    north:   '중앙 출신이 북방의 거친 군사 문화에 적응 중이다. 외교적 접근이 통하지 않는다.',
    east:    '중앙의 다원주의와 동방의 전통주의가 충돌한다. 황실 관련 언급에 주의가 필요하다.',
    west:    '중앙 출신 마법사가 서방에 왔다. 마법 사용 시 경비대의 시선이 쏠린다.',
    south:   '문명 중심부 출신이 정글과 고대 신전의 세계에 들어섰다. 고대 문화에 대한 경외심이 필요하다.',
  },
};

export const CONTINENT_SPEECH_HINTS = {
  central:   '이 캐릭터는 중앙 대륙 출신답게 외교적이고 균형 잡힌 표현을 즐겨 쓴다. 여러 문화를 아우르는 유연한 말투.',
  north:     '이 캐릭터는 북방 출신답게 짧고 직설적이며 거친 어조로 말한다. 장황한 설명 대신 핵심만 말한다. 전투와 명예를 중시하는 표현이 자연스럽게 섞인다.',
  east:      '이 캐릭터는 동방 출신답게 고풍스러운 격식체와 비유적 표현을 쓴다. 상대의 체면을 세워주며 돌려 말하는 것을 즐긴다. 강호의 의리와 명분을 중시한다.',
  west:      '이 캐릭터는 서방 출신답게 실용적이고 기계 기술 용어를 자연스럽게 섞어 말한다. "효율", "계산", "설계"같은 단어를 즐겨 쓴다. 감정보다 논리를 앞세운다.',
  south:     '이 캐릭터는 남방 출신답게 자연의 비유와 고대 문명의 신화적 표현을 즐겨 쓴다. "태양이 증인이다", "밀림이 기억한다"같은 표현이 자연스럽게 나온다.',
  northeast: '이 캐릭터는 달빛 숲 출신답게 시적이고 느린 리듬의 말을 쓴다. 자연과 별빛, 세계수에 대한 비유가 자연스럽게 스며든다. 말에 신중하고 침묵도 대화의 일부로 여긴다. "별이 기억한다", "세계수의 뿌리처럼"같은 표현이 자연스럽게 나온다.',
  southeast: '이 캐릭터는 해적 군도 출신답게 거칠고 자유분방하며 속어와 항해 용어를 자연스럽게 섞는다. "바람이 허락한다면", "파도에 맡기는 거야"같은 표현이 나오고, 계약과 약속을 극도로 중시하는 발언을 한다.',
  northwest: '이 캐릭터는 드워프 지하왕국 출신답게 무뚝뚝하고 간결하며 장인 정신을 드러내는 표현을 쓴다. "미완성은 없다", "선조에 부끄럽지 않게"같은 말이 자연스럽게 나온다. 지상의 바람보다 용광로의 열기를 그리워한다.',
};
