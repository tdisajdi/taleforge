// 📋 게시판 시스템 — data
// Pure data split out of misc/053-게시판-시스템.js (see generate.js).

export const BULLETIN_SIZE_CONFIG = {
  hamlet: { minQuests:0, maxQuests:2, minInfo:0, maxInfo:1, label:'소촌', color:'#7a6a4a' },
  village:{ minQuests:1, maxQuests:4, minInfo:0, maxInfo:2, label:'마을', color:'#5a8a5a' },
  town:   { minQuests:2, maxQuests:5, minInfo:1, maxInfo:2, label:'중소도시', color:'#4a7aaa' },
  city:   { minQuests:3, maxQuests:7, minInfo:1, maxInfo:2, label:'도시', color:'#aa7a2a' },
  capital:{ minQuests:5, maxQuests:7, minInfo:2, maxInfo:2, label:'수도', color:'#c8a030' },
};

export const BULLETIN_QUEST_POOL = [
  // ── 일반 의뢰 ──
  { tier:'common', icon:'🐀', title:'창고 해충 퇴치', desc:'마을 창고에 쥐와 해충이 들끓고 있소. 깨끗이 처리해 주시면 사례하겠습니다.', rewardType:'gold', rewardMin:15, rewardMax:35, tags:['hamlet','village','town','city'] },
  { tier:'common', icon:'🌾', title:'수확 일손 도움', desc:'이번 수확철에 일손이 모자라오. 이틀만 도와주신다면 식량과 골드를 드리겠소.', rewardType:'gold', rewardMin:10, rewardMax:25, rewardExtra:'식량×3', tags:['hamlet','village'] },
  { tier:'common', icon:'🐄', title:'잃어버린 가축 찾기', desc:'우리 황소가 이틀 전부터 사라졌소. 근처 숲에 있을 것 같은데… 찾아주시면 고맙겠소.', rewardType:'gold', rewardMin:20, rewardMax:40, tags:['hamlet','village','town'] },
  { tier:'common', icon:'📦', title:'물자 배달', desc:'이웃 마을까지 짐꾸러미를 전달해 주세요. 위험하진 않지만 시간이 걸리는 일이오.', rewardType:'gold', rewardMin:18, rewardMax:30, tags:['village','town','city','capital','port'] },
  { tier:'common', icon:'🪵', title:'장작 패기', desc:'겨울을 나려면 장작이 더 필요하오. 하루 분량만 도와주시오.', rewardType:'gold', rewardMin:8, rewardMax:18, tags:['hamlet','village'] },
  { tier:'common', icon:'🌿', title:'약초 채집', desc:'숲 약초꾼이 다리를 다쳤소. 약초 5묶음만 채취해다 주시면 사례하겠소.', rewardType:'gold', rewardMin:12, rewardMax:28, rewardExtra:'HP포션×1', tags:['hamlet','village','town'] },
  { tier:'common', icon:'🔨', title:'울타리 수리 인부', desc:'늑대 습격으로 울타리가 망가졌소. 수리 인력이 필요합니다.', rewardType:'gold', rewardMin:10, rewardMax:22, tags:['hamlet','village'] },
  { tier:'common', icon:'💌', title:'편지 전달', desc:'멀리 사는 가족에게 편지를 전해야 하오. 왕복 하루 거리요.', rewardType:'gold', rewardMin:15, rewardMax:25, tags:['village','town','city','capital','port'] },
  // ── 중급 의뢰 ──
  { tier:'uncommon', icon:'🐺', title:'늑대 무리 토벌', desc:'마을 인근에 늑대 무리가 출몰해 가축 피해가 심각합니다. 무리를 해산시키거나 두목을 처치하시오.', rewardType:'gold', rewardMin:60, rewardMax:120, rewardExtra:'가죽×2', tags:['village','town','city','capital'] },
  { tier:'uncommon', icon:'🗡️', title:'도적 소탕', desc:'인근 도로에서 상인들이 습격당하고 있소. 도적 무리를 처치하면 큰 보상을 드리겠소.', rewardType:'gold', rewardMin:80, rewardMax:150, tags:['town','city','capital','port'] },
  { tier:'uncommon', icon:'🔍', title:'실종자 수색', desc:'열흘 전 숲에 들어간 상인이 돌아오지 않았소. 생사를 확인해 주시오.', rewardType:'gold', rewardMin:70, rewardMax:130, rewardExtra:'정보 아이템', tags:['village','town','city','capital'] },
  { tier:'uncommon', icon:'💀', title:'묘지 불안 해결', desc:'마을 묘지에서 밤마다 이상한 소리가 납니다. 원인을 파악하고 해결해 주시오.', rewardType:'gold', rewardMin:55, rewardMax:110, rewardExtra:'신앙 경험치', tags:['village','town'] },
  { tier:'uncommon', icon:'🏚️', title:'폐가 조사', desc:'마을 외곽 폐가에서 이상한 불빛이 관찰되고 있소. 위험하지 않으면 좋겠지만…', rewardType:'gold', rewardMin:50, rewardMax:100, tags:['village','town','city','capital'] },
  { tier:'uncommon', icon:'🧙', title:'마법사 심부름', desc:'탑의 마법사가 귀한 재료를 급히 필요로 합니다. 위험 지역에 있다고 하오.', rewardType:'gold', rewardMin:90, rewardMax:160, rewardExtra:'마나 포션×2', tags:['town','city','capital'] },
  { tier:'uncommon', icon:'⚔️', title:'호위 의뢰', desc:'상인 카라반이 다음 도시까지 호위병을 구하고 있소. 전투 가능자 모집.', rewardType:'gold', rewardMin:100, rewardMax:180, tags:['town','city','capital','port'] },
  { tier:'uncommon', icon:'🐉', title:'야수 격퇴', desc:'인근 동굴에서 괴수가 내려와 농장을 습격하고 있습니다. 강한 모험가가 필요합니다.', rewardType:'gold', rewardMin:120, rewardMax:200, rewardExtra:'희귀 소재×1', tags:['town','city','capital'] },
  // ── 고급/특수 의뢰 ──
  { tier:'rare', icon:'🏛️', title:'유적 탐사 동행', desc:'고대 유적 발굴단이 보조 탐사대원을 모집합니다. 위험하지만 유물 분배가 있소.', rewardType:'gold', rewardMin:200, rewardMax:400, rewardExtra:'고대 유물 가능성', tags:['town','city','capital'] },
  { tier:'rare', icon:'🔮', title:'마법 이상 현상 조사', desc:'북쪽 삼림에서 기이한 마법 기운이 감지됩니다. 마법사 길드가 의뢰인이오. 강한 팀이 필요합니다.', rewardType:'gold', rewardMin:250, rewardMax:500, rewardExtra:'마법 스킬 습득 가능', tags:['city','capital'] },
  { tier:'rare', icon:'👑', title:'귀족 가문 의뢰 (기밀)', desc:'신원 확인된 모험가만. 세부 내용은 의뢰인과 직접 면담 후 공개됩니다. 보상은 후하오.', rewardType:'gold', rewardMin:300, rewardMax:600, rewardExtra:'명성 대폭 상승', tags:['city','capital'] },
  { tier:'rare', icon:'💎', title:'보물 지도 회수', desc:'도난당한 고대 보물 지도를 되찾아 주시오. 의뢰인은 대상인 연합이오.', rewardType:'gold', rewardMin:280, rewardMax:550, rewardExtra:'지도 사본 제공', tags:['town','city','capital'] },
  { tier:'legendary', icon:'🌑', title:'어둠의 의식 저지', desc:'극비 — 특정 세력이 금지된 의식을 준비 중입니다. 저지에 성공한다면… 세계가 달라질 것이오.', rewardType:'gold', rewardMin:600, rewardMax:1200, rewardExtra:'전설급 아이템 가능', tags:['city','capital'] },
  { tier:'legendary', icon:'🐲', title:'고룡 목격담 조사', desc:'북방 산맥에서 고룡이 목격됐다는 증언이 있습니다. 사실 확인만도 큰 대가를 드리겠소.', rewardType:'gold', rewardMin:500, rewardMax:1000, rewardExtra:'전설 칭호 가능', tags:['city','capital'] },
  // ── 수도 전용 의뢰 ──
  { tier:'rare', icon:'🛡️', title:'왕실 근위대 지원 요청', desc:'왕도 외곽에서 의문의 무장 세력이 포착됐소. 왕실 근위대가 임시 지원 모험가를 모집합니다.', rewardType:'gold', rewardMin:350, rewardMax:650, rewardExtra:'왕실 인장 (평판+30)', tags:['capital'] },
  { tier:'rare', icon:'🕵️', title:'첩보 수집 임무', desc:'왕국 정보부 의뢰. 특정 귀족 가문의 동향을 파악하시오. 신중함이 요구되는 임무입니다.', rewardType:'gold', rewardMin:400, rewardMax:700, rewardExtra:'칭호 가능성', tags:['capital'] },
  { tier:'legendary', icon:'⚜️', title:'왕명 특수 임무', desc:'국왕 직인이 찍힌 밀봉 서신. 내용은 수령 즉시 공개됩니다. 왕국의 명운이 걸린 임무라고만 전해 들었소.', rewardType:'gold', rewardMin:800, rewardMax:1500, rewardExtra:'왕국 최고 훈장 + 영지 가능', tags:['capital'] },
];

export const BULLETIN_INFO_POOL = [
  // 쓸모없는 정보
  { tier:'junk', icon:'📰', title:'장날 공지', content:'다음 주 목요일은 정기 장날입니다. 평소보다 물가가 낮아질 예정.' },
  { tier:'junk', icon:'🌦️', title:'날씨 예보', content:'이번 주는 흐리고 비가 올 예정. 농작물 관리에 유의하시오.' },
  { tier:'junk', icon:'🐓', title:'닭 분실', content:'내 닭 세 마리가 사라졌소. 혹시 보신 분은 연락 주시오.' },
  { tier:'junk', icon:'🍺', title:'주막 영업 안내', content:'오늘부터 사흘간 주막에서 할인 행사를 합니다. 에일 한 잔에 반값!' },
  { tier:'junk', icon:'👴', title:'어르신 훈시', content:'요즘 젊은이들이 예의가 없소. 장로님 말씀: 인사를 잘 합시다.' },
  { tier:'junk', icon:'🧹', title:'청소 당번', content:'이번 주 마을 광장 청소 당번: 대장장이 가문. 협조 부탁드립니다.' },
  { tier:'junk', icon:'💤', title:'수면 장애 호소', content:'요즘 밤에 이상한 소리가 나서 잠을 못 자겠소. 혹시 저만 그런가요?' },
  // 쓸만한 정보
  { tier:'useful', icon:'🗺️', title:'안전 루트 정보', content:'동쪽 숲길은 최근 도적 출몰로 위험합니다. 강 옆 우회로를 이용하시오. +30분이지만 더 안전함.' },
  { tier:'useful', icon:'💰', title:'상인 통과 일정', content:'다음 주 대상인단이 이 마을을 통과합니다. 희귀 물건을 구하실 분은 준비하시오.' },
  { tier:'useful', icon:'🌿', title:'약초 군락 발견', content:'북쪽 언덕 뒤편에 귀한 회복 약초 군락이 있음을 알립니다. 선착순이오.' },
  { tier:'useful', icon:'🔑', title:'지름길 발견', content:'폐광 터널을 통하면 다음 마을까지 반나절을 단축할 수 있습니다. 단, 약간 어두우니 횃불 지참.' },
  { tier:'useful', icon:'⚠️', title:'몬스터 주의보', content:'최근 동굴 쪽에서 언데드가 목격됐습니다. 혼자 다니지 마세요. 특히 밤에는 금물.' },
  { tier:'useful', icon:'🏥', title:'치유사 방문 예정', content:'순회 치유사가 사흘 뒤 마을에 옵니다. 중상 환자는 미리 신청하시오. 비용 저렴.' },
  // 특별한 정보 (희귀)
  { tier:'special', icon:'🏴', title:'숨겨진 지하 통로', content:'마을 오래된 우물 아래에 통로가 있다는 소문. 어디로 이어지는지는 알 수 없으나 고대 지도에 표시가 있소.' },
  { tier:'special', icon:'💀', title:'저주받은 유물 경고', content:'누군가 저주받은 반지를 마을 근처에서 발견했다 합니다. 절대 착용 금지. 신전에 가져다 주시오.' },
  { tier:'special', icon:'🌟', title:'별자리 이상 현상', content:'지난 사흘간 북쪽 하늘의 별자리가 바뀌었습니다. 마법사들은 이것이 큰 사건의 전조라 합니다.' },
  { tier:'special', icon:'👁️', title:'비밀 조직 목격', content:'붉은 두건을 쓴 자들이 마을을 통과했습니다. 정체를 아시는 분은 관청에 제보하시오. 사례 있음.' },
  { tier:'special', icon:'🗝️', title:'폐성의 보물 소문', content:'동쪽 폐성에 이전 영주가 숨긴 보물이 있다는 노인의 증언. 수십 년째 소문만 있었지만 최근 발굴 흔적이 발견됨.' },
  { tier:'special', icon:'🐉', title:'고룡 목격 증언', content:'산 너머 사냥꾼이 거대한 그림자를 봤다 합니다. 수백 년 만에 나타난 고룡일 수도? 진위는 불분명.' },
  { tier:'special', icon:'🌀', title:'공간 이상 현상', content:'북쪽 숲 한 지점에서 공간이 흔들리는 현상이 목격됩니다. 접근 금지. 마법사 조사단이 파견 예정.' },
  { tier:'special', icon:'📜', title:'고대 비문 해독 의뢰', content:'마을 외곽에서 발견된 석판의 비문이 해독됐습니다: "세 번째 달이 차면, 땅 아래 문이 열린다." 의미 불명.' },
  // ── 수도 전용 특수 정보 ──
  { tier:'special', icon:'🏰', title:'왕실 내부 소문', content:'근위대 관계자에 따르면, 왕이 최근 불면에 시달리며 이상한 말을 중얼거린다고 합니다. 왕가에 무슨 일이 있는 걸까요.' },
  { tier:'special', icon:'🗝️', title:'왕궁 지하 통로 소문', content:'왕궁 아래에는 외부로 이어지는 비밀 통로가 있다는 오래된 전설이 있습니다. 반역과 탈출에 쓰였다고 전해집니다.' },
  { tier:'special', icon:'⚖️', title:'왕국 법정 특이 판결', content:'이번 주 대법정에서 고위 귀족이 내란 혐의로 기소됐습니다. 배후가 있다는 소문이 파다합니다.' },
  { tier:'special', icon:'🌐', title:'타국 밀사 목격', content:'수도 여관에서 이웃 왕국의 밀사로 추정되는 인물이 목격됐습니다. 전쟁 협상인지, 동맹 교섭인지 불분명합니다.' },
  { tier:'special', icon:'💀', title:'왕실 암살 미수 사건', content:'어제 밤 왕실 연회장에서 독이 든 와인이 발견됐다고 합니다. 공식 발표는 없으나 목격자들 사이에서 소문이 돌고 있습니다.' },
];

export const LOC_NPC_POOL = {
  capital: [
    { id:'npc_knight_captain', name:'기사단장 갈라한', icon:'⚔️', role:'왕국 기사단장', personality:'강직하고 충성스럽다', hint:'왕도를 수호하는 최정예 기사. 명성이 높은 자를 인정한다.' },
    { id:'npc_court_mage', name:'궁정 마법사 엘레나', icon:'🔮', role:'왕실 수석 마법사', personality:'냉정하고 분석적이다', hint:'왕실 마법 연구소를 총괄한다. 마법 능력자를 관심 있게 본다.' },
    { id:'npc_merchant_lord', name:'상단주 토르바', icon:'💰', role:'왕도 대상인', personality:'계산적이고 현실적이다', hint:'왕국 최대 무역 상단을 이끈다. 골드가 많은 자와 거래를 원한다.' },
    { id:'npc_noble_lady', name:'귀족 영애 세레나', icon:'👸', role:'왕국 귀족', personality:'우아하지만 은밀한 야망을 품고 있다', hint:'왕국 귀족 가문의 영애. 겉과 속이 다른 인물이다.' },
    { id:'npc_spy_master', name:'정보국장 샤도우', icon:'🕵️', role:'왕국 정보국장', personality:'비밀이 많고 신중하다', hint:'왕국의 그림자 속에 존재한다. 정보를 사고판다.' },
    { id:'npc_arena_master', name:'투기장 주인 크로노스', icon:'🏟️', role:'왕도 투기장 관리자', personality:'박력 있고 흥행사 기질이 있다', hint:'왕도 투기장을 운영한다. 강한 전사를 좋아한다.' },
  ],
  city: [
    { id:'npc_guild_master', name:'길드마스터 하베스트', icon:'⚔️', role:'모험가 길드 마스터', personality:'경험 많고 현명하다', hint:'수십 년간 모험가들을 이끌어왔다. 잠재력을 한눈에 본다.' },
    { id:'npc_blacksmith', name:'대장장이 두린', icon:'⚒️', role:'명장 대장장이', personality:'과묵하지만 장인 정신이 강하다', hint:'도시 최고의 대장장이. 좋은 재료와 강한 전사에 관심이 많다.' },
    { id:'npc_apothecary', name:'약제사 미라', icon:'⚗️', role:'도시 약제사', personality:'친절하고 지식이 풍부하다', hint:'모든 질병과 독에 대한 해법을 알고 있다. 의뢰를 자주 맡긴다.' },
    { id:'npc_bard', name:'음유시인 로란', icon:'🎭', role:'떠돌이 음유시인', personality:'자유분방하고 낙천적이다', hint:'여러 도시를 떠돌며 이야기를 모은다. 진귀한 정보를 많이 안다.' },
    { id:'npc_fence', name:'암거래상 스팅크', icon:'🐀', role:'지하세계 중개인', personality:'교활하고 기회주의적이다', hint:'공식적으로는 골동품상. 뒷세계 물건을 거래한다.' },
  ],
  town: [
    { id:'npc_town_guard', name:'위병대장 브론', icon:'🛡️', role:'마을 위병대장', personality:'책임감 강하고 소박하다', hint:'마을 치안을 책임진다. 의뢰를 자주 낸다.' },
    { id:'npc_innkeeper', name:'여관 주인 마사', icon:'🏠', role:'여관 주인', personality:'따뜻하고 수다스럽다', hint:'이 마을 모든 소문을 꿰고 있다. 여행자 정보통.' },
    { id:'npc_priest', name:'신관 이그나티우스', icon:'⛪', role:'지역 신관', personality:'경건하고 헌신적이다', hint:'지역 신전을 관리한다. 신앙이 높은 자를 반긴다.' },
    { id:'npc_ranger', name:'삼림 감시인 케일', icon:'🏹', role:'삼림 감시인', personality:'과묵하고 자연을 사랑한다', hint:'마을 주변 숲을 순찰한다. 위험한 정보를 제일 먼저 안다.' },
    { id:'npc_merchant_traveler', name:'행상인 루이스', icon:'🛒', role:'행상인', personality:'명랑하고 수완이 좋다', hint:'여러 마을을 돌아다니는 행상. 다른 지역 소식을 전한다.' },
  ],
  village: [
    { id:'npc_village_elder', name:'마을 어르신 기딜', icon:'👴', role:'마을 장로', personality:'지혜롭고 보수적이다', hint:'마을의 역사와 전설을 모두 알고 있다.' },
    { id:'npc_farmer_hero', name:'농부 영웅 탈론', icon:'🌾', role:'전직 모험가', personality:'수수하지만 과거 무용담이 있다', hint:'은퇴한 모험가. 과거에 대해선 말을 아낀다.' },
    { id:'npc_herbalist', name:'약초꾼 엘름', icon:'🌿', role:'마을 약초꾼', personality:'소박하고 자연을 잘 안다', hint:'숲의 약초와 독초를 구분한다. 지역 지형에 밝다.' },
    { id:'npc_young_adventurer', name:'청년 모험가 제이크', icon:'🧑', role:'꿈 많은 청년', personality:'순진하고 열정적이다', hint:'모험을 꿈꾸는 청년. 동행을 원한다.' },
  ],
  hamlet: [
    { id:'npc_wise_woman', name:'현명한 할머니 아이다', icon:'👵', role:'촌락 현자', personality:'신비롭고 예언 같은 말을 한다', hint:'촌락의 정신적 지주. 알 수 없는 미래를 암시한다.' },
    { id:'npc_woodcutter', name:'나무꾼 포드', icon:'🪵', role:'나무꾼', personality:'순박하고 성실하다', hint:'숲에서 이상한 것을 목격했다는 소문이 있다.' },
  ],
  dungeon: [
    { id:'npc_dungeon_guide', name:'던전 안내인 크리프트', icon:'🗝️', role:'던전 가이드', personality:'위험을 즐기고 대담하다', hint:'이 던전의 구석구석을 안다. 비용을 받고 안내해준다.' },
    { id:'npc_dungeon_merchant', name:'지하 상인 골딩', icon:'💰', role:'위험 지역 상인', personality:'탐욕스럽지만 물건은 좋다', hint:'던전 입구 근처에서 장사한다. 희귀 아이템을 다룬다.' },
    { id:'npc_trapped_adventurer', name:'조난 모험가 렌', icon:'🤕', role:'부상당한 모험가', personality:'겁에 질려 있지만 정보가 있다', hint:'던전 안에서 조난당했다. 깊은 곳 정보를 알고 있다.' },
    { id:'npc_dungeon_hermit', name:'던전 은자 오라클', icon:'🧙', role:'던전 거주 은자', personality:'기이하고 깨달음을 추구한다', hint:'오래 전부터 던전 깊은 곳에서 홀로 수행 중이다.' },
  ],
  shrine: [
    { id:'npc_high_priest', name:'대신관 세라피엘', icon:'✨', role:'성소 대신관', personality:'경건하고 신비로운 권위가 있다', hint:'신의 뜻을 전한다. 신앙심이 높은 자를 축복한다.' },
    { id:'npc_pilgrim', name:'순례자 아나', icon:'🙏', role:'순례자', personality:'경건하고 겸손하다', hint:'먼 곳에서 순례를 온 신자. 다양한 성소 정보를 안다.' },
    { id:'npc_shrine_guardian', name:'성소 수호자 아르마', icon:'⚔️', role:'성소 수호 기사', personality:'엄격하고 헌신적이다', hint:'성소를 지키는 수호 기사. 부정한 자의 접근을 막는다.' },
  ],
  event: [
    { id:'npc_wandering_swordsman', name:'방랑 검사 무솔', icon:'⚔️', role:'방랑 검사', personality:'냉정하고 강자를 추구한다', hint:'더 강한 적을 찾아 방랑한다. 대결을 원할 수도 있다.' },
    { id:'npc_war_survivor', name:'전쟁 생존자 페트라', icon:'😔', role:'전쟁 생존자', personality:'트라우마가 있지만 강인하다', hint:'전쟁의 흔적을 간직한 생존자. 과거의 진실을 알고 있다.' },
    { id:'npc_scavenger', name:'약탈자 스크랩', icon:'🔧', role:'전리품 수집가', personality:'기회주의적이다', hint:'전장 유물을 수집하는 자. 물건 감정에 능하다.' },
  ],
  special: [
    { id:'npc_archmage_apprentice', name:'대마법사의 제자 알렉', icon:'🎓', role:'마법 수련생', personality:'열정적이고 지식욕이 강하다', hint:'마법탑에서 수련 중. 마법 정보를 교환하고 싶어한다.' },
    { id:'npc_mysterious_stranger', name:'의문의 여행자 X', icon:'❓', role:'정체불명의 인물', personality:'알 수 없다', hint:'어디서 왔는지 무엇을 원하는지 아무도 모른다.' },
  ],
  port: [
    { id:'npc_harbor_master', name:'항만장 도리안', icon:'⚓', role:'항구 관리인', personality:'분주하고 실무적이다', hint:'입항하는 모든 배를 관리한다. 항로와 화물 정보를 안다.' },
    { id:'npc_ship_captain', name:'선장 코르비나', icon:'🚢', role:'상선 선장', personality:'대범하고 입담이 좋다', hint:'여러 대륙을 오간 노련한 선장. 먼 바다 이야기를 안다.' },
    { id:'npc_smuggler', name:'밀수업자 라토', icon:'📦', role:'뒷골목 밀수업자', personality:'은밀하고 계산적이다', hint:'세관을 피해 물건을 나른다. 위험한 거래를 제안할 수 있다.' },
    { id:'npc_fisherwoman', name:'어부 셀린', icon:'🎣', role:'항구 어부', personality:'소박하고 바다를 잘 안다', hint:'매일 바다에 나간다. 근해 이변을 가장 먼저 눈치챈다.' },
  ],
  wilderness: [
    { id:'npc_wandering_hunter', name:'떠돌이 사냥꾼 그리즐', icon:'🏹', role:'황야의 사냥꾼', personality:'과묵하고 야생에 익숙하다', hint:'홀로 황야를 누빈다. 근방 몬스터 서식지를 훤히 안다.' },
    { id:'npc_nomad_trader', name:'유목 상인 아셰라', icon:'🐫', role:'대상(隊商) 상인', personality:'자유롭고 흥정에 능하다', hint:'정착지 없이 황야를 떠돈다. 희귀한 산물을 판다.' },
    { id:'npc_hermit_survivor', name:'은둔 생존자 콜', icon:'🏕️', role:'황야의 은둔자', personality:'경계심이 강하지만 의리는 있다', hint:'문명을 등지고 홀로 살아남았다. 이유는 말하지 않는다.' },
  ],
};

// [위치 인식 몬스터 풀] LOC_NPC_POOL과 같은 방식 — 장소 "유형"(loc.type)에
// 맞는 적 후보군을 하드코딩으로 미리 준비해둔다. checkRandomEncounter가
// 돌발 조우를 생성할 때, 그 장소에서 실제로 있었던 AI 서사 기록
// (getLocationMonsterPool)이 있으면 그것을 최우선으로 쓰고, 없을 때만
// 여기서 장소 유형에 맞는 후보를 뽑는다 — AI 호출 없이도 "던전엔 던전다운
// 것, 마을 근처엔 마을다운 것"이 나오게 하기 위함.
export const LOC_MONSTER_POOL = {
  dungeon: [
    {name:'해골 전사', icon:'💀'}, {name:'거대 거미', icon:'🕷️'}, {name:'슬라임', icon:'🟢'},
    {name:'동굴 박쥐 떼', icon:'🦇'}, {name:'구울', icon:'🧟'}, {name:'던전 골렘', icon:'🗿'},
  ],
  shrine: [
    {name:'타락한 사도', icon:'🩸'}, {name:'저주받은 석상', icon:'🗿'}, {name:'망령', icon:'👻'},
    {name:'광신도', icon:'🔪'}, {name:'봉인 파수병', icon:'⚔️'},
  ],
  event: [
    {name:'약탈자 무리', icon:'🔪'}, {name:'전장의 망령', icon:'👻'}, {name:'폭주한 짐승', icon:'🐗'},
    {name:'용병단 낙오병', icon:'🗡️'}, {name:'혼돈의 마수', icon:'👹'},
  ],
  special: [
    {name:'이계의 파편체', icon:'🌀'}, {name:'변이 짐승', icon:'🐾'}, {name:'그림자 인영', icon:'🖤'},
  ],
  village: [
    {name:'들개 무리', icon:'🐺'}, {name:'좀도둑', icon:'🗡️'}, {name:'멧돼지', icon:'🐗'},
    {name:'까마귀 떼', icon:'🦅'},
  ],
  hamlet: [
    {name:'들개 무리', icon:'🐺'}, {name:'멧돼지', icon:'🐗'}, {name:'독사', icon:'🐍'},
  ],
  town: [
    {name:'도적단', icon:'🗡️'}, {name:'뒷골목 폭력배', icon:'🔪'}, {name:'훈련된 맹견', icon:'🐕'},
  ],
  city: [
    {name:'도적단', icon:'🗡️'}, {name:'뒷골목 암살자', icon:'🗡️'}, {name:'폭도', icon:'👊'},
  ],
  capital: [
    {name:'반역 용병단', icon:'⚔️'}, {name:'왕실 암살자', icon:'🗡️'}, {name:'폭도', icon:'👊'},
  ],
  // [수정] 수감 중(loc.type==='jail')에는 감옥이라는 장소 성격에 맞는
  // 몬스터가 나와야 하는데, 이 키가 없어서 완전히 장소 무관한 범용
  // ENCOUNTER_POOL로 폴백하던 문제 — 감옥 장소다운 풀을 채워준다.
  jail: [
    {name:'폭동 죄수', icon:'⛓️'}, {name:'타락한 교도관', icon:'🔪'}, {name:'감옥쥐 떼', icon:'🐀'},
  ],
  port: [
    {name:'부두 폭력배', icon:'🔪'}, {name:'밀항자 무리', icon:'🏴‍☠️'}, {name:'항구쥐 떼', icon:'🐀'},
  ],
  wilderness: [
    {name:'늑대 무리', icon:'🐺'}, {name:'야생 멧돼지', icon:'🐗'}, {name:'황야의 도적', icon:'🗡️'},
    {name:'거대 독수리', icon:'🦅'}, {name:'떠돌이 골렘', icon:'🗿'},
  ],
};

// 중세 판타지 전용 게임이라 시나리오별 추가 NPC 풀은 비워둔다
// (원래도 medieval 키가 없어 SCENARIO_NPC_EXTRA[scenarioId]||[] 폴백으로
// 항상 빈 배열이 되던, 실질적으로 도달 불가능한 데이터였다).
export const SCENARIO_NPC_EXTRA = {};
