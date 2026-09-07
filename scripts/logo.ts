/**
 * Sinh bộ nhận diện Lingora ra `public/brand/`.
 *
 * Toàn bộ là SVG viết tay ở đây - không phụ thuộc dịch vụ ngoài, không có tệp
 * nhị phân nào phải tin tưởng, và đổi tên thương hiệu trong src/lib/brand.ts
 * rồi chạy lại `npm run logo` là ra bộ mới.
 *
 * Ý tưởng: chữ "i" trong wordmark mất dấu chấm, thay bằng một dấu ngôn ngữ nhỏ
 * hình bong bóng thoại - dấu hiệu của việc nói. Biểu tượng vuông là chữ L nằm
 * trong một bong bóng thoại bo góc.
 */
import fs from "node:fs";
import path from "node:path";
import { brand } from "../src/lib/brand";

const OUT = path.resolve(process.cwd(), "public", "brand");
const FOREST = "#154B3D";
const LIME = "#DEF59A";
const PAPER = "#F8FAF9";

/** Bong bóng thoại + chữ L, dùng chung cho mark, favicon và app icon. */
function markPaths(scale = 1, ox = 0, oy = 0): string {
  const s = (n: number) => (n * scale + 0).toFixed(2);
  const t = `translate(${ox} ${oy}) scale(${scale})`;
  void s;
  return `
    <g transform="${t}">
      <path d="M8 26 C8 15 16.5 6.5 27.5 6.5 L52.5 6.5 C63.5 6.5 72 15 72 26 L72 44
               C72 55 63.5 63.5 52.5 63.5 L34 63.5 L21 74 L21 63 C13.5 61 8 53.5 8 44 Z"
            fill="${FOREST}"/>
      <path d="M29 22 L29 44 L52 44" fill="none" stroke="${LIME}" stroke-width="7"
            stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
}

/**
 * Wordmark vẽ bằng <text>, kèm font dự phòng hệ thống. SVG có chữ sống thay vì
 * đường path: đọc được bằng trình đọc màn hình, và sửa tên thương hiệu không
 * cần vẽ lại.
 */
function wordmark(color: string, accent: string): string {
  const name = brand.name;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 96" role="img"
     aria-label="${name}">
  <title>${name}</title>
  ${markPaths(0.78, 6, 12)}
  <text x="82" y="62" font-family="Inter, 'Segoe UI', system-ui, sans-serif"
        font-size="52" font-weight="640" letter-spacing="-1.4" fill="${color}">${name}</text>
  <circle cx="196" cy="26" r="7" fill="${accent}"/>
</svg>
`;
}

function mark(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" role="img"
     aria-label="${brand.name}">
  <title>${brand.name}</title>
  ${markPaths(1, 0, 0)}
</svg>
`;
}

/** Favicon: nền đặc để hình còn đọc được ở 16px trên tab sáng lẫn tab tối. */
function favicon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${FOREST}"/>
  <path d="M22 18 L22 42 L44 42" fill="none" stroke="${LIME}" stroke-width="8"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
}

/** Ảnh chia sẻ mạng xã hội. Chữ lấy từ brand.ts, không hardcode. */
function og(): string {
  const promise = brand.promise.vi;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${FOREST}"/>
  <circle cx="1040" cy="120" r="220" fill="#0F3B2F"/>
  <circle cx="120" cy="560" r="180" fill="#0F3B2F"/>
  ${markPaths(1.5, 88, 96)}
  <text x="88" y="330" font-family="Inter, 'Segoe UI', system-ui, sans-serif"
        font-size="86" font-weight="680" letter-spacing="-2" fill="${PAPER}">${brand.name}</text>
  <text x="88" y="400" font-family="Inter, 'Segoe UI', system-ui, sans-serif"
        font-size="34" font-weight="500" fill="${LIME}">${brand.tagline.vi}</text>
  <foreignObject x="88" y="436" width="800" height="140">
    <div xmlns="http://www.w3.org/1999/xhtml"
         style="font-family:Inter,'Segoe UI',system-ui,sans-serif;font-size:26px;
                line-height:1.5;color:#A9C6B8">${promise}</div>
  </foreignObject>
</svg>
`;
}

const files: Record<string, string> = {
  "wordmark.svg": wordmark(FOREST, LIME),
  "wordmark-dark.svg": wordmark(PAPER, LIME),
  "mark.svg": mark(),
  "favicon.svg": favicon(),
  "og.svg": og(),
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), content, "utf8");
  console.log(`  public/brand/${name}`);
}

// favicon.ico thì mọi trình duyệt hiện hành đều chấp nhận SVG qua <link>, nên
// không cần công cụ raster nào. Icon PNG cho màn hình chính điện thoại sinh khi
// có sharp; không có cũng không sao, manifest trỏ về SVG.
console.log(`\nĐã sinh ${Object.keys(files).length} tệp nhận diện cho "${brand.name}".`);
