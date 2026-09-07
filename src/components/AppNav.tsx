"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { apiPost } from "@/lib/api-client";

export type NavItem = { href: string; label: string; soon?: boolean };

/**
 * Thanh điều hướng dùng chung cho khu học viên và cổng quản trị.
 *
 * Mục `soon` là màn hình của giai đoạn sau: nó vẫn hiện, nhưng bị vô hiệu và ghi
 * rõ "sắp có". Che giấu chúng sẽ khiến người dùng tưởng sản phẩm đã đủ; hiện
 * một liên kết chết còn tệ hơn.
 */
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
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await apiPost("/api/auth/dang-xuat", {});
    router.push("/");
    router.refresh();
  }

  return (
    <header className="app-nav">
      <div className="app-nav__inner">
        <Link href={homeHref} className="app-nav__brand">
          <Logo />
        </Link>

        <button
          type="button"
          className="btn btn--ghost btn--sm app-nav__burger"
          aria-expanded={open}
          aria-controls="app-nav-list"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? "✕" : "☰"}</span>
          <span className="sr-only">{open ? "Đóng menu" : "Mở menu"}</span>
        </button>

        <nav id="app-nav-list" className="app-nav__list" data-open={open} aria-label="Điều hướng">
          {items.map((item) =>
            item.soon ? (
              <span key={item.href} className="app-nav__link app-nav__link--soon" aria-disabled="true">
                {item.label}
                <span className="badge">sắp có</span>
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="app-nav__link"
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="app-nav__user">
          <ThemeToggle />
          <span className="app-nav__who">
            <strong>{userName}</strong>
            <span>{role}</span>
          </span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={logout} disabled={busy}>
            {busy ? "Đang thoát…" : "Đăng xuất"}
          </button>
        </div>
      </div>
    </header>
  );
}
