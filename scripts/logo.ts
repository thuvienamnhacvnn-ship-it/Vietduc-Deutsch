/**
 * Sinh favicon và ảnh chia sẻ cho Việt Đức.
 *
 * Logo chính là hai tệp PNG của khách trong `public/brand/` - script này KHÔNG
 * vẽ lại chúng. Nó chỉ tạo hai thứ mà tệp gốc không dùng được:
 *
 *   favicon  - logo đầy đủ đọc không ra ở 16px; cần một hình đơn giản hóa
 *   og       - ảnh chia sẻ cần khung 1200x630 với nền và chữ
 *
 * Hình đơn giản hóa là ngọn lửa hai lớp: lớp đỏ mang ngôi sao vàng (cờ Việt
 * Nam), lớp vàng kim phía sau (cờ Đức). Cùng ý tưởng với logo gốc, cùng bảng
 * màu lấy từ chính tệp logo, nhưng ít chi tiết để còn đọc được ở cỡ nhỏ.
 */
import fs from "node:fs";
import path from "node:path";
import { brand } from "../src/lib/brand";

const OUT = path.resolve(process.cwd(), "public", "brand");

/** Màu đo từ tệp logo bằng scripts/lay-mau-logo.ts. */
const RED = "#CA2427";
const RED_DEEP = "#8E1A1D";
const GOLD = "#C28E43";
const GOLD_LIGHT = "#E0AC5A";
const STAR = "#F9DA07";
const PAPER = "#FAF7F4";

/** Ngọn lửa đơn giản hóa. Vẽ trong khung 64x64. */
function flame(): string {
  return `
    <path d="M40 6 C50 20 56 30 56 40 C56 51 47 58 36 58 C25 58 16 51 16 40
             C16 31 22 22 32 12 C31 22 34 28 38 30 C40 24 40 14 40 6 Z"
          fill="${GOLD_LIGHT}" stroke="${GOLD}" stroke-width="1.2"/>
    <path d="M32 10 C40 22 44 30 44 39 C44 49 37 56 30 56 C22 56 16 49 16 40
             C16 30 24 20 32 10 Z"
          fill="${RED}"/>
    <path d="M30 26 l2.6 5.6 6.1 .7 -4.5 4.2 1.2 6 -5.4 -3 -5.4 3 1.2 -6
             -4.5 -4.2 6.1 -.7 Z"
          fill="${STAR}"/>`;
}

/** Favicon: nền đặc để hình đọc được cả trên tab sáng lẫn tab tối. */
function favicon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${PAPER}"/>
  ${flame()}
</svg>
`;
}

/** Biểu tượng vuông không nền, cho những chỗ đã có nền sáng sẵn. */
function mark(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img"
     aria-label="${brand.fullName}">
  <title>${brand.fullName}</title>
  ${flame()}
</svg>
`;
}

/** Ảnh chia sẻ mạng xã hội. Chữ lấy từ brand.ts, không viết cứng. */
function og(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${RED_DEEP}"/>
      <stop offset="100%" stop-color="${RED}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1060" cy="90" r="230" fill="${RED_DEEP}" opacity="0.55"/>

  <g transform="translate(88 96) scale(2.2)">
    ${flame()}
  </g>

  <text x="88" y="360" font-family="Inter, 'Segoe UI', system-ui, sans-serif"
        font-size="76" font-weight="700" letter-spacing="-1.5" fill="${PAPER}">${brand.fullName}</text>
  <text x="88" y="424" font-family="Inter, 'Segoe UI', system-ui, sans-serif"
        font-size="34" font-weight="500" fill="${GOLD_LIGHT}">${brand.tagline.vi}</text>
  <foreignObject x="88" y="456" width="820" height="130">
    <div xmlns="http://www.w3.org/1999/xhtml"
         style="font-family:Inter,'Segoe UI',system-ui,sans-serif;font-size:25px;
                line-height:1.5;color:#F3CFCB">${brand.promise.vi}</div>
  </foreignObject>
</svg>
`;
}

const files: Record<string, string> = {
  "favicon.svg": favicon(),
  "mark.svg": mark(),
  "og.svg": og(),
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), content, "utf8");
  console.log(`  public/brand/${name}`);
}

// Wordmark cũ do script tự vẽ đã bị thay bằng tệp thật của khách; xóa để không
// còn hai bộ nhận diện song song trong thư mục.
for (const stale of ["wordmark.svg", "wordmark-dark.svg"]) {
  const at = path.join(OUT, stale);
  if (fs.existsSync(at)) {
    fs.unlinkSync(at);
    console.log(`  đã xóa ${stale} (thay bằng logo thật của khách)`);
  }
}

console.log(`\nLogo chính là logo-ngang.png và logo-doc.png - do khách cung cấp, không sinh lại.`);
