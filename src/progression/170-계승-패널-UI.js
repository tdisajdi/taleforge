// 계승 패널 UI
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { ENDING_DEFINITIONS, SEAL_DEFINITIONS } from '../data/155-⑭-메모리-패널-UI.js';
import { HERITAGE_ITEMS, MILESTONES } from '../data/165-저장소.js';
import { esc } from '../utils.js';
import { loadHeritage, loadLoopRecords, loadMilestones } from '../world/165-저장소.js';
import { v36_getReincarnationCount } from './014-환생-누적-시스템-110번.js';

export function renderHeritagePanel(){
  const body = document.getElementById('pb-heritage');
  if(!body) return;
  const h      = loadHeritage();
  const ms     = loadMilestones();
  const records = loadLoopRecords();
  const items  = h.items||{};
  const loop   = typeof v36_getReincarnationCount==='function' ? v36_getReincarnationCount() : 0;

  // 통계
  const ownedCount  = Object.keys(items).length;
  const totalItems  = Object.keys(HERITAGE_ITEMS).length;
  const msCount     = ms.length;
  const totalMs     = MILESTONES.length;

  let html = '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">🏛️ 계승 / 유산</div>';

  // 요약
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;margin-bottom:10px">';
  [['🔄',loop+'회차','루프'],['🏛️',ownedCount+'/'+totalItems,'계승 아이템'],['👑',msCount+'/'+totalMs,'마일스톤']].forEach(function(item){
    html += '<div style="padding:5px;background:#090600;border:1px solid #2a1a05;text-align:center">'
      +'<div style="font-size:13px;color:var(--gold)">'+item[1]+'</div>'
      +'<div style="font-size:8px;color:var(--dim)">'+item[0]+' '+item[2]+'</div></div>';
  });
  html += '</div>';

  // 현재 적용된 계승 보너스
  if(S.heritageApplied){
    const ap = S.heritageApplied;
    html += '<div style="padding:8px 10px;background:#0a0800;border:1px solid #3a2a05;margin-bottom:10px">';
    html += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin-bottom:4px">✦ 현재 회차 적용 중</div>';
    if(ap.stats&&(ap.stats.atk||ap.stats.def||ap.stats.hp))
      html += '<div style="font-size:9px;color:#80c080">스탯: ATK+'+ap.stats.atk+' DEF+'+ap.stats.def+' HP+'+ap.stats.hp+'</div>';
    if(ap.expMult&&ap.expMult>1)
      html += '<div style="font-size:9px;color:#80a0e0">경험치 ×'+ap.expMult.toFixed(2)+'</div>';
    if(ap.goldBonus&&ap.goldBonus>0)
      html += '<div style="font-size:9px;color:#c0a030">시작 골드 +'+ap.goldBonus+'G</div>';
    if(ap.effects&&ap.effects.length)
      html += '<div style="font-size:9px;color:#a060e0">효과: '+ap.effects.join(', ')+'</div>';
    html += '</div>';
  }

  // 마일스톤 진행도
  html += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">👑 루프 마일스톤</div>';
  html += '<div style="margin-bottom:10px">';
  MILESTONES.forEach(function(m){
    const done = ms.includes(m.id);
    const pct  = Math.min(100,Math.round(loop/m.loop*100));
    html += '<div style="display:flex;align-items:center;gap:7px;padding:6px 8px;background:#090600;border:1px solid '+(done?'#c8a96e33':'#1a1005')+';margin-bottom:3px">'
      +'<span style="font-size:16px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:14}):(m?.icon))+'</span>'
      +'<div style="flex:1">'
      +'<div style="font-size:9px;color:'+(done?'var(--gold)':'var(--dim)')+'">'+esc(m.name)+'</div>'
      +'<div style="font-size:8px;color:#5a4a2a">'+loop+'/'+m.loop+'회차 — '+esc(m.reward.slice(0,40))+'</div>'
      +(done?'':'<div style="height:2px;background:#1a1005;border-radius:1px;margin-top:2px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:#6a5a3a;border-radius:1px"></div></div>')
      +'</div>'
      +(done?'<span style="font-size:10px">✅</span>':'')
      +'</div>';
  });
  html += '</div>';

  // 계승 아이템 목록 (등급별)
  ['S','A','B','C'].forEach(function(grade){
    const gradeDefs = Object.entries(HERITAGE_ITEMS).filter(function(e){ return e[1].grade===grade; });
    const gradeOwned = gradeDefs.filter(function(e){ return items[e[0]]; }).length;
    const gradeColor = grade==='S'?'#e0c040':grade==='A'?'#c06060':grade==='B'?'#6090c0':'#6a8a6a';

    html += '<div style="margin-bottom:8px">';
    html += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:'+gradeColor+';letter-spacing:1px;margin-bottom:4px">'+grade+'급 계승 ('+gradeOwned+'/'+gradeDefs.length+')</div>';
    gradeDefs.forEach(function(entry){
      const id=entry[0], def=entry[1];
      const cnt   = items[id]||0;
      const owned = cnt>0;
      html += '<div style="padding:7px 9px;background:#090600;border:1px solid '+(owned?gradeColor+'33':'#1a1005')+';margin-bottom:3px;opacity:'+(owned?1:0.6)+'">'
        +'<div style="display:flex;align-items:center;gap:6px">'
        +'<span style="font-size:16px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def?.icon))+'</span>'
        +'<div style="flex:1">'
        +'<div style="font-size:9px;color:'+(owned?'var(--gold)':'var(--dim)')+'">'+esc(def.name)+(cnt>1?' ×'+cnt:'')+'</div>'
        +'<div style="font-size:8px;color:#5a4a2a">'+esc(def.effect.slice(0,50))+'</div>'
        +(def.tradeoff?'<div style="font-size:8px;color:#e08050">⚠️ '+esc(def.tradeoff)+'</div>':'')
        +(def.stackable&&!owned?'<div style="font-size:8px;color:#4a6a4a">중첩 가능 (최대 '+def.maxStack+'중첩)</div>':'')
        +'</div>'
        +(owned?'<span style="font-size:10px;color:'+gradeColor+'">✓</span>':'')
        +'</div>'
        +(owned?'':'<div style="font-size:8px;color:#3a3030;margin-top:3px">해방 조건: '+esc(def.unlock)+'</div>')
        +'</div>';
    });
    html += '</div>';
  });

  // 회차 기록 히스토리
  if(records.length){
    html += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">📜 회차 기록</div>';
    records.slice(-5).reverse().forEach(function(r){
      const endDef = typeof ENDING_DEFINITIONS!=='undefined' ? ENDING_DEFINITIONS[r.endingId] : null;
      html += '<div style="padding:5px 8px;background:#090600;border:1px solid #1a1005;margin-bottom:3px;font-size:8px;color:var(--dim)">'
        +(r.loop+1)+'회차 · '+(endDef?endDef.icon+endDef.name:'알 수 없는 엔딩')
        +' · 봉인석 복원 '+(r.restoreCount||0)+'/'+((typeof SEAL_DEFINITIONS!=='undefined')?Object.keys(SEAL_DEFINITIONS).length:11)
        +' · 계승 '+(r.heritage&&r.heritage.length||0)+'개'
        +'</div>';
    });
  }

  body.innerHTML = html;
}
window.renderHeritagePanel = renderHeritagePanel;

window.renderHeritagePanel = renderHeritagePanel;
