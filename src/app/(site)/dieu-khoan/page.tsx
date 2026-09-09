import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
};

/**
 * Trang pháp lý. Nội dung ở đây là BẢN NHÁP KỸ THUẬT mô tả đúng cách hệ thống
 * đang hoạt động, không phải văn bản pháp lý đã được rà soát.
 *
 * Bản giao việc yêu cầu nội dung pháp lý phải có người chịu trách nhiệm duyệt
 * trước khi mở bán, nên trang tự nói rõ trạng thái đó thay vì giả vờ đã xong.
 */
export default function TermsPage() {
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: "78ch" }}>
        <p className="eyebrow">Pháp lý</p>
        <h1>Điều khoản sử dụng</h1>

        <div className="alert alert--warning">
          <p>
            <strong>Bản nháp kỹ thuật, chưa có hiệu lực.</strong> Nội dung dưới đây mô tả đúng cách
            hệ thống đang vận hành để phục vụ việc xây dựng. Nó chưa được rà soát pháp lý và chưa
            được chủ dự án duyệt. Không được dùng làm cơ sở giao kết cho tới khi có bản chính thức.
          </p>
        </div>

        <h2>1. Dịch vụ là gì</h2>
        <p>
          {brand.name} là nền tảng học tiếng Đức từ A1 đến B2. Việc giảng dạy, tư vấn và chấm bài do
          các hệ thống trí tuệ nhân tạo thực hiện. Không có giáo viên là người thật trong các buổi
          học, và giao diện luôn nói rõ điều này.
        </p>

        <h2>2. Kết quả học tập</h2>
        <p>
          Kết quả đánh giá được trình bày trong phạm vi bằng chứng thu được. Kỹ năng nào thiếu dữ
          liệu sẽ được ghi là chưa đánh giá được. Hoàn thành một cấp độ trong hệ thống{" "}
          <strong>không</strong> đồng nghĩa với chứng chỉ CEFR được công nhận; chứng chỉ đó do các
          tổ chức khảo thí độc lập cấp.
        </p>

        <h2>3. Tài khoản</h2>
        <p>
          Bạn chịu trách nhiệm giữ an toàn thông tin đăng nhập. Mỗi tài khoản dành cho một người
          học. Dữ liệu học tập của bạn chỉ tài khoản của bạn truy cập được.
        </p>

        <h2>4. Thanh toán</h2>
        <p>
          Hiện chưa có chức năng thu tiền nào được kích hoạt. Khi mở bán, giá, chu kỳ, điều kiện gia
          hạn và hoàn tiền sẽ được ghi tại trang Học phí và tại trang này trước khi có hiệu lực.
        </p>

        <h2>5. Sử dụng hợp lệ</h2>
        <p>
          Không tự động hóa việc truy cập nhằm rút trích nội dung, không chia sẻ tài khoản, không
          dùng hệ thống cho mục đích trái pháp luật.
        </p>

        <h2>6. Thông tin pháp nhân</h2>
        <p>
          {brand.legalEntity.company} · {brand.legalEntity.address}
          {brand.legalEntity.register ? ` · ${brand.legalEntity.register}` : ""}
          {brand.legalEntity.vatId ? ` · ${brand.legalEntity.vatId}` : ""}
          {brand.legalEntity.responsible
            ? ` · Chịu trách nhiệm nội dung: ${brand.legalEntity.responsible}`
            : ""}
        </p>
        {/* Ghi rõ còn thiếu gì thay vì bỏ trống: bên Đức những mục này bắt buộc
            phải có trước khi trang được công khai. */}
        {(!brand.legalEntity.register ||
          !brand.legalEntity.vatId ||
          !brand.legalEntity.responsible) && (
          <p>
            Chưa có{" "}
            {[
              !brand.legalEntity.register && "mã số doanh nghiệp",
              !brand.legalEntity.vatId && "mã số thuế",
              !brand.legalEntity.responsible && "người chịu trách nhiệm nội dung",
            ]
              .filter(Boolean)
              .join(", ")}
            . Những mục này bắt buộc phải có trước khi trang được công khai tại Đức.
          </p>
        )}

        <h2>7. Liên hệ</h2>
        <p>
          <a href={`mailto:${brand.email}`}>{brand.email}</a>
        </p>
      </div>
    </section>
  );
}
