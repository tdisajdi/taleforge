// 세계관 파트 업데이트
// Auto-extracted from taleforge.html (original section banner preserved above).
import { pmLoad, pmSave } from '../core/267-저장로드초기화.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadFactionGauge } from '../race/260-수인족-패널-렌더.js';

export function pmUpdateWorld(text, category, source) {
  if (!text) return;
  var d = pmLoad('world');
  var turn = (typeof S !== 'undefined' && S.msgCount) || 0;
  var entry = { turn:turn, text:text.slice(0,80) };
  if (category === 'rumor') {
    if (source) entry.source = source.slice(0,20);
    d.rumors.push(entry);
    // world rumors 무제한
  } else if (category === 'discovery') {
    d.discoveries = d.discoveries || [];
    d.discoveries.push(entry);
    // discoveries 무제한
  } else if (category === 'faction') {
    d.factions = d.factions || {};
    // 파벌 상태 동기화
    try {
      // [B83 FIX] loadFactionGauge()의 실제 필드는 fg.factions가 아니라
      // fg.gauges({세력명:숫자} 형태)라 항상 빈 객체만 순회하던 버그.
      var fg = typeof loadFactionGauge === 'function' ? loadFactionGauge() : {};
      var gauges = fg.gauges || {};
      Object.entries(gauges).forEach(function(kv) {
        var name = kv[0], score = kv[1];
        if (!d.factions[name]) d.factions[name] = { relation:0, keyEvents:[] };
        d.factions[name].relation = score || 0;
        d.factions[name].keyEvents.push({ turn:turn, text:text.slice(0,50) });
        // faction keyEvents 무제한
      });
    } catch(e) {}
  } else {
    // 일반 세계 사건
    entry.type = category || 'event';
    d.events.push(entry);
    // world events 무제한
  }
  pmSave('world', d);
}
window.pmUpdateWorld = pmUpdateWorld;
