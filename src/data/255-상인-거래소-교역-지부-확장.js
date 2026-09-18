// 상인 — 거래소 / 교역 / 지부 확장 — data
// Pure data split out of economy/255-상인-거래소-교역-지부-확장.js (see generate.js).

export const MERCHANT_RANKS = ['수습 상인','정식 상인','중개인','지부장','상단주','대상회 주'];

export const TALE_MATERIALS = {
  gossip:        { name:'저잣거리 뒷담화', icon:'🗣️', desc:'가벼운 소문. 술집·시장에서 흔히 얻는다.',
    lore:'술 몇 잔이면 누구든 술술 풀어놓는 가벼운 이야기. 대부분은 부풀려지거나 반쯤 지어낸 것이지만, 가끔은 그 안에 진짜 씨앗이 숨어 있기도 하다.' },
  travel_tale:   { name:'여행자의 일화',   icon:'🧳', desc:'떠돌이들 사이에 오가는 여행담.',
    lore:'길 위에서 만난 이들끼리 나누는 이야기. 저마다 조금씩 다르게 기억하고 다르게 전하지만, 그게 오히려 여행담다운 매력이라고들 한다.' },
  battle_song:   { name:'전장의 무용담',   icon:'⚔️', desc:'전투에서 있었던 실제 사건. 전장·의뢰소에서 채집.',
    lore:'실제로 피 흘리며 겪은 이야기는 술자리 농담과는 결이 다르다. 살아남은 자의 증언에는 늘 뭔가 무겁고 진실한 것이 섞여 있다.' },
  heros_deed:    { name:'영웅의 행적',     icon:'🌟', desc:'퀘스트 완수·NPC 구원 등 이름 남을 사건.',
    lore:'누군가의 삶을 바꿔놓은 결정적 순간. 시간이 지날수록 살이 붙고 미화되기 마련인데, 그 과정 자체가 흥미로운 관찰 대상이 된다는 걸 이야기꾼들은 안다.' },
  tragic_fall:   { name:'비극의 잔영',     icon:'🕯️', desc:'죽음·상실·배신이 얽힌 무거운 이야기.',
    lore:'다루기 조심스러운 이야기. 잘못 건드리면 상처를 헤집을 수 있지만, 제대로 풀어내면 듣는 이의 마음 깊은 곳까지 가닿는다.' },
  forbidden_lore:{ name:'금기의 뒷이야기', icon:'🌑', desc:'말해선 안 될 진실. 위험 지역에서만 채집.',
    lore:'퍼뜨리면 곤란해질 종류의 진실. 어떤 늙은 음유시인은 평생 이런 이야기만 좇다가, 결국 무엇이 진짜고 무엇이 지어낸 것인지 스스로도 헷갈리게 되었다는 소문이 있다.' },
  royal_rumor:   { name:'궁정의 밀담',     icon:'👑', desc:'권력자들 사이의 은밀한 사정. 수도·귀족가에서만.',
    lore:'왕궁 담장 안에서만 도는 이야기. 밖으로 새어나가면 누군가의 목이 위태로워질 수도 있는 무게를 지녔다.' },
  ancient_verse: { name:'고대의 시구',     icon:'📜', desc:'까마득한 옛 시대의 잊힌 구절. 유적·던전 한정.',
    lore:'지금은 아무도 완전히 해석하지 못하는 옛 시대의 구절. 운율만은 어렴풋이 남아있어, 뜻을 몰라도 왠지 마음이 술렁인다.' },
};

export const TALE_SITES = [
  { id:'tavern',  name:'선술집 뒷골목', icon:'🍺', risk:1, cost:0,
    matPool:['gossip','travel_tale'],
    bpTierPool:['common'],
    desc:'취객들의 입에서 흘러나오는 가벼운 이야기들. 위험은 없지만 소재도 소박하다.' },
  { id:'market',  name:'시장 골목',     icon:'🏘️', risk:2, cost:15,
    matPool:['travel_tale','battle_song','gossip'],
    bpTierPool:['common','uncommon'],
    desc:'상인과 여행자가 뒤섞이는 곳. 진짜 겪은 이야기가 간간이 섞여든다.' },
  { id:'battlefield', name:'격전지 잔해', icon:'⚔️', risk:3, cost:30,
    matPool:['battle_song','heros_deed','tragic_fall'],
    bpTierPool:['uncommon','rare'],
    desc:'싸움이 휩쓸고 간 자리. 생존자와 유족들의 증언이 남아있다.' },
  { id:'court',   name:'궁정 사교界',   icon:'👑', risk:4, cost:50,
    matPool:['royal_rumor','forbidden_lore','ancient_verse'],
    bpTierPool:['rare','legendary'],
    desc:'권력의 심장부. 위험하지만 여기서만 들을 수 있는 이야기가 있다.' },
];

export const SONG_LORE_SHOP = {
  song_tavern_jig:    { name:'주점 자장가 곡조',       icon:'🎼', rarity:'common',    howToGet:['gather'], dropTier:'common' },
  song_roadside:      { name:'길 위의 발라드 곡조',     icon:'🎼', rarity:'common',    howToGet:['gather'], dropTier:'common' },
  song_market_tune:   { name:'저잣거리 가락 곡조',      icon:'🎼', rarity:'uncommon',  howToGet:['gather'], dropTier:'uncommon' },
  song_war_chant:      { name:'전장의 함성가 곡조',      icon:'🎼', rarity:'uncommon',  howToGet:['gather'], dropTier:'uncommon' },
  song_heroic_epic:    { name:'영웅 서사시 곡조',        icon:'🎼', rarity:'rare',      howToGet:['gather'], dropTier:'rare' },
  song_lament_dirge:   { name:'애도의 만가 곡조',        icon:'🎼', rarity:'rare',      howToGet:['gather'], dropTier:'rare' },
  song_court_intrigue: { name:'궁정 암투곡 곡조',        icon:'🎼', rarity:'legendary', howToGet:['gather'], dropTier:'legendary' },
  song_ancient_hymn:   { name:'고대 찬가 곡조',          icon:'🎼', rarity:'legendary', howToGet:['gather'], dropTier:'legendary' },
};

export const RECOMPOSE_YIELD_BY_RARITY = { common:1, uncommon:2, rare:3, legendary:5 };

export const INTEL_MATERIALS = {
  market_rumor:    { name:'시세 소문',       icon:'📊', desc:'항구에서 떠도는 물가·수요 정보. 흔하다.',
    lore:'항구 어디서나 들리는 물가 이야기. 사소해 보이지만, 이런 소문을 먼저 듣고 먼저 움직이는 자가 결국 시장을 쥐는 법이다.' },
  trade_lead:      { name:'거래처 정보',     icon:'🤝', desc:'신뢰할 만한 거래 상대에 대한 정보.',
    lore:'누구를 믿고 거래할 수 있는지에 대한 정보. 상인들 사이에서는 물건보다 사람에 대한 정보가 더 값나간다는 말이 있다.' },
  smuggle_route:   { name:'밀수로 지도',     icon:'🗺️', desc:'세관을 피하는 은밀한 경로. 암시장에서만 구한다.',
    lore:'세관의 눈을 피해 그려진 지도. 합법과 불법의 경계를 아슬아슬하게 넘나드는 이 지도 한 장이, 때로는 목숨값보다 비싸게 팔린다.' },
  debtor_ledger:    { name:'채무자 장부',     icon:'📒', desc:'누가 누구에게 얼마를 빚졌는지 적힌 기록.',
    lore:'빚은 돈만이 아니라 약점이 되기도 한다. 이 장부 한 권이면 웬만한 협박보다 확실하게 사람을 움직일 수 있다는 걸 아는 자들이 있다.' },
  noble_gossip:     { name:'귀족가 밀담',     icon:'👑', desc:'귀족 사교계에서만 들을 수 있는 은밀한 사정.',
    lore:'화려한 사교 모임 뒤에서 오가는 진짜 이야기들. 겉으로는 우아해 보여도, 그 안에는 웬만한 뒷골목보다 치열한 이해관계가 얽혀 있다.' },
  war_supply_intel: { name:'군수 보급 정보', icon:'⚔️', desc:'전선의 물자 흐름. 양측 모두에게 값이 나간다.',
    lore:'전쟁이 나면 어느 쪽에 팔아도 값이 나가는 정보. 이걸 다루는 상인들 사이에서는 "전쟁이 나든 안 나든 우리는 번다"는 말이 오래된 격언처럼 떠돈다 — 다만 그 말을 입에 담을 때마다 뒷맛이 씁쓸하다는 이들도 있다.' },
  forged_seal:      { name:'위조 인장',       icon:'🔏', desc:'신분과 소속을 위장하는 데 쓰이는 위험한 물건.',
    lore:'가진 자만 가질 수 있는 신분을 흉내 내는 물건. 잘 쓰면 문이 열리고, 잘못 쓰면 목이 달아난다.' },
  crown_ledger:     { name:'상인 왕관 기밀장부', icon:'💰', desc:'상인 왕관 최상층부의 극비 장부 사본.',
    lore:'상인 왕관의 가장 깊은 곳에서만 도는 장부. 이 안에 적힌 거래 내역 중 일부는, 왕가와 그 반대편 모두에게 무기를 대는 이중 거래의 흔적이라는 소문이 있다 — 진위를 확인하려 든 이들 중 몇몇은 다시는 그 이야기를 꺼내지 않았다고 한다.' },
};

export const INTEL_SITES = [
  { id:'port_district', name:'항구 상업지구', icon:'⚓', risk:1, cost:0,
    matPool:['market_rumor','trade_lead'],
    bpTierPool:['common'],
    desc:'배가 드나드는 평범한 항구 지구. 위험은 없지만 정보도 소박하다.' },
  { id:'black_market',  name:'암시장',         icon:'🕶️', risk:2, cost:15,
    matPool:['smuggle_route','trade_lead','debtor_ledger'],
    bpTierPool:['common','uncommon'],
    desc:'법의 눈을 피해 물건이 오가는 곳. 적발되면 평판이 깎인다.' },
  { id:'noble_salon',   name:'귀족 사교 살롱', icon:'👑', risk:3, cost:30,
    matPool:['noble_gossip','debtor_ledger','forged_seal'],
    bpTierPool:['uncommon','rare'],
    desc:'권력자들의 사교 모임. 정보의 질은 높지만 잘못 건드리면 큰 적을 만든다.' },
  { id:'supply_depot',  name:'전선 보급소',   icon:'⚔️', risk:4, cost:50,
    matPool:['war_supply_intel','crown_ledger','forged_seal'],
    bpTierPool:['rare','legendary'],
    desc:'전쟁 물자가 오가는 최전선. 양측 모두에게 팔 수 있는 정보지만 가장 위험하다.' },
];

export const DEAL_LORE_SHOP = {
  deal_bulk_grain:     { name:'곡물 대량거래 정보',     icon:'📜', rarity:'common',    howToGet:['gather'], dropTier:'common' },
  deal_caravan_escort: { name:'상단 호위계약 정보',     icon:'📜', rarity:'common',    howToGet:['gather'], dropTier:'common' },
  deal_smuggle_ring:   { name:'밀수 조직 연줄 정보',     icon:'📜', rarity:'uncommon',  howToGet:['gather'], dropTier:'uncommon' },
  deal_debt_buyout:    { name:'채권 매입 정보',         icon:'📜', rarity:'uncommon',  howToGet:['gather'], dropTier:'uncommon' },
  deal_dual_arms:      { name:'양측 무기거래 정보',     icon:'📜', rarity:'rare',      howToGet:['gather'], dropTier:'rare' },
  deal_noble_monopoly: { name:'귀족가 독점권 정보',     icon:'📜', rarity:'rare',      howToGet:['gather'], dropTier:'rare' },
  deal_crown_favor:    { name:'상인 왕관 특혜 정보',     icon:'📜', rarity:'legendary', howToGet:['gather'], dropTier:'legendary' },
  deal_market_corner:  { name:'시장 매점매석 정보',     icon:'📜', rarity:'legendary', howToGet:['gather'], dropTier:'legendary' },
};

export const HUNTING_GROUNDS = [
  { id:'meadow',   name:'마을 근교 초원', icon:'🌾', risk:1, cost:0,
    desc:'마을과 가장 가까운 사냥터. 초심자도 안전하게 감을 익힐 수 있다.' },
  { id:'deep_forest', name:'깊은 숲',    icon:'🌲', risk:2, cost:15,
    desc:'문명의 손길이 옅어지는 숲. 좀 더 사나운 것들이 산다.' },
  { id:'wild_frontier', name:'야생의 변경', icon:'🏔️', risk:3, cost:30,
    desc:'그리젤다가 즐겨 찾는 진짜 야생. 여기서부터는 방심할 수 없다.' },
  { id:'primal_wilds', name:'태고의 황무지', icon:'🌋', risk:4, cost:50,
    desc:'문명이 닿은 적 없는 땅. 여기 사는 것들은 사냥감이 아니라 재앙에 가깝다.' },
];

export const SHIP_TIERS = [
  { id:'skiff',    name:'소형 어선',   icon:'⛵', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L12 15" /><path d="M12 4 L17 12 L12 12 Z" stroke-linejoin="round"/><path d="M5 15 L19 15 L16.5 19 L7.5 19 Z" stroke-linejoin="round"/></svg>', price:150,  durability:60,  cargo:20,  combat:5,  speed:1.0, desc:'근해용 소형 선박. 싸고 가볍지만 원양 항해엔 위험하다.' },
  { id:'caravel',  name:'범선',        icon:'⛵', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L12 15" /><path d="M12 3 L18 11 L12 11 Z" stroke-linejoin="round"/><path d="M12 5 L7 12 L12 12 Z" stroke-linejoin="round"/><path d="M4 15 L20 15 L17 20 L7 20 Z" stroke-linejoin="round"/></svg>', price:500,  durability:120, cargo:60,  combat:15, speed:1.4, desc:'교역과 탐험에 두루 쓰이는 표준 선박.' },
  { id:'galleon',  name:'갤리온',      icon:'🚢', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12 L19 12 L19 17 L5 17 Z" stroke-linejoin="round"/><path d="M8 12 L8 5 L14 5 L14 12" stroke-linejoin="round"/><path d="M3 17 L21 17 L18 21 L6 21 Z" stroke-linejoin="round"/></svg>', price:1500, durability:250, cargo:150, combat:40, speed:1.2, desc:'대형 화물칸과 포대를 갖춘 원양 선박. 해적들이 가장 탐낸다.' },
  { id:'magic_ship', name:'마법 범선', icon:'🛥️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L12 14" /><path d="M12 3 L17 10 L12 10 Z" stroke-linejoin="round"/><path d="M4 14 L20 14 L17 19 L7 19 Z" stroke-linejoin="round"/><circle cx="12" cy="16" r="1.3" fill="currentColor" stroke="none"/></svg>', price:4000, durability:300, cargo:100, combat:60, speed:2.2, desc:'바람 정령이 깃든 전설적인 선박. 항해 속도와 생존력이 압도적이다.' },
];

// 대륙별 실제 장소 개수에 비례해 크기를 재조정했다(장소가 많은
// north/central이 가장 크고, 장소가 적은 northeast/northwest/southeast가
// 가장 작음).
// 전 라운드까지는 "대륙은 다 떨어져 있어야 한다"고 보고 5개 본토
// 대륙(central/north/south/east/west)마저 전부 넓은 바다로 갈라놨었는데,
// "아시아·아프리카도 붙어있는데 대륙이 꼭 다 떨어져야 하냐"는 피드백을
// 받고 되돌렸다 — east는 central과 실제로 맞닿게, north·south는
// central과 거의 맞닿을 만큼 가깝게 끌어왔다(단, north는 서쪽의 west가
// 대각선으로 너무 가까워서 완전히 붙이면 west와 겹치므로 살짝 여유를
// 남김). 모든 쌍을 좌표 스크립트로 검증해 의도치 않은 겹침이 없게
// 만든 값이다.
// [8-11] "대륙마다 왕국 하나만 있냐, 아시아·아프리카에 나라가 하나뿐이냐"는
// 피드백으로, 예전엔 각자 왕국 하나뿐이던 섬 3개(엘프 숲·드워프 왕국·
// 해적 연합)도 히스파니올라/보르네오처럼 섬 하나에 왕국 둘이 있는
// 구조로 쪼갰다 — 기존 키(northeast/northwest/southeast)는 그대로 두고
// 살짝 작아진 채 서쪽 절반을 차지하고, 새 키(...2)가 동쪽 절반의 새
// 왕국이다(장소가 아직 없는 새 왕국이라 AI가 나중에 채워나감).
export const WORLD_MAP_ZONES = {
  central: { cx:3991.6, cy:4013.6, rx:1050, ry:862 },
  north: { cx:3991.6, cy:2100, rx:1800, ry:712 },
  south: { cx:3418.2, cy:5650, rx:1708, ry:676 },
  east: { cx:5563.1, cy:4350.9, rx:672, ry:1374 },
  west: { cx:1704.2, cy:3314.2, rx:656, ry:1342 },
  // [8-12] 섬 6개(월림/철산/남풍 군도)에 실제 도시·마을 콘텐츠가 채워지면서
  // 예전 크기(rx255/ry300)는 너무 좁아 장소가 오밀조밀 겹쳐 보였다.
  // "크기 제한하지 말라"는 요청대로 1.5배로 키우고, 본토·서로 간 충돌이
  // 없도록 중심 좌표도 함께 재조정했다(정확한 계산은 8-12 작업 메모 참고).
  northeast: { cx:6407.6, cy:2061.9, rx:383.04, ry:449.28 },
  northwest: { cx:1019.7, cy:663.5, rx:383.04, ry:449.28 },
  southeast: { cx:5490.9, cy:7336.5, rx:383.04, ry:449.28 },
  northeast2: { cx:7091.6, cy:2061.9, rx:383.04, ry:449.28 },
  northwest2: { cx:1703.7, cy:663.5, rx:383.04, ry:449.28 },
  southeast2: { cx:6174.9, cy:7336.5, rx:383.04, ry:449.28 },
};

export const CONTINENT_TERRAIN = {
  central: { mountains:[{x:3576,y:4369}, {x:3633.1,y:3419.4}, {x:3961.7,y:3619.4}, {x:4569.6,y:4312.8}], forests:[{x:3774.1,y:3828}, {x:3685.4,y:4135.9}, {x:3511.7,y:3815}, {x:4356.9,y:3592.7}, {x:4441.3,y:4204}] },
  north: { mountains:[{x:3305.1,y:2328.9}, {x:5011.8,y:2283.4}], forests:[{x:3528.9,y:2297.4}, {x:4254.4,y:2256}] },
  south: { mountains:[{x:4079.1,y:5730.5}, {x:2720.8,y:5836.9}], forests:[{x:3532.7,y:5445.4}, {x:2629.1,y:5263.9}] },
  east: { mountains:[{x:5757.8,y:4099}, {x:5222.8,y:5009.1}], forests:[{x:5645.8,y:3705}, {x:5449.3,y:5403}] },
  west: { mountains:[{x:1517.3,y:3405.7}], forests:[{x:1905,y:3205.3}] },
  northeast: { mountains:[{x:6581.1,y:2203.5}], forests:[{x:6423.6,y:2286.5}] },
  northwest: { mountains:[{x:887.5,y:678}], forests:[{x:929.1,y:428.9}] },
  southeast: { mountains:[{x:5670.4,y:7416.5}], forests:[{x:5408.3,y:7196}] },
  northeast2: { mountains:[{x:7352.1,y:1983.3}], forests:[{x:7059,y:2293.9}] },
  northwest2: { mountains:[{x:1546.5,y:704}], forests:[{x:1752.2,y:795.2}] },
  southeast2: { mountains:[{x:6278.6,y:7315.2}], forests:[{x:6292.1,y:7263.8}] },
};

export const DUNGEON_TIER_COLORS = {
  1: '#6a9a5a', // 초급 - 기본 녹색
  2: '#c0a030', // 중급 - 황토색 경고
  3: '#c06a30', // 고급 - 주황 위험
  4: '#e0304a', // 전설급 - 붉은 강조
};

// 예전엔 이 8개 구역 이름이 그냥 "북대륙"/"남대륙" 같은 방위 이름이었고,
// 그 다음엔 새로 지어낸 이름(프로스트가드 등)을 붙였었다 — 그런데
// `data/055-5대륙-왕국-시스템.js`(CONTINENT_RULER_NPCS 등)에 이미
// 세계관 공식 왕국/국가 이름이 있었다: 북=아이스크라운 왕국(빙설
// 여왕 아이리나), 남=케메트 왕국(태양왕 라메세스), 서=증기 연방
// (집정관 세라핀), 북동=달빛 숲(달의 여왕 아엘린, 엘프), 북서=
// 드워프 왕국(왕중왕 투린), 중앙=알테라 왕국(왕도 아이런홀을 세운
// 알테라 1세), 동=용염 제국(드래곤-인간 협정으로 세운 제국),
// 남동=해적 연합(해적왕 발타자르). 지어낸 이름 대신 이 공식 이름을
// 쓴다 — 이 8개는 전부 "왕국"이고, 왕국 하나하나 안에 여러 도시가
// 있다.
// [8-11] "대륙마다 왕국이 하나뿐이냐"는 피드백으로 northeast2·
// northwest2·southeast2 왕국 3개를 새로 만들었다(각각 은월 왕정·
// 강철턱 부족·핏빛 깃발단) — 기존 왕국과 섬 하나를 나눠 쓴다.
export const CONTINENT_PROPER_NAME = {
  central: '알테라 왕국', north: '아이스크라운 왕국', south: '케메트 왕국', east: '용염 제국',
  west: '증기 연방', northeast: '달빛 숲', northwest: '드워프 왕국', southeast: '해적 연합',
  northeast2: '은월 왕정', northwest2: '강철턱 부족', southeast2: '핏빛 깃발단',
};
export const CONTINENT_PROPER_NAME_ICON = {
  central: '🏰 알테라 왕국', north: '❄️ 아이스크라운 왕국', south: '☀️ 케메트 왕국', east: '🐉 용염 제국',
  west: '⚙️ 증기 연방', northeast: '🌙 달빛 숲', northwest: '⛏️ 드워프 왕국', southeast: '🏴‍☠️ 해적 연합',
  northeast2: '✨ 은월 왕정', northwest2: '🔨 강철턱 부족', southeast2: '🩸 핏빛 깃발단',
};

export const CONTINENT_HUB_NAMES = {
  central:   '왕도 아이런홀',
  east:      '동대륙 왕도 오로라홀',
  north:     '빙결 도시 프로스트홀',
  west:      '항구 대도시 크림슨하버',
  south:     '황금 도시 솔라라',
};

export const ISLAND_DEFS = [
  { id:'isl_skull', name:'해골 바위 섬', icon:'💀', x:2474, y:2580, danger:'high',   desc:'기암괴석이 해골처럼 보이는 섬. 오래된 해적의 보물이 묻혀있다는 소문이 있다.' },
  { id:'isl_palm',  name:'야자수 무인도', icon:'🌴', x:3526, y:3050, danger:'low',    desc:'평화로운 무인도. 식수와 과일을 보급할 수 있다.' },
  { id:'isl_fog',   name:'안개의 섬',     icon:'🌫️', x:2684, y:3422, danger:'high',   desc:'짙은 안개에 항상 휩싸여 있다. 이상한 기운이 감돈다.' },
  { id:'isl_coral', name:'산호 환초',     icon:'🪸', x:3842, y:3422, danger:'low',    desc:'아름다운 산호초로 둘러싸인 작은 환초.' },
  { id:'isl_volcano', name:'화산섬',      icon:'🌋', x:2052, y:3736, danger:'extreme',desc:'활화산이 솟은 위험한 섬. 희귀한 마법 광물이 발견된다고 한다.' },
  { id:'isl_wreck', name:'난파선 모래톱', icon:'⚓', x:3106, y:3000, danger:'medium', desc:'수많은 배가 좌초된 모래톱. 난파선의 잔해에서 화물을 건질 수 있다.' },
];

export const ISLAND_LOOT = {
  low:    { gold:[20,60],  relicChance:0.1, dangerChance:0.05 },
  medium: { gold:[50,120], relicChance:0.25,dangerChance:0.15 },
  high:   { gold:[100,250],relicChance:0.4, dangerChance:0.3 },
  extreme:{ gold:[200,500],relicChance:0.6, dangerChance:0.5 },
};

export const ROAD_EDGES = [
  // central 내부 — 왕도를 중심으로 방사형
  ['왕도 아이런홀','교역 도시 골든크로스'],
  ['왕도 아이런홀','성도 라이트헤이븐'],
  ['왕도 아이런홀','지하 도시 섀도우마켓'],
  ['교역 도시 골든크로스','성도 라이트헤이븐'],
  // north 내부
  ['빙결 도시 프로스트홀','요새 도시 아이언게이트'],
  ['빙결 도시 프로스트홀','은광 마을 실버픽'],
  ['빙결 도시 프로스트홀','북방 방벽 도시 아이언월'],
  ['요새 도시 아이언게이트','북방 방벽 도시 아이언월'],
  // east 내부
  ['동대륙 왕도 오로라홀','학문 도시 실버문'],
  ['동대륙 왕도 오로라홀','새벽 도시 던미어'],
  // west 내부
  ['항구 대도시 크림슨하버','상인 공화국 골든시티'],
  // south 내부
  ['황금 도시 솔라라','밀림 도시 에메랄드'],
  ['황금 도시 솔라라','사막 오아시스 타운 산드릴'],
  ['황금 도시 솔라라','모래 관문 샌드게이트'],
  // 대륙 간 대로 — 거점도시끼리 직통
  ['왕도 아이런홀','빙결 도시 프로스트홀'],
  ['왕도 아이런홀','황금 도시 솔라라'],
  ['왕도 아이런홀','동대륙 왕도 오로라홀'],
  ['왕도 아이런홀','항구 대도시 크림슨하버'],
  ['빙결 도시 프로스트홀','동대륙 왕도 오로라홀'],
  ['빙결 도시 프로스트홀','항구 대도시 크림슨하버'],
  ['황금 도시 솔라라','동대륙 왕도 오로라홀'],
  ['황금 도시 솔라라','항구 대도시 크림슨하버'],
];

export const TRAVEL_ENCOUNTER_POOL = [
  { id:'camp_travelers', icon:'🏕️', name:'야영하는 여행객', weight:4,
    desc:'길가에 작은 모닥불을 피우고 야영 중인 여행객들이 보인다.' },
  { id:'caravan', icon:'🐫', name:'상단 캐러밴', weight:3,
    desc:'짐을 가득 실은 상단 캐러밴이 같은 방향으로 이동하고 있다.' },
  { id:'patrol', icon:'🛡️', name:'순찰대', weight:2,
    desc:'영지의 순찰대가 길을 지키고 있다.' },
  { id:'bandit_ambush', icon:'🗡️', name:'산적 매복', weight:2,
    desc:'수상한 자들이 길목에 매복하고 있는 것이 느껴진다.' },
  { id:'wounded_traveler', icon:'🩹', name:'부상당한 여행자', weight:2,
    desc:'길에 쓰러진 부상당한 여행자가 보인다.' },
  { id:'wandering_merchant', icon:'🛒', name:'떠돌이 상인', weight:3,
    desc:'작은 수레를 끄는 떠돌이 상인이 손을 흔든다.' },
];

export const SHIP_UPGRADE_DEFS = {
  hull:   { name:'선체 보강', icon:'🛡️', stat:'durability', perLevel:[0, 0.25, 0.55, 0.95], desc:'내구도가 증가해 폭풍과 전투에 더 오래 버틴다.' },
  sail:   { name:'돛 개량',   icon:'⛵', stat:'speed',       perLevel:[0, 0.2,  0.45, 0.8],  desc:'항해 속도가 빨라져 같은 거리도 더 짧은 턴에 주파한다.' },
  cannon: { name:'포대 증설', icon:'💣', stat:'combat',      perLevel:[0, 0.3,  0.7,  1.2],  desc:'전투력이 크게 증가해 해상전에서 우위를 점한다.' },
  hold:   { name:'화물칸 확장', icon:'📦', stat:'cargo',     perLevel:[0, 0.25, 0.5,  0.9],  desc:'적재량이 늘어나 더 많은 화물을 실을 수 있다.' },
};

export const SHIP_UPGRADE_BASE_COST = { hull:120, sail:150, cannon:200, hold:130 };

export const CREW_NAMES = ['해먼드','코르사','빈센트','마를린','두걸','셀라','오스카','리브카'];

export const CREW_ROLES = {
  sailor:    { name:'일반 선원', icon:'🧑‍✈️', desc:'기본 선원. 특별한 보너스는 없지만 유지비가 싸다.', upkeepMod:1.0 },
  gunner:    { name:'포수',      icon:'💥', desc:'전투력 +4 (포대 운용 숙련).', upkeepMod:1.3 },
  navigator: { name:'항해사',    icon:'🧭', desc:'항해 속도 +0.15 (항로 단축).', upkeepMod:1.3 },
  bosun:     { name:'갑판장',    icon:'📯', desc:'다른 선원들의 충성도 하락 속도를 늦춘다.', upkeepMod:1.5 },
};

export const SEA_EVENT_POOL = [
  { id:'sea_pirate', icon:'🏴‍☠️', name:'해적선', weight:3,
    desc:'해적선이 깃발을 내걸고 접근한다. 싸우거나, 도망치거나, 화물을 일부 내주고 통행세를 낼 수 있다.' },
  { id:'sea_storm', icon:'⛈️', name:'폭풍', weight:3,
    desc:'거대한 폭풍이 배를 덮친다. 선체에 피해를 입을 위험이 있다.' },
  { id:'sea_calm', icon:'🌊', name:'표류', weight:2,
    desc:'바람이 멎어 배가 표류한다. 항해가 지연되지만 바다 위에서 무언가를 건져올릴 수도 있다.' },
  { id:'sea_merchant', icon:'⛴️', name:'우호 선단', weight:2,
    desc:'다른 상선이 신호를 보내며 다가온다. 해상에서 즉석 교역을 제안한다.' },
  { id:'sea_monster', icon:'🐙', name:'해룡/크라켄', weight:1,
    desc:'심해에서 거대한 무언가가 떠오른다. 선체를 위협하는 강력한 해양 괴물이다.' },
];

export const ENEMY_SHIP_DEFS = [
  { id:'smuggler',  name:'밀수선',     icon:'🚤', tierLike:'skiff',   hpMult:0.7, combatMult:0.7, lootGold:[40,90],   desc:'무장이 빈약한 밀수선. 손쉬운 상대다.' },
  { id:'corsair',   name:'코르세어',   icon:'🏴‍☠️', tierLike:'caravel', hpMult:1.0, combatMult:1.0, lootGold:[80,160],  desc:'표준적인 해적선. 만만치 않은 상대다.' },
  { id:'warship',   name:'해적 전함',  icon:'🚢', tierLike:'galleon', hpMult:1.6, combatMult:1.5, lootGold:[150,300], desc:'중무장한 해적 전함. 큰 위험을 감수해야 한다.' },
  { id:'navy_frigate', name:'해군 호위함', icon:'⚓', tierLike:'galleon', hpMult:1.4, combatMult:1.6, lootGold:[0,0], isNavy:true, desc:'해상 악명을 쫓아온 왕국 해군. 격퇴 또는 나포해도 현상금은 없지만 악명이 줄어든다.' },
];

export const NPC_SHIP_KINDS = [
  { kind:'merchant', icon:'⛴️', name:'상선', weight:5, cargoValue:[40,120], combat:[10,20] },
  { kind:'pirate',    icon:'🏴‍☠️', name:'해적선', weight:3, cargoValue:[60,180], combat:[20,45] },
  { kind:'fisher',    icon:'🚤', name:'어선',  weight:3, cargoValue:[10,30],  combat:[3,8] },
  { kind:'navy',      icon:'⚓', name:'순찰함', weight:2, cargoValue:[0,0],   combat:[35,60] },
];
