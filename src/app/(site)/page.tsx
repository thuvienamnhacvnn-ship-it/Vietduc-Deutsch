import type { Metadata } from "next";
import Link from "next/link";
import { getDict } from "@/i18n/server";
import { LOCALE_TAGS } from "@/i18n/config";
import { ClassroomDemo } from "@/components/home/ClassroomDemo";
import { LevelArt } from "@/components/home/LevelArt";
import { IconArrow, IconBars, IconBook, IconMic, IconPlay } from "@/components/home/Icons";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;
const FEATURE_ICONS = [IconBars, IconMic, IconBook];

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return {
    title: { absolute: t.meta.title },
    description: t.meta.description,
    openGraph: { title: t.meta.title, description: t.meta.description },
  };
}

/**
 * Trang chủ theo bản thiết kế "giấy kem - xanh đậm - vàng kim".
 *
 * Toàn bộ chữ lấy từ từ điển của ngôn ngữ đang chọn (src/i18n/dict). Câu tiếng
 * Đức và dòng viết tay tiếng Đức giữ nguyên ở mọi bản, có `lang="de"`.
 */
export default async function HomePage() {
  const { locale, t } = await getDict();

  return (
    <div className="home" lang={LOCALE_TAGS[locale]}>
      {/* ------------------------------------------------------------ HERO */}
      <section className="home-hero">
        <div className="wrap home-hero__inner">
          <div className="home-hero__text">
            <p className="home-eyebrow">{t.hero.eyebrow}</p>
            <h1 className="home-hero__h1">
              <span>{t.hero.h1[0]}</span> <span>{t.hero.h1[1]}</span>
            </h1>
            <p className="home-hero__lede">{t.hero.lede}</p>

            <div className="home-hero__cta">
              <Link href="/dang-ky" className="btn btn--primary btn--lg">
                {t.hero.ctaTest}
                <IconArrow />
              </Link>
              <Link href="/lop-hoc-ai" className="btn btn--outline btn--lg">
                <IconPlay size={18} />
                {t.hero.ctaClass}
              </Link>
            </div>

            <ul className="home-features">
              {t.hero.features.map((f, i) => {
                const Icon = FEATURE_ICONS[i];
                return (
                  <li key={f.title}>
                    <span className="home-features__icon" aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <span>
                      <strong>{f.title}</strong>
                      <span>{f.body}</span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="home-hero__script" lang="de" aria-hidden="true">
              <span>Mehr als eine Sprache.</span>
              <span>Eine größere Zukunft.</span>
            </p>
          </div>

          <ClassroomDemo t={t.demo} />
        </div>
      </section>

      {/* -------------------------------------------------------- LỘ TRÌNH */}
      <section className="home-section home-path" id="lo-trinh">
        <div className="wrap">
          <div className="home-path__head">
            <div>
              <h2 className="home-h2">{t.path.h2}</h2>
              <p className="home-lede">{t.path.lede}</p>
            </div>
            <p className="home-kicker">{t.path.kicker}</p>
          </div>

          <div className="home-levels">
            {LEVELS.map((lvl, i) => {
              const L = t.path.levels[lvl];
              return (
                <article key={lvl} className="home-level" data-first={i === 0 || undefined}>
                  <LevelArt level={lvl} />
                  <div className="home-level__top">
                    <span className="home-level__code">{lvl}</span>
                    {i === 0 && <span className="home-level__badge">{t.path.startHere}</span>}
                  </div>
                  <h3 className="home-level__title">{L.title}</h3>
                  <p className="home-level__body">{L.body}</p>
                  <Link href={`/chuong-trinh#${lvl.toLowerCase()}`} className="home-level__more">
                    {t.path.more}
                    <IconArrow size={18} />
                    <span className="sr-only"> — {lvl}</span>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- HÀNH TRÌNH */}
      <section className="home-section home-journey">
        <div className="wrap">
          <p className="home-eyebrow">{t.journey.eyebrow}</p>
          <h2 className="home-h2">{t.journey.h2}</h2>
          <ol className="home-steps">
            {t.journey.steps.map((s, i) => (
              <li key={s.title}>
                <span className="home-steps__n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------------------------------- NÓI THẲNG */}
      <section className="home-section home-honest">
        <div className="wrap">
          <p className="home-eyebrow">{t.honest.eyebrow}</p>
          <h2 className="home-h2">{t.honest.h2}</h2>
          <div className="home-honest__grid">
            {t.honest.items.map((h) => (
              <div key={h.title} className="home-card">
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- FAQ */}
      <section className="home-section" id="cau-hoi">
        <div className="wrap home-faq">
          <div>
            <p className="home-eyebrow">{t.faq.eyebrow}</p>
            <h2 className="home-h2">{t.faq.h2}</h2>
          </div>
          <div className="faq">
            {t.faq.items.map((item) => (
              <details key={item.q} className="faq__item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- CTA */}
      <section className="home-cta">
        <div className="wrap home-cta__inner">
          <h2 className="home-h2">{t.cta.h2}</h2>
          <p className="home-lede">{t.cta.lede}</p>
          <p>
            <Link href="/dang-ky" className="btn btn--gold btn--lg">
              {t.cta.button}
              <IconArrow />
            </Link>
          </p>
          <p className="home-cta__fine">{t.cta.fine}</p>
        </div>
      </section>
    </div>
  );
}
