import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { assessmentSessions, responses } from "@/lib/db/schema";
import { apiUser } from "@/lib/auth/guard";
import {
  autoIsCorrect,
  estimateTotal,
  nextItem,
  publicItem,
  questionVersionIdFor,
  readingLevelSoFar,
  type SessionState,
} from "@/lib/placement";
import { itemByCode } from "@/content/placement";
import { hit, tooMany } from "@/lib/rate-limit";

const Body = z.object({
  sessionId: z.number().int().positive(),
  code: z.string().min(3).max(40),
  /** Trắc nghiệm: chỉ số đáp án. Viết: bài làm. Nói: bỏ qua hoặc đã thu âm. */
  choice: z.number().int().min(0).max(9).optional(),
  text: z.string().max(5000).optional(),
  skip: z.boolean().optional(),
});

/**
 * Ghi một câu trả lời và trả về câu kế tiếp.
 *
 * Mỗi câu được ghi NGAY khi trả lời, không đợi tới cuối bài: mất mạng giữa
 * chừng thì những câu đã làm vẫn còn (yêu cầu C-10).
 *
 * Đáp án đúng chỉ được tiết lộ SAU khi câu trả lời đã lưu. Trước đó nó chưa bao
 * giờ rời khỏi server.
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  const limit = hit(`xep-lop-tl:${auth.user.id}`, 120, 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", message: "Dữ liệu không hợp lệ." } },
      { status: 400 },
    );
  }

  const { sessionId, code, choice, text, skip } = parsed.data;
  const db = await getDb();

  // Phiên phải thuộc về chính người đang đăng nhập. Không có bước này, ai cũng
  // ghi được bài làm vào phiên của người khác chỉ bằng cách đổi sessionId.
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

  const item = itemByCode(code);
  if (!item) {
    return Response.json(
      { error: { code: "not_found", message: "Không tìm thấy câu hỏi." } },
      { status: 404 },
    );
  }

  const state = session.resumeState as SessionState;

  if (!Array.isArray(state.skipped)) state.skipped = [];

  // Phần Nói được phép bỏ qua: không có mic, đang ở chỗ đông người, hoặc đơn
  // giản là hôm nay không muốn nói.
  if (item.kind === "speak" && skip) {
    state.skippedSpeaking = true;
  } else if (!state.answered.includes(code)) {
    const questionVersionId = await questionVersionIdFor(code);
    if (!questionVersionId) {
      return Response.json(
        { error: { code: "not_seeded", message: "Ngân hàng câu hỏi chưa được nạp." } },
        { status: 500 },
      );
    }

    const raw =
      item.kind === "mcq"
        ? { code, choice: skip ? null : (choice ?? null), skipped: Boolean(skip) }
        : item.kind === "gap"
          ? { code, text: skip ? "" : (text ?? ""), skipped: Boolean(skip) }
          : item.kind === "write"
            ? { code, text: text ?? "", skipped: Boolean(skip) }
            : { code, spoken: false };

    // Bỏ qua khác với trả lời sai. Câu bỏ qua không có điểm, và hàm chấm loại
    // nó khỏi phép tính thay vì coi là một câu làm hỏng.
    const isCorrect =
      (item.kind === "mcq" || item.kind === "gap") && !skip
        ? autoIsCorrect(item, { choice, text })
        : null;

    await db.insert(responses).values({
      sessionId,
      userId: auth.user.id,
      questionVersionId,
      raw,
      autoScore: isCorrect === null ? null : isCorrect ? 1 : 0,
    });

    state.answered.push(code);
    if (skip) state.skipped.push(code);
    if (isCorrect !== null) state.correct[code] = isCorrect;
  }

  await db
    .update(assessmentSessions)
    .set({ resumeState: state })
    .where(eq(assessmentSessions.id, sessionId));

  const next = nextItem(state, readingLevelSoFar(state));

  return Response.json({
    saved: true,
    // Chỉ trả về đáp án đúng và lời giải thích ở đây, sau khi đã ghi bài làm.
    feedback:
      (item.kind === "mcq" || item.kind === "gap") && !skip
        ? {
            correct: state.correct[code] === true,
            // Trắc nghiệm trả về chỉ số để tô đáp án đúng; câu điền trả về chính
            // từ cần điền, vì không có phương án nào để tô.
            answer: item.kind === "mcq" ? item.answer : null,
            expected: item.kind === "gap" ? item.accept[0] : null,
            why: item.why,
          }
        : null,
    item: next ? publicItem(next, state.answered.length + 1, estimateTotal(state)) : null,
    done: next === null,
  });
}
