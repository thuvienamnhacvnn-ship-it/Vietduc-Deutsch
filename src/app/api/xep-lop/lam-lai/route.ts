import { z } from "zod";
import { apiUser, apiStaff } from "@/lib/auth/guard";
import { resetPlacementHistory } from "@/lib/lam-lai-xep-lop";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const Body = z.object({
  /**
   * Xoá cho học viên khác. Chỉ quản trị được truyền, và cố ý bắt truyền thẳng
   * id: không có mặc định "người đang đăng nhập" ở đường quản trị, để không ai
   * xoá nhầm dữ liệu của chính mình khi tưởng đang thao tác cho người khác.
   */
  userId: z.number().int().positive().optional(),
});

/**
 * Xoá lịch sử bài kiểm tra xếp lớp để làm lại từ đầu.
 *
 * Hai đường vào cùng một việc:
 *
 *  - Học viên tự bấm ở trang kết quả của mình.
 *  - Quản trị bấm cho một học viên khi họ yêu cầu (ví dụ đề bị lặp vì đã thi
 *    quá nhiều lần, hoặc lần thi trước hỏng giữa chừng).
 *
 * Xoá bao nhiêu thứ, của ai, do ai bấm - tất cả vào nhật ký. Một thao tác xoá
 * không để lại dấu vết thì sau này không ai trả lời được câu "kết quả của học
 * viên này đi đâu mất".
 */
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", message: "Dữ liệu không hợp lệ." } },
      { status: 400 },
    );
  }

  const ip = clientIp(request);
  const forUserId = parsed.data.userId;

  /* ---- quản trị xoá cho người khác ---- */
  if (forUserId) {
    const staff = await apiStaff();
    if (!staff.ok) return staff.response;
    if (staff.user.role !== "admin" && staff.user.role !== "support") {
      return Response.json(
        { error: { code: "forbidden", message: "Chỉ quản trị và hỗ trợ mới làm được việc này." } },
        { status: 403 },
      );
    }

    const summary = await resetPlacementHistory(forUserId);
    await audit({
      actorUserId: staff.user.id,
      action: "placement.reset_by_staff",
      entity: "users",
      entityId: forUserId,
      after: summary,
      ip,
    });
    return Response.json({ ok: true, ...summary });
  }

  /* ---- học viên tự xoá của mình ---- */
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  // Trần thấp có chủ đích: làm lại bài kiểm tra là việc của vài tuần một lần,
  // không phải việc bấm liên tục. Nó cũng chặn kiểu dùng vòng lặp xoá đi làm
  // lại để dò đáp án của cả ngân hàng câu hỏi.
  const limit = hit(`lam-lai:${auth.user.id}`, 5, 24 * 60 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const summary = await resetPlacementHistory(auth.user.id);
  await audit({
    actorUserId: auth.user.id,
    action: "placement.reset_self",
    entity: "users",
    entityId: auth.user.id,
    after: summary,
    ip,
  });

  return Response.json({ ok: true, ...summary });
}
