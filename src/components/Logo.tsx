import { brand } from "@/lib/brand";

/**
 * Logo inline (không dùng <img>) để nó đổi màu theo chủ đề bằng `currentColor`
 * và không tốn thêm một request. Bản tệp trong /public/brand dùng cho những chỗ
 * cần ảnh thật: email, favicon, ảnh chia sẻ.
 */
export function Logo({ size = 30, withName = true }: { size?: number; withName?: boolean }) {
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "inherit" }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        aria-hidden="true"
        focusable="false"
        style={{ flex: "none" }}
      >
        <path
          d="M8 26 C8 15 16.5 6.5 27.5 6.5 L52.5 6.5 C63.5 6.5 72 15 72 26 L72 44
             C72 55 63.5 63.5 52.5 63.5 L34 63.5 L21 74 L21 63 C13.5 61 8 53.5 8 44 Z"
          fill="currentColor"
        />
        <path
          d="M29 22 L29 44 L52 44"
          fill="none"
          stroke="var(--lime)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withName && (
        <span
          style={{
            fontSize: "1.3rem",
            fontWeight: 680,
            letterSpacing: "-0.03em",
            color: "inherit",
          }}
        >
          {brand.name}
        </span>
      )}
      <span className="sr-only">{brand.name}</span>
    </span>
  );
}
