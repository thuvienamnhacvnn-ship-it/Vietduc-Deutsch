import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { assessmentSessions } from "@/lib/db/schema";
import { apiUser } from "@/lib/auth/guard";
import { consumeListen, listensLeftFor, type SessionState } from "@/lib/placement";
import { itemByCode } from "@/content/placement";
import { LISTEN_LIMIT } from "@/content/quy-che-thi";
import { hit, tooMany } from "@/lib/rate-limit";
import { speakGerman } from "@/lib/adapters/giong-noi";

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
 *
 * Có engine giọng nói thì route trả về ÂM THANH THẬT và KHÔNG trả chữ. Đó là
 * khác biệt lớn nhất giữa một bài kiểm tra nghe thật và một bài đọc chép chậm:
 * giọng đọc sẵn của trình duyệt đọc tiếng Đức bằng ngữ điệu máy, đọc sai trọng
 * âm, và trên nhiều máy Việt Nam thì không có giọng tiếng Đức nào cả.
 *
 * Chưa có engine thì vẫn trả chữ như trước để trình duyệt tự đọc, và giao diện
 * dán nhãn rằng đây là giọng máy của thiết bị.
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

  const common = {
    listensLeft: left,
    limit: LISTEN_LIMIT[item.level],
    used: LISTEN_LIMIT[item.level] - left,
    remainingBefore: listensLeftFor(state, code, item.level),
  };

  try {
    const spoken = await speakGerman(item.audioText, "anna");
    if (spoken.mode === "live") {
      // Không kèm `text`: có âm thanh rồi thì gửi thêm chữ là tự tay biến bài
      // Nghe thành bài Đọc.
      return Response.json({ ...common, audio: spoken.audio, voice: "engine" });
    }
    return Response.json({ ...common, text: item.audioText, voice: "trinh-duyet" });
  } catch {
    // Engine hỏng KHÔNG được làm hỏng bài thi. Lượt nghe đã trừ rồi, nên phải
    // trả về thứ gì đó nghe được: rơi về giọng của trình duyệt và nói rõ.
    return Response.json({ ...common, text: item.audioText, voice: "trinh-duyet" });
  }
}
