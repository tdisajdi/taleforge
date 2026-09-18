// 🏷️  악마족 진명 시스템 (Demon True Name) — data
// Pure data split out of race/028-악마족-진명-시스템-Demon-True-Name.js (see generate.js).

export const TRUENAME_INTEGRITY_STAGES = [
  { min:90, max:100, name:"완전한 이름",   icon:"⭐", color:"#ffd700",
    desc:"진명이 완전히 온전하다. 최대의 힘을 발휘한다.",
    bonus:{neg:15, fear:12, mgc:10, cha:10}, penalty:{},
    aiHint:"진명이 완전한 악마. 강력한 존재감과 권위가 넘쳐흐른다." },
  { min:70, max:89,  name:"미미한 균열",   icon:"🌟", color:"#c8a96e",
    desc:"이름에 작은 균열이 생겼다. 아직 힘은 충분하다.",
    bonus:{neg:10, fear:8, mgc:7, cha:7}, penalty:{},
    aiHint:"이름에 아주 미세한 균열이 있다. 예민한 존재라면 감지할 수 있다." },
  { min:50, max:69,  name:"이름의 흔들림", icon:"✨", color:"#d4a060",
    desc:"진명이 흔들리기 시작했다. 강한 존재가 이름을 인식한다.",
    bonus:{neg:5, fear:4, mgc:4, cha:4}, penalty:{wil:-5},
    aiHint:"이름이 흔들린다. 강한 악마나 신성 존재가 이 약점을 감지한다." },
  { min:30, max:49,  name:"파편의 낙하",   icon:"💫", color:"#b07040",
    desc:"이름의 파편이 심연으로 떨어지고 있다. 힘이 급격히 약해진다.",
    bonus:{mgc:2}, penalty:{neg:-8, fear:-7, cha:-6, wil:-10},
    aiHint:"이름 파편이 흘러내린다. 이 악마를 아는 존재라면 이름을 이용해 지배하려 든다." },
  { min:10, max:29,  name:"이름의 붕괴",   icon:"⚠️", color:"#c05030",
    desc:"진명이 붕괴 직전이다. 동족에게서 추방 위협을 받는다.",
    bonus:{}, penalty:{neg:-18, fear:-15, cha:-14, wil:-18, mgc:-10},
    aiHint:"이름이 거의 무너졌다. 동족 악마들이 이 약점을 이용하거나 내쫓으려 한다." },
  { min:0,  max:9,   name:"이름 없는 자",  icon:"💀", color:"#e03020",
    desc:"진명이 완전히 소실됐다. 심연으로 추방될 위기.",
    bonus:{}, penalty:{neg:-30, fear:-26, cha:-25, wil:-30, mgc:-20, rep:-20},
    aiHint:"이름이 소멸했다. 동족 악마들이 이 존재를 추방하거나 포획하려 한다." },
];

export const TRUENAME_EVENTS = [
  { id:"break_oath",   label:"계약 위반",   icon:"💔", dmg:20, desc:"스스로 계약을 어겨 이름 파편이 떨어진다." },
  { id:"revealed",     label:"이름 노출",   icon:"👁️", dmg:15, desc:"진명을 적에게 들켰다. 이름이 흔들린다." },
  { id:"purify_light", label:"신성 세례",   icon:"☀️", dmg:12, desc:"신성한 빛에 이름이 타들어간다." },
  { id:"restore_vow",  label:"맹세 이행",   icon:"🤝", dmg:-15, desc:"계약을 완벽히 이행해 이름이 강화된다." },
  { id:"name_seal",    label:"이름 봉인",   icon:"🔯", dmg:-20, desc:"의식으로 이름을 봉인 강화한다. HP -20 소모." },
  { id:"capture_name", label:"진명 포획 시도", icon:"🎯", dmg:0, desc:"적의 진명을 탈취 시도한다." },
];

export const CORRUPTION_LEVELS = [
  { level:0, label:"맑음",           threshold:0,  symptom:null,                                    penalty:null },
  { level:1, label:"경미한 혼란",    threshold:15, symptom:"가끔 전생과 현재를 혼동한다.",          penalty:"특정 판정 -5" },
  { level:2, label:"중간 오염",      threshold:30, symptom:"현재 NPC를 전생 NPC로 착각하는 일이 잦다.", penalty:"NPC 대화 판정 -10" },
  { level:3, label:"심한 오염",      threshold:50, symptom:"전투 중 환각이 보인다.",                 penalty:"전투 판정 -15, 가끔 행동 불능" },
  { level:4, label:"위험 수준",      threshold:70, symptom:"현실과 과거 구분이 거의 불가능하다.",   penalty:"모든 판정 -20, 치료 필수" },
  { level:5, label:"정신 붕괴",      threshold:90, symptom:"완전한 정신 붕괴. 즉각 치료하지 않으면 게임오버.", penalty:"행동 불능" },
];

export const CINEMA_SCENES = [
  { id:"great_battle",   icon:"⚔️", title:"전설의 전투",    skill:"전투 숙련도 +20",       trigger:"전장·결투 장소" },
  { id:"grand_speech",   icon:"🎤", title:"운명의 연설",    skill:"웅변 숙련도 +20",       trigger:"광장·집회 장소" },
  { id:"secret_meeting", icon:"🤫", title:"비밀 회동",      skill:"잠입 숙련도 +20",       trigger:"어두운 장소·지하" },
  { id:"healing_moment", icon:"💚", title:"치유의 순간",    skill:"치유 숙련도 +20",       trigger:"신전·치료소" },
  { id:"forbidden_magic",icon:"🔮", title:"금기의 마법",    skill:"마법 숙련도 +20",       trigger:"마법진·연구실" },
  { id:"last_stand",     icon:"🌅", title:"마지막 사수",    skill:"의지력 숙련도 +20",     trigger:"막다른 곳·절벽" },
  { id:"discovery",      icon:"💡", title:"진실의 발견",    skill:"탐색 숙련도 +20",       trigger:"도서관·유적" },
];

export const AUCTIONABLE_MEMORIES = [
  { id:"first_love",   label:"첫사랑의 기억",    sellPrice:"골드 500 + CHA +5", cost:"로맨스 계통 판정 -10 영구" },
  { id:"worst_defeat", label:"최악의 패배 기억", sellPrice:"STR +8 즉시",       cost:"패배 공포 트라우마 소멸" },
  { id:"childhood",    label:"행복한 어린 시절", sellPrice:"운 +10 영구",       cost:"낙관적 판단력 영구 감소" },
  { id:"best_victory", label:"최고의 승리 기억", sellPrice:"골드 1000",         cost:"승리 감각 둔화, 전투 쾌감 감소" },
  { id:"true_friend",  label:"진정한 우정의 기억", sellPrice:"WIL +5 영구",    cost:"우정 관련 NPC 신뢰 감소" },
];

export const CYBER_IMPLANTS = [
  { id:"neural_link",  icon:"🧠", name:"신경 링크",    bonus:"해킹 판정 +20, AI 대화 가능" },
  { id:"arm_blade",    icon:"⚔️", name:"팔 블레이드",  bonus:"근접 전투 +15, 은닉 무기" },
  { id:"eye_scanner",  icon:"👁️", name:"스캐너 눈",    bonus:"대상 분석 즉시, 약점 파악" },
  { id:"speed_legs",   icon:"🦿", name:"가속 다리",    bonus:"이동 속도 +30, 도주 판정 +20" },
  { id:"shield_gen",   icon:"🛡️", name:"실드 발생기",  bonus:"총기 피해 -30%, 물리 방어 상승" },
];

export const SWORD_TECHNIQUES = [
  { id:"killing_edge",    name:"살인검",     power:"적 HP 30% 즉시 감소",        condition:"HP 20% 이하" },
  { id:"wind_step",       name:"풍뢰보",     power:"전투 이탈 확정 성공",         condition:"포위 상황" },
  { id:"iron_defense",    name:"철벽방어",   power:"다음 3회 피해 무효",          condition:"연속 피격" },
  { id:"soul_slash",      name:"혼절검",     power:"대상 정신력 공격, 혼절 확률", condition:"정신 전투" },
  { id:"final_form",      name:"절명일격",   power:"현재 HP 비례 최대 피해",      condition:"생사의 기로" },
];

export const KINGDOM_TYPES = [
  { id:"kingdom",   icon:"👑", name:"왕국",       legacy:30, descendantTitle:"왕가의 후예",  boon:"귀족 NPC 자동 호감, 성 접근 가능" },
  { id:"knighthood",icon:"⚔️", name:"기사단",     legacy:20, descendantTitle:"기사단의 후예", boon:"기사 NPC 동료 합류 확률 상승" },
  { id:"merchant_guild",icon:"💰",name:"상인 연맹",legacy:15, descendantTitle:"연맹의 후예",  boon:"거래 가격 -25%, 상인 정보망" },
  { id:"mage_tower", icon:"🗼", name:"마법탑",     legacy:25, descendantTitle:"마법탑 계승자",boon:"마법 관련 NPC 즉시 신뢰, 고급 마법 열람" },
  { id:"holy_order", icon:"✝️", name:"성기사단",   legacy:25, descendantTitle:"성인의 후예",  boon:"신성 관련 판정 +15, 악마 퇴치 권한" },
];

export const GUILD_RANKS = [
  { rank:0, label:"신입",    knowledge:"루프 기초 — 환생 시스템 개요" },
  { rank:1, label:"견습",    knowledge:"패턴 공유 — 반복되는 이벤트 목록" },
  { rank:2, label:"정회원",  knowledge:"세계 비밀 — 대미스터리 힌트 3개" },
  { rank:3, label:"장로",    knowledge:"루프 탈출 조건 — 해탈 엔딩 힌트" },
  { rank:4, label:"수장 대리", knowledge:"감시자의 정체 — 진짜 세계의 지배자" },
];

export const DEATH_DEAL_OPTIONS = [
  { id:"memory",    sacrifice:"기억 일부 소멸",  grant:"즉시 부활 + HP 50% 회복" },
  { id:"skill",     sacrifice:"스킬 1개 망각",   grant:"즉시 부활 + HP 30% 회복" },
  { id:"bond",      sacrifice:"인연 1명 기억 소멸", grant:"즉시 부활 + HP 70% 회복" },
  { id:"lifespan",  sacrifice:"다음 회차 수명 감소", grant:"즉시 부활 + HP 100% 회복" },
];

export const WORLD_WILLS = [
  { id:"heroism",   icon:"⚡", will:"영웅의 의지",   desc:"세계가 영웅을 원한다. 영웅적 행동에 강력한 보상.", flow:"정의·희생·용기의 이벤트 집중" },
  { id:"chaos",     icon:"🌀", will:"혼돈의 의지",   desc:"세계가 변화를 원한다. 예측 불가능한 이벤트 연속.", flow:"반전·배신·급변의 이벤트 집중" },
  { id:"balance",   icon:"⚖️", will:"균형의 의지",   desc:"세계가 균형을 원한다. 극단적 선택에 페널티.",      flow:"중립·조화·공존의 이벤트 집중" },
  { id:"darkness",  icon:"🌑", will:"어둠의 의지",   desc:"세계가 어둠에 물들어 있다. 악을 이용하면 이득.",   flow:"공포·음모·배신의 이벤트 집중" },
  { id:"mystery",   icon:"🔮", will:"신비의 의지",   desc:"세계가 숨겨진 진실을 드러내려 한다.",              flow:"비밀·발견·계시의 이벤트 집중" },
  { id:"rebirth",   icon:"🌅", will:"재생의 의지",   desc:"세계가 새로운 시작을 원한다. 변화와 성장의 시기.", flow:"성장·각성·극복의 이벤트 집중" },
];

export const DEATH_EYE_LEVELS = [
  { level:0, deaths:0,   label:"봉인",          ability:"없음" },
  { level:1, deaths:50,  label:"사안 개안",      ability:"상대 HP 대략 파악 + 치명상 위치 감지" },
  { level:2, deaths:100, label:"사안 강화",      ability:"상대 HP 수치 + 예상 사망 원인 1개" },
  { level:3, deaths:200, label:"사안 완성",      ability:"상대 HP·방어·약점 전체 + 사망 확률 %로 표시" },
  { level:4, deaths:500, label:"죽음의 신 각성",  ability:"모든 생명체의 수명 감지. 운명의 죽음을 미리 안다." },
];

export const NATURAL_LAW_MUTATIONS = [
  { stage:1,  cycle:5,  law:"마법 친화력 증가",   desc:"마법이 전보다 조금 더 잘 발동된다.",                    effect:"마법 판정 +5" },
  { stage:2,  cycle:10, law:"시간 감각 이상",     desc:"위기 순간 시간이 느리게 흐르는 것처럼 느껴진다.",       effect:"위기 판정 추가 시간" },
  { stage:3,  cycle:15, law:"중력 희박화",        desc:"몸이 예전보다 가볍다. 도약력과 이동성이 향상됐다.",      effect:"이동 관련 판정 +8" },
  { stage:4,  cycle:20, law:"존재감 희박화",      desc:"세계가 당신의 존재를 완전히 인식하지 못하기 시작한다.", effect:"기습 피격 확률 -20%" },
  { stage:5,  cycle:30, law:"인과율 이완",        desc:"원인과 결과가 느슨해진다. 불가능이 가능해지는 순간들.", effect:"판정 실패를 1회 재시도" },
  { stage:6,  cycle:40, law:"현실 재작성",        desc:"강한 의지로 현실의 일부를 임시로 바꿀 수 있다.",        effect:"1회/회차 서사 분기 변경" },
  { stage:7,  cycle:50, law:"세계와의 합일 시작", desc:"당신과 세계의 경계가 흐릿해진다. 모든 것이 연결된다.", effect:"모든 판정 +10, 해탈 루트 개방" },
];
