import type { Metadata } from "next";
import { adapterStatus, config } from "@/lib/config";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Quyền riêng tư",
};

const SERVICE_LABEL: Record<string, string> = {
  llm: "Mô hình ngôn ngữ (giảng dạy, chấm bài)",
  stt: "Nhận dạng giọng nói",
  tts: "Tổng hợp giọng nói",
  avatar: "Avatar đồng bộ khẩu hình",
  mail: "Gửi email giao dịch",
  payments: "Thanh toán",
  storage: "Lưu trữ audio và tệp",
};

export default function PrivacyPage() {
  const status = adapterStatus();

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: "78ch" }}>
        <p className="eyebrow">Pháp lý</p>
        <h1>Quyền riêng tư</h1>

        <div className="alert alert--warning">
          <p>
            <strong>Bản nháp kỹ thuật, chưa có hiệu lực.</strong> Trang này mô tả trung thực dữ
            liệu hệ thống đang xử lý ở giai đoạn xây dựng. Bản chính thức cần rà soát pháp lý và
            phải liệt kê đầy đủ nhà cung cấp thật sau khi được chọn.
          </p>
        </div>

        <h2>Dữ liệu chúng tôi lưu</h2>
        <ul className="tick">
          <li>Tài khoản: email, tên, mật khẩu đã băm, thời điểm đăng nhập gần nhất.</li>
          <li>Hồ sơ học: mục tiêu, thời gian học mỗi tuần, múi giờ, tùy chọn hỗ trợ tiếp cận.</li>
          <li>Bài làm và tiến độ: câu trả lời, điểm theo rubric, lỗi lặp lại, lịch ôn.</li>
          <li>Lớp học: lượt hội thoại, transcript, và file ghi âm nếu bạn dùng micro.</li>
          <li>Vận hành: nhật ký lỗi, thời gian phản hồi, mức sử dụng dịch vụ và chi phí.</li>
        </ul>

        <h2>Ghi âm giữ bao lâu</h2>
        <p>
          File ghi âm gốc được cấu hình giữ tối đa <strong>{config.audioRetentionDays} ngày</strong>{" "}
          rồi xóa. Transcript và kết quả chấm giữ lâu hơn vì đó là tiến độ học của bạn. Mặc định là
          không giữ audio thô lâu hơn mức cần thiết.
        </p>

        <h2>Dịch vụ tham gia xử lý</h2>
        <p>
          Bảng dưới đây đọc trực tiếp từ cấu hình đang chạy. &quot;Chưa kết nối&quot; nghĩa là chức
          năng đó đang chạy ở chế độ mô phỏng nội bộ và không có dữ liệu nào rời khỏi hệ thống.
        </p>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Chức năng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(status).map(([key, mode]) => (
                <tr key={key}>
                  <td style={{ whiteSpace: "normal" }}>{SERVICE_LABEL[key] ?? key}</td>
                  <td>
                    <span className={mode === "live" ? "badge badge--success" : "mock-tag"}>
                      {mode === "live" ? "đã kết nối" : "chưa kết nối · mô phỏng"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Quyền của bạn</h2>
        <p>
          Bạn có quyền xem, xuất và yêu cầu xóa dữ liệu của mình. Các công cụ tự phục vụ cho những
          việc này đang được xây dựng; trong lúc chờ, gửi yêu cầu tới{" "}
          <a href={`mailto:${brand.email}`}>{brand.email}</a>.
        </p>

        <h2>Huấn luyện mô hình</h2>
        <p>
          Dữ liệu học của bạn không được dùng để huấn luyện mô hình. Nếu điều này thay đổi, nó phải
          có cơ sở pháp lý rõ ràng và một lựa chọn cho bạn — không phải một dòng thêm âm thầm vào
          trang này.
        </p>
      </div>
    </section>
  );
}
