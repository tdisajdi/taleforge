// 환경 생존 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { SURVIVAL_ENVS } from '../data/160-환경-생존-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const SURVIVAL_KEY = 'tf-survival-state';

export function loadSurvivalState(){ try{ return JSON.parse(lsGet(SURVIVAL_KEY)||'null'); }catch(e){ return null; } }
window.loadSurvivalState = loadSurvivalState;

export function saveSurvivalState(d){ try{ lsSet(SURVIVAL_KEY,d?JSON.stringify(d):null); }catch(e){} }
window.saveSurvivalState = saveSurvivalState;

export function enterSurvivalEnv(envId){
  const env = SURVIVAL_ENVS[envId];
  if(!env) return;
  const state = { envId, name:env.name, icon:env.icon, resource:100, turnsIn:0, enteredAt:S.msgCount||0 };
  saveSurvivalState(state);
  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n\n[🌡️ 생존 환경 진입: '+env.icon+' '+env.name+']\n'
    +'주요 위협: '+env.threats.join(', ')+'\n'
    +'필수 자원: '+env.resource+' (현재 100%)\n'
    +'매 턴 자원이 소모된다. 자원이 0%가 되면 HP가 감소한다.\n'
    +'보유 아이템 '+env.resistItem+'이(가) 있으면 소모량이 줄어든다.';
  toast(env.icon+' '+env.name+' 진입! 생존에 주의하세요', 3500);
}
window.enterSurvivalEnv = enterSurvivalEnv;

window.enterSurvivalEnv = enterSurvivalEnv;

export function exitSurvivalEnv(){
  saveSurvivalState(null);
  toast('✅ 위험 지역을 벗어났습니다', 2500);
}
window.exitSurvivalEnv = exitSurvivalEnv;

window.exitSurvivalEnv = exitSurvivalEnv;

export function getSurvivalBLS(){
  const state = loadSurvivalState();
  if(!state) return '';
  const env = SURVIVAL_ENVS[state.envId]||{};
  const resColor = state.resource>60?'#60c060':state.resource>30?'#c0a030':'#e05050';
  return '\n\n[🌡️ 생존 환경: '+(env.icon||'')+' '+state.name+']\n'
    +'자원: '+state.resource+'% · 체류 '+state.turnsIn+'턴\n'
    +'위협: '+(env.threats||[]).join(', ')+'\n'
    +'매 행동마다 자원 소모를 서사에 반영하라. 자원 30% 이하면 위기감을 고조시켜라.\n'
    +'GS: "survival_resource":<숫자> — 현재 자원량 보고 | "exit_survival":true — 위험 지역 탈출';
}
window.getSurvivalBLS = getSurvivalBLS;

window.getSurvivalBLS = getSurvivalBLS;
