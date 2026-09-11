import Link from "next/link";
import { brand, telHref } from "@/lib/brand";
import { Logo } from "./Logo";
import { FooterMap } from "./FooterMap";
import { LOCALE_TAGS, type Locale } from "@/i18n/config";
import { fill, type Dict } from "@/i18n/dict";

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
export function SiteFooter({ locale, t }: { locale: Locale; t: Dict["footer"] }) {
  const tel = telHref(brand.phoneE164 || brand.phone);
  /*
   * Cột "Văn phòng" bỏ trụ sở ra: địa chỉ trụ sở đã nằm ngay trên, cạnh bản đồ.
   * In lại nguyên đoạn địa chỉ đó lần thứ hai làm chân trang trên điện thoại
   * dài thêm cả một màn hình mà không thêm thông tin nào.
   */
  const otherOffices = brand.offices.filter((o) => o.address !== brand.headquarters);
  const legal = brand.legalEntity;
  const missing = [
    !legal.register && t.missing.register,
    !legal.vatId && t.missing.vatId,
    !legal.responsible && t.missing.responsible,
  ].filter(Boolean) as string[];
  // Tiếng Nhật và tiếng Trung liệt kê bằng dấu "、", không phải dấu phẩy.
  const listSep = locale === "ja" || locale === "zh" ? "、" : ", ";

  return (
    <footer className="band site-footer" lang={LOCALE_TAGS[locale]}>
      {/* ------------------------------------------------------- văn phòng */}
      <div className="wrap site-footer__office">
        <div className="site-footer__office-text">
          <Logo variant="plate" height={44} />
          <p className="site-footer__motto">{t.motto}</p>
          <p className="site-footer__legal-name">{legal.company}</p>

          <dl className="site-footer__contact">
            <div>
              <dt>{t.hq}</dt>
              <dd>{brand.headquarters}</dd>
            </div>
            {tel ? (
              <div>
                <dt>{t.phone}</dt>
                <dd>
                  <a href={tel}>{brand.phone}</a>
                </dd>
              </div>
            ) : null}
            {brand.email ? (
              <div>
                <dt>{t.email}</dt>
                <dd>
                  <a href={`mailto:${brand.email}`}>{brand.email}</a>
                </dd>
              </div>
            ) : null}
            {brand.website ? (
              <div>
                <dt>{t.website}</dt>
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
              <h2 className="site-footer__h">{t.social}</h2>
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
          title={fill(t.mapTitle, { name: brand.fullName })}
          directionsLabel={t.directions}
        />
      </div>

      {/* --------------------------------------------------- sơ đồ trang */}
      <div className="wrap site-footer__cols">
        <nav aria-label={t.learn}>
          <h2 className="site-footer__h">{t.learn}</h2>
          <ul>
            <li>
              <Link href="/chuong-trinh">{t.links.program}</Link>
            </li>
            <li>
              <Link href="/lop-hoc-ai">{t.links.classroom}</Link>
            </li>
            <li>
              <Link href="/giao-vien-ai">{t.links.team}</Link>
            </li>
            <li>
              <Link href="/hoc-phi">{t.links.pricing}</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t.account}>
          <h2 className="site-footer__h">{t.account}</h2>
          <ul>
            <li>
              <Link href="/dang-ky">{t.links.signup}</Link>
            </li>
            <li>
              <Link href="/dang-nhap">{t.links.signin}</Link>
            </li>
            <li>
              <Link href="/cau-hoi">{t.links.faq}</Link>
            </li>
            <li>
              <Link href="/quy-che-thi">{t.links.placementRules}</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t.legal}>
          <h2 className="site-footer__h">{t.legal}</h2>
          <ul>
            <li>
              <Link href="/dieu-khoan">{t.links.terms}</Link>
            </li>
            <li>
              <Link href="/rieng-tu">{t.links.privacy}</Link>
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
            <h2 className="site-footer__h">{t.offices}</h2>
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
            © {new Date().getFullYear()} {brand.fullName}. {fill(t.rights, { name: brand.fullName })}{" "}
            {t.aiNote}
          </p>
          <ul className="site-footer__legal-links">
            <li>
              <Link href="/rieng-tu">{t.links.privacy}</Link>
            </li>
            <li>
              <Link href="/dieu-khoan">{t.links.terms}</Link>
            </li>
            <li>
              <Link href="/quy-che-thi">{t.links.placementShort}</Link>
            </li>
          </ul>
        </div>

        {missing.length > 0 && (
          <div className="wrap">
            <p className="site-footer__pending">
              {fill(t.missing.sentence, { list: missing.join(listSep) })}
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}
