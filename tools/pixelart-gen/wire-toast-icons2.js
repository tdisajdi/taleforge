// wire-toast-icons.js가 처리 못한 나머지 toast() 호출 — 아이콘이
// 문장 중간에 있거나 한 메시지에 여러 개 섞인 경우 — 를 위한 확장판.
//
// 핵심 안전 근거: `x.icon` 값은 항상 우리 데이터가 정한 소수의 이모지
// 문자(또는 정해진 기본값)이지, AI가 즉석에서 만든 자유 텍스트가 아니다
// — 그래서 신뢰하고 바로 이미지로 바꿔도 된다. 반면 `${item.name}`,
// `${a}`(NPC 이름) 같은 나머지 보간식은 자유 텍스트일 수 있으므로
// 전부 esc()로 감싼다. 이렇게 만든 결과를 toastHTML()(innerHTML 기반)
// 로 렌더링한다.
//
// 안전장치: 템플릿 내용에 중첩 `{}` 가 있는 보간식(예: 화살표 함수,
// 삼항연산자 안에 또 객체가 있는 복잡한 경우)은 이 스크립트의 단순
// "중첩 없는 ${...}만" 매칭 방식으로는 안전하게 못 나누므로, 그런
// toast는 통째로 건드리지 않고 원래 이모지 그대로 둔다.
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '../../src');
const APPLY = process.argv.includes('--apply');
const PREVIEW = process.argv.includes('--preview');
let previewCount = 0;

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

// toast(`CONTENT`, ...ARGS)  — CONTENT 안에 백틱은 없다고 가정(일반적인 케이스).
const TOAST_CALL_RE = /\btoast\(`([^`]*)`(\s*(?:,[^)]*)?)\)/g;
// CONTENT 안의 개별 보간식(중첩 {} 없는 것만).
const INTERP_RE = /\$\{([^{}]*)\}/g;
const ICON_EXPR_RE = /^([A-Za-z_$][\w$]*(?:\??\.[A-Za-z_$][\w$]*)*)\.icon(?:\|\|\s*(['"])((?:(?!\2).)*?)\2)?\s*$/;

let totalToastCalls = 0, converted = 0, skippedNested = 0, skippedNoIcon = 0, skippedAlreadyHasIconArg = 0;
const report = [];

for (const file of files) {
  if (file.includes(path.join('tools', 'pixelart-gen'))) continue;
  const content = fs.readFileSync(file, 'utf8');
  let changedInFile = 0;
  const newContent = content.replace(TOAST_CALL_RE, (full, inner, tailArgs, offset) => {
    totalToastCalls++;
    // 이미 toast(msg, ms, icon) 3번째 인자 형태로 쓰이고 있는 호출은
    // 절대 건드리지 않는다 — toastHTML(html, ms)로 바꾸면 그 3번째
    // 인자가 조용히 사라져서 이미 정상 동작하던 아이콘 표시가
    // 퇴행한다(실측으로 발견: progression/020의
    // `toast(\`...\`, 4000, res)` — res가 GRUDGE_RESOLUTIONS 항목으로,
    // 이미 정상적으로 아이콘을 보여주고 있었음).
    const argCount = tailArgs.split(',').length - 1; // 앞에 msg 하나는 별도이므로 쉼표 개수 = 추가 인자 수
    if (argCount >= 2) { skippedAlreadyHasIconArg++; return full; }
    // 이 템플릿에 .icon 참조가 없으면 손댈 이유가 없다(범위 밖).
    if (!/\.icon\b/.test(inner)) { skippedNoIcon++; return full; }
    // 원본 문자열에서 중첩 { }가 있는지(단순 매칭으로 못 다루는 경우) 확인.
    // INTERP_RE로 모두 걷어냈을 때 남는 `${`/`}` 잔여가 있으면 중첩된 것.
    let hasNested = false;
    const stripped = inner.replace(INTERP_RE, '');
    if (/\$\{|\}/.test(stripped)) hasNested = true;
    if (hasNested) { skippedNested++; return full; }

    const rebuilt = inner.replace(INTERP_RE, (m, expr) => {
      const iconMatch = expr.match(ICON_EXPR_RE);
      if (iconMatch) {
        const [, varExpr, , fallback] = iconMatch;
        const orig = `${varExpr}.icon${fallback !== undefined ? `||${JSON.stringify(fallback)}` : ''}`;
        return `\${typeof getEntityIconHTML==='function'?getEntityIconHTML(${varExpr},{size:14}):(${orig})}`;
      }
      // 이미 esc(...)로 감싸져 있으면 중복으로 또 감싸지 않는다.
      if (/^esc\(.*\)$/.test(expr.trim())) return `\${${expr}}`;
      return `\${esc(${expr})}`;
    });
    converted++;
    changedInFile++;
    const result = `toastHTML(\`${rebuilt}\`${tailArgs})`;
    if (PREVIEW && previewCount < 25) { previewCount++; console.log('BEFORE:', full); console.log('AFTER :', result); console.log('---'); }
    return result;
  });
  if (changedInFile > 0) {
    report.push({ file: path.relative(SRC, file), count: changedInFile });
    if (APPLY) fs.writeFileSync(file, newContent);
  }
}

console.log(`${APPLY ? '적용 완료' : '드라이런(미적용)'} — 전체 toast() 호출: ${totalToastCalls}, 변환: ${converted}, 중첩({}) 있어서 스킵: ${skippedNested}, .icon 없어서 대상 아님: ${skippedNoIcon}`);
console.log(`영향받은 파일: ${report.length}개`);
report.sort((a, b) => b.count - a.count).forEach(r => console.log(`  ${r.count.toString().padStart(3)}  ${r.file}`));
