"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/chuong-trinh", label: "Chương trình" },
  { href: "/lop-hoc-ai", label: "Lớp học" },
  { href: "/giao-vien-ai", label: "Đội ngũ" },
  { href: "/hoc-phi", label: "Học phí" },
  { href: "/cau-hoi", label: "Câu hỏi" },
];

/**
 * Header của khu công khai.
 *
 * BỐ CỤC BA VÙNG: logo trái, menu giữa, nút phải. Trước đây header dùng flex và
 * menu bị dính sát logo rồi bỏ trống cả khoảng giữa - lưới `auto 1fr auto` giữ
 * menu ở đúng giữa bất kể logo hay cụm nút rộng bao nhiêu.
 *
 * MOBILE chỉ để ba thứ trên thanh: logo, nút hành động chính, nút mở menu. Nút
 * đổi giao diện và liên kết đăng nhập chuyển xuống panel - trên màn 390px, mỗi
 * món thêm vào thanh là một món đẩy thanh tràn ra ngoài.
 *
 * CSS nằm trong globals.css chứ không phải styled-jsx: styled-jsx gắn class
 * phạm vi lên phần tử DOM, nhưng `next/link` là một component và không nhận
 * class đó, nên mọi quy tắc nhắm vào <Link> sẽ im lặng không có tác dụng.
 */

/**
 * Theo dõi việc trang đã cuộn hay chưa, để header đổi từ trong suốt sang có
 * bóng. Dùng `useSyncExternalStore` thay vì `useEffect` + `setState`: server
 * render ra "chưa cuộn", client đồng bộ ngay ở lần vẽ đầu, không có render thừa.
 */
function subscribeScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  // Lưu route mà menu được mở cho, thay vì một cờ boolean rồi phải đóng lại
  // bằng useEffect. Đổi route là `open` tự thành false, không có render thừa.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const setOpen = (value: boolean) => setOpenFor(value ? pathname : null);

  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 8,
    () => false,
  );

  return (
    <header className="site-header" data-scrolled={scrolled || undefined} data-open={open || undefined}>
      <div className="wrap site-header__inner">
        <Link href="/" className="site-header__brand" aria-label="Về trang chủ">
          <Logo height={40} />
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
          <span className="site-header__theme">
            <ThemeToggle />
          </span>

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
            className="site-header__burger"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen(!open)}
          >
            <Burger open={open} />
            <span className="sr-only">{open ? "Đóng menu" : "Mở menu"}</span>
          </button>
        </div>
      </div>

      <div id="menu-mobile" className="site-header__mobile" hidden={!open}>
        <nav className="wrap" aria-label="Điều hướng chính, bản rút gọn">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-header__mobile-link"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
              <span aria-hidden="true">›</span>
            </Link>
          ))}

          <div className="site-header__mobile-foot">
            {!signedIn && (
              <Link href="/dang-nhap" className="btn btn--secondary btn--block">
                Đăng nhập
              </Link>
            )}
            {/* Nút đổi giao diện chỉ là một biểu tượng. Trong panel nó đứng một
                mình nên phải có nhãn nhìn thấy được, không thể trông chờ vào
                nhãn dành riêng cho trình đọc màn hình. */}
            <span className="site-header__mobile-theme">
              <span>Giao diện</span>
              <ThemeToggle />
            </span>
          </div>
        </nav>
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
