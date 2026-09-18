// 보석 정의 (5종 × 5등급)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { GEM_TYPES, SOCKET_CONFIG } from '../data/175-보석-정의-5종-5등급.js';

export function gemEffectText(typeId, grade){
  const g = GEM_TYPES[typeId];
  if(!g) return '?';
  const v = g.vals[grade]||0;
  return g.baseEffect.replace('{v}',v);
}
window.gemEffectText = gemEffectText;

window.gemEffectText = gemEffectText;

export function initItemSockets(item){
  if(!item||item.sockets) return item;
  const slotType = item.slotType||item.slot||'weapon';
  const cfg = SOCKET_CONFIG[slotType]||{ runeSlots:1, gemSlots:1 };
  item.sockets = {
    runes: new Array(cfg.runeSlots).fill(null),
    gems:  new Array(cfg.gemSlots).fill(null),
  };
  item.enhanceLevel = item.enhanceLevel||0;
  return item;
}
window.initItemSockets = initItemSockets;

window.initItemSockets = initItemSockets;
