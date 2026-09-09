import { z } from "zod";
import { apiUser } from "@/lib/auth/guard";
import { dueReviewItems, gradeReviewItem } from "@/lib/lop-hoc-db";
import { hit, tooMany } from "@/lib/rate-limit";

const Body = z.object({
  id: z.number().int().positive(),
  /** Nhớ được hay không. Hai lựa chọn, không phải thang sáu mức. */
  remembered: z.boolean(),
});

/** Danh sách thẻ tới hạn ôn. */
export async function GET() {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  const items = await dueReviewItems(auth.user.id, 20);
  return Response.json({
    items: items.map((i) => ({
      id: i.id,
      type: i.itemType,
      content: i.content,
      reps: i.reps,
      lapses: i.lapses,
    })),
  });
}

/**
 * Chấm một thẻ và hẹn ngày ôn tiếp.
 *
 * Người học tự nói mình nhớ hay quên. Không có cách nào khác trung thực hơn cho
 * loại thẻ này: một lỗi ngữ pháp được sửa trong lớp không có đáp án gõ vào ô để
 * máy chấm, và bắt gõ lại nguyên câu đúng chỉ đo được khả năng chép.
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  const limit = hit(`on-tap:${auth.user.id}`, 400, 60 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", message: "Thiếu thông tin thẻ." } },
      { status: 400 },
    );
  }

  const result = await gradeReviewItem(auth.user.id, parsed.data.id, parsed.data.remembered);
  if (!result) {
    return Response.json(
      { error: { code: "not_found", message: "Không tìm thấy thẻ này." } },
      { status: 404 },
    );
  }
  return Response.json({ ok: true, nextDays: result.nextDays });
}
