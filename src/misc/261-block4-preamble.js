// block4-preamble
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent, loadTimeline } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { renderSetupStep, startGame } from '../core/084-TaleForge-순수-JS-엔진.js';
import { S, SETUP_STEPS } from '../data/084-TaleForge-순수-JS-엔진.js';
import { ENDING_COMPASS_DEFS, MILESTONE_DEFS } from '../data/261-block4-preamble.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { $, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { gainExp } from './009-레벨업-스탯-포인트-배분-시스템.js';
import { loadChoiceHistory, loadWorldState } from './066-②-선택-결과-추적-시스템.js';
import { loadDiary } from './076-파트2-D-일기기록-시스템.js';

// [참고] 이번 생의 목표 난이도/보상 데이터(LIFE_GOALS)는 data/030에 있다.
// (이 파일에 있던 LIFE_GOAL_MECH 사본은 아래 doStartChat 훅과 함께 죽은
// 코드였기 때문에 제거했다 — core/084 renderSetupStep 참고.)

export const CAUSAL_LOG_KEY_V7='tf-causal-log';

export function loadCausalLog(){ try{ return JSON.parse(lsGet(CAUSAL_LOG_KEY_V7)||'[]'); }catch(e){ return []; } }
window.loadCausalLog = loadCausalLog;

export function saveCausalLog(d){ try{ lsSet(CAUSAL_LOG_KEY_V7,JSON.stringify(d)); }catch(e){} }
window.saveCausalLog = saveCausalLog;

export function addCausalEntry(choice, consequence, effect=''){
  const log=loadCausalLog();
  log.push({ turn:S.msgCount||0, choice:choice.slice(0,60), consequence:consequence.slice(0,80), effect:effect.slice(0,60), at:new Date().toLocaleString('ko-KR') });
  
  saveCausalLog(log);
}
window.addCausalEntry = addCausalEntry;

export function detectCausalFromText(aiText, userChoice){
  if(!aiText||!userChoice) return;
  const lc=aiText.toLowerCase();
  const positiveP=[
    {p:/감사|고맙|기억하|도움이|은혜/, e:'NPC 호감 상승'},
    {p:/동맹|협력|함께|우리편/, e:'동맹 관계 형성'},
    {p:/정보|알려|비밀|단서/, e:'중요 정보 획득'},
    {p:/보상|사례|선물|골드/, e:'보상 획득'},
    {p:/승리|성공|해냈|완료/, e:'목표 달성'},
  ];
  const negativeP=[
    {p:/배신|등 돌|원한|분노|복수/, e:'NPC 적대 관계'},
    {p:/지명수배|쫓기|현상금/, e:'수배자 신세'},
    {p:/잃었|빼앗|강탈|도난/, e:'피해 발생'},
    {p:/실패|망했|틀렸|어긋/, e:'목표 실패'},
  ];
  let detected='';
  for(const p of positiveP){ if(p.p.test(lc)){ detected=p.e; break; } }
  if(!detected) for(const p of negativeP){ if(p.p.test(lc)){ detected=p.e; break; } }
  if(detected) addCausalEntry(userChoice, aiText.slice(0,80), detected);
}
window.detectCausalFromText = detectCausalFromText;

export function getCausalBLS(){
  const log=loadCausalLog();
  if(!log.length) return '';
  const lines=log.slice(-15).map(e=>`• 턴${e.turn}: "${e.choice}" → ${e.consequence.slice(0,50)}${e.effect?' ('+e.effect+')':''}`);
  return `\n[🔗 선택의 인과 기록 — 반드시 반영]\n${lines.join('\n')}\n위 선택들의 결과가 현재 세계에 살아있다. NPC 태도, 파벌 반응, 기회나 위기에 자연스럽게 녹여내라.`;
}
window.getCausalBLS = getCausalBLS;

window.getCausalBLS=getCausalBLS;

window.addCausalEntry=addCausalEntry;

window.detectCausalFromText=detectCausalFromText;

export const MILESTONE_KEY_V7='tf-milestones-v1';

export function loadMilestonesV7(){ try{ return JSON.parse(lsGet(MILESTONE_KEY_V7)||'{}'); }catch(e){ return {}; } }
window.loadMilestonesV7 = loadMilestonesV7;

export function saveMilestonesV7(d){ try{ lsSet(MILESTONE_KEY_V7,JSON.stringify(d)); }catch(e){} }
window.saveMilestonesV7 = saveMilestonesV7;

export function checkMilestones(){
  if(!S.initialized) return;
  const done=loadMilestonesV7();
  MILESTONE_DEFS.forEach(function(m){
    if(done[m.id]) return;
    try{ if(!m.check()) return; }catch(e){ return; }
    done[m.id]={ completedAt:new Date().toLocaleString('ko-KR'), turn:S.msgCount||0 };
    saveMilestonesV7(done);
    if(m.reward&&m.reward.gold){ S.gold=(S.gold||0)+m.reward.gold; if(typeof saveGold==='function') saveGold(S.gold); if(typeof window.updateHeader==='function') window.updateHeader(); }
    if(m.reward&&m.reward.exp && typeof gainExp==='function') gainExp(m.reward.exp);
    setTimeout(function(){ if(typeof toast==='function') toast('🎯 마일스톤! '+m.icon+' '+m.label+(m.reward&&m.reward.gold?' (+'+m.reward.gold+'G)':''), 4000); }, 300);
    if(typeof addTimelineEvent==='function') addTimelineEvent('milestone','마일스톤: '+m.label,{icon:m.icon});
  });
}
window.checkMilestones = checkMilestones;

window.checkMilestones=checkMilestones;

export function renderMilestonePanel(){
  var body=document.getElementById('pb-milestones'); if(!body) return;
  var done=loadMilestonesV7();
  var total=MILESTONE_DEFS.length;
  var cleared=Object.keys(done).length;
  var cats={play:'⏳ 플레이',wealth:'💰 재력',social:'👥 인맥',growth:'⬆️ 성장',explore:'🗺️ 탐험',choice:'🎯 선택',quest:'📜 퀘스트',item:'💎 아이템',domain:'🏰 영지'};
  var html='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold);letter-spacing:1px">🎯 마일스톤 ('+cleared+'/'+total+')</div><div style="font-size:9px;color:var(--dim)">'+Math.round(cleared/total*100)+'% 달성</div></div>';
  html+='<div style="height:5px;background:#0a0600;border-radius:3px;overflow:hidden;margin-bottom:12px"><div style="width:'+Math.round(cleared/total*100)+'%;height:100%;background:linear-gradient(90deg,var(--gold),#e8c97e);border-radius:3px"></div></div>';
  Object.entries(cats).forEach(function(kv){
    var cat=kv[0], catLabel=kv[1];
    var catMs=MILESTONE_DEFS.filter(function(m){return m.cat===cat;});
    if(!catMs.length) return;
    html+='<div style="margin-bottom:10px"><div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">'+catLabel+'</div><div style="display:flex;flex-direction:column;gap:3px">';
    catMs.forEach(function(m){
      var isDone=!!done[m.id];
      var rewardStr=[m.reward&&m.reward.gold?'+'+m.reward.gold+'G':'',m.reward&&m.reward.exp?'+'+m.reward.exp+'EXP':''].filter(Boolean).join(' ');
      html+='<div style="display:flex;align-items:center;gap:8px;padding:6px 9px;background:'+(isDone?'#0d1a05':'#0a0600')+';border:1px solid '+(isDone?'#2a5a1a':'var(--border)')+';border-radius:2px;opacity:'+(isDone?1:0.7)+'"><span style="font-size:14px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:14}):(m?.icon))+'</span><div style="flex:1"><div style="font-size:9px;color:'+(isDone?'var(--gold)':'var(--dim)')+';font-family:\'Cinzel\',serif">'+m.label+'</div>'+(rewardStr?'<div style="font-size:8px;color:#a08030">'+rewardStr+'</div>':'')+'</div>'+(isDone?'<div style="font-size:8px;color:#60c060">✓</div>':'<div style="font-size:8px;color:var(--dim)">미달성</div>')+'</div>';
    });
    html+='</div></div>';
  });
  body.innerHTML=html;
}
window.renderMilestonePanel = renderMilestonePanel;

window.renderMilestonePanel=renderMilestonePanel;

export function getEndingCompassState(){
  try{
    var ws=typeof loadWorldState==='function'?loadWorldState():{};
    var history=typeof loadChoiceHistory==='function'?loadChoiceHistory():[];
    var recentText=history.slice(-10).map(function(h){return h.choice||'';}).join(' ').toLowerCase();
    var scores={};
    ENDING_COMPASS_DEFS.forEach(function(e){
      var score=0;
      try{ if(e.condition(ws)) score+=3; }catch(err){}
      e.signals.forEach(function(s){ if(recentText.includes(s)) score++; });
      scores[e.id]=score;
    });
    var best=Object.entries(scores).sort(function(a,b){return b[1]-a[1];})[0];
    if(!best||best[1]===0) return null;
    return ENDING_COMPASS_DEFS.find(function(e){return e.id===best[0];});
  }catch(err){ return null; }
}
window.getEndingCompassState = getEndingCompassState;

export function renderEndingCompassPanel(){
  var body=document.getElementById('pb-ending-compass'); if(!body) return;
  var ws=typeof loadWorldState==='function'?loadWorldState():{};
  var cur=getEndingCompassState();
  var html='<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold);margin-bottom:10px;letter-spacing:1px">🧭 엔딩 방향 나침반</div>';
  html+='<div style="font-size:9px;color:var(--dim);margin-bottom:10px;line-height:1.6">지금까지의 선택이 어떤 결말로 향하는지 나타냅니다.</div>';
  if(cur){
    html+='<div style="padding:12px;background:#0d1a05;border:2px solid '+cur.color+';border-radius:3px;text-align:center;margin-bottom:12px">';
    html+='<div style="font-size:36px;margin-bottom:6px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(cur,{size:14}):(cur?.icon))+'</div>';
    html+='<div style="font-family:\'Cinzel\',serif;font-size:14px;color:'+cur.color+';margin-bottom:6px">'+cur.label+'</div>';
    html+='<div style="font-size:9px;color:var(--dim);line-height:1.6">'+cur.hint+'</div></div>';
  } else {
    html+='<div style="padding:16px;text-align:center;color:var(--dim);font-size:9px;margin-bottom:12px">아직 방향이 정해지지 않았습니다.<br>선택을 거듭하면 나침반이 움직입니다.</div>';
  }
  html+='<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);margin-bottom:6px">모든 가능한 결말</div><div style="display:flex;flex-direction:column;gap:4px">';
  ENDING_COMPASS_DEFS.forEach(function(e){
    var isActive=cur&&cur.id===e.id;
    html+='<div style="display:flex;align-items:center;gap:8px;padding:7px 9px;background:'+(isActive?'#0d1a05':'var(--bg-input)')+';border:1px solid '+(isActive?e.color:'var(--border)')+';border-radius:2px">';
    html+='<span style="font-size:18px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(e,{size:14}):(e?.icon))+'</span><div style="flex:1"><div style="font-size:9px;color:'+(isActive?e.color:'var(--dim)')+';font-family:\'Cinzel\',serif">'+e.label+'</div>';
    html+='<div style="font-size:8px;color:var(--dim);margin-top:1px">'+e.hint+'</div></div>'+(isActive?'<span style="color:'+e.color+';font-size:10px">◀</span>':'')+'</div>';
  });
  html+='</div><div style="margin-top:10px;padding:7px;background:var(--bg-screen);border:1px dashed var(--border);font-size:9px;color:var(--dim);line-height:1.6">📊 행동 이력: 선행 '+(ws.goodActs||0)+'회 · 악행 '+(ws.evilActs||0)+'회 · 현명한 선택 '+(ws.wiseActs||0)+'회 · 총 선택 '+(ws.totalChoices||0)+'회</div>';
  body.innerHTML=html;
}
window.renderEndingCompassPanel = renderEndingCompassPanel;

window.renderEndingCompassPanel=renderEndingCompassPanel;

window.getEndingCompassState=getEndingCompassState;

export function showEnhancedEndingCutscene(endingName, endingDesc){
  endingDesc=endingDesc||'';
  try{
    var diary=typeof loadDiary==='function'?loadDiary():[];
    var tl=typeof loadTimeline==='function'?loadTimeline():[];
    var ws=typeof loadWorldState==='function'?loadWorldState():{};
    var pop=S.character&&S.character.name||'주인공';
    var lv=typeof loadPlayerLevel==='function'?loadPlayerLevel():1;
    var cycle=typeof loadCycleCount==='function'?loadCycleCount():0;
    var compassState=getEndingCompassState();
    var highlights=diary.filter(function(d){return ['quest','npc','event','evolution'].includes(d.type);}).slice(-3);
    var hlHtml=highlights.length?'<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin:12px 0 6px">📖 이번 생의 발자취</div>'+highlights.map(function(h){return '<div style="padding:5px 8px;background:#0d0800;border-left:2px solid var(--gold);margin-bottom:3px;font-size:9px;color:#c8a96e;line-height:1.4">'+((h.content||'').slice(0,80))+'</div>';}).join(''):'';
    var statsHtml='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin:10px 0">';
    [{icon:'⬆️',label:'최종 레벨',val:'Lv.'+lv},{icon:'⏳',label:'플레이 턴',val:(S.msgCount||0)+'턴'},{icon:'🎯',label:'선택 수',val:(ws.totalChoices||0)+'회'},{icon:'💰',label:'현재 골드',val:(S.gold||0)+'G'},{icon:'⭐',label:'선행',val:(ws.goodActs||0)+'회'},{icon:'🔄',label:'회차',val:cycle+'회차'}].forEach(function(s){
      statsHtml+='<div style="padding:6px;background:#0a0600;border:1px solid #1a1005;text-align:center;border-radius:2px"><div style="font-size:12px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:14}):(s?.icon))+'</div><div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold)">'+s.val+'</div><div style="font-size:7px;color:var(--dim)">'+s.label+'</div></div>';
    });
    statsHtml+='</div>';
    var modal=document.createElement('div');
    modal.style.cssText='position:fixed;inset:0;background:#000000cc;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
    modal.innerHTML='<div style="background:#0d0800;border:2px solid var(--gold);padding:20px;max-width:380px;width:100%;max-height:80vh;overflow-y:auto;border-radius:3px"><div style="text-align:center;margin-bottom:16px"><div style="font-size:40px;margin-bottom:8px">'+(compassState?(typeof getEntityIconHTML==='function'?getEntityIconHTML(compassState,{size:14}):(compassState?.icon)):'🌟')+'</div><div style="font-family:\'Cinzel\',serif;font-size:18px;color:var(--gold);margin-bottom:4px">'+(endingName||'엔딩')+'</div><div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--dim)">'+pop+'의 이야기가 막을 내린다</div></div>'+(endingDesc?'<div style="font-size:10px;color:#c8a96e;line-height:1.7;margin-bottom:12px;padding:10px;background:#050300;border:1px solid #2a1a05;border-radius:2px">'+endingDesc+'</div>':'')+statsHtml+hlHtml+'<div style="margin-top:16px;padding:10px;background:#050300;border:1px solid #2a1a05;border-radius:2px;font-size:9px;color:var(--dim);line-height:1.6;text-align:center">'+(cycle>0?'이것은 '+pop+'의 '+(cycle+1)+'번째 삶이었다.<br>':'')+'선행 '+(ws.goodActs||0)+'회 · 악행 '+(ws.evilActs||0)+'회 · 총 '+(ws.totalChoices||0)+'번의 선택이 이 결말을 만들었다.</div><button onclick="this.closest(\'[style*=fixed]\').remove()" style="width:100%;margin-top:14px;padding:10px;background:linear-gradient(135deg,#1a1200,#2a2000);border:1px solid var(--gold);color:var(--gold);font-family:\'Cinzel\',serif;font-size:11px;cursor:pointer;letter-spacing:1px;border-radius:2px">다음 생으로 →</button></div>';
    document.body.appendChild(modal);
  }catch(e){}
}
window.showEnhancedEndingCutscene = showEnhancedEndingCutscene;

window.showEnhancedEndingCutscene=showEnhancedEndingCutscene;

export var SESSION_LOG_KEY_V7='tf-session-log';
window.SESSION_LOG_KEY_V7 = SESSION_LOG_KEY_V7;

export function loadSessionLog(){ try{ return JSON.parse(lsGet(SESSION_LOG_KEY_V7)||'[]'); }catch(e){ return []; } }
window.loadSessionLog = loadSessionLog;

export function saveSessionLogV7(d){ try{ lsSet(SESSION_LOG_KEY_V7,JSON.stringify(d)); }catch(e){} }
window.saveSessionLogV7 = saveSessionLogV7;

export function saveSessionSummary(){
  var turnCount=S.msgCount||0;
  if(turnCount<3) return;
  var log=loadSessionLog();
  var prevSession=log[log.length-1];
  var prevTurn=prevSession?prevSession.endTurn||0:0;
  if(turnCount<=prevTurn) return;
  var diary=typeof loadDiary==='function'?loadDiary():[];
  var thisDiary=diary.filter(function(d){return d.turn>prevTurn;}).slice(-3);
  var causal=loadCausalLog();
  var thisCausal=causal.filter(function(c){return c.turn>prevTurn;}).slice(-3);
  var session={
    id:Date.now(), startTurn:prevTurn, endTurn:turnCount, duration:turnCount-prevTurn,
    gold:S.gold||0, level:typeof loadPlayerLevel==='function'?loadPlayerLevel():1,
    location:typeof loadCurrentLocation==='function'?(loadCurrentLocation()||{}).name||'':'',
    highlights:thisDiary.map(function(d){return (d.content||'').slice(0,60);}),
    causalNotes:thisCausal.map(function(c){return (c.choice||'').slice(0,30)+'→'+(c.effect||'');}),
    at:new Date().toLocaleString('ko-KR'),
  };
  log.push(session);
  
  saveSessionLogV7(log);
}
window.saveSessionSummary = saveSessionSummary;

window.saveSessionSummary=saveSessionSummary;

export function showLastSessionSummary(){
  var log=loadSessionLog();
  if(!log.length) return;
  var last=log[log.length-1];
  if(!last||!last.duration) return;
  var modal=document.createElement('div');
  modal.style.cssText='position:fixed;inset:0;background:#000000bb;z-index:9990;display:flex;align-items:center;justify-content:center;padding:16px';
  var hlHtml=last.highlights&&last.highlights.length?'<div style="font-family:\'Cinzel\',serif;font-size:8px;color:var(--dim);margin-bottom:4px">주요 사건</div>'+last.highlights.map(function(h){return '<div style="padding:4px 7px;background:#050300;border-left:2px solid var(--gold);margin-bottom:3px;font-size:9px;color:#c8a96e">'+h+'</div>';}).join(''):'';
  var cnHtml=last.causalNotes&&last.causalNotes.length?'<div style="font-family:\'Cinzel\',serif;font-size:8px;color:var(--dim);margin:8px 0 4px">선택과 결과</div>'+last.causalNotes.map(function(c){return '<div style="font-size:8px;color:var(--dim);padding:2px 0">• '+c+'</div>';}).join(''):'';
  modal.innerHTML='<div style="background:#0d0800;border:1px solid var(--gold);padding:16px;max-width:360px;width:100%;border-radius:3px"><div style="font-family:\'Cinzel\',serif;font-size:11px;color:var(--gold);margin-bottom:10px;letter-spacing:1px">📋 이전 세션 요약</div><div style="font-size:9px;color:var(--dim);margin-bottom:8px">'+last.at+' · 턴 '+last.startTurn+'~'+last.endTurn+' ('+last.duration+'턴)'+( last.location?' · '+last.location:'')+' · 골드 '+last.gold+'G</div>'+hlHtml+cnHtml+'<button onclick="this.closest(\'[style*=fixed]\').remove()" style="width:100%;margin-top:12px;padding:8px;background:linear-gradient(135deg,#1a1200,#2a2000);border:1px solid var(--gold);color:var(--gold);font-family:\'Cinzel\',serif;font-size:10px;cursor:pointer;border-radius:2px">모험을 계속한다</button></div>';
  document.body.appendChild(modal);
  setTimeout(function(){ try{ modal.remove(); }catch(e){} }, 8000);
}
window.showLastSessionSummary = showLastSessionSummary;

window.showLastSessionSummary=showLastSessionSummary;

(function patchV7(){
  var tryPatch=function(){
    if(window._v7Patched) return;
    if(typeof window.sendMsg!=='function'||typeof window.buildLightSystem!=='function'){
      setTimeout(tryPatch,1500); return;
    }
    window._v7Patched=true;

    // [버그 수정] 이 자리에 있던 sendMsg 훅(인과 감지 + 마일스톤 체크)은
    // window.sendMsg를 감싸는 방식이라(다른 죽은 훅들과 동일한 원인) 한
    // 번도 실행되지 않았다. quest/086의 sendMsg() 응답 후처리 블록에
    // 네이티브로 연결했다.

    // buildLightSystem 훅: 인과 BLS + 목표 BLS 주입
    var _origBLS=window.buildLightSystem;
    window.buildLightSystem=function(){
      var result=_origBLS.apply(this,arguments);
      try{
        var c=getCausalBLS();
        if(c && typeof result==='string') result+=c;
      }catch(e){}
      try{
        var goals=S.character&&S.character._goals||[];
        if(goals.length && typeof result==='string'){
          result+='\n[🎯 이번 생의 목표] '+goals.join(' / ')+' — 이 목표가 서사의 동기와 긴장감으로 자연스럽게 작동해야 한다.';
        }
      }catch(e){}
      return result;
    };

    // [버그 수정] 여기 있던 startGame 훅(이전 세션 요약 저장)은 startGame이
    // 정의된 core/084의 실제 호출부가 bare 식별자라 한 번도 적용되지
    // 못했다. 같은 로직을 실제 정의부(startGame 본문 맨 앞)에 네이티브로
    // 옮겼다.

    // doStartChat 훅: 신분별 오프닝 주입
    var _origDoStart=window.doStartChat;
    if(_origDoStart){
      window.doStartChat=async function(){
        // 신분별 오프닝 장면 S._nextInjectedContext로 주입
        try{
          var char=S.character||{};
          var OPENING_SCENES={
            noble:'귀족 저택. 아침 햇살이 스테인드글라스를 통해 쏟아진다. 하인들이 바쁘게 움직이고 창밖으로 광활한 영지가 펼쳐진다. 오늘은 중요한 결정을 내려야 할 날이다. 귀족으로서의 지시, 외교, 정치적 선택을 위주로 첫 장면을 열어라.',
            royalty:'왕궁 내실. 황금빛 태양이 옥좌 위로 쏟아지고 근위병들이 양 옆에 서 있다. 어딘가에서 음모의 냄새가 풍긴다. 왕족의 무게가 어깨를 짓누른다. 권력, 음모, 왕실 의례 위주로 장면을 열어라.',
            slave:'어둡고 습한 광산 입구. 쇠사슬이 손목을 옥죄고 감시자의 눈초리가 서늘하다. 새벽빛이 동굴 틈으로 희미하게 들어온다. 오늘도 살아남아야 한다. 탈출, 생존, 저항 위주로 장면을 열어라.',
            soldier:'병영 훈련장. 새벽 나팔 소리와 함께 하루가 시작된다. 새로운 명령이 떨어졌다. 임무, 훈련, 전우 관계 위주로 장면을 열어라.',
            merchant:'활기찬 무역항 부두. 배가 도착하고 상자들이 부려지고 있다. 예상치 못한 기회 혹은 위기가 찾아왔다. 교역, 협상, 이익 계산 위주로 장면을 열어라.',
            outlaw:'왕국 법 바깥의 숲 은신처. 모닥불 주위에 동료들이 모여 있다. 현상금 사냥꾼이 흔적을 쫓고 있다는 소식이 들어온다. 도주, 계략, 의적 행동 위주로 장면을 열어라.',
            clergy:'오래된 성당의 새벽 기도 시간. 향 냄새와 촛불이 공간을 채운다. 어제 이상한 계시를 받았다. 신앙, 치유, 도덕적 선택 위주로 장면을 열어라.',
            wanderer:'황야의 갈림길. 지평선 너머로 도시의 실루엣이 보인다. 어디로 가든 운명이 기다리고 있다. 자유로운 탐험, 만남, 선택 위주로 장면을 열어라.',
            commoner:'북적이는 시장 골목. 상인들의 외침과 군중의 소음이 가득하다. 평범한 하루가 시작되려던 그 순간 무언가 이상한 일이 벌어진다. 서민적 선택, 생계, 작은 모험 위주로 장면을 열어라.',
          };
          var rankId=((char.socialRankId||'')+(char.socialRank||'')).toLowerCase();
          var openingKey=/귀족|noble|영주|백작|후작|공작|남작/.test(rankId)?'noble':/왕족|royalt|왕자|공주|황족|황제/.test(rankId)?'royalty':/노예|slave|포로|죄인/.test(rankId)?'slave':/군인|병사|기사|soldier|용병|전사|드래곤 라이더/.test(rankId)?'soldier':/상인|merchant|행상|무역/.test(rankId)?'merchant':/무법|outlaw|도적|산적|현상금/.test(rankId)?'outlaw':/성직|clergy|신관|수도사|수녀|사제/.test(rankId)?'clergy':/방랑|wanderer|나그네|여행자|떠돌이/.test(rankId)?'wanderer':'commoner';
          if(S._nextInjectedContext!==undefined){
            S._nextInjectedContext=(S._nextInjectedContext||'')+' [오프닝 장면 지시: '+OPENING_SCENES[openingKey]+']';
          }
          var goals=char._goals||[];
          if(goals.length && S._nextInjectedContext!==undefined){
            S._nextInjectedContext=(S._nextInjectedContext||'')+' [이번 생의 목표: '+goals.join(' / ')+'. 오프닝 장면에 이 목표와 관련된 복선을 자연스럽게 심어라.]';
          }
          // [참고] 난이도(S._goalDifficulty)/실제 클리어 목표(CYCLE_GOAL) 연계는
          // quest/086의 실제 doStartChat() 안에 네이티브로 구현되어 있다. 이 훅
          // (window.doStartChat)은 core/084가 doStartChat을 모듈 내부 바인딩으로
          // 직접 호출하기 때문에 실제로는 호출되지 않는 죽은 코드라, 여기에 같은
          // 로직을 중복 구현하지 않는다.
        }catch(e){}
        return _origDoStart.apply(this,arguments);
      };
    }

    // [참고] 마일스톤/나침반 패널은 quest/086의 renderPanel() switch에
    // 네이티브로 추가했다 — openP()가 renderPanel을 모듈 내부 바인딩으로
    // 직접 호출하는 구조라 이 window.renderPanel 래핑은 (다른 훅들과 같은
    // 이유로) 실제로는 한 번도 호출된 적이 없는 죽은 코드였다.

    // [13차 감사 FIX] window.showEndingCutscene은 애초에 이 게임 어디에서도
    // 그 이름으로 정의된 적이 없다(실제 엔딩 실행부는 ui/155의
    // triggerEnding() 하나뿐, 이름부터 다름) — 그래서 _origEnding이 항상
    // undefined였고 이 래핑 블록 자체가 한 번도 실행되지 않았다. 연출 모달
    // (showEnhancedEndingCutscene)은 ui/155의 triggerEnding() 안에서 직접
    // 호출하도록 옮겼다.

    // [참고] SETUP_STEPS의 '_goals' 단계는 이제 data/084에 네이티브로 정의되어
    // 있어(위 SETUP_STEPS.push는 core/084의 renderSetupStep이 모듈 내부에서
    // 직접 호출되는 구조상 타이밍에 의존하는 죽은 패턴이었다) 여기서 다시
    // push하지 않는다.

    // setupChar에 _goals 필드 추가
    try{
      if(typeof window.setupChar!=='undefined' && window.setupChar._goals===undefined){
        window.setupChar._goals=[];
      }
    }catch(e){}
  };
  setTimeout(tryPatch, 3000);
})();

window.toggleLifeGoal=function(label){
  try{
    if(typeof window.setupChar==='undefined') return;
    if(!Array.isArray(window.setupChar._goals)) window.setupChar._goals=[];
    var g=window.setupChar._goals;
    var idx=g.indexOf(label);
    if(idx>=0){ window.setupChar._goals=g.filter(function(x){return x!==label;}); }
    else if(g.length<3){ window.setupChar._goals=g.concat([label]); }
    else{ if(typeof toast==='function') toast('최대 3개까지 선택 가능합니다',1500); return; }
    if(typeof renderSetupStep==='function') renderSetupStep();
  }catch(e){ console.warn('[toggleLifeGoal]',e); }
};

// [참고] 이번 생의 목표 선택 UI(GOAL_OPTIONS 렌더링)는 core/084의
// renderSetupStep()에 네이티브 type==='goals' 분기로 이식되었다. 이 파일의
// window.renderSetupStep 래핑 패턴은 core/084가 renderSetupStep을 모듈 내부
// 바인딩으로 직접 호출하는 구조상 실제로는 절대 호출되지 않는 죽은 코드였기
// 때문에(같은 이유로 doStartChat/startGame 훅도 죽은 코드) 여기서는 더 이상
// 중복 구현하지 않는다. LIFE_GOALS 원본 데이터는 data/030에 있다.

// [13차 감사 FIX — 제거] 이 블록은 window.nextSetupStep이 정의되기를
// 기다렸다가 감싸려 했지만, 챕터 진행 버튼의 실제 함수명은 처음부터
// nextSetupStep이 아니라 setupNext(core/084)라서 그 조건이 영원히
// 참이 될 수 없었다 — 매 1.5초마다 무한히 폴링만 하는 죽은 루프였다.
// 이 블록이 하려던 일(_goals 단계에서 빈 배열 초기화 후 다음 단계로
// 진행)은 이미 setupNext() 안에 네이티브로 구현돼 있어(옵셔널 필드
// 목록에 '_goals' 포함 + 배열 초기화) 별도 조치 없이도 정상 동작한다.
