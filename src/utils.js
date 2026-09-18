// Common utilities — shared across many unrelated systems, extracted
// from wherever in the original file they happened to be declared
// (see generate.js UTIL_NAMES).
import { _memStore } from './data/001-block0-preamble.js';

export const lsGet = (k) => {
  try {
    const lsVal = localStorage.getItem(k);
    if (lsVal !== null) return lsVal;
  } catch(e) {}
  return (_memStore[k] !== undefined && _memStore[k] !== null) ? _memStore[k] : null;
};

export const lsSet = (k, v) => {
  try {
    localStorage.setItem(k, v);
    window._lsQuotaWarned = false; // 성공 시 경고 리셋
  } catch(e) {
    // [BUG23 FIX] QuotaExceededError 등 저장 실패 감지 및 알림
    if (!window._lsQuotaWarned) {
      window._lsQuotaWarned = true;
      const isQuota = e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22);
      console.warn('[TaleForge] localStorage 저장 실패:', e?.name || e?.message);
      // toast가 정의된 시점이라면 플레이어에게 알림
      setTimeout(() => {
        try {
          if (typeof toast === 'function') {
            toast(isQuota ? '⚠️ 저장공간 부족! 오래된 데이터를 정리하거나 브라우저 저장소를 확인하세요.' : '⚠️ 데이터 저장 실패. 임시 메모리에 보관 중입니다.', 5000);
          }
        } catch(e2) {}
      }, 0);
    }
  }
  _memStore[k] = v; // localStorage 실패해도 메모리에는 저장
  return true;
};

export const lsDel = (k) => {
  try { localStorage.removeItem(k); } catch(e) {}
  delete _memStore[k];
};

export function $(id){ return document.getElementById(id); }
window.$ = $;

export function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
window.esc = esc;

// tools/pixelart-gen이 생성한 도트 아이콘을 엔티티(아이템/몬스터/
// NPC/장소 등)에 자동으로 연결하는 헬퍼. entity.id 또는 entity.name으로
// PIXEL_ART_MANIFEST(build 시 900-pixelart-manifest.js에서 주입됨)를
// 조회해서 이미지가 있으면 <img>를, 없으면 기존 이모지(entity.icon)로
// 조용히 폴백한다 — 매니페스트가 아직 없거나(구버전 빌드) 이미지
// 파일 자체가 배포 시 누락됐을 때도 onerror로 다시 이모지로 폴백하므로
// 절대 빈 아이콘이 뜨지 않는다.
export function getEntityIconHTML(entity, opts){
  const fallback = esc((entity && entity.icon) || '❔');
  const size = (opts && opts.size) || 28;
  const cls = (opts && opts.className) || 'pixel-icon';
  try{
    const m = window.PIXEL_ART_MANIFEST;
    if(!m) return fallback;
    // 등급/단계/티어류(badge 카테고리) 데이터는 실제 게임 코드에서
    // name이 아니라 label 필드를 쓴다(스캐너도 그 경우 label을
    // 이름으로 취급해서 매니페스트에 등록함) — 여기서도 label을
    // 이름 후보로 같이 봐야 그 600여 개 항목이 실제로 연결된다.
    const nameKey = (entity && entity.name) || (entity && entity.label);
    const hit = (entity && entity.id != null && m.byId[entity.id]) || (nameKey && m.byName[nameKey]);
    if(!hit) return fallback;
    return `<span class="pixel-icon-wrap" style="display:inline-block;line-height:0">`
      + `<img src="assets/${hit.path}" class="${esc(cls)}" width="${size}" height="${size}" `
      + `style="image-rendering:pixelated;vertical-align:middle" alt="${esc(nameKey||'')}" `
      + `onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">`
      + `<span style="display:none;font-size:${size}px;line-height:1">${fallback}</span>`
      + `</span>`;
  }catch(e){ return fallback; }
}
window.getEntityIconHTML = getEntityIconHTML;

// [3번째 인자 icon 추가] 토스트에 도트 아이콘을 붙이고 싶을 때 쓰는
// 선택적 엔티티 인자. 의도적으로 msg 자체는 여전히 textContent로만
// 넣는다(바꾸지 않음) — msg는 AI가 파싱한 이름/장소 등 자유 텍스트가
// 섞여 들어올 수 있어서, innerHTML로 바꾸면 그 안에 우연히 `<`/`>`가
// 있을 때 화면이 깨지거나(극단적으론 HTML 삽입) 위험하다. 아이콘은
// 그와 별개로, 우리 코드가 직접 만든(=신뢰할 수 있는) 이미지 조각만
// 별도 DOM 요소로 안전하게 덧붙인다.
//
// [자동 리딩 이모지 인식] toast() 호출부 694곳이 `toast(\`⚠️ 문구...\`)`
// 처럼 메시지 맨 앞에 이모지를 하드코딩해뒀다 — 그 많은 호출부를 전부
// 고치는 대신, msg 맨 앞 글자가 매니페스트에 등록된(=우리가 도트로
// 만들어둔) 이모지면 여기서 자동으로 떼어내 이미지로 바꾼다. 나머지
// 문자열은 그대로 textContent라서 안전성은 전혀 바뀌지 않는다 — 매니페스트에
// 없는 이모지는 그냥 원래처럼 텍스트 그대로 보인다(폴백 없음, 원본 유지).
export function toast(msg, ms=2500, icon){
  document.querySelectorAll('.toast-el').forEach(e=>e.remove());
  const t=document.createElement('div'); t.className='toast-el';
  let leadIcon = icon, bodyMsg = msg;
  if(!leadIcon && typeof msg === 'string'){
    try{
      const m = msg.match(/^(\p{Extended_Pictographic}️?)(\s+)/u);
      const manifest = window.PIXEL_ART_MANIFEST;
      if(m && manifest && manifest.byName && manifest.byName[m[1]]){
        leadIcon = { name: m[1], icon: m[1] };
        bodyMsg = msg.slice(m[0].length);
      }
    }catch(e){ /* 구형 브라우저 등에서 \p{} 미지원 시 그냥 원본 그대로 */ }
  }
  if(leadIcon && typeof getEntityIconHTML==='function'){
    const iconWrap=document.createElement('span');
    iconWrap.style.cssText='display:inline-block;vertical-align:middle;margin-right:6px';
    iconWrap.innerHTML=getEntityIconHTML(leadIcon, {size:16}); // 신뢰 가능한 코드 생성 HTML만
    t.appendChild(iconWrap);
  }
  const textEl=document.createElement('span');
  textEl.style.verticalAlign='middle';
  textEl.textContent=bodyMsg;
  t.appendChild(textEl);
  document.body.appendChild(t); setTimeout(()=>t.remove(), ms);
}
window.toast = toast;

export function showToast(msg, ms=2500){ toast(msg, ms); }

// toast()의 좀 더 유연한 버전 — 아이콘이 문장 맨 앞이 아니라 중간에
// 있거나, 한 메시지에 아이콘이 여러 개 섞인 경우를 위한 것.
// 호출부에서 이미 "아이콘 부분은 getEntityIconHTML(...)로, 나머지
// 자유 텍스트는 esc(...)로" 각각 안전 처리를 마친 HTML 조각을
// 건네준다고 전제한다(자동 변환 스크립트 wire-toast-icons2.js가
// 이 계약을 지키도록 기계적으로 생성함) — 그래서 여기서는 그냥
// innerHTML로 넣는다.
export function toastHTML(html, ms=2500){
  document.querySelectorAll('.toast-el').forEach(e=>e.remove());
  const t=document.createElement('div'); t.className='toast-el';
  // html은 호출부가 이미 안전 처리(엔티티 부분은 getEntityIconHTML로,
  // 나머지 자유 텍스트는 esc로)를 마친 상태다. 그 위에 한 번 더
  // decorateEmojiIcons를 태워서, 아직 그림으로 안 바뀐 하드코딩
  // 이모지(예: 문장 맨 앞 "🎁")까지 마저 이미지로 바꾼다 — esc() 이후
  // 단계에 known 이모지 치환만 하므로 안전성은 그대로다.
  t.innerHTML = (typeof decorateEmojiIcons === 'function') ? decorateEmojiIcons(html) : html;
  document.body.appendChild(t); setTimeout(()=>t.remove(), ms);
}
window.toastHTML = toastHTML;

// NPC 소문/월드뉴스(예: renderFactionNewsBulletin)의 msg 문자열은
// AI 프롬프트에도 그대로 재사용된다(misc/076) — 그래서 그 원문 자체는
// 절대 안 바꾼다. 이 헬퍼는 "이미 esc()로 이스케이프된" HTML 문자열을
// 받아서, 그 안에 섞여 있는 알려진 이모지(사건 종류 14개 + 범용 알림
// 이모지 143개, event-icons.js/common-icons.js 참고)만 화면 표시용
// 대표 도트 배지로 바꿔치기한다. esc() 이후 단계라 원본 텍스트에
// `<`/`>` 등이 있었어도 이미 안전하게 무력화된 뒤이므로, 여기서
// 하는 일은 "정해진 이모지 문자를 우리가 만든 신뢰 가능한 HTML로
// 치환"뿐이라 안전하다.
//
// 어떤 이모지가 "정해진" 것인지는 하드코딩 목록 대신 매니페스트
// 자체(byName 키 중 순수 이모지 시퀀스인 것들)에서 매번 읽어온다 —
// event-icons.js/common-icons.js에 새 이모지를 추가해도 여기를
// 따로 고칠 필요가 없도록.
let _emojiIconRegexCache = null;
function _getEmojiIconRegex(manifest){
  if(_emojiIconRegexCache && _emojiIconRegexCache.forManifest === manifest) return _emojiIconRegexCache.re;
  const isPureEmoji = k => /^\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*$/u.test(k);
  const keys = Object.keys(manifest.byName).filter(isPureEmoji).sort((a,b)=>b.length-a.length);
  const re = keys.length ? new RegExp(keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'), 'gu') : null;
  _emojiIconRegexCache = { forManifest: manifest, re };
  return re;
}
export function decorateEmojiIcons(escapedHtml){
  try{
    const m = window.PIXEL_ART_MANIFEST;
    if(!m || typeof escapedHtml !== 'string') return escapedHtml;
    const re = _getEmojiIconRegex(m);
    if(!re) return escapedHtml;
    return escapedHtml.replace(re, (emoji) => {
      const hit = m.byName[emoji];
      if(!hit) return emoji;
      return `<span class="pixel-icon-wrap" style="display:inline-block;line-height:0;vertical-align:middle">`
        + `<img src="assets/${hit.path}" width="14" height="14" style="image-rendering:pixelated;vertical-align:middle" alt="${emoji}" `
        + `onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">`
        + `<span style="display:none">${emoji}</span></span>`;
    });
  }catch(e){ return escapedHtml; }
}
window.decorateEmojiIcons = decorateEmojiIcons;
window.showToast = showToast;

export function dbGet(key){ try{ return JSON.parse(lsGet(key)||'null'); }catch(e){ return null; } }
window.dbGet = dbGet;

export function dbSet(key,val){ try{ lsSet(key,JSON.stringify(val)); }catch(e){} }
window.dbSet = dbSet;

// [버그 수정] 퀘스트 수락/전직 제안/돌발 이벤트 등 화면 전체를 덮는 여러
// 팝업 시스템이 서로 독립적으로 만들어져, 같은 턴에 두 개 이상이 동시에
// 뜨면 위에 뜬 팝업을 닫아도 그 아래 또 다른 전체화면 팝업이 그대로 남아
// 있어 입력이 계속 막힌 것처럼 보이는 문제가 있었다. 각 팝업을 띄우기
// 직전에 다른 차단 팝업이 이미 열려 있는지 확인하고, 열려 있으면 잠시
// 후 다시 시도해 절대 두 개가 동시에 뜨지 않도록 한다.
export const BLOCKING_POPUP_IDS = [
  'quest-accept-popup', 'job-suggest-popup', 'wanderer-evo-popup',
  'rand-event-popup', 'rd-conquest-popup', 'dream-popup-ov',
  'continent-crisis-popup', 'race-skill-popup', 'demesne-unlock-popup',
];
window.BLOCKING_POPUP_IDS = BLOCKING_POPUP_IDS;

export function isBlockingPopupOpen(excludeId){
  return BLOCKING_POPUP_IDS.some(id=>{
    if(id === excludeId) return false;
    const el = document.getElementById(id);
    if(!el) return false;
    if(id === 'quest-accept-popup') return el.classList.contains('open');
    return true; // 나머지는 동적 생성 방식이라 DOM에 존재 = 열려 있는 상태
  });
}
window.isBlockingPopupOpen = isBlockingPopupOpen;

export function showBlockingPopupWhenFree(showFn, excludeId, attempts=0){
  if(attempts > 15){ try{ showFn(); }catch(e){} return; } // 너무 오래 밀리면 내용 유실 방지를 위해 그냥 띄운다
  if(isBlockingPopupOpen(excludeId)){
    setTimeout(()=>showBlockingPopupWhenFree(showFn, excludeId, attempts+1), 1200);
    return;
  }
  try{ showFn(); }catch(e){}
}
window.showBlockingPopupWhenFree = showBlockingPopupWhenFree;

// [버그 수정 — 포괄판] BLOCKING_POPUP_IDS에 등록된 것 외에도, 화면
// 전체를 덮는 팝업을 만드는 곳이 코드베이스 전체에 27곳 넘게 더 있다
// (전직 제안, 돌발 이벤트, 레벨업 연출, 정복 알림, 꿈/환영, 대륙 위기,
// 종족 스킬 각성, 영지 해금 등 — 전부 `position:fixed;inset:0` 인라인
// 스타일로 만들어 document.body.appendChild로 붙이는 동일한 패턴).
// 이걸 하나하나 찾아 개별 파일마다 가드를 넣는 대신, document.body.
// appendChild 자체를 감싸서 "화면 전체를 덮는 팝업" 모양을 가진 요소가
// 붙으려 할 때 이미 같은 종류가 떠 있으면 큐에 넣어뒀다가, 먼저 뜬
// 팝업이 DOM에서 사라지는 순간(=닫히는 순간) 자동으로 이어서 띄운다.
// 이렇게 하면 앞으로 새로 추가되는 팝업 시스템까지 포함해 한 곳에서
// 전부 막을 수 있다.
(function installOverlayStackGuard(){
  function install(){
    if(window._overlayStackGuardInstalled) return;
    window._overlayStackGuardInstalled = true;

    function looksLikeFullScreenOverlay(el){
      if(!el || !el.style) return false;
      const css = el.style.cssText || '';
      // [주의] "inset: 0px"처럼 0 바로 뒤에 단위(px)가 붙으면 둘 다 단어
      // 문자라 \b가 그 사이에서 매치되지 않는다 — \b를 쓰지 않는다.
      return /position:\s*fixed/.test(css) && /inset:\s*0/.test(css);
    }
    function questPopupOpen(){
      const q = document.getElementById('quest-accept-popup');
      return !!(q && q.classList.contains('open'));
    }

    const queue = [];
    let watching = null;

    function watchForClose(el){
      watching = el;
      const obs = new MutationObserver(()=>{
        if(!document.body.contains(el)){
          obs.disconnect();
          if(watching===el) watching = null;
          flushQueue();
        }
      });
      obs.observe(document.body, {childList:true});
    }

    function flushQueue(){
      if((watching && document.body.contains(watching)) || questPopupOpen()) return;
      if(!queue.length) return;
      const next = queue.shift();
      _origAppendChild(next);
      watchForClose(next);
    }

    const _origAppendChild = document.body.appendChild.bind(document.body);
    document.body.appendChild = function(el){
      if(looksLikeFullScreenOverlay(el)){
        const somethingOpen = (watching && document.body.contains(watching)) || questPopupOpen();
        if(somethingOpen){
          queue.push(el);
          return el;
        }
        const result = _origAppendChild(el);
        watchForClose(el);
        return result;
      }
      return _origAppendChild(el);
    };

    // 정적 요소인 퀘스트 수락 팝업이 닫히는 순간에도 큐를 흘려보낸다.
    const qap = document.getElementById('quest-accept-popup');
    if(qap){
      new MutationObserver(()=>{ if(!questPopupOpen()) flushQueue(); })
        .observe(qap, {attributes:true, attributeFilter:['class']});
    }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
