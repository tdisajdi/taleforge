// 🌸 동대륙 추가 장소 (+4) — data
// Pure data split out of world/052-동대륙-추가-장소-4.js (see generate.js).

export const SPECIAL_LOCATIONS = [
  {
    id:'loc_shrine', name:'여행자의 사당', icon:'⛩️', type:'shrine',
    monsters:[{name:'배교한 사제',icon:'🔪'},{name:'봉인 파수 석상',icon:'🗿'},{name:'떠도는 참배객 망령',icon:'👻'}],
    desc:'어느 세계관에나 존재하는 신비로운 사당. 여행자들의 안식처.',
    triggerKeywords:['사당','성소','신전','제단','성지'],
    shops:[
      { name:'사당 봉납품', items:[
        {id:'luck_charm',name:'행운의 부적',icon:'🍀',rarity:'uncommon',type:'equip',desc:'LUK+10. 대성공 확률 증가.',price:120, effects:{luk:80}},
        {id:'divine_water',name:'성수',icon:'💧',rarity:'rare',type:'consume',desc:'모든 상태이상 해제. HP+50.',price:200, effects:{hp:550}},
      ]},
    ],
    interactions:[
      { id:'int_pray', name:'기도', icon:'🙏', desc:'신에게 기도. FATH+3, 랜덤 축복.', action:'pray' },
      { id:'int_donate', name:'봉납', icon:'💰', desc:'골드 50 봉납 → 강력한 버프.', action:'donate', cost:50 },
    ],
    priceModifier: 1.0,
  },
  {
    id:'loc_cave', name:'신비한 동굴', icon:'🕳️', type:'dungeon', dungeonTier:1,
    monsters:[{name:'동굴 거미 떼',icon:'🕷️'},{name:'박쥐 무리',icon:'🦇'},{name:'눈먼 동굴 곰',icon:'🐻'}],
    desc:'깊고 어두운 동굴. 무언가 숨겨진 것이 있다.',
    triggerKeywords:['동굴','굴','지하','암혈','동굴 속'],
    shops:[],
    interactions:[
      { id:'int_explore', name:'탐험', icon:'🗺️', desc:'깊이 탐험. 위험하지만 보물 가능.', action:'caveExplore' },
      { id:'int_meditate', name:'명상', icon:'🧘', desc:'동굴의 기운으로 명상. 스탯 회복.', action:'meditate' },
    ],
    priceModifier: 1.0,
    dangerLevel: 2,
  },
  {
    id:'loc_ruins', name:'고대 유적', icon:'🏛️', type:'event',
    monsters:[{name:'유적 감시 자동인형',icon:'🤖'},{name:'고대 도굴꾼 유령',icon:'👻'},{name:'봉인 풀린 정령',icon:'✨'}],
    desc:'오래된 문명의 흔적. 비밀이 잠들어 있다. 어떤 유적은 황금시대의 것이고, 어떤 것은 더 오래됐다.',
    lore:'황금시대(320년 전) 건축물의 잔재. 봉인석 파편이 유적 지하에 묻혀있는 경우가 있다. 셀리나 폐허(150년 전 대마법 폭발로 전소된 마을 터)는 이 유형 중 특히 위험하며, 안개 짙은 밤이면 죽은 자의 목소리가 들린다.',
    rumors:['유적 지하에 봉인석 파편이 묻혀있다','셀리나 폐허는 아직도 저주가 풀리지 않았다','황금시대 유적에서 나온 유물은 현대 마법보다 강하다'],
    triggerKeywords:['유적','옛 건물','고대','잊혀진','폐허','폐성'],
    shops:[],
    interactions:[
      { id:'int_investigate', name:'조사', icon:'🔍', desc:'INT 판정. 성공 시 고대 지식 획득.', action:'investigateRuins' },
      { id:'int_ritual', name:'의식 수행', icon:'✨', desc:'고대 의식 수행. 강력한 랜덤 효과.', action:'ancientRitual' },
    ],
    priceModifier: 1.0,
    dangerLevel: 3,
  },
  // ══ 추가 던전 / 동굴 / 모험 장소 (대거 확장) ══
  {
    id:'loc_crystal_cave', name:'수정 동굴', icon:'💎', type:'dungeon', dungeonTier:1,
    monsters:[{name:'수정 골렘',icon:'💎'},{name:'마나 포식 나비 떼',icon:'🦋'},{name:'결정화된 파수 정령',icon:'🔷'}],
    desc:'거대한 수정이 자라나는 신비로운 동굴. 마법 에너지가 가득하다.',
    triggerKeywords:['수정 동굴','수정굴','크리스탈 동굴','빛나는 동굴','결정 동굴'],
    shops:[
      { name:'수정 동굴 채집상', items:[
        {id:'raw_crystal',name:'원석 수정',icon:'💠',rarity:'uncommon',type:'consume',desc:'MGC+8 영구 상승.',price:180, effects:{mgc:64}},
        {id:'crystal_shard',name:'수정 파편',icon:'🔷',rarity:'common',type:'consume',desc:'MP 20 회복.',price:50, effects:{mp:200}},
        {id:'prism_lens',name:'프리즘 렌즈',icon:'🔮',rarity:'rare',type:'equip',desc:'빛을 굴절시켜 탐지 회피.',price:320, effects:{per:80,disg:40}},
      ]},
    ],
    interactions:[
      { id:'int_crystal_mine', name:'수정 채굴', icon:'⛏️', desc:'STR 판정. 성공 시 수정 획득.', action:'mineCrystal' },
      { id:'int_mana_bathe', name:'마나 목욕', icon:'✨', desc:'수정 에너지에 몸을 담그면 MGC+5, MP 완전 회복.', action:'manaBathe' },
      { id:'int_crystal_map', name:'수정 지도 읽기', icon:'🗺️', desc:'수정에 새겨진 고대 지도 해독.', action:'readCrystalMap' },
    ],
    priceModifier: 1.6,
    dangerLevel: 2,
  },
  {
    id:'loc_undead_tomb', name:'불사자의 묘지', icon:'💀', type:'dungeon', dungeonTier:2,
    monsters:[{name:'해골 근위병 무리',icon:'💀'},{name:'묻힌 왕의 망령',icon:'👑'},{name:'무덤 파먹는 구울',icon:'🧟'}],
    desc:'언데드가 들끓는 고대 왕족의 무덤. 강렬한 저주 기운이 감돈다.',
    triggerKeywords:['묘지','무덤','납골당','불사자','언데드 무덤','왕족 묘','능묘'],
    shops:[
      { name:'묘지 수호자 유품 상인', items:[
        {id:'cursed_blade',name:'저주 검',icon:'🗡️',rarity:'rare',type:'equip',desc:'STR+20 CRIT+15, 저주가 깃들어 장착 시 HP가 소량 깎인다.',price:400, effects:{str:160,crit:100,hp:-20}},
        {id:'bone_shield',name:'뼈 방패',icon:'🛡️',rarity:'uncommon',type:'equip',desc:'언데드 피해 30% 감소.',price:210, effects:{end:100}},
        {id:'death_ward',name:'죽음 부적',icon:'🔮',rarity:'rare',type:'equip',desc:'즉사 판정 1회 무효.',price:380, effects:{wil:60,fath:40}},
      ]},
    ],
    interactions:[
      { id:'int_tomb_rob', name:'묘 약탈', icon:'💰', desc:'고위험 보물 탐색. 저주 위험 존재.', action:'robTomb' },
      { id:'int_ghost_king', name:'망령 왕과 대화', icon:'👑', desc:'묻힌 왕의 망령과 협상. 고대 비밀 획득.', action:'talkGhostKing' },
      { id:'int_undead_ritual', name:'안식 의식', icon:'⛪', desc:'FATH 판정. 성공 시 언데드 진정, 안전 탐색 가능.', action:'undeadRitual' },
    ],
    priceModifier: 1.7,
    dangerLevel: 4,
  },
  {
    id:'loc_lava_cave', name:'용암 동굴', icon:'🌋', type:'dungeon', dungeonTier:1,
    monsters:[{name:'용암 도롱뇽',icon:'🦎'},{name:'화염 정령',icon:'🔥'},{name:'그을린 채굴 골렘',icon:'⚒️'}],
    desc:'대지 깊숙이 흐르는 용암이 동굴을 가득 채우고 있다. 불의 원소가 서식한다.',
    triggerKeywords:['용암 동굴','화산 동굴','마그마 굴','불의 동굴','용암','마그마'],
    shops:[
      { name:'불꽃 광부 상단', items:[
        {id:'magma_ore',name:'마그마 광석',icon:'🔥',rarity:'rare',type:'consume',desc:'화염 저항 +20, STR+10 영구.',price:350, effects:{str:80,end:60}},
        {id:'flame_shard',name:'화염 파편',icon:'💥',rarity:'uncommon',type:'consume',desc:'다음 공격에 화염 피해 추가.',price:140, effects:{str:80}},
        {id:'heat_resist_coat',name:'내열 외투',icon:'🧥',rarity:'uncommon',type:'equip',desc:'화염 피해 30% 감소.',price:280, effects:{end:80,agi:-10}},
      ]},
    ],
    interactions:[
      { id:'int_fire_forge', name:'용암 단조', icon:'⚒️', desc:'용암으로 무기 강화. 화염 속성 부여.', action:'lavaForge' },
      { id:'int_salamander', name:'살라만더 교섭', icon:'🦎', desc:'화염 원소와 교섭. 성공 시 화염 마법 획득.', action:'talkSalamander' },
      { id:'int_lava_swim', name:'용암 감지', icon:'🌡️', desc:'PER 판정. 숨겨진 보물 위치 파악.', action:'senseLava' },
    ],
    priceModifier: 1.8,
    dangerLevel: 5,
  },
  {
    id:'loc_shadow_labyrinth', name:'그림자 미궁', icon:'🌑', type:'dungeon', dungeonTier:2,
    monsters:[{name:'그림자 인영',icon:'🖤'},{name:'미궁을 떠도는 실종자',icon:'👤'},{name:'어둠에 물든 감시자',icon:'👁️'}],
    desc:'어둠의 마법으로 만들어진 끝없는 미궁. 들어간 자 중 절반이 돌아오지 못했다.',
    triggerKeywords:['그림자 미궁','어둠의 미궁','미궁','암흑 미로','그림자 미로','어둠 미로'],
    shops:[
      { name:'미궁 출구 암시장', items:[
        {id:'shadow_cloak',name:'그림자 망토',icon:'🖤',rarity:'rare',type:'equip',desc:'은신 능력 대폭 강화. DISG+25.',price:480, effects:{disg:160,agi:60}},
        {id:'blind_ward',name:'암흑 저항 부적',icon:'🔮',rarity:'uncommon',type:'equip',desc:'암흑 마법 효과 절반 감소.',price:230, effects:{wil:60,per:40}},
        {id:'map_fragment',name:'미궁 지도 파편',icon:'🗺️',rarity:'uncommon',type:'consume',desc:'미궁 다음 구역 정보 획득.',price:160, effects:{per:40}},
      ]},
    ],
    interactions:[
      { id:'int_maze_navigate', name:'미궁 탐색', icon:'🧭', desc:'PER+INT 판정. 핵심 구역 도달 시도.', action:'navigateMaze' },
      { id:'int_shadow_bargain', name:'그림자와 거래', icon:'🤝', desc:'미궁의 주인과 협상. 대가와 보상 교환.', action:'shadowBargain' },
      { id:'int_light_beacon', name:'빛 신호', icon:'🕯️', desc:'횃불로 신호. 갇힌 탐험가 구조 가능.', action:'lightBeacon' },
    ],
    priceModifier: 2.0,
    dangerLevel: 5,
  },
  // ══════════════════════════════════════════════════════════════
  //  [신규] 대륙별 범용 필드 던전 — 특정 세력/메인퀘스트에 종속되지 않은
  //  순수 위험 지역. 기존 던전형 장소들은 대부분 특정 세력의 거점이거나
  //  스토리 후반에만 열리는 곳이라, "그냥 지도를 돌아다니다 마주치는
  //  위험한 곳"이 부족했다. 각 대륙에 하나씩 배치해 어디서든 가까운
  //  고위험 지역을 찾을 수 있게 한다. determineDungeonGrade()가
  //  dangerLevel을 그대로 읽어 D~S등급을 자동 산정하므로, 이 장소들만
  //  들어가도 티어 8~13급 몬스터를 만날 수 있는 정식 경로가 열린다.
  {
    id:'loc_north_frostfang_hollow', name:'서리엄니 골짜기', icon:'🥶', type:'dungeon', dungeonTier:2, continent:'north',
    desc:'만년설 아래 얼어붙은 협곡. 눈보라가 그치지 않고, 얼음 속에 무언가 잠들어 있다는 소문이 있다.',
    lore:'수백 년 전 이 골짜기에서 통째로 얼어붙은 대상단의 흔적이 아직 남아있다. 상인들의 유해는 온전한 모습 그대로 얼음에 갇혀, 마치 그 순간이 멈춘 듯하다. 얼음 밑에서 이따금 낮게 울리는 소리가 들린다는 목격담이 있다.',
    triggerKeywords:['서리엄니 골짜기','얼음 협곡','얼어붙은 골짜기','만년설 골짜기','서리엄니'],
    interactions:[
      { id:'int_frostfang_explore', name:'던전 탐험', icon:'⚔️', desc:'골짜기 깊은 곳을 탐험한다.', action:'dungeonExplore' },
    ],
    priceModifier: 1.3,
    dangerLevel: 4,
  },
  {
    id:'loc_west_drowned_hulk', name:'침몰한 거함의 잔해', icon:'⚓', type:'dungeon', dungeonTier:2, continent:'west',
    desc:'해안에 좌초된 거대한 옛 전함의 잔해. 선체 내부는 미로처럼 얽혀 있고, 아직도 무언가 배회하고 있다.',
    lore:'백 년 전 해적 전쟁 당시 침몰했다는 전설의 기함. 선체 안쪽에서 당시 선원들의 유품과 함께, 설명할 수 없는 흔적들이 발견된다는 소문이 있다. 밤이 되면 선체에서 낮은 뿔피리 소리가 들린다고도 한다.',
    triggerKeywords:['침몰한 거함','난파선','좌초된 배','유령선','거함의 잔해'],
    interactions:[
      { id:'int_hulk_explore', name:'던전 탐험', icon:'⚔️', desc:'침몰한 거함 내부를 탐험한다.', action:'dungeonExplore' },
    ],
    priceModifier: 1.3,
    dangerLevel: 4,
  },
  {
    id:'loc_south_thornveil_maze', name:'가시장막 밀림', icon:'🌿', type:'dungeon', dungeonTier:2, continent:'south',
    desc:'끝없이 얽힌 가시덩굴이 뒤덮은 밀림. 한 번 길을 잃으면 다시 나오기 어렵다고 한다.',
    lore:'밀림 깊은 곳에 고대 부족의 제단이 있었다는 전설이 있다. 가시덩굴 자체가 그 제단을 지키는 존재라는 이야기도 있고, 단순히 오래 방치되어 무성해진 것뿐이라는 설도 있다. 어느 쪽이든 안에서 나오지 못한 이들의 이야기는 많다.',
    triggerKeywords:['가시장막 밀림','가시덩굴 숲','뒤엉킨 밀림','가시밀림'],
    interactions:[
      { id:'int_thornveil_explore', name:'던전 탐험', icon:'⚔️', desc:'가시덩굴 사이로 밀림 깊은 곳을 탐험한다.', action:'dungeonExplore' },
    ],
    priceModifier: 1.4,
    dangerLevel: 5,
  },
  {
    id:'loc_east_silent_pagoda', name:'침묵의 고탑', icon:'🏯', type:'dungeon', dungeonTier:2, continent:'east',
    desc:'구름 위까지 솟은 오래된 탑. 오르는 자는 많아도 정상을 밟았다는 이는 드물다.',
    lore:'탑의 각 층마다 서로 다른 시대의 흔적이 남아있다는 게 이 탑의 가장 이상한 점이다 — 마치 시간이 층마다 다르게 흐르는 것처럼. 탑을 오른 이들 중 일부는 예전과 다른 사람이 되어 내려왔다고 한다.',
    triggerKeywords:['침묵의 고탑','고요한 탑','오래된 탑','침묵의 탑'],
    interactions:[
      { id:'int_pagoda_explore', name:'던전 탐험', icon:'⚔️', desc:'탑을 층층이 오르며 탐험한다.', action:'dungeonExplore' },
    ],
    priceModifier: 1.5,
    dangerLevel: 5,
  },
  {
    id:'loc_northwest_hollow_forge', name:'공허의 폐대장간', icon:'⚒️', type:'dungeon', dungeonTier:2, continent:'northwest',
    desc:'화산 지대에 버려진 거대한 대장간 유적. 불씨가 꺼진 지 오래지만 여전히 뜨거운 기운이 감돈다.',
    lore:'한때 대륙 최고의 무기를 벼려냈다는 대장간이었으나, 어느 날 대장장이들이 모두 사라지고 화로만 남았다는 전설이 있다. 그날 무슨 일이 있었는지는 아무도 알지 못한다 — 다만 지금도 가끔, 아무도 없는 화로에서 망치 소리가 들린다고 한다.',
    triggerKeywords:['공허의 폐대장간','버려진 대장간','폐대장간','유령 대장간'],
    interactions:[
      { id:'int_hollowforge_explore', name:'던전 탐험', icon:'⚔️', desc:'폐대장간 깊은 곳을 탐험한다.', action:'dungeonExplore' },
    ],
    priceModifier: 1.6,
    dangerLevel: 5,
  },
  {
    id:'loc_northeast_veiled_maw', name:'베일에 싸인 아가리', icon:'🕳️', type:'dungeon', dungeonTier:2, continent:'northeast',
    desc:'대지에 뚫린 거대한 균열. 안개가 항상 그 입구를 가리고 있어 바닥이 보이지 않는다.',
    lore:'이 균열이 언제 어떻게 생겼는지 아무도 정확히 알지 못한다. 안으로 들어간 탐험가들의 보고는 하나같이 모순되어, 그 안의 지형이 매번 달라지는 것이 아닌가 하는 의심마저 있다. 가장 깊은 곳에 무엇이 있는지는 아직 아무도 증언하지 못했다.',
    triggerKeywords:['베일에 싸인 아가리','거대한 균열','안개 균열','대지의 균열'],
    interactions:[
      { id:'int_veiledmaw_explore', name:'던전 탐험', icon:'⚔️', desc:'안개 속 균열로 내려가 탐험한다.', action:'dungeonExplore' },
    ],
    priceModifier: 1.8,
    dangerLevel: 5,
  },

  {
    id:'loc_legendary_hunting_ground', name:'전설의 사냥터', icon:'🐺', type:'dungeon', dungeonTier:3,
    desc:'문명의 지도에는 없는 땅. 그리젤다조차 평생 몇 번 발을 들이지 않았다는 전설의 사냥터. 이곳의 짐승들은 사냥감이라기보다 이 땅 자체의 일부에 가깝다.',
    lore:'전설에 따르면 이 사냥터는 태초부터 존재했고, 문명이 닿기 훨씬 전부터 스스로 균형을 유지해왔다. 오직 야생을 진심으로 받아들인 자만이 이 땅의 존재를 느낄 수 있다는 이야기가 있다 — 그렇지 않은 자에게는 그저 평범한 황무지로만 보인다고 한다.',
    // [신규] 사냥꾼 히든 퀘스트 「야생을 닮아가는 것」을 완료해 경계인
    // 그리젤다에게 인정받기 전까지는 이 장소 자체가 지도에 나타나지
    // 않는다. 완료 즉시 tf-permanent-unlocked-locs(환생 클리어 대상이
    // 아닌 영구 키)에 등록되어, 이후 어떤 직업으로 환생하든 계속 찾아갈
    // 수 있다 — 태초의 화로·감시자의 영역과 동일한 패턴.
    hiddenUntilDiscovered: true,
    triggerKeywords:['전설의 사냥터','태고의 사냥터','문명이 닿지 않은 땅','그리젤다의 사냥터'],
    interactions:[
      { id:'int_legendary_hunt', name:'전설급 사냥', icon:'🏹', desc:'최상급 몬스터를 사냥해 희귀한 부산물을 얻는다. 무료, 하루 1회.', action:'legendaryHunt' },
      { id:'int_legendary_tame', name:'전설급 조련', icon:'🐾', desc:'최상급 몬스터를 죽이지 않고 길들이려 시도한다. 지각·의지 스탯이 높을수록 성공률이 오른다. 사냥꾼 전용.', action:'legendaryTame' },
    ],
    priceModifier: 2.0,
    dangerLevel: 6,
  },

  {
    id:'loc_dragon_lair', name:'용의 둥지', icon:'🐉', type:'dungeon', dungeonTier:4,
    desc:'고대 드래곤이 잠든 전설의 동굴. 산더미 같은 보물과 죽음이 기다린다.',
    triggerKeywords:['용의 둥지','드래곤 굴','용 동굴','드래곤 동굴','용 보금자리','용의 보물','드래곤 레어'],
    shops:[
      { name:'드래곤 슬레이어 상단', items:[
        {id:'dragonbane',name:'용 살육의 창',icon:'🏹',rarity:'legendary',type:'equip',desc:'드래곤 대상 피해 3배. 위압감 극대화.',price:1200, effects:{str:240,fear:160,crit:120}},
        {id:'dragon_scale',name:'드래곤 비늘',icon:'🛡️',rarity:'legendary',type:'equip',desc:'모든 원소 피해 40% 감소.',price:900, effects:{end:200,hp:80}},
        {id:'courage_flask',name:'용기의 물약',icon:'🧪',rarity:'rare',type:'consume',desc:'공포 효과 완전 면역 5턴.', price:300, effects:{wil:100,fear:80}},
      ]},
    ],
    interactions:[
      { id:'int_dragon_talk', name:'드래곤과 대화', icon:'🗣️', desc:'INT+CHA 판정. 성공 시 전설 지식 획득.', action:'talkDragon' },
      { id:'int_steal_hoard', name:'보물 강탈 시도', icon:'💰', desc:'AGI 판정. 대성공: 전설 아이템. 실패: 전투.', action:'stealHoard' },
      { id:'int_dragon_pact', name:'드래곤과 계약', icon:'🔗', desc:'조건부 동맹 체결. 강력한 원소 마법 사용권 획득.', action:'dragonPact' },
    ],
    priceModifier: 2.5,
    dangerLevel: 6,
  },
  {
    id:'loc_sunken_temple', name:'수몰 신전', icon:'🌊', type:'dungeon', dungeonTier:3,
    desc:'바닷속에 가라앉은 고대 신전. 해룡과 심해 생물이 그 성역을 지키고 있다.',
    triggerKeywords:['수몰 신전','물속 신전','해저 신전','가라앉은 신전','심해 신전','바다 신전'],
    shops:[
      { name:'잠수 상인', items:[
        {id:'water_breathing',name:'수중 호흡 부적',icon:'🐚',rarity:'rare',type:'equip',desc:'수중에서 무한 호흡 가능.',price:400, effects:{end:60,agi:40}},
        {id:'trident',name:'삼지창',icon:'🔱',rarity:'rare',type:'equip',desc:'수중 전투에서 위력 2배.',price:520, effects:{str:140,agi:80}},
        {id:'sea_gem',name:'심해 보석',icon:'💙',rarity:'uncommon',type:'consume',desc:'수신의 축복. HP+MP 회복, PER+10.',price:200, effects:{hp:400,mp:300,per:60}},
      ]},
    ],
    interactions:[
      { id:'int_dive_deep', name:'심층부 잠수', icon:'🤿', desc:'END 판정. 신전 핵심부 접근.', action:'divDeep' },
      { id:'int_sea_serpent', name:'해룡과 교섭', icon:'🐍', desc:'수신의 언어 사용 시 해룡 진정.', action:'talkSeaSerpent' },
      { id:'int_ancient_altar', name:'수중 제단', icon:'⛩️', desc:'바다의 신에게 제물. 강력한 해신 축복.', action:'seaAltar' },
    ],
    priceModifier: 2.0,
    dangerLevel: 4,
  },
  {
    id:'loc_frozen_dungeon', name:'빙하 던전', icon:'❄️', type:'dungeon', dungeonTier:3,
    desc:'만년설 아래에 봉인된 얼음 던전. 냉기 원소와 고대 빙정 골렘이 배회한다.',
    triggerKeywords:['빙하 던전','얼음 던전','빙정 던전','만년설 던전','냉기 던전','얼음 동굴','빙굴'],
    shops:[
      { name:'빙하 탐험대 보급소', items:[
        {id:'frost_cloak',name:'서리 망토',icon:'🧊',rarity:'rare',type:'equip',desc:'냉기 피해 완전 면역. AGI+10.',price:460, effects:{end:100,agi:60}},
        {id:'warmth_elixir',name:'온기 약제',icon:'🔥',rarity:'uncommon',type:'consume',desc:'냉기 상태이상 해제, HP 30 회복.',price:150, effects:{hp:300}},
        {id:'ice_pick',name:'얼음 곡괭이',icon:'⛏️',rarity:'uncommon',type:'equip',desc:'얼음 지형 이동 패널티 없음.',price:180, effects:{str:60,agi:40}},
      ]},
    ],
    interactions:[
      { id:'int_ice_sculpture', name:'빙조각 해독', icon:'🔍', desc:'INT 판정. 고대 문명의 기록 파악.', action:'decipherIce' },
      { id:'int_golem_bypass', name:'골렘 우회', icon:'🤫', desc:'AGI+DISG 판정. 골렘 감시망 통과.', action:'bypassGolem' },
      { id:'int_frozen_treasure', name:'봉인 보물 해제', icon:'💎', desc:'얼음 속 봉인 보물 해제 시도.', action:'thawTreasure' },
    ],
    priceModifier: 1.9,
    dangerLevel: 4,
  },
  {
    id:'loc_cursed_forest', name:'저주받은 숲', icon:'🌲', type:'dungeon', dungeonTier:2,
    desc:'고대 마법으로 저주받아 길을 잃게 만드는 숲. 요정과 악령이 공존한다.',
    triggerKeywords:['저주받은 숲','마법의 숲','저주 숲','어둠의 숲','요정 숲','미혹의 숲','마물 숲'],
    shops:[
      { name:'숲 가장자리 은둔 상인', items:[
        {id:'fairy_compass',name:'요정 나침반',icon:'🧭',rarity:'rare',type:'equip',desc:'저주받은 숲에서 방향 감각 상실 무효.',price:340, effects:{per:80,luk:40}},
        {id:'hex_ward',name:'저주 방어 부적',icon:'🍀',rarity:'uncommon',type:'equip',desc:'저주 상태 저항 +50%.', price:200, effects:{wil:60,fath:30}},
        {id:'spirit_bait',name:'영혼 미끼',icon:'🌿',rarity:'common',type:'consume',desc:'악령을 유인해 함정으로 유도.',price:80, effects:{per:40}},
      ]},
    ],
    interactions:[
      { id:'int_fairy_deal', name:'요정과 거래', icon:'🧚', desc:'LUK 판정. 요정의 도움 획득 또는 함정.', action:'fairyDeal' },
      { id:'int_forest_spirit', name:'숲의 정령과 대화', icon:'🌳', desc:'FATH 판정. 숲의 비밀과 지름길 획득.', action:'talkForestSpirit' },
      { id:'int_hex_break', name:'저주 해제', icon:'✨', desc:'MGC 판정. 숲의 저주를 일부 해제.', action:'breakHex' },
    ],
    priceModifier: 1.5,
    dangerLevel: 3,
  },
  {
    id:'loc_giant_ruins', name:'거인족 유적', icon:'🗿', type:'dungeon', dungeonTier:2,
    desc:'거인족이 살았던 고대 도시의 폐허. 모든 것이 사람 크기의 10배는 된다.',
    triggerKeywords:['거인 유적','거인족 유적','대인 유적','거인 도시','석상 유적','자이언트 유적'],
    shops:[
      { name:'거인 유물 감정사', items:[
        {id:'giant_boot',name:'거인의 신발 (개조품)',icon:'🥾',rarity:'rare',type:'equip',desc:'이동 속도 대폭 상승. AGI+20.',price:420, effects:{agi:160,str:40}},
        {id:'giant_coin',name:'거인 동전 (목걸이 가공)',icon:'🪙',rarity:'uncommon',type:'equip',desc:'부와 행운의 상징. LUK+15, NEG+10.',price:260, effects:{luk:100,neg:60}},
        {id:'titan_fragment',name:'거인 갑옷 파편',icon:'🛡️',rarity:'rare',type:'equip',desc:'개조한 방어구. END+25.',price:500, effects:{end:180,hp:50}},
      ]},
    ],
    interactions:[
      { id:'int_giant_puzzle', name:'거인 기관 해제', icon:'⚙️', desc:'INT+STR 판정. 거대 기관 장치 조작.', action:'giantPuzzle' },
      { id:'int_relic_hunt', name:'거인 유물 탐색', icon:'🔍', desc:'높은 확률로 희귀 유물 발견.', action:'giantRelicHunt' },
      { id:'int_giant_throne', name:'거인 왕좌에 앉기', icon:'👑', desc:'영웅심 상승. FEAR+10, LDR+5 영구.', action:'sitGiantThrone' },
    ],
    priceModifier: 1.7,
    dangerLevel: 3,
  },
  {
    id:'loc_haunted_mansion', name:'귀신 들린 저택', icon:'🏚️', type:'dungeon', dungeonTier:1,
    desc:'오래된 귀족 저택. 비극적 사연을 가진 원령들이 떠돌고 있다.',
    triggerKeywords:['귀신 저택','유령 저택','귀신 들린','폐 저택','원령 저택','저주받은 저택','유령의 집'],
    shops:[
      { name:'저택 지하 비밀 창고', items:[
        {id:'noble_ring',name:'귀족 반지',icon:'💍',rarity:'uncommon',type:'equip',desc:'고귀한 혈통의 증표. REP+12, NEG+8.',price:300, effects:{rep:80,neg:50}},
        {id:'ghost_lantern',name:'귀신 등불',icon:'🏮',rarity:'rare',type:'equip',desc:'유령에게 피해. 어둠 속 완전 시야.',price:380, effects:{per:100,mgc:60}},
        {id:'exorcism_salt',name:'정화 소금',icon:'🧂',rarity:'common',type:'consume',desc:'원령 공격 1회 무효화.', price:60, effects:{fath:30}},
      ]},
    ],
    interactions:[
      { id:'int_ghost_lore', name:'원령의 사연 청취', icon:'👻', desc:'감수성 판정. 비극 해소 시 강력한 축복.', action:'ghostLore' },
      { id:'int_exorcism', name:'퇴마 의식', icon:'✝️', desc:'FATH+MGC 판정. 성공 시 저택 정화, 보물 해금.', action:'exorcism' },
      { id:'int_hidden_room', name:'비밀 방 수색', icon:'🔍', desc:'PER 판정. 숨겨진 귀족 금고 발견 가능.', action:'findHiddenRoom' },
    ],
    priceModifier: 1.5,
    dangerLevel: 3,
  },
  {
    id:'loc_sky_dungeon', name:'하늘 섬 유적', icon:'☁️', type:'dungeon', dungeonTier:3,
    desc:'구름 위에 떠있는 고대 문명의 섬. 바람의 원소와 하늘 수호자가 지킨다.',
    triggerKeywords:['하늘 섬','공중 섬','구름 섬','천공 섬','하늘 유적','공중 유적','천공 유적'],
    shops:[
      { name:'하늘 상인', items:[
        {id:'wind_boots',name:'바람 장화',icon:'💨',rarity:'rare',type:'equip',desc:'낙하 피해 없음. AGI+20, 도약력 증가.',price:480, effects:{agi:160,per:60}},
        {id:'sky_crystal',name:'천공 수정',icon:'🔮',rarity:'rare',type:'consume',desc:'MGC+15 영구, 공중 부양 일시 가능.',price:400, effects:{mgc:100,agi:60}},
        {id:'storm_feather',name:'폭풍 깃털',icon:'🪶',rarity:'uncommon',type:'equip',desc:'화살과 투사체 회피율 +30%.',price:280, effects:{agi:100,per:40}},
      ]},
    ],
    interactions:[
      { id:'int_wind_ride', name:'기류 타기', icon:'🌬️', desc:'AGI 판정. 하늘 섬 구역 간 이동.', action:'rideWindCurrent' },
      { id:'int_sky_guardian', name:'하늘 수호자와 대화', icon:'🦅', desc:'WIL 판정. 고대 하늘 문명의 비밀 습득.', action:'talkSkyGuardian' },
      { id:'int_cloud_forge', name:'번개 단조', icon:'⚡', desc:'번개 원소로 무기 강화. 전기 속성 부여.', action:'cloudForge' },
    ],
    priceModifier: 2.2,
    dangerLevel: 4,
  },
  {
    id:'loc_abyss_gate', name:'심연의 관문', icon:'🌀', type:'dungeon', dungeonTier:3,
    desc:'차원의 경계가 무너진 균열. 다른 세계의 악마와 존재들이 침투하고 있다.',
    triggerKeywords:['심연','균열','차원 균열','관문','어비스','심연의 문','지옥 관문','마계 균열'],
    shops:[
      { name:'관문 봉인 연구소', items:[
        {id:'seal_rune',name:'봉인 룬석',icon:'🔵',rarity:'rare',type:'consume',desc:'균열 하나를 일시 봉인. 해당 구역 적 출현 감소.',price:350, effects:{wil:60,fath:40}},
        {id:'void_armor',name:'허공 갑옷',icon:'🌑',rarity:'legendary',type:'equip',desc:'차원 피해 완전 면역. MGC+20.', price:1100, effects:{end:180,mgc:120,wil:80}},
        {id:'demon_essence',name:'악마 정수',icon:'💜',rarity:'rare',type:'consume',desc:'일시적 힘 폭주. STR·MGC +30 (3턴).', price:450, effects:{str:200,mgc:160}},
      ]},
    ],
    interactions:[
      { id:'int_seal_crack', name:'균열 봉인', icon:'🔒', desc:'MGC+FATH 판정. 성공 시 균열 봉인 보상.', action:'sealCrack' },
      { id:'int_demon_pact', name:'악마와 계약', icon:'😈', desc:'강력하지만 대가가 따르는 계약.', action:'demonPact' },
      { id:'int_dimension_scout', name:'차원 정찰', icon:'🔭', desc:'PER+INT 판정. 다음 균열 위치 파악.', action:'dimensionScout' },
    ],
    priceModifier: 2.5,
    dangerLevel: 6,
  },
  {
    id:'loc_dwarf_mine', name:'드워프 폐광산', icon:'⛏️', type:'dungeon', dungeonTier:1,
    desc:'버려진 드워프 광산. 채굴 기계와 반쯤 미친 드워프 유령들이 배회한다.',
    triggerKeywords:['드워프 광산','폐광','폐광산','드워프 유적','광산 던전','드워프 던전'],
    shops:[
      { name:'폐광 임시 대장간', items:[
        {id:'mithril_ore',name:'미스릴 원석',icon:'🪙',rarity:'rare',type:'consume',desc:'다음 무기 강화 시 +3등급 효과.',price:500, effects:{str:100}},
        {id:'forge_hammer',name:'드워프 망치',icon:'🔨',rarity:'uncommon',type:'equip',desc:'STR+15, 제작 판정 항상 성공.',price:320, effects:{str:100,end:60}},
        {id:'minecart_key',name:'광차 열쇠',icon:'🗝️',rarity:'uncommon',type:'consume',desc:'광차 타고 던전 탈출 즉시 가능.',price:100, effects:{agi:40}},
      ]},
    ],
    interactions:[
      { id:'int_deep_mine', name:'심층 채굴', icon:'⛏️', desc:'STR+END 판정. 희귀 광물 발견 가능.', action:'deepMine' },
      { id:'int_dwarven_lore', name:'드워프 장인 기술 습득', icon:'📜', desc:'INT 판정. 드워프 단조 기술 일부 습득.', action:'dwarvenLore' },
      { id:'int_minecar_ride', name:'광차 레이스', icon:'🚃', desc:'AGI 판정. 광차 타고 숨겨진 구역 접근.', action:'minecartRide' },
    ],
    priceModifier: 1.6,
    dangerLevel: 3,
  },
  {
    id:'loc_alchemy_lab', name:'버려진 연금술 연구소', icon:'⚗️', type:'dungeon', dungeonTier:1,
    desc:'폭주한 실험으로 폐쇄된 연금술 연구소. 변이된 생물과 불안정한 약품이 위험하다.',
    triggerKeywords:['연금술 연구소','폐 연구소','연금 실험실','마법 실험실','연구소 폐허'],
    shops:[
      { name:'연구소 잔여 재고', items:[
        {id:'mutagen',name:'돌연변이 혈청',icon:'💉',rarity:'legendary',type:'consume',desc:'랜덤 스탯 3개 +20~+40. 하지만 예측 불가.',price:600, effects:{luk:80}},
        {id:'stabilizer',name:'안정제',icon:'🧪',rarity:'uncommon',type:'consume',desc:'상태이상 2개 해제, 다음 약품 부작용 없음.',price:160, effects:{hp:200,end:40}},
        {id:'homunculus_eye',name:'호문쿨루스 눈',icon:'👁️',rarity:'rare',type:'equip',desc:'INT+20, 숨겨진 약점 자동 탐지.',price:420, effects:{int:140,per:80}},
      ]},
    ],
    interactions:[
      { id:'int_experiment', name:'실험 재개', icon:'🔬', desc:'INT 판정. 성공 시 강력한 약품 제조.', action:'doExperiment' },
      { id:'int_mutant_study', name:'변이체 관찰', icon:'🔭', desc:'INT+PER 판정. 변이체 약점 파악.', action:'studyMutant' },
      { id:'int_formula_recover', name:'제조법 복구', icon:'📜', desc:'고대 연금술 제조법 해독.', action:'recoverFormula' },
    ],
    priceModifier: 1.8,
    dangerLevel: 4,
  },

  // ════════════════════════════════════════════════════════════
  //  ★ 세계관 스토리 연동 고등급 던전 (B~S)
  //  아에테른 세계관 핵심 장소들
  // ════════════════════════════════════════════════════════════

  // ── B등급 던전 ──────────────────────────────────────────────
  {
    id:'loc_selenya_ruins', name:'셀리나 폐허', icon:'🔥', type:'dungeon', dungeonTier:2,
    desc:'150년 전 대마법 폭발로 전소된 마을 터. 죽은 자들의 영혼이 아직도 그날 밤을 살고 있다. 땅 아래 봉인석 파편이 흘리는 마력이 언데드를 끊임없이 소환한다.',
    triggerKeywords:['셀리나','폐허','대마법 폭발','봉인석 파편','불탄 마을','유령 마을','셀리나 유적'],
    lore:'왕국 북부 셀리나. 3200명이 하루아침에 사라진 왕국 최대의 비극. 공식 원인은 마법사의 실험 사고였지만 실제로는 봉인석 첫 균열이었다.',
    shops:[
      { name:'떠도는 유물상', items:[
        {id:'ghost_lamp',name:'영혼 등불',icon:'🕯️',rarity:'rare',type:'equip',desc:'언데드 약점 자동 감지. 언데드 대상 피해 +50%.',price:480, effects:{per:120,fath:80}},
        {id:'soul_shard',name:'봉인석 파편 조각',icon:'🔯',rarity:'legendary',type:'consume',desc:'마법 능력 폭발적 강화. MGC+30 (5턴). 봉인석 지식 해금.',price:800, effects:{mgc:200,int:100,wil:60}},
        {id:'mourning_ring',name:'애도의 반지',icon:'💍',rarity:'rare',type:'equip',desc:'죽은 자와 대화 가능. PER+15, 유령형 적 완전 면역.',price:520, effects:{per:100,fath:80,wil:60}},
      ]},
    ],
    interactions:[
      { id:'int_ghost_dialog', name:'영혼과 대화', icon:'👻', desc:'PER+FATH 판정. 150년 전 진실의 단편 획득.', action:'ghostDialog' },
      { id:'int_seal_shard', name:'봉인석 파편 탐색', icon:'🔯', desc:'INT+MGC 판정. 봉인석 파편 발견 시도.', action:'sealShard' },
      { id:'int_mass_grave', name:'집단 묘지 조사', icon:'⚰️', desc:'INT 판정. 대마법 폭발 진상 단서 획득.', action:'massGrave' },
    ],
    priceModifier: 2.0,
    dangerLevel: 4,
    continent: 'central',
  },
  {
    id:'loc_iron_oath_vault', name:'철의 맹세단 지하 금고', icon:'⚔️', type:'dungeon', dungeonTier:4,
    desc:'왕국 기사단이 220년째 봉인해온 지하 금고. 7대 국왕의 악마 계약서가 여기 있다. 충성스러운 기사단원들의 망령이 비밀을 지키기 위해 배회한다.',
    triggerKeywords:['기사단 금고','철의 맹세단','7대 왕','계약서','기사단 지하','비밀 금고','왕국 비밀'],
    lore:'220년 전 7대 국왕 암살 후 기사단이 계약서를 빼돌려 숨긴 곳. 이 계약서가 드러나면 왕국 기사단의 정당성이 무너진다.',
    shops:[
      { name:'탈주 기사의 야영지', items:[
        {id:'oath_breaker',name:'맹세파괴자',icon:'💔',rarity:'rare',type:'equip',desc:'계약·봉인 효과 무시. STR+20.',price:600, effects:{str:140,wil:120,neg:80}},
        {id:'knight_armor',name:'철의 맹세단 갑옷',icon:'🛡️',rarity:'legendary',type:'equip',desc:'왕국 기사단원처럼 보임. 위장 시 기사단 권위 사용 가능.',price:950, effects:{end:180,disg:120,rep:80}},
        {id:'truth_serum',name:'진실의 약',icon:'💊',rarity:'rare',type:'consume',desc:'상대의 거짓말 자동 간파. 심문 판정 무조건 성공.',price:350, effects:{per:100,neg:80}},
      ]},
    ],
    interactions:[
      { id:'int_find_contract', name:'계약서 탐색', icon:'📜', desc:'INT+STL 판정. 7대 왕 계약서 발견 시도. 이 정보는 왕국을 바꾼다.', action:'findContract' },
      { id:'int_ghost_knight', name:'망령 기사와 대결', icon:'⚔️', desc:'STR 판정. 충성 망령과 전투. 처치 시 금고 열쇠 획득.', action:'ghostKnight' },
      { id:'int_negotiate_secret', name:'비밀 협상', icon:'🤝', desc:'SPK+NEG 판정. 망령을 설득해 계약서 위치 파악.', action:'negotiateSecret' },
    ],
    priceModifier: 2.2,
    dangerLevel: 4,
    continent: 'central',
  },
  {
    id:'loc_arcanus_forbidden', name:'아르카누스의 금지 연구실', icon:'🔮', type:'dungeon', dungeonTier:4,
    desc:'마법사 협회 수장 아르카누스의 비밀 실험실. 루프의 진실을 기록한 문서와 수백 회차에 걸쳐 수집된 봉인석 데이터가 있다. 경보 마법진이 촘촘히 깔려있다.',
    triggerKeywords:['아르카누스','마법사 연구실','루프 기록','금지 연구','마법협회 비밀','봉인석 데이터','아르카누스 연구'],
    lore:'수십 회차를 기억하는 아르카누스가 혼자 감당해온 진실의 무게. 이 연구실엔 세계가 몇 번이나 멸망했는지 기록되어 있다.',
    shops:[
      { name:'마법진 틈새 은신 상인', items:[
        {id:'loop_record',name:'루프 기록서',icon:'📕',rarity:'legendary',type:'consume',desc:'이전 회차의 핵심 정보 1개 열람. INT+25 영구.',price:1200, effects:{int:200,mgc:120,wil:80}},
        {id:'seal_analyzer',name:'봉인석 분석기',icon:'🔬',rarity:'rare',type:'equip',desc:'봉인석 위치 자동 감지. 봉인 관련 판정 +20.',price:680, effects:{per:120,int:100,mgc:80}},
        {id:'memory_crystal',name:'기억 수정',icon:'💎',rarity:'rare',type:'consume',desc:'전생 기억 1개 강제 소환. PER+15, WIL+10.',price:450, effects:{per:100,wil:80,int:60}},
      ]},
    ],
    interactions:[
      { id:'int_loop_truth', name:'루프 진실 열람', icon:'📖', desc:'INT+WIL 판정. 세계가 몇 번 반복됐는지 기록 열람. 메타 지식 획득.', action:'loopTruth' },
      { id:'int_seal_map', name:'봉인석 지도 복사', icon:'🗺️', desc:'AGI+INT 판정. 경보 피해 8개 봉인석 위치 복사.', action:'sealMap' },
      { id:'int_arcanus_ai', name:'자동 마법 방어와 교섭', icon:'🤖', desc:'MGC+INT 판정. 아르카누스가 설계한 자동 방어 시스템과 대화.', action:'arcanuAI' },
    ],
    priceModifier: 2.3,
    dangerLevel: 4,
    continent: 'central',
  },

  // ── A등급 던전 ──────────────────────────────────────────────
  {
    id:'loc_tenebra_abyss', name:'테네브라 해구 심층부', icon:'🌊', type:'dungeon', dungeonTier:4,
    desc:'수심 불명의 테네브라 해구 가장 깊은 곳. 봉인된 고대 신의 의식이 여기서 흘러나온다. 들어간 배는 돌아오지 않았다. 나침반이 작동하지 않으며 빛이 굴절된다.',
    triggerKeywords:['테네브라','해구 심층','봉인된 신','심해 신','테네브라 깊은 곳','심연 신전','해저 신','고대 신 봉인'],
    lore:'수만 년 전 고대 신이 패배해 봉인된 장소. 발타자르 해적왕이 탐내는 진짜 이유. 봉인이 약해지면서 주변 해역에 이상 현상이 속출하고 있다.',
    shops:[
      { name:'테네브라 생존자 뗏목', items:[
        {id:'abyss_lantern',name:'심연 등불',icon:'🔦',rarity:'legendary',type:'equip',desc:'테네브라 해구에서만 작동하는 특수 빛. 공포 면역.',price:1500, effects:{per:160,fath:120,wil:100,fear:120}},
        {id:'ancient_god_shard',name:'고대 신의 파편',icon:'⚡',rarity:'legendary',type:'consume',desc:'신적 존재의 기억 일부 흡수. 모든 스탯 +15. 봉인 지식 해금.',price:2000, effects:{str:100,mgc:200,int:150,wil:100}},
        {id:'depth_armor',name:'심해압 갑옷',icon:'🦑',rarity:'rare',type:'equip',desc:'수압·냉기·어둠 완전 면역. 해구 탐험 전용.',price:900, effects:{end:200,hp:100,wil:80}},
      ]},
    ],
    interactions:[
      { id:'int_ancient_god_voice', name:'고대 신의 목소리', icon:'👁️', desc:'WIL+FATH 판정. 실패 시 정신 붕괴. 성공 시 신적 지식 획득.', action:'ancientGodVoice' },
      { id:'int_seal_reinforce', name:'봉인 강화', icon:'🔒', desc:'MGC+FATH 판정. 봉인 약화를 일시 되돌림. 세계 안정도 상승.', action:'sealReinforce' },
      { id:'int_abyss_contract', name:'봉인된 신과 계약', icon:'😈', desc:'WIL 판정. 극도로 위험한 계약. 강력한 힘과 파멸적 대가.', action:'abyssContract' },
    ],
    priceModifier: 3.0,
    dangerLevel: 5,
    continent: 'southeast',
  },
  {
    id:'loc_gearheart_depths', name:'기어하트 신전 최심층', icon:'⚙️', type:'dungeon', dungeonTier:4,
    desc:'드워프 지하왕국 최심부의 고대 기계 신전. 수백만 개의 톱니가 지금도 돌아가고 있다. 그 중심에 잠든 "것"이 깨어나기 시작했다. 고대 문명이 남긴 기계 군단이 경비를 선다.',
    triggerKeywords:['기어하트','고대 기계','기계 신전','드워프 신전','잠든 기계','기계 군단','기어하트 심층'],
    lore:'수천 년 전 멸망한 고대 기계 문명의 심장부. 봉인석 에너지로 작동하는 고대 기계들이 봉인이 약해지자 재가동되기 시작했다. 볼린 기계 사제만이 진실을 안다.',
    shops:[
      { name:'기어하트 탐험대 캠프', items:[
        {id:'ancient_circuit',name:'고대 회로 칩',icon:'🔌',rarity:'legendary',type:'consume',desc:'고대 기계 제어 가능. 전투 중 기계형 적 무력화. INT+20.',price:1100, effects:{int:180,mgc:100,per:80}},
        {id:'mech_arm',name:'기계 팔 보조장치',icon:'🦾',rarity:'rare',type:'equip',desc:'STR+25. 기계 조작 판정 항상 성공.',price:780, effects:{str:200,end:100}},
        {id:'golem_core',name:'골렘 핵심부',icon:'💠',rarity:'legendary',type:'consume',desc:'소형 골렘 1기 영구 소환. 전투 보조.',price:1500, effects:{mgc:120,int:80}},
      ]},
    ],
    interactions:[
      { id:'int_machine_god_interface', name:'기계 신과 접속', icon:'💻', desc:'INT+MGC 판정. 고대 기계 문명의 목적 파악. 봉인석 연결 구조 이해.', action:'machineGodInterface' },
      { id:'int_override_core', name:'핵심부 재프로그래밍', icon:'⚙️', desc:'INT 판정. 고대 기계 군단을 아군으로 전환. 드워프 왕국 위기 해결.', action:'overrideCore' },
      { id:'int_power_source', name:'봉인석 동력원 차단', icon:'🔋', desc:'MGC+WIL 판정. 기계 동력원 차단. 일시적 모든 기계 정지.', action:'powerSourceCut' },
    ],
    priceModifier: 2.8,
    dangerLevel: 5,
    continent: 'northwest',
  },
  {
    id:'loc_world_tree_core', name:'세계수 뿌리 심부', icon:'🌳', type:'dungeon', dungeonTier:4,
    desc:'이그드라의 수천 년 된 뿌리가 뻗은 대지 깊은 곳. 봉인석들의 에너지가 세계수를 통해 집약되는 지점. 세계수의 저주가 발현된 원인이 여기에 있다. 세계수 수호 정령들이 침입자를 거부한다.',
    triggerKeywords:['세계수 뿌리','이그드라 심부','세계수 핵심','세계수 저주','뿌리 던전','이그드라 지하','세계수 내부'],
    lore:'세계수 이그드라의 물리적 핵심. 봉인석 파편들이 세계수 뿌리에 박혀 에너지를 빨아들이고 있다. 실라리엘 대예언사가 들어갔다가 반쯤 미쳐서 돌아온 유일한 곳.',
    shops:[
      { name:'세계수 수액 웅덩이', items:[
        {id:'world_tree_sap',name:'세계수 수액',icon:'💚',rarity:'legendary',type:'consume',desc:'HP·MP 완전 회복. 루프 자각 +1단계. 봉인석 감지 능력 영구 획득.',price:2500, effects:{hp:999,mp:999,wil:120,fath:100,per:80}},
        {id:'igdra_branch',name:'이그드라 가지',icon:'🌿',rarity:'legendary',type:'equip',desc:'자연 마법 한계 제거. 엘프 종족 기술 일부 사용 가능.',price:1800, effects:{mgc:200,fath:150,int:100,wil:80}},
        {id:'root_armor',name:'뿌리 갑옷',icon:'🌱',rarity:'rare',type:'equip',desc:'자연 원소 완전 면역. 세계수 정령이 공격 안 함.',price:1200, effects:{end:180,hp:80,fath:120}},
      ]},
    ],
    interactions:[
      { id:'int_world_tree_memory', name:'세계수의 기억', icon:'🧠', desc:'WIL+FATH 판정. 세계수가 기억하는 수만 년의 역사 일부 열람. 봉인석 창조 비밀 파악.', action:'worldTreeMemory' },
      { id:'int_purify_seal_shard', name:'봉인석 파편 정화', icon:'✨', desc:'MGC+FATH 판정. 뿌리에 박힌 봉인석 파편 정화. 세계수 회복 기여.', action:'purifySealShard' },
      { id:'int_guardian_spirit', name:'수호 정령 설득', icon:'🌀', desc:'FATH+SPK 판정. 세계수 정령의 신뢰 획득. 이그드라의 핵심에 접근 허가.', action:'guardianSpirit' },
    ],
    priceModifier: 3.5,
    dangerLevel: 5,
    continent: 'northeast',
  },

  // ── S등급 던전 ──────────────────────────────────────────────
  {
    id:'loc_primal_forge', name:'태초의 화로', icon:'🔥', type:'dungeon', dungeonTier:4,
    desc:'세계가 처음 벼려지던 순간, 최초의 대장장이가 사용했다는 전설의 화로. 산맥 깊은 곳, 지도에도 없는 협곡 안쪽에 숨겨져 있다. 불씨는 수만 년째 꺼지지 않았다.',
    // [신규] 대장장이 히든 퀘스트 「태초의 화로」를 완료해 명장 헤파이오스와
    // 그림니르의 마지막 시험을 통과하기 전까지는 이 장소 자체가 지도/이동
    // 메뉴에 나타나지 않는다. 완료 즉시 tf-permanent-unlocked-locs(환생
    // 클리어 대상이 아닌 영구 키)에 등록되어, 이후 어떤 직업으로 환생하든
    // 계속 찾아갈 수 있다 — "전생에 화로의 위치를 알아냈다"는 기억이
    // 남는 셈이다. 태초 설계도(bp_primal_*)는 이미 영구 습득되므로,
    // 이 장소에서 재료만 모으면 대장간을 따로 차리지 않고도(제작 패널은
    // 원래 대장간 존재 여부와 무관하게 항상 열려있다) 어느 생에서든
    // 태초급 장비를 실제로 제작할 수 있다.
    hiddenUntilDiscovered: true,
    triggerKeywords:['태초의 화로','헤파이오스','그림니르','태초 대장간','첫 대장장이','불씨','산맥 협곡 화로'],
    lore:'전설에 따르면 이 화로는 세계 그 자체가 벼려지던 순간부터 존재했다. 첫 대장장이가 여기서 세상의 첫 도구를 만들었다는 이야기가 있다. 헤파이오스조차 이곳에 발을 들인 것은 평생 단 한 번뿐이라 했다.',
    interactions:[
      { id:'int_primal_forge_gather', name:'화로 곁 재료 채집', icon:'🔥', desc:'태초급 제작에 필요한 희귀 재료(현자의 원석·티탄의 뼈·용의 비늘·공허의 파편·별의 결정)를 채집한다. 무료, 하루 1회.', action:'gatherPrimalForgeMaterials' },
    ],
    priceModifier: 1.0,
    dangerLevel: 5,
    continent: 'central',
  },

  // ── S등급 던전 ──────────────────────────────────────────────
  {
    id:'loc_watcher_domain', name:'감시자의 영역', icon:'👁️', type:'dungeon', dungeonTier:4,
    desc:'세계 아에테른을 수천 회차에 걸쳐 유지해온 감시자(The Watcher)가 있는 곳. 물리 법칙이 다르다. 과거와 미래가 동시에 보이고, 다른 회차의 자신과 마주칠 수 있다. 여기에 도달한 자 자체가 루프의 열쇠다.',
    // [신규] 학자 히든 퀘스트 「금서의 무게」를 완료해 루프의 진실에 관한
    // 결정적 단서를 손에 넣기 전까지는 이 장소 자체가 지도/이동 메뉴에
    // 나타나지 않는다 — 봉인석 8개 복원·아스모데우스 화해·실라리엘 유대
    // 90+를 전부 채워도 학자가 아니면(또는 학자로서 이 퀘스트를 깨지
    // 않으면) 감시자를 만날 방법 자체가 없다. 학자가 진 엔딩의 1차 관문,
    // 나머지 세 조건이 2차 관문이 되는 구조.
    hiddenUntilDiscovered: true,
    triggerKeywords:['감시자','The Watcher','감시자의 영역','루프 설계자','순환의 주인','감시자 도메인','메타 던전','루프 종결'],
    lore:'감시자는 이 세계의 설계자이자 감옥의 간수다. 세계수가 소생하면 루프가 끊기고 감시자의 존재 이유가 사라진다. 그가 진짜 적인지, 피해자인지는 만나봐야 안다.',
    shops:[
      { name:'루프 자각자 비밀 집합소', items:[
        {id:'loop_key',name:'루프 열쇠',icon:'🗝️',rarity:'legendary',type:'consume',desc:'현재 루프의 봉인 하나를 해제. 진 엔딩 분기 조건.',price:9999, effects:{wil:200,int:200,fath:150,luk:100}},
        {id:'meta_shield',name:'메타 방패',icon:'🛡️',rarity:'legendary',type:'equip',desc:'감시자의 인식 능력 차단. 루프 밖 존재에게 보이지 않음.',price:5000, effects:{wil:200,disg:200,mgc:150,end:100}},
        {id:'cycle_memory',name:'완전한 순환 기억',icon:'🌀',rarity:'legendary',type:'consume',desc:'모든 전생 기억 완전 복구. 스탯 제한 해제. 감시자의 본질 파악.',price:8000, effects:{str:100,agi:100,mgc:150,int:200,wil:150,per:100,fath:100,luk:80}},
      ]},
    ],
    interactions:[
      { id:'int_watcher_confront', name:'감시자와 대면', icon:'👁️', desc:'WIL+INT+FATH 복합 판정. 감시자의 정체와 목적 직접 확인. 진 엔딩의 분기점.', action:'watcherConfront' },
      { id:'int_loop_break', name:'루프 파괴 시도', icon:'💥', desc:'WIL+MGC 판정. 성공 시 진 엔딩. 실패 시 다음 회차로 강제 전환.', action:'loopBreak' },
      { id:'int_watcher_bargain', name:'감시자와 협상', icon:'🤝', desc:'INT+NEG 판정. 루프를 끊는 대신 무언가를 제공하는 협상. 숨겨진 루트.', action:'watcherBargain' },
    ],
    priceModifier: 5.0,
    dangerLevel: 6,
    continent: 'central',
  },
  {
    id:'loc_seal_nexus', name:'봉인의 넥서스', icon:'🔯', type:'dungeon', dungeonTier:4,
    desc:'8개 봉인석이 처음 만들어진 장소. 세계수 이그드라의 심장 파편들이 여기서 분리됐다. 세계 자체가 이 장소를 중심으로 뒤틀려 있다. 봉인이 모두 해제되면 이곳이 활성화된다.',
    triggerKeywords:['봉인의 넥서스','봉인석 원점','8개 봉인','세계수 심장','봉인석 창조','넥서스','봉인 핵심'],
    lore:'감시자가 세계수의 심장을 분리해 8개 봉인석으로 나눈 장소. 세계수가 쇠락한 진짜 원인. 여기서 봉인석을 재결합하면 세계수가 소생한다.',
    shops:[
      { name:'봉인석 수호자 유해', items:[
        {id:'seal_master_robe',name:'봉인술사의 로브',icon:'🔯',rarity:'legendary',type:'equip',desc:'봉인석 에너지 완전 흡수. MGC·WIL +40. 봉인석 무기화 가능.',price:8000, effects:{mgc:300,wil:250,int:150,fath:120}},
        {id:'world_heart_fragment',name:'세계수 심장 파편',icon:'💚',rarity:'legendary',type:'consume',desc:'세계수 소생 조건 중 하나. 진 엔딩 필수 아이템. 모든 스탯 +25.',price:15000, effects:{str:150,agi:150,mgc:200,int:200,wil:200,fath:200,end:150,luk:100}},
        {id:'void_seal',name:'공허 봉인',icon:'🌑',rarity:'legendary',type:'consume',desc:'감시자의 영역에서 사용 가능. 루프 일시 정지.',price:5000, effects:{wil:200,mgc:180,fath:150}},
      ]},
    ],
    interactions:[
      { id:'int_seal_reunite', name:'봉인석 재결합', icon:'🌟', desc:'보유 봉인석 파편 수에 따라 판정 보너스. 세계수 소생 시작. 게임 클라이맥스.',  action:'sealReunite' },
      { id:'int_nexus_memory', name:'넥서스의 기억', icon:'💫', desc:'WIL+INT 판정. 세계수가 왜 분리됐는지 근본 진실 파악. 감시자의 원래 정체.', action:'nexusMemory' },
      { id:'int_guardian_final', name:'넥서스 최후 수호자', icon:'⚡', desc:'STR+MGC+WIL 3중 판정. 봉인을 지키는 최강의 존재와 전투. 진 엔딩 관문.', action:'guardianFinal' },
    ],
    priceModifier: 5.0,
    dangerLevel: 6,
    continent: 'central',
  },
];
