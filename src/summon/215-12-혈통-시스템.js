// [12] 혈통 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
//
// [17차 감사 FIX — 제거] activateBloodline/getBloodlineEffect/
// checkBloodlineAwaken은 드래곤/천족/악마/언데드 4종만 다루는 구버전
// 혈통 시스템이었다. checkBloodlineAwaken() 호출부가 코드베이스 어디에도
// 없어 activateBloodline()이 실행된 적이 없고(그래서 이 시스템의 유일한
// 소비처였던 misc/221의 BLS 힌트도 항상 비어 있었다 — 같은 라운드에서
// 제거), 설령 연결했더라도 이 세션 16차에서 고친 진짜 혈통 시스템
// (summon/124 autoAssignBloodline — 8종 이상, "AI 전용 정보, 플레이어에게
// 직접 알리지 말 것" 설계)과 정반대로 "[🩸 혈통] 이름 — 설명"을 매 턴
// 대놓고 드러내는 방식이라 두 시스템을 동시에 살리면 서로 모순되는 AI
// 지시가 됐을 것이다. 저장 키도 misc/015의 loadBloodline()이 읽는 키
// (taleforge-bloodline)와 activateBloodline()이 쓰는 키(tf-bloodline)가
// 서로 달라 자체적으로도 로드/세이브가 어긋나 있었다. 자세한 경위는
// PROGRESS-AI제거.md 17차 항목 참고.
