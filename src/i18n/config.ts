/**
 * Ngôn ngữ giao diện của khu công khai.
 *
 * Đây là ngôn ngữ của TRANG WEB, không phải ngôn ngữ giảng dạy: lớp học vẫn
 * giải thích bằng tiếng Việt và luyện bằng tiếng Đức, chọn tiếng Nhật ở đây
 * không làm Anna giảng bằng tiếng Nhật. Vì vậy mọi bản dịch đều nói thẳng điều
 * đó thay vì hứa "giải thích bằng ngôn ngữ của bạn".
 *
 * Tệp này dùng được ở cả client lẫn server - không import gì từ next/headers.
 */
export const LOCALES = ["vi", "en", "ja", "zh", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";

/** Cookie ghi lựa chọn của người đọc. Một năm: đổi ngôn ngữ là việc hiếm. */
export const LOCALE_COOKIE = "vd-lang";

/** Tên mỗi ngôn ngữ viết bằng chính ngôn ngữ đó - người đọc tìm tên tiếng mình. */
export const LOCALE_NAMES: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
  ja: "日本語",
  zh: "中文",
  ko: "한국어",
};

/** Giá trị cho thuộc tính `lang`. Tiếng Trung là giản thể. */
export const LOCALE_TAGS: Record<Locale, string> = {
  vi: "vi",
  en: "en",
  ja: "ja",
  zh: "zh-Hans",
  ko: "ko",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
