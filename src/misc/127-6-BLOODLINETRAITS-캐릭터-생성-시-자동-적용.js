// 6. BLOODLINE_TRAITS — 캐릭터 생성 시 자동 적용
// Auto-extracted from taleforge.html (original section banner preserved above).
import { BLOODLINE_TRAITS } from '../data/017-4150번-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { recordBloodlineTrait } from './017-4150번-시스템.js';

export function applyBloodlineTraits(){
  const char = S.character;
  if(!char) return;

  const race     = char.race||'인간';
  const role     = (char.role||char.job||char.jobId||'').toLowerCase();
  const bg       = (char.background||char.desc||char.origin||'').toLowerCase();
  const scenario = char.scenario||'';

  // ── 종족·직업·배경 기반 자동 추론 ──────────────────────────
  // 플레이어에게 절대 알리지 않음. AI 서사에만 미묘하게 반영.
  let traitId = char.bloodlineTrait||char.familyTrait||null;

  if(!traitId && typeof BLOODLINE_TRAITS!=='undefined'){
    // 1순위: 종족 전용
    const racial = BLOODLINE_TRAITS.filter(t=>t.races&&t.races.includes(race));
    if(racial.length){
      traitId = racial[Math.floor(Math.random()*racial.length)].id;
    } else {
      // 2순위: 직업·배경 추론
      const combined = role+' '+bg;
      if(/warrior|fighter|soldier|knight|전사|기사|군인|용병|검사|무사|무인|노예.*전투|전투.*노예/.test(combined))
        traitId='warrior';
      else if(/mage|wizard|sorcerer|마법|주술|마도|술사|현자/.test(combined))
        traitId='mage';
      else if(/healer|cleric|priest|치유|성직|사제|수도|신관|수녀/.test(combined))
        traitId='healer';
      else if(/rogue|thief|assassin|도적|암살|첩자|그림자|도둑|스파이/.test(combined))
        traitId='rogue';
      else if(/merchant|trader|상인|교역|장사|행상|무역/.test(combined))
        traitId='merchant';
      else if(/wanderer|explorer|방랑|탐험|여행자|떠돌이/.test(combined))
        traitId='wanderer';
      // 3순위: 완전 랜덤 (노예처럼 배경이 불명확할 때)
      else {
        const fallback = BLOODLINE_TRAITS.filter(t=>!t.races);
        traitId = fallback[Math.floor(Math.random()*fallback.length)]?.id||'wanderer';
      }
    }
  }

  const tdef = typeof BLOODLINE_TRAITS!=='undefined'
    ? BLOODLINE_TRAITS.find(t=>t.id===traitId) : null;
  if(!tdef) return;

  // 스탯 보너스 — 조용히 적용 (토스트 없음, 알림 없음)
  if(S.stats){
    Object.entries(tdef.stats||{}).forEach(([k,v])=>{
      if(S.stats[k]!==undefined) S.stats[k]=Math.min(999,(S.stats[k]||0)+v);
    });
  }

  if(typeof recordBloodlineTrait==='function')
    recordBloodlineTrait(traitId,'이름 없는 가문',scenario);

  // AI에게만 전달 — 서사 암시 힌트
  const SUBTLE_HINTS = {
    warrior:      '이 캐릭터는 싸우는 방식이 훈련보다 훨씬 자연스럽다. 대대로 전장을 누빈 피의 흔적. 전투 본능이나 반사신경으로 은근히 드러날 것.',
    mage:         '마법을 배운 적 없어도 마법적 현상에 이상하게 잘 반응한다. 마법 유물이나 주문에 미묘하게 반응하는 것으로 암시할 것.',
    noble:        '태도나 말투에 가르치지 않아도 몸에 밴 무언가가 있다. 무너진 혈통의 흔적. NPC가 어딘가 고귀한 느낌을 받는 것으로만 암시할 것.',
    rogue:        '어둠 속에서 몸이 자연스럽게 숨는다. 그림자나 좁은 통로에서 특별한 편안함을 느끼는 것으로 암시할 것.',
    healer:       '손이 닿으면 상처가 조금 더 빨리 낫는 것 같다. 아픈 자에게 본능적으로 끌리는 것으로 암시할 것.',
    merchant:     '물건의 가치를 직관적으로 파악한다. 흥정 순간에 이상하게 유리한 감각이 작동하는 것으로 암시할 것.',
    wanderer:     '처음 가는 길에서도 묘하게 방향을 잘 잡는다. 낯선 땅에서 빠르게 적응하는 것으로 암시할 것.',
    elder_clan:   '고대 마법에 반응하거나 오래된 장소에서 기억 조각을 감지하는 것으로 암시할 것.',
    forge_clan:   '금속을 만질 때 그 역사와 강도를 직관적으로 파악하는 것으로 암시할 것.',
    war_clan:     '전투 직전 심장 박동이 느려지고 시야가 선명해지는 것으로 암시할 것.',
    shadow_clan:  '어둠 속에서 다른 이들이 못 보는 것이 보이는 것으로 암시할 것.',
    holy_lineage: '축복이나 기도 시 주변에 희미한 빛이 감지되는 것으로 암시할 것.',
    elder_dragon: '오래된 용의 유물이나 흔적에 이상하게 반응하는 것으로 암시할 것.',
    pact_bloodline:'계약이나 약속의 순간 상대방 의도가 투명하게 보이는 것으로 암시할 것.',
    ancient_dead: '죽은 자의 기운이 있는 장소에서 특이한 평온함을 느끼는 것으로 암시할 것.',
  };

  const hint = SUBTLE_HINTS[traitId]
    ||'이 캐릭터 피에 특별한 무언가가 흐른다. 직접 말하지 말고 자연스러운 행동과 반응으로만 암시할 것.';

  S._nextInjectedContext = (S._nextInjectedContext||'')
    +`
[🩸 가문 혈통 — AI 전용, 절대 직접 언급 금지]
${hint}`;

  console.log(`[BloodlineTrait] ${tdef.label} 자동배정 (${race}/${role||'미상'})`);
}
window.applyBloodlineTraits = applyBloodlineTraits;

window.applyBloodlineTraits = applyBloodlineTraits;
