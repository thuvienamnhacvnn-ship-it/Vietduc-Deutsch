import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Đăng nhập" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tiep?: string }>;
}) {
  if (await getSessionUser()) redirect("/hoc");
  const { tiep } = await searchParams;
  const next = tiep?.startsWith("/") ? tiep : "/hoc";

  return (
    <>
      <h1>Đăng nhập</h1>
      <p className="lede" style={{ fontSize: "var(--fs-md)", marginBottom: "var(--s-7)" }}>
        Tiếp tục từ đúng chỗ bạn đang dở.
      </p>

      <LoginForm next={next} />

      <p className="auth-shell__foot">
        <Link href="/quen-mat-khau">Quên mật khẩu?</Link>
        {" · "}
        Chưa có tài khoản? <Link href="/dang-ky">Tạo tài khoản</Link>
      </p>
    </>
  );
}
