// [9] 왕국 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
//
// [60-1번 섹션, 2026-10-13] 이 파일의 4개 함수(buildKingdom/upgradeKingdom/
// collectTax/expandTerritory)는 UI 진입점(버튼·패널·디스패처)이 전혀
// 없는 100% 죽은 코드였다 — dist 빌드 전체를 그렙해도 buildKingdom(
// 호출부가 이 파일 자기 정의부 1곳뿐임을 실측으로 확인. 삭제하지 않고
// (과거 기록 보존 원칙), 아래 4종 왕국 유형(KINGDOM_TYPES_V50)을
// `race/260`의 영지(demesne) 시스템 최고 등급(공작령, tier 5) 전용
// "왕국 선포" 기능(`declareKingdom`)에 흡수시켜 되살렸다 — 영지가
// 이미 티어/건물/인구/봉신까지 갖춘 훨씬 풍부한 시스템이라, 이 얕은
// 평행 시스템을 따로 UI까지 새로 만드느니 그 쪽에 합치는 게 자연스러움.
// 이 파일의 함수들 자체는 참조용으로 그대로 남겨두되, 실제 플레이에서는
// 더 이상 호출되지 않는다.
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { KINGDOM_TYPES_V50 } from '../data/212-9-왕국-시스템.js';
import { loadGold, saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { addButterflyEffect } from '../misc/015-시스템-1120.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { loadKingdom, saveKingdom } from '../race/028-악마족-진명-시스템-Demon-True-Name.js';
import { toast } from '../utils.js';

// [버그 수정] 이 파일의 4개 함수(buildKingdom/upgradeKingdom/collectTax/
// expandTerritory)가 전부 race/028의 loadKingdom()으로 "taleforge-kingdom"
// 키에서 읽어오면서, 저장은 여기서 새로 만든 별도 키(KINGDOM_KEY2:
// 'tf-kingdom')에 했다 — 그 키는 코드베이스 어디서도 다시 읽힌 적이
// 없다. 그 결과 왕국을 건설해도 바로 다음 조작(업그레이드/세금 징수/
// 영토 확장)에서는 loadKingdom()이 다시 "taleforge-kingdom"만 읽으므로
// 방금 저장한 내용이 보이지 않아, 사실상 모든 변경이 다음 호출 시점에
// 조용히 사라졌다. race/028의 saveKingdom()(같은 키에 저장)으로 교체.

export function buildKingdom(name, type='kingdom') {
  try {
    const kg = typeof loadKingdom === 'function' ? loadKingdom() : { founded:[], legacy:0 };
    const def = KINGDOM_TYPES_V50[type] || KINGDOM_TYPES_V50.kingdom;
    const newKingdom = {
      id: 'kg_'+(S?.msgCount||0), name, type,
      icon: def.icon, population: 1000, treasury: 500,
      territory: 1, military: 100, founded: S?.msgCount||0,
    };
    kg.founded = kg.founded || [];
    kg.founded.push(newKingdom);
    saveKingdom(kg);
    toast(`${def.name} "${name}" 건설!`, 3500, def);
    unlockAchievement('kingdom_builder');
    if (typeof addButterflyEffect === 'function')
      addButterflyEffect({ desc:`왕국 건설: ${name}`, impact:5, worldChange:'새로운 나라가 탄생했다', major:true });
    return newKingdom;
  } catch(e) { return null; }
}
window.buildKingdom = buildKingdom;

export function upgradeKingdom(kingdomId, field) {
  try {
    const kg = typeof loadKingdom === 'function' ? loadKingdom() : { founded:[] };
    const k = (kg.founded||[]).find(x=>x.id===kingdomId);
    if (!k) return;
    const cost = { population:200, treasury:100, territory:500, military:300 };
    const c = cost[field] || 100;
    if ((k.treasury||0) < c) { toast('재정이 부족합니다!', 1500); return; }
    k.treasury -= c;
    k[field] = (k[field]||0) + Math.floor((k[field]||100) * 0.2);
    saveKingdom(kg);
    toast(`🏰 ${k.name}: ${field} 발전`, 2000);
  } catch(e) {}
}
window.upgradeKingdom = upgradeKingdom;

export function collectTax(kingdomId) {
  try {
    const kg = typeof loadKingdom === 'function' ? loadKingdom() : { founded:[] };
    const k = (kg.founded||[]).find(x=>x.id===kingdomId);
    if (!k) return 0;
    const def = KINGDOM_TYPES_V50[k.type] || KINGDOM_TYPES_V50.kingdom;
    const tax = Math.floor((k.population||1000) * (def.taxRate||0.1));
    k.treasury = (k.treasury||0) + tax;
    // 골드에도 반영
    // [버그 수정] 'tf-gold'(존재하지 않는 키) → saveGold()로 교정. S.gold도
    // 동기화해 헤더에 즉시 반영되도록 함(기존엔 새로고침 전까지 표시 안 됨).
    const cur = typeof loadGold==='function' ? loadGold() : 0;
    const goldGain = Math.floor(tax*0.3);
    if (typeof addGoldWithExchange==='function'){ S.gold = cur; addGoldWithExchange(goldGain, '왕국 세금 징수'); }
    else { if (typeof saveGold === 'function') saveGold(cur + goldGain); if (S.gold !== undefined) S.gold = cur + goldGain; }
    if (typeof window.updateHeader === 'function') window.updateHeader();
    saveKingdom(kg);
    toast(`💰 세금 징수: ${tax} (왕국 금고)`, 2000);
    return tax;
  } catch(e) { return 0; }
}
window.collectTax = collectTax;

export function expandTerritory(kingdomId) {
  try {
    const kg = typeof loadKingdom === 'function' ? loadKingdom() : { founded:[] };
    const k = (kg.founded||[]).find(x=>x.id===kingdomId);
    if (!k) return;
    const cost = (k.territory||1) * 300;
    if ((k.treasury||0) < cost) { toast('재정이 부족합니다!', 1500); return; }
    k.treasury -= cost;
    k.territory = (k.territory||1) + 1;
    saveKingdom(kg);
    toast(`🗺️ ${k.name}: 영토 확장! (${k.territory}구역)`, 2500);
  } catch(e) {}
}
window.expandTerritory = expandTerritory;

export function getKingdomStats(kingdomId) {
  try {
    const kg = typeof loadKingdom === 'function' ? loadKingdom() : { founded:[] };
    return (kg.founded||[]).find(x=>x.id===kingdomId) || null;
  } catch(e) { return null; }
}
window.getKingdomStats = getKingdomStats;

window.buildKingdom     = buildKingdom;

window.upgradeKingdom   = upgradeKingdom;

window.collectTax       = collectTax;

window.expandTerritory  = expandTerritory;

window.getKingdomStats  = getKingdomStats;
