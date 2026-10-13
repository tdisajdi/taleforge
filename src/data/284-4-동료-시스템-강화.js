// 4. 동료 시스템 강화 — data
// Pure data split out of items/284-4-동료-시스템-강화.js (see generate.js).

// [60-2번 섹션] 기존엔 각 성격 유형당 leaveTrigger 1~2개 + subQuestHint
// 1개뿐이라 "신뢰도 50 넘으면 서브퀘스트 1회" 이후로는 똑같은 성격의
// 모든 동료가 영원히 같은 상태에 머물렀다. leaveTrigger를 3~4개로
// 늘리고, 최고 신뢰(결속 완성) 단계 전용 `bondHint`를 신설 — 신뢰도가
// 더 쌓이면 또 다른 서사적 계기가 한 번 더 생기게 한다.
export const COMPANION_PERSONALITIES = {
  loyal:    { label:'충성형',  icon:'💛', leaveTrigger:['주인공이 배신','동료를 저버린','은혜를 잊은','믿음을 깨는'], bonusStat:'end', growthStat:'end',
    subQuestHint:'이 동료는 과거의 배신 상처를 극복하는 이야기를 가지고 있다.',
    bondHint:'이 동료가 마침내 과거의 배신 상처를 완전히 극복하고, 주인공에게 평생의 충성을 맹세하는 순간이다.' },
  brave:    { label:'용맹형',  icon:'⚔️', leaveTrigger:['도망','겁쟁이','물러서는','피하는'],               bonusStat:'str', growthStat:'str',
    subQuestHint:'이 동료는 가장 강한 적에게 맞서는 도전을 원한다.',
    bondHint:'이 동료가 자신이 두려워하던 가장 강한 적과 마주해, 주인공과 함께 그 두려움을 완전히 극복해내는 순간이다.' },
  wise:     { label:'현명형',  icon:'📜', leaveTrigger:['무모한 행동','이성 없이','생각 없이','즉흥적인'],       bonusStat:'int', growthStat:'int',
    subQuestHint:'이 동료는 잃어버린 고대 지식을 찾고 있다.',
    bondHint:'이 동료가 그토록 찾던 고대 지식의 마지막 조각을 발견하고, 그 깨달음을 주인공과 온전히 나누는 순간이다.' },
  carefree: { label:'자유형',  icon:'🌊', leaveTrigger:['구속','명령','강요','억압하는'],            bonusStat:'agi', growthStat:'agi',
    subQuestHint:'이 동료는 과거에 자유를 빼앗긴 기억이 있다.',
    bondHint:'이 동료가 과거에 자유를 빼앗겼던 그 장소로 돌아가, 주인공과 함께 완전히 그 기억을 떨쳐내는 순간이다.' },
  ambitious:{ label:'야심형',  icon:'👑', leaveTrigger:['주인공이 더 강해질수록','뒤처지는','밀려나는'],        bonusStat:'ldr', growthStat:'ldr',
    subQuestHint:'이 동료는 언젠가 주인공을 능가하겠다는 야망을 품고 있다.',
    bondHint:'이 동료가 자신의 야망이 주인공을 넘어서는 것이 아니라 함께 정상에 서는 것임을 깨닫는 순간이다.' },
  mysterious:{ label:'신비형', icon:'🌑', leaveTrigger:['진실이 밝혀지면','정체를 들킨','비밀을 캐묻는'],              bonusStat:'mgc', growthStat:'mgc',
    subQuestHint:'이 동료의 정체에는 세계를 뒤흔들 비밀이 숨어있다.',
    bondHint:'이 동료가 마침내 세계를 뒤흔들 자신의 비밀을 주인공에게만 온전히 털어놓는 순간이다.' },
};
