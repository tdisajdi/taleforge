// [NEW] 배신 가능한 동료 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { lsDel, lsGet, lsSet } from '../utils.js';

export const BETRAYAL_KEY    = "taleforge-betrayal";

export const loadBetrayals   = () => { const r = lsGet(BETRAYAL_KEY); return r ? JSON.parse(r) : []; };

export const saveBetrayals   = (b) => lsSet(BETRAYAL_KEY, JSON.stringify(b));


export function getBetrayalBLS(){
  try{
    const list = loadBetrayals();
    if(!list.length) return '';
    const recent = list.slice(-3);
    const lines = recent.map(b => {
      const who = b.target || b.npcName || '누군가';
      const detail = b.desc || b.reason || b.triggerType || '';
      const dir = b.byPlayer===false ? '에게 배신당함' : '을(를) 배신함';
      return `${who}${dir}${detail?' — '+detail:''}`;
    });
    return '\n\n[⚖️ 배신/전환 기록]\n' + lines.join('\n');
  }catch(e){ return ''; }
}
window.getBetrayalBLS = getBetrayalBLS;

window.getBetrayalBLS = getBetrayalBLS;
