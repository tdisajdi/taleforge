// 21~30번 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { AGE_PARADOX_DEFS, CURSE_RING_ACTIONS, ENDING_THEMES, FALSE_MEMORY_POOL, INJURY_PART_DEFS, WORLD_TREE_STAGES } from '../data/016-2130번-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { lsDel, lsGet, lsSet, toast } from '../utils.js';

export const RELATIONSHIP_LEGACY_KEY = "taleforge-rellegacy";

export const loadRelLegacy   = () => { const r = lsGet(RELATIONSHIP_LEGACY_KEY); return r ? JSON.parse(r) : []; };

export const saveRelLegacy   = (l) => lsSet(RELATIONSHIP_LEGACY_KEY, JSON.stringify(l));


export const recordRelationshipLegacy = (npcName, bond, depth, scenario) => {
  const list = loadRelLegacy();
  const existing = list.find(r => r.npcName === npcName);
  if (existing) {
    existing.depth = Math.min(5, existing.depth + 1);
    existing.bond = bond;
  } else {
    list.push({ npcName, bond, depth: Math.min(5, depth||1), scenario: scenario||"", savedAt: new Date().toISOString() });
  }
  saveRelLegacy(list);
};

export const getRelationshipLegacies = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadRelLegacy();
};

export const WORLD_SECRETS_KEY  = "taleforge-worldsecrets";

export const loadWorldSecrets   = () => { const r = lsGet(WORLD_SECRETS_KEY); return r ? JSON.parse(r) : []; };

export const saveWorldSecrets   = (s) => lsSet(WORLD_SECRETS_KEY, JSON.stringify(s));


export const recordWorldSecret = (secretId, title, hint, scenario) => {
  const secrets = loadWorldSecrets();
  if (!secrets.some(s => s.secretId === secretId)) {
    secrets.push({ secretId, title, hint: hint||"", scenario: scenario||"", discoveredAt: new Date().toISOString() });
    saveWorldSecrets(secrets);
    // 파편 획득 토스트
    toast(`🔍 정보 파편 획득: ${title}`, 3000);
  }
};

export function unlockLocationLore(locId, locName, loreSummary, reason){
  const key = 'lore_'+locId;
  recordWorldSecret(key, locName+'의 진실', loreSummary||'', S.scenario?.id||'');
  S._nextInjectedContext = (S._nextInjectedContext||'') +
    ` [🔓 장소 정보 해금: ${locName}] ${loreSummary||''} — 이 정보를 서사에 자연스럽게 녹여라.`;
  if(reason) toast(`📜 ${locName} — ${reason}`, 3000);
}
window.unlockLocationLore = unlockLocationLore;

window.unlockLocationLore = unlockLocationLore;

export function isLocLoreUnlocked(locId){
  const secrets = loadWorldSecrets();
  return secrets.some(s=>s.secretId==='lore_'+locId);
}
window.isLocLoreUnlocked = isLocLoreUnlocked;

window.isLocLoreUnlocked = isLocLoreUnlocked;

export function onDungeonClear(loc){
  if(!loc?.id||!loc?.lore) return;
  if(!isLocLoreUnlocked(loc.id)){
    unlockLocationLore(loc.id, loc.name, loc.lore?.slice(0,80), '던전 클리어로 진실이 드러났다');
  }
}
window.onDungeonClear = onDungeonClear;

window.onDungeonClear = onDungeonClear;

export const getWorldSecrets = (scenario) => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  const all = loadWorldSecrets();
  return scenario ? all.filter(s => !s.scenario || s.scenario === scenario) : all;
};

export const ABILITY_IMPRINT_KEY  = "taleforge-abilityimprint";

export const loadAbilityImprint   = () => { const r = lsGet(ABILITY_IMPRINT_KEY); return r ? JSON.parse(r) : {}; };

export const saveAbilityImprint   = (a) => lsSet(ABILITY_IMPRINT_KEY, JSON.stringify(a));


export const recordStatUsage = (statId, amount=1) => {
  const imp = loadAbilityImprint();
  imp[statId] = (imp[statId] || 0) + amount;
  saveAbilityImprint(imp);
};

export const ABILITY_IMPRINT_THRESHOLD = 100;

export const getImprintedAbilities = () => {
  const imp = loadAbilityImprint();
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  // hp/mp는 각인 대상이 아니다 — 과거 버그로 오염된 세이브(예: hp 3986)가
  // 있어도 이 목록에 나타나지 않도록 조회 시점에 안전하게 제외한다.
  // (원본 카운터 자체는 건드리지 않음 — 참고용 정보라 데이터 삭제는 불필요)
  return Object.entries(imp)
    .filter(([statId]) => statId !== 'hp' && statId !== 'mp')
    .filter(([, count]) => count >= ABILITY_IMPRINT_THRESHOLD)
    .map(([statId, count]) => ({ statId, count, tier: Math.min(3, Math.floor(count / ABILITY_IMPRINT_THRESHOLD)) }));
};

export const GRUDGE_TRACKER_KEY  = "taleforge-grudge";

export const loadGrudgeList      = () => { const r = lsGet(GRUDGE_TRACKER_KEY); return r ? JSON.parse(r) : []; };

export const saveGrudgeList      = (g) => lsSet(GRUDGE_TRACKER_KEY, JSON.stringify(g));


export const addGrudge = (name, power, scenario) => {
  const list = loadGrudgeList();
  if (!list.some(g => g.name === name)) {
    list.push({ name, power: Math.min(5, power||1), scenario: scenario||"", killedAt: new Date().toISOString(), resolved: false });
    saveGrudgeList(list);
  }
};

export const resolveGrudge = (name) => {
  const list = loadGrudgeList();
  const g = list.find(g => g.name === name);
  if (g) { g.resolved = true; saveGrudgeList(list); }
};

export const getActiveGrudges = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadGrudgeList().filter(g => !g.resolved);
};

export const TIME_ECHO_KEY   = "taleforge-timeecho";

export const loadTimeEchoes  = () => { const r = lsGet(TIME_ECHO_KEY); return r ? JSON.parse(r) : []; };

export const saveTimeEchoes  = (e) => lsSet(TIME_ECHO_KEY, JSON.stringify(e));

export const clearTimeEchoes = () => lsDel(TIME_ECHO_KEY);

export const addTimeEcho = (text, speaker, emotion, scenario) => {
  const echoes = loadTimeEchoes();
  echoes.push({ text, speaker: speaker||"???", emotion: emotion||"", scenario: scenario||"", savedAt: new Date().toISOString() });
  saveTimeEchoes(echoes);
};

export const getTimeEchoes = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadTimeEchoes();
};

export const FATE_CHOICES_KEY   = "taleforge-fatechoices";

export const loadFateChoices    = () => { const r = lsGet(FATE_CHOICES_KEY); return r ? JSON.parse(r) : []; };

export const saveFateChoices    = (c) => lsSet(FATE_CHOICES_KEY, JSON.stringify(c));


export const recordFateChoice = (choiceId, description, outcome, scenario) => {
  const choices = loadFateChoices();
  if (!choices.some(c => c.choiceId === choiceId)) {
    choices.push({ choiceId, description: description||"", outcome: outcome||"neutral", scenario: scenario||"", chosenAt: new Date().toISOString() });
      saveFateChoices(choices);
  }
};

export const getFateChoices = (scenario) => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  const all = loadFateChoices();
  return scenario ? all.filter(c => !c.scenario || c.scenario === scenario) : all;
};

export const DIVINE_GAZE_KEY   = "taleforge-divinegaze";

export const loadDivineGaze    = () => { const r = lsGet(DIVINE_GAZE_KEY); return r ? JSON.parse(r) : { attention:0, interventions:0, favored: false } };

export const saveDivineGaze    = (g) => lsSet(DIVINE_GAZE_KEY, JSON.stringify(g));


export const accumulateDivineAttention = (amount=1) => {
  const g = loadDivineGaze();
  g.attention = Math.min(100, (g.attention||0) + amount);
  if (g.attention >= 50 && !g.favored) g.favored = true;
  saveDivineGaze(g);
  return g;
};

export const recordDivineIntervention = () => {
  const g = loadDivineGaze();
  g.interventions = (g.interventions||0) + 1;
  g.attention = Math.max(0, g.attention - 20); // 개입 후 관심도 소모
  saveDivineGaze(g);
};

export const getDivineGazeStatus = () => {
  const g = loadDivineGaze();
  const cycle = loadCycleCount();
  const att = g.attention || 0;
  if (cycle < 2 || att < 10) return null;
  const levels = [
    { min:10, max:29, label:"신의 시선", desc:"어딘가에서 당신을 지켜보는 시선이 느껴진다.", icon:"👁️" },
    { min:30, max:59, label:"신의 관심", desc:"어떤 존재가 당신의 행보에 흥미를 보이고 있다.", icon:"🌟" },
    { min:60, max:84, label:"신의 총애", desc:"신적 존재가 당신을 특별히 여기고 있다. 때로 기적이 일어난다.", icon:"✨" },
    { min:85, max:100, label:"신의 선택받은 자", desc:"신이 당신을 도구로 삼으려 한다. 거대한 역할이 기다리고 있다.", icon:"⚡" },
  ];
  return levels.find(l => att >= l.min && att <= l.max) || null;
};

export const CURSE_LINEAGE_KEY  = "taleforge-curselineage";

export const loadCurseLineage   = () => { const r = lsGet(CURSE_LINEAGE_KEY); return r ? JSON.parse(r) : []; };

export const saveCurseLineage   = (c) => lsSet(CURSE_LINEAGE_KEY, JSON.stringify(c));

export const clearCurseLineage  = () => lsDel(CURSE_LINEAGE_KEY);

export const CURSE_MASTERY_KEY  = "taleforge-curse-mastery";

export const loadCurseMastery   = () => { const r = lsGet(CURSE_MASTERY_KEY); return r ? JSON.parse(r) : {}; };

export const saveCurseMastery   = (c) => lsSet(CURSE_MASTERY_KEY, JSON.stringify(c));

export const CURSE_MASTERY_THRESHOLD = 3;

export const recordCurse = (curseType) => {
  const cl = loadCurseMastery();
  cl[curseType] = (cl[curseType]||0) + 1;
  saveCurseMastery(cl);
  return cl[curseType];
};

export const getCurseMasteries = () => {
  const cl = loadCurseMastery();
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return Object.entries(cl)
    .filter(([,count]) => count >= CURSE_MASTERY_THRESHOLD)
    .map(([type, count]) => ({ type, count, mastered: true }));
};

export const PAST_PRAYER_KEY   = "taleforge-pastprayer";

export const loadPastPrayer    = () => { const r = lsGet(PAST_PRAYER_KEY); return r ? JSON.parse(r) : { usedThisCycle: false, totalPrayers:0 } };

export const savePastPrayer    = (p) => lsSet(PAST_PRAYER_KEY, JSON.stringify(p));


export const usePastPrayer = () => {
  const p = loadPastPrayer();
  if (p.usedThisCycle) return false;
  p.usedThisCycle = true;
  p.totalPrayers = (p.totalPrayers||0) + 1;
  savePastPrayer(p);
  return true;
};

export const resetPastPrayerCycle = () => {
  const p = loadPastPrayer();
  p.usedThisCycle = false;
  savePastPrayer(p);
};

export const getPastPrayerStatus = () => {
  const p = loadPastPrayer();
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const total = p.totalPrayers || 0;
  const power = total <= 2 ? "약한" : total <= 5 ? "보통" : total <= 9 ? "강한" : "전설적인";
  return { usedThisCycle: p.usedThisCycle||false, total, power, available: !p.usedThisCycle };
};

export const WHEEL_OF_FATE_KEY   = "taleforge-wheeloffate";

export const loadWheelOfFate     = () => { const r = lsGet(WHEEL_OF_FATE_KEY); return r ? JSON.parse(r) : { greatCycles:0, totalCycles:0 } };

export const saveWheelOfFate     = (w) => lsSet(WHEEL_OF_FATE_KEY, JSON.stringify(w));

export const GREAT_CYCLE_THRESHOLD = 10;

export const checkGreatCycleReset = (currentCycle) => {
  const w = loadWheelOfFate();
  w.totalCycles = currentCycle;
  if (currentCycle > 0 && currentCycle % GREAT_CYCLE_THRESHOLD === 0) {
    w.greatCycles = Math.floor(currentCycle / GREAT_CYCLE_THRESHOLD);
    saveWheelOfFate(w);
    return { isGreatCycle: true, greatCycleNumber: w.greatCycles };
  }
  saveWheelOfFate(w);
  return { isGreatCycle: false, greatCycleNumber: w.greatCycles };
};

export const getGreatCycleStatus = () => {
  const w = loadWheelOfFate();
  const gc = w.greatCycles || 0;
  if (gc === 0) return null;
  const rewards = [
    "1대순환 달성: 전설급 특성 해금 — 한 번 죽어도 부활하는 「불사의 기억」",
    "2대순환 달성: 신화급 특성 해금 — 스탯 상한이 해제되는 「초월의 각인」",
    "3대순환 달성: 창조자급 특성 해금 — 세계 규칙을 일시 무시하는 「인과율 파괴」",
  ];
  return {
    greatCycles: gc,
    totalCycles: w.totalCycles || 0,
    nextThreshold: (gc + 1) * GREAT_CYCLE_THRESHOLD,
    unlockedRewards: rewards.slice(0, Math.min(gc, rewards.length)),
  };
};

export const PARALLEL_SELF_KEY   = "taleforge-parallelself";

export const loadParallelSelves  = () => { const r = lsGet(PARALLEL_SELF_KEY); return r ? JSON.parse(r) : []; };

export const saveParallelSelves  = (p) => lsSet(PARALLEL_SELF_KEY, JSON.stringify(p));


export const recordParallelSelf = (name, role, scenario, keySkill) => {
  const selves = loadParallelSelves();
  selves.push({ name: name||"???", role: role||"알 수 없음", scenario: scenario||"", keySkill: keySkill||"", savedAt: new Date().toISOString() });
  saveParallelSelves(selves);
};

export const getParallelSelfEncounter = () => {
  const cycle = loadCycleCount();
  if (cycle < 4) return null; // 4회차부터 등장
  const selves = loadParallelSelves();
  if (selves.length === 0) return null;
  return selves[selves.length - 1];
};

export const CURSE_RING_KEY   = "taleforge-cursering";

export const loadCurseRing    = () => { const r = lsGet(CURSE_RING_KEY); return r ? JSON.parse(r) : {}; };

export const saveCurseRing    = (c) => lsSet(CURSE_RING_KEY, JSON.stringify(c));


export const recordCurseRingAction = (actionType) => {
  const ring = loadCurseRing();
  if (!ring[actionType]) ring[actionType] = { count: 0, penaltyLevel: 0 };
  ring[actionType].count++;
  const def = CURSE_RING_ACTIONS[actionType];
  if (def && ring[actionType].count >= def.threshold) {
    ring[actionType].penaltyLevel = Math.floor(ring[actionType].count / def.threshold);
  }
  saveCurseRing(ring);
  return ring[actionType];
};

export const getActiveCurseRings = () => {
  const ring = loadCurseRing();
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return Object.entries(ring)
    .filter(([, v]) => v.penaltyLevel > 0)
    .map(([type, v]) => ({ type, ...v, ...CURSE_RING_ACTIONS[type] }));
};

export const CYCLE_STATS_KEY   = "taleforge-cyclestats";

export const loadCycleStats    = () => { const r = lsGet(CYCLE_STATS_KEY); return r ? JSON.parse(r) : { totalDeaths:0, totalTurns:0, killedEnemies:{}, usedSkills:{}, visitedScenarios:{} }; };

export const saveCycleStats    = (s) => lsSet(CYCLE_STATS_KEY, JSON.stringify(s));


export const recordStatDeath = () => {
  const s = loadCycleStats();
  s.totalDeaths = (s.totalDeaths||0) + 1;
  saveCycleStats(s);
};

export const recordStatTurn = () => {
  const s = loadCycleStats();
  s.totalTurns = (s.totalTurns||0) + 1;
  saveCycleStats(s);
};

export const recordStatKill = (enemyName) => {
  if (!enemyName) return;
  const s = loadCycleStats();
  if (!s.killedEnemies) s.killedEnemies = {};
  s.killedEnemies[enemyName] = (s.killedEnemies[enemyName]||0) + 1;
  saveCycleStats(s);
};

export const recordStatScenario = (scenarioName) => {
  if (!scenarioName) return;
  const s = loadCycleStats();
  if (!s.visitedScenarios) s.visitedScenarios = {};
  s.visitedScenarios[scenarioName] = (s.visitedScenarios[scenarioName]||0) + 1;
  saveCycleStats(s);
};

export const getCycleStatsSummary = () => {
  const s = loadCycleStats();
  const cycle = loadCycleCount();
  const topEnemy = Object.entries(s.killedEnemies||{}).sort((a,b)=>b[1]-a[1])[0];
  const topScenario = Object.entries(s.visitedScenarios||{}).sort((a,b)=>b[1]-a[1])[0];
  return {
    totalDeaths: s.totalDeaths||0,
    totalTurns: s.totalTurns||0,
    totalCycles: cycle,
    topEnemy: topEnemy ? { name: topEnemy[0], count: topEnemy[1] } : null,
    topScenario: topScenario ? { name: topScenario[0], count: topScenario[1] } : null,
  };
};

export const INJURY_MARK_KEY   = "taleforge-injurymarks";

export const loadInjuryMarks   = () => { const r = lsGet(INJURY_MARK_KEY); return r ? JSON.parse(r) : []; };

export const saveInjuryMarks   = (m) => lsSet(INJURY_MARK_KEY, JSON.stringify(m));


export const recordInjury = (part) => {
  if (!INJURY_PART_DEFS[part]) return;
  const marks = loadInjuryMarks();
  const existing = marks.find(m => m.part === part);
  if (existing) {
    existing.count++;
    if (existing.count >= 3) existing.isStrength = true;
  } else {
    marks.push({ part, count: 1, isStrength: false });
  }
  saveInjuryMarks(marks);
};

export const getInjuryEffects = () => {
  const marks = loadInjuryMarks();
  const cycle = loadCycleCount();
  if (cycle < 1 || marks.length === 0) return [];
  return marks.map(m => {
    const def = INJURY_PART_DEFS[m.part];
    if (!def) return null;
    return { ...m, ...def, desc: m.isStrength ? def.strongDesc : def.weakDesc, bonus: m.isStrength ? def.bonusStrong : def.bonusWeak };
  }).filter(Boolean);
};

export const PAST_THEME_KEY   = "taleforge-pasttheme";

export const loadPastTheme    = () => { const r = lsGet(PAST_THEME_KEY); return r ? JSON.parse(r) : null; };

export const savePastTheme    = (t) => lsSet(PAST_THEME_KEY, JSON.stringify(t));


export const recordPastTheme = (endingType) => {
  const theme = ENDING_THEMES[endingType] || ENDING_THEMES.neutral;
  savePastTheme({ type: endingType, ...theme, recordedAt: new Date().toISOString() });
};

export const getPastTheme = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadPastTheme();
};

export const MEMORY_DISTORT_KEY   = "taleforge-memorydistort";

export const loadMemoryDistort    = () => { const r = lsGet(MEMORY_DISTORT_KEY); return r ? JSON.parse(r) : { distortionLevel: 0, falseMemories: [] }; };

export const saveMemoryDistort    = (d) => lsSet(MEMORY_DISTORT_KEY, JSON.stringify(d));


export const recordMemoryDistort = (wil) => {
  const d = loadMemoryDistort();
  // WIL 스탯이 높을수록 왜곡 감소
  const distortionBase = Math.max(0, 60 - (wil || 30));
  const distortionNoise = Math.floor(Math.random() * 20) - 10;
  d.distortionLevel = Math.max(0, Math.min(100, distortionBase + distortionNoise));
  // 왜곡 수준이 40 이상이면 거짓 기억 1개 주입
  if (d.distortionLevel >= 40) {
    const fm = FALSE_MEMORY_POOL[Math.floor(Math.random() * FALSE_MEMORY_POOL.length)];
    if (!d.falseMemories.includes(fm)) {
      d.falseMemories.push(fm);
    }
  }
  saveMemoryDistort(d);
};

export const getMemoryDistortStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const d = loadMemoryDistort();
  const lvl = d.distortionLevel || 0;
  const accuracy = lvl < 20 ? "선명한" : lvl < 40 ? "약간 흐릿한" : lvl < 70 ? "많이 왜곡된" : "심하게 왜곡된";
  return { distortionLevel: lvl, accuracy, falseMemories: d.falseMemories||[] };
};

export const AGE_PARADOX_KEY   = "taleforge-ageparadox";

export const loadAgeParadox    = () => { const r = lsGet(AGE_PARADOX_KEY); return r ? JSON.parse(r) : null; };

export const saveAgeParadox    = (a) => lsSet(AGE_PARADOX_KEY, JSON.stringify(a));


export const recordAgeParadox = (deathAgeType) => {
  // deathAgeType: "elder"|"young"|"prime"
  const def = AGE_PARADOX_DEFS[deathAgeType];
  if (!def) return;
  saveAgeParadox({ type: deathAgeType, ...def, recordedAt: new Date().toISOString() });
};

export const getAgeParadoxBonus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadAgeParadox();
};

export const SUMMON_LEGACY_KEY   = "taleforge-summonlegacy";

export const loadSummonLegacy    = () => { const r = lsGet(SUMMON_LEGACY_KEY); return r ? JSON.parse(r) : []; };

export const saveSummonLegacy    = (s) => lsSet(SUMMON_LEGACY_KEY, JSON.stringify(s));


export const recordSummonLegacy = (name, type, bond, scenario) => {
  if (!name) return;
  const legacy = loadSummonLegacy();
  const existing = legacy.find(s => s.name === name);
  if (existing) {
    existing.bond = Math.min(10, (existing.bond||1) + 1);
    existing.appearances = (existing.appearances||1) + 1;
  } else {
    legacy.push({ name, type: type||"미지의 존재", bond: bond||1, scenario: scenario||"", appearances: 1, recordedAt: new Date().toISOString() });
  }
  saveSummonLegacy(legacy);
};

export const getSummonLegacies = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadSummonLegacy().filter(s => s.bond >= 2); // 유대 2 이상만 표시
};

export const GRUDGE_WEAPON_KEY   = "taleforge-grudgeweapon";

export const loadGrudgeWeapons   = () => { const r = lsGet(GRUDGE_WEAPON_KEY); return r ? JSON.parse(r) : []; };

export const saveGrudgeWeapons   = (w) => lsSet(GRUDGE_WEAPON_KEY, JSON.stringify(w));


export const recordGrudgeWeapon = (weaponName, killerName, scenario) => {
  if (!weaponName) return;
  const weapons = loadGrudgeWeapons();
  const existing = weapons.find(w => w.weaponName === weaponName);
  if (existing) {
    existing.times = (existing.times||1) + 1;
    existing.power = Math.min(5, Math.floor(existing.times / 2) + 1);
  } else {
    weapons.push({ weaponName, killerName: killerName||"알 수 없는 적", power: 1, scenario: scenario||"", times: 1, recordedAt: new Date().toISOString() });
  }
  saveGrudgeWeapons(weapons);
};

export const getGrudgeWeapons = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return loadGrudgeWeapons();
};

export const WORLD_TREE_KEY   = "taleforge-worldtree";

export const loadWorldTree    = () => { const r = lsGet(WORLD_TREE_KEY); return r ? JSON.parse(r) : { level:0, totalRestored:0, branches:[] }; };

export const saveWorldTree    = (t) => lsSet(WORLD_TREE_KEY, JSON.stringify(t));

export const loadWorldTreeLevel = () => loadWorldTree().level || 0;

window.loadWorldTreeLevel = loadWorldTreeLevel;

export const growWorldTree = (endingType) => {
  const tree = loadWorldTree();
  const gain = endingType === "hero" ? 2 : endingType === "sacrifice" ? 2 : endingType === "villain" ? 0 : 1;
  tree.totalRestored = (tree.totalRestored||0) + gain;
  const newLevel = Math.min(5, Math.floor(tree.totalRestored / 3));
  const didLevelUp = newLevel > (tree.level||0);
  tree.level = newLevel;
  if (didLevelUp) {
    const stage = WORLD_TREE_STAGES[newLevel];
    tree.branches = tree.branches || [];
    tree.branches.push({ level: newLevel, label: stage.label, recordedAt: new Date().toISOString() });
  }
  saveWorldTree(tree);
  return { level: newLevel, didLevelUp, stage: WORLD_TREE_STAGES[newLevel] };
};

export const getWorldTreeStatus = () => {
  const tree = loadWorldTree();
  const level = tree.level || 0;
  return { ...tree, stage: WORLD_TREE_STAGES[level] };
};
