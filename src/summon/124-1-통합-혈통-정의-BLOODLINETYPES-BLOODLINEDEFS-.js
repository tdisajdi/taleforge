// 1. 통합 혈통 정의 (BLOODLINE_TYPES + BLOODLINE_DEFS 통합)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { BLOODLINE_MASTER } from '../data/124-1-통합-혈통-정의-BLOODLINETYPES-BLOODLINEDEFS-.js';
import { lsGet, lsSet } from '../utils.js';

Object.assign(BLOODLINE_MASTER, {
  // ── 인간 전용 ──────────────────────────────────────────────
  hero_blood:  {
    name:'영웅의 혈통',     icon:'⭐', color:'#d0a030', raceFor:['인간'],
    desc:'전설적인 영웅의 피가 흐른다. 역경 속에서 진가를 발휘한다.',
    hint:'결정적 순간마다 이상한 확신과 용기가 솟구친다.',
    awakeCond:'동료가 위험에 처하거나 절대적 열세 상황',
    awakePatterns:[/동료.*위기|동료.*죽|열세|절망.*희망|마지막.*저항|포기.*안/i],
    skill:'영웅의 의지',    skillDesc:'모든 스탯 +15, 다음 판정 자동 대성공. 동료 있으면 효과 2배',
    passiveStats:{ wil:5, luk:5 },
    awakeStats:  { wil:20, luk:15, rep:10 },
    evolveHint:'역경을 극복할수록 영웅혈이 빛난다.',
    lore:'수백 년 전 세계를 구한 영웅의 혈통이 희미하게 이어졌다.',
  },
  fate_blood:  {
    name:'운명의 혈통',     icon:'🌟', color:'#8080d0', raceFor:['인간'],
    desc:'운명에 선택받은 피. 우연이 필연처럼 이어진다.',
    hint:'우연한 만남이 결코 우연이 아닌 것처럼 느껴진다.',
    awakeCond:'예상치 못한 행운이 겹치거나 예언 관련 이벤트',
    awakePatterns:[/예언|운명|우연.*필연|기적|선택받|운이.*좋/i],
    skill:'운명 가속',      skillDesc:'LUK+30, 이번 턴 모든 판정 +20',
    passiveStats:{ luk:8, per:4 },
    awakeStats:  { luk:25, per:15 },
    evolveHint:'운명의 실이 더 굵어진다.',
    lore:'세계가 특별히 선택한 자의 피.',
  },
  // ── 엘프 전용 ──────────────────────────────────────────────
  star_blood:  {
    name:'별빛 혈통',       icon:'✨', color:'#70b0e0', raceFor:['엘프'],
    desc:'별의 기운을 담은 피. 밤에 더 강해지고 예언의 목소리가 들린다.',
    hint:'밤하늘을 보면 별들이 메시지를 보내는 것 같다.',
    awakeCond:'밤 시간대 또는 별·하늘·예언 관련 상황',
    awakePatterns:[/밤|별|달|예언|꿈.*목소리|하늘.*소리|별빛/i],
    skill:'별빛 통찰',      skillDesc:'PER+25, 다음 3턴간 상대 의도 자동 파악',
    passiveStats:{ per:6, int:5 },
    awakeStats:  { per:20, int:15, luk:10 },
    evolveHint:'회차가 쌓일수록 별의 목소리가 선명해진다.',
    lore:'태고의 별신과 교감한 엘프 선조의 혈통.',
  },
  forest_blood: {
    name:'숲의 혈통',       icon:'🌿', color:'#40a060', raceFor:['엘프'],
    desc:'대삼림의 정령과 계약한 가문의 피. 자연이 동료가 된다.',
    hint:'동물들이 경계하지 않고 자연스럽게 다가온다.',
    awakeCond:'숲·자연 환경이나 생명체와 교감하는 순간',
    awakePatterns:[/숲|자연.*교감|동물.*따르|나무.*속삭|정령.*반응/i],
    skill:'숲의 부름',      skillDesc:'자연 정령 3체 소환, 모든 자연 판정 자동 대성공',
    passiveStats:{ per:5, mgc:5 },
    awakeStats:  { per:15, mgc:15, agi:10 },
    evolveHint:'자연과의 교감이 깊어질수록 숲혈이 강해진다.',
    lore:'대삼림의 첫 번째 정령과 계약한 엘프 가문.',
  },
  // ── 드워프 전용 ────────────────────────────────────────────
  forge_blood: {
    name:'용광로 혈통',     icon:'🔨', color:'#c06020', raceFor:['드워프'],
    desc:'전설의 대장장이 가문의 피. 금속과 불꽃이 반응한다.',
    hint:'쇠를 만지면 그 역사와 특성이 직관적으로 느껴진다.',
    awakeCond:'장비 강화, 제작, 또는 금속·불 관련 위기',
    awakePatterns:[/단조|강화|용광로|쇠.*울림|금속.*반응|불꽃.*각성/i],
    skill:'장인의 광기',    skillDesc:'STR+20, 다음 강화·제작 자동 최고급. END+15',
    passiveStats:{ str:5, end:5 },
    awakeStats:  { str:20, end:15 },
    evolveHint:'제련의 경험이 쌓일수록 용광로혈이 뜨거워진다.',
    lore:'신화 속 최초의 드워프 대장장이 가문의 직계.',
  },
  stone_blood: {
    name:'바위 혈통',       icon:'🪨', color:'#808060', raceFor:['드워프'],
    desc:'대지 그 자체의 피. 어떤 충격도 버텨낸다.',
    hint:'어떤 상처를 입어도 평정심이 흔들리지 않는다.',
    awakeCond:'압도적인 피해를 받거나 동료를 지키는 방어 상황',
    awakePatterns:[/버텨|막아냈|피해.*받|방어|지켜냈|포기.*안/i],
    skill:'바위 화신',      skillDesc:'3턴간 무적에 가까운 방어, END+25, 모든 피해 50% 감소',
    passiveStats:{ end:7, wil:4 },
    awakeStats:  { end:25, str:10 },
    evolveHint:'견뎌낼수록 바위혈이 단단해진다.',
    lore:'산맥 그 자체와 계약한 드워프 시조의 혈통.',
  },
  // ── 오크 전용 ──────────────────────────────────────────────
  warchief_blood: {
    name:'전쟁족장 혈통',   icon:'⚔️', color:'#c04020', raceFor:['오크'],
    desc:'전설의 전쟁족장 가문의 피. 전장에서 빛난다.',
    hint:'전투가 시작되면 혈류가 빨라지고 감각이 예민해진다.',
    awakeCond:'전투 시작 또는 적 다수를 상대하는 상황',
    awakePatterns:[/전투.*시작|적.*다수|전장|포위|혈전|결전/i],
    skill:'족장의 포효',    skillDesc:'전장의 모든 적 공포 부여, STR+25, 아군 STR+10',
    passiveStats:{ str:7, fear:5 },
    awakeStats:  { str:25, fear:20, end:10 },
    evolveHint:'전투 경험이 쌓일수록 족장혈이 깨어난다.',
    lore:'수백 번의 전쟁을 승리로 이끈 전설적 족장의 혈통.',
  },
  blood_shaman: {
    name:'피의 샤먼 혈통',  icon:'🩸', color:'#a02040', raceFor:['오크'],
    desc:'피와 영혼을 다루는 오크 샤먼 가문. 희생으로 힘을 얻는다.',
    hint:'피를 흘릴 때 역설적으로 힘이 솟아오른다.',
    awakeCond:'자신의 피를 희생하거나 동료가 쓰러지는 상황',
    awakePatterns:[/희생|피.*흘리|동료.*쓰러|제물|혈제|피의 맹세/i],
    skill:'피의 의식',      skillDesc:'HP 20% 소모해 STR+30, 다음 5턴간 모든 판정 +15',
    passiveStats:{ str:5, wil:5 },
    awakeStats:  { str:20, wil:15, fear:10 },
    evolveHint:'희생이 쌓일수록 샤먼혈이 강해진다.',
    lore:'영혼 세계와 직접 거래한 오크 샤먼 가문.',
  },
  // ── 다크링 전용 ────────────────────────────────────────────
  void_walker:  {
    name:'공허 보행자 혈통', icon:'🌀', color:'#504080', raceFor:['다크링'],
    desc:'차원의 틈을 걷는 가문의 피. 현실과 허공 사이를 넘나든다.',
    hint:'가끔 주변 공간이 흔들리고 그림자 속에 다른 공간이 보인다.',
    awakeCond:'죽음 직전이거나 차원·공간 이동 관련 상황',
    awakePatterns:[/차원|공허|틈새|공간.*왜곡|그림자.*세계|차원.*이동/i],
    skill:'차원 도약',      skillDesc:'즉시 위험에서 탈출 + 그림자 세계에서 3턴 기습 가능',
    passiveStats:{ agi:6, per:5 },
    awakeStats:  { agi:20, per:15, disg:10 },
    evolveHint:'루프 경험이 쌓일수록 차원혈이 깊어진다.',
    lore:'공허와 계약해 두 세계를 걷는 다크링 가문.',
  },
  curse_weaver: {
    name:'저주 직조 혈통',  icon:'💀', color:'#804040', raceFor:['다크링'],
    desc:'저주를 예술로 승화시킨 가문의 피. 저주가 더 정교하고 강력하다.',
    hint:'저주를 거는 순간 놀라운 직관이 발동한다.',
    awakeCond:'저주를 받거나 저주 관련 마법 사용 상황',
    awakePatterns:[/저주|낙인|오염|부패.*마법|어둠.*주문/i],
    skill:'완전 저주',      skillDesc:'대상에 복합 저주 부여, MGC+20, 저주 효과 2배 지속',
    passiveStats:{ mgc:6, crse:6 },
    awakeStats:  { mgc:20, crse:20, fear:10 },
    evolveHint:'어둠 속에서 더 깊이 각성한다.',
    lore:'저주 마법을 예술의 경지로 끌어올린 다크링 마법사 가문.',
  },
  // ── 세레스티얼 전용 ────────────────────────────────────────
  divine_chosen: {
    name:'신성 선택받은 자', icon:'👼', color:'#e0e060', raceFor:['세레스티얼'],
    desc:'신이 직접 선택한 혈통. 기적이 더 자주 일어난다.',
    hint:'기도를 올릴 때 응답이 거의 항상 온다.',
    awakeCond:'불가능한 상황에서 타인을 구하려 할 때',
    awakePatterns:[/기적|신의.*응답|구했|희생.*자신|타인.*위해/i],
    skill:'신의 직접 개입', skillDesc:'HP 전체 회복 + 파티 전원 부활 (1회), FATH+30',
    passiveStats:{ fath:8, wil:5 },
    awakeStats:  { fath:25, wil:20, rep:15 },
    evolveHint:'헌신이 쌓일수록 신성혈이 빛난다.',
    lore:'천상 의회가 직접 승인한 세레스티얼 혈통.',
  },
  light_herald: {
    name:'빛의 전령 혈통',  icon:'☀️', color:'#f0d040', raceFor:['세레스티얼'],
    desc:'신성한 빛을 전파하는 가문의 피. 어둠을 정화한다.',
    hint:'어둠 속에서 무의식적으로 빛을 발산한다.',
    awakeCond:'어둠 마법·저주·언데드 상대 또는 아군 정화',
    awakePatterns:[/정화|어둠.*몰아|저주.*해제|신성.*빛|빛.*발산/i],
    skill:'정화의 광명',    skillDesc:'범위 내 모든 저주·어둠 정화, MGC+20, 적에게 빛 피해',
    passiveStats:{ mgc:6, fath:5 },
    awakeStats:  { mgc:20, fath:15, rep:10 },
    evolveHint:'신앙이 깊어질수록 빛혈이 강해진다.',
    lore:'천상의 빛을 지상에 전하는 임무를 받은 혈통.',
  },
  // ── 악마족 전용 ────────────────────────────────────────────
  contract_lord: {
    name:'계약 군주 혈통',  icon:'📜', color:'#8020c0', raceFor:['악마족'],
    desc:'계약을 지배하는 마계 군주의 피. 협상이 전투가 된다.',
    hint:'계약을 맺는 순간 상대의 욕망이 투명하게 보인다.',
    awakeCond:'중요한 계약·협상·거래 상황',
    awakePatterns:[/계약|협상|거래|조건.*제시|협박|회유/i],
    skill:'절대 계약',      skillDesc:'NEG+30, 다음 협상 자동 성공, 계약 위반자 즉시 저주',
    passiveStats:{ neg:7, cha:5 },
    awakeStats:  { neg:25, cha:20, fear:10 },
    evolveHint:'거래를 거듭할수록 계약혈이 짙어진다.',
    lore:'마계에서 가장 오래된 계약 가문의 직계.',
  },
  chaos_blood:  {
    name:'혼돈 혈통',       icon:'🔴', color:'#c02020', raceFor:['악마족'],
    desc:'마계 원초 에너지의 피. 파괴와 혼돈이 힘의 원천이다.',
    hint:'분노할 때 주변 공기가 흔들린다.',
    awakeCond:'통제 불능의 분노·혼돈·파괴 상황',
    awakePatterns:[/혼돈|분노.*폭발|통제.*불능|파괴|광기/i],
    skill:'혼돈 해방',      skillDesc:'STR·MGC+25, 모든 제약 무시, 3턴간 광포 상태',
    passiveStats:{ str:5, mgc:5 },
    awakeStats:  { str:20, mgc:20, fear:15 },
    evolveHint:'혼돈이 깊어질수록 혼돈혈이 폭발한다.',
    lore:'마계 창조 시 발생한 원초적 혼돈에서 비롯된 혈통.',
  },
  // ── 언데드 전용 ────────────────────────────────────────────
  death_pact:  {
    name:'죽음 계약 혈통',  icon:'💀', color:'#506080', raceFor:['언데드'],
    desc:'죽음 그 자체와 계약한 가문의 피. 죽음이 두렵지 않다.',
    hint:'죽음 앞에서 역설적으로 평온함이 찾아온다.',
    awakeCond:'죽음 직전이거나 죽음 관련 이벤트',
    awakePatterns:[/죽음|임박|사망.*직전|마지막.*숨|불사/i],
    skill:'죽음 거부',      skillDesc:'즉사 1회 무효화, END+20, 이후 5턴간 HP 재생 +10/턴',
    passiveStats:{ end:7, wil:5 },
    awakeStats:  { end:25, wil:15 },
    evolveHint:'죽음에 가까울수록 죽음계약혈이 강해진다.',
    lore:'죽음의 신과 직접 거래한 언데드 가문.',
  },
  memory_eater: {
    name:'기억 흡수 혈통',  icon:'🧠', color:'#407080', raceFor:['언데드'],
    desc:'죽은 자의 기억을 흡수하는 가문의 피. 지식이 쌓인다.',
    hint:'죽은 자의 흔적이 있는 장소에서 강렬한 기억 조각이 보인다.',
    awakeCond:'전사한 자의 근처이거나 기억·과거 관련 이벤트',
    awakePatterns:[/망자|죽은.*기억|과거.*목소리|유령|전사.*기억/i],
    skill:'기억 흡수',      skillDesc:'대상의 기술·지식 일시 흡수, INT+20, PER+15',
    passiveStats:{ int:6, per:5 },
    awakeStats:  { int:20, per:15 },
    evolveHint:'회차가 쌓일수록 더 많은 기억을 흡수한다.',
    lore:'죽은 자의 기억에서 힘을 얻는 언데드 고대 가문.',
  },
});

window.BLOODLINE_MASTER = BLOODLINE_MASTER;

export const BL_V2_KEY = 'taleforge-bloodline';

export function loadBL(){ try{ return JSON.parse(lsGet(BL_V2_KEY)||'null'); }catch(e){ return null; } }
window.loadBL = loadBL;

export function saveBL(d){ lsSet(BL_V2_KEY, JSON.stringify(d)); }
window.saveBL = saveBL;

window.loadBL = loadBL;

window.saveBL = saveBL;

export function autoAssignBloodline(){
  if(loadBL()?.type) return; // 이미 있으면 스킵

  const char = S.character;
  if(!char) return;

  // 종족별 혈통 가중치 — 종족 전용 혈통 우선 배정
  const RACE_WEIGHT = {
    // 종족 전용(높은 가중치) + 범용(낮은 가중치) 혼합
    '인간':      { hero_blood:35, fate_blood:25, royal:15, arcane:10, shadow:8, feral:7 },
    '엘프':      { star_blood:40, forest_blood:35, arcane:15, ancient:10 },
    '드워프':    { forge_blood:40, stone_blood:35, feral:15, royal:10 },
    '오크':      { warchief_blood:40, blood_shaman:35, feral:15, cursed:10 },
    '다크링':    { void_walker:40, curse_weaver:35, shadow:15, void:10 },
    '세레스티얼':{ divine_chosen:40, light_herald:35, celestial:15, royal:10 },
    '드래곤혈':  { dragon:60, feral:20, arcane:20 },
    '악마족':    { contract_lord:35, chaos_blood:35, demonic:20, shadow:10 },
    '언데드':    { death_pact:40, memory_eater:35, void:15, cursed:10 },
  };

  const race = char.race||'인간';
  const weights = RACE_WEIGHT[race] || RACE_WEIGHT['인간'];
  const total = Object.values(weights).reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  let picked = Object.keys(BLOODLINE_MASTER)[0];
  for(const [k,w] of Object.entries(weights)){
    r -= w;
    if(r <= 0){ picked = k; break; }
  }

  const def = BLOODLINE_MASTER[picked];

  // 혈통 데이터 저장
  const bl = {
    type:       picked,
    name:       def.name,
    icon:       def.icon,
    awakened:   false,
    awakeCount: 0,
    passiveApplied: false,
    discoveredAt: S.msgCount||0,
    origin:     null, // AI가 나중에 서사에서 자연스럽게 드러냄
  };
  saveBL(bl);

  // 패시브 스탯 즉시 적용
  applyBloodlinePassive(picked);

  // AI에게 혈통 힌트 주입 (플레이어에게 직접 알리지 않음)
  S._nextInjectedContext = (S._nextInjectedContext||'')
    +`\n[🩸 숨겨진 혈통 배정 — AI 전용 정보, 플레이어에게 직접 알리지 말 것]`
    +`\n이 캐릭터는 "${def.name}" 혈통을 가지고 있다.`
    +`\n힌트: "${def.hint}"`
    +`\n각성 조건: "${def.awakeCond}"`
    +`\n각성 시 스킬: "${def.skill} — ${def.skillDesc}"`
    +`\n이 혈통의 징후를 서사 속에 자연스럽게 암시하라. 절대 직접 선언하지 말고, 플레이어가 스스로 눈치채게 하라.`;

  console.log(`[Bloodline] 자동 배정: ${def.name} (${picked})`);
}
window.autoAssignBloodline = autoAssignBloodline;

window.autoAssignBloodline = autoAssignBloodline;

export function applyBloodlinePassive(typeId){
  const def = BLOODLINE_MASTER[typeId];
  if(!def||!S.stats) return;
  const bl = loadBL();
  if(bl?.passiveApplied) return;

  Object.entries(def.passiveStats||{}).forEach(([k,v])=>{
    if(S.stats[k]!==undefined) S.stats[k]=Math.min(999,(S.stats[k]||0)+v);
  });
  if(bl){ bl.passiveApplied=true; saveBL(bl); }
}
window.applyBloodlinePassive = applyBloodlinePassive;

window.applyBloodlinePassive = applyBloodlinePassive;
