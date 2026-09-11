import type { Metadata } from "next";
import Link from "next/link";
import { TEACHING_CYCLE } from "@/content/curriculum";
import { adapterStatus } from "@/lib/config";
import { AI_DISCLOSURE } from "@/content/agents";

export const metadata: Metadata = {
  title: "Lớp học hoạt động thế nào",
  description:
    "Một buổi học Việt Đức Lingua: Anna dẫn bài, bảng giảng chạy theo nội dung, bạn nói bằng micro hoặc gõ chữ.",
};

const IN_CLASS = [
  {
    title: "Bạn nói hoặc gõ",
    body: "Micro là mặc định, nhưng gõ chữ luôn có sẵn. Hôm nay ồn, hoặc bạn đang ở nơi công cộng — vẫn học được đủ bài.",
  },
  {
    title: "Nghe lại, chậm lại",
    body: "Nghe lại từng câu, bật tắt phụ đề, giảm tốc độ đọc, hoặc xin giáo viên nhắc lại.",
  },
  {
    title: "Giải thích bằng tiếng Việt",
    body: "Bất cứ lúc nào bạn cũng đổi được lời giải thích sang tiếng Việt mà không mất mạch bài.",
  },
  {
    title: "Ngắt lời được",
    body: "Bạn cắt ngang khi giáo viên đang nói thì âm thanh dừng ngay, lượt cũ bị hủy và không phát chồng lên lượt mới.",
  },
  {
    title: "Sửa lại transcript",
    body: "Máy nghe nhầm từ thì bạn sửa. Lỗi của máy không bị tính thành lỗi kiến thức của bạn.",
  },
  {
    title: "Tổng kết cuối buổi",
    body: "Đã học gì, lỗi chính là gì, câu sửa mẫu, bài cần ôn và bước tiếp theo.",
  },
];

export default function AiClassPage() {
  const status = adapterStatus();
  const voiceReady = status.stt === "live" && status.tts === "live";

  return (
    <>
      <section className="section" style={{ paddingBottom: "var(--s-8)" }}>
        <div className="wrap">
          <p className="eyebrow">Lớp học</p>
          <h1>Lớp học, không phải một ô chat</h1>
          <p className="lede">
            Anna dẫn bài, bảng giảng chạy đồng bộ với nội dung đang dạy, bạn nói bằng micro, và
            phần sửa lỗi tập trung vào một hai điểm mỗi lần thay vì bắt bẻ liên tục.
          </p>

          {!voiceReady && (
            <div className="alert alert--info" style={{ maxWidth: "72ch" }}>
              <p style={{ marginBottom: 0 }}>
                <strong>Lớp học bằng giọng nói chưa mở.</strong> Trang này mô tả cách buổi học được
                thiết kế. Phần nói và nghe đang được hoàn thiện, nên hiện chưa có buổi học nào diễn
                ra bằng giọng nói. Chúng tôi nói trước ở đây, thay vì để bạn phát hiện lúc đã đăng
                ký xong.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-sunken)", paddingTop: "var(--s-9)" }}>
        <div className="wrap">
          <h2>Tám bước của một buổi học</h2>
          <p className="note-quiet">
            {AI_DISCLOSURE} Dòng nhắc này cũng xuất hiện ngay khi bạn bước vào lớp.
          </p>
          <ol className="cycle">
            {TEACHING_CYCLE.map((s, i) => (
              <li key={s.step} className="cycle__item">
                <span className="cycle__n" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{s.step}</h3>
                <p>{s.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Trong lớp bạn điều khiển được những gì</h2>
          <div className="grid grid-3" style={{ marginTop: "var(--s-7)" }}>
            {IN_CLASS.map((f) => (
              <div key={f.title} className="card card--flat">
                <h3 style={{ fontSize: "var(--fs-md)" }}>{f.title}</h3>
                <p style={{ marginBottom: 0, color: "var(--muted)", fontSize: "var(--fs-sm)" }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section band">
        <div className="wrap">
          <p className="eyebrow">Kỹ thuật</p>
          <h2>Đường đi của một lượt nói</h2>
          <p className="lede">
            Micro ghi âm, hệ thống phát hiện khi bạn nói xong, chuyển giọng thành chữ, đưa vào mô
            hình cùng ngữ cảnh bài học, nhận câu trả lời theo dòng, đọc thành tiếng, rồi hiện phụ
            đề và đổi trạng thái chân dung giáo viên.
          </p>
          <p className="lede">
            Mỗi khâu là một dịch vụ riêng. Chúng tôi không nói mô hình ngôn ngữ tự lo hết — nó chỉ
            lo phần suy luận và giảng dạy.
          </p>
          <p className="lede">
            Mục tiêu kỹ thuật đặt ra cho âm thanh phản hồi đầu tiên là 2,5 giây ở mức trung vị và 5
            giây ở mức 95%, đo trong một môi trường xác định. Đây là mục tiêu cần đo, chưa phải con
            số đã đạt.
          </p>
          <p style={{ marginTop: "var(--s-7)" }}>
            <Link href="/giao-vien-ai" className="btn btn--secondary">
              Xem đội ngũ giảng dạy
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
