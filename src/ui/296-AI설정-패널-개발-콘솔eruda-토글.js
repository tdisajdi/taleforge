// 🛠️ AI설정 패널 + 개발 콘솔(eruda) 토글
// Auto-extracted from taleforge.html (original section banner preserved above).
import { renderAISettings } from '../misc/298-훅-연결.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const ERUDA_ENABLED_KEY = 'tf-eruda-enabled';

export function isErudaEnabled() {
  try { return lsGet(ERUDA_ENABLED_KEY) === '1'; } catch(e) { return false; }
}
window.isErudaEnabled = isErudaEnabled;

export function setErudaEnabled(v) {
  try { lsSet(ERUDA_ENABLED_KEY, v ? '1' : '0'); } catch(e) {}
}
window.setErudaEnabled = setErudaEnabled;

export function toggleEruda() {
  const enabled = !isErudaEnabled();
  setErudaEnabled(enabled);
  if (enabled) {
    if (typeof eruda === 'undefined') {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/eruda';
      s.onload = function() { eruda.init(); toast('🛠️ 개발 콘솔 활성화됨', 1800); };
      document.head.appendChild(s);
    } else {
      eruda.init();
      toast('🛠️ 개발 콘솔 활성화됨', 1800);
    }
  } else {
    if (typeof eruda !== 'undefined') {
      try { eruda.destroy(); } catch(e) {}
    }
    toast('🛠️ 개발 콘솔 비활성화됨', 1800);
  }
  renderAISettings();
}
window.toggleEruda = toggleEruda;
