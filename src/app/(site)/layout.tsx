import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSessionUser } from "@/lib/auth/session";
import { getDict } from "@/i18n/server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Header đổi nút chính theo việc đã đăng nhập hay chưa. Đọc phiên ở đây thay
  // vì trong header để header vẫn là client component nhẹ.
  const [user, { locale, t }] = await Promise.all([getSessionUser(), getDict()]);
  return (
    <div className="site">
      <SiteHeader signedIn={Boolean(user)} locale={locale} t={t.chrome} />
      <main id="noi-dung">{children}</main>
      <SiteFooter locale={locale} t={t.footer} />
    </div>
  );
}
