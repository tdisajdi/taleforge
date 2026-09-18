// [15] 인벤토리 addItem / removeItem — data
// Pure data split out of items/218-15-인벤토리-addItem-removeItem.js (see generate.js).

export const ITEM_RARITY = { common:'일반', uncommon:'고급', rare:'희귀', epic:'영웅', legendary:'전설' };

export const SOUL_TAGS = {
  combat_human:   { label:'대인전',   icon:'⚔️', desc:'인간형 적과의 전투', usesEnemyLevel:true },
  combat_monster: { label:'몬스터전', icon:'🐺', desc:'몬스터/괴물과의 전투', usesEnemyLevel:true },
  combat_undead:  { label:'대언데드전', icon:'💀', desc:'언데드와의 전투', usesEnemyLevel:true },
  dialogue:       { label:'중재',     icon:'🗣️', desc:'대화·협상으로 갈등을 해결', usesEnemyLevel:false },
  deception:      { label:'기만',     icon:'🎭', desc:'속임수·거짓으로 상황을 풀어냄', usesEnemyLevel:false },
  exploration:    { label:'탐험',     icon:'🧭', desc:'위험을 무릅쓴 탐험·발견', usesEnemyLevel:false },
  protection:     { label:'수호',     icon:'🛡️', desc:'타인을 지키기 위한 행동', usesEnemyLevel:false },
};

export const SOUL_LEVEL_REQUIREMENTS = [
  null, // index 0 미사용
  { needCount:15,  minDifficulty:10  },  // 1→2: Lv.10+ 15회
  { needCount:25,  minDifficulty:25 },  // 2→3: Lv.25+ 25회
  { needCount:40,  minDifficulty:40 },  // 3→4: Lv.40+ 40회
  { needCount:60,  minDifficulty:55 },  // 4→5: Lv.55+ 60회 (분기 직전)
  { needCount:90,  minDifficulty:65 },  // 5→6: Lv.65+ 90회
  { needCount:130, minDifficulty:75 },  // 6→7: Lv.75+ 130회
  { needCount:180, minDifficulty:85 },  // 7→8: Lv.85+ 180회
  { needCount:250, minDifficulty:95 },  // 8→9: Lv.95+ 250회 (장성/대주교급 이상)
  { needCount:350, minDifficulty:105 }, // 9→10: Lv.105+ 350회 (황제/교황급 — 엔드게임 보스 체급만)
];

export const SOUL_PURITY_STAGES = [
  null, // index 0 미사용
  { stage:1, name:'여린 넋',   mult:1.0, needFuse:0 },                    // 기본 상태
  { stage:2, name:'엉긴 넋',   mult:1.6, needFuse:3 },   // 여린 넋 3개
  { stage:3, name:'벼린 넋',   mult:2.3, needFuse:3 },   // 엉긴 넋 3개 (원본 9개분)
  { stage:4, name:'다진 넋',   mult:3.2, needFuse:3 },   // 벼린 넋 3개 (원본 27개분)
  { stage:5, name:'굳은 넋',   mult:4.4, needFuse:3 },   // 다진 넋 3개 (원본 81개분)
  { stage:6, name:'사무친 넋', mult:6.0, needFuse:3 },   // 굳은 넋 3개 (원본 243개분)
  { stage:7, name:'태초의 넋', mult:8.5, needFuse:3 },   // 사무친 넋 3개 (원본 729개분, 최종)
];

export const SOUL_AUTO_TAG_KEYWORDS = {
  combat_human:   [/병사|기사|용병|도적|암살자|사람.*(처치|쓰러|베었|죽였)/],
  combat_monster: [/몬스터|괴물|마물|짐승|늑대|오크(?!.*족장)|고블린/],
  combat_undead:  [/언데드|좀비|스켈레톤|구울|망자|리치/],
  dialogue:       [/협상|설득|대화로|타협|중재했|화해/],
  deception:      [/속였|거짓말|기만|연기했|위장했|함정을 팠/],
  exploration:    [/발견했|탐험|숨겨진.*찾|비밀.*발견/],
  protection:     [/지켰|막아섰|대신 맞|보호했/],
};
