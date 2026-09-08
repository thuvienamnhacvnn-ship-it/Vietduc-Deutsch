import { getDb } from "@/lib/db";
import { assessmentSessions } from "@/lib/db/schema";
import { apiUser } from "@/lib/auth/guard";
import {
  EMPTY_STATE,
  estimateTotal,
  nextItem,
  openSessionFor,
  publicItem,
  readingLevelSoFar,
  type SessionState,
} from "@/lib/placement";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

/**
 * Bắt đầu, hoặc tiếp tục, bài kiểm tra xếp lớp.
 *
 * Đang dở thì trả về đúng câu đang dở chứ không tạo phiên mới - người học đóng
 * tab giữa chừng rồi quay lại phải thấy mình ở nguyên chỗ cũ (yêu cầu C-10).
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  const limit = hit(`xep-lop-bd:${auth.user.id}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const db = await getDb();
  let session = await openSessionFor(auth.user.id);

  if (!session) {
    const created = await db
      .insert(assessmentSessions)
      .values({ userId: auth.user.id, kind: "placement", resumeState: EMPTY_STATE })
      .returning();
    session = created[0]!;
    await audit({
      actorUserId: auth.user.id,
      action: "placement.start",
      entity: "assessment_sessions",
      entityId: session.id,
      ip: clientIp(request),
    });
  }

  const state = session.resumeState as SessionState;
  const item = nextItem(state, readingLevelSoFar(state));

  return Response.json({
    sessionId: session.id,
    resumed: state.answered.length > 0,
    item: item ? publicItem(item, state.answered.length + 1, estimateTotal(state)) : null,
    done: item === null,
  });
}
