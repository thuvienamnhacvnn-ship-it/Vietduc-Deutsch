import Link from "next/link";
import { brand } from "@/lib/brand";
import { CURRICULUM, TEACHING_CYCLE } from "@/content/curriculum";
import { AGENTS } from "@/content/agents";
import { FAQ, HONESTY, JOURNEY } from "@/content/site";
import { HeroArt } from "@/components/HeroArt";
import { PlanCards } from "@/components/PlanCards";
import { listPublicPlans } from "@/lib/queries";

export default async function HomePage() {
  const plans = await listPublicPlans();

  return (
    <>
      {/* ------------------------------------------------------------ HERO */}
      <section className="hero">
        <div className="wrap hero__inner">
          <div className="hero__text">
            <p className="eyebrow">Tiếng Đức A1–B2 cho người Việt</p>
            <h1 className="hero__h1">{brand.headline.vi}</h1>
            <p className="lede">
              {brand.promise.vi} Giải thích bằng tiếng Việt, luyện bằng tiếng Đức, và lộ trình dựng
              từ kết quả thật của bạn chứ không phải một khoá học chung cho tất cả mọi người.
            </p>
            <div className="hero__cta">
              <Link href="/dang-ky" className="btn btn--primary">
                Kiểm tra trình độ
              </Link>
              <Link href="/lop-hoc-ai" className="btn btn--secondary">
                Trải nghiệm lớp học
              </Link>
            </div>
            <p className="hero__fine">
              Miễn phí tạo tài khoản. Chưa thu tiền cho tới khi hệ thống thanh toán được chủ dự án
              kích hoạt.
            </p>
          </div>
          <HeroArt />
        </div>
      </section>

      {/* -------------------------------------------------------- HÀNH TRÌNH */}
      <section className="section" id="hanh-trinh">
        <div className="wrap">
          <p className="eyebrow">Hành trình học</p>
          <h2>Năm bước, không bước nào là hình thức</h2>
          <p className="lede">
            Từ lúc bạn chưa có tài khoản đến lúc bạn ôn lại đúng những từ hay quên.
          </p>

          <ol className="journey">
            {JOURNEY.map((step) => (
              <li key={step.n} className="journey__item">
                <span className="journey__n">{step.n}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------------------------------- CHƯƠNG TRÌNH */}
      <section className="section band" id="chuong-trinh">
        <div className="wrap">
          <p className="eyebrow">Chương trình</p>
          <h2>Từ A1 đến B2, mỗi cấp có đích đến rõ ràng</h2>
          <p className="lede">
            Khung mục tiêu tham chiếu CEFR, viết lại bằng những việc bạn làm được trong đời sống ở
            Đức.
          </p>

          <div className="grid grid-4" style={{ marginTop: "var(--s-9)" }}>
            {CURRICULUM.map((lvl) => (
              <article key={lvl.level} className="card level-card">
                <span className="badge badge--lime">{lvl.level}</span>
                <h3 style={{ marginTop: "var(--s-4)" }}>{lvl.headline}</h3>
                <ul className="tick">
                  {lvl.canDo.slice(0, 3).map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <p className="level-card__hours">{lvl.typicalHours}</p>
              </article>
            ))}
          </div>

          <p style={{ marginTop: "var(--s-8)" }}>
            <Link href="/chuong-trinh" className="btn btn--secondary">
              Xem chi tiết từng cấp độ
            </Link>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------ LỚP HỌC AI */}
      <section className="section" id="lop-hoc">
        <div className="wrap">
          <p className="eyebrow">Lớp học AI hoạt động thế nào</p>
          <h2>Một buổi học đi qua tám bước</h2>
          <p className="lede">
            Không phải một ô chat. Có giáo viên dẫn, có bảng giảng chạy theo bài, có lượt nói của
            bạn và có phần sửa lỗi tập trung.
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

      {/* -------------------------------------------------------- GIÁO VIÊN AI */}
      <section className="section" id="doi-ngu" style={{ background: "var(--paper-sunken)" }}>
        <div className="wrap">
          <p className="eyebrow">Đội ngũ AI</p>
          <h2>Bảy vai trò, mỗi vai trò có ranh giới rõ</h2>
          <p className="lede">
            Chúng tôi ghi luôn cả những việc mỗi vai trò KHÔNG được làm — vì đó mới là điều đáng
            biết khi bạn giao việc học của mình cho một hệ thống.
          </p>

          <div className="grid grid-3" style={{ marginTop: "var(--s-9)" }}>
            {AGENTS.slice(0, 6).map((a) => (
              <article key={a.key} className="card card--hover">
                <span className="badge" style={{ borderColor: a.accent, color: a.accent }}>
                  AI
                </span>
                <h3 style={{ marginTop: "var(--s-3)" }}>
                  {a.name ? `${a.name} — ${a.title}` : a.title}
                </h3>
                <p>{a.does}</p>
                <p className="limits">
                  <strong>Không làm:</strong> {a.limits}
                </p>
              </article>
            ))}
          </div>

          <p style={{ marginTop: "var(--s-8)" }}>
            <Link href="/giao-vien-ai" className="btn btn--secondary">
              Xem cả bảy vai trò
            </Link>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ GÓI HỌC */}
      <section className="section" id="hoc-phi">
        <div className="wrap">
          <p className="eyebrow">Gói học</p>
          <h2>Học phí</h2>
          <PlanCards plans={plans} />
        </div>
      </section>

      {/* ------------------------------------------------------- NÓI THẲNG */}
      <section className="section band">
        <div className="wrap">
          <p className="eyebrow">Nói thẳng</p>
          <h2>Ba điều chúng tôi không làm</h2>
          <div className="grid grid-3" style={{ marginTop: "var(--s-8)" }}>
            {HONESTY.map((h) => (
              <div key={h.title} className="card">
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- FAQ */}
      <section className="section" id="cau-hoi">
        <div className="wrap">
          <p className="eyebrow">Câu hỏi thường gặp</p>
          <h2>Những điều người học hỏi trước tiên</h2>
          <div className="faq">
            {FAQ.map((item) => (
              <details key={item.q} className="faq__item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- CTA */}
      <section className="section cta-final">
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2>Bắt đầu bằng một bài kiểm tra thật</h2>
          <p className="lede" style={{ marginInline: "auto" }}>
            Bốn kỹ năng được kiểm riêng. Kết quả nói rõ bạn đang ở đâu và phần nào chưa đủ dữ liệu
            để kết luận.
          </p>
          <p style={{ marginTop: "var(--s-6)" }}>
            <Link href="/dang-ky" className="btn btn--primary">
              Tạo tài khoản và kiểm tra
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
