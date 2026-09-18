// 3. 지역 종교 점유율 조회·수정
// Auto-extracted from taleforge.html (original section banner preserved above).
import { DEFAULT_RELIGION_SHARE, RELIGIONS } from '../data/090-1-마스터-데이터.js';
import { updateTension } from '../misc/093-4-긴장도-계산.js';
import { loadReligionState, saveReligionState } from '../world/091-2-저장소.js';

export function getRegionReligionShare(region){
  const st = loadReligionState();
  const key = (region||'central').toLowerCase();
  return st.share[key] || Object.assign({},DEFAULT_RELIGION_SHARE.central);
}
window.getRegionReligionShare = getRegionReligionShare;

export function changeReligionShare(region, deltas){
  // deltas: {temple:+5, solar:-5}
  const st = loadReligionState();
  const key = (region||'central').toLowerCase();
  if(!st.share[key]) st.share[key] = Object.assign({},DEFAULT_RELIGION_SHARE.central);
  const s = st.share[key];
  Object.keys(deltas).forEach(rel=>{
    if(RELIGIONS[rel]!==undefined) s[rel] = Math.max(0, Math.min(100, (s[rel]||0)+deltas[rel]));
  });
  // 합계 100 유지
  const total = Object.values(s).reduce((a,b)=>a+b,0);
  if(total!==100){
    const diff = 100-total;
    // 가장 큰 종교에서 보정
    const biggest = Object.entries(s).sort((a,b)=>b[1]-a[1])[0][0];
    s[biggest] = Math.max(0,(s[biggest]||0)+diff);
  }
  // 긴장도 업데이트
  updateTension(st, key);
  saveReligionState(st);
  if(typeof window.renderReligionPanel==='function') window.renderReligionPanel();
}
window.changeReligionShare = changeReligionShare;

window.changeReligionShare = changeReligionShare;
