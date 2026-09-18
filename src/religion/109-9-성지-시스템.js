// 9. 성지 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { SHRINE_DEFS } from '../data/109-9-성지-시스템.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { getPlayerMaxHp } from '../misc/054-이동수단-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { changeReligionShare } from './092-3-지역-종교-점유율-조회수정.js';
import { getPlayerReligion } from './094-5-플레이어-종교-귀속-교화.js';

export const SHRINE_KEY = 'tf-shrines';

export function loadShrines(){ try{ return JSON.parse(lsGet(SHRINE_KEY)||'[]'); }catch(e){ return []; } }
window.loadShrines = loadShrines;

export function saveShrines(d){ lsSet(SHRINE_KEY, JSON.stringify(d)); }
window.saveShrines = saveShrines;

export function buildShrine(region, religionId){
  const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  if(!rel){ toast('⚠️ 소속 종교가 없습니다.', 2000); return; }
  if(religionId && religionId !== rel){ toast('⚠️ 자신의 종교 성지만 건립할 수 있습니다.', 2000); return; }

  const cost = 300;
  if((S.gold||0) < cost){ toast(`⚠️ 골드 부족! (${cost}G 필요)`, 2000); return; }

  const shrines = loadShrines();
  const existing = shrines.find(s=>s.region===region&&s.religion===rel);
  if(existing){ toast('이미 이 지역에 성지가 있습니다.', 2000); return; }

  S.gold -= cost;
  if(typeof saveGold==='function') saveGold(S.gold);

  const def = SHRINE_DEFS[rel];
  const shrine = {
    id: `shrine_${rel}_${region}_${Date.now()}`,
    religion: rel, region,
    name: def?.name||'성지',
    icon: def?.icon||'⛪',
    builtAt: S.msgCount||0,
    effect: def?.effect||{},
    active: true,
  };
  shrines.push(shrine);
  saveShrines(shrines);

  // 성지 효과 영구 적용
  if(def?.effect && S.stats){
    Object.entries(def.effect).forEach(([k,v])=>{
      if(S.stats[k]!==undefined) S.stats[k] = Math.min(999,(S.stats[k]||0)+v);
    });
  }
  // 지역 신도 점유율 +5
  changeReligionShare(region, {[rel]:5});

  toastHTML(`${esc(def?.icon||'⛪')} ${esc(def?.name||'성지')} 건립 완료! (${esc(region)})`, 4000);
  if(typeof addTimelineEvent==='function')
    addTimelineEvent('event', `${def?.name||'성지'} 건립 (${region})`, {icon:def?.icon||'⛪'});
  S._nextInjectedContext = (S._nextInjectedContext||'')
    +`\n[⛪ 성지 건립] ${region} 지역에 ${def?.name||'성지'}이(가) 세워졌다. `
    +'지역 주민들의 반응과 성지 봉헌 장면을 묘사하라. 효과: '+JSON.stringify(def?.effect||{});
}
window.buildShrine = buildShrine;

window.buildShrine = buildShrine;

export function getShrineSection(){
  const shrines = loadShrines();
  if(!shrines.length) return '';
  return `\n[⛪ 건립된 성지]\n${shrines.filter(s=>s.active).map(s=>`• ${s.icon} ${s.name} (${s.region}): ${SHRINE_DEFS[s.religion]?.blessing||''}`).join('\n')}\n성지가 있는 지역에서 관련 종교 NPC들이 더 우호적으로 반응하고 교화 효과가 증대된다.`;
}
window.getShrineSection = getShrineSection;

window.getShrineSection = getShrineSection;

export function tickShrineEffects(){
  if((S.msgCount||0)%10!==0) return;
  const loc = typeof loadCurrentLocation==='function' ? loadCurrentLocation() : null;
  const region = loc?.continent||'central';
  const shrines = loadShrines().filter(s=>s.active&&s.region===region);
  if(!shrines.length) return;
  const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  shrines.forEach(s=>{
    if(s.religion!==rel) return;
    if(s.religion==='temple' && S.stats){
      S.stats.hp = Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999),(S.stats.hp||100)+10);
      toast('⛪ 성지의 가호 — HP+10 회복', 2000);
    }
  });
}
window.tickShrineEffects = tickShrineEffects;

window.tickShrineEffects = tickShrineEffects;
