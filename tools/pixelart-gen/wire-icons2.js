// wire-icons.js의 확장판: "태그 전체가 아이콘 하나뿐"이라는 제약을
// 풀고, 한 줄 안에서 ${EXPR.icon} / ${EXPR.icon||'fallback'} 형태의
// "독립된 템플릿 보간식" 하나를 찾으면 그 보간식 자체만 안전하게
// getEntityIconHTML 호출로 바꿔친다. 앞뒤에 다른 텍스트나 다른
// 보간식(${e.name} 등)이 같이 있어도 상관없다 — 어차피 ${...} 경계
// 안쪽만 건드리므로 주변 HTML 구조에는 손을 안 댄다.
//
// wire-icons.js가 이미 처리한 "태그=아이콘 단독" 케이스는 이제
// getEntityIconHTML(...)로 이미 바뀌어 있어서 원본 패턴과 매치되지
// 않으므로 자동으로 건너뛴다(중복 처리 없음).
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

const EXPR_RE = /\$\{([A-Za-z_$][\w$]*(?:\??\.[A-Za-z_$][\w$]*)*)\.icon(\|\|\s*(['"])((?:(?!\3).)*?)\3)?\s*\}/g;

let totalMatches = 0, totalWired = 0, totalSkippedContext = 0;
const report = [];

for (const file of files) {
  if (file.includes(path.join('tools', 'pixelart-gen'))) continue;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let changedInFile = 0;
  const newLines = lines.map((line) => {
    if (/\btoast\(|\.log\.unshift\(|console\.|\bnew Function\(/.test(line)) {
      EXPR_RE.lastIndex = 0;
      if (EXPR_RE.test(line)) totalSkippedContext++;
      EXPR_RE.lastIndex = 0;
      return line;
    }
    // 실제 HTML을 만드는 줄인지 확인하는 핵심 안전장치: 리터럴
    // <span 또는 <div 태그가 그 줄에 없으면 절대 손대지 않는다.
    // (AI 프롬프트 문구나 뉴스/로그용 서술 문자열은 애초에 HTML 태그가
    // 하나도 없다 — 실측으로 확인: ai-prompt/077의 _hint/Section류,
    // npc/067의 events.push({msg:...}) 뉴스 문구 전부 태그가 0개였음.
    // 이 필터 하나로 그 두 위험 사례가 전부 자동으로 제외된다.)
    if (!/<span[\s>]|<div[\s>]/.test(line)) {
      EXPR_RE.lastIndex = 0;
      if (EXPR_RE.test(line)) totalSkippedContext++;
      EXPR_RE.lastIndex = 0;
      return line;
    }
    EXPR_RE.lastIndex = 0;
    const matches = [];
    let m;
    while ((m = EXPR_RE.exec(line))) matches.push(m);
    if (!matches.length) return line;
    let newLine = line;
    for (const match of matches.reverse()) {
      totalMatches++;
      const [full, expr, fallbackClause, , fallbackLit] = match;
      const sizeMatch = line.match(/font-size:\s*(\d+)px/);
      const size = sizeMatch ? sizeMatch[1] : 16;
      const originalExpr = `${expr}.icon${fallbackClause ? `||${JSON.stringify(fallbackLit)}` : ''}`;
      const replacement = `\${typeof getEntityIconHTML==='function'?getEntityIconHTML(${expr},{size:${size}}):(${originalExpr})}`;
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

console.log(`${APPLY ? '적용 완료' : '드라이런(미적용)'} — 매치: ${totalMatches}, 와이어링: ${totalWired}, toast/log라 스킵: ${totalSkippedContext}`);
console.log(`영향받은 파일: ${report.length}개`);
report.sort((a, b) => b.count - a.count).forEach(r => console.log(`  ${r.count.toString().padStart(3)}  ${r.file}`));
