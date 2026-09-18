// 플레이어 평판 소문 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { addProphecy, getProphecyBLS } from '../lore/157-예언-성취-추적-시스템.js';
import { addEvent } from '../misc/142-③-사건-DB-태그-인덱스-전문-검색.js';
import { applyLegacyBonus, getLegacyBLS, saveLoopLegacy } from '../progression/156-NG-회차-계승-시스템.js';
import { lsGet, lsSet } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { loadNpcDB } from './140-①-NPC-DB-가장-세분화.js';
import { upsertRelation } from './143-④-관계-DB-NPC-간-관계망.js';

export const RUMOR_KEY = 'tf-player-rumors';

export function loadPlayerRumors(){ try{ return JSON.parse(lsGet(RUMOR_KEY)||'[]'); }catch(e){ return []; } }
window.loadPlayerRumors = loadPlayerRumors;

export function savePlayerRumors(d){ try{ lsSet(RUMOR_KEY,JSON.stringify(d)); }catch(e){} }
window.savePlayerRumors = savePlayerRumors;

export function addPlayerRumor(text, origin, positive, spreadTo){
  const rumors = loadPlayerRumors();
  rumors.push({
    id:       'rm_'+Date.now(),
    text,
    origin:   origin||'알 수 없는 곳',
    positive: positive!==false,
    spreadTo: spreadTo||['central'],
    distorted: false,
    distortedText: null,
    addedTurn: S.msgCount||0,
  });
  // rumors 무제한
  savePlayerRumors(rumors);
}
window.addPlayerRumor = addPlayerRumor;

window.addPlayerRumor = addPlayerRumor;

export function getRumorBLS(){
  const rumors = loadPlayerRumors().slice(-6);
  if(!rumors.length) return '';
  const pos = rumors.filter(function(r){ return r.positive; });
  const neg = rumors.filter(function(r){ return !r.positive; });
  const lines = [];
  if(pos.length) lines.push('긍정: '+pos.slice(-2).map(function(r){ return '"'+r.text.slice(0,40)+'"'; }).join(' / '));
  if(neg.length) lines.push('부정: '+neg.slice(-2).map(function(r){ return '"'+r.text.slice(0,40)+'"'; }).join(' / '));
  return '\n\n[🗣️ 플레이어 평판 소문]\n'+lines.join('\n')
    +'\n처음 만나는 NPC는 이 소문 중 하나를 들었을 수 있다. 소문이 와전됐을 수도 있다.'
    +'\n플레이어 중요 행동 후 GS: "player_rumor":{"text":"소문 내용","origin":"발원지","positive":true}';
}
window.getRumorBLS = getRumorBLS;

window.getRumorBLS = getRumorBLS;

export const NPC_DRAMA_KEY = 'tf-npc-drama';

export function loadNpcDramas(){ try{ return JSON.parse(lsGet(NPC_DRAMA_KEY)||'[]'); }catch(e){ return []; } }
window.loadNpcDramas = loadNpcDramas;

export function saveNpcDramas(d){ try{ lsSet(NPC_DRAMA_KEY,JSON.stringify(d)); }catch(e){} }
window.saveNpcDramas = saveNpcDramas;

export function triggerNpcDrama(npcA, npcB, dramaType, desc){
  const dramas = loadNpcDramas();
  dramas.push({
    id: 'dm_'+Date.now(),
    npcA, npcB,
    type: dramaType||'conflict',
    desc: desc||'',
    resolved: false,
    turn: S.msgCount||0,
  });
  if(dramas.length>30) dramas.splice(0,dramas.length-30);
  saveNpcDramas(dramas);

  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n\n[🎭 NPC 간 드라마 발생]\n'
    +npcA+' ↔ '+npcB+': '+(desc||dramaType)
    +'\n이 갈등/사건이 플레이어가 모르는 사이에 진행됐다. 적절한 시점에 자연스럽게 서사에 등장시켜라.';

  if(typeof upsertRelation==='function') upsertRelation(npcA,npcB,{ delta:dramaType==='alliance'?+15:-15, desc:desc||dramaType, event:'npc_drama' });
  if(typeof addEvent==='function') addEvent({ title:npcA+' vs '+npcB+': '+dramaType, desc:desc, tags:['npc_drama',npcA,npcB], worldImpact:4 });
}
window.triggerNpcDrama = triggerNpcDrama;

window.triggerNpcDrama = triggerNpcDrama;

window._dramaSchedulerTurn = 0;

export function runDramaScheduler(){
  const cur = S.msgCount||0;
  if(cur - window._dramaSchedulerTurn < 15) return;
  window._dramaSchedulerTurn = cur;

  const npcDB = typeof loadNpcDB==='function' ? loadNpcDB() : {};
  const names = Object.keys(npcDB).slice(0,8);
  if(names.length < 2) return;

  // 랜덤 두 NPC 선택
  const a = names[Math.floor(Math.random()*names.length)];
  let b = names[Math.floor(Math.random()*names.length)];
  while(b===a) b = names[Math.floor(Math.random()*names.length)];

  const types = ['conflict','alliance','secret_share','rivalry','betrayal_attempt','romance'];
  const type = types[Math.floor(Math.random()*types.length)];

  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n[🎭 NPC 드라마 자동 생성] '+a+'과 '+b+' 사이에 '+type+' 상황이 발생했다. 서사에서 자연스럽게 등장시켜라.'
    +'\nGS: "npc_drama":{"npcA":"'+a+'","npcB":"'+b+'","type":"'+type+'","desc":"구체적 상황"}';
}
window.runDramaScheduler = runDramaScheduler;

window.runDramaScheduler = runDramaScheduler;

// [버그 수정] 이 자리에 있던 hookNGPlusSendMsg는 window.sendMsg를 감싸는
// 방식이라(quest/086이 sendMsg를 로컬 바인딩으로 직접 호출해 재할당이
// 도달 못 함 — 다른 죽은 훅들과 동일한 원인) 한 번도 실행되지 않았다.
// runDramaScheduler()(15턴 간격 자체 게이트 보유)는 quest/086의
// sendMsg() 전송 직전(원래 순서와 동일)에 네이티브로 병합했다. gs 필드
// (player_rumor/prophecy_add/prophecy_fulfill/npc_drama/apply_legacy/
// save_loop_legacy)는 window.processGSBlock(gs)에 옮겨 연결한다. 예언
// 키워드 자동 감지·중요 행동 자동 소문 생성(텍스트 기반, gs와 무관)은
// quest/086의 응답 후처리 블록에 네이티브로 병합했다.
(function hookNGPlusGS(){
  const t=function(){
    if(window._ngPlusGSHooked) return;
    if(typeof window.processGSBlock!=='function'){ setTimeout(t,1500); return; }
    window._ngPlusGSHooked=true;
    const _o=window.processGSBlock;
    window.processGSBlock=function(gs){
      const r=_o.apply(this,arguments);
      try{
        if(gs){
          if(gs.player_rumor) addPlayerRumor(gs.player_rumor.text,gs.player_rumor.origin,gs.player_rumor.positive);
          if(gs.prophecy_add) addProphecy(gs.prophecy_add.text,gs.prophecy_add.source);
          if(gs.prophecy_fulfill) window.fulfillProphecy(gs.prophecy_fulfill.id,gs.prophecy_fulfill.how,gs.prophecy_fulfill.twisted);
          if(gs.npc_drama) triggerNpcDrama(gs.npc_drama.npcA,gs.npc_drama.npcB,gs.npc_drama.type,gs.npc_drama.desc);
          if(gs.apply_legacy) applyLegacyBonus();
          if(gs.save_loop_legacy) saveLoopLegacy(gs.save_loop_legacy);
        }
      }catch(e){}
      return r;
    };
  };
  setTimeout(t,3000);
})();

(function hookNGPlusBLS(){
  const t=function(){
    if(window._ngPlusBLSHooked) return;
    const fn=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn){ setTimeout(t,3000); return; }
    window._ngPlusBLSHooked=true;
    const _o=window[fn];
    window[fn]=function(){
      const r=_o.apply(this,arguments);
      try{
        const parts=[];
        const leg=getLegacyBLS(); if(leg) parts.push(leg);
        const ph=getProphecyBLS(); if(ph) parts.push(ph);
        const rum=getRumorBLS(); if(rum) parts.push(rum);
        if(!parts.length) return r;
        return typeof r==='string'?r+parts.join(''):r;
      }catch(e){ return r; }
    };
  };
  setTimeout(t,4800);
})();

console.log('[TaleForge] NG+ / 예언 / 소문 / NPC 드라마 로드 완료 ✓');
