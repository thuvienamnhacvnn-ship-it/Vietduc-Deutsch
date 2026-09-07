import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { issueAuthToken } from "@/lib/auth/session";
import { resetPasswordMail, sendMail } from "@/lib/adapters/mail";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const Body = z.object({ email: z.string().trim().toLowerCase().email() });

/**
 * Luôn trả `{ok:true}` dù email có tồn tại hay không. Ở đây khác với luồng đăng
 * ký: bất kỳ ai cũng gọi được endpoint này cho email của người khác, nên câu trả
 * lời khác nhau sẽ thành công cụ dò xem ai có tài khoản.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = hit(`quen-mk:${ip}`, 3, 10 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: true });

  const email = parsed.data.email;
  const db = await getDb();
  const rows = await db
    .select({ id: users.id, name: users.name, status: users.status })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = rows[0];
  if (user && user.status === "active") {
    const token = await issueAuthToken(user.id, "reset_password");
    await sendMail(resetPasswordMail(email, user.name, token));
    await audit({
      actorUserId: user.id,
      action: "auth.reset_requested",
      entity: "users",
      entityId: user.id,
      ip,
    });
  }

  return Response.json({ ok: true });
}
