// 🌍 대륙 스타팅 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { _apiQueue } from '../data/085-대륙-스타팅-시스템.js';

export function estimateTokens(text){
  if(!text) return 0;
  let tokens = 0;
  for(const ch of text){
    const code = ch.charCodeAt(0);
    if(code >= 0x1100 && code <= 0x9FFF) tokens += 1.8;       // 한글·CJK (한국어 평균 1.5~2.5)
    else if(code > 0x9FFF && code <= 0xFFFF) tokens += 1.2;   // 기타 유니코드
    else tokens += 0.25;                                        // ASCII
  }
  return Math.ceil(tokens);
}
window.estimateTokens = estimateTokens;

export function trimHistory(history, maxTokens=12000){
  const msgs = [...history];
  const result = [];
  let total = 0;
  for(let i = msgs.length-1; i >= 0; i--){
    const t = estimateTokens(msgs[i].content);
    if(total + t > maxTokens && result.length >= 2) break;
    result.unshift(msgs[i]);
    total += t;
  }
  return result;
}
window.trimHistory = trimHistory;

window._apiQueueRunning = false;

export function _updateQueueStatusUI(){
  const el = document.getElementById('api-queue-status');
  const cn = document.getElementById('api-queue-count');
  if(!el) return;
  if(_apiQueue.length > 0){
    el.classList.add('visible');
    if(cn) cn.textContent = _apiQueue.length;
  } else {
    el.classList.remove('visible');
  }
}
window._updateQueueStatusUI = _updateQueueStatusUI;

export function enqueueAITask(fn, label=''){
  _apiQueue.push({ fn, label });
  _updateQueueStatusUI();
  if(!window._apiQueueRunning) _drainQueue();
}
window.enqueueAITask = enqueueAITask;

export async function _drainQueue(){
  if(window._apiQueueRunning || _apiQueue.length===0) return;
  window._apiQueueRunning = true;
  while(_apiQueue.length > 0){
    const task = _apiQueue.shift();
    _updateQueueStatusUI();
    try{
      // 각 작업 사이 최소 1.5초 간격 (rate limit 방지)
      await new Promise(r=>setTimeout(r, 1500));
      await task.fn();
    }catch(e){ /* 보조 작업 실패해도 게임 진행 */ }
  }
  window._apiQueueRunning = false;
  _updateQueueStatusUI();
}
window._drainQueue = _drainQueue;
