// ⑦ 실시간 필드 이동 — MapleStory/던전앤파이터 식 "화면 단위 필드 맵의
// 그래프"(정착지·던전은 그 자체가 화면 하나, 그 사이는 갈림길이 있는
// 여러 개의 중간 화면으로 연결) + WASD/터치조이스틱 실시간 이동 + 타일
// 충돌 + 몬스터 AI(공격적=발견하면 추격 / 겁많음=발견하면 도주 /
// 소극적=부딪혀야만 조우) + 팩 대 팩 조우전 + AI 호출 없는 로컬 미니
// 전투 엔진 + 실제 이동수단(TRANSPORT_CONFIG) 연동.
//
// [2026-09-18] 사용자가 예전에 만들어둔 독립 프로토타입(중앙 대륙 14곳을
// 손으로 fillRect/drawRoad로 그린 실험작)을 "전부다 넣어"달라고 요청.
// **1차 구현**은 왕국 하나를 통째로 담는 거대한 연속 타일 그리드
// (CONTINENT_COASTLINE 폴리곤으로 육지/바다 판정)였는데, 사용자가 이후
// 명확히 정정: "화면 전환 방식이어야 한다 — 메이플스토리/던전앤파이터
// 처럼 다른 곳으로 이동하면 화면이 여러 번 전환되고, 3갈래/4갈래
// 갈림길도 있어야 진짜 여행하는 느낌이다. 몬스터 추격 기능을 거대한
// 지도 하나 시간 때우려고 넣은 게 아니다." → 이동/충돌/몬스터AI/로컬
// 미니전투 엔진(아래 2번 섹션)은 화면 단위로도 그대로 재사용 가능해서
// 유지하고, 지형 생성기(1번 섹션)와 런타임(3번 섹션)만 "왕국 전체를
// 덮는 하나의 그리드"에서 "정착지/던전=노드, 그 사이 여러 개의 작은
// 중간 화면=엣지로 잇는 그래프"로 전면 재설계했다. 추가로 사용자가
// "말/배 등 기존에 만든 이동수단도 이동속도·접근 가능 지역 차등에
// 실제로 쓰이게 하라"고 요청 — `data/054`의 실제 TRANSPORT_CONFIG와
// `S._activeTransport`(travelByTransport가 매 여행마다 기록하는 실제
// "현재 타고 있는 이동수단" 필드)를 그대로 재사용한다(새 상태를 안
// 만듦). 상세 설계 배경은 작업메모장.md 9번 섹션 참고.
//
// [2026-09-18, 습격 라운드] 9번 섹션에서 스코프 밖으로 남겨뒀던 "마을 습격
// + 경비병"(옛 프로토타입 기능)을 이번 화면 그래프 구조에 맞게 새로 설계해
// 추가. 프로토타입은 왕도 하나·손으로 그린 성벽 4개 성문·"화면이 항상
// 살아있는" 단일 캔버스 전제였는데 셋 다 지금 구조와 안 맞아서 전부
// 재설계(하드코딩 좌표 없이 절차적 성벽/성문, lazy 화면 전제에 맞는
// 화면-독립적 백그라운드 타이머). 습격 타이머는 사용자가 명시적으로
// 확정한 대로 게임 턴이 아니라 실제 경과 시간(Date.now()) 기준 — 상세는
// 아래 "1.5) 정착지 습격 시스템" 섹션과 작업메모장.md 10번 섹션 참고.
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { getAllLandLocations, getLocationCoord } from '../economy/255-상인-거래소-교역-지부-확장.js';
import { CONTINENT_TERRAIN, CONTINENT_PROPER_NAME_ICON } from '../data/255-상인-거래소-교역-지부-확장.js';
import { loadCurrentLocation, saveCurrentLocation, getLocationLevelBand } from './052-동대륙-추가-장소-4.js';
import { getPlayerMaxHp, calcMonsterAttackDamage, loadParty, saveParty } from '../misc/054-이동수단-시스템.js';
import { TRANSPORT_CONFIG } from '../data/054-이동수단-시스템.js';
import { rollLoot } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { triggerLoopIfDead } from '../progression/220-18-회차루프-시스템.js';
import { changeLocationReputation, changeProsperity, getLocationEconomySummary, setTradeRouteStatus } from '../economy/332-정착지-경제-평판-시스템.js';
import { esc, toast, toastHTML, getEntityIconHTML, lsGet, lsSet } from '../utils.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';

// ══════════════════════════════════════════════════════════════════
// 1) 절차적 "화면 그래프" 생성기 — 왕국(대륙) 하나를 받아
//    (a) 정착지/던전마다 화면 하나(location 노드),
//    (b) 두 장소를 잇는 "길"을 1~3개의 작은 중간 화면(connector 노드)
//        체인으로 쪼개고, 종종 병렬 대체 경로(갈림길 — 같은 목적지로
//        다시 합류)와 비행 전용 지름길까지 함께 만든다.
//    실제 화면(타일 그리드)은 노드를 처음 밟을 때 지연 생성해서 캐싱한다
//    (왕국 하나를 한꺼번에 다 만들지 않음 — 딱 MapleStory 맵 로딩처럼).
// ══════════════════════════════════════════════════════════════════
// [2026-09-18, 도로/이정표 라운드] ROAD_PAVED 신규 — 정착지-정착지 사이
// connector 화면에 까는 "눈에 띄는 포장 도로" 전용 타일. 기존 FT.ROAD는
// 모든 connector 화면의 출구 주변 5x5 클리어링에 범용으로 쓰이고 있어서
// (던전으로 가는 길도 포함) 그걸 재사용하면 "던전은 표시 안 함" 요구사항과
// 충돌한다 — 그래서 색이 확실히 다른(밝은 회백색 자갈길) 새 타입을 따로 둔다.
export const FT = { GRASS:0, FOREST:1, WATER:2, MOUNTAIN:3, ROAD:4, HILLS:5, WALL:6, ROAD_PAVED:7 };
const FT_COLOR = {
  [FT.GRASS]:'#3d5c2a', [FT.FOREST]:'#243d1e', [FT.WATER]:'#1e4d66',
  [FT.MOUNTAIN]:'#4a4640', [FT.ROAD]:'#8a7550', [FT.HILLS]:'#4a5c34', [FT.WALL]:'#5c5346',
  [FT.ROAD_PAVED]:'#b8a878',
};
const FT_BLOCKING = new Set([FT.MOUNTAIN, FT.WATER, FT.WALL]);
const TILE = 20;
const SCREEN_COLS = 44, SCREEN_ROWS = 28; // 화면 하나의 크기(대륙 전체가 아니라 딱 한 화면 분량)
const EDGE_ORDER = ['N','E','S','W'];

const WILD_TYPES = new Set(['dungeon','wilderness','event']);
// [2026-09-18 습격 라운드] "정착지"로 취급해 성벽+성문+경비병을 두는
// 장소 타입(수도 포함 — 수도도 성벽은 있다, 다만 습격은 안 받는다).
// 습격 대상(RAID_VULNERABLE_TYPES)은 그중 수도/도시/항구를 뺀 좁은
// 부분집합 — 사용자 요구사항 "촌락/마을/소도시급, 수도는 제외".
const SETTLEMENT_TYPES = new Set(['capital','city','town','village','hamlet','port']);
const RAID_VULNERABLE_TYPES = new Set(['town','village','hamlet']);
function isRaidVulnerable(loc){ return !!(loc && RAID_VULNERABLE_TYPES.has(loc.type)); }
// [2026-09-18, 도로/이정표 라운드] 이 connector 화면이 "정착지-정착지" 구간인지
// 판정한다 — buildChain이 만든 모든 connector 노드는 srcLocs에 그 엣지의
// 실제 두 끝점(장소 id, 체인 중간 화면이 몇 개든 항상 원래 두 장소를 그대로
// 들고 있음)을 저장해두므로, 화면 자체를 새로 짓지 않고 그 두 끝점의 실제
// type만 보면 된다. 두 끝점이 전부 SETTLEMENT_TYPES(사람이 사는 곳)일 때만
// 참 — 한쪽이라도 던전/황야/사건이면 거짓(길이 드러나면 안 됨).
function isSettlementRouteNode(graph, node){
  if(!node || node.kind!=='connector' || !node.srcLocs) return false;
  const a = graph.locsById.get(node.srcLocs[0]), b = graph.locsById.get(node.srcLocs[1]);
  return !!(a && b && SETTLEMENT_TYPES.has(a.type) && SETTLEMENT_TYPES.has(b.type));
}

// 장소/화면 id·좌표 문자열로 결정론적 난수를 뽑는다(같은 노드는 항상
// 같은 결과 — 새로고침해도 지형이 안 흔들림).
function seedRand(seedStr, salt){
  let h = 0; const s = String(seedStr||'')+'|'+(salt||'');
  for(let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i)) >>> 0;
  return (h % 10000) / 10000;
}

// ── 1-A. 그래프(어느 화면이 어느 화면과 붙어있는가) ──
function worldDist(locA, locB){
  const a = getLocationCoord(locA), b = getLocationCoord(locB);
  if(!a || !b) return 99999;
  return Math.hypot(a.x-b.x, a.y-b.y);
}
// 최소 신장 트리(Prim) — 장소가 몇 개든 "가까운 것끼리만" 자연스럽게
// 이어지게 한다(완전 그래프로 다 이으면 화면 수가 폭발함).
function primMST(locs){
  if(locs.length<2) return [];
  const coords = locs.map(l=>getLocationCoord(l));
  const inTree = new Set([0]);
  const remaining = new Set(locs.map((_,i)=>i).filter(i=>i!==0));
  const edges = [];
  while(remaining.size){
    let best=null, bestD=Infinity, bestI=null;
    for(const i of inTree){
      const a = coords[i]; if(!a) continue;
      for(const j of remaining){
        const b = coords[j]; if(!b) continue;
        const d = Math.hypot(a.x-b.x, a.y-b.y);
        if(d<bestD){ bestD=d; best=j; bestI=i; }
      }
    }
    if(best==null) break;
    edges.push([bestI, best]);
    inTree.add(best); remaining.delete(best);
  }
  return edges;
}

const _graphCache = new Map(); // continentKey -> { sig, graph }

export function buildKingdomGraph(continentKey){
  const locsRaw = getAllLandLocations().filter(l => l.continent === continentKey);
  const sig = locsRaw.map(l=>l.name).sort().join('|');
  const cached = _graphCache.get(continentKey);
  if(cached && cached.sig === sig) return cached.graph;
  if(!locsRaw.length) return null;

  const nodes = new Map();
  const locsById = new Map();
  for(const loc of locsRaw){
    locsById.set(loc.id, loc);
    nodes.set(loc.id, { id:loc.id, kind:'location', loc, neighbors:[] });
  }
  let connSeq = 0;
  const newConnId = () => continentKey+'_c'+(connSeq++);
  function link(aId, bId, crossing){
    nodes.get(aId).neighbors.push({ to:bId, crossing });
    nodes.get(bId).neighbors.push({ to:aId, crossing });
  }
  // A→B 사이를 length개의 작은 중간 화면으로 쪼개 체인으로 연결한다.
  function buildChain(fromId, toId, length, crossing, srcLocIds){
    let prev = fromId;
    for(let i=0;i<length;i++){
      const cid = newConnId();
      nodes.set(cid, { id:cid, kind:'connector', neighbors:[], srcLocs:srcLocIds, midT:(i+1)/(length+1) });
      link(prev, cid, i===0 ? crossing : 'land');
      prev = cid;
    }
    link(prev, toId, length===0 ? crossing : 'land');
  }

  const mstEdges = primMST(locsRaw);
  for(const [ia, ib] of mstEdges){
    const locA = locsRaw[ia], locB = locsRaw[ib];
    const dist = worldDist(locA, locB);
    const chainLen = Math.max(1, Math.min(3, Math.round(dist/600)));
    const edgeKey = locA.id+'|'+locB.id;
    // 기본 경로
    buildChain(locA.id, locB.id, chainLen, 'land', [locA.id, locB.id]);
    // [갈림길] 종종 같은 목적지로 다시 합류하는 대체 경로를 하나 더
    // 만든다 — 두 장소 화면 쪽에서 보면 출구가 2개(3~4갈래 갈림길의
    // 근원)가 되고, 어느 쪽으로 가도 결국 같은 목적지에서 다시 만난다.
    // 절반 정도는 강/해협을 낀 물길이라 배·비행 탑승물이 있어야 지나갈
    // 수 있다(이동수단이 실제로 접근 가능한 지역을 가르게 하기 위함).
    if(seedRand(edgeKey,'alt') < 0.4){
      const altLen = Math.max(1, chainLen-1);
      const wantsWater = seedRand(edgeKey,'wtr') < 0.5;
      buildChain(locA.id, locB.id, altLen, wantsWater ? 'water' : 'land', [locA.id, locB.id]);
    }
    // [비행 전용 지름길] 산길/물길을 통째로 건너뛰는 화면 1개 — 하늘을
    // 나는 탑승물만 지날 수 있다.
    if(seedRand(edgeKey,'air') < 0.22){
      buildChain(locA.id, locB.id, 1, 'air-only', [locA.id, locB.id]);
    }
  }

  // [2026-09-22, 24번 섹션 22-3 후속] 확장 이전 구 4개 대륙(north/south/
  // east/west)엔 type==='capital'인 장소가 없어서, 예전엔 이 폴백이
  // locsRaw[0](이름 해시 순서상 우연히 던전/황무지가 걸릴 수 있음)으로
  // 떨어졌다(예: south는 "고대 유적 던전"이 시작점). 수도가 없으면
  // 정착지 유형(SETTLEMENT_TYPES) 중 첫 번째를 우선 고르도록 해서,
  // 초반 진입점이 위험한 던전으로 떨어지는 걸 피한다 — 그래도 정착지가
  // 하나도 없으면(이론상 불가능하지만 안전하게) 기존처럼 첫 항목.
  const startLoc = locsRaw.find(l=>l.type==='capital')
    || locsRaw.find(l=>SETTLEMENT_TYPES.has(l.type))
    || locsRaw[0];
  const graph = { continentKey, nodes, locsById, startNodeId: startLoc.id };
  _graphCache.set(continentKey, { sig, graph });
  return graph;
}
window.buildKingdomGraph = buildKingdomGraph;

// ── 1-B. 화면(실제 타일 그리드) 지연 생성 ──
function stampBlobOnGrid(grid, idx, inB, cx, cy, type, radius){
  for(let dr=-radius; dr<=radius; dr++) for(let dc=-radius; dc<=radius; dc++){
    if(dc*dc+dr*dr > radius*radius) continue;
    const c=cx+dc, r=cy+dr;
    if(!inB(c,r)) continue;
    grid[idx(c,r)] = type;
  }
}
// [2026-09-18 습격 라운드] 정착지 화면 전용 — 화면 가장자리에서 margin칸
// 안쪽에 사각 성벽 링을 두르고, 그 위에서 이미 계산된 출구(exits)의
// 좌표와 같은 축(가로 출구면 열, 세로 출구면 행) 위에만 폭 gateWindow의
// 성문을 뚫는다. 장소마다 좌표를 손으로 찍지 않고, 그 화면이 실제로 갖는
// 출구 수만큼 자동으로 성문이 생기는 절차적 방식 — 11개 왕국 전부에서
// 동일하게 동작한다.
function stampSettlementWalls(grid, idx, inB, exits, COLS, ROWS){
  const margin = 3, gateWindow = 3;
  const isGate = (axis, edge) => exits.some(ex => ex.edge===edge && Math.abs(axis - (edge==='N'||edge==='S' ? ex.gc : ex.gr)) <= gateWindow);
  for(let c=margin;c<COLS-margin;c++){
    if(!isGate(c,'N') && inB(c,margin)) grid[idx(c,margin)] = FT.WALL;
    if(!isGate(c,'S') && inB(c,ROWS-1-margin)) grid[idx(c,ROWS-1-margin)] = FT.WALL;
  }
  for(let r=margin;r<ROWS-margin;r++){
    if(!isGate(r,'W') && inB(margin,r)) grid[idx(margin,r)] = FT.WALL;
    if(!isGate(r,'E') && inB(COLS-1-margin,r)) grid[idx(COLS-1-margin,r)] = FT.WALL;
  }
}
// [2026-09-18, 도로/이정표 라운드] 정착지-정착지 connector 화면 전용 — 진입
// 출구(x0,y0)에서 진출 출구(x1,y1)까지 완전한 직선이 아니라 자연스럽게
// 좌우로 휘어지는(사인 파형 오프셋, 양 끝에서는 0으로 수렴해 출구 좌표에
// 정확히 맞물림) 포장 도로를 깐다 — "따로 안내 없이 그냥 따라가면 다음
// 정착지에 자연스럽게 도착"하는 게 목표라 출구 좌표와 반드시 정확히 이어져야
// 한다. 폭 3칸(중심 ±1) 붓으로 칠해서 걷기 편한 굵기로 만든다. 노드 id를
// 시드로 써서 새로고침해도 항상 같은 모양(기존 지형 생성기 관례와 동일).
function stampRoadPath(grid, idx, inB, x0, y0, x1, y1, seedKey){
  const dx = x1-x0, dy = y1-y0;
  const len = Math.hypot(dx,dy) || 1;
  const px = -dy/len, py = dx/len; // 진행 방향에 수직인 단위벡터(좌우 휘어짐용)
  const amp = 2 + seedRand(seedKey,'roadAmp')*3;      // 좌우로 최대 얼마나 휠지(타일)
  const freq = 1.2 + seedRand(seedKey,'roadFreq')*1.3; // 휘어짐 주기
  const phase = seedRand(seedKey,'roadPhase') * Math.PI * 2;
  const steps = Math.max(24, Math.round(len*2.2));
  for(let i=0;i<=steps;i++){
    const t = i/steps;
    const bx = x0+dx*t, by = y0+dy*t;
    // sin(t*PI)로 양 끝(t=0/1)에서 오프셋이 0으로 수렴 — 출구 좌표와 정확히 이어짐
    const wobble = Math.sin(t*Math.PI*freq + phase) * amp * Math.sin(t*Math.PI);
    const cx = Math.round(bx + px*wobble), cy = Math.round(by + py*wobble);
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      const c=cx+dc, r=cy+dr;
      if(inB(c,r)) grid[idx(c,r)] = FT.ROAD_PAVED;
    }
  }
}
// 물 화면(isWaterScreen)에서 몬스터 팩 홈 좌표가 화면 중앙(대개 물 한복판)에
// 잡혀 늑대 무리가 강 위에 떠 있는 것처럼 보이던 기존 버그 수정 — 물이 절대
// 없는 가장자리 둔치 띠(좌/우 중 한쪽, c<4 또는 c>=COLS-4)로 홈을 비켜 잡는다.
function pickPackHome(isWaterScreen, node){
  if(!isWaterScreen) return { hc: SCREEN_COLS/2, hr: SCREEN_ROWS/2 };
  const left = seedRand(node.id,'shoreSide') < 0.5;
  const hc = left ? 3 : SCREEN_COLS-4;
  const hr = 3 + Math.floor(seedRand(node.id,'shoreR')*(SCREEN_ROWS-6));
  return { hc, hr };
}
// [2026-09-18 습격 라운드] 정착지 성문마다 경비병 무리를 하나씩 배치.
// 몬스터 AI 이동/추격 엔진(updateMonsters)을 그대로 재사용하되 isGuard
// 플래그로 구분해서 — 평소엔 성문 앞을 서성이다가(idle 배회, 아래
// updateMonsters의 guard 분기 참고) 습격대(isRaider)가 감지 범위 안에
// 들어오면 그쪽으로 달려가 요격한다. 플레이어에게는 적대적이지 않도록
// checkPackEncounter에서 별도로 제외한다.
function buildGuardsForSettlement(loc, exits, markerPos){
  if(!exits || !exits.length) return [];
  const isCapital = loc.type==='capital';
  // [21번 라운드, 시스템 업그레이드 ⑤ — 사용자 승인: "전체 재설계,
  // 필드 그래프에 진짜 새 노드로"] 조사해보니 영지는 이미
  // world/052의 getAllLocations()를 통해 실제 필드 그래프 노드로
  // 존재하고 있었다(isDemesne 플래그, 성문·경비병도 이미 일반
  // 정착지 로직을 그대로 탄다) — 다만 그 경비병 강도가 영지 방어
  // 스탯(d.defense, 플레이어가 골드를 들여 건물/정책으로 실제 투자하는
  // 값)과 전혀 무관했다. 이게 11번 섹션에서 조정자가 원래 요청했던
  // "영지 defense 투자가 습격 방어에 실제로 영향을 주게"의 진짜 남은
  // 공백이었다 — 이번에 이 부분만 정확히 채운다.
  const demesneMul = loc.isDemesne
    ? (()=>{ try{
        const d = (typeof window.loadDemesne==='function') ? window.loadDemesne() : null;
        const def = d && typeof window.calcDemesneResources==='function' ? window.calcDemesneResources(d).defense : 50;
        return 0.6 + (def/100)*1.2; // defense 0→0.6배(허술) ~ 100→1.8배(요새화)
      }catch(e){ return 1; } })()
    : 1;
  const guardMul = (isCapital ? 1.6 : 1) * demesneMul;
  // [22-2] 경비병도 "장소 레벨대"가 아니라 플레이어 전투력 기준 파생
  // 공식으로 통일 — 상시 배치되는 유닛이라 예전 lvMid 선형 공식대로면
  // 고레벨 플레이어에게는 그냥 허수아비였다. 3.0타격에 쓰러지고, 맞으면
  // 최대체력의 8%를 깎는 기준치에 guardMul(수도/영지 방어 보너스)을 얹는다.
  const stats = deriveMonsterStats(loc, 3.0, 0.08, guardMul);
  return exits.map((ex,i)=>{
    // 성문 바로 바깥이 아니라 안쪽으로 몇 칸 들어와 성문을 등지고 서 있는 위치
    let hc=ex.gc, hr=ex.gr;
    if(ex.edge==='N') hr+=3; else if(ex.edge==='S') hr-=3; else if(ex.edge==='W') hc+=3; else hc-=3;
    return {
      id:'guard'+i+'_'+loc.id, packId:loc.id+'_guards', isGuard:true,
      name: isCapital?'왕실 근위병':'성문 경비병', icon: isCapital?'🛡️':'💂',
      temperament:'aggressive', weapon:'spear', intellect:'sapient',
      detectR: 8, power: stats.power, hp: stats.hp, atk: stats.atk,
      homeC:hc, homeR:hr, x:hc*TILE+TILE/2, y:hr*TILE+TILE/2, targetX:hc*TILE+TILE/2, targetY:hr*TILE+TILE/2,
      retargetIn: 2500+Math.random()*2000, cooldown:0, state:'idle', wounded:false, fighting:null, fightTimer:0,
    };
  });
}
// 중간 화면 하나의 대략적인 "분위기"(평지/숲/산) — 두 실제 장소 사이의
// 보간 좌표에서 가장 가까운 CONTINENT_TERRAIN 스캐터 포인트를 찾아
// 정한다. 100% 지형까지 재현하진 않지만, 실제 데이터에 근거해 숲길
// 옆엔 숲이, 산 옆엔 산길이 나오게 한다.
function biomeNear(continentKey, midWorld){
  const terrain = CONTINENT_TERRAIN[continentKey];
  if(!terrain || !midWorld) return 'plain';
  let best=null, bestD=Infinity;
  for(const p of (terrain.mountains||[])){ const d=Math.hypot(p.x-midWorld.x,p.y-midWorld.y); if(d<bestD){bestD=d;best='mountain';} }
  for(const p of (terrain.forests||[])){ const d=Math.hypot(p.x-midWorld.x,p.y-midWorld.y); if(d<bestD){bestD=d;best='forest';} }
  return bestD<900 ? best : 'plain';
}
// [22-2, 필드 전투 데미지 밸런스 재설계] 예전엔 몬스터/경비병/습격대
// HP·ATK가 전부 "장소 레벨대 중앙값(lvMid)"에만 선형 비례하는 독자
// 공식이었다 — 플레이어의 실제 전투력(스탯을 어디에 투자했는지)과는
// 완전히 무관한 절대 수치. 그런데 스탯 포인트는 레벨당 5포인트(스탯당
// +3, 즉 한 스탯에 몰아주면 +15/레벨) 선형 증가인 반면 플레이어
// 최대체력(getPlayerMaxHp)은 sqrt(레벨) 곡선이라 훨씬 완만하다 — 그
// 결과 공격형 스탯 위주로 투자하면 레벨이 오를수록 몬스터가 상대적으로
// 점점 더 쉬워지는(원래 반대여야 할) 구조였다. Playwright로 실측(레벨별
// "플레이어 평균 데미지 ÷ 같은 레벨대 몬스터 HP" 비율)해 레벨 1엔 거의
// 동타였다가 레벨 60엔 비율이 2.5배 넘게 벌어지는 것까지 확인됨(자세한
// 수치는 작업메모장 22-2 참고).
//
// 고쳐서: 몬스터 HP/ATK를 "장소 레벨대"라는 독립된 절대수치가 아니라
// "지금 이 플레이어가 실제로 낼 수 있는 데미지/버틸 수 있는 체력"에서
// 유도한다 — 스탯을 어떻게 배분했든 항상 비슷한 체감 난이도(약속한
// 타격 횟수만큼 때리면 죽고, 맞으면 최대체력의 약속한 비율만큼 잃는)를
// 유지한다. "장소가 플레이어 레벨보다 얼마나 위험한 곳인지"는 여전히
// relativeLocationDanger(장소 레벨대 ÷ 플레이어 레벨)로 반영 — 저레벨이
// 고레벨 던전에 잘못 들어가면 여전히 위험하고, 고레벨이 저레벨 마을을
// 지나가면 여전히 쉽다.
function expectedPlayerFieldPower(){
  const st = S.stats || {};
  const atkStat = Math.max(st.str||50, st.mgc||50);
  const critChance = 0.15 + Math.min(0.35, ((st.crit||50)-50)/200);
  const avgDmg = Math.max(3, atkStat*0.28*(1+critChance*0.6));
  const maxHp = (typeof getPlayerMaxHp==='function') ? getPlayerMaxHp() : 100;
  return { avgDmg, maxHp };
}
function relativeLocationDanger(loc){
  const [lvLo, lvHi] = getLocationLevelBand(loc);
  const lvMid = (lvLo+lvHi)/2;
  const playerLv = (typeof loadPlayerLevel==='function') ? (loadPlayerLevel()||1) : 1;
  return Math.min(2.5, Math.max(0.4, lvMid / Math.max(1, playerLv)));
}
// hitsToKill: 이 몬스터가 몇 대 맞으면 죽는지(잡몹은 낮게, 경비/습격대는
// 조금 더 단단하게). dmgPctPerHit: 이 몬스터의 공격 1회가 플레이어
// 최대체력의 몇 %를 깎는지. tierMul: 그 자리 전용 추가 배율(장소
// dangerLevel, 수도/영지 방어 보너스 등 — 기존 dangerMul/guardMul을
// 그대로 여기 얹는다).
function deriveMonsterStats(loc, hitsToKill, dmgPctPerHit, tierMul){
  const { avgDmg, maxHp } = expectedPlayerFieldPower();
  const rel = relativeLocationDanger(loc);
  const hp  = Math.max(6, Math.round(avgDmg * hitsToKill * rel * (tierMul||1)));
  const atk = Math.max(2, Math.round(maxHp * dmgPctPerHit * rel * (tierMul||1)));
  const power = Math.max(1, Math.round((hp*atk)/60));
  return { hp, atk, power };
}
function buildPacksForNode(graph, node, isWaterScreen, exits, markerPos){
  const packs = [];
  let seq = 0;
  const cCenter = SCREEN_COLS/2, rCenter = SCREEN_ROWS/2;
  function makePack(roster, count, stats, homeC, homeR, tag){
    for(let i=0;i<count;i++){
      const def = roster[i % roster.length];
      const packId = node.id+'_pack_'+tag;
      const tRoll = seedRand(node.id+def.name, 'temper'+i);
      const temperament = tRoll<0.4 ? 'aggressive' : (tRoll<0.7 ? 'skittish' : 'passive');
      const weapon = ['fang','blade','spear','blunt','bow','magic','unarmed'][Math.floor(seedRand(node.id+def.name,'wpn'+i)*7)];
      const iRoll = seedRand(node.id+def.name, 'intel'+i);
      const intellect = iRoll<0.34 ? 'mute' : (iRoll<0.67 ? 'feral' : 'sapient');
      const offC = (seedRand(node.id+i,'ox')-0.5) * 8, offR = (seedRand(node.id+i,'oy')-0.5) * 8;
      const hc = homeC+offC, hr = homeR+offR;
      packs.push({
        id:'inst'+(seq++), packId, name:def.name, icon:def.icon||'👹', temperament, weapon, intellect,
        detectR: temperament==='passive' ? 0 : (4+Math.floor(seedRand(node.id+i,'det')*3)),
        power: stats.power, hp: stats.hp, atk: stats.atk,
        homeC:hc, homeR:hr, x:hc*TILE+TILE/2, y:hr*TILE+TILE/2, targetX:hc*TILE+TILE/2, targetY:hr*TILE+TILE/2,
        retargetIn:0, cooldown:0, state:'idle', wounded:false, fighting:null, fightTimer:0,
      });
    }
  }
  if(node.kind==='location'){
    const loc = node.loc;
    const isWild = WILD_TYPES.has(loc.type);
    const hasMonsters = Array.isArray(loc.monsters) && loc.monsters.length;
    if(isWild || hasMonsters){
      const dangerMul = 1 + (loc.dangerLevel||0)*0.15;
      const roster = hasMonsters ? loc.monsters : [{ name: loc.name+' 부근의 위협', icon: loc.icon||'👹' }];
      const count = Math.min(4, 1+Math.floor(seedRand(loc.id,'cnt')*3));
      makePack(roster, count, deriveMonsterStats(loc, 2.5, 0.07, dangerMul), cCenter+10, rCenter+6, 'loc');
    }
    // [2026-09-18 습격 라운드] 정착지 화면엔 성문마다 경비병을 상시 배치
    // (습격 여부와 무관 — 평소엔 그냥 성문을 지키고 서 있다).
    if(SETTLEMENT_TYPES.has(loc.type)){
      packs.push(...buildGuardsForSettlement(loc, exits, markerPos));
    }
  } else {
    // 중간(connector) 화면 — 요구사항: "지어낸 이름이 아니라 실제 장소가
    // 들고 있는 몬스터/테마 데이터를 재사용" → 이 길이 연결하는 두 실제
    // 장소 중 몬스터/야생 데이터를 가진 쪽에서 "낙오 무리"를 빌려온다.
    // 둘 다 없으면 최후 수단으로만 일반 명칭을 쓴다.
    const a = graph.locsById.get(node.srcLocs?.[0]), b = graph.locsById.get(node.srcLocs?.[1]);
    const candidate = [a,b].find(l => l && (WILD_TYPES.has(l.type) || (Array.isArray(l.monsters)&&l.monsters.length)));
    // [버그 수정] 물 화면(isWaterScreen)에서는 화면 중앙이 곧 강 한복판이라
    // 팩 홈을 거기 잡으면 늑대 무리가 물 위에 떠 있는 것처럼 보였다 —
    // pickPackHome으로 항상 물이 없는 둔치 쪽에 홈을 잡는다.
    const home = pickPackHome(isWaterScreen, node);
    if(candidate && seedRand(node.id,'spawn') < 0.55){
      const roster = (Array.isArray(candidate.monsters)&&candidate.monsters.length) ? candidate.monsters : [{ name:candidate.name+' 근방의 낙오 무리', icon:candidate.icon||'👹' }];
      makePack(roster, 1+Math.floor(seedRand(node.id,'cnt2')*2), deriveMonsterStats(candidate, 1.8, 0.05, 1), home.hc, home.hr, 'road');
    } else if(seedRand(node.id,'genspawn') < 0.2){
      // 실제 장소 데이터가 없는 최후 수단 — 기준 장소가 없으니 danger=1(중립)로 취급.
      makePack([{ name:'떠돌이 들짐승', icon:'🐺' }], 1, deriveMonsterStats({}, 1.5, 0.04, 1), home.hc, home.hr, 'gen');
    }
    // [버그 수정, 2차] pickPackHome이 둔치 쪽으로 홈을 잡아도, makePack 안의
    // 무리 내 개체별 흩뿌림(offC/offR, ±4칸)이 다시 물 구간(4≤c<COLS-4)
    // 안으로 되돌려놓을 수 있다(실측: 둔치 폭 자체가 4칸이라 흩뿌림 폭과
    // 겹침). 물 화면이면 이 화면에서 새로 생긴 모든 팩의 homeC를 물이 아닌
    // 쪽(c<4 또는 c≥COLS-4)으로 한 번 더 강제 클램프해서 확실히 막는다.
    if(isWaterScreen){
      const waterLo = 4, waterHi = SCREEN_COLS-4;
      for(const p of packs){
        if(p.homeC >= waterLo && p.homeC < waterHi){
          p.homeC = p.homeC < SCREEN_COLS/2 ? waterLo-1 : waterHi;
          p.x = p.homeC*TILE+TILE/2; p.targetX = p.x;
        }
      }
    }
  }
  return packs;
}

const _screenCache = new Map(); // continentKey::nodeId -> screen

export function buildScreen(graph, nodeId){
  const cacheKey = graph.continentKey+'::'+nodeId;
  if(_screenCache.has(cacheKey)){
    // [2026-09-18 습격 라운드] 캐시된 화면이라도 매번 꺼낼 때 습격 상태를
    // 다시 동기화한다 — 백그라운드 타이머가 화면 밖에서 습격을 시작/종료
    // 시켰을 수 있어서, 캐시라고 습격대가 그대로 방치/잔류하면 안 된다.
    const cached = _screenCache.get(cacheKey);
    if(cached.node.kind==='location') syncRaidPacksForScreen(cached, cached.node.loc);
    // [16번 라운드, [대기] #12] 이 화면을 쫓기며 떠났던 기록이 있으면,
    // 실제 경과 시간을 확인해 포기 여부를 가른다. 이 화면이 그 사이
    // 한 번도 안 열렸으면(캐시만 존재) 몬스터 AI 루프 자체가 안 돌아서
    // state가 그때 그대로 얼어있다 — 그래서 여기서 딱 한 번, 재입장
    // 시점에만 판정한다.
    if(cached._pursuerLeftAt){
      const elapsed = Date.now() - cached._pursuerLeftAt;
      if(elapsed >= PURSUER_GIVE_UP_MS){
        const stillChasing = cached.packs.filter(p=>p.state==='chasing' && !p.isGuard);
        if(stillChasing.length){
          stillChasing.forEach(p=>{ p.state='idle'; p.retargetIn=0; });
          // [버그 수정, 검증 중 발견] enterScreen()이 바로 이어서 "📍 장소명"
          // 도착 토스트를 showFieldToast로 띄우는데, showFieldToast는 큐 없이
          // 그냥 덮어쓰는 구조라 여기서 먼저 띄운 안내가 화면에 뜨기도 전에
          // 지워졌다. 도착 토스트가 먼저 3초짜리 자기 타이머를 다 쓰고
          // 사라지길 기다렸다가 이어서 띄운다.
          setTimeout(()=>showFieldToast(`💨 ${stillChasing.map(p=>p.name).join(', ')}이(가) 추격을 포기한 듯 자취를 감췄다`), 3200);
        }
        cached._pursuerLeftAt = null; cached._pursuerNames = null;
      } else if(cached._pursuerNames?.length){
        const names = cached._pursuerNames;
        setTimeout(()=>showFieldToast(`⚠️ ${names.join(', ')}이(가) 아직 이 근처를 맴돌고 있을지 모른다`), 3200);
      }
    }
    return cached;
  }
  const node = graph.nodes.get(nodeId);
  if(!node) return null;
  const COLS=SCREEN_COLS, ROWS=SCREEN_ROWS;
  const grid = new Uint8Array(COLS*ROWS).fill(FT.GRASS);
  const idx = (c,r) => r*COLS+c;
  const inB = (c,r) => c>=0 && c<COLS && r>=0 && r<ROWS;

  let biome = 'plain';
  if(node.kind==='connector'){
    const a = graph.locsById.get(node.srcLocs?.[0]), b = graph.locsById.get(node.srcLocs?.[1]);
    const wa = a && getLocationCoord(a), wb = b && getLocationCoord(b);
    if(wa && wb) biome = biomeNear(graph.continentKey, { x: wa.x+(wb.x-wa.x)*node.midT, y: wa.y+(wb.y-wa.y)*node.midT });
  }
  const scatterCount = biome==='mountain' ? 11 : biome==='forest' ? 15 : 6;
  for(let i=0;i<scatterCount;i++){
    const cx = Math.floor(seedRand(nodeId,'sx'+i)*COLS), cy = Math.floor(seedRand(nodeId,'sy'+i)*ROWS);
    const tRoll = seedRand(nodeId,'st'+i);
    const type = biome==='mountain' ? (tRoll<0.65?FT.MOUNTAIN:FT.FOREST)
      : biome==='forest' ? (tRoll<0.75?FT.FOREST:FT.HILLS)
      : (tRoll<0.5?FT.FOREST:FT.HILLS);
    stampBlobOnGrid(grid, idx, inB, cx, cy, type, 2+Math.floor(seedRand(nodeId,'sr'+i)*2));
  }
  // 화면 전체를 물 화면으로 — 강/해협 건너기(crossing:'water')용. 가장자리는
  // 걸을 수 있는 둔치를 조금 남겨서 육지 출구와 자연스럽게 이어지게 한다.
  const isWaterScreen = node.kind==='connector' && node.neighbors.some(n=>n.crossing==='water');
  if(isWaterScreen){
    for(let r=4;r<ROWS-4;r++) for(let c=4;c<COLS-4;c++) grid[idx(c,r)] = FT.WATER;
  }

  // 출구 배치 — 이웃 수만큼 N/E/S/W 순환 배정, 같은 변에 여럿이면 그
  // 변 위에서 고르게 나눠 배치한다.
  const rawExits = node.neighbors.map((nb,i)=>({ ...nb, edge: EDGE_ORDER[i%4] }));
  const edgeTotals = {N:0,E:0,S:0,W:0};
  rawExits.forEach(e=>edgeTotals[e.edge]++);
  const edgeSeen = {N:0,E:0,S:0,W:0};
  const exits = rawExits.map(ex=>{
    edgeSeen[ex.edge]++;
    const frac = edgeSeen[ex.edge]/(edgeTotals[ex.edge]+1);
    let gc, gr;
    if(ex.edge==='N'){ gc=Math.round(frac*(COLS-4))+2; gr=1; }
    else if(ex.edge==='S'){ gc=Math.round(frac*(COLS-4))+2; gr=ROWS-2; }
    else if(ex.edge==='W'){ gc=1; gr=Math.round(frac*(ROWS-4))+2; }
    else { gc=COLS-2; gr=Math.round(frac*(ROWS-4))+2; }
    // 출구 주변은 항상 지날 수 있게 정리(물 화면이면 도랑처럼 육지 둔치로)
    const clearType = isWaterScreen ? FT.GRASS : FT.ROAD;
    for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++){
      const cc=gc+dc, rr=gr+dr; if(inB(cc,rr)) grid[idx(cc,rr)] = clearType;
    }
    return { ...ex, gc, gr };
  });

  // [2026-09-18, 도로/이정표 라운드] 정착지-정착지 구간(isSettlementRouteNode)
  // 이면서 물길/비행전용 지름길이 아닌(발로 실제로 걸어서 지날 수 있는) connector
  // 화면에만 포장 도로+이정표를 놓는다. 던전/황야/사건 목적지로 가는 길이나
  // 물길·하늘길 대체 경로는 "발견의 재미"를 위해 일부러 대상에서 뺀다(과제
  // 요구사항 그대로). 위 isWaterScreen 판정과 동일한 방식으로
  // isAirOnlyScreen도 neighbors의 crossing 태그에서 직접 판정한다.
  const isAirOnlyScreen = node.kind==='connector' && node.neighbors.some(n=>n.crossing==='air-only');
  const isSettlementRoute = isSettlementRouteNode(graph, node) && !isWaterScreen && !isAirOnlyScreen;
  const signposts = [];
  if(isSettlementRoute && exits.length===2){
    // buildChain의 link() 호출 순서상 connector 노드의 neighbors[0]은 항상
    // "뒤쪽"(locA 방향), neighbors[1]은 항상 "앞쪽"(locB 방향)으로 고정된다
    // (각 connector는 buildChain 안에서 딱 2번만 link()에 등장 — 처음엔 cid로
    // 등장해 neighbors[0]에 쌓이고, 다음 반복에서 prev로 등장해 neighbors[1]에
    // 쌓인다). 그래서 exits[0]/exits[1]과 srcLocs[0]/srcLocs[1]이 그대로
    // 대응돼, 화면을 새로 안 지어도 "이 출구로 나가면 어느 정착지인가"를
    // 정확히 알 수 있다.
    stampRoadPath(grid, idx, inB, exits[0].gc, exits[0].gr, exits[1].gc, exits[1].gr, nodeId);
    const locA = graph.locsById.get(node.srcLocs[0]), locB = graph.locsById.get(node.srcLocs[1]);
    const mkSign = (ex, destLoc) => {
      let sc=ex.gc, sr=ex.gr;
      if(ex.edge==='N') sr+=4; else if(ex.edge==='S') sr-=4; else if(ex.edge==='W') sc+=4; else sc-=4;
      return { c:sc, r:sr, icon:'🪧', label: destLoc.name+' 방면' };
    };
    if(locA) signposts.push(mkSign(exits[0], locA));
    if(locB) signposts.push(mkSign(exits[1], locB));
  }

  let markerPos = null;
  if(node.kind==='location'){
    markerPos = { c: Math.floor(COLS/2), r: Math.floor(ROWS/2) };
    for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++){
      const cc=markerPos.c+dc, rr=markerPos.r+dr; if(inB(cc,rr)) grid[idx(cc,rr)] = FT.ROAD;
    }
  }

  // [2026-09-18 습격 라운드] 정착지(수도 포함) 화면에만 성벽+성문 — 손으로
  // 좌표를 찍지 않고, 위에서 이미 계산된 exits(그 화면이 실제로 갖는 출구)
  // 위치에 자동으로 성문을 뚫는다. 야생/던전/중간 화면은 대상이 아니다.
  if(node.kind==='location' && SETTLEMENT_TYPES.has(node.loc.type)){
    stampSettlementWalls(grid, idx, inB, exits, COLS, ROWS);
  }

  const packs = buildPacksForNode(graph, node, isWaterScreen, exits, markerPos);
  const screen = { nodeId, node, COLS, ROWS, grid, idx, inB, exits, markerPos, packs, biome, isWaterScreen, signposts };
  if(node.kind==='location') syncRaidPacksForScreen(screen, node.loc);
  _screenCache.set(cacheKey, screen);
  return screen;
}
window.buildScreen = buildScreen;

// 하위호환/디버그용 — 왕국의 그래프 요약(장소 수·화면 노드 수)을 한
// 번에 보고 싶을 때 쓴다. 실제 런타임은 buildKingdomGraph+buildScreen을
// 지연 호출한다.
export function buildField(continentKey){
  const graph = buildKingdomGraph(continentKey);
  if(!graph) return null;
  let locCount=0, connCount=0;
  for(const n of graph.nodes.values()){ if(n.kind==='location') locCount++; else connCount++; }
  return { continentKey, graph, locationNodeCount: locCount, connectorNodeCount: connCount, totalNodes: graph.nodes.size };
}
window.buildField = buildField;

// ══════════════════════════════════════════════════════════════════
// 1.5) 정착지 습격(raid) 시스템 — [2026-09-18 신규]
//    예전 독립 프로토타입(왕도 하나, 손으로 그린 성벽+4개 성문 좌표,
//    "화면이 항상 살아있는" 단일 캔버스)에 있던 마을 습격 이벤트를 이번
//    화면 그래프 구조에 맞게 전면 재설계했다. 핵심 차이: 그 화면(노드)을
//    지금 밟고 있지 않으면 타일도 몬스터 팩도 아예 메모리에 없다
//    (buildScreen이 지연 생성) — 그래서 "습격이 진행 중이다"라는 사실
//    자체는 화면과 독립적으로, 정착지 하나당 하나씩 실제 시각(Date.now())
//    타임스탬프로만 lsGet/lsSet에 영구 저장하고, 그 화면이 실제로 살아있을
//    때(플레이어가 그 위에 서 있을 때)만 위 2)/3)번 섹션의 기존 팩 대 팩
//    조우전·몬스터 추격 엔진을 그대로 재사용해 시각적으로 재현한다.
//    사용자가 명시적으로 확정한 설계: 턴 카운터(S.msgCount)가 아니라 실제
//    경과 시간(ms) 기준 — 이 게임의 "턴"은 AI 메시지 왕복에 묶여 있고
//    필드 모드에 있는 동안은 진행되지 않으므로, 필드에서 실시간으로 벌어지는
//    습격과 어울리지 않는다는 판단. 복구 시간 값(90초/5분)은 예전
//    프로토타입의 RAID_RECOVER_MS 규모를 그대로 따랐다.
// ══════════════════════════════════════════════════════════════════
export const SETTLEMENT_RAID_KEY = 'tf-settlement-raids';
export function loadRaidState(){ try{ return JSON.parse(lsGet(SETTLEMENT_RAID_KEY)||'{}')||{}; }catch(e){ return {}; } }
window.loadRaidState = loadRaidState;
export function saveRaidState(d){ try{ lsSet(SETTLEMENT_RAID_KEY, JSON.stringify(d)); }catch(e){} }
window.saveRaidState = saveRaidState;

const RAID_POLL_MS = 15000;                 // 화면 밖에서도 습격 상태를 점검하는 주기(백그라운드 폴러)
const RAID_MIN_GAP_MS = 40000;              // 평온(none) 상태에서 다음 위협 판정 시도까지 최소 간격
const RAID_ROLL_CHANCE = 0.05;              // 판정 시도 1회당 실제로 위협이 시작될 기본 확률(위험도로 보정)
const RAID_THREAT_MS = 60000;               // 위협(threatened) 유지 시간 — 이 안에 못 끝내면 강제 판정
const RAID_RECOVER_MS = { defended:45000, damaged:90000, destroyed:300000 }; // 결과별 복구까지 걸리는 실제 시간(ms)

// 정착지 화면의 실제 출구(성문) 수를 방어력 근사치로 쓴다 — 화면 전체를
// 새로 짓지 않고 이미 캐시돼 있는 왕국 그래프(가볍다)만 조회한다.
function countGatesForLocation(loc){
  try{
    const graph = buildKingdomGraph(loc.continent);
    const gnode = graph && graph.nodes.get(loc.id);
    return gnode ? Math.max(1, gnode.neighbors.length) : 2;
  }catch(e){ return 2; }
}
// 플레이어가 그 화면에 없을 때(=화면 밖) 습격 결과를 확률로 판정한다.
// 옛 프로토타입의 3가지 결과(자력방어/피해/파괴)를 그대로 유지.
function resolveRaidOffscreen(loc, rec){
  const gates = countGatesForLocation(loc);
  const dangerMul = 1 + (loc.dangerLevel||0)*0.15;
  // [21번 라운드, 시스템 업그레이드 ⑤] 화면 밖(플레이어가 없을 때)
  // 확률 판정에도 같은 영지 방어 스탯을 반영 — buildGuardsForSettlement
  // 쪽(라이브 판정)과 같은 원칙, 다른 수식(여긴 가산점이라 곱셈 대신
  // 덧셈으로 스케일을 맞춤).
  let demesneBonus = 0;
  if(loc.isDemesne){
    try{
      const d = (typeof window.loadDemesne==='function') ? window.loadDemesne() : null;
      const def = d && typeof window.calcDemesneResources==='function' ? window.calcDemesneResources(d).defense : 50;
      demesneBonus = (def-50)*0.4; // defense 50(평균) 기준 ±20점까지
    }catch(e){}
  }
  const defenseScore = 35 + gates*16 + demesneBonus + Math.random()*20;
  const raidScore = 25*dangerMul + (rec.raiderCount||2)*9 + Math.random()*25;
  const margin = defenseScore - raidScore;
  if(margin > 12) return 'defended';
  if(margin > -18) return 'damaged';
  return 'destroyed';
}
function raidOutcomeMsg(loc, outcome){
  return outcome==='defended' ? `🛡️ ${loc.name} 경비대가 습격을 격퇴했다는 소식이 들려온다`
    : outcome==='damaged' ? `🔥 ${loc.name}이(가) 습격으로 피해를 입었다는 소식이 들려온다 — 복구 중`
    : `💀 ${loc.name}이(가) 습격으로 크게 파괴되었다는 소식이 들려온다`;
}
// [10번 후속 라운드] 습격 결과를 실제 정착지 경제(economy/332)에 반영한다.
// ⚠️ 평판(reputation)은 여기서 절대 건드리지 않는다 — 조정자의 정정
// 지시대로, "플레이어가 그 자리에 없어 확률/타이머로 방치 판정된" 결과는
// 평판을 깎지도 올리지도 않는다(defended라도 여기선 번영도만 소폭
// 오른다 — 정착지 스스로 막아낸 것이지 플레이어의 행동이 아니라서).
// 평판은 오직 finalizeLiveRaidDefense(플레이어가 그 화면에 실제로 있을
// 때만 호출됨)에서만 오른다.
function applyRaidOutcomeToEconomy(loc, outcome){
  if(outcome==='damaged'){
    changeProsperity(loc.id, -12, '습격 피해');
    setTradeRouteStatus(loc.id, 'disrupted');
  } else if(outcome==='destroyed'){
    changeProsperity(loc.id, -30, '습격으로 파괴');
    setTradeRouteStatus(loc.id, 'disrupted');
  } else if(outcome==='defended'){
    changeProsperity(loc.id, 3, '자력 방어 성공');
  }
  // [21번 라운드, 시스템 업그레이드 ⑤] 습격 결과를 영지 자체 스탯
  // (loyalty/prosperity)에도 되돌려 반영 — economy/332가 이미 다른
  // 모든 정착지에 해주는 것과 같은 대칭을 영지에도 맞춘다. defense는
  // 여기서 안 건드린다 — defense는 플레이어가 골드로 투자하는 값이지
  // 습격 결과로 자동으로 변하면 "투자한 의미"가 흐려진다고 판단.
  if(loc.isDemesne){
    try{
      const d = (typeof window.loadDemesne==='function') ? window.loadDemesne() : null;
      if(d && d.established){
        if(outcome==='damaged'){ d.loyalty=Math.max(0,(d.loyalty||50)-6); d.prosperity=Math.max(0,(d.prosperity||50)-8); }
        else if(outcome==='destroyed'){ d.loyalty=Math.max(0,(d.loyalty||50)-15); d.prosperity=Math.max(0,(d.prosperity||50)-20); }
        else if(outcome==='defended'){ d.loyalty=Math.min(100,(d.loyalty||50)+2); }
        if(typeof window.saveDemesne==='function') window.saveDemesne(d);
      }
    }catch(e){}
  }
}
// 정착지 하나의 습격 상태를 지금 시각 기준으로 한 단계 진행시킨다(있으면).
// none→threatened(위협 시작)→resolved(자력방어/피해/파괴 판정)→(복구 후)none.
// 플레이어가 지금 그 화면에 실제로 서 있으면(RT.screen이 이 장소) 판정 시점에
// 화면 상의 실제 생존 습격대 수를 우선 근거로 쓴다("있으면 실측, 없으면 확률").
function advanceRaidIfDue(loc, st, now){
  let rec = st[loc.id];
  if(!rec){ rec = st[loc.id] = { state:'none', nextEligibleAt: now + 20000 + Math.random()*40000 }; return null; }
  const isLiveHere = !!(RT && RT.screen && RT.screen.node.kind==='location' && RT.screen.node.loc && RT.screen.node.loc.id===loc.id);
  if(rec.state==='none'){
    if(now < (rec.nextEligibleAt||0)) return null;
    const dangerMul = 1 + (loc.dangerLevel||0)*0.2;
    if(Math.random() < Math.min(0.4, RAID_ROLL_CHANCE*dangerMul)){
      rec.state='threatened'; rec.threatenedAt=now; rec.resolveAt=now+RAID_THREAT_MS;
      rec.raiderCount = 2+Math.floor(Math.random()*3);
      if(isLiveHere) syncRaidPacksForScreen(RT.screen, loc); // 지금 그 화면에 있으면 즉시 시각적으로 반영
      return { locId:loc.id, type:'start', msg:`🔥 ${loc.name} 인근에서 습격 조짐이 보인다는 소식이 들려온다` };
    }
    rec.nextEligibleAt = now + RAID_MIN_GAP_MS;
    return null;
  }
  if(rec.state==='threatened'){
    if(now < rec.resolveAt) return null; // 라이브 워처(finalizeLiveRaidDefense)가 먼저 끝낼 수도 있음
    const outcome = isLiveHere
      ? (RT.screen.packs.some(p=>p.isRaider) ? (RT.screen.packs.filter(p=>p.isRaider).length >= (rec.raiderCount||2) ? 'destroyed' : 'damaged') : 'defended')
      : resolveRaidOffscreen(loc, rec);
    rec.state='resolved'; rec.outcome=outcome; rec.resolvedAt=now;
    rec.recoverAt = now + (RAID_RECOVER_MS[outcome]||90000);
    if(isLiveHere) syncRaidPacksForScreen(RT.screen, loc); // 남은 습격대 잔당을 화면에서 정리
    applyRaidOutcomeToEconomy(loc, outcome);
    return { locId:loc.id, type:'end', outcome, msg: raidOutcomeMsg(loc, outcome) };
  }
  if(rec.state==='resolved'){
    if(now < (rec.recoverAt||0)) return null;
    rec.state='none'; rec.nextEligibleAt = now + 20000 + Math.random()*40000;
    // 교역로는 복구 시점에 즉시 정상화(번영도 수치 자체는 economy/332의
    // 느린 자연 드리프트로 별도 회복 — "타이머 만료 = 즉시 완전 회복"이
    // 아니라 시각적 상태만 우선 풀리고 숫자는 서서히 따라오게 함).
    if(rec.outcome==='damaged' || rec.outcome==='destroyed') setTradeRouteStatus(loc.id, 'normal');
    delete rec.outcome;
    return { locId:loc.id, type:'recovered', msg:`🏘️ ${loc.name}이(가) 습격의 피해에서 회복되었다` };
  }
  return null;
}
// 화면(screen.packs)이 지금 저장된 습격 상태와 어긋나 있으면 맞춘다 —
// threatened인데 습격대가 없으면 새로 심고, threatened가 아닌데 습격대
// 잔당이 남아있으면(예: 화면 밖에서 이미 판정 끝난 뒤 재입장) 치운다.
function syncRaidPacksForScreen(screen, loc){
  if(!loc || !isRaidVulnerable(loc)) return;
  const rec = loadRaidState()[loc.id];
  const hasRaiders = screen.packs.some(p=>p.isRaider);
  if(rec && rec.state==='threatened'){
    if(!hasRaiders) spawnRaidersOnScreen(screen, loc, rec);
  } else if(hasRaiders){
    screen.packs = screen.packs.filter(p=>!p.isRaider);
  }
}
// 습격대를 화면 가장자리(성문 중 하나)에서 마을 중심(markerPos)을 향해
// 걸어오는 적대 팩으로 심는다. 이동/추격 AI는 3)번 섹션의 updateMonsters를
// 그대로 재사용 — isGuard 팩과 가까워지면 기존 팩 대 팩 조우전(resolveClash)
// 로직이 자동으로 발동해 "경비병이 요격"하는 그림이 된다(새 충돌 로직을
// 따로 안 만듦).
function spawnRaidersOnScreen(screen, loc, rec){
  const [lvLo, lvHi] = getLocationLevelBand(loc);
  const lvMid = (lvLo+lvHi)/2; // 루트 스케일(srcLevel)에만 쓴다 — HP/ATK는 아래 deriveMonsterStats로.
  const dangerMul = 1 + (loc.dangerLevel||0)*0.15;
  // [22-2] 습격대도 경비병과 같은 플레이어 전투력 기준 공식으로 통일 —
  // 경비병(hitsToKill 3.0)과 거의 맞먹는 2.8로 잡아서 습격 공방전이
  // 양쪽 다 진짜 싸움처럼 느껴지게 한다(경비병이 압도적으로 세면 습격이
  // 항상 싱겁게 끝나고, 반대면 습격이 항상 뚫린다).
  const stats = deriveMonsterStats(loc, 2.8, 0.075, dangerMul);
  const count = rec.raiderCount || 2;
  const entryExit = screen.exits.length ? screen.exits[Math.floor(Math.random()*screen.exits.length)] : null;
  const startC = entryExit ? entryExit.gc : 2, startR = entryExit ? entryExit.gr : 2;
  const markC = screen.markerPos ? screen.markerPos.c : screen.COLS/2;
  const markR = screen.markerPos ? screen.markerPos.r : screen.ROWS/2;
  const packId = loc.id+'_raiders_'+rec.threatenedAt;
  for(let i=0;i<count;i++){
    const ox=(Math.random()-0.5)*3, oy=(Math.random()-0.5)*3;
    screen.packs.push({
      id:'raider'+i+'_'+rec.threatenedAt, packId, isRaider:true,
      name:'습격대', icon:'🏴', temperament:'aggressive', weapon:'blade', intellect:'sapient',
      detectR:6, power: stats.power, hp: stats.hp, atk: stats.atk,
      homeC:markC, homeR:markR, // 목적지 = 마을 중심(markerPos) — updateMonsters의 idle 배회 분기가 이 홈을 향해 계속 이동시킨다
      x:(startC+ox)*TILE, y:(startR+oy)*TILE, targetX:markC*TILE, targetY:markR*TILE,
      retargetIn:0, cooldown:0, state:'idle', wounded:false, fighting:null, fightTimer:0, srcLevel:lvMid,
    });
  }
}
// 그 화면에 살아있는 습격대가 전멸했을 때(플레이어가 직접 처치했든, 경비병
// 대 습격대 자동 조우전으로 정리됐든) 즉시 "자력 방어 성공"으로 확정한다 —
// 정해진 판정 시각(resolveAt)까지 굳이 기다리게 하지 않는 것이 사용자 경험상
// 자연스럽다. rec.state가 이미 'threatened'가 아니면(예: 두 경로에서 동시에
// 호출돼 먼저 처리된 경우) 조용히 무시한다(멱등).
// [10번 후속 라운드] 이 함수는 "플레이어가 그 화면에 실제로 있을 때" 호출된
// 경로로만 진입한다(checkPackEncounter의 승리 콜백 / updateMonsters의
// 습격대 전멸 감지 — 둘 다 RT.screen이 이 장소일 때만 부른다). 그래서
// 화면 밖 확률/타이머 판정(applyRaidOutcomeToEconomy)과 달리 여기서는
// 평판도 실제로 올린다 — "직접 방어에 참여했다"는 조건을 만족하기
// 때문(조정자 지시: 평판은 플레이어의 실제 행동에서만 오른다). bySelf가
// true면(checkPackEncounter에서 플레이어가 직접 전투로 마지막 습격대를
// 처치) 경비병이 자동으로 정리한 경우(bySelf=false)보다 더 크게 준다.
function finalizeLiveRaidDefense(locId, bySelf=false){
  const st = loadRaidState();
  const rec = st[locId];
  if(!rec || rec.state!=='threatened') return false;
  const now = Date.now();
  rec.state='resolved'; rec.outcome='defended'; rec.resolvedAt=now;
  rec.recoverAt = now + (RAID_RECOVER_MS.defended||45000);
  saveRaidState(st);
  changeProsperity(locId, bySelf?8:5, bySelf?'직접 습격 격퇴':'현장에서 습격 방어');
  changeLocationReputation(locId, bySelf?12:6, bySelf?'직접 습격 격퇴':'현장에서 습격 방어', true);
  showFieldToast('🛡️ 습격을 성공적으로 막아냈다!');
  // [21번 라운드, 시스템 업그레이드 ⑤] 플레이어가 직접(또는 자기 영지
  // 경비병이) 현장에서 막아낸 경우도 applyRaidOutcomeToEconomy의
  // 'defended' 분기와 같은 원칙으로 영지 충성도를 살짝 올린다 —
  // 직접 방어니 화면 밖(off-screen) 자력방어보다 조금 더 크게.
  if(locId==='loc_demesne'){
    try{
      const d = (typeof window.loadDemesne==='function') ? window.loadDemesne() : null;
      if(d && d.established){
        d.loyalty=Math.min(100,(d.loyalty||50)+(bySelf?6:3));
        if(typeof window.saveDemesne==='function') window.saveDemesne(d);
      }
    }catch(e){}
  }
  return true;
}
// 백그라운드 폴러 — 필드 패널이 닫혀있어도(플레이어가 다른 곳에서 채팅
// 중이어도) 습격 시작/종료 소식이 실제 경과 시간에 맞춰 진행되고
// toast()로 전달되게 한다(기존 tickWorldTimer 등이 판정 시점에 바로
// toast를 띄우는 것과 같은 관례). RT가 그 화면에 살아있으면
// advanceRaidIfDue 내부에서 실측 데이터를 쓰므로 여기서 따로 분기하지 않음.
(function raidBackgroundPoller(){
  setInterval(()=>{
    try{
      const locs = getAllLandLocations().filter(isRaidVulnerable);
      if(!locs.length) return;
      const st = loadRaidState();
      let changed = false;
      for(const loc of locs){
        const ev = advanceRaidIfDue(loc, st, Date.now());
        if(ev){ changed = true; toast(ev.msg, ev.type==='start'?3200:3600); }
      }
      if(changed) saveRaidState(st);
    }catch(e){ console.warn('[raidBackgroundPoller]', e); }
  }, RAID_POLL_MS);
})();

// ══════════════════════════════════════════════════════════════════
// 2) 로컬 미니 전투 엔진 — AI 호출 없이 상태 기반 문장 뱅크로 서술.
//    (프로토타입에서 그대로 이식 — 무기/지능 조합이 범용적이라 콘텐츠가
//    아니라 엔진의 일부로 취급)
// ══════════════════════════════════════════════════════════════════
function _josa(word, type){
  const ch = word.charCodeAt(word.length-1);
  const hasBatchim = ch>=0xAC00 && ch<=0xD7A3 && (ch-0xAC00)%28!==0;
  if(type==='을를') return hasBatchim ? '을' : '를';
  if(type==='이가') return hasBatchim ? '이' : '가';
  return '';
}
function _fillLine(tpl, atkName, tgtName){
  return tpl
    .replace(/\{atk:을를\}/g, atkName+_josa(atkName,'을를'))
    .replace(/\{atk:이가\}/g, atkName+_josa(atkName,'이가'))
    .replace(/\{atk:에게\}/g, atkName+'에게')
    .replace(/\{tgt:을를\}/g, tgtName+_josa(tgtName,'을를'))
    .replace(/\{tgt:이가\}/g, tgtName+_josa(tgtName,'이가'))
    .replace(/\{tgt:에게\}/g, tgtName+'에게')
    .replace(/\{tgt:은는\}\(는\)/g, tgtName+'은(는)')
    .replace(/\{atk\}/g, atkName)
    .replace(/\{tgt\}/g, tgtName);
}
const NARRATION_BANK = {
  dominant: ['{atk:이가} 여유롭게 빈틈을 파고들어 {tgt:을를} 강타했다','{tgt:이가} 이미 한계에 다다른 듯 방어가 무너진다','가볍게 흘려낸 뒤 정확한 반격이 {tgt:을를} 노렸다','전황은 완전히 기울었다 — {atk}의 움직임이 거침없다'],
  desperate: ['숨이 턱까지 찬 채로 {atk:이가} 마지막 힘을 짜냈다','휘청이는 몸을 간신히 가누며 {tgt:을를} 향해 반격했다','{atk:이가} 버티는 것조차 벅차 보이지만 무기를 놓지 않는다'],
  critical: ['완벽하게 들어갔다 — {tgt:이가} 크게 휘청인다!','빈틈을 정확히 꿰뚫는 회심의 일격!','{atk}의 일격이 급소를 스쳤다'],
  comeback: ['포기하려던 순간, 오히려 그것이 {tgt}의 빈틈이 됐다','흐름이 바뀌었다 — 방금 전까지의 수세는 온데간데없다'],
  kill: ['{tgt:이가} 힘없이 쓰러졌다','더 이상 {tgt:은는}(는) 움직이지 않는다','마지막 일격과 함께 {tgt:이가} 무너져 내렸다'],
  neutral: ['{atk}과(와) {tgt}이(가) 팽팽하게 맞섰다','서로의 빈틈을 노리며 공방이 이어진다','{atk}의 공격이 {tgt:에게} 스쳤다'],
  miss: ['{tgt:이가} 몸을 비틀어 아슬아슬하게 피해냈다','{atk}의 공격이 허공을 갈랐다','{tgt:이가} 재빨리 물러서며 공격을 피했다'],
};
function pickLine(cat, atkName, tgtName){
  const bank = NARRATION_BANK[cat] || NARRATION_BANK.neutral;
  return _fillLine(bank[Math.floor(Math.random()*bank.length)], atkName, tgtName);
}
const WEAPON_ACTION_BANK = {
  fang: ['{atk:이가} 날카로운 이빨을 드러내며 {tgt:을를} 향해 달려들었다','{atk:이가} 발톱을 세워 {tgt:을를} 할퀴려 들었다'],
  blade: ['{atk:이가} 검을 크게 휘둘러 {tgt:을를} 베어갔다','{atk:이가} 칼끝을 낮게 세워 {tgt:을를} 향해 찔러갔다'],
  spear: ['{atk:이가} 창끝을 낮게 겨눈 채 {tgt:을를} 향해 찔러갔다','{atk:이가} 창대를 크게 휘둘러 {tgt:을를} 후려치려 했다'],
  bow: ['{atk:이가} 화살을 매겨 {tgt:을를} 겨눈 채 시위를 놓았다','{atk:이가} 물러서며 {tgt:을를} 향해 화살을 날렸다'],
  blunt: ['{atk:이가} 철퇴를 크게 치켜들어 {tgt:을를} 내리쳤다','{atk:이가} 묵직한 곤봉을 휘둘러 {tgt:을를} 노렸다'],
  unarmed: ['{atk:이가} 맨주먹을 휘둘러 {tgt:을를} 가격했다','{atk:이가} 거칠게 달려들어 {tgt:을를} 붙잡으려 했다'],
  magic: ['{atk:이가} 손끝에 마력을 모아 {tgt:을를} 향해 쏘아냈다','{atk:이가} 주문을 읊조리며 {tgt:을를} 향해 손을 뻗었다'],
};
const VOICE_BANK = {
  sapient: { threat:['「감히-!」','「죽고 싶어 환장했구나!」'], surprise:['「뭐, 뭐야 이건?!」','「이럴 수가...」'], triumph:['「그럴 줄 알았다!」','「이걸로 끝이다!」'], pain:['「크윽...!」','「이, 이게 무슨...」'] },
  feral: { threat:['"죽인다... 죽여버린다..."','"약한... 냄새..."'], surprise:['"컥...?!"'], triumph:['"크르... 끝... 끝이다..."'], pain:['"끄으윽..."'] },
  mute: { threat:['낮게 그르렁거리며 이빨을 드러냈다','털을 곤두세우고 사납게 울부짖었다'], surprise:['움찔하며 순간적으로 몸을 움츠렸다'], triumph:['만족스러운 듯 콧김을 거칠게 내뿜었다'], pain:['고통스러운 신음과 함께 몸을 뒤틀었다'] },
};
const TONE_BY_CAT = { dominant:'threat', critical:'triumph', comeback:'triumph', desperate:'pain', kill:'triumph', neutral:'threat', miss:'surprise' };
const VOICE_CHANCE_BY_CAT = { dominant:0.6, critical:0.9, comeback:0.9, desperate:0.7, kill:0.5, neutral:0.35, miss:0.2 };
const WEAPON_MODS = {
  fang:{missChance:0.08,critBonus:0.05,dmgMul:1.0}, blade:{missChance:0.05,critBonus:0,dmgMul:1.0},
  spear:{missChance:0.06,critBonus:0,dmgMul:1.0,firstStrikeMul:1.25}, blunt:{missChance:0.10,critBonus:0,dmgMul:1.2},
  bow:{missChance:0.05,critBonus:0.10,dmgMul:1.0}, magic:{missChance:0.05,critBonus:0,dmgMul:1.0,volatile:true},
  unarmed:{missChance:0.02,critBonus:0,dmgMul:0.85},
};
function composeLine(cat, atk, tgt){
  const wpnBank = WEAPON_ACTION_BANK[atk.weapon] || WEAPON_ACTION_BANK.blade;
  const wpnSentence = _fillLine(wpnBank[Math.floor(Math.random()*wpnBank.length)], atk.name, tgt.name);
  let voiceSentence = '';
  if(Math.random() < (VOICE_CHANCE_BY_CAT[cat]??0.3)){
    const tone = TONE_BY_CAT[cat] || 'threat';
    const vb = (VOICE_BANK[atk.intellect] || VOICE_BANK.sapient)[tone];
    if(vb && vb.length){
      const line = vb[Math.floor(Math.random()*vb.length)];
      voiceSentence = (atk.intellect==='mute') ? (atk.name+_josa(atk.name,'이가')+' '+line) : line;
    }
  }
  const outcomeSentence = pickLine(cat, atk.name, tgt.name);
  return [wpnSentence, voiceSentence, outcomeSentence].filter(Boolean).join(' ');
}

// 실제 플레이어 스탯 기반 공격력 — 게임 전역에 "플레이어가 매 타격마다
// 주는 데미지" 공식이 원래 없었다(이 게임은 AI 서사가 GS 태그로 전투를
// 판정하는 구조라서). 필드 미니 전투 전용으로 새로 설계하되, 반드시
// 실제 스탯(STR/MGC/AGI/CRIT)을 실제로 반영하게 만들어 "허수아비 전투"가
// 되지 않게 했다.
function calcFieldPlayerDamage(){
  const st = S.stats || {};
  const atkStat = Math.max(st.str||50, st.mgc||50);
  const variance = 0.8 + Math.random()*0.4;
  const base = Math.max(3, Math.round(atkStat*0.28*variance));
  const critChance = 0.15 + Math.min(0.35, ((st.crit||50)-50)/200);
  const isCrit = Math.random() < critChance;
  return { dmg: isCrit ? Math.round(base*1.6) : base, isCrit };
}
// [16번 라운드, [대기] #13 완료 — 파티원 실전투 참가] 파티원은 `statBonus`
// 델타(예: 전사 str+25)만 갖고 있고 플레이어처럼 0~100대 절대 스탯이 없다
// — 그래서 "평범한 사람 기준치(50)에 그 동료의 특기 보너스를 얹는다"는
// 가정으로 계산한다. calcFieldPlayerDamage와 같은 계수(0.28)를 그대로
// 쓰지 않고 살짝 낮춘(0.26) 이유: 이 필드 전투 자체가 원래 "주인공이
// 주력, 동료는 거드는 존재"라는 기존 설계(칭호/스킬 텍스트에 "지원",
// "탱커" 같은 표현이 이미 있음)를 유지하기 위함 — 파티원이 플레이어보다
// 세면 안 된다고 판단.
function calcPartyMemberDamage(member){
  const sb = member.statBonus || {};
  const atkStat = 50 + Math.max(sb.str||0, sb.mgc||0, sb.fath||0, sb.agi||0);
  const variance = 0.8 + Math.random()*0.4;
  const base = Math.max(2, Math.round(atkStat*0.26*variance));
  const isCrit = Math.random() < 0.12;
  return { dmg: isCrit ? Math.round(base*1.6) : base, isCrit };
}

let battleState = null;
let battleUiRefresh = null; // 렌더 콜백(패널이 설정)
let battleDoneCb = null;

export function startFieldBattle(enemyPackUnits, onDone){
  const maxHp = getPlayerMaxHp();
  S.stats.hp = Math.min(S.stats.hp ?? maxHp, maxHp);
  const playerUnit = { name: S.character?.name||'플레이어', icon:'🧑', hp: Math.max(1,S.stats.hp||maxHp), maxHp, atk:0, side:'ally', intellect:'sapient', weapon:'blade', isPlayer:true };
  // [16번 라운드, [대기] #13 완료] 파티원을 실제 전투원으로 끼워넣는다 —
  // 최대 3명(밸런스+전투 로그 가독성, 새로 정한 값). 살아있고
  // (alive!==false) 전투 불능이 아닌(hp>0 또는 아직 hp 필드가 없는 신규
  // 동료) 파티원만. `_partyName`은 전투 종료 후 loadParty()에서 같은
  // 동료를 다시 찾아 HP를 저장하기 위한 내부용 키.
  const partyUnits = ((typeof loadParty==='function') ? (loadParty()||[]) : [])
    .filter(m=>m.alive!==false && (m.hp==null || m.hp>0))
    .slice(0,3)
    .map(m=>({ name:m.name, icon:m.icon||'🧑', hp:Math.max(1,m.hp??100), maxHp:m.maxHp||100, atk:0, side:'ally', intellect:'sapient', weapon:'blade', isPlayer:false, statBonus:m.statBonus||{}, _partyName:m.name }));
  battleState = {
    allies: [playerUnit, ...partyUnits],
    enemies: enemyPackUnits.map(e=>({ ...e, side:'enemy' })),
    log: [], round:0, prevCat:{ally:null,enemy:null}, win:null,
  };
  battleDoneCb = onDone;
  S._tookDamageThisCombat = false;
  if(battleUiRefresh) battleUiRefresh(battleState, false);
  setTimeout(stepFieldBattle, 500);
}
function resolveHit(atk, tgt){
  if(atk.hp<=0 || tgt.hp<=0) return;
  const bs = battleState;
  let dealt, isCrit=false, cat;
  if(atk.side==='ally'){
    const r = atk.isPlayer ? calcFieldPlayerDamage() : calcPartyMemberDamage(atk);
    if(Math.random() < 0.04){ bs.log.push({ text: composeLine('miss', atk, tgt), cat:'miss' }); return; }
    dealt = r.dmg; isCrit = r.isCrit;
    tgt.hp = Math.max(0, tgt.hp-dealt);
  } else {
    const mods = WEAPON_MODS[atk.weapon] || WEAPON_MODS.blade;
    if(Math.random() < mods.missChance){ bs.log.push({ text: composeLine('miss', atk, tgt), cat:'miss' }); return; }
    dealt = calcMonsterAttackDamage({ atk: atk.atk });
    isCrit = Math.random() < (0.15+(mods.critBonus||0));
    if(isCrit) dealt = Math.round(dealt*1.4);
    tgt.hp = Math.max(0, tgt.hp-dealt);
    // [버그 수정, 16번 라운드] 예전엔 "아군이 맞으면 무조건 S.stats.hp에
    // 덮어쓴다"였다 — 아군이 플레이어 한 명뿐이던 시절엔 안전했지만,
    // 파티원을 아군에 추가하면서 파티원이 맞을 때도 플레이어의 진짜
    // HP가 파티원 HP로 잘못 바뀌는 버그가 됐다. 실제 플레이어 유닛일
    // 때만 반영하도록 좁힌다.
    if(tgt.isPlayer){
      S.stats.hp = tgt.hp;
      S._tookDamageThisCombat = true;
    }
  }
  const killed = tgt.hp<=0;
  const atkSide = atk.side==='ally' ? bs.allies : bs.enemies;
  const oppSide = atk.side==='ally' ? bs.enemies : bs.allies;
  const sumHp = u=>u.reduce((s,x)=>s+Math.max(0,x.hp),0), sumMax = u=>u.reduce((s,x)=>s+x.maxHp,0);
  const diff = (sumHp(atkSide)/sumMax(atkSide)) - (sumHp(oppSide)/sumMax(oppSide));
  if(killed) cat='kill'; else if(isCrit) cat='critical'; else if(diff>0.28) cat='dominant'; else if(diff<-0.28) cat='desperate'; else cat='neutral';
  if(cat!=='kill' && cat!=='critical'){
    if(bs.prevCat[atk.side]==='desperate' && diff>-0.05) cat='comeback';
    bs.prevCat[atk.side] = (cat==='comeback') ? 'dominant' : cat;
  }
  bs.log.push({ text: composeLine(cat, atk, tgt) + (killed?'':` (${dealt} 피해)`), cat });
}
// [16번 라운드, [대기] #13 완료 — 파티원 실전투 참가] 예전엔 "아군은
// allies[0](=플레이어) 한 명뿐"이라는 가정으로, 라운드마다 그 한 명만
// 공격하고 패배 판정도 allies[0].hp<=0 하나로 고정돼 있었다. 이제
// allies에 파티원이 최대 3명 더 들어오므로: (1) 살아있는 아군 전원이
// 각자 한 번씩 공격(그때그때 가장 약한 적을 골라 집중포화 — 안 그러면
// 적이 흩어져 죽는 게 느려서 필드 전투가 늘어짐), (2) 적은 60% 확률로
// 플레이어를, 나머지는 살아있는 파티원 중 무작위 1명을 노린다(플레이어만
// 계속 맞으면 "동료가 있는 의미"가 없고, 반대로 플레이어가 전혀 안 맞으면
// 긴장감이 사라짐 — 그래서 확률로 분산), (3) 패배 판정은 반드시
// "플레이어 유닛"을 isPlayer로 직접 찾아서 그 HP만 본다 — allies[0]
// 포지션 가정을 없애 파티 구성 순서가 바뀌어도 안전하다.
function stepFieldBattle(){
  const bs = battleState; if(!bs) return;
  const playerUnit = bs.allies.find(u=>u.isPlayer);
  let aliveAllies = bs.allies.filter(u=>u.hp>0);
  let aliveEnemies = bs.enemies.filter(u=>u.hp>0);
  if(!aliveAllies.length || !aliveEnemies.length || !playerUnit || playerUnit.hp<=0){ finishFieldBattle(); return; }
  bs.round++;
  for(const ally of aliveAllies){
    if(ally.hp<=0) continue;
    aliveEnemies = bs.enemies.filter(u=>u.hp>0);
    if(!aliveEnemies.length) break;
    const weakest = aliveEnemies.slice().sort((a,b)=>a.hp-b.hp)[0];
    resolveHit(ally, weakest);
    if(playerUnit.hp<=0) break;
  }
  if(playerUnit.hp<=0){ finishFieldBattle(); return; }
  for(const e of bs.enemies){
    if(e.hp<=0) continue;
    aliveAllies = bs.allies.filter(u=>u.hp>0);
    if(!aliveAllies.length) break;
    const others = aliveAllies.filter(u=>!u.isPlayer);
    const target = (playerUnit.hp>0 && (Math.random()<0.6 || !others.length))
      ? playerUnit
      : others[Math.floor(Math.random()*others.length)];
    resolveHit(e, target);
    if(playerUnit.hp<=0) break;
  }
  if(battleUiRefresh) battleUiRefresh(bs, false);
  if(playerUnit.hp<=0 || !bs.enemies.some(u=>u.hp>0)) setTimeout(finishFieldBattle, 450);
  else setTimeout(stepFieldBattle, 850);
}
function finishFieldBattle(){
  const bs = battleState; if(!bs) return;
  const playerUnit = bs.allies.find(u=>u.isPlayer);
  const win = !!playerUnit && playerUnit.hp>0 && bs.enemies.every(u=>u.hp<=0);
  bs.win = win;
  bs.log.push({ text: win ? '마지막 적이 쓰러지고, 전장에 정적이 감돈다. 승리했다.' : '더 이상 버틸 힘이 남아있지 않다... 눈앞이 흐려진다.', cat:'outcome' });
  // ── 실제 게임 상태에 반영 ──
  S.stats.hp = Math.max(0, playerUnit ? playerUnit.hp : 0);
  // [16번 라운드] 필드 전투에 참가했던 파티원들의 HP를 실제 저장 데이터
  // (tf-party)에 되돌려 쓴다. 필드 전투에서 파티원은 "영구 사망"하지
  // 않는다는 설계(도시 전투와 다르게 필드 몹은 파티 전멸을 의도한 난이도가
  // 아님)라서, 0까지 떨어졌어도 최소 1로 바닥을 깐다 — "빈사 상태로
  // 실려나감"에 해당. alive 플래그는 건드리지 않는다(원래도 true).
  const partyCombatants = bs.allies.filter(u=>!u.isPlayer && u._partyName);
  if(partyCombatants.length && typeof loadParty==='function' && typeof saveParty==='function'){
    const party = loadParty()||[];
    let changed = false;
    partyCombatants.forEach(pu=>{
      const rec = party.find(m=>m.name===pu._partyName);
      if(rec){ rec.hp = Math.max(1, pu.hp); changed = true; }
    });
    if(changed) saveParty(party);
  }
  if(typeof window.updateHeader==='function') window.updateHeader();
  if(win){
    const avgLv = bs.enemies.reduce((s,e)=>s+(e.srcLevel||10),0)/Math.max(1,bs.enemies.length);
    const loot = (typeof rollLoot==='function') ? rollLoot(Math.max(1,Math.round(avgLv)), false) : [];
    if(loot && loot.length){
      S.inventory = S.inventory||[];
      loot.forEach(it=>S.inventory.push(it));
      if(typeof window.saveInventory==='function') window.saveInventory(S.inventory);
      toastHTML(loot.map(it=>`🎁 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(it,{size:14}):(it.icon||'')} ${esc(it.name)}`).join(' '), 3200);
    }
    const gold = 10 + Math.floor(Math.random()*30);
    S.gold = (S.gold||0)+gold;
    if(typeof window.saveGold==='function') window.saveGold(S.gold);
  }
  if(typeof window.saveSession==='function') window.saveSession();
  if(battleUiRefresh) battleUiRefresh(bs, true);
  if(!win && typeof triggerLoopIfDead==='function') triggerLoopIfDead();
  if(battleDoneCb) battleDoneCb(win);
}
export function setBattleUiRefresh(fn){ battleUiRefresh = fn; }
export function getBattleState(){ return battleState; }
export function clearBattleState(){ battleState = null; battleDoneCb = null; }

// export sentence-bank building blocks for the panel to build enemy units
export function packToBattleUnits(pack, group){
  return [pack, ...group].map((u,i)=>{
    const woundedMul = u.wounded ? 0.55 : 1;
    const hpMax = Math.max(1, Math.round(u.hp*woundedMul));
    return { name:u.name+(group.length?` ${i+1}`:'')+(u.wounded?'(부상)':''), icon:u.icon,
      hp:hpMax, maxHp:hpMax, atk:Math.round(u.atk*(u.wounded?0.7:1)),
      intellect:u.intellect, weapon:u.weapon, srcLevel: u.srcLevel };
  });
}

window.FIELD_ENGINE = { buildField, buildKingdomGraph, buildScreen, startFieldBattle, setBattleUiRefresh, getBattleState, clearBattleState, packToBattleUnits, FT };


// ══════════════════════════════════════════════════════════════════
// 3) 런타임 — 화면 그래프를 실제로 걸어다니는 부분. 캔버스 렌더 +
//    WASD/터치조이스틱 입력 + 몬스터 AI 갱신 + 팩 대 팩 조우전 +
//    화면 경계에 닿으면 다음 화면으로 전환(메이플스토리/DFO 식) +
//    실제 이동수단(TRANSPORT_CONFIG/S._activeTransport) 연동 + 패널
//    진입/이탈. 패널 DOM은 template.html에 정적으로 있는
//    #p-fieldmove/#pb-fieldmove를 채운다(다른 전체화면 패널과 동일한 관례).
// ══════════════════════════════════════════════════════════════════
let RT = null; // 현재 필드 런타임 상태(패널이 열려있는 동안만 존재)

function fmtLocMeta(loc){
  const typeName = {capital:'수도',city:'도시',town:'마을',village:'촌락',hamlet:'촌',port:'항구',dungeon:'던전',wilderness:'황야',event:'사건 현장',special:'특수',shrine:'사당',jail:'감옥'}[loc.type]||loc.type;
  return typeName + (loc.dangerLevel ? ' · 위험도 '+'⚠️'.repeat(Math.min(5,loc.dangerLevel)) : '');
}
function currentTransportConfig(){
  return TRANSPORT_CONFIG[RT?.transportType] || TRANSPORT_CONFIG.walk;
}
// [2026-09-18, 이동 속도 튜닝 라운드] 사용자 실측 요청: "화면 하나를 도보로
// 건너는 데 20~30초 정도가 적당하지 않을까? 탈것으로 5~10초는 특히 모바일
// 에서 너무 빠르고 정신없지 않을까." 기존 1.15(도보로 화면 하나 8~13초
// 추정치)는 계산만으로 정하지 않고 Playwright로 실제 WASD 키를 눌러(+실제
// dt 기반 프레임레이트 정규화까지 고친 뒤) 화면 전환까지 걸리는 실제 벽시계
// 시간을 여러 차례 재측정하며 값을 수렴시켰다 — 1차 실측(0.5)은 화면 하나에
// 15.7초로 목표(20~30초)보다 빨라서, 그 실측값 비율로 다시 계산해 이 값으로
// 낮췄다(재측정 결과는 작업메모장.md 12번 섹션 참고).
const FIELD_BASE_SPEED = 0.32; // 화면 픽셀/프레임 기준값 — 이동수단별 speedMult를 그대로 곱한다(별도 수치 체계를 새로 안 만듦)
// 탈것 속도 상한 — 예전엔 4.2(명마 4.0/그리핀 5.0 등 거의 그대로 허용)였는데,
// 도보 기준(FIELD_BASE_SPEED)을 낮춘 뒤 그 비율을 그대로 유지하면 탈것이
// "화면 하나를 몇 초 만에 통과"해버려 사용자가 우려한 "모바일에서 너무
// 빠르고 정신없다"가 그대로 재현된다 — 실측 후 상한 자체를 4.2→2.2→1.8로
// 두 차례 더 낮췄다(1.8에서 실측 결과는 작업메모장.md 12번 섹션 참고 — 탈것도
// 걸어서 건너는 것보다는 분명히 빠르되, 사용자가 우려한 "5~10초 구간"보다는
// 확실히 느리게 잡는 쪽으로 판단했다).
const FIELD_MOUNT_SPEED_CAP = 1.8;
// 몬스터 이동 속도 — 기존엔 updateMonsters 안에 0.5/1.3/1.4/1.8 같은 절대
// 픽셀/프레임 리터럴로 박혀 있어서 FIELD_BASE_SPEED와 완전히 무관했다.
// 도보 속도를 절반 가까이 낮췄는데 몬스터 속도가 그대로면, 공격적 몬스터
// (기존 1.4)가 새 도보 속도(0.5)의 거의 3배가 되어 사실상 못 도망치는
// 불공평한 추격이 된다 — 기존 값들이 "도보(1.15) 대비 몇 배였는지" 비율을
// 그대로 보존해서 FIELD_BASE_SPEED에서 다시 유도한다(추격/도주 난이도
// 체감을 새 속도에서도 동일하게 유지하기 위함).
const MONSTER_WANDER_SPEED = FIELD_BASE_SPEED * (0.5/1.15);  // 기존 0.5(idle 배회)
const GUARD_CHASE_SPEED    = FIELD_BASE_SPEED * (1.3/1.15);  // 기존 1.3(경비병 요격)
const MONSTER_CHASE_SPEED  = FIELD_BASE_SPEED * (1.4/1.15);  // 기존 1.4(공격적 추격)
const MONSTER_FLEE_SPEED   = FIELD_BASE_SPEED * (1.8/1.15);  // 기존 1.8(겁많음 도주)
// [2026-09-18, 이동 속도 튜닝 라운드 — 코디네이터 정정] 위 모든 속도 상수는
// "60fps 기준 프레임당 픽셀"로 설계됐는데, 실제 이동 코드(fieldLoop의 플레이어
// 이동, updateMonsters의 몬스터 이동)는 매 requestAnimationFrame 호출마다 이
// 값을 dt(실제 경과 ms)와 무관하게 그대로 더하고 있었다 — 즉 "실제 초당 이동
// 거리"가 그 기기/탭의 실제 프레임레이트에 좌우되는 버그였다(120Hz 화면에서는
// 2배 빠르게, rAF가 스로틀되는 백그라운드 탭에서는 느리게 움직임). "화면 하나
// 건너는 데 20~30초"라는 목표는 실제 벽시계 시간 기준이어야 하므로, dt를
// 60fps 프레임 수로 환산한 배율(frameScale)을 이동 거리에 곱해서 실제 초당
// 이동 속도가 프레임레이트와 무관하게 항상 같아지게 한다.
const REF_FRAME_MS = 1000/60;
// [16번 라운드, [대기] #12] 도망친 추격자 지속성 — 프로토타입/원래 게임
// 어디에도 대응 값이 없어 이번에 새로 정한 상수(10번 섹션 습격 타이머와
// 같은 성격의 판단). 습격 "threatened" 유지시간(60초)보다 조금 길게 —
// 화면을 완전히 벗어나 도망친 추격자가 "바로 포기하지는 않되 영원히
// 쫓아오지도 않는" 느낌을 노림.
const PURSUER_GIVE_UP_MS = 120000;

// [19번 라운드, [대기] #10 나머지 — 필드 진입 게이팅] 사용자 확정 지시
// ("막아줘"): 지금까지는 월드맵에서 아무 서사적 맥락 없이 아무 때나
// "🎮 실시간 필드 이동" 버튼을 누를 수 있었다. quest/086의
// composeLocalTurnText가 move(agi) 판정 성공 시
// S._fieldEntryWindowUntil(타임스탬프)을 세팅해주는 걸 여기서 읽어
// "이야기 속에서 실제로 주변을 살펴보거나 움직이는 선택을 골라 성공한
// 직후 한동안"만 진입을 허용한다. 버튼 쪽(economy/255)도 이 값을 보고
// 아예 비활성으로 그려주지만, enterFieldMode 자체에도 방어적으로
// 같은 검사를 둔다(다른 경로로 호출돼도 안전하도록).
function hasFieldEntryEligibility(){
  return !!(S._fieldEntryWindowUntil && Date.now() < S._fieldEntryWindowUntil);
}
export function enterFieldMode(continentKey){
  if(!hasFieldEntryEligibility()){
    toast('🔒 이야기 속에서 주변을 살펴보거나 움직이는 선택을 골라야 필드로 나갈 수 있습니다', 2800);
    return;
  }
  const graph = buildKingdomGraph(continentKey);
  if(!graph){ toast('이 왕국은 아직 실시간 필드로 옮길 장소 데이터가 없습니다', 2500); return; }
  const canvas = document.getElementById('tf-field-canvas');
  if(!canvas){ return; }
  const ctx = canvas.getContext('2d');

  // 시작 이동수단 — 새 상태를 안 만들고, 실제 여행 시스템이 매번 기록해온
  // S._activeTransport(travelByTransport 참고)를 그대로 읽는다. 마법진
  // 순간이동은 "거리 무관 즉시 도착"이 본질이라 연속 이동 화면에는 안
  // 맞아서 필드에서는 제외하고 도보로 대체한다.
  const savedTransport = S._activeTransport;
  const startTransport = (savedTransport && TRANSPORT_CONFIG[savedTransport] && !TRANSPORT_CONFIG[savedTransport].isTeleport) ? savedTransport : 'walk';

  const savedLoc = loadCurrentLocation();
  let startNodeId = graph.startNodeId;
  if(savedLoc && savedLoc.continent===continentKey){
    for(const n of graph.nodes.values()){
      if(n.kind==='location' && n.loc.id===savedLoc.id){ startNodeId = n.id; break; }
    }
  }

  RT = {
    graph, screen:null, ctx, canvas, transportType: startTransport,
    player: { x:0, y:0, r:6, facing:'down' },
    keys: new Set(), touchDir:{x:0,y:0}, joyPointerId:null, joyOriginX:0, joyOriginY:0,
    currentZone: null, encounterActive:false, raf:null, lastTs: performance.now(),
    listeners: [], _prevNodeId: null,
    // [16번 라운드, [대기] #13 착수] 플레이어 이동 궤적을 짧게 기록해서
    // 파티원이 몇 프레임 뒤처져 "따라오는" 것처럼 보이게 한다(고전
    // 스네이크식 팔로워) — 새 좌표 시스템을 안 만들고 이미 있는
    // player.x/y 흐름만 관찰한다.
    partyTrail: [],
  };
  attachInput();
  enterScreen(startNodeId, null);
  requestAnimationFrame(sizeCanvasToWrap);
  RT.raf = requestAnimationFrame(fieldLoop);
}
window.enterFieldMode = enterFieldMode;

// [16번 라운드, #10 착수] 필드에서 대화로 돌아올 때 아무 신호도 안
// 남기던 문제 — S._pendingTravelHint(economy/255, 8~11번 섹션)와 같은
// 패턴을 재사용해 "방금 필드에서 뭘 했는지"를 다음 턴 서사에 흘려보낸다.
// 단, 13번 섹션에서 확인한 대로 이 힌트는 AI가 있을 때만 읽는
// S.system이 아니라, composeLocalTurnText(완전 하드코딩 폴백)가
// 직접 읽도록 연결해야 AI 유무와 무관하게 항상 반영된다 — 아래
// quest/086의 소비 지점 참고.
function buildFieldReturnHint(){
  if(!RT) return null;
  const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  const locName = loc?.name || '들판';
  if(RT.hadCombat && (RT.combatWins||0)>0 && !(RT.combatLosses>0)){
    return `${locName} 인근에서 마주친 무리와 싸워 이기고 돌아왔다.`;
  }
  if(RT.hadCombat && RT.combatLosses>0){
    return `${locName} 인근에서 거친 싸움을 겪고, 상처를 추스르며 돌아왔다.`;
  }
  if(RT.sawRaidThreat){
    return `${locName}이(가) 위협받고 있는 걸 직접 보고 왔다 — 마음이 편치 않다.`;
  }
  return `${locName} 주변을 둘러보고 돌아왔다.`;
}
// [19번 라운드, [대기] #10 나머지 — 필드 퇴장 게이팅] 사용자 확정 지시
// ("막아줘"): 위협이 안 풀린 채로 그냥 나가버릴 수 없게 막는다.
// "위협"은 (1) 진행 중인 필드 전투(battleState가 아직 안 끝남) 또는
// (2) 현재 화면에 아직 포기하지 않고 쫓아오는 무리(state==='chasing',
// 경비병 제외 — 경비병의 chasing은 습격대를 요격하는 것이지 플레이어를
// 위협하는 게 아니라서 기존 추격자 포기 로직(16번 섹션)과 같은
// 기준으로 제외) 중 하나라도 있는 경우. (1)은 사실 실제 구멍이었다 —
// 전투 오버레이(#tf-field-encounter)가 canvas 영역만 덮고 상단 헤더의
// "✕ 필드 나가기" 버튼은 항상 눌리는 상태였는데, 지금까지는 아무도
// 막지 않고 있었다.
function hasUnresolvedFieldThreat(){
  if(battleState) return true;
  if(!RT || !RT.screen) return false;
  return RT.screen.packs.some(p=>p.state==='chasing' && !p.isGuard);
}
export function exitFieldMode(){
  if(hasUnresolvedFieldThreat()){
    showFieldToast('⚠️ 위협이 아직 풀리지 않았다 — 지금은 이 자리를 뜰 수 없다');
    return;
  }
  if(RT){
    try{ S._pendingFieldReturnHint = buildFieldReturnHint(); }catch(e){}
    if(RT.raf) cancelAnimationFrame(RT.raf);
    RT.listeners.forEach(([el,ev,fn])=>el.removeEventListener(ev,fn));
    RT = null;
  }
  closeP('fieldmove');
}
window.exitFieldMode = exitFieldMode;

function sizeCanvasToWrap(){
  if(!RT) return;
  const wrap = document.getElementById('tf-field-wrap');
  if(!wrap) return;
  const w = Math.max(320, wrap.clientWidth), h = Math.max(240, wrap.clientHeight);
  if(RT.canvas.width!==w || RT.canvas.height!==h){ RT.canvas.width=w; RT.canvas.height=h; }
}

function attachInput(){
  const canvas = RT.canvas;
  const kd = e=>{
    if(!RT) return;
    const k = e.key.toLowerCase();
    if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){ RT.keys.add(k); e.preventDefault(); }
  };
  const ku = e=>{ if(RT) RT.keys.delete(e.key.toLowerCase()); };
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
  RT.listeners.push([window,'keydown',kd],[window,'keyup',ku]);

  const JOY_DEADZONE=10, JOY_MAX=42;
  const joyEl = document.getElementById('tf-field-joystick');
  function joySetKnob(dx,dy){ const knob=joyEl?.querySelector('.knob'); if(knob) knob.style.transform=`translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`; }
  function joyEnd(){ RT.joyPointerId=null; RT.touchDir.x=0; RT.touchDir.y=0; if(joyEl) joyEl.style.display='none'; joySetKnob(0,0); }
  const pd = e=>{
    if(!RT || (e.pointerType==='mouse' && e.button!==0)) return;
    RT.joyPointerId = e.pointerId;
    const rect = canvas.getBoundingClientRect();
    RT.joyOriginX = e.clientX-rect.left; RT.joyOriginY = e.clientY-rect.top;
    if(joyEl){ joyEl.style.left=RT.joyOriginX+'px'; joyEl.style.top=RT.joyOriginY+'px'; joyEl.style.display='block'; }
    RT.touchDir.x=0; RT.touchDir.y=0;
    canvas.setPointerCapture(e.pointerId); e.preventDefault();
  };
  const pm = e=>{
    if(!RT || e.pointerId!==RT.joyPointerId) return;
    const rect = canvas.getBoundingClientRect();
    const dx = e.clientX-rect.left-RT.joyOriginX, dy = e.clientY-rect.top-RT.joyOriginY;
    const dist = Math.hypot(dx,dy), clamped = Math.min(dist, JOY_MAX);
    joySetKnob(dist>0?dx/dist*clamped:0, dist>0?dy/dist*clamped:0);
    if(dist<JOY_DEADZONE){ RT.touchDir.x=0; RT.touchDir.y=0; } else { RT.touchDir.x=dx/dist; RT.touchDir.y=dy/dist; }
    e.preventDefault();
  };
  const pu = e=>{ if(RT && e.pointerId===RT.joyPointerId) joyEnd(); };
  canvas.addEventListener('pointerdown', pd); canvas.addEventListener('pointermove', pm);
  canvas.addEventListener('pointerup', pu); canvas.addEventListener('pointercancel', pu);
  RT.listeners.push([canvas,'pointerdown',pd],[canvas,'pointermove',pm],[canvas,'pointerup',pu],[canvas,'pointercancel',pu]);

  const rz = ()=>sizeCanvasToWrap();
  window.addEventListener('resize', rz);
  RT.listeners.push([window,'resize',rz]);
}

// 공중 탑승물(isAir)은 산·물 지형을 그냥 넘어간다(요구사항: 지형 차단
// 무시 + 지상 인카운터 스킵). 그 외에는 화면 안 MOUNTAIN/WATER가 그대로
// 막는다 — 물 전용 화면(isWaterScreen)은 배/선박(range:water|sea)이
// 아니면 애초에 이 화면으로 못 건너오게 checkScreenTransition에서
// 막아주므로, 여기서는 "혹시 들어왔더라도" 안전망으로만 작동한다.
function tileBlockedAtPx(px,py){
  const { screen } = RT;
  const c = Math.floor(px/TILE), r = Math.floor(py/TILE);
  if(!screen.inB(c,r)) return true;
  if(currentTransportConfig().isAir) return false;
  return FT_BLOCKING.has(screen.grid[screen.idx(c,r)]);
}
function canMoveTo(nx,ny){
  const rr = RT.player.r;
  const pts = [[nx-rr,ny-rr],[nx+rr,ny-rr],[nx-rr,ny+rr],[nx+rr,ny+rr]];
  return !pts.some(p=>tileBlockedAtPx(p[0],p[1]));
}
function monsterBlockedAt(px,py){
  const { screen } = RT;
  const c = Math.floor(px/TILE), r = Math.floor(py/TILE);
  if(!screen.inB(c,r)) return true;
  return FT_BLOCKING.has(screen.grid[screen.idx(c,r)]);
}

function resolveClash(a,b){
  const pa=a.power, pb=b.power;
  const aWins = Math.random() < pa/(pa+pb);
  const winner = aWins?a:b, loser = aWins?b:a;
  winner.fighting=null; winner.fightTimer=0; winner.state='idle'; winner.wounded=true;
  const { screen } = RT;
  const li = screen.packs.indexOf(loser);
  if(li>=0) screen.packs.splice(li,1);
  showFieldToast('🩸 '+winner.name+'가(이) '+loser.name+'와(과)의 다툼 끝에 부상당한 채 살아남았다');
}

function updateMonsters(dt){
  const { screen, player } = RT;
  const packs = screen.packs;
  for(let i=0;i<packs.length;i++){
    const a = packs[i];
    if(a.cooldown>0 || a.fighting) continue;
    for(let j=i+1;j<packs.length;j++){
      const b = packs[j];
      if(b.cooldown>0 || b.fighting || a.packId===b.packId) continue;
      if(Math.hypot(a.x-b.x, a.y-b.y)/TILE <= 2.5){
        a.fighting=b; b.fighting=a; a.fightTimer=10000; b.fightTimer=10000;
        a.state='fighting'; b.state='fighting';
        break;
      }
    }
  }
  const toResolve = [];
  for(const m of packs){
    if(m.cooldown>0){ m.cooldown-=dt; continue; }
    if(m.fighting){
      m.fightTimer -= dt;
      if(m.fightTimer<=0 && !toResolve.some(p=>p.includes(m))) toResolve.push([m,m.fighting]);
      continue;
    }
    // 공중 탑승물은 encounterMult:0 — 지상 무리가 아예 인지하지 못한다(하늘 위를 지나가는 셈)
    const skyBypass = currentTransportConfig().isAir;
    const distToPlayer = skyBypass ? Infinity : Math.hypot(player.x-m.x, player.y-m.y)/TILE;
    const noticed = m.temperament!=='passive' && distToPlayer<=m.detectR;
    let stepX=0, stepY=0, stepSpeed=MONSTER_WANDER_SPEED;
    // [2026-09-18 습격 라운드] 경비병 — 플레이어가 아니라 습격대(isRaider)를
    // 감지 대상으로 삼는다. 감지 범위 안에 습격대가 있으면 그쪽으로 달려가
    // 요격(=가까워지면 위 팩 대 팩 조우전 로직이 자동으로 처리), 없으면
    // 평소처럼 성문 근처를 서성인다 — 기존 아군 없음 전제의 idle 배회
    // 분기를 그대로 재사용하되 대상만 플레이어에서 습격대로 바꿨다.
    if(m.isGuard){
      const threat = packs.filter(p=>p.isRaider && !p.fighting)
        .map(p=>({ p, d: Math.hypot(p.x-m.x, p.y-m.y)/TILE }))
        .sort((x,y)=>x.d-y.d)[0];
      if(threat && threat.d<=(m.detectR||8)){
        m.state='chasing';
        const dx=threat.p.x-m.x, dy=threat.p.y-m.y, d=Math.hypot(dx,dy)||1;
        stepX=dx/d; stepY=dy/d; stepSpeed=GUARD_CHASE_SPEED;
      } else {
        m.state='idle';
        m.retargetIn -= dt;
        if(m.retargetIn<=0){
          const ang=Math.random()*Math.PI*2, dist=0.5+Math.random()*1.5;
          m.targetX = m.homeC*TILE+TILE/2 + Math.cos(ang)*dist*TILE;
          m.targetY = m.homeR*TILE+TILE/2 + Math.sin(ang)*dist*TILE;
          m.retargetIn = 2500+Math.random()*2500;
        }
        const dx=m.targetX-m.x, dy=m.targetY-m.y, d=Math.hypot(dx,dy);
        if(d>2){ stepX=dx/d; stepY=dy/d; }
      }
    } else if(noticed && m.temperament==='aggressive'){
      m.state='chasing';
      const dx=player.x-m.x, dy=player.y-m.y, d=Math.hypot(dx,dy)||1;
      stepX=dx/d; stepY=dy/d; stepSpeed=MONSTER_CHASE_SPEED;
    } else if(noticed && m.temperament==='skittish'){
      m.state='fleeing';
      const dx=m.x-player.x, dy=m.y-player.y, d=Math.hypot(dx,dy)||1;
      stepX=dx/d; stepY=dy/d; stepSpeed=MONSTER_FLEE_SPEED;
    } else {
      m.state='idle';
      m.retargetIn -= dt;
      if(m.retargetIn<=0){
        const ang=Math.random()*Math.PI*2, dist=2+Math.random()*3;
        m.targetX = m.homeC*TILE+TILE/2 + Math.cos(ang)*dist*TILE;
        m.targetY = m.homeR*TILE+TILE/2 + Math.sin(ang)*dist*TILE;
        m.retargetIn = 2000+Math.random()*2000;
      }
      const dx=m.targetX-m.x, dy=m.targetY-m.y, d=Math.hypot(dx,dy);
      if(d>2){ stepX=dx/d; stepY=dy/d; }
    }
    // 플레이어 이동과 동일한 이유로 dt 정규화 — 몬스터도 프레임레이트에 무관하게
    // 항상 같은 실제 초당 속도로 움직여야 추격/도주 공정성이 프레임레이트에
    // 좌우되지 않는다.
    const monsterFrameScale = dt / REF_FRAME_MS;
    const nx=m.x+stepX*stepSpeed*monsterFrameScale, ny=m.y+stepY*stepSpeed*monsterFrameScale;
    if(!monsterBlockedAt(nx,m.y)) m.x=nx;
    if(!monsterBlockedAt(m.x,ny)) m.y=ny;
  }
  for(const [a,b] of toResolve) resolveClash(a,b);

  // [2026-09-18 습격 라운드] 이 화면에 있던 습격대가 이번 프레임에 전멸했으면
  // (경비병 조우전으로 정리됐든, 아래 checkPackEncounter에서 플레이어가 직접
  // 처치했든) 정해진 판정 시각(resolveAt)까지 기다리지 않고 바로 확정한다.
  if(screen.node.kind==='location' && isRaidVulnerable(screen.node.loc)){
    const hasRaidersNow = packs.some(p=>p.isRaider);
    if(screen._hadRaiders && !hasRaidersNow) finalizeLiveRaidDefense(screen.node.loc.id);
    screen._hadRaiders = hasRaidersNow;
  }
}

let toastTimer=null;
function showFieldToast(msg){
  const t = document.getElementById('tf-field-toast'); if(!t) return;
  t.textContent = msg; t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(-6px)'; }, 3000);
}

// [10번 후속 라운드] 정착지 화면이면 번영도/평판/교역로 상태를 한 줄로
// 보여준다 — 요구사항 "player can actually see this state at a glance".
// SETTLEMENT_TYPES(성벽·경비병이 있는 장소)에만 표시 — 던전/황야 등은
// 이 시스템의 대상이 아니라서 굳이 기본값(번영 50)을 보여주지 않는다.
function _fmtLocEconLine(z){
  if(!z || !SETTLEMENT_TYPES.has(z.type)) return '';
  const sum = getLocationEconomySummary(z.id); if(!sum) return '';
  const prosColor = sum.prosperity>=75?'#8fd06a':sum.prosperity>=50?'#c8a96e':sum.prosperity>=25?'#d0a060':'#c0503a';
  const repColor = sum.reputation>=50?'#8fd06a':sum.reputation>=15?'#c8a96e':sum.reputation>=-14?'#948a6f':'#c0503a';
  const routeBadge = sum.tradeRouteStatus==='disrupted' ? '<span style="color:#c0503a">🚧 교역로 차단</span>' : '<span style="color:#7aaa6a">🛣️ 교역로 정상</span>';
  return `<div style="display:flex;gap:12px;flex-wrap:wrap;font-size:9.5px;margin-bottom:6px">
    <span style="color:${prosColor}">📈 번영 ${sum.prosperity} (${esc(sum.prosLabel)})</span>
    <span style="color:${repColor}">🤝 평판 ${sum.reputation>0?'+':''}${sum.reputation} (${esc(sum.repLabel)})</span>
    ${routeBadge}
  </div>`;
}
function renderZonePanel(){
  const p = document.getElementById('tf-field-zonepanel'); if(!p) return;
  const z = RT.currentZone;
  if(!z){ p.style.display='none'; return; }
  p.style.display='block';
  p.innerHTML = `<div style="font-size:15px;font-weight:700;color:#e6cf82;margin-bottom:3px">${z.icon||'📍'} ${esc(z.name)}</div>
    <div style="font-family:monospace;font-size:9px;color:#948a6f;margin-bottom:5px;text-transform:uppercase">${esc(fmtLocMeta(z))}</div>
    ${_fmtLocEconLine(z)}
    <div style="color:#cabf9e;font-size:11px;max-width:620px;margin-bottom:8px">${esc(z.desc||'')}</div>
    <button onclick="settleAtFieldLoc()" style="padding:7px 16px;background:#cda746;border:none;color:#0b0906;font-size:11px;cursor:pointer;border-radius:1px">🏠 이 장소를 자세히 살펴보기(상점·상호작용)</button>`;
}
// 화면 하나 자체가 그 장소이므로, 이 화면에 들어온 시점에 이미
// saveCurrentLocation()으로 실제 게임 상태(현재 위치)를 갱신해뒀다(아래
// enterScreen 참고) — 이 버튼은 그 장소의 진짜 상점/상호작용 패널을
// 보고 싶을 때 필드를 나가는 깔끔한 통로 역할만 한다.
window.settleAtFieldLoc = function(){
  if(!RT || !RT.currentZone) return;
  exitFieldMode();
  if(typeof window.openP==='function') window.openP('location');
};

function showEncounterBattle(enemyUnits, onDone){
  RT.encounterActive = true;
  const wrap = document.getElementById('tf-field-encounter');
  wrap.style.display='flex';
  function refresh(bs, done){
    const sideHtml=(units,label)=>'<div style="flex:1;display:flex;flex-direction:column;gap:6px">'
      +`<div style="font-family:monospace;font-size:8.5px;letter-spacing:1px;color:#948a6f;text-transform:uppercase">${label}</div>`
      + units.map(u=>{
        const pct = Math.max(0, Math.round(u.hp/u.maxHp*100));
        const col = pct<=25?'#c0402a':pct<=55?'#c07a3a':'#8fc25a';
        return `<div style="display:flex;align-items:center;gap:6px;font-size:11px;opacity:${u.hp<=0?0.35:1}">
          <span style="width:16px;text-align:center">${u.icon||''}</span>
          <span style="width:98px;color:#e9dfc4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10px">${esc(u.name)}</span>
          <span style="flex:1;height:6px;background:#241d12;border-radius:1px;overflow:hidden"><span style="display:block;height:100%;width:${pct}%;background:${col}"></span></span>
        </div>`;
      }).join('') + '</div>';
    wrap.innerHTML = `<div style="width:min(520px,92vw);border:1px solid #b5502f;background:#14100a;padding:20px 22px;box-shadow:0 20px 50px rgba(0,0,0,.6)">
      <div style="font-family:monospace;font-size:9.5px;letter-spacing:1.5px;color:#b5502f;text-transform:uppercase;text-align:center;margin-bottom:10px">전투 — AI 없이 로컬 판정</div>
      <div style="display:flex;gap:18px;margin-bottom:14px">${sideHtml(bs.allies,'아군')}${sideHtml(bs.enemies,'적')}</div>
      <div id="tf-battle-log" style="height:150px;overflow-y:auto;background:#0a0805;border:1px solid #2a2416;padding:9px 11px;font-size:11.5px;line-height:1.7;color:#d8ceb0;margin-bottom:14px">
        ${bs.log.map(l=>`<div style="margin-bottom:3px;color:${({dominant:'#9fd06a',desperate:'#e0a878',critical:'#f0d060',comeback:'#8fd0d0',kill:'#c0503a',miss:'#7a7260',outcome:'#e6cf82'}[l.cat]||'#d8ceb0')}">${esc(l.text)}</div>`).join('')}
      </div>
      <button id="tf-battle-ok" ${done?'':'disabled'} onclick="closeFieldEncounter()" style="display:block;margin:0 auto;font-size:12px;color:#0b0906;background:${done?'#cda746':'#4a4030'};border:none;padding:9px 22px;border-radius:1px;cursor:${done?'pointer':'default'}">${done ? (bs.win?'승리 — 필드로 복귀':'패배 — 필드로 복귀') : '전투 진행 중…'}</button>
    </div>`;
    const logEl = document.getElementById('tf-battle-log'); if(logEl) logEl.scrollTop = logEl.scrollHeight;
  }
  setBattleUiRefresh(refresh);
  // [16번 라운드, 필드↔스토리 연결 #10 착수] 필드에서 무슨 일이 있었는지
  // 순수 관측용으로만 기록해둔다(전투 판정 로직 자체는 손 안 댐) —
  // exitFieldMode()가 이걸 읽어 대화로 돌아왔을 때 서술이 "방금 뭘 하고
  // 왔는지"를 반영하게 하기 위함.
  startFieldBattle(enemyUnits, (win)=>{
    if(RT){ RT.hadCombat = true; if(win) RT.combatWins = (RT.combatWins||0)+1; else RT.combatLosses = (RT.combatLosses||0)+1; }
    if(typeof onDone==='function') onDone(win);
  });
}
window.closeFieldEncounter = function(){
  const wrap = document.getElementById('tf-field-encounter');
  if(wrap){ wrap.style.display='none'; wrap.innerHTML=''; }
  clearBattleState();
  if(RT) RT.encounterActive = false;
};

function checkPackEncounter(){
  const { screen, player } = RT;
  const tc = currentTransportConfig();
  if(tc.encounterMult===0) return; // 비행 탑승물 — 지상 조우 완전 스킵
  for(const m of screen.packs){
    if(m.cooldown>0) continue;
    // [2026-09-18 습격 라운드] 경비병(isGuard)은 아군 — 플레이어와의 전투
    // 판정 대상에서 제외한다(습격대와의 조우전은 updateMonsters의 팩 대
    // 팩 충돌 로직이 별도로 처리한다).
    if(m.isGuard) continue;
    if(Math.hypot(m.x-player.x, m.y-player.y) <= player.r+6){
      // 탑승 수단별 안전도(encounterMult) — 낮을수록 그냥 지나칠 확률이 높다
      if(tc.encounterMult!=null && tc.encounterMult<1 && Math.random()>=tc.encounterMult){
        m.cooldown = 1200; // 잠깐 스쳐 지나감 — 바로 다음 프레임에 또 안 걸리게만
        continue;
      }
      if(m.fighting){
        const opp = m.fighting;
        m.cooldown=9000; opp.cooldown=9000; m.fighting=null; opp.fighting=null;
        showFieldToast('⚔️ '+m.name+' vs '+opp.name+' 사이에 난입했다 — 실제 게임에서는 여기서 삼파전 판정이 이어집니다');
        return;
      }
      const group = screen.packs.filter(o=>o!==m && o.packId===m.packId && o.cooldown<=0 && !o.fighting && Math.hypot(o.x-m.x,o.y-m.y)/TILE<=3);
      m.cooldown=9000; group.forEach(o=>o.cooldown=9000);
      const units = packToBattleUnits(m, group);
      // [2026-09-18 습격 라운드] 습격대(isRaider)와의 전투라면, 플레이어가
      // 직접 이겼을 때 그 습격대를 화면에서 지우고 습격을 즉시 "자력방어
      // 성공"으로 확정한다(정해진 판정 시각까지 기다리지 않음).
      const fightGroup = [m, ...group];
      const isRaidFight = !!m.isRaider && screen.node.kind==='location';
      const raidLocId = isRaidFight ? screen.node.loc.id : null;
      showEncounterBattle(units, isRaidFight ? (win)=>{
        if(win){
          screen.packs = screen.packs.filter(p=>!fightGroup.includes(p));
          // [10번 후속 라운드] bySelf:true — 플레이어가 직접 전투로 이
          // 습격대를 처치했으므로(경비병이 자동으로 정리한 게 아니라),
          // finalizeLiveRaidDefense가 번영도·평판을 더 크게 올린다.
          if(!screen.packs.some(p=>p.isRaider)) finalizeLiveRaidDefense(raidLocId, true);
        }
      } : undefined);
      return;
    }
  }
}

// ── 화면 전환(메이플스토리/DFO 식 포탈) ──
function exitLabel(screen, ex){
  const targetNode = RT.graph.nodes.get(ex.to);
  if(targetNode?.kind==='location') return targetNode.loc.name;
  if(ex.crossing==='water') return '물길';
  if(ex.crossing==='air-only') return '하늘길(비행 전용)';
  return '갈림길';
}
function enterScreen(nodeId, fromNodeId){
  const screen = buildScreen(RT.graph, nodeId);
  if(!screen) return;
  RT.screen = screen;
  RT.currentZone = screen.node.kind==='location' ? screen.node.loc : null;

  let sc = Math.floor(screen.COLS/2), sr = Math.floor(screen.ROWS/2);
  const ex = fromNodeId ? screen.exits.find(e=>e.to===fromNodeId) : null;
  if(ex){
    sc = ex.gc; sr = ex.gr;
    if(ex.edge==='N') sr+=3; else if(ex.edge==='S') sr-=3; else if(ex.edge==='W') sc+=3; else sc-=3;
  } else if(screen.markerPos){
    sc = screen.markerPos.c; sr = screen.markerPos.r;
  }
  RT.player.x = Math.max(TILE, Math.min(screen.COLS*TILE-TILE, sc*TILE+TILE/2));
  RT.player.y = Math.max(TILE, Math.min(screen.ROWS*TILE-TILE, sr*TILE+TILE/2));
  RT._prevNodeId = nodeId;
  // 화면이 바뀌면 궤적도 리셋 — 안 그러면 파티원이 이전 화면 쪽에서부터
  // 이어진 직선으로 순간이동하듯 보인다. 새 화면 진입 지점으로 다시 채워
  // 즉시 플레이어 옆에서 시작하게 한다.
  RT.partyTrail = new Array(240).fill({x:RT.player.x, y:RT.player.y});

  if(screen.node.kind==='location'){
    // 화면 하나 자체가 곧 그 장소다 — 실제로 여기 도착한 것으로 게임의
    // 현재 위치 상태를 갱신한다(기존 이동 시스템과 동일한 진짜 상태 변경).
    saveCurrentLocation(screen.node.loc);
    // [2026-09-18 습격 라운드] 지금 이 정착지가 습격을 받는 중이면 도착
    // 즉시 경고 — buildScreen()이 이미 syncRaidPacksForScreen으로 습격대를
    // 화면에 심어뒀으므로, 그 경고와 함께 실제로 화면 위에서 마주치게 된다.
    const raidRec = isRaidVulnerable(screen.node.loc) ? loadRaidState()[screen.node.loc.id] : null;
    if(raidRec && raidRec.state==='threatened'){
      showFieldToast(`🔥 ${screen.node.loc.name}이(가) 습격당하고 있다! 경비병들과 함께 막아내야 한다`);
      if(RT) RT.sawRaidThreat = true;
    } else {
      showFieldToast(`📍 ${screen.node.loc.name}`);
    }
    // [19번 라운드, [대기] #15 — 퀘스트 위치 표시, 새 시스템] misc/053이
    // 결정론적으로 골라둔(텍스트 추측 아님) 수락 의뢰의 실제 목표 장소와
    // 지금 도착한 화면이 같은 장소면, 도착 토스트에 이어서(16번 섹션과
    // 같은 겹침 방지 패턴 — 3.2초 지연) 알려준다. RT.currentQuestTargetHere는
    // renderFieldCanvas의 HUD가 매 프레임 참고한다.
    try{
      // [21번 라운드, 시스템 업그레이드 ④] AI 자유생성 퀘스트 쪽 목표
      // 장소도 같은 방식으로 합쳐서 확인한다 — misc/053(게시판)과
      // quest/141(AI 퀘스트) 둘 다 같은 모양({locationId,name,icon,
      // questTitle})을 돌려주므로 이어붙이기만 하면 된다.
      const targets = [
        ...((typeof window.getActiveBulletinQuestTargets==='function') ? window.getActiveBulletinQuestTargets() : []),
        ...((typeof window.getActiveAIQuestLocationTargets==='function') ? window.getActiveAIQuestLocationTargets() : []),
      ];
      const hit = targets.find(t=>t.locationId===screen.node.loc.id);
      RT.currentQuestTargetHere = hit || null;
      if(hit) setTimeout(()=>showFieldToast(`❗ 의뢰 목표 지점: ${hit.questTitle}`), 3200);
    }catch(e){ RT.currentQuestTargetHere = null; }
  } else {
    RT.currentQuestTargetHere = null; // 정착지 화면을 벗어났으니 HUD 표시도 같이 지운다
    const forkNote = screen.exits.length>=3 ? ' — 여러 갈래로 길이 나뉩니다' : '';
    showFieldToast((screen.biome==='mountain'?'⛰️ 산길':screen.biome==='forest'?'🌲 숲길':screen.isWaterScreen?'🌊 물길':'🌾 들길')+forkNote);
  }
  renderZonePanel();
  renderTransportStrip();
}
// [2026-09-18, 도로/이정표 라운드] 이정표에 가까이 다가가면(=상호작용) 그
// 방면 안내를 토스트로 한 번 더 띄운다 — 캔버스에 항상 그려지는 라벨과
// 별개로, "표지판을 실제로 읽었다"는 상호작용感을 준다. 같은 이정표에
// 머무는 동안 반복해서 뜨지 않게 마지막으로 보여준 표지판을 기억한다.
function checkSignpostProximity(){
  const { screen, player } = RT;
  if(!screen.signposts || !screen.signposts.length){ RT._lastSignpostShown = null; return; }
  for(const sp of screen.signposts){
    const d = Math.hypot(sp.c*TILE+TILE/2-player.x, sp.r*TILE+TILE/2-player.y);
    if(d <= TILE*1.5){
      if(RT._lastSignpostShown !== sp){ showFieldToast(`${sp.icon} ${sp.label}`); RT._lastSignpostShown = sp; }
      return;
    }
  }
  RT._lastSignpostShown = null;
}
function checkScreenTransition(){
  const { screen, player } = RT;
  const c = Math.floor(player.x/TILE), r = Math.floor(player.y/TILE);
  for(const ex of screen.exits){
    if(Math.abs(c-ex.gc)>2 || Math.abs(r-ex.gr)>2) continue;
    const atBorder = (ex.edge==='N'&&r<=1)||(ex.edge==='S'&&r>=screen.ROWS-2)||(ex.edge==='W'&&c<=1)||(ex.edge==='E'&&c>=screen.COLS-2);
    if(!atBorder) continue;
    const tc = currentTransportConfig();
    if(ex.crossing==='water' && !(tc.range==='water'||tc.range==='sea'||tc.isAir)){
      showFieldToast('🌊 이 길은 물을 건너야 합니다 — 선박이나 비행 탑승물이 필요합니다');
      return;
    }
    if(ex.crossing==='air-only' && !tc.isAir){
      showFieldToast('🏔️ 이 지름길은 하늘을 나는 탑승물만 지날 수 있습니다');
      return;
    }
    // [16번 라운드, [대기] #12] 지금 쫓기고 있는 채로 화면을 벗어나면,
    // 이 화면(캐시에 그대로 남음)에 "몇 시 몇 분에 추격받다 벗어났는지"를
    // 찍어둔다 — buildScreen()의 캐시 히트 분기가 이걸 보고 실제 경과
    // 시간에 따라 "아직 쫓고 있음"(그대로 둠, 다시 마주칠 수 있음)과
    // "포기함"(idle로 되돌림 + 안내)을 가른다.
    const stillChasing = screen.packs.filter(p=>p.state==='chasing' && !p.isGuard);
    if(stillChasing.length){
      screen._pursuerLeftAt = Date.now();
      screen._pursuerNames = stillChasing.map(p=>p.name);
    }
    enterScreen(ex.to, screen.nodeId);
    return;
  }
}

// ── 이동수단 전환 — 새 상태를 만들지 않고 실제 게임의 TRANSPORT_CONFIG와
//    S._activeTransport를 그대로 읽고 쓴다(travelByTransport와 같은 필드).
//    소유하지 않은 말/마차/선박은 그 자리에서 기존 임대료 공식
//    (getTransportRentalCost)을 그대로 재사용해 골드를 낸다 — 필드 전용
//    가격 체계를 새로 안 만듦. 그리핀/페가수스/와이번은 기존과 동일하게
//    보유(getOwnedSpecialMounts) 확인만 하고 임대료는 없다(원래 그럼).
const FIELD_TRANSPORT_OPTIONS = ['walk','horse_draft','horse','horse_war','horse_noble','carriage','boat','ship'];
window.switchFieldTransport = function(type){
  if(!RT) return;
  const tc = TRANSPORT_CONFIG[type]; if(!tc || tc.isTeleport) return;
  if(tc.isAir){
    const owned = (typeof window.getOwnedSpecialMounts==='function') ? window.getOwnedSpecialMounts() : [];
    if(!owned.includes(type)){ toast('아직 보유하지 않은 탑승물입니다', 2200); return; }
  } else {
    const owns = (typeof window.ownsPersonalMount==='function') && window.ownsPersonalMount(type);
    if(!owns){
      const cost = (typeof window.getTransportRentalCost==='function') ? window.getTransportRentalCost(type, RT.currentZone, RT.currentZone) : 0;
      if(cost>0){
        if((S.gold||0)<cost){ toast(`💰 ${tc.name} 임대료(${cost}G)가 부족합니다`, 2500); return; }
        S.gold -= cost;
        if(typeof window.saveGold==='function') window.saveGold(S.gold);
        if(typeof window.updateHeader==='function') window.updateHeader();
        toast(`💰 ${tc.name} 임대료 ${cost}G 지불`, 2000);
      }
    }
  }
  RT.transportType = type;
  S._activeTransport = type; // 실제 여행 시스템과 같은 필드에 그대로 기록
  if(typeof window.saveSession==='function') window.saveSession();
  showFieldToast(`${tc.icon} ${tc.name}(으)로 갈아탔습니다`);
  renderTransportStrip();
};
function renderTransportStrip(){
  const el = document.getElementById('tf-field-transport'); if(!el) return;
  // 실제 여행 시스템과 동일한 관례 — 탑승 수단은 "장소"에서만 바꾼다
  // (달리는 중간 화면에서 말을 갈아탈 수는 없음).
  if(!RT.currentZone){ el.style.display='none'; return; }
  el.style.display='flex';
  const owned = (typeof window.getOwnedSpecialMounts==='function') ? window.getOwnedSpecialMounts() : [];
  const options = [...FIELD_TRANSPORT_OPTIONS, ...['griffin','pegasus','wyvern'].filter(k=>owned.includes(k))];
  el.innerHTML = options.map(k=>{
    const tc = TRANSPORT_CONFIG[k]; const active = RT.transportType===k;
    return `<button onclick="switchFieldTransport('${k}')" title="${esc(tc.desc||'')}" style="padding:3px 7px;font-size:8.5px;border-radius:2px;cursor:pointer;white-space:nowrap;background:${active?(tc.color+'33'):'#0a0805'};border:1px solid ${active?tc.color:'#3a3020'};color:${active?tc.color:'#948a6f'}">${tc.icon} ${tc.name}</button>`;
  }).join('');
}

function fieldLoop(){
  if(!RT) return;
  const now = performance.now();
  const dt = Math.min(now-RT.lastTs, 100);
  RT.lastTs = now;
  const { screen, player } = RT;

  if(!RT.encounterActive){
    let dx=0, dy=0;
    if(RT.keys.has('arrowup')||RT.keys.has('w')) dy-=1;
    if(RT.keys.has('arrowdown')||RT.keys.has('s')) dy+=1;
    if(RT.keys.has('arrowleft')||RT.keys.has('a')) dx-=1;
    if(RT.keys.has('arrowright')||RT.keys.has('d')) dx+=1;
    if(!dx && !dy && (RT.touchDir.x||RT.touchDir.y)){ dx=RT.touchDir.x; dy=RT.touchDir.y; }
    if(dx||dy){
      const len=Math.hypot(dx,dy);
      const speed = FIELD_BASE_SPEED * Math.min(FIELD_MOUNT_SPEED_CAP, currentTransportConfig().speedMult||1);
      const frameScale = dt / REF_FRAME_MS; // dt(실측 ms) 기준으로 정규화 — 프레임레이트 무관 실제 초당 속도
      dx = dx/len*speed*frameScale; dy = dy/len*speed*frameScale;
      if(Math.abs(dx)>Math.abs(dy)) player.facing = dx>0?'right':'left'; else if(dy!==0) player.facing = dy>0?'down':'up';
      const nx=player.x+dx; if(canMoveTo(nx,player.y)) player.x=nx;
      const ny2=player.y+dy; if(canMoveTo(player.x,ny2)) player.y=ny2;
    }
    player.x = Math.max(TILE, Math.min(screen.COLS*TILE-TILE, player.x));
    player.y = Math.max(TILE, Math.min(screen.ROWS*TILE-TILE, player.y));
    checkScreenTransition();
    checkSignpostProximity();
  }
  if(RT){
    RT.partyTrail.push({x:player.x, y:player.y});
    if(RT.partyTrail.length>240) RT.partyTrail.shift();
  }

  if(RT.screen===screen){ // checkScreenTransition이 화면을 안 바꿨을 때만 이 화면 기준으로 계속 진행
    updateMonsters(dt);
    if(!RT.encounterActive) checkPackEncounter();
  }

  renderFieldCanvas();
  RT.raf = requestAnimationFrame(fieldLoop);
}

function renderFieldCanvas(){
  const { ctx, canvas, screen, player } = RT;
  const VIEW_W = canvas.width, VIEW_H = canvas.height;
  const worldW = screen.COLS*TILE, worldH = screen.ROWS*TILE;
  const camX = worldW<=VIEW_W ? -(VIEW_W-worldW)/2 : Math.max(0, Math.min(worldW-VIEW_W, player.x-VIEW_W/2));
  const camY = worldH<=VIEW_H ? -(VIEW_H-worldH)/2 : Math.max(0, Math.min(worldH-VIEW_H, player.y-VIEW_H/2));
  ctx.fillStyle='#050403'; ctx.fillRect(0,0,VIEW_W,VIEW_H);

  const c0=Math.max(0,Math.floor(camX/TILE)), c1=Math.min(screen.COLS-1,Math.ceil((camX+VIEW_W)/TILE));
  const r0=Math.max(0,Math.floor(camY/TILE)), r1=Math.min(screen.ROWS-1,Math.ceil((camY+VIEW_H)/TILE));
  for(let r=r0;r<=r1;r++) for(let c=c0;c<=c1;c++){
    const t = screen.grid[screen.idx(c,r)];
    ctx.fillStyle = FT_COLOR[t] || FT_COLOR[FT.GRASS];
    ctx.fillRect(c*TILE-camX, r*TILE-camY, TILE, TILE);
  }

  ctx.textAlign='center'; ctx.textBaseline='middle';

  // 장소 마커(화면 하나 = 그 장소 자체)
  if(screen.markerPos){
    const px = screen.markerPos.c*TILE-camX, py = screen.markerPos.r*TILE-camY;
    ctx.font='22px serif'; ctx.fillText(screen.node.loc.icon||'📍', px+TILE/2, py+TILE/2);
  }

  // 출구 — 어느 방향이 어디로 이어지는지, 지금 탄 수단으로 못 지나가면 빨갛게 표시
  const tc = currentTransportConfig();
  for(const ex of screen.exits){
    const px = ex.gc*TILE-camX, py = ex.gr*TILE-camY;
    if(px<-40||px>VIEW_W+40||py<-40||py>VIEW_H+40) continue;
    const locked = (ex.crossing==='water' && !(tc.range==='water'||tc.range==='sea'||tc.isAir)) || (ex.crossing==='air-only' && !tc.isAir);
    const arrow = {N:'⬆️',S:'⬇️',E:'➡️',W:'⬅️'}[ex.edge];
    ctx.font='16px serif'; ctx.fillText(arrow, px, py);
    ctx.font="8px 'Noto Serif KR',serif"; ctx.fillStyle = locked?'#8a4a3a':'#d8ceb0';
    const dy = ex.edge==='N'?14:ex.edge==='S'?-14:(ex.edge==='W'?0:0);
    const label = exitLabel(screen, ex) + (locked?' 🔒':'');
    ctx.fillText(label, px, py+dy+(ex.edge==='E'||ex.edge==='W'?14:0));
  }

  // [2026-09-18, 도로/이정표 라운드] 이정표 — 실제 목적지 이름을 그대로 보여준다
  // (지어낸 방향 이름이 아니라 그 도로가 진짜로 이어지는 정착지의 이름).
  for(const sp of (screen.signposts||[])){
    const px = sp.c*TILE-camX, py = sp.r*TILE-camY;
    if(px<-40||px>VIEW_W+40||py<-40||py>VIEW_H+40) continue;
    ctx.font='18px serif'; ctx.fillStyle='#e6cf82'; ctx.fillText(sp.icon, px, py-6);
    ctx.font="9px 'Noto Serif KR',serif"; ctx.fillStyle='#f0e6c8';
    ctx.fillText(sp.label, px, py+11);
  }

  for(const m of screen.packs){
    if(m.cooldown>0) continue;
    const px=m.x-camX, py=m.y-camY;
    if(px<-20||px>VIEW_W+20||py<-20||py>VIEW_H+20) continue;
    ctx.font='16px serif'; ctx.fillText(m.icon, px, py);
    if(m.state==='fighting'){ ctx.font='13px serif'; ctx.fillStyle='#e0c060'; ctx.fillText('⚔️', px, py-14); }
    else if(m.state==='chasing'){ ctx.font='bold 13px sans-serif'; ctx.fillStyle='#c0503a'; ctx.fillText('!', px, py-14); }
    else if(m.state==='fleeing'){ ctx.font='11px sans-serif'; ctx.fillStyle='#8fb0c8'; ctx.fillText('💨', px, py-14); }
    if(m.wounded){ ctx.font='10px serif'; ctx.fillText('🩸', px+9, py-8); }
  }

  // [16번 라운드, [대기] #13] 파티원 — 실제 전투 참가는 아직 안 함(아래
  // 이유로 손 안 댐), 화면에 실제로 동행하며 따라오는 것만 우선 구현.
  // startFieldBattle()의 resolveHit()가 "아군이 맞으면 무조건
  // S.stats.hp에 덮어쓴다"는 전제로 짜여 있어서, 파티원을 그대로
  // allies에 끼워넣으면 파티원이 맞았을 때 플레이어 실제 HP가 잘못
  // 깎이는 버그가 생긴다 — 이건 전투 엔진 쪽을 같이 고쳐야 하는 별도
  // 작업이라 이번엔 범위 밖으로 남긴다(작업메모장 참고).
  try{
    const party = (typeof loadParty==='function') ? (loadParty()||[]).filter(m=>m.alive!==false) : [];
    const trail = RT.partyTrail||[];
    party.slice(0,4).forEach((m,i)=>{
      const back = Math.min(trail.length-1, (i+1)*40);
      const pos = trail[trail.length-1-back] || trail[0];
      if(!pos) return;
      const fx=pos.x-camX, fy=pos.y-camY;
      if(fx<-20||fx>VIEW_W+20||fy<-20||fy>VIEW_H+20) return;
      ctx.font='15px serif'; ctx.fillText(m.icon||'🧑', fx, fy);
    });
  }catch(e){}

  const ppx=player.x-camX, ppy=player.y-camY;
  ctx.fillStyle = tc.isAir ? '#a0c8e0' : '#cda746';
  ctx.beginPath(); ctx.arc(ppx,ppy,player.r,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#3a2c08'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle='#3a2c08';
  const dir={down:[0,1],up:[0,-1],left:[-1,0],right:[1,0]}[player.facing];
  ctx.beginPath(); ctx.arc(ppx+dir[0]*3, ppy+dir[1]*3, 1.6, 0, Math.PI*2); ctx.fill();
  if(tc.icon && RT.transportType!=='walk'){ ctx.font='13px serif'; ctx.textAlign='left'; ctx.fillText(tc.icon, ppx+8, ppy-8); ctx.textAlign='center'; }

  const hud = document.getElementById('tf-field-hud');
  if(hud){
    const questTag = RT.currentQuestTargetHere ? ` · ❗의뢰 목표` : '';
    hud.textContent = `${tc.icon} ${tc.name} · HP ${Math.max(0,Math.round(S.stats?.hp||0))}/${getPlayerMaxHp()}${questTag}`;
  }
}

// ── 패널 렌더(진입점) ──
export function renderFieldPanel(){
  const body = document.getElementById('pb-fieldmove');
  if(!body) return;
  const continentKey = S._fieldModeContinent || loadCurrentLocation()?.continent || S._landMapSelectedContinent || 'central';
  const kingdomName = CONTINENT_PROPER_NAME_ICON[continentKey] || continentKey;
  body.innerHTML = `
    <div id="tf-field-wrap" style="position:relative;flex:1;min-height:0;display:flex;flex-direction:column">
      <div style="padding:6px 10px;background:#050a05;border-bottom:1px solid #1a2a14;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;gap:8px">
        <div style="font-size:9px;color:#7aaa6a;line-height:1.5">🎮 ${esc(kingdomName)} 실시간 필드 — <b>WASD</b>/방향키 또는 화면을 눌러 드래그로 이동 · 화면 가장자리 화살표로 다음 구역 이동(갈림길 있음) · <span style="color:#c0503a">!</span>=추격 · <span style="color:#8fb0c8">💨</span>=도주 · 🔒=지금 탄 이동수단으로는 못 건너는 길</div>
        <button onclick="exitFieldMode()" style="flex-shrink:0;padding:5px 12px;background:#150505;border:1px solid #6a2a2a;color:#e08080;font-size:9px;cursor:pointer;border-radius:2px">✕ 필드 나가기</button>
      </div>
      <div id="tf-field-transport" style="display:none;flex-wrap:wrap;gap:4px;padding:5px 10px;background:#0a0805;border-bottom:1px solid #1a1408;flex-shrink:0"></div>
      <div style="position:relative;flex:1;min-height:0;background:#050403;overflow:hidden">
        <canvas id="tf-field-canvas" style="display:block;width:100%;height:100%;touch-action:none;image-rendering:pixelated"></canvas>
        <div id="tf-field-joystick" style="position:absolute;width:92px;height:92px;margin-left:-46px;margin-top:-46px;border-radius:50%;background:rgba(233,223,196,.07);border:1px solid rgba(233,223,196,.28);display:none;pointer-events:none;z-index:5"><div class="knob" style="position:absolute;width:38px;height:38px;border-radius:50%;background:rgba(205,167,70,.5);border:1px solid rgba(230,207,130,.85);left:50%;top:50%;transform:translate(-50%,-50%)"></div></div>
        <div id="tf-field-hud" style="position:absolute;top:8px;right:10px;font-family:monospace;font-size:10px;color:#948a6f;background:rgba(11,9,6,.6);padding:4px 8px;border-radius:2px"></div>
        <div id="tf-field-toast" style="position:absolute;top:10px;left:50%;transform:translateX(-50%) translateY(-6px);background:#14100a;border:1px solid #cda746;padding:8px 18px;font-size:12px;color:#e6cf82;border-radius:2px;opacity:0;transition:opacity .35s,transform .35s;pointer-events:none;white-space:nowrap;z-index:6"></div>
        <div id="tf-field-zonepanel" style="display:none;position:absolute;left:0;right:0;bottom:0;background:linear-gradient(transparent,#14100a 55%);padding:16px 18px 12px;z-index:4"></div>
        <div id="tf-field-encounter" style="display:none;position:absolute;inset:0;background:rgba(8,6,3,.86);align-items:center;justify-content:center;z-index:10"></div>
      </div>
    </div>`;
  requestAnimationFrame(()=>enterFieldMode(continentKey));
}
window.renderFieldPanel = renderFieldPanel;

// 검증/디버그 전용 훅 — 실제 게임플레이 경로에는 영향 없음. Playwright로
// "플레이어를 몬스터 팩 위로 강제 이동시켜 조우를 즉시 재현"하거나 "다음
// 화면으로 강제 전환" 같은 결정론적 검증을 하기 위해 내부 런타임 상태를
// 읽고 살짝 건드릴 수 있게 한다.
window.__tfFieldDebug = function(){
  if(!RT) return null;
  return {
    continentKey: RT.graph.continentKey,
    nodeId: RT.screen.nodeId,
    nodeKind: RT.screen.node.kind,
    locName: RT.screen.node.kind==='location' ? RT.screen.node.loc.name : null,
    exits: RT.screen.exits.map(e=>({ to:e.to, edge:e.edge, crossing:e.crossing, gc:e.gc, gr:e.gr })),
    playerTile: { c: Math.floor(RT.player.x/TILE), r: Math.floor(RT.player.y/TILE) },
    packCount: RT.screen.packs.length,
    transportType: RT.transportType,
    encounterActive: RT.encounterActive,
    totalNodesInGraph: RT.graph.nodes.size,
  };
};
// [2026-09-22, 24번 섹션 22-3 부수 발견 확증용] exitFieldMode()가 11개
// 왕국 중 4개에서 안 먹힌 원인이 hasUnresolvedFieldThreat()일 거라고
// "높은 확률의 추정"으로만 적혀 있던 걸 실측으로 확증하기 위한 훅.
// 판정 로직(hasUnresolvedFieldThreat) 자체는 그대로 호출만 하고,
// 그 판정이 참조하는 RT.screen.packs[].state를 그대로 노출한다 —
// 우회나 재구현 없음.
window.__tfFieldThreatDebug = function(){
  if(!RT || !RT.screen) return null;
  return {
    battleState: !!battleState,
    unresolved: hasUnresolvedFieldThreat(),
    packs: RT.screen.packs.map(p=>({ name:p.name, state:p.state, isGuard:!!p.isGuard, isRaider:!!p.isRaider })),
  };
};
// [2026-09-18 습격 라운드] onlyKind('raider'|'guard'|undefined)를 추가 —
// 습격 라운드 이후로는 성문 경비병도 screen.packs에 섞여 있어서(플레이어와
// 전투 판정은 안 되지만 배열 앞쪽을 차지) 기존처럼 "첫 번째 조우 가능
// 팩"만 집으면 습격대가 아니라 경비병을 고를 수 있다. 인자를 안 주면
// 기존 동작(가장 앞의 조우 가능 팩) 그대로 — 하위 호환.
window.__tfForcePackEncounter = function(onlyKind){
  if(!RT || !RT.screen.packs.length) return false;
  const pool = onlyKind==='raider' ? RT.screen.packs.filter(p=>p.isRaider)
    : onlyKind==='guard' ? RT.screen.packs.filter(p=>p.isGuard)
    : RT.screen.packs;
  const m = pool.find(p=>p.cooldown<=0 && !p.fighting) || pool[0];
  if(!m) return false;
  RT.player.x = m.x; RT.player.y = m.y;
  return { name: m.name, temperament: m.temperament, isRaider: !!m.isRaider, isGuard: !!m.isGuard };
};
window.__tfForceScreenTransition = function(exitIndex){
  if(!RT) return false;
  const ex = RT.screen.exits[exitIndex||0];
  if(!ex) return false;
  enterScreen(ex.to, RT.screen.nodeId);
  return { to: ex.to, kind: RT.screen.node.kind, name: RT.screen.node.kind==='location'?RT.screen.node.loc.name:null };
};
// [검증 전용] __tfForceScreenTransition은 게이팅(이동수단 접근 제한)을
// 우회해서 아무 상황이나 즉시 재현하기 위한 훅이라, "지금 탄 수단으로는
// 못 건넌다"는 실제 규칙 자체를 검증할 수 없다. 이 훅은 플레이어를 출구
// 타일 바로 앞으로 실제로 걸어 이동시킨 뒤, 진짜 이동 루프가 매 프레임
// 호출하는 checkScreenTransition()을 그대로 호출해서 실제 게이팅 로직을
// 있는 그대로 재현한다(우회 없음).
window.__tfDebugAttemptExit = function(exitIndex){
  if(!RT) return false;
  const ex = RT.screen.exits[exitIndex||0];
  if(!ex) return false;
  const before = RT.screen.nodeId;
  // 출구가 있는 변의 경계 타일 바로 위로 플레이어를 옮긴다
  let c=ex.gc, r=ex.gr;
  if(ex.edge==='N') r=1; else if(ex.edge==='S') r=RT.screen.ROWS-2; else if(ex.edge==='W') c=1; else c=RT.screen.COLS-2;
  RT.player.x = c*TILE+TILE/2; RT.player.y = r*TILE+TILE/2;
  checkScreenTransition();
  const after = RT ? RT.screen.nodeId : null;
  return { before, after, crossed: before!==after, crossing: ex.crossing, transportType: RT?RT.transportType:null };
};
// [검증 전용] 특정 노드로 즉시 점프(게이팅 우회) — 화면이 자동으로 계속
// 진행되는 실시간 루프 특성상, 여러 단계를 순서대로 검증할 때 기준
// 화면으로 돌아가 다시 시작하고 싶을 때 쓴다.
window.__tfDebugGotoNode = function(nodeId){
  if(!RT) return false;
  enterScreen(nodeId, null);
  return { nodeId: RT.screen.nodeId, kind: RT.screen.node.kind };
};

// ── [2026-09-18 습격 라운드, 검증 전용] ──────────────────────────────
// 습격 타이머는 실제 경과 시간(ms) 기준이라 자연 발생을 몇 분씩 기다리지
// 않고도 검증할 수 있어야 한다. 아래 세 훅은 실제 판정 함수
// (advanceRaidIfDue/syncRaidPacksForScreen)를 그대로 호출해서 상태만
// 강제로 앞당길 뿐, 판정 로직 자체를 우회하지 않는다.
window.__tfDebugForceRaidStart = function(locId){
  const st = loadRaidState();
  const now = Date.now();
  st[locId] = { state:'threatened', threatenedAt:now, resolveAt:now+RAID_THREAT_MS, raiderCount:3, nextEligibleAt:now };
  saveRaidState(st);
  if(RT && RT.screen && RT.screen.node.kind==='location' && RT.screen.node.loc?.id===locId){
    syncRaidPacksForScreen(RT.screen, RT.screen.node.loc);
  }
  return st[locId];
};
window.__tfDebugForceRaidResolve = function(locId){
  const locs = (typeof getAllLandLocations==='function') ? getAllLandLocations() : [];
  const loc = locs.find(l=>l.id===locId);
  if(!loc) return false;
  const st = loadRaidState();
  const rec = st[locId];
  if(!rec) return false;
  rec.resolveAt = Date.now()-1; // 판정 시각을 과거로 당겨서 다음 advanceRaidIfDue 호출에서 즉시 판정되게 한다
  saveRaidState(st);
  const ev = advanceRaidIfDue(loc, st, Date.now());
  saveRaidState(st);
  return ev;
};
window.__tfDebugRaidState = function(locId){ return loadRaidState()[locId] || null; };

// [16번 라운드, [대기] #12 검증 전용] 위 습격 디버그 훅과 같은 관례 —
// 판정 로직 자체는 그대로 두고 "시각만 앞당겨서" 실제 경과 시간 조건을
// 재현한다(우회 없음). 공격적 몬스터가 실제로 플레이어를 감지해
// 자연스럽게 chasing 상태가 될 때까지 기다리는 건 화면마다 배치가
// 달라 결정론적 재현이 어려워, 첫 팩을 강제로 chasing으로 만드는 것만
// 디버그 전용으로 허용한다.
window.__tfDebugForcePursuerChase = function(){
  if(!RT || !RT.screen) return false;
  const m = RT.screen.packs.find(p=>!p.isGuard);
  if(!m) return false;
  m.state = 'chasing';
  return { name: m.name };
};
// [19번 라운드, [대기] #10 나머지 검증 전용] 위 강제-추격 훅의 반대 —
// exitFieldMode()의 "위협이 안 풀리면 못 나간다" 게이팅이 위협이 실제로
// 풀렸을 때는(정상적으로 idle로 돌아간 경우와 동일한 상태) 다시 나가기를
// 허용하는지 확인하기 위한 훅. hasUnresolvedFieldThreat() 자체는 안
// 건드리고, 그 판정이 보는 입력값(pack.state)만 정상적으로 idle이 되는
// 실제 경로(updateMonsters의 noticed=false 분기)와 동일한 값으로 되돌린다.
window.__tfDebugResolvePursuer = function(){
  if(!RT || !RT.screen) return false;
  const chasing = RT.screen.packs.filter(p=>p.state==='chasing' && !p.isGuard);
  chasing.forEach(p=>{ p.state='idle'; });
  return { resolved: chasing.map(p=>p.name) };
};
window.__tfDebugMarkPursuerLeft = function(msAgo){
  if(!RT || !RT.screen) return false;
  const stillChasing = RT.screen.packs.filter(p=>p.state==='chasing' && !p.isGuard);
  if(!stillChasing.length) return false;
  RT.screen._pursuerLeftAt = Date.now() - (msAgo||0);
  RT.screen._pursuerNames = stillChasing.map(p=>p.name);
  return { names: RT.screen._pursuerNames, leftAt: RT.screen._pursuerLeftAt };
};
