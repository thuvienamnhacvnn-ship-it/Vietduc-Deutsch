import type { Metadata } from "next";
import Link from "next/link";
import { CURRICULUM } from "@/content/curriculum";

export const metadata: Metadata = {
  title: "Chương trình A1–B2",
  description:
    "Khung mục tiêu giao tiếp từ A1 đến B2, viết theo những việc bạn làm được trong đời sống ở Đức.",
};

export default function ProgramPage() {
  return (
    <>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <p className="eyebrow">Chương trình</p>
          <h1>Bốn cấp độ, mỗi cấp một đích đến bạn kiểm chứng được</h1>
          <p className="lede">
            Khung dưới đây tham chiếu mô tả CEFR và được viết lại thành những việc cụ thể. Số giờ
            học là khoảng thường thấy để bạn tự ước lượng — không phải cam kết thời gian.
          </p>
        </div>
      </section>

      {CURRICULUM.map((lvl, i) => (
        <section
          key={lvl.level}
          className="section"
          style={{ background: i % 2 === 1 ? "var(--paper-sunken)" : undefined }}
        >
          <div className="wrap level-detail">
            <div className="level-detail__head">
              <span className="badge badge--gold" style={{ fontSize: "var(--fs-lg)" }}>
                {lvl.level}
              </span>
              <h2>{lvl.headline}</h2>
              <p className="lede">{lvl.summary}</p>
              <p className="badge">{lvl.typicalHours}</p>
            </div>

            <div className="grid grid-3" style={{ marginTop: "var(--s-8)" }}>
              <div className="card card--flat">
                <h3>Chủ đề</h3>
                <ul className="tick">
                  {lvl.topics.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="card card--flat">
                <h3>Ngữ pháp và cấu trúc</h3>
                <ul className="tick">
                  {lvl.structures.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="card card--flat">
                <h3>Kết thúc cấp này bạn làm được</h3>
                <ul className="tick">
                  {lvl.canDo.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section band">
        <div className="wrap">
          <h2>Nội dung bài học đang được xây dựng</h2>
          <p className="lede">
            Khung mục tiêu ở trên đã đủ bốn cấp. Bài học chi tiết — hội thoại, audio, bài tập — được
            biên soạn và duyệt theo từng cấp; độ phủ thật ghi trong tệp CONTENT_COVERAGE.md của dự
            án. Một cấp độ chỉ được mở bán khi nội dung và bộ đánh giá của chính cấp đó đã đạt điều
            kiện công bố.
          </p>
          <p style={{ marginTop: "var(--s-6)" }}>
            <Link href="/dang-ky" className="btn btn--primary">
              Kiểm tra xem bạn đang ở đâu
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
