// [17] 세력 명성 변경 / 상태 조회
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { FACTION_DEFS } from '../data/219-17-세력-명성-변경-상태-조회.js';
import { lsGet, lsSet, toast } from '../utils.js';

window.FACTION_DEFS = FACTION_DEFS;

export const FACTION_REP_V17_KEY = 'tf-faction-rep-v2';

export function loadFactionRepV17(){ try{ return JSON.parse(lsGet(FACTION_REP_V17_KEY)||'{}'); }catch(e){ return {}; } }
window.loadFactionRepV17 = loadFactionRepV17;

export function saveFactionRepV17(d){ try{ lsSet(FACTION_REP_V17_KEY, JSON.stringify(d)); }catch(e){} }
window.saveFactionRepV17 = saveFactionRepV17;

export function changeFactionRep(factionId, delta, reason='') {
  try {
    const fr = loadFactionRepV17();
    if (!fr[factionId]) {
      const def = FACTION_DEFS[factionId];
      fr[factionId] = { rep: def?.baseRep || 50, history: [] };
    }
    const old = fr[factionId].rep;
    fr[factionId].rep = Math.max(0, Math.min(100, old + delta));
    if (reason) fr[factionId].history = (fr[factionId].history||[]).concat([{ delta, reason, turn:S?.msgCount||0 }]);
    saveFactionRepV17(fr);
    const def = FACTION_DEFS[factionId];
    const icon = def?.icon || '⚖️';
    if (Math.abs(delta) >= 10) toast(`${icon} ${def?.name||factionId}: ${delta>0?'+':''}${delta} (${fr[factionId].rep})`, 2500);
  } catch(e) {}
}
window.changeFactionRep = changeFactionRep;

export function getFactionStatus(factionId) {
  try {
    const fr = loadFactionRepV17();
    const rep = (fr[factionId]?.rep) ?? (FACTION_DEFS[factionId]?.baseRep ?? 50);
    if (rep >= 80) return '동맹';
    if (rep >= 60) return '우호';
    if (rep >= 40) return '중립';
    if (rep >= 20) return '경계';
    return '적대';
  } catch(e) { return '중립'; }
}
window.getFactionStatus = getFactionStatus;

export function getFactionBLS() {
  try {
    const fr = loadFactionRepV17();
    const lines = Object.entries(FACTION_DEFS).map(([id, def]) => {
      const rep = fr[id]?.rep ?? def.baseRep;
      const status = getFactionStatus(id);
      // [버그 수정] faction_rep GS 필드는 "세력ID"를 요구하는데, 그 정확한
      // ID 문자열(kingdom_knights 등 영문 snake_case)이 이 텍스트 어디에도
      // 노출된 적이 없어(전수조사로 확인) AI가 실제로 무슨 값을 써야
      // 하는지 알 방법이 없었다 — AI는 여기서 항상 한글 이름만 봤으므로
      // gs.faction_rep에 임의의 한글 키를 써서 FACTION_DEFS와 절대 매칭될
      // 수 없는 별도 항목만 계속 생성했고, 그 결과 이 세력 명성 값은
      // 사실상 한 번도 실제로 갱신된 적이 없었다. 이제 AI가 그대로
      // 복사해 쓸 수 있게 정확한 ID를 괄호로 함께 노출한다.
      return `${def.icon}${def.name}[ID:${id}]:${rep}(${status})`;
    });
    return lines.length ? `\n[⚖️ 세력 명성] ${lines.join(' | ')} — faction_rep GS 필드에는 반드시 위 [ID:...] 값을 그대로 사용하라(한글 이름 금지).` : '';
  } catch(e) { return ''; }
}
window.getFactionBLS = getFactionBLS;

window.changeFactionRep = changeFactionRep;

window.getFactionStatus = getFactionStatus;

window.getFactionBLS    = getFactionBLS;
