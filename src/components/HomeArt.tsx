/**
 * Hình nền của thẻ "Học tiếp" trên màn hình chính.
 *
 * Vẽ bằng SVG trong repo, cùng lý do với `HeroArt`: đổi màu theo chủ đề, không
 * request ngoài, không có vấn đề bản quyền, và không bao giờ là ô xám lúc bàn
 * giao. Ở đây nó chỉ là hình trang trí nên `aria-hidden` - nội dung thật đã nằm
 * trong chữ của thẻ, đọc lại bằng hình là thừa với trình đọc màn hình.
 *
 * Hai bong bóng lệch nhau và một vòng sóng: đủ để mắt đọc ra "một cuộc hội
 * thoại" ở kích thước 120px trên điện thoại, không cần chi tiết hơn.
 */
export function HomeArt() {
  return (
    <svg
      className="tiep-tuc__art"
      viewBox="0 0 200 160"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* sóng âm phía sau */}
      <g stroke="var(--gold)" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round">
        <path d="M172 44a34 34 0 0 1 0 48" />
        <path d="M182 30a54 54 0 0 1 0 76" />
      </g>

      {/* bong bóng của giáo viên */}
      <g>
        <rect x="18" y="26" width="118" height="44" rx="16" fill="var(--paper-raised)" opacity="0.96" />
        <g fill="var(--gold-deep)" opacity="0.85">
          <rect x="34" y="41" width="58" height="6" rx="3" />
          <rect x="34" y="53" width="34" height="6" rx="3" />
        </g>
      </g>

      {/* bong bóng của học viên, lệch xuống và sang phải */}
      <g>
        <rect x="56" y="84" width="112" height="44" rx="16" fill="var(--gold)" opacity="0.95" />
        <g fill="var(--on-gold)" opacity="0.7">
          <rect x="72" y="99" width="50" height="6" rx="3" />
          <rect x="72" y="111" width="30" height="6" rx="3" />
        </g>
      </g>

      {/* micro đang bật */}
      <g transform="translate(20 96)">
        <circle cx="16" cy="16" r="16" fill="var(--paper-raised)" opacity="0.96" />
        <rect x="12" y="8" width="8" height="12" rx="4" fill="var(--brand-fill)" />
        <path
          d="M9 17a7 7 0 0 0 14 0"
          stroke="var(--brand-fill)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M16 24v3" stroke="var(--brand-fill)" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
