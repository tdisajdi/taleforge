// svgIcon(손으로 그린 SVG 라인아트) 시스템 전용 스캐너.
//
// scan-entities.js는 src/data/*.js만 훑는다(이 프로젝트의 data/logic
// 분리 관례를 따르는 순수 데이터 파일들). 그런데 svgIcon으로 등급/
// 단계/랭크를 표시하는 배열(예: progression/020의
// ELEMENTAL_AWAKENING_STAGES)은 상당수가 로직 파일 안에 직접
// export const로 박혀 있어서(data/logic 분리가 안 된 채로 남음)
// 기존 스캐너로는 절대 못 찾는다.
//
// 이 배열들을 실제 모듈로 로드하면(esbuild+vm) 로직 파일 특성상
// window/document 참조가 많아 대부분 실패하므로, 대신 "한 항목 = 거의
// 항상 한 줄"이라는 이 코드베이스의 실측 패턴을 이용해 텍스트
// 정규식으로 직접 뽑아낸다 — 실행하지 않고 읽기만 하므로 안전하고,
// name+icon 필드가 뚜렷한 것만 뽑아서 오탐 위험도 낮다.
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '../../src');

function walkFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'assets') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(p, out);
    else if (entry.name.endsWith('.js')) out.push(p);
  }
}

// 텍스트(한 줄, 또는 여러 줄을 합친 것) 안에서 key: '...' / "..." /
// `...` 형태의 필드 값을 뽑는다. 여러 개 있으면 "가장 마지막(=가장
// 가까운)" 것을 쓴다 — 뒤에서부터 앞으로 훑는 창(window) 방식이라,
// icon 줄에서 가장 가까운 name을 찾는 데 맞는 동작.
function extractField(text, key) {
  // 'm'(멀티라인) 플래그가 있어야 ^가 각 줄의 시작에도 매치된다 —
  // RACE_DEFS처럼 id/name/icon이 서로 다른 줄에 있는 경우를 위함.
  const re = new RegExp(`(?:^|[,{(])\\s*${key}\\s*:\\s*(['"\`])((?:(?!\\1)[^\\\\]|\\\\.)*)\\1`, 'gm');
  let m, last = null;
  while ((m = re.exec(text))) last = m[2];
  return last;
}

function extractRarity(text) {
  return extractField(text, 'rarity') || extractField(text, 'grade') || extractField(text, 'tier');
}

function scanSvgIconDefs() {
  const files = [];
  walkFiles(SRC, files);
  const entities = [];

  for (const file of files) {
    if (file.includes(path.join('tools', 'pixelart-gen'))) continue;
    if (path.dirname(file) === path.join(SRC, 'data')) continue; // src/data/*.js는 scan-entities.js가 이미 커버함
    const rel = path.relative(SRC, file).replace(/\.js$/, '');
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    let ctxVar = null; // 가장 최근에 본 "export const NAME = [" 같은 배열/객체 선언명
    const ctxRe = /(?:export\s+)?const\s+([A-Z][A-Z0-9_]*)\s*=/;

    lines.forEach((line, i) => {
      const ctxMatch = line.match(ctxRe);
      if (ctxMatch) ctxVar = ctxMatch[1];

      // icon 필드는 반드시 "이 줄"에 있어야 한다(트리거) — name/id/
      // rarity/category는 RACE_DEFS처럼 여러 줄에 걸쳐 있을 수 있어서
      // 이 줄까지 포함한 최근 6줄 창(window)에서 찾는다.
      if (!/\bicon\s*:/.test(line)) return;
      const iconVal = extractField(line, 'icon');
      if (!iconVal) return;
      const hasSvgIconField = /\bsvgIcon\s*:/.test(line);
      // icon 필드 자체가 SVG 문자열인 경우(별도 svgIcon 필드 없이) —
      // 예: RACE_DEFS/직업 선택 화면/장비 슬롯 플레이스홀더. 이런 곳은
      // 애초에 이모지 폴백 자체가 없어서(문자열이 통째로 SVG) 지금까지
      // 이미지가 하나도 없었다 — 이것도 같이 뽑아낸다.
      const iconIsSvg = !hasSvgIconField && /^<svg/.test(iconVal.trim());
      if (!hasSvgIconField && !iconIsSvg) return;

      const windowText = lines.slice(Math.max(0, i - 5), i + 1).join('\n');
      const name = extractField(windowText, 'name') || extractField(windowText, 'label');
      if (!name) return; // 근처에 name/label이 없으면(드문 경우) 억지로 안 뽑음
      const realId = extractField(windowText, 'id');
      const rarity = extractRarity(windowText);
      const source = `${rel}.${ctxVar || 'svgIcon'}`;
      const id = realId ? `svgicon:${realId}` : `svgicon:${rel}:${ctxVar || 'x'}:${name}`;
      // category: 근처에 이미 category 필드가 있으면(장비 슬롯 정의
      // 등) 그걸 그대로 쓴다(armor→shield, acc→accessory로 정규화) —
      // 단, 실제 SHAPES에 있는 값일 때만이다. 데이터에 따라 "category"가
      // 전혀 다른 뜻(예: TIER2_JOBS의 combat/magic/stealth 같은 "전투
      // 계열" 태그)으로 쓰이는 경우가 있어서, 모르는 값은 무시하고
      // 아래 기본 규칙(icon-자체가-SVG면 npc, svgIcon 필드면 badge)으로
      // 폴백한다.
      const KNOWN_SHAPES = new Set(['weapon', 'shield', 'potion', 'accessory', 'material', 'monster', 'npc', 'location', 'skill', 'title', 'achievement', 'badge', 'unclassified']);
      const CATEGORY_ALIAS = { armor: 'shield', acc: 'accessory' };
      const rawCat0 = extractField(windowText, 'category');
      const rawCat = rawCat0 ? (CATEGORY_ALIAS[rawCat0] || rawCat0) : null;
      const category = KNOWN_SHAPES.has(rawCat) ? rawCat : (iconIsSvg ? 'npc' : 'badge');
      entities.push({ id, name, icon: iconIsSvg ? null : iconVal, category, rarity, type: null, source });
    });
  }

  // 같은 이름이 여러 파일/줄에서 중복 등장하면(드묾) 먼저 나온 것만 유지.
  const seen = new Set();
  return entities.filter(e => {
    if (seen.has(e.name)) return false;
    seen.add(e.name);
    return true;
  });
}

module.exports = { scanSvgIconDefs };

if (require.main === module) {
  const entities = scanSvgIconDefs();
  console.log(`svgIcon 정의 스캔: ${entities.length}개 (name+icon 둘 다 같은 줄에 있는 것만)`);
  const bySource = {};
  for (const e of entities) {
    const f = e.source.split('.')[0];
    bySource[f] = (bySource[f] || 0) + 1;
  }
  Object.entries(bySource).sort((a, b) => b[1] - a[1]).forEach(([f, c]) => console.log(`  ${c.toString().padStart(3)}  ${f}`));
}
