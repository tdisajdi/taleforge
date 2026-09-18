// 스킬 강화 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { SKILL_ENHANCE_TIERS, STAT_DEFS } from '../data/010-스킬-강화-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { loadStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { lsDel, lsGet, lsSet } from '../utils.js';
import { saveSkillSP } from './002-스킬-시스템.js';

export const SKILL_ENHANCE_KEY = "taleforge-skill-enhance";

export const loadSkillEnhance = () => { const r = lsGet(SKILL_ENHANCE_KEY); return r ? JSON.parse(r) : {}; };

export const saveSkillEnhance = (d) => lsSet(SKILL_ENHANCE_KEY, JSON.stringify(d));

export const clearSkillEnhance = () => lsDel(SKILL_ENHANCE_KEY);

export const getSkillEnhanceLevel = (skillId) => {
  const data = loadSkillEnhance();
  return data[skillId] || 0;
};

export const getSkillEnhanceCost = (skillId) => {
  const level = getSkillEnhanceLevel(skillId);
  if (level >= 5) return null;
  const tier = SKILL_ENHANCE_TIERS[level];
  return { ...tier, currentLevel: level, nextLevel: level + 1 };
};

export const enhanceSkill = (skillId) => {
  const level = getSkillEnhanceLevel(skillId);
  if (level >= 5) return { success: false, reason: "이미 최대 강화 단계입니다." };
  const tier = SKILL_ENHANCE_TIERS[level];
  if (!tier) return { success: false, reason: "강화 데이터 오류." };
  if (S.skillSP < tier.spCost) return { success: false, reason: `SP ${tier.spCost} 부족. (현재: ${S.skillSP})` };
  if (S.gold < tier.goldCost) return { success: false, reason: `골드 ${tier.goldCost} 부족.` };
  // 비용 차감
  S.skillSP -= tier.spCost;
  S.gold -= tier.goldCost;
  saveSkillSP(S.skillSP);
  saveGold(S.gold);
  // 최대 골드 기록
  const _curMaxGold = loadStats?.()?.maxGold||0;
  if(S.gold > _curMaxGold && typeof window.updateStats==='function') window.updateStats('maxGold', S.gold);
  // 강화 저장
  const data = loadSkillEnhance();
  data[skillId] = level + 1;
  saveSkillEnhance(data);
  return { success: true, newLevel: level + 1, tier };
};

export const getSkillEnhanceDesc = (skillId, def) => {
  const level = getSkillEnhanceLevel(skillId);
  if (level === 0) return "";
  const tier = SKILL_ENHANCE_TIERS[level - 1];
  const parts = [];
  if (def.mpCost > 0) parts.push(`MP소모 -${Math.round(def.mpCost * tier.bonus * 0.3)}`);
  if (def.hpRestore > 0) parts.push(`HP회복 +${Math.round(def.hpRestore * tier.bonus)}`);
  if (def.statBoost && Object.keys(def.statBoost).length > 0) {
    const boosts = Object.entries(def.statBoost).map(([k,v])=>`${k.toUpperCase()}+${Math.round(v*tier.bonus)}`).join(' ');
    parts.push(boosts);
  }
  // ── [신규] 표준 effects.kind 스키마 기반 스킬의 강화 설명 ──
  if (def.effects && def.effects.kind) {
    const pct = Math.round(tier.bonus * 100);
    switch (def.effects.kind) {
      case 'damage': parts.push(`피해량 +${pct}%`); break;
      case 'heal': parts.push(`회복량 +${pct}%`); break;
      case 'summon': parts.push(`소환수 능력치 +${pct}%`); break;
      case 'buff': case 'debuff': case 'statBoost': parts.push(`효과 수치 +${pct}%`); break;
    }
  }
  return parts.join(' · ');
};

export const SECRETS_KEY   = "taleforge-secrets";

export const loadSecrets   = () => { const r = lsGet(SECRETS_KEY); return r ? JSON.parse(r) : []; };

export const saveSecrets   = (s) => lsSet(SECRETS_KEY, JSON.stringify(s));

export const clearSecrets  = () => lsDel(SECRETS_KEY);

export const HIGHLIGHTS_KEY  = "taleforge-highlights";

export const loadHighlights  = () => { const r = lsGet(HIGHLIGHTS_KEY); return r ? JSON.parse(r) : []; };

export const saveHighlights  = (h) => lsSet(HIGHLIGHTS_KEY, JSON.stringify(h));


export const MEMORY_KEY = "taleforge-memory";

export const EMPTY_MEMORY = () => ({ core:"", mid:"", coreUpdatedAt:0, midUpdatedAt:0, coreTurn:0, midTurn:0, facts:[] });

export const loadMemory  = () => { const r = lsGet(MEMORY_KEY); const m = r ? JSON.parse(r) : EMPTY_MEMORY(); if(!Array.isArray(m.facts)) m.facts = []; return m; };

export const saveMemory  = (m) => lsSet(MEMORY_KEY, JSON.stringify(m));

export const clearMemory = () => lsDel(MEMORY_KEY);

export const TITLES_STORAGE = "taleforge-titles";

export const loadTitles = () => { const r = lsGet(TITLES_STORAGE); return r ? JSON.parse(r) : []; };

export const saveTitles = (t) => lsSet(TITLES_STORAGE, JSON.stringify(t));

export const ALL_STAT_KEYS = [...STAT_DEFS.combat, ...STAT_DEFS.social, ...STAT_DEFS.mental, ...STAT_DEFS.survival, ...STAT_DEFS.mystery].map(s => s.id);

export const getStatInfo = (id) => {
  return [...STAT_DEFS.combat, ...STAT_DEFS.social, ...STAT_DEFS.mental, ...STAT_DEFS.survival, ...STAT_DEFS.mystery].find(s => s.id === id);
};

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_8(){
window.addTitle = (title) => {
  const existing = loadTitles();
  if (existing.find(t => t.id === title.id)) return false;
  saveTitles([...existing, { ...title, earnedAt: new Date().toISOString() }]);
  return true;
};
}

