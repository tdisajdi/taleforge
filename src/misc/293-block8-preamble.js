// block8-preamble
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { DILEMMA_TEMPLATES, EMOTION_FX, INJURY_PARTS, PS_PATTERNS, RIVAL_NAMES_LIST, RIVAL_TAUNTS_LIST, RUMOR_TRIGGERS, SENSORY_DB, WEATHER_GAMEPLAY } from '../data/293-block8-preamble.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { buildNpcTopicSummaryHint } from '../npc/272-NPC-대화-학습-시스템-설계-문서-파일-최상단-주석-참조.js';
import { addUnifiedFame } from '../npc/286-6-평판명성-통합-시스템.js';
import { buildTimedQuestContext, tickTimedQuests } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadAtmosphere, loadNPCs } from './001-block0-preamble.js';
import { _isWanderer, getWdrAxisTier, loadWdrAxis, renderWandererAxisPanel } from './230-방랑자-전용-혼돈질서-슬라이더-개연성P-시스템.js';

export const NPC_REUNION_MEM_KEY = 'tf-npc-reunion-mem2';

export function loadNpcReunionMem(){ try{ return JSON.parse(lsGet(NPC_REUNION_MEM_KEY)||'{}'); }catch(e){ return {}; } }
window.loadNpcReunionMem = loadNpcReunionMem;

export function saveNpcReunionMem(d){ try{ lsSet(NPC_REUNION_MEM_KEY, JSON.stringify(d)); }catch(e){} }
window.saveNpcReunionMem = saveNpcReunionMem;

export function recordNpcInteraction(npcName, type, detail){
  const mem = loadNpcReunionMem();
  if(!mem[npcName]) mem[npcName] = { interactions:[], lastTurn:0 };
  mem[npcName].interactions.push({ type, detail:String(detail||'').slice(0,40), turn:S.msgCount||0 });
  mem[npcName].interactions = mem[npcName].interactions.slice(-5);
  mem[npcName].lastTurn = S.msgCount||0;
  saveNpcReunionMem(mem);
}
window.recordNpcInteraction = recordNpcInteraction;

window.recordNpcInteraction = recordNpcInteraction;

export function buildNpcReunionContext(aiText){
  try{
    const npcs = loadNPCs()||[];
    const mem  = loadNpcReunionMem();
    const hints = [];
    for(const npc of npcs.slice(0,10)){
      if(!aiText.includes(npc.name)) continue;
      const history = mem[npc.name];
      if(!history || !history.interactions.length) continue;
      const last = history.interactions[history.interactions.length-1];
      const turnAgo = (S.msgCount||0) - (history.lastTurn||0);
      if(turnAgo < 3) continue;
      const REUNION_HINTS = {
        helped:    npc.icon+''+npc.name+'은(는) 이전에 도움받은 것을 기억한다. 따뜻한 눈빛으로 알아보며 은혜를 갚으려 할 수 있다.',
        betrayed:  npc.icon+''+npc.name+'은(는) 배신당한 기억이 있다. 차갑게 굳은 표정으로 경계심을 드러낸다.',
        fought:    npc.icon+''+npc.name+'은(는) 이전에 싸운 기억이 있다. 긴장감이 감돌며 손이 무기 쪽으로 향한다.',
        befriended:npc.icon+''+npc.name+'은(는) 친구로 기억한다. 반갑게 인사하며 정보를 나누려 한다.',
        traded:    npc.icon+''+npc.name+'은(는) 거래 상대로 기억한다. 눈빛에 계산이 담겨있다.',
      };
      const hint = REUNION_HINTS[last.type];
      if(hint) hints.push(hint);
    }
    return hints.length ? '\n[👥 NPC 재회 기억] '+hints.slice(0,2).join(' / ') : '';
  }catch(e){ return ''; }
}
window.buildNpcReunionContext = buildNpcReunionContext;

window.buildNpcReunionContext = buildNpcReunionContext;

export const NPC_TOPIC_CACHE_KEY = 'tf-npc-topic-cache';

export function loadNpcTopicCache(){ try{ return JSON.parse(lsGet(NPC_TOPIC_CACHE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadNpcTopicCache = loadNpcTopicCache;

export function saveNpcTopicCache(d){ try{ lsSet(NPC_TOPIC_CACHE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveNpcTopicCache = saveNpcTopicCache;

export const NPC_TOPIC_MAX_PER_NPC = 9999;

export const NPC_TOPIC_MAX_NPCS    = 9999;

export function cacheNpcTopicResponse(npcName, topic, summary){
  if(!npcName||!topic||!summary) return;
  const cache = loadNpcTopicCache();
  const now = S.msgCount||0;
  if(!cache[npcName]) cache[npcName] = {};
  cache[npcName][topic] = { summary: summary.slice(0,150), turn: now };
  // NPC당 만료 항목 제거 후 5개 초과면 가장 오래된 것 삭제
  const topics = Object.keys(cache[npcName]);
  // TTL 없이 개수만 제한 (전생 기억처럼 유지)
  const remaining = Object.keys(cache[npcName]);
  if(remaining.length > NPC_TOPIC_MAX_PER_NPC){
    const oldest = remaining.sort((a,b)=>(cache[npcName][a]?.turn||0)-(cache[npcName][b]?.turn||0))[0];
    delete cache[npcName][oldest];
  }
  // 전체 NPC 20명 초과 시 가장 오래전에 대화한 NPC 제거
  const npcNames = Object.keys(cache);
  if(npcNames.length > NPC_TOPIC_MAX_NPCS){
    const lastTurn = n => Math.max(...Object.values(cache[n]||{}).map(v=>v.turn||0));
    const leastRecent = npcNames.sort((a,b)=>lastTurn(a)-lastTurn(b))[0];
    delete cache[leastRecent];
  }
  saveNpcTopicCache(cache);
}
window.cacheNpcTopicResponse = cacheNpcTopicResponse;

window.cacheNpcTopicResponse = cacheNpcTopicResponse;

export function getNpcTopicHint(npcName, userMsg){
  if(!npcName||!userMsg) return '';
  const cache = loadNpcTopicCache();
  const npcCache = cache[npcName];
  if(!npcCache) return '';
  const turn = S.msgCount||0;
  const lc = userMsg.toLowerCase();
  // 캐시된 주제 중 현재 입력과 겹치는 것 찾기 (20턴 이내)
  for(const [topic, data] of Object.entries(npcCache)){
    // TTL 없음 — 전생 기억처럼 영구 보존, 개수만 제한
    if(lc.includes(topic) || topic.split(' ').some(w=>w.length>1&&lc.includes(w))){
      return `\n[💬 ${npcName} 이전 답변 참고: ${data.summary}] 이 내용과 일관성을 유지하되 새로운 각도로 응답하라.`;
    }
  }
  return '';
}
window.getNpcTopicHint = getNpcTopicHint;

window.getNpcTopicHint = getNpcTopicHint;

export function detectNpcInteractionFromText(text, userMsg){
  try{
    const npcs = loadNPCs()||[];
    const lc = (text+' '+userMsg).toLowerCase();
    for(const npc of npcs.slice(0,15)){
      if(!text.includes(npc.name)) continue;
      let type = null;
      if(/도움|구해|살려|치료|보호/.test(lc)) type='helped';
      else if(/배신|팔아|속여|거짓/.test(lc)) type='betrayed';
      else if(/싸워|공격|처치|쓰러/.test(lc)) type='fought';
      else if(/친구|동료|함께|믿/.test(lc)) type='befriended';
      else if(/거래|구매|판매|교환/.test(lc)) type='traded';
      if(type) recordNpcInteraction(npc.name, type, userMsg.slice(0,30));
    }
  }catch(e){}
}
window.detectNpcInteractionFromText = detectNpcInteractionFromText;

window.detectNpcInteractionFromText = detectNpcInteractionFromText;

export function buildBodyStateContext(){
  try{
    const st = S.stats||{};
    const hp = st.hp || 100;
    const mp = st.mp || 100;
    const hints = [];
    const hpPct = Math.round(hp/100*100);
    const mpPct = Math.round(mp/100*100);
    if(hpPct <= 20)      hints.push('생명이 위태롭다. 몸이 심하게 떨리고 시야가 흔들린다. 모든 행동에 한계를 묘사하라.');
    else if(hpPct <= 40) hints.push('심한 부상 상태. 이마에 식은땀, 비틀거리는 발걸음을 묘사하라.');
    else if(hpPct <= 60) hints.push('부상 중. 아프지만 버틸 수 있다. 가끔 상처 부위를 의식하는 묘사를 추가하라.');
    if(mpPct <= 15)      hints.push('마나가 거의 고갈됐다. 마법 사용 시 두통과 현기증을 묘사하라.');
    else if(mpPct <= 35) hints.push('마나가 부족하다. 마법 사용 후 소진감을 느끼는 묘사를 추가하라.');
    const food = st.food || 80;
    const ftg  = st.ftg  || 20;
    if(food <= 20)  hints.push('극심한 배고픔. 음식 냄새에 반응하거나 집중력이 흐트러지는 묘사를 추가하라.');
    else if(food <= 40) hints.push('허기가 진다. 위가 꼬이는 느낌을 가끔 묘사하라.');
    if(ftg >= 80)   hints.push('극도의 피로. 눈꺼풀이 무겁고 반응이 느려지는 묘사를 추가하라.');
    else if(ftg >= 60) hints.push('피로가 쌓였다. 동작 후 숨이 찬 묘사를 추가하라.');
    return hints.length ? '\n[🩸 신체 상태 반영] '+hints.join(' ') : '';
  }catch(e){ return ''; }
}
window.buildBodyStateContext = buildBodyStateContext;

window.buildBodyStateContext = buildBodyStateContext;

export function buildWeatherGameplayContext(){
  try{
    const w = (S.atmosphere||loadAtmosphere()).weather||'none';
    const eff = WEATHER_GAMEPLAY[w];
    return eff ? '\n[🌤️ 날씨 영향: '+w+'] '+eff.hint : '';
  }catch(e){ return ''; }
}
window.buildWeatherGameplayContext = buildWeatherGameplayContext;

window.buildWeatherGameplayContext = buildWeatherGameplayContext;

export const BG_ECHO_KEY = 'tf-bg-echo-turn';

export function buildBackgroundEchoContext(){
  try{
    const bg = S.character && S.character.background;
    if(!bg || bg.length < 5) return '';
    const lastTurn = parseInt(lsGet(BG_ECHO_KEY)||'0');
    const now = S.msgCount||0;
    if(now - lastTurn < 28) return '';
    if(Math.random() > 0.6) return '';
    lsSet(BG_ECHO_KEY, String(now));
    return '\n[📖 배경 기억 소환] 캐릭터 배경: "'+bg+'" 지금 상황이 이 배경과 연결되는 순간이다. 과거의 기억이 스치듯 떠오르거나, 현재 상황이 과거를 연상시키는 짧은 내면 묘사를 자연스럽게 삽입하라.';
  }catch(e){ return ''; }
}
window.buildBackgroundEchoContext = buildBackgroundEchoContext;

window.buildBackgroundEchoContext = buildBackgroundEchoContext;

export const DILEMMA_LAST_KEY = 'tf-dilemma-last';

export function buildDilemmaContext(userMsg){
  try{
    const lastTurn = parseInt(lsGet(DILEMMA_LAST_KEY)||'0');
    const now = S.msgCount||0;
    if(now - lastTurn < 12) return '';
    const lc = userMsg.toLowerCase();
    const match = DILEMMA_TEMPLATES.find(function(d){ return d.trigger.test(lc); });
    if(!match || Math.random() > 0.35) return '';
    lsSet(DILEMMA_LAST_KEY, String(now));
    return '\n[⚖️ 도덕적 딜레마] 이 상황에서 진짜 선택의 무게를 보여라: '+match.dilemma;
  }catch(e){ return ''; }
}
window.buildDilemmaContext = buildDilemmaContext;

window.buildDilemmaContext = buildDilemmaContext;

export const RUMOR_KEY2 = 'tf-rumors2';

export function loadRumors(){ try{ return JSON.parse(lsGet(RUMOR_KEY2)||'[]'); }catch(e){ return []; } }
window.loadRumors = loadRumors;

export function saveRumors(d){ try{ lsSet(RUMOR_KEY2, JSON.stringify(d.slice(-15))); }catch(e){} }
window.saveRumors = saveRumors;

export function updateRumorSystem(userMsg, aiText){
  try{
    const name = (S.character && S.character.name)||'이 인물';
    const lc = (userMsg+' '+aiText).toLowerCase();
    for(var i=0;i<RUMOR_TRIGGERS.length;i++){
      var trig = RUMOR_TRIGGERS[i];
      if(trig.pattern.test(lc) && Math.random() < 0.5){
        const rumors = loadRumors();
        const text = trig.rumor(name);
        rumors.push({ text:text, turn:S.msgCount||0, fame:trig.fame });
        saveRumors(rumors);
        if(typeof addUnifiedFame==='function') addUnifiedFame(trig.fame, '소문');
        if(trig.fame > 0) toast('📢 소문: '+text.slice(0,30)+'...', 3000);
        break;
      }
    }
  }catch(e){}
}
window.updateRumorSystem = updateRumorSystem;

window.updateRumorSystem = updateRumorSystem;

export function buildRumorContext(){
  try{
    const rumors = loadRumors().slice(-3);
    if(!rumors.length) return '';
    return '\n[📢 퍼진 소문] '+rumors.map(function(r){ return r.text; }).join(' / ')+' 이 소문을 아는 NPC는 처음 만나도 이미 알고 있는 반응을 보여라.';
  }catch(e){ return ''; }
}
window.buildRumorContext = buildRumorContext;

window.buildRumorContext = buildRumorContext;

export function buildEmotionEffectContext(){
  try{
    const emotion = S._emotion||'neutral';
    const eff = EMOTION_FX[emotion];
    if(!eff) return '';
    return '\n['+eff.icon+' 감정 상태: '+eff.label+'] '+eff.hint;
  }catch(e){ return ''; }
}
window.buildEmotionEffectContext = buildEmotionEffectContext;

window.buildEmotionEffectContext = buildEmotionEffectContext;

export const ACTIVE_INJURY_KEY = 'tf-active-injuries2';

export function loadActiveInjuries(){ try{ return JSON.parse(lsGet(ACTIVE_INJURY_KEY)||'[]'); }catch(e){ return []; } }
window.loadActiveInjuries = loadActiveInjuries;

export function saveActiveInjuries(d){ try{ lsSet(ACTIVE_INJURY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveActiveInjuries = saveActiveInjuries;

export function checkActiveInjury(){
  try{
    const hp = S.stats && (S.stats.hp || 100);
    if(hp > 50) return;
    if(Math.random() > 0.25) return;
    const injuries = loadActiveInjuries();
    const parts = Object.keys(INJURY_PARTS);
    const available = parts.filter(function(p){ return !injuries.find(function(i){ return i.part===p; }); });
    if(!available.length) return;
    const part = available[Math.floor(Math.random()*available.length)];
    const def = INJURY_PARTS[part];
    injuries.push({ part:part, healIn:def.heal, turn:S.msgCount||0 });
    saveActiveInjuries(injuries);
    if(S.stats && S.stats[def.stat]!==undefined)
      S.stats[def.stat] = Math.max(1, S.stats[def.stat] + def.delta);
    toast('🩹 '+def.icon+' '+def.label+' 부상! '+def.penalty, 3500);
    S._nextInjectedContext = (S._nextInjectedContext||'')+' [🩹 부상: '+def.label+'] '+def.penalty+'. 부상 부위의 통증과 행동 제약을 묘사하라.';
  }catch(e){}
}
window.checkActiveInjury = checkActiveInjury;

window.checkActiveInjury = checkActiveInjury;

export function healActiveInjuries(){
  try{
    const injuries = loadActiveInjuries();
    if(!injuries.length) return;
    const remaining = injuries.filter(function(inj){
      inj.healIn--;
      if(inj.healIn <= 0){
        const def = INJURY_PARTS[inj.part];
        if(def && S.stats && S.stats[def.stat]!==undefined)
          S.stats[def.stat] = Math.min(999, S.stats[def.stat] - def.delta);
        toast('💪 '+(def&&def.icon||'')+' '+(def&&def.label||inj.part)+' 부상 회복!', 2500);
        return false;
      }
      return true;
    });
    saveActiveInjuries(remaining);
  }catch(e){}
}
window.healActiveInjuries = healActiveInjuries;

window.healActiveInjuries = healActiveInjuries;

export function buildActiveInjuryContext(){
  try{
    const injuries = loadActiveInjuries();
    if(!injuries.length) return '';
    const list = injuries.map(function(inj){
      const def = INJURY_PARTS[inj.part];
      return (def&&def.icon||'')+(def&&def.label||inj.part)+'('+((def&&def.penalty)||'')+', '+inj.healIn+'턴 후 회복)';
    }).join(', ');
    return '\n[🩹 현재 부상] '+list+' 부상 부위 제약을 서사에 반영하라.';
  }catch(e){ return ''; }
}
window.buildActiveInjuryContext = buildActiveInjuryContext;

window.buildActiveInjuryContext = buildActiveInjuryContext;

export function buildSensoryContext(){
  try{
    if((S.msgCount||0) % 3 !== 0) return '';
    const loc = S.currentLocation||{};
    const base = SENSORY_DB[loc.type||'city']||SENSORY_DB.city;
    const w = (S.atmosphere||loadAtmosphere()).weather||'none';
    const wExtra = w==='rain'?'빗소리가 지붕을 두드린다.':w==='snow'?'눈이 소리를 삼키고 차가운 공기가 폐를 찌른다.':w==='fog'?'안개가 시야를 막는다.':'';
    return '\n[👁️ 오감 묘사] 소리:'+base.sound+'. 냄새:'+base.smell+'. 촉감:'+base.touch+'. '+wExtra+' 이 중 1~2가지를 이번 묘사에 자연스럽게 녹여라.';
  }catch(e){ return ''; }
}
window.buildSensoryContext = buildSensoryContext;

window.buildSensoryContext = buildSensoryContext;

export const RIVAL_ENEMY_KEY = 'tf-rival-enemies2';

export function loadRivalEnemies(){ try{ return JSON.parse(lsGet(RIVAL_ENEMY_KEY)||'[]'); }catch(e){ return []; } }
window.loadRivalEnemies = loadRivalEnemies;

export function saveRivalEnemies(d){ try{ lsSet(RIVAL_ENEMY_KEY, JSON.stringify(d.slice(-5))); }catch(e){} }
window.saveRivalEnemies = saveRivalEnemies;

export function buildRivalEnemyContext(monsters){
  try{
    if(!monsters||!monsters.length) return '';
    const alive = monsters.filter(function(m){ return m.status==='alive'; });
    if(!alive.length) return '';
    const boss = alive.find(function(m){ return m.isBoss||m.tier==='boss'; })||alive[0];
    const rivals = loadRivalEnemies();
    let rival = rivals.find(function(r){ return r.baseName===boss.name; });
    if(!rival){
      rival = { baseName:boss.name, name:RIVAL_NAMES_LIST[Math.floor(Math.random()*RIVAL_NAMES_LIST.length)]||boss.name, encounters:1 };
      rivals.push(rival);
      saveRivalEnemies(rivals);
      return '';
    }
    rival.encounters++;
    saveRivalEnemies(rivals);
    const taunt = RIVAL_TAUNTS_LIST[Math.floor(Math.random()*RIVAL_TAUNTS_LIST.length)];
    return '\n[⚔️ 라이벌 재등장: '+rival.name+'] '+rival.encounters+'번째 조우. 이 적은 이름이 있고 개성이 있다. 재회의 긴장감을 연출하라. 도발 대사 예시: "'+taunt+'"';
  }catch(e){ return ''; }
}
window.buildRivalEnemyContext = buildRivalEnemyContext;

window.buildRivalEnemyContext = buildRivalEnemyContext;

export const GROWTH_SNAP_KEY = 'tf-growth-snap2';

export function saveGrowthSnapshot(){
  try{
    if(lsGet(GROWTH_SNAP_KEY)) return;
    lsSet(GROWTH_SNAP_KEY, JSON.stringify({ turn:S.msgCount||0, stats:Object.assign({},S.stats||{}), level:typeof loadPlayerLevel==='function'?loadPlayerLevel():1, gold:S.gold||0 }));
  }catch(e){}
}
window.saveGrowthSnapshot = saveGrowthSnapshot;

window.saveGrowthSnapshot = saveGrowthSnapshot;

export function showGrowthComparePanel(){
  try{
    const snap = JSON.parse(lsGet(GROWTH_SNAP_KEY)||'null');
    if(!snap){ toast('게임을 더 진행한 후 확인하세요.', 2000); return; }
    const cur = S.stats||{};
    const curLv = typeof loadPlayerLevel==='function'?loadPlayerLevel():1;
    const isLm = document.body.classList.contains('light-mode');
    const bg=isLm?'#fdf5e8':'#050200', brd='#c8a96e', dim=isLm?'#7a5a30':'var(--dim)';
    const KEY_STATS = ['str','agi','end','mgc','int','per','ldr','wil'];
    const STAT_LABELS = {str:'근력',agi:'민첩',end:'체력',mgc:'마법',int:'지성',per:'지각',ldr:'리더십',wil:'의지'};
    const rows = KEY_STATS.map(function(k){
      const was=snap.stats[k]||0, now2=cur[k]||0, diff=now2-was;
      const color=diff>0?'#60c060':diff<0?'#e05050':'#8a8a6a';
      return '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid '+(isLm?'#e8d8b8':'#1a1000')+'"><span style="color:'+dim+';font-size:11px">'+(STAT_LABELS[k]||k)+'</span><span style="font-size:11px;color:'+brd+'">'+was+' → '+now2+'</span><span style="color:'+color+';font-size:11px">'+(diff>0?'↑':diff<0?'↓':'―')+(Math.abs(diff)||'')+'</span></div>';
    }).join('');
    const ov = document.createElement('div');
    ov.id='growth-compare-panel';
    ov.style.cssText='position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;animation:fadeIn .3s ease';
    ov.innerHTML='';
    var _gcd=document.createElement('div');
    _gcd.style.cssText='width:88%;max-width:360px;background:'+bg+';border:2px solid '+brd+';border-radius:3px;overflow:hidden';
    _gcd.innerHTML='<div style="padding:14px 16px;background:linear-gradient(135deg,#1a1000,#2a1800);border-bottom:1px solid '+brd+';text-align:center"><div style="font-family:Cinzel,serif;font-size:14px;color:'+brd+'">성장 비교</div><div style="font-size:10px;color:'+dim+';margin-top:4px">1턴 → '+(S.msgCount||0)+'턴 / Lv.'+snap.level+' → Lv.'+curLv+'</div></div><div style="padding:12px 16px">'+rows+'<div style="display:flex;justify-content:space-between;padding:8px 0;margin-top:4px"><span style="color:'+dim+';font-size:11px">&#x1F4B0; 골드</span><span style="font-size:11px;color:'+brd+'">'+snap.gold+' &#x2192; '+(S.gold||0)+'</span></div></div>';
    var _gcBtn=document.createElement('div');
    _gcBtn.style.cssText='padding:0 16px 14px';
    var _gcClose=document.createElement('button');
    _gcClose.textContent='닫기';
    _gcClose.style.cssText='width:100%;padding:10px;background:linear-gradient(135deg,#2a1f0d,#3a2a10);border:1px solid '+brd+';color:'+brd+';font-family:Cinzel,serif;font-size:11px;cursor:pointer;border-radius:2px';
    _gcClose.onclick=function(){ document.getElementById('growth-compare-panel').remove(); };
    _gcBtn.appendChild(_gcClose);
    _gcd.appendChild(_gcBtn);
    ov.appendChild(_gcd)
    document.body.appendChild(ov);
  }catch(e){ toast('성장 데이터를 불러올 수 없습니다.',2000); }
}
window.showGrowthComparePanel = showGrowthComparePanel;

window.showGrowthComparePanel = showGrowthComparePanel;

export const PLAY_STYLE_KEY2 = 'tf-play-style2';

export function loadPlayStyle(){ try{ return JSON.parse(lsGet(PLAY_STYLE_KEY2)||'{"combat":0,"talk":0,"stealth":0,"flee":0,"help":0,"betray":0,"explore":0,"craft":0}'); }catch(e){ return {combat:0,talk:0,stealth:0,flee:0,help:0,betray:0,explore:0,craft:0}; } }
window.loadPlayStyle = loadPlayStyle;

export function savePlayStyle(d){ try{ lsSet(PLAY_STYLE_KEY2, JSON.stringify(d)); }catch(e){} }
window.savePlayStyle = savePlayStyle;

export function updatePlayStyle(userMsg){
  try{
    const lc = userMsg.toLowerCase();
    const style = loadPlayStyle();
    Object.keys(PS_PATTERNS).forEach(function(k){ if(PS_PATTERNS[k].test(lc)) style[k]=(style[k]||0)+1; });
    savePlayStyle(style);
  }catch(e){}
}
window.updatePlayStyle = updatePlayStyle;

window.updatePlayStyle = updatePlayStyle;

export function getPlayStyleLabel(){
  try{
    const style = loadPlayStyle();
    const top = Object.entries(style).sort(function(a,b){ return b[1]-a[1]; }).slice(0,2);
    const labels = {combat:'전사형',talk:'외교형',stealth:'은신형',flee:'생존형',help:'구원자형',betray:'배신자형',explore:'탐험가형',craft:'장인형'};
    if(!top[0]||top[0][1]===0) return '알 수 없음';
    return (labels[top[0][0]]||top[0][0])+(top[1]&&top[1][1]>0?'/'+labels[top[1][0]]:'');
  }catch(e){ return '알 수 없음'; }
}
window.getPlayStyleLabel = getPlayStyleLabel;

window.getPlayStyleLabel = getPlayStyleLabel;

export function buildPlayStyleContext(){
  try{
    const total = Object.values(loadPlayStyle()).reduce(function(a,b){ return a+b; },0);
    if(total < 5) return '';
    return '\n[🎭 플레이 성향: '+getPlayStyleLabel()+'] 이 성향에 맞는 선택지와 서사 톤을 자연스럽게 반영하라.';
  }catch(e){ return ''; }
}
window.buildPlayStyleContext = buildPlayStyleContext;

window.buildPlayStyleContext = buildPlayStyleContext;

export function showPlayStylePanel(){
  try{
    const style = loadPlayStyle();
    const total = Math.max(1, Object.values(style).reduce(function(a,b){ return a+b; },0));
    const labels = {combat:'⚔️ 전투',talk:'💬 대화',stealth:'🌑 은신',flee:'💨 도주',help:'🌟 지원',betray:'🗡️ 배신',explore:'🗺️ 탐험',craft:'⚒️ 제작'};
    const isLm = document.body.classList.contains('light-mode');
    const bg=isLm?'#fdf5e8':'#050200', brd='#c8a96e', dim=isLm?'#7a5a30':'var(--dim)';
    const bars = Object.entries(style).sort(function(a,b){ return b[1]-a[1]; }).map(function(e){
      const k=e[0], v=e[1], pct=Math.round(v/total*100);
      return '<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:11px;color:'+dim+'">'+(labels[k]||k)+'</span><span style="font-size:10px;color:'+brd+'">'+v+'회('+pct+'%)</span></div><div style="height:6px;background:'+(isLm?'#e8d8b8':'#1a1000')+';border-radius:3px"><div style="height:6px;width:'+pct+'%;background:'+brd+';border-radius:3px"></div></div></div>';
    }).join('');
    const ov = document.createElement('div');
    ov.id='play-style-panel';
    ov.style.cssText='position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;animation:fadeIn .3s ease';
    ov.innerHTML='';
    var _psd=document.createElement('div');
    _psd.style.cssText='width:88%;max-width:340px;background:'+bg+';border:2px solid '+brd+';border-radius:3px;overflow:hidden';
    _psd.innerHTML='<div style="padding:14px 16px;background:linear-gradient(135deg,#1a1000,#2a1800);border-bottom:1px solid '+brd+';text-align:center"><div style="font-family:Cinzel,serif;font-size:14px;color:'+brd+'">플레이 성향</div><div style="font-size:12px;color:#80c040;margin-top:4px">'+getPlayStyleLabel()+'</div></div><div style="padding:14px 16px">'+bars+'</div>';
    var _psBtn=document.createElement('div');
    _psBtn.style.cssText='padding:0 16px 14px';
    var _psClose=document.createElement('button');
    _psClose.textContent='닫기';
    _psClose.style.cssText='width:100%;padding:10px;background:linear-gradient(135deg,#2a1f0d,#3a2a10);border:1px solid '+brd+';color:'+brd+';font-family:Cinzel,serif;font-size:11px;cursor:pointer;border-radius:2px';
    _psClose.onclick=function(){ document.getElementById('play-style-panel').remove(); };
    _psBtn.appendChild(_psClose);
    _psd.appendChild(_psBtn);
    ov.appendChild(_psd);
    document.body.appendChild(ov);
  }catch(e){}
}
window.showPlayStylePanel = showPlayStylePanel;

window.showPlayStylePanel = showPlayStylePanel;

(function initImmersionV1(){
  setTimeout(function(){
    if(S.character && (S.msgCount||0) <= 2) saveGrowthSnapshot();

    // [버그 수정] 이 자리에 있던 sendMsg 훅(플레이스타일 갱신·딜레마
    // 컨텍스트 주입)은 window.sendMsg를 감싸는 방식이라(quest/086이
    // sendMsg를 로컬 바인딩으로 직접 호출해 재할당이 도달 못 함 — 다른
    // 죽은 훅들과 동일한 원인) 한 번도 실행되지 않았다. quest/086의
    // sendMsg() 전송 직전(원래와 동일한 순서)에 네이티브로 연결했다.

    var _origTick = window.tickGameTime;
    if(typeof _origTick==='function' && !window._immersionTickPatched){
      window._immersionTickPatched = true;
      window.tickGameTime = function(){
        var result = _origTick.apply(this, arguments);
        try{
          if(typeof tickTimedQuests==='function') tickTimedQuests();
          healActiveInjuries();
          checkActiveInjury();
          if(S.character && (S.msgCount||0)<=3) saveGrowthSnapshot();
        }catch(e){}
        return result;
      };
    }

    var _origBLS = window.buildLightSystem;
    if(typeof _origBLS==='function' && !window._immersionBLSPatched){
      window._immersionBLSPatched = true;
      window.buildLightSystem = function(char){
        var result = _origBLS.apply(this, arguments);
        if(typeof result !== 'string') return result;
        try{
          result += buildBodyStateContext();
          result += buildWeatherGameplayContext();
          result += buildBackgroundEchoContext();
          result += buildEmotionEffectContext();
          result += buildActiveInjuryContext();
          result += (typeof buildTimedQuestContext==='function') ? buildTimedQuestContext() : '';
          result += buildSensoryContext();
          result += buildRumorContext();
          result += buildPlayStyleContext();
          // [18차 감사 FIX] currentMonsters는 코드베이스 어디에도 선언된
          // 적 없는 참조라 이 typeof 체크가 항상 'undefined'로 평가돼
          // buildRivalEnemyContext(재등장 라이벌 몬스터 서사)가 한 번도
          // 호출된 적이 없었다. 다른 모든 호출부와 동일한 표준 패턴
          // (typeof loadMonsters==='function' ? loadMonsters() : [])으로 교정.
          result += buildRivalEnemyContext(typeof loadMonsters==='function' ? (loadMonsters()||[]) : []);
          var lastAI = S.messages && S.messages.slice(-1)[0];
          if(lastAI && lastAI.role==='assistant' && lastAI.content) result += buildNpcReunionContext(lastAI.content);
          // NPC 대화 누적 주제 요약 힌트 주입 (학습된 정보 재활용)
          if(typeof buildNpcTopicSummaryHint==='function'){
            var lastUser2 = S.messages && S.messages.filter(function(m){ return m.role==='user'; }).slice(-1)[0];
            if(lastUser2 && lastUser2.content){
              result += buildNpcTopicSummaryHint(lastUser2.content);
            }
          }
        }catch(e){}
        return result;
      };
    }

    // [참고] NPC 상호작용/소문 감지(detectNpcInteractionFromText·
    // updateRumorSystem·cacheNpcTopicResponse)는 quest/086의 sendMsg() 안에
    // 네이티브로 연결했다 — window.renderMsgs 래핑은 sendMsg가 renderMsgs를
    // 같은 파일에서 직접 호출해 실제로는 한 번도 실행된 적이 없었다.

    setTimeout(function(){
      try{
        var btmBar = document.querySelector('.btm-bar');
        if(btmBar){
          if(!document.getElementById('btn-growth-compare')){
            var b = document.createElement('button');
            b.id='btn-growth-compare'; b.className='bb'; b.textContent='📈성장'; b.title='성장 비교';
            b.onclick = showGrowthComparePanel;
            btmBar.appendChild(b);
          }
          if(!document.getElementById('btn-play-style')){
            var b2 = document.createElement('button');
            b2.id='btn-play-style'; b2.className='bb'; b2.textContent='🎭성향'; b2.title='플레이 성향';
            b2.onclick = showPlayStylePanel;
            btmBar.appendChild(b2);
          }
          // 방랑자 전용: 혼돈↔질서 버튼
          if(typeof _isWanderer==='function' && _isWanderer()){
            if(!document.getElementById('btn-wdr-axis')){
              var bw = document.createElement('button');
              bw.id='btn-wdr-axis'; bw.className='bb';
              bw.style.cssText='color:#c07020;border-color:#5a3010';
              bw.title='혼돈↔질서 & 개연성';
              bw.onclick=function(){ window.openP('wanderer-axis'); renderWandererAxisPanel(); };
              // 동적 아이콘 업데이트
              function _updateWdrBtn(){
                try{
                  const ax = loadWdrAxis();
                  const tier = getWdrAxisTier(ax);
                  bw.textContent = tier.icon + ' 방랑';
                  bw.style.color = tier.color;
                }catch(e){ bw.textContent='🌀방랑'; }
              }
              _updateWdrBtn();
              setInterval(_updateWdrBtn, 3000);
              btmBar.appendChild(bw);
            }
          }
        }
      }catch(e){}
    }, 4500);

  }, 4000);
})();
