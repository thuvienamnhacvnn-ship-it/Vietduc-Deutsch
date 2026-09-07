import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
