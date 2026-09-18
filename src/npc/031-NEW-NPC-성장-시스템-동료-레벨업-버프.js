// [NEW] NPC 성장 시스템 (동료 레벨업 + 버프)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { NPC_GROWTH_SKILLS } from '../data/031-NEW-NPC-성장-시스템-동료-레벨업-버프.js';
import { lsDel, lsGet, lsSet } from '../utils.js';

export const NPC_GROWTH_KEY    = "taleforge-npc-growth";

if(typeof window.loadNpcGrowth==='undefined'){ window.loadNpcGrowth = () => { const r = lsGet(NPC_GROWTH_KEY); return r ? JSON.parse(r) : {}; }; }

export var saveNpcGrowth       = (d) => lsSet(NPC_GROWTH_KEY, JSON.stringify(d));
window.saveNpcGrowth = saveNpcGrowth;

export const clearNpcGrowth    = () => lsDel(NPC_GROWTH_KEY);

export const growNpc = (npcName, bondIncrease = 5) => {
  const data = window.loadNpcGrowth();
  if (!data[npcName]) data[npcName] = { level: 1, exp: 0, totalBond: 0, skills: [] };
  const npc = data[npcName];
  npc.exp += bondIncrease;
  npc.totalBond += bondIncrease;
  // 레벨업 체크 (exp 임계치: 20, 50, 90, 150)
  const thresholds = [0, 20, 50, 90, 150];
  const newLevel = thresholds.filter(t => npc.exp >= t).length;
  const didLevelUp = newLevel > npc.level;
  if (didLevelUp) {
    npc.level = newLevel;
    const newSkill = NPC_GROWTH_SKILLS.find(s => s.level === newLevel);
    if (newSkill && !npc.skills.find(s => s.id === newSkill.id)) npc.skills.push(newSkill);
  }
  saveNpcGrowth(data);
  return { npc, didLevelUp, newLevel };
};

export const getNpcGrowthData = (npcName) => {
  const data = window.loadNpcGrowth();
  return data[npcName] || { level: 1, exp: 0, totalBond: 0, skills: [] };
};

export const getCompanionBuffs = () => {
  // 최고 레벨 동료의 스킬 버프를 합산
  const data = window.loadNpcGrowth();
  const allSkills = [];
  Object.values(data).forEach(npc => {
    if (npc.skills) npc.skills.forEach(s => { if (!allSkills.find(x => x.id === s.id)) allSkills.push(s); });
  });
  return allSkills;
};
