// 1. 마스터 데이터 — data
// Pure data split out of misc/090-1-마스터-데이터.js (see generate.js).

export const RELIGIONS = {
  temple: {
    id:'temple', name:'순환의 사원', icon:'⛪', color:'#c8a96e',
    doctrine:'영혼은 세계수로 돌아가 윤회한다',
    greeting:'세계수의 축복을',
    factionAllies:['왕국 기사단','이단 심문소'],
    factionRivals:['마법사 협회','암흑 결사'],
    evangelMethods:['설교','기적','자선','성지건립','논쟁토론'],
    jobTree:['cleric','paladin','exorcist','oracle','archbishop'],
    secret:'고위 성직자 일부가 루프 자각자. 지하 문서고에 루프 탈출 금서 존재.',
    weaknesses:'기득권 집착·개혁 거부',
    npcReaction:'신앙심 있는 자에게 따뜻함. 타락한 자에겐 적대적.',
  },
  solar: {
    id:'solar', name:'태양의 성전', icon:'☀️', color:'#e8a030',
    doctrine:'태양신의 율법 아래 질서와 정의를 세워라. 빛 아래 모든 악은 드러난다',
    greeting:'태양의 빛으로',
    factionAllies:['신성 제국 귀족','이단 심문소'],
    factionRivals:['마법사 협회','뿌리 신앙'],
    evangelMethods:['이단고발','성전선포','율법집전'],
    jobTree:['cleric','solar_priest','crusader','inquisitor'],
    secret:'일부 고위 성직자가 태양신의 심판을 정적 제거에 남용 중.',
    weaknesses:'강압적이라 민심 반감. 순환의 사원과 주도권 경쟁.',
    npcReaction:'귀족·군인에게 우호적. 이단·마법 사용자에게 적대적.',
  },
  roots: {
    id:'roots', name:'뿌리 신앙', icon:'🌿', color:'#60a840',
    doctrine:'대지의 조상신과 자연령을 섬겨라. 진짜 순환은 자연 안에 있다',
    greeting:'뿌리가 기억한다',
    factionAllies:['북부 부족','농촌 공동체'],
    factionRivals:['태양의 성전','이단 심문소'],
    evangelMethods:['점술','자연치유의식','부족축제','꿈해몽'],
    jobTree:['wanderer','shaman','tribal_mage','grand_shaman'],
    secret:'고대 세계수와 직접 연결된 신관 존재. 순환의 사원보다 더 근원에 가까울 수 있음.',
    weaknesses:'조직화 약함. 도시에선 미신으로 취급됨.',
    npcReaction:'농촌·자연 지역 NPC에게 환영. 도시 귀족에게 냉대.',
  },
  abyss: {
    id:'abyss', name:'심연의 계시', icon:'😈', color:'#8030c0',
    doctrine:'욕망은 힘의 원천. 계약만이 진정한 자유다',
    greeting:'(비밀 암호로만 접촉)',
    factionAllies:['암흑 결사','불사 군단'],
    factionRivals:['순환의 사원','태양의 성전','이단 심문소'],
    evangelMethods:['힘제공계약','절망접근','진실은폐'],
    jobTree:['dark_priest','pact_mage','abyss_evangelist','abyss_apostle'],
    secret:'신자들은 마계 하수인이 된다는 사실 모름. 최고위층만 알고 이미 돌이킬 수 없음.',
    weaknesses:'지속 사용할수록 마계 종속.',
    npcReaction:'절망·타락한 NPC에게 접근. 신앙심 높은 NPC에게 적대적.',
    hiddenInMap:true,
  },
};

export const DEFAULT_RELIGION_SHARE = {
  central:    {temple:64, solar:20, roots:8,  abyss:8},
  north:      {temple:35, solar:10, roots:50, abyss:5},
  south:      {temple:30, solar:55, roots:5,  abyss:10},
  east:       {temple:50, solar:25, roots:15, abyss:10},
  west:       {temple:45, solar:30, roots:15, abyss:10},
  northeast:  {temple:40, solar:10, roots:45, abyss:5},
  southeast:  {temple:35, solar:20, roots:25, abyss:20},
  northwest:  {temple:55, solar:15, roots:25, abyss:5},
  abyss_realm:{temple:0,  solar:0,  roots:0,  abyss:100},
};

export const TENSION_STAGES = [
  {level:0, desc:'평화', icon:'☮️'},
  {level:1, desc:'길거리 언쟁·설교 방해·소규모 시위', icon:'😤'},
  {level:2, desc:'성직자 습격·성물 파괴·폭동', icon:'⚡'},
  {level:3, desc:'민병대 무장 충돌·성지 봉쇄', icon:'⚔️'},
  {level:4, desc:'종교전쟁 발발', icon:'🔥'},
];

export const EVANGEL_ACTIONS = {
  설교:     {stat:'fath',stat2:'spk', effect:10, location_bonus:['shrine','capital','town'], desc:'광장·신전에서 2배'},
  기적:     {stat:'fath',           effect:30, difficulty:'hard', desc:'실패 시 신뢰 타격'},
  자선:     {gold:50,               effect:8,  gradual:true,     desc:'즉각 개종 아님. 호감 축적'},
  이단고발:  {stat:'rep',stat2:'int', effect:-15, target:'rival',  desc:'상대 종교 신도 이탈 유도. 역효과 위험'},
  성지건립:  {gold:300,             effect:20, permanent:true,   desc:'지역 영향력 고정 확보'},
  논쟁토론:  {stat:'int',stat2:'spk', effect:12, target:'noble',   desc:'지식인·귀족층 개종'},
  힘제공계약:{stat:'neg',stat2:'fear',effect:25, religion:'abyss', desc:'즉각 능력 상승 → 신자 흡수'},
  절망접근:  {stat:'per',           effect:20, religion:'abyss', trigger:'npc_crisis'},
  진실은폐:  {stat:'disg',stat2:'int',effect:15, religion:'abyss', desc:'타락 사실 숨기며 확산'},
};

export const PEACE_ROUTES = {
  council:    {name:'교리 대논쟁',    req:'REP 50+ + 양측 인맥',    result:'승리 종교가 15% 흡수'},
  common_foe: {name:'공통의 적',      req:'세계 위협 발생',           result:'임시 휴전 동맹'},
  marriage:   {name:'혼인 동맹',      req:'고위 성직자 가문 NPC',     result:'통합파 소규모 신파 탄생'},
  heresy_pact:{name:'이단 분리 조약', req:'공동 이단 세력 존재',      result:'긴장도 -2'},
  territory:  {name:'성지 분할 협약', req:'NEG 고난이도',             result:'지역별 관할 구역 분리'},
  syncretism: {name:'교리 혼합',      req:'다회차 공존',              result:'제5 혼합 종파 탄생'},
};
