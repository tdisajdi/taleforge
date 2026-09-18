// 도전 과제 달성률 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { CALENDAR_FIXED_EVENTS, CHALLENGE_DEFS } from '../data/164-도전-과제-달성률-시스템.js';
import { v36_getReincarnationCount } from '../progression/014-환생-누적-시스템-110번.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadWorldDB } from '../world/145-⑥-세계-상태-DB.js';
import { loadPlayerDB, updatePlayerDB } from './144-⑤-플레이어-상태-DB.js';
import { advanceChapter, getChapterBLS, loadChapterState } from './163-챕터막-구조-시스템.js';

export const CHALLENGE_KEY = 'tf-challenges';

export function loadChallenges(){ try{ return JSON.parse(lsGet(CHALLENGE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadChallenges = loadChallenges;

export function saveChallenges(d){ try{ lsSet(CHALLENGE_KEY,JSON.stringify(d)); }catch(e){} }
window.saveChallenges = saveChallenges;

export function updateChallenge(trackKey, value){
  const ch = loadChallenges();
  if(!ch[trackKey]||ch[trackKey]<value) ch[trackKey]=value;
  saveChallenges(ch);
  // 달성 체크
  CHALLENGE_DEFS.filter(function(d){ return d.trackKey===trackKey; }).forEach(function(def){
    const cur=ch[trackKey]||0;
    if(!ch['done_'+def.id]&&(def.target<0?cur<=def.target:cur>=def.target)){
      ch['done_'+def.id]=true;
      saveChallenges(ch);
      toast('🏆 도전 과제 달성! '+def.icon+' '+def.name, 4500);
      if(typeof addTimelineEvent==='function') addTimelineEvent('achievement','도전과제: '+def.name,{icon:def.icon});
      if(typeof updatePlayerDB==='function') updatePlayerDB({achievement:def.name});
    }
  });
}
window.updateChallenge = updateChallenge;

window.updateChallenge = updateChallenge;

export function getChallengeRate(){
  const ch = loadChallenges();
  const done = CHALLENGE_DEFS.filter(function(d){ return ch['done_'+d.id]; }).length;
  return Math.round(done/CHALLENGE_DEFS.length*100);
}
window.getChallengeRate = getChallengeRate;

window.getChallengeRate = getChallengeRate;

export function renderChallengePanel(){
  const ch = loadChallenges();
  const rate = getChallengeRate();
  const body = document.getElementById('pb-challenges');
  if(!body) return;

  const cats = [...new Set(CHALLENGE_DEFS.map(function(d){ return d.cat; }))];
  let html = '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">🏆 도전 과제 — '+rate+'% 달성</div>';
  html += '<div style="height:5px;background:#1a1005;border-radius:3px;overflow:hidden;margin-bottom:10px"><div style="width:'+rate+'%;height:100%;background:linear-gradient(90deg,#c8a96e,#e8c88e);border-radius:3px;transition:width 1s"></div></div>';

  cats.forEach(function(cat){
    const catDefs = CHALLENGE_DEFS.filter(function(d){ return d.cat===cat; });
    const catDone = catDefs.filter(function(d){ return ch['done_'+d.id]; }).length;
    html += '<div style="margin-bottom:8px"><div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:4px">'+cat+' ('+catDone+'/'+catDefs.length+')</div>';
    catDefs.forEach(function(def){
      const done = ch['done_'+def.id];
      const cur = ch[def.trackKey]||0;
      const pct = def.target<0 ? Math.min(100,Math.round(Math.abs(cur)/Math.abs(def.target)*100)) : Math.min(100,Math.round(cur/def.target*100));
      html += '<div style="display:flex;align-items:center;gap:6px;padding:5px 7px;background:#090600;border:1px solid '+(done?'#c8a96e33':'#1a1005')+';margin-bottom:3px;opacity:'+(done?1:0.7)+'">'
        +'<span style="font-size:14px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def?.icon))+'</span>'
        +'<div style="flex:1"><div style="font-size:9px;color:'+(done?'var(--gold)':'var(--dim)')+'">'+esc(def.name)+'</div>'
        +'<div style="font-size:8px;color:#5a4a2a">'+esc(def.desc)+'</div>'
        +(done?'':'<div style="height:2px;background:#1a1005;border-radius:1px;margin-top:2px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:#6a5a3a;border-radius:1px"></div></div>')
        +'</div>'
        +(done?'<span style="font-size:10px">✅</span>':'<span style="font-size:8px;color:#5a4a2a">'+pct+'%</span>')
        +'</div>';
    });
    html += '</div>';
  });
  body.innerHTML = html;
}
window.renderChallengePanel = renderChallengePanel;

window.renderChallengePanel = renderChallengePanel;

export function getCalendarEventBLS(){
  const gt = (typeof loadGameTime==='function') ? loadGameTime() : null;
  if(!gt || !gt.season || gt.day===undefined) return '';
  const today = CALENDAR_FIXED_EVENTS.find(function(e){
    return e.season===gt.season && Math.abs(e.day-gt.day)<=2;
  });
  if(!today) return '';
  return '\n\n[📅 달력 이벤트: '+today.name+']\n'+today.effect+'\n이 특별한 날을 서사에 자연스럽게 반영하라.';
}
window.getCalendarEventBLS = getCalendarEventBLS;

window.getCalendarEventBLS = getCalendarEventBLS;

(function injectChallengePanel(){
  const t=function(){
    if(window._challengePanelInjected) return;
    if(!document.getElementById('pb-memory')){ setTimeout(t,1000); return; }
    if(!document.getElementById('pb-challenges')){
      const ref=document.getElementById('p-save');
      if(!ref){ setTimeout(t,500); return; }
      const div=document.createElement('div');
      div.className='panel-ov'; div.id='p-challenges';
      div.innerHTML='<div class="panel"><div class="p-hdr"><span class="p-title">🏆 도전과제</span><button class="p-close" onclick="closeP(\'challenges\')">✕</button></div><div class="p-body scrollable" id="pb-challenges"></div></div>';
      ref.parentNode.insertBefore(div,ref.nextSibling);
    }
    const saveBtn=document.querySelector('.grp-sub-btn[onclick*="save"]');
    if(saveBtn&&!document.querySelector('.grp-sub-btn[onclick*="challenges"]')){
      const btn=document.createElement('button');
      btn.className='grp-sub-btn';
      btn.setAttribute('onclick',"openP('challenges');closeGrp()");
      btn.innerHTML='🏆 도전과제';
      saveBtn.parentNode.insertBefore(btn,saveBtn.nextSibling);
    }
    window._challengePanelInjected=true;
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',t);
  else setTimeout(t,2200);
})();

(function hookChallengeOpenP(){
  const t=function(){
    if(window._challengeOpenHooked) return;
    if(typeof window.openP!=='function'){ setTimeout(t,1500); return; }
    window._challengeOpenHooked=true;
    const _o=window.openP;
    window.openP=function(name){
      const r=_o.apply(this,arguments);
      if(name==='challenges') setTimeout(renderChallengePanel,100);
      return r;
    };
  };
  setTimeout(t,2600);
})();

// [버그 수정] 이 자리에 있던 hookChallengeSendMsg(챕터 자동 진행 + 도전
// 과제 갱신)는 window.sendMsg를 감싸는 방식이라(다른 죽은 훅들과 동일한
// 원인) 한 번도 실행되지 않았다. quest/086의 sendMsg() 응답 후처리
// 블록에 네이티브로 연결했다.

(function hookPatch09BLS(){
  const t=function(){
    if(window._p09BLSHooked) return;
    const fn=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn){ setTimeout(t,3000); return; }
    window._p09BLSHooked=true;
    const _o=window[fn];
    window[fn]=function(){
      const r=_o.apply(this,arguments);
      try{
        const parts=[];
        const ch=getChapterBLS(); if(ch) parts.push(ch);
        const cal=getCalendarEventBLS(); if(cal) parts.push(cal);
        if(!parts.length) return r;
        return typeof r==='string'?r+parts.join(''):r;
      }catch(e){ return r; }
    };
  };
  setTimeout(t,5000);
})();

console.log('[TaleForge] 챕터/도전과제/달력 이벤트 로드 완료 ✓');
