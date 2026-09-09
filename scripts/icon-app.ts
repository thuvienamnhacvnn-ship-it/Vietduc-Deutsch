/**
 * Sinh icon cho bản cài về màn hình chính (PWA).
 *
 *   npx tsx scripts/icon-app.ts
 *
 * Trình duyệt chỉ coi một trang là "cài được" khi manifest có icon PNG 192 và
 * 512. Máy này chặn native binary nên không dùng được thư viện xử lý ảnh; script
 * tự giải mã PNG bằng zlib (cùng cách với `lay-mau-logo.ts`), thu nhỏ, đặt lên
 * nền của thương hiệu rồi tự mã hóa lại PNG.
 *
 * Có hai loại icon và chúng KHÁC nhau:
 *  - icon thường: logo chiếm gần hết khung, nền trắng.
 *  - icon "maskable": Android cắt icon theo hình của máy (tròn, vuông bo, giọt
 *    nước). Phần bị cắt có thể tới 20% mỗi cạnh, nên logo phải nằm gọn trong
 *    vùng an toàn ở giữa, còn nền phải phủ kín khung - nếu không thì icon bị
 *    xén mất chữ hoặc lòi ra một góc trong suốt.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

type Img = { width: number; height: number; data: Buffer };

function decodePng(buffer: Buffer): Img {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error("Không phải tệp PNG.");

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat: Buffer[] = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8]!;
      colorType = data[9]!;
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }

  if (bitDepth !== 8) throw new Error(`Chỉ xử lý PNG 8 bit, tệp này ${bitDepth} bit.`);
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!channels) throw new Error(`Chỉ xử lý PNG RGB/RGBA, colorType=${colorType}.`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]!;
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    const cur = out.subarray(y * stride, (y + 1) * stride);

    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels]! : 0;
      const b = prev[x]!;
      const c = x >= channels ? prev[x - channels]! : 0;
      const value = line[x]!;
      let recon = value;
      if (filter === 1) recon = value + a;
      else if (filter === 2) recon = value + b;
      else if (filter === 3) recon = value + ((a + b) >> 1);
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        recon = value + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      cur[x] = recon & 0xff;
    }
  }

  // Quy về RGBA để phần còn lại chỉ phải xử lý một dạng.
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = out[i * channels]!;
    rgba[i * 4 + 1] = out[i * channels + 1]!;
    rgba[i * 4 + 2] = out[i * channels + 2]!;
    rgba[i * 4 + 3] = channels === 4 ? out[i * channels + 3]! : 255;
  }
  return { width, height, data: rgba };
}

function crc32(buf: Buffer): number {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(img: Img): Buffer {
  const stride = img.width * 4;
  const raw = Buffer.alloc((stride + 1) * img.height);
  for (let y = 0; y < img.height; y++) {
    raw[y * (stride + 1)] = 0; // không lọc: ảnh nhỏ, tệp vẫn gọn
    img.data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(img.width, 0);
  ihdr.writeUInt32BE(img.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Vùng thật sự có hình trong ảnh: bỏ viền trong suốt hoặc trắng quanh logo. */
function trim(img: Img): { x0: number; y0: number; x1: number; y1: number } {
  let x0 = img.width;
  let y0 = img.height;
  let x1 = 0;
  let y1 = 0;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4;
      const a = img.data[i + 3]!;
      const bright = img.data[i]! > 244 && img.data[i + 1]! > 244 && img.data[i + 2]! > 244;
      if (a < 16 || bright) continue;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  if (x1 <= x0 || y1 <= y0) return { x0: 0, y0: 0, x1: img.width - 1, y1: img.height - 1 };
  return { x0, y0, x1, y1 };
}

/**
 * Vẽ logo vào khung vuông, giữ đúng tỉ lệ, trên nền đặc.
 *
 * Lấy mẫu theo diện tích (trung bình các pixel nguồn rơi vào một pixel đích)
 * chứ không lấy điểm gần nhất: thu một logo 1000px xuống 192px bằng cách lấy
 * điểm gần nhất thì chữ VIET DUC rách thành những nét đứt.
 */
function render(src: Img, size: number, inset: number, bg: [number, number, number]): Img {
  const box = trim(src);
  const srcW = box.x1 - box.x0 + 1;
  const srcH = box.y1 - box.y0 + 1;
  const target = Math.round(size * (1 - inset * 2));
  const scale = Math.min(target / srcW, target / srcH);
  const drawW = Math.max(1, Math.round(srcW * scale));
  const drawH = Math.max(1, Math.round(srcH * scale));
  const offX = Math.round((size - drawW) / 2);
  const offY = Math.round((size - drawH) / 2);

  const out = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    out[i * 4] = bg[0];
    out[i * 4 + 1] = bg[1];
    out[i * 4 + 2] = bg[2];
    out[i * 4 + 3] = 255;
  }

  const stepX = srcW / drawW;
  const stepY = srcH / drawH;
  for (let y = 0; y < drawH; y++) {
    for (let x = 0; x < drawW; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      const fx0 = box.x0 + x * stepX;
      const fy0 = box.y0 + y * stepY;
      for (let sy = Math.floor(fy0); sy < Math.min(src.height, Math.ceil(fy0 + stepY)); sy++) {
        for (let sx = Math.floor(fx0); sx < Math.min(src.width, Math.ceil(fx0 + stepX)); sx++) {
          const i = (sy * src.width + sx) * 4;
          r += src.data[i]!;
          g += src.data[i + 1]!;
          b += src.data[i + 2]!;
          a += src.data[i + 3]!;
          n++;
        }
      }
      if (!n) continue;
      const alpha = a / n / 255;
      const di = ((offY + y) * size + offX + x) * 4;
      out[di] = Math.round((r / n) * alpha + bg[0] * (1 - alpha));
      out[di + 1] = Math.round((g / n) * alpha + bg[1] * (1 - alpha));
      out[di + 2] = Math.round((b / n) * alpha + bg[2] * (1 - alpha));
      out[di + 3] = 255;
    }
  }
  return { width: size, height: size, data: out };
}

function main() {
  const root = process.cwd();
  const src = decodePng(fs.readFileSync(path.join(root, "public/brand/logo-doc.png")));
  const white: [number, number, number] = [255, 255, 255];

  const files: [string, Img][] = [
    // Icon thường: logo gần kín khung.
    ["public/brand/icon-192.png", render(src, 192, 0.06, white)],
    ["public/brand/icon-512.png", render(src, 512, 0.06, white)],
    // Maskable: chừa 18% mỗi cạnh cho phần Android cắt đi.
    ["public/brand/icon-maskable-512.png", render(src, 512, 0.2, white)],
  ];

  for (const [rel, img] of files) {
    fs.writeFileSync(path.join(root, rel), encodePng(img));
    console.log(`  ${rel} — ${img.width}x${img.height}`);
  }
  console.log("Đã sinh icon cho bản cài về màn hình chính.");
}

main();
