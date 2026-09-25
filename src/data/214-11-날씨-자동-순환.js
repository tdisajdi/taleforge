// [11] 날씨 자동 순환 — data
// Pure data split out of world/214-11-날씨-자동-순환.js (see generate.js).

export const WEATHER_CYCLE = ['clear','clear','rain','clear','fog','storm','snow','clear'];

export const TIME_CYCLE = ['dawn','morning','morning','midday','afternoon','afternoon','evening','night','night','midnight'];

// [2026-09-25, 33번 섹션] world/214(timeCostToCalendar)와 world/306(실제
// 시각 기반 달력, S1 재설계)이 같은 달 이름/계절 테이블을 공유하도록
// 여기 한 곳으로 뽑아냄 — 두 곳이 각자 다른 테이블을 들고 있다가
// 나중에 하나만 고쳐져서 서로 어긋나는 사고를 막기 위함.
export const CALENDAR_MONTHS = [
  { name:'싹트기월', icon:'🌱', season:'봄',   effect:'만물이 소생. 약초 채취량 증가.' },
  { name:'꽃비월',   icon:'🌸', season:'봄',   effect:'기분이 고조. 협상 판정 +5.' },
  { name:'여름불월', icon:'☀️',  season:'여름', effect:'뜨거운 열기. 체력 소모 빠름.' },
  { name:'폭풍월',   icon:'⛈️', season:'여름', effect:'잦은 폭풍. 이동 판정 어려움.' },
  { name:'황금월',   icon:'🌾', season:'가을', effect:'수확기. 교역 활발, 골드 가치 상승.' },
  { name:'낙엽월',   icon:'🍂', season:'가을', effect:'서늘한 바람. 은신 판정 +5.' },
  { name:'서리월',   icon:'❄️', season:'겨울', effect:'추위. 야외 체력 소모 증가.' },
  { name:'설원월',   icon:'🌨️', season:'겨울', effect:'폭설. 이동 속도 감소, 온기가 귀하다.' },
];

export const CALENDAR_DAYS_PER_MONTH = 15;
