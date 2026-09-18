// 기본 구조 — data
// Pure data split out of misc/266-기본-구조.js (see generate.js).

export var PM_DEFAULT = {
  npc: {
    // { [npcName]: _pmNpcDefault() }
    // NPC별로 독립 객체, 하나의 JSON에 저장
  },
  world: {
    events:       [],   // [{ turn, text, type }] 무제한
    rumors:       [],   // [{ turn, text, source }] 무제한
    factions:     {},   // { [name]: { relation, keyEvents:[] } }
    discoveries:  [],   // [{ turn, text }] 중요 발견 무제한
  },
  quest: {
    // { [questId]: _pmQuestDefault() }
    // 퀘스트별로 독립 객체
    _activeIds:    [],   // 현재 활성 퀘스트 ID 목록 (빠른 조회용)
    _completedIds: [],
    _failedIds:    [],
    _mainProgress: '',
  },
  demesne: {
    name:       '',
    tier:       0,
    population: 0,
    status:     '',
    keyEvents:  [],   // [{ turn, text }] 최대 12
    decisions:  [],   // [{ turn, text, outcome }] 최대 10
    vassals:    [],
    threats:    [],   // [{ turn, text }] 위협 기록 최대 5
  },
  personal: {
    goals:          [],   // [{ text, addedTurn, done }]
    injuries:       [],   // [{ turn, text, healed }]
    traumas:        [],   // [{ turn, text }]
    bonds:          [],   // [{ name, desc, turn }] 소중한 인연
    regrets:        [],   // [{ turn, text }]
    achievements:   [],   // [{ turn, text }]
    emotionHistory: [],   // [{ turn, emotion, context }] 최대 10
    skills:         [],   // [{ turn, text }] 익힌 능력
    scars:          [],   // [{ turn, text }] 영구적 변화
  },
  choices: {
    major:    [],         // [{ turn, choice, consequence, effect, questId }] 무제한
    karma:    { good:0, evil:0, wise:0 },
    patterns: [],         // 행동 패턴 태그
    pivotal:  [],         // [{ turn, text }] 운명을 바꾼 선택 무제한
  },
};
window.PM_DEFAULT = PM_DEFAULT;
