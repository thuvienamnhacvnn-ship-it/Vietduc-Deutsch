import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { DICTS, type Dict } from "./dict";

/**
 * Ngôn ngữ của lượt xem này.
 *
 * 1. Người đọc đã chọn (cookie) thì theo lựa chọn đó.
 * 2. Chưa chọn thì chỉ tự đoán cho tiếng Nhật, Trung, Hàn - trình duyệt đặt
 *    ngôn ngữ đầu tiên là một trong ba tiếng đó thì gần như chắc người dùng đọc
 *    được tiếng ấy.
 * 3. Còn lại là tiếng Việt.
 *
 * KHÔNG tự đoán tiếng Anh: rất nhiều người Việt - đúng đối tượng chính - dùng
 * điện thoại và trình duyệt đặt tiếng Anh. Đoán theo đó là đẩy người học chính
 * sang một trang tiếng Anh họ không hề chọn.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const chosen = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;

  const accept = (await headers()).get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("ja")) return "ja";
  if (first.startsWith("ko")) return "ko";
  if (first.startsWith("zh")) return "zh";
  return DEFAULT_LOCALE;
}

export async function getDict(): Promise<{ locale: Locale; t: Dict }> {
  const locale = await getLocale();
  return { locale, t: DICTS[locale] };
}
