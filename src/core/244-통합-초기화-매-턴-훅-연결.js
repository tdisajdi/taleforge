// 통합 초기화 & 매 턴 훅 연결
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { NPC_FACTION_ADJ, NPC_FACTION_NOUN, NPC_FACTION_SUFFIX, NPC_PERSONALITY_POOL, NPC_RACE_POOL_INLINE, NPC_RANK_POOL_INLINE } from '../data/244-통합-초기화-매-턴-훅-연결.js';
import { loadNPCs, saveNPCs } from '../misc/001-block0-preamble.js';
import { renderDashboard } from '../misc/235-⑦-게임-현황-대시보드.js';
import { renderStatusIconsInHeader } from '../misc/243-⑩-상태이상-아이콘-헤더-직접-표시.js';
import { checkFateChoiceMoment } from '../ui/231-스토리서사-캐릭터-성장-UIUX-개선-시스템.js';
import { STAT_HISTORY_KEY, recordStatSnapshot } from '../ui/234-⑥-스탯-성장-미니-스파크라인-그래프-renderStats-보강.js';
import { lsDel, toast } from '../utils.js';

setTimeout(function(){
  try{
    const btmBar = document.querySelector('.btm-bar');
    if(!btmBar || document.getElementById('btn-dashboard')) return;
    const bd = document.createElement('button');
    bd.id='btn-dashboard'; bd.className='bb';
    bd.textContent='📊현황'; bd.title='게임 현황 대시보드';
    bd.onclick=function(){ window.openP('dashboard'); renderDashboard(); };
    btmBar.insertBefore(bd, btmBar.firstChild);
  }catch(e){}
}, 5200);

setTimeout(function(){
  try{ renderStatusIconsInHeader(); }catch(e){}
}, 2000);

export function _npcHash(str){
  let h = 0;
  for(let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
window._npcHash = _npcHash;

export function _genFaction(seed, rankName){
  const h = seed;
  const adj  = NPC_FACTION_ADJ [h % NPC_FACTION_ADJ.length];
  const noun = NPC_FACTION_NOUN[(h >> 3) % NPC_FACTION_NOUN.length];
  const suf  = NPC_FACTION_SUFFIX[(h >> 6) % NPC_FACTION_SUFFIX.length];
  // 평민·농부·노예는 마을/영주 소속
  if(/평민|농부|노예/.test(rankName)) return (h % 2 === 0) ? '무소속' : noun + '마을';
  return adj + ' ' + noun + ' ' + suf;
}
window._genFaction = _genFaction;

export function enrichNPCAttributes(npc){
  if(!npc || !npc.name) return npc;
  const seed = _npcHash(npc.name + (npc.role || ''));

  // 종족
  if(!npc.race){
    npc.race = NPC_RACE_POOL_INLINE[seed % NPC_RACE_POOL_INLINE.length];
  }

  // 신분
  if(!npc.rank && !npc.socialRank){
    // 기존 role에서 신분 힌트 추출
    const roleLc = (npc.role || '').toLowerCase();
    const matchedRank = NPC_RANK_POOL_INLINE.find(r =>
      roleLc.includes(r.name) || r.name.includes(roleLc.slice(0,2))
    );
    const rank = matchedRank || NPC_RANK_POOL_INLINE[(seed >> 2) % NPC_RANK_POOL_INLINE.length];
    npc.rank     = rank.name;
    npc.rankIcon = rank.icon;
  }

  // 소속 세력
  if(!npc.faction || npc.faction === '' || npc.faction === '알 수 없음'){
    const rank = NPC_RANK_POOL_INLINE.find(r => r.name === npc.rank) || NPC_RANK_POOL_INLINE[0];
    // 30% 확률로 rank.faction 힌트 사용, 70%는 랜덤 세력 생성
    if((seed >> 4) % 10 < 3){
      npc.faction = rank.faction;
    } else {
      npc.faction = _genFaction(seed >> 2, npc.rank || '');
    }
  }

  // 성격
  if(!npc.personality || npc.personality === '적대적' || npc.personality === ''){
    const p = NPC_PERSONALITY_POOL[(seed >> 1) % NPC_PERSONALITY_POOL.length];
    npc.personality  = p.trait;
    if(!npc.speech_style) npc.speech_style = p.speech;
    if(!npc.alignHint) npc.alignHint = p.value; // positive/neutral/negative
  }

  // 말버릇 (성격은 있는데 말버릇 없는 경우)
  if(!npc.speech_style){
    const p = NPC_PERSONALITY_POOL[(seed >> 1) % NPC_PERSONALITY_POOL.length];
    npc.speech_style = p.speech;
  }

  return npc;
}
window.enrichNPCAttributes = enrichNPCAttributes;

export const _origFallbackParse = window.fallbackParseNarrative || function(){};

export function enrichAllExistingNPCs(){
  try{
    const npcs = loadNPCs();
    let changed = false;
    npcs.forEach(n => {
      if(!n._enriched){
        enrichNPCAttributes(n);
        n._enriched = true;
        changed = true;
      }
    });
    if(changed) saveNPCs(npcs);
  }catch(e){}
}
window.enrichAllExistingNPCs = enrichAllExistingNPCs;

setTimeout(enrichAllExistingNPCs, 3000);

window.enrichNPCAttributes   = enrichNPCAttributes;

window.enrichAllExistingNPCs = enrichAllExistingNPCs;

export function tickFatigue(aiText, userMsg){
  if(!S) return;
  if(S._fatigue === undefined) S._fatigue = 0;

  const lc = (aiText||'').toLowerCase();
  const um = (userMsg||'').toLowerCase();

  // 휴식 감지: 잠·쉬·여관·캠프·회복 → 피로 빠르게 회복
  const isResting = /잠을 잤|숙박|여관|캠프|쉬었|휴식|잠자|수면|밤을 보냈/.test(lc);
  // 이동/전투 감지
  const isFighting  = S._inCombat || /전투|싸움|공격|방어|격투|베었|쓰러뜨/.test(lc);
  const isMoving    = /달렸|이동했|걸었|행군|탐험|등반|지름길/.test(lc);

  if(isResting){
    S._fatigue = Math.max(0, S._fatigue - 30);
    if(S._fatigue === 0) toast('😴 완전 휴식 — 피로 완전 회복!', 1800);
    else toast(`😌 휴식 — 피로 회복 (현재: ${S._fatigue})`, 1500);
  } else if(isMoving){
    S._fatigue = Math.min(100, S._fatigue + 3);
  }
  // 전투/대화 등 그 외 행동은 피로도에 영향 없음 — 이동할 때만 누적된다.

  // 탈진 경고
  if(S._fatigue >= 80 && !S._fatigueWarned){
    S._fatigueWarned = true;
    toast('⚠️ 탈진 상태! 모든 판정 -15. 즉시 휴식이 필요합니다!', 3500);
    // AI에게도 알림
    S._nextInjectedContext = (S._nextInjectedContext||'') +
      '\n[⚠️ 탈진] 캐릭터가 극도로 지쳐 있다. 동작이 느리고 판단력이 흐려진 묘사를 반영하라. 휴식 선택지를 자연스럽게 포함할 것.';
  } else if(S._fatigue < 80){
    S._fatigueWarned = false;
  }

  // 피로 50 이상: AI에 상태 전달
  if(S._fatigue >= 50){
    const fLabel = S._fatigue >= 80 ? '탈진' : '심한 피로';
    S._nextInjectedContext = (S._nextInjectedContext||'') +
      `\n[😓 ${fLabel} (${S._fatigue}/100)] 캐릭터의 몸이 한계에 가까워지고 있다. 행동 묘사에 이를 자연스럽게 반영하라.`;
  }

  renderFatigueBar();
}
window.tickFatigue = tickFatigue;

export function renderFatigueBar(){
  if(!S || S._fatigue === undefined) return;
  const fat = S._fatigue || 0;
  let bar = document.getElementById('fatigue-bar');
  if(!bar){
    bar = document.createElement('div');
    bar.id = 'fatigue-bar';
    bar.style.cssText = 'position:fixed;bottom:48px;left:0;right:0;height:3px;z-index:290;pointer-events:none;transition:opacity .3s';
    document.body.appendChild(bar);
  }
  if(fat <= 0){ bar.style.opacity='0'; return; }
  bar.style.opacity='1';
  const pct = fat;
  const col = fat>=80?'#e05050':fat>=50?'#e09030':'#c0a040';
  bar.innerHTML = `<div style="width:${pct}%;height:100%;background:${col};transition:width .5s,background .3s"></div>`;
  // 탈진이면 헤더에도 표시
  let hFat = document.getElementById('h-fatigue');
  if(fat >= 30){
    if(!hFat){
      hFat = document.createElement('span');
      hFat.id='h-fatigue'; hFat.className='hst';
      hFat.style.cssText='cursor:pointer;font-size:9px';
      hFat.title='피로도 — 휴식으로 회복';
      const hs = document.querySelector('.hdr-stats');
      if(hs) hs.appendChild(hFat);
    }
    const icon = fat>=80?'💀':fat>=50?'😫':'😓';
    hFat.innerHTML=`${icon}<span style="font-size:8px;color:${col}">${fat}</span>`;
  } else if(hFat){ hFat.remove(); }
}
window.renderFatigueBar = renderFatigueBar;

window.addEventListener('DOMContentLoaded', function(){
  if(S) S._fatigue = 0;
});

window.tickFatigue     = tickFatigue;

window.renderFatigueBar= renderFatigueBar;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_218(){
const _prevAH4 = window._wandererAxisHook;

window._wandererAxisHook = function(cleanText, userMsg){
  if(_prevAH4) _prevAH4(cleanText, userMsg);
  // 스탯 스냅샷 기록 (10턴마다)
  try{ recordStatSnapshot(); }catch(e){}
  // 운명 분기점 감지
  try{ checkFateChoiceMoment(cleanText); }catch(e){}
};

const _origDoReinc = window.doReincarnate;

if(typeof window.doReincarnate === 'function'){
  window.doReincarnate = function(){
    try{ lsDel(STAT_HISTORY_KEY); }catch(e){}
    return (typeof _origDoReinc==='function') ? _origDoReinc.apply(this,arguments) : window.doReincarnate.apply(this,arguments);
  };
}

const _origProcessGSBlock_npcEnrich = window.processGSBlock;

window.processGSBlock = function(gs){
  // npc_add 전처리: 등록 전에 속성 주입
  if(Array.isArray(gs?.npc_add)){
    gs.npc_add = gs.npc_add.map(n => enrichNPCAttributes({...n}));
  }
  return _origProcessGSBlock_npcEnrich ? _origProcessGSBlock_npcEnrich.call(this, gs) : gs;
};

window.fallbackParseNarrative = function(cleanText, rawText){
  const result = _origFallbackParse.call(this, cleanText, rawText);
  // 방금 등록된 _fromFallback NPC에 속성 주입
  try{
    const npcs = loadNPCs();
    let changed = false;
    npcs.forEach(n => {
      if(n._fromFallback && !n._enriched){
        enrichNPCAttributes(n);
        n._enriched = true;
        changed = true;
      }
    });
    if(changed) saveNPCs(npcs);
  }catch(e){}
  return result;
};

const _origAutoDetect = window.autoDetectAndRegisterEnemy;

window.autoDetectAndRegisterEnemy = function(text){
  _origAutoDetect.call(this, text);
  // 방금 autoRegistered된 NPC에 속성 주입
  try{
    const npcs = loadNPCs();
    let changed = false;
    npcs.forEach(n => {
      if(n.autoRegistered && !n._enriched){
        enrichNPCAttributes(n);
        n._enriched = true;
        changed = true;
      }
    });
    if(changed) saveNPCs(npcs);
  }catch(e){}
};

const _prevWdrHook2 = window._wandererAxisHook;

window._wandererAxisHook = function(cleanText, userMsg){
  if(_prevWdrHook2) _prevWdrHook2(cleanText, userMsg);
  try{ tickFatigue(cleanText, userMsg||''); }catch(e){}
};
}

