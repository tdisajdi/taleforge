// 개인 기억 파트 업데이트
// Auto-extracted from taleforge.html (original section banner preserved above).
import { pmLoad, pmSave } from '../core/267-저장로드초기화.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadEmotion } from '../misc/001-block0-preamble.js';
import { loadTraumas } from '../misc/015-시스템-1120.js';

export function pmUpdatePersonal(type, text, extra) {
  if (!text) return;
  var d = pmLoad('personal');
  var turn = (typeof S !== 'undefined' && S.msgCount) || 0;
  extra = extra || {};
  var entry = { turn:turn, text:text.slice(0,80) };
  var maxLens = { goals:9999, injuries:9999, traumas:9999, bonds:9999, regrets:9999, achievements:9999, emotionHistory:9999, skills:9999, scars:9999 };

  if (type === 'goal') {
    entry.done = false;
    d.goals.push(entry);
    if (d.goals.length > (maxLens.goals||10)) d.goals.splice(0,1);
  } else if (type === 'injury') {
    entry.healed = false;
    entry.expireTurn = turn + 25;  // 25턴 후 자동 만료 (치유 전에도 BLS에서 필터됨)
    d.injuries.push(entry);
    if (d.injuries.length > (maxLens.injuries||8)) d.injuries.splice(0,1);
  } else if (type === 'trauma') {
    d.traumas.push(entry);
    if (d.traumas.length > (maxLens.traumas||6)) d.traumas.splice(0,1);
  } else if (type === 'bond') {
    entry.name = (extra.name || '').slice(0,20);
    d.bonds.push(entry);
    if (d.bonds.length > (maxLens.bonds||8)) d.bonds.splice(0,1);
  } else if (type === 'regret') {
    d.regrets.push(entry);
    if (d.regrets.length > (maxLens.regrets||6)) d.regrets.splice(0,1);
  } else if (type === 'achievement') {
    d.achievements.push(entry);
    if (d.achievements.length > (maxLens.achievements||10)) d.achievements.splice(0,1);
  } else if (type === 'emotion') {
    entry.emotion = extra.emotion || '';
    entry.context = text.slice(0,60);
    d.emotionHistory.push(entry);
    if (d.emotionHistory.length > (maxLens.emotionHistory||10)) d.emotionHistory.splice(0,1);
  } else if (type === 'skill') {
    d.skills.push(entry);
    if (d.skills.length > (maxLens.skills||10)) d.skills.splice(0,1);
  } else if (type === 'scar') {
    d.scars.push(entry);
    if (d.scars.length > (maxLens.scars||6)) d.scars.splice(0,1);
  }
  pmSave('personal', d);
}
window.pmUpdatePersonal = pmUpdatePersonal;

export function pmSyncPersonalFromGame() {
  try {
    var d = pmLoad('personal');
    var goals = (typeof S !== 'undefined' && S.character && S.character._goals) || [];
    if (goals.length) {
      // 목표 초기화 (이미 있으면 스킵)
      if (!d.goals.length) {
        goals.forEach(function(g){ d.goals.push({ turn:0, text:g, done:false }); });
      }
    }
    if (typeof loadTraumas === 'function') {
      var traumas = loadTraumas();
      Object.entries(traumas).forEach(function(kv){
        var k = kv[0], v = kv[1];
        if (v && !d.traumas.find(function(t){ return t.text === k; })) {
          d.traumas.push({ turn:0, text:k });
        }
      });
    }
    pmSave('personal', d);
  } catch(e) {}
}
window.pmSyncPersonalFromGame = pmSyncPersonalFromGame;

export function pmDetectPersonalFromText(aiText) {
  if (!aiText) return;
  var lc = aiText.toLowerCase();
  var turn = (typeof S !== 'undefined' && S.msgCount) || 0;
  if (/부상|상처|피흘|쓰러|다쳤|찔렸|베였/.test(lc))
    pmUpdatePersonal('injury', aiText.slice(0,80));
  if (/트라우마|악몽|공포에|두려움이 엄습|과거의 상처/.test(lc))
    pmUpdatePersonal('trauma', aiText.slice(0,60));
  if (/후회|잘못했|돌이킬|그때 만약|미안|용서받고/.test(lc))
    pmUpdatePersonal('regret', aiText.slice(0,60));
  if (/결심|맹세|반드시|기억하겠|이 순간만큼은/.test(lc))
    pmUpdatePersonal('goal', aiText.slice(0,60));
  if (/영원한 상처|남은 흔적|변해버린|다시는 예전|눈에 새겨/.test(lc))
    pmUpdatePersonal('scar', aiText.slice(0,60));
  if (/익혔다|마스터|깨달음|새로운 능력|기술을 얻/.test(lc))
    pmUpdatePersonal('skill', aiText.slice(0,60));
  // [19차 감사 FIX] S._emotion은 전투 종료 시 'neutral'로 초기화되는
  // 것 외에는 게임 전체에서 단 한 번도 갱신되지 않는 죽은 필드라
  // (실제 감정 추적은 misc/001의 loadEmotion/saveEmotion이 전담) 이
  // 조건이 사실상 영원히 거짓이라 감정 기반 개인 기억이 한 번도
  // 기록된 적이 없었다. 실제 감정 상태를 읽어오도록 교정.
  var curEmotionObj = typeof loadEmotion === 'function' ? loadEmotion() : null;
  var curEmotion = curEmotionObj ? (curEmotionObj.label || curEmotionObj.id || '') : '';
  if (curEmotion && curEmotion !== 'neutral') {
    pmUpdatePersonal('emotion', aiText.slice(0,60), { emotion: curEmotion });
  }
}
window.pmDetectPersonalFromText = pmDetectPersonalFromText;
