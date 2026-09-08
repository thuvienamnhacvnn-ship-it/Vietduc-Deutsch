import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { assessmentSessions } from "@/lib/db/schema";
import { apiUser } from "@/lib/auth/guard";
import { finishSession, scoreSession, writingResponseFor, type SessionState } from "@/lib/placement";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const Body = z.object({ sessionId: z.number().int().positive() });

/**
 * Nộp bài và tính kết quả bốn kỹ năng.
 *
 * Chấm ở server từ những gì đã lưu trong `responses`, không nhận điểm từ trình
 * duyệt gửi lên. Gọi lại lần hai trên một phiên đã nộp thì trả về 409 chứ không
 * ghi thêm một bộ điểm nữa.
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  const limit = hit(`xep-lop-kt:${auth.user.id}`, 20, 60 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", message: "Thiếu mã bài làm." } },
      { status: 400 },
    );
  }

  const db = await getDb();
  const rows = await db
    .select()
    .from(assessmentSessions)
    .where(
      and(
        eq(assessmentSessions.id, parsed.data.sessionId),
        eq(assessmentSessions.userId, auth.user.id),
      ),
    )
    .limit(1);

  const session = rows[0];
  if (!session) {
    return Response.json(
      { error: { code: "not_found", message: "Không tìm thấy bài làm." } },
      { status: 404 },
    );
  }
  if (session.status !== "in_progress") {
    return Response.json(
      { error: { code: "closed", message: "Bài làm này đã nộp rồi." } },
      { status: 409 },
    );
  }

  const state = session.resumeState as SessionState;
  const writing = await writingResponseFor(session.id, auth.user.id);

  // Chưa có dịch vụ phân tích giọng nói, nên chưa có phiên nào thu được audio
  // dùng để chấm. Truyền false một cách tường minh thay vì để mặc định ngầm.
  const results = scoreSession(state, writing, false);

  await finishSession(auth.user.id, session.id, results);
  await audit({
    actorUserId: auth.user.id,
    action: "placement.finish",
    entity: "assessment_sessions",
    entityId: session.id,
    after: results.map((r) => ({ skill: r.skill, level: r.level, unknown: r.insufficientEvidence })),
    ip: clientIp(request),
  });

  return Response.json({ ok: true, results });
}
