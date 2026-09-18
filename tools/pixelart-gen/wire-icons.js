// src/ 전체를 훑어서, "span/div 태그 안에 오직 X.icon(||'fallback') 만
// 들어있는" 깔끔하고 명확한 패턴만 골라 getEntityIconHTML() 호출로
// 자동 감싼다. 텍스트와 섞여있거나(예: "${e.icon} ${e.name}"), toast()/
// 로그 문구 안에 있는 건 절대 건드리지 않는다(일부러 신중하게 좁힘 —
// 애매한 건 그대로 두고 사람이 나중에 개별 검토).
//
// 사용법: node wire-icons.js          → 드라이런(변경 없이 목록만 출력)
//         node wire-icons.js --apply  → 실제로 파일에 적용
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '../../src');
const APPLY = process.argv.includes('--apply');

function walkFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'assets') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(p, out);
    else if (entry.name.endsWith('.js')) out.push(p);
  }
}
const files = [];
walkFiles(SRC, files);

// 태그 하나 = 열림태그 + ${EXPR.icon(||'fallback')} + 닫힘태그, 그 외
// 아무 내용도 없어야 매치(텍스트 섞이면 무시).
const TAG_RE = /(<(span|div)\b[^>]*>)\$\{([A-Za-z_$][\w$]*(?:\??\.[A-Za-z_$][\w$]*)*)\.icon(\|\|\s*(['"])((?:(?!\5).)*?)\5)?\s*\}(<\/\2>)/g;

let totalMatches = 0, totalWired = 0, totalSkippedNonClean = 0, totalSkippedContext = 0;
const report = [];

for (const file of files) {
  if (file.includes(path.join('tools', 'pixelart-gen'))) continue; // 이 툴 자신은 건드리지 않음
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let changedInFile = 0;
  const newLines = lines.map((line, idx) => {
    // toast()/로그/console 라인은 절대 건드리지 않는다(순간적 텍스트지
    // 지속되는 UI 아이콘이 아님).
    if (/\btoast\(|\.log\.unshift\(|console\./.test(line)) {
      if (TAG_RE.test(line)) totalSkippedContext++;
      TAG_RE.lastIndex = 0;
      return line;
    }
    let newLine = line;
    let m;
    TAG_RE.lastIndex = 0;
    const matches = [];
    while ((m = TAG_RE.exec(line))) matches.push(m);
    if (!matches.length) return line;
    for (const match of matches.reverse()) { // 뒤에서부터 치환(인덱스 안 밀리게)
      totalMatches++;
      const [full, openTag, tagName, expr, fallbackClause, , fallbackLit] = match;
      // 이미 getEntityIconHTML로 감싸진 라인(재실행 시 중복 방지)은
      // TAG_RE 자체가 원본 순수 패턴만 매치하므로 자연히 재매치 안 됨.
      const sizeMatch = openTag.match(/font-size:\s*(\d+)px/);
      const size = sizeMatch ? sizeMatch[1] : 16;
      const originalExpr = `${expr}.icon${fallbackClause ? `||${JSON.stringify(fallbackLit)}` : ''}`;
      const replacement = `${openTag}\${typeof getEntityIconHTML==='function'?getEntityIconHTML(${expr},{size:${size}}):(${originalExpr})}${match[match.length - 1]}`;
      newLine = newLine.slice(0, match.index) + replacement + newLine.slice(match.index + full.length);
      changedInFile++;
      totalWired++;
    }
    return newLine;
  });
  if (changedInFile > 0) {
    report.push({ file: path.relative(SRC, file), count: changedInFile });
    if (APPLY) fs.writeFileSync(file, newLines.join('\n'));
  }
}

console.log(`${APPLY ? '적용 완료' : '드라이런(미적용)'} — 대상 태그 발견: ${totalMatches}, 와이어링: ${totalWired}, toast/log라 스킵: ${totalSkippedContext}`);
console.log(`영향받은 파일: ${report.length}개`);
report.sort((a, b) => b.count - a.count).forEach(r => console.log(`  ${r.count.toString().padStart(3)}  ${r.file}`));
