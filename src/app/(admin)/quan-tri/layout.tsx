import { AppNav, type NavItem } from "@/components/AppNav";
import { requireStaff } from "@/lib/auth/guard";
import { getDict } from "@/i18n/server";

const ITEMS: NavItem[] = [
  { href: "/quan-tri", label: "Tổng quan" },
  { href: "/quan-tri/hoc-vien", label: "Học viên" },
  { href: "/quan-tri/bai-hoc", label: "Duyệt bài học" },
  { href: "/quan-tri/don-hang", label: "Đơn hàng" },
  { href: "/quan-tri/giao-trinh", label: "Giáo trình", soon: true },
  { href: "/quan-tri/cau-hoi", label: "Câu hỏi", soon: true },
  { href: "/quan-tri/agent", label: "AI Agent", soon: true },
  { href: "/quan-tri/van-hanh", label: "Vận hành", soon: true },
];

const ROLE_VI: Record<string, string> = {
  editor: "Biên tập giáo trình",
  support: "Hỗ trợ",
  admin: "Quản trị viên",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // requireStaff trả 404 cho người không có quyền, chứ không phải 403: khu quản
  // trị không nên tự xác nhận là nó tồn tại.
  const user = await requireStaff("/quan-tri");
  const { locale, t } = await getDict();
  return (
    <>
      <AppNav
        locale={locale}
        untranslated={t.chrome.untranslated}
        items={ITEMS}
        userName={user.name}
        role={ROLE_VI[user.role] ?? user.role}
        homeHref="/quan-tri"
      />
      <main id="noi-dung" className="app-main">
        {children}
      </main>
    </>
  );
}
