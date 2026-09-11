import type { Metadata, Viewport } from "next";
import { Caveat, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { brand } from "@/lib/brand";
import { config } from "@/lib/config";
import { getDict } from "@/i18n/server";

/*
 * Hai font của bản thiết kế, nạp cho toàn hệ thống.
 *
 * Playfair Display có bộ ký tự tiếng Việt - tiêu đề có đủ dấu, không rơi về
 * font dự phòng giữa chừng. Tiếng Nhật, Trung, Hàn không có trong font này và
 * cũng không nạp thêm: mỗi bộ chữ CJK nặng vài MB, nên các thứ tiếng đó dùng
 * font có sẵn của hệ điều hành (xem site.css, `:lang()`).
 *
 * Caveat chỉ viết những dòng tiếng Đức viết tay trang trí - không bao giờ mang
 * nội dung cần đọc để hiểu trang.
 */
const display = Playfair_Display({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const script = Caveat({
  subsets: ["latin", "latin-ext"],
  weight: ["500"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  // Cần cho việc dựng URL tuyệt đối của ảnh Open Graph. Đọc từ cấu hình để bản
  // triển khai và bản chạy ở máy không phải sửa code.
  metadataBase: new URL(config.appUrl),
  title: {
    default: `${brand.name} — ${brand.tagline.vi}`,
    template: `%s · ${brand.name}`,
  },
  description: brand.promise.vi,
  applicationName: brand.name,
  // Cho bản cài về màn hình chính trên iOS: iOS không đọc manifest cho phần
  // này, phải khai riêng thì mở ra mới không còn thanh địa chỉ.
  appleWebApp: { capable: true, title: brand.name, statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/favicon.svg" }],
  },
  openGraph: {
    title: `${brand.name} — ${brand.tagline.vi}`,
    description: brand.promise.vi,
    images: ["/brand/og.svg"],
    type: "website",
  },
  robots: {
    // Trang chưa mở bán và nội dung pháp lý chưa được duyệt: không để công cụ
    // tìm kiếm lập chỉ mục cho tới khi chủ dự án cho phép.
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  // Khoá thu phóng KHÔNG được đặt ở đây: người học lớn tuổi cần phóng to chữ.
  // Chỉ đặt viewport-fit để trang tràn ra vùng tai thỏ, còn phần nội dung thì
  // các thanh dính đã tự trừ safe-area trong CSS.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F3EA" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1322" },
  ],
};

/**
 * Chủ đề được ghi lên <html> TRƯỚC lần vẽ đầu tiên, nếu không người chọn chủ đề
 * tối sẽ thấy một nháy trắng ở mỗi lần tải trang. Script cố ý nhỏ và bọc
 * try/catch: localStorage ném lỗi trong một số ngữ cảnh riêng tư.
 */
const themeScript = `
try {
  var t = localStorage.getItem("vd-theme");
  if (t === "dark" || t === "light") document.documentElement.dataset.theme = t;
} catch (e) {}
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // `lang` của <html> để tiếng Việt: chỉ khu công khai có bản dịch, và các vùng
  // đã dịch tự khai `lang` riêng. Riêng liên kết "bỏ qua điều hướng" theo ngôn
  // ngữ đã chọn vì nó là thứ đầu tiên người dùng bàn phím gặp.
  const { t } = await getDict();
  return (
    <html lang="vi" className={`${display.variable} ${script.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#noi-dung">
          {t.chrome.skip}
        </a>
        {children}
      </body>
    </html>
  );
}
