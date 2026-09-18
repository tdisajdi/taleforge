// 🌟 renderHumanAwakeningPanel 완전 재정의 — data
// Pure data split out of ui/026-renderHumanAwakeningPanel-완전-재정의.js (see generate.js).

export const LEGACY_PATHS = {
  warrior: {
    label: '전사형',   icon: '⚔️', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></svg>', color: '#e06030',
    desc:  '싸워서 길을 열어온 자. 전투와 용기로 역사에 이름을 새긴다.',
    lore:  '"그는 검을 들고 앞으로 나아갔다. 두려워하면서도."',
    thresholdToLock: 40,
    perLevelBonus: { str: 8, end: 6, fear: 5, crit: 4 },
    maxLevel: 5,
    awakeSkill: { id:'hl_warrior_legend', name:'전설의 칼날', icon:'⚔️📜',
      type:'active', rarity:'legendary', mpCost:0,
      desc:'HP 25 소모. 과거 전투의 기억을 모아 단 한 번의 전설적 일격. 현재 유산 포인트만큼 보정. 쿨다운 없음.',
      statBoost:{str:400, crit:280, fear:200} }
  },
  sage: {
    label: '현자형',   icon: '📚', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L4 19 L11 19 L11 4 Z" stroke-linejoin="round"/><path d="M13 4 L13 19 L20 19 L20 4 Z" stroke-linejoin="round"/></svg>', color: '#60a0e0',
    desc:  '배우고 가르쳐온 자. 지식과 지혜로 시대를 바꾼다.',
    lore:  '"그녀가 쓴 한 권의 책이 백 년을 살아남았다."',
    thresholdToLock: 40,
    perLevelBonus: { int: 8, per: 6, mgc: 6, wis: 5 },
    maxLevel: 5,
    awakeSkill: { id:'hl_sage_legacy', name:'지혜의 유산', icon:'📚💡',
      type:'passive', rarity:'legendary', mpCost:0,
      desc:'판단력이 극에 달함. 모든 INT 판정 자동 성공. 적의 약점이 즉시 파악된다. 배운 모든 것이 몸에 깃들었다.',
      statBoost:{int:360, per:280, mgc:200} }
  },
  diplomat: {
    label: '외교관형', icon: '🤝', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 L9 12 L11 9 L13 15 L15 12 L22 12" stroke-linejoin="round"/><circle cx="6" cy="8" r="2.2"/><circle cx="18" cy="8" r="2.2"/></svg>', color: '#50d090',
    desc:  '말로 세상을 바꿔온 자. 연결과 신뢰로 제국을 세운다.',
    lore:  '"그의 말 한 마디가 전쟁을 멈췄다."',
    thresholdToLock: 40,
    perLevelBonus: { cha: 9, trst: 8, ldr: 7, rep: 6 },
    maxLevel: 5,
    awakeSkill: { id:'hl_diplomat_legacy', name:'외교의 전설', icon:'🤝👑',
      type:'active', rarity:'legendary', mpCost:0,
      desc:'MP 0. 어떤 적이든 협상 테이블로 끌어낸다. 첫 번째 협상 판정 자동 성공. 상대 NPC 호감 즉시 +30.',
      statBoost:{cha:400, trst:300, ldr:200} }
  },
  martyr: {
    label: '희생자형', icon: '🕊️', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 4 15.5 4 9.5 C4 6.5 6.2 4.5 8.8 4.5 C10.2 4.5 11.3 5.2 12 6.3 C12.7 5.2 13.8 4.5 15.2 4.5 C17.8 4.5 20 6.5 20 9.5 C20 15.5 12 21 12 21 Z" stroke-linejoin="round"/></svg>', color: '#d0a0e0',
    desc:  '자신을 내어준 자. 희생으로 타인을 구하고 역사에 빛을 남긴다.',
    lore:  '"그 이름은 아무도 기억하지 않지만, 그의 선택은 세상을 바꿨다."',
    thresholdToLock: 30,
    perLevelBonus: { wil: 8, rep: 7, trst: 6, luk: 5 },
    maxLevel: 5,
    awakeSkill: { id:'hl_martyr_legacy', name:'희생의 유산', icon:'🕊️✨',
      type:'passive', rarity:'legendary', mpCost:0,
      desc:'자신이 피해를 받을 때마다 아군 전체 WIL·HP +10. 사망 직전 1회 부활. 희생 횟수만큼 모든 스탯 보정.',
      statBoost:{wil:320, rep:240, trst:200, luk:120} }
  }
};

export const LEGACY_ACTIONS = [
  { id:'w_fight',    path:'warrior',  points:10, label:'용감히 싸웠다',     icon:'⚔️', desc:'전투에서 물러서지 않았다. 두려워도 앞에 섰다.' },
  { id:'w_protect',  path:'warrior',  points:8,  label:'동료를 지켰다',     icon:'🛡️', desc:'자신의 몸을 방패로 삼았다.' },
  { id:'w_conquer',  path:'warrior',  points:12, label:'강적을 쓰러뜨렸다', icon:'🏆', desc:'불가능해 보이던 적을 이겼다.' },
  { id:'s_discover', path:'sage',     points:10, label:'새로운 지식을 얻었다', icon:'💡', desc:'알지 못했던 것을 배웠다.' },
  { id:'s_teach',    path:'sage',     points:8,  label:'타인에게 가르쳤다', icon:'📖', desc:'알고 있는 것을 아낌없이 나눴다.' },
  { id:'s_solve',    path:'sage',     points:12, label:'난제를 해결했다',    icon:'🔍', desc:'지식으로 막힌 길을 열었다.' },
  { id:'d_convince', path:'diplomat', points:10, label:'설득에 성공했다',    icon:'🗣️', desc:'말로 상대의 마음을 돌렸다.' },
  { id:'d_unite',    path:'diplomat', points:12, label:'대립을 화해시켰다', icon:'🤝', desc:'싸우던 두 세력을 연결했다.' },
  { id:'d_alliance', path:'diplomat', points:8,  label:'동맹을 맺었다',     icon:'🏛️', desc:'관계의 다리를 놓았다.' },
  { id:'m_sacrifice',path:'martyr',   points:15, label:'자신을 희생했다',   icon:'🕊️', desc:'중요한 것을 포기하고 타인을 구했다.' },
  { id:'m_forgive',  path:'martyr',   points:10, label:'원수를 용서했다',   icon:'✨', desc:'복수 대신 용서를 선택했다.' },
  { id:'m_endure',   path:'martyr',   points:8,  label:'묵묵히 견뎠다',    icon:'💎', desc:'아무도 알아주지 않아도 버텼다.' },
];

export const STIGMA_TYPES = [
  { id:'cowardice',   label:'겁쟁이',     icon:'😨', desc:'위험 상황에서 도망쳤다.', penalty:{str:-4, fear:-6, wil:-4} },
  { id:'betrayal',    label:'배신',       icon:'🗡️', desc:'동료를 배신했다.', penalty:{trst:-8, cha:-5, rep:-6} },
  { id:'failure',     label:'실패 반복',  icon:'❌', desc:'같은 방식으로 또 실패했다.', penalty:{int:-4, per:-4, luk:-5} },
  { id:'greed',       label:'탐욕',       icon:'💰', desc:'탐욕 때문에 중요한 것을 잃었다.', penalty:{trst:-6, rep:-5, wil:-3} },
  { id:'arrogance',   label:'오만',       icon:'👑', desc:'자만으로 기회를 날렸다.', penalty:{per:-5, int:-4, cha:-4} },
  { id:'indecision',  label:'우유부단',   icon:'⚖️', desc:'결정을 못 해 상황을 악화시켰다.', penalty:{str:-3, ldr:-5, wil:-4} },
];

export const CORRUPTION_POWER_SKILLS = [
  // ── 1단계 스킬 (타락도 50+ 필요)
  {
    id: "cps_desire_exploit",
    name: "욕망 착취",
    icon: "👁️🔥",
    reqStage: 1, cost: 15,
    rarity: "uncommon",
    type: "active",
    targetable: false,
    desc: "상대의 가장 깊은 욕망을 읽어 완벽한 유혹의 말을 건넨다. 이번 설득·협상 판정 +30.",
    aiHint: "욕망 착취 발동! 캐릭터가 상대의 내면에서 가장 원하는 것을 꿰뚫어 보고 정확히 그 급소를 찌르는 말로 유혹한다. 상대가 저항하기 힘든 제안을 받아들이게 되는 과정을 묘사하라."
  },
  {
    id: "cps_shadow_whisper",
    name: "어둠의 속삭임",
    icon: "🌑🗣️",
    reqStage: 1, cost: 20,
    rarity: "uncommon",
    type: "active",
    targetable: false,
    desc: "마계의 목소리를 담아 속삭인다. 약한 존재는 즉시 공포 상태, 중간 강도 적도 WIL -15.",
    aiHint: "어둠의 속삭임 발동! 캐릭터의 목소리에 마계의 울림이 섞여 공기를 타고 퍼져나간다. 심약한 존재들은 자신도 모르게 무릎을 꿇고 싶어지며 공포에 사로잡힌다."
  },
  // ── 2단계 스킬 (타락도 120+ 필요)
  {
    id: "cps_contract_bind",
    name: "저주 계약",
    icon: "📜💀",
    reqStage: 2, cost: 30,
    rarity: "rare",
    type: "active",
    targetable: true,
    desc: "대상과 저주받은 계약을 체결. 계약 위반 시 대상 HP -50. 계약 내용은 자유롭게 설정.",
    aiHint: "저주 계약 발동! 검붉은 마법진이 공중에 떠오르고 계약의 문구가 불꽃으로 새겨진다. 대상이 서명하는 순간 그 영혼에 악마의 낙인이 깊이 새겨지며, 계약을 어기면 심장을 쥐어짜는 저주가 기다린다."
  },
  {
    id: "cps_nightmare_veil",
    name: "악몽의 장막",
    icon: "😱🌑",
    reqStage: 2, cost: 25,
    rarity: "rare",
    type: "active",
    targetable: false,
    desc: "전장에 악몽의 환각을 펼친다. 적 전체 판정 -20, 아군(악마 계열) 판정 +10. 3턴 지속.",
    aiHint: "악몽의 장막 발동! 현실과 악몽의 경계가 흐려진다. 적들의 눈에 가장 두려워하는 환상이 겹쳐 보이며 손발이 떨리기 시작한다. 악마 계열 존재들만 이 장막에 영향받지 않는다."
  },
  // ── 3단계 스킬 (타락도 220+ 필요)
  {
    id: "cps_corruption_burst",
    name: "부패 폭발",
    icon: "☠️💥",
    reqStage: 3, cost: 45,
    rarity: "rare",
    type: "active",
    targetable: false,
    desc: "몸속에 축적된 타락 에너지를 한꺼번에 방출. 범위 내 모든 적에게 강력한 부패 피해.",
    aiHint: "부패 폭발 발동! 악마의 몸에서 검보라빛 부패 에너지가 폭발적으로 분출된다. 반경 내 모든 것이 순간적으로 마계의 독기에 잠식당하며 살아있는 존재들의 생명력이 급속히 썩어들어간다."
  },
  {
    id: "cps_soul_drain",
    name: "영혼 흡수",
    icon: "💜⬆️",
    reqStage: 3, cost: 40,
    rarity: "rare",
    type: "active",
    targetable: true,
    desc: "대상의 영혼 에너지를 빨아들인다. 대상 스탯 -10, 자신 HP+20·MP+20 회복.",
    aiHint: "영혼 흡수 발동! 악마의 손이 대상의 가슴을 향해 뻗어나가고 보이지 않는 실처럼 영혼의 빛이 뽑혀 나온다. 대상은 눈에 띄게 창백해지고 힘이 빠지며, 악마는 생기가 넘쳐흐른다."
  },
  // ── 4단계 스킬 (타락도 350+ 필요)
  {
    id: "cps_original_sin",
    name: "원죄 발현",
    icon: "🔴🔱",
    reqStage: 4, cost: 60,
    rarity: "epic",
    type: "active",
    targetable: true,
    desc: "대상 내면의 원죄를 강제로 폭발시킨다. 선하고 신성한 존재에게 3배 피해. 저주 부여.",
    aiHint: "원죄 발현! 악마가 대상의 영혼 깊숙이 박혀있는 원죄의 씨앗을 손가락질 하자 그것이 불꽃처럼 타오른다. 신성한 존재일수록 더 극렬하게 반응하며 자신의 안에 있는 어두움에 공포를 느낀다."
  },
  {
    id: "cps_dark_dominion",
    name: "암흑 지배",
    icon: "👑🌑",
    reqStage: 4, cost: 70,
    rarity: "epic",
    type: "active",
    targetable: false,
    desc: "강력한 카리스마로 현장의 모든 약한 존재를 즉시 복종시킨다. 단계 50 이하 NPC 적용.",
    aiHint: "암흑 지배 발동! 악마의 눈동자가 심연처럼 깊어지고 압도적인 마왕의 위압감이 퍼져나간다. 의지가 약한 존재들은 자신도 모르게 고개를 숙이고 명령을 따르고 싶어지는 충동에 사로잡힌다."
  },
  // ── 5단계 스킬 (타락도 520+ 필요)
  {
    id: "cps_abyss_summon",
    name: "심연 소환진",
    icon: "🌑⛧",
    reqStage: 5, cost: 80,
    rarity: "legendary",
    type: "active",
    targetable: false,
    desc: "심연에서 강력한 악마 군단을 소환한다. 5단계 이상 악마 2체 + 하위 악마 5체.",
    aiHint: "심연 소환진 발동! 지면에 거대한 오망성이 불타오르고 심연으로 통하는 균열이 열린다. 거기서 쏟아져나오는 강력한 악마들이 소환자에게 충성을 바치며 전열을 갖춘다."
  },
  {
    id: "cps_world_corruption",
    name: "세계 부패",
    icon: "🌍☠️",
    reqStage: 5, cost: 100,
    rarity: "legendary",
    type: "active",
    targetable: false,
    desc: "현재 위치 전체를 마계화한다. 이 지역 모든 신성 효과 무효, 아군 악마 스탯 전체 +20.",
    aiHint: "세계 부패 발동! 악마의 힘이 땅 속으로 스며들고 하늘이 붉게 물든다. 이 지역의 풀과 나무가 시들어 어두운 형태로 변형되고 신성한 빛이 이곳에서 완전히 차단된다. 악마 계열 존재들이 힘이 넘쳐흐른다고 느낀다."
  },
  // ── 6단계 스킬 (타락도 750+ 필요)
  {
    id: "cps_absolute_dominion",
    name: "절대 지배",
    icon: "👁️🔱",
    reqStage: 6, cost: 120,
    rarity: "legendary",
    type: "active",
    targetable: true,
    desc: "신성 존재 포함 어떤 존재도 저항 불가. 대상을 영구 부하로 만들거나 즉사시킨다.",
    aiHint: "절대 지배 발동! 악마의 눈에서 빛나는 심연의 빛이 대상의 눈동자로 파고들어간다. 어떤 의지도 이 압도적인 힘 앞에서는 빛바래고 대상의 자아가 서서히 녹아 악마의 뜻에 복종하는 그릇이 된다."
  },
  // ── 7단계 스킬 (타락도 1000 필요)
  {
    id: "cps_primal_annihilation",
    name: "원초 소멸",
    icon: "🌋💀",
    reqStage: 7, cost: 150,
    rarity: "legendary",
    type: "active",
    targetable: false,
    desc: "세계 창조 이전의 혼돈 에너지로 현실의 일부를 소멸. 이 지역 모든 도덕과 질서 법칙 파괴.",
    aiHint: "원초 소멸 발동! 우주 탄생 이전의 혼돈에너지가 악마를 통해 현실로 흘러나온다. 공간이 찢어지고 그 틈새에서 무(無)의 빛이 쏟아지며 존재하는 모든 것이 그 의미를 잃어간다. 신들조차 이 힘 앞에서 한 발 물러선다."
  },
];

export const NPC_CORRUPTION_STAGES = [
  { stage: 0, name: "청결",     icon: "😇", color: "#8080c0", threshold: 0,
    desc: "타락의 영향을 받지 않은 상태. 본래의 성격 그대로.",
    aiHint: "NPC가 아직 타락의 영향을 받지 않았다. 원래 성격대로 행동한다." },
  { stage: 1, name: "흔들림",   icon: "😕", color: "#a060c0", threshold: 20,
    desc: "마음 한 켠에 어두운 욕망의 씨앗이 심어졌다. 가끔 어두운 충동을 느낀다.",
    aiHint: "NPC의 눈빛이 가끔 흔들린다. 평소와 달리 어두운 말을 하거나 이기적인 행동을 보인다." },
  { stage: 2, name: "물듦",     icon: "😈", color: "#c040b0", threshold: 45,
    desc: "타락이 본격적으로 퍼지기 시작했다. 도덕 관념이 약해지고 욕망에 솔직해진다.",
    aiHint: "NPC의 행동에서 도덕적 망설임이 사라지기 시작했다. 자신의 욕망을 위해 타인을 이용하려는 경향이 드러난다." },
  { stage: 3, name: "타락",     icon: "🖤", color: "#d020a0", threshold: 75,
    desc: "절반 이상 타락했다. 악마의 가치관을 자연스럽게 받아들이며 어두운 행동을 즐긴다.",
    aiHint: "NPC가 완전히 다른 사람처럼 변했다. 잔인하고 교활하며, 악마를 경외하고 따른다." },
  { stage: 4, name: "완전 타락", icon: "💀", color: "#ff0080", threshold: 100,
    desc: "완전히 타락했다. 이제 이 자는 악마의 충실한 부하이자 세계를 부패시키는 도구가 된다.",
    aiHint: "NPC가 완전히 타락해 악마의 충실한 추종자가 되었다. 자발적으로 어둠의 뜻을 따르고 다른 이들도 타락시키려 한다." },
];

export const NPC_CORRUPT_METHODS = [
  { id: "whisper",    name: "어둠 속삭임",   icon: "🌑", cost: 10, power: 15,
    reqStage: 1, desc: "타락의 목소리로 대상의 마음에 욕망의 씨앗을 심는다.",
    aiHint: "악마가 부드럽게 속삭이자 대상의 눈빛이 미묘하게 흔들린다. 자신도 모르게 마음 한 켠에 어두운 생각이 자리잡기 시작한다." },
  { id: "tempt",      name: "유혹의 제안",   icon: "🍎", cost: 20, power: 20,
    reqStage: 1, desc: "대상이 가장 원하는 것을 제시하며 어두운 거래를 유도한다.",
    aiHint: "악마가 대상이 절대 거절할 수 없는 제안을 내민다. 대상은 갈등하지만 욕망이 이성을 서서히 앞서기 시작한다." },
  { id: "brand",      name: "타락의 낙인",   icon: "🔥", cost: 30, power: 30,
    reqStage: 2, desc: "악마의 문장을 대상에게 새겨 타락 속도를 크게 가속시킨다.",
    aiHint: "악마의 손이 대상의 피부에 닿자 보이지 않는 낙인이 새겨진다. 이후 대상의 타락이 급격히 가속된다." },
  { id: "dream",      name: "악몽 주입",     icon: "😱", cost: 25, power: 25,
    reqStage: 2, desc: "잠든 대상에게 악몽을 주입해 의지를 갉아먹는다.",
    aiHint: "악마가 잠든 대상의 꿈속에 침투해 공포와 욕망으로 가득한 악몽을 심어 넣는다. 아침에 일어난 대상의 눈에 어두운 빛이 감돈다." },
  { id: "ritual",     name: "타락 의식",     icon: "⛧",  cost: 50, power: 45,
    reqStage: 3, desc: "강력한 마계 의식으로 대상의 영혼 자체를 부패시킨다.",
    aiHint: "악마가 주도하는 의식에서 붉은 에너지가 대상의 몸속으로 흘러들어간다. 대상이 비명을 지르지만 점차 황홀경에 빠지며 어둠을 받아들인다." },
  { id: "soul_eat",   name: "영혼 잠식",     icon: "💜", cost: 70, power: 60,
    reqStage: 4, desc: "대상의 영혼 일부를 직접 먹어 내면에서 타락시킨다. 즉각 50 이상 타락 부여.",
    aiHint: "악마의 손이 대상의 가슴을 파고들어 빛나는 영혼의 조각을 꺼내어 먹는다. 대상의 눈에서 순수함이 사라지고 심연 같은 공허함이 자리잡는다." },
];

export const THRALL_RANK_TABLES = {
  // 🩸 뱀파이어 — 혈통 귀족 계층
  '혈종': [
    '혈종',       // 0 갓 권속화
    '혈족',       // 1 혈통에 익숙해짐
    '혈예',       // 2 전투 능력 개화
    '혈기사',     // 3 전장에서 두각
    '혈남작',     // 4 지역 영향력
    '혈자작',     // 5 소규모 세력 지휘
    '혈백작',     // 6 독립 영역 보유
    '혈후작',     // 7 광역 지배력
    '혈공작',     // 8 군주에 버금가는 힘
    '혈황',       // 9 필적하는 존재. 반란 위험
  ],
  // 💀 네크로맨서 — 영혼 위계
  '결박령': [
    '잔향',       // 0
    '유령',       // 1
    '결박령',     // 2
    '사령병',     // 3
    '사령 기사',  // 4
    '사령 장군',  // 5
    '망령 군주',  // 6
    '유령 왕',    // 7
    '사신 공작',  // 8
    '불사 황제',  // 9
  ],
  // 📜 악마족 — 계약 위계
  '계약 하수인': [
    '계약자',     // 0
    '악마 종',    // 1
    '소악마',     // 2
    '악마 병사',  // 3
    '악마 기사',  // 4
    '지옥 대장',  // 5
    '계약 군주',  // 6
    '지옥 공작',  // 7
    '마계 왕',    // 8
    '심연 황제',  // 9
  ],
  // ✨ 세레스티얼 — 서약 위계
  '서약자': [
    '서약자',       // 0
    '빛의 종자',    // 1
    '수호 견습',    // 2
    '성약 기사',    // 3
    '빛의 전사',    // 4
    '성광 수호자',  // 5
    '천계 대리인',  // 6
    '빛의 집행자',  // 7
    '성약 군주',    // 8
    '천계 화신',    // 9
  ],
  // 🔮 소환사 — 각인 위계
  '각인 종자': [
    '각인체',     // 0
    '마력 종자',  // 1
    '소환 병사',  // 2
    '각인 기사',  // 3
    '소환 장군',  // 4
    '마력 군주',  // 5
    '각인 공작',  // 6
    '소환 왕',    // 7
    '각인 황제',  // 8
    '원초 소환체',// 9
  ],
  // 🌑 다크링 — 그림자 위계
  '그림자 속박': [
    '그림자',     // 0
    '어둠 종',    // 1
    '공허 병사',  // 2
    '공허 기사',  // 3
    '어둠 장군',  // 4
    '심연 대장',  // 5
    '공허 군주',  // 6
    '심연 공작',  // 7
    '어둠 왕',    // 8
    '공허 황제',  // 9
  ],
};

export const THRALL_RANK_DEFAULT = [
  '종자','권속','상급 권속','권속 기사','권속 장군',
  '권속 군주','권속 공작','권속 왕','권속 황제','필적하는 자',
];

export const THRALL_RANKS = [
  { rankIdx:0, threshold:0,
    pts:0, loyaltyReq:0, lordBpReq:0, domainReq:false,
    baseLoyalty:60, loyaltyDecayPerTurn:2,   // 초기: 불안정, 빠른 감소
    bonusMult:1.0,
    desc:'방금 귀속됐다. 유대가 없어 이탈 가능성이 가장 높다. 명령에만 복종.',
    triggerCond:'첫 명령 이행, 사소한 심부름 완료' },
  { rankIdx:1, threshold:15,
    pts:15, loyaltyReq:0, lordBpReq:0, domainReq:false,
    baseLoyalty:65, loyaltyDecayPerTurn:2,
    bonusMult:1.2,
    desc:'기본 임무를 소화한다. 아직 유대는 얕다.',
    triggerCond:'단독 정찰, 적 하나 처치, 간단한 정보 수집' },
  { rankIdx:2, threshold:35,
    pts:35, loyaltyReq:0, lordBpReq:0, domainReq:false,
    baseLoyalty:70, loyaltyDecayPerTurn:2,
    bonusMult:1.5,
    desc:'전투 감각이 열렸다. 조금씩 군주를 신뢰하기 시작한다.',
    triggerCond:'전투 지원, 적 부하 무력화, 소규모 교전 승리' },
  { rankIdx:3, threshold:65,
    pts:65, loyaltyReq:40, lordBpReq:0, domainReq:false,
    baseLoyalty:72, loyaltyDecayPerTurn:1.5,
    bonusMult:1.9,
    desc:'이름이 알려지기 시작했다. 충성도 40+ 필요 — 신뢰 없이 권한을 줄 수 없다.',
    triggerCond:'중요 전투 기여, 퀘스트 단독 해결, 지역 NPC 제압 (충성도 40+ 필수)' },
  { rankIdx:4, threshold:110,
    pts:110, loyaltyReq:50, lordBpReq:80, domainReq:false,
    baseLoyalty:75, loyaltyDecayPerTurn:1.5,
    bonusMult:2.3,
    desc:'지역 영향력이 생겼다. 충성 50+ & 군주 혈통포인트 80+ 필요.',
    triggerCond:'지휘관 처치, 도시 장악 기여, 복잡한 임무 완료 (충성도 50+ 필수)' },
  { rankIdx:5, threshold:170,
    pts:170, loyaltyReq:55, lordBpReq:150, domainReq:false,
    baseLoyalty:78, loyaltyDecayPerTurn:1.2,
    bonusMult:2.8,
    desc:'소세력 독립 운영. 군주 위기에 결정적 역할. 충성 55+ & 혈통포인트 150+ 필요.',
    triggerCond:'군주 위기 구출, 영토 방어, 중요 동맹 체결 (충성도 55+ 필수)' },
  { rankIdx:6, threshold:250,
    pts:250, loyaltyReq:60, lordBpReq:280, domainReq:true,
    baseLoyalty:80, loyaltyDecayPerTurn:1.0,
    bonusMult:3.4,
    desc:'독자 영역 보유. 충성 60+ & 혈통포인트 280+ & 파견 도시 영향력 40+ 필요.',
    triggerCond:'독립 영역 확보, 다른 권속 통솔, 전략 임무 완료 (영역+충성 필수)' },
  { rankIdx:7, threshold:360,
    pts:360, loyaltyReq:65, lordBpReq:450, domainReq:true,
    baseLoyalty:83, loyaltyDecayPerTurn:0.8,
    bonusMult:4.0,
    desc:'전설적 존재. 군주와 나란히 언급된다. 깊은 유대가 형성돼 자연 감소가 줄어든다.',
    triggerCond:'전설적 업적, 강적 단독 처치, 역사적 사건 주도 (충성도 65+ 필수)' },
  { rankIdx:8, threshold:500,
    pts:500, loyaltyReq:70, lordBpReq:650, domainReq:true,
    baseLoyalty:87, loyaltyDecayPerTurn:0.5,
    bonusMult:4.8,
    desc:'군주와 대등한 세력. 수백 턴의 유대가 쌓인 존재. 이탈은 군주의 큰 배신이 있을 때만.',
    triggerCond:'세계적 사건 해결, 군주 대리 외교, 국가 수준 위협 처리 (충성도 70+ 필수)' },
  { rankIdx:9, threshold:680,
    pts:680, loyaltyReq:75, lordBpReq:900, domainReq:true,
    baseLoyalty:100, loyaltyDecayPerTurn:0,  // 9단계 충성도 100 고정 — 감소 없음
    bonusMult:6.0,
    desc:'필적하는 존재. 충성도가 100으로 고정된다. 수백 턴의 유대가 완성된 상태. 군주의 극단적 배신 외에는 절대 이탈 없음.',
    triggerCond:'최고 단계 — 충성도 100 고정. 반란은 불가. 충성도 75+ & 혈통포인트 900+ 필수' },
];

export const DOMINATION_METHODS = {
  vampire:    { name:'흡혈 권속화', icon:'🩸', desc:'기절·항복한 대상에게 피를 나눠 권속으로 만든다. 성공 시 대상은 영구적으로 혈통에 귀속된다.',      cost:30, thrallType:'혈종' },
  necromancer:{ name:'영혼 결박',   icon:'💀', desc:'사망한 NPC의 영혼을 결박해 종속시킨다. 시체가 있어야 하며 의지가 없는 복종 상태.',             cost:20, thrallType:'결박령' },
  demon:      { name:'영혼 계약',   icon:'📜', desc:'타락도 75+ NPC와 계약을 맺어 영혼을 담보로 복종을 강요한다. 대상의 욕망을 이용한다.',          cost:50, thrallType:'계약 하수인' },
  celestial:  { name:'신성 서약',   icon:'✨', desc:'세레스티얼 종족 또는 신앙 80+ 성직자가 빛의 힘으로 대상에게 신성한 맹세를 새긴다. 서약을 어기면 신성 화상을 입는 절대 복종. 세레스티얼은 신앙 수치와 무관하게 항시 사용 가능.',              cost:40, thrallType:'서약자' },
  summoner:   { name:'강령 각인',   icon:'🔮', desc:'마법력 60+로 대상에게 마법 각인을 새겨 의지를 종속시킨다.',                                   cost:35, thrallType:'각인 종자' },
  darkling:   { name:'어둠 속박',   icon:'🌑', desc:'다크링의 어둠 마법으로 대상의 그림자를 잡아 영구 속박한다.',                                  cost:25, thrallType:'그림자 속박' },
};

export const THRALL_BUILDINGS = {
  blood_altar:    { id:'blood_altar',    name:'흡혈 제단',    icon:'🩸⛧', cost:400, upkeep:10, maxLevel:3,
    effect:(lv)=>({ bloodPointGain: lv*5, thrallLoyaltyBonus: lv*10 }),
    desc:'매 턴 혈통 포인트를 생성한다. 권속들의 충성도를 강화한다.',
    aiHint:(lv)=>`${lv}단계 흡혈 제단에서 붉은 기운이 피어오른다. 권속들이 이 앞에서 경배를 드린다.` },
  blood_prison:   { id:'blood_prison',   name:'지하 감금소',  icon:'⛓️',  cost:300, upkeep:8,  maxLevel:2,
    effect:(lv)=>({ thrallCapBonus: lv*5, captureSuccessBonus: lv*15 }),
    desc:'포로를 가두고 권속화하는 시설. 권속 수용 한도 증가.',
    aiHint:(lv)=>`${lv}단계 지하 감금소. 어둠 속에서 사슬 소리가 들린다. 권속이 될 자들이 기다린다.` },
  thrall_barracks:{ id:'thrall_barracks',name:'권속 병영',    icon:'⚔️💀', cost:500, upkeep:12, maxLevel:3,
    effect:(lv)=>({ thrallRankUpSpeed: lv*0.2, combatBonus: lv*8 }),
    desc:'권속들을 훈련시켜 더 빠르게 등급을 올린다.',
    aiHint:(lv)=>`${lv}단계 권속 병영. 혈기사들이 새벽부터 날이 설 때까지 훈련한다.` },
  night_sanctum:  { id:'night_sanctum',  name:'밤의 성소',    icon:'🌙🏰', cost:800, upkeep:20, maxLevel:2,
    effect:(lv)=>({ nightStatBonus: lv*10, sunProtection: lv*50 }),
    desc:'낮에도 햇빛을 차단한다. 야간 능력치 상시 발동.',
    aiHint:(lv)=>`${lv}단계 밤의 성소. 영원한 어둠이 깔려 뱀파이어가 한낮에도 자유롭게 활동한다.` },
  blood_tower:    { id:'blood_tower',    name:'혈통 탑',       icon:'🗼🩸', cost:1000, upkeep:25, maxLevel:1,
    effect:(lv)=>({ domainRange: lv*2, thrallSignalRange: lv*3 }),
    desc:'주변 도시에 혈통 영향력을 방사한다. 범위 내 모든 권속과 텔레파시 연결.',
    aiHint:(lv)=>`혈통 탑의 첨탑에서 붉은 빛이 흘러내린다. 반경 수 킬로미터의 권속들이 군주의 목소리를 듣는다.` },
};
