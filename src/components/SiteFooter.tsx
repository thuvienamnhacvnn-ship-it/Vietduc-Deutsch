import Link from "next/link";
import { brand, telHref } from "@/lib/brand";
import { Logo } from "./Logo";
import { FooterMap } from "./FooterMap";

/**
 * Chân trang, ba dải đều nhau - lấy nguyên cấu trúc của chân trang
 * vietducgroup.
 *
 * Trên: văn phòng - một bản đồ chỉ đường được, cạnh địa chỉ và các kênh liên
 * hệ. Giữa: bốn cột ngang sức, mỗi cột một phần của trang. Dưới: dòng pháp lý.
 * Mỗi dải là một lưới riêng, nên không khối nào phải kê thêm cho thẳng hàng.
 *
 * Icon mạng xã hội chỉ render khi brand.social có URL thật - yêu cầu A-08.
 * Danh sách rỗng thì cả khối biến mất, không có icon dẫn tới "#".
 */
export function SiteFooter() {
  const tel = telHref(brand.phoneE164 || brand.phone);
  /*
   * Cột "Văn phòng" bỏ trụ sở ra: địa chỉ trụ sở đã nằm ngay trên, cạnh bản đồ.
   * In lại nguyên đoạn địa chỉ đó lần thứ hai làm chân trang trên điện thoại
   * dài thêm cả một màn hình mà không thêm thông tin nào.
   */
  const otherOffices = brand.offices.filter((o) => o.address !== brand.headquarters);
  const legal = brand.legalEntity;
  const missing = [
    !legal.register && "mã số doanh nghiệp",
    !legal.vatId && "mã số thuế",
    !legal.responsible && "người chịu trách nhiệm nội dung",
  ].filter(Boolean) as string[];

  return (
    <footer className="band site-footer">
      {/* ------------------------------------------------------- văn phòng */}
      <div className="wrap site-footer__office">
        <div className="site-footer__office-text">
          <Logo variant="plate" height={44} />
          <p className="site-footer__motto">{brand.motto}</p>
          <p className="site-footer__legal-name">{legal.company}</p>

          <dl className="site-footer__contact">
            <div>
              <dt>Trụ sở</dt>
              <dd>{brand.headquarters}</dd>
            </div>
            {tel ? (
              <div>
                <dt>Điện thoại</dt>
                <dd>
                  <a href={tel}>{brand.phone}</a>
                </dd>
              </div>
            ) : null}
            {brand.email ? (
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${brand.email}`}>{brand.email}</a>
                </dd>
              </div>
            ) : null}
            {brand.website ? (
              <div>
                <dt>Website</dt>
                <dd>
                  <a href={brand.website} target="_blank" rel="noopener noreferrer">
                    {brand.website.replace(/^https?:\/\//, "")}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

          {brand.social.length > 0 ? (
            <div className="site-footer__social">
              <h2 className="site-footer__h">Kênh của chúng tôi</h2>
              <div className="site-footer__social-links">
                {brand.social.map((s) => (
                  <a key={s.href} href={s.href} rel="noreferrer noopener" target="_blank">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <FooterMap
          address={brand.headquarters}
          bbox={brand.map.bbox}
          marker={brand.map.marker}
          title={`Bản đồ vị trí trụ sở ${brand.fullName}`}
          directionsLabel="Chỉ đường"
        />
      </div>

      {/* --------------------------------------------------- sơ đồ trang */}
      <div className="wrap site-footer__cols">
        <nav aria-label="Học">
          <h2 className="site-footer__h">Học</h2>
          <ul>
            <li>
              <Link href="/chuong-trinh">Chương trình A1–B2</Link>
            </li>
            <li>
              <Link href="/lop-hoc-ai">Lớp học</Link>
            </li>
            <li>
              <Link href="/giao-vien-ai">Đội ngũ giảng dạy</Link>
            </li>
            <li>
              <Link href="/hoc-phi">Học phí</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Tài khoản">
          <h2 className="site-footer__h">Tài khoản</h2>
          <ul>
            <li>
              <Link href="/dang-ky">Tạo tài khoản</Link>
            </li>
            <li>
              <Link href="/dang-nhap">Đăng nhập</Link>
            </li>
            <li>
              <Link href="/cau-hoi">Câu hỏi thường gặp</Link>
            </li>
            <li>
              <Link href="/quy-che-thi">Quy chế kiểm tra xếp lớp</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Pháp lý">
          <h2 className="site-footer__h">Pháp lý</h2>
          <ul>
            <li>
              <Link href="/dieu-khoan">Điều khoản sử dụng</Link>
            </li>
            <li>
              <Link href="/rieng-tu">Quyền riêng tư</Link>
            </li>
            <li>
              <a href={`mailto:${brand.email}`}>{brand.email}</a>
            </li>
          </ul>
        </nav>

        {/* Văn phòng chứ không phải mục đăng ký nhận thư: bản này chưa có hệ
            thống gửi thư, mà một ô nhập không dẫn tới đâu thì tệ hơn là không
            có ô nào. */}
        {otherOffices.length > 0 && (
          <div className="site-footer__offices">
            <h2 className="site-footer__h">Văn phòng</h2>
            <ul>
              {otherOffices.map((office) => (
                <li key={office.city}>
                  <strong>{office.city}</strong>
                  <span>{office.address}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------- pháp lý */}
      <div className="site-footer__bottom">
        <div className="wrap site-footer__bottom-inner">
          <p className="site-footer__copy">
            © {new Date().getFullYear()} {brand.fullName}. Bản quyền thuộc về {brand.fullName}. Nội
            dung học do AI hỗ trợ biên soạn và có người duyệt trước khi xuất bản.
          </p>
          <ul className="site-footer__legal-links">
            <li>
              <Link href="/rieng-tu">Quyền riêng tư</Link>
            </li>
            <li>
              <Link href="/dieu-khoan">Điều khoản sử dụng</Link>
            </li>
            <li>
              <Link href="/quy-che-thi">Quy chế kiểm tra</Link>
            </li>
          </ul>
        </div>

        {missing.length > 0 && (
          <div className="wrap">
            <p className="site-footer__pending">
              Chưa có {missing.join(", ")}. Những mục này bắt buộc phải có trước khi trang được công
              khai và mở bán.
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}
