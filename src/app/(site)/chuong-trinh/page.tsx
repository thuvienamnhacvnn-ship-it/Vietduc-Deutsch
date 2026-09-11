import type { Metadata } from "next";
import Link from "next/link";
import { CURRICULUM } from "@/content/curriculum";
import { LevelTabs } from "@/components/program/LevelTabs";
import { LevelArt } from "@/components/home/LevelArt";
import { IconArrow } from "@/components/home/Icons";

export const metadata: Metadata = {
  title: "Chương trình A1–B2",
  description:
    "Khung mục tiêu giao tiếp từ A1 đến B2, viết theo những việc bạn làm được trong đời sống ở Đức.",
};

/**
 * Trang Chương trình theo bản thiết kế 11/09/2026: tiêu đề lớn và tranh Cổng
 * Brandenburg, bốn thẻ cấp độ, bảng chi tiết của cấp đang chọn, dải kêu gọi làm
 * bài kiểm tra.
 *
 * Khung tham chiếu mô tả CEFR và viết lại thành việc cụ thể; số giờ là khoảng
 * thường thấy để tự ước lượng, không phải cam kết - trang nói điều đó ngay dưới
 * bốn thẻ.
 */
export default function ProgramPage() {
  return (
    <div className="program">
      <section className="program-hero">
        <div className="wrap program-hero__inner">
          <div>
            <p className="home-eyebrow">Chương trình tiếng Đức A1–B2</p>
            <h1 className="program-hero__h1">
              <span>Bốn cấp độ.</span> <span>Bốn đích đến rõ ràng.</span>
            </h1>
            <p className="program-hero__lede">
              Chọn cấp độ để khám phá chủ đề, ngữ pháp và những việc bạn có thể làm bằng tiếng Đức.
            </p>
          </div>
          <span className="art-mask art-mask--cong program-hero__art" aria-hidden="true" />
        </div>
      </section>

      <section className="program-body">
        <div className="wrap">
          <LevelTabs levels={CURRICULUM} />
        </div>
      </section>

      <section className="program-cta-wrap">
        <div className="wrap">
          <div className="program-cta">
            <span className="program-cta__art" aria-hidden="true">
              <LevelArt level="B1" />
            </span>
            <div className="program-cta__text">
              <h2>Bạn nên bắt đầu từ đâu?</h2>
              <p>Tạo tài khoản để kiểm tra bốn kỹ năng và xác định điểm bắt đầu.</p>
            </div>
            <Link href="/dang-ky" className="btn btn--gold btn--lg">
              Kiểm tra trình độ
              <IconArrow />
            </Link>
            <p className="program-cta__script" lang="de" aria-hidden="true">
              Dein nächster Schritt in eine hellere Zukunft. <span>♡</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
