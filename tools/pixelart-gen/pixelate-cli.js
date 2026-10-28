// pixelate.js/png-encoder.js를 다른 언어(예: taleforge_graphic의 파이썬)에서
// subprocess로 호출할 수 있게 하는 커맨드라인 래퍼. 양자화 로직 자체는 전혀
// 새로 안 짜고 이미 검증된 두 모듈을 그대로 가져다 쓴다 — 로직이 두 언어에
// 중복되는 걸 막기 위함.
//
// 사용법: node pixelate-cli.js <입력.png> <출력.png> [--gridSize=64] [--maxColors=48] [--alphaThreshold=96]
const fs = require('fs');
const path = require('path');
const { pixelateToIndexed } = require('./pixelate.js');
const { encodePalettePNG } = require('./png-encoder.js');

function arg(name, def) {
  const hit = process.argv.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : def;
}

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output || input.startsWith('--')) {
  console.error('사용법: node pixelate-cli.js <입력.png> <출력.png> [--gridSize=64] [--maxColors=48] [--alphaThreshold=96]');
  process.exit(1);
}
const gridSize = parseInt(arg('gridSize', '64'), 10);
const maxColors = parseInt(arg('maxColors', '48'), 10);
const alphaThreshold = parseInt(arg('alphaThreshold', '96'), 10);

try {
  const raw = fs.readFileSync(input);
  const indexed = pixelateToIndexed(raw, { gridSize, maxColors, alphaThreshold });
  const png = encodePalettePNG(indexed);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, png);
  console.log(JSON.stringify({ ok: true, output, bytes: png.length, gridSize, maxColors }));
} catch (e) {
  console.error(JSON.stringify({ ok: false, error: e.message }));
  process.exit(1);
}
