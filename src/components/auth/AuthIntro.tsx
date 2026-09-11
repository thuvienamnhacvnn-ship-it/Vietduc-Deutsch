"use client";

import { usePathname } from "next/navigation";
import { IconBars, IconBook, IconMic } from "@/components/home/Icons";

/**
 * Cột trái của khu đăng nhập, theo bản thiết kế: lời chào lớn, tranh Berlin,
 * thẻ lời Anna và ba điểm mạnh.
 *
 * Lời chào đổi theo trang - "chào mừng trở lại" chỉ đúng với người đăng nhập,
 * không đúng với người vừa bấm "tạo tài khoản". Layout không biết trang con là
 * gì nên phần này đọc đường dẫn.
 *
 * Anna hiện bằng chữ cái đầu, không bằng ảnh người: trong lớp Anna là giọng
 * nói, không có khuôn mặt nào để hứa trước ở đây.
 */
const COPY: Record<string, { h1: string; lede: string; de: string; vi: string }> = {
  "/dang-nhap": {
    h1: "Chào mừng bạn trở lại.",
    lede: "Tiếp tục hành trình tiếng Đức, từ đúng nơi bạn đã dừng.",
    de: "Schön, dass du wieder da bist!",
    vi: "Rất vui được gặp lại bạn!",
  },
  "/dang-ky": {
    h1: "Bắt đầu nói tiếng Đức.",
    lede: "Tạo tài khoản miễn phí, làm bài kiểm tra bốn kỹ năng và nhận lộ trình của riêng bạn.",
    de: "Herzlich willkommen!",
    vi: "Chào mừng bạn đến lớp!",
  },
  "/quen-mat-khau": {
    h1: "Lấy lại quyền vào lớp.",
    lede: "Đặt lại mật khẩu trong vài phút. Tiến độ học của bạn vẫn còn nguyên.",
    de: "Keine Sorge, das passiert jedem.",
    vi: "Đừng lo, ai cũng từng quên.",
  },
  "/xac-minh": {
    h1: "Chỉ còn một bước.",
    lede: "Xác minh email để tài khoản và tiến độ học của bạn được giữ an toàn.",
    de: "Fast geschafft!",
    vi: "Sắp xong rồi!",
  },
};
COPY["/dat-lai-mat-khau"] = COPY["/quen-mat-khau"];

const POINTS = [
  { Icon: IconBook, title: "Lộ trình riêng", body: "Học đúng mục tiêu của bạn." },
  { Icon: IconMic, title: "Luyện nói cùng AI", body: "Anna nghe và trả lời từng câu." },
  { Icon: IconBars, title: "Theo dõi tiến bộ", body: "Thấy từng kỹ năng tiến lên." },
];

export function AuthIntro() {
  const pathname = usePathname();
  const c = COPY[pathname] ?? COPY["/dang-nhap"];

  return (
    <section className="auth-intro" aria-label="Giới thiệu">
      <p className="home-eyebrow">Tiếng Đức A1–B2</p>
      <h2 className="auth-intro__h1">{c.h1}</h2>
      <p className="auth-intro__lede">{c.lede}</p>

      <div className="auth-intro__art">
        <span className="art-mask art-mask--toan-canh" aria-hidden="true" />
        <div className="auth-intro__anna">
          <span className="demo__avatar" aria-hidden="true">
            A
          </span>
          <div>
            <p className="auth-intro__who">
              <strong>Anna</strong> · Giáo viên AI
            </p>
            <p className="auth-intro__de" lang="de">
              {c.de}
            </p>
            <p className="auth-intro__vi">{c.vi}</p>
          </div>
        </div>
      </div>

      <ul className="auth-intro__points">
        {POINTS.map(({ Icon, title, body }) => (
          <li key={title}>
            <span className="auth-intro__icon" aria-hidden="true">
              <Icon size={30} />
            </span>
            <span>
              <strong>{title}</strong>
              <span>{body}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
