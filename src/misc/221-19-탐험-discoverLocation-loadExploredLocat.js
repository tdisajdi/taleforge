// [19] 탐험 — discoverLocation / loadExploredLocations
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { EVO_STAGES } from '../data/206-3-진화Evolution-시스템.js';
import { ROMANCE_STAGES } from '../data/211-8-로맨스-시스템.js';
import { getItemBLS, getSoulWeaponBLS } from '../items/218-15-인벤토리-addItem-removeItem.js';
import { loadSkills } from '../job/002-스킬-시스템.js';
import { checkSkillEvolution2 } from '../job/207-4-스킬-시스템.js';
import { loadRomance } from '../npc/211-8-로맨스-시스템.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { getLoopBLS } from '../progression/220-18-회차루프-시스템.js';
import { loadKingdom } from '../race/028-악마족-진명-시스템-Demon-True-Name.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { getFactionBLS } from '../world/219-17-세력-명성-변경-상태-조회.js';
import { getEvoStage, isEvoJob, loadEvolution } from './206-3-진화Evolution-시스템.js';
import { getFateCardBLS } from './216-13-운명-카드-시스템.js';

export const EXPLORED_KEY = 'tf-explored-locations';

export function loadExploredLocations() {
  try { return JSON.parse(lsGet(EXPLORED_KEY) || '[]'); } catch(e) { return []; }
}
window.loadExploredLocations = loadExploredLocations;

export function saveExploredLocations(arr) {
  try { lsSet(EXPLORED_KEY, JSON.stringify(arr)); } catch(e) {}
}
window.saveExploredLocations = saveExploredLocations;

export function discoverLocation(id, name) {
  try {
    // [17차 감사 FIX] 원래 시그니처는 객체 하나(locData)를 받는 형태였는데
    // 실제 두 호출부(quest/086, ai-prompt/222) 모두 (id, name) 두 개의
    // 문자열을 넘기고 있었다 — 즉 locData가 항상 문자열이었고, `{...locData}`가
    // 문자열을 인덱스별 문자로 스프레드해(id/name 프로퍼티 없이) 저장했다.
    // 그 결과 ai-prompt/077의 "자리 비운 장소 변화" 기능이 `v.id===curLoc.id`로
    // 절대 매칭되지 않아 항상 비활성 상태였다. 실제 호출 형태에 맞춰
    // (id, name)을 직접 받아 올바른 {id, name} 객체를 구성한다.
    if (!id) return;
    const locName = name || id;
    const explored = loadExploredLocations();
    if (!explored.find(x => x.id === id)) {
      explored.push({ id, name: locName, discoveredAt: S?.msgCount||0, turn: S?.msgCount||0 });
      saveExploredLocations(explored);
      toast(`🗺️ 새 장소 발견: ${locName}`, 2500);
      // [BUG7 FIX] 탐험 업적 ID 수정 (first_turn → first_explore)
      unlockAchievement('first_explore');
    }
  } catch(e) {}
}
window.discoverLocation = discoverLocation;

window.loadExploredLocations  = loadExploredLocations;

window.saveExploredLocations  = saveExploredLocations;

window.discoverLocation       = discoverLocation;

window._blsExtraParts = window._blsExtraParts || [];

(function hookV50ToBLS() {
  const tryHook = () => {
    const fn = typeof window.buildLightSystem === 'function' ? 'buildLightSystem' : null;
    if (!fn) { setTimeout(tryHook, 4000); return; }
    if (window._v50BLSHooked) return;
    window._v50BLSHooked = true;
    const orig = window[fn];
    window[fn] = function() {
      const base = orig.apply(this, arguments);
      if (typeof base !== 'string') return base;
      try {
        const parts = [];
        // 진화 상태
        if (typeof isEvoJob === 'function' && isEvoJob()) {
          try {
            const evo = loadEvolution();
            const stage = getEvoStage();
            const next = EVO_STAGES[evo.stage+1];
            const pct = next ? Math.floor((evo.energy/next.energy)*100) : 100;
            parts.push(`\n[⚡ 진화] ${stage.icon}${stage.name} (다음 진화까지 ${pct}%)`);
          } catch(e2) {}
        }
        // 소울웨폰
        try { const swBLS = getSoulWeaponBLS(); if (swBLS) parts.push(swBLS); } catch(e2) {}
        // 운명 카드
        try { const fcBLS = getFateCardBLS(); if (fcBLS) parts.push(fcBLS); } catch(e2) {}
        // 세력 명성
        try { const facBLS = getFactionBLS(); if (facBLS) parts.push(facBLS); } catch(e2) {}
        // 인벤토리 주요 아이템
        try { const invBLS = getItemBLS(); if (invBLS) parts.push(invBLS); } catch(e2) {}
        // 루프 기록
        try { const loopBLS = getLoopBLS(); if (loopBLS) parts.push(loopBLS); } catch(e2) {}
        // [17차 감사 FIX — 제거] getBloodlineEffect()(summon/215)는 이 세션
        // 16차에서 고친 "진짜" 혈통 시스템(summon/124 autoAssignBloodline+
        // loadBL/BL_V2_KEY)과 완전히 별개인 구버전 시스템이었다 —
        // checkBloodlineAwaken() 호출부가 없어 activateBloodline()이 실행된
        // 적이 없으므로 이 힌트도 항상 빈 값이었다. 설령 채워졌더라도
        // 문제였을 것: V2 시스템은 혈통을 "AI 전용 정보, 플레이어에게 직접
        // 알리지 말 것"으로 설계해 매 턴 은근히 암시만 하는데(summon/124),
        // 이 구버전 힌트는 "[🩸 혈통] 이름 — 설명"을 매 턴 대놓고 드러내는
        // 정반대 방식이라 두 시스템을 동시에 살렸다면 서로 모순되는
        // AI 지시가 됐을 것. 그래서 연결하지 않고 삭제한다.
        // 로맨스 (관계 깊은 NPC)
        try {
          const rom = typeof loadRomance === 'function' ? loadRomance() : {};
          const romLines = Object.entries(rom).filter(([,r])=>r.stage>=3)
            .map(([name,r])=>`${ROMANCE_STAGES[r.stage]?.icon||'💕'}${name}(${ROMANCE_STAGES[r.stage]?.name||''})`);
          if (romLines.length) parts.push(`\n[💕 인연] ${romLines.join(', ')}`);
        } catch(e2) {}
        // 왕국
        try {
          const kg = typeof loadKingdom === 'function' ? loadKingdom() : null;
          if (kg?.founded?.length) {
            const k = kg.founded[0];
            parts.push(`\n[🏰 왕국] ${k.name} — 인구:${k.population} 재정:${k.treasury} 영토:${k.territory}`);
          }
        } catch(e2) {}
        // [17차 감사 FIX — 제거] world/213의 loadGuild()/saveGuild()는 완전히
        // 별개인 구버전 길드 시스템의 흔적으로, saveGuild()를 호출하는 곳이
        // 코드베이스 어디에도 없어 loadGuild()가 항상 null을 반환하는 죽은
        // 데이터 소스였다(그래서 이 힌트도 절대 안 뜸). 실제로 쓰이는 길드
        // 시스템은 misc/326(GUILD_DEFS 5종 — 가입/의뢰판/숙련도/BLS까지
        // 완비)이고, 그쪽은 이미 자체 hookGuildToBLS로 buildLightSystem에
        // 직접 주입 중이라 이 블록은 삭제해도 기능 손실이 없다.

        // [BUG17 FIX] autoSummarize는 비동기 사이드이펙트이므로 setTimeout으로 분리
        // [수정] buildLightSystem 내부에서 부작용 함수 호출 제거 → sendMsg 처리 후 별도 호출
        // checkQuestCompletion, checkAchievements는 sendMsg 흐름에서 processGSBlock이 처리

        // 스킬 진화 체크
        try {
          const sk = typeof loadSkills === 'function' ? loadSkills() : {};
          Object.keys(sk).forEach(id => { try { checkSkillEvolution2(id); } catch(e3) {} });
        } catch(e2) {}

        // [BUG2 FIX] 다른 훅이 _blsExtraParts에 추가한 내용 합치기
        const extraFromHooks = (window._blsExtraParts||[]).join('');
        window._blsExtraParts = []; // 사용 후 초기화
        return base + parts.join('') + extraFromHooks;
      } catch(e) { return base; }
    };
  };
  setTimeout(tryHook, 5000);
})();
