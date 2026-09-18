// ── 41~50번 시스템 ── — data
// Pure data split out of misc/017-4150번-시스템.js (see generate.js).

export const DREAM_TYPES = [
  { id:"flood",    icon:"🌊", keyword:"물",   prophecy:"거대한 물결이 모든 것을 삼키는 꿈. 홍수 혹은 압도적인 힘의 충돌이 예고된다." },
  { id:"fire",     icon:"🔥", keyword:"불",   prophecy:"불길 속에서 무언가가 태어나는 꿈. 시련 뒤에 변혁이 기다린다." },
  { id:"mirror",   icon:"🪞", keyword:"거울", prophecy:"거울 속 자신이 다르게 보이는 꿈. 정체성의 위기 혹은 이중성과 맞닥뜨린다." },
  { id:"tower",    icon:"🗼", keyword:"탑",   prophecy:"무너지는 탑 꿈. 오만이나 과도한 야망이 붕괴를 부른다." },
  { id:"star",     icon:"⭐", keyword:"별",   prophecy:"별이 떨어지는 꿈. 위대한 존재의 종말 혹은 새로운 시대의 시작." },
  { id:"void",     icon:"🌑", keyword:"어둠", prophecy:"아무것도 없는 어둠 속에서 목소리가 들리는 꿈. 잊혀진 진실이 입을 연다." },
  { id:"child",    icon:"👶", keyword:"아이", prophecy:"웃는 아이의 꿈. 순수함 혹은 새로운 시작이 열쇠가 된다." },
  { id:"labyrinth",icon:"🌀", keyword:"미로", prophecy:"끝없는 미로를 헤매는 꿈. 선택지마다 함정이 숨어있을 수 있다." },
];

export const BUILDING_TYPES = {
  tavern:    { icon:"🍺", label:"선술집",    ruinDesc:"폐허가 된 선술집. 벽에 이전 주인의 이름이 희미하게 새겨져 있다.", bonus:"상인·여행자 NPC 친화도 +10" },
  fortress:  { icon:"🏰", label:"요새",      ruinDesc:"허물어진 요새. 전략적 요충지로 가끔 언급된다.", bonus:"방어 전투 시 병력 보너스 가능" },
  library:   { icon:"📚", label:"도서관",    ruinDesc:"불탄 도서관의 잔해. 일부 서적이 남아있을 수 있다.", bonus:"지식 탐색 시 단서 +1" },
  guild:     { icon:"⚔️", label:"길드",      ruinDesc:"해산된 모험가 길드의 흔적. 구성원의 후손이 살아있다.", bonus:"길드 관련 퀘스트 등장 확률 상승" },
  temple:    { icon:"⛪", label:"신전",      ruinDesc:"오래된 신전. 지역민이 여전히 제물을 올린다.", bonus:"신앙 판정 +10, 은신처 제공" },
  village:   { icon:"🏘️", label:"마을",      ruinDesc:"개척한 마을이 작은 도시로 성장했다.", bonus:"마을 주민 초기 호감도 +20" },
  ship:      { icon:"⛵", label:"선단",      ruinDesc:"해적·상단의 전설로 남은 선단.", bonus:"항해·해상 루트 정보 획득 가능" },
};

export const ROLE_TO_MASK = {
  "상인":    { icon:"💰", masquerade:"상인 행세",     bonus:"상거래·가격 협상 시 유리한 위치, 상인 신뢰도 높음" },
  "기사":    { icon:"🛡️", masquerade:"기사 행세",     bonus:"귀족·군인 NPC에게 신뢰도 +15, 위기 시 리더십 발휘" },
  "마법사":  { icon:"🔮", masquerade:"학자 행세",     bonus:"마법 지식 판정 우대, 마법사 조합 접근 가능" },
  "도적":    { icon:"🗡️", masquerade:"도적 행세",     bonus:"지하조직 정보 접근, 잠금장치 관련 판정 +10" },
  "사제":    { icon:"⛪", masquerade:"성직자 행세",   bonus:"민간인 신뢰도 +20, 치유·축복 서비스 요청 가능" },
  "음유시인":{ icon:"🎵", masquerade:"음유시인 행세", bonus:"어느 세력에도 자연스럽게 접근, 소문 수집 용이" },
  "용병":    { icon:"⚔️", masquerade:"용병 행세",     bonus:"용병 조합 정보망 활용, 분쟁 지역 자유 이동" },
};

export const EMOTION_RIPPLE_DEFS = {
  joy:     { icon:"✨", label:"기쁨의 파문",  worldEffect:"그 지역에 번영의 기운이 감돈다. 축제나 결혼식 같은 경사가 잦다.", bonus:"해당 세계관에서 우호적 이벤트 확률 +15%" },
  rage:    { icon:"🔥", label:"분노의 파문",  worldEffect:"땅에 균열이 생기거나 폭풍이 잦아졌다. 분쟁과 갈등이 끊이지 않는다.", bonus:"전투 이벤트 빈도 상승, 적 드롭 +10%" },
  sorrow:  { icon:"🌧️", label:"슬픔의 파문", worldEffect:"그 지역에 안개가 걷히지 않는다. 사람들이 이유 모를 그리움을 느낀다.", bonus:"감성적 선택지 등장, 슬픔 관련 NPC 공감 +20%" },
  fear:    { icon:"🌑", label:"공포의 파문",  worldEffect:"지역민이 이유 없이 두려워한다. 밤에 외출을 삼간다.", bonus:"공포 판정 시 적 위축 효과 발생 가능" },
  pride:   { icon:"👑", label:"자부심의 파문",worldEffect:"영웅 전설이 구전으로 퍼졌다. 민중이 이름 없는 영웅을 기린다.", bonus:"평판 판정 +10, 영웅 호칭 획득 가능" },
  despair: { icon:"💀", label:"절망의 파문",  worldEffect:"그 지역 사람들은 체념한 얼굴이다. 희망을 주면 강렬하게 반응한다.", bonus:"희망 관련 선택지 강화, 역경 극복 서사 보정" },
};

export const TESTAMENT_TONES = {
  heroic:   { icon:"⚔️", label:"영웅의 유언",   hint:"이 세계 어딘가에 전생의 영웅이 남긴 유서가 묻혀있다. 발견 시 용기를 주는 메시지와 함께 유물이 함께 발견된다." },
  regretful:{ icon:"😔", label:"후회의 유언",   hint:"전생의 미완 과업을 암시하는 쪽지가 폐허에서 발견될 수 있다. 해결 시 카르마 보너스." },
  vengeful: { icon:"🗡️", label:"복수의 유언",   hint:"전생의 원한을 담은 유서. 특정 악당 혹은 세력에 대한 경고와 약점 정보가 담겨있다." },
  hopeful:  { icon:"🌅", label:"희망의 유언",   hint:"세계에 대한 희망을 담은 유서. 어두운 순간에 NPC가 이 유서를 언급하며 플레이어를 고무시킨다." },
  cryptic:  { icon:"🔮", label:"수수께끼 유언", hint:"해독해야 하는 암호화된 유서. 핵심 비밀로 향하는 열쇠를 담고 있다." },
};

export const CONSTELLATIONS = [
  { id:"aries",     icon:"♈", name:"양자리",   trait:"개척자",  bonus:"처음 도전하는 행동에 판정 보너스 +15",          challenge:"익숙한 것에 안주하면 불운이 따른다." },
  { id:"taurus",    icon:"♉", name:"황소자리", trait:"수호자",  bonus:"방어·생존 판정 우대, HP 최대치 +5",              challenge:"변화에 저항하면 기회를 놓친다." },
  { id:"gemini",    icon:"♊", name:"쌍둥이자리",trait:"사기꾼", bonus:"변장·협상·정보 수집 판정 +10",                   challenge:"이중적 행동이 신뢰를 해칠 수 있다." },
  { id:"cancer",    icon:"♋", name:"게자리",   trait:"수호신",  bonus:"아군 NPC 보호 행동 시 강화, 치유 효과 +10%",    challenge:"집착이 발목을 잡을 수 있다." },
  { id:"leo",       icon:"♌", name:"사자자리", trait:"영웅",    bonus:"공개적 행동·연설·전투 선언 시 판정 +15",         challenge:"오만이 적을 단합시킬 수 있다." },
  { id:"virgo",     icon:"♍", name:"처녀자리", trait:"현자",    bonus:"분석·탐색·함정 탐지 판정 +15",                   challenge:"완벽주의가 결단을 늦출 수 있다." },
  { id:"libra",     icon:"♎", name:"천칭자리", trait:"조율사",  bonus:"협상·외교·중재 판정 +15, 양측 호감도 보정",      challenge:"우유부단이 결정적 순간을 놓친다." },
  { id:"scorpio",   icon:"♏", name:"전갈자리", trait:"암살자",  bonus:"기습·비밀 수집·독 관련 판정 +15",               challenge:"집착과 복수심이 화를 부른다." },
  { id:"sagittarius",icon:"♐",name:"사수자리", trait:"탐험가", bonus:"새 지역 탐험 시 희귀 이벤트 확률 상승",           challenge:"경솔한 행동이 발목을 잡는다." },
  { id:"capricorn", icon:"♑", name:"염소자리", trait:"전략가", bonus:"장기 계획·자원 관리 판정 +15",                    challenge:"냉정함이 동료를 멀리할 수 있다." },
  { id:"aquarius",  icon:"♒", name:"물병자리", trait:"혁명가", bonus:"기존 질서 타파·반란·창의적 행동 판정 +15",        challenge:"고집이 협력을 방해할 수 있다." },
  { id:"pisces",    icon:"♓", name:"물고기자리",trait:"예언자", bonus:"꿈·예언·신비 관련 이벤트 강화, 직관 판정 +15",  challenge:"현실 감각을 잃으면 위험하다." },
];

export const MAP_LOCATION_TYPES = [
  { id:"secret_passage", icon:"🕳️", label:"비밀 통로",   desc:"이전 회차에 발견한 비밀 통로의 위치를 기억한다.",    bonus:"탈출·기습 루트 정보 보유, 추격전 자동 성공 가능" },
  { id:"hidden_dungeon", icon:"🏚️", label:"숨겨진 던전", desc:"지도에 없는 던전의 입구를 알고 있다.",               bonus:"희귀 아이템 던전 접근 가능, 탐색 판정 +20" },
  { id:"safe_haven",     icon:"🏕️", label:"안전 은신처", desc:"위기 시 몸을 숨길 수 있는 은신처 위치.",             bonus:"적 추격 시 1회 안전 은신 가능" },
  { id:"ancient_ruin",   icon:"🏛️", label:"고대 유적",   desc:"고대 문명의 유적 위치를 알고 있다.",                 bonus:"고대 지식 관련 이벤트 트리거 가능" },
  { id:"trading_hub",    icon:"🏪", label:"암시장",       desc:"공식 지도에 없는 암시장의 위치.",                    bonus:"희귀 물품 거래 접근권, 가격 흥정 +15%" },
  { id:"power_spot",     icon:"💫", label:"기운 지점",    desc:"마력이나 기운이 집중된 장소.",                       bonus:"해당 장소 근처 스킬/마법 판정 +10" },
];

export const IMPRINT_TYPES = [
  { id:"killing_blow",    icon:"⚡", label:"결정타 각인",     desc:"전생의 최후 일격이 각인됨.",                        bonus:"HP 20% 이하 적에게 공격 시 자동 크리티컬 확률 +20%" },
  { id:"last_stand",      icon:"🛡️", label:"최후 방어 각인",  desc:"죽음의 순간 버텨낸 기억이 각인됨.",                  bonus:"HP 10 이하 시 피해 30% 자동 감소 (1회/전투)" },
  { id:"miracle_escape",  icon:"💨", label:"기적 탈출 각인",  desc:"불가능한 탈출에 성공한 기억이 각인됨.",              bonus:"포위·함정 상황에서 탈출 판정 자동 보너스" },
  { id:"heroic_sacrifice",icon:"✨", label:"희생 각인",        desc:"타인을 위한 희생 순간이 각인됨.",                    bonus:"아군 보호 행동 시 판정 무조건 성공 (1회/시나리오)" },
  { id:"forbidden_power", icon:"💀", label:"금기 해방 각인",  desc:"한계를 초월한 순간의 기억이 각인됨.",               bonus:"위기 시 금기 스킬 임시 해금 가능 (카르마 소모)" },
  { id:"perfect_strike",  icon:"🎯", label:"완벽한 일격 각인",desc:"완벽한 판단과 타이밍이 각인됨.",                    bonus:"선제 공격 판정 +25, 기습 성공률 상승" },
];

export const DAWN_STAGES = [
  { stage:0, label:"칠흑의 밤",       icon:"🌑", color:"#1a1a2e", desc:"세계는 어둠에 잠겨있다. 아직 여명의 기미가 없다.",                         worldBonus:null },
  { stage:1, label:"새벽빛의 떨림",   icon:"🌒", color:"#2e2a4a", desc:"지평선 너머 아주 희미한 빛. 희망의 첫 씨앗이 뿌려졌다.",                   worldBonus:"위기 상황에서 갑작스러운 조력자 등장 확률 상승" },
  { stage:2, label:"여명의 시작",     icon:"🌓", color:"#4a3a2e", desc:"하늘이 점차 밝아온다. 세계 곳곳에서 변화의 바람이 분다.",                   worldBonus:"선량한 NPC 호감도 전체 +10, 악의 세력 약간 위축" },
  { stage:3, label:"붉은 새벽",       icon:"🌔", color:"#6a4a2e", desc:"붉은 새벽이 세계를 물들인다. 영웅의 이야기가 전설로 퍼진다.",               worldBonus:"퀘스트 보상 +20%, 명성 획득량 증가" },
  { stage:4, label:"황금빛 여명",     icon:"🌕", color:"#8a7a2e", desc:"황금빛 여명. 세계 전역에서 사람들이 하늘을 올려다본다.",                    worldBonus:"전투 승리 시 추가 SP, 모든 판정 보너스 +5" },
  { stage:5, label:"완전한 일출",     icon:"🌅", color:"#c8a96e", desc:"드디어 태양이 지평선 위로 완전히 떠올랐다. 세계가 다시 빛 속에 잠긴다. 전설이 완성되었다.", worldBonus:"진엔딩 분기 해금, 모든 시스템 최고 보너스 활성화, 세계수와 연동 시 불멸의 전설 칭호" },
];

export const WAR_SCAR_TYPES = [
  { id:"siege",       icon:"🏰", label:"공성전 흔적",    worldEffect:"함락된 성이 폐허로 남아 이번 생의 무법 지대가 됐다.",       bonus:"폐허 탐색 시 희귀 유물 발견 확률 +25%, 무법 지대 자유 행동" },
  { id:"plague_war",  icon:"☠️", label:"역병 전쟁 흔적", worldEffect:"전쟁 중 퍼진 역병의 후유증이 지역에 남아있다.",             bonus:"의료·치유 판정 +15, 역병 면역 NPC 정보망 접근" },
  { id:"revolution",  icon:"🔥", label:"혁명의 흔적",    worldEffect:"전생의 혁명으로 뒤바뀐 권력 구도가 이번 생에도 지속된다.", bonus:"반체제 세력 호감도 +20, 귀족 초기 경계심 +10" },
  { id:"naval_battle",icon:"⛵", label:"해전 흔적",       worldEffect:"침몰한 함선들이 해저 유적이 되어 보물을 품고 있다.",         bonus:"항해·잠수 관련 탐색 시 보물 이벤트 확률 상승" },
  { id:"border_war",  icon:"🗺️", label:"국경 분쟁 흔적", worldEffect:"전생에 다툰 국경 지대가 긴장 상태로 이어진다.",             bonus:"국경 지대 밀수 루트 정보 보유, 밀입국 판정 자동 성공" },
  { id:"dragon_war",  icon:"🐉", label:"용과의 전쟁 흔적",worldEffect:"용과 싸운 전장에 고농도 마력이 잔류한다.",                   bonus:"마법 판정 전체 +10, 드래곤 관련 이벤트 조기 해금" },
];

export const CONTRACT_ENTITIES = {
  god:     { icon:"✨", label:"신의 계약",   terms:"신의 뜻에 따른 행동 시 기적 발동 가능.",      penalty:"신의 뜻을 거스르면 저주 축적.",         bonus:"신앙 판정 +20, 기적 이벤트 트리거 확률 상승" },
  demon:   { icon:"😈", label:"악마의 계약", terms:"악마에게 특정 대가를 약속했다.",              penalty:"계약 불이행 시 재앙 이벤트 발생.",        bonus:"금기 스킬 즉시 해금, 어둠 판정 +15" },
  spirit:  { icon:"🌿", label:"정령의 계약", terms:"자연 정령과 공생 협약을 맺었다.",             penalty:"자연 파괴 행위 시 정령이 등을 돌린다.",   bonus:"자연·탐색 판정 +15, 정령 조력자 등장 가능" },
  dragon:  { icon:"🐉", label:"용의 계약",   terms:"고룡과 상호 원조 협약.",                     penalty:"용의 명예를 손상하면 적으로 돌아선다.",   bonus:"용 관련 이벤트 조력, 불 저항 +20%" },
  trickster:{ icon:"🃏",label:"트릭스터 계약",terms:"장난의 신과 변덕스러운 거래를 맺었다.",      penalty:"계약 내용은 매 회차 무작위로 바뀐다.",    bonus:"행운 판정 극대화 가능, 랜덤 보너스 이벤트" },
};

export const KNOWN_LANGUAGES = [
  { id:"ancient_rune",  icon:"🔤", label:"고대 룬 문자",  desc:"전생에서 고대 룬을 해독했다.",           bonus:"유적·석판 자동 해독, 마법 진 이해 +15" },
  { id:"draconic",      icon:"🐉", label:"용의 언어",     desc:"용과 교류하며 용어를 익혔다.",             bonus:"용 NPC 대화 가능, 용의 가르침 퀘스트 해금" },
  { id:"shadow_tongue",  icon:"🌑", label:"어둠의 언어",   desc:"지하 세계 세력의 은어를 익혔다.",          bonus:"암흑 조직 정보망 접근, 밀서 해독 가능" },
  { id:"nature_speech",  icon:"🌿", label:"자연의 말",     desc:"정령과 교감하며 자연어를 배웠다.",         bonus:"동물·정령과 의사소통, 자연 탐색 보너스" },
  { id:"celestial",     icon:"⭐", label:"천상의 언어",   desc:"신성한 존재와 대화하며 익힌 말.",           bonus:"신전 고문서 해독, 신성 판정 +10" },
  { id:"mechanical",    icon:"⚙️", label:"기계 언어",     desc:"사이버 공간과 기계를 다루며 익힌 언어.",    bonus:"해킹·기계 조작 판정 +15, 고대 장치 이해" },
];

export const SIN_TYPES = {
  betrayal:   { icon:"🗡️", label:"배신의 죄",   quest:"배신한 자의 후손을 돕는다.",          redemptionBonus:"카르마 +30, 신뢰 관련 판정 영구 +10" },
  cowardice:  { icon:"💨", label:"비겁함의 죄",  quest:"도망쳤던 전장을 다시 마주한다.",       redemptionBonus:"용기 관련 판정 +20, 전투 공포 면역" },
  greed:      { icon:"💰", label:"탐욕의 죄",    quest:"모은 재물을 궁핍한 자에게 나눈다.",    redemptionBonus:"카르마 +25, 상거래 운 영구 상승" },
  murder:     { icon:"💀", label:"살인의 죄",    quest:"억울하게 죽인 자의 원혼을 달랜다.",    redemptionBonus:"저주도 초기화, 혼백 관련 이벤트 해금" },
  pride:      { icon:"👑", label:"오만의 죄",    quest:"자신보다 낮은 자를 진심으로 섬긴다.", redemptionBonus:"리더십 판정 +15, 동료 사기 버프 강화" },
  destruction:{ icon:"🔥", label:"파괴의 죄",    quest:"파괴한 마을·조직을 재건한다.",         redemptionBonus:"건설 관련 이벤트 활성화, 민심 판정 +20" },
};

export const LEGEND_ARTIFACTS = [
  { id:"broken_crown",    icon:"👑", label:"부서진 왕관",     totalShards:5, completedBonus:"고대 왕국의 왕관 복원. 모든 귀족 NPC 초기 복종, LDR +20 영구 부여." },
  { id:"shattered_blade", icon:"⚔️", label:"산산조각 난 검",   totalShards:5, completedBonus:"전설의 검 복원. STR +25, 모든 전투 판정 최고 보너스 영구 부여." },
  { id:"cracked_tome",    icon:"📖", label:"갈라진 고대 서",   totalShards:4, completedBonus:"금지된 마법서 복원. MGC +20, 봉인된 마법 전체 해금." },
  { id:"split_compass",   icon:"🧭", label:"쪼개진 나침반",    totalShards:3, completedBonus:"어디든 찾아가는 나침반 복원. 탐색 판정 항상 성공, 숨겨진 장소 자동 발견." },
  { id:"torn_map",        icon:"🗺️", label:"찢긴 세계 지도",   totalShards:6, completedBonus:"완전한 세계 지도 복원. 모든 지역 정보 즉시 획득, 이동 비용 0." },
];

export const ECHO_CHOICE_TYPES = {
  mercy:     { icon:"🕊️", label:"자비의 메아리",  echo:"전생에 살려준 자의 후손이 결정적 순간에 은혜를 갚는다.",       bonus:"위기 시 구원자 NPC 1회 등장 보장" },
  sacrifice: { icon:"✨", label:"희생의 메아리",   echo:"전생의 희생이 전설로 전해져 이름 없는 지지를 받는다.",         bonus:"민심 판정 +15, 집단전 지원군 등장 확률 상승" },
  deception: { icon:"🃏", label:"기만의 메아리",   echo:"전생의 속임수가 후세에 알려져 초기 신뢰도에 영향을 준다.",     bonus:"기만 판정 +20, 단 초기 NPC 신뢰도 -10" },
  alliance:  { icon:"🤝", label:"동맹의 메아리",   echo:"전생의 동맹 조약이 이번 생 세력 관계에 이어진다.",             bonus:"특정 세력 초기 우호도 +30, 공동 작전 제안 가능" },
  rebellion: { icon:"🔥", label:"반역의 메아리",   echo:"전생의 반역이 민중 사이에 혁명 정신으로 남아있다.",            bonus:"반체제 세력 즉각 동조, 민중 봉기 유도 가능" },
  forgiveness:{ icon:"💙",label:"용서의 메아리",   echo:"전생에 용서한 자가 진심으로 개과천선하여 이번 생에 조력자로 등장한다.", bonus:"개과천선 NPC 동료 획득 가능, 카르마 +20" },
};

export const MYTH_CHAPTER_TYPES = [
  { id:"origin",      icon:"🌅", label:"기원의 장",   desc:"영웅의 탄생과 첫 시련을 다룬 장.", npcHint:"이 땅에 전설의 영웅이 처음 나타났을 때…" },
  { id:"trial",       icon:"⚔️", label:"시련의 장",   desc:"거대한 적에 맞서 싸운 이야기.",     npcHint:"그는 누구도 이길 수 없다던 적을 홀로 맞닥뜨렸다고 합니다…" },
  { id:"betrayal",    icon:"🗡️", label:"배신의 장",   desc:"믿었던 자의 배신과 극복.",          npcHint:"전설 속 영웅도 가장 가까운 자에게 배신을 당했다지요…" },
  { id:"redemption",  icon:"✨", label:"속죄의 장",   desc:"과오를 극복하고 다시 일어선 이야기.",npcHint:"그가 스스로의 죄를 인정하고 속죄에 나섰을 때, 세상이 달라졌습니다…" },
  { id:"sacrifice",   icon:"💙", label:"희생의 장",   desc:"모든 것을 걸고 타인을 구한 순간.",   npcHint:"전설의 영웅은 자신의 목숨보다 동료를 더 소중히 여겼다고…" },
  { id:"ascension",   icon:"🌟", label:"승천의 장",   desc:"한계를 초월해 전설이 된 순간.",      npcHint:"그 순간, 하늘이 갈라지고 새로운 전설이 시작되었다고 전해집니다…" },
];

export const BLOODLINE_TRAITS = [
  // ── 범용 특성 (직업/배경 키워드로 추론, races 없음) ──
  { id:"warrior",  label:"전사의 핏줄",   stats:{str:5, end:3} },
  { id:"mage",     label:"마법사의 핏줄", stats:{mgc:5, int:3} },
  { id:"healer",   label:"치유자의 핏줄", stats:{fath:4, wil:3} },
  { id:"rogue",    label:"도적의 핏줄",   stats:{agi:5, disg:3} },
  { id:"merchant", label:"상인의 핏줄",   stats:{neg:5, luk:3} },
  { id:"wanderer", label:"방랑자의 핏줄", stats:{per:4, end:3} },
  // ── 종족 전용 특성 (races 지정, 1순위 매칭) ──
  { id:"elder_clan",    label:"장로 혈족",   races:["엘프"],      stats:{mgc:4, int:4} },
  { id:"forge_clan",    label:"단조 가문",   races:["드워프"],    stats:{str:4, int:3} },
  { id:"war_clan",      label:"전쟁 부족",   races:["오크"],      stats:{str:5, wil:3} },
  { id:"shadow_clan",   label:"그림자 혈통", races:["다크링"],    stats:{agi:4, per:4} },
  { id:"holy_lineage",  label:"신성 혈통",   races:["세레스티얼"], stats:{fath:5, cha:3} },
  { id:"elder_dragon",  label:"고룡의 핏줄", races:["드래곤혈"],  stats:{str:4, fear:3} },
  { id:"pact_bloodline",label:"계약자 혈통", races:["악마족"],    stats:{neg:4, mad:3} },
  { id:"ancient_dead",  label:"태고의 잔재", races:["언데드"],    stats:{wil:4, pstx:3} },
];

export const CURSE_TYPES = [
  { id:"eternal_thirst",  icon:"💧", label:"영원한 갈증 저주",  effect:"특정 자원이 끊임없이 줄어드는 감각. 단, 결핍을 극복할 때마다 강해진다.",         debuff:"매 30턴 MP -5", hiddenBonus:"저주 극복 시 WIL +10 영구 부여" },
  { id:"haunted_shadow",  icon:"👥", label:"그림자 저주",        effect:"전생에 해친 자의 그림자가 따라다닌다. 단, 그림자는 때로 경고를 준다.",         debuff:"어두운 장소에서 판정 -10", hiddenBonus:"매복·암습 사전 경고 (1회/시나리오)" },
  { id:"marked_by_death", icon:"💀", label:"죽음의 낙인 저주",   effect:"죽음 관련 이벤트에 더 자주 연루된다. 단, 죽음을 마주할수록 담대해진다.",       debuff:"사망 관련 이벤트 빈도 상승", hiddenBonus:"END +15, 공포 면역 누적" },
  { id:"broken_tongue",   icon:"🔇", label:"언어 저주",          effect:"특정 진실을 말할 수 없다. 단, 행동으로 보여줄 때 더 강한 설득력이 생긴다.",    debuff:"특정 정보 공유 제한", hiddenBonus:"비언어 설득 판정 +20" },
  { id:"timelock",        icon:"⏳", label:"시간 봉인 저주",     effect:"특정 시간대에 행동 불능. 단, 그 시간에 명상하면 강력한 통찰을 얻는다.",         debuff:"특정 시간 행동 제한", hiddenBonus:"직관 판정 +15, 예언 이벤트 해금" },
];

export const WORLD_MEMORY_STAGES = [
  { stage:0, label:"무관심한 세계",     icon:"🌍", color:"#2c3e50", desc:"세계는 아직 이 영혼을 모른다.",                                  phenomenon:null },
  { stage:1, label:"어렴풋한 기억",     icon:"🌫️", color:"#34495e", desc:"세계 어딘가에서 모르는 사람이 당신에게 친근감을 느낀다.",        phenomenon:"낯선 NPC가 처음 만남에도 반갑게 인사한다." },
  { stage:2, label:"세계의 속삭임",     icon:"🌐", color:"#1a5276", desc:"자연과 사물이 당신에게 신호를 보내기 시작한다.",                  phenomenon:"탐색 판정 없이 숨겨진 물건이 저절로 눈에 띈다." },
  { stage:3, label:"전설의 공명",       icon:"✨", color:"#154360", desc:"세계 전역에서 당신의 귀환을 감지한다. 전설이 살아 돌아왔다.",     phenomenon:"영웅 관련 NPC가 자발적으로 조력을 요청한다." },
  { stage:4, label:"세계의 각인",       icon:"🌟", color:"#1b4f72", desc:"세계 자체가 당신의 존재를 기록한다. 세계가 당신 편이다.",         phenomenon:"위기 시 환경(날씨·지형)이 유리하게 변한다." },
  { stage:5, label:"세계와의 합일",     icon:"🌈", color:"#17202a", desc:"영혼과 세계가 하나가 되었다. 이 세계에서 당신은 전설 그 자체다.", phenomenon:"모든 생명체가 당신을 전설로 인식. 최종 엔딩 해금." },
];

export const WORLD_MEMORY_PHENOMENA = [
  { id:"deja_vu_place",  icon:"🏛️", label:"장소의 기시감",  desc:"처음 방문하는 장소인데 모든 구조를 알고 있다.",                 bonus:"해당 장소 함정·비밀 자동 파악" },
  { id:"deja_vu_person", icon:"👤", label:"인물의 기시감",   desc:"처음 보는 얼굴인데 영혼 깊이에서 알고 있다는 느낌.",            bonus:"해당 NPC의 진심·의도 자동 파악 가능" },
  { id:"world_whisper",  icon:"🌬️", label:"세계의 속삭임",  desc:"바람 소리, 물소리에서 경고나 힌트가 들려온다.",                 bonus:"다음 이벤트 분기 예고 (1회/시나리오)" },
  { id:"fate_pull",      icon:"🧲", label:"운명의 끌어당김", desc:"특정 장소나 NPC에게 이유 없이 이끌린다. 그곳에 열쇠가 있다.",  bonus:"핵심 퀘스트 오브젝트 자동 발견" },
  { id:"memory_flash",   icon:"⚡", label:"기억 섬광",        desc:"위기 순간 전생의 해결책이 번개처럼 떠오른다.",                  bonus:"위기 판정 1회 자동 대성공 전환" },
];
