import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthIntro } from "@/components/auth/AuthIntro";

/**
 * Khu đăng nhập, đăng ký, quên mật khẩu - theo bản thiết kế 11/09/2026.
 *
 * Không dùng header/footer đầy đủ của trang công khai: ở bước này người dùng
 * chỉ nên có một việc để làm.
 *
 * MÀN RỘNG: lời chào + tranh Berlin + thẻ lời Anna bên trái, thẻ biểu mẫu bên
 * phải. MÀN HẸP: bỏ cột trái, biểu mẫu đứng một mình, dải tranh Berlin xuống
 * đáy trang - đúng như bản mobile của thiết kế.
 *
 * Ba điểm mạnh ở cột trái cố ý KHÔNG phải con số marketing. Không có "10.000
 * học viên", không có "98% hài lòng" - những con số ấy chưa tồn tại, và bịa ra
 * chúng ngay ở màn hình đăng nhập là mở đầu quan hệ bằng một câu nói dối.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth">
      <header className="auth__bar">
        <Link href="/" className="auth__brand" aria-label="Việt Đức Lingua — về trang chủ">
          <BrandLockup height={50} />
        </Link>
        <div className="auth__bar-right">
          <Link href="/" className="auth__back auth__back--bar">
            <span aria-hidden="true">←</span> Về trang chủ
          </Link>
          <ThemeToggle className="auth__theme" />
        </div>
      </header>

      <div className="auth__body">
        <AuthIntro />

        <main id="noi-dung" className="auth__main">
          <Link href="/" className="auth__back auth__back--main">
            <span aria-hidden="true">←</span> Về trang chủ
          </Link>
          <div className="auth__card">{children}</div>
          <span className="art-mask art-mask--dai auth__skyline" aria-hidden="true" />
        </main>
      </div>

      <footer className="auth__foot">
        <p>Đang xây dựng · Chưa mở bán, chưa thu tiền.</p>
        <nav aria-label="Pháp lý">
          <Link href="/dieu-khoan">Điều khoản</Link>
          <span aria-hidden="true">|</span>
          <Link href="/rieng-tu">Quyền riêng tư</Link>
        </nav>
      </footer>
    </div>
  );
}
