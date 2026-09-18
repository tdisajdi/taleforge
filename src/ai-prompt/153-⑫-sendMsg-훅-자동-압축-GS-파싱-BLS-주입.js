// ⑫ sendMsg 훅 — 자동 압축 + GS 파싱 + BLS 주입
// Auto-extracted from taleforge.html (original section banner preserved above).
//
// [버그 수정] 이 자리에 있던 hookMemDBSendMsg는 window.sendMsg를 감싸는
// 방식이라(다른 죽은 훅들과 동일한 원인) 한 번도 실행되지 않았다.
// GS 파싱 → 전체 DB 반영(processGSToAllDBs) 부분은 ai-prompt/148의
// 진짜 베이스 processGSBlock이 매 턴 이미 processGSToAllDBs(gs)를
// 호출하고 있어(quest/086이 window.processGSBlock(gs)를 명시 호출)
// 순수 중복이라 옮기지 않고 제거했다. 나머지(30턴 자동 압축, 상황별/
// 요약 BLS 주입, 전투 키워드 경험치 지급, 종교 특수 이벤트, 임무 귀환
// 체크)는 quest/086의 sendMsg() 안, 원래와 같은 순서(BLS 주입은 AI
// 호출 전, 나머지는 응답 후)로 네이티브 연결했다. giveSummonBattleExp/
// checkMissionReturns는 progression/089에도 동일한 죽은 코드가 있었는데
// 그쪽은 이 GS 필드 전용 정리(Task #68)에서 고유 로직만 남기고 정리해
// 이 파일이 유일한 살아있는 연결점이 된다.
