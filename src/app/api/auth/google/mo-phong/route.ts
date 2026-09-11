import { encodeMockCode, mockEnabled } from "@/lib/adapters/oauth-google";
import { config } from "@/lib/config";

/**
 * Đóng vai endpoint của Google, CHỈ ở môi trường phát triển.
 *
 * Nhận email và tên từ màn hình mô phỏng, gói thành "mã", rồi chuyển sang đúng
 * callback thật. Nhờ vậy toàn bộ luồng - state, cookie, tạo tài khoản, liên kết
 * tài khoản, tạo phiên - được đi qua y như khi có Google thật, và test end-to-end
 * kiểm được nó mà không cần khóa nào.
 *
 * `mockEnabled()` trả false ở production, nên route này trả 404 ở đó.
 */
export async function POST(request: Request) {
  if (!mockEnabled()) return new Response("Not found", { status: 404 });

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim();
  const state = String(form.get("state") ?? "");

  if (!email.includes("@") || !state) {
    return Response.redirect(new URL("/dang-nhap?loi=google_thieu_tham_so", config.appUrl).toString(), 303);
  }

  const code = encodeMockCode({ email, name });
  const target = new URL("/api/auth/google/callback", config.appUrl);
  target.searchParams.set("state", state);
  target.searchParams.set("code", code);

  // 303 để trình duyệt đổi POST thành GET, đúng như Google chuyển hướng về.
  return Response.redirect(target.toString(), 303);
}
