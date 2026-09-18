// AI 응답 캐싱
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { getSetItemBLS } from '../items/159-세트-아이템-효과-시스템-SETDEFS-calcSetBonus-로-통합됨.js';
import { enterSurvivalEnv, exitSurvivalEnv, getSurvivalBLS, loadSurvivalState, saveSurvivalState } from '../misc/160-환경-생존-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const AI_CACHE_KEY = 'tf-ai-cache';

export const CACHE_TTL_TURNS = 20;

export function loadAICache(){ try{ return JSON.parse(lsGet(AI_CACHE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadAICache = loadAICache;

export function saveAICache(d){ try{ lsSet(AI_CACHE_KEY,JSON.stringify(d)); }catch(e){} }
window.saveAICache = saveAICache;

export function getCacheKey(prompt){
  // 간단한 해시
  let h=0;
  for(let i=0;i<Math.min(prompt.length,200);i++) h=((h<<5)-h)+prompt.charCodeAt(i);
  return 'c_'+(h>>>0).toString(36);
}
window.getCacheKey = getCacheKey;

export function getCachedResponse(prompt){
  const cache = loadAICache();
  const key = getCacheKey(prompt);
  const entry = cache[key];
  if(!entry) return null;
  if((S.msgCount||0) - entry.turn > CACHE_TTL_TURNS) return null; // 만료
  return entry.response;
}
window.getCachedResponse = getCachedResponse;

export function setCachedResponse(prompt, response){
  const cache = loadAICache();
  const key = getCacheKey(prompt);
  cache[key] = { response, turn:S.msgCount||0 };
  // 오래된 캐시 정리 (20개 초과)
  const keys = Object.keys(cache);
  if(keys.length>30){
    // 만료된 것 먼저 정리
    const now = S.msgCount||0;
    Object.keys(cache).forEach(k=>{ if(now - (cache[k].turn||0) > CACHE_TTL_TURNS) delete cache[k]; });
    // 그래도 30개 초과면 가장 오래된 것 삭제
    if(Object.keys(cache).length > 30){
      const oldest = Object.keys(cache).sort((a,b)=>(cache[a]?.turn||0)-(cache[b]?.turn||0))[0];
      delete cache[oldest];
    }
  }
  saveAICache(cache);
}
window.setCachedResponse = setCachedResponse;

window.getCachedResponse = getCachedResponse;

window.setCachedResponse = setCachedResponse;

// [버그 수정] 이 자리에 있던 hookPatch08SendMsg는 window.sendMsg를 감싸는
// 방식이라(다른 죽은 훅들과 동일한 원인) 한 번도 실행되지 않았다.
// gs 필드(survival_resource/exit_survival/enter_survival)는
// window.processGSBlock(gs)에 옮겨 연결하고, 텍스트 기반 환경 키워드
// 자동 감지는 quest/086의 sendMsg() 응답 후처리 블록에 네이티브로
// 연결했다.
(function hookSurvivalGS(){
  const t=function(){
    if(window._survivalGSHooked) return;
    if(typeof window.processGSBlock!=='function'){ setTimeout(t,1500); return; }
    window._survivalGSHooked=true;
    const _o=window.processGSBlock;
    window.processGSBlock=function(gs){
      const r=_o.apply(this,arguments);
      try{
        if(gs){
          // 생존 자원 업데이트
          if(gs.survival_resource!=null){
            const st=loadSurvivalState();
            if(st){ st.resource=Math.max(0,Math.min(100,Number(gs.survival_resource)||0)); st.turnsIn=(st.turnsIn||0)+1; saveSurvivalState(st); }
            if(Number(gs.survival_resource)<=0){
              S._nextInjectedContext=(S._nextInjectedContext||'')+'\n[🌡️ 자원 고갈] 생존 자원이 바닥났다! 플레이어 HP 매 턴 -10 발생. 즉각 탈출하거나 자원을 확보하라.';
              toast('⚠️ 생존 자원 고갈! 긴급 탈출 필요!', 4000);
            }
          }
          if(gs.exit_survival) exitSurvivalEnv();
          if(gs.enter_survival) enterSurvivalEnv(gs.enter_survival);
        }
      }catch(e){}
      return r;
    };
  };
  setTimeout(t,3200);
})();

(function hookPatch08BLS(){
  const t=function(){
    if(window._p08BLSHooked) return;
    const fn=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn){ setTimeout(t,3000); return; }
    window._p08BLSHooked=true;
    const _o=window[fn];
    window[fn]=function(){
      const r=_o.apply(this,arguments);
      try{
        const parts=[];
        const srv=getSurvivalBLS(); if(srv) parts.push(srv);
        const set=getSetItemBLS(); if(set) parts.push(set);
        if(!parts.length) return r;
        return typeof r==='string'?r+parts.join(''):r;
      }catch(e){ return r; }
    };
  };
  setTimeout(t,4900);
})();

console.log('[TaleForge] 세트아이템/생존/컨텍스트모니터/AI캐싱 로드 완료 ✓');
