import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const Body = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const ip = clientIp(request);
  const byIp = hit(`dang-nhap-ip:${ip}`, 10, 10 * 60 * 1000);
  if (!byIp.allowed) return tooMany(byIp);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", message: "Nhập email và mật khẩu." } },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  // Giới hạn riêng theo email: một IP thử nhiều tài khoản và nhiều IP thử một
  // tài khoản là hai kiểu tấn công khác nhau, chặn cả hai.
  const byAccount = hit(`dang-nhap-acc:${email}`, 10, 10 * 60 * 1000);
  if (!byAccount.allowed) return tooMany(byAccount);

  const db = await getDb();
  const rows = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = rows[0];
  // So khớp cả khi không tìm thấy tài khoản HOẶC tài khoản không có mật khẩu
  // (chỉ đăng nhập bằng Google), để thời gian phản hồi không tiết lộ email nào
  // tồn tại và tài khoản nào dùng cách đăng nhập gì.
  const ok = user?.passwordHash
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, "scrypt$00$00");

  if (!user || !user.passwordHash || !ok || user.status !== "active") {
    await audit({ action: "auth.login_failed", entity: "users", entityId: email, ip, actorKind: "system" });
    return Response.json(
      { error: { code: "invalid_credentials", message: "Email hoặc mật khẩu không đúng." } },
      { status: 401 },
    );
  }

  await createSession(user.id);
  await audit({ actorUserId: user.id, action: "auth.login", entity: "users", entityId: user.id, ip });

  return Response.json({ ok: true, role: user.role });
}
