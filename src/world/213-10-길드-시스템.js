// [10] 길드 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
//
// [17차 감사 FIX — 제거] 이 파일의 loadGuild/saveGuild/getGuildMission은
// 구버전 길드 시스템의 흔적이다. saveGuild()를 호출하는 곳이 코드베이스
// 어디에도 없어 loadGuild()가 항상 null을 반환했고, 유일한 소비처였던
// misc/221의 BLS 힌트도 그래서 항상 비어 있었다(같은 라운드에서 제거).
// 실제로 쓰이는 길드 시스템은 misc/326(GUILD_DEFS 5종 — 가입·탈퇴·
// 의뢰판·숙련도·자동승급·GS 처리·BLS 주입·UI 패널까지 완비)이며, 이
// 파일의 기능은 전부 그쪽으로 대체됐다. 자세한 경위는 PROGRESS-AI제거.md
// 17차 항목 참고.
