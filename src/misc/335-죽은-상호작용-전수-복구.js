// 🧭 63번 섹션 후속 — "핸들러 없는 상호작용 전수 복구" 범용 판정기
// data/335의 DEAD_INTERACTION_DEFS를 해석해 실제 효과를 적용한다.
// doInteraction()의 actions 맵에 83개를 일일이 등록하는 대신, misc/053이
// 이 파일에서 export하는 resolveDeadInteraction(actionId) 하나로 전부
// 위임한다 — 83개 action id 각각에 대해 `()=>resolveDeadInteraction(id)`
// 래퍼만 돌려 등록(62-2/62-3번 섹션의 가벼운 위임 패턴과 동일).
import { DEAD_INTERACTION_DEFS } from '../data/335-죽은-상호작용-전수-복구.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { rollEventReward, saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { updateReputation } from './054-이동수단-시스템.js';

const ONCE_KEY = 'tf-dead-interaction-once';
function loadOnceFlags(){ try{ return JSON.parse(lsGet(ONCE_KEY)||'{}'); }catch(e){ return {}; } }
function saveOnceFlags(d){ try{ lsSet(ONCE_KEY, JSON.stringify(d)); }catch(e){} }

// economy/255의 calcTameSuccessChance, 62-2번 섹션의 arenaWinChance와
// 똑같은 시그모이드 형태(diff=0→0.5, 클램프 5~95%) — 새 확률 공식을
// 지어내지 않고 이미 이 세션에서 2번 쓰인 패턴을 그대로 재사용.
function rollCheck(statKeys, threshold){
  if(!statKeys || !statKeys.length) return true;
  const avg = statKeys.reduce((sum,k)=>sum+(S.stats[k]||50), 0) / statKeys.length;
  const thr = threshold || (statKeys.length===1 ? 55 : statKeys.length===2 ? 65 : 75);
  const diff = avg - thr;
  const chance = Math.max(0.05, Math.min(0.95, 1/(1+Math.exp(-diff/17.5))));
  return Math.random() < chance;
}

function applyReward(actionId, r){
  if(!r) return;
  switch(r.t){
    case 'item': {
      const item = rollEventReward(r.tier||'quest');
      if(item){
        S.inventory.push(item);
        saveInventory(S.inventory);
        toastHTML(`🎁 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon||'')} ${esc(item.name)} 획득!`, 3000);
      }
      break;
    }
    case 'stat': {
      if(r.once){
        const flags = loadOnceFlags();
        if(flags[actionId]){ toast('이미 얻은 효과다.', 1800); return; }
        flags[actionId] = true;
        saveOnceFlags(flags);
      }
      const parts = [];
      Object.entries(r.mods||{}).forEach(([k,v])=>{
        if(S.stats[k]===undefined) return;
        S.stats[k] = Math.max(0, Math.min(999, S.stats[k]+v));
        parts.push(`${k.toUpperCase()}${v>=0?'+':''}${v}`);
      });
      if(typeof window.updateHeader==='function') window.updateHeader();
      toast(`✨ ${parts.join(' ')}`, 2500);
      break;
    }
    case 'gold': {
      const amt = r.min + Math.floor(Math.random()*((r.max-r.min)+1));
      if(typeof addGoldWithExchange==='function') addGoldWithExchange(amt, '상호작용 보상'); else { S.gold+=amt; saveGold(S.gold); }
      if(typeof window.updateHeader==='function') window.updateHeader();
      toast(`💰 골드+${amt}`, 2000);
      break;
    }
    case 'rep': {
      updateReputation(r.amount||10);
      toast(`📜 평판+${r.amount||10}`, 2000);
      break;
    }
    case 'ending': {
      // 새 엔딩 분기를 만들지 않고 ui/155의 기존 checkTrueEndingCondition()을
      // 그대로 호출 — 조건이 이미 충족돼 있으면 그 함수가 알아서 진엔딩을
      // 발동시키고, 부족하면 그 함수가 이미 하던 안내 토스트가 뜬다.
      if(typeof window.checkTrueEndingCondition==='function') window.checkTrueEndingCondition();
      else toast('아직 아무 반응이 없다...', 2000);
      break;
    }
  }
}

export function resolveDeadInteraction(actionId){
  const def = DEAD_INTERACTION_DEFS[actionId];
  if(!def) return;
  const ok = rollCheck(def.s, def.thr);
  if(ok){
    applyReward(actionId, def.r);
    if(def.restoreToo){
      S.stats.hp = S.stats.maxHp || S.stats.hp;
      S.stats.mp = S.stats.maxMp || S.stats.mp;
      if(typeof window.updateHeader==='function') window.updateHeader();
    }
  } else {
    const dmg = def.fhp||0;
    if(dmg>0){
      S.stats.hp = Math.max(1, (S.stats.hp||100)-dmg);
      if(typeof window.updateHeader==='function') window.updateHeader();
      toast(`❌ 판정 실패... HP-${dmg}`, 2500);
    } else {
      toast('❌ 성과 없이 끝났다.', 2000);
    }
  }
}
window.resolveDeadInteraction = resolveDeadInteraction;
