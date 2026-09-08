/**
 * Đọc màu thật từ tệp logo.
 *
 * Tự giải mã PNG bằng zlib có sẵn của Node thay vì cài thêm thư viện xử lý ảnh:
 * máy này chặn native binary, và cả script chỉ cần đọc pixel một lần rồi thôi.
 *
 *   npx tsx scripts/lay-mau-logo.ts "<đường dẫn .png>"
 *
 * In ra những màu chiếm diện tích lớn nhất, đã gom các sắc gần nhau lại, kèm độ
 * tương phản với trắng và với đen - đó là con số quyết định màu nào dùng làm nền
 * mang chữ được.
 */
import fs from "node:fs";
import zlib from "node:zlib";

type Pixel = { r: number; g: number; b: number; a: number };

function decodePng(buffer: Buffer): { width: number; height: number; pixels: Pixel[] } {
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

  // Bỏ bộ lọc từng dòng theo đúng thuật toán trong đặc tả PNG.
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

      let recon: number;
      switch (filter) {
        case 0:
          recon = value;
          break;
        case 1:
          recon = value + a;
          break;
        case 2:
          recon = value + b;
          break;
        case 3:
          recon = value + Math.floor((a + b) / 2);
          break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          recon = value + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default:
          throw new Error(`Bộ lọc PNG lạ: ${filter}`);
      }
      cur[x] = recon & 0xff;
    }
  }

  const pixels: Pixel[] = [];
  for (let i = 0; i < width * height; i++) {
    const at = i * channels;
    pixels.push({
      r: out[at]!,
      g: out[at + 1]!,
      b: out[at + 2]!,
      a: channels === 4 ? out[at + 3]! : 255,
    });
  }
  return { width, height, pixels };
}

const hex = (p: Pixel) =>
  "#" + [p.r, p.g, p.b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();

/** Độ sáng tương đối theo WCAG. */
function luminance(p: Pixel): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(p.r) + 0.7152 * f(p.g) + 0.0722 * f(p.b);
}

function contrastWith(p: Pixel, other: 0 | 1): number {
  const l1 = luminance(p);
  const l2 = other;
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Cách dùng: npx tsx scripts/lay-mau-logo.ts "<đường dẫn .png>"');
    process.exit(1);
  }

  const { width, height, pixels } = decodePng(fs.readFileSync(file));

  // Gom về lưới 16 mức mỗi kênh: hai pixel lệch nhau vài đơn vị là cùng một màu
  // trong mắt người, và không gom thì kết quả toàn các sắc chuyển tiếp.
  const buckets = new Map<string, { count: number; sum: [number, number, number] }>();
  let opaque = 0;

  for (const p of pixels) {
    if (p.a < 200) continue;
    // Bỏ trắng gần tuyệt đối: đó là nền, không phải màu thương hiệu.
    if (p.r > 245 && p.g > 245 && p.b > 245) continue;
    opaque += 1;
    const key = [p.r, p.g, p.b].map((v) => Math.round(v / 16)).join(",");
    const entry = buckets.get(key) ?? { count: 0, sum: [0, 0, 0] as [number, number, number] };
    entry.count += 1;
    entry.sum[0] += p.r;
    entry.sum[1] += p.g;
    entry.sum[2] += p.b;
    buckets.set(key, entry);
  }

  const top = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 14)
    .map((e) => {
      const p: Pixel = {
        r: Math.round(e.sum[0] / e.count),
        g: Math.round(e.sum[1] / e.count),
        b: Math.round(e.sum[2] / e.count),
        a: 255,
      };
      return {
        hex: hex(p),
        phanTram: ((e.count / opaque) * 100).toFixed(1) + "%",
        voiTrang: contrastWith(p, 1).toFixed(2),
        voiDen: contrastWith(p, 0).toFixed(2),
      };
    });

  console.log(`${file}  ${width}x${height}, ${opaque} pixel có màu\n`);
  console.log("mau        dien tich   tuong phan/trang   tuong phan/den");
  for (const c of top) {
    console.log(
      `${c.hex}    ${c.phanTram.padStart(6)}          ${c.voiTrang.padStart(5)}            ${c.voiDen.padStart(5)}`,
    );
  }
}

main();
