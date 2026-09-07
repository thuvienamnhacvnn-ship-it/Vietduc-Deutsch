import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/ResetForm";

export const metadata: Metadata = { title: "Đặt lại mật khẩu" };

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <>
      <h1>Đặt mật khẩu mới</h1>
      <p className="lede" style={{ fontSize: "var(--fs-md)", marginBottom: "var(--s-7)" }}>
        Sau khi đổi, mọi thiết bị đang đăng nhập sẽ bị đăng xuất.
      </p>
      <ResetForm token={token ?? ""} />
    </>
  );
}
