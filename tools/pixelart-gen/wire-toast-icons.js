// toast(`${x.icon} 나머지 텍스트`, ms) 형태 — 아이콘이 템플릿 맨 앞에
// 단독으로 오는, 가장 흔하고 안전하게 기계적으로 바꿀 수 있는 패턴만
// 골라서 toast(`나머지 텍스트`, ms, x) 형태로 바꾼다. (utils.js의
// toast()가 3번째 인자로 아이콘 엔티티를 받아 안전하게 렌더링한다 —
// msg 텍스트 자체는 여전히 textContent라 바뀌지 않음.)
//
// 아이콘이 문장 중간/두 번 나오는 등 복잡한 경우는 건드리지 않는다
// (기존처럼 이모지 텍스트 그대로 유지 — 안전 우선).
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

// toast(` + ${EXPR.icon(||'fb')?} + 공백? + REST(백틱까지, 백틱/backslash 이스케이프는 없다고 가정) + ` + , ARGS) 형태.
// REST 안에 중첩 백틱(템플릿 리터럴)이 없는 "한 줄짜리 단순 toast" 만 대상으로 한다.
const TOAST_RE = /\btoast\(`\$\{([A-Za-z_$][\w$]*(?:\??\.[A-Za-z_$][\w$]*)*)\.icon(?:\|\|\s*(['"])(?:(?!\2).)*?\2)?\s*\}\s*([^`]*)`(\s*(?:,\s*([^)]*))?)\)/g;

let totalMatches = 0, totalWired = 0;
const report = [];

for (const file of files) {
  if (file.includes(path.join('tools', 'pixelart-gen'))) continue;
  const content = fs.readFileSync(file, 'utf8');
  let changedInFile = 0;
  const newContent = content.replace(TOAST_RE, (full, expr, _q, rest, tailArgs, msArg) => {
    totalMatches++;
    // tailArgs already includes the leading comma+ms if present, e.g. ", 2500"
    // We need to insert ", EXPR" as a 3rd arg after ms (or after msg if no ms was given).
    let newTail;
    if (tailArgs && tailArgs.trim()) {
      newTail = `${tailArgs}, ${expr})`;
    } else {
      newTail = `, undefined, ${expr})`;
    }
    changedInFile++;
    totalWired++;
    return `toast(\`${rest}\`${newTail}`;
  });
  if (changedInFile > 0) {
    report.push({ file: path.relative(SRC, file), count: changedInFile });
    if (APPLY) fs.writeFileSync(file, newContent);
  }
}

console.log(`${APPLY ? '적용 완료' : '드라이런(미적용)'} — 매치: ${totalMatches}, 와이어링: ${totalWired}`);
console.log(`영향받은 파일: ${report.length}개`);
report.sort((a, b) => b.count - a.count).forEach(r => console.log(`  ${r.count.toString().padStart(3)}  ${r.file}`));
