import { z } from "zod";
import { apiStaff } from "@/lib/auth/guard";
import { confirmBankPayment } from "@/lib/thanh-toan";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const Body = z.object({
  orderId: z.number().int().positive(),
  /** Ghi chú đối chiếu: sao kê ngày nào, giao dịch nào. Bắt buộc. */
  note: z.string().min(3).max(200),
  months: z.number().int().min(1).max(24),
});

/**
 * Xác nhận đã nhận tiền của một đơn và cấp quyền học.
 *
 * CHỈ QUẢN TRỊ. Đây là hành động động tới tiền, và nó luôn để lại dấu vết: một
 * bản ghi thanh toán, một quyền học có nguồn gốc, và một dòng nhật ký có tên
 * người bấm.
 */
export async function POST(request: Request) {
  const auth = await apiStaff();
  if (!auth.ok) return auth.response;

  if (auth.user.role !== "admin") {
    return Response.json(
      { error: { code: "forbidden", message: "Chỉ quản trị mới xác nhận thanh toán." } },
      { status: 403 },
    );
  }

  const limit = hit(`xac-nhan-tien:${auth.user.id}`, 100, 60 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      {
        error: {
          code: "invalid_input",
          message: "Cần mã đơn, ghi chú đối chiếu và số tháng hiệu lực.",
        },
      },
      { status: 400 },
    );
  }

  const result = await confirmBankPayment({
    orderId: parsed.data.orderId,
    byUserId: auth.user.id,
    note: parsed.data.note,
    months: parsed.data.months,
  });

  if (!result.ok) {
    const message =
      result.reason === "already_paid"
        ? "Đơn này đã được xác nhận rồi."
        : "Không tìm thấy đơn hàng.";
    return Response.json(
      { error: { code: result.reason ?? "error", message } },
      { status: result.reason === "already_paid" ? 409 : 404 },
    );
  }

  await audit({
    actorUserId: auth.user.id,
    action: "payment.confirmed",
    entity: "orders",
    entityId: parsed.data.orderId,
    after: { note: parsed.data.note, months: parsed.data.months },
    ip: clientIp(request),
  });

  return Response.json({ ok: true });
}
