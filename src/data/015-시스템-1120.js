// 시스템 11~20 — data
// Pure data split out of misc/015-시스템-1120.js (see generate.js).

export const FORBIDDEN_SKILL_DEFS = [
  {
    id:"fs_death_kiss", name:"죽음의 입맞춤", icon:"💀", rarity:"legendary",
    type:"active", mpCost:60, scenario:null,
    unlockCondition:"villain", unlockDesc:"전생에서 악당 루트로 엔딩 달성",
    desc:"적의 생명력을 직접 흡수. 대상 HP의 30%를 빼앗아 자신이 회복한다.",
    aiHint:"죽음의 입맞춤 발동! 금지된 어둠의 마법이 생명력을 빨아들입니다.",
    req:{}, condition:null, conditionDesc:null, statBoost:{}
  },
  {
    id:"fs_rewind_3s", name:"시간 역행 3초", icon:"⏪", rarity:"legendary",
    type:"event", mpCost:0, scenario:null,
    unlockCondition:"any_ending", unlockDesc:"어떤 엔딩이든 3회 이상 달성",
    desc:"직전 행동의 결과를 없던 일로 되돌린다. 대실패를 무효화. 1회 한정.",
    aiHint:"시간 역행 발동! 시간이 거꾸로 흐르며 방금의 순간이 지워집니다.",
    req:{}, condition:"crit_fail", conditionDesc:"대실패 직후 1회", statBoost:{}
  },
  {
    id:"fs_soul_devour", name:"영혼 잠식", icon:"🌑", rarity:"legendary",
    type:"active", mpCost:50, scenario:null,
    unlockCondition:"sacrifice_ally", unlockDesc:"전생에서 동료를 희생시켜 엔딩 달성",
    desc:"대상의 영혼을 일부 흡수. 그 NPC의 스탯 중 가장 높은 능력치를 영구 획득.",
    aiHint:"영혼 잠식 발동! 어둠의 힘이 상대의 영혼을 갉아먹습니다.",
    req:{mad:60}, condition:null, conditionDesc:null, statBoost:{}
  },
  {
    id:"fs_world_pause", name:"세계 정지", icon:"⏸️", rarity:"legendary",
    type:"active", mpCost:80, scenario:null,
    unlockCondition:"perfect_clear", unlockDesc:"전생에서 모든 퀘스트 완료 후 엔딩 달성",
    desc:"1턴간 세계의 시간을 멈춘다. 그 사이 자유롭게 행동 1회 추가.",
    aiHint:"세계 정지 발동! 온 세상이 멈추고 오직 당신만이 움직입니다.",
    req:{mgc:70}, condition:null, conditionDesc:null, statBoost:{}
  },
  {
    id:"fs_fate_pierce", name:"운명 관통", icon:"🗡️", rarity:"legendary",
    type:"active", mpCost:40, scenario:null,
    unlockCondition:"5plus_cycles", unlockDesc:"5회차 이상 플레이",
    desc:"어떤 방어도 무시하는 절대 일격. 대상 방어 스탯 완전 무효화 후 공격.",
    aiHint:"운명 관통 발동! 운명의 칼날이 모든 방어를 뚫고 심장을 겨냥합니다.",
    req:{str:50, crit:40}, condition:null, conditionDesc:null, statBoost:{}
  },
];

export const BUTTERFLY_EFFECTS = {
  boss_killed: {
    label:"처치한 보스의 후계자",
    worldEcho: (data) => `전생에서 ${data.bossName}을 처치한 소문이 퍼졌다. 그의 후계자가 복수를 다짐하며 더욱 강하게 성장했다.`,
    aiHint: (data) => `전생 나비효과: ${data.bossName}의 후계자가 더 강해진 상태로 등장합니다. 복수심을 품고 있습니다.`,
  },
  saved_village: {
    label:"구한 마을의 전설",
    worldEcho: (data) => `전생에서 구한 마을이 당신의 이름을 전설로 기억한다. 그 마을의 후손들이 세계 어딘가에 살고 있다.`,
    aiHint: () => `전생 나비효과: 어딘가에서 당신을 기억하는 마을 후손이 나타나 은혜를 갚으려 합니다.`,
  },
  destroyed_artifact: {
    label:"파괴된 유물의 여파",
    worldEcho: (data) => `전생에서 파괴된 유물의 균열이 세계 어딘가에 남아있다. 예상치 못한 곳에서 영향이 나타날 수 있다.`,
    aiHint: () => `전생 나비효과: 세계 어딘가에 예상치 못한 균열이나 이상 현상이 발생합니다.`,
  },
  betrayed_ally: {
    label:"배신당한 동료의 원한",
    worldEcho: (data) => `전생에서 배신한 ${data.npcName}의 원한이 세계에 스며들었다. 그 기억이 이상한 형태로 반향한다.`,
    aiHint: (data) => `전생 나비효과: ${data.npcName}과 닮은 NPC가 처음부터 당신에게 적대적인 태도를 보입니다.`,
  },
};

export const INHERITABLE_STATS = ['hp','mp','str','agi','end','regen','cha','spk','ldr','neg','rep','disg','fear','trst','int','per','wil','cal','luk','intn','fath','pstx','mgc'];

export const DEATH_BONUS_DEFS = [
  { id:"db_combat",   trigger:"combat",    icon:"⚔️", name:"전사의 유산",   bonus:{str:4, end:3},        desc:"전투 중 사망. 다음 생에 전사의 기질이 몸에 배어있다." },
  { id:"db_poison",   trigger:"poison",    icon:"🧪", name:"단련된 저항체", bonus:{pstx:8, end:3},       desc:"독·상태이상으로 사망. 다음 생에 상태저항이 강화된다." },
  { id:"db_starved",  trigger:"starved",   icon:"🍖", name:"생존 본능",      bonus:{food:10, end:5},      desc:"굶어서 사망. 다음 생에 생존 본능이 강화된다." },
  { id:"db_betrayed", trigger:"betrayed",  icon:"🕊️", name:"배신자 감지",    bonus:{per:6, intn:5},       desc:"배신당해 사망. 다음 생에 타인의 의도를 더 잘 읽는다." },
  { id:"db_magic",    trigger:"magic",     icon:"🔮", name:"마법 적응",       bonus:{mgc:6, wil:4},        desc:"마법에 당해 사망. 다음 생에 마법 적응력이 생긴다." },
  { id:"db_fall",     trigger:"fall",      icon:"🌊", name:"낙사의 기억",    bonus:{agi:5, cal:4},         desc:"높은 곳에서 추락사. 다음 생에 균형 감각이 발달한다." },
  { id:"db_curse",    trigger:"curse",     icon:"🌑", name:"저주 면역 시작", bonus:{crse:-10, wil:5},      desc:"저주로 사망. 다음 생에 저주에 약간의 저항이 생긴다." },
  { id:"db_old_age",  trigger:"old_age",   icon:"⏳", name:"노장의 지혜",    bonus:{int:6, cal:5, wil:4}, desc:"노화로 자연사. 다음 생에 지혜롭게 태어난다." },
];

export const TRAUMA_DEFS = {
  fire:     { label:"화염",   icon:"🔥", immunity:"화염 내성 +20, 냉기 내성 -10",        statBonus:{end:5},    statPenalty:{}     },
  ice:      { label:"냉기",   icon:"❄️", immunity:"냉기 내성 +20, 화염 내성 -10",        statBonus:{cal:5},    statPenalty:{}     },
  fall:     { label:"추락",   icon:"🌊", immunity:"추락 무효, 균형 감각 +10",             statBonus:{agi:8},    statPenalty:{}     },
  ambush:   { label:"기습",   icon:"🗡️", immunity:"기습 감지율 80%, 선제 반격",          statBonus:{per:8},    statPenalty:{}     },
  curse:    { label:"저주",   icon:"🌑", immunity:"저주 저항 +25, 상태저항 +5",           statBonus:{wil:6, pstx:5},    statPenalty:{} },
  betrayal: { label:"배신",   icon:"🕊️", immunity:"배신자 감지 자동 발동",               statBonus:{intn:8},   statPenalty:{trst:-5} },
  crowd:    { label:"군중",   icon:"👥", immunity:"군중 압박 면역, 단독행동 보너스",      statBonus:{cal:6},    statPenalty:{}     },
  poison:   { label:"독·상태이상", icon:"🧬", immunity:"독·빙결·화상 저항 +20, 상태이상 지속시간 단축", statBonus:{end:4, pstx:8}, statPenalty:{} },
  freeze:   { label:"빙결",   icon:"❄️", immunity:"빙결 저항 +25, 행동 제한 면역",        statBonus:{cal:5, pstx:6}, statPenalty:{} },
};

export const LAST_WORD_OPENINGS = {
  heroic:   "전생에서 당신은 마지막 순간까지 누군가를 지키려 했다. 그 기억이 이번 생의 심장 어딘가에 새겨져 있다.",
  vengeful: "전생의 마지막 말은 복수에 대한 것이었다. 그 원한이 이번 생을 시작하는 불씨가 된다.",
  peaceful: "전생의 마지막 순간은 평온했다. 그 평화로운 기억이 이번 생에 잔잔한 용기를 준다.",
  tragic:   "전생은 비극으로 끝났다. 그 슬픔이 이번 생의 어딘가에 그림자처럼 드리워져 있다.",
  humorous: "전생의 마지막 순간조차 유쾌했다. 그 낙관적인 기운이 이번 생에도 이어진다.",
};

export const BLOODLINE_EVOLUTION = {
  "인간":     { 2:"반혼혈인", 4:"각성 인간", 7:"초월자" },
  "엘프":     { 2:"반요정", 4:"고대 요정혈통", 7:"별의 화신" },
  "드워프":   { 2:"철혈 드워프", 3:"강철 장인", 4:"강철 군주", 5:"심산의 투사", 6:"용암 군주", 7:"산의 신", 9:"대지의 수호자", 12:"불멸의 산신" },
  "오크":     { 2:"전쟁오크", 3:"피의 투사", 4:"혈전 군주", 5:"전쟁광", 6:"파멸의 군주", 7:"전쟁신의 화신", 9:"세계파괴자", 12:"불멸의 정복신" },
  "다크링":   { 2:"심연 다크링", 3:"저주의 술사", 4:"공허의 군주", 5:"절망의 화신", 6:"심연의 지배자", 7:"어둠의 신격", 9:"우주적 공허", 12:"불멸의 암흑신" },
  "세레스티얼": { 2:"빛의 수호자", 3:"천사", 4:"대천사", 5:"신의 화신", 6:"성스러운 심판자", 7:"신성의 화신", 9:"빛의 근원", 12:"불멸의 창조신" },
  "드래곤혈": { 2:"드래곤 태생", 3:"반룡", 4:"드래곤로드", 5:"용신", 6:"고룡의 군주", 7:"원시 용신", 9:"세계용", 12:"불멸의 용신황" },
  "악마족":   { 2:"하위 악마", 3:"상위 악마", 4:"마왕", 5:"혼돈의 신", 6:"마계의 지배자", 7:"원죄의 화신", 9:"세계붕괴자", 12:"불멸의 혼돈신" },
  "언데드":   { 2:"구울", 3:"리치", 4:"데스 나이트", 5:"죽음의 신", 6:"사령의 지배자", 7:"불사의 군주", 9:"죽음의 근원", 12:"불멸의 사신황" },
  "뱀파이어":  { 2:"혈종 귀족", 3:"피의 군주", 4:"혈통 왕", 5:"고대 뱀파이어", 6:"밤의 지배자", 7:"원초의 혈군", 9:"어둠의 혈신", 12:"불멸의 밤의 황제" },
  // [B9 FIX] 실제 종족명은 "수인"인데 "반인반수"라는 다른 이름으로 등록되어
  // recordRacePlayed(char.race)/getEvolvedRace(race)가 "수인"을 키로 찾을 때
  // 항상 매칭 실패하던 버그. 키를 정정하고, 아예 누락되어 있던 "원소인"도
  // 다른 종족과 동일한 형식으로 추가한다.
  "수인": { 2:"야수 반인", 4:"원시 군주", 7:"야수의 신" },
  "원소인": { 2:"원소 각성자", 3:"원소 융합체", 4:"정령왕", 5:"원소의 화신", 6:"원소계 지배자", 7:"근원의 정령신", 9:"만물원소체", 12:"불멸의 원소신" },
};
