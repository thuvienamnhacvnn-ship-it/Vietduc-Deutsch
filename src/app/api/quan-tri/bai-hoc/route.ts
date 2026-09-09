import { z } from "zod";
import { apiStaff } from "@/lib/auth/guard";
import { publishLesson, unpublishLesson } from "@/lib/lop-hoc-db";
import { clientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const Body = z.object({
  versionId: z.number().int().positive(),
  publish: z.boolean(),
});

/**
 * Duyệt hoặc rút lại một bài học.
 *
 * Ghi lại AI duyệt và lúc nào, ở cả bảng bài học lẫn nhật ký. Nội dung do máy
 * soạn mà không truy được người chịu trách nhiệm thì quy trình duyệt chỉ là một
 * cái nút.
 */
export async function POST(request: Request) {
  const auth = await apiStaff();
  if (!auth.ok) return auth.response;

  if (auth.user.role !== "admin" && auth.user.role !== "editor") {
    return Response.json(
      { error: { code: "forbidden", message: "Chỉ biên tập viên và quản trị được duyệt bài." } },
      { status: 403 },
    );
  }

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", message: "Thiếu thông tin bài học." } },
      { status: 400 },
    );
  }

  const { versionId, publish } = parsed.data;
  if (publish) await publishLesson(versionId, auth.user.id);
  else await unpublishLesson(versionId, auth.user.id);

  await audit({
    actorUserId: auth.user.id,
    action: publish ? "lesson.published" : "lesson.unpublished",
    entity: "lesson_versions",
    entityId: versionId,
    ip: clientIp(request),
  });

  return Response.json({ ok: true });
}
