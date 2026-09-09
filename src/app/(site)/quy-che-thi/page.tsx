import type { Metadata } from "next";
import {
  DISCLAIMER,
  HONESTY_PLEDGE,
  LEARNER_RIGHTS,
  LISTEN_LIMIT,
  REGULATION_VERSION,
  RESULT_VALID_DAYS,
  SCORING,
  SECTIONS,
  SECTION_MINUTES,
} from "@/content/quy-che-thi";
import { SKILL_LABEL_VI } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Quy chế bài kiểm tra xếp lớp",
  description:
    "Cấu trúc, điều kiện làm bài, cách chấm và hiệu lực của bài kiểm tra xếp lớp tiếng Đức tại Việt Đức.",
};

/**
 * Quy chế công khai.
 *
 * Trang này đọc CÙNG một tệp cấu hình mà bài thi thi hành. Số lần được nghe ghi
 * ở đây chính là con số server dùng để từ chối lượt nghe thứ ba - không có bản
 * quy chế nào riêng để trưng bày.
 */
export default function RegulationPage() {
  const totalMinutes = Object.values(SECTION_MINUTES).reduce((a, b) => a + b, 0);

  return (
    <>
      <section className="section" style={{ paddingBottom: "var(--s-7)" }}>
        <div className="wrap" style={{ maxWidth: "80ch" }}>
          <p className="eyebrow">Quy chế · phiên bản {REGULATION_VERSION}</p>
          <h1>Bài kiểm tra xếp lớp được tổ chức thế nào</h1>
          <p className="lede">
            Kết quả xếp lớp chỉ có ý nghĩa khi biết nó được tạo ra trong điều kiện nào. Trang này
            công bố toàn bộ điều kiện đó, và chính hệ thống đọc bản này để thi hành.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: "80ch" }}>
          <h2>Cấu trúc · khoảng {totalMinutes} phút</h2>
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>Phần</th>
                  <th>Nội dung</th>
                  <th>Thời lượng</th>
                </tr>
              </thead>
              <tbody>
                {SECTIONS.map((section) => (
                  <tr key={section.skill}>
                    <td>{section.title}</td>
                    <td style={{ whiteSpace: "normal" }}>{section.what}</td>
                    <td>~{SECTION_MINUTES[section.skill]} phút</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ marginTop: "var(--s-9)" }}>Điều kiện làm bài</h2>
          {SECTIONS.map((section) => (
            <div key={section.skill} style={{ marginBottom: "var(--s-5)" }}>
              <h3 style={{ fontSize: "var(--fs-md)" }}>{section.title}</h3>
              <ul className="tick">
                {section.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="alert alert--info">
            <p style={{ marginBottom: 0 }}>
              <strong>Số lần nghe được đếm ở máy chủ.</strong> Câu tiếng Đức không nằm sẵn trong
              trang; mỗi lần bấm Nghe là một lần xin máy chủ, và sau {LISTEN_LIMIT.A1} lượt thì máy
              chủ từ chối. Nghe lại không giới hạn sẽ biến phần Nghe thành phần đọc chép chậm, và
              điểm không còn nói lên khả năng nghe hiểu nữa.
            </p>
          </div>

          <h2 style={{ marginTop: "var(--s-9)" }}>Quyền của bạn khi làm bài</h2>
          <ul className="tick">
            {LEARNER_RIGHTS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <h2 style={{ marginTop: "var(--s-9)" }}>Cam kết của người làm bài</h2>
          <ul className="tick">
            {HONESTY_PLEDGE.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p>
            Cam kết được ghi vào hồ sơ bài thi cùng thời điểm ký. Bài thi không bắt đầu trước khi
            có cam kết này.
          </p>

          <h2 style={{ marginTop: "var(--s-9)" }}>Cách chấm</h2>
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>Kỹ năng</th>
                  <th>Cách chấm</th>
                  <th>Độ tin cậy</th>
                </tr>
              </thead>
              <tbody>
                {SCORING.map((row) => (
                  <tr key={row.skill}>
                    <td>{SKILL_LABEL_VI[row.skill]}</td>
                    <td style={{ whiteSpace: "normal" }}>{row.how}</td>
                    <td style={{ whiteSpace: "normal" }}>{row.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ marginTop: "var(--s-9)" }}>Hồ sơ bài thi</h2>
          <p>
            Mỗi lần làm bài được cấp một mã dạng <code>VD-XL-…</code> và lưu kèm: ngày giờ, tổng
            thời gian làm, số câu đã làm và bỏ qua, số lượt nghe đã dùng, phiên bản quy chế và thời
            điểm ký cam kết. Hồ sơ này in trên phiếu kết quả của bạn.
          </p>

          <h2 style={{ marginTop: "var(--s-9)" }}>Hiệu lực và giới hạn</h2>
          <ul className="tick">
            {DISCLAIMER.map((line) => (
              <li key={line}>{line}</li>
            ))}
            <li>
              Bạn có thể làm lại bài kiểm tra; kết quả mới thay cho kết quả cũ, và cả hai đều được
              lưu.
            </li>
            <li>
              Kết quả trong {RESULT_VALID_DAYS} ngày được dùng để xếp lớp; sau đó nên kiểm tra lại
              vì trình độ đã thay đổi.
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
