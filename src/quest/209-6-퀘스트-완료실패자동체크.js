// [6] 퀘스트 완료/실패/자동체크
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { addExp } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { addButterflyEffect } from '../misc/015-시스템-1120.js';
import { gainEvoEnergy } from '../misc/206-3-진화Evolution-시스템.js';
import { checkAchievements, unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { toast } from '../utils.js';
import { loadGSFlags } from '../world/145-⑥-세계-상태-DB.js';
import { getActiveQuests, getQuest, upsertQuest } from './141-②-퀘스트-DB.js';

export function completeQuest(questId) {
  try {
    if (typeof upsertQuest === 'function') upsertQuest(String(questId), { status:'completed' });
    const q = typeof getQuest === 'function' ? getQuest(String(questId)) : null;
    toast(`✅ 퀘스트 완료: ${q?.title || questId}`, 2500);
    // 업적
    unlockAchievement('first_quest');
    // 나비효과
    if (typeof addButterflyEffect === 'function')
      addButterflyEffect({ desc:`퀘스트 완료: ${q?.title||questId}`, impact:3, worldChange:'퀘스트가 완료됐다' });
    // 진화 에너지
    gainEvoEnergy(20, '퀘스트 완료');
    // 경험치
    if (q?.reward?.exp && typeof addExp === 'function') {
      addExp(q.reward.exp);
    }
    checkAchievements();
  } catch(e) {}
}
window.completeQuest = completeQuest;

export function failQuest(questId, reason='') {
  try {
    if (typeof upsertQuest === 'function') upsertQuest(String(questId), { status:'failed', failReason: reason });
    toast(`❌ 퀘스트 실패: ${questId}`, 2500);
  } catch(e) {}
}
window.failQuest = failQuest;

export function activateQuest(questId) {
  try {
    if (typeof upsertQuest === 'function') upsertQuest(String(questId), { status:'active' });
    toast(`📋 퀘스트 시작: ${questId}`, 2000);
  } catch(e) {}
}
window.activateQuest = activateQuest;

export function abandonQuest(questId) {
  try {
    if (typeof upsertQuest === 'function') upsertQuest(String(questId), { status:'abandoned' });
    toast(`📋 퀘스트 포기: ${questId}`, 2000);
  } catch(e) {}
}
window.abandonQuest = abandonQuest;

export function checkQuestCompletion() {
  try {
    const active = typeof getActiveQuests === 'function' ? getActiveQuests() : [];
    active.forEach(q => {
      if (!q.autoComplete) return;
      const cond = q.autoComplete;
      const gsF = typeof loadGSFlags === 'function' ? loadGSFlags() : {};
      if (cond.flag && gsF[cond.flag]) completeQuest(q.id);
      if (cond.turn && (S?.msgCount||0) >= cond.turn) completeQuest(q.id);
    });
  } catch(e) {}
}
window.checkQuestCompletion = checkQuestCompletion;

window.completeQuest       = completeQuest;

window.failQuest           = failQuest;

window.activateQuest       = activateQuest;

window.abandonQuest        = abandonQuest;

window.checkQuestCompletion = checkQuestCompletion;
