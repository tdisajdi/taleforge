// 🧭 63번 섹션 후속 — "핸들러 없는 상호작용 전수 복구"
// data/042+data/052에 정의된 action 문자열 131개 중 83개가 misc/053의
// doInteraction() actions 맵에 핸들러가 전혀 없어 클릭하면 "상호작용
// 준비 중..." 토스트만 뜨던 완전히 죽은 버튼이었다(엔드게임 클라이맥스
// 트리거 다수 포함). 83개를 전부 개별 bespoke 함수로 손으로 작성하는
// 대신, 각 상호작용의 기존 desc 텍스트가 이미 명시한 "어떤 스탯으로
// 판정하는지/성공하면 뭘 주는지"를 그대로 데이터로 옮기고, misc/335의
// 범용 판정기 하나로 전부 해석되게 한다 — "뭐든 할 수 있는 생태계"
// 철학에 맞게 서사(AI) 의존 없이 버튼 클릭만으로 즉시 결과가 나온다.
//
// 스키마: { s:[스탯키...] (판정에 쓰는 스탯, 생략 시 무조건 성공),
//          thr: 판정 임계값(생략 시 s.length로 자동: 1→55, 2→65, 3→75),
//          r: 보상 스펙, fhp: 실패 시 HP 감소(생략 시 0),
//          restoreToo: true면 성공 시 HP/MP도 완전 회복(celestialPray/manaBathe) }
// 보상 스펙(r):
//  {t:'item', tier:'quest'|'mainQuest'|'secretEnding'} — rollEventReward 재사용
//  {t:'stat', mods:{키:값,...}, once:true} — 영구 스탯(once면 1회성 가드)
//  {t:'gold', min, max}
//  {t:'restore'} — HP/MP 완전 회복
//  {t:'rep', amount}
//  {t:'ending'} — 기존 checkTrueEndingCondition()을 그대로 호출(새 엔딩
//  분기를 만들지 않고 이미 있는 진엔딩 판정 로직에 그대로 위임)
//
// [의도적 설계 결정] 봉인석 관련 상호작용(sealShard/sealReunite/
// purifySealShard/sealReinforce/sealMap 등)은 실제 진엔딩 판정이
// 쓰는 loadSealRestore()/worldDB.seals 카운터를 직접 건드리지 않는다
// — 그 시스템은 NPC 신뢰도 기반의 정교한 별도 메커니즘(ui/155)이라,
// 여기서 똑같은 카운터를 건드리면 기존에 공들여 설계된 진엔딩 조건
// 판정과 충돌할 위험이 크다. 대신 플레이버에 맞는 보상(아이템/명성)만
// 지급하고, watcherConfront/loopBreak/sealReunite 3개만 예외적으로
// 기존 checkTrueEndingCondition()을 그대로 호출해 "이미 조건을 채웠다면
// 지금 바로 확인", "아직 부족하면 기존 시스템이 이미 하던 안내 토스트"
// 가 뜨게 한다 — 새 엔딩 로직을 지어내지 않고 기존 걸 그대로 연결.
export const DEAD_INTERACTION_DEFS = {
  // ── 변신/오인된 액션 (이름과 설명이 전혀 다른 샘플) ──────────────
  hireHacker: { r:{ t:'stat', mods:{ str:8, agi:8 }, once:false } }, // "용병 동료 고용" — 전투 훈련 수혜로 치환(완전한 동료 합류 시스템 연동은 범위 밖)

  // ── 탐험/채집형(여러 장소가 공유하는 범용 액션) ──────────────────
  caveExplore:   { s:['wil','end'], r:{ t:'item', tier:'quest' }, fhp:15 },
  mineCrystal:   { s:['str','per'], r:{ t:'item', tier:'quest' }, fhp:10 },
  senseLava:     { s:['per'],       r:{ t:'item', tier:'quest' } },
  navigateMaze:  { s:['agi','per','int'], r:{ t:'item', tier:'quest' }, fhp:20 },

  // ── 천계(S등급) ────────────────────────────────────────────────
  celestialPray:    { restoreToo:true, r:{ t:'stat', mods:{ fath:5 }, once:true } },
  celestialTrial:   { s:['fath'], thr:65, r:{ t:'item', tier:'mainQuest' }, fhp:20 },
  divineBlessing:   { s:['fath'], thr:60, r:{ t:'stat', mods:{ str:5,agi:5,end:5,int:5,wil:5,per:5,luk:5,cha:5,mgc:5,fath:5 }, once:true } },
  celestialArchive: { s:['int'],  r:{ t:'item', tier:'mainQuest' } },
  angelSummon:      { r:{ t:'stat', mods:{ wil:10, fath:10 }, once:true } },
  divineJudgment:   { s:['krma'], thr:60, r:{ t:'item', tier:'secretEnding' }, fhp:25 },
  celestialMission: { r:{ t:'item', tier:'mainQuest' } },
  fallenAngelBoss:  { s:['str','mgc','wil'], thr:75, r:{ t:'item', tier:'secretEnding' }, fhp:35 },

  // ── 마계/타락 ────────────────────────────────────────────────────
  infernalPact:        { r:{ t:'stat', mods:{ str:12, mgc:12, krma:-10 } } },
  infernalTrial:       { s:['wil','end'], thr:65, r:{ t:'item', tier:'mainQuest' }, fhp:25 },
  demonLordAudience:   { r:{ t:'stat', mods:{ fear:15, ldr:10 }, once:true }, fhp:0 },
  darkArchive:         { s:['int'], r:{ t:'item', tier:'mainQuest' } },
  chaosCovenantSign:   { s:['wil'], thr:70, r:{ t:'stat', mods:{ str:15,agi:15,mgc:15,wil:15,luk:-10 }, once:true }, fhp:30 },
  overthrowDemonLord:  { s:['str','mgc','wil'], thr:80, r:{ t:'item', tier:'secretEnding' }, fhp:40 },
  freeInfernalPrisoner:{ r:{ t:'rep', amount:15 } },
  infernalDungeonBoss: { s:['str','end'], thr:75, r:{ t:'item', tier:'secretEnding' }, fhp:35 },
  demonPact:           { r:{ t:'stat', mods:{ str:10, mgc:10, krma:-8 } } },

  // ── 세계수/봉인석 (실제 진엔딩 카운터는 건드리지 않음, 위 주석 참고) ──
  worldTreeMemory:   { s:['wil','fath'], thr:65, r:{ t:'item', tier:'mainQuest' } },
  purifySealShard:   { s:['mgc','fath'], thr:65, r:{ t:'rep', amount:20 } },
  guardianSpirit:    { s:['fath','spk'], thr:65, r:{ t:'rep', amount:15 } },
  watcherConfront:   { s:['wil','int','fath'], thr:75, r:{ t:'ending' } },
  loopBreak:         { s:['wil','mgc'], thr:70, r:{ t:'ending' } },
  watcherBargain:    { s:['int','neg'], thr:65, r:{ t:'item', tier:'mainQuest' } },
  sealReunite:       { r:{ t:'ending' } },
  nexusMemory:       { s:['wil','int'], thr:65, r:{ t:'item', tier:'secretEnding' } },
  guardianFinal:     { s:['str','mgc','wil'], thr:80, r:{ t:'item', tier:'secretEnding' }, fhp:40 },
  sealShard:         { s:['int','mgc'], r:{ t:'item', tier:'quest' } },
  sealMap:           { s:['agi','int'], r:{ t:'item', tier:'quest' }, fhp:15 },
  sealReinforce:     { s:['mgc','fath'], thr:65, r:{ t:'rep', amount:20 } },
  sealCrack:         { s:['mgc','fath'], r:{ t:'item', tier:'mainQuest' } },
  abyssContract:     { s:['wil'], thr:70, r:{ t:'stat', mods:{ mgc:20, wil:-10 }, once:true }, fhp:30 },

  // ── 수정/광산/기계 지역 ─────────────────────────────────────────
  manaBathe:        { restoreToo:true, r:{ t:'stat', mods:{ mgc:5 }, once:true } },
  readCrystalMap:   { s:['int'], r:{ t:'item', tier:'quest' } },
  machineGodInterface: { s:['int','mgc'], thr:65, r:{ t:'rep', amount:20 } },
  overrideCore:     { s:['int'], thr:60, r:{ t:'item', tier:'mainQuest' } },
  powerSourceCut:   { s:['mgc','wil'], thr:65, r:{ t:'rep', amount:15 } },
  deepMine:         { s:['str','end'], r:{ t:'item', tier:'mainQuest' } },
  dwarvenLore:      { s:['int'], r:{ t:'stat', mods:{ str:3, end:3 } } },
  minecartRide:     { s:['agi'], r:{ t:'item', tier:'quest' }, fhp:15 },
  bypassGolem:      { s:['agi','disg'], r:{ t:'item', tier:'quest' }, fhp:20 },
  giantPuzzle:       { s:['int','str'], r:{ t:'item', tier:'quest' } },
  giantRelicHunt:    { s:['luk'], thr:45, r:{ t:'item', tier:'mainQuest' } },
  sitGiantThrone:    { r:{ t:'stat', mods:{ fear:10, ldr:5 }, once:true } },

  // ── 묘지/유령/저택 ───────────────────────────────────────────────
  robTomb:         { s:['luk','agi'], r:{ t:'item', tier:'mainQuest' }, fhp:20 },
  talkGhostKing:   { s:['spk','neg'], r:{ t:'item', tier:'mainQuest' } },
  undeadRitual:    { s:['fath'], r:{ t:'item', tier:'quest' }, fhp:15 },
  ghostLore:       { s:['per','cha'], r:{ t:'stat', mods:{ wil:5, fath:5 } } },
  exorcism:        { s:['fath','mgc'], r:{ t:'item', tier:'mainQuest' }, fhp:20 },
  findHiddenRoom:  { s:['per'], r:{ t:'gold', min:200, max:500 } },
  ghostDialog:     { s:['per','fath'], r:{ t:'rep', amount:15 } },
  massGrave:       { s:['int'], r:{ t:'rep', amount:10 } },
  ghostKnight:     { s:['str'], thr:60, r:{ t:'item', tier:'mainQuest' }, fhp:25 },

  // ── 화염/번개/하늘 ───────────────────────────────────────────────
  lavaForge:    { r:{ t:'stat', mods:{ str:5, crit:5 }, once:true } },
  talkSalamander: { s:['cha','neg'], r:{ t:'stat', mods:{ mgc:8 } } },
  rideWindCurrent: { s:['agi'], r:{ t:'gold', min:30, max:100 } },
  talkSkyGuardian: { s:['wil'], r:{ t:'item', tier:'mainQuest' } },
  cloudForge:   { r:{ t:'stat', mods:{ agi:5, crit:5 }, once:true } },

  // ── 심해/요정/숲 ─────────────────────────────────────────────────
  divDeep:        { s:['end'], r:{ t:'item', tier:'quest' }, fhp:15 },
  talkSeaSerpent: { s:['fath','spk'], r:{ t:'item', tier:'mainQuest' } },
  seaAltar:       { r:{ t:'stat', mods:{ agi:5, end:5 }, once:true } },
  decipherIce:    { s:['int'], r:{ t:'item', tier:'quest' } },
  thawTreasure:   { s:['mgc','str'], r:{ t:'item', tier:'mainQuest' } },
  fairyDeal:      { s:['luk'], thr:50, r:{ t:'gold', min:50, max:300 }, fhp:10 },
  talkForestSpirit: { s:['fath'], r:{ t:'item', tier:'quest' } },
  breakHex:       { s:['mgc'], r:{ t:'stat', mods:{ luk:5 } } },
  shadowBargain:  { s:['neg'], r:{ t:'item', tier:'mainQuest' } },
  lightBeacon:    { r:{ t:'rep', amount:10 } },

  // ── 드래곤/연금술/도서관 ─────────────────────────────────────────
  talkDragon:     { s:['int','cha'], thr:75, r:{ t:'item', tier:'secretEnding' } },
  dragonPact:     { s:['wil','mgc'], thr:70, r:{ t:'stat', mods:{ mgc:15 }, once:true } },
  doExperiment:   { s:['int'], r:{ t:'item', tier:'quest' } },
  studyMutant:    { s:['int','per'], r:{ t:'rep', amount:15 } },
  recoverFormula: { s:['int'], r:{ t:'item', tier:'quest' } },
  findContract:   { s:['int','disg'], thr:70, r:{ t:'item', tier:'secretEnding' } },
  negotiateSecret:{ s:['spk','neg'], r:{ t:'rep', amount:15 } },
  loopTruth:      { s:['int','wil'], r:{ t:'item', tier:'mainQuest' } },
  arcanuAI:       { s:['mgc','int'], r:{ t:'rep', amount:15 } },
  ancientGodVoice:{ s:['wil','fath'], thr:75, r:{ t:'item', tier:'secretEnding' }, fhp:30 },
  dimensionScout: { s:['per','int'], r:{ t:'item', tier:'quest' } },
};
window.DEAD_INTERACTION_DEFS = DEAD_INTERACTION_DEFS;
