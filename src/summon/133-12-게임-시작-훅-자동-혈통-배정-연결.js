// 12. 게임 시작 훅 — 자동 혈통 배정 연결
// Auto-extracted from taleforge.html (original section banner preserved above).
//
// [15차 감사 FIX — 제거] 이 파일이 하려던 일(캐릭터 생성 완료 시
// autoAssignBloodline+applyBloodlineTraits 실행)은 quest/086의 진짜
// doStartChat() 함수 본문 안으로 직접 옮겼다 — window.doStartChat을
// 감싸는 이 방식은 실제 호출부(core/084)가 bare 식별자로 doStartChat을
// 직접 부르는 구조라 한 번도 실행된 적이 없었다(혈통 시스템 전체가
// 시작 배정 없이 영원히 비활성 상태였던 원인). 자세한 경위는
// PROGRESS-AI제거.md 15차 항목 참고.
