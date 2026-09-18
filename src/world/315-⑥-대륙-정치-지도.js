// ⑥ 🌐 대륙 정치 지도
// Auto-extracted from taleforge.html (original section banner preserved above).
import { getObserverModeVision } from '../misc/303-③-자동-모험-연대기-Living-Chronicle.js';
import { loadAILocations } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { loadDemesne } from '../race/260-수인족-패널-렌더.js';
import { esc } from '../utils.js';
import { loadCurrentLocation } from './052-동대륙-추가-장소-4.js';

export function renderPoliticalMapPanel(){
  const body = document.getElementById('pb-politicalmap');
  if(!body) return;

  // 필터 탭을 눌러 재렌더될 때 body.innerHTML로 지도 DOM이 통째로 다시
  // 만들어지기 전에, 사용자가 드래그해둔 스크롤 위치를 기억해뒀다가
  // 아래에서 복원한다(처음 여는 경우엔 이 요소가 아직 없어서 null →
  // 그때만 가운데로 맞춘다).
  const _prevPolScroll = document.getElementById('political-map-scroll');
  const _prevPolScrollPos = _prevPolScroll ? { left: _prevPolScroll.scrollLeft, top: _prevPolScroll.scrollTop } : null;

  // ── 장소 좌표 (viewBox 0 0 700 510) ──
  const LOC_COORDS = {
    'loc_capital':[347,251.4],'loc_magic_tower':[327.2,238.1],'loc_holy_city':[366.8,264.6],
    'loc_merchant_city':[342.1,269],'loc_central_colosseum':[356.9,244.8],'loc_central_underground':[334.6,258],
    'loc_central_royal_library':[352,235.9],'loc_central_crossroads':[347,277.9],'loc_central_riverside':[371.8,255.8],
    'loc_central_village_oakham':[332.2,273.5],'loc_central_hamlet_millstone':[361.9,282.3],'loc_central_noble_district':[354.5,240.3],
    'loc_hamlet':[349.5,126.6],'loc_garrison_town':[311.4,138.5],'loc_north_frozen_city':[380,130.5],
    'loc_north_mine':[334.3,150.4],'loc_north_monastery':[372.4,142.5],'loc_north_tundra_camp':[296.2,118.6],
    'loc_north_glacier_dungeon':[402.8,114.7],'loc_north_border_fortress':[319,166.3],'loc_north_fishing_town':[425.6,138.5],
    'loc_north_village_snowfall':[273.4,134.5],'loc_north_city_ironwall':[364.7,154.4],'loc_north_hamlet_deepwood':[311.4,122.6],
    'loc_dungeon_ruins':[307.8,343.8],'loc_fishing_village':[259.5,360.3],'loc_south_jungle_city':[356.2,335.5],
    'loc_south_desert_town':[291.7,356.2],'loc_south_ancient_temple':[332,368.6],'loc_south_swamp_village':[243.4,352.1],
    'loc_south_lost_city':[380.4,364.5],'loc_south_coastal_fortress':[267.6,372.8],'loc_south_city_solara':[340.1,347.9],
    'loc_south_village_fernwood':[307.8,372.8],'loc_south_town_sandgate':[283.7,339.6],'loc_south_hamlet_reefend':[372.3,376.9],
    'loc_border_village':[237,185.5],'loc_port_city':[216.3,203.8],'loc_west_pirate_port':[204.4,240.5],
    'loc_west_lighthouse':[192.7,167.3],'loc_west_sunken_ruins':[186.7,267.8],'loc_west_merchant_republic':[228.2,158.2],
    'loc_west_island_shrine':[180.8,139.9],'loc_west_ruin_town':[210.4,286.1],'loc_west_city_stormhaven':[225.1,222.2],
    'loc_west_village_cliffside':[198.5,185.5],'loc_west_town_crossport':[231.1,258.7],'loc_west_hamlet_tidepeak':[195.6,217.6],
    'loc_village':[428.2,270.9],'loc_battlefield':[440.8,293.4],'loc_academic_city':[421.8,248.4],
    'loc_east_capital':[447.1,282.1],'loc_east_forest_village':[462.9,248.4],'loc_east_cursed_ruins':[466.2,315.7],
    'loc_east_mountain_pass':[437.7,214.7],'loc_east_oracle_tower':[453.5,231.5],'loc_east_city_dawnmere':[431.3,304.6],
    'loc_east_village_maplewood':[469.3,282.1],'loc_east_town_harborlight':[447.1,327],'loc_east_hamlet_crestfall':[421.8,321.5],
    'loc_celestial_gate':[350,30],'loc_celestial_city':[320,15],'loc_celestial_trial_ground':[380,20],
    'loc_celestial_dungeon':[400,35],'loc_infernal_gate':[350,490],'loc_infernal_city':[320,500],
    'loc_infernal_throne':[380,498],'loc_infernal_dungeon':[400,492],
  };

  // 타입별 크기·색상
  const TYPE_STYLE = {
    capital: {r:10, fill:'#c8a040', stroke:'#e0c060', label:true},
    city:    {r:7,  fill:'#4080c0', stroke:'#60a0e0', label:true},
    town:    {r:5,  fill:'#50a050', stroke:'#70c070', label:true},
    village: {r:3,  fill:'#888060', stroke:'#aaa070', label:false},
    hamlet:  {r:2,  fill:'#605850', stroke:'#807870', label:false},
    special: {r:5,  fill:'#a050a0', stroke:'#c070c0', label:true},
    dungeon: {r:4,  fill:'#804040', stroke:'#c05050', label:false},
    event:   {r:4,  fill:'#c06020', stroke:'#e08030', label:false},
    port:    {r:6,  fill:'#3080a0', stroke:'#50a8c8', label:true},
    wilderness: {r:3, fill:'#6a8050', stroke:'#8aa070', label:false},
  };

  const allLocs = typeof window.getAllLocations === 'function' ? window.getAllLocations() : [];
  const curLoc  = typeof loadCurrentLocation === 'function' ? loadCurrentLocation() : null;
  const wsi     = typeof window._WSI_load === 'function' ? window._WSI_load() : {};
  const CTRL_COLORS = ['#5a5a5a','#4a8a4a','#4a6aaa','#a0a030','#c08020','#e0b840'];

  // 내 영지 좌표
  let demesneSVG = '';
  try {
    const d = typeof loadDemesne === 'function' ? loadDemesne() : null;
    if(d && d.established) {
      LOC_COORDS['loc_demesne'] = [350, 230]; // 수도 근처
      allLocs.push({ id:'loc_demesne', name:d.name, icon:'🏰', type:'capital', continent:'central' });
    }
  } catch(e) {}

  // 필터 상태 (탭)
  const filterId = 'wmap-filter';
  const curFilter = (document.getElementById(filterId) || {}).value || 'all';

  // ── AI 생성 장소에 동적 좌표 자동 배치 ──
  // continent 기반 구역 + 기존 장소와 겹치지 않게 배치
  (function assignAICoords(){
    const aiLocs = (typeof loadAILocations==='function') ? loadAILocations() : [];
    // [버그 수정] getAllLocations()의 정적 LOCATION_DATA 장소(우리가 추가한
    // 11개 종족 대표 도시 포함)는 이 루프가 loadAILocations()만 순회해서
    // 좌표 배정에서 누락되고 있었음 — 지도에 표시되지 않는 버그.
    // getAllLocations() 전체를 대상으로 좌표 누락 여부를 검사한다.
    const allStaticLocs = (typeof window.getAllLocations === 'function') ? window.getAllLocations() : [];
    const locsToPlace = [...aiLocs, ...allStaticLocs];
    // 대륙별 배치 구역 정의 (x범위, y범위)
    // 대륙 배치를 다시 짜면서(비대칭·타이트한 배치로) 이 배치 박스들도
    // 새 타원 위치에 맞춰 다시 계산했다(각 타원 안쪽으로 살짝 여유를 둔 값).
    const ZONES = {
      north:     { x:[267,433], y:[105.4,171.4] },
      south:     { x:[236,393], y:[325,387]  },
      west:      { x:[179,239], y:[151,275]  },
      east:      { x:[415.2,477.2], y:[213,340] },
      central:   { x:[302,398], y:[216,296]  },
      celestial: { x:[290,420], y:[10,42]   },
      infernal:  { x:[290,420], y:[480,510] },
      // 섬 3개(북동/북서/남동)를 각각 절반씩 겹치는 두 왕국으로 쪼갠
      // 뒤(보르네오/히스파니올라처럼 섬 하나에 나라 여럿) 박스도 반으로
      // 나누고, 새로 생긴 ...2 왕국 박스를 추가했다.
      // [8-12] 섬 6개에 실제 장소가 9개씩 채워지면서 예전 박스(폭·높이
      // 47~55)는 이 지도의 최소 배치 간격(MIN_DIST=26)조차 못 지킬 만큼
      // 좁아 마커가 한 점에 뭉쳐 보였다. 해안선 크기를 키운 것과 맞춰
      // 박스도 함께 넓혔다.
      northeast: { x:[487.3,546.3], y:[100.9,171.5] },
      northeast2:{ x:[548.9,607.9], y:[100.9,171.5] },
      northwest: { x:[127.9,186.9], y:[30.5,101.1]  },
      northwest2:{ x:[189.5,248.5], y:[30.5,101.1]  },
      southeast: { x:[402.1,461.1], y:[408.9,479.5] },
      southeast2:{ x:[463.7,522.7], y:[408.9,479.5] },
    };
    // [버그 수정] 예전엔 Math.random()으로 좌표를 뽑아서, 이 함수가
    // 화면을 열 때마다(렌더마다) 다시 불리는 탓에 같은 장소인데도
    // 지도를 열 때마다 위치가 계속 바뀌는 문제가 있었다(겹침 방지도
    // 15px 격자 칸 하나만 피하는 수준이라 실제로는 거의 붙어 보일
    // 정도로 헐거웠음). 이름을 해시한 결정론적 값으로 바꾸고, 황금각
    // 스파이럴(해바라기씨 배열처럼 구역 전체에 고르게 퍼지는 후보
    // 지점을 순서대로 만들어서 최소 간격을 만족하는 첫 자리를 쓰는
    // 방식)로 고쳤다 — 같은 장소는 항상 같은 자리에 나오고, 서로
    // 최소 간격도 보장되며, 장소가 많아져도(30개 이상) 한쪽으로만
    // 밀리지 않고 구역 전체에 고르게 퍼진다.
    function hashStrLocal(s){ let h=0; for(let i=0;i<s.length;i++){ h=((h<<5)-h+s.charCodeAt(i))|0; } return Math.abs(h); }
    const GOLDEN_ANGLE = 2.399963229728653;
    const PLACE_CANDIDATES = 150;
    const MIN_DIST = 26; // 이 지도의 viewBox 스케일(700x510) 기준 최소 간격
    function pickSpot(id, zone, placed){
      const h = hashStrLocal(id || '');
      const cx = (zone.x[0]+zone.x[1])/2, cy = (zone.y[0]+zone.y[1])/2;
      const rx = (zone.x[1]-zone.x[0])/2, ry = (zone.y[1]-zone.y[0])/2;
      const baseAngle = (h%360) * Math.PI/180;
      let best = null, bestMinD = -1;
      for(let k=0;k<PLACE_CANDIDATES;k++){
        const t = k/PLACE_CANDIDATES;
        const r = Math.sqrt(t) * 0.95;
        const angle = baseAngle + k*GOLDEN_ANGLE;
        const x = cx + Math.cos(angle)*rx*r;
        const y = cy + Math.sin(angle)*ry*r;
        if(placed.length===0) return { x: Math.round(x), y: Math.round(y) };
        let minD = Infinity;
        for(const p of placed){ const d = Math.hypot(p.x-x,p.y-y); if(d<minD) minD=d; }
        if(minD >= MIN_DIST) return { x: Math.round(x), y: Math.round(y) };
        if(minD > bestMinD){ bestMinD = minD; best = { x, y }; }
      }
      return { x: Math.round(best.x), y: Math.round(best.y) };
    }
    const placedPts = Object.values(LOC_COORDS).map(([x,y])=>({x,y}));
    locsToPlace
      .slice()
      .sort((a,b)=> hashStrLocal(a.id||a.name||'') - hashStrLocal(b.id||b.name||'')) // 항상 같은 순서로 배치해야 결과가 결정론적임
      .forEach(loc => {
        if(LOC_COORDS[loc.id]) return; // 이미 있으면 스킵
        const zone = ZONES[loc.continent] || ZONES.central;
        const p = pickSpot(loc.id || loc.name, zone, placedPts);
        LOC_COORDS[loc.id] = [p.x, p.y];
        placedPts.push(p);
      });
  })();

  // 필터 적용 (AI 생성 장소 포함 — LOC_COORDS 없으면 동적 배치됐으므로 항상 통과)
  const filteredLocs = allLocs.filter(l => {
    if(!LOC_COORDS[l.id]) return false; // 동적 배치 후에도 없으면 건너뜀
    if(l.continent === 'celestial' || l.continent === 'infernal') return false;
    if(curFilter === 'all') return true;
    if(curFilter === 'city') return ['capital','city','town','port'].includes(l.type);
    if(curFilter === 'dungeon') return ['dungeon','ruins','event','dungeon_ruins'].includes(l.type);
    if(curFilter === 'special') return l.type === 'special';
    if(curFilter === 'ai') return !!l.aiGenerated; // AI 생성 전용 필터
    if(curFilter === 'mine') return wsi[l.id] && wsi[l.id].controlLevel >= 1;
    return true;
  });

  // SVG 마커 생성
  function makeMarker(loc) {
    if(!LOC_COORDS[loc.id]) return '';
    const [x,y] = LOC_COORDS[loc.id];
    const ts = TYPE_STYLE[loc.type] || TYPE_STYLE.village;
    const isCur = curLoc && curLoc.id === loc.id;
    const ws = wsi[loc.id];
    const ctrl = ws ? ws.controlLevel : 0;
    const ctrlColor = ctrl > 0 ? CTRL_COLORS[ctrl] : null;
    const r = ts.r + (isCur ? 2 : 0);

    let marker = '';
    // 지배 링
    if(ctrlColor && ctrl > 0) {
      marker += `<circle cx="${x}" cy="${y}" r="${r+4}" fill="none" stroke="${ctrlColor}" stroke-width="${ctrl>=3?2:1}" opacity="0.8" stroke-dasharray="${ctrl>=3?'none':'3,2'}"/>`;
    }
    // 현재 위치 펄스
    if(isCur) {
      marker += `<circle cx="${x}" cy="${y}" r="${r+6}" fill="none" stroke="#60d060" stroke-width="1.5" opacity="0.5">
        <animate attributeName="r" values="${r+4};${r+8};${r+4}" dur="1.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" repeatCount="indefinite"/>
      </circle>`;
    }
    // 메인 마커
    const fillColor = isCur ? '#60d060' : (ctrlColor || ts.fill);
    const strokeColor = isCur ? '#80ff80' : ts.stroke;
    // 도트 아이콘 매니페스트에서 이 장소의 실제 그림을 찾는다. 평면
    // 색 점 대신 그 그림을 원형으로 잘라 밑에 깔고, 기존 타입별 테두리
    // 모양(수도=다이아몬드 등)·색상은 반투명하게 그대로 위에 얹어서
    // 클릭 판정과 "무슨 종류인지" 구분은 안 바뀐다.
    // [8-18] 예전엔 r>=5(마을 town·수도·도시·항구·특수만 해당)여야
    // 도트 그림을 찾았는데, 이 지도의 마커 반지름(TYPE_STYLE)은
    // economy/255처럼 줌 배율로 커지는 값이 아니라 처음부터 작은 고정
    // 값이라 마을(3)·오두막(2)·던전(4)·이벤트(4)·황무지(3) — 전체
    // 장소 유형 10개 중 5개, 특히 개수가 가장 많은 던전류가 전부
    // 문턱을 못 넘어 제외되고 있었다("정치 지도는 왜 아직도 아이콘만
    // 보이냐"는 지적의 원인). economy/255 쪽 지도는 이미 매 마커가
    // 도트 그림을 찾을 수 있게 돼 있었는데 이 지도만 빠져 있었던
    // 것 — 문턱을 없애고, 그림이 너무 작아 안 보이지 않도록 최소
    // 반지름(3.2)을 보장한다.
    const manifestHit = (typeof window!=='undefined' && window.PIXEL_ART_MANIFEST)
      ? (window.PIXEL_ART_MANIFEST.byId[loc.id] || (loc.name && window.PIXEL_ART_MANIFEST.byName[loc.name]))
      : null;
    const effR = Math.max(r, 3.2);
    if(manifestHit){
      const iconR = effR * 1.35;
      const clipId = 'wmclip-' + esc(loc.id).replace(/[^a-zA-Z0-9_-]/g,'');
      marker += `<clipPath id="${clipId}"><circle cx="${x}" cy="${y}" r="${iconR}"/></clipPath>
        <image href="assets/${manifestHit.path}" x="${x-iconR}" y="${y-iconR}" width="${iconR*2}" height="${iconR*2}" clip-path="url(#${clipId})" style="image-rendering:pixelated" pointer-events="none"/>`;
    }
    // [8-19] "마커에 SVG 아이콘 왜 남아있냐" — 수도=다이아몬드,
    // 던전=회전 사각형처럼 유형마다 다른 도형을 손으로 그려 넣은
    // 것도 결국 SVG 그림이라 없앴다. 도트 그림이 있으면 그림이 테두리
    // 원 안에서 그대로 보이게(채움 없이 얇은 링만), 없으면 단순 색점
    // 하나로 통일한다 — 클릭 판정(`wmap-loc`/`data-id`)은 그대로 원에
    // 실어서 기능은 안 바뀐다. 클릭 원 반지름도 도트 그림 크기(effR)에
    // 맞춰서 이미지보다 클릭 영역이 작아지는 일이 없게 한다.
    // [8-20] "링도 정신사나워" — 도트 그림 둘레의 색 테두리 링도 뺐다.
    // 클릭 영역은 fill이 안 보여도(투명) pointer-events:all로 강제
    // 유지해서, 그림이 있는 마커도 여전히 원 전체 어디를 눌러도 반응한다.
    const fillOpacity = manifestHit ? '00' : (loc.type==='capital'||['dungeon','ruins'].includes(loc.type) ? '44' : '66');
    const clickR = manifestHit ? effR*1.35 : r;
    marker += `<circle cx="${x}" cy="${y}" r="${clickR}" fill="${fillColor}${fillOpacity}" stroke="${manifestHit?'none':strokeColor}" stroke-width="${manifestHit?0:(isCur?2:1)}" class="wmap-loc" data-id="${loc.id}" style="cursor:pointer;pointer-events:all"/>`;
    // 레이블
    if(ts.label || isCur) {
      const shortName = loc.name.replace(/^(왕도|교역\s도시|항구\s대도시|빙결\s도시|성도|학문\s도시|요새\s도시|상인\s공화국|밀림\s도시|황금\s도시|동대륙\s왕도|새벽\s도시|항구\s대도시|북방\s방벽\s도시|폭풍\s도시|강변\s도시)\s?/, '');
      const aiTag = loc.aiGenerated ? ' ✦' : '';
      marker += `<text x="${x}" y="${y + r + 9}" text-anchor="middle" font-size="6.5" fill="${loc.aiGenerated?'#c0c0ff':isCur?'#80ff80':strokeColor}" font-family="Cinzel,serif" pointer-events="none" style="text-shadow:0 0 3px #000">${shortName.slice(0,8)+aiTag}</text>`;
    }
    return marker;
  }

  // 대륙 배경 지형
  // [8-17] "땅·바다 도트가 뭐야, 진짜 못 만들었다" — terrain-tile-*.png는
  // 지형 텍스처가 아니라 집·성 모양의 작은 장식 아이콘이라, 바닥에 반복
  // 타일로 깔면(불투명도를 낮춰도) 실제 장소 마커와 헷갈리기만 하고
  // 안 어울렸다. "땅 도트를 배경으로, 도시·마을 도트는 레이어로"라는
  // 지적대로 배경은 평평한 단색으로 되돌리고, 도시·마을은 이미 있는
  // 장소 마커 레이어(마커 렌더링 부분, 필요하면 실제 도트 스프라이트
  // 까지 표시)가 전담한다 — 배경에는 더 이상 엉뚱한 장식 아이콘을
  // 얹지 않는다.
  const continentBg = `
    <!-- 바다 배경 -->
    <rect width="700" height="510" fill="#04080f"/>
    <!-- 8개는 전부 "따로 떨어진 진짜 대륙"이다(하나로 합친 이전 라운드는
         "대륙은 대륙으로 남겨두라"는 피드백으로 되돌림). 각 대륙 해안선은
         economy/255의 무역 지도와 같은 절차적 생성기로 만들어서 모양이
         자연스럽다. -->
    <path d="M 412.7 251.4 Q 418.4 255.8 416.5 260.8 Q 414.6 265.8 414.6 271.2 Q 414.6 276.5 418.2 284.5 Q 421.7 292.5 419.0 299.2 Q 416.3 305.8 410.2 310.6 Q 404.2 315.3 393.4 312.9 Q 382.7 310.5 376.3 312.8 Q 370.0 315.0 362.8 312.0 Q 355.5 308.9 350.1 304.0 Q 344.6 299.0 341.6 293.2 Q 338.6 287.3 335.1 286.3 Q 331.7 285.2 328.2 284.0 Q 324.6 282.9 321.1 281.3 Q 317.6 279.7 311.2 279.1 Q 304.9 278.5 300.0 275.8 Q 295.0 273.1 281.5 270.7 Q 268.0 268.3 263.7 262.1 Q 259.4 255.8 260.7 249.1 Q 262.0 242.4 263.7 235.7 Q 265.4 229.0 268.6 222.6 Q 271.7 216.3 276.8 210.7 Q 281.9 205.2 292.7 205.5 Q 303.5 205.8 312.4 207.5 Q 321.2 209.1 328.5 212.6 Q 335.7 216.1 339.8 211.2 Q 343.9 206.4 349.3 208.4 Q 354.6 210.4 359.1 212.8 Q 363.6 215.2 369.0 215.0 Q 374.3 214.8 380.2 215.4 Q 386.1 216.0 391.8 218.0 Q 397.4 219.9 395.0 226.9 Q 392.7 233.8 396.7 236.7 Q 400.8 239.5 403.9 243.2 Q 407.0 247.0 412.7 251.4 Z" fill="#0d1a08" stroke="#3a5a28" stroke-width="0.5" opacity="0.75"/>
    <text x="349.5" y="222" text-anchor="middle" font-size="9" fill="#7aaa6a" font-family="Cinzel,serif" opacity="0.9">알테라 왕국</text>
    <!-- 아이스크라운 왕국(북) — north는 central과 거의 맞닿아 있다 -->
    <path d="M 501.5 132.8 Q 500.0 138.5 501.8 144.2 Q 503.6 149.9 493.1 154.4 Q 482.6 158.9 465.2 160.8 Q 447.9 162.6 444.2 167.0 Q 440.5 171.3 431.2 173.9 Q 421.9 176.5 406.6 174.1 Q 391.2 171.6 382.0 171.3 Q 372.8 170.9 365.3 172.6 Q 357.9 174.2 348.9 176.7 Q 340.0 179.2 330.0 179.3 Q 320.1 179.4 315.3 174.5 Q 310.5 169.5 302.6 168.4 Q 294.6 167.3 280.2 168.0 Q 265.7 168.7 263.4 164.4 Q 261.2 160.1 262.8 155.8 Q 264.4 151.5 258.3 148.6 Q 252.2 145.7 243.4 142.1 Q 234.7 138.5 225.4 133.6 Q 216.0 128.6 220.2 124.0 Q 224.3 119.3 232.8 115.6 Q 241.3 112.0 239.5 105.1 Q 237.8 98.2 246.5 93.6 Q 255.2 89.1 274.0 91.3 Q 292.9 93.5 306.7 95.8 Q 320.5 98.1 330.7 100.1 Q 341.0 102.1 349.2 103.5 Q 357.4 104.8 363.8 107.3 Q 370.2 109.8 375.1 112.0 Q 380.0 114.2 385.4 115.6 Q 390.7 116.9 406.5 114.6 Q 422.3 112.2 432.6 113.9 Q 443.0 115.6 456.4 117.8 Q 469.8 120.1 486.4 123.6 Q 503.0 127.1 501.5 132.8 Z" fill="#0a1218" stroke="#3a6a7a" stroke-width="0.5" opacity="0.75"/>
    <text x="349.5" y="91.4" text-anchor="middle" font-size="8" fill="#6ab0c0" font-family="Cinzel,serif" opacity="0.9">아이스크라운 왕국</text>
    <!-- 케메트 왕국(남) — south도 central과 거의 맞닿아 있다 -->
    <path d="M 436.9 351.5 Q 432.2 356.2 420.9 359.7 Q 409.6 363.2 402.6 366.0 Q 395.6 368.7 393.5 371.9 Q 391.4 375.1 384.9 377.2 Q 378.3 379.3 374.5 382.5 Q 370.6 385.7 361.6 386.1 Q 352.5 386.5 347.4 390.9 Q 342.4 395.2 333.6 398.2 Q 324.8 401.1 313.4 405.1 Q 301.9 409.1 289.5 408.5 Q 277.1 407.9 268.8 403.4 Q 260.5 398.9 255.5 394.3 Q 250.4 389.6 250.5 384.4 Q 250.6 379.1 240.5 378.0 Q 230.3 376.8 225.8 373.6 Q 221.2 370.5 214.7 367.2 Q 208.3 364.0 213.4 360.1 Q 218.6 356.2 219.6 352.7 Q 220.7 349.3 215.5 344.8 Q 210.4 340.3 208.7 335.1 Q 207.0 329.9 208.8 324.4 Q 210.6 318.8 225.1 317.9 Q 239.6 317.1 251.7 316.6 Q 263.7 316.0 276.8 319.1 Q 289.8 322.2 297.9 321.4 Q 306.0 320.7 314.2 321.2 Q 322.4 321.6 330.7 321.8 Q 338.9 322.0 346.8 323.0 Q 354.7 324.1 361.2 326.2 Q 367.7 328.2 381.0 327.8 Q 394.3 327.4 404.8 329.4 Q 415.4 331.5 430.0 333.8 Q 444.7 336.2 443.2 341.5 Q 441.6 346.8 436.9 351.5 Z" fill="#181208" stroke="#8a6a20" stroke-width="0.5" opacity="0.75"/>
    <text x="314.3" y="418.9" text-anchor="middle" font-size="8" fill="#d0a838" font-family="Cinzel,serif" opacity="0.9">케메트 왕국</text>
    <!-- 증기 연방(서) — 바다 건너 떨어진 대륙 -->
    <path d="M 246.0 206.1 Q 246.7 213.0 247.0 220.3 Q 247.3 227.6 251.2 238.5 Q 255.1 249.4 253.7 258.6 Q 252.4 267.8 249.9 276.1 Q 247.4 284.4 241.4 284.2 Q 235.4 284.0 229.8 279.5 Q 224.3 275.0 221.3 276.9 Q 218.3 278.7 215.2 277.9 Q 212.1 277.0 208.9 283.2 Q 205.7 289.4 202.5 286.9 Q 199.3 284.3 196.3 281.4 Q 193.3 278.5 189.2 278.5 Q 185.1 278.4 181.3 275.4 Q 177.4 272.3 170.8 271.2 Q 164.1 270.2 162.8 260.5 Q 161.5 250.8 162.6 240.6 Q 163.6 230.4 167.3 221.7 Q 170.9 213.0 175.1 207.3 Q 179.3 201.6 178.3 194.6 Q 177.3 187.7 178.9 182.2 Q 180.5 176.7 181.0 168.9 Q 181.4 161.2 184.3 157.2 Q 187.2 153.3 190.1 150.0 Q 193.1 146.7 194.7 133.7 Q 196.4 120.8 200.3 112.2 Q 204.3 103.7 209.4 100.1 Q 214.5 96.6 219.6 99.2 Q 224.7 101.7 227.2 115.1 Q 229.7 128.5 230.8 139.9 Q 231.9 151.4 231.6 161.6 Q 231.3 171.8 235.6 173.0 Q 239.9 174.1 241.1 180.4 Q 242.3 186.8 243.7 193.0 Q 245.2 199.2 246.0 206.1 Z" fill="#2a1c10" stroke="#8a5a2a" stroke-width="0.5" opacity="0.75"/>
    <text x="209.2" y="123.8" text-anchor="middle" font-size="8" fill="#c88a48" font-family="Cinzel,serif" opacity="0.9">증기 연방</text>
    <!-- 용염 제국(동) — east는 central과 실제로 맞닿아 있다(한 땅덩어리) -->
    <path d="M 495.9 266.2 Q 492.2 276.5 486.0 283.0 Q 479.9 289.5 479.4 296.1 Q 479.0 302.7 475.4 306.0 Q 471.8 309.3 468.3 310.5 Q 464.8 311.7 463.9 317.2 Q 463.0 322.8 462.6 333.2 Q 462.3 343.7 461.3 362.0 Q 460.3 380.3 455.7 385.2 Q 451.1 390.1 445.8 392.0 Q 440.6 393.9 435.2 392.7 Q 429.9 391.5 425.7 383.9 Q 421.6 376.3 420.1 363.2 Q 418.7 350.1 421.5 333.4 Q 424.4 316.6 423.6 311.2 Q 422.8 305.7 420.3 302.3 Q 417.7 298.8 417.0 293.3 Q 416.2 287.8 414.1 282.2 Q 411.9 276.5 410.1 269.3 Q 408.3 262.1 402.0 249.4 Q 395.6 236.7 396.0 225.3 Q 396.4 213.8 401.5 208.5 Q 406.6 203.2 411.3 199.5 Q 416.1 195.8 421.2 196.0 Q 426.3 196.2 430.3 194.8 Q 434.3 193.4 438.8 205.5 Q 443.2 217.7 445.7 221.1 Q 448.3 224.5 450.9 222.8 Q 453.6 221.2 457.5 216.9 Q 461.5 212.6 466.7 209.2 Q 472.0 205.8 474.9 211.5 Q 477.7 217.2 484.2 218.5 Q 490.7 219.9 495.6 226.6 Q 500.5 233.3 500.1 244.6 Q 499.7 256.0 495.9 266.2 Z" fill="#182410" stroke="#4a6a2a" stroke-width="0.5" opacity="0.75"/>
    <text x="445.9" y="170.8" text-anchor="middle" font-size="8" fill="#7aaa48" font-family="Cinzel,serif" opacity="0.9">용염 제국</text>
    <!-- [8-10] 본토 5개 왕국(알테라·아이스크라운·케메트·용염·증기 연방)이
         사실 한 대륙(아르카디아 대륙)이라는 걸 보여주는 큰 라벨.
         왕국 이름은 각자 표시되니, 이건 "이 5개가 모여 대륙 하나"라는
         걸 한눈에 알려주는 용도(economy/255 월드맵과 같은 처리). -->
    <!-- [8-10] 대륙 그룹 라벨 — 여러 왕국이 사실 한 대륙이라는 걸 보여줌 -->
    <text x="328" y="80" text-anchor="middle" font-size="15" fill="#c8a96e" font-family="Cinzel,serif" font-weight="bold" letter-spacing="1.5" opacity="0.5" pointer-events="none">아르카디아 대륙</text>
    <text x="516.8" y="55.9" text-anchor="middle" font-size="9" fill="#8a7ac0" font-family="Cinzel,serif" font-weight="bold" opacity="0.45" pointer-events="none">월림 군도</text>
    <text x="157.4" y="11.5" text-anchor="middle" font-size="9" fill="#c08a48" font-family="Cinzel,serif" font-weight="bold" opacity="0.45" pointer-events="none">철산 군도</text>
    <text x="431.6" y="526.5" text-anchor="middle" font-size="9" fill="#c05868" font-family="Cinzel,serif" font-weight="bold" opacity="0.45" pointer-events="none">남풍 군도</text>
    <!-- 달빛 숲(엘프령) -->
    <path d="M 547.1 133.2 Q 550.0 136.2 548.9 139.6 Q 547.8 143.0 548.0 146.7 Q 548.1 150.4 551.1 156.8 Q 554.1 163.2 552.3 167.6 Q 550.5 172.1 545.7 172.8 Q 540.9 173.5 536.9 173.8 Q 532.9 174.1 529.4 173.8 Q 525.9 173.6 522.9 174.1 Q 519.8 174.6 517.0 172.2 Q 514.1 169.7 512.5 165.2 Q 510.8 160.7 507.7 162.7 Q 504.6 164.7 499.8 167.3 Q 495.0 169.9 492.3 167.6 Q 489.6 165.2 487.0 162.4 Q 484.5 159.6 481.7 156.5 Q 478.9 153.4 476.5 149.4 Q 474.2 145.5 473.8 140.9 Q 473.4 136.2 478.5 132.6 Q 483.7 129.0 487.7 126.9 Q 491.7 124.9 491.3 121.2 Q 490.9 117.5 493.0 115.3 Q 495.1 113.1 498.2 112.6 Q 501.2 112.1 502.7 109.3 Q 504.1 106.5 505.8 102.1 Q 507.4 97.8 510.1 91.0 Q 512.7 84.3 517.0 81.8 Q 521.3 79.2 525.1 82.8 Q 528.9 86.3 532.7 88.1 Q 536.5 90.0 539.3 93.6 Q 542.0 97.2 541.6 103.7 Q 541.2 110.2 540.2 115.1 Q 539.3 119.9 539.6 122.8 Q 540.0 125.7 542.1 128.0 Q 544.3 130.2 547.1 133.2 Z" fill="#0a1408" stroke="#1a2814" stroke-width="0.5" opacity="0.75"/>
    <text x="516.8" y="91.9" text-anchor="middle" font-size="7" fill="#3a7a3a" font-family="Cinzel,serif" opacity="0.85">달빛 숲</text>
    <!-- 은월 왕정 — 달빛 숲과 섬 하나를 나눠 쓰는 새 왕국 -->
    <path d="M 605.1 133.6 Q 608.3 136.2 611.4 140.1 Q 614.5 144.1 613.8 148.0 Q 613.0 151.9 612.7 156.3 Q 612.4 160.8 611.0 165.1 Q 609.6 169.5 607.5 173.7 Q 605.4 178.0 602.5 181.8 Q 599.5 185.6 594.4 183.5 Q 589.4 181.3 585.3 176.4 Q 581.2 171.5 578.5 170.1 Q 575.8 168.8 573.6 166.9 Q 571.4 165.0 569.2 163.9 Q 567.1 162.7 564.4 162.3 Q 561.8 161.9 559.7 160.1 Q 557.7 158.2 553.0 158.1 Q 548.2 158.0 542.2 156.7 Q 536.1 155.3 534.7 150.7 Q 533.2 146.1 533.7 141.1 Q 534.3 136.2 536.7 131.9 Q 539.2 127.6 543.1 124.8 Q 547.0 122.0 548.8 119.1 Q 550.7 116.1 554.1 115.1 Q 557.6 114.1 561.6 115.2 Q 565.5 116.3 566.7 113.8 Q 567.8 111.4 569.1 107.4 Q 570.4 103.3 572.7 98.7 Q 575.1 94.1 578.7 89.8 Q 582.4 85.5 586.3 86.9 Q 590.1 88.3 593.6 90.3 Q 597.1 92.4 601.1 93.7 Q 605.0 95.0 606.3 100.1 Q 607.5 105.2 606.8 110.7 Q 606.1 116.1 604.8 120.5 Q 603.5 124.8 602.7 128.0 Q 601.8 131.1 605.1 133.6 Z" fill="#100c1e" stroke="#3a2a5a" stroke-width="0.5" opacity="0.75"/>
    <text x="578.4" y="91.9" text-anchor="middle" font-size="7" fill="#8a7ac0" font-family="Cinzel,serif" opacity="0.85">은월 왕정</text>
    <!-- 드워프 왕국 -->
    <path d="M 193.8 62.0 Q 195.8 65.8 198.2 70.5 Q 200.5 75.2 199.5 79.8 Q 198.6 84.4 195.2 87.6 Q 191.9 90.8 190.3 94.9 Q 188.7 99.1 183.6 98.7 Q 178.4 98.3 174.3 97.0 Q 170.1 95.7 167.4 95.6 Q 164.6 95.5 162.4 97.5 Q 160.1 99.5 157.1 103.0 Q 154.2 106.6 151.5 103.7 Q 148.9 100.9 145.9 100.2 Q 143.0 99.6 139.6 99.0 Q 136.3 98.4 133.0 96.9 Q 129.6 95.4 127.0 92.5 Q 124.5 89.6 124.7 85.1 Q 124.9 80.5 121.3 77.5 Q 117.7 74.5 116.7 70.1 Q 115.7 65.8 117.8 61.7 Q 120.0 57.6 124.2 55.2 Q 128.4 52.7 132.7 51.8 Q 136.9 51.0 137.0 47.6 Q 137.1 44.2 139.4 42.9 Q 141.7 41.6 143.3 38.9 Q 144.8 36.2 146.3 31.3 Q 147.8 26.5 150.6 20.7 Q 153.4 15.0 157.6 11.9 Q 161.9 8.8 165.8 12.3 Q 169.6 15.8 172.1 20.6 Q 174.6 25.5 175.7 30.7 Q 176.8 35.8 176.9 40.3 Q 177.1 44.9 177.0 48.3 Q 176.9 51.7 177.3 54.1 Q 177.8 56.6 184.8 57.4 Q 191.8 58.3 193.8 62.0 Z" fill="#100e0a" stroke="#241e16" stroke-width="0.5" opacity="0.75"/>
    <text x="157.4" y="21.5" text-anchor="middle" font-size="7" fill="#6a6a68" font-family="Cinzel,serif" opacity="0.85">드워프 왕국</text>
    <!-- 강철턱 부족 — 드워프 왕국과 섬 하나를 나눠 쓰는 새 왕국 -->
    <path d="M 246.8 62.5 Q 244.3 65.8 242.6 68.2 Q 241.0 70.6 243.8 74.5 Q 246.7 78.3 249.0 83.8 Q 251.4 89.2 249.8 93.0 Q 248.1 96.8 245.9 100.4 Q 243.6 103.9 239.5 104.0 Q 235.3 104.0 232.3 105.9 Q 229.2 107.8 226.0 110.1 Q 222.7 112.5 219.0 112.1 Q 215.4 111.8 211.7 111.1 Q 208.1 110.4 206.0 105.9 Q 203.9 101.3 201.2 99.3 Q 198.6 97.3 197.0 94.2 Q 195.3 91.0 194.4 87.6 Q 193.5 84.2 193.0 81.0 Q 192.4 77.8 194.1 74.3 Q 195.8 70.9 193.3 68.3 Q 190.9 65.8 188.0 62.1 Q 185.1 58.4 181.0 52.6 Q 177.0 46.8 177.2 41.2 Q 177.3 35.7 180.7 32.1 Q 184.0 28.5 189.3 28.2 Q 194.5 27.9 200.5 32.2 Q 206.5 36.4 209.6 38.3 Q 212.7 40.1 214.9 40.4 Q 217.0 40.7 219.0 40.1 Q 221.1 39.5 224.1 36.1 Q 227.0 32.8 230.5 31.8 Q 233.9 30.8 239.5 28.2 Q 245.0 25.6 249.9 26.6 Q 254.8 27.6 257.6 31.8 Q 260.3 35.9 260.0 41.6 Q 259.8 47.4 254.6 53.3 Q 249.4 59.2 246.8 62.5 Z" fill="#160e08" stroke="#5a3a18" stroke-width="0.5" opacity="0.75"/>
    <text x="219.0" y="21.5" text-anchor="middle" font-size="7" fill="#c08a48" font-family="Cinzel,serif" opacity="0.85">강철턱 부족</text>
    <!-- 해적 연합 -->
    <path d="M 475.0 439.3 Q 473.4 444.2 472.0 448.5 Q 470.6 452.7 464.9 454.7 Q 459.2 456.7 454.6 457.1 Q 450.0 457.5 448.7 459.3 Q 447.4 461.0 445.9 462.6 Q 444.5 464.1 444.4 469.2 Q 444.4 474.2 443.0 479.9 Q 441.7 485.6 438.4 487.0 Q 435.1 488.5 431.6 489.1 Q 428.0 489.7 424.2 489.9 Q 420.4 490.0 417.1 488.0 Q 413.8 486.0 410.5 484.0 Q 407.2 481.9 404.5 478.9 Q 401.8 475.9 401.3 471.2 Q 400.8 466.5 399.4 462.9 Q 398.1 459.4 395.0 456.1 Q 391.9 452.9 391.2 448.5 Q 390.6 444.2 392.4 440.1 Q 394.2 436.0 398.1 433.4 Q 401.9 430.8 407.7 430.9 Q 413.4 431.0 414.6 429.2 Q 415.8 427.4 417.1 425.6 Q 418.5 423.9 418.6 419.0 Q 418.8 414.1 420.4 409.7 Q 422.1 405.2 425.0 401.5 Q 427.9 397.8 431.6 398.0 Q 435.3 398.1 438.7 399.5 Q 442.1 400.9 446.1 400.9 Q 450.1 400.9 453.3 403.2 Q 456.5 405.6 458.1 410.0 Q 459.7 414.3 461.5 417.8 Q 463.4 421.2 466.4 424.2 Q 469.4 427.1 473.1 430.7 Q 476.7 434.4 475.0 439.3 Z" fill="#0a0c12" stroke="#3a7a8a" stroke-width="0.5" opacity="0.75"/>
    <text x="431.6" y="488.5" text-anchor="middle" font-size="7" fill="#3a7a8a" font-family="Cinzel,serif" opacity="0.85">해적 연합</text>
    <!-- 핏빛 깃발단 — 해적 연합과 섬 하나를 나눠 쓰는 새 왕국 -->
    <path d="M 519.5 441.5 Q 521.0 444.2 521.5 447.3 Q 522.0 450.5 522.7 454.2 Q 523.4 457.9 526.5 464.2 Q 529.7 470.6 529.5 476.6 Q 529.4 482.7 524.6 484.1 Q 519.8 485.4 515.3 485.3 Q 510.7 485.2 506.8 484.7 Q 503.0 484.3 499.5 482.2 Q 496.0 480.1 493.3 478.8 Q 490.6 477.6 488.4 475.2 Q 486.2 472.9 484.9 469.7 Q 483.7 466.6 480.4 467.8 Q 477.2 469.0 471.2 471.5 Q 465.3 473.9 461.4 472.0 Q 457.5 470.0 455.3 466.2 Q 453.1 462.3 451.7 458.0 Q 450.2 453.6 451.1 448.9 Q 452.0 444.2 453.1 439.9 Q 454.2 435.7 456.6 432.2 Q 459.1 428.8 465.0 428.5 Q 471.0 428.1 474.2 427.8 Q 477.4 427.4 477.8 424.2 Q 478.3 421.1 479.1 417.1 Q 479.9 413.1 481.4 407.2 Q 482.8 401.4 485.9 396.1 Q 489.0 390.8 493.2 390.6 Q 497.5 390.3 501.4 392.4 Q 505.3 394.5 509.9 394.3 Q 514.6 394.0 516.7 399.3 Q 518.8 404.6 517.5 412.1 Q 516.3 419.6 516.2 423.6 Q 516.1 427.6 516.8 430.4 Q 517.5 433.2 517.8 436.0 Q 518.1 438.8 519.5 441.5 Z" fill="#1a0608" stroke="#5a1820" stroke-width="0.5" opacity="0.75"/>
    <text x="493.2" y="488.5" text-anchor="middle" font-size="7" fill="#c05868" font-family="Cinzel,serif" opacity="0.85">핏빛 깃발단</text>
    <!-- 항로 — west(증기 연방)만 아직 바다로 떨어져 있어서 뱃길을 표시한다.
         north·south·east는 central과 실제로 맞닿아 있어(땅으로 연결)
         더는 항로가 필요 없다(로드로 이어짐, ROAD_EDGES 참고). -->
    <path d="M349.5 255.8 Q209.70000000000002 203 209.2 213" fill="none" stroke="#1a2010" stroke-width="0.8" stroke-dasharray="2,3" opacity="0.3"/>
  `;

  const markers = filteredLocs.map(makeMarker).join('');

  // 툴팁용 데이터 JSON
  const tooltipData = {};
  filteredLocs.forEach(l => {
    const ws = wsi[l.id];
    tooltipData[l.id] = {
      name: l.name,
      type: l.type,
      desc: (l.desc||'').slice(0,60),
      ctrl: ws ? ws.controlLevel : 0,
      pop:  ws ? ws.population : 0,
      pros: ws ? ws.prosperity : 0,
      def:  ws ? ws.defense : 0,
      ruler: ws ? ws.ruler : '알 수 없음',
    };
  });

  // 범례
  const legend = `
    <div style="display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px;background:#04080f;border-top:1px solid #1a2a10;flex-shrink:0">
      ${[
        {color:'#c8a040',label:'수도',shape:'◆'},
        {color:'#4080c0',label:'도시',shape:'●'},
        {color:'#50a050',label:'중소도시',shape:'●'},
        {color:'#888060',label:'마을',shape:'·'},
        {color:'#a050a0',label:'특수',shape:'●'},
        {color:'#804040',label:'던전',shape:'◈'},
        {color:'#60d060',label:'현재 위치',shape:'●'},
      ].map(l=>`<div style="display:flex;align-items:center;gap:3px;font-size:8px;color:${l.color}"><span>${l.shape}</span><span>${l.label}</span></div>`).join('')}
      <div style="display:flex;align-items:center;gap:3px;font-size:8px;color:#e0b840;margin-left:auto">
        <span style="display:inline-block;width:10px;height:2px;border:1px solid #e0b840;border-radius:1px"></span>
        <span>지배 중</span>
      </div>
    </div>`;

  // [신규 ⑥] 관찰자 모드 — 점성술사 직업 또는 5회차+ 플레이어에게만 표시
  const observerVisions = (typeof getObserverModeVision === 'function') ? getObserverModeVision() : null;
  const observerHTML = observerVisions ? `
    <div style="padding:10px 14px;background:#0a0518;border-bottom:1px solid #2a1a4a;flex-shrink:0">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#b090e0;letter-spacing:1px;margin-bottom:6px">🔮 관찰자의 시야 <span style="font-size:8px;color:var(--dim)">(별빛 사이로 흐릿하게 보이는 것들)</span></div>
      ${observerVisions.map(v=>`<div style="font-size:10px;color:#d0b0e8;line-height:1.6;margin-bottom:4px;font-style:italic">${esc(v)}</div>`).join('')}
    </div>` : '';

  body.innerHTML = `
  <div style="position:relative;display:flex;flex-direction:column;flex:1;min-height:0">
    ${observerHTML}
    <!-- 필터 탭 -->
    <div style="display:flex;gap:0;background:#060c05;border-bottom:1px solid #1a2a10;overflow-x:auto;flex-shrink:0">
      ${[['all','전체'],['city','도시'],['dungeon','던전·유적'],['special','특수장소'],['ai','AI생성'],['mine','내 영향권']].map(([v,l])=>`
        <button onclick="wmapFilter('${v}')" id="wmap-btn-${v}"
          style="flex:0 0 auto;padding:7px 10px;background:${curFilter===v?'#0d1a08':'transparent'};border:none;border-bottom:${curFilter===v?'2px solid #80c040':'2px solid transparent'};color:${curFilter===v?'#80c040':'var(--dim)'};font-size:8px;cursor:pointer;font-family:Cinzel,serif;white-space:nowrap">
          ${l}
        </button>`).join('')}
    </div>
    <!-- SVG 지도 -->
    <div id="political-map-scroll" style="overflow:auto;background:#04080f;flex:1;min-height:0;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y">
      <svg id="world-svg" viewBox="0 0 700 510" width="1400" height="1020" style="min-width:320px;display:block;cursor:grab" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-worldmap"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        ${continentBg}
        <g id="wmap-markers">${markers}</g>
        <!-- 툴팁 -->
        <g id="wmap-tooltip" style="display:none">
          <rect id="wmap-tt-bg" rx="3" fill="#050d03" stroke="#4a7a20" stroke-width="1" opacity="0.95"/>
          <text id="wmap-tt-name" font-size="9" fill="#c8a040" font-family="Cinzel,serif"/>
          <text id="wmap-tt-sub"  font-size="7.5" fill="#888" font-family="Cinzel,serif"/>
          <text id="wmap-tt-ctrl" font-size="7.5" fill="#80c040" font-family="Cinzel,serif"/>
          <text id="wmap-tt-stat" font-size="7"   fill="#666" font-family="Cinzel,serif"/>
        </g>
      </svg>
    </div>
    ${legend}
    <!-- 선택된 장소 정보 -->
    <div id="wmap-info" style="padding:10px 12px;min-height:60px;background:#050d03;border-top:1px solid #1a2a10;display:none;flex-shrink:0">
      <div id="wmap-info-inner"></div>
    </div>
  </div>`;

  // [버그 수정] 마커 클릭/호버 핸들러가 원래 body.innerHTML 문자열 안에
  // <script> 태그로 박혀 있었는데, innerHTML로 넣은 <script>는 브라우저가
  // 절대 실행하지 않는다(표준 동작) — 그래서 이 지도의 장소 클릭·호버
  // 툴팁·정보창이 지금까지 한 번도 동작한 적이 없었다. 실제로 실행되는
  // 일반 코드로 옮긴다.
  (function wireWmapMarkerEvents(){
    const TD = tooltipData;
    const CLABELS = ['무관계','우호','동맹','보호령','지배','합병'];
    const CCOLORS = ['#5a5a5a','#4a8a4a','#4a6aaa','#a0a030','#c08020','#e0b840'];

    document.querySelectorAll('.wmap-loc').forEach(el=>{
      el.addEventListener('click', function(e){
        e.stopPropagation();
        const id = this.getAttribute('data-id');
        if(!id || !TD[id]) return;
        const d = TD[id];
        const cc = d.ctrl>0 ? CCOLORS[d.ctrl] : '#5a5a5a';
        const popFmt = d.pop>=10000?(d.pop/10000).toFixed(1)+'만':d.pop>=1000?(d.pop/1000).toFixed(1)+'천':d.pop;
        const infoDiv = document.getElementById('wmap-info');
        const inner   = document.getElementById('wmap-info-inner');
        if(!infoDiv||!inner) return;
        infoDiv.style.display = 'block';
        inner.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <div>
              <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a040">${d.name}</div>
              <div style="font-size:8px;color:#888">${d.type} ${d.desc?'· '+d.desc:''}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:9px;color:${cc}">${CLABELS[d.ctrl]}</div>
              ${d.ruler&&d.ruler!=='알 수 없음'?'<div style="font-size:8px;color:#808060">지배: '+d.ruler+'</div>':''}
            </div>
          </div>
          ${d.pop>0?'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px;margin-bottom:7px">'+
            [['👥',popFmt,'인구'],['🌟',d.pros,'번영'],['🛡️',d.def,'방어']].map(([ic,v,l])=>
              '<div style="text-align:center;padding:3px;background:#030800;border:1px solid #1a2a00;border-radius:2px"><div style="font-size:8px">'+ic+'</div><div style="font-size:8px;color:#c8a040">'+v+'</div><div style="font-size:7px;color:var(--dim)">'+l+'</div></div>'
            ).join('')+'</div>':''}
          <div style="display:flex;gap:5px">
            <button onclick="if(typeof window.beginJourneyTo==='function'){window.beginJourneyTo('${d.name.replace(/'/g,"\\'")}')}else if(typeof moveToLocation==='function'){moveToLocation('${d.name.replace(/'/g,"\\'")}')}else{}" style="flex:1;padding:6px;background:#0a1500;border:1px solid #3a6a10;color:#70c030;font-size:8px;cursor:pointer;font-family:Cinzel,serif;border-radius:2px">🚶 이동</button>
            ${d.ctrl>=0?'<button onclick="if(typeof openWSIPanel===\'function\')openWSIPanel(\''+id+'\');" style="flex:1;padding:6px;background:#0a0d00;border:1px solid #5a7a10;color:#90b030;font-size:8px;cursor:pointer;font-family:Cinzel,serif;border-radius:2px">🌍 도시 관리</button>':''}
          </div>
        `;
      });
      el.addEventListener('mouseenter', function(){
        const id = this.getAttribute('data-id');
        if(!id||!TD[id]) return;
        const d=TD[id];
        const tt=document.getElementById('wmap-tooltip');
        const ttBg=document.getElementById('wmap-tt-bg');
        const ttName=document.getElementById('wmap-tt-name');
        const ttSub=document.getElementById('wmap-tt-sub');
        const ttCtrl=document.getElementById('wmap-tt-ctrl');
        if(!tt||!ttBg||!ttName) return;
        const bb=this.getBBox();
        const tx=bb.x+bb.width/2, ty=bb.y-5;
        ttName.setAttribute('x',tx); ttName.setAttribute('y',ty-22); ttName.textContent=d.name.slice(0,12);
        ttSub.setAttribute('x',tx); ttSub.setAttribute('y',ty-12); ttSub.setAttribute('text-anchor','middle'); ttSub.textContent=d.type+(d.ruler&&d.ruler!=='알 수 없음'?' · '+d.ruler:'');
        ttCtrl.setAttribute('x',tx); ttCtrl.setAttribute('y',ty-3); ttCtrl.setAttribute('text-anchor','middle');
        ttCtrl.textContent=d.ctrl>0?CLABELS[d.ctrl]:'';
        const w=Math.max(ttName.getComputedTextLength?ttName.getComputedTextLength()+16:80,80);
        ttBg.setAttribute('x',tx-w/2); ttBg.setAttribute('y',ty-32); ttBg.setAttribute('width',w); ttBg.setAttribute('height',32);
        tt.style.display='block';
        ttName.setAttribute('text-anchor','middle');
      });
      el.addEventListener('mouseleave', function(){
        const tt=document.getElementById('wmap-tooltip'); if(tt) tt.style.display='none';
      });
    });

    const svgEl = document.getElementById('world-svg');
    if(svgEl) svgEl.addEventListener('click',function(){
      const infoDiv=document.getElementById('wmap-info');
      if(infoDiv) infoDiv.style.display='none';
    });
  })();

  // 화면에 억지로 맞춰 축소하지 않고 실제 크기(1400x1020, viewBox
  // 700x510의 2배)로 그린 뒤 드래그/스크롤로 돌아다니게 바꿨다 — 처음
  // 열 때만 콘텐츠 한가운데로 맞추고, 필터 탭을 눌러 재렌더될 때는
  // 위에서 기억해둔 스크롤 위치를 그대로 복원한다(매번 가운데로
  // 되돌리면 드래그해서 본 게 필터 한 번 누를 때마다 헛수고가 됨).
  // openP()가 "먼저 렌더 → 그다음 .open 클래스 추가(=display:none
  // 해제)" 순서라서 이 시점엔 아직 clientWidth가 0일 수 있어
  // requestAnimationFrame으로 한 프레임 미룬다.
  requestAnimationFrame(() => {
    const polScroll = document.getElementById('political-map-scroll');
    if(!polScroll || polScroll.clientWidth <= 0) return;
    if(_prevPolScrollPos){
      polScroll.scrollLeft = _prevPolScrollPos.left;
      polScroll.scrollTop = _prevPolScrollPos.top;
    } else {
      polScroll.scrollLeft = (polScroll.scrollWidth - polScroll.clientWidth) / 2;
      polScroll.scrollTop = (polScroll.scrollHeight - polScroll.clientHeight) / 2;
    }
  });

  // 필터 함수
  if(!window.wmapFilter) {
    window.wmapFilter = function(v) {
      const sel=document.getElementById('wmap-filter');
      if(!sel){
        const d=document.createElement('input');d.id='wmap-filter';d.type='hidden';d.value=v;
        document.body.appendChild(d);
      } else sel.value=v;
      renderPoliticalMapPanel();
    };
  }
}
window.renderPoliticalMapPanel = renderPoliticalMapPanel;

window.renderPoliticalMapPanel = renderPoliticalMapPanel;
