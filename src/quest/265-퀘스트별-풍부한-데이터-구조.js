// 퀘스트별 풍부한 데이터 구조
// Auto-extracted from taleforge.html (original section banner preserved above).

export function _pmQuestDefault(title) {
  return {
    title:         title || '',
    status:        'active',  // active|completed|failed
    addedTurn:     0,
    completedTurn: null,
    clues:         [],   // [{ turn, text }] 수집 단서 무제한
    keyMoments:    [],   // [{ turn, text }] 중요 순간 무제한
    playerChoices: [],   // [{ turn, choice, outcome }] 무제한
    npcsInvolved:  [],   // 관련 NPC 이름 배열
    location:      '',
    resolution:    '',   // 결말 요약
    desc:          '',
    nextHint:      '',   // AI가 매 턴 갱신하는 다음 단계 힌트
  };
}
window._pmQuestDefault = _pmQuestDefault;
