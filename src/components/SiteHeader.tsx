"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/chuong-trinh", label: "Chương trình" },
  { href: "/lop-hoc-ai", label: "Lớp học AI" },
  { href: "/giao-vien-ai", label: "Giáo viên AI" },
  { href: "/hoc-phi", label: "Học phí" },
  { href: "/cau-hoi", label: "Câu hỏi" },
];

/**
 * Header của khu công khai. Trên mobile menu là một panel bung xuống; nó đóng
 * lại khi đổi route, vì nếu không người dùng bấm một liên kết rồi vẫn thấy menu
 * che kín trang mới.
 *
 * CSS nằm trong globals.css chứ không phải styled-jsx: styled-jsx gắn class
 * phạm vi lên phần tử DOM, nhưng `next/link` là một component và không nhận
 * class đó, nên mọi quy tắc nhắm vào <Link> sẽ im lặng không có tác dụng.
 */
export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  // Lưu route mà menu được mở cho, thay vì một cờ boolean rồi phải đóng lại
  // bằng useEffect. Đổi route là `open` tự thành false, không có render thừa.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const setOpen = (value: boolean) => setOpenFor(value ? pathname : null);

  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <Link href="/" className="site-header__brand" aria-label="Lingora, về trang chủ">
          <Logo />
        </Link>

        <nav className="site-header__nav" aria-label="Điều hướng chính">
          {NAV.map((item) => (
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
          <ThemeToggle />
          {signedIn ? (
            <Link href="/hoc" className="btn btn--primary btn--sm">
              Vào học
            </Link>
          ) : (
            <>
              <Link href="/dang-nhap" className="btn btn--ghost btn--sm site-header__signin">
                Đăng nhập
              </Link>
              <Link href="/dang-ky" className="btn btn--primary btn--sm">
                Bắt đầu
              </Link>
            </>
          )}
          <button
            type="button"
            className="btn btn--ghost btn--sm site-header__burger"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen(!open)}
          >
            <span aria-hidden="true">{open ? "✕" : "☰"}</span>
            <span className="sr-only">{open ? "Đóng menu" : "Mở menu"}</span>
          </button>
        </div>
      </div>

      <div id="menu-mobile" className="site-header__mobile" hidden={!open}>
        <div className="wrap stack">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="site-header__mobile-link">
              {item.label}
            </Link>
          ))}
          {!signedIn && (
            <Link href="/dang-nhap" className="site-header__mobile-link">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
