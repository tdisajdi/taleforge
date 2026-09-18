// Builds src/ (the modular source) back into a single playable taleforge.html.
// Usage: npm install && npm run build
// Output: dist/taleforge.html
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = __dirname;

async function main() {
  const result = await esbuild.build({
    entryPoints: [path.join(ROOT, 'src', 'main.js')],
    bundle: true,
    format: 'iife',
    write: false,
    logLevel: 'info',
  });

  const bundleJs = result.outputFiles[0].text;
  const template = fs.readFileSync(path.join(ROOT, 'template.html'), 'utf8');
  // Use a function replacer, not a string one -- String.replace() treats a
  // string replacement specially ($&, $$, $`, $', $1-$99), and the ~9MB
  // bundle inevitably contains literal "$&" etc. inside regex-replace calls
  // in the game's own code, which would otherwise get silently corrupted.
  const finalHtml = template.replace('/*__TALEFORGE_BUNDLE__*/', () => bundleJs);

  fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
  const outPath = path.join(ROOT, 'dist', 'taleforge.html');
  fs.writeFileSync(outPath, finalHtml);
  console.log('Built:', outPath, `(${(finalHtml.length / 1024 / 1024).toFixed(1)} MB)`);

  // tools/pixelart-gen이 생성한 도트 아이콘 이미지들을 dist/assets/로
  // 복사한다. 매니페스트 자체는 번들 JS 안에 이미 들어있지만(위 참고),
  // 실제 <img src="assets/..."> 참조가 가리키는 파일은 taleforge.html
  // 옆에 실제로 있어야 한다.
  const assetsSrc = path.join(ROOT, 'src', 'assets');
  const assetsDest = path.join(ROOT, 'dist', 'assets');
  if (fs.existsSync(assetsSrc)) {
    fs.rmSync(assetsDest, { recursive: true, force: true });
    fs.cpSync(assetsSrc, assetsDest, { recursive: true });
    console.log('Copied assets:', assetsDest);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
