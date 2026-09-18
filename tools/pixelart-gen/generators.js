// 카테고리별 16x16 도트 아이콘/배경 절차적 생성기.
// 같은 이름(id)을 넣으면 항상 같은 그림이 나온다(결정론적 시드) —
// 빌드를 다시 해도, 다른 컴퓨터에서 돌려도 결과가 흔들리지 않는다.

// ---------- 결정론적 RNG ----------
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeRng(seedStr) { return mulberry32(fnv1a(seedStr)); }
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

// ---------- 색상 유틸 ----------
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

// 등급(희귀도) → 기본 색조(hue). 실제 게임 데이터의 rarity/tier/grade 문자열을
// 여기 버킷 중 하나로 정규화해서 넘긴다(정규화는 scan-entities.js 담당).
const RARITY_HUE = {
  common: 0,        // 회색조로 별도 처리(채도 0)
  uncommon: 130,     // 초록
  rare: 215,         // 파랑
  epic: 280,         // 보라
  legendary: 40,      // 금색
  mythic: 355,        // 진한 빨강
};
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

// ai-analyze.js(무료 텍스트 분석)가 "화염/얼음/독..." 같은 속성 테마를
// 판단해주면, 등급 색조 대신 이 색조를 쓴다 — 채도/명도(등급별 밝기
// 단계)는 그대로 rarityPalette 로직을 재사용해서, "전설급 화염"과
// "일반급 화염" 둘 다 화염 계열이면서 등급에 따라 화려함만 달라진다.
const ELEMENT_HUE = {
  fire: 12, ice: 195, poison: 110, holy: 48, dark: 265, nature: 100, electric: 55,
};

function rarityPalette(rarity, hueOverride) {
  const hue = hueOverride ?? (RARITY_HUE[rarity] ?? RARITY_HUE.common);
  const sat = (rarity === 'common' && hueOverride == null) ? 0.04 : 0.55;
  const A = hslToRgb(hue, sat, 0.52); // 본체
  const B = hslToRgb(hue, sat, 0.30); // 그림자
  const O = hslToRgb(hue, sat * 0.6, 0.12); // 외곽선
  const H = hslToRgb(hue, sat * 0.5, 0.82); // 하이라이트
  return { A, B, O, H };
}

// ---------- 팔레트 인덱스 빌더 ----------
// mask: 16개의 16자 문자열 배열. 각 글자가 팔레트 키에 대응.
// colorMap: { 글자: [r,g,b] }  ('.' 은 항상 투명 처리, 매핑 불필요)
// 손으로 쓴 마스크 문자열은 길이가 미묘하게 어긋나기 쉬우므로, 여기서
// 무조건 16행×16열로 잘라내거나 '.'(투명)으로 채워 방어적으로 정규화한다
// — 마스크 정의 쪽에서 한 글자만 실수해도 그림이 깨지거나 버퍼가
// 어긋나는 일이 없도록.
const GRID = 16;
function normalizeMask(mask) {
  const rows = mask.slice(0, GRID);
  while (rows.length < GRID) rows.push('.'.repeat(GRID));
  return rows.map(r => (r.length >= GRID ? r.slice(0, GRID) : r + '.'.repeat(GRID - r.length)));
}
function buildIndexBuffer(rawMask, colorMap, scale) {
  const mask = normalizeMask(rawMask);
  const gridSize = GRID;
  const outSize = gridSize * scale;
  const palette = [[0, 0, 0]]; // index 0 = 투명 placeholder
  const keyToIndex = {};
  const indices = new Uint8Array(outSize * outSize);

  for (let gy = 0; gy < gridSize; gy++) {
    const row = mask[gy];
    for (let gx = 0; gx < gridSize; gx++) {
      const ch = row[gx];
      let idx = 0;
      if (ch !== '.') {
        if (!(ch in keyToIndex)) {
          keyToIndex[ch] = palette.length;
          palette.push(colorMap[ch] || [255, 0, 255]);
        }
        idx = keyToIndex[ch];
      }
      for (let sy = 0; sy < scale; sy++) {
        const oy = gy * scale + sy;
        const rowOff = oy * outSize;
        for (let sx = 0; sx < scale; sx++) {
          indices[rowOff + gx * scale + sx] = idx;
        }
      }
    }
  }
  return { width: outSize, height: outSize, indices, palette };
}

// 좌측 8열 문자열 배열을 좌우 대칭시켜 16열 마스크로 확장.
// (각 행을 8자로 강제 정규화한 뒤 대칭 — 손으로 쓴 문자열 길이 실수 방지)
function mirrorH(leftRows) {
  return leftRows.map(r => {
    const row8 = r.length >= 8 ? r.slice(0, 8) : r + '.'.repeat(8 - r.length);
    return row8 + row8.split('').reverse().join('');
  });
}

// ---------- 카테고리별 마스크 (16x16, 좌측 8열만 정의 후 대칭) ----------
const SHAPES = {
  // 물약: 둥근 플라스크 + 목 + 코르크
  potion: mirrorH([
    '........',
    '...OO...',
    '...AA...',
    '..OAAO..',
    '.OAAAAO.',
    'OACCCACO',
    'OACCCACO',
    'OACCCACO',
    'OACCCACO',
    'OAACCAAO',
    '.OAAAAO.',
    '..OOOO..',
    '........',
    '........',
    '........',
    '........',
  ]),
  // 방패: 하트형 방패 실루엣
  shield: mirrorH([
    '........',
    '.OOOOOO.',
    '.OAAAAO.',
    'OAAHAAAO',
    'OABAAABO',
    'OABBAABO',
    '.OABABO.',
    '.OABABO.',
    '..OBBO..',
    '..OBBO..',
    '...OO...',
    '...OO...',
    '........',
    '........',
    '........',
    '........',
  ]),
  // 반지/보석 장신구
  accessory: mirrorH([
    '........',
    '........',
    '..OOOO..',
    '.OAHHAO.',
    'OAB..BAO',
    'OAB..BAO',
    '.OAAAAO.',
    '..OOOO..',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
  ]),
  // 광석/재료 덩어리
  material: mirrorH([
    '........',
    '........',
    '...OO...',
    '..OAAO..',
    '.OAABAO.',
    '.OABABO.',
    '.OABBAO.',
    '..OBBO..',
    '...OO...',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
  ]),
  // 몬스터: 뿔 달린 4족 짐승 실루엣(추상화, 색만 바뀜)
  monster: mirrorH([
    '........',
    '.O....O.',
    '.OA..AO.',
    '..OAAO..',
    '.OAHHAO.',
    'OAABBAAO',
    'OAABBAAO',
    '.OAAAAO.',
    '.OABBAO.',
    '.OA..AO.',
    '.OO..OO.',
    '.OO..OO.',
    '........',
    '........',
    '........',
    '........',
  ]),
  // 칭호(title): 걸려있는 리본형 배너
  // 업적(achievement)/스킬(skill)은 밑에서 직접 16열로 정의.
  // NPC 흉상: 머리 + 어깨
  npc: mirrorH([
    '........',
    '..KKKK..',
    '.KSSSK..',
    '.KSSSSK.',
    '.SSSSSS.',
    '.SSHHSS.',
    '..SSSS..',
    '...OO...',
    '.OAAAAO.',
    'OAAAAAAO',
    'OAAAAAAO',
    'OAAAAAAO',
    '........',
    '........',
    '........',
    '........',
  ]),
};

// 무기(비대칭 — 대각선 검 실루엣)를 직접 16열로 정의.
SHAPES.weapon = [
  '..........O.....',
  '...........O....'.slice(0, 16),
  '..........OC....',
  '.........OCC....',
  '........OCC.....',
  '.......OCC......',
  '......OCC.......',
  '.....OCC........',
  '....OCC.........',
  '...OCCO.OOOO....',
  '..OAOOOOAAAAO...'.slice(0, 16),
  '.OAOO..OABBAO...'.slice(0, 16),
  '.OAO....OBBO....',
  '..O......OO.....',
  '.........O......',
  '.........O......',
].map(r => (r.length < 16 ? r + '.'.repeat(16 - r.length) : r.slice(0, 16)));

// ---------- 서브타입 세부 실루엣 ----------
// 같은 category(무기/방어구/장신구/재료/몬스터/NPC)라도 실제 게임
// 데이터의 무기종류(icon)/장비슬롯(slot)에 따라 모양 자체가 달라지도록
// 세분화한 마스크들. resolveShapeKey()가 entity를 보고 이 중 하나를
// 고르고, 못 찾으면 항상 기존 카테고리 기본 모양(SHAPES[category])로
// 안전하게 폴백한다 — 즉 이 표에 없는 항목도 기존과 똑같이 동작한다.

// 무기 세부종류(비대칭 단일 실루엣, weapon과 같은 스타일 — mirrorH 안 씀)
SHAPES.dagger = [
  '................',
  '................',
  '.......OO.......',
  '.......CC.......',
  '.......CC.......',
  '.......CC.......',
  '......OCCO......',
  '......OCCO......',
  '.....OOCCOO.....',
  '.....OAAAAO.....',
  '.....OABBAO.....',
  '.....OOBBOO.....',
  '......OBBO......',
  '......OOOO......',
  '................',
  '................',
];
SHAPES.axe = [
  '................',
  '................',
  '..........OO...',
  '.........OCCO..',
  '........OCCCCO.',
  '.......OCCCCCCO',
  '......OCCCCCCO.',
  '.......OCCCO...',
  '.........O......',
  '........OAO.....',
  '........OAO.....',
  '........OBO.....',
  '........OBO.....',
  '........OOO.....',
  '................',
  '................',
];
SHAPES.bow = [
  '................',
  '.......O........',
  '......O..O......',
  '.....O...O......',
  '....O....O......',
  '....O....O......',
  '....O....OCCC...',
  '....O....O......',
  '....O....O......',
  '.....O...O......',
  '......O..O......',
  '.......O........',
  '................',
  '................',
  '................',
  '................',
];
SHAPES.mace = [
  '................',
  '................',
  '.......OOOO.....',
  '......OCCCCO....',
  '......OCHHCO....',
  '......OCCCCO....',
  '.......OOOO.....',
  '........O.......',
  '........O.......',
  '........O.......',
  '.......OAO......',
  '.......OAO......',
  '.......OBO......',
  '.......OOO......',
  '................',
  '................',
];
SHAPES.trident = [
  '................',
  '.O.....O.O......',
  '.O.....O.O......',
  '.OC....OC.......',
  '..OC..OC........',
  '...OC.OC........',
  '....OCOC........',
  '.....OO.........',
  '.....O..........',
  '....OAO.........',
  '....OAO.........',
  '....OBO.........',
  '....OOO.........',
  '................',
  '................',
  '................',
];
SHAPES.wand = [
  '................',
  '........O.......',
  '.......OHO......',
  '........O.......',
  '........C.......',
  '........C.......',
  '........C.......',
  '.......OCO......',
  '.......OAO......',
  '.......OAO......',
  '.......OBO......',
  '.......OOO......',
  '................',
  '................',
  '................',
  '................',
];

// 몬스터 세부종류(mirrorH 8열, 기존 monster와 같은 팔레트 O/A/B/H 재사용)
SHAPES.dragon = mirrorH([
  '........', '.O....O.', '.OA..AO.', 'OAAOOAAO', '.OAHHAO.',
  'OAABBAAO', 'OAABBAAO', '.OAAAAO.', '..OBBO..', '..OBBO..',
  '...OO...', '........', '........', '........', '........', '........',
]);
SHAPES.ghost = mirrorH([
  '........', '..OOOO..', '.OAAAAO.', 'OAAHHAAO', 'OAO..OAO',
  'OAAAAAAO', 'OAAAAAAO', 'OAAAAAAO', 'OAOAOAOA', '........',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.demon = mirrorH([
  '........', 'O......O', '.O....O.', '.OO..OO.', '.OAOOAO.',
  'OAAHHAAO', 'OAAAAAAO', 'OAA..AAO', '.OAAAAO.', '..OBBO..',
  '..OBBO..', '...OO...', '........', '........', '........', '........',
]);
SHAPES.bat = mirrorH([
  '........', '........', 'O.....O.', 'OO....O.', 'OAO..OO.',
  'OAAO.OO.', '.OAAOO..', '..OAAO..', '.OAHHAO.', '.OAAAAO.',
  '..OBBO..', '...OO...', '........', '........', '........', '........',
]);
SHAPES.golem = mirrorH([
  '........', '........', '.OOOOOO.', 'OAAAAAAO', 'OAHAAHAO',
  'OAAAAAAO', 'OABBBBAO', 'OABBBBAO', 'OOBBBBOO', '.OO..OO.',
  '.OO..OO.', '........', '........', '........', '........', '........',
]);
SHAPES.snake = mirrorH([
  '........', '...OAO..', '..OAAO..', '.OAAO...', '.OAAO...',
  '..OAAO..', '...OAAO.', '...OAAO.', '..OAAO..', '.OAAO...',
  '..OO....', '........', '........', '........', '........', '........',
]);
SHAPES.bird = mirrorH([
  '........', '..OAAO..', '.OAAAAO.', 'OAAHHAAO', 'OOAAAOO.',
  '..OAAO..', '...OB...', '...OO...', '..O..O..', '..O..O..',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.spider = mirrorH([
  '........', 'O.O..O.O', '.O.OO.O.', '..OAAO..', '.OAAAAO.',
  'OOAHHAOO', '.OAAAAO.', '..OAAO..', '.O.OO.O.', 'O.O..O.O',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.undead = mirrorH([
  '........', '..OOOO..', '.OAAAAO.', 'OAOAAOAO', 'OAAAAAAO',
  'OAOOOOAO', '.OAAAAO.', '..OOOO..', '.OAOAOA.', '.OAOAOA.',
  '..OOOO..', '........', '........', '........', '........', '........',
]);

// 방어구 슬롯 세부종류(mirrorH 8열, 기존 shield와 같은 기본 팔레트)
SHAPES.helmet = mirrorH([
  '........', '..OOOO..', '.OAAAAO.', 'OAAAAAAO', 'OAAHHAAO',
  'OAA..AAO', 'OAAAAAAO', '.OABBAO.', '..OOOO..', '........',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.armor = mirrorH([
  '........', '.OOOOOO.', 'OAAAAAAO', 'OAAHHAAO', 'OABAABAO',
  'OABAABAO', 'OABBBBAO', 'OABBBBAO', '.OBBBBO.', '..OOOO..',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.gloves = mirrorH([
  '........', '.O.O.O..', 'OA.A.AO.', 'OAAAAAO.', 'OAAAAAO.',
  '.OAAAO..', '..OBO...', '..OBO...', '..OOO...', '........',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.boots = mirrorH([
  '........', '........', '..OOOO..', '.OAAAAO.', '.OAAAAO.',
  '.OABBAO.', '.OABBAO.', 'OOABBAOO', 'OAABBAAO', 'OOOOOOOO',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.cloak = mirrorH([
  '........', '..OOOO..', '.OAAAAO.', 'OAAHHAAO', 'OAAAAAAO',
  'OAABBAAO', 'OABBBBAO', 'OBBBBBBO', 'OBBBBBBO', '........',
  '........', '........', '........', '........', '........', '........',
]);

// 장신구 슬롯 세부종류(mirrorH 8열) — 반지(ring)는 기존 accessory 재사용.
SHAPES.necklace = mirrorH([
  '........', '...OO...', '..O..O..', '..O..O..', '.OAAAAO.',
  'OABHHBAO', 'OABBBBAO', '.OABBAO.', '..OOOO..', '........',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.earring = mirrorH([
  '........', '........', '...OO...', '...OO...', '..OAAO..',
  '..OHHO..', '..OAAO..', '...OO...', '........', '........',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.belt = mirrorH([
  '........', '........', '........', '........', 'OOOOOOOO',
  'AAAAAAHO', 'ABBBBBHO', 'AAAAAAHO', 'OOOOOOOO', '........',
  '........', '........', '........', '........', '........', '........',
]);

// 재료 세부종류(mirrorH 8열) — 광석(ore)은 기존 material 재사용.
SHAPES.wood = mirrorH([
  '........', '........', '........', '..OOOO..', '.OAHABO.',
  'OAABABAO', 'OAABABAO', '.OABABO.', '..OOOO..', '........',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.plant = mirrorH([
  '........', '...OO...', '..OAAO..', '.OAAAAO.', 'OAAHHAAO',
  '.OAAAAO.', '..OAAO..', '...OO...', '...OO...', '...OO...',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.meat = mirrorH([
  '........', '........', '...OO...', '...HH...', '..OAAO..',
  '.OAABAO.', 'OAABBAAO', 'OABBBBAO', '.OBBBBO.', '..OOOO..',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.pottery = mirrorH([
  '........', '........', '...OO...', '..OAAO..', '.OAAAAO.',
  'OAAAAAAO', 'OAABBAAO', 'OAABBAAO', '.OAAAAO.', '..OOOO..',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.coin = mirrorH([
  '........', '........', '..OOOO..', '.OAHHAO.', 'OAABBAAO',
  'OAABBAAO', '.OAHHAO.', '..OOOO..', '........', '........',
  '........', '........', '........', '........', '........', '........',
]);
SHAPES.scroll = mirrorH([
  '........', '........', '.OOOOOO.', 'OAAAAAAO', 'OABBBBAO',
  'OAAAAAAO', 'OABBBBAO', 'OAAAAAAO', '.OOOOOO.', '........',
  '........', '........', '........', '........', '........', '........',
]);

// NPC 세부종류(mirrorH 8열, npc와 같은 팔레트 S=피부/K=머리 재사용) — 평민(commoner)은 기존 npc 재사용.
SHAPES.royal = mirrorH([
  '........', '.O.OO.O.', 'OOOOOOOO', '.KSSSK..', '.KSSSSK.',
  '.SSSSSS.', '.SSHHSS.', '..SSSS..', '...OO...', '.OAAAAO.',
  'OAHAAHAO', 'OAAAAAAO', '........', '........', '........', '........',
]);
SHAPES.mage = mirrorH([
  '........', '....O...', '...OHO..', '..OAAO..', '.OAAAAO.',
  'OOAAAOOO', '..SSSS..', '.SSHHSS.', '..SSSS..', '...OO...',
  '.OAAAAO.', 'OAAAAAAO', '........', '........', '........', '........',
]);
SHAPES.cleric = mirrorH([
  '........', '..OOOO..', '.OAAAAO.', 'OASSSAAO', 'OASSSAAO',
  '.OAAAAO.', '..OOOO..', '...OO...', '.OAAAAO.', 'OABHBAO.',
  'OAAAAAAO', '........', '........', '........', '........', '........',
]);
SHAPES.warrior = mirrorH([
  '........', '...OO...', '..OHHO..', '.OAAAAO.', 'OAAAAAAO',
  'OAA..AAO', 'OAAAAAAO', '.OABBAO.', '...OO...', '.OAAAAO.',
  'OAAAAAAO', 'OAAAAAAO', '........', '........', '........', '........',
]);

// entity(icon/slot 필드)를 보고 실제로 쓸 SHAPES 키를 고른다.
// 못 찾으면 항상 category 자신(기존 기본 모양)으로 안전하게 폴백한다.
const WEAPON_ICON_SHAPE = {
  '🗡️': 'dagger', '🔪': 'dagger', '🪓': 'axe', '🏹': 'bow',
  '🔨': 'mace', '🔱': 'trident', '🪄': 'wand',
};
const MONSTER_ICON_SHAPE = {
  '🐉': 'dragon', '🐲': 'dragon', '👻': 'ghost', '🌑': 'ghost',
  '👹': 'demon', '👺': 'demon', '🦇': 'bat', '🗿': 'golem',
  '🐍': 'snake', '🦅': 'bird', '🕷️': 'spider', '🦂': 'spider',
  '💀': 'undead', '🧟': 'undead',
};
const SHIELD_SLOT_SHAPE = { helmet: 'helmet', armor: 'armor', gloves: 'gloves', boots: 'boots', cloak: 'cloak' };
const ACCESSORY_SLOT_SHAPE = { necklace: 'necklace', amulet: 'necklace', earring: 'earring', belt: 'belt' };
const MATERIAL_ICON_SHAPE = {
  '🪵': 'wood', '🌾': 'plant', '🌿': 'plant', '🌶️': 'plant', '🪻': 'plant', '🥀': 'plant',
  '🍖': 'meat', '🥩': 'meat', '🏺': 'pottery', '🪙': 'coin',
  '📜': 'scroll', '📗': 'scroll', '📋': 'scroll',
};
const NPC_ICON_SHAPE = {
  '👑': 'royal', '👸': 'royal', '🤴': 'royal', '🔮': 'mage', '✨': 'mage', '🌟': 'mage',
  '⛪': 'cleric', '✝️': 'cleric', '⚔️': 'warrior', '🗡️': 'warrior', '🏹': 'warrior',
};
function resolveShapeKey(category, entity) {
  const icon = entity.icon;
  const slot = entity.slot;
  let key = null;
  if (category === 'weapon') key = WEAPON_ICON_SHAPE[icon];
  else if (category === 'monster') key = MONSTER_ICON_SHAPE[icon];
  else if (category === 'shield') key = SHIELD_SLOT_SHAPE[slot];
  else if (category === 'accessory') key = ACCESSORY_SLOT_SHAPE[slot];
  else if (category === 'material') key = MATERIAL_ICON_SHAPE[icon];
  else if (category === 'npc') key = NPC_ICON_SHAPE[icon];
  return (key && SHAPES[key]) ? key : category;
}

// 칭호: 걸려있는 리본형 배너(아래쪽 Y자 갈래로 리본 느낌)
SHAPES.title = [
  '................',
  '.....OOOOOO.....',
  '....OAAAAAAO....',
  '....OAAHHAAO....',
  '....OAAAAAAO....',
  '....OAAAAAAO....',
  '....OAAAAAAO....',
  '....OAA..AAO....',
  '....OA....AO....',
  '.....O....O.....',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];
// 업적: 메달(원형) + 짧은 리본 꼬리
SHAPES.achievement = mirrorH([
  '........',
  '..OOOO..',
  '.OAHHAO.',
  'OABBBAO.',
  'OABBBAO.',
  '.OAAAAO.',
  '..OOOO..',
  '...OO...',
  '...OO...',
  '........',
  '........',
  '........',
  '........',
  '........',
  '........',
  '........',
]);
// 등급/단계/티어 배지(label+icon 구조 — 실체가 아니라 상태 표시).
// 기본값은 업적 메달과 같은 모양(호환용) — 실제 렌더링은 아래
// BADGE_VARIANTS 중 하나로 대체된다(generateIcon 참고).
SHAPES.badge = SHAPES.achievement;

// badge 카테고리(604개+이벤트 배지 14개, 총 618개)는 전부 같은
// 데이터 구조(label+icon)를 쓰지만 실제로는 "등급 배지", "리본",
// "계급장", "보석 표식", "뾰족한 상징" 등 서로 다른 313개+ 배열(예:
// DUNGEON_GRADES, FAITH_TIERS, GRUDGE_TYPES...)에서 나온 전혀 다른
// 개념이다. 전부 업적 메달 모양 하나로만 찍으면 시각적으로 구분이
// 안 되므로, 같은 배열(entity.source) 안에서는 모양이 일관되게
// 유지되면서(등급 1~5가 같은 배지 모양에 색만 변함) 배열이 다르면
// 모양 자체가 달라지도록 여러 실루엣을 두고 해시로 고른다.
const BADGE_VARIANTS = [
  SHAPES.achievement, // 0: 메달(원형 + 짧은 리본 꼬리)
  mirrorH([ // 1: 리본/배너(둥근 상단 + 갈라진 두 갈래 꼬리)
    '........',
    '..OOOO..',
    '.OAHHAO.',
    'OABBBAO.',
    'OABBBAO.',
    '.OAAAAO.',
    '..OOOO..',
    '...OO...',
    '..O..O..',
    '..O..O..',
    '.O....O.',
    '.O....O.',
    'O......O',
    '........',
    '........',
    '........',
  ]),
  mirrorH([ // 2: 계급장(둥근 형태 없이 가로줄 3단만 쌓은 스트라이프)
    '........',
    '........',
    '..OOOO..',
    '.OAAAAO.',
    '..OOOO..',
    '........',
    '..OOOO..',
    '.OAAAAO.',
    '..OOOO..',
    '........',
    '..OOOO..',
    '.OAAAAO.',
    '..OOOO..',
    '........',
    '........',
    '........',
  ]),
  mirrorH([ // 3: 보석/다이아몬드(마름모, 위아래로 길쭉)
    '........',
    '...OO...',
    '..OHHO..',
    '.OAAAAO.',
    'OABBBBAO',
    'OABBBBAO',
    '.OABBAO.',
    '..OBBO..',
    '...OO...',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
  ]),
  mirrorH([ // 4: 뾰족한 상징(위로 솟은 뿔/불꽃 + 아래 받침)
    '........',
    '...OO...',
    '...AA...',
    '..OAAO..',
    '..OAAO..',
    '.OAAAAO.',
    '.OAHHAO.',
    'OAAAAAAO',
    'OABBBBAO',
    '.OBBBBO.',
    '..OOOO..',
    '...OO...',
    '........',
    '........',
    '........',
    '........',
  ]),
];

// 스킬: 덮인 책(주문서) — 상단 중앙에 빛나는 룬 하이라이트
SHAPES.skill = mirrorH([
  '........',
  '........',
  'OOOOOOOO',
  'OAAAAAAO',
  'OAAHHAAO',
  'OAAAAAAO',
  'OAAAAAAO',
  'OAAAAAAO',
  'OOOOOOOO',
  '........',
  '........',
  '........',
  '........',
  '........',
  '........',
  '........',
]);

// classify()가 끝까지 확신 못 한 항목(unclassified, ~300개)도 전부
// 같은 돌덩이 하나로만 찍으면 badge와 똑같은 문제가 생긴다 — badge와
// 같은 방식으로, 그룹(entity.source)별로 일관되게 2~3가지 "정체
// 불명의 물건" 실루엣 중 하나를 고르게 한다.
// generateIcon의 category 폴백 로직(`SHAPES[entity.category] ? ... :
// 'material'`)이 unclassified를 곧장 material로 뭉개버리지 않도록
// 별칭을 등록해둔다(badge가 achievement 별칭을 쓰는 것과 같은 이유).
SHAPES.unclassified = SHAPES.material;

const UNCLASSIFIED_VARIANTS = [
  SHAPES.material, // 0: 광석/재료 덩어리(기존 기본값)
  mirrorH([ // 1: 빛나는 구슬/오브
    '........',
    '..OOOO..',
    '.OAHHAO.',
    'OAAAAAAO',
    'OAABBAAO',
    'OAABBAAO',
    '.OAAAAO.',
    '..OOOO..',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
  ]),
  mirrorH([ // 2: 매달린 태그/두루마리(고리 + 몸통)
    '........',
    '...OO...',
    '..O..O..',
    '..O..O..',
    '.OAAAAO.',
    'OAAAAAAO',
    'OAAAAAAO',
    'OAAAAAAO',
    '.OAAAAO.',
    '..OAAO..',
    '...OO...',
    '........',
    '........',
    '........',
    '........',
    '........',
  ]),
];

// 장소/배경 타일: 지형 타입별 실루엣(비대칭, 좌→우 지평선 느낌)
const TERRAIN_SHAPES = {
  forest: [
    '................',
    '................',
    '.....O..O.......',
    '....OAO OAO.....'.replace(' ', ''),
    '...OAAO.OAAO....',
    '..OAAAO.OAAAO...',
    '.OABBBO.OBBBAO..',
    '..OBOO...OOBO...',
    '..OBO.....OBO...',
    '..OBO..O..OBO...',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    '................',
    '................',
    '................',
    '................',
  ],
  mountain: [
    '................',
    '.......H........',
    '......HAH.......',
    '.....OAAAO......',
    '....OAABAAO.....',
    '...OAABBBAAO....',
    '..OAABBBBBAAO...',
    '.OAABBBBBBBAAO..',
    'OAABBBBBBBBBAAO.',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  // 도시: 굵은 사각 건물 3동 + 창문(작은 크기에서도 또렷하게 보이도록
  // 얇은 선 대신 두꺼운 블록으로 단순화)
  city: [
    '................',
    '................',
    '.......AA.......',
    '.......AA.......',
    '.......HH.......',
    '.......AA.......',
    '..AAAA.AA.AAAA..',
    '..HAAH.HH.HAAH..',
    '..AAAA.AA.AAAA..',
    '..AAAA.AA.AAAA..',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    '................',
    '................',
    '................',
    '................',
  ],
  water: [
    '................',
    '................',
    '................',
    '................',
    '................',
    'AAA.AAAA.AAA.AAA',
    'A.AAA.AAAA.AAA.A',
    'BBB.BBBB.BBB.BBB',
    'B.BBB.BBBB.BBB.B',
    'BBB.BBBB.BBB.BBB',
    'B.BBB.BBBB.BBB.B',
    'BBB.BBBB.BBB.BBB',
    '................',
    '................',
    '................',
    '................',
  ],
  desert: [
    '................',
    '.............H..',
    '............HAH.',
    '...........OAAO.',
    '..O..OAAO.OAAAO.',
    '.OAO.OAAAOOAAAAO',
    'OAAOOAAAAAAAAAAAO'.slice(0, 16),
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  // 동굴: 산과 헷갈리지 않도록 "채워진 삼각형" 대신 바위 틀 안에
  // 뚫린 검은 아치형 입구(빈 구멍)로 표현 — 음영 대비가 핵심.
  cave: [
    '................',
    '.AAA........AAA.',
    '.AOOA......AOOA.',
    '..AOOA....AOOA..',
    '..AOOOA..AOOOA..',
    '...AOOOAAOOOA...',
    '...AOOOOOOOOA...',
    '....AOOOOOOA....',
    '....AOOOOOOA....',
    '....AOOOOOOA....',
    'BBBBBOOOOOOBBBBB',
    'BBBBBBBBBBBBBBBB',
    '................',
    '................',
    '................',
    '................',
  ],
  plain: [
    '................',
    '................',
    '................',
    '..........H.....',
    '.........HAH....',
    '........OAAAO...',
    '.....H.OAAAAAO..',
    '....HAH.O...O...',
    '...OAAAO.O.O....',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
};

// 실제 게임 데이터(src/data, src/world)의 location `type` 필드는
// 지형이 아니라 취락 규모 코드다(city/town/village/hamlet/major/
// port/capital/dungeon/wilderness) — "숲"이냐 "사막"이냐는 그 필드에
// 없고 장소 이름(한국어 텍스트)에만 드러난다. 그래서 먼저 이 규모
// 코드로 명확한 것만 직접 매핑하고, 나머지는 이름 키워드로 추정한다.
const TYPE_CODE_MAP = {
  city: 'city', town: 'city', village: 'city', hamlet: 'city',
  major: 'city', port: 'city', capital: 'city',
  dungeon: 'cave',
};
// cave를 mountain보다 먼저 검사한다 — '광산'(광+산)처럼 "산"이 다른
// 단어의 일부로 들어간 이름이 mountain으로 잘못 분류되는 걸 막기 위해.
// mountain 쪽 키워드에서도 홑글자 '산'은 빼고(오검출 원인) 복합어만 남긴다.
const LOCATION_TYPE_KEYWORDS = [
  ['cave', ['동굴', '지하', '던전', '광산', '유적']],
  ['forest', ['숲', '삼림', '정글', '수풀']],
  ['mountain', ['산맥', '봉우리', '고원', '협곡', '설산']],
  ['city', ['도시', '마을', '성', '왕국', '수도', '항구', '시장']],
  ['water', ['바다', '호수', '강', '해안', '항해', '심해']],
  ['desert', ['사막', '모래', '황무지']],
];
function guessTerrain(name, type) {
  if (type && TYPE_CODE_MAP[type]) return TYPE_CODE_MAP[type];
  const s = `${name || ''} ${type || ''}`;
  for (const [key, kws] of LOCATION_TYPE_KEYWORDS) {
    if (kws.some(k => s.includes(k))) return key;
  }
  return 'plain';
}

// ---------- 카테고리별 색상맵 생성 ----------
// elementHue가 있으면(ai-analyze.js가 판단한 속성 테마) 등급 색조 대신
// 그 색으로 칠한다 — "화염 장검"이 진짜로 붉게, "얼음 지팡이"가 진짜로
// 푸르게 나오는 지점이 여기다.
function colorMapFor(category, rng, rarity, elementHue) {
  const { A, B, O, H } = rarityPalette(rarity, elementHue);
  const base = { A, B, O, H };
  switch (category) {
    case 'potion': {
      const liquids = elementHue != null
        ? [hslToRgb(elementHue, 0.65, 0.5)]
        : [[220, 60, 60], [60, 160, 220], [90, 200, 90], [190, 90, 220], [230, 190, 60]];
      const C = pick(rng, liquids);
      return { ...base, C };
    }
    case 'weapon': {
      // 마스크 기호: C=칼날, A/B=손잡이(가죽/나무), O=외곽선, H=칼날 광택
      const metals = elementHue != null ? [hslToRgb(elementHue, 0.5, 0.55)] : [[200, 200, 210], [180, 150, 90], [140, 140, 150]];
      const handles = [[90, 60, 35], [60, 45, 30], [110, 80, 50]];
      const C = pick(rng, metals);
      const handle = pick(rng, handles);
      return { A: handle, B: [Math.round(handle[0] * 0.6), Math.round(handle[1] * 0.6), Math.round(handle[2] * 0.6)], O, H: elementHue != null ? hslToRgb(elementHue, 0.3, 0.85) : [245, 245, 250], C };
    }
    case 'npc': {
      const skins = [[240, 200, 160], [210, 160, 120], [160, 110, 80], [230, 220, 200]];
      const hairs = [[40, 30, 25], [90, 60, 30], [200, 190, 60], [230, 230, 230], [120, 40, 40]];
      return { ...base, S: pick(rng, skins), K: pick(rng, hairs) };
    }
    default:
      return base;
  }
}

function normalizeRarity(input) {
  if (!input) return 'common';
  const s = String(input).toLowerCase();
  if (/mythic|신화|태초/.test(s)) return 'mythic';
  if (/legend|전설/.test(s)) return 'legendary';
  if (/epic|영웅/.test(s)) return 'epic';
  if (/rare|희귀/.test(s)) return 'rare';
  if (/uncommon|고급/.test(s)) return 'uncommon';
  return 'common';
}

/**
 * entity: { id, name, category, rarity, type }
 * category: 'weapon'|'armor'|'shield'|'potion'|'accessory'|'material'|'monster'|'npc'|'location'
 * scale: 16x16 논리 그리드를 몇 배로 확대해서 실제 PNG를 만들지 (기본 4 → 64x64)
 */
function generateIcon(entity, scale = 4) {
  const rng = makeRng(String(entity.id || entity.name || 'unknown'));
  const rarity = normalizeRarity(entity.rarity);
  const category = SHAPES[entity.category] ? entity.category
    : (entity.category === 'armor' ? 'shield' : 'material');

  if (entity.category === 'location') {
    const terrain = guessTerrain(entity.name, entity.type);
    const mask = TERRAIN_SHAPES[terrain];
    const { A, B, O, H } = rarityPalette('uncommon'); // 지형은 자연스러운 초록 계열 톤 사용 안 하고 지형별 고정색
    const TERRAIN_COLOR = {
      forest: { A: [70, 140, 70], B: [40, 90, 45], O: [15, 30, 15], H: [170, 220, 150] },
      mountain: { A: [150, 150, 160], B: [90, 90, 100], O: [30, 30, 35], H: [235, 235, 240] },
      city: { A: [190, 150, 100], B: [120, 90, 60], O: [40, 30, 20], H: [255, 240, 200] },
      water: { A: [70, 130, 200], B: [40, 80, 150], O: [20, 40, 80], H: [200, 230, 255] },
      desert: { A: [220, 190, 120], B: [180, 140, 80], O: [90, 60, 20], H: [255, 240, 190] },
      cave: { A: [110, 90, 70], B: [70, 55, 45], O: [8, 6, 10], H: [150, 145, 160] },
      plain: { A: [140, 190, 100], B: [90, 140, 70], O: [30, 30, 15], H: [230, 230, 150] },
    }[terrain];
    const colorMap = { ...TERRAIN_COLOR };
    const buf = buildIndexBuffer(mask, colorMap, scale);
    return { ...buf, meta: { category: 'location', terrain, rarity: null } };
  }

  let mask, badgeVariant = null, shapeKey = category;
  if (category === 'badge' || category === 'unclassified') {
    // 같은 배열(entity.source, 예: 'data/257.DUNGEON_GRADES')에 속한
    // 항목끼리는 같은 모양을 쓰고, 배열이 다르면 모양도 바뀐다 —
    // 개별 항목(id)이 아니라 그룹 단위로 시드를 잡는 이유.
    const variants = category === 'badge' ? BADGE_VARIANTS : UNCLASSIFIED_VARIANTS;
    const groupSeed = entity.source || entity.name || String(entity.id) || category;
    const variantRng = makeRng(category + 'variant:' + groupSeed);
    badgeVariant = Math.floor(variantRng() * variants.length);
    mask = variants[badgeVariant];
  } else {
    // 무기 종류(icon)/방어구·장신구 슬롯(slot)/재료·몬스터 종류(icon)에
    // 따라 실루엣 자체를 세분화한다 — 못 찾으면 항상 category 기본
    // 모양으로 안전하게 폴백(resolveShapeKey 내부에서 처리).
    // entity.aiSubtype이 있으면(ai-analyze.js가 텍스트 분석으로 판단한
    // 종류) 그게 icon/slot 추측보다 우선한다 — 실제 게임 데이터의
    // 이모지보다 이름/설명을 읽고 판단한 쪽이 더 정확하기 때문. 역시
    // SHAPES에 없는 값이 오면 무조건 기존 로직으로 안전하게 폴백.
    shapeKey = (entity.aiSubtype && SHAPES[entity.aiSubtype]) ? entity.aiSubtype : resolveShapeKey(category, entity);
    mask = SHAPES[shapeKey];
  }
  // entity.element(ai-analyze.js가 판단한 화염/얼음/독 등 테마)가 있으면
  // 등급 색조 대신 그 색으로 칠한다.
  const elementHue = entity.element && ELEMENT_HUE[entity.element] != null ? ELEMENT_HUE[entity.element] : undefined;
  const colorMap = colorMapFor(category, rng, rarity, elementHue);
  const buf = buildIndexBuffer(mask, colorMap, scale);
  return { ...buf, meta: { category, shapeKey, rarity, badgeVariant, element: entity.element || null } };
}

module.exports = {
  generateIcon,
  normalizeRarity,
  guessTerrain,
  resolveShapeKey,
  RARITY_ORDER,
  SHAPES,
  TERRAIN_SHAPES,
  BADGE_VARIANTS,
  UNCLASSIFIED_VARIANTS,
};
