// ⑥ 🩸 혈통 각성 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
//
// [18차 감사 FIX — 제거] 이 파일의 getBloodlineBLS()는 job/130의 진짜
// 구현(loadBL()/summon_124 V2 저장소 기반, __tfDeferred_111)을 완전히
// 덮어쓰는 별개의 구버전 구현이었다. main.js의 deferred 실행 순서상
// job/130(__tfDeferred_111)이 먼저 실행돼 window.getBloodlineBLS를
// 올바르게 설정하지만, 바로 뒤이어 이 파일(__tfDeferred_281)이 그
// 원본을 전혀 보존하지 않고(job/130처럼 _origGetBloodlineBLS를 캡처해
// 폴백하는 방식이 아님) window.getBloodlineBLS를 통째로 재할당했다.
// 게다가 이 구현은 misc/015의 loadBloodline()(레이스별 플레이 횟수를
// {종족명:횟수}로 저장하는 완전히 다른 저장소)을 읽어 bl.type을
// 찾으려 했는데, 그 저장소엔 애초에 .type 필드가 존재한 적이 없다.
// 결과적으로 매 턴 AI 시스템 프롬프트에
// "[🩸 숨겨진 혈통: undefined] undefined — 각성 조건: undefined" 같은
// 쓰레기 텍스트가 실제로 주입되고 있었다 — 이 세션 다른 "죽어서
// 조용히 아무 일도 안 하는" 버그들과 달리, 이건 게임이 나온 이래
// 매 턴 AI 프롬프트를 실제로 오염시키던 활성 버그였다. 자세한 경위는
// PROGRESS-AI제거.md 18차 항목 참고.
//
// main.js가 이 이름으로 import+호출하므로 빈 함수로 남겨둔다.
export function __tfDeferred_281(){}

