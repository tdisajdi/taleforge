// TaleForge v51-2 누락 함수/상수 전체 보완 패치 (호환버전)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { renderKeys, showScreen } from '../core/084-TaleForge-순수-JS-엔진.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadApiKeys } from '../race/013-종족-시스템.js';

if(typeof RACE_EVOLUTION==='undefined') window.RACE_EVOLUTION={};

if(typeof TIME_PHASES==='undefined') window.TIME_PHASES={dawn:'새벽',morning:'아침',noon:'정오',afternoon:'오후',evening:'저녁',night:'밤',midnight:'심야'};

if(typeof UNIFICATION_ROUTES==='undefined') window.UNIFICATION_ROUTES={};

if(typeof loadGameTime==='undefined'){
  window.loadGameTime=function(){
    try{ return JSON.parse(localStorage.getItem('tf-gametime')||'null'); }catch(e){ return null; }
  };
}

if(typeof getTime==='undefined'){
  window.getTime=function(){
    var t=loadGameTime();
    if(t) return t;
    if(typeof S!=='undefined' && S.gameTime) return S.gameTime;
    return {day:1,phase:'morning'};
  };
}

if(typeof getGameTimeDesc==='undefined'){
  window.getGameTimeDesc=function(){
    try{
      var t=getTime();
      var phase=TIME_PHASES[t.phase]||t.phase||'아침';
      return (t.day||1)+'일차 '+phase;
    }catch(e){ return '1일차 아침'; }
  };
}

if(typeof getSeasonEffect==='undefined'){
  window.getSeasonEffect=function(){ return {name:'',statBonus:{},desc:''}; };
}

if(typeof getFameDesc==='undefined'){
  window.getFameDesc=function(fame){
    if(!fame||fame<10) return '무명';
    if(fame<30) return '평민';
    if(fame<60) return '영웅';
    return '전설';
  };
}

if(typeof applyFameToNpcReaction==='undefined'){
  window.applyFameToNpcReaction=function(){ return ''; };
}

if(typeof loadUnification==='undefined'){
  window.loadUnification=function(){
    try{ return JSON.parse(localStorage.getItem('tf-unification')||'null'); }catch(e){ return null; }
  };
}

if(typeof calcUnificationProgress==='undefined'){
  window.calcUnificationProgress=function(){ return 0; };
}

if(typeof getActiveComboDesc==='undefined'){
  window.getActiveComboDesc=function(){ return ''; };
}

if(typeof getBossCurrentHp==='undefined'){
  window.getBossCurrentHp=function(){ return null; };
}

if(typeof getExplorationRate==='undefined'){
  window.getExplorationRate=function(){ return 0; };
}

if(typeof getDurabilityWarning==='undefined'){
  window.getDurabilityWarning=function(){ return ''; };
}

if(typeof getSkillMasteryDesc==='undefined'){
  window.getSkillMasteryDesc=function(){ return ''; };
}

if(typeof uniqueSkill==='undefined'){
  window.uniqueSkill=function(){ return null; };
}

if(typeof getAntiRepeatInstruction==='undefined'){
  window.getAntiRepeatInstruction=function(){ return ''; };
}

if(typeof loadMonsters==='undefined'){
  window.loadMonsters=function(){
    try{ return JSON.parse(localStorage.getItem('tf-monsters')||'[]'); }catch(e){ return []; }
  };
}

if(typeof saveMonsters==='undefined'){
  window.saveMonsters=function(d){
    try{ localStorage.setItem('tf-monsters',JSON.stringify(d)); }catch(e){}
  };
}

if(typeof getEquippedStatBonus==='undefined'){
  window.getEquippedStatBonus=function(stat){
    try{
      var eq=(typeof S!=='undefined'&&S.equipped)||{};
      var bonus=0;
      var vals=Object.values(eq);
      for(var i=0;i<vals.length;i++){
        var item=vals[i];
        if(!item) continue;
        var s=item.stats||item.statBoost||{};
        bonus+=(s[stat]||0);
      }
      return bonus;
    }catch(e){ return 0; }
  };
}

if(typeof mergeHiddenJobs==='undefined') window.mergeHiddenJobs=function(){};

if(typeof isTutorialDone==='undefined') window.isTutorialDone=function(){ return true; };

if(typeof startTutorial==='undefined') window.startTutorial=function(){};

export function _taleforgeInit(){
  try{
    var el=document.getElementById('app-version-display');
    if(el) el.textContent='v74';
    var savedKeys=(typeof loadApiKeys==='function')?loadApiKeys():[];
    if(typeof S!=='undefined') S.apiKeys=savedKeys;
    if(typeof renderKeys==='function') renderKeys();
    if(typeof renderLocalModelSetting==='function') renderLocalModelSetting();
    if(typeof showScreen==='function') showScreen('apikey');
    else{
      var screens=document.querySelectorAll('.screen');
      for(var i=0;i<screens.length;i++) screens[i].classList.remove('active');
      var sc=document.getElementById('screen-apikey');
      if(sc) sc.classList.add('active');
    }
  }catch(e){
    console.error('[TaleForge] init 오류:',e);
    try{
      var screens=document.querySelectorAll('.screen');
      for(var i=0;i<screens.length;i++) screens[i].classList.remove('active');
      var sc=document.getElementById('screen-apikey');
      if(sc) sc.classList.add('active');
    }catch(e2){}
  }
}
window._taleforgeInit = _taleforgeInit;

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',_taleforgeInit);
} else {
  _taleforgeInit();
}

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_200(){
if(typeof window.getFactionGaugeBLS==='undefined'){
  window.getFactionGaugeBLS=function(){ return ''; };
}

if(typeof window.renderWeatherWidget==='undefined') window.renderWeatherWidget=function(){};

if(typeof window.syncAutoAtmosphere==='undefined') window.syncAutoAtmosphere=function(){};

// [CRITICAL BUG FIX] 이 자리에 있던 window.loadStatusEffects 재정의 래퍼는
// 반환값을 무조건 배열로 강제 변환했다. 그러나 실제 loadStatusEffects()는
// {target: [effect,...]} 형태의 객체를 반환하며, 다른 모든 호출부(ui/155,
// quest/086, misc/053, misc/009, misc/054)가 전부 객체 형태를 기대한다.
// 이 래퍼 때문에 applyStatusEffect가 내부적으로 호출하는 window.loadStatusEffects()가
// 빈 배열([])을 돌려주면, state[target]=[] 로 배열에 비-인덱스 속성을 추가하게 되고
// saveStatusEffects(state)의 JSON.stringify(state)가 배열의 비-인덱스 속성을
// 전부 버려 상태이상 부여가 항상 무효화되던 근본 원인이었다. 래퍼를 완전히 제거.
}

