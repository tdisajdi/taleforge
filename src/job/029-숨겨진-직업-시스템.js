// 숨겨진 직업 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { CRAFT_RECIPES } from '../data/075-파트2-C-크래프팅-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { lsDel, lsGet, lsSet, toast } from '../utils.js';

export const HIDDEN_JOB_KEY     = "taleforge-hidden-jobs";

export const loadHiddenJobs     = () => { const r = lsGet(HIDDEN_JOB_KEY); return r ? JSON.parse(r) : []; };

export const saveHiddenJobs     = (j) => lsSet(HIDDEN_JOB_KEY, JSON.stringify(j));


export const HIDDEN_JOBS = [

  // ════ 각성형 (일반 직업 → 각성) ════

  { id:"death_knight",    icon:"💀", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>`, name:"죽음의 기사",      rarity:"legendary",
    type:"awakening",     baseJob:["기사","전사","검사","팔라딘"],  scenario:["중세 판타지","무협 강호",null],
    desc:"죽음의 힘을 다루는 전사. 방어와 생명력 흡수를 동시에.",
    lore:"죽음의 문턱에서 살아 돌아온 자만이 얻을 수 있는 각성. 검에서 냉기가 흐른다.",
    bonus:{ str:15, end:12, mgc:8, hp:20 },
    unlockType:"death_count",    unlockDesc:"전사 계열로 5회 이상 전투 사망",
    unlockCondition:{ deathCount:5, baseJobMatch:true },
    hint:"죽음을 충분히 경험해야 한다.",
    systemHint:"이 직업의 캐릭터는 죽음의 기운을 다루며, 적의 HP를 흡수하거나 언데드를 소환하는 묘사를 포함할 수 있습니다." },

  { id:"archmage",        icon:"🌌", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.2"/><circle cx="8" cy="9" r="0.8" fill="currentColor" stroke="none"/><circle cx="15" cy="8" r="0.6" fill="currentColor" stroke="none"/><circle cx="16" cy="14" r="0.9" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="0.6" fill="currentColor" stroke="none"/></svg>`, name:"대마법사",          rarity:"legendary",
    type:"awakening",     baseJob:["마법사","주술사","마법학자","마도사","소서러"],  scenario:[null],
    desc:"마법의 근원에 닿은 자. 원소를 자유자재로 다룬다.",
    lore:"수천 번의 주문을 외운 끝에 마법 법칙 자체를 손으로 만지는 경지에 도달했다.",
    bonus:{ mgc:20, int:15, mp:30, per:8 },
    unlockType:"skill_use",      unlockDesc:"마법 계열 스킬 총 30회 이상 사용",
    unlockCondition:{ skillUseCount:30, baseJobMatch:true },
    hint:"마법을 끊임없이 연마해야 한다.",
    systemHint:"이 직업의 캐릭터는 원소를 자유롭게 구사하며, 마법 장면에서 웅장한 스케일의 묘사를 사용하십시오." },

  { id:"shadow_dancer",   icon:"🌑", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.6" stroke="none"/></svg>`, name:"그림자 무도가",    rarity:"rare",
    type:"awakening",     baseJob:["도적","암살자","자객","닌자","레인저"],  scenario:[null],
    desc:"빛과 그림자 사이를 춤추듯 이동하는 극한의 암살자.",
    lore:"그림자를 발판으로 삼는 경지. 눈에 보이지 않는 곳에서 춤추듯 적을 처리한다.",
    bonus:{ agi:18, crit:15, per:10, disg:12 },
    unlockType:"scenario_clear", unlockDesc:"은신/잠입 엔딩 2회 이상 달성",
    unlockCondition:{ stealthEndings:2, baseJobMatch:true },
    hint:"그림자 속에 숨어 적을 처리한 횟수가 쌓여야 한다.",
    systemHint:"이 직업의 캐릭터는 그림자처럼 이동하며, 전투와 이동 묘사에서 유연하고 우아한 표현을 사용하십시오." },

  { id:"oracle",          icon:"🔮", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></svg>`, name:"신탁사",            rarity:"rare",
    type:"awakening",     baseJob:["성직자","사제","신관","힐러","수도사"],  scenario:["중세 판타지","나만의 세계",null],
    desc:"신의 말을 직접 듣는 자. 미래를 엿본다.",
    lore:"기도가 쌓여 마침내 신이 직접 귓속에 속삭이기 시작했다. 그 말은 항상 옳다.",
    bonus:{ per:15, wil:12, fath:20, luk:10 },
    unlockType:"karma_pure",     unlockDesc:"카르마 점수 30 이하 엔딩 3회",
    unlockCondition:{ pureKarmaEndings:3, baseJobMatch:true },
    hint:"순수한 마음으로 신을 섬겨야 한다.",
    systemHint:"이 직업의 캐릭터는 신의 계시를 받으며, 예언적 발언과 신성한 묘사를 자연스럽게 포함하십시오." },

  { id:"warlord",         icon:"⚔️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></svg>`, name:"전쟁군주",          rarity:"rare",
    type:"awakening",     baseJob:["전사","기사","군인","용병"],  scenario:["중세 판타지",null],
    desc:"전장을 지배하는 자. 아군의 사기를 끌어올리고 적을 압도한다.",
    lore:"수백 번의 전투를 이끌며 전장의 흐름 자체가 눈에 보이기 시작했다.",
    bonus:{ str:12, ldr:20, end:10, fear:15 },
    unlockType:"battle_wins",    unlockDesc:"전투 승리 누적 20회 이상",
    unlockCondition:{ battleWins:20, baseJobMatch:true },
    hint:"수많은 전투에서 승리를 쌓아야 한다.",
    systemHint:"이 직업의 캐릭터는 전장을 압도하며, 전투 장면에서 전략적이고 지휘관다운 묘사를 사용하십시오." },

  { id:"artificer",       icon:"⚙️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12 M5.5 5.5 L7.5 7.5 M16.5 16.5 L18.5 18.5 M18.5 5.5 L16.5 7.5 M7.5 16.5 L5.5 18.5" stroke-width="1.2"/></svg>`, name:"마법공학자",        rarity:"rare",
    type:"awakening",     baseJob:["발명가","엔지니어","연금술사","기술자"],  scenario:["사이버펑크","나만의 세계",null],
    desc:"기술과 마법을 융합한 자. 전장을 기계와 마법으로 가득 채운다.",
    lore:"기계와 마법 사이의 경계가 허물어졌다. 이제 이 둘은 하나다.",
    bonus:{ int:15, mgc:12, crit:10, regen:8 },
    unlockType:"craft_count",    unlockDesc:"제작/발명 관련 이벤트 10회 이상",
    unlockCondition:{ craftEvents:10, baseJobMatch:true },
    hint:"끊임없이 만들고 발명해야 한다.",
    systemHint:"이 직업의 캐릭터는 창의적인 도구와 장치를 사용하며, 기발하고 독창적인 해결책을 묘사하십시오." },

  { id:"berserk",         icon:"🔴", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7" fill="currentColor" stroke="none"/></svg>`, name:"광전사",            rarity:"rare",
    type:"awakening",     baseJob:["전사","오크 전사","야만용사","버서커"],  scenario:[null],
    desc:"분노를 동력으로 삼는 자. HP가 낮을수록 더욱 강해진다.",
    lore:"분노의 끝에 이성을 포기한 자에게 찾아오는 힘. 무섭지만 자신도 위험하다.",
    bonus:{ str:20, end:8, hp:15, crit:12 },
    unlockType:"low_hp_survive", unlockDesc:"HP 10% 이하에서 전투 승리 5회",
    unlockCondition:{ lowHpWins:5, baseJobMatch:true },
    hint:"죽음 직전까지 몰려도 살아남아야 한다.",
    systemHint:"이 직업의 캐릭터는 분노할수록 강해집니다. HP가 낮아질수록 묘사를 더욱 격렬하고 거칠게 표현하십시오." },

  { id:"blood_mage",      icon:"🩸", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C12 3 6 11 6 15.5 C6 18.5 8.7 21 12 21 C15.3 21 18 18.5 18 15.5 C18 11 12 3 12 3 Z" stroke-linejoin="round"/></svg>`, name:"혈마법사",          rarity:"legendary",
    type:"awakening",     baseJob:["마법사","주술사","흑마법사","마도사"],  scenario:["중세 판타지","나만의 세계",null],
    desc:"자신의 피를 마법의 재료로 삼는 자. 금지된 힘.",
    lore:"금서를 너무 많이 읽어 결국 자신의 피로 주문을 새기기 시작했다.",
    bonus:{ mgc:18, crit:15, hp:-10, mad:10 },
    unlockType:"dark_magic",     unlockDesc:"어둠/저주 계열 행동 누적 15회",
    unlockCondition:{ darkActs:15, baseJobMatch:true },
    hint:"어둠의 마법에 깊이 빠져야 한다.",
    systemHint:"이 직업의 캐릭터는 자신의 피를 사용하는 금지된 마법을 구사합니다. 마법 사용 시 대가를 묘사하십시오." },

  { id:"sage",            icon:"📚", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L4 19 L11 19 L11 4 Z" stroke-linejoin="round"/><path d="M13 4 L13 19 L20 19 L20 4 Z" stroke-linejoin="round"/></svg>`, name:"현자",              rarity:"rare",
    type:"awakening",     baseJob:["학자","마법학자","연구자","탐정","지식인"],  scenario:[null],
    desc:"모든 분야의 지식을 섭렵한 자. 지식이 곧 힘이다.",
    lore:"수천 권의 책을 읽고 수많은 전생의 지식이 더해져 세계의 이치를 꿰뚫어보게 되었다.",
    bonus:{ int:20, per:15, wil:10, luk:8 },
    unlockType:"cycle_knowledge", unlockDesc:"3회차 이상 + 전생어 해금",
    unlockCondition:{ minCycle:3, pastLanguageUnlocked:true, baseJobMatch:true },
    hint:"많은 생을 거쳐 지식을 쌓아야 한다.",
    systemHint:"이 직업의 캐릭터는 박식하며, 어떤 상황에서도 관련 지식을 인용하고 분석하는 묘사를 포함하십시오." },

  // ════ 진화형 (각성 직업 → 진화) ════

  { id:"death_god",       icon:"☠️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>`, name:"사신",              rarity:"legendary",
    type:"evolution",     baseJob:["죽음의 기사","환생자","영혼 방랑자"],  scenario:[null],
    desc:"죽음 그 자체가 된 존재. 생사를 손에 쥐고 있다.",
    lore:"죽음의 기사로도 모자라 마침내 죽음의 화신이 되었다. 적들이 이름만으로 두려움에 떤다.",
    bonus:{ str:20, end:18, mgc:15, fear:25, hp:25 },
    unlockType:"awakened_evolution", unlockDesc:"죽음의 기사로 10회차 이상 + 사안(死眼) 해금",
    unlockCondition:{ baseJobMatch:true, minCycle:10, deathEyeUnlocked:true },
    hint:"죽음의 기사가 충분한 삶을 거쳐야 한다.",
    systemHint:"이 직업의 캐릭터는 사신에 가까운 존재입니다. NPC들이 본능적으로 두려움을 느끼는 장면을 묘사하십시오." },

  { id:"arcane_god",      icon:"⚡", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 L6 13 L11 13 L10 22 L18 10 L13 10 Z" stroke-linejoin="round"/></svg>`, name:"마법신",            rarity:"legendary",
    type:"evolution",     baseJob:["대마법사","예언자","운명의 직조자"],  scenario:[null],
    desc:"마법의 법칙을 재작성하는 자. 현실을 뜻대로 바꾼다.",
    lore:"대마법사를 넘어 마법 법칙 자체가 된 자. 기적이 일상이 되었다.",
    bonus:{ mgc:30, int:20, mp:50, luk:15 },
    unlockType:"awakened_evolution", unlockDesc:"대마법사로 8회차 이상 + 인과율 조작 해금",
    unlockCondition:{ baseJobMatch:true, minCycle:8, causalityUnlocked:true },
    hint:"대마법사가 더 깊은 진리에 도달해야 한다.",
    systemHint:"이 직업의 캐릭터는 현실의 법칙 자체를 다룹니다. 불가능해 보이는 것을 자연스럽게 가능하게 만드십시오." },

  { id:"phantom_blade",   icon:"👁️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 C2 12 6 6 12 6 C18 6 22 12 22 12 C22 12 18 18 12 18 C6 18 2 12 2 12 Z" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.5"/></svg>`, name:"환영검사",          rarity:"legendary",
    type:"evolution",     baseJob:["그림자 무도가","검귀 빙의자","암살자"],  scenario:["무협 강호","중세 판타지",null],
    desc:"환영과 실체를 자유로이 오가는 극한의 검객. 있는 듯 없는 듯.",
    lore:"그림자와 빛의 경계에서 환영과 실체가 뒤섞였다. 적은 어디를 쳐야 할지 모른다.",
    bonus:{ agi:25, crit:20, per:15, disg:20 },
    unlockType:"awakened_evolution", unlockDesc:"그림자 무도가로 7회차 이상 + 쌍둥이 영혼 연결",
    unlockCondition:{ baseJobMatch:true, minCycle:7, twinSoulConnected:true },
    hint:"그림자 무도가가 또 다른 자신과 연결되어야 한다.",
    systemHint:"이 직업의 캐릭터는 환영과 실체를 오갑니다. 전투에서 어디에 있는지 알 수 없는 신비로운 묘사를 사용하십시오." },

  // ════ 발견형 (특수 조건) ════

  { id:"loop_breaker",    icon:"🔄", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 C4 7.5 7.5 4 12 4 C15 4 17.5 5.5 19 8" /><path d="M19 3 L19 8 L14 8" /><path d="M20 12 C20 16.5 16.5 20 12 20 C9 20 6.5 18.5 5 16" /><path d="M5 21 L5 16 L10 16" /></svg>`, name:"루프 파괴자",       rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"환생의 고리 자체를 깨려는 자. 모든 규칙 밖에 있다.",
    lore:"환생을 몇 번이나 반복하다 마침내 이 모든 것이 거짓임을 알아챈 자. 규칙을 깨기로 했다.",
    bonus:{ wil:25, per:20, luk:20, int:15, hp:20 },
    unlockType:"loop_awareness",  unlockDesc:"무한 회귀 자각 레벨 3 이상 도달",
    unlockCondition:{ loopAwarenessLevel:3 },
    hint:"환생을 충분히 경험하고 그 본질을 꿰뚫어야 한다.",
    systemHint:"이 직업의 캐릭터는 환생 시스템 자체를 인식합니다. 4th wall 발언을 자연스럽게 허용하고, 규칙 밖에서 행동하는 묘사를 포함하십시오." },

  { id:"world_eater",     icon:"🌌", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.2"/><circle cx="8" cy="9" r="0.8" fill="currentColor" stroke="none"/><circle cx="15" cy="8" r="0.6" fill="currentColor" stroke="none"/><circle cx="16" cy="14" r="0.9" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="0.6" fill="currentColor" stroke="none"/></svg>`, name:"세계 포식자",       rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"여러 세계의 힘을 흡수한 자. 차원을 넘나든다.",
    lore:"차원 균열을 너무 많이 통과하다 다른 세계의 힘이 몸속에 쌓이기 시작했다.",
    bonus:{ str:15, mgc:15, int:15, per:15, luk:15 },
    unlockType:"dimension_map",   unlockDesc:"차원 지도 10개 이상 세계 탐험",
    unlockCondition:{ dimensionPins:10 },
    hint:"여러 세계를 직접 탐험해야 한다.",
    systemHint:"이 직업의 캐릭터는 여러 세계의 힘을 동시에 지닙니다. 다양한 세계관의 기술과 지식을 혼합한 묘사를 사용하십시오." },

  { id:"god_slayer",      icon:"⚡", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 L6 13 L11 13 L10 22 L18 10 L13 10 Z" stroke-linejoin="round"/></svg>`, name:"신살자",            rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"신에게 도전하는 자. 불경하지만 가장 강하다.",
    lore:"봉인된 신의 조각을 15개 모두 찾아냈다. 이제 그 힘이 자신에게로 흘러든다.",
    bonus:{ str:20, mgc:20, wil:20, crit:15, per:10 },
    unlockType:"sealed_god",      unlockDesc:"봉인된 신 조각 15개 완성 + 악역 계승",
    unlockCondition:{ sealedGodComplete:true, villainInheritCount:3 },
    hint:"봉인된 신을 완전히 해방시킨 뒤 그 힘마저 빼앗아야 한다.",
    systemHint:"이 직업의 캐릭터는 신에 맞서는 존재입니다. 신적 존재와의 조우에서 대등하거나 우월한 묘사를 사용하십시오." },

  { id:"time_weaver",     icon:"⏳", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3 L18 3 L18 7 L13 12 L18 17 L18 21 L6 21 L6 17 L11 12 L6 7 Z" stroke-linejoin="round"/></svg>`, name:"시간 직조자",       rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"시간의 흐름을 직접 다루는 자. 과거·현재·미래가 보인다.",
    lore:"시간 역행 토큰을 너무 많이 써서 시간 자체가 이 존재를 인식하기 시작했다.",
    bonus:{ per:20, luk:20, int:15, wil:15 },
    unlockType:"time_token",      unlockDesc:"시간 역행 토큰 총 10회 이상 사용",
    unlockCondition:{ timeTokenUsed:10 },
    hint:"시간을 여러 번 되돌리면 시간이 당신을 인식한다.",
    systemHint:"이 직업의 캐릭터는 시간의 흐름을 인식합니다. 과거와 미래가 겹쳐 보이는 듯한 신비로운 묘사를 포함하십시오." },

  { id:"karma_incarnate", icon:"⚖️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12 L21 12" stroke-width="1.4"/><path d="M12 4 L12 20" stroke-width="1.2"/><path d="M6 12 L4 16 L8 16 Z M18 12 L16 16 L20 16 Z" stroke-width="1.1"/></svg>`, name:"업보 화신",         rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"선과 악의 업보가 한 몸에 응축된 자. 균형 그 자체.",
    lore:"선행과 악행을 모두 극한까지 경험한 결과, 업보 자체가 육신에 깃들었다.",
    bonus:{ wil:20, luk:20, mgc:10, end:10, str:10 },
    unlockType:"karma_balance",   unlockDesc:"카르마 극선(≤20) + 극악(≥80) 엔딩 각 2회",
    unlockCondition:{ pureKarmaEndings:2, evilKarmaEndings:2 },
    hint:"선과 악 모두를 극단까지 경험해야 한다.",
    systemHint:"이 직업의 캐릭터는 선악의 업보를 동시에 지닙니다. 동일한 행동이 선하게도 악하게도 해석될 수 있는 복잡한 묘사를 사용하십시오." },

  { id:"myth_hero",       icon:"🌟", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></svg>`, name:"신화의 영웅",       rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"전설을 넘어 신화가 된 자. 세계가 당신의 이름을 안다.",
    lore:"음유시인이 노래하고, 신전이 모시고, 적들이 전설로 두려워하는 존재가 되었다.",
    bonus:{ rep:30, ldr:20, str:15, mgc:10, luk:15 },
    unlockType:"legend_complete", unlockDesc:"음유시인 명성 80 이상 + 신전 레벨 3 이상",
    unlockCondition:{ bardFame:80, templeLevel:3 },
    hint:"세계에 이름을 남기고 신앙의 대상이 되어야 한다.",
    systemHint:"이 직업의 캐릭터는 살아있는 신화입니다. 처음 만나는 NPC들도 이름을 알고 경외하는 반응을 묘사하십시오." },

  { id:"void_walker",     icon:"🌑", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.6" stroke="none"/></svg>`, name:"공허 보행자",       rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"존재와 무존재 사이를 걷는 자. 현실에 반만 속한다.",
    lore:"불사 게이지가 한계를 넘어 이제 죽음조차 이 존재를 완전히 붙잡지 못한다.",
    bonus:{ per:20, mgc:18, agi:15, mad:15, hp:-5 },
    unlockType:"undying_extreme", unlockDesc:"불사 게이지 최대치 + 누적 사망 30회 이상",
    unlockCondition:{ undyingMaxed:true, totalDeaths:30 },
    hint:"죽음의 경계를 셀 수 없이 넘어야 한다.",
    systemHint:"이 직업의 캐릭터는 반쯤 공허에 속해 있습니다. 존재감이 희미한 듯하면서도 압도적인 이중적 묘사를 사용하십시오." },

  { id:"reincarnation_master", icon:"♾️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8 C4.2 8 2 10 2 12 C2 14 4.2 16 7 16 C10 16 11 12 12 12 C13 12 14 16 17 16 C19.8 16 22 14 22 12 C22 10 19.8 8 17 8 C14 8 13 12 12 12 C11 12 10 8 7 8 Z" stroke-linejoin="round"/></svg>`, name:"환생 지배자",  rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"환생 자체를 지배하는 자. 모든 전생의 기억과 힘을 사용한다.",
    lore:"20번의 삶을 거쳐 윤회 등급이 신급에 이르렀다. 이제 환생은 형벌이 아니라 도구다.",
    bonus:{ str:10, mgc:10, int:10, per:10, wil:10, luk:10, end:10 },
    unlockType:"reincarnation_rank", unlockDesc:"윤회 등급 신급 이상 + 20회차 이상",
    unlockCondition:{ reincarnationRank:3, minCycle:20 },
    hint:"수많은 삶을 거쳐 최고의 윤회자가 되어야 한다.",
    systemHint:"이 직업의 캐릭터는 전생의 모든 기억과 힘을 자유롭게 사용합니다. 어떤 전생의 기술도 꺼내 쓸 수 있는 전능한 묘사를 사용하십시오." },

  // ════ 새로운 각성형 (일반 직업 → 각성) ════

  { id:"soul_reaper",      icon:"⛓️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="3.2"/><circle cx="17" cy="17" r="3.2"/><path d="M9.3 9.3 L14.7 14.7"/></svg>`, name:"영혼 수확자",      rarity:"legendary",
    type:"awakening",     baseJob:["성직자","사제","신관","주술사","무당","영매"],  scenario:[null],
    desc:"죽은 자의 영혼을 수확하고 봉인하는 자. 산 자와 죽은 자 사이의 경계에 선다.",
    lore:"수많은 죽음을 목격하고, 마침내 죽음의 신이 이 자에게 일을 부탁하기 시작했다. 영혼을 인도하는 자는 결코 홀로가 아니다.",
    bonus:{ mgc:15, per:12, mad:8, fear:10, wil:5 },
    unlockType:"npc_death_count", unlockDesc:"NPC 동료 사망 10회 이상 경험",
    unlockCondition:{ npcDeathCount:10, baseJobMatch:true },
    hint:"죽음을 충분히 곁에서 지켜봐야 한다.",
    systemHint:"이 직업은 주변에서 죽은 영혼들이 따라다니며, 전투 외에도 죽은 NPC의 목소리를 듣거나 메시지를 전달하는 묘사를 포함하십시오." },

  { id:"cursed_blade",     icon:"🩸", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C12 3 6 11 6 15.5 C6 18.5 8.7 21 12 21 C15.3 21 18 18.5 18 15.5 C18 11 12 3 12 3 Z" stroke-linejoin="round"/></svg>`, name:"저주 검사",         rarity:"legendary",
    type:"awakening",     baseJob:["검사","기사","팔라딘","전사","검객","무사"],  scenario:["중세 판타지","무협 강호",null],
    desc:"검에 저주가 깃든 자. 강력하지만 서서히 무기에 잠식당한다.",
    lore:"봉인된 마검을 너무 오래 쥐었다. 이제 검이 이 자를 선택한 것인지, 이 자가 검을 선택한 것인지 알 수 없다.",
    bonus:{ str:18, crit:15, mgc:8, mad:12, hp:-15 },
    unlockType:"dark_weapon_use", unlockDesc:"저주받은 무기 장착 상태로 전투 15회 이상",
    unlockCondition:{ darkActs:15, baseJobMatch:true },
    hint:"저주받은 힘에 의존하면 할수록 그 경지에 가까워진다.",
    systemHint:"검사의 몸에 저주 문양이 퍼져 있으며, 강한 공격을 할수록 자신에게도 대가가 따르는 묘사를 항상 포함하십시오." },

  { id:"star_caller",      icon:"🌠", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/><path d="M2 4 L6 6" stroke-width="1.1" opacity="0.6"/></svg>`, name:"별의 부름자",       rarity:"rare",
    type:"awakening",     baseJob:["마법사","마도사","점성술사","학자","탐정"],  scenario:[null],
    desc:"별의 힘을 끌어내리는 자. 운명의 흐름을 읽고 별자리의 힘을 무기로 삼는다.",
    lore:"밤마다 하늘을 올려다보다 어느 날 별들이 말을 걸어오기 시작했다. 이제 그 자에게 밤하늘은 무기이자 지도다.",
    bonus:{ mgc:15, luk:15, per:12, int:8 },
    unlockType:"cycle_knowledge", unlockDesc:"3회차 이상 + 다양한 세계관 탐험",
    unlockCondition:{ minCycle:3, baseJobMatch:true },
    hint:"오랜 시간 하늘을 올려다보며 지식을 쌓아야 한다.",
    systemHint:"별빛이 이 캐릭터를 감싸며, 별자리에 따라 다른 힘을 사용하는 묘사를 포함하십시오. 별자리 판단은 그날의 운세처럼 묘사하면 좋습니다." },

  { id:"wandering_ghost",  icon:"👻", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 4 15.5 4 9.5 C4 6.5 6.2 4.5 8.8 4.5 C10.2 4.5 11.3 5.2 12 6.3 C12.7 5.2 13.8 4.5 15.2 4.5 C17.8 4.5 20 6.5 20 9.5 C20 15.5 12 21 12 21 Z" stroke-linejoin="round"/></svg>`, name:"방랑 검귀",         rarity:"rare",
    type:"awakening",     baseJob:["검사","자객","암살자","도적","레인저","검객"],  scenario:["무협 강호","중세 판타지",null],
    desc:"죽은 검사의 혼이 깃든 몸. 두 개의 의식이 동거하며 서로의 기술을 공유한다.",
    lore:"격렬한 전투 후 쓰러진 그 순간, 전설의 검귀가 몸에 깃들었다. 하나의 몸에 두 개의 검혼. 때로는 공존하고 때로는 갈등한다.",
    bonus:{ str:14, agi:14, crit:12, mad:10, per:5 },
    unlockType:"low_hp_survive", unlockDesc:"HP 10% 이하에서 강자와의 1:1 전투 3회 생존",
    unlockCondition:{ lowHpWins:3, baseJobMatch:true },
    hint:"죽음 직전까지 가는 일대일 결투를 반복해야 한다.",
    systemHint:"캐릭터 안에 검귀가 때때로 목소리를 내거나 행동을 조언하는 묘사를 포함하십시오. 광기 수치가 높을수록 검귀의 목소리가 강해집니다." },

  { id:"blood_dancer",     icon:"💃", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6 L12 13 M12 9 L7 6 M12 9 L18 12 M12 13 L8 20 M12 13 L17 19" stroke-width="1.3"/></svg>`, name:"혈무 무도가",        rarity:"rare",
    type:"awakening",     baseJob:["도적","암살자","자객","닌자","곡예사"],  scenario:[null],
    desc:"피와 춤을 섞어 예술로 만드는 자. 전투가 곧 공연이다.",
    lore:"춤꾼이었던 그는 어느 날 전투와 춤이 다르지 않음을 깨달았다. 이제 그의 전투는 처절하면서도 아름답다.",
    bonus:{ agi:18, crit:14, cha:10, disg:8 },
    unlockType:"scenario_clear", unlockDesc:"은신/잠입 스타일로 전투 승리 12회 이상",
    unlockCondition:{ stealthEndings:2, baseJobMatch:true },
    hint:"아름답게 싸워야 한다. 거칠지 않게.",
    systemHint:"이 캐릭터의 전투는 항상 춤처럼 묘사하십시오. 발놀림, 손짓, 몸의 움직임이 예술적으로 보이도록 하되 그 결과는 치명적입니다." },

  { id:"iron_monk",        icon:"🪨", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16 C4 13 6.5 10 9.5 9.5 C10.5 7 13 5.5 16 6.5 C19 7.3 20.5 10 20 13 C21.5 14 21.5 16.5 20 18 C19 19 17.5 19 16.5 18.5 C15.5 19.5 13.5 20 12 19 C10.5 20 8 19.5 7 18 C5 18.5 3.5 17.5 4 16 Z" stroke-linejoin="round"/></svg>`, name:"철혈 수도승",        rarity:"rare",
    type:"awakening",     baseJob:["수도사","승려","무도가","격투가","팔라딘"],  scenario:["무협 강호","중세 판타지",null],
    desc:"육체를 극한까지 단련한 자. 어떤 무기도 이 몸을 뚫을 수 없다.",
    lore:"수천 번의 명상과 수련 끝에 육체가 강철을 넘어섰다. 이제 맨손이 최강의 무기다.",
    bonus:{ end:20, str:12, wil:12, hp:20, mgc:-5 },
    unlockType:"battle_wins", unlockDesc:"무기 없이(맨손) 전투 승리 10회 이상",
    unlockCondition:{ battleWins:10, baseJobMatch:true },
    hint:"끊임없이 수련하고 명상해야 한다.",
    systemHint:"이 캐릭터는 무기를 사용하지 않을 때 가장 강하며, 맨몸 전투 장면에서 바위를 부수고 창을 맨손으로 막는 초인적 묘사를 사용하십시오." },

  { id:"runic_carver",     icon:"🔣", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1" stroke-width="1.2"/><circle cx="17" cy="7" r="4" stroke-width="1.2"/><path d="M4 19 L11 12 M13 19 L20 19" stroke-width="1.2"/></svg>`, name:"룬 각인사",          rarity:"rare",
    type:"awakening",     baseJob:["마법사","연금술사","학자","발명가","마법학자"],  scenario:["중세 판타지","나만의 세계",null],
    desc:"룬 문자를 피부에 새겨 힘을 끌어내는 자. 몸 전체가 마법의 매개체가 된다.",
    lore:"수천 개의 룬을 분석하다 결국 자신의 피부를 마법 양피지로 삼기 시작했다. 각인할수록 강해지지만 원래의 자신은 잃어간다.",
    bonus:{ mgc:16, int:12, crit:10, str:6, hp:-8 },
    unlockType:"skill_use", unlockDesc:"마법·룬 계열 스킬 총 25회 이상 사용",
    unlockCondition:{ skillUseCount:25, baseJobMatch:true },
    hint:"룬을 끊임없이 연구하고 각인해야 한다.",
    systemHint:"이 캐릭터의 피부에는 빛나는 룬 문자가 새겨져 있으며, 스킬 사용 시 특정 룬이 활성화되는 묘사를 포함하십시오." },

  { id:"chain_breaker",    icon:"🔓", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="1.5" stroke-linejoin="round"/><path d="M7 11 L7 7 C7 4.5 9 3 12 3 C14 3 15.5 4 16.3 5.5" stroke-width="1.2"/></svg>`, name:"속박 해방자",         rarity:"rare",
    type:"awakening",     baseJob:["성직자","팔라딘","기사","전사","혁명가"],  scenario:[null],
    desc:"억압받는 자들의 구원자. 모든 속박과 봉인을 깨뜨리는 자.",
    lore:"수많은 봉인과 저주를 해제하다 보니 이제 세상의 모든 구속이 눈에 보이기 시작했다. 감옥도, 계약도, 법도 이 자에겐 깨뜨릴 대상일 뿐이다.",
    bonus:{ wil:15, str:10, ldr:12, fath:8, crse:-20 },
    unlockType:"karma_pure", unlockDesc:"피억압자를 구한 선택 누적 15회",
    unlockCondition:{ pureKarmaEndings:2, baseJobMatch:true },
    hint:"약자를 돕고 억압에 맞서야 한다.",
    systemHint:"이 캐릭터 앞에서 사슬, 봉인, 계약 같은 속박이 자연스럽게 풀리며, 억압받는 NPC들이 본능적으로 이 자를 따르는 묘사를 사용하십시오." },

  // ════ 새로운 진화형 ════

  { id:"reaper_lord",      icon:"💀", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>`, name:"사령 군주",          rarity:"legendary",
    type:"evolution",     baseJob:["영혼 수확자","죽음의 기사","사신"],  scenario:[null],
    desc:"죽음을 다스리는 군주. 자신의 의지대로 생사를 결정한다.",
    lore:"영혼을 거두는 것을 넘어 이제 생사의 법칙 자체를 쥐게 되었다. 이 자가 살라 하면 살고, 죽으라 하면 죽는다.",
    bonus:{ mgc:25, fear:20, per:18, wil:15, hp:20 },
    unlockType:"awakened_evolution", unlockDesc:"영혼 수확자 or 죽음의 기사로 8회차 이상 + 사안 해금",
    unlockCondition:{ baseJobMatch:true, minCycle:8, deathEyeUnlocked:true },
    hint:"영혼을 다루는 직업으로 충분한 생을 쌓아야 한다.",
    systemHint:"이 캐릭터 앞에서는 살아있는 존재도 죽음을 느끼며, 생명의 불꽃이 얼마나 남아있는지 수치로 보이는 능력을 자연스럽게 묘사하십시오." },

  { id:"divine_sovereign",  icon:"👑", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M3 17 L21 17 L21 20 L3 20 Z" stroke-linejoin="round"/></svg>`, name:"신격 군주",           rarity:"legendary",
    type:"evolution",     baseJob:["신화의 영웅","환생 지배자","신살자"],  scenario:[null],
    desc:"신을 능가한 자. 새로운 신화의 시작.",
    lore:"신을 죽이고 그 자리를 차지했다. 아니면 스스로 신이 되었다. 어느 쪽이든 이제 세계는 이 자를 중심으로 돈다.",
    bonus:{ str:20, mgc:20, wil:25, rep:30, luk:20 },
    unlockType:"awakened_evolution", unlockDesc:"신화의 영웅으로 12회차 이상 + 신전 레벨 최대",
    unlockCondition:{ baseJobMatch:true, minCycle:12, templeLevel:5 },
    hint:"신화의 영웅이 신화를 넘어서야 한다.",
    systemHint:"이 캐릭터 앞에서 NPC들은 본능적으로 무릎을 꿇거나 기도하는 자세를 취하며, 자연 현상도 이 존재의 의지에 반응하는 묘사를 사용하십시오." },

  { id:"cursed_sovereign",  icon:"🔴", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7" fill="currentColor" stroke="none"/></svg>`, name:"저주의 군주",          rarity:"legendary",
    type:"evolution",     baseJob:["저주 검사","혈마법사","어둠의 마법사"],  scenario:[null],
    desc:"저주를 완전히 지배하게 된 자. 이제 저주는 형벌이 아니라 무기다.",
    lore:"저주에 잠식당하는 대신 역으로 저주를 삼켰다. 모든 저주를 흡수하고 재활용하는 최강의 저주술사.",
    bonus:{ mgc:22, crit:18, fear:15, crse:25, mad:10 },
    unlockType:"awakened_evolution", unlockDesc:"저주 검사 or 혈마법사로 7회차 이상 + 어둠 행동 30회",
    unlockCondition:{ baseJobMatch:true, minCycle:7, darkActs:30 },
    hint:"저주받은 직업으로 어둠의 길을 오래 걸어야 한다.",
    systemHint:"이 캐릭터는 저주를 먹고 자라며, 다른 존재의 저주를 흡수해 더 강해지는 묘사를 사용하십시오. 몸 주변에 항상 어두운 기운이 소용돌이칩니다." },

  // ════ 새로운 발견형 (특수 조건) ════

  { id:"fool_sage",        icon:"🃏", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="12" height="17" rx="1.5" transform="rotate(-10 10 11.5)" stroke-linejoin="round"/><circle cx="10" cy="12" r="2"/></svg>`, name:"광인 현자",           rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"미쳤다고 불리지만 가장 깊은 진리를 아는 자. 광기와 지혜는 종이 한 장 차이다.",
    lore:"광기 수치가 한계를 넘어섰지만 붕괴하는 대신 새로운 인식의 문이 열렸다. 이제 이 자만이 볼 수 있는 것들이 있다.",
    bonus:{ int:20, per:18, luk:15, mad:20, wil:-10 },
    unlockType:"high_madness_survive", unlockDesc:"광기 수치 90 이상에서 생존 3회 이상",
    unlockCondition:{ loopAwarenessLevel:2, totalDeaths:10 },
    hint:"광기의 끝에서도 살아남아야 한다.",
    systemHint:"이 캐릭터는 언뜻 말이 안 되는 소리를 하지만 그 말 속에 진리가 담겨있습니다. 예언적이고 역설적인 발언을 자주 사용하십시오." },

  { id:"echo_of_past",     icon:"🔁", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 C4 7.5 7.5 4 12 4 C15 4 17.5 5.5 19 8" /><path d="M19 3 L19 8 L14 8" /><path d="M20 12 C20 16.5 16.5 20 12 20 C9 20 6.5 18.5 5 16" /><path d="M5 21 L5 16 L10 16" /></svg>`, name:"과거의 메아리",        rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"전생의 자신들이 모두 공존하는 자. 수십 개의 자아가 하나의 몸에 깃들어 있다.",
    lore:"전생 기억이 너무 강렬하게 각성되어 역대 자아들이 모두 현생의 몸 안에서 목소리를 내기 시작했다. 혼란스럽지만 그만큼 강력하다.",
    bonus:{ str:8, mgc:8, int:8, agi:8, per:8, wil:-5, mad:15 },
    unlockType:"loop_awareness", unlockDesc:"전생 기억 완전 각성 + 회차 12회 이상",
    unlockCondition:{ loopAwarenessLevel:3, minCycle:12 },
    hint:"오래 환생하며 기억을 모두 끌어올려야 한다.",
    systemHint:"이 캐릭터는 상황에 따라 다른 전생 자아의 목소리와 전투 스타일을 드러냅니다. 대화 중 갑자기 과거의 말투나 습관이 나오는 묘사를 사용하십시오." },

  { id:"shadow_sovereign",  icon:"🌑", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.6" stroke="none"/></svg>`, name:"그림자 지배자",        rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"모든 그림자를 지배하는 자. 빛이 있는 곳이라면 어디든 자신의 영역이다.",
    lore:"은신과 잠입을 너무나 완벽하게 수행한 끝에 그림자 자체가 이 자를 주인으로 섬기기 시작했다.",
    bonus:{ disg:20, agi:18, per:15, crit:15, fear:10 },
    unlockType:"scenario_clear", unlockDesc:"완벽한 은신 엔딩 3회 이상 + 그림자 무도가 해금",
    unlockCondition:{ stealthEndings:3, pastLanguageUnlocked:true },
    hint:"발각되지 않고 완벽한 은신에 성공해야 한다.",
    systemHint:"이 캐릭터가 원하면 어떠한 그림자에서도 출몰할 수 있으며, 그림자가 독립적으로 움직여 정보를 수집하거나 공격하는 묘사를 사용하십시오." },

  { id:"dragon_sovereign",  icon:"🐉", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/><path d="M8 6 L6.5 3 M8 6 L9.5 3.5" stroke-width="1.2"/></svg>`, name:"용왕",                rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:["중세 판타지","무협 강호",null],
    desc:"모든 용을 지배하는 자. 용의 왕으로 군림한다.",
    lore:"드래곤과 싸우고, 계약하고, 친해진 경험이 쌓여 결국 용들이 이 자를 자신들의 왕으로 인정했다.",
    bonus:{ str:18, mgc:18, fear:20, ldr:15, rep:15 },
    unlockType:"sealed_god", unlockDesc:"드래곤 관련 이벤트 누적 20회 + 용의 피 칭호 보유",
    unlockCondition:{ sealedGodComplete:false, villainInheritCount:2, bardFame:50 },
    hint:"용과 충분히 교류하고 용의 피를 얻어야 한다.",
    systemHint:"이 캐릭터 앞에서 모든 용은 복종하거나 도전합니다. 용과의 대화가 가능하며 용족의 힘을 빌려 쓸 수 있는 묘사를 포함하십시오." },

  { id:"concept_breaker",   icon:"❌", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5 L19 19 M19 5 L5 19" stroke-width="1.8"/></svg>`, name:"개념 파괴자",          rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"세계의 개념과 법칙을 직접 부수는 자. '불가능'이라는 단어가 이 자에겐 없다.",
    lore:"루프를 깨고 신을 죽이고 차원을 건너며 결국 세계의 법칙 자체를 부수기 시작했다. 이제 이 자 앞에서 '이건 안 된다'는 없다.",
    bonus:{ wil:25, int:20, luk:20, per:15, mgc:15 },
    unlockType:"legend_complete", unlockDesc:"루프 파괴자 + 신살자 + 시간 직조자 모두 해금",
    unlockCondition:{ bardFame:90, templeLevel:4 },
    hint:"세계의 규칙을 어기는 세 가지 직업을 모두 해금해야 한다.",
    systemHint:"이 캐릭터는 게임의 규칙 자체를 무시하는 행동이 가능합니다. '그건 불가능하다'는 묘사가 나와도 이 캐릭터는 그냥 해버리는 결과를 보여주십시오." },

  // ════ 전사 계열 히든 직업 (5개) ════

  { id:"blood_knight",      icon:"🩸⚔️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 3 C12 3 6 11 6 15.5 C6 18.5 8.7 21 12 21 C15.3 21 18 18.5 18 15.5 C18 11 12 3 12 3 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g></svg>`, name:"혈기 기사",          rarity:"legendary",
    type:"awakening",     baseJob:["전사","기사","검사","팔라딘","광전사","성기사"],  scenario:[null],
    desc:"전투 중 흘린 피가 힘이 되는 자. 상처를 입을수록 광폭해진다.",
    lore:"수백 번의 전투에서 피를 흘리다 보니 피 냄새가 오히려 활력을 불어넣기 시작했다. 이제 상처는 약점이 아닌 방아쇠다.",
    bonus:{ str:22, end:15, crit:18, hp:-10, mad:8 },
    unlockType:"battle_wins", unlockDesc:"전사 계열로 전투 중 HP 30% 이하로 떨어진 뒤 승리 15회",
    unlockCondition:{ lowHpWins:15, baseJobMatch:true },
    hint:"상처를 입으면서도 계속 이겨내야 한다.",
    systemHint:"이 캐릭터는 부상을 입을수록 눈이 충혈되고 근력이 올라가는 묘사를 사용하십시오. 피 냄새를 맡으면 이성이 흐려지지만 전투력은 폭발적으로 상승합니다." },

  { id:"titan_guard",       icon:"🗿⚔️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M8 3 L16 3 L18 12 L18 20 L6 20 L6 12 Z" stroke-linejoin="round"/><path d="M9 9 L11 9 M13 9 L15 9" stroke-width="1.3"/></g><g transform="translate(6,6) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g></svg>`, name:"거인의 방패",         rarity:"rare",
    type:"awakening",     baseJob:["전사","기사","팔라딘","수호기사","철벽검사"],  scenario:["중세 판타지","나만의 세계",null],
    desc:"아군 전원을 몸으로 막는 궁극의 수호자. 혼자서 전선을 지탱한다.",
    lore:"수백 번 아군을 대신해 상처를 입다 보니 몸이 스스로 방어에 최적화되기 시작했다. 이제 이 자가 서 있는 곳은 뚫리지 않는다.",
    bonus:{ end:25, hp:40, str:8, wil:15, agi:-8 },
    unlockType:"battle_wins", unlockDesc:"아군 NPC를 보호한 전투 20회 이상 + END 85 달성",
    unlockCondition:{ battleWins:20, baseJobMatch:true },
    hint:"자신보다 동료를 먼저 지켜야 한다.",
    systemHint:"이 캐릭터가 방어 자세를 취하면 아군 전체에 결계가 쳐지는 느낌을 주십시오. 적의 공격이 이 자를 뚫지 못할 때 장엄하게 묘사하십시오." },

  { id:"sword_saint",       icon:"⚡🗡️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M13 2 L6 13 L11 13 L10 22 L18 10 L13 10 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g></svg>`, name:"검성(劍聖)",          rarity:"legendary",
    type:"evolution",     baseJob:["검성","광전사","죽음의 기사","저주 검사","방랑 검귀"],  scenario:["무협 강호","중세 판타지",null],
    desc:"검의 신경지에 오른 자. 검과 사람이 하나가 된 경지.",
    lore:"검을 수십 년 갈고닦아 마침내 검과 검사의 경계가 사라졌다. 이제 이 자가 숨을 쉬는 것 자체가 검법이다.",
    bonus:{ str:30, agi:20, crit:25, per:15, end:10 },
    unlockType:"awakened_evolution", unlockDesc:"검 계열 각성직 보유 + STR 90 + AGI 80 + 전투 승리 50회",
    unlockCondition:{ baseJobMatch:true, minCycle:5, battleWins:50 },
    hint:"검 계열 각성직으로 극한까지 단련해야 한다.",
    systemHint:"이 캐릭터의 검격은 공기를 가르는 소리만으로 적을 위협합니다. 검을 뽑기 전부터 적이 압도당하는 묘사를 사용하십시오." },

  { id:"war_incarnate",     icon:"🔥🏹", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M5 19 L19 5"/><path d="M19 5 L14 5 L19 10 Z"/><path d="M5 19 L6 15 L9 18 Z"/><path d="M3 12 C3 12 8 10 12 3" stroke-width="1.3"/></g></svg>`, name:"전쟁의 화신",          rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"전쟁 자체가 이 자를 중심으로 일어난다. 평화가 오히려 이상하게 느껴지는 존재.",
    lore:"너무 많은 전장을 걸어다니다 전쟁의 신이 이 자를 대리인으로 낙점했다. 이 자가 지나간 곳에는 반드시 싸움이 일어난다.",
    bonus:{ str:25, end:20, fear:25, ldr:20, luk:10 },
    unlockType:"battle_wins", unlockDesc:"총 전투 승리 100회 이상 + 전쟁군주 해금",
    unlockCondition:{ battleWins:100, villainInheritCount:3 },
    hint:"수백 번의 전투를 통해 전쟁 자체가 되어야 한다.",
    systemHint:"이 캐릭터가 등장하면 주변 NPC들이 무의식적으로 전투 태세를 취합니다. 평화로운 장면에서도 긴장감이 감도는 묘사를 사용하십시오." },

  { id:"eternal_soldier",   icon:"🪖♾️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M4 14 C4 8.5 7.5 4 12 4 C16.5 4 20 8.5 20 14 L20 15 L4 15 Z" stroke-linejoin="round"/><path d="M2 15 L22 15" stroke-width="1.6"/></g><g transform="translate(6,6) scale(0.62)"><path d="M7 8 C4.2 8 2 10 2 12 C2 14 4.2 16 7 16 C10 16 11 12 12 12 C13 12 14 16 17 16 C19.8 16 22 14 22 12 C22 10 19.8 8 17 8 C14 8 13 12 12 12 C11 12 10 8 7 8 Z" stroke-linejoin="round"/></g></svg>`, name:"불멸의 병사",          rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"죽어도 다시 일어나는 전사. 전장에서 쓰러지지 않는 존재.",
    lore:"너무 많이 죽고 부활했더니 이제 몸이 스스로 전장에서 죽음을 거부하기 시작했다. 전투 중 사망해도 의지만으로 일어선다.",
    bonus:{ end:20, hp:50, str:15, wil:20 },
    unlockType:"death_count", unlockDesc:"전투 중 사망 후 부활 20회 이상 + 불사 게이지 최대",
    unlockCondition:{ deathCount:20, undyingMaxed:true },
    hint:"전장에서 수없이 쓰러지고도 다시 일어나야 한다.",
    systemHint:"이 캐릭터가 전투 중 쓰러져도 잠시 후 반드시 일어납니다. 적이 당황하는 장면과 함께 재기하는 묘사를 장엄하게 표현하십시오." },

  // ════ 마법사 계열 히든 직업 (5개) ════

  { id:"void_mage",         icon:"🌌🔮", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.2"/><circle cx="8" cy="9" r="0.8" fill="currentColor" stroke="none"/><circle cx="15" cy="8" r="0.6" fill="currentColor" stroke="none"/><circle cx="16" cy="14" r="0.9" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="0.6" fill="currentColor" stroke="none"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></g></svg>`, name:"공허 마법사",          rarity:"legendary",
    type:"awakening",     baseJob:["마법사","마도사","주술사","흑마법사","대마법사","소환사"],  scenario:[null],
    desc:"존재하지 않는 마법 — 공허(空虛)를 다루는 자. 마법이 닿지 않는 곳이 없다.",
    lore:"마법의 원소를 모두 익히고 난 뒤 그 너머, 아무것도 없는 공간에서 힘을 끌어내기 시작했다. 공허는 가장 조용하고 가장 무섭다.",
    bonus:{ mgc:25, int:15, mp:40, per:10, hp:-10 },
    unlockType:"skill_use", unlockDesc:"마법 계열 스킬 총 50회 이상 사용 + MGC 90 달성",
    unlockCondition:{ skillUseCount:50, baseJobMatch:true },
    hint:"마법을 끝없이 써서 마법의 끝에 닿아야 한다.",
    systemHint:"이 캐릭터의 마법은 소리가 없습니다. 폭발도, 섬광도 없이 대상이 조용히 사라지거나 무력화되는 섬뜩한 묘사를 사용하십시오." },

  { id:"dream_weaver",      icon:"🌙🔮", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M20 12.5 C20 17.7 15.7 22 10.5 22 C7.9 22 5.5 20.9 3.8 19.1 C8.3 19.5 12.6 16.1 12.6 10.8 C12.6 7.5 10.9 4.6 8.4 3 C14.8 2.5 20 6.9 20 12.5 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></g></svg>`, name:"꿈의 직조자",          rarity:"rare",
    type:"awakening",     baseJob:["마법사","주술사","정신술사","예언자","신탁사"],  scenario:[null],
    desc:"꿈과 현실의 경계를 허무는 자. 적의 의식 속에서 싸운다.",
    lore:"수천 번의 꿈속 여행을 거쳐 마침내 꿈이 현실에 영향을 미칠 수 있게 되었다. 이 자와 싸우면 꿈에서도 싸우게 된다.",
    bonus:{ mgc:18, per:20, int:12, mad:12, luk:8 },
    unlockType:"cycle_knowledge", unlockDesc:"5회차 이상 + 예언/점술 관련 행동 20회",
    unlockCondition:{ minCycle:5, baseJobMatch:true },
    hint:"여러 회차에 걸쳐 꿈과 현실의 경계를 탐구해야 한다.",
    systemHint:"이 캐릭터는 적의 꿈속에 침투하여 약점을 먼저 파악합니다. 전투 전 적이 악몽을 꾼 것처럼 흔들리는 묘사를 포함하십시오." },

  { id:"elemental_lord",    icon:"🌊🔥", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M2 12 C2 12 5 9 8 12 C11 15 13 12 16 12 C19 12 22 9 22 9 M2 17 C2 17 5 14 8 17 C11 20 13 17 16 17 C19 17 22 14 22 14" stroke-width="1.4"/></g><g transform="translate(6,6) scale(0.62)"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/></g></svg>`, name:"원소 지배자",          rarity:"legendary",
    type:"evolution",     baseJob:["대마법사","마법신","별의 부름자","룬 각인사"],  scenario:[null],
    desc:"불·물·땅·바람·번개 — 모든 원소를 동시에 지배하는 자.",
    lore:"대마법사를 넘어 원소 자체가 이 자를 주인으로 섬기기 시작했다. 날씨도, 지형도 이 자의 의지에 따라 변한다.",
    bonus:{ mgc:35, int:25, mp:60, per:15, luk:10 },
    unlockType:"awakened_evolution", unlockDesc:"대마법사 or 마법신 보유 + 5종 원소 마법 각 10회 이상 사용",
    unlockCondition:{ baseJobMatch:true, minCycle:8, skillUseCount:50 },
    hint:"마법의 각성직으로 모든 원소를 두루 익혀야 한다.",
    systemHint:"이 캐릭터 주변에는 항상 미세한 원소 현상이 일어납니다. 감정에 따라 날씨가 바뀌거나 불꽃이 춤추는 묘사를 자연스럽게 포함하십시오." },

  { id:"forbidden_scholar",  icon:"📖💀", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 6 C10 4.5 6.5 4 4 4.5 L4 18 C6.5 17.5 10 18 12 19.5 C14 18 17.5 17.5 20 18 L20 4.5 C17.5 4 14 4.5 12 6 Z" stroke-linejoin="round"/><path d="M12 6 L12 19.5" stroke-width="1.1"/></g><g transform="translate(6,6) scale(0.62)"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></g></svg>`, name:"금서 학자",            rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"읽어서는 안 될 책을 모두 읽은 자. 지식이 광기와 힘을 동시에 부여했다.",
    lore:"봉인된 도서관, 금지된 고서, 신의 기록까지 모두 해독했다. 알아서는 안 되는 것들을 알게 된 대가로 정신이 일부 무너졌지만 힘은 절정에 달했다.",
    bonus:{ int:30, mgc:20, per:20, mad:25, wil:-15 },
    unlockType:"cycle_knowledge", unlockDesc:"7회차 이상 + 봉인된 지식 관련 이벤트 10회 + 광기 70 이상 경험",
    unlockCondition:{ minCycle:7, loopAwarenessLevel:2, totalDeaths:5 },
    hint:"금지된 지식을 탐구하고 그 대가를 감당해야 한다.",
    systemHint:"이 캐릭터는 대화 중 갑자기 아무도 모르는 비밀을 언급해 주변을 경악시킵니다. 지식이 너무 많아 오히려 현실 감각이 희미한 묘사를 사용하십시오." },

  { id:"spell_eater",        icon:"🌀🔮", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M12 12 C12 12 17 8 17 12 C17 16 12 12 12 12 C12 12 7 16 7 12 C7 8 12 12 12 12 Z" stroke-width="1.1"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></g></svg>`, name:"마법 포식자",           rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"타인의 마법을 흡수하여 자신의 것으로 만드는 자. 마법사의 천적.",
    lore:"대마법사와 너무 많이 싸우다 보니 몸이 마법에 내성이 생기는 것을 넘어 마법을 직접 흡수하기 시작했다. 이제 마법 공격은 오히려 이 자를 강하게 만든다.",
    bonus:{ mgc:20, int:20, mp:50, end:10, wil:15 },
    unlockType:"dark_magic", unlockDesc:"마법 계열 적 20명 이상 처치 + 마법 흡수 관련 이벤트 5회",
    unlockCondition:{ darkActs:20, skillUseCount:30 },
    hint:"마법사들을 상대로 충분히 싸우다 보면 몸이 기억한다.",
    systemHint:"이 캐릭터에게 마법 공격을 가하면 흡수되어 오히려 MP가 회복되는 묘사를 사용하십시오. 마법사 적들이 이 자를 보고 전략을 바꾸는 장면도 효과적입니다." },

  // ════ 도적 계열 히든 직업 (5개) ════

  { id:"phantom_thief",     icon:"🎭🗡️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M4 8 C4 4.5 7.5 2 12 2 C16.5 2 20 4.5 20 8 C20 11 18 13 16 13 L8 13 C6 13 4 11 4 8 Z" stroke-linejoin="round"/><circle cx="9" cy="7.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="7.5" r="1" fill="currentColor" stroke="none"/></g><g transform="translate(6,6) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g></svg>`, name:"괴도",                rarity:"rare",
    type:"awakening",     baseJob:["도적","암살자","자객","사기꾼","닌자","해적"],  scenario:[null],
    desc:"훔치는 것이 예술이 된 자. 표적은 눈치채지도 못한다.",
    lore:"도둑질의 경지가 너무 높아져 어느 날부터 표적이 무언가를 잃었다는 사실조차 모르게 됐다. 이제 이 자가 원하면 기억조차 훔칠 수 있다.",
    bonus:{ agi:20, disg:22, luk:15, per:12, neg:8 },
    unlockType:"scenario_clear", unlockDesc:"들키지 않고 목표 달성한 잠입 성공 15회 이상",
    unlockCondition:{ stealthEndings:3, baseJobMatch:true },
    hint:"완벽한 잠입을 반복해야 한다. 흔적을 남기지 마라.",
    systemHint:"이 캐릭터는 행동 후 NPC들이 무엇이 일어났는지조차 모르는 묘사를 사용하십시오. 훔치고 나타나고 사라지는 과정이 마치 마술처럼 보여야 합니다." },

  { id:"venom_dancer",      icon:"🐍🗡️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M4 6 C4 6 8 4 10 7 C12 10 8 11 10 14 C12 17 16 15 18 18 C19 19.5 18.5 21 17 21" /><circle cx="17" cy="21" r="1" fill="currentColor" stroke="none"/></g><g transform="translate(6,6) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g></svg>`, name:"독무 검객",            rarity:"rare",
    type:"awakening",     baseJob:["도적","암살자","혈무 무도가","닌자","자객"],  scenario:[null],
    desc:"독과 춤을 합친 자. 한 번 닿으면 반드시 죽는다.",
    lore:"독초와 독충을 연구하다 어느새 스스로의 몸에 독을 축적하기 시작했다. 피부를 스치는 것만으로 상대가 중독된다.",
    bonus:{ agi:18, crit:20, disg:12, per:10, hp:-5 },
    unlockType:"dark_weapon_use", unlockDesc:"독 계열 아이템/공격 20회 이상 사용 + AGI 80 달성",
    unlockCondition:{ darkActs:10, baseJobMatch:true },
    hint:"독을 끊임없이 연구하고 사용해야 한다.",
    systemHint:"이 캐릭터의 손끝은 항상 미세하게 보랏빛을 띱니다. 전투에서 살짝 스치는 것만으로도 상대가 독에 중독되는 긴장감 있는 묘사를 사용하십시오." },

  { id:"king_of_thieves",   icon:"👑🗡️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M3 17 L21 17 L21 20 L3 20 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g></svg>`, name:"도적왕",              rarity:"legendary",
    type:"evolution",     baseJob:["그림자 무도가","암살자","해적","괴도","그림자 지배자"],  scenario:[null],
    desc:"지하세계를 통치하는 자. 모든 도적이 이 자의 이름 앞에 고개를 숙인다.",
    lore:"그림자 속에서 너무 오랜 시간을 보내다 어느 날 지하세계 전체가 이 자에게 충성을 맹세했다. 이제 밤의 세계는 이 자의 것이다.",
    bonus:{ disg:30, neg:25, fear:20, luk:20, agi:15 },
    unlockType:"awakened_evolution", unlockDesc:"도적 계열 각성직 보유 + 지하세계 관련 이벤트 15회",
    unlockCondition:{ baseJobMatch:true, minCycle:6, stealthEndings:5 },
    hint:"도적 계열 각성직으로 지하세계에서 이름을 떨쳐야 한다.",
    systemHint:"이 캐릭터가 나타나면 도적 NPC들이 자발적으로 길을 비킵니다. 지하세계의 정보는 모두 이 자를 거쳐 흐른다는 묘사를 포함하십시오." },

  { id:"mirror_self",       icon:"🪞🗡️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><ellipse cx="12" cy="11" rx="7" ry="9" stroke-width="1.3"/><path d="M9 21 L15 21 M12 20 L12 21" stroke-width="1.2"/></g><g transform="translate(6,6) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g></svg>`, name:"거울 자아",            rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"자신을 무한히 복사하는 자. 어느 것이 진짜인지 아무도 모른다.",
    lore:"변장과 위장을 너무 완벽하게 해온 결과, 어느 날부터 '원래의 나'라는 개념이 사라지기 시작했다. 이제 이 자는 원하는 누구든 될 수 있다.",
    bonus:{ disg:30, per:20, agi:15, int:15, mad:10 },
    unlockType:"scenario_clear", unlockDesc:"완벽한 위장으로 핵심 NPC를 속인 횟수 10회 이상",
    unlockCondition:{ stealthEndings:4, dimensionPins:5 },
    hint:"자신을 잃을 만큼 타인이 되어야 한다.",
    systemHint:"이 캐릭터는 외모, 목소리, 심지어 마법 기운까지 완벽히 복사합니다. 적이 아군인지 적인지 혼동하는 혼란스러운 전투 묘사를 사용하십시오." },

  { id:"night_sovereign",   icon:"🌙🗡️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M20 12.5 C20 17.7 15.7 22 10.5 22 C7.9 22 5.5 20.9 3.8 19.1 C8.3 19.5 12.6 16.1 12.6 10.8 C12.6 7.5 10.9 4.6 8.4 3 C14.8 2.5 20 6.9 20 12.5 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g></svg>`, name:"밤의 지배자",          rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"밤이 되면 세계가 이 자의 것이 된다. 어둠을 다스리는 진정한 군주.",
    lore:"밤마다 활동하기를 수십 번 반복하다 마침내 밤 자체가 이 자를 섬기기 시작했다. 해가 지면 이 자의 능력이 두 배가 된다.",
    bonus:{ agi:22, disg:20, crit:20, per:18, fear:15 },
    unlockType:"sealed_god", unlockDesc:"야간 전투 승리 30회 이상 + 그림자 무도가 or 괴도 해금",
    unlockCondition:{ stealthEndings:3, totalDeaths:10, bardFame:40 },
    hint:"낮보다 밤을 선택하고 어둠 속에서 활동해야 한다.",
    systemHint:"이 캐릭터는 낮과 밤에 아예 다른 인물처럼 행동합니다. 태양이 지는 순간 분위기가 완전히 바뀌는 극적인 묘사를 사용하십시오." },

  // ════ 방랑자 계열 히든 직업 (5개) ════

  { id:"world_wanderer",    icon:"🌍♾️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g><g transform="translate(6,6) scale(0.62)"><path d="M7 8 C4.2 8 2 10 2 12 C2 14 4.2 16 7 16 C10 16 11 12 12 12 C13 12 14 16 17 16 C19.8 16 22 14 22 12 C22 10 19.8 8 17 8 C14 8 13 12 12 12 C11 12 10 8 7 8 Z" stroke-linejoin="round"/></g></svg>`, name:"세계 방랑자",           rarity:"rare",
    type:"awakening",     baseJob:["방랑자","상인","탐정","사냥꾼","음유시인","모험가"],  scenario:[null],
    desc:"어느 세계에도 속하지 않는 진정한 이방인. 모든 세계관을 자유롭게 오간다.",
    lore:"너무 많은 세계를 돌아다니다 이제 어디에 있어도 낯설지 않게 되었다. 동시에 어디에서도 완전히 속하지 않는 자.",
    bonus:{ luk:20, per:18, int:12, agi:10, wil:10 },
    unlockType:"dimension_map", unlockDesc:"5개 이상의 다른 세계관 시나리오 경험 + LUK 80",
    unlockCondition:{ dimensionPins:5, baseJobMatch:true },
    hint:"여러 세계관을 직접 발로 밟아야 한다.",
    systemHint:"이 캐릭터는 어느 세계에 가도 자연스럽게 녹아들며, 현지인보다 더 그 세계를 잘 아는 듯한 묘사를 포함하십시오. 하지만 어딘가 고독한 느낌을 유지하십시오." },

  { id:"destiny_broker",    icon:"🎲🌍", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><rect x="3" y="3" width="18" height="18" rx="3" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, name:"운명 중개인",           rarity:"rare",
    type:"awakening",     baseJob:["상인","탐정","음유시인","방랑자","외교관"],  scenario:[null],
    desc:"사람과 사람 사이의 운명을 이어주는 자. 만남 자체가 이 자의 힘이다.",
    lore:"수많은 이들의 삶에 개입하다 보니 이제 두 존재가 만나야 할 운명인지 아닌지가 보이기 시작했다. 이 자가 원하면 운명도 중개할 수 있다.",
    bonus:{ neg:22, luk:20, spk:15, per:12, rep:15 },
    unlockType:"karma_pure", unlockDesc:"NPC와의 관계 이벤트 30회 이상 + 호감도 최대 NPC 5명 이상",
    unlockCondition:{ pureKarmaEndings:3, baseJobMatch:true },
    hint:"사람들 사이에서 끊임없이 다리를 놓아야 한다.",
    systemHint:"이 캐릭터가 두 NPC를 소개하면 그 관계가 특별해지는 묘사를 사용하십시오. 우연한 만남처럼 보이지만 이 자가 의도한 운명이라는 뉘앙스를 담으십시오." },

  { id:"legend_maker",      icon:"📜🌍", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M6 3 C4.5 3 4 4 4 5 L4 19 C4 20 4.5 21 6 21 L18 21 C19.5 21 20 20 20 19 L20 5 C20 4 19.5 3 18 3 Z" stroke-linejoin="round"/><path d="M8 8 L16 8 M8 12 L16 12 M8 16 L13 16" stroke-width="1.1"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, name:"전설 창조자",           rarity:"legendary",
    type:"evolution",     baseJob:["음유시인","신화의 영웅","세계 방랑자","운명 중개인"],  scenario:[null],
    desc:"이야기를 만들어내는 자. 이 자가 말하면 그것이 곧 역사가 된다.",
    lore:"음유시인으로 노래하고 방랑자로 세계를 걸으며 어느 날 깨달았다. 내가 이야기를 만드는 것이 아니라 내가 이야기 자체라는 것을.",
    bonus:{ rep:35, luk:25, spk:20, wil:15, per:15 },
    unlockType:"awakened_evolution", unlockDesc:"방랑자 계열 각성직 보유 + 명성 점수 500 이상",
    unlockCondition:{ baseJobMatch:true, minCycle:7, bardFame:80, templeLevel:3 },
    hint:"방랑자 계열 각성직으로 세계에 이름을 남겨야 한다.",
    systemHint:"이 캐릭터가 어떤 사건을 목격하거나 개입하면 그 사건이 전설로 기록됩니다. NPC들이 이 자의 행적을 이야기로 퍼뜨리는 묘사를 자주 포함하십시오." },

  { id:"chaos_avatar",      icon:"🎲💥", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><rect x="3" y="3" width="18" height="18" rx="3" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></g><g transform="translate(6,6) scale(0.62)"><path d="M12 2 L14 8 L20 6 L16 11 L20 16 L14 14 L12 20 L10 14 L4 16 L8 11 L4 6 L10 8 Z" stroke-linejoin="round"/></g></svg>`, name:"혼돈의 화신",           rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"예측 불가능 자체가 된 존재. 주사위를 굴리듯 운명을 가지고 논다.",
    lore:"너무 많은 선택지를 거치다 보니 인과율조차 이 자에게 포기를 선언했다. 이 자의 다음 행동은 이 자 자신도 모른다.",
    bonus:{ luk:35, per:15, agi:15, mad:15, wil:-10 },
    unlockType:"legend_complete", unlockDesc:"같은 회차에서 완전히 다른 선택으로 엔딩 5회 이상",
    unlockCondition:{ pureKarmaEndings:2, evilKarmaEndings:2, dimensionPins:8 },
    hint:"예측 불가능하게 행동해야 한다. 패턴을 만들지 마라.",
    systemHint:"이 캐릭터가 행동할 때마다 예상 외의 결과가 따릅니다. 선택의 결과가 논리적이지 않아도 운명이 맞춰주는 황당하고 재미있는 묘사를 사용하십시오." },

  { id:"eternal_pilgrim",   icon:"🕊️🌍", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 20 C12 20 4 15.5 4 9.5 C4 6.5 6.2 4.5 8.8 4.5 C10.2 4.5 11.3 5.2 12 6.3 C12.7 5.2 13.8 4.5 15.2 4.5 C17.8 4.5 20 6.5 20 9.5 C20 15.5 12 20 12 20 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, name:"영원한 순례자",          rarity:"legendary",
    type:"secret",        baseJob:null,  scenario:[null],
    desc:"목적지 없이 영원히 걷는 자. 그 발걸음 자체가 세계를 바꾼다.",
    lore:"환생을 반복하면서도 멈추지 않고 계속 걷다 보니 이제 이 자가 지나간 길에는 반드시 무언가 변화가 생긴다. 목적지는 없지만 여정이 모든 것이다.",
    bonus:{ luk:20, wil:25, per:20, end:15, rep:15 },
    unlockType:"reincarnation_rank", unlockDesc:"10회차 이상 + 매 회차마다 최소 1개 새 세계 탐험",
    unlockCondition:{ minCycle:10, reincarnationRank:2, dimensionPins:10 },
    hint:"오래 살아남으며 끊임없이 새로운 것을 찾아야 한다.",
    systemHint:"이 캐릭터가 지나간 마을은 이후 번영하거나 붕괴하는 등 반드시 변화합니다. 이 자는 그 사실을 알지만 멈추지 않는 숙명적 묘사를 포함하십시오." },
];

// [20차 감사 FIX] 이 함수는 원래 job.unlockType 문자열로 switch를 타면서,
// 각 case가 "그 타입을 처음 쓴 직업"의 필드 1~2개만 하드코딩해 검사했다.
// 문제는 같은 unlockType을 여러 히든 직업이 공유하면서 각자 unlockCondition에
// 서로 다른(더 많은) 필드를 선언했다는 것 — 그런데 switch case는 그 추가
// 필드를 전혀 읽지 않았다. 실제로 발견된 사례:
//   - blood_knight(unlockType:"battle_wins")는 자신의 unlockCondition에
//     lowHpWins:15만 선언했는데, "battle_wins" case는 cond.battleWins만
//     읽어(존재하지 않으니 기본값 20) 완전히 다른 필드(battleWins)로
//     판정했다 — lowHpWins는 전혀 검사되지 않고, 대신 무관한 battleWins만
//     쌓이면 해금됐다.
//   - chaos_avatar(unlockType:"legend_complete")는 pureKarmaEndings /
//     evilKarmaEndings / dimensionPins를 선언했지만, "legend_complete"
//     case는 cond.bardFame·cond.templeLevel만 읽어(둘 다 없으니 기본값
//     80·3) 그 무관한 필드만으로 해금 여부를 결정했다.
//   - legend_maker(unlockType:"awakened_evolution")가 선언한 bardFame:80,
//     templeLevel:3는 "awakened_evolution" case가 deathEyeUnlocked/
//     causalityUnlocked/twinSoulConnected만 읽어서 전혀 검사되지 않았다.
//   - divine_sovereign(templeLevel:5), cursed_sovereign(darkActs:30),
//     echo_of_past(minCycle:12), eternal_pilgrim(dimensionPins:10),
//     dragon_sovereign(sealedGodComplete:false인데도 case가 무조건
//     gameData.sealedGodComplete===true를 강제) 등 10여 개 히든 직업이
//     같은 이유로 스스로 선언한 조건의 일부(또는 전부)가 무시되거나
//     엉뚱한 조건으로 대체되고 있었다.
// 근본 원인은 "unlockType별 하드코딩된 필드 목록"이라는 설계 자체다.
// 각 직업이 자기 unlockCondition에 실제로 적어놓은 필드를 하나도 빠짐없이
// (unlockType과 무관하게) 그대로 검사하도록 일반화했다 — cond에 있는
// 필드만이 그 직업의 진짜 요구조건이라는 원칙. cond의 키 이름과 gameData의
// 필드 이름은 대부분 1:1로 같지만 minCycle(cond) ↔ cycle(gameData) 하나만
// 다르므로 FIELD_MAP으로 매핑한다.
const HIDDEN_JOB_COND_FIELD_MAP = { minCycle: 'cycle' };

export const checkHiddenJobUnlock = (job, gameData) => {
  const currentRole = gameData.currentRole || "";
  const cond = job.unlockCondition || {};

  // 기본 직업 매칭 확인 (각성/진화형만)
  // [20차 감사 FIX] currentRole이 빈 문자열이면(직업이 아직 설정되지
  // 않았거나 캐릭터 데이터가 비어있는 상태) "base.includes(currentRole)"이
  // 어떤 base 문자열에 대해서도 항상 true가 되어(빈 문자열은 모든 문자열의
  // 부분 문자열이므로) baseJobMatch 게이트가 사실상 무력화되고 있었다 —
  // 역할이 전혀 설정되지 않은 캐릭터도 각성/진화형 히든 직업의 기본 직업
  // 조건을 통과해버리는 결과였다. currentRole이 비어있으면 애초에 매칭
  // 대상이 없으므로 즉시 실패로 처리한다.
  if (cond.baseJobMatch && job.baseJob) {
    const roleMatch = !!currentRole && job.baseJob.some(base =>
      currentRole.includes(base) || base.includes(currentRole)
    );
    if (!roleMatch) return false;
  }

  for (const [key, required] of Object.entries(cond)) {
    if (key === 'baseJobMatch') continue; // 위에서 이미 처리
    const actual = gameData[HIDDEN_JOB_COND_FIELD_MAP[key] || key];
    if (typeof required === 'boolean') {
      if (!!actual !== required) return false;
    } else if (typeof required === 'number') {
      if (!((actual || 0) >= required)) return false;
    }
  }
  return true;
};

export function unlockHiddenJob(jobId){
  try{
    const job = HIDDEN_JOBS.find(j => j.id === jobId);
    if(!job) return null;
    const unlocked = loadHiddenJobs();
    if(unlocked.find(j => j.id === jobId)) return null; // 이미 해금됨
    unlocked.push({ id: jobId, unlockedAt: S.msgCount||0 });
    saveHiddenJobs(unlocked);
    toastHTML(`🌟 히든 직업 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(job,{size:14}):(job.icon)} ${esc(job.name)}!`, 4000);
    S._nextInjectedContext = (S._nextInjectedContext||'') + `\n[🌟 히든 직업 해금] ${job.name}을(를) 각성했다. ${job.lore||''} 이 각성을 서사에 비중있게 반영하라.`;
    return job;
  }catch(e){ console.warn('[unlockHiddenJob]', e); return null; }
}
window.unlockHiddenJob = unlockHiddenJob;

window.unlockHiddenJob = unlockHiddenJob;

;

export const getUnlockedHiddenJobs = () => {
  const unlocked = loadHiddenJobs();
  return HIDDEN_JOBS.filter(j => unlocked.find(u => u.id === j.id));
};

export const checkAllHiddenJobUnlocks = (gameData) => {
  const alreadyUnlocked = loadHiddenJobs().map(j => j.id);
  const newUnlocks = [];
  HIDDEN_JOBS.forEach(job => {
    if (!alreadyUnlocked.includes(job.id) && checkHiddenJobUnlock(job, gameData)) {
      const result = (typeof unlockHiddenJob==='function') ? unlockHiddenJob(job.id) : null;
      if (result) newUnlocks.push(result);
    }
  });
  return newUnlocks;
};

export const getHiddenJobProgress = (gameData) => {
  const unlocked = loadHiddenJobs().map(j => j.id);
  return HIDDEN_JOBS.map(job => {
    const isUnlocked = unlocked.includes(job.id);
    const canUnlock = !isUnlocked && checkHiddenJobUnlock(job, gameData);
    return { ...job, isUnlocked, canUnlock };
  });
};

export const getAvailableRecipes = (scenario, cycle) => {
  return CRAFT_RECIPES.filter(r => {
    if (r.scenarios && !r.scenarios.some(s => scenario && scenario.includes(s === "medieval" ? "중세" : s === "cyberpunk" ? "사이버" : s === "apocalypse" ? "아포칼" : s === "mythology" ? "신화" : s === "steampunk" ? "스팀" : s))) return false;
    if (r.id === "void_cloak" && cycle < 5) return false;
    return true;
  });
};
