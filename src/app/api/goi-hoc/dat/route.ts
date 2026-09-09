import { z } from "zod";
import { apiUser } from "@/lib/auth/guard";
import { createOrder } from "@/lib/thanh-toan";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const Body = z.object({ versionId: z.number().int().positive() });

/**
 * Đặt một gói học.
 *
 * Route này KHÔNG nhận tiền và không gọi cổng thanh toán nào. Nó tạo một đơn ở
 * trạng thái chờ và trả về mã chuyển khoản. Tiền vào tài khoản của trường rồi
 * mới có người đối chiếu và cấp quyền học.
 *
 * Giá chưa được chủ trường duyệt thì server TỪ CHỐI, kể cả khi giao diện lỡ
 * hiện nút mua: giá tham khảo dùng để dựng màn hình không được biến thành một
 * khoản phải trả.
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  const limit = hit(`dat-goi:${auth.user.id}`, 20, 60 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", message: "Thiếu mã gói." } },
      { status: 400 },
    );
  }

  const result = await createOrder(auth.user.id, parsed.data.versionId);

  if (!result.ok) {
    if (result.reason === "not_for_sale") {
      return Response.json(
        {
          error: {
            code: "not_for_sale",
            message:
              "Gói này chưa được mở bán. Giá đang hiển thị là giá tham khảo, chưa phải giá chính thức.",
          },
        },
        { status: 409 },
      );
    }
    return Response.json(
      { error: { code: "not_found", message: "Không tìm thấy gói học." } },
      { status: 404 },
    );
  }

  await audit({
    actorUserId: auth.user.id,
    action: "order.created",
    entity: "orders",
    entityId: result.orderId,
    after: { code: result.code, amountCents: result.plan.priceCents },
    ip: clientIp(request),
  });

  return Response.json({ ok: true, orderId: result.orderId, code: result.code });
}
