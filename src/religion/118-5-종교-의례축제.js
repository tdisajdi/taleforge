// 5. 종교 의례/축제
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RELIGION_RITUALS } from '../data/118-5-종교-의례축제.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { toast } from '../utils.js';
import { getPlayerReligion } from './094-5-플레이어-종교-귀속-교화.js';

window.RELIGION_RITUALS = RELIGION_RITUALS;

export function checkReligionRituals(){
  const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  if(!rel) return;
  const rituals = RELIGION_RITUALS[rel]||[];
  const turn = S.msgCount||0;
  rituals.forEach(rit=>{
    const mod = typeof rit.turn_mod==='function' ? rit.turn_mod(typeof loadCycleCount==='function'?loadCycleCount():0) : rit.turn_mod;
    if(turn>0 && turn%mod===0){
      // 효과 적용
      Object.entries(rit.effect||{}).forEach(([k,v])=>{
        if(S.stats&&S.stats[k]!==undefined) S.stats[k]=Math.max(0,Math.min(999,(S.stats[k]||0)+v));
      });
      toast(`${rit.name} — ${rit.desc.slice(0,30)}...`, 3500, rit);
      if(typeof addTimelineEvent==='function') addTimelineEvent('event',rit.name,{icon:rit.icon});
      S._nextInjectedContext=(S._nextInjectedContext||'')
        +`\n[${rit.icon} 종교 의례] ${rit.name}이(가) 진행됐다. ${rit.desc} 이 의례 장면을 자연스럽게 삽입하라.`;
    }
  });
}
window.checkReligionRituals = checkReligionRituals;

window.checkReligionRituals = checkReligionRituals;
