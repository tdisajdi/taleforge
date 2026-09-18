// 클리어 보상 시스템 (시나리오 클리어 시 영구 아이템/스킬)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { CLEAR_SKILLS } from '../data/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { lsDel, lsGet, lsSet } from '../utils.js';

export const CLEAR_REWARDS_KEY   = "taleforge-clearrewards";

export const loadClearRewards    = () => { const r = lsGet(CLEAR_REWARDS_KEY); return r ? JSON.parse(r) : []; };

export const saveClearRewards    = (r) => lsSet(CLEAR_REWARDS_KEY, JSON.stringify(r));

export const getAllClearSkillDefs = () => {
  return [...Object.values(CLEAR_SKILLS).flat()];
};

export const LEVEL_KEY      = "taleforge-level";

export const EXP_KEY        = "taleforge-exp";

export const loadPlayerLevel = () => { const r = lsGet(LEVEL_KEY); return r ? parseInt(r, 10) : 1; };

export const savePlayerLevel = (n) => lsSet(LEVEL_KEY, String(n));

export const loadPlayerExp   = () => { const r = lsGet(EXP_KEY);   return r ? parseInt(r, 10) : 0; };

export const savePlayerExp   = (n) => lsSet(EXP_KEY,   String(n));

export const clearPlayerLevel = () => lsDel(LEVEL_KEY);
