import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /*
   * Mở bằng http://127.0.0.1:3055 phải chạy được y như http://localhost:3055.
   *
   * Next 16 chặn tài nguyên dev (HMR, chunk) khi origin khác với origin dev
   * server tự khai. Hậu quả rất khó đoán ra: trang vẫn hiện đầy đủ vì đó là
   * bản dựng ở server, nhưng React KHÔNG hydrate - bấm nút không ăn, ô tick
   * tick vào rồi tự nhả, và không có lỗi nào trong console. Chỉ có một dòng
   * cảnh báo trong log của dev server.
   *
   * Chỉ ảnh hưởng lúc chạy dev; bản production không đọc mục này.
   */
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Không sinh AGENTS.md/CLAUDE.md vào repo: đây là mã nguồn bàn giao cho chủ dự án.
  agentRules: false,
  poweredByHeader: false,
  // PGlite ships a WASM build that must not be bundled into the server chunks.
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    formats: ["image/avif", "image/webp"],
    // Every image is a local asset generated into /public. No remote sources on
    // purpose: nothing on this site should depend on a third-party CDN staying up.
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // The classroom needs the microphone; nothing else on the site does,
          // and the camera is never needed (see docs/ARCHITECTURE.md).
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
