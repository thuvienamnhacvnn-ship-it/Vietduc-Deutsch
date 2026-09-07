import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { learnerProfiles } from "@/lib/db/schema";
import { apiUser } from "@/lib/auth/guard";
import { profileFor } from "@/lib/queries";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const Patch = z.object({
  goal: z.enum(["giao_tiep", "cuoc_song", "cong_viec", "ausbildung", "thi_cu"]).nullable().optional(),
  goalNote: z.string().trim().max(1000).nullable().optional(),
  priorExperience: z.enum(["chua_hoc", "duoi_6_thang", "6_12_thang", "tren_1_nam"]).nullable().optional(),
  hoursPerWeek: z.number().int().min(0).max(60).nullable().optional(),
  supportLanguage: z.enum(["vi", "de"]).optional(),
  timezone: z.string().trim().max(60).optional(),
  correctionStyle: z.enum(["immediate", "end_of_turn"]).optional(),
  accessibility: z
    .object({
      reducedMotion: z.boolean().optional(),
      captions: z.boolean().optional(),
      largeText: z.boolean().optional(),
      slowSpeech: z.boolean().optional(),
    })
    .optional(),
});

export async function GET() {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;
  // profileFor lọc theo userId của phiên - không có tham số nào từ client quyết
  // định hồ sơ nào được đọc.
  return Response.json({ profile: await profileFor(auth.user.id) });
}

export async function PATCH(request: Request) {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  const limit = hit(`ho-so:${auth.user.id}`, 30, 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Patch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0])] = issue.message;
    return Response.json(
      { error: { code: "invalid_input", message: "Dữ liệu không hợp lệ.", fields } },
      { status: 400 },
    );
  }

  const before = await profileFor(auth.user.id);
  const db = await getDb();

  const patch = { ...parsed.data } as Record<string, unknown>;
  if (parsed.data.accessibility) {
    // Gộp thay vì thay thế: client chỉ gửi công tắc vừa đổi.
    patch.accessibility = { ...before.accessibility, ...parsed.data.accessibility };
  }

  const updated = await db
    .update(learnerProfiles)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(learnerProfiles.userId, auth.user.id))
    .returning();

  await audit({
    actorUserId: auth.user.id,
    action: "profile.update",
    entity: "learner_profiles",
    entityId: before.id,
    before,
    after: updated[0],
    ip: clientIp(request),
  });

  return Response.json({ ok: true, profile: updated[0] });
}
