"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { apiPost } from "@/lib/api-client";

export type NavItem = { href: string; label: string; soon?: boolean };

/**
 * Thanh điều hướng của khu học viên và cổng quản trị.
 *
 * Dùng CÙNG ngôn ngữ hình với header trang công khai: ba vùng logo | menu | tài
 * khoản, menu là một dải pill, trang đang mở tô nguyên viên đỏ, và header chỉ
 * tách khỏi trang bằng bóng khi đã cuộn.
 *
 * MỤC "SẮP CÓ" là màn hình của giai đoạn sau. Chúng không nằm trên thanh ngang:
 * bảy mục kèm bảy huy hiệu làm thanh cao gấp đôi và không mục nào đọc ra. Chúng
 * xuống panel, dưới một tiêu đề riêng - người dùng vẫn thấy sản phẩm sẽ có gì,
 * chỉ là không phải thấy cùng lúc với thứ họ đang cần bấm.
 */

function subscribeScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function AppNav({
  items,
  userName,
  role,
  homeHref,
}: {
  items: NavItem[];
  userName: string;
  role: string;
  homeHref: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // Lưu route mà menu được mở cho: đổi trang là menu tự đóng, không cần effect.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const setOpen = (value: boolean) => setOpenFor(value ? pathname : null);
  const [busy, setBusy] = useState(false);

  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 8,
    () => false,
  );

  const ready = items.filter((item) => !item.soon);
  const soon = items.filter((item) => item.soon);

  async function logout() {
    setBusy(true);
    await apiPost("/api/auth/dang-xuat", {});
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className="app-nav"
      data-scrolled={scrolled || undefined}
      data-open={open || undefined}
    >
      <div className="app-nav__inner">
        <Link href={homeHref} className="app-nav__brand" aria-label="Về trang chủ">
          <Logo height={38} />
        </Link>

        <nav className="app-nav__list" aria-label="Điều hướng">
          {ready.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="app-nav__link"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="app-nav__user">
          <span className="app-nav__theme">
            <ThemeToggle />
          </span>

          <span className="app-nav__who">
            <strong>{userName}</strong>
            <span>{role}</span>
          </span>

          <button
            type="button"
            className="btn btn--ghost btn--sm app-nav__logout"
            onClick={logout}
            disabled={busy}
          >
            {busy ? "Đang thoát…" : "Đăng xuất"}
          </button>

          <button
            type="button"
            className="app-nav__burger"
            aria-expanded={open}
            aria-controls="app-nav-panel"
            onClick={() => setOpen(!open)}
          >
            <Burger open={open} />
            <span className="sr-only">{open ? "Đóng menu" : "Mở menu"}</span>
          </button>
        </div>
      </div>

      <div id="app-nav-panel" className="app-nav__panel" hidden={!open}>
        <div className="app-nav__panel-inner">
          <p className="app-nav__panel-who">
            <strong>{userName}</strong>
            <span>{role}</span>
          </p>

          <nav aria-label="Điều hướng, bản rút gọn">
            {ready.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="app-nav__panel-link"
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
                <span aria-hidden="true">›</span>
              </Link>
            ))}
          </nav>

          {soon.length > 0 && (
            <div className="app-nav__soon">
              <h2>Sắp có</h2>
              <ul>
                {soon.map((item) => (
                  <li key={item.href}>{item.label}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="app-nav__panel-foot">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={logout}
              disabled={busy}
            >
              {busy ? "Đang thoát…" : "Đăng xuất"}
            </button>
            <span className="app-nav__panel-theme">
              <span>Giao diện</span>
              <ThemeToggle />
            </span>
          </div>
        </div>
      </div>
    </header>
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
