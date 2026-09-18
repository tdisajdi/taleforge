// PM 수동 편집 헬퍼 함수
// Auto-extracted from taleforge.html (original section banner preserved above).
import { pmLoad, pmSave } from '../core/267-저장로드초기화.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadSummaries } from '../items/151-⑩-자동-요약-압축-강화판.js';
import { loadMemory } from '../job/010-스킬-강화-시스템.js';
import { toast } from '../utils.js';
import { loadWorldDB } from '../world/145-⑥-세계-상태-DB.js';
import { loadPlayerDB } from './144-⑤-플레이어-상태-DB.js';
import { pmGetBLS } from './275-선택-파트-업데이트.js';

export function pmEditNpcField(name, field, value) {
  try {
    var d = pmLoad('npc');
    if (d[name]) { d[name][field] = value; pmSave('npc', d); renderMemoryEnhanced(); }
  } catch(e) {}
}
window.pmEditNpcField = pmEditNpcField;

export function pmSetPromiseFulfilled(name, idx, fulfilled) {
  try {
    var d = pmLoad('npc');
    if (d[name] && d[name].promises[idx]) {
      d[name].promises[idx].fulfilled = fulfilled;
      pmSave('npc', d); renderMemoryEnhanced();
    }
  } catch(e) {}
}
window.pmSetPromiseFulfilled = pmSetPromiseFulfilled;

export function pmDeleteNpcEntry(name) {
  try {
    var d = pmLoad('npc');
    if (d[name]) { delete d[name]; pmSave('npc', d); renderMemoryEnhanced(); }
  } catch(e) {}
}
window.pmDeleteNpcEntry = pmDeleteNpcEntry;

export function pmEditQuestHint(qid, hint) {
  try {
    var d = pmLoad('quest');
    if (d[qid]) { d[qid].nextHint = hint.slice(0,100); pmSave('quest', d); renderMemoryEnhanced(); }
  } catch(e) {}
}
window.pmEditQuestHint = pmEditQuestHint;

window.pmEditNpcField       = pmEditNpcField;

window.pmSetPromiseFulfilled= pmSetPromiseFulfilled;

window.pmDeleteNpcEntry     = pmDeleteNpcEntry;

window.pmEditQuestHint      = pmEditQuestHint;

export function pmArchiveStaleNpcs() {
  try {
    var curTurn = (typeof S !== 'undefined' && S.msgCount) || 0;
    var d = pmLoad('npc');
    var removed = 0;
    Object.keys(d).forEach(function(name) {
      var n = d[name];
      if (typeof n !== 'object' || n.rel === undefined) return;
      // 50턴 이상 미등장 + 관계도 60 미만 + 배신/비밀/약속 없음 → 삭제
      var stale = (curTurn - (n.lastSeenTurn||0)) > 50;
      var lowRel = (n.rel||50) < 60;
      var hasImportant = (n.betrayals&&n.betrayals.length) || (n.secrets&&n.secrets.length) || (n.promises&&(n.promises||[]).some(function(p){return p.fulfilled===null;}));
      if (stale && lowRel && !hasImportant) {
        delete d[name];
        removed++;
      }
    });
    if (removed > 0) {
      pmSave('npc', d);
      renderMemoryEnhanced();
      if(typeof toast === 'function') toast('🗑 오래된 NPC ' + removed + '명 정리됨', 2000);
    } else {
      if(typeof toast === 'function') toast('정리할 NPC가 없습니다', 1500);
    }
  } catch(e) {}
}
window.pmArchiveStaleNpcs = pmArchiveStaleNpcs;

window.pmArchiveStaleNpcs = pmArchiveStaleNpcs;

export function renderMemoryEnhanced() {
  var body = document.getElementById('pb-memory');
  if (!body) return;

  // [B85 FIX] curTab을 참조하는 아래 6개 변수 선언이 curTab 자체의 실제
  // 할당(맨 아래)보다 앞서 있어, var 호이스팅으로 인해 항상 undefined인
  // 상태로 평가되던 버그. curTab 할당을 최상단으로 끌어올린다.
  var curTab     = window._memTab || 'core';
  // 탭에 필요한 데이터만 로드 (불필요한 pmLoad 최소화)
  var npcData    = (curTab==='npc'||curTab==='core')       ? pmLoad('npc')      : {};
  var worldData  = (curTab==='world'||curTab==='core')     ? pmLoad('world')    : {};
  var questData  = (curTab==='quest'||curTab==='core')     ? pmLoad('quest')    : {};
  var demData    = (curTab==='demesne'||curTab==='core')   ? pmLoad('demesne')  : {};
  var persData   = (curTab==='personal'||curTab==='core')  ? pmLoad('personal') : {};
  var choiceData = (curTab==='choices'||curTab==='core')   ? pmLoad('choices')  : {};
  var mem        = typeof loadMemory === 'function' ? loadMemory() : {};
  var esc2       = function(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };

  var tabs = [
    { id:'core',     label:'📖 핵심' },
    { id:'npc',      label:'🤝 NPC' },
    { id:'world',    label:'🌍 세계' },
    { id:'quest',    label:'📜 퀘스트' },
    { id:'demesne',  label:'🏰 영지' },
    { id:'personal', label:'🧠 개인' },
    { id:'choices',  label:'🎯 선택' },
  ];

  var tabBar = '<div style="display:flex;overflow-x:auto;border-bottom:1px solid var(--border);background:#0a0600">' +
    tabs.map(function(t){
      var active = curTab === t.id;
      return '<button onclick="window._memTab=\''+t.id+'\';renderMemoryEnhanced()" style="flex:0 0 auto;padding:6px 8px;background:'+(active?'#1a1200':'transparent')+';border:none;border-bottom:'+(active?'2px solid var(--gold)':'2px solid transparent')+';color:'+(active?'var(--gold)':'var(--dim)')+';font-size:8px;cursor:pointer;font-family:\'Cinzel\',serif;white-space:nowrap">'+t.label+'</button>';
    }).join('') + '</div>';

  var content = '';

  if (curTab === 'core') {
    content = '<div style="font-size:9px;color:var(--dim);margin-bottom:5px">핵심 기억 (항상 주입, 직접 입력)</div>';
    content += '<textarea class="mem-ta" id="mem-core" rows="4" placeholder="핵심 기억...">' + esc2(mem.core||'') + '</textarea>';
    content += '<div style="font-size:9px;color:var(--dim);margin:8px 0 5px">중간 요약 (자동 생성)</div>';
    content += '<textarea class="mem-ta" id="mem-mid" rows="3" placeholder="중간 요약...">' + esc2(mem.mid||'') + '</textarea>';
    content += '<button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="saveMemPanel()">저장</button>';
    // 현재 주입 미리보기
    var preview = pmGetBLS();
    var previewLen = preview.length;
    content += '<div style="margin-top:10px;padding:7px;background:var(--bg-screen);border:1px dashed var(--border);font-size:9px;color:var(--dim);line-height:1.6">';
    content += '💡 파트별 기억 자동 주입량: <span style="color:var(--gold)">약 ' + Math.round(previewLen * 1.8) + '토큰</span> (~2000토큰 상한, 한국어 기준)';
    content += '</div>';

    // [V1/V2 통합 — 구버전 renderMemoryPanel에만 있던 정보 복구]
    try {
      var _pDB = (typeof loadPlayerDB==='function') ? loadPlayerDB() : null;
      if (_pDB) {
        var _align = _pDB.moralAlignment||0;
        var _alignLabel = _align>=60?'선량':_align>=20?'선':_align>=-20?'중립':_align>=-60?'악':'극악';
        var _alignColor = _align>=20?'#60c060':_align>=-20?'#c0c060':'#c06060';
        content += '<div style="margin-top:8px;padding:7px 9px;background:#090600;border:1px solid #2a1a05">';
        content += '<div style="font-size:9px;color:var(--dim);margin-bottom:4px">주인공 상태</div>';
        content += '<div style="font-size:9px;color:'+_alignColor+'">도덕: '+_alignLabel+'('+_align+') · 카르마: '+(_pDB.karmaPoints||0)+'</div>';
        var _actInj = (_pDB.injuries||[]).filter(function(i){ return !i.healed; });
        if (_actInj.length) content += '<div style="font-size:9px;color:#e05050;margin-top:2px">부상: '+_actInj.map(function(i){ return esc2((i.text||'').slice(0,20)); }).join(' / ')+'</div>';
        var _actBonds = (_pDB.bonds||[]).filter(function(b){ return !b.broken && b.strength>=50; });
        if (_actBonds.length) content += '<div style="font-size:9px;color:#a060e0;margin-top:2px">유대: '+_actBonds.map(function(b){ return esc2(b.npc)+'('+b.strength+')'; }).join(' / ')+'</div>';
        content += '</div>';
      }
      var _wDB = (typeof loadWorldDB==='function') ? loadWorldDB() : null;
      if (_wDB && _wDB.seals) {
        var _brokenSeals = Object.entries(_wDB.seals).filter(function(kv){ return kv[1].broken; });
        if (_brokenSeals.length) {
          content += '<div style="margin-top:8px;font-family:\'Cinzel\',serif;font-size:9px;color:#e05050;margin-bottom:4px">💔 파괴된 봉인석</div>';
          content += '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px">';
          _brokenSeals.forEach(function(kv){
            content += '<span style="font-size:8px;color:#e05050;background:#1a0808;padding:2px 5px;border:1px solid #3a1010">'+esc2(kv[0])+'('+kv[1].brokenOrder+'번째)</span>';
          });
          content += '</div>';
        }
      }
      var _sums = (typeof loadSummaries==='function') ? loadSummaries() : [];
      if (_sums && _sums.length) {
        content += '<div style="margin-top:8px;font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);margin-bottom:4px">📖 압축 서사</div>';
        _sums.slice(-3).reverse().forEach(function(s){
          content += '<div style="padding:5px 7px;background:#090600;border:1px solid #1a1005;margin-bottom:3px">'
            + '<div style="font-size:8px;color:#5a4a2a">'+s.startTurn+'~'+s.endTurn+'턴</div>'
            + '<div style="font-size:9px;color:var(--dim);line-height:1.4">'+esc2((s.narrative||'').slice(0,80))+'...</div>'
            + '</div>';
        });
      }
      content += '<button onclick="autoCompressHistory();renderMemoryEnhanced()" style="width:100%;margin-top:8px;padding:7px;background:#0a0600;border:1px solid #3a2a05;color:#a08030;font-family:\'Cinzel\',serif;font-size:9px;cursor:pointer">📖 지금 서사 압축</button>';
    } catch(e) {}

  } else if (curTab === 'npc') {
    var npcEntries = Object.entries(npcData).filter(function(kv){ return typeof kv[1] === 'object' && kv[1].rel !== undefined; });
    npcEntries.sort(function(a,b){ return (b[1].lastSeenTurn||0)-(a[1].lastSeenTurn||0); });
    var _curTurnNpc = (typeof S !== 'undefined' && S.msgCount) || 0;
    var _staleCnt = npcEntries.filter(function(kv){ return (_curTurnNpc - (kv[1].lastSeenTurn||0)) > 50; }).length;
    content = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    content += '<div style="font-size:9px;color:var(--dim)">NPC '+npcEntries.length+'명 기록됨 · 최근 등장순</div>';
    if (_staleCnt > 0) {
      content += '<button onclick="pmArchiveStaleNpcs()" style="font-size:7px;padding:2px 7px;background:#1a0a00;border:1px solid #603010;color:#a06030;cursor:pointer;border-radius:2px">🗑 오래된 NPC '+_staleCnt+'명 정리</button>';
    }
    content += '</div>';
    if (!npcEntries.length) {
      content += '<div style="text-align:center;color:var(--dim);font-size:9px;padding:16px">아직 기록된 NPC가 없습니다</div>';
    } else {
      npcEntries.slice(0,10).forEach(function(kv){
        var name = kv[0], n = kv[1];
        var rel = n.rel||50;
        var relColor = rel>=75?'#60d060':rel>=50?'#c8a040':'#e05050';
        content += '<div style="padding:8px 10px;background:#0d0800;border:1px solid #1a1005;margin-bottom:5px;border-radius:2px">';
        content += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">';
        content += '<div><span style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold)">'+esc2(name)+'</span>';
        if (n.role) content += ' <span style="font-size:8px;color:var(--dim)">'+esc2(n.role)+'</span>';
        content += '</div>';
        content += '<div style="text-align:right"><span style="font-size:9px;color:'+relColor+'">관계 '+rel+'</span>';
        if (n.emotionTag&&n.emotionTag!=='중립') content += ' <span style="font-size:8px;color:var(--dim)">'+esc2(n.emotionTag)+'</span>';
        content += '</div></div>';
        if (n.personality) content += '<div style="font-size:8px;color:#806040;margin-bottom:3px">'+esc2(n.personality.slice(0,60))+'</div>';
        if (n.speechStyle) content += '<div style="font-size:8px;color:#608080;margin-bottom:3px">말투: '+esc2(n.speechStyle.slice(0,60))+'</div>';
        // 관계 변화
        var relH = (n.relHistory||[]).slice(-2);
        if (relH.length) {
          content += '<div style="font-size:8px;color:var(--dim);margin-bottom:2px">관계 변화: '+relH.map(function(r){ return r.from+'→'+r.to+(r.reason?' ('+esc2(r.reason)+')':''); }).join(', ')+'</div>';
        }
        // 최근 대화
        var convs = (n.conversations||[]).slice(-2);
        if (convs.length) {
          content += '<div style="font-size:8px;color:var(--dim);margin-bottom:2px">최근 대화: '+convs.map(function(c){ return 'T'+c.turn+': '+esc2((c.topic||'').slice(0,35)); }).join(' / ')+'</div>';
        }
        // 약속 (이행 체크 가능)
        var allPromises = (n.promises||[]);
        if (allPromises.length) {
          allPromises.forEach(function(p, pi) {
            var pColor = p.fulfilled===true?'#609060':p.fulfilled===false?'#906060':'#a0c040';
            var pLabel = p.fulfilled===true?'✅ ':p.fulfilled===false?'❌ ':'🤝 ';
            content += '<div style="font-size:8px;color:'+pColor+';display:flex;align-items:center;gap:4px;margin-bottom:2px">';
            content += pLabel+esc2(p.text.slice(0,45));
            if (p.fulfilled===null) {
              content += ' <button onclick="pmSetPromiseFulfilled(\''+esc2(name)+'\',' + pi + ',true)" style="font-size:7px;padding:1px 4px;background:#1a3010;border:1px solid #60c060;color:#60c060;cursor:pointer;border-radius:2px">이행</button>';
              content += ' <button onclick="pmSetPromiseFulfilled(\''+esc2(name)+'\',' + pi + ',false)" style="font-size:7px;padding:1px 4px;background:#2a0a0a;border:1px solid #c03030;color:#e05050;cursor:pointer;border-radius:2px">파기</button>';
            }
            content += '</div>';
          });
        }
        if (n.betrayals&&n.betrayals.length) content += '<div style="font-size:8px;color:#e05050">💀 배신: '+esc2(n.betrayals[n.betrayals.length-1].text.slice(0,50))+'</div>';
        if (n.secrets&&n.secrets.length) content += '<div style="font-size:8px;color:#6080c0">🔒 비밀: '+esc2(n.secrets[n.secrets.length-1].text.slice(0,50))+'</div>';
        // NPC↔NPC 관계
        var npcRelKeys = Object.keys(n.npcRelations||{});
        if (npcRelKeys.length) {
          content += '<div style="font-size:8px;color:#8060a0;margin-bottom:2px">NPC관계: '+npcRelKeys.map(function(k){ var r=n.npcRelations[k]; return esc2(k)+'('+r.rel+') '+esc2(r.desc.slice(0,25)); }).join(' / ')+'</div>';
        }
        // 감정 편집
        content += '<div style="display:flex;align-items:center;gap:6px;margin-top:5px;flex-wrap:wrap">';
        content += '<span style="font-size:7px;color:var(--dim)">감정:</span>';
        content += '<select onchange="pmEditNpcField(\''+esc2(name)+'\',' + '\'emotionTag\',' + 'this.value)" style="font-size:7px;background:#1a1005;border:1px solid var(--border);color:var(--gold);padding:1px 3px;border-radius:2px">';
        ['중립','분노','기쁨','슬픔','공포','신뢰','경계','증오','사랑'].forEach(function(e){
          content += '<option'+(n.emotionTag===e?' selected':'')+'>'+e+'</option>';
        });
        content += '</select>';
        content += '<button onclick="pmDeleteNpcEntry(\''+esc2(name)+'\')" style="font-size:7px;padding:1px 5px;background:#200a0a;border:1px solid #501010;color:#c04040;cursor:pointer;border-radius:2px;margin-left:auto">삭제</button>';
        content += '</div>';
        content += '<div style="font-size:7px;color:#3a3030;margin-top:3px">첫 만남: T'+n.firstMetTurn+(n.firstMetLoc?' @ '+n.firstMetLoc:'')+' / 마지막: T'+n.lastSeenTurn+'</div>';
        content += '</div>';
      });
    }

  } else if (curTab === 'world') {
    content = '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin-bottom:6px">세계 사건 ('+(worldData.events||[]).length+'건)</div>';
    (worldData.events||[]).slice(-6).reverse().forEach(function(e){
      content += '<div style="padding:4px 7px;background:#0d0800;border-left:2px solid var(--gold);margin-bottom:3px;font-size:9px;color:#c8a96e">T'+e.turn+': '+esc2(e.text)+'</div>';
    });
    content += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin:8px 0 5px">입수 정보·소문 ('+(worldData.rumors||[]).length+'건)</div>';
    (worldData.rumors||[]).slice(-5).reverse().forEach(function(r){
      content += '<div style="padding:4px 7px;background:#0d0800;border-left:2px solid #6080c0;margin-bottom:3px;font-size:9px;color:var(--dim)">T'+r.turn+': '+esc2(r.text)+'</div>';
    });
    content += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin:8px 0 5px">중요 발견</div>';
    (worldData.discoveries||[]).slice(-4).reverse().forEach(function(d){
      content += '<div style="padding:4px 7px;background:#0d0800;border-left:2px solid #c080e0;margin-bottom:3px;font-size:9px;color:var(--dim)">T'+d.turn+': '+esc2(d.text)+'</div>';
    });

  } else if (curTab === 'quest') {
    // 메인 스토리
    if (questData._mainProgress) {
      content += '<div style="padding:8px;background:#0d1a05;border:1px solid var(--gold);border-radius:2px;margin-bottom:8px;font-size:9px;color:#c8a96e">📌 메인: '+esc2(questData._mainProgress)+'</div>';
    }
    // 활성 퀘스트
    var activeIds = questData._activeIds || [];
    content += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin-bottom:5px">진행중 ('+activeIds.length+')</div>';
    activeIds.forEach(function(qid, _qi){
      var q = questData[qid]; if(!q) return;
      var _safeIdx = 'qh' + _qi;  // 특수문자 없는 안전한 인덱스 ID
      content += '<div style="padding:8px;background:#0d1a05;border:1px solid #2a5a1a;margin-bottom:5px;border-radius:2px">';
      content += '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold);margin-bottom:3px">'+esc2(q.title)+'</div>';
      if (q.desc) content += '<div style="font-size:8px;color:var(--dim);margin-bottom:3px">'+esc2(q.desc.slice(0,80))+'</div>';
      if (q.nextHint) content += '<div style="font-size:8px;color:#60e0a0;margin-bottom:3px">▶ 다음 단계: '+esc2(q.nextHint)+'</div>';
      if ((q.clues||[]).length) content += '<div style="font-size:8px;color:#60a0e0">단서: '+q.clues.slice(-2).map(function(c){ return esc2(c.text.slice(0,40)); }).join(' / ')+'</div>';
      if ((q.keyMoments||[]).length) content += '<div style="font-size:8px;color:#c8a96e">핵심 순간: '+q.keyMoments.slice(-1)[0].text.slice(0,50)+'</div>';
      if ((q.npcsInvolved||[]).length) content += '<div style="font-size:8px;color:var(--dim)">관련 NPC: '+q.npcsInvolved.join(', ')+'</div>';
      content += '<div style="margin-top:5px"><input id="'+_safeIdx+'" placeholder="다음 단계 메모 수동 입력..." style="width:calc(100% - 46px);font-size:7px;background:#0a1000;border:1px solid var(--border);color:var(--gold);padding:2px 5px" value="'+esc2(q.nextHint||'')+'">';
      content += '<button onclick="pmEditQuestHint(\''+esc2(qid)+'\',document.getElementById(\''+_safeIdx+'\').value)" style="font-size:7px;padding:2px 5px;background:#1a3010;border:1px solid #60c060;color:#60c060;cursor:pointer;margin-left:2px">저장</button></div>';
      content += '</div>';
    });
    // 완료 퀘스트
    var completedIds = questData._completedIds || [];
    if (completedIds.length) {
      content += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin:8px 0 5px">완료 ('+completedIds.length+')</div>';
      completedIds.slice(-5).forEach(function(qid){
        var q = questData[qid]; if(!q) return;
        content += '<div style="padding:4px 7px;background:#050300;border-left:2px solid #60c060;margin-bottom:3px;font-size:9px;color:#60c060">✅ '+esc2(q.title)+(q.resolution?' — '+esc2(q.resolution.slice(0,40)):'')+'</div>';
      });
    }
    // 실패 퀘스트
    var failedIds = questData._failedIds || [];
    if (failedIds.length) {
      content += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin:8px 0 5px">실패 ('+failedIds.length+')</div>';
      failedIds.slice(-3).forEach(function(qid){
        var q = questData[qid]; if(!q) return;
        content += '<div style="padding:4px 7px;background:#0d0500;border-left:2px solid #c03030;margin-bottom:3px;font-size:9px;color:#e05050">❌ '+esc2(q.title)+'</div>';
      });
    }

  } else if (curTab === 'demesne') {
    if (!demData.name) {
      content = '<div style="text-align:center;color:var(--dim);font-size:9px;padding:16px">영지가 개설되지 않았습니다</div>';
    } else {
      content = '<div style="padding:10px;background:#0d1a05;border:1px solid var(--gold);border-radius:2px;margin-bottom:10px">';
      content += '<div style="font-family:\'Cinzel\',serif;font-size:12px;color:var(--gold);margin-bottom:4px">🏰 '+esc2(demData.name)+' ('+demData.tier+'등급)</div>';
      content += '<div style="font-size:9px;color:var(--dim)">'+esc2(demData.status||'')+'</div></div>';
      if ((demData.decisions||[]).length) {
        content += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin-bottom:5px">주요 결정</div>';
        (demData.decisions||[]).slice(-6).forEach(function(d){
          content += '<div style="padding:4px 7px;background:#0d0800;border-left:2px solid var(--gold);margin-bottom:3px;font-size:9px;color:#c8a96e">T'+d.turn+': '+esc2(d.text)+'</div>';
        });
      }
      if ((demData.keyEvents||[]).length) {
        content += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin:8px 0 5px">주요 사건</div>';
        (demData.keyEvents||[]).slice(-4).forEach(function(e){
          content += '<div style="padding:4px 7px;background:#0d0800;border-left:2px solid #c08040;margin-bottom:3px;font-size:9px;color:var(--dim)">T'+e.turn+': '+esc2(e.text)+'</div>';
        });
      }
    }

  } else if (curTab === 'personal') {
    var sects = [
      { key:'goals',         icon:'🎯', label:'목표', filter: function(i){ return !i.done; } },
      { key:'injuries',      icon:'🩸', label:'부상·상처', filter: function(i){ return !i.healed; } },
      { key:'traumas',       icon:'💔', label:'트라우마', filter: null },
      { key:'bonds',         icon:'💛', label:'소중한 인연', filter: null },
      { key:'regrets',       icon:'😞', label:'후회', filter: null },
      { key:'scars',         icon:'⚔️', label:'영구 흔적', filter: null },
      { key:'skills',        icon:'✨', label:'습득 능력', filter: null },
      { key:'achievements',  icon:'🏆', label:'개인 성취', filter: null },
      { key:'emotionHistory',icon:'💭', label:'강한 감정', filter: null },
    ];
    sects.forEach(function(s){
      var arr = persData[s.key] || [];
      if (s.filter) arr = arr.filter(s.filter);
      if (!arr.length) return;
      content += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin-bottom:3px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:14}):(s?.icon))+' '+s.label+'</div>';
      arr.slice(-3).forEach(function(item){
        var t = item.text || item.desc || '';
        content += '<div style="padding:4px 7px;background:#0d0800;border-left:2px solid #6080c0;margin-bottom:3px;font-size:9px;color:var(--dim)">T'+(item.turn||0)+': '+esc2(t.slice(0,70))+'</div>';
      });
    });
    if (!content) content = '<div style="text-align:center;color:var(--dim);font-size:9px;padding:16px">개인 기억 없음</div>';

  } else if (curTab === 'choices') {
    var karma = choiceData.karma || {};
    content = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin-bottom:12px">';
    [{label:'선행',val:karma.good||0,color:'#60c060'},{label:'악행',val:karma.evil||0,color:'#e05050'},{label:'현명',val:karma.wise||0,color:'#60a0e0'}].forEach(function(k){
      content += '<div style="padding:6px;background:#0d0800;border:1px solid #1a1005;text-align:center;border-radius:2px"><div style="font-size:14px;color:'+k.color+';font-family:\'Cinzel\',serif">'+k.val+'</div><div style="font-size:8px;color:var(--dim)">'+k.label+'</div></div>';
    });
    content += '</div>';
    // 운명적 선택
    var pivotal = choiceData.pivotal || [];
    if (pivotal.length) {
      content += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin-bottom:5px">⭐ 운명적 선택</div>';
      pivotal.forEach(function(p){
        content += '<div style="padding:5px 8px;background:#1a0800;border:1px solid var(--gold);margin-bottom:3px;font-size:9px;color:var(--gold);border-radius:2px">T'+p.turn+': '+esc2(p.text)+'</div>';
      });
    }
    // 최근 선택
    var major = (choiceData.major||[]).filter(function(m){ return m.consequence; }).slice(-6).reverse();
    if (major.length) {
      content += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin:8px 0 5px">중요 선택 & 결과</div>';
      major.forEach(function(m){
        content += '<div style="padding:6px 8px;background:#0d0800;border:1px solid #1a1005;margin-bottom:4px;border-radius:2px">';
        content += '<div style="font-size:8px;color:var(--dim)">T'+m.turn+(m.questId?' ['+m.questId+']':'')+'</div>';
        content += '<div style="font-size:9px;color:var(--gold)">"'+esc2(m.choice)+'"</div>';
        if (m.consequence) content += '<div style="font-size:8px;color:#c8a96e">→ '+esc2(m.consequence.slice(0,60))+'</div>';
        if (m.effect) content += '<div style="font-size:8px;color:#6080c0">('+esc2(m.effect)+')</div>';
        content += '</div>';
      });
    }
    // 행동 패턴
    var patterns = choiceData.patterns || [];
    if (patterns.length) {
      content += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--gold);margin:8px 0 5px">행동 패턴</div>';
      patterns.forEach(function(p){
        content += '<div style="padding:4px 8px;background:#0a0800;border:1px solid var(--border);font-size:9px;color:var(--dim);margin-bottom:3px;border-radius:2px">🔄 '+esc2(p)+'</div>';
      });
    }
  }

  body.innerHTML = tabBar + '<div style="overflow-y:auto;padding:10px 12px">' + content + '</div>';
  // [버그 수정] ai-prompt/161의 extendMemoryPanelWithMonitor가 이 함수(정의된
  // 곳 밖)에서 window.renderMemoryEnhanced를 감싸 컨텍스트(토큰 사용량)
  // 모니터를 덧붙이려 했지만, 이 함수의 실제 호출부가 전부 bare 식별자라
  // 그 감싸기가 적용된 적이 없다 — 메모리 패널을 열어도 토큰 사용량
  // 모니터가 한 번도 보이지 않았다. 실제 정의부 끝에 직접 연결한다.
  try{
    if(curTab==='core' && typeof window.getContextMonitorBLS==='function'){
      const mon=window.getContextMonitorBLS();
      const barColor=mon.pct>80?'#e05050':mon.pct>60?'#c0a030':'#4a9a6a';
      const div=document.createElement('div');
      div.style.cssText='margin-top:10px;padding:8px 10px;background:#090600;border:1px solid '+(mon.warning?'#e05050':'#2a1a05');
      div.innerHTML='<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);margin-bottom:5px">📊 컨텍스트 모니터</div>'
        +'<div style="display:flex;gap:8px;font-size:9px;margin-bottom:4px">'
        +'<span style="color:'+barColor+'">토큰: ~'+mon.total.toLocaleString()+'</span>'
        +'<span style="color:var(--dim)">대화: '+mon.msgs+'개</span>'
        +'<span style="color:'+barColor+'">'+mon.pct+'% 사용</span>'
        +'</div>'
        +'<div style="height:4px;background:#1a1005;border-radius:2px;overflow:hidden">'
        +'<div style="width:'+mon.pct+'%;height:100%;background:'+barColor+';border-radius:2px;transition:width .5s"></div>'
        +'</div>'
        +(mon.warning?'<div style="font-size:8px;color:#e05050;margin-top:3px">⚠️ 컨텍스트 80% 초과 — 자동 압축 권장</div>':'')
        +'<button onclick="autoCompressHistory&&autoCompressHistory()" style="width:100%;margin-top:5px;padding:4px;background:#0a0600;border:1px solid #2a1a05;color:#806030;font-size:8px;cursor:pointer">📖 지금 압축</button>';
      body.appendChild(div);
    }
  }catch(e){}
}
window.renderMemoryEnhanced = renderMemoryEnhanced;

window.renderMemoryEnhanced = renderMemoryEnhanced;
