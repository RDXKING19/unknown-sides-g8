import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

/**
 * Pure Node.js 1024x1024 PNG generator without native dependencies.
 * Creates genuine PNG image data (IHDR, IDAT, IEND) conforming to PNG specification.
 */
function createPngBuffer(width, height, getPixel) {
  // CRC Table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR: 13 bytes
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: RGB (3 bytes/pixel)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Scanlines: width * 3 bytes + 1 filter byte per line
  const rawData = Buffer.alloc(height * (1 + width * 3));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b] = getPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });
  const idat = makeChunk('IDAT', deflated);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const PANELS = [
  { id: 1, baseColor: [30, 20, 60], accentColor: [250, 204, 21] },  // Gold / Sunset
  { id: 2, baseColor: [24, 12, 60], accentColor: [56, 189, 248] },  // Blueprint Cyan
  { id: 3, baseColor: [32, 16, 64], accentColor: [192, 132, 252] }, // Purple Squares
  { id: 4, baseColor: [22, 10, 54], accentColor: [251, 146, 60] },  // Flagpole Orange
  { id: 5, baseColor: [31, 16, 72], accentColor: [74, 222, 128] },  // Success Green
  { id: 6, baseColor: [34, 17, 80], accentColor: [244, 63, 94] },   // Skyline Dusk
];

const outDir = path.resolve('public/assets/story');
fs.mkdirSync(outDir, { recursive: true });

for (const panel of PANELS) {
  const filePath = path.join(outDir, `story_${panel.id}.png`);
  console.log(`Generating 1024x1024 PNG placeholder for Story Panel ${panel.id}...`);

  const pngBuf = createPngBuffer(1024, 1024, (x, y, w, h) => {
    // Rich gradient & geometric watermark
    const normY = y / h;
    const normX = x / w;
    const vignette = 1 - 0.4 * Math.hypot(normX - 0.5, normY - 0.5);

    // Diagonal geometric survey stripe
    const isStripe = Math.abs((x + y * 0.8) % 120 - 60) < 6;

    let r = Math.floor((panel.baseColor[0] * (1 - normY) + panel.accentColor[0] * normY * 0.3) * vignette);
    let g = Math.floor((panel.baseColor[1] * (1 - normY) + panel.accentColor[1] * normY * 0.3) * vignette);
    let b = Math.floor((panel.baseColor[2] * (1 - normY) + panel.accentColor[2] * normY * 0.3) * vignette);

    if (isStripe) {
      r = Math.min(255, r + 25);
      g = Math.min(255, g + 25);
      b = Math.min(255, b + 35);
    }

    return [r, g, b];
  });

  fs.writeFileSync(filePath, pngBuf);
  console.log(`Saved ${filePath} (${Math.round(pngBuf.length / 1024)} KB)`);
}

console.log('✔ All 6 story PNG files created successfully!');
