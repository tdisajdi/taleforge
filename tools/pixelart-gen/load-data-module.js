// src/data/*.js 는 거의 전부(122/127) 다른 파일을 import하지 않는
// 순수 데이터 모듈이다(export const X = {...} 형태). esbuild로 ES
// 모듈을 CJS로 변환한 뒤 직접 실행해서 "진짜 JS 객체"를 얻는다 —
// 정규식으로 문자열을 긁는 것보다 훨씬 정확하다(중첩/줄바꿈/포매팅에
// 흔들리지 않음). import가 있는 소수 파일은 안전한 스텁(proxy)으로
// 대체해서 로드가 깨지지 않게 한다.
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const vm = require('vm');

// 어떤 프로퍼티에 접근해도, 어떤 함수로 호출해도 조용히 무언가를
// 돌려주는 만능 스텁. import된 헬퍼가 모듈 top-level에서 호출돼도
// 최소한 로딩 자체는 안 깨지게 하기 위한 안전장치.
function makeStub() {
  const fn = () => makeStub();
  return new Proxy(fn, {
    get: (t, p) => (p === Symbol.toPrimitive ? () => 0 : makeStub()),
    apply: () => makeStub(),
  });
}

function loadDataModule(absPath) {
  const src = fs.readFileSync(absPath, 'utf8');
  const { code } = esbuild.transformSync(src, { format: 'cjs', loader: 'js' });
  return runWithVm(code, absPath, () => makeStub());
}

function runWithVm(code, absPath, stubRequire) {
  const sandboxModule = { exports: {} };
  const context = {
    module: sandboxModule,
    exports: sandboxModule.exports,
    require: stubRequire,
    __filename: absPath,
    __dirname: path.dirname(absPath),
    console,
    S: makeStub(), // 일부 파일이 전역 S(세션 상태)를 top-level에서 참조할 가능성 대비
  };
  vm.createContext(context);
  try {
    vm.runInContext(code, context, { filename: absPath, timeout: 5000 });
    return context.module.exports;
  } catch (e) {
    return { __error: e.message };
  }
}

module.exports = { loadDataModule };
