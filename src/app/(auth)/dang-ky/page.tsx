import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Tạo tài khoản" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ tiep?: string }>;
}) {
  if (await getSessionUser()) redirect("/hoc");
  const { tiep } = await searchParams;
  // Chỉ nhận đường dẫn nội bộ: `tiep=https://...` sẽ thành một open redirect.
  const next = tiep?.startsWith("/") ? tiep : "/hoc";

  return (
    <>
      <h1>Tạo tài khoản</h1>
      <p className="lede" style={{ fontSize: "var(--fs-md)", marginBottom: "var(--s-7)" }}>
        Miễn phí. Sau khi tạo tài khoản bạn làm bài kiểm tra bốn kỹ năng để hệ thống biết bắt đầu từ
        đâu.
      </p>

      <GoogleButton next={next} />

      <RegisterForm next={next} />

      <p className="auth-shell__foot">
        Đã có tài khoản? <Link href="/dang-nhap">Đăng nhập</Link>
      </p>
    </>
  );
}
