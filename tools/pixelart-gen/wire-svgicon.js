// svgIcon 시스템(등급/단계/랭크 등 585개 정의, 손으로 그린 SVG 라인아트)의
// "표시" 지점을 찾아서 도트 아이콘으로 안전하게 연결하는 스크립트.
//
// 지금까지 만든 getEntityIconHTML(entity, opts)는 entity.id/name/label로
// PIXEL_ART_MANIFEST를 조회해서 이미지가 있으면 <img>, 없으면 그대로
// entity.icon(이모지)으로 폴백한다 — 그래서 이 렌더 지점을
// `${x.svgIcon||x.icon}` → `getEntityIconHTML(x,{size:N})`로 바꾸는 건
// "이미 매니페스트에 그 이름이 등록돼 있으면 이미지가 뜨고, 없으면
// 원래 동작(svgIcon 우선, 없으면 emoji)과 똑같이 폴백"이라 100% 안전하다.
// x가 src/data/*.js 출신이라 이미 스캔·생성됐으면 즉시 이미지가 뜨고,
// (아직 로직 파일에만 있어 스캔 안 된 항목은) scan-svgicon-defs.js가
// 나중에 등록하면 재빌드만으로 자동으로 이미지가 뜬다 — 이 파일을
// 다시 실행할 필요 없음.
//
// 매치하는 두 가지 패턴:
//  1) 단순형: `${x.svgIcon||x.icon}`
//  2) 리사이즈형: `${(x.svgIcon||'').replace('width="20" height="20"','width="N" height="N"')||x.icon}`
//     — 원본 SVG 문자열의 width/height 속성을 문자열 치환으로 줄여서
//     쓰던 것. getEntityIconHTML의 {size:N} 옵션이 같은 역할을 하므로
//     통째로 그걸로 치환한다.
//
// 안전장치: wire-icons2.js와 동일하게, 그 줄에 리터럴 `<span` 또는
// `<div`가 있는 줄만 대상으로 한다(AI 프롬프트/서술 텍스트 오탐 방지 —
// 이번 svgIcon 케이스는 전부 순수 렌더 코드로 보이지만, 동일한 안전
// 기준을 계속 적용해서 예외를 만들지 않는다).
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

const IDENT = String.raw`[A-Za-z_$][\w$]*(?:\??\.[A-Za-z_$][\w$]*)*`;
// 1) 단순형: EXPR.svgIcon||EXPR.icon (같은 EXPR, 역참조로 확인)
const SIMPLE_RE = new RegExp(`(${IDENT})\\.svgIcon\\s*\\|\\|\\s*\\1\\.icon`, 'g');
// 2) 리사이즈형: (EXPR.svgIcon||'').replace('width="20" height="20"','width="N" height="N"')||EXPR.icon
const RESIZE_RE = new RegExp(
  `\\((${IDENT})\\.svgIcon\\s*\\|\\|\\s*(['"])\\2\\)\\.replace\\((['"])width="20" height="20"\\3\\s*,\\s*(['"])width="(\\d+)" height="\\d+"\\4\\)\\s*\\|\\|\\s*\\1\\.icon`,
  'g'
);

let totalLines = 0, simpleConverted = 0, resizeConverted = 0, skippedNoTag = 0;
const report = [];

for (const file of files) {
  if (file.includes(path.join('tools', 'pixelart-gen'))) continue;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let changedInFile = 0;
  const newLines = lines.map((line) => {
    if (!/\.svgIcon\b/.test(line)) return line;
    totalLines++;
    // 안전장치: 진짜 HTML을 만드는 줄만(태그 리터럴이 있어야) 대상으로 한다.
    if (!/<span|<div/.test(line)) { skippedNoTag++; return line; }

    let out = line;
    out = out.replace(RESIZE_RE, (full, expr, _q1, _q2, _q3, size) => {
      resizeConverted++;
      changedInFile++;
      const result = `typeof getEntityIconHTML==='function'?getEntityIconHTML(${expr},{size:${size}}):(${full})`;
      if (PREVIEW && previewCount < 20) { previewCount++; console.log('BEFORE:', full); console.log('AFTER :', result); console.log('---'); }
      return result;
    });
    out = out.replace(SIMPLE_RE, (full, expr) => {
      simpleConverted++;
      changedInFile++;
      const result = `typeof getEntityIconHTML==='function'?getEntityIconHTML(${expr},{size:16}):(${full})`;
      if (PREVIEW && previewCount < 20) { previewCount++; console.log('BEFORE:', full); console.log('AFTER :', result); console.log('---'); }
      return result;
    });
    return out;
  });
  if (changedInFile > 0) {
    report.push({ file: path.relative(SRC, file), count: changedInFile });
    if (APPLY) fs.writeFileSync(file, newLines.join('\n'));
  }
}

console.log(`${APPLY ? '적용 완료' : '드라이런(미적용)'} — svgIcon 참조 있는 줄: ${totalLines}, 단순형 변환: ${simpleConverted}, 리사이즈형 변환: ${resizeConverted}, 태그 없어 스킵: ${skippedNoTag}`);
console.log(`영향받은 파일: ${report.length}개`);
report.sort((a, b) => b.count - a.count).forEach(r => console.log(`  ${r.count.toString().padStart(3)}  ${r.file}`));
