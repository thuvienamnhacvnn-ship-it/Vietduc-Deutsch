import { AppNav, type NavItem } from "@/components/AppNav";
import { TabBar, type Tab } from "@/components/TabBar";
import { requireUser } from "@/lib/auth/guard";
import { getDict } from "@/i18n/server";

const ITEMS: NavItem[] = [
  { href: "/hoc", label: "Bảng học" },
  { href: "/hoc/lop", label: "Lớp học nói" },
  { href: "/hoc/on-tap", label: "Ôn tập" },
  { href: "/hoc/xep-lop", label: "Kiểm tra trình độ" },
  { href: "/hoc/ket-qua", label: "Kết quả" },
  { href: "/hoc/ho-so", label: "Hồ sơ" },
  { href: "/hoc/goi-hoc", label: "Gói học" },
];

/**
 * Bốn mục ở thanh dưới trên điện thoại. Đây là bốn việc người học thật sự làm;
 * những mục còn lại vẫn nằm trong menu ở thanh trên.
 */
const TABS: Tab[] = [
  { href: "/hoc", label: "Học", icon: "home" },
  { href: "/hoc/lop", label: "Lớp nói", icon: "class" },
  { href: "/hoc/on-tap", label: "Ôn tập", icon: "review" },
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
  const { locale, t } = await getDict();
  return (
    <>
      <AppNav
        locale={locale}
        untranslated={t.chrome.untranslated}
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
