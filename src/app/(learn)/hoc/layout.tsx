import { AppNav, type NavItem } from "@/components/AppNav";
import { requireUser } from "@/lib/auth/guard";

const ITEMS: NavItem[] = [
  { href: "/hoc", label: "Bảng học" },
  { href: "/hoc/xep-lop", label: "Xếp lớp", soon: true },
  { href: "/hoc/lo-trinh", label: "Lộ trình", soon: true },
  { href: "/hoc/on-tap", label: "Ôn tập", soon: true },
  { href: "/hoc/ho-so", label: "Hồ sơ" },
  { href: "/hoc/goi-hoc", label: "Gói học", soon: true },
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
    </>
  );
}
