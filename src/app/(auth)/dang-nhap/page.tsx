import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleButton, GooglePrivacyNote } from "@/components/auth/GoogleButton";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Đăng nhập" };

/**
 * Thông báo cho từng cách hỏng của luồng Google. Mỗi câu nói đúng chuyện gì đã
 * xảy ra và người dùng làm gì tiếp - không dồn hết vào một câu "có lỗi".
 */
const OAUTH_ERROR: Record<string, string> = {
  google_chua_ket_noi:
    "Đăng nhập bằng Google chưa được bật trên hệ thống này. Bạn dùng email và mật khẩu giúp nhé.",
  google_bi_huy: "Bạn đã dừng ở màn hình Google. Không có gì thay đổi cả.",
  google_het_han:
    "Phiên đăng nhập Google đã quá hạn. Bấm lại nút Google để bắt đầu lại từ đầu.",
  google_sai_state:
    "Yêu cầu không khớp với phiên đang mở, nên hệ thống đã dừng lại để an toàn. Bấm lại nút Google.",
  google_thieu_tham_so: "Google trả về thiếu thông tin. Bạn thử lại giúp nhé.",
  google_email_chua_xac_minh:
    "Địa chỉ email của tài khoản Google này chưa được Google xác minh, nên chưa dùng để đăng nhập được.",
  google_that_bai: "Chưa kết nối được với Google. Bạn thử lại sau ít phút.",
  tai_khoan_bi_khoa: "Tài khoản này đang bị khoá. Liên hệ hỗ trợ để được mở lại.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tiep?: string; loi?: string }>;
}) {
  if (await getSessionUser()) redirect("/hoc");
  const { tiep, loi } = await searchParams;
  const next = tiep?.startsWith("/") ? tiep : "/hoc";

  return (
    <>
      <h1>Đăng nhập</h1>
      <p className="auth-card__sub">Tiếp tục từ đúng chỗ bạn đang dở.</p>

      {loi && (
        <div className="alert alert--error" role="alert">
          <p>{OAUTH_ERROR[loi] ?? "Đăng nhập không thành công. Bạn thử lại giúp nhé."}</p>
        </div>
      )}

      <GoogleButton next={next} />

      <LoginForm next={next} />

      <p className="auth-card__switch">
        Chưa có tài khoản? <Link href="/dang-ky">Tạo tài khoản</Link>
      </p>

      <GooglePrivacyNote />
    </>
  );
}
