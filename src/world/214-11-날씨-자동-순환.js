// [11] 날씨 자동 순환
// Auto-extracted from taleforge.html (original section banner preserved above).
import { TRANSPORT_CONFIG } from '../data/054-이동수단-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { CALENDAR_DAYS_PER_MONTH, CALENDAR_MONTHS, TIME_CYCLE, WEATHER_CYCLE } from '../data/214-11-날씨-자동-순환.js';
import { loadAtmosphere, saveAtmosphere } from '../misc/001-block0-preamble.js';
import { getPlayerMaxHp, getPlayerMaxMp } from '../misc/054-이동수단-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { notifyWeatherChange } from './073-파트2-A-날씨-게임플레이-반영.js';

export const TIME_COST_KEY = 'tf-timecost';

export const TIME_COST_PER_DAY = 30;

export function loadTimeCost(){ try{ return parseFloat(lsGet(TIME_COST_KEY)||'0')||0; }catch(e){ return 0; } }
window.loadTimeCost = loadTimeCost;

export function saveTimeCost(v){ try{ lsSet(TIME_COST_KEY, String(Math.max(0,v))); }catch(e){} }
window.saveTimeCost = saveTimeCost;

export function detectActionTimeCost(userMsg, aiText){
  const u = (userMsg||'').toLowerCase();
  const a = (aiText||'').toLowerCase();
  const combined = u + ' ' + a;

  // 수면/장기 휴식 → 하루 전환
  if(/잠을 잔다|잠자리|숙박|여관.*잔다|하룻밤|아침이 됐|다음날|날이 밝|하루가 지났|며칠이 지|다음 날/.test(combined))
    return 8.0;

  // 장거리 이동/여행
  if(/여행|이동.*시작|길을 떠|며칠|멀리|대륙.*횡단|항해|출발했/.test(combined))
    return 4.0;

  // 이동/탐험
  if(/이동|탐색|탐험|돌아다|길을 걷|숲.*들어|던전.*진입|장소.*이동|향해 걷|발걸음/.test(combined))
    return 2.0;

  // 전투
  if(/전투|싸움|공격|방어|베었|강타|쓰러뜨|몬스터|적이|전쟁/.test(combined))
    return 1.0;

  // 제작/연금술/훈련 (시간 소모 있는 활동)
  if(/제작|단조|연금|수련|훈련|공부|연구|기다렸/.test(combined))
    return 1.5;

  // 휴식/식사
  if(/휴식|쉬|앉아|밥을 먹|식사|포션.*마셨|잠깐 쉬/.test(combined))
    return 1.0;

  // 대화/상점/정보 수집 → 가장 빠름
  return 0.3;
}
window.detectActionTimeCost = detectActionTimeCost;

export function getCurrentEncounterMult(){
  try{
    const transportType = S?._activeTransport;
    if(!transportType || transportType==='walk') return 1.0;
    const t = (typeof TRANSPORT_CONFIG!=='undefined') ? TRANSPORT_CONFIG[transportType] : null;
    if(!t) return 1.0;
    return t.encounterMult !== undefined ? t.encounterMult : 1.0;
  }catch(e){ return 1.0; }
}
window.getCurrentEncounterMult = getCurrentEncounterMult;

window.getCurrentEncounterMult = getCurrentEncounterMult;

window.detectActionTimeCost = detectActionTimeCost;

// [버그 수정 — 제거] 여기 있던 hookTransportTimeCost는 window.
// detectActionTimeCost를 감싸는 방식이었는데, 이 함수의 유일한
// 호출부(advanceTimeByAction, 바로 아래)조차 같은 모듈 안에서 bare
// 식별자로 원본 함수 선언을 직접 참조해 호출한다 — 같은 파일 안에서도
// 함수 선언의 렉시컬 바인딩이 이후의 window 재할당보다 항상 우선하므로
// — 이 wrap은 한 번도 실행된 적이 없었다. 그 결과 탑승 수단(말·배 등)의
// 이동 속도 배율이 실제 시간 소모 계산에 전혀 반영되지 않았다. 그
// 로직을 advanceTimeByAction() 안에 네이티브로 흡수했다.

export function recordTransportTimeCost(transportType){
  try{
    S._activeTransport = transportType;
    S._activeTransportSetAt = S?.msgCount||0;
  }catch(e){}
}
window.recordTransportTimeCost = recordTransportTimeCost;

window.recordTransportTimeCost = recordTransportTimeCost;

// [버그 수정 — 제거] 여기 있던 hookTransportResetAfterUse도 위와 같은
// 원인으로 죽어있었다 — advanceTimeByAction의 유일한 외부 호출부
// (quest/086)가 `import { advanceTimeByAction } from '../world/214-...js'`로
// 직접 바인딩해 bare 식별자로 호출하므로 window 재할당이 도달한 적이
// 없었다. 그 결과 탑승 수단 사용 후 "한 번 쓰면 다시 도보로 돌아간다"는
// 초기화가 전혀 일어나지 않아, 한 번 탑승하면 이후 모든 행동에 그
// 탑승 수단의 인카운터 배율(getCurrentEncounterMult)이 영구히 적용되는
// 상태였다. advanceTimeByAction() 안에 네이티브로 흡수했다.

export function timeCostToCalendar(totalCost){
  const totalDays  = Math.floor(totalCost / TIME_COST_PER_DAY);
  // [2026-09-25, 33번 섹션] 달 이름/계절 테이블을 data/214의
  // CALENDAR_MONTHS로 뽑아내 world/306(실시간 달력, S1 재설계)과
  // 공유한다 — 예전엔 이 함수 안에만 있던 인라인 배열이었음.
  const monthIdx   = Math.floor(totalDays / CALENDAR_DAYS_PER_MONTH) % CALENDAR_MONTHS.length;
  const dayOfMonth = (totalDays % CALENDAR_DAYS_PER_MONTH) + 1;
  const year       = 3782 + Math.floor(totalDays / (CALENDAR_DAYS_PER_MONTH * CALENDAR_MONTHS.length));
  return { month: CALENDAR_MONTHS[monthIdx], dayOfMonth, year, totalDays };
}
window.timeCostToCalendar = timeCostToCalendar;

window.timeCostToCalendar = timeCostToCalendar;

export function timeCostToTimeOfDay(totalCost){
  // 하루 안에서 소수 부분으로 시간대 결정
  const dayFrac = (totalCost % TIME_COST_PER_DAY) / TIME_COST_PER_DAY;
  // 0.0~1.0 → TIME_CYCLE 인덱스
  const idx = Math.floor(dayFrac * TIME_CYCLE.length);
  return TIME_CYCLE[Math.min(idx, TIME_CYCLE.length-1)];
}
window.timeCostToTimeOfDay = timeCostToTimeOfDay;

window.timeCostToTimeOfDay = timeCostToTimeOfDay;

export function advanceTimeByAction(userMsg, aiText){
  try{
    let cost = detectActionTimeCost(userMsg, aiText);
    // 이동 분기(2.0/4.0)일 때만 탑승 수단의 이동 속도 배율을 시간
    // 소모에 반영 — 자세한 경위는 이 함수 앞의 주석 참고.
    if(cost === 2.0 || cost === 4.0){
      const transportType = S?._activeTransport;
      const t = (typeof TRANSPORT_CONFIG!=='undefined') ? TRANSPORT_CONFIG[transportType] : null;
      if(t && transportType!=='walk'){
        cost = t.isTeleport ? 0.1 : Math.max(0.2, cost / (t.speedMult||1));
      }
    }
    const prev   = loadTimeCost();
    const next   = prev + cost;
    saveTimeCost(next);

    const atm = typeof loadAtmosphere==='function' ? loadAtmosphere() : {};
    const prevDay = Math.floor(prev / TIME_COST_PER_DAY);
    const nextDay = Math.floor(next / TIME_COST_PER_DAY);

    // 시간대 업데이트
    atm.timeOfDay = timeCostToTimeOfDay(next);
    if(typeof saveAtmosphere==='function') saveAtmosphere(atm);

    // 날짜 넘어갈 때 날씨 변경 + 토스트
    if(nextDay > prevDay){
      const cal = timeCostToCalendar(next);
      updateWeather();
      const timeLabel = {dawn:'새벽',morning:'아침',midday:'낮',afternoon:'오후',evening:'저녁',night:'밤',midnight:'자정'}[atm.timeOfDay]||'';
      if(cost >= 8.0){
        toastHTML(`🌅 날이 밝았다 — ${typeof getEntityIconHTML==='function'?getEntityIconHTML(cal.month,{size:14}):(cal.month.icon)} ${esc(cal.dayOfMonth)}일 ${esc(timeLabel)}`, 2500);
      } else if(nextDay - prevDay >= 2){
        toastHTML(`📅 ${esc(nextDay - prevDay)}일이 지났다 — ${typeof getEntityIconHTML==='function'?getEntityIconHTML(cal.month,{size:14}):(cal.month.icon)} ${esc(cal.dayOfMonth)}일`, 2500);
      }
    }

    // 수면/하루 전환 시 HP/MP 소량 회복
    if(cost >= 8.0){
      if(S.stats){
        S.stats.hp = Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999), (S.stats.hp||100) + 20);
        S.stats.mp = Math.min((typeof getPlayerMaxMp==='function'?getPlayerMaxMp():999), (S.stats.mp||100) + 30);
        if(typeof window.updateHeader==='function') window.updateHeader();
      }
    }

    // 탑승 직후 1회 사용했으면 초기화 — 다음 이동부터는 다시 도보.
    // 자세한 경위는 이 함수 앞의 주석 참고.
    if(S._activeTransport && S._activeTransportSetAt !== undefined && (S?.msgCount||0) > S._activeTransportSetAt){
      S._activeTransport = null;
    }

    return cost;
  }catch(e){ return 0; }
}
window.advanceTimeByAction = advanceTimeByAction;

window.advanceTimeByAction = advanceTimeByAction;

export function updateWeather() {
  try {
    const atm = typeof loadAtmosphere === 'function' ? loadAtmosphere() : {};
    const prevWeather = atm.weather;
    const totalDays = Math.floor(loadTimeCost() / TIME_COST_PER_DAY);
    atm.weather = WEATHER_CYCLE[Math.floor(totalDays / 3) % WEATHER_CYCLE.length]; // 3일마다 날씨 변경
    if (typeof saveAtmosphere === 'function') saveAtmosphere(atm);
    // [신규] 실제로 날씨가 바뀐 경우에만 알림 — 매 호출마다 같은 값이
    // 재계산되어 대입되므로, 값이 달라졌을 때만 토스트를 띄운다.
    if(prevWeather !== atm.weather && typeof notifyWeatherChange==='function'){
      notifyWeatherChange(atm.weather);
    }
  } catch(e) {}
}
window.updateWeather = updateWeather;

export function advanceTime() {
  try {
    const atm = typeof loadAtmosphere === 'function' ? loadAtmosphere() : {};
    atm.timeOfDay = timeCostToTimeOfDay(loadTimeCost());
    if (typeof saveAtmosphere === 'function') saveAtmosphere(atm);
  } catch(e) {}
}
window.advanceTime = advanceTime;

export function getWeatherEffect() {
  try {
    const atm = typeof loadAtmosphere === 'function' ? loadAtmosphere() : {};
    return atm.weather || 'clear';
  } catch(e) { return 'clear'; }
}
window.getWeatherEffect = getWeatherEffect;

window.updateWeather = updateWeather;

window.advanceTime   = advanceTime;

window.getWeatherEffect = getWeatherEffect;

(function hookAutoAdvanceTime() {
  const tryHook = () => {
    const fn = typeof window.buildLightSystem === 'function' ? 'buildLightSystem' : null;
    if (!fn) { setTimeout(tryHook, 3500); return; }
    if (window._v50TimeHooked) return;
    window._v50TimeHooked = true;
    const orig = window[fn];
    window[fn] = function() {
      advanceTime();
      return orig.apply(this, arguments);
    };
  };
  setTimeout(tryHook, 4500);
})();
