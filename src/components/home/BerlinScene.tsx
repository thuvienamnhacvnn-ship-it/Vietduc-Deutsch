/**
 * Khung cảnh Berlin nhìn qua cửa sổ lớp học: tháp truyền hình, nhà thờ lớn,
 * cây cầu và dòng Spree.
 *
 * Mọi màu đi qua biến CSS (`--scene-*` trong site.css) nên cùng một hình vẽ
 * thành buổi sáng ở chủ đề ngày và thành đêm có đèn cửa sổ ở chủ đề đêm - không
 * phải hai tệp ảnh. Hình là trang trí: `aria-hidden`, nội dung thật nằm trong
 * các bong bóng HTML đặt đè lên.
 */
export function BerlinScene({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 640 400"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="scene-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--scene-sky-top)" }} />
          <stop offset="1" style={{ stopColor: "var(--scene-sky-bottom)" }} />
        </linearGradient>
        <linearGradient id="scene-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--scene-water-top)" }} />
          <stop offset="1" style={{ stopColor: "var(--scene-water-bottom)" }} />
        </linearGradient>
      </defs>

      <rect width="640" height="400" fill="url(#scene-sky)" />

      {/* mặt trời / mặt trăng: cùng một vòng tròn, đổi màu theo chủ đề */}
      <circle className="scene-orb" cx="548" cy="78" r="26" />

      {/* dãy nhà xa, mờ */}
      <g className="scene-far">
        <path d="M0 262h36v-22h24v12h30v-30h28v40h22v-18h26v18h20V300H0Z" />
        <path d="M392 300v-46h26v-14h34v24h30v-18h38v26h26v-34h32v28h34v-12h28V300Z" />
      </g>

      {/* tháp truyền hình Alexanderplatz */}
      <g className="scene-line">
        <path d="M466 300 469.4 140h3.2L476 300" />
        <circle cx="471" cy="126" r="14" />
        <path d="M457.5 124h27M458.6 130h24.8" />
        <path d="M471 112V60M468.5 76h5M469 90h4" />
        <circle cx="471" cy="158" r="3.2" />
      </g>

      {/* nhà thờ lớn Berlin - lệch sang trái để khoảng trời giữa khung dành cho
          vòng tròn giọng nói của Anna */}
      <g transform="translate(-150 0)">
        <g className="scene-line scene-fill">
          <path d="M232 300v-58h160v58" />
          <path d="M280 242v-34h64v34" />
          <path d="M276 208c4-44 22-66 36-66s32 22 36 66Z" />
          <path d="M306 142v-14h12v14M312 128v-12M308.5 120h7" />
          <path d="M240 242v-26h24v26M384 242v-26h-24v26" />
          <path d="M238 216c2-14 8-20 14-20s12 6 14 20M358 216c2-14 8-20 14-20s12 6 14 20" />
        </g>
        <g className="scene-line">
          <path d="M296 300v-30a16 16 0 0 1 32 0v30" />
          <path d="M252 300v-22a9 9 0 0 1 18 0v22M354 300v-22a9 9 0 0 1 18 0v22" />
          <path d="M232 256h160" />
        </g>
      </g>
      <g className="scene-win">
        <rect x="98" y="226" width="6" height="9" rx="1" />
        <rect x="220" y="226" width="6" height="9" rx="1" />
        <rect x="156" y="220" width="5" height="10" rx="1" />
        <rect x="163" y="220" width="5" height="10" rx="1" />
        <rect x="408" y="270" width="6" height="8" />
        <rect x="444" y="262" width="6" height="8" />
        <rect x="520" y="270" width="6" height="8" />
        <rect x="580" y="278" width="6" height="8" />
        <rect x="40" y="276" width="6" height="8" />
      </g>

      {/* cây bên sông */}
      <g className="scene-line scene-fill" transform="translate(190 0)">
        <path d="M150 300c-16 0-22-12-16-22-6-12 6-24 18-18 6-10 24-8 26 6 12 2 14 20 2 26-4 6-14 8-30 8Z" />
        <path d="M168 300v-10" />
        <path d="M196 300c-10 0-14-9-10-16-4-8 4-16 12-12 4-6 16-5 17 4 8 2 9 14 1 18-3 4-9 6-20 6Z" />
      </g>

      {/* cầu và sông Spree */}
      <rect y="300" width="640" height="100" fill="url(#scene-water)" />
      <g className="scene-line">
        <path d="M0 300h640" />
        <path d="M20 312h600" />
        <path d="M40 312c10-14 30-14 40 0M120 312c10-14 30-14 40 0M200 312c10-14 30-14 40 0M280 312c10-14 30-14 40 0M360 312c10-14 30-14 40 0M440 312c10-14 30-14 40 0M520 312c10-14 30-14 40 0" />
        <path
          d="M60 342h60M170 350h90M320 340h70M440 352h80M100 372h110M300 380h120M500 370h70"
          className="scene-wave"
        />
      </g>
    </svg>
  );
}
