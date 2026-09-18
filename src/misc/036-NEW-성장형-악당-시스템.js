// [NEW] 성장형 악당 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { VILLAIN_THREAT_LEVELS } from '../data/036-NEW-성장형-악당-시스템.js';
import { lsDel, lsGet, lsSet } from '../utils.js';

export const VILLAIN_KEY       = "taleforge-villain-growth";

export const loadVillainData   = () => { const r = lsGet(VILLAIN_KEY); return r ? JSON.parse(r) : { name:null, power:0, dominion:0, minions:[], threat:"low" }; };

export const saveVillainData   = (v) => lsSet(VILLAIN_KEY, JSON.stringify(v));

export const clearVillainData  = () => lsDel(VILLAIN_KEY);

export const tickVillainGrowth = (playerAction = "none") => {
  const villain = loadVillainData();
  let powerGain = 5; // 기본 성장
  if (playerAction === "hero") powerGain = 0;        // 영웅 행동 시 성장 멈춤
  if (playerAction === "retreat") powerGain = 10;    // 도주 시 빠른 성장
  if (playerAction === "idle") powerGain = 8;        // 아무것도 안 할 때
  villain.power = Math.min(100, (villain.power||0) + powerGain);
  villain.dominion = Math.min(100, (villain.dominion||0) + Math.floor(powerGain * 0.7));
  // 위협 단계 업데이트
  const newThreat = [...VILLAIN_THREAT_LEVELS].reverse().find(t => villain.power >= t.threshold);
  villain.threat = newThreat?.id || "low";
  saveVillainData(villain);
  return villain;
};

export const getVillainStatus = () => {
  const villain = loadVillainData();
  const threat = VILLAIN_THREAT_LEVELS.find(t => t.id === villain.threat) || VILLAIN_THREAT_LEVELS[0];
  return { ...villain, threatDef: threat };
};
