// 2. 저장소
// Auto-extracted from taleforge.html (original section banner preserved above).
import { DEFAULT_RELIGION_SHARE } from '../data/090-1-마스터-데이터.js';
import { lsDel, lsGet, lsSet } from '../utils.js';

export const RELIGION_STATE_KEY = 'tf-religion-state';

export function loadReligionState(){
  try{
    const r = JSON.parse(lsGet(RELIGION_STATE_KEY)||'null');
    if(r) return r;
  }catch(e){}
  // 초기화
  const share = {};
  Object.keys(DEFAULT_RELIGION_SHARE).forEach(region=>{
    share[region] = Object.assign({},DEFAULT_RELIGION_SHARE[region]);
  });
  return {
    share,
    tension:{},   // {region: {level, between:['a','b'], events:[]}}
    war:null,     // {region, sides, progress, startTurn}
    convertedNpcs:[],
    syncretismFactions:[],
    history:[],
  };
}
window.loadReligionState = loadReligionState;

export function saveReligionState(d){ try{ lsSet(RELIGION_STATE_KEY,JSON.stringify(d)); }catch(e){} }
window.saveReligionState = saveReligionState;

export function clearReligionState(){ try{ lsDel(RELIGION_STATE_KEY); }catch(e){} }
window.clearReligionState = clearReligionState;
