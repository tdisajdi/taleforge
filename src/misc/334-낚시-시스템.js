// 🎣 낚시 시스템 (62-3번 섹션 신설)
// 포구/해안 장소에서 실행하는 낚시 상호작용 — 전용 패널 없이
// misc/053의 renderLocationInteractions가 loc.coastal 장소에 동적으로
// "낚시하기" 버튼을 끼워 넣고, doInteraction의 goFishing 핸들러가
// 여기 goFishing()을 그대로 호출한다(62-1/62-2번 섹션과 같은 "새 패널
// 대신 기존 장소 팝업에 끼워 넣기" 패턴).
import { FISH_DEFS } from '../data/334-낚시-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { esc, toast } from '../utils.js';

// economy/255의 SEA_EVENT_POOL/pickWeightedSeaEvent와 똑같은 가중치
// 합산 방식(weight 필드, 누적 롤) — 새 추첨 알고리즘을 지어내지 않고
// 그대로 재사용.
export function pickWeightedFish(){
  const totalWeight = FISH_DEFS.reduce((s,f)=>s+f.weight, 0);
  let roll = Math.random()*totalWeight;
  let picked = FISH_DEFS[0];
  for(const f of FISH_DEFS){
    if(roll < f.weight){ picked = f; break; }
    roll -= f.weight;
  }
  return picked;
}
window.pickWeightedFish = pickWeightedFish;

export function goFishing(){
  // 15% 확률로 허탕 — 매번 100% 성공하면 "낚시"라는 긴장감이 없어진다.
  if(Math.random() < 0.15){
    toast('🎣 한참을 기다렸지만 입질이 없었다...', 2000);
    return;
  }
  const fish = pickWeightedFish();
  const item = { id:fish.id, name:fish.name, icon:fish.icon, rarity:fish.rarity, type:'material', desc:`낚시로 건진 ${fish.name}. 팔거나 요리 재료로 쓸 수 있다.` };
  S.inventory.push(item);
  saveInventory(S.inventory);
  if(typeof window.updateStats==='function') window.updateStats('fishCaught', 1);
  toastHTML(`🎣 낚시 성공! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):item.icon} ${esc(item.name)} 획득!`, 2500);
}
window.goFishing = goFishing;
