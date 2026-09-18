// 4. 종교 전용 NPC 풀
// Auto-extracted from taleforge.html (original section banner preserved above).
import { RELIGION_NPCS } from '../data/117-4-종교-전용-NPC-풀.js';
import { getPlayerReligion } from './094-5-플레이어-종교-귀속-교화.js';

window.RELIGION_NPCS = RELIGION_NPCS;

export function getReligionNPCSection(){
  const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  const npcs = rel ? (RELIGION_NPCS[rel]||[]) : [];
  if(!npcs.length) return '';
  return `\n[⛪ 종교 주요 NPC]\n${npcs.map(n=>`• ${n.icon} ${n.name} (${n.role}): ${n.talkStyle} — 비밀: [스스로 드러내게 할 것]`).join('\n')}`;
}
window.getReligionNPCSection = getReligionNPCSection;

window.getReligionNPCSection = getReligionNPCSection;
