// [NEW] 회차 연보 (엔딩 히스토리 갤러리)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { ENDING_THEMES } from '../data/016-2130번-시스템.js';
import { CLEAR_GOALS } from '../data/030-NEW-동적-클리어-목표-시스템.js';
import { lsDel, lsGet, lsSet } from '../utils.js';

export const ANNALS_KEY      = "taleforge-annals";

export const loadAnnals      = () => { const r = lsGet(ANNALS_KEY); return r ? JSON.parse(r) : []; };

export const saveAnnals      = (a) => lsSet(ANNALS_KEY, JSON.stringify(a));


export const recordAnnalEntry = (charName, race, role, scenario, endingType, goalId, cycle, highlights = []) => {
  const annals = loadAnnals();
  const theme = ENDING_THEMES[endingType] || ENDING_THEMES.neutral;
  const goal = CLEAR_GOALS.find(g => g.id === goalId);
  annals.push({
    cycle, charName, race, role, scenario,
    endingType, endingLabel: theme.label, endingIcon: theme.icon, endingColor: theme.color,
    goalId, goalName: goal?.name || "자유 플레이",
    highlights: highlights,
    recordedAt: new Date().toISOString(),
  });
  // 개수 제한 없음 (전체 저장)
  saveAnnals(annals);
  return annals;
};

export const getAnnalStats = () => {
  const annals = loadAnnals();
  if (!annals.length) return null;
  const endingCounts = {};
  const raceCounts = {};
  const roleCounts = {};
  const scenarioCounts = {};
  annals.forEach(a => {
    endingCounts[a.endingType] = (endingCounts[a.endingType] || 0) + 1;
    raceCounts[a.race] = (raceCounts[a.race] || 0) + 1;
    roleCounts[a.role] = (roleCounts[a.role] || 0) + 1;
    scenarioCounts[a.scenario] = (scenarioCounts[a.scenario] || 0) + 1;
  });
  const mostUsedRace = Object.entries(raceCounts).sort((a,b)=>b[1]-a[1])[0];
  const favoriteEnding = Object.entries(endingCounts).sort((a,b)=>b[1]-a[1])[0];
  return { total: annals.length, endingCounts, raceCounts, roleCounts, scenarioCounts, mostUsedRace, favoriteEnding };
};
