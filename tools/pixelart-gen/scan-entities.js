// TaleForge 전용 스캐너 (다른 게임에 이 툴을 옮기면 이 파일만 새로
// 짜면 된다 — png-encoder.js/generators.js는 손댈 필요 없음).
//
// src/data/*.js 를 실제로 로드해서(정규식이 아니라 진짜 JS 객체로)
// "이름 + 아이콘(이모지)"을 가진 항목을 전부 찾아내고, 주변 필드로
// 카테고리를 추정한다. 확신이 없는 항목은 'unclassified'로 남겨서
// 무작정 잘못 분류하지 않는다.
const fs = require('fs');
const path = require('path');
const { loadDataModule } = require('./load-data-module.js');

const DATA_DIR = path.resolve(__dirname, '../../src/data');

// 이모지 → 카테고리 힌트 (필드 기반 판단이 실패했을 때의 최후 수단)
const EMOJI_CATEGORY = {
  weapon: ['⚔️', '🗡️', '🔪', '🏹', '🔨', '🪓', '🔱', '💥'],
  shield: ['🛡️'],
  potion: ['🧪', '🍶', '💊', '🧴', '⚗️'],
  accessory: ['💍', '📿', '💎', '👑', '🎗️'],
  material: ['🪨', '⛏️', '🌾', '🪵', '🧵', '🥩', '🍖', '🥔', '🌿', '🌶️', '🪻', '🥀'],
  monster: ['👹', '🐺', '🐉', '👻', '🧟', '🦂', '🕷️', '🐍', '👺', '💀', '🦇', '🐗'],
  npc: ['🧙', '🧑', '💂', '🧝', '🧔', '👤', '🤴', '👸', '🧑‍🌾', '🧑‍⚕️'],
  location: ['🏰', '🏙️', '🌲', '⛰️', '🏔️', '🏜️', '🌊', '🏕️', '⛩️', '🕳️'],
};
const EMOJI_TO_CAT = {};
for (const [cat, list] of Object.entries(EMOJI_CATEGORY)) for (const e of list) EMOJI_TO_CAT[e] = cat;

// ITEM_POOL 같은 구조는 부모 키가 곧 장비 슬롯이다(006번 파일에서
// 실측 확인: weapon/subweapon/helmet/armor/gloves/boots/cloak/
// necklace/ring/belt/trinket/consume). 필드 추측보다 훨씬 신뢰도가
// 높으므로 최우선으로 검사한다.
const SLOT_KEY_MAP = {
  weapon: 'weapon', subweapon: 'weapon',
  helmet: 'shield', armor: 'shield', gloves: 'shield', boots: 'shield', cloak: 'shield',
  necklace: 'accessory', ring: 'accessory', belt: 'accessory', trinket: 'accessory', earring: 'accessory', amulet: 'accessory',
  consume: 'potion',
};

function classify(entity, ctxKeyPath, usedLabelField) {
  const f = entity;
  const has = (...keys) => keys.some(k => f[k] !== undefined);

  // 0) 부모 키(장비 슬롯 등) 기반 — 가장 신뢰도 높음
  const immediateParentKey = ctxKeyPath[ctxKeyPath.length - 1];
  if (SLOT_KEY_MAP[immediateParentKey]) return SLOT_KEY_MAP[immediateParentKey];

  // 0-0) 감정/기분/별자리류는 아이콘 자체(표정 이모지, 별자리 기호)가
  // 이미 뜻을 전달하므로, 억지로 어떤 카테고리에 끼워 맞춰 도트
  // 이미지로 바꾸면 오히려 정보 손실이다 — 아예 스캔 대상에서
  // 제외해서 원래 이모지 그대로 남긴다(unclassified로도 안 감).
  const upperPathEarly = ctxKeyPath.join('.').toUpperCase();
  if (/EMOTION|MOOD|CONSTELLATION/.test(upperPathEarly) && !has('dangerLevel', 'locTypes', 'hp', 'atk', 'def')) return null;

  // 0-1) name 대신 label을 쓰는 항목은 실측 결과 거의 다 "등급/단계/
  // 티어" 배지류다(DUNGEON_GRADES 등) — 실체(물건)가 아니라 상태
  // 표시이므로 기본은 badge. 단, 아래 1)에서 location/monster처럼
  // 더 구체적인 필드 신호가 있으면 그쪽이 우선한다(먼저 검사 안 하고
  // 계속 진행).
  // EMOTION/MOOD류는 label+icon 구조를 쓰지만 그 icon이 실제 표정
  // 이모지(😊😠😢...)라서, 추상 메달로 바꾸면 오히려 정보 손실이다
  // (실측 발견: EMOTION_DEFS/EMOTION_ECHOES/NPC_EMOTIONS/MOOD_INFO 등) —
  // 배지 기본 분류에서 제외하고 원래 이모지 그대로 폴백시킨다.
  const upperPathForEmotion = ctxKeyPath.join('.').toUpperCase();
  const isEmotionLike = /EMOTION|MOOD/.test(upperPathForEmotion);
  if (usedLabelField && !isEmotionLike && !has('dangerLevel', 'locTypes', 'hp')) return 'badge';

  // 0-2) JOB_DEFS/BASE_JOBS/HERO_.../PANTHEON 같은 배열의 "직접" 원소는
  // 인물(직업/영웅/신격) 개념이지 장비가 아니다. 그런데 기본 atk/def
  // 스탯 필드를 같이 갖고 있으면 바로 아래 1)의 무기/방패 필드 규칙에
  // 먼저 걸려서 오분류되는 게 실측으로 확인됐다(042/208의 직업 정의들 —
  // "전사"/"도적"/"궁수"가 무기 아이콘으로 잘못 나오고 있었음). 진짜
  // 장비 아이템이면 항상 0)에서 SLOT_KEY_MAP으로 먼저 걸러지므로,
  // (중첩된 .skills 같은 하위 배열은 해당 안 되고) 부모 키 자체가
  // JOB/HERO/PANTHEON일 때만 안전하게 인물로 본다.
  // 배열 형태(BASE_JOBS = [...])면 원소들의 바로 위 부모 키가
  // 'BASE_JOBS' 자체지만, 객체 형태(JOB_DEFS = {warrior:{...}})면
  // 원소들의 부모 키는 그 id('warrior')라서 한 단계 더 위(조부모 키
  // 'JOB_DEFS')를 봐야 한다 — 실측: 208번 파일이 이 객체 형태.
  // 단, job 안에 중첩된 스킬/특성 배열(.skills 등)까지 조부모 검사에
  // 걸려서 오탐되면 안 되므로 그런 하위 컬렉션 이름은 제외한다.
  const immediateParentUpper = String(immediateParentKey || '').toUpperCase();
  const grandParentUpper = String(ctxKeyPath[ctxKeyPath.length - 2] || '').toUpperCase();
  const looksLikeSubCollection = /^(SKILLS?|ABILITIES|SPELLS?|PERKS?|TRAITS?)$/.test(immediateParentUpper);
  if (!looksLikeSubCollection && (/JOB|HERO|PANTHEON/.test(immediateParentUpper) || /JOB|HERO|PANTHEON/.test(grandParentUpper)) && !has('slot')) return 'npc';

  // 1) 필드 기반
  if (has('dangerLevel', 'locTypes') || (typeof f.type === 'string' && ['city', 'town', 'village', 'hamlet', 'major', 'port', 'capital', 'dungeon', 'wilderness'].includes(f.type))) return 'location';
  if (has('hp') && has('exp', 'drop', 'danger', 'atk')) return 'monster';
  if (has('dialogue', 'affinity') || (has('race') && has('name') && !has('atk', 'def'))) return 'npc';
  if (has('atk', 'weaponType', 'dmg', 'damage') && !has('heal')) return 'weapon';
  if (has('def', 'armor', 'defense')) return 'shield';
  if (f.type === 'consume' || (has('heal', 'effect') && !has('atk', 'def'))) return 'potion';
  if (has('slot') && ['ring', 'necklace', 'accessory', 'amulet', 'earring'].includes(f.slot)) return 'accessory';
  if (has('craftMaterial') || f.type === 'material') return 'material';

  // 2) 이모지 기반
  if (typeof f.icon === 'string' && EMOJI_TO_CAT[f.icon]) return EMOJI_TO_CAT[f.icon];

  // 3) export 변수명/경로 기반 (필드로 구분 안 되는 추상 개념들)
  const upperPath = ctxKeyPath.join('.').toUpperCase();
  if (/TITLE/.test(upperPath)) return 'title';
  if (/ACHIEVEMENT|CHALLENGE_DEF/.test(upperPath)) return 'achievement';
  if (/SKILL|STAT_DEF|SPELL/.test(upperPath)) return 'skill';
  if (/CRAFT|RECIPE|BLUEPRINT|MATERIAL|GEM_TYPE|ORE|RELIC|ARTIFACT/.test(upperPath)) return 'material';
  if (/JOB|HERO|NPC|PANTHEON/.test(upperPath)) return 'npc';
  if (/MONSTER|ENEMY|BOSS|LINEAGE/.test(upperPath)) return 'monster';
  if (/LOCATION|LOC_|PLACE|FACTION/.test(upperPath)) return 'location';
  if (/WEAPON/.test(upperPath)) return 'weapon';
  if (/POTION|CONSUME/.test(upperPath)) return 'potion';
  if (/QUEST|EVENT|ENDING|GOAL/.test(upperPath)) return null; // 서사 개념은 시각 자산 대상이 아님(스킵)

  // 4) 그 밖의 흔한 추상 개념 — unclassified(범용 재료 폴백)로 남기기
  // 전에 한 번 더 시도. 실측 결과(scan-result.json) 상위 unclassified
  // 그룹들을 훑어서 찾은, 이름만 봐도 명확한 패턴들.
  // 등급/단계/숙련도/서약 단계류는 badge와 같은 "상태 표시" 개념이다.
  if (/TIER|STAGE|RANK|GRADE|PHASE|MASTERY|PACT/.test(upperPath)) return 'badge';
  // 은신처 시설/섬은 실체가 있는 "장소"다.
  if (/HIDEOUT|FACILIT|ISLAND/.test(upperPath)) return 'location';
  // 펫 종류는 동물 실루엣(monster 마스크)과 시각 언어가 같다.
  if (/PET_TYPE/.test(upperPath)) return 'monster';

  return 'unclassified';
}

function extractRarity(f) {
  return f.rarity || f.grade || f.tier || null;
}

// 재귀적으로 객체/배열을 훑어서 "이름+아이콘을 가진 리프 객체"를 찾는다.
// 너무 깊이 들어가면 svgIcon 같은 무관한 중첩 구조까지 훑게 되므로
// 최대 깊이를 둔다.
function walk(node, ctxPath, out, seen, depth = 0) {
  if (depth > 6 || node == null || typeof node !== 'object') return;
  if (seen.has(node)) return;
  seen.add(node);

  // 대부분의 실체(아이템/몬스터/NPC/장소)는 name+icon이지만, 등급/
  // 단계/티어 같은 "추상 상태 배지"류는 name 대신 label 필드를 쓴다
  // (실측 확인: DUNGEON_GRADES 등 — data/257 등 30개+ 파일). 둘 다
  // 커버해야 실제 게임에서 쓰이는 .icon 참조를 빠짐없이 잡아낸다.
  const displayName = typeof node.name === 'string' ? node.name
    : (typeof node.label === 'string' ? node.label : null);
  if (!Array.isArray(node) && displayName && typeof node.icon === 'string') {
    const usedLabelField = typeof node.name !== 'string';
    const cat = classify(node, ctxPath, usedLabelField);
    if (cat) {
      // 장비 슬롯(무기/방어구/장신구의 실제 부위)은 SLOT_KEY_MAP이
      // 인식하는 부모 키일 때만 신뢰할 수 있다(그 키에 걸려서 이미
      // 카테고리가 정해졌으므로) — pixelart-gen의 서브타입 실루엣
      // 선택(resolveShapeKey)이 이 값으로 헬멧/장화/목걸이/반지 등을
      // 구분한다. 못 찾으면 null로 둬서 항상 기본 모양으로 안전하게
      // 폴백하게 한다(generators.js 참고).
      const immediateParentKey = ctxPath[ctxPath.length - 1];
      const slot = SLOT_KEY_MAP[immediateParentKey] ? immediateParentKey : null;
      out.push({
        id: node.id || `${ctxPath.join('/')}#${displayName}`,
        name: displayName,
        icon: node.icon,
        category: cat,
        rarity: extractRarity(node),
        type: typeof node.type === 'string' ? node.type : null,
        slot,
        source: ctxPath.join('.'),
      });
    }
    // 이름+아이콘 리프를 찾았어도, 그 안에 또 다른 하위 엔티티가
    // 중첩돼 있을 수 있으니 계속 훑는다(예: NPC 안의 소지 아이템 목록).
  }

  if (Array.isArray(node)) {
    node.forEach((child, i) => walk(child, ctxPath, out, seen, depth + 1));
  } else {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'svgIcon') continue; // SVG 문자열 필드는 순회 불필요
      walk(v, [...ctxPath, k], out, seen, depth + 1);
    }
  }
}

function scanAll() {
  // 900-pixelart-manifest.js는 이 스캐너 자신이 만든 출력물이다 —
  // 게임 콘텐츠가 아니므로 스캔 대상에서 제외(안 그러면 재실행할
  // 때마다 이전 결과를 자기 자신이 다시 읽으려 드는 불필요한 순환).
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.js') && f !== '900-pixelart-manifest.js');
  const entities = [];
  const errors = [];
  for (const file of files) {
    const abs = path.join(DATA_DIR, file);
    const mod = loadDataModule(abs);
    if (mod.__error) { errors.push({ file, error: mod.__error }); continue; }
    for (const [exportName, value] of Object.entries(mod)) {
      const seen = new WeakSet();
      walk(value, [file.replace(/\.js$/, ''), exportName], entities, seen);
    }
  }
  return { entities, errors, fileCount: files.length };
}

module.exports = { scanAll, classify };

if (require.main === module) {
  const { entities, errors, fileCount } = scanAll();
  // id 중복 제거(같은 항목이 여러 export 경로에서 재참조되는 경우 대비)
  const byId = new Map();
  for (const e of entities) if (!byId.has(e.id)) byId.set(e.id, e);
  const unique = [...byId.values()];

  const byCategory = {};
  for (const e of unique) byCategory[e.category] = (byCategory[e.category] || 0) + 1;

  console.log(`스캔한 데이터 파일: ${fileCount}개, 로드 실패: ${errors.length}개`);
  if (errors.length) console.log('로드 실패 목록:', errors.map(e => e.file).join(', '));
  console.log(`발견한 항목(중복 제거 전): ${entities.length}, (중복 제거 후): ${unique.length}`);
  console.log('카테고리별 분포:', byCategory);
  console.log('\nunclassified 샘플 20개:');
  unique.filter(e => e.category === 'unclassified').slice(0, 20).forEach(e => console.log(` - [${e.source}] ${e.icon} ${e.name}`));

  fs.writeFileSync(path.join(__dirname, 'scan-result.json'), JSON.stringify(unique, null, 1));
  console.log('\n전체 목록 저장: tools/pixelart-gen/scan-result.json');
}
