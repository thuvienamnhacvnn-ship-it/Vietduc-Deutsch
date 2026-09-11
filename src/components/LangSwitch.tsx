"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_COOKIE, LOCALE_NAMES, LOCALE_TAGS, type Locale } from "@/i18n/config";

/**
 * Chọn ngôn ngữ giao diện.
 *
 * Dùng <select> gốc của trình duyệt chứ không tự dựng menu: trên điện thoại nó
 * mở bảng chọn của hệ điều hành, bàn phím và trình đọc màn hình dùng được sẵn.
 *
 * Lựa chọn ghi vào cookie rồi `router.refresh()` để server render lại bằng
 * ngôn ngữ mới - không có đường dẫn riêng cho từng thứ tiếng, nên người đang ở
 * trang nào vẫn ở nguyên trang đó.
 *
 * `defaultValue` + `key` thay vì `value`: ô chọn có kiểm soát sẽ bật về giá trị
 * cũ trong lúc chờ server trả trang mới, trông như lựa chọn không ăn.
 */
/** Mã ngắn cho biến thể gọn - chữ cái nhận ra được ngay dù không đọc tiếng đó. */
const SHORT: Record<Locale, string> = { vi: "VI", en: "EN", ja: "日本", zh: "中文", ko: "한국" };

export function LangSwitch({
  locale,
  label,
  compact = false,
}: {
  locale: Locale;
  label: string;
  /** Chỉ hiện mã ngắn; ô chọn thật phủ trong suốt lên trên, bấm vẫn mở danh sách đầy đủ. */
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label
      className={compact ? "lang-switch lang-switch--compact" : "lang-switch"}
      data-pending={pending || undefined}
      title={label}
    >
      <Globe />
      <span className="sr-only">{label}</span>
      {compact && (
        <span className="lang-switch__code" aria-hidden="true">
          {SHORT[locale]}
        </span>
      )}
      <select
        key={locale}
        defaultValue={locale}
        onChange={(e) => {
          document.cookie = `${LOCALE_COOKIE}=${e.target.value}; path=/; max-age=31536000; samesite=lax`;
          startTransition(() => router.refresh());
        }}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} lang={LOCALE_TAGS[l]}>
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}

function Globe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.6 2.8 3.9 5.8 3.9 9s-1.3 6.2-3.9 9c-2.6-2.8-3.9-5.8-3.9-9S9.4 5.8 12 3Z" />
      </g>
    </svg>
  );
}
