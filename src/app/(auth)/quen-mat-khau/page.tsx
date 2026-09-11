import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/auth/ForgotForm";

export const metadata: Metadata = { title: "Quên mật khẩu" };

export default function ForgotPage() {
  return (
    <>
      <h1>Quên mật khẩu</h1>
      <p className="auth-card__sub">
        Nhập email của bạn. Nếu email đó có tài khoản, chúng tôi gửi một liên kết đặt lại mật khẩu.
      </p>

      <ForgotForm />

      <p className="auth-card__switch">
        Nhớ ra rồi? <Link href="/dang-nhap">Đăng nhập</Link>
      </p>
    </>
  );
}
