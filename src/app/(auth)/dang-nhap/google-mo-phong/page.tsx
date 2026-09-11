import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mockEnabled } from "@/lib/adapters/oauth-google";

export const metadata: Metadata = { title: "Màn hình mô phỏng đăng nhập Google" };

/**
 * Màn hình thay chỗ cho trang chọn tài khoản của Google khi chưa có khóa OAuth.
 *
 * Nó cố ý KHÔNG giống Google: không logo, không màu sắc của họ, và có một dải
 * cảnh báo ở trên cùng. Một màn hình bắt chước Google là màn hình lừa người
 * dùng, kể cả khi chỉ định dùng nội bộ.
 *
 * `mockEnabled()` false ở production hoặc khi đã có khóa thật, và khi đó trang
 * này trả 404.
 */
export default async function GoogleMockPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  if (!mockEnabled()) notFound();

  const { state } = await searchParams;
  if (!state) notFound();

  return (
    <>
      <div className="alert alert--warning" role="alert">
        <p>
          <strong>Đây không phải Google.</strong> Đây là màn hình mô phỏng chỉ chạy ở môi trường
          phát triển, dùng để kiểm thử luồng đăng nhập khi chưa có khóa OAuth. Không có dữ liệu nào
          được gửi tới Google, và tài khoản tạo ra ở đây chỉ tồn tại trong cơ sở dữ liệu nội bộ.
        </p>
      </div>

      <h1>Chọn tài khoản (mô phỏng)</h1>
      <p className="auth-card__sub">
        Nhập địa chỉ Gmail bạn muốn đóng vai. Nhập lại cùng địa chỉ ở lần sau sẽ vào đúng tài khoản
        đó, giống hệt hành vi thật.
      </p>

      <form method="post" action="/api/auth/google/mo-phong">
        <input type="hidden" name="state" value={state} />

        <div className="field">
          <label htmlFor="mock-email">Địa chỉ email</label>
          <input
            id="mock-email"
            name="email"
            type="email"
            required
            autoComplete="off"
            placeholder="ten.ban@gmail.com"
          />
        </div>

        <div className="field">
          <label htmlFor="mock-name">Tên hiển thị</label>
          <input id="mock-name" name="name" type="text" autoComplete="off" placeholder="Nguyễn Văn A" />
          <span className="hint">Bỏ trống thì lấy phần trước dấu @ làm tên.</span>
        </div>

        <button type="submit" className="btn btn--primary btn--block">
          Tiếp tục (mô phỏng)
        </button>
      </form>
    </>
  );
}
