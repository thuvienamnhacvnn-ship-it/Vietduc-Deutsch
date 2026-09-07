import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { brand } from "@/lib/brand";
import { config } from "@/lib/config";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#101A17" },
  ],
};

/**
 * Chủ đề được ghi lên <html> TRƯỚC lần vẽ đầu tiên, nếu không người chọn chủ đề
 * tối sẽ thấy một nháy trắng ở mỗi lần tải trang. Script cố ý nhỏ và bọc
 * try/catch: localStorage ném lỗi trong một số ngữ cảnh riêng tư.
 */
const themeScript = `
try {
  var t = localStorage.getItem("lingora-theme");
  if (t === "dark" || t === "light") document.documentElement.dataset.theme = t;
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#noi-dung">
          Bỏ qua điều hướng, tới nội dung chính
        </a>
        {children}
      </body>
    </html>
  );
}
