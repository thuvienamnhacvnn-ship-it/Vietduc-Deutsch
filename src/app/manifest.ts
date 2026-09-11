import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

/**
 * Manifest để cài về màn hình chính.
 *
 * Người học tiếng Đức mở bài học mỗi ngày trên điện thoại. Có manifest thì trang
 * cài được như một ứng dụng: có icon riêng, mở toàn màn hình, không còn thanh
 * địa chỉ chiếm mất một phần tám màn hình ở mỗi câu hỏi.
 *
 * `start_url` trỏ vào khu học chứ không phải trang chủ: người đã cài rồi là
 * người đã có tài khoản, mở ra là muốn học tiếp chứ không phải đọc lại trang
 * giới thiệu.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.fullName} — ${brand.tagline.vi}`,
    short_name: brand.name,
    description: brand.promise.vi,
    start_url: "/hoc",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f3ea",
    theme_color: "#14223d",
    lang: "vi",
    categories: ["education"],
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/brand/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
