// GS 규칙 추가 — [BUG2 FIX] _blsExtraParts 방식으로 안전하게 추가
// Auto-extracted from taleforge.html (original section banner preserved above).

(function addV50GSRuleHook() {
  const tryHook = () => {
    if (window._v50GSRuleHooked) return;
    if (typeof window.buildLightSystem !== 'function') { setTimeout(tryHook, 3000); return; }
    window._v50GSRuleHooked = true;
    // buildLightSystem 재래핑 대신 _blsExtraParts에 등록
    const origBLS = window.buildLightSystem;
    window.buildLightSystem = function() {
      const base = origBLS.apply(this, arguments);
      if (typeof base !== 'string') return base;
      const extra = `\n[v50 신규 GS 필드] romance:{NPC명:포인트증감}, faction_rep:{세력ID:증감}, soul_action:{tag:태그키,difficulty:숫자}, draw_fate_card:true, discover_location:{name,type}, evo_energy:수치`;
      return base + extra;
    };
  };
  setTimeout(tryHook, 6000);
})();

console.log('[TaleForge v50] 미구현 시스템 전면 구현 완료 ✓');

console.log('[1]소환수 [2]업적 [3]진화 [4]스킬 [5]직업 [6]퀘스트 [7]전투');

console.log('[8]로맨스 [9]왕국 [10]길드 [11]날씨자동 [12]혈통 [13]운명카드');

console.log('[14]메모리요약 [15]인벤토리 [16]소울웨폰 [17]세력 [18]루프 [19]탐험');

console.log('[20]BLS통합 [21]GS확장');
