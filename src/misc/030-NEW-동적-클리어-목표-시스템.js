// [NEW] 동적 클리어 목표 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { CLEAR_GOALS } from '../data/030-NEW-동적-클리어-목표-시스템.js';
import { lsDel, lsGet, lsSet } from '../utils.js';

export const CYCLE_GOAL_KEY    = "taleforge-cycle-goal";

export const loadCycleGoal     = () => { const r = lsGet(CYCLE_GOAL_KEY); return r ? JSON.parse(r) : null; };
window.loadCycleGoal = loadCycleGoal;

export const saveCycleGoal     = (g) => lsSet(CYCLE_GOAL_KEY, JSON.stringify(g));
window.saveCycleGoal = saveCycleGoal;


export const assignRandomGoal = (scenario, cycle) => {
  const eligible = CLEAR_GOALS.filter(g => {
    if (g.scenarios) return g.scenarios.some(s => scenario && scenario.includes(s === "medieval" ? "중세" : s === "mythology" ? "신화" : s));
    return true;
  });
  const idx = Math.floor(Math.random() * eligible.length);
  const goal = { ...eligible[idx], assignedAt: new Date().toISOString(), progress: 0, completed: false };
  saveCycleGoal(goal);
  return goal;
};

export const updateGoalProgress = (amount = 1) => {
  const goal = loadCycleGoal();
  if (!goal || goal.completed) return goal;
  goal.progress = (goal.progress || 0) + amount;
  // 캐릭터 생성 때 고른 목표(난이도 기반 targetProgress)는 100보다 더 걸릴 수 있다.
  if (goal.progress >= (goal.targetProgress || 100)) goal.completed = true;
  saveCycleGoal(goal);
  return goal;
};
window.updateGoalProgress = updateGoalProgress;
