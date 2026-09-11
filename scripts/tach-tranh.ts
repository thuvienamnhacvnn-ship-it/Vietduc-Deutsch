/**
 * Tách tranh nét Berlin từ bản thiết kế của khách thành mặt nạ trong suốt.
 *
 *   npx tsx scripts/tach-tranh.ts
 *
 * Bản thiết kế (E:\Works\itw\VD\Ligo, ảnh ChatGPT khách gửi 11/09/2026) có
 * những mảng tranh nét vàng trên nền giấy kem. Cắt nguyên ảnh dán lên web thì ở
 * chủ đề đêm sẽ lòi ra một hình chữ nhật màu kem giữa nền xanh đậm.
 *
 * Nên script giữ lại NÉT, bỏ NỀN: độ đậm của từng điểm ảnh so với màu giấy trở
 * thành độ đục (alpha), màu thì để trắng. Trên web ảnh này dùng làm
 * `mask-image` và CSS tô màu qua `background-color` - vàng nâu ở chủ đề ngày,
 * vàng sáng ở chủ đề đêm, cùng một tệp.
 *
 * Bốn mép được làm mờ dần để tranh tan vào trang thay vì bị cắt thẳng.
 */
import path from "node:path";
import sharp from "sharp";

const SRC = "E:/Works/itw/VD/Ligo";
const OUT = path.resolve(process.cwd(), "public", "art");

type Job = {
  name: string;
  file: string;
  box: { left: number; top: number; width: number; height: number };
  /** Độ rộng vùng mờ ở mỗi mép, tính theo phần của cạnh tương ứng. */
  fade: { top: number; right: number; bottom: number; left: number };
};

const JOBS: Job[] = [
  {
    // Cổng Brandenburg, cờ Đức, hai dòng viết tay - trang Chương trình.
    name: "cong-brandenburg",
    file: "9aefc4ab-b223-45c3-b427-c969c3ded133.png",
    box: { left: 672, top: 82, width: 858, height: 263 },
    fade: { top: 0, right: 0.05, bottom: 0.06, left: 0.08 },
  },
  {
    // Cổng, tháp truyền hình, nhà thờ lớn - khu đăng nhập, màn rộng.
    name: "berlin-toan-canh",
    file: "ChatGPT Image Sep 11, 2026, 12_38_11 PM (1).png",
    box: { left: 0, top: 380, width: 840, height: 318 },
    fade: { top: 0.12, right: 0.05, bottom: 0.08, left: 0.04 },
  },
  {
    // Dải chân trời - khu đăng nhập trên điện thoại, chân các trang.
    name: "berlin-dai",
    file: "ChatGPT Image Sep 11, 2026, 12_38_12 PM (2).png",
    box: { left: 45, top: 1462, width: 800, height: 205 },
    fade: { top: 0, right: 0.04, bottom: 0.04, left: 0.04 },
  },
];

/** Độ sáng cảm nhận, 0..255. */
function lum(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function edge(pos: number, size: number, frac: number): number {
  if (frac <= 0) return 1;
  const span = size * frac;
  return Math.min(1, pos / span);
}

async function run(job: Job) {
  const { data, info } = await sharp(path.join(SRC, job.file))
    .extract(job.box)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  // Màu giấy: lấy phân vị 92 độ sáng - đa số điểm ảnh là nền, nét chỉ là phần
  // nhỏ. Nền của ảnh ChatGPT không phẳng tuyệt đối nên không lấy một điểm cố định.
  const lums: number[] = [];
  for (let i = 0; i < data.length; i += 3 * 7) lums.push(lum(data[i], data[i + 1], data[i + 2]));
  lums.sort((a, b) => a - b);
  const paper = lums[Math.floor(lums.length * 0.92)];
  const ink = lums[Math.floor(lums.length * 0.01)];

  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const fy = Math.min(edge(y, height, job.fade.top), edge(height - 1 - y, height, job.fade.bottom));
    for (let x = 0; x < width; x++) {
      const fx = Math.min(edge(x, width, job.fade.left), edge(width - 1 - x, width, job.fade.right));
      const i = (y * width + x) * 3;
      const l = lum(data[i], data[i + 1], data[i + 2]);
      // Nền → 0, nét đậm nhất → 1. Bỏ phần dưới ngưỡng 6% để khử lốm đốm của nền.
      let a = (paper - l) / (paper - ink);
      a = a < 0.06 ? 0 : Math.min(1, a * 1.15);
      const o = (y * width + x) * 4;
      out[o] = 255;
      out[o + 1] = 255;
      out[o + 2] = 255;
      out[o + 3] = Math.round(a * fx * fy * 255);
    }
  }

  const file = path.join(OUT, `${job.name}.png`);
  await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9, palette: false })
    .toFile(file);
  console.log(`${job.name}.png  ${width}x${height}  giấy=${paper.toFixed(0)} nét=${ink.toFixed(0)}`);
}

async function main() {
  const fs = await import("node:fs");
  fs.mkdirSync(OUT, { recursive: true });
  for (const job of JOBS) await run(job);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
