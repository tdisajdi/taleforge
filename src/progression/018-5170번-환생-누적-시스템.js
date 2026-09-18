// 51~70번 환생 누적 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { COMPANION_MEMORY_STAGES, EVIL_EYE_LEVELS, FATE_CARD_POOL, HIDEOUT_FACILITIES, IDENTITY_ARCHETYPES, LANGUAGE_DEFS, LEGEND_DISTORTION_LEVELS, MERCHANT_HINTS, MOON_PHASES, MYSTERY_PIECES, PAST_LANGUAGE_PHRASES, RECIPE_TIERS, RIFT_SCENARIOS, ROMANCE_FATES, STAR_SIGNS, WATCHER_STAGES } from '../data/018-5170번-환생-누적-시스템.js';
import { loadDemesne } from '../race/260-수인족-패널-렌더.js';
import { lsDel, lsGet, lsSet } from '../utils.js';
import { loadCycleCount } from './014-환생-누적-시스템-110번.js';

export const STAR_SIGN_KEY   = "taleforge-star-sign";

export const loadStarSign    = () => { const r = lsGet(STAR_SIGN_KEY); return r ? JSON.parse(r) : null; };

export const saveStarSign    = (s) => lsSet(STAR_SIGN_KEY, JSON.stringify(s));


export const assignStarSign = (deathMonth) => {
  // [BUG14 FIX] deathMonth는 0~11 기준으로 통일
  // 외부에서 1~12로 넘어오는 경우를 위해 12 이상이면 1 빼서 보정
  let month = deathMonth !== undefined ? deathMonth : new Date().getMonth();
  if (month >= 12) month = month - 1; // 1-indexed(1~12)를 0-indexed(0~11)로 변환
  if (month < 0) month = 0;
  const idx = month % STAR_SIGNS.length;
  const sign = STAR_SIGNS[idx];
  saveStarSign({ ...sign, assignedAt: new Date().toISOString() });
  return sign;
};

export const getStarSign = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadStarSign();
};

export const PAST_LANGUAGE_KEY  = "taleforge-past-language";

export const loadPastLanguage   = () => { const r = lsGet(PAST_LANGUAGE_KEY); return r ? JSON.parse(r) : { level: 0, phrases: [], unlockedAt: null }; };

export const savePastLanguage   = (l) => lsSet(PAST_LANGUAGE_KEY, JSON.stringify(l));


export const growPastLanguage = (cycle) => {
  const lang = loadPastLanguage();
  const newLevel = Math.min(10, Math.floor(cycle / 2));
  if (newLevel > (lang.level || 0)) {
    lang.level = newLevel;
    lang.unlockedAt = new Date().toISOString();
    const newPhrases = PAST_LANGUAGE_PHRASES.filter(p => p.level <= newLevel);
    lang.phrases = newPhrases;
    savePastLanguage(lang);
  }
  return lang;
};

export const getPastLanguage = () => {
  const cycle = loadCycleCount();
  if (cycle < 3) return null;
  return loadPastLanguage();
};

export const IDENTITY_VAULT_KEY  = "taleforge-identity-vault";

export const loadIdentityVault   = () => { const r = lsGet(IDENTITY_VAULT_KEY); return r ? JSON.parse(r) : []; };

export const saveIdentityVault   = (v) => lsSet(IDENTITY_VAULT_KEY, JSON.stringify(v));


export const recordIdentity = (identityType, alias, scenario) => {
  if (!identityType) return;
  const vault = loadIdentityVault();
  const archetype = IDENTITY_ARCHETYPES.find(a => a.id === identityType);
  if (!archetype) return;
  const existing = vault.find(v => v.id === identityType);
  if (existing) {
    existing.useCount = (existing.useCount || 1) + 1;
    existing.polished = existing.useCount >= 3; // 3회 사용 시 "완성된 신분"
  } else {
    vault.push({ ...archetype, alias: alias || archetype.label, useCount: 1, polished: false, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  saveIdentityVault(vault);
};

export const getIdentityVault = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadIdentityVault();
};

export const RIFT_KEY   = "taleforge-dimensional-rift";

export const loadRifts  = () => { const r = lsGet(RIFT_KEY); return r ? JSON.parse(r) : { totalRifts: 0, encounters: [] }; };

export const saveRifts  = (r) => lsSet(RIFT_KEY, JSON.stringify(r));


export const recordRiftEncounter = (scenarioId, cycle) => {
  const rifts = loadRifts();
  rifts.totalRifts = (rifts.totalRifts || 0) + 1;
  const scenario = RIFT_SCENARIOS.find(s => s.id === scenarioId) || RIFT_SCENARIOS[rifts.totalRifts % RIFT_SCENARIOS.length];
  rifts.encounters = rifts.encounters || [];
  rifts.encounters.push({ ...scenario, cycle: cycle || loadCycleCount(), encounteredAt: new Date().toISOString() });
  // 개수 제한 없음 (전체 저장)
  saveRifts(rifts);
};

export const getRiftStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 5) return null; // 5회차 이상에서만 등장
  const rifts = loadRifts();
  const nextRift = RIFT_SCENARIOS[rifts.totalRifts % RIFT_SCENARIOS.length];
  return { ...rifts, nextRift, available: cycle >= 5 };
};

export const RECIPE_BOOK_KEY  = "taleforge-recipe-book";

export const loadRecipeBook   = () => { const r = lsGet(RECIPE_BOOK_KEY); return r ? JSON.parse(r) : []; };

export const saveRecipeBook   = (b) => lsSet(RECIPE_BOOK_KEY, JSON.stringify(b));


export const updateRecipeBook = (cycle) => {
  const book = loadRecipeBook();
  const newTiers = RECIPE_TIERS.filter(t => t.minCycle <= cycle && !book.find(b => b.tier === t.tier));
  newTiers.forEach(t => book.push({ ...t, unlockedAt: new Date().toISOString(), discoveredCycle: cycle }));
  saveRecipeBook(book);
  return book;
};

export const getRecipeBook = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadRecipeBook();
};

export const ACHIEVEMENT_RATE_KEY  = "taleforge-achievement-rate";

export const loadAchievementRates  = () => { const r = lsGet(ACHIEVEMENT_RATE_KEY); return r ? JSON.parse(r) : []; };

export const saveAchievementRates  = (a) => lsSet(ACHIEVEMENT_RATE_KEY, JSON.stringify(a));


export const getAchievementBonus = (rate) => {
  if (rate >= 90) return { icon:"🏆", label:"완전 달성",     bonus:"다음 회차 시작 스탯 +5 전체, 골드 +200",    penalty:null };
  if (rate >= 70) return { icon:"⭐", label:"우수 달성",     bonus:"다음 회차 시작 스탯 +3 전체",               penalty:null };
  if (rate >= 50) return { icon:"✅", label:"보통 달성",     bonus:"다음 회차 시작 스탯 +1 전체",               penalty:null };
  if (rate >= 30) return { icon:"⚠️", label:"부진 달성",    bonus:null,                                        penalty:"다음 회차 시작 스탯 -2 전체" };
  return           { icon:"💀", label:"실패",             bonus:null,                                        penalty:"다음 회차 시작 스탯 -5, NPC 신뢰도 하락" };
};

export const recordAchievementRate = (rate, scenario) => {
  const rates = loadAchievementRates();
  rates.push({ rate: Math.round(rate), scenario: scenario || "", recordedAt: new Date().toISOString(), bonus: getAchievementBonus(rate) });
  // 개수 제한 없음 (전체 저장)
  saveAchievementRates(rates);
};

export const getLastAchievementBonus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const rates = loadAchievementRates();
  if (!rates.length) return null;
  const last = rates[rates.length - 1];
  return { ...last, ...getAchievementBonus(last.rate) };
};

export const ROMANCE_LEGACY_KEY  = "taleforge-romance-legacy";

export const loadRomanceLegacy   = () => { const r = lsGet(ROMANCE_LEGACY_KEY); return r ? JSON.parse(r) : []; };

export const saveRomanceLegacy   = (l) => lsSet(ROMANCE_LEGACY_KEY, JSON.stringify(l));


export const recordRomanceLegacy = (npcName, depth, scenario) => {
  if (!npcName || depth < 1) return;
  const legacy = loadRomanceLegacy();
  const existing = legacy.find(l => l.npcName === npcName);
  if (existing) {
    existing.depth = Math.min(5, (existing.depth || 1) + 1);
    existing.encounters = (existing.encounters || 1) + 1;
  } else {
    const fate = ROMANCE_FATES[Math.min(4, Math.max(0, depth - 1))];
    legacy.push({ npcName, depth: Math.min(5, depth), encounters: 1, scenario: scenario || "", fate, recordedAt: new Date().toISOString() });
  }
  saveRomanceLegacy(legacy);
};

export const getRomanceLegacy = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadRomanceLegacy().map(l => ({ ...l, fate: ROMANCE_FATES[Math.min(4, (l.depth||1) - 1)] }));
};

export const BESTIARY_KEY  = "taleforge-bestiary";

export const loadBestiary  = () => { const r = lsGet(BESTIARY_KEY); return r ? JSON.parse(r) : {}; };

export const saveBestiary  = (b) => lsSet(BESTIARY_KEY, JSON.stringify(b));


export const getBestiaryInsight = (killCount) => {
  if (killCount >= 20) return { level:"전문가", icon:"💀", desc:"이 몬스터의 모든 약점과 패턴을 꿰뚫고 있다.", bonus:"해당 몬스터 전투 판정 +25" };
  if (killCount >= 10) return { level:"숙련",   icon:"⚔️", desc:"주요 약점을 파악하고 있다.",                   bonus:"해당 몬스터 전투 판정 +15" };
  if (killCount >= 5)  return { level:"익숙",   icon:"🗡️", desc:"기본 패턴 정도는 알고 있다.",                 bonus:"해당 몬스터 전투 판정 +8" };
  if (killCount >= 2)  return { level:"경험",   icon:"👁️", desc:"이 몬스터를 본 적이 있다.",                   bonus:"기습 피해 확률 감소" };
  return                       { level:"초면",   icon:"❓", desc:"처음 보는 몬스터다.",                         bonus:"없음" };
};

export const recordMonsterKill = (monsterName, monsterType) => {
  if (!monsterName) return;
  const bestiary = loadBestiary();
  if (!bestiary[monsterName]) {
    bestiary[monsterName] = { name: monsterName, type: monsterType || "일반", killCount: 0, firstKill: new Date().toISOString() };
  }
  bestiary[monsterName].killCount = (bestiary[monsterName].killCount || 0) + 1;
  bestiary[monsterName].lastKill = new Date().toISOString();
  saveBestiary(bestiary);
};

export const getBestiaryStatus = (monsterName) => {
  if (!monsterName) return null;
  const bestiary = loadBestiary();
  const entry = bestiary[monsterName];
  if (!entry) return { name: monsterName, killCount: 0, insight: getBestiaryInsight(0) };
  return { ...entry, insight: getBestiaryInsight(entry.killCount) };
};

export const getFullBestiary = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return {};
  const bestiary = loadBestiary();
  const total = Object.keys(bestiary).length;
  const totalKills = Object.values(bestiary).reduce((sum, e) => sum + (e.killCount || 0), 0);
  return { entries: bestiary, total, totalKills, completionBonus: total >= 20 ? "도감 완성: 모든 몬스터 전투 판정 +5" : null };
};

export const MEMORY_MERCHANT_KEY  = "taleforge-memory-merchant";

export const loadMemoryMerchant   = () => { const r = lsGet(MEMORY_MERCHANT_KEY); return r ? JSON.parse(r) : { visits: 0, purchasedHints: [] }; };

export const saveMemoryMerchant   = (m) => lsSet(MEMORY_MERCHANT_KEY, JSON.stringify(m));


export const visitMemoryMerchant = (purchasedHintId) => {
  const merchant = loadMemoryMerchant();
  merchant.visits = (merchant.visits || 0) + 1;
  merchant.lastVisit = new Date().toISOString();
  if (purchasedHintId && !merchant.purchasedHints.includes(purchasedHintId)) {
    merchant.purchasedHints.push(purchasedHintId);
  }
  saveMemoryMerchant(merchant);
  return merchant;
};

export const getMemoryMerchantStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 4) return null; // 4회차부터 등장
  const merchant = loadMemoryMerchant();
  return { ...merchant, availableHints: MERCHANT_HINTS, appears: cycle >= 4 };
};

export const TIME_TOKEN_KEY  = "taleforge-time-token";

export const loadTimeTokens  = () => { const r = lsGet(TIME_TOKEN_KEY); return r ? JSON.parse(r) : { tokens: 0, used: 0, totalEarned: 0 }; };

export const saveTimeTokens  = (t) => lsSet(TIME_TOKEN_KEY, JSON.stringify(t));


export const earnTimeToken = (conditionId) => {
  const tokens = loadTimeTokens();
  if ((tokens.tokens || 0) >= 10) return false; // 최대 10개
  tokens.tokens = (tokens.tokens || 0) + 1;
  tokens.totalEarned = (tokens.totalEarned || 0) + 1;
  tokens.lastEarned = { conditionId, earnedAt: new Date().toISOString() };
  saveTimeTokens(tokens);
  return true;
};

export const useTimeToken = () => {
  const tokens = loadTimeTokens();
  if ((tokens.tokens || 0) <= 0) return false;
  tokens.tokens -= 1;
  tokens.used = (tokens.used || 0) + 1;
  tokens.lastUsed = new Date().toISOString();
  saveTimeTokens(tokens);
  return true;
};

export const resetTimeTokens = () => {
  // 새 회차 시작 시 미사용 토큰 초기화 (사용한 토큰 기록은 유지)
  const tokens = loadTimeTokens();
  tokens.tokens = 0;
  saveTimeTokens(tokens);
};

export const getTimeTokenStatus = () => {
  return loadTimeTokens();
};

export const SURVIVOR_COMPANIONS_KEY  = "taleforge-survivor-companions";

export const loadSurvivorCompanions   = () => { const r = lsGet(SURVIVOR_COMPANIONS_KEY); return r ? JSON.parse(r) : []; };

export const saveSurvivorCompanions   = (c) => lsSet(SURVIVOR_COMPANIONS_KEY, JSON.stringify(c));


export const recordSurvivorCompanion = (npcName, bond, survived, scenario) => {
  if (!npcName || !survived) return;
  const companions = loadSurvivorCompanions();
  const existing = companions.find(c => c.npcName === npcName);
  if (existing) {
    existing.encounters = (existing.encounters || 1) + 1;
    existing.stage = Math.min(4, (existing.stage || 0) + 1);
    existing.bond = Math.min(100, (existing.bond || bond) + 10);
  } else {
    companions.push({ npcName, bond: bond || 30, survived: true, encounters: 1, stage: 0, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  saveSurvivorCompanions(companions);
};

export const getSurvivorCompanions = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadSurvivorCompanions().map(c => ({ ...c, memoryStage: COMPANION_MEMORY_STAGES[Math.min(4, c.stage || 0)] }));
};

export const UNDYING_GAUGE_KEY  = "taleforge-undying-gauge";

export const loadUndyingGauge   = () => { const r = lsGet(UNDYING_GAUGE_KEY); return r ? JSON.parse(r) : { gauge: 0, maxGauge: 10, passiveReady: false, passiveUsedThisCycle: false, totalNearDeaths: 0 }; };

export const saveUndyingGauge   = (g) => lsSet(UNDYING_GAUGE_KEY, JSON.stringify(g));


export const fillUndyingGauge = (amount) => {
  const g = loadUndyingGauge();
  g.gauge = Math.min(g.maxGauge || 10, (g.gauge || 0) + (amount || 1));
  g.totalNearDeaths = (g.totalNearDeaths || 0) + 1;
  g.passiveReady = g.gauge >= (g.maxGauge || 10);
  saveUndyingGauge(g);
  return g;
};

export const triggerUndyingPassive = () => {
  const g = loadUndyingGauge();
  if (!g.passiveReady || g.passiveUsedThisCycle) return false;
  g.passiveUsedThisCycle = true;
  g.passiveReady = false;
  g.gauge = 0;
  saveUndyingGauge(g);
  return true; // 즉사 무효 발동
};

export const resetUndyingGaugeCycle = () => {
  const g = loadUndyingGauge();
  g.passiveUsedThisCycle = false;
  // 게이지는 회차 간 유지 (누적)
  saveUndyingGauge(g);
};

export const getUndyingGaugeStatus = () => loadUndyingGauge();

export const LANGUAGE_UNLOCK_KEY  = "taleforge-languages";

export const loadLanguages        = () => { const r = lsGet(LANGUAGE_UNLOCK_KEY); return r ? JSON.parse(r) : []; };

export const saveLanguages        = (l) => lsSet(LANGUAGE_UNLOCK_KEY, JSON.stringify(l));


export const unlockLanguage = (languageId, bondLevel, scenario) => {
  if (!languageId) return;
  const langs = loadLanguages();
  const def = LANGUAGE_DEFS.find(l => l.id === languageId);
  if (!def || bondLevel < def.minBond) return;
  if (langs.find(l => l.id === languageId)) return; // 이미 해금
  langs.push({ ...def, bondLevel, scenario: scenario || "", unlockedAt: new Date().toISOString() });
  saveLanguages(langs);
};

export const getUnlockedLanguages = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadLanguages();
};

export function getAncientLangBLS(){
  try{
    const langs = loadLanguages();
    if(!langs.length) return '';
    const lines = langs.map(l => `${l.icon} ${l.name}: ${l.bonus}`);
    return '\n\n[🗣️ 습득한 언어]\n' + lines.join('\n') + '\n해당 언어가 필요한 상황(비문 해독, 종족 NPC와의 깊은 대화 등)에서 이 능력을 활용한 서사를 전개하라.';
  }catch(e){ return ''; }
}
window.getAncientLangBLS = getAncientLangBLS;

window.getAncientLangBLS = getAncientLangBLS;

export function getDiplomacyBLS(){
  try{
    const d = (typeof loadDemesne === 'function') ? loadDemesne() : null;
    if(!d || !d.established || !(d.vassals||[]).length) return '';
    const lines = d.vassals.map(v => {
      const bondLabel = (v.bond||30) >= 70 ? '충성' : (v.bond||30) >= 40 ? '중립' : '불만';
      return `${v.name||'봉신'}(${v.role||'기사'}): 유대 ${v.bond||30} — ${bondLabel}`;
    });
    return '\n\n[🤝 봉신 외교 현황]\n' + lines.join('\n');
  }catch(e){ return ''; }
}
window.getDiplomacyBLS = getDiplomacyBLS;

window.getDiplomacyBLS = getDiplomacyBLS;

export function getLoopWorldBLS(){
  try{
    const cycle = (typeof loadCycleCount === 'function') ? loadCycleCount() : 0;
    if(cycle < 1) return '';
    return `\n\n[🔄 루프 ${cycle}회차] 이 세계는 ${cycle}번째 순환을 겪고 있다. 주인공은 전생의 기억과 능력 일부를 간직하고 있다.`;
  }catch(e){ return ''; }
}
window.getLoopWorldBLS = getLoopWorldBLS;

window.getLoopWorldBLS = getLoopWorldBLS;

export const BARD_LEGEND_KEY  = "taleforge-bard-legend";

export const loadBardLegend   = () => { const r = lsGet(BARD_LEGEND_KEY); return r ? JSON.parse(r) : { verses: [], fame: 0, distortionLevel: 0 }; };

export const saveBardLegend   = (l) => lsSet(BARD_LEGEND_KEY, JSON.stringify(l));


export const addBardVerse = (event, characterName, scenario) => {
  if (!event) return;
  const legend = loadBardLegend();
  legend.fame = (legend.fame || 0) + 10;
  legend.distortionLevel = Math.min(4, Math.floor((legend.fame || 0) / 30));
  legend.verses = legend.verses || [];
  const distortion = LEGEND_DISTORTION_LEVELS[legend.distortionLevel];
  legend.verses.push({ event, characterName: characterName || "전생의 영웅", scenario: scenario || "", distortion: distortion.label, addedAt: new Date().toISOString() });
  // 개수 제한 없음 (전체 저장)
  saveBardLegend(legend);
};

export const getBardLegendStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 2) return null;
  const legend = loadBardLegend();
  const distortion = LEGEND_DISTORTION_LEVELS[legend.distortionLevel || 0];
  return { ...legend, distortionData: distortion };
};

export const MYSTERY_PUZZLE_KEY  = "taleforge-mystery-puzzle";

export const loadMysteryPuzzle   = () => { const r = lsGet(MYSTERY_PUZZLE_KEY); return r ? JSON.parse(r) : { pieces: [], totalPieces: 12, solved: false }; };

export const saveMysteryPuzzle   = (p) => lsSet(MYSTERY_PUZZLE_KEY, JSON.stringify(p));


export const collectMysteryPiece = (cycle) => {
  const puzzle = loadMysteryPuzzle();
  const piece = MYSTERY_PIECES.find(p => p.revealAt === cycle && !puzzle.pieces.find(pp => pp.id === p.id));
  if (piece) {
    puzzle.pieces.push({ ...piece, collectedAt: new Date().toISOString(), cycle });
    puzzle.solved = puzzle.pieces.length >= puzzle.totalPieces;
    saveMysteryPuzzle(puzzle);
    return piece;
  }
  return null;
};

export const getMysteryPuzzleStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const puzzle = loadMysteryPuzzle();
  return { ...puzzle, nextPiece: MYSTERY_PIECES.find(p => p.revealAt === cycle + 1) };
};

export const WATCHER_GAZE_KEY  = "taleforge-watcher-gaze";

export const loadWatcherGaze   = () => { const r = lsGet(WATCHER_GAZE_KEY); return r ? JSON.parse(r) : { gazeCount: 0, revealed: false, stage: 0 }; };

export const saveWatcherGaze   = (w) => lsSet(WATCHER_GAZE_KEY, JSON.stringify(w));


export const progressWatcherGaze = (cycle) => {
  const gaze = loadWatcherGaze();
  if (cycle < 6) return null; // 6회차부터 시작
  const newStage = Math.min(5, Math.floor((cycle - 6) / 2));
  if (newStage > (gaze.stage || 0)) {
    gaze.stage = newStage;
    gaze.gazeCount = (gaze.gazeCount || 0) + 1;
    if (newStage >= 5) gaze.revealed = true;
    saveWatcherGaze(gaze);
  }
  return { ...gaze, stageData: WATCHER_STAGES[gaze.stage || 0] };
};

export const getWatcherGazeStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 6) return null;
  const gaze = loadWatcherGaze();
  return { ...gaze, stageData: WATCHER_STAGES[gaze.stage || 0] };
};

export const FATE_CARD_KEY  = "taleforge-fate-card";

export const loadFateCard   = () => { const r = lsGet(FATE_CARD_KEY); return r ? JSON.parse(r) : null; };

export const saveFateCard   = (c) => lsSet(FATE_CARD_KEY, JSON.stringify(c));

export const clearFateCard  = () => lsDel(FATE_CARD_KEY);

export const drawFateCards = () => {
  const shuffled = [...FATE_CARD_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3); // 3장 중 1장 선택
};

export const selectFateCard = (cardId) => {
  const card = FATE_CARD_POOL.find(c => c.id === cardId);
  if (!card) return null;
  saveFateCard({ ...card, selectedAt: new Date().toISOString(), cycle: loadCycleCount() });
  return card;
};

export const getCurrentFateCard = () => {
  return loadFateCard();
};


export const HIDEOUT_KEY  = "taleforge-hideout";

export const loadHideout  = () => { const r = lsGet(HIDEOUT_KEY); return r ? JSON.parse(r) : { facilities: [], level: 0, totalUpgrades: 0 }; };

export const saveHideout  = (h) => lsSet(HIDEOUT_KEY, JSON.stringify(h));


export const upgradeHideout = (cycle) => {
  const hideout = loadHideout();
  const newFacilities = HIDEOUT_FACILITIES.filter(f => f.unlockCycle <= cycle && !hideout.facilities.find(hf => hf.id === f.id));
  newFacilities.forEach(f => {
    hideout.facilities.push({ ...f, unlockedAt: new Date().toISOString(), unlockedCycle: cycle });
    hideout.totalUpgrades = (hideout.totalUpgrades || 0) + 1;
  });
  hideout.level = hideout.facilities.length;
  saveHideout(hideout);
  return { newFacilities, hideout };
};

export const getHideoutStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const hideout = loadHideout();
  const nextFacility = HIDEOUT_FACILITIES.find(f => f.unlockCycle > cycle && !hideout.facilities.find(hf => hf.id === f.id));
  return { ...hideout, nextFacility };
};

export const EVIL_EYE_KEY  = "taleforge-evil-eye";

export const loadEvilEye   = () => { const r = lsGet(EVIL_EYE_KEY); return r ? JSON.parse(r) : { killCount: 0, awakened: false, level: 0 }; };

export const saveEvilEye   = (e) => lsSet(EVIL_EYE_KEY, JSON.stringify(e));


export const recordEvilEyeKill = (count) => {
  const eye = loadEvilEye();
  eye.killCount = (eye.killCount || 0) + (count || 1);
  const newLevel = EVIL_EYE_LEVELS.reduce((acc, l) => eye.killCount >= l.killsRequired ? l.level : acc, 0);
  const didAwaken = newLevel > (eye.level || 0);
  eye.level = newLevel;
  eye.awakened = newLevel > 0;
  if (didAwaken) eye.awakenedAt = new Date().toISOString();
  saveEvilEye(eye);
  return { ...eye, levelData: EVIL_EYE_LEVELS[eye.level], didAwaken };
};

export const getEvilEyeStatus = () => {
  const eye = loadEvilEye();
  return { ...eye, levelData: EVIL_EYE_LEVELS[eye.level || 0], nextLevel: EVIL_EYE_LEVELS[(eye.level || 0) + 1] || null };
};

export const MOON_PHASE_KEY  = "taleforge-moon-phase";

export const loadMoonPhase   = () => { const r = lsGet(MOON_PHASE_KEY); return r ? JSON.parse(r) : null; };

export const saveMoonPhase   = (m) => lsSet(MOON_PHASE_KEY, JSON.stringify(m));


export const assignMoonPhase = (deathTimestamp) => {
  const date = deathTimestamp ? new Date(deathTimestamp) : new Date();
  const day = date.getDate();
  const phaseIdx = Math.floor((day / 30) * 8) % 8;
  const phase = MOON_PHASES[phaseIdx];
  saveMoonPhase({ ...phase, assignedAt: new Date().toISOString(), deathDay: day });
  return phase;
};

export const getMoonPhase = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadMoonPhase();
};
