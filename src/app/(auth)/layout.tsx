import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeroArt } from "@/components/HeroArt";
import { brand } from "@/lib/brand";

/**
 * Khu auth có khung riêng, không dùng header/footer đầy đủ: ở bước này người
 * dùng chỉ nên có một việc để làm.
 *
 * CỘT TRÁI PHẢI CÓ NỘI DUNG. Trước đây nó là một dải màu gần như trống: logo ở
 * trên, một câu ở dưới, và khoảng nửa màn hình rỗng ở giữa - trông như trang
 * chưa tải xong. Giờ nó cho thấy đúng thứ người ta sắp mua: một lượt hội thoại
 * thật trong lớp, kèm ba điều phân biệt sản phẩm này với một ứng dụng học từ
 * vựng.
 *
 * Ba dòng đó cố ý KHÔNG phải con số marketing. Không có "10.000 học viên",
 * không có "98% hài lòng" - những con số ấy chưa tồn tại, và bịa ra chúng ngay
 * ở màn hình đăng nhập là mở đầu quan hệ với người học bằng một câu nói dối.
 */

const DIEM_MANH = [
  {
    title: "Bốn kỹ năng đo riêng",
    body: "Nghe, đọc, viết, nói được chấm tách bạch. Kỹ năng nào chưa đủ bằng chứng thì ghi rõ là chưa đánh giá được.",
  },
  {
    title: "Mỗi lần kiểm tra một đề khác",
    body: "Đề rút từ ngân hàng câu hỏi và tránh những câu bạn đã gặp, nên thi lại là đo trình độ chứ không đo trí nhớ.",
  },
  {
    title: "Dừng lúc nào cũng được",
    body: "Phần đã làm vẫn được chấm và bạn vẫn nhận được khoá học phù hợp để bắt đầu.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <aside className="auth-shell__aside band">
        <div className="auth-shell__brand">
          <Link href="/" style={{ textDecoration: "none" }} aria-label="Về trang chủ">
            <Logo variant="plate" height={40} />
          </Link>
          <h2 className="auth-shell__headline">{brand.headline.vi}</h2>
          <p className="lede auth-shell__lede">{brand.promise.vi}</p>
        </div>

        <div className="auth-shell__art">
          <HeroArt />
        </div>

        <ul className="auth-shell__points">
          {DIEM_MANH.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </li>
          ))}
        </ul>

        <p className="auth-shell__note">
          Đang trong giai đoạn xây dựng. Chưa thu tiền, chưa mở bán.
        </p>
      </aside>

      <main id="noi-dung" className="auth-shell__main">
        <div className="auth-shell__bar">
          {/*
            Logo trên thanh chỉ hiện ở màn hẹp. Ở màn rộng nó đã nằm trong dải
            đỏ bên trái; nhưng dải đó bị ẩn dưới 900px, và trước đây trang đăng
            nhập trên điện thoại không còn nhận diện nào - người dùng nhìn một
            biểu mẫu không rõ của ai.
          */}
          <Link href="/" className="auth-shell__logo" aria-label="Về trang chủ">
            <Logo height={34} />
          </Link>

          <Link href="/" className="auth-shell__back">
            ← Về trang chủ
          </Link>
          <ThemeToggle />
        </div>
        <div className="auth-shell__card">{children}</div>
      </main>
    </div>
  );
}
