import "server-only";

import { and, desc, eq, isNull, or, gt } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { entitlements, orders, payments, planVersions, plans } from "@/lib/db/schema";
import { brand } from "@/lib/brand";

/**
 * Đặt mua, xác nhận thanh toán và quyền học.
 *
 * QUYẾT ĐỊNH LỚN NHẤT Ở TỆP NÀY: hình thức thanh toán mặc định là CHUYỂN KHOẢN
 * ngân hàng, không phải cổng thẻ.
 *
 * Lý do rất thực tế. Cổng thẻ và PayPal không thể tự dựng: chúng cần tài khoản
 * thương gia đứng tên pháp nhân, hợp đồng, và thẩm định. Trong khi đó chuyển
 * khoản thì trường đã có sẵn tài khoản ngân hàng, học viên Việt Nam và Đức đều
 * quen, và không mất phần trăm cho ai. Đổi lại, có một bước người thật đối
 * chiếu sao kê - và bước đó được làm cho tử tế ở cổng quản trị thay vì giấu đi.
 *
 * Ba ràng buộc không được nới:
 *
 * 1. **Quyền học chỉ đến từ `entitlements`.** Không nơi nào trong ứng dụng được
 *    tự suy ra quyền từ việc "đã có đơn hàng" - đơn hàng chưa trả tiền cũng là
 *    đơn hàng.
 * 2. **Không tự cấp quyền cho chính mình.** Xác nhận đã nhận tiền là hành động
 *    của quản trị và luôn ghi lại ai xác nhận.
 * 3. **Giá chưa duyệt thì không bán.** `approvedForSale = false` là giá tham
 *    khảo để dựng giao diện; đặt mua trên giá đó bị từ chối ở server.
 */

export type PlanRow = {
  planId: number;
  versionId: number;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  billingPeriod: string;
  features: string[];
  scope: string;
  approvedForSale: boolean;
};

export async function activePlans(): Promise<PlanRow[]> {
  const db = await getDb();
  const rows = await db
    .select({
      planId: plans.id,
      versionId: planVersions.id,
      slug: plans.slug,
      name: plans.name,
      priceCents: planVersions.priceCents,
      currency: planVersions.currency,
      billingPeriod: planVersions.billingPeriod,
      features: planVersions.features,
      scope: planVersions.scope,
      approvedForSale: planVersions.approvedForSale,
      version: planVersions.version,
    })
    .from(planVersions)
    .innerJoin(plans, eq(plans.id, planVersions.planId))
    .orderBy(desc(planVersions.version));

  // Mỗi gói chỉ lấy phiên bản mới nhất.
  const seen = new Set<number>();
  return rows
    .filter((r) => {
      if (seen.has(r.planId)) return false;
      seen.add(r.planId);
      return true;
    })
    .map((r) => ({
      planId: r.planId,
      versionId: r.versionId,
      slug: r.slug,
      name: r.name,
      priceCents: r.priceCents,
      currency: r.currency,
      billingPeriod: r.billingPeriod,
      features: r.features,
      scope: r.scope,
      approvedForSale: r.approvedForSale,
    }));
}

export async function planVersionById(versionId: number): Promise<PlanRow | null> {
  const all = await activePlans();
  return all.find((p) => p.versionId === versionId) ?? null;
}

/**
 * Mã chuyển khoản của một đơn.
 *
 * Đây là thứ nối tờ sao kê ngân hàng với một đơn hàng trong hệ thống. Ngắn, chỉ
 * dùng chữ và số dễ đọc qua điện thoại, và có tiền tố để nhân viên kế toán nhìn
 * là biết ngay đây là học phí chứ không phải khoản khác.
 */
export function transferCode(orderId: number): string {
  return `VD${String(orderId).padStart(6, "0")}`;
}

/** Thông tin để học viên chuyển khoản. Chưa cấu hình thì trả null, KHÔNG bịa. */
export function bankDetails(): { holder: string; bank: string; iban: string; note: string } | null {
  const iban = process.env.LINGORA_BANK_IBAN?.trim();
  const bank = process.env.LINGORA_BANK_NAME?.trim();
  const holder = process.env.LINGORA_BANK_HOLDER?.trim() || brand.legalEntity.company;
  if (!iban || !bank) return null;
  return {
    holder,
    bank,
    iban,
    note: "Ghi đúng mã chuyển khoản ở phần nội dung, nếu không việc đối chiếu sẽ chậm.",
  };
}

export async function createOrder(userId: number, versionId: number) {
  const plan = await planVersionById(versionId);
  if (!plan) return { ok: false as const, reason: "not_found" as const };
  if (!plan.approvedForSale) return { ok: false as const, reason: "not_for_sale" as const };

  const db = await getDb();
  const created = await db
    .insert(orders)
    .values({
      userId,
      planVersionId: versionId,
      amountCents: plan.priceCents,
      currency: plan.currency,
      status: "pending",
      provider: "bank_transfer",
    })
    .returning({ id: orders.id });

  const orderId = created[0]!.id;
  await db
    .update(orders)
    .set({ providerOrderId: transferCode(orderId) })
    .where(eq(orders.id, orderId));

  return { ok: true as const, orderId, code: transferCode(orderId), plan };
}

export async function ordersOf(userId: number) {
  const db = await getDb();
  return db
    .select({
      id: orders.id,
      status: orders.status,
      amountCents: orders.amountCents,
      currency: orders.currency,
      code: orders.providerOrderId,
      createdAt: orders.createdAt,
      planName: plans.name,
    })
    .from(orders)
    .innerJoin(planVersions, eq(planVersions.id, orders.planVersionId))
    .innerJoin(plans, eq(plans.id, planVersions.planId))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.id));
}

export async function pendingOrders() {
  const db = await getDb();
  return db
    .select({
      id: orders.id,
      userId: orders.userId,
      status: orders.status,
      amountCents: orders.amountCents,
      currency: orders.currency,
      code: orders.providerOrderId,
      createdAt: orders.createdAt,
      planName: plans.name,
      scope: planVersions.scope,
    })
    .from(orders)
    .innerJoin(planVersions, eq(planVersions.id, orders.planVersionId))
    .innerJoin(plans, eq(plans.id, planVersions.planId))
    .orderBy(desc(orders.id));
}

/**
 * Xác nhận đã nhận tiền và cấp quyền học.
 *
 * Một giao dịch: ghi khoản thu, đóng đơn, cấp quyền. Cấp quyền mà không ghi
 * khoản thu thì sổ sách không khớp; ghi khoản thu mà không cấp quyền thì học
 * viên đã trả tiền vẫn không vào học được.
 */
export async function confirmBankPayment(args: {
  orderId: number;
  byUserId: number;
  note: string;
  months: number;
}): Promise<{ ok: boolean; reason?: string }> {
  const db = await getDb();
  const rows = await db.select().from(orders).where(eq(orders.id, args.orderId)).limit(1);
  const order = rows[0];
  if (!order) return { ok: false, reason: "not_found" };
  if (order.status === "paid") return { ok: false, reason: "already_paid" };

  const plan = await planVersionById(order.planVersionId);

  const payment = await db
    .insert(payments)
    .values({
      orderId: order.id,
      userId: order.userId,
      provider: "bank_transfer",
      providerPaymentId: order.providerOrderId,
      amountCents: order.amountCents,
      currency: order.currency,
      status: "succeeded",
      raw: { confirmedBy: args.byUserId, note: args.note },
    })
    .returning({ id: payments.id });

  await db.update(orders).set({ status: "paid" }).where(eq(orders.id, order.id));

  const until = new Date();
  until.setMonth(until.getMonth() + Math.max(1, args.months));

  await db.insert(entitlements).values({
    userId: order.userId,
    scope: plan?.scope ?? "all_levels",
    sourcePaymentId: payment[0]!.id,
    sourceNote: `chuyển khoản ${order.providerOrderId} · xác nhận bởi #${args.byUserId}`,
    activeUntil: until,
  });

  return { ok: true };
}

/** Quyền học còn hiệu lực. Đây là câu trả lời DUY NHẤT cho "được học hay chưa". */
export async function activeEntitlement(userId: number) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.userId, userId),
        isNull(entitlements.revokedAt),
        or(isNull(entitlements.activeUntil), gt(entitlements.activeUntil, new Date())),
      ),
    )
    .orderBy(desc(entitlements.id))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Cổng học có đang đóng không.
 *
 * Khi CHƯA có gói nào được duyệt bán, cổng mở cho mọi người đã đăng nhập: chưa
 * bán thì không thể đòi tiền, mà khoá cửa lúc đó chỉ tạo ra một sản phẩm không
 * ai vào được. Có gói được duyệt rồi thì quyền học mới thật sự là điều kiện.
 */
export async function classroomOpenFor(userId: number): Promise<{ open: boolean; why: string }> {
  const sellable = (await activePlans()).some((p) => p.approvedForSale);
  if (!sellable) {
    return { open: true, why: "Chưa mở bán, lớp học đang mở cho mọi tài khoản." };
  }
  const ent = await activeEntitlement(userId);
  if (ent) return { open: true, why: "Bạn đang có quyền học còn hiệu lực." };
  return { open: false, why: "Cần một gói học còn hiệu lực để vào lớp." };
}
