// 현재 씬 분석 헬퍼
// Auto-extracted from taleforge.html (original section banner preserved above).
import { pmLoad } from '../core/267-저장로드초기화.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { loadNPCs } from './001-block0-preamble.js';
import { loadLocNpcAssign } from './053-게시판-시스템.js';

export function _pmGetRecentText(n) {
  // 최근 n개 AI 메시지 텍스트 합산
  n = n || 3;
  try {
    var msgs = document.querySelectorAll('.msg-ai .msg-text');
    var texts = [];
    for (var i = Math.max(0, msgs.length - n); i < msgs.length; i++) {
      texts.push(msgs[i].textContent || '');
    }
    return texts.join(' ');
  } catch(e) {
    // S.messages 폴백
    try {
      var sm = (typeof S !== 'undefined' && S.messages) || [];
      return sm.filter(function(m){ return m.role === 'assistant'; })
               .slice(-n).map(function(m){ return m.content || ''; }).join(' ');
    } catch(e2) { return ''; }
  }
}
window._pmGetRecentText = _pmGetRecentText;

export function _pmDetectCurrentNpcs(recentText) {
  // ④ 씬 감지 개선: 텍스트 매칭 + 현재 위치 배치 NPC 연동
  try {
    var d = pmLoad('npc');
    var names = Object.keys(d);
    // pmData 미등록 NPC도 포함
    try {
      var gameNpcs = (typeof loadNPCs === 'function' ? loadNPCs() || [] : []).map(function(n) { return n.name; });
      gameNpcs.forEach(function(n) { if (n && !d[n]) names.push(n); });
    } catch(e) {}
    // 위치 기반 NPC 추가 (현재 장소에 배정된 NPC)
    var locBasedNpcs = [];
    try {
      var curLoc = typeof loadCurrentLocation === 'function' ? loadCurrentLocation() : null;
      var locAssign = typeof loadLocNpcAssign === 'function' ? loadLocNpcAssign() : {};
      if (curLoc) {
        var locKey = curLoc.id || curLoc.name || '';
        var assigned = locAssign[locKey] || [];
        assigned.forEach(function(n) { if (n && locBasedNpcs.indexOf(n) === -1) locBasedNpcs.push(n); });
      }
    } catch(e) {}
    // 텍스트 매칭으로 등장 NPC 감지
    var found = names.filter(function(name) { return recentText.includes(name); });
    // 위치 기반 NPC 중 텍스트 미감지된 것도 추가 (위치에 있으면 씬에 존재 가능)
    locBasedNpcs.forEach(function(n) { if (found.indexOf(n) === -1) found.push(n); });
    // 정렬: 텍스트 감지 > 위치 배치 > 최근 등장 > 관계도
    found.sort(function(a, b) {
      var inTextA = recentText.includes(a) ? 1 : 0;
      var inTextB = recentText.includes(b) ? 1 : 0;
      if (inTextA !== inTextB) return inTextB - inTextA;
      var ta = (d[a] && d[a].lastSeenTurn) || 0;
      var tb = (d[b] && d[b].lastSeenTurn) || 0;
      var ra = (d[a] && d[a].rel) || 50;
      var rb = (d[b] && d[b].rel) || 50;
      return (tb - ta) || (rb - ra);
    });
    return found.slice(0, 5); // 최대 5명으로 확대 (기존 3명)
  } catch(e) { return []; }
}
window._pmDetectCurrentNpcs = _pmDetectCurrentNpcs;

export function _pmDetectActiveQuests(recentText) {
  // 현재 씬에 관련된 활성 퀘스트 최대 2개 감지
  try {
    var d = pmLoad('quest');
    var activeIds = d._activeIds || [];
    var found = activeIds.filter(function(id) {
      var q = d[id];
      if (!q) return false;
      // 퀘스트 제목이나 관련 NPC 이름이 최근 텍스트에 등장하면 관련 퀘스트
      if (recentText.includes(q.title)) return true;
      if ((q.npcsInvolved || []).some(function(n){ return recentText.includes(n); })) return true;
      return false;
    });
    // 발견 없으면 가장 최근 활성 퀘스트 2개 반환
    if (!found.length) found = activeIds.slice(-2);
    return found.slice(0, 2);
  } catch(e) { return []; }
}
window._pmDetectActiveQuests = _pmDetectActiveQuests;
