import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";
import { hashPassword, passwordProblem } from "@/lib/auth/password";
import { consumeAuthToken } from "@/lib/auth/session";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const Body = z.object({ token: z.string().min(10), password: z.string() });

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = hit(`dat-lai-mk:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", message: "Thiếu thông tin." } },
      { status: 400 },
    );
  }

  const problem = passwordProblem(parsed.data.password);
  if (problem) {
    return Response.json(
      { error: { code: "invalid_input", message: problem, fields: { password: problem } } },
      { status: 400 },
    );
  }

  const userId = await consumeAuthToken(parsed.data.token, "reset_password");
  if (!userId) {
    return Response.json(
      {
        error: {
          code: "invalid_token",
          message: "Liên kết đặt lại mật khẩu không đúng, đã dùng rồi hoặc đã hết hạn.",
        },
      },
      { status: 400 },
    );
  }

  const db = await getDb();
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.password) })
    .where(eq(users.id, userId));

  // Đổi mật khẩu thì mọi phiên đang mở phải mất hiệu lực: nếu ai đó chiếm được
  // tài khoản, việc đặt lại mật khẩu phải đá họ ra chứ không chỉ thêm một lối vào.
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.userId, userId));

  await audit({ actorUserId: userId, action: "auth.password_reset", entity: "users", entityId: userId, ip });
  return Response.json({ ok: true });
}
