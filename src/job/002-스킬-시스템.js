// 스킬 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { lsDel, lsGet, lsSet } from '../utils.js';

export const SKILLS_KEY     = "taleforge-skills";

export const SKILL_SP_KEY   = "taleforge-skillsp";

export const loadSkills     = () => { const r = lsGet(SKILLS_KEY); return r ? JSON.parse(r) : {}; };

export const saveSkills     = (s) => lsSet(SKILLS_KEY, JSON.stringify(s));

export const clearSkills    = () => lsDel(SKILLS_KEY);

export const loadSkillSP    = () => { const r = lsGet(SKILL_SP_KEY); return r ? parseInt(r,10) : 0; };

export const saveSkillSP    = (n) => lsSet(SKILL_SP_KEY, String(n));

export const clearSkillSP   = () => lsDel(SKILL_SP_KEY);
