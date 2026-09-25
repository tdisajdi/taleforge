// ⑥ ⏳ 세계 시간 달력 시스템 (확장)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { CALENDAR_DAYS_PER_MONTH, CALENDAR_MONTHS } from '../data/214-11-날씨-자동-순환.js';
import { esc, lsGet, lsSet } from '../utils.js';

// [2026-09-25, 33번 섹션 — S1 재설계] 이 모듈은 원래 `loadGameTime()`
// (localStorage 키 'tf-gametime')을 읽었는데, 그 키에 실제로 값을
// 쓰는 코드가 프로젝트 어디에도 없어서 — 이 달력 시스템 전체가 실제
// 플레이에서 항상 빈 상태(1일차·봄으로 얼어붙은 화면)였다. 대신 이
// 게임에 이미 있는 실제 시간 시스템(world/214의 loadTimeCost/
// advanceTimeByAction, 턴마다 행동 종류별로 다른 "시간 비용"을
// 누적하는 방식)으로 바꾸려 했으나, 사용자가 "예전엔 턴수로 게임이
// 진행되는 방식이었는데 지금은 아니다"라고 정정 — 확인해보니
// world/214의 시간 시스템도 quest/086의 sendMsg() 안에서만 불려서
// 실시간 필드 이동(world/320) 모드 중에는 전혀 안 돈다는 게 실제로
// 확인됐다(10번 섹션에서 습격 타이머를 S.msgCount→Date.now()로
// 바꾼 것과 정확히 같은 이유). 그래서 이 달력은 **실제 시각(Date.now())
// 경과 기준**으로 새로 설계한다 — 필드 이동 중이든 대화 중이든 페이지가
// 열려있기만 하면 계속 흐른다(economy/332의 lastDriftAt/_applyDrift와
// 동일한 "조회 시점에 경과 시간만큼 한 번에 계산" 방식, 별도 setInterval
// 안 돌림). 달 이름/계절 테이블은 world/214(턴 기반 시간 비용 누적치를
// 월/계절로 바꾸는 timeCostToCalendar)와 data/214의 CALENDAR_MONTHS를
// 그대로 공유해 세계관상 "한 달=15일, 계절당 2달" 정의가 두 시스템
// 사이에서 어긋나지 않게 했다.

const CALENDAR_EPOCH_KEY = 'tf-calendar-epoch';
// 새로 정한 값(밸런스 튜닝 아님, 방향만 원문 텍스트와 일치) — 게임
// 화면이 열려있는 동안 30분마다 하루가 지나가게 함. 1년(8달×15일=120일)
// = 실제 60시간(장시간 플레이 세션 몇 번이면 계절 전환을 실제로 볼 수
// 있는 정도).
const REAL_MS_PER_GAME_DAY = 30 * 60 * 1000;

// 이 세계관의 "1년차" 기준 시작 연도(world/214의 timeCostToCalendar와
// 동일한 값 — 두 시스템의 "몇 년째인지" 표기가 어긋나지 않게 맞춤).
const CALENDAR_BASE_YEAR = 3782;

function _getCalendarEpoch(){
  try{
    let e = parseInt(lsGet(CALENDAR_EPOCH_KEY)||'0', 10);
    if(!e){
      e = Date.now();
      lsSet(CALENDAR_EPOCH_KEY, String(e));
    }
    return e;
  }catch(err){ return Date.now(); }
}

// 달력 상태 판정을 한 곳에서만 계산 — getCalendarEffect()(AI 프롬프트용
// 텍스트)와 getCalendarModifiers()(실제 게임 시스템에 곱하는 숫자 배율),
// renderWorldCalendarPanel()(UI) 셋 다 이 함수 하나의 결과만 보고
// 파생시킨다. 판정 기준이 텍스트·숫자·화면 사이에서 서로 어긋나는 걸
// 원천적으로 방지하기 위함(2026-09-25, 33번 섹션).
function _calendarDayState(){
  const epoch = _getCalendarEpoch();
  const totalDays = Math.max(0, Math.floor((Date.now() - epoch) / REAL_MS_PER_GAME_DAY));
  const monthIdx   = Math.floor(totalDays / CALENDAR_DAYS_PER_MONTH) % CALENDAR_MONTHS.length;
  const dayOfMonth = (totalDays % CALENDAR_DAYS_PER_MONTH) + 1;
  const year       = CALENDAR_BASE_YEAR + Math.floor(totalDays / (CALENDAR_DAYS_PER_MONTH * CALENDAR_MONTHS.length));
  const month = CALENDAR_MONTHS[monthIdx];
  const season = month.season;
  const moonPhase = totalDays % 30;
  // 계절 시작(day1)/중반(day15)급 특별일은 그 계절의 "첫 번째 달"
  // 기준으로 잡는다(계절당 2달 중 monthIdx가 짝수인 쪽 — 예: 봄=0,1
  // 중 0번 달).
  const isFirstMonthOfSeason = monthIdx % 2 === 0;
  return {
    totalDays, monthIdx, dayOfMonth, year, month, season, moonPhase,
    isFullMoon: moonPhase >= 13 && moonPhase <= 16,
    isNewMoon: moonPhase === 0 || moonPhase === 29,
    isWaxingCrescent: moonPhase <= 5,
    isSpringFestival: isFirstMonthOfSeason && dayOfMonth === 1 && season === '봄',
    isWinterSolstice: isFirstMonthOfSeason && dayOfMonth === 1 && season === '겨울',
    isSummerSolstice: isFirstMonthOfSeason && dayOfMonth === 15 && season === '여름',
    isHarvestFestival: isFirstMonthOfSeason && dayOfMonth === 15 && season === '가을',
    isWinter: season === '겨울',
  };
}

export function getCalendarEffect(){
  try{
    const st = _calendarDayState();
    const effects = [];
    // 달 위상
    if(st.isFullMoon){
      effects.push('🌕 보름달 — 수인족 야수 각성 위험 증가, 언데드 활성화');
    } else if(st.isNewMoon){
      effects.push('🌑 그믐달 — 어둠의 마법 강화, 은신 판정 보너스');
    } else if(st.isWaxingCrescent){
      effects.push('🌒 초승달 — 새로운 시작에 축복, 탐험 판정 소폭 상승');
    }
    // 특별 날짜
    if(st.isSpringFestival) effects.push('🌸 봄의 축제 — NPC들이 축제 분위기, 상점 20% 할인');
    if(st.isWinterSolstice) effects.push('❄️ 동짓날 — 언데드 전력 강화, 신관들이 정화 의식 거행');
    if(st.isSummerSolstice) effects.push('☀️ 하지 대제 — 화염 마법 강화, 왕국 곳곳 경비 증원');
    if(st.isHarvestFestival) effects.push('🍂 추수제 — 영지 수입 증가, NPC들이 관대해짐');
    // 계절 효과
    const seasonBaseEff = {봄:'초목이 자라고 탐험하기 좋은 날씨', 여름:'뜨거운 열기로 피로도 증가, 수분 섭취 필요', 가을:'시야가 맑아 탐색 유리, 적들이 예민해짐', 겨울:'이동 속도 감소, 생존 소모품 중요성 증가'}[st.season]||'';
    if(seasonBaseEff && !effects.length) effects.push(seasonBaseEff);
    return effects.join(' | ');
  }catch(e){ return ''; }
}
window.getCalendarEffect = getCalendarEffect;

// [2026-09-25, 33번 섹션 신규] 실제 게임 시스템(상점 가격/이동 속도/
// 수인족 야수화/영지 수입)에 곱하는 구조화된 배율. getCalendarEffect()가
// AI 프롬프트에만 텍스트로 꽂히고 실제로는 아무 시스템도 안 읽던 공백
// (S1 발견)을 메우기 위해 신설 — _calendarDayState()의 같은 판정을
// 공유해 텍스트와 숫자가 어긋나지 않는다. 평소(어떤 이벤트도 없음)엔
// 전부 1.0(중립)이라 기존 동작에 회귀가 없다.
export function getCalendarModifiers(){
  try{
    const st = _calendarDayState();
    return {
      // 봄의 축제 — 텍스트가 이미 "상점 20% 할인"이라고 약속한 값 그대로.
      shopPriceMult: st.isSpringFestival ? 0.8 : 1,
      // 겨울 — 텍스트("이동 속도 감소")의 방향만 정해져 있어 이번에
      // 신규로 정한 값(15% 감소).
      travelSpeedMult: st.isWinter ? 0.85 : 1,
      // 보름달 — 텍스트("야수 각성 위험 증가")의 방향만 정해져 있어
      // 이번에 신규로 정한 값(50% 증가).
      beastRiskMult: st.isFullMoon ? 1.5 : 1,
      // 추수제 — 텍스트("영지 수입 증가")의 방향만 정해져 있어 이번에
      // 신규로 정한 값(30% 증가).
      incomeMult: st.isHarvestFestival ? 1.3 : 1,
    };
  }catch(e){ return { shopPriceMult:1, travelSpeedMult:1, beastRiskMult:1, incomeMult:1 }; }
}
window.getCalendarModifiers = getCalendarModifiers;

// 검증 전용 훅 — economy/332의 __tfDebugForceLocDrift와 동일한 관례
// (판정식은 그대로 두고 epoch 타임스탬프만 과거로 당겨서 "그만큼 실제
// 시간이 지난 것"을 재현). 판정 로직 우회 없음.
window.__tfDebugForceCalendarEpochOffset = function(msAgo){
  try{
    const now = Date.now();
    lsSet(CALENDAR_EPOCH_KEY, String(now - msAgo));
    return { effect: getCalendarEffect(), modifiers: getCalendarModifiers(), state: _calendarDayState() };
  }catch(e){ return null; }
};
window.__tfDebugCalendarState = function(){ return _calendarDayState(); };

export function getMoonPhaseIcon(){
  try{
    const st = _calendarDayState();
    const p = st.moonPhase;
    if(p<=2||p>=28) return '🌑';
    if(p<=7) return '🌒';
    if(p<=12) return '🌓';
    if(p<=17) return '🌕';
    if(p<=22) return '🌖';
    if(p<=26) return '🌗';
    return '🌘';
  }catch(e){ return '🌙'; }
}
window.getMoonPhaseIcon = getMoonPhaseIcon;

export function renderWorldCalendarPanel(){
  const body = document.getElementById('pb-world-calendar');
  if(!body) return;
  const st = _calendarDayState();
  const moonPct = Math.round(st.moonPhase / 29 * 100);
  const effect = getCalendarEffect();
  const moonIcon = getMoonPhaseIcon();
  const moonName = st.moonPhase<=2||st.moonPhase>=28?'그믐달':st.moonPhase<=7?'초승달':st.moonPhase<=12?'상현달':st.moonPhase<=17?'보름달':st.moonPhase<=22?'기우는달':st.moonPhase<=26?'하현달':'그믐 무렵';
  // 이번 계절 특별일 표시용 — 계절 안에서 몇째 날인지(첫 달=1~15,
  // 둘째 달=16~30)를 계산해 day1/day15 이벤트 목록과 맞춘다.
  const isFirstMonthOfSeason = st.monthIdx % 2 === 0;
  const dayInSeason = isFirstMonthOfSeason ? st.dayOfMonth : st.dayOfMonth + CALENDAR_DAYS_PER_MONTH;

  const seasonEvents = {
    봄: [{day:1,name:'봄의 축제',desc:'만물이 깨어나는 날. 상점 할인, NPC 우호'},{day:15,name:'씨앗 심는 날',desc:'농민들이 영지에서 바쁘게 움직임'}],
    여름: [{day:1,name:'여름 개전',desc:'군대 훈련 시즌 시작. 용병 고용 수요 증가'},{day:15,name:'하지 대제',desc:'화염 마법 강화. 왕국 경비 증원'}],
    가을: [{day:1,name:'사냥 해금',desc:'왕실 사냥 시즌 시작. 숲에서 귀족들 목격 가능'},{day:15,name:'추수제',desc:'영지 수입 증가. NPC 관대함 증가'}],
    겨울: [{day:1,name:'동짓날',desc:'언데드 강화. 신관들 정화 의식 시작'},{day:15,name:'얼음 축제',desc:'강이 얼어붙음. 빙상 이동 가능, 선박 이동 불가'}],
  }[st.season||'봄']||[];

  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#80b0e0;letter-spacing:1px;margin-bottom:12px">⏳ 세계 달력</div>

      <!-- 현재 날짜 -->
      <div style="padding:12px 14px;background:#000a18;border:1px solid #204060;margin-bottom:10px;text-align:center">
        <div style="font-size:28px;margin-bottom:4px">${moonIcon}</div>
        <div style="font-family:Cinzel,serif;font-size:13px;color:#80b0e0">${esc(st.month.icon)} ${esc(st.month.name)} · ${esc(st.season)} ${st.year}년 ${st.dayOfMonth}일</div>
        <div style="font-size:10px;color:#5080a0;margin-top:3px">${moonName} (${moonPct}%)</div>
      </div>

      <!-- 달 위상 바 -->
      <div style="margin-bottom:12px">
        <div style="font-size:9px;color:var(--dim);margin-bottom:4px">달의 위상</div>
        <div style="height:6px;background:#0a1520;border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${moonPct}%;background:linear-gradient(90deg,#1a3060,#80b0e0);border-radius:3px;transition:width .3s"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:2px;font-size:8px;color:var(--dim)"><span>🌑 그믐</span><span>🌓 상현</span><span>🌕 보름</span><span>🌗 하현</span></div>
      </div>

      <!-- 현재 효과 -->
      ${effect?`<div style="padding:10px 12px;background:#040e1e;border:1px solid #1a4060;margin-bottom:10px;border-left:3px solid #4080c0">
        <div style="font-size:9px;color:#4080c0;font-family:Cinzel,serif;margin-bottom:4px">⚡ 현재 효과</div>
        <div style="font-size:10px;color:#80a8c8;line-height:1.5">${esc(effect)}</div>
      </div>`:''}

      <!-- 이번 계절 이벤트 -->
      <div style="font-family:Cinzel,serif;font-size:9px;color:#6090b0;letter-spacing:1px;margin-bottom:6px">이번 계절 특별일</div>
      ${seasonEvents.map(e=>{
        const passed = dayInSeason > e.day;
        const today = dayInSeason === e.day;
        return `<div style="padding:7px 10px;background:${today?'#0a1e30':'#050d18'};border:1px solid ${today?'#4080c0':'#0a2040'};margin-bottom:4px;display:flex;gap:8px;align-items:flex-start">
          <div style="font-size:9px;color:${today?'#e0c040':passed?'var(--dim)':'#4080c0'};font-family:Cinzel,serif;min-width:28px">${e.day}일</div>
          <div>
            <div style="font-size:10px;color:${today?'#e8d070':passed?'var(--dim)':'#80b0e0'}">${today?'★ ':passed?'✓ ':''} ${esc(e.name)}</div>
            <div style="font-size:9px;color:var(--dim);line-height:1.4">${esc(e.desc)}</div>
          </div>
        </div>`;
      }).join('')}

      <!-- 세계 달력 영향 -->
      <div style="margin-top:10px;padding:8px 10px;background:#040810;border:1px dashed #1a3050;font-size:9px;color:var(--dim);line-height:1.6">
        💡 달력 효과는 상점 가격·이동 속도·수인족 야수화·영지 수입에 실제로 반영됩니다.<br>보름달 — 수인족 야수화 위험+50%, 겨울 — 이동 속도-15%, 봄의 축제 — 상점가-20%, 추수제 — 영지수입+30%
      </div>
    </div>`;
}
window.renderWorldCalendarPanel = renderWorldCalendarPanel;
