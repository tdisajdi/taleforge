// 12. BLS에 성지/이단/혼합종파 정보 추가
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { getFaithTier } from './101-1-신앙fath-종교-시스템-실제-연동.js';
import { getReligionRollBonus } from './102-2-종교-축복저주-판정-보너스.js';
import { loadSyncretism } from './105-5-제5-혼합-종파-Syncretism.js';
import { getHeresyRiskLabel } from './108-8-이단-심문-시스템.js';
import { getShrineSection } from './109-9-성지-시스템.js';



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_93(){
const _origGetReligionBLS = window.getReligionBLS;

window.getReligionBLS = function(){
  const base = typeof _origGetReligionBLS==='function' ? _origGetReligionBLS() : '';
  const shrineSection = getShrineSection();
  const heresy = getHeresyRiskLabel();
  const sync = loadSyncretism();
  const tier = getFaithTier();
  const rb = getReligionRollBonus();

  let extra = '';
  if(shrineSection) extra += shrineSection;
  if(heresy) extra += `\n[⚠️ 이단 혐의] ${heresy} — 이단 심문소가 감시 중`;
  if(sync) extra += `\n[🌈 혼합 종파] ${sync.name} 존재 중 (${sync.region})`;
  extra += `\n[신앙 등급] ${tier.icon} ${tier.label} (fath:${S.stats?.fath||50})`;
  if(rb) extra += `\n[종교 판정 보너스] ${rb.desc}`;

  return base + extra;
};
}

