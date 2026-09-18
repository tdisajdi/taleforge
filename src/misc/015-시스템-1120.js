// 시스템 11~20
// Auto-extracted from taleforge.html (original section banner preserved above).
import { BLOODLINE_EVOLUTION, DEATH_BONUS_DEFS, FORBIDDEN_SKILL_DEFS, INHERITABLE_STATS, TRAUMA_DEFS } from '../data/015-시스템-1120.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { growButterflyIndex } from '../progression/019-71100번-환생-누적-시스템.js';
import { lsDel, lsGet, lsSet } from '../utils.js';

export const FORBIDDEN_SKILLS_KEY = "taleforge-forbiddenskills";

export const loadForbiddenSkills = () => { const r = lsGet(FORBIDDEN_SKILLS_KEY); return r ? JSON.parse(r) : []; };

export const saveForbiddenSkills = (s) => lsSet(FORBIDDEN_SKILLS_KEY, JSON.stringify(s));


export const unlockForbiddenSkill = (conditionKey) => {
  const already = loadForbiddenSkills();
  const toUnlock = FORBIDDEN_SKILL_DEFS.filter(f =>
    f.unlockCondition === conditionKey && !already.includes(f.id)
  );
  if (toUnlock.length > 0) {
    saveForbiddenSkills([...already, ...toUnlock.map(f => f.id)]);
  }
  return toUnlock;
};

export const getUnlockedForbiddenSkills = () => {
  const ids = loadForbiddenSkills();
  return FORBIDDEN_SKILL_DEFS.filter(f => ids.includes(f.id));
};

export const BUTTERFLY_KEY = "taleforge-butterfly";

export const loadButterfly = () => { const r = lsGet(BUTTERFLY_KEY); return r ? JSON.parse(r) : []; };

export const saveButterfly = (b) => lsSet(BUTTERFLY_KEY, JSON.stringify(b));


export const addButterflyEffect = (effectOrType, maybeData) => {
  const list = loadButterfly();
  const entry = (typeof effectOrType === 'object' && effectOrType !== null)
    ? { ...effectOrType, addedAt: new Date().toISOString() }
    : { type: effectOrType, data: maybeData, addedAt: new Date().toISOString() };
  list.push(entry);
  saveButterfly(list);
  // [연결] 파급력 있는(major) 사건은 나비 지수에도 반영
  if(entry.major && typeof growButterflyIndex==='function') growButterflyIndex(entry.impact||5);
};

export const PERM_STAT_KEY = "taleforge-perm-stat-bonus";

export const loadPermStatBonus = () => { const r = lsGet(PERM_STAT_KEY); return r ? JSON.parse(r) : {}; };

export const savePermStatBonus = (b) => lsSet(PERM_STAT_KEY, JSON.stringify(b));

export function rollPermStatBonus() {
  const count = Math.random() < 0.5 ? 2 : 3; // 50% 확률로 2개 또는 3개
  const pool = [...INHERITABLE_STATS];
  const picked = [];
  for(let i=0; i<count && pool.length>0; i++){
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx,1)[0]);
  }
  const perm = loadPermStatBonus();
  picked.forEach(k => { perm[k] = (perm[k]||0) + 2; });
  savePermStatBonus(perm);
  return picked; // 이번에 뽑힌 스탯 키 배열
}
window.rollPermStatBonus = rollPermStatBonus;

export const DEATH_BONUS_KEY = "taleforge-deathbonus";

export const loadDeathBonuses = () => { const r = lsGet(DEATH_BONUS_KEY); return r ? JSON.parse(r) : []; };

export const saveDeathBonuses = (b) => lsSet(DEATH_BONUS_KEY, JSON.stringify(b));


export const recordDeathCause = (trigger) => {
  const bonuses = loadDeathBonuses();
  const def = DEATH_BONUS_DEFS.find(d => d.trigger === trigger);
  if (def && !bonuses.includes(def.id)) {
    saveDeathBonuses([...bonuses, def.id]);
    return def;
  }
  // 이미 있으면 스택 보너스 (절반)
  return def || null;
};

export const getActiveDeathBonuses = () => {
  const ids = loadDeathBonuses();
  return DEATH_BONUS_DEFS.filter(d => ids.includes(d.id));
};

export const TRAUMA_KEY = "taleforge-trauma";

export const loadTraumas = () => { const r = lsGet(TRAUMA_KEY); return r ? JSON.parse(r) : {}; };

export const saveTraumas = (t) => lsSet(TRAUMA_KEY, JSON.stringify(t));

export const clearTraumas = () => lsDel(TRAUMA_KEY);

export const TRAUMA_IMMUNITY_THRESHOLD = 3;

export const recordTrauma = (type) => {
  if (!TRAUMA_DEFS[type]) return null;
  const traumas = loadTraumas();
  traumas[type] = (traumas[type] || 0) + 1;
  saveTraumas(traumas);
  if (traumas[type] >= TRAUMA_IMMUNITY_THRESHOLD) {
    return { ...TRAUMA_DEFS[type], type, immune: true, count: traumas[type] };
  }
  return { ...TRAUMA_DEFS[type], type, immune: false, count: traumas[type] };
};

export const getTraumaImmunities = () => {
  const traumas = loadTraumas();
  return Object.entries(traumas)
    .filter(([,count]) => count >= TRAUMA_IMMUNITY_THRESHOLD)
    .map(([type]) => ({ type, ...TRAUMA_DEFS[type] }));
};

export const LAST_WORD_KEY = "taleforge-lastword";

export const loadLastWord = () => { const r = lsGet(LAST_WORD_KEY); return r ? JSON.parse(r) : null; };

export const saveLastWord = (w) => lsSet(LAST_WORD_KEY, JSON.stringify(w));


export const classifyLastWordTone = (text) => {
  const t = text.toLowerCase();
  if (t.includes("복수") || t.includes("원한") || t.includes("반드시")) return "vengeful";
  if (t.includes("평화") || t.includes("좋았") || t.includes("행복") || t.includes("감사")) return "peaceful";
  if (t.includes("웃") || t.includes("ㅋ") || t.includes("재미")) return "humorous";
  if (t.includes("영웅") || t.includes("지키") || t.includes("위해")) return "heroic";
  return "tragic";
};

export const META_KNOWLEDGE_KEY = "taleforge-metaknowledge";

export const loadMetaKnowledge = () => { const r = lsGet(META_KNOWLEDGE_KEY); return r ? JSON.parse(r) : []; };

export const saveMetaKnowledge = (m) => lsSet(META_KNOWLEDGE_KEY, JSON.stringify(m));


export const addMetaKnowledge = (type, keyword, hint) => {
  const list = loadMetaKnowledge();
  if (!list.some(m => m.keyword === keyword)) {
    list.push({ type, keyword, hint, addedAt: new Date().toISOString() });
    saveMetaKnowledge(list);
  }
};

export const getMetaKnowledgeHints = () => {
  const list = loadMetaKnowledge();
  const cycle = loadCycleCount();
  if (cycle < 1 || list.length === 0) return [];
  return list;
};

export const BLOODLINE_KEY = "taleforge-bloodline";

export const loadBloodline = () => { const r = lsGet(BLOODLINE_KEY); return r ? JSON.parse(r) : {}; };

export const saveBloodline = (b) => lsSet(BLOODLINE_KEY, JSON.stringify(b));

export const clearBloodline = () => lsDel(BLOODLINE_KEY);

export const recordRacePlayed = (race) => {
  const bloodline = loadBloodline();
  bloodline[race] = (bloodline[race] || 0) + 1;
  saveBloodline(bloodline);
  return bloodline[race];
};

export const getEvolvedRace = (race) => {
  const bloodline = loadBloodline();
  const count = bloodline[race] || 0;
  const evolutions = BLOODLINE_EVOLUTION[race] || {};
  let evolved = race;
  let bonusMultiplier = 1;
  for (const [reqCount, name] of Object.entries(evolutions).sort((a,b) => parseInt(a)-parseInt(b))) {
    if (count >= parseInt(reqCount)) { evolved = name; bonusMultiplier = parseInt(reqCount) / 2; }
  }
  return { name: evolved, count, bonusMultiplier, isEvolved: evolved !== race };
};

export function checkEvolutionCondition(race){
  try{ return getEvolvedRace(race).isEvolved; }catch(e){ return false; }
}
window.checkEvolutionCondition = checkEvolutionCondition;

window.checkEvolutionCondition = checkEvolutionCondition;

export const FATE_VARIABLE_KEY = "taleforge-fatevariable";

export const loadFateVariable = () => { const r = lsGet(FATE_VARIABLE_KEY); return r ? JSON.parse(r) : { perfectClears:0, resistanceLevel:0 } };

export const saveFateVariable = (f) => lsSet(FATE_VARIABLE_KEY, JSON.stringify(f));


export const recordClearQuality = (score) => {
  const fv = loadFateVariable();
  if (score >= 70) {
    fv.perfectClears = (fv.perfectClears || 0) + 1;
    fv.resistanceLevel = Math.min(5, Math.floor(fv.perfectClears / 2));
  } else {
    fv.perfectClears = Math.max(0, (fv.perfectClears || 0) - 1);
    fv.resistanceLevel = Math.max(0, Math.floor((fv.perfectClears||0) / 2));
  }
  saveFateVariable(fv);
  return fv;
};

export const getFateResistance = () => {
  const fv = loadFateVariable();
  const level = fv.resistanceLevel || 0;
  if (level === 0) return null;
  const labels = ["", "약한 저항", "중간 저항", "강한 저항", "극한 저항", "세계의 분노"];
  const descriptions = [
    "",
    "세계가 당신의 패턴을 학습하기 시작했다. 판정이 약간 까다로워진다.",
    "세계가 당신에게 저항한다. 예상치 못한 변수가 자주 발생한다.",
    "세계가 강하게 저항한다. NPC들이 당신의 계획을 방해하려 한다.",
    "세계가 극렬히 저항한다. 행운이 등을 돌리고 함정이 곳곳에 깔린다.",
    "세계 전체가 당신에게 분노한다. 모든 것이 뒤틀린다. 하지만 성공하면 전설적인 보상.",
  ];
  return { level, label: labels[level], desc: descriptions[level] };
};

export const EXPLORED_MAPS_KEY = "taleforge-exploredmaps";

export const loadExploredMaps = () => { const r = lsGet(EXPLORED_MAPS_KEY); return r ? JSON.parse(r) : []; };

export const saveExploredMaps = (m) => lsSet(EXPLORED_MAPS_KEY, JSON.stringify(m));


export const addExploredLocation = (locationName, scenario, hint) => {
  const maps = loadExploredMaps();
  if (!maps.some(m => m.name === locationName)) {
    maps.push({ name:locationName, scenario, hint: hint||"", exploredAt: new Date().toISOString() });
      saveExploredMaps(maps);
  }
};

export const getExploredLocations = (scenario) => {
  const maps = loadExploredMaps();
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  return scenario ? maps.filter(m => m.scenario === scenario || !m.scenario) : maps;
};
