import type { Metadata } from "next";
import { PlanCards } from "@/components/PlanCards";
import { listPublicPlans } from "@/lib/queries";
import { adapterMode } from "@/lib/config";

export const metadata: Metadata = {
  title: "Học phí",
  description: "Các gói học Lingora, chu kỳ thanh toán và điều kiện.",
};

export default async function PricingPage() {
  const plans = await listPublicPlans();
  const payments = adapterMode("payments");

  return (
    <>
      <section className="section" style={{ paddingBottom: "var(--s-7)" }}>
        <div className="wrap">
          <p className="eyebrow">Học phí</p>
          <h1>Gói học</h1>
          <p className="lede">
            Giá tính bằng euro. Mỗi gói ghi rõ chu kỳ thanh toán, những gì được dùng và hạn mức của
            phần AI và giọng nói.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <PlanCards plans={plans} />
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-sunken)" }}>
        <div className="wrap">
          <h2>Trạng thái thanh toán</h2>
          <div className="alert alert--info" style={{ maxWidth: "76ch" }}>
            <p style={{ marginBottom: 0 }}>
              {payments === "live" ? (
                <>
                  <strong>Thanh toán đang mở.</strong> Giao dịch được xử lý qua nhà cung cấp đã cấu
                  hình.
                </>
              ) : (
                <>
                  <strong>Chưa mở thanh toán.</strong> Bạn chưa mua được gói nào, và chúng tôi chưa
                  thu tiền của ai.
                </>
              )}
            </p>
          </div>

          <p style={{ maxWidth: "72ch", color: "var(--muted)" }}>
            Khi mở bán, giá, chu kỳ, điều kiện gia hạn và chính sách hoàn tiền sẽ được ghi đầy đủ
            tại trang này và trong <a href="/dieu-khoan">Điều khoản sử dụng</a> trước khi có hiệu
            lực.
          </p>
        </div>
      </section>
    </>
  );
}
