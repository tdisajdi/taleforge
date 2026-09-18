// block20-preamble
// Auto-extracted from taleforge.html (original section banner preserved above).
import { SKILL_ENHANCE_TIERS } from '../data/010-스킬-강화-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { getSkillEnhanceLevel } from '../job/010-스킬-강화-시스템.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { getAllSkillDefs } from './009-레벨업-스탯-포인트-배분-시스템.js';

(function(){

// ── 장소 타입 판정: 현재 위치에서 "무덤/사냥터/던전" 등 카테고리 추출 ──
function getLocationCategory(){
  try{
    const loc = typeof loadCurrentLocation==='function' ? loadCurrentLocation() : null;
    if(!loc) return 'default';
    const text = ((loc.name||'')+' '+(loc.desc||'')).toLowerCase();
    if(/무덤|묘지|묘역|공동묘지|납골당/.test(text)) return 'graveyard';
    if(/던전|지하\s*감옥|미궁/.test(text)) return 'dungeon';
    if(/전장|격전지|전쟁터/.test(text)) return 'battlefield';
    if(loc.type==='dungeon') return 'dungeon';
    return 'default';
  }catch(e){ return 'default'; }
}
window.getLocationCategory = getLocationCategory;

// ── 현재 장소의 던전 등급(dungeonTier, 1~4) — 없으면 1 ──
function getLocationDungeonTier(){
  try{
    const loc = typeof loadCurrentLocation==='function' ? loadCurrentLocation() : null;
    return (loc && loc.dungeonTier) || 1;
  }catch(e){ return 1; }
}
window.getLocationDungeonTier = getLocationDungeonTier;

// ── 스킬 강화 레벨(0~5) 조회 — 기존 getSkillEnhanceLevel/SKILL_ENHANCE_TIERS를
//    그대로 재사용한다. 별도 저장소를 새로 만들지 않고 이미 있는 강화
//    시스템(taleforge-skill-enhance)과 완전히 동일한 데이터를 본다. ──
function getSkillLevel(skillId){
  try{
    if(typeof getSkillEnhanceLevel==='function') return getSkillEnhanceLevel(skillId); // 0~5
    return 0;
  }catch(e){ return 0; }
}
window.getSkillLevel = getSkillLevel;

// ── 레벨 배율 계산 — 기존 SKILL_ENHANCE_TIERS의 실제 보너스 비율(레벨당
//    +15%/+30%/+50%/+75%/+100%)을 그대로 가져와 곱한다. 스킬 정의의
//    levelScaling은 이제 이 배율표가 없을 때의 안전한 폴백으로만 쓰인다. ──
function getLevelMultiplier(skillId, effects){
  const lv = getSkillLevel(skillId); // 0(미강화)~5
  if(lv > 0 && typeof SKILL_ENHANCE_TIERS!=='undefined' && SKILL_ENHANCE_TIERS[lv-1]){
    return 1 + SKILL_ENHANCE_TIERS[lv-1].bonus;
  }
  // 폴백: 강화 시스템을 못 찾을 때만 스킬 정의의 levelScaling으로 대체 계산
  const scaling = (effects && effects.levelScaling!=null) ? effects.levelScaling : 0.15;
  return 1 + Math.max(0, lv-1)*scaling;
}
window.getLevelMultiplier = getLevelMultiplier;

// ── 핵심: 스킬 발동 시 로컬 규칙으로 정확한 결과를 계산한다 ──
// target: 로컬 전투 중이면 대상 유닛 객체(옵션), 없으면 일반 스탯 효과만 계산
function resolveSkillEffect(skillId, target){
  const allDefs = typeof getAllSkillDefs==='function' ? getAllSkillDefs() : [];
  const def = allDefs.find(s=>s.id===skillId);
  if(!def || !def.effects) return null;
  const eff = def.effects;
  const mult = getLevelMultiplier(skillId, eff);
  const lv = getSkillLevel(skillId);

  const result = { kind:eff.kind, skillId, skillName:def.name, level:lv };

  switch(eff.kind){
    case 'damage': {
      // statSource — 스킬마다 정확한 스탯 계수를 지정할 수 있게 한다
      // (예: {"str":1} = 순수 힘 100%, {"str":0.5,"mgc":0.5} = 힘+마력
      // 각 50%씩 혼합, 롤 같은 게임의 AD/AP 계수 방식과 동일한 원리).
      // statSource가 없는 스킬(마이그레이션 안 된 레거시)은 기존처럼
      // str이 있으면 str, 없으면 mgc, 둘 다 없으면 50을 쓰는 폴백 유지.
      let baseAtk;
      if (eff.statSource && typeof eff.statSource === 'object') {
        baseAtk = 0;
        for (const [statKey, ratio] of Object.entries(eff.statSource)) {
          baseAtk += (S?.stats?.[statKey] || 0) * (ratio || 0);
        }
        if (baseAtk <= 0) baseAtk = 50; // 안전망(스탯이 전부 0인 극단 상황)
      } else {
        baseAtk = (S?.stats?.str||S?.stats?.mgc||50);
      }
      const dmg = Math.round(baseAtk * (eff.damageMult||1) * mult);
      result.damage = dmg;
      result.hits = eff.hits||1;
      result.element = eff.element||'physical';
      // lifesteal — 흡혈류 스킬(뱀파이어 등)이 "가한 피해의 N%만큼 자기
      // HP를 회복"하도록 지원. 0.3 = 준 피해의 30% 회복. hits가 여러 번인
      // 경우 총 피해(dmg*hits) 기준으로 계산한다.
      if (eff.lifesteal) {
        result.lifesteal = Math.round(dmg * result.hits * eff.lifesteal);
      }
      break;
    }
    case 'heal': {
      const maxHp = S?.stats?.maxHp||100;
      let heal = 0;
      if(eff.healPct) heal += Math.round(maxHp*eff.healPct*mult);
      if(eff.healAmount) heal += Math.round(eff.healAmount*mult);
      result.heal = heal;
      break;
    }
    case 'buff':
    case 'debuff': {
      const mod = {};
      for(const k in (eff.statMod||{})){
        mod[k] = Math.round(eff.statMod[k]*mult);
      }
      result.statMod = mod;
      result.duration = eff.duration||3;
      break;
    }
    case 'summon': {
      const locCat = getLocationCategory();
      const locBonus = (eff.countByLocation && eff.countByLocation[locCat]!=null)
        ? eff.countByLocation[locCat]
        : (eff.countByLocation ? (eff.countByLocation.default||0) : 0);
      let count = (eff.baseCount||1) + locBonus;
      const maxActive = eff.maxActive || 3;
      count = Math.max(0, Math.min(count, maxActive));

      // 소환수 스탯 산정 — 대상(되살릴 몬스터)의 등급이나 현재 장소의
      // 던전 등급(dungeonTier)에 비례해 결정한다.
      let statBase = 30; // 기본값(대상 정보 없을 때)
      if(eff.statScaling){
        if(eff.statScaling.source==='targetTier' && target){
          statBase = (target.maxHp || target.hp || 60) * 0.5;
        } else if(eff.statScaling.source==='locationTier'){
          statBase = 30 + getLocationDungeonTier()*20;
        }
        statBase *= (eff.statScaling.mult||1);
      }
      statBase *= mult; // 스킬 레벨 배율도 적용

      result.count = count;
      result.maxActive = maxActive;
      result.summonHp = Math.round(statBase*2);
      result.summonAtk = Math.round(statBase*0.4);
      result.summonDef = Math.round(statBase*0.15);
      result.locationCategory = locCat;
      break;
    }
    case 'statBoost': {
      const mod = {};
      for(const k in (eff.statMod||{})){
        mod[k] = Math.round(eff.statMod[k]*mult);
      }
      result.statMod = mod;
      break;
    }
    default:
      return null;
  }
  return result;
}
window.resolveSkillEffect = resolveSkillEffect;

console.log('[TaleForge] 스킬 효과 로컬 계산 엔진 v1 로드 완료 ✓');

})();

(function hookB80MissingSectionsToBLS(){
  const SECTION_FNS = [
    'getCaravanSection',
    'getFarmSection',
    'getFarmExtrasSection',
    'getGraveSection',
    'getGuildSection',
    'getVoyageSection',
    'getWorldMapSection',
    'getWorkshopSection',
    'getNetworkSection',
    // [18차 감사 FIX 추가] 아래 11개는 전부 ai-prompt/077의 죽은
    // buildSystem(2333줄, 실제 프롬프트 조립기인 buildLightSystem으로
    // 완전히 대체돼 호출부가 없음) 안에서만 호출되던 진짜 기능이었다 —
    // 죽은 함수가 아니라 각자 잘 만들어진 실제 서사 컨텍스트 생성기인데
    // 연결된 곳이 죽은 함수 하나뿐이라 전부 무용지물이었다. B80과 완전히
    // 동일한 원인·동일한 해법이라 같은 훅에 합류시킨다. (getContractSection은
    // B80 원래 목록에서도 빠져 있던 10번째 "섹션"이다.)
    'getContractSection',
    'getDynBestiarySection',
    'getFactionHistorySection',
    'getItemDissonanceSection',
    'getNpcAgendaSection',
    'getNpcGrudgeSection',
    'getRaceJobDissonanceSection',
    'getSocialRankNpcBLS',
    'getWorldFigureBLS',
    'getWorldLoreBLSContext',
    'getCabalBLSContext',
    // [19차 감사 FIX 추가] getRaceSpecialHint — 드래곤/악마/언데드/수인/
    // 원소/엘프/천족 7종족 전용 서사 힌트(newRaceHint) 체인. 이것도 역시
    // ai-prompt/077의 죽은 buildSystem 안에서만 참조되던 코드를 같은
    // 파일에 독립 함수로 추출한 것이라 완전히 동일한 원인·해법이다.
    'getRaceSpecialHint',
    // [20차 감사 FIX 추가] getHiddenJobBLS — 죽은 buildSystem 안의
    // hiddenJobSection은 매칭 조건(char.role===히든직업 name)이 애초에
    // 실제 해금 로직과 어긋나 있었고, buildSystem 자체도 죽어있어 이중으로
    // 죽어있었다. 56개 히든 직업의 systemHint(각성 시 약속된 서사적 개성)가
    // 게임 출시 이래 단 한 번도 AI에게 전달된 적이 없던 문제를 고쳤다.
    'getHiddenJobBLS',
    // [20차 감사 FIX 추가] getRomanceBLS — addRomancePoint는 GS 필드
    // "romance"로 매 턴 정상적으로 호감도를 쌓지만, 그 결과인 관계
    // 단계(안면/친구/호감/연인/영원한 인연)를 AI에게 전달하는 경로가
    // 전혀 없어 이미 연인 사이인 NPC를 계속 초면처럼 대하는 서사
    // 일관성 붕괴가 발생할 수 있었다.
    'getRomanceBLS',
    // [19차 감사 FIX 추가 — 최대 규모] getPastLifeLegacySection — 죽은
    // buildSystem 안에 번호가 매겨진 채(1~130번) 갇혀 있던 124개의 독립
    // "전생 유산" 서사 힌트 블록(원한 추적자/저주 계보/시간의 메아리/
    // 세계수 성장/꿈의 예언/유산 건축/감시자의 눈/영혼의 가면/유언장/
    // 별자리/평행세계 조우 등, 이미 완성된 113개 함수를 호출) 전체를
    // 하나의 함수로 추출했다. 이미 misc/330에 편입된 dynBestiarySection/
    // itemDissonanceSection/raceJobDissonanceSection 3개는 중복을 피해
    // 제외. 자세한 경위는 PROGRESS-AI제거.md 19차 항목 참고.
    'getPastLifeLegacySection',
    // [19차 감사 FIX 추가 — 2차 대형 구출] getSavedStateExpansionSection —
    // 같은 죽은 buildSystem 안의 "[v48] 저장 데이터 → BLS 전달 전면
    // 확장" 구간(A~K 18개 카테고리: 선택 이력/배신/트라우마/원한/
    // 라이벌/감정/루프 자각/메타 지식, 종족별 심화 시스템(엘프 망각·
    // 드워프 원한·오크 명예·다크링 공허·천계 서약·악마 계약·드래곤
    // 심장), NPC 성장/타락/영감, 퀘스트 선택/나비효과/인과관계, 세계·
    // 세력·왕국·전쟁·경제·종교, 성장·스킬·직업숙련·혈통, 회차·전생
    // 기록, 탐험 현황, 심리 상태, 장비·소지품, 예언·언어·별자리)를
    // 동일한 방식으로 추출했다. 자세한 경위는 PROGRESS-AI제거.md
    // 19차 항목 참고.
    'getSavedStateExpansionSection',
    // [19차 감사 FIX 추가 — 4번째 구출] getMiscOrphanSection — 앞선
    // 두 차례의 대형 구출 이후에도 남아있던 마지막 3개의 독립
    // orphaned 섹션(봉인석 정보/직업 조합 시너지/성장형 악당 위협).
    'getMiscOrphanSection',
  ];

  function tryPatch(){
    if (window._b80SectionsHooked) return;
    if (typeof window.buildLightSystem !== 'function') {
      setTimeout(tryPatch, 2000);
      return;
    }
    window._b80SectionsHooked = true;
    const _orig = window.buildLightSystem;
    window.buildLightSystem = function(...args){
      let result = _orig.apply(this, args);
      if (typeof result !== 'string') return result;
      for (const fnName of SECTION_FNS) {
        try {
          const fn = window[fnName];
          if (typeof fn === 'function') {
            const section = fn();
            if (section) result += section;
          }
        } catch (e) {
          // 개별 섹션 실패가 전체 프롬프트 생성을 막지 않도록 무시
        }
      }
      return result;
    };
  }
  setTimeout(tryPatch, 3000);
})();
