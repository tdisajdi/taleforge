// 8. 이단 심문 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { getPlayerReligion } from './094-5-플레이어-종교-귀속-교화.js';

export const HERESY_RISK_KEY = 'tf-heresy-risk';

export function loadHeresyRisk(){ try{ return JSON.parse(lsGet(HERESY_RISK_KEY)||'{}'); }catch(e){ return {}; } }
window.loadHeresyRisk = loadHeresyRisk;

export function saveHeresyRisk(d){ lsSet(HERESY_RISK_KEY, JSON.stringify(d)); }
window.saveHeresyRisk = saveHeresyRisk;

export function addHeresyRisk(amount, reason){
  const risk = loadHeresyRisk();
  risk.level = Math.min(100, (risk.level||0) + amount);
  risk.reasons = risk.reasons||[];
  risk.reasons.push({reason, turn:S.msgCount||0});
  saveHeresyRisk(risk);

  if(risk.level >= 80 && !risk.trialStarted){
    risk.trialStarted = true;
    saveHeresyRisk(risk);
    triggerHeresyTrial();
  } else if(risk.level >= 50){
    toast(`⚠️ 이단 혐의 위험도: ${risk.level}% — 심문소의 눈이 당신을 향하고 있다.`, 3000);
  }
}
window.addHeresyRisk = addHeresyRisk;

window.addHeresyRisk = addHeresyRisk;

export function triggerHeresyTrial(){
  toast('🔥 이단 심문 소환장이 날아왔다!', 5000);
  if(typeof addTimelineEvent==='function')
    addTimelineEvent('event','이단 심문 소환',{icon:'🔥'});
  S._nextInjectedContext = (S._nextInjectedContext||'')
    +'\n[🔥 이단 심문 발동] 이단 심문소가 플레이어를 이단 혐의로 소환했다. '
    +'법정 장면을 극적으로 묘사하라. 세 가지 선택지를 제시할 것: '
    +'① 무죄 항변 (INT+REP 판정) ② 도주 (AGI 판정) ③ 신앙 포기 선언 (fath -40, 자유).'
    +'\nGS: flags:[heresy_trial_started] 출력.';
}
window.triggerHeresyTrial = triggerHeresyTrial;

window.triggerHeresyTrial = triggerHeresyTrial;

export function tickHeresyCheck(cleanText){
  if(!cleanText) return;
  const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;

  if(rel==='abyss'){
    // 심연 신자는 기본 위험도 누적
    if((S.msgCount||0)%10===0) addHeresyRisk(5, '심연 신자 위험 누적');
  }
  // 금기 행동
  if(/어둠.*마법|죽음.*주문|금기.*의식/.test(cleanText)) addHeresyRisk(15, '금기 마법 사용');
  if(/신성.*모독|제단.*파괴|성직자.*공격/.test(cleanText)) addHeresyRisk(20, '신성 모독');
}
window.tickHeresyCheck = tickHeresyCheck;

window.tickHeresyCheck = tickHeresyCheck;

export function getHeresyRiskLabel(){
  const risk = loadHeresyRisk();
  const lv = risk.level||0;
  if(lv <= 0)  return '';
  if(lv <= 30) return `🟡 이단 혐의 ${lv}%`;
  if(lv <= 60) return `🟠 이단 혐의 ${lv}%`;
  return `🔴 이단 혐의 ${lv}% ⚠️`;
}
window.getHeresyRiskLabel = getHeresyRiskLabel;

window.getHeresyRiskLabel = getHeresyRiskLabel;
