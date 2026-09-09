import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { assessmentSessions } from "@/lib/db/schema";
import { apiUser } from "@/lib/auth/guard";
import { consumeListen, listensLeftFor, type SessionState } from "@/lib/placement";
import { itemByCode } from "@/content/placement";
import { LISTEN_LIMIT } from "@/content/quy-che-thi";
import { hit, tooMany } from "@/lib/rate-limit";

const Body = z.object({
  sessionId: z.number().int().positive(),
  code: z.string().min(3).max(40),
});

/**
 * Cấp một lượt nghe cho câu Nghe.
 *
 * Câu tiếng Đức chỉ tồn tại ở server và chỉ được trả về đúng số lần quy chế cho
 * phép. Đây là chỗ biến "được nghe tối đa hai lần" từ một dòng chữ trong quy
 * chế thành một quy định có hiệu lực: client không giữ sẵn chữ nên không tự
 * phát lại được.
 *
 * Nghe chậm cũng tính là một lượt - nó vẫn là một lần được nghe lại nội dung.
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  const limit = hit(`nghe:${auth.user.id}`, 120, 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", message: "Thiếu thông tin." } },
      { status: 400 },
    );
  }

  const { sessionId, code } = parsed.data;
  const item = itemByCode(code);
  if (!item || !("audioText" in item) || !item.audioText) {
    return Response.json(
      { error: { code: "not_found", message: "Câu này không có phần nghe." } },
      { status: 404 },
    );
  }

  const db = await getDb();
  const rows = await db
    .select()
    .from(assessmentSessions)
    .where(and(eq(assessmentSessions.id, sessionId), eq(assessmentSessions.userId, auth.user.id)))
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

  // Đã trả lời rồi thì không nghe thêm được nữa: câu đã đóng.
  if (state.answered.includes(code)) {
    return Response.json(
      { error: { code: "answered", message: "Bạn đã trả lời câu này rồi." } },
      { status: 409 },
    );
  }

  const left = consumeListen(state, code, item.level);
  if (left === null) {
    return Response.json(
      {
        error: {
          code: "listen_limit",
          message: `Bạn đã dùng hết ${LISTEN_LIMIT[item.level]} lượt nghe cho câu này. Hãy trả lời theo những gì bạn nghe được.`,
        },
        listensLeft: 0,
      },
      { status: 409 },
    );
  }

  await db
    .update(assessmentSessions)
    .set({ resumeState: state })
    .where(eq(assessmentSessions.id, sessionId));

  return Response.json({
    text: item.audioText,
    listensLeft: left,
    limit: LISTEN_LIMIT[item.level],
    used: LISTEN_LIMIT[item.level] - left,
    remainingBefore: listensLeftFor(state, code, item.level),
  });
}
