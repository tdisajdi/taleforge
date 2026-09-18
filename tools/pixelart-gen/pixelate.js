// AI가 그린 원본 이미지(큰 해상도, 자유 색상)를 강제로 "진짜 도트"
// 형식(작은 고정 그리드 + 제한된 인덱스 팔레트)으로 변환하는 파이프라인.
// 이 파일을 거치지 않은 이미지는 절대 assets/img에 저장되지 않는다 —
// AI는 "무엇을 그릴지"만 담당하고, 최종 파일의 형식(작은 용량,
// 안티앨리어싱 없는 딱 떨어지는 픽셀)은 항상 이 코드가 강제한다.
const { PNG } = require('pngjs');

// ---------- 1) 디코딩: PNG 바이트 -> RGBA 픽셀 배열 ----------
function decodePNG(buffer) {
  const png = PNG.sync.read(buffer);
  return { width: png.width, height: png.height, data: png.data }; // data: RGBA, 1바이트씩
}

// ---------- 2) 다운스케일: 박스 필터(블록 평균) ----------
// 단순 최근접(nearest-neighbor)은 사진처럼 디테일 많은 원본에서
// 특정 픽셀 하나만 뽑다 보니 이가 나가거나 노이즈가 튈 수 있다.
// 블록 전체를 평균 내면 경계가 훨씬 안정적으로 정리된다.
function boxDownscale(src, dstSize) {
  const { width: sw, height: sh, data } = src;
  const out = new Float64Array(dstSize * dstSize * 4);
  const count = new Float64Array(dstSize * dstSize);
  for (let sy = 0; sy < sh; sy++) {
    const dy = Math.min(dstSize - 1, Math.floor((sy / sh) * dstSize));
    for (let sx = 0; sx < sw; sx++) {
      const dx = Math.min(dstSize - 1, Math.floor((sx / sw) * dstSize));
      const di = dy * dstSize + dx;
      const si = (sy * sw + sx) * 4;
      out[di * 4] += data[si];
      out[di * 4 + 1] += data[si + 1];
      out[di * 4 + 2] += data[si + 2];
      out[di * 4 + 3] += data[si + 3];
      count[di]++;
    }
  }
  const rgba = new Uint8ClampedArray(dstSize * dstSize * 4);
  for (let i = 0; i < dstSize * dstSize; i++) {
    const c = count[i] || 1;
    rgba[i * 4] = out[i * 4] / c;
    rgba[i * 4 + 1] = out[i * 4 + 1] / c;
    rgba[i * 4 + 2] = out[i * 4 + 2] / c;
    rgba[i * 4 + 3] = out[i * 4 + 3] / c;
  }
  return { width: dstSize, height: dstSize, data: rgba };
}

// ---------- 3) 색상 양자화: median-cut ----------
// 그라데이션/미묘한 색 차이를 제거해서 "딱 떨어지는 몇 가지 색"으로
// 강제 압축한다 — 이게 없으면 AI 원본의 부드러운 그림자/하이라이트가
// 그대로 남아서 "도트처럼 생겼지만 사실은 그냥 작은 사진"이 된다.
function medianCut(pixels, maxColors) {
  if (pixels.length === 0) return [[128, 128, 128]];
  let buckets = [pixels];
  while (buckets.length < maxColors) {
    let splitIdx = -1, maxRange = -1, splitChannel = 0;
    buckets.forEach((bucket, i) => {
      if (bucket.length < 2) return;
      for (let ch = 0; ch < 3; ch++) {
        let lo = 255, hi = 0;
        for (const p of bucket) { if (p[ch] < lo) lo = p[ch]; if (p[ch] > hi) hi = p[ch]; }
        const range = hi - lo;
        if (range > maxRange) { maxRange = range; splitIdx = i; splitChannel = ch; }
      }
    });
    if (splitIdx === -1 || maxRange <= 0) break; // 더 쪼갤 게 없음(단색 등)
    const bucket = buckets[splitIdx];
    bucket.sort((a, b) => a[splitChannel] - b[splitChannel]);
    const mid = Math.floor(bucket.length / 2);
    buckets.splice(splitIdx, 1, bucket.slice(0, mid), bucket.slice(mid));
  }
  return buckets.filter(b => b.length > 0).map(bucket => {
    const sum = [0, 0, 0];
    for (const p of bucket) { sum[0] += p[0]; sum[1] += p[1]; sum[2] += p[2]; }
    return [Math.round(sum[0] / bucket.length), Math.round(sum[1] / bucket.length), Math.round(sum[2] / bucket.length)];
  });
}
function nearestPaletteIndex(palette, r, g, b) {
  let best = 0, bestDist = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const [pr, pg, pb] = palette[i];
    const d = (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2;
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return best;
}

/**
 * AI가 생성한 PNG 바이트를 받아서 generateIcon()과 완전히 동일한
 * {width, height, indices, palette} 형태로 반환한다 — 그래서 기존
 * encodePalettePNG()에 그대로 넣어 저장하면 절차적 생성 결과물과
 * 100% 같은 형식(작은 인덱스 컬러 PNG)이 나온다.
 * @param {Buffer} pngBuffer AI가 만든 원본 PNG (큰 해상도 OK)
 * @param {object} opts { gridSize: 64, maxColors: 48, alphaThreshold: 96 }
 *   gridSize/maxColors를 낮추면 옛날 콘솔풍(거친 계단, 색 적음)에
 *   가까워지고, 올리면 요즘 인디게임 도트아트풍(부드러운 음영,
 *   하이라이트 반사광)에 가까워진다 — 어느 쪽이든 안티앨리어싱 없는
 *   진짜 인덱스 컬러 도트라는 본질은 동일하다. 파일 용량 차이는
 *   미미하다(64/48 기준 장당 1KB 안쪽).
 */
function pixelateToIndexed(pngBuffer, opts = {}) {
  const gridSize = opts.gridSize || 64;
  const maxColors = opts.maxColors || 48;
  const alphaThreshold = opts.alphaThreshold ?? 96;

  const src = decodePNG(pngBuffer);
  const small = boxDownscale(src, gridSize);

  const opaquePixels = [];
  for (let i = 0; i < gridSize * gridSize; i++) {
    if (small.data[i * 4 + 3] >= alphaThreshold) {
      opaquePixels.push([small.data[i * 4], small.data[i * 4 + 1], small.data[i * 4 + 2]]);
    }
  }
  const palette = [[0, 0, 0], ...medianCut(opaquePixels, maxColors)]; // index 0 = 투명
  const indices = new Uint8Array(gridSize * gridSize);
  for (let i = 0; i < gridSize * gridSize; i++) {
    if (small.data[i * 4 + 3] < alphaThreshold) { indices[i] = 0; continue; }
    indices[i] = nearestPaletteIndex(palette.slice(1), small.data[i * 4], small.data[i * 4 + 1], small.data[i * 4 + 2]) + 1;
  }
  return { width: gridSize, height: gridSize, indices, palette };
}

module.exports = { decodePNG, boxDownscale, medianCut, pixelateToIndexed };
