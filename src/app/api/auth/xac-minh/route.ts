import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { consumeAuthToken } from "@/lib/auth/session";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const Body = z.object({ token: z.string().min(10) });

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = hit(`xac-minh:${ip}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", message: "Thiếu mã xác minh." } },
      { status: 400 },
    );
  }

  const userId = await consumeAuthToken(parsed.data.token, "verify_email");
  if (!userId) {
    return Response.json(
      {
        error: {
          code: "invalid_token",
          message: "Liên kết xác minh không đúng, đã dùng rồi hoặc đã hết hạn.",
        },
      },
      { status: 400 },
    );
  }

  const db = await getDb();
  await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, userId));
  await audit({ actorUserId: userId, action: "auth.email_verified", entity: "users", entityId: userId, ip });

  return Response.json({ ok: true });
}
