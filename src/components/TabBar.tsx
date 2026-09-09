"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Thanh điều hướng dưới đáy màn hình, chỉ hiện trên điện thoại.
 *
 * Vì sao có nó: khu học viên là chỗ người dùng THAO TÁC, không phải chỗ đọc.
 * Menu ba gạch ở góc trên bắt bấm hai lần cho mọi việc và giấu mất đường đi -
 * đó là ngôn ngữ của trang web. Ứng dụng học tập nào cũng đặt các mục chính ở
 * đáy, trong tầm ngón cái, và luôn nhìn thấy được.
 *
 * Chỉ bốn mục. Thanh dưới năm mục trở lên thì mỗi mục hẹp hơn 70px và nhãn bị
 * cắt; những mục còn lại vẫn nằm trong menu ở thanh trên.
 *
 * Icon vẽ thẳng bằng SVG chứ không dùng thư viện icon: bốn hình này chỉ tốn vài
 * dòng, còn một thư viện icon là thêm một phụ thuộc và vài chục KB cho cả trang.
 */

export type Tab = { href: string; label: string; icon: "home" | "test" | "result" | "me" };

const ICONS: Record<Tab["icon"], React.ReactNode> = {
  home: (
    <>
      <path d="M4 11.2 12 4l8 7.2" />
      <path d="M6 10.4V20h12v-9.6" />
    </>
  ),
  test: (
    <>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" />
      <path d="M8.5 9h7M8.5 13h7M8.5 17h4" />
    </>
  ),
  result: (
    <>
      <path d="M5 19V11M12 19V5M19 19v-6" />
    </>
  ),
  me: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.2-3.4 4-5 7-5s5.8 1.6 7 5" />
    </>
  ),
};

export function TabBar({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <nav className="tabbar" aria-label="Điều hướng chính">
      {tabs.map((tab) => {
        // So khớp CHÍNH XÁC, không dùng startsWith: "/hoc" là tiền tố của mọi
        // đường dẫn trong khu này, nên startsWith làm mục đầu luôn sáng.
        const current = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="tabbar__item"
            aria-current={current ? "page" : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {ICONS[tab.icon]}
            </svg>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
