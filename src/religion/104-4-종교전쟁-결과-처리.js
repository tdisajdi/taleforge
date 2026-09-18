// 4. 종교전쟁 결과 처리
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RELIGIONS } from '../data/090-1-마스터-데이터.js';
import { toast } from '../utils.js';
import { loadReligionState, saveReligionState } from '../world/091-2-저장소.js';
import { changeReligionShare, getRegionReligionShare } from './092-3-지역-종교-점유율-조회수정.js';

export const WAR_END_TURNS = 30;

export function tickReligionWar(){
  const st = loadReligionState();
  if(!st.war) return;
  st.war.progress = (st.war.progress||0) + 1;

  // 플레이어가 지원한 쪽 확인
  const supported = st.war.playerSupport;
  const sides = st.war.sides||[];

  if(st.war.progress >= WAR_END_TURNS){
    // 자동 결말 — 신도 비율 높은 쪽 승리
    const region = st.war.region||'central';
    const share = getRegionReligionShare(region);
    const winner = sides.sort((a,b)=>(share[b]||0)-(share[a]||0))[0];
    const loser  = sides.find(s=>s!==winner);

    // 승자 신도 +15, 패자 -15
    const delta = {};
    delta[winner] = 15;
    if(loser) delta[loser] = -15;
    changeReligionShare(region, delta);

    // 플레이어가 승자 편이면 보상
    if(supported === winner && S.stats){
      S.stats.rep = Math.min(999,(S.stats.rep||50)+20);
      S.stats.fath = Math.min(999,(S.stats.fath||50)+15);
      toast(`🏆 ${RELIGIONS[winner]?.name||winner}이(가) 종교전쟁에서 승리! 평판+20 신앙+15`, 4000);
    } else if(supported === loser){
      toast(`💔 ${RELIGIONS[loser]?.name||loser}이(가) 패배했다...`, 3000);
    } else {
      toast(`⚔️ ${RELIGIONS[winner]?.name||winner}이(가) 종교전쟁 승리`, 3000);
    }

    if(typeof addTimelineEvent==='function')
      addTimelineEvent('event', `종교전쟁 종결: ${RELIGIONS[winner]?.name||winner} 승리`, {icon:'🏁'});

    S._nextInjectedContext = (S._nextInjectedContext||'')
      +`\n[🏁 종교전쟁 종결] ${RELIGIONS[winner]?.name||winner}이(가) 승리했다. `
      +`${region} 지역에서 승전 분위기와 패전 종교의 침묵을 묘사하라.`;

    st.war = null;
    saveReligionState(st);
  } else {
    saveReligionState(st);
  }
}
window.tickReligionWar = tickReligionWar;

window.tickReligionWar = tickReligionWar;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_85(){
const _origSupport = window.supportReligionWar;

if(typeof _origSupport==='function'){
  window.supportReligionWar = function(religionId){
    const st = loadReligionState();
    if(st.war){ st.war.playerSupport = religionId; saveReligionState(st); }
    _origSupport(religionId);
  };
}
}

