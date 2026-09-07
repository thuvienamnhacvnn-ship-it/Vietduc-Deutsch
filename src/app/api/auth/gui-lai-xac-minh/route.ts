import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { issueAuthToken } from "@/lib/auth/session";
import { sendMail, verifyEmailMail } from "@/lib/adapters/mail";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";

const Body = z.object({ email: z.string().trim().toLowerCase().email() });

/** Luôn trả ok, cùng lý do với /quen-mat-khau. */
export async function POST(request: Request) {
  const limit = hit(`gui-lai:${clientIp(request)}`, 3, 10 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: true });

  const db = await getDb();
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      status: users.status,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  const user = rows[0];
  if (user && user.status === "active" && !user.emailVerifiedAt) {
    const token = await issueAuthToken(user.id, "verify_email");
    await sendMail(verifyEmailMail(parsed.data.email, user.name, token));
  }

  return Response.json({ ok: true });
}
