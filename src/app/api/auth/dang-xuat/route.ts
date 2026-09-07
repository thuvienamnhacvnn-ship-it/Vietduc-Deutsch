import { destroySession, getSessionUser } from "@/lib/auth/session";
import { clientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

export async function POST(request: Request) {
  const user = await getSessionUser();
  await destroySession();
  if (user) {
    await audit({
      actorUserId: user.id,
      action: "auth.logout",
      entity: "users",
      entityId: user.id,
      ip: clientIp(request),
    });
  }
  return Response.json({ ok: true });
}
