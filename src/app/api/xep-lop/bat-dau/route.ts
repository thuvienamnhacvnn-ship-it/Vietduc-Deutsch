import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { assessmentSessions } from "@/lib/db/schema";
import { apiUser } from "@/lib/auth/guard";
import {
  examSeed,
  seenCodesFor,
  EMPTY_STATE,
  estimateTotal,
  listensLeftFor,
  markServed,
  nextItem,
  openSessionFor,
  publicItem,
  type SessionState,
} from "@/lib/placement";
import { REGULATION_VERSION } from "@/content/quy-che-thi";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const Body = z.object({
  /** Người học đã đọc quy chế và ký cam kết trung thực. */
  pledge: z.boolean().optional(),
});

/**
 * Bắt đầu, hoặc tiếp tục, bài kiểm tra xếp lớp.
 *
 * Bài chỉ chạy sau khi người học ký cam kết trung thực. Cam kết được ghi vào hồ
 * sơ bài thi cùng thời điểm và địa chỉ IP - nếu không thì nó chỉ là một ô tick
 * trang trí.
 *
 * Đang dở thì trả về đúng câu đang dở chứ không tạo phiên mới: người học đóng
 * tab giữa chừng rồi quay lại phải thấy mình ở nguyên chỗ cũ (yêu cầu C-10).
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  const limit = hit(`xep-lop-bd:${auth.user.id}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => ({})));
  const pledge = parsed.success ? parsed.data.pledge === true : false;

  const db = await getDb();
  let session = await openSessionFor(auth.user.id);
  const ip = clientIp(request);

  if (!session) {
    if (!pledge) {
      // Không tạo phiên trước khi có cam kết: một bài thi bắt đầu từ lúc người
      // làm bài chấp nhận điều kiện, không phải từ lúc họ mở trang.
      return Response.json(
        {
          error: {
            code: "pledge_required",
            message: "Bạn cần đọc quy chế và xác nhận cam kết trước khi bắt đầu.",
          },
        },
        { status: 409 },
      );
    }

    const created = await db
      .insert(assessmentSessions)
      .values({
        userId: auth.user.id,
        kind: "placement",
        resumeState: {
          ...EMPTY_STATE,
          pledgedAt: new Date().toISOString(),
          regulation: REGULATION_VERSION,
        },
      })
      .returning();
    session = created[0]!;

    await audit({
      actorUserId: auth.user.id,
      action: "placement.start",
      entity: "assessment_sessions",
      entityId: session.id,
      after: { regulation: REGULATION_VERSION, pledge: true },
      ip,
    });
  }

  const state = session.resumeState as SessionState;
  const item = nextItem(state, {
    seed: examSeed(session),
    avoid: await seenCodesFor(auth.user.id, session.id),
  });

  if (item) {
    // Ghi thời điểm phát câu ra để đo thời gian làm bài. Chỉ ghi lần đầu, nên
    // tải lại trang không làm mất thời gian đã trôi.
    markServed(state, item.code);
    await db
      .update(assessmentSessions)
      .set({ resumeState: state })
      .where(eq(assessmentSessions.id, session.id));
  }

  return Response.json({
    sessionId: session.id,
    resumed: state.answered.length > 0,
    regulation: state.regulation ?? REGULATION_VERSION,
    item: item
      ? publicItem(
          item,
          state.answered.length + 1,
          estimateTotal(state),
          listensLeftFor(state, item.code, item.level),
        )
      : null,
    done: item === null,
  });
}
