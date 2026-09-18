// ② 적 AI 행동 패턴
// Auto-extracted from taleforge.html (original section banner preserved above).
import { ENEMY_BEHAVIOR_PATTERNS } from '../data/246-②-적-AI-행동-패턴.js';

export function detectEnemyBehavior(text){
  if(!text) return null;
  const lc = text.toLowerCase();
  for(const [id, pat] of Object.entries(ENEMY_BEHAVIOR_PATTERNS)){
    if(pat.triggers.test(lc)) return { id, ...pat };
  }
  return null;
}
window.detectEnemyBehavior = detectEnemyBehavior;
