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
            <p>
              Cổng thanh toán đang ở chế độ <strong>{payments === "live" ? "thật" : "chưa kết nối"}</strong>.
              {payments === "live"
                ? " Giao dịch được xử lý qua nhà cung cấp đã cấu hình."
                : " Chưa có giao dịch nào được thực hiện và không nút nào trên trang này thu tiền được."}
            </p>
          </div>

          <h3>Những gì phải xong trước khi mở bán</h3>
          <ul className="tick" style={{ maxWidth: "72ch" }}>
            <li>Thông tin pháp nhân, tài khoản nhận tiền và thông tin thuế của doanh nghiệp.</li>
            <li>Điều khoản sử dụng, chính sách hủy và hoàn tiền được người chịu trách nhiệm duyệt.</li>
            <li>Kết nối PayPal và một nhà cung cấp thẻ, kiểm thử ở môi trường sandbox trước.</li>
            <li>Nội dung và bộ đánh giá của cấp độ được bán đã qua duyệt.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
