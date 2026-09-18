// [NEW] 직업 조합 시너지 시스템 — data
// Pure data split out of job/035-NEW-직업-조합-시너지-시스템.js (see generate.js).

export const JOB_SYNERGIES = [
  { id:"death_blood",   jobs:["죽음의 기사","혈마법사"],      icon:"💀🩸", name:"피의 죽음",       desc:"피로 소환된 언데드 부하가 자동 등장. STR +12, MGC +12, FEAR +10.", bonus:{ str:12, mgc:12, fear:10 }, aiHint:"피의 죽음 시너지! 죽음의 기사와 혈마법사의 힘이 합쳐져 피로 빚어진 언데드 군단을 소환합니다." },
  { id:"shadow_death",  jobs:["그림자 무도가","죽음의 기사"], icon:"🌑💀", name:"죽음의 그림자",   desc:"그림자 속에서 죽음의 낫을 휘두른다. AGI +15, CRIT +15.", bonus:{ agi:15, crit:15 }, aiHint:"죽음의 그림자 시너지! 그림자처럼 움직이며 죽음의 낫으로 기습하는 완벽한 암살 기술을 구사합니다." },
  { id:"arcane_time",   jobs:["대마법사","시간 직조자"],      icon:"⚡⏳", name:"시공간 마법",     desc:"시간과 마법이 융합. 과거 턴의 마법 효과 재발동. MGC +15, INT +12.", bonus:{ mgc:15, int:12 }, aiHint:"시공간 마법 시너지! 과거의 마법 주문이 현재에 다시 울려 퍼집니다. 같은 마법이 두 번 발동되는 듯한 묘사를 사용하십시오." },
  { id:"berserker_soul",jobs:["광전사","영혼 수확자"],        icon:"🔴⛓️", name:"분노의 수확",     desc:"쓰러진 적의 영혼이 분노를 더 강하게 만든다. STR +18, END +8.", bonus:{ str:18, end:8 }, aiHint:"분노의 수확 시너지! 쓰러진 적마다 영혼이 전사를 더욱 강하게 만듭니다. 전투할수록 폭발적으로 강해지는 묘사를 사용하십시오." },
  { id:"star_sage",     jobs:["별의 부름자","현자"],          icon:"🌠📚", name:"천문 현자",       desc:"별의 지혜와 학문이 융합. 모든 판정 +8, LUK +12, INT +12.", bonus:{ luk:12, int:12 }, aiHint:"천문 현자 시너지! 별의 이치와 세상의 이치가 하나로 합쳐집니다. 어떤 상황도 별의 지혜로 꿰뚫는 묘사를 사용하십시오." },
  { id:"loop_god",      jobs:["루프 파괴자","신살자"],        icon:"🔄⚡", name:"신의 파괴자",     desc:"신의 규칙과 환생의 규칙 모두를 부순다. 모든 스탯 +10.", bonus:{ str:10, mgc:10, int:10, per:10, wil:10 }, aiHint:"신의 파괴자 시너지! 신과 운명의 규칙 모두를 동시에 무시합니다. 불가능한 것을 당연하게 해내는 압도적인 묘사를 사용하십시오." },
  { id:"iron_undying",  jobs:["철혈 수도승","공허 보행자"],   icon:"🪨🌑", name:"불괴 허공",       desc:"육체와 허공이 하나. 공격이 통하지 않는 몸. END +20, HP +20.", bonus:{ end:20, hp:20 }, aiHint:"불괴 허공 시너지! 완벽히 단련된 몸이 반쯤 허공에 속해 있어 공격이 닿지 않습니다. 피해를 흘려내는 신비로운 묘사를 사용하십시오." },
  { id:"karma_god",     jobs:["업보 화신","신격 군주"],       icon:"⚖️👑", name:"심판의 군주",     desc:"선악의 업보로 신격에 이른 자. REP +20, WIL +15, LUK +15.", bonus:{ rep:20, wil:15, luk:15 }, aiHint:"심판의 군주 시너지! 선과 악의 모든 업보를 신격으로 승화시킨 자입니다. 어떤 행동에도 응당한 인과가 따르는 묘사를 사용하십시오." },
  { id:"dragon_demon",  jobs:["드래곤혈(종족)","악마족(종족)"], icon:"🐉😈", name:"혼돈의 화신",  desc:"용의 본능과 악마의 교활함. STR +10, MGC +10, FEAR +12, NEG +8.", bonus:{ str:10, mgc:10, fear:12, neg:8 }, aiHint:"혼돈의 화신 시너지! 용의 폭력성과 악마의 교활함이 공존합니다. 힘으로도 머리로도 압도하는 이중적 묘사를 사용하십시오." },
  { id:"phantom_rune",  jobs:["방랑 검귀","룬 각인사"],       icon:"👻🔣", name:"검귀의 룬",      desc:"검귀의 혼이 룬을 새기다. CRIT +15, MGC +10, STR +8.", bonus:{ crit:15, mgc:10, str:8 }, aiHint:"검귀의 룬 시너지! 검귀의 혼이 직접 몸에 룬을 새겨넣는 신비로운 묘사를 사용하십시오. 검격마다 룬이 빛납니다." },
];

export const ELEMENT_DEFS = {
  fire:     { id:'fire',     name:'불',   icon:'🔥', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/></svg>', color:'#ff6030', desc:'열기와 파괴. 물에 약하고 얼음을 녹인다.',           statBonus:{str:8,mgc:5},   bgColor:'#2a0f00' },
  water:    { id:'water',    name:'물',   icon:'💧', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C12 3 6 11 6 15.5 C6 18.5 8.7 21 12 21 C15.3 21 18 18.5 18 15.5 C18 11 12 3 12 3 Z" stroke-linejoin="round"/></svg>', color:'#4080ff', desc:'유연함과 치유. 불을 끄고 번개에 약하다.',            statBonus:{agi:5,mgc:8},   bgColor:'#000a2a' },
  earth:    { id:'earth',    name:'땅',   icon:'🪨', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16 C4 13 6.5 10 9.5 9.5 C10.5 7 13 5.5 16 6.5 C19 7.3 20.5 10 20 13 C21.5 14 21.5 16.5 20 18 C19 19 17.5 19 16.5 18.5 C15.5 19.5 13.5 20 12 19 C10.5 20 8 19.5 7 18 C5 18.5 3.5 17.5 4 16 Z" stroke-linejoin="round"/></svg>', color:'#90a030', desc:'불굴의 방어. 번개를 흡수하고 바람에 약하다.',        statBonus:{end:10,str:5},  bgColor:'#0a0f00' },
  wind:     { id:'wind',     name:'바람', icon:'🌪️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8 L15 8 C17 8 18 6.5 18 5 C18 3.5 17 2.5 15.5 2.5" /><path d="M3 12 L18 12 C20.5 12 21.5 14 21.5 15.5 C21.5 17.5 20 19 18 19" /><path d="M3 16 L11 16 C12.5 16 13.5 17 13.5 18.3 C13.5 19.5 12.5 20.5 11.3 20.5" /></svg>', color:'#a0e0ff', desc:'속도와 회피. 땅 속성을 압도하고 불에 약하다.',       statBonus:{agi:12,per:5},  bgColor:'#001020' },
  light:    { id:'light',    name:'빛',   icon:'✨', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L13.5 8.5 L20 7 L15 12 L18 18.5 L12 15 L6 18.5 L9 12 L4 7 L10.5 8.5 Z" stroke-linejoin="round"/></svg>', color:'#ffe060', desc:'성스러운 힘. 어둠을 정화하고 눈을 멀게 한다.',       statBonus:{mgc:10,wil:6},  bgColor:'#201a00' },
  dark:     { id:'dark',     name:'어둠', icon:'🌑', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.6" stroke="none"/></svg>', color:'#9060d0', desc:'공포와 허무. 빛을 삼키고 정신을 흔든다.',            statBonus:{mgc:10,neg:8},  bgColor:'#0a0015' },
  lightning:{ id:'lightning',name:'번개', icon:'⚡', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 L6 13 L11 13 L10 22 L18 10 L13 10 Z" stroke-linejoin="round"/></svg>', color:'#ffee00', desc:'빠르고 날카로운 충격. 물에 전달되고 땅에 흡수.',    statBonus:{str:8,agi:8},   bgColor:'#1a1600' },
  ice:      { id:'ice',      name:'얼음', icon:'❄️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L12 22 M4 7 L20 17 M20 7 L4 17"/></svg>', color:'#80d0ff', desc:'냉기와 속박. 불에 녹고 바람에 더욱 강해진다.',       statBonus:{mgc:8,end:7},   bgColor:'#00101a' },
  physical: { id:'physical', name:'물리', icon:'⚔️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></svg>', color:'#c8a96e', desc:'순수한 힘. 마법에는 덜 통하지만 모든 것을 꿰뚫는.',  statBonus:{str:12,end:5},  bgColor:'#1a0f00' },
  magic:    { id:'magic',    name:'마법', icon:'🔮', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></svg>', color:'#d060ff', desc:'마나의 흐름. 물리 방어를 무시하고 마법 저항에 약.',  statBonus:{mgc:12,int:5},  bgColor:'#150030' },
  poison:   { id:'poison',   name:'독',   icon:'☠️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>', color:'#60c040', desc:'서서히 갉아먹는 독. 누적될수록 더 강해진다.',        statBonus:{agi:8,neg:10},  bgColor:'#001a00' },
  time:     { id:'time',     name:'시간', icon:'⏳', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3 L18 3 L18 7 L13 12 L18 17 L18 21 L6 21 L6 17 L11 12 L6 7 Z" stroke-linejoin="round"/></svg>', color:'#ffa060', desc:'시공간 조작. 모든 속성에 중립이나 극히 희귀하다.',   statBonus:{int:10,luk:8},  bgColor:'#1a0800' },
};

export const AFFINITY_TABLE = {
  fire:     { strong:['ice','wind','earth'],   weak:['water','fire'],    neutral:['physical','magic','poison','time','lightning','dark','light'] },
  water:    { strong:['fire','earth','poison'],weak:['lightning','water'],neutral:['physical','magic','time','wind','ice','dark','light'] },
  earth:    { strong:['lightning','fire'],     weak:['wind','water'],    neutral:['physical','magic','poison','time','ice','dark','light'] },
  wind:     { strong:['earth','ice'],          weak:['fire','lightning'],neutral:['physical','magic','poison','time','water','dark','light'] },
  light:    { strong:['dark','poison'],        weak:['dark'],            neutral:['physical','magic','time','fire','water','earth','wind','ice','lightning'] },
  dark:     { strong:['light','magic'],        weak:['light'],           neutral:['physical','time','fire','water','earth','wind','ice','lightning','poison'] },
  lightning:{ strong:['water','wind'],         weak:['earth','lightning'],neutral:['physical','magic','poison','time','fire','ice','dark','light'] },
  ice:      { strong:['wind','earth'],         weak:['fire','ice'],      neutral:['physical','magic','poison','time','water','lightning','dark','light'] },
  physical: { strong:['poison','ice'],         weak:['magic','wind'],    neutral:['time','fire','water','earth','lightning','dark','light'] },
  magic:    { strong:['physical','dark'],      weak:['time','light'],    neutral:['fire','water','earth','wind','ice','lightning','poison'] },
  poison:   { strong:['physical','earth'],     weak:['light','fire'],    neutral:['magic','time','water','wind','ice','lightning','dark'] },
  time:     { strong:['magic','light'],        weak:['dark'],            neutral:['fire','water','earth','wind','ice','lightning','physical','poison'] },
};

export const RACE_ELEMENT_MAP = {
  '인간':      'physical',
  '엘프':      'wind',
  '드워프':    'earth',
  '오크':      'physical',
  '언데드':    'dark',
  '다크링':    'dark',
  '드래곤혈':  'fire',
  '세레스티얼':'light',
  '악마족':    'dark',
  '수인':      'earth',
  '원소인':    'magic',
  '뱀파이어':  'dark',
};

export const JOB_ELEMENT_MAP = {
  '전사':    'physical',
  '기사':    'physical',
  '마법사':  'magic',
  '암살자':  'dark',
  '도적':    'dark',
  '사제':    'light',
  '성직자':  'light',
  '드루이드':'earth',
  '해적':    'water',
  '마녀':    'poison',
  '연금술':  'poison',
  '사무라이':'lightning',
  '무사':    'lightning',
  '빙술사':  'ice',
  '얼음':    'ice',
  '바람':    'wind',
  '궁수':    'wind',
  '불꽃':    'fire',
  '화염':    'fire',
  '시간':    'time',
  '사냥꾼':  'earth',
};
