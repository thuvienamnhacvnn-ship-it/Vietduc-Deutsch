/**
 * Tranh nét cho bốn thẻ cấp độ, cùng một nét bút với khung cảnh ở hero:
 *
 *   A1  Cổng Brandenburg  - bước qua cánh cổng đầu tiên
 *   A2  hai người trò chuyện - giao tiếp cơ bản
 *   B1  nhà thờ lớn Berlin  - tự tin trong những tình huống lớn hơn
 *   B2  toà văn phòng có cờ Đức - học tập và làm việc
 *
 * Nét vẽ dùng `currentColor`: thẻ quyết định màu, nên cùng hình vẽ đứng được
 * trên thẻ sáng lẫn thẻ xanh đậm. Riêng lá cờ ở B2 tô đúng ba màu cờ Đức.
 */
type Level = "A1" | "A2" | "B1" | "B2";

export function LevelArt({ level }: { level: Level }) {
  return (
    <svg
      className="level-art"
      viewBox="0 0 160 124"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {level === "A1" && <Gate />}
      {level === "A2" && <Talk />}
      {level === "B1" && <Dome />}
      {level === "B2" && <Office />}
    </svg>
  );
}

function Gate() {
  return (
    <g>
      {/* xe tứ mã trên đỉnh */}
      <path d="M66 26c2-5 6-6 9-4 2-4 6-4 8 0 3-2 7-1 9 4" />
      <path d="M80 22V8M76 11c1-3 7-3 8 0" />
      <path d="M68 26h24" />
      {/* tầng mái */}
      <path d="M48 42V28h64v14" />
      <path d="M40 56V42h80v14" />
      <path d="M40 48h80" />
      {/* sáu cột */}
      <path d="M46 56v52M54 56v52M68 56v52M76 56v52M84 56v52M92 56v52M106 56v52M114 56v52" />
      <path d="M42 108h76M36 114h88" />
      {/* hai nhà canh hai bên */}
      <path d="M18 108V76h18v32M124 108V76h18v32" />
      <path d="M16 76h22M122 76h22" />
      <path d="M8 118h144" />
    </g>
  );
}

function Talk() {
  return (
    <g>
      {/* người bên trái */}
      <circle cx="46" cy="44" r="11" />
      <path d="M36 42c2-10 18-12 21-1" />
      <path d="M22 116c0-26 10-42 24-42s24 16 24 42" />
      <path d="M58 90c8-2 14 2 18 8" />
      {/* người bên phải, cầm máy tính bảng */}
      <circle cx="116" cy="46" r="11" />
      <path d="M106 50c-4-14 4-18 10-16 8-2 16 4 11 18" />
      <path d="M92 116c0-26 10-40 24-40s24 14 24 40" />
      <path d="M104 92l-8 18h16l6-18Z" />
      {/* bong bóng hội thoại */}
      <path d="M58 14h26a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H70l-6 6v-6h-6a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6Z" />
      <path d="M64 24h.01M71 24h.01M78 24h.01" strokeWidth="2.6" />
      <path d="M100 58h-14a5 5 0 0 0-5 5v6a5 5 0 0 0 5 5h4v5l5-5h5a5 5 0 0 0 5-5" />
      <path d="M88 66h.01M94 66h.01" strokeWidth="2.4" />
    </g>
  );
}

function Dome() {
  return (
    <g>
      <path d="M26 114V62h108v52" />
      <path d="M56 62V46h48v16" />
      <path d="M52 46c3-30 16-40 28-40s25 10 28 40Z" />
      <path d="M66 46c1-18 7-28 14-30M94 46c-1-18-7-28-14-30" />
      <path d="M76 6V0h8v6" />
      {/* hai tháp bên */}
      <path d="M30 62V42h18v20M112 62V42h18v20" />
      <path d="M29 42c1-10 5-14 10-14s9 4 10 14M111 42c1-10 5-14 10-14s9 4 10 14" />
      {/* cửa vòm */}
      <path d="M70 114V94a10 10 0 0 1 20 0v20" />
      <path d="M38 114v-14a6 6 0 0 1 12 0v14M110 114v-14a6 6 0 0 1 12 0v14" />
      <path d="M26 76h108M56 54h48" />
      <path d="M14 118h132" />
      {/* cây hai bên */}
      <path d="M12 114c-6 0-8-6-5-10-2-6 4-10 8-7 3-4 10-2 10 3 5 2 4 9 0 11-2 2-6 3-13 3Z" />
      <path d="M148 114c6 0 8-6 5-10 2-6-4-10-8-7-3-4-10-2-10 3-5 2-4 9 0 11 2 2 6 3 13 3Z" />
    </g>
  );
}

function Office() {
  return (
    <g>
      {/* toà chính */}
      <path d="M58 114V22h52v92" />
      <path d="M58 30h52" />
      <path d="M66 38h10v10H66ZM80 38h10v10H80ZM94 38h10v10H94ZM66 54h10v10H66ZM80 54h10v10H80ZM94 54h10v10H94ZM66 70h10v10H66ZM80 70h10v10H80ZM94 70h10v10H94ZM66 86h10v10H66ZM94 86h10v10H94Z" />
      <path d="M80 114V90h10v24" />
      {/* toà thấp bên trái */}
      <path d="M22 114V60h36" />
      <path d="M28 68h8v8h-8ZM42 68h8v8h-8ZM28 84h8v8h-8ZM42 84h8v8h-8ZM28 100h8v8h-8ZM42 100h8v8h-8Z" />
      {/* cột cờ và lá cờ Đức */}
      <path d="M128 114V12" />
      <rect x="128.7" y="12" width="24" height="5" fill="#111" stroke="none" />
      <rect x="128.7" y="17" width="24" height="5" fill="#DD0000" stroke="none" />
      <rect x="128.7" y="22" width="24" height="5" fill="#FFCE00" stroke="none" />
      {/* cây */}
      <path d="M140 114c-7 0-9-6-6-11-2-6 5-10 9-7 3-5 11-3 11 3 5 2 5 10 0 12-2 2-6 3-14 3Z" />
      <path d="M8 118h146" />
    </g>
  );
}
