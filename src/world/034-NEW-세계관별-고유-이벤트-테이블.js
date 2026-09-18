// [NEW] 세계관별 고유 이벤트 테이블
// Auto-extracted from taleforge.html (original section banner preserved above).
import { SCENARIO_EVENTS } from '../data/034-NEW-세계관별-고유-이벤트-테이블.js';

export const getScenarioEvent = (scenario) => {
  const key = scenario && (
    scenario.includes("아포칼") ? "apocalypse" :
    scenario.includes("신화") ? "mythology" :
    scenario.includes("스팀") ? "steampunk" : null
  );
  if (!key || !SCENARIO_EVENTS[key]) return null;
  const pool = SCENARIO_EVENTS[key];
  const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const event of pool) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  return pool[0];
};
