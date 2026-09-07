import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSessionUser } from "@/lib/auth/session";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Header đổi nút chính theo việc đã đăng nhập hay chưa. Đọc phiên ở đây thay
  // vì trong header để header vẫn là client component nhẹ.
  const user = await getSessionUser();
  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />
      <main id="noi-dung">{children}</main>
      <SiteFooter />
    </>
  );
}
