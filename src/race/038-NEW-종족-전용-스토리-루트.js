// [NEW] 종족 전용 스토리 루트
// Auto-extracted from taleforge.html (original section banner preserved above).
import { RACE_EXCLUSIVE_CONTENT } from '../data/038-NEW-종족-전용-스토리-루트.js';
import { lsDel, lsGet, lsSet } from '../utils.js';

export const RACE_ROUTES_KEY   = "taleforge-race-routes";

export const loadRaceRoutes    = () => { const r = lsGet(RACE_ROUTES_KEY); return r ? JSON.parse(r) : {}; };

export const saveRaceRoutes    = (d) => lsSet(RACE_ROUTES_KEY, JSON.stringify(d));


export const unlockRaceRoute = (race, routeId) => {
  const routes = loadRaceRoutes();
  if (!routes[race]) routes[race] = [];
  if (!routes[race].includes(routeId)) routes[race].push(routeId);
  saveRaceRoutes(routes);
};

export const getRaceContent = (race) => {
  return RACE_EXCLUSIVE_CONTENT[race] || null;
};
