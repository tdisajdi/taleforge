// ⑥ 레어 전투 이벤트 — data
// Pure data split out of combat/250-⑥-레어-전투-이벤트.js (see generate.js).

export const RARE_COMBAT_EVENTS = [
  { id:'ceiling_collapse', chance:0.04, icon:'🪨', label:'천장 붕괴',
    hint:'전투 중 천장/지면이 붕괴한다. 아군·적 모두 피해. 지형이 변하고 새 경로가 생긴다.' },
  { id:'reinforcements',   chance:0.05, icon:'⚔️', label:'지원군 도착',
    hint:'어디선가 지원군이 도착한다. 아군일 수도, 적의 증원일 수도 있다. (플레이어에게 유리하게 전개)' },
  { id:'trap_triggered',   chance:0.06, icon:'🕳️', label:'함정 발동',
    hint:'숨겨진 함정이 발동한다. 적에게 불리하게 작동할 수도, 주인공에게 작동할 수도 있다.' },
  { id:'enemy_infighting', chance:0.05, icon:'🤜', label:'적 내분',
    hint:'적들끼리 갑자기 싸움이 벌어진다. 주인공이 개입하거나 틈을 노릴 수 있다.' },
  { id:'weather_shift',    chance:0.04, icon:'⛈️', label:'갑작스러운 기상 변화',
    hint:'전투 중 날씨가 급변한다. 폭우·폭풍·안개 등이 전장에 영향을 준다.' },
  { id:'wild_beast',       chance:0.03, icon:'🐺', label:'야생 생물 난입',
    hint:'전투 소음에 이끌린 야생 동물이 난입한다. 아군·적 구분 없이 공격한다.' },
  { id:'mysterious_help',  chance:0.03, icon:'🌟', label:'정체불명의 도움',
    hint:'정체불명의 존재가 주인공을 돕는다. 누구인지 알 수 없지만 위기를 넘긴다.' },
  { id:'rage_mode',        chance:0.04, icon:'💀', label:'적 필사 각성',
    hint:'적 중 하나가 극도의 분노나 절망으로 각성한다. 일시적으로 2배 강해지지만 판단력을 잃는다.' },
];
