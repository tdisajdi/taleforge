// ★ NEW 9: 카르마 실제 판정 반영
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';

export function getKarmaRollBonus(){
  const krma = S.stats?.krma??50;
  // 선량(80+): 판정 +8, 빛/신성 계열 +추가
  if(krma >= 80) return { bonus:8,  label:'✨ 선량의 가호', penaltyOn:['dark','poison'] };
  // 선(60~79): 판정 +4
  if(krma >= 60) return { bonus:4,  label:'🌟 선한 기운', penaltyOn:[] };
  // 중립(40~59): 보너스 없음
  if(krma >= 40) return { bonus:0,  label:'', penaltyOn:[] };
  // 악(20~39): 어둠 계열 +4, 빛 계열 -4
  if(krma >= 20) return { bonus:-4, label:'🌑 악의 기운', bonusOn:['dark','poison'], penaltyOn:['light'] };
  // 극악(0~19): 어둠 +8, 빛 -8, 사회적 판정 -6
  return { bonus:-8, label:'💀 타락의 낙인', bonusOn:['dark','poison','physical'], penaltyOn:['light','magic'] };
}
window.getKarmaRollBonus = getKarmaRollBonus;

window.getKarmaRollBonus = getKarmaRollBonus;

// [버그 수정] 이 자리에 있던 hookKarmaIntoRoll은 window.rollWarCheck를
// 감싸는 방식이었다. rollWarCheck의 유일한 실제 호출부(misc/068 안에서
// bare 식별자로 호출)가 이 감싸기를 절대 적용하지 못했다(다른 죽은
// 훅들과 동일한 원인). 같은 로직을 misc/068의 rollWarCheck() 함수 자체에
// 네이티브로 옮겼다.
