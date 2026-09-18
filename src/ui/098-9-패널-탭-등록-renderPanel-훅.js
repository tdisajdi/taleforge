// 9. 패널 탭 등록 (renderPanel 훅)
// Auto-extracted from taleforge.html (original section banner preserved above).

// [버그 수정] 이 자리에 있던 hookReligionPanel은 window.renderPanel을
// 감싸는 방식이었다. renderPanel의 실제 호출부(quest/086의 openP)가 이
// 파일에 로컬 선언된 renderPanel을 bare로 직접 호출해 이 감싸기가 절대
// 적용되지 못했다(다른 죽은 훅들과 동일한 원인) — '⛪ 종교' 메뉴 버튼을
// 눌러도 패널이 빈 화면으로 열리던 실제 버그였다. quest/086의 진짜
// renderPanel(name) switch 안에 'religion' 케이스를 직접 추가해 고쳤다.
