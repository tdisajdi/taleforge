// wire-icons.js/wire-icons2.js는 템플릿 리터럴(`${x.icon}`) 문법만
// 잡아냈다. 실측으로 재검토해보니 82곳이 더 남아있었는데, 원인은
// 두 가지 문법 패턴을 아예 못 봤기 때문이었다:
//  1) 문자열 접합(concatenation) 스타일: `+x.icon+`, `+(x.icon||'fb')+`
//     — 이 코드베이스 곳곳(특히 오래된 구간)이 템플릿 리터럴 대신
//     `'<span>'+x.icon+'</span>'` 식으로 짜여 있다.
//  2) 대괄호 접근(bracket access): `CROP_DEFS[cropId]?.icon` —
//     기존 IDENT 정규식이 `.foo`/`?.foo` 체인만 허용하고 `[...]`는
//     못 받았음.
// 이 스크립트는 두 패턴을 모두 지원하는 더 넓은 EXPR 문법으로
// 템플릿/접합 스타일을 전부 다시 훑는다.
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

// EXPR: 식별자로 시작해서 .foo / ?.foo / [내용](단, 대괄호 안에 또
// 대괄호는 없다고 가정 — 실측상 전부 단순 변수/문자열이라 충분함)를
// 반복할 수 있다. 함수 호출(예: getX().icon)은 일부러 지원 안 함 —
// 그런 패턴은 손으로 봐야 안전.
const EXPR = String.raw`[A-Za-z_$][\w$]*(?:\??\.[A-Za-z_$][\w$]*|\[[^\[\]]{1,80}\])*`;
const QUOTED = String.raw`'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"`;

// 주의: EXPR 자체가 `?.icon`/`[...]`.icon` 형태까지 통째로 삼켜버릴
// 수 있어서(문법상 EXPR의 반복 그룹과 구분이 안 됨), 바로 뒤에 오는
// ".icon"도 optional-chaining(?.icon)일 수 있게 `\??\.icon`으로
// 받는다 — 안 그러면 `stage?.icon` 같은 흔한 패턴을 못 잡는다
// (실측으로 발견: 1차 버전이 46개 중 44개를 이 이유로 놓쳤었음).
// 1) 템플릿 리터럴: ${EXPR.icon} / ${EXPR?.icon||'fb'}
const TPL_RE = new RegExp(String.raw`\$\{(${EXPR})\??\.icon(?:\s*\|\|\s*(${QUOTED}))?\}`, 'g');
// 1-b) 템플릿 삼항: ${COND?EXPR.icon:'fb'} (else가 리터럴 문자열일 때만)
const TPL_TERNARY_RE = new RegExp(String.raw`\$\{([\w$.\[\]?]+)\?(${EXPR})\??\.icon\s*:\s*(${QUOTED})\}`, 'g');
// 2) 접합 스타일: +EXPR.icon+ / +(EXPR?.icon||'fb')+
const CONCAT_RE = new RegExp(String.raw`\+\s*\(?(${EXPR})\??\.icon(?:\s*\|\|\s*(${QUOTED}))?\)?\s*\+`, 'g');
// 2-b) 접합 삼항: +(COND?EXPR.icon:'fb')+
const CONCAT_TERNARY_RE = new RegExp(String.raw`\+\s*\(?([\w$.\[\]?]+)\?(${EXPR})\??\.icon\s*:\s*(${QUOTED})\)?\s*\+`, 'g');

let totalLines = 0, tplConverted = 0, concatConverted = 0, ternaryConverted = 0, skippedAlready = 0;
const report = [];

for (const file of files) {
  if (file.includes(path.join('tools', 'pixelart-gen'))) continue;
  if (file.includes(path.join('ai-prompt', '077')) || file.includes(path.join('npc', '067'))) continue; // AI 프롬프트/서술 텍스트 — 절대 대상 아님
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let changedInFile = 0;
  const newLines = lines.map((line) => {
    if (!/\.icon\b/.test(line)) return line;
    if (!/<span|<div/.test(line)) return line;
    if (line.includes('getEntityIconHTML')) { skippedAlready++; return line; }
    totalLines++;

    let out = line;
    // 삼항형은 EXPR.icon만 매치하는 일반형보다 먼저 처리해야 한다 —
    // 안 그러면 일반형 정규식이 삼항식 안의 "EXPR.icon" 부분만 먼저
    // 집어서 어중간하게 바꿔버릴 수 있다.
    out = out.replace(TPL_TERNARY_RE, (full, cond, expr, fb) => {
      ternaryConverted++;
      changedInFile++;
      const result = `\${${cond}?(typeof getEntityIconHTML==='function'?getEntityIconHTML(${expr},{size:14}):(${expr}?.icon)):${fb}}`;
      if (PREVIEW && previewCount < 30) { previewCount++; console.log('BEFORE:', full); console.log('AFTER :', result); console.log('---'); }
      return result;
    });
    out = out.replace(CONCAT_TERNARY_RE, (full, cond, expr, fb) => {
      ternaryConverted++;
      changedInFile++;
      const result = `+(${cond}?(typeof getEntityIconHTML==='function'?getEntityIconHTML(${expr},{size:14}):(${expr}?.icon)):${fb})+`;
      if (PREVIEW && previewCount < 30) { previewCount++; console.log('BEFORE:', full); console.log('AFTER :', result); console.log('---'); }
      return result;
    });
    out = out.replace(TPL_RE, (full, expr, fb) => {
      tplConverted++;
      changedInFile++;
      const fallback = fb !== undefined ? `||${fb}` : '';
      const result = `\${typeof getEntityIconHTML==='function'?getEntityIconHTML(${expr},{size:14}):(${expr}?.icon${fallback})}`;
      if (PREVIEW && previewCount < 30) { previewCount++; console.log('BEFORE:', full); console.log('AFTER :', result); console.log('---'); }
      return result;
    });
    out = out.replace(CONCAT_RE, (full, expr, fb) => {
      concatConverted++;
      changedInFile++;
      const fallback = fb !== undefined ? `||${fb}` : '';
      const result = `+(typeof getEntityIconHTML==='function'?getEntityIconHTML(${expr},{size:14}):(${expr}?.icon${fallback}))+`;
      if (PREVIEW && previewCount < 30) { previewCount++; console.log('BEFORE:', full); console.log('AFTER :', result); console.log('---'); }
      return result;
    });
    return out;
  });
  if (changedInFile > 0) {
    report.push({ file: path.relative(SRC, file), count: changedInFile });
    if (APPLY) fs.writeFileSync(file, newLines.join('\n'));
  }
}

console.log(`${APPLY ? '적용 완료' : '드라이런(미적용)'} — 대상 줄: ${totalLines}, 템플릿 변환: ${tplConverted}, 접합 변환: ${concatConverted}, 삼항 변환: ${ternaryConverted}, 이미 처리됨 스킵: ${skippedAlready}`);
console.log(`영향받은 파일: ${report.length}개`);
report.sort((a, b) => b.count - a.count).forEach(r => console.log(`  ${r.count.toString().padStart(3)}  ${r.file}`));
