import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { assessmentSessions } from "@/lib/db/schema";
import { apiUser } from "@/lib/auth/guard";
import {
  examRecordOf,
  finishSession,
  hasSpeakingAudio,
  scoreSession,
  writingResponseFor,
  type SessionState,
} from "@/lib/placement";
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

  // Người học có thể đã ghi âm bài Nói. Điều đó chưa đủ để chấm - vẫn thiếu bộ
  // phân tích giọng nói - nhưng nó quyết định câu giải thích trả về cho họ.
  const spokeAudio = await hasSpeakingAudio(session.id, auth.user.id);
  const results = scoreSession(state, writing, spokeAudio);

  // Hồ sơ điều kiện làm bài: mã bài thi, thời gian từng phần, số lượt nghe đã
  // dùng, cam kết đã ký. Một kết quả không kèm hồ sơ thì không ai kiểm chứng
  // được nó được tạo ra trong điều kiện nào.
  const record = examRecordOf(session.id, new Date(session.startedAt), new Date(), state);

  await finishSession(auth.user.id, session.id, results, record);
  await audit({
    actorUserId: auth.user.id,
    action: "placement.finish",
    entity: "assessment_sessions",
    entityId: session.id,
    after: {
      record,
      results: results.map((r) => ({
        skill: r.skill,
        level: r.level,
        unknown: r.insufficientEvidence,
      })),
    },
    ip: clientIp(request),
  });

  return Response.json({ ok: true, results, record });
}
