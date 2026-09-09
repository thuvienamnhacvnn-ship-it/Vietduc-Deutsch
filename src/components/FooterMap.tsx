/**
 * Trụ sở trên bản đồ, kèm một lối mở sang ứng dụng chỉ đường.
 *
 * Dùng OpenStreetMap chứ không dùng bản nhúng thương mại: nó không đặt cookie
 * và không theo dõi, nên bản đồ được phép có mặt trên trang trước khi người
 * dùng trả lời thông báo cookie - đúng như trang quyền riêng tư đã hứa.
 *
 * Ghim đặt theo địa chỉ, còn nút "Chỉ đường" thì tìm theo địa chỉ viết ra: dịch
 * vụ bản đồ nào của khách cũng ra đúng toà nhà, kể cả khi ghim lệch vài mét.
 *
 * Lấy nguyên từ dự án vietducgroup, chỉ đổi CSS Module sang lớp trong
 * globals.css cho khớp cách làm của bản này.
 */
export function FooterMap({
  address,
  bbox,
  marker,
  title,
  directionsLabel,
}: {
  address: string;
  /** trái,dưới,phải,trên - khung nhìn OpenStreetMap phải vẽ. */
  bbox: string;
  /** "vĩ độ,kinh độ" của ghim. */
  marker: string;
  title: string;
  directionsLabel: string;
}) {
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div className="footer-map">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="footer-map__frame"
      />
      <a
        href={directions}
        target="_blank"
        rel="noopener noreferrer"
        className="footer-map__directions"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path
            d="M12 21s7-6.4 7-11.4A7 7 0 0 0 5 9.6C5 14.6 12 21 12 21Z"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9.5" r="2.4" />
        </svg>
        {directionsLabel}
      </a>
    </div>
  );
}
