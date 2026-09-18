// 환생 누적 시스템 (1~10번)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { AWAKENED_JOBS, KARMA_EFFECTS, WEAPON_TYPES, _FAME_LABELS } from '../data/014-환생-누적-시스템-110번.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { lsDel, lsGet, lsSet } from '../utils.js';
import { growDarkEcho } from './019-71100번-환생-누적-시스템.js';

export const MEMORY_FRAGMENTS_KEY = "taleforge-memfrags";

export const loadMemoryFragments = () => { const r = lsGet(MEMORY_FRAGMENTS_KEY); return r ? JSON.parse(r) : []; };

export const saveMemoryFragments = (f) => lsSet(MEMORY_FRAGMENTS_KEY, JSON.stringify(f));


export const addMemoryFragment = (text, type="general") => {
  const frags = loadMemoryFragments();
  const newFrag = { id: Date.now(), text: text.slice(0, 120), type, createdAt: new Date().toISOString() };
  saveMemoryFragments([...frags, newFrag]); // 무제한
};

export const getKarmaEffect = (score) => Object.values(KARMA_EFFECTS).find(e => score >= e.threshold && score <= e.maxThreshold) || KARMA_EFFECTS.neutral;

export const PAST_RELICS_KEY = "taleforge-pastrelics";

export const loadPastRelics = () => { const r = lsGet(PAST_RELICS_KEY); return r ? JSON.parse(r) : []; };


export const checkRelicCondition = (pastLife, condition) => {
  if (!pastLife) return false;
  if (condition === "karma_good")  return (pastLife.karmaScore || 50) <= 30;
  if (condition === "karma_bad")   return (pastLife.karmaScore || 50) >= 80;
  const titles = pastLife.titles || [];
  return titles.some(t => t.id === condition);
};

export const ARTIFACT_SHARDS_KEY = "taleforge-artifactshards";

export const loadArtifactShards = () => { const r = lsGet(ARTIFACT_SHARDS_KEY); return r ? JSON.parse(r) : 0; };

export const saveArtifactShards = (n) => lsSet(ARTIFACT_SHARDS_KEY, String(n));


export const ARTIFACT_MAX_SHARDS = 5;

export const SOUL_WEAPON_KEY = "taleforge-soulweapon";

export const loadSoulWeapon = () => { const r = lsGet(SOUL_WEAPON_KEY); return r ? JSON.parse(r) : null; };

export const saveSoulWeapon = (w) => lsSet(SOUL_WEAPON_KEY, JSON.stringify(w));


export const WEAPON_AFFINITY_KEY = "taleforge-weaponaffinity";

export const loadWeaponAffinity = () => { const r = lsGet(WEAPON_AFFINITY_KEY); return r ? JSON.parse(r) : {}; };

export const saveWeaponAffinity = (w) => lsSet(WEAPON_AFFINITY_KEY, JSON.stringify(w));


export const incrementWeaponAffinity = (type) => {
  if (!WEAPON_TYPES[type]) return;
  const aff = loadWeaponAffinity();
  aff[type] = (aff[type] || 0) + 1;
  saveWeaponAffinity(aff);
};

export const getTopWeapon = () => {
  const aff = loadWeaponAffinity();
  if (!Object.keys(aff).length) return null;
  return Object.entries(aff).sort((a,b) => b[1]-a[1])[0][0];
};

export const FAME_LEGACY_KEY = "taleforge-famelegacy";

export const loadFameLegacy = () => { const r = lsGet(FAME_LEGACY_KEY); return r ? JSON.parse(r) : null; };

export const saveFameLegacy = (f) => lsSet(FAME_LEGACY_KEY, JSON.stringify(f));

export function propagateFame(reason, amount){
  try{
    if(!S.stats) return;
    // [B7 FIX] 정식 업보 스탯 키는 krma인데 오타(karma)로 다른 필드를
    // 참조해 항상 0이 되던 버그. 이로 인해 else 분기(악명/growDarkEcho,
    // B26의 "어둠의 메아리" 시스템)가 전혀 실행되지 않고 있었다.
    const karma = S.stats.krma || 0;
    if(karma >= 0) S.stats.rep = Math.min(999, (S.stats.rep||0) + (amount||1));
    else {
      S.stats.fear = Math.min(999, (S.stats.fear||0) + (amount||1));
      if(typeof growDarkEcho==='function') growDarkEcho(amount||1, reason);
    }
    if(typeof window.updateHeader === 'function') window.updateHeader();
  }catch(e){ console.warn('[propagateFame]', e); }
}
window.propagateFame = propagateFame;

window.propagateFame = propagateFame;

export const determineFame = (rep, fear, karmaScore) => {
  if (rep >= fear && rep >= 60) {
    const level = Math.min(5, Math.ceil(rep / 20));
    return { type:"hero",    level, label: _FAME_LABELS.hero[level-1] || '영웅' };
  } else if (fear > rep && fear >= 60) {
    const level = Math.min(5, Math.ceil(fear / 20));
    return { type:"villain", level, label: _FAME_LABELS.villain[level-1] || '악당' };
  }
  return { type:"neutral", level:0, label:"무명인" };
};

export const CYCLE_COUNT_KEY = "taleforge-cyclecount";

export const loadCycleCount = () => { const r = lsGet(CYCLE_COUNT_KEY); return r ? parseInt(r,10) : 0; };

export const v36_getReincarnationCount = () => loadCycleCount();

window.v36_getReincarnationCount = v36_getReincarnationCount;

export const saveCycleCount = (n) => lsSet(CYCLE_COUNT_KEY, String(n));

export const getUnlockedAwakenedJobs = () => {
  const cycle = loadCycleCount();
  return AWAKENED_JOBS.filter(j => cycle >= j.minCycle);
};

export const SKILL_USAGE_KEY = "taleforge-skillusage";

export const loadSkillUsage = () => { const r = lsGet(SKILL_USAGE_KEY); return r ? JSON.parse(r) : {}; };

export const saveSkillUsage = (u) => lsSet(SKILL_USAGE_KEY, JSON.stringify(u));


export const recordSkillUsage = (skillId) => {
  const usage = loadSkillUsage();
  usage[skillId] = (usage[skillId] || 0) + 1;
  saveSkillUsage(usage);
};
