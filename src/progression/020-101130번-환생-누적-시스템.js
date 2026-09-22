// 101~130번 환생 누적 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { RARITY_COLOR } from '../data/012-궁수-계열-T2-파생-5종-칭호-전사마법사도적-계열과-동일한-절제-원칙.js';
import { AWARENESS_LEVELS, BLOODVOW_PATHS, BLOODVOW_TYPES, BLOOD_CLASSES, CAROUSEL_ROLES, CELESTIAL_DARKEN_METHODS, CELESTIAL_DARK_GAIN, CELESTIAL_LIGHT_GAIN, CELESTIAL_PHASE_SKILLS, CELESTIAL_PHASE_STATS, CELESTIAL_RESTORE_METHODS, COUNCIL_DECISIONS, COUNCIL_SAGES, COVENANT_ATONEMENT_METHODS, COVENANT_DEED_GAIN, COVENANT_SIN_LOSS, CRAFT_POWER_SKILLS, DARKLING_LIGHT_EXPOSURE, DARKLING_VOID_TYPES, DEIFICATION_CONDITIONS, DEIFICATION_STAGES, DEMON_PURIFY_METHODS, DEMON_SIN_GAIN, DRAGON_ANCESTOR_TYPES, DRAGON_AWAKEN_ACTS, DRAGON_AWAKEN_COSTS, DRAGON_BALANCE_PHASES, DRAGON_FRAGMENT_TRIGGERS, DRAGON_HOARD_OBSESSION_EVENTS, DRAGON_HOARD_TYPES, DWARF_CRAFT_TYPES, ELEMENTAL_ACT_GAIN, ELEMENTAL_RESTORE_METHODS, ELEMENTAL_TABOO_ACTS, ELEMENTAL_TYPES, FEAR_RANKS, GRUDGE_FLOWER_STATES, GRUDGE_RESOLUTIONS, GRUDGE_TYPES, KILL_SENSE_LEVELS, NPC_CRAFT_METHODS, NPC_CRAFT_STAGES, ORC_HONOR_GAINS, ORC_LINEAGE_DEFS, ORC_OATH_TYPES, RED_THREAD_FATES, RUIN_TYPES, TRAP_PATTERNS, TREE_BRANCH_TYPES, WORK_DIFFICULTIES } from '../data/020-101130번-환생-누적-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { dramaticEvolution } from '../items/074-파트2-B-성장-연출-강화.js';
import { saveSkills } from '../job/002-스킬-시스템.js';
import { _markDirty, loadNPCs, saveSession, saveStatsSplit } from '../misc/001-block0-preamble.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { RACE_DEFS } from '../race/013-종족-시스템.js';
import { esc, lsDel, lsGet, lsSet, showToast, toast } from '../utils.js';
import { updateWorldDB } from '../world/145-⑥-세계-상태-DB.js';
import { loadCycleCount } from './014-환생-누적-시스템-110번.js';

export const GROWTH_TREE_KEY  = "taleforge-growth-tree";

export const loadGrowthTree   = () => { const r = lsGet(GROWTH_TREE_KEY); return r ? JSON.parse(r) : { branches: [], blossoms: [], totalBranches: 0 }; };

export const saveGrowthTree   = (t) => lsSet(GROWTH_TREE_KEY, JSON.stringify(t));


export const growTreeBranch = (branchType, scenario) => {
  const tree = loadGrowthTree();
  const def = TREE_BRANCH_TYPES.find(b => b.id === branchType) || TREE_BRANCH_TYPES[tree.totalBranches % TREE_BRANCH_TYPES.length];
  const existing = tree.branches.find(b => b.id === def.id);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    if (existing.count >= def.bloomAt && !tree.blossoms.find(bl => bl.id === def.id)) {
      tree.blossoms.push({ ...def, bloomedAt: new Date().toISOString(), scenario });
    }
  } else {
    tree.branches.push({ ...def, count: 1, scenario, addedAt: new Date().toISOString() });
  }
  tree.totalBranches = (tree.totalBranches || 0) + 1;
  saveGrowthTree(tree);
  return tree;
};

export const getGrowthTreeStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const tree = loadGrowthTree();
  return { ...tree, nextBlossom: TREE_BRANCH_TYPES.find(b => !tree.blossoms.find(bl => bl.id === b.id)) };
};

export const DEIFICATION_KEY  = "taleforge-deification";

export const loadDeification  = () => { const r = lsGet(DEIFICATION_KEY); return r ? JSON.parse(r) : { stage: 0, conditions: {}, deified: false, interventions: [] }; };

export const saveDeification  = (d) => lsSet(DEIFICATION_KEY, JSON.stringify(d));


export const updateDeification = (conditionId) => {
  const d = loadDeification();
  if (conditionId) d.conditions[conditionId] = true;
  const metCount = Object.values(d.conditions).filter(Boolean).length;
  d.stage = Math.min(4, Math.floor(metCount / 1.25));
  if (metCount >= DEIFICATION_CONDITIONS.length) d.deified = true;
  saveDeification(d);
  return { ...d, stageData: DEIFICATION_STAGES[d.stage], metCount };
};

export const addDeificationIntervention = (desc, targetCycle) => {
  const d = loadDeification();
  if (!d.deified) return false;
  d.interventions = d.interventions || [];
  d.interventions.push({ desc, targetCycle, addedAt: new Date().toISOString() });
  saveDeification(d);
  return true;
};

export const getDeificationStatus = () => {
  const d = loadDeification();
  const metCount = Object.values(d.conditions).filter(Boolean).length;
  return { ...d, stageData: DEIFICATION_STAGES[d.stage || 0], metCount, totalConditions: DEIFICATION_CONDITIONS.length, conditions: DEIFICATION_CONDITIONS.map(c => ({ ...c, met: !!d.conditions[c.id] })) };
};

export const LOOP_AWARENESS_KEY  = "taleforge-loop-awareness";

export const loadLoopAwareness   = () => { const r = lsGet(LOOP_AWARENESS_KEY); return r ? JSON.parse(r) : { aware: false, level: 0, firstAwareAt: null }; };

export const saveLoopAwareness   = (l) => lsSet(LOOP_AWARENESS_KEY, JSON.stringify(l));


export const awakenLoopAwareness = (cycle) => {
  const la = loadLoopAwareness();
  const newLevel = cycle >= 20 ? 4 : cycle >= 15 ? 3 : cycle >= 10 ? 2 : cycle >= 7 ? 1 : 0;
  if (newLevel > (la.level || 0)) {
    la.level = newLevel;
    la.aware = newLevel > 0;
    if (!la.firstAwareAt && newLevel > 0) la.firstAwareAt = new Date().toISOString();
    saveLoopAwareness(la);
  }
  return { ...la, levelData: AWARENESS_LEVELS[la.level || 0] };
};

export const getLoopAwareness = () => {
  const cycle = loadCycleCount();
  if (cycle < 7) return null;
  const la = loadLoopAwareness();
  return { ...la, levelData: AWARENESS_LEVELS[la.level || 0] };
};

export const RIVAL_KEY  = "taleforge-rival";

export const loadRivals = () => { const r = lsGet(RIVAL_KEY); return r ? JSON.parse(r) : []; };

export const saveRivals = (rv) => lsSet(RIVAL_KEY, JSON.stringify(rv));


export const recordRival = (rivalName, rivalClass, lastPower, scenario) => {
  if (!rivalName) return;
  const rivals = loadRivals();
  const existing = rivals.find(r => r.name === rivalName);
  if (existing) {
    existing.encounters = (existing.encounters || 1) + 1;
    existing.power = Math.min(100, (existing.power || lastPower || 30) + 8);
    existing.evolved = existing.power >= 70;
  } else {
    rivals.push({ name: rivalName, class: rivalClass || "알 수 없음", power: lastPower || 30, encounters: 1, evolved: false, scenario: scenario || "", recordedAt: new Date().toISOString() });
  }
  saveRivals(rivals);
};

export const getRivals = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadRivals();
};

export const RED_THREAD_KEY  = "taleforge-red-thread";

export const loadRedThread   = () => { const r = lsGet(RED_THREAD_KEY); return r ? JSON.parse(r) : null; };

export const saveRedThread   = (t) => lsSet(RED_THREAD_KEY, JSON.stringify(t));


export const setRedThread = (npcName, bondStrength, scenario) => {
  if (!npcName) return;
  const existing = loadRedThread();
  if (existing && existing.bondStrength >= bondStrength) return; // 더 강한 인연만 갱신
  const strength = Math.min(4, Math.floor(bondStrength / 25) + 1);
  saveRedThread({ npcName, bondStrength, strength, fate: RED_THREAD_FATES[strength - 1], scenario: scenario || "", setAt: new Date().toISOString() });
};

export const getRedThread = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadRedThread();
};

export const RUINS_KEY  = "taleforge-ruins";

export const loadRuins  = () => { const r = lsGet(RUINS_KEY); return r ? JSON.parse(r) : []; };

export const saveRuins  = (ru) => lsSet(RUINS_KEY, JSON.stringify(ru));


export const recordRuin = (structureType, structureName, scenario) => {
  if (!structureType) return;
  const ruins = loadRuins();
  const def = RUIN_TYPES.find(r => r.id === structureType);
  if (!def) return;
  if (!ruins.find(r => r.id === structureType)) {
    ruins.push({ ...def, originalName: structureName || def.name, scenario: scenario || "", collapsed: true, restored: false, recordedAt: new Date().toISOString() });
  }
  // 개수 제한 없음 (전체 저장)
  saveRuins(ruins);
};

export const restoreRuin = (structureType) => {
  const ruins = loadRuins();
  const ruin = ruins.find(r => r.id === structureType);
  if (!ruin) return false;
  ruin.restored = true;
  ruin.restoredAt = new Date().toISOString();
  saveRuins(ruins);
  return ruin;
};

export const getRuins = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadRuins();
};

export const KILL_SENSE_KEY  = "taleforge-kill-sense";

export const loadKillSense   = () => { const r = lsGet(KILL_SENSE_KEY); return r ? JSON.parse(r) : { assassinDeaths: 0, level: 0 }; };

export const saveKillSense   = (k) => lsSet(KILL_SENSE_KEY, JSON.stringify(k));


export const recordAssassinDeath = () => {
  const ks = loadKillSense();
  ks.assassinDeaths = (ks.assassinDeaths || 0) + 1;
  ks.level = KILL_SENSE_LEVELS.reduce((acc, l) => ks.assassinDeaths >= l.deaths ? l.level : acc, 0);
  saveKillSense(ks);
  return ks;
};

export const getKillSenseStatus = () => {
  const ks = loadKillSense();
  return { ...ks, levelData: KILL_SENSE_LEVELS[ks.level || 0] };
};

export const GRUDGE_FLOWER_KEY  = "taleforge-grudge-flower";

export const loadGrudgeFlowers  = () => { const r = lsGet(GRUDGE_FLOWER_KEY); return r ? JSON.parse(r) : []; };

export const saveGrudgeFlowers  = (f) => lsSet(GRUDGE_FLOWER_KEY, JSON.stringify(f));


export const bloomGrudgeFlower = (enemyName, scenario) => {
  if (!enemyName) return;
  const flowers = loadGrudgeFlowers();
  if (!flowers.find(f => f.enemyName === enemyName)) {
    flowers.push({ enemyName, state: "blooming", scenario: scenario || "", bloomedAt: new Date().toISOString(), turnsWithered: 0 });
  }
  // 개수 제한 없음 (전체 저장)
  saveGrudgeFlowers(flowers);
};

export const avengeGrudgeFlower = (enemyName) => {
  const flowers = loadGrudgeFlowers();
  const flower = flowers.find(f => f.enemyName === enemyName);
  if (flower) { flower.state = "avenged"; flower.avengedAt = new Date().toISOString(); saveGrudgeFlowers(flowers); return true; }
  return false;
};

export const witherGrudgeFlowers = () => {
  const flowers = loadGrudgeFlowers();
  flowers.forEach(f => {
    if (f.state === "blooming") { f.turnsWithered = (f.turnsWithered || 0) + 1; if (f.turnsWithered >= 3) f.state = "withering"; }
    else if (f.state === "withering") { f.turnsWithered = (f.turnsWithered || 0) + 1; if (f.turnsWithered >= 6) f.state = "cursed"; }
  });
  saveGrudgeFlowers(flowers);
};

export const getGrudgeFlowers = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadGrudgeFlowers().map(f => ({ ...f, stateData: GRUDGE_FLOWER_STATES.find(s => s.state === f.state) }));
};

export const CURSED_CYCLE_KEY  = "taleforge-cursed-cycle";

export const loadCursedCycle   = () => { const r = lsGet(CURSED_CYCLE_KEY); return r ? JSON.parse(r) : { cursedCycles: [], currentlyCursed: false, overcame: 0 }; };

export const saveCursedCycle   = (c) => lsSet(CURSED_CYCLE_KEY, JSON.stringify(c));


export const checkCursedCycle = (cycle) => {
  // 7의 배수 또는 13의 배수 회차가 불운의 회차
  const isCursed = (cycle % 7 === 0 || cycle % 13 === 0) && cycle > 0;
  const cc = loadCursedCycle();
  cc.currentlyCursed = isCursed;
  if (isCursed && !cc.cursedCycles.includes(cycle)) cc.cursedCycles.push(cycle);
  saveCursedCycle(cc);
  return isCursed;
};

export const overcameCursedCycle = (cycle) => {
  const cc = loadCursedCycle();
  if (!cc.cursedCycles.includes(cycle)) return false;
  cc.overcame = (cc.overcame || 0) + 1;
  cc.lastOvercame = cycle;
  saveCursedCycle(cc);
  return true;
};

export const getCursedCycleStatus = () => {
  const cycle = loadCycleCount();
  const cc = loadCursedCycle();
  const isCursed = checkCursedCycle(cycle);
  return { ...cc, isCursed, legendaryReward: cc.overcame >= 3 ? "저주 극복자 칭호 + 전설급 아티팩트" : null };
};

export const FATE_MAGNET_KEY  = "taleforge-fate-magnet";

export const loadFateMagnet   = () => { const r = lsGet(FATE_MAGNET_KEY); return r ? JSON.parse(r) : { avoided: [], magnetStrength: 0 }; };

export const saveFateMagnet   = (m) => lsSet(FATE_MAGNET_KEY, JSON.stringify(m));


export const recordAvoidedFate = (eventType, scenario) => {
  if (!eventType) return;
  const fm = loadFateMagnet();
  fm.avoided = fm.avoided || [];
  const existing = fm.avoided.find(a => a.type === eventType);
  if (existing) {
    existing.avoidCount = (existing.avoidCount || 1) + 1;
    existing.magnetPull = Math.min(100, (existing.magnetPull || 10) + 15);
  } else {
    fm.avoided.push({ type: eventType, avoidCount: 1, magnetPull: 10, scenario: scenario || "", firstAvoided: new Date().toISOString() });
  }
  fm.magnetStrength = Math.min(100, fm.avoided.reduce((sum, a) => sum + (a.magnetPull || 0), 0) / fm.avoided.length);
  saveFateMagnet(fm);
};

export const getFateMagnet = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const fm = loadFateMagnet();
  const strongestPull = fm.avoided && fm.avoided.length > 0 ? fm.avoided.sort((a,b) => b.magnetPull - a.magnetPull)[0] : null;
  return { ...fm, strongestPull };
};

export const MEMORY_FLOOD_KEY  = "taleforge-memory-flood";

export const loadMemoryFlood   = () => { const r = lsGet(MEMORY_FLOOD_KEY); return r ? JSON.parse(r) : { floodCount: 0, lastResult: null }; };

export const saveMemoryFlood   = (f) => lsSet(MEMORY_FLOOD_KEY, JSON.stringify(f));


export const triggerMemoryFlood = (willStat, cycle) => {
  if (cycle < 10) return null;
  const mf = loadMemoryFlood();
  const result = willStat >= 70 ? "awakening" : willStat >= 40 ? "partial" : "madness";
  const outcomes = {
    awakening: { icon:"✨", label:"완전 각성",   effect:"모든 전생 기억이 선명해진다. 이번 회차 판정 +15 전체.", mentalCost:0 },
    partial:   { icon:"🌊", label:"부분 각성",   effect:"중요 기억만 떠오른다. 핵심 정보 3가지 획득.",          mentalCost:15 },
    madness:   { icon:"🌀", label:"정신 붕괴 위기", effect:"너무 많은 기억이 한꺼번에. 한 턴 행동 불능 위험.",  mentalCost:30 },
  };
  mf.floodCount = (mf.floodCount || 0) + 1;
  mf.lastResult = { result, outcome: outcomes[result], triggeredAt: new Date().toISOString(), cycle };
  saveMemoryFlood(mf);
  return mf.lastResult;
};

export const getMemoryFloodStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 10) return null;
  return loadMemoryFlood();
};

export const CAROUSEL_NPC_KEY  = "taleforge-carousel-npc";

export const loadCarouselNPC   = () => { const r = lsGet(CAROUSEL_NPC_KEY); return r ? JSON.parse(r) : { npcName: null, roles: [], currentRole: null }; };

export const saveCarouselNPC   = (n) => lsSet(CAROUSEL_NPC_KEY, JSON.stringify(n));


export const assignCarouselRole = (npcName, cycle) => {
  const cn = loadCarouselNPC();
  if (!cn.npcName && npcName) cn.npcName = npcName;
  const roleIdx = cycle % CAROUSEL_ROLES.length;
  const role = CAROUSEL_ROLES[roleIdx];
  cn.currentRole = { ...role, cycle, assignedAt: new Date().toISOString() };
  cn.roles = cn.roles || [];
  cn.roles.push({ ...role, cycle });
  // 개수 제한 없음 (전체 저장)
  saveCarouselNPC(cn);
  return role;
};

export const getCarouselNPC = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const cn = loadCarouselNPC();
  if (!cn.currentRole) assignCarouselRole(null, cycle);
  return loadCarouselNPC();
};

export const FATE_TRAP_KEY  = "taleforge-fate-trap";

export const loadFateTraps  = () => { const r = lsGet(FATE_TRAP_KEY); return r ? JSON.parse(r) : { patterns: {}, activeTraps: [] }; };

export const saveFateTraps  = (t) => lsSet(FATE_TRAP_KEY, JSON.stringify(t));


export const recordActionPattern = (patternId) => {
  if (!patternId) return;
  const ft = loadFateTraps();
  ft.patterns = ft.patterns || {};
  ft.patterns[patternId] = (ft.patterns[patternId] || 0) + 1;
  if (ft.patterns[patternId] >= 3) {
    const trap = TRAP_PATTERNS.find(p => p.id === patternId);
    if (trap && !ft.activeTraps.find(t => t.id === patternId)) {
      ft.activeTraps = ft.activeTraps || [];
      ft.activeTraps.push({ ...trap, activatedAt: new Date().toISOString() });
    }
  }
  saveFateTraps(ft);
};

export const getFateTraps = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadFateTraps();
};

export const MENTAL_CORRUPTION_KEY  = "taleforge-mental-corruption";

export const loadMentalCorruption   = () => { const r = lsGet(MENTAL_CORRUPTION_KEY); return r ? JSON.parse(r) : { level: 0, symptoms: [], cured: 0 }; };

export const saveMentalCorruption   = (m) => lsSet(MENTAL_CORRUPTION_KEY, JSON.stringify(m));

export const clearMentalCorruption  = () => lsDel(MENTAL_CORRUPTION_KEY);

export const ELEMENTAL_SYSTEM_KEY = 'tf-elemental-system';

export const loadElementalSystem = () => {
  try {
    const raw = lsGet(ELEMENTAL_SYSTEM_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return {
    points: 0,           // 공명도 0~1000
    stage: 0,            // 현재 단계 0~7
    element: null,       // 'fire'|'water'|'wind'|'earth' — null=미선택
    restraint: 100,      // 감정 억제도 0~100
    taboo: 0,            // 금기 위반 횟수
    resonance: {fire:0, water:0, wind:0, earth:0}, // 원소별 친화도 누적
    surgeCount: 0,       // 원소 폭발 횟수
    history: [],
    purifyCount: 0,
    awakened: false,
    elementChangedOnce: false
  };
};

export const saveElementalSystem = (d) => { try { lsSet(ELEMENTAL_SYSTEM_KEY, JSON.stringify(d)); } catch(e){} };

export const clearElementalSystem = () => lsDel(ELEMENTAL_SYSTEM_KEY);

export const ELEMENTAL_AWAKENING_STAGES = [
  {
    stage: 0, name: '이질의 씨앗', icon: '🌫️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8 C5 8 5 6 7 6 C9 6 9 8 11 8 C13 8 13 6 15 6 C17 6 17 8 19 8 M3 13 C5 13 5 11 7 11 C9 11 9 13 11 13 C13 13 13 11 15 11 C17 11 17 13 19 13 M3 18 C5 18 5 16 7 16 C9 16 9 18 11 18 C13 18 13 16 15 16 C17 16 17 18 19 18" stroke-width="1.2"/></svg>`,
    color: '#606060', threshold: 0,
    desc: '원소가 체내에 이질적으로 잠들어 있다. 아직 반응하지 않는다.',
    statBonus: {}, statPenalty: {},
    skills: [],
    aura: '원소의 기운이 희미하다. 마법사들이 감지하려 살핀다.',
    aiHint: ''
  },
  {
    stage: 1, name: '눈뜨는 불씨', icon: '✨', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L13.5 8.5 L20 7 L15 12 L18 18.5 L12 15 L6 18.5 L9 12 L4 7 L10.5 8.5 Z" stroke-width="1.3"/></svg>`,
    color: '#40b080', threshold: 80,
    desc: '원소가 감정에 반응하기 시작했다. 같은 원소인끼리 유대를 느낀다.',
    statBonus: { mgc: 6, per: 4 }, statPenalty: {},
    skills: [
      { id:'ea_s1_sense', name:'원소 감지', icon:'👁️', type:'passive', rarity:'uncommon',
        desc:'주변 원소의 흐름을 본능적으로 감지한다. PER +10, 함정·매복 탐지 확률 +20%.',
        mpCost:0, condition:'always', conditionDesc:'항시 발동',
        statBoost:{per:80} }
    ],
    aura: '피부 아래에서 원소가 희미하게 빛난다. 엘프·드루이드가 관심을 보인다.',
    aiHint: '1단계 각성: 강한 감정 시 피부 아래에서 원소 에너지가 희미하게 빛나는 묘사를 포함하라.'
  },
  {
    stage: 2, name: '살아있는 원소', icon: '🌊', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 C2 12 5 9 8 12 C11 15 13 12 16 12 C19 12 22 9 22 9 M2 17 C2 17 5 14 8 17 C11 20 13 17 16 17 C19 17 22 14 22 14" stroke-width="1.4"/></svg>`,
    color: '#40c090', threshold: 200,
    desc: '원소가 나의 일부가 되었다. 원소 스킬의 위력이 크게 오른다.',
    statBonus: { mgc: 14, per: 9, int: 6 }, statPenalty: { neg: -4 },
    skills: [
      { id:'ea_s2_pulse', name:'원소 맥동', icon:'💫', type:'active', rarity:'rare',
        desc:'MP 15. 원소 에너지를 맥동시켜 주변 적 전체에 속성 피해. 같은 원소 NPC 아군화 시도.',
        mpCost:15, condition:null, conditionDesc:null, statBoost:{} },
      { id:'ea_s2_shield', name:'원소 보호막', icon:'🛡️', type:'passive', rarity:'rare',
        desc:'원소로 된 보호막이 자동 생성. 물리 피해 15% 감소. END +8.',
        mpCost:0, condition:'always', conditionDesc:'항시 발동', statBoost:{end:64} }
    ],
    aura: '원소 스킬 시전 시 몸의 일부가 원소 형태로 변한다. 정령들이 동족으로 인정한다.',
    aiHint: '2단계 각성: 원소 스킬 사용 시 팔·눈 등 신체 일부가 원소 형태로 변하는 묘사를 포함하라. 같은 원소 NPC들이 본능적으로 유대감을 느낀다.'
  },
  {
    stage: 3, name: '원소의 화신', icon: '⚡', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 L6 13 L11 13 L10 22 L18 10 L13 10 Z" stroke-linejoin="round"/></svg>`,
    color: '#30d0a0', threshold: 400,
    desc: '원소가 존재의 일부다. 원소 정령들이 자발적으로 돕는다.',
    statBonus: { mgc: 24, per: 16, int: 12, wil: 8 }, statPenalty: { neg: -8, trst: -4 },
    skills: [
      { id:'ea_s3_avatar', name:'원소 화신', icon:'🌀', type:'active', rarity:'epic',
        desc:'MP 25. 3턴간 원소 형태로 변신. 해당 원소 피해 완전 면역, MGC·STR +15.',
        mpCost:25, condition:null, conditionDesc:null, statBoost:{} },
      { id:'ea_s3_surge', name:'감정 폭발 방출', icon:'💥', type:'passive', rarity:'epic',
        desc:'감정이 격해질 때 원소가 자동 폭발. 적 전체 STR -10. 억제도 30 이하 시 자동 발동.',
        mpCost:0, condition:'restraint_low', conditionDesc:'억제도 30↓ 시', statBoost:{mgc:120,fear:80} }
    ],
    aura: '감정 변화에 따라 주변 원소가 자동 반응한다. 눈동자가 원소 색으로 빛난다.',
    aiHint: '3단계 각성: 감정 변화에 따라 주변 원소(불꽃·물·바람·대지)가 자동으로 반응한다. 화가 나면 불꽃, 슬프면 비, 기쁘면 바람처럼. 이 묘사를 자연스럽게 포함하라.'
  },
  {
    stage: 4, name: '원소와 대화', icon: '🌀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M12 3 C12 3 17 7 17 12 C17 17 12 21 12 21 C12 21 7 17 7 12 C7 7 12 3 12 3 Z" stroke-width="1.1"/></svg>`,
    color: '#20e0b0', threshold: 600,
    desc: '원소의 목소리가 들린다. 내면의 신이 지혜를 속삭인다.',
    statBonus: { mgc: 36, per: 24, int: 18, wil: 14, luk: 8 }, statPenalty: { neg: -12, trst: -8 },
    skills: [
      { id:'ea_s4_whisper', name:'원소의 계시', icon:'🔮', type:'event', rarity:'legendary',
        desc:'원소가 중요한 선택 앞에서 미래를 속삭인다. 판정 대성공 확률 +25%. INT +12.',
        mpCost:0, condition:'always', conditionDesc:'항시 발동', statBoost:{int:96, per:80} },
      { id:'ea_s4_dominion', name:'원소 지배', icon:'👑', type:'active', rarity:'legendary',
        desc:'MP 40. 주변 원소를 완전히 지배. 원소 속성 지형 생성, 적 이동 봉쇄. 5턴 지속.',
        mpCost:40, condition:null, conditionDesc:null, statBoost:{} }
    ],
    aura: '원소 신전 성직자들이 순례를 요청한다. 원소 관련 퀘스트가 자동 해금된다.',
    aiHint: '4단계 각성: 원소가 마치 내면의 신처럼 중요한 순간에 지혜를 속삭인다. "원소가 경고한다—그 길은 위험하다" 같은 묘사를 포함하라. 원소 정령들이 자발적으로 섬긴다.'
  },
  {
    stage: 5, name: '원소의 사도', icon: '🌟', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></svg>`,
    color: '#10f0c0', threshold: 750,
    desc: '원소 세계의 사도. 세계의 원소 흐름이 이 존재를 인식한다.',
    statBonus: { mgc: 50, per: 34, int: 26, wil: 20, luk: 12, str: 10 }, statPenalty: { neg: -16, trst: -12 },
    skills: [
      { id:'ea_s5_world_pulse', name:'세계 원소 연결', icon:'🌐', type:'passive', rarity:'legendary',
        desc:'세계 모든 원소와 연결됨. 현 위치 원소 지형 파악, 원소 적 약점 자동 감지. MGC +18.',
        mpCost:0, condition:'always', conditionDesc:'항시 발동', statBoost:{mgc:144, per:112} },
      { id:'ea_s5_contract', name:'원소 계약', icon:'📜', type:'event', rarity:'legendary',
        desc:'원소 정령과 공식 계약. 전투 중 정령 자동 소환(2체). 계약 파기 시 능력 일시 봉인.',
        mpCost:0, condition:'activate', conditionDesc:'직접 발동', statBoost:{} }
    ],
    aura: '살아있는 마법 원소로 불린다. 원소 신전이 본부로 개방된다. 고룡·정령왕이 주목한다.',
    aiHint: '5단계 각성: 이 인물이 존재하는 곳의 원소 환경이 미세하게 변화한다. 건조한 땅에 물기가 돌거나, 무풍지대에 바람이 인다. 세계가 이 존재를 인식하기 시작했다.'
  },
  {
    stage: 6, name: '원소 군주', icon: '⚡🌀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" stroke-width="1.3"/><path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12" stroke-width="1.3"/><path d="M5 5 L8 8 M16 16 L19 19 M19 5 L16 8 M8 16 L5 19" stroke-width="1.1"/></svg>`,
    color: '#00ffd0', threshold: 900,
    desc: '원소 세계의 지배자. 여러 원소를 동시에 다루며 자연현상을 일으킨다.',
    statBonus: { mgc: 68, per: 46, int: 36, wil: 28, luk: 18, str: 18, end: 14 }, statPenalty: { neg: -20, trst: -18 },
    skills: [
      { id:'ea_s6_storm', name:'원소 폭풍', icon:'🌪️', type:'active', rarity:'legendary',
        desc:'MP 55. 모든 원소를 합친 광역 폭풍. 적 전체 최대 HP 30% 피해. 3속성 동시 적용.',
        mpCost:55, condition:null, conditionDesc:null, statBoost:{} },
      { id:'ea_s6_law', name:'원소의 법칙', icon:'⚖️', type:'passive', rarity:'legendary',
        desc:'원소 세계의 법칙이 됨. 모든 원소 피해 면역+흡수. 사망 시 원소 폭발로 부활(1회/회차).',
        mpCost:0, condition:'always', conditionDesc:'항시 발동', statBoost:{mgc:480, per:320, end:240} }
    ],
    aura: '날씨가 의지에 따라 변한다. 원소인 종족 전체의 지도자로 인정받는다. 고룡들이 경의를 표한다.',
    aiHint: '6단계 각성: 원소 군주 상태. 이 인물 주변의 날씨와 지형이 감정에 따라 변한다. 분노하면 폭풍, 슬프면 폭우, 기쁘면 화창한 하늘. 신들도 이 존재의 이름을 기록한다.'
  },
  {
    stage: 7, name: '원소의 계약자', icon: '🔱', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14 8 L20 6 L16 11 L20 16 L14 14 L12 20 L10 14 L4 16 L8 11 L4 6 L10 8 Z" stroke-linejoin="round"/></svg>`,
    color: '#00ffee', threshold: 1000,
    desc: '원소 자체와 동등한 계약을 맺었다. 창조와 파괴가 하나가 된 존재.',
    statBonus: { mgc: 90, per: 60, int: 50, wil: 40, luk: 26, str: 28, end: 22 }, statPenalty: {},
    skills: [
      { id:'ea_s7_genesis', name:'원소 창세', icon:'🔱', type:'active', rarity:'legendary',
        desc:'HP 60 소모. 원소의 시원을 재현. 전장 원소 법칙 완전 재설정. 적 전체 즉사 판정(저항 가능). 아군 모든 원소 피해 흡수(5턴).',
        mpCost:0, condition:null, conditionDesc:null, statBoost:{} },
      { id:'ea_s7_infinite', name:'원소 불멸', icon:'♾️', type:'passive', rarity:'legendary',
        desc:'원소의 법칙 자체가 됨. 판정 항상 대성공. 모든 원소 피해 흡수·역반사. HP+25 재생. 매 턴 MP+8.',
        mpCost:0, condition:'always', conditionDesc:'항시 발동',
        statBoost:{mgc:720, per:480, int:400, wil:320, str:200, end:200} }
    ],
    aura: '우주의 원소가 이 존재를 주재자로 인정한다. 창조와 소멸의 이분법이 이 존재 안에서 하나로 통합된다.',
    aiHint: '7단계 각성: 완전한 원소 계약자. 원소가 이 존재의 의지 자체가 됐다. 생각하는 것이 곧 원소 현상으로 나타난다. 신들과 고룡들이 동등한 존재로 인정한다.'
  }
];

export const ELEM_RESTRAINT_STAGES = [
  { min:0,  max:19,  name:'폭발 직전', icon:'💥', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14 9 L21 9.5 L15.5 14 L17.5 21 L12 17 L6.5 21 L8.5 14 L3 9.5 L10 9 Z" stroke-linejoin="round"/><path d="M4 4 L20 20 M20 4 L4 20" stroke-width="1"/></svg>`, color:'#ff3030', combatBoost:'+80% 전투력', penalty:'즉시 원소 폭발 위험' },
  { min:20, max:39,  name:'위험 상태', icon:'⚠️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L22 20 L2 20 Z" stroke-linejoin="round"/><path d="M12 9 L12 14 M12 16.5 L12 17" stroke-width="1.6"/></svg>`, color:'#ff8020', combatBoost:'+40% 전투력', penalty:'스킬 부작용 15% 확률' },
  { min:40, max:59,  name:'긴장 상태', icon:'😤', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 C4 12 8 9 12 12 C16 15 20 12 20 12" stroke-width="1.4"/><path d="M4 17 C4 17 8 14 12 17 C16 20 20 17 20 17" stroke-width="1.4"/></svg>`, color:'#e0a020', combatBoost:'+15% 전투력', penalty:'사회적 불이익' },
  { min:60, max:79,  name:'안정 상태', icon:'😌', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" stroke-width="1.3"/><path d="M8.5 12 L11 14.5 L15.5 9" stroke-width="1.4"/></svg>`, color:'#60c060', combatBoost:'기본', penalty:'없음' },
  { min:80, max:100, name:'완전 통제', icon:'🧘', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6" stroke-width="1.3"/><path d="M12 8 L12 3 M9.5 4.5 L12 2 L14.5 4.5" stroke-width="1.2"/></svg>`, color:'#40e0a0', combatBoost:'스킬 효율 +25%', penalty:'없음' },
];

export function getElemAwakeningStage(points) {
  const stages = ELEMENTAL_AWAKENING_STAGES;
  for (let i = stages.length - 1; i >= 0; i--) {
    if (points >= stages[i].threshold) return stages[i];
  }
  return stages[0];
}
window.getElemAwakeningStage = getElemAwakeningStage;

export function getElemRestraintStage(restraint) {
  for (const s of ELEM_RESTRAINT_STAGES) {
    if (restraint >= s.min && restraint <= s.max) return s;
  }
  return ELEM_RESTRAINT_STAGES[4];
}
window.getElemRestraintStage = getElemRestraintStage;

export function getElemAwakeningStatus() {
  const race = S.character?.race || '';
  if (!race.includes('원소') && !race.includes('elemental')) return null;
  const es = loadElementalSystem();
  const stageDef = getElemAwakeningStage(es.points);
  const nextIdx = stageDef.stage + 1;
  const nextStage = nextIdx < ELEMENTAL_AWAKENING_STAGES.length ? ELEMENTAL_AWAKENING_STAGES[nextIdx] : null;
  return { ...es, stageDef, nextStage };
}
window.getElemAwakeningStatus = getElemAwakeningStatus;

export function gainElemResonance(actType, customGain) {
  const race = S.character?.race || '';
  if (!race.includes('원소') && !race.includes('elemental')) return;
  const es = loadElementalSystem();
  const actDef = ELEMENTAL_ACT_GAIN[actType];
  const gain = customGain !== undefined ? customGain : (actDef?.gain || 15);
  const prev = es.points;
  es.points = Math.max(0, Math.min(1000, (es.points || 0) + gain));
  // 원소별 친화도 누적
  if (es.element) es.resonance[es.element] = (es.resonance[es.element] || 0) + gain;
  es.history = (es.history || []).concat([{
    icon: actDef?.icon || '✨', label: actDef?.label || '행동', gain,
    total: es.points, at: new Date().toISOString().slice(0,16)
  }]).slice(-30);
  // 단계 변화 감지
  const prevStage = getElemAwakeningStage(prev);
  const newStage  = getElemAwakeningStage(es.points);
  if (prevStage.stage !== newStage.stage) {
    showToast(`🌀 원소각성 단계 상승! ${newStage.icon} ${newStage.name} (${newStage.stage}단계)`, 4000);
    // 스킬 자동 해금
    newStage.skills.forEach(sk => {
      if (!S.unlockedSkills[sk.id]) {
        S.unlockedSkills[sk.id] = true;
        setTimeout(() => showToast(`🔓 원소 스킬 해금: ${sk.icon} ${sk.name}`, 3000), 1500);
      }
    });
    if (newStage.stage === 7) showToast('🔱 원소와의 완전한 계약 달성! 원소 창세 퀘스트 해금!', 5000);
  }
  saveElementalSystem(es);
  applyElementalSystemStats();
}
window.gainElemResonance = gainElemResonance;

export function elemTabooViolation(actType) {
  const race = S.character?.race || '';
  if (!race.includes('원소') && !race.includes('elemental')) return;
  const es = loadElementalSystem();
  const actDef = ELEMENTAL_TABOO_ACTS[actType];
  if (!actDef) return;
  const damage = actDef.damage;
  const prev = es.points;
  es.points = Math.max(0, (es.points || 0) - damage);
  es.taboo = (es.taboo || 0) + 1;
  es.history = (es.history || []).concat([{
    icon: actDef.icon, label: `[금기] ${actDef.label}`, gain: -damage,
    total: es.points, at: new Date().toISOString().slice(0,16)
  }]).slice(-30);
  const prevStage = getElemAwakeningStage(prev);
  const newStage  = getElemAwakeningStage(es.points);
  showToast(`⚠️ 원소 금기! [${actDef.label}] 공명도 -${damage} (현재: ${es.points})`, 3500);
  if (prevStage.stage !== newStage.stage) {
    showToast(`🔴 원소각성 단계 하락: ${newStage.icon} ${newStage.name}`, 3000);
  }
  // 금기 누적에 따른 원소 NPC 반응 힌트
  if (es.taboo >= 5) showToast('🌿 원소 정령들이 등을 돌리기 시작한다... 엘프 관계도 하락.', 3000);
  if (es.taboo >= 15) showToast('☠️ 원소로부터 버림받기 직전. 핵심 원소 스킬이 봉인될 수 있다!', 4000);
  saveElementalSystem(es);
  applyElementalSystemStats();
}
window.elemTabooViolation = elemTabooViolation;

export function shiftElemRestraint(amount) {
  const race = S.character?.race || '';
  if (!race.includes('원소') && !race.includes('elemental')) return;
  const es = loadElementalSystem();
  const prev = es.restraint;
  es.restraint = Math.max(0, Math.min(100, (es.restraint || 100) + amount));
  if (es.restraint <= 0 && prev > 0) {
    // 원소 폭발!
    es.surgeCount = (es.surgeCount || 0) + 1;
    es.restraint = 25;
    showToast(`💥 원소 폭발! (${es.surgeCount}회째) — 감정이 폭발하며 원소가 쏟아진다!`, 4000);
    elemTabooViolation('lose_control');
    es.restraint = 25; // 폭발 후 리셋
  }
  saveElementalSystem(es);
}
window.shiftElemRestraint = shiftElemRestraint;

export function setElementalType(type) {
  if (!ELEMENTAL_TYPES[type]) return;
  const es = loadElementalSystem();
  if (es.element && es.element !== type) {
    if (!es.elementChangedOnce) {
      es.elementChangedOnce = true;
      es.points = Math.max(0, es.points - 200); // 속성 전환 시 공명도 -200
      showToast(`⚡ 정체성 위기! 속성 전환: ${ELEMENTAL_TYPES[es.element].icon}→${ELEMENTAL_TYPES[type].icon} 공명도 -200`, 5000);
    } else {
      showToast('⛔ 속성 변환은 생애 단 한 번만 가능합니다.', 3000);
      return;
    }
  }
  es.element = type;
  saveElementalSystem(es);
  const et = ELEMENTAL_TYPES[type];
  showToast(`${et.icon} 원소 속성: ${et.name} 선택됨`, 2500);
  applyElementalSystemStats();
  renderElementalSystemPanel();
}
window.setElementalType = setElementalType;

export function elemRestore(methodId) {
  const method = ELEMENTAL_RESTORE_METHODS.find(m => m.id === methodId);
  if (!method) return;
  const es = loadElementalSystem();
  if (method.cost.gold && S.gold < method.cost.gold) { showToast(`골드 부족 (필요: ${method.cost.gold}G)`); return; }
  if (method.cost.hp && (S.stats?.hp || 100) <= method.cost.hp + 10) { showToast('HP가 너무 낮습니다'); return; }
  if (method.cost.gold) { S.gold -= method.cost.gold; saveGold && saveGold(S.gold); }
  if (method.cost.hp) { if(S.stats) S.stats.hp = Math.max(1, (S.stats.hp || 100) - method.cost.hp); }
  es.purifyCount = (es.purifyCount || 0) + 1;
  // 억제도 회복
  if (methodId === 'restore_nature') es.restraint = Math.min(100, (es.restraint||80) + 20);
  if (methodId === 'restore_temple') {
    es.taboo = Math.max(0, (es.taboo||0) - 2);
    es.restraint = Math.min(100, (es.restraint||80) + 30);
  }
  saveElementalSystem(es);
  gainElemResonance(null, method.restore);
  showToast(`✨ ${method.name} — 공명도 +${method.restore}`, 3000);
  window.updateHeader && window.updateHeader();
  renderElementalSystemPanel();
}
window.elemRestore = elemRestore;

export function applyElementalSystemStats() {
  const race = S.character?.race || '';
  if (!race.includes('원소') && !race.includes('elemental')) return;
  const es = loadElementalSystem();
  const prev = S._elementalBonus || {};
  const newBonus = {};
  const stageDef = getElemAwakeningStage(es.points);
  // 단계 스탯 보너스
  Object.entries(stageDef.statBonus || {}).forEach(([k,v]) => newBonus[k] = (newBonus[k]||0)+v);
  Object.entries(stageDef.statPenalty || {}).forEach(([k,v]) => newBonus[k] = (newBonus[k]||0)+v);
  // 원소 속성 보너스
  if (es.element && ELEMENTAL_TYPES[es.element]) {
    const et = ELEMENTAL_TYPES[es.element];
    Object.entries(et.boost||{}).forEach(([k,v]) => newBonus[k] = (newBonus[k]||0)+v);
    Object.entries(et.weak||{}).forEach(([k,v]) => newBonus[k] = (newBonus[k]||0)+v);
  }
  // 억제도 낮으면 전투 부스트
  if (es.restraint < 40) {
    const surgeBoost = Math.floor((40 - es.restraint) * 0.8);
    newBonus.str = (newBonus.str||0) + surgeBoost;
    newBonus.mgc = (newBonus.mgc||0) + surgeBoost;
    newBonus.fear = (newBonus.fear||0) + Math.floor(surgeBoost * 0.5);
  } else if (es.restraint >= 80) {
    // 완전 통제 시 스킬 효율 보너스
    newBonus.mgc = (newBonus.mgc||0) + 8;
    newBonus.per = (newBonus.per||0) + 5;
  }
  // 금기 페널티
  if (es.taboo >= 5) {
    const pen = Math.floor(es.taboo / 5) * 3;
    newBonus.mgc = (newBonus.mgc||0) - pen;
    newBonus.per = (newBonus.per||0) - pen;
  }
  // 스탯 반영
  if (S.character?.stats) {
    for (const [k,v] of Object.entries(prev)) { if (S.character.stats[k] !== undefined) S.character.stats[k] -= v; }
    for (const [k,v] of Object.entries(newBonus)) { if (S.character.stats[k] !== undefined) S.character.stats[k] = Math.max(0, (S.character.stats[k]||0)+v); }
  }
  S._elementalBonus = newBonus;
}
window.applyElementalSystemStats = applyElementalSystemStats;

export function renderElementalSystemPanel() {
  const body = document.getElementById('pb-elemental-system');
  if (!body) return;
  const status = getElemAwakeningStatus();
  if (!status) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">🌀</div>
      <div>원소인 캐릭터에게만 활성화됩니다.</div>
      <div style="margin-top:6px;font-size:10px">캐릭터 설정에서 종족을 원소인으로 선택하세요.</div>
    </div>`;
    return;
  }
  const es = status;
  const stg = es.stageDef;
  const nextStg = es.nextStage;
  const color = stg.color;
  const et = es.element ? ELEMENTAL_TYPES[es.element] : null;
  const restStg = getElemRestraintStage(es.restraint);
  const stageSkills = ELEMENTAL_AWAKENING_STAGES.slice(0, stg.stage + 1).flatMap(s => s.skills);

  body.innerHTML = `
    <!-- ══ 로어 인용 ══ -->
    <div style="padding:10px 14px;background:linear-gradient(135deg,#000a08,#001510);border-bottom:2px solid ${color}">
      <div style="font-size:11px;color:#406050;font-style:italic;line-height:1.6;margin-bottom:10px">
        "자신의 원소를 '내면의 신'처럼 섬긴다. 감정이 격해지면 피부 아래서 원소가 빛나거나 흘러넘친다."
      </div>
      <!-- 현재 단계 헤더 -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:${color}">${es.points}<span style="font-size:9px;color:#406050"> / 1000</span></div>
          <div style="font-size:8px;color:#406050">공명도</div>
        </div>
      </div>
      <div style="height:6px;background:#001008;border-radius:3px;overflow:hidden;margin-bottom:4px">
        <div style="width:${Math.min(100, Math.round(es.points/10))}%;height:100%;background:linear-gradient(90deg,#20a060,${color});border-radius:3px;transition:width .4s"></div>
      </div>
      ${nextStg ? `
        <div style="display:flex;justify-content:space-between;font-size:8px;color:#406050">
          <span>현재: ${es.points}</span><span>다음 단계 (${nextStg.name}): ${nextStg.threshold}</span>
        </div>` : `<div style="font-size:8px;color:${color};text-align:center">⚠️ 최고 공명 단계 도달</div>`}
      <div style="margin-top:8px;font-size:10px;color:#508070;line-height:1.6;font-style:italic">"${stg.desc}"</div>
    </div>

    <!-- ══ 원소 속성 ══ -->
    <div style="padding:10px 12px;border-bottom:1px solid #0a1a10">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 원소 속성 ──</div>
      ${!es.element
        ? '<div style="font-size:9px;color:#506050;margin-bottom:8px">내면의 원소를 선택하세요. 이 선택은 되돌릴 수 없습니다.</div>'
        : '<div style="font-size:9px;color:#3a5040;margin-bottom:8px">원소 속성은 각성 시 영구히 결정됩니다. 변경 불가.</div>'
      }
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:6px">
        ${Object.entries(ELEMENTAL_TYPES).map(([k,v]) => {
          const isSelected = es.element===k;
          const isLocked = !!es.element && !isSelected;
          return `<button onclick="${!es.element ? `setElementalType('${k}');renderElementalSystemPanel()` : ''}"
            style="padding:7px 5px;background:${isSelected ? v.bg : '#060a06'};border:1px solid ${isSelected ? v.color : '#1a2a1a'};color:${isLocked ? '#2a3a2a' : v.color};font-size:9px;cursor:${es.element ? 'default' : 'pointer'};text-align:left;border-radius:2px;opacity:${isLocked?'0.35':'1'}">
            <div style="font-size:12px;margin-bottom:2px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(v,{size:12}):(v.icon)}</div>
            <div style="font-family:'Cinzel',serif;font-size:9px">${v.name}</div>
            <div style="font-size:7px;color:#4a5a4a;margin-top:1px">${v.boost ? Object.entries(v.boost).slice(0,2).map(([kk,vv])=>kk.toUpperCase()+' +'+vv).join(' · ') : ''}</div>
            ${isSelected ? `<div style="font-size:7px;color:${v.color};margin-top:2px">● 선택됨</div>` : ''}
          </button>`;
        }).join('')}
      </div>
      ${et ? `<div style="padding:6px 8px;background:${et.bg};border:1px solid ${et.border};border-radius:2px;font-size:8px;color:${et.color}">
        약점: ${et.weakEnv} · 친화: ${et.affinity}</div>` : ''}
    </div>

    <!-- ══ 감정 억제도 ══ -->
    <div style="padding:10px 12px;border-bottom:1px solid #0a1a10">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 감정 억제도 ──</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="color:${restStg.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(restStg,{size:16}):(restStg.svgIcon||restStg.icon)}</span>
        <div style="flex:1">
          <span style="font-family:'Cinzel',serif;font-size:10px;color:${restStg.color}">${restStg.name}</span>
          <span style="font-size:8px;color:#4a6050;margin-left:6px">${restStg.combatBoost}</span>
        </div>
        <span style="font-family:'Cinzel',serif;font-size:12px;color:${restStg.color}">${es.restraint}/100</span>
      </div>
      <div style="height:8px;background:#050f08;border-radius:3px;overflow:hidden;margin-bottom:5px">
        <div style="width:${es.restraint}%;height:100%;background:linear-gradient(90deg,${restStg.color}88,${restStg.color});transition:width .3s;border-radius:3px"></div>
      </div>
      ${es.restraint < 40 ? `<div style="padding:5px 8px;background:#150500;border:1px solid #6a1000;font-size:9px;color:#e04020;margin-bottom:6px">⚠️ 원소 폭발 위험! 억제도 0 도달 시 자동 폭발 — 전투력 폭증하지만 환경 파괴</div>` : ''}
      <div style="padding:5px 8px;background:#030c06;border:1px dashed #1a3020;border-radius:2px;font-size:9px;color:#3a6050">
        💡 억제도는 감정적 행동(격정·폭발)으로 낮아지고, 명상·자연 속 휴식 행동으로 회복됩니다
      </div>
    </div>

    <!-- ══ 단계별 스탯 효과 ══ -->
    <div style="padding:10px 12px;border-bottom:1px solid #0a1a10">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 원소각성 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(stg.statBonus||{}).map(([k,v])=>`
          <div style="padding:3px 7px;background:#030f08;border:1px solid #0a2a14;border-radius:2px;font-size:9px">
            <span style="color:${color}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:4px">+${v}</span>
          </div>`).join('')}
        ${Object.entries(stg.statPenalty||{}).map(([k,v])=>`
          <div style="padding:3px 7px;background:#0f0803;border:1px solid #2a1a0a;border-radius:2px;font-size:9px">
            <span style="color:#a08060">${k.toUpperCase()}</span><span style="color:#e08040;margin-left:4px">${v}</span>
          </div>`).join('')}
        ${et ? Object.entries(et.boost||{}).map(([k,v])=>`
          <div style="padding:3px 7px;background:#020a08;border:1px solid ${et.border};border-radius:2px;font-size:9px">
            <span style="color:${et.color}">${k.toUpperCase()} ${typeof getEntityIconHTML==='function'?getEntityIconHTML(et,{size:16}):(et.icon)}</span><span style="color:#60d060;margin-left:4px">+${v}</span>
          </div>`).join('') : ''}
      </div>
    </div>

    <!-- ══ 원소각성 단계 진행 ══ -->
    <div style="padding:10px 12px;border-bottom:1px solid #0a1a10">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 원소각성 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${ELEMENTAL_AWAKENING_STAGES.map((s,i) => {
          const active = i === stg.stage;
          const passed = i < stg.stage;
          const c = s.color;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#001a10':passed?'#000e08':'#000a05'};border:1px solid ${active?c:passed?c+'44':'#0a1a10'};border-radius:2px;opacity:${active?1:passed?0.7:0.35}">
            <span style="display:inline-flex;width:12px;height:12px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:12}):((s.svgIcon||'').replace('width="20" height="20"','width="12" height="12"')||s.icon)}</span>
            <div style="flex:1">
              <span style="font-family:'Cinzel',serif;font-size:9px;color:${active?c:passed?c:'#3a5a3a'}">${s.name}</span>
              <span style="font-size:8px;color:#3a5a3a;margin-left:5px">(${s.threshold})</span>
            </div>
            ${s.skills.length ? `<span style="font-size:7px;color:${active||passed?c:'#304030'}">${s.skills.map(sk=>typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:12}):sk.icon).join('')}</span>` : ''}
            ${active ? `<span style="font-size:8px;color:${c};font-family:'Cinzel',serif">◀ 현재</span>` : ''}
            ${passed ? `<span style="font-size:9px;color:${c}">✓</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ══ 해금 스킬 ══ -->
    ${stageSkills.length ? `
    <div style="padding:10px 12px;border-bottom:1px solid #0a1a10">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 원소 전용 스킬 ──</div>
      ${stageSkills.map(sk => {
        const unlocked = !!S.unlockedSkills?.[sk.id];
        return `<div style="padding:7px 9px;background:${unlocked?'#001510':'#000a06'};border:1px solid ${unlocked?color+'55':'#0a1a10'};margin-bottom:4px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:10px;color:${color}">${sk.name}</span>
            <span style="font-size:8px;padding:1px 5px;background:${color}22;color:${color};border:1px solid ${color}44;border-radius:2px;margin-left:auto">${sk.rarity}</span>
            ${unlocked ? '<span style="font-size:9px;color:#60d060">✓</span>' : '<span style="font-size:9px;color:#3a5a3a">🔒</span>'}
          </div>
          <div style="font-size:9px;color:#507060;line-height:1.5">${sk.desc}</div>
          ${sk.mpCost ? `<div style="font-size:8px;color:#304a38;margin-top:2px">MP ${sk.mpCost} 소모</div>` : ''}
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- ══ 원소 행동 자동 전용 ══ -->
    <div style="padding:8px 12px;border-bottom:1px solid #0a1a10">
      <div style="font-size:9px;color:#305040;font-style:italic;text-align:center;padding:4px 0">🌀 원소 공명은 AI 서사에서 자동으로 쌓입니다</div>
    </div>

    <!-- ══ 금기 행동 자동 전용 ══ -->
    <div style="padding:8px 12px;border-bottom:1px solid #0a1a10">
      <div style="font-size:9px;color:#503020;font-style:italic;text-align:center;padding:4px 0">⚠️ 금기 행동도 AI 서사에서 자동 감지됩니다</div>
    </div>

    <!-- ══ 공명 회복 ══ -->
    <div style="padding:10px 12px;border-bottom:1px solid #0a1a10">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 공명 회복 ──</div>
      ${ELEMENTAL_RESTORE_METHODS.map(m => {
        const canAfford = !m.cost.gold || S.gold >= m.cost.gold;
        const canHp = !m.cost.hp || (S.stats?.hp || 100) > m.cost.hp + 10;
        const canUse = canAfford && canHp;
        return `<div style="padding:8px 10px;background:#000a06;border:1px solid ${canUse?'#1a4a2a':'#0a1a10'};margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:14}):(m.icon)}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${canUse?color:'#3a5a3a'}">${m.name}</div>
              <div style="font-size:8px;color:#3a5a3a;margin-top:1px">조건: ${m.req}</div>
            </div>
            <span style="font-size:9px;color:#40a080;font-family:'Cinzel',serif">+${m.restore}</span>
          </div>
          <div style="font-size:9px;color:#406050;margin-bottom:5px">${m.desc}</div>
          <button onclick="elemRestore('${m.id}');renderElementalSystemPanel()"
            style="width:100%;padding:5px;background:${canUse?'#001a10':'#000a06'};border:1px solid ${canUse?'#20604a':'#0a1a10'};color:${canUse?color:'#2a4a3a'};font-family:'Cinzel',serif;font-size:9px;cursor:${canUse?'pointer':'not-allowed'};border-radius:2px"
            ${canUse?'':'disabled'}>
            ${canUse ? '✨ 회복하기' : '조건 미충족'}
            ${m.cost.gold ? `(${m.cost.gold}G)` : ''}${m.cost.hp ? `(HP -${m.cost.hp})` : ''}
          </button>
        </div>`;
      }).join('')}
    </div>

    <!-- ══ 오라 ══ -->
    <div style="padding:8px 12px;background:#000a06;border-bottom:1px solid #0a1a10;font-size:10px;color:#406050">
      🌿 <span style="font-style:italic">${stg.aura}</span>
    </div>

    <!-- ══ 폭발 기록 ══ -->
    ${es.surgeCount > 0 ? `
    <div style="padding:8px 12px;background:#100500;border-bottom:1px solid #0a1a10;font-size:9px;color:#e06040">
      💥 원소 폭발 ${es.surgeCount}회 발생 이력
    </div>` : ''}

    <!-- ══ 최근 기록 ══ -->
    ${es.history && es.history.length ? `
    <div style="padding:10px 12px;border-bottom:1px solid #0a1a10">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 최근 기록 ──</div>
      ${[...es.history].reverse().slice(0,10).map(h => `
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #060f08;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#406050">${h.label}</span>
          <span style="color:${h.gain > 0 ? '#40d080' : '#e05030'};font-family:'Cinzel',serif">${h.gain > 0 ? '+' : ''}${h.gain}</span>
          <span style="color:#2a4a2a;font-size:8px">(${h.total})</span>
        </div>`).join('')}
    </div>` : ''}

    <!-- ══ 초기화 ══ -->
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#1a3a1a;letter-spacing:1px;margin-bottom:6px">── 시스템 초기화 ──</div>
      <button onclick="if(confirm('원소각성 시스템을 초기화합니까?')){clearElementalSystem();renderElementalSystemPanel()}" style="padding:4px 10px;background:#0a0000;border:1px solid #2a0000;color:#4a1a1a;font-size:8px;cursor:pointer;font-family:'Cinzel',serif">초기화</button>
    </div>
  `;
}
window.renderElementalSystemPanel = renderElementalSystemPanel;

window.gainElemResonance      = gainElemResonance;

window.elemTabooViolation     = elemTabooViolation;

window.shiftElemRestraint     = shiftElemRestraint;

window.setElementalType       = setElementalType;

window.elemRestore            = elemRestore;

window.renderElementalSystemPanel = renderElementalSystemPanel;

window.applyElementalSystemStats  = applyElementalSystemStats;

window.getElemAwakeningStatus     = getElemAwakeningStatus;

export const DRAGON_HEART_KEY = 'tf-dragon-heart';

export const loadDragonHeart = () => {
  try {
    return JSON.parse(lsGet(DRAGON_HEART_KEY) || JSON.stringify({
      // 1. 혈통 각성 (0=드래곤, 100=인간)
      bloodline: 50,
      // 2. 고룡 유산 — 봉인된 선조 (처음엔 null, 플레이 중 발굴)
      ancestorType: null,        // 'flame'|'storm'|'abyss'|'time'|'guardian'
      ancestorFragments: 0,      // 수집한 기억 파편 수
      ancestorRevealed: false,   // 정체 완전 공개 여부
      ancestorHistory: [],       // 발굴 기록
      // 3. 용심 균형 (0=파괴, 1000=수호)
      heartBalance: 500,
      // 4. 용의 보물
      hoardType: null,           // 'war'|'knowledge'|'gold'|'bond'
      hoardObsession: 0,         // 집착도 0~100
      hoardHistory: [],
      // 5. 각성의 대가
      awakenPoints: 0,           // 0~1000
      awakenCostPending: false,  // 대가 미지불 상태
      awakenCostCount: 0,        // 누적 거부 횟수
      awakenHistory: [],
      // 공통
      history: [],
    }));
  } catch(e) { return { bloodline:50, ancestorType:null, ancestorFragments:0, ancestorRevealed:false, ancestorHistory:[], heartBalance:500, hoardType:null, hoardObsession:0, hoardHistory:[], awakenPoints:0, awakenCostPending:false, awakenCostCount:0, awakenHistory:[], history:[] }; }
};

export const saveDragonHeart = (d) => { try { lsSet(DRAGON_HEART_KEY, JSON.stringify(d)); } catch(e){} };

export const clearDragonHeart = () => lsDel(DRAGON_HEART_KEY);

export function getDragonBalancePhase(balance) {
  for (const p of DRAGON_BALANCE_PHASES) {
    if (balance >= p.range[0] && balance <= p.range[1]) return p;
  }
  return DRAGON_BALANCE_PHASES[2];
}
window.getDragonBalancePhase = getDragonBalancePhase;

export function getDragonBloodlineLabel(val) {
  if (val <= 10)  return { label:'순혈 드래곤', icon:'🐉', color:'#ff4010', desc:'거의 완전한 용. 인간과 대화조차 어렵다.' };
  if (val <= 30)  return { label:'용의 화신',   icon:'🐲', color:'#e05020', desc:'고룡들이 동등한 혈통으로 인정한다.' };
  if (val <= 45)  return { label:'강한 용혈',   icon:'🔥', color:'#d07030', desc:'용의 본능이 이성보다 앞선다.' };
  if (val <= 55)  return { label:'방랑하는 혼', icon:'💨', color:'#a0a0a0', desc:'어중간한 자—양쪽 모두에게 이방인.' };
  if (val <= 70)  return { label:'용혈 인간',   icon:'🌿', color:'#60b060', desc:'인간성이 더 강하게 드러난다.' };
  if (val <= 85)  return { label:'빛의 반룡',   icon:'⭐', color:'#40b090', desc:'인간 사회에 거의 편입. 동료 보정 최대.' };
  return             { label:'완전한 인간',  icon:'👤', color:'#4080d0', desc:'용혈의 힘은 절반 봉인되지만 인간 사회에서 완전히 받아들여진다.' };
}
window.getDragonBloodlineLabel = getDragonBloodlineLabel;

export function gainDragonAwakenPoints(actType, customGain) {
  const race = S.character?.race || '';
  if (!race.includes('드래곤') && !race.includes('dragon') && !race.includes('용혈')) return;
  const dh = loadDragonHeart();
  const actDef = DRAGON_AWAKEN_ACTS[actType];
  const gain = customGain !== undefined ? customGain : (actDef?.gain || 20);
  dh.awakenPoints = Math.max(0, Math.min(1000, (dh.awakenPoints || 0) + gain));
  dh.awakenHistory = dh.awakenHistory || [];
  dh.awakenHistory.push({ type:actType, gain, label:actDef?.label || actType, icon:actDef?.icon||'🐉', total:dh.awakenPoints, at:new Date().toISOString().slice(0,16) });
  if (dh.awakenHistory.length > 30) dh.awakenHistory = dh.awakenHistory.slice(-30);
  // 대가 임박 여부 체크
  const nextCost = DRAGON_AWAKEN_COSTS.find(c => c.threshold <= dh.awakenPoints && !dh.awakenCostPending);
  if (nextCost) dh.awakenCostPending = true;
  saveDragonHeart(dh);
  // [신규] 전력 해방(fullpower)은 드래곤혈 종족에게 가장 극적인 순간이므로,
  // 정의만 있고 한 번도 호출되지 않던 dramaticEvolution() 연출을 연결한다.
  if(actType === 'fullpower' && typeof dramaticEvolution==='function'){
    try{ dramaticEvolution('용혈 전력 해방', '🐉'); }catch(e){}
  }
}
window.gainDragonAwakenPoints = gainDragonAwakenPoints;

export function gainDragonHoard(hoardType, amount) {
  const race = S.character?.race || '';
  if (!race.includes('드래곤') && !race.includes('dragon') && !race.includes('용혈')) return;
  const dh = loadDragonHeart();
  if (!dh.hoardType) dh.hoardType = hoardType;
  dh.hoardObsession = Math.min(100, (dh.hoardObsession || 0) + (amount || 5));
  dh.hoardHistory = dh.hoardHistory || [];
  dh.hoardHistory.push({ type:hoardType, amount, total:dh.hoardObsession, at:new Date().toISOString().slice(0,16) });
  if (dh.hoardHistory.length > 20) dh.hoardHistory = dh.hoardHistory.slice(-20);
  saveDragonHeart(dh);
}
window.gainDragonHoard = gainDragonHoard;

export function gainDragonFragment(triggerId) {
  const race = S.character?.race || '';
  if (!race.includes('드래곤') && !race.includes('dragon') && !race.includes('용혈')) return;
  const dh = loadDragonHeart();
  const trigger = DRAGON_FRAGMENT_TRIGGERS.find(t => t.id === triggerId);
  if (!trigger) return;
  dh.ancestorFragments = (dh.ancestorFragments || 0) + 1;
  dh.ancestorHistory = dh.ancestorHistory || [];
  dh.ancestorHistory.push({ trigger:triggerId, label:trigger.label, icon:trigger.icon, total:dh.ancestorFragments, at:new Date().toISOString().slice(0,16) });
  // 선조 정체 단서 — 3파편부터 타입 후보 좁혀짐, 7파편에 완전 공개
  if (!dh.ancestorRevealed) {
    if (dh.ancestorFragments >= 7) {
      if (!dh.ancestorType) {
        // 가장 많이 매칭된 유형으로 선조 결정
        const counts = {};
        for (const h of dh.ancestorHistory) {
          const tr = DRAGON_FRAGMENT_TRIGGERS.find(t => t.id === h.trigger);
          if (tr) for (const t of tr.types) counts[t] = (counts[t]||0)+1;
        }
        dh.ancestorType = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'flame';
      }
      dh.ancestorRevealed = true;
      showToast(`🐉 선조의 정체가 드러났다: ${DRAGON_ANCESTOR_TYPES[dh.ancestorType]?.name || '알 수 없는 선조'}`);
    } else if (dh.ancestorFragments >= 3 && !dh.ancestorType) {
      // 부분 공개 힌트
      const counts = {};
      for (const h of dh.ancestorHistory) {
        const tr = DRAGON_FRAGMENT_TRIGGERS.find(t => t.id === h.trigger);
        if (tr) for (const t of tr.types) counts[t] = (counts[t]||0)+1;
      }
      const topTwo = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>DRAGON_ANCESTOR_TYPES[k]?.icon||'?');
      showToast(`🔍 선조의 흔적… 기억 파편 ${dh.ancestorFragments}/7 수집. 힌트: ${topTwo.join(' ')}`);
    }
  }
  if (dh.ancestorHistory.length > 30) dh.ancestorHistory = dh.ancestorHistory.slice(-30);
  saveDragonHeart(dh);
}
window.gainDragonFragment = gainDragonFragment;

export function shiftDragonBalance(amount) {
  const race = S.character?.race || '';
  if (!race.includes('드래곤') && !race.includes('dragon') && !race.includes('용혈')) return;
  const dh = loadDragonHeart();
  const prev = getDragonBalancePhase(dh.heartBalance);
  dh.heartBalance = Math.max(0, Math.min(1000, (dh.heartBalance||500) + amount));
  const next = getDragonBalancePhase(dh.heartBalance);
  if (prev.phase !== next.phase) showToast(`🐉 용심의 방향이 변했다: ${next.icon} ${next.name}`);
  saveDragonHeart(dh);
  applyDragonHeartStats();
}
window.shiftDragonBalance = shiftDragonBalance;

export function setDragonBloodline(val) {
  const race = S.character?.race || '';
  if (!race.includes('드래곤') && !race.includes('dragon') && !race.includes('용혈')) return;
  const dh = loadDragonHeart();
  dh.bloodline = Math.max(0, Math.min(100, val));
  saveDragonHeart(dh);
  applyDragonHeartStats();
}
window.setDragonBloodline = setDragonBloodline;

export function applyDragonHeartStats() {
  const race = S.character?.race || '';
  if (!race.includes('드래곤') && !race.includes('dragon') && !race.includes('용혈')) return;
  const dh = loadDragonHeart();
  const prev = S._dragonHeartBonus || {};
  const newBonus = {};
  // 용심 균형 보너스
  const phase = getDragonBalancePhase(dh.heartBalance || 500);
  Object.assign(newBonus, phase.statBonus || {});
  // 선조 보너스 (공개된 경우)
  if (dh.ancestorRevealed && dh.ancestorType) {
    const anc = DRAGON_ANCESTOR_TYPES[dh.ancestorType];
    if (anc?.statBoost) for (const [k,v] of Object.entries(anc.statBoost)) newBonus[k] = (newBonus[k]||0)+Math.floor(v*(dh.ancestorFragments/7));
  }
  // 보물 집착도 보너스
  if (dh.hoardType && DRAGON_HOARD_TYPES[dh.hoardType]) {
    const ratio = (dh.hoardObsession||0) / 100;
    for (const [k,v] of Object.entries(DRAGON_HOARD_TYPES[dh.hoardType].statBoost)) newBonus[k] = (newBonus[k]||0) + Math.floor(v*ratio);
  }
  // 혈통 페널티 (중간 50일 때 최대 페널티)
  const bloodlineDeviation = Math.abs((dh.bloodline||50) - 50);
  if (bloodlineDeviation < 10) { newBonus.str = (newBonus.str||0)-5; newBonus.mgc = (newBonus.mgc||0)-5; }
  // [BUG5 FIX] S.character.stats와 S.stats를 혼용하던 것을 S.stats로 통일
  for (const [k,v] of Object.entries(prev)) { if (S.stats?.[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); }
  for (const [k,v] of Object.entries(newBonus)) { if (S.stats?.[k] !== undefined) S.stats[k] = Math.min(999, Math.max(0, (S.stats[k]||0)+v)); }
  S._dragonHeartBonus = newBonus;
}
window.applyDragonHeartStats = applyDragonHeartStats;

export function renderDragonHeartPanel() {
  const body = document.getElementById('pb-dragon-heart');
  if (!body) return;
  const dh = loadDragonHeart();
  const balPhase = getDragonBalancePhase(dh.heartBalance || 500);
  const bloodLabel = getDragonBloodlineLabel(dh.bloodline || 50);
  const anc = dh.ancestorType ? DRAGON_ANCESTOR_TYPES[dh.ancestorType] : null;
  const hoard = dh.hoardType ? DRAGON_HOARD_TYPES[dh.hoardType] : null;
  const awakenCostNow = DRAGON_AWAKEN_COSTS.slice().reverse().find(c => c.threshold <= dh.awakenPoints);

  // 스킬 목록 수집
  const activeSkills = [];
  if (balPhase.skills) activeSkills.push(...balPhase.skills);
  if (dh.ancestorRevealed && anc) {
    (anc.skills||[]).forEach((sk,i) => activeSkills.push({ id:`anc_sk_${i}`, name:sk, icon:anc.icon, type:'active', rarity:'legendary', mpCost:30, desc:`${anc.name}의 유산. 선조 혈통이 완전히 깨어났을 때 사용 가능.`, statBoost:{} }));
  }

  body.innerHTML = `
<div style="padding:4px 0 8px">
  <!-- ══ 로어 인용 ══ -->
  <div style="margin:0 0 12px;padding:8px 12px;background:linear-gradient(135deg,#120500,#1a0800);border-left:3px solid #ff6020;border-radius:2px;font-size:11px;color:#c08060;font-style:italic;line-height:1.6">
    "불꽃은 방향을 선택하지 않는다—방향을 선택하는 것은 불꽃을 쥔 자의 의지다."
  </div>

  <!-- ══ 1. 혈통 각성 ══ -->
  <div style="margin-bottom:14px;padding:10px 12px;background:#100500;border:1px solid #3a1000;border-radius:2px">
    <div style="font-family:'Cinzel',serif;font-size:10px;color:#ff6020;letter-spacing:1px;margin-bottom:8px">🩸 혈통 각성</div>
    <div style="display:flex;justify-content:space-between;font-size:9px;color:#808080;margin-bottom:4px">
      <span>🐉 드래곤성</span><span>👤 인간성</span>
    </div>
    <input type="range" min="0" max="100" value="${dh.bloodline||50}"
      style="width:100%;accent-color:${bloodLabel.color};cursor:pointer"
      oninput="this.nextElementSibling.querySelector('span').textContent=this.value;setDragonBloodline(parseInt(this.value))">
    <div style="text-align:center;margin-top:5px">
      <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(bloodLabel,{size:14}):(bloodLabel.icon)}</span>
      <span style="font-family:'Cinzel',serif;font-size:10px;color:${bloodLabel.color};margin-left:4px">${bloodLabel.label}</span>
      <span style="display:none">${dh.bloodline||50}</span>
    </div>
    <div style="font-size:10px;color:#808060;margin-top:4px;text-align:center">${bloodLabel.desc}</div>
    ${(dh.bloodline||50) >= 45 && (dh.bloodline||50) <= 55 ? `<div style="margin-top:6px;padding:4px 8px;background:#1a1000;border:1px solid #4a3000;font-size:10px;color:#c09040;text-align:center">⚠️ 어중간한 자 — 양쪽 모두에게 이방인. 스탯 패널티 적용 중</div>` : ''}
  </div>

  <!-- ══ 2. 고룡 유산 ══ -->
  <div style="margin-bottom:14px;padding:10px 12px;background:#0a0010;border:1px solid #300050;border-radius:2px">
    <div style="font-family:'Cinzel',serif;font-size:10px;color:#c060ff;letter-spacing:1px;margin-bottom:8px">💎 고룡 유산</div>
    ${dh.ancestorRevealed && anc ? `
      <div style="display:flex;align-items:center;gap:8px;padding:8px;background:#180028;border:1px solid ${anc.color};border-radius:2px;margin-bottom:8px">
        <span style="color:${anc.color};display:inline-flex;flex-shrink:0;transform:scale(1.09)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(anc,{size:16}):(anc.svgIcon||anc.icon)}</span>
        <div>
          <div style="font-family:'Cinzel',serif;font-size:11px;color:${anc.color}">${anc.name}</div>
          <div style="font-size:10px;color:#a080c0;margin-top:2px">${anc.desc}</div>
        </div>
      </div>
      <div style="font-size:9px;color:#6040a0;margin-bottom:6px">▸ 선조 보너스: ${Object.entries(anc.statBoost).map(([k,v])=>`${k.toUpperCase()} +${v}`).join(' / ')}</div>
      <div style="font-size:9px;color:#a080c0">▸ 특수 스킬: ${(anc.skills||[]).join(', ')}</div>
    ` : `
      <div style="text-align:center;padding:8px 0;color:#606080;font-size:11px">
        <div style="font-size:20px;margin-bottom:4px">🔮</div>
        ${dh.ancestorFragments < 3 ? '선조의 기억이 봉인되어 있다…' : dh.ancestorFragments < 7 ? `기억 파편이 떨리기 시작한다. (${dh.ancestorFragments}/7)` : '선조의 정체가 거의 드러났다…'}
      </div>
    `}
    <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
      <div style="flex:1;height:4px;background:#200030;border-radius:2px;overflow:hidden">
        <div style="height:100%;background:#c060ff;width:${Math.min(100,(dh.ancestorFragments/7)*100)}%;transition:width .4s"></div>
      </div>
      <span style="font-size:9px;color:#8040c0;font-family:'Cinzel',serif">${dh.ancestorFragments}/7</span>
    </div>
    <div style="font-size:9px;color:#604080;margin-top:5px">▸ 특정 행동(고룡 조우, 고대 유적, 폭풍 속 전투 등)으로 파편 수집</div>
    <div style="margin-top:8px;font-family:'Cinzel',serif;font-size:9px;color:#604080;letter-spacing:1px">발굴 기록</div>
    ${(dh.ancestorHistory||[]).slice(-5).reverse().map(h=>`<div style="display:flex;gap:5px;align-items:center;padding:3px 0;border-bottom:1px solid #200030;font-size:10px"><span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span><span style="color:#a080c0;flex:1">${h.label}</span><span style="color:#604080;font-size:9px">${h.at||''}</span></div>`).join('')||'<div style="font-size:10px;color:#403050;text-align:center;padding:6px 0">아직 파편이 없다.</div>'}
  </div>

  <!-- ══ 3. 용심 균형 ══ -->
  <div style="margin-bottom:14px;padding:10px 12px;background:#030810;border:1px solid #102040;border-radius:2px">
    <div style="font-family:'Cinzel',serif;font-size:10px;color:#4080c0;letter-spacing:1px;margin-bottom:8px">⚖️ 용심 균형</div>
    <div style="display:flex;justify-content:space-between;font-size:9px;margin-bottom:4px">
      <span style="color:#e03010">🔴 파괴</span><span style="color:#2060e0">🔵 수호</span>
    </div>
    <div style="position:relative;height:14px;background:linear-gradient(90deg,#e03010,#808080,#2060e0);border-radius:7px;overflow:hidden">
      <div style="position:absolute;left:${(dh.heartBalance||500)/10}%;transform:translateX(-50%);top:1px;width:12px;height:12px;border-radius:50%;background:#fff;border:2px solid #000;pointer-events:none"></div>
    </div>
    <div style="display:flex;justify-content:center;gap:8px;margin-top:6px;align-items:center">
      <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(balPhase,{size:16}):(balPhase.icon)}</span>
      <span style="font-family:'Cinzel',serif;font-size:11px;color:${balPhase.color}">${balPhase.name}</span>
      <span style="font-size:9px;color:#606060">(${dh.heartBalance||500}/1000)</span>
    </div>
    <div style="font-size:10px;color:#607090;margin-top:4px;text-align:center">${balPhase.desc}</div>
    ${balPhase.phase==='adrift'?`<div style="margin-top:6px;padding:4px 8px;background:#101010;border:1px solid #303030;font-size:10px;color:#808080;text-align:center">⚠️ 방향을 선택하지 못한 자 — 가장 약한 상태</div>`:''}
    <div style="margin-top:8px;padding:5px 8px;background:#0a0500;border:1px dashed #2a1000;border-radius:2px;font-size:9px;color:#5a3010">
      💡 용심의 균형은 파괴적/수호적 행동에 따라 자연스럽게 이동합니다. 직접 조작 불가
    </div>
    ${balPhase.skills?.length ? `
      <div style="margin-top:8px;font-family:'Cinzel',serif;font-size:9px;color:#4080c0;letter-spacing:1px">해금 스킬</div>
      ${balPhase.skills.map(sk=>`<div style="padding:6px 8px;background:#050d18;border:1px solid #102040;margin-top:4px;border-radius:1px">
        <div style="display:flex;align-items:center;gap:5px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:16}):(sk.icon)}</span>
          <span style="font-family:'Cinzel',serif;font-size:10px;color:${balPhase.color}">${sk.name}</span>
          <span style="font-size:8px;padding:1px 4px;background:#200030;color:#c060ff;border-radius:2px">${sk.rarity}</span>
        </div>
        <div style="font-size:10px;color:#607090;margin-top:3px">${sk.desc}</div>
      </div>`).join('')}
    ` : ''}
  </div>

  <!-- ══ 4. 용의 보물 ══ -->
  <div style="margin-bottom:14px;padding:10px 12px;background:#0a0800;border:1px solid #302000;border-radius:2px">
    <div style="font-family:'Cinzel',serif;font-size:10px;color:#d0a020;letter-spacing:1px;margin-bottom:8px">💰 용의 보물굴</div>
    ${hoard ? `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="color:${hoard.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(hoard,{size:16}):(hoard.svgIcon||hoard.icon)}</span>
        <div>
          <div style="font-family:'Cinzel',serif;font-size:11px;color:${hoard.color}">${hoard.name}</div>
          <div style="font-size:10px;color:#a09040">${hoard.label} — ${hoard.desc}</div>
        </div>
      </div>
    ` : `<div style="font-size:10px;color:#605030;margin-bottom:8px;text-align:center">아직 보물 유형이 결정되지 않았다. 수집 패턴으로 각성.</div>`}
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
      <span style="font-size:9px;color:#806030">집착도</span>
      <div style="flex:1;height:5px;background:#201000;border-radius:2px;overflow:hidden">
        <div style="height:100%;background:linear-gradient(90deg,#d0a020,#ffcc40);width:${dh.hoardObsession||0}%;transition:width .4s"></div>
      </div>
      <span style="font-size:9px;color:#d0a020;font-family:'Cinzel',serif">${dh.hoardObsession||0}</span>
    </div>
    ${DRAGON_HOARD_OBSESSION_EVENTS.filter(e=>e.threshold<=(dh.hoardObsession||0)).map(e=>`<div style="font-size:9px;color:#a08020;padding:2px 0">▸ ${e.desc}</div>`).join('')}
    <div style="margin-top:8px;font-size:9px;color:#504020;font-style:italic;text-align:center">🐉 보물 유형은 AI 서사에서 자동 결정됩니다</div>
  </div>

  <!-- ══ 5. 각성의 대가 ══ -->
  <div style="margin-bottom:14px;padding:10px 12px;background:#080010;border:1px solid #280040;border-radius:2px">
    <div style="font-family:'Cinzel',serif;font-size:10px;color:#e040ff;letter-spacing:1px;margin-bottom:8px">⚡ 각성의 대가</div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
      <div style="flex:1;height:6px;background:#150020;border-radius:3px;overflow:hidden">
        <div style="height:100%;background:linear-gradient(90deg,#a020e0,#ff40ff);width:${(dh.awakenPoints||0)/10}%;transition:width .4s"></div>
      </div>
      <span style="font-size:11px;font-family:'Cinzel',serif;color:#e040ff">${dh.awakenPoints||0}</span>
    </div>
    ${dh.awakenCostPending && awakenCostNow ? `
      <div style="padding:8px;background:#1a0025;border:1px solid #e040ff;border-radius:2px;margin-bottom:8px">
        <div style="font-size:12px;margin-bottom:3px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(awakenCostNow,{size:12}):(awakenCostNow.icon)} ${awakenCostNow.title}</div>
        <div style="font-size:10px;color:#c060e0;margin-bottom:6px">${awakenCostNow.desc}</div>
        <div style="display:flex;gap:5px">
          <button onclick="(()=>{const dh=loadDragonHeart();dh.awakenCostPending=false;dh.awakenPoints=Math.max(0,dh.awakenPoints-200);saveDragonHeart(dh);renderDragonHeartPanel();showToast('✅ 대가를 받아들였다. 각성이 초기화된다.')})()" style="flex:1;padding:5px;background:#100018;border:1px solid #8020c0;color:#c060e0;font-size:9px;cursor:pointer;font-family:'Cinzel',serif">✅ 대가 수용</button>
          <button onclick="(()=>{const dh=loadDragonHeart();dh.awakenCostCount=(dh.awakenCostCount||0)+1;dh.awakenCostPending=false;saveDragonHeart(dh);renderDragonHeartPanel();showToast('⚠️ 대가를 거부했다. 다음 대가가 더 커진다.')})()" style="flex:1;padding:5px;background:#180000;border:1px solid #e02020;color:#e06060;font-size:9px;cursor:pointer;font-family:'Cinzel',serif">⛔ 대가 거부</button>
        </div>
      </div>
    ` : ''}
    <div style="margin-top:4px">
      ${DRAGON_AWAKEN_COSTS.map(c=>`
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #150020;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(c,{size:16}):(c.icon)}</span>
          <div style="flex:1">
            <span style="color:${(dh.awakenPoints||0)>=c.threshold?'#e040ff':'#403050'}">${c.title}</span>
            <span style="color:#403050;margin-left:4px">(${c.threshold}p)</span>
          </div>
          ${(dh.awakenPoints||0)>=c.threshold?'<span style="color:#e040ff">●</span>':'<span style="color:#403050">○</span>'}
        </div>`).join('')}
    </div>
    <div style="margin-top:8px;font-size:9px;color:#501060;font-style:italic;text-align:center">⚡ 각성은 AI 서사에서 자동으로 쌓입니다</div>
  </div>

  <!-- ══ 해금 스킬 전체 ══ -->
  ${activeSkills.length ? `
  <div style="margin-bottom:14px;padding:10px 12px;background:#080508;border:1px solid #281828;border-radius:2px">
    <div style="font-family:'Cinzel',serif;font-size:10px;color:#d060d0;letter-spacing:1px;margin-bottom:8px">🌟 해금된 용심 스킬</div>
    ${activeSkills.map(sk=>`<div style="padding:7px 9px;background:#100a10;border:1px solid #301830;margin-bottom:4px;border-radius:1px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
        <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:16}):(sk.icon)}</span>
        <span style="font-family:'Cinzel',serif;font-size:10px;color:#d060d0">${sk.name}</span>
        <span style="font-size:8px;padding:1px 4px;background:#200828;color:#b040c0;border-radius:2px">${sk.rarity||'epic'}</span>
        ${sk.mpCost?`<span style="font-size:8px;color:#4060a0;margin-left:auto">MP ${sk.mpCost}</span>`:''}
      </div>
      <div style="font-size:10px;color:#806080">${sk.desc}</div>
    </div>`).join('')}
  </div>` : ''}
</div>`;
}
window.renderDragonHeartPanel = renderDragonHeartPanel;

export const DEMON_CORRUPTION_KEY    = "tf-demon-corruption";

export const DC_PROGRESS_KEY         = 'tf-dc-progress';

export const DC_SIN_KEY              = 'tf-dc-sin';

export function loadDemonCorruption() {
  try {
    const prog = lsGet(DC_PROGRESS_KEY); const sin = lsGet(DC_SIN_KEY);
    if (prog) {
      return { ...JSON.parse(prog), sin: sin ? JSON.parse(sin) : {contract:0,fear:0,betrayal:0,slaughter:0,temptation:0} };
    }
    const r = lsGet(DEMON_CORRUPTION_KEY);
    return r ? JSON.parse(r) : {points:0,stage:0,history:[],sin:{contract:0,fear:0,betrayal:0,slaughter:0,temptation:0},purifyCount:0,awakened:false};
  } catch(e) { return {points:0,stage:0,history:[],sin:{contract:0,fear:0,betrayal:0,slaughter:0,temptation:0},purifyCount:0,awakened:false}; }
}
window.loadDemonCorruption = loadDemonCorruption;

export function saveDemonCorruption(d) {
  try {
    lsSet(DC_PROGRESS_KEY, JSON.stringify({points:d.points||0,stage:d.stage||0,history:d.history||[],purifyCount:d.purifyCount||0,awakened:d.awakened||false}));
    lsSet(DC_SIN_KEY,      JSON.stringify(d.sin||{contract:0,fear:0,betrayal:0,slaughter:0,temptation:0}));
    lsSet(DEMON_CORRUPTION_KEY, JSON.stringify(d)); // 하위호환
  } catch(e) {}
}
window.saveDemonCorruption = saveDemonCorruption;

export const clearDemonCorruption    = () => { lsDel(DEMON_CORRUPTION_KEY); lsDel(DC_PROGRESS_KEY); lsDel(DC_SIN_KEY); };

export const DEMON_CORRUPTION_STAGES = [
  {
    stage: 0, name: "순수한 악마", icon: "😈", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20 C6 15.5 8.5 13 12 13 C15.5 13 18 15.5 18 20" opacity="0.4"/><circle cx="12" cy="8" r="3.2" opacity="0.4"/></svg>`,
    color: "#9060a0", threshold: 0,
    desc: "아직 타락의 씨앗이 깨어나지 않은 상태. 악마의 본성이 잠들어 있다.",
    statBonus: {}, statPenalty: {},
    skills: [],
    aura: "타락의 기운이 없다. 마계의 약한 존재들만이 복종한다.",
    aiHint: "",
    storyHint: "",
  },
  {
    stage: 1, name: "욕망의 싹", icon: "😈🌱", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 6"/><path d="M12 6 C10 6 9 4.5 9 3 C10.5 3 12 4 12 6 Z" stroke-width="1.2"/><path d="M9 21 L9 3 M15 3 L15 21" stroke-width="0.8" opacity="0.5"/></svg>`,
    color: "#a050c0", threshold: 50,
    desc: "어둠의 욕망이 싹트기 시작했다. 상대의 약점을 본능적으로 읽는다.",
    statBonus: { neg: 5, fear: 3, per: 4 },
    statPenalty: { fath: -3, trst: -3 },
    storyHint: `[타락 1단계 서사] 심연 신앙 신자들이 당신에게 조심스럽게 접근하기 시작한다. "당신에게서 선택받은 자의 기운이 느껴집니다." 순환의 사원 성직자들이 당신을 불편한 눈길로 바라본다. 일반 시민들도 뭔가 다르다는 것을 느끼지만 말하지 않는다. 이것이 아직은 선택의 기로 앞의 단계다.`,
    skills: [
      { id:"dc_s1_desire_read", name:"욕망 해독", icon:"👁️", type:"passive",
        desc:"대화 상대의 가장 강한 욕망이 자동으로 감지된다. NEG +8, PER +5.",
        rarity:"uncommon", mpCost:0, condition:"always", conditionDesc:"항시 발동",
        statBoost:{neg:64, per:40} }
    ],
    aura: "주변인들이 알 수 없는 불안감을 느낀다.",
    aiHint: "1단계 타락: 캐릭터가 상대의 욕망을 본능적으로 읽는 날카로운 시선을 묘사하라."
  },
  {
    stage: 2, name: "계약의 혀", icon: "📜😈", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L4 19 L11 19 L11 4 Z" stroke-linejoin="round"/><path d="M6.5 8 L8.5 8" stroke-width="1.1"/></svg>`,
    color: "#b040d0", threshold: 120,
    desc: "악마의 언변이 깨어났다. 말 한 마디로 상대의 의지를 흔들 수 있다.",
    statBonus: { neg: 10, fear: 7, cha: 6, per: 6 },
    statPenalty: { fath: -6, trst: -6, wil: -3 },
    skills: [
      { id:"dc_s2_demon_tongue", name:"악마의 혀", icon:"🗣️", type:"active",
        desc:"MP 15. 상대에게 유혹적인 제안을 하여 판정 +25. 실패해도 상대가 흔들림.",
        rarity:"rare", mpCost:15, condition:null, conditionDesc:null, statBoost:{},
        effects:{ kind:'statBoost', statMod:{neg:14,cha:10} } },
      { id:"dc_s2_shadow_brand", name:"그림자 낙인", icon:"🖤", type:"event",
        desc:"계약 상대에게 보이지 않는 낙인을 새긴다. 낙인자 위치 항상 감지.",
        rarity:"rare", mpCost:0, condition:"activate", conditionDesc:"직접 발동", statBoost:{} }
    ],
    aura: "계약의 기운이 피어오른다. 탐욕스러운 NPC들이 접근한다.",
    aiHint: "2단계 타락: 캐릭터의 말에 미묘한 마력이 깃들기 시작했다. 설득 장면에서 상대가 자신도 모르게 끌리는 묘사를 포함하라."
  },
  {
    stage: 3, name: "부패의 손길", icon: "🖤😈", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.5" stroke="none"/></svg>`,
    color: "#c030c0", threshold: 220,
    desc: "손이 닿는 것이 서서히 부패한다. 공포가 힘이 된다.",
    statBonus: { neg: 16, fear: 14, mgc: 10, mad: 8, str: 6 },
    statPenalty: { fath: -12, trst: -10, wil: -6, luk: -4 },
    skills: [
      { id:"dc_s3_corruption_touch", name:"타락의 접촉", icon:"☠️", type:"active",
        desc:"MP 22. 신체 접촉으로 상대에게 '부패' 상태이상 부여. 매 턴 FATH·WIL -5.",
        rarity:"rare", mpCost:22, condition:null, conditionDesc:null, statBoost:{},
        effects:{ kind:'damage', statSource:{neg:0.6,mgc:0.4}, damageMult:0.7, element:'dark' } },
      { id:"dc_s3_fear_harvest", name:"공포 수확", icon:"😱", type:"passive",
        desc:"주변 존재의 공포 감정이 마나로 전환된다. 적이 공포 상태일 때 MP +10/턴.",
        rarity:"rare", mpCost:0, condition:"enemy_feared", conditionDesc:"적 공포 시", statBoost:{mgc:80} }
    ],
    aura: "접촉한 식물이 시들고 동물이 도망친다. 신성한 존재들이 불쾌감을 느낀다.",
    aiHint: "3단계 타락: 캐릭터의 존재 자체가 주변을 오염시킨다. 꽃이 시들거나 어둠이 짙어지는 묘사를 포함하라."
  },
  {
    stage: 4, name: "원죄의 각성", icon: "🔴😈", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14 8 L20 6 L16 11 L20 16 L14 14 L12 20 L10 14 L4 16 L8 11 L4 6 L10 8 Z" stroke-linejoin="round" opacity="0.7"/></svg>`,
    color: "#d020a0", threshold: 350,
    desc: "원죄의 힘이 각성했다. 악마의 본성이 외형에도 드러나기 시작한다.",
    statBonus: { neg: 24, fear: 22, mgc: 18, mad: 16, str: 12, disg: 10 },
    statPenalty: { fath: -20, trst: -16, wil: -10, luk: -8, rep: -6 },
    skills: [
      { id:"dc_s4_sin_manifest", name:"원죄 현현", icon:"🔴", type:"active",
        desc:"MP 35. 주변 존재의 원죄를 폭발시킨다. 신성·선한 존재에 2배 피해.",
        rarity:"epic", mpCost:35, condition:null, conditionDesc:null, statBoost:{},
        effects:{ kind:'damage', statSource:{neg:0.5,mgc:0.5}, damageMult:1.15, element:'dark' } },
      { id:"dc_s4_dark_wings", name:"어둠의 날개", icon:"🦇", type:"passive",
        desc:"검은 날개가 드러났다. AGI +20, 비행 가능. 신성 지역 진입 시 통증.",
        rarity:"epic", mpCost:0, condition:"always", conditionDesc:"항시 발동",
        statBoost:{agi:160, fear:120} }
    ],
    aura: "날개와 뿔이 드러난다. 성직자들이 퇴마를 시도한다. 악마 계열 존재들이 복종한다.",
    aiHint: "4단계 타락: 캐릭터의 외형에서 악마의 특징이 드러난다(검은 날개, 뿔, 붉은 눈). 신성한 NPC들이 적대적으로 변한다."
  },
  {
    stage: 5, name: "심연의 사자", icon: "🌑😈", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>`,
    color: "#e01090", threshold: 520,
    desc: "심연에서 보내온 사자. 이제 마계와 연결된 통로가 열려있다.",
    statBonus: { neg: 35, fear: 32, mgc: 28, mad: 25, str: 20, disg: 18, int: 16 },
    statPenalty: { fath: -30, trst: -24, wil: -15, luk: -12, rep: -12 },
    skills: [
      { id:"dc_s5_abyss_gate", name:"심연의 문", icon:"🌑", type:"active",
        desc:"MP 50. 심연으로 통하는 문을 잠시 열어 하위 악마 3체 소환. 3턴 지속.",
        rarity:"legendary", mpCost:50, condition:null, conditionDesc:null, statBoost:{},
        effects:{ kind:'summon', baseCount:2, countByLocation:{dungeon:1, battlefield:1, default:0}, maxActive:3, statScaling:{source:'locationTier', mult:1.1}, levelScaling:0.15 } },
      { id:"dc_s5_soul_contract", name:"영혼 계약", icon:"⛓️", type:"event",
        desc:"상대의 영혼을 담보로 계약. 계약자의 모든 능력치 +15%, 위반 시 즉사.",
        rarity:"legendary", mpCost:0, condition:"activate", conditionDesc:"직접 발동", statBoost:{} }
    ],
    aura: "심연의 포탈이 주변에 나타난다. 약한 악마들이 자발적으로 섬기러 온다.",
    aiHint: "5단계 타락: 캐릭터 주변의 공간이 마계화된다. 그림자가 살아 움직이고 공기에서 유황 냄새가 난다."
  },
  {
    stage: 6, name: "타락의 군주", icon: "👑🖤", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.5" fill="currentColor" fill-opacity="0.5" stroke="none"/></svg>`,
    color: "#f00080", threshold: 750,
    desc: "타락이 완성 단계에 이르렀다. 선택의 여지 없이 세계를 부패시킨다.",
    statBonus: { neg: 50, fear: 48, mgc: 40, mad: 36, str: 30, disg: 28, int: 24, crse: 20 },
    statPenalty: { fath: -45, trst: -35, wil: -22, luk: -18, rep: -20 },
    skills: [
      { id:"dc_s6_corruption_domain", name:"타락의 영역", icon:"💜", type:"passive",
        desc:"반경 내 모든 것이 서서히 마계화. 적 매 턴 FATH·WIL -10, 아군(악마) 스탯+25.",
        rarity:"legendary", mpCost:0, condition:"always", conditionDesc:"항시 발동",
        statBoost:{neg:320, fear:300, mgc:280, mad:240} },
      { id:"dc_s6_absolute_corrupt", name:"절대 타락", icon:"🔱", type:"active",
        desc:"HP 50 소모. 단 한 명을 완전히 타락시켜 영구 부하로 만든다. 신성 존재도 적용.",
        rarity:"legendary", mpCost:0, condition:null, conditionDesc:null, statBoost:{}, hpCost:50,
        effects:{ kind:'damage', statSource:{neg:0.6,mgc:0.4}, damageMult:1.4, element:'dark' } }
    ],
    aura: "존재 자체가 세계를 오염시킨다. 천상의 존재들이 이 이름을 기록한다.",
    aiHint: "6단계 타락: 최고조의 타락 상태. 캐릭터가 나타나는 곳마다 현실이 마계의 논리로 대체된다. 신들조차 주목한다."
  },
  {
    stage: 7, name: "원초 혼돈", icon: "🌋😈", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/></svg>`,
    color: "#ff0060", threshold: 1000,
    desc: "타락이 종착점에 달했다. 이제 선과 악의 구분이 의미를 잃는다.",
    statBonus: { neg: 70, fear: 68, mgc: 58, mad: 52, str: 42, disg: 40, int: 36, crse: 30 },
    statPenalty: { fath: -60, trst: -50, wil: -30 },
    skills: [
      { id:"dc_s7_primal_chaos", name:"원초 혼돈", icon:"🌋", type:"active",
        desc:"HP 80 소모. 세계 창조 이전의 혼돈 에너지 해방. 전장 모든 도덕·질서 법칙 무효.",
        rarity:"legendary", mpCost:0, condition:null, conditionDesc:null, statBoost:{}, hpCost:80,
        effects:{ kind:'damage', statSource:{neg:0.5,mad:0.5}, damageMult:1.7, hits:2, element:'dark' } },
      { id:"dc_s7_sin_immortal", name:"죄악의 불멸", icon:"♾️", type:"passive",
        desc:"원죄가 몸을 재구성. 사망 시 더 강력한 악마 형태로 부활. 부활마다 타락도 +10.",
        rarity:"legendary", mpCost:0, condition:"always", conditionDesc:"항시 발동",
        statBoost:{neg:480, fear:460, mgc:400, mad:360, str:280} }
    ],
    aura: "우주의 법칙이 이 존재 앞에서 흔들린다. 창조신과 파괴신이 공동으로 주목한다.",
    aiHint: "7단계 타락: 완전한 원초 혼돈 상태. 이 존재의 시선만으로 주변 생물의 본성이 흔들리며, 신성·악마의 구분이 무의미해진다."
  }
];

export function gainDemonCorruption(sinType, customGain) {
  const race = S.character?.race || "";
  const isDemon = race.includes("악마") || race.includes("demon");
  if (!isDemon) return;
  const dc = loadDemonCorruption();
  const sinDef = DEMON_SIN_GAIN[sinType];
  const gain = customGain !== undefined ? customGain : (sinDef?.gain || 5);
  dc.points = Math.min(1000, (dc.points || 0) + gain);
  dc.sin = dc.sin || {};
  if (sinType) dc.sin[sinType] = (dc.sin[sinType] || 0) + 1;
  dc.history = dc.history || [];
  dc.history.push({
    type: sinType, gain, label: sinDef?.label || sinType,
    icon: sinDef?.icon || "😈", total: dc.points,
    at: new Date().toISOString().slice(0, 16)
  });
  
  // 단계 업데이트
  const prevStage = dc.stage || 0;
  let newStage = 0;
  for (let i = DEMON_CORRUPTION_STAGES.length - 1; i >= 0; i--) {
    if (dc.points >= DEMON_CORRUPTION_STAGES[i].threshold) { newStage = i; break; }
  }
  dc.stage = newStage;
  saveDemonCorruption(dc);
  // 단계 상승 알림
  if (newStage > prevStage) {
    const stg = DEMON_CORRUPTION_STAGES[newStage];
    setTimeout(() => {
      toastHTML(`😈 타락 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)} (${esc(newStage)}단계)`, 4000);
      // 새 스킬 해금
      stg.skills.forEach(sk => {
        if (!S.unlockedSkills[sk.id]) {
          S.unlockedSkills[sk.id] = true;
          saveSkills(S.unlockedSkills);
          setTimeout(() => toastHTML(`🔓 새 타락 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 3000), 1500);
        }
      });
    }, 500);
  }
  // 스탯 반영
  applyDemonCorruptionStats();
  return dc;
}
window.gainDemonCorruption = gainDemonCorruption;

export function reduceDemonCorruption(amount, methodId) {
  const race = S.character?.race || "";
  const isDemon = race.includes("악마") || race.includes("demon");
  if (!isDemon) return;
  const dc = loadDemonCorruption();
  dc.points = Math.max(0, (dc.points || 0) - amount);
  dc.purifyCount = (dc.purifyCount || 0) + 1;
  dc.history = dc.history || [];
  dc.history.push({
    type: "purify", gain: -amount, label: "정화",
    icon: "✨", total: dc.points,
    at: new Date().toISOString().slice(0, 16)
  });
  // 단계 재계산
  let newStage = 0;
  for (let i = DEMON_CORRUPTION_STAGES.length - 1; i >= 0; i--) {
    if (dc.points >= DEMON_CORRUPTION_STAGES[i].threshold) { newStage = i; break; }
  }
  dc.stage = newStage;
  saveDemonCorruption(dc);
  applyDemonCorruptionStats();
  toast(`✨ 타락 정화! 타락도 -${amount} (현재: ${dc.points})`, 3000);
  return dc;
}
window.reduceDemonCorruption = reduceDemonCorruption;

export function applyDemonCorruptionStats() {
  const dc = loadDemonCorruption();
  const stg = DEMON_CORRUPTION_STAGES[dc.stage || 0];
  if (!stg) return;
  // 이전 타락 보너스 제거 후 재적용
  // (간단히: 보너스는 S._demonCorruptBonus에 저장해두고 교체)
  const prev = S._demonCorruptBonus || {};
  Object.entries(prev).forEach(([k, v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });
  const newBonus = {};
  Object.entries(stg.statBonus || {}).forEach(([k, v]) => { S.stats[k] = Math.min(999, (S.stats[k] || 50) + v); newBonus[k] = v; });
  Object.entries(stg.statPenalty || {}).forEach(([k, v]) => { S.stats[k] = Math.max(0, (S.stats[k] || 50) + v); });
  S._demonCorruptBonus = newBonus;
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
}
window.applyDemonCorruptionStats = applyDemonCorruptionStats;

export function getDemonCorruptionStatus() {
  const race = S.character?.race || "";
  const isDemon = race.includes("악마") || race.includes("demon");
  if (!isDemon) return null;
  const dc = loadDemonCorruption();
  const stg = DEMON_CORRUPTION_STAGES[dc.stage || 0];
  const nextStg = DEMON_CORRUPTION_STAGES[(dc.stage || 0) + 1];
  return { ...dc, stageDef: stg, nextStage: nextStg };
}
window.getDemonCorruptionStatus = getDemonCorruptionStatus;

export function demonPurify(methodId) {
  const method = DEMON_PURIFY_METHODS.find(m => m.id === methodId);
  if (!method) return;
  const dc = loadDemonCorruption();
  if (dc.points <= 0) { toast('정화할 타락도가 없습니다'); return; }
  if (method.cost.gold && S.gold < method.cost.gold) { toast(`골드 부족 (필요: ${method.cost.gold}G)`); return; }
  if (method.cost.hp && (S.stats.hp || 100) <= method.cost.hp + 10) { toast('HP가 너무 낮습니다'); return; }
  if (method.cost.gold) { S.gold -= method.cost.gold; saveGold(S.gold); }
  if (method.cost.hp) { S.stats.hp = Math.max(1, (S.stats.hp || 100) - method.cost.hp); }
  reduceDemonCorruption(method.reduce, methodId);
  window.updateHeader();
}
window.demonPurify = demonPurify;

window.gainDemonCorruption   = gainDemonCorruption;

window.reduceDemonCorruption = reduceDemonCorruption;

window.demonPurify           = demonPurify;

export const DWARF_CRAFT_KEY = "tf-dwarf-craft";

export const loadDwarfCraft  = () => {
  try {
    const raw = lsGet(DWARF_CRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return {
    points: 0, stage: 0, history: [],
    craft: { forge:0, guard:0, repair:0, alch:0, engrave:0 },
    craftPoints: { forge:0, guard:0, repair:0, alch:0, engrave:0 },
    specialization: 'none',
    signatureWorks: [],
    abandonCount: 0,
    ancestorCurse: false,
    curseEndAt: null,
    awakened: false
  };
};

export const saveDwarfCraft  = (d) => { try { lsSet(DWARF_CRAFT_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearDwarfCraft = () => lsDel(DWARF_CRAFT_KEY);

export const DWARF_CRAFT_STAGES = [
  {
    stage:0, name:"초보 단조공", icon:"⚒️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 3.5 L20.5 9.5 L17 13 L11 7 Z" stroke-width="1.3" opacity="0.5"/><path d="M11 7 L4 14" opacity="0.5"/></svg>`, color:"#8a6a30", threshold:0,
    desc:"망치를 처음 든 손. 아직 장인의 혼이 깃들지 않았다.",
    statBonus:{}, statPenalty:{}, skills:[],
    aura:"평범한 드워프로 보인다. 선조의 기운이 느껴지지 않는다.",
    aiHint:""
  },
  {
    stage:1, name:"견습 장인", icon:"🔨", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 3.5 L20.5 9.5 L17 13 L11 7 Z" stroke-width="1.3"/><path d="M11 7 L4 14 C3.3 14.7 3.3 15.8 4 16.5 C4.7 17.2 5.8 17.2 6.5 16.5 L13.5 9.5"/></svg>`, color:"#a07830", threshold:50,
    desc:"망치 소리가 달라졌다. 손이 기억하기 시작했다. 재료의 결을 본능적으로 읽는다.",
    statBonus:{str:5, end:4, per:3}, statPenalty:{},
    skills:[
      { id:"dc_dw1_material_sense", name:"재료 감별", icon:"🪨", type:"passive",
        desc:"아이템·광석의 등급과 결함을 자동 감지. PER +8. 상인에게 속지 않는다.",
        rarity:"uncommon", mpCost:0, condition:"always", conditionDesc:"항시 발동", statBoost:{per:64,int:32} }
    ],
    aura:"손에서 쇳가루 냄새가 난다. 장인들이 기술을 공유하려 접근한다.",
    aiHint:"1단계 각인: 금속·광석을 만질 때 그 품질을 직감하는 묘사. 숙련된 눈빛."
  },
  {
    stage:2, name:"숙련 단조공", icon:"⚙️🔨", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" stroke-width="1.3"/><path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12" stroke-width="1.2"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></svg>`, color:"#b88830", threshold:120,
    desc:"두드릴수록 작품이 살아난다. 도구에 의지가 담기기 시작한다.",
    statBonus:{str:10, end:8, per:6, int:4}, statPenalty:{agi:-2},
    skills:[
      { id:"dc_dw2_quick_reinforce", name:"즉석 강화", icon:"⚡", type:"active",
        desc:"MP 12. 전투 중 무기나 방어구를 즉석 강화. 대상 장비 스탯 +15, 2턴 지속.",
        rarity:"rare", mpCost:12, condition:"in_combat", conditionDesc:"전투 중", statBoost:{} },
      { id:"dc_dw2_craft_eye", name:"장인의 눈", icon:"👁️", type:"passive",
        desc:"적의 장비 약점이 보인다. 파손된 부위를 노려 크리티컬 +12.",
        rarity:"rare", mpCost:0, condition:"always", conditionDesc:"항시 발동", statBoost:{per:80,str:48} }
    ],
    aura:"단조 소리가 들리면 주변 장인들이 귀를 기울인다.",
    aiHint:"2단계: 무기·도구를 다룰 때 특유의 정확성이 드러난다."
  },
  {
    stage:3, name:"선조의 손", icon:"🪨⚙️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 12 M12 12 C12 12 8 10 8 6 C8 4.5 9.2 3.5 10.5 3.5 C11.3 3.5 12 4 12 5 C12 4 12.7 3.5 13.5 3.5 C14.8 3.5 16 4.5 16 6 C16 10 12 12 12 12 Z" stroke-linejoin="round"/></svg>`, color:"#c89840", threshold:220,
    desc:"선조의 혼이 손에 깃들었다. 두드리는 것이 아니라 '깨우는' 것임을 안다.",
    statBonus:{str:18, end:15, per:12, int:8, luk:5}, statPenalty:{agi:-4, wil:-2},
    skills:[
      { id:"dc_dw3_ancestor_hand", name:"선조의 기억", icon:"🪨", type:"active",
        desc:"MP 20. 과거 드워프 장인의 혼을 불러 단조 판정 +30. 서명 작품 제작 시 자동 발동.",
        rarity:"rare", mpCost:20, condition:null, conditionDesc:null, statBoost:{} },
      { id:"dc_dw3_fortify_strike", name:"강화 일격", icon:"🔥", type:"active",
        desc:"MP 18. 장비한 무기의 단조 각인을 폭발시켜 이번 공격력 2배. 장비 내구도 -10.",
        rarity:"rare", mpCost:18, condition:"in_combat", conditionDesc:"전투 중", statBoost:{} }
    ],
    aura:"작업실 벽에 선조의 얼굴이 어른거린다. 다른 장인들이 경외심을 표한다.",
    aiHint:"3단계: 도구를 잡는 순간 선조의 기억이 흐른다는 묘사. 작업장에서 권위가 느껴진다."
  },
  {
    stage:4, name:"불꽃 장인", icon:"🔥⚒️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/><path d="M14.5 3.5 L20.5 9.5 L17 13 L11 7 Z" stroke-width="1.1" opacity="0.6"/></svg>`, color:"#d8a850", threshold:350,
    desc:"용광로가 명령에 응한다. 서명 작품 1개를 지정할 수 있다—그 아이템에 선조의 혼이 깃든다.",
    statBonus:{str:26, end:22, per:18, int:14, luk:8, crit:8}, statPenalty:{agi:-6, trst:-2},
    skills:[
      { id:"dc_dw4_signature_passive", name:"서명작 발동", icon:"📜", type:"passive",
        desc:"서명 작품 장착 시 모든 스탯 +20. 서명작이 파괴될 수 없다.",
        rarity:"epic", mpCost:0, condition:"signature_equipped", conditionDesc:"서명작 장착 시", statBoost:{str:160,end:120,per:100} },
      { id:"dc_dw4_furnace_call", name:"용광로의 부름", icon:"🔥", type:"passive",
        desc:"화염 피해 50% 면역. 불꽃 원소 지형에서 STR+15, END+10 자동 적용.",
        rarity:"epic", mpCost:0, condition:"always", conditionDesc:"항시 발동", statBoost:{str:120,end:80} }
    ],
    aura:"서명 작품이 나타나면 주변 장인들이 무릎을 꿇는다.",
    aiHint:"4단계: 만든 물건에 서명을 새기는 묘사. 아이템이 빛나거나 진동한다."
  },
  {
    stage:5, name:"강철 전설", icon:"⚔️⚒️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M14.5 3.5 L20.5 9.5 L17 13 L11 7 Z" stroke-width="1" opacity="0.6"/></svg>`, color:"#e8b860", threshold:520,
    desc:"이름이 전설이 된다. 만든 것이 역사가 된다.",
    statBonus:{str:38, end:32, per:26, int:20, luk:12, crit:16, fear:8}, statPenalty:{agi:-8, trst:-4},
    skills:[
      { id:"dc_dw5_legend_reforge", name:"전설 재단조", icon:"⚔️", type:"active",
        desc:"MP 40. 보유 아이템을 한 등급 영구 상승. 희귀→영웅→전설 순. 하루 1회.",
        rarity:"legendary", mpCost:40, condition:null, conditionDesc:null, statBoost:{} },
      { id:"dc_dw5_iron_legacy", name:"강철 유산", icon:"📿", type:"passive",
        desc:"장비한 모든 아이템 스탯 효과 +25%. 서명 작품 장착 시 추가 +15%.",
        rarity:"legendary", mpCost:0, condition:"always", conditionDesc:"항시 발동", statBoost:{str:200,end:160,per:120} }
    ],
    aura:"이름이 소문으로 퍼진다. 귀족·왕·용병단이 의뢰를 보낸다.",
    aiHint:"5단계: 이름이 장인 사회의 전설로 회자된다. 만든 무기가 역사를 바꾼다."
  },
  {
    stage:6, name:"심산의 군주", icon:"👑⚒️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M14.5 3.5 L20.5 9.5 L17 13 L11 7 Z" stroke-width="0.9" opacity="0.5"/></svg>`, color:"#f8c870", threshold:750,
    desc:"대지가 명을 따른다. 광산이 열리고, 금속이 스스로 형태를 잡는다.",
    statBonus:{str:52, end:46, per:36, int:28, luk:18, crit:24, fear:16, disg:10}, statPenalty:{agi:-12, trst:-8},
    skills:[
      { id:"dc_dw6_ancestor_summon", name:"선조 소환", icon:"👻", type:"active",
        desc:"MP 60. 드워프 전설 장인 유령 3체 소환. 각각 STR/END +30 지원. 3턴 지속.",
        rarity:"legendary", mpCost:60, condition:null, conditionDesc:null, statBoost:{} },
      { id:"dc_dw6_mountain_heart", name:"산의 심장", icon:"🏔️", type:"passive",
        desc:"지하·산악 지형 모든 스탯 +30%. 돌·금속 피해 완전 면역. 광물 탐지 자동 발동.",
        rarity:"legendary", mpCost:0, condition:"always", conditionDesc:"항시 발동", statBoost:{str:360,end:320,per:200,int:160} }
    ],
    aura:"발 아래의 돌이 길을 비킨다. 드워프 왕족도 경의를 표한다.",
    aiHint:"6단계: 걸으면 땅이 미세하게 울린다. 선조 유령이 주변에 어른거린다."
  },
  {
    stage:7, name:"불멸의 산신", icon:"⛰️🔥", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21 L9 5 L12 12 L15 5 L20 21 Z" stroke-linejoin="round"/><path d="M9 21 C9 21 10 17 12 17 C14 17 15 21 15 21" stroke-width="1.1"/></svg>`, color:"#ffdc90", threshold:1000,
    desc:"각인이 완성됐다. 만든 것이 세계의 일부가 된다. 죽어도 작품은 영원히 남는다.",
    statBonus:{str:72, end:65, per:50, int:40, luk:25, crit:36, fear:24, disg:18}, statPenalty:{agi:-16},
    skills:[
      { id:"dc_dw7_immortal_forge", name:"불멸의 단조", icon:"⛰️", type:"active",
        desc:"HP 100 소모. 세계 유일 신화 등급 아이템 창조. 아이템에 이름이 영구 각인.",
        rarity:"legendary", mpCost:0, condition:null, conditionDesc:null, statBoost:{} },
      { id:"dc_dw7_mountain_god", name:"산의 신격", icon:"🌋", type:"passive",
        desc:"사망 시 서명 작품이 세계에 영구히 남아 전설이 된다. 부활 시 모든 장비 완전 복원.",
        rarity:"legendary", mpCost:0, condition:"always", conditionDesc:"항시 발동", statBoost:{str:500,end:460,per:340,int:260,crit:240} }
    ],
    aura:"존재 자체가 역사다. 산맥이 이 이름을 기억한다.",
    aiHint:"7단계: 만지는 금속이 스스로 형태를 잡는다. 어떤 NPC도 경외로 대한다."
  }
];

export const NPC_CRAFT_KEY = "tf-npc-craft";

export const loadNpcCraft  = () => { try { return JSON.parse(lsGet(NPC_CRAFT_KEY)||"{}"); } catch(e) { return {}; } };

export const saveNpcCraft  = (d) => { try { lsSet(NPC_CRAFT_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearNpcCraft = () => lsDel(NPC_CRAFT_KEY);

export function craftForNpc(npcName, methodId, customPower) {
  const dc = loadDwarfCraft();
  const myStage = dc.stage || 0;
  const method = NPC_CRAFT_METHODS.find(m => m.id === methodId);
  if (!method) return;
  if (myStage < method.reqStage) { toast(`⚠️ 각인 단계 부족 (필요: ${method.reqStage}단계)`); return; }
  if (dc.points < method.cost) { toast(`⚠️ 각인도 부족 (필요: ${method.cost}, 현재: ${dc.points})`); return; }

  // 각인도 소모
  dc.points = Math.max(0, dc.points - method.cost);
  saveDwarfCraft(dc);
  applyDwarfCraftStats();

  // NPC 강화도 증가
  const ncd = loadNpcCraft();
  if (!ncd[npcName]) ncd[npcName] = { points:0, stage:0, history:[], bonded:false };
  const prev = ncd[npcName];
  const power = customPower !== undefined ? customPower : method.power;
  prev.points = Math.min(100, (prev.points || 0) + power);

  const prevStage = prev.stage || 0;
  let newStage = 0;
  for (let i = NPC_CRAFT_STAGES.length - 1; i >= 0; i--) {
    if (prev.points >= NPC_CRAFT_STAGES[i].threshold) { newStage = i; break; }
  }
  prev.stage = newStage;
  prev.bonded = newStage >= 4;
  prev.history = prev.history || [];
  prev.history.push({ method:method.name, icon:method.icon, power, total:prev.points, at:new Date().toISOString().slice(0,16) });
  
  ncd[npcName] = prev;
  saveNpcCraft(ncd);

  if (newStage > prevStage) {
    const stg = NPC_CRAFT_STAGES[newStage];
    setTimeout(() => toastHTML(`⚒️ ${esc(npcName)}와의 관계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)} (${esc(newStage)}단계)`, 3500), 300);
    if (S._nextInjectedContext !== undefined) {
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        ` [NPC 장인 강화: ${npcName} → ${stg.name}(${newStage}단계)] ${stg.aiHint}`;
    }
  } else {
    toastHTML(`⚒️ ${esc(npcName)}에게 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(method,{size:14}):(method.icon)} ${esc(method.name)} 시전! (+${esc(power)} → ${esc(prev.points)}/100)`, 2500);
    if (S._nextInjectedContext !== undefined) {
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        ` [장인 서비스: ${npcName}에게 ${method.name}. ${method.aiHint}]`;
    }
  }
  return prev;
}
window.craftForNpc = craftForNpc;

export function useDwSkill(skillId, targetNpcName) {
  const skill = CRAFT_POWER_SKILLS.find(s => s.id === skillId);
  if (!skill) return;
  const dc = loadDwarfCraft();
  if ((dc.stage || 0) < skill.reqStage) { toast(`⚠️ 각인 단계 부족 (필요: ${skill.reqStage}단계)`); return; }
  if (dc.points < skill.cost) { toast(`⚠️ 각인도 부족 (필요: ${skill.cost})`); return; }
  dc.points = Math.max(0, dc.points - skill.cost);
  saveDwarfCraft(dc);
  applyDwarfCraftStats();
  const targetTxt = targetNpcName ? ` → 대상: ${targetNpcName}` : '';
  if (S._nextInjectedContext !== undefined) {
    S._nextInjectedContext = (S._nextInjectedContext||'') +
      ` [장인 스킬 발동: ${skill.icon} ${skill.name}${targetTxt}] ${skill.aiHint}`;
  }
  toast(`${skill.name} 발동! (각인도 -${skill.cost} → 잔여: ${dc.points})`, 3000, skill);
  renderDwarfCraftPanel();
}
window.useDwSkill = useDwSkill;

export function openDwSkillModal(skillId) {
  const skill = CRAFT_POWER_SKILLS.find(s => s.id === skillId);
  if (!skill) return;
  if (skill.targetable) {
    const npcs = loadNPCs();
    const existingModal = document.getElementById('dw-skill-modal');
    if (existingModal) existingModal.remove();
    const modal = document.createElement('div');
    modal.id = 'dw-skill-modal';
    modal.style.cssText = `position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;`;
    const c = DWARF_CRAFT_STAGES[loadDwarfCraft().stage||0]?.color || '#d4a030';
    const npcBtns = npcs.length
      ? npcs.map(n=>`<button onclick="useDwSkill('${skillId}','${esc(n.name)}');document.getElementById('dw-skill-modal').remove();renderDwarfCraftPanel()"
          style="display:block;width:100%;padding:8px 12px;margin-bottom:5px;background:#120e00;border:1px solid ${c}55;color:${c};font-size:11px;cursor:pointer;text-align:left;border-radius:2px">
          ${typeof getEntityIconHTML==='function'?getEntityIconHTML(n,{size:9}):(n.icon||"👤")} ${esc(n.name)} <span style="color:#6a4a20;font-size:9px">${esc(n.role||'')}</span>
        </button>`).join('')
      : `<div style="color:#6a4a20;font-size:10px;text-align:center;padding:10px">등록된 NPC가 없습니다</div>`;
    modal.innerHTML = `<div style="background:#100c00;border:2px solid ${c};padding:18px;max-width:300px;width:90%;max-height:80vh;overflow-y:auto;border-radius:3px">
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${c};margin-bottom:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(skill,{size:12}):(skill.icon)} ${skill.name} — 대상 선택</div>
      <div style="font-size:10px;color:#8a6030;margin-bottom:10px">${esc(skill.desc)}</div>
      ${npcBtns}
      <button onclick="useDwSkill('${skillId}',null);document.getElementById('dw-skill-modal').remove();renderDwarfCraftPanel()"
        style="display:block;width:100%;padding:7px;margin-top:8px;background:#0a0800;border:1px solid #4a3010;color:#6a4a20;font-size:10px;cursor:pointer;border-radius:2px">
        🌍 대상 없이 발동 (서사 내 지정)
      </button>
      <button onclick="document.getElementById('dw-skill-modal').remove()"
        style="display:block;width:100%;padding:6px;margin-top:5px;background:transparent;border:1px solid #2a1a00;color:#4a2a10;font-size:10px;cursor:pointer;border-radius:2px">
        ✕ 취소
      </button>
    </div>`;
    document.body.appendChild(modal);
  } else {
    useDwSkill(skillId, null);
  }
}
window.openDwSkillModal = openDwSkillModal;

export function openNpcCraftModal() {
  const npcs = loadNPCs();
  const ncd = loadNpcCraft();
  const dc = loadDwarfCraft();
  const myStage = dc.stage || 0;
  const c = DWARF_CRAFT_STAGES[myStage]?.color || '#d4a030';
  const existing = document.getElementById('npc-craft-modal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'npc-craft-modal';
  modal.style.cssText = `position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.92);display:flex;align-items:flex-end;justify-content:center;`;

  const npcList = npcs.length
    ? npcs.map(n => {
        const nd = ncd[n.name] || { points:0, stage:0 };
        const nstg = NPC_CRAFT_STAGES[nd.stage] || NPC_CRAFT_STAGES[0];
        return `<div style="padding:8px 10px;background:#0d0a00;border:1px solid ${nd.stage>0?nstg.color+'55':'#2a1800'};margin-bottom:6px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <span style="font-size:18px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(n,{size:18}):(n.icon||"👤")}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${nstg.color}">${esc(n.name)}</div>
              <div style="font-size:8px;color:#6a4a20">${esc(n.role||'')} · ${typeof getEntityIconHTML==='function'?getEntityIconHTML(nstg,{size:8}):(nstg.icon)} ${nstg.name}</div>
            </div>
            <div style="font-family:'Cinzel',serif;font-size:12px;color:${nstg.color}">${nd.points}<span style="font-size:8px;color:#4a2a10">/100</span></div>
          </div>
          <div style="height:4px;background:#1a1000;border-radius:2px;overflow:hidden;margin-bottom:6px">
            <div style="width:${nd.points}%;height:100%;background:linear-gradient(90deg,#6a3a10,${nstg.color});border-radius:2px"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
            ${NPC_CRAFT_METHODS.filter(m=>myStage>=m.reqStage).map(m=>{
              const canAfford = dc.points >= m.cost;
              return `<button onclick="craftForNpc('${esc(n.name)}','${m.id}');document.getElementById('npc-craft-modal').remove();renderDwarfCraftPanel()"
                style="padding:5px 4px;background:${canAfford?'#140e00':'#0a0800'};border:1px solid ${canAfford?c+'44':'#1a1000'};color:${canAfford?c:'#3a2010'};font-size:8px;cursor:${canAfford?'pointer':'not-allowed'};border-radius:2px;text-align:left"
                ${canAfford?'':'disabled'}>
                ${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:16}):(m.icon)} ${m.name}<span style="color:#4a2a10;float:right">-${m.cost}</span>
              </button>`;
            }).join('')}
          </div>
        </div>`;
      }).join('')
    : `<div style="text-align:center;padding:20px;color:#4a2a10;font-size:10px">등록된 NPC가 없습니다.<br>NPC와 대화하면 자동 등록됩니다.</div>`;

  modal.innerHTML = `<div style="background:linear-gradient(180deg,#100c00,#0a0800);border-top:2px solid ${c};padding:14px;width:100%;max-width:500px;max-height:85vh;overflow-y:auto;border-radius:3px 3px 0 0">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${c}">⚒️ NPC 장비 강화 서비스</div>
      <div style="font-size:9px;color:#6a4a20">보유 각인도: <span style="color:${c};font-family:'Cinzel',serif">${dc.points}</span></div>
      <button onclick="document.getElementById('npc-craft-modal').remove()" style="background:none;border:none;color:#6a4a20;font-size:14px;cursor:pointer">✕</button>
    </div>
    <div style="font-size:9px;color:#6a4a20;margin-bottom:10px;font-style:italic">각인도를 소모해 NPC 장비를 강화하고 충성도를 쌓습니다. 의형제가 된 NPC는 언제든 달려옵니다.</div>
    ${npcList}
  </div>`;
  document.body.appendChild(modal);
}
window.openNpcCraftModal = openNpcCraftModal;

export function gainDwarfCraft(craftType, customGain) {
  const race = S.character?.race || "";
  const isDwarf = race.includes("드워프") || race.includes("dwarf");
  if (!isDwarf) return;
  const dc = loadDwarfCraft();
  const curseMod = dc.ancestorCurse ? 0.5 : 1.0;
  const def = DWARF_CRAFT_TYPES[craftType];
  const base = customGain !== undefined ? customGain : (def?.gain || 7);
  const gain = Math.round(base * curseMod);
  dc.points = Math.min(1000, (dc.points || 0) + gain);
  dc.craft = dc.craft || {};
  dc.craftPoints = dc.craftPoints || {};
  if (craftType) {
    dc.craft[craftType] = (dc.craft[craftType] || 0) + 1;
    dc.craftPoints[craftType] = (dc.craftPoints[craftType] || 0) + gain;
  }
  const topSpec = Object.entries(dc.craftPoints).sort((a,b)=>b[1]-a[1])[0];
  if (topSpec && topSpec[1] >= 30) dc.specialization = topSpec[0];

  dc.history = dc.history || [];
  dc.history.push({ type:craftType, gain, label:def?.label||craftType, icon:def?.icon||"⚒️", total:dc.points, at:new Date().toISOString().slice(0,16) });
  

  const prevStage = dc.stage || 0;
  let newStage = 0;
  for (let i = DWARF_CRAFT_STAGES.length-1; i >= 0; i--) {
    if (dc.points >= DWARF_CRAFT_STAGES[i].threshold) { newStage = i; break; }
  }
  dc.stage = newStage;
  saveDwarfCraft(dc);

  if (newStage > prevStage) {
    const stg = DWARF_CRAFT_STAGES[newStage];
    setTimeout(() => {
      toastHTML(`🔨 각인 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)} (${esc(newStage)}단계)`, 4000);
      stg.skills.forEach(sk => {
        if (!S.unlockedSkills[sk.id]) {
          S.unlockedSkills[sk.id] = true;
          saveSkills(S.unlockedSkills);
          setTimeout(() => toastHTML(`🔓 장인 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 3000), 1500);
        }
      });
    }, 500);
  }
  applyDwarfCraftStats();
  return dc;
}
window.gainDwarfCraft = gainDwarfCraft;

export function abandonDwarfWork() {
  const race = S.character?.race || "";
  if (!race.includes("드워프") && !race.includes("dwarf")) return;
  const dc = loadDwarfCraft();
  const penalty = 25 + (dc.abandonCount || 0) * 10;
  dc.points = Math.max(0, dc.points - penalty);
  dc.abandonCount = (dc.abandonCount||0) + 1;
  dc.ancestorCurse = true;
  dc.curseEndAt = dc.points + 80;
  dc.history = dc.history || [];
  dc.history.push({ type:"abandon", gain:-penalty, label:"미완성 포기", icon:"💔", total:dc.points, at:new Date().toISOString().slice(0,16) });
  let newStage = 0;
  for (let i = DWARF_CRAFT_STAGES.length-1; i >= 0; i--) {
    if (dc.points >= DWARF_CRAFT_STAGES[i].threshold) { newStage = i; break; }
  }
  dc.stage = newStage;
  saveDwarfCraft(dc);
  applyDwarfCraftStats();
  toast(`💔 미완성 포기! 각인도 -${penalty} + 선조의 저주!`, 4000);
  if (S._nextInjectedContext !== undefined) {
    S._nextInjectedContext = (S._nextInjectedContext||'') +
      ` [드워프 금기: 작업을 미완성으로 포기했다! 선조의 저주가 발동되어 단조 판정이 크게 하락한다.]`;
  }
}
window.abandonDwarfWork = abandonDwarfWork;

export function registerSignatureWork(itemName, craftType) {
  const race = S.character?.race || "";
  if (!race.includes("드워프") && !race.includes("dwarf")) return;
  const dc = loadDwarfCraft();
  if (dc.stage < 4) { toast("4단계 '불꽃 장인' 이상이어야 서명 작품 지정 가능", 2500); return; }
  // 서명 작품 무제한
  const workName = itemName || `제 ${(dc.signatureWorks||[]).length+1}번 서명 작품`;
  const typeIcon = DWARF_CRAFT_TYPES[craftType]?.icon || "⚒️";
  dc.signatureWorks = dc.signatureWorks || [];
  dc.signatureWorks.push({ name:workName, craftType:craftType||'forge', icon:typeIcon, pointsAtCreation:dc.points, createdAt:new Date().toISOString().slice(0,16) });
  saveDwarfCraft(dc);
  toast(`📜 서명 작품 등록: ${typeIcon} "${workName}"`, 4000);
  if (S._nextInjectedContext !== undefined) {
    S._nextInjectedContext = (S._nextInjectedContext||'') +
      ` [서명 작품 등록: "${workName}". 이 아이템에 드워프 장인의 혼이 깃들었다. 파괴 불가.]`;
  }
  renderDwarfCraftPanel();
}
window.registerSignatureWork = registerSignatureWork;

export function checkDwarfCurse(dc) {
  if (!dc.ancestorCurse) return;
  if (dc.curseEndAt !== null && dc.points >= dc.curseEndAt) {
    dc.ancestorCurse = false;
    dc.curseEndAt = null;
    saveDwarfCraft(dc);
    toast("✨ 선조의 저주가 풀렸다! 다시 망치를 들 수 있다.", 3000);
  }
}
window.checkDwarfCurse = checkDwarfCurse;

export function applyDwarfCraftStats() {
  const dc = loadDwarfCraft();
  checkDwarfCurse(dc);
  const stg = DWARF_CRAFT_STAGES[dc.stage||0];
  if (!stg) return;
  const prev = S._dwarfCraftBonus || {};
  Object.entries(prev).forEach(([k,v]) => { if (S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v); });
  const newBonus = {};
  Object.entries(stg.statBonus||{}).forEach(([k,v]) => { S.stats[k]=Math.min(999,(S.stats[k]||50)+v); newBonus[k]=v; });
  Object.entries(stg.statPenalty||{}).forEach(([k,v]) => { S.stats[k]=Math.max(0,(S.stats[k]||50)+v); });
  if (dc.ancestorCurse) S.stats.str = Math.max(0,(S.stats.str||50)-20);
  S._dwarfCraftBonus = newBonus;
  if (typeof saveStats==='function') saveStats(S.stats);
  window.updateHeader();
}
window.applyDwarfCraftStats = applyDwarfCraftStats;

export function getDwarfCraftStatus() {
  const race = S.character?.race || "";
  if (!race.includes("드워프") && !race.includes("dwarf")) return null;
  const dc = loadDwarfCraft();
  return { ...dc, stageDef:DWARF_CRAFT_STAGES[dc.stage||0], nextStage:DWARF_CRAFT_STAGES[(dc.stage||0)+1] };
}
window.getDwarfCraftStatus = getDwarfCraftStatus;

export function renderDwarfCraftPanel() {
  const body = document.getElementById('pb-dwarf-craft');
  if (!body) return;
  const status = getDwarfCraftStatus();
  if (!status) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">⚒️</div>
      <div>드워프족 캐릭터에게만 활성화됩니다.</div>
    </div>`;
    return;
  }
  const dc = status;
  const stg = dc.stageDef;
  const nextStg = dc.nextStage;
  const color = stg.color;
  const ncd = loadNpcCraft();
  const bondedNpcs = Object.entries(ncd).filter(([,v])=>v.stage>0);
  const stageSkills = DWARF_CRAFT_STAGES.slice(0,(dc.stage||0)+1).flatMap(s=>s.skills);
  const availableDwSkills = CRAFT_POWER_SKILLS.filter(s=>s.reqStage<=(dc.stage||0));
  const maxCraftPt = Math.max(...Object.values(dc.craftPoints||{}),1);
  const RARITY_COLOR = { uncommon:"#4a9a6a", rare:"#4a6fa5", epic:"#8a40c0", legendary:"#c8a96e" };

  body.innerHTML = `
    <!-- ① 헤더 -->
    <div style="padding:14px;background:linear-gradient(135deg,#100800,#1e1005);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#8a6030;margin-top:2px">${dc.stage}단계 / 7단계</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:${color}">${dc.points}<span style="font-size:9px;color:#6a4a20"> / 1000</span></div>
          <div style="font-size:8px;color:#6a4a20">보유 각인도</div>
        </div>
      </div>
      <div style="height:6px;background:#1a0e00;border-radius:3px;overflow:hidden;margin-bottom:4px">
        <div style="width:${Math.min(100,Math.round(dc.points/10))}%;height:100%;background:linear-gradient(90deg,#6a3a10,${color});border-radius:3px;transition:width .4s"></div>
      </div>
      ${nextStg?`<div style="display:flex;justify-content:space-between;font-size:8px;color:#6a4a20"><span>현재: ${dc.points}</span><span>다음 단계: ${nextStg.threshold}</span></div>`:`<div style="font-size:8px;color:${color};text-align:center">⚠️ 최고 각인 단계 도달</div>`}
      <div style="margin-top:8px;font-size:10px;color:#a07040;line-height:1.6;font-style:italic">"${stg.desc}"</div>
      ${dc.ancestorCurse?`<div style="margin-top:8px;padding:6px 10px;background:#1a0500;border:1px solid #8a2010;border-radius:2px;font-size:9px;color:#e05030">☠️ 선조의 저주 발동 중 — 단조 판정 -20, 각인도 획득 절반<div style="font-size:8px;color:#6a2a10;margin-top:2px">해제: 각인도 ${dc.curseEndAt}까지 쌓기 (현재 ${dc.points})</div></div>`:''}
    </div>

    <!-- ② 오라 + 단계 -->
    <div style="padding:7px 12px;background:#0d0800;border-bottom:1px solid #2a1800;font-size:10px;color:#8a6030">
      ⚒️ <span style="font-style:italic">${stg.aura}</span>
    </div>
    <div style="padding:8px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 각인 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${DWARF_CRAFT_STAGES.map((s,i)=>{
          const active=i===dc.stage, passed=i<dc.stage;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#1a1008':passed?'#100a00':'#0a0800'};border:1px solid ${active?s.color:passed?s.color+'44':'#1a1000'};border-radius:2px;opacity:${active?1:passed?0.7:0.35}">
            <span style="display:inline-flex;width:12px;height:12px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:12}):((s.svgIcon||'').replace('width="20" height="20"','width="12" height="12"')||s.icon)}</span>
            <div style="flex:1"><span style="font-family:'Cinzel',serif;font-size:9px;color:${active?s.color:passed?s.color:'#5a3a20'}">${s.name}</span><span style="font-size:8px;color:#4a2a10;margin-left:5px">(${s.threshold})</span></div>
            ${active?`<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀ 현재</span>`:''}
            ${passed?`<span style="font-size:9px;color:${s.color}">✓</span>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ③ 스탯 효과 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 각인 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(stg.statBonus||{}).map(([k,v])=>`<div style="padding:3px 7px;background:#0d0a00;border:1px solid #3a2a0a;border-radius:2px;font-size:9px"><span style="color:${color}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:4px">+${v}</span></div>`).join('')}
        ${Object.entries(stg.statPenalty||{}).map(([k,v])=>`<div style="padding:3px 7px;background:#0d0000;border:1px solid #3a0a0a;border-radius:2px;font-size:9px"><span style="color:#a06060">${k.toUpperCase()}</span><span style="color:#e05050;margin-left:4px">${v}</span></div>`).join('')}
      </div>
    </div>

    <!-- ④ 각인력 소모 스킬 (신규 핵심) -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:8px">── 🔨 각인력 소모 스킬 ──</div>
      ${availableDwSkills.length===0?`<div style="font-size:9px;color:#3a2010;text-align:center;padding:8px">각인 단계를 올려 스킬을 해금하세요</div>`:''}
      ${availableDwSkills.map(sk=>{
        const canUse=dc.points>=sk.cost;
        const rc=RARITY_COLOR[sk.rarity]||'#8a9a8a';
        return `<div style="padding:8px 10px;background:${canUse?'#140e00':'#0a0800'};border:1px solid ${canUse?rc+'55':'#1a1000'};margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:16}):(sk.icon)}</span>
            <div style="flex:1">
              <span style="font-family:'Cinzel',serif;font-size:10px;color:${canUse?rc:'#4a2a10'}">${esc(sk.name)}</span>
              <span style="font-size:8px;padding:1px 4px;background:${rc}22;color:${rc};border:1px solid ${rc}44;border-radius:2px;margin-left:4px">${sk.rarity}</span>
            </div>
            <div style="text-align:right">
              <div style="font-family:'Cinzel',serif;font-size:11px;color:${canUse?'#d0a040':'#4a2a10'}">-${sk.cost}</div>
              <div style="font-size:7px;color:#4a2a10">각인도</div>
            </div>
          </div>
          <div style="font-size:9px;color:#7a5030;margin-bottom:6px;line-height:1.5">${esc(sk.desc)}</div>
          <button onclick="openDwSkillModal('${sk.id}')"
            style="width:100%;padding:5px;background:${canUse?'linear-gradient(135deg,#1e1200,#2a1a00)':'#0a0800'};border:1px solid ${canUse?rc:'#1a1000'};color:${canUse?rc:'#3a2010'};font-family:'Cinzel',serif;font-size:9px;cursor:${canUse?'pointer':'not-allowed'};border-radius:2px"
            ${canUse?'':'disabled'}>
            ${sk.targetable?'🎯 대상 선택 후 발동':'⚡ 즉시 발동'} ${canUse?'':'(각인도 부족)'}
          </button>
        </div>`;
      }).join('')}
      ${dc.stage<7?`<div style="font-size:8px;color:#3a2010;text-align:center;margin-top:5px">다음 단계(${(dc.stage||0)+1}단계)에서 추가 스킬 해금</div>`:''}
    </div>

    <!-- ⑤ NPC 장비 강화 서비스 (신규 핵심) -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:8px">── ⚒️ NPC 장비 강화 서비스 ──</div>
      ${bondedNpcs.length>0?`
        <div style="margin-bottom:8px">
          <div style="font-size:8px;color:#6a4a20;margin-bottom:5px">강화 진행 중인 NPC (${bondedNpcs.length}명)</div>
          ${bondedNpcs.map(([name,nd])=>{
            const nstg=NPC_CRAFT_STAGES[nd.stage]||NPC_CRAFT_STAGES[0];
            return `<div style="display:flex;align-items:center;gap:7px;padding:5px 8px;background:#0d0a00;border:1px solid ${nstg.color}44;margin-bottom:3px;border-radius:2px">
              <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(nstg,{size:16}):(nstg.icon)}</span>
              <div style="flex:1">
                <div style="font-size:9px;color:${nstg.color}">${esc(name)}</div>
                <div style="height:3px;background:#1a1000;border-radius:2px;margin-top:2px">
                  <div style="width:${nd.points}%;height:100%;background:${nstg.color};border-radius:2px"></div>
                </div>
              </div>
              <div style="font-size:8px;color:${nstg.color};font-family:'Cinzel',serif">${nd.points}/100</div>
              <div style="font-size:8px;color:#4a2a10">${nstg.name}</div>
            </div>`;
          }).join('')}
        </div>
      `:`<div style="font-size:9px;color:#3a2010;text-align:center;padding:6px">아직 강화한 NPC가 없습니다</div>`}
      <button onclick="openNpcCraftModal()"
        style="width:100%;padding:8px;background:linear-gradient(135deg,#1a1005,#2a1a00);border:1px solid ${color}55;color:${color};font-family:'Cinzel',serif;font-size:10px;cursor:pointer;border-radius:2px;letter-spacing:0.5px">
        ⚒️ NPC 장비 강화하기
      </button>
    </div>

    <!-- ⑥ 서명 작품 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 📜 서명 작품 (${(dc.signatureWorks||[]).length}/3) ──</div>
      ${(dc.signatureWorks||[]).length?(dc.signatureWorks||[]).map(w=>`
        <div style="padding:7px 9px;background:#150e00;border:1px solid ${color}55;margin-bottom:4px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(w,{size:14}):(w.icon)}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${color}">${esc(w.name)}</div>
              <div style="font-size:8px;color:#6a4a20">각인도 ${w.pointsAtCreation} · ${(w.createdAt||'').slice(0,10)}</div>
            </div>
            <span style="font-size:8px;padding:2px 5px;background:${color}22;color:${color};border:1px solid ${color}44;border-radius:2px">서명작</span>
          </div>
        </div>`).join(''):`<div style="font-size:9px;color:#4a2a10;text-align:center;padding:8px">4단계 이상에서 서명 작품을 지정할 수 있습니다.</div>`}
      ${dc.stage>=4&&(dc.signatureWorks||[]).length<3?`
        <div style="margin-top:5px">
          <input id="sig-work-input" placeholder="작품 이름 입력..." style="width:calc(100% - 86px);padding:5px 8px;background:#0a0800;border:1px solid ${color}44;color:${color};font-family:'Crimson Text',serif;font-size:10px;border-radius:2px;outline:none;margin-right:4px">
          <select id="sig-craft-type" style="padding:5px;background:#0a0800;border:1px solid ${color}44;color:${color};font-size:9px;border-radius:2px;outline:none">
            ${Object.entries(DWARF_CRAFT_TYPES).map(([k,d])=>`<option value="${k}">${d.icon} ${d.label}</option>`).join('')}
          </select>
          <button onclick="registerSignatureWork(document.getElementById('sig-work-input').value,document.getElementById('sig-craft-type').value)"
            style="width:100%;margin-top:4px;padding:5px;background:#1a1005;border:1px solid ${color}44;color:${color};font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">📜 서명 작품 등록</button>
        </div>`:''}
    </div>

    <!-- ⑦ 단계 패시브 스킬 -->
    ${stageSkills.length?`
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 각인 단계 패시브 스킬 ──</div>
      ${stageSkills.map(sk=>{
        if(!S.unlockedSkills) S.unlockedSkills = {}; // [F-12 FIX]
        const unlocked=!!S.unlockedSkills[sk.id];
        return `<div style="padding:6px 9px;background:${unlocked?'#120e00':'#0a0800'};border:1px solid ${unlocked?color+'55':'#1a1000'};margin-bottom:4px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
            <span style="font-size:13px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:13}):(sk.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:9px;color:${color}">${esc(sk.name)}</span>
            <span style="font-size:7px;padding:1px 4px;background:${color}22;color:${color};border:1px solid ${color}44;border-radius:2px;margin-left:auto">${sk.rarity}</span>
            ${unlocked?'<span style="font-size:9px;color:#60d060">✓</span>':'<span style="font-size:9px;color:#4a2a10">🔒</span>'}
          </div>
          <div style="font-size:9px;color:#7a5030;line-height:1.4">${esc(sk.desc)}</div>
        </div>`;
      }).join('')}
    </div>`:''}

    <!-- ⑧ 단조 행동 버튼 -->
    <div style="padding:8px 12px;border-bottom:1px solid #1a1000">
      <div style="font-size:9px;color:#5a3a10;font-style:italic;text-align:center;padding:4px 0">⚒️ 각인도는 AI 서사에서 자동으로 쌓입니다</div>
    </div>

    <!-- ⑨ 최근 기록 -->
    ${dc.history&&dc.history.length?`
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 최근 기록 ──</div>
      ${[...dc.history].reverse().slice(0,12).map(h=>`
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #100a00;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#6a4a20">${h.label}</span>
          <span style="color:${h.gain>0?'#d0a040':'#c04040'};font-family:'Cinzel',serif">${h.gain>0?'+':''}${h.gain}</span>
          <span style="color:#3a2010;font-size:8px">(${h.total})</span>
        </div>`).join('')}
    </div>`:''}
  `;
}
window.renderDwarfCraftPanel = renderDwarfCraftPanel;

window.gainDwarfCraft           = gainDwarfCraft;

window.abandonDwarfWork         = abandonDwarfWork;

window.registerSignatureWork    = registerSignatureWork;

window.renderDwarfCraftPanel    = renderDwarfCraftPanel;

window.useDwSkill               = useDwSkill;

window.openDwSkillModal         = openDwSkillModal;

window.craftForNpc              = craftForNpc;

window.openNpcCraftModal        = openNpcCraftModal;

window.loadNpcCraft             = loadNpcCraft;

window.clearNpcCraft            = clearNpcCraft;

export const DWARF_GRUDGE_KEY     = 'tf-dwarf-grudge';

export const DG_ENTRIES_KEY       = 'tf-dg-entries';

export const DG_COUNTERS_KEY      = 'tf-dg-counters';

export const DG_HISTORY_KEY       = 'tf-dg-history';

export function loadDwarfGrudge() {
  try {
    const ent=lsGet(DG_ENTRIES_KEY); const cnt=lsGet(DG_COUNTERS_KEY); const hist=lsGet(DG_HISTORY_KEY);
    if (ent!==null) return { entries:JSON.parse(ent||'[]'), ...(cnt?JSON.parse(cnt):{resolvedCount:0,unresolvedCount:0,grudgePoints:0,revengeStreak:0,mercyStreak:0}), history:JSON.parse(hist||'[]') };
    return JSON.parse(lsGet(DWARF_GRUDGE_KEY)||'{"entries":[],"resolvedCount":0,"unresolvedCount":0,"grudgePoints":0,"revengeStreak":0,"mercyStreak":0,"history":[]}');
  } catch(e) { return {entries:[],resolvedCount:0,unresolvedCount:0,grudgePoints:0,revengeStreak:0,mercyStreak:0,history:[]}; }
}
window.loadDwarfGrudge = loadDwarfGrudge;

export function saveDwarfGrudge(d) {
  try {
    lsSet(DG_ENTRIES_KEY,  JSON.stringify(d.entries||[]));
    lsSet(DG_COUNTERS_KEY, JSON.stringify({resolvedCount:d.resolvedCount||0,unresolvedCount:d.unresolvedCount||0,grudgePoints:d.grudgePoints||0,revengeStreak:d.revengeStreak||0,mercyStreak:d.mercyStreak||0}));
    lsSet(DG_HISTORY_KEY,  JSON.stringify(d.history||[]));
    lsSet(DWARF_GRUDGE_KEY,JSON.stringify(d));
  } catch(e) {}
}
window.saveDwarfGrudge = saveDwarfGrudge;

export const clearDwarfGrudge = () => { lsDel(DWARF_GRUDGE_KEY); lsDel(DG_ENTRIES_KEY); lsDel(DG_COUNTERS_KEY); lsDel(DG_HISTORY_KEY); };

export function isDwarfRace() {
  const r = S.character?.race || '';
  return r.includes('드워프') || r.includes('dwarf');
}
window.isDwarfRace = isDwarfRace;

export function addGrudgeEntry(type, target, note) {
  if (!isDwarfRace()) return;
  const dg = loadDwarfGrudge();
  const def = GRUDGE_TYPES.find(t => t.id === type);
  dg.entries = dg.entries || [];
  dg.entries.push({
    id: Date.now(), type, label: def?.label || type, icon: def?.icon || '📋',
    target: target || '알 수 없는 자', note: note || '',
    weight: def?.weight || 1, status: 'open',
    addedAt: new Date().toISOString().slice(0, 10),
    resolvedAt: null, resolution: null
  });
  dg.unresolvedCount = (dg.entries.filter(e => e.status === 'open')).length;
  dg.history = dg.history || [];
  dg.history.push({ event: '원한 등록', label: def?.label || type, icon: def?.icon || '📋', target: target || '', at: new Date().toISOString().slice(0, 16) });
  
  saveDwarfGrudge(dg);
  applyDwarfGrudgeStats();
  toastHTML(`📋 원한 기록됨: ${esc(def?.icon || '')} ${esc(def?.label || type)} — ${esc(target || '')}`, 3000);
}
window.addGrudgeEntry = addGrudgeEntry;

export function resolveGrudgeEntry(entryId, resolutionId) {
  if (!isDwarfRace()) return;
  const dg = loadDwarfGrudge();
  const entry = (dg.entries || []).find(e => e.id === entryId);
  if (!entry || entry.status !== 'open') return;
  const res = GRUDGE_RESOLUTIONS.find(r => r.id === resolutionId);
  if (!res) return;

  entry.status = 'resolved';
  entry.resolution = resolutionId;
  entry.resolvedAt = new Date().toISOString().slice(0, 10);
  dg.resolvedCount = (dg.resolvedCount || 0) + 1;
  dg.unresolvedCount = (dg.entries.filter(e => e.status === 'open')).length;
  dg.grudgePoints = Math.min(500, (dg.grudgePoints || 0) + entry.weight * 10);

  // 연속 복수/화해 스트릭
  if (resolutionId === 'revenge') dg.revengeStreak = (dg.revengeStreak || 0) + 1;
  else dg.revengeStreak = 0;
  if (resolutionId === 'forgiveness') dg.mercyStreak = (dg.mercyStreak || 0) + 1;
  else dg.mercyStreak = 0;

  // 해결 보너스 스탯 적용 (중복 방지: entry에 _bonusApplied 플래그)
  if (res.bonus && !entry._bonusApplied) {
    entry._bonusApplied = true;
    Object.entries(res.bonus).forEach(([k, v]) => {
      S.stats[k] = Math.min(999, (S.stats[k] || 50) + v);
    });
    if (typeof saveStats === 'function') saveStats(S.stats);
  }

  dg.history.push({ event: `해결(${res.label})`, label: entry.label, icon: res.icon, target: entry.target, at: new Date().toISOString().slice(0, 16) });
  saveDwarfGrudge(dg);
  applyDwarfGrudgeStats();

  // 각인 연동
  if (typeof gainDwarfCraft === 'function') gainDwarfCraft('engrave', 8);

  // 스킬 해금 확인
  if (dg.revengeStreak >= 3 && !S.unlockedSkills?.['dg_revenge_chain']) {
    S.unlockedSkills = S.unlockedSkills || {};
    S.unlockedSkills['dg_revenge_chain'] = true;
    if (typeof saveSkills === 'function') saveSkills(S.unlockedSkills);
    setTimeout(() => toast('🔓 복수 연쇄 스킬 해금: ⚔️🩸 원한의 연쇄', 4000), 600);
  }
  if (dg.mercyStreak >= 2 && !S.unlockedSkills?.['dg_mercy_strength']) {
    S.unlockedSkills = S.unlockedSkills || {};
    S.unlockedSkills['dg_mercy_strength'] = true;
    if (typeof saveSkills === 'function') saveSkills(S.unlockedSkills);
    setTimeout(() => toast('🔓 화해 스킬 해금: 🤝 바위 같은 용서', 4000), 600);
  }

  toast(`원한 해결! ${entry.icon} ${entry.label} (${entry.target}) → ${res.label}`, 4000, res);
  renderDwarfGrudgePanel();
}
window.resolveGrudgeEntry = resolveGrudgeEntry;

export function applyDwarfGrudgeStats() {
  if (!isDwarfRace()) return;
  const dg = loadDwarfGrudge();
  const unresolved = (dg.entries || []).filter(e => e.status === 'open').length;
  const totalWeight = (dg.entries || []).filter(e => e.status === 'open').reduce((a, b) => a + (b.weight || 1), 0);

  const prev = S._dwarfGrudgeBonus || {};
  Object.entries(prev).forEach(([k, v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });
  const nb = {};

  // 미해결 원한 → 분노 보너스 + 협상 패널티
  const angerBonus = Math.min(30, totalWeight * 4);
  const trustPenalty = Math.min(20, unresolved * 3);
  if (angerBonus > 0) { S.stats.str = Math.min(999, (S.stats.str || 50) + angerBonus); nb.str = angerBonus; }
  if (angerBonus > 0) { S.stats.fear = Math.min(999, (S.stats.fear || 50) + Math.round(angerBonus * 0.7)); nb.fear = Math.round(angerBonus * 0.7); }
  if (trustPenalty > 0) { S.stats.trst = Math.max(0, (S.stats.trst || 50) - trustPenalty); }
  if (trustPenalty > 0) { S.stats.cha = Math.max(0, (S.stats.cha || 50) - Math.round(trustPenalty * 0.6)); }

  // 해결 포인트 누적 보너스
  const resolveBonus = Math.min(25, Math.floor((dg.grudgePoints || 0) / 20));
  if (resolveBonus > 0) { S.stats.wil = Math.min(999, (S.stats.wil || 50) + resolveBonus); nb.wil = resolveBonus; }

  S._dwarfGrudgeBonus = nb;
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
}
window.applyDwarfGrudgeStats = applyDwarfGrudgeStats;

export function detectDwarfGrudgeFromText(text) {
  if (!text || !isDwarfRace()) return;
  if (/배신|배반했|뒤통수|속였/.test(text) && Math.random() < 0.5) addGrudgeEntry('betrayal', '알 수 없는 자', 'AI 서사 자동 감지');
  if (/빼앗겼|훔쳐|약탈|도둑/.test(text) && Math.random() < 0.4) addGrudgeEntry('theft', '약탈자', 'AI 서사 자동 감지');
  if (/모욕|비웃|무시했|깔봤/.test(text) && Math.random() < 0.4) addGrudgeEntry('insult', '모욕한 자', 'AI 서사 자동 감지');
}
window.detectDwarfGrudgeFromText = detectDwarfGrudgeFromText;

export function renderDwarfGrudgePanel() {
  const body = document.getElementById('pb-dwarf-grudge');
  if (!body) return;
  if (!isDwarfRace()) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px"><div style="font-size:32px;margin-bottom:10px">📋</div><div>드워프족 캐릭터에게만 활성화됩니다.</div></div>`;
    return;
  }
  const dg = loadDwarfGrudge();
  const unresolved = (dg.entries || []).filter(e => e.status === 'open');
  const resolved   = (dg.entries || []).filter(e => e.status === 'resolved');
  const totalWeight = unresolved.reduce((a, b) => a + (b.weight || 1), 0);
  const angerLevel  = Math.min(100, totalWeight * 10);
  const color = angerLevel > 60 ? '#e05050' : angerLevel > 30 ? '#d07030' : '#c09050';
  const npcs = (S.npcs || []).filter(n => n.active !== false);

  body.innerHTML = `
    <!-- ① 헤더 -->
    <div style="padding:14px;background:linear-gradient(135deg,#180000,#220800);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:28px">📋</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">원한 장부</div>
          <div style="font-size:9px;color:#806040;margin-top:2px">미해결 ${unresolved.length}건 | 해결 ${resolved.length}건 | 해결 공적 ${dg.grudgePoints||0}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:20px;color:${color}">${angerLevel}<span style="font-size:9px;color:#6a3020"> / 100</span></div>
          <div style="font-size:8px;color:#6a3020">분노 수위</div>
        </div>
      </div>
      <!-- 분노 게이지 -->
      <div style="height:8px;background:#180000;border-radius:4px;overflow:hidden;margin-bottom:4px;border:1px solid #401010">
        <div style="width:${angerLevel}%;height:100%;background:linear-gradient(90deg,#601010,${color});border-radius:4px;transition:width .4s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:8px;color:#6a3020"><span>평온</span><span>격노</span></div>
      ${angerLevel > 0 ? `<div style="margin-top:6px;padding:5px 8px;background:#200000;border:1px solid #601010;border-radius:2px;font-size:9px;color:${color}">
        ⚔️ 분노 보너스: STR +${Math.min(30, totalWeight*4)}, FEAR +${Math.min(21, Math.round(totalWeight*4*0.7))} | ⚠️ TRST -${Math.min(20, unresolved.length*3)}, CHA -${Math.min(12, Math.round(unresolved.length*3*0.6))}
      </div>` : ''}
    </div>

    <!-- ② 미해결 원한 목록 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0800">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:8px">── 미해결 원한 (${unresolved.length}건) ──</div>
      ${unresolved.length === 0
        ? `<div style="font-size:9px;color:#4a2010;text-align:center;padding:8px">장부가 깨끗하다</div>`
        : unresolved.map(e => `
          <div style="padding:8px 10px;background:#1a0000;border:1px solid ${e.weight>=3?color:'#601010'};margin-bottom:5px;border-radius:2px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
              <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(e,{size:16}):(e.icon)}</span>
              <div style="flex:1">
                <div style="font-family:'Cinzel',serif;font-size:10px;color:${color}">${esc(e.label)} — <span style="color:#e07050">${esc(e.target)}</span></div>
                <div style="font-size:8px;color:#804040">${e.note ? esc(e.note.slice(0,40)) : ''} | 무게: ${'🪨'.repeat(e.weight)} | 등록: ${e.addedAt}</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px">
              ${GRUDGE_RESOLUTIONS.map(r => `
                <button onclick="resolveGrudgeEntry(${e.id},'${r.id}')"
                  style="padding:4px 2px;background:#180000;border:1px solid #601020;color:#d06040;font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif;text-align:center">
                  ${r.icon}<br>${r.label}
                </button>`).join('')}
            </div>
          </div>`).join('')}
    </div>

    <!-- ③ 원한 등록 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0800">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 원한 기록 ──</div>
      <select id="grudge-npc-select" onchange="(function(){const i=document.getElementById('grudge-target-input');if(i&&this.value)i.value=this.value;}).call(this)" style="width:100%;padding:5px;background:#180000;border:1px solid #601010;color:#e06050;font-size:9px;border-radius:2px;margin-bottom:5px">
        <option value="">— 대상 직접 입력 또는 NPC 선택 —</option>
        ${npcs.map(n=>`<option value="${esc(n.name)}">${esc(n.name)}</option>`).join('')}
      </select>
      <input id="grudge-target-input" type="text" placeholder="대상 이름 (NPC 선택 또는 직접 입력)"
        style="width:100%;padding:5px;background:#180000;border:1px solid #601010;color:#e06050;font-size:9px;border-radius:2px;margin-bottom:6px;outline:none;box-sizing:border-box">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${GRUDGE_TYPES.map(t => `
          <button onclick="const s=document.getElementById('grudge-npc-select');const i=document.getElementById('grudge-target-input');const tgt=i?.value||s?.value||'알 수 없는 자';addGrudgeEntry('${t.id}',tgt,'');if(i)i.value='';renderDwarfGrudgePanel()"
            style="padding:6px;background:#180000;border:1px solid ${t.weight>=3?color+'66':'#601010'};color:${t.weight>=3?color:'#c06040'};font-size:9px;cursor:pointer;font-family:'Crimson Text',serif;text-align:left;border-radius:2px">
            ${typeof getEntityIconHTML==='function'?getEntityIconHTML(t,{size:8}):(t.icon)} ${t.label} <span style="float:right;font-size:8px;color:#804030">${'🪨'.repeat(t.weight)}</span>
          </button>`).join('')}
      </div>

    </div>

    <!-- ④ 해결된 원한 기록 -->
    ${resolved.length ? `
    <div style="padding:10px 12px;border-bottom:1px solid #1a0800">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#806040;letter-spacing:1px;margin-bottom:5px">── 해결된 원한 (${resolved.length}건) ──</div>
      ${resolved.slice(-8).reverse().map(e=>{
        const r = GRUDGE_RESOLUTIONS.find(x=>x.id===e.resolution);
        return `<div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #120000;font-size:9px;opacity:0.7">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:14}):(r?.icon||'✓')}</span>
          <span style="flex:1;color:#806040">${esc(e.label)} — ${esc(e.target)}</span>
          <span style="color:#60a060">${r?.label||'해결'}</span>
          <span style="color:#3a2010;font-size:8px">${e.resolvedAt||''}</span>
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- ⑤ 해금 스킬 표시 -->
    ${(dg.revengeStreak >= 3 || dg.mercyStreak >= 2) ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 해금된 원한 스킬 ──</div>
      ${dg.revengeStreak >= 3 ? `<div style="padding:6px 8px;background:#1a0000;border:1px solid #e0505055;border-radius:2px;font-size:9px;color:#e05050;margin-bottom:4px">⚔️🩸 원한의 연쇄 — 복수 3연속 완수. 복수 대상과의 전투에서 모든 공격 치명타 확률 +20%, STR +25.</div>` : ''}
      ${dg.mercyStreak >= 2 ? `<div style="padding:6px 8px;background:#001a00;border:1px solid #40a06055;border-radius:2px;font-size:9px;color:#50d090">🤝 바위 같은 용서 — 화해 2연속 달성. 협상·외교 판정 +25. 드워프 NPC 전체 호감도 +20.</div>` : ''}
    </div>` : ''}
  `;
}
window.renderDwarfGrudgePanel = renderDwarfGrudgePanel;

window.renderDwarfGrudgePanel    = renderDwarfGrudgePanel;

window.addGrudgeEntry            = addGrudgeEntry;

window.resolveGrudgeEntry        = resolveGrudgeEntry;

window.applyDwarfGrudgeStats     = applyDwarfGrudgeStats;

window.detectDwarfGrudgeFromText = detectDwarfGrudgeFromText;

window.loadDwarfGrudge           = loadDwarfGrudge;

window.clearDwarfGrudge          = clearDwarfGrudge;

export const DWARF_UNFINISHED_KEY = 'tf-dwarf-unfinished';

export const loadDwarfUnfinished  = () => {
  try {
    return JSON.parse(lsGet(DWARF_UNFINISHED_KEY) ||
      '{"works":[],"ancestorApproval":0,"ancestorCurse":0,"completedCount":0,"abandonedCount":0,"history":[],"legendaryWork":null}');
  } catch(e) {
    return {works:[], ancestorApproval:0, ancestorCurse:0, completedCount:0, abandonedCount:0, history:[], legendaryWork:null};
  }
};

export const saveDwarfUnfinished  = (d) => { try { lsSet(DWARF_UNFINISHED_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearDwarfUnfinished = () => lsDel(DWARF_UNFINISHED_KEY);

export const ANCESTOR_APPROVAL_STAGES = [
  { min:0,   name:'선조의 침묵',   icon:'🪨', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="17" rx="1" stroke-linejoin="round"/><path d="M9 4 L9 2 M15 4 L15 2" stroke-width="1.3"/></svg>`,  color:'#807060',
    desc:'선조들이 관심을 보이지 않는다.', bonus:{}, penalty:{},
    aiHint:'선조들이 이 드워프를 주목하지 않는다.' },
  { min:30,  name:'선조의 눈길',   icon:'👁️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 C2 12 6 6 12 6 C18 6 22 12 22 12 C22 12 18 18 12 18 C6 18 2 12 2 12 Z" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.5"/></svg>`,  color:'#a08040',
    desc:'선조가 가끔 지켜본다. 작업장에서 이상한 기운이 느껴진다.', bonus:{str:5, end:4, per:4}, penalty:{},
    aiHint:'선조들이 이 드워프를 관찰하고 있다. 작업 시 손이 저절로 움직이는 느낌.' },
  { min:80,  name:'선조의 손길',   icon:'🤚', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 12 M12 12 C12 12 8 10 8 6 C8 4.5 9.2 3.5 10.5 3.5 C11.3 3.5 12 4 12 5 C12 4 12.7 3.5 13.5 3.5 C14.8 3.5 16 4.5 16 6 C16 10 12 12 12 12 Z" stroke-linejoin="round"/></svg>`,  color:'#c09040',
    desc:'선조가 가끔 손을 이끈다. 단조 작업에서 불가사의한 정확성이 발휘된다.', bonus:{str:12, end:10, per:10, int:8, crit:6}, penalty:{},
    aiHint:'선조들의 손길이 느껴진다. 작업 중 예상 이상의 품질이 나온다.' },
  { min:160, name:'선조의 인정',   icon:'🏆', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4.5" stroke-width="1.4"/><path d="M9.3 12 L7 21 L12 18.5 L17 21 L14.7 12"/></svg>`,  color:'#d0a050',
    desc:'선조들이 이 드워프를 진정한 장인으로 인정했다.', bonus:{str:22, end:18, per:18, int:14, crit:12, ldr:8}, penalty:{},
    aiHint:'선조들이 공식 인정. 작업실에 선조 유령이 보조로 나타난다.' },
  { min:280, name:'선조의 축복',   icon:'⭐', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></svg>`,  color:'#e8b860',
    desc:'선조 전체가 이 드워프를 후계자로 인정한다.', bonus:{str:36, end:30, per:28, int:22, crit:18, ldr:14, fear:10}, penalty:{},
    aiHint:'선조 전체의 힘이 깃들었다. 만지는 모든 금속이 최고 품질로 완성된다.' },
  { min:440, name:'선조와 합일',   icon:'🌟', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.2"/><circle cx="12" cy="12" r="4" stroke-width="1.2"/><path d="M12 3 L12 8 M12 16 L12 21 M3 12 L8 12 M16 12 L21 12" stroke-width="1"/></svg>`,  color:'#ffd700',
    desc:'이 드워프가 곧 선조다. 수천 년 장인 지혜가 몸에 흐른다.', bonus:{str:55, end:48, per:42, int:34, crit:28, ldr:22, fear:18, luk:12}, penalty:{},
    aiHint:'선조와 하나가 됐다. 이 드워프의 손에서 탄생하는 것은 모두 전설이 된다.' },
];

export function getCurseDebuff(curse) {
  if (curse <= 0) return {};
  return {
    str: -Math.min(20, Math.floor(curse / 5)),
    per: -Math.min(15, Math.floor(curse / 6)),
    luk: -Math.min(12, Math.floor(curse / 8)),
    int: -Math.min(10, Math.floor(curse / 9)),
  };
}
window.getCurseDebuff = getCurseDebuff;

export function getApprovalStage(ap) {
  let s = ANCESTOR_APPROVAL_STAGES[0];
  for (const st of ANCESTOR_APPROVAL_STAGES) { if (ap >= st.min) s = st; }
  return s;
}
window.getApprovalStage = getApprovalStage;

export function registerUnfinishedWork(difficultyId, name, targetNpc) {
  if (!isDwarfRace()) return;
  const du = loadDwarfUnfinished();
  const def = WORK_DIFFICULTIES.find(d => d.id === difficultyId);
  if (!def) return;
  const active = (du.works || []).filter(w => w.status === 'active');
  if (active.length >= 10) { toast('⚠️ 최대 10개 작업만 동시 진행할 수 있습니다.'); return; }
  du.works = du.works || [];
  du.works.push({
    id: Date.now(), name: name || def.label, difficulty: difficultyId,
    label: def.label, icon: def.icon, target: targetNpc || '',
    status: 'active', startedAt: new Date().toISOString().slice(0, 10),
    completedAt: null
  });
  du.history = du.history || [];
  du.history.push({ event: '작업 시작', name: name || def.label, icon: def.icon, at: new Date().toISOString().slice(0, 16) });
  
  saveDwarfUnfinished(du);
  applyDwarfUnfinishedStats();
  toastHTML(`⚒️ 작업 시작: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} ${esc(name || def.label)}`, 3000);
}
window.registerUnfinishedWork = registerUnfinishedWork;

export function completeUnfinishedWork(workId) {
  if (!isDwarfRace()) return;
  const du = loadDwarfUnfinished();
  const work = (du.works || []).find(w => w.id === workId);
  if (!work || work.status !== 'active') return;
  const def = WORK_DIFFICULTIES.find(d => d.id === work.difficulty);

  work.status = 'completed';
  work.completedAt = new Date().toISOString().slice(0, 10);
  du.completedCount = (du.completedCount || 0) + 1;
  du.ancestorApproval = Math.min(600, (du.ancestorApproval || 0) + (def?.approval || 15));
  // 저주가 있으면 완성으로 일부 경감
  du.ancestorCurse = Math.max(0, (du.ancestorCurse || 0) - Math.round((def?.approval || 15) * 0.3));

  // 전설 완성 → 전설 작품 기록
  if (work.difficulty === 'legendary') {
    du.legendaryWork = { name: work.name, completedAt: work.completedAt };
    setTimeout(() => toast(`✨ 전설 단조 완성! "${work.name}" — 선조 전체가 환호한다!`, 5000), 400);
  }

  du.history.push({ event: '완성', name: work.name, icon: def?.icon || '⚒️', at: new Date().toISOString().slice(0, 16) });
  saveDwarfUnfinished(du);
  applyDwarfUnfinishedStats();

  // 각인 연동
  if (typeof gainDwarfCraft === 'function') gainDwarfCraft('forge', def?.approval || 15);

  // 선조 인정 단계 상승 확인
  const stg = getApprovalStage(du.ancestorApproval);
  toastHTML(`🏆 작업 완성! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(work,{size:14}):(work.icon)} ${esc(work.name)} — 선조 인정 +${esc(def?.approval || 15)}`, 4000);

  // 선조 합일 스킬 해금
  if (du.ancestorApproval >= 440 && !S.unlockedSkills?.['du_ancestor_unity']) {
    S.unlockedSkills = S.unlockedSkills || {};
    S.unlockedSkills['du_ancestor_unity'] = true;
    if (typeof saveSkills === 'function') saveSkills(S.unlockedSkills);
    setTimeout(() => toast('🔓 선조 합일 스킬 해금: 🌟 선조의 화신 — 전투 중 선조 유령 자동 소환, 스탯 전체 +25', 5000), 800);
  }
  renderDwarfUnfinishedPanel();
}
window.completeUnfinishedWork = completeUnfinishedWork;

export function abandonUnfinishedWork(workId) {
  if (!isDwarfRace()) return;
  if (!confirm('⚠️ 이 작업을 포기하시겠습니까? 선조의 저주가 내립니다!')) return;
  const du = loadDwarfUnfinished();
  const work = (du.works || []).find(w => w.id === workId);
  if (!work || work.status !== 'active') return;
  const def = WORK_DIFFICULTIES.find(d => d.id === work.difficulty);

  work.status = 'abandoned';
  work.abandonedAt = new Date().toISOString().slice(0, 10);
  du.abandonedCount = (du.abandonedCount || 0) + 1;
  du.ancestorCurse = Math.min(100, (du.ancestorCurse || 0) + (def?.curseIfAbandoned || 12));
  du.ancestorApproval = Math.max(0, (du.ancestorApproval || 0) - Math.round((def?.approval || 15) * 0.5));

  du.history.push({ event: '포기(저주)', name: work.name, icon: '💔', at: new Date().toISOString().slice(0, 16) });
  saveDwarfUnfinished(du);
  applyDwarfUnfinishedStats();

  // 각인 포기 패널티
  if (typeof abandonDwarfWork === 'function') abandonDwarfWork();

  toastHTML(`💔 작업 포기! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(work,{size:14}):(work.icon)} ${esc(work.name)} — 선조의 저주 +${esc(def?.curseIfAbandoned || 12)}!`, 4000);
  renderDwarfUnfinishedPanel();
}
window.abandonUnfinishedWork = abandonUnfinishedWork;

export function purifyAncestorCurse(amount) {
  if (!isDwarfRace()) return;
  const du = loadDwarfUnfinished();
  const cost = amount === 'small' ? 10 : amount === 'medium' ? 20 : 40;
  const reduce = amount === 'small' ? 15 : amount === 'medium' ? 30 : 60;
  if ((du.ancestorCurse || 0) <= 0) { toast('저주가 없습니다.'); return; }
  du.ancestorCurse = Math.max(0, (du.ancestorCurse || 0) - reduce);
  du.history.push({ event: '저주 정화', name: `저주 -${reduce}`, icon: '✨', at: new Date().toISOString().slice(0, 16) });
  saveDwarfUnfinished(du);
  applyDwarfUnfinishedStats();
  toast(`✨ 저주 정화! 선조의 저주 -${reduce} (현재: ${du.ancestorCurse})`, 3000);
  renderDwarfUnfinishedPanel();
}
window.purifyAncestorCurse = purifyAncestorCurse;

export function applyDwarfUnfinishedStats() {
  if (!isDwarfRace()) return;
  const du = loadDwarfUnfinished();
  const stg = getApprovalStage(du.ancestorApproval || 0);
  const prev = S._dwarfUnfinishedBonus || {};
  Object.entries(prev).forEach(([k, v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });
  const nb = {};

  // 선조 인정 보너스
  Object.entries(stg.bonus || {}).forEach(([k, v]) => { S.stats[k] = Math.min(999, (S.stats[k] || 50) + v); nb[k] = v; });

  // 저주 패널티
  const debuff = getCurseDebuff(du.ancestorCurse || 0);
  Object.entries(debuff).forEach(([k, v]) => { S.stats[k] = Math.max(0, (S.stats[k] || 50) + v); });

  S._dwarfUnfinishedBonus = nb;
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
}
window.applyDwarfUnfinishedStats = applyDwarfUnfinishedStats;

export function detectDwarfUnfinishedFromText(text) {
  if (!text || !isDwarfRace()) return;
  if (/완성했|제작했|단조했|만들었/.test(text) && Math.random() < 0.4) {
    const du = loadDwarfUnfinished();
    const activeWork = (du.works || []).find(w => w.status === 'active');
    if (activeWork) completeUnfinishedWork(activeWork.id);
  }
}
window.detectDwarfUnfinishedFromText = detectDwarfUnfinishedFromText;

export function renderDwarfUnfinishedPanel() {
  const body = document.getElementById('pb-dwarf-unfinished');
  if (!body) return;
  if (!isDwarfRace()) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px"><div style="font-size:32px;margin-bottom:10px">⚒️</div><div>드워프족 캐릭터에게만 활성화됩니다.</div></div>`;
    return;
  }
  const du = loadDwarfUnfinished();
  const approval = du.ancestorApproval || 0;
  const curse = du.ancestorCurse || 0;
  const stg = getApprovalStage(approval);
  const color = stg.color;
  const activeWorks = (du.works || []).filter(w => w.status === 'active');
  const debuff = getCurseDebuff(curse);

  body.innerHTML = `
    <!-- ① 헤더: 선조 인정 -->
    <div style="padding:14px;background:linear-gradient(135deg,#0a0018,#120022);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#6040a0;margin-top:2px">인정 ${approval} | 저주 ${curse}/100 | 완성 ${du.completedCount||0}회</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:16px;color:${color}">${approval}<span style="font-size:8px;color:#5040a0">/600</span></div>
          <div style="font-size:8px;color:#5040a0">선조 인정</div>
        </div>
      </div>
      <!-- 인정도 바 -->
      <div style="height:6px;background:#0a0018;border-radius:3px;overflow:hidden;margin-bottom:3px;border:1px solid #3a1060">
        <div style="width:${Math.min(100,Math.round(approval/6))}%;height:100%;background:linear-gradient(90deg,#4020a0,${color});border-radius:3px;transition:width .4s"></div>
      </div>
      <div style="font-size:8px;color:#5040a0;margin-bottom:6px">"${stg.desc}"</div>
      <!-- 저주 바 -->
      ${curse > 0 ? `
        <div style="padding:5px 8px;background:#1a0000;border:1px solid #601010;border-radius:2px;margin-bottom:4px">
          <div style="display:flex;justify-content:space-between;font-size:8px;color:#e05050;margin-bottom:3px"><span>⚠️ 선조의 저주</span><span>${curse}/100</span></div>
          <div style="height:5px;background:#180000;border-radius:3px;overflow:hidden">
            <div style="width:${curse}%;height:100%;background:linear-gradient(90deg,#601010,#e04040);border-radius:3px"></div>
          </div>
          <div style="margin-top:3px;font-size:8px;color:#c05050">${Object.entries(debuff).map(([k,v])=>`${k.toUpperCase()} ${v}`).join(' | ')}</div>
        </div>` : ''}
      ${du.legendaryWork ? `<div style="padding:5px 8px;background:#1a1200;border:1px solid ${color};border-radius:2px;font-size:9px;color:${color}">✨ 전설 작품: "${esc(du.legendaryWork.name)}" (${du.legendaryWork.completedAt})</div>` : ''}
    </div>

    <!-- ② 선조 인정 단계 목록 -->
    <div style="padding:8px 12px;border-bottom:1px solid #160028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 선조 인정 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${[...ANCESTOR_APPROVAL_STAGES].reverse().map(s => {
          const active = s.name === stg.name;
          const passed = approval > s.min && !active;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#1a0030':passed?'#0f0020':'#0a0015'};border:1px solid ${active?s.color:passed?s.color+'44':'#160028'};border-radius:2px;opacity:${active||passed?1:0.35}">
            <span style="display:inline-flex;width:11px;height:11px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:11}):((s.svgIcon||'').replace('width="20" height="20"','width="11" height="11"')||s.icon)}</span>
            <div style="flex:1"><span style="font-family:'Cinzel',serif;font-size:9px;color:${active?s.color:passed?s.color:'#5040a0'}">${s.name}</span><span style="font-size:8px;color:#3a2060;margin-left:4px">(${s.min}+)</span></div>
            ${active?`<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀</span>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ③ 진행 중인 작업 -->
    <div style="padding:10px 12px;border-bottom:1px solid #160028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 진행 중인 작업 (${activeWorks.length}/3) ──</div>
      ${activeWorks.length === 0
        ? `<div style="font-size:9px;color:#4030a0;text-align:center;padding:8px">진행 중인 작업이 없습니다</div>`
        : activeWorks.map(w => {
            const def = WORK_DIFFICULTIES.find(d => d.id === w.difficulty);
            return `<div style="padding:8px 10px;background:#0e0020;border:1px solid ${w.difficulty==='legendary'?color:'#4020a0'};margin-bottom:5px;border-radius:2px">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
                <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(w,{size:16}):(w.icon)}</span>
                <div style="flex:1">
                  <div style="font-family:'Cinzel',serif;font-size:10px;color:${color}">${esc(w.name)}</div>
                  <div style="font-size:8px;color:#6040a0">${def?.label||w.difficulty} | 시작: ${w.startedAt}</div>
                </div>
                <div style="text-align:right;font-size:8px;color:#8060c0">완성+${def?.approval||15}<br>포기-${def?.curseIfAbandoned||12}</div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
                <button onclick="completeUnfinishedWork(${w.id})"
                  style="padding:5px;background:#001a00;border:1px solid #40a060;color:#60d090;font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">✅ 완성</button>
                <button onclick="abandonUnfinishedWork(${w.id})"
                  style="padding:5px;background:#1a0000;border:1px solid #801030;color:#e05050;font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">💔 포기</button>
              </div>
            </div>`;
          }).join('')}
    </div>

    <!-- ④ 작업 등록 -->
    <div style="padding:10px 12px;border-bottom:1px solid #160028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 새 작업 시작 ──</div>
      <input id="work-name-input" type="text" placeholder="작품 이름 (선택 사항)"
        style="width:100%;padding:5px;background:#0e0018;border:1px solid #4020a0;color:#a080d0;font-size:9px;border-radius:2px;margin-bottom:6px;outline:none;box-sizing:border-box">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${WORK_DIFFICULTIES.map(d => `
          <button onclick="const n=document.getElementById('work-name-input');registerUnfinishedWork('${d.id}',n?n.value:'','');if(n)n.value='';renderDwarfUnfinishedPanel()"
            style="padding:6px;background:#0e0018;border:1px solid ${d.id==='legendary'?color:'#4020a0'};color:${d.id==='legendary'?color:'#a080d0'};font-size:9px;cursor:pointer;font-family:'Crimson Text',serif;text-align:left;border-radius:2px;line-height:1.4">
            ${typeof getEntityIconHTML==='function'?getEntityIconHTML(d,{size:8}):(d.icon)} <span style="font-family:'Cinzel',serif;font-size:8px">${d.label}</span><br>
            <span style="font-size:7px;color:#6040a0">완성 +${d.approval} | 포기 저주 +${d.curseIfAbandoned}</span>
          </button>`).join('')}
      </div>
    </div>

    <!-- ⑤ 저주 정화 -->
    ${curse > 0 ? `
    <div style="padding:10px 12px;border-bottom:1px solid #160028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#e05050;letter-spacing:1px;margin-bottom:6px">── 저주 정화 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
        <button onclick="purifyAncestorCurse('small')" style="padding:6px;background:#0e0018;border:1px solid #801030;color:#e05050;font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">🕯️ 소형 의식<br>-15 저주</button>
        <button onclick="purifyAncestorCurse('medium')" style="padding:6px;background:#0e0018;border:1px solid #801030;color:#e05050;font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">🪔 중형 의식<br>-30 저주</button>
        <button onclick="purifyAncestorCurse('large')" style="padding:6px;background:#0e0018;border:1px solid #801030;color:#e05050;font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">🔥 대형 의식<br>-60 저주</button>
      </div>
    </div>` : ''}

    <!-- ⑥ 최근 기록 -->
    ${(du.history||[]).length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 작업 기록 ──</div>
      ${[...du.history].reverse().slice(0,10).map(h=>`
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0a0015;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#7050a0">${esc(h.name||h.event)}</span>
          <span style="color:${h.event.includes('포기')?'#e05050':h.event.includes('완성')?'#60d090':color}">${h.event}</span>
          <span style="color:#3a2060;font-size:8px">${h.at||''}</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderDwarfUnfinishedPanel = renderDwarfUnfinishedPanel;

window.renderDwarfUnfinishedPanel    = renderDwarfUnfinishedPanel;

window.registerUnfinishedWork        = registerUnfinishedWork;

window.completeUnfinishedWork        = completeUnfinishedWork;

window.abandonUnfinishedWork         = abandonUnfinishedWork;

window.purifyAncestorCurse           = purifyAncestorCurse;

window.applyDwarfUnfinishedStats     = applyDwarfUnfinishedStats;

window.detectDwarfUnfinishedFromText = detectDwarfUnfinishedFromText;

window.loadDwarfUnfinished           = loadDwarfUnfinished;

window.clearDwarfUnfinished          = clearDwarfUnfinished;

export const ORC_HONOR_KEY = "tf-orc-honor";

export const loadOrcHonor = () => {
  try {
    const raw = lsGet(ORC_HONOR_KEY);
    if (raw) return JSON.parse(raw);
    return {
      points: 0, stage: 0,
      lineage: { honor: 0, fear: 0, wisdom: 0 },
      history: [],
      oath: null,          // { text, type, cycle, fulfilled: null }
      oathBroken: 0,
      oathFulfilled: 0,
      awakened: false,
      awakenPath: null     // "honor" | "fear" | "wisdom"
    };
  } catch(e) {
    return { points:0, stage:0, lineage:{honor:0,fear:0,wisdom:0}, history:[], oath:null, oathBroken:0, oathFulfilled:0, awakened:false, awakenPath:null };
  }
};

export const saveOrcHonor  = (d) => { try { lsSet(ORC_HONOR_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearOrcHonor = () => lsDel(ORC_HONOR_KEY);

export const ORC_HONOR_STAGES = [
  {
    stage: 0, name: "새내기 전사", icon: "😤", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z" opacity="0.5"/></svg>`,
    color: "#b06030", threshold: 0,
    desc: "아직 전장의 피를 충분히 마시지 않은 자. 업보의 씨앗이 심겨지기 시작한다.",
    statBonus: {}, statPenalty: {},
    skills: [],
    aura: "전투 경험이 부족해 보인다. 하지만 눈 속에 야성이 깃들어 있다.",
    aiHint: ""
  },
  {
    stage: 1, name: "붉은 손", icon: "🩸😤", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><circle cx="6" cy="18" r="1.6" fill="currentColor" stroke="none"/></svg>`,
    color: "#c05020", threshold: 50,
    desc: "첫 전투의 흔적이 영혼에 새겨졌다. 공포와 명예 사이에서 첫 선택을 맞는다.",
    statBonus: { str: 5, end: 4, fear: 3 },
    statPenalty: {},
    skills: [
      { id:"oh_s1_battlecry", name:"전투의 외침", icon:"📣", type:"active",
        desc:"STR+10, FEAR+8 부여. 아군 사기 상승, 적 첫 행동 판정 -10. 명예업보+2.",
        rarity:"uncommon", mpCost:0, condition:null, conditionDesc:null, statBoost:{} }
    ],
    aura: "전쟁터에서 이 이름이 조용히 오르내리기 시작한다.",
    aiHint: "1단계 업보: 오크 캐릭터가 전투 후 피를 닦으며 결연한 눈빛을 보인다."
  },
  {
    stage: 2, name: "전장의 맹세자", icon: "⚔️😤", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4 L8 20 M16 4 L16 20" stroke-width="1.6"/><path d="M8 12 L16 12" stroke-width="1.3"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>`,
    color: "#d04810", threshold: 130,
    desc: "첫 맹세를 선언했다. 동료들이 이 맹세를 기억하고 신뢰를 보내기 시작한다.",
    statBonus: { str: 10, end: 8, fear: 6, wil: 5 },
    statPenalty: { cha: -3 },
    skills: [
      { id:"oh_s2_oath_strike", name:"맹세의 일격", icon:"🗡️", type:"active",
        desc:"MP15. 현재 맹세 목표와 관련된 전투에서 판정+20, 치명타 확률+15%. 맹세 없으면 발동 불가.",
        rarity:"rare", mpCost:15, condition:"oath_active", conditionDesc:"맹세 선언 시", statBoost:{} },
      { id:"oh_s2_war_scar", name:"전쟁의 흉터", icon:"🩹", type:"passive",
        desc:"전투에서 피해받을수록 STR+1씩 누적(최대+15). 회복 후 초기화.",
        rarity:"uncommon", mpCost:0, condition:"taking_damage", conditionDesc:"피해받을 때마다", statBoost:{str:15} }
    ],
    aura: "부족민들이 이 전사의 맹세를 진지하게 듣기 시작한다.",
    aiHint: "2단계 업보: 오크의 전투 방식에 일관성이 생겼다. 적들이 이 이름을 기억하기 시작한다."
  },
  {
    stage: 3, name: "업보의 전사", icon: "🔥😤", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/></svg>`,
    color: "#e03800", threshold: 250,
    desc: "세 계열 업보 중 가장 강한 계열이 각성하기 시작한다. 전사의 방향성이 결정된다.",
    statBonus: { str: 16, end: 14, fear: 12, wil: 8, agi: 5 },
    statPenalty: { cha: -5, trst: -4 },
    skills: [
      { id:"oh_s3_bloodtide", name:"피의 조류", icon:"🌊", type:"passive",
        desc:"전투 3턴 이후부터 매 턴 STR+3 자동 상승(최대+24). 전투 종료 시 초기화.",
        rarity:"rare", mpCost:0, condition:"combat_3turn", conditionDesc:"전투 3턴 후 자동", statBoost:{str:40} },
      { id:"oh_s3_honor_judge", name:"전사의 심판", icon:"⚖️", type:"active",
        desc:"MP20. 비무장 상대나 포로 학살 거부. 명예업보+5. 다음 전투 판정+15.",
        rarity:"rare", mpCost:20, condition:null, conditionDesc:null, statBoost:{} }
    ],
    aura: "이 전사가 지나간 전장에는 패배한 적도 존중받는다는 소문이 돈다.",
    aiHint: "3단계 업보: 오크 캐릭터의 전투 철학이 드러나기 시작한다. 계열에 따라 압도적이거나, 자비롭거나, 전술적인 전투 묘사를 포함하라."
  },
  {
    stage: 4, name: "계열 각성자", icon: "🌋😤", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round" opacity="0.7"/></svg>`,
    color: "#f02800", threshold: 400,
    desc: "지배적인 업보 계열로 완전히 각성했다. 명예·공포·지혜 중 하나의 힘이 폭발한다.",
    statBonus: { str: 24, end: 22, fear: 18, wil: 14, agi: 10 },
    statPenalty: { cha: -8, trst: -7 },
    skills: [
      { id:"oh_s4_lineage_burst", name:"계열 폭발", icon:"💥", type:"active",
        desc:"MP35. 지배 계열에 따라 발동 효과가 달라지는 각성 스킬. (아래 설명 참조)",
        rarity:"epic", mpCost:35, condition:null, conditionDesc:null, statBoost:{} },
      { id:"oh_s4_warpath", name:"전쟁 행로", icon:"🗺️", type:"passive",
        desc:"이동·전투·탐험 모든 판정에서 STR을 보조 스탯으로 추가 적용. 길을 막는 자 없음.",
        rarity:"epic", mpCost:0, condition:"always", conditionDesc:"항시 발동", statBoost:{str:60, agi:40} }
    ],
    aura: "전쟁 신이 이 전사의 이름을 기억한다는 소문이 부족 사이에 퍼진다.",
    aiHint: "4단계 업보: 각성한 계열이 전투와 대화 묘사에 강하게 드러나야 한다. 명예=당당함, 공포=압도감, 지혜=예측 불가능한 전술."
  },
  {
    stage: 5, name: "부족의 영웅", icon: "👑😤", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/></svg>`,
    color: "#ff1500", threshold: 580,
    desc: "부족 전체가 이 전사를 따른다. 전장에서의 존재감이 전쟁의 흐름을 바꾼다.",
    statBonus: { str: 35, end: 30, fear: 28, wil: 22, agi: 18, rep: 12 },
    statPenalty: { cha: -10, trst: -9 },
    skills: [
      { id:"oh_s5_tribe_call", name:"부족 소환", icon:"🐾", type:"active",
        desc:"MP50. 부족 전사 2~4명을 전투에 소환. 지혜업보 높을수록 정예 전사 소환. 3턴 지속.",
        rarity:"legendary", mpCost:50, condition:null, conditionDesc:null, statBoost:{} },
      { id:"oh_s5_unbreakable", name:"불굴의 의지", icon:"🪨", type:"passive",
        desc:"HP 25% 이하에서 모든 스탯 +20, 도발 면역, 공포 면역. 쓰러지지 않는다.",
        rarity:"legendary", mpCost:0, condition:"low_hp", conditionDesc:"HP 25% 이하", statBoost:{str:80, end:80, fear:60} }
    ],
    aura: "오크 전사들이 이 이름을 전장에서 외친다. 적들은 이 이름을 듣는 것만으로 사기가 꺾인다.",
    aiHint: "5단계 업보: 캐릭터의 명성이 전장 이전부터 울려 퍼진다. NPC 오크들이 자발적으로 부족원으로 합류하려 한다."
  },
  {
    stage: 6, name: "전쟁족장", icon: "⚔️👑", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round" stroke-width="1" opacity="0.6"/></svg>`,
    color: "#ff0000", threshold: 800,
    desc: "전장의 법칙이 이 전사를 중심으로 재편된다. 패배한 적도 충성을 맹세하기 시작한다.",
    statBonus: { str: 50, end: 45, fear: 42, wil: 35, agi: 28, rep: 25, mad: 10 },
    statPenalty: { cha: -12, trst: -12 },
    skills: [
      { id:"oh_s6_war_decree", name:"전쟁 포고", icon:"📯", type:"active",
        desc:"HP0 소모 불필요. 전장 모든 아군 STR+20, 적 전체 사기 판정 -25. 선언 후 3턴 유지.",
        rarity:"legendary", mpCost:0, condition:null, conditionDesc:null, statBoost:{str:200, fear:180} },
      { id:"oh_s6_conquer", name:"정복의 각인", icon:"🔱", type:"event",
        desc:"패배한 적 대장에게 정복의 각인을 새겨 영구 부하로 만든다. 단, 약자를 학살한 직후에는 발동 불가.",
        rarity:"legendary", mpCost:0, condition:"enemy_defeated", conditionDesc:"적 대장 제압 시", statBoost:{} }
    ],
    aura: "이 전사가 선 자리가 곧 전장의 중심이 된다. 신들도 이 전쟁을 지켜보고 있다.",
    aiHint: "6단계 업보: 캐릭터의 존재 자체가 전쟁의 분위기를 결정한다. 적들이 전투 전부터 이 이름을 두려워하는 묘사 필수."
  },
  {
    stage: 7, name: "전쟁신의 화신", icon: "🌋⚔️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/></svg>`,
    color: "#ff0000", threshold: 1000,
    desc: "업보가 극에 달했다. 전쟁신 '고르'가 이 전사의 몸을 빌려 세상에 군림한다.",
    statBonus: { str: 70, end: 65, fear: 60, wil: 50, agi: 42, rep: 38, mad: 20 },
    statPenalty: { cha: -15, trst: -15 },
    skills: [
      { id:"oh_s7_gorwrath", name:"고르의 진노", icon:"🌋", type:"active",
        desc:"HP 60 소모. 전쟁신의 힘 완전 해방. 전장 반경 내 모든 적에게 공포 상태 부여 + 전투 판정 무조건 성공 1회.",
        rarity:"legendary", mpCost:0, condition:null, conditionDesc:null, statBoost:{} },
      { id:"oh_s7_eternal_warrior", name:"불멸의 전사", icon:"♾️", type:"passive",
        desc:"전투에서 사망 시 '전쟁 분노' 상태로 부활 (HP 50% 복구, 1회만). 부활 시 업보 +15.",
        rarity:"legendary", mpCost:0, condition:"on_death", conditionDesc:"사망 시 발동", statBoost:{str:480, end:460, fear:420, wil:320} }
    ],
    aura: "전쟁신이 깃들어 있다. 이 전사의 발걸음에 대지가 진동하고, 시선 하나에 전사들이 무릎 꿇는다.",
    aiHint: "7단계 업보: 완전한 전쟁신 화신 상태. 전투 묘사가 신화적 규모가 되어야 한다. 세계 자체가 이 전사의 존재를 기록한다."
  }
];

export function applyOrcHonorStats() {
  const oh = loadOrcHonor();
  const stg = ORC_HONOR_STAGES[oh.stage || 0];
  if (!stg) return;
  const prev = S._orcHonorBonus || {};
  Object.entries(prev).forEach(([k, v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });
  const newBonus = {};
  Object.entries(stg.statBonus || {}).forEach(([k, v]) => { S.stats[k] = Math.min(999, (S.stats[k] || 50) + v); newBonus[k] = v; });
  Object.entries(stg.statPenalty || {}).forEach(([k, v]) => { S.stats[k] = Math.max(0, (S.stats[k] || 50) + v); });
  // 각성 경로 추가 보너스
  if (oh.awakenPath) {
    const ld = ORC_LINEAGE_DEFS[oh.awakenPath];
    Object.entries(ld.awakeBonus || {}).forEach(([k, v]) => {
      if (!newBonus[k]) { S.stats[k] = Math.min(999, (S.stats[k] || 50) + Math.floor(v * 0.5)); newBonus[k] = Math.floor(v * 0.5); }
    });
  }
  S._orcHonorBonus = newBonus;
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
}
window.applyOrcHonorStats = applyOrcHonorStats;

export function getOrcHonorStatus() {
  const race = S.character?.race || "";
  const isOrc = race.includes("오크") || race.includes("orc");
  if (!isOrc) return null;
  const oh = loadOrcHonor();
  const stg = ORC_HONOR_STAGES[oh.stage || 0];
  const nextStg = ORC_HONOR_STAGES[(oh.stage || 0) + 1];
  const dominant = Object.entries(oh.lineage || {honor:0,fear:0,wisdom:0}).sort((a,b) => b[1]-a[1])[0][0];
  return { ...oh, stageDef: stg, nextStage: nextStg, dominant };
}
window.getOrcHonorStatus = getOrcHonorStatus;

window.getOrcHonorStatus    = getOrcHonorStatus;

window.applyOrcHonorStats   = applyOrcHonorStats;

window.loadOrcHonor         = loadOrcHonor;

window.clearOrcHonor        = clearOrcHonor;

export const ORC_GORBLOOD_KEY = "tf-orc-gorblood";

export const loadGorblood = () => {
  try {
    const raw = lsGet(ORC_GORBLOOD_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return {
    gauge: 0,            // 0~100
    awakened: false,     // 전쟁신 각성 상태
    awakenTurns: 0,      // 각성 남은 턴 (3턴)
    totalAwakenings: 0,  // 총 각성 횟수
    peakDamageReceived: 0,
    ancestorBrand: 0,    // 선조의 낙인 중첩 수
    brandDebuff: {},     // 현재 낙인 디버프
    tribeRenown: { honor: 0, fear: 0, wisdom: 0 },
    lastCombatGain: 0,
    history: []
  };
};

export const saveGorblood = (d) => { try { lsSet(ORC_GORBLOOD_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearGorblood = () => lsDel(ORC_GORBLOOD_KEY);

export function calcBrandDebuff(brandCount) {
  // 낙인 1개당: str-4, wil-6, rep-8, fath-5
  return {
    str:  -Math.min(40, brandCount * 4),
    wil:  -Math.min(60, brandCount * 6),
    rep:  -Math.min(80, brandCount * 8),
    fath: -Math.min(50, brandCount * 5)
  };
}
window.calcBrandDebuff = calcBrandDebuff;

export function applyAncestorBrand(gb) {
  if (!gb) return;
  const prev = gb.brandDebuff || {};
  // 이전 디버프 제거
  Object.entries(prev).forEach(([k, v]) => {
    if (S.stats[k] !== undefined) S.stats[k] = Math.min(999, S.stats[k] - v);
  });
  const newDebuff = calcBrandDebuff(gb.ancestorBrand || 0);
  // 새 디버프 적용
  Object.entries(newDebuff).forEach(([k, v]) => {
    if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] + v);
  });
  gb.brandDebuff = newDebuff;
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
}
window.applyAncestorBrand = applyAncestorBrand;

export function chargeGorblood(hpDamage, source) {
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return;
  const gb = loadGorblood();
  if (gb.awakened) return; // 각성 중에는 충전 없음

  const gain = Math.min(30, Math.max(3, Math.floor(hpDamage * 0.4)));
  gb.gauge = Math.min(100, (gb.gauge || 0) + gain);
  gb.lastCombatGain = gain;
  gb.history = gb.history || [];
  gb.history.push({ type: 'charge', gain, source: source || '전투 피해', gauge: gb.gauge, at: new Date().toISOString().slice(0, 16) });
  

  saveGorblood(gb);
  updateGorbloodUI(gb);

  // 게이지 가득 찼을 때 각성
  if (gb.gauge >= 100) {
    setTimeout(() => triggerGorAwakening(), 300);
  } else if (gb.gauge >= 70) {
    toast(`🩸 혈전 게이지 ${gb.gauge}/100 — 고르의 피가 끓어오른다!`, 2000);
  }
  return gb;
}
window.chargeGorblood = chargeGorblood;

export function chargeGorbloodOath(type) {
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return;
  const gb = loadGorblood();
  const gain = type === 'declare' ? 15 : type === 'fulfill' ? 25 : 0;
  if (!gain) return;
  gb.gauge = Math.min(100, (gb.gauge || 0) + gain);
  saveGorblood(gb);
  updateGorbloodUI(gb);
  if (gb.gauge >= 100) setTimeout(() => triggerGorAwakening(), 300);
}
window.chargeGorbloodOath = chargeGorbloodOath;

export function triggerGorAwakening() {
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return;
  const gb = loadGorblood();
  if (gb.awakened) return;

  gb.awakened = true;
  gb.awakenTurns = 3;
  gb.gauge = 100;
  gb.totalAwakenings = (gb.totalAwakenings || 0) + 1;

  // 각성 스탯 부스트 (임시)
  const oh = loadOrcHonor();
  const dominant = oh.awakenPath || Object.entries(oh.lineage || {honor:0,fear:0,wisdom:0}).sort((a,b)=>b[1]-a[1])[0][0];
  const boost = dominant === 'fear'   ? { str: 35, end: 20, fear: 25, agi: 15 }
              : dominant === 'wisdom' ? { str: 20, end: 15, wil: 20, agi: 25 }
              : /* honor */             { str: 25, end: 30, wil: 15, fear: 15 };

  gb._awakenBoost = boost;
  Object.entries(boost).forEach(([k, v]) => {
    if (S.stats[k] !== undefined) S.stats[k] = Math.min(999, S.stats[k] + v);
  });

  saveGorblood(gb);
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
  updateGorbloodUI(gb);

  // 인젝션
  const awakenDesc = dominant === 'fear'
    ? "전쟁신 고르의 분노가 폭발했다. 눈이 새빨갛게 물들고 근육이 터질 듯 부풀어오른다. 적들이 본능적으로 뒷걸음질친다."
    : dominant === 'wisdom'
    ? "전쟁신 고르의 지략이 빙의했다. 전장이 느린 그림처럼 보이고 적의 다음 행동이 보인다."
    : "전쟁신 고르의 투지가 몸을 가득 채웠다. 피해를 입을수록 더 강해지는 불굴의 기운이 넘쳐흐른다.";

  if (S._nextInjectedContext !== undefined) {
    S._nextInjectedContext = (S._nextInjectedContext || '') + ` [⚔️ 전쟁신 고르의 각성 발동! ${awakenDesc} STR/END 폭발 상승, 3턴 지속. 이 전투 묘사를 신화적 스케일로 강렬하게 표현하라.]`;
  }

  toast(`🌋 전쟁신 고르의 각성! 모든 전투력이 폭발한다! (3턴 지속)`, 5000);

  // 각성 해제 타이머 (3턴 = 약 90초 후 자동 해제로 폴백)
  setTimeout(() => { if (loadGorblood().awakened) endGorAwakening(); }, 90000);
}
window.triggerGorAwakening = triggerGorAwakening;

export function endGorAwakening() {
  const gb = loadGorblood();
  if (!gb.awakened) return;
  const boost = gb._awakenBoost || {};
  Object.entries(boost).forEach(([k, v]) => {
    if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v);
  });
  gb.awakened = false;
  gb.awakenTurns = 0;
  gb.gauge = 0;
  gb._awakenBoost = {};
  saveGorblood(gb);
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
  updateGorbloodUI(gb);
  toast(`😤 전쟁신의 각성이 끝났다. 몸이 무겁게 가라앉는다.`, 3000);
}
window.endGorAwakening = endGorAwakening;

export function tickGorbloodTurn() {
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return;
  const gb = loadGorblood();
  if (gb.awakened) {
    gb.awakenTurns = Math.max(0, (gb.awakenTurns || 0) - 1);
    if (gb.awakenTurns <= 0) { endGorAwakening(); return; }
    saveGorblood(gb);
    toast(`🌋 전쟁신 각성 ${gb.awakenTurns}턴 남음`, 1500);
  } else {
    // 비전투 시 게이지 자연 감소
    gb.gauge = Math.max(0, (gb.gauge || 0) - 5);
    saveGorblood(gb);
    updateGorbloodUI(gb);
  }
}
window.tickGorbloodTurn = tickGorbloodTurn;

export function addAncestorBrand(reason) {
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return;
  const gb = loadGorblood();
  gb.ancestorBrand = (gb.ancestorBrand || 0) + 1;
  gb.history = gb.history || [];
  gb.history.push({ type: 'brand', brand: gb.ancestorBrand, reason: reason || '맹세 파기', at: new Date().toISOString().slice(0, 16) });
  saveGorblood(gb);
  applyAncestorBrand(gb);
  saveGorblood(gb);

  // AI 인젝션
  if (S._nextInjectedContext !== undefined) {
    S._nextInjectedContext = (S._nextInjectedContext || '') + ` [💀 선조의 낙인 ${gb.ancestorBrand}중첩 — 선조의 영혼이 이 배신을 심판한다. 오크 동료들이 경멸의 눈빛을 보내며 오크 NPC들은 이 전사를 '낙인받은 자'로 부른다. STR/WIL/REP에 저주 디버프 적용 중.]`;
  }
  toast(`💀 선조의 낙인 ${gb.ancestorBrand}중첩! 선조가 이 배신을 저주한다.`, 4000);
  return gb;
}
window.addAncestorBrand = addAncestorBrand;

export function purifyAncestorBrand(amount) {
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return;
  const gb = loadGorblood();
  const removed = Math.min(gb.ancestorBrand || 0, amount || 1);
  gb.ancestorBrand = Math.max(0, (gb.ancestorBrand || 0) - removed);
  saveGorblood(gb);
  applyAncestorBrand(gb);
  saveGorblood(gb);
  toast(`⚔️ 낙인 속죄 완료 — ${removed}중첩 해제 (남은 낙인: ${gb.ancestorBrand})`, 3500);
  if (typeof window.renderOrcHonorPanel === 'function') window.renderOrcHonorPanel();
}
window.purifyAncestorBrand = purifyAncestorBrand;

export function updateTribeRenown(lineage, amount) {
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return;
  const gb = loadGorblood();
  gb.tribeRenown = gb.tribeRenown || { honor: 0, fear: 0, wisdom: 0 };
  gb.tribeRenown[lineage] = Math.min(200, (gb.tribeRenown[lineage] || 0) + (amount || 5));
  saveGorblood(gb);
}
window.updateTribeRenown = updateTribeRenown;

export function updateGorbloodUI(gb) {
  const el = document.getElementById('h-gorblood');
  if (!el) return;
  const pct = gb ? Math.round(gb.gauge || 0) : 0;
  const awakened = gb?.awakened;
  el.style.color = awakened ? '#ff4020' : pct >= 70 ? '#ff8020' : '#c05030';
  el.innerHTML = awakened
    ? `<span style="font-size:10px">🌋</span><span style="font-size:9px;font-family:'Cinzel',serif;animation:pulse 0.5s infinite alternate">각성!</span>`
    : `<span style="font-size:10px">🩸</span><span style="font-size:9px;font-family:'Cinzel',serif">${pct}</span>`;
}
window.updateGorbloodUI = updateGorbloodUI;

export function triggerLineageBurst() {
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return;
  const oh = loadOrcHonor();
  const dominant = oh.awakenPath || Object.entries(oh.lineage || {honor:0,fear:0,wisdom:0}).sort((a,b)=>b[1]-a[1])[0][0];

  let burstDesc = '', statEffect = {};
  if (dominant === 'honor') {
    burstDesc = "명예의 폭발! 전장의 모든 아군에게 투지가 전이된다. 패배한 적조차 이 기상에 고개를 숙인다.";
    statEffect = { str: 20, end: 25, wil: 15 };
    window.gainOrcHonor('honorable_duel', 8);
  } else if (dominant === 'fear') {
    burstDesc = "공포의 폭발! 전장 전체에 압도적인 살기가 퍼진다. 약한 적들은 도망치고 강한 적들조차 본능적으로 몸이 굳는다.";
    statEffect = { str: 40, fear: 30, mad: 10 };
    window.gainOrcHonor('berserker', 8);
    // 공포 각성: 아군 명령 일시 무시 (AI 인젝션)
    if (S._nextInjectedContext !== undefined) S._nextInjectedContext = (S._nextInjectedContext || '') + ' [공포 계열 각성 — 이 캐릭터는 지금 통제 불능의 폭주 상태다. 적 방향으로만 돌격하며 아군의 명령을 듣지 않는다. 강렬하고 야만적인 전투 묘사 필수.]';
  } else {
    burstDesc = "지혜의 폭발! 전장 전체가 느리게 보이기 시작하고 모든 적의 약점이 보인다. 한 명을 설득해 아군으로 돌릴 수도 있다.";
    statEffect = { str: 15, wil: 25, agi: 20, cha: 15 };
    window.gainOrcHonor('tactical_win', 8);
  }

  Object.entries(statEffect).forEach(([k, v]) => {
    if (S.stats[k] !== undefined) S.stats[k] = Math.min(999, S.stats[k] + v);
  });
  S._lineageBurstBoost = statEffect;
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();

  if (S._nextInjectedContext !== undefined) {
    S._nextInjectedContext = (S._nextInjectedContext || '') + ` [💥 계열 폭발 발동 — ${burstDesc}]`;
  }

  toast(`💥 계열 폭발! ${dominant === 'honor' ? '🛡️명예' : dominant === 'fear' ? '💀공포' : '🦅지혜'}의 힘이 터져나온다!`, 4000);

  // 3분 후 자동 해제
  setTimeout(() => {
    const boost = S._lineageBurstBoost || {};
    Object.entries(boost).forEach(([k, v]) => {
      if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v);
    });
    S._lineageBurstBoost = {};
    if (typeof saveStats === 'function') saveStats(S.stats);
    window.updateHeader();
    toast('💥 계열 폭발 효과 종료', 1500);
  }, 180000);
}
window.triggerLineageBurst = triggerLineageBurst;

export function renderGorbloodSection() {
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return '';
  const gb = loadGorblood();
  const oh = loadOrcHonor();
  const pct = gb.gauge || 0;
  const awakened = gb.awakened;
  const brand = gb.ancestorBrand || 0;
  const dominant = oh.awakenPath || Object.entries(oh.lineage || {honor:0,fear:0,wisdom:0}).sort((a,b)=>b[1]-a[1])[0][0];
  const domDef = ORC_LINEAGE_DEFS[dominant] || ORC_LINEAGE_DEFS.honor;
  const renown = gb.tribeRenown || { honor: 0, fear: 0, wisdom: 0 };

  const gaugeColor = awakened ? '#ff4020' : pct >= 70 ? '#ff8020' : pct >= 40 ? '#d05020' : '#803020';
  const brandColor = brand === 0 ? '#4a5a40' : brand <= 2 ? '#c08030' : '#e04030';

  return `
    <!-- 🩸 전쟁신 고르의 피 섹션 -->
    <div style="margin:10px 12px 0;border:1px solid ${gaugeColor}55;border-radius:3px;overflow:hidden">
      <div style="padding:8px 10px;background:linear-gradient(135deg,#150300,#200500);border-bottom:1px solid ${gaugeColor}33">
        <div style="font-family:'Cinzel',serif;font-size:9px;color:${gaugeColor};letter-spacing:1px;margin-bottom:6px">
          🩸 전쟁신 고르의 피 ${awakened ? '— ⚔️ 각성 중! ' + gb.awakenTurns + '턴' : '— ' + pct + '/100'}
        </div>
        <div style="height:8px;background:#0a0000;border-radius:4px;overflow:hidden;margin-bottom:5px;border:1px solid #2a0800">
          <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#4a0800,${gaugeColor});border-radius:4px;transition:width .4s${awakened ? ';animation:pulse 0.6s infinite alternate' : ''}"></div>
        </div>
        ${awakened ? `
        <div style="padding:5px 7px;background:#200000;border:1px solid #ff4020;border-radius:2px;font-size:9px;color:#ff8060;text-align:center;margin-bottom:4px">
          🌋 전쟁신이 깃들었다 — ${domDef.label} 계열 폭발 효과 활성
          <br><span style="font-size:8px;color:#ff4020">${gb.awakenTurns}턴 후 해제</span>
          <button onclick="endGorAwakening()" style="display:block;margin:4px auto 0;padding:3px 10px;background:#0a0000;border:1px solid #ff4020;color:#ff6040;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">각성 해제</button>
        </div>` : `
        <div style="font-size:8px;color:#5a2010;line-height:1.5">
          피해를 받을수록 충전 · 70 이상 시 위험 · 100 도달 시 전쟁신 각성 (${domDef.awakePath} 형태)
          ${pct >= 70 ? '<br><span style="color:' + gaugeColor + '">⚠️ 게이지가 폭발 직전이다!</span>' : ''}
        </div>`}
        <div style="display:flex;gap:5px;margin-top:5px">
          <button onclick="chargeGorblood(20,'수동 충전');renderOrcHonorPanel()"
            style="flex:1;padding:4px;background:#0d0200;border:1px solid #6a1000;color:#c04020;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">
            🩸 피해 받기 (+20)
          </button>
          <button onclick="tickGorbloodTurn();renderOrcHonorPanel()"
            style="flex:1;padding:4px;background:#0d0200;border:1px solid #3a1000;color:#7a3020;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">
            ⏱️ 턴 경과
          </button>
          ${!awakened && pct >= 100 ? `<button onclick="triggerGorAwakening();renderOrcHonorPanel()"
            style="flex:1;padding:4px;background:#200000;border:1px solid #ff4020;color:#ff8040;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">
            🌋 각성 발동!
          </button>` : ''}
        </div>
      </div>

      <!-- 계열 폭발 버튼 -->
      ${oh.stage >= 4 ? `
      <div style="padding:6px 10px;background:#0d0500;border-bottom:1px solid #2a1000">
        <button onclick="triggerLineageBurst()" style="width:100%;padding:6px;background:linear-gradient(135deg,#1a0800,#2a1200);border:1px solid ${domDef.color}66;color:${domDef.color};font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">
          💥 계열 폭발 발동 — ${domDef.icon} ${domDef.awakePath}
        </button>
      </div>` : ''}

      <!-- 선조의 낙인 -->
      <div style="padding:8px 10px;background:#100200;border-bottom:1px solid #2a0a00">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-size:14px">💀</span>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:9px;color:${brandColor}">선조의 낙인</div>
            <div style="font-size:8px;color:#5a2010">맹세를 파기할 때마다 중첩 · 속죄 의식으로만 해제</div>
          </div>
          <div style="text-align:right">
            <div style="font-family:'Cinzel',serif;font-size:18px;color:${brandColor}">${brand}</div>
            <div style="font-size:8px;color:#5a2010">중첩</div>
          </div>
        </div>
        ${brand > 0 ? `
        <div style="padding:5px 7px;background:#100000;border:1px solid ${brandColor}55;border-radius:2px;margin-bottom:4px">
          ${Object.entries(calcBrandDebuff(brand)).map(([k,v]) => v < 0 ? `<span style="font-size:8px;color:#e05050;margin-right:6px">${k.toUpperCase()}: ${v}</span>` : '').join('')}
          <div style="font-size:8px;color:#7a2020;margin-top:2px;font-style:italic">"선조들이 네 이름을 저주한다. 맹세한 자들은 이 낙인의 무게를 기억하라."</div>
        </div>
        <button onclick="purifyAncestorBrand(1)" style="width:100%;padding:4px;background:#0a0500;border:1px solid #6a4020;color:#c07030;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">
          🔥 속죄 의식 (낙인 1 해제) — 전쟁신 성소에서 피의 제물 바치기
        </button>` : `
        <div style="font-size:8px;color:#4a6040;text-align:center">선조들이 이 전사를 지켜보고 있다. 낙인 없음 ✓</div>`}
      </div>

      <!-- 부족 명성 -->
      <div style="padding:8px 10px;background:#0a0300">
        <div style="font-family:'Cinzel',serif;font-size:9px;color:#8a4020;letter-spacing:1px;margin-bottom:5px">🏕️ 부족 명성 — NPC 판정 실시간 보정</div>
        ${[['honor','🛡️','오크 NPC 호감/복종 판정','+'],[['fear','💀','적 NPC 첫 행동 판정','−']],['wisdom','🦅','협상·외교 판정','+']].flat().map(item => {
          if (!Array.isArray(item)) return '';
          const [key, icon, label, sign] = item;
          const val = renown[key] || 0;
          const bonus = Math.min(25, Math.floor(val / 8));
          const color = ORC_LINEAGE_DEFS[key]?.color || '#8a4020';
          return `<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
            <span style="font-size:11px">${icon}</span>
            <div style="flex:1;font-size:8px;color:#5a3020">${label}</div>
            <span style="font-family:'Cinzel',serif;font-size:9px;color:${color}">${sign}${bonus}</span>
            <span style="font-size:8px;color:#3a1a08">(${val})</span>
          </div>`;
        }).join('')}
        <div style="font-size:8px;color:#3a1a08;margin-top:3px">업보가 쌓일수록 보정치 자동 상승 (최대 +25)</div>
        <div style="font-size:8px;color:#6a4030;margin-top:3px">총 각성 횟수: ${gb.totalAwakenings || 0}회</div>
      </div>
    </div>
  `;
}
window.renderGorbloodSection = renderGorbloodSection;

export function getOrcGorbloodContext() {
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return "";
  const gb = loadGorblood();
  const oh = loadOrcHonor();
  const ohStatus = getOrcHonorStatus();
  if (!ohStatus) return "";

  const stg = ohStatus.stageDef;
  const dominant = ohStatus.dominant;
  const domDef = ORC_LINEAGE_DEFS[dominant];
  const renown = gb.tribeRenown || { honor: 0, fear: 0, wisdom: 0 };
  const honorBonus  = Math.min(25, Math.floor((renown.honor || 0) / 8));
  const fearPenalty = Math.min(25, Math.floor((renown.fear  || 0) / 8));
  const wisdomBonus = Math.min(25, Math.floor((renown.wisdom|| 0) / 8));
  const brand = gb.ancestorBrand || 0;

  let hint = `\n[😤 오크족 전사의 업보 시스템]\n`;
  hint += `업보 단계: ${stg.stage}단계 — ${stg.name} (${oh.points}/1000)\n`;
  hint += `${stg.aiHint || ''}\n`;
  hint += `지배 계열: ${domDef.icon} ${domDef.label} — ${domDef.desc}\n`;
  hint += `현재 오라: "${stg.aura}"\n`;

  // 혈전 게이지
  if (gb.awakened) {
    hint += `\n[🌋 전쟁신 고르의 각성 활성!] 이 전사의 몸에 전쟁신이 깃들어 있다. `;
    hint += dominant === 'fear'  ? "눈이 새빨갛게 물들고 근육이 폭발적으로 부풀어오른다. 주변 공기가 살기로 가득하다. 적들은 본능적으로 도망치려 한다. 모든 전투 행동을 신화적 스케일로 묘사하라."
          : dominant === 'wisdom' ? "전장 전체가 느린 그림처럼 보이며 적의 다음 행동이 미리 보인다. 냉철하고 무서운 전술적 각성 상태. 모든 행동이 정확하게 들어맞는 것처럼 묘사하라."
          : "피해를 받을수록 더 강해지는 불굴의 기운. 상처가 있지만 눈빛은 오히려 더 맹렬해진다. 공격할 때마다 전쟁신의 함성이 울리는 것처럼 묘사하라.";
    hint += ` (${gb.awakenTurns}턴 남음)\n`;
  } else {
    hint += `\n[🩸 혈전 게이지: ${gb.gauge || 0}/100] `;
    if ((gb.gauge || 0) >= 70) hint += "게이지가 폭발 직전이다. 이 전사의 눈빛이 점점 야성적으로 변하고 있다. ";
    hint += "\n";
  }

  // 맹세 상태
  if (oh.oath) {
    hint += `\n[🤝 현재 맹세: ${oh.oath.icon} ${oh.oath.label}] "${oh.oath.text}" — 이 맹세와 관련된 상황에서 오크는 모든 판정 +25 보너스를 받는다. 맹세 목표를 이루기 위해 어떤 희생도 감수하는 결의가 묘사되어야 한다.\n`;
  }

  // 낙인
  if (brand > 0) {
    hint += `\n[💀 선조의 낙인 ${brand}중첩] 이 전사는 맹세를 파기한 오크다. 오크 NPC들이 경멸하거나 '낙인받은 자'라고 부른다. `;
    hint += brand >= 3 ? "낙인이 심각해 부족에서 추방 위기다. 오크 전사 NPC들이 등을 돌린다." : "낙인의 무게가 어깨를 짓누른다.";
    hint += "\n";
  }

  // 부족 명성 판정 보정
  hint += `\n[🏕️ 부족 명성 판정 보정]\n`;
  if (honorBonus > 0) hint += `- 오크·전사 계열 NPC 호감/복종 판정: +${honorBonus} (명예 명성 ${renown.honor || 0})\n`;
  if (fearPenalty > 0) hint += `- 적대 NPC의 첫 행동 판정: -${fearPenalty} (공포 명성 ${renown.fear || 0}으로 인한 기선 제압)\n`;
  if (wisdomBonus > 0) hint += `- 협상·외교·설득 판정: +${wisdomBonus} (지혜 명성 ${renown.wisdom || 0})\n`;

  // 맹세 기록
  if ((oh.oathBroken || 0) > 0) {
    hint += `\n[파기된 맹세 ${oh.oathBroken}회] 이 전사가 선언을 어긴 기억이 남아있다. 오크 문화에서 이는 명예의 상처다.\n`;
  }
  if ((oh.oathFulfilled || 0) > 0) {
    hint += `[이행된 맹세 ${oh.oathFulfilled}회] 이 전사가 약속을 지킨 기록. 오크 NPC들이 이 사실을 알고 있다면 신뢰한다.\n`;
  }

  return hint;
}
window.getOrcGorbloodContext = getOrcGorbloodContext;

setTimeout(() => {
  if (typeof window.buildLightSystem === 'function' && !window._orcGorbloodBLSWrapped) {
    window._orcGorbloodBLSWrapped = true;
    const _origBLS = window.buildLightSystem;
    window.buildLightSystem = function(...args) {
      let result = _origBLS.apply(this, args);
      const orcCtx = getOrcGorbloodContext();
      if (orcCtx && typeof result === 'string') {
        result = result + orcCtx;
      }
      return result;
    };
  }
}, 800);

setTimeout(() => {
  if (typeof window.buildLightSystem === 'function' && !window._orcRaceHintWrapped) {
    window._orcRaceHintWrapped = true;
    const _origBLS2 = window.buildLightSystem;
    window.buildLightSystem = function(...args) {
      let result = _origBLS2.apply(this, args);
      const race = (args[0]?.race || S.character?.race || "");
      const isOrc = race.includes("오크") || race.includes("orc");
      if (!isOrc || typeof result !== 'string') return result;
      // 오크 종족 기본 특성 힌트 삽입
      const orcRaceHint = `\n[😤 오크족 특성] 이 캐릭터는 오크 전사다. 전투에서 피해를 받을수록 눈빛이 더 맹렬해지는 묘사를 포함하라. 말할 때는 짧고 직접적이며 맹세·약속에 관한 언급에서 무거운 무게감이 드러난다. 오크 동족 NPC는 이 전사의 업보 단계를 본능적으로 느낀다. 힘이 아닌 '어떻게 싸웠는가'가 이 종족에서 가장 중요한 가치다.`;
      // 이미 포함되어 있으면 중복 방지
      if (!result.includes('[😤 오크족 특성]')) result = result + orcRaceHint;
      return result;
    };
  }
}, 1200);

window.chargeGorblood        = chargeGorblood;

window.triggerGorAwakening   = triggerGorAwakening;

window.endGorAwakening       = endGorAwakening;

window.tickGorbloodTurn      = tickGorbloodTurn;

window.addAncestorBrand      = addAncestorBrand;

window.purifyAncestorBrand   = purifyAncestorBrand;

window.triggerLineageBurst   = triggerLineageBurst;

window.loadGorblood          = loadGorblood;

window.clearGorblood         = clearGorblood;

window.getOrcGorbloodContext = getOrcGorbloodContext;

window.updateGorbloodUI      = updateGorbloodUI;

window.renderGorbloodSection = renderGorbloodSection;

export const ORC_BLOODVOW_KEY   = 'tf-orc-bloodvow';

export const OBV_VOWS_KEY       = 'tf-obv-vows';

export const OBV_COUNTERS_KEY   = 'tf-obv-counters';

export const OBV_HISTORY_KEY    = 'tf-obv-history';

export function loadOrcBloodVow() {
  try {
    const v=lsGet(OBV_VOWS_KEY); const c=lsGet(OBV_COUNTERS_KEY); const h=lsGet(OBV_HISTORY_KEY);
    if (v!==null) return { vows:JSON.parse(v||'[]'), ...(c?JSON.parse(c):{vowPoints:0,vowPath:null,brokenCount:0,fulfilledCount:0,bodyToll:0}), history:JSON.parse(h||'[]') };
    return JSON.parse(lsGet(ORC_BLOODVOW_KEY)||'{"vows":[],"vowPoints":0,"vowPath":null,"brokenCount":0,"fulfilledCount":0,"history":[],"bodyToll":0}');
  } catch(e) { return {vows:[],vowPoints:0,vowPath:null,brokenCount:0,fulfilledCount:0,history:[],bodyToll:0}; }
}
window.loadOrcBloodVow = loadOrcBloodVow;

export function saveOrcBloodVow(d) {
  try {
    lsSet(OBV_VOWS_KEY,    JSON.stringify(d.vows||[]));
    lsSet(OBV_COUNTERS_KEY,JSON.stringify({vowPoints:d.vowPoints||0,vowPath:d.vowPath||null,brokenCount:d.brokenCount||0,fulfilledCount:d.fulfilledCount||0,bodyToll:d.bodyToll||0}));
    lsSet(OBV_HISTORY_KEY, JSON.stringify(d.history||[]));
    lsSet(ORC_BLOODVOW_KEY,JSON.stringify(d));
  } catch(e) {}
}
window.saveOrcBloodVow = saveOrcBloodVow;

export const clearOrcBloodVow = () => { lsDel(ORC_BLOODVOW_KEY); lsDel(OBV_VOWS_KEY); lsDel(OBV_COUNTERS_KEY); lsDel(OBV_HISTORY_KEY); };

export function isOrcRace() {
  const r = S.character?.race || '';
  return r.includes('오크') || r.includes('orc');
}
window.isOrcRace = isOrcRace;

export const BLOODVOW_STAGES = [
  { min:0,   name:'맹약 없는 자', icon:'🤍', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" stroke-width="1.3" stroke-dasharray="2 3"/></svg>`, color:'#806060', desc:'아직 혈서를 맺지 않았다.', bonus:{}, penalty:{} },
  { min:30,  name:'첫 맹약',     icon:'🩸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4 L8 20 M16 4 L16 20" stroke-width="1.6"/><path d="M8 12 L16 12" stroke-width="1.3"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>`,  color:'#e05050', desc:'첫 혈서가 영혼에 새겨졌다. 힘의 씨앗이 심겨진다.', bonus:{str:5,end:4}, penalty:{} },
  { min:80,  name:'혈서 전사',   icon:'🩸⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><circle cx="6" cy="18" r="1.6" fill="currentColor" stroke="none"/></svg>`, color:'#e84040', desc:'여러 혈서를 이행했다. 동족들이 신뢰를 보낸다.', bonus:{str:12,end:10,fear:8,wil:6}, penalty:{} },
  { min:160, name:'맹약의 화신', icon:'🔱🩸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 L14 8 L18 8 L15 11 L16.5 15 L12 12.5 L7.5 15 L9 11 L6 8 L10 8 Z" stroke-linejoin="round"/><circle cx="12" cy="20" r="1.6" fill="currentColor" stroke="none"/></svg>`, color:'#ff3020', desc:'혈서가 영혼과 하나가 됐다. 맹약 선언만으로 적이 두려움을 느낀다.', bonus:{str:22,end:18,fear:16,wil:14,crit:10}, penalty:{} },
  { min:280, name:'혈서의 군주', icon:'👑🩸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><circle cx="12" cy="21" r="1.4" fill="currentColor" stroke="none"/></svg>`, color:'#ff1000', desc:'혈서가 전설이 됐다. 맹약 위반은 세계의 법칙이 허락하지 않는다.', bonus:{str:36,end:30,fear:28,wil:24,crit:16,rep:12}, penalty:{} },
];

export function getBVStage(pts) {
  let s = BLOODVOW_STAGES[0];
  for (const st of BLOODVOW_STAGES) { if (pts >= st.min) s = st; }
  return s;
}
window.getBVStage = getBVStage;

export function declareBloodVow(vowTypeId, targetName) {
  if (!isOrcRace()) return;
  const bv = loadOrcBloodVow();
  const def = BLOODVOW_TYPES.find(v => v.id === vowTypeId);
  if (!def) return;
  const active = (bv.vows || []).filter(v => v.status === 'active');
  if (active.length >= 5) { toast('⚠️ 최대 5개의 혈서를 동시에 유지할 수 있습니다.'); return; }

  bv.vows = bv.vows || [];
  bv.vows.push({
    id: vowTypeId, label: def.label, icon: def.icon, path: def.path,
    target: targetName || '', status: 'active',
    declaredAt: new Date().toISOString().slice(0,16),
    fulfilledAt: null
  });

  // 경로 포인트 누적
  bv.vowPath = bv.vowPath || {};
  bv.vowPath[def.path] = (bv.vowPath[def.path] || 0) + 1;

  bv.history = bv.history || [];
  bv.history.push({ event:'선언', label:def.label, icon:def.icon, path:def.path, target:targetName||'', at:new Date().toISOString().slice(0,16) });
  

  saveOrcBloodVow(bv);
  applyOrcBloodVowStats();
  toast(`🩸 혈서 선언! ${def.icon} ${def.label}${targetName ? ` — 대상: ${targetName}` : ''}`, 4000);
  // 업보 연동
  if (typeof window.gainOrcHonor === 'function') window.gainOrcHonor('oath_kept', 5);
}
window.declareBloodVow = declareBloodVow;

export function fulfillBloodVow(vowIdx) {
  if (!isOrcRace()) return;
  const bv = loadOrcBloodVow();
  const vow = bv.vows?.[vowIdx];
  if (!vow || vow.status !== 'active') return;
  const def = BLOODVOW_TYPES.find(v => v.id === vow.id);

  vow.status = 'fulfilled';
  vow.fulfilledAt = new Date().toISOString().slice(0,16);
  bv.vowPoints = Math.min(400, (bv.vowPoints||0) + (def?.cost||20));
  bv.fulfilledCount = (bv.fulfilledCount||0) + 1;

  // 이행 보너스 스탯 적용
  if (def?.fulfillBonus) {
    Object.entries(def.fulfillBonus).forEach(([k,v]) => {
      S.stats[k] = Math.min(999, (S.stats[k]||50) + v);
    });
    if (typeof saveStats==='function') saveStats(S.stats);
  }

  bv.history.push({ event:'이행', label:vow.label, icon:vow.icon, path:vow.path, at:new Date().toISOString().slice(0,16) });
  saveOrcBloodVow(bv);
  applyOrcBloodVowStats();

  // 업보·고르의 피 연동
  if (typeof window.gainOrcHonor==='function') window.gainOrcHonor('oath_kept', 12);
  if (typeof chargeGorbloodOath==='function') chargeGorbloodOath('fulfill');

  const pathDef = BLOODVOW_PATHS[vow.path];
  toastHTML(`✅ 혈서 이행! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(vow,{size:14}):(vow.icon)} ${esc(vow.label)} — ${esc(pathDef?.label||'')} 맹서 경로 강화`, 4000);

  // 각성 스킬 해금 확인
  const dominantPath = getDominantVowPath(bv);
  if (bv.vowPoints >= 160 && dominantPath) {
    const pd = BLOODVOW_PATHS[dominantPath];
    if (pd?.awakeSkill && !S.unlockedSkills?.[pd.awakeSkill.id]) {
      S.unlockedSkills = S.unlockedSkills || {};
      S.unlockedSkills[pd.awakeSkill.id] = true;
      if (typeof saveSkills==='function') saveSkills(S.unlockedSkills);
      setTimeout(()=>toastHTML(`🔓 혈서 각성 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(pd.awakeSkill,{size:14}):(pd.awakeSkill.icon)} ${esc(pd.awakeSkill.name)}`, 4000), 800);
    }
  }
  renderOrcBloodVowPanel();
}
window.fulfillBloodVow = fulfillBloodVow;

export function breakBloodVow(vowIdx) {
  if (!isOrcRace()) return;
  const bv = loadOrcBloodVow();
  const vow = bv.vows?.[vowIdx];
  if (!vow || vow.status !== 'active') return;
  const def = BLOODVOW_TYPES.find(v => v.id === vow.id);

  vow.status = 'broken';
  vow.brokenAt = new Date().toISOString().slice(0,16);
  bv.brokenCount = (bv.brokenCount||0) + 1;
  bv.bodyToll = Math.min(100, (bv.bodyToll||0) + 20);

  // 위반 패널티 적용
  if (def?.breakPenalty) {
    Object.entries(def.breakPenalty).forEach(([k,v]) => {
      S.stats[k] = Math.max(0, (S.stats[k]||50) + v);
    });
    if (typeof saveStats==='function') saveStats(S.stats);
  }

  bv.history.push({ event:'위반', label:vow.label, icon:vow.icon, path:vow.path, at:new Date().toISOString().slice(0,16) });
  saveOrcBloodVow(bv);
  applyOrcBloodVowStats();

  if (typeof addAncestorBrand==='function') addAncestorBrand('혈서 위반');
  toastHTML(`💔 혈서 위반! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(vow,{size:14}):(vow.icon)} ${esc(vow.label)} — 몸이 대가를 치른다. (신체 대가: ${esc(bv.bodyToll)}/100)`, 4000);
  renderOrcBloodVowPanel();
}
window.breakBloodVow = breakBloodVow;

export function getDominantVowPath(bv) {
  const p = bv.vowPath || {};
  const entries = Object.entries(p).sort((a,b)=>b[1]-a[1]);
  return entries[0]?.[0] || null;
}
window.getDominantVowPath = getDominantVowPath;

export function applyOrcBloodVowStats() {
  if (!isOrcRace()) return;
  const bv = loadOrcBloodVow();
  const prev = S._orcBloodVowBonus || {};
  Object.entries(prev).forEach(([k,v]) => { if (S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v); });
  const nb = {};
  const stg = getBVStage(bv.vowPoints||0);
  Object.entries(stg.bonus||{}).forEach(([k,v])=>{S.stats[k]=Math.min(999,(S.stats[k]||50)+v);nb[k]=v;});
  // 지배 경로 보너스
  const dom = getDominantVowPath(bv);
  if (dom && BLOODVOW_PATHS[dom]) {
    Object.entries(BLOODVOW_PATHS[dom].bonus||{}).forEach(([k,v])=>{
      const add = Math.round(v * Math.min(1.5, (bv.vowPoints||0)/160));
      S.stats[k]=Math.min(999,(S.stats[k]||50)+add); nb[k]=(nb[k]||0)+add;
    });
  }
  // 신체 대가 패널티
  const toll = bv.bodyToll||0;
  if (toll > 0) { const pen = Math.round(toll/10); S.stats.str=Math.max(0,(S.stats.str||50)-pen); S.stats.end=Math.max(0,(S.stats.end||50)-pen); }
  S._orcBloodVowBonus = nb;
  if (typeof saveStats==='function') saveStats(S.stats);
  window.updateHeader();
}
window.applyOrcBloodVowStats = applyOrcBloodVowStats;

export function detectOrcBloodVowFromText(text) {
  if (!text || !isOrcRace()) return;
  const bv = loadOrcBloodVow();
  const active = (bv.vows||[]).filter(v=>v.status==='active');
  if (active.length === 0) return;
  // [F-7 FIX] Math.random() 제거 — 키워드 감지 시 항상 처리
  if (/맹세를 지켰|이겼|성공했|해냈|쓰러뜨렸|지켜냈/.test(text)) {
    const idx = bv.vows.findIndex(v=>v.status==='active');
    if (idx >= 0) { fulfillBloodVow(idx); }
  }
}
window.detectOrcBloodVowFromText = detectOrcBloodVowFromText;

export function renderOrcBloodVowPanel() {
  const body = document.getElementById('pb-orc-bloodvow');
  if (!body) return;
  if (!isOrcRace()) {
    body.innerHTML=`<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px"><div style="font-size:32px;margin-bottom:10px">🩸</div><div>오크족 캐릭터에게만 활성화됩니다.</div></div>`;
    return;
  }
  const bv = loadOrcBloodVow();
  const stg = getBVStage(bv.vowPoints||0);
  const color = stg.color;
  const dom = getDominantVowPath(bv);
  const domDef = dom ? BLOODVOW_PATHS[dom] : null;
  const active = (bv.vows||[]).filter(v=>v.status==='active');
  const npcs = (S.npcs||[]).filter(n=>n.active!==false);

  body.innerHTML = `
    <!-- ① 헤더 -->
    <div style="padding:14px;background:linear-gradient(135deg,#180000,#220000);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#804040;margin-top:2px">혈서 점수 ${bv.vowPoints||0} | 이행 ${bv.fulfilledCount||0}회 | 위반 ${bv.brokenCount||0}회</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:${color}">${bv.vowPoints||0}<span style="font-size:9px;color:#6a3030"> / 400</span></div>
          <div style="font-size:8px;color:#6a3030">혈서 공적</div>
        </div>
      </div>
      <div style="height:6px;background:#180000;border-radius:3px;overflow:hidden;margin-bottom:4px">
        <div style="width:${Math.min(100,Math.round((bv.vowPoints||0)/4))}%;height:100%;background:linear-gradient(90deg,#600010,${color});border-radius:3px;transition:width .4s"></div>
      </div>
      <div style="font-size:9px;color:#904040;margin-top:6px;font-style:italic">"${stg.desc}"</div>
      ${bv.bodyToll>0?`<div style="margin-top:6px;padding:5px 8px;background:#200000;border:1px solid #601010;border-radius:2px;font-size:9px;color:#e05050">⚠️ 신체 대가: ${bv.bodyToll}/100 — 위반이 쌓일수록 STR·END 감소</div>`:''}
    </div>

    <!-- ② 지배 경로 -->
    ${domDef ? `
    <div style="padding:8px 12px;border-bottom:1px solid #1a0000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 지배 맹서 경로 ──</div>
      <div style="padding:8px 10px;background:#180000;border:1px solid ${domDef.color}55;border-radius:2px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
          <span style="color:${domDef.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(domDef,{size:16}):(domDef.svgIcon||domDef.icon)}</span>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:11px;color:${domDef.color}">${domDef.label}</div>
            <div style="font-size:8px;color:#804040;margin-top:2px">${esc(domDef.desc)}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px">
          ${Object.entries(domDef.bonus||{}).map(([k,v])=>`<div style="padding:2px 6px;background:#200000;border:1px solid ${domDef.color}33;border-radius:2px;font-size:8px"><span style="color:${domDef.color}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:3px">+${v}</span></div>`).join('')}
        </div>
        ${domDef.awakeSkill && bv.vowPoints >= 160 ? `<div style="margin-top:6px;padding:5px 8px;background:#100000;border:1px solid ${domDef.color}44;border-radius:2px">
          <div style="font-size:9px;color:${domDef.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(domDef.awakeSkill,{size:9}):(domDef.awakeSkill.icon)} ${domDef.awakeSkill.name} <span style="color:#c8a96e;font-size:8px">각성 스킬 해금됨</span></div>
          <div style="font-size:8px;color:#704040;margin-top:2px">${esc(domDef.awakeSkill.desc.slice(0,60))}...</div>
        </div>` : (bv.vowPoints >= 80 ? `<div style="margin-top:4px;font-size:8px;color:#604040;text-align:right">각성 스킬까지: ${Math.max(0,160-(bv.vowPoints||0))}점</div>` : '')}
      </div>
    </div>` : ''}

    <!-- ③ 경로별 현황 -->
    <div style="padding:8px 12px;border-bottom:1px solid #1a0000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 맹서 경로 현황 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
        ${Object.entries(BLOODVOW_PATHS).map(([pid,pd])=>`
          <div style="padding:6px;background:#120000;border:1px solid ${dom===pid?pd.color:pd.color+'33'};border-radius:2px;text-align:center">
            <div style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(pd,{size:14}):(pd.icon)}</div>
            <div style="font-size:8px;color:${dom===pid?pd.color:'#604040'};font-family:'Cinzel',serif;margin-top:2px">${pd.label}</div>
            <div style="font-family:'Cinzel',serif;font-size:11px;color:${pd.color};margin-top:2px">${bv.vowPath?.[pid]||0}<span style="font-size:7px;color:#604040">회</span></div>
          </div>`).join('')}
      </div>
    </div>

    <!-- ④ 활성 혈서 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 활성 혈서 (${active.length}/2) ──</div>
      ${active.length === 0
        ? `<div style="font-size:9px;color:#4a2020;text-align:center;padding:8px">현재 선언된 혈서가 없습니다</div>`
        : (bv.vows||[]).map((v,i) => {
          if (v.status !== 'active') return '';
          const pd = BLOODVOW_PATHS[v.path] || {};
          return `<div style="padding:8px 10px;background:#180000;border:1px solid ${pd.color||color}55;margin-bottom:5px;border-radius:2px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(v,{size:16}):(v.icon)}</span>
              <div style="flex:1">
                <div style="font-family:'Cinzel',serif;font-size:10px;color:${pd.color||color}">${esc(v.label)}</div>
                ${v.target?`<div style="font-size:8px;color:#804040">대상: ${esc(v.target)}</div>`:''}
                <div style="font-size:8px;color:#604040">선언: ${v.declaredAt||'-'}</div>
              </div>
              <span style="padding:2px 6px;background:${pd.color||color}22;border:1px solid ${pd.color||color}44;color:${pd.color||color};font-size:8px;border-radius:2px">${pd.label||v.path}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
              <button onclick="fulfillBloodVow(${i})"
                style="padding:5px;background:#001a00;border:1px solid #308050;color:#50d090;font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">✅ 이행</button>
              <button onclick="breakBloodVow(${i})"
                style="padding:5px;background:#1a0000;border:1px solid #803030;color:#d05050;font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">💔 위반</button>
            </div>
          </div>`;
        }).join('')}
    </div>

    <!-- ⑤ 혈서 선언 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 혈서 선언 ──</div>
      ${active.length >= 2 ? `<div style="font-size:9px;color:#604040;text-align:center;padding:6px">최대 2개의 혈서를 유지 중입니다</div>` : `
        <select id="bv-target-select" style="width:100%;padding:5px;background:#120000;border:1px solid #601010;color:#e06060;font-size:9px;border-radius:2px;margin-bottom:6px">
          <option value="">— 대상 선택 (선택 사항) —</option>
          ${npcs.map(n=>`<option value="${esc(n.name)}">${esc(n.name)}</option>`).join('')}
        </select>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${BLOODVOW_TYPES.map(vt => {
            const pd = BLOODVOW_PATHS[vt.path];
            return `<button onclick="const t=document.getElementById('bv-target-select');declareBloodVow('${vt.id}',t?t.value:'');renderOrcBloodVowPanel()"
              style="padding:7px 10px;background:#180000;border:1px solid ${pd.color}44;color:${pd.color};font-size:9px;cursor:pointer;font-family:'Crimson Text',serif;text-align:left;border-radius:2px;line-height:1.4">
              ${typeof getEntityIconHTML==='function'?getEntityIconHTML(vt,{size:8}):(vt.icon)} <span style="font-family:'Cinzel',serif">${vt.label}</span> <span style="float:right;font-size:8px;color:#604040">${typeof getEntityIconHTML==='function'?getEntityIconHTML(pd,{size:8}):(pd.icon)}</span><br>
              <span style="font-size:8px;color:#804040">${esc(vt.desc.slice(0,55))}...</span>
            </button>`;
          }).join('')}
        </div>`}
    </div>

    <!-- ⑥ 최근 기록 -->
    ${(bv.history||[]).length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 혈서 기록 ──</div>
      ${[...bv.history].reverse().slice(0,10).map(h=>`
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #120000;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#904040">${esc(h.label)}</span>
          <span style="color:${h.event==='이행'?'#60d060':h.event==='선언'?color:'#e05050'}">${h.event}</span>
          <span style="color:#402020;font-size:8px">${h.at||''}</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderOrcBloodVowPanel = renderOrcBloodVowPanel;

window.renderOrcBloodVowPanel    = renderOrcBloodVowPanel;

window.declareBloodVow           = declareBloodVow;

window.fulfillBloodVow           = fulfillBloodVow;

window.breakBloodVow             = breakBloodVow;

window.applyOrcBloodVowStats     = applyOrcBloodVowStats;

window.detectOrcBloodVowFromText = detectOrcBloodVowFromText;

window.loadOrcBloodVow           = loadOrcBloodVow;

window.clearOrcBloodVow          = clearOrcBloodVow;

export const ORC_COUNCIL_KEY    = 'tf-orc-council';

export const OC_MEMBERS_KEY     = 'tf-oc-members';

export const OC_COUNTERS_KEY    = 'tf-oc-counters';

export const OC_HISTORY_KEY     = 'tf-oc-history';

export function loadOrcCouncil() {
  try {
    const m=lsGet(OC_MEMBERS_KEY); const c=lsGet(OC_COUNTERS_KEY); const h=lsGet(OC_HISTORY_KEY);
    if (m!==null) { const mObj=JSON.parse(m||'{}'); return { sages:mObj.sages||[], decisions:mObj.decisions||[], ...(c?JSON.parse(c):{influence:20,decisionPoints:0,chiefTitle:null,warCounselUsed:0}), history:JSON.parse(h||'[]') }; }
    return JSON.parse(lsGet(ORC_COUNCIL_KEY)||'{"influence":20,"sages":[],"decisions":[],"decisionPoints":0,"chiefTitle":null,"history":[],"warCounselUsed":0}');
  } catch(e) { return {influence:20,sages:[],decisions:[],decisionPoints:0,chiefTitle:null,history:[],warCounselUsed:0}; }
}
window.loadOrcCouncil = loadOrcCouncil;

export function saveOrcCouncil(d) {
  try {
    lsSet(OC_MEMBERS_KEY,  JSON.stringify({sages:d.sages||[],decisions:d.decisions||[]}));
    lsSet(OC_COUNTERS_KEY, JSON.stringify({influence:d.influence||20,decisionPoints:d.decisionPoints||0,chiefTitle:d.chiefTitle||null,warCounselUsed:d.warCounselUsed||0}));
    lsSet(OC_HISTORY_KEY,  JSON.stringify(d.history||[]));
    lsSet(ORC_COUNCIL_KEY, JSON.stringify(d));
  } catch(e) {}
}
window.saveOrcCouncil = saveOrcCouncil;

export const clearOrcCouncil = () => { lsDel(ORC_COUNCIL_KEY); lsDel(OC_MEMBERS_KEY); lsDel(OC_COUNTERS_KEY); lsDel(OC_HISTORY_KEY); };

export const COUNCIL_INFLUENCE_STAGES = [
  { min:0,  name:'이방인',      icon:'👁️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"/><path d="M6 20 C6 15.5 8.5 13 12 13 C15.5 13 18 15.5 18 20" stroke-dasharray="2 2.5"/></svg>`, color:'#806040',
    desc:'의회에서 발언권이 없다. 결정에 영향을 미칠 수 없다.',
    bonus:{}, penalty:{ ldr:-10, cha:-8 },
    aiHint:'이 오크는 부족 의회에서 발언권이 없다. 현자들이 이 인물을 무시한다.' },
  { min:20, name:'신진 전사',   icon:'⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/></svg>`, color:'#a06030',
    desc:'의회에서 이름이 알려지기 시작했다. 발언은 할 수 있지만 무게가 없다.',
    bonus:{ ldr:5, cha:4 }, penalty:{},
    aiHint:'의회에서 신진 전사로 인정받았다. 현자들이 가끔 의견을 묻는다.' },
  { min:40, name:'의회 전사',   icon:'🗡️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></svg>`, color:'#c07020',
    desc:'의회에서 목소리가 커졌다. 현자들이 경청한다.',
    bonus:{ ldr:12, cha:10, wil:8, int:6 }, penalty:{},
    aiHint:'의회 전사 지위. 현자들이 이 인물의 의견에 무게를 두고 경청한다.' },
  { min:60, name:'현자의 신뢰', icon:'🦅', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 L19 5"/><path d="M19 5 L14 5 L19 10 Z"/><path d="M5 19 L6 15 L9 18 Z"/><path d="M3 12 C3 12 8 10 12 3" stroke-width="1.2"/></svg>`, color:'#d09010',
    desc:'현자들이 신뢰한다. 전쟁 결정에 공식 발언권이 생겼다.',
    bonus:{ ldr:22, cha:18, wil:16, int:12, rep:10 }, penalty:{},
    aiHint:'현자의 신뢰를 받은 전사. 전쟁과 외교 결정에 공식 참여할 수 있다.' },
  { min:80, name:'의회의 중심', icon:'👑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="8" r="1.6" fill="currentColor" stroke="none"/><circle cx="8.3" cy="14" r="1.6" fill="currentColor" stroke="none"/><circle cx="15.7" cy="14" r="1.6" fill="currentColor" stroke="none"/></svg>`, color:'#e0b020',
    desc:'부족 최고 의결권자. 족장도 이 자의 의견을 무시하지 못한다.',
    bonus:{ ldr:36, cha:28, wil:26, int:20, rep:18, fear:10 }, penalty:{},
    aiHint:'의회의 중심. 족장조차 이 오크의 의견을 무시하지 못한다. 부족 전체가 주목한다.' },
  { min:100, name:'말하는 자', icon:'🔱', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 L14 8 L18 8 L15 11 L16.5 15 L12 12.5 L7.5 15 L9 11 L6 8 L10 8 Z" stroke-linejoin="round"/><path d="M5 19 L19 19" stroke-width="1.5"/></svg>`, color:'#ffd700',
    desc:'전설의 현자-전사. 전쟁과 평화 모두를 결정하는 최고 권위자.',
    bonus:{ ldr:52, cha:42, wil:38, int:30, rep:28, fear:16, str:12 }, penalty:{},
    aiHint:'말하는 자 — 최고 권위자. 이 오크의 말은 부족의 법이다. 다른 부족에서도 조언을 구하러 온다.' },
];

export function getCouncilStage(inf) {
  let s = COUNCIL_INFLUENCE_STAGES[0];
  for (const st of COUNCIL_INFLUENCE_STAGES) { if (inf >= st.min) s = st; }
  return s;
}
window.getCouncilStage = getCouncilStage;

export function changeCouncilInfluence(decisionId, customGain) {
  if (!isOrcRace()) return;
  const oc = loadOrcCouncil();
  const def = COUNCIL_DECISIONS.find(d => d.id === decisionId);
  const gain = customGain !== undefined ? customGain : (def?.gain || 5);

  const prev = oc.influence || 20;
  oc.influence = Math.max(0, Math.min(100, prev + gain));
  oc.decisionPoints = Math.max(0, (oc.decisionPoints||0) + Math.max(0, gain));

  oc.decisions = oc.decisions || [];
  oc.decisions.push({ id: decisionId, label: def?.label||decisionId, icon: def?.icon||'🏕️', gain, total: oc.influence, at: new Date().toISOString().slice(0,16) });
  

  oc.history = oc.history || [];
  oc.history.push({ event: def?.label||decisionId, icon: def?.icon||'🏕️', gain, total: oc.influence, at: new Date().toISOString().slice(0,16) });
  

  // 말하는 자 칭호 해금
  if (oc.influence >= 100 && !oc.chiefTitle) {
    oc.chiefTitle = '말하는 자';
    setTimeout(()=>toast('🔱 "말하는 자" 칭호를 얻었습니다! 부족 의회의 최고 권위자!', 5000), 400);
  }

  saveOrcCouncil(oc);
  applyOrcCouncilStats();

  const stg = getCouncilStage(oc.influence);
  if (getCouncilStage(prev).name !== stg.name) {
    setTimeout(()=>toastHTML(`🏕️ 의회 지위 변화! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)}`, 4000), 400);
  }
  if (gain < 0) toast(`📉 의회 영향력 ${gain} (현재: ${oc.influence})`, 2500);
  else toast(`📈 의회 영향력 +${gain} (현재: ${oc.influence})`, 2500);
}
window.changeCouncilInfluence = changeCouncilInfluence;

export function applyOrcCouncilStats() {
  if (!isOrcRace()) return;
  const oc = loadOrcCouncil();
  const stg = getCouncilStage(oc.influence || 20);
  const prev = S._orcCouncilBonus || {};
  Object.entries(prev).forEach(([k,v])=>{if(S.stats[k]!==undefined)S.stats[k]=Math.max(0,S.stats[k]-v);});
  const nb = {};
  Object.entries(stg.bonus||{}).forEach(([k,v])=>{S.stats[k]=Math.min(999,(S.stats[k]||50)+v);nb[k]=v;});
  Object.entries(stg.penalty||{}).forEach(([k,v])=>{S.stats[k]=Math.max(0,(S.stats[k]||50)+v);});
  S._orcCouncilBonus = nb;
  if (typeof saveStats==='function') saveStats(S.stats);
  window.updateHeader();
}
window.applyOrcCouncilStats = applyOrcCouncilStats;

export function detectOrcCouncilFromText(text) {
  if (!text || !isOrcRace()) return;
  // [F-7 FIX] Math.random() 제거 — 키워드 감지 시 항상 처리
  if (/현자에게 물었|조언을 구했|의회에서/.test(text)) changeCouncilInfluence('seek_counsel', 5);
  if (/현자의 반대|조언을 무시|단독으로 전쟁/.test(text)) changeCouncilInfluence('ignore_sage', -8);
  if (/협상을 제안|평화를 선택|싸움을 피하/.test(text)) changeCouncilInfluence('negotiate', 6);
}
window.detectOrcCouncilFromText = detectOrcCouncilFromText;

export function renderOrcCouncilPanel() {
  const body = document.getElementById('pb-orc-council');
  if (!body) return;
  if (!isOrcRace()) {
    body.innerHTML=`<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px"><div style="font-size:32px;margin-bottom:10px">🏕️</div><div>오크족 캐릭터에게만 활성화됩니다.</div></div>`;
    return;
  }
  const oc = loadOrcCouncil();
  const inf = oc.influence || 20;
  const stg = getCouncilStage(inf);
  const color = stg.color;
  const pct = inf;

  body.innerHTML = `
    <!-- ① 헤더 -->
    <div style="padding:14px;background:linear-gradient(135deg,#100a00,#1a1200);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#806030;margin-top:2px">의회 영향력 ${inf}/100 ${oc.chiefTitle?`| 🔱 ${oc.chiefTitle}`:''}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:${color}">${inf}<span style="font-size:9px;color:#605030"> / 100</span></div>
          <div style="font-size:8px;color:#605030">영향력</div>
        </div>
      </div>
      <div style="height:8px;background:#100800;border-radius:4px;overflow:hidden;margin-bottom:4px;border:1px solid #403010">
        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#604010,${color});border-radius:4px;transition:width .4s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:8px;color:#605030">
        <span>이방인</span><span>말하는 자</span>
      </div>
      <div style="margin-top:8px;font-size:10px;color:#b08040;font-style:italic">"${stg.desc}"</div>
    </div>

    <!-- ② 영향력 단계 목록 -->
    <div style="padding:8px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 의회 지위 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${[...COUNCIL_INFLUENCE_STAGES].reverse().map(s=>{
          const active = inf >= s.min && (s === COUNCIL_INFLUENCE_STAGES[COUNCIL_INFLUENCE_STAGES.length-1] || inf < COUNCIL_INFLUENCE_STAGES[COUNCIL_INFLUENCE_STAGES.indexOf(s)+1]?.min);
          const passed = inf > s.min && !active;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#1a1200':passed?'#0f0c00':'#0a0800'};border:1px solid ${active?s.color:passed?s.color+'44':'#1a1000'};border-radius:2px;opacity:${active||passed?1:0.35}">
            <span style="display:inline-flex;width:12px;height:12px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:12}):((s.svgIcon||'').replace('width="20" height="20"','width="12" height="12"')||s.icon)}</span>
            <div style="flex:1"><span style="font-family:'Cinzel',serif;font-size:9px;color:${active?s.color:passed?s.color:'#504030'}">${s.name}</span><span style="font-size:8px;color:#3a2010;margin-left:5px">(${s.min}+)</span></div>
            ${active?`<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀ 현재</span>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ③ 스탯 효과 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 의회 지위 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(stg.bonus||{}).map(([k,v])=>`<div style="padding:3px 7px;background:#0d0a00;border:1px solid #3a2a0a;border-radius:2px;font-size:9px"><span style="color:${color}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:4px">+${v}</span></div>`).join('')}
        ${Object.entries(stg.penalty||{}).map(([k,v])=>`<div style="padding:3px 7px;background:#0d0000;border:1px solid #3a0a0a;border-radius:2px;font-size:9px"><span style="color:#a06060">${k.toUpperCase()}</span><span style="color:#e05050;margin-left:4px">${v}</span></div>`).join('')}
        ${Object.keys({...stg.bonus,...stg.penalty}).length===0?`<div style="grid-column:span 2;font-size:9px;color:#403020;text-align:center;padding:6px">영향력을 높여 보너스 획득</div>`:''}
      </div>
    </div>

    <!-- ④ 현자 목록 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 의회 현자들 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
        ${COUNCIL_SAGES.map(sg=>`
          <div style="padding:7px;background:#120a00;border:1px solid #403010;border-radius:2px">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
              <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sg,{size:14}):(sg.icon)}</span>
              <div style="font-family:'Cinzel',serif;font-size:9px;color:${color}">${sg.name}</div>
            </div>
            <div style="font-size:8px;color:#704030">${esc(sg.desc)}</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- ⑤ 의회 결정 버튼 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 의회 결정 (영향력 변화) ──</div>
      <div style="display:flex;flex-direction:column;gap:4px">
        ${COUNCIL_DECISIONS.map(d=>{
          const gcol = d.gain > 0 ? '#d0a030' : '#e05050';
          return `<button onclick="changeCouncilInfluence('${d.id}');renderOrcCouncilPanel()"
            style="padding:7px 10px;background:#120800;border:1px solid ${d.gain>0?color+'55':'#601010'};color:${gcol};font-size:9px;cursor:pointer;font-family:'Crimson Text',serif;text-align:left;border-radius:2px;line-height:1.4">
            ${typeof getEntityIconHTML==='function'?getEntityIconHTML(d,{size:9}):(d.icon)} <span style="font-family:'Cinzel',serif;font-size:9px">${d.label}</span> <span style="float:right;font-family:'Cinzel',serif">${d.gain>0?'+':''}${d.gain}</span><br>
            <span style="font-size:8px;color:#705030">${esc(d.desc.slice(0,50))}...</span>
          </button>`;
        }).join('')}
      </div>
    </div>

    <!-- ⑥ 최근 기록 -->
    ${(oc.history||[]).length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 의회 기록 ──</div>
      ${[...oc.history].reverse().slice(0,10).map(h=>`
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0d0800;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#806040">${esc(h.event)}</span>
          <span style="color:${h.gain>0?'#d0a030':'#e05050'};font-family:'Cinzel',serif">${h.gain>0?'+':''}${h.gain}</span>
          <span style="color:#3a2010;font-size:8px">(${h.total})</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderOrcCouncilPanel = renderOrcCouncilPanel;

window.renderOrcCouncilPanel      = renderOrcCouncilPanel;

window.changeCouncilInfluence     = changeCouncilInfluence;

window.applyOrcCouncilStats       = applyOrcCouncilStats;

window.detectOrcCouncilFromText   = detectOrcCouncilFromText;

window.loadOrcCouncil             = loadOrcCouncil;

window.clearOrcCouncil            = clearOrcCouncil;

// [13차 감사 FIX — 제거] window.initGame은 이 게임에 그 이름의 함수가
// 없다(호출부도 전혀 없음) — 아무 효과가 없던 블록이었다. 오크 혈맹/
// 평의회 스탯 적용은 이미 quest/086의 실제 게임 재개 초기화 지점에서
// applyOrcBloodVowStats()/applyOrcCouncilStats()로 정상 호출되고 있다.

export const DARKLING_VOID_KEY   = "tf-darkling-void";

export const loadDarklingVoid    = () => {
  try {
    const raw = lsGet(DARKLING_VOID_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return {
    points: 0, stage: 0, history: [],
    shadow: { shadow:0, conceal:0, dread:0, void_touch:0, emotion_seal:0 },
    lightExposureCount: 0,
    riftActive: false,
    riftItems: [],
    formOpacity: 1.0,
    silenceCount: 0,
    awakened: false
  };
};

export const saveDarklingVoid    = (d) => { try { lsSet(DARKLING_VOID_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearDarklingVoid   = () => lsDel(DARKLING_VOID_KEY);

export const DARKLING_VOID_STAGES = [
  {
    stage: 0, name: "공허의 씨앗", icon: "🌑", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" stroke-width="1.3" opacity="0.4"/></svg>`,
    color: "#4060c0", threshold: 0,
    desc: "아직 공허가 깨어나지 않았다. 어둠 속에 서면 희미한 끌림이 느껴질 뿐.",
    statBonus: {}, statPenalty: {},
    skills: [],
    opacity: 1.0,
    aura: "일반적인 다크링으로 보인다. 공허의 기운이 느껴지지 않는다.",
    lightEffect: "빛이 닿아도 별 다른 고통이 없다.",
    aiHint: ""
  },
  {
    stage: 1, name: "그림자의 시작", icon: "🌑🌫️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5" stroke-width="1.3" opacity="0.5"/><circle cx="12" cy="12" r="8" stroke-width="1" stroke-dasharray="1 3" opacity="0.4"/></svg>`,
    color: "#5070d0", threshold: 50,
    desc: "그림자 속에 서면 존재감이 묘하게 옅어진다. 시선이 자연스럽게 미끄러진다.",
    statBonus: { disg: 8, agi: 5, per: 5, fear: 4 },
    statPenalty: { trst: -4, luk: -2 },
    skills: [
      { id: "dv_s1_shadow_step", name: "그림자 발걸음", icon: "👣", type: "passive",
        desc: "어두운 지형에서 이동이 무음이 된다. DISG +12, AGI +8. 빛 속에서 발동 안 됨.",
        rarity: "uncommon", mpCost: 0, condition: "dark_area", conditionDesc: "어두운 지형",
        statBoost: { disg: 96, agi: 64 } }
    ],
    opacity: 0.92,
    aura: "어두운 곳에 서면 윤곽이 살짝 흐릿해진다. 동물들이 근처를 기피한다.",
    lightEffect: "밝은 빛이 닿으면 약한 불쾌감이 온다. 공허도 서서히 감소.",
    aiHint: "1단계 공허: 어두운 곳에서 그림자와 하나가 되는 묘사. 눈치 채지 못한 채 옆을 지나치는 NPC."
  },
  {
    stage: 2, name: "잠식의 손길", icon: "🌑✋", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7" stroke-width="1.3" opacity="0.6"/><path d="M8 8 L16 16 M16 8 L8 16" stroke-width="1" opacity="0.5"/></svg>`,
    color: "#4080e0", threshold: 120,
    desc: "손을 뻗으면 어둠이 따라온다. 접촉한 것에 공허의 냉기가 전해진다.",
    statBonus: { disg: 16, agi: 10, per: 9, fear: 10, mgc: 7 },
    statPenalty: { trst: -8, luk: -4, fath: -5 },
    skills: [
      { id: "dv_s2_void_touch", name: "공허의 냉기", icon: "🖤", type: "active",
        desc: "MP 14. 접촉으로 대상에게 '공허 냉기' 상태이상. 매 턴 WIL·FATH -4. 빛의 존재에게 2배 효과.",
        rarity: "rare", mpCost: 14, condition: null, conditionDesc: null, statBoost: {} },
      { id: "dv_s2_existence_blur", name: "존재 흐림", icon: "🌫️", type: "passive",
        desc: "공허도 120 이상에서 항시 발동. 원거리 공격 명중률 -20%. 적이 '이미 지나간 것 같은' 느낌.",
        rarity: "rare", mpCost: 0, condition: "always", conditionDesc: "항시 발동",
        statBoost: { disg: 120, agi: 80 } }
    ],
    opacity: 0.82,
    aura: "그림자가 빛과 반대 방향으로 눕는다. 촛불이 근처에서 꺼진다.",
    lightEffect: "직사광선이 닿으면 피부가 타는 듯한 감각. 공허도 빠르게 감소.",
    aiHint: "2단계: 촛불이나 횃불이 다크링 근처에서 자연스럽게 꺼진다. 그림자가 빛을 먹는 묘사."
  },
  {
    stage: 3, name: "심연의 속삭임", icon: "🌑💬", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.2" stroke-dasharray="2 2"/></svg>`,
    color: "#3090f0", threshold: 220,
    desc: "목소리에 공허의 울림이 섞인다. 말이 상대의 의식 깊은 곳에 직접 닿는다.",
    statBonus: { disg: 26, agi: 16, per: 16, fear: 20, mgc: 14, mad: 8, crse: 8 },
    statPenalty: { trst: -14, luk: -7, fath: -10, rep: -5 },
    skills: [
      { id: "dv_s3_void_whisper", name: "공허의 속삭임", icon: "💬", type: "active",
        desc: "MP 22. 대상의 가장 깊은 두려움에 공허의 목소리를 심는다. 3턴간 FEAR +20, 행동 판정 -15.",
        rarity: "rare", mpCost: 22, condition: null, conditionDesc: null, statBoost: {} },
      { id: "dv_s3_shadow_clone", name: "그림자 잔상", icon: "👤", type: "active",
        desc: "MP 18. 자신의 그림자 잔상을 1개 생성. 적의 공격 1회 흡수. 잔상은 빛이 닿으면 소멸.",
        rarity: "rare", mpCost: 18, condition: null, conditionDesc: null, statBoost: {} }
    ],
    opacity: 0.70,
    aura: "윤곽이 명확히 반투명하다. 그 너머로 어둠이 보인다. 성직자들이 경계를 높인다.",
    lightEffect: "빛이 닿는 부분이 연기처럼 흩어지며 고통. 신성 장소 진입 시 자동 감지.",
    aiHint: "3단계: 다크링의 목소리가 귀가 아닌 머릿속에서 직접 울린다. 주변 공간이 약간 일그러진다."
  },
  {
    stage: 4, name: "공허 균열", icon: "🌀🌑", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.2"/><path d="M12 4 L12 20 M4 12 L20 12" stroke-width="0.9" opacity="0.6"/></svg>`,
    color: "#20a0ff", threshold: 350,
    desc: "존재가 충분히 희미해져 현실에 균열이 생긴다. 주변 아이템이 공허로 빨려 들어가기 시작한다.",
    statBonus: { disg: 40, agi: 24, per: 24, fear: 32, mgc: 22, mad: 16, crse: 16, int: 10 },
    statPenalty: { trst: -22, luk: -12, fath: -16, rep: -10 },
    skills: [
      { id: "dv_s4_void_rift", name: "공허 균열", icon: "🌀", type: "active",
        desc: "MP 35. 주변에 공허 균열 생성. 적 아이템 1개를 공허로 흡수하고 동등한 공허 아이템 방출. 신성 아이템 흡수 시 폭발.",
        rarity: "epic", mpCost: 35, condition: null, conditionDesc: null, statBoost: {} },
      { id: "dv_s4_void_body", name: "공허 육체", icon: "💨", type: "passive",
        desc: "물리 공격 30% 회피 (존재가 희미해 관통됨). 단, 빛 계열 공격에는 2배 피해.",
        rarity: "epic", mpCost: 0, condition: "always", conditionDesc: "항시 발동",
        statBoost: { disg: 240, agi: 160, fear: 200 } }
    ],
    opacity: 0.55,
    riftActive: true,
    aura: "주변에 작은 공허 균열이 맴돈다. 작은 물건들이 간혹 사라진다. 빛의 종교 세력이 수배한다.",
    lightEffect: "직사광선에 외형이 빠르게 증발한다. 낮에는 모든 스탯 -15%.",
    aiHint: "4단계: 주변 소품이 이유 없이 사라진다. 허공에 검은 균열이 잠깐 나타났다 사라진다. 성직자들이 전기라도 맞은 것처럼 경계한다."
  },
  {
    stage: 5, name: "반존재", icon: "👻🌑", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 4 15.5 4 9.5 C4 6.5 6.2 4.5 8.8 4.5 C10.2 4.5 11.3 5.2 12 6.3 C12.7 5.2 13.8 4.5 15.2 4.5 C17.8 4.5 20 6.5 20 9.5 C20 15.5 12 21 12 21 Z" stroke-linejoin="round" opacity="0.5"/></svg>`,
    color: "#10b0ff", threshold: 520,
    desc: "이제 반쪽은 현실에, 반쪽은 공허에 존재한다. 두 세계를 동시에 감지한다.",
    statBonus: { disg: 56, agi: 34, per: 36, fear: 46, mgc: 32, mad: 26, crse: 26, int: 18, str: 10 },
    statPenalty: { trst: -32, luk: -18, fath: -24, rep: -16 },
    skills: [
      { id: "dv_s5_phase_walk", name: "위상 보행", icon: "🌌", type: "active",
        desc: "MP 40. 3턴간 완전 비물질화. 물리 공격 무효. 단, 공격도 불가. 빛 속에서 강제 종료.",
        rarity: "legendary", mpCost: 40, condition: null, conditionDesc: null, statBoost: {} },
      { id: "dv_s5_void_domain", name: "공허 영역", icon: "🌑", type: "active",
        desc: "MP 45. 반경 내를 공허화. 3턴간 적 DISG·PER -25, 아군(어둠계) 스탯+20. 빛 지형 소멸.",
        rarity: "legendary", mpCost: 45, condition: null, conditionDesc: null, statBoost: {} }
    ],
    opacity: 0.38,
    aura: "반투명 실루엣만 보인다. 그 너머로 어둠이 출렁인다. 어둠의 하위 존재들이 자발적으로 따른다.",
    lightEffect: "빛 지역에서 존재를 유지하는 것 자체가 소모. 매 턴 HP -3.",
    aiHint: "5단계: 외형이 거의 보이지 않는다. 어둠 속에서만 완전한 실루엣이 드러난다. 공허에서 무언가가 속삭이는 소리가 주변에 들린다."
  },
  {
    stage: 6, name: "공허의 군주", icon: "👑🌑", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.4" stroke="none"/></svg>`,
    color: "#00c0ff", threshold: 750,
    desc: "이름이 공허에 새겨졌다. 현실보다 공허에 더 깊이 속한다.",
    statBonus: { disg: 76, agi: 46, per: 50, fear: 64, mgc: 44, mad: 38, crse: 40, int: 28, str: 16 },
    statPenalty: { trst: -44, luk: -26, fath: -36, rep: -24 },
    skills: [
      { id: "dv_s6_void_devour", name: "공허 잠식", icon: "⚫", type: "active",
        desc: "MP 60. 대상을 일시적으로 공허에 가둔다. 1턴간 대상이 현실에서 사라짐. 신성 존재 불가.",
        rarity: "legendary", mpCost: 60, condition: null, conditionDesc: null, statBoost: {} },
      { id: "dv_s6_eternal_shadow", name: "영원한 그림자", icon: "🌑", type: "passive",
        desc: "그림자가 독립적으로 행동한다. 매 턴 그림자가 가장 가까운 적에게 FEAR -10, WIL -8 자동 적용.",
        rarity: "legendary", mpCost: 0, condition: "always", conditionDesc: "항시 발동",
        statBoost: { disg: 480, agi: 320, fear: 420, mgc: 300, mad: 260 } }
    ],
    opacity: 0.20,
    aura: "흐릿한 검은 윤곽만 보인다. 빛의 신들이 이 존재의 이름을 기억에 새긴다.",
    lightEffect: "빛 지역에서 매 턴 HP -8, 형체 유지 불가. 낮 시간대 활동에 모든 판정 -20%.",
    aiHint: "6단계: 거의 그림자만 남은 존재. 말할 때 목소리가 여러 방향에서 동시에 들린다. 세레스티얼이나 성직자는 이 존재를 보는 것만으로 공황 반응."
  },
  {
    stage: 7, name: "완전한 그림자", icon: "⚫∞", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.2"/><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.75" stroke="none"/></svg>`,
    color: "#00d8ff", threshold: 1000,
    desc: "잠식이 완성됐다. 더 이상 육체가 아닌 공허 그 자체다. 빛이 있어야 그림자가 존재하듯 — 이 존재는 세계의 어둠이 됐다.",
    statBonus: { disg: 100, agi: 60, per: 70, fear: 90, mgc: 60, mad: 55, crse: 58, int: 40, str: 22 },
    statPenalty: { trst: -60, luk: -36, fath: -50, rep: -38 },
    skills: [
      { id: "dv_s7_void_incarnate", name: "공허 화신", icon: "⚫", type: "active",
        desc: "HP 100 소모. 3턴간 완전한 공허 형태. 모든 물리·마법 공격 무효, 공허 피해만 존재. 빛 지역 자동 소멸.",
        rarity: "legendary", mpCost: 0, condition: null, conditionDesc: null, statBoost: {} },
      { id: "dv_s7_shadow_immortal", name: "그림자 불멸", icon: "∞", type: "passive",
        desc: "빛이 있는 한 그림자도 존재한다. 사망 시 가장 어두운 그림자 속에서 재탄생. 재탄생마다 공허도 +15.",
        rarity: "legendary", mpCost: 0, condition: "always", conditionDesc: "항시 발동",
        statBoost: { disg: 680, agi: 460, per: 480, fear: 620, mgc: 420, mad: 380, crse: 400 } }
    ],
    opacity: 0.05,
    aura: "존재 자체가 주변의 빛을 흡수한다. 이 존재가 지나간 자리에 그림자만 남는다. 세계 어둠의 일부가 됐다.",
    lightEffect: "빛 지역 진입 불가 (강제 차단). 유일한 약점.",
    aiHint: "7단계: 형체가 전혀 없다. 흐르는 어둠 덩어리, 말할 때 공기가 차가워지고 빛이 꺼진다. 빛의 존재들이 본능적 공포로 도망친다. 어둠의 정령들이 절을 한다."
  }
];

export function gainDarklingVoid(voidType, customGain) {
  const race = S.character?.race || "";
  const isDarkling = race.includes("다크링") || race.includes("darkling");
  if (!isDarkling) return;
  const dv = loadDarklingVoid();
  const typeDef = DARKLING_VOID_TYPES[voidType];
  const gain = customGain !== undefined ? customGain : (typeDef?.gain || 5);
  dv.points = Math.min(1000, (dv.points || 0) + gain);
  dv.shadow = dv.shadow || {};
  if (voidType) dv.shadow[voidType] = (dv.shadow[voidType] || 0) + 1;
  dv.history = dv.history || [];
  dv.history.push({
    type: voidType, gain, label: typeDef?.label || voidType,
    icon: typeDef?.icon || "🌑", total: dv.points,
    at: new Date().toISOString().slice(0, 16)
  });
  
  const prevStage = dv.stage || 0;
  let newStage = 0;
  for (let i = DARKLING_VOID_STAGES.length - 1; i >= 0; i--) {
    if (dv.points >= DARKLING_VOID_STAGES[i].threshold) { newStage = i; break; }
  }
  dv.stage = newStage;
  // 균열 활성화
  if (newStage >= 4) dv.riftActive = true;
  // 존재 투명도 업데이트
  dv.formOpacity = DARKLING_VOID_STAGES[newStage].opacity;
  saveDarklingVoid(dv);
  if (newStage > prevStage) {
    const stg = DARKLING_VOID_STAGES[newStage];
    setTimeout(() => {
      toastHTML(`🌑 공허 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)} (${esc(newStage)}단계)`, 4000);
      stg.skills.forEach(sk => {
        if (!S.unlockedSkills[sk.id]) {
          S.unlockedSkills[sk.id] = true;
          saveSkills(S.unlockedSkills);
          setTimeout(() => toastHTML(`🔓 공허 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 3000), 1500);
        }
      });
    }, 500);
  }
  applyDarklingVoidStats();
  return dv;
}
window.gainDarklingVoid = gainDarklingVoid;

export function reduceDarklingVoid(amount, methodId) {
  const race = S.character?.race || "";
  const isDarkling = race.includes("다크링") || race.includes("darkling");
  if (!isDarkling) return;
  const dv = loadDarklingVoid();
  const method = DARKLING_LIGHT_EXPOSURE.find(m => m.id === methodId);
  // 고통 수반 방법 → HP 감소 (단계 비례)
  if (method?.pain && dv.stage >= 3) {
    const painDmg = Math.floor(dv.stage * 4);
    S.stats.hp = Math.max(1, (S.stats.hp || 100) - painDmg);
    toast(`☀️ 빛의 고통! HP -${painDmg}`, 2000);
  }
  dv.points = Math.max(0, (dv.points || 0) - amount);
  dv.lightExposureCount = (dv.lightExposureCount || 0) + 1;
  dv.history = dv.history || [];
  dv.history.push({
    type: "light", gain: -amount, label: method?.name || "빛 노출",
    icon: method?.icon || "☀️", total: dv.points,
    at: new Date().toISOString().slice(0, 16)
  });
  let newStage = 0;
  for (let i = DARKLING_VOID_STAGES.length - 1; i >= 0; i--) {
    if (dv.points >= DARKLING_VOID_STAGES[i].threshold) { newStage = i; break; }
  }
  dv.stage = newStage;
  dv.formOpacity = DARKLING_VOID_STAGES[newStage].opacity;
  saveDarklingVoid(dv);
  applyDarklingVoidStats();
  window.updateHeader();
  toast(`☀️ 빛 노출! 공허도 -${amount} (현재: ${dv.points})`, 3000);
  return dv;
}
window.reduceDarklingVoid = reduceDarklingVoid;

export function applyDarklingVoidStats() {
  const dv = loadDarklingVoid();
  const stg = DARKLING_VOID_STAGES[dv.stage || 0];
  if (!stg) return;
  const prev = S._darklingVoidBonus || {};
  Object.entries(prev).forEach(([k, v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });
  const newBonus = {};
  Object.entries(stg.statBonus || {}).forEach(([k, v]) => { S.stats[k] = Math.min(999, (S.stats[k] || 50) + v); newBonus[k] = v; });
  Object.entries(stg.statPenalty || {}).forEach(([k, v]) => { S.stats[k] = Math.max(0, (S.stats[k] || 50) + v); });
  S._darklingVoidBonus = newBonus;
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
}
window.applyDarklingVoidStats = applyDarklingVoidStats;

export function getDarklingVoidStatus() {
  const race = S.character?.race || "";
  const isDarkling = race.includes("다크링") || race.includes("darkling");
  if (!isDarkling) return null;
  const dv = loadDarklingVoid();
  const stg = DARKLING_VOID_STAGES[dv.stage || 0];
  const nextStg = DARKLING_VOID_STAGES[(dv.stage || 0) + 1];
  return { ...dv, stageDef: stg, nextStage: nextStg };
}
window.getDarklingVoidStatus = getDarklingVoidStatus;

export function detectDarklingVoidFromText(text) {
  if (!text) return;
  const race = S.character?.race || "";
  const isDarkling = race.includes("다크링") || race.includes("darkling");
  if (!isDarkling) return;
  if (/그림자|어둠 속|잠복|은신|어둠에 녹|그늘/.test(text) && Math.random() < 0.5)  { gainDarklingVoid('shadow', 4); }
  if (/존재감|숨|기억에서|지워|모습을 감/.test(text) && Math.random() < 0.4)          { gainDarklingVoid('conceal', 3); }
  if (/공포|두려움|서늘|냉기|섬뜩|등골/.test(text) && Math.random() < 0.45)           { gainDarklingVoid('dread', 5); }
  if (/공허|균열|어둠의 힘|차원|블랙홀/.test(text) && Math.random() < 0.4)            { gainDarklingVoid('void_touch', 6); }
  if (/감정을 억|냉정|무표정|무감각|차갑게/.test(text) && Math.random() < 0.35)       { gainDarklingVoid('emotion_seal', 3); }
  // 빛 노출 감지 → 공허도 자동 감소
  if (/햇빛|태양|빛에 노출|눈부|광명|빛이 쏟아/.test(text) && Math.random() < 0.5)   {
    reduceDarklingVoid(8, 'light_sunlight');
  }
}
window.detectDarklingVoidFromText = detectDarklingVoidFromText;

export function darklingLightExposure(methodId) {
  const method = DARKLING_LIGHT_EXPOSURE.find(m => m.id === methodId);
  if (!method) return;
  const dv = loadDarklingVoid();
  if (dv.points <= 0) { toast('공허도가 이미 0입니다'); return; }
  if (method.id === 'light_candle' && (S.stats.hp || 100) <= 10) { toast('HP가 너무 낮습니다'); return; }
  if (method.id === 'light_candle') { S.stats.hp = Math.max(1, (S.stats.hp || 100) - 5); }
  reduceDarklingVoid(method.reduce, methodId);
  window.updateHeader();
  if (typeof window.renderDarklingVoidPanel === 'function') window.renderDarklingVoidPanel();
}
window.darklingLightExposure = darklingLightExposure;

function renderDarklingVoidPanel() {
  const body = document.getElementById('pb-darkling-void');
  if (!body) return;
  const status = getDarklingVoidStatus();
  if (!status) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">🌟</div>
      <div>다크링 캐릭터에게만 활성화됩니다.</div>
      <div style="margin-top:6px;font-size:10px">캐릭터 설정에서 종족을 다크링으로 선택하세요.</div>
    </div>`;
    return;
  }
  const dv = status;
  const stg = dv.stageDef;
  const nextStg = dv.nextStage;
  const color = stg.color;
  const totalShadow = Object.values(dv.shadow || {}).reduce((a, v) => a + v, 0);
  const stageSkills = DARKLING_VOID_STAGES.slice(0, (dv.stage || 0) + 1).flatMap(s => s.skills);
  const opacityPct = Math.round((1 - stg.opacity) * 100);

  body.innerHTML = `
    <!-- 헤더: 현재 공허 단계 -->
    <div style="padding:14px;background:linear-gradient(135deg,#00020a,#000415);border-bottom:2px solid ${color};margin-bottom:0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center;opacity:${stg.opacity < 0.3 ? 0.5 : 1}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#304080;margin-top:2px">${dv.stage}단계 / 7단계 · 투명도 ${opacityPct}%</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:${color}">${dv.points}<span style="font-size:9px;color:#203060"> / 1000</span></div>
          <div style="font-size:8px;color:#203060">공허도</div>
        </div>
      </div>
      <!-- 공허도 바 -->
      <div style="height:6px;background:#00020a;border-radius:3px;overflow:hidden;margin-bottom:4px">
        <div style="width:${Math.min(100, Math.round(dv.points / 10))}%;height:100%;background:linear-gradient(90deg,#102060,${color});border-radius:3px;transition:width .4s"></div>
      </div>
      ${nextStg ? `
        <div style="display:flex;justify-content:space-between;font-size:8px;color:#203060">
          <span>현재: ${dv.points}</span>
          <span>다음 단계 (${nextStg.name}): ${nextStg.threshold}</span>
        </div>
      ` : `<div style="font-size:8px;color:${color};text-align:center">⚫ 공허 잠식 완성 — 그림자가 됐다</div>`}
      <div style="margin-top:8px;font-size:10px;color:#4060a0;line-height:1.6;font-style:italic">"${stg.desc}"</div>
    </div>

    <!-- 존재 투명화 게이지 -->
    <div style="padding:10px 12px;background:#00020c;border-bottom:1px solid #0a1030">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 존재 희미화 ──</div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:20px;opacity:${stg.opacity};filter:brightness(0.6) invert(1)">👤</span>
        <div style="flex:1">
          <div style="height:8px;background:#101525;border-radius:4px;overflow:hidden;position:relative">
            <div style="width:${opacityPct}%;height:100%;background:linear-gradient(90deg,${color},#00ffff);border-radius:4px;transition:width .5s"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:8px;color:#304060;margin-top:2px">
            <span>완전 실체 (0%)</span><span>완전 그림자 (100%)</span>
          </div>
        </div>
        <span style="font-family:'Cinzel',serif;font-size:11px;color:${color}">${opacityPct}%</span>
      </div>
      <div style="font-size:9px;color:#304060;margin-top:6px;font-style:italic">☀️ ${stg.lightEffect}</div>
      ${dv.stage >= 4 ? `<div style="margin-top:5px;padding:4px 8px;background:#0a0015;border:1px solid ${color}55;border-radius:2px;font-size:9px;color:${color}">🌀 공허 균열 활성화 — 주변 아이템이 간헐적으로 공허로 흡수됨</div>` : ''}
    </div>

    <!-- 단계 진행 트리 -->
    <div style="padding:10px 12px;border-bottom:1px solid #0a1030">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 공허 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${DARKLING_VOID_STAGES.map((s, i) => {
          const active = i === dv.stage;
          const passed = i < dv.stage;
          const c = s.color;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#000818':passed?'#00050f':'#00020a'};border:1px solid ${active?c:passed?c+'55':'#0a1030'};border-radius:2px;opacity:${active?1:passed?0.7:0.35}">
            <span style="font-size:11px;opacity:${s.opacity < 0.3 ? 0.5 : 1}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:11}):(s.icon)}</span>
            <div style="flex:1">
              <span style="font-family:'Cinzel',serif;font-size:9px;color:${active?c:passed?c:'#203060'}">${s.name}</span>
              <span style="font-size:8px;color:#203050;margin-left:5px">(${s.threshold})</span>
            </div>
            ${active ? `<span style="font-size:8px;color:${c};font-family:'Cinzel',serif">◀ 현재</span>` : ''}
            ${passed ? `<span style="font-size:9px;color:${c}">✓</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- 스탯 효과 -->
    <div style="padding:10px 12px;border-bottom:1px solid #0a1030">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 공허 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(stg.statBonus || {}).map(([k,v])=>`
          <div style="padding:3px 7px;background:#000810;border:1px solid #0a1830;border-radius:2px;font-size:9px">
            <span style="color:${color}">${k.toUpperCase()}</span><span style="color:#40a0e0;margin-left:4px">+${v}</span>
          </div>`).join('')}
        ${Object.entries(stg.statPenalty || {}).map(([k,v])=>`
          <div style="padding:3px 7px;background:#0a0000;border:1px solid #200a0a;border-radius:2px;font-size:9px">
            <span style="color:#806060">${k.toUpperCase()}</span><span style="color:#c04040;margin-left:4px">${v}</span>
          </div>`).join('')}
      </div>
    </div>

    <!-- 공허 스킬 -->
    ${stageSkills.length ? `
    <div style="padding:10px 12px;border-bottom:1px solid #0a1030">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 공허 전용 스킬 ──</div>
      ${stageSkills.map(sk => {
        if(!S.unlockedSkills) S.unlockedSkills = {}; // [F-12 FIX]
        const unlocked = !!S.unlockedSkills[sk.id];
        return `<div style="padding:7px 9px;background:${unlocked?'#000c18':'#00050f'};border:1px solid ${unlocked?color+'55':'#0a1030'};margin-bottom:4px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:10px;color:${color}">${esc(sk.name)}</span>
            <span style="font-size:8px;padding:1px 5px;background:${color}22;color:${color};border:1px solid ${color}44;border-radius:2px;margin-left:auto">${sk.rarity}</span>
            ${unlocked ? '<span style="font-size:9px;color:#40d060">✓</span>' : '<span style="font-size:9px;color:#203050">🔒</span>'}
          </div>
          <div style="font-size:9px;color:#304070;line-height:1.5">${esc(sk.desc)}</div>
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- 잠식 행동 통계 -->
    <div style="padding:10px 12px;border-bottom:1px solid #0a1030">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 잠식 기록 (총 ${totalShadow}회) ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(DARKLING_VOID_TYPES).map(([k, def]) => `
          <div style="padding:5px 8px;background:#00050f;border:1px solid #0a1020;border-radius:2px">
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">
              <span style="font-size:11px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:11}):(def.icon)}</span>
              <span style="font-size:9px;color:#304070">${def.label}</span>
            </div>
            <div style="font-family:'Cinzel',serif;font-size:12px;color:${color}">${dv.shadow?.[k] || 0}<span style="font-size:8px;color:#203050">회</span></div>
          </div>`).join('')}
      </div>
    </div>

    <!-- 공허 잠식 행동 버튼 (AI 없이도 진행되도록 하는 수동 트리거 — 기존엔
         detectDarklingVoidFromText의 AI 서사 감지에만 의존해 no-API 모드에서
         공허도 증가 쪽만 영구 정지했음. 감소 쪽(darklingLightExposure)은
         이미 아래에 수동 버튼이 있었음 — 그 옆에 증가 쪽을 추가) -->
    <div style="padding:10px 12px;border-bottom:1px solid #0a1030">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 공허 잠식 (수동) ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
        ${Object.entries(DARKLING_VOID_TYPES).map(([id,def]) => `
          <button onclick="gainDarklingVoid('${id}');renderDarklingVoidPanel()"
            style="padding:6px;background:#00050f;border:1px solid ${color}44;color:${color};font-size:8px;cursor:pointer;font-family:'Crimson Text',serif;text-align:left;border-radius:2px;line-height:1.3">
            ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:7}):(def.icon)} ${def.label}
            <span style="float:right;font-family:'Cinzel',serif;color:${color}">+${def.gain}</span>
          </button>`).join('')}
      </div>
    </div>

    <!-- 빛 노출 (공허도 감소) -->
    <div style="padding:10px 12px;border-bottom:1px solid #0a1030">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:4px">── 빛 노출 (공허도 감소) ──</div>
      <div style="font-size:9px;color:#304050;margin-bottom:7px;font-style:italic">※ 정화 방법 없음. 오직 빛과의 접촉으로만 낮출 수 있다.</div>
      ${DARKLING_LIGHT_EXPOSURE.map(m => {
        const canHp = m.id !== 'light_candle' || (S.stats.hp || 100) > 10;
        const canUse = canHp && dv.points > 0;
        return `<div style="padding:8px 10px;background:#00020a;border:1px solid ${canUse?'#103080':'#0a1020'};margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:14}):(m.icon)}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${canUse?'#4070c0':'#203050'}">${m.name}</div>
              <div style="font-size:8px;color:#203040;margin-top:1px">조건: ${m.req}</div>
            </div>
            <span style="font-size:9px;color:#40a080;font-family:'Cinzel',serif">-${m.reduce}</span>
          </div>
          <div style="font-size:9px;color:#304060;margin-bottom:5px">${esc(m.desc)}</div>
          <button onclick="darklingLightExposure('${m.id}');renderDarklingVoidPanel()"
            style="width:100%;padding:5px;background:${canUse?'#0a1530':'#00020a'};border:1px solid ${canUse?'#2050a0':'#0a1020'};color:${canUse?'#4070c0':'#203050'};font-family:'Cinzel',serif;font-size:9px;cursor:${canUse?'pointer':'not-allowed'};border-radius:2px"
            ${canUse?'':'disabled'}>
            ${canUse ? (m.pain ? `${m.icon} 빛에 노출되기 (고통 수반)` : `${m.icon} 빛 명상하기`) : '조건 미충족'}
          </button>
        </div>`;
      }).join('')}
    </div>

    <!-- 최근 기록 -->
    ${dv.history && dv.history.length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 최근 기록 ──</div>
      ${[...dv.history].reverse().slice(0, 10).map(h => `
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #00050f;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#304060">${h.label}</span>
          <span style="color:${h.gain > 0 ? '#4080d0' : '#40a080'};font-family:'Cinzel',serif">${h.gain > 0 ? '+' : ''}${h.gain}</span>
          <span style="color:#102030;font-size:8px">(${h.total})</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderDarklingVoidPanel = renderDarklingVoidPanel;

window.gainDarklingVoid         = gainDarklingVoid;

window.reduceDarklingVoid       = reduceDarklingVoid;

window.darklingLightExposure    = darklingLightExposure;

window.detectDarklingVoidFromText = detectDarklingVoidFromText;

window.applyDarklingVoidStats   = applyDarklingVoidStats;

window.getDarklingVoidStatus    = getDarklingVoidStatus;

export const VAMPIRE_CHRONICLE_KEY = 'tf-vampire-chronicle';

export const loadVampireChronicle = () => {
  try {
    const raw = lsGet(VAMPIRE_CHRONICLE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return {
    // ── 총 연대기 점수 ──
    points: 0,
    stage:  0,
    // ── ① 혈통 기록부 ──
    bloodRegister: {
      total: 0,
      entries: [],          // [{name, type, class, points, turn}]
      specializations: {},  // {class: count} ex) warrior:3, mage:1
      rarest: null,         // 가장 희귀한 흡혈 대상
    },
    // ── ② 공포 기록부 ──
    fearRegistry: {
      total: 0,
      entries: [],          // [{name, rank, fearLevel, location, turn}]
      byRank: {},           // {commoner:2, noble:1, ...}
      cityFear: {},         // {locId: fearLevel 0~100}
      dominantFear: null,   // 가장 두려워하는 자의 신분
    },
    // ── ③ 시대 기록부 ──
    eraRecord: {
      totalTurns: 0,
      cyclesAsVampire: 0,   // 뱀파이어로 플레이한 환생 수
      ancientThreshold: 0,  // 고대 뱀파이어 임계값
      daysSurvived: 0,
      nightsHunted: 0,
    },
    // ── 로어 갱신 ──
    lore: '',
    history: [],
  };
};

export const saveVampireChronicle = (d) => { try { lsSet(VAMPIRE_CHRONICLE_KEY, JSON.stringify(d)); } catch(e) {} };


export const VAMPIRE_CHRONICLE_STAGES = [
  {
    stage: 0, name: '눈뜸',   icon: '🩸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="8" ry="5" stroke-width="1.3"/><circle cx="12" cy="12" r="2"/></svg>`,    threshold: 0,
    color: '#8b0000',
    desc: '불사를 선택한 직후. 피의 맛을 처음 알았다. 역사가 아직 시작되지 않았다.',
    statBonus: {},
    statPenalty: { fath: -10, trst: -5 },
    nightBonus: 5, dayPenalty: 8,
    skills: [],
    aura: '갓 태어난 뱀파이어. 인간이었을 때의 체취가 아직 남아있다.',
    aiHint: '눈뜸 단계: 이 뱀파이어는 아직 자신의 본성에 익숙하지 않다. 흡혈 충동과 인간이었던 기억 사이에서 혼란스러워하는 묘사를 가끔 포함하라.'
  },
  {
    stage: 1, name: '기록의 시작', icon: '📜🩸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L4 19 L11 19 L11 4 Z" stroke-linejoin="round"/><circle cx="7.5" cy="14" r="1.3" fill="currentColor" stroke="none"/></svg>`, threshold: 80,
    color: '#a01010',
    desc: '피의 기억이 쌓이기 시작했다. 첫 번째 공포가 이름에 붙었다. 역사가 흘러가고 있다.',
    statBonus: { str: 6, agi: 8, per: 10, cha: 6, fear: 8 },
    statPenalty: { fath: -15, trst: -8, regen: -5 },
    nightBonus: 10, dayPenalty: 6,
    skills: [
      { id: 'vc_s1_blood_memory', name: '혈액 기억', icon: '🩸💭', type: 'passive', rarity: 'uncommon',
        desc: '흡혈한 대상의 직업 기억이 혈관에 남는다. 흡혈 대상 직업군의 판정 +8. 기록부에 등록된 대상 유형이 많을수록 효과 증가.',
        mpCost: 0, condition: 'always', conditionDesc: '항시',
        statBoost: { per: 40, str: 32 },
        aiHint: '혈액 기억 발동: 손목 혈관 아래서 기억의 파편들이 흘러다닌다. 과거에 마신 피의 주인들이 남긴 기술이 손끝에서 되살아난다.' },
    ],
    aura: '눈빛에 붉은 기운이 돌기 시작했다. 인간들이 본능적으로 시선을 피한다.',
    aiHint: '1단계: 뱀파이어의 눈이 가끔 붉게 빛난다. NPC들이 이유 없이 불편함을 느끼며 대화 도중 살짝 물러선다.'
  },
  {
    stage: 2, name: '공포의 이름', icon: '😱🩸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>`, threshold: 220,
    color: '#c01818',
    desc: '이름이 소문이 됐다. 특정 지역에서는 이름만 들어도 사람들이 떤다. 공포가 힘이 된다.',
    statBonus: { str: 14, agi: 16, per: 20, cha: 14, fear: 20, mgc: 10 },
    statPenalty: { fath: -22, trst: -14, regen: -8 },
    nightBonus: 18, dayPenalty: 5,
    skills: [
      { id: 'vc_s2_fear_harvest', name: '공포 수확', icon: '😱', type: 'active', rarity: 'rare',
        desc: 'MP 18. 공포 기록부에 등록된 신분의 NPC와 마주칠 때 자동 위협 판정. 성공 시 전투 없이 굴복. 해당 신분 공포 레벨 +5.',
        mpCost: 18, condition: null, conditionDesc: null,
        statBoost: {},
        effects: { kind:'statBoost', statMod:{fear:14,cha:8} },
        aiHint: '공포 수확 발동: 뱀파이어가 등장하는 순간 공기가 무거워진다. 이름을 들은 적 있는 NPC의 눈에 공포가 번지며, 무기를 쥔 손이 떨리기 시작한다.' },
      { id: 'vc_s2_night_sovereign', name: '밤의 영역', icon: '🌙', type: 'passive', rarity: 'rare',
        desc: '야간 모든 스탯 +18. 하지만 낮에는 실내에서도 STR·AGI -5 추가 패널티.',
        mpCost: 0, condition: 'night', conditionDesc: '야간',
        statBoost: { str: 100, agi: 120, per: 140, fear: 130, cha: 100 },
        aiHint: '밤의 영역: 밤이 되면 이 뱀파이어의 움직임이 달라진다. 낮에는 억누르고 있던 무언가가 해방되는 묘사.' }
    ],
    aura: '주변에 낮은 공포의 파동이 퍼진다. 동물들이 일제히 달아난다. 아이들이 운다.',
    aiHint: '2단계: 이 뱀파이어의 이름이 특정 지역에서 알려지기 시작했다. 그 지역 출신 NPC들은 이름을 듣는 순간 반응이 달라진다. 소문이 선행한다.'
  },
  {
    stage: 3, name: '혈통의 역사', icon: '📖🩸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L4 19 L11 19 L11 4 Z" stroke-linejoin="round"/><path d="M13 4 L13 19 L20 19 L20 4 Z" stroke-linejoin="round"/><circle cx="16.5" cy="10" r="1.3" fill="currentColor" stroke="none"/></svg>`, threshold: 450,
    color: '#d82020',
    desc: '피의 기록이 수십 명을 넘었다. 어떤 피를 마셨는지가 이 존재를 정의한다. 역사가 몸에 새겨졌다.',
    statBonus: { str: 24, agi: 26, per: 32, cha: 24, fear: 34, mgc: 20, wil: 15 },
    statPenalty: { fath: -32, trst: -22, regen: -12 },
    nightBonus: 28, dayPenalty: 3,
    skills: [
      { id: 'vc_s3_ancient_read', name: '고대의 독해', icon: '📜', type: 'active', rarity: 'rare',
        desc: 'MP 20. 마신 피의 종류에 따라 다른 능력 발현. 전사의 피: STR·END 판정 폭발. 마법사의 피: MGC·INT 극대. 귀족의 피: CHR·SPK 최대화. 3턴 지속.',
        mpCost: 20, condition: null, conditionDesc: null,
        statBoost: {},
        effects: { kind:'buff', statMod:{str:12,mgc:12,cha:12}, duration:3 },
        aiHint: '고대의 독해 발동: 혈관 안에서 과거의 피들이 요동친다. 마신 자들의 기술이 한꺼번에 손끝으로 흘러나오는 압도적인 장면.' },
      { id: 'vc_s3_named_terror', name: '이름의 공포', icon: '🏛️', type: 'event', rarity: 'epic',
        desc: '공포 기록부에 귀족 이상 3명 등록 시 자동 해금. 그 신분 NPC가 이름을 들으면 자동으로 FEAR 판정. 실패 시 즉시 도주 또는 굴복. 전투 시작 전 발동.',
        mpCost: 0, condition: 'fear_registry_noble', conditionDesc: '귀족 공포 기록 3명 이상',
        statBoost: { fear: 200, cha: 150 },
        aiHint: '이름의 공포: 뱀파이어의 이름이 방 안에 퍼지는 순간, 귀족 NPC의 안색이 변한다. 오래전 들은 소문이 현실로 다가오는 공포.' }
    ],
    aura: '과거에 마신 피의 기억들이 눈빛에 어린다. 오래 쳐다보면 그 눈 속에서 다른 얼굴들이 보인다.',
    aiHint: '3단계: 이 뱀파이어에게는 역사가 있다. NPC들이 그것을 직감한다. 전투 전에 상대가 먼저 이름을 확인하려 하거나, 알아본 순간 태도가 돌변한다.'
  },
  {
    stage: 4, name: '고대의 존재', icon: '🌑👑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21 L4 9 L6 9 L6 7 L8 7 L8 9 L10.5 9 L10.5 6 L13.5 6 L13.5 9 L16 9 L16 7 L18 7 L18 9 L20 9 L20 21 Z" stroke-linejoin="round"/><circle cx="12" cy="3" r="1" fill="currentColor" stroke="none"/></svg>`, threshold: 700,
    color: '#f03030',
    desc: '수십 년이 지났다. 인간의 역사 속에 자신의 흔적이 새겨졌다. 이름이 전설이 됐다.',
    statBonus: { str: 36, agi: 38, per: 48, cha: 36, fear: 50, mgc: 32, wil: 25, int: 18 },
    statPenalty: { fath: -44, trst: -32, regen: -15 },
    nightBonus: 40, dayPenalty: 0,
    skills: [
      { id: 'vc_s4_legend_aura', name: '전설의 기운', icon: '👑', type: 'passive', rarity: 'legendary',
        desc: '항시 발동. 처음 만나는 NPC가 이름을 알아보면 자동으로 FEAR 판정. 공포 기록부 도시의 정보가 자동 수집. 야간 낮 패널티 완전 소멸.',
        mpCost: 0, condition: 'always', conditionDesc: '항시',
        statBoost: { str: 220, agi: 240, per: 320, fear: 380, cha: 220, mgc: 200 },
        aiHint: '전설의 기운: 이 뱀파이어가 등장하는 것만으로 장면의 분위기가 바뀐다. NPC들이 대화를 멈추고 눈치를 본다. 누군가 이름을 알아보는 순간 긴장이 전파된다.' },
      { id: 'vc_s4_blood_throne', name: '혈통의 왕좌', icon: '🩸🏛️', type: 'active', rarity: 'legendary',
        desc: 'MP 50. 공포 기록부의 한 도시를 "혈통 영역"으로 선포. 그 도시에서 모든 판정 +25, 권속 충성도 +20, 도주 NPC 자동 귀환. 3회차까지 지속.',
        mpCost: 50, condition: null, conditionDesc: null,
        statBoost: {},
        effects: { kind:'buff', statMod:{ldr:22,fear:16,cha:14}, duration:5 },
        aiHint: '혈통의 왕좌 선포: 어둠 속에서 뱀파이어가 손을 들어올린다. 그 도시의 모든 공기가 무거워지며, 권속들이 본능적으로 군주의 선언을 느낀다.' }
    ],
    aura: '이 존재가 지나간 자리에 이야기가 남는다. 도시 전체가 이름을 알고, 그 이름으로 아이들을 재운다.',
    aiHint: '4단계: 전설 수준의 뱀파이어. 이름만으로 NPC들의 태도가 결정된다. 적들도 전투 전에 협상을 먼저 시도한다. 역사책에 이름이 올라있다.'
  },
  {
    stage: 5, name: '피의 화신', icon: '☠️🩸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><circle cx="12" cy="21" r="1.6" fill="currentColor" stroke="none"/></svg>`, threshold: 1000,
    color: '#ff4444',
    desc: '역사가 완성됐다. 이 존재의 이름은 세계의 어둠 속에 새겨졌다. 밤이 곧 이 존재의 의지다.',
    statBonus: { str: 55, agi: 55, per: 70, cha: 55, fear: 75, mgc: 50, wil: 40, int: 30, luk: 20 },
    statPenalty: { fath: -60, trst: -45, regen: -20 },
    nightBonus: 60, dayPenalty: 0,
    skills: [
      { id: 'vc_s5_chronicle_incarnate', name: '연대기 화신', icon: '📖☠️', type: 'active', rarity: 'legendary',
        desc: 'MP 80. 지금까지의 모든 역사를 해방. 혈통·공포·시대 기록부의 총합이 전투 배율로 변환. 발동 시 권속 전원 소환, 공포 기록부 도시들에 공포 파동 전파. 적 전투 의지 붕괴 가능.',
        mpCost: 80, condition: null, conditionDesc: null,
        statBoost: {},
        effects: { kind:'summon', baseCount:2, countByLocation:{graveyard:1, battlefield:1, default:0}, maxActive:3, statScaling:{source:'locationTier', mult:1.3}, levelScaling:0.18 },
        aiHint: '연대기 화신: 이 뱀파이어가 눈을 감는다. 수백 년의 역사가 빛처럼 뿜어져 나온다. 마신 피들, 두려워했던 자들, 살아온 밤들이 모두 무기가 된다. 그 압도적인 장면을 묘사하라.' },
      { id: 'vc_s5_eternal_chronicle', name: '영겁의 기록', icon: '♾️🩸', type: 'passive', rarity: 'legendary',
        desc: '사망 시 자동 발동. 연대기가 소멸하지 않고 다음 회차에 일부 계승. 공포 기록부 상위 3개 도시 공포 유지. 혈통 기록부 특화 정보 인계.',
        mpCost: 0, condition: 'death', conditionDesc: '사망 시 자동',
        statBoost: { str: 420, agi: 400, per: 520, fear: 620, cha: 420, mgc: 380, wil: 300 },
        aiHint: '영겁의 기록: 뱀파이어가 쓰러지는 순간 손가락 끝에서 붉은 빛이 세상 어딘가로 흩어진다. 다음에 태어날 때 그 역사가 먼저 깨어날 것이다.' }
    ],
    aura: '이 존재는 세계의 어둠의 일부가 됐다. 해가 지면 어딘가에서 이름이 울린다. 밤의 모든 생물이 군주를 안다.',
    aiHint: '5단계 화신: 이 뱀파이어는 세계 수준의 존재다. 어떤 NPC도 직접 대적하려 하지 않는다. 영웅들조차 이름을 듣는 순간 숨을 고른다. 역사책의 전체 챕터가 이 이름을 다룬다.'
  },
];

export function isVampireRace() {
  const race = (typeof S !== 'undefined' && S.character?.race) || '';
  return race.includes('뱀파이어') || race.includes('혈종') || race.includes('혈군') || race.includes('혈통 왕');
}
window.isVampireRace = isVampireRace;

export function recordBloodEntry(npcName, bloodClass, customPoints) {
  if (!isVampireRace()) return;
  const d = loadVampireChronicle();
  const cls = BLOOD_CLASSES[bloodClass] || BLOOD_CLASSES.common;
  const pts = customPoints || cls.points;

  d.bloodRegister.entries.push({
    name: npcName, type: bloodClass, class: cls.label,
    points: pts, turn: (typeof S !== 'undefined' && S.msgCount) || 0,
    special: cls.special || null,
  });
  d.bloodRegister.total += pts;
  d.bloodRegister.specializations[bloodClass] = (d.bloodRegister.specializations[bloodClass] || 0) + 1;
  if (!d.bloodRegister.rarest || cls.points > (BLOOD_CLASSES[d.bloodRegister.rarest]?.points || 0)) {
    d.bloodRegister.rarest = bloodClass;
  }

  // 연대기 총점 갱신
  gainChroniclePoints(d, pts, `${npcName}(${cls.label}) 흡혈`);

  // 혈통 특화 스탯 보너스 적용
  if (cls.bonus && typeof S !== 'undefined' && S.stats) {
    Object.entries(cls.bonus).forEach(([k, v]) => {
      if (S.stats[k] !== undefined) S.stats[k] = Math.min(999, (S.stats[k] || 0) + v);
    });
    if (typeof saveStats === 'function') saveStats(S.stats);
  }

  // 특수 효과 알림
  if (cls.special) {
    S._nextInjectedContext = (S._nextInjectedContext || '')
      + `\n[🩸 혈통 기록] ${npcName}의 피가 기억에 새겨졌다. ${cls.special}`;
  }

  saveVampireChronicle(d);
  toast(`📜 혈통 기록: ${npcName}(${cls.label}) +${pts}pts`, 3500);
}
window.recordBloodEntry = recordBloodEntry;

window.recordBloodEntry = recordBloodEntry;

export function recordFearEntry(npcName, rank, locationId) {
  if (!isVampireRace()) return;
  const d = loadVampireChronicle();
  const rankDef = FEAR_RANKS[rank] || FEAR_RANKS.commoner;

  const existing = d.fearRegistry.entries.find(e => e.name === npcName);
  if (existing) {
    existing.fearLevel = Math.min(100, (existing.fearLevel || 0) + 10);
  } else {
    d.fearRegistry.entries.push({
      name: npcName, rank, fearLevel: 30,
      location: locationId || (typeof S !== 'undefined' && S.currentLocation?.name) || '불명',
      turn: (typeof S !== 'undefined' && S.msgCount) || 0,
    });
  }

  d.fearRegistry.total += rankDef.fearPoints;
  d.fearRegistry.byRank[rank] = (d.fearRegistry.byRank[rank] || 0) + 1;

  // 도시 공포도 갱신
  const locKey = locationId || 'unknown';
  d.fearRegistry.cityFear[locKey] = Math.min(100, (d.fearRegistry.cityFear[locKey] || 0) + rankDef.cityBonus);

  // 가장 두려워하는 신분 갱신
  const topRank = Object.entries(d.fearRegistry.byRank)
    .sort((a, b) => (FEAR_RANKS[b[0]]?.fearPoints || 0) - (FEAR_RANKS[a[0]]?.fearPoints || 0))[0];
  d.fearRegistry.dominantFear = topRank ? topRank[0] : null;

  gainChroniclePoints(d, rankDef.fearPoints, `${npcName}(${rankDef.label}) 공포 기록`);
  saveVampireChronicle(d);
  toastHTML(`😱 공포 기록: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(rankDef,{size:14}):(rankDef.icon)}${esc(npcName)} +${esc(rankDef.fearPoints)}pts`, 3000);
}
window.recordFearEntry = recordFearEntry;

window.recordFearEntry = recordFearEntry;

export function unlockVampireRaceSkills() {
  if (!isVampireRace()) return;
  if (!S.unlockedSkills) S.unlockedSkills = {};
  if (typeof RACE_DEFS === 'undefined') return;
  const vampDef = RACE_DEFS.find(r => r.id === 'vampire');
  (vampDef?.skills || []).forEach(sk => {
    if (sk && sk.id && !S.unlockedSkills[sk.id]) {
      S.unlockedSkills[sk.id] = true;
      toastHTML(`🔓 종족 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 2500);
    }
  });
  // 피의 연대기 현재 단계까지 스킬 해금
  if (typeof VAMPIRE_CHRONICLE_STAGES !== 'undefined' && typeof loadVampireChronicle === 'function') {
    const vc = loadVampireChronicle();
    const curStage = vc.stage || 0;
    for (let i = 0; i <= curStage; i++) {
      (VAMPIRE_CHRONICLE_STAGES[i]?.skills || []).forEach(sk => {
        if (sk && sk.id && !S.unlockedSkills[sk.id]) {
          S.unlockedSkills[sk.id] = true;
          toastHTML(`🔓 연대기 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 2500);
        }
      });
    }
  }
  if (typeof saveSession === 'function') saveSession();
}
window.unlockVampireRaceSkills = unlockVampireRaceSkills;

window.unlockVampireRaceSkills = unlockVampireRaceSkills;

export function tickEraRecord() {
  if (!isVampireRace()) return;
  // 스킬 해금 체크 (매 턴)
  unlockVampireRaceSkills();
  const d = loadVampireChronicle();
  d.eraRecord.totalTurns = (d.eraRecord.totalTurns || 0) + 1;

  // 5턴마다 연대기 포인트 +2 (시간의 무게)
  if (d.eraRecord.totalTurns % 5 === 0) {
    gainChroniclePoints(d, 2, '시간의 축적');
  }

  // 100턴마다 고대화 임계값 상승
  if (d.eraRecord.totalTurns % 100 === 0) {
    d.eraRecord.ancientThreshold = (d.eraRecord.ancientThreshold || 0) + 1;
    gainChroniclePoints(d, 15, '고대화 진행');
    toast('🌑 시간의 무게가 쌓인다. 연대기 +15', 3000);
  }

  saveVampireChronicle(d);
}
window.tickEraRecord = tickEraRecord;

window.tickEraRecord = tickEraRecord;

export function gainChroniclePoints(d, amount, reason) {
  d.points = Math.min(1000, (d.points || 0) + amount);
  d.history = d.history || [];
  if (d.history.length < 100) d.history.push({ reason, amount, turn: (typeof S !== 'undefined' && S.msgCount) || 0 });

  // 단계 업데이트
  let newStage = 0;
  for (const s of VAMPIRE_CHRONICLE_STAGES) {
    if (d.points >= s.threshold) newStage = s.stage;
  }
  const prevStage = d.stage || 0;
  d.stage = newStage;

  if (newStage > prevStage) {
    const stageDef = VAMPIRE_CHRONICLE_STAGES[newStage];
    toastHTML(`🩸 연대기 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stageDef,{size:14}):(stageDef.icon)} ${esc(stageDef.name)}`, 5000);
    // 스탯 보너스 적용
    if (stageDef.statBonus && typeof S !== 'undefined' && S.stats) {
      Object.entries(stageDef.statBonus).forEach(([k, v]) => {
        if (S.stats[k] !== undefined) S.stats[k] = Math.min(999, (S.stats[k] || 0) + v);
      });
      if (typeof saveStats === 'function') saveStats(S.stats);
    }
    // AI 서사 주입
    if (typeof S !== 'undefined') {
      S._nextInjectedContext = (S._nextInjectedContext || '')
        + `\n[🩸 연대기 단계 상승 — ${stageDef.name}] ${stageDef.desc} ${stageDef.aiHint}`;
    }
  }
}
window.gainChroniclePoints = gainChroniclePoints;

window.gainChroniclePoints = gainChroniclePoints;

export function processVampireChronicleGS(gs) {
  if (!gs || !isVampireRace()) return;
  if (gs.blood_record) {
    const name = typeof gs.blood_record === 'string' ? gs.blood_record : gs.blood_record.name;
    const cls  = typeof gs.blood_record === 'object' ? (gs.blood_record.class || 'common') : 'common';
    if (name) recordBloodEntry(name, cls);
  }
  if (gs.fear_record) {
    const name = typeof gs.fear_record === 'string' ? gs.fear_record : gs.fear_record.name;
    const rank = typeof gs.fear_record === 'object' ? (gs.fear_record.rank || 'commoner') : 'commoner';
    const loc  = typeof gs.fear_record === 'object' ? gs.fear_record.location : null;
    if (name) recordFearEntry(name, rank, loc);
  }
  if (gs.chronicle_points) gainChroniclePoints(loadVampireChronicle(), Number(gs.chronicle_points) || 0, 'GS 보상');
}
window.processVampireChronicleGS = processVampireChronicleGS;

window.processVampireChronicleGS = processVampireChronicleGS;

export function detectVampireChronicleFromText(aiText, userMsg) {
  if (!isVampireRace() || !aiText) return;
  const t = aiText;

  // 흡혈 감지
  if (/흡혈|피를 마|송곳니|피를 빨|핏줄/.test(t)) {
    // 직업 추론
    let cls = 'common';
    if (/기사|전사|검사|병사/.test(t)) cls = 'warrior';
    else if (/마법사|마법|마도사|술사/.test(t)) cls = 'mage';
    else if (/도적|암살자|첩자/.test(t)) cls = 'rogue';
    else if (/신관|성직자|사제|수도사/.test(t)) cls = 'cleric';
    else if (/귀족|백작|공작|남작|영주|왕/.test(t)) cls = 'noble';
    else if (/영웅|용사|전설/.test(t)) cls = 'hero';
    else if (/괴물|마물|마수|드래곤/.test(t)) cls = 'monster';
    const nameMatch = t.match(/([가-힣]{2,4})(의 피|을 마셨|을 흡혈)/);
    const npcName = nameMatch ? nameMatch[1] : '알 수 없는 자';
    recordBloodEntry(npcName, cls);
  }

  // 공포 감지 — NPC가 뱀파이어를 두려워하는 묘사
  if (/두려움|공포에|떨었|창백해|무릎을 꿇|이름만 들|도망/.test(t)) {
    let rank = 'commoner';
    if (/귀족|백작|공작|남작|영주/.test(t)) rank = 'noble';
    else if (/왕|황제|왕족|왕자|공주/.test(t)) rank = 'king';
    else if (/기사|용사|영웅|장군/.test(t)) rank = 'knight';
    else if (/신관|사제|성직자/.test(t)) rank = 'priest';
    else if (/상인|거상|무역/.test(t)) rank = 'merchant';
    const nameMatch = t.match(/([가-힣]{2,4})(이|가|은|는)\s*(두려움|공포에|창백|무릎)/);
    const npcName = nameMatch ? nameMatch[1] : null;
    if (npcName) recordFearEntry(npcName, rank);
    else gainChroniclePoints(loadVampireChronicle(), FEAR_RANKS[rank].fearPoints, `${rank} 공포 감지`);
  }
}
window.detectVampireChronicleFromText = detectVampireChronicleFromText;

window.detectVampireChronicleFromText = detectVampireChronicleFromText;

export function getVampireChronicleBS() {
  if (!isVampireRace()) return '';
  const d = loadVampireChronicle();
  if (!d.points && !d.bloodRegister.total) return '';
  const stageDef = VAMPIRE_CHRONICLE_STAGES[d.stage || 0];
  const bloodCount = d.bloodRegister.entries.length;
  const fearCount  = d.fearRegistry.entries.length;
  const topSpec = Object.entries(d.bloodRegister.specializations || {})
    .sort((a,b)=>b[1]-a[1])[0];
  const cityFears = Object.entries(d.fearRegistry.cityFear || {})
    .filter(([,v])=>v>=30).map(([k,v])=>`${k}(${v})`).join(', ');

  let bls = `\n[🩸 피의 연대기 — ${stageDef.icon}${stageDef.name}(${d.points}pts)]`;
  if (bloodCount) bls += ` 혈통 기록: ${bloodCount}명 흡혈`;
  if (topSpec) bls += `(${BLOOD_CLASSES[topSpec[0]]?.label||topSpec[0]} 특화 ${topSpec[1]}회)`;
  if (fearCount) bls += ` | 공포 기록: ${fearCount}명`;
  if (cityFears) bls += ` | 공포 도시: ${cityFears}`;
  bls += ` | ${stageDef.aura}`;
  bls += ` — 이 뱀파이어의 역사를 서사에 자연스럽게 반영하라.`;
  return bls;
}
window.getVampireChronicleBS = getVampireChronicleBS;

window.getVampireCharonicleBLS = getVampireChronicleBS;

export function renderVampireChroniclePanel() {
  const body = document.getElementById('pb-vampire-chronicle');
  if (!body) return;
  const d = loadVampireChronicle();
  const stageDef = VAMPIRE_CHRONICLE_STAGES[d.stage || 0];
  const nextStage = VAMPIRE_CHRONICLE_STAGES[(d.stage || 0) + 1];
  const pct = nextStage ? Math.min(100, Math.round(((d.points - stageDef.threshold) / (nextStage.threshold - stageDef.threshold)) * 100)) : 100;

  let h = `
    <div style="padding:12px;background:#0d0003;border:1px solid #8b0000;border-radius:2px;margin-bottom:10px">
      <div style="font-family:'Cinzel',serif;font-size:14px;color:#ff4444;margin-bottom:4px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stageDef,{size:14}):(stageDef.icon)} ${stageDef.name}</div>
      <div style="font-size:9px;color:#c05050;margin-bottom:8px">${stageDef.desc}</div>
      <div style="background:#1a0005;border-radius:2px;height:6px;margin-bottom:4px">
        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#8b0000,#ff4444);border-radius:2px"></div>
      </div>
      <div style="font-size:8px;color:#804040;display:flex;justify-content:space-between">
        <span>📜 ${d.points} pts</span>
        <span>${nextStage ? nextStage.threshold+'pts까지 '+(nextStage.threshold-d.points)+'pts' : '최고 단계'}</span>
      </div>
    </div>`;

  // 혈통 기록부
  h += `<div style="font-family:'Cinzel',serif;font-size:10px;color:#ff4444;margin:10px 0 6px">🩸 혈통 기록부 (${d.bloodRegister.entries.length}명)</div>`;
  if (d.bloodRegister.entries.length) {
    h += `<div style="background:#0d0003;padding:8px;border:1px solid #3a0010;border-radius:2px;margin-bottom:8px;font-size:9px">`;
    const specs = Object.entries(d.bloodRegister.specializations || {});
    if (specs.length) {
      h += `<div style="color:#c05050;margin-bottom:4px">특화: ${specs.map(([k,v])=>`${typeof getEntityIconHTML==='function'?getEntityIconHTML(BLOOD_CLASSES[k],{size:14}):(BLOOD_CLASSES[k]?.icon||'')}${BLOOD_CLASSES[k]?.label||k} ×${v}`).join(' · ')}</div>`;
    }
    d.bloodRegister.entries.slice(-5).reverse().forEach(e => {
      const cls = BLOOD_CLASSES[e.type] || BLOOD_CLASSES.common;
      h += `<div style="padding:2px 0;border-bottom:1px solid #1a0005;color:${cls.rarity==='legendary'?'#ff8888':cls.rarity==='rare'?'#ff6060':cls.rarity==='uncommon'?'#c05050':'#804040'}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(cls,{size:16}):(cls.icon)} ${e.name} (${cls.label}) +${e.points}pts</div>`;
    });
    h += `</div>`;
  } else {
    h += `<div style="font-size:9px;color:#3a2020;padding:8px;text-align:center">아직 흡혈 기록이 없다.</div>`;
  }

  // 공포 기록부
  h += `<div style="font-family:'Cinzel',serif;font-size:10px;color:#ff4444;margin:10px 0 6px">😱 공포 기록부 (${d.fearRegistry.entries.length}명)</div>`;
  if (d.fearRegistry.entries.length) {
    h += `<div style="background:#0d0003;padding:8px;border:1px solid #3a0010;border-radius:2px;margin-bottom:8px;font-size:9px">`;
    const cityFears = Object.entries(d.fearRegistry.cityFear||{}).filter(([,v])=>v>=20).sort((a,b)=>b[1]-a[1]);
    if (cityFears.length) {
      h += `<div style="color:#c05050;margin-bottom:4px">공포 도시: ${cityFears.slice(0,3).map(([k,v])=>`${k}(${v})`).join(', ')}</div>`;
    }
    d.fearRegistry.entries.slice(-5).reverse().forEach(e => {
      const rd = FEAR_RANKS[e.rank] || FEAR_RANKS.commoner;
      h += `<div style="padding:2px 0;border-bottom:1px solid #1a0005;color:#c05050">${typeof getEntityIconHTML==='function'?getEntityIconHTML(rd,{size:16}):(rd.icon)} ${e.name} (${rd.label}) — 공포도 ${e.fearLevel}</div>`;
    });
    h += `</div>`;
  } else {
    h += `<div style="font-size:9px;color:#3a2020;padding:8px;text-align:center">아직 공포를 심지 못했다.</div>`;
  }

  // 시대 기록부
  h += `<div style="font-family:'Cinzel',serif;font-size:10px;color:#ff4444;margin:10px 0 6px">⏳ 시대 기록부</div>`;
  h += `<div style="background:#0d0003;padding:8px;border:1px solid #3a0010;border-radius:2px;font-size:9px;color:#804040">
    살아온 시간: ${d.eraRecord.totalTurns}턴 · 고대화 단계: ${d.eraRecord.ancientThreshold}
  </div>`;

  body.innerHTML = h;
}
window.renderVampireChroniclePanel = renderVampireChroniclePanel;

window.renderVampireChroniclePanel = renderVampireChroniclePanel;

export const CELESTIAL_SCALE_KEY   = 'tf-celestial-scale';

export const CS_PROGRESS_KEY       = 'tf-cs-progress';

export const CS_LIGHT_KEY          = 'tf-cs-light-acts';

export const CS_DARK_KEY           = 'tf-cs-dark-acts';

export function loadCelestialScale() {
  try {
    const prog = lsGet(CS_PROGRESS_KEY); const light = lsGet(CS_LIGHT_KEY); const dark = lsGet(CS_DARK_KEY);
    if (prog) {
      return { ...JSON.parse(prog),
        lightActs: light ? JSON.parse(light) : {heal:0,protect:0,honest:0,sacrifice:0,miracle:0},
        darkActs:  dark  ? JSON.parse(dark)  : {deceive:0,violence:0,betray:0,shadow:0,selfish:0} };
    }
    const r = lsGet(CELESTIAL_SCALE_KEY);
    return r ? JSON.parse(r) : {points:500,history:[],lightActs:{heal:0,protect:0,honest:0,sacrifice:0,miracle:0},darkActs:{deceive:0,violence:0,betray:0,shadow:0,selfish:0},judgeCount:0,fallenAwakened:false,angelAwakened:false};
  } catch(e) { return {points:500,history:[],lightActs:{heal:0,protect:0,honest:0,sacrifice:0,miracle:0},darkActs:{deceive:0,violence:0,betray:0,shadow:0,selfish:0},judgeCount:0,fallenAwakened:false,angelAwakened:false}; }
}
window.loadCelestialScale = loadCelestialScale;

export function saveCelestialScale(d) {
  try {
    lsSet(CS_PROGRESS_KEY, JSON.stringify({points:d.points||500,history:d.history||[],judgeCount:d.judgeCount||0,fallenAwakened:d.fallenAwakened||false,angelAwakened:d.angelAwakened||false}));
    lsSet(CS_LIGHT_KEY,    JSON.stringify(d.lightActs||{heal:0,protect:0,honest:0,sacrifice:0,miracle:0}));
    lsSet(CS_DARK_KEY,     JSON.stringify(d.darkActs ||{deceive:0,violence:0,betray:0,shadow:0,selfish:0}));
    lsSet(CELESTIAL_SCALE_KEY, JSON.stringify(d));
  } catch(e) {}
}
window.saveCelestialScale = saveCelestialScale;

export const clearCelestialScale   = () => { lsDel(CELESTIAL_SCALE_KEY); lsDel(CS_PROGRESS_KEY); lsDel(CS_LIGHT_KEY); lsDel(CS_DARK_KEY); };

export function getCelestialPhase(points) {
  if (points >= 900) return { phase: 'angel',    icon: '😇', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="4" stroke-width="1.3"/><path d="M6 21 C6 16.5 8.5 14 12 14 C15.5 14 18 16.5 18 21" stroke-width="1.3"/><path d="M4 9 L2 9 M22 9 L20 9 M12 2 L12 4" stroke-width="1"/></svg>', label: '천사 각성',    color: '#fff5a0', side: 'light' };
  if (points >= 750) return { phase: 'radiant',  icon: '✨', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L13.5 8.5 L20 7 L15 12 L18 18.5 L12 15 L6 18.5 L9 12 L4 7 L10.5 8.5 Z" stroke-linejoin="round"/></svg>', label: '빛의 현현',    color: '#e8d860', side: 'light' };
  if (points >= 600) return { phase: 'blessed',  icon: '💛', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20 C12 20 3 14 3 8.2 C3 5.3 5.3 3 8.2 3 C10 3 11.3 3.9 12 5.2 C12.7 3.9 14 3 15.8 3 C18.7 3 21 5.3 21 8.2 C21 14 12 20 12 20 Z" stroke-linejoin="round"/></svg>', label: '축복받은 자',  color: '#d4c040', side: 'light' };
  if (points >= 400) return { phase: 'balanced', icon: '⚖️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12 L21 12" stroke-width="1.4"/><path d="M12 4 L12 20" stroke-width="1.2"/><path d="M6 12 L4 16 L8 16 Z M18 12 L16 16 L20 16 Z" stroke-width="1.1"/></svg>', label: '균형의 경계',  color: '#c8c0ff', side: 'neutral' };
  if (points >= 250) return { phase: 'shadowed', icon: '🌑', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.4" stroke="none"/></svg>', label: '그늘진 신성',  color: '#8888cc', side: 'dark' };
  if (points >= 100) return { phase: 'tainted',  icon: '💜', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.6" stroke="none"/></svg>', label: '오염된 빛',    color: '#a060d0', side: 'dark' };
  return                     { phase: 'fallen',  icon: '🖤', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.85" stroke="none"/></svg>', label: '타락한 천사',  color: '#6030a0', side: 'dark' };
}
window.getCelestialPhase = getCelestialPhase;

export function gainCelestialLight(actType, customGain) {
  const race = S.character?.race || '';
  const isCel = race.includes('세레스티얼') || race.includes('celestial');
  if (!isCel) return;
  const cs = loadCelestialScale();
  const def = CELESTIAL_LIGHT_GAIN[actType];
  const gain = customGain !== undefined ? customGain : (def?.gain || 6);
  const prevPoints = cs.points;
  cs.points = Math.min(1000, (cs.points || 500) + gain);
  cs.lightActs = cs.lightActs || {};
  if (actType) cs.lightActs[actType] = (cs.lightActs[actType] || 0) + 1;
  cs.history = cs.history || [];
  cs.history.push({
    side:'light', type:actType, gain, label:def?.label||actType,
    icon:def?.icon||'💛', total:cs.points,
    at:new Date().toISOString().slice(0,16)
  });
  
  _checkCelestialPhaseChange(cs, prevPoints);
  saveCelestialScale(cs);
  applyCelestialScaleStats();
  return cs;
}
window.gainCelestialLight = gainCelestialLight;

export function gainCelestialDark(actType, customGain) {
  const race = S.character?.race || '';
  const isCel = race.includes('세레스티얼') || race.includes('celestial');
  if (!isCel) return;
  const cs = loadCelestialScale();
  const def = CELESTIAL_DARK_GAIN[actType];
  const gain = customGain !== undefined ? customGain : (def?.gain || -6);
  const prevPoints = cs.points;
  cs.points = Math.max(0, (cs.points || 500) + gain);
  cs.darkActs = cs.darkActs || {};
  if (actType) cs.darkActs[actType] = (cs.darkActs[actType] || 0) + 1;
  cs.history = cs.history || [];
  cs.history.push({
    side:'dark', type:actType, gain, label:def?.label||actType,
    icon:def?.icon||'🌑', total:cs.points,
    at:new Date().toISOString().slice(0,16)
  });
  
  _checkCelestialPhaseChange(cs, prevPoints);
  saveCelestialScale(cs);
  applyCelestialScaleStats();
  return cs;
}
window.gainCelestialDark = gainCelestialDark;

export function _checkCelestialPhaseChange(cs, prevPoints) {
  const prevPhase = getCelestialPhase(prevPoints).phase;
  const newPhase  = getCelestialPhase(cs.points).phase;
  if (newPhase === prevPhase) return;
  const np = getCelestialPhase(cs.points);
  setTimeout(() => {
    if (np.side === 'light') toastHTML(`💛 신성 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(np,{size:14}):(np.icon)} ${esc(np.label)}`, 4000);
    else if (np.side === 'dark') toastHTML(`🌑 신성 타락! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(np,{size:14}):(np.icon)} ${esc(np.label)}`, 4000);
    else toast(`⚖️ 균형 구간 진입: ${np.label}`, 3000);
    // 해당 페이즈 스킬 해금
    const skills = CELESTIAL_PHASE_SKILLS[newPhase] || [];
    skills.forEach(sk => {
      if (!S.unlockedSkills[sk.id]) {
        S.unlockedSkills[sk.id] = true;
        saveSkills(S.unlockedSkills);
        setTimeout(() => toastHTML(`🔓 천평 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 3000), 1500);
      }
    });
    // 천사 각성 플래그
    if (newPhase === 'angel') cs.angelAwakened = true;
    if (newPhase === 'fallen') cs.fallenAwakened = true;
  }, 500);
}
window._checkCelestialPhaseChange = _checkCelestialPhaseChange;

export function applyCelestialScaleStats() {
  const cs = loadCelestialScale();
  const phase = getCelestialPhase(cs.points).phase;
  const stats = CELESTIAL_PHASE_STATS[phase] || { bonus:{}, penalty:{} };
  const prev = S._celestialScaleBonus || {};
  Object.entries(prev).forEach(([k,v]) => { if(S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v); });
  const newBonus = {};
  Object.entries(stats.bonus||{}).forEach(([k,v]) => { S.stats[k]=Math.min(999,(S.stats[k]||50)+v); newBonus[k]=v; });
  Object.entries(stats.penalty||{}).forEach(([k,v]) => { S.stats[k]=Math.max(0,(S.stats[k]||50)+v); });
  S._celestialScaleBonus = newBonus;
  if(typeof saveStats==='function') saveStats(S.stats);
  _markDirty('stats'); if(typeof saveStatsSplit==='function') saveStatsSplit();
}
window.applyCelestialScaleStats = applyCelestialScaleStats;

export function getCelestialScaleStatus() {
  const race = S.character?.race || '';
  const isCel = race.includes('세레스티얼') || race.includes('celestial');
  if (!isCel) return null;
  const cs = loadCelestialScale();
  const phase = getCelestialPhase(cs.points);
  return { ...cs, phaseDef: phase };
}
window.getCelestialScaleStatus = getCelestialScaleStatus;

export function detectCelestialScaleFromText(text) {
  if (!text) return;
  const race = S.character?.race || '';
  const isCel = race.includes('세레스티얼') || race.includes('celestial');
  if (!isCel) return;
  // 빛의 행동 감지
  if (/치유|회복|상처를|상처가|정화|저주를 풀|독을 풀/.test(text) && Math.random()<0.55) gainCelestialLight('heal',5);
  if (/보호|막았|지켰|구했|희생|방패가 되/.test(text) && Math.random()<0.5) gainCelestialLight('protect',6);
  if (/진실|솔직|정직|약속을 지|맹세를 이행/.test(text) && Math.random()<0.4) gainCelestialLight('honest',4);
  if (/자신을 희생|몸을 던|대신 맞|목숨을 걸/.test(text) && Math.random()<0.5) gainCelestialLight('sacrifice',9);
  if (/기적|신의 빛|신성한 힘|성광/.test(text) && Math.random()<0.4) gainCelestialLight('miracle',10);
  // 어둠의 행동 감지
  if (/거짓말|속였|위장|거짓 기적|위선/.test(text) && Math.random()<0.5) gainCelestialDark('deceive',-6);
  if (/학살|무고한|민간인을|불필요한 살/.test(text) && Math.random()<0.4) gainCelestialDark('violence',-9);
  if (/배신|배반|맹세를 어/.test(text) && Math.random()<0.5) gainCelestialDark('betray',-10);
  if (/어둠의 힘|금기 마법|악마와|마계/.test(text) && Math.random()<0.45) gainCelestialDark('shadow',-7);
  if (/이기심|자신만을|버리고 도망|탐욕/.test(text) && Math.random()<0.4) gainCelestialDark('selfish',-5);

  // [신규] CELESTIAL_RESTORE_METHODS/CELESTIAL_DARKEN_METHODS — 완성되어
  // 있었지만 이 함수(빛/어둠 자동 감지)와 전혀 연결되지 않아 죽어있던
  // 데이터였다. 더 극적인 사건(성전 기도, 신성 맹세, 금기 의식, 악마
  // 계약)에는 일반 빛/어둠 행동보다 훨씬 큰 폭의 게이지 변화를 준다.
  // [버그 수정] 필드명은 score(0~100)가 아니라 실제로는 points(0~1000)다.
  function _applyCelestialSwing(methodId, def){
    const cs2 = loadCelestialScale();
    cs2.points = Math.max(0, Math.min(1000, (cs2.points||500) + def.gain));
    cs2.history = cs2.history || [];
    cs2.history.push({ side: def.gain>0?'light':'dark', type:methodId, gain:def.gain, label:def.name, icon:def.icon, total:cs2.points, at:new Date().toISOString().slice(0,16) });
    saveCelestialScale(cs2);
    toast(`${def.name} — 신성도 ${def.gain>0?'+':''}${def.gain}`, 3000, def);
  }
  if (/성전|신전에서.*기도|진심으로 기도/.test(text) && Math.random()<0.35)
    _applyCelestialSwing('restore_prayer', CELESTIAL_RESTORE_METHODS.find(m=>m.id==='restore_prayer'));
  if (/신성.*맹세|천상.*맹세|맹세를 갱신/.test(text) && Math.random()<0.3)
    _applyCelestialSwing('restore_vow', CELESTIAL_RESTORE_METHODS.find(m=>m.id==='restore_vow'));
  if (/금기.*의식|어둠의 의식/.test(text) && Math.random()<0.35)
    _applyCelestialSwing('darken_ritual', CELESTIAL_DARKEN_METHODS.find(m=>m.id==='darken_ritual'));
  if (/악마와.*계약|악마.*직접 계약/.test(text) && Math.random()<0.3)
    _applyCelestialSwing('darken_pact', CELESTIAL_DARKEN_METHODS.find(m=>m.id==='darken_pact'));
}
window.detectCelestialScaleFromText = detectCelestialScaleFromText;

export function renderCelestialScalePanel() {
  const body = document.getElementById('pb-celestial-scale');
  if (!body) return;
  const status = getCelestialScaleStatus();
  if (!status) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">⚖️</div>
      <div>세레스티얼 캐릭터에게만 활성화됩니다.</div>
      <div style="margin-top:6px;font-size:10px">종족을 세레스티얼로 선택하세요.</div>
    </div>`;
    return;
  }
  const cs = status;
  const ph = cs.phaseDef;
  const color = ph.color;
  // 천평 바 계산: 0=완전 어둠, 500=중앙, 1000=완전 빛
  const barPct = cs.points / 10; // 0~100%
  // 섹션별 경계 표시
  const phases = [
    {pts:0,   label:'타락한 천사', icon:'🖤', c:'#6030a0'},
    {pts:100, label:'오염된 빛',   icon:'💜', c:'#a060d0'},
    {pts:250, label:'그늘진 신성', icon:'🌑', c:'#8888cc'},
    {pts:400, label:'균형',        icon:'⚖️', c:'#c8c0ff'},
    {pts:600, label:'축복받은 자', icon:'💛', c:'#d4c040'},
    {pts:750, label:'빛의 현현',   icon:'✨', c:'#e8d860'},
    {pts:900, label:'천사 각성',   icon:'😇', c:'#fff5a0'},
  ];

  // 빛/어둠 행동 집계
  const totalLight = Object.values(cs.lightActs||{}).reduce((a,b)=>a+b,0);
  const totalDark  = Object.values(cs.darkActs||{}).reduce((a,b)=>a+b,0);

  // 현재 페이즈에서 사용 가능한 스킬
  const availSkills = [];
  const phaseOrder = ['blessed','radiant','angel','shadowed','tainted','fallen'];
  const phaseIdx = {blessed:0,radiant:1,angel:2,shadowed:3,tainted:4,fallen:5};
  phaseOrder.forEach(p => {
    const skills = CELESTIAL_PHASE_SKILLS[p] || [];
    const pDef = {blessed:{pts:600},radiant:{pts:750},angel:{pts:900},shadowed:{pts:250},tainted:{pts:100},fallen:{pts:0}};
    const unlocked = (p==='shadowed'&&cs.points<=400) || (p==='tainted'&&cs.points<=250) || (p==='fallen'&&cs.points<=100)
      || (p==='blessed'&&cs.points>=600) || (p==='radiant'&&cs.points>=750) || (p==='angel'&&cs.points>=900);
    skills.forEach(sk => availSkills.push({...sk, unlocked}));
  });

  // 최근 기록 10개
  const recent = (cs.history||[]).slice(-10).reverse();

  body.innerHTML = `
    <!-- 헤더: 현재 페이즈 -->
    <div style="padding:14px;background:linear-gradient(135deg,#0a0a25,#101035);border-bottom:2px solid ${color};margin-bottom:0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <span style="color:${ph.color};display:inline-flex;flex-shrink:0;transform:scale(1.36);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(ph,{size:16}):(ph.svgIcon||ph.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${ph.label}</div>
          <div style="font-size:9px;color:#7070c0;margin-top:2px">${ph.side==='light'?'💛 빛의 길':ph.side==='dark'?'🌑 어둠의 길':'⚖️ 균형의 경계'}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:${color}">${cs.points}<span style="font-size:9px;color:#5050a0"> / 1000</span></div>
          <div style="font-size:8px;color:#5050a0">신성도</div>
        </div>
      </div>

      <!-- 천평 게이지 (양방향) -->
      <div style="position:relative;margin-bottom:6px">
        <div style="height:10px;background:linear-gradient(90deg,#2a0040,#1a1a4a,#1a4a10);border-radius:5px;overflow:hidden;border:1px solid #303060">
          <!-- 중앙 표시선 -->
          <div style="position:absolute;left:50%;top:0;width:2px;height:100%;background:#ffffff30;z-index:2"></div>
          <!-- 현재 위치 표시 -->
          <div style="position:absolute;left:0;top:0;width:${barPct}%;height:100%;background:linear-gradient(90deg,#6030a0,#8888cc,${color});border-radius:5px;transition:width .4s"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:8px;color:#5050a0;margin-top:3px">
          <span>🖤 타락 (0)</span>
          <span>⚖️ 중앙 (500)</span>
          <span>😇 천사 (1000)</span>
        </div>
      </div>

      <!-- 페이즈 마커 바 -->
      <div style="display:flex;gap:1px;margin-top:6px">
        ${phases.map(p => {
          const active = cs.points >= p.pts && (phases[phases.indexOf(p)+1] ? cs.points < phases[phases.indexOf(p)+1].pts : true);
          return `<div title="${p.label}" style="flex:1;height:4px;background:${active?p.c:p.c+'44'};border-radius:2px;transition:background .3s"></div>`;
        }).join('')}
      </div>
    </div>

    <!-- 설명 섹션 -->
    <div style="padding:8px 12px;background:#080820;border-bottom:1px solid #181840;font-size:10px;color:#8888cc;line-height:1.6">
      ${ph.phase==='angel'   ? '😇 천사 각성 상태. 치유와 정화의 힘이 극대화되었다. 전투력은 약해졌지만 신성의 기적이 가능하다.'
      : ph.phase==='radiant' ? '✨ 빛이 넘쳐흐른다. 신성한 오라가 아군을 보호하고 어둠 속 적을 약화시킨다.'
      : ph.phase==='blessed' ? '💛 천상의 은총을 받은 상태. 치유와 보호에 뛰어나며 신성 판정에 강점이 있다.'
      : ph.phase==='balanced'? '⚖️ 빛과 어둠의 경계. 두 힘을 동시에 사용할 수 있지만 어느 쪽 극단도 발휘하지 못한다.'
      : ph.phase==='shadowed'? '🌑 그림자가 신성을 잠식하기 시작했다. 빛의 능력이 약해지고 어둠의 힘이 깨어난다.'
      : ph.phase==='tainted' ? '💜 빛이 오염되었다. 어둠의 힘을 사용하지만 아군에게 신성 효과를 줄 수 없다.'
      :                        '🖤 타락한 천사. 신성이 역전되었다. 강력한 어둠의 힘을 보유하나 신성 존재들이 적대한다.'}
    </div>

    <!-- 현재 페이즈 스탯 효과 -->
    <div style="padding:10px 12px;border-bottom:1px solid #181840">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 스탯 효과 ──</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${Object.entries(CELESTIAL_PHASE_STATS[ph.phase]?.bonus||{}).map(([k,v]) =>
          `<span style="background:#0a1a0a;border:1px solid #204020;padding:2px 7px;font-size:9px;color:#60c060;border-radius:2px">${k.toUpperCase()} +${v}</span>`
        ).join('')}
        ${Object.entries(CELESTIAL_PHASE_STATS[ph.phase]?.penalty||{}).map(([k,v]) =>
          `<span style="background:#1a0a0a;border:1px solid #402020;padding:2px 7px;font-size:9px;color:#c06060;border-radius:2px">${k.toUpperCase()} ${v}</span>`
        ).join('')}
        ${Object.keys(CELESTIAL_PHASE_STATS[ph.phase]?.bonus||{}).length===0 && Object.keys(CELESTIAL_PHASE_STATS[ph.phase]?.penalty||{}).length===0
          ? '<span style="font-size:9px;color:#5050a0">균형 상태 — 스탯 변화 없음</span>' : ''}
      </div>
    </div>

    <!-- 천평 단계 진행 표시 -->
    <div style="padding:10px 12px;border-bottom:1px solid #181840">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 천평 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${phases.slice().reverse().map(p => {
          const isActive = cs.points >= p.pts && (phases[phases.indexOf(p)+1] ? cs.points < phases[phases.indexOf(p)+1].pts : true);
          const reached  = cs.points >= p.pts;
          return `<div style="display:flex;align-items:center;gap:7px;padding:4px 8px;background:${isActive?'#14143a':reached?'#0c0c25':'#080818'};border:1px solid ${isActive?p.c:reached?p.c+'44':'#181840'};border-radius:2px;opacity:${isActive?1:reached?0.7:0.3}">
            <span style="font-size:12px;width:18px;text-align:center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(p,{size:12}):(p.icon)}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:9px;color:${p.c}">${p.label}</div>
              <div style="font-size:8px;color:#5050a0">신성도 ${p.pts}${isActive?' ← 현재':''}</div>
            </div>
            ${isActive?`<div style="width:6px;height:6px;border-radius:50%;background:${p.c};box-shadow:0 0 6px ${p.c}"></div>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- 천평 스킬 -->
    <div style="padding:10px 12px;border-bottom:1px solid #181840">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 천평 스킬 ──</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${availSkills.length===0?'<div style="font-size:10px;color:#5050a0">균형 구간에서는 천평 전용 스킬이 없습니다.<br>빛 또는 어둠 쪽으로 기울면 스킬이 해금됩니다.</div>':''}
        ${availSkills.map(sk => `
          <div style="padding:8px;background:${sk.unlocked?'#0e0e2a':'#080818'};border:1px solid ${sk.unlocked?color+'66':'#181840'};border-radius:3px;opacity:${sk.unlocked?1:0.4}">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
              <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)}</span>
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${sk.unlocked?color:'#5050a0'}">${sk.name}</div>
              <span style="font-size:8px;padding:1px 5px;border:1px solid #303060;color:#7070c0;margin-left:auto">${sk.type==='active'?'발동':'항시'}</span>
            </div>
            <div style="font-size:9px;color:#8888aa;line-height:1.5">${sk.desc}</div>
            ${!sk.unlocked?'<div style="font-size:8px;color:#5050a0;margin-top:3px">🔒 해당 페이즈에 도달하면 해금</div>':''}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 빛/어둠 행동 통계 -->
    <div style="padding:10px 12px;border-bottom:1px solid #181840">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 행동 기록 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="padding:8px;background:#0a1015;border:1px solid #1a3020;border-radius:3px">
          <div style="font-size:9px;color:#d4c040;font-family:'Cinzel',serif;margin-bottom:5px">💛 빛의 행동 (${totalLight}회)</div>
          ${Object.entries(cs.lightActs||{}).filter(([,v])=>v>0).map(([k,v]) => {
            const def=CELESTIAL_LIGHT_GAIN[k]; return def?`<div style="display:flex;justify-content:space-between;font-size:9px;color:#a0a060;padding:2px 0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:9}):(def.icon)} ${def.label}<span style="color:#d4c040">${v}회</span></div>`:'';
          }).join('') || '<div style="font-size:9px;color:#5050a0">기록 없음</div>'}
        </div>
        <div style="padding:8px;background:#100a15;border:1px solid #300a30;border-radius:3px">
          <div style="font-size:9px;color:#a060d0;font-family:'Cinzel',serif;margin-bottom:5px">🌑 어둠의 행동 (${totalDark}회)</div>
          ${Object.entries(cs.darkActs||{}).filter(([,v])=>v>0).map(([k,v]) => {
            const def=CELESTIAL_DARK_GAIN[k]; return def?`<div style="display:flex;justify-content:space-between;font-size:9px;color:#907090;padding:2px 0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:9}):(def.icon)} ${def.label}<span style="color:#a060d0">${v}회</span></div>`:'';
          }).join('') || '<div style="font-size:9px;color:#5050a0">기록 없음</div>'}
        </div>
      </div>
    </div>

    <!-- 신성/어둠 행동 버튼 (AI 없이도 진행되도록 하는 수동 트리거 — 기존엔
         detectCelestialScaleFromText의 AI 서사 감지에만 의존해 no-API 모드에서
         천평이 영구 정지했음) -->
    <div style="padding:10px 12px;border-bottom:1px solid #181840">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 행동 선택 (수동) ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div>
          <div style="font-size:9px;color:#d4c040;font-family:'Cinzel',serif;margin-bottom:5px">💛 빛의 행동</div>
          ${Object.entries(CELESTIAL_LIGHT_GAIN).map(([id,def]) => `
            <button onclick="gainCelestialLight('${id}');renderCelestialScalePanel()"
              style="width:100%;padding:5px 6px;margin-bottom:4px;background:#0a1015;border:1px solid #d4c04044;color:#d4c040;font-size:8px;cursor:pointer;font-family:'Crimson Text',serif;text-align:left;border-radius:2px;line-height:1.3">
              ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:7}):(def.icon)} ${def.label}
              <span style="float:right;font-family:'Cinzel',serif;color:#d4c040">+${def.gain}</span>
            </button>`).join('')}
        </div>
        <div>
          <div style="font-size:9px;color:#a060d0;font-family:'Cinzel',serif;margin-bottom:5px">🌑 어둠의 행동</div>
          ${Object.entries(CELESTIAL_DARK_GAIN).map(([id,def]) => `
            <button onclick="gainCelestialDark('${id}');renderCelestialScalePanel()"
              style="width:100%;padding:5px 6px;margin-bottom:4px;background:#100a15;border:1px solid #a060d044;color:#a060d0;font-size:8px;cursor:pointer;font-family:'Crimson Text',serif;text-align:left;border-radius:2px;line-height:1.3">
              ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:7}):(def.icon)} ${def.label}
              <span style="float:right;font-family:'Cinzel',serif;color:#a060d0">${def.gain}</span>
            </button>`).join('')}
        </div>
      </div>
    </div>

    <!-- 최근 기록 -->
    <div style="padding:10px 12px;padding-bottom:18px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 최근 기록 ──</div>
      ${recent.length===0?'<div style="font-size:9px;color:#5050a0">아직 기록이 없습니다.</div>':''}
      <div style="display:flex;flex-direction:column;gap:3px">
        ${recent.map(r => `
          <div style="display:flex;align-items:center;gap:7px;padding:4px 8px;background:${r.side==='light'?'#0a1015':'#100a15'};border-left:2px solid ${r.side==='light'?'#d4c040':'#a060d0'};border-radius:2px">
            <span style="font-size:11px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:11}):(r.icon)}</span>
            <div style="flex:1">
              <div style="font-size:9px;color:${r.side==='light'?'#d4c040':'#a060d0'}">${r.label}</div>
              <div style="font-size:8px;color:#5050a0">${r.at}</div>
            </div>
            <div style="font-family:'Cinzel',serif;font-size:10px;color:${r.gain>0?'#60c060':'#c06060'}">${r.gain>0?'+':''}${r.gain} → ${r.total}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
window.renderCelestialScalePanel = renderCelestialScalePanel;

window.gainCelestialLight         = gainCelestialLight;

window.gainCelestialDark          = gainCelestialDark;

window.applyCelestialScaleStats   = applyCelestialScaleStats;

window.getCelestialScaleStatus    = getCelestialScaleStatus;

window.getCelestialPhase          = getCelestialPhase;

window.loadCelestialScale         = loadCelestialScale;

window.renderCelestialScalePanel  = renderCelestialScalePanel;

window.detectCelestialScaleFromText = detectCelestialScaleFromText;

window.clearCelestialScale        = clearCelestialScale;

export const CELESTIAL_COVENANT_KEY  = 'tf-celestial-covenant';

export const loadCelestialCovenant   = () => {
  try {
    const raw = lsGet(CELESTIAL_COVENANT_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return {
    points: 0, stage: 4, history: [],
    deed: { heal:0, protect:0, judge:0, sacrifice:0, miracle:0 },
    sin:  { deceive:0, violence:0, betray:0, shadow:0, abandon:0 },
    atonementCount: 0,
    judgedNPCs: [],   // 심판 낙인 받은 NPC 목록
    awakenedAngel: false,
    fallen: false
  };
};

export const saveCelestialCovenant   = (d) => { try { lsSet(CELESTIAL_COVENANT_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearCelestialCovenant  = () => lsDel(CELESTIAL_COVENANT_KEY);

export const CELESTIAL_COVENANT_STAGES = [
  // ── 마이너스 단계 (타락한 세레스티얼) ──────────────────────
  {
    stage: -4, name: '심연의 화신', icon: '🖤👑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M4 3 L20 21 M20 3 L4 21" stroke-width="0.9" opacity="0.6"/></svg>`, color: '#ff2020', threshold: -400, side: 'fallen',
    desc: '신성이 완전히 역전되어 어둠의 화신이 되었다. 천상이 이 존재를 처단 대상으로 지정했다.',
    statBonus: { str: 55, agi: 35, mgc: 40, fear: 30 },
    statPenalty: { fath: -80, wil: -40, spk: -30 },
    skills: [
      { id: 'cc_sm4_abyss_incarnate', name: '심연 강림', icon: '🖤', type: 'active',
        desc: 'MP 70. 자신을 중심으로 심연의 파동 방출. 반경 내 모든 존재 HP -60, 신성 속성 존재는 즉사 판정.',
        rarity: 'legendary', mpCost: 70, condition: null, conditionDesc: null, statBoost: {} },
      { id: 'cc_sm4_void_wings', name: '허공의 날개', icon: '🦇', type: 'passive',
        desc: '항시. 어둠 속 이동·회피 판정 +30. 신성 피해 완전 면역. 천사 계열 존재에게 공포 부여.',
        rarity: 'legendary', mpCost: 0, condition: 'always', conditionDesc: '항시 발동',
        statBoost: { str: 200, agi: 160, mgc: 140 } }
    ],
    aura: '주변 빛이 흡수되어 사라진다. 성전의 촛불이 꺼지고 신성 문양이 금이 간다. 천상의 존재들이 이 이름을 처단 목표로 기록한다.',
    npcReact: '선한 NPC들이 본능적 공포로 도망친다. 악마·언데드 NPC들이 경의를 표하며 충성을 맹세한다. 신관들이 이 이름만 들어도 떤다.',
    aiHint: '[-4단계 심연의 화신]: 이 세레스티얼은 빛을 집어삼키는 어둠 그 자체다. 발을 디딜 때마다 땅이 검게 물들고 신성한 문양에 균열이 생긴다. 성직자들이 이 이름을 저주처럼 내뱉으며, 천사들이 처단 명령을 받고 내려온다. 악마들조차 이 존재에게 머리를 숙이는 장면을 묘사하라.'
  },
  {
    stage: -3, name: '타락한 수호자', icon: '🌑🛡️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L19 6 L19 12 C19 17 15.5 20 12 21.5 C8.5 20 5 17 5 12 L5 6 Z" stroke-linejoin="round" opacity="0.7"/><path d="M8 8 L16 16 M16 8 L8 16" stroke-width="1.1"/></svg>`, color: '#cc3040', threshold: -250, side: 'fallen',
    desc: '한때 보호하던 자들을 이제 두려움으로 지배한다. 신성의 힘이 어둠으로 왜곡되었다.',
    statBonus: { str: 35, agi: 20, mgc: 25, fear: 18 },
    statPenalty: { fath: -50, wil: -25, spk: -15 },
    skills: [
      { id: 'cc_sm3_dark_dominion', name: '어둠의 지배', icon: '⛓️', type: 'active',
        desc: 'MP 45. 대상 1명에게 공포 낙인. 3턴간 이동 불가 + 매 턴 신성 피해. 신성 존재에게 2배 효과.',
        rarity: 'epic', mpCost: 45, condition: null, conditionDesc: null, statBoost: {} },
      { id: 'cc_sm3_corrupted_aura', name: '오염된 오라', icon: '🌑', type: 'passive',
        desc: '항시. 반경 내 아군 HP 매 턴 -5(공포로 통제). 적 신성 속성 판정 -20. 자신 어둠 피해 면역.',
        rarity: 'epic', mpCost: 0, condition: 'always', conditionDesc: '항시 발동',
        statBoost: { str: 120, agi: 80, mgc: 100 } }
    ],
    aura: '후광이 검게 물들어 있다. 가까이 있으면 심장이 조여드는 압박감이 느껴진다. 신성 물체에 접촉하면 균열이 생긴다.',
    npcReact: '선한 NPC들이 눈을 마주치기를 두려워한다. 악마·다크링 NPC들이 동류로 인정하며 협력을 제안한다. 신관들이 정화 의식을 거행하려 한다.',
    aiHint: '[-3단계 타락한 수호자]: 이 세레스티얼의 후광이 검고 깨진 형태로 흔들린다. 한때 치유의 손이었던 것이 이제 공포로 상대를 얼어붙게 만든다. 신전에 들어서면 성화가 뒤틀리고 촛불이 꺼진다. NPC들이 이 존재를 보며 "저것은 더 이상 세레스티얼이 아니다"라고 속삭이는 장면을 묘사하라.'
  },
  {
    stage: -2, name: '오염된 빛', icon: '💜🌑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3" stroke-dasharray="1.5 2.5"/></svg>`, color: '#9040c0', threshold: -120, side: 'fallen',
    desc: '신성이 서서히 어둠에 잠식되고 있다. 치유 능력이 오염되어 때로 해를 끼친다.',
    statBonus: { str: 16, agi: 10, mgc: 12, fear: 8 },
    statPenalty: { fath: -25, wil: -12, spk: -6 },
    skills: [
      { id: 'cc_sm2_tainted_heal', name: '오염된 치유', icon: '💜', type: 'active',
        desc: 'MP 10. 대상 HP +15, 그러나 30% 확률로 독 상태이상 부여. 악마·언데드에게는 오히려 강화 효과.',
        rarity: 'rare', mpCost: 10, condition: null, conditionDesc: null, statBoost: {} }
    ],
    aura: '빛이 보랏빛으로 물들어 있다. 가까이 있으면 묘한 불안감이 든다. 신성 물체가 약하게 반응하며 울린다.',
    npcReact: '신관 NPC들이 이 캐릭터를 불안하게 지켜본다. 악마·어둠 계열 NPC들이 흥미를 보이며 접근한다. 일반인들은 이유 모를 불쾌함을 느낀다.',
    aiHint: '[-2단계 오염된 빛]: 이 세레스티얼의 황금빛 후광에 보랏빛 균열이 섞여 있다. 치유를 시도할 때 가끔 손이 검은 기운으로 물드는 것이 보인다. 신관들이 이 존재를 걱정스럽게 지켜보며, 악마들이 "이제 곧 우리 편이 되겠군"이라고 속삭이는 장면을 포함하라.'
  },
  {
    stage: -1, name: '그늘진 신성', icon: '🌑💛', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7" stroke-width="1.3"/><path d="M12 12 L12 5 A7 7 0 0 1 17.5 8.5 Z" fill="currentColor" fill-opacity="0.3" stroke="none"/></svg>`, color: '#7060a0', threshold: -40, side: 'fallen',
    desc: '계율에 처음 금이 가기 시작했다. 신성한 빛이 흔들리며 그림자가 섞이기 시작한다.',
    statBonus: { str: 6, agi: 4, mgc: 4 },
    statPenalty: { fath: -8, wil: -4 },
    skills: [
      { id: 'cc_sm1_shadow_touch', name: '그림자의 손길', icon: '🌑', type: 'passive',
        desc: '항시. 신성한 빛이 불안정해지며 어둠의 기운이 스며든다. STR +6, AGI +4.',
        rarity: 'uncommon', mpCost: 0, condition: 'always', conditionDesc: '항시 발동',
        statBoost: { str: 48, agi: 32 } }
    ],
    aura: '후광이 이따금 깜빡이며 흔들린다. 신성한 기운이 불안정하게 느껴진다.',
    npcReact: '예민한 신관 NPC들이 "무언가 달라졌다"고 느낀다. 대부분의 NPC는 아직 눈치채지 못한다.',
    aiHint: '[-1단계 그늘진 신성]: 이 세레스티얼의 후광이 가끔 흔들리거나 잠깐 꺼지는 듯한 묘사를 포함하라. 예민한 신관이 "성인(聖人)께서 무언가 고민이 있으신 것 같다"며 걱정하는 장면을 넣어라. 치유할 때 평소보다 조금 덜 따뜻하게 느껴진다는 묘사도 좋다.'
  },
  // ── 중립 단계 ─────────────────────────────────────────────
  {
    stage: 0, name: '빛의 씨앗', icon: '🌱✨', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 12"/><path d="M12 12 C10 12 9 10.5 9 9 C10.5 9 12 10 12 12 Z" stroke-width="1.2"/><path d="M12 12 C14 12 15 10.5 15 9 C13.5 9 12 10 12 12 Z" stroke-width="1.2"/></svg>`, color: '#c8d8a0', threshold: 0, side: 'neutral',
    desc: '계율의 시작점. 신성의 가능성이 깨어나지 않았거나 균형점에 서 있다.',
    statBonus: {}, statPenalty: {},
    skills: [],
    aura: '특별한 신성함도, 어둠도 느껴지지 않는다. 평범한 존재처럼 보인다.',
    npcReact: 'NPC들이 이 인물의 특이함을 알아채지 못한다.',
    aiHint: '[중립 0단계 빛의 씨앗]: 이 세레스티얼은 아직 사명이 깨어나지 않은 상태다. 특별히 신성하거나 타락한 기운 없이 평범하게 묘사하라. 선택의 갈림길에 서 있는 잠재성을 은은하게 암시하라.'
  },
  // ── 플러스 단계 (신성한 세레스티얼) ─────────────────────────
  {
    stage: 1, name: '신성의 눈뜸', icon: '💛🌱', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" stroke-width="1.3"/><path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12" stroke-width="1.3"/></svg>`, color: '#d4c040', threshold: 40, side: 'light',
    desc: '사명이 깨어나기 시작했다. 상처받은 자의 고통이 본능적으로 느껴진다.',
    statBonus: { fath: 6, mgc: 4, wil: 3 },
    statPenalty: { str: -2 },
    skills: [
      { id: 'cc_s1_pain_sense', name: '고통 감지', icon: '💚', type: 'passive',
        desc: '범위 내 상처받은 자·저주받은 자가 자동으로 감지된다. FATH +8, PER +6.',
        rarity: 'uncommon', mpCost: 0, condition: 'always', conditionDesc: '항시 발동',
        statBoost: { fath: 64, per: 48 } }
    ],
    aura: '미약한 온기가 손에서 느껴진다. 다친 동물이나 아이들이 본능적으로 가까이 온다.',
    npcReact: '중상자나 저주받은 NPC가 이 캐릭터를 보면 희망의 눈빛을 보인다.',
    aiHint: '[+1단계 신성 눈뜸]: 세레스티얼의 손이나 눈에서 미약한 황금빛 온기가 느껴진다. 상처받은 자 옆에서 상처가 아주 조금 빠르게 아무는 묘사를 포함하라. 아이나 동물이 자연스럽게 이 캐릭터에게 다가오는 장면을 종종 넣어라.'
  },
  {
    stage: 2, name: '성광의 손길', icon: '✨💛', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8 C8 8 6 10 6 13 L9 13 C9 11 10 9 10 9 M16 8 C16 8 18 10 18 13 L15 13 C15 11 14 9 14 9" stroke-width="1.2"/><path d="M12 13 L12 21" stroke-width="1.4"/></svg>`, color: '#e8d040', threshold: 120, side: 'light',
    desc: '치유의 힘이 본격적으로 깨어났다. 접촉하면 저주와 독이 정화된다.',
    statBonus: { fath: 12, mgc: 9, wil: 7, spk: 5 },
    statPenalty: { str: -4, fear: -3 },
    skills: [
      { id: 'cc_s2_purify_touch', name: '성광 정화', icon: '🌟', type: 'active',
        desc: 'MP 15. 접촉으로 저주·독·상태이상 즉시 정화. HP +20 회복. 악마·언데드에게 신성 피해.',
        rarity: 'rare', mpCost: 15, condition: null, conditionDesc: null, statBoost: {} },
      { id: 'cc_s2_holy_light', name: '성스러운 빛', icon: '☀️', type: 'passive',
        desc: '어둠 속에서 자연스러운 빛을 방출. 어둠 속 모든 판정 +15, 언데드·악마에게 공포 효과.',
        rarity: 'rare', mpCost: 0, condition: 'darkness', conditionDesc: '어둠 속', statBoost: { fath: 96, mgc: 64 } }
    ],
    aura: '손이 닿으면 따뜻한 황금빛이 퍼진다. 성직자들이 경건하게 인사한다. 언데드가 본능적으로 거리를 둔다.',
    npcReact: '성직자·신관 NPC들이 이 캐릭터를 신의 사자로 여기며 공경한다. 악마·언데드 NPC들이 불쾌해하며 거리를 둔다.',
    aiHint: '[+2단계 성광의 손길]: 이 세레스티얼의 손에서 황금빛 치유의 빛이 흘러나온다. 접촉 시 상처가 빛나며 아무는 장면을 묘사하라. 성직자·신관 NPC들이 경건하게 고개를 숙인다. 언데드나 악마가 이 빛에 노출되면 피부가 타는 듯한 고통을 느낀다고 묘사하라.'
  },
  {
    stage: 3, name: '심판의 눈', icon: '⚖️✨', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12 L21 12" stroke-width="1.4"/><path d="M12 4 L12 20" stroke-width="1.2" stroke-dasharray="2 2"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg>`, color: '#f0c030', threshold: 250, side: 'light',
    desc: '신성이 완전히 깨어났다. 상대의 선악을 본능적으로 읽고 심판할 수 있다.',
    statBonus: { fath: 20, mgc: 16, wil: 13, spk: 10, per: 8 },
    statPenalty: { str: -7, fear: -5, agi: -3 },
    skills: [
      { id: 'cc_s3_divine_sight', name: '신성한 통찰', icon: '👁️', type: 'passive',
        desc: '대화 상대의 선악·숨겨진 의도가 자동으로 감지된다. PER +15, 거짓말 탐지 자동화.',
        rarity: 'rare', mpCost: 0, condition: 'always', conditionDesc: '항시 발동',
        statBoost: { fath: 120, per: 100, wil: 80 } },
      { id: 'cc_s3_holy_brand', name: '신성 낙인', icon: '🔯', type: 'event',
        desc: '악한 자에게 신성 낙인을 새긴다. 낙인자는 신성 피해 2배, 신성 존재들에게 위치 노출.',
        rarity: 'epic', mpCost: 25, condition: 'activate', conditionDesc: '직접 발동', statBoost: {} }
    ],
    aura: '이 존재의 시선이 닿으면 죄책감을 느끼게 된다. 선한 자는 용기를 얻고, 악한 자는 두려움을 느낀다.',
    npcReact: '선한 NPC들이 이 캐릭터 앞에서 자신도 모르게 솔직해진다. 악한 의도를 품은 NPC들이 눈을 마주치지 못하고 불안해한다.',
    aiHint: '[+3단계 심판의 눈]: 이 세레스티얼의 눈동자가 황금빛으로 빛나며 상대의 영혼을 꿰뚫어 본다. 악인이 이 시선을 받으면 자신도 모르게 뒷걸음질 치거나 식은땀을 흘린다. 선량한 NPC들은 이 존재 앞에서 자신의 비밀을 털어놓고 싶은 충동을 느낀다고 묘사하라.'
  },
  {
    stage: 4, name: '천상의 완성', icon: '😇🌟', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="4" stroke-width="1.3"/><path d="M6 21 C6 16.5 8.5 14 12 14 C15.5 14 18 16.5 18 21" stroke-width="1.3"/><path d="M4 9 L2 9 M22 9 L20 9 M12 2 L12 4" stroke-width="1"/></svg>`, color: '#ffffff', threshold: 400, side: 'light',
    desc: '사명이 완성에 이르렀다. 이 존재는 이제 세계 자체의 빛이다.',
    statBonus: { fath: 80, mgc: 70, wil: 60, spk: 50, luk: 45, per: 40 },
    statPenalty: { str: -35, fear: -25, agi: -18 },
    skills: [
      { id: 'cc_s4_salvation', name: '구원', icon: '🌈', type: 'active',
        desc: 'HP 전부 소모. 전장의 모든 저주·오염·타락을 완전 정화. 쓰러진 모든 아군 소생. 전투 종료.',
        rarity: 'legendary', mpCost: 0, condition: null, conditionDesc: null, statBoost: {} },
      { id: 'cc_s4_divine_immortal', name: '신성 불멸', icon: '♾️', type: 'passive',
        desc: '항시. 사망 시 신성한 빛으로 부활. 부활 시 주변 모든 어둠 속성 존재에게 신성 폭발.',
        rarity: 'legendary', mpCost: 0, condition: 'always', conditionDesc: '항시 발동',
        statBoost: { fath: 500, wil: 420, mgc: 380, spk: 300 } },
      { id: 'cc_s4_celestial_call', name: '천상의 부름', icon: '📯', type: 'event',
        desc: '천상에 도움을 요청. 천사 1체 소환(3턴). 소환된 천사는 치유+신성 피해 담당.',
        rarity: 'legendary', mpCost: 50, condition: null, conditionDesc: null, statBoost: {} }
    ],
    aura: '이 존재 주변에서 시간이 다르게 흐른다. 오래된 상처가 흔적도 없이 사라지고, 세계의 부패가 이 존재를 중심으로 되돌아간다.',
    npcReact: '모든 NPC가 이 존재 앞에서 내면의 가장 깊은 진실을 직면한다. 신들조차 이 존재를 동등하게 대하거나 경외한다.',
    aiHint: '[+4단계 천상의 완성]: 이 세레스티얼은 이제 세계 그 자체의 빛이다. 이 존재가 걷는 길마다 시든 꽃이 피어나고, 죄인들이 눈물을 흘리며 용서를 구한다. 오래된 저주와 상처가 이 존재의 접촉만으로 소멸한다. 신들이 이 존재를 통해 세계에 말을 건네며, 악마의 최고위 존재들조차 두려움에 자신들의 영역으로 물러난다.'
  }
];

export function _getCelestialCovenantStageIndex(points) {
  if      (points >= 400)  return 8; // stage +4
  else if (points >= 250)  return 7; // stage +3
  else if (points >= 120)  return 6; // stage +2
  else if (points >= 40)   return 5; // stage +1
  else if (points >= -40)  return 4; // stage 0 (중립)
  else if (points >= -120) return 3; // stage -1
  else if (points >= -250) return 2; // stage -2
  else if (points >= -400) return 1; // stage -3
  else                     return 0; // stage -4
}
window._getCelestialCovenantStageIndex = _getCelestialCovenantStageIndex;

export function gainCelestialCovenant(deedType, customGain) {
  const race = S.character?.race || '';
  const isCel = race.includes('세레스티얼') || race.includes('celestial') || race.includes('Celestial');
  if (!isCel) return;
  const cv = loadCelestialCovenant();
  const def = COVENANT_DEED_GAIN[deedType];
  const gain = customGain !== undefined ? customGain : (def?.gain || 6);
  const prevStage = cv.stage || 0;
  cv.points = Math.min(500, (cv.points || 0) + gain);
  cv.deed = cv.deed || {};
  if (deedType) cv.deed[deedType] = (cv.deed[deedType] || 0) + 1;
  cv.history = cv.history || [];
  cv.history.push({
    side: 'light', type: deedType, gain, label: def?.label || deedType,
    icon: def?.icon || '💛', total: cv.points,
    at: new Date().toISOString().slice(0, 16)
  });
  
  _checkCelestialCovenantStage(cv, prevStage);
  saveCelestialCovenant(cv);
  applyCelestialCovenantStats();
  return cv;
}
window.gainCelestialCovenant = gainCelestialCovenant;

export function loseCelestialCovenant(sinType, customLoss) {
  const race = S.character?.race || '';
  const isCel = race.includes('세레스티얼') || race.includes('celestial') || race.includes('Celestial');
  if (!isCel) return;
  const cv = loadCelestialCovenant();
  const def = COVENANT_SIN_LOSS[sinType];
  const loss = customLoss !== undefined ? customLoss : (def?.loss || -8);
  const prevStage = cv.stage || 0;
  cv.points = Math.max(-500, (cv.points || 0) + loss);
  cv.sin = cv.sin || {};
  if (sinType) cv.sin[sinType] = (cv.sin[sinType] || 0) + 1;
  cv.history = cv.history || [];
  cv.history.push({
    side: 'dark', type: sinType, gain: loss, label: def?.label || sinType,
    icon: def?.icon || '🌑', total: cv.points,
    at: new Date().toISOString().slice(0, 16)
  });
  
  _checkCelestialCovenantStage(cv, prevStage);
  saveCelestialCovenant(cv);
  applyCelestialCovenantStats();
  // _nextInjectedContext에 위반 힌트 주입
  const stg = CELESTIAL_COVENANT_STAGES[cv.stage || 0];
  if (S._nextInjectedContext !== undefined) {
    S._nextInjectedContext = (S._nextInjectedContext || '') +
      ` [⚠️ 세레스티얼 계율 위반: ${def?.icon||'🌑'} ${def?.label||sinType} — 신성도 ${loss}. 신성한 기운이 흔들리며 후광이 어두워지는 묘사를 포함하라. 현재 계율 단계: ${stg.name}]`;
  }
  return cv;
}
window.loseCelestialCovenant = loseCelestialCovenant;

export function covenantAtone(methodId) {
  const method = COVENANT_ATONEMENT_METHODS.find(m => m.id === methodId);
  if (!method) return;
  const cv = loadCelestialCovenant();
  if (method.cost.hp && (S.stats.hp || 100) <= method.cost.hp + 10) { toast('HP가 너무 낮습니다'); return; }
  if (method.cost.hp) { S.stats.hp = Math.max(1, (S.stats.hp || 100) - method.cost.hp); }
  const prevStage = cv.stage || 0;
  cv.points = Math.min(500, (cv.points || 0) + method.gain);
  cv.atonementCount = (cv.atonementCount || 0) + 1;
  cv.history = cv.history || [];
  cv.history.push({ side: 'atone', type: methodId, gain: method.gain, label: method.name, icon: method.icon, total: cv.points, at: new Date().toISOString().slice(0, 16) });
  
  _checkCelestialCovenantStage(cv, prevStage);
  saveCelestialCovenant(cv);
  applyCelestialCovenantStats();
  window.updateHeader();
  toast(`${method.name} — 계율 +${method.gain} (현재: ${cv.points})`, 3000, method);
}
window.covenantAtone = covenantAtone;

export function _checkCelestialCovenantStage(cv, prevStage) {
  const newIdx = _getCelestialCovenantStageIndex(cv.points);
  const newStage = CELESTIAL_COVENANT_STAGES[newIdx].stage;
  cv.stage = newStage;
  cv._stageIdx = newIdx;
  if (newIdx === (cv._prevStageIdx || 4)) return;
  cv._prevStageIdx = newIdx;
  const stg = CELESTIAL_COVENANT_STAGES[newIdx];
  setTimeout(() => {
    if (newStage > prevStage) toastHTML(`💛 계율 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)}`, 4000);
    else if (newStage < prevStage) toastHTML(`⚠️ 계율 하락! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)}`, 4000);
    stg.skills.forEach(sk => {
      if (!S.unlockedSkills[sk.id]) {
        S.unlockedSkills[sk.id] = true;
        saveSkills(S.unlockedSkills);
        setTimeout(() => toastHTML(`🔓 계율 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 3000), 1500);
      }
    });
    if (newStage === 4) {
      cv.awakenedAngel = true;
      // [B37 FIX] 세레스티얼 최종진화 엔딩(celestial_return_ending)이 요구하는
      // commandment_max 플래그를 세팅하는 코드가 어디에도 없어, 조건을
      // 실제로 만족해도 해당 엔딩에 영원히 도달할 수 없던 버그.
      if (typeof updateWorldDB === 'function') updateWorldDB({ flag: 'commandment_max' });
    }
    if (newStage <= -4) cv.fallen = true;
    // 💛 타락 단계 특수 이벤트 트리거
    if (newStage < prevStage) {
      // 타락 방향 진입 시 — 신성 아우라 손상 묘사 + NPC 반응 주입
      if (S._nextInjectedContext !== undefined) {
        S._nextInjectedContext = (S._nextInjectedContext || '') +
          ` [⚠️ 세레스티얼 계율 타락 이벤트 — ${stg.icon} ${stg.name} 진입: ${stg.aura} 반응: ${stg.npcReact}]`;
      }
      // 스탯 페널티 즉시 재적용
      if(typeof applyCelestialCovenantStats === 'function') applyCelestialCovenantStats();
    }
    if (newStage > prevStage && newStage > 0) {
      // 신성 방향 상승 시
      if (S._nextInjectedContext !== undefined) {
        S._nextInjectedContext = (S._nextInjectedContext || '') +
          ` [✨ 세레스티얼 계율 상승 이벤트 — ${stg.icon} ${stg.name} 진입: ${stg.aura}]`;
      }
      if(typeof applyCelestialCovenantStats === 'function') applyCelestialCovenantStats();
    }
    if (S._nextInjectedContext !== undefined) {
      S._nextInjectedContext = (S._nextInjectedContext || '') +
        ` [💛 세레스티얼 계율 ${newStage > prevStage ? '상승' : '하락'}! ${stg.icon} ${stg.name} — ${stg.aura} ${stg.npcReact}]`;
    }
  }, 500);
}
window._checkCelestialCovenantStage = _checkCelestialCovenantStage;

export function applyCelestialCovenantStats() {
  const cv = loadCelestialCovenant();
  const idx = _getCelestialCovenantStageIndex(cv.points);
  const stg = CELESTIAL_COVENANT_STAGES[idx];
  if (!stg) return;
  const prev = S._celestialCovenantBonus || {};
  Object.entries(prev).forEach(([k, v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });
  const newBonus = {};
  Object.entries(stg.statBonus || {}).forEach(([k, v]) => { S.stats[k] = Math.min(999, (S.stats[k] || 50) + v); newBonus[k] = v; });
  Object.entries(stg.statPenalty || {}).forEach(([k, v]) => { S.stats[k] = Math.max(0, (S.stats[k] || 50) + v); });
  S._celestialCovenantBonus = newBonus;
  if (typeof saveStats === 'function') saveStats(S.stats);
}
window.applyCelestialCovenantStats = applyCelestialCovenantStats;

export function getCelestialCovenantStatus() {
  const race = S.character?.race || '';
  const isCel = race.includes('세레스티얼') || race.includes('celestial') || race.includes('Celestial');
  if (!isCel) return null;
  const cv = loadCelestialCovenant();
  const idx = _getCelestialCovenantStageIndex(cv.points);
  const stg = CELESTIAL_COVENANT_STAGES[idx];
  // 다음 단계: 플러스 방향이면 idx+1, 마이너스면 idx-1 기준으로 표시
  const isFallen = stg.side === 'fallen';
  const nextIdx = isFallen ? Math.max(0, idx - 1) : Math.min(CELESTIAL_COVENANT_STAGES.length - 1, idx + 1);
  const nextStg = nextIdx !== idx ? CELESTIAL_COVENANT_STAGES[nextIdx] : null;
  return { ...cv, stageDef: stg, nextStage: nextStg, stageIdx: idx };
}
window.getCelestialCovenantStatus = getCelestialCovenantStatus;

export function detectCelestialCovenantFromText(text) {
  if (!text) return;
  const race = S.character?.race || '';
  const isCel = race.includes('세레스티얼') || race.includes('celestial') || race.includes('Celestial');
  if (!isCel) return;
  // 사명 행동 감지
  if (/치유|회복|상처를|상처가|정화|저주를 풀|독을 풀|소생|부활/.test(text) && Math.random() < 0.55) gainCelestialCovenant('heal', 6);
  if (/보호|막았|지켰|구했|희생|방패가 되|대신 막/.test(text) && Math.random() < 0.5) gainCelestialCovenant('protect', 8);
  if (/심판|진실을 드러|고발|악인을|죄악을|정의/.test(text) && Math.random() < 0.45) gainCelestialCovenant('judge', 7);
  if (/자신을 희생|몸을 던|대신 맞|목숨을 걸|목숨을 바/.test(text) && Math.random() < 0.5) gainCelestialCovenant('sacrifice', 12);
  if (/기적|신의 빛|신성한 힘|성광|기적이 일어/.test(text) && Math.random() < 0.4) gainCelestialCovenant('miracle', 15);
  // 계율 위반 감지
  if (/거짓 기적|위선|신의 이름으로 사기|치유를 약속하며 속/.test(text) && Math.random() < 0.5) loseCelestialCovenant('deceive', -12);
  if (/학살|무고한|민간인을|불필요한 살|무고한 자/.test(text) && Math.random() < 0.4) loseCelestialCovenant('violence', -14);
  if (/도움을 외면|눈을 감았|버리고|사명을 저버/.test(text) && Math.random() < 0.45) loseCelestialCovenant('betray', -12);
  if (/악마와 협력|어둠의 힘|금기 마법|악마와 계약/.test(text) && Math.random() < 0.4) loseCelestialCovenant('shadow', -10);
  if (/맹세를 어|약속을 저버|계약 파기|신성한 맹세/.test(text) && Math.random() < 0.45) loseCelestialCovenant('abandon', -18);
}
window.detectCelestialCovenantFromText = detectCelestialCovenantFromText;

export function renderCelestialCovenantPanel() {
  const body = document.getElementById('pb-celestial-covenant');
  if (!body) return;
  const status = getCelestialCovenantStatus();
  if (!status) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">⚖️</div>
      <div>세레스티얼 캐릭터에게만 활성화됩니다.</div>
      <div style="margin-top:6px;font-size:10px">종족을 세레스티얼로 선택하세요.</div>
    </div>`;
    return;
  }
  const cv = status;
  const stg = cv.stageDef;
  const nextStg = cv.nextStage;
  const color = stg.color;
  const totalDeed = Object.values(cv.deed || {}).reduce((a, b) => a + b, 0);
  const totalSin  = Object.values(cv.sin  || {}).reduce((a, b) => a + b, 0);
  // 현재 단계까지 해금된 스킬 수집 (플러스 단계만, 마이너스 단계는 별도)
  const allSkills = CELESTIAL_COVENANT_STAGES.filter(s => {
    if (stg.side === 'fallen') return s.side === 'fallen' && s.stage >= stg.stage;
    return s.side === 'light' && s.stage <= stg.stage;
  }).flatMap(s => s.skills);
  const recent = (cv.history || []).slice(-10).reverse();
  // 양방향 바 계산: -500~+500 → 0~100% 중앙 기준
  const pts = cv.points;
  const barCenter = 50; // 중앙 %
  const barHalf   = Math.abs(pts) / 10; // 최대 50%
  const barLeft   = pts < 0 ? Math.max(0, barCenter - barHalf) : barCenter;
  const barWidth  = barHalf;
  const barColor  = pts >= 0 ? color : (stg.color || '#c03060');
  const stageLabel = stg.stage > 0 ? `+${stg.stage}단계` : stg.stage < 0 ? `${stg.stage}단계` : '중립 0단계';

  body.innerHTML = `
    <!-- 헤더 -->
    <div style="padding:14px;background:linear-gradient(135deg,#0a0a20,#151535);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#7070c0;margin-top:2px">${stageLabel}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:${color}">${pts > 0 ? '+' : ''}${pts}<span style="font-size:9px;color:#5050a0"> / ±500</span></div>
          <div style="font-size:8px;color:#5050a0">계율 도</div>
        </div>
      </div>
      <!-- 양방향 계율 바 -->
      <div style="position:relative;height:10px;background:#0a0a20;border-radius:5px;border:1px solid #303060;margin-bottom:5px;overflow:hidden">
        <!-- 중앙선 -->
        <div style="position:absolute;left:50%;top:0;width:1px;height:100%;background:#5050a0;z-index:2"></div>
        <!-- 채움 바 -->
        <div style="position:absolute;top:0;left:${barLeft}%;width:${barWidth}%;height:100%;background:linear-gradient(90deg,${pts<0?barColor+',#a0206a':color+','+color});border-radius:3px;transition:all .4s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:8px;color:#5050a0;margin-bottom:4px">
        <span>🖤 -500 (심연)</span><span style="color:${color}">현재 ${pts > 0 ? '+' : ''}${pts}</span><span>+500 (천상) 💛</span>
      </div>
      <div style="margin-top:8px;font-size:10px;color:#9090c0;line-height:1.6;font-style:italic">"${stg.desc}"</div>
    </div>
      ${nextStg ? `<div style="display:flex;justify-content:space-between;font-size:8px;color:#5050a0"><span>현재: ${pts > 0 ? '+' : ''}${pts}</span><span>${stg.side === 'fallen' ? '정화 목표' : '다음 단계'} (${nextStg.name}): ${nextStg.threshold > 0 ? '+' : ''}${nextStg.threshold}</span></div>` : `<div style="font-size:8px;color:${color};text-align:center">${stg.stage >= 4 ? '⭐ 최고 신성 단계 달성' : '🖤 최저 타락 단계'}</div>`}
      <div style="margin-top:8px;font-size:10px;color:#9090c0;line-height:1.6;font-style:italic">"${stg.desc}"</div>
    </div>

    <!-- 아우라 -->
    <div style="padding:8px 12px;background:#080818;border-bottom:1px solid #181840;font-size:10px;color:#8080c0">
      ✨ <span style="font-style:italic">${stg.aura}</span>
    </div>

    <!-- NPC 반응 -->
    <div style="padding:7px 12px;background:#060614;border-bottom:1px solid #181840;font-size:9px;color:#6060a0">
      👥 <span>${stg.npcReact}</span>
    </div>

    <!-- 단계 진행 -->
    <div style="padding:10px 12px;border-bottom:1px solid #181840">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 계율 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${CELESTIAL_COVENANT_STAGES.map((s, i) => {
          const active = s.stage === stg.stage;
          const idx2 = cv.stageIdx || 4;
          const passed = s.side === 'light' ? (s.stage > 0 && s.stage <= stg.stage && stg.side === 'light')
                       : s.side === 'fallen' ? (s.stage < 0 && s.stage >= stg.stage && stg.side === 'fallen')
                       : false;
          const threshLabel = s.threshold > 0 ? `+${s.threshold}` : `${s.threshold}`;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#14143a':passed?'#0c0c25':'#080818'};border:1px solid ${active?s.color:passed?s.color+'44':'#181840'};border-radius:2px;opacity:${active?1:passed?0.7:0.35}">
            <span style="display:inline-flex;width:12px;height:12px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:12}):((s.svgIcon||'').replace('width="20" height="20"','width="12" height="12"')||s.icon)}</span>
            <div style="flex:1">
              <span style="font-family:'Cinzel',serif;font-size:9px;color:${active?s.color:passed?s.color:'#4a4a7a'}">${s.name}</span>
              <span style="font-size:8px;color:#4a4a7a;margin-left:5px">(${threshLabel})</span>
            </div>
            ${active ? `<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀ 현재</span>` : ''}
            ${passed ? `<span style="font-size:9px;color:${s.color}">✓</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- 스탯 효과 -->
    <div style="padding:10px 12px;border-bottom:1px solid #181840">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 계율 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(stg.statBonus||{}).map(([k,v])=>`<div style="padding:3px 7px;background:#0a1a0a;border:1px solid #204020;border-radius:2px;font-size:9px"><span style="color:${color}">${k.toUpperCase()}</span><span style="color:#60c060;margin-left:4px">+${v}</span></div>`).join('')}
        ${Object.entries(stg.statPenalty||{}).map(([k,v])=>`<div style="padding:3px 7px;background:#0d0000;border:1px solid #3a0a0a;border-radius:2px;font-size:9px"><span style="color:#a06060">${k.toUpperCase()}</span><span style="color:#e05050;margin-left:4px">${v}</span></div>`).join('')}
        ${Object.keys(stg.statBonus||{}).length===0&&Object.keys(stg.statPenalty||{}).length===0?'<div style="font-size:9px;color:#5050a0;grid-column:span 2">사명 깨어나기 전 — 스탯 변화 없음</div>':''}
      </div>
    </div>

    <!-- 계율 스킬 -->
    ${allSkills.length ? `
    <div style="padding:10px 12px;border-bottom:1px solid #181840">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 계율 전용 스킬 ──</div>
      ${allSkills.map(sk => {
        if(!S.unlockedSkills) S.unlockedSkills = {}; // [F-12 FIX]
        const unlocked = !!S.unlockedSkills[sk.id];
        return `<div style="padding:7px 9px;background:${unlocked?'#0e0e2a':'#080818'};border:1px solid ${unlocked?color+'55':'#181840'};margin-bottom:4px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:10px;color:${unlocked?color:'#5050a0'}">${sk.name}</span>
            <span style="font-size:8px;padding:1px 5px;background:${color}22;color:${color};border:1px solid ${color}44;border-radius:2px;margin-left:auto">${sk.rarity}</span>
            ${unlocked?'<span style="font-size:9px;color:#60d060">✓</span>':'<span style="font-size:9px;color:#4a4a7a">🔒</span>'}
          </div>
          <div style="font-size:9px;color:#7070a0;line-height:1.5">${sk.desc}</div>
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- 사명 행동 통계 + 위반 통계 -->
    <div style="padding:10px 12px;border-bottom:1px solid #181840">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 행동 기록 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="padding:8px;background:#0a1015;border:1px solid #1a3020;border-radius:3px">
          <div style="font-size:9px;color:#d4c040;font-family:'Cinzel',serif;margin-bottom:5px">💛 사명 행동 (${totalDeed}회)</div>
          ${Object.entries(cv.deed||{}).filter(([,v])=>v>0).map(([k,v])=>{const d=COVENANT_DEED_GAIN[k];return d?`<div style="display:flex;justify-content:space-between;font-size:9px;color:#a0a060;padding:2px 0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(d,{size:9}):(d.icon)} ${d.label}<span style="color:#d4c040">${v}회</span></div>`:''}).join('')||'<div style="font-size:9px;color:#5050a0">기록 없음</div>'}
        </div>
        <div style="padding:8px;background:#100a0a;border:1px solid #300a0a;border-radius:3px">
          <div style="font-size:9px;color:#c06060;font-family:'Cinzel',serif;margin-bottom:5px">⚠️ 계율 위반 (${totalSin}회)</div>
          ${Object.entries(cv.sin||{}).filter(([,v])=>v>0).map(([k,v])=>{const d=COVENANT_SIN_LOSS[k];return d?`<div style="display:flex;justify-content:space-between;font-size:9px;color:#907070;padding:2px 0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(d,{size:9}):(d.icon)} ${d.label}<span style="color:#c06060">${v}회</span></div>`:''}).join('')||'<div style="font-size:9px;color:#5050a0">기록 없음</div>'}
        </div>
      </div>
    </div>

    <!-- 사명 행동 버튼 -->
    <div style="padding:10px 12px;border-bottom:1px solid #181840">
      <div style="font-size:9px;color:#405050;font-style:italic;text-align:center;padding:4px 0">⛪ 사명 행동과 계율 위반은 AI 서사에서 자동 반영됩니다</div>
    </div>

    <!-- 속죄 방법 -->
    <div style="padding:10px 12px;border-bottom:1px solid #181840">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 속죄 방법 ──</div>
      ${COVENANT_ATONEMENT_METHODS.map(m => {
        const canHp = !m.cost.hp || (S.stats.hp||100) > m.cost.hp + 10;
        const canUse = canHp && cv.points < 500;
        return `<div style="padding:8px 10px;background:#0a0a18;border:1px solid ${canUse?'#303080':'#181840'};margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:14}):(m.icon)}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${canUse?color:'#5050a0'}">${m.name}</div>
              <div style="font-size:8px;color:#4a4a7a;margin-top:1px">조건: ${m.req}</div>
            </div>
            <span style="font-size:9px;color:#60c080;font-family:'Cinzel',serif">+${m.gain}</span>
          </div>
          <div style="font-size:9px;color:#6060a0;margin-bottom:5px">${m.desc}</div>
          <button onclick="covenantAtone('${m.id}');renderCelestialCovenantPanel()"
            style="width:100%;padding:5px;background:${canUse?'#0a0a3a':'#080818'};border:1px solid ${canUse?'#3050a0':'#181840'};color:${canUse?color:'#3a3a7a'};font-family:'Cinzel',serif;font-size:9px;cursor:${canUse?'pointer':'not-allowed'};border-radius:2px"
            ${canUse?'':'disabled'}>
            ${canUse?'✨ 속죄하기':'조건 미충족'}
            ${m.cost.hp?`(HP ${m.cost.hp} 소모)`:''}
          </button>
        </div>`;
      }).join('')}
    </div>

    <!-- 최근 기록 -->
    ${recent.length ? `
    <div style="padding:10px 12px;padding-bottom:18px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 최근 기록 ──</div>
      ${recent.map(r=>`<div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0d0d20;font-size:9px">
        <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:16}):(r.icon)}</span>
        <span style="flex:1;color:${r.side==='light'?'#8080c0':r.side==='atone'?'#60a080':'#c06060'}">${r.label}</span>
        <span style="color:${r.gain>0?'#60c060':'#c06060'};font-family:'Cinzel',serif">${r.gain>0?'+':''}${r.gain}</span>
        <span style="color:#3a3a6a;font-size:8px">(${r.total})</span>
      </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderCelestialCovenantPanel = renderCelestialCovenantPanel;

window.gainCelestialCovenant        = gainCelestialCovenant;

window.loseCelestialCovenant        = loseCelestialCovenant;

window.covenantAtone                = covenantAtone;

window.covenantManualSin            = function(sinType){ loseCelestialCovenant(sinType); renderCelestialCovenantPanel(); };

window.covenantManualDeed           = function(deedType){ gainCelestialCovenant(deedType); renderCelestialCovenantPanel(); };

window.applyCelestialCovenantStats  = applyCelestialCovenantStats;

window.getCelestialCovenantStatus   = getCelestialCovenantStatus;

window.loadCelestialCovenant        = loadCelestialCovenant;

window.renderCelestialCovenantPanel = renderCelestialCovenantPanel;

window.detectCelestialCovenantFromText = detectCelestialCovenantFromText;

window.clearCelestialCovenant       = clearCelestialCovenant;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_17(){
function detectDemonSinFromText(text) {
  if (!text) return;
  const race = S.character?.race || "";
  const isDemon = race.includes("악마") || race.includes("demon");
  if (!isDemon) return;
  let triggered = false;
  if (/협박|강요|계약|대가|거래/.test(text) && Math.random() < 0.5) { gainDemonCorruption('contract', 4); triggered = true; }
  if (/공포|두려움|떨었|비명|겁에/.test(text) && Math.random() < 0.4) { gainDemonCorruption('fear', 3); triggered = true; }
  if (/배신|속임|거짓|기만|배반/.test(text) && Math.random() < 0.5) { gainDemonCorruption('betrayal', 5); triggered = true; }
  if (/학살|무참|잔혹|처형|몰살/.test(text) && Math.random() < 0.4) { gainDemonCorruption('slaughter', 6); triggered = true; }
  if (/유혹|꼬드|빠뜨|흑화|타락/.test(text) && Math.random() < 0.4) { gainDemonCorruption('temptation', 4); triggered = true; }
}
window.detectDemonSinFromText = detectDemonSinFromText;

function detectDwarfCraftFromText(text) {
  if (!text) return;
  const race = S.character?.race || "";
  if (!race.includes("드워프") && !race.includes("dwarf")) return;
  if (/단조|제련|두드|망치|무기.*만|칼.*만|검.*만|창.*만/.test(text) && Math.random()<0.5) gainDwarfCraft('forge',5);
  else if (/방패|갑옷|흉갑|투구|방어구.*만/.test(text) && Math.random()<0.5) gainDwarfCraft('guard',4);
  else if (/수리|고쳤|복원|파손.*수리/.test(text) && Math.random()<0.45) gainDwarfCraft('repair',3);
  else if (/연금|정제|광석|합금|녹여|용해/.test(text) && Math.random()<0.4) gainDwarfCraft('alch',4);
  else if (/각인|룬|새기|새겼|문양|마법.*새/.test(text) && Math.random()<0.45) gainDwarfCraft('engrave',4);
  if (/포기|내팽개|미완성|그만둔|멈췄/.test(text) && Math.random()<0.35) abandonDwarfWork();
}
window.detectDwarfCraftFromText = detectDwarfCraftFromText;

window.detectDwarfCraftFromText = window.detectDwarfCraftFromText;

const _origDetectDwarfCraft = window.detectDwarfCraftFromText;

window.detectDwarfCraftFromText = function(text) {
  if (_origDetectDwarfCraft) _origDetectDwarfCraft(text);
  detectDwarfGrudgeFromText(text);
  detectDwarfUnfinishedFromText(text);
};

function gainOrcHonor(gainType, customGain) {
  const race = S.character?.race || "";
  const isOrc = race.includes("오크") || race.includes("orc");
  if (!isOrc) return;

  const oh = loadOrcHonor();
  const def = ORC_HONOR_GAINS[gainType];
  const gain = customGain !== undefined ? customGain : (def?.gain || 5);
  const lineage = def?.lineage || "honor";

  oh.points = Math.min(1000, (oh.points || 0) + gain);
  oh.lineage = oh.lineage || { honor:0, fear:0, wisdom:0 };
  oh.lineage[lineage] = (oh.lineage[lineage] || 0) + gain;

  oh.history = oh.history || [];
  oh.history.push({
    type: gainType, gain, label: def?.label || gainType,
    icon: def?.icon || "⚔️", lineage,
    total: oh.points,
    at: new Date().toISOString().slice(0, 16)
  });
  

  // 지배 계열 계산
  const dominant = Object.entries(oh.lineage).sort((a,b) => b[1]-a[1])[0][0];

  // 단계 업데이트
  const prevStage = oh.stage || 0;
  let newStage = 0;
  for (let i = ORC_HONOR_STAGES.length - 1; i >= 0; i--) {
    if (oh.points >= ORC_HONOR_STAGES[i].threshold) { newStage = i; break; }
  }
  oh.stage = newStage;

  // 각성 경로 결정
  if (newStage >= 4 && !oh.awakenPath) {
    oh.awakenPath = dominant;
    oh.awakened = true;
    const ld = ORC_LINEAGE_DEFS[dominant];
    setTimeout(() => {
      toastHTML(`🌋 계열 각성! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(ld,{size:14}):(ld.icon)} ${esc(ld.awakePath)} 경로로 분기! (${esc(dominant)})`, 5000);
      // 각성 스킬 해금
      if (!S.unlockedSkills[ld.awakeSkill.id]) {
        S.unlockedSkills[ld.awakeSkill.id] = true;
        saveSkills(S.unlockedSkills);
        setTimeout(() => toastHTML(`🔓 각성 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(ld.awakeSkill,{size:14}):(ld.awakeSkill.icon)} ${esc(ld.awakeSkill.name)}`, 3000), 1500);
      }
    }, 500);
  }

  saveOrcHonor(oh);

  // 단계 상승 알림
  if (newStage > prevStage) {
    const stg = ORC_HONOR_STAGES[newStage];
    setTimeout(() => {
      toastHTML(`😤 업보 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)} (${esc(newStage)}단계)`, 4000);
      stg.skills.forEach(sk => {
        if (!S.unlockedSkills[sk.id]) {
          S.unlockedSkills[sk.id] = true;
          saveSkills(S.unlockedSkills);
          setTimeout(() => toastHTML(`🔓 새 업보 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 3000), 1500);
        }
      });
    }, 500);
  }

  applyOrcHonorStats();
  return oh;
}
window.gainOrcHonor = gainOrcHonor;

function declareOrcOath(oathId) {
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return;
  const oh = loadOrcHonor();
  if (oh.oath) { toast("⚔️ 이미 맹세가 선언되어 있습니다", 2000); return; }
  const oathDef = ORC_OATH_TYPES.find(o => o.id === oathId);
  if (!oathDef) return;

  oh.oath = {
    id: oathId, text: oathDef.desc, type: oathDef.lineage,
    icon: oathDef.icon, label: oathDef.label,
    bonus: oathDef.bonus, cycle: S.cycle || 1,
    fulfilled: null
  };
  saveOrcHonor(oh);
  // 맹세 보너스 즉시 적용
  Object.entries(oathDef.bonus).forEach(([k, v]) => {
    if (S.stats[k] !== undefined) S.stats[k] = Math.min(999, (S.stats[k] || 50) + v);
  });
  S._orcOathBonus = { ...oathDef.bonus };
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
  toastHTML(`🤝 맹세 선언! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(oathDef,{size:14}):(oathDef.icon)} "${esc(oathDef.desc)}" — 판정 +25 보너스 발동`, 4000);
}
window.declareOrcOath = declareOrcOath;

function fulfillOrcOath(success) {
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return;
  const oh = loadOrcHonor();
  if (!oh.oath) { toast("선언된 맹세가 없습니다", 2000); return; }

  // 맹세 보너스 회수
  const prev = S._orcOathBonus || {};
  Object.entries(prev).forEach(([k, v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });
  S._orcOathBonus = {};

  if (success) {
    oh.oathFulfilled = (oh.oathFulfilled || 0) + 1;
    window.gainOrcHonor("oath_kept", 12);
    toast("🤝 맹세 이행! 명예업보 +12. 부족의 신뢰가 깊어진다.", 4000);
  } else {
    oh.oathBroken = (oh.oathBroken || 0) + 1;
    oh.points = Math.max(0, oh.points - 50);
    oh.lineage.honor = Math.max(0, (oh.lineage.honor || 0) - 30);
    // 단계 재계산
    let newStage = 0;
    for (let i = ORC_HONOR_STAGES.length - 1; i >= 0; i--) {
      if (oh.points >= ORC_HONOR_STAGES[i].threshold) { newStage = i; break; }
    }
    oh.stage = newStage;
    // 스탯 페널티
    S.stats.rep = Math.max(0, (S.stats.rep || 50) - 20);
    S.stats.wil = Math.max(0, (S.stats.wil || 50) - 10);
    if (typeof saveStats === 'function') saveStats(S.stats);
    window.updateHeader();
    toast("💔 맹세 파기! 업보 -50, 명예 -30. 선조가 저주를 내린다.", 4000);
  }
  oh.oath.fulfilled = success;
  oh.oath = null;
  saveOrcHonor(oh);
  applyOrcHonorStats();
  if (typeof window.renderOrcHonorPanel === 'function') window.renderOrcHonorPanel();
}
window.fulfillOrcOath = fulfillOrcOath;

function detectOrcHonorFromText(text) {
  if (!text) return;
  const race = S.character?.race || "";
  const isOrc = race.includes("오크") || race.includes("orc");
  if (!isOrc) return;
  if (/정정당당|정면승부|공정한 전투|동등한 상대/.test(text) && Math.random() < 0.5) window.gainOrcHonor('honorable_duel', 5);
  if (/약자.*보호|지켰다|구했다|막아섰다/.test(text) && Math.random() < 0.4) window.gainOrcHonor('protect_weak', 4);
  if (/맹세.*이행|약속.*지켰|맹세를 지/.test(text) && Math.random() < 0.5) window.gainOrcHonor('oath_kept', 6);
  if (/학살|섬멸|전멸|몰살|압도적/.test(text) && Math.random() < 0.4) window.gainOrcHonor('massacre', 5);
  if (/공포|두려움|비명|겁에|패닉/.test(text) && Math.random() < 0.35) window.gainOrcHonor('terror', 4);
  if (/광란|폭주|통제.*불능|광전사/.test(text) && Math.random() < 0.4) window.gainOrcHonor('berserker', 6);
  if (/전술|책략|지략|허를.*찌|계략/.test(text) && Math.random() < 0.45) window.gainOrcHonor('tactical_win', 5);
  if (/희생|대신.*받|몸을.*던|나를.*희/.test(text) && Math.random() < 0.4) window.gainOrcHonor('sacrifice', 5);
  if (/부족.*지켰|부족을 위해|동족.*보호/.test(text) && Math.random() < 0.4) window.gainOrcHonor('tribe_protect', 4);
}
window.detectOrcHonorFromText = detectOrcHonorFromText;

function renderOrcHonorPanel() {
  const body = document.getElementById('pb-orc-honor');
  if (!body) return;
  const status = getOrcHonorStatus();
  if (!status) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">😤</div>
      <div>오크족 캐릭터에게만 활성화됩니다.</div>
      <div style="margin-top:6px;font-size:10px">캐릭터 설정에서 종족을 오크로 선택하세요.</div>
    </div>`;
    return;
  }
  const oh = status;
  const stg = oh.stageDef;
  const nextStg = oh.nextStage;
  const color = stg.color;
  const dominant = oh.dominant;
  const domDef = ORC_LINEAGE_DEFS[dominant];
  const totalLineage = Object.values(oh.lineage || {}).reduce((a,b) => a+b, 0);

  // 단계별 스킬 모음
  const stageSkills = ORC_HONOR_STAGES.slice(0, (oh.stage || 0) + 1).flatMap(s => s.skills);
  // 각성 경로 스킬
  if (oh.awakenPath) {
    const ld = ORC_LINEAGE_DEFS[oh.awakenPath];
    stageSkills.push(ld.awakeSkill);
  }

  // 맹세 중 판정 보너스 표시
  const oathSection = oh.oath ? `
    <div style="margin:10px 12px;padding:10px;background:#1a0800;border:2px solid #e06020;border-radius:3px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
        <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(oh.oath,{size:16}):(oh.oath.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:11px;color:#e06020">${oh.oath.label}</div>
          <div style="font-size:9px;color:#a06040;margin-top:1px;font-style:italic">"${oh.oath.text}"</div>
        </div>
        <span style="font-size:9px;color:#e06020;font-family:'Cinzel',serif">모든 판정 +25</span>
      </div>
      <div style="display:flex;gap:5px;margin-top:5px">
        <button onclick="fulfillOrcOath(true);renderOrcHonorPanel()"
          style="flex:1;padding:6px;background:#1a0a00;border:1px solid #e06020;color:#e06020;font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">
          ✅ 맹세 이행
        </button>
        <button onclick="fulfillOrcOath(false);renderOrcHonorPanel()"
          style="flex:1;padding:6px;background:#0a0000;border:1px solid #a04040;color:#a04040;font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">
          💔 맹세 파기 (업보 -50)
        </button>
      </div>
    </div>` : '';

  body.innerHTML = `
    <!-- 헤더: 현재 업보 단계 -->
    <div style="padding:14px;background:linear-gradient(135deg,#1a0400,#2a0800);border-bottom:2px solid ${color};margin-bottom:0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#a05030;margin-top:2px">${oh.stage}단계 / 7단계</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:${color}">${oh.points}<span style="font-size:9px;color:#6a3020"> / 1000</span></div>
          <div style="font-size:8px;color:#6a3020">업보</div>
        </div>
      </div>
      <!-- 업보도 바 -->
      <div style="height:6px;background:#1a0400;border-radius:3px;overflow:hidden;margin-bottom:4px">
        <div style="width:${Math.min(100, Math.round(oh.points / 10))}%;height:100%;background:linear-gradient(90deg,#6a1000,${color});border-radius:3px;transition:width .4s"></div>
      </div>
      ${nextStg ? `
        <div style="display:flex;justify-content:space-between;font-size:8px;color:#6a3020">
          <span>현재: ${oh.points}</span>
          <span>다음 단계 (${nextStg.name}): ${nextStg.threshold}</span>
        </div>
      ` : `<div style="font-size:8px;color:${color};text-align:center">⚔️ 최고 업보 단계 도달 — 전쟁신의 화신</div>`}
      <div style="margin-top:8px;font-size:10px;color:#9a5030;line-height:1.6;font-style:italic">"${stg.desc}"</div>
    </div>

    <!-- 오라 -->
    <div style="padding:8px 12px;background:#100400;border-bottom:1px solid #2a0800;font-size:10px;color:#804020">
      ⚔️ <span style="font-style:italic">${stg.aura}</span>
    </div>

    <!-- 맹세 섹션 -->
    ${oathSection}

    <!-- 3계열 업보 분포 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0800">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 업보 계열 분포 ──</div>
      ${Object.entries(ORC_LINEAGE_DEFS).map(([key, ld]) => {
        const val = oh.lineage?.[key] || 0;
        const pct = totalLineage > 0 ? Math.round(val / totalLineage * 100) : 0;
        const isDominant = key === dominant && totalLineage > 0;
        return `<div style="margin-bottom:6px">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
            <span style="font-size:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(ld,{size:12}):(ld.icon)}</span>
            <span style="font-size:9px;color:${isDominant?ld.color:'#6a4030'};font-family:'Cinzel',serif">${ld.label}</span>
            ${isDominant ? `<span style="font-size:8px;padding:1px 5px;background:${ld.color}22;color:${ld.color};border:1px solid ${ld.color}44;border-radius:2px">지배 계열</span>` : ''}
            <span style="margin-left:auto;font-size:9px;color:${ld.color};font-family:'Cinzel',serif">${val}</span>
            <span style="font-size:8px;color:#4a2015">${pct}%</span>
          </div>
          <div style="height:4px;background:#0d0400;border-radius:2px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:${ld.color};border-radius:2px;transition:width .4s"></div>
          </div>
          <div style="font-size:8px;color:#4a2015;margin-top:2px">${ld.gainDesc}</div>
        </div>`;
      }).join('')}
    </div>

    <!-- 각성 경로 -->
    ${oh.awakenPath ? `
    <div style="padding:10px 12px;border-bottom:1px solid #1a0800;background:#100800">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${ORC_LINEAGE_DEFS[oh.awakenPath].color};letter-spacing:1px;margin-bottom:5px">── 각성 경로: ${ORC_LINEAGE_DEFS[oh.awakenPath].awakePath} ──</div>
      <div style="font-size:9px;color:#8a5030;line-height:1.5">${ORC_LINEAGE_DEFS[oh.awakenPath].awakeDesc}</div>
    </div>` : (oh.stage >= 3 ? `
    <div style="padding:10px 12px;border-bottom:1px solid #1a0800;background:#0d0400">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#6a3020;margin-bottom:4px">── 각성 경로 분기 예측 ──</div>
      <div style="font-size:9px;color:#5a2010">현재 지배 계열: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(domDef,{size:9}):(domDef.icon)} ${domDef.label}</div>
      <div style="font-size:9px;color:#4a1a08;margin-top:2px">4단계 도달 시 → ${domDef.awakePath} 경로로 각성합니다</div>
    </div>` : '')}

    <!-- 단계 진행 표시 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0800">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 업보 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${ORC_HONOR_STAGES.map((s, i) => {
          const active = i === oh.stage;
          const passed = i < oh.stage;
          const c = s.color;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#1a0800':passed?'#0d0500':'#080200'};border:1px solid ${active?c:passed?c+'44':'#1a0800'};border-radius:2px;opacity:${active?1:passed?0.7:0.35}">
            <span style="display:inline-flex;width:12px;height:12px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:12}):((s.svgIcon||'').replace('width="20" height="20"','width="12" height="12"')||s.icon)}</span>
            <div style="flex:1">
              <span style="font-family:'Cinzel',serif;font-size:9px;color:${active?c:passed?c:'#4a2a1a'}">${s.name}</span>
              <span style="font-size:8px;color:#3a1a08;margin-left:5px">(${s.threshold})</span>
            </div>
            ${active ? `<span style="font-size:8px;color:${c};font-family:'Cinzel',serif">◀ 현재</span>` : ''}
            ${passed ? `<span style="font-size:9px;color:${c}">✓</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- 스탯 효과 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0800">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 업보 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(stg.statBonus || {}).map(([k,v])=>`
          <div style="padding:3px 7px;background:#0d0800;border:1px solid #2a1400;border-radius:2px;font-size:9px">
            <span style="color:${color}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:4px">+${v}</span>
          </div>`).join('')}
        ${Object.entries(stg.statPenalty || {}).map(([k,v])=>`
          <div style="padding:3px 7px;background:#0d0000;border:1px solid #2a0a0a;border-radius:2px;font-size:9px">
            <span style="color:#a06060">${k.toUpperCase()}</span><span style="color:#e05050;margin-left:4px">${v}</span>
          </div>`).join('')}
      </div>
    </div>

    <!-- 해금된 스킬 -->
    ${stageSkills.length ? `
    <div style="padding:10px 12px;border-bottom:1px solid #1a0800">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 업보 전용 스킬 ──</div>
      ${stageSkills.map(sk => {
        if(!S.unlockedSkills) S.unlockedSkills = {}; // [F-12 FIX]
        const unlocked = !!S.unlockedSkills[sk.id];
        return `<div style="padding:7px 9px;background:${unlocked?'#150800':'#080400'};border:1px solid ${unlocked?color+'55':'#1a0800'};margin-bottom:4px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:10px;color:${color}">${esc(sk.name)}</span>
            <span style="font-size:8px;padding:1px 5px;background:${color}22;color:${color};border:1px solid ${color}44;border-radius:2px;margin-left:auto">${sk.rarity}</span>
            ${unlocked ? '<span style="font-size:9px;color:#60d060">✓</span>' : '<span style="font-size:9px;color:#4a2a1a">🔒</span>'}
          </div>
          <div style="font-size:9px;color:#7a4020;line-height:1.5">${esc(sk.desc)}</div>
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- 수동 업보 획득 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0800">
      <div style="font-size:9px;color:#4a2a10;font-style:italic;text-align:center;padding:4px 0">⚔️ 업보는 AI 서사에서 자동으로 쌓입니다</div>
    </div>

    <!-- 맹세 선언 -->
    ${!oh.oath ? `
    <div style="padding:10px 12px;border-bottom:1px solid #1a0800">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 맹세 선언 (판정 +25, 파기 시 업보 -50) ──</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${ORC_OATH_TYPES.map(o => {
          const ld = ORC_LINEAGE_DEFS[o.lineage];
          const bonusText = Object.entries(o.bonus).map(([k,v])=>`${k.toUpperCase()}+${v}`).join(', ');
          return `<button onclick="declareOrcOath('${o.id}');renderOrcHonorPanel()"
            style="padding:8px 10px;background:#0d0500;border:1px solid ${ld.color}44;color:${ld.color};font-size:9px;cursor:pointer;font-family:'Crimson Text',serif;text-align:left;border-radius:2px;line-height:1.5">
            ${o.icon} <strong>${o.label}</strong><br>
            <span style="font-size:8px;color:#4a2010;font-style:italic">"${o.desc}"</span><br>
            <span style="font-size:8px;color:#6a4020">${bonusText}</span>
          </button>`;
        }).join('')}
      </div>
    </div>` : ''}

    <!-- 맹세 통계 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0800">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 맹세 기록 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
        <div style="padding:7px;background:#0a0800;border:1px solid #2a2000;border-radius:2px;text-align:center">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:#40d080">${oh.oathFulfilled || 0}</div>
          <div style="font-size:8px;color:#4a6040">이행한 맹세</div>
        </div>
        <div style="padding:7px;background:#0a0000;border:1px solid #2a0a0a;border-radius:2px;text-align:center">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:#d04040">${oh.oathBroken || 0}</div>
          <div style="font-size:8px;color:#6a2020">파기한 맹세</div>
        </div>
      </div>
    </div>

    <!-- 최근 기록 -->
    ${oh.history && oh.history.length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 최근 업보 기록 ──</div>
      ${[...oh.history].reverse().slice(0, 10).map(h => {
        const ld = ORC_LINEAGE_DEFS[h.lineage || 'honor'];
        return `<div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0d0400;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:${ld?.color||'#6a4020'}">${h.label}</span>
          <span style="color:#d06020;font-family:'Cinzel',serif">+${h.gain}</span>
          <span style="color:#3a1a08;font-size:8px">(${h.total})</span>
        </div>`;
      }).join('')}
    </div>` : ''}
  `;
}
window.renderOrcHonorPanel = renderOrcHonorPanel;

window.gainOrcHonor         = window.gainOrcHonor;

window.declareOrcOath       = declareOrcOath;

window.fulfillOrcOath       = fulfillOrcOath;

window.renderOrcHonorPanel  = window.renderOrcHonorPanel;

window.detectOrcHonorFromText = window.detectOrcHonorFromText;

const _origGainOrcHonor = window.gainOrcHonor;

window.gainOrcHonor = function(gainType, customGain) {
  const result = _origGainOrcHonor(gainType, customGain);
  if (result) {
    const def = ORC_HONOR_GAINS[gainType];
    if (def) updateTribeRenown(def.lineage, Math.ceil((def.gain || 5) * 0.5));
  }
  return result;
};

const _origDeclareOrcOath = window.declareOrcOath;

window.declareOrcOath = function(oathId) {
  _origDeclareOrcOath(oathId);
  chargeGorbloodOath('declare');
};

const _origFulfillOrcOath = window.fulfillOrcOath;

window.fulfillOrcOath = function(success) {
  _origFulfillOrcOath(success);
  if (success) {
    chargeGorbloodOath('fulfill');
    updateTribeRenown('honor', 15);
  } else {
    addAncestorBrand('맹세 파기');
  }
  setTimeout(() => { if (typeof window.renderOrcHonorPanel === 'function') window.renderOrcHonorPanel(); }, 100);
};

const _origRenderOrcHonorPanel = window.renderOrcHonorPanel;

window.renderOrcHonorPanel = function() {
  _origRenderOrcHonorPanel();
  const body = document.getElementById('pb-orc-honor');
  if (!body) return;
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return;

  // 기존 콘텐츠 앞에 Gorblood 섹션 삽입
  const gbSection = renderGorbloodSection();
  if (gbSection) {
    const firstChild = body.firstElementChild;
    if (firstChild) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = gbSection;
      // 헤더 바로 다음에 삽입 (두 번째 자식 앞)
      const secondChild = body.children[1];
      if (secondChild) body.insertBefore(wrapper, secondChild);
      else body.appendChild(wrapper);
    }
  }
};

// [버그 수정] 이 IIFE가 __tfDeferred_17(main.js의 deferred 배열에서 두
// 번째로 실행됨) 안에 있는데, window.updateHeader의 진짜 정의(quest/086의
// __tfDeferred_67, 배열상 13번째)는 그보다 한참 뒤에야 실행된다. 그 결과
// `_orig = window.updateHeader || function(){}`가 항상 undefined를 만나
// 빈 함수로 폴백했고, 이렇게 만들어진 오크 전용 래퍼는 실제 헤더 렌더링을
// 전혀 호출하지 못하는 반쪽짜리 상태로 window.updateHeader에 할당됐다.
// 더 치명적인 건, 곧이어 __tfDeferred_67이 `window.updateHeader = updateHeader`로
// 통째로 덮어써버려 이 래퍼 자체가 완전히 사라진다는 점 — 결과적으로
// 오크 종족의 "혈전 게이지" 헤더 배지(#h-gorblood)가 게임 내내 단 한 번도
// 생성되지 않았다. setTimeout으로 감싸 main.js가 모든 deferred 함수 호출을
// 마친 뒤(모든 동기 코드가 끝난 뒤에만 타이머가 실행되므로 지연 시간과
// 무관하게 항상 안전) 실행되도록 하면, 이 시점엔 이미 최종 조립된 진짜
// window.updateHeader가 잡혀 정상적으로 체이닝된다.
setTimeout(function(){
  window.updateHeader = (function() {
    const _orig = window.updateHeader || function(){};
    return function(...args) {
      _orig.apply(this, args);
      const _isOrc = (S.character?.race||'').includes('오크') || (S.character?.race||'').includes('orc');
      if (_isOrc) {
        const gb = loadGorblood();
        let hdrGor = document.getElementById('h-gorblood');
        if (!hdrGor) {
          const hdrStats = document.querySelector('.hdr-stats');
          if (hdrStats) {
            const span = document.createElement('span');
            span.className = 'hst'; span.id = 'h-gorblood';
            span.style.cssText = 'color:#c05030;cursor:pointer';
            span.title = '혈전 게이지 (클릭: 업보 패널)';
            span.onclick = () => { window.openP('orc-honor'); window.renderOrcHonorPanel(); };
            hdrStats.insertBefore(span, hdrStats.firstChild);
          }
        }
        updateGorbloodUI(gb);
      }
    };
  })();
}, 0);

const _origDetectOrcHonor = window.detectOrcHonorFromText;

window.detectOrcHonorFromText = function(text) {
  _origDetectOrcHonor(text);
  if (!text) return;
  const race = S.character?.race || "";
  if (!race.includes("오크") && !race.includes("orc")) return;
  // 피해 묘사 감지
  if (/HP.*감소|피해.*입|상처.*입|베였|찔렸|맞았|부상|피를 흘|혈/.test(text)) {
    chargeGorblood(8, 'AI 전투 묘사');
  }
  // 각성 해제 감지
  if (/전투.*끝|평화|안정|쉬었|회복/.test(text) && loadGorblood().awakened) {
    endGorAwakening();
  }
};

const _origDetectOrcHonorText = window.detectOrcHonorFromText;

window.detectOrcHonorFromText = function(text) {
  if (_origDetectOrcHonorText) _origDetectOrcHonorText(text);
  detectOrcBloodVowFromText(text);
  detectOrcCouncilFromText(text);
};

window.renderDarklingVoidPanel  = window.renderDarklingVoidPanel;
}

