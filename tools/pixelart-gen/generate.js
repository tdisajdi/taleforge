// 메인 CLI: scan-entities.js로 찾은 모든 항목에 대해 실제 PNG 파일을
// assets/img/<category>/<safe-id>.png 로 굽고, "엔티티 id → 이미지
// 경로" 매니페스트(manifest.json)를 만든다. 게임 코드는 이 매니페스트
// 하나만 보고 "이 id에 이미지가 있으면 써라"를 판단하면 된다 — 즉
// 이 CLI를 다시 돌리기만 하면(새 아이템이 추가돼도) 이미지와 연결이
// 항상 자동으로 최신 상태가 된다.
const fs = require('fs');
const path = require('path');
const { scanAll } = require('./scan-entities.js');
const { generateIcon } = require('./generators.js');
const { encodePalettePNG } = require('./png-encoder.js');
const { EVENT_EMOJI_ICONS } = require('./event-icons.js');
const { COMMON_EMOJI_ICONS } = require('./common-icons.js');
const { scanSvgIconDefs } = require('./scan-svgicon-defs.js');
const { generateImageForEntity } = require('./ai-image-gen.js');
const { pixelateToIndexed } = require('./pixelate.js');
const { analyzeEntity } = require('./ai-analyze.js');

// --ai: 캐시에 없는 항목을 AI 이미지 생성으로 채운다. 기본 백엔드는
// Pollinations(무료, 키 불필요) — IMAGE_PROVIDER=gemini 환경변수를
// 줄 때만 유료 Gemini 경로로 감(GEMINI_API_KEY 필요, 결제 계정 필요).
// 어느 쪽이든 실패하면 자동으로 절차적 생성기로 폴백. --ai-limit=N:
// 이번 실행에서 새로 이미지 생성을 부를 최대 개수(기본 10 — 속도/
// 요금제 안전장치, 이미 캐시된 건 개수에 안 셈). --ai-only=weapon,
// monster: 그 카테고리만 AI 대상으로 삼는다(생략하면 전체 대상).
const AI_MODE = process.argv.includes('--ai');
const AI_LIMIT = Number((process.argv.find(a => a.startsWith('--ai-limit=')) || '').split('=')[1] || 10);
const AI_ONLY = (process.argv.find(a => a.startsWith('--ai-only=')) || '').split('=')[1];
const AI_ONLY_SET = AI_ONLY ? new Set(AI_ONLY.split(',')) : null;
// AI 원본(큰 이미지)은 여기 캐시에만 남기고 배포 zip에는 절대 포함하지
// 않는다 — 배포되는 건 pixelate.js를 거친 작은 인덱스 PNG뿐.
const AI_CACHE_DIR = path.join(__dirname, 'ai-cache-raw');

// --analyze: 무료 텍스트 모델로 이름을 분석해서(종류/속성색) 절차적
// 생성기에 넘긴다 — 이미지 생성 API(유료)와 완전히 독립된 기능이라
// --ai 없이 이것만 켜도 100% 무료로 작동한다. 분석 결과는 작은 JSON
// 캐시에 남아서(용량 미미, 배포 zip에도 포함됨) 재실행 시 재호출
// 안 함. --analyze-limit=N(기본 40): 이번 실행에서 새로 부를 최대
// 개수 — 무료 티어 일일 한도(RPD) 보호용. 호출 사이 최소 간격을
// 둬서 분당 한도(RPM)도 넘지 않게 한다.
const ANALYZE_MODE = process.argv.includes('--analyze');
const ANALYZE_LIMIT = Number((process.argv.find(a => a.startsWith('--analyze-limit=')) || '').split('=')[1] || 40);
const ANALYZE_ONLY = (process.argv.find(a => a.startsWith('--analyze-only=')) || '').split('=')[1];
const ANALYZE_ONLY_SET = ANALYZE_ONLY ? new Set(ANALYZE_ONLY.split(',')) : null;
const ANALYZE_CACHE_PATH = path.join(__dirname, 'ai-analyze-cache.json');
const ANALYZE_MIN_INTERVAL_MS = 4500; // 3.1-flash-lite 무료 티어 RPM(15/분) 안전 마진

// 사용자가 특정 항목을 직접 지정하고 싶을 때 쓰는 수동 override 파일
// (manual-overrides.json) — id 또는 name으로 매칭되면 AI 분석 호출을
// 아예 건너뛰고 여기 적힌 subtype/element/prompt를 그대로 쓴다.
// 파일이 없거나 문법 오류가 있어도 그냥 빈 표로 취급하고 계속 진행
// (수동 지정 없이도 항상 정상 동작해야 하므로).
const MANUAL_OVERRIDES_PATH = path.join(__dirname, 'manual-overrides.json');
function loadManualOverrides() {
  try {
    const raw = JSON.parse(fs.readFileSync(MANUAL_OVERRIDES_PATH, 'utf8'));
    const out = {};
    for (const [k, v] of Object.entries(raw)) if (!k.startsWith('_')) out[k] = v;
    return out;
  } catch { return {}; }
}
const MANUAL_OVERRIDES = loadManualOverrides();

const ASSETS_DIR = path.resolve(__dirname, '../../src/assets/img');
const MANIFEST_JSON_PATH = path.resolve(__dirname, '../../src/assets/manifest.json');
// 매니페스트를 JS 데이터 모듈로도 내보낸다 — dist/taleforge.html은
// 단일 파일이라 file:// 로 열었을 때 fetch()로 외부 JSON을 읽으면
// 브라우저 CORS 정책에 막힐 수 있다. JS로 번들에 직접 포함시키면
// 그 문제 자체가 없다(이미지 파일은 <img src>라서 CORS 영향 없음).
const MANIFEST_JS_PATH = path.resolve(__dirname, '../../src/data/900-pixelart-manifest.js');
const SCALE = 4; // 16x16 논리 그리드 x4 = 64x64 실 출력

function safeFileName(id) {
  return String(id).replace(/[^\w가-힣.-]/g, '_').slice(0, 80);
}

async function main() {
  if (AI_MODE) {
    fs.mkdirSync(AI_CACHE_DIR, { recursive: true });
    const provider = process.env.IMAGE_PROVIDER === 'gemini' ? 'gemini(유료)' : 'pollinations(무료)';
    console.log(`[generate] --ai 이미지 생성 백엔드: ${provider}`);
    if (process.env.IMAGE_PROVIDER === 'gemini' && !process.env.GEMINI_API_KEY) {
      console.warn('[generate] IMAGE_PROVIDER=gemini인데 GEMINI_API_KEY가 없음 — 전부 절차적 생성으로 진행됩니다.');
    }
  }
  const { entities, errors } = scanAll();
  const dedup = new Map();
  for (const e of entities) if (!dedup.has(e.id)) dedup.set(e.id, e);
  // svgIcon(손으로 그린 SVG 아이콘) 전용 시스템 — src/data/*.js가 아니라
  // 로직 파일에 직접 박혀 있어서 scanAll()이 못 찾는 등급/단계/랭크류.
  // id를 'svgicon:' 접두사로 항상 새로 만들기 때문에 위 dedup과 절대
  // 충돌하지 않는다 — 그냥 이어붙인다(먼저 들어간 "진짜" 엔티티가
  // 있으면 아래 byName 등록 단계에서 이름 우선권을 그쪽이 가져간다).
  for (const e of scanSvgIconDefs()) if (!dedup.has(e.id)) dedup.set(e.id, e);
  const unique = [...dedup.values()];

  fs.rmSync(ASSETS_DIR, { recursive: true, force: true });
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  // 실제 데이터의 약 1/3은 명시적 id 필드가 없다(스캐너가 임시로
  // "경로#이름" 형태의 합성 키를 붙여둠) — 게임 렌더링 코드가 그
  // 합성 키를 재구성할 방법이 없으므로, 런타임에서 실제로 조회
  // 가능한 두 값(id, name)으로 각각 인덱싱해서 둘 중 뭘 들고 있어도
  // 이미지를 찾을 수 있게 한다. id 우선, 없으면 name으로 폴백.
  const byId = {};
  const byName = {};
  let totalBytes = 0;
  const perCategory = {};
  let aiUsedCount = 0, aiCachedCount = 0, aiCallsThisRun = 0;
  // --ai만 켜도(--analyze 없이) 무료 분석을 자동으로 같이 돌린다 —
  // 그 결과(무기 종류/속성색)가 이미지 생성 프롬프트에 그대로 반영돼서
  // "분석 → 그 분석을 반영한 이미지 생성 → 도트 변환 → 매니페스트
  // 등록"이 --ai 한 번 실행으로 전부 자동 연결되게 하기 위함.
  const NEED_ANALYZE = ANALYZE_MODE || AI_MODE;
  let analyzeCache = {}, analyzeCachedCount = 0, analyzeCallsThisRun = 0;
  if (NEED_ANALYZE) {
    try { analyzeCache = JSON.parse(fs.readFileSync(ANALYZE_CACHE_PATH, 'utf8')); } catch { analyzeCache = {}; }
  }

  // 이름을 분석해서 entity에 aiSubtype/element를 얹는다(generators.js가
  // 그 값으로 실루엣/색을 고르고, ai-image-gen.js가 이미지 프롬프트에도
  // 반영한다) — 실패/예산 소진/카테고리 제외면 entity를 그대로 돌려줘서
  // 기존 로직으로 안전하게 폴백한다. GEMINI_API_KEY가 없으면(분석은
  // Gemini 텍스트 모델 전용) 조용히 건너뛴다 — Pollinations 이미지
  // 생성 자체는 키가 전혀 필요 없으므로 --ai만으로도 계속 동작한다.
  async function tryAnalyze(e) {
    // 수동 override가 있으면 AI 분석보다 항상 우선(호출 자체를 안 함).
    const manual = MANUAL_OVERRIDES[String(e.id)] || MANUAL_OVERRIDES[e.name];
    if (manual) {
      return { ...e, aiSubtype: manual.subtype || null, element: manual.element || 'none', promptOverride: manual.prompt || null };
    }
    if (!NEED_ANALYZE) return e;
    if (ANALYZE_ONLY_SET && !ANALYZE_ONLY_SET.has(e.category)) return e;
    if (!process.env.GEMINI_API_KEY) return e;
    const cacheKey = String(e.id || e.name);
    let analysis = analyzeCache[cacheKey];
    if (analysis) { analyzeCachedCount++; }
    else {
      if (analyzeCallsThisRun >= ANALYZE_LIMIT) return e;
      if (analyzeCallsThisRun > 0) await new Promise(r => setTimeout(r, ANALYZE_MIN_INTERVAL_MS));
      analyzeCallsThisRun++;
      analysis = await analyzeEntity(e);
      analyzeCache[cacheKey] = analysis;
      fs.writeFileSync(ANALYZE_CACHE_PATH, JSON.stringify(analyzeCache));
    }
    return { ...e, aiSubtype: analysis.subtype, element: analysis.element };
  }

  // AI 원본을 받아서 도트로 변환한다. 실패하면 null을 돌려주고,
  // 호출부는 그때 절차적 생성기로 자동 대체한다(절대 빈 이미지 없음).
  async function tryAiPng(e) {
    if (!AI_MODE) return null;
    if (AI_ONLY_SET && !AI_ONLY_SET.has(e.category)) return null;
    const cachePath = path.join(AI_CACHE_DIR, `${safeFileName(e.id)}.png`);
    let raw = fs.existsSync(cachePath) ? fs.readFileSync(cachePath) : null;
    if (raw) { aiCachedCount++; }
    else {
      if (aiCallsThisRun >= AI_LIMIT) return null; // 이번 실행 예산 소진 — 절차적 생성으로 폴백
      aiCallsThisRun++;
      raw = await generateImageForEntity(e);
      if (raw) fs.writeFileSync(cachePath, raw);
    }
    if (!raw) return null;
    try {
      const indexed = pixelateToIndexed(raw, { gridSize: 64, maxColors: 48, alphaThreshold: 96 });
      aiUsedCount++;
      return encodePalettePNG(indexed);
    } catch (err) {
      console.warn(`[generate] 도트 변환 실패(${e.id}): ${err.message} — 절차적 생성으로 대체`);
      return null;
    }
  }

  for (let e of unique) {
    const dir = path.join(ASSETS_DIR, e.category);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const fileName = `${safeFileName(e.id)}.png`;
    const relPath = `img/${e.category}/${fileName}`;
    e = await tryAnalyze(e);
    const png = (await tryAiPng(e)) || encodePalettePNG(generateIcon(e, SCALE));
    fs.writeFileSync(path.join(dir, fileName), png);
    totalBytes += png.length;
    const entry = { path: relPath, category: e.category, name: e.name };
    const isSynthetic = String(e.id).includes('#');
    if (!isSynthetic) byId[e.id] = entry;
    if (!(e.name in byName)) byName[e.name] = entry; // 이름 중복 시 먼저 나온 것 우선(드묾, ~4.6%)
    perCategory[e.category] = (perCategory[e.category] || 0) + 1;
  }

  // NPC 소문/월드뉴스(renderFactionNewsBulletin 등)는 msg 문자열이
  // AI 프롬프트에도 그대로 재사용돼서(misc/076) 특정 엔티티 이미지를
  // 끼워 넣을 수 없다 — 대신 "사건 종류"를 나타내는 소수의 고정
  // 이모지(💕⚔️🤝...)에 대해서만 대표 배지를 만들어 name=이모지
  // 자체로 등록한다. 화면 쪽에서만 안전하게 치환해 쓴다(utils.js의
  // decorateEmojiIcons 참고) — msg 원문은 절대 안 건드림.
  //
  // toast() 호출부 694곳에 박혀 있던 "메시지 맨 앞 하드코딩 이모지"도
  // 같은 방식(name=이모지 자체로 등록)으로 처리한다 — common-icons.js
  // 참고. 호출부를 일일이 고치는 대신, toast()가 런타임에 msg 맨 앞
  // 글자가 이 표에 있는지 직접 조회해서 있으면 이미지로 바꾼다.
  function registerEmojiIcon(emoji, id, rarity) {
    const dir = path.join(ASSETS_DIR, 'badge');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const entity = { id, name: emoji, icon: emoji, category: 'badge', rarity };
    const result = generateIcon(entity, SCALE);
    const png = encodePalettePNG(result);
    const fileName = `${id}.png`;
    fs.writeFileSync(path.join(dir, fileName), png);
    totalBytes += png.length;
    const entry = { path: `img/badge/${fileName}`, category: 'badge', name: emoji };
    byId[id] = entry;
    if (!(emoji in byName)) byName[emoji] = entry;
    perCategory.badge = (perCategory.badge || 0) + 1;
  }
  for (const { emoji, id, rarity } of EVENT_EMOJI_ICONS) registerEmojiIcon(emoji, id, rarity);
  for (const { emoji, id, rarity } of COMMON_EMOJI_ICONS) registerEmojiIcon(emoji, id, rarity);

  // 타이틀/로그인 화면 장식용 UI 크롬 에셋 — 엔티티가 아니라 고정된
  // 화면 장식이라 매니페스트(byId/byName) 조회 대상이 아니다.
  // template.html이 `assets/img/ui/<파일명>.png`로 직접 참조한다.
  // generate.js 안에 같이 두는 이유는 다른 에셋들과 마찬가지로,
  // 재실행해도 절대 빠지지 않게 하기 위함.
  const UI_DIR = path.join(ASSETS_DIR, 'ui');
  fs.mkdirSync(UI_DIR, { recursive: true });
  function writeUiAsset(fileName, entity, scale) {
    const result = generateIcon(entity, scale);
    fs.writeFileSync(path.join(UI_DIR, fileName), encodePalettePNG(result));
  }
  // 타이틀 화면 배경 — 동굴 지형 타일(넓게 늘려 쓸 배경).
  writeUiAsset('title-bg-cave.png', { id: 'ui-title-bg', name: 'ui-title-bg', category: 'location', type: 'dungeon' }, 14);
  // 타이틀 화면 네 모서리 장식.
  writeUiAsset('title-orn-weapon.png', { id: 'ui-orn-weapon', name: 'ui-orn-weapon', category: 'weapon', rarity: 'legendary' }, 8);
  writeUiAsset('title-orn-shield.png', { id: 'ui-orn-shield', name: 'ui-orn-shield', category: 'shield', rarity: 'legendary' }, 8);
  // 월드맵/대륙 지도 SVG 배경에 겹쳐 쓸 타일형 지형 텍스처(작게 반복
  // 타일링). world/315(대륙 정치 지도), economy/255(항해 지도)가
  // <pattern>으로 참조한다 — 실제 마커/툴팁/클릭 같은 기능은 그대로
  // 두고, 대륙 모양 위에 옅게 얹는 질감만 도트로 바꾸는 용도.
  // guessTerrain()은 한국어 이름 키워드로 지형을 추측하므로, 원하는
  // 지형이 확실히 나오도록 그 키워드를 이름에 그대로 넣어준다
  // (plain은 매치되는 키워드가 없을 때의 기본값이라 그대로 둔다).
  const TERRAIN_TILE_NAMES = { forest: '숲', mountain: '설산', water: '바다', desert: '사막', plain: '평원' };
  Object.entries(TERRAIN_TILE_NAMES).forEach(([terrain, koreanName]) => {
    writeUiAsset(`terrain-tile-${terrain}.png`, { id: `ui-terrain-${terrain}`, name: koreanName, category: 'location' }, 4);
  });

  const manifestObj = { byId, byName };
  fs.writeFileSync(MANIFEST_JSON_PATH, JSON.stringify(manifestObj));
  fs.writeFileSync(MANIFEST_JS_PATH,
`// 자동 생성 파일 — 손으로 고치지 말고 tools/pixelart-gen/generate.js를 다시 돌릴 것.
// "엔티티 id/name → 생성된 도트 이미지 경로" 매핑. 게임 코드는 이 표를
// 보고 실제 이미지가 있으면 <img>로, 없으면 기존 이모지로 폴백한다.
export const PIXEL_ART_MANIFEST = ${JSON.stringify(manifestObj)};
window.PIXEL_ART_MANIFEST = PIXEL_ART_MANIFEST;
`);

  console.log(`데이터 파일 로드 실패: ${errors.length}개 (${errors.map(e => e.file).join(', ') || '없음'})`);
  console.log(`생성한 이미지: ${unique.length}개`);
  console.log('카테고리별:', perCategory);
  console.log(`총 용량: ${(totalBytes / 1024).toFixed(1)} KB`);
  if (AI_MODE) {
    console.log(`AI 이미지 사용: ${aiUsedCount}개 (이번 실행에서 새로 API 호출: ${aiCallsThisRun}개, 캐시 재사용: ${aiCachedCount}개, 예산(--ai-limit): ${AI_LIMIT}개)`);
  }
  if (NEED_ANALYZE) {
    console.log(`AI 이름 분석(무료): 이번 실행에서 새로 호출 ${analyzeCallsThisRun}개, 캐시 재사용 ${analyzeCachedCount}개, 예산(--analyze-limit): ${ANALYZE_LIMIT}개`);
  }
  console.log(`매니페스트(JSON): ${MANIFEST_JSON_PATH}`);
  console.log(`매니페스트(JS, 빌드에 포함됨): ${MANIFEST_JS_PATH}`);
  console.log(`이미지 폴더: ${ASSETS_DIR}`);
}

main();
