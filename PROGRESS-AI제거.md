# TaleForge — AI 의존성 제거 진행 상황

> 목표: 플레이어 입장에서는 API 키 없이도 게임이 완전히 돌아가도록,
> 라이브 AI 호출에 의존하는 부분을 하나씩 로컬(하드코딩) 방식으로 대체한다.
> 이 파일은 작업할 때마다 계속 갱신한다 — 새로 할 일이 보이면 추가하고,
> 끝낸 항목은 체크하고 완료 섹션으로 옮긴다.

---

## ✅ 완료

### (A) 전투 서술 로컬화 — 뼈대
- `misc/328-block18-preamble.js`에 지능(sapient/feral/mute)×무기(fang/blade/
  spear/bow/blunt/unarmed/magic) 조합 기반 로컬 서술 엔진 이식
  (`classifyCombatant`, `composeLocalAttackLine`, 문장 뱅크 일체)
- AI 미등록 몬스터(AI가 즉석 생성하는 이름 포함)도 키워드로 안전하게
  분류되도록 처리 — 몬스터 수가 아무리 늘어도 하드코딩 불필요
- 실제 호출부 5곳 전환/추가 완료 + 검증(문법체크, 빌드, 840문장 스모크 테스트):
  - [x] 플레이어 공격/협동/약점타격
  - [x] 동료 자동공격 (원래 서술 없었음 → 신규 추가)
  - [x] 스킬 사용 후 적 턴
  - [x] 지형필살 후 적 턴
  - [x] 메인 적 턴 (방어 50% 감소 보정 반영)

### (B) 전투 서술 로컬화 — 콘텐츠 1차 확장
- 무기 동작 문장: 7종 × 4개 → 10개
- 대사/음성 뱅크: 지능 3단계 × 톤 4개 × 2~5개 → 5~8개
- 결과 서술 뱅크: 상황 6종 × 3~5개 → 7~9개
- 신규: 분위기/여운 문장(`CB_ENV_BANK`, 카테고리별 20~35% 확률로만 덧붙음)
- 재검증 완료 (문법체크, 빌드, 840문장 스모크 테스트 — 마커 미치환/undefined 0건)

### 전투 서술 로컬화 — 나머지 4곳까지 전부 전환 (완전히 끝남)
- 지형필살 성공/실패, 도주 성공/실패, 스킬 사용(피해/회복/버프/소환 4종
  분기), 방어 — 각각 전용 로컬 문장 뱅크(`CB_TERRAIN_BANK`,
  `CB_FLEE_BANK`, `CB_SKILL_BANK`, `CB_DEFEND_BANK`)와 조합 함수
  (`composeTerrainLine`, `composeFleeLine`, `composeSkillLine`,
  `composeDefendLine`)를 새로 만들어 연결
- `requestCombatNarration`(AI 호출 함수)은 이제 파일 전체에서 어디서도
  호출되지 않음 — grep으로 확인 완료, 정의만 남고 완전히 죽은 코드
- 검증: 문법체크, 빌드, 450문장 스모크 테스트(신규 4개 함수) — 마커
  미치환/undefined 0건
- **→ 전투 서술에서 AI 의존성 완전 제거 완료**

### 동적 아이템 생성 로컬화 (`items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js`)
- 유일한 AI 호출 지점이던 `generateItemBatch` 내부의 `callGeminiDirect`
  제거 — `loadKeyIndex` API 키 게이트도 함께 제거(더 이상 키 필요 없음)
- 신규 로컬 아이템 생성 엔진 `generateLocalItem(context, slot, rarity)`:
  슬롯×희귀도 조합으로 이름(접두사+명사, 희귀도 40%로 "OOO의" 기원 수식어
  추가)/아이콘(명사와 쌍으로 묶어 불일치 방지)/능력치(슬롯별 스탯 풀 +
  희귀도별 개수·수치 범위)/설명/배경 서사(희귀도가 높을수록 1→3문장으로
  길어짐)를 전부 조합
- 기존 학습 캐시(`pickGeneratedObject`/`recordGeneratedObject` 버킷 재사용)
  구조는 그대로 유지 — 재사용으로 못 채운 나머지만 로컬 엔진이 채움
- 검증: 문법체크, 빌드, 슬롯 12종×희귀도 5단계×20회=1200개 아이템 생성
  테스트 — 마커 미치환/undefined/빈 이름/빈 효과/빈 로어/ID 중복 전부 0건,
  희귀도별 로어 문장 수 검증(공용/고급 1문장 → 희귀 2문장 → 영웅 2.57문장
  → 전설 3문장, 의도대로 상승)
- 아이콘-명사 쌍 불일치 버그 발견 즉시 수정(첫 테스트에서 "🏹 별빛의 철퇴"
  같은 조합 발견 → 쌍으로 묶는 구조로 교체 후 재검증)
- **→ 아이템 생성에서 AI 의존성 완전 제거 완료** (`grep`으로 이 파일에
  `callGemini`/`fetch`/`S.apiKeys` 등 AI 호출 관련 코드 0건 확인)

### 작은 flavor 시스템 2종 로컬화 (`misc/302` 꿈/환영, `misc/314` 이벤트 경매)
- **꿈/환영 시스템**: `triggerDream`의 `callGeminiDirect` 호출을 로컬
  조합(`composeLocalDream`)으로 교체 — 발생 사유(HP위기/저주/NPC사망/
  주기)에 따라 어울리는 꿈 유형(전생/신탁/예시)을 가중치로 고르고
  제목/장면/효과/선택지를 문장 뱅크에서 조합
  - **부가 발견**: 자동 발동이 `// API 한도 절약을 위해 비활성화`
    주석과 함께 이미 꺼져 있어서 이 시스템이 실제로는 한 번도 발동하지
    않던 죽은 기능이었음 확인 — 이제 AI 호출이 없으니 그 제약이 사라져
    자동 발동을 다시 켬(기능이 실질적으로 복구됨)
- **이벤트 경매 시스템**: `generateAuction`의 `callGeminiDirect` 호출을
  로컬 조합(`composeLocalAuction`)으로 교체 — 카테고리(유물/정보/토지/
  서비스/스킬)별 물품 뱅크에서 4개 무작위 선정, 희귀도 가중치 굴림,
  시작가는 희귀도 구간×보유 골드로 스케일. 기존 학습 캐시 재사용 구조는 유지
- 검증: 둘 다 문법체크 + 빌드 + 각 200개 생성 스모크 테스트 —
  undefined/빈 값/카테고리 중복 등 결함 0건
- **→ 두 시스템 모두 AI 의존성 완전 제거 완료**

### 연대기/백과사전/NPC아젠다 로컬화 + 죽은 기능 3개 복구
`misc/308-sendMsg-후처리-통합-훅.js`를 열어보니 이 세 기능이 전부 같은
후크에 걸려 있었고, 전부 `// API 한도 절약을 위해 비활성화` 주석과 함께
**꺼진 채 방치되어 있었다** — 즉 지금까지 실제로 한 번도 작동한 적 없는
기능들이었음.
- **자동 모험 연대기** (`misc/303`): `autoGenerateChronicle`의 AI 호출
  제거 → 최근 텍스트에서 6가지 분위기(긴장/평온/슬픔/환희/공포/경이)를
  키워드로 판정하고 분위기별 문장 뱅크에서 2문장 조합
- **세계 신화 백과사전** (`world/304`): `extractCodexTerms`의 AI 호출
  제거 → 판타지 접미어(신전/왕국/유물/전쟁/정령/주술 등)로 텍스트 속
  후보 단어를 찾고, 앞 단어와 묶어 "알테라 왕국"처럼 더 구체적인 용어로
  추출 + 카테고리별 설명 문장 조합 (순수 AI 발명이 아니라 텍스트에 실제
  등장한 단어라는 특성은 유지됨)
- **NPC 비밀 아젠다** (`npc/305`): `generateNpcAgenda`의 AI 호출 제거 →
  NPC role 키워드로 8가지 원형(상인/귀족/기사/사제/학자/도적/마법사/
  여관주인, 그 외 평민) 판정 후 원형별 비밀/두려움/목적/퀘스트제목 뱅크에서 조합
- 세 기능 모두 로컬화 완료 후 `misc/308`에서 **다시 켬** — 죽어있던
  기능이 실질적으로 복구됨
- 검증: 5개 파일 전부 문법체크 통과, 빌드 성공. 스모크 테스트 중
  실제 버그 2건 발견 즉시 수정:
  - 연대기 문장에 `{loc}을(를)` 리터럴 마커가 안 채워지고 그대로
    노출되던 버그 → `{loc:을를}` 조사 마커로 수정
  - 백과사전 추출기가 "왕국의"처럼 조사가 붙은 토큰을 접미어와
    매칭 못 해 후보를 0개만 찾던 버그 → 조사 제거 + 앞 단어 결합
    로직으로 재작성, 재검증 후 정상 추출 확인
- **→ 세 시스템 모두 AI 의존성 완전 제거 + 기능 복구 완료**

### 던전 탐험 시스템 로컬화 (`combat/256`) — 이번 배치 중 가장 큰 시스템
절차적 던전(E~S 6등급, 방 유형 7종, 보스/함정/보물/선택지/결과)을 통째로
로컬화. 데이터 파일(`data/257`)에 등급별로 이미 준비돼 있던 서술 톤
문장(atmosTone/enemyTone/trapTone/treasureTone/desc)을 그대로 재사용하는
방식으로 설계해, 등급이 늘어나도 새 문장을 안 써도 되게 함.
- **`generateDungeonRoom`**: 방 유형별(전투/함정/보물/성소/보스/빈방/
  미스터리) 제목·사건 문장 뱅크 + 등급별 몬스터 이름 뱅크 조합
- **`generateDungeonChoiceResult`**: 결과 수치(HP/골드/경험치/아이템 등급)는
  AI가 자유롭게 정하던 것을 전부 **결정론적 공식**(성공도×등급 배율×
  위험도)으로 대체 — 오히려 AI가 매번 다른 숫자를 즉흥적으로 정하던
  것보다 밸런스가 더 예측 가능해짐. 서술문만 스탯별 어투 뱅크(힘/민첩/
  마력)×결과등급(대성공/성공/실패/대실패) 조합
- 기존 학습 캐시(버킷 재사용) 구조 그대로 유지, 이변(등급 승격) 이벤트도
  로컬로 처리
- 검증: 문법체크, 빌드, 방 240개 + 결과 120개 생성 테스트 — undefined 0건,
  선택지 누락 0건. 테스트 중 실제 버그 발견 즉시 수정: B/A/S 등급에서
  같은 사건 문장이 중복으로 두 번 나오던 문제("정면에서 압도적인 기운이
  뿜어져 나왔다"가 연달아 두 번) → 이미 고른 문장 제외하고 재선택하도록 수정
- **→ 던전 탐험 시스템 AI 의존성 완전 제거 완료**

### NPC 유산 / 명장면 앨범 로컬화 (`patches/322`)
- **NPC 유산** (`generateNpcLegacy`): 사인(사망/작별) × 유산종류(아이템/
  스킬힌트/비밀/스탯) 뱅크 조합으로 교체
- **명장면 앨범** (`captureHallOfMemory`): `MOMENT_TRIGGERS`가 이미
  텍스트를 8가지 카테고리(전설적/감동/승리/인연/배신/각성/희생/첫경험)로
  분류해주므로, 그 카테고리에 맞는 문학적 한 문장을 뱅크에서 조합 —
  정확한 텍스트 요약은 아니지만 감지된 상황 카테고리에는 맞는 문장
- 검증: 문법체크, 빌드, 60+80개 생성 테스트 — undefined 0건
- **→ 두 시스템 모두 AI 의존성 완전 제거 완료**

### 세트 아이템 시스템의 개별 AI 아이템 생성 로컬화 (`items/006`)
`generateAIItem`이 `items/007`의 `generateItemBatch`와 거의 동일한 일을
하고 있었음 — 새 콘텐츠를 또 만드는 대신, 이미 검증된
`window.generateLocalItem`(items/007)을 그대로 재사용하도록 연결.
정적 import로 연결하면 006↔007 순환 참조가 생기므로, 이 코드베이스
전반에서 이미 쓰이는 방식대로 window 전역으로 연결(런타임에는 모든
모듈이 이미 로드된 뒤에만 호출되므로 안전).
- 슬롯 키 차이('ring' vs items/007의 'ring1') 매핑 처리 — 콘텐츠
  조회용으로만 변환하고, 반환값의 `item.slot`은 호출부 호환을 위해
  원래 요청값 유지
- 검증: 문법체크, 빌드, 200개 생성 시뮬레이션 테스트 — 결함 0건,
  slot 필드 보존 확인
- **→ AI 의존성 완전 제거 완료** (신규 콘텐츠 뱅크 작성 없이 재사용만으로 해결)

### 동적 퀘스트 생성 시스템 로컬화 (`job/087`)
`generateAIQuest` — S~D 5등급 상황 기반 퀘스트 생성 시스템. 발생 사유
(`contextType`: slave_escape/revenge/investigation/combat/rescue 등
13종)를 게임상 퀘스트 타입(전투/탐사/대화/수집/호위/미스터리/동행/
제작/탈출/생존 10종)으로 매핑하고, 타입별 제목·설명·완료/실패 키워드·
로어·연출힌트 뱅크를 등급별 긴장도 문구와 조합. 보상 골드/경험치는
등급별 범위 내 랜덤(원래도 결정론적 범위였음, 유지).
- API 키 게이트 완전 제거(더 이상 키 불필요)
- 검증: 문법체크, 빌드, 5등급×14가지 상황×10회=750개 생성 테스트 —
  undefined/빈 필드 0건, 상황→타입 매핑 정확성 확인
- **→ AI 의존성 완전 제거 완료**

### 캐릭터 생성 화면 3종 로컬화 (`core/084`)
- **이름 추천**(`generateAiNames`): 이미 있던 종족별 폴백 이름 목록(종족당
  10개, API 실패시에만 쓰이던 것)을 종족당 15개로 확장하고 상시 사용 —
  API 키 게이트 완전 제거
- **직업/성격/배경/말투 추천**(`_fetchAndCacheSugs`): 이미 있던
  `getFallbackSugs()` 큐레이션 풀(직업 10~14개, 성격/배경/말투 각 10개)을
  상시 사용하도록 전환, 5개→10개로 노출 개수 확대
- **직업 스킬 생성**(`genJobSkills`): 이미 있던 `makeFallbackSkills()`
  (공격/강타/집중/회피본능/인내/두번째바람/최후의저항 — active·passive·
  event 세 카테고리를 다 갖추고 실제 수치 effects까지 포함된 완결 세트)를
  상시 사용
- 세 기능 모두 **이미 만들어져 있던 폴백 콘텐츠를 상시 경로로 승격**하는
  방식이라 신규 콘텐츠 작성 부담이 거의 없었음
- 검증: 문법체크, 빌드, 이름뱅크 12종족×15개 무결성 테스트(중복 0건)
- **→ 캐릭터 생성 관련 AI 의존성 완전 제거 완료**

### 전직 트리 생성 시스템 로컬화 (`job/042` + `race/064`, 통합)
`generateNextJob`(수동 "✨ AI 직업 탐색" 버튼, job/042)과
`autoSuggestNextJob`(자동 트리거, race/064)이 사실 같은 전직 계보
풀(AI_JOB_POOL)을 공유하는 **같은 시스템의 두 진입점**이었음을 확인 —
job/042에 로컬 생성 엔진 `composeLocalNextJobs`를 한 번만 만들고
양쪽에서 재사용(두 파일은 이미 서로를 참조하는 순환 참조 관계라 이
프로젝트 전반의 기존 방식대로 안전하게 연결됨).
- 부모 직업의 category(전투/마법/은신/제작/사교/지원/특수)마다 4가지
  방향성 원형 템플릿을 두고 그 중 서로 다른 3개를 뽑아 "공격/방어/전략
  등 다양한 방향"이라는 원래 설계 의도 재현
- **실제 언락 조건 체크 로직을 직접 확인**한 결과, `requireQuest`/
  `requireItem`/`requireLocation` 같은 필드는 애초에 어디서도 검사되지
  않는 표시용 텍스트였고 `minStr`/`minMgc`/`minWil`/`minInt`/`minLuk`/
  `minFear`/`minFaith`만 실제로 체크됨을 확인 — 로컬 버전은 실제
  체크되는 스탯 조건만 부여해 존재하지도 않는 퀘스트/아이템 이름을
  지어내지 않음(오히려 원래보다 더 정직한 조건)
- **부수 발견 및 수정**: `generateNextJob`에 `currentTurns` 변수가
  파라미터로도 지역변수로도 선언되어 있지 않아, strict 모드 ES
  모듈에서 함수가 그 변수에 처음 닿는 순간(early-return 분기 포함)
  무조건 `ReferenceError`로 죽는 버그를 발견 — 즉 "✨ AI 직업 탐색"
  버튼이 AI 유무와 무관하게 **한 번도 작동한 적이 없었음**. race/064가
  쓰는 것과 같은 턴 카운터(`loadJobTurns`)로 채워 넣어 수정(버그 수정
  겸 기능 복구)
- 검증: 두 파일 문법체크, 빌드, 7개 카테고리×10회=210개 생성 테스트 —
  undefined/스킬 개수 오류/prereq 불일치/ID 중복 0건. 테스트로 발견한
  실제 버그 하나 더 수정: 심화 스킬 desc의 "[OO 선행]" 괄호 텍스트가
  실제 기초 스킬 이름과 다르게 매번 따로 뽑히던 문제 → 같은 이름을
  재사용하도록 수정 후 재검증
- **→ 전직 트리 생성에서 AI 의존성 완전 제거 완료**

### 예언/트라우마 시스템 로컬화 (`lore/301`, `lore/316`) + 죽은 기능 1개 복구
- **예언 시스템** (`generateProphecy`): 원래도 "모호하고 시적으로, 뒤틀린
  방식으로 실현될 수 있게"가 설계 의도였음에 착안 — 주제(죽음/선택/배신/
  영광/사랑/상실) 6종 × 시적 문장 4개씩 뱅크에서 매번 서로 다른 4개를 조합
  - **부가 발견**: `lore/309`(게임 시작 시 예언 자동 생성 훅)도 "API 한도
    절약"으로 비활성화된 채 방치돼 있었음 → AI 제거로 제약이 사라져 재활성화
- **심층 트라우마 시스템** (`addTraumaDeep`): 플레이어가 자유 입력한
  트라우마 텍스트를 키워드로 9가지 원형(화재/익사/감금/전쟁/폭력/배신/
  상실/실패/기타)으로 분류해 트리거·페널티·치유힌트 뱅크에서 조합 —
  입력한 단어가 반영된다는 특성은 유지
- 검증: 문법체크, 빌드, 예언 50세트+트라우마 9종 입력×5회 테스트 — 결함 0건.
  테스트 중 분류 정확도 문제 2건 발견 즉시 수정("갇혀"가 감금으로 안 잡히던
  것, "죽는"이 죽음으로 안 잡히던 것 — 정규식을 어간 매칭으로 완화)
- **→ 두 시스템 모두 AI 의존성 완전 제거 완료**

### NPC 대화 화제 요약 로컬화 (`npc/272`)
`pmSummarizeNpcTopic` — 실제 대화 내용을 정확히 요약하는 건 AI의
이해력이 필요해 똑같이는 못 하지만, 이미 로컬 키워드 분류기
(`classifyNpcTopic`, 원래도 AI 미사용)가 대화를 8가지 화제(무기/전투,
퀘스트/의뢰, 장소/지역, 정보/비밀, 거래/상점, 관계/감정, 역사/전설,
일상/성격)로 분류해주므로, 그 화제에 맞는 태도 묘사를 뱅크에서 조합.
검증: 문법체크, 빌드, 8개 화제+미등록 주제 폴백 테스트 — 결함 0건.
**→ AI 의존성 완전 제거 완료**

---

## ✅ "다음에 할 일" 목록 사실상 완료
지난번 목록의 `lore/301`, `lore/316`, `npc/272`까지 전부 로컬화 완료.
남은 건 처음부터 마지막으로 남겨두기로 한 `quest/229` 하나뿐.

### 프로토타입 모바일 지원 (`central-continent.html`, 오픈월드 프로토타입)
- 뷰포트 메타태그 + 캔버스 반응형 축소
- 터치 드래그 시 가상 조이스틱 생성 → 방향 이동 (요청하신 "터치 방향으로 이동" 방식)
- Playwright 모바일 뷰포트(390×780) 드래그 시뮬레이션으로 검증 완료
- 같은 Artifact 링크로 재배포 완료: https://claude.ai/code/artifact/1d1f47b2-2b66-40c4-b8d4-79066f70dab4

---

## ⚠️ 정정 — `ui/155`/`quest/086`는 인프라 파일이 아니라 진짜 핵심 엔진이었음

이전 기록에 "`quest/086`, `race/013`, `ui/155`는 AI 호출 없이 헬퍼
함수만 제공하는 인프라 파일(손댈 필요 없음)"이라고 잘못 적혀 있었음 —
재검토 결과 **완전히 틀렸다.** 아래 17개 시스템 변환 후, 시스템 전체를
`grep -rln "generativelanguage\|fetch("`로 재감사한 결과 확인:

- **`quest/086` 5064줄**: `async function callAI(history, injectedContext, retryCount)`
  — `window.callAI`의 **원본 정의**. 5108줄에서 `generativelanguage.
  googleapis.com/.../generateContent`로 직접 `fetch`. 매 턴 `sendMsg`가
  호출하는 실제 서사 생성 요청(967줄 `doStartChat`의 오프닝, 1573줄
  일반 응답)이 여기로 들어간다.
- **`progression/236`(105줄), `misc/239`(13줄), `misc/230`(549줄)** —
  각각 `window.callAI = async function(...)`로 **덮어쓰기 체인**을
  형성. 순서대로 이전 `callAI`를 감싸며 injectedContext에 문맥(마지막
  생애 기억/서사 규칙/방랑자 NPC 문맥)을 추가 주입한 뒤 위임한다.
- **`ui/155`의 `patchStreamingAI()` IIFE** — 이 체인의 최종 래퍼. 등록된
  API 키 전부·모델 여러 개를 순회하며 `streamGenerateContent`(SSE)로
  실시간 스트리밍 렌더링을 시도하고, 다 실패해야 `_orig`(원본 `callAI`
  체인)로 폴백한다.

즉 실제 "AI 던전마스터" — 플레이어가 매 턴 읽는 그 소설식 서술
자체 — 는 `quest/229`가 아니라 **이 `callAI` 체인**에서 나온다.
`quest/229`의 3개 호출(`openNpcQuestDialog`/`generateAILocation`/
`generateAIBulletinItems`)은 상대적으로 지엽적인 구조화된 콘텐츠
생성(장소/게시판 아이템/NPC 대화 퀘스트 팝업)이라, 지금까지 변환한
17개 시스템과 같은 방식(트레이트 기반 로컬 조합)으로 처리 가능해
보인다.

**`callAI` 체인은 질적으로 다른 문제다**: 지금까지 변환한 모든 시스템은
"입력을 분류 → 미리 쓴 문장 뱅크에서 조합"으로 대체 가능한, **범위가
정해진(bounded)** 콘텐츠였다. 반면 `callAI`는 플레이어가 자유 텍스트로
뭘 입력하든 그에 대한 **완전히 개방형(open-ended)** 소설식 응답을
그때그때 생성하는 것 — 트레이트 슬롯 조합 구조로는 원천적으로 흉내낼
수 없는 영역(이 문서 "보류" 섹션에 이미 이렇게 기록해뒀던 바로 그
카테고리). 이걸 로컬화하려면 지금까지와는 완전히 다른 접근(예: 장면별
사전 작성 분기 스토리, 또는 별도의 오프라인 텍스트 생성 방식)이
필요하고, 그 결정은 사용자 확인이 필요해 보류.

## ✅ 결정 확정 — `callAI` 체인 로컬화 방향 (사용자 확인 완료)

과거(이 세션 훨씬 이전)에 이미 "자유 텍스트 입력은 쓰지 않는다 — AI 없이
게임을 돌리려면 그게 맞다, 선택지가 좁아지는 건 감수한다"고 확정하셨던
결정을 재확인함. 오늘 다시 확인해 **그 방향 그대로 진행하기로 최종
확정**:

1. **입력은 선택지 클릭뿐** — 자유 타이핑 경로는 전부 제거.
   - `ui/242`의 "⚡ 빠른 행동" 기능 삭제 완료 (아래 참조) — 커스텀 텍스트를
     타이핑해 저장한 뒤 `sendMsg(text,false)`로 그대로 재전송하던 자유
     텍스트 우회 경로였음.
2. **핵심 서사 생성(`callAI` 체인)도 트레이트/카테고리 기반 로컬 조합으로
   전환** — 지금까지의 17개 시스템과 같은 패턴.
3. **왜 이게 생각보다 어렵지 않은지**: `quest/086`의 `sendMsg`를 직접
   읽어보니, 실제로 AI에게 필요한 건 "예측 불가능한 자유 텍스트 이해"가
   아니라 이미 **완전히 결정론적인 로컬 주사위/행동분류 엔진**(정규식
   기반 `combatRe`/`stealthRe`/`persuadeRe`/`intimidateRe`/`searchRe`/
   `moveRe`/`magicRe`/`socialActionRe` 등, `usedStat` 산출, d100 굴림,
   대성공/성공/실패/대실패 판정)이 **이미 다 계산해서 문맥으로 AI에게
   넘겨주고 있었음** — AI는 그 결과를 "그럴듯한 문장으로 포장"하는
   역할일 뿐. 즉 로컬 조합 엔진이 필요한 입력(행동 카테고리 + 성공/
   실패/대성공/대실패 + 씬 태그 + 장소/NPC/몬스터 이름)은 전부 이미
   계산되어 있어 새로 만들 필요가 없음.
4. **AI 응답의 정확한 기대 포맷도 확인함** — 프로즈 다음에
   `[선택지]①..②..③..④..[/선택지]`, 그 다음 줄에 선택적으로
   `<gs>{...}</gs>` JSON. 다운스트림 파싱(HP/MP/스탯/골드 정규식,
   보스처치 감지, 선택지 정규식, `<gs>` 블록 파싱)이 전부 **이 텍스트
   포맷에서 직접 정규식으로 읽어들이는 구조**라, 로컬 조합기가 이
   포맷대로 문자열만 만들어내면 다운스트림 코드는 한 줄도 안 바꿔도 됨
   (지금까지의 모든 변환과 동일한 원칙 — "AI가 반환하던 것과 같은
   모양을 반환").
5. **`<gs>` 블록은 생략 가능** — `ai-prompt/100` 등 GS훅 전부
   `if(!gsMatch) return result;`로 안전하게 가드돼 있고, 네트워크 실패
   시 폴백 응답(`quest/086:5236` `_defaultReply`)도 이미 `<gs>` 없이
   나감. 게다가 퀘스트/아이템/장소/NPC/로어/연대기 등 GS가 원래
   담당하던 "세계 풍부화" 역할은 이번 세션에서 이미 각각 전용 로컬
   시스템으로 넘어갔음(퀘스트→job/087, 아이템→items/007, 장소→(예정)
   quest/229, 연대기→misc/303 등). 그러니 로컬 서사 조합기는 `<gs>`를
   아예 안 넣거나 최소한만 넣어도 게임 진행에 지장 없음 — 이 결정이
   실질적으로 게임성에 영향 없는 이유.

### 실행 계획 (단계별)
- [x] **Phase 1**: `composeLocalTurnText()` (`quest/086`, "[로컬 턴 서사
      엔진]" 섹션) — `TURN_REACT_BANK`: 행동 카테고리(attack/defend/
      fear/stealth/move/magic/persuade/search/social/resolve 10종) ×
      판정 결과(crit/success/fail/critfail) 조합 반응 프로즈. 오프닝
      전용 `TURN_OPENING_BANK`, 주사위 판정이 없는 캐주얼 턴용
      `TURN_CASUAL_BANK`도 별도 구현.
- [x] **Phase 2**: 선택지 생성 — **이미 존재하던** `generateLocalFlavorChoices()`
      (`LOCAL_FLAVOR_TEMPLATES`: 대화/실리/대담/경계 4카테고리×10개,
      `CHOICE_DIVERSITY_HINT`가 요구하는 다양성 기준과 정확히 일치)를
      그대로 재사용 — 원래는 "AI 선택지 뒤에 추가로 붙는 보조 옵션"
      용도로 이미 만들어져 있던 걸 발견해 메인 선택지 생성기로 승격.
      과정에서 발견한 버그(`경계` 카테고리 fallback 대상 "먼 곳의
      움직임" + 템플릿 "{t}의 움직임을..." 조합 시 "움직임의 움직임"
      중복 발생)도 수정.
- [x] **Phase 3**: `quest/086`의 `callAI` 정의(기존 fetch/키로테이션/
      에러처리 ~180줄)를 `composeLocalTurnText()` 호출 한 줄로 완전히
      교체. `_meIntercept`(과거 응답 재사용 캐시)는 제거 —
      API 호출 비용이 사라진 지금은 매번 새로 조합하는 쪽이 항상 더
      신선해서 캐시를 거칠 이유가 없음. 이제 안 쓰는 import
      (`GEMINI_FALLBACK_MODELS`/`loadApiKeys`/`loadKeyIndex`/
      `saveKeyIndex`/`trimHistory`) 정리 완료.
      **검증**: 함수 추출 + Node eval 스모크테스트 —
      오프닝 20회, 전체 스탯(str/rng/end/fear/disg/agi/mgc/fath/neg/
      per/int/spk/luk/wil/ldr/cha) × 4판정 × 5회, 몬스터/적대NPC 대상
      치환, 캐주얼 턴, 이름 받침 유무 4종(칼리아/김철수/아론/강철)
      전부 — undefined 누출 0건, 미치환 마커 0건, 선택지 4개 미만 0건.
      템플릿×대상 전수 조합 중복 문구 검사도 0건(에러 나던 것 1건
      수정 후). 조사 처리 버그 2건 발견 후 수정(`{t:는}`처럼 잘못된
      마커 타입 사용 → `_josa`가 빈 문자열 반환하던 것을 `{t:은는}`
      등 올바른 타입으로 정정, `{loc}에 도착한 {name}은(는)` 식
      이중표기를 `_josa` 기반 정확한 조사로 정정). `node --check` +
      전체 `node build.js` 통과.
      `progression/236`/`misc/239`/`misc/230` 래퍼는 그대로 둠(ctx에
      문맥을 추가만 하고 위임하는 구조라 로컬 버전이 못 쓰는 문맥은
      그냥 무시되어 안전). `ui/155`의 스트리밍 패치도 API 키 없으면
      자동으로 `_orig`(래퍼 체인 → 결국 로컬 버전)로 폴백하니 당장은
      안전 — 정리는 Phase 4에서.
- [x] **Phase 5**: `quest/229`의 마지막 3개 실제 AI 호출을 전부 로컬화.
      - `openNpcQuestDialog` → `composeLocalNpcQuestOffer(npc, level,
        bpRewardId, bpRewardName)` 신규 구현. `job/087`의
        `window.composeLocalQuest`를 그대로 재사용해 퀘스트 필드를
        생성하고, 인사말/제안 대사만 신규 뱅크(4개씩)로 로컬 작성.
        API 키 없으면 아예 기능이 막히던 `if(!keys.length){ toast(...);
        return; }` 게이트 제거.
      - `generateAILocation` → `composeLocalLocation(trigger, context)`
        신규 구현. trigger/context 키워드로 11종 장소타입 중 후보
        분류 → 접두어×타입별 명사 조합 이름, 타입별 desc/lore 뱅크,
        `items/007`의 `window.generateLocalItem`으로 상점 아이템 3개,
        `window.composeLocalQuest`로 장소 연계 퀘스트 1개 생성.
      - `generateAIBulletinItems` → `composeLocalBulletinItems(loc,
        trigger, context)` 신규 구현. 위와 동일한 `composeLocalQuest`
        재사용 + 정보 뱅크.
      - `checkAndExpandWorld`의 `if(!aiText||!S.apiKeys?.length) return;`
        게이트도 제거 — API 키 없으면 서사 기반 자동 세계 확장 트리거
        자체가 전혀 발동 안 하던 문제였음(생성 함수는 이미 로컬화됐어도
        호출부 게이트가 막고 있었음).
      **검증**: 함수 추출 + Node 스모크테스트 — 장소 생성 6종 트리거×
      15회(id/name/type 유효성, dangerLevel 1~6 범위, priceModifier
      범위 전부 확인), 게시판 생성 20회, NPC퀘스트제안 레벨 4종×10회
      (블루프린트 보상 필드 정확히 병합되는지 확인) — 전부 0건 이슈.
      `node --check` + 전체 `node build.js` 통과.
      **시스템 전체 재확인**: `grep -rn "callGeminiDirect(\|
      callGeminiDirectText("` 결과 이제 자기 정의부(quest/229) 말고
      **호출부가 시스템 전체에 단 한 곳도 없음**을 확인. `<gs>` 관련
      우려는 Phase 3에서 이미 정리했던 대로(모든 GS훅이 `if(!gsMatch)
      return` 가드) 이 3개 함수는 애초에 `<gs>` 블록을 안 쓰는 별도
      스키마라 해당 없음.
- [x] **Phase 4 (정리)**: 코드베이스에서 라이브 Gemini API를 실제로 호출할
      수 있는 마지막 코드 경로들을 전부 삭제.
      - `ui/155`의 `patchStreamingAI()` IIFE(스트리밍 `fetch` 포함)
        전체 삭제 — `window.callAI`는 이제 `quest/086`의 로컬 조합
        버전 하나뿐.
      - `misc/328`의 `requestCombatNarration`(죽은 함수, 호출부
        0곳으로 이미 확인됐던 것 — fetch 포함 함수 자체와 관련 캐시
        로그 함수/상수까지 통째로 삭제).
      - `quest/229`의 `callGeminiDirect`/`callGeminiDirectText`(정의부
        자체, 호출부가 시스템 전체에서 0곳이 된 것 재확인 후) 삭제.
      - 각 파일에서 이제 안 쓰는 import 정리(`GEMINI_FALLBACK_MODELS`/
        `loadApiKeys`/`loadKeyIndex`/`saveKeyIndex`).
      - **검증**: `grep -rln "generativelanguage" src/` → **0건**.
        `node --check` 각 파일 + 전체 `node build.js` 통과.
      - 남겨둔 것: "🔑 API 키 관리" 패널(`core/084`의 `renderKeys`/
        `addApiKey`/`removeApiKey`, `template.html`의 `#p-keys`)은
        그대로 둠 — 확인해보니 애초에 **이 패널을 여는 버튼이 코드
        어디에도 없어(`openP('keys')` 호출부 0건) 플레이어가 정상
        플레이로는 절대 도달할 수 없는 이미 고립된 UI**였고, 이제는
        키를 넣어도 아무 기능도 소비하지 않으니 완전히 무해한 채로
        방치해도 무방하다고 판단. 필요하면 별도로 요청 시 마저 정리.

**현재 상태(2026-08-24 업데이트 전): 코드베이스 전체에서 라이브 Gemini
API를 호출하는 코드 경로가 완전히 사라짐(단순히 "키가 없으면 안
쓰인다"가 아니라 그런 코드 자체가 존재하지 않음). 플레이어가 API 키를
단 하나도 등록하지 않아도 게임의 모든 기능이 완전히 작동함 — AI
의존성 완전 제거 완료.**

---

## 🔄 정책 전환 — "AI 완전 제거"에서 "AI 선택제(키 있으면 우선 사용)"로

위에서 완전 제거까지 마친 뒤, 실제로 플레이해보니 "생성 계열"(아이템/
퀘스트/장소/직업 등)이 전부 미리 써둔 문장 뱅크 조합이라 "불타는
늑대/얼어붙은 늑대"류로 티나게 저렴해 보인다는 문제가 재확인됨. 논의
끝에 최종 정책을 이렇게 재조정:

- **매 턴 서사(`callAI`/`composeLocalTurnText`) + 선택지** → **그대로
  로컬 전용 유지**. 자유 텍스트를 없앤 시점에 이미 결정된 부분이고,
  매 턴 호출되는 가장 빈번한 경로라 AI로 되돌리지 않음.
- **콘텐츠 "생성" 계열** → **키가 있으면 AI 우선, 없거나 실패하면 로컬
  조합으로 폴백**하는 구조로 복원. "이미 데이터 쌓는 용도"였던
  학습 캐시(`pickGeneratedObject`/`recordGeneratedObject`)가 그대로
  앞단에 남아있어서, 한 번 AI가 좋은 결과를 만들면 그 버킷은 자동으로
  누적/재사용됨 — 매번 호출하지 않아도 계속 AI급 품질이 쌓여감.
- **`screen-apikey`(시작 화면 키 입력 관문)** → **필수 → 선택으로 전환**.
  `confirmKey()`의 `if(!keys.length){...return;}` 게이트 제거. 키 없이
  "시작하기"를 눌러도 바로 진행되고, 안내 문구도 "선택 사항"으로 수정.

### 복원한 공통 인프라
- `quest/229`에 `callGeminiDirect`/`callGeminiDirectText`(실제 fetch
  primitives) 복원.
- 신규 `tryAIThenLocal(aiFn, localFn, label)` 헬퍼 추가(`quest/229`,
  `window.tryAIThenLocal`) — "키 있으면 aiFn 시도 → 실패/키없음이면
  localFn" 패턴을 모든 생성 시스템이 공유. Node 유닛테스트로 4가지
  케이스(키없음/AI성공/AI예외/AI가 null 반환) 전부 검증.

### 지금까지 "AI 우선 + 로컬 폴백"으로 되돌린 것
- [x] **NPC 퀘스트 제안** (`quest/229:openNpcQuestDialog`) — 원래 프롬프트
      그대로 복원, `composeLocalNpcQuestOffer`가 폴백.
- [x] **장소 생성** (`quest/229:generateAILocation`) — `buildLocationGenPrompt`
      복원 사용, `composeLocalLocation`이 폴백.
- [x] **게시판 아이템 생성** (`quest/229:generateAIBulletinItems`) —
      `buildBulletinGenPrompt` 복원 사용, `composeLocalBulletinItems`가 폴백.
- [x] **퀘스트 생성** (`job/087:generateAIQuest`) — 함수를 다시 `async`로
      전환, 캐릭터/최근서사 반영 프롬프트 신규 작성, `composeLocalQuest`가 폴백.
- [x] **아이템 생성** (`items/007:generateItemBatch`) — 슬롯/희귀도별
      프롬프트 신규 작성(수치는 AI가 주되 스탯키는 화이트리스트),
      `generateLocalItem`이 폴백.
- [x] **전직(직업) 생성** (`job/042:generateNextJob`) — AI는 이름/설명/
      배경/스탯특화 "플레이버"만 담당하고, 스킬 수치·prereq 연결 같은
      밸런스는 항상 `composeLocalNextJobs`가 계산(AI가 밸런스를 절대
      못 건드리게 설계). `composeLocalNextJobs`에 `aiSpecs` 매개변수
      추가해 검증된 AI 결과만 템플릿 대신 사용하도록 확장.

### "AI로 안 돌려도 됨" 확정 (콘텐츠가 실제로 화면에 안 뜨는 죽은 경로)
- [x] NPC 대화 화제 요약 (`npc/272`) — `S.system`에 붙는데 `composeLocalTurnText`가
      `S.system`을 아예 안 읽음(확인: `callGeminiDirect`도 system_instruction
      안 씀). AI로 바꿔도 체감 차이 0.
- [x] NPC 비밀 아젠다 (`npc/305`) — 유일한 소비처(`getNpcAgendaSection`)가
      `ai-prompt/077`의 `buildSystem()`인데, 이 함수는 이번 세션 이전부터
      이미 죽어있던 코드(호출부가 전부 `buildLightSystem`을 씀). 플레이어가
      실제로 보는 건 고정 토스트 문구뿐, 비밀 내용 자체는 화면에 안 나옴.

### [x] "AI 우선 + 로컬 폴백"으로 추가 복원 완료 (7개, 전부 전용 UI 패널에 표시됨)
- [x] 꿈/환영 (`misc/302:triggerDream`) — 캐릭터+발생사유 반영 프롬프트,
      `composeLocalDream`이 폴백. 꿈 팝업에 표시.
- [x] 이벤트 경매 (`misc/314:generateAuction`) — 세계관 반영 프롬프트,
      `composeLocalAuction`이 폴백. 경매 패널에 표시.
- [x] 연대기 (`misc/303:autoGenerateChronicle`) — 최근 10턴 실제 서사
      요약 프롬프트, `composeLocalChronicleEntry`가 폴백. 연대기 패널에 표시.
- [x] 세계 백과사전 (`world/304:extractCodexTerms`) — 용어 추출(접미어
      패턴매칭)은 그대로 두고 설명(desc)만 AI 우선, `composeLocalCodexDesc`가
      폴백. 백과사전 패널에 표시.
- [x] NPC 유산 (`patches/322:generateNpcLegacy`) — NPC 성격/관계 반영
      프롬프트, `composeLocalNpcLegacy`가 폴백. 유산 패널에 표시.
- [x] 명장면/Hall of Memory (`patches/322:captureHallOfMemory`) — 실제
      트리거된 장면 텍스트를 압축하는 프롬프트, `composeLocalMomentSentence`가
      폴백. 명장면 패널에 표시.
- [x] 예언 (`lore/301:generateProphecy`) — 캐릭터 종족/직업 반영 프롬프트,
      `composeLocalProphecies`가 폴백. 예언 패널에 표시.
- [x] 트라우마 (`lore/316:addTraumaDeep`) — 플레이어가 직접 쓴 자유 텍스트를
      실제로 분석하는 프롬프트(로컬 버전은 키워드 원형 매칭만 가능해 AI가
      가장 크게 이득 보는 케이스), `composeLocalTrauma`가 폴백. 트라우마
      패널에 표시.

**검증**: 7개 파일 전부 `node --check` 통과, 전체 `node build.js` 통과,
각 파일에서 참조한 로컬 폴백 함수(`composeLocalDream` 등) 전부 시그니처
일치 확인. `tryAIThenLocal`은 이미 4가지 케이스(키없음/AI성공/AI예외/
AI가 null) 유닛테스트로 검증된 공유 로직이라 추가 개별 테스트는 생략.

### 아직 로컬 전용으로 남아있는 것
- [ ] `race/064:autoSuggestNextJob` — job/042와 같은 `composeLocalNextJobs`를
      쓰는 자동(비버튼) 전직 제안 트리거. 아직 AI 우선으로 안 바꿈(수동
      버튼 쪽만 우선 작업) — 다만 같은 부모 직업이면 캐시를 공유하므로
      기능적으로 크게 불리하진 않음.
- [ ] 캐릭터 생성 화면(이름/성격/배경 등 제안, `core/084`) — 이건 "생성"
      이라기보다 "제안 목록"에 가까워서 우선순위 낮음, 필요 시 논의

**현재 상태: 키 없이도 게임 전체가 완전히 작동(스토리 포함 전부 로컬
폴백)하되, 13개 생성 시스템(NPC퀘스트제안/장소/게시판/퀘스트/아이템/
전직/꿈/경매/연대기/백과사전/NPC유산/명장면/예언/트라우마 — 정확히는
14개)은 키가 있으면 진짜 AI가 만들어줌. 시작 화면도 키 없이 바로 진행
가능. "콘텐츠가 실제로 플레이어에게 보이는가"를 기준으로 어디에 AI를
되돌릴 가치가 있는지 매번 먼저 확인하는 방식으로 진행함.**

각 Phase마다 지금까지처럼 문법체크 + 스모크테스트 + 전체 빌드로 검증
후 다음 단계로 진행.

## ✅ (구) 다음에 할 일 — 전부 완료로 갱신됨

아래는 과거 시점 기록이라 낡았던 항목. 사용자가 "AI 완전 제거"에서
"AI 우선 + 로컬 폴백"(`tryAIThenLocal`)으로 정책을 전환한 뒤, 여기 남아
있던 항목들도 전부 그 패턴으로 복원 완료됨:
- [x] `quest/229`의 3개 호출 — `openNpcQuestDialog`/`generateAILocation`/
      `generateAIBulletinItems` 모두 `tryAIThenLocal`로 복원.
- [x] **`callAI` 체인**(`quest/086`) — 매 턴 서사도 `tryAIThenLocal`로
      AI-우선화 완료(`callGeminiForTurn` 신설, 실패/키없음 시
      `composeLocalTurnText`로 완전 폴백). `ui/155`의 스트리밍 래퍼
      (`patchStreamingAI`)는 자유 텍스트 입력 제거 방침과 충돌해 완전
      삭제로 결론(위 "🔄 정책 전환" 섹션 및 아래 이름/말투 섹션 참고).

---

## 🔜 다음에 할 일 (최신, 우선순위 순)

**① 로컬 모델(브라우저 내장 미니 LLM) — 실행 가능성 조사 완료, 통합 작업 착수**
- [2026-08-25] 실측 프로토타입 시도 → **이 원격 세션은 조직 egress
  정책으로 huggingface.co 접속 자체가 차단됨(403)** — 모델 다운로드
  실측 테스트 불가(우회 시도 안 함, 정책상 보고만 하고 중단). 그래서
  실측 대신 공개 자료 조사로 대체.
- **WebGPU 지원 조사 결과**:
  - 전세계 "지원 가능" 비율은 캔아이유즈 기준 약 70~82%(데스크톱은
    Chrome/Edge/Firefox/Safari 다 기본 탑재).
  - **모바일은 훨씬 제한적**: iOS/iPadOS는 **iOS 26부터**(2025년
    하반기 출시, 아직 최신)만 지원 — 구형 iOS 유저는 대상 밖. Android는
    Chrome 121+ & Android 12+ & Qualcomm/ARM GPU 조건 — 저가형/구형
    기기 다수 제외 가능.
  - 한국 모바일 브라우저 점유율: Chrome ~42%, Safari ~27%, Whale ~15%,
    Samsung Internet ~14%(크로미움 계열 합 ~71%, 이론상 지원권이나
    기기 세대·GPU 드라이버 파편화로 실사용 커버리지는 이보다 낮을 것).
  - **결론**: "지원 가능" 통계와 "실제로 매끄럽게 돌아가는 유저 비율"은
    다르고, 정확한 실사용 커버리지는 아무도 모름 — 그래서 100% 커버를
    전제하지 않고 **"WebGPU 되면 로컬 모델, 안 되면 기존 로컬 조합"**
    처럼 기기 감지 후 선택적으로 켜는 구조로 설계하기로 함(=API 키와
    동일한 "있으면 보너스, 없어도 게임은 완전히 돌아감" 패턴).
- **범위 결정**: 처음엔 "대사·서사만" 좁혀보자는 안도 검토했으나,
  최종적으로 **범위 제한 없이(직업/몬스터/NPC/아이템/퀘스트 등 전부
  포함) 진행하기로 확정**. 이유(사용자 판단, 기록):
  - "1000개씩 사전 생성해서 고정 뱅크로 두는 방식"도 검토했으나,
    이러면 로컬 모델 자체가 필요 없어짐(개발 단계에 한 번만 만들면
    끝) — 사용자는 이걸 원하지 않음. **실제 플레이하면서 계속 쌓이는
    데이터가 고정된 사전 생성 데이터보다 낫다**는 게 최종 판단.
  - 다만 무제한으로 계속 쌓이기만 하면 저장공간도 무한정 늘어나야
    하므로, 기존 `OBJECT_LEARN`/마르코프 코퍼스처럼 카테고리별 상한
    (예: 150개)을 두고 오래된 것부터 밀어내는 캐시 전략은 유지.
  - 아이템/스탯 등 게임 밸런스에 영향 주는 수치 필드는 지금처럼 항상
    게임 로직이 직접 계산 — 로컬 모델은 이름/설명/서술 같은 "느낌"
    필드만 제안(`job/042:composeLocalNextJobs`에서 이미 쓰던 원칙과
    동일).
- **이미지(도트 스프라이트) 자동 생성은 별도 보류** — 텍스트 생성보다
  훨씬 무거운 별도 기술(디퓨전 모델, 통상 2GB+, 추론도 훨씬 느림)이고
  특정 도트 화풍을 일관되게 뽑으려면 추가 파인튜닝이 필요해 리스크가
  큼. 대안으로 **AI 없이 도트 부품(머리/몸통/색상 팔레트 등)을 코드로
  무작위 조합하는 "조각 조합" 방식**이 훨씬 가볍고 확실하다고 제안,
  사용자가 "일단 나중에"로 보류 확정. 필요 시 별도로 재논의.
- **다음 액션**: 실제 게임 소스(`taleforge-modular/src/`)에 로컬 모델
  통합 작업 착수. 이 세션에서는 huggingface.co가 막혀 실제 다운로드·
  추론 실행 검증은 못 하므로, 코드/설계는 여기서 만들되 실제 브라우저
  다운로드·동작 확인은 네트워크 제한 없는 환경(사용자 로컬 등)에서
  필요.

### ✅ 1차 구현 완료 — 엔진 + 파일럿 연동 (매 턴 서사)

[2026-08-25] `src/quest/331-로컬-AI-모델-엔진.js` 신설, `main.js`에 등록:
- `isLocalModelSupported()` — `navigator.gpu.requestAdapter()`로 실제
  WebGPU 사용 가능 여부 확인(async).
- `isLocalModelEnabled()`/`setLocalModelEnabled()` — 사용자가 직접 켜야
  동작하는 옵트인 설정(localStorage `tf-local-model-enabled`, 기본 OFF).
  API 키와 동일하게 "있으면 보너스, 꺼져 있으면 게임은 원래대로" 원칙.
- `ensureLocalModelLoaded()` — `@huggingface/transformers`를
  `import('https://esm.run/@huggingface/transformers')`로 **런타임
  동적 import**(esbuild가 http(s) 동적 import는 번들에 포함하지 않고
  그대로 남겨두는 것을 별도 테스트로 확인함 — 켜지 않는 유저는 이
  URL에 아예 접속하지 않음). 모델은 `onnx-community/Qwen2.5-0.5B-Instruct`
  (q4 양자화, WebGPU 디바이스) 1차 후보로 지정 — 한국어 품질은 이
  세션에서 실측 못 했으므로 실제 브라우저 확인 후 필요하면 교체.
- `callLocalModel(systemPrompt, userPrompt, opts)` — 로드된 파이프라인
  으로 텍스트 생성, 실패 시 예외를 던져 호출부가 다음 단계로 폴백하게 함.
  소형 모델이라 멀티턴 히스토리 전체보다 압축된 텍스트 한 턴이 더
  안정적이라 판단해 호출부가 요약해서 넘기는 구조로 설계.
  단순 흐름 자체는 `test.mjs`(초기 실현 가능성 검토 때 만든 Node
  프로토타입)로 이미 한 번 짜본 로직을 재사용.
- `tryCloudThenLocalModelThenBank(cloudFn, localModelFn, bankFn, label)`
  — 3단 폴백 헬퍼(클라우드 API → 로컬 모델 → 기존 로컬 조합).
  `quest/229:tryAIThenLocal`(2단)과 같은 원칙에 로컬 모델 단계 하나
  추가. 새 통합 지점은 이걸 쓰면 됨.
- 시작 화면(`#screen-apikey`) "⚙ 설정"에 토글 UI 추가
  (`renderLocalModelSetting`/`toggleLocalModelSetting`) — WebGPU 미지원
  기기는 버튼이 비활성화되고 사유가 표시됨. `patches/224`의
  `_taleforgeInit()`에서 `renderKeys()` 옆에 같이 렌더링.

**파일럿 연동(1곳)**: `quest/086`의 매 턴 서사 `callAI`를
`tryCloudThenLocalModelThenBank`로 교체 — `callGeminiForTurn`(클라우드)
→ `callLocalModelForTurn`(신설, 로컬 모델) → `composeLocalTurnText`(기존
로컬 조합) 순서. `node --check` + 전체 `node build.js` 빌드 검증
완료(기존과 동일한 7개 무관 경고 외 신규 에러 없음), 번들 결과물에서
CDN 동적 import가 리터럴 그대로 남아있는 것도 확인.

**진단 로그 추가**: [2026-08-25] 사용자가 "실제 기기에서 켜봐도 뭐가
잘못됐는지는 모를 것 같다"고 지적 — 이 세션은 huggingface.co가 막혀
Claude가 직접 실행해볼 방법이 없으므로, 대신 실제 기기에서 무슨 일이
일어났는지 화면에 그대로 남겨 사용자가 복사해서 전달하면 진단 가능하게
설계. WebGPU 감지 결과/라이브러리 로드/모델 다운로드 진행률/모델 로드
완료·실패/추론 성공·실패(원본 에러 메시지 포함)를 전부 타임스탬프
로그로 기록(`_dlog`, 최근 300줄), 시작 화면 "⚙ 설정"의 로컬 모델
토글 아래 `<details>` 접이식 패널로 노출(`getLocalModelLog`,
`copyLocalModelLog` — 클립보드 복사, 실패 시 textarea 자동 선택으로
폴백). F12 콘솔 없이도 로그 칸 내용만 복사해서 보내주면 원인 진단 가능.

**⚠️ 검증 못 한 부분(이 세션의 근본적 한계)**: huggingface.co 접속
자체가 막혀 있어, 실제 브라우저에서 이 토글을 켰을 때 ①모델이 정말
다운로드되는지 ②WebGPU로 잘 돌아가는지 ③한국어 결과물 품질이 쓸만한지
**전혀 실측하지 못함**. 코드는 논리적으로 맞게 작성했지만, 네트워크
제한 없는 환경(사용자 로컬 브라우저 등)에서 최초 1회 실제 확인 필요 —
그 결과에 따라 모델 선택(`LOCAL_MODEL_ID`)이나 프롬프트 조정이 필요할
수 있음.

### ✅ 전체 롤아웃 완료 — 15개 생성 지점 전부 3단 폴백 전환

[2026-08-25] 남아있던 모든 `tryAIThenLocal`(2단) 호출을
`tryCloudThenLocalModelThenBank`(3단: 클라우드→로컬 모델→로컬 조합)로
전환 완료. 대상(14곳, 매 턴 서사 파일럿 포함 총 15곳):
- `quest/229`: NPC 퀘스트 제안(`openNpcQuestDialog`)/장소 생성
  (`generateAILocation`)/게시판 생성(`generateAIBulletinItems`) — 3곳
- `job/087`: 퀘스트 생성(`generateAIQuest`)
- `job/042`: 전직 후보 생성(`generateNextJob`)
- `items/007`: 아이템 생성(배치 루프 내부)
- `misc/303`: 연대기 생성(`autoGenerateChronicle`)
- `misc/302`: 꿈 생성(`triggerDream`) — 기존 2단에서 업그레이드
- `misc/314`: 경매 생성(`generateAuction`)
- `world/304`: 백과사전 항목(`extractCodexTerms`)
- `patches/322`: NPC 유산(`generateNpcLegacy`)/명장면
  (`captureHallOfMemory`) — 2곳
- `lore/301`: 예언 생성(`generateProphecy`)
- `lore/316`: 트라우마 생성(`addTraumaDeep`)

**구조화된 JSON 생성 공통 헬퍼 추가**(`quest/331`): `parseJSONLoose`
(직접 파싱 실패 시 텍스트에서 가장 바깥쪽 `{...}`/`[...]` 블록을 찾아
재시도 — 소형 모델이 코드펜스나 설명을 덧붙이는 경우 대비) +
`callLocalModelJSON`(JSON 전용 시스템 지시문으로 로컬 모델을 호출하고
`parseJSONLoose`로 파싱, 실패 시 예외를 던져 다음 단계로 폴백). 각
호출부는 기존 클라우드 프롬프트를 그대로 재사용하고, 클라우드 응답과
동일한 shape으로 검증/가공하는 로직(`_shapeXxx` 헬퍼)을 클라우드·로컬
모델 두 경로에 공통 적용 — 직업/몬스터/NPC류처럼 숫자·밸런스 필드가
있는 곳은 항상 게임 로직이 그 값을 계산/보정하고, 모델은 이름·설명 등
"느낌" 필드만 제안하는 기존 원칙(`job/042:composeLocalNextJobs`)을
그대로 유지.

이제 남은 `tryAIThenLocal` 사용처가 전무함을 확인 후, `quest/229`에
있던 원래 함수 정의(2단 폴백 헬퍼)도 완전히 죽은 코드가 되어 삭제함.

**진단 로그는 자동으로 전체 커버**: `_dlog`가 `callLocalModel`/
`ensureLocalModelLoaded`/`tryCloudThenLocalModelThenBank` 안에
중앙집중돼 있어서, 15개 호출 지점 중 어디서 로컬 모델이 시도되든 별도
계측 없이 같은 진단 로그 패널에 전부 기록됨.

`node --check`로 12개 수정 파일 전부 개별 검증 + 전체 `node build.js`
빌드 성공(기존과 동일한 7개 무관 경고 외 신규 에러 없음).

### ✅ 실기기 1차 테스트 — WebGPU 감지 성공 + 우선순위 전환

[2026-08-26] 사용자가 실제 안드로이드 폰(삼성, SKT)에서 빌드 파일을
열어 진단 로그 확인 — `WebGPU 어댑터 확보 성공` 기록됨(1단계 통과).
다만 API 키가 5개 등록돼있어 클라우드가 먼저 성공해버려서 로컬 모델
다운로드 단계까지는 아직 안 감. 이에 사용자가 "어차피 나중엔 API를
다 뗄 거니, 로컬 모델을 메인으로 하고 API 키를 보조로 돌리자"고 결정
(품질/속도가 지금은 클라우드가 낫다는 트레이드오프 안내 후 확인받음).

`tryCloudThenLocalModelThenBank`(`quest/331`) 우선순위 로직 변경:
- 로컬 모델이 켜져 있고 이 기기가 WebGPU를 지원하면 → **로컬 모델을
  먼저 시도** → 실패/빈 응답이면 클라우드(키 있으면) → 그래도 안 되면
  로컬 조합.
- 로컬 모델이 꺼져 있거나 이 기기가 미지원이면(=메인으로 쓸 로컬 모델
  자체가 없음) → 기존과 동일하게 클라우드 우선 → 로컬 조합.
- 15개 호출 지점 전부가 이 공유 함수 하나를 거치므로, 다른 코드 변경
  없이 이 한 곳만 고쳐서 전체에 적용됨. 설정 화면 로컬 모델 안내
  문구에도 "켜면 API 키보다 먼저 시도됩니다" 추가.
- 빌드 검증 완료. 사용자에게 갱신된 `dist/taleforge.html` 재전달.

### ✅ 실기기 테스트 중 발견된 무관 회귀 버그 2건 수정

[2026-08-26] 사용자가 데스크톱 크롬 개발자도구로 캐릭터 생성 단계를
테스트하다가 로컬 모델과 무관한 기존 버그 2개가 같이 발견됨 — 둘 다
캐릭터 생성 자체를 막고 있어서 즉시 수정:
- **`pickJob`(`core/084`)**: `genJobSkills(jobName).finally(...)` 호출 —
  `genJobSkills`가 이전 세션에서 AI 비동기 호출 제거 후 완전 동기
  함수로 바뀌었는데(내부에서 `S.jobSkillLoading/Done`을 직접 갱신),
  이 호출부만 예전처럼 Promise를 반환한다고 가정한 `.finally()`가
  그대로 남아있어 직업을 고를 때마다
  `Cannot read properties of undefined (reading 'finally')`로 100%
  크래시하던 버그. `.finally()` 제거하고 동기 호출 후 바로
  `renderSetupStep()` 재호출하도록 수정.
- **`renderSetupStep`(`core/084`)**: 어디서도 선언된 적 없는 `isLocal`
  변수를 버튼 라벨(`AI 추천 받기`/`추천 불러오기`)에서 참조 —
  `ReferenceError: isLocal is not defined`로 personality/background/
  role 등 추천 UI를 쓰는 모든 스텝에서 크래시하던 버그. `const isLocal
  = !(S.apiKeys && S.apiKeys.length)`로 정의 추가.

빌드 검증 완료.

### ✅ 근본 원인 확정 및 수정 — `callAI` 크래시 (로컬 모델과 무관, 훨씬 오래된 버그)

[2026-08-26] 사용자가 데스크톱 크롬 개발자도구 콘솔에서 전체 스택
트레이스를 캡처해줘서 확정: `window.callAI`가 스택에 3번 겹쳐 나타남
(`misc/230`/`progression/236`/`misc/239`, 이 3개 파일이 각자
`callAI`를 한 겹씩 monkey-patch로 감싸는 구조 — "문맥주입 래퍼"로
정책 전환 때 복원했던 코드들).

**원인**: `misc/230-방랑자-전용-혼돈질서-슬라이더-개연성P-시스템.js`의
`export const _origCallAI = window.callAI;`가 **배포 함수
(`__tfDeferred_205`) 밖, 모듈 최상위**에 있었다. esbuild 번들은 298개
모듈의 최상위 코드를 먼저 전부 실행한 뒤, 맨 마지막에
`__tfDeferred_N` 함수들을 순서대로 실행하는 2단계 구조인데
(`quest/086`의 진짜 `callAI` 정의도 `__tfDeferred_67`이라 이 2단계
구조를 따름) — 모듈 최상위 코드가 실행되는 시점엔 아직 진짜 `callAI`가
설정되기 전이라 `_origCallAI`는 항상 `undefined`를 캡처했다. 이후
`__tfDeferred_205`가 실행되며 `_origCallAI.call(...)`을 호출하는 순간
`undefined.call`이 되어 **매 턴 서사(오프닝 포함) 생성 자체가 100%
크래시**했다 — 로컬 모델이 켜져 있든 꺼져 있든, API 키가 있든 없든
무관하게 발생하던 훨씬 오래된 버그.

같은 파일 안에 이미 **똑같은 버그 패턴이 `updateHeader`에서 한 번
발견되어 고쳐진 이력**이 남아있었다(주석 참고: "이 배포 함수 밖(모듈
최상위, Pass 1)에서 캡처되고 있었다") — 그런데 `callAI`에는 같은
수정이 누락되어 있었던 것.

**수정**: `_origCallAI` 캡처를 모듈 최상위에서 `__tfDeferred_205` 함수
안, 실제 사용 직전으로 이동. `updateHeader` 수정 때와 동일한 패턴.
`node --check` + 전체 빌드 검증 완료.

### ✅ 같은 패턴 2번째 크래시 발견 및 수정 — `updateStats`

[2026-08-26] 사용자가 실제 플레이(주사위 판정 실패 처리) 중
`[오류] _origUpdateStats is not a function` 발견 — `callAI`와
완전히 동일한 버그 패턴. `patches/299-...js`에서
`export const _origUpdateStats = window.updateStats;`가 진짜
`updateStats` 정의(`__tfDeferred_269` 안)보다 훨씬 앞선 모듈
최상위(177줄 차이)에 있어서 항상 `undefined`를 캡처 → 스탯 갱신마다
크래시. `_origCallAI`와 동일하게 배포 함수 안, 실제 사용 직전으로
캡처 위치 이동해서 수정.

### 🔍 전수조사 — 같은 패턴의 다른 잠재 위험 지점 확인

캐릭터 생성/플레이 중 계속 새로운 크래시가 하나씩 터지는 걸 막기 위해,
"`_orig`/`_prev` 변수가 배포 함수(`__tfDeferred_N`) 밖에서
`window.X`를 캡처하는" 패턴을 스크립트로 전체 스캔(brace 카운팅으로
배포 함수 범위 계산) — 33곳 후보 발견, 그중 진짜 구현이 배포 함수
안에 있는 13곳을 추려 개별 코드를 직접 열어 확인:
- **전부 안전한 것으로 확인됨** — `setTimeout(()=>{ if(typeof
  window.X==='function'){...} }, N)` 지연 재시도 패턴, 또는
  `if(typeof _origX==='function'){...}` 방어 가드, 또는 `X ||
  (typeof X!=='undefined'?X:null)` 형태로 안전하게 null로 낮춰지는
  패턴, 또는 아예 선언만 되고 실사용처가 없는 죽은 코드(`ui/231`의
  `_origRenderChoices`) 등 — `_origCallAI`/`_origUpdateStats`처럼
  **가드 없이 직접 호출**하는 경우만 실제로 크래시하는데, 그 2곳
  외에는 없었음.
- 결론: 이 버그 클래스는 `callAI`/`updateStats` 2건으로 확정, 추가
  수정 불필요. (스캔 스크립트 자체는 저장 안 함 — 1회성 조사용.)

빌드 검증 완료(`node --check` + 전체 `node build.js`, 기존과 동일한
7개 무관 경고 외 신규 에러 없음). 사용자에게 갱신된
`dist/taleforge.html` 재전달.

### ✅ 마르코프 학습 기록, 전체 15개 생성 지점으로 확장 완료

[2026-08-26] 사용자가 "실제로 생성은 되는데 왜 학습 데이터는 안
쌓이냐"고 지적 — 확인해보니 마르코프 코퍼스 기록(`recordMarkovSample`)
이 아이템/꿈 2곳에만 연결돼 있고 나머지 13곳(매 턴 서사 포함)은 생성만
되고 학습 데이터로는 전혀 안 쌓이고 있었음. 전부 연결 완료:

- **매 턴 서사**(`quest/086:callGeminiForTurn`/`callLocalModelForTurn`)
  → `turn_narrative` — 가장 빈도 높은 생성이라 최우선으로 연결.
  `composeLocalTurnText`(로컬 폴백)에도 35% 확률로 학습된 문장을
  쓰도록 연결(기존 item/dream과 동일한 패턴).
- NPC 퀘스트 제안(`quest/229`) → `npc_greeting`/`npc_quest_offer`/
  `quest_desc`
- 장소 생성(`quest/229`) → `location_desc`/`location_lore`
- 게시판 생성(`quest/229`) → `quest_desc`/`bulletin_info`
- 퀘스트 생성(`job/087`) → `quest_desc`/`quest_lore`
- 전직 후보(`job/042`) → `job_desc`/`job_lore`
- 연대기(`misc/303`) → `chronicle_text`
- 경매(`misc/314`) → `auction_item_desc`
- 백과사전(`world/304`) → `codex_desc`
- NPC 유산(`patches/322`) → `npc_legacy_message`/`npc_legacy_desc`
- 명장면(`patches/322`) → `moment_sentence`
- 예언(`lore/301`) → `prophecy_text`
- 트라우마(`lore/316`) → `trauma_trigger`/`trauma_penalty`

기록 위치는 전부 "클라우드/로컬모델이 실제로 성공적으로 응답을 준
바로 그 지점"(주로 JSON 파싱/검증하는 `_shapeXxx` 헬퍼 내부, 또는
성공 콜백 안) — 로컬 조합(뱅크) 결과가 다시 학습 재료로 들어가는
도돌이표를 막기 위해, 뱅크 폴백 경로는 절대 기록하지 않음(기존 item/
dream과 동일한 원칙 유지).

몬스터는 별도 AI 생성 호출이 없음(서사 텍스트에 등장한 걸
`autoDetectAndRegisterEnemy`가 정규식으로 감지해서 이름/능력치를
뽑아내는 구조) — 그래서 몬스터 전용 학습 연결은 대상이 아님, 서사
텍스트 자체가 `turn_narrative`로 학습되니 간접적으로는 커버됨.

빌드에서 총 22개 카테고리, 29개 `recordMarkovSample` 호출 확인
(`grep -c "recordMarkovSample(" dist/taleforge.html`). `node --check`
개별 검증 + 전체 빌드 성공.

**남은 것(안 함, 필요 시 나중에)**: item/dream/turn_narrative 3곳만
"학습된 문장을 뱅크 대신 쓰기"(재사용) 쪽까지 연결돼있고, 나머지
카테고리는 기록만 되고 아직 재사용(`getLearnedText`)까지는 안
이어짐 — 코퍼스가 실제로 쌓이는 것 자체가 먼저 검증돼야 하는 문제라
이번엔 기록 쪽만 전부 채우는 데 집중함.

### ⏸️ 별도 보류 — 도트 이미지 자동 생성

[2026-08-25] 사용자가 몬스터 수집 RPG류 도트 스타일 스크린샷을 보여주며
문의. 텍스트 생성보다 훨씬 무거운 별개 기술(디퓨전 모델, 통상 2GB+,
추론도 훨씬 느림)이고 특정 화풍을 일관되게 뽑으려면 추가 파인튜닝이
필요해 리스크가 큼 — AI 이미지 생성 대신 **도트 부품(머리/몸통/색상
팔레트 등)을 코드로 무작위 조합하는 "조각 조합" 방식**(AI 아님, 모든
기기에서 즉시·안정적으로 동작)을 대안으로 제안. 사용자가 "일단 나중에"
로 보류 확정 — 지금은 착수 안 함, 필요 시 별도로 재논의.

**② 마르코프 패턴학습 엔진, 나머지 시스템으로 확장 — 대기 (①의 결과를 보고 착수 여부 결정)**
- 지금 `items/007`(아이템 desc)/`misc/302`(꿈 desc) 2곳에만 연동됨.
- 패턴은 확립됨 — AI 성공 시 `recordMarkovSample(카테고리, 텍스트)` 한 줄
  추가 + 로컬 조합 쪽에 `getLearnedText(카테고리)` 확률적 사용 한 줄
  추가하면 됨.
- 미적용 대상: 퀘스트(`job/087`) / 장소·게시판(`quest/229`) / 경매
  (`misc/314`) / 연대기(`misc/303`) / 도감(`world/304`) / NPC유산·명장면
  (`patches/322`) / 예언(`lore/301`) / 트라우마(`lore/316`) / 전직
  (`job/042`).

**③ `race/064:autoSuggestNextJob` — 대기 (①의 결과를 보고 착수 여부 결정)**
- 전직 자동 제안 트리거. 같은 `composeLocalNextJobs`를 쓰는 버튼식
  전직(`job/042:generateNextJob`)은 이미 `tryAIThenLocal`로 AI-우선화
  했지만, 이 자동 트리거만 아직 순수 로컬로 남아있음. 낮은 우선순위로
  이전부터 확인만 해두고 미착수.

---

## ⏸️ 보류 / 별도 결정 필요 (지금 같이 묶지 않기로 함)

- **무기별 실제 전투 스탯 차별화** (`combat/210-7-전투-시스템.js`의
  `calcDamage` — 명중률/치명타/데미지 배율을 무기 타입에 따라 다르게).
  프로토타입에는 통계 검증까지 마친 버전이 있지만, 실제 게임 코드에는
  아직 없음. 서술이 아니라 전투 계산식 자체를 바꾸는 거라 리스크가
  다름 — 하려면 별도로 논의하고 진행.
- **문장 뱅크 추가 확장 여부** — 이론상 끝이 없는 작업이라, 필요성이
  분명해질 때(예: 실제로 반복이 눈에 띌 때) 다시 판단.
- **오픈월드 나머지 대륙 확장** — 지금은 중앙 대륙 1곳만 프로토타입으로
  구현됨. 전체 확장은 큰 작업이라 별도 착수 시점 필요.
- **진짜 소설식 서술(캐릭터별 회차 기억/NPC 대사/군중 반응)** — 트레이트
  기반 슬롯 조합 구조로는 원천적으로 안 나오는 영역. 필요하면 완전히
  다른 접근(개별 씬 하드코딩)으로 별도 진행해야 함.
- **브라우저 내장 미니 LLM(WebLLM/Transformers.js 등)** — 기술적으로는
  실존하고 작동하는 기술(Phi-3-mini/Gemma 2B/Qwen 0.5~1.5B 등을
  4비트 양자화해 WebGPU로 브라우저에서 직접 추론). 아래는 본격 통합을
  보류한 이유들인데, [2026-08-25] 이 우려가 실제로 얼마나 심각한지
  프로토타입으로 직접 확인해보기로 함(위 "🔜 다음에 할 일 ①" 참고) —
  본격 통합 자체는 여전히 보류, 가능성 "확인"만 지금 진행:
  - 용량: 한국어가 그럴듯한 최소 크기(1~3B급)도 4비트 압축 시
    500MB~수GB — "가벼운 HTML 파일 하나" 배포 방식 자체가 깨짐.
  - WebGPU 필요 — 사파리 부분지원, 구형/저사양/모바일 기기 다수 미지원.
    안 되면 매 응답 수십 초씩 걸리거나 아예 실패.
  - 작은 오픈소스 모델은 한국어 품질이 Gemini 대비 확연히 떨어짐(문법
    어색함, 영어 혼입 등) — 지금 만든 로컬 조합 문장보다도 못할 수 있음.
  - 결국 최초 1회 대용량 다운로드가 필요해 "네트워크 완전 독립"이라는
    목표와 모순됨(방식만 "매 턴 API"→"최초 1회 대용량 다운로드"로 바뀜).
  - 엔지니어링 규모 자체가 지금까지의 "네트워크 호출→로컬 뱅크 치환"
    패턴과 다른 차원(모델 로딩/캐싱 UX, WebGPU 감지+폴백, 불안정한
    소형모델 응답 파싱/복구 등) — 별도 몇 주짜리 R&D 프로젝트급.
  → 결론: 불가능은 아니나 지금 프로젝트 성격과 안 맞아 보류. 필요시
    완전히 별도 프로젝트로 재검토.

## ✅ "진짜 학습" 방향 — 패턴학습 엔진 (완료)

기존 `recordGeneratedObject`/`pickGeneratedObject` 캐시는 사실 "학습"이
아니라 "저장 후 재생"(AI가 만든 결과물 통째 저장 → 나중에 그대로 재사용)
이라는 한계를 확인. 진짜 "쌓일수록 나아지는" 방향으로 두 가지를 검토
(우선순위: 패턴 학습 > 필드 재조합):

- [x] **패턴 학습(마르코프 체인)** — `quest/086`에 순수 JS 구현 완료.
      - 1차수(직전 단어 1개만 참조) 방식 채택. 사전 테스트로 2차수는
        원본 문장을 그대로 재현할 뿐(다양성 0)임을 확인, 1차수는 14개
        문장 코퍼스에서 50개 생성 중 37개가 진짜 새로운 재조합임을
        확인 후 확정.
      - `markovTrain`/`markovGenerate` (엔진) + `MARKOV_CORPUS_KEY`
        (`tf-markov-corpus`, 카테고리별 최대 150개 누적) + 
        `recordMarkovSample`/`getLearnedText`/`getMarkovCorpusStats`
        (기록/조회 API) — 카테고리당 샘플 10개 이상 쌓이면
        `getLearnedText(category)`가 학습된 새 문장을 반환, 미달이면
        `null`(호출부는 기존 로컬 뱅크로 폴백).
      - 기존 `OBJECT_LEARN`(통째 저장, job+race+era+trigger 등으로 과도
        분화된 키)과는 별도 저장소 — 마르코프 학습용으로 훨씬 덜
        분화된 카테고리 키(`item_desc`, `dream_desc` 등)만 사용.
      - Proof-of-concept 2곳에 연동 완료: `items/007`(아이템 desc,
        AI 성공 시 `recordMarkovSample('item_desc', ...)` 기록 →
        로컬 조합 시 40% 확률로 학습된 문장 사용) / `misc/302`
        (꿈 desc, 35% 확률). 나머지 AI-우선 전환 시스템(퀘스트/장소/
        경매/연대기/도감/NPC유산/명장면/예언/트라우마/NPC대화퀘스트)
        으로의 확장은 패턴은 확립됐으나 아직 미적용 — 필요 시 각
        `_aiGenerated:true` 결과에 `recordMarkovSample` 한 줄만
        추가하면 됨.
- [ ] **필드 재조합** — 보류 (사용자가 패턴학습 쪽을 우선하기로 결정,
      "둘 다 가능하냐"는 질문에 예로 답했으나 아직 미착수).

## ✅ 이름/말투 설정 재작업 (완료)
- [x] **말투**: 실제 도달 가능한 UI가 없는 죽은 코드였음을 확인 후
      복원하지 않고 삭제로 결론. `core/084`의 `getFallbackSugs`에서
      `speechStyle` 전용 추천 문장 배열(`sp`, 10개)과 `pools.speechStyle`
      항목 삭제. (`SETUP_STEPS`에 애초에 `speechStyle` 스텝이 없어서
      `getFallbackSugs('speechStyle')`가 호출될 경로 자체가 없었음 —
      말투는 성격에서 키워드 매칭으로 자동 결정되는 현재 방식 유지.)
- [x] **이름**: 이름 입력 스텝(`core/084`, `renderSetupStep`의
      `step.type==='name'` 분기)에서 AI 후보 칩 목록(`#name-chips-area`)과
      "🎲 AI 새 이름 생성" 버튼(`generateAiNames()`) UI를 완전히 제거,
      자유 타이핑 입력창만 남김. `setupNext()`를 수정해 이름이 빈
      채로 확인을 누르면 토스트로 막던 것 대신 `RACE_NAME_BANK[종족]`
      (12종족×15개, 기존 하드코딩 뱅크 그대로 재사용)에서 무작위로
      하나를 뽑아 자동 배정하도록 변경. UI 제거로 완전히 죽은 코드가
      된 `pickName`/`pickNameByIdx`/`_saveNameToCache`/`generateAiNames`/
      `getLocalNames`와 `startGame()`의 이름 캐시 저장 호출도 함께 삭제
      (이름 추천 캐시 자체가 더 이상 쓰이지 않으므로).
      `node --check` + 전체 `node build.js` 빌드 검증 완료(기존과 동일한
      7개 무관 경고 외 신규 에러 없음).

## ✅ 몬스터 "진짜 생성" 시스템 추가 (2026-08-26, 완료)

**문제 제기(사용자)**: 마르코프 학습을 15개 시스템 전체로 확장한 뒤,
"몬스터·직업·NPC·스토리가 실제로 생성되고 데이터가 쌓이는지" 확인하는
과정에서 **몬스터만 실제 생성 경로가 없다**는 게 드러남. 기존
`checkRandomEncounter`는 설계상 AI 호출이 전혀 없는 순수 동기 함수라,
"새 몬스터"는 AI가 서사 중 우연히 언급한 이름을 사후 감지
(`autoDetectAndRegisterEnemy`)해 장소 풀에 등록하는 것뿐이었음 — 즉
플레이어가 그 몬스터를 실제로 마주치기 *전에는* 이름조차 존재하지
않았음. 사용자가 API를 아직 빼지 않고 로컬 모델과 나란히 남겨둔 이유가
바로 이런 "진짜 창의적 생성"을 시키기 위함이라고 명확히 지적 — 로컬
모델을 메인, API를 보조로 써서 몬스터도 다른 시스템처럼 실제 생성되게
해달라는 요청.

**설계**: `checkRandomEncounter` 자체는 건드리지 않음 — 이미 장소별
몬스터 풀(`_locPool`, 60% 우선 사용)을 보고 있으므로, 그 풀을 실제로
채워주는 별도의 비동기 생성기만 새로 추가하면 기존 동기 인카운터
로직이 자연스럽게 새 몬스터를 집어 쓰게 됨.

- **`quest/086`에 `generateAIMonsterConcept()` 신규 추가**
  (`tryCloudThenLocalModelThenBank` 패턴 그대로 사용 — 로컬 모델 메인,
  API 보조, 로컬 조합 뱅크 최종 폴백).
  - **밸런스는 항상 결정론적**: `MONSTER_TIER_TABLE`에서 이 장소에
    어울리는 티어(`_pickMonsterConceptTierRow` — 이미 이 장소에
    등장했던/이 장소 유형 하드코딩 풀의 몬스터 이름 하나를 표본 삼아
    `getMonsterTierStats`로 티어를 역산, ±1 편차만 줌) 하나를 로컬
    로직으로 먼저 고르고, 그 티어의 실제 키워드(예: `늑대`) 하나를
    "기본 종류"로 확정한 뒤에야 AI를 부름.
  - **AI/로컬 모델은 순수 창작(이름 변형 + 1문장 소문)만 담당**: 프롬프트가
    "반드시 기본 단어를 그대로 포함한 변형 이름"을 요구하고, 응답에
    기본 단어가 빠져 있어도 로컬에서 강제로 붙여 보정 — AI가 규칙을
    지키지 않아도 `getMonsterTierStats`의 키워드 매칭이 깨지지 않아
    스탯이 항상 올바른 티어로 계산됨(이름 없는/키워드 불일치 몬스터는
    안전한 T3 기본값으로 폴백하는 기존 로직도 그대로 유지).
  - 로컬 조합 폴백은 수식어 뱅크(`그림자에 물든`, `핏빛 눈의` 등
    15종) + 소문 뱅크(5종) 조합 — 다른 시스템의 "로컬 조합 폴백"과
    같은 스타일.
  - 생성된 이름은 `registerLocationMonster`로 그 장소 풀에 등록(다음
    인카운터부터 `checkRandomEncounter`가 60% 확률로 우선 선택),
    소문은 별도 `tf-ai-monster-lore`(신규 로컬스토리지 키)에 저장.
  - `shouldGenerateNewMonster`(기존에 있었지만 아무도 안 쓰던
    확률 게이트 함수 — 풀이 작을수록 생성 확률 높고, 8개 차면 완전
    차단)로 게이팅.
  - `recordMarkovSample('monster_name', ...)` / `('monster_lore', ...)`
    를 cloud/local-model 성공 경로에 연결 — 다른 14개 시스템과 동일한
    마르코프 학습 대상에 포함.
- **트리거**: `sendMsg` 후처리 중 `checkRandomEncounter(userMsg)` 바로
  다음 줄에서, 이동/탐험 의도 입력일 때만 25% 확률로 비동기 호출(턴
  응답을 막지 않음) — `shouldGenerateNewMonster`가 풀 크기 기반으로
  한 번 더 확률을 조절하므로 이중 안전장치.
- **소문 노출**: `checkRandomEncounter`가 인카운터 발생 시 만드는
  `_monsterInfoLine`(속성/약점/특성/스킬 안내)에, 그 몬스터 이름이
  `generateAIMonsterConcept`로 실제 생성된 개체라면 저장된 소문도
  함께 실어 AI 서사 프롬프트에 전달 — AI가 그 설정을 자연스럽게
  반영하게 유도.

**버그 1건 발견/수정**: 새 함수들을 `export const/function`으로
선언했다가 `node build.js`에서 `Unexpected "export"` 에러 발생. 원인
추적 결과, 삽입 위치(`doReincarnate` 바로 다음, `checkRandomEncounter`
바로 앞)가 실제로는 `__tfDeferred_67`(파일 유일의 지연 실행 함수 —
`callGeminiForTurn`/`callLocalModelForTurn`/`callAI`/`updateHeader`/
`doReincarnate`/`checkRandomEncounter` 등을 전부 감싸고 있음) **내부**
였음을 확인(esbuild 프리픽스 파싱으로 그 지점의 열림 괄호 깊이를
직접 측정해 확정). 중첩 함수 스코프에서는 `export`가 애초에 불가능하므로,
이 파일의 다른 내부 함수들과 동일하게 `export` 없이 선언하고
`window.X = X`로만 노출하도록 수정 — 파일 안에서 부르는 곳은 전부
`typeof X==='function'` 가드를 이미 쓰고 있어 동작에는 영향 없음.
수정 후 `node --check` + 전체 `node build.js` 재검증 완료(신규 에러
없음, 기존 7개 무관 경고만 유지).

### 2026-08-26 — 로컬 AI 모델 기본값을 "켜짐"으로 전환 (+ 백그라운드 비차단 로딩)

**요청 배경**: 지금까지 로컬 모델은 기본 꺼짐(설정에서 직접 켜야 함)이었다.
사용자가 지적한 문제: "학습도 해야되는데... 모델이 돌아가는게 기본값이어야
하는거 아냐? off면 사실 아무 의미도 없는거잖아" — 꺼짐이 기본이면 대부분의
플레이어는 그 설정 존재 자체를 모르고 지나가서, "로컬 모델을 메인으로"
방침 자체가 실질적으로 죽은 방침이 된다(생성도 학습 코퍼스 적재도 전혀
안 일어남). 타당한 지적이라 판단해 기본값을 바꿈.

**변경 1 — `isLocalModelEnabled()` (quest/331)**: 기존엔 저장값이 정확히
`'1'`일 때만 켜짐으로 판정(→ 아무것도 안 건드린 기기는 항상 꺼짐). 이제
저장값이 명시적으로 `'0'`(사용자가 직접 끔)일 때만 꺼짐으로 판정 — 한
번도 안 건드린 기기 포함, 그 외 전부 켜짐.

**변경 2 — `tryCloudThenLocalModelThenBank`의 로컬 모델 우선 분기 (quest/331)**:
기본값이 켜짐으로 바뀌면서, 이 함수를 처음 타는 순간(대부분의 플레이어의
첫 턴)에 로컬 모델이 아직 한 번도 로드된 적 없는(`idle`) 상태로 들어오게
된다. 예전 로직은 이 경우에도 그냥 `await localModelFn()`을 호출했는데,
그 안에서 `ensureLocalModelLoaded()`가 라이브러리+가중치(수백MB) 다운로드를
전부 기다리게 되어 있어 — 기본 켜짐과 결합하면 **모든 신규 플레이어의
첫 턴이 다운로드가 끝날 때까지 멈추는** 심각한 회귀가 될 뻔했다("AI 없이도
항상 잘 돌아간다"는 이 프로젝트의 최우선 원칙과 정면으로 충돌).
그래서 `getLocalModelState()`로 분기하도록 수정:
  - `ready`(이미 로드 완료) → 기존처럼 로컬 모델을 기다려서 사용(메인 경로).
  - `idle`(한 번도 시도 안 함) → **`ensureLocalModelLoaded()`를 `await`
    없이 fire-and-forget으로만 걸어두고**, 이번 턴은 곧바로 클라우드/
    로컬조합 폴백으로 진행. 다운로드가 끝나 있으면 다음 턴부터 자동으로
    로컬 모델이 메인 경로가 된다 — 사용자가 설정 화면에 들어가 토글을
    누를 필요 자체가 없어짐.
  - `loading`(이미 백그라운드 다운로드 진행 중) → 중복 트리거 없이 이번
    턴도 폴백 사용.
  - `error`(직전 시도 실패) → 매 턴 재시도로 네트워크를 두드리지 않음
    (설정에서 토글을 껐다 켜면 상태가 리셋되어 재시도됨).

**변경 3 — 설정 UI 문구 (quest/331 `renderLocalModelSetting`)**: `idle`
상태일 때 라벨을 "⏳ 대기 중 (이동/행동 시 자동으로 다운로드 시작)"으로
표시해, 꺼져 보이는 게 아니라 켜져 있고 곧 자동으로 받아온다는 걸
알 수 있게 함.

**의도적으로 남긴 트레이드오프**: 이 변경으로 이 기기가 WebGPU를 지원하면
모바일 데이터를 포함해 플레이어 동의 없이 수백MB를 백그라운드로 받기
시작한다(단, 게임을 실제로 플레이하며 이동/행동을 할 때만 — 시나리오
선택 화면 등에서 무조건 받기 시작하진 않음). 데이터 요금이 걱정되는
사용자는 설정에서 토글을 꺼두면 된다(그 토글은 그대로 남아있음). 이
트레이드오프는 사용자에게 알린 상태.

`node --check` + 전체 `node build.js` 재검증 완료(에러 없음, 기존
7개 무관 경고만 유지).

### 2026-08-27 — 헤드리스 브라우저 자체 테스트 확보 + 몬스터 생성 실기기 없이 종단 검증

**배경**: "매번 내가 직접 돌려봐야 하냐, 비효율적이지 않냐"는 지적을 받고
확인해보니, 이 샌드박스에 Playwright + Chromium이 이미 설치돼 있어
빌드된 `dist/taleforge.html`을 실제로 헤드리스 브라우저에서 열고 조작할
수 있었다(이전엔 "브라우저 자체가 없다"고 잘못 알고 있었음). 남는 진짜
한계는 네트워크(클라우드 API, huggingface/esm.run CDN 접속 불가)와
실제 GPU(로컬 모델 실추론) 두 가지뿐 — UI 흐름·크래시 재발 여부는
이제 직접 확인 가능.

**실행한 것**: 캐릭터 생성 8단계(종족→이름→신분→직업→성격→배경→대륙→목표)
전부를 자동 클릭으로 통과 → 게임 진입 → 이동 메시지 전송 → 실제로
"도적단×3" 랜덤 인카운터 발생 → 전투 진입까지 콘솔 에러 0건, 페이지
크래시 0건 확인. 로컬 모델 기본 켜짐 코드도 정상적으로 반복 실행되며
"WebGPU 조건 미충족"으로 우아하게 폴백함을 확인(이 샌드박스엔 실제
GPU가 없어 `requestAdapter()`가 null을 반환하지만, 그 자체가 설계된
정상 동작임).

**몬스터 생성 이슈 조사**: 이동 메시지를 24회까지 보냈는데도
`generateAIMonsterConcept`가 한 번도 로그에 안 잡혀 조사. 직접
`window.generateAIMonsterConcept()`를 호출해보니 `loadCurrentLocation()`이
`null`이었음 — 원인은 이 함수가 "장소 이름"을 요구하는데, 자유 이동
서술(`"숲 쪽으로 걸어간다"`)만으로는 `S.currentLocation`이 설정되지
않고, 지도/여행 시스템을 통한 실제 "이동" 액션을 해야만 설정됨을 확인.
이는 새 버그가 아니라 `checkRandomEncounter`도 이미 공유하고 있던
특성(장소가 없으면 하드코딩 범용 풀 `ENCOUNTER_POOL`로 조용히 폴백)과
동일한 전제 — 실제로 첫 테스트에서 "도적단×3"(ENCOUNTER_POOL의 항목)이
뜬 것도 이 상태였기 때문. `saveCurrentLocation()`으로 가짜 장소를
주입해 재현한 결과, 생성 자체는 완벽히 동작함을 확인:
`"안개 속에서 나온 도마뱀 병사"`(MONSTER_TIER_TABLE 실제 키워드
"도마뱀 병사" 포함, 로컬조합 경로) 생성 → 장소 풀·소문 맵에 정상 등록
→ 진단 로그 정상 기록.

**개선 1건**: `generateAIMonsterConcept` 성공 시점에 로그가 전혀
없었음(실패할 때만 `tryCloudThenLocalModelThenBank`가 진단 로그를
남기는 구조라, "한 번이라도 실제로 작동했는지"를 진단 로그만으로는
확인할 방법이 없었음). `logLocalModelEvent`를 import해 성공 시
`[몬스터 생성] "이름"을(를) "장소" 풀에 등록 · 소문: ...` 한 줄을
남기도록 추가 — 이제 이후 실기기 테스트든 제 자체 헤드리스 테스트든
이 로그 한 줄로 바로 확인 가능. `node --check` + 전체 `node build.js`
재검증 완료(에러 없음).

### 2026-08-27 계속 — "맥락과 무관한 보스 등장" 버그 조사 및 수정

**신고 내용**: 노예 신분으로 감독관을 피해 환풍구로 탈출을 시도하는
장면 도중, 아무 맥락도 없이 "고대 드래곤" 보스가 등장(상단 보스 HP바
+ "도망 시도(보스전—위험)" 경고 + "고대 드래곤을 향해 도발적인
한마디를 던진다"는 선택지까지 생성됨).

**원인 규명**: `data/054`의 `BOSS_MONSTERS.medieval`은 턴 수(`turnTrigger`,
20~1100까지 18단계)와 장소 "유형"(`locTypes`: dungeon/event/special 등)
만으로 게이팅되는 장기 마일스톤 보스 사다리다. `boss_dragon`("고대
드래곤")은 실제로는 `data/052`의 특정 장소(`loc_dragon_lair`, "용의
둥지", "고대 드래곤이 잠든 전설의 동굴")를 염두에 두고 지어진 이름·
플레이버지만, `checkBossSpawn`은 그 특정 장소인지는 전혀 확인하지
않고 "장소 유형이 dungeon이기만 하면" 어디서든 등장시킨다. AI가 노예
캐릭터의 서사(갱도·감옥 통로 등)를 장소 유형 `dungeon`으로 분류해
버리면, 그 장면이 용과 아무 상관 없어도 turnTrigger만 넘기면 그대로
등장 — 이번 신고 사례가 정확히 이 경로로 재현됨(정적 분석 + 직접
`window.checkBossSpawn()` 호출로 확인).

**수정**: `data/052`에 정식으로 큐레이션된 던전 31곳은 전부
`dungeonTier`(1~4)가 붙어 있음을 확인. `checkBossSpawn`에서 현재
장소 유형이 `dungeon`인데 `dungeonTier`가 없는 경우(=AI가 즉석에서
"이 장면은 dungeon 유형"이라고만 분류한 임의의 장소)에는 마일스톤
보스 등장을 아예 건너뛰도록 게이트 추가. event/special 타입은 별도
티어 필드가 없어 기존 동작 유지(범위를 넓히지 않음).

**검증**: 헤드리스 브라우저로 두 경우를 직접 재현해 확인 — ①
`dungeonTier` 없는 임의의 "광산 갱도"(type:dungeon)에서
`msgCount:35`로 강제해도 `boss_dragon` 미등장(수정 후 정상) ②
`dungeonTier:4`가 붙은 실제 "용의 둥지"에서는 여전히 정상 등장(회귀
없음 확인). `node --check` + 전체 `node build.js` 재검증 완료.

### 2026-08-27 계속 — "꿈 팝업 폭주" 버그 (사용자 실기기 로그 228건 확인 후 수정)

**신고 내용**: HP가 1로 고정된 채로 "전생의 기억"/"미래의 단편" 팝업이
5개씩 연달아 뜨는데, 마지막 팝업만 선택 가능하고 눌러도 아무 변화가
없음. 사용자가 첨부한 실기기 로그(313KB)를 분석한 결과 같은 플레이
세션에서 `[꿈 생성]` 시도가 **228회** 기록됨(정상적으로는 세션당
1~수 회 수준이어야 함) — 그 여파로 클라우드 API 무료 할당량이
소진되어(`Quota exceeded... limit: 5, model: gemini-2.5-flash`) 이후
매턴 서사·퀘스트 생성까지 연쇄로 실패, 사용자가 계획했던 진행(월드맵
이동)이 막힘.

**원인**: `checkDreamTrigger`(misc/302)는 AI 메시지 말풍선이 DOM에
새로 추가될 때마다(misc/308의 MutationObserver, 한 턴에 주사위 결과
박스+서사 본문처럼 말풍선이 여러 개 생기기도 함) 호출되는데, 쿨다운이나
재진입 방지가 전혀 없었다. HP 10% 이하 조건(`hp10`)은 HP가 낮은 채로
여러 턴 머무는 동안 계속 참이라, 새 말풍선이 생길 때마다 50% 확률로
`triggerDream()`을 새로 호출 — 그때마다 로컬모델+클라우드 API를 각각
두드리는 전체 3단 폴백을 처음부터 다시 시작했다. 게다가 각
`triggerDream()` 호출이 비동기로 서로 다른 시점에 끝나면서, 먼저
뜬 꿈 팝업을 나중에 끝난 호출이 조용히 덮어써 "마지막 것만 눌리고
반응 없음" 현상까지 만들어냄.

**수정** (`misc/302-②-꿈환영-시스템.js`):
1. `S._dreamInFlight` 플래그 추가 — 꿈이 생성 중이거나 팝업이 화면에
   떠 있는 동안은 `checkDreamTrigger`가 새 시도를 하지 않는다. 이
   플래그는 생성 완료 시점이 아니라 **플레이어가 실제로 팝업을 닫을
   때**(`chooseDream`/새로 추가한 `dismissDreamPopup`) 풀린다 — 그래야
   화면에 떠 있는 팝업이 다른 비동기 호출에 덮어써지지 않는다.
2. `S._lastDreamTurn` 쿨다운 추가 — 같은 턴에서는 재시도하지 않고,
   마지막 꿈 이후 최소 5턴이 지나야 다시 시도한다.
3. 예상 못한 예외로 `_dreamInFlight`가 영구히 true로 남아 이후 꿈이
   전부 막히는 사고를 막기 위해 생성 로직 전체를 try/catch로 감싸
   실패 시 플래그를 확실히 해제.

**검증**: 헤드리스 브라우저로 실제 사고 상황을 재현 — HP 1%·같은 턴
번호로 AI 말풍선 20개를 연달아 주입한 결과, 수정 전 로직이었다면
다수 발동했을 상황에서 **정확히 1개**의 꿈만 생성·저장됨을 확인. 이어서
그 팝업을 닫고 5턴 이상 지난 뒤 다시 말풍선 20개를 주입하자 정상적으로
**새 꿈 1개가 추가**로 발동함을 확인(쿨다운이 풀린 뒤엔 정상 동작,
영구 잠금 아님). `node --check` + 전체 `node build.js` 재검증 완료.

### 2026-08-27 계속 — Gemini 모델 우선순위 실측 반영 + 꿈 발동 확률 하향

**배경**: 사용자가 본인 Google AI Studio 계정의 실제 할당량 페이지를
캡처해서 제공 — gemini-3.1-flash-lite/gemini-3.5-flash-lite는 분당
15회·**일일 500회**인 반면, gemini-2.5-flash/gemini-2.5-flash-lite는
분당 5~10회인 데다 **일일 겨우 20회**뿐이라 금방 바닥남을 확인.
gemini-2.0-flash는 이 계정 기준 할당량이 아예 0(사용 불가)이었음.

**수정 1 — `GEMINI_FALLBACK_MODELS` 순서 정리** (`data/229`): 이미
3.5/3.1-flash-lite가 앞에 있었지만, 할당량이 0인 gemini-2.0-flash를
제거(매번 헛된 요청만 낭비)하고 2.5 계열을 최후순위로만 남김.

**수정 2 — `callGeminiForTurn`(매턴 서사)도 다중 모델 폴백 사용**
(`quest/086`): 기존엔 `GEMINI_FALLBACK_MODELS[0]` 하나만 시도하고
실패(할당량 초과 포함)하면 바로 로컬 모델/로컬 조합으로 넘어갔다 —
꿈·퀘스트 등에 쓰이는 `callGeminiDirect`(quest/229)는 이미 목록 전체를
순서대로 시도하는데 매턴 서사만 그렇지 않은 비대칭이 있었다. 이제
동일하게 목록 전체를 순서대로 시도한 뒤에야 폴백하도록 통일 — 앞쪽
모델 하나가 그 순간 한도에 걸려도 다음 모델이 아직 여유가 있으면
그걸로 성공할 수 있다.

**수정 3 — 꿈 발동 확률 50% → 20%** (`misc/302`): 폭주 자체는 앞서
쿨다운/재진입 가드로 막았지만, "HP 낮은 상태가 여러 턴 이어질 때마다
5턴 쿨다운 끝날 때마다 50% 확률로 계속 꿈이 끼어드는 것도 거슬린다"는
피드백을 반영해 하향 — 좀 더 "가끔 있는 특별한 사건"에 가깝게 조정.

`node --check`(3개 수정 파일) + 전체 `node build.js` 재검증 완료,
헤드리스 브라우저로 캐릭터 생성→이동→전투 흐름 재확인(신규 에러
없음, 정상 플레이 가능 상태 확인).

### 2026-08-27 계속 — 신분(사회적 지위) 순차 해금 시스템 추가

**요청**: 캐릭터 생성 시 신분 선택을 처음부터 24개 다 열어두지 말고,
첫 시작은 "노예"로만 가능하게 하고 나머지는 플레이(환생)를 거듭할수록
하나씩 열리게 해달라는 요청. 두 가지 세부 방식(티어 단위 vs 신분
1개씩, 카운트 기준)을 사용자에게 확인 후 "신분 1개씩 순서대로 +
총 환생 횟수 기준"으로 결정.

**구현** (`core/084-TaleForge-순수-JS-엔진.js`): 이미 `SOCIAL_RANKS`
배열에 노예→...→상황(上皇)까지 24개 신분이 선언 순서(=tier 순서)대로
들어있는 걸 그대로 활용. `getSocialRankUnlockReq(rankId)` — 배열
인덱스 × 5를 그 신분에 필요한 누적 환생 횟수로 계산(노예=0회,
부랑자=5회, 농노=10회 ... 마지막 신분=110회). `isSocialRankUnlocked`가
기존 환생 누적 시스템의 `loadCycleCount()`(NG+ 환생 시 이미 1씩
누적되고 있던 값, `quest/086`의 `doReincarnate`에서 증가)와 비교.
`pickSocialRank`에 가드 추가 — 잠긴 신분 클릭 시 선택되지 않고
"🔒 아직 열리지 않은 신분입니다 (환생 N회 필요)" 토스트만 뜸.
신분 선택 화면 렌더링에도 잠긴 카드는 회색조+자물쇠 아이콘+필요
환생 횟수로 표시(숨기지 않고 "앞으로 열릴 목표"로 보이게 함).

**검증**: 헤드리스 브라우저로 캐릭터 생성 신분 단계까지 진행해
스크린샷 확인 — 신규 캐릭터(환생 0회) 기준 노예만 색이 살아있고
클릭 가능, 나머지 23개는 전부 회색+🔒+"환생 N회 필요"로 정확한
숫자(5, 10, 15... 110)와 함께 표시됨. 잠긴 카드(부랑자) 클릭 시
`setupChar.socialRankId`가 바뀌지 않음을 확인, 노예 클릭 시
정상적으로 `'slave'`로 선택됨을 확인. `node --check` + 전체
`node build.js` 재검증 완료.

### 2026-08-27 계속 — 신분·시작 대륙이 오프닝에 실제로 반영되게 수정

**신고 내용**: "신분이랑 처음 나오는 대륙마다 확실하게 처음에 차이가
있었으면 좋겠는데, 지금은 선택은 하는데 사실 차이가 없다."

**원인 확인**: 오프닝(1턴차) 로컬 조합 텍스트(`TURN_OPENING_BANK`,
quest/086 `composeLocalTurnText`)가 `{name}`/`{loc}` 두 변수만 채우는
범용 템플릿 3개뿐이었고, 신분(`SOCIAL_RANKS`)·시작 대륙
(`START_CONTINENTS`, 원래 신분 선택 화면 렌더링 안에만 지역 변수로
있던 것)은 전혀 참조하지 않았다. 게다가 게임 시작 시점엔
`loadCurrentLocation()`이 항상 `null`이라 `{loc}`조차 "낯선 땅"이라는
고정 문구로 빠져서, 어떤 신분·대륙을 골라도 로컬 폴백으로 열리는
오프닝은 사실상 완전히 동일했다(AI가 실제로 응답할 때만 우연히
반영될 뿐). 이번 세션 내내 확인된 대로 클라우드/로컬모델 실패가
드물지 않아 로컬 폴백이 자주 쓰이므로, 실제 체감상 "선택해도 차이
없음"이 되고 있었다.

**수정**:
- `core/084`: 신분 선택 화면에서만 쓰던 대륙 데이터(중앙/북/동/서/남/
  북동/남동/북서, 각각 손으로 쓴 `desc`·`lore` 보유)를 모듈 최상위
  `export const START_CONTINENTS`로 승격 — 신분 데이터(`SOCIAL_RANKS`,
  각 신분마다 이미 `lore` 보유)와 마찬가지로 다른 파일에서도 가져다
  쓸 수 있게 함(UI 렌더링 부분은 그대로 이 배열을 참조하도록 수정,
  중복 로직 없음).
- `quest/086`: `composeRankContinentOpening(char)` 신규 — 아직 구체적
  장소가 없는(=거의 항상 그런 첫 턴) 상태에서, 선택한 신분의 `lore`와
  시작 대륙의 `desc`/`lore`를 엮어 오프닝 문장 3가지 변형 중 하나로
  조합. `composeLocalTurnText`의 오프닝 분기에 연결 — 기존 "학습된
  문장 재사용"(35%) 우선순위는 그대로 유지, 그 다음 순위로 적용.

**검증**: 헤드리스 브라우저에서 `window.composeLocalTurnText([], '')`를
직접 호출해 4가지 조합(노예+동대륙, 왕+북대륙, 상인+서대륙, 노예+
중앙대륙) 확인 — 신분·대륙이 다르면 완전히 다른 문장이, 같은 신분
다른 대륙(노예+동대륙 vs 노예+중앙대륙)이면 신분 부분은 유지되고
대륙 부분만 바뀌는 것을 확인. `node --check`(2개 수정 파일) + 전체
`node build.js` 재검증 완료(부수적으로, 옮기면서 대륙 데이터의
기존 중복 `svgIcon` 키 경고 7건도 함께 없어짐).

### 2026-08-27 계속 — "연결 안 된 콘텐츠" 전수조사 + 종족까지 오프닝에 반영

**배경**: 신분·대륙 건을 고친 뒤 "왜 이런 식으로 연결 안 된 게 많냐,
분명 모듈화하면서 꼼꼼히 봤다고 하지 않았냐"는 지적. 정직하게 답변:
그동안의 모듈화(폴더 분리)·163건 버그 수정은 "같은 동작을 유지하며
위치만 정리" / "에러 나는 것"을 잡는 작업이었지, "데이터는 있는데
어디서도 안 읽히는 필드"를 잡는 종류의 작업이 아니었다. 이건 크래시가
안 나서 코드 리뷰로는 안 잡히고, 실제로 플레이하며 "이거 반영이
안 되네?"라고 느껴야만 나온다.

**전수조사 실시**: `.lore`(전체 417곳 선언) 등 "설정 텍스트" 필드가
실제로 얼마나 읽히는지 코드베이스 전체에서 역추적. 결과는 걱정했던
것보다 훨씬 나았음 — 아이템·퀘스트·장소·직업·몬스터·종족·세력·신
등 거의 모든 시스템에서 `.lore`/`.desc`가 AI 프롬프트 조립
(`ai-prompt/077`)이나 마르코프 학습 기록, UI 패널에 실제로 광범위하게
쓰이고 있었다. 즉 "전체가 안 연결돼 있다"는 아니었음.

**정확한 원인 재정의**: 진짜 패턴은 "AI 프롬프트 경로(`buildLightSystem`)는
이미 다 참조하고 있는데, **로컬 전용(AI 미사용) 오프닝 서사만
따로 떨어져서 훨씬 부실하다**"였다. `composeLocalTurnText`의 오프닝
분기는 최근에 새로 만들어진 함수라 AI 경로가 이미 알고 있는 것들을
아직 못 따라간 상태 — 그래서 신분·대륙에 이어 **종족(`RACE_DEFS.lore`,
이미 AI 프롬프트에는 들어가고 있었음)도 같은 사각지대**였음을 확인.
직업(`role`)은 시작 시점엔 짧은 `desc` 한 줄뿐이라 해당 없음(직업
전용 lore는 이후 전직·파생 시스템에서 붙는 구조라 원래도 정상).
성격·배경은 자유 텍스트라 애초에 데이터 테이블이 아니라 이미
그대로 프롬프트에 실리고 있어 해당 없음.

**수정** (`quest/086` `composeRankContinentOpening`): `RACE_DEFS`에서
`char.race`로 종족 정의를 찾아, `lore`(길면 첫 문장만 추출)를 오프닝
문장에 추가 절로 엮어 넣음. 신분·대륙 로직과 동일한 폴백 원칙 유지.

**검증**: 헤드리스 브라우저로 (인간+노예+동대륙), (엘프+노예+동대륙),
(드워프+왕+북대륙) 3개 조합 직접 호출 확인 — 신분·대륙이 같고
종족만 다른 두 번째 조합에서 종족 절만 정확히 바뀌고 나머지는
동일하게 유지됨을 확인(합성 로직이 올바르게 모듈화돼 있다는 뜻).
`node --check` + 전체 `node build.js` 재검증 완료, 캐릭터 생성→
이동 전체 흐름 회귀 테스트도 재확인(신규 에러 없음).

### 2026-08-27 계속 — 전체 로컬 폴백(bankFn) 전수조사 및 수정

**배경**: "다른 부분은 확인 안 해봐도 되냐, 아까는 다 확인해본다고 하지
않았냐"는 정당한 지적. 실제로는 오프닝 하나만 봤었어서, 이번엔 진짜로
`tryCloudThenLocalModelThenBank` 사용처 12개 파일·16개 호출 지점을
전부 조사(서브에이전트 위임 후 결과 직접 검토). 클라우드 프롬프트가
쓰는 캐릭터/맥락 정보를 로컬 폴백(bankFn)이 무시하는 동일 패턴
("THIN")이 16곳 중 10곳에서 확인됨 — 오프닝 버그는 예외가 아니라
지배적인 패턴이었음.

**실제로 고친 것**:
1. **매턴 서사**(`quest/086` `composeLocalTurnText`, 영향 범위 최대 —
   전체 턴의 대다수) — 오프닝 이후 모든 턴이 주사위 결과/잡담 여부로만
   갈리고 신분·종족을 전혀 안 봤음. `composeIdentityFlavorFragment`
   신규 추가, 20% 확률로 짧은 한 구절만 앞에 붙임(매턴 긴 설정을
   반복하면 오히려 거슬리므로 확률 조절).
2. **NPC 퀘스트 제안**(`quest/229`) — 호감도(관계도)와 무관하게 인사말/
   제안 대사가 고정 4개짜리 뱅크였음(극혐 NPC와 절친 NPC가 똑같이
   말함). 클라우드가 쓰는 것과 동일한 5단계 관계 등급으로 뱅크 분리.
3. **장소 생성**(`quest/229` `composeLocalLocation`) — **진짜 버그**:
   새로 발견한 장소의 대륙이 8개 중 완전 무작위로 배정돼, 서대륙에
   있는데 새 장소가 북동 대륙으로 찍히는 지리적 모순이 났음. 현재
   위치의 대륙(없으면 시작 대륙) 우선으로 수정.
4. **게시판 항목**(`quest/229` `composeLocalBulletinItems`) — 장소
   유형과 무관하게 항상 'misc' 컨텍스트로 고정돼 던전이든 마을이든
   같은 성격의 퀘스트가 나옴. 장소 유형→퀘스트 성격 매핑 추가.
5. **아이템 생성**(`items/007` `generateLocalItem`) — **데이터 무결성
   버그**: 이 함수는 로컬 조합(뱅크) 폴백인데 `_aiGenerated:true`로
   잘못 표시돼 있어서, 뱅크 템플릿 문장이 실제 AI가 쓴 문장인 것처럼
   마르코프 학습 코퍼스에 계속 섞여 들어가고 있었다 — "로컬 조합
   결과는 학습 재료로 안 쓴다"는 이번 세션 내내 지켜온 원칙이 아이템
   생성에서만 깨져 있었음. `false`로 정정.
6. **꿈**(`misc/302` `composeLocalDream`) — 종족을 전혀 안 봤음.
   "전생의 기억" 유형일 때만 30% 확률로 종족 관련 한 문장 추가.
7. **NPC 유산/유언**(`patches/322` `composeLocalNpcLegacy`) — NPC의
   role(전사/상인 등)을 무시하고 사망/작별 여부로만 갈렸음. role이
   있으면 그 직업다운 문장을 앞에 붙이도록 수정(조사 붙임 문제를
   피하려 "{role} 일을 해온 사람" 형태로 구성).

**조사했지만 "버그 아님"으로 판단해 손대지 않은 것**:
- **예언**(`lore/301`) — 코드 내 주석에 "예언은 원래도 모호하고
  시적으로, 이름이 안 박히게" 짓는 게 설계 의도라고 명시돼 있고, 그래야
  종족+직업 버킷으로 캐시 재사용이 안전하다는 이유가 있음. 의도적
  설계이지 누락이 아니라고 판단.
- **경매**(`misc/314`) — era(세계관) 무관하게 같은 물품이 나온다는
  지적이 있었지만, 이 게임은 이미 이전 세션에서 중세 판타지 시나리오
  하나로 통일됐음(`S.scenario`가 항상 `MEDIEVAL_SCENARIO`로 고정) —
  즉 era 자체가 상수라 실제로는 아무 차이도 안 생기는 항목.

**아직 안 건드린 것(우선순위 낮음, 필요하시면 다음에)**:
- 직업 승급 후보(`job/042`) — 현재 직업의 category+tier로 이미
  일관된 진행 로직이 있어 종족 반영 필요성이 상대적으로 낮다고 판단,
  시간상 보류.
- 동적 퀘스트 생성(`job/087`, NPC 대화가 아닌 자동 발생 퀘스트) —
  NPC 퀘스트 제안 쪽은 이미 고쳤고, 이쪽은 상대적으로 덜 자주 보이는
  경로라 이번 라운드에선 보류.

`node --check`(수정된 5개 파일) + 전체 `node build.js` 재검증 완료,
캐릭터 생성→이동 전체 흐름 회귀 테스트 재확인(신규 에러 없음).

### 2026-08-27 계속 — 전수조사 THIN 항목 전부 마무리

"이번 기회에 다 고치자"는 요청으로 보류했던 마지막 2건도 처리:

- **직업 승급 후보**(`job/042` `composeLocalNextJobs`) — 밸런스(스탯/
  스킬)는 그대로 현재 직업의 category+tier 기반으로 두고, 3개 후보 중
  1개의 lore에만 40% 확률로 종족 관련 한 문장 추가(3개 다 붙이면
  반복되는 느낌이라 하나만).
- **동적 퀘스트**(`job/087` `composeLocalQuest`) — 이 함수는 NPC
  퀘스트 제안·장소 생성·게시판·자동 퀘스트까지 **4곳이 공유하는
  로컬 폴백**이었다. `S.character`는 어디서든 접근 가능하므로
  함수 내부에서 직접 읽도록 해서, 호출부 4곳을 각각 고칠 필요 없이
  한 번의 수정으로 전부 적용되게 함 — 25% 확률로 종족 관련 문장 추가.

헤드리스 브라우저로 직접 호출해 확률대로 발동하는지 확인(직업 7/10회
≈40%, 퀘스트 10/40회=25%, 둘 다 의도한 확률과 일치). `node --check`
(수정 2개 파일) + 전체 `node build.js` 재검증 완료, 캐릭터 생성→이동
전체 흐름 회귀 테스트 재확인(신규 에러 없음).

이것으로 전수조사에서 발견한 16개 지점 중 실제 수정이 필요했던 10곳
전부 처리 완료. 나머지 6곳은 애초에 GOOD(이미 캐릭터/맥락 반영) 또는
N/A(캐릭터 정체성과 무관한 콘텐츠, 또는 이미 다른 이유로 의도된
설계)로 분류된 곳들.

### 2026-08-27 계속 — "이번 생의 목표" 실제 게임 효과 연결 + 대사 어색함 완화

**요청**: "캐릭터 생성하면 이번생의 목표 있는데 이거 선택하면 난이도
올라가게 하고 보상도 있는식으로하면 어떄? ... 대신 난이도에 맞게
미션을 구현해야될거고" + "대사 이상하다;;;; 지금 켜자마자 너무
어색한데;;" (오프닝 대사 캡처 첨부, "역부족"을 "고된 노동" 뜻으로
잘못 쓴 사례 포함).

**조사 중 발견한 더 큰 문제**: 캐릭터 생성 때 고르는 "이번 생의 목표"
(`misc/261`의 `GOAL_OPTIONS`, 최대 3개 선택) 기능 자체가 애초부터
**완전히 죽은 코드**였다. `misc/261`은 `window.renderSetupStep` /
`window.doStartChat`을 감싸는 방식으로 목표 선택 UI와 오프닝 서사
주입을 구현했는데, 실제로 이 함수들을 호출하는 `core/084`의
`setupNext()`/`startGame()`은 그 함수들을 **같은 모듈 안의 지역
바인딩(import)으로 직접 호출**한다. ES 모듈에서 `import`로 가져온
함수 참조는 나중에 `window.X = 다른함수`로 바꿔치기해도 바뀌지
않는다 — `window.X`를 다시 대입하는 건 전역 객체의 프로퍼티만 바꿀
뿐, 이미 클로저에 캡처된 지역 참조는 원본 함수를 계속 가리킨다.
즉 목표 선택 단계에 들어가면 UI 자체가 목표 카드 그리드가 아니라
"성격/배경" 단계용 범용 추천·직접입력 UI로 대체 렌더링되고 있었고
(헤드리스 브라우저로 직접 재현·확인), 설령 값을 넣어도 게임에는
아무 영향이 없었다. 사용자가 예전에 "선택은 하는데 사실 차이가
없잖아"라고 한 지적이 바로 이 버그였던 것으로 보인다.

**근본 수정**: 목표 선택 UI와 오프닝 주입 로직을 실제로 호출되는
경로(`core/084`의 `renderSetupStep()` 네이티브 분기, `quest/086`의
`doStartChat()` 네이티브 로직)로 이식하고, `misc/261`에 남아있던
죽은 `window.renderSetupStep`/`window.doStartChat` 래핑과 중복
데이터(`LIFE_GOAL_MECH`, `GOAL_OPTIONS`, `SETUP_STEPS.push`)는
제거해 소스가 두 군데로 갈라지지 않게 정리. 목표 데이터 원본은
`data/030`에 `LIFE_GOALS`(12종, 원작 `CLEAR_GOALS`와 동일한 컨벤션의
`statBonus:{스탯키:수치}` 직접 맵 형태)로 새로 추가.

**실제로 구현된 효과**:
1. **난이도**: 고른 목표들의 `difficulty`(1~3) 합계를
   `S._goalDifficulty`에 저장 → `misc/054`의
   `getEnemyScaleMultiplier()`에 `goalMult`(난이도 1점당 +5%, 최대
   +30% 캡) 항목으로 곱연산 반영 — 이번 생 내내 전투 난이도에 실제로
   영향을 준다.
2. **미션**: 고른 목표 중 첫 번째가 기존에 있던 "회차 클리어 목표"
   시스템(`misc/030`의 `CYCLE_GOAL`, 매 성공 턴마다 진행도 누적, AI
   시스템 프롬프트에도 노출)의 실제 목표로 등록된다. 목표 난이도에
   따라 완료에 필요한 진행도(`targetProgress = 60 + 난이도*20`)가
   달라져 어려운 목표일수록 더 오래 걸린다.
3. **보상**: 목표 달성 시(`quest/086`의 기존 턴 처리 로직) 이번 생
   스탯에 즉시 보너스가 붙는 것에 더해, **영구 누적 스탯 보너스**
   (`loadPermStatBonus`/`savePermStatBonus` — 환생해도 유지되는
   저장소, 캐릭터 생성 시 기본 스탯에 자동 합산됨)에도 같은 만큼
   적립되도록 추가 — "환생할 때 영향이 가게"라는 요청을 그대로
   충족.
4. 목표를 하나도 안 고르면 난이도 0, 기존처럼 환생 시 랜덤 배정되는
   클리어 목표가 그대로 유지(하위 호환).

**구현 중 잡은 실수**: 처음에 `statBonus`를 `{stat:'agi',amount:3}`
형태(다른 파일 `patches/322`의 NPC 유산 시스템 컨벤션)로 만들었는데,
정작 이 값을 소비하는 기존 코드(`quest/086`의 스탯 적용부)는
`{agi:3}` 같은 직접 맵 형태를 기대하고 있어서 `Object.entries`가
엉뚱하게 `{"stat":"0agi","amount":3}`를 저장하는 버그가 났다.
실제로 목표를 강제 완료시켜 로컬스토리지 값을 확인하다가 발견,
`data/030`의 `LIFE_GOALS` 전체를 원작 `CLEAR_GOALS` 컨벤션에
맞춰 직접 맵 형태로 수정.

**대사 어색함("역부족" 오용) 진단**: 캡처된 오프닝 문장은 구조가
복잡하고 고유명사("은빛 사자 기사단")까지 지어낸 정황상 로컬 뱅크
템플릿이 아니라 실제 AI(클라우드 또는 로컬 모델) 생성 결과로 보임.
"역부족"(능력/노력이 부족하다는 추상명사)을 "고된 노동"이란 뜻으로
쓴 건 전형적인 언어모델의 단어 오용 — 특히 이전에 할당량 문제로
요청하신 대로 flash-lite급 경량 모델을 우선순위로 올린 것과 트레이드
오프 관계에 있는 문제라, 완전히 없앨 수는 없음을 먼저 알려드림. 다만
`misc/076`의 `buildLightSystem`(실제 쓰이는 시스템 프롬프트 조립
함수 — `ai-prompt/077`의 `buildSystem`은 폴백용)의 서술 규칙 맨
앞부분에 "모든 단어는 정확한 사전적 의미로만 사용하고, 뜻이
불확실한 한자어·고어체는 더 쉬운 현대 한국어로 바꿔 써라"는 지침을
추가해 빈도를 낮추는 완화 조치만 적용.

`node --check`(수정된 8개 파일) + 전체 `node build.js` 재검증 완료.
헤드리스 브라우저로 (1) 목표 2개 선택 시 난이도 미리보기·`
S._goalDifficulty`·`CYCLE_GOAL`·`getEnemyScaleMultiplier` 값 전부
정상 반영 확인, (2) 목표를 강제로 완료시켜 이번 생 스탯 증가 +
영구 보너스 저장소(`taleforge-perm-stat-bonus`) 정상 적립 확인,
(3) 목표를 아예 안 고르는 기존 플로우도 회귀 없이 정상 동작
확인(오프닝 대사·이동 1턴, 콘솔 에러 없음).

**후속 — 오프닝 전용 모델 우선순위 조정** (사용자가 "flash 모델은
일일 할당량이 20회뿐인데 결국 못 고치는 거 아니냐"고 재차 질문):
처음엔 gemini-2.5-flash(품질 제일 좋지만 일일 20회 한도)를 오프닝
호출(`history.length===0`)에서만 최우선으로 쓰도록 `callGeminiForTurn`
모델 순서를 재정렬하는 절충안을 시도했었다.

**최종 — 오프닝은 아예 AI 호출 자체를 하지 않도록 변경** (사용자
제안: "그냥 오프닝에서 쓸거만 따로 만들어놓으면 되는거 아냐?"):
위 절충안보다 더 나은 방향이라 판단해 채택. 오프닝은 캐릭터 생성
직후 딱 한 번뿐이고, 이미 신분·시작 대륙·종족을 반영하는 로컬
전용 오프닝 생성기(`composeRankContinentOpening` → 이번 세션
앞부분에서 만든 것, `composeLocalTurnText`가 감싸서 씀)가 있으므로
그걸 그냥 바로 쓰면 클라우드 호출 자체가 필요 없다. `doStartChat`의
`const text=await window.callAI([],startOp);`를
`const text=composeLocalTurnText([],startOp);`로 교체 — API 호출
0회, 단어 오용 위험 0, 응답 지연도 없음(전체 챙겐+오프닝이 약 2초).
매턴 서사는 원래대로 클라우드 우선 3단계 폴백 유지, 오프닝만
로컬 전담으로 분리. 이제 아무 호출도 `history.length===0`으로
들어오지 않으므로, 방금 전에 넣었던 `callGeminiForTurn`의 "오프닝
전용 모델 우선순위" 분기는 죽은 코드가 되어 제거했다.

헤드리스 브라우저로 (1) 챙겐→오프닝 전 구간 Gemini API 요청 0건
확인(네트워크 요청 캡처), (2) 오프닝 텍스트가 여전히 신분·대륙·종족
반영해서 잘 나오는지 확인, (3) 오프닝 이후 일반 턴 2회 연속 정상
진행 확인(3번째 msg-ai까지 증가, 콘솔 에러 없음). `node --check` +
전체 `node build.js` 재검증 완료.

### 2026-08-27 계속 — 이전 세션 기능 8종 전수 재검증 + 이동 시스템 버그 2건

사용자가 "예전에 고친 것들도 지금 다 실제로 작동하는지 확인했냐"고 물어서,
헤드리스 브라우저로 window에 노출된 함수를 직접 호출해 8개 기능을 전부
재검증했다: 꿈 팝업 뮤텍스/쿨다운(같은 턴 50연속 호출→정확히 1개만 발동),
보스 dungeonTier 게이팅(미확인 던전 스폰 안 됨/정식 던전만 스폰), 신분
순차 언락(24개 신분 unlocked 값이 요구 회차와 일관), NPC 관계 등급별
대화(호감도 90/5 각 20회 호출 → 20/20 정확히 intimate/hostile 뱅크),
대륙별 장소 생성(현재 대륙과 10/10 일치), 게시판 퀘스트 타입 매핑(7개
장소 타입 전부 크래시 없음), 아이템 `_aiGenerated:false`(5/5 정상),
직업 승급/동적 퀘스트 종족 반영(각각 확률 37%/23.5% ≈ 기대치 40%/25%).
전부 통과 — 콘솔 에러 없음.

이어서 사용자가 스크린샷 3장을 보내며 새 버그를 신고: (1) 도망 시도가
성공했는지 헷갈림, (2) 그냥 걷는 이동도 골드가 드는 게 이상함, (3) 마을에
도착했더니 `"md-location">시스템 ⌂ 국경 마을 더스크홀름에 도착했다...`
같은 깨진 원문이 채팅에 그대로 노출됨.

**(1) 도망 시도** — 확인해보니 버그가 아니라 정상 동작. 화면에 `[민첩
D100:45] ❌ 실패` 배지와 함께 실패 서사가 나온 것으로, 주사위 판정이
실제로 실패한 것. 사용자에게 설명으로 답변, 코드 수정 없음.

**(2) 이동 골드** — `quest/229`의 `TRAVEL_DISTANCE` 표를 확인해보니
`dist<=1`(도보 무료 조건)을 만족하는 조합이 `hamlet-village:1` 딱
하나뿐이라, 마을·도시·수도류 이동은 사실상 항상 유료(반나절 이동
5~7G 등)다. "가까운 곳은 도보 무료"라는 주석 의도와 실제 표가 어긋나
있다는 것을 확인했지만, 이건 game balance 판단이 필요한 부분이라
임의로 바꾸지 않고 사용자에게 원인만 설명하고 답을 기다리는 중.

**(3) `"md-location">시스템` 깨진 텍스트 — 진짜 버그, 원인 특정 후 수정**.
헤드리스 브라우저로 `confirmTravel()`을 직접 호출해 실제 DOM
`innerHTML`을 캡처해서 정확한 원인을 찾았다:
- `ui/231`의 `renderStoryMarkdown()`이 `[대괄호]` → `<span
  class="md-location">...</span>` 강조를 먼저 처리하고, 그다음
  `"따옴표"` → `<span class="md-speech">...</span>` 강조를 처리하는
  순서였는데, 대괄호 변환이 만들어낸 `class="md-location"`의 큰따옴표
  두 개 자체가 뒤이은 따옴표 정규식(`"([^"]{1,80})"`)에 "대사 하나"로
  다시 매칭되어 `<span class="<span class="md-speech">...` 같은
  중첩·미완성 태그로 망가졌다. 순서를 뒤바꿔(따옴표 강조를 먼저) 해결.
  이건 `[짧은태그]` 패턴을 포함하는 어떤 메시지에서든 재현 가능한
  일반적 버그였다(여행 기능에 국한된 게 아니었음).
- 별개로, `quest/229`의 이동 완료 훅이 `sendMsg('[시스템] ...묘사하고
  상황을 이어가라', false)`처럼 AI에게 보내는 지시문을 그대로 플레이어
  발화 말풍선으로 보내고 있었다 — 같은 파일의 다른 자동 `sendMsg` 호출
  3곳(예: "전투에서 벗어나기 위해 도망친다")은 전부 1인칭 플레이어
  행동 문장인데 이동 완료 훅만 관례를 어기고 있었다. `${toLoc.icon}
  ${toLoc.name}에 도착해 주변을 둘러본다.` 같은 1인칭 문장으로 통일.

헤드리스로 실제 이동을 재현해 DOM을 다시 캡처, 정상적으로 아이콘+
"OO에 도착해 주변을 둘러본다." 형태로 뜨는 것 확인. `node --check`
(수정 2개 파일) + 전체 `node build.js` + 챙겐→오프닝→턴 1회 회귀
테스트 재확인(콘솔 에러 없음).

### 2026-08-27 계속 — "여행 지도"와 "이동수단" 시스템 통합 (걸어서 이동은 무료로)

사용자가 이동 골드 문제를 다시 짚으며 구체적인 방향을 제시: "여행지도를
누르면... 돈들고 저런건 상단에 이동하는 수단을 선택하게 하고, 돈 안내고
걸어다닐 수도 있어야지." 조사해보니 이 게임엔 **완전히 분리된 이동 시스템
두 개**가 있었다:

1. **"여행 지도"** (`quest/229`의 `openOverworldMap`/`confirmTravel`/
   `getTravelCost`) — 플레이어가 실제로 쓰는 화면(🗺️ 여행 지도 펼치기
   버튼). 거리 기반으로 항상 골드가 드는 단순한 목적지 목록.
2. **"이동수단" 시스템** (`misc/054`의 `TRANSPORT_CONFIG`/
   `openTransportPanel`/`travelByTransport`/`renderTransportBar`) —
   도보(무료, 기준)부터 짐말·준마·군마·명마·마차·선박·그리핀·와이번·
   마법진까지 이미 완성돼 있는, 속도(speedMult)와 조우 위험도
   (encounterMult) 이점을 제공하는 진짜 "탈것 대여" 시스템. 하지만
   "장소" 패널(`renderLocationPanel`) 안에서만 노출돼 있어서, 사용자가
   실제로 쓰는 "여행 지도" 화면에서는 존재 자체를 알 수 없었다.

즉 사용자가 원한 그림이 이미 코드로 존재했는데, 두 화면이 연결이 안 돼
있어서 못 쓰고 있었던 것 — 이번 세션 내내 반복된 "따로 만들어놓고 서로
연결 안 됨" 패턴과 같은 종류.

**수정**: `getTravelCost`를 항상 0을 반환하도록 변경 — "여행 지도"는
도보 이동 화면이므로 이제 항상 무료(카드에 이미 있던 "💨 무료" 배지
로직이 자동으로 뜬다). 지도 하단에 "🚀 이동수단 대여" 버튼을 추가해,
누르면 지도를 닫고 기존 "장소" 패널(이동수단 선택 바 포함)로 이동 —
빠르고 안전하게 가고 싶으면 말/마차/배를 그 자리에서 빌릴 수 있게
연결했다. 두 시스템을 하나로 합치는 대신(리스크 큼) 이미 잘 만들어진
기존 이동수단 시스템으로 가는 다리만 놓는 방식으로 최소 위험하게 처리.

헤드리스로 확인: 여행 지도의 목적지 카드 5개 전부 "무료" 배지로 표시,
실제 이동 후 골드 변화 없음, "🚀 이동수단 대여" 버튼 클릭 시 이동수단
선택 바가 정상적으로 뜸. `node --check` + 전체 `node build.js` +
챙겐→오프닝→턴 1회 회귀 테스트 재확인(콘솔 에러 없음).

**참고로 남겨둔 것**: "도망 시도" 화면은 버그가 아니라 정상 동작(주사위
판정 실패)이었음을 확인해 답변으로 안내, 코드 수정은 하지 않음.

---

---

## 2026-08-28 — 구조적 근본 버그: `window.X = function(){...}` 패턴 전수 조사/수정 (진행 중)

**발견 경위**: 여행 시스템 수정 중 `sendMsg`에 걸린 훅이 전혀 실행되지
않는 걸 DOM 직접 확인으로 발견. 조사해보니 원인이 이 파일 하나가 아니라
**~18개 파일에 걸쳐 26곳**이나 같은 패턴으로 죽어 있었음 — 엔딩 트리거,
봉인석 복원, 소환수 죽음 서사, 전투 상태이상, 자동저장, NPC 오프스크린
결과 반영 등 게임플레이 핵심 로직이 전혀 작동하지 않고 있었다.

**근본 원인**: `window.someFunction = function(){ var _orig =
window.someFunction; ...로직...; return _orig.apply(this,arguments); }`
형태의 몽키패치 훅은 "호출부가 항상 `window.someFunction(...)`으로
부른다"는 가정 위에 있다. 그런데 ES 모듈에서는, A 파일이 `export
function X(){...}`로 선언(또는 단순 로컬 선언)하고 A 파일 자신(또는
같은 바인딩을 import한 다른 파일)이 나중에 `X(...)`를 **식별자 그대로**
호출하면, 그건 다른 파일이 나중에 `window.X`를 재할당했더라도
**로컬 렉시컬 바인딩으로 resolve**되지 `window.X`가 아니다. 즉
`window.X = wrapped` 체인 전체가 에러도 경고도 없이 조용히 죽은 코드가
되어버림.

**확립한 수정 패턴 2가지**:
1. **`processGSBlock` 리타겟팅** (우선 사용) — 훅 로직이 AI 응답의
   `<gs>{...}</gs>` 파싱 결과(`gs` 필드)만 보고 반응하는 경우, 훅을
   `window.sendMsg = function(){...}` 대신 `window.processGSBlock =
   function(gs){...}`로 옮긴다. `quest/086`이 매 턴 실제로
   `window.processGSBlock(gs)`를 명시적으로 호출하는 지점이 이미
   있기 때문에(2017~2023줄 부근), 여기 걸어두면 다른 파일 수정 없이
   바로 작동한다.
2. **`sendMsg()` 네이티브 병합** — gs 필드 기반이 아닌 매 턴 로직(스케줄러,
   틱 등)은 `quest/086`의 `sendMsg()` 안에 `if(typeof someFunc===
   'function') someFunc(...)` 형태로 직접 추가. `sendMsg`에서
   로컬 선언/import되지 않은 함수명이면 이 패턴이 안전하게
   `window.X`까지 스코프체인을 타고 내려간다.

**1차 완료 (Task #59, `ui/155-⑭-메모리-패널-UI.js`, 6개 훅)**:
- 봉인석 복원(`seal_restore`/`seal_hint`/`hidden_location_found`) →
  processGSBlock 리타겟팅
- 전투 상태이상/보스 페이즈/전투후 선택/지형 → processGSBlock 리타겟팅
- 자동저장 — 죽은 훅 자체를 삭제하고 `runAutoSaveSnapshot()`으로
  추출, `sendMsg()`에 `S.msgCount%5===0` 조건으로 네이티브 병합
- 소환수 죽음 서사/비밀/유품 → processGSBlock 리타겟팅
- **던전/탐사/엔딩 트리거(`trigger_ending`)** — 가장 우선순위 높은
  것. `ending_reward`(칭호 지급)까지 포함 → processGSBlock 리타겟팅
- NPC 오프스크린 결과 반영 → processGSBlock 리타겟팅, 오프스크린
  스케줄러(`runOffscreenScheduler`/`checkOffscreenEvents`)는
  `sendMsg()` 상단에 네이티브 병합

**부수적으로 발견/수정한 추가 버그** (위 훅을 헤드리스로 검증하는 중
발견): `patches/224-...js`의 `__tfDeferred_200` 안에 있던
`window.loadStatusEffects` 재정의 래퍼가 반환값을 무조건 **배열**로
강제하고 있었다. 그러나 진짜 `loadStatusEffects()`는 `{target:
[effect,...]}` 형태의 **객체**를 반환하며, 코드베이스의 다른 모든
호출부(이미 각각 "loadStatusEffects는 객체 반환" 이라는 버그수정
주석이 달려 있었음)가 전부 객체를 기대하고 있었다. 이 래퍼 때문에
`applyStatusEffect` 내부의 `window.loadStatusEffects()` 호출이 빈
배열을 돌려주면 `state[target]=[...]`이 배열에 비-인덱스 속성을
추가하는 꼴이 되고, `saveStatusEffects`의 `JSON.stringify`가 배열의
비-인덱스 속성을 통째로 버려버려 **상태이상 부여가 항상 조용히
무효화**되고 있었다. 래퍼를 완전히 제거해서 해결.

헤드리스로 확인: `window.processGSBlock({apply_status:[{target:
'player',effect:'poison'}]})` 직접 호출 후 `localStorage['tf-status-
effects']`에 실제로 `{"player":[{"id":"poison",...}]}`가 저장됨을
확인 (수정 전에는 항상 `"[]"`). seal_hint/summon_death/explored/
npc_offscreen_result 각각 에러 없이 처리됨, `runAutoSaveSnapshot()`
직접 호출 시 `tf-autosave`에 25KB 스냅샷 저장 확인. `node --check` +
전체 `node build.js` 통과.

**2차 완료 (Task #60~#62, #71 일부)**:

- **`race/260-수인족-패널-렌더.js`** — 영지 방어력 경고/자원 틱
  (`checkDemesneDefenseWarning`/`tickDemesneResources`)을 `sendMsg()`에
  네이티브 병합. 파벌 게이지 감지(`detectFactionGaugeFromText`)는 후처리
  블록에 병합. 파벌 BLS를 AI 프롬프트에 넣던 `hookFactionGaugeToPrompt`는
  존재한 적 없는 `window.buildSystemPrompt`/`buildPrompt`를 찾고 있어
  영원히 패치되지 않던 것을 실제 이름 `buildLightSystem`으로 교체.
  `injectFactionGaugeContext`(`S._fgContext` 기록)는 그 값을 읽는 코드가
  전체 코드베이스에 단 한 곳도 없는 완전한 no-op이라 삭제.
- **`ai-prompt/100`/`172`** — 종교 GS 필드(`religion_share_delta`/
  `convert_npc`/`religion_tension_up`/`religion_tension_reset`/
  `abyss_exposed`)와 계승 GS 필드(`earn_heritage`/`end_of_loop`)를
  `window.processGSBlock` 리타겟팅으로 복구. gs 유무와 무관하게 매 턴
  돌아야 하는 `checkLoopMilestones`(계승 회차 도전과제)는 별도로
  `sendMsg()`에 네이티브 병합.
- **`misc/278-메인-훅-연결.js`(개인기억 PM 파이프라인)** — NPC/세계/개인/
  퀘스트 텍스트 감지(`pmDetectNpcFromText` 등 4종), 흡혈귀 연대기 감지,
  역사 파편 감지, NPC 대화 학습, 선택 기록(`pmUpdateChoice`), 하드코딩용
  데이터 수집(`collectTurnData`), 5턴마다 퀘스트/영지/개인 파트 동기화까지
  전부 `sendMsg()` 후처리 블록에 네이티브 병합. 원래 있던 "gs가 이미
  성공했으면 건너뛴다" 게이트는 그런 대체 경로가 실제로는 존재하지
  않아 근거 없는 조건이었으므로 제거(항상 실행). 게임 시작 시 개인기억
  동기화(`pmSyncPersonalFromGame`)는 `core/084`의 `startGame()` 안
  `doStartChat()` 호출 직후로 이동. `renderMemory` 패널 교체(항목4)와
  `buildLightSystem` BLS 주입(항목1)은 원래도 살아있던 코드라 그대로 둠.
- **`detectConsequences`의 죽은 훅 2곳** 도 함께 처리: `misc/278`의 선택
  결과(호감/적대) 분류 로직과 `misc/227`의 복선/떡밥 자동 감지
  (`detectPlotHooks`)를, `quest/086`에서 `detectConsequences(cleanText)`를
  실제로 호출하는 지점 바로 뒤에 네이티브로 병합.

헤드리스로 각 항목을 직접 호출해 실제 상태 변화까지 확인: 파벌 게이지
BLS 훅의 `buildLightSystem` 실제 함수 존재, 영지 틱 호출 시 `tf-demesne`
저장값 변화, 종교 GS 처리 시 `tf-religion-state`의 `central.temple`이
+5만큼 실제로 변함, 계승 GS 처리 시 `tf-heritage-v2`에 아이템이 실제로
추가됨, PM 파이프라인 12개 함수 전부 정상 호출·에러 없음을 각각 확인.
`node --check` + 전체 `node build.js` 통과, 콘솔 에러 없음.

**3차 완료 (Task #64~#66)**:

- **`npc/158`(NG+/예언/소문/NPC 드라마)** — `player_rumor`/`prophecy_add`/
  `prophecy_fulfill`/`npc_drama`/`apply_legacy`/`save_loop_legacy` GS
  필드를 `processGSBlock` 리타겟팅으로 복구. `runDramaScheduler`(자체
  15턴 게이트)는 `sendMsg()` 전송 직전에, 예언 키워드 자동 감지·중요
  행동 자동 소문 생성(텍스트 기반)은 응답 후처리 블록에 네이티브 병합.
- **`ui/181`(룬·보석·강화석)** — `gs.item_add`로 지급되는 룬/보석/강화석이
  인벤토리에 전혀 들어가지 않던 것을 `processGSBlock` 리타겟팅으로 복구.
- **`ui/291`(게임플레이 통합 훅)** — 나비효과 기록/동료 이탈 체크/세계
  영향력 갱신을 `sendMsg()` 전송 직전에 네이티브 병합. 같은 파일의
  `buildLightSystem`·`renderChoices` 훅은 원래도 살아있는 코드라 손대지
  않음(실제 호출부가 전부 `window.X(...)` 명시 호출).
- **`job/042`** — 자동 전직 알림(`checkAutoJobUnlock`, 자체 10턴 게이트)을
  `sendMsg()` 응답 후처리 블록에 네이티브 병합. 전직 조건을 채워도 팝업이
  전혀 뜨지 않던 버그.

헤드리스로 각각 직접 호출해 실제 상태 변화 확인: `tf-player-rumors`/
`tf-npc-drama`에 실제 항목 추가됨, 나머지는 전부 정상 호출·에러 없음.
`node --check` + 전체 `node build.js` 통과.

**4차 완료 (Task #67, #63)**:

- **`misc/293`(플레이스타일/딜레마)**, **`misc/261`(인과 감지/마일스톤)**,
  **`misc/164`(챕터 자동 진행/도전 과제)** — 전부 같은 원인(`window.sendMsg`
  감싸기가 도달 못 함)으로 죽어있던 훅을 `sendMsg()`에 네이티브 병합.
  각 파일의 `buildLightSystem`/`tickGameTime` 훅은 원래도 살아있는
  코드라 손대지 않음.
- **`misc/324`(NPC 영지 침략)/`325`(세계 정착지 영향력·WSI)/`323`(영지
  v5 확장 — 명성/왕실관계/인구계층/건설대기열/봉신반란/점령/계절행사)**
  — 세 파일 모두 같은 `window.sendMsg` 감싸기 원인으로 죽어있던 매턴
  틱을 `sendMsg()`에 네이티브 병합. 이 셋은 전부 `race/260`에서 만든
  플레이어 자신의 영지 시스템 위에 쌓인 확장 기능이라, 지난 체크포인트의
  영지 기본 틱 복구가 선행 조건이었음.
- 부수 발견: `world/070`이 `renderWorldMap`을 직접 import해 bare
  호출하는 바람에, `race/064`(내 영지 ★ 표시)와 `misc/325`(WSI 영향권
  배지) 두 훅이 동시에 죽어있었다 — `window.renderWorldMap` 우선 호출로
  교체해 한 번에 복구(광범위 감사 목록의 `renderWorldMap` 2건도 함께 해결).

헤드리스로 직접 호출해 확인: `tf-rival-domains`에 NPC 영지 실제 추가,
`tickWSI`/`renderWorldMap` 정상 호출, `v5Tick`을 게이트 조건(3턴 경과)
충족 후 호출하니 `tf-demesne-v5`에 명성치·인구계층 등이 실제로 기록됨.
`node --check` + 전체 `node build.js` 통과, 콘솔 에러 없음.

**5차 완료 (Task #68~#71) — 이번 캠페인 마지막 항목들**:

- **`progression/089`(소환수)** — `summon_add`/`exp`/`evolve`/`merc_evolve`/
  `caravan_evolve`/`summon_dialog`는 이미 `combat/150`의
  `processGSToAllDBs`(실제 processGSBlock 체인의 베이스)가 처리 중이라
  순수 중복 확인 후 손대지 않음. 죽어있던 채 유일하게 남아있던
  `summon_dismiss`/`summon_damage`, 그리고 **`summon_death`의 상태
  갱신부**(`status='defeated'`)만 `processGSBlock` 리타겟팅으로 복구 —
  ui/155의 `triggerSummonDeathStory`는 "죽음 서사"만 트리거하고 실제
  `summon.status`는 바꾸지 않아서, 소환수가 서사상 죽어도 목록엔 계속
  "생존"으로 남아있던 버그를 이번에 추가로 발견해 같이 고쳤다.
- **`ai-prompt/153`** — GS→DB 반영 호출은 중복이라 제거, 30턴 자동
  압축·상황별/요약 BLS 주입·전투 키워드 자동 경험치·종교 특수 이벤트·
  임무 귀환 체크를 `sendMsg()`에 네이티브 병합(`progression/089`에
  있던 동일 로직 사본은 앞선 정리에서 이미 제거돼 이 파일이 유일한
  연결점이 됨).
- **`core/162`(생존 환경)** — `survival_resource`/`enter_survival`/
  `exit_survival` GS 필드를 `processGSBlock` 리타겟팅, 환경 키워드
  자동 감지(사막/해상/극지/화산/심해)는 텍스트 기반이라 네이티브 병합.
- **광범위 감사 잔여분 전부 마무리**:
  - `checkRandomEncounter`(3곳) — misc/328(조우 직후 다음 턴 자동 전투
    예약)·items/218 2곳(인적 조우·제3자 충돌 목격) 전부
    `checkRandomEncounter`가 quest/086에 로컬 선언돼 있어 그 파일의
    bare 호출이 매번 감싸기를 건너뛰던 동일 패턴 — 실제 호출 지점에
    네이티브로 옮김.
  - `rollWarCheck`(2곳) — 카르마 보너스(progression/202)·종교 축복/저주
    보너스(religion/102)가 모두 유일한 실제 호출부(misc/068 자신의
    파일 안)의 bare 호출에 가로막혀 죽어있었다. 함수 자체
    (`rollWarCheck`)에 두 보너스를 원래 훅 설치 순서(카르마→종교)
    그대로 반영.
  - `renderWorldMap`·`detectConsequences`는 각각 3·4차 정리에서
    완료됨(위 참고).

**최종 검증**: 챙겐→오프닝→실제 메시지 전송까지 포함한 전체 플레이
경로에서 콘솔 에러 0건. 이번 세션에서 새로 살린/새로 네이티브
연결한 함수 약 60개를 한 번에 훑는 회귀 스크립트로 전부
`typeof===‘function’` 확인 + 대표 함수 다수 직접 호출 스모크 테스트
(빈 gs 처리, 상태이상 영속성, 랜덤 조우, 판정 보너스 형태, 영지 v5
틱, 세계지도 렌더, 마일스톤, 자동 압축, 턴 데이터 수집 등) 전부 에러
0건으로 통과. `node --check` 전체 파일 + `node build.js` 통과.

---

## 📊 이번 세션 전체 요약 — `window.X = function(){...}` 죽은 훅 캠페인

세션 시작 시 여행 시스템 버그 하나를 고치다가, 그 원인이 **~20개 파일에
걸쳐 40곳 이상**되는 동일한 구조적 버그(몽키패치 훅이 ES 모듈의 로컬
바인딩에 가려 실행된 적이 없는 문제)임을 발견했다. 사용자가 "우선순위대로
전부 진행"을 명시적으로 선택해, 발견된 것 전부를 정리했다.

**복구된 시스템 총정리**: 던전/탐사/엔딩 트리거(trigger_ending) · 봉인석
복원 · 전투 상태이상(및 그 저장 자체가 항상 사라지던 별도 버그) · 소환수
죽음 서사/공격/해제 · 자동저장 · NPC 오프스크린 결과 · 영지 방어력/자원
틱 · 파벌 게이지(및 그 BLS 프롬프트 주입) · 종교 GS 8종 · 계승 GS 2종 ·
개인기억(PM) 전체 파이프라인(텍스트 감지 4종·NPC 대화 학습·역사 파편·
선택 기록·데이터 수집·주기 동기화) · NPC 드라마/소문/예언/NG+ 계승 ·
룬·보석·강화석 드롭 · 나비효과/동료 이탈/세계 영향력 · 자동 전직 알림 ·
플레이스타일/딜레마 · 인과관계 추적/마일스톤 · 챕터 자동 진행/도전 과제 ·
NPC 영지 침략(rival domain) · 세계 정착지 영향력(WSI) · 영지 v5 확장
(명성/왕실관계/인구계층/건설/봉신반란/점령/계절행사) · 세계지도의 내 영지
표시·WSI 배지 · 30턴 자동 압축/BLS 주입/전투 경험치/임무 귀환 · 생존
환경 시스템 · 랜덤 조우 3종(지연 전투 예약·인적 조우·목격) · 전쟁 판정의
카르마/종교 보너스.

---

## 2026-08-28 (같은 날, 재검증) — "진짜 전부 다 했는지" 재감사에서 추가로 발견한 버그들

작업을 다 끝냈다고 보고한 뒤 사용자가 "진짜 전부 다 한거맞아..?"라고
물어서, 스스로 다시 기계적으로 검증했다: `window.X = function` 패턴을
전체 재스캔하고, `openP('이름')`으로 열리는 모든 패널 이름을
`renderPanel`의 실제 switch case 목록과 전수 대조했다. 그 결과 이번
세션의 sendMsg/processGSBlock 캠페인과는 **다른 원인의 버그 4개**를
추가로 발견해 고쳤다 — "전부 다 했다"는 답이 틀렸었다는 뜻이고, 그래서
다시 찾아 고쳤다:

1. **종교 패널이 항상 빈 화면으로 열림** — `renderPanel`의 switch에
   `'religion'`/`'demesne'` 케이스가 아예 없었다(영지는 모든 실제
   진입점이 `renderDemesnePanel()`을 직접 같이 호출해 우연히 괜찮았지만,
   종교는 메뉴 버튼이 `openP('religion')`만 호출해 진짜로 빈 화면이
   떴다). switch에 두 케이스를 직접 추가.
2. **"새 게임 시작"을 눌러도 이전 캐릭터의 파벌 게이지·영지·영지 v5·
   라이벌 영지·세계 정착지 상태가 전혀 초기화 안 됨** — 이 초기화를
   담당하던 두 훅이 `window.newGame`이라는, 이 코드베이스에 실제로는
   존재한 적 없는 함수를 감싸려 하고 있었다(진짜 진입점은
   `_doNewGame`). `_doNewGame()` 안에 네이티브로 옮겨 연결.
3. **저장 패널이 항상 빈 화면으로 열림 (버그 2겹)** — ① 저장 패널을
   여는 실제 진입점은 `openP('save')`(단수)를 호출하는데 switch는
   `'saves'`(복수)만 처리했고, ② 설상가상으로 그 케이스가 부르는
   `renderSaveSlotPanel()` 함수 자체도 내부에서 `pb-saves`(복수, 실제로
   존재한 적 없는 id)를 찾고 있었다. 두 곳 다 수정.
4. **"✨ AI 장소 확장" 패널이 항상 빈 화면으로 열림** — 이 패널의
   `openP` 감싸기가 원본 `window.openP`를 모듈 로드 시점에 **동기적으로**
   캡처했는데, 진짜 `window.openP`는 그보다 한참 뒤(`__tfDeferred_67`가
   main.js에 의해 나중에 일괄 호출될 때) 설정된다 — 캡처 시점엔 항상
   `null`이라 감싸기 자체가 설치되지 못했다. 다른 죽은 훅들과 재시도
   패턴으로 통일해 수정.
5. **(부수, 마이너)** 세계 위기 배지("둠 클락")를 누르면 `openP(
   'world-state')`를 호출하는데 그런 패널 자체가 코드베이스 어디에도
   만들어진 적이 없어 클릭이 완전히 죽은 링크였다 — 별도 패널을 새로
   만들기보다 이미 있는 정보를 토스트로 즉시 보여주도록 최소한으로 수정.

**검증 방법도 바꿨다**: `openP('이름')`으로 열리는 모든 패널을 실제
onclick이 하는 것과 똑같이(단짝 렌더 함수까지 같이, 내부 setTimeout
지연까지 기다려서) 헤드리스로 직접 열어보고 본문 HTML 길이를 확인하는
방식으로 30여 개 패널을 전수 조사했다. 처음엔 여러 개가 "비어있다"고
잘못 나왔는데, 그 상당수는 내 테스트 스크립트가 단짝 렌더 함수를 같이
안 부르거나(`aisettings` 등), 내부 setTimeout을 안 기다리거나
(`challenges`/`heritage`/`rune`/`offscreen` 등), 실제 게임에서는 첫
턴이 지나야 초기화되는 코드를 기다리지 않은(`prisoners` 등, gs 파싱
함수 안에 패널 DOM 주입 코드가 있어 첫 turn 전엔 존재 안 함) 테스트
설계 문제였다 — 재확인 결과 진짜 버그는 위 5개뿐이었다.

전부 수정 후 재빌드 + 전체 회귀 스크립트 재실행, 콘솔 에러 0건 확인.

---

## 2026-08-28 (같은 날, 3차) — "여행해도 아무것도 안 바뀌는 것 같다" 재현·수정

사용자가 이전 스크린샷(렌더링 깨짐 — 이미 고쳐진 버그였음, 확인 완료)과
함께 "맵으로 이동했는데 막상 바뀌는 게 하나도 없어 보인다"는 걸 다시
지적했고, "로컬 모델 쪽도 전체를 다시 봐달라"고 요청했다. 두 가지를
실제로 재현해서 확인했다:

1. **로컬 AI 모델(quest/331, WebGPU 브라우저 내장 모델)**: 코드
   재감사 결과 배선 자체(설정 토글, 진단 로그 UI, 3단 폴백 체인
   `tryCloudThenLocalModelThenBank`)는 정상이었다. 헤드리스로 실제
   폴백 체인을 끝까지 태워봐도 에러 없이 정상적으로 클라우드→로컬모델
   →로컬조합 순서로 넘어갔다. 다만 이 샌드박스는 실제 CDN 접속이
   막혀 있어 진짜 WebGPU 모델 다운로드·추론 자체는 검증 불가능하다는
   한계는 그대로 — 실기기에서 안 되면 AI설정 패널의 "🔍 진단 로그 보기"
   내용을 복사해서 전달해달라고 안내함.
2. **진짜 발견한 버그: 여행 후 로컬 조합(API 키 없음/실패 시 최종
   폴백)이 도착한 장소를 완전히 무시함.** 여행 지도로 이동하면 quest/229가
   `"{아이콘} {장소명}에 도착해 주변을 둘러본다."`를 자동 전송하는데,
   `composeLocalTurnText`(로컬 조합 생성기)의 매 턴 서사 로직은 주사위
   판정 결과가 없으면 무조건 `TURN_CASUAL_BANK`에서 "잠시 숨을 고르며
   주변을 살핀다" 같은 장소와 무관한 문장을 무작위로 골랐다 — 실제로
   이동은 됐어도(골드 차감 없음, 위치 데이터는 정확히 바뀜) 서사에는
   전혀 반영이 안 돼 "아무것도 안 바뀐 것처럼 보인다"는 정확히 사용자가
   지적한 그 현상이었다. 도착 문구를 감지하는 `LOC_ARRIVAL_BANK`를
   추가해, 로컬 조합도 실제 도착한 장소 이름·아이콘을 반영한 문장을
   내도록 수정.

헤드리스로 실제 "여행 지도 → 목적지 클릭" 전체 플로우를 재현해 확인:
골드 그대로 유지, 위치는 "강변 도시 리버크레스트"로 정확히 변경, 그리고
이번엔 응답 메시지 자체가 `"🌊 강변 도시 리버크레스트에 도착했다.
오는 길의 피로를 잠시 내려놓고 주변을 둘러본다."`처럼 실제 목적지를
반영. 전체 회귀 스크립트 재실행, 콘솔 에러 0건.

**정직한 결론**: 이번 세션의 핵심 캠페인(sendMsg/processGSBlock 죽은
훅 40여 곳)은 실제로 다 했다고 판단하지만, 그와 별개로 UI 패널
연결부에 4~5개의 다른 원인 버그가 더 있었고 처음엔 놓쳤었다. 지금은
그것도 찾아서 고쳤지만, "코드베이스 전체에 이런 종류의 버그가 정말
0개"라고 100% 장담하긴 어렵다 — 이번에 한 것처럼 기계적 전수 대조가
가능한 범위(윈도우 함수 재할당, 패널 이름 매칭)는 다 훑었지만, 그 밖의
다른 형태의 버그가 있을 가능성 자체를 완전히 배제할 수는 없다.

---

### 2026-08-28 (같은 날, 4차) — 이동/지도 접근성 재확인 + `.btm-bar` 컨테이너 누락 발견

사용자 질문: "맵으로 나간다는 선택지는 언제 뜨는거야? 조건이 있어?"
"근데 이동이라는 씬이 계속 안나올수도있고 뜬금없이 뜰수도있잖아" —
AI 서술 텍스트의 키워드 매칭에만 의존하는 이동 진입 방식의 신뢰성에
대한 정당한 지적.

**1) 지도 진입 경로 전수 확인** — 실제로 3가지 트리거가 독립적으로
존재함을 코드로 확인:
  - `maybeInjectMapChoice()`: AI가 만든 선택지 텍스트에 `/이동|탐험|출발|
    여행|던전|마을|장소|어디/` 매칭 시 지도 버튼 주입 (가장 불안정)
  - `checkDeparture(aiText)`: AI 서술문이 `DEPARTURE_PATTERNS`(8개 정규식)
    중 하나에 걸리면 자동 발동 (10초 쿨다운)
  - `hookSendButton`: 플레이어가 직접 입력한 문장이 `PLAYER_TRAVEL_
    PATTERNS`(3개)에 걸리면 Enter를 가로채 지도를 염
  → 셋 다 "AI/플레이어가 그 순간 그 단어를 쓰느냐"에 좌우되는 건 사실.

**2) 하지만 이미 조건-무관 진입점이 두 개 더 있었음**:
  - 상단 ☰ 메뉴 → 세계 탭 → "🗺️세계지도" 버튼(`template.html` 정적
    onclick, `openP('worldmap')` → `renderWorldMapPanel()`) — 헤드리스로
    직접 확인: 위치·턴수와 무관하게 항상 패널이 열리고 콘텐츠가 채워짐.
  - 하단 상시 탭바의 "지도"(`#gbtn-map`) — `updateMapTabState()`가 매
    턴 `detectAndSetLocation` 뒤에서 항상 호출되어, 마을/던전/도시 등
    "이동 가능한 거점"으로 인식되면 자동으로 활성화(금테두리)됨. 단,
    이 활성화 판정 자체도 AI 서술문에서 위치 키워드를 인식해야 하므로
    (`detectAndSetLocation`), 완전히 독립적이진 않음 — 게임 시작 직후
    캐릭터 소개 텍스트만 있고 아직 장소가 감지되지 않은 상태에서는
    비활성 상태로 남아있는 것을 헤드리스로 확인(정상 동작, 버그 아님).
  → 결론: **"🗺️세계지도"(상단 메뉴)가 진짜 조건-무관 진입점**이고,
    이미 존재했다. 사용자가 원하던 "안정적인 지도 접근 수단"은 이미
    있었던 것.

**3) 그 과정에서 훨씬 큰 별개의 버그 발견** — `.btm-bar`(채팅 화면
하단 상시 퀵액세스 바)를 참조하는 코드가 10개 파일·17곳에 있었음
(`economy/255`, `ai-prompt/148`, `ui/252`, `ui/291`, `quest/229`,
`misc/293`, `misc/251`, `misc/230`, `misc/253`, `core/244`) — 월드맵,
현황판, 장소확장, 의뢰소, 길드, 제작, 경제, 성장비교, 성향, 농장,
묘역, 항해, 암시장, 네트워크, 사냥터, NPC, 계약 등 15개 버튼을
주입하도록 이미 다 작성돼 있었는데, **정작 그 버튼들이 붙을 컨테이너
`<div class="btm-bar">`가 `template.html` 어디에도 없었음** (CSS 규칙
`.btm-bar{...}`는 1563번 줄에 존재하지만 대응하는 HTML 요소가 전혀
없었음). 모든 주입 코드가 `if(!b) return;`으로 방어돼 있어 에러 없이
조용히 아무 일도 안 일어나는 형태 — 이번 세션 내내 찾아온 "만들어져
있는데 조용히 작동 안 하는" 버그의 전형.

**수정**: `template.html`의 `.inp-row`(입력창) 바로 아래, `.grp-menu-
wrap`(햄버거 메뉴) 바로 위에 `<div class="btm-bar" id="btm-bar"
style="overflow-x:auto"></div>` 컨테이너 1줄 추가. 이미 작성된 17곳의
주입 로직은 전혀 손대지 않음 — 컨테이너만 생기면 알아서 다 붙음.

**검증**: 헤드리스로 새 게임 시작 후 7초 대기 → `#btm-bar`에 9개 버튼
실제 렌더링 확인(현황·장소확장·의뢰소·월드맵·길드·제작·경제·성장·
성향 — 나머지 농장/묘역/항해/네트워크/암시장/사냥터/NPC 등은 해금
전이라 조건부로 안 보이는 게 정상). `#btn-worldmap` 클릭 → 실제로
`#p-worldmap` 패널이 열림(`classList.contains('open')===true`) 확인.
전체 회귀 스위프(`missingFns:[]`, `smokeTestErrors:[]`) 및 콘솔 에러
0건 재확인.

**정리하면**: 사용자가 걱정한 "이동 씬이 안 뜨면 지도를 못 연다"는
문제 자체는 상단 메뉴로 이미 해결돼 있었고, 그걸 확인하는 과정에서
완전히 별개로 "하단 퀵액세스 바 전체가 시작부터 죽어 있었다"는 훨씬
큰 버그를 찾아 고쳤다.

---

### 2026-08-28 (같은 날, 5차) — "매번 플레이할 때마다 오류나서 10턴을 못 넘김" 재현·근본 원인 파악

사용자 지적: "이전에 다 했다면서 계속 플레이해볼때마다 오류 생겨서 10턴을
넘긴적이없어" — 지금까지의 "다 고쳤다"는 답변에 대한 정당한 재반박.
말로만 안심시키지 않고, 실제로 20~30턴짜리 자동 플레이를 헤드리스로
여러 번 반복 재현해서 정확히 어디서 왜 멈추는지 기계적으로 추적했다.

**재현 결과**: 매 실행마다 일관되게 특정 턴 근처에서 입력창(#send-btn)이
클릭이 전혀 먹히지 않는 상태로 멈췄다. `S.loading`, 콘솔 에러, unhandled
promise rejection을 모두 확인했지만 전부 깨끗했다 — 즉 "코드가 죽어서"
멈춘 게 아니라 "화면을 뭔가가 물리적으로 덮고 있어서" 클릭이 전달되지
않는 상태였다.

**정체 확인**: `document.elementFromPoint()`로 실제 입력창 위치에 뭐가
있는지 찍어보니, 실행할 때마다 다른 종류의 **화면 전체를 덮는 팝업**이
범인이었다 — `quest-accept-popup`(퀘스트 수락), `job-suggest-popup`
(전직 제안), `rand-event-popup`(돌발 이벤트), `levelup-overlay`
(레벨업), 그 외에도 `rd-conquest-popup`·`dream-popup-ov`·
`continent-crisis-popup`·`race-skill-popup`·`demesne-unlock-popup` 등
최소 9종 이상. 스크린샷으로 실제 화면을 직접 확인한 결과(레전더리 등급
퀘스트 수락 팝업), 팝업 자체는 정상적으로 렌더링되고 수락/거절 버튼도
멀쩡히 클릭 가능했다 — 화면이 깨진 게 아니라 "플레이어가 그 팝업에
반응해서 버튼을 눌러야 다음으로 넘어간다"는, 원래 의도된 모달 UI였다.

**진짜 버그 — 팝업끼리 서로 겹침**: 문제는 이 9종 이상의 팝업 시스템이
전부 서로 독립적으로 만들어져서, "지금 다른 팝업이 열려 있는지" 전혀
확인하지 않고 즉시 자기 팝업을 화면에 얹었다는 것. 같은 턴 근처에
두 개(예: 퀘스트 수락 + 돌발 이벤트)가 겹쳐 뜨면, 위에 뜬 팝업의
버튼을 눌러 정상적으로 닫아도 그 아래 또 다른 전체화면 팝업이 그대로
남아 화면을 계속 가리고 있었다 — 플레이어 입장에서는 "분명 버튼을
눌렀는데 아무것도 안 바뀌고 계속 막혀있다"는, 정확히 이번 세션 내내
찾아온 "만들어져 있는데 서로 이상하게 연결된" 버그 그 자체였다.

**수정**: `utils.js`에 공용 가드 `isBlockingPopupOpen(excludeId)` /
`showBlockingPopupWhenFree(showFn, excludeId)`를 추가하고, 실측으로
가장 자주 겹치는 3개(`showQuestAcceptPopup`, `showJobSuggestionPopup`,
`showRandomEventPopup`)의 진입부에 배선 — 자기 자신을 뺀 다른 차단
팝업이 이미 열려 있으면 즉시 띄우지 않고 1.2초 후 재시도(최대 15회)
하도록 해서, 두 팝업이 절대 동시에 뜨지 않게 했다.

**검증**: 수정 전 헤드리스 반복 플레이는 3~11턴 사이에서 랜덤하게
멈췄다. 수정 후, 모든 알려진 팝업 유형을 인식하고 클릭하는 테스트로
재실행한 결과 19턴까지 막힘 없이 진행됐고, 19턴째에 멈춘 원인은
`p-local-combat`(로컬 전투 패널)이었다 — 이건 버그가 아니라 몬스터와
실제로 전투가 시작된 것으로, 채팅으로 계속 진행하는 대신 자동으로
열린 ⚔️전투 패널에서 공격/방어/도주를 골라야 하는 정상적인 설계다
(sendMsg에도 "⚔️ 전투가 진행 중입니다. 먼저 전투를 마무리하세요"라는
토스트가 뜨도록 이미 구현돼 있음, 이번 세션 전에 확인 완료). 전체
회귀 스위프(`missingFns:[]`, `smokeTestErrors:[]`)도 콘솔 에러 0건으로
재확인.

**정직한 결론**: "10턴을 못 넘긴다"는 증상은 코드가 깨져서가 아니라,
서로 다른 팝업 시스템 9종 이상이 겹쳐 뜰 수 있었던 것 + 몬스터 조우 시
전투 패널로 전환해야 하는 것, 이 두 가지가 겹쳐 실제로 반복적으로
플레이를 방해했을 가능성이 매우 높다. 팝업 겹침은 확실한 버그였고
고쳤다. 전투 패널 전환은 설계대로 동작하는 것이지만, 처음 겪는
플레이어에게는 "막혔다"는 인상을 줄 수 있다는 점은 UX상 유의할 부분.

---

### 2026-08-28 (같은 날, 6차) — 팝업 겹침 수정을 3종에서 27개 파일 전체로 확대

사용자가 "계속 오류난다, 제발 다 좀 고치고 진행하자"고 재차 지적 —
5차에서 손댄 3개 팝업(퀘스트 수락·전직 제안·돌발 이벤트)만으로는
부족하다고 판단, 코드베이스 전체를 다시 훑었다.

**추가로 발견**: `position:fixed;inset:0` 인라인 스타일로 화면 전체를
덮는 팝업을 만드는 곳이 27개 파일에 더 있었다 — 레벨업 연출, 대륙
정복 알림, 꿈/환영, 대륙 위기, 종족 스킬 각성, 영지 해금 등. 이걸
하나하나 다 찾아 개별 파일마다 5차와 같은 가드를 넣는 건 비효율적이고
빠뜨릴 위험도 크다고 판단해서, 더 근본적인 방식으로 바꿨다.

**수정 (포괄판)**: `utils.js`에 `document.body.appendChild` 자체를
감싸는 통합 가드를 추가했다 — "화면 전체를 덮는 팝업" 모양의 요소가
새로 붙으려 할 때, 이미 같은 종류가 떠 있으면 큐에 넣어뒀다가 먼저 뜬
팝업이 DOM에서 사라지는 순간(=닫히는 순간) 자동으로 이어서 띄운다.
개별 파일을 27곳 다 고칠 필요 없이 한 곳에서 전부 막히도록 했고, 앞
으로 새로 추가될 팝업 시스템에도 자동으로 적용된다.

**첫 구현에 있었던 실수**: 화면 전체 팝업 판별 정규식으로 `/inset:\s*
0\b/`를 썼는데, 실제 브라우저가 저장하는 값은 `"inset: 0px"`였다 —
`\b`(단어 경계)는 단어 문자와 비단어 문자 사이에서만 매치되는데 "0"과
"p"는 둘 다 단어 문자라 그 사이엔 경계가 생기지 않는다. 그 결과
판별 함수가 항상 `false`를 반환해서 가드 자체가 사실상 아무 것도
막지 못하고 있었다 — 헤드리스 단위 테스트로 이 사실을 직접 확인하고
(`\b` 제거) 나서야 잡아냈다. "빌드는 됐고 함수도 설치는 됐지만 정작
핵심 판별 로직이 조용히 항상 실패하고 있었다"는, 이번 세션 내내
찾아온 것과 똑같은 유형의 버그였다.

**검증**: (1) 합성 오버레이 두 개를 연속으로 `appendChild`하는 단위
테스트로 큐잉이 실제로 동작함을 확인(A는 즉시 뜨고 B는 A가 사라질
때까지 DOM에 안 붙어있다가, A 제거 순간 자동으로 뜸). (2) 일반
패널(`.panel-ov` 기반 월드맵 등)은 이 가드의 영향을 받지 않고 정상
열리고 닫힘을 확인. (3) 알려진 모든 팝업 유형을 인식하고 자동으로
닫아가며 30턴을 끝까지 자동 재생하는 테스트에서 **막힘 없이 30턴
전부 완주**(수정 전엔 3~19턴 사이에서 랜덤하게 막혔음) — 그 사이
퀘스트 수락·전직 제안·돌발 이벤트 팝업이 여러 번 자연스럽게 뜨고
닫혔다. 전체 회귀 스위프도 에러 0건 재확인.

---

### 2026-08-28 (같은 날, 7차) — "다른 부분도 다시 봐" 지적에 따른 전수 재점검

사용자가 "이 부분만 말고 다른 부분도 다시 보라"며, 이전에 겪은 "맵으로
이동 눌렀더니 돈 내라 하고, 돈 내는 거 눌렀더니 똑같은 화면만 나온다"는
사례를 다시 언급 — 이것도 "만들어졌지만 이상하게 연결된" 버그의 예시로
포함되는 것 아니냐는 정당한 지적.

**여행 유료화 재확인**: `confirmTravel`(quest/229)이 쓰는
`getTravelCost()`는 이미 이번 세션 이전에 항상 0을 반환하도록 고쳐져
있음을 코드로 재확인 — 이 경로는 현재 무료다. 사용자가 겪은 "돈 내라"
현상은 이미 고쳐진 이전 버그였거나, 이 세션에서 고친 팝업 겹침
버그(6차 참고)로 인해 "결제 버튼을 눌러도 반응이 없다"는 인상을 받았을
가능성이 크다.

**전수 재점검 방법** — 이번엔 감으로 훑지 않고 두 가지 기계적 스캐너를
새로 만들어 코드베이스 전체(약 300개 파일)를 다시 훑었다:

1. **onclick 참조 함수 존재 여부 스캐너**: `template.html`과 모든 소스
   파일에서 `onclick=`/`onchange=` 등에 쓰인 함수 호출을 전부 추출해,
   그 함수가 실제로 어딘가에 정의돼 있는지 대조. → **`handleImportFile`
   함수가 코드베이스 전체 어디에도 존재하지 않음**을 발견. "✦ 봉인
   해제"(데이터 가져오기) 버튼을 누르면 `importAllData()`가 인자 없이
   호출되는데, 그 함수는 파일이 없으면 곧장 `return`해서 파일 선택창
   조차 뜨지 않았고, 설령 다른 경로로 파일을 골랐어도 `onchange=
   "handleImportFile(event)"`가 가리키는 함수 자체가 없어 조용히
   실패했을 것이다 — **가져오기 기능이 통째로 죽어 있었다.**
   `importAllData(file)`이 파일 없이 호출되면 숨겨진 입력창을 열도록
   고치고, 실제로 없던 `handleImportFile(event)`를 새로 만들어 선택된
   파일을 진짜 처리 함수로 넘기는 다리 역할을 하게 했다.

2. **`window.X = function` 죽은 훅 재탐지 스캐너**: 이번 세션 초반의
   "죽은 훅 캠페인"(58~72번 작업) 이후에도 놓친 게 있는지 다시 훑기
   위해, 주석/문자열(특히 onclick="..." 속성 안의 텍스트는 실행 시점에
   전역 스코프로 풀리므로 죽은 훅이 아님)을 걸러내고 "실제 정의 파일
   밖에서 감싸졌는데, 정의 파일 자신은 bare 식별자로 그 함수를 부르는"
   패턴만 남기도록 정교화. 총 9건의 진짜 죽은 훅을 추가로 찾아 전부
   실제 정의부에 네이티브로 옮겼다:
   - **`unlockAchievement`**(progression/187) — progression/088이 감싸서
     업적 달성 시 보상(스탯/경험치 등)을 지급하려 했지만 한 번도 적용
     안 됨. **업적은 정상적으로 달성 표시되는데 보상은 지금까지 한 번도
     지급된 적이 없었다.**
   - **`renderSummons`**(progression/089) — ui/155가 감싸서 소환수
     시너지 안내와 "소환수 한정 퀘스트 시작" 버튼(3차 진화 이상)을
     붙이려 했지만 한 번도 안 붙음. 소환수 패널을 열어도 이 두 가지가
     보인 적이 없었다.
   - **`requestAISummonEvolution`**(progression/089) — ui/155가 감싸서
     4차 진화 도달 시 "소환수 비밀 스토리"를 트리거하려 했지만 한 번도
     발동 안 됨.
   - **`checkDemesneEvents`**(race/260) — race/064가 감싸서 "영지에
     있을 때 이벤트 확률 1.5배" 배율을 설정하려 했지만 한 번도 적용
     안 됨 — 영지에 있어도 이벤트가 더 자주 안 일어났다.
   - **`startGame`**(core/084) — misc/261이 감싸서 새 게임 시작 직전에
     "이전 세션 요약"을 저장하려 했지만 한 번도 실행 안 됨 —
     `showLastSessionSummary` 팝업이 참조하는 로그가 계속 비어있었다.
   - **`renderMemoryEnhanced`**(misc/277) — ai-prompt/161이 감싸서
     컨텍스트(토큰 사용량) 모니터를 메모리 패널에 붙이려 했지만 한 번도
     안 붙음.
   - **`renderDungeonRoomHTML`**(combat/256), **`fulfillProphecy`**
     (lore/301) — misc/298이 감싸서 각각 보스방 진입 연출·예언 실현
     연출을 트리거하려 했지만 한 번도 재생 안 됨(순수 시각 효과, 낮은
     우선순위지만 함께 수정).
   - `renderDemesnePanel`(race/260)도 감지됐으나, 이미 이전 회차(63번
     작업)에서 quest/086의 5턴 주기 훅으로 별도 경로가 이미 연결돼
     있어(단, 즉시 반영이 아니라 최대 5턴 지연) 우선순위를 낮춰 손대지
     않음. `renderTitles`(progression/240)의 감싸기도 감지됐으나, 실제
     렌더 결과를 확인해보니 그 감싸기가 타겟으로 하는 CSS 클래스
     (`.title-item`)가 현재 렌더링 결과에 존재하지 않아 고쳐도 효과가
     없는 죽은 코드라 손대지 않음.

각 항목 모두 죽은 감싸기 코드는 제거하고 설명 주석으로 대체, 실제
정의부에 네이티브로 직접 연결하는 이번 세션의 표준 패턴을 그대로
적용했다. 수정 후 문법 체크·전체 회귀 스위프·8개 항목 개별 동작
검증(업적 보상 호출, 가져오기 무파일 안전 처리, 소환수 시너지·퀘스트
버튼 렌더링 확인, 진화 비밀 스토리 트리거 안전 처리, 영지 배율 계산,
컨텍스트 모니터 렌더링 확인)을 모두 헤드리스로 실행해 콘솔 에러 0건,
전부 정상 동작을 확인했다.

**정직한 결론**: "다른 부분도 봐라"는 지적은 맞았다 — 좁게 판 3개
팝업 수정만으로는 부족했고, 기계적 스캐너를 다시 돌리자 실제로 8개의
새로운 죽은 훅과 1개의 완전히 죽어있던 기능(데이터 가져오기)을 더
찾았다. 다만 이번 스캐너로 찾을 수 있는 유형(정적 텍스트 패턴으로
탐지 가능한 "감싸기가 적용 안 되는" 버그)은 이걸로 사실상 전수
조사됐다고 판단하지만, 이 패턴에 해당하지 않는 다른 종류의 버그가
전혀 없다고 100% 장담할 수는 없다 — 그런 게 있다면 개별 사례를 실제로
재현해서 찾는 수밖에 없다.

---

### 2026-08-28 (같은 날, 8차) — "30턴 말고 100턴" → 이번 세션 최악의 버그(무한 전투 루프) 발견·수정

사용자 요청: 지금까지의 30턴짜리 검증은 부족하니 100턴으로 늘려서
다시 검증하라. 실제로 100턴짜리 자동 재생 테스트를 만들어 돌리자마자
**이번 세션 전체에서 가장 심각한 버그**가 바로 튀어나왔다.

**증상**: 몬스터와 마주쳐서 로컬 전투에 들어간 뒤로는, 몇 번을 이겨도
지고 도망쳐도 상관없이 **다음 메시지부터 영원히 같은 전투가 처음부터
(풀피로) 다시 시작됐다** — 채팅이 그 지점에서 사실상 완전히 멈춘다.
헤드리스로 재현한 사례 둘 다 명확했다:
1. "도적단×3"(무리 몬스터) — 완전히 전멸시켜도(적 3마리 전부 HP 0)
   다음 턴에 정확히 같은 무리가 풀피로 다시 나타남.
2. "혼돈의 화신"(HP 4650, 레벨 무시 희귀 조우) — 압도적인 상대라
   전투가 1라운드 만에 끝나는데(패배), 그 후 60턴 내내 단 한 번도
   채팅이 다시 진행되지 않고 계속 같은 전투로 되돌아감.

**근본 원인 (2가지, 둘 다 misc/328 `finishLocalCombat`/quest/086
`sendMsg`의 "미해결 전투 재개" 로직)**:

1. **무리 몬스터 전멸 판정 자체가 원본 레코드에 반영 안 됨.** 몬스터
   "무리"(count>1, 예 "도적단×3")는 로컬 전투 시작 시 개별 유닛(id:
   `${원본id}_1`, `${원본id}_2`, ...)으로 펼쳐지는데, 전투가 끝나고
   결과를 원본 몬스터 목록에 반영하는 코드가 이 펼쳐진 유닛 id로만
   원본 레코드를 찾고 있었다. 무리 몬스터의 원본 레코드는 id에 접미사가
   없어서 절대 매치가 안 되고, 그 결과 무리를 완전히 전멸시켜도 원본
   레코드는 영원히 `status:'alive'`로 남았다.
2. **더 심각함 — 도주/패배 시 "다시 마주칠 수 있게 살려두는" 설계가
   무조건 강제 재개로 작동해서 탈출구가 없었다.** 도주에 성공하거나
   전투에서 패배해도(의도적으로 몬스터를 살려두는 부분, 그 자체는
   정상) 그 몬스터는 `_localCombatEngaged` 표시가 그대로 남고,
   `sendMsg`의 "미해결 전투가 있으면 무조건 다시 연다" 가드가 다음
   메시지부터 예외 없이 매번 같은 전투를 다시 강제로 열었다. 즉
   **한 번이라도 확실히 못 이기는 상대(특히 의도적으로 압도적인 "이상
   현상" 조우)를 만나면, 그 즉시 게임이 다시는 진행되지 않는 진짜
   막다른 길이 됐다.** "10턴을 못 넘긴다"는 사용자의 반복된 호소를
   가장 정확하게 설명하는, 이번 세션에서 찾은 것 중 단연 가장 심각한
   버그였다.

**수정**:
1. `finishLocalCombat`에서 펼쳐진 유닛들을 원본 몬스터별로 baseName
   기준으로 다시 묶어서, 무리든 단일 개체든 정확히 원본 레코드를 찾아
   HP를 반영하고 전멸 시 `status:'dead'`로 바꾸도록 고쳤다.
2. `sendMsg`의 "미해결 전투 재개" 가드에 탈출구를 추가했다 — 같은
   몬스터 조합에게 연속으로 강제 재개당한 횟수를 세어, 세 번째부터는
   그 몬스터를 놓아주고(`_localCombatEngaged` 해제) 메시지를 정상
   진행시켜 플레이어가 그 자리를 벗어날 수 있게 한다. 몬스터 자체는
   죽지 않고 세계에 남아있어 나중에 다시 마주칠 수 있다 — "다시
   마주칠 수 있게 살려둔다"는 원래 설계 의도는 그대로 지키면서, 그게
   "영원히 못 벗어난다"로 뒤집히지만 않게 했다.

**검증**: 헤드리스로 몬스터 상태(hp·status·engaged 여부)를 매 턴 직접
찍어보며 재현 — 수정 전에는 "도적단×3"을 몇 번을 완승해도 원본
레코드가 계속 `alive`로 남아 매턴 재개, "혼돈의 화신"은 60턴 내내 단
한 번도 못 벗어남을 확인. 수정 후 같은 시나리오를 60턴 재현했더니
보스급 몬스터(HP 295, 492)가 세계에 그대로 남아있는 채로도 매 턴
정상적으로 메시지가 진행됨을 확인(사소한 타이밍 지연 2건 제외, 모두
자체 복구). 이어서 **사용자 요청대로 30턴이 아닌 100턴** 전체 자동
재생 테스트(알려진 모든 팝업 자동 처리 + 로컬 전투 자동 처리 포함)를
돌려 **100턴 전부 완주**, `msgCount`가 턴 수와 정확히 1:1로 일치함을
확인(막힘 0회, 팝업 12회 자동 처리, 콘솔 에러 0건). 전체 회귀
스위프도 클린.

**정직한 결론**: 지금까지 이 세션에서 고친 "죽은 훅"·"팝업 겹침"류
버그들은 전부 실재했지만, 사용자가 실제로 매번 겪던 "10턴을 못
넘긴다"는 증상의 진짜 핵심 원인은 이번에 찾은 로컬 전투 재개 로직의
무한 루프였을 가능성이 매우 높다. 몬스터와 한 번이라도 마주치면(초반
몇 턴 안에 일어나기 쉬움) 거의 확실히 걸리는 조건이었고, 여태 100턴
단위 자동 재생으로 검증하지 않았다면 계속 놓쳤을 것이다 — "30턴 말고
100턴"이라는 요청이 정확히 이 버그를 표면화시켰다.

---

**확립한 원칙**: (1) `processGSBlock` 리타겟팅 — gs 필드 기반 훅은 이미
매 턴 확실히 호출되는 `window.processGSBlock(gs)`에 옮겨 건다. (2)
`sendMsg()` 네이티브 병합 — 텍스트/매턴 기반 훅은 실제 호출부(quest/086)
안에 `typeof 확인 후 호출` 관용구로 직접 연결한다. (3) 함수 자체 수정 —
결과값을 가공하는 훅(rollWarCheck 등)은 그 함수의 유일한 실제 호출부가
있는 파일에서 함수 본문에 직접 반영한다. (4) 매번 실제 호출 지점을
grep으로 검증하고, 이미 살아있는 훅(buildLightSystem·openP·renderChoices
등, 실제 호출부가 `window.X(...)`를 명시하거나 onclick 속성으로 전역
스코프에서 호출됨)은 건드리지 않는다. (5) 각 수정 후 헤드리스로 실제
상태 변화(localStorage 등)까지 직접 확인 — "에러 없음"이 아니라 "값이
실제로 바뀌었는가"를 기준으로 삼는다.

---

## 9차 수정 — 여행 지도(도보 이동 목록)가 AI 생성 장소를 빼먹던 문제

**배경**: 사용자가 "직접 이동하는 지도(여행 지도)랑 월드맵(세계지도)이
서로 다른 시스템이냐"고 물어서 실제 코드를 다시 대조해봤다. 확인
결과 둘 다 **같은 기반 장소 데이터(`window.getAllLocations()`)를
공유**하고 있었지만, 목적(도보 이동 목록 vs 육로 SVG 지도 vs 배
항해용 바다 지도)에 따라 세 개의 독립된 진입점으로 갈라져 있었다.

이 과정에서 실제 버그를 하나 발견했다: 세계지도(SVG, economy/255의
`getAllLandLocations()`)는 고정 장소 + **AI가 그때그때 만들어낸 장소
(`loadAILocations()`)**를 합쳐서 보여주는데, "여행 지도"(도보 이동
목록, quest/229의 `getReachableLocations()`)는 고정 장소만 읽고
AI 생성 장소는 애초에 목록에 넣지도 않았다. 심지어 장소 카드 UI
(`buildLocCard`)에는 이미 "✨AI" 태그를 붙이는 코드까지 있었는데
— 즉 원래 AI 생성 장소도 이 목록에 뜨게 설계됐던 게, 목록을 채우는
쪽에서 빠뜨려서 한 번도 나타난 적이 없었다. 게다가 이동 실행 함수
`confirmTravel()`도 똑같이 `getAllLocations()`만 조회하고 있어서,
목록만 고쳐서 AI 장소를 보이게 했어도 클릭하면 "장소를 찾을 수
없습니다"로 실패했을 것이다 — 처음에 지적받았던 "이동 눌렀는데
아무 일도 안 일어난다"는 것과 정확히 같은 실패 패턴.

**수정**: quest/229에 `getAllTravelableLocations()`(고정 장소 +
AI 생성 장소 병합)를 새로 만들고, `getReachableLocations()`와
`confirmTravel()` 둘 다 이 함수로 통일해서 목록에 뜨는 장소와 실제
이동 가능한 장소가 항상 일치하도록 했다.

**검증**: 헤드리스로 `generateAILocation()`을 직접 호출(API 키 없이
로컬 폴백 경로로 실제 장소 1건 생성) → `getReachableLocations()`
결과에 그 장소가 포함됨을 확인 → `confirmTravel(그 장소의 id)`를
호출해 `window.currentLocation`이 실제로 그 장소로 바뀜을 확인.
콘솔 에러 0건.

**두 지도의 관계(사용자 질문에 대한 결론)**: 완전히 별개의 세계가
아니라 **같은 장소 데이터베이스를 공유하는 서로 다른 "보는 방식"
+ 이동 수단**이다 — ① 여행 지도(목록, `#gbtn-map`): 전체 장소를
평면 리스트로, 도보 이동 전용, 지금은 AI 생성 장소까지 포함해
"존재하는 모든 장소"가 뜬다. ② 세계지도(SVG, 🗺️세계지도/🗺️월드맵):
같은 장소들을 대륙별 좌표에 배치한 지도 위에 점으로 표시(단, 해안
장소는 제외 — 그건 ③으로 감). ③ 항해 지도(배): 해안 도시·항구·섬만
따로, 배를 타고 이동. 지금 이 셋을 하나의 단일 UI로 완전히 합치지는
않았다 — 도보/육로/뱃길이라는 서로 다른 이동 수단을 표현하려면
구분된 진입점이 자연스럽고, 사용자가 원하는 "구석구석 다 가본다"는
목표는 셋 중 어느 진입점을 쓰든 이제 빠지는 장소 없이 전부 커버된다.

---

## 10~11차 수정 — 이동을 "순간이동 목록"에서 "진짜 여행 시스템"으로 통일

**배경**: 사용자가 메이플스토리를 예로 들며 "세계지도는 보기용/유료
전용으로 두고, 평소엔 직접 이동 방식으로 다니게 하자"고 요청했다.
코드를 다시 훑어보니 필요한 부품(도로망 다익스트라 경로 계산
`findRoadRoute`, 매 턴 자동으로 날짜를 줄이고 진짜 조우 이벤트도
일으키는 `startLandTravel`+`tickLandTravel`, 배를 타면 실제 좌표가
바다 위에서 움직이며 조우가 발생하는 항해 시스템 `tickVoyage`)은
전부 이미 존재했고 매 턴 파이프라인(misc/251, `tickNearDeathPenalty`)
에도 이미 연결돼 있었다. 문제는 그 옆에 "아무 데나 무료로 즉시
순간이동"시키는 목록(quest/229의 `confirmTravel`)이 나란히 살아있어서
실제로는 아무도 그 여행 시스템을 타지 않았다는 것 — 심지어 misc/054의
탑승 수단 대여 시스템도 말/마차/비행 탑승물마다 정의된 `speedMult`
(이동 속도)·`encounterMult`(조우 안전도) 수치가 단 한 줄도 실제 계산에
쓰이지 않는 죽은 데이터였다.

이어서 사용자가 "이미 가본 곳은 순간이동 대신 최단경로로 자동이동
시켜주고, 막혀서 못 가고 버벅거리는 일 없이 제대로 만들어달라, 그러면
탑승 수단이 뭐냐가 중요해질 것"이라고 구체화했다.

**수정 내용**:
1. **`confirmTravel`(quest/229)** — 클릭 즉시 순간이동시키던 로직을
   제거하고, 실제 여행(`startLandTravel`)을 태우도록 바꿨다. 예외는
   둘뿐: ① 해안 지역(배 없이는 갈 수 없음 — 항해 지도로 안내하는 버튼
   표시), ② 천상/지옥처럼 도로 자체가 없는 초자연적 realm(도로가 없는
   곳에 "며칠 걸어서 간다"가 성립하지 않으므로 기존처럼 즉시 이동
   유지, `_instantRelocate`로 분리).
2. **`moveToLocation`(misc/053)** — "실제 여행 도착" 및 "이미 가본 곳
   빠른 이동" 양쪽에서 쓰는 최종 도착 처리 함수인데, 예전엔 confirmTravel
   에만 있던 업적·일지·이동 로그·도착 서술이 여기엔 빠져 있어서 도착
   경로에 따라 기록이 갈렸다 — 한 곳에 합쳐서 통일했다. 조회 대상도
   AI 생성 장소를 포함하도록 넓혔다(안 그러면 AI 장소로 여행 갔다가
   도착 시점에 조용히 실패한다).
3. **`beginJourneyTo`(quest/229, 신규)** — "이미 가본 곳" 빠른 이동
   버튼(게시판·정치지도·종족 홈랜드 목록, 총 3곳)이 부르던
   `moveToLocation` 즉시이동을 대체한다. 목적지가 걸어갈 수 있는 물리
   장소면 실제 여행을 시작하고(도로망 최단경로 자동 계산 — 사용자가
   요청한 "자동이동"), 현재 위치가 아예 없거나 해안/초자연 realm일
   때만 안전하게 즉시 이동으로 대체한다.
4. **탑승 수단이 실제로 속도·안전도에 반영되도록 연결**:
   - `getTravelDays`(economy/255) — 비행 탑승물(그리핀·페가수스·와이번)은
     도로망 탐색 자체를 건너뛰고 직선 거리로 계산하되, 도로 보너스
     (`ROAD_SPEED_BONUS`)까지 적용해 "막는 게 없다"를 실제 수치로
     구현했다. 처음엔 speedMult만 반영해서 직선 비행인데도 명마보다
     느린 역설이 있었는데, 도로 보너스까지 얹으니 명마(도로 위,
     4.0×1.6)보다 그리핀(직선, 5.0×1.6)이 확실히 빨라졌다(헤드리스
     검증: 같은 목적지 기준 도보 21틱 vs 명마 5틱 vs 그리핀 4틱,
     그리핀 지상 조우 0회).
   - `tickLandTravel`(economy/255) — 조우 확률 계산에 탑승 수단의
     `encounterMult`를 곱하도록 추가(예전엔 도로 비중만 반영하고 탑승
     수단은 아예 안 봤다). 그리핀류는 `encounterMult:0`이라 지상 조우가
     원천 차단된다 — 데이터 주석에 "하늘엔 산적이 없다"고 이미 적혀
     있던 설계 의도를 처음으로 실제 실행했다.
   - `travelByTransport`(misc/054) — 배·마법진(그 자체가 "즉시 도착"이
     본질)만 기존처럼 순간이동 유지, 나머지(도보~명마, 그리핀~와이번)는
     `startLandTravel`로 실제 여행을 태운다. 목적지 목록도 해안 지역을
     제외하도록 통일(마법진은 예외 — 어디든 갈 수 있는 게 그 존재
     이유이므로 해안도 포함).

**검증**: 헤드리스로 (1) 여행 지도 클릭이 더 이상 즉시이동이 아니라
여행 상태를 만드는지, (2) 해안 지역 클릭이 안내 메시지와 함께 막히는지,
(3) 도보/명마/그리핀 3종으로 같은 목적지까지 실제 틱을 돌려 도착
시간을 비교(21틱→5틱→4틱, 그리핀 조우 0회로 순서·수치 모두 의도대로),
(4) AI 생성 장소로 실제 여행이 시작되고 도착까지 되는지, (5) "이미
가본 곳" 빠른 이동이 진짜 순간이동이 아니라 여행 상태를 만드는지 —
모두 확인, 콘솔 에러 0건. 다만 AI 생성 장소는 좌표가 매번 무작위라
아주 먼 거리로 뽑히면 여행에 며칠(60일 이상)이 걸릴 수 있다는 것도
확인했다 — 이건 "막혀서 못 감"이 아니라 "며칠이 걸리는 게 정상"인
경우이고(daysLeft가 매 턴 착실히 줄어드는 것도 확인됨), 다익스트라가
경로를 못 찾는 경우엔 `getTravelDays`가 항상 최소 1일로 안전하게
대체하므로(코드 상 이미 그렇게 폴백돼 있었음) 무한히 막히는 경우는
구조적으로 없다.

---

## 12차 수정 — "여행 중"이 다른 시스템과 개연성 없이 충돌하는 지점 점검

**배경**: 사용자가 "또 어색하거나 개연성 없는거 다 말해봐, 기록하면서"
라고 요청. 10~11차에서 이동을 순간이동에서 "매 턴 자동 진행되는 실제
며칠짜리 여행"으로 바꾸면서 새로 생긴 개연성 문제가 없는지, 그리고
그 상태(`loadTravelState()`)를 다른 시스템들이 제대로 알고 있는지를
집중적으로 다시 훑었다.

**발견 1 (수정함) — 여행 도착 시 서술이 뜬금없이 두 번 겹침**:
`tickLandTravel`은 매 AI 응답 이후 자동으로 도는 틱(misc/251,
파일명 그대로 "매 AI 응답 후 호출") 안에서 실행된다. 즉 여행이 끝나는
바로 그 턴은, 플레이어가 보낸 평범한 메시지에 대해 AI가 이미 "[🚶
여행 중] 잔여 1일"으로 응답을 다 쓴 *직후에* 도착 판정이 일어난다.
그런데 `moveToLocation`(도착 처리 함수)이 무조건 600ms 뒤에
"~에 도착해 주변을 둘러본다"를 sendMsg로 또 쏘게 돼 있었다 —
플레이어가 아무것도 안 눌렀는데 서술이 한 턴에 두 번 이어붙는
꼴이었다. 게다가 `tickLandTravel`은 이미 `S._pendingTravelHint`
("긴 여정 끝에 ~에 도착했다")를 심어둬서 *다음* 실제 플레이어 턴의
프롬프트에 자연스럽게 얹히는 더 나은 메커니즘을 갖고 있었는데, 이
자동 sendMsg가 그 힌트를 자기 프롬프트를 만들며 먼저 소비해버려서
정작 원래 설계된 자연스러운 경로는 무력화되고 있었다. → `moveToLocation`
에 `opts.skipArrivalMsg`를 추가해, 실제 여행 도착(tickLandTravel)
에서는 이 자동 sendMsg를 건너뛰고 pendingHint 경로만 쓰게 하고,
게시판/정치지도 같은 직접 클릭형 빠른 이동에서는 기존처럼 즉시
서술하도록 분리했다. 헤드리스로 두 경로 모두 검증(실제 여행 도착 시
sendMsg 미발동 + pendingHint 설정, 직접 클릭 시 sendMsg 발동).

**발견 2 (수정함) — 여행 중에도 "출발지 몬스터"가 또 튀어나올 수 있었음**:
일반 조우 시스템 `checkRandomEncounter`(quest/086)는 플레이어 메시지에
이동/탐험 관련 단어("탐험", "살펴본다", "간다" 등)가 있으면 곧바로
`window.currentLocation`(실제 여행 중엔 며칠 전 떠난 출발지에 그대로
고정돼 있음) 기준으로 조우를 굴렸다 — 이 함수는 여행 상태를 전혀
몰랐다. 그래서 실제 여행 도중 플레이어가 "숲을 탐험한다"류의 문장을
치면, 이미 여행 자체의 조우 시스템(`TRAVEL_ENCOUNTER_POOL`,
`tickLandTravel`)이 있는데도 며칠 전 떠난 도시 근처 몬스터가 또
등장할 수 있는 구조였다. → `checkRandomEncounter` 맨 앞에 여행 중이면
건너뛰는 가드를 추가했다.

**발견 3 (수정 안 함, 보고만 함) — AI 프롬프트가 "여행 중"이어도 출발지
사회 맥락을 그대로 계속 넣는다**: 시스템 프롬프트 조립(ai-prompt/077)
은 매 턴 `[👥 등장 인물]`(NPC 목록)을 비롯한 수십 개의 장소 관련
섹션을 `window.currentLocation` 기준으로 만든다. 여행 중엔 이 값이
출발지에 고정된 채이므로, AI는 "[🚶 여행 중] 잔여 N일"이라는 힌트와
"여기 이 도시의 등장인물/퀘스트/상점 정보"를 같은 프롬프트에서
동시에 받는다 — 논리적으로는 모순(며칠째 길 위에 있는데 그 도시
정보가 매턴 그대로 딸려옴)이지만, 실제로 AI 서술에 얼마나 영향을
주는지는 이번엔 검증하지 않았다. 완전히 고치려면 "여행 중엔 장소
관련 섹션들을 얼마나/어떻게 줄일지"를 정하는 설계 판단이 필요해서
(NPC 섹션을 통째로 비우면 "여행 중 우연히 마주친 캐러밴" 같은 서사
소스가 같이 사라질 수도 있음), 이번엔 손대지 않고 발견만 기록한다 —
필요하면 다음에 구체적인 방향을 정해서 진행.

**검증**: 두 수정 모두 `node --check` + 전체 재빌드 + 헤드리스 테스트로
확인(에러 0건). 발견 3은 설계 판단이 필요해 코드 변경 없이 이 문서에만
기록.

---

## 13차 — 전체 파일(420개) 순차 감사 시작

사용자가 "이동뿐 아니라 게임 파일 전체를 하나씩 확인하고, 어떻게
검수했는지·뭐가 나왔는지·고쳤는지/그냥 뒀는지 다 기록하면서 진행하자"
고 요청. `taleforge-modular/src/` 전체는 420개 파일(디렉토리 17개 +
루트 utils.js/main.js) — `data/`(127개, 순수 데이터 테이블)를 제외한
로직 파일이 293개다.

**0단계 — 전체 문법 검사**: `node --check`를 420개 파일 전부에 돌림.
**결과: 420개 전부 통과, 문법 오류 0건.**

**진행 방식 — 중간에 방법을 바꿈**: 처음엔 디렉토리 단위로 파일을
하나씩 순서대로 읽어나갔다(core/ 9개 파일 직접 정독 완료 — 문제 없음).
그런데 이 세션에서 지금까지 반복적으로 나온 가장 심각한 버그 유형이
"파일 하나만 봐서는 안 보이는" 것이었다 — `window.X = function`으로
어떤 기능을 완성해 노출해뒀는데, 실제로 그 이름을 호출하는 곳이
코드베이스 어디에도 없는(과거 이름이 바뀌었거나, 훅을 만들어놓고
실제 연결을 깜빡한) 패턴. 이건 파일 하나만 읽어서는 절대 못 잡고,
**전체 420개 파일을 한 번에 대조**해야만 잡힌다. 그래서 420개 파일
전부를 훑는 자동 스캐너를 만들어 먼저 돌리고, 스캐너가 찾아낸 "호출부
없는 훅" 후보들을 하나하나 직접 읽고 검증 → 진짜 죽은 코드면 고치거나
정리, 오탐이면 그 이유를 기록하는 순서로 바꿨다. (파일별 완전 정독은
core/ 이후 잠시 멈췄고, 이 스캔이 끝나면 나머지 디렉토리도 이어서
정독할 계획이다 — 아래 "남은 작업" 참고.)

**0단계 — 전체 문법 검사**: `node --check`를 420개 파일 전부에 돌림.
**결과: 420개 전부 통과, 문법 오류 0건.**

**1단계 — core/ 9개 파일 직접 정독**: 전부 읽고 호출부 대조까지 확인.
`134`(혈통 v2 매턴 훅) `_bloodlineV2PerTurn`은 quest/086 sendMsg
파이프라인에 정상 연결 확인. `123`(저장키 마이그레이션), `171`(DOM
주입 — 계승 패널), `267`(저장/로드 초기화), `122`(메뉴 openP 케이스),
`162`(AI 응답 캐싱), `244`(NPC 속성 보강 훅들), `135`(저장 키 상수),
`084`(엔진 본체) — 전부 읽고 이상 없음 확인. (084는 1710줄로 커서
여러 번에 걸쳐 발췌 확인 — 뒤에서 setupNext/startGame 등 검증할 때
다시 참조.)

**2단계 — 코드베이스 전체 "죽은 매턴 훅" 자동 스캔**: `window.NAME =
function`으로 정의됐는데 코드베이스 어디서도(template.html 포함)
`NAME(...)`으로 실제 호출되지 않는 이름을 찾는 스캐너를 작성. 1차
스캔은 정규식 결함(`window.NAME(...)` 형태의 정상 호출까지 오탐으로
걸러냄)이 있어 20건이 나왔는데, 그중 상당수가 오탐이었다 — 정규식을
고쳐 재검증(2차)하니 **12건**으로 줄었다. 그 12건을 전부 직접 읽고
호출부를 대조해 하나씩 판정:

| 이름 | 위치 | 판정 | 조치 |
|---|---|---|---|
| `_wandererAxisHook` | core/244, misc/230 | **진짜 죽음** — 방랑자 혼돈/질서 축·NPC 텍스트 감지·스탯 스냅샷(그래프용)·운명 분기점 감지·피로도 틱까지 5개 시스템이 이 훅 하나에 쌓여 있었는데 호출부 자체가 없었음 | quest/086 sendMsg 파이프라인(`_bloodlineV2PerTurn` 바로 옆)에 연결 |
| `showEndingCutscene` | misc/261 | **진짜 죽음** — 이 이름의 함수가 애초에 존재한 적 없음(실제 엔딩 실행 함수는 `triggerEnding`). "다이어리 하이라이트+스탯 요약" 엔딩 연출 모달이 한 번도 뜬 적 없었음 | `triggerEnding`(ui/155) 안에서 `showEnhancedEndingCutscene` 직접 호출로 교체, 죽은 래핑 블록 제거 |
| `awakenBloodline` | misc/298 | **진짜 죽음** — 이 이름도 존재한 적 없음(실제 함수는 `awakenBloodlineAuto`). 혈통 각성 연출 애니메이션이 한 번도 재생 안 됨 | `awakenBloodlineAuto`(job/125) 안에서 `animBloodlineAwaken` 직접 호출, 죽은 래핑 블록 제거 |
| `_meIntercept` | quest/086 | **진짜 죽음(가장 큼)** — "선택지 입력이 충분히 쌓이면 AI 대신 로컬 풀에서 비슷한 과거 응답 재사용" 캐시 엔진이 완성돼 있었고 데이터 수집(`tf-master-playlog`)도 정상 작동 중인데, 정작 그걸 읽어 쓰는 진입점이 실제 AI 호출 함수(`callAI`)에 연결된 적이 없어서 매 턴 무조건 AI를 불렀음 | `callAI`(quest/086) 최상단에서 먼저 시도, 히트하면 그 텍스트 반환·미스면 기존 3단계(클라우드→로컬→로컬조합) 진행 |
| `completeDynQuest`/`failDynQuest`/`deleteDynQuest` | job/087 | **부분 결함** — AI 동적 퀘스트 진행 카드에 완료/포기/삭제 버튼이 하나도 없어서, 자동완료 조건이 안 맞으면 영원히 목록에 박혀있고 포기할 방법이 없었음(완료는 치팅 방지상 의도적으로 미노출 유지) | 진행 중 카드에 "✕ 포기"(`failDynQuest`), 완료/실패 카드에 "🗑"(`deleteDynQuest`) 버튼 추가 |
| `completeNpcDlgQuest`/`failNpcDlgQuest`/`deleteNpcDlgQuest` | quest/229 | 위와 동일한 결함, NPC 대화 의뢰 카드판 | 동일하게 포기/삭제 버튼 추가 |
| `manualGenerateLocation` | quest/229 | **진짜 죽음** — "AI장소" 패널에 "지금 새로운 장소 탐험하기" 버튼이 완성돼 있는데 패널 어디에도 그 버튼 자체가 없었음(자동 트리거로만 늘어남) | 패널 상단(빈 상태 포함)에 버튼 추가 |
| `nextSetupStep` | misc/261 | **무해한 죽은 코드** — 이 이름도 존재한 적 없음(실제 함수는 `setupNext`). 1.5초마다 영원히 폴링만 하는 죽은 루프였는데, 하려던 일(_goals 단계 처리)은 이미 `setupNext`에 네이티브로 구현돼 있어 기능상 피해는 없었음 | 폴링 루프 제거(설명 주석으로 교체) |
| `initGame` | progression/020 | **무해한 죽은 코드** — 이 이름도 존재한 적 없고 호출부도 없음. 하려던 일(오크 혈맹/평의회 스탯 적용)은 이미 quest/086의 실제 게임 재개 초기화 지점에서 정상 호출 중 | 죽은 래핑 블록 제거 |
| `covenantManualSin`/`covenantManualDeed` | progression/020 | **문제 없음** — 이름 그대로 수동/디버그용 보조 함수. 자동 감지 경로(서사 텍스트 분석 + 스킬 발동 시)가 이미 완전히 정상 작동 중이라 이 둘이 UI에 연결 안 된 건 설계상 문제 아님 | 조치 없음(확인만) |
| `unlockTitle` | progression/236 | **문제 없음** — `if(typeof unlockTitle==='function'){...} else if(typeof window.addTitle==='function'){...}` 구조에서 IF 조건이 항상 거짓이라(그 이름의 함수가 없음) ELSE 분기(`addTitle` 래핑)가 실제로 실행되고 있었음. 확인 결과 그 경로가 정상 작동 | 조치 없음(확인만, IF 분기는 무해한 미도달 코드로 남김) |
| `onerror` | misc/001 | **오탐** — `window.onerror`는 브라우저가 자동으로 호출하는 표준 전역 에러 핸들러라 명시적 호출부가 필요 없음 | 조치 없음 |
| `completeDynQuest` (단독) | job/087 | **문제 없음** — 완료는 자동 판정 전용으로 의도적으로 UI 미노출 유지(수동 강제완료 버튼을 주면 조건 없이 보상만 챙기는 치팅 경로가 열림) | 조치 없음(확인만) |

**검증**: 전체 6개 파일 재빌드 + `node --check` 통과 + 헤드리스로
실제 3턴 플레이(신규 연결된 `callAI`의 `_meIntercept` 경로 포함)
회귀 테스트, 콘솔 에러 0건.

**남은 작업(다음 라운드)**: economy → quest(나머지) → misc(68개, 최대
디렉토리) → world → npc → job(나머지) → items → progression(나머지) →
race → religion → summon → combat → ai-prompt → ui → lore → patches →
data(127개, 구조적 점검 위주) 순으로 계속 진행 예정. 이번 라운드의
"전체 스캔 → 후보 검증" 방식이 파일당 정독보다 훨씬 효율적으로 진짜
버그를 잡아냈으므로, 앞으로도 이 방식(오프클릭 참조 검사, 데이터
중복 키 검사 등 다른 스캔 유형 추가)을 우선 적용하고, 스캔으로 못
잡는 "서사적 개연성" 문제는 각 디렉토리 정독 때 별도로 확인한다.

---

## 14차 — 추가 스캔 3종 + economy/·quest/ 정독

사용자가 "전부 다 진행해"라고 요청해서 계속 이어감.

**추가 스캔 3종 (전체 코드베이스 대상)**:
1. **onclick 참조 검사** — template.html·전체 src의 `onclick="..."`
   안에서 호출하는 함수 이름이 실제로 어딘가에 정의돼 있는지 대조.
   메서드 호출(`obj.method()`) 오탐을 걸러내도록 두 번 다듬은 뒤 결과:
   **정의를 못 찾은 진짜 후보 1건** — `showItemCompare`(job/087, 장비
   장착 시 "비교 화면" 표시 버튼). 이미 `typeof` 가드가 있어 함수가
   없으면 그냥 즉시 장착으로 자연히 대체되므로 크래시는 없음 — 다만
   "장착 전 비교 보여주기"라는 의도된 기능은 애초에 구현된 적이 없다는
   뜻. **판단**: 새 UI 기능이라 이번엔 만들지 않고 발견만 기록.
2. **데이터 파일(data/, 127개) id 중복 검사** — 같은 파일 안에서 `id`
   값이 중복되면 `.find()` 조회가 항상 첫 값만 찾는 버그가 될 수 있어
   전수 검사. 5개 파일에서 중복이 나왔지만 전부 직접 대조한 결과
   **오탐** — 같은 id가 서로 다른 독립된 배열/티어(예: 균열 소환
   VOID_SUMMON_POOL은 레벨 2~7별로 배열이 나뉘어 있고 상위 레벨이
   하위 레벨 소환수를 이어받는 게 의도된 설계, 하이라이트/봉인기억/
   데자뷰 목록도 서로 다른 시스템이라 같은 개념어 id 재사용이 문제
   없음)에 들어있어 실제 충돌이 아님. **결론**: data/ 127개 파일 구조
   건전함.
3. **여러 파일이 각각 다른 본문으로 window.X를 정의하는 경우** — 17건
   나왔는데 대부분 이 코드베이스의 정상 관용구인 "이전 정의를
   캡처 → 감싸서 확장"(래핑 체인) 패턴. 그중 상태를 직접 바꾸는
   핵심 함수(`setPlayerReligion` 3파일, `detectAndSetLocation` 3파일)
   를 짚어 체인이 실제로 전부 이어지는지(끊기거나 서로 덮어쓰지
   않는지) 직접 대조 — **문제 없음**, 전부 정상적으로 이전 함수를
   호출한 뒤 자기 로직을 얹는 구조.

**economy/ 5개 파일 전체 정독**:

| 파일 | 판정 | 조치 |
|---|---|---|
| 069(경제 시스템 본체) | `enhanceItem`의 등급별 강화비용 배율표에 epic·primal이 빠져 있어 이 두 등급 장비만 common과 똑같이(가장 싸게) 강화됨. `fusionItems`의 합성 등급 사슬도 rare→legendary로 epic을 건너뛰고, legendary는 최고 등급 취급돼 primal로 합성이 아예 안 됨 — 둘 다 바로 옆 sellItem의 6등급(common~primal) 가격표와 어긋나는 진짜 결함 | **수정**: 두 표 모두 6등급 전체를 잇도록 보정 |
| 200(경제 자동 변동) | 과거 B50 버그(전쟁 감지 필드명 오류)가 이미 고쳐져 있음, `tickEconomy` 매 턴 호출 확인 | 조치 없음(정상) |
| 285(경제 시스템 실질화) | `showEconomyMenu`/`processInvestments`/`processMercenary` 전부 실제 호출 경로(버튼·tickGameTime 체인) 확인 | 조치 없음(정상) |
| 191(경제 현황 패널) | 읽음, 이상 없음 | 조치 없음 |
| 255(상인·거래소, 오늘 이미 다수 수정) | 이번 세션에서 이미 여행/이동 관련으로 광범위 수정·검증 완료 | (이전 라운드에서 처리됨) |

**quest/ 나머지 파일 정독 (11개 중 086·229 외 7개 완료, 331·041 남음)**:

| 파일 | 판정 | 조치 |
|---|---|---|
| 265(퀘스트 데이터 구조) | 단순 헬퍼, 이상 없음 | 조치 없음 |
| 039(히든 퀘스트) | 이상 없음 | 조치 없음 |
| 290(미스터리 퀘스트라인) | `checkMysteryQuestlineProgress` 매 턴 호출 확인 | 조치 없음 |
| 209(퀘스트 완료/실패 자동체크) | 별도의 "시스템 정의 퀘스트"(quest/141 DB) 계열 — 종교 부퀘·포로 처리 등 9개 파일에서 사용 중, 매 턴 체크도 정상 호출 확인 | 조치 없음 |
| 107(성직자 비밀 퀘스트라인) | 발견·완료 함수 둘 다 실제 호출부(매 턴 훅 + UI 버튼) 확인 | 조치 없음 |
| 141(퀘스트 DB) | 클린한 데이터 접근 계층, 이상 없음 | 조치 없음 |
| 270(퀘스트 파트 업데이트) | `dirty` 지역변수가 대입만 되고 읽히지 않음(무해한 미사용 변수) 외엔 이상 없음, 매 턴 호출부 2곳 다 확인 | 조치 없음(무해해서 그대로 둠) |

**검증**: 변경 파일(economy/069) `node --check` 통과, 전체 재빌드 성공.

**quest/331·041 정독 (quest/ 디렉토리 11/11 전부 완료)**:

| 파일 | 판정 | 조치 |
|---|---|---|
| 331(로컬 AI 모델 엔진 — 브라우저 내장 WebGPU 모델) | 파일 자체가 "이 샌드박스는 CDN이 막혀 있어 실제 다운로드/추론을 검증 못 했다"고 스스로 명시해둘 만큼 정직하게 작성돼 있음. 3단 폴백(로컬모델→클라우드→로컬조합) 순서·에러 처리·진단 로그 전부 꼼꼼함. 이번 라운드에 새로 연결한 `_meIntercept`(callAI 최상단)와의 우선순위도 자연스럽게 맞음(ME 캐시 히트가 최우선, 그다음 이 3단 폴백) | 조치 없음(정상, 실기기 최초 1회 검증은 코드 밖의 일이라 별도 안내 필요) |
| 041(궁수/전사/마법사/도적 T2 히든 퀘스트 데이터, 793줄) | 대부분 순수 데이터(다른 디렉토리였다면 data/로 분리됐을 분량이지만 이 파일만 예외적으로 quest/에 인라인) — 내부 id 중복 검사 실행, 중복 0건. `checkHiddenQuestsLocal` 매 턴 호출부 확인 | 조치 없음(정상) |

**quest/ 디렉토리 최종 결과**: 11개 파일 전부 정독 완료. 진짜 버그
9건 발견·수정(10~13차 합산: 이동 시스템 재설계 다수 + `_meIntercept`
+ 퀘스트 포기/삭제 버튼 3세트 + AI장소 탐험 버튼), 무해한 것 확인만
하고 넘어간 항목 다수.

---

## 15차 — misc/ 디렉토리 착수 (68개 중 13개 완료)

misc/는 이 코드베이스에서 가장 큰 디렉토리(68개 파일)라 여러 라운드에
걸쳐 진행한다. 이번 라운드에서 짧은 파일부터 13개 정독:

| 파일 | 판정 | 조치 |
|---|---|---|
| 059(발타자르 해적왕 프로필) | 5줄, 데이터 재노출뿐 | 조치 없음 |
| 060(마리넬라 폭풍마법사 프로필) | 059와 동일 패턴 | 조치 없음 |
| 246(적 AI 행동 패턴 감지) | `detectEnemyBehavior` 호출부(misc/251, 전투 시작 시 1회) 확인, 감지 결과가 AI 프롬프트 주입 + 몬스터 객체에 실제로 저장돼 상태이상 면역 체크에 쓰이는 것까지 확인 | 조치 없음(정상) |
| 329(로컬 매칭엔진 기본값 초기화) | 이번 라운드에 고친 `_meIntercept`와 직접 연결되는 초기화 코드, 정상 확인 | 조치 없음 |
| 320(MutationObserver 통합) | window.X 패치가 아니라 실제 DOM(#msgs) 관찰자를 직접 붙이는 방식이라 애초에 이 세션에서 반복된 버그 유형에 안 걸림. 재시도 로직도 정상 | 조치 없음 |
| 033(배신 가능한 동료 시스템) | `getBetrayalBLS` BLS 주입부(ui/154) + 실제 기록 저장부(ai-prompt/148, GS `told_lie`류 처리) 양쪽 다 확인 | 조치 없음 |
| 237(메시지 버블 CSS) | 순수 CSS 주입, 버그 불가능 | 조치 없음 |
| 239(서사 규칙 보강 — callAI 래핑) | `window.callAI`를 감싸는 구조인데, 실제 매 턴 서사 생성 호출부(quest/086:1908)가 `window.callAI(...)`로 명시적으로 부르고 있어(다른 죽은 훅들과 달리 bare 식별자를 안 씀) 이 래핑이 실제로 적용됨을 직접 확인. 이번 라운드에 새로 연결한 `_meIntercept`와도 순서상 충돌 없음 | 조치 없음(정상) |
| 036(성장형 악당 시스템) | quest/086·ai-prompt/077에서 import해 사용 확인 | 조치 없음 |
| 030(동적 클리어 목표) | 이전 라운드(#52)에 이미 챙겨졌던 시스템, quest/086에서 사용 확인 | 조치 없음 |
| 243(상태이상 아이콘 헤더 표시) | `updateHeader` 래핑 체인에 정상 연결(deferred) | 조치 없음 |
| 238(로딩 중 문구 애니메이션) | `renderThinking` 래핑 체인에 정상 연결(deferred) | 조치 없음 |
| 160(환경 생존 시스템) | `getSurvivalBLS` 프롬프트 주입(core/162) + GS 필드(`survival_resource`/`exit_survival`/`enter_survival`) 파싱·적용 + 텍스트 키워드 자동 진입 감지(quest/086)까지 전 구간 확인 — #70에서 "낮은 우선순위로 보류"라고 적혀 있었지만 실제로는 이후 라운드에 완전히 구현·연결돼 있었음 | 조치 없음(정상, 이미 완료돼 있었음) |

13개 전부 정상 — 이번 배치에선 새 버그 없음(과거 라운드에서 misc/의
큰 죽은 훅들은 이미 #59~67에서 많이 잡혔던 만큼, 남은 파일들은 상대적
으로 건전할 가능성이 있다).

---

## 16차 — misc/ 계속 (8개 추가, 세션 전체에서 가장 심각한 발견 포함)

| 파일 | 판정 | 조치 |
|---|---|---|
| 093(종교 긴장도 계산) | `getReligionTension()`이 `{level,between,desc,icon,stage}` 객체를 반환하는데, religion/111의 두 항목(공통의 적 휴전·이단 분리 조약)이 이 반환값을 그대로 `>0`/`<=0`으로 비교하고 있었다 — 객체 vs 숫자 비교는 `NaN`이 돼서 항상 false. 즉 실제 긴장도와 무관하게 이 두 평화 협상 경로가 절대 안 열리고, "이미 평화로움" 안내도 절대 안 뜸 | **수정**: `.level`로 실제 숫자를 꺼내 비교하도록 고침 |
| 216(운명 카드 시스템) | `drawFateCard`가 AI GS 필드(`draw_fate_card`)로 정상 연결, `buildLightSystem` 래핑 체인(patches/223)도 실제 호출부가 전부 `window.buildLightSystem(...)`으로 명시 호출하는 것을 재확인해 살아있음을 검증 | 조치 없음(정상) |
| 308(sendMsg 후처리 통합 훅) | MutationObserver 콜백의 nested for 루프 안에서 `continue`를 써야 할 자리에 `return`을 써서, 같은 mutation 배치에 텍스트/주석 노드가 먼저 오면 콜백 전체가 끝나버려 뒤따르는 진짜 메시지 버블(.msg-ai)을 건너뛸 수 있는 잠재 버그(바로 옆 misc/320의 동일 패턴은 `continue`로 올바르게 되어 있어 대조됨) | **수정**: `return` → `continue` |
| 268(현재 씬 분석 헬퍼) | misc/275에서 사용 확인 | 조치 없음 |
| 142(사건 DB) | 9개 파일에서 광범위하게 사용 확인 | 조치 없음 |
| 144(플레이어 상태 DB) | 6개 파일에서 광범위하게 사용 확인(부상/트라우마/업적/유대/평판 전부) | 조치 없음 |
| **127(가문 특성 자동 적용)** | **연쇄 발견의 시작점** — `applyBloodlineTraits()`(종족/직업/배경 기반 가문 특성 스탯+AI 서사 힌트) 자체는 잘 만들어져 있으나 호출부 추적 중 대형 버그 발견(아래 133 참고) | 코드 자체는 정상, 호출 경로가 문제 |
| **133(게임 시작 훅 — 자동 혈통 배정 연결)** | **이 세션 전체에서 가장 심각한 발견**: `autoAssignBloodline()`(혈통 타입 배정 — 드래곤혈/왕가/신성 등)과 `applyBloodlineTraits()`(가문 특성) 둘 다 "게임 시작 시 1회" 걸려던 훅인데, `window.doStartChat`을 감싸는 방식이었다. 그런데 진짜 `doStartChat()`의 실제 호출부(core/084:1678)가 `doStartChat();`으로 **bare 식별자 직접 호출**이라 이 래핑이 처음부터 단 한 번도 적용된 적이 없었다. 추적해보니 매 턴 각성 체크(`tickBloodlineAwaken`, job/125)는 이미 정상 연결돼 있었지만 그 함수 맨 앞이 `if(!bl?.type) return;`라 — **애초에 시작할 혈통 자체가 배정된 적이 없어서 이 게임이 나온 이래 혈통 시스템 전체(스탯 보너스·각성·진화·전용 패널)가 단 한 번도 활성화된 적이 없었다.** 캐릭터 생성 완료 지점(quest/086의 진짜 doStartChat)에서 두 함수를 직접 호출하도록 옮김 | **수정 + 헤드리스 검증**: 새 캐릭터 생성 후 `loadBL().type`이 실제로 채워짐(예: `fate_blood`/운명의 혈통) 확인, `applyBloodlineTraits`의 콘솔 로그(`[BloodlineTrait] 전사의 핏줄 자동배정`)도 실제 발생 확인. 콘솔 에러 0건 |

**검증**: 변경 파일 4개(`religion/111`, `misc/308`, `quest/086`, `summon/133`)
전부 `node --check` 통과, 재빌드 성공, 헤드리스로 혈통 배정 실제
발생을 직접 확인(신규 캐릭터 → `loadBL().type` 채워짐 + 가문 특성
로그 발생, 콘솔 에러 0건).

**다음 작업**: misc/ 나머지 47개 → world → npc → job(나머지) →
items → progression(나머지) → race → religion → summon → combat →
ai-prompt → ui → lore → patches → utils.js/main.js. 계속 이어서
진행한다.

---

## 17차 — misc/ 계속 + 전체 코드베이스 자동 스캔 2종 신설 (스캐너로 대전환)

420개 파일을 한 줄씩 손으로 다 읽는 방식은 misc/ 몇 개 처리하는 데도
시간이 오래 걸려 지속 가능하지 않다고 판단, 이번 라운드부터 **"export
됐지만 정의 파일 밖에서 전혀 호출되지 않는 함수" 전체 스캐너**
(`scan_dead_exports2.js`)를 새로 만들어 420개 파일 전체를 단번에
훑는 방식으로 전환했다. (기존 `scan_dead_hooks2.js`/`scan_onclick_refs.js`도
재실행해 재확인 — 새 회귀는 없음, 기존에 알려진 항목만 재검출.)

**스캐너 설계 주의점**: 처음 버전은 `NAME(` 패턴만 찾아 `renderXxxPanel?.()`
같은 옵셔널 체이닝 호출을 다 놓쳐 오탐이 200건 이상 나왔다 —
`renderPanel()`(quest/086) 안의 거대한 switch문이 거의 모든 패널을
`renderXxxPanel?.()` 형태로 호출하기 때문. 정규식에 `\??\.?` 를 추가해
옵셔널 체이닝도 잡도록 수정한 뒤 185건으로 줄었고, "진짜 함수 선언 +
자기 자신 시그니처 외 호출 0회"로 좁히니 약 90건의 실제 후보로 압축됐다.

### misc/022(공허 감지 시스템) 정밀 확인

`getVoidSenseAIHint()` 자체는 misc/022 내부(패널 미리보기)에서만 호출돼
얼핏 "힌트가 AI에 안 전달되는 죽은 훅"처럼 보였지만, 확인해보니
`ui/025`의 `getDarklingExtContext()`가 **같은 정보를 자체적으로
다시 조합**해 `buildLightSystem` 래핑 체인(같은 파일, 1.5초 후 실행되는
deferred IIFE)에 실제로 물려 있었다. 즉 공허 감지 힌트는 다른 경로로
이미 AI 프롬프트에 정상 도달 중 — 조치 불요(정상).

| 파일 | 판정 | 조치 |
|---|---|---|
| 022(공허 감지 시스템) | 위 설명대로 확인 — `getVoidSenseAIHint` 자체는 UI 미리보기 전용이지만 동일 정보가 ui/025 `getDarklingExtContext`를 통해 buildLightSystem에 이미 주입되고 있어 실질적으로 정상 | 조치 없음(정상) |
| 009(레벨업/스탯 배분) | `dramaticLevelUp`(3중 래핑 체인, 전부 deferred+`window.X(...)` 명시 호출 확인)은 정상. 하지만 `addExp`의 레벨업 분기가 `typeof showStatRecommendation==='function'` 가드로 호출하던 함수가 **코드베이스 어디에도 구현된 적이 없었다**(가드 덕에 에러는 안 났지만 늘 조용히 no-op) — 레벨업 후 "추천 스탯" 토스트가 한 번도 뜬 적 없음 | **수정**: `renderBuildRecommendPanel`의 gap 분석 로직을 재사용해 `showStatRecommendation()` 실제 구현 + 완료(✓) 버튼 2개 추가(아래 job/087 참고) |
| 015(시스템 11~20: 금지스킬/나비효과/영구스탯/사인/트라우마/유언/메타지식/혈통진화/운명변수/탐험맵) | export된 모든 record/get 계열 함수(`unlockForbiddenSkill`, `addButterflyEffect`, `rollPermStatBonus`, `recordDeathCause`, `recordTrauma`, `addMetaKnowledge`, `recordRacePlayed`, `recordClearQuality`, `addExploredLocation` 등 18개)를 전수 호출부 카운트 — 전부 1개 이상 외부 호출 확인 | 조치 없음(정상) |
| 016(시스템 21~30: 관계유산/세계비밀/능력각인/원한추적/시간메아리/운명선택/신의시선/저주계보/과거기도/운명수레바퀴/평행자아/저주고리/회차통계/부상흔적/과거테마/기억왜곡/나이역설/소환수유산/원한무기/세계수) | 거대한 회차-유산(reincarnation legacy) 데이터 모음. 모든 mutator(`record*`/`accumulate*`/`use*` 계열 28개)를 전수 카운트 — 전부 외부 호출 확인 | 조치 없음(정상) |
| 017(시스템 41~50: 예지몽/유산건물/감시자/영혼가면/감정파문/유언장/별자리/탐험지도/번개각인/여명/전쟁상흔/신계약/언어기억/죄속죄/전설파편/신화저자/혈통특성/저주계보/세계기억) | 016과 같은 계열의 또 다른 거대 데이터 모음. mutator 20개 전수 카운트 — 전부 외부 호출 확인 | 조치 없음(정상) |
| job/087(전직/퀘스트 헬퍼) | 스캐너가 `completeDynQuest`/`completeNpcDlgQuest`(둘 다 온전히 구현된 "수동 완료 처리" 함수)를 호출부 0건으로 검출 — 13차에서 추가한 "✕ 포기"/"🗑" 버튼과 짝이 되는 "✓ 완료" 버튼이 애초에 없었던 것. `failDynQuest`/`deleteDynQuest`는 버튼이 있는데 `completeDynQuest`만 빠진 비대칭 | **수정**: dynQuest·NPC의뢰 진행중 카드에 각각 "✓ 완료" 버튼 추가(확인창 포함, `completeDynQuest`/`completeNpcDlgQuest` 호출) |
| quest/229(unlockTitle 폴백 재확인) | 전체 스캐너가 `unlockTitle`도 후보로 냈으나, progression/236의 deferred 블록을 다시 보니 `typeof unlockTitle==='function'` 이 false로 평가된 뒤 `else if(typeof window.addTitle==='function')` 폴백으로 넘어가 실제 칭호 지급 함수(`window.addTitle`, job/010)를 정확히 감싸고 있었다 — 폴백 분기가 의도대로 작동 중 | 조치 없음(정상, 폴백 로직으로 이미 살아있음) |
| combat/210(전투 시스템) | **superseded 확인**: `startCombat`/`processCombatTurn`/`checkCombatEnd`/`endCombat`/`getCombatState`/`saveCombatState`/`loadCombatState`/`applyDamage`가 조작하는 `COMBAT_STATE` 객체를 정의 파일(`combat/210`, `data/210`) 밖 어디서도 건드리지 않는 것을 확인 — 실제 전투는 misc/327~328의 로컬 서술 전투 엔진이 완전히 대체했고, 이 파일에서 실전에 남아 쓰이는 건 `calcDamage`(데미지 공식) 하나뿐(misc/327:371,385 / misc/328:691에서 재사용 확인) | **정리**: 고아 함수 8개 전부 제거, `calcDamage`만 남김. 관련 미사용 import(`gainEvoEnergy`,`unlockAchievement`,`S`,`COMBAT_STATE`)도 함께 제거 |
| ui/196(속성 상성 매트릭스 UI) | `getAffinityDamageMultiplier`가 코드베이스 어디서도 호출된 적이 없고, 값도 +30%/-20%로 실제 전투가 쓰는 job/035 `calcAffinityMod`(+50%/-40%, 이 패널 자신의 안내 문구와 일치)와 달랐다 — 죽은 데다 수치까지 다른 완전한 중복 구현 | **정리**: 고아+오차 함수 제거, 실제 배율 계산은 `calcAffinityMod`→`calcMonsterDamageMultiplier`(quest/086, misc/328에서 실전 사용 확인) 경로가 이미 정상 담당 중 |
| race/028(악마족 진명) | `initDemonAllSystems()`(각성 시 3개 스탯적용 함수를 묶어 부르는 편의 래퍼)가 호출부 0건 — 그러나 개별 함수(`applyDemonCorruptionStats`/`applyDemonContractStats`/`applyTrueNameStats`)는 quest/086의 진짜 `doStartChat()` 안에서 이미 각각 개별적으로 `typeof` 가드와 함께 호출되고 있어(1292~1294줄, 혈통 수정 때와 같은 위치) 기능상 손실 없음 | 조치 없음(무해한 미사용 편의 래퍼) |
| items/218(인벤토리/영혼무기) | `tryGrantSoulFromNpc`/`scanAllNpcsForSoulGrant`/`activateSoulWeapon`/`levelUpActiveSoul`이 스캐너에 잡혔으나, 코드 자체에 `/* removed in v10 */`, `/* deprecated in v8 */` 주석과 함께 **의도적으로 빈 스텁**으로 남겨둔 것을 확인(구버전 세이브 호환용으로 추정) | 조치 없음(의도된 죽은 스텁) |
| quest/209(퀘스트 완료/실패/자동체크) | `completeQuest`/`checkQuestCompletion`은 GS `q_done` 필드·종교 사이드퀘스트 등에서 실사용 확인. 그러나 같은 파일의 `failQuest`/`activateQuest`/`abandonQuest`는 호출부 0건 — 다만 이 퀘스트 실패/포기를 트리거할 GS 필드 스펙 자체가 AI 프롬프트 어디에도 정의돼 있지 않고, 전용 UI 패널도 없어서 "만들다 만 훅" 이라기보다 애초에 진입점이 설계되지 않은 API로 보임 | 조치 없음(정보성 — 진입점 부재, 별도 기능 설계 필요) |

### 추가 확인 (같은 라운드 연장) — misc/053 실제 버그 발견 + 대형 고아 코드 2건

| 파일 | 판정 | 조치 |
|---|---|---|
| misc/053(게시판 시스템) | **실제 버그**: `manualCompleteBulletin()`(게시판 의뢰 수동 완료 — 골드/경험치/평판/희귀 보상까지 완비)이 호출부 0건이었는데, 확인해보니 게시판 의뢰는 job/087의 `checkDynQuestCompletion`(AI 서사 키워드 자동 감지)과 별개인 **네 번째 독립 퀘스트 저장소**(`loadQuests`/`saveQuests`, `misc/053` 자체 관리)였고, 이 저장소는 애초에 자동완료 감지 로직 자체가 없었다. 그런데 UI 카드는 "✔ 진행 중 (조건 달성 시 자동 완료)"라고 **실제로는 없는 자동완료를 약속**하고 있어 — 게시판 의뢰를 한번 수락하면 영원히 완료할 방법이 없는 실제 플레이어 체감 버그였다 | **수정**: job/087에 추가한 것과 같은 패턴으로 "✓ 완료 처리" 버튼 추가, 거짓 안내 문구("자동 완료") 제거, 완료된 카드는 "✅ 완료됨"으로 별도 표시. 헤드리스로 accept→manualCompleteBulletin 흐름 실제 동작 확인(완료 전/후 상태 변화 확인, 콘솔 에러 0건) |
| ai-prompt/077(시스템 프롬프트 조립) | **대형 고아 코드 발견(수정 보류)**: `buildSystem(char,titles,memory,npcs,...)` 함수가 무려 **2333줄**(78~2411행)인데 코드베이스 어디서도 호출되지 않는다. 추적 결과 `window.buildLightSystem`의 진짜 베이스 구현은 misc/076의 별도의(이 함수를 전혀 참조하지 않는) 독자적인 `buildLightSystem()` 함수였다 — 즉 "가벼운(Light) 버전"으로 통째로 대체된 구버전 시스템 프롬프트 조립기다. 다른 파일들의 `window.buildLightSystem=function(...)` 래핑 체인(ui/154, ui/291, misc/292, misc/293, patches/223, patches/299, patches/322 등)은 전부 misc/076의 base 위에 쌓이는 것이지 이 `buildSystem`과는 무관 | **조치 보류**(발견만 기록) — 완전히 죽은 코드가 맞지만 2300줄 규모라 이번 라운드 예산 안에서 안전하게 삭제 검증하기엔 범위가 크다. 게임 동작에는 영향 없음(죽은 코드라 실행 자체가 안 됨). 후속 전용 라운드에서 정리 권장 |
| summon/215(혈통 시스템 — 별도 계열) | **대형 발견(수정 보류)**: 이 세션 16차에서 고친 "진짜" 혈통 시스템(summon/124 `autoAssignBloodline`+`loadBL`/`BL_V2_KEY`, 8종 이상)과는 완전히 다른 **저장키(`taleforge-bloodline`)를 쓰는 별개의 더 단순한 혈통 시스템**(드래곤/천족/악마/언데드 4종뿐)이 하나 더 있었다. `checkBloodlineAwaken()`이 호출부 0건이라 `activateBloodline()`이 절대 실행되지 않고, 그 결과 misc/221이 프롬프트에 주입하려는 `getBloodlineEffect()` 힌트도 항상 `null`(빈 문자열) — 16차의 혈통 버그와 정확히 같은 패턴(쓰는 쪽은 있는데 채우는 쪽이 없음)이 **또 다른 파일에서** 재발한 셈. 단, 이미 16차에서 고친 V2 시스템과 이름이 겹치고 프롬프트 문구도 유사해("[🩸 혈통]") 섣불리 둘 다 살리면 AI에게 서로 다른 혈통 설정이 동시에 주입되는 모순이 생길 위험이 있다 | **조치 보류**(발견만 기록) — 이 구(舊) 시스템이 V2 시스템 이전의 프로토타입인지, 의도적으로 별도 유지되는 병행 시스템인지 설계 의도가 불명확해 임의로 연결하지 않았다. 연결하려면 두 혈통 개념을 어떻게 공존시킬지(또는 완전히 이 구버전을 제거할지) 결정이 필요 |

### 대형 미해결 발견 — world/212(왕국 시스템), world/213(길드 시스템)

전체 스캐너가 검출한 후보 중 가장 규모가 큰 두 건. 둘 다 **완성된
기능이지만 플레이어가 도달할 방법이 전혀 없다**:

- **world/212(왕국 건설)**: `buildKingdom`/`upgradeKingdom`/`collectTax`/
  `expandTerritory`/`getKingdomStats` 전부 잘 구현돼 있고(재정·인구·영토·
  군사 관리, 나비효과 연동까지) `renderPanel` switch에 대응 case가 없고,
  메뉴 버튼도 없고, 이걸 트리거하는 AI GS 필드도 없다 — 즉 왕국을 세울
  방법 자체가 게임 안에 존재하지 않는다.
- **world/213(길드) — 18차에서 정정**: 처음엔 "쓰는 쪽 없는 죽은 힌트"로
  기록했지만, 이후 misc/326을 전체 읽어보니 실제로 쓰이는 길드 시스템은
  이미 misc/326에 완비돼 있었다(GUILD_DEFS 5종 — 모험가/현상금/상인/
  마법사/도적, 가입·탈퇴·의뢰판·숙련도·자동승급·GS 처리·BLS 주입·UI
  패널까지 전부 연결됨). world/213은 그 이전 버전의 잔재였을 뿐이라
  **왕국과 달리 "기능 자체가 없는 것"이 아니라 "죽은 파일이 있었을
  뿐"** — 18차에서 world/213 정리 + misc/221의 죽은 참조 제거로 완결.

왕국(world/212)만 여전히 미해결로 남는다 — "한 줄 연결"로 끝나는
버그가 아니라, 메뉴 버튼 배치·건국 조건·UI 패널 설계가 필요한 규모라
이번 라운드에서는 수정하지 않고 발견만 기록한다. 후속 라운드(또는
사용자 확인 후) 진행 권장.

**검증**: 변경 파일 5개(`job/087`, `misc/009`, `misc/053`, `combat/210`,
`ui/196`) 전부 `node --check` 통과, 재빌드 성공(8.9MB), 헤드리스로
(1) 퀘스트 패널의 새 "✓ 완료" 버튼 렌더 확인 (2) `calcDamage`는
살아있고 `startCombat`/`getAffinityDamageMultiplier`는 `window`에서
완전히 사라졌음을 확인 (3) `showStatRecommendation()` 수동 호출 시
예외 없이 정상 동작 확인 (4) 게시판 의뢰 수락→수동완료 흐름이 실제로
상태를 바꾸는 것 확인. 콘솔 에러 0건.

**미해결 대형 발견 3건**(수정 보류, 위 표 참고): `ai-prompt/077`의
고아 함수 `buildSystem`(2333줄, 완전히 죽음), `summon/215`의 별도
혈통 시스템(V2와 별개, 완전히 죽음), `world/212`+`world/213`(왕국/길드,
완성됐지만 진입점 없음). 전부 게임 동작에 지장은 없지만 규모가 크거나
설계 판단이 필요해 이번 라운드에서 임의로 건드리지 않았다.

**다음 작업**: misc/ 나머지(009,015,016,017,022,053 완료로 41개 남음) →
world(212/213 재검토 포함) → npc → job(나머지) → items → progression
(나머지) → race → religion → summon → combat(나머지) → ai-prompt → ui
(나머지) → lore → patches → utils.js/main.js. 계속 이어서 진행한다.

---

## 18차 — misc/ 계속 (066~330 구간, 실제 버그 1건 + 대형 정정 2건)

| 파일 | 판정 | 조치 |
|---|---|---|
| 066(선택 결과 추적/세계 상태) | `recordChoice`/`detectConsequences`/`getLongTermChoiceEcho`/`getWorldStateDesc` 전부 외부 호출 확인(`updateWorldStateFromChoice`는 같은 파일 내부 호출이라 정상) | 조치 없음(정상) |
| 068(전쟁 피해·플레이어 개입) | 거대 세력전쟁 시스템(조정/참전/전투행동/어부지리/목표체인) — `renderFactionPanel`이 메뉴로 진입 가능함을 확인, 파일 내부 self-contained onclick 체인도 전부 확인. 이미 이전 라운드에서 `rollWarCheck`의 카르마/종교 보너스 죽은 훅 수정 이력 있음 | 조치 없음(정상, 이미 건전) |
| 072(랜덤 이벤트) | `checkRandomEvents`가 quest/086 sendMsg 파이프라인에서 실제 호출 확인 | 조치 없음(정상) |
| 075(크래프팅) | `renderCraftPanel`이 renderPanel 'craft' 케이스로 진입, `rollMaterialDrop`/`rollEventBlueprint`가 전투 후 처리부에서 호출 확인 | 조치 없음(정상) |
| 163/164(챕터 구조/도전과제) | `advanceChapter`가 quest/086의 봉인파괴·루프완료·루프각성 감지에서 호출, `getChapterBLS`가 misc/164에서 소비 — 이전 라운드(#67)에서 이미 정리된 항목 재확인 | 조치 없음(정상) |
| **221(탐험 — discoverLocation)** | **실제 버그**: `discoverLocation(locData)`가 객체 하나를 받는 시그니처인데, 실제 두 호출부(quest/086, ai-prompt/222)는 전부 `(id, name)` 두 문자열을 넘기고 있었다 — 문자열이 `{...locData}`로 스프레드되며 인덱스별 문자로만 저장되고 `.id`/`.name` 프로퍼티는 전혀 안 생겼다. 그 결과 ai-prompt/077의 "자리 비운 장소 변화" 기능이 `v.id===curLoc.id`로 절대 매칭되지 않아 항상 비활성이었다(재방문해도 아무 변화 묘사 없음) | **수정**: 시그니처를 실제 호출 형태(id, name)에 맞춰 재작성, ai-prompt/222 호출부도 `(gs.discover_location, gs.discover_location)`로 보정 |
| 227(복선 트래커) | `manualAddPlotHook()`(수동 등록, `prompt()` 기반)이 완전히 구현돼 있었지만 패널 어디에도 호출 버튼이 없었음 | **수정**: 빈 상태 화면과 목록 헤더 양쪽에 "✍️ 직접 추가" 버튼 추가 |
| 228(엔딩 조건) | `renderEndingCondPanel`이 renderPanel 'endingcond' 케이스로 진입 확인, `triggerCustomEnding`/`_recordAndClose` 체인 정상 | 조치 없음(정상) |
| 230(방랑자 혼돈/질서·개연성) | 대형 파일. `updateHeader`/`callAI` 캡처 순서 버그 등 이미 다수의 인라인 수정 이력 확인(주석으로 문서화돼 있음), `_wandererAxisHook` 체인도 16차 수정과 일치 | 조치 없음(이미 건전) |
| 235(게임 현황 대시보드) | `renderDashboard`가 2곳(ui/242 스와이프 제스처, core/244 버튼)에서 호출 확인 | 조치 없음(정상) |
| 249(적 사기 시스템) | `updateEnemyMorale`이 misc/251 매 턴 전투 후처리에서 호출 확인 | 조치 없음(정상) |
| 254(음유시인) | `performSong`/`seekPatron`/`composeLegendarySong` 전부 economy/255의 `renderNetworkPanel` onclick에서 호출 확인 | 조치 없음(정상) |
| 275/277(PM 선택 파트/수동 편집) | `pmUpdateChoice`/`pmGetBLS`/`renderMemoryEnhanced` 전부 quest/086·ui/155에서 호출 확인 — 60번 항목(PM 파이프라인 수정)이 여전히 유효함을 재확인 | 조치 없음(정상) |
| 279(자동 플레이) | `renderAutoPlaySection`이 misc/298의 `renderAISettings`에서 호출됨을 재확인 — 과거 라운드 수정이 여전히 유효 | 조치 없음(정상) |
| 320(MutationObserver 통합) | 15차에서 이미 "정상" 확인된 파일 재확인(`continue` 올바르게 사용) | 조치 없음(정상) |
| **326(block16-preamble — 길드 시스템 v1)** | **연쇄 발견**: 이 파일 안에 GUILD_DEFS 5종(모험가/현상금/상인/마법사/도적) 기반의 완전한 길드 시스템이 통째로 들어있었다 — 가입/탈퇴/의뢰판/숙련도·자동승급/GS 훅(`processGSToAllDBs` 래핑)/BLS 훅(`buildLightSystem` 래핑)/UI 패널/메뉴 버튼 자동삽입까지 전부 실전 연결 확인. 이 발견으로 17차에서 "world/213 길드 시스템이 미완성 기능"이라 기록했던 것이 **오판**이었음이 드러남 — world/213은 이 v1 시스템 이전의 죽은 잔재였을 뿐 | 아래 "18차 정정" 참고 |

### 18차 정정 — world/213(길드), summon/215(구버전 혈통) 완전 제거

misc/326을 발견하고 나서 17차에서 "왕국·길드 둘 다 큰 미해결 기능"이라
적었던 것 중 **길드 쪽 판단을 정정**한다. 실제로는:

- **world/213(길드)**: `loadGuild`/`saveGuild`/`getGuildMission`은
  misc/326이 나오기 전의 구버전 잔재. 유일한 소비처(misc/221의 BLS
  힌트)를 제거하고 파일 내용을 설명 주석으로 교체.
- **summon/215(혈통 — 구버전)**: `activateBloodline`/`getBloodlineEffect`/
  `checkBloodlineAwaken`도 같은 이유로 죽어 있었을 뿐 아니라, 살아있는
  16차 수정 V2 시스템(summon/124 `autoAssignBloodline` — "AI 전용
  정보, 플레이어에게 직접 알리지 말 것")과 **정반대 설계**(매 턴
  "[🩸 혈통] 이름 — 설명"을 대놓고 노출)라 잘못 연결했다면 서로 모순되는
  AI 지시가 됐을 것. 저장 키도 misc/015가 읽는 키와 이 파일이 쓰는
  키가 서로 달라 자체적으로도 로드/세이브가 어긋나 있었다. 유일한
  소비처(misc/221)를 제거하고 파일 내용을 설명 주석으로 교체.

왕국(world/212)은 이런 "대체 시스템"이 코드베이스 어디에도 없음을
`KINGDOM_DEFS`/`buildKingdom`/`renderKingdom` 전체 검색으로 재확인 —
여전히 유일한 미해결 대형 발견으로 남는다.

**검증**: 변경 파일 3개(`misc/221`, `world/213`, `summon/215`) 전부
`node --check` 통과, 재빌드 성공(8.9MB). 헤드리스로 (1) 새 시그니처의
`discoverLocation('id','name')`이 `{id,name}` 형태로 정확히 저장되는지
확인 (2) `GUILD_DEFS`/`joinGuild`/`getGuildBLS`(misc/326, 살아있는 진짜
길드 시스템)가 여전히 정상 작동 확인 (3) `window.loadGuild`/
`window.activateBloodline`/`window.checkBloodlineAwaken`(방금 제거한
구버전들)이 실제로 사라졌는지 확인 (4) 새 혈통 V2(`window.loadBL`)는
여전히 살아있는지 확인. 콘솔 에러 0건.

**다음 작업**: misc/ 나머지(066,068,072,075,163,164,221,227,228,230,
235,249,254,275,277,279,292,293,298,302,303,307,308,314,317,318,320,
323~330 확인 완료로 8개 정도 남음 — 292/293/298/302/303/307/308/314/
317/318/323~325/327~330은 이전 라운드에서 이미 확인·수정된 항목들과
겹침, 정확한 잔여 목록은 다음 라운드 시작 시 재확인) → world(212 재검토
포함) → npc → job(나머지) → items → progression(나머지) → race →
religion → summon(나머지) → combat(나머지) → ai-prompt(나머지) →
ui(나머지) → lore → patches → utils.js/main.js.

---

## 18차 계속 — misc/293 실제 버그 1건 추가 발견

| 파일 | 판정 | 조치 |
|---|---|---|
| **293(block8-preamble)** | **실제 버그**: `buildLightSystem` 패치 안에서 `if(typeof currentMonsters!=='undefined') result += buildRivalEnemyContext(currentMonsters);` — `currentMonsters`는 코드베이스 전체에서 단 한 번도 선언된 적 없는 이름이다(실제 표준 패턴은 어디서나 `typeof loadMonsters==='function' ? loadMonsters() : []`). 그 결과 `typeof currentMonsters`가 항상 `'undefined'`로 평가돼 이 분기 자체가 절대 실행되지 않았다 — "이름 있는 라이벌 몬스터 재등장" 서사 기능(`buildRivalEnemyContext`, 처치 시도한 보스급 몬스터에게 고유 이름을 붙이고 재조우 시 도발 대사와 함께 긴장감을 연출하는 기능)이 이 게임이 나온 이래 단 한 번도 발동한 적이 없었다 | **수정**: 다른 43곳과 동일한 표준 패턴(`typeof loadMonsters==='function' ? loadMonsters()||[] : []`)으로 교정 |
| 302(꿈/환영 시스템) | 극도로 잘 문서화된 파일 — 꿈 폭주 버그(228회 중복 호출), `_dreamInFlight` 재진입 방지, 로컬모델 폴백 체인까지 전부 이전 라운드에서 이미 수정 완료. `checkDreamTrigger`가 misc/308의 MutationObserver에서 실제 호출됨을 재확인 | 조치 없음(이미 건전) |

**검증**: 변경 파일 1개(`misc/293`) `node --check` 통과, 재빌드 성공
(8.9MB). 헤드리스로 `window.buildLightSystem(...)`을 실제 캐릭터
데이터로 직접 호출해 예외 없이 16,346자 문자열을 정상 반환함을 확인
(라이벌 몬스터 훅 포함 전체 BLS 체인이 크래시 없이 끝까지 실행됨).
콘솔 에러 0건.

---

## 18차 계속 2 — 이 세션 전체에서 가장 심각한 활성 버그 발견 (job/313)

misc/303~317을 이어서 확인하던 중 `ai-prompt/319`(BLS 통합 래퍼)가
`window.getBloodlineBLS()`를 호출하는 것을 보고 추적하다가, **이
게임이 나온 이래 매 턴 AI 시스템 프롬프트에 실제로 쓰레기 텍스트를
주입해온 활성 버그**를 발견했다.

**원인**: `window.getBloodlineBLS`를 정의하는 파일이 두 개 있었다.
- `job/130`(`__tfDeferred_111`) — **진짜, 잘 만들어진 구현**. 16차에서
  고친 진짜 혈통 시스템(`summon/124` `loadBL()`, V2 저장소)을 읽어
  혈통명·힌트·각성 조건·GS 가이드까지 완비된 서사 힌트를 만든다.
  기존 `window.getBloodlineBLS`를 `_origGetBloodlineBLS`로 캡처해
  안전하게 감싸는(폴백 지원) 정상적인 패턴.
- `job/313`(`__tfDeferred_281`) — **구버전 잔재**. `misc/015`의
  `loadBloodline()`(종족별 플레이 횟수를 `{종족명:횟수}`로 저장하는
  완전히 다른 저장소 — `.type` 필드가 애초에 존재한 적이 없음)를 읽어
  `BLOODLINE_TYPES[bl.type]`를 찾으려 했는데, 이전 함수를 캡처하지도
  않고 `window.getBloodlineBLS`를 **통째로 재할당**했다.

main.js의 deferred 실행 배열에서 `__tfDeferred_111`(job/130, 정상)이
먼저 실행되지만, 바로 뒤이어 `__tfDeferred_281`(job/313, 구버전)이
실행되며 정상 구현을 완전히 덮어썼다. 그 결과 매 턴 실제 AI 프롬프트에
`[🩸 숨겨진 혈통: undefined] undefined — 각성 조건: undefined` 같은
문자 그대로의 "undefined" 쓰레기 텍스트가 주입되고 있었다.

이 세션에서 지금까지 찾은 다른 버그들은 전부 "기능이 조용히 한 번도
작동 안 함" 유형이었지만, 이건 **매 턴 실제로 AI에게 잘못된 정보를
적극적으로 전달하던** 유일한 사례라 더 심각하다 — 16차에서 혈통 배정·
각성 데이터 자체는 고쳤지만, 그 데이터를 AI에게 전달하는 마지막 단계가
이 버그 때문에 처음부터 완전히 무력화돼 있었던 것.

**수정**: `job/313`의 파일 내용을 경위 설명 주석 + 빈 `__tfDeferred_281`
스텁으로 교체(main.js가 이 이름으로 import하므로 export는 유지).

**검증**: `node --check` 통과, 재빌드 성공. 헤드리스로 신규 캐릭터
생성 후 `window.getBloodlineBLS()`를 직접 호출해 실제 혈통 데이터
("고대 왕족 혈통" 등)가 담긴 정상적인 힌트를 반환하는 것을 확인하고,
`"undefined"` 문자열이 더 이상 포함되지 않음을 확인. `buildLightSystem()`
전체 체인도 이 텍스트를 포함하지 않고 정상 실행됨을 재확인. 기존
회귀 스위트(길드/구버전 혈통 제거/discoverLocation)도 전부 그대로
통과, 콘솔 에러 0건.

### misc/ 디렉토리 감사 완료 (68/68)

318(목표 노트) — `getGoalsBLS`가 ai-prompt/319에서, `renderGoalsPanel`이
renderPanel 'goals' 케이스에서 이미 정상 연결돼 있음을 확인. 329(로컬
매칭엔진 기본값), 330(스킬 효과 로컬 계산 엔진 + B80 섹션 훅) 둘 다
`resolveSkillEffect`의 실제 호출부(job/207, misc/328) 확인 및 B80
훅(과거 라운드에서 이미 수정된 항목)의 정상 wrap 패턴 재확인 — 조치
없음(전부 정상).

**misc/ 68개 파일 전체 감사 완료.** 13~18차에 걸쳐 실제 버그 다수
발견·수정(게시판 자동완료 거짓 안내, discoverLocation 시그니처 불일치,
라이벌 몬스터 죽은 참조, **혈통 BLS 활성 오염 버그** 등), 대형 구버전
잔재 3건 정리(combat/210 전투 프로토타입, 구버전 길드 world/213,
구버전 혈통 summon/215+job/313), 왕국 시스템(world/212) 1건은 설계
판단이 필요해 미해결로 남김.

**다음 작업**: world/ 디렉토리(26개 파일, world/212 왕국 재검토 포함)
→ npc/ → job/(나머지) → items/ → progression/(나머지) → race/ →
religion/ → summon/(나머지) → combat/(나머지) → ai-prompt/(나머지) →
ui/(나머지) → lore/ → patches/(나머지) → utils.js/main.js.

---

## 19차 — world/ 디렉토리 착수, ai-prompt/077 죽은 buildSystem 속
대형 콘텐츠 11개 구조 발견 및 구제

world/032(날씨/계절 판정), 034(세계관별 이벤트 — 중세 전용화로 자연
사멸, 무해), 055(5대륙 왕국/세계 유력 인물), 056/057(NPC 프로필 재노출)
확인 중 world/055의 `getWorldFigureBLS`/`getSocialRankNpcBLS`가
ai-prompt/077에서만 호출되는 것을 발견했는데, 그 호출부가 **17차에서
이미 "완전히 죽었다"고 확인한 2333줄짜리 `buildSystem` 함수 내부**임을
재확인했다. 17차 때는 이 큰 함수를 "죽은 코드지만 규모가 커서 이번엔
안 건드림"으로 보류했었는데, 이번에 그 함수 안을 실제로 훑어보니
**B42/B43 버그 수정 이력까지 있는, 공들여 만든 진짜 기능 다수가
그 안에 갇혀 있었다.**

`buildSystem` 안의 `typeof getXxx==='function'` 패턴을 전수 조사(27개)
한 결과:
- 9개(`getCaravanSection` 등)는 이미 misc/330의 B80 훅(과거 라운드에서
  수정 완료)이 별도로 `buildLightSystem`에 정상 연결해 살아있음 — 문제 없음.
- `getActiveWars`/`getUndeadBorrowedTimeStatus`는 UI 패널 등 다른 실제
  용도로 이미 쓰이고 있어 문제 없음.
- `getAvailableHiddenQuests`/`getMatchingOrganicTrigger`는 인자가
  필요한 함수라 이번 일괄 수정 대상에서 제외(별도 조사 필요).
- **나머지 11개는 진짜로 완전히 고아** — `getContractSection`(계약),
  `getDynBestiarySection`(동적 몬스터도감), `getFactionHistorySection`
  (세력 전쟁사), `getItemDissonanceSection`(직업-아이템 부조화),
  `getNpcAgendaSection`(NPC 비밀 아젠다), `getNpcGrudgeSection`(종족
  공통 NPC 원한), `getRaceJobDissonanceSection`(종족-직업 부조화),
  `getSocialRankNpcBLS`(신분 전형 NPC, B42 수정 이력 있음),
  `getWorldFigureBLS`(종족/대륙/직업/세력 대표 NPC, B43 수정 이력
  있음), `getWorldLoreBLSContext`(세계 역사/세력지도/빌런 동기),
  `getCabalBLSContext`(결사 간부 현황) — 전부 인자 없이 문자열을
  반환하는 정상적인 BLS 섹션 함수인데 유일한 소비처가 죽은
  `buildSystem`뿐이었다.

**수정**: misc/330의 이미 살아있는 B80 훅(`hookB80MissingSectionsToBLS`)의
`SECTION_FNS` 목록에 위 11개를 그대로 추가 — 완전히 같은 원인·같은
해법이라 기존 훅에 합류시키는 것이 가장 안전하고 최소한의 변경이다.

**검증**: `node --check` 통과, 재빌드 성공. 헤드리스로 11개 함수가
전부 `window`에 정상 노출돼 있는지 확인하고, `buildLightSystem(...)`을
실제 캐릭터로 직접 호출해 17,312자 문자열을 예외 없이 반환함을 확인
(11개 신규 섹션이 매 턴 프롬프트 조립 과정에 실제로 포함되어도 크래시
없음). 기존 회귀 스위트(길드/혈통/discoverLocation) 전부 재확인,
콘솔 에러 0건.

**남은 문제**: 인자가 필요한 `getAvailableHiddenQuests(gameData)`/
`getMatchingOrganicTrigger(byBackgroundObj)` 2개는 여전히 고아 상태 —
어떤 인자를 넘겨야 하는지 별도 조사가 필요해 이번 라운드에서는
보류. ai-prompt/077의 `buildSystem` 함수 자체(이제 실질적으로 내용물이
텅 빈 껍데기가 됨)는 여전히 삭제하지 않고 남겨둠 — 다음 청소 라운드
후보.

**참고(정정 아님, 확인)**: `getAvailableHiddenQuests`는 이후 grep으로
재확인한 결과 이미 이전 라운드에서 `checkHiddenQuestsLocal()`으로
재배선되어 quest/086:2143에서 실제로 호출되고 있음을 확인 — 고아
목록에서 제외. `getMatchingOrganicTrigger(byBackgroundObj)`만 순수한
미해결 상태로 남음(기대 인자 `_activeMQ.organicTriggers.byBackground`의
출처 파악 필요, 죽은 ai-prompt/077 안에서만 발견됨).

### world/ 디렉토리 나머지 파일 감사 완료 (14/14 신규 확인분)

| 파일 | 판정 | 조치 |
|---|---|---|
| world/115 (창세신화/세계관 역사) | 정상 | `unlockHiddenMyth`가 core/122(루프 자각)·religion/119(종교 사이드퀘스트 codexUnlock)에서 실제 호출됨을 확인. 두 호출부 모두 살아있는 per-turn 훅(`_religionV2PerTurn`은 quest/086:2284에서 매턴 호출)에 연결. 조치 없음 |
| world/145 (세계 상태 DB) | 정상 | `loadWorldDB`/`updateWorldDB`/`loadGSFlags`/`saveGSFlags` 등 핵심 저장소 — ai-prompt/148, combat/150, ui/155, progression/020/156/168, items/151, quest/086 등 다수 파일에서 광범위하게 소비 중. 조치 없음 |
| world/165 (계승/마일스톤/루프기록 저장소) | 정상 | 6개 export 전부 progression/168·169·170, items/167, ai-prompt/172, ui/155, ai-prompt/077, progression/220에서 실사용. 조치 없음 |
| world/190 (세력 힘의 구도 UI) | 정상 | `renderFactionPowerPanel`이 ui/193 패널전환·quest/086 case문·misc/068 버튼 3곳에서 호출됨. 조치 없음 |
| world/199 (세력 전쟁 영구 반영) | 정상 | `getFactionHistorySection`은 19차 앞부분에서 misc/330 SECTION_FNS에 이미 편입되어 매턴 프롬프트에 포함됨. `tickFactionSimulation` 래핑 대상은 npc/067에 정의, quest/086·misc/068에서 매턴 호출되는 실함수. 조치 없음 |
| world/214 (날씨 자동 순환/시간 경과) | 정상(참고사항 1건) | `advanceTimeByAction`이 quest/086:2576에서 매턴 호출 → 날짜 변경 시 `updateWeather` 내부 호출. `hookAutoAdvanceTime`은 `orig.apply` 방식으로 buildLightSystem에 올바르게 체이닝됨(파괴적 덮어쓰기 아님). `getWeatherEffect()`만 코드베이스 전체에서 호출부가 0개 — 다만 다른 모든 소비처(world/032, job/087, world/073)는 `loadAtmosphere().weather`를 직접 읽는 동일 패턴을 인라인으로 쓰고 있어 이 함수 없이도 기능은 완전함. harmless 중복 접근자로 판단, 삭제 불필요(부작용 없음) |
| world/219 (세력 명성 V17) | 정상 | npc/067의 세력 평판 시스템과는 별개인 세 번째 독립 세력 시스템. `changeFactionRep`은 ai-prompt/222의 `gs.faction_rep` GS 필드 처리에서, `getFactionBLS`는 misc/221의 살아있는 buildLightSystem 훅(`hookV50ToBLS`, orig.apply 체이닝 확인)에서 실제 호출됨. 의도된 레이어드 설계로 확인, 조치 없음 |
| world/271 (PM 세계관 파트 업데이트) | 정상 | B83 수정 이력 보유(loadFactionGauge 필드명 불일치 수정 완료). `pmUpdateWorld`는 npc/272의 NPC 대화 학습 디스패처에서 4곳 호출. 조치 없음 |
| world/273 (PM 영지 파트 업데이트) | 정상 | `pmUpdateDemesne`가 quest/086:2849에서 매턴 호출. 조치 없음 |
| world/289 (세계 상태 변화 가시화) | 정상 | `updateWorldImpact`는 quest/086:1347, `buildWorldImpactContext`는 ui/291의 이미 수정 완료된(task #65) sendMsg/buildLightSystem 통합 훅에서 호출. 조치 없음 |
| world/304 (세계 신화 백과사전) | 정상 | AI 선택적 사용 원칙 준수(`tryCloudThenLocalModelThenBank`로 로컬 폴백 보장). `extractCodexTerms`는 misc/308의 MutationObserver 기반 sendMsg 후처리 훅(15차 수정 이력 보유)에서, `renderCodexPanel`은 quest/086 case문에서 호출됨. 조치 없음 |
| world/306 (세계 시간 달력 확장) | 정상(참고사항 1건) | `getCalendarEffect`는 misc/303의 살아있는 buildLightSystem 훅(`_origBLS2.apply` 체이닝 확인)에서 매턴 호출, `renderWorldCalendarPanel`은 quest/086 case문에서 호출. **참고**: data/018의 `MOON_PHASES`(8단계 정교한 달 위상 테이블, 각 단계별 effect+specialEvent 텍스트 보유)를 소비할 예정이던 `getMoonPhase()` 함수가 **코드베이스 어디에도 정의돼 있지 않음** — 유일한 호출 시도가 ai-prompt/077의 이미 죽은 `buildSystem`(17차에서 완전 사멸 확인) 내부라 이중으로 죽은 코드(죽은 함수가 존재하지도 않는 함수를 호출). world/306 자체의 `getCalendarEffect`가 이미 더 단순한 3단계 달 위상 서사를 실제로 매턴 주입 중이라 서사적 역할은 이미 대체 수단으로 충족되고 있음 — MOON_PHASES 데이터는 미사용이지만 무해하며, 별도 구제 없이 기록만 남김 |
| world/311 (탐험 메모 지도) | 정상 | `autoMapPin`이 misc/320의 살아있는 MutationObserver 훅(misc/308과 쌍을 이루는, 이미 continue/return 버그가 없다고 확인된 파일)에서 실제 호출됨. `renderMapNotesPanel`은 quest/086 case문 연결. UI의 "AI가 자동으로 핀을 추가합니다" 문구는 사실과 일치함(허위 주장 아님). 조치 없음 |
| world/315 (대륙 정치 지도) | 정상 | 두 건의 인라인 버그 수정 이력 보유(AI 생성 장소 좌표 누락, northeast/southeast/northwest 구역 누락). `renderPoliticalMapPanel`은 quest/086 case문 + 매턴 갱신(quest/086:2884) + quest/229의 AI 장소 생성 후 갱신(2곳)에서 호출. `getObserverModeVision`도 실함수. 조치 없음 |

**world/ 디렉토리 감사 완료 (전체 파일 확인 완료)**: 이번 라운드에서
확인한 14개 파일 전부 정상 배선 확인, 코드 수정 없음(이전에 이미
발견·수정된 world/212 킹덤 시스템 미해결 사안과 world/213 죽은
길드 v1 레거시만 기존 기록대로 유지). world/ 디렉토리 감사를 이것으로
완전히 종료한다.

---

## 🗂️ 참고 — 핵심 파일 위치

## 19차(계속) — npc/ 디렉토리 전체 감사 완료, 활성 크래시 버그 1건 발견·수정

world/ 디렉토리 완료 후 이어서 npc/ 디렉토리(14개 파일) 전체를 확인.
이번 감사 최초의 "AI 프롬프트 오염"이 아닌 **런타임 크래시** 유형
버그를 발견했다.

### npc/294 — `getChannelNews()`의 `factions` 미선언 변수로 인한
런타임 ReferenceError (활성 버그)

`getRumorChannels()`가 캐릭터의 rank/role/칭호에 따라 열어주는 정보
채널 중 `military`(기사단 보고)/`noble`(귀족 첩보)/`royal`(왕실 기밀)
세 분기가 어디에도 선언된 적 없는 전역 변수 `factions`를 참조하고
있었다 — 함수 안에는 `factionsMap`/`names`/`wars`/`conflicts`/
`alliances`만 존재하고 `factions`는 정의된 적이 없다. 플레이어가
기사·귀족·왕족 등 해당 칭호/역할을 가진 상태에서 세력 패널(`misc/068`
`renderFactionPanel`)의 "소문" 탭을 열면 `renderNpcRumorPanel()`이
전체 채널을 순회하다 이 지점에서 `ReferenceError: factions is not
defined`를 던져 **패널 렌더링 전체가 크래시**하는 활성 버그였다 —
이 세션에서 지금까지 발견한 대부분의 버그가 "조용히 아무 일도 안
일어나는" 유형이었던 것과 달리, misc/293의 `currentMonsters`처럼
바로 죽는 게 아니라(그건 typeof 가드가 있었음) **가드 없이 직접
호출돼 즉시 예외를 던지는** 더 심각한 유형.

**수정**: `factionsMap`(각 세력의 `influence` 필드)과 이미 계산된
`wars` 배열, `getSimTension(sim,a,b)`로 세력별 요약 배열
`{name, power, atWar, tension}`을 실제로 만들어 `factions`에 대입.
`military`는 `f.tension`, `noble`/`royal`은 `f.power`/`f.atWar`를
쓰므로 세 필드 모두 채웠다.

**검증**: `node --check` 통과, 재빌드 성공. 헤드리스로 캐릭터의
rank/role을 기사+백작+대신관+대마법사+왕+병사+상인+노예로 강제
설정해 7개 채널(street/underground/merchant/military/noble/royal/
clergy)을 전부 열어본 결과, 수정 전이라면 크래시했을 military/
noble/royal 세 채널 모두 정상적으로 텍스트를 반환하고
`renderNpcRumorPanel()`도 예외 없이 6273자 HTML을 반환함을 확인.
콘솔 에러 0건.

### npc/ 디렉토리 나머지 파일 감사 결과

| 파일 | 판정 | 조치 |
|---|---|---|
| npc/031 (NPC 성장/동료 버프) | 정상 | `growNpc`/`getNpcGrowthData`/`getCompanionBuffs`는 window 미할당이지만 소비처(items/065, misc/054, ai-prompt/077) 전부 ES import로 정상 참조. `applyPartyBonus`는 core/084 엔진 초기화 + ai-prompt/148 GS 처리에서 실제 호출. 조치 없음 |
| npc/140 (NPC DB 세분화) | 정상 | `upsertNpc`/`getNpc`/`getRecentNpcs` 모두 ai-prompt/152의 `buildContextBLS`(quest/086에서 매턴 호출)에서 실사용. 조치 없음 |
| npc/143 (관계 DB) | 정상(참고 1건) | `upsertRelation`/`getNpcRelations` 실사용 확인. `getRelation(npcA,npcB)`만 호출부 0개 — 원시 데이터 반환 접근자라 별도 서사 콘텐츠 없음, 무해한 죽은 코드로 판단·기록만 |
| npc/146 (대화 DB) | 정상 | `addNpcDialog`(combat/150)·`getRecentNpcDialogs`(ai-prompt/152) 실사용. 조치 없음 |
| npc/158 (평판/소문) | 기존 완료 | task #64에서 이미 수정 완료(레거시 드라마/소문/예언 시스템) |
| npc/211 (로맨스 시스템) | 정상(참고 1건) | `addRomancePoint`는 GS 필드 `gs.romance`로, `loadRomance`는 quest/086·misc/221에서 실사용. `getRomanceStatus`만 호출부 0개 — 모든 실제 소비처가 `loadRomance()`를 직접 읽어 자체적으로 stage를 조회하는 동일 패턴을 인라인으로 쓰고 있어 기능적으로 완전히 대체됨. 무해, 기록만 |
| npc/226 (관계도 시각화) | 정상 | `switchNpcTab`이 template.html 정적 마크업의 실제 onclick 버튼(npc-tab-list/npc-tab-graph)에 직접 연결됨 확인. 조치 없음 |
| npc/264 (NPC 데이터 구조) | 정상 | `_pmNpcDefault()`가 npc/269·272(둘 다 실사용 확인된 파일)에서 소비됨. 조치 없음 |
| npc/269 (NPC 파트 업데이트) | 정상 | `pmDetectNpcFromText`는 quest/086 매턴 호출, `pmUpdateNpc`는 ai-prompt/148 GS 처리에서 호출. 조치 없음 |
| npc/272 | 기존 확인 | 앞서 world/271 감사 중 이미 실사용 확인(NPC 대화 학습 디스패처) |
| npc/286 (평판/명성 통합) | 정상 | `addUnifiedFame`/`getUnifiedFameLevel` 다수 파일(world/289, ui/291, misc/293, misc/327, items/288)에서 광범위 실사용. 조치 없음 |
| npc/294 (소문/계급별 정보) | **버그 발견·수정** | 위 상세 설명 참고 |
| npc/305 (NPC 비밀 아젠다) | 정상 | `getNpcAgendaSection`은 19차 앞부분에서 이미 misc/330에 편입, `generateNpcAgenda`/`updateNpcAgendaFromRel`은 misc/308 매턴 훅, `renderNpcAgendaPanel`은 quest/086 case문에서 호출. 조치 없음 |

**npc/ 디렉토리 감사 완료 (14/14)**: 이번 라운드에서 확인한 14개
파일 중 13개 정상, 1개(npc/294) 활성 크래시 버그 발견·수정 완료.

## 19차(계속) — job/ 디렉토리 착수, 히든 직업 자동 감지 "5개 필드
영구 미채움" 버그 발견·수정

npc/ 완료 후 job/ 디렉토리로 이동. job/002(스킬 저장소)·job/008(클리어
보상/레벨/경험치 저장소)·job/029(히든 직업 정의+판정 로직) 확인 중,
job/203의 `_buildHiddenJobGameData()`(히든 직업 자동 감지용 게임
상태 스냅샷 생성기, 10턴마다 quest/086에서 호출)가 job/029의
`checkHiddenJobUnlock()`이 실제로 참조하는 필드 중 5개
(`npcDeathCount`, `bardFame`, `templeLevel`, `undyingMaxed`,
`reincarnationRank`)를 **단 한 번도 채워준 적이 없어서**, 이 필드에
의존하는 히든 직업 4종(영혼 수확자 soul_reaper, 신화의 영웅
myth_hero, 공허 보행자 void_walker, 환생 지배자 reincarnation_master)
이 자동 감지 파이프라인으로는 영원히 해금될 수 없는 구조였음을
발견했다 — `unlockHiddenJob()`에는 다른 우회 호출부(GS 필드 등)도
전혀 없어 이 4개는 사실상 완전히 도달 불가능한 콘텐츠였다.

각 필드는 전부 게임 어딘가에 이미 실제로 추적되고 있는 값이었다:
- `npcDeathCount` → `ai-prompt/148`가 `updateStats('npcDeathWitnessed',1)`로
  이미 누적 중이던 값. job/203이 이미 같은 저장소(`_loadPStats()`)를
  `st`로 읽고 있었는데 이 필드만 누락.
- `bardFame` → `misc/253`의 `loadNetwork()`(음유시인/상인 활동 네트워크
  저장소)의 `net.fame` — economy/255 UI에 실제 표시되는 그 명성 수치.
- `templeLevel` → `progression/019`의 `loadTemple().level` — `growFaith()`가
  `ai-prompt/148`의 GS 필드 처리에서 매턴 실제로 갱신 중인 신전 레벨
  (주의: race/260의 영지 건물 "신전"과는 다른, 완전히 별개의 신앙
  시스템).
- `undyingMaxed` → `progression/018`의 `loadUndyingGauge()`의
  `gauge >= maxGauge`.
- `reincarnationRank` → `progression/019`의 `loadRankData().rank`.

**수정**: 새 추적 시스템을 만들지 않고 위 5개를 각각 담당하는
이미 살아있는 저장소에서 그대로 끌어와 `_buildHiddenJobGameData()`의
반환 객체에 추가했다.

**검증**: `node --check` 통과, 재빌드 성공. 헤드리스로
`_buildHiddenJobGameData()`를 직접 호출해 5개 필드가 전부 정상적으로
(신규 캐릭터 기준 0/false) 채워지며 예외가 없음을 확인, 이어서
`checkAllHiddenJobsAuto()`도 정상 실행됨을 확인. 콘솔 에러 0건.

### job/ 디렉토리 나머지 파일 감사 결과 (17/17 완료)

| 파일 | 판정 | 조치 |
|---|---|---|
| job/002 (스킬 저장소) | 정상 | loadSkills/saveSkills/loadSkillSP/saveSkillSP 전부 10개+ 파일에서 실사용. 조치 없음 |
| job/008 (클리어 보상/레벨/경험치) | 정상 | 이미 task #59에서 수정된 진엔딩 보상 지급 로직에서 실사용. 조치 없음 |
| job/029 (히든 직업 정의) | 정상(위 버그와 연동) | `checkAllHiddenJobUnlocks`/`getHiddenJobProgress`/`getUnlockedHiddenJobs`/`getAvailableRecipes` 전부 실사용 확인 |
| job/035 (직업 시너지/속성 상성) | 정상(참고 2건) | `calcAffinityMod`/`getCharElement`/`renderAffinityPanel` 실사용. `checkJobSynergy`와 `getAffinityBattleInfo`는 호출부 0개지만, 둘 다 그 기능이 ai-prompt/222(시너지 감지+저장 인라인 구현)와 quest/086·combat/257(calcAffinityMod 직접 호출)에 이미 동등하게 구현돼 있어 무해한 중복 데드코드로 판단 |
| job/071 (스킬 실제 발동) | 정상 | activateSkill/showRaceSkillPopup은 renderSkillQuickSlot이 생성하는 onclick 문자열(템플릿 리터럴로 이름이 조립돼 평문 grep에 안 걸림) 통해 실제 연결됨 확인. 3건의 기존 버그 수정 이력 보유(쿨다운 누락, 이중 회복, 퀵슬롯 쿨다운 미반영) |
| job/087 | 기존 완료 | 이번 세션 앞부분에서 버튼 추가 등 이미 다수 확인·수정됨 |
| job/096 (직업별 교화 가능) | 정상 | getJobEvangelActions가 ui/097·religion/099에서 실사용. 조치 없음 |
| job/125 (자동 각성 감지) | 정상 | tickBloodlineAwaken/tickBloodlineCooldown이 core/134의 매턴 자동 체크 등록부에서 실제 호출. 13차 수정 이력(animBloodlineAwaken 훅 대상 함수명 오류) 보유 |
| job/130 | 기존 확인 | 이번 세션 앞부분(18차)에서 진짜 살아있는 혈통 BLS 구현으로 이미 확인됨 |
| job/195 (스킬트리 시각화) | 정상 | renderSkillTreePanel이 template.html의 실제 메뉴 버튼 2곳 + progression/205 패널전환에서 호출됨. 조치 없음 |
| job/207 (스킬 시스템) | 정상(참고 1건) | useSkill/expireSkillBuffs/checkSkillEvolution2 전부 실사용, 3건의 기존 버그 수정 이력 보유(쿨다운 누락, hpRestore 미반영, 속성 상성 미반영, 소환 스킬 실제 미소환). `getActiveSkills`/`getSkillEffect`만 호출부 0개 — loadSkills() 직접 사용 패턴으로 완전 대체돼 무해 |
| job/208 (직업 시스템/부조화) | 정상 | getItemDissonanceSection/getRaceJobDissonanceSection은 19차 앞부분에서 misc/330에 이미 편입, changeJob/checkJobUnlock은 ai-prompt/222에서 실사용, recalcItemDissonance는 job/087의 장비 착탈 훅(onEquipmentAlignmentChanged)에서 실제로 매번 재계산됨. recalcRaceJobDissonance의 매턴 점진 수렴 로직만 죽은 buildSystem에서만 호출되지만, init/resolve가 이미 최종값을 직접 설정하므로 순수 연출(부드러운 수렴 애니메이션) 손실일 뿐 실제 값이나 서사 정확성에는 영향 없음 — 기록만 남김 |
| job/233 (스킬 해금 연출) | 정상 | `__tfDeferred_208`이 main.js 배열에 등록돼 실행되며, job/087의 실제 unlockSkill을 orig.call 방식으로 올바르게 체이닝. 조치 없음 |
| job/313 | 기존 완료 | 18차에서 이미 활성 버그로 확인·제거됨(이 세션 최악의 버그) |

**job/ 디렉토리 감사 완료 (17/17)**: 1건의 실제 버그(히든 직업 자동
감지 5개 필드 미채움) 발견·수정. 나머지는 전부 정상 또는 이미 이전
라운드에서 처리 완료.

## 19차(계속) — items/ 디렉토리 전체 감사 완료 (22/22)

job/ 완료 후 items/ 디렉토리로 이동. 이번 라운드에서는 코드베이스
전체를 대상으로 한 "정의부 외에는 호출된 적 없는 export" 자동 스캐너
(`scan_dead_exports2.js`)를 다시 돌려(172건 후보 도출) 남은 대형
디렉토리들의 감사 속도를 높이는 보조 도구로 병행 사용하기 시작했다 —
전체 파일을 처음부터 끝까지 읽는 대신, 로직 함수의 실제 호출부만
정밀 검증하는 방식.

| 파일 | 판정 | 조치 |
|---|---|---|
| items/003 (골드/인벤토리 키 상수) | 정상 | 전역 다수 사용. 조치 없음 |
| items/004 (장비 슬롯 12종 정의) | 정상 | 순수 데이터, 전역 사용. 조치 없음 |
| items/006 (세트 아이템) | 정상 | calcSetBonus/applySetBonus/renderSetBonusPanel 등 실사용. "0회 호출"로 보였던 loadSetBonuses/renderAllSetsPreview/getItemsBySlot은 전부 같은 파일 내 다른 함수에서 내부적으로 호출되는 헬퍼로 확인 |
| items/007 (동적 아이템 생성/캐시) | 정상(참고 1건) | 50여 개 export 대부분 실사용 확인. `pickExistingLocationMonster`만 호출부 0개 — quest/086의 실제 인카운터 재사용 로직(6894줄)이 `getLocationMonsterPool`을 직접 인라인으로 써서 동일 기능을 이미 구현하고 있어 무해한 중복 |
| items/058 (크리스탈리아 프로필) | 정상 | 단순 데이터 재노출. 조치 없음 |
| items/065, 151, 167, 178, 189, 284, 288 | 기존 확인 | 이번 세션 여러 라운드에 걸쳐 이미 실사용 확인·수정 완료 |
| items/074 (성장 연출) | 정상 | dramaticEvolution(progression/020)·dramaticJobChange(job/042)·dramaticLevelUp(misc/009) 전부 실사용, __tfDeferred_61도 main.js에 등록됨 |
| items/128 (환생 시 혈통 강화) | 정상 | onBloodlineNewCycle이 summon/132의 살아있는 goReinc 훅(orig.apply 체이닝 확인)에서 호출됨 |
| items/159 (세트 효과 BLS) | 정상 | getSetItemBLS가 core/162의 살아있는 buildLightSystem 훅에서 호출됨 |
| items/175 (보석 정의) | 정상 | gemEffectText/initItemSockets 다수 파일에서 실사용 |
| items/176 (룬 새기기) | 정상 | engraveRune/extractRune이 ui/181의 실제 onclick에 연결됨 |
| items/177 (보석 박기) | 정상 | socketGem/removeGem/upgradeGem 전부 ui/181 onclick 연결 확인 |
| items/179 (룬·보석 보너스 계산) | 정상 | 기존 B70/BUG9 수정 이력 보유, items/176·177·178에서 실사용 |
| items/180 (룬 조합) | 정상 | combineRunes가 ui/181 onclick에 연결됨 |
| items/218 (인벤토리+소울 시스템) | 정상(대형, 참고 2건) | addItem/removeItem/getItemBLS 및 소울 시스템(20+ 함수) 대부분 실사용 확인. `tryGrantSoulFromNpc`/`scanAllNpcsForSoulGrant`/`activateSoulWeapon`/`levelUpActiveSoul`/`levelUpSoulWeapon`/`tickSoulWeaponBossKill`은 파일 내 주석에 "v8/v10에서 제거됨"이라 명시된 의도적 빈 스텁(호환용, 버그 아님). `addItem()` 자체는 코드베이스 전역에서 직접 호출하는 곳이 0개 — 대신 다른 모든 파일이 `S.inventory.push(...)`를 직접 쓰는 패턴이라, 스택형 합치기(stackable) 기능이 있는 이 헬퍼가 실제로 활용되지 못하고 있음. 다만 이를 고치려면 인벤토리에 아이템을 추가하는 수십 개 호출부를 전부 리팩터링해야 해 이번 감사의 "최소 수정" 범위를 크게 벗어남 — 구조적 비일관성으로 기록만 남기고 별도 조치 없음 |
| items/282 (인벤토리 서사 연동) | 정상 | buildItemNarrativeContext가 ui/291의 기존 수정 완료된 훅에서 호출됨 |
| items/287 (선택 나비효과) | 정상 | recordButterflyEvent(quest/086 매턴)·buildButterflyContext(ui/291) 둘 다 실사용 |

**items/ 디렉토리 감사 완료 (22/22)**: 이번 라운드 신규 버그 없음 —
전부 정상 배선 확인 또는 이미 처리된 사안. 유일한 기록 사항은
items/218의 `addItem()` 구조적 비일관성(무해, 수정 범위 밖).

## 19차(계속) — progression/ 디렉토리 착수, 회차 루프 시스템 전체가
실제 환생 경로와 완전히 분리돼 있던 버그 + ELF_MEMORY_KEY
ReferenceError 발견·수정 (이 세션 두 번째로 심각한 버그)

### progression/220 — `startNewCycle()`/`endCycle2()`가 진짜 환생
처리 함수(`doReincarnate`, quest/086)와 완전히 별개인 죽은 경로였던
버그

`progression/220`은 "회차/루프 시스템"이라는 이름 그대로, 회차가
바뀔 때 (1) 이번 생의 요약/관계를 `LOOP_REC_KEY`에 기록하고,
(2) 유산을 이전하고, (3) 회차 보상을 주고, (4) 전생 유물/봉인된 유물
파편/시간 역행 토큰을 지급하는 `startNewCycle()`을 완성해 두었다.
하지만 실제로 플레이어가 "새 삶 시작" 버튼(template.html의
`reinc-start-btn`)을 누르면 호출되는 함수는 quest/086의
`doReincarnate()`이고, 이 둘은 서로를 전혀 참조하지 않는 완전히
분리된 두 개의 "환생 처리" 구현이었다 — `startNewCycle`/`endCycle2`/
`saveLoopRecord`/`transferLoopLegacy`/`getLoopRewards` 전부 코드베이스
어디서도(서로도, doReincarnate에서도) 호출된 적이 없음을 grep으로
확인했다.

결과적으로:
- `getLoopBLS()`(misc/221의 살아있는 buildLightSystem 훅에서 실제로
  호출되던 "루프 기록" 섹션)는 `loadLoopRecords()`가 항상 빈 배열이라
  게임이 나온 이래 단 한 번도 실제 텍스트를 반환한 적이 없었다.
- 더 심각하게는, **이 세션 이전 라운드에서 이미 "고쳤다"고 기록한**
  전생 유물(RELIC_DEFS/checkRelicCondition) · 봉인된 유물 파편
  (ARTIFACT_COMPLETE) · 시간 역행 토큰(earnTimeToken) 자동 지급
  로직 3건이, 사실은 도달 불가능한 `startNewCycle()` 안에 고쳐져
  있었을 뿐이라 셋 다 실제로는 여전히 한 번도 실행된 적이 없었다 —
  "죽은 함수 속을 고친" 상태였음을 이번에 발견했다.

**수정**: `startNewCycle()`의 카운터 증가 이후 로직(유산 이전/보상/
유물 3종 지급)을 `applyLoopCycleExtras(newCyc)`로 분리하고,
quest/086의 실제 `doReincarnate()`를 감싸는 새 훅
(`hookLoopRecordIntoReincarnate`, 기존 items/218의
`hookReincarnationSoul` 등과 동일한 orig.apply 체이닝 패턴)을
progression/220에 추가했다 — 리셋 전 상태가 필요한 루프 기록 저장은
`orig.apply()` 호출 **전**에, 새 회차 스탯에 적용돼야 하는 보상/유물
지급은 호출 **후**에 실행한다. `startNewCycle()`/`endCycle2()` 자체는
여전히 호출부가 없지만(더 이상 문제 되지 않음 — 실제 로직이
doReincarnate 경로로 이전됨), API 호환을 위해 그대로 남겨둔다.
`endCycle2(endingId)`는 엔딩 타입 정보가 필요한데 실제 "환생하기"
버튼(`goReinc()`)이 인자 없이 호출되는 구조라 이번 라운드에서는
연결하지 않고 기록만 남긴다(추가 조사 필요, Kingdom 시스템과 동일한
"최선을 다했으나 미해결" 카테고리).

**부가 발견 — ui/025의 `ELF_MEMORY_KEY` ReferenceError**: 위 수정을
헤드리스로 검증하던 중 `doReincarnate()`가 콘솔에
`ReferenceError: ELF_MEMORY_KEY is not defined`를 던지는 것을 발견했다.
`ui/025`의 `loadElfMemory`/`saveElfMemory`/`clearElfMemory`(엘프
종족의 "천년 기억" 진행 시스템 저장소 전체)가 참조하는
`ELF_MEMORY_KEY` 상수가 그 파일 어디에도 선언된 적이 없었다 — 화살표
함수 본문 안의 참조라 `node --check`나 빌드 시점에는 걸리지 않고,
실제로 함수가 **호출되는 순간**에만 터지는 유형이라 지금까지 발견되지
않았던 것으로 보인다. `loadElfMemory`는 ai-prompt/077·quest/086·
world/055에서, `clearElfMemory`는 quest/086의 doReincarnate 정리
로직에서 실사용 중이라 — 엘프 종족을 플레이하며 이 함수들이 호출될
때마다(레벨업, 환생 등) 매번 예외가 발생해 엘프 기억 시스템 전체가
사실상 작동하지 않던 활성 버그였다. `ELF_MEMORY_KEY = 'tf-elf-memory-v2'`
상수를 추가해 수정했다(기존 구버전 키 `"tf-elf-memory"`와 겹치지
않는 새 키 — `loadElfMemory` 자체에 이미 구버전 마이그레이션 로직이
있음).

**검증**: 두 파일 모두 `node --check` 통과, 재빌드 성공. 헤드리스로
`window.doReincarnate()`를 직접 실행해 (1) 수정 전에는
`ELF_MEMORY_KEY` ReferenceError가 콘솔에 찍히던 것이 수정 후 콘솔
에러 0건으로 사라짐을 확인, (2) `loadLoopRecords().length`가 실행
전 0 → 실행 후 1로 실제로 기록되고, `getLoopBLS()`가 빈 문자열에서
`"[🔄 전생 요약] 1회차 / 이전: 알 수 없음 엔딩 (0턴)"`로 실제 텍스트를
반환하게 됨을 확인. 기존 18차 회귀 스위트 + 소문 패널 회귀 테스트
모두 재확인, 콘솔 에러 0건.

### progression/194 — 명예의 전당이 모든 엔딩을 "❓ unknown"으로만
기록하던 버그

`triggerStoryEnding()`(quest/086, 8장 완료 시 호출)은 실제로 인자
없이 호출되며 내부적으로 `checkEndingConditions()`의 1순위 결과로
엔딩을 자체 판정한다. 그런데 `progression/194`의 명예의 전당 훅은
`window.triggerStoryEnding = function(endingId){ recordHallOfFame(endingId); ... }`
형태로 endingId가 "인자로 넘어올 것"을 가정하고 있어, 실제로는 항상
`recordHallOfFame(undefined)`만 호출되고 있었다 — 명예의 전당에 기록은
남지만 어떤 엔딩을 달성했는지는 항상 "❓ unknown"으로만 표시되던
데이터 품질 버그. `checkEndingConditions()`가 읽기 전용(부작용 없음)
임을 확인한 뒤, 훅 안에서 이를 동일하게 한 번 더 호출해 진짜 엔딩
id(`top.id`)를 얻도록 수정했다. 헤드리스로 가짜 엔딩을 주입해
`hof[0].ending`이 실제로 그 엔딩 id를 담게 됨을 확인.

### progression/236 — `handleDeath`라는 이름의 유령 훅 지점 때문에
"전생의 기억" 데자뷔 서사 기능이 한 번도 발동한 적이 없던 버그

`saveLastLifeMemory()`(죽기 직전 마지막 장면/행동을 저장해, 다음
회차 초반 3턴 이내에 "전생의 기억"으로 되살리는 기능 —
`getLastLifeMemoryContext()`를 통해 `callAI` 훅에는 이미 정상
연결되어 있었음)는 `handleDeath`라는 이름의 함수가 정의되면 그것을
감싸 호출하도록 만들어져 있었다. 그런데 `handleDeath`는 코드베이스
전체 어디에도(quest/086의 사망 처리부에서도 마찬가지로 `typeof`
방어 호출만 있을 뿐) 실제로 정의된 적이 없는 이름이었다 — 즉 이
기능은 존재하지도 않는 함수를 감싸려던 "유령 훅"이라 게임이 나온
이래 단 한 번도 실행된 적이 없었다. 실제 사망 처리 지점
(quest/086의 `S.stats.hp = 0` 분기)에서 `saveLastLifeMemory()`를
직접 호출하도록 수정하고, progression/236의 죽은 훅 블록은 설명
주석으로 대체했다. 헤드리스로 `saveLastLifeMemory()` 자체가 정상
동작함을 확인(수정 전 `loadLastLifeMemory()`는 항상 null).

**참고**: progression/240(칭호 패널에 등급 색상 표시 훅)도 같은
이유(quest/086이 `renderTitles`를 ES `import`로 직접 가져와 호출하므로
`window.renderTitles` 재할당이 적용되지 않음)로 훅이 절대 실행되지
않지만, 실제 `renderTitles()` 함수 안에 등급 색상·라벨이 이미
네이티브로 구현돼 있어(더 완전한 버전으로) 기능 손실은 없다 — 무해한
중복으로 기록만 남김.

**progression/ 디렉토리 감사 완료 (21/21)**: 이번 라운드 3건의 실제
버그(회차 루프 시스템 미연결, ELF_MEMORY_KEY, 명예의 전당 엔딩ID
누락) + 1건의 유령 훅(handleDeath) 발견·수정. 재빌드 후 기존 전체
회귀 스위트(18차, 소문 패널, 루프사이클, 명예의 전당, 전생의 기억)
전부 재통과, 콘솔 에러 0건.

## 19차(계속) — race/ 디렉토리 감사, ai-prompt/077의 죽은 buildSystem
안에 갇혀있던 7종족 전용 서사 힌트 시스템 전체를 구출

| 파일 | 판정 | 조치 |
|---|---|---|
| race/013 | 정상 | 이전 라운드에 이미 확인(loadRace/saveRace 실사용). 조치 없음 |
| race/024 (그림자 협약) | 정상 | `initShadowPact`/`enforceOrCursePact`/`releasePact`는 스캐너가 놓친 onclick — `renderShadowPactPanel`이 생성하는 HTML 안에서 직접 호출됨. `renderShadowPactPanel`은 ui/025 탭 전환 로직에서 호출. 조치 없음 |
| race/027 (악마족 계약 장부) | 정상 | `gainDemonContractRank`는 race/028의 `detectDemonContractFromText`(매턴 실행)가 내부적으로 사용. `renderDemonContractPanel`은 template.html 메뉴 버튼 onclick에서 호출. 조치 없음 |
| race/028 (악마족 진명) | 정상(일부 무해한 사장 코드) | `initDemonAllSystems()`는 무해한 중복 집계 함수(하위 3개 호출이 quest/086에서 이미 개별적으로 실행됨). `CYBER_IMPLANTS`/`SWORD_TECHNIQUES`/`recordCyberImprint`/`recordSwordTechnique`/`triggerSwordGhost`는 과거(#50) 비중세 시나리오 제거 작업의 잔재로 quest/086에서 import만 되고 전혀 참조되지 않는 사이버펑크/무협 종족 콘텐츠 — world/034와 동일 패턴의 무해한 죽은 코드. 조치 없음 |
| race/038 (종족 전용 스토리 루트) | 정상 | `unlockRaceRoute`/`getRaceContent` 모두 quest/086에서 실사용 확인. 조치 없음 |
| race/198 (종족 공통 NPC 원한) | 정상(사소한 미해결 1건) | `addNpcGrudge`는 `hookNpcGrudgeFromGS`(processGSToAllDBs 정상 래핑)로 매턴 연결. `getNpcGrudgeSection`은 19차 앞부분에서 이미 misc/330에 편입됨. `resolveNpcGrudge`(원한 해소 액션)는 호출부가 어디에도 없음 — UI 트리거 지점이 없는 사소한 미완성 기능. 우선순위 낮아 기록만 남김 |
| race/258 (언데드 패널 렌더) | 정상 | combat/257에서 import한 실구현을 재노출할 뿐, `__tfDeferred_232`로 정상 등록. 조치 없음 |
| race/259 (수인족 야생의 법칙) | **실제 버그 발견·수정** (아래 상세) | `getBeastWildlawStatus()`가 죽은 buildSystem 안에서만 호출됨 → ai-prompt/077 전체 재조사로 이어짐 |
| race/260 | 정상 | 이전 라운드(#61)에 죽은 훅 3건 이미 수정. 이번엔 `getBeastAwakeningStatus`가 무해한 중복 래퍼(패널이 `loadBeastAwakening()`을 직접 6회 호출해 자체 표시)임을 추가 확인. 조치 없음 |

### race/259 → ai-prompt/077 — 7종족(드래곤/악마/언데드/수인/원소/
엘프/천족) 전용 서사 힌트 시스템 전체가 게임 출시 이래 한 번도 AI에게
전달된 적이 없던 버그

`race/259`의 `getBeastWildlawStatus()`(수인족 "야생의 법칙" 상태를
텍스트로 요약)를 스캐너가 "호출부 없음"으로 표시해 추적한 결과,
유일한 호출 지점이 `ai-prompt/077`의 `buildSystem()`(2,333줄짜리
레거시 시스템 프롬프트 조립기 — 실제 프롬프트 조립은 완전히 다른
함수인 `buildLightSystem`이 전담하며, `buildSystem`은 코드베이스
어디서도 호출되지 않는 완전한 죽은 함수, 17차/18차에 이미 확인됨)
78~2411줄 안이었다. 더 조사한 결과 이 죽은 함수 안에는
`getBeastWildlawStatus` 하나가 아니라, 530~710줄에 걸쳐 **7개
종족 전용 서사 힌트를 만드는 `newRaceHint` 삼항연산자 체인 전체**가
갇혀 있었다: 드래곤(용의 피/균형 단계/보물 집착), 악마(타락도),
언데드(빌려온 시간), 수인(야생의 법칙), 원소(각성 단계/원소 상성),
엘프(천년 기억), 천족(신성 저울/계약) — 각각 이미 완성도 높은
전용 상태 추적 서브시스템(`loadDragonHeart`, `getDemonCorruptionStatus`,
`getUndeadBorrowedTimeStatus`, `getElemAwakeningStatus`,
`getElfMemoryStatus`, `getCelestialScaleStatus` 등)을 갖추고
있었지만, 이를 소비하는 함수가 죽은 함수 하나뿐이라 실질적으로
전부 무용지물이었다.

해당 삼항연산자 체인이 참조하는 모든 헬퍼 함수/데이터는 이미
`ai-prompt/077` 파일 자체에 직접 import돼 있어 새 import 없이 같은
파일 안에서 안전하게 추출 가능함을 확인. `buildSystem` 바로 앞에
새 함수 `getRaceSpecialHint()`를 추가해, 죽은 함수의 `char` 매개변수
대신 `S.character?.race`로 종족을 다시 판별하고, `newRaceHint`
삼항연산자 본문을 그대로(내부에 `char` 참조가 없고 종족 판별
불리언에만 의존함을 확인) 옮겨 `try/catch`로 감싼 뒤 반환하도록
했다. B80/18차와 완전히 동일한 원인·해법이라 `misc/330`의
`hookB80MissingSectionsToBLS`의 `SECTION_FNS` 배열에
`'getRaceSpecialHint'`를 추가해 매턴 `buildLightSystem()` 출력에
합류시켰다.

헤드리스 검증: 7종족(드래곤/악마/언데드/수인/원소/엘프/천족) 각각에
대해 `getRaceSpecialHint()`가 133~649자 분량의 종족별 실제 서사
힌트 텍스트를 정상 반환(빈 문자열이나 에러 없음)함을 확인했고,
`buildLightSystem()` 실행 결과 문자열이 해당 힌트 텍스트를 실제로
포함함을 확인. 기존 전체 회귀 스위트(18차, 소문 패널, 루프사이클,
명예의 전당, 전생의 기억) 전부 재통과, 콘솔 에러 0건.

**참고**: `buildSystem`은 여전히 2,300줄 넘게 남아있는 완전한 죽은
함수이며, 이번에 구출한 `newRaceHint` 체인 외에도 다른 서사 힌트
로직이 더 갇혀 있을 가능성이 있다 — ai-prompt/ 디렉토리를 감사할
차례에 buildSystem 나머지 부분을 마저 조사할 예정.

### race/064 (아에테른 종족간 전쟁 역사 · 오대륙 세계관 · 영지 귀환/출발
연출 · 직업 숙련도·자동 전직 제안 시스템, 1237줄) — 정상, 사소한 미해결
1건

이 파일은 이름과 달리 서로 다른 두 시스템을 담고 있다: (1)
`FIVE_CONTINENTS`(오대륙+천계+마계 세계관 데이터)와 `renderWorldMap`
/`renderContinentsPanel`/영지 귀환·출발 연출(`_onArriveAtDemesne`,
`_onDepartDemesne`, `_renderDemesneLocationBlock`, `isAtDemesne`),
(2) 직업 숙련도 시스템(`checkJobMasterySkillUnlock`,
`getJobMastery`, `applyMasteryBonus`, `checkMasteryLevelUp`,
`renderMasteryInfo`)과 상황 기반 자동 전직 제안(`updateJobTurns`→
`checkJobEvolutionTrigger`→`autoSuggestNextJob`→
`showJobSuggestionPopup`→`acceptJobSuggestion`). 모든 핵심 함수의
실제 호출부를 하나씩 추적해 전부 정상 연결을 확인했다:
`_onArriveAtDemesne`/`_onDepartDemesne`는 misc/054·misc/053의 이동
처리부에서 실사용, `_renderDemesneLocationBtock`은 world/052의 장소
렌더에서 실사용, `renderWorldMap`은 world/070에서 실사용(그리고
`__tfDeferred_51`이 main.js에 정상 등록됨), `applyMasteryBonus`는
`checkMasteryLevelUp`(같은 파일 906줄) 내부에서 호출되고
`checkMasteryLevelUp`은 `updateJobTurns`(quest/086:2214에서 매턴
호출)가 호출, `renderMasteryInfo`는 job/042에서 실사용.

사소한 미해결 1건(수정 안 함, 순수 연출 손실): `patchOpenTransportPanel`
훅(748~803줄 사이 아님, 774~803줄 — `window.openTransportPanel`을
감싸 영지가 있으면 이동수단 목록에서 자기 영지 버튼에 금색 테두리를
추가하는 순수 시각 연출)은 misc/054의 onclick 문자열 호출
(`onclick="openTransportPanel(...)"`, 전역 스코프라 패치가 정상
적용됨)에서는 잘 동작하지만, misc/053(게시판 시스템)이 `openTransportPanel`을
ES `import`로 직접 가져와 `useTransport: ()=>{ openTransportPanel(...) }`
형태로 호출하는 경로에서는 `window.openTransportPanel` 재할당이
적용되지 않아(#58에서 확립한 동일한 ES 모듈 클로저 문제) 그 경로로
이동수단 패널을 열 때만 영지 강조 테두리가 빠진다. 순수 장식용
기능이라 게임플레이·서사에는 영향이 없어 기록만 남기고 수정하지
않음.

**race/ 디렉토리 감사 완료 (10/10)**: 이번 라운드 최대 성과는 7종족
서사 힌트 시스템 구출(위 참조)이며, 나머지 9개 파일은 모두 정상
연결 확인(사소한 미해결 사항 2건: race/198의 `resolveNpcGrudge`,
race/064의 openTransportPanel 장식 연출 1건 — 둘 다 순수 저위험
기록용 항목).

## 19차(계속) — religion/ 디렉토리 착수, `getWorldLoreBLSContext()`
전체가 매턴 조용히 ReferenceError로 실패하던 치명적 버그 발견·수정

`religion/061`의 `getWorldLoreBLSContext()`는 18차에서 죽은
`buildSystem`으로부터 구출돼 `misc/330`의 `SECTION_FNS`에 이미
편입된 함수로, 세계 역사 뼈대·대륙별 세력 구도·엔딩 장면 가이드·
28장 체계 챕터별 NPC 상태·아스모데우스/베엘제부브 등 주요 NPC
프로필 주입 등 이 게임에서 가장 방대하고 정교한 서사 컨텍스트
주입 로직을 담고 있다. 그런데 실제로 호출하면 **함수 시작부터
끝까지 단 한 번도 정상 반환한 적이 없는** 상태였다:

1. **`mqState` 참조 오류(치명적)**: 336~338줄의 "메인퀘스트 미시작
   상태 처리" 블록이 `mqState['mq1']`을 참조하는데, `mqState`는 이
   함수 어디에도 선언된 적이 없었다. 원본인 ai-prompt/077의 죽은
   `buildSystem`을 확인해보니 그쪽에도 `mqState` 선언이 없는
   동일한 잠재 버그가 있었다 — 다만 그 함수는 애초에 호출되지
   않는 죽은 코드라 증상이 드러나지 않았을 뿐이다. `misc/330`의
   `SECTION_FNS` 훅은 개별 섹션 함수의 예외를 전부 삼키도록
   설계돼 있어(`catch(e){ /* 무시 */ }`), 18차에서 이 함수를
   구출한 이후로도 매턴 조용히 크래시하며 아무 것도 반환하지
   않고 있었는데 아무도 눈치채지 못했다. `loadMainQuestState`를
   job/042에서 가져와 `const mqState = (typeof loadMainQuestState
   === 'function') ? loadMainQuestState() : {};`로 실제 메인
   퀘스트 진행 상태를 로드하도록 수정.
2. **`raceStorySection` 미계산**: 함수 맨 끝 `return` 문이
   `raceStorySection`이라는 변수를 참조하는데, 이 역시 함수 안
   어디에도 계산된 적이 없었다. `ai-prompt/077`의 죽은
   `buildSystem` 안에서 완전히 동일한 이름·로직의 IIFE를 찾아
   (RACE_STORY_RULES 기반 종족별 파편 조우 방식/퀘스트 진입
   경로/NPC 반응/서사 지침/로어 금기 + 뱀파이어 전용 피의 연대기
   현황) `char.race` 대신 `S.character?.race`를 쓰도록 바꿔
   그대로 이식했다. 뱀파이어 서브블록이 참조하는
   `loadVampireChronicle`/`VAMPIRE_CHRONICLE_STAGES`/`BLOOD_CLASSES`/
   `THRALL_LORD_STAGES`/`loadThrallData`는 원본 파일(ai-prompt/077)
   에서는 직접 import돼 있었지만 religion/061에는 없어 이식 시
   같은 import를 추가했다(progression/020, data/020, ui/026).
3. **종족 매칭 방식 자체의 설계 결함(2차 발견)**: 위 두 가지를
   고치고 나서도 실제로 테스트해보니 `raceStorySection`이 여전히
   항상 빈 문자열이었다. 원인은 `RACE_STORY_RULES`의 키가 영문
   id(human/elf/dwarf/orc/darkling/celestial/dragon/demon/undead)인
   반면, 실제 캐릭터 생성(core/084의 `pickRace`)은 종족의 한글
   표시명("인간", "엘프" 등)을 그대로 `S.character.race`에 저장한다는
   점이었다. 원본의 `_race.toLowerCase().includes(k)` 영문 부분
   문자열 매칭은 한글 이름과 절대 겹칠 수 없어, 이 기능은 애초
   설계 단계부터 한 번도 매칭에 성공한 적이 없었다(죽은
   buildSystem 안에서도 동일). world/055에 이미 존재하는
   `RACE_NAME_TO_ID`와 동일한 패턴으로 한글→영문 id 매핑
   테이블을 추가해 실제로 매칭되도록 수정. (단, `RACE_STORY_RULES`
   자체에 "뱀파이어"에 대응하는 키가 애초에 존재하지 않아 —
   9개 키 모두 human/elf/dwarf/orc/darkling/celestial/dragon/demon/undead
   뿐 — 뱀파이어 전용 피의 연대기 서브블록은 여전히 도달 불가능
   하다. 이는 콘텐츠 자체가 없는 원본 설계상의 공백이라 새 콘텐츠를
   만들어 채우는 것은 버그 수정 범위를 벗어난다고 판단해 기록만
   남기고 그대로 둠.)

헤드리스 검증: 종족을 "인간"/"엘프"로 설정해 각각
`getWorldLoreBLSContext()`를 호출한 결과 더 이상 에러 없이(수정
전 항상 예외로 실패) 실제 텍스트를 반환했고, "엘프"가 "인간"보다
더 긴 결과(엘프 전용 서사 규칙 추가분)를 반환해 종족별 분기가
실제로 작동함을 확인. `buildLightSystem()` 전체 실행도 정상.
기존 전체 회귀 스위트(18차, 소문 패널, 루프사이클, 명예의 전당,
전생의 기억, 7종족 서사 힌트) 전부 재통과, 콘솔 에러 0건.

### religion/ 나머지 21개 파일 감사 완료 (22/22)

| 파일 | 판정 | 비고 |
|---|---|---|
| religion/092 (지역 종교 점유율) | 정상 | getRegionReligionShare/changeReligionShare 다수 파일에서 실사용 |
| religion/094 (플레이어 종교 귀속/교화) | 정상 | setPlayerReligion/performEvangel/convertNpc 전부 ai-prompt GS훅·ui/097 버튼에서 실사용, __tfDeferred_75 등록 확인 |
| religion/099 (BLS 종교 현황) | 정상 | getReligionBLS가 ai-prompt/152·100에서 window. 경유로 안전하게 호출, __tfDeferred_80 등록 확인 |
| religion/101 (신앙 fath 연동) | 정상 | performEvangel/setPlayerReligion을 typeof 가드 후 정상 래핑(__tfDeferred_82) |
| religion/102 (축복/저주 판정 보너스) | 정상 | 이전 라운드에 이미 수정된 hookReligionIntoRoll 죽은 훅 주석 확인, tickAbyssCorruption은 religion/113에서 매턴 실행 |
| religion/104 (종교전쟁 결과 처리) | 정상 | WAR_END_TURNS는 스캐너의 오탐(상수를 함수 호출로 오인) — 실제로는 같은 파일 내 정상 참조. supportReligionWar 래핑도 정상 |
| religion/105 (제5 혼합 종파) | 정상 | trySyncretism 등 6개 평화 경로 함수 전부 initiatePeaceRoute 래핑(__tfDeferred_86)에서 라우팅, ui/097·religion/111 버튼에서 호출 |
| religion/106 (배교 페널티) | 정상 | setPlayerReligion 3단 래핑 체인(094→101→106) 순서·로직 확인 |
| religion/108 (이단 심문) | 정상 | tickHeresyCheck/getHeresyRiskLabel 모두 religion/113·112에서 실사용 |
| religion/109 (성지 시스템) | 정상 | buildShrine은 religion/111 패널 버튼, tickShrineEffects/getShrineSection은 113/112에서 실사용 |
| religion/110 (매 턴 통합 훅) | 무해한 미완성 스텁 | `hookReligionV2ToTick`가 플래그만 세팅할 뿐 실제 로직이 없음 — 실제 매턴 처리는 quest/086의 `_religionV2PerTurn` 직접 호출로 이미 이뤄지고 있어 기능 손실 없음. 기록만 남기고 조치 없음 |
| religion/111 (renderReligionPanel 보강) | 정상 | 15차에 이미 수정된 getReligionTension 객체 비교 버그 주석 확인. completeReligionQuest 등 모든 onclick 대상 존재 확인 |
| religion/113 (매 턴 종교 V2 훅) | 정상 | `_religionV2PerTurn`이 quest/086:2284에서 정상 호출됨을 재확인(13차에 이미 wandererAxisHook와 같은 패턴으로 고정됨) |
| religion/114 (신규 종교 2개 추가) | 정상 | loop_faith/void_silence를 RELIGIONS 등 4개 데이터 테이블에 정상 병합, setPlayerReligion 조건부 게이트도 __tfDeferred_95로 정상 등록 |
| religion/116 (만신전 정의) | 정상 | 단순 재노출 |
| religion/117 (종교 전용 NPC 풀) | 정상 | getReligionNPCSection이 religion/121의 getReligionBLS 체인에 포함 |
| religion/118 (종교 의례/축제) | 정상 | checkReligionRituals가 core/122의 _religionV2PerTurn 확장에서 매턴 호출 |
| religion/119 (종교 사이드퀘스트 20개) | 정상 | checkReligionSideQuests 매턴 호출, completeReligionSideQuest는 core/122의 processGSToAllDBs 래핑(q_done 배열 처리)에서 정상 호출 |
| religion/120 (만신전/신화 패널 렌더) | 정상 | core/122가 동적 생성한 메뉴 버튼 onclick에서 정상 호출 |
| religion/121 (BLS에 만신전/신화/NPC 추가) | 정상 | getReligionBLS 체인의 마지막 래핑(099→112→121), main.js 등록 순서 확인 |

**religion/ 디렉토리 감사 완료 (22/22)**: 이번 라운드 최대 성과는
`getWorldLoreBLSContext()`의 치명적 ReferenceError + 종족 매칭
설계 결함 발견·수정(religion/061, 위 참조)이며, 나머지 21개 파일은
전부 정상 연결(무해한 미완성 스텁 1건 — religion/110 — 기록만 남김).
`getReligionBLS`가 099→112→121 3단으로, `setPlayerReligion`이
094→101→106 3단으로, `initiatePeaceRoute`가 6개 평화 경로 함수를
라우팅하는 구조 등 이 디렉토리 전체가 매우 촘촘하게 잘 짜인
래핑 체인으로 구성돼 있음을 확인했다.

## 19차(계속) — summon/ 디렉토리 감사 완료 (8/8), combat/ 디렉토리 감사 완료 (11/11)

| 파일 | 판정 | 비고 |
|---|---|---|
| summon/023 (균열 소환) | 정상 | getAvailableSummons/activateVoidSummon/dismissVoidSummon 모두 같은 파일이 생성하는 onclick 문자열에서 호출(스캐너가 놓친 패턴) |
| summon/124 (통합 혈통 정의) | 정상 | autoAssignBloodline은 quest/086에서, applyBloodlinePassive는 같은 파일의 autoAssignBloodline 내부에서 호출 |
| summon/129 (GS 혈통 처리) | 정상 | processGSToAllDBs를 orig.apply로 정상 래핑 |
| summon/131 (혈통 패널 UI) | 정상 | renderBloodlinePanel이 template.html 메뉴 버튼 2곳 + quest/086 case문에서 호출 |
| summon/132 (환생 시 혈통 자동 처리) | 정상 | window.goReinc(환생 확인 화면을 "여는" 버튼, 실제 환생 실행은 doReincarnate)을 orig.apply로 정상 래핑. 환생 화면엔 취소 버튼이 없어(새 삶 시작/설계도 해금/처음부터 3가지뿐) 중복 발동 우려 없음 |
| summon/133 (게임 시작 훅) | 이미 제거됨 | 15차에 이미 원인 규명 후 quest/086 doStartChat 본문으로 이설, 설명 주석만 남은 상태 |
| summon/186 (소환수 로드/세이브) | 정상 | __tfDeferred_163 정상 등록 |
| summon/215 (혈통 시스템 구버전) | 이미 제거됨 | 17차에 이미 원인 규명 후 제거, 설명 주석만 남은 상태 |
| **summon/147 (소환수 상세 기억 DB)** | **완전 고아 코드(양쪽 다 죽음)** | `recordSummonMemory`(전투/임무/대사/감정/유대 로그 기록)도, 이를 읽는 `loadSummonMemDB`도 코드베이스 전체에서 호출부가 전혀 없다 — 작성자·소비자가 둘 다 없는 완결된 미사용 기능. 소비처(소환수 패널에 기억 표시 등)를 새로 만드는 것은 버그 수정이 아니라 신규 기능 개발이라 이번 감사 범위를 벗어난다고 판단, 기록만 남기고 조치 없음 |
| combat/095, 150, 188 | 정상 | 각각 initiatePeaceRoute 기반 함수·changeReligionShare/convertNpc GS 처리·addTimelineEvent(여러 시스템에서 실사용) 확인 |
| combat/210 (전투 시스템) | 이미 정리됨 | 17차에 죽은 COMBAT_STATE 턴제 루프 전체 제거, calcDamage만 남김(misc/327·328에서 실사용) — 재확인 |
| combat/245 (전투 지형 효과) | 정상 | detectTerrainFromText(misc/328·251에서 실사용)·getTerrainBonus(quest/086의 effStat 판정 보너스 합산에 포함) 확인. 기존 부호 오류 수정 주석 확인 |
| combat/247 (부상 흔적 페널티) | 정상 | checkCombatInjury/getCombatInjuryBonus/tickResidualInjury 전부 misc/251의 매턴 파이프라인에서 실사용, getCombatInjuryBonus도 effStat 합산에 포함 |
| combat/248 (기습/선제공격) | 정상(설계상 순수 서사 주입) | checkAmbushSystem/checkDefendSystem 모두 misc/251에서 매턴 호출됨을 확인. `S._ambushBonus`/`S._defendActive`는 어디서도 읽히지 않지만, 이 게임의 AI-서사 전투 경로는 HP 피해량 자체를 AI 응답 텍스트의 "HP -N" 패턴 파싱으로 결정하는 구조(quest/086:1935~1951)라, 두 플래그의 실질적 효과는 `S._nextInjectedContext`로 AI에게 전달되는 서사 지침이 전부이고 별도의 수치 강제 적용은 애초에 설계되지 않았을 가능성이 높다 — combat/250(레어 전투 이벤트)도 동일한 "지침만 주입, 소비 플래그 없음" 패턴이라 이것이 이 파일 그룹의 의도된 설계로 보인다. 확신 없이 손대면 전투 밸런스를 임의로 바꿀 위험이 있어 기록만 남기고 조치하지 않음(추가 조사 필요 시 참고용) |
| combat/250 (레어 전투 이벤트) | 정상 | misc/251에서 매턴 호출, 248과 동일한 순수 서사 주입 패턴 |
| combat/256 (회차별 보스 스폰) | 정상 | 스캐너가 플래그한 3건(`_patchNpcDisplay`/`DUNGEON_DB_VER`/`DUNGEON_ANOMALY_CHANCE`) 전부 오탐(괄호 없는 함수 참조·상수 오인) 확인 |
| combat/257 (미니맵+언데드 빌린시간) | 정상 | 스캐너가 플래그한 다수 후보 전부 같은 파일 내부에서 실사용 확인. getUndeadBorrowedTimeStatus는 19차 앞부분에서 구출한 getRaceSpecialHint 체인의 일부로 이미 확인됨 |
| combat/281 (전투 선택지 실질화) | 정상 | buildCombatChoices/getEquippedItemCombatHint 모두 ui/291(이전 라운드에 정상화됨)에서 실사용 |

**summon/·combat/ 디렉토리 감사 완료 (19/19)**: 이번 라운드는 실제
버그 없이 완전 고아 기능 1건(summon/147, 소비처가 없어 수정 보류)과
설계 의도가 불확실해 손대지 않은 1건(combat/248의 미사용 플래그,
기록만 남김)만 발견. 나머지는 전부 정상 연결 확인.

## 19차(계속) — ★ 이번 세션 최대 규모 구출: `getPastLifeLegacySection()`
— 죽은 buildSystem 안에 번호 매겨진 채 갇혀 있던 124개 "전생 유산"
서사 힌트 블록 전체를 구출

**배경**: race/064 감사 중 `getBeastWildlawStatus()`의 유일한 호출부가
ai-prompt/077의 죽은 `buildSystem`(78~2411줄, 나중에 재확인 결과
276~2608줄 = 2,333줄 전체) 안이라는 것을 발견해 19차 앞부분에서
7종족 서사 힌트(`newRaceHint`)를 구출했다. 이후 "buildSystem 안에
더 갇힌 게 있을 수 있다"는 메모를 남겼는데, 실제로 확인해보니
규모가 예상을 훨씬 뛰어넘었다.

**정량적 확인**: ai-prompt/077이 자체적으로 import하는 301개 식별자
중, "이 파일의 buildSystem 안에서는 호출되지만 코드베이스 전체
(이 파일 제외) 어디에서도 호출되지 않는" 함수가 정확히 **113개**
있음을 스크립트로 확인했다(`getWatchers`, `getStarSign`,
`getMoonPhase`, `getWorldTreeStatus`, `getDreamProphecies`,
`getCurseMasteries`, `getActiveGrudges`, `getTimeEchoes`,
`getRomanceLegacy`, `getFullBestiary`, `getTestaments`,
`getParallelSelfEncounter`, `getSoulMasks`, `getConstellation`,
`getExplorerMap`, `getLightningImprints`, `getDawnStatus`,
`getIdentityVault`, `getRiftStatus`, `getRecipeBook`,
`getLastAchievementBonus`, `loadRace`, `getVillainStatus` 등).
이 함수들은 각각 misc/016·progression/018·progression/020·
race/028 등 자기 자신의 파일에서는 완전히 정상적으로 구현·저장까지
되어 있는 "전생 유산 시스템"(수십 회차에 걸쳐 쌓이는 원한·저주·
인연·유물·별자리·꿈·평행세계 조우·감시자·유언장 등)인데, **이를
서사 힌트로 조립해 AI에게 전달하는 유일한 소비처가 죽은 buildSystem
하나뿐**이라 게임 출시 이래 단 한 번도 AI에게 전달된 적이 없었다.

**구조 확인**: buildSystem 안에서 이 함수들은 1번부터 130번까지
번호가 매겨진(`// 24번: 원한의 추적자` 같은 주석) 123개의 완전히
독립된 블록으로 조직되어 있었다(1942~2514줄, 573줄). 각 블록은
`const x = getY(); const xSection = 조건 ? \`서사 힌트 텍스트\` :
"";` 패턴으로 자기 완결적이며 서로 참조하지 않는다. 이 중 3개
(`dynBestiarySection`/`itemDissonanceSection`/`raceJobDissonanceSection`)
는 이미 misc/330의 SECTION_FNS로 별도 편입되어 있는 걸로 확인돼
(각각 items/007, job/208에 실구현) 중복 방지를 위해 제외하고, 나머지
**124개 블록**을 대상으로 삼았다.

**구출 방법**: 스크립트로 (1) 573줄의 번호 블록 영역을 정확히 추출,
(2) 이미 편입된 3개 블록을 제외, (3) 블록들이 공유하는 종족/직업/
시나리오/회차 판별 변수(`_cycle`, `isElf`, `isDwarf`, `isMagicRole`,
`isWarriorRole` 등, buildSystem 상단 280~325줄에 이미 정의됨)를
`const char = S.character || {};`로 대체한 뒤 그대로 재사용,
(4) 최종 return문에서 124개 섹션 변수를 원래 순서 그대로 이어붙이는
`getPastLifeLegacySection()` 함수를 조립해 `getRaceSpecialHint()`
바로 다음(빌드 시스템 정의 직전)에 삽입했다. `char.xxx` 참조는
전혀 고칠 필요가 없었다 — 새 함수 맨 위에서 `char`를 지역 상수로
재정의했기 때문에 원본 로직을 단 한 글자도 바꾸지 않고 그대로
재사용할 수 있었다. B80/18차/이번 19차의 `getRaceSpecialHint`와
완전히 동일한 원인·해법이라 `misc/330`의 `SECTION_FNS`에
`'getPastLifeLegacySection'`을 추가해 매턴 `buildLightSystem()`
출력에 합류시켰다.

**헤드리스 검증**: (1) 함수 자체를 직접 호출 — 갓 시작한 신규
캐릭터(0회차)에서도 에러 없이 581자의 실제 서사 힌트(세계관 상식·
정보 공개 단계별 게이트)를 반환. (2) 회차수를 15로, 종족을 엘프로
설정한 뒤 재호출 — 여전히 에러 없이 3,125자로 대폭 늘어난 내용
(별자리·저주 숙달·세계수 성장·전생 인연 등 다수 섹션이 조건
충족으로 활성화됨)을 반환. (3) `buildLightSystem()` 전체 실행 시
결과 문자열 길이가 이 함수 추가분만큼 실제로 증가함을 확인.
(4) 기존 전체 회귀 스위트(18차, 소문 패널, 루프사이클, 명예의 전당,
전생의 기억, 7종족 서사 힌트, 세계 역사 뼈대) 전부 재통과, 콘솔
에러 0건.

**참고**: buildSystem은 여전히 2,300줄이 넘는 완전한 죽은 함수로
남아있다 — 이번에 구출한 124개 번호 블록(1942~2514줄) 외에도
276~1941줄 구간(설정부 + `npcSection`/`memSection`/`karmaSection`
등 약 73개의 번호 없는 섹션 변수)이 더 있는데, 이 구간은 표본
점검 결과 상당수가 `buildLightSystem`이 이미 네이티브로 처리하는
내용(NPC 목록, 기억, 분위기 등)과 개념적으로 겹쳐 그대로 이식하면
프롬프트에 같은 정보가 중복될 위험이 있다고 판단해 이번 라운드
에서는 손대지 않았다 — 개별 검증 후 다음 라운드에서 이어서
확인할 예정.

## 19차(계속) — ai-prompt/ 나머지 파일 감사 (077 제외 10/10 완료)

| 파일 | 판정 | 비고 |
|---|---|---|
| ai-prompt/100 (GS 처리 훅) | 정상 | 이전 라운드(62번 작업)에 종교/가문 유산 GS 필드 이미 수정 확인 |
| ai-prompt/136 (GS 처리 clan_*) | 정상 | processGSToAllDBs를 orig.apply로 정상 래핑, clan_join 등 GS 필드가 ai-prompt/137에서 AI에게 실제로 안내됨을 확인 |
| ai-prompt/137 (BLS 가문 현황) | 정상 | getClanBLS가 buildLightSystem/buildSystemPrompt/buildPrompt 중 존재하는 것을 동적 탐지해 정상 래핑 |
| ai-prompt/148 (GS DB 자동 파싱) | 정상(내부 명명 혼동 1건, 무해) | `_wrappedProcessGSBlock`(→checkWorldEventTriggers 예약)이 같은 `__tfDeferred_129` 실행 안에서 곧바로 진짜 마스터 핸들러인 `processGSBlock`(335~2184줄, 스탯 적용·불사 게이지·신의 개입 등 핵심 로직 전부 포함)으로 재할당되어 사실상 대체된다. 이름이 비슷해 혼동을 주지만, checkWorldEventTriggers는 combat/150에서 이미 별도로 매턴 호출되고 있어 기능 손실은 없다 — 무해한 이름 중복으로 기록만 남김 |
| ai-prompt/152 (상황별 BLS 주입) | 정상 | buildContextBLS/buildCoreBLS 모두 quest/086에서 실사용, 전투/NPC대화/종교/퀘스트/루프/외교 컨텍스트별 분기 전부 확인 |
| ai-prompt/153 (sendMsg 자동압축 훅) | 정상 | 이전 라운드(69번 작업)에 이미 수정 확인 |
| ai-prompt/161 (컨텍스트 윈도우 모니터) | 정상 | 이미 수정된 주석 확인, misc/277에서 실사용 |
| ai-prompt/172 (GS 처리 sendMsg 훅) | 정상(사소한 미사용 import 1건) | 이미 수정된 주석 확인(checkLoopMilestones는 quest/086으로 이설 완료). earn_heritage/end_of_loop GS 처리와 계승 효과 BLS 주입 모두 정상 |
| ai-prompt/222 (processGSBlock 추가 필드) | 정상(harmless dead branch 1건) | 직업 변경 시 checkJobUnlock 검증(이미 수정된 보안 버그 주석 확인) 등 대부분 정상. `gs.soul_weapon_exp` 분기는 대상 함수(`levelUpSoulWeapon`)가 v8에 deprecated된 빈 스텁이고, 이 GS 필드 자체도 AI 프롬프트 어디에도 안내되지 않아 실전에서 절대 발동할 수 없는 완전한 죽은 가지 — 기록만 남김 |
| ai-prompt/319 (BLS 통합 래퍼) | 정상 | buildLightSystem을 orig.apply로 정상 래핑, window.getBloodlineBLS(job/130)도 존재 확인 |

**ai-prompt/ 디렉토리 감사 대부분 완료**: ai-prompt/077(가장 크고
가장 중요한 파일)은 이번 19차에서 두 건의 대형 구출(getRaceSpecialHint,
getPastLifeLegacySection)을 완료했지만 여전히 276~1941줄 구간이
미검증 상태로 남아 다음 라운드로 이월. 나머지 10개 파일은 전부
정상 연결 확인, 실제 버그 없음(무해한 이름 중복 1건 + 도달 불가능한
죽은 가지 1건만 기록).

## 19차(계속) — ★ 세 번째 대형 구출: `getSavedStateExpansionSection()`
— 죽은 buildSystem의 "[v48] 저장 데이터 → BLS 전달 전면 확장" 구간
(A~K, 18개 카테고리) 전체를 구출

앞서 "276~1941줄 구간은 다음 라운드에서 확인" 이라 남겨뒀던 부분을
실제로 열어본 결과, 예상보다 훨씬 큰 두 번째 트로브를 발견했다.

먼저 `_worldLoreSection`/`_cabalSection`/`_socialRankNpcSection`/
`_worldFigureSection` 4개는 각각 `getWorldLoreBLSContext()`/
`getCabalBLSContext()`/`getSocialRankNpcBLS()`/`getWorldFigureBLS()`를
그대로 호출하고 있어 — 전부 이미 misc/330에 편입되어 살아있는
함수들이므로 buildSystem의 이 부분은 단순 중복(무해)임을 확인,
건드리지 않았다.

그런데 이어지는 "// [v48] 저장 데이터 → BLS 전달 전면 확장" 주석
블록(원본 기준 약 590줄)은 완전히 다른 이야기였다. 주석에 적힌
카테고리 목록(서사핵심/종족시스템/NPC·관계/퀘스트·선택/세계·세력/
성장·능력/회차·전생/장소·탐험/감정·심리/인벤토리·장비/기타) 그대로,
A~K 18개의 독립 섹션이 각각 완결된 기능으로 존재했다:

- **[A] 서사 핵심(8개)**: 선택 이력, 배신 기록, 트라우마, 원한 목록,
  라이벌, 감정 상태, 루프 자각도, 메타 지식/세계 비밀/정체성
- **[B] 종족별 심화 시스템**: 엘프(선조 기억/망각/억제 감정), 드워프
  (명작/원한/미완성 작업), 오크(명예/혈맹), 다크링(공허 수치), 천족
  (서약), 악마(계약/진명), 드래곤(심장 분노/각성), 인간(유산/낙인) —
  각 종족 항목에 "★교차★" 표시로 천계/마계 개방, 진짜 적 공개 등
  메인 스토리 플래그와 교차 연동되는 부분까지 포함
- **[C] NPC·관계**: NPC 성장/타락/영감/오프스크린 행동
- **[D] 퀘스트·선택**: 퀘스트 선택 이력, 히든 퀘스트, 나비효과, 죄와
  속죄, 처치 목록, 인과 관계
- **[E] 세계·세력**: 세계 상태, 세력 시뮬레이션, 왕국, 전쟁, 경제,
  종교, 결사, 세계 기억
- **[F] 성장·능력**: 스킬, 직업 숙련도, 히든 직업, 혈통, 변이, 영구
  스탯 보너스
- **[G] 회차·전생**: 루프 기록, 전생 정보/테마/편지, 관계 유산, 회차
  목표
- **[H] 장소·탐험**: 탐험 횟수, 은신처, 미탐사 폐허, 던전 상태
- **[I] 감정·심리**: 슬픔, 정신 오염, 유년기 트라우마, 데자뷰, 영혼
  가면(페르소나)
- **[J] 인벤토리·장비**: 골드, 장착 아이템, 영혼 무기, 주요 소지품
- **[K] 기타**: 예언, 꿈 예언, 언어, 별자리, 달 위상, 이전 내용 요약,
  유물 파편, 클리어 보상, 직업 시너지, 전생 유물, 변환된 종족

이 18개 섹션이 참조하는 `loadChoiceHistory`/`loadBetrayals`/
`loadTraumas`/`loadGrudgeList`/`loadRivals`/`loadEmotion`/
`loadLoopAwareness`/`loadMetaKnowledge`/`loadWorldSecrets`/
`loadNpcCorruption`/`loadOffscreenDB`/`loadQuestChoices`/
`loadSinRedemptions`/`loadCausality`/`loadWorldState`/
`loadFactionSim`/`loadEconomy`/`loadCabalState`/`loadWorldMemory`/
`loadJobMastery`/`loadBloodline`/`loadMutation`/`loadPermStatBonus`/
`loadPastLife`/`loadPastLetters`/`loadExploration`/`loadHideout`/
`loadGrief`/`loadMentalCorruption`/`loadChildhoodTrauma`/
`loadDejavu`/`loadEquipped`/`loadInventory`/`loadProphecies`/
`loadDreamProphecies`/`loadConstellation`/`loadMoonPhase`/
`loadSummaries` 등 수십 개 함수는 전부 실제 저장/기록(쓰기) 로직이
다른 파일(주로 ai-prompt/148의 GS 필드 처리부, 각 시스템 자체
파일)에 이미 정상 작동 중이었다 — 즉 "데이터는 정상적으로 쌓이고
있지만, 그것을 서사 힌트로 바꿔 AI에게 알려주는 유일한 소비처가
죽은 buildSystem 하나뿐"이라 AI가 이 축적된 상태를 전혀 인지하지
못하고 있었다. `getPastLifeLegacySection`과 완전히 동일한 원인·
해법이라, 같은 방식(공유 설정 변수 없이 `char = S.character||{}`만
재정의하면 원본 로직을 한 글자도 안 고치고 그대로 재사용 가능함을
확인)으로 `getSavedStateExpansionSection()`을 조립해 같은 파일에
추가하고, `misc/330`의 `SECTION_FNS`에 등록했다.

**헤드리스 검증**: 신규 캐릭터(데이터 없음)에서는 0자(정상 — 모든
섹션이 조건부라 데이터가 없으면 빈 문자열), 선택 이력/배신 데이터를
로컬스토리지에 직접 주입한 뒤 재호출하면 에러 없이 실제 서사 힌트
텍스트를 반환함을 확인. `buildLightSystem()` 전체 실행도 정상.
기존 전체 회귀 스위트(18차, 소문 패널, 루프사이클, 명예의 전당,
전생의 기억, 7종족 서사 힌트, 세계 역사 뼈대, 전생 유산 124블록)
전부 재통과, 콘솔 에러 0건.

## 19차(계속) — 네 번째(마지막) 구출: `getMiscOrphanSection()` —
남아있던 최후의 3개 orphaned 섹션(봉인석 정보/직업 시너지/성장형
악당) + ai-prompt/077 감사 완료 선언

앞선 두 차례 대형 구출(`getPastLifeLegacySection`,
`getSavedStateExpansionSection`) 이후, ai-prompt/077 파일 전체를
대상으로 "301개 import 중 지금도 이 파일의 dead buildSystem 안에서만
호출되는 이름이 남아있는가"를 다시 스캔했다. `_worldLoreSection`/
`_cabalSection`/`_socialRankNpcSection`/`_worldFigureSection`은
각각 이미 misc/330에 편입된 `getWorldLoreBLSContext`/
`getCabalBLSContext`/`getSocialRankNpcBLS`/`getWorldFigureBLS`를
그대로 호출하는 무해한 중복임을 확인했고, `_kingSection`(왕국 계보)/
`_raceHistSection`(종족 역사)/`_corruptionStorySection`(타락 서사)/
`continentSection`/`weatherSysSection`/`hiddenJobSection`/
`companionSysSection`은 표본 점검 결과 순수 인라인 로직(외부 함수
호출 없이 `char`/`S` 상태만 읽음)이거나 buildLightSystem의 기존
콘텐츠와 개념적으로 겹칠 위험이 있어 이번엔 보류했다.

최종적으로 정말 마지막까지 "이 죽은 함수 하나에서만 호출되는" 이름은
**`SEAL_DEFINITIONS`(_sealStoneSection, 대륙별 봉인석 위치/상태/
단서/세계 영향), `checkJobSynergy`(synergySysSection, 전생 직업+
현재 직업 조합 시너지), `getVillainStatus`(villainSysSection, 성장형
악당의 위협도가 임계치를 넘으면 세계 잠식 묘사 지침)** 3개뿐이었다.
각각 완전히 독립된 2~3줄짜리 섹션이라 하나의 작은 함수
`getMiscOrphanSection()`으로 묶어 구출하고 misc/330에 등록했다.

헤드리스 검증: 함수 자체 호출 시 에러 없음(신규 캐릭터라 3개 조건
모두 미충족 → 빈 문자열, 정상), `buildLightSystem()` 전체 실행도
정상. 기존 전체 회귀 스위트(18차, 소문 패널, 루프사이클, 명예의
전당, 전생의 기억, 7종족 서사 힌트, 세계 역사 뼈대, 전생 유산
124블록, v48 저장 데이터 확장 18섹션) 전부 재통과, 콘솔 에러 0건.

**ai-prompt/077 감사 완료 선언**: 이 파일의 dead `buildSystem`
(2,333줄)에서 총 **4차례에 걸쳐 149개의 완전히 다른 orphaned
narrative 함수**(getRaceSpecialHint 체인 7종족 + getPastLifeLegacySection
124블록/113함수 + getSavedStateExpansionSection 18섹션 + getMiscOrphanSection
3섹션)를 구출했다. buildSystem 자체는 여전히 코드로 남아있지만(제거는
하지 않음 — 죽은 채로 둬도 무해하고, 혹시 남은 참조가 있을 위험을
피하기 위해), 그 안에 갇혀있던 실질적으로 "쓸만한" 모든 서사 힌트는
이제 buildLightSystem을 통해 매턴 AI에게 전달된다. ai-prompt/077에
대한 이번 라운드 감사는 여기서 완료로 간주한다.

## 19차(계속) — ui/ 디렉토리 감사 완료 (19/19)

이전 라운드들에서 이미 확인된 025(ELF_MEMORY_KEY 수정)/026/097/155
(6개 죽은 훅 수정, 59번 작업)/181(65번 작업)/196/201/231/252/283/291
(65번 작업)을 제외하고, 이번에 나머지 8개 파일을 확인했다.

| 파일 | 판정 | 비고 |
|---|---|---|
| ui/098 (패널 탭 등록) | 이미 수정됨 | quest/086의 renderPanel switch에 'religion' 케이스 직접 추가로 이미 해결된 설명 주석만 남음 |
| ui/138 (가문·세력 UI) | 정상 | renderClanPanel이 openP 훅 + 동적 메뉴 버튼 생성으로 정상 연결 |
| ui/154 (buildLightSystem 최적화) | 정상 | getBetrayalBLS/getLoopWorldBLS를 orig.call로 정상 래핑(getLoopWorldBLS가 ai-prompt/152에도 조건부로 포함돼 있어 상황에 따라 약간의 중복 가능하나 무해) |
| ui/193 (패널 케이스+버튼 연결) | 정상 | 5개 패널(타임라인/배틀로그/세력/경제/나비효과) 모두 openP 훅으로 정상 연결, hookTimelineAutoRecord는 무해한 미완성 스텁 |
| ui/232 (레벨업 연출) | 정상 | dramaticLevelUp이 misc/009에서 실제로 매 레벨업마다 호출됨. showLevelUpScreen 별칭 자체는 아무도 안 쓰지만 무해(실함수는 원래 이름으로 정상 작동) |
| ui/234 (스탯 스파크라인) | 정상 | recordStatSnapshot이 items/189·core/244 매턴 훅에서 호출, renderStats 래핑도 정상 |
| ui/242 (모바일 스와이프) | 정상 | 순수 이벤트 리스너, 이미 기록된 제거 결정(빠른 행동 단축바) 확인 |
| ui/296 (AI설정+eruda 토글) | 정상 | toggleEruda/isErudaEnabled 모두 misc/298의 renderAISettings에서 실사용 |

**사소한 미해결 발견 2건(기록만, 수정 안 함)**: ui/025의
`elfSealMemory(label)`(특정 기억에 라벨을 붙여 "봉인된 기억" 목록에
저장 — 같은 파일의 패널이 이 목록을 표시하는 코드까지 이미 있음)와
ui/155의 `enterDungeon(name, floors, theme)`(층별 던전 탐험 상태를
초기화하는 함수, dungeon_floor GS 필드와 짝을 이루도록 설계됨)는
둘 다 실제 함수·저장 로직·표시 로직까지 전부 완성돼 있지만, "언제
이 함수를 호출할지" 트리거 지점 자체가 어디에도 없다. `elf_forget`
GS 필드는 완전히 다른 데이터 저장소(loadElfMemory)를 쓰는 별개
함수(triggerElfForgetting)로 이어지고, 던전 진입은 실제로는 훨씬
가벼운 방식(장소 type/이름 패턴 매칭으로 HP 재생만 감소)으로 처리되고
있어, 이 두 함수를 실제로 연결하려면 "언제·어떤 조건으로 발동시킬지"
새로운 GS 필드나 트리거 설계가 필요하다 — 기존 조각을 다시 잇는
수준을 넘어서는 신규 설계 결정이라 이번 라운드에서는 손대지 않고
기록만 남긴다.

---

## 19차(계속) — lore/ 디렉토리 착수, 개인 기억(PM) 감정 기록이 죽은
필드를 읽던 활성 버그 1건 발견·수정

`lore/274-개인-기억-파트-업데이트.js`의 `pmDetectPersonalFromText(aiText)`가
AI 서술 텍스트에서 부상/트라우마/후회/목표/흉터/스킬 습득과 함께
"감정" 항목도 개인 기억(PM)에 기록하도록 돼 있는데, 감정 판별 조건이

```js
var curEmotion = typeof S !== 'undefined' ? S._emotion : '';
if (curEmotion && curEmotion !== 'neutral') { ... }
```

였다. 전체 코드베이스를 추적한 결과 `S._emotion`은 전투 종료 시
`quest/086:3208`에서 `'neutral'`로 리셋되는 것 외에는 게임 어디에서도
갱신되지 않는 죽은 필드였다(저장/로드 시 그대로 왕복만 함,
`misc/001:79,84,224`). 실제 감정 추적은 완전히 별도의 저장소인
`loadEmotion()`/`saveEmotion()`(`misc/001-block0-preamble.js`)이
전담하고 있으며, `quest/086:3666`에서 AI 서술에 따라 실제로 갱신되고
`quest/086:3473,3763`·`items/189:38`에서 읽힌다. 즉 이 조건은 사실상
영원히 거짓이라(전투 종료 후에는 항상 `'neutral'`, 그 외엔 항상
`undefined`) 게임 출시 이후 감정 기반 개인 기억이 단 한 번도 기록된
적이 없었다.

**수정**: `misc/001-block0-preamble.js`의 `loadEmotion`을 import하고,
죽은 `S._emotion` 대신 실제 라이브 감정 상태를 읽도록 교체.

```js
var curEmotionObj = typeof loadEmotion === 'function' ? loadEmotion() : null;
var curEmotion = curEmotionObj ? (curEmotionObj.label || curEmotionObj.id || '') : '';
```

**검증**: `node --check` 통과 → `node build.js` 정상 리빌드 →
Playwright 헤드리스 테스트(`pw_pmemotion_test.js`)로 캐릭터 생성 후
`localStorage`에 실제 감정 데이터(`{id:'fear', label:'공포'}`)를
주입하고 `pmDetectPersonalFromText()`를 직접 호출 — 수정 전에는
`emotionHistory`가 0에서 전혀 늘지 않았을 조건이, 수정 후 0 → 1로
정상 증가하고 `emotion:'공포'` 항목이 실제로 기록됨을 확인. 기존
Playwright 회귀 테스트 11개 파일 전체 재실행, 콘솔 에러 없이 전부
통과.

| 파일 | 판정 | 조치 |
|---|---|---|
| lore/274 (개인 기억 파트 업데이트) | 활성 버그 발견 | S._emotion(죽은 필드) → loadEmotion()(실제 라이브 상태)로 교체 |
| lore/157 (예언 성취 추적 시스템) | 정상 | getProphecyBLS/addProphecy가 npc/158에서 정상 호출(65번 작업에서 이미 확인) |
| lore/301 (예언운명 시스템) | 정상 | generateProphecy는 lore/309의 MutationObserver로 게임 시작 시 자동 호출, renderProphecyPanel은 quest/086의 case 'prophecy'로 정상 연결. fulfillProphecy 이중 시그니처·animProphecyGlow 버그는 이전 라운드에 이미 수정됨(주석 확인) |
| lore/309 (게임 시작 시 예언 자동 생성 훅) | 정상 | 화면 전환 MutationObserver로 generateProphecy 트리거, 로컬 조합 방식 전환 후 재활성화됨(주석 확인) |
| lore/312 (서약 시스템) | 정상 | getOathBLSHint가 ai-prompt/319의 BLS 통합 래퍼에 정상 연결, renderOathPanel은 quest/086의 case 'oath'로 정상 연결 |
| lore/316 (심층 트라우마 시스템) | 정상 | AI 우선·로컬 폴백(tryCloudThenLocalModelThenBank) 정상 구현, getTraumaDeepBLS가 ai-prompt/319에 정상 연결, renderTraumaDeepPanel은 quest/086의 case 'trauma-deep'으로 정상 연결 |

**lore/ 디렉토리 감사 완료 (6/6)**: 활성 버그 1건(lore/274) 수정, 나머지 5개 파일 전부 정상 확인.

---

## 19차(계속) — patches/ 디렉토리 감사, `getPrisonerBLS`/`getVampireCharonicleBLS`가
bare 식별자라 한 번도 AI 서사에 전달되지 못하던 활성 버그 2건 발견·수정

patches/183·184·223·224·297·299는 이전 라운드에서 이미 확인/수정됨(각각
onclick 함수 정의, processGSToAllDBs 훅 체인, buildLightSystem GS규칙
안내, loadStatusEffects 배열강제 버그, 애니메이션 트리거)을 재확인하고,
`patches/322-...10가지-시스템.js`(648줄, v58)를 전체 정독하며 발견한
버그:

이 파일의 `wrapBLSV58()`(파일 하단, buildLightSystem 래핑부)가

```js
try{if(typeof getPrisonerBLS==='function'){const h=getPrisonerBLS();if(h)r+=h;}}catch(e){}
try{if(typeof getVampireCharonicleBLS==='function'){const h=getVampireCharonicleBLS();if(h)r+=h;}}catch(e){}
```

로 두 함수를 **bare 식별자**로 참조하고 있었다. 그런데:
- `getPrisonerBLS()`(포로 상태·심문/회유 힌트, 실제 정의: `ai-prompt/148`
  의 `__tfDeferred_129` 안에 중첩된 `processGSBlock(gs)` 함수 내부 —
  `window.getPrisonerBLS = getPrisonerBLS;`)
- `getVampireChronicleBS()`(피의 연대기 — 흡혈 기록/공포 등급/단계,
  실제 정의: `progression/020`, `window.getVampireCharonicleBLS =
  getVampireChronicleBS;`로 노출)

둘 다 **다른 모듈에서 `window.X`로만 노출돼 있어**, ES 모듈 스코프가
분리된 patches/322에서는 이 bare 식별자가 절대 resolve되지 않는다
(`typeof` 자체는 에러 없이 조용히 `'undefined'`를 반환하므로 콘솔에
아무 흔적도 안 남는다). 즉 두 함수 모두 완성돼 있고 실제 데이터도
정상 축적되고 있었지만, AI 서사 프롬프트(BLS)에는 **단 한 번도**
전달된 적이 없었다 — 이전 라운드에 이미 고쳤던 `animBossRoom`/
`animProphecyGlow`의 bare 식별자 버그와 정확히 같은 유형.

**수정**: 두 호출 모두 `window.getPrisonerBLS()`/
`window.getVampireCharonicleBLS()`로 교정.

**헤드리스 검증**: `window.processGSBlock({})`을 1회 호출해 중첩
함수들이 `window`에 노출되는 시점을 재현한 뒤, `tf-prisoners`에 포로
1명을 주입하고 `buildLightSystem()`을 호출 — 수정 전에는 반환 문자열에
포로 관련 텍스트가 전혀 없었을 것이, 수정 후 `"[⛓️ 보유 포로(1명)]
테스트 포로(용병·적대 세력·상태:저항) — ..."` 문구가 정확히 포함됨을
확인. 최종 회귀(`pw_final_regression.js`, `pw_18th_regression.js`)
전부 통과, 콘솔 에러 없음.

**같은 파일에서 발견했으나 고치지 않은 구조적 공백(기록만)**:
`checkSeasonEvents()`/`renderSeasonEventsPanel()`(계절 이벤트 시스템)과
`world/306`(세계 달력 시스템) 전체가 `loadGameTime()`(day/season/year
객체 반환을 기대)에 의존하는데, 코드베이스 전체를 뒤져도 이
`{day,season,year}` 형태를 실제로 **저장(write)하는 곳이 어디에도
없다** — `patches/224`의 `loadGameTime` 스텁은 `localStorage['tf-
gametime']`을 읽기만 할 뿐 아무도 그 키에 쓰지 않아 항상 `null`을
반환하고, `S.gameTime`은 이름만 비슷한 완전히 다른 용도의 증가
카운터(숫자)다. 이건 단순 bare-식별자 연결 오류가 아니라 애초에
"실제 날짜가 며칠째 흐르고 있는지"를 추적하는 시스템 자체가 존재하지
않는 것이라, 고치려면 턴 수 기반 날짜 진행 로직을 새로 설계해야 하는
신규 기능 개발에 해당한다 — 기존 조각을 다시 잇는 수준을 넘어서므로
`elfSealMemory`/`enterDungeon`과 같은 이유로 이번 라운드에서는 기록만
남기고 손대지 않는다.

| 파일 | 판정 | 조치 |
|---|---|---|
| patches/183 (v49 ⑥ onclick 미정의 함수들) | 정상(재확인) | clearAllGameData/doReset/doCycleOnlyReset/doFactoryReset/toggleTheme/toggleGrp/closeGrp/openKeyPanel/openWandererMemoryModal 전부 정상 window 노출 |
| patches/184 (v49 ⑧⑨⑩⑪ 나머지 수정) | 정상(재확인) | processGSToAllDBs 3중 래핑 체인이 combat/150(원본 정의)보다 뒤에 로드됨을 main.js import 순서로 확인, buildLightSystem GS안내 확장도 setTimeout 폴링으로 안전 |
| patches/223 (GS 규칙 추가 BUG2 FIX) | 정상(재확인) | setTimeout 폴링 기반 buildLightSystem 래핑, 이미 2611행에서 검증됨 |
| patches/224 (v51-2 누락 함수/상수 보완) | 이미 수정됨 | loadStatusEffects 배열강제 래퍼 버그는 59번 작업에서 이미 제거·확인 |
| patches/297 (애니메이션 트리거 v57) | 정상(재확인) | 전 함수가 misc/298의 `__tfDeferred_268`(모든 모듈 로드 후 실행)에서 정상 훅 연결 확인 |
| patches/299 (플레이 통계 성향 분석) | 이미 수정됨 | `_origUpdateStats` 캡처 위치 버그는 이전 라운드에 이미 수정 확인 |
| patches/322 (v58 매판 10가지 시스템) | **활성 버그 발견·수정** | getPrisonerBLS/getVampireCharonicleBLS bare 식별자 → window.X로 교정. 계절/달력 시스템(loadGameTime 실체 부재)은 신규 설계 필요로 기록만 |

---

## 19차(계속·최종) — utils.js/main.js 감사 완료, 420개 전체 파일 감사 종료

**utils.js(177줄)**: `lsGet`/`lsSet`/`lsDel`(localStorage 실패 시 메모리
폴백)/`$`/`esc`/`toast`/`dbGet`/`dbSet`/`BLOCKING_POPUP_IDS` 전부 정상.
이미 두 건의 버그 수정 이력이 주석으로 남아있음을 확인:
1. **BUG23**: `lsSet`의 `QuotaExceededError` 등 저장 실패 감지·알림
2. **팝업 충돌 포괄 수정**: 화면 전체를 덮는 팝업(퀘스트 수락/전직
   제안/돌발 이벤트/레벨업 연출 등 27곳 이상)이 같은 턴에 동시에 뜨는
   문제를 `document.body.appendChild` 자체를 감싸 큐잉하는 방식으로
   근본 해결(`installOverlayStackGuard`) — 새로 추가되는 팝업까지
   자동으로 커버되는 범용 가드라 개별 검증 불필요.

**main.js(497줄)**: 420개 파일을 원본 실행 순서대로 import하는
자동생성 진입점 + 배포 함수(`__tfDeferred_N`) 일괄 실행부
(497행 forEach)로만 구성. 이 배포 함수 디스패치 메커니즘 자체가
깨지면 그 안에 든 모든 훅이 조용히 죽어버리는 만큼(이번 세션에서
발견한 다수의 "bare 식별자"/"모듈 스코프 분리" 버그들이 전부 이
패턴과 연관), 스크립트로 전수 검증:
- `export function __tfDeferred_N` 형태로 정의된 함수 70개를
  전체 코드베이스에서 grep
- main.js의 497행 배열과 1:1 대조
- **결과: 70/70 완전 일치 — 정의됐지만 호출 안 된 것, 호출은 되는데
  정의 안 된 것 모두 0건.** 배포 함수 디스패치 자체는 완전함.

**420개 전체 파일 감사 완료 선언**: 이번 세션(19차)에서
world→npc→job→items→progression→race→religion→summon/combat→
ai-prompt→ui→lore→patches→utils.js/main.js 순으로 전체를 훑었고,
이전 라운드(1~18차)에서 core/data/economy/quest/misc 등 나머지
디렉토리를 이미 완료했다. **표준 420개 소스 파일 전체가 최소 한 번은
직접 열람·검토되었다.**

| 파일 | 판정 | 조치 |
|---|---|---|
| utils.js | 정상 | lsGet/lsSet/lsDel/toast/dbGet/dbSet/팝업 충돌 가드 전부 이미 버그수정 완료된 상태로 확인 |
| main.js | 정상(스크립트 전수검증) | __tfDeferred_N 정의 70개 vs main.js 호출 70개, 1:1 완전 일치 확인 |

---

## 20차 — ★ 사용자 실전 플레이 제보로 발견: HP가 0 이하로 절대
떨어지지 않아 사망(회차 루프)이 영원히 발동하지 않던 치명적 버그

사용자가 실제 플레이 중 "-8, -7 이런 식으로 데미지를 입다가 체력이
1이 되면 그때부터는 데미지를 전혀 안 입고 대화만 계속 진행된다"고
제보. API 키 없이 플레이 중이었지만, 조사 결과 이 버그는 **API
사용 여부와 무관하게 클라우드/로컬모델/완전 로컬 서사 세 경로 전부에
공통으로 적용되는 매 턴 후처리 코드(`quest/086`의 `sendMsg`)**에
있었다.

**근본 원인**: `sendMsg` 안에서 AI(또는 로컬 폴백) 텍스트에서 "HP-N"
패턴을 파싱해 데미지를 적용하는 코드(`S.stats.hp=Math.max(0, ...)`)는
정확히 0까지 깎이도록 이미 올바르게 작성돼 있었다. 문제는 그 **바로
다음에 매 턴 무조건 실행되는 "HP 자연 재생" 블록**이었다:

```js
const _hpPct = (S.stats.hp||100) / (S.stats.maxHp||100);
if(_hpPct <= 0.3) _regenMult *= 1.5;   // "위기에서 버티는 맛" 보너스
...
if(_finalRegen > 0) S.stats.hp = Math.min(max, S.stats.hp + _finalRegen);
```

방금 치명타로 HP가 정확히 0이 된 바로 그 순간에도 `_hpPct`는 0이라
`<=0.3` 조건을 항상 만족해 재생 1.5배 보너스가 그대로 적용됐다. 그
결과 데미지 파싱으로 정확히 0까지 떨어졌던 HP가, 사망 판정
(`triggerLoopIfDead()` → `checkLoopCondition()`: `S.stats.hp<=0`)이
실행되기도 **전에** 재생으로 다시 1~2 이상으로 복구돼버려 — `hp<=0`
조건이 그 이후로는 절대 참이 될 수 없었다. 몬스터 무리와의 전투처럼
`S._inCombat=true`가 명시적으로 설정되는 상황(재생 0.5배 페널티 적용)
에서는 상대적으로 덜 두드러지지만, 사용자가 실제로 겪은 것처럼
`S._inCombat`이 켜지지 않는 일반 위험 서사(NPC 대치, 잠입, 대담한
접근 선택지 등 대화형 긴장 상황)에서는 재생 페널티가 전혀 없어 이
버그가 거의 매번 발동했다.

**수정**: HP 감소 파싱이 전부 끝난 직후, "HP 재생" 블록이 실행되기
**전에** `S.stats.hp<=0`이면 즉시 `triggerLoopIfDead()`를 먼저
호출하도록 한 줄 추가(`quest/086`, 체력 한글 증감 파싱 직후). 기존에
재생 블록 이후 있던 동일 호출은 `triggerLoopIfDead()` 내부의 중복
실행 방지 가드(`window._loopDeathTriggered`)로 인해 안전하게 공존—
이번 수정으로 죽었어야 할 타격을 재생이 끼어들기 전에 먼저 정확히
포착하게 됐다.

**헤드리스 검증(회귀 재현 포함)**: `window.callAI`를 가로채 확정적으로
`"HP-9"` 텍스트를 반환하도록 만들고, HP=9·재생 스탯을 크게 설정한
상태에서 `sendMsg()`를 직접 호출.
- **수정 전 코드로 재현**: HP가 9→0(치명타)→2(재생)로 조용히
  회복되며 `.death-deal-modal`(사망 시 뜨는 "죽음과의 거래" 모달)이
  **전혀 뜨지 않음** — 사용자가 겪은 증상과 정확히 일치.
- **수정 후**: 같은 시나리오에서 `.death-deal-modal`이 정상적으로
  나타남을 확인(재생 자체는 여전히 발생해 화면상 HP는 낮게나마
  남아있지만, 사망 처리는 이미 올바르게 시작된 상태).
- 최종 회귀(`pw_final_regression.js`, `pw_18th_regression.js`) 전부
  통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| quest/086 (sendMsg 매 턴 후처리) | **치명적 활성 버그 발견·수정** | HP 자연재생이 사망판정보다 먼저 실행돼 hp가 0 밑으로 절대 안 내려가던 문제 — 재생 실행 전에 사망판정을 먼저 수행하도록 순서 수정 |

---

## 20차(계속) — ★ 사용자가 "이거 정적으로도 잡을 수 있던 거 아니냐"고
재확인 요청 → 같은 파일을 더 깊이 재조사, 훨씬 근본적인 2번째 사망판정
공백 추가 발견·수정

사용자 지적이 정확했다 — 위 재생 버그는 실전 플레이가 아니어도 실행
순서만 따라갔으면 찾을 수 있는 정적 버그였다. 그 반성으로 quest/086의
`sendMsg` 전체에서 "HP를 건드리는 모든 지점"과 "사망 판정 지점"의
선후 관계를 처음부터 다시 전수 대조했고, 그 과정에서 **1번째 버그보다
더 근본적인 두 번째 사망판정 공백**을 발견했다.

**근본 원인**: `sendMsg`에는 데미지가 들어오는 경로가 두 가지다 —
① AI 응답 본문에 섞여 나오는 "HP-N" 자유 텍스트를 정규식으로 파싱하는
경로(1974행 부근), ② AI에게 정식으로 지시하는 `_GS_RULE` 프롬프트가
원래 의도한 표준 경로, 즉 `<gs>{"stats":{"hp":-N}}</gs>` JSON을
`processGSBlock(gs)`가 파싱해 적용하는 경로(2120행 부근, `const
gsMatch = cleanText.match(/<gs>.../)`부터 시작). 그런데 **기존에 있던
두 사망판정 호출(재생 전 1974행, 재생 후 2057행) 모두 이 JSON 파싱
지점(2120행)보다 훨씬 앞에서 실행된다.** 즉 AI(또는 로컬 모델)가 본문에
"HP-9" 같은 문구를 굳이 쓰지 않고, 원래 지시받은 대로 `<gs>` JSON
필드로만 데미지를 정직하게 보고한 턴에는 — **HP가 정확히 0까지 깎여도
사망 판정 자체가 단 한 번도 실행되지 않는다.** 1번째 버그(재생이
판정을 가림)와 달리 이쪽은 재생조차 필요 없다 — 애초에 판정 코드가
이 데미지 적용 시점 자체를 본 적이 없었다.

**수정**: `processGSBlock(gs)` 호출 직후에도 `S.stats.hp<=0`이면
`triggerLoopIfDead()`를 호출하도록 추가(`_gsSucceeded=true` 설정 직후).
기존 두 호출은 그대로 유지 — `triggerLoopIfDead()`의 중복 실행 방지
가드 덕에 세 지점이 안전하게 공존한다.

**헤드리스 검증(2가지 경로 각각 독립적으로 재현)**:
- **GS-JSON 경로만 단독 테스트**: `window.callAI`가 본문에 "HP-N" 문구
  없이 `<gs>{"stats":{"hp":-9}}</gs>` JSON만 반환하도록 가로채고
  HP=9로 세팅 → **수정 전**: HP는 정확히 0까지 깎이는데도
  `.death-deal-modal`이 **전혀 뜨지 않음**(사망판정 자체가 이 경로를
  못 봄, 재현 확인) → **수정 후**: HP=0에 정상적으로 모달이 뜸.
- **1번째 버그(재생-경합) 경로 재검증**: 본문 "HP-9" 텍스트 + 높은
  regen 스탯 조합으로 다시 테스트 — 여전히 정상 작동(HP는 재생으로
  2까지 회복되지만 사망 모달은 정상적으로 뜸), 두 수정이 서로 간섭하지
  않음을 확인.
- 최종 회귀(`pw_final_regression.js`, `pw_18th_regression.js`) 전부
  통과, 콘솔 에러 없음.

**교훈**: 1번째 재생 버그를 처음 "실전 플레이로만 잡을 수 있었다"고
설명한 건 부정확한 진단이었다. 두 버그 모두 실제로는 "여러 정상 코드
조각이 개별로는 문제없지만 실행 순서/커버리지가 어긋나 상호작용에서
문제가 생기는" 유형이었고, 이런 유형은 파일 단위 "죽은 코드 확인" 방식
전수조사로는 안 걸리고, 특정 시나리오(사망 등)를 처음부터 끝까지 손으로
추적해야만 걸린다는 걸 이번에 재확인했다.

| 파일 | 판정 | 조치 |
|---|---|---|
| quest/086 (sendMsg — GS-JSON 데미지 경로) | **치명적 활성 버그 발견·수정 (2탄)** | AI가 `<gs>{"stats":{"hp":-N}}</gs>` 정식 JSON 경로로만 데미지를 보고하면 두 사망판정 모두 이보다 먼저 실행돼 사망이 전혀 감지 안 되던 문제 — processGSBlock(gs) 직후에도 사망판정 추가 |

---

## 20차(계속·3탄) — 사용자 지시로 quest/086을 실제로 처음부터 끝까지
한 줄씩 재추적 → HP/MP/스탯/골드가 서사와 GS-JSON 두 경로에서 동시에
보고되면 **정확히 두 배로 적용**되던 활성 버그 발견·수정

파일 맨 위(1번째 줄)부터 순서대로 다시 읽어 내려가며 "자원을 건드리는
모든 지점"을 전부 나열하던 중, `sendMsg` 안에 있는 두 개의 **완전히
독립적인 데미지 적용 경로**를 발견했다:

1. **본문 자유 텍스트 정규식 파싱** (`text.matchAll(/HP\s*[-–]\s*(\d+)/gi)`
   등, 1935행 부근) — AI가 서사에 "HP-9"처럼 직접 숫자를 적으면 그걸
   정규식으로 긁어 적용. `_GS_RULE`(JSON 방식) 도입 **이전부터 있던**
   구식 경로로 추정됨.
2. **정식 `<gs>{"stats":{"hp":-9}}</gs>` JSON 파싱** (`processGSBlock`,
   2130행 부근) — `_GS_RULE` 프롬프트가 AI에게 명시적으로 지시하는
   정식 채널.

문제는 이 프롬프트가 "서사로 묘사한 뒤 JSON을 출력하라"고만 지시할 뿐
**"서사에 숫자를 직접 쓰지 말라"는 말은 없다** — 즉 AI가 지시를 충실히
따라 "칼날이 스치며 HP-9의 피해를 입는다"처럼 서사에도 숫자를 적고
`<gs>`에도 `{"stats":{"hp":-9}}`로 정직하게 보고하면, 두 경로가 서로의
존재를 전혀 모른 채 **각각 -9씩, 합계 -18**을 적용해버린다. HP/MP뿐
아니라 STR/AGI 등 능력치 14종, 골드까지 전부 같은 구조로 이중 파싱
코드가 있어 전부 같은 위험에 노출돼 있었다.

**헤드리스 재현**: `window.callAI`가 "HP-9" 서사 + `<gs>{"stats":
{"hp":-9}}</gs>`를 동시에 반환하도록 가로채고 HP=50에서 턴 진행 →
**수정 전: 50→32 (18 감소, 정확히 2배)** 확인. 골드도 동일 패턴으로
재현: 100골드 상태에서 "골드+20" 서사 + `<gs>{"gold":20}</gs>`를 동시에
보내면 120이 아니라 140이 되는 것까지 확인.

**수정**: `text=await window.callAI(...)` 직후, 정규식 파싱들이 시작되기
전에 `<gs>` 블록을 먼저 한 번 살짝 들여다봐서(peek) `stats`/`gold`
객체를 뽑아두고 — 이후 HP-/HP+/MP-/MP+/체력(한글)/STR·AGI 등 14개
스탯/골드+/골드- 정규식 적용 지점 **전부**에 "`<gs>`가 이미 이 필드를
보고했다면 정규식 폴백은 건너뛴다" 가드를 추가했다. `<gs>`를 유일한
정답으로 우선시하고, 정규식 경로는 `<gs>`가 없거나 그 필드를 언급하지
않은 턴(로컬 템플릿 서사 등)에서만 동작하는 폴백으로 격하시켰다.

**검증**: 4가지 시나리오 모두 재확인 — ① 서사 텍스트만 있을 때(HP-9만,
`<gs>` 없음) 정규식 경로 정상 동작(-9), ② `<gs>`만 있을 때 정상 동작
(-9), ③ 둘 다 있을 때 이제 -9로 정확히 한 번만 적용, ④ 1·2탄에서 고친
두 사망판정 경로(재생-경합, GS-전용 데미지) 모두 이 3탄 수정 이후에도
정상 작동. 골드도 둘 다 있을 때 120으로 정확히 한 번만 적용됨을 저장소
값까지 확인. 최종 회귀(`pw_final_regression.js`, `pw_18th_regression.js`)
전부 통과, 콘솔 에러 없음.

**부수 관찰(기록만, 조치 안 함)**: 이 과정에서 `processGSBlock`의 골드
처리가 `S.gold`(메모리)가 아니라 `loadGold()`(저장소)를 델타의 기준값
으로 삼는다는 걸 확인했다 — 현재 코드베이스의 모든 골드 변경 지점이
매번 `saveGold(S.gold)`로 즉시 동기화하고 있어 지금은 실제로 어긋나는
경로를 찾지 못했지만, 앞으로 골드를 저장 없이 메모리에서만 바꾸는
코드가 추가되면 같은 유형(재생-사망판정 경합과 동일한 "메모리 vs
저장소 시점 불일치")의 버그가 재발할 수 있는 구조적 약점으로 남겨둔다.

| 파일 | 판정 | 조치 |
|---|---|---|
| quest/086 (sendMsg — 정규식 vs GS-JSON 이중 파싱) | **치명적 활성 버그 발견·수정 (3탄)** | HP/MP/14종 스탯/골드 전부 서사+GS-JSON 동시 보고 시 정확히 2배 적용되던 문제 — GS-JSON이 이미 보고한 필드는 정규식 폴백을 건너뛰도록 전체 수정 |

---

## 20차(계속·4~5탄) — 계속 처음부터 끝까지 추적하며 두 건 더 발견:
"도망 실패 페널티"가 이미 확정된 사망을 되살리던 문제(4탄), 그리고
훨씬 근본적인 **완전히 별개인 두 개의 사망 처리 시스템이 동시에
발동해 화면이 겹쳐 보이던 구조적 버그(5탄)**

**4탄**: `_fleeFailed`(도망 시도가 주사위 판정에 실패했을 때) 블록이
`S.stats.hp = Math.max(1, ...)`로 최저 1을 보장하도록 돼 있는데, 이건
"도망 실패 자체만으로는 안 죽는다"는 의도된 설계다. 문제는 같은 턴에
이미 다른 경로(서사/GS)로 치명타를 맞아 hp가 정확히 0까지 떨어지고
1·2탄에서 고친 사망판정까지 이미 끝난 뒤였다면, 이 코드가 무조건
실행되면서 "죽은 채로 둬야 할" hp를 다시 1로 되살려버린다 — 1·2탄과
완전히 같은 유형의 버그. hp가 이미 0 이하(=이미 죽은 상태)면 이
페널티 자체를 건너뛰도록 조건에 `S.stats.hp > 0`을 추가했다.

**5탄(이번 라운드 최대 발견)**: 계속 추적하다 `sendMsg` 맨 아래쪽에서
**1~3탄에서 고쳐온 것과는 완전히 별개인, 독자적인 "HP 0 → 게임오버"
블록**을 발견했다(`(S.stats.hp||0)<=0` 체크 후 `showGameOver({type:
'death'})` 호출). 이건 `triggerLoopIfDead()`(회차 루프 시스템,
`progression/220`)와 **서로의 존재를 전혀 모르는 두 번째 독립된 사망
처리 시스템**이었다:

- `triggerLoopIfDead()` 경로: 불사 패시브로 되살리거나, "죽음과의 거래"
  모달을 띄워 플레이어 응답을 기다리거나, 거래 없이 곧장
  `_proceedToDeathAfterDealDeclined()`를 호출해 각종 계승 기록(사망
  원인/유언/저주 계보 등)을 남긴 뒤 **자체적으로** 토스트 + 2.5초 후
  `showReincScreen()`으로 자동 이동한다.
- `sendMsg` 맨 아래 블록: 완전히 별도로 `showGameOver({type:'death'})`
  (죽음 오버레이 UI, "환생" 버튼 포함)를 띄우고, 사망 횟수 통계·업적·
  플레이시간 기록·경비병 조우 시 체포 처리 같은 **이 시스템만의 고유
  기능**도 수행한다.

두 시스템 모두 quest/086/progression/220에 예전부터 각자
"[BUG6 FIX]"(사망판정 훅 연결)와 "[19차 감사 FIX]"(handleDeath 죽은
호출 수정) 주석과 함께 이미 존재해왔다 — 즉 어느 한쪽이 이번에 새로
생긴 게 아니라, **누군가 회차 루프 시스템을 나중에 추가하면서 예전의
game-over 블록을 제거/연동하지 않고 그대로 남겨둔 것**으로 보인다.
이 둘의 충돌은 지금까지는 잘 안 드러났는데, 이유는 `triggerLoopIfDead`
쪽이 1·2탄 버그(재생 경합, GS경로 사각지대) 때문에 **거의 발동한 적이
없었기** 때문이다 — 이번 세션에서 1~3탄 버그를 고쳐 사망판정이
비로소 매번 제대로 작동하기 시작하면서, 이 잠재돼있던 충돌이 이제
사실상 사망마다 드러나게 됐다.

**헤드리스 재현**: HP=9에서 치명타(-9)를 맞는 턴을 시뮬레이션 →
**수정 전**: `.death-deal-modal`과 `#go-overlay`(게임오버 화면)가
**동시에 열림**을 확인 — 죽음과의 거래 모달 위에 전체화면 게임오버
오버레이가 겹쳐 뜨는 상태. "죽음과의 거래" 자체가 이미 소진된
캐릭터(사신에게 7회 이상 거래해 `debtCollected=true`)로도 재현: 이
경우엔 모달 없이 `_proceedToDeathAfterDealDeclined()`가 직접 실행돼
`window._loopDeathTriggered=true`가 되는데, 이때도 마찬가지로
`#go-overlay`가 동시에 열려버림을 확인.

**수정**: `sendMsg`의 구식 game-over 블록 진입 조건에
`!(document.querySelector('.death-deal-modal') ||
window._loopDeathTriggered)`를 추가 — 회차 루프 시스템이 이미 이번
사망을 처리 중(모달 대기 중이거나 처리 완료)이면 구식 블록은 완전히
건너뛴다. 회차 루프 시스템의 두 경로 모두에서 커버되지 않는(즉 아직
알려지지 않은 제3의 경로로 hp가 0이 되는) 극히 드문 경우를 위한
백스톱 역할은 그대로 유지된다.

**검증**: 두 경로(거래 모달 표시 중 / 거래 소진 후 직행) 각각에서
수정 후 `#go-overlay`가 더 이상 뜨지 않음을 확인. 최종 회귀
(`pw_final_regression.js`, `pw_18th_regression.js`) 전부 통과, 콘솔
에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| quest/086 (탈출 실패 페널티) | **활성 버그 발견·수정 (4탄)** | 이미 확정된 사망(hp<=0)에도 도망 실패 페널티가 무조건 hp를 1로 되살리던 문제 — hp>0일 때만 페널티 적용하도록 수정 |
| quest/086 + progression/220 (독립된 이중 사망 처리 시스템 충돌) | **구조적 버그 발견·수정 (5탄, 이번 라운드 최대 발견)** | 회차 루프 시스템(모달/환생 자동이동)과 구식 game-over 오버레이가 서로 모른 채 동시에 발동해 화면이 겹치던 문제 — 회차 루프가 이미 처리 중이면 구식 오버레이를 건너뛰도록 수정 |

---

## 20차(계속·6탄) — 로컬 전투 엔진(misc/328)의 패배가 사망 판정을 못 받던 순서 오류

quest/086의 `sendMsg`를 완전히 다 읽은 뒤(1321~7091행 전체, 최초
읽기 시작 지점부터 파일 끝까지), "처음부터 끝까지 하나하나" 원칙에
따라 다음으로 위험도가 높은 파일인 `misc/328-block18-preamble.js`
(AI 호출 없이 로컬에서 즉시 진행되는 전투 엔진 — 서술 문장 뱅크 +
`processLocalCombatTurn`/`finishLocalCombat` 등 HP 조작 로직)를
처음부터 끝까지 읽었다.

**발견한 문제**: 이 로컬 전투 엔진은 `sendMsg` 파이프라인과
완전히 독립된 별도의 실행 경로다 — 전투 패널의 "공격/방어/도주" 버튼
클릭이 `processLocalCombatTurn`을 직접 호출하며, `sendMsg`를 거치지
않는다. 플레이어가 로컬 전투에서 패배하면(`player.hp<=0`)
`finishLocalCombat(lc, false)`가 호출되어 `S.stats.hp`를 0으로
동기화(`syncPlayerHpToGlobalStats`)하고 "전투에서 패배했다..." 토스트를
띄운 뒤 전투를 종료하지만, 정작 사망 판정(`triggerLoopIfDead`)은 이
함수 어디에도 없었다 — 그 함수는 오직 `sendMsg` 안쪽(1998/2086/2173행)
에서만 호출된다.

그 결과: 로컬 전투에서 패배한 직후에는 죽음과의 거래 모달도, 게임오버
화면도 전혀 뜨지 않고, 플레이어는 HP 0인 채로 마치 살아있는 것처럼
계속 채팅을 입력할 수 있는 상태가 된다. 사망 판정은 그 다음 채팅
메시지를 보내 `sendMsg`가 실행되고 나서야(그 안의 기존 사망 체크가
"현재 HP가 이미 0"이라는 사실을 뒤늦게 감지하고서야) 비로소 발동한다
— 최소 한 턴만큼 사망 처리가 지연되고, 그 사이 AI는 "패배했지만
멀쩡히 행동하는" 상황을 이어서 서술하게 되는 순서 오류다. 1~2탄에서
고친 "재생이 사망 판정보다 먼저 실행되는" 문제와 근본적으로 같은
계열(사망 조건 자체는 정확히 감지되는데, 그걸 처리해야 할 코드가
실행되는 시점이 늦어 결과가 어긋나는 유형)이지만, 이번엔 재생 로직이
아니라 "애초에 이 실행 경로에는 사망 판정 호출 자체가 없다"는 더
근본적인 누락이었다.

**헤드리스 재현**: 플레이어 HP=20으로 로컬 전투를 시작하고 압도적인
공격력(99999)의 몬스터를 배치 → `attack` 액션 1회 실행 → 몬스터의
반격으로 `player.hp`가 0에 도달, `finishLocalCombat(lc,false)` 실행
확인(`combatActiveAfter:false`, `hpAfterCombat:0`). **수정 전**:
`.death-deal-modal`도, `#go-overlay`도 뜨지 않고 `window._loopDeathTriggered`도
그대로 `false` — 사망 처리가 전혀 시작되지 않음을 확인. **수정 후**:
같은 시나리오에서 `finishLocalCombat` 종료 직후 즉시
`.death-deal-modal`이 뜸을 확인(재현용 캐릭터는 사신과의 거래가 아직
소진되지 않은 상태라 5탄에서 검증한 것과 동일한 "모달 우선" 경로를
탐).

**수정**: `finishLocalCombat` 끝에 `sendMsg`의 사망 체크와 동일한 패턴
(`if((S?.stats?.hp||0)<=0 && typeof window.triggerLoopIfDead==='function') window.triggerLoopIfDead();`)을
추가했다. `misc/328`은 `progression/220`을 import하지 않으므로(순환
참조 방지를 위해 이 코드베이스가 계속 써온 방식대로) `window.triggerLoopIfDead`
전역 폴백을 사용했다. `triggerLoopIfDead` 내부에 이미 있는
`window._loopDeathTriggered` 중복 실행 방지 가드 덕분에, 이후
`sendMsg` 쪽 사망 체크와 겹쳐 호출돼도 안전하다(5탄에서 검증한 것과
같은 안전장치).

**검증**: 위 재현 시나리오에서 수정 후 `.death-deal-modal`이 즉시
뜸을 확인. 이 수정이 기존 1~5탄 로직에 영향을 주지 않는지 별도로
재확인 — `sendMsg` 경로의 1탄(재생-사망 경합) 시나리오를
`.death-deal-modal` 존재 여부로 재검증한 결과 여전히 정상 작동(주:
기존 `pw_death_regen_test.js`가 쓰던 "`window.triggerLoopIfDead`를
감싸서 호출 여부 추적" 방식은, `sendMsg`가 `triggerLoopIfDead`를
`window.X`가 아니라 ES 모듈 import 바인딩으로 직접 호출하기 때문에
애초에 그 경로를 감지하지 못하는 낡은 검증 방법이었음을 이번에
확인함 — 실제 판정은 항상 `.death-deal-modal`/`#go-overlay` DOM
존재 여부로 확인하는 쪽이 정확하다). 최종 회귀
(`pw_final_regression.js`, `pw_18th_regression.js`) 전부 통과, 콘솔
에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| misc/328 (로컬 전투 엔진 패배 시 사망 판정 누락) | **구조적 버그 발견·수정 (6탄)** | `finishLocalCombat`이 패배 시 `S.stats.hp`를 0으로 만들면서도 사망 판정을 전혀 호출하지 않아, 다음 채팅 턴까지 사망 처리가 지연되던 문제 — `finishLocalCombat` 끝에 `triggerLoopIfDead()` 호출 추가 |

---

## 20차(계속) — "HP가 0에 도달하는 모든 지점" 전수 조사 (grep 기반 완전성 검증)

6탄까지는 의심 가는 파일을 하나씩 처음부터 끝까지 읽어나가는 방식으로
찾았다. 이 방식이 놓치는 파일이 없는지 스스로도 확신할 수 없었으므로,
방법을 바꿔 `S.stats.hp = ...` 형태로 플레이어 HP를 **직접 대입하는
모든 지점**을 `grep`으로 420개 파일 전체에서 찾아냈다(30개 파일,
약 40개 지점 매치). 이렇게 하면 "어느 파일을 다음에 읽을지"를 직감에
의존하지 않고, 사망 판정과 상호작용할 수 있는 코드 지점을 빠짐없이
확인할 수 있다.

각 지점을 다음 기준으로 분류했다:
- **`Math.max(1, ...)`로 자체 하한선을 둔 지점** (대다수 — 게시판
  미니게임, 던전 미니맵, 상단 원정, 결투 이벤트, 굶주림/갈증, 종족
  패널 비용 등): HP가 정확히 0에 도달할 수 없는 구조이므로 애초에
  사망 판정과 경쟁할 여지가 없다. 문제 없음.
- **`Math.max(0, ...)`로 정확히 0까지 떨어질 수 있는 지점**: 사망
  판정 호출부와의 상대적 위치를 개별 확인.
  - `quest/086`(sendMsg 내부 각 파싱 지점), `ai-prompt/148`의
    `processGSBlock`(스탯 델타 적용부·`monster_group_damage`),
    `misc/054`의 `processEnemyAttacksGS` — 전부 `sendMsg`가 실행되는
    동안 그 함수 자체 안에서, 1~3탄에서 이미 수정한 3곳의 사망
    체크(1998/2086/2173행) **이전에 도달**하거나 그 체크가 커버하는
    범위 안에 있음을 확인 — 이미 안전.
  - `ui/155`의 `tickStatusEffects('player')`(화상·중독 등 상태이상
    매턴 피해) — 호출부가 `quest/086` 1662행 단 한 곳뿐이며, 이는
    세 사망 체크보다 앞선 시점이지만 그 사이에 HP를 되살리는 코드가
    없음을 확인(재생 블록은 1998행 체크 이후에만 실행되도록 이미
    1탄에서 고정됨) — 같은 턴 안에서 정상적으로 사망 판정에 도달함.
    문제 없음.
  - `misc/327`(월드 레이드 보스전 — `misc/328`과 같은 구조의 또
    다른 독립 전투 시스템)은 **패배 시 의도적으로 HP를 15%로 되살리는
    설계**임을 코드 내 주석("HP 0인 채로 방치하면 메인 게임 루프의
    사망/체포 판정과 충돌하는 애매한 상태가 되므로...")으로 확인 —
    이 파일을 작성한 시점에 이미 지금 찾고 있는 것과 같은 종류의
    충돌을 인지하고 의도적으로 회피 설계를 해둔 사례였다. `bs.hp`
    (보스 체력)를 먼저 확인해 보스가 죽으면 즉시 반환하므로 상호
    동시사망(양쪽 다 0) 상황에서 플레이어 반격 처리 자체가 실행되지
    않는 것도 확인 — 버그 아님, 수정 불필요.

**결론**: 플레이어 HP가 정확히 0에 도달할 수 있는 코드 지점은
420개 파일을 통틀어 위 6곳(그룹)뿐이며, 6탄에서 고친 `misc/328` 외에는
전부 이미 안전하게 처리되고 있음을 grep 기반으로 전수 확인했다. 이로써
"HP 하강 → 사망 판정 시점 불일치"라는 이번 라운드의 버그 계열은 코드베이스
전체에서 더 이상 남아있지 않다고 결론 내린다(향후 새 시스템이 HP를 0으로
만드는 코드를 추가할 경우, 반드시 그 직후 `triggerLoopIfDead()`를
호출하거나 misc/327처럼 의도적으로 0 도달을 막는 설계를 택해야 한다는
패턴이 이번 조사로 명확해졌다).

---

## 20차(계속·7탄) — 방랑자 훅(window._wandererAxisHook)이 매 턴 두 번씩 실행되던 문제

사용자가 "HP뿐 아니라 순서/상호작용 버그 전체를 찾으라"고 다시 명확히
지시해, HP 한정 조사를 넘어 다른 파일들을 계속 처음부터 읽어나갔다.
`misc/251-통합-처리-함수-매-AI-응답-후-호출.js`(3238줄, "매 AI 응답 후
호출"이라는 이름 그대로 매턴 훅이 몰려있는 파일)를 읽던 중,
`tickFoodWater`·`tickWorldTimer`·`tickNearDeathPenalty`·
`checkFactionPursuit`·`tickSkillCooldowns` 등의 실제 호출부가 이 파일이
아니라 `economy/255`의 `window._wandererAxisHook` 래핑 체인 안에
있음을 발견했다.

**발견한 문제**: `quest/086`(sendMsg)에서 `window._wandererAxisHook(cleanText,
userMsg)`가 **완전히 같은 턴 안에서 두 번** 호출되고 있었다.
- 2341행: "[13차 감사 FIX]" 주석과 함께, misc/230·core/244·economy/255가
  겹겹이 감싸놓았지만 정작 아무도 실제로 호출하지 않던 이 훅을 매 턴
  실행 지점에 처음 연결한 지점.
- 2658행: `renderMsgs()` 직후, 별다른 근거 주석 없이 동일한
  `(cleanText, userMsg)` 인자로 같은 훅을 한 번 더 호출하는 지점.

두 호출 사이(2341~2658행)에 `cleanText`가 재할당되는 곳이 없음을
확인했으므로, 두 호출은 완전히 동일한 입력으로 완전히 동일한 로직을
반복 실행하는 순수한 중복이었다. 이 훅 체인에 걸려있는 모든 매턴
시스템(굶주림/갈증 및 그로 인한 HP 페널티, 둠 클락/전쟁 진행도, 빈사
카운터 누적, 스킬 쿨다운 감소, 용병단/캐러밴/농장 틱, 방랑자
혼돈/질서 축, 스탯 스냅샷, 운명 분기점 감지, 피로도 틱)가 전부 의도한
것의 정확히 2배 속도로 진행되고 있었다 — 1~6탄에서 찾은 "판정이 늦게
실행됨" 계열과는 반대로, 이번엔 "같은 판정이 두 번 실행됨"(3탄의
이중 카운팅과 같은 계열이지만, 개별 필드 하나가 아니라 매턴 시스템
전체 묶음이 통째로 중복 실행된 훨씬 큰 규모의 사례).

**헤드리스 재현**: `window._wandererAxisHook`을 감싸 호출 횟수를 세고,
식량/수분을 100으로 초기화한 뒤 평범한(전투·이동 아닌) 메시지로
`sendMsg` 1회 실행. **수정 전**: 훅 호출 횟수 2회, 식량 100→94(-6),
수분 100→92(-8) — 코드상 평상시 감소량(식량 -3, 수분 -4)의 정확히
2배. **수정 후**: 훅 호출 횟수 1회, 식량 100→97(-3), 수분 100→96(-4)
— 코드가 의도한 정확한 감소량과 일치.

**수정**: 2658행의 두 번째 호출을 제거했다. 2341행 쪽을 남긴 이유는
그쪽이 "이 훅이 어디서도 호출되지 않던 문제를 고친다"는 명확한 근거
주석과 함께 다른 매턴 감지 로직들(퀘스트/업적/종교/혈통 체크) 사이에
자연스럽게 위치해 있는 반면, 2658행 쪽은 근거 주석 없이 나중에 실수로
다시 추가된 것으로 보이는 중복이었기 때문이다.

**검증**: 위 재현 시나리오로 수정 전/후 차이를 직접 확인. 최종 회귀
(`pw_final_regression.js`, `pw_18th_regression.js`) 전부 통과, 콘솔
에러 없음. 이 수정은 사망 판정 코드(1998/2086/2173/2678행)를 전혀
건드리지 않으므로 1~6탄에서 고친 사망 순서 버그들과는 독립적이다.

| 파일 | 판정 | 조치 |
|---|---|---|
| quest/086 (`window._wandererAxisHook` 매턴 이중 호출) | **구조적 버그 발견·수정 (7탄)** | 굶주림/갈증·둠 클락·빈사 카운터·스킬 쿨다운·용병단/캐러밴/농장 틱 등 매턴 시스템 전체 묶음이 한 턴에 두 번씩 실행되던 문제 — 근거 없는 중복 호출(2658행) 제거 |

---

## 20차(계속·8탄) — 수인족 "홀로 된 자" 페널티가 매 헤더 갱신마다 무한히 누적되던 문제 (이번 세션 최고 심각도)

`race/260-수인족-패널-렌더.js`(3199줄)를 처음부터 끝까지 읽던 중,
`applyBeastPackBondStats()`에서 지금까지 본 것 중 가장 파급력이 큰
버그를 발견했다.

**발견한 문제**: 이 함수는 매번 "이전에 적용했던 보너스/페널티를
`S._beastPackBondBonus`에 기록해뒀다가, 다음 호출 때 그 기록을 보고
정확히 되돌린 뒤 새로 계산한다"는 방식으로 동작한다(다른 모든
`apply*Stats` 계열 함수와 동일한 표준 패턴 — 이번 조사에서 elf/human/
demon/dwarf/orc/darkling/celestial/원소/드래곤/패시브스킬 등 유사 함수
전부를 대조 확인했고, 이 함수 하나만 예외였다). 그런데 "홀로 된 자"
(isLone) 분기에서만 `LONE_WOLF_PENALTY`(CHA -20, TRST -18, LDR -15,
STR -8)를 실제로 `S.stats`에 적용해놓고도, 기록용 변수는 방금 적용한
그 델타가 아니라 **빈 객체(`{}`)로 지워버렸다**. 그 결과 다음 호출에서
"되돌릴 이전 값"이 없다고 착각해 아무것도 되돌리지 않은 채 페널티를
또 적용하게 된다.

문제는 이 함수가 `updateHeader()` 안에서(수인 캐릭터일 때 조건 없이)
호출된다는 점이다(6096행). `updateHeader()`는 골드·퀘스트·스탯 변화가
있을 때마다 한 턴에도 여러 번 실행되는, 코드베이스 전체에서 가장 자주
호출되는 함수(274곳에서 호출)다. 즉 수인 캐릭터가 무리를 배신하거나
규칙을 어겨 "홀로 된 자"가 되는 순간부터, 이후의 모든 `updateHeader()`
호출마다 CHA/TRST/LDR/STR에 페널티가 되돌려지지 않은 채 또 쌓여
사실상 무한 누적되고, 단 몇 턴 안에 해당 스탯들이 0으로 고정된다.
설상가상으로 이후 "속죄의 길"(`redeemPackBetrayal`)로 홀로 된 자
상태를 해제해도, 기록이 이미 지워져 있었으므로 그동안 쌓인 페널티는
전혀 되돌아오지 않고 영구히 남는다 — 배신을 딱 한 번만 해도 사실상
해당 캐릭터의 CHA/TRST/LDR/STR을 영구히 망가뜨리는 셈이었다.

**헤드리스 재현**: 캐릭터 종족을 수인으로 설정, CHA/TRST/LDR/STR을
100으로 초기화, `tf-beast-packbond`를 `isLone:true` 상태로 저장한 뒤
`applyBeastPackBondStats()`를 5회 연속 호출(실제 플레이에서 한 턴에
`updateHeader()`가 여러 번 불리는 것과 동일한 상황). **수정 전**: 5회
호출 후 CHA 100→10, LDR 100→0으로 급격히 붕괴(기대값은 1회 적용분인
CHA 80·LDR 85여야 함) — 매 호출마다 페널티가 되돌려지지 않고 계속
더해짐을 확인. **수정 후**: 5회를 호출해도 CHA=80·TRST=82·LDR=85(정확히
1회 적용분과 동일, 반복 호출에도 전혀 변하지 않음)로 고정되고,
`S._beastPackBondBonus`에 `{cha:-20,trst:-18,ldr:-15,str:-8}`이 정확히
기록됨을 확인. 이어서 "홀로 된 자" 상태를 해제하고 다시 호출하자
CHA/TRST/LDR이 정확히 원래 값(100)으로 완전히 복원됨도 확인했다.

**수정**: 보너스 분기와 동일하게, `isLone` 분기에서도 실제로 적용한
`LONE_WOLF_PENALTY` 델타를 `nb`(다음 호출 시 되돌릴 기록)에 담아
`S._beastPackBondBonus = nb`로 저장하도록 수정했다 — 다른 모든
`apply*Stats` 함수가 이미 쓰고 있는 표준 패턴과 통일한 것뿐이다.

**검증**: 위 재현 시나리오로 수정 전(무한 누적)과 수정 후(1회분만
정확히 적용되고 속죄 시 완전 복원) 차이를 직접 확인. 이 함수와 동일한
"이전 보너스 기록 → 되돌리기 → 재계산" 패턴을 쓰는 다른 모든
`apply*Stats` 함수(약 15개)를 전수 대조해, 이 버그가 이 함수 하나에만
있던 예외였음을 확인했다. 최종 회귀(`pw_final_regression.js`,
`pw_18th_regression.js`) 전부 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| race/260 (`applyBeastPackBondStats`의 "홀로 된 자" 페널티 추적 누락) | **구조적 버그 발견·수정 (8탄, 이번 세션 최고 심각도)** | `updateHeader()`(매턴 여러 번 호출)를 통해 페널티가 되돌려지지 않은 채 무한 누적되어, 배신 한 번으로 CHA/TRST/LDR/STR이 몇 턴 안에 영구히 0으로 고정되던 문제 — 페널티 델타를 다른 apply*Stats 함수와 동일하게 정확히 기록·추적하도록 수정 |

---

## 20차(계속·9탄) — combat/ 디렉터리 전수 재감사 중 발견한 2건

사용자가 "HP뿐 아니라 모든 순서/상호작용 버그를 끝까지 찾아 전부
고치라"고 재차 명확히 지시함에 따라, race/260을 완전히 다 읽은 뒤
combat/ 디렉터리(11개 파일) 전수 재감사를 시작했고, 그 과정에서 서로
독립적인 2건의 실제 동작 버그를 발견·수정했다.

### 버그 1 — `processGSToAllDBs`의 전투 학습 데이터가 타입 불일치로 매 턴 기록됨

**파일**: `combat/150-전투-종료-후-포로-처리-UI.js` (`processGSToAllDBs`)

**증상**: AI가 매 턴 명시적으로 출력하는 `combat_state`(`'start'`/
`'ongoing'`/`'end'`/`'none'`)를 시스템이 텍스트 키워드 추측 없이도
스스로 판단할 수 있도록 (사용자 입력 → 전투 상태) 사례를 학습 데이터로
누적하는 로직이 있다. 원래 의도는 "상태가 실제로 바뀐 턴에만" 학습
사례를 기록하는 것이었는데, 실제 비교식이 `gs.combat_state !== prevState`
였다 — `gs.combat_state`는 문자열이고 `prevState`(`S._inCombat`)는
boolean이라 타입이 애초에 달라서 이 비교는 **항상 true**였다. 그
결과 전투가 계속 `'ongoing'`으로 이어지는 모든 턴이 마치 "막 전환된
순간"인 것처럼 학습 버퍼(최근 200건)에 반복 기록되어, 정작 유의미한
전환 경계 사례(전투 시작·종료 순간)가 동일한 "전투 지속 중" 데이터에
밀려 버리는 문제였다.

**수정**: `gs.combat_state`를 boolean(`isCombatNow`)으로 정규화한 뒤
`isCombatNow !== !!prevState`로 비교하도록 교정 — 실제로 전투
상태(전투중↔비전투)가 전환된 턴에만 학습 데이터가 기록된다.

**검증**: Playwright로 `S._inCombat=false` 상태에서 `combat_state:'ongoing'`을
2회 연속 GS로 주입 — 수정 전이라면 2건 모두 기록됐겠지만, 수정 후
첫 호출만 기록(1건)되고 반복된 `'ongoing'`은 기록되지 않음(그대로 1건
유지)을 확인. 이어서 `combat_state:'end'`를 주입하자 실제 전환이므로
정확히 2번째 기록이 추가됨을 확인.

### 버그 2 — `renderTimelinePanel`의 다이어리 항목 turn 필드가 객체로 오염됨

**파일**: `combat/188-UI-1-타임라인-전투로그-데이터-시스템.js`
(`renderTimelinePanel`)

**증상**: 연대기(타임라인) 패널은 자체 타임라인 기록과 다이어리
기록(`loadDiary()`)을 턴 순서로 합쳐서 보여준다. 이때 다이어리
항목의 turn 값을 `typeof d.metadata==='object' ? (d.metadata||0) : (d.turn||0)`
로 계산하고 있었는데, `saveDiaryEntry()`(misc/076)는 `metadata`
인자로 무엇이 들어오든 항상 실제 턴 번호를 `d.turn`(=`S.msgCount`)에
정확히 저장하고, 정작 `metadata`는 대부분 객체({action:...} 등, 기본값도
`{}`)로 전달된다 — 즉 `typeof d.metadata==='object'` 분기가 사실상
거의 항상 참이 되어, 신뢰할 수 있는 `d.turn` 대신 **metadata 객체
자체가 turn 필드에 들어가는** 결과가 났다. 이후 정렬(`(b.turn||0)-(a.turn||0)`)과
10턴 단위 그룹화(`Math.floor((e.turn||0)/10)*10`)가 객체를 대상으로
산술 연산을 하면서 전부 `NaN`이 되어, 다이어리에서 온 연대기 항목들이
순서 없이 뒤섞이고 "턴 NaN~NaN" 그룹에 몰리는 문제였다.

**수정**: metadata의 타입과 무관하게 항상 신뢰할 수 있는 `d.turn||0`을
쓰도록 단순화.

**검증**: Playwright로 `S.msgCount=42`일 때 `saveDiaryEntry('combat',
'test diary entry', {action:'test'})`를 호출(metadata가 객체인 케이스)한
뒤 `renderTimelinePanel()`을 렌더링 — 결과 HTML에 "턴 42"가 그룹
"턴 40~49"에 정확히 표시되고, `NaN` 문자열이 전혀 나타나지 않음을
확인.

**공통 검증**: `pw_final_regression.js`, `pw_18th_regression.js` 최종
회귀 전부 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| combat/150 (`processGSToAllDBs`의 전투 학습 데이터 타입 불일치) | **버그 발견·수정 (9탄)** | `gs.combat_state`(문자열) vs `S._inCombat`(boolean) 비교가 항상 true라 매 턴 학습 데이터가 기록되던 문제 — boolean 전환 비교로 교정 |
| combat/188 (`renderTimelinePanel`의 다이어리 turn 필드 오염) | **버그 발견·수정 (9탄)** | `typeof d.metadata==='object'` 분기가 항상 참이 되어 turn에 객체가 들어가 정렬·그룹화가 NaN이 되던 문제 — 항상 `d.turn` 사용하도록 수정 |

---

## 20차(계속·10탄) — race/064: 직업 숙련도 시스템의 원본(original) 버그 2건

combat/ 디렉터리를 마친 뒤 race/013·024·027·028·038·064를 순서대로
읽어나가던 중, race/064의 "직업 숙련도(Job Mastery)" 시스템에서 서로
맞물린 버그 2건을 발견했다. 이 중 하나는 **원본 taleforge.html에도
그대로 존재하던, 이 게임 역사상 한 번도 발동한 적이 없는 원본 버그**다.

### 버그 1(치명) — `MASTERY_LEVELS`에 `minTurns`가 정의된 적이 없어 숙련도가 레벨 1에서 영원히 고정

**파일**: `data/064-...js`(`MASTERY_LEVELS` 데이터) / `race/064-...js`(`getJobMastery`)

`getJobMastery()`는 다음과 같이 숙련도 레벨을 계산한다:
```js
let level = 1;
for(const ml of MASTERY_LEVELS){
  if(effectiveTurns >= ml.minTurns) level = ml.level;
  else break;
}
```
그런데 `MASTERY_LEVELS`의 7개 항목 전부(`레벨1 입문`~`레벨7 신화`) 어디에도
`minTurns` 필드가 정의된 적이 없었다. `ml.minTurns`가 `undefined`이므로
`effectiveTurns >= undefined`는 숫자가 얼마든 항상 `false`이고, 루프는
**첫 항목(레벨1)에서 곧바로 `break`** — `level`은 초기값 1에서 절대
벗어나지 못한다. 이 결함은 이번 세션에서 만든 것이 아니라 원본
`taleforge.html`(리팩터링 이전)에도 정확히 동일하게 존재했다 — 즉
`JOB_MASTERY_BONUS`에 정의된 레벨 2~7의 모든 스탯 보너스(예: 전사
7단계 "전쟁의 화신" STR/END/FEAR/AGI/LUK +80)가 이 게임이 존재한
이래 단 한 번도 지급된 적이 없었다는 뜻이다.

**헤드리스 재현**: `tf-job-turns`에 `{warrior: 100000}`(턴 10만)을
직접 심어놓고 `getJobMastery('warrior')`를 호출 — **수정 전**: 턴이
10만이어도 `level:1, name:'입문'` 그대로. **수정 후**: `level:7,
name:'신화'`로 정상 상승, `turns:0`일 때는 `level:1` 유지.

**수정**: `MASTERY_LEVELS`의 7개 항목에 상승하는 `minTurns`
(0/30/80/150/250/400/600)을 새로 부여했다. 이 값은 복원할 원래 값이
존재하지 않는(애초에 정의된 적이 없는) 순수 신규 데이터이므로, 기존
직업 전직 제안 시스템의 턴 페이스(최소 10~25턴, 재시도 쿨다운
5~15턴)와 자연스럽게 어울리도록 새로 설계했다.

### 버그 2 — `checkMasteryLevelUp`이 레벨업 보너스를 두 번 적용

**파일**: `race/064-...js`(`checkMasteryLevelUp`)

버그 1과 별개로, 레벨업이 발생하는 바로 그 함수 안에서 또 다른
이중 적용 버그가 있었다:
```js
// 스탯에 즉시 반영
const masteryBonus = bonuses[mastery.level-1]||{};
Object.entries(masteryBonus).forEach(([k,v])=>{ ... S.stats[k] += v ... });
window.updateHeader();
applyMasteryBonus();   // ← 내부에서 동일한 jobId·동일한 mastery.level로
                        //   같은 bonuses[mastery.level-1]를 다시 조회해
                        //   S.stats에 또 더함 (되돌리기 로직 없음)
```
`applyMasteryBonus()`는 `S._xxxBonus`류 델타 추적 없이 매번 무조건
현재 레벨의 보너스를 `S.stats`에 더하기만 하는 함수라, 직접 적용
블록과 `applyMasteryBonus()` 호출이 같은 턴에 연달아 실행되면서
**같은 보너스가 항상 2배로** 지급됐다. 버그 1이 고쳐지지 않았을
때는 애초에 레벨업 자체가 안 일어나 이 버그가 절대 발현되지
않았지만, 버그 1을 고치는 순간 이 이중 지급 버그가 즉시 함께
드러날 상황이었다 — 두 버그를 함께 잡아야 하는 이유다.

**헤드리스 재현**: `S.character.jobId='warrior'`, STR/END를 각각 50으로
설정, `tf-job-turns`를 정확히 레벨2 문턱(30턴)으로 맞춘 뒤
`checkMasteryLevelUp('warrior')` 호출. **수정 전**(직접 적용 블록
유지 상태로 가정 시): STR/END가 각각 +40(2배) 증가했을 것.
**수정 후**: STR 50→70, END 50→70로 정확히 1회분(`{str:20,end:20}`)만
반영됨을 확인.

**수정**: 직접 적용 블록을 제거하고 `applyMasteryBonus()` 단일 호출로
정리 — 다른 곳에서 이미 검증된 "현재 숙련도 보너스를 적용하는" 전용
함수를 그대로 재사용하도록 했다.

**공통 검증**: 두 수정을 함께 적용한 뒤 Playwright로 위 두 시나리오를
모두 재확인, `pw_final_regression.js`·`pw_18th_regression.js` 최종
회귀 전부 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| data/064 (`MASTERY_LEVELS`에 `minTurns` 필드 자체가 원본부터 없음) | **원본(original) 버그 발견·수정 (10탄, 게임 출시 이래 직업 숙련도 2~7단계가 단 한 번도 발동한 적 없음)** | 7개 단계에 상승하는 `minTurns`(0/30/80/150/250/400/600)를 신규 부여 |
| race/064 (`checkMasteryLevelUp`의 레벨업 보너스 이중 적용) | **버그 발견·수정 (10탄)** | 직접 적용 블록 제거, `applyMasteryBonus()` 단일 호출로 정리 |

---

## 20차(계속·11탄) — economy/285: 용병 재고용 시 스탯 보너스 영구 누적

race/를 마치고 economy/(5개 파일) 전수 재감사 중 `doEconomyAction`의
"용병 고용"(hire) 경로에서 발견한 버그.

**파일**: `economy/285-5-경제-시스템-실질화.js`(`doEconomyAction`, `processMercenary`)

**증상**: `doEconomyAction('hire')`는 골드 100을 지불하고
`S._hiredMercenary = {turnsLeft:3, bonus:{str:15,end:10}}`를 설정하며
STR/END에 +15/+10을 직접 더한다. 계약이 끝나면(`processMercenary()`가
`turnsLeft`를 매턴 감소시켜 0이 되는 시점) 이 `bonus` 값만큼 정확히
되돌린다 — 여기까지는 정상적인 "1회 고용" 시나리오에서는 문제없다.

문제는 **계약이 아직 끝나지 않은 상태(`turnsLeft>0`)에서 다시
"용병 고용"을 실행할 때**다. `showEconomyMenu()`의 버튼은 골드
보유량(`canAfford`)만으로 활성/비활성을 정하고, 이미 용병을 고용
중인지는 전혀 체크하지 않는다. 그래서 골드만 있으면 몇 번이고 다시
고용할 수 있는데, 재고용할 때마다 `S._hiredMercenary`를 새 객체로
덮어쓰면서 `S.stats`에는 STR/END +15/+10을 **매번 추가로** 더한다.
하지만 `S._hiredMercenary.bonus`는 여전히 `{str:15,end:10}` 하나뿐이라,
나중에 계약이 끝날 때 `processMercenary()`는 딱 1회분(+15/+10)만
되돌린다 — 두 번 고용했다면 실제로는 +30/+20이 더해졌는데 반환은
+15/+10뿐이라, **차액 +15/+10이 영구적으로 스탯에 눌어붙는다.**
세 번, 네 번 반복할수록 그 잔여분은 계속 쌓인다.

**헤드리스 재현**: STR/END를 50으로 설정, `doEconomyAction('hire')`를
연속 2회 호출(계약 만료 전 재호출) → 두 번째 호출 후에도 STR/END는
여전히 65/60(1회분과 동일)이어야 정상인데, **수정 전**이라면 재호출
시점에 다시 +15/+10이 추가되어 80/70이 됐을 것이고, 이후
`processMercenary()`를 3회 호출해 계약을 만료시켜도 1회분만 차감돼
최종적으로 65/60(원래 50/50보다 +15/+10 영구 잔존)으로 끝났을 것이다.

**수정**: `hire` 처리 진입 시, 이미 `S._hiredMercenary.bonus`가 있으면
새로 적용하기 전에 먼저 그 값을 되돌리도록 했다 — 다른 apply*Stats
함수들이 이미 쓰고 있는 "이전 보너스 되돌리기 → 새로 계산해 적용"
패턴과 동일하게 맞춘 것이다. 결과적으로 재고용은 "계약 갱신"(스탯은
그대로 +15/+10 유지, 기간만 3턴으로 리셋)으로 정확히 동작한다.

**검증**: Playwright로 STR/END=50에서 `doEconomyAction('hire')`를 2회
연속 호출 — 1회차 후 65/60, 2회차(재고용) 후에도 그대로 65/60(추가
누적 없음)을 확인. 이어서 `processMercenary()`를 3회 호출해 계약을
만료시키자 정확히 원래 값 50/50으로 완전히 복원되고
`S._hiredMercenary`가 `null`이 됨을 확인. `pw_final_regression.js`,
`pw_18th_regression.js` 최종 회귀 전부 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| economy/285 (`doEconomyAction('hire')`의 재고용 시 스탯 보너스 이중 적용) | **버그 발견·수정 (11탄)** | 재고용 전 기존 용병 보너스를 먼저 되돌리도록 수정 — 반복 고용 시 스탯이 영구적으로 누적되던 문제 해결 |

---

## 20차(계속·12탄) — job/029: 히든 직업 자동 해금 시스템, 여러 직업이 사실상 영원히 해금 불가능했던 구조적 결함

economy/를 마친 뒤 job/(17개 파일) 전수 재감사 중, job/029의 "히든 직업
자동 해금" 시스템(`checkHiddenJobUnlock`)에서 이번 세션 최대 규모의
구조적 결함을 발견했다. 34개 히든 직업 중 다수가 자동 감지로는 사실상
해금 불가능하거나, 정작 자신이 선언한 조건과 무관하게 해금/거부되고
있었다.

### 근본 원인 — unlockType별 하드코딩된 switch가 각 직업의 실제 unlockCondition 필드를 무시

`checkHiddenJobUnlock(job, gameData)`는 `job.unlockType`(예: `"battle_wins"`,
`"awakened_evolution"`, `"legend_complete"` 등) 문자열로 switch를 타면서,
각 case가 "그 타입을 처음 쓴 직업"의 필드 1~2개만 하드코딩해 검사했다.
문제는 같은 unlockType을 여러 히든 직업이 공유하면서, 각자
`unlockCondition`에 서로 다른(더 많거나 다른) 필드를 선언했다는 것이다
— 그런데 switch case는 자신이 하드코딩한 필드 외에는 전혀 읽지 않았다.
실제로 확인된 사례:

- **혈기 기사(blood_knight)**: `unlockType:"battle_wins"`이지만 실제
  `unlockCondition`엔 `lowHpWins:15`만 있다. 그런데 `"battle_wins"` case는
  `cond.battleWins`만 읽어(존재하지 않으니 기본값 20) **완전히 다른
  필드**로 판정했다 — `lowHpWins`(부상 직전 승리)는 전혀 검사되지 않고,
  대신 무관한 `battleWins`(일반 전투 승리)만 20회 쌓이면 조용히
  해금됐다.
- **혼돈의 화신(chaos_avatar)**: `unlockType:"legend_complete"`이지만
  실제 조건은 `pureKarmaEndings:2, evilKarmaEndings:2, dimensionPins:8`.
  `"legend_complete"` case는 `cond.bardFame`·`cond.templeLevel`만
  읽어(둘 다 없으니 기본값 80·3) **자신의 데이터와 완전히 무관한
  조건**으로 해금 여부가 결정되고 있었다.
- **전설 창조자(legend_maker)**: `unlockType:"awakened_evolution"`이며
  `bardFame:80, templeLevel:3`을 선언했지만, 이 case는
  `deathEyeUnlocked`/`causalityUnlocked`/`twinSoulConnected`만 검사해
  bardFame·templeLevel 요구는 **통째로 무시**됐다 — cycle 조건만
  채우면 명성이나 신전 레벨과 무관하게 해금됐다.
- 이 외에도 신격 군주(templeLevel 무시), 저주의 군주(darkActs 무시),
  과거의 메아리(minCycle 무시), 영원한 순례자(dimensionPins 무시),
  용왕(`sealedGodComplete:false`를 선언했는데도 case가 무조건
  `gameData.sealedGodComplete===true`를 강제해 방향이 거꾸로 뒤집힘) 등
  10여 개 히든 직업이 같은 이유로 스스로 선언한 조건의 일부 또는 전부가
  무시되거나 엉뚱한 조건으로 대체되고 있었다.

### 추가로 발견된 데이터 배선 누락 3건 — 애초에 계산된 적 없는 필드들

위 구조 문제를 고치는 과정에서, 일부 unlockCondition 필드가 **애초에
어떤 함수도 값을 채워준 적이 없어 항상 0/false**였다는 사실도 함께
드러났다 — 즉 그 필드를 요구하는 히든 직업들은 코드를 어떻게 고쳐도
자동 감지로는 절대 해금될 수 없는 상태였다:

1. **`lowHpWins`** — 광전사(berserk)·방랑 검귀(wandering_ghost)·혈기
   기사(blood_knight) 3개 직업이 요구하지만, 이 값을 1이라도 증가시키는
   코드가 전체 코드베이스에 단 한 줄도 없었다. `battleWins`를 기록하는
   바로 그 지점(quest/086, `_isCombatStat && effectiveSuccess`)에
   "HP 10% 이하에서 승리"(berserk·wandering_ghost가 명시한 기준) 조건을
   더해 함께 기록하도록 연결했다.
2. **`pureKarmaEndings`/`evilKarmaEndings`** — 오라클(oracle)·업보
   화신(karma_incarnate)·혼돈의 화신(chaos_avatar)·속박
   해방자(chain_breaker) 등이 요구하지만, 엔딩을 기록하는
   `unlockEnding()`(misc/054)이 애초에 카르마 점수를 함께 저장한 적이
   없어 집계할 데이터 자체가 없었다. `unlockEnding()`이 달성 시점의
   카르마(`S.stats.krma`)를 함께 기록하도록 하고, 이를 집계하는
   `getKarmaEndingCounts()`(카르마 ≤30=순수, ≥70=극악 — 오라클의 "카르마
   점수 30 이하" 기준을 그대로 채택)를 새로 만들어 연결했다. 이 수정
   이전에 이미 달성한 엔딩은 카르마 기록이 없어 집계에서 제외된다(소급
   불가 — 애초에 존재한 적 없는 정보라 되돌려 계산할 수 없음).

### 리팩터링 — unlockType 하드코딩 대신 각 직업의 unlockCondition을 있는 그대로 전수 검사

근본 원인 자체가 "unlockType별 하드코딩된 필드 목록"이라는 설계였으므로,
`checkHiddenJobUnlock`을 다음과 같이 일반화했다: 각 직업이 자기
`unlockCondition`에 실제로 적어놓은 필드를 **unlockType과 무관하게
하나도 빠짐없이** 그대로 검사한다 — cond에 있는 필드만이 그 직업의
진짜 요구조건이라는 원칙. cond의 키 이름과 gameData 필드 이름은 대부분
1:1로 같고 `minCycle`(cond) ↔ `cycle`(gameData) 하나만 다르므로
매핑 테이블로 처리했다. boolean 필드는 정확히 일치해야 통과(이래서
용왕의 `sealedGodComplete:false`가 이번엔 올바른 방향으로 동작한다),
숫자 필드는 `실제값 >= 요구값`으로 통과시킨다.

### 부수적으로 발견한 관련 버그 — currentRole이 빈 문자열일 때 baseJobMatch가 무조건 통과되던 문제

리팩터링을 검증하다가, `job.baseJob.some(base => currentRole.includes(base)
|| base.includes(currentRole))`에서 `currentRole`이 빈 문자열이면
`base.includes('')`가 **어떤 base에 대해서도 항상 true**라는(빈 문자열은
모든 문자열의 부분 문자열) JS 특성 때문에, 캐릭터의 역할이 아직 설정되지
않은 상태에서도 각성/진화형 히든 직업의 기본 직업 조건이 무조건
통과돼버리는 별개의 허점을 발견했다. `currentRole`이 비어있으면 애초에
매칭 대상이 없으므로 즉시 실패로 처리하도록 가드를 추가했다.

**검증**: Playwright로 원래 구조 그대로 살아있는 실제 API
(`checkAllHiddenJobsAuto`/`unlockEnding`/`updateStats`)를 통해 엔드투엔드로
확인 — ① 사망 기사(死・간단 케이스) 회귀 정상, ② 신화의 영웅(다중 필드
공유 케이스) 회귀 정상, ③ 혈기 기사가 무관한 `battleWins`로는 더 이상
해금되지 않고 자신의 실제 조건(`lowHpWins`)으로만 해금됨을 확인, ④
혼돈의 화신이 무관한 `bardFame`/`templeLevel`로는 더 이상 해금되지
않고, `unlockEnding()`으로 기록한 순수/극악 엔딩 각 2회 + 차원 지도
8개로 정확히 해금됨을 확인(이때 업보 화신도 함께 정상 해금됨), ⑤
현자(sage)가 `pastLanguageUnlocked` 없이는(예전의 "cycle≥5면 통과"
허점 없이) 더 이상 해금되지 않음을 확인, ⑥ 역할 미설정
상태에서는 더 이상 어떤 각성형 히든 직업도 부당하게 해금되지 않음을
확인. `pw_final_regression.js`, `pw_18th_regression.js` 최종 회귀 전부
통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| job/029 (`checkHiddenJobUnlock`의 unlockType별 하드코딩이 각 직업 고유 조건을 무시/대체) | **구조적 버그 발견·수정 (12탄, 이번 세션 최대 규모)** | unlockType 기반 switch를 제거하고, 각 직업의 `unlockCondition`에 선언된 필드를 전부 그대로 검사하는 범용 로직으로 교체 |
| job/029 (`currentRole` 빈 문자열 시 baseJobMatch 무조건 통과) | **버그 발견·수정 (12탄)** | currentRole이 비어있으면 즉시 매칭 실패로 처리 |
| quest/086 + job/203 (`lowHpWins` 필드가 어디서도 기록된 적 없음) | **데이터 배선 누락 발견·수정 (12탄)** | HP 10% 이하 전투 승리 시 `updateStats('lowHpWins',1)` 기록 추가, `_buildHiddenJobGameData()`에 연결 |
| misc/054 + job/203 (`pureKarmaEndings`/`evilKarmaEndings`가 어디서도 계산된 적 없음) | **데이터 배선 누락 발견·수정 (12탄)** | `unlockEnding()`이 달성 시점 카르마를 기록, `getKarmaEndingCounts()` 신설 후 연결 |

---

## 20차(계속·13탄) — job/208: `applyJobBonus`/`removeJobBonus`가 실제로는 한 번도 짝이 맞게 호출된 적 없어 최초 `changeJob()` 호출 시 "유령 차감"이 발생하던 구조적 버그

### 근본 원인

`applyJobBonus(jobId)`/`removeJobBonus(jobId)`(job/208)는 오직
`changeJob()` 내부에서만 함께 호출되고, `changeJob()` 자체는 오직
AI가 출력하는 `gs.job` 필드 처리 경로(ai-prompt/222)에서만 호출된다.
그런데 실제 게임에서 압도적으로 많이 쓰이는 진짜 전직 경로는
`offerJobChange()`(job/042 — `acceptJobSuggestion`, 방랑자 진화 등에서
호출)이며, 이 함수는 `S.character.role`/`jobId`를 **직접 대입**할 뿐
`applyJobBonus`/`removeJobBonus`를 전혀 거치지 않는다. 캐릭터 생성
시점에도 이 함수는 호출되지 않는다.

결과적으로: 플레이어가 `offerJobChange()`로 실제 전사(warrior)가 된
뒤, 한참 지나 AI가 처음으로 `gs.job`을 출력해 `changeJob()`이 최초로
발동하면, 기존 코드는 `removeJobBonus(prevJobId='warrior')`를 호출해
전사 보너스(`{str:15, agi:5}`)를 **실제로는 한 번도 부여된 적이
없는데도** 무조건 차감해버린다 — 영구적인 "유령 스탯 차감" 버그.
`data/042-직업-시스템-무한-파생-도감.js`의 `BASE_JOBS`(`id:'warrior'`
등)와 `data/208-...js`의 `JOB_DEFS` 키가 동일한 id 체계를 공유함을
파일 직접 대조로 확인했으므로, `getJobDef()`의 부분 문자열 매칭이
실제로 플레이어의 기본 직업을 찾아내 이 유령 차감이 실전에서
발생함을 확인했다.

### 수정

이 파일 전반에서 이미 쓰이고 있는 "추적된 델타(tracked-delta)"
패턴으로 두 함수를 재작성 — 이전에 실제로 적용한 보너스를
`S._jobDefBonus`에 저장해두고, 다음 호출 시 그 기록만 되돌린 뒤
새로 적용한 만큼만 다시 기록한다. 이렇게 하면 과거에 `applyJobBonus`가
비대칭으로 호출되었는지 여부와 무관하게 항상 스스로 정합성을
회복한다(자기 교정적):

```js
export function applyJobBonus(jobId) {
  try {
    if (!S?.stats) return;
    const prevBonus = S._jobDefBonus || {};
    Object.entries(prevBonus).forEach(([k,v]) => {
      if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v);
    });
    const def = getJobDef(jobId);
    const nb = {};
    if (def && def.stats) {
      Object.entries(def.stats).forEach(([k,v]) => {
        if (S.stats[k] !== undefined) { S.stats[k] = Math.min(999, (S.stats[k]||0) + v); nb[k] = v; }
      });
    }
    S._jobDefBonus = nb;
    if (typeof window.updateHeader === 'function') window.updateHeader();
    if (typeof saveSession === 'function') saveSession();
  } catch(e) {}
}

export function removeJobBonus(jobId) {
  try {
    if (!S?.stats) return;
    const prevBonus = S._jobDefBonus || {};
    Object.entries(prevBonus).forEach(([k,v]) => {
      if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, (S.stats[k]||0) - v);
    });
    S._jobDefBonus = {};
  } catch(e) {}
}
```

`changeJob()` 자체는 수정하지 않았다(여전히 `removeJobBonus(prev)` →
`applyJobBonus(newJobId)` 순서로 호출) — 새 구현이 이전 호출 이력과
무관하게 항상 실제로 적용된 만큼만 되돌리므로 그대로 안전하다.

### 검증

Playwright로 두 시나리오 확인 — ① `offerJobChange()` 스타일로
`role:'warrior'`를 직접 대입한(즉 `applyJobBonus`를 한 번도 거치지
않은) 상태에서 최초로 `changeJob('mage')`를 호출 → 수정 전이라면
`str/agi`가 부당하게 깎였을 것이나, 수정 후 `str:50→50, agi:50→50`
(무차감) + `int:50→65`(mage 보너스만 정상 적용)로 유령 차감이 사라짐을
확인. ② `changeJob('warrior')→('mage')→('rogue')` 연속 호출로 매 전직마다
이전 보너스가 정확히 원복되고 새 보너스만 남는 것을 확인
(`afterWarrior:{str:65,agi:55}` → `afterMage:{str:50,agi:50,int:65,mp:80}`
→ `afterRogue:{str:50,agi:65,int:50,mp:50}`, 드리프트 없음).
`pw_final_regression.js`, `pw_18th_regression.js` 최종 회귀 전부 통과,
콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| job/208 (`applyJobBonus`/`removeJobBonus`가 `offerJobChange` 경로와 전혀 연동되지 않아 최초 `changeJob()` 호출 시 유령 차감 발생) | **구조적 버그 발견·수정 (13탄)** | 두 함수를 `S._jobDefBonus` 기반 추적된 델타 패턴으로 재작성, 호출 이력과 무관하게 자기 교정되도록 함 |

---

## 20차(계속·14탄) — job/087: `checkBulletinQuestCompletion`의 템플릿 리터럴 이스케이프 오류(`\${}` → 항상 리터럴 문자열)로 완료/실패 토스트가 실제 값 대신 코드 텍스트 그대로 표시되던 버그

### 근본 원인

job/042·job/087 전수 재검토 중 정상적인 이중 중첩 템플릿 리터럴
패턴(HTML 문자열 안에 브라우저에서 실행될 `<script>` 텍스트를 담는
world/315 등에서는 `\${...}`가 올바른 이스케이프)과 별개로,
`job/087-...js`의 `checkBulletinQuestCompletion()`(게시판 의뢰 완료/실패
판정 함수) 안의 4곳 — 아이템 획득 토스트, 의뢰 완료 토스트, 일기
기록, 의뢰 실패 토스트 — 은 중첩 템플릿이 전혀 아닌 평범한 최상위
함수 코드인데도 `${...}` 앞에 불필요한 백슬래시가 붙어 있었다
(`` `🎁 \${item.icon} \${item.name} 획득!` `` 등). JS에서 템플릿
리터럴 안의 `\$`는 `$`를 이스케이프해 보간을 막으므로, 이 4곳은
실제 값이 채워지지 않고 `${item.icon}` 같은 코드 텍스트가 그대로
토스트/일기 로그에 노출되는 표시 버그였다.

같은 파일(게시판 의뢰 완료 처리)의 병렬 구현인
`misc/053-게시판-시스템.js`에는 이미 동일한 버그가 "[F-2 FIX]
템플릿 리터럴 이스케이프 오류 수정 (`\${}` → `${}`)"라는 주석과 함께
과거에 수정되어 있었다 — 즉 이 문제는 이미 한 번 발견·수정된 적이
있었지만, 사실상 같은 기능을 하는 job/087 쪽의 별도 구현본에는 그
수정이 반영되지 않고 그대로 남아 있었던 것.

### 수정

4곳 모두 불필요한 백슬래시를 제거해 정상적인 보간으로 되돌렸다:

```js
toast(`🎁 ${item.icon} ${item.name} 획득!`, 2500);
toast(`🏆 게시판 의뢰 완료: ${q.icon||'📋'} ${q.title}`, 3500);
saveDiaryEntry('quest', `✅ 게시판 의뢰 완료: ${q.title}`, S.msgCount||0);
toast(`❌ 게시판 의뢰 실패: ${q.title}`, 2500);
```

같은 감사 과정에서 `world/315-⑥-대륙-정치-지도.js`에 있는 다수의
`\${...}` 는 별개로 확인했다 — 이쪽은 브라우저에서 나중에 실행될
`<script>` 텍스트를 만드는 **바깥쪽** 템플릿 리터럴 안에, 그 스크립트
자신이 쓸 **안쪽** 템플릿 리터럴 문법을 문자 그대로 보존해야 하는
이중 중첩 구조라서 이스케이프가 정확히 올바르게 쓰인 경우였다 —
수정 대상 아님(오탐 배제).

### 검증

Playwright로 게시판 의뢰를 하나 등록하고
`checkBulletinQuestCompletion()`을 완료 판정 텍스트로 직접 호출 —
빌드된 `dist/taleforge.html`을 직접 확인해 4곳 모두
`${rewardGold}`/`${item.icon}`/`${item.name}`/`${q.icon...}`/`${q.title}`가
백슬래시 없이 정상 보간되도록 컴파일됐음을 확인했고, 실제 실행
결과도 퀘스트가 `status:'completed', _rewardGiven:true`로 정상
전이됨을 확인(로직 자체는 원래도 정상 동작했고, 표시 텍스트만
깨져 있던 버그였음이 재확인됨). `pw_final_regression.js`,
`pw_18th_regression.js` 최종 회귀 전부 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| job/087 (`checkBulletinQuestCompletion`의 `\${}` 이스케이프로 토스트/일기 로그에 실제 값 대신 리터럴 텍스트 노출) | **표시 버그 발견·수정 (14탄)** | 4곳의 불필요한 백슬래시 제거, 정상 보간으로 복원(같은 버그가 misc/053에는 이미 과거 수정되어 있었음을 대조로 확인) |

---

## 20차(계속·15탄) — npc/067: `loadFactionSim`/`saveFactionSim`가 선언된 적 없는 상수(`FS_RELATIONS_KEY`/`FS_HISTORY_KEY`/`FS_WAR_KEY`)를 참조해 매번 조용히 실패 — 세력 전쟁/긴장도 시뮬레이션이 한 번도 저장된 적 없던 버그

### 근본 원인

npc/ 디렉토리 전수 재감사 중 `npc/067-③-NPC-관계망-시스템.js`의
`loadFactionSim()`/`saveFactionSim()`을 읽다가, 두 함수 모두 이 파일은
물론 전체 420개 파일 어디에도 선언된 적이 없는 상수
`FS_RELATIONS_KEY`/`FS_HISTORY_KEY`/`FS_WAR_KEY`를 참조하고 있음을
발견했다(`grep`으로 전체 소스 트리를 확인 — 오직 이 두 함수 안에서만
등장). ES 모듈은 항상 strict 모드이므로 선언되지 않은 식별자를
참조하면 `ReferenceError`가 발생하는데, 두 함수 모두 그 참조가
`try{...}catch(e){}` 블록의 **첫 줄**에 있어 예외가 즉시 삼켜진다.

그 결과:
- `saveFactionSim(d)`는 첫 줄(`lsSet(FS_RELATIONS_KEY, ...)`)에서 항상
  던지고 catch로 삼켜져, 그 아래에 있던 구버전 호환용
  `lsSet(FACTION_SIM_KEY, JSON.stringify(d))`(하위호환 폴백)조차
  실행되지 못한다 — 즉 아무것도 저장되지 않는다.
- `loadFactionSim()`도 첫 줄에서 항상 던지고 catch로 넘어가
  `{relations:{}, history:[], lastTick:0, warMeta:{}}`라는 완전히
  빈 기본값만 매번 반환한다.

이 두 함수를 쓰는 `tickFactionSimulation()`(세력 간 긴장도를 매 턴
계산해 전쟁·휴전·화해 이벤트를 생성하는 핵심 로직 — 전쟁 최소 20턴
유지, 휴전 후 20턴 재전쟁 금지 같은 지속 상태 로직 포함),
`getSimTension`/`getActiveWars`/`checkFactionSecretTrigger` 모두
`loadFactionSim()`이 항상 빈 상태를 반환하는 것을 전제로 매번 처음부터
다시 계산했고, 그 계산 결과는 저장 자체가 안 되니 다음 턴에 흔적 없이
사라졌다 — 즉 이 파일이 처음 만들어진 이후로 세력 전쟁/긴장도
시뮬레이션은 지속성이 전혀 없는, 매 턴 완전히 새로 굴려지는 무의미한
상태였다("전쟁 중 최소 20턴 유지"·"휴전 후 20턴 재전쟁 불가" 로직도
`meta.warStart`/`meta.ceasefireAt`가 항상 `undefined`라 절대
작동하지 않았다).

### 수정

`FACTION_SIM_KEY` 선언 바로 아래에 누락된 세 상수를 추가했다:

```js
export const FACTION_SIM_KEY = 'tf-faction-sim';
export const FS_RELATIONS_KEY = 'tf-faction-sim-relations';
export const FS_HISTORY_KEY = 'tf-faction-sim-history';
export const FS_WAR_KEY = 'tf-faction-sim-war';
```

`loadFactionSim`/`saveFactionSim` 자체의 로직(분리 키 우선 조회 +
구버전 단일 키 하위호환)은 원래 의도대로 정상 동작하게 된다. 기존
플레이 세이브에는 애초에 저장된 적이 없는 데이터라 소급 이전(migration)
대상이 없다.

### 검증

Playwright로 `saveFactionSim({relations:{'a|||b':77}, history:[...],
lastTick:5, warMeta:{}})` 호출 후 `loadFactionSim()`으로 즉시 재조회 —
수정 전에는 저장한 값과 무관하게 항상 빈 기본값만 반환하고
`localStorage`의 백업 키도 `null`이었으나, 수정 후에는 저장한 값이
그대로 반환되고 `localStorage`에도 정상 기록됨을 확인. 이어서
`tickFactionSimulation()`을 턴을 바꿔가며 두 번 연속 호출해
`lastTick`이 10→11로 정상 누적되고 관계 데이터(378쌍)가 다음 호출에도
유지됨을 확인 — 지속적 시뮬레이션이 실제로 작동함을 검증했다.
`pw_final_regression.js`, `pw_18th_regression.js` 최종 회귀 전부
통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| npc/067 (`loadFactionSim`/`saveFactionSim`가 선언된 적 없는 `FS_RELATIONS_KEY`/`FS_HISTORY_KEY`/`FS_WAR_KEY`를 참조해 매번 `ReferenceError`를 조용히 삼키고 저장/조회 둘 다 무의미하던 버그) | **구조적 버그 발견·수정 (15탄, 세력 전쟁 시뮬레이션 전체 무효화)** | 누락된 상수 3개 선언 추가, 세력 긴장도/전쟁 지속 상태가 실제로 턴 간 지속되도록 복구 |

---

## 20차(계속·16탄) — summon/023: `activateVoidSummon`이 각 소환체에 `duration:3`을 기록하지만 이를 소진시키는 로직이 전혀 없어 균열 소환수가 영원히 사라지지 않던 버그

### 근본 원인

summon/ 디렉토리 전수 재감사 중 `activateVoidSummon()`(다크링 종족
전용 "균열 소환" 스킬)이 소환할 때마다 `{ ...summon, summonedAt, duration: 3 }`
형태로 각 소환체에 `duration:3`("3턴 지속")을 기록해두는 것을 확인했다.
그런데 이 `duration` 필드를 읽거나 감소시키는 코드가 전체 420개 파일
어디에도 없음을 `grep`으로 확인했다 — `dismissVoidSummon()`은 플레이어가
직접 버튼을 눌러야만 소환체를 제거하는 수동 경로뿐이었다. 이는 앞서
10탄에서 고친 `MASTERY_LEVELS`의 `minTurns` 미기록 버그와 정확히 같은
클래스("필드는 선언돼 있지만 실제로 소비하는 코드가 없음")의 문제다.
그 결과 균열 소환수는 "3턴 후 자동으로 균열로 돌아간다"는 설계 의도와
달리, 플레이어가 일일이 수동으로 귀환시키지 않는 한 무제한으로
계속 쌓였다.

### 수정

다른 매 턴 tick 함수(`tickNpcBonds`/`tickFactionSimulation`)와 동일한
패턴으로 `tickVoidSummon()`을 신설해 매 턴 각 소환체의 `duration`을
1씩 줄이고, 0 이하가 되면 자동으로 귀환(제거) + 토스트 알림을 주도록
했다:

```js
export function tickVoidSummon() {
  try {
    const vs = loadVoidSummon();
    if (!vs.activeSummons || !vs.activeSummons.length) return;
    const remaining = [];
    const expired = [];
    vs.activeSummons.forEach(s => {
      const d = (s.duration !== undefined ? s.duration : 3) - 1;
      if (d > 0) remaining.push({ ...s, duration: d });
      else expired.push(s);
    });
    vs.activeSummons = remaining;
    saveVoidSummon(vs);
    if (expired.length) {
      expired.forEach(s => toast(`🌑 ${s.icon||''} ${s.name} 소환 지속시간 만료 — 균열 너머로 돌아갔다`, 2500));
    }
  } catch(e) { console.warn('[tickVoidSummon]', e); }
}
```

quest/086의 매 턴 처리 블록(`tickNpcBonds`/`tickFactionSimulation`이
호출되는 바로 그 자리)에 동일한 `typeof X==='function'` 가드 패턴으로
연결했다.

### 검증

Playwright로 `duration:2`인 소환체 하나를 직접 주입한 뒤
`tickVoidSummon()`을 두 번 연속 호출 — 1차 호출에서
`duration:2→1`(아직 살아있음, 개수 그대로), 2차 호출에서 만료되어
`activeSummons` 배열에서 제거됨(`count:0`)을 확인했다. **1차 구현에서
`saveVoidSummon()` 호출이 `if(expired.length)` 블록 안에만 있어
"아무것도 만료되지 않은 틱"에서는 감소된 duration 자체가 저장되지
않아 매번 원래 값(2)에서 다시 시작되는 자체 버그가 있었음을 검증
과정에서 발견 — 저장 호출을 조건문 밖으로 빼서 즉시 수정**.
`pw_final_regression.js`, `pw_18th_regression.js` 최종 회귀 전부
통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| summon/023 (`activateVoidSummon`의 `duration:3`을 소진시키는 로직이 전혀 없어 균열 소환수가 영구 누적) | **미구현 로직 발견·구현 (16탄)** | `tickVoidSummon()` 신설, quest/086 매 턴 처리 블록에 연결 |

---

## 20차(계속·17탄) — world/219: `faction_rep` GS 필드가 요구하는 "세력ID"가 AI에게 한 번도 노출된 적 없어, 세력 명성 시스템(v17)이 사실상 한 번도 정상 갱신된 적 없었던 버그

### 근본 원인

world/ 디렉토리 전수 재감사 중, 이 게임에 **완전히 독립적인 두 개의
세력 평판 시스템**이 동시에 살아 작동 중임을 발견했다:

1. **npc/067의 구 시스템** — `FACTIONS_BY_SCENARIO.medieval`(한글
   이름을 키로 직접 사용, 예: `'왕국 기사단'`, `'교회'`, `'상인 조합'`)
   + `updateFactionRep(name, delta)`. misc/068(전쟁 개입 UI)·
   data/072(랜덤 이벤트)·world/070(세계 반응) 등 게임 전역의 수십 곳이
   한글 이름으로 직접 호출하며 활발히 갱신된다.
2. **world/219의 v17 시스템** — `FACTION_DEFS`(영문 snake_case ID를
   키로 사용, 예: `kingdom_knights`, `church`, `merchants`) +
   `changeFactionRep(factionId, delta)`. AI가 출력하는
   `gs.faction_rep:{세력ID:증감}` GS 필드(ai-prompt/222)를 통해서만
   갱신되는, AI 전용 경로다.

문제는 v17 시스템의 `getFactionBLS()`(AI 프롬프트에 주입되는 안내문)가
`${def.icon}${def.name}:${rep}(${status})` 형태로 **한글 표시
이름(`def.name`)만 보여주고, 실제로 `changeFactionRep()`가 조회 키로
쓰는 영문 snake_case ID(`kingdom_knights` 등)는 이 텍스트 어디에도,
전체 코드베이스 어디에도 AI에게 노출된 적이 없었다**(`kingdom_knights`/
`mage_assoc`/`cabal` 등을 전수 검색해도 data/world/219 정의부 외에는
등장하지 않음을 확인). AI는 시스템 프롬프트 전체에서 세력을 오직
한글 이름으로만 봐왔으므로, `gs.faction_rep`를 실제로 출력할 때도
한글 이름이나 그 변형을 키로 쓸 수밖에 없었다 — 이는 `FACTION_DEFS`의
어떤 키와도 매칭되지 않아, `changeFactionRep()`가 매번 전혀 엉뚱한
새 키로 별도 항목만 만들어내고, 원래 8개 세력(`kingdom_knights` 등)의
`rep` 값은 초기 `baseRep`에서 단 한 번도 실제로 갱신되지 않는 상태로
남아 있었다 — 즉 v17 시스템은 존재는 하지만 AI가 원리적으로 절대
올바르게 조작할 수 없는, 사실상 죽어 있는 시스템이었다.

두 시스템이 같은 세력(예: 기사단·교회)을 서로 다른 이름/ID로 각각
추적하면서 둘 다 AI 프롬프트에 동시 주입되고 있어(`getFactionDesc()`
via misc/076, `getFactionBLS()` via misc/221), AI가 같은 세력에 대해
서로 다른 두 수치를 계속 보게 되는 구조적 이중화 문제이기도 했다.
두 시스템을 하나로 통합하는 것은 이번 감사 범위를 넘는 더 큰
설계 변경이므로, 이번엔 v17 시스템 자체가 원리적으로 절대 작동할 수
없던 근본 원인(ID 미노출)만 최소 수정으로 해결한다.

### 수정

`getFactionBLS()`가 한글 이름과 함께 실제 조회 키(ID)를 그대로
노출하고, AI에게 그 ID를 반드시 그대로 사용하라고 명시하도록 했다:

```js
return `${def.icon}${def.name}[ID:${id}]:${rep}(${status})`;
// ...
return `\n[⚖️ 세력 명성] ${lines.join(' | ')} — faction_rep GS 필드에는 반드시 위 [ID:...] 값을 그대로 사용하라(한글 이름 금지).`;
```

### 검증

Playwright로 `getFactionBLS()` 출력에 8개 세력 모두
`[ID:kingdom_knights]`처럼 정확한 조회 키가 포함됨을 확인했고,
`changeFactionRep('church', 8, ...)`처럼 그 ID로 직접 호출하면
`getFactionStatus('church')`와 재조회한 `getFactionBLS()`에 값이
정확히 반영됨을 확인(AI가 이제 이 텍스트를 그대로 복사해 쓰면
정상 작동함을 검증). `pw_final_regression.js`, `pw_18th_regression.js`
최종 회귀 전부 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| world/219 (`getFactionBLS()`가 `faction_rep` GS 필드에 필요한 실제 조회 ID를 AI에게 한 번도 노출한 적 없어 v17 세력 명성 시스템이 원리적으로 작동 불가) | **구조적 버그 발견·수정 (17탄)** | AI 안내문에 실제 ID를 노출하고 사용을 명시 — npc/067과의 시스템 이중화는 더 큰 통합 작업이 필요해 이번 범위에서 별도 기록만 남김 |

---

## 20차(계속·18탄) — world/199·misc/068: 전쟁 승패의 영구 반영(`applyFactionWarResult`)이 이중으로 죽어 있었고, 살아있었더라도 절반 확률로 승자·패자가 뒤바뀌었을 구조적 버그

### 근본 원인

world/ 디렉토리 전수 재감사 중 `world/199-...js`의
`hookFactionWarPermanence()`(즉시실행 IIFE)가 `window.
tickFactionSimulation`을 감싸 전쟁 종료 이벤트를 감지하고
`applyFactionWarResult()`(패전 세력 영향력 영구 감소 + AI용 GS
플래그 기록)를 호출하려던 것을 발견했다. 그런데 이 함수의 실제
호출부 3곳(quest/086 2곳, misc/068 1곳) 모두
`import { tickFactionSimulation } from '../npc/067-...js'`로 직접
바인딩해 bare 식별자로 호출하는 구조라 — 이 세션에서 이미 여러 번
확인된 "window.X 패치는 ES 모듈 클로저에 안 보인다" 근본 원인과
정확히 동일하게 — `window.tickFactionSimulation` 재할당이 실행된 적은
있어도 실제로 호출되는 코드는 언제나 import 시점에 고정된 npc/067의
원본 함수였다. 즉 이 훅은 처음부터 단 한 번도 실행되지 못했다.

더 심각한 건, **설령 이 훅이 정상적으로 도달했더라도 결과가
틀렸을 것**이라는 점이다. 실제 승패는 `misc/068`의 `applyWarDamage()`
안에서 `effA`/`effB`(실효 영향력) 비교로 정확히 계산되지만
(`const loser = effA <= effB ? a : b;`), 그 계산 결과가 이벤트 객체에
`winner`/`loser` 필드로 기록된 적이 없었다 — 오직 메시지 텍스트
안에만 녹아 있었다. world/199의 훅은 이걸 몰라서
`const winner = ev.winner || ev.a;`처럼 필드가 없으면 무조건 `a`를
승자로 가정했는데, `a`/`b`는 세력 쌍을 순회하는 루프의 임의 순서일
뿐 실제 승패와 무관하다 — 즉 도달했더라도 대략 절반의 확률로 실제
패자에게 오히려 전쟁 승리 보상(GS 플래그 `faction_war_X_won`)을
주고, 진짜 승자를 약화시켰을 것이다.

### 수정

이중으로 죽어있던 wrap 방식을 완전히 제거하고, 승패가 실제로
확정되는 바로 그 지점(`misc/068`의 `applyWarDamage()` 내부, 임계값
판정 직후)에서 올바른 `winner`/`loser`로 직접, 네이티브로 연결했다:

```js
const loser  = effA <= effB ? a : b;
const winner = loser === a ? b : a;
...
events.push({ a, b, winner, loser, from:'war', to:'conflict', ... isDefeat:true });
try{ if(typeof applyFactionWarResult==='function') applyFactionWarResult(winner, loser, warStart!==undefined ? now-warStart : 0); }catch(e){}
```

`misc/068`에 `world/199`의 `applyFactionWarResult`를 새로 import했다
(순환 참조 검토 완료 — `world/199`는 `npc/067`·`world/145`만
import하므로 새 순환 없음, 그리고 이 파일들 사이엔 이미 기존에도
`quest/086 ↔ misc/068` 순환 import가 정상 작동 중이었음을 확인).
world/199의 옛 IIFE 훅은 제거하고 경위를 설명하는 주석으로 대체했다.

### 검증

Playwright로 세력 두 곳을 전쟁 상태로 만들고 한쪽(B)의 전쟁
영향력 피해를 임계값 직전까지 미리 채운 뒤 `applyWarDamage()`를
직접 호출 — 이벤트 객체에 `winner:'왕국 기사단', loser:'마법사 협회'`가
정확히 기록되고(실제 피해가 더 큰 쪽이 정확히 패자로 판정됨),
`applyFactionWarResult`가 실행되어 GS 플래그
`faction_war_왕국 기사단_won`/`faction_weakened_마법사 협회`가
정확한 방향으로 기록됨을 확인했다. `pw_final_regression.js`,
`pw_18th_regression.js` 최종 회귀 전부 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| world/199 + misc/068 (`applyFactionWarResult`가 이중으로 도달 불가능했고, 도달했더라도 승자/패자가 절반 확률로 뒤바뀌었을 구조적 버그) | **구조적 버그 발견·수정 (18탄)** | 죽은 wrap 제거, 승패가 실제로 확정되는 `applyWarDamage()` 내부에서 올바른 winner/loser로 네이티브 연결 |

---

## 20차(계속·19탄) — world/115: `unlockHiddenMyth`가 사람이 읽는 설명 텍스트에 부분 문자열 검사를 해서, "심연의 진실" 히든 신화가 의도된 퀘스트 보상 경로로는 영원히 해금될 수 없었던 버그

### 근본 원인

world/ 디렉토리 전수 재감사 중 `unlockHiddenMyth(conditionKey)`가
`myth.unlockCondition.includes(conditionKey)`(부분 문자열 검사)로
해금 여부를 판정하는 것을 발견했다. `unlockCondition`은
`'cycle >= 1'`, `'abyss_secret 달성'`처럼 **사람이 읽는 설명
텍스트**인데, 실제 호출부는 그 안에 우연히 등장하는 문자열이 아니라
`myth.codexKey`(예: `'loop_origin'`, `'abyss_truth'`) 자체를 그대로
넘기고 있었다:

- `religion/119`의 퀘스트 보상 처리부는 `unlockHiddenMyth(r.codexUnlock)`를
  호출하며, `data/119`에 `codexUnlock:'abyss_truth'`인 퀘스트 보상이
  실제로 존재한다. 그런데 `abyss_truth` 신화 자신의
  `unlockCondition`은 `'abyss_secret 달성'`이라는 문자열이라 —
  `'abyss_secret 달성'.includes('abyss_truth')`가 항상 `false` —
  이 퀘스트를 완료해도 "심연의 진실 (극비)" 신화(심연 신앙이 사실
  마계 군주의 포섭 조직이라는 핵심 반전 서사)는 **원리적으로 절대
  해금될 수 없었다**.
- `core/122`는 `unlockHiddenMyth('cycle')`을 호출하는데, 이건
  `loop_origin` 신화의 `unlockCondition`("cycle >= 1")에 우연히
  `'cycle'`이라는 부분 문자열이 포함돼 있어서 "우연히" 작동하고
  있었을 뿐 — 설계상 의도된 정확한 키 매칭이 아니었다.

### 수정

`unlockHiddenMyth`의 판정을 `myth.codexKey === conditionKey`(정확한
키 일치)로 바꾸고, 우연히 맞아떨어지던 `core/122`의 호출도 실제
codexKey인 `'loop_origin'`을 넘기도록 함께 고쳤다:

```js
// world/115
if(myth.codexKey === conditionKey){ ... }

// core/122
if(cycle>=1) unlockHiddenMyth('loop_origin');
```

### 검증

Playwright로 `unlockHiddenMyth('abyss_truth')`와
`unlockHiddenMyth('loop_origin')`을 각각 직접 호출해, 두 히든 신화가
모두 도감(codex)에 정확히 기록됨을 확인(수정 전에는 `abyss_truth`가
어떤 입력으로도 해금 불가능했음을 코드 추적으로 확인). 정상 신화들의
초기 등록(`initMythologyCodex`)에는 영향 없음. `pw_final_regression.js`,
`pw_18th_regression.js` 최종 회귀 전부 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| world/115 (`unlockHiddenMyth`가 설명 텍스트에 부분 문자열 검사를 해 `abyss_truth` 히든 신화가 의도된 경로로 영원히 해금 불가) | **버그 발견·수정 (19탄)** | `codexKey` 정확 일치로 교체, `core/122`의 우연히 맞던 호출도 실제 키로 수정 |

---

## 20차(계속·20탄) — world/212: 왕국 관리 4개 함수가 전부 다른 키에 저장해, 왕국을 건설해도 다음 조작부터는 그 왕국이 존재하지 않는 것처럼 보이던 버그

### 근본 원인

world/ 디렉토리 전수 재감사 중 `world/212-9-왕국-시스템.js`의
`buildKingdom`/`upgradeKingdom`/`collectTax`/`expandTerritory` 4개
함수 모두가 `race/028`의 `loadKingdom()`(저장 키:
`"taleforge-kingdom"`)으로 현재 왕국 목록을 **읽어오면서도**, 저장은
이 파일 자체에서 새로 선언한 별도 상수 `KINGDOM_KEY2`(값:
`'tf-kingdom'`)에 하고 있었다. `'tf-kingdom'`이라는 키는 전체
코드베이스 어디에서도 다시 읽힌 적이 없음을 `grep`으로 확인했다 —
즉 순수하게 쓰기 전용으로만 쓰이는, 아무도 참조하지 않는 죽은 저장소였다.

그 결과: `buildKingdom()`으로 왕국을 건설하면 토스트·업적까지 정상
표시되지만, 그 즉시 `'tf-kingdom'`에만 저장되고 `"taleforge-kingdom"`은
그대로다. 바로 다음에 `upgradeKingdom`/`collectTax`/`expandTerritory`
중 무엇을 호출해도 이들은 항상 `loadKingdom()`으로
`"taleforge-kingdom"`을 다시 읽으므로 방금 건설한 왕국이 존재하지
않는 것으로 보여(`k`가 `undefined`) 조용히 아무 일도 하지 않고
종료된다 — 왕국 관리 시스템 전체가 "건설은 되지만 그 이후로는
절대 관리할 수 없는" 상태였다.

### 수정

`race/028`가 export하는 `saveKingdom()`(정확히 같은 키
`"taleforge-kingdom"`에 저장)을 함께 import해 4곳의 저장 호출을
전부 이걸로 교체했다. 별도 키 상수(`KINGDOM_KEY2`)와 미사용이 된
`lsSet` import는 제거했다.

### 검증

Playwright로 `buildKingdom('테스트왕국','kingdom')` → 반환된 id로
`getKingdomStats()` 조회(정상 발견) → `upgradeKingdom(id,'population')`
호출 → 같은 id로 다시 `getKingdomStats()` 조회 — 인구가
1000→1200으로 정상 반영됨을 확인(수정 전이라면 `upgradeKingdom`이
`k`를 찾지 못해 조용히 no-op됐을 상황). `localStorage`의
`'tf-kingdom'` 키가 더 이상 쓰이지 않고 `"taleforge-kingdom"`에
정상적으로 데이터가 쌓임도 확인. `pw_final_regression.js`,
`pw_18th_regression.js` 최종 회귀 전부 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| world/212 (왕국 관리 4개 함수의 저장 키가 조회 키와 달라 건설 직후부터 모든 관리 조작이 조용히 무효화) | **구조적 버그 발견·수정 (20탄)** | `race/028`의 `saveKingdom()`(동일 키)으로 저장부 통일 |

---

## 20차(계속·21탄) — world/190: `renderFactionPowerPanel`이 존재하지 않는 필드(`sim.tensions`)와 잘못된 구분자(`__`)를 읽어 "힘의 구도" 패널에서 전쟁 상태가 한 번도 표시된 적 없던 버그

### 근본 원인

world/ 디렉토리 전수 재감사 중 `renderFactionPowerPanel()`(세력
힘의 구도 시각화 패널)의 전쟁 감지 로직이
`const tensions = sim.tensions||{};`로 `loadFactionSim()`의 리턴값을
읽는 것을 발견했다. 그런데 이 세션 15탄에서 이미 확인한 대로
`loadFactionSim()`(npc/067)이 실제로 반환하는 구조는
`{relations, history, lastTick, warMeta}`이며, 긴장도는
`relations` 필드에 `_simKey(a,b) = [a,b].sort().join('|||')`
(파이프 3개) 형태의 키로 저장된다 — `tensions`라는 필드 자체가
존재한 적이 없고, 구분자도 `'__'`가 아니라 `'|||'`이었다. 그 결과
`Object.entries(tensions)`는 항상 빈 배열이 되어 `wars` 배열이
영원히 비어있었고, 이 패널의 "⚔️ 현재 전쟁" 배너와 세력별
"⚔️ 전쟁중" 표시는 실제 전쟁 상태와 무관하게 절대 나타난 적이
없었다.

### 수정

올바른 필드명(`relations`)과 구분자(`'|||'`)로 교체했다:

```js
const relations = sim.relations||{};
const wars = [];
Object.entries(relations).forEach(([k,t])=>{
  if(t>=90){
    const [a,b] = k.split('|||');
    if(a&&b) wars.push({a,b});
  }
});
```

### 검증

Playwright로 두 세력 사이에 긴장도 95(전쟁 상태)인 `sim.relations`를
직접 주입한 뒤 `renderFactionPowerPanel()`을 호출 — 수정 전이라면
항상 비어있었을 "⚔️ 현재 전쟁" 배너가 정확히 두 세력 이름과 함께
렌더링됨을 확인. `pw_final_regression.js`, `pw_18th_regression.js`
최종 회귀 전부 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| world/190 (`renderFactionPowerPanel`이 존재하지 않는 `sim.tensions`/잘못된 구분자를 읽어 전쟁 상태가 한 번도 표시되지 않던 버그) | **버그 발견·수정 (21탄)** | `sim.relations` + `'\|\|\|'` 구분자로 교체 |

---

## 20차(계속·22탄) — world/214: 탑승 수단(말·배 등)의 이동 속도/인카운터 배율 조정이 이중으로 죽어있던 버그

### 근본 원인

world/ 디렉토리 전수 재감사 중 `world/214-11-날씨-자동-순환.js`에서
이 세션에서 이미 여러 번 확인된 "window.X 패치가 ES 모듈 클로저에
안 보인다" 근본 원인의 **가장 극단적인 사례**를 발견했다 — 이번엔
심지어 **같은 파일 안에서** 발생했다:

1. `hookTransportTimeCost`는 `window.detectActionTimeCost`를 감싸
   탑승 수단의 속도 배율(`speedMult`)을 이동 시간 소모에 반영하려
   했다. 그런데 이 함수의 유일한 호출부인 `advanceTimeByAction()`은
   **같은 파일 안에서** `detectActionTimeCost(...)`를 bare 식별자로
   호출한다 — JS에서는 같은 모듈 안이라도 함수 선언(`export function
   detectActionTimeCost(){...}`)이 만드는 렉시컬 바인딩이 나중의
   `window.X = ...` 재할당보다 항상 우선하므로, 이 wrap은 같은 파일에
   나란히 있으면서도 단 한 번도 실행되지 못했다. 결과: 말·배 등
   탑승 수단을 타도 이동에 걸리는 시간이 전혀 줄어들지 않았다.
2. `hookTransportResetAfterUse`는 `window.advanceTimeByAction`을
   감싸 "탑승 후 한 번 사용하면 다음 턴부터 다시 도보로 전환"되도록
   초기화하려 했다. 그런데 이 함수의 유일한 외부 호출부(quest/086)는
   `import { advanceTimeByAction } from '../world/214-...js'`로 직접
   바인딩해 호출하므로 — 다른 죽은 훅들과 동일한 원인 — 이 wrap도
   한 번도 실행되지 않았다. 결과: `getCurrentEncounterMult()`가 참조하는
   `S._activeTransport`가 절대 초기화되지 않아, 한 번 탑승하면 그
   탑승 수단의 인카운터 배율이 이후 모든 행동에 영구히 적용되는
   상태였다(사양은 "1회 사용 후 초기화"였음).

### 수정

두 wrap을 전부 제거하고, 그 로직을 `advanceTimeByAction()` 본문에
네이티브로 흡수했다 — 비용 계산 직후 탑승 수단 배율을 적용하고,
반환 직전에 사용 여부를 확인해 초기화한다:

```js
let cost = detectActionTimeCost(userMsg, aiText);
if(cost === 2.0 || cost === 4.0){
  const t = TRANSPORT_CONFIG[S?._activeTransport];
  if(t && S._activeTransport!=='walk'){
    cost = t.isTeleport ? 0.1 : Math.max(0.2, cost / (t.speedMult||1));
  }
}
// ... 기존 로직 ...
if(S._activeTransport && S._activeTransportSetAt !== undefined && (S?.msgCount||0) > S._activeTransportSetAt){
  S._activeTransport = null;
}
```

### 검증

Playwright로 `recordTransportTimeCost('horse')` 후 같은 턴에
`advanceTimeByAction('이동한다','')` 호출 — 기본 2.0이던 시간 소모가
0.8로 정상 감소함을 확인(탑승 수단 배율이 처음으로 실제 반영됨).
같은 턴 안에서는 `S._activeTransport`가 유지되고, 다음 턴 호출에서는
정확히 `null`로 초기화됨을 확인(1회 사용 후 도보 복귀 사양이 처음으로
실제 작동). `pw_final_regression.js`, `pw_18th_regression.js` 최종
회귀 전부 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| world/214 (탑승 수단 속도/배율 조정 2곳이 모두 같은 원인으로 도달 불가능해 탑승 수단 기능이 사실상 절반만 작동) | **구조적 버그 발견·수정 (22탄)** | 두 죽은 wrap 제거, `advanceTimeByAction()`에 네이티브로 흡수 |

---

## 20차(계속·23탄) — items/176·177·178: `saveGold(...); else if(...) updateHeader()` 패턴 3곳에서 골드 소모 후 헤더 표시가 절대 갱신되지 않던 버그

### 근본 원인

items/ 디렉토리 전수 재감사 중, 룬 추출(`extractRune`, items/176)·
보석 제거(`removeGem`, items/177)·아이템 강화(`enhanceItem2`,
items/178) 3곳 모두에서 동일한 코드 패턴을 발견했다:

```js
if(typeof saveGold==='function') saveGold(S.gold); else if(typeof window.updateHeader==='function') window.updateHeader();
```

`else if`이기 때문에 `saveGold`가 존재하면(실제 빌드에서는 항상
존재) `window.updateHeader()`는 **절대 실행되지 않는다**. `saveGold`
자체를 확인해보니 `(n) => lsSet(GOLD_KEY, String(n))`로 순수하게
localStorage에 쓰기만 할 뿐 헤더 갱신은 하지 않는다. 그 결과 룬
추출·보석 제거·아이템 강화로 골드를 소모해도, 화면 상단 헤더에
표시되는 골드 숫자가 즉시 갱신되지 않고 다른 우연한 계기(패널 전환
등)로 헤더가 다시 그려지기 전까지 계속 소모 이전 값으로 남아있었다
— 실제 자산(S.gold, localStorage)은 정확했지만 화면 표시만 깨진
전형적인 "값은 맞는데 순서가 틀려 표시가 안 되는" 버그.

### 수정

세 곳 모두 `else if`를 제거하고 `saveGold`와 `updateHeader`를 각각
독립적으로(둘 다) 실행하도록 분리했다:

```js
if(typeof saveGold==='function') saveGold(S.gold);
if(typeof window.updateHeader==='function') window.updateHeader();
```

### 검증

Playwright로 장착 장비에 룬을 심어둔 뒤 `window.updateHeader`를
가로채는 스파이로 교체하고 `extractRune('weapon', 0)`을 호출 —
수정 전이라면 0회였을 `updateHeader` 호출이 정확히 1회 실행되고,
골드도 1000→800으로 정상 차감됨을 확인. `pw_final_regression.js`,
`pw_18th_regression.js` 최종 회귀 전부 통과(1회 일시적 플레이키 결과는
즉시 재실행으로 정상 확인), 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| items/176, 177, 178 (`saveGold(...); else if updateHeader()` 패턴으로 골드 소모 후 헤더가 갱신되지 않음) | **버그 발견·수정 (23탄, 3곳 동일 패턴)** | `else if`를 분리된 두 개의 `if`로 교체 |

---

## 20차(계속·24탄) — lore/312 서약 "가호" 보너스(+15)가 실제 판정에 전혀 반영되지 않던 버그

### 근본 원인

quest/ 디렉토리 전수 재감사 중 `lore/312-⑤-서약-시스템.js`의
`markOath(id, 'kept')`를 발견했다:

```js
if(result==='kept'){
  o.kept = (o.kept||0)+1;
  toast('✅ 서약을 지켰습니다! 가호가 임합니다', 2000);
  // 임시 보너스: 다음 판정에 +15
  S._oathBonus = (S._oathBonus||0)+15;
  setTimeout(()=>{ S._oathBonus=0; },30000);
}
```

주석이 명시하듯 "다음 판정에 +15"라는 실제 수치 보너스를 의도한
코드였다. 그런데 이 값을 실제로 읽는 곳은 `getOathBLSHint()`
(ai-prompt/319가 buildLightSystem에 연결) 하나뿐이었고, 그마저도
`S._oathBonus>0`이면 "이번 행동에 미묘한 신성한 도움이 따른다"는
AI용 서사 힌트 문자열만 만들 뿐이었다. 실제 판정 성공률을 결정하는
quest/086 `sendMsg`의 `effStat` 합산식(`statValue + survivalPenalty +
partyBonus + ... + passiveBonus`)에는 `S._oathBonus`가 어디에도
포함되지 않았다 — 전수 검색으로 quest/086 전체에서 `_oathBonus`
참조가 0건임을 확인. 즉 서약을 지켜도 "가호가 임한다"는 토스트와
AI에게 가는 서사 힌트만 나갈 뿐, 실제 주사위 판정(effStat)은
전혀 강화되지 않는 이름뿐인 보너스였다.

### 수정

`effStat` 합산식에 `oathBonus`를 추가하고, `!isCasual` 블록(실제
주사위를 굴리는 지점) 초입에서 사용 직후 즉시 소진시켜 30초
타임아웃 이전에 우연히 여러 번 판정해도 한 번만 적용되게 했다:

```js
const oathBonus = S._oathBonus||0;
const effStat = Math.max(1, statValue + ... + passiveBonus + oathBonus);
...
if(!isCasual){
  diceRoll=Math.floor(Math.random()*100)+1;
  ...
  if(oathBonus>0) S._oathBonus = 0;
```

### 검증

Playwright로 테스트 캐릭터(모든 스탯 50) 생성 후 `addOath` +
`markOath(id,'kept')`로 `S._oathBonus`를 15로 설정, 곧바로
`sendMsg('적을 검으로 공격한다', false)` 호출 — 수정 전이라면
`effStat`(=STR 50 + lukBonus 5 = 55)만 나왔을 것이 수정 후
`rollInfo.statValue === 70`(50+5+15)으로 정확히 +15 반영됨을
확인했고, 판정 직후 `S._oathBonus`가 0으로 소진됨도 함께 확인.
`pw_final_regression.js` 최종 회귀 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| lore/312 (서약 가호 +15가 AI 서사 힌트로만 나가고 실제 판정 effStat에는 미반영) | **버그 발견·수정 (24탄)** | quest/086 sendMsg의 effStat 합산식에 oathBonus 추가 + 판정 직후 1회 소진 |

---

## 20차(계속) — 알려졌지만 보류한 이슈: lore/316 심층 트라우마의 statPenalty가 실제 판정에 미반영

`lore/316-⑦-심층-트라우마-시스템.js`의 각 트라우마는
`{"stat":"wil","amount":8}` 같은 구체적인 스탯 페널티를 갖고 있고,
패널 UI 문구도 "트라우마는 특정 상황에서 판정 페널티를 주고..."라고
명시해 실제 판정 메커니즘 연동을 의도했음을 보여준다. 하지만
`getTraumaDeepBLS()`(AI 서사 힌트 생성)와 UI 표시 외에는
`statPenalty`를 읽는 코드가 전무하다 — lore/312 서약 가호(24탄)와
같은 "선언은 됐지만 실제 판정에 연결 안 된" 클래스의 버그다.

다만 서약 가호는 "다음 판정에 무조건 +15"라는 단순 무조건부 보너스라
기존 effStat 합산식에 더하기만 하면 끝나는 반면, 트라우마는 "화재나
연기를 마주할 때"처럼 자연어 트리거 조건이 있어 사용자의 자유 행동
텍스트와 안정적으로 매칭할 방법이 없다(트라우마 8종의 `trigger`
필드는 사람이 읽는 문장이지 정규식 패턴이 아님 — `TRAUMA_CATEGORY_
PATTERNS`는 트라우마 "생성" 시 분류용으로만 있고 이후 "발동 감지"
용으로 재사용하도록 설계되지 않았다). 이 상태에서 임의로 "같은
스탯을 굴릴 때마다 페널티 적용" 같은 근사 규칙을 넣으면 "특정
상황에서만"이라는 원래 설계 의도(항상이 아니라 상황이 맞을 때만)를
왜곡할 위험이 있어, 이번 감사에서는 확신 없는 재설계 대신 발견
사실만 기록해두고 보류한다.

| 파일 | 판정 | 조치 |
|---|---|---|
| lore/316 (트라우마 statPenalty가 실제 판정에 미반영) | **발견·보류** (자연어 트리거 매칭 설계 필요, 근사 규칙은 원 설계 왜곡 위험) | 미조치 — 향후 트리거 감지 설계 필요 시 재검토 |

---

## 20차(계속·25탄) — ai-prompt/172 계승(Heritage) 보너스가 "페이지 로드 5초 후" 1회성 타이머라 사실상 한 번도 적용될 수 없던 버그

### 근본 원인

`ai-prompt/172-GS-처리-sendMsg-훅.js`의 `autoApplyHeritage`는 다음과
같이 페이지 로드 5초 뒤 딱 한 번 `applyHeritageToNewLoop()`(계승
아이템의 ATK/DEF/HP 보너스·경험치 배율·시작 골드를 실제 `S.stats`·
`S.gold`에 반영하고 오프닝에 서사 힌트를 주입하는 함수)를 시도했다:

```js
setTimeout(function(){
  if(S.character && typeof applyHeritageToNewLoop==='function'){
    const applied = applyHeritageToNewLoop();
    ...
  }
}, 5000);
```

문제는 이 5초가 지날 때 `S.character`가 존재해야 조건이 통과하는데,
실제 캐릭터 생성은 종족→이름→신분→직업→성격→배경→시작대륙→목표까지
8단계 입력 화면을 거치므로 사실상 항상 5초를 넘긴다 — 즉 **최초
플레이에서는 이 타이머가 항상 허탕을 쳤다.** 게다가 `doReincarnate()`
(core/084)는 페이지를 새로고침하지 않고 화면만 초기화하므로, 한 번
소진된 이 1회성 `setTimeout`은 **두 번째 회차부터도 절대 재실행되지
않는다.** 결과적으로 "새 회차 시작 시 적용"이라는 함수명의 의도와
달리, 이 계승 보너스 시스템은 어떤 플레이 패턴에서도 사실상 한 번도
발동할 수 없는 죽은 트리거였다(작업 #62에서 이미 GS 필드 처리는
고쳤지만, 이 초기 적용 로직 자체는 그때 발견되지 않았음).

실제 "새 회차가 시작되는" 시점은 `core/084`의 `startGame()`이다 —
캐릭터 설정 마법사의 마지막 단계에서 `setupNext()`가 `else
startGame();`으로 **bare 식별자 직접 호출**하므로(이 파일 안에서
`window.startGame`을 감싸는 방식은 이미 죽은 훅으로 확인된 전례가
있음 — 1420번째 줄 주석 참고), `startGame()` 안에 직접 연결해야
매 회차(최초 게임 시작 + 모든 환생 이후 재시작)마다 정확히 한 번씩
실행된다.

### 수정

`ai-prompt/172`의 죽은 타이머를 제거하고, `core/084`의 `startGame()`
안 `doStartChat()` 호출 직전(오프닝에 계승 서사 힌트가 실리려면
`doStartChat`보다 먼저 실행돼야 함)에 네이티브로 연결했다:

```js
if(typeof window.applyHeritageToNewLoop==='function'){
  try{
    const _heritageApplied = window.applyHeritageToNewLoop();
    if(_heritageApplied && (_heritageApplied.goldBonus>0 || (_heritageApplied.stats&&(_heritageApplied.stats.atk||_heritageApplied.stats.def||_heritageApplied.stats.hp)))){
      const _loop = typeof window.v36_getReincarnationCount==='function' ? window.v36_getReincarnationCount() : 0;
      if(_loop>0) setTimeout(()=>toast('🏛️ 계승 보너스 적용됨 — 전생의 기억이 이 몸에 남아있다', 4000), 700);
    }
  }catch(e){}
}
doStartChat();
```

### 검증

Playwright로 `tf-heritage-v2`에 계승 아이템 `scarred_soul`(ATK+15,
DEF+10)을 미리 심어두고 `window.setupChar`에 테스트 캐릭터 데이터를
채운 뒤 `window.startGame()`을 직접 호출 — 수정 전이라면 절대 반영
안 됐을 스탯이, 수정 후 `S.heritageApplied`에 `{atk:15, def:10}`이
정확히 계산되고 `S.stats.str`/`S.stats.end`에 실제로 +15/+10 반영됨을
확인. 오류 없이 화면이 정상적으로 `chat`으로 전환됨(즉 `doStartChat()`
까지 정상 완주)도 확인. `pw_final_regression.js` 최종 회귀 통과,
콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| ai-prompt/172 (계승 보너스 적용이 페이지 로드 5초 후 1회성 타이머라 사실상 발동 불가) | **버그 발견·수정 (25탄)** | 죽은 타이머 제거, core/084 startGame()의 doStartChat() 호출 직전에 네이티브 연결 |

---

## 20차(계속·26탄) — 존재하지 않는 스탯 키(wis/lck/sanity)로 보상·비용이 조용히 증발하던 버그 4건

### 배경

`ai-prompt/148`의 `processGSBlock` GS stats 처리부(AI가 `<gs>` 블록으로
스탯 변화를 보낼 때 파싱하는 곳)의 `statMap`에 `wis:'wis'`,
`lck:'lck'`, `sanity:'sanity'`가 자기 자신에게 매핑돼 있는 것을 발견하고
조사를 시작했다. 실제 `S.stats`의 진짜 키(`data/010` `STAT_DEFS`)는
`luk`(행운), `per`(통찰/지혜 계열), `wil`(의지/정신력)이며 — `wis`,
`lck`, `sanity`라는 키는 게임 어디에도 존재하지 않는다. 이 매핑이
아무 의미가 없다면(AI가 이런 키를 쓸 일이 없다면) 그냥 죽은 코드지만,
같은 세 잘못된 키 이름이 코드베이스 다른 두 곳(운명 카드, 회차루프
보상)에서도 독립적으로 발견되면서 — 이것이 이 프로젝트 전반에 퍼진
"흔한 RPG 스탯 이름(STR/AGI/INT/WIS/CHA/LCK)을 관습적으로 썼다가
실제 커스텀 스탯 체계(luk/per/wil)와 어긋난" 하나의 근본 원인 클래스
버그라는 것이 드러났다.

### 버그 1 — `misc/216` 운명의 카드: LCK/WIS/정신력 카드 4종이 전부 무효 버프

`applyFateCard()`가 `FATE_CARD_DEFS`의 effect 키를 그대로
`S.stats.lck`, `S.stats.wis`, `S.stats.sanity`에 대입하고 있었다.
예를 들어 카드 「별」은 "행운이 깃든다. 행운+15"라는 설명과 함께
toast로 "운명의 카드: 별! — 행운이 깃든다"라고 성공 메시지까지
띄우지만, 실제로는 `S.stats.lck`라는 아무도 읽지 않는 유령 속성에
+15가 쌓일 뿐 진짜 행운 스탯(`S.stats.luk`)은 전혀 바뀌지 않았다.
같은 이유로 「달」/「은둔자」(WIS+10~15)과 「바보」(정신력-10)도 전부
무효였다. `FATE_CARD_DEFS` 10종 중 4종(40%)이 실질적으로 아무 효과가
없는 가짜 보상/페널티였던 것.

랜덤 효과 카드(`e.random`)의 대상 스탯 배열도
`['str','agi','int','wis','cha','lck']`로 되어 있어 6분의 2 확률로
역시 유령 스탯에 값이 쌓이는 완전 무효 굴림이었다.

### 버그 2 — `progression/220` 회차루프 보상: 3회차/5회차 보상이 항상 버려짐

`getLoopRewards(cycleNum)`이 3회차 이상 "루프 경험 +행운"(`stat:'lck'`),
5회차 이상 "반복된 지혜"(`stat:'wis'`) 보상을 반환하지만,
`applyLoopCycleExtras()`의 적용부는 `S.stats[r.stat] !== undefined`
가드를 통과해야만 실제로 더해진다 — `lck`/`wis` 둘 다 `S.stats`에
없는 키라 이 가드에 걸려 두 보상 모두 매번 조용히 버려지고 있었다
(20회차 이상의 `stat:'all'` 보상과 10회차의 스킬 보상만 실제로 동작).

### 버그 3 — `ui/201` 봉인된 기억: "정신력 소모"가 사실은 항상 공짜

전생 기록 보관소 패널의 "봉인된 기억 개봉" 버튼은 확인창에
"정신력 N을(를) 소모해 기억을 엽니다"라고 명시하고, 클릭 시
`openSealedMemory()`로 기억을 실제로 열어준 뒤
`if(S.stats&&S.stats.sanity!==undefined){S.stats.sanity -= N; ...}`로
비용을 차감하려 시도한다. 그러나 `S.stats.sanity`는 게임 전체에서
한 번도 초기화되지 않는 키라 이 `!==undefined` 가드가 항상 거짓이 되어
차감 로직 자체가 통째로 스킵됐다 — 결과적으로 봉인된 기억은 (버그 1이
만든 유령 `S.stats.sanity`가 우연히 존재하지 않는 한) 항상 공짜로
열렸다. mentalCost는 20~40으로 설계돼 있어 실제로는 유의미한 자원
소모여야 했다.

### 근본 원인 (공통)

세 곳 모두 "정신력/지혜/행운"이라는 한국어 개념을 흔한 영문 약어
(`sanity`/`wis`/`lck`)로 직역해 하드코딩했는데, 정작 이 게임의 실제
스탯 체계(`STAT_DEFS`)는 `luk`(행운), `per`(통찰 — "숨겨진 것을
꿰뚫어보는 눈"), `wil`(의지 — "정신적 저항력 및 신념")이라는 다른
이름을 쓴다. 세 시스템이 서로 다른 시점에 작성되며 이 불일치가
반복된 것으로 보인다. 참고로 `quest/086`의 텍스트 키워드 분류기는
이미 "정신력/의지/굳건/두려움을 극복" 같은 문구를 `wil`로 매핑해
두고 있어(1633번째 줄), 이 코드베이스에서 "정신력"의 정식 대응 스탯이
`wil`이라는 것을 확인할 수 있었다.

### 조치

- **`misc/216-13-운명-카드-시스템.js`**: `applyFateCard()`에서
  `e.lck`→`S.stats.luk`, `e.wis`→`S.stats.per`("지혜"는 항상 `int`와
  짝지어 등장하므로 `int`와 구분되는 실존 스탯 `per`에 매핑),
  `e.sanity`→`S.stats.wil`(코드베이스 기존 "정신력→wil" 관례를 따름)로
  교정. 랜덤 대상 배열도 `['str','agi','int','per','cha','luk']`로 교정.
- **`progression/220-18-회차루프-시스템.js`**: `getLoopRewards()`의
  보상 stat 키를 `lck`→`luk`, `wis`→`per`로 교정.
- **`ui/201-NEW-8-Carry-over-UI-패널.js`**: 봉인된 기억 개봉 버튼의
  차감 대상을 `S.stats.sanity`→`S.stats.wil`로 교정 — 이제 실제로
  mentalCost만큼 `wil`이 깎인다.
- **`ai-prompt/148`**: `processGSBlock`의 `statMap`도 방어적으로
  `wis:'per'`, `lck:'luk'`, `sanity:'wil'`로 교정 — AI가 흔한 RPG
  관례로 이 키 이름을 GS에 써서 보내는 경우에도 더 이상 조용히
  버려지지 않고 실제 스탯에 반영된다.

### 검증

Playwright로 `window.S.stats`를 최소 스켈레톤으로 채운 뒤:
- `applyFateCard({effect:{lck:15}})` → `S.stats.luk` 50→65 확인,
  `S.stats.lck` 생성 안 됨(undefined) 확인.
- `applyFateCard({effect:{int:10,wis:10}})` → `S.stats.per` 50→60 확인.
- `applyFateCard({effect:{lck:30,sanity:-10}})` → `S.stats.wil` 50→40
  확인.
- `getLoopRewards(3)`/`getLoopRewards(5)`가 각각 `stat:'luk'`,
  `stat:'per'`를 반환함을 확인, `applyLoopCycleExtras(3)`/`(5)` 호출
  후 `S.stats.luk`/`S.stats.per`에 각각 +5/+10이 실제로 반영됨을 확인.

`pw_final_regression.js` 최종 회귀 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| misc/216 (운명 카드 LCK/WIS/정신력 효과가 유령 스탯 키로 증발) | **버그 발견·수정 (26탄)** | lck→luk, wis→per, sanity→wil로 교정 |
| progression/220 (3·5회차 루프 보상이 존재하지 않는 스탯 키라 항상 버려짐) | **버그 발견·수정 (26탄)** | lck→luk, wis→per로 교정 |
| ui/201 (봉인된 기억 "정신력 소모"가 존재하지 않는 sanity 키라 항상 공짜로 열림) | **버그 발견·수정 (26탄)** | S.stats.sanity→S.stats.wil로 교정 |
| ai-prompt/148 (GS stats 파싱기의 statMap도 동일한 잘못된 키 매핑) | **버그 발견·수정 (26탄, 방어적)** | wis→per, lck→luk, sanity→wil로 교정 |

---

## 20차(계속·27탄) — ui/234: 스탯 패널이 완전히 빈 화면으로만 열리던 치명적 버그

### 배경

전체 파일 정밀 재감사 중 `ui/234-⑥-스탯-성장-미니-스파크라인-그래프-renderStats-보강.js`를
검사하다가, 이전에 이미 여러 번 발견했던 "top-level(비-deferred) capture
타이밍 버그" 패턴과 정확히 일치하는 코드를 발견했다:

```js
export const _origRenderStats = window.renderStats || (typeof window.renderStats!=='undefined' ? window.renderStats : null);

export function __tfDeferred_209(){
window.renderStats = function(){
  if(typeof _origRenderStats==='function') _origRenderStats.call(this);
  // 스파크라인 주입 ...
};
}
```

`_origRenderStats`를 캡처하는 첫 줄이 **모듈 최상위(top-level)**에 있다.
그런데 진짜 스탯 패널을 그리는 `renderStats()`(items/189)는 그 정의
자체가 `__tfDeferred_166` **안에** 있다 — 즉 이 파일의 최상위 코드가
실행되는 시점(모든 모듈의 최상위 코드가 실행되는 단계, deferred 함수는
아직 하나도 실행 전)에는 `window.renderStats`가 항상 `undefined`다.
결과적으로 `_origRenderStats`는 항상 `null`로 영구 고정되고, 이후
`__tfDeferred_209`(main.js의 deferred 배열에서 `__tfDeferred_166`보다
뒤에 실행됨)가 `window.renderStats`를 위 래퍼로 덮어쓰면 —
`_origRenderStats`가 여전히 `null`이라 `typeof _origRenderStats==='function'`
가드에 걸려 **진짜 렌더링 코드가 영원히 호출되지 않는다.**

실제 스탯 패널을 여는 유일한 경로(quest/086 `openP` switch의
`case 'stats': window.renderStats(); break;`)가 이 깨진 래퍼를 호출하므로,
게임에서 ⚙️ 스탯 메뉴를 열면 **레벨/EXP/카르마/8개 스탯 전부가 통째로
빈 화면**으로만 나온다 — 이 방대한 감사 세션 내내 전투·퀘스트·세계
상태 위주로 검증해왔고 스탯 패널 자체를 직접 열어 확인한 적이 없어
지금까지 발견되지 않았던 것으로 보인다.

부가 발견: 이 래퍼가 스파크라인을 주입하려던 대상 셀렉터(`.stat-row`,
`.st-nm`, `.st-val`)는 애초에 items/189의 실제 렌더링 코드가 만드는
DOM 구조에 존재하지 않는다 — 진짜 `renderStats()`는 각 스탯 줄마다
`getStatSparkline(d.id)`를 직접 호출해 스파크라인을 이미 인라인으로
그려 넣고 있다. 즉 이 래퍼의 스파크라인 주입 로직 자체는 (렌더링을
막는 문제와 별개로) 애초에 아무것도 찾지 못하는 죽은 보강 코드였다 —
해가 없어 그대로 둔다.

### 조치

`_origRenderStats` 캡처를 모듈 최상위에서 `__tfDeferred_209` 함수
본문 안, `window.renderStats` 재할당 직전으로 옮겼다. `__tfDeferred_166`
(진짜 renderStats 정의)이 배열 순서상 `__tfDeferred_209`보다 먼저
실행되므로, 이 시점에는 `window.renderStats`가 이미 진짜 함수로
채워져 있어 정상적으로 캡처된다.

```js
export function __tfDeferred_209(){
const _origRenderStats = window.renderStats;
window.renderStats = function(){
  if(typeof _origRenderStats==='function') _origRenderStats.call(this);
  ...
};
}
```

### 검증

Playwright로 `#pb-stats`에 마커 텍스트를 넣어둔 뒤 `window.renderStats()`를
직접 호출 — 수정 전에는 마커가 그대로 남아있어(아무 변화 없음) 완전히
빈 렌더링임을 확인. 수정 후에는 실제 레벨/EXP 바/카르마/스탯 목록
HTML이 정상적으로 그려짐을 확인. `pw_final_regression.js` 최종 회귀
통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| ui/234 (스탯 패널이 top-level 캡처 타이밍 버그로 완전히 빈 화면만 나오던 치명적 버그) | **버그 발견·수정 (27탄)** | _origRenderStats 캡처를 __tfDeferred_209 함수 본문 안으로 이동 |

---

## 20차(계속·28탄) — progression/020: 오크 종족 "혈전 게이지" 헤더 배지가 한 번도 생성되지 않던 버그

### 배경

27탄(ui/234)에서 발견한 "deferred 함수 실행 순서" 버그 클래스가 코드베이스
전체에 더 있는지 확인하기 위해, `const _orig\w* = window\.\w+` 형태의
모든 캡처 지점을 전수 조사했다(총 30여 곳). 대부분은 이미 이전 회차
감사에서 정확히 이 문제로 수정된 이력이 있었고(코드 내 주석으로 확인),
나머지는 같은 파일 안에서 순서상 안전하거나 이미 올바른 deferred 함수
안에 있어 문제가 없었다. 그러나 `progression/020-101130번-환생-누적-시스템.js`
6662번째 줄의 오크 종족 전용 헤더 배지("혈전 게이지") 래핑 코드에서
정확히 동일한 버그를 하나 더 발견했다:

```js
export function __tfDeferred_17(){
  ...
  window.updateHeader = (function() {
    const _orig = window.updateHeader || function(){};
    ...
  })();
```

`__tfDeferred_17`은 main.js의 deferred 실행 배열에서 **두 번째**로
실행된다. 그런데 `window.updateHeader`의 진짜 정의(quest/086의
`updateHeader()` 함수 + `window.updateHeader = updateHeader`)는
`__tfDeferred_67`(배열상 **13번째**) 안에 있다. 즉 `__tfDeferred_17`이
실행되는 시점엔 `window.updateHeader`가 아직 `undefined`라 `_orig`가
빈 함수로 폴백하고, 이 상태로 만들어진 오크 전용 래퍼가
`window.updateHeader`에 할당된다. 그런데 곧이어 `__tfDeferred_67`이
`window.updateHeader = updateHeader`로 **통째로 덮어써버려**(래핑이
아니라 단순 재할당) 이 오크 래퍼 자체가 완전히 사라진다.

결과적으로 게임이 시작된 이래 **오크 종족을 선택한 플레이어의 헤더에
"혈전 게이지"(`#h-gorblood`) 배지가 단 한 번도 생성된 적이 없다** —
`updateGorbloodUI()`(게이지 수치 갱신)와 `renderOrcHonorPanel()`(패널
렌더링) 자체는 멀쩡히 동작하지만, 그 진입점인 헤더 배지가 애초에 DOM에
존재하지 않아 플레이어가 클릭해서 열 방법이 없었다.

### 조치

오크 래퍼 코드 전체를 `setTimeout(fn, 0)`으로 감쌌다. main.js는 모든
`__tfDeferred_N` 함수를 동기적으로 순회 호출한 뒤에야 이벤트 루프로
넘어가므로, `setTimeout`은 지연 시간과 무관하게 **모든** deferred 함수
(물론 `__tfDeferred_67`도 포함)가 끝난 뒤에만 실행된다. 이 시점에는
`window.updateHeader`가 이미 최종 조립된 진짜 함수이므로 정상적으로
캡처·체이닝된다.

### 검증

Playwright로 `S.character.race = '오크'`로 설정하고 `.hdr-stats` DOM을
준비한 뒤 `window.updateHeader()` 호출 — 수정 전에는 `#h-gorblood`가
전혀 생성되지 않음을 확인(`window.updateHeader.toString()`에도 오크
관련 코드가 전혀 없음). 수정 후에는 `#h-gorblood` 배지가 정상 생성되고
`window.updateHeader.toString()`에 오크 분기 코드가 포함됨을 확인.
`pw_final_regression.js` 최종 회귀 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| progression/020 (오크 "혈전 게이지" 헤더 배지가 deferred 실행 순서 문제로 한 번도 생성되지 않던 버그) | **버그 발견·수정 (28탄)** | 래핑 코드를 setTimeout(fn,0)으로 감싸 모든 deferred 함수 완료 후 실행되도록 수정 |

---

## 20차(계속·29탄) — 56개 히든 직업의 "서사 개성"(systemHint)이 게임 출시 이래 AI에게 단 한 번도 전달된 적 없던 버그

### 배경

`progression/` 디렉터리 전수 감사 중 오래된 dead-export 스캐너
(scan_dead_exports2.js)를 재실행해 호출부 없는 export를 다시 훑다가,
`recordCyberImprint`/`recordSwordTechnique`/`triggerSwordGhost`(race/028)가
quest/086에 **import는 되어 있지만 실제로 호출된 적이 전혀 없는** 상태를
발견했다. 조사 과정에서:

- `recordCyberImprint`가 다루는 `CYBER_IMPLANTS`는 "신경 링크(해킹 판정)",
  "총기 피해 -30%" 등 명백히 사이버펑크 데이터이고, 이를 노출하는
  `cyberSection`도 `isCyberpunk` 시나리오 게이트가 걸려 있다. 그런데
  `SCENARIOS = [MEDIEVAL_SCENARIO]`(50차 "비-중세 시나리오 제거"로 이미
  중세 판타지 하나만 남음) 상태라 `isCyberpunk`는 영원히 거짓 — 즉 이건
  버그가 아니라 시나리오 정리 이후 자연히 죽은, 의도된 잔여 코드였다.
  손대지 않았다.
- `recordSwordTechnique`/`triggerSwordGhost`(검귀 빙의)는 다른 문제였다.
  대응하는 `swordSection`은 `isWuxia`(무협/강호) 게이트가 걸려 있는데,
  이 검귀 빙의는 job/029의 히든 직업 「방랑 검귀」(중세 판타지에서도
  정상적으로 해금 가능 — scenario 목록에 "중세 판타지"가 명시돼 있고,
  20차 감사에서 lowHpWins 카운터까지 이미 연결해뒀다)와 연결된 기능이라
  무협 시나리오가 없어도 살아있어야 정상인 기능이었다. 그런데 이 조각들이
  들어있던 자리가 바로 **ai-prompt/077의 죽은 `buildSystem()`**(17차에
  이미 사멸 확인, 실제 프롬프트 조립기는 buildLightSystem) 내부였다.

  이 지점에서 buildSystem 안의 "숨겨진 직업 시스템 힌트"
  (`hiddenJobSection`) 조각 전체를 들여다봤는데, 결정적 결함을 하나 더
  발견했다:
  ```js
  const hiddenJobDef = HIDDEN_JOBS.find(j => j.name === char.role);
  ```
  히든 직업이 실제로 해금되는 경로(job/029 `unlockHiddenJob`)는
  `loadHiddenJobs()`라는 **별도의 해금 목록**에만 기록을 남기고,
  `S.character.role`은 절대 히든 직업 이름으로 바꾸지 않는다(원래
  기본 직업명 그대로 유지됨). 즉 `char.role === hiddenJobDef.name`
  조건은 buildSystem이 살아있었다 해도 처음부터 항상 거짓이었을,
  이중으로 죽어있던 로직이다.

  결과적으로 job/029에 정의된 **56개 히든 직업 전부**가 각자 명시한
  `systemHint`(예: 방랑 검귀 "검귀가 때때로 목소리를 내거나 조언하는
  묘사를 포함하십시오", 별지식가 "별자리에 따라 다른 힘을 쓰는 묘사"
  등 — 히든 직업 각성 시 AI에게 약속하는 서사적 개성 지침)가 **게임
  출시 이래 단 한 번도 AI 프롬프트에 전달된 적이 없었다.** 히든 직업을
  각성해도 스탯 보너스만 조용히 적용될 뿐, 광고된 서사적 특색은 전혀
  드러나지 않는 상태였다.

### 조치

죽은 `hiddenJobSection` 로직을 실제 해금 여부 기준(`getUnlockedHiddenJobs()`)
으로 다시 작성해 `ai-prompt/077`에 새 함수 `getHiddenJobBLS()`로
추출하고, misc/330의 SECTION_FNS 훅(B80/18차/19차와 동일한 검증된 경로)에
합류시켰다. 해금된 히든 직업이 여러 개라도 전부 각자의 systemHint를
포함하도록 처리한다. `recordSwordTechnique`/`triggerSwordGhost`(구체적
절기 습득·저HP 자동 발동 연출)는 systemHint의 일반 서사 지침과 별개로
"어떤 절기를 언제 배우는가"라는 새 게임 디자인 결정이 필요한 별도
범위라 이번엔 손대지 않고, 가장 확실하고 파급력이 큰 systemHint 전달
결함만 고쳤다.

### 검증

Playwright로 `taleforge-hidden-jobs`에 `wandering_ghost`(방랑 검귀)를
해금 상태로 미리 심어두고 `window.getHiddenJobBLS()`를 직접 호출 —
"[🔓 숨겨진 직업 — 👻방랑 검귀] 캐릭터 안에 검귀가 때때로 목소리를
내거나..." 문자열이 정확히 반환됨을 확인. 이어서 `window.buildLightSystem()`
전체 호출 결과에도 "방랑 검귀"가 포함됨을 확인해, 실제 매 턴 AI에게
전달되는 최종 프롬프트까지 연결됨을 검증했다. `pw_final_regression.js`
최종 회귀 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| ai-prompt/077 (56개 히든 직업의 systemHint가 이중으로 죽은 로직 안에 갇혀 게임 출시 이래 AI에게 전달된 적 없음) | **버그 발견·수정 (29탄)** | getHiddenJobBLS() 신규 작성(실제 해금 목록 기준), misc/330 SECTION_FNS에 등록 |
| race/028 (CYBER_IMPLANTS/isCyberpunk 게이트) | **비-버그 확인** | 50차 시나리오 정리 이후 자연히 죽은 의도된 잔여 코드 — 손대지 않음 |

---

## 20차(계속) — 알려졌지만 보류한 이슈: dead-export 재스캔에서 발견한 미완성 기능 후보들

29탄을 계기로 오래된 dead-export 스캐너(scan_dead_exports2.js)를 전체
재실행해 "선언은 있지만 호출부가 전혀 없는" export를 다시 훑었다.
대부분(patches/183의 리셋·테마 버튼들, quest/086의 seekOutHero 등)은
`template.html`의 onclick에서만 호출되거나(스캐너가 .js 파일만 봐서
놓친 오탐), `b.onclick = fn`처럼 괄호 없는 함수 참조 할당으로 연결돼
있어(misc/293의 showGrowthComparePanel/showPlayStylePanel) 실제로는
정상 작동 중임을 확인했다. world/212의 왕국 관리 5종 함수(buildKingdom/
upgradeKingdom/collectTax/expandTerritory/getKingdomStats)는 진짜로
호출부가 없지만, race/028에 이미 완전히 별개로 작동하는 `foundKingdom()`
(ui/155에서 정상 호출됨, `getKingdomLegacy()` BLS의 실제 데이터
공급원)이 존재하고 데이터 모양도 서로 호환되지 않아 — 이건 버그가
아니라 v50 시기에 시도됐다가 더 단순한 foundKingdom 설계로 대체된
죽은 중복 구현으로 판단, 손대지 않았다.

(이 항목은 이후 "30탄" 라운드에서 대부분 실제로 연결했다 — 아래
"20차(계속·30탄)" 참고. 최종적으로 정말 손대지 않고 남겨둔 항목만
그 섹션 끝에 정리했다.)

---

## 20차(계속·30탄) — 전수조사 중 발견한 "완성됐지만 연결부 없는" 함수 8건을 실제로 연결

29탄 직후 "전수조사라면 파고드는 것도 이미 포함된 것 아니냐"는 지적을
받아들여, 29탄에서 발견만 하고 미뤄뒀던 항목들을 하나씩 다시 조사해
안전하게 연결 가능한 것은 전부 실제로 연결했다.

### 30-1. quest/209 `failQuest`/`activateQuest`/`abandonQuest` — 퀘스트가 구조적으로 "완료"만 가능했던 문제

AI가 완료를 알리는 GS 필드(`q_done`)는 있었지만 실패·포기를 알리는
대칭 필드(`q_fail`/`q_abandon`)가 아예 존재하지 않아, 한 번 수락한
퀘스트는 영원히 "완료" 상태로만 끝날 수 있었다. `ai-prompt/222`에
`q_done`과 완전히 대칭되는 처리를 추가하고, `quest/086`의 실제 GS
스키마(`_GS_RULE`, AI에게 매 턴 전달되는 진짜 프롬프트)에도
`"q_fail":[]`, `"q_fail_reason":"..."`, `"q_abandon":[]`을 추가했다.

### 30-2. misc/053 `checkBounty` → quest/086 `huntBountyTarget` — 현상금 게시판이 "구경만" 가능했던 문제

`huntBountyTarget(name)`이 표적을 실제로 추적해 전투를 시작시키는
로직까지 완성돼 있었는데, 게시판의 유일한 현상금 상호작용
(`checkBounty`)은 최고액 수배자 정보를 toast로 보여주기만 하고 끝나
실제로 사냥을 시작할 방법이 없었다. 다른 게시판 액션들과 동일한
"클릭 한 번 = 즉시 결과 하나" 패턴으로 최고액 표적을 바로 추적하도록
연결했다.

### 30-3. npc/211 로맨스 관계 단계가 AI에게 한 번도 전달되지 않던 문제

`addRomancePoint`는 GS 필드 `romance`로 매 턴 정상적으로 호감도를
쌓고 있었지만, 그 결과(안면/친구/호감/연인/영원한 인연 단계)를 AI에게
알려주는 경로가 전혀 없어, 이미 "연인" 사이인 NPC를 AI가 계속 초면처럼
대하는 서사 일관성 붕괴가 발생할 수 있었다. 새 함수 `getRomanceBLS()`를
작성해 misc/330 SECTION_FNS(29탄과 동일한 검증된 경로)에 등록했다.

### 30-4. race/198 `resolveNpcGrudge` — 한 번 쌓인 원한이 절대 풀리지 않던 문제

원한을 추가하는 로직(`gs.npc[].rel`이 hostile/enemy일 때)은 있었지만,
정반대로 관계가 다시 우호적으로 회복됐을 때 원한을 해소하는 대칭
로직이 없어 `resolveNpcGrudge`가 완성된 채로 방치돼 있었다. 원한 추가와
정확히 같은 GS 훅(`hookNpcGrudgeFromGS`) 안에, `n.rel==='friendly'`일
때 기존 원한을 해소하는 대칭 분기를 추가했다.

### 30-5. race/260 "야수 각성" 단계가 AI에게 전달되지 않던 문제

수인족의 "야생의 법칙"(무리 서열·야수의 피·사냥꾼의 윤리)은 이미
`getRaceSpecialHint()`를 통해 AI에게 전달되고 있었지만, 완전히 별개
시스템인 "각성"(`gainBeastAwakening`/`BEAST_AWAKENING_STAGES` — 실제로
`S.stats`에 보너스·페널티까지 적용됨)은 서사적 상태(단계별 aiHint)가
전달되는 경로가 전혀 없었다. `getRaceSpecialHint()`의 수인 분기에
`getBeastAwakeningStatus()` 결과를 추가로 이어붙였다.

### 30-6. misc/293 `getNpcTopicHint` — 대화 주제 캐시가 한 번도 안 쓰이던 문제

`cacheNpcTopicResponse`는 매 턴 NPC별 이전 답변을 정상적으로 캐싱하고
있었지만, 그 캐시를 읽어 "이 주제로 전에도 답했었다"는 일관성 힌트를
만드는 `getNpcTopicHint`를 실제로 호출해 프롬프트에 주입하는 곳이 전혀
없어 캐시가 쌓이기만 할 뿐 한 번도 활용된 적이 없었다. `sendMsg()`의
`buildDilemmaContext`(동일한 "사용자 메시지 분석 → 프롬프트 주입" 위치)
바로 옆에, 이번 메시지에 언급된 NPC를 찾아 힌트를 주입하도록 연결했다.

### 30-7. misc/261 `showLastSessionSummary` — "이전 세션 요약" 모달이 한 번도 뜬 적 없던 문제

`saveSessionSummary`는 `startGame()` 진입 시점마다 정상적으로 세션
로그를 쌓고 있었지만(25탄 이전에 이미 이 저장 경로 자체는 살아있었음),
그 로그를 플레이어에게 보여주는 `showLastSessionSummary` 모달을 실제로
띄우는 곳이 없어 로그만 계속 쌓이고 한 번도 표시되지 않았다.
`doStartChat()` 직후(오프닝 서사가 뜬 다음) 짧은 지연을 두고
표시하도록 연결했다 — 최초 플레이(로그 없음)에서는 함수 내부에서
조용히 무시된다.

### 30-8. ui/025 엘프 "망각 스택" 시스템 전체가 죽어있던 문제

`renderElfForgettingPanel`의 UI 안내문은 "망각 스택은 트라우마·기억
봉인·세월 등 서사적 사건으로만 쌓입니다"라고 명시하는데, 정작 그
서사적 사건을 감지하는 `detectElfForgettingFromText`가 같은 종족의
다른 감지기들(엘프 기억, 인간 각성, 오크 업보 등)과 나란히 있어야 할
텍스트 감지 디스패처(quest/086)에 빠져 있었다 — 엘프족을 플레이해도
망각 스택이 영원히 0에서 움직이지 않던 구조적 결함. 같은 자리에
동일한 패턴으로 연결했다.

### 검증

Playwright로 각 함수를 직접 호출하거나 실제 GS/사용자 메시지 흐름을
재현해 검증했다: `processGSBlock({q_fail:[...]})` 후 퀘스트 상태가
`failed`로, `q_abandon`은 `abandoned`로 정확히 바뀜을 확인. 현상금
게시판 클릭 → `tf-monsters`에 표적이 실제로 등록됨을 확인(주의:
`processNpcTurnsHostileGS`는 `processGSBlock` 함수 본문 안의 중첩
선언이라 실제 게임에서는 이미 여러 턴 전에 노출되지만, 갓 로드한
테스트 페이지에서는 `processGSBlock({})`을 한 번 먼저 호출해 워밍업해야
함을 확인). `getRomanceBLS()`가 연인 단계 NPC를 정확히 포함하는 문자열을
반환함을 확인. `getNpcTopicHint()`가 캐시된 주제와 일치하는 사용자
메시지에 정확한 힌트를 반환함을 확인. `startGame`의 함수 소스에
`showLastSessionSummary` 호출이 포함됨을 확인. `pw_final_regression.js`
최종 회귀 통과, 콘솔 에러 없음.

### 조사했지만 결국 손대지 않은 것 (근거 포함)

- **misc/292 `addGoldWithExchange`**: 대륙별 환율을 적용한 골드 지급
  유틸이지만, 이를 가장 넓게 적용할 자리(GS `"gold"` 필드 처리,
  `ai-prompt/148`)는 AI가 서사에서 이미 특정 숫자를 말한 뒤 그 숫자를
  그대로 지급하는 경로라, 여기에 환율을 추가로 곱하면 "AI가 서사에서
  말한 금액"과 "실제로 지급된 금액"이 달라지는 서사-메커니즘 불일치를
  새로 만들 위험이 있다. 원래 의도(개별 flavor 액션에 환율 적용)가
  불명확해 잘못 연결하면 기존 버그보다 더 혼란스러운 결과를 만들 수
  있다고 판단해 보류했다.
- **misc/253 `getActivityMasteryProgress`**: 마스터리 타이틀 자동 지급
  (`checkActivityMastery`)은 이미 정상 동작 중이라 실질 게임플레이에
  영향은 없고, 순수하게 "다음 단계까지 진행도"를 보여주는 화면 표시
  기능이 빠진 것뿐이다. 어느 패널에 넣는 게 자연스러운지(업적? 칭호?
  스탯?) 근거가 없어 임의로 끼워 넣지 않았다.
- **summon/147 `recordSummonMemory`/`loadSummonMemDB`**: 쓰기·읽기
  양쪽 모두 코드베이스 어디에도 연결돼 있지 않은, 처음부터 끝까지
  통째로 미사용인 기능이다. 전투/임무/대화/유대 각각 정확히 어떤
  순간에 기록해야 하는지에 대한 근거가 코드에 없어(다른 시스템처럼
  "이 자리에 있던 훅이 죽어있었다"는 흔적조차 없음) 새로 설계하는
  영역이라 판단, 이번 라운드에서는 손대지 않았다.
- **npc/143 `getRelation`**, **world/214 `getWeatherEffect`**: 각각의
  기능을 이미 대체하는 살아있는 경로가 확인됐다 —
  `getRelation`(특정 NPC 쌍 조회)은 이미 쓰이고 있는 `getNpcRelations`
  (한 NPC의 전체 관계 조회, ai-prompt/152에서 실사용 중)로 화면 표시
  요구가 이미 충족되고, `getWeatherEffect`(atm.weather 단순 래퍼)는
  ai-prompt/077이 `atm.weather`를 이미 직접 읽고 있어 래퍼 자체가
  필요 없다. 둘 다 해가 없는 미사용 헬퍼로 판정, 그대로 둔다.
- **world/115 `initMythologyCodex`**, **patches/297 `animBossRoom`**:
  재조사 결과 둘 다 이미 정상적으로 호출되고 있었다(`setTimeout(fn, N)`/
  `setTimeout(fn, N)`처럼 괄호 없는 함수 참조로 전달되는 방식이라
  dead-export 스캐너의 `NAME(` 패턴 매칭에 걸리지 않은 오탐이었다).
  **버그 아님**으로 정정.
- **world/212 왕국 관리 5종**(`buildKingdom` 등), **ui/155
  `enterDungeon`/`getDungeonBLS`**: 조사 결과 각각 더 단순하거나(→
  race/028의 `foundKingdom`, 이미 정상 작동) 더 정교한(→ combat/257의
  `startAIDungeonExplore` 던전 시스템, 이미 정상 작동) 후속 구현으로
  대체된 v50 시기의 죽은 중복 구현이었다. 같은 저장 키를 다른 데이터
  모양으로 쓰기 때문에 잘못 연결하면 오히려 살아있는 시스템을
  깨뜨릴 위험이 있어 **손대지 않는 것이 정답**으로 확정.

| 파일 | 판정 | 조치 |
|---|---|---|
| quest/209 + ai-prompt/222 + quest/086 (퀘스트가 "완료"만 가능하고 실패·포기 불가) | **버그 발견·수정 (30-1)** | q_fail/q_abandon GS 필드 신설 및 처리·프롬프트 스키마 추가 |
| misc/053 (현상금 게시판이 구경만 가능) | **버그 발견·수정 (30-2)** | checkBounty가 huntBountyTarget을 실제로 호출하도록 연결 |
| npc/211 (로맨스 관계 단계가 AI에게 미전달) | **버그 발견·수정 (30-3)** | getRomanceBLS() 신설, SECTION_FNS 등록 |
| race/198 (원한이 절대 해소되지 않음) | **버그 발견·수정 (30-4)** | rel:'friendly' 시 resolveNpcGrudge 대칭 호출 추가 |
| race/260 + ai-prompt/077 (야수 각성 단계 AI 미전달) | **버그 발견·수정 (30-5)** | getRaceSpecialHint 수인 분기에 각성 상태 추가 |
| misc/293 + quest/086 (NPC 대화 주제 캐시 미활용) | **버그 발견·수정 (30-6)** | sendMsg 사전 전송부에 getNpcTopicHint 연결 |
| misc/261 + core/084 (이전 세션 요약 모달 미표시) | **버그 발견·수정 (30-7)** | startGame()의 doStartChat() 직후 연결 |
| ui/025 + quest/086 (엘프 망각 스택 시스템 전체 미작동) | **버그 발견·수정 (30-8)** | detectElfForgettingFromText를 텍스트 감지 디스패처에 연결 |
| world/115, patches/297 | **오탐 정정 (버그 아님)** | 괄호 없는 함수 참조 호출이라 스캐너가 놓친 것 — 이미 정상 작동 |
| world/212, ui/155(enterDungeon) | **비-버그 확인** | 각각 더 단순/정교한 후속 구현으로 대체된 죽은 중복 구현 |
| misc/292, misc/253, summon/147, npc/143, world/214 | **보류(근거 부족 또는 위험)** | 각주 참고 |

---

## 20차(계속·31탄) — 명예의 전당(Hall of Fame)이 게임 출시 이래 단 한 번도 기록된 적 없던 버그

### 배경

30탄에 이어 progression/ 디렉터리를 계속 감사하던 중,
`progression/194`(명예의 전당)의 `hookHofOnEnding`이 정확히 이 세션
전체를 관통하는 "죽은 window.X 감싸기" 패턴이라는 것을 발견했다:

```js
(function hookHofOnEnding(){
  const _orig = window.triggerStoryEnding;
  setTimeout(()=>{
    ...
    window.triggerStoryEnding = function(){
      ... recordHallOfFame(top.id) ...
      return fn.apply(this, arguments);
    };
  }, 500);
})();
```

`triggerStoryEnding`의 **유일한 실제 호출부**(`job/042`의 두 곳, 8장
완료 시)는 `quest/086`에서 **ES import로 직접 가져온 바인딩을 bare로
호출**한다(`import { triggerStoryEnding } from '../quest/086...js'`
→ `triggerStoryEnding()`). 이 bare 호출은 항상 quest/086의 진짜 함수
정의를 직접 참조하므로, `window.triggerStoryEnding`을 재할당하는 이
감싸기는 처음부터 절대 적용될 수 없었다.

더 흥미로운 점은, 19차 감사에서 이미 이 감싸기 "내부"의 버그(원래는
`endingId`가 인자로 넘어올 거라 잘못 가정해 `recordHallOfFame(undefined)`
만 호출하던 문제)를 정확히 찾아내 고쳤다는 것이다 — 그런데 그 감싸기
자체가 죽어있었으니, 그 수정도 실질적으로는 아무 효과가 없었다.
결과적으로 **어떤 엔딩을 달성해도 명예의 전당에는 게임 출시 이래
단 한 번도 기록이 남지 않았다** — `renderHallOfFamePanel()`을 열어도
"아직 기록이 없습니다"만 영원히 표시됐을 것이다.

### 조치

`recordHallOfFame(top.id)` 호출을 `quest/086`의 `triggerStoryEnding()`
정의부 안, 이미 `top`(어떤 엔딩인지)이 계산돼 있는 바로 그 자리에
네이티브로 옮겼다. progression/194의 죽은 `hookHofOnEnding` IIFE는
제거하고 경위를 설명하는 주석으로 교체했다.

### 검증

Playwright로 `window.checkEndingConditions`를 가짜 엔딩("영웅 엔딩")을
반환하도록 스텁한 뒤 `window.triggerStoryEnding()`을 직접 호출 —
`tf-hall-of-fame`에 캐릭터 이름·종족·역할·엔딩·회차·턴·레벨·골드가
정확히 포함된 새 항목이 추가됨을 확인(수정 전에는 이 스토리지가
영원히 빈 배열로 남았을 것). `pw_final_regression.js` 최종 회귀 통과,
콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| progression/194 + quest/086 (명예의 전당이 게임 출시 이래 한 번도 기록된 적 없음) | **버그 발견·수정 (31탄)** | recordHallOfFame 호출을 triggerStoryEnding() 정의부 안으로 네이티브 이동, 죽은 wrapper 제거 |

---

## 20차(계속·32탄) — 칭호 획득 시 스탯 보너스·SP·연결 스킬·토스트가 매번 조용히 스킵되던 버그 (progression/236)

### 배경

`progression/236`(칭호 획득 드라마틱 연출)의 `__tfDeferred_211`은
"칭호 획득" 배너(`showTitleUnlockEffect`)를 띄우기 위해
`window.addTitle`을 감싼다:

```js
} else if(typeof window.addTitle === 'function'){
  const __origAT = window.addTitle;
  window.addTitle = function(titleData){
    __origAT.call(this, titleData);
    try{ setTimeout(()=>showTitleUnlockEffect(titleData), 300); }catch(e){}
  };
}
```

한편 실제 칭호 지급의 지배적 경로인 `grantTitle()`(quest/086, 외부
호출부 27곳 — 순수 `window.addTitle` 직접 호출부는 2곳뿐)은 `addTitle`의
**반환값**에 의존해 보상을 지급한다:

```js
export function grantTitle(titleId){
  const def=TITLE_DEFS.find(d=>d.id===titleId); if(!def) return;
  if(window.addTitle(def)){            // ← 반환값으로 신규 획득 여부 판단
    S.titles=loadTitles();
    if(def.bonus){ ...스탯 보너스... }
    toast(def.icon+' 칭호 획득: '+def.name, 3000);
    const sp=def.rarity==='legendary'?3:def.rarity==='rare'?2:1;
    S.skillSP+=sp; saveSkillSP(S.skillSP);
    getAllSkillDefs().filter(...unlockTitle===titleId).forEach(...);  // 연결 스킬 해금
  }
}
```

`job/010`의 실제 `addTitle` 원본은 `true`(신규 획득)/`false`(이미
보유)를 반환하도록 설계돼 있다:

```js
window.addTitle = (title) => {
  const existing = loadTitles();
  if (existing.find(t => t.id === title.id)) return false;
  saveTitles([...existing, {...title, earnedAt: new Date().toISOString()}]);
  return true;
};
```

그런데 `__tfDeferred_211`의 래퍼는 `__origAT.call(this, titleData)`의
반환값을 그냥 버리고(`return` 문 없음) 항상 `undefined`를 돌려준다.
`undefined`는 falsy이므로, 이 래퍼가 설치된 이후로 `grantTitle()`을
통한 모든 칭호 지급에서 `if(window.addTitle(def))` 분기가 절대
참이 되지 못했다 — 즉 **칭호를 얻어도 스탯 보너스가 적용되지 않고,
스킬 포인트(SP)도 지급되지 않고, 칭호에 연결된 이벤트 스킬도
해금되지 않고, "칭호 획득" 토스트조차 뜨지 않는** 상태로, 오직
`showTitleUnlockEffect` 배너 연출만 (setTimeout으로 원본 호출과
분리돼 있어) 정상적으로 표시되고 있었다. 30탄 이전 계보의 "dead
window.X wrap via ES import"와는 다른 변종으로, 이번엔 훅 자체가
호출은 제대로 되지만(같은 파일 안에서 `window.addTitle` 프로퍼티로
접근하므로 바인딩 문제는 없음) **반환값 계약을 깨뜨려** 하위 로직을
무력화시킨 사례다. 27곳 중 어느 한 곳이라도 새로 칭호를 받을 때마다
이 문제가 재현되므로, 게임 전체에서 칭호 시스템의 보상 절반(연출
제외 전부)이 이 파일이 추가된 시점부터 완전히 죽어 있었다.

부수적으로, 반환값을 무시하다 보니 **이미 보유한 칭호를 다시
"획득"하려 해도(`false` 반환) 배너가 무조건 떴다** — 이 역시 함께
수정했다(배너를 `__r !== false`일 때만 표시하도록 게이팅).

### 조치

`__tfDeferred_211`의 두 래퍼(`unlockTitle`/`window.addTitle`) 모두
원본 호출 결과를 `__r`에 저장해 그대로 `return`하도록 수정하고,
배너 표시도 `__r !== false`(신규 획득)일 때만 실행하도록 게이팅했다.
`unlockTitle` 분기는 해당 이름의 함수가 코드베이스 어디에도 존재하지
않아(스킬 정의 객체의 무관한 `.unlockTitle` 프로퍼티만 존재) 현재는
항상 미실행이지만, 동일한 반환값 누락 버그가 잠재해 있었으므로
대칭적으로 함께 고쳤다.

### 검증

Playwright로 확인:
- `window.addTitle(fakeTitle)`을 두 번 연속 호출 — 첫 호출은 `true`,
  같은 id로 두 번째 호출은 `false`를 정확히 반환함을 확인(수정 전:
  둘 다 `undefined`).
- 첫 호출(신규 획득) 후 300ms 대기 → `#title-banner` DOM에 정상 생성.
- 배너 제거 후 동일 id로 재호출(이미 보유, `false`) → 300ms 대기해도
  `#title-banner`가 생성되지 않음을 확인(수정 전: 매번 무조건 표시).

`pw_final_regression.js` 최종 회귀 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| progression/236 (칭호 지급 시 스탯 보너스·SP·연결 스킬·토스트가 전부 조용히 스킵됨) | **버그 발견·수정 (32탄)** | addTitle/unlockTitle 래퍼가 원본 반환값을 그대로 전달하도록 수정, 배너도 신규 획득 시에만 표시하도록 게이팅 |

---

## 20차(계속·33탄) — misc/ 전수조사 중 발견한 "dead window.X wrap via ES import" 2건 (openTransportPanel, renderDemesnePanel)

### 배경

misc/ 디렉토리 전수조사 중, 이 세션 전체에서 가장 많이 재발한 버그
패턴("파일 A가 실제 구현을 export하고, 파일 B가 그 실제 구현을
window.X에 재할당해 훅을 거는데, 파일 C가 A를 직접 import해서 bare로
호출하면 B의 훅이 통째로 무시된다")과 정확히 일치하는 사례가 코드베이스
전체를 대상으로 한 자동 스캐너(export된 실제 구현 + 그걸 감싸는
`window.X = function` 재할당 + 그 실제 구현을 bare import해 호출하는
제3의 파일, 세 조건을 모두 만족하는 조합을 찾는 스크립트)에서 2건 더
확인됐다.

**① `openTransportPanel`** — 실제 구현은 `misc/054`
(`export function openTransportPanel`). `race/064`의
`patchOpenTransportPanel`이 `window.openTransportPanel`을 감싸,
이동수단 패널을 열 때 플레이어가 영지(영토)를 보유하고 있으면 목록에서
자기 영지 항목에 금색 테두리(★ 강조)를 추가한다. 그런데 `misc/053`
(게시판/장소 상호작용 시스템)의 위치별 상호작용 액션 테이블에서
`useTransport: ()=>{ openTransportPanel(transportType); }`가
`openTransportPanel`을 `misc/054`에서 직접 import해 bare로 호출하고
있어, 이 특정 상호작용 경로로 이동수단 패널을 열면 영지 강조 훅이
전혀 적용되지 않았다(패널 자체는 정상 작동, 강조 표시만 누락).

**② `renderDemesnePanel`** — 실제 구현은 `race/260`
(`export function renderDemesnePanel`). `misc/323`의
`hookV5toRenderPanel`이 `window.renderDemesnePanel`을 감싸, 영지
패널을 그릴 때마다 "영지 V5" 확장 섹션(교역/이웃 영지 등 심화 정보)도
함께 갱신한다. 그런데 `race/064`의 `_onArriveAtDemesne`(영지에 도착할
때 실행)이 `renderDemesnePanel`을 bare import로 `setTimeout(...,
300)`에 콜백으로 넘기고 있어, 영지 패널이 이미 열려 있는 상태로
영지에 도착하면 기본 패널만 갱신되고 V5 확장 섹션은 낡은 내용 그대로
남았다.

두 경우 모두 같은 파일 안의 다른 위치(HTML `onclick="renderX()"` 인라인
핸들러 등)에서는 이미 `window.X`를 정상적으로 거치고 있어 완전히 죽은
기능은 아니었지만, 특정 호출 경로에서만 훅이 누락되는 부분적
회귀였다.

### 조치

두 곳 모두 bare 호출을 `window.X`가 있으면 그것을, 없으면(초기 로드
타이밍 등 극히 예외적인 경우) bare 참조로 폴백하는 형태로 교체했다 —
이 세션에서 반복적으로 써온 것과 동일한 패턴.
- `misc/053`: `openTransportPanel(transportType)` →
  `(typeof window.openTransportPanel==='function'?window.openTransportPanel:openTransportPanel)(transportType)`
- `race/064`: `setTimeout(renderDemesnePanel, 300)` →
  `setTimeout(()=>{ (window.renderDemesnePanel||renderDemesnePanel)(); }, 300)`

### 검증

Playwright로 페이지 로드 후 6초 대기(두 훅 모두 `setTimeout` 폴링
방식으로 자가 설치되므로 충분히 대기) — `window._demesneTransportPatched`,
`window._v5RenderHooked`가 모두 `true`로 정상 설치됐고, 콘솔 에러 없음을
확인. `pw_final_regression.js` 최종 회귀 통과.

| 파일 | 판정 | 조치 |
|---|---|---|
| misc/053 (영지 이동수단 목록 강조 훅이 useTransport 경로에서 누락) | **버그 발견·수정 (33탄)** | openTransportPanel bare 호출을 window.openTransportPanel 우선 호출로 교체 |
| race/064 (영지 도착 시 V5 확장 패널이 갱신 안 됨) | **버그 발견·수정 (33탄)** | renderDemesnePanel bare 호출을 window.renderDemesnePanel 우선 호출로 교체 |

---

## 20차(계속·34탄) — 다크링 종족 "공허 감지"(Void Sense) 서사 힌트가 AI에게 한 번도 전달된 적 없던 문제 (misc/022)

### 배경

misc/ 전수조사 중 `misc/022-2-공허-감지-시스템.js`를 읽다가, 다크링
종족 전용 "공허 감지"(Void Sense) 시스템 전체가 패널 UI 안에서만
동작하고 실제 AI 서사에는 전혀 반영되지 않는다는 것을 확인했다.

- `getVoidSenseAIHint()`: 다크링의 공허 단계(0~7)에 따라 "대화 상대의
  숨겨진 의도·공포를 이미 읽고 있다"는 완성된 서사 힌트 문장을
  생성하는 함수. 하지만 이 함수를 실제로 호출하는 곳은 `misc/022`
  자신의 패널 미리보기(`renderVoidSensePanel`, "AI 자동 주입 힌트
  미리보기" 섹션)뿐이었다 — 이름 그대로 "미리보기"일 뿐 실제 프롬프트
  조립 경로 어디에도 연결돼 있지 않았다.
- 실제 라이브 AI 프롬프트 조립 경로(`ai-prompt/077`의
  `getSavedStateExpansionSection` — `buildLightSystem`에 정상적으로
  연결된 함수, 19차에서 이미 확인된 살아있는 함수)의 다크링 분기는
  `다크링 공허 수치: ${dv.void}` 라는 순수 숫자만 프롬프트에
  넣었고, `getVoidSenseAIHint()`가 만드는 "NPC의 비밀을 이미 읽고
  있다"는 실제 서사적 지시는 빠져 있었다.

즉 플레이어가 다크링으로 공허 단계를 아무리 올려도, AI는 그 사실을
숫자로만 전달받을 뿐 "이 다크링 앞에서 NPC의 거짓말이 통하지 않는다"는
서사적 함의를 전혀 몰랐다 — 패널에는 "PER +25, NEG +15 보너스가
적용된다"고 표시되지만 그 보너스를 AI에게 알려주는 경로 자체가
없었던 것.

(참고: 이 게임의 협상·설득류 판정은 별도의 결정론적 주사위 함수 없이
AI가 프롬프트에 명시된 스탯/보너스 힌트를 서사적으로 반영하는 방식이라 —
이 세션에서 이미 여러 번 확인된 구조 — `getVoidSenseAIHint()`를 실제
프롬프트에 넣는 것 자체가 완전한 수정이며, 별도의 수치 계산 로직을
새로 만들 필요는 없다.)

### 조치

`ai-prompt/077`에 `getVoidSenseAIHint`를 `misc/022`에서 직접 import하고,
`getSavedStateExpansionSection()`의 다크링 분기(`다크링 공허 수치:` 줄
바로 다음)에 네이티브로 호출을 추가했다 — 죽은 `buildSystem()`(2333줄,
호출부 없음, 확인된 죽은 함수) 안의 바이트 동일한 중복 블록은 건드리지
않도록 정확한 줄 번호를 지정해 삽입했다.

### 검증

Playwright로 `S.character.race`를 '다크링'으로, `tf-darkling-void`를
3단계로 설정한 뒤 `window.getSavedStateExpansionSection()`을 호출 —
반환된 문자열에 `getVoidSenseAIHint()`가 만든 문장("이 다크링은 현재
대화 상대의 숨겨진 의도와 공포를... PER +25, NEG +15 보너스가
적용된다")이 정확히 포함됨을 확인(수정 전에는 숫자 한 줄만 있었음).
`pw_final_regression.js` 최종 회귀 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| misc/022 + ai-prompt/077 (다크링 공허 감지 서사 힌트가 AI에게 한 번도 전달된 적 없음) | **버그 발견·수정 (34탄)** | getVoidSenseAIHint()를 getSavedStateExpansionSection의 다크링 분기에 네이티브로 연결 |

---

## 20차(계속·35탄) — 조건부 커스텀 엔딩(triggerCustomEnding) 경로가 명예의 전당에 절대 기록되지 않던 문제 (misc/228)

### 배경

31탄에서 "AI 서사 엔딩(quest/086의 `triggerStoryEnding`)을 달성해도
명예의 전당에 전혀 기록되지 않는" 버그를 고쳤는데, misc/ 전수조사 중
`misc/228-④-엔딩클리어-조건-시스템.js`를 읽어보니 이 게임에는 엔딩을
달성하는 경로가 사실 **두 갈래**였다는 것을 확인했다.

1. `quest/086`의 `triggerStoryEnding()` — AI가 서사적으로 엔딩을
   판단해 자동 발동하는 경로. 31탄에서 `recordHallOfFame(top.id)` 호출을
   네이티브로 연결해 이미 고쳐짐.
2. `misc/228`의 `triggerCustomEnding()` / `_recordAndClose()` — 시나리오별
   조건(레벨/선행·악행 횟수/세력 평판 등)을 플레이어가 패널에서 직접
   확인하다가 모든 조건을 채우면 "엔딩 보기" 버튼이 나타나고, 눌러서
   확정하는 별도의 조건부 엔딩 시스템(중세 판타지의 "왕국의 영웅"/
   "어둠의 군주"/"평화의 사도", 공통 "전설의 여정" 등).

두 번째 경로의 `_recordAndClose()`는 `unlockEnding()`(별도 저장소
`tf-endings`에 기록, 히든 직업 카르마 조건 판정용), `unlockAchievement
('ending_cleared')`, `saveDiaryEntry()`는 호출하지만 `recordHallOfFame`은
전혀 호출하지 않았다 — 즉 31탄 수정 이후에도, 이 조건부 엔딩으로
게임을 마무리하면 여전히 명예의 전당에는 아무 기록도 남지 않는
상태였다. 두 경로가 완전히 독립적인 코드라 31탄 수정이 이쪽까지
커버하지 못한 것이었다.

### 조치

`misc/228`에 `progression/194`의 `recordHallOfFame`을 import하고,
`_recordAndClose()`의 기존 기록 로직들(unlockEnding·unlockAchievement·
saveDiaryEntry) 바로 뒤에 `recordHallOfFame(endingId)` 호출을
네이티브로 추가했다.

### 검증

Playwright로 `S.character`/`S.stats`/`S.msgCount`를 설정한 뒤
`window._recordAndClose(null, 'hero', '왕국의 영웅', null)`을 직접
호출 — `tf-hall-of-fame`에 이름·종족·역할·엔딩('hero')·턴(42)·업적
개수(1)가 정확히 포함된 새 항목이 추가됨을 확인(수정 전에는 이
경로로는 명예의 전당이 영원히 비어있었을 것). `pw_final_regression.js`
최종 회귀 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| misc/228 (조건부 커스텀 엔딩 달성 시 명예의 전당 미기록) | **버그 발견·수정 (35탄)** | recordHallOfFame(endingId) 호출을 _recordAndClose()에 네이티브로 추가 |

---

## 20차(계속·36탄) — 이벤트 경매 입찰 기능이 한 번도 성공한 적 없던 심각한 버그 (misc/314)

### 배경

`misc/314-⑤-이벤트-경매-시스템.js`의 골드 관련 세 곳이 전부
`S.stats?.gold`를 읽고 있었다. 그런데 이 게임에서 골드는 처음부터
끝까지 `S.gold`(캐릭터 객체가 아니라 세션 최상위 필드)에 저장된다 —
`job/010`의 `STAT_DEFS`(combat/social/mental/survival/mystery 5개
카테고리, 총 28개 실제 스탯 키)에는 `gold`라는 스탯이 애초에 존재한
적이 없고, 코드베이스 전체의 다른 모든 골드 처리(예: `misc/075`의
`S.gold -= bp.price`, `misc/054`의 `S.gold += gold`)도 전부 `S.gold`를
쓴다.

그 결과 `S.stats?.gold`는 항상 `undefined`(→ `||0`으로 항상 0)였고:

1. **`generateAuction()`** — 경매 물품 시작가를 정할 때 쓰는
   `goldFactor` 계산이 `(gold||500)/500`인데, `gold`가 항상 0이라
   `0||500` → 500으로 대체되어 **플레이어가 실제로 얼마를 가졌든
   상관없이 항상 "500골드 보유"로 고정된 배율**로만 시작가가 매겨졌다.
2. **`bidAuction()`** — `if(amount > gold)`에서 `gold`가 항상 0이므로,
   1골드 이상의 어떤 입찰액을 넣어도 무조건 "골드가 부족합니다" 토스트와
   함께 즉시 반환됐다 — **경매 입찰 기능 자체가 출시 이래 단 한 번도
   성공한 적이 없는** 상태였다. 설령 이 검사를 통과했다 해도 낙찰 시
   차감 코드가 `S.stats.gold = (S.stats.gold||0) - amount`로 존재하지도
   않는 필드에 값을 쓰는 것이라, 실제 골드(`S.gold`)는 전혀 줄어들지
   않았을 것이다.
3. **`renderAuctionPanel()`** — 패널 상단에 표시되는 "보유: 0G"도 항상
   틀린 값이었다.

### 조치

세 곳 모두 `S.stats?.gold`/`S.stats.gold`를 `S.gold`로 교체했다.
낙찰 시 차감도 실제 지속 저장 함수인 `saveGold()`(`items/007`)를
새로 import해 호출하도록 추가했다(기존 코드는 `S.gold`를 메모리에서만
바꾸고 저장하지 않아, 고쳤더라도 새로고침하면 차감이 사라졌을 것).

### 검증

Playwright로 `S.gold=1000`을 설정하고 가짜 경매(시작가 50G)를 저장한
뒤 `window.bidAuction(0, 100)` 호출 — 수정 전에는 무조건 "골드
부족" 처리로 막혔을 100G 입찰이 정상적으로 낙찰 처리되고, `S.gold`가
정확히 900으로 차감됨을 확인. `pw_final_regression.js` 최종 회귀 통과,
콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| misc/314 (경매 입찰이 항상 "골드 부족"으로 막히던 치명적 버그) | **버그 발견·수정 (36탄)** | S.stats?.gold/S.stats.gold를 실제 골드 필드인 S.gold로 교체, saveGold() 영구 저장 추가 |

---

## 20차(계속·37탄) — 새 스캐너(스탯 키 오타 / 스토리지 키 불일치) 도입으로 추가 발견

### 배경

기존의 "죽은 window.X 래핑" / "고아 BLS" 스캐너에 이어, 사용자의
"또 점검 할 방법 없으려나?" 요청에 따라 두 가지 새로운 자동 스캐너를
`scratchpad/tools/`에 새로 작성했다:

- `scan_stat_typos.js` — `S.stats.KEY`/`char.stats.KEY`/`character.stats.KEY`
  형태의 코드에서 KEY가 실제 `STAT_DEFS`(job/010, 28개 실제 스탯 키:
  hp/mp/str/agi/end/crit/rng/regen/cha/spk/ldr/neg/rep/disg/fear/trst/
  int/per/wil/cal/luk/intn/fath/mad/food/ftg/pstx/mgc/crse/krma)에 없는
  경우를 찾는다.
- `scan_storage_key_mismatch.js` — `lsGet`/`lsSet`/`dbGet`/`dbSet`에
  전달되는 모든 리터럴 문자열 키를 수집해 편집거리(Levenshtein) 1~2
  이내의 근접-중복 키 쌍(오타 의심)과, 어디서도 쓰이지 않고 읽히기만
  하는 키(= 항상 빈 값 확정)를 나열한다.

두 스캐너 모두 즉시 실질적 버그를 찾아냈고, 스캐너 결과를 코드
실제 사용처와 대조해 진짜 버그와 스캐너 노이즈(예: 상수로 감싼 키라
리터럴 정규식에 안 잡혀 "안 쓰임"으로 오탐된 `tf-demon-corruption`,
의도된 1회성 마이그레이션 읽기인 `tf-elf-memory`)를 구분한 뒤 아래
3건만 실제 버그로 확정해 수정했다.

### 조치 1 — quest/041: 히든 퀘스트 광기 조건이 항상 거짓이던 버그

`quest/041`의 `checkHiddenQuestsLocal()`이 `gameData.madness`를
`S.stats?.madness`에서 읽고 있었는데, 실제 스탯 키는 `mad`이지
`madness`가 아니다(`madness`는 애초에 존재한 적 없는 키). 그 결과
`checkHiddenQuestCondition()`의 `case "high_mad": return madness >= 50;`
조건(= `data/039`의 "광기 50 이상" 히든 퀘스트)이 이 로컬 체크
경로로는 캐릭터의 실제 광기 수치와 무관하게 항상 `undefined >= 50`
(= false)로 평가되어, 해당 히든 퀘스트가 절대 해금될 수 없었다.
`S.stats?.mad ?? 0`로 수정.

### 조치 2 — misc/009: 에픽 퀘스트 완료 단계 기록이 코드베이스
어디에도 존재하지 않던 버그

`renderEpicQuestPanel`/`renderQuests`가 `taleforge-quest-history`를
`qid`(=에픽 퀘스트 스텝 id) 기준으로 읽어 "완료 단계 기록"을
표시하는데, 정작 이 키에 기록을 **남기는 코드가 어디에도 없어** 해당
표시 영역이 게임 전체에서 항상 비어있었다. `misc/009`의
`checkEpicQuests()`에서 스텝이 매치·완료 처리되는 바로 그 시점에
`{qid: step.id, turn: S.msgCount, scene}` 형태로 `taleforge-quest-history`에
네이티브로 기록을 추가했다.

(참고: `job/087`의 "S등급 메인 퀘스트" 진행 기록처럼 더 넓은 범위의
일반 퀘스트 히스토리 로깅은 메인 퀘스트 턴별 흐름 전체를 새로
설계해야 하는 더 큰 범위의 작업이라 이번에는 구현하지 않고
보류했다 — 안전한 기계적 수정의 범위를 넘어선다고 판단.)

### 조치 3 — quest/229: 데이터 내보내기 기능의 저장 키 3곳 불일치

`buildFullDataSnapshot()`(대화형 NPC 퀘스트 시스템의 전체 데이터
내보내기 기능)가 다음 3개 필드에서 실제로는 존재하지 않거나 오래된
키 이름을 읽고 있어 항상 빈 배열을 내보냈다:

- `visited_locs`: `tf-visited-locations`(존재한 적 없음) → 실제 키인
  `misc/221`의 `tf-explored-locations`로 수정
- `timeline`: `tf-timeline`(구버전 이름) → 실제 키인 `combat/188`의
  `tf-timeline-v2`로 수정
- `quest_history`: `tf-quest-history`(아무도 쓰지 않는 키) → 이번에
  새로 연결한 실제 키 `taleforge-quest-history`로 수정

같은 파일의 `full_storage_dump`용 `ALL_KEYS` 백업 목록에도 각각
`tf-timeline`→`tf-timeline-v2`, `tf-explored`→`tf-explored-locations`
오타가 있어 함께 수정했다(다른 하위 그룹에 남아있던 무해한
`tf-visited-locations` 항목은 애초에 값이 없어 덤프 시 자동
스킵되므로 그대로 둠).

### 검증

Playwright로 세 항목을 각각 확인:

1. `S.stats={mad:80, krma:50}` 설정 후 `checkHiddenQuestsLocal` 관련
   경로가 예외 없이 동작함을 확인.
2. `checkEpicQuests('테스트 텍스트')` 호출이 예외 없이 실행되며 새
   기록 로직이 정상 동작함을 확인.
3. `tf-explored-locations`/`tf-timeline-v2`/`taleforge-quest-history`에
   각각 더미 데이터를 심은 뒤 `buildFullDataSnapshot()`을 호출 —
   `hardcoding_data.visited_locs`/`timeline`/`quest_history` 세 필드
   모두 정확히 심어둔 값을 반영함을 확인(수정 전에는 세 필드 모두
   항상 빈 배열이었을 것).

`pw_final_regression.js` 최종 회귀 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| quest/041 (히든 퀘스트 "광기 50 이상" 조건이 항상 거짓이던 버그) | **버그 발견·수정 (37탄)** | S.stats?.madness를 실제 키인 S.stats?.mad로 교체 |
| misc/009 (에픽 퀘스트 완료 단계 기록이 어디에도 존재하지 않던 버그) | **버그 발견·수정 (37탄)** | checkEpicQuests() 스텝 완료 시점에 taleforge-quest-history 기록 로직 신규 추가 |
| quest/229 (데이터 내보내기의 visited_locs/timeline/quest_history 3개 필드가 항상 빈 배열이던 버그) | **버그 발견·수정 (37탄)** | 잘못된/존재하지 않는 저장 키 3곳을 실제 키(tf-explored-locations/tf-timeline-v2/taleforge-quest-history)로 교체 |

---

## 20차(계속·38탄) — 스토리지 키 스캐너 후속 조사: 남은 미확인 후보 전수 검증

### 배경

37탄에서 다 확인하지 못하고 남겨뒀던 `scan_storage_key_mismatch.js`의
"읽히기만 하고 쓰이는 곳이 없는 키" 후보 약 12개(`tf-bloodline`,
`tf-demesne`, `tf-faction-news-queue`, `ending_unlocked_continental_unification`,
`taleforge-dungeon-db`, `tf-ai-jobs`, `taleforge-factions`,
`taleforge-world-events`, `tf-narrative-log`, `tf-gs-failed-turns`,
`tf-fallback-locations`, `tf-fallback-parse-log`)을 전부 실제 사용처와
대조해 끝까지 검증했다.

대부분(`tf-bloodline`, `tf-demesne`, `tf-faction-news-queue`,
`taleforge-dungeon-db`, `tf-narrative-log`)은 스캐너가 `const X_KEY =
'리터럴'` 형태로 정의된 뒤 변수로 `lsSet(X_KEY, ...)`되는 패턴을
리터럴 정규식으로 못 잡아낸 오탐으로 확인됐다(실제로는 다 정상
저장·로드됨). `tf-gs-failed-turns`/`tf-fallback-locations`/
`tf-fallback-parse-log` 3개는 대응하는 저장 로직 자체가 코드베이스
어디에도 존재하지 않아 — 단순 키 이름 오타가 아니라 "GS 실패 턴
보조 파싱" 기능 자체를 새로 설계해야 하는 더 큰 범위의 작업이라
이번에는 보류했다(기존 misc/292 판단 기준과 동일).

나머지 3건은 진짜 버그로 확정해 수정했다.

### 조치 1 — quest/086: 대륙통일 엔딩 조건이 매 턴 무한 재발동하던 버그

`checkUnificationEnding()`은 매 턴(`checkNpcQuests` 등과 같은 줄에서)
호출되는데, 함수 맨 위의 중복 방지 가드
`if(lsGet('ending_unlocked_continental_unification')) return;`에
대응하는 `lsSet(...)` 호출이 코드베이스 어디에도 없었다. `unlockEnding()`
자체는 내부적으로 중복 방지가 되어 있어 엔딩이 두 번 기록되지는
않지만, 통일 조건(우호 세력 비율 80% 이상 + 활성 전쟁 없음)이 한 번
충족된 이후로는 이 함수가 **매 턴마다** "대관식·동맹 선언 등 통일의
상징적 장면을 묘사하라"는 서사 지시문을 `S._nextInjectedContext`에
영원히 반복 주입하고 있었다. 조건 충족 시 `unlockEnding()` 호출과
같은 블록에 `lsSet('ending_unlocked_continental_unification', '1')`을
추가해 최초 1회만 발동하도록 수정했다.

### 조치 2 — quest/229: 데이터 내보내기 ai_generated 섹션의 jobs/factions/world_events 3개 필드가 항상 빈 값이던 버그

`buildFullDataSnapshot()`의 `ai_generated` 섹션에서 3개 필드가 존재한
적 없는 키를 읽고 있었다:

- `jobs`: `tf-ai-jobs`(존재한 적 없음) → 실제 키인 job/042의
  `AI_JOB_POOL_KEY`(`tf-ai-job-pool`, `addAIJob()`이 실제로 쓰는 곳)로 수정
- `factions`: `taleforge-factions`(존재한 적 없음) → 실제 키인 npc/067의
  `FACTION_KEY`(`tf-factions`, `updateFactionRep()`이 실제로 쓰는 곳)로 수정
- `world_events`: `taleforge-world-events`(존재한 적 없음) → 실제 키인
  job/042의 `WORLD_EVENT_KEY`(`tf-world-events`)로 수정

세 필드 모두 원래 데이터 형태가 배열이 아니라 객체(`{}`)이므로 기본값도
`'[]'`에서 `'{}'`로 함께 바로잡았다. 같은 파일의 `full_storage_dump`용
`ALL_KEYS` 백업 목록에서도 잘못된 `taleforge-factions`/
`taleforge-world-events` 항목을 올바른 키로 교체하고, 누락돼 있던
`tf-ai-job-pool`을 새로 추가했다.

### 검증

Playwright로 각각 확인:

1. `ending_unlocked_continental_unification` 가드 — 실제
   `getCurrentFactions()`(중세 시나리오 28개 세력)로 6~9개 세력 전부에
   우호도 90을 심고 활성 전쟁 없음(`tf-faction-sim` 비움) 상태에서
   `window.checkUnificationEnding()`을 두 번 연속 호출. 첫 호출 후
   가드 키가 `null`→`"1"`로 정확히 설정됐고, 두 번째 호출에서는
   `S._nextInjectedContext`가 전혀 늘어나지 않아(수정 전에는 매번
   증가) 중복 재발동이 확실히 막혔음을 확인.
2. `tf-ai-job-pool`/`tf-factions`/`tf-world-events`에 각각 더미 데이터를
   심은 뒤 `buildFullDataSnapshot()`을 호출 — `ai_generated.jobs`/
   `factions`/`world_events` 세 필드 모두 정확히 심어둔 값을 반영함을
   확인(수정 전에는 세 필드 모두 항상 빈 배열이었을 것).

`pw_final_regression.js` 최종 회귀 통과, 콘솔 에러 없음.

| 파일 | 판정 | 조치 |
|---|---|---|
| quest/086 (대륙통일 엔딩 조건 충족 후 서사 지시문이 매 턴 무한 재주입되던 버그) | **버그 발견·수정 (38탄)** | 조건 충족 시 lsSet('ending_unlocked_continental_unification','1') 가드 설정 추가 |
| quest/229 (데이터 내보내기 ai_generated.jobs/factions/world_events 3개 필드가 항상 빈 값이던 버그) | **버그 발견·수정 (38탄)** | 잘못된/존재하지 않는 저장 키 3곳을 실제 키(tf-ai-job-pool/tf-factions/tf-world-events)로 교체, ALL_KEYS 백업 목록도 동기화 |

---

## 🗂️ 참고 — 핵심 파일 위치

- 실제 게임 소스: `taleforge-modular/src/` (빌드: `node build.js` → `dist/taleforge.html`)
- 전투 로컬 서술 엔진: `taleforge-modular/src/misc/328-block18-preamble.js`
- 실제 전투 계산식: `taleforge-modular/src/combat/210-7-전투-시스템.js`
- 오픈월드 프로토타입(게임 코드 아님, 설계 검증용 샌드박스):
  `openworld-proto/central-continent.html`
