// 계승 아이템 획득
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { HERITAGE_ITEMS } from '../data/165-저장소.js';
import { addEvent } from '../misc/142-③-사건-DB-태그-인덱스-전문-검색.js';
import { toast } from '../utils.js';
import { loadHeritage, saveHeritage } from '../world/165-저장소.js';

export function earnHeritageItem(itemId, reason){
  const def = HERITAGE_ITEMS[itemId];
  if(!def){ console.warn('Unknown heritage item:', itemId); return false; }
  const h = loadHeritage();
  if(!h.items) h.items = {};

  if(!def.stackable && h.items[itemId]){
    toast('이미 보유 중: '+def.icon+' '+def.name, 2000);
    return false;
  }
  if(def.stackable){
    const cur = h.items[itemId]||0;
    const max = def.maxStack||1;
    if(cur>=max){
      toast(def.icon+' '+def.name+' 최대 중첩 달성!', 2000);
      return false;
    }
    h.items[itemId] = cur+1;
  } else {
    h.items[itemId] = 1;
  }

  h.earnedAt = h.earnedAt||{};
  h.earnedAt[itemId] = { turn:S.msgCount||0, reason, at:new Date().toISOString() };
  saveHeritage(h);

  toast('🏛️ 계승 획득! '+def.icon+' '+def.name+' ('+def.grade+'급)', 5000);
  if(typeof addTimelineEvent==='function')
    addTimelineEvent('heritage', def.name+' 획득', {icon:def.icon});
  if(typeof addEvent==='function')
    addEvent({ title:'계승 아이템 획득: '+def.name, desc:def.effect, tags:['heritage','legacy'], worldImpact:2 });
  return true;
}
window.earnHeritageItem = earnHeritageItem;

window.earnHeritageItem = earnHeritageItem;
