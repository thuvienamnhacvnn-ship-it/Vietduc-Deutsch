import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { brand } from "@/lib/brand";

/**
 * Khu auth có khung riêng, không dùng header/footer đầy đủ: ở bước này người
 * dùng chỉ nên có một việc để làm.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <aside className="auth-shell__aside band">
        <Link href="/" style={{ color: "var(--on-band)", textDecoration: "none" }}>
          <Logo />
        </Link>
        <div>
          <h2 style={{ fontSize: "var(--fs-2xl)", maxWidth: "16ch" }}>{brand.headline.vi}</h2>
          <p className="lede">
            Bốn kỹ năng được kiểm riêng, lộ trình dựng từ kết quả thật của bạn, và một người đồng
            hành nhớ hôm trước bạn học tới đâu.
          </p>
        </div>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--on-band-muted)", marginBottom: 0 }}>
          Đang trong giai đoạn xây dựng. Chưa thu tiền, chưa mở bán.
        </p>
      </aside>

      <main id="noi-dung" className="auth-shell__main">
        <div className="auth-shell__bar">
          <Link href="/" className="auth-shell__back">
            ← Về trang chủ
          </Link>
          <ThemeToggle />
        </div>
        <div className="auth-shell__card">{children}</div>
      </main>
    </div>
  );
}
