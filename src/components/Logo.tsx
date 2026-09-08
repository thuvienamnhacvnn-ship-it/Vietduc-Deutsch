import Image from "next/image";
import type React from "react";
import { brand } from "@/lib/brand";

/**
 * Logo Việt Đức.
 *
 * Dùng chính tệp logo của khách (`public/brand/logo-ngang.png`) chứ không vẽ
 * lại: đây là nhận diện đã có, vẽ lại gần giống là làm sai thương hiệu.
 *
 * Ngọn lửa có một mảng ĐEN lấy từ cờ Đức. Trên nền tối mảng đó biến mất, nên ở
 * những chỗ nền đậm logo được đặt trên một tấm nền sáng bo góc - cách xử lý
 * thông thường cho logo có chi tiết đen, và trung thực hơn là đổi màu logo.
 */
export function Logo({
  height = 34,
  variant = "auto",
}: {
  height?: number;
  /**
   * `auto` - dùng trên nền giấy sáng, không cần tấm nền.
   * `plate` - dùng trên nền đậm: logo nằm trên tấm nền sáng.
   * `stacked` - bản dọc, cho khu đăng nhập và chân trang rộng.
   */
  variant?: "auto" | "plate" | "stacked";
}) {
  const stacked = variant === "stacked";
  const src = stacked ? "/brand/logo-doc.png" : "/brand/logo-ngang.png";
  // Tỉ lệ thật của hai tệp: ngang 1985x686, dọc 1349x1278.
  const ratio = stacked ? 1349 / 1278 : 1985 / 686;

  const image = (
    <Image
      src={src}
      alt={`${brand.fullName} — ${brand.tagline.vi}`}
      width={Math.round(height * ratio)}
      height={height}
      priority
      className="logo-img"
      /* Chiều cao đi qua biến CSS chứ không phải style cố định: có vậy media
         query mới thu nhỏ được logo ở màn hẹp. Style inline luôn thắng CSS. */
      style={{ "--logo-h": `${height}px` } as React.CSSProperties}
    />
  );

  if (variant === "plate") {
    return <span className="logo-plate">{image}</span>;
  }
  return image;
}
