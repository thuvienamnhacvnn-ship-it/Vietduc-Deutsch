import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guard";
import { activeEntitlement, activePlans, bankDetails, ordersOf } from "@/lib/thanh-toan";
import { BuyPanel } from "@/components/BuyPanel";

export const metadata: Metadata = { title: "Gói học" };

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(cents / 100);
}

const STATUS_VI: Record<string, string> = {
  pending: "chờ chuyển khoản",
  paid: "đã thanh toán",
  cancelled: "đã huỷ",
  refunded: "đã hoàn tiền",
};

/**
 * Gói học của học viên: đang có quyền gì, các gói hiện có, và đơn đã đặt.
 *
 * Trang này KHÔNG nhận tiền. Nó tạo đơn và đưa ra mã chuyển khoản; tiền vào tài
 * khoản của trường rồi mới có người đối chiếu và cấp quyền. Đó là lựa chọn có
 * chủ đích, xem `src/lib/thanh-toan.ts`.
 */
export default async function PlansPage() {
  const user = await requireUser("/hoc/goi-hoc");
  const [plans, orders, entitlement] = await Promise.all([
    activePlans(),
    ordersOf(user.id),
    activeEntitlement(user.id),
  ]);
  const bank = bankDetails();
  const sellable = plans.filter((p) => p.approvedForSale);

  return (
    <>
      <div className="page-head">
        <h1>Gói học</h1>
        <p>Quyền học của bạn, các gói hiện có và những đơn bạn đã đặt.</p>
      </div>

      <section className="card" style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontSize: "var(--fs-lg)" }}>Quyền học hiện tại</h2>
        {entitlement ? (
          <p>
            Bạn đang có quyền học <strong>{entitlement.scope}</strong>
            {entitlement.activeUntil
              ? ` tới ngày ${new Date(entitlement.activeUntil).toLocaleDateString("vi-VN")}`
              : ""}
            .
          </p>
        ) : sellable.length === 0 ? (
          <p>
            Chưa mở bán. Trong giai đoạn này lớp học mở cho mọi tài khoản đã đăng ký, và chưa thu
            tiền của ai.
          </p>
        ) : (
          <p>Bạn chưa có gói học nào còn hiệu lực.</p>
        )}
      </section>

      <h2 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--s-4)" }}>Các gói</h2>
      <div className="lesson-grid" style={{ marginBottom: "var(--s-8)" }}>
        {plans.map((plan) => (
          <div key={plan.versionId} className="lesson-card lesson-card--tinh">
            <div className="lesson-card__top">
              <span className="badge badge--gold">{money(plan.priceCents, plan.currency)}</span>
              <span className="badge">{plan.billingPeriod}</span>
              {!plan.approvedForSale && <span className="badge badge--warning">giá tham khảo</span>}
            </div>
            <h3 style={{ fontSize: "var(--fs-lg)", margin: 0 }}>{plan.name}</h3>
            <ul className="tick" style={{ margin: "var(--s-3) 0 0" }}>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            {plan.approvedForSale ? (
              <BuyPanel versionId={plan.versionId} planName={plan.name} />
            ) : (
              <p className="note-quiet" style={{ marginTop: "var(--s-4)" }}>
                Giá này chưa được chủ trường duyệt nên chưa đặt mua được. Con số ở trên là giá tham
                khảo dùng để dựng giao diện.
              </p>
            )}
          </div>
        ))}
      </div>

      {bank && sellable.length > 0 && (
        <section className="card" style={{ marginBottom: "var(--s-7)" }}>
          <h2 style={{ fontSize: "var(--fs-lg)" }}>Chuyển khoản tới</h2>
          <dl className="exam-record__grid">
            <div>
              <dt>Chủ tài khoản</dt>
              <dd>{bank.holder}</dd>
            </div>
            <div>
              <dt>Ngân hàng</dt>
              <dd>{bank.bank}</dd>
            </div>
            <div>
              <dt>Số tài khoản</dt>
              <dd>{bank.iban}</dd>
            </div>
          </dl>
          <p className="note-quiet">{bank.note}</p>
        </section>
      )}

      {orders.length > 0 && (
        <section className="card">
          <h2 style={{ fontSize: "var(--fs-lg)" }}>Đơn của bạn</h2>
          <div className="table-scroll">
            <table className="data data--stack">
              <thead>
                <tr>
                  <th>Mã chuyển khoản</th>
                  <th>Gói</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td data-label="Mã chuyển khoản">
                      <strong>{o.code}</strong>
                    </td>
                    <td data-label="Gói">{o.planName}</td>
                    <td data-label="Số tiền">{money(o.amountCents, o.currency)}</td>
                    <td data-label="Trạng thái">{STATUS_VI[o.status] ?? o.status}</td>
                    <td data-label="Ngày đặt">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
