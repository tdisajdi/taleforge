// 선택 파트 업데이트
// Auto-extracted from taleforge.html (original section banner preserved above).
import { pmLoad, pmSave } from '../core/267-저장로드초기화.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { _pmDetectActiveQuests, _pmDetectCurrentNpcs, _pmGetRecentText } from './268-현재-씬-분석-헬퍼.js';

export function pmUpdateChoice(choiceText, consequence, effect, questId) {
  if (!choiceText) return;
  var d = pmLoad('choices');
  var turn = (typeof S !== 'undefined' && S.msgCount) || 0;
  var lc = choiceText.toLowerCase();

  // 카르마
  d.karma = d.karma || { good:0, evil:0, wise:0 };
  if (/도와|구했|살렸|용서|나눠|희생|지켜/.test(lc)) d.karma.good++;
  if (/죽|살인|배신|훔|약탈|위협|속였/.test(lc)) d.karma.evil++;
  if (/조사|탐구|협상|설득|분석|확인/.test(lc)) d.karma.wise++;

  // 중요 선택 저장
  d.major = d.major || [];
  var entry = { turn:turn, choice:choiceText.slice(0,60), consequence:(consequence||'').slice(0,70), effect:(effect||'').slice(0,40), questId:questId||'' };
  d.major.push(entry);
  // major choices 무제한

  // 운명적 선택 감지
  if (/운명|돌이킬 수 없|세상이 바뀔|역사에 남을|전설/.test((consequence||'').toLowerCase())) {
    d.pivotal = d.pivotal || [];
    d.pivotal.push({ turn:turn, text:choiceText.slice(0,60) + ' → ' + (consequence||'').slice(0,60) });
    // pivotal 무제한
  }

  // 행동 패턴
  _pmDetectPattern(d);
  pmSave('choices', d);
}
window.pmUpdateChoice = pmUpdateChoice;

export function _pmDetectPattern(d) {
  d.patterns = d.patterns || [];
  var recent = (d.major || []).slice(-6).map(function(m){ return m.choice; }).join(' ').toLowerCase();
  var checks = [
    { re:/협상|설득|대화|외교/,   label:'외교적 해결 선호' },
    { re:/공격|싸움|전투|도전/,   label:'직접 대결 선호' },
    { re:/도망|피하|숨|회피/,     label:'위험 회피 성향' },
    { re:/도움|구하|배려|희생/,   label:'이타적 행동 패턴' },
    { re:/조사|탐구|물어|확인/,   label:'신중한 정보 수집 성향' },
    { re:/거짓|속임|위장|가장/,   label:'기만적 접근 선호' },
    { re:/뇌물|돈으로|보상을 주/, label:'경제적 해결 선호' },
  ];
  checks.forEach(function(c) {
    if (c.re.test(recent) && !d.patterns.includes(c.label)) {
      d.patterns.push(c.label);
      if (d.patterns.length > 5) d.patterns.splice(0,1);
    }
  });
}
window._pmDetectPattern = _pmDetectPattern;

window._blsCache = { turn: -1, result: '' };

export function pmGetBLS() {
  try {
    var curTurn = (typeof S !== 'undefined' && S.msgCount) || 0;
    if (window._blsCache.turn === curTurn && window._blsCache.result !== undefined && curTurn > 0) {
      return window._blsCache.result;
    }
    var parts = [];
    var totalChars = 0;
    var CHAR_BUDGET = 6000;  // 한국어 기준 약 8000토큰 분량 — 무제한 저장에 맞춰 확장

    var recentText = _pmGetRecentText(3);
    var curNpcs    = _pmDetectCurrentNpcs(recentText);
    var curQuests  = _pmDetectActiveQuests(recentText);
    var npcData    = pmLoad('npc');
    var questData  = pmLoad('quest');
    var persData   = pmLoad('personal');
    var choiceData = pmLoad('choices');
    var worldData  = pmLoad('world');
    var demData    = pmLoad('demesne');

    // ── 0순위: 현재 위치 컨텍스트 ──
    try {
      var _curLoc = typeof loadCurrentLocation==='function' ? loadCurrentLocation() : null;
      if (_curLoc) {
        var _tierNote = '';
        if (_curLoc.type==='dungeon' && _curLoc.dungeonTier) {
          var _tierLabels = {1:'초급(안전한 편)', 2:'중급(주의 필요)', 3:'고급(강력한 위협)', 4:'전설급(세계관 최상위 위협 — 몬스터와 서사 모두 그에 맞는 무게로)'};
          _tierNote = ' [던전 위험도: ' + (_tierLabels[_curLoc.dungeonTier]||_curLoc.dungeonTier) + ']';
        }
        var locStr = '[📍 현재 위치] ' + (_curLoc.name||'알 수 없는 곳') + (_curLoc.type?' ('+_curLoc.type+')':'') + (_curLoc.desc?' — '+(_curLoc.desc||'').slice(0,80):'') + _tierNote;
        totalChars += locStr.length;
        parts.push(locStr);
      }
    } catch(e) {}

    // ── 1순위: 현재 씬 NPC (씬 감지 전체, NPC당 최대 800자) ──
    if (curNpcs.length) {
      var npcParts = [];
      curNpcs.forEach(function(name) {
        if (totalChars >= CHAR_BUDGET) return;
        var n = npcData[name];
        if (!n) return;
        var relLabel = n.rel >= 80 ? '깊은 신뢰' : n.rel >= 65 ? '우호' : n.rel >= 40 ? '중립' : n.rel >= 25 ? '경계' : '적대';
        var lines = [name + ' | ' + relLabel + '(' + n.rel + ')' + (n.emotionTag ? ' | 현재 감정:' + n.emotionTag : '') + (n.role ? ' | ' + n.role : '')];
        if (n.personality)  lines.push('성격: ' + n.personality);
        if (n.speechStyle)  lines.push('말투: ' + n.speechStyle.slice(0, 80));
        // [신규] NPC 관계의 흐르는 시간 — lastSeenTurn은 그동안 데이터로만
        // 쌓이고 "오래된 NPC 자동 정리"(pmArchiveStaleNpcs) 용도로만
        // 쓰였을 뿐, AI에게 "얼마나 오래 안 만났는지"를 알려주는 경로가
        // 전혀 없어 NPC가 시간이 지나도 절대 변하지 않는 정적인 존재처럼
        // 느껴지던 문제였다. 공백 기간을 계산해 관계도·기간에 따라
        // 다른 반응 가이드를 함께 제공한다.
        var gapTurns = curTurn - (n.lastSeenTurn||curTurn);
        if (gapTurns >= 15) {
          var gapNote;
          if (gapTurns >= 60) {
            gapNote = n.rel >= 60
              ? '매우 오랜만의 재회(' + gapTurns + '턴 공백) — 반가움과 동시에 그동안 못 만난 데 대한 서운함이나 걱정을 함께 드러내라.'
              : '매우 오랜만의 재회(' + gapTurns + '턴 공백) — 서먹하고 거리감 있게, 어색한 침묵이나 형식적인 인사부터 시작하라.';
          } else if (gapTurns >= 30) {
            gapNote = n.rel >= 60
              ? '오랜만의 만남(' + gapTurns + '턴 공백) — "오랜만이다"는 언급과 함께 살짝 서운한 기색을 비춰도 좋다.'
              : '오랜만의 만남(' + gapTurns + '턴 공백) — 약간 데면데면하게 대하라.';
          } else {
            gapNote = '얼마간 못 만남(' + gapTurns + '턴 공백) — "오랜만이다" 정도의 가벼운 언급만 자연스럽게.';
          }
          lines.push('⏳ ' + gapNote);
        }
        // 최근 대화 이력 (최대 3개)
        var convs = (n.conversations || []).slice(-3);
        if (convs.length) {
          lines.push('대화: ' + convs.map(function(c){ return 'T' + c.turn + ': ' + (c.topic || '').slice(0,40) + (c.emotion?' ['+c.emotion+']':''); }).join(' / '));
        }
        // 관계 변화
        var relH = (n.relHistory || []).slice(-2);
        if (relH.length) {
          lines.push('관계변화: ' + relH.map(function(r){ return r.from + '→' + r.to + (r.reason?' ('+r.reason+')':''); }).join(', '));
        }
        // 약속
        var openPromises = (n.promises || []).filter(function(p){ return p.fulfilled === null; });
        if (openPromises.length) lines.push('약속: ' + openPromises.map(function(p){ return p.text.slice(0,40); }).join(' / '));
        // 배신
        if (n.betrayals && n.betrayals.length) lines.push('⚠️ 배신 기록: ' + n.betrayals[n.betrayals.length-1].text.slice(0,50));
        // 비밀
        if (n.secrets && n.secrets.length) lines.push('공유된 비밀: ' + n.secrets[n.secrets.length-1].text.slice(0,50));
        // 원한/호의
        if (n.grudges && n.grudges.length) lines.push('원한: ' + n.grudges[n.grudges.length-1].text.slice(0,40));
        if (n.favors && n.favors.length) lines.push('호의: ' + n.favors[n.favors.length-1].text.slice(0,40));

        var npcStr = lines.join('\n  ');
        totalChars += npcStr.length;
        npcParts.push(npcStr); // NPC당 글자수 무제한
      });
      // NPC↔NPC 관계 (씬에 2명 이상 동시 등장 시)
      if (curNpcs.length >= 2) {
        var relDescs = [];
        for (var _i = 0; _i < curNpcs.length; _i++) {
          var _nA = npcData[curNpcs[_i]];
          if (!_nA || !_nA.npcRelations) continue;
          for (var _j = _i + 1; _j < curNpcs.length; _j++) {
            var _r = _nA.npcRelations[curNpcs[_j]];
            if (_r) relDescs.push(curNpcs[_i] + '↔' + curNpcs[_j] + ': ' + _r.desc + '(관계도' + _r.rel + ')');
          }
        }
        if (relDescs.length) {
          var relStr = relDescs.join(' / ');
          totalChars += relStr.length;
          npcParts.push('[NPC 간 관계] ' + relStr);
        }
      }
      // 사망 NPC 목록 — revived는 제외, 나머지는 재등장 금지
      var deceasedNpcs = Object.keys(npcData).filter(function(k){
        return npcData[k].deceased && !npcData[k].revived;
      });
      if (deceasedNpcs.length) {
        var dStr = '[⚰️ 사망한 NPC — 이 인물들은 이미 죽었으므로 절대 재등장·언급 시 살아있는 것처럼 묘사 금지] ' +
          deceasedNpcs.map(function(k){ var n=npcData[k]; return k+'(T'+(n.deceasedTurn||'?')+' 사망)'; }).join(', ');
        totalChars += dStr.length;
        parts.push(dStr);
      }
      // 부활한 NPC 목록 — AI가 부활 상태를 인지하도록
      var revivedNpcs = Object.keys(npcData).filter(function(k){
        return npcData[k].revived;
      });
      if (revivedNpcs.length) {
        var rStr = '[💀 부활한 NPC — 죽었다가 살아난 존재. 동료로 합류했거나 재등장 가능] ' +
          revivedNpcs.map(function(k){
            var n = npcData[k];
            var rType = n.reviveType === 'fully_revived' ? '완전부활(의식·기억 온전)' : '언데드부활(감정 흐릿·충성)';
            return k+'('+rType+', T'+(n.revivedTurn||'?')+')';
          }).join(', ');
        totalChars += rStr.length;
        parts.push(rStr);
      }
      if (npcParts.length) {
        parts.push('[🤝 현재 씬 NPC 기억 — 말투·태도·반응에 반드시 반영]\n' + npcParts.join('\n---\n'));
      }
    }

    // ── 2순위: 활성 퀘스트 (무제한) ──
    if (curQuests.length && totalChars < CHAR_BUDGET) {
      var qParts = [];
      curQuests.forEach(function(qid) {
        if (totalChars >= CHAR_BUDGET) return;
        var q = questData[qid];
        if (!q) return;
        var lines = [q.title + ' [' + q.status + ']' + (q.desc ? ': ' + q.desc.slice(0,50) : '')];
        // 최근 단서 (최대 3개)
        var clues = (q.clues || []).slice(-3);
        if (clues.length) lines.push('단서: ' + clues.map(function(c){ return 'T'+c.turn+':'+c.text.slice(0,35); }).join(' / '));
        // 최근 중요 순간 (최대 2개)
        var moments = (q.keyMoments || []).slice(-2);
        if (moments.length) lines.push('주요 순간: ' + moments.map(function(m){ return m.text.slice(0,40); }).join(' / '));
        // 최근 선택 (최대 2개)
        var choices = (q.playerChoices || []).slice(-2);
        if (choices.length) lines.push('선택: ' + choices.map(function(c){ return '"'+c.choice.slice(0,30)+'"→'+c.outcome.slice(0,30); }).join(' / '));
        // 다음 단계 힌트
        if (q.nextHint) lines.push('다음 단계: ' + q.nextHint);
        // 관련 NPC
        if (q.npcsInvolved && q.npcsInvolved.length) lines.push('관련 NPC: ' + q.npcsInvolved.join(', '));

        var qStr = lines.join('\n  ');
        totalChars += qStr.length;
        qParts.push(qStr);
      });
      // 메인 스토리
      if (questData._mainProgress) {
        var mStr = '메인 스토리: ' + questData._mainProgress;
        totalChars += mStr.length;
        qParts.unshift(mStr);
      }
      // 완료 퀘스트 간략 요약
      var completed = (questData._completedIds || []).slice(-3);
      if (completed.length) {
        var cStr = '완료됨: ' + completed.map(function(id){
          var q = questData[id];
          return q ? q.title + (q.resolution ? '('+q.resolution.slice(0,20)+')' : '') : id;
        }).join(', ');
        totalChars += cStr.length;
        qParts.push(cStr);
      }
      // 실패 퀘스트 — AI가 "그 의뢰는 이미 틀어졌다"를 인지하도록
      var failed = (questData._failedIds || []).slice(-3);
      if (failed.length) {
        var fStr = '실패됨: ' + failed.map(function(id){
          var q = questData[id];
          return q ? q.title + (q.resolution && q.resolution !== '실패' ? '('+q.resolution.slice(0,20)+')' : '') : id;
        }).join(', ');
        totalChars += fStr.length;
        qParts.push(fStr);
      }
      if (qParts.length) {
        parts.push('[📜 퀘스트 기억 — 미완·완료·실패 퀘스트 결과가 세계에 살아있어야 함]\n' + qParts.join('\n---\n'));
      }
    }

    // ── 3순위: 개인 기억 (핵심만, 최대 400자) ──
    if (totalChars < CHAR_BUDGET) {
      var pLines = [];
      var goals = (persData.goals || []).filter(function(g){ return !g.done; });
      if (goals.length) pLines.push('목표: ' + goals.map(function(g){ return g.text; }).join(', '));
      var _curTurn = (typeof S !== 'undefined' && S.msgCount) || 0;
      var injuries = (persData.injuries || []).filter(function(i){ return !i.healed && (!i.expireTurn || _curTurn < i.expireTurn); });
      if (injuries.length) pLines.push('부상: ' + injuries.slice(-2).map(function(i){ return i.text; }).join(', '));
      var traumas = persData.traumas || [];
      if (traumas.length) pLines.push('트라우마: ' + traumas.slice(-2).map(function(t){ return t.text; }).join(', '));
      var regrets = persData.regrets || [];
      if (regrets.length) pLines.push('후회: ' + regrets[regrets.length-1].text);
      var scars = persData.scars || [];
      if (scars.length) pLines.push('영구 변화: ' + scars.map(function(s){ return s.text; }).join(', '));
      var skills = (persData.skills || []).slice(-3);
      if (skills.length) pLines.push('습득 능력: ' + skills.map(function(s){ return s.text; }).join(', '));
      if (pLines.length) {
        var pStr = pLines.join('\n');
        totalChars += pStr.length;
        parts.push('[🧠 개인 기억 — 캐릭터 감정·반응·동기에 자연스럽게 반영]\n' + pStr);
      }
    }

    // ── 4순위: 선택 기억 (최근 중요 선택, 최대 400자) ──
    if (totalChars < CHAR_BUDGET) {
      var cLines = [];
      var karma = choiceData.karma || {};
      var karmaStr = '';
      if (karma.good > karma.evil + 2) karmaStr = '선한 성향(선행' + karma.good + ')';
      else if (karma.evil > karma.good + 2) karmaStr = '어두운 성향(악행' + karma.evil + ')';
      else if (karma.wise > 3) karmaStr = '현명한 성향(현명' + karma.wise + ')';
      if (karmaStr) cLines.push('성향: ' + karmaStr);
      var patterns = choiceData.patterns || [];
      if (patterns.length) cLines.push('행동 패턴: ' + patterns.join(', '));
      var pivotal = (choiceData.pivotal || []).slice(-2);
      if (pivotal.length) cLines.push('운명적 선택: ' + pivotal.map(function(p){ return p.text; }).join(' / '));
      var major = (choiceData.major || []).filter(function(m){ return m.consequence; }).slice(-4);
      if (major.length) {
        cLines.push('최근 선택:\n' + major.map(function(m){
          return '  T'+m.turn+': "'+m.choice+'" → '+m.consequence.slice(0,50)+(m.effect?' ('+m.effect+')':'');
        }).join('\n'));
      }
      if (cLines.length) {
        var cStr = cLines.join('\n');
        totalChars += cStr.length;
        parts.push('[🎯 선택 기억 — 선택 결과가 현재 세계에 살아있음. NPC·파벌·기회에 반드시 반영]\n' + cStr);
      }
    }

    // ── 5순위: 세계 기억 (간결하게, 최대 300자) ──
    if (totalChars < CHAR_BUDGET) {
      var wLines = [];
      var wEvents = (worldData.events || []).slice(-3);
      if (wEvents.length) wLines.push('사건: ' + wEvents.map(function(e){ return e.text; }).join(' / '));
      var rumors = (worldData.rumors || []).slice(-2);
      if (rumors.length) wLines.push('정보: ' + rumors.map(function(r){ return r.text; }).join(' / '));
      var discoveries = (worldData.discoveries || []).slice(-1);
      if (discoveries.length) wLines.push('발견: ' + discoveries[0].text);
      if (wLines.length) {
        var wStr = wLines.join('\n');
        totalChars += wStr.length;
        parts.push('[🌍 세계 기억]\n' + wStr);
      }
    }

    // ── 6순위: 영지 기억 (영지 있을 때만, 최대 300자) ──
    if (totalChars < CHAR_BUDGET && demData.name) {
      var dLines = ['"' + demData.name + '" ' + demData.tier + '등급 | 인구 ' + (window._fmtPop ? window._fmtPop(demData.population || 0) : (demData.population || 0) + '명')];
      if (demData.status) dLines.push('현황: ' + demData.status);
      var dDec = (demData.decisions || []).slice(-2);
      if (dDec.length) dLines.push('최근 결정: ' + dDec.map(function(d){ return d.text; }).join(' / '));
      var dEvt = (demData.keyEvents || []).slice(-1);
      if (dEvt.length) dLines.push('사건: ' + dEvt[0].text);
      if (demData.vassals && demData.vassals.length) dLines.push('봉신: ' + demData.vassals.join(', '));
      var dStr = dLines.join('\n');
      totalChars += dStr.length;
      parts.push('[🏰 영지 기억]\n' + dStr);
    }

    if (!parts.length) { window._blsCache = { turn: curTurn, result: '' }; return ''; }
    var resultStr = '\n\n[현재까지의 세계 맥락 — 이 기억들은 이 세계에 실제로 일어난 일이다]\n' + parts.join('\n\n');
    window._blsCache = { turn: curTurn, result: resultStr };
    return resultStr;
  } catch(e) { return ''; }
}
window.pmGetBLS = pmGetBLS;

window.pmGetBLS = pmGetBLS;
