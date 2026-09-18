// NPC 파트 업데이트
// Auto-extracted from taleforge.html (original section banner preserved above).
import { pmLoad, pmSave } from '../core/267-저장로드초기화.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadNPCs } from '../misc/001-block0-preamble.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { _pmNpcDefault } from './264-NPC별-풍부한-데이터-구조.js';

export function pmUpdateNpc(npcName, opts) {
  // opts: { event, topic, emotion, secret, promise, betrayal, favor, grudge, relDelta, reason, playerSaid, npcReacted }
  if (!npcName) return;
  opts = opts || {};
  var d = pmLoad('npc');
  if (!d[npcName]) d[npcName] = _pmNpcDefault();
  var n = d[npcName];
  var turn = (typeof S !== 'undefined' && S.msgCount) || 0;

  // 첫 만남 기록
  if (!n.firstMetTurn) {
    n.firstMetTurn = turn;
    try {
      var loc = typeof loadCurrentLocation === 'function' ? loadCurrentLocation() : null;
      n.firstMetLoc = loc ? (loc.name || '') : '';
    } catch(e) {}
  }
  n.lastSeenTurn = turn;

  // 관계도 실시간 동기화
  try {
    var npcs = typeof loadNPCs === 'function' ? loadNPCs() || [] : [];
    var npc = npcs.find(function(x){ return x.name === npcName; });
    if (npc) {
      var oldRel = n.rel;
      n.rel = npc.relationship || 50;
      n.role = n.role || npc.role || npc.class || '';
      n.personality = n.personality || (npc.personality || npc.desc || '').slice(0, 60);
      // 관계 변화 기록
      if (opts.relDelta || (Math.abs(n.rel - oldRel) >= 5)) {
        n.relHistory.push({ turn:turn, from:oldRel, to:n.rel, reason:(opts.reason || '').slice(0,50) });
        // relHistory 무제한
      }
    }
  } catch(e) {}

  // 감정 태그
  if (opts.emotion) n.emotionTag = opts.emotion;

  // 대화 이력
  if (opts.topic) {
    n.conversations.push({ turn:turn, topic:opts.topic.slice(0,60), playerSaid:(opts.playerSaid||'').slice(0,60), npcReacted:(opts.npcReacted||'').slice(0,60), emotion:n.emotionTag });
    // conversations 무제한
  }
  // 비밀
  if (opts.secret) {
    n.secrets.push({ turn:turn, text:opts.secret.slice(0,200) });
    // secrets 무제한
    window._pmSystemDirty = true;  // 비밀 공개도 즉시 S.system 갱신
  }
  // 약속
  if (opts.promise) {
    n.promises.push({ turn:turn, text:opts.promise.slice(0,200), fulfilled:null });
    // promises 무제한
  }
  // 배신
  if (opts.betrayal) {
    n.betrayals.push({ turn:turn, text:(opts.betrayal===true?'배신':opts.betrayal).slice(0,200) });
    window._pmSystemDirty = true;  // 배신은 즉시 S.system 갱신
  }
  // 호의
  if (opts.favor) {
    n.favors.push({ turn:turn, text:opts.favor.slice(0,60) });
    // favors 무제한
  }
  // 원한
  if (opts.grudge) {
    n.grudges.push({ turn:turn, text:opts.grudge.slice(0,60) });
    // grudges 무제한
  }
  // 일반 이벤트 (event 필드는 호환용)
  if (opts.event) {
    n.conversations.push({ turn:turn, topic:opts.event.slice(0,60), playerSaid:'', npcReacted:'', emotion:n.emotionTag });
    // conversations 무제한
  }

  pmSave('npc', d);
}
window.pmUpdateNpc = pmUpdateNpc;

export function pmDetectNpcFromText(aiText, userMsg) {
  if (!aiText) return;
  try {
    var npcs = typeof loadNPCs === 'function' ? loadNPCs() || [] : [];
    var lc = aiText.toLowerCase();
    npcs.forEach(function(npc) {
      if (!npc || !npc.name) return;
      if (!lc.includes(npc.name.toLowerCase())) return;

      var opts = { event: aiText.slice(0, 80), playerSaid: (userMsg||'').slice(0,60) };

      // 감정 태그 감지
      if (/분노|화가|격분|노여/.test(lc))      opts.emotion = '분노';
      else if (/기쁨|행복|웃음|기뻐/.test(lc)) opts.emotion = '기쁨';
      else if (/슬픔|눈물|울었|비통/.test(lc)) opts.emotion = '슬픔';
      else if (/두려|공포|무서|떨/.test(lc))   opts.emotion = '공포';
      else if (/신뢰|믿음|의지|고마/.test(lc)) opts.emotion = '신뢰';
      else if (/의심|경계|불신|냉소/.test(lc)) opts.emotion = '경계';

      // 약속 감지
      var promiseM = aiText.match(new RegExp(npc.name + '.{0,30}(약속|맹세|계약|다짐)'));
      if (promiseM) opts.promise = promiseM[0].slice(0, 80);

      // 배신 감지
      if (/배신|등을 돌|원한이|적이 됐/.test(lc)) opts.betrayal = aiText.slice(0, 60);

      // 비밀 감지
      var secretM = aiText.match(/(비밀|숨겨진|아무도 모르|진실을).{0,50}/);
      if (secretM && lc.includes(npc.name.toLowerCase())) opts.secret = secretM[0].slice(0, 80);

      // 호의 감지
      if (/감사|도와줬|덕분|은혜/.test(lc)) opts.favor = aiText.slice(0, 60);

      // 원한 감지
      if (/원망|증오|용서 못|복수/.test(lc)) opts.grudge = aiText.slice(0, 60);

      // 대화 주제 추출
      var topicM = aiText.match(/["「」『』]([^"「」『』]{4,30})["「」『』]/);
      if (topicM) opts.topic = topicM[1];

      pmUpdateNpc(npc.name, opts);
    });
  } catch(e) {}
}
window.pmDetectNpcFromText = pmDetectNpcFromText;
