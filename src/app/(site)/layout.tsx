import { Caveat, Playfair_Display } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSessionUser } from "@/lib/auth/session";
import { getDict } from "@/i18n/server";

/*
 * Hai font của bản thiết kế trang chủ, chỉ nạp cho khu công khai.
 *
 * Playfair Display có bộ ký tự tiếng Việt - tiêu đề "Tự tin nói tiếng Đức" có
 * đủ dấu, không rơi về font dự phòng giữa chừng. Tiếng Nhật, Trung, Hàn không
 * có trong font này và cũng không nạp thêm: mỗi bộ chữ CJK nặng vài MB, nên các
 * thứ tiếng đó dùng font có sẵn của hệ điều hành (xem site.css, `:lang()`).
 *
 * Caveat chỉ viết những dòng tiếng Đức viết tay - không bao giờ mang nội dung
 * cần đọc để hiểu trang.
 */
const display = Playfair_Display({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const script = Caveat({
  subsets: ["latin", "latin-ext"],
  weight: ["500"],
  variable: "--font-caveat",
  display: "swap",
});

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Header đổi nút chính theo việc đã đăng nhập hay chưa. Đọc phiên ở đây thay
  // vì trong header để header vẫn là client component nhẹ.
  const [user, { locale, t }] = await Promise.all([getSessionUser(), getDict()]);
  return (
    <div className={`site ${display.variable} ${script.variable}`}>
      <SiteHeader signedIn={Boolean(user)} locale={locale} t={t.chrome} />
      <main id="noi-dung">{children}</main>
      <SiteFooter locale={locale} t={t.footer} />
    </div>
  );
}
