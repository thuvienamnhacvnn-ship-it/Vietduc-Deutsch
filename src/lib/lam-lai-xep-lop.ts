import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { assessmentSessions, responses, skillScores } from "@/lib/db/schema";

/**
 * Xoá lịch sử bài kiểm tra xếp lớp của một học viên để họ làm lại từ đầu.
 *
 * VÌ SAO CẦN XOÁ, chứ không chỉ làm thêm một bài mới: hệ thống cố ý tránh những
 * câu người học đã gặp ở lần trước, nên sau vài lần thi lại ngân hàng câu cạn
 * dần và đề bắt đầu lặp. Xoá lịch sử trả họ về đúng vị trí người mới - đề rộng
 * trở lại, và mức cũ không còn treo ở đó nữa.
 *
 * BA ĐIỀU KHÔNG ĐỘNG TỚI, và đây là phần quan trọng nhất của hàm này:
 *
 *  - Tài khoản, hồ sơ và quyền học. Làm lại bài kiểm tra không phải là xoá
 *    người.
 *  - Buổi học nói đã học và thẻ ôn tập. Đó là công sức học thật, không liên
 *    quan tới việc đo trình độ.
 *  - Đơn hàng và khoản thu. Không bao giờ.
 *
 * Hàm trả về số lượng từng thứ đã xoá, để nơi gọi ghi vào nhật ký - một thao
 * tác xoá không để lại dấu vết thì sau này không ai trả lời được câu "kết quả
 * của học viên này đi đâu mất".
 */
export type ResetSummary = {
  sessions: number;
  responses: number;
  scores: number;
};

export async function resetPlacementHistory(userId: number): Promise<ResetSummary> {
  const db = await getDb();

  const sessions = await db
    .select({ id: assessmentSessions.id })
    .from(assessmentSessions)
    .where(and(eq(assessmentSessions.userId, userId), eq(assessmentSessions.kind, "placement")));

  const ids = sessions.map((s) => s.id);

  // Đếm trước khi xoá: sau khi xoá thì không đếm được nữa, mà con số này là thứ
  // đi vào nhật ký.
  const answers = ids.length
    ? await db.select({ id: responses.id }).from(responses).where(inArray(responses.sessionId, ids))
    : [];

  const scores = await db
    .select({ id: skillScores.id })
    .from(skillScores)
    .where(eq(skillScores.userId, userId));

  /*
   * Thứ tự xoá đi từ trong ra ngoài, không dựa vào cascade của cơ sở dữ liệu.
   *
   * `responses` và `skill_scores` đều trỏ tới phiên làm bài, nhưng bằng hai
   * kiểu khác nhau: một cái cascade, một cái set null. Xoá tay cả hai thì hành
   * vi giống nhau trên PGlite lẫn Postgres thật, và đọc code là biết cái gì bị
   * xoá - không phải mở schema ra tra.
   */
  if (ids.length) {
    await db.delete(responses).where(inArray(responses.sessionId, ids));
  }
  await db.delete(skillScores).where(eq(skillScores.userId, userId));
  if (ids.length) {
    await db.delete(assessmentSessions).where(inArray(assessmentSessions.id, ids));
  }

  return { sessions: ids.length, responses: answers.length, scores: scores.length };
}
