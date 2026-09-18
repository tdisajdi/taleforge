// NPC별 풍부한 데이터 구조
// Auto-extracted from taleforge.html (original section banner preserved above).

export function _pmNpcDefault() {
  return {
    rel:          50,
    relHistory:   [],   // [{ turn, from, to, reason }] 무제한
    conversations:[],   // [{ turn, topic, playerSaid, npcReacted, emotion }] 무제한
    secrets:      [],   // [{ turn, text }] 무제한
    promises:     [],   // [{ turn, text, fulfilled:null|true|false }] 무제한
    betrayals:    [],   // [{ turn, text }] 무제한
    favors:       [],   // [{ turn, text }] 플레이어가 도운 일 무제한
    grudges:      [],   // [{ turn, text }] 적대 원인 무제한
    emotionTag:   '중립',
    personality:  '',
    role:         '',
    lastSeenTurn: 0,
    firstMetTurn: 0,
    firstMetLoc:  '',
    // ★ 대화 학습 시스템 (설계 문서 파일 최상단 참조)
    topicSummary: {},   // { [주제]: { summary, count, lastTurn } } NPC당 주제 무제한, 영구 보존
    topicCount:   {},   // { [주제]: number } 대화 횟수 카운터
    triggers:     [],   // [{ topic, threshold, rel, action, target, fired }] 트리거 조건
  };
}
window._pmNpcDefault = _pmNpcDefault;
