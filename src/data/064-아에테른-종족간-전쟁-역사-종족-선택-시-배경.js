// 아에테른 종족간 전쟁 역사 — 종족 선택 시 배경 — data
// Pure data split out of race/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js (see generate.js).

export const RACE_WAR_HISTORY = {
  human: {
    major: '알테라 왕국 건국 전쟁 (3462년)',
    desc: '인간 연합군이 칼다리아 중앙을 장악하기 위해 오크 부족 연합과 격돌. 30년 전쟁 끝에 오크들이 외곽 황야로 밀려났다. 이 전쟁의 승리가 알테라 1세의 기반이 됐다.',
    relation: { orc:'전쟁 이후 적대→현재 긴장', elf:'장기 공존 중 마찰', dwarf:'교역 동맹 유지', demon:'심연 신앙 사건으로 불신' },
    pride: '짧은 삶이기에 더 강하게 싸운다. 인간의 전쟁사는 세계에서 가장 길다.',
  },
  elf: {
    major: '세계수 전쟁 (2800년 전)',
    desc: '드워프가 세계수 뿌리 아래 광물을 채굴하려 하자 엘프가 전면전을 선포. 500년 전쟁 끝에 드워프가 지하로 완전 이동하는 조건으로 종전. 지금도 이 상처가 양 종족 사이에 남아있다.',
    relation: { dwarf:'세계수 전쟁 이후 적대→현재 냉전', human:'공존하지만 인간 이민자 문제로 마찰', dragon:'고대 동맹. 세계수를 함께 지켰다' },
    pride: '수천 년의 기억. 엘프는 잊지 않는다. 그것이 강점이자 상처다.',
  },
  dwarf: {
    major: '세계수 전쟁 + 지하 이주 (2800~2300년 전)',
    desc: '세계수 전쟁 패배 후 드워프는 지상을 포기하고 지하로 내려갔다. 500년의 대이주. 이 시기를 드워프는 "어둠의 행진"이라 부른다. 지하에서 문명을 재건하며 지상보다 오히려 강해졌다.',
    relation: { elf:'세계수 전쟁 패배 — 수천 년 원한, 표면적 냉전', human:'교역 파트너, 신뢰하지만 거리를 둔다', orc:'지하와 지상 자원 분쟁' },
    pride: '패배해도 무너지지 않았다. 드워프의 진짜 힘은 패배 이후에 나온다.',
  },
  orc: {
    major: '알테라 건국 전쟁 (3462년) + 대이주',
    desc: '인간-오크 30년 전쟁 패배 후 오크 부족들이 칼다리아 외곽 황야로 밀려났다. "우리가 잃은 땅"에 대한 집단 기억이 오크 문화의 핵심. 힘만이 존중받는다는 철학의 뿌리.',
    relation: { human:'건국 전쟁의 패전 — 표면적 공존, 내면은 분노', dwarf:'황야 자원 분쟁', elf:'직접 충돌 없음, 서로 무시' },
    pride: '우리가 잃은 것은 땅이 아니라 존중이다. 언젠가 되찾는다.',
  },
  darkling: {
    major: '그림자 전쟁 (약 1000년 전)',
    desc: '다크링은 인간과 엘프 사이에서 태어난 혼혈이 어둠의 에너지에 오염되어 탄생한 종족이라는 설이 있다. 신계 대전 당시 천계도 마계도 아닌 틈새에서 생존했다. 이 시기 다크링들이 세력을 형성했지만 인간과 엘프 양쪽에서 박해받았다.',
    relation: { human:'박해의 역사 — 불신', elf:'혼혈 기원으로 인한 경멸', demon:'마계와 근접하지만 동일시되지 않음' },
    pride: '어느 쪽도 우리를 원하지 않았다. 그래서 우리는 스스로를 택했다.',
  },
  celestial: {
    major: '신계 대전 (3000년 전)',
    desc: '천계와 마계의 충돌. 세레스티얼은 천계 전사로 직접 참전했다. 대전 이후 일부 세레스티얼이 속세에 남아 봉인 유지를 감시하는 역할을 맡았다. 현재 세레스티얼 중 이 사명을 기억하는 자는 거의 없다.',
    relation: { demon:'신계 대전의 적 — 본능적 적대', human:'보호 대상으로 여김', celestial:'서로 반기지만 점점 드물어지는 만남' },
    pride: '우리는 신의 전사였다. 그 기억이 희미해질수록 우리가 잃는다.',
  },
  dragon: {
    major: '용의 시대 (5000년 전) + 용-인간 전쟁 (3500년 전)',
    desc: '드래곤이 세계를 지배하던 용의 시대가 있었다. 인간이 성장하면서 드래곤을 사냥하기 시작했고, 용-인간 대전쟁이 일어났다. 용염 제국의 건국 계약은 이 전쟁을 끝낸 협약이다.',
    relation: { human:'용-인간 전쟁 이후 계약으로 공존. 동대륙에서만 안전', elf:'고대 동맹. 세계수를 함께 지켰다', demon:'마계의 혼돈이 드래곤의 광기를 일으킨다' },
    pride: '우리는 세계가 만들어질 때부터 있었다. 인간의 역사는 우리 역사의 일부다.',
  },
  demon: {
    major: '신계 대전 (3000년 전) + 봉인의 협약',
    desc: '신계 대전에서 마계가 패배한 후 마왕 베엘제부브가 봉인 협약에 서명했다. 그러나 마계 내부에서는 이 협약이 배신이라는 분파와 현실적 선택이라는 분파가 지금도 대립 중이다.',
    relation: { celestial:'신계 대전의 적 — 본능적 적대', human:'힘있는 인간을 타락시키려 한다', demon:'마왕의 협약을 둘러싼 내부 분열' },
    pride: '패배했다. 그러나 아직 끝나지 않았다. 봉인은 영원하지 않다.',
  },
  undead: {
    major: '불사 혁명 (800년 전)',
    desc: '언데드 강령술사들이 자연스러운 죽음을 거부하며 집단을 형성한 사건. 교회의 대대적인 탄압이 이어졌다. "죽음은 순환의 일부"라는 빛의 신앙과 "순환을 거부한다"는 언데드 철학이 정면 충돌한 역사.',
    relation: { human:'교회의 탄압으로 인한 적대', celestial:'신성과 불사는 공존 불가', demon:'죽음을 거부한다는 점에서 이해하지만 동일시는 아님' },
    pride: '죽음을 알기에 삶을 더 깊이 안다. 우리는 경계에서 진실을 본다.',
  },
  beastman: {
    major: '야생의 시대 (알테라 건국 이전)',
    desc: '인간이 칼다리아를 정복하기 전 수인족이 이 대륙의 주인이었다. 인간 문명이 확장하면서 수인족은 숲과 황야로 밀려났다. 오크와 비슷하지만 더 조용한 분노를 품고 있다.',
    relation: { human:'영토 상실의 역사 — 표면적 공존, 내면은 비애', orc:'비슷한 처지로 교감하지만 문화 차이로 갈등', elf:'자연 동맹. 세계수를 신성시하는 공통점' },
    pride: '우리는 이 대륙 최초의 주인이었다. 자연이 그것을 기억한다.',
  },
  elemental: {
    major: '원소 각성 (신계 대전 부산물)',
    desc: '신계 대전 당시 천계와 마계의 에너지가 충돌하면서 자연에 의식이 깃들기 시작한 것이 원소인의 기원이라는 설이 있다. 원소인은 역사가 짧지만 세계의 에너지 흐름과 가장 가깝다.',
    relation: { celestial:'천계 에너지에서 비롯됐다는 설로 우호', demon:'마계 에너지와 충돌하는 속성', human:'원소인을 도구로 보려는 인간과 갈등' },
    pride: '우리는 전쟁으로 만들어지지 않았다. 우리는 세계가 스스로를 인식하기 시작한 것이다.',
  },
};

// [20차 감사 FIX] 이 배열의 각 항목에 minTurns가 아예 정의된 적이 없었다.
// getJobMastery()(race/064)는 `effectiveTurns >= ml.minTurns`로 레벨을
// 올리는데, ml.minTurns가 매번 undefined라 이 비교는 첫 항목(레벨1)부터
// 항상 false가 되어 즉시 break — 결과적으로 직업 숙련도는 시작값인
// 레벨 1("입문")에서 절대 오르지 못했다(턴을 아무리 쌓아도 동일).
// 이 결함은 원본 taleforge.html에도 그대로 있던 것으로, 리팩터링 이전부터
// 존재한 원본 버그다 — 즉 이 게임 역사상 직업 숙련도 2~7단계
// 보너스(JOB_MASTERY_BONUS)가 단 한 번도 지급된 적이 없었다는 뜻이다.
// 턴 누적 페이스(직업 전직 제안 최소 10~25턴, 재시도 쿨다운 5~15턴)에
// 맞춰 단계별 문턱을 새로 부여한다.
export const MASTERY_LEVELS = [
  { level:1, name:'입문',   icon:'⚪',   svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" opacity="0.5"/></svg>', minTurns:0,   bonus:{} },
  { level:2, name:'수련',   icon:'🟢',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/></svg>', minTurns:30,  bonus:{} },
  { level:3, name:'숙련',   icon:'🔵',  svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6" stroke-width="1.3"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg>', minTurns:80,  bonus:{} },
  { level:4, name:'정통',   icon:'🟣', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></svg>', minTurns:150, bonus:{} },
  { level:5, name:'달인',   icon:'🟡', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round" opacity="0.75"/></svg>', minTurns:250, bonus:{} },
  { level:6, name:'전설',   icon:'🔴', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></svg>', minTurns:400, bonus:{} },
  { level:7, name:'신화',   icon:'⭐', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/><circle cx="12" cy="12" r="10.5" stroke-width="0.9" opacity="0.5"/></svg>', minTurns:600, bonus:{} },
];

export const JOB_MASTERY_BONUS = {
  warrior: [
    {},
    { str:20, end:20 },
    { str:35, end:35, desc:'철벽 방어 강화' },
    { str:50, end:50, fear:50 },
    { str:65, end:65, fear:65, desc:'전장의 영웅' },
    { str:80, end:80, fear:80, agi:80 },
    { str:80, end:80, fear:80, agi:80, luk:80, desc:'전쟁의 화신' },
  ],
  mage: [
    {},
    { mgc:20, int:20 },
    { mgc:35, int:35, desc:'마력 증폭' },
    { mgc:50, int:50, per:50 },
    { mgc:65, int:65, per:65, desc:'고대 마법 해석' },
    { mgc:80, int:80, per:80, luk:80 },
    { mgc:80, int:80, per:80, luk:80, desc:'마법의 화신' },
  ],
  rogue: [
    {},
    { agi:20, disg:20 },
    { agi:35, disg:35, desc:'그림자 발걸음' },
    { agi:50, disg:50, luk:50 },
    { agi:65, disg:65, luk:65, desc:'완벽한 기습' },
    { agi:80, disg:80, luk:80, per:80 },
    { agi:80, disg:80, luk:80, per:80, desc:'그림자의 군주' },
  ],
  wanderer: [
    {},
    { luk:20, per:15 },
    { luk:45, per:40, desc:'방랑자의 직감' },
    { luk:80, per:70, int:30 },
    { luk:120, per:110, int:55, desc:'세상을 읽는 눈' },
    { luk:20, per:20, int:20, mgc:20 },
    { luk:35, per:35, int:35, mgc:35, desc:'운명의 방랑자' },
  ],
};
