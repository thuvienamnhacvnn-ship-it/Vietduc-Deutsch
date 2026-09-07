import { cookies } from "next/headers";
import {
  authorizationUrl,
  createPkce,
  googleAvailable,
  randomToken,
} from "@/lib/adapters/oauth-google";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";

/**
 * Bước 1 của "Tiếp tục với Google": sinh state + nonce + PKCE, cất vào cookie
 * httpOnly, rồi chuyển người dùng sang Google.
 *
 * `state` và `nonce` nằm trong cookie chứ không nằm trong session ở bộ nhớ: quá
 * trình này đi qua một tên miền khác rồi quay lại, và cookie là thứ duy nhất
 * chắc chắn còn nguyên ở cả hai đầu, kể cả khi server vừa khởi động lại giữa
 * chừng lúc phát triển.
 */

export const OAUTH_COOKIE = "lingora_oauth";
const TTL_SECONDS = 10 * 60;

export async function GET(request: Request) {
  const limit = hit(`oauth-google:${clientIp(request)}`, 20, 10 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  if (!googleAvailable()) {
    // Không im lặng chuyển hướng sang một trang lỗi mơ hồ: nói đúng lý do.
    return Response.redirect(
      new URL("/dang-nhap?loi=google_chua_ket_noi", request.url).toString(),
      302,
    );
  }

  const url = new URL(request.url);
  const rawNext = url.searchParams.get("tiep");
  // Chỉ nhận đường dẫn nội bộ. Không có bước này, `tiep=https://...` biến
  // endpoint đăng nhập thành một open redirect.
  const next = rawNext?.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/hoc";

  const state = randomToken();
  const nonce = randomToken();
  const pkce = createPkce();

  const jar = await cookies();
  jar.set(OAUTH_COOKIE, JSON.stringify({ state, nonce, verifier: pkce.verifier, next }), {
    httpOnly: true,
    sameSite: "lax", // "lax" là bắt buộc: cookie phải sống sót qua chuyển hướng từ Google về.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  });

  return Response.redirect(
    new URL(authorizationUrl({ state, nonce, codeChallenge: pkce.challenge }), request.url).toString(),
    302,
  );
}
