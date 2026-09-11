import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { consents, learnerProfiles, oauthAccounts, users } from "@/lib/db/schema";
import { exchangeCode } from "@/lib/adapters/oauth-google";
import { createSession } from "@/lib/auth/session";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { OAUTH_COOKIE } from "../route";
import { config } from "@/lib/config";

/** Phiên bản văn bản pháp lý mà người dùng đồng ý. Giữ khớp với luồng đăng ký. */
const LEGAL_VERSION = "0.1-draft";

/**
 * Bước 2: Google trả người dùng về đây kèm `code` và `state`.
 *
 * Bốn việc phải làm đúng, theo thứ tự:
 *   1. state trong URL khớp state trong cookie  -> chặn CSRF
 *   2. đổi code lấy hồ sơ, kiểm nonce           -> chặn phát lại token
 *   3. email phải được Google xác minh          -> điều kiện để gán vào tài khoản có sẵn
 *   4. tìm theo `sub`, rồi mới tới email        -> `sub` mới là danh tính, email chỉ là nhãn
 */
export async function GET(request: Request) {
  const ip = clientIp(request);
  const limit = hit(`oauth-google-cb:${ip}`, 20, 10 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const url = new URL(request.url);
  const jar = await cookies();
  const raw = jar.get(OAUTH_COOKIE)?.value;
  // Cookie dùng một lần, xóa ngay dù kết quả thế nào: một lần chuyển hướng về
  // là một lần dùng.
  jar.delete(OAUTH_COOKIE);

  const fail = (code: string) =>
    Response.redirect(new URL(`/dang-nhap?loi=${code}`, config.appUrl).toString(), 302);

  // Người dùng bấm "Hủy" ở màn hình Google.
  if (url.searchParams.get("error")) return fail("google_bi_huy");

  if (!raw) return fail("google_het_han");

  let saved: { state: string; nonce: string; verifier: string; next: string };
  try {
    saved = JSON.parse(raw);
  } catch {
    return fail("google_het_han");
  }

  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  if (!state || !code) return fail("google_thieu_tham_so");
  if (state !== saved.state) return fail("google_sai_state");

  let profile;
  try {
    profile = await exchangeCode({ code, codeVerifier: saved.verifier, nonce: saved.nonce });
  } catch (error) {
    console.error("[oauth:google] callback:", (error as Error).message);
    return fail("google_that_bai");
  }

  if (!profile.emailVerified) return fail("google_email_chua_xac_minh");

  const db = await getDb();

  // 1. Đã liên kết trước đó? Đây là đường đi của mọi lần đăng nhập lại.
  const linked = await db
    .select({ userId: oauthAccounts.userId, id: oauthAccounts.id })
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, "google"),
        eq(oauthAccounts.providerAccountId, profile.sub),
      ),
    )
    .limit(1);

  if (linked[0]) {
    await db
      .update(oauthAccounts)
      .set({ email: profile.email, lastLoginAt: new Date() })
      .where(eq(oauthAccounts.id, linked[0].id));
    await createSession(linked[0].userId);
    await audit({
      actorUserId: linked[0].userId,
      action: "auth.login_google",
      entity: "users",
      entityId: linked[0].userId,
      ip,
    });
    return Response.redirect(new URL(saved.next, config.appUrl).toString(), 302);
  }

  // 2. Chưa liên kết, nhưng email đã có tài khoản -> nối vào tài khoản đó.
  //    An toàn vì Google vừa xác nhận người này kiểm soát chính địa chỉ email
  //    ấy. Đây cũng là lúc email của tài khoản cũ được coi là đã xác minh.
  const existing = await db
    .select({ id: users.id, status: users.status, emailVerifiedAt: users.emailVerifiedAt })
    .from(users)
    .where(eq(users.email, profile.email))
    .limit(1);

  if (existing[0]) {
    if (existing[0].status !== "active") return fail("tai_khoan_bi_khoa");

    await db.insert(oauthAccounts).values({
      userId: existing[0].id,
      provider: "google",
      providerAccountId: profile.sub,
      email: profile.email,
      lastLoginAt: new Date(),
    });
    if (!existing[0].emailVerifiedAt) {
      await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, existing[0].id));
    }

    await createSession(existing[0].id);
    await audit({
      actorUserId: existing[0].id,
      action: "auth.link_google",
      entity: "users",
      entityId: existing[0].id,
      after: { email: profile.email, mode: profile.mode },
      ip,
    });
    return Response.redirect(new URL(saved.next, config.appUrl).toString(), 302);
  }

  // 3. Người mới: tạo tài khoản không mật khẩu.
  const created = await db
    .insert(users)
    .values({
      email: profile.email,
      name: profile.name.slice(0, 120),
      // Không có mật khẩu, và cũng không đặt mật khẩu ngẫu nhiên giả: cột NULL
      // là cách trung thực để nói "tài khoản này đăng nhập bằng Google".
      passwordHash: null,
      // Google đã xác minh địa chỉ, không cần bắt xác minh lại lần nữa.
      emailVerifiedAt: new Date(),
    })
    .returning({ id: users.id });
  const userId = created[0]!.id;

  await db.insert(learnerProfiles).values({ userId });

  // Đồng ý điều khoản ở đây đến từ dòng thông báo ngay dưới nút Google, không
  // phải từ một ô tick. Ghi đúng phương thức để về sau rà soát được.
  await db.insert(consents).values([
    {
      userId,
      kind: "terms",
      granted: true,
      documentVersion: LEGAL_VERSION,
      method: "oauth_notice",
      ip,
    },
    {
      userId,
      kind: "privacy",
      granted: true,
      documentVersion: LEGAL_VERSION,
      method: "oauth_notice",
      ip,
    },
    // Liên hệ tiếp thị mặc định KHÔNG đồng ý. Nó cần một hành động riêng, rõ
    // ràng - bấm nút đăng nhập không phải là đồng ý nhận thư quảng cáo.
    {
      userId,
      kind: "marketing_contact",
      granted: false,
      documentVersion: LEGAL_VERSION,
      method: "oauth_notice",
      ip,
    },
  ]);

  await db.insert(oauthAccounts).values({
    userId,
    provider: "google",
    providerAccountId: profile.sub,
    email: profile.email,
    lastLoginAt: new Date(),
  });

  await createSession(userId);
  await audit({
    actorUserId: userId,
    action: "auth.register_google",
    entity: "users",
    entityId: userId,
    after: { mode: profile.mode },
    ip,
  });

  // Người MỚI đi thẳng vào bài kiểm tra trình độ, không qua bảng học rỗng.
  const firstStop = saved.next === "/hoc" ? "/hoc/xep-lop" : saved.next;
  return Response.redirect(new URL(firstStop, config.appUrl).toString(), 302);
}
