// 9. 세계 상태 변화 가시화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { WORLD_CHANGE_TRIGGERS } from '../data/289-9-세계-상태-변화-가시화.js';
import { addUnifiedFame } from '../npc/286-6-평판명성-통합-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const WORLD_IMPACT_KEY = 'tf-world-impact';

export function loadWorldImpact(){ try{ return JSON.parse(lsGet(WORLD_IMPACT_KEY)||'{"score":0,"events":[]}'); }catch(e){ return {score:0,events:[]}; } }
window.loadWorldImpact = loadWorldImpact;

export function saveWorldImpact(d){ try{ lsSet(WORLD_IMPACT_KEY, JSON.stringify(d)); }catch(e){} }
window.saveWorldImpact = saveWorldImpact;

export function updateWorldImpact(userMsg){
  const lc = userMsg;
  for(const trigger of WORLD_CHANGE_TRIGGERS){
    if(trigger.pattern.test(lc)){
      const wi = loadWorldImpact();
      wi.score = Math.max(-200, Math.min(200, (wi.score||0)+trigger.impact));
      wi.events = wi.events||[];
      wi.events.push({ ...trigger, turn:S.msgCount, at:new Date().toISOString() });
      wi.events = wi.events.slice(-10);
      saveWorldImpact(wi);
      // AI 힌트 주입
      S._nextInjectedContext = (S._nextInjectedContext||'') + ` [🌍 세계 변화: ${trigger.event}] ${trigger.worldHint}`;
      if(trigger.impact > 0) addUnifiedFame(Math.round(trigger.impact/2), trigger.event);
      toast(`${trigger.impact>0?'✨':'⚠️'} ${trigger.event}: ${trigger.desc.slice(0,30)}`, 3000);
      break;
    }
  }
}
window.updateWorldImpact = updateWorldImpact;

window.updateWorldImpact = updateWorldImpact;

export function buildWorldImpactContext(){
  try{
    const wi = loadWorldImpact();
    if(!wi.events?.length) return '';
    const score = wi.score||0;
    const stateLabel = score>=100?'✨ 황금기':score>=50?'🌱 번영기':score>=0?'⚖️ 평온':score>=-50?'🌑 혼란기':'💀 암흑기';
    const recent = wi.events.slice(-2).map(e=>`${e.event}(${e.turn}턴)`).join(', ');
    return `\n[🌍 세계 상태: ${stateLabel}] 최근 사건: ${recent}. 세계의 분위기를 이 상태에 맞게 NPC 반응과 배경에 반영하라.`;
  }catch(e){ return ''; }
}
window.buildWorldImpactContext = buildWorldImpactContext;

window.buildWorldImpactContext = buildWorldImpactContext;
