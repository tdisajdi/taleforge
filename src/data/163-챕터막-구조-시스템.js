// 챕터/막 구조 시스템 — data
// Pure data split out of misc/163-챕터막-구조-시스템.js (see generate.js).

export const CHAPTER_DEFINITIONS = [
  {
    id:1, title:'1장: 봉인의 균열',
    icon:'🌑',
    desc:'세계 곳곳에서 봉인석이 흔들린다. 당신은 처음으로 루프의 실체를 의심한다.',
    startCondition:'게임 시작',
    endCondition:'봉인석 첫 번째 파괴 또는 복원',
    keyEvents:['아르카누스 첫 만남','봉인석 발견','루프 최초 자각'],
    bgmMood:'mysterious',
  },
  {
    id:2, title:'2장: 세력의 균열',
    icon:'⚔️',
    desc:'세계의 파벌들이 봉인석을 두고 충돌하기 시작한다. 당신은 어느 편인가.',
    startCondition:'봉인석 파괴/복원 1회',
    endCondition:'파벌 전쟁 발발 또는 외교 협약 체결',
    keyEvents:['레오나르드와 갈등','파벌 전쟁 조짐','대륙간 외교 시작'],
    bgmMood:'tense',
  },
  {
    id:3, title:'3장: 어둠의 목소리',
    icon:'😈',
    desc:'아스모데우스가 직접 접촉한다. 그의 제안은... 틀리지 않다.',
    startCondition:'아스모데우스 첫 대면',
    endCondition:'아스모데우스와 결정적 선택',
    keyEvents:['아스모데우스 계약 제안','동료 배신 위기','감시자의 경고'],
    bgmMood:'dark',
  },
  {
    id:4, title:'4장: 기억의 무게',
    icon:'🔄',
    desc:'루프의 진실이 드러난다. 감시자는 무엇을 원하는가.',
    startCondition:'3회차 이상 또는 루프 자각',
    endCondition:'감시자와 첫 대화',
    keyEvents:['루프 기억 각성','봉인석 비밀 해독','아르카누스의 고백'],
    bgmMood:'revelation',
  },
  {
    id:5, title:'5장: 최후의 봉인',
    icon:'🌟',
    desc:'모든 것이 수렴한다. 루프를 끝낼 것인가, 아니면 계속할 것인가.',
    startCondition:'봉인석 7개 이상 처리',
    endCondition:'엔딩 달성',
    keyEvents:['마지막 봉인석','감시자와 최종 대면','엔딩 선택'],
    bgmMood:'epic',
  },
];
