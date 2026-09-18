// 7. 회차 진화 시 자동 혈통 강화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { BLOODLINE_MASTER } from '../data/124-1-통합-혈통-정의-BLOODLINETYPES-BLOODLINEDEFS-.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { getBloodlineEvolution } from '../progression/126-5-회차-진화-완전-자동.js';
import { loadBL, saveBL } from '../summon/124-1-통합-혈통-정의-BLOODLINETYPES-BLOODLINEDEFS-.js';
import { toast } from '../utils.js';

export function onBloodlineNewCycle(){
  const bl = loadBL();
  if(!bl?.type) return;

  const cycle = typeof loadCycleCount==='function'?loadCycleCount():0;
  const def   = BLOODLINE_MASTER[bl.type];
  if(!def) return;

  // 회차마다 패시브 추가 성장
  if(S.stats && cycle > 0){
    const growth = Math.min(cycle, 10); // 최대 10회차까지
    Object.entries(def.passiveStats||{}).forEach(([k,v])=>{
      if(S.stats[k]!==undefined) S.stats[k]=Math.min(999,(S.stats[k]||0)+Math.floor(v*growth*0.1));
    });
  }

  // 진화 체크
  const evo = getBloodlineEvolution();
  if(evo?.stage > 0 && evo.stageName !== bl.lastStageName){
    bl.lastStageName = evo.stageName;
    saveBL(bl);
    toast(`혈통 진화: ${evo.stageName}`, 4000, def);
    if(typeof addTimelineEvent==='function')
      addTimelineEvent('event',`혈통 진화: ${evo.stageName}`,{icon:def.icon});
    S._nextInjectedContext=(S._nextInjectedContext||'')
      +`\n[🩸 혈통 진화] ${def.name}이(가) "${evo.stageName}"(으)로 진화했다. `
      +`${def.evolveHint} 이 변화를 서사에 자연스럽게 반영하라.`;
  }
}
window.onBloodlineNewCycle = onBloodlineNewCycle;

window.onBloodlineNewCycle = onBloodlineNewCycle;
