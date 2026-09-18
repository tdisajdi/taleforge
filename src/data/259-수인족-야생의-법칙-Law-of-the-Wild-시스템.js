// 🐾 수인족 — 야생의 법칙 (Law of the Wild) 시스템 — data
// Pure data split out of race/259-수인족-야생의-법칙-Law-of-the-Wild-시스템.js (see generate.js).

export const BEAST_ACTION_TYPES = {
  // 무리 서열 상승
  pack_protect:  { label:'동료 보호',       icon:'🛡️', rankDelta:+6, bloodDelta:-2, codeDelta:+5, desc:'위기에 처한 동료를 몸으로 막았다.' },
  pack_hunt:     { label:'함께 사냥',        icon:'🎯', rankDelta:+5, bloodDelta:+2, codeDelta:+4, desc:'무리와 함께 사냥했다. 유대가 깊어진다.' },
  pack_challenge:{ label:'강자에게 도전',    icon:'⚔️', rankDelta:+8, bloodDelta:+5, codeDelta:+2, desc:'더 강한 자에게 먼저 도전장을 냈다.' },
  // 서열 하락
  pack_flee:     { label:'비겁한 도주',      icon:'🏃', rankDelta:-10, bloodDelta:-3, codeDelta:-6, desc:'동료를 버리고 도망쳤다. 무리가 실망한다.' },
  pack_betray:   { label:'무리 배신',        icon:'⚠️', rankDelta:-20, bloodDelta:-5, codeDelta:-15, desc:'[금기] 무리를 배신했다. 홀로 된 자가 될 수 있다.' },
  // 야수 수치 상승
  beast_frenzy:  { label:'야수 본능 해방',   icon:'🔴', rankDelta:0,  bloodDelta:+10, codeDelta:-2, desc:'야수의 본능을 완전히 해방했다. 강해지지만 위험해진다.' },
  // 야수 수치 하락 (이성)
  beast_reason:  { label:'이성 유지',        icon:'🧠', rankDelta:+2, bloodDelta:-6, codeDelta:+3, desc:'극한 상황에서도 이성을 유지했다.' },
  // 코드 상승
  code_survival: { label:'생존을 위한 사냥', icon:'🏕️', rankDelta:+3, bloodDelta:+3, codeDelta:+7, desc:'먹기 위해 사냥했다. 올바른 사냥꾼의 방식이다.' },
  code_protect:  { label:'약자 보호',        icon:'💚', rankDelta:+4, bloodDelta:-2, codeDelta:+8, desc:'힘없는 자를 지켰다. 사냥꾼의 윤리가 빛난다.' },
  // 코드 하락 (금기)
  code_show:     { label:'강함 과시 사냥',   icon:'💀', rankDelta:-3, bloodDelta:+8, codeDelta:-12, desc:'[금기] 강함을 증명하기 위해 사냥했다. 야수로의 첫걸음이다.' },
  code_massacre: { label:'무고한 자 학살',   icon:'☠️', rankDelta:-15, bloodDelta:+15, codeDelta:-20, desc:'[금기] 무고한 자를 학살했다. 수인 사회에서 추방당할 행위다.' },
};
