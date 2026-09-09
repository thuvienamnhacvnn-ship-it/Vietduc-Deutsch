import { AppNav, type NavItem } from "@/components/AppNav";
import { TabBar, type Tab } from "@/components/TabBar";
import { requireUser } from "@/lib/auth/guard";

const ITEMS: NavItem[] = [
  { href: "/hoc", label: "Bảng học" },
  { href: "/hoc/xep-lop", label: "Kiểm tra trình độ" },
  { href: "/hoc/ket-qua", label: "Kết quả" },
  { href: "/hoc/lo-trinh", label: "Lộ trình", soon: true },
  { href: "/hoc/on-tap", label: "Ôn tập", soon: true },
  { href: "/hoc/ho-so", label: "Hồ sơ" },
  { href: "/hoc/goi-hoc", label: "Gói học", soon: true },
];

/**
 * Bốn mục ở thanh dưới trên điện thoại. Đây là bốn việc người học thật sự làm;
 * những mục còn lại vẫn nằm trong menu ở thanh trên.
 */
const TABS: Tab[] = [
  { href: "/hoc", label: "Học", icon: "home" },
  { href: "/hoc/xep-lop", label: "Kiểm tra", icon: "test" },
  { href: "/hoc/ket-qua", label: "Kết quả", icon: "result" },
  { href: "/hoc/ho-so", label: "Hồ sơ", icon: "me" },
];

const ROLE_VI: Record<string, string> = {
  learner: "Học viên",
  editor: "Biên tập giáo trình",
  support: "Hỗ trợ",
  admin: "Quản trị viên",
};

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/hoc");
  return (
    <>
      <AppNav
        items={ITEMS}
        userName={user.name}
        role={ROLE_VI[user.role] ?? user.role}
        homeHref="/hoc"
      />
      <main id="noi-dung" className="app-main">
        {children}
      </main>
      <TabBar tabs={TABS} />
    </>
  );
}
