import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { adapterMode, config } from "@/lib/config";

/**
 * Đăng nhập bằng Google, luồng Authorization Code + PKCE.
 *
 * Vì sao là luồng chuyển hướng phía server chứ không phải nút JavaScript của
 * Google: mã đổi lấy token nằm ở server, `client_secret` không bao giờ ra tới
 * trình duyệt, và không phải nạp script của bên thứ ba vào mọi trang. Người
 * dùng đã đăng nhập Gmail sẵn thì Google tự chọn tài khoản đó và quay về gần
 * như tức thì - vẫn đúng ý "đăng ký nhanh".
 *
 * Hai bản cài đặt như mọi adapter khác:
 *   live - có GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
 *   mock - CHỈ chạy khi NODE_ENV !== "production". Xem ghi chú ở `mockEnabled`.
 */

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

export type GoogleProfile = {
  /** Định danh bất biến của Google cho tài khoản này. */
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  mode: "live" | "mock";
};

export function redirectUri(): string {
  return `${config.appUrl}/api/auth/google/callback`;
}

/**
 * Chế độ mô phỏng chỉ bật ở môi trường phát triển.
 *
 * Đây là ranh giới quan trọng nhất của tệp này: một màn hình giả bắt chước
 * Google mà chạy trên production là lừa người dùng. Thiếu khóa ở production thì
 * nút đăng nhập Google bị vô hiệu kèm lý do chính xác, không có đường vòng.
 */
export function mockEnabled(): boolean {
  return adapterMode("oauth_google") === "mock" && process.env.NODE_ENV !== "production";
}

/** Google dùng được hay không, ở bất kỳ chế độ nào. */
export function googleAvailable(): boolean {
  return adapterMode("oauth_google") === "live" || mockEnabled();
}

/* --------------------------------------------------------------------- PKCE */

export type PkcePair = { verifier: string; challenge: string };

export function createPkce(): PkcePair {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function randomToken(): string {
  return randomBytes(24).toString("base64url");
}

/* ----------------------------------------------------------- bước 1: chuyển đi */

export function authorizationUrl(params: {
  state: string;
  nonce: string;
  codeChallenge: string;
}): string {
  if (mockEnabled()) {
    // Trang mô phỏng nội bộ, tự nói rõ nó không phải Google.
    return `/dang-nhap/google-mo-phong?state=${encodeURIComponent(params.state)}`;
  }

  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", params.nonce);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  // Cố ý KHÔNG đặt prompt=select_account: người dùng đang đăng nhập sẵn một tài
  // khoản Gmail sẽ được Google cho qua thẳng, đúng yêu cầu "đăng ký nhanh".
  // Người có nhiều tài khoản vẫn thấy màn hình chọn của Google.
  url.searchParams.set("include_granted_scopes", "true");
  return url.toString();
}

/* ------------------------------------------------- bước 2: đổi mã lấy hồ sơ */

export async function exchangeCode(args: {
  code: string;
  codeVerifier: string;
  nonce: string;
}): Promise<GoogleProfile> {
  if (mockEnabled()) return exchangeMock(args.code);

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: args.code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
      code_verifier: args.codeVerifier,
    }),
  });

  if (!response.ok) {
    // Không đưa nội dung lỗi của Google ra cho người dùng; nó có thể chứa chi
    // tiết cấu hình. Ghi log ở đây, trả thông báo chung ở route.
    console.error("[oauth:google] đổi mã thất bại:", response.status);
    throw new Error("google_token_exchange_failed");
  }

  const token = (await response.json()) as { id_token?: string };
  if (!token.id_token) throw new Error("google_missing_id_token");

  return verifyIdToken(token.id_token, args.nonce);
}

/**
 * Kiểm tra id_token.
 *
 * Không lấy JWKS để xác minh chữ ký: token này đến TRỰC TIẾP từ endpoint của
 * Google qua TLS trong chính request ở trên, không đi qua trình duyệt, nên
 * kênh truyền đã bảo đảm nguồn gốc - đúng như tài liệu Google nói về luồng
 * authorization code phía server. Những gì vẫn phải kiểm thì kiểm đủ: iss, aud,
 * exp, nonce và email_verified.
 */
function verifyIdToken(idToken: string, expectedNonce: string): GoogleProfile {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("google_malformed_id_token");

  const payload = JSON.parse(Buffer.from(parts[1]!, "base64url").toString("utf8")) as {
    iss?: string;
    aud?: string;
    exp?: number;
    nonce?: string;
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };

  if (!payload.iss || !ISSUERS.includes(payload.iss)) throw new Error("google_bad_issuer");
  if (payload.aud !== process.env.GOOGLE_CLIENT_ID) throw new Error("google_bad_audience");
  if (!payload.exp || payload.exp * 1000 < Date.now()) throw new Error("google_expired_token");
  if (payload.nonce !== expectedNonce) throw new Error("google_bad_nonce");
  if (!payload.sub || !payload.email) throw new Error("google_incomplete_profile");

  return {
    sub: payload.sub,
    email: payload.email.trim().toLowerCase(),
    // Google trả false khi địa chỉ chưa được xác minh. Route gọi hàm này sẽ từ
    // chối, vì email chưa xác minh không đủ để gán vào một tài khoản có sẵn.
    emailVerified: payload.email_verified === true,
    name: payload.name?.trim() || payload.email.split("@")[0]!,
    mode: "live",
  };
}

/* ---------------------------------------------------------------- bản mô phỏng */

/**
 * "Mã" của bản mô phỏng chỉ là hồ sơ đã mã hóa base64url do trang
 * /dang-nhap/google-mo-phong tạo ra. Nó không giả vờ là JWT và không bao giờ
 * rời khỏi máy phát triển.
 */
export function encodeMockCode(profile: { email: string; name: string }): string {
  return Buffer.from(JSON.stringify(profile), "utf8").toString("base64url");
}

function exchangeMock(code: string): GoogleProfile {
  let parsed: { email?: string; name?: string };
  try {
    parsed = JSON.parse(Buffer.from(code, "base64url").toString("utf8"));
  } catch {
    throw new Error("google_malformed_id_token");
  }
  if (!parsed.email) throw new Error("google_incomplete_profile");

  const email = parsed.email.trim().toLowerCase();
  return {
    // `sub` ổn định theo email để mô phỏng đúng hành vi "cùng tài khoản Google
    // thì cùng một người", kể cả sau khi khởi động lại server.
    sub: `mock-${createHash("sha256").update(email).digest("hex").slice(0, 24)}`,
    email,
    emailVerified: true,
    name: parsed.name?.trim() || email.split("@")[0]!,
    mode: "mock",
  };
}
