// block4-preamble — data
// Pure data split out of misc/261-block4-preamble.js (see generate.js).
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadNPCs } from '../misc/001-block0-preamble.js';
import { loadLocations } from '../misc/054-이동수단-시스템.js';
import { loadWorldState } from '../misc/066-②-선택-결과-추적-시스템.js';
import { loadDiary } from '../misc/076-파트2-D-일기기록-시스템.js';
import { lsGet } from '../utils.js';
import { S } from './084-TaleForge-순수-JS-엔진.js';

export const MILESTONE_DEFS=[
  {id:'turn_10',   icon:'⏳', label:'첫 10턴',          cat:'play',   reward:{gold:50,  exp:50},  check:()=>(S.msgCount||0)>=10},
  {id:'turn_30',   icon:'⏳', label:'30턴 생존',         cat:'play',   reward:{gold:100, exp:100}, check:()=>(S.msgCount||0)>=30},
  {id:'turn_50',   icon:'⏳', label:'50턴의 여정',       cat:'play',   reward:{gold:150, exp:200}, check:()=>(S.msgCount||0)>=50},
  {id:'turn_100',  icon:'⌛', label:'백 번의 선택',      cat:'play',   reward:{gold:300, exp:500}, check:()=>(S.msgCount||0)>=100},
  {id:'gold_500',  icon:'💰', label:'첫 500골드',        cat:'wealth', reward:{exp:100},           check:()=>(S.gold||0)>=500},
  {id:'gold_2000', icon:'💰', label:'2000골드 부자',     cat:'wealth', reward:{exp:200},           check:()=>(S.gold||0)>=2000},
  {id:'gold_5000', icon:'💎', label:'5천골드 상인왕',    cat:'wealth', reward:{exp:500,gold:200},  check:()=>(S.gold||0)>=5000},
  {id:'npc_3',     icon:'👥', label:'친구 3명',          cat:'social', reward:{gold:80,  exp:80},  check:()=>(typeof loadNPCs==='function'?loadNPCs():[]).filter(n=>(n.relationship||50)>=65).length>=3},
  {id:'npc_5',     icon:'👥', label:'인맥 5명',          cat:'social', reward:{gold:150, exp:150}, check:()=>(typeof loadNPCs==='function'?loadNPCs():[]).filter(n=>(n.relationship||50)>=65).length>=5},
  {id:'lv_5',      icon:'⬆️', label:'레벨 5',            cat:'growth', reward:{gold:100, exp:50},  check:()=>(typeof loadPlayerLevel==='function'?loadPlayerLevel():1)>=5},
  {id:'lv_10',     icon:'⬆️', label:'레벨 10',           cat:'growth', reward:{gold:200, exp:100}, check:()=>(typeof loadPlayerLevel==='function'?loadPlayerLevel():1)>=10},
  {id:'lv_20',     icon:'🌟', label:'레벨 20',           cat:'growth', reward:{gold:500, exp:300}, check:()=>(typeof loadPlayerLevel==='function'?loadPlayerLevel():1)>=20},
  {id:'loc_3',     icon:'🗺️', label:'3곳 탐험',         cat:'explore',reward:{gold:80,  exp:80},  check:()=>(typeof loadLocations==='function'?loadLocations():[]).length>=3},
  {id:'loc_8',     icon:'🗺️', label:'8곳 탐험',         cat:'explore',reward:{gold:200, exp:200}, check:()=>(typeof loadLocations==='function'?loadLocations():[]).length>=8},
  {id:'choice_20', icon:'🎯', label:'20번의 결단',       cat:'choice', reward:{exp:150},           check:()=>{ try{ return (loadWorldState?.()||{}).totalChoices>=20; }catch(e){ return false; } }},
  {id:'choice_50', icon:'🎯', label:'운명을 50번 바꿨다',cat:'choice', reward:{exp:300,gold:100},  check:()=>{ try{ return (loadWorldState?.()||{}).totalChoices>=50; }catch(e){ return false; } }},
  {id:'quest_3',   icon:'📜', label:'의뢰 3건 완료',     cat:'quest',  reward:{gold:150, exp:150}, check:()=>(typeof loadDiary==='function'?loadDiary():[]).filter(d=>d.type==='quest').length>=3},
  {id:'item_rare', icon:'💎', label:'희귀 아이템 획득',  cat:'item',   reward:{exp:200},           check:()=>(S.inventory||[]).some(i=>i.rarity==='rare'||i.rarity==='legendary')},
  {id:'demesne_1', icon:'🏰', label:'영지 개설',         cat:'domain', reward:{gold:200, exp:200}, check:()=>{ try{ return JSON.parse(lsGet('tf-demesne')||'{}')?.established; }catch(e){ return false; } }},
  {id:'demesne_t3',icon:'🏯', label:'남작령 승격',       cat:'domain', reward:{gold:500, exp:500}, check:()=>{ try{ return (JSON.parse(lsGet('tf-demesne')||'{}')?.tier||0)>=3; }catch(e){ return false; } }},
];

export var ENDING_COMPASS_DEFS=[
  {id:'hero',     icon:'⚔️', label:'영웅의 길',    color:'#e0c040', hint:'선행과 희생이 쌓이고 있다. 왕국의 영웅 엔딩에 가까워지고 있다.',
   signals:['보호','구했','승리','희생'], condition:function(ws){return (ws.goodActs||0)>(ws.evilActs||0)+3;}},
  {id:'villain',  icon:'💀', label:'악당의 왕좌',  color:'#e03030', hint:'어둠의 행보가 이어지고 있다. 악의 군주 엔딩을 향해 가고 있다.',
   signals:['배신','지배','굴복','두려움'], condition:function(ws){return (ws.evilActs||0)>(ws.goodActs||0)+3;}},
  {id:'wanderer', icon:'🌙', label:'방랑자의 길',   color:'#6080c0', hint:'어디에도 얽매이지 않는 자유로운 발걸음. 방랑자 엔딩이 기다린다.',
   signals:['여행','떠났','자유','바람'], condition:function(ws){return (ws.totalChoices||0)>20&&(ws.goodActs||0)<3&&(ws.evilActs||0)<3;}},
  {id:'sage',     icon:'📚', label:'현자의 결말',   color:'#60a0e0', hint:'지혜의 선택이 이어지고 있다. 현자 혹은 조언자 엔딩으로 가고 있다.',
   signals:['배웠','이해','진실','지식'], condition:function(ws){return (ws.wiseActs||0)>5;}},
  {id:'ruler',    icon:'👑', label:'왕좌의 지배자', color:'#c8a040', hint:'세력을 모으고 있다. 왕국 통일 혹은 군주 엔딩을 향해 나아가고 있다.',
   signals:['동맹','세력','통제','왕국'], condition:function(ws){return (ws.did_동맹||0)>1||(ws.alliancesFormed||0)>2;}},
];
window.ENDING_COMPASS_DEFS = ENDING_COMPASS_DEFS;
