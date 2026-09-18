# 시작 전 필독

이 프로젝트를 열면 **다른 무엇보다 먼저** `작업메모장.md`를 읽을 것.
`src/`나 `template.html`/`dist/taleforge.html`을 스캔하기 전에, 이
메모장으로 "지금까지 뭘 했고, 왜 했고, 뭐가 남았는지"부터 5분 안에
파악한다. 세션이 끊기거나(새 창, 새 대화) 컨텍스트가 요약되어도 이
파일 하나만 읽으면 바로 이어서 작업할 수 있어야 한다는 게 이 파일의
존재 이유다.

- 버그 수정의 상세 기술 내역(코드 diff, 검증 로그)은
  `PROGRESS-AI제거.md`에 있음 — `작업메모장.md`는 그걸 반복하지
  않고 요약·연결만 한다.
- `template.html`/`dist/taleforge.html` 안에도 레거시 변경 로그
  블록이 파일 최상단에 남아있지만 [11] 항목에서 갱신이 중단됐다.
  그 이후 모든 기록은 `작업메모장.md`에 있다 — 새 항목도 거기에
  추가할 것, 두 곳으로 쪼개지 말 것.
- **매 작업 라운드가 끝날 때마다 `작업메모장.md`에 새 항목을 반드시
  추가한다.** 완료된 항목은 대기열에서 지우고 로그로 옮긴다.

## 빌드/검증

```
cd /tmp/cmp52/taleforge-modular
node build.js                                              # dist/taleforge.html 생성
NODE_PATH=/opt/node22/lib/node_modules node tools/pw_final_regression.js   # 회귀 테스트
```
