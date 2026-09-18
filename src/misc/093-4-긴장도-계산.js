// 4. 긴장도 계산
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RELIGIONS, TENSION_STAGES } from '../data/090-1-마스터-데이터.js';
import { toast } from '../utils.js';
import { loadReligionState, saveReligionState } from '../world/091-2-저장소.js';

export function updateTension(st, region){
  const s = st.share[region]||{};
  if(!st.tension[region]) st.tension[region]={level:0,between:[],events:[]};
  const t = st.tension[region];

  // 35%+35% 이상이면 긴장 시작
  const pairs = [['temple','solar'],['temple','roots'],['temple','abyss'],['solar','roots'],['solar','abyss'],['roots','abyss']];
  let maxLevel = 0;
  let hotPair  = [];
  pairs.forEach(([a,b])=>{
    const va=s[a]||0, vb=s[b]||0;
    if(va>=35&&vb>=35){
      const lv = va>=48&&vb>=48 ? 4 : va>=45&&vb>=45 ? 3 : va>=40&&vb>=40 ? 2 : 1;
      if(lv>maxLevel){ maxLevel=lv; hotPair=[a,b]; }
    }
  });
  t.level   = maxLevel;
  t.between = hotPair;
  if(maxLevel>=4) triggerReligionWar(st, region, hotPair);
}
window.updateTension = updateTension;

export function getReligionTension(region){
  const st  = loadReligionState();
  const key = (region||'central').toLowerCase();
  const t   = st.tension[key]||{level:0,between:[],events:[]};
  return {
    level:   t.level,
    between: t.between,
    desc:    (TENSION_STAGES[t.level]||TENSION_STAGES[0]).desc,
    icon:    (TENSION_STAGES[t.level]||TENSION_STAGES[0]).icon,
    stage:   TENSION_STAGES[t.level]||TENSION_STAGES[0],
  };
}
window.getReligionTension = getReligionTension;

export function triggerReligionEvent(eventType, region){
  const st = loadReligionState();
  const key= (region||'central').toLowerCase();
  if(!st.tension[key]) st.tension[key]={level:0,between:[],events:[]};
  st.tension[key].level = Math.min(4, (st.tension[key].level||0)+1);
  st.tension[key].events = st.tension[key].events||[];
  st.tension[key].events.push({type:eventType, at:S.msgCount||0});
  if(st.tension[key].level>=4) triggerReligionWar(st, key, st.tension[key].between);
  saveReligionState(st);
  toast('⚡ 종교 긴장도 상승! ('+key+' 지역 '+st.tension[key].level+'단계)', 3000);
}
window.triggerReligionEvent = triggerReligionEvent;

window.triggerReligionEvent = triggerReligionEvent;

export function triggerReligionWar(st, region, sides){
  if(st.war) return;
  st.war = {region, sides, progress:0, startTurn:S.msgCount||0};
  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n[🔥 종교전쟁 발발] '+region+' 지역에서 '
    +(sides.map(s=>RELIGIONS[s]?RELIGIONS[s].name:s).join(' vs '))
    +' 종교전쟁이 일어났다. 플레이어가 어느 쪽을 지원하거나 중재하거나 방관하는지에 따라 결과가 달라진다. 극적으로 서사화하라.';
  if(typeof addTimelineEvent==='function')
    addTimelineEvent('religion_war','종교전쟁 발발: '+region,{icon:'🔥'});
  toast('🔥 종교전쟁 발발! ('+region+')',4000);
}
window.triggerReligionWar = triggerReligionWar;
