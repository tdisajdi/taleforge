// [5] 직업 시스템 — data
// Pure data split out of job/208-5-직업-시스템.js (see generate.js).

export const JOB_DEFS = {
  warrior:      { name:'전사',     icon:'⚔️',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></svg>', stats:{ str:15, agi:5 },  desc:'근접 전투의 달인' },
  mage:         { name:'마법사',   icon:'🔮',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></svg>', stats:{ int:15, mp:30 },  desc:'마법 에너지를 다루는 자' },
  rogue:        { name:'도적',     icon:'🗡️',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></svg>', stats:{ agi:15, lck:10 }, desc:'그림자 속의 암살자' },
  ranger:       { name:'레인저',   icon:'🏹',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 L19 5"/><path d="M19 5 L14 5 L19 10 Z"/><path d="M5 19 L6 15 L9 18 Z"/><path d="M3 12 C3 12 8 10 12 3" stroke-width="1.3"/></svg>', stats:{ per:15, agi:10 }, desc:'자연의 사냥꾼' },
  paladin:      { name:'성기사',   icon:'🛡️',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L19 6 L19 12 C19 17 15.5 20 12 21.5 C8.5 20 5 17 5 12 L5 6 Z" stroke-linejoin="round"/><path d="M12 8 L12 15 M9 11.5 L15 11.5" stroke-width="1.3"/></svg>', stats:{ str:10, fath:20 },desc:'신의 의지를 집행하는 자' },
  necromancer:  { name:'강령술사', icon:'💀',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>', stats:{ int:20, fear:10 },desc:'죽음의 마력을 다루는 자' },
  archmage:     { name:'대마법사', icon:'✨',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L13.5 8.5 L20 7 L15 12 L18 18.5 L12 15 L6 18.5 L9 12 L4 7 L10.5 8.5 Z" stroke-linejoin="round"/></svg>', stats:{ int:30, mp:50 },  desc:'마법의 극한을 탐구하는 자' },
  swordmaster:  { name:'검성',     icon:'⚔️',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L12 18"/><path d="M7 6 L17 6"/><path d="M9 22 L9 18 L15 18 L15 22"/></svg>', stats:{ str:25, agi:20 }, desc:'검의 도를 깨달은 자' },
  shadowblade:  { name:'그림자검', icon:'🌑',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.6" stroke="none"/></svg>', stats:{ agi:25, lck:15 }, desc:'어둠과 하나된 검사' },
  dragoon:      { name:'용기사',   icon:'🐉',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/></svg>', stats:{ str:20, agi:15 }, desc:'용의 힘을 빌린 기사' },
  merchant:     { name:'상인',     icon:'💰',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" stroke-width="1.4"/><path d="M12 7.5 L12 16.5 M9.5 9.3 C9.5 8.2 10.5 7.5 12 7.5 C13.5 7.5 14.5 8.3 14.5 9.4 C14.5 10.6 13.5 11 12 11.3 C10.5 11.6 9.5 12.2 9.5 13.4 C9.5 14.5 10.5 15.3 12 15.3 C13.5 15.3 14.5 14.6 14.5 13.5" stroke-width="1.2"/></svg>', stats:{ neg:15, lck:10 }, desc:'황금의 혀를 가진 상인' },
  blacksmith:   { name:'대장장이', icon:'🔨',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 3.5 L20.5 9.5 L17 13 L11 7 Z" stroke-width="1.3"/><path d="M11 7 L4 14 C3.3 14.7 3.3 15.8 4 16.5 C4.7 17.2 5.8 17.2 6.5 16.5 L13.5 9.5"/></svg>', stats:{ str:10 },         desc:'불과 철의 장인' },
  scholar:      { name:'학자',     icon:'📚',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L4 19 L11 19 L11 4 Z" stroke-linejoin="round"/><path d="M13 4 L13 19 L20 19 L20 4 Z" stroke-linejoin="round"/></svg>', stats:{ int:10, wis:10 }, desc:'지식의 탐구자' },
  priest:       { name:'성직자',   icon:'⛪',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21 L6 12 L12 5 L18 12 L18 21 Z" stroke-linejoin="round"/><path d="M12 2 L12 6 M10 4 L14 4"/></svg>', stats:{ fath:20, wis:10 },desc:'신앙의 수호자' },
  bard:         { name:'음유시인', icon:'🎵',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/><path d="M9.5 18 L9.5 6 L19.5 4 L19.5 16" /></svg>', stats:{ cha:15, spk:10 }, desc:'음악으로 세계를 노래하는 자' },
};

export const ALIGN_AXES = {
  holy:    { label:'신성',   icon:'✝️', color:'#c8a96e', stats:{ fath:1.0, wil:0.4 } },
  dark:    { label:'어둠',   icon:'🌑', color:'#8040a0', stats:{ fear:1.0, neg:0.5, mad:0.6, disg:0.3 } },
  arcane:  { label:'비전',   icon:'🔮', color:'#4a6fa5', stats:{ int:1.0, mgc:0.7 } },
  martial: { label:'무예',   icon:'⚔️', color:'#c06040', stats:{ str:1.0, agi:0.5, end:0.3 } },
};

export const JOB_ALIGNMENTS = [
  { match:['paladin','성기사','팔라딘','신성기사','crusader','성전사'],           axis:'holy',    opposite:'dark' },
  { match:['priest','cleric','성직자','사제','archbishop','대주교','oracle','신관'], axis:'holy',    opposite:'dark' },
  { match:['exorcist','퇴마사','이단심문','inquisitor'],                          axis:'holy',    opposite:'dark' },
  { match:['necromancer','강령술사','dark_priest','암흑사제','warlock','흑마법사','abyss','심연'], axis:'dark', opposite:'holy' },
  { match:['assassin','암살자','뒤','shadowblade','그림자검','ninja','닌자'],       axis:'dark',    opposite:'holy' },
  { match:['mage','마법사','archmage','대마법사','elementalist','원소술사','summoner','소환사','chronomancer','시간술사','sage','현자','scholar','학자','enchanter','인챈터'], axis:'arcane', opposite:'martial' },
  { match:['warrior','전사','swordmaster','검성','berserker','광전사','gladiator','검투사','dragoon','용기사','warlord','군주','guardian','수호자'], axis:'martial', opposite:'arcane' },

  // [신규] 51개 전투직업(T2 파생 40 + 대륙전용 14) 전체를 대상으로
  // 종족-직업 부조화 판정이 걸리도록 추가 — 원래 여기 없던 궁수 계열
  // 5종 전체와 도적·대륙전용 다수가 이 매핑이 없어 부조화 시스템 자체가
  // 적용되지 않던 결함을 수정했다. 예: 뱀파이어(dark)+세계수 수호자(holy,
  // 신규 매핑)도 이제 정상적으로 정반대 축 부조화가 걸린다.
  { match:['poisoner','독술사'], axis:'dark', opposite:'holy' },
  { match:['bounty_hunter','현상금 사냥꾼','sniper','스나이퍼','ranger','삼림 정찰대','crossbow_master','석궁 전문가','wind_archer','바람의 궁수','hunter','사냥꾼','ice_knight','빙설 기사','sword_emperor_heir','검황','steam_knight','증기 기사','runesmith','룬 대장장이'], axis:'martial', opposite:'arcane' },
  { match:['magic_archer','마법 궁수','imperial_sorcerer','황실 술사','automaton_master','자동인형 조종사','ancient_seeker','고대 마법 탐구자','starlight_archer','별빛 궁수','tide_sorcerer','조류 술사','golem_engineer','골렘 기술자'], axis:'arcane', opposite:'martial' },
  { match:['sun_priest','태양 신관','world_tree_keeper','세계수 수호자'], axis:'holy', opposite:'dark' },
  { match:['rune_warrior','룬 전사'], axis:'martial', opposite:'arcane' },
  // pirate/storm_pirate/spy/gambler(해적·첩자·도박사 등 무법자 계열)는
  // 의도적으로 축을 배정하지 않는다 — 신성/어둠/비전/무예 어느 쪽에도
  // 뚜렷이 속하지 않는 자유로운 정체성이 이 직업들의 lore와 더 맞는다.
];

export const DISSONANCE_STAGES = [
  { min:0,  max:19,  stage:0, label:'평온',     desc:'장비와 정체성이 온전히 조화롭다.' },
  { min:20, max:39,  stage:1, label:'위화감',   desc:'손에 익지 않은 힘이 미세하게 거슬린다.',
    aiHint:'장비 위화감 1단계: 어울리지 않는 장비를 쓰는 캐릭터가 문득 손의 이질감이나 스스로에 대한 낯섦을 느끼는 짧은 묘사를 자연스럽게 섞으십시오. 아직 겉으로 드러날 정도는 아닙니다.' },
  { min:40, max:59,  stage:2, label:'균열',     desc:'정체성의 균열이 서서히 드러나기 시작한다.', statPenalty:0.5,
    aiHint:'장비 균열 2단계: 캐릭터의 정체성과 장비 사이의 부조화가 주변 NPC의 눈에도 띄기 시작합니다. 동료나 지인이 "요즘 좀 달라 보인다"는 식의 반응을 보일 수 있습니다.' },
  { min:60, max:79,  stage:3, label:'변질',     desc:'힘의 근원이 변질되어 원래의 정체성과 멀어지고 있다.', statPenalty:1,
    aiHint:'장비 변질 3단계: 캐릭터의 외형이나 분위기에 실제 변화가 드러날 시점입니다(눈빛, 말투, 기운 등). 원래 정체성을 아는 NPC들이 우려나 경계를 표할 수 있습니다. 이 단계부터 되돌릴지 받아들일지의 선택이 서사적으로 중요해집니다.' },
  { min:80, max:100, stage:4, label:'전락',     desc:'완전히 다른 존재로 전락하기 직전이다.', statPenalty:1.5,
    aiHint:'장비 전락 4단계: 정체성이 거의 전복된 상태입니다. 원래의 직업/정체성으로는 설명할 수 없는 존재가 되어가고 있습니다. 이는 새로운 전직이나 각성, 혹은 필사적인 회귀 시도로 이어질 수 있는 중대한 전환점입니다.' },
];

export const RACE_ALIGNMENTS = {
  human:     null,        // 인간은 축 없음(만물의 균형) — 부조화 시스템 자체 미적용
  elf:       'arcane',
  dwarf:     'martial',
  orc:       'martial',
  darkling:  'dark',
  celestial: 'holy',
  dragon:    'martial',   // 드래곤혈 — 화염·힘 중심이라 martial에 가장 가까움
  demon:     'dark',
  undead:    'dark',
  beastman:  'martial',
  elemental: 'arcane',
  vampire:   'dark',
};

export const RACE_ALIGNMENT_KEYWORDS = {
  human:['인간','human'], elf:['엘프','elf'], dwarf:['드워프','dwarf'], orc:['오크','orc'],
  darkling:['다크링','darkling'], celestial:['세레스티얼','celestial'],
  dragon:['드래곤','dragon','용혈'], demon:['악마','demon'], undead:['언데드','undead'],
  beastman:['수인','beastman'], elemental:['원소인','elemental'], vampire:['뱀파이어','vampire'],
};
