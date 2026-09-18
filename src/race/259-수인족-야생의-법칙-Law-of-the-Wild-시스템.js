// 🐾 수인족 — 야생의 법칙 (Law of the Wild) 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { BEAST_ACTION_TYPES } from '../data/259-수인족-야생의-법칙-Law-of-the-Wild-시스템.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { lsDel, lsGet, lsSet, toast } from '../utils.js';
import { BEAST_AWAKENING_STAGES, applyBeastAwakeningStats, gainBeastAwakening, loadBeastAwakening, reduceBeastAwakening, renderBeastWildlawPanel } from './260-수인족-패널-렌더.js';

export const BEAST_WILDLAW_KEY = 'taleforge_beast_wildlaw';

export const loadBeastWildlaw  = () => {
  try {
    const raw = lsGet(BEAST_WILDLAW_KEY);
    if (raw) return JSON.parse(raw);
    return {
      packRank:   30,   // 무리 서열 0~100 (오메가→알파)
      beastBlood: 50,   // 야수의 피 0~100 (이성↔야수)
      hunterCode: 50,   // 사냥꾼의 윤리 0~100
      packMembers: [],  // 무리의 유대 [{name, bond:0~100}]
      territories: [],  // 영역 표식 [{name, level:1~3}]
      tabooViolations: 0,
      isLoneWolf: false,
      history: []
    };
  } catch(e) {
    return { packRank:30, beastBlood:50, hunterCode:50, packMembers:[], territories:[], tabooViolations:0, isLoneWolf:false, history:[] };
  }
};

export const saveBeastWildlaw  = (d) => { try { lsSet(BEAST_WILDLAW_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearBeastWildlaw = () => lsDel(BEAST_WILDLAW_KEY);

export function isBeastRace() {
  const race = S.character?.race || '';
  return race.includes('수인') || race.includes('beast') || race.includes('Beast');
}
window.isBeastRace = isBeastRace;

export const BEAST_PACK_RANK_STAGES = [
  { range:[0,15],   name:'홀로 된 자',   icon:'🐾', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" stroke-dasharray="1.5 2"/></svg>`, color:'#604020',
    desc:'모든 무리에서 추방당한 자. 어느 곳에도 속하지 못한다.',
    statBonus:{}, statPenalty:{ cha:-15, trst:-12 },
    aura:'수인 NPC들이 등을 돌린다. 야생 동물도 경계한다.',
    aiHint:'서열 최하위[홀로 된 자]: 이 수인은 모든 무리에서 배척당했다. 수인 NPC들이 눈길조차 주지 않으며, 야생 동물들이 불안하게 거리를 유지한다. 고독과 낙인이 행동 하나하나에 배어있다.',
    skills: []
  },
  { range:[16,35],  name:'오메가',        icon:'🌿', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 C4 16 6 14 6 11 C6 8.5 7.5 7 9.5 7 C11.5 7 13 8.5 13 11 C13 14 15 16 15 20"/></svg>`, color:'#5a7030',
    desc:'가장 낮은 서열. 하지만 무리에 속해있다.',
    statBonus:{ end:5 }, statPenalty:{},
    aura:'다른 수인들이 명령을 내린다. 하지만 따르는 것 자체가 힘이다.',
    aiHint:'서열 1단계[오메가]: 이 수인은 무리의 가장 낮은 자리에 있다. 겸손하게 행동하며, 강자의 말을 따른다. 인간 사회에서는 오히려 순종적인 수인으로 인식되어 접근이 쉬운 편이다.',
    skills: [
      { id:'bp_omega_endure', name:'버텨내는 자', icon:'🌿', type:'passive', rarity:'common',
        desc:'어떤 굴욕도 견뎌낸다. END +10. 압도적 강자에게도 도망가지 않는다.',
        statBoost:{end:80}, mpCost:0, condition:'always', conditionDesc:'항시 발동',
        aiHint:'버텨내는 자: 이 수인은 쉽게 굴복하지 않는다. 맞아도 일어서고, 치여도 자리를 지킨다.' }
    ]
  },
  { range:[36,59],  name:'정예 사냥꾼',   icon:'🏹', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 L19 5"/><path d="M19 5 L14 5 L19 10 Z"/><path d="M5 19 L6 15 L9 18 Z"/></svg>`, color:'#6a9030',
    desc:'무리에서 인정받는 전사. 동료들이 함께 싸우기를 원한다.',
    statBonus:{ str:8, per:6, agi:5 }, statPenalty:{},
    aura:'수인 NPC들이 동등하게 대화를 건넨다. 야생 동물들이 크게 경계하지 않는다.',
    aiHint:'서열 2단계[정예 사냥꾼]: 이 수인은 무리에서 확실한 자리를 얻었다. 동료 수인들이 자연스럽게 곁으로 다가오고, 사냥 이야기를 나눈다. 실력과 의리로 인정받는 존재다.',
    skills: [
      { id:'bp_hunter_sense', name:'사냥꾼의 감각', icon:'🏹', type:'passive', rarity:'uncommon',
        desc:'추적 중 대상의 발자국·냄새 자동 감지. PER +15, 매복 당할 확률 0.',
        statBoost:{per:120, agi:64}, mpCost:0, condition:'always', conditionDesc:'항시 발동',
        aiHint:'사냥꾼의 감각 항시 발동: 이 수인의 코와 귀가 어둠 속에서도 움직임을 포착한다.' },
      { id:'bp_pack_call', name:'무리 소집', icon:'📯', type:'active', rarity:'rare',
        desc:'MP 15. 현재 무리 멤버를 소집. 전투 보조 참여, 1인당 STR/AGI +8.',
        statBoost:{str:64, agi:48}, mpCost:15, condition:null, conditionDesc:'직접 발동',
        aiHint:'무리 소집 발동: 수인 특유의 울부짖음이 울려퍼진다. 어딘가에서 동료들의 응답이 온다.' }
    ]
  },
  { range:[60,79],  name:'베타',           icon:'🌙', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5" stroke-width="1.3"/><path d="M12 2 L12 4.5 M12 19.5 L12 22 M2 12 L4.5 12 M19.5 12 L22 12" stroke-width="1"/></svg>`, color:'#80b040',
    desc:'알파의 오른팔. 무리 전체를 이끌 능력을 인정받았다.',
    statBonus:{ str:14, per:10, cha:8, agi:8 }, statPenalty:{},
    aura:'야생 동물들이 복종의 자세를 취한다. 수인 NPC들이 의견을 구한다.',
    aiHint:'서열 3단계[베타]: 이 수인의 말은 무리에서 법이다. 알파 다음으로 강한 자리. 타 무리에서도 결투 신청이 온다. 야생 동물들이 자연스럽게 무릎을 꿇는다.',
    skills: [
      { id:'bp_beta_roar', name:'베타의 포효', icon:'🦁', type:'active', rarity:'rare',
        desc:'MP 10. 적 3명에게 공포 판정. 실패 시 2턴 전투 의지 상실. 수인 동료 전원 STR/AGI +12.',
        statBoost:{str:96, agi:80, fear:64}, mpCost:10, condition:null, conditionDesc:'직접 발동',
        aiHint:'베타의 포효 발동: 포효가 공기를 가른다. 적들의 발이 잠시 굳는 것이 느껴진다.' },
      { id:'bp_alpha_challenge', name:'알파 도전', icon:'⚔️', type:'event', rarity:'epic',
        desc:'타 무리의 알파에게 결투 신청. 승리 시 무리 서열 +20, 그 무리 영역 획득.',
        statBoost:{str:120, per:80}, mpCost:0, condition:'challenge', conditionDesc:'결투 도전 시 발동',
        aiHint:'알파 도전 발동: 눈과 눈이 마주친다. 말이 필요 없다. 둘 다 무엇이 시작되는지 안다.' }
    ]
  },
  { range:[80,100], name:'알파',            icon:'👑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/></svg>`, color:'#aadd50',
    desc:'무리의 지도자. 야생의 법칙이 이 자를 중심으로 흐른다.',
    statBonus:{ str:22, per:16, cha:14, agi:12, luk:6 }, statPenalty:{},
    aura:'야생 동물들이 자동으로 귀속된다. 수인 NPC들이 절로 복종한다.',
    aiHint:'서열 최고[알파]: 이 수인 앞에서 다른 수인들은 자연스럽게 고개를 낮춘다. 야생 동물들이 본능적으로 복종의 자세를 취하며, 타 무리에서 결투 신청자가 줄을 잇는다. 말 한 마디가 무리의 방향을 결정한다.',
    skills: [
      { id:'bp_alpha_aura', name:'알파의 기운', icon:'👑', type:'passive', rarity:'legendary',
        desc:'모든 수인 NPC 자동 우호적. 야생 동물 1~2마리 자동 귀속. 전 판정 +15.',
        statBoost:{str:160, per:120, cha:100, agi:80}, mpCost:0, condition:'always', conditionDesc:'항시 발동',
        aiHint:'알파의 기운 항시 발동: 이 자가 나타나는 것만으로 장내 분위기가 바뀐다. 수인들이 자리에서 일어나고, 짐승들이 조용해진다.' },
      { id:'bp_primal_howl', name:'원초의 울부짖음', icon:'🌕', type:'active', rarity:'legendary',
        desc:'MP 0. 반경 내 모든 적 공포 상태 3턴. 야생 동물 전부 아군 전환. 쿨다운 없음.',
        statBoost:{str:200, fear:160, per:120}, mpCost:0, condition:null, conditionDesc:'직접 발동',
        aiHint:'원초의 울부짖음 발동: 하늘이 울린다. 새들이 날아오르고, 짐승들이 엎드린다. 적들은 본능적인 공포에 다리가 굳는다.' }
    ]
  }
];

export const BEAST_BLOOD_STAGES = [
  { range:[0,19],   name:'이성의 껍질',   icon:'🧠', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"/><path d="M6 20 C6 15.5 8.5 13 12 13 C15.5 13 18 15.5 18 20"/></svg>`, color:'#5090c0',
    desc:'야수성이 거의 잠들었다. 인간 사회에 완전히 녹아들 수 있다.',
    statBonus:{ int:12, cha:10 }, statPenalty:{ str:-10, per:-6 },
    aura:'수인이라기보다 영리한 인간처럼 보인다. 하지만 동족에게 경멸당한다.',
    aiHint:'야수의 피 최저[이성의 껍질]: 이 수인은 야수성이 완전히 억제됐다. 외교와 협상에 능숙하지만 동족들에게 "반쯤 인간이 된 자"라며 경멸당한다.',
    skills: [
      { id:'bb_rational_mask', name:'이성의 가면', icon:'🎭', type:'passive', rarity:'uncommon',
        desc:'인간 사회에서 수인임을 숨길 수 있다. CHA +12, 인간 NPC 적대도 -30.',
        statBoost:{cha:96, int:80}, mpCost:0, condition:'always', conditionDesc:'항시 발동',
        aiHint:'이성의 가면: 이 수인은 교양 있는 인간처럼 행동한다. 귀와 꼬리를 숨긴다.' }
    ]
  },
  { range:[20,39],  name:'잠든 야성',     icon:'🌿', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8 C4 4.5 7.5 2 12 2 C16.5 2 20 4.5 20 8 C20 11 18 13 16 13 L8 13 C6 13 4 11 4 8 Z" stroke-linejoin="round"/><circle cx="9" cy="7.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="7.5" r="1" fill="currentColor" stroke="none"/></svg>`, color:'#5aa050',
    desc:'이성이 우세하지만 야성의 흔적이 남아있다.',
    statBonus:{ int:6, per:5 }, statPenalty:{ str:-4 },
    aura:'조용하고 관찰력이 날카롭다. 말보다 행동이 빠르다.',
    aiHint:'야수의 피 1단계[잠든 야성]: 평소에는 이성적이지만, 위기 순간에 동물적 반응이 드러난다. 눈동자가 슬쩍 변하거나, 코를 벌름거리는 모습.',
    skills: []
  },
  { range:[40,59],  name:'균형의 수인',   icon:'⚖️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 6"/><path d="M12 6 C10 6 9 4.5 9 3 C10.5 3 12 4 12 6 Z" stroke-width="1.2"/><path d="M12 6 C14 6 15 4.5 15 3 C13.5 3 12 4 12 6 Z" stroke-width="1.2"/></svg>`, color:'#80b040',
    desc:'이성과 야성의 완벽한 균형. 수인 본래의 이상향.',
    statBonus:{ str:8, per:10, int:6, agi:6 }, statPenalty:{},
    aura:'수인다운 당당함이 있다. 동족들이 가장 자연스럽게 대한다.',
    aiHint:'야수의 피 이상향[균형의 수인]: 감각과 이성이 조화롭다. 수인 NPC들이 이 자를 진정한 동족으로 인정하며, 야생 동물들도 편안하게 접근한다.',
    skills: [
      { id:'bb_balance_hunt', name:'완전한 사냥꾼', icon:'🎯', type:'passive', rarity:'rare',
        desc:'이성과 본능을 동시에 사용. 전투·협상·추적 모든 판정 +10.',
        statBoost:{str:64, per:80, int:64, agi:64}, mpCost:0, condition:'always', conditionDesc:'항시 발동',
        aiHint:'완전한 사냥꾼: 이 수인은 머리와 몸이 동시에 움직인다. 계산된 야수성의 결정체.' }
    ]
  },
  { range:[60,79],  name:'깨어난 야수',   icon:'🔥', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12 L21 12" stroke-width="1.4"/><path d="M12 4 L12 20" stroke-width="1.2"/><path d="M6 12 L4 16 L8 16 Z M18 12 L16 16 L20 16 Z" stroke-width="1.1"/></svg>`, color:'#d08030',
    desc:'야성이 강해지고 있다. 강하지만 사회성이 줄어든다.',
    statBonus:{ str:16, per:12, agi:10 }, statPenalty:{ cha:-8, int:-5 },
    aura:'눈빛이 야수처럼 빛난다. NPC들이 본능적으로 긴장한다.',
    aiHint:'야수의 피 고위[깨어난 야수]: 야성이 피부 아래에서 출렁인다. 전투에서 강력하지만, 대화 중 조급함과 공격성이 드러난다.',
    skills: [
      { id:'bb_beast_surge', name:'야수 충동', icon:'🔴', type:'active', rarity:'rare',
        desc:'MP 0. 야수 본능 해방. STR +20, AGI +15. 단 다음 3턴 협상·외교 판정 -15.',
        statBoost:{str:160, agi:120}, mpCost:0, condition:null, conditionDesc:'직접 발동',
        aiHint:'야수 충동 발동: 눈동자가 세로로 갈라진다. 이성이 한 발 물러서고 본능이 전면에 나선다.' }
    ]
  },
  { range:[80,100], name:'야수의 경계',   icon:'⚠️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.5" stroke-width="1.3"/><path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12" stroke-width="1.2"/><path d="M5.5 5.5 L7.5 7.5 M16.5 16.5 L18.5 18.5 M18.5 5.5 L16.5 7.5 M7.5 16.5 L5.5 18.5" stroke-width="1"/></svg>`, color:'#e04020',
    desc:'[위험] 야수성이 이성을 압도한다. 약자를 공격하면 완전 야수화.',
    statBonus:{ str:24, agi:18, per:14 }, statPenalty:{ cha:-18, int:-12, trst:-15 },
    aura:'수인 동료들도 두려움에 거리를 둔다. 인간 NPC들이 도망간다.',
    aiHint:'야수의 피 위험[야수의 경계]: 야수성이 넘쳐흐른다. 폭발적인 전투력을 갖지만, 모든 NPC가 두려움으로 도망가거나 거리를 둔다. 금기: 이 상태에서 약자를 공격하면 돌이킬 수 없는 야수화 이벤트 발동.',
    skills: [
      { id:'bb_primal_terror', name:'원시적 공포', icon:'💀', type:'passive', rarity:'epic',
        desc:'존재 자체가 공포. 모든 적 전투 전 공포 판정. 실패 시 도주 시도. FEAR +20.',
        statBoost:{str:200, fear:160, per:100}, mpCost:0, condition:'always', conditionDesc:'항시 발동',
        aiHint:'원시적 공포 항시 발동: 이 수인의 기운에 닿은 자는 본능적 두려움을 느낀다. 약자들이 접근하지 못한다.' }
    ]
  }
];

export const BEAST_HUNTER_CODE_STAGES = [
  { range:[0,19],   name:'야수 낙인',    icon:'💀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>`, color:'#a02020',
    desc:'사냥의 이유를 잃었다. 수인 사회에서 타락한 자로 낙인찍힌다.',
    statBonus:{ fear:15, str:10 }, statPenalty:{ cha:-18, trst:-15 },
    aiHint:'사냥꾼의 윤리 최저[야수 낙인]: 이 수인은 무고한 자를 사냥했다. 수인 원로들에게 외면당하며, 강함을 증명하려는 행위가 반복될수록 야수로 타락하는 길임을 다른 수인들이 경고한다.'
  },
  { range:[20,39],  name:'흐릿한 윤리',  icon:'🌑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.2"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.3"/></svg>`, color:'#805020',
    desc:'윤리가 흔들린다. 가끔 잘못된 사냥을 한다.',
    statBonus:{ str:5 }, statPenalty:{ cha:-6 },
    aiHint:'사냥꾼의 윤리 하위[흐릿한 윤리]: 동기가 불분명해지고 있다. 사냥의 이유를 묻는 장면에서 대답을 망설인다.'
  },
  { range:[40,59],  name:'사냥꾼',       icon:'🏕️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 L4 12 L12 5 L20 12 L20 20 Z" stroke-linejoin="round"/></svg>`, color:'#7a9830',
    desc:'먹기 위해, 살기 위해 사냥한다. 올바른 사냥꾼.',
    statBonus:{ str:8, per:8, agi:6 }, statPenalty:{},
    aiHint:'사냥꾼의 윤리 중간[사냥꾼]: 이 수인은 이유 있는 사냥만 한다. 동료를 위해, 생존을 위해. 수인 NPC들이 동료로 인정한다.'
  },
  { range:[60,79],  name:'진정한 사냥꾼', icon:'🌿', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 6"/><path d="M12 6 C10 6 9 4.5 9 3 C10.5 3 12 4 12 6 Z" stroke-width="1.2"/><path d="M12 6 C14 6 15 4.5 15 3 C13.5 3 12 4 12 6 Z" stroke-width="1.2"/></svg>`, color:'#50a040',
    desc:'올바른 사냥이 몸에 배었다. 수인 원로들이 인정하기 시작한다.',
    statBonus:{ str:12, per:12, agi:10, cha:6 }, statPenalty:{},
    aiHint:'사냥꾼의 윤리 고위[진정한 사냥꾼]: 이 수인의 사냥에는 격이 있다. 원로 수인들이 고개를 끄덕이며, 전설적 사냥터 입장을 허가한다.'
  },
  { range:[80,100], name:'전설의 사냥꾼', icon:'⭐', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></svg>`, color:'#90d040',
    desc:'수인 최고 원로에게 "진정한 사냥꾼"으로 인정받는다.',
    statBonus:{ str:20, per:18, agi:14, cha:12, luk:8 }, statPenalty:{},
    aiHint:'사냥꾼의 윤리 최고[전설의 사냥꾼]: 이 수인의 이름이 전설에 남는다. 수인 최고 원로가 먼저 찾아온다. 야수어가 해금되고, 비밀 사냥터가 열린다.',
    skills: [
      { id:'hc_legend_mark', name:'전설의 표식', icon:'⭐', type:'event', rarity:'legendary',
        desc:'전설의 적을 만나면 자동 발동. 해당 전투 모든 판정 +25, 패배 시에도 전설적 서사 보장.',
        statBoost:{str:200, per:160, agi:120}, mpCost:0, condition:'legend_encounter', conditionDesc:'전설적 적 조우 시',
        aiHint:'전설의 표식 발동: 이 순간을 위해 살아왔다. 눈이 빛난다. 진짜 사냥이 시작된다.' }
    ]
  }
];

export function getBeastPackRankStage(rank) {
  return BEAST_PACK_RANK_STAGES.find(s => rank >= s.range[0] && rank <= s.range[1]) || BEAST_PACK_RANK_STAGES[1];
}
window.getBeastPackRankStage = getBeastPackRankStage;

export function getBeastBloodStage(blood) {
  return BEAST_BLOOD_STAGES.find(s => blood >= s.range[0] && blood <= s.range[1]) || BEAST_BLOOD_STAGES[2];
}
window.getBeastBloodStage = getBeastBloodStage;

export function getBeastHunterCodeStage(code) {
  return BEAST_HUNTER_CODE_STAGES.find(s => code >= s.range[0] && code <= s.range[1]) || BEAST_HUNTER_CODE_STAGES[2];
}
window.getBeastHunterCodeStage = getBeastHunterCodeStage;

export function triggerBeastAction(actionId) {
  if (!isBeastRace()) return;
  const def = BEAST_ACTION_TYPES[actionId];
  if (!def) return;
  const data = loadBeastWildlaw();

  // 금기 체크
  if (actionId === 'pack_betray' || actionId === 'code_show' || actionId === 'code_massacre') {
    data.tabooViolations = (data.tabooViolations || 0) + 1;
  }

  // 배신 누적 시 홀로 된 자 상태
  if (actionId === 'pack_betray' && data.packRank > 0) {
    if (data.tabooViolations >= 2) {
      data.isLoneWolf = true;
      data.packRank = 5;
      data.packMembers = [];
      setTimeout(() => toast('🐺 홀로 된 자가 됐다. 모든 무리가 등을 돌린다...', 6000), 500);
    }
  }

  // 야수 80 이상 + 무고한 자 학살 = 야수화
  if (actionId === 'code_massacre' && data.beastBlood >= 80) {
    data.beastBlood = 100;
    setTimeout(() => toast('⚠️ 완전 야수화 위기! 수인 사회 영구 추방 위험!', 6000), 500);
    if (S._nextInjectedContext !== undefined)
      S._nextInjectedContext = (S._nextInjectedContext || '') +
        ' [⚠️ 완전 야수화 위기: 야수의 피가 100에 도달했다. 이 수인의 이성이 완전히 무너지려 한다. 동료들이 공포에 거리를 두고, 수인 원로들이 야수 추방 심판을 준비하는 장면을 연출하라.]';
  }

  data.packRank   = Math.max(0, Math.min(100, (data.packRank || 30) + def.rankDelta));
  data.beastBlood = Math.max(0, Math.min(100, (data.beastBlood || 50) + def.bloodDelta));
  data.hunterCode = Math.max(0, Math.min(100, (data.hunterCode || 50) + def.codeDelta));

  data.history = data.history || [];
  data.history.push({
    actionId, icon: def.icon, label: def.label,
    rankDelta: def.rankDelta, bloodDelta: def.bloodDelta, codeDelta: def.codeDelta,
    packRank: data.packRank, beastBlood: data.beastBlood, hunterCode: data.hunterCode,
    at: new Date().toISOString().slice(0, 16)
  });
  

  saveBeastWildlaw(data);
  applyBeastWildlawStats();

  const rStr = def.rankDelta !== 0 ? ` 서열${def.rankDelta>0?'+':''}${def.rankDelta}` : '';
  const bStr = def.bloodDelta !== 0 ? ` 야수${def.bloodDelta>0?'+':''}${def.bloodDelta}` : '';
  const cStr = def.codeDelta !== 0 ? ` 윤리${def.codeDelta>0?'+':''}${def.codeDelta}` : '';
  toast(`${def.label}${rStr}${bStr}${cStr}`, 3000, def);
  return data;
}
window.triggerBeastAction = triggerBeastAction;

export function addPackMember(name) {
  if (!isBeastRace()) return;
  const data = loadBeastWildlaw();
  if ((data.packMembers||[]).find(m => m.name === name)) { toast('이미 무리원입니다', 2000); return; }
  if ((data.packMembers||[]).length >= 5) { toast('무리는 최대 5명까지입니다', 2000); return; }
  data.packMembers = [...(data.packMembers||[]), { name, bond: 10 }];
  saveBeastWildlaw(data);
  applyBeastWildlawStats();
  toast(`🫂 ${name}이(가) 무리에 합류했다!`, 3000);
  renderBeastWildlawPanel();
}
window.addPackMember = addPackMember;

export function increaseMemberBond(name, amount) {
  if (!isBeastRace()) return;
  const data = loadBeastWildlaw();
  const m = (data.packMembers||[]).find(m => m.name === name);
  if (!m) return;
  m.bond = Math.min(100, (m.bond || 0) + (amount || 10));
  saveBeastWildlaw(data);
  applyBeastWildlawStats();
  toast(`🫂 ${name}과의 유대가 깊어졌다 (${m.bond}/100)`, 2500);
  renderBeastWildlawPanel();
}
window.increaseMemberBond = increaseMemberBond;

export function removePackMember(name) {
  if (!isBeastRace()) return;
  const data = loadBeastWildlaw();
  const before = (data.packMembers||[]).length;
  data.packMembers = (data.packMembers||[]).filter(m => m.name !== name);
  if (data.packMembers.length === 0 && before > 0) {
    // 무리가 0명 → 홀로 된 자 위험 경고
    setTimeout(() => toast('🐺 무리가 사라졌다. 홀로 된 자의 길이 보인다...', 4000), 300);
  }
  saveBeastWildlaw(data);
  applyBeastWildlawStats();
  toast(`😢 ${name}이(가) 무리를 떠났다`, 2500);
  renderBeastWildlawPanel();
}
window.removePackMember = removePackMember;

export function addTerritory(name) {
  if (!isBeastRace()) return;
  const data = loadBeastWildlaw();
  if ((data.territories||[]).find(t => t.name === name)) { toast('이미 표식된 영역입니다', 2000); return; }
  data.territories = [...(data.territories||[]), { name, level: 1 }];
  data.packRank = Math.min(100, (data.packRank || 30) + 4); // 영역 확장 시 서열 상승
  saveBeastWildlaw(data);
  applyBeastWildlawStats();
  toast(`🗺️ ${name}에 영역 표식이 새겨졌다! 서열 +4`, 3000);
  renderBeastWildlawPanel();
}
window.addTerritory = addTerritory;

export function applyBeastWildlawStats() {
  if (!isBeastRace()) return;
  const data = loadBeastWildlaw();

  // 이전 보너스 제거
  const prevPack  = S._beastPackBonus  || {};
  const prevBlood = S._beastBloodBonus || {};
  const prevCode  = S._beastCodeBonus  || {};
  [prevPack, prevBlood, prevCode].forEach(prev => {
    Object.entries(prev).forEach(([k, v]) => {
      if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v);
    });
  });

  // 서열 보너스
  const packStg = getBeastPackRankStage(data.packRank || 30);
  const pb = {};
  Object.entries(packStg.statBonus || {}).forEach(([k, v]) => {
    S.stats[k] = Math.min(999, (S.stats[k] || 50) + v); pb[k] = v;
  });
  Object.entries(packStg.statPenalty || {}).forEach(([k, v]) => {
    S.stats[k] = Math.max(0, (S.stats[k] || 50) + v);
  });
  // 서열 스킬 보너스
  (packStg.skills||[]).forEach(sk => {
    Object.entries(sk.statBoost||{}).forEach(([k,v]) => {
      const rv=Math.round(v/8); S.stats[k]=Math.min(999,(S.stats[k]||50)+rv); pb[k]=(pb[k]||0)+rv;
    });
  });
  S._beastPackBonus = pb;

  // 야수의 피 보너스
  const bloodStg = getBeastBloodStage(data.beastBlood || 50);
  const bb = {};
  Object.entries(bloodStg.statBonus || {}).forEach(([k, v]) => {
    S.stats[k] = Math.min(999, (S.stats[k] || 50) + v); bb[k] = v;
  });
  Object.entries(bloodStg.statPenalty || {}).forEach(([k, v]) => {
    S.stats[k] = Math.max(0, (S.stats[k] || 50) + v);
  });
  (bloodStg.skills||[]).forEach(sk => {
    Object.entries(sk.statBoost||{}).forEach(([k,v]) => {
      const rv=Math.round(v/8); S.stats[k]=Math.min(999,(S.stats[k]||50)+rv); bb[k]=(bb[k]||0)+rv;
    });
  });
  S._beastBloodBonus = bb;

  // 사냥꾼 코드 보너스
  const codeStg = getBeastHunterCodeStage(data.hunterCode || 50);
  const cb = {};
  Object.entries(codeStg.statBonus || {}).forEach(([k, v]) => {
    S.stats[k] = Math.min(999, (S.stats[k] || 50) + v); cb[k] = v;
  });
  Object.entries(codeStg.statPenalty || {}).forEach(([k, v]) => {
    S.stats[k] = Math.max(0, (S.stats[k] || 50) + v);
  });
  (codeStg.skills||[]).forEach(sk => {
    Object.entries(sk.statBoost||{}).forEach(([k,v]) => {
      const rv=Math.round(v/8); S.stats[k]=Math.min(999,(S.stats[k]||50)+rv); cb[k]=(cb[k]||0)+rv;
    });
  });
  S._beastCodeBonus = cb;

  // 무리 유대 보너스 (유대가 깊은 멤버 수 * 소량 보너스)
  const totalBond = (data.packMembers||[]).reduce((a,m) => a + (m.bond||0), 0);
  const bondBonus = Math.floor(totalBond / 100);
  ['str','per','agi'].forEach(k => {
    S.stats[k] = Math.min(999, (S.stats[k]||50) + bondBonus);
  });

  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
  // 🌕 야수각성 스탯도 함께 반영
  if (typeof applyBeastAwakeningStats === 'function') applyBeastAwakeningStats();
}
window.applyBeastWildlawStats = applyBeastWildlawStats;

export function getBeastWildlawStatus() {
  if (!isBeastRace()) return null;
  const data = loadBeastWildlaw();
  const awakenStatus = typeof loadBeastAwakening === 'function' ? loadBeastAwakening() : null;
  const awakenStage  = awakenStatus ? BEAST_AWAKENING_STAGES[awakenStatus.stage || 0] : null;
  return {
    ...data,
    packRankStage:   getBeastPackRankStage(data.packRank||30),
    beastBloodStage: getBeastBloodStage(data.beastBlood||50),
    hunterCodeStage: getBeastHunterCodeStage(data.hunterCode||50),
    awakening: awakenStatus ? {
      points: awakenStatus.points,
      stage:  awakenStatus.stage,
      stageName: awakenStage?.name,
      stageIcon: awakenStage?.icon,
      aiHint:    awakenStage?.aiHint || '',
      aura:      awakenStage?.icon ? `야수각성[${awakenStage.name}]: ${awakenStage.aura}` : '',
      fullAwakened: awakenStatus.fullAwakened
    } : null
  };
}
window.getBeastWildlawStatus = getBeastWildlawStatus;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_233(){
function detectBeastWildlawFromText(text) {
  if (!text || !isBeastRace()) return;
  if (/동료를 지켰|몸으로 막았|보호했|감쌌|살렸/.test(text) && Math.random() < 0.45)
    triggerBeastAction('pack_protect');
  if (/함께 사냥|무리와 함께|같이 나섰/.test(text) && Math.random() < 0.4)
    triggerBeastAction('pack_hunt');
  if (/도전장|결투 신청|먼저 나섰/.test(text) && Math.random() < 0.35)
    triggerBeastAction('pack_challenge');
  if (/먹기 위해|생존을 위해|식량 확보/.test(text) && Math.random() < 0.4)
    triggerBeastAction('code_survival');
  if (/이성을 유지|억눌렀|참았|냉정하게/.test(text) && Math.random() < 0.3)
    triggerBeastAction('beast_reason');
  if (/강함을 증명|보여주기 위해|허세|과시/.test(text) && Math.random() < 0.5)
    triggerBeastAction('code_show');
  if (/도망쳤|버리고 떠|혼자 살/.test(text) && Math.random() < 0.45)
    triggerBeastAction('pack_flee');
  if (/야수가 되었|본능이 폭발|제어할 수 없/.test(text) && Math.random() < 0.5)
    triggerBeastAction('beast_frenzy');
  // 🌕 야수각성 자동 감지
  if(typeof gainBeastAwakening==='function'){
    if(/변신했|야수 형태|짐승으로 변|포효했|울부짖/.test(text) && Math.random()<0.5) gainBeastAwakening('shapeshift',null,true);
    if(/피를 뒤집어|선혈이 낭자|눈이 붉어|살기가 번/.test(text) && Math.random()<0.45) gainBeastAwakening('bloodFight',null,true);
    if(/영역 표시|냄새를 남|자신의 구역|경계를 그/.test(text) && Math.random()<0.4) gainBeastAwakening('territoryMark',null,true);
    if(/야수어로|동물에게 말|짐승과 대화|포식자의 말/.test(text) && Math.random()<0.4) gainBeastAwakening('beastSpeak',null,true);
    if(/사냥 의식|무리의 의식|달빛 아래|집단으로 사냥/.test(text) && Math.random()<0.35) gainBeastAwakening('ritualHunt',null,true);
    if(/이성으로 돌아|야성을 억누|인간다운|냉정함을 찾/.test(text) && Math.random()<0.4) reduceBeastAwakening(8,'reason_control');
  }
}
window.detectBeastWildlawFromText = detectBeastWildlawFromText;
}

