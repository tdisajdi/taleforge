// 4. 동료 시스템 강화 — data
// Pure data split out of items/284-4-동료-시스템-강화.js (see generate.js).

export const COMPANION_PERSONALITIES = {
  loyal:    { label:'충성형',  icon:'💛', leaveTrigger:['주인공이 배신','동료를 저버린'], bonusStat:'end', growthStat:'end',  subQuestHint:'이 동료는 과거의 배신 상처를 극복하는 이야기를 가지고 있다.' },
  brave:    { label:'용맹형',  icon:'⚔️', leaveTrigger:['도망','겁쟁이'],               bonusStat:'str', growthStat:'str',  subQuestHint:'이 동료는 가장 강한 적에게 맞서는 도전을 원한다.' },
  wise:     { label:'현명형',  icon:'📜', leaveTrigger:['무모한 행동','이성 없이'],       bonusStat:'int', growthStat:'int',  subQuestHint:'이 동료는 잃어버린 고대 지식을 찾고 있다.' },
  carefree: { label:'자유형',  icon:'🌊', leaveTrigger:['구속','명령','강요'],            bonusStat:'agi', growthStat:'agi',  subQuestHint:'이 동료는 과거에 자유를 빼앗긴 기억이 있다.' },
  ambitious:{ label:'야심형',  icon:'👑', leaveTrigger:['주인공이 더 강해질수록'],        bonusStat:'ldr', growthStat:'ldr',  subQuestHint:'이 동료는 언젠가 주인공을 능가하겠다는 야망을 품고 있다.' },
  mysterious:{ label:'신비형', icon:'🌑', leaveTrigger:['진실이 밝혀지면'],              bonusStat:'mgc', growthStat:'mgc',  subQuestHint:'이 동료의 정체에는 세계를 뒤흔들 비밀이 숨어있다.' },
};
