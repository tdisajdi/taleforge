// 퀘스트 파트 업데이트
// Auto-extracted from taleforge.html (original section banner preserved above).
import { pmLoad, pmSave } from '../core/267-저장로드초기화.js';
import { MAIN_QUESTS } from '../data/042-직업-시스템-무한-파생-도감.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadMainQuestState } from '../job/042-직업-시스템-무한-파생-도감.js';
import { loadDynQuests } from '../misc/001-block0-preamble.js';
import { _pmQuestDefault } from './265-퀘스트별-풍부한-데이터-구조.js';

export function pmUpdateQuest(type, questTitle, detail, extra) {
  if (!questTitle) return;
  extra = extra || {};
  var d = pmLoad('quest');
  // 퀘스트 ID = 제목을 키로 사용 (공백 제거 + 해시 suffix로 충돌 방지)
  var qid = (function(title) {
    var base = title.replace(/\s+/g, '_').slice(0, 20);
    var hash = title.split('').reduce(function(h, c) { return (h * 31 + c.charCodeAt(0)) & 0xffff; }, 0);
    return base + '_' + hash.toString(16);
  })(questTitle);
  var turn = (typeof S !== 'undefined' && S.msgCount) || 0;

  if (!d[qid]) d[qid] = _pmQuestDefault(questTitle);
  var q = d[qid];

  if (type === 'active') {
    q.status = 'active';
    q.desc = q.desc || (detail || '').slice(0, 100);
    q.addedTurn = q.addedTurn || turn;
    if (!d._activeIds) d._activeIds = [];
    if (!d._activeIds.includes(qid)) d._activeIds.push(qid);
  } else if (type === 'completed') {
    q.status = 'completed';
    q.completedTurn = turn;
    q.resolution = (detail || '완료').slice(0, 80);
    d._activeIds = (d._activeIds || []).filter(function(id){ return id !== qid; });
    if (!d._completedIds) d._completedIds = [];
    if (!d._completedIds.includes(qid)) d._completedIds.push(qid);
  } else if (type === 'failed') {
    q.status = 'failed';
    q.completedTurn = turn;
    q.resolution = (detail || '실패').slice(0, 80);
    d._activeIds = (d._activeIds || []).filter(function(id){ return id !== qid; });
    if (!d._failedIds) d._failedIds = [];
    if (!d._failedIds.includes(qid)) d._failedIds.push(qid);
  } else if (type === 'main') {
    d._mainProgress = (questTitle + (detail ? ': ' + detail : '')).slice(0, 150);
  } else if (type === 'clue') {
    var lastClue = q.clues[q.clues.length - 1];
    if (lastClue && lastClue.turn === turn) return;  // 같은 턴 중복 차단
    q.clues.push({ turn:turn, text:(detail||'').slice(0,200) });
    // clues 무제한
  } else if (type === 'moment') {
    q.keyMoments.push({ turn:turn, text:(detail||'').slice(0,200) });
    // keyMoments 무제한
  } else if (type === 'choice') {
    q.playerChoices.push({ turn:turn, choice:(detail||'').slice(0,60), outcome:(extra.outcome||'').slice(0,60) });
    // playerChoices 무제한
  } else if (type === 'npc') {
    if (!(q.npcsInvolved || []).includes(detail)) {
      q.npcsInvolved = q.npcsInvolved || [];
      q.npcsInvolved.push(detail);
    }
  }

  pmSave('quest', d);
}
window.pmUpdateQuest = pmUpdateQuest;

window._pmSyncQuestLastHash = '';

export function pmSyncQuestFromGame() {
  try {
    var dynQ = typeof loadDynQuests === 'function' ? loadDynQuests() || [] : [];
    var sid   = (typeof S !== 'undefined' && S.scenario && S.scenario.id) || 'custom';
    var mqState = typeof loadMainQuestState === 'function' ? loadMainQuestState() : {};

    // 상태 해시로 변화 감지 — 변화 없으면 pmSave 전혀 안 함
    var stateHash = JSON.stringify(dynQ.map(function(q){ return q.id+'|'+q.status; })) + JSON.stringify(mqState);
    if (stateHash === window._pmSyncQuestLastHash) return;
    window._pmSyncQuestLastHash = stateHash;

    var d = pmLoad('quest');
    var dirty = false;

    dynQ.forEach(function(q) {
      var title = q.title || q.id || '';
      if (!title) return;
      // 기존 상태와 다를 때만 업데이트
      var qid = (function(t){
        var base = t.replace(/\s+/g,'_').slice(0,20);
        var hash = t.split('').reduce(function(h,c){return(h*31+c.charCodeAt(0))&0xffff;},0);
        return base+'_'+hash.toString(16);
      })(title);
      var prev = d[qid] ? d[qid].status : null;
      if (q.status === 'active' && prev !== 'active') {
        pmUpdateQuest('active', title, q.desc || ''); dirty = true;
      } else if (q.status === 'completed' && prev !== 'completed') {
        pmUpdateQuest('completed', title, '완료'); dirty = true;
      } else if (q.status === 'failed' && prev !== 'failed') {
        pmUpdateQuest('failed', title, '실패'); dirty = true;
      }
    });

    // 메인 퀘스트
    try {
      var MAIN_Q = typeof MAIN_QUESTS !== 'undefined' ? MAIN_QUESTS : {};
      var quests = MAIN_Q[sid] || MAIN_Q.custom || [];
      var activeQ = quests.find(function(q){ return mqState[q.id] === 'active'; });
      if (activeQ) { pmUpdateQuest('main', activeQ.title, activeQ.desc || ''); dirty = true; }
    } catch(e) {}
  } catch(e) {}
}
window.pmSyncQuestFromGame = pmSyncQuestFromGame;

export function pmDetectQuestFromText(aiText, userMsg) {
  if (!aiText) return;
  try {
    var lc = aiText.toLowerCase();
    var d = pmLoad('quest');
    var activeIds = d._activeIds || [];
    // 각 활성 퀘스트와 관련된 텍스트 감지
    activeIds.forEach(function(qid) {
      var q = d[qid];
      if (!q) return;
      var qtitle = (q.title || '').toLowerCase();
      var relevant = lc.includes(qtitle) ||
        (q.npcsInvolved || []).some(function(n){ return lc.includes(n.toLowerCase()); });
      if (!relevant) return;
      // 단서 감지
      if (/단서|발견|알아냈|찾았|증거|흔적/.test(lc)) {
        pmUpdateQuest('clue', q.title, aiText.slice(0, 80));
      }
      // 중요 순간 감지
      if (/깨달았|밝혀졌|드러났|충격|반전|비밀이/.test(lc)) {
        pmUpdateQuest('moment', q.title, aiText.slice(0, 80));
      }
      // 선택 기록
      if (userMsg && userMsg.length > 3) {
        pmUpdateQuest('choice', q.title, userMsg.slice(0, 60), { outcome: aiText.slice(0, 60) });
      }
    });
  } catch(e) {}
}
window.pmDetectQuestFromText = pmDetectQuestFromText;
