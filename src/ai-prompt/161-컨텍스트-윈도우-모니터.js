// 컨텍스트 윈도우 모니터
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';

export function estimateTokenCount(text){
  // 한국어 기준: 1토큰 ≈ 1.5글자
  return Math.round((text||'').length / 1.5);
}
window.estimateTokenCount = estimateTokenCount;

window.estimateTokenCount = estimateTokenCount;

export function getContextMonitorBLS(){
  try{
    const msgs = S.messages||[];
    const sysPromptEst = 8000; // 시스템 프롬프트 추정
    const histEst = msgs.reduce(function(a,m){ return a+estimateTokenCount(m.content||''); },0);
    const total = sysPromptEst + histEst;
    const maxCtx = 100000; // Gemini 기준
    const pct = Math.min(100,Math.round(total/maxCtx*100));
    return { total, pct, msgs:msgs.length, warning: pct>80 };
  }catch(e){ return { total:0, pct:0, msgs:0, warning:false }; }
}
window.getContextMonitorBLS = getContextMonitorBLS;

window.getContextMonitorBLS = getContextMonitorBLS;

// [버그 수정] 여기 있던 extendMemoryPanelWithMonitor(컨텍스트/토큰 사용량
// 모니터 표시)는 renderMemoryEnhanced가 정의된 misc/277의 실제 호출부가
// bare 식별자라 한 번도 적용되지 못했다. 같은 로직을 실제 정의부
// (renderMemoryEnhanced 본문 끝)에 네이티브로 옮겼다.
