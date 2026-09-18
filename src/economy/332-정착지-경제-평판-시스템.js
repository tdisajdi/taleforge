// 정착지 경제·평판 시스템 — [2026-09-18, 10번 습격 시스템 후속]
// 사용자 요청(원문 요약): "습격 시스템의 결과가 실제 경제/명성 시스템에
// 전혀 연동이 안 되는데, 애초에 그런 시스템 자체가 없어서다. 그걸 따로
// 만들어라. 상황에 따라 유동적으로." 정착지별 번영도/인구, 상점 재고·물가
// 영향, 플레이어별 그 장소에서의 평판, 교역로 상태를 실제로 변하는 값으로
// 추적하는 신규 시스템 — 10번 섹션에서 "경제/평판 등 실제 경제 시스템
// 연동은 안 함(그런 시스템이 코드베이스에 아예 없어서)"이라고 정직하게
// 남겨뒀던 공백을 이번에 메운다.
//
// [중요 — 기존 시스템과의 구분] 이 시스템은 "세력"(faction, 왕국기사단/
// 교회 등)이 아니라 "장소"(정착지 하나하나) 단위다. 기존에 이미 있는
// 두 세력 평판 시스템(world/219의 changeFactionRep·FACTION_DEFS 고정
// 목록판, npc/067의 updateFactionRep·시나리오별 FACTIONS판 — 실사용처
// 20곳 이상으로 이게 실제 라이브 세력 시스템이고 219는 GS 필드 처리
// 1곳에서만 씀, 전수조사로 확인)와는 키 공간부터 완전히 분리된
// 별도 저장소(`tf-location-economy`)를 쓴다 — 세 번째 평행 세력
// 시스템을 또 만드는 게 아니라, 기존에 아예 없던 "장소" 축을 새로
// 추가하는 것. economy/285의 ECONOMY_ACTIONS(플레이어가 직접 발동하는
// 투자/고용류, 전역 상태)와도 범위가 달라 그대로 별개로 둔다.
//
// [설계 정정 — 조정자 지시] 최초 설계는 "습격을 방치해도(화면 밖에서
// 확률로 실패해도) 그 장소 평판이 깎인다"였는데, 사용자가 "내가 직접
// 습격한 게 아닌 이상 평판이 떨어지면 안 된다 — 안 그러면 모든 마을을
// 다 뛰어다니며 지켜야 해서 못 따라간다"고 명확히 정정. 그래서 평판은
// 이 파일 안에서 **양수 델타로만** 호출한다(플레이어가 그 장소에서 직접
// 방어/거래/퀘스트/봉납 등 긍정적 행동을 했을 때만 상승). changeLocationReputation
// 함수 자체는 나중에 "플레이어가 그 장소를 직접 습격하는" 가해 메커니즘이
// 생기면 음수 델타도 받을 수 있게 범용으로 열어두되(그런 메커니즘은
// 아직 없음), 이번 라운드에 실제로 호출하는 모든 지점(world/320)은
// 절대 음수를 넘기지 않는다 — "내가 안 가서 방치된 습격"은 평판에
// 손대지 않는다는 원칙을 호출부 쪽에서 지킨다.
//
// [영지(demesne) 시스템과의 관계 — 조사 결과] src/race/260의
// establishDemesne/loadDemesne("tf-demesne")는 플레이어가 자유 텍스트
// 이름으로 만드는 완전히 추상적인 영지 패널(세수/번영/방어/충성)로,
// LOCATION_DATA의 실제 150여 개 장소 중 어디와도 loc.id로 연결되는
// 필드가 없다(establishDemesne(name)에 좌표/장소ID 매개변수 자체가
// 없음 — 직접 확인). 즉 world/320의 화면 그래프(buildKingdomGraph)
// 어디에도 "내 영지" 노드가 존재하지 않는다. 그래서 "내 영지는 방어
// 투자로 습격에 더 오래/안전하게 버틴다"는 조정자 요청은 이번 라운드
// 에서 억지로 가짜 연결을 만들지 않고(요청받은 범위 밖) 보류하며,
// 아래 함수들은 습격 시스템이 이미 다루는 RAID_VULNERABLE_TYPES
// 정착지(일반 town/village/hamlet)에만 적용된다 — 자세한 내용은
// 작업메모장.md 11번 섹션 참고.
import { lsGet, lsSet, toast } from '../utils.js';

export const LOCATION_ECONOMY_KEY = 'tf-location-economy';

// ── 값 범위 상수 ──
const PROSPERITY_BASELINE = 50;
const PROSPERITY_MIN = 0, PROSPERITY_MAX = 100;
const REP_MIN = -100, REP_MAX = 100;
// 번영도가 기준치(50)에서 벗어나 있으면 실제 시각 경과에 따라 천천히
// 기준치 쪽으로 당겨진다("아무 일도 없어도 시간이 지나면 서서히
// 회복/둔화") — 라운드 10의 습격 복구 타이머(45초~5분)와는 별개로,
// 이건 습격이 없어도 항상 작동하는 훨씬 느린 배경 추세다. 기준치까지
// 완전히 돌아오는 데 최악의 경우(파괴 직후, -30에서 시작) 대략 2시간
// 정도 걸리는 속도로 잡았다 — 인게임에서 체감할 만큼 느리게.
const DRIFT_RATE_PER_MS = 1 / (4 * 60 * 1000); // 4분당 1p씩 기준치로

function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

export function loadLocationEconomy(){ try{ return JSON.parse(lsGet(LOCATION_ECONOMY_KEY)||'{}')||{}; }catch(e){ return {}; } }
window.loadLocationEconomy = loadLocationEconomy;

export function saveLocationEconomy(d){ try{ lsSet(LOCATION_ECONOMY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveLocationEconomy = saveLocationEconomy;

function _defaultLocEcon(now){
  return {
    prosperity: PROSPERITY_BASELINE,
    reputation: 0,
    tradeRouteStatus: 'normal', // 'normal' | 'disrupted'
    lastDriftAt: now || Date.now(),
    history: [], // [{delta, reason, at}] 최근 20건
  };
}

// 실제 경과 시간(ms)만큼 번영도를 기준치 쪽으로 당긴다 — 습격이 없어도
// 항상 작동하는 자연 회복/둔화. read든 write든 그 레코드를 건드릴 때마다
// 호출해서 "저장은 안 했지만 오래 방치된" 시간까지 정확히 반영한다
// (백그라운드 폴러를 따로 안 돌려도, 다음에 그 장소를 조회하는 순간
// 그동안 누적된 만큼 한 번에 계산되는 lazy 방식 — 습격 폴러처럼 상시
// setInterval이 필요할 정도로 긴급한 실시간성이 아니라서 이쪽이 더
// 가볍다).
function _applyDrift(rec, now){
  const last = rec.lastDriftAt || now;
  const elapsed = now - last;
  if(elapsed <= 0){ rec.lastDriftAt = now; return; }
  const diff = PROSPERITY_BASELINE - rec.prosperity;
  if(Math.abs(diff) >= 0.1){
    const maxStep = DRIFT_RATE_PER_MS * elapsed;
    const step = Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
    rec.prosperity = clamp(rec.prosperity + step, PROSPERITY_MIN, PROSPERITY_MAX);
  }
  rec.lastDriftAt = now;
}

// 레코드를 조회(없으면 기본값 생성)하면서 드리프트까지 적용하고, 바뀐
// 상태를 그 자리에서 저장한다. 이 시스템의 모든 read/write 진입점이
// 전부 이 함수를 거친다.
function _touch(locId, now){
  const all = loadLocationEconomy();
  if(!all[locId]) all[locId] = _defaultLocEcon(now);
  _applyDrift(all[locId], now);
  saveLocationEconomy(all);
  return { all, rec: all[locId] };
}

export function getLocationEconomy(locId){
  if(!locId) return _defaultLocEcon(Date.now());
  return _touch(locId, Date.now()).rec;
}
window.getLocationEconomy = getLocationEconomy;

export function changeProsperity(locId, delta, reason){
  if(!locId) return null;
  const { all, rec } = _touch(locId, Date.now());
  rec.prosperity = clamp(rec.prosperity + delta, PROSPERITY_MIN, PROSPERITY_MAX);
  if(reason) rec.history = (rec.history||[]).concat([{ delta, reason, at:new Date().toISOString() }]).slice(-20);
  saveLocationEconomy(all);
  return rec;
}
window.changeProsperity = changeProsperity;

// [설계 정정 반영] isPlayerAction은 방어적 표식일 뿐이다 — 이 함수 자체를
// 강제로 clamp하진 않는다(나중에 "플레이어가 이 장소를 직접 습격한다"는
// 가해 메커니즘이 생기면 음수 델타도 이 함수를 그대로 재사용할 수 있게
// 열어두기 위함). 대신 지금 이 라운드에서 실제로 이 함수를 호출하는
// world/320 쪽 코드가 전부 양수 델타만 넘긴다 — "플레이어가 그 자리에
//없어 방치된 습격 결과"로는 절대 호출하지 않는다(주석으로 각 호출부에
// 명시).
export function changeLocationReputation(locId, delta, reason, isPlayerAction=false){
  if(!locId) return null;
  const { all, rec } = _touch(locId, Date.now());
  const old = rec.reputation;
  rec.reputation = clamp(rec.reputation + delta, REP_MIN, REP_MAX);
  if(reason) rec.history = (rec.history||[]).concat([{ delta, reason, at:new Date().toISOString(), isPlayerAction:!!isPlayerAction }]).slice(-20);
  saveLocationEconomy(all);
  if(Math.abs(delta) >= 5) toast(`🤝 평판 변화: ${delta>0?'+':''}${delta} (${rec.reputation})`, 2200);
  return rec;
}
window.changeLocationReputation = changeLocationReputation;

export function setTradeRouteStatus(locId, status){
  if(!locId) return null;
  const { all, rec } = _touch(locId, Date.now());
  if(rec.tradeRouteStatus !== status){
    rec.tradeRouteStatus = status;
    rec.history = (rec.history||[]).concat([{ tradeRouteStatus:status, at:new Date().toISOString() }]).slice(-20);
    saveLocationEconomy(all);
  }
  return rec;
}
window.setTradeRouteStatus = setTradeRouteStatus;

// 번영도/교역로 상태 → 실제 물가 배율. 번영도가 낮을수록(경기 침체)
// 물건이 비싸지고, 높을수록(호황) 저렴해진다 — economy/069의
// getDynamicPrice(인플레/전쟁/신분)나 quest/086의 getDynamicPriceMultiplier
// (플레이어의 개인 영지 번영도)와는 별개의 "이 장소 자체의" 배율이라
// 곱으로 쌓인다. 값이 과도하게 튀지 않도록 좁게 클램프한다(요구사항:
// "숫자 규모는 알아서 정하되 안전하게 bound").
export function getLocationPriceMult(locId){
  if(!locId) return 1.0;
  const rec = getLocationEconomy(locId);
  let mult = 1.25 - (rec.prosperity/100) * 0.4; // 번영 0→1.25배, 번영 100→0.85배
  if(rec.tradeRouteStatus === 'disrupted') mult *= 1.15;
  return clamp(mult, 0.8, 1.4);
}
window.getLocationPriceMult = getLocationPriceMult;

// 번영도/교역로 상태 → 실제 재고(상품 종류 수) 배율. 번영도가 낮으면
// 상인들이 물건을 덜 들여놓는다는 설정 — 상점 목록 길이를 이 배율만큼
// 줄인다(items/007의 getShopStock/getDynamicShopStock에서 실사용).
export function getLocationStockMult(locId){
  if(!locId) return 1.0;
  const rec = getLocationEconomy(locId);
  let mult = 0.5 + (rec.prosperity/100) * 0.6; // 번영 0→0.5, 번영 100→1.1(클램프로 1.0)
  if(rec.tradeRouteStatus === 'disrupted') mult *= 0.7;
  return clamp(mult, 0.4, 1.0);
}
window.getLocationStockMult = getLocationStockMult;

// 상점 재고 배열에 위 배율을 실제로 적용하는 공용 헬퍼 — 개수만 줄이고
// (희귀도 순서 등 기존 정렬은 건드리지 않도록 뒤에서부터 잘라낸다),
// 최소 2개는 항상 남겨 상점이 완전히 텅 비어 보이지 않게 한다.
export function applyLocationStockCut(items, locId){
  if(!Array.isArray(items) || !items.length || !locId) return items;
  const mult = getLocationStockMult(locId);
  const keep = Math.max(2, Math.min(items.length, Math.round(items.length * mult)));
  return items.slice(0, keep);
}
window.applyLocationStockCut = applyLocationStockCut;

// 필드 패널 등 UI에 한 줄로 보여주기 위한 요약 — 숫자 그대로 노출은
// 219 세력 패널의 관례(레벨 라벨 + 수치 둘 다 노출)를 그대로 따랐다.
export function getLocationEconomySummary(locId){
  if(!locId) return null;
  const rec = getLocationEconomy(locId);
  const prosLabel = rec.prosperity>=75?'번영':rec.prosperity>=50?'평온':rec.prosperity>=25?'침체':'피폐';
  const repLabel = rec.reputation>=50?'환영받음':rec.reputation>=15?'우호적':rec.reputation>=-14?'무관심':'경계';
  return {
    prosperity: Math.round(rec.prosperity), prosLabel,
    reputation: Math.round(rec.reputation), repLabel,
    tradeRouteStatus: rec.tradeRouteStatus,
  };
}
window.getLocationEconomySummary = getLocationEconomySummary;

// ── 검증 전용 훅 — 라운드 10의 __tfDebugRaidState 등과 같은 관례.
// 실제 판정 함수를 그대로 호출하되, 자연 드리프트를 기다리지 않고
// lastDriftAt만 과거로 당겨서 "실제 시간이 그만큼 지난 것처럼" 만든다
// (드리프트 계산식 자체는 그대로 — 우회 없음).
window.__tfDebugLocEconomy = function(locId){ return locId ? getLocationEconomy(locId) : null; };
window.__tfDebugForceLocDrift = function(locId, msAgo){
  if(!locId) return null;
  const all = loadLocationEconomy();
  if(!all[locId]) all[locId] = _defaultLocEcon(Date.now());
  all[locId].lastDriftAt = Date.now() - (msAgo||0);
  saveLocationEconomy(all);
  return getLocationEconomy(locId);
};
