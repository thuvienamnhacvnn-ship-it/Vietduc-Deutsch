import Link from "next/link";
import { brand } from "@/lib/brand";
import { Logo } from "./Logo";

/**
 * Footer. Icon mạng xã hội chỉ render khi brand.social có URL thật - yêu cầu
 * A-08. Danh sách rỗng thì cả khối biến mất, không có icon dẫn tới "#".
 */
export function SiteFooter() {
  return (
    <footer className="band">
      <div className="wrap site-footer">
        <div className="site-footer__brand">
          <span style={{ color: "var(--on-band)" }}>
            <Logo />
          </span>
          <p className="lede" style={{ marginTop: "var(--s-4)", fontSize: "var(--fs-md)" }}>
            {brand.tagline.vi}.
          </p>
        </div>

        <nav aria-label="Liên kết chân trang" className="site-footer__cols">
          <div>
            <h3 className="site-footer__h">Học</h3>
            <Link href="/chuong-trinh">Chương trình A1–B2</Link>
            <Link href="/lop-hoc-ai">Lớp học</Link>
            <Link href="/giao-vien-ai">Đội ngũ giảng dạy</Link>
            <Link href="/hoc-phi">Học phí</Link>
          </div>
          <div>
            <h3 className="site-footer__h">Tài khoản</h3>
            <Link href="/dang-ky">Tạo tài khoản</Link>
            <Link href="/dang-nhap">Đăng nhập</Link>
            <Link href="/cau-hoi">Câu hỏi thường gặp</Link>
          </div>
          <div>
            <h3 className="site-footer__h">Pháp lý</h3>
            <Link href="/dieu-khoan">Điều khoản sử dụng</Link>
            <Link href="/rieng-tu">Quyền riêng tư</Link>
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
          </div>
        </nav>
      </div>

      {brand.social.length > 0 && (
        <div className="wrap site-footer__social">
          {brand.social.map((s) => (
            <a key={s.href} href={s.href} rel="noreferrer noopener" target="_blank">
              {s.label}
            </a>
          ))}
        </div>
      )}

      <div className="wrap site-footer__legal">
        <p>
          © {new Date().getFullYear()} {brand.name}. Nội dung học do AI hỗ trợ biên soạn và có
          người duyệt trước khi xuất bản.
        </p>
        {!brand.legalEntity && (
          <p className="site-footer__pending">
            Thông tin pháp nhân và điều khoản kinh doanh chưa được chủ dự án xác nhận. Trang đang ở
            giai đoạn xây dựng, chưa mở bán.
          </p>
        )}
      </div>
    </footer>
  );
}
