// — 회차가 높을수록 보스가 더 빨리, 더 강하게 스폰됨
// Auto-extracted from taleforge.html (original section banner preserved above).
import { enrichAllExistingNPCs } from '../core/244-통합-초기화-매-턴-훅-연결.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { DUNGEON_GRADE_ORDER } from '../data/256-회차가-높을수록-보스가-더-빨리-더-강하게-스폰됨.js';
import { DUNGEON_GRADES } from '../data/257-renderMiniMap-던전-미니맵-일반-미니맵.js';
import { getEnemyScaleMultiplier } from '../misc/054-이동수단-시스템.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { getMonsterTierStats, pickGeneratedObject, recordGeneratedObject } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { _origOpenP } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { DUNGEON_STATE_KEY } from '../ui/155-⑭-메모리-패널-UI.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { renderLocationPanel } from '../world/052-동대륙-추가-장소-4.js';

export const _patchNpcDisplay = function(){
  // NPC 패널 열릴 때 자동 보강
  const _origOpenP = window.openP;
  if(typeof _origOpenP === 'function'){
    window.openP = function(id){
      if(id === 'npcs' || id === 'npc'){
        enrichAllExistingNPCs();
      }
      return _origOpenP.call(this, id);
    };
  }
};

setTimeout(_patchNpcDisplay, 2000);


export const DUNGEON_DB_KEY      = 'taleforge-dungeon-db';

export const DUNGEON_DB_VER      = 1;

export function loadDungeonDB(){
  try{ return JSON.parse(lsGet(DUNGEON_DB_KEY)||'null') || {version:DUNGEON_DB_VER,rooms:[],choiceResults:[],dungeons:[],exportedAt:null}; }
  catch(e){ return {version:DUNGEON_DB_VER,rooms:[],choiceResults:[],dungeons:[],exportedAt:null}; }
}
window.loadDungeonDB = loadDungeonDB;

export function saveDungeonDB(db){ try{ lsSet(DUNGEON_DB_KEY, JSON.stringify(db)); }catch(e){ console.warn('[DungeonDB] 저장 실패:', e.message); } }
window.saveDungeonDB = saveDungeonDB;

export function dbSaveRoom(room, dungeonName, dungeonTheme, floor, scenario){
  if(!room || !room.roomType) return;
  const db = loadDungeonDB();
  // 중복 체크: 같은 던전+층+제목이면 스킵
  const isDup = db.rooms.some(r => r.dungeonName===dungeonName && r.floor===floor && r.title===room.title);
  if(isDup) return;
  db.rooms.push({
    id: 'room_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),
    dungeonName, dungeonTheme, floor, scenario,
    roomType:   room.roomType,
    title:      room.title,
    description:room.description,
    enemyName:  room.enemyName||null,
    enemyDesc:  room.enemyDesc||null,
    trapDesc:   room.trapDesc||null,
    treasureDesc:room.treasureDesc||null,
    floorHint:  room.floorHint||null,
    choices:    room.choices||[],
    baseRewardGold: room.baseRewardGold||0,
    baseHpDamage:   room.baseHpDamage||0,
    createdAt:  new Date().toISOString()
  });
  saveDungeonDB(db);
}
window.dbSaveRoom = dbSaveRoom;

export function dbSaveChoiceResult(room, choiceId, rollResult, stat, result, dungeonName, floor){
  if(!result || !result.resultText) return;
  const choice = room.choices?.find(c=>c.id===choiceId)||{};
  const db = loadDungeonDB();
  db.choiceResults.push({
    id: 'cr_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),
    dungeonName, floor,
    roomType:   room.roomType,
    roomTitle:  room.title,
    choiceText: choice.text||'',
    stat,
    rollResult,
    isSuccess:  rollResult>=50,
    isCrit:     rollResult>=90,
    isFail:     rollResult<30,
    resultText: result.resultText,
    hpChange:   result.hpChange||0,
    goldChange: result.goldChange||0,
    expGain:    result.expGain||0,
    statusEffect: result.statusEffect||null,
    foundItem:  result.foundItem||false,
    foundItemRarity: result.foundItemRarity||null,
    roomCleared: result.roomCleared||false,
    createdAt:  new Date().toISOString()
  });
  saveDungeonDB(db);
}
window.dbSaveChoiceResult = dbSaveChoiceResult;

export function dbSaveDungeon(ds){
  if(!ds || !ds.dungeonName) return;
  const db = loadDungeonDB();
  const existing = db.dungeons.find(d=>d.dungeonName===ds.dungeonName && d.dungeonTheme===ds.dungeonTheme);
  if(existing){
    existing.maxFloor      = Math.max(existing.maxFloor||1, ds.floor||1);
    existing.totalRooms    = (existing.totalRooms||0)+1;
    existing.lastPlayedAt  = new Date().toISOString();
  } else {
    db.dungeons.push({
      id: 'dng_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),
      dungeonName:  ds.dungeonName,
      dungeonIcon:  ds.dungeonIcon||'🏚️',
      dungeonTheme: ds.dungeonTheme||'',
      scenario:     S.scenario?.name||'',
      maxFloor:     ds.floor||1,
      totalRooms:   1,
      createdAt:    new Date().toISOString(),
      lastPlayedAt: new Date().toISOString()
    });
  }
  saveDungeonDB(db);
}
window.dbSaveDungeon = dbSaveDungeon;

export function exportDungeonDB(){
  const db = loadDungeonDB();
  db.exportedAt = new Date().toISOString();
  db.stats = { rooms: db.rooms.length, choiceResults: db.choiceResults.length, dungeons: db.dungeons.length };
  const blob = new Blob([JSON.stringify(db, null, 2)], {type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'taleforge-dungeon-db-'+Date.now()+'.json'; a.click();
  URL.revokeObjectURL(url);
  toast('📦 던전 DB 내보내기 완료! (방 '+db.rooms.length+'개, 결과 '+db.choiceResults.length+'개)', 3500);
}
window.exportDungeonDB = exportDungeonDB;

export function getDungeonDBStats(){
  const db = loadDungeonDB();
  return { rooms: db.rooms.length, choiceResults: db.choiceResults.length, dungeons: db.dungeons.length };
}
window.getDungeonDBStats = getDungeonDBStats;

window.exportDungeonDB   = exportDungeonDB;

window.getDungeonDBStats = getDungeonDBStats;

window.loadDungeonDB     = loadDungeonDB;

export function loadDungeonState(){ try{ return JSON.parse(lsGet(DUNGEON_STATE_KEY)||'null'); }catch(e){ return null; } }
window.loadDungeonState = loadDungeonState;

export function saveDungeonState(d){ try{ lsSet(DUNGEON_STATE_KEY, d ? JSON.stringify(d) : 'null'); }catch(e){} }
window.saveDungeonState = saveDungeonState;

export function clearDungeonState(){ saveDungeonState(null); }
window.clearDungeonState = clearDungeonState;

window._dungeonSession = null;

export const DUNGEON_ANOMALY_CHANCE = 0.04;

export function rollDungeonAnomaly(currentGrade){
  const idx = DUNGEON_GRADE_ORDER.indexOf(currentGrade);
  if(idx < 0 || idx >= DUNGEON_GRADE_ORDER.length - 1) return null;
  if(Math.random() >= DUNGEON_ANOMALY_CHANCE) return null;
  // 상위 1~3단계 중 랜덤 승격(현재 등급이 최고등급에 가까우면 남은
  // 단계만큼만 승격 가능)
  const maxJump = Math.min(3, DUNGEON_GRADE_ORDER.length - 1 - idx);
  const jump = 1 + Math.floor(Math.random() * maxJump);
  const newIdx = idx + jump;
  return { fromGrade: currentGrade, toGrade: DUNGEON_GRADE_ORDER[newIdx], jump };
}
window.rollDungeonAnomaly = rollDungeonAnomaly;

export function applyDungeonAnomaly(session, anomaly){
  if(!session || !anomaly) return null;
  session.grade = anomaly.toGrade;
  session.anomalyTriggered = true;
  session.anomalyLog = session.anomalyLog || [];
  session.anomalyLog.push({ at: new Date().toISOString(), from: anomaly.fromGrade, to: anomaly.toGrade, floor: session.floor, roomCount: session.roomCount });
  saveDungeonState(session);
  const toInfo = DUNGEON_GRADES[anomaly.toGrade];
  const fromInfo = DUNGEON_GRADES[anomaly.fromGrade];
  toastHTML(`⚠️ 던전 정보 오류! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(fromInfo,{size:14}):(fromInfo.icon)}${esc(anomaly.fromGrade)}급으로 알려졌던 이 던전은 실제로는 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(toInfo,{size:14}):(toInfo.icon)}${esc(anomaly.toGrade)}급이었다!`, 5000);
  return toInfo;
}
window.applyDungeonAnomaly = applyDungeonAnomaly;

// ══════════════════════════════════════════════════════════════════
// 로컬 던전 생성 엔진 (AI 미사용) — DUNGEON_GRADES에 등급별로 이미
// 준비돼 있던 atmosTone/enemyTone/trapTone/treasureTone 문장을 그대로
// 재사용하고, 방 유형(roomType)별 제목·사건·선택지 뱅크를 조합해 매번
// 다른 방을 만든다. 등급별 톤 문장을 재사용하므로 등급마다 새로 문장을
// 쓸 필요가 없다 — 스케일 걱정 없이 등급이 늘어도 그대로 적용된다.
// ══════════════════════════════════════════════════════════════════
const ROOM_TITLE_BANK = {
  combat:   ['피에 젖은 복도','매복의 흔적','거친 숨소리','대치의 방'],
  trap:     ['수상한 바닥','거미줄 덮인 통로','함정의 흔적','조용한 경고'],
  treasure: ['빛나는 궤짝','오래된 보관함','숨겨진 방','반짝이는 것'],
  shrine:   ['버려진 제단','침묵의 성소','희미한 빛의 방','기도의 흔적'],
  boss:     ['거대한 그림자','마지막 관문','숨죽인 공포','정점의 방'],
  empty:    ['텅 빈 방','고요한 통로','먼지 쌓인 공간','아무것도 없는 곳'],
  mystery:  ['알 수 없는 기운','기묘한 표식','설명할 수 없는 방','수상한 공기'],
};
const ROOM_EVENT_BANK = {
  combat:   ['그림자 속에서 낮은 숨소리가 들려왔다.','뭔가가 이쪽을 노려보고 있는 기척이 느껴졌다.','바닥에 남은 발톱 자국이 아직 선명하다.'],
  trap:     ['바닥 한쪽이 미세하게 꺼져 있는 것이 눈에 띄었다.','벽에 이상한 문양이 새겨져 있다.','공기 중에 옅은 기운이 위태롭게 감돈다.'],
  treasure: ['한쪽 구석에서 은은한 빛이 새어 나오고 있었다.','오래된 상자 하나가 먼지를 뒤집어쓴 채 놓여 있었다.','반쯤 열린 서랍 사이로 무언가 반짝였다.'],
  shrine:   ['희미한 빛이 제단 위로 내려앉아 있었다.','오래된 기도문의 흔적이 벽에 남아 있다.','정적 속에서 무언가 지켜보는 듯한 느낌이 들었다.'],
  boss:     ['공기가 무겁게 가라앉으며 거대한 존재감이 느껴졌다.','발밑이 미세하게 흔들리는 것이 느껴졌다.','정면에서 압도적인 기운이 뿜어져 나왔다.'],
  empty:    ['특별한 것 없이 조용하기만 했다.','먼지만이 쌓인 채 시간이 멈춘 듯했다.','잠시 숨을 돌릴 수 있는 공간이었다.'],
  mystery:  ['설명하기 힘든 기운이 방 전체를 감돌고 있었다.','평범해 보이지만 뭔가 어긋난 느낌이 들었다.','시선을 어디에 둬야 할지 알 수 없었다.'],
};
const ENEMY_NAME_BANK = {
  E: ['고블린 정찰병','슬라임','굶주린 들쥐떼','도적 견습생'],
  D: ['오크 전사','코볼트 무리','저급 스켈레톤','부패한 좀비'],
  C: ['트롤','흑마법사의 부하','뱀파이어 종자','광기의 사냥개'],
  B: ['어린 드래곤','고위 리치의 종','성난 불의 정령','서리 정령'],
  A: ['고룡의 파편체','타락한 천사','리치 군주','심연의 파수병'],
  S: ['봉인된 신의 파편','고대 악마 군주','세계수의 수호자','시간을 거스르는 자'],
};
const TRAP_DETAIL_BANK = ['한 걸음만 잘못 디뎌도 큰일이 날 것 같았다.','겉보기엔 평범해 보이지만 방심할 수 없다.','누군가 이미 한 번 걸려든 흔적이 남아 있었다.'];
const TREASURE_DETAIL_BANK = ['가까이 다가갈수록 심상치 않은 기운이 느껴졌다.','손을 대기 전에 한 번 더 살펴보고 싶어지는 물건이었다.','오랜 세월의 흔적이 고스란히 남아 있었다.'];
const CHOICE_TEXT_BANK = {
  combat:   { str:'정면으로 맞선다',   agi:'빈틈을 노려 파고든다', mgc:'마력으로 제압한다' },
  trap:     { str:'힘으로 돌파한다',   agi:'재빠르게 피해간다',   mgc:'주문으로 무력화한다' },
  treasure: { str:'힘으로 열어본다',   agi:'조심스럽게 확인한다', mgc:'마력으로 감정한다' },
  shrine:   { str:'단호하게 다가간다', agi:'조용히 살펴본다',     mgc:'마력을 실어 응답한다' },
  boss:     { str:'정면으로 부딪힌다', agi:'약점을 노린다',       mgc:'전력으로 마력을 쏟아낸다' },
  empty:    { str:'구석구석 살펴본다', agi:'재빨리 훑어본다',     mgc:'마력으로 탐지한다' },
  mystery:  { str:'직접 건드려본다',   agi:'거리를 두고 관찰한다', mgc:'마력으로 분석한다' },
};
function _pickFrom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function composeLocalDungeonRoom(grade, forcedRoomType, anomalyNote){
  const gi = DUNGEON_GRADES[grade] || DUNGEON_GRADES['D'];
  const rawType = forcedRoomType || _pickFrom(gi.roomTypes);
  const rt = (rawType === 'boss_mini') ? 'boss' : rawType;
  const title = _pickFrom(ROOM_TITLE_BANK[rt] || ROOM_TITLE_BANK.mystery);
  const eventBank = ROOM_EVENT_BANK[rt] || ROOM_EVENT_BANK.mystery;
  let description = `${gi.atmosTone} ${_pickFrom(eventBank)}`;
  if(['B','A','S'].includes(grade) && eventBank.length>1){
    const rest = eventBank.filter(s=>!description.includes(s));
    if(rest.length) description += ' ' + _pickFrom(rest);
  }
  if(anomalyNote) description += ' 알려졌던 정보와는 명백히 다른, 훨씬 위협적인 기운이었다.';

  let enemyName=null, enemyDesc=null, trapDesc=null, treasureDesc=null;
  if(rt==='combat' || rt==='boss'){
    enemyName = _pickFrom(ENEMY_NAME_BANK[grade] || ENEMY_NAME_BANK.D);
    enemyDesc = gi.enemyTone;
  }
  if(rt==='trap') trapDesc = `${gi.trapTone} ${_pickFrom(TRAP_DETAIL_BANK)}`;
  if(rt==='treasure') treasureDesc = `${gi.treasureTone} ${_pickFrom(TREASURE_DETAIL_BANK)}`;

  const choiceBank = CHOICE_TEXT_BANK[rt] || CHOICE_TEXT_BANK.mystery;
  const riskA = grade==='S'?4:grade==='A'?3:grade==='B'?3:2;
  const riskB = grade==='S'?3:grade==='A'?3:grade==='B'?2:1;
  const riskC = grade==='S'?4:grade==='A'?3:grade==='B'?3:2;
  const choices = [
    { id:'a', text:choiceBank.str, stat:'str', riskLevel:riskA },
    { id:'b', text:choiceBank.agi, stat:'agi', riskLevel:riskB },
    { id:'c', text:choiceBank.mgc, stat:'mgc', riskLevel:riskC },
  ];
  return {
    roomType: rt, title, description, enemyName, enemyDesc, trapDesc, treasureDesc, choices,
    baseRewardGold: Math.round(50 * (gi.goldMult||1)),
    baseHpDamage: Math.round(15 * (gi.hpDamageMult||1)),
    floorHint: gi.desc,
    element: 'none',
  };
}
window.composeLocalDungeonRoom = composeLocalDungeonRoom;

const STAT_ACTION_BANK = {
  str: ['힘으로 밀어붙이며','온몸의 힘을 쥐어짜며','거침없이 부딪히며'],
  agi: ['민첩하게 움직이며','재빠른 몸놀림으로','순발력을 발휘해'],
  mgc: ['마력을 끌어올리며','주문을 엮어내며','술식을 펼치며'],
  per: ['날카로운 관찰력으로','주의 깊게 살피며','작은 단서를 놓치지 않고'],
  luk: ['운에 몸을 맡긴 채','어쩌다 보니','뜻밖의 기회를 놓치지 않고'],
};
const OUTCOME_TEXT_BANK = {
  crit:     ['{act} 완벽하게 성공시켰다. 예상보다 훨씬 좋은 결과가 따라왔다.', '{act} 최고의 순간을 만들어냈다 — 흠잡을 데 없는 결과였다.', '{act} 모든 것이 계획대로, 아니 그 이상으로 흘러갔다.'],
  success:  ['{act} 무난하게 상황을 해결했다.', '{act} 큰 무리 없이 다음 단계로 넘어갈 수 있었다.', '{act} 예상한 만큼의 결과를 얻어냈다.'],
  fail:     ['{act} 시도했지만 완전히 매끄럽지는 않았다.', '{act} 애를 썼지만 약간의 대가를 치렀다.', '{act} 절반의 성공에 그쳤다.'],
  critfail: ['{act} 했지만 상황이 완전히 꼬여버렸다.', '{act} 시도가 오히려 위험을 자초했다.', '{act} 뼈아픈 대가를 치러야 했다.'],
};
const STATUS_EFFECT_BANK = ['중독','출혈','기절'];
function composeLocalDungeonResult(room, choiceId, rollResult, stat){
  const choice = room.choices?.find(c=>c.id===choiceId) || {stat, riskLevel:2};
  const isCrit = rollResult >= 90;
  const isSuccess = !isCrit && rollResult >= 50;
  const isFail = !isCrit && !isSuccess && rollResult >= 30;
  const isCritFail = !isCrit && !isSuccess && !isFail;
  const tier = isCrit?'crit':isSuccess?'success':isFail?'fail':'critfail';
  const grade = window._dungeonSession?.grade || 'D';
  const gi = DUNGEON_GRADES[grade] || DUNGEON_GRADES['D'];

  const act = _pickFrom(STAT_ACTION_BANK[stat] || STAT_ACTION_BANK.str);
  const resultText = _pickFrom(OUTCOME_TEXT_BANK[tier]).replace(/\{act\}/g, act);

  const baseHpDamage = room.baseHpDamage || Math.round(15*(gi.hpDamageMult||1));
  const baseRewardGold = room.baseRewardGold || Math.round(50*(gi.goldMult||1));
  const riskLevel = choice.riskLevel || 2;

  let hpChange = 0;
  if(isCritFail) hpChange = -Math.round(baseHpDamage * (riskLevel/2));
  else if(isFail) hpChange = -Math.round(baseHpDamage * (riskLevel/2) * 0.5);

  let goldChange = 0;
  if(isCrit || isSuccess){
    const mult = (isCrit?1.5:1) * (room.roomType==='treasure'?1.5:1);
    goldChange = Math.round(baseRewardGold * mult);
  }

  const expGain = (isCrit||isSuccess) ? Math.round(20 * (gi.expMult||1) * (isCrit?1.5:1)) : Math.round(8 * (gi.expMult||1));

  let foundItem = false;
  if(isCrit) foundItem = true;
  else if(room.roomType==='treasure' && isSuccess) foundItem = Math.random() < 0.6;
  else if(isSuccess) foundItem = Math.random() < 0.15;
  const foundItemRarity = foundItem ? (gi.itemRarity || 'common') : null;

  const statusEffect = (isCritFail && Math.random() < 0.3) ? _pickFrom(STATUS_EFFECT_BANK) : null;
  const roomCleared = isCrit || isSuccess;

  return { resultText, hpChange, goldChange, expGain, statusEffect, foundItem, foundItemRarity, roomCleared, specialEvent: null };
}
window.composeLocalDungeonResult = composeLocalDungeonResult;

export function generateDungeonRoom(dungeonName, dungeonTheme, floor, roomNum, playerState, prevRoomDesc){
  // 등급 정보 가져오기
  let grade = window._dungeonSession?.grade || 'D';
  let anomalyNote = '';
  // 이변 판정 — 매 방마다 낮은 확률로 등급 승격 여부를 판정한다
  if(window._dungeonSession && typeof rollDungeonAnomaly === 'function'){
    const anomaly = rollDungeonAnomaly(grade);
    if(anomaly){
      const newInfo = applyDungeonAnomaly(window._dungeonSession, anomaly);
      if(newInfo){
        grade = anomaly.toGrade;
        anomalyNote = true;
      }
    }
  }
  const gi        = DUNGEON_GRADES[grade] || DUNGEON_GRADES['D'];
  const maxFloors = window._dungeonSession?.maxFloors || gi.floors.max;

  // 보스 방 판정: 등급별 bossInterval 기준
  const isBossFloor = gi.bossInterval > 0 && roomNum % gi.bossInterval === 0;
  // 마지막 층 최종 보스
  const isFinalBoss = floor >= maxFloors && roomNum % (gi.roomsPerFloor?.max||5) === 0;

  // 방 유형 가중치에서 선택 (보스 아닐 때)
  let forcedRoomType = null;
  if(isFinalBoss) forcedRoomType = 'boss';
  else if(isBossFloor) forcedRoomType = 'boss';

  // 이변(anomalyNote)이 터진 방은 그 순간의 반전을 새로 서술해야 하므로
  // 재사용 대상에서 제외한다. 그 외엔 등급+테마+강제방유형+층 밴드로
  // 버킷을 만들어, 이미 학습 캐시가 쌓인 조합이면 새로 생성하지 않고 재사용한다.
  const roomBucketKey = 'dungroom|'+grade+'|'+dungeonTheme+'|'+(forcedRoomType||'free')+'|'+Math.floor(floor/3);
  if(!anomalyNote){
    const reusedRoom = pickGeneratedObject(roomBucketKey);
    if(reusedRoom){
      return {
        ...reusedRoom,
        roomType: forcedRoomType || reusedRoom.roomType,
        baseRewardGold: Math.round(50 * (gi.goldMult||1)),
        baseHpDamage: Math.round(15 * (gi.hpDamageMult||1)),
      };
    }
  }

  const room = composeLocalDungeonRoom(grade, forcedRoomType, anomalyNote);
  if(!anomalyNote) recordGeneratedObject(roomBucketKey, room);
  return room;
}
window.generateDungeonRoom = generateDungeonRoom;

export function generateDungeonChoiceResult(room, choiceId, rollResult, stat){
  const isSuccess = rollResult >= 50;
  const isCrit    = rollResult >= 90;
  const isFail    = rollResult < 30;

  // 방 유형+성공등급+스탯+던전등급으로 버킷화. resultText가 이 방
  // description을 그대로 지칭하진 않고 "행동 결과" 자체를 묘사하는
  // 일반적인 문장이라, 다른 방에서 재사용해도 크게 어긋나지 않는다는
  // 판단이다 — 다만 완벽히 이 방의 디테일을 반영하진 않으므로, 위
  // 상황-학습 시스템과 같은 트레이드오프임을 README에 정직하게 남긴다.
  const outcomeTier = isCrit?'crit':isSuccess?'success':isFail?'critfail':'fail';
  const grade = window._dungeonSession?.grade || 'D';
  const resultBucketKey = 'dungresult|'+room.roomType+'|'+outcomeTier+'|'+stat+'|'+grade;
  const reusedResult = pickGeneratedObject(resultBucketKey);
  if(reusedResult) return { ...reusedResult };

  const result = composeLocalDungeonResult(room, choiceId, rollResult, stat);
  recordGeneratedObject(resultBucketKey, result);
  return result;
}
window.generateDungeonChoiceResult = generateDungeonChoiceResult;

export function renderDungeonUI(){
  const ds = window._dungeonSession;
  const panel = document.getElementById('pb-location');
  if(!panel) return;
  if(!ds){ renderLocationPanel(); return; }
  const hpPct   = Math.max(0,Math.min(100,Math.round((S.stats.hp||1)/999*100)));
  const hpColor = hpPct>60?'#4a9a4a':hpPct>30?'#c8a030':'#c03030';
  panel.innerHTML = `<div style="font-family:'Cinzel',serif">
    <div style="background:linear-gradient(135deg,#0d0005,#1a0010);border:1px solid #6a0a2a;padding:12px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:22px">${ds.dungeonIcon||'🏚️'}</span>
        <div>
          <div style="display:flex;align-items:center;gap:5px">
            <span style="color:#e04060;font-size:13px;letter-spacing:1px">${ds.dungeonName}</span>
            ${(()=>{ const gi=DUNGEON_GRADES[ds.grade||'D']; return gi?`<span style="font-size:10px;background:${gi.color}33;color:${gi.color};border:1px solid ${gi.color}66;padding:1px 6px;border-radius:2px;font-family:Cinzel,serif">${typeof getEntityIconHTML==='function'?getEntityIconHTML(gi,{size:10}):(gi.icon)} ${ds.grade||'D'}</span>`:''; })()}
          </div>
          <div style="color:#888;font-size:10px">⬇️ ${ds.floor}층/${ds.maxFloors||'?'}층 · 🚪 ${ds.roomCount}번째 방 · 💀 처치: ${ds.kills||0}</div>
        </div>
        <div style="display:flex;gap:5px;margin-top:6px">
          <button onclick="confirmLeaveDungeon()" style="flex:1;padding:5px;background:#1a0005;border:1px solid #6a0a2a;color:#c04050;font-size:9px;cursor:pointer;font-family:'Cinzel',serif">🚪 탈출</button>
          <button onclick="openP('minimap');renderMiniMap();" style="flex:1;padding:5px;background:#00101a;border:1px solid #1a4060;color:#4090c0;font-size:9px;cursor:pointer;font-family:'Cinzel',serif">🗺️ 미니맵</button>
        </div>
      </div>
      <div style="margin-top:4px">
        <div style="display:flex;justify-content:space-between;font-size:9px;color:#888;margin-bottom:2px"><span>HP</span><span style="color:${hpColor}">${Math.round(S.stats.hp||0)} / 999</span></div>
        <div style="background:#1a0005;height:6px;border-radius:3px;overflow:hidden"><div style="height:100%;width:${hpPct}%;background:${hpColor};transition:width .3s"></div></div>
      </div>
      <div style="margin-top:8px;font-size:9px;color:#888;border-top:1px solid #3a0a1a;padding-top:6px">🏆 골드: <span style="color:#c8a030">${ds.totalGold||0}</span> · ✨ 경험치: <span style="color:#6080c0">${ds.totalExp||0}</span> · 📦 아이템: <span style="color:#80a060">${ds.itemsFound||0}개</span></div>
      <div style="margin-top:6px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:9px;color:#555">💾 DB: 방 ${getDungeonDBStats().rooms}개 · 결과 ${getDungeonDBStats().choiceResults}개</span>
        <button onclick="exportDungeonDB()" style="padding:3px 7px;background:#0a0a1a;border:1px solid #3a3a6a;color:#6080c0;font-size:9px;cursor:pointer;font-family:'Cinzel',serif">📦 JSON 내보내기</button>
      </div>
    </div>
    <div id="dungeon-room-area">${ds.currentRoom ? renderDungeonRoomHTML(ds.currentRoom) : `<div style="text-align:center;padding:30px;color:#888"><div style="font-size:24px;margin-bottom:10px">🗝️</div><div style="font-size:11px">탐험을 시작하려면 아래 버튼을 누르세요</div></div><button onclick="advanceDungeonRoom()" style="width:100%;padding:12px;background:linear-gradient(135deg,#1a0010,#2a0020);border:1px solid #8a1a3a;color:#e04060;font-size:12px;cursor:pointer;font-family:'Cinzel',serif;letter-spacing:1px">⚔️ 던전 탐험 시작</button>`}</div>
  </div>`;
}
window.renderDungeonUI = renderDungeonUI;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_230(){
var _origCheckBossSpawn = window.checkBossSpawn;
window._origCheckBossSpawn = _origCheckBossSpawn;

window.checkBossSpawn = function(){
  // 기존 로직 실행
  if(typeof _origCheckBossSpawn === 'function') _origCheckBossSpawn.call(this);

  // 회차 보정: 고회차에서 추가 엘리트 몬스터 랜덤 스폰
  try{
    const cycle = (typeof loadCycleCount==='function') ? (loadCycleCount()||0) : 0;
    if(cycle < 3) return; // 3회차 미만은 추가 없음
    if(!S?.msgCount || S.msgCount % 20 !== 0) return; // 20턴마다 체크
    if(Math.random() > 0.3) return; // 30% 확률

    // 회차별 엘리트 풀 (이미 cycle 가산 포함)
    const elitePool = [
      { id:'elite_witch',     name:'저주받은 마녀',   icon:'🧙', hp:300+cycle*50,  atk:25+cycle*5,  def:10, tier:'elite' },
      { id:'elite_golem',     name:'고대 골렘',        icon:'🗿', hp:500+cycle*80,  atk:30+cycle*6,  def:20, tier:'elite' },
      { id:'elite_assassin',  name:'그림자 암살자',   icon:'🌑', hp:200+cycle*40,  atk:40+cycle*8,  def:8,  tier:'elite' },
      { id:'elite_dragon',    name:'성체 드래곤',      icon:'🐉', hp:800+cycle*100, atk:50+cycle*10, def:25, tier:'rare'  },
      { id:'elite_lich',      name:'리치 군주',        icon:'💀', hp:600+cycle*90,  atk:45+cycle*9,  def:15, tier:'rare'  },
    ];
    const pick = elitePool[Math.floor(Math.random()*elitePool.length)];
    // [밸런스 수정] 회차 보너스(cycle*N)는 이미 위 풀에 반영돼 있지만, 같은
    // 회차 안에서도 레벨 차이가 큰 플레이어들이 있을 수 있어 레벨 배율만
    // 추가로 곱함 (회차 배율은 중복 적용 방지를 위해 1로 고정).
    const _lvOnly = (typeof getEnemyScaleMultiplier==='function') ? getEnemyScaleMultiplier().levelMult : 1;
    const scaledHp  = Math.round(pick.hp * _lvOnly);
    const scaledAtk = Math.round(pick.atk * _lvOnly);
    // [신규] 이름이 MONSTER_TIER_TABLE 키워드와 일치하면(예: "고대 골렘"→T11,
    // "성체 드래곤"→"드래곤"이 없어 매칭 안 될 수 있음) 속성/약점/스킬 정보를
    // 함께 가져와 채운다. 매칭 안 되면 기본값(physical, 약점 없음)으로 처리.
    const _eliteTier = (typeof getMonsterTierStats==='function') ? getMonsterTierStats(pick.name) : {element:'physical',weakElement:null,resistElement:null,skills:[],trait:''};
    const monsters = loadMonsters()||[];
    const uid = pick.id + '_' + Date.now();
    if(!monsters.find(m=>m.id===uid)){
      monsters.push({
        ...pick, hp:scaledHp, id:uid, status:'alive', maxHp:scaledHp, atk:scaledAtk, cycleSpawned:cycle, isNamed:true,
        element: _eliteTier.element, weakElement: _eliteTier.weakElement,
        resistElement: _eliteTier.resistElement, skills: _eliteTier.skills, trait: _eliteTier.trait,
      });
      saveMonsters(monsters);
      toastHTML(`⚠️ [${esc(cycle)}회차 강화] ${typeof getEntityIconHTML==='function'?getEntityIconHTML(pick,{size:14}):(pick.icon)} ${esc(pick.name)} 출현!`, 3500);
      const _eliteSkillText = (_eliteTier.skills||[]).map(s=>s.name).join(', ');
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n[⚠️ ${cycle}회차 강화 엘리트 등장] ${pick.icon} ${pick.name}이(가) 나타났다. HP:${scaledHp} / ATK:${scaledAtk}${_eliteTier.weakElement?` / 약점:${_eliteTier.weakElement}`:''}${_eliteSkillText?` / 보유능력:${_eliteSkillText}`:''}. 강렬하고 위협적으로 등장을 묘사하라.`;
    }
  }catch(e){}
};

function renderDungeonRoomHTML(room){
  // [버그 수정] misc/298의 hookBossRoomAnim이 이 함수(정의된 곳 밖)에서
  // window.renderDungeonRoomHTML을 감싸 보스방 진입 연출(animBossRoom)을
  // 트리거하려 했지만, 이 함수의 실제 호출부(템플릿 리터럴 안의 ${...}
  // 호출 포함)가 bare 식별자라 그 감싸기가 적용된 적이 없다 — 보스방에
  // 들어가도 연출이 한 번도 재생되지 않았다. 실제 정의부에 직접 연결한다.
  if(room?.roomType==='boss' && typeof window.animBossRoom==='function') setTimeout(window.animBossRoom, 200);
  const roomIcons = {combat:'⚔️',trap:'🪤',treasure:'💎',shrine:'⛩️',boss:'💀',empty:'🌫️',mystery:'❓'};
  const roomColors = {combat:'#8a1a1a',trap:'#8a6a00',treasure:'#2a5a1a',shrine:'#1a3a6a',boss:'#6a0a2a',empty:'#2a2a2a',mystery:'#3a1a5a'};
  const icon  = roomIcons[room.roomType]||'🚪';
  const color = roomColors[room.roomType]||'#2a2a2a';
  let choicesHTML = '';
  if(room.choices && room.choices.length && !room._resolved){
    choicesHTML = `<div style="margin-top:10px"><div style="font-size:9px;color:#888;margin-bottom:6px;letter-spacing:1px">── 행동 선택 ──</div>${room.choices.map(c=>`<button onclick="chooseDungeonAction('${c.id}')" style="width:100%;text-align:left;padding:8px 10px;margin-bottom:5px;background:#0d0508;border:1px solid ${color};color:#ccc;font-size:10px;cursor:pointer;font-family:inherit;display:flex;justify-content:space-between;align-items:center"><span>${c.text}</span><span style="font-size:9px;color:#666">[${(c.stat||'LUK').toUpperCase()}] ${'⚡'.repeat(c.riskLevel||1)}</span></button>`).join('')}</div>`;
  }
  const nextBtn = room._resolved ? `<button onclick="advanceDungeonRoom()" style="width:100%;padding:10px;margin-top:8px;background:linear-gradient(135deg,#0a1a0a,#102010);border:1px solid #3a6a3a;color:#60c060;font-size:11px;cursor:pointer;font-family:'Cinzel',serif;letter-spacing:1px">➡️ 다음 방으로</button>` : '';
  return `<div style="background:linear-gradient(135deg,${color}33,#0d0508);border:1px solid ${color};padding:12px;margin-bottom:8px">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
      <span style="font-size:18px">${icon}</span>
      <span style="color:#ccc;font-size:11px;letter-spacing:.5px">${room.title||'???'}</span>
      ${room.roomType==='boss'?'<span style="font-size:9px;background:#6a0a2a;color:#e04060;padding:2px 5px;border-radius:2px">BOSS</span>':''}
    </div>
    <div style="font-size:11px;color:#bbb;line-height:1.7;margin-bottom:8px">${room.description||''}</div>
    ${room.enemyName?`<div style="font-size:10px;color:#e08060;margin-bottom:4px">👹 <strong>${room.enemyName}</strong> — ${room.enemyDesc||''}</div>`:''}
    ${room.trapDesc?`<div style="font-size:10px;color:#c0a030;margin-bottom:4px">🪤 ${room.trapDesc}</div>`:''}
    ${room.treasureDesc?`<div style="font-size:10px;color:#60c060;margin-bottom:4px">💎 ${room.treasureDesc}</div>`:''}
    ${room.floorHint?`<div style="font-size:9px;color:#6060a0;margin-top:4px;font-style:italic">💡 ${room.floorHint}</div>`:''}
  </div>
  ${room._resultText?`<div style="background:#0a0f0a;border:1px solid #2a4a2a;padding:10px;margin-bottom:8px;border-radius:2px"><div style="font-size:11px;color:#aabba0;line-height:1.7">${room._resultText}</div>${room._hpChange?`<div style="font-size:10px;color:${(room._hpChange||0)>=0?'#60c060':'#c04040'};margin-top:4px">${(room._hpChange||0)>=0?'❤️ HP +':'💔 HP '}${Math.abs(room._hpChange)}</div>`:''}${room._goldChange?`<div style="font-size:10px;color:#c8a030;margin-top:2px">💰 골드 +${room._goldChange}</div>`:''}${room._foundItem?`<div style="font-size:10px;color:#80a0e0;margin-top:2px">📦 아이템 획득!</div>`:''}</div>`:''}
  ${choicesHTML}${nextBtn}
  <div id="dungeon-loading" style="display:none;text-align:center;padding:12px;color:#8060a0;font-size:10px"><span id="dungeon-loading-text">⏳ 던전이 반응한다...</span></div>`;
}
window.renderDungeonRoomHTML = renderDungeonRoomHTML;
}

