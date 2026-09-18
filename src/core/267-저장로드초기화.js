// 저장·로드·초기화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { PM_KEYS } from '../data/263-저장소-키-6개-카테고리.js';
import { PM_DEFAULT } from '../data/266-기본-구조.js';
import { lsDel, lsGet, lsSet } from '../utils.js';

window._pmParsedCache = {};

export function pmLoad(part) {
  if (window._pmParsedCache[part]) return window._pmParsedCache[part];
  try {
    var raw = lsGet(PM_KEYS[part]);
    var parsed = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(PM_DEFAULT[part] || {}));
    window._pmParsedCache[part] = parsed;
    return parsed;
  } catch(e) {
    return JSON.parse(JSON.stringify(PM_DEFAULT[part] || {}));
  }
}
window.pmLoad = pmLoad;

export function pmSave(part, data) {
  window._pmParsedCache[part] = data;  // 파싱 캐시 즉시 갱신
  window._blsCache.turn = -1;           // BLS 캐시 무효화
  try {
    if (typeof S !== 'undefined') data._updatedAt = S.msgCount || 0;
    lsSet(PM_KEYS[part], JSON.stringify(data));
  } catch(e) {}
}
window.pmSave = pmSave;

export function pmClearAll() {
  window._pmParsedCache = {};
  window._blsCache.turn = -1;
  Object.keys(PM_KEYS).forEach(function(p){ try { lsDel(PM_KEYS[p]); } catch(e) {} });
}
window.pmClearAll = pmClearAll;

window.pmLoad    = pmLoad;

window.pmSave    = pmSave;

window.pmClearAll= pmClearAll;
