import type { PublicPlan } from "@/lib/queries";

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(cents / 100);
}

const PERIOD_VI: Record<string, string> = {
  monthly: "mỗi tháng",
  quarterly: "mỗi quý",
  yearly: "mỗi năm",
  one_time: "trả một lần",
};

/**
 * Bảng giá. Ba trạng thái, và cả ba đều phải đúng sự thật:
 *
 *  - chưa có gói nào trong database  -> trạng thái rỗng, nói rõ đang xây dựng
 *  - có gói nhưng chưa được duyệt bán -> hiện giá THAM KHẢO, nút mua bị vô hiệu
 *  - đã duyệt bán                     -> nút mua hoạt động (giai đoạn 5)
 *
 * Không bao giờ hiển thị một nút mua bấm được khi backend chưa thu tiền được.
 */
export function PlanCards({ plans }: { plans: PublicPlan[] }) {
  if (plans.length === 0) {
    return (
      <div className="empty" style={{ marginTop: "var(--s-6)" }}>
        <h3>Bảng giá chưa được công bố</h3>
        <p>
          Các gói học đang được cấu hình trong cổng quản trị. Khi chủ dự án xác nhận giá, chu kỳ và
          điều kiện hủy, bảng giá sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  const anyDraft = plans.some((p) => !p.approvedForSale);

  return (
    <>
      {anyDraft && (
        <div className="alert alert--warning" style={{ marginTop: "var(--s-6)" }}>
          <p style={{ marginBottom: 0 }}>
            <strong>Giá tham khảo.</strong> Những con số dưới đây chưa phải giá chính thức và có
            thể thay đổi. Chưa mở đăng ký.
          </p>
        </div>
      )}

      <div className="grid grid-3" style={{ marginTop: "var(--s-7)" }}>
        {plans.map((plan) => (
          <article key={plan.id} className="card plan-card">
            <h3>{plan.name}</h3>
            <p className="plan-card__price">
              <strong>{money(plan.priceCents, plan.currency)}</strong>
              <span> {PERIOD_VI[plan.billingPeriod] ?? plan.billingPeriod}</span>
            </p>
            {plan.trialDays > 0 && (
              <p className="badge badge--info">Dùng thử {plan.trialDays} ngày</p>
            )}
            <ul className="tick">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={!plan.approvedForSale}
              aria-describedby={!plan.approvedForSale ? `plan-note-${plan.id}` : undefined}
            >
              {plan.approvedForSale ? "Chọn gói này" : "Chưa mở thanh toán"}
            </button>
            {!plan.approvedForSale && (
              <p id={`plan-note-${plan.id}`} className="plan-card__note">
                Chưa mở đăng ký gói này.
              </p>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
