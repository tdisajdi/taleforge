// 🐾 수인족 패널 렌더 — data
// Pure data split out of race/260-수인족-패널-렌더.js (see generate.js).
import { loadTitles } from '../job/010-스킬-강화-시스템.js';
import { S } from './084-TaleForge-순수-JS-엔진.js';

export const BEAST_INSTINCT_GAIN = {
  shapeshift:    { label:'야수 변신',       icon:'🐾', gain:18, desc:'야수 형태로 변신하거나 부분 변신했다' },
  bloodFight:    { label:'선혈 격투',        icon:'🩸', gain:14, desc:'피를 뒤집어쓰는 격렬한 전투를 했다' },
  territoryMark: { label:'영역 표시',        icon:'🗺️', gain:12, desc:'자신의 영역을 표시하거나 선언했다' },
  beastSpeak:    { label:'야수어 사용',      icon:'🦴', gain:10, desc:'야수어로 동물 또는 야수와 소통했다' },
  ritualHunt:    { label:'집단 사냥 의식',   icon:'🌕', gain:8,  desc:'무리와 함께 사냥 의식을 수행했다' },
};

export const BEAST_SUPPRESS_METHODS = [
  { id:'suppress_meditation', name:'야성 명상',      icon:'🌿', cost:{}, reduce:25,
    desc:'야성을 억누르는 명상. 각성도 -25. 사냥꾼 윤리 60 이상일 때만 가능.',
    req:'사냥꾼의 윤리 60 이상' },
  { id:'suppress_pack_ritual', name:'무리 유대 의식', icon:'🐾', cost:{}, reduce:35,
    desc:'무리와의 유대를 통해 야성을 달랜다. 각성도 -35. 무리 멤버 2명 이상 필요.',
    req:'무리 멤버 2명 이상' },
  { id:'suppress_human_life', name:'인간 세계 생활', icon:'🏙️', cost:{}, reduce:20,
    desc:'인간 사회 속에서 의식적으로 야성을 억누른다. 각성도 -20.',
    req:'언제든 사용 가능' },
  { id:'suppress_force_seal', name:'강제 자기 봉인', icon:'⛓️', cost:{hp:30}, reduce:50,
    desc:'야수성을 강제로 봉인한다. 각성도 -50, HP -30. 2턴간 야수 스킬 봉인.',
    req:'HP 30 이상 필요' },
];

export const PACK_RULES = [
  { id:'never_abandon',  label:'버리지 않는다',  icon:'🛡️', desc:'전투 중 무리원을 홀로 남기고 도망치지 않는다. 위반 시 배신 카운트 +2.' },
  { id:'share_hunt',     label:'사냥을 나눈다',  icon:'🥩', desc:'사냥 성과는 무리와 함께 나눈다. 이행 시 유대도 +5.' },
  { id:'protect_weak',   label:'약자를 지킨다',  icon:'🌿', desc:'무리 중 가장 약한 자를 가장 먼저 보호한다. 이행 시 무리 강도 +10.' },
  { id:'no_secret',      label:'비밀을 숨기지 않는다', icon:'👁️', desc:'무리와 관련된 정보를 숨기지 않는다. 위반 시 유대도 전체 -10.' },
  { id:'answer_howl',    label:'울부짖음에 응한다', icon:'🌕', desc:'무리원의 소집 신호에 반드시 응한다. 이행 시 무리 강도 +8.' },
];

export const LONE_WOLF_PENALTY = { cha:-20, trst:-18, ldr:-15, str:-8 };

export const BEAST_LINEAGES = [
  {
    id: 'wolf', name: '늑대 계보', icon: '🐺', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 C4 16 6 14 6 11 C6 8.5 7.5 7 9.5 7 C11.5 7 13 8.5 13 11 C13 14 15 16 15 20"/><path d="M15 20 C15 17 16.5 15.5 18 15.5 C19.5 15.5 20.5 17 20.5 19"/></svg>', color: '#8090d0',
    concept: '무리와 달빛. 추적자이자 수호자.',
    lore: '태초의 늑대 정령에서 갈라진 혈통. 홀로 강하지만 무리와 함께라면 더욱 강하다. 보름달 아래서 진정한 힘을 발휘한다.',
    baseBonus: { per:12, agi:10, str:8, end:6 },
    stages: [
      { purity:0,   name:'늑대의 피',   icon:'🐺',  desc:'늑대 혈통의 기초. 청각과 후각이 예민해진다.',
        skills:[{ id:'wl_s1_moontrack', name:'달빛 추적', icon:'🌙', type:'passive', rarity:'uncommon', desc:'달빛 아래 모든 흔적 추적. 야간 판정 전체 +15, 매복 불가.', statBoost:{per:120,agi:80}, mpCost:0, condition:'always', conditionDesc:'항시 발동' }] },
      { purity:50,  name:'무리의 전사', icon:'🐺🌙', desc:'무리 유대 시스템과 시너지. 무리원 근처 스탯 증폭.',
        skills:[{ id:'wl_s2_packfight', name:'무리 전투', icon:'⚔️🐺', type:'passive', rarity:'rare', desc:'무리원이 옆에 있을 때 STR·AGI +20. 무리원이 쓰러지면 분노 자동 발동.', statBoost:{str:160,agi:120}, mpCost:0, condition:'pack_nearby', conditionDesc:'무리원 근처' }] },
      { purity:110, name:'보름달의 화신', icon:'🌕🐺', desc:'보름달 이벤트 시 완전 변신. 극한의 힘.',
        skills:[{ id:'wl_s3_moonform', name:'보름달 변신', icon:'🌕', type:'event', rarity:'epic', desc:'보름달 밤 또는 월식 이벤트 시 완전 변신. STR·AGI·PER 모두 +40, 3턴.', statBoost:{str:320,agi:280,per:200}, mpCost:0, condition:'moon_event', conditionDesc:'보름달 이벤트 시' }] },
      { purity:200, name:'원초 늑대 군주', icon:'👑🐺', desc:'야생 늑대 전부 지배. 달과 연결된 야성의 극점.',
        skills:[{ id:'wl_s4_alpha_wolf', name:'원초 늑대 군주', icon:'👑🌕', type:'active', rarity:'legendary', desc:'MP 0. 반경 내 모든 늑대·수인 자동 복종. STR·PER·AGI +50 영구. 달이 뜬 모든 밤 쿨다운 없음.', statBoost:{str:400,per:320,agi:280,fear:200}, mpCost:0, condition:null, conditionDesc:'직접 발동' }] },
    ],
    finalFormName: '달의 군주', finalFormDesc: '완전한 늑대 신격체. 달과 하나가 된 존재.'
  },
  {
    id: 'tiger', name: '호랑이 계보', icon: '🐯', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><path d="M6 7 L4 3 M18 7 L20 3" stroke-width="1.2"/><path d="M8 11 L10 11 M14 11 L16 11" stroke-width="1.1"/><path d="M9 15 C9 15 10.5 16 12 16 C13.5 16 15 15 15 15" stroke-width="1.1"/></svg>', color: '#e08020',
    concept: '단독의 왕. 압도적 일격.',
    lore: '산신령의 현신에서 비롯된 혈통. 홀로 있을 때 가장 강하며 영역 내에서는 절대자다. 한 번의 포효가 숲 전체를 침묵시킨다.',
    baseBonus: { str:14, crit:12, fear:10, end:6 },
    stages: [
      { purity:0,   name:'호랑이의 피',   icon:'🐯',  desc:'절대적 포식자의 존재감. 약한 적이 자동으로 겁먹는다.',
        skills:[{ id:'tg_s1_apex_gaze', name:'군주의 시선', icon:'👁️🐯', type:'passive', rarity:'uncommon', desc:'첫 전투에서 적 전원 FEAR 판정. 실패 시 1턴 마비. FEAR +15 상시.', statBoost:{fear:120,str:80}, mpCost:0, condition:'combat_start', conditionDesc:'전투 시작 시' }] },
      { purity:50,  name:'영역의 군주',   icon:'🐯🗺️', desc:'영역 표시와 시너지. 영역 내에서 압도적 보너스.',
        skills:[{ id:'tg_s2_domain', name:'영역 지배', icon:'🗺️', type:'passive', rarity:'rare', desc:'영역 표시된 곳에서 STR +25, AGI +15, 치명타 2배. 침입자는 자동 공포 상태.', statBoost:{str:200,crit:160,agi:100}, mpCost:0, condition:'in_territory', conditionDesc:'자신의 영역에서' }] },
      { purity:110, name:'산신의 강림',   icon:'⛰️🐯', desc:'산이나 숲에서 신격화. 자연 자체가 힘을 빌려준다.',
        skills:[{ id:'tg_s3_mountain_god', name:'산신 강림', icon:'⛰️', type:'active', rarity:'epic', desc:'MP 0. 자연 지형에서만 사용 가능. STR·CRIT·FEAR +35, 5턴. 자연 정령들이 보조.', statBoost:{str:280,crit:240,fear:200}, mpCost:0, condition:'nature_terrain', conditionDesc:'자연 지형에서' }] },
      { purity:200, name:'천지를 가르는 호', icon:'🌩️🐯', desc:'완전한 단독 최강자. 무리 없이도 천하를 지배.',
        skills:[{ id:'tg_s4_heaven_slash', name:'천지일격', icon:'🌩️', type:'active', rarity:'legendary', desc:'HP 30 소모. 단 한 번의 공격으로 적 전체에 극한 피해. 강적 FEAR 자동 상태. 쿨다운 없음.', statBoost:{str:480,crit:320,fear:240}, mpCost:0, condition:null, conditionDesc:'직접 발동' }] },
    ],
    finalFormName: '천상의 호왕', finalFormDesc: '홀로 서는 절대자. 하늘과 땅 사이의 유일한 왕.'
  },
  {
    id: 'eagle', name: '독수리 계보', icon: '🦅', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C8 5 4 9 4 14 C4 17 6 19 8 19" /><path d="M12 3 C16 5 20 9 20 14 C20 17 18 19 16 19" /><path d="M9 21 L12 17 L15 21" stroke-linejoin="round"/><circle cx="12" cy="8" r="2.2"/></svg>', color: '#60c0e0',
    concept: '하늘의 지배자. 내려다보는 자.',
    lore: '폭풍의 정령과 결합된 혈통. 높은 곳에서 내려다보며 전장 전체를 꿰뚫는다. 날개를 펼치면 바람 자체가 무기가 된다.',
    baseBonus: { per:14, agi:12, int:8, luk:6 },
    stages: [
      { purity:0,   name:'독수리의 피',   icon:'🦅',  desc:'하늘 위 시야. 먼 거리에서도 적의 움직임을 읽는다.',
        skills:[{ id:'eg_s1_sky_eye', name:'하늘 눈', icon:'🌤️', type:'passive', rarity:'uncommon', desc:'전장 전체를 내려다보는 시야. 매복 탐지, 적 위치 파악. INT·PER +15 상시.', statBoost:{per:120,int:80}, mpCost:0, condition:'always', conditionDesc:'항시 발동' }] },
      { purity:50,  name:'폭풍의 날개',   icon:'🦅💨', desc:'비행·활공 능력 해금. AGI 극한.',
        skills:[{ id:'eg_s2_storm_dive', name:'폭풍 급강하', icon:'💨🦅', type:'active', rarity:'rare', desc:'MP 12. 상공에서 급강하 타격. AGI +30, 치명타 확정. 회피 불가 상태.', statBoost:{agi:240,crit:160}, mpCost:12, condition:null, conditionDesc:'직접 발동' }] },
      { purity:110, name:'폭풍의 군주',   icon:'🌩️🦅', desc:'번개와 폭풍을 다룬다. 날씨 자체가 무기.',
        skills:[{ id:'eg_s3_thunder_wing', name:'천둥 날개', icon:'⚡', type:'active', rarity:'epic', desc:'MP 20. 폭풍 소환으로 범위 내 적 전체 마비+피해. PER·AGI +25, 3턴.', statBoost:{per:200,agi:200,crit:120}, mpCost:20, condition:null, conditionDesc:'직접 발동' }] },
      { purity:200, name:'창공의 신격',   icon:'✨🦅', desc:'하늘의 모든 것이 아래에 있다. 신격 해방.',
        skills:[{ id:'eg_s4_sky_god', name:'창공 해방', icon:'✨', type:'passive', rarity:'legendary', desc:'PER·AGI +60 상시. 하늘에서의 공격은 반드시 치명타. 비행 중 모든 공격 2배.', statBoost:{per:480,agi:400,crit:280}, mpCost:0, condition:'always', conditionDesc:'항시 발동' }] },
    ],
    finalFormName: '하늘의 신조', finalFormDesc: '창공을 지배하는 신격체. 아무것도 그 눈을 피할 수 없다.'
  },
  {
    id: 'bear', name: '곰 계보', icon: '🐻', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="7"/><circle cx="7" cy="6" r="2"/><circle cx="17" cy="6" r="2"/><circle cx="9.5" cy="12" r="0.8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="12" r="0.8" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none"/></svg>', color: '#c08050',
    concept: '대지의 수호자. 불굴의 방벽.',
    lore: '대지의 정령과 계약한 혈통. 어떤 충격도 흡수하고 어떤 독도 버텨낸다. 화가 나면 산을 움직이고, 잠들면 대지가 쉰다.',
    baseBonus: { end:16, str:12, hp:10, wil:8 },
    stages: [
      { purity:0,   name:'곰의 피',       icon:'🐻',  desc:'대지의 피부. 물리 저항과 HP 최대치가 크게 오른다.',
        skills:[{ id:'br_s1_iron_hide', name:'강철 외피', icon:'🛡️', type:'passive', rarity:'uncommon', desc:'물리 피해 15% 감소. HP 최대치 +50. 독·출혈 면역.', statBoost:{end:120,hp:50}, mpCost:0, condition:'always', conditionDesc:'항시 발동' }] },
      { purity:50,  name:'대지의 수호자', icon:'🐻🌿', desc:'무리 중 약자 보호 특화. 보호 대상 대신 피해 흡수.',
        skills:[{ id:'br_s2_guardian', name:'대지 방패', icon:'🌿🛡️', type:'active', rarity:'rare', desc:'MP 0. 무리원 지정 보호. 이번 턴 그 대상에 가는 피해를 대신 받음. END +20.', statBoost:{end:160,hp:80}, mpCost:0, condition:null, conditionDesc:'직접 발동' }] },
      { purity:110, name:'분노의 대지',   icon:'🐻💢', desc:'분노 상태 해금. 피해를 받을수록 강해진다.',
        skills:[{ id:'br_s3_rage_earth', name:'대지의 분노', icon:'💢🐻', type:'passive', rarity:'epic', desc:'HP 50% 이하 시 STR +30, END +20, 피해 20% 추가 감소. 분노할수록 강해진다.', statBoost:{str:240,end:200}, mpCost:0, condition:'low_hp', conditionDesc:'HP 50% 이하' }] },
      { purity:200, name:'산신수호자',     icon:'⛰️🐻', desc:'불사에 가까운 생명력. 대지 자체가 회복한다.',
        skills:[{ id:'br_s4_undying', name:'대지 불사', icon:'♾️🐻', type:'passive', rarity:'legendary', desc:'전투 중 매 턴 HP +20 회복. 사망 직전 1회 HP 절반으로 부활. 모든 상태이상 면역.', statBoost:{end:400,hp:200,str:160}, mpCost:0, condition:'always', conditionDesc:'항시 발동' }] },
    ],
    finalFormName: '대지의 화신', finalFormDesc: '산과 같은 존재. 쓰러뜨릴 수 없는 대지의 신.'
  },
  {
    id: 'snake', name: '뱀 계보', icon: '🐍', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6 C4 6 8 4 10 7 C12 10 8 11 10 14 C12 17 16 15 18 18 C19 19.5 18.5 21 17 21" /><circle cx="17" cy="21" r="1" fill="currentColor" stroke="none"/></svg>', color: '#80d060',
    concept: '독과 지혜. 기다리는 사냥꾼.',
    lore: '원시의 지혜수로부터 이어진 혈통. 빠르게 공격하지 않는다—기다리며 상대가 실수하기를 기다린다. 독이 흐르는 몸은 그 자체로 치명적이다.',
    baseBonus: { per:10, agi:10, int:10, disg:8 },
    stages: [
      { purity:0,   name:'뱀의 피',       icon:'🐍',  desc:'독소 피부. 접촉한 적에게 독 상태이상 부여.',
        skills:[{ id:'sn_s1_venom', name:'독소 외피', icon:'☠️', type:'passive', rarity:'uncommon', desc:'근접 공격한 적에게 독 자동 부여. 독: 매 턴 HP -8. INT·AGI +10 상시.', statBoost:{int:80,agi:64}, mpCost:0, condition:'melee_hit', conditionDesc:'근접 타격 시' }] },
      { purity:50,  name:'독의 장인',     icon:'🐍💜', desc:'독 조합. 전장 전체에 독 안개 살포.',
        skills:[{ id:'sn_s2_venom_fog', name:'독 안개', icon:'💜🌫️', type:'active', rarity:'rare', desc:'MP 15. 범위 내 독 안개 살포. 3턴간 적 전원 독 상태. 아군 면역.', statBoost:{int:120,per:80}, mpCost:15, condition:null, conditionDesc:'직접 발동' }] },
      { purity:110, name:'지혜의 독사',   icon:'🐍✨', desc:'독이 마법과 결합. 상대의 능력을 약화·흡수.',
        skills:[{ id:'sn_s3_wisdom_drain', name:'지혜 흡수', icon:'✨🐍', type:'active', rarity:'epic', desc:'MP 18. 대상 능력치 -15하고 그 수치의 절반을 내가 획득. INT +20 판정 보너스.', statBoost:{int:200,per:120}, mpCost:18, condition:null, conditionDesc:'직접 발동' }] },
      { purity:200, name:'원시 지혜의 뱀', icon:'🌀🐍', desc:'태초의 지혜. 모든 진실을 꿰뚫어 본다.',
        skills:[{ id:'sn_s4_primal_wisdom', name:'원시 지혜', icon:'🌀', type:'passive', rarity:'legendary', desc:'INT·PER +60 상시. 적의 거짓·트릭 자동 간파. 모든 독 면역. 독이 아군에게도 약으로 작용.', statBoost:{int:480,per:360,agi:200}, mpCost:0, condition:'always', conditionDesc:'항시 발동' }] },
    ],
    finalFormName: '원시 지혜의 화신', finalFormDesc: '세계의 모든 독과 지혜를 품은 신격. 처음과 끝을 아는 자.'
  },
];

export const FG_STAGES = [
  { min:-100, max:-60, id:'traitor',    label:'배신자',   icon:'🗡️', color:'#e03030',
    desc:'이 파벌을 적극적으로 반대하거나 배신했다. 해당 파벌 NPC들은 적대적으로 반응한다.',
    statBonus:{},   statPenalty:{rep:-8, trst:-6},
    aiHint:'플레이어는 이 파벌에 배신자로 낙인 찍혔다. 파벌 소속 NPC들이 냉담하거나 적대적으로 대한다.' },
  { min:-60,  max:-20, id:'hostile',    label:'적대',     icon:'⚠️',  color:'#d06030',
    desc:'이 파벌과 대립하는 입장이다. 파벌 NPC들이 불신의 눈초리로 바라본다.',
    statBonus:{},   statPenalty:{rep:-4, trst:-3},
    aiHint:'플레이어는 이 파벌과 갈등 관계다. NPC들이 경계하거나 협력을 거부한다.' },
  { min:-20,  max:20,  id:'neutral',    label:'중립',     icon:'⚖️',  color:'#a09060',
    desc:'어느 파벌에도 완전히 기울지 않은 중립 포지션.',
    statBonus:{luk:2}, statPenalty:{},
    aiHint:'플레이어는 이 파벌에 중립적 입장이다. NPC들이 조심스럽게 접근하거나 관망한다.' },
  { min:20,   max:60,  id:'supporter',  label:'지지자',   icon:'🤝',  color:'#50a060',
    desc:'이 파벌을 지지하는 입장이다. 파벌 NPC들이 우호적으로 협력한다.',
    statBonus:{rep:5, cha:3, neg:3}, statPenalty:{},
    aiHint:'플레이어는 이 파벌 지지자다. 파벌 NPC들이 자연스럽게 정보를 공유하고 의뢰를 준다.' },
  { min:60,   max:100, id:'loyalist',   label:'충신',     icon:'👑',  color:'#c8a030',
    desc:'이 파벌의 열렬한 충신이다. 파벌의 이익을 최우선으로 여기며, 파벌 전체가 지원을 아끼지 않는다.',
    statBonus:{rep:12, cha:6, neg:5, ldr:4}, statPenalty:{trst:-3},
    aiHint:'플레이어는 이 파벌의 충신이다. 파벌 최고위급 NPC들이 신뢰하며 비밀 정보와 특별 의뢰를 맡긴다. 적대 파벌 NPC들은 노골적으로 경계한다.' },
];

export const DEMESNE_UNLOCK_CONDITIONS = [
  // 신분 기반
  { id:'noble_rank',      label:'귀족/영주 신분',       icon:'👑', check:()=> ['귀족','영주','남작','자작','백작','후작','공작','왕족','왕','황족','황제','군주','봉주','성주','영토','領主'].some(k=>(S?.character?.socialRank||'').includes(k)||(S?.character?.socialRankId||'').includes(k)) },
  // 직업/역할 기반
  { id:'guild_master',    label:'길드 마스터/대장',      icon:'⚔️', check:()=> /길드.*마스터|길드.*대장|단장|갱두목|조합장|수장|두목|보스|대가|종주/.test(S?.character?.role||'') },
  { id:'merchant_lord',   label:'상단주/대상인',          icon:'💰', check:()=> /상단주|대상인|무역왕|상업.*왕|거상|재벌/.test(S?.character?.role||'') },
  { id:'high_priest',     label:'대신관/교황/수도원장',   icon:'⛪', check:()=> /대신관|교황|주교|수도원장|대사제|신전장|교주/.test(S?.character?.role||'') },
  { id:'warlord',         label:'군벌/장군/사령관',       icon:'🏹', check:()=> /군벌|장군|사령관|대원수|총사령|지휘관|총독/.test(S?.character?.role||'') },
  { id:'crime_boss',      label:'범죄 조직 수장',         icon:'🌑', check:()=> /암흑가.*수장|조직.*보스|마피아|해적.*선장|도적.*왕|암살.*수장/.test(S?.character?.role||'') },
  // 스탯 기반
  { id:'high_ldr',        label:'리더십 60 이상',         icon:'📜', check:()=> (S?.stats?.ldr||0)>=60 },
  { id:'high_rank',       label:'rank 5 이상',            icon:'🏆', check:()=> (S?.stats?.rank||0)>=5 },
  // 칭호 기반
  { id:'title_lord',      label:'영주 관련 칭호 보유',    icon:'🎖️', check:()=> (loadTitles()||[]).some(t=>/영주|영지|귀족|군주|수호자|지배자/.test(t.name||t.id||'')) },
  // AI 서사 감지 (플래그)
  { id:'story_domain',    label:'서사 내 영지 획득',      icon:'📖', check:()=> {
    const flags = typeof window._gsFlags!=='undefined' ? Object.keys(window._gsFlags) : [];
    return flags.some(f=>/영지|영토|성|요새|근거지|아지트|본부/.test(f));
  }},
];

export const STAGE_BUILDINGS = {
  inn:        { id:'inn',        name:'여관',    icon:'🏨', cost:280, upkeep:6, maxLevel:2, stageReq:1,
    effect:(lv)=>({tax:lv*8, prosperity:lv*6, loyalty:lv*4}),
    aiHint:(lv)=>`${lv}단계 여관이 여행자와 상인들을 맞이한다. 각지의 소식이 모인다.` },
  guild_hall: { id:'guild_hall', name:'길드홀',  icon:'⚜️', cost:600, upkeep:14, maxLevel:2, stageReq:2,
    effect:(lv)=>({tax:lv*15, prosperity:lv*10, defense:lv*5}),
    aiHint:(lv)=>`${lv}단계 길드홀이 도시 중심에 자리한다. 각종 직인과 상인이 이곳을 통해 거래한다.` },
  academy:    { id:'academy',    name:'학술원',  icon:'🎓', cost:800, upkeep:18, maxLevel:2, stageReq:3,
    effect:(lv)=>({prosperity:lv*14, tax:lv*10, loyalty:lv*6}),
    aiHint:(lv)=>`${lv}단계 학술원에서 왕국 최고의 학자들이 연구한다. 인재들이 몰려든다.` },
  colosseum:  { id:'colosseum',  name:'원형경기장', icon:'🏟️', cost:1200, upkeep:25, maxLevel:1, stageReq:4,
    effect:(lv)=>({loyalty:lv*20, prosperity:lv*15, tax:lv*12}),
    aiHint:(lv)=>`원형경기장에서 열리는 대회가 왕국 전역의 관심을 끈다. 영지의 명성이 하늘을 찌른다.` },
};

export const ALL_BUILDINGS_MAP = {};

export const DEMESNE_POLICIES = [
  { id:'heavy_tax',  name:'중과세',     icon:'💰', cost:0, conflict:['low_tax'],
    effect:{tax:20,loyalty:-15,prosperity:-5},
    aiHint:'중과세 시행 중. 영민들이 불만을 품고 있다.' },
  { id:'low_tax',    name:'감세령',     icon:'🎁', cost:0, conflict:['heavy_tax'],
    effect:{tax:-15,loyalty:20,prosperity:10},
    aiHint:'감세령으로 영민들이 매우 만족한다.' },
  { id:'conscript',  name:'징병령',     icon:'⚔️', cost:0, conflict:['open_trade'],
    effect:{defense:25,loyalty:-10,prosperity:-8},
    aiHint:'징병령으로 군사력이 강화됐다.' },
  { id:'open_trade', name:'자유무역령', icon:'🤝', cost:0, conflict:['conscript','fortify'],
    effect:{prosperity:15,tax:10,defense:-5},
    aiHint:'자유무역령으로 외국 상인들이 드나든다.' },
  { id:'fortify',    name:'요새화령',   icon:'🧱', cost:0, conflict:['open_trade'],
    effect:{defense:20,prosperity:-10,tax:-5},
    aiHint:'요새화령 시행 중.' },
  { id:'festival',   name:'축제 선포',  icon:'🎉', cost:300, conflict:[],
    effect:{loyalty:25,prosperity:15,tax:-5},
    aiHint:'영주가 대규모 축제를 열었다.' },
  { id:'immigration_policy', name:'이민 장려령', icon:'🚶', cost:0, conflict:[],
    effect:{prosperity:8,loyalty:5,tax:-5},
    aiHint:'이민 장려령으로 외지인들이 영지에 정착하고 있다. 인구가 빠르게 늘고 있다.',
    popGrowthBonus: 0.04 },
  { id:'birth_incentive', name:'출산 장려금', icon:'👶', cost:0, conflict:[],
    effect:{loyalty:10,tax:-8},
    aiHint:'출산 장려금으로 영지 내 출생률이 높아졌다.',
    popGrowthBonus: 0.03 },
];

export const DEMESNE_SEASONS = [
  { id:0, name:'봄',  icon:'🌸', color:'#90d060',
    popGrowthMod:0.02,
    eventMod:{windfall:0.8,famine:-0.3,drought:-0.5,merchant_visit:1.2,immigration:1.3},
    aiHint:'봄이 찾아와 영지에 활기가 돌고 있다.' },
  { id:1, name:'여름', icon:'☀️', color:'#e0c040',
    popGrowthMod:0.01,
    eventMod:{drought:1.5,windfall:0.5,invasion:1.2,bandit:1.3,overcrowding:1.2},
    aiHint:'뜨거운 여름이다. 가뭄 위험이 높다.' },
  { id:2, name:'가을', icon:'🍂', color:'#d08030',
    popGrowthMod:0.015,
    eventMod:{windfall:1.8,famine:-0.5,merchant_visit:1.5,royal_favor:1.3,immigration:1.2},
    aiHint:'풍요로운 가을이다. 수확이 끝나고 시장이 활기차다.' },
  { id:3, name:'겨울', icon:'❄️', color:'#80b0e0',
    popGrowthMod:-0.01,
    eventMod:{famine:1.6,plague:1.4,revolt:1.2,drought:-0.8,windfall:-0.8,mass_exodus:1.3},
    aiHint:'혹독한 겨울이다. 기근과 역병 위험이 높다.' },
];

export const DEMESNE_TRADE_PARTNERS = [
  { id:'royal_trade',     name:'왕실 교역로',      icon:'👑', requiredFaction:'왕실',       factionThreshold:60, income:15,
    aiHint:'왕실 교역로가 개방되어 있다.' },
  { id:'merchant_guild',  name:'상인 길드 협약',   icon:'💼', requiredFaction:'상인 연합',  factionThreshold:60, income:20,
    aiHint:'상인 길드 깃발이 시장에 걸려 있다.' },
  { id:'knight_supply',   name:'기사단 보급로',    icon:'⚔️', requiredFaction:'기사단',     factionThreshold:55, income:10, defBonus:5,
    aiHint:'기사단 보급로가 영지를 통과한다.' },
  { id:'mage_research',   name:'마법사 길드 연구', icon:'✨', requiredFaction:'마법사 길드', factionThreshold:55, income:8, prosBonus:8,
    aiHint:'마법사 길드 연구원들이 영지에서 활동 중이다.' },
  { id:'thieves_network', name:'도적 길드 정보망', icon:'🕵️', requiredFaction:'도적 길드',  factionThreshold:50, income:12,
    aiHint:'도적 길드의 정보망이 영지를 보호한다.' },
];

export const VASSAL_ROLES = {
  '기사':  { icon:'⚔️', bonus:{defense:5,loyalty:2},   desc:'방어+5, 충성+2' },
  '상인':  { icon:'💰', bonus:{tax:4,prosperity:3},     desc:'세수+4, 번영+3' },
  '학자':  { icon:'📚', bonus:{prosperity:5,tax:2},     desc:'번영+5, 세수+2' },
  '사제':  { icon:'⛪', bonus:{loyalty:6,prosperity:2}, desc:'충성+6, 번영+2' },
  '마법사':{ icon:'✨', bonus:{defense:4,prosperity:4}, desc:'방어+4, 번영+4' },
  '장군':  { icon:'🛡️', bonus:{defense:8,loyalty:1},   desc:'방어+8, 충성+1' },
};

export const DEMESNE_TITLES = [
  { id:'iron_fortress', name:'철옹성',     icon:'🛡️', cond:(r)=>r.defense>=85,
    aiHint:'이 영지는 철옹성으로 유명하다.' },
  { id:'golden_city',   name:'황금 도시',  icon:'💰', cond:(r)=>r.tax>=85,
    aiHint:'황금 도시로 불리는 부유한 영지다.' },
  { id:'paradise',      name:'낙원',       icon:'🌟', cond:(r)=>r.prosperity>=85,
    aiHint:'낙원이라 불리는 영지다.' },
  { id:'loyal_land',    name:'충절의 땅',  icon:'❤️', cond:(r)=>r.loyalty>=90,
    aiHint:'충절의 땅이다. 영민들이 목숨을 바쳐 영주를 지킨다.' },
  { id:'balanced',      name:'이상적 영지',icon:'⚖️', cond:(r)=>r.tax>=65&&r.prosperity>=65&&r.defense>=65&&r.loyalty>=65,
    aiHint:'균형 잡힌 이상적인 영지다.' },
  { id:'metropolis',    name:'대도시',     icon:'🌆', cond:(_,d)=>(d&&d.popStage||0)>=3,
    aiHint:'대도시로 성장한 영지다. 왕국의 중심지 중 하나다.' },
  { id:'declining',     name:'쇠퇴하는 땅',icon:'📉', cond:(r)=>(r.tax+r.prosperity+r.defense+r.loyalty)/4<25,
    aiHint:'쇠퇴하는 영지다.' },
];

export const DEMESNE_ACHIEVEMENTS = [
  { id:'first_building', icon:'🏗️', name:'첫 삽',        aiHint:'개발이 시작된 영지다.' },
  { id:'tier3',          icon:'🏰', name:'남작의 권위',   aiHint:'왕국에서 공식 인정받은 남작령이다.' },
  { id:'tier5',          icon:'👑', name:'공작의 위엄',   aiHint:'왕국 최강의 영지 중 하나다.' },
  { id:'pop_2k',         icon:'🏙️', name:'소도시 탄생',  aiHint:'소도시로 성장한 영지다.' },
  { id:'pop_8k',         icon:'🌆', name:'도시의 탄생',   aiHint:'번듯한 도시로 성장했다.' },
  { id:'pop_25k',        icon:'🌇', name:'대도시의 위용', aiHint:'대도시로 성장한 영지다.' },
  { id:'pop_80k',        icon:'👑', name:'왕도에 견주다', aiHint:'왕도에 필적하는 거대 도시다.' },
  { id:'events_10',      icon:'⚡', name:'위기의 극복자', aiHint:'수많은 위기를 극복한 강인한 영지다.' },
  { id:'all_buildings',  icon:'🌟', name:'완전한 개발',   aiHint:'모든 기본 시설이 갖춰진 영지다.' },
  { id:'max_loyalty',    icon:'❤️', name:'영민의 사랑',   aiHint:'영민들이 진심으로 영주를 따른다.' },
  { id:'survive_winter', icon:'❄️', name:'혹한을 견디다', aiHint:'혹독한 겨울을 함께 이겨낸 영주와 영민의 유대.' },
  { id:'plague_survived',icon:'💊', name:'역병 극복',     aiHint:'역병을 이겨낸 강인한 영지다.' },
  { id:'max_vassals',    icon:'⚜️', name:'충직한 가신단', aiHint:'여러 봉신이 영주를 충직하게 보좌하고 있다.' },
  { id:'trade_3',        icon:'🤝', name:'교역의 중심',   aiHint:'다양한 세력과 교역하는 영지다.' },
  { id:'pop_recovered',  icon:'🌱', name:'불사조 도시',   aiHint:'재난을 딛고 다시 일어선 도시다.' },
];
