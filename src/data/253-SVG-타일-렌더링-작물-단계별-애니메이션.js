// SVG 타일 렌더링 — 작물 단계별 애니메이션 — data
// Pure data split out of misc/253-SVG-타일-렌더링-작물-단계별-애니메이션.js (see generate.js).

export const LIVESTOCK_DEFS = {
  cow:  { name:'소',  icon:'🐄', price:80,  product:'milk',  productName:'우유', productIcon:'🥛', productPrice:5, yieldTurns:3, desc:'우유를 정기적으로 생산한다.' },
  hen:  { name:'닭',  icon:'🐔', price:30,  product:'egg',   productName:'계란', productIcon:'🥚', productPrice:3, yieldTurns:2, desc:'계란을 빠르게 생산한다.' },
  sheep:{ name:'양',  icon:'🐑', price:60,  product:'wool',  productName:'양털', productIcon:'🧶', productPrice:8, yieldTurns:4, desc:'양털을 생산해 직물 재료로 쓸 수 있다.' },
};

export const BRED_CROP_NAME_PARTS = ['황금','서리','달빛','심연','폭풍','여명','석양','이슬'];

export const BRED_CROP_SUFFIX = ['밀','열매','뿌리','꽃','버섯','콩'];

export const TOMB_TIERS = [
  { id:'pauper', name:'평민의 무덤', icon:'🪦', karmaReq:0,  digCost:0,  riskBase:0.05, relicTier:1, desc:'마을 변두리의 수수한 무덤. 큰 위험은 없지만 얻는 것도 적다.' },
  { id:'merchant', name:'부유한 묘', icon:'⚰️', karmaReq:25, digCost:20, riskBase:0.12, relicTier:2, desc:'상인이나 귀족 가문의 묘. 부장품이 제법 값나간다.' },
  { id:'noble', name:'귀족 영묘', icon:'🏛️', karmaReq:50, digCost:60, riskBase:0.22, relicTier:3, desc:'경비가 있는 영묘. 발각되면 곧바로 수배자가 된다.' },
  { id:'royal', name:'왕족의 능묘', icon:'👑', karmaReq:75, digCost:150,riskBase:0.35, relicTier:4, desc:'왕가의 능묘. 강력한 저주와 수호 영혼이 잠들어 있다.' },
  { id:'cursed', name:'저주받은 묘', icon:'☠️', karmaReq:90, digCost:0,  riskBase:0.5,  relicTier:5, desc:'이름조차 지워진 자의 무덤. 그림자 결사가 이곳의 유물을 탐낸다.' },
];

export const TOMB_RELIC_DEFS = {
  1: [ {name:'녹슨 청동 반지', icon:'💍', price:15, effects:{}}, {name:'낡은 묵주', icon:'📿', price:12, effects:{}} ],
  2: [ {name:'은제 회중시계', icon:'⏱️', price:45, effects:{luk:2}}, {name:'상인의 인장', icon:'🪙', price:50, effects:{}} ],
  3: [ {name:'귀족의 가보 목걸이', icon:'📜', price:120, effects:{cha:4}}, {name:'룬이 새겨진 단검', icon:'🗡️', price:140, effects:{str:3}} ],
  4: [ {name:'왕가의 인장', icon:'👑', price:350, effects:{cha:8,luk:4}}, {name:'봉인된 왕홀', icon:'🔱', price:400, effects:{mgc:6}} ],
  5: [ {name:'이름 없는 자의 가면', icon:'🎭', price:700, effects:{mgc:10,crse:8}}, {name:'저주받은 심장석', icon:'🖤', price:900, effects:{mgc:14,crse:12}} ],
};

export const ACTIVITY_MASTERY_TIERS = [
  { statKey:'farm_sell_count',      threshold:50,  titleId:'am_farmer_skilled' },
  { statKey:'farm_sell_count',      threshold:200, titleId:'am_farmer_master' },
  { statKey:'grave_dig_count',      threshold:20,  titleId:'am_tombraider_skilled' },
  { statKey:'grave_soul_guided_count', threshold:5,   titleId:'am_soulguide_skilled' },
  { statKey:'contract_success_count', threshold:30,  titleId:'am_broker_skilled' },
  { statKey:'merc_recruit_count',   threshold:10,  titleId:'am_mercenary_lord' },
  { statKey:'bounty_kills',         threshold:10,  titleId:'am_bounty_hunter' },
  { statKey:'bounty_kills',         threshold:50,  titleId:'am_shadow_judge' },
  { statKey:'workshop_orders_fulfilled', threshold:20, titleId:'am_artisan_skilled' },
  { statKey:'workshop_orders_fulfilled', threshold:80, titleId:'am_master_artisan' },
  { statKey:'bard_performances',    threshold:30,  titleId:'am_renowned_bard' },
  { statKey:'merchant_trades',      threshold:25,  titleId:'am_trade_baron' },
];

export const WORKSHOP_TYPES = {
  forge:   { name:'대장간',     icon:'🔨', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 3.5 L20.5 9.5 L17 13 L11 7 Z" stroke-width="1.3"/><path d="M11 7 L4 14 C3.3 14.7 3.3 15.8 4 16.5 C4.7 17.2 5.8 17.2 6.5 16.5 L13.5 9.5"/></svg>', color:'#c08040', categories:['weapon','armor'], estCost:100 },
  alchemy: { name:'연금술 공방', icon:'⚗️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2 L15 2 M10 2 L10 9 L4.5 18 C4 19 4.7 20 6 20 L18 20 C19.3 20 20 19 19.5 18 L14 9 L14 2" stroke-linejoin="round"/><path d="M7 15 L17 15" stroke-width="1.1"/></svg>', color:'#8060c0', categories:['consume','accessory'], estCost:90 },
  clinic:  { name:'치유소',     icon:'💚', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20 C12 20 3 14 3 8.2 C3 5.3 5.3 3 8.2 3 C10 3 11.3 3.9 12 5.2 C12.7 3.9 14 3 15.8 3 C18.7 3 21 5.3 21 8.2 C21 14 12 20 12 20 Z" stroke-linejoin="round"/></svg>', color:'#40a060', categories:['consume'], estCost:80 },
};

export const WORKER_NAMES_WS = ['그레타','발드','이리스','콘라드','셀린','오토','마야','두건'];

export const ORDER_CUSTOMER_NAMES = ['용병 단장','떠돌이 모험가','마을 촌장','귀족 영애','순찰대장','상인','은퇴한 기사','수습 마법사'];

export const CLINIC_PATIENT_NAMES = ['전선에서 실려온 병사','열병 앓는 아이의 부모','오랜 지병을 앓는 노인','산고를 앞둔 임산부','역병 지역 생존자','광산 사고 부상자','떠돌이 순례자','굶주려 쓰러진 유랑민'];

export const MINING_SITES = [
  { id:'shallow', name:'근교 채석장',   icon:'⛰️',  risk:1, cost:0,
    matPool:['iron_ore','herb_bundle','silver_ore'],
    bpTierPool:['common'],
    desc:'마을 근교의 얕은 채석장. 위험은 적지만 얻는 것도 소박하다.' },
  { id:'mine',    name:'드워프 폐광산', icon:'⛏️',  risk:2, cost:15,
    matPool:['iron_ore','silver_ore','rare_gem','magic_stone'],
    bpTierPool:['common','uncommon'],
    desc:'버려진 드워프의 광산. 무너진 갱도 안쪽에 아직 손대지 않은 광맥이 남아있다.' },
  { id:'lava',    name:'용암 동굴',     icon:'🌋',  risk:3, cost:30,
    matPool:['brimstone','monster_bone','dragon_scale','titan_bone'],
    bpTierPool:['uncommon','rare'],
    desc:'뜨거운 열기가 가득한 동굴. 화염 생물과 마주칠 위험이 있지만 희귀 재료가 많다.' },
  { id:'crystal', name:'수정 동굴',     icon:'💎',  risk:4, cost:50,
    matPool:['star_crystal','void_shard','philosophers_ore','shadow_silk'],
    bpTierPool:['rare','legendary'],
    desc:'마력이 응결된 심층 동굴. 가장 위험하지만 전설급 재료의 산지로 알려져 있다.' },
];

export const DISMANTLE_YIELD_BY_RARITY = {
  common:1, uncommon:2, rare:3, epic:4, legendary:6,
};

export const REMEDY_MATERIALS = {
  wild_herb:      { name:'들풀 약초',       icon:'🌿', desc:'가장 기본적인 약초. 어디서나 흔하다.',
    lore:'길가나 숲 어디서나 자라는 흔한 약초. 대단할 것 없어 보이지만, 오랜 세월 마을 사람들의 열을 내리고 상처를 아물게 한 것은 결국 이런 흔한 풀이었다.' },
  clean_water:     { name:'정화수',         icon:'💧', desc:'끓여 정화한 물. 상처 세척과 해열에 쓰인다.',
    lore:'그저 끓인 물이지만, 상처를 씻어낼 때와 그냥 마실 때는 전혀 다른 물처럼 다뤄진다. 노련한 의무병들은 이 물 하나로 얼마나 많은 목숨을 건졌는지 셀 수도 없다고 말한다.' },
  battlefield_salve:{ name:'전장 연고',     icon:'🩹', desc:'급조한 지혈 연고. 격전지에서만 구할 수 있다.',
    lore:'제대로 된 재료도 없이 전장에서 급히 짜낸 연고. 정식 처방과는 거리가 멀지만, 피가 멎지 않는 순간에는 이것만한 게 없다는 걸 싸움터의 치유사들은 몸으로 배운다.' },
  plague_root:     { name:'역병뿌리',       icon:'🦠', desc:'역병 지역에서만 자라는 위험하지만 강력한 약초.',
    lore:'역병이 휩쓸고 간 자리에서만 자란다는 기이한 뿌리. 독이면서 동시에 약이라는 모순된 평판을 갖고 있다. 다루는 법을 아는 자와 모르는 자의 차이가 생사를 가른다.' },
  holy_water:      { name:'축성수',         icon:'✨', desc:'신전에서 축성한 성수. 저주와 독을 정화한다.',
    lore:'신전에서 정식으로 축성한 물. 단순한 정화 이상의 힘이 있다고 하는데, 정작 그 힘이 신앙에서 오는지 물 자체에서 오는지는 사제들 사이에서도 의견이 갈린다.' },
  forbidden_herb:  { name:'금단의 영초',    icon:'🌑', desc:'꺼져가는 목숨을 붙잡는 데 쓰인다는 위험한 약초.',
    lore:'죽음의 문턱에 선 이의 숨을 잠시 붙잡아 둔다는 전설의 약초. 대부분의 치유사는 이 재료를 다루는 법조차 모르고, 안다 해도 함부로 손대지 않는다 — 그 대가를 아는 노스승들만이 간혹 이걸 손에 쥔다고 한다.' },
  royal_elixir_base:{ name:'궁정 영약 원료', icon:'👑', desc:'귀족가에서만 유통되는 희귀한 치유 원료.',
    lore:'평민에게는 평생 구경도 못할 값비싼 원료. 귀족들의 병은 다르게 다뤄져야 한다는 믿음 아래, 이 재료를 둘러싸고 은밀한 뒷거래가 오간다는 소문이 있다.' },
  ancient_remedy:  { name:'고대 의술서 조각', icon:'📜', desc:'잊혀진 의술의 파편. 유적에서만 발견된다.',
    lore:'지금은 실전된 의술의 기록 일부. 남아있는 문장은 단편적이지만, 그 안에는 오늘날의 의술로는 재현할 수 없는 무언가가 담겨 있는 듯하다.' },
};

export const REMEDY_SITES = [
  { id:'village_clinic', name:'마을 진료소', icon:'🏘️', risk:1, cost:0,
    matPool:['wild_herb','clean_water'],
    bpTierPool:['common'],
    desc:'평범한 마을 사람들을 돌본다. 위험은 없지만 얻는 소재도 소박하다.' },
  { id:'battlefield_aid', name:'격전지 야전 구호소', icon:'⚔️', risk:2, cost:15,
    matPool:['battlefield_salve','wild_herb','clean_water'],
    bpTierPool:['common','uncommon'],
    desc:'싸움이 끝나지 않은 전장 근처. 부상자가 끊이지 않지만 위험도 그만큼 크다.' },
  { id:'plague_district', name:'역병 격리 구역', icon:'🦠', risk:3, cost:30,
    matPool:['plague_root','holy_water','battlefield_salve'],
    bpTierPool:['uncommon','rare'],
    desc:'전염병이 도는 격리 구역. 자신도 감염될 위험을 감수해야 한다.' },
  { id:'noble_estate', name:'귀족가 왕진', icon:'👑', risk:4, cost:50,
    matPool:['royal_elixir_base','forbidden_herb','ancient_remedy'],
    bpTierPool:['rare','legendary'],
    desc:'권력자의 은밀한 병을 봐달라는 요청. 위험한 비밀과 마주칠 수 있다.' },
];

export const REMEDY_LORE_SHOP = {
  remedy_field_dressing: { name:'야전 응급처치법 처방',   icon:'📋', rarity:'common',    howToGet:['gather'], dropTier:'common' },
  remedy_fever_tonic:    { name:'해열 탕약 처방',         icon:'📋', rarity:'common',    howToGet:['gather'], dropTier:'common' },
  remedy_wound_seal:     { name:'상처 봉합술 처방',       icon:'📋', rarity:'uncommon',  howToGet:['gather'], dropTier:'uncommon' },
  remedy_plague_cure:    { name:'역병 완화제 처방',       icon:'📋', rarity:'uncommon',  howToGet:['gather'], dropTier:'uncommon' },
  remedy_blood_revival:  { name:'혈맥 소생술 처방',       icon:'📋', rarity:'rare',      howToGet:['gather'], dropTier:'rare' },
  remedy_curse_cleanse:  { name:'저주 정화법 처방',       icon:'📋', rarity:'rare',      howToGet:['gather'], dropTier:'rare' },
  remedy_royal_panacea:  { name:'궁정 만병통치약 처방',   icon:'📋', rarity:'legendary', howToGet:['gather'], dropTier:'legendary' },
  remedy_lost_art:       { name:'실전된 의술 처방',       icon:'📋', rarity:'legendary', howToGet:['gather'], dropTier:'legendary' },
};

export const ALCHEMY_MATERIALS = {
  common_reagent:  { name:'평범한 시약',     icon:'🧪', desc:'어느 실험실에나 있는 기본 시약.',
    lore:'어느 연금술사의 작업대에나 굴러다니는 흔한 시약. 하지만 아무리 흔해도 다루는 손에 따라 결과물은 천차만별이라는 게 이 업계의 오래된 격언이다.' },
  crystal_dust:    { name:'결정 가루',       icon:'✨', desc:'마력이 옅게 깃든 결정을 갈아 만든 가루.',
    lore:'결정을 곱게 갈아낸 가루. 원래의 결정보다 다루기는 쉬워지지만 그만큼 힘도 옅어진다. 무엇을 얻으려면 무엇을 잃어야 한다는 걸 이 가루만큼 잘 보여주는 재료도 없다.' },
  toxic_spore:     { name:'맹독 포자',       icon:'☠️', desc:'독지대에서만 채집되는 위험한 포자.',
    lore:'숨만 잘못 들이켜도 위험한 포자지만, 정제하면 독이 오히려 약이 된다. 연금술사들이 유독 이 재료 앞에서 신중해지는 이유는 그 경계가 종이 한 장 차이이기 때문이다.' },
  ruin_residue:    { name:'유적 잔재물',     icon:'🏺', desc:'고대 실험의 흔적이 남은 잔재물.',
    lore:'까마득한 옛날, 이곳에서 무언가를 만들려던 자들이 남긴 흔적. 무엇을 만들려 했는지는 알 수 없지만, 잔재물에 남은 마력의 결이 심상치 않다.' },
  void_essence:    { name:'공허 정수',       icon:'🌑', desc:'차원의 균열 근처에서만 채집되는 불안정한 정수.',
    lore:'존재와 부재의 경계에 걸쳐 있는 듯한 불안정한 정수. 다루는 이의 실력이 조금이라도 부족하면 그릇째로 사라져버린다는 이야기가 있다.' },
  forbidden_flesh: { name:'금단의 표본',     icon:'🩸', desc:'출처를 묻지 않는 것이 나은 위험한 표본.',
    lore:'어디서 왔는지 캐묻지 않는 게 서로에게 좋다는 암묵적인 규칙이 있는 재료. 죽음의 경계를 연구하는 이들 사이에서 은밀히 거래된다는 소문만 무성할 뿐, 그 출처를 아는 이는 극히 드물다.' },
  philosopher_dust:{ name:'현자의 가루',     icon:'⚗️', desc:'현자의 돌에 근접한 희귀 촉매 가루.',
    lore:'전설의 현자의 돌에는 미치지 못하지만, 그에 근접한 힘을 지녔다는 촉매. 이 가루를 다루다 보면 어느 순간 "물질의 한계" 너머를 넘보게 된다는 오래된 경고가 연금술사 길드에 전해진다.' },
  lost_formula:    { name:'실전된 공식 조각', icon:'📜', desc:'잊혀진 연금 공식의 파편.',
    lore:'완전한 형태로는 전해지지 않는, 잃어버린 연금 공식의 조각. 이걸 온전히 재현해낸 자는 지금까지 단 한 명뿐이라는 이야기가 있는데, 그 이름은 좀처럼 함부로 입에 오르내리지 않는다.' },
};

export const ALCHEMY_SITES = [
  { id:'abandoned_lab', name:'버려진 실험실', icon:'🏚️', risk:1, cost:0,
    matPool:['common_reagent','crystal_dust'],
    bpTierPool:['common'],
    desc:'오래전 버려진 소규모 실험실. 위험은 없지만 재료도 소박하다.' },
  { id:'toxic_marsh',   name:'독지대 습원',   icon:'☠️', risk:2, cost:15,
    matPool:['toxic_spore','crystal_dust','common_reagent'],
    bpTierPool:['common','uncommon'],
    desc:'독기가 자욱한 습지. 채집 중 중독될 위험이 있다.' },
  { id:'ancient_ruin_lab', name:'고대 연구 유적', icon:'🏛️', risk:3, cost:30,
    matPool:['ruin_residue','void_essence','philosopher_dust'],
    bpTierPool:['uncommon','rare'],
    desc:'고대 연금술사들의 유적. 귀중한 재료가 많지만 알 수 없는 위험이 도사린다.' },
  { id:'forbidden_vault', name:'금지된 지하 창고', icon:'🌑', risk:4, cost:50,
    matPool:['void_essence','forbidden_flesh','lost_formula'],
    bpTierPool:['rare','legendary'],
    desc:'길드조차 존재를 부인하는 창고. 가장 희귀한 재료가 있지만, 그 출처를 묻지 않아야 한다.' },
];

export const FORMULA_LORE_SHOP = {
  formula_basic_catalyst: { name:'기초 촉매 비법',       icon:'📗', rarity:'common',    howToGet:['gather'], dropTier:'common' },
  formula_purify_reagent: { name:'시약 정제 비법',       icon:'📗', rarity:'common',    howToGet:['gather'], dropTier:'common' },
  formula_toxin_control:  { name:'독성 제어 비법',       icon:'📗', rarity:'uncommon',  howToGet:['gather'], dropTier:'uncommon' },
  formula_crystal_infuse: { name:'결정 주입 비법',       icon:'📗', rarity:'uncommon',  howToGet:['gather'], dropTier:'uncommon' },
  formula_void_binding:   { name:'공허 결속 비법',       icon:'📗', rarity:'rare',      howToGet:['gather'], dropTier:'rare' },
  formula_ruin_synthesis: { name:'유적 합성 비법',       icon:'📗', rarity:'rare',      howToGet:['gather'], dropTier:'rare' },
  formula_philosophers:   { name:'현자의 돌 근사 비법', icon:'📗', rarity:'legendary', howToGet:['gather'], dropTier:'legendary' },
  formula_lost_art:       { name:'실전된 연금술 비법',   icon:'📗', rarity:'legendary', howToGet:['gather'], dropTier:'legendary' },
};

export const EXPERIMENT_YIELD_BY_RARITY = { common:1, uncommon:2, rare:3, legendary:5 };

export const NETWORK_TYPES = {
  bard:     { name:'음유시인',  icon:'🎵', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/><path d="M9.5 18 L9.5 6 L19.5 4 L19.5 16" /></svg>', color:'#c060a0', estCost:60 },
  merchant: { name:'상인',      icon:'💰', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" stroke-width="1.4"/><path d="M12 7.5 L12 16.5 M9.5 9.3 C9.5 8.2 10.5 7.5 12 7.5 C13.5 7.5 14.5 8.3 14.5 9.4 C14.5 10.6 13.5 11 12 11.3 C10.5 11.6 9.5 12.2 9.5 13.4 C9.5 14.5 10.5 15.3 12 15.3 C13.5 15.3 14.5 14.6 14.5 13.5" stroke-width="1.2"/></svg>', color:'#c0a030', estCost:120 },
};
