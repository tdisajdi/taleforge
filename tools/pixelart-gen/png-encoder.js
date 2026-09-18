// 최소 의존성 PNG 인코더 (팔레트/인덱스 컬러, node 내장 zlib만 사용).
// 외부 이미지 라이브러리 없이 순수 JS로 작은 도트 이미지를 직접 굽는다 —
// 인덱스 컬러 + zlib 압축 조합이라 단색 블록이 많은 도트 그래픽에서
// 파일 크기가 매우 작게 나온다(수백 바이트~수 KB 수준).
const zlib = require('zlib');

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/**
 * indices: width*height 배열(팔레트 인덱스, 0~255), row-major
 * palette: [[r,g,b], ...] (최대 256색)
 * transparentIndex: 이 인덱스는 완전 투명 처리(기본 0)
 */
function encodePalettePNG({ width, height, indices, palette, transparentIndex = 0 }) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 3;   // color type 3 = indexed
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const plte = Buffer.alloc(palette.length * 3);
  palette.forEach(([r, g, b], i) => {
    plte[i * 3] = r; plte[i * 3 + 1] = g; plte[i * 3 + 2] = b;
  });

  const trns = Buffer.alloc(palette.length);
  trns.fill(255);
  if (transparentIndex >= 0 && transparentIndex < palette.length) trns[transparentIndex] = 0;

  // raw scanlines: 각 줄 앞에 필터타입 바이트(0=None)
  const raw = Buffer.alloc((width + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width + 1)] = 0;
    for (let x = 0; x < width; x++) {
      raw[y * (width + 1) + 1 + x] = indices[y * width + x];
    }
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('PLTE', plte),
    chunk('tRNS', trns),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

module.exports = { encodePalettePNG };
