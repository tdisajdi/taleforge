// 로컬 AI 모델 엔진 (브라우저 내장, WebGPU, 실험적 기능)
//
// API 키가 없거나 클라우드 호출이 실패해도, 이 기기가 WebGPU를 지원하고
// 사용자가 설정에서 켜둔 경우 브라우저에 내려받은 소형 모델로 문장을
// 생성한다. 이 계층이 실패하거나 꺼져 있어도 게임은 항상 기존 로컬 조합
// (문장 뱅크/마르코프 학습 등)으로 완전히 동작한다 — API 키와 동일하게
// "있으면 보너스, 없어도 게임은 된다" 원칙을 그대로 따른다.
//
// [주의] 모델 가중치는 첫 사용 시 브라우저가 CDN에서 직접 내려받는다
// (통상 수백MB). 이 저장소를 빌드/편집한 샌드박스 환경은 해당 CDN 접속이
// 막혀 있어 실제 다운로드·추론 동작을 이 환경에서 검증하지 못했다 —
// 실제 브라우저(네트워크 제한 없는 환경)에서 최초 1회 확인이 필요하다.
import { lsGet, lsSet } from '../utils.js';

export const LOCAL_MODEL_ENABLED_KEY = 'tf-local-model-enabled';
// @huggingface/transformers(구 Xenova/transformers.js)를 CDN에서 동적
// import — esbuild는 http(s) 리터럴이 아닌 변수를 통한 import()는 번들에
// 포함시키지 않고 런타임 동적 import 그대로 남겨두므로, 사용자가 이
// 기능을 켜지 않는 한 이 라이브러리는 전혀 다운로드되지 않는다.
export const LOCAL_MODEL_CDN_URL = 'https://esm.run/@huggingface/transformers';
export const LOCAL_MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';
export const LOCAL_MODEL_DTYPE = 'q4';

let _pipelinePromise = null;
let _pipeline = null;
let _loadError = null;

// ── 진단 로그 ──────────────────────────────────────────────────────
// 이 기능은 개발 환경(샌드박스)에서 네트워크 제한 때문에 직접 실행해
// 검증할 수 없었다. 그래서 실제 기기에서 무슨 일이 일어났는지(성공/
// 실패, 어느 단계에서 멈췄는지, 원본 에러 메시지)를 화면에 그대로 남겨
// 플레이어가 복사해서 전달할 수 있게 한다 — 콘솔(F12) 없이도 확인 가능.
const _log = [];
function _dlog(msg){
  const line = '['+new Date().toLocaleTimeString('ko-KR',{hour12:false})+'] '+msg;
  _log.push(line);
  if(_log.length > 300) _log.shift();
  try{ console.log('[로컬모델]', msg); }catch(e){}
  try{ _refreshDebugLogPanel(); }catch(e){}
}
export function getLocalModelLog(){ return _log.join('\n') || '(아직 기록 없음)'; }
// 에러 메시지만으론 어느 코드에서 터졌는지 알 수 없어, 스택 앞부분
// (최대 4줄)을 같이 남긴다. 번들은 minify 없이 빌드되어 함수 이름이
// 그대로 남아있어 실제로 원인 지점을 특정하는 데 도움이 된다.
function _stackSnippet(e){
  try{
    const lines = (e && e.stack ? String(e.stack) : '').split('\n').slice(0,4);
    return lines.length ? ' :: '+lines.join(' | ') : '';
  }catch(e2){ return ''; }
}
// 다른 파일(quest/086의 오프닝/턴 처리 등)에서도 같은 진단 로그에
// 기록을 남길 수 있게 하는 공개 래퍼 — _dlog 자체는 이 파일 밖에서
// 못 부르므로.
export function logLocalModelEvent(msg){ _dlog(msg); }
window.logLocalModelEvent = logLocalModelEvent;
window.getLocalModelLog = getLocalModelLog;

// [2026-08-26] 기본값을 켜짐으로 바꿨다 — 꺼짐이 기본이면 대부분의
// 플레이어는 설정 화면 존재 자체를 모르고 지나가서 "로컬 모델을 메인으로"
// 라는 방침이 사실상 죽은 방침이 된다(학습도, 생성도 전혀 안 쌓임).
// 저장된 값이 명시적으로 '0'(사용자가 직접 끔)일 때만 꺼짐으로 취급하고,
// 그 외(한 번도 안 건드린 기기 포함)는 전부 켜짐으로 본다.
export function isLocalModelEnabled(){
  try{ return lsGet(LOCAL_MODEL_ENABLED_KEY) !== '0'; }catch(e){ return true; }
}
window.isLocalModelEnabled = isLocalModelEnabled;

export function setLocalModelEnabled(on){
  try{ lsSet(LOCAL_MODEL_ENABLED_KEY, on ? '1' : '0'); }catch(e){}
  if(!on){ _pipelinePromise = null; _pipeline = null; _loadError = null; }
}
window.setLocalModelEnabled = setLocalModelEnabled;

// WebGPU 지원 여부 — 실제 어댑터를 요청해봐야 신뢰할 수 있어 async.
export async function isLocalModelSupported(){
  if(typeof navigator === 'undefined' || !('gpu' in navigator)){
    _dlog('WebGPU 미지원: navigator.gpu 자체가 없음(구형 브라우저이거나 이 브라우저가 WebGPU를 아직 지원 안 함)');
    return false;
  }
  try{
    const adapter = await navigator.gpu.requestAdapter();
    if(!adapter){
      _dlog('WebGPU 감지는 되나 requestAdapter()가 null 반환 — GPU 드라이버/하드웨어가 조건 미충족');
      return false;
    }
    _dlog('WebGPU 어댑터 확보 성공 — 이 기기에서 로컬 모델 사용 가능');
    return true;
  }catch(e){
    _dlog('WebGPU 어댑터 요청 중 예외: '+(e && e.message)+_stackSnippet(e));
    return false;
  }
}
window.isLocalModelSupported = isLocalModelSupported;

export function getLocalModelState(){
  if(_pipeline) return 'ready';
  if(_loadError) return 'error';
  if(_pipelinePromise) return 'loading';
  return 'idle';
}
window.getLocalModelState = getLocalModelState;

// 모델을 처음 쓸 때만 CDN에서 라이브러리+가중치를 내려받아 파이프라인을
// 만든다. 이후로는 캐시된 파이프라인을 재사용.
export async function ensureLocalModelLoaded(onProgress){
  if(_pipeline){ _dlog('이미 로드된 파이프라인 재사용'); return _pipeline; }
  if(_pipelinePromise) return _pipelinePromise;
  _loadError = null;
  let _lastPct = -1;
  _pipelinePromise = (async ()=>{
    _dlog('라이브러리 불러오는 중: '+LOCAL_MODEL_CDN_URL);
    const mod = await import(LOCAL_MODEL_CDN_URL);
    _dlog('라이브러리 로드 성공, 모델 다운로드 시작: '+LOCAL_MODEL_ID+' ('+LOCAL_MODEL_DTYPE+')');
    const { pipeline } = mod;
    const gen = await pipeline('text-generation', LOCAL_MODEL_ID, {
      dtype: LOCAL_MODEL_DTYPE,
      device: 'webgpu',
      progress_callback: (p)=>{
        try{
          if(p && p.status === 'progress' && typeof p.progress === 'number'){
            const pct = Math.floor(p.progress);
            if(pct !== _lastPct && pct % 10 === 0){ _lastPct = pct; _dlog('다운로드 중: '+(p.file||'')+' '+pct+'%'); }
          } else if(p && p.status && p.status !== 'progress'){
            _dlog('로드 단계: '+p.status+(p.file?' ('+p.file+')':''));
          }
          if(typeof onProgress==='function') onProgress(p);
        }catch(e){}
      },
    });
    _pipeline = gen;
    _dlog('모델 로드 완료 — 추론 준비됨');
    return gen;
  })();
  try{
    return await _pipelinePromise;
  }catch(e){
    _loadError = e;
    _pipelinePromise = null;
    _dlog('모델 로드 실패: '+(e && (e.message || String(e)))+_stackSnippet(e));
    throw e;
  }
}
window.ensureLocalModelLoaded = ensureLocalModelLoaded;

// 시스템 지시문 + 사용자 프롬프트 한 턴으로 문장 생성. 소형 모델은 긴
// 멀티턴 히스토리를 안정적으로 못 다루는 경우가 많아, 호출부가 필요한
// 맥락을 userPrompt 문자열 하나로 압축해서 넘기는 걸 전제로 한다.
export async function callLocalModel(systemPrompt, userPrompt, opts){
  opts = opts || {};
  _dlog('추론 요청 시작 (프롬프트 '+(userPrompt||'').length+'자)');
  try{
    const gen = await ensureLocalModelLoaded();
    const messages = [
      { role: 'system', content: systemPrompt || '' },
      { role: 'user', content: userPrompt || '' },
    ];
    const t0 = Date.now();
    const output = await gen(messages, {
      max_new_tokens: opts.maxTokens || 200,
      temperature: opts.temperature != null ? opts.temperature : 0.9,
      do_sample: true,
    });
    const text = output && output[0] && output[0].generated_text;
    const reply = Array.isArray(text) ? (text[text.length - 1] || {}).content : text;
    if(!reply){ _dlog('추론 실패: 빈 응답 (원본: '+JSON.stringify(output).slice(0,200)+')'); throw new Error('로컬 모델 빈 응답'); }
    _dlog('추론 성공 ('+((Date.now()-t0)/1000).toFixed(1)+'초): '+reply.slice(0,80)+(reply.length>80?'...':''));
    return reply;
  }catch(e){
    _dlog('추론 중 예외: '+(e && (e.message || String(e)))+_stackSnippet(e));
    throw e;
  }
}
window.callLocalModel = callLocalModel;

// 소형 모델은 "JSON만 출력해줘"라고 해도 코드펜스(```json)나 설명
// 문장을 덧붙이는 경우가 클라우드보다 잦다 — 직접 JSON.parse가 실패하면
// 텍스트 안에서 가장 바깥쪽 {...}/[...] 블록을 찾아 한 번 더 시도한다.
// 그래도 실패하면 null을 반환해 호출부가 다음 단계(로컬 조합)로
// 폴백하게 한다.
export function parseJSONLoose(text){
  if(!text) return null;
  try{ return JSON.parse(text); }catch(e){}
  const objMatch = text.match(/\{[\s\S]*\}/);
  const arrMatch = text.match(/\[[\s\S]*\]/);
  const candidate = objMatch && arrMatch
    ? (objMatch.index <= arrMatch.index ? objMatch[0] : arrMatch[0])
    : (objMatch ? objMatch[0] : (arrMatch ? arrMatch[0] : null));
  if(!candidate) return null;
  try{ return JSON.parse(candidate); }catch(e){ return null; }
}
window.parseJSONLoose = parseJSONLoose;

// 구조화된 콘텐츠(아이템/퀘스트/장소 등) 생성용 — JSON 프롬프트를 그대로
// 로컬 모델에 넘기고, 응답을 parseJSONLoose로 파싱해서 돌려준다.
// 파싱 실패 시 예외를 던져 호출부가 로컬 조합으로 폴백하게 한다.
export async function callLocalModelJSON(prompt, opts){
  const text = await callLocalModel(
    '반드시 요청받은 JSON 형식만 출력한다. 다른 설명이나 코드펜스 없이 순수 JSON만 답한다.',
    prompt,
    opts
  );
  const parsed = parseJSONLoose(text);
  if(!parsed){ _dlog('JSON 파싱 실패, 로컬 조합으로 폴백. 원문: '+text.slice(0,150)); throw new Error('로컬 모델 JSON 파싱 실패'); }
  return parsed;
}
window.callLocalModelJSON = callLocalModelJSON;

// [2026-09-24] 정책 재전환 — "AI 선택제"(키 있으면 생성 계열도 클라우드
// 우선) 폐지, 매 턴 서사 포함 전부 로컬 전용으로 되돌림(28번 섹션).
// 실사용자 대부분은 API 키가 없어 "키 있으면 우선" 경로가 실전에서
// 거의 안 쓰이므로, 런타임 클라우드 호출 자체를 끄고 그 대신 개발
// 단계에 콘텐츠 볼륨을 두껍게 채우는 쪽으로 방향을 바꿨다. 아래
// CLOUD_TIER_ENABLED만 false→true로 되돌리면 클라우드 우선 동작이
// 즉시 복원된다(이 함수를 호출하는 17개 지점 전부에 자동 반영 —
// 개별 호출부는 손대지 않음).
const CLOUD_TIER_ENABLED = false;

// 3단 폴백 헬퍼(현재는 로컬 모델→로컬 조합 2단, 위 플래그 참고).
// [2026-08-26] 로컬 모델이 켜져 있고 이 기기가 지원하면 "로컬 모델이
// 메인"으로 우선순위를 둔다 — 최종 목표가 API 없이 도는 앱이라, 로컬
// 모델을 켠 사용자에게는 그게 기본 경로가 맞다는 판단(사용자 확인
// 완료). 로컬 모델을 안 켰거나 이 기기가 WebGPU를 지원하지 않으면
// 곧바로 로컬 조합(bankFn)으로 떨어진다. 클라우드 API는
// CLOUD_TIER_ENABLED가 true일 때만(현재 false) 로컬 모델 다음 순서로
// 시도된다.
export async function tryCloudThenLocalModelThenBank(cloudFn, localModelFn, bankFn, label){
  const tag = label || 'AI 생성';
  let keys = [];
  try{
    keys = (typeof window !== 'undefined' && window.S && window.S.apiKeys)
      || (typeof window !== 'undefined' && typeof window.loadApiKeys === 'function' ? window.loadApiKeys() : [])
      || [];
  }catch(e){}

  const localOn = isLocalModelEnabled();
  let localSupported = false;
  if(localOn){
    try{ localSupported = await isLocalModelSupported(); }catch(e){}
  }

  if(localOn && localSupported){
    const state = getLocalModelState();
    if(state === 'ready'){
      try{
        const result = await localModelFn();
        if(result) return result;
        _dlog('['+tag+'] 로컬 모델(메인)이 빈 결과 반환, 클라우드/로컬 조합으로 폴백');
      }catch(e){
        console.warn('['+tag+'] 로컬 모델(메인) 실패, 다음 단계로 폴백:', e.message);
        _dlog('['+tag+'] 로컬 모델(메인) 실패, 다음 단계로 폴백: '+e.message+_stackSnippet(e));
      }
    } else if(state === 'idle'){
      // [2026-08-26] 기본 켜짐으로 바뀌면서, 아직 한 번도 안 켜본 기기도
      // 여기로 들어온다 — 다운로드(수백MB)를 이번 턴에서 기다리게 하면
      // 첫 턴이 통째로 멈춰버려 "AI 없이도 항상 잘 돌아간다"는 원칙이
      // 깨진다. 그래서 다운로드는 백그라운드로만 걸어두고, 이번 턴은
      // 지금까지처럼 클라우드/로컬조합으로 즉시 진행한다 — 준비가 끝나면
      // 다음 턴부터 자동으로 로컬 모델이 메인 경로가 된다.
      _dlog('['+tag+'] 로컬 모델 아직 준비 안 됨 — 백그라운드 다운로드 시작, 이번 턴은 폴백 사용');
      ensureLocalModelLoaded().catch(()=>{});
    }
    // state === 'loading' → 이미 백그라운드 다운로드가 진행 중이니 이번
    // 턴도 폴백으로 진행. state === 'error' → 직전 시도가 실패했으니
    // 매 턴 재시도로 네트워크를 두드리지 않는다(토글을 껐다 켜면 재시도됨).
  }

  if(CLOUD_TIER_ENABLED && keys.length){
    try{
      const result = await cloudFn();
      if(result) return result;
    }catch(e){
      console.warn('['+tag+'] 클라우드 API 실패, 로컬 조합으로 폴백:', e.message);
      _dlog('['+tag+'] 클라우드 API 실패, 로컬 조합으로 폴백: '+e.message+_stackSnippet(e));
    }
  }

  try{
    return bankFn();
  }catch(e){
    _dlog('['+tag+'] 로컬 조합(최종 폴백)에서도 예외 발생: '+(e && (e.message||String(e)))+_stackSnippet(e));
    throw e;
  }
}
window.tryCloudThenLocalModelThenBank = tryCloudThenLocalModelThenBank;

// 설정 화면에 표시할 상태 문자열.
export async function describeLocalModelAvailability(){
  const supported = await isLocalModelSupported();
  if(!supported) return { supported:false, label:'이 기기/브라우저는 WebGPU를 지원하지 않아 사용할 수 없음' };
  return { supported:true, label:'이 기기에서 사용 가능 · 켜면 API 키보다 먼저 시도됩니다' };
}
window.describeLocalModelAvailability = describeLocalModelAvailability;

// 이 토글/진단로그 UI는 두 군데서 보여야 한다: ①시작 전 키 등록 화면
// (`#local-model-setting`) ②게임 시작 후 "AI설정" 패널
// (`#local-model-setting-ingame`, misc/298:renderAISettings가 마운트).
// 두 컨테이너가 같은 시점에 DOM에 동시에 존재할 수 있어(화면 전환은
// CSS class 토글이라 이전 화면도 DOM엔 남아있음) id를 그대로 재사용하면
// document.getElementById가 항상 먼저 나온 것만 찾는 문제가 생긴다 —
// 그래서 각 마운트마다 접미사를 붙여 텍스트영역/버튼 id를 분리한다.
const LOCAL_MODEL_MOUNTS = [
  { containerId: 'local-model-setting', suffix: '' },
  { containerId: 'local-model-setting-ingame', suffix: '-ingame' },
];

export async function renderLocalModelSetting(){
  const on = isLocalModelEnabled();
  const { supported, label } = await describeLocalModelAvailability();
  const state = getLocalModelState();
  const stateLabel = { idle: on ? '⏳ 대기 중 (이동/행동 시 자동으로 다운로드 시작)' : '', loading:'⏳ 다운로드/로딩 중...', ready:'✅ 준비됨', error:'⚠️ 로드 실패, 로컬 조합 사용 중' }[state] || '';
  const log = getLocalModelLog();
  LOCAL_MODEL_MOUNTS.forEach(({containerId, suffix})=>{
    const box = typeof document !== 'undefined' ? document.getElementById(containerId) : null;
    if(!box) return;
    box.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div style="font-size:9px;color:var(--dim);line-height:1.5">
          🧠 로컬 AI 모델 (실험적)<br>
          <span style="font-size:8px">${label}${on && stateLabel ? ' · '+stateLabel : ''}</span>
        </div>
        <button class="btn btn-dark" style="font-size:8px;padding:6px 10px;flex-shrink:0;${on?'border-color:#4a7a2a;color:#80c060':''}"
          onclick="toggleLocalModelSetting()" ${supported ? '' : 'disabled'}>
          ${on ? 'ON' : 'OFF'}
        </button>
      </div>
      <details style="margin-top:6px">
        <summary style="font-size:8px;color:var(--dim);cursor:pointer">🔍 진단 로그 보기 (문제 있으면 여기 내용을 복사해서 알려주세요)</summary>
        <textarea id="local-model-log-ta${suffix}" readonly style="width:100%;height:100px;margin-top:6px;font-size:8px;font-family:monospace;background:var(--bg-input);color:var(--dim);border:1px solid var(--border);resize:vertical">${log}</textarea>
        <button class="btn btn-dark" style="width:100%;font-size:8px;padding:5px;margin-top:4px" onclick="copyLocalModelLog('${suffix}')">📋 로그 복사</button>
      </details>`;
  });
}
window.renderLocalModelSetting = renderLocalModelSetting;

export function _refreshDebugLogPanel(){
  if(typeof document === 'undefined') return;
  const log = getLocalModelLog();
  LOCAL_MODEL_MOUNTS.forEach(({suffix})=>{
    const ta = document.getElementById('local-model-log-ta'+suffix);
    if(ta) ta.value = log;
  });
}
window._refreshDebugLogPanel = _refreshDebugLogPanel;

export function copyLocalModelLog(suffix){
  suffix = suffix || '';
  const text = getLocalModelLog();
  const ta = typeof document !== 'undefined' ? document.getElementById('local-model-log-ta'+suffix) : null;
  const done = ()=>{ if(typeof window.toast==='function') window.toast('📋 로그를 복사했어요', 2000); };
  const fail = ()=>{
    if(ta){ ta.focus(); ta.select(); }
    if(typeof window.toast==='function') window.toast('자동 복사 실패 — 로그 칸을 직접 선택해 Ctrl+C로 복사해주세요', 3000);
  };
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done).catch(fail);
    } else { fail(); }
  }catch(e){ fail(); }
}
window.copyLocalModelLog = copyLocalModelLog;

export function toggleLocalModelSetting(){
  const next = !isLocalModelEnabled();
  setLocalModelEnabled(next);
  renderLocalModelSetting();
  if(next && typeof window.toast === 'function'){
    window.toast('🧠 로컬 AI 모델 사용 — 다음 생성부터 이 기기에서 시도합니다', 2500);
  }
}
window.toggleLocalModelSetting = toggleLocalModelSetting;
