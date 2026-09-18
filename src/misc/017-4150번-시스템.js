// ── 41~50번 시스템 ──
// Auto-extracted from taleforge.html (original section banner preserved above).
import { BLOODLINE_TRAITS, BUILDING_TYPES, CONSTELLATIONS, CONTRACT_ENTITIES, CURSE_TYPES, DAWN_STAGES, DREAM_TYPES, ECHO_CHOICE_TYPES, EMOTION_RIPPLE_DEFS, IMPRINT_TYPES, KNOWN_LANGUAGES, LEGEND_ARTIFACTS, MAP_LOCATION_TYPES, MYTH_CHAPTER_TYPES, ROLE_TO_MASK, SIN_TYPES, TESTAMENT_TONES, WAR_SCAR_TYPES, WORLD_MEMORY_PHENOMENA, WORLD_MEMORY_STAGES } from '../data/017-4150번-시스템.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { lsDel, lsGet, lsSet } from '../utils.js';
import { loadBloodline, saveBloodline } from './015-시스템-1120.js';
import { loadCurseLineage, loadTimeEchoes, saveCurseLineage, saveTimeEchoes } from './016-2130번-시스템.js';

export const DREAM_PROPHECY_KEY  = "taleforge-dream-prophecy";

export const loadDreamProphecies = () => { const r = lsGet(DREAM_PROPHECY_KEY); return r ? JSON.parse(r) : []; };

export const saveDreamProphecies = (d) => lsSet(DREAM_PROPHECY_KEY, JSON.stringify(d));


export const recordDreamProphecy = (wilScore, scenario) => {
  const dreams = loadDreamProphecies();
  const idx = Math.floor((wilScore + dreams.length) % DREAM_TYPES.length);
  const dtype = DREAM_TYPES[idx];
  // 이미 같은 꿈 있으면 count만 증가
  const existing = dreams.find(d => d.id === dtype.id);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.scenarios = existing.scenarios || [];
    if (scenario && !existing.scenarios.includes(scenario)) existing.scenarios.push(scenario);
  } else {
    dreams.push({ ...dtype, count: 1, scenarios: scenario ? [scenario] : [], recordedAt: new Date().toISOString() });
  }
  // 개수 제한 없음 (전체 저장)
  saveDreamProphecies(dreams);
};

export const getDreamProphecies = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadDreamProphecies();
};

export const LEGACY_BUILDING_KEY  = "taleforge-legacy-building";

export const loadLegacyBuildings  = () => { const r = lsGet(LEGACY_BUILDING_KEY); return r ? JSON.parse(r) : []; };

export const saveLegacyBuildings  = (b) => lsSet(LEGACY_BUILDING_KEY, JSON.stringify(b));


BUILDING_TYPES.castle = BUILDING_TYPES.fortress;

BUILDING_TYPES.port   = BUILDING_TYPES.ship;

export const recordLegacyBuilding = (buildingType, name, scenario) => {
  const buildings = loadLegacyBuildings();
  const bdef = BUILDING_TYPES[buildingType];
  if (!bdef) return;
  const existing = buildings.find(b => b.type === buildingType);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
  } else {
    buildings.push({ type: buildingType, name: name || bdef.label, ...bdef, scenario: scenario || "", count: 1, recordedAt: new Date().toISOString() });
  }
  saveLegacyBuildings(buildings);
};

export const getLegacyBuildings = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadLegacyBuildings();
};

export const WATCHER_KEY  = "taleforge-watcher";

export const loadWatchers = () => { const r = lsGet(WATCHER_KEY); return r ? JSON.parse(r) : []; };

export const saveWatchers = (w) => lsSet(WATCHER_KEY, JSON.stringify(w));


export const recordWatcher = (enemyName, power, scenario) => {
  if (!enemyName) return;
  const watchers = loadWatchers();
  const existing = watchers.find(w => w.name === enemyName);
  if (existing) {
    existing.encounters = (existing.encounters || 1) + 1;
    existing.power = Math.min(10, (existing.power || 1) + 1);
    existing.evolved = existing.encounters >= 3;
  } else {
    watchers.push({ name: enemyName, power: Math.min(10, power || 1), encounters: 1, scenario: scenario || "", evolved: false, recordedAt: new Date().toISOString() });
  }
  saveWatchers(watchers);
};

export const getWatchers = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadWatchers();
};

export const SOUL_MASK_KEY  = "taleforge-soul-mask";

export const loadSoulMasks  = () => { const r = lsGet(SOUL_MASK_KEY); return r ? JSON.parse(r) : []; };

export const saveSoulMasks  = (m) => lsSet(SOUL_MASK_KEY, JSON.stringify(m));


export const recordSoulMask = (role, scenario) => {
  if (!role) return;
  const masks = loadSoulMasks();
  const mdef = Object.entries(ROLE_TO_MASK).find(([key]) => role.includes(key));
  if (!mdef) return;
  const [roleKey, maskData] = mdef;
  const existing = masks.find(m => m.roleKey === roleKey);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.mastery = Math.min(5, Math.floor(existing.count / 2) + 1);
  } else {
    masks.push({ roleKey, role, ...maskData, count: 1, mastery: 1, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  saveSoulMasks(masks);
};

export const getSoulMasks = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadSoulMasks();
};

export const EMOTION_RIPPLE_KEY  = "taleforge-emotion-ripple";

export const loadEmotionRipples  = () => { const r = lsGet(EMOTION_RIPPLE_KEY); return r ? JSON.parse(r) : []; };

export const saveEmotionRipples  = (e) => lsSet(EMOTION_RIPPLE_KEY, JSON.stringify(e));


export const recordEmotionRipple = (dominantEmotion, scenario) => {
  if (!dominantEmotion) return;
  const ripples = loadEmotionRipples();
  const rdef = EMOTION_RIPPLE_DEFS[dominantEmotion];
  if (!rdef) return;
  const existing = ripples.find(r => r.id === dominantEmotion);
  if (existing) {
    existing.intensity = Math.min(5, (existing.intensity || 1) + 1);
    existing.scenarios = existing.scenarios || [];
    if (scenario && !existing.scenarios.includes(scenario)) existing.scenarios.push(scenario);
  } else {
    ripples.push({ id: dominantEmotion, ...rdef, intensity: 1, scenarios: scenario ? [scenario] : [], recordedAt: new Date().toISOString() });
  }
  saveEmotionRipples(ripples);
};

export const getEmotionRipples = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadEmotionRipples();
};

export const TESTAMENT_KEY  = "taleforge-testament";

export const loadTestaments = () => { const r = lsGet(TESTAMENT_KEY); return r ? JSON.parse(r) : []; };

export const saveTestaments = (t) => lsSet(TESTAMENT_KEY, JSON.stringify(t));


export const recordTestament = (lastWordTone, characterName, scenario) => {
  const tests = loadTestaments();
  const tdef = TESTAMENT_TONES[lastWordTone] || TESTAMENT_TONES.hopeful;
  tests.push({ ...tdef, characterName: characterName || "전생의 나", scenario: scenario || "", recordedAt: new Date().toISOString() });
  saveTestaments(tests);
};

export const getTestaments = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadTestaments();
};

export const CONSTELLATION_KEY  = "taleforge-constellation";

export const loadConstellation  = () => { const r = lsGet(CONSTELLATION_KEY); return r ? JSON.parse(r) : null; };

export const saveConstellation  = (c) => lsSet(CONSTELLATION_KEY, JSON.stringify(c));


export const assignConstellation = () => {
  const cycle = loadCycleCount();
  const cIdx = cycle % CONSTELLATIONS.length;
  const constellation = CONSTELLATIONS[cIdx];
  saveConstellation({ ...constellation, assignedAt: new Date().toISOString(), cycle });
  return constellation;
};

export const getConstellation = () => {
  return loadConstellation();
};

export const EXPLORER_MAP_KEY  = "taleforge-explorer-map";

export const loadExplorerMap   = () => { const r = lsGet(EXPLORER_MAP_KEY); return r ? JSON.parse(r) : []; };

export const saveExplorerMap   = (m) => lsSet(EXPLORER_MAP_KEY, JSON.stringify(m));


export const recordExploredLocation = (locationType, scenario) => {
  const map = loadExplorerMap();
  const ldef = MAP_LOCATION_TYPES.find(l => l.id === locationType);
  if (!ldef) return;
  const existing = map.find(l => l.id === locationType);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.scenarios = existing.scenarios || [];
    if (scenario && !existing.scenarios.includes(scenario)) existing.scenarios.push(scenario);
  } else {
    map.push({ ...ldef, count: 1, scenarios: scenario ? [scenario] : [], recordedAt: new Date().toISOString() });
  }
  saveExplorerMap(map);
};

export const getExplorerMap = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadExplorerMap();
};

export const LIGHTNING_IMPRINT_KEY  = "taleforge-lightning-imprint";

export const loadLightningImprints  = () => { const r = lsGet(LIGHTNING_IMPRINT_KEY); return r ? JSON.parse(r) : []; };

export const saveLightningImprints  = (i) => lsSet(LIGHTNING_IMPRINT_KEY, JSON.stringify(i));


export const recordLightningImprint = (imprintType, scenario) => {
  if (!imprintType) return;
  const imprints = loadLightningImprints();
  const idef = IMPRINT_TYPES.find(i => i.id === imprintType);
  if (!idef) return;
  const existing = imprints.find(i => i.id === imprintType);
  if (existing) {
    existing.power = Math.min(5, (existing.power || 1) + 1);
    existing.count = (existing.count || 1) + 1;
  } else {
    imprints.push({ ...idef, power: 1, count: 1, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  saveLightningImprints(imprints);
};

export const getLightningImprints = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadLightningImprints();
};

export const DAWN_KEY  = "taleforge-dawn-of-ages";

export const loadDawn  = () => { const r = lsGet(DAWN_KEY); return r ? JSON.parse(r) : { totalLight: 0, stage: 0, milestones: [] }; };

export const saveDawn  = (d) => lsSet(DAWN_KEY, JSON.stringify(d));

export const growDawn = (heroicScore) => {
  const dawn = loadDawn();
  // 영웅적 회차일수록 더 많은 빛
  const gain = heroicScore >= 80 ? 3 : heroicScore >= 60 ? 2 : heroicScore >= 40 ? 1 : 0;
  dawn.totalLight = (dawn.totalLight || 0) + gain;
  const newStage = Math.min(5, Math.floor(dawn.totalLight / 4));
  const didLevelUp = newStage > (dawn.stage || 0);
  dawn.stage = newStage;
  if (didLevelUp) {
    dawn.milestones = dawn.milestones || [];
    dawn.milestones.push({ stage: newStage, label: DAWN_STAGES[newStage].label, recordedAt: new Date().toISOString() });
  }
  saveDawn(dawn);
  return { stage: newStage, didLevelUp, stageData: DAWN_STAGES[newStage] };
};

export const getDawnStatus = () => {
  const dawn = loadDawn();
  const stage = dawn.stage || 0;
  return { ...dawn, stageData: DAWN_STAGES[stage] };
};

export const WAR_SCAR_KEY  = "taleforge-war-scar";

export const loadWarScars  = () => { const r = lsGet(WAR_SCAR_KEY); return r ? JSON.parse(r) : []; };

export const saveWarScars  = (w) => lsSet(WAR_SCAR_KEY, JSON.stringify(w));


export const recordWarScar = (warType, scenario) => {
  if (!warType) return;
  const scars = loadWarScars();
  const wdef = WAR_SCAR_TYPES.find(w => w.id === warType);
  if (!wdef) return;
  const existing = scars.find(s => s.id === warType);
  if (existing) {
    existing.severity = Math.min(5, (existing.severity || 1) + 1);
    existing.scenarios = existing.scenarios || [];
    if (scenario && !existing.scenarios.includes(scenario)) existing.scenarios.push(scenario);
  } else {
    scars.push({ ...wdef, severity: 1, scenarios: scenario ? [scenario] : [], recordedAt: new Date().toISOString() });
  }
  saveWarScars(scars);
};

export const getWarScars = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadWarScars();
};

export const DIVINE_CONTRACT_KEY  = "taleforge-divine-contract";

export const loadDivineContracts  = () => { const r = lsGet(DIVINE_CONTRACT_KEY); return r ? JSON.parse(r) : []; };

export const saveDivineContracts  = (c) => lsSet(DIVINE_CONTRACT_KEY, JSON.stringify(c));


export const recordDivineContract = (entityType, contractDetail, scenario) => {
  if (!entityType) return;
  const contracts = loadDivineContracts();
  const cdef = CONTRACT_ENTITIES[entityType];
  if (!cdef) return;
  const existing = contracts.find(c => c.entityType === entityType);
  if (existing) {
    existing.renewals = (existing.renewals || 0) + 1;
    existing.power = Math.min(5, (existing.power || 1) + 1);
  } else {
    contracts.push({ entityType, ...cdef, contractDetail: contractDetail || "", power: 1, renewals: 0, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  saveDivineContracts(contracts);
};

export const getDivineContracts = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadDivineContracts();
};

export const LANGUAGE_MEMORY_KEY  = "taleforge-language-memory";

export const loadLanguageMemories = () => { const r = lsGet(LANGUAGE_MEMORY_KEY); return r ? JSON.parse(r) : []; };

export const saveLanguageMemories = (l) => lsSet(LANGUAGE_MEMORY_KEY, JSON.stringify(l));


export const recordLanguageMemory = (languageId, scenario) => {
  if (!languageId) return;
  const memories = loadLanguageMemories();
  const ldef = KNOWN_LANGUAGES.find(l => l.id === languageId);
  if (!ldef) return;
  if (memories.some(m => m.id === languageId)) {
    const existing = memories.find(m => m.id === languageId);
    existing.fluency = Math.min(5, (existing.fluency || 1) + 1);
    // [B15 FIX] 저장 호출 누락으로 숙련도 상승분이 다음 로드 시 사라지던 버그.
    saveLanguageMemories(memories);
    return;
  }
  memories.push({ ...ldef, fluency: 1, scenario: scenario || "", recordedAt: new Date().toISOString() });
  saveLanguageMemories(memories);
};

export const getLanguageMemories = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadLanguageMemories();
};

export const SIN_REDEMPTION_KEY  = "taleforge-sin-redemption";

export const loadSinRedemptions  = () => { const r = lsGet(SIN_REDEMPTION_KEY); return r ? JSON.parse(r) : []; };

export const saveSinRedemptions  = (s) => lsSet(SIN_REDEMPTION_KEY, JSON.stringify(s));


export const recordSin = (sinType, targetName, scenario) => {
  if (!sinType) return;
  const sins = loadSinRedemptions();
  const sdef = SIN_TYPES[sinType];
  if (!sdef) return;
  const existing = sins.find(s => s.sinType === sinType);
  if (existing) {
    existing.weight = Math.min(5, (existing.weight || 1) + 1);
    existing.redeemed = false; // 새 죄 추가 시 속죄 리셋
  } else {
    sins.push({ sinType, ...sdef, targetName: targetName || "알 수 없는 자", weight: 1, redeemed: false, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  saveSinRedemptions(sins);
};

export const redeemSin = (sinType) => {
  const sins = loadSinRedemptions();
  const sin = sins.find(s => s.sinType === sinType);
  if (sin) { sin.redeemed = true; saveSinRedemptions(sins); }
};

export const getSinRedemptions = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadSinRedemptions();
};

export const LEGEND_SHARD_KEY  = "taleforge-legend-shard";

export const loadLegendShards  = () => { const r = lsGet(LEGEND_SHARD_KEY); return r ? JSON.parse(r) : []; };

export const saveLegendShards  = (s) => lsSet(LEGEND_SHARD_KEY, JSON.stringify(s));


export const recordLegendShard = (artifactId, scenario) => {
  if (!artifactId) return;
  const shards = loadLegendShards();
  const adef = LEGEND_ARTIFACTS.find(a => a.id === artifactId);
  if (!adef) return;
  const existing = shards.find(s => s.id === artifactId);
  if (existing) {
    if (existing.collected < existing.totalShards) {
      existing.collected += 1;
      existing.completed = existing.collected >= existing.totalShards;
      existing.scenarios = existing.scenarios || [];
      if (scenario && !existing.scenarios.includes(scenario)) existing.scenarios.push(scenario);
    }
  } else {
    shards.push({ ...adef, collected: 1, completed: adef.totalShards === 1, scenarios: scenario ? [scenario] : [], recordedAt: new Date().toISOString() });
  }
  saveLegendShards(shards);
};

export const getLegendShards = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadLegendShards();
};

export const recordTimeEcho = (choiceType, context, scenario) => {
  if (!choiceType) return;
  const echoes = loadTimeEchoes();
  const edef = ECHO_CHOICE_TYPES[choiceType];
  if (!edef) return;
  echoes.push({ choiceType, ...edef, context: context || "", scenario: scenario || "", recordedAt: new Date().toISOString() });
  saveTimeEchoes(echoes);
};

export const MYTH_WRITER_KEY  = "taleforge-myth-writer";

export const loadMythChapters = () => { const r = lsGet(MYTH_WRITER_KEY); return r ? JSON.parse(r) : { chapters: [], mythName: null, totalEpics: 0 }; };

export const saveMythChapters = (m) => lsSet(MYTH_WRITER_KEY, JSON.stringify(m));


export const recordMythChapter = (chapterType, heroName, scenario) => {
  if (!chapterType) return;
  const myth = loadMythChapters();
  const cdef = MYTH_CHAPTER_TYPES.find(c => c.id === chapterType);
  if (!cdef) return;
  if (!myth.mythName && heroName) myth.mythName = heroName;
  myth.chapters = myth.chapters || [];
  if (!myth.chapters.some(c => c.id === chapterType)) {
    myth.chapters.push({ ...cdef, heroName: heroName || "전생의 나", scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  myth.totalEpics = (myth.totalEpics || 0) + 1;
  saveMythChapters(myth);
};

export const getMythChapters = () => {
  const cycle = loadCycleCount();
  if (cycle < 2) return { chapters: [], mythName: null, totalEpics: 0 };
  return loadMythChapters();
};

export const recordBloodlineTrait = (traitId, clanName, scenario) => {
  if (!traitId) return;
  const bloodline = loadBloodline();
  const tdef = BLOODLINE_TRAITS.find(t => t.id === traitId);
  if (!tdef) return;
  bloodline.lineage = bloodline.lineage || [];
  if (!bloodline.lineage.some(l => l.id === traitId)) {
    bloodline.lineage.push({ ...tdef, clanName: clanName || "이름 없는 가문", scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  bloodline.totalGenerations = (bloodline.totalGenerations || 0) + 1;
  if (!bloodline.dominantTrait && bloodline.lineage.length > 0) {
    bloodline.dominantTrait = bloodline.lineage[bloodline.lineage.length - 1].id;
  }
  saveBloodline(bloodline);
};

export const recordCurseLineage = (curseType, curseSource, scenario) => {
  if (!curseType) return;
  const curses = loadCurseLineage();
  const cdef = CURSE_TYPES.find(c => c.id === curseType);
  if (!cdef) return;
  const existing = curses.find(c => c.id === curseType);
  if (existing) {
    existing.depth = Math.min(5, (existing.depth || 1) + 1);
    existing.partiallyOvercome = existing.depth >= 3;
  } else {
    curses.push({ ...cdef, curseSource: curseSource || "알 수 없는 저주", depth: 1, partiallyOvercome: false, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  saveCurseLineage(curses);
};

export const getCurseLineage = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadCurseLineage();
};

export const WORLD_MEMORY_KEY  = "taleforge-world-memory";

export const loadWorldMemory   = () => { const r = lsGet(WORLD_MEMORY_KEY); return r ? JSON.parse(r) : { echoes: 0, stage: 0, phenomena: [], totalCycles: 0 }; };

export const saveWorldMemory   = (w) => lsSet(WORLD_MEMORY_KEY, JSON.stringify(w));

export const growWorldMemory = (cycleScore, totalCycles) => {
  const wm = loadWorldMemory();
  wm.totalCycles = totalCycles || (wm.totalCycles || 0) + 1;
  const gain = cycleScore >= 80 ? 4 : cycleScore >= 60 ? 3 : cycleScore >= 40 ? 2 : 1;
  wm.echoes = (wm.echoes || 0) + gain;
  const newStage = Math.min(5, Math.floor(wm.echoes / 5));
  const didLevelUp = newStage > (wm.stage || 0);
  wm.stage = newStage;

  // [BUG15 FIX] 현상 추가 로직: phenomena.length 기반이 아닌 echoes 기반으로 다음 현상 결정
  // 이전 방식(wm.phenomena.length % 5)은 이미 추가된 현상이면 length가 안 늘어 데드락 발생
  if (wm.echoes % 3 === 0) {
    wm.phenomena = wm.phenomena || [];
    const candidateIdx = Math.floor(wm.echoes / 3) % WORLD_MEMORY_PHENOMENA.length;
    const nextPhenomenon = WORLD_MEMORY_PHENOMENA[candidateIdx];
    if (nextPhenomenon && !wm.phenomena.some(p => p.id === nextPhenomenon.id)) {
      wm.phenomena.push({ ...nextPhenomenon, unlockedAt: new Date().toISOString() });
    }
  }

  saveWorldMemory(wm);
  return { stage: newStage, didLevelUp, stageData: WORLD_MEMORY_STAGES[newStage], echoes: wm.echoes };
};

export const getWorldMemoryStatus = () => {
  const wm = loadWorldMemory();
  const stage = wm.stage || 0;
  return { ...wm, stageData: WORLD_MEMORY_STAGES[stage], phenomena: wm.phenomena || [] };
};
