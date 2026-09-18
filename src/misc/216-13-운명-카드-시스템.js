// [13] 운명 카드 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { FATE_CARD_DEFS } from '../data/216-13-운명-카드-시스템.js';
import { loadFateCard, saveFateCard } from '../progression/018-5170번-환생-누적-시스템.js';
import { toast } from '../utils.js';
import { saveSession } from './001-block0-preamble.js';
import { getPlayerMaxHp } from './054-이동수단-시스템.js';

window.FATE_CARD_DEFS = FATE_CARD_DEFS;

export function drawFateCard() {
  try {
    const fc = typeof loadFateCard === 'function' ? loadFateCard() : { cards:[], lastDraw:0 };
    fc.cards = fc.cards || [];
    // 쿨다운 10턴
    if ((S?.msgCount||0) - (fc.lastDraw||0) < 10) {
      toast('아직 운명의 카드를 뽑을 수 없습니다. (10턴 쿨다운)', 2000);
      return null;
    }
    // 가중치 뽑기
    const weights = { common:60, uncommon:25, rare:12, epic:3 };
    const roll = Math.random() * 100;
    let rarity = 'common';
    if (roll > 97) rarity = 'epic';
    else if (roll > 85) rarity = 'rare';
    else if (roll > 60) rarity = 'uncommon';
    const pool = FATE_CARD_DEFS.filter(c => c.rarity === rarity);
    const card = pool[Math.floor(Math.random() * pool.length)] || FATE_CARD_DEFS[0];
    fc.cards.push({ ...card, drawnAt: S?.msgCount||0 });
    fc.lastDraw = S?.msgCount || 0;
    if (typeof saveFateCard === 'function') saveFateCard(fc);
    applyFateCard(card);
    toast(`운명의 카드: ${card.name}! — ${card.desc}`, 4000, card);
    return card;
  } catch(e) { return null; }
}
window.drawFateCard = drawFateCard;

export function applyFateCard(card) {
  try {
    if (!card || !S?.stats) return;
    const e = card.effect || {};
    if (e.all) Object.keys(S.stats).forEach(k => { S.stats[k] = Math.min(999, (S.stats[k]||0)+e.all); });
    if (e.hp)   S.stats.hp   = Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999), Math.max(0, (S.stats.hp||100)+e.hp));
    // [버그 수정] FATE_CARD_DEFS의 effect가 lck/wis/sanity 키를 쓰는데
    // 실제 S.stats에는 이 키들이 존재하지 않는다(진짜 키는 luk/wil, sanity는
    // 아예 없음) — 예: "행운이 깃든다. 행운+15", "지혜가 깃든다. INT+10,
    // WIS+10", "무모한 행운. LCK+30, 정신력-10" 카드를 뽑아도 toast로는
    // 성공했다고 뜨지만 실제로는 S.stats.lck/wis/sanity라는 유령 속성만
    // 생성될 뿐 어떤 판정에도 반영되지 않던 완전 무효 버프였다.
    // lck→luk(행운), wis→per(통찰 — "지혜"는 항상 int와 짝지어 나오므로
    // int와 구분되는 실제 스탯인 per에 매핑), sanity→wil(의지 — 이
    // 코드베이스에서 "정신력"은 이미 quest/086의 키워드 판정기가 wil로
    // 매핑해둔 기존 관례를 따른다).
    if (e.lck)  S.stats.luk  = Math.min(999, (S.stats.luk||50)+e.lck);
    if (e.str)  S.stats.str  = Math.min(999, (S.stats.str||50)+e.str);
    if (e.int)  S.stats.int  = Math.min(999, (S.stats.int||50)+e.int);
    if (e.cha)  S.stats.cha  = Math.min(999, (S.stats.cha||50)+e.cha);
    if (e.wis)  S.stats.per  = Math.min(999, (S.stats.per||50)+e.wis);
    if (e.fath) S.stats.fath = Math.min(999, (S.stats.fath||50)+e.fath);
    if (e.sanity !== undefined) S.stats.wil = Math.min(999, Math.max(0, (S.stats.wil||50)+e.sanity));
    if (e.random) {
      const stats = ['str','agi','int','per','cha','luk'];
      const k = stats[Math.floor(Math.random()*stats.length)];
      const v = Math.floor(Math.random()*30) - 10;
      S.stats[k] = Math.min(999, Math.max(0, (S.stats[k]||50)+v));
    }
    if (typeof window.updateHeader === 'function') window.updateHeader();
    if (typeof saveSession === 'function') saveSession();
  } catch(e) {}
}
window.applyFateCard = applyFateCard;

export function getFateCardBLS() {
  try {
    const fc = typeof loadFateCard === 'function' ? loadFateCard() : { cards:[] };
    const recent = (fc.cards||[]).slice(-3).map(c=>`${c.icon}${c.name}`).join(', ');
    return recent ? `\n[🎴 최근 운명 카드] ${recent}` : '';
  } catch(e) { return ''; }
}
window.getFateCardBLS = getFateCardBLS;

window.drawFateCard   = drawFateCard;

window.applyFateCard  = applyFateCard;

window.getFateCardBLS = getFateCardBLS;
