"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";
import { LOCALE_TAGS } from "@/i18n/config";
import type { Dict } from "@/i18n/dict";
import { BrandLockup } from "./BrandLockup";
import { LangSwitch } from "./LangSwitch";
import { ThemeToggle } from "./ThemeToggle";

type Chrome = Dict["chrome"];

/** Menu chính theo bản thiết kế: bốn mục. Đội ngũ và Câu hỏi nằm ở panel mobile và chân trang. */
function mainNav(t: Chrome) {
  return [
    { href: "/chuong-trinh", label: t.nav.program },
    { href: "/lop-hoc-ai", label: t.nav.classroom },
    { href: "/#lo-trinh", label: t.nav.path },
    { href: "/hoc-phi", label: t.nav.pricing },
  ];
}

/**
 * Header của khu công khai.
 *
 * BỐ CỤC BA VÙNG: logo trái, menu giữa, nút phải. Lưới `auto 1fr auto` giữ menu
 * ở đúng giữa bất kể logo hay cụm nút rộng bao nhiêu.
 *
 * MOBILE chỉ để ba thứ trên thanh: logo, nút hành động chính, nút mở menu. Chọn
 * ngôn ngữ, đổi giao diện và đăng nhập chuyển xuống panel - trên màn 390px, mỗi
 * món thêm vào thanh là một món đẩy thanh tràn ra ngoài.
 *
 * CSS nằm trong stylesheet chung chứ không phải styled-jsx: `next/link` không
 * nhận class phạm vi của styled-jsx, mọi quy tắc nhắm vào <Link> sẽ im lặng.
 */

function subscribeScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function SiteHeader({
  signedIn,
  locale,
  t,
}: {
  signedIn: boolean;
  locale: Locale;
  t: Chrome;
}) {
  const pathname = usePathname();
  // Lưu route mà menu được mở cho, thay vì một cờ boolean rồi phải đóng lại
  // bằng useEffect. Đổi route là `open` tự thành false.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const setOpen = (value: boolean) => setOpenFor(value ? pathname : null);

  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 8,
    () => false,
  );

  const nav = mainNav(t);
  const themeLabels = { ...t.themeState, hint: t.themeHint };
  // Chỉ trang chủ có bản dịch. Ở trang khác, người đã chọn tiếng khác được báo
  // thẳng rằng trang này đang bằng tiếng Việt, thay vì tưởng trang bị lỗi.
  const showUntranslated = locale !== "vi" && pathname !== "/" && t.untranslated;

  return (
    <header
      className="site-header"
      lang={LOCALE_TAGS[locale]}
      data-scrolled={scrolled || undefined}
      data-open={open || undefined}
    >
      <div className="wrap site-header__inner">
        <Link href="/" className="site-header__brand" aria-label={`Việt Đức Lingua — ${t.home}`}>
          <BrandLockup height={46} />
        </Link>

        <nav className="site-header__nav" aria-label={t.mainNav}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-header__link"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <span className="site-header__lang">
            <LangSwitch locale={locale} label={t.language} />
          </span>
          <span className="site-header__theme">
            <ThemeToggle labels={themeLabels} />
          </span>

          {signedIn ? (
            <Link href="/hoc" className="btn btn--primary btn--sm site-header__cta">
              {t.enter}
              <Arrow />
            </Link>
          ) : (
            <>
              <Link href="/dang-nhap" className="site-header__signin">
                {t.signin}
              </Link>
              <Link href="/dang-ky" className="btn btn--primary btn--sm site-header__cta">
                {t.start}
                <Arrow />
              </Link>
            </>
          )}

          <p className="site-header__motto" aria-hidden="true">
            <span>{t.motto[0]}</span>
            <span>{t.motto[1]}</span>
          </p>

          <button
            type="button"
            className="site-header__burger"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen(!open)}
          >
            <Burger open={open} />
            <span className="sr-only">{open ? t.menuClose : t.menuOpen}</span>
          </button>
        </div>
      </div>

      <div id="menu-mobile" className="site-header__mobile" hidden={!open}>
        <nav className="wrap" aria-label={t.mobileNav}>
          {[
            ...nav,
            { href: "/giao-vien-ai", label: t.nav.team },
            { href: "/cau-hoi", label: t.nav.faq },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-header__mobile-link"
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
              <span aria-hidden="true">›</span>
            </Link>
          ))}

          <div className="site-header__mobile-foot">
            {!signedIn && (
              <Link href="/dang-nhap" className="btn btn--secondary btn--block">
                {t.signin}
              </Link>
            )}
            <div className="site-header__mobile-prefs">
              <LangSwitch locale={locale} label={t.language} />
              {/* Nút đổi giao diện chỉ là một biểu tượng; đứng một mình trong
                  panel thì phải có nhãn nhìn thấy được. */}
              <span className="site-header__mobile-theme">
                <span>{t.theme}</span>
                <ThemeToggle labels={themeLabels} />
              </span>
            </div>
          </div>
        </nav>
      </div>

      {showUntranslated ? (
        <p className="site-header__untranslated">
          <span className="wrap">{t.untranslated}</span>
        </p>
      ) : null}
    </header>
  );
}

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5 12h13M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Nút menu vẽ bằng SVG chứ không dùng ký tự ☰ và ✕: hai ký tự đó lệch cỡ và
 * lệch đường chân giữa các font hệ thống, nên nút bị nhảy khi đóng mở.
 */
function Burger({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <g
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        className="burger__lines"
        data-open={open || undefined}
      >
        <line x1="3" y1="6" x2="17" y2="6" />
        <line x1="3" y1="10" x2="17" y2="10" />
        <line x1="3" y1="14" x2="17" y2="14" />
      </g>
    </svg>
  );
}
