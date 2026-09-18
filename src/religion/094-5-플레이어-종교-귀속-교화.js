// 5. 플레이어 종교 귀속 + 교화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { EVANGEL_ACTIONS, RELIGIONS } from '../data/090-1-마스터-데이터.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { toast } from '../utils.js';
import { loadReligionState, saveReligionState } from '../world/091-2-저장소.js';
import { changeReligionShare } from './092-3-지역-종교-점유율-조회수정.js';

export function getPlayerReligion(){
  return (S.character&&S.character.religion)||null;
}
window.getPlayerReligion = getPlayerReligion;

export function convertNpc(npcName, fromReligion, toReligion){
  const st = loadReligionState();
  st.convertedNpcs = st.convertedNpcs||[];
  st.convertedNpcs.push({name:npcName,from:fromReligion,to:toReligion,at:S.msgCount||0});
  if(S.character) S.character.convertedNpcs = st.convertedNpcs;
  saveReligionState(st);
  toast('개종 성공: '+npcName+' → '+(RELIGIONS[toReligion]&&RELIGIONS[toReligion].name||toReligion),3000);
}
window.convertNpc = convertNpc;

window.convertNpc = convertNpc;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_75(){
function setPlayerReligion(religionId){
  if(!S.character) return;
  S.character.religion = religionId;
  const rel = RELIGIONS[religionId];
  if(rel) toast(rel.icon+' '+rel.name+'에 귀의했다.',3000);
  if(typeof window.renderReligionPanel==='function') window.renderReligionPanel();
}
window.setPlayerReligion = setPlayerReligion;

window.setPlayerReligion = window.setPlayerReligion;

function performEvangel(actionName, region, targetReligion){
  const action = EVANGEL_ACTIONS[actionName];
  if(!action) return;
  const playerRel = getPlayerReligion();
  if(!playerRel){ toast('⚠️ 소속 종교가 없습니다.',2000); return; }

  // 골드 소모
  if(action.gold){
    if((S.gold||0)<action.gold){ toast('⚠️ 골드 부족! ('+action.gold+'G 필요)',2000); return; }
    S.gold -= action.gold;
    if(typeof saveGold==='function') saveGold(S.gold);
    if(typeof window.updateHeader==='function') window.updateHeader();
  }

  // 신도 점유율 변화
  const delta = {};
  delta[playerRel] = (action.effect||10);
  if(action.target==='rival' && targetReligion) delta[targetReligion] = -(action.effect||10);
  else if(action.target==='rival'){
    // 가장 경쟁적인 종교에서 감소
    const rivals = (RELIGIONS[playerRel]&&RELIGIONS[playerRel].factionRivals)||[];
    const relRivals = Object.keys(RELIGIONS).filter(r=>r!==playerRel&&!rivals.every(rv=>!r.includes(rv)));
    if(relRivals.length) delta[relRivals[0]] = -(action.effect||10);
  }
  changeReligionShare(region, delta);

  // 교화 횟수 기록
  S.character.evangelCount = (S.character.evangelCount||0)+1;

  toast((RELIGIONS[playerRel]&&RELIGIONS[playerRel].icon)||'✝️'+' '+actionName+' 성공! 신도 +'+action.effect+'%',3000);
  if(typeof addTimelineEvent==='function')
    addTimelineEvent('religion_evangel', actionName+' ('+region+')',{icon:RELIGIONS[playerRel]&&RELIGIONS[playerRel].icon||'✝️'});

  // AI 서사 주입
  S._nextInjectedContext=(S._nextInjectedContext||'')
    +'\n[⛪ 교화 행동] 플레이어가 '+(RELIGIONS[playerRel]&&RELIGIONS[playerRel].name||playerRel)+'의 "'+actionName+'"을(를) 수행했다. '
    +'지역 NPC들의 반응을 fath/wil 기준으로 묘사하라. 일부는 감동받고 일부는 반발한다.';
}
window.performEvangel = performEvangel;

window.performEvangel = performEvangel;
}

