// 71~100번 환생 누적 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { APOCALYPSE_STAGES, BUTTERFLY_STAGES, CIRCUS_ACTS, CREDITOR_NAMES, CURSED_RELIC_TYPES, DARK_ECHO_RUMORS, DARK_FEAR_LEVELS, DEJAVU_TRIGGERS, DIMENSION_UNLOCK_STAGES, ELEMENT_PAIRS, EMOTION_ECHOES, GRIEF_STAGES, HIGHLIGHT_TYPES, INSCRIPTION_LINES, MUTATION_DEFS, PET_TYPES, REINCARNATION_RANKS, SAKURA_CONDITIONS, SEALED_MEMORY_TYPES, SOUL_CRYSTAL_CRAFTS, TEMPLE_LEVELS, TRAUMA_DEFS80, WISH_OPTIONS } from '../data/019-71100번-환생-누적-시스템.js';
import { lsDel, lsGet, lsSet } from '../utils.js';
import { loadCycleCount } from './014-환생-누적-시스템-110번.js';

export const PAST_LETTER_KEY  = "taleforge-past-letter";

export const loadPastLetters  = () => { const r = lsGet(PAST_LETTER_KEY); return r ? JSON.parse(r) : []; };

export const savePastLetters  = (l) => lsSet(PAST_LETTER_KEY, JSON.stringify(l));


export const recordPastLetter = (message, characterName, scenario, karmaScore) => {
  if (!message) return;
  const letters = loadPastLetters();
  const tone = karmaScore >= 80 ? "절박한" : karmaScore >= 60 ? "경고하는" : karmaScore <= 30 ? "따뜻한" : "담담한";
  letters.push({ message: message.slice(0, 200), characterName: characterName || "전생의 나", scenario: scenario || "", tone, writtenAt: new Date().toISOString() });
  // 개수 제한 없음 (전체 저장)
  savePastLetters(letters);
};

export const getLatestLetter = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const letters = loadPastLetters();
  return letters.length > 0 ? letters[letters.length - 1] : null;
};

export const HIGHLIGHT_REEL_KEY  = "taleforge-highlight-reel";

export const loadHighlightReel   = () => { const r = lsGet(HIGHLIGHT_REEL_KEY); return r ? JSON.parse(r) : []; };

export const saveHighlightReel   = (h) => lsSet(HIGHLIGHT_REEL_KEY, JSON.stringify(h));


export const addHighlightReel = (type, characterName, scenario) => {
  if (!type) return;
  const reel = loadHighlightReel();
  const def = HIGHLIGHT_TYPES.find(h => h.id === type) || HIGHLIGHT_TYPES[reel.length % HIGHLIGHT_TYPES.length];
  reel.push({ ...def, characterName: characterName || "전생의 나", scenario: scenario || "", addedAt: new Date().toISOString() });
  // 개수 제한 없음 (전체 저장)
  saveHighlightReel(reel);
};

export const getHighlightReel = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadHighlightReel();
};

export const BUTTERFLY_INDEX_KEY  = "taleforge-butterfly-index";

export const loadButterflyIndex   = () => { const r = lsGet(BUTTERFLY_INDEX_KEY); return r ? JSON.parse(r) : { index: 0, chaosMode: false, impacts: [] }; };

export const saveButterflyIndex   = (b) => lsSet(BUTTERFLY_INDEX_KEY, JSON.stringify(b));


export const growButterflyIndex = (impactScore) => {
  const bi = loadButterflyIndex();
  bi.index = Math.min(100, (bi.index || 0) + (impactScore || 5));
  bi.chaosMode = bi.index >= 81;
  const stage = BUTTERFLY_STAGES.find(s => bi.index >= s.range[0] && bi.index <= s.range[1]) || BUTTERFLY_STAGES[4];
  bi.impacts = bi.impacts || [];
  bi.impacts.push({ score: impactScore, total: bi.index, recordedAt: new Date().toISOString() });
  // 개수 제한 없음 (전체 저장)
  saveButterflyIndex(bi);
  return { ...bi, stageData: stage };
};

export const getButterflyIndex = () => {
  const bi = loadButterflyIndex();
  const stage = BUTTERFLY_STAGES.find(s => (bi.index||0) >= s.range[0] && (bi.index||0) <= s.range[1]) || BUTTERFLY_STAGES[0];
  return { ...bi, stageData: stage };
};

export const INSCRIPTION_KEY  = "taleforge-inscription";

export const loadInscription  = () => { const r = lsGet(INSCRIPTION_KEY); return r ? JSON.parse(r) : { lines: [], completed: false }; };

export const saveInscription  = (i) => lsSet(INSCRIPTION_KEY, JSON.stringify(i));


export const decipherInscriptionLine = (cycle) => {
  const ins = loadInscription();
  const lineIdx = (cycle - 1) % INSCRIPTION_LINES.length;
  const line = INSCRIPTION_LINES[lineIdx];
  if (!ins.lines.find(l => l.line === line.line)) {
    ins.lines.push({ ...line, decipheredAt: new Date().toISOString(), cycle });
    ins.completed = ins.lines.length >= INSCRIPTION_LINES.length;
    saveInscription(ins);
  }
  return { line, isNew: true, completed: ins.completed };
};

export const getInscriptionStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const ins = loadInscription();
  return { ...ins, total: INSCRIPTION_LINES.length, progress: ins.lines.length };
};

export const REINCARNATION_RANK_KEY  = "taleforge-reincarnation-rank";

export const loadRankData            = () => { const r = lsGet(REINCARNATION_RANK_KEY); return r ? JSON.parse(r) : { rank: 0, totalScore: 0, endingTypes: [] }; };

export const saveRankData            = (d) => lsSet(REINCARNATION_RANK_KEY, JSON.stringify(d));


export const updateRank = (cycleCount, endingType, achievementCount) => {
  const data = loadRankData();
  const score = (cycleCount * 10) + (achievementCount * 5) + (endingType === "hero" ? 20 : endingType === "hidden" ? 30 : 10);
  data.totalScore = (data.totalScore || 0) + score;
  if (endingType && !data.endingTypes.includes(endingType)) data.endingTypes.push(endingType);
  const newRank = REINCARNATION_RANKS.reduce((acc, r) => data.totalScore >= r.minScore ? r.rank : acc, 0);
  const didRankUp = newRank > (data.rank || 0);
  data.rank = newRank;
  saveRankData(data);
  return { ...data, rankData: REINCARNATION_RANKS[data.rank], didRankUp };
};

export const getRankStatus = () => {
  const data = loadRankData();
  return { ...data, rankData: REINCARNATION_RANKS[data.rank || 0], nextRank: REINCARNATION_RANKS[(data.rank || 0) + 1] || null };
};

export const SAKURA_ENDING_KEY  = "taleforge-sakura-ending";

export const loadSakuraData     = () => { const r = lsGet(SAKURA_ENDING_KEY); return r ? JSON.parse(r) : { clearedScenarios: [], conditions: {}, unlocked: false }; };

export const saveSakuraData     = (d) => lsSet(SAKURA_ENDING_KEY, JSON.stringify(d));


export const updateSakuraProgress = (scenario, karmaScore, companionsSaved, grudgesLeft, cycleCount) => {
  const data = loadSakuraData();
  if (scenario && !data.clearedScenarios.includes(scenario)) data.clearedScenarios.push(scenario);
  if (karmaScore >= 40 && karmaScore <= 60) data.conditions.karma_balance = (data.conditions.karma_balance || 0) + 1;
  if (!grudgesLeft) data.conditions.no_grudge = (data.conditions.no_grudge || 0) + 1;
  if (companionsSaved) data.conditions.companion_saved = true;
  if (cycleCount >= 20) data.conditions.cycle_twenty = true;
  const allScenariosClear = data.clearedScenarios.length >= 4; // 최소 4개 세계관
  if (allScenariosClear) data.conditions.all_new_scenarios = true;
  const allConditionsMet = data.conditions.all_new_scenarios && (data.conditions.karma_balance >= 3) && (data.conditions.no_grudge >= 2) && data.conditions.companion_saved && data.conditions.cycle_twenty;
  if (allConditionsMet) data.unlocked = true;
  saveSakuraData(data);
  return data;
};

export const getSakuraStatus = () => {
  const data = loadSakuraData();
  const metCount = Object.values(data.conditions).filter(v => v === true || v >= 1).length;
  return { ...data, metCount, totalConditions: SAKURA_CONDITIONS.length, conditions: SAKURA_CONDITIONS.map(c => ({ ...c, met: !!data.conditions[c.id] })) };
};

export const DEJAVU_KEY  = "taleforge-dejavu";

export const loadDejavu  = () => { const r = lsGet(DEJAVU_KEY); return r ? JSON.parse(r) : { triggers: [], count: 0 }; };

export const saveDejavu  = (d) => lsSet(DEJAVU_KEY, JSON.stringify(d));


export const recordDejavuEvent = (triggerId, scenario) => {
  const dv = loadDejavu();
  dv.count = (dv.count || 0) + 1;
  dv.triggers = dv.triggers || [];
  const trigger = DEJAVU_TRIGGERS.find(t => t.id === triggerId);
  if (trigger && !dv.triggers.find(t => t.id === triggerId)) {
    dv.triggers.push({ ...trigger, scenario, triggeredAt: new Date().toISOString() });
  }
  saveDejavu(dv);
};

export const getDejavuStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return { ...loadDejavu(), triggerDefs: DEJAVU_TRIGGERS };
};

export const CAUSALITY_KEY  = "taleforge-causality";

export const loadCausality  = () => { const r = lsGet(CAUSALITY_KEY); return r ? JSON.parse(r) : { uses: 0, maxUses: 3, history: [] }; };

export const saveCausality  = (c) => lsSet(CAUSALITY_KEY, JSON.stringify(c));


export const useCausalityManip = (eventDesc) => {
  const c = loadCausality();
  if ((c.uses || 0) >= (c.maxUses || 3)) return false;
  c.uses = (c.uses || 0) + 1;
  c.history = c.history || [];
  c.history.push({ eventDesc: eventDesc || "사건 변경", usedAt: new Date().toISOString() });
  saveCausality(c);
  return true;
};

export const resetCausalityOnReincarnate = (cycle) => {
  const c = loadCausality();
  c.uses = 0;
  c.maxUses = Math.min(5, Math.floor(cycle / 5) + 1); // 회차마다 최대 사용 횟수 증가
  saveCausality(c);
};

export const getCausalityStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 10) return null; // 10회차부터 해금
  return loadCausality();
};

export const GAMBLING_DEBT_KEY  = "taleforge-gambling-debt";

export const loadGamblingDebt   = () => { const r = lsGet(GAMBLING_DEBT_KEY); return r ? JSON.parse(r) : { totalDebt: 0, paidOff: false, creditorName: null }; };

export const saveGamblingDebt   = (d) => lsSet(GAMBLING_DEBT_KEY, JSON.stringify(d));


export const recordGamblingDebt = (amount, scenario) => {
  if (!amount || amount <= 0) return;
  const debt = loadGamblingDebt();
  debt.totalDebt = (debt.totalDebt || 0) + amount;
  debt.paidOff = false;
  if (!debt.creditorName) debt.creditorName = CREDITOR_NAMES[Math.floor(Math.random() * CREDITOR_NAMES.length)];
  debt.scenario = scenario || "";
  debt.incurredAt = new Date().toISOString();
  saveGamblingDebt(debt);
};

export const payOffDebt = () => {
  const debt = loadGamblingDebt();
  debt.paidOff = true;
  debt.paidAt = new Date().toISOString();
  saveGamblingDebt(debt);
};

export const getGamblingDebt = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const debt = loadGamblingDebt();
  if (!debt.totalDebt || debt.totalDebt <= 0) return null;
  return debt;
};

export const CHILDHOOD_TRAUMA_KEY  = "taleforge-childhood-trauma";

export const loadChildhoodTrauma   = () => { const r = lsGet(CHILDHOOD_TRAUMA_KEY); return r ? JSON.parse(r) : []; };

export const saveChildhoodTrauma   = (t) => lsSet(CHILDHOOD_TRAUMA_KEY, JSON.stringify(t));


export const recordChildhoodTrauma = (traumaId, scenario) => {
  if (!traumaId) return;
  const traumas = loadChildhoodTrauma();
  const def = TRAUMA_DEFS80.find(t => t.id === traumaId);
  if (!def) return;
  if (!traumas.find(t => t.id === traumaId)) {
    traumas.push({ ...def, scenario: scenario || "", recordedAt: new Date().toISOString(), triggered: false });
  }
  // 개수 제한 없음 (전체 저장)
  saveChildhoodTrauma(traumas);
};

export const getChildhoodTraumas = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadChildhoodTrauma();
};

export const APOCALYPSE_KEY  = "taleforge-apocalypse";

export const loadApocalypse  = () => { const r = lsGet(APOCALYPSE_KEY); return r ? JSON.parse(r) : { clock: 0, sealed: false, sealCount: 0 }; };

export const saveApocalypse  = (a) => lsSet(APOCALYPSE_KEY, JSON.stringify(a));


export const tickApocalypse = (karmaScore, questRate, sealed) => {
  const apo = loadApocalypse();
  if (sealed) {
    apo.sealed = true;
    apo.sealCount = (apo.sealCount || 0) + 1;
    apo.clock = Math.max(0, (apo.clock || 0) - 15); // 봉인 시 시계 후퇴
  } else {
    const tick = karmaScore >= 70 ? 8 : questRate >= 70 ? 3 : 5;
    apo.clock = Math.min(100, (apo.clock || 0) + tick);
  }
  saveApocalypse(apo);
  const stage = APOCALYPSE_STAGES.find(s => (apo.clock||0) >= s.clock[0] && (apo.clock||0) <= s.clock[1]) || APOCALYPSE_STAGES[5];
  return { ...apo, stageData: stage };
};

export const getApocalypseStatus = () => {
  const apo = loadApocalypse();
  const stage = APOCALYPSE_STAGES.find(s => (apo.clock||0) >= s.clock[0] && (apo.clock||0) <= s.clock[1]) || APOCALYPSE_STAGES[0];
  return { ...apo, stageData: stage };
};

export const GRIEF_KEY  = "taleforge-grief";

export const loadGrief  = () => { const r = lsGet(GRIEF_KEY); return r ? JSON.parse(r) : { lostOnes: [], total: 0 }; };

export const saveGrief  = (g) => lsSet(GRIEF_KEY, JSON.stringify(g));


export const getGriefStatus = () => {
  const grief = loadGrief();
  const total = grief.total || 0;
  const stage = GRIEF_STAGES.find(s => total >= s.range[0] && total <= s.range[1]) || GRIEF_STAGES[4];
  return { ...grief, stageData: stage };
};

export const INSTINCT_KEY  = "taleforge-instinct";

export const loadInstinct  = () => { const r = lsGet(INSTINCT_KEY); return r ? JSON.parse(r) : { level: 0, accuracy: 50 }; };

export const saveInstinct  = (i) => lsSet(INSTINCT_KEY, JSON.stringify(i));


export const growInstinct = (cycle) => {
  const inst = loadInstinct();
  inst.level = Math.min(10, Math.floor(cycle / 3));
  inst.accuracy = Math.min(95, 50 + (inst.level * 5));
  saveInstinct(inst);
  return inst;
};

export const getInstinctStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 3) return null;
  const inst = loadInstinct();
  return { ...inst, desc: `첫 만남 NPC 의도 파악 정확도 ${inst.accuracy}%` };
};

export const CURSED_RELIC_KEY  = "taleforge-cursed-relic";

export const loadCursedRelics  = () => { const r = lsGet(CURSED_RELIC_KEY); return r ? JSON.parse(r) : []; };

export const saveCursedRelics  = (r) => lsSet(CURSED_RELIC_KEY, JSON.stringify(r));


export const recordCursedRelic = (relicId, scenario) => {
  if (!relicId) return;
  const relics = loadCursedRelics();
  const def = CURSED_RELIC_TYPES.find(r => r.id === relicId);
  if (!def) return;
  if (!relics.find(r => r.id === relicId)) {
    relics.push({ ...def, scenario: scenario || "", recordedAt: new Date().toISOString(), intensity: 1 });
  } else {
    const existing = relics.find(r => r.id === relicId);
    existing.intensity = Math.min(3, (existing.intensity || 1) + 1);
  }
  // 개수 제한 없음 (전체 저장)
  saveCursedRelics(relics);
};

export const getCursedRelics = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadCursedRelics();
};

export const NATURE_KARMA_KEY  = "taleforge-nature-karma";

export const loadNatureKarma   = () => { const r = lsGet(NATURE_KARMA_KEY); return r ? JSON.parse(r) : { score: 50, disasters: 0, gifts: 0 }; };

export const saveNatureKarma   = (n) => lsSet(NATURE_KARMA_KEY, JSON.stringify(n));


export const recordNatureAction = (action) => {
  const nk = loadNatureKarma();
  if (action === "destroy") {
    nk.score = Math.max(0, (nk.score || 50) - 10);
    nk.disasters = (nk.disasters || 0) + 1;
  } else if (action === "protect") {
    nk.score = Math.min(100, (nk.score || 50) + 8);
    nk.gifts = (nk.gifts || 0) + 1;
  }
  saveNatureKarma(nk);
};

export const getNatureKarma = () => {
  const nk = loadNatureKarma();
  const score = nk.score || 50;
  const status = score >= 70 ? { icon:"🌿", label:"자연의 수호자", effect:"숲·강에서 희귀 아이템 자동 발견", disaster:false }
    : score >= 40 ? { icon:"🌳", label:"자연과 공존", effect:"자연 관련 판정 보너스", disaster:false }
    : score >= 20 ? { icon:"⚠️", label:"자연의 경고", effect:"자연재해 빈도 증가", disaster:true }
    : { icon:"🌪️", label:"자연의 분노", effect:"매 회차 자연재해 강제 발생", disaster:true };
  return { ...nk, status };
};

export const ALIAS_LIST_KEY  = "taleforge-alias-list";

export const loadAliasList   = () => { const r = lsGet(ALIAS_LIST_KEY); return r ? JSON.parse(r) : []; };

export const saveAliasList   = (a) => lsSet(ALIAS_LIST_KEY, JSON.stringify(a));


export const recordAlias = (aliasName, context, scenario) => {
  if (!aliasName) return;
  const list = loadAliasList();
  if (!list.find(a => a.name === aliasName)) {
    list.push({ name: aliasName, context: context || "위장 신분", scenario: scenario || "", usedAt: new Date().toISOString(), credibility: 1 });
  } else {
    const existing = list.find(a => a.name === aliasName);
    existing.credibility = Math.min(5, (existing.credibility || 1) + 1);
  }
  saveAliasList(list);
};

export const getAliasList = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadAliasList();
};

export const WISH_KEY  = "taleforge-wish";

export const loadWish  = () => { const r = lsGet(WISH_KEY); return r ? JSON.parse(r) : { wishesGranted: 0, nextWishAt: 100, history: [] }; };

export const saveWish  = (w) => lsSet(WISH_KEY, JSON.stringify(w));


export const checkWishAvailable = (cycleCount) => {
  const wish = loadWish();
  return cycleCount > 0 && cycleCount % 100 === 0;
};

export const grantWish = (wishId, cycleCount) => {
  const wish = loadWish();
  const option = WISH_OPTIONS.find(w => w.id === wishId);
  if (!option) return false;
  wish.wishesGranted = (wish.wishesGranted || 0) + 1;
  wish.nextWishAt = Math.ceil((cycleCount + 1) / 100) * 100;
  wish.history = wish.history || [];
  wish.history.push({ ...option, grantedAt: new Date().toISOString(), cycle: cycleCount });
  saveWish(wish);
  return true;
};

export const getWishStatus = () => {
  const cycle = loadCycleCount();
  const wish = loadWish();
  return { ...wish, available: checkWishAvailable(cycle), options: WISH_OPTIONS };
};

export const PET_LEGACY_KEY  = "taleforge-pet-legacy";

export const loadPetLegacy   = () => { const r = lsGet(PET_LEGACY_KEY); return r ? JSON.parse(r) : []; };

export const savePetLegacy   = (p) => lsSet(PET_LEGACY_KEY, JSON.stringify(p));


export const recordPetLegacy = (petType, petName, bond, scenario) => {
  if (!petType) return;
  const pets = loadPetLegacy();
  const def = PET_TYPES.find(p => p.id === petType);
  if (!def) return;
  const existing = pets.find(p => p.id === petType);
  if (existing) {
    existing.encounters = (existing.encounters || 1) + 1;
    existing.bond = Math.min(100, (existing.bond || bond) + 15);
  } else {
    pets.push({ ...def, petName: petName || def.name, bond: bond || 30, encounters: 1, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  savePetLegacy(pets);
};

export const getPetLegacy = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadPetLegacy();
};

export const SEALED_MEMORY_KEY  = "taleforge-sealed-memory";

export const loadSealedMemories = () => { const r = lsGet(SEALED_MEMORY_KEY); return r ? JSON.parse(r) : []; };

export const saveSealedMemories = (m) => lsSet(SEALED_MEMORY_KEY, JSON.stringify(m));


export const sealMemory = (memoryType, scenario) => {
  if (!memoryType) return;
  const memories = loadSealedMemories();
  const def = SEALED_MEMORY_TYPES.find(m => m.id === memoryType);
  if (!def || memories.find(m => m.id === memoryType)) return;
  memories.push({ ...def, scenario: scenario || "", sealed: true, sealedAt: new Date().toISOString(), opened: false });
  saveSealedMemories(memories);
};

export const openSealedMemory = (memoryId) => {
  const memories = loadSealedMemories();
  const mem = memories.find(m => m.id === memoryId);
  if (!mem || mem.opened) return null;
  mem.opened = true;
  mem.openedAt = new Date().toISOString();
  saveSealedMemories(memories);
  return mem;
};

export const getSealedMemories = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadSealedMemories();
};

export const SOUL_CRYSTAL_KEY  = "taleforge-soul-crystal";

export const loadSoulCrystals  = () => { const r = lsGet(SOUL_CRYSTAL_KEY); return r ? JSON.parse(r) : { count: 0, crafted: [] }; };

export const saveSoulCrystals  = (c) => lsSet(SOUL_CRYSTAL_KEY, JSON.stringify(c));


export const earnSoulCrystal = (amount) => {
  const sc = loadSoulCrystals();
  sc.count = (sc.count || 0) + (amount || 1);
  saveSoulCrystals(sc);
  return sc;
};

export const craftWithSoulCrystal = (craftId) => {
  const sc = loadSoulCrystals();
  const craft = SOUL_CRYSTAL_CRAFTS.find(c => c.id === craftId);
  if (!craft || (sc.count || 0) < craft.cost) return false;
  sc.count -= craft.cost;
  sc.crafted = sc.crafted || [];
  sc.crafted.push({ ...craft, craftedAt: new Date().toISOString() });
  saveSoulCrystals(sc);
  return true;
};

export const getSoulCrystalStatus = () => {
  const sc = loadSoulCrystals();
  return { ...sc, availableCrafts: SOUL_CRYSTAL_CRAFTS.filter(c => (sc.count || 0) >= c.cost) };
};

export const EMOTION_ECHO_KEY  = "taleforge-emotion-echo";

export const loadEmotionEcho   = () => { const r = lsGet(EMOTION_ECHO_KEY); return r ? JSON.parse(r) : null; };

export const saveEmotionEcho   = (e) => lsSet(EMOTION_ECHO_KEY, JSON.stringify(e));


export const recordEmotionEcho = (dominantEmotion) => {
  if (!dominantEmotion || !EMOTION_ECHOES[dominantEmotion]) return;
  const echo = EMOTION_ECHOES[dominantEmotion];
  saveEmotionEcho({ id: dominantEmotion, ...echo, recordedAt: new Date().toISOString() });
};

export const getEmotionEcho = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadEmotionEcho();
};

export const DIMENSION_MAP_KEY  = "taleforge-dimension-map";

export const loadDimensionMap   = () => { const r = lsGet(DIMENSION_MAP_KEY); return r ? JSON.parse(r) : { pins: [], totalWorlds: 0 }; };

export const saveDimensionMap   = (m) => lsSet(DIMENSION_MAP_KEY, JSON.stringify(m));


export const addDimensionPin = (worldName, scenario) => {
  if (!worldName) return;
  const map = loadDimensionMap();
  if (!map.pins.find(p => p.world === worldName)) {
    map.pins.push({ world: worldName, scenario: scenario || "", pinnedAt: new Date().toISOString() });
    map.totalWorlds = map.pins.length;
  }
  saveDimensionMap(map);
};

export const getDimensionMapStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const map = loadDimensionMap();
  const total = map.totalWorlds || 0;
  const unlockedSkills = DIMENSION_UNLOCK_STAGES.filter(s => total >= s.count);
  const nextSkill = DIMENSION_UNLOCK_STAGES.find(s => total < s.count);
  return { ...map, unlockedSkills, nextSkill };
};

export const VILLAIN_INHERIT_KEY  = "taleforge-villain-inherit";

export const loadVillainInherit   = () => { const r = lsGet(VILLAIN_INHERIT_KEY); return r ? JSON.parse(r) : { inherited: [], corruptionLevel: 0 }; };

export const saveVillainInherit   = (v) => lsSet(VILLAIN_INHERIT_KEY, JSON.stringify(v));


export const inheritVillainPower = (bossName, bossAbility, scenario) => {
  if (!bossName) return;
  const vi = loadVillainInherit();
  vi.inherited = vi.inherited || [];
  if (!vi.inherited.find(v => v.bossName === bossName)) {
    vi.inherited.push({ bossName, ability: bossAbility || "알 수 없는 힘", scenario: scenario || "", inheritedAt: new Date().toISOString() });
    vi.corruptionLevel = Math.min(100, (vi.corruptionLevel || 0) + 15);
  }
  saveVillainInherit(vi);
};

export const getVillainInheritStatus = () => {
  const vi = loadVillainInherit();
  const corruption = vi.corruptionLevel || 0;
  const corruptDesc = corruption >= 80 ? "당신 안의 악이 거의 지배적이다. 인성 선택지가 줄어든다."
    : corruption >= 50 ? "악의 목소리가 점점 커진다. 어두운 선택지가 자주 나타난다."
    : corruption >= 20 ? "처치한 적의 힘이 희미하게 느껴진다."
    : "아직 영향이 없다.";
  return { ...vi, corruptDesc };
};

export const TEAR_CRYSTAL_KEY  = "taleforge-tear-crystals";

export const loadTearCrystals  = () => { const r = lsGet(TEAR_CRYSTAL_KEY); return r ? JSON.parse(r) : { crystals: 0, memories: [] }; };

export const saveTearCrystals  = (t) => lsSet(TEAR_CRYSTAL_KEY, JSON.stringify(t));


export const earnTearCrystal = (reason, scenario) => {
  const tc = loadTearCrystals();
  tc.crystals = (tc.crystals || 0) + 1;
  tc.memories = tc.memories || [];
  tc.memories.push({ reason: reason || "이유 없는 눈물", scenario: scenario || "", earnedAt: new Date().toISOString() });
  // 개수 제한 없음 (전체 저장)
  saveTearCrystals(tc);
};

export const useTearCrystal = (count) => {
  const tc = loadTearCrystals();
  const use = count || 1;
  if ((tc.crystals || 0) < use) return false;
  tc.crystals -= use;
  saveTearCrystals(tc);
  return true; // 사용 시 어떤 NPC도 감동시킴
};

export const getTearCrystalStatus = () => {
  const tc = loadTearCrystals();
  return { ...tc, canUse: (tc.crystals || 0) >= 3 };
};

export const ELEMENT_TRAUMA_KEY  = "taleforge-element-trauma";

export const loadElementTrauma   = () => { const r = lsGet(ELEMENT_TRAUMA_KEY); return r ? JSON.parse(r) : {}; };

export const saveElementTrauma   = (e) => lsSet(ELEMENT_TRAUMA_KEY, JSON.stringify(e));


export const recordElementDeath = (element) => {
  if (!element || !ELEMENT_PAIRS[element]) return;
  const et = loadElementTrauma();
  et[element] = (et[element] || 0) + 1;
  saveElementTrauma(et);
};

export const getElementResistances = () => {
  const et = loadElementTrauma();
  const resistances = [];
  Object.entries(et).forEach(([elem, count]) => {
    if (count >= 3 && ELEMENT_PAIRS[elem]) {
      const def = ELEMENT_PAIRS[elem];
      resistances.push({ element: elem, count, ...def, resistLevel: count >= 8 ? "완전 면역" : count >= 5 ? "강한 내성" : "약한 내성" });
    }
  });
  return resistances;
};

export const CIRCUS_KEY  = "taleforge-circus";

export const loadCircus  = () => { const r = lsGet(CIRCUS_KEY); return r ? JSON.parse(r) : { visited: 0, lastVisit: null }; };

export const saveCircus  = (c) => lsSet(CIRCUS_KEY, JSON.stringify(c));


export const visitCircus = (cycle) => {
  const circus = loadCircus();
  circus.visited = (circus.visited || 0) + 1;
  circus.lastVisit = { cycle, visitedAt: new Date().toISOString() };
  const act = CIRCUS_ACTS[circus.visited % CIRCUS_ACTS.length];
  saveCircus(circus);
  return act;
};

export const getCircusStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 7) return null; // 7회차 이상에서만
  return { ...loadCircus(), nextAct: CIRCUS_ACTS[((loadCircus().visited||0) + 1) % CIRCUS_ACTS.length] };
};

export const TEMPLE_KEY  = "taleforge-temple";

export const loadTemple  = () => { const r = lsGet(TEMPLE_KEY); return r ? JSON.parse(r) : { faithScore: 0, level: 0, worshippers: 0 }; };

export const saveTemple  = (t) => lsSet(TEMPLE_KEY, JSON.stringify(t));


export const growFaith = (faithGain) => {
  const t = loadTemple();
  t.faithScore = (t.faithScore || 0) + (faithGain || 5);
  const newLevel = TEMPLE_LEVELS.reduce((acc, l) => t.faithScore >= l.faith ? l.level : acc, 0);
  const didLevelUp = newLevel > (t.level || 0);
  t.level = newLevel;
  t.worshippers = TEMPLE_LEVELS[newLevel].worshippers;
  saveTemple(t);
  return { ...t, levelData: TEMPLE_LEVELS[newLevel], didLevelUp };
};

export const getTempleStatus = () => {
  const t = loadTemple();
  return { ...t, levelData: TEMPLE_LEVELS[t.level || 0], nextLevel: TEMPLE_LEVELS[(t.level || 0) + 1] || null };
};

export const LEGACY_WORDS_KEY  = "taleforge-legacy-words";

export const loadLegacyWords   = () => { const r = lsGet(LEGACY_WORDS_KEY); return r ? JSON.parse(r) : []; };

export const saveLegacyWords   = (w) => lsSet(LEGACY_WORDS_KEY, JSON.stringify(w));


export const recordLegacyWord = (lastWords, characterName, scenario, karmaScore) => {
  if (!lastWords) return;
  const words = loadLegacyWords();
  const misinterpretation = karmaScore >= 70
    ? `"${lastWords.slice(0,30)}..." — 이 말을 두고 사람들은 그가 저주를 내렸다고 믿는다.`
    : karmaScore <= 30
    ? `"${lastWords.slice(0,30)}..." — 이 말이 전설이 되어 희망의 구호로 쓰인다.`
    : `"${lastWords.slice(0,30)}..." — 이 말의 뜻을 놓고 학자들이 아직도 논쟁한다.`;
  words.push({ original: lastWords.slice(0, 100), characterName: characterName || "전생의 영웅", scenario: scenario || "", misinterpretation, recordedAt: new Date().toISOString() });
  // 개수 제한 없음 (전체 저장)
  saveLegacyWords(words);
};

export const getLegacyWords = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadLegacyWords();
};

export const MUTATION_KEY  = "taleforge-mutation";

export const loadMutation  = () => { const r = lsGet(MUTATION_KEY); return r ? JSON.parse(r) : {}; };

export const saveMutation  = (m) => lsSet(MUTATION_KEY, JSON.stringify(m));


export const recordRaceForMutation = (race) => {
  if (!race) return;
  const mutation = loadMutation();
  mutation[race] = (mutation[race] || 0) + 1;
  saveMutation(mutation);
  const def = MUTATION_DEFS[race];
  if (def && mutation[race] >= def.threshold) {
    return { mutated: true, race, ...def };
  }
  return { mutated: false, race, count: mutation[race], threshold: def?.threshold };
};

export const getMutationStatus = (race) => {
  const mutation = loadMutation();
  if (!race) return mutation;
  const count = mutation[race] || 0;
  const def = MUTATION_DEFS[race];
  if (!def) return null;
  return { race, count, threshold: def.threshold, mutated: count >= def.threshold, ...def };
};

export const DARK_ECHO_KEY  = "taleforge-dark-echo";

export const loadDarkEcho   = () => { const r = lsGet(DARK_ECHO_KEY); return r ? JSON.parse(r) : { infamy: 0, rumors: [], fearLevel: 0 }; };

export const saveDarkEcho   = (d) => lsSet(DARK_ECHO_KEY, JSON.stringify(d));


export const growDarkEcho = (infamyGain, evilAct) => {
  const de = loadDarkEcho();
  de.infamy = (de.infamy || 0) + (infamyGain || 5);
  de.fearLevel = Math.floor((de.infamy || 0) / 25);
  const newRumors = DARK_ECHO_RUMORS.filter(r => (de.infamy||0) >= r.infamyRequired && !de.rumors.find(dr => dr.rumor === r.rumor));
  newRumors.forEach(r => (de.rumors = de.rumors || []).push({ ...r, spreadAt: new Date().toISOString() }));
  if (evilAct) de.lastEvilAct = evilAct;
  saveDarkEcho(de);
  return { ...de, fearData: DARK_FEAR_LEVELS[de.fearLevel] };
};

export const getDarkEchoStatus = () => {
  const de = loadDarkEcho();
  return { ...de, fearData: DARK_FEAR_LEVELS[de.fearLevel || 0] };
};
