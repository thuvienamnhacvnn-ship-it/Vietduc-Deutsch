/**
 * Thương hiệu. Đổi ở đây là đổi toàn bộ giao diện, metadata, email và logo -
 * không có chuỗi thương hiệu nào rải rác trong component.
 *
 * Đây là nền tảng dạy tiếng Đức trực tuyến của Việt Đức Group. Logo là ngọn lửa
 * ghép từ cờ Việt Nam và cờ Đức; hệ màu lấy trực tiếp từ tệp logo, xem
 * src/styles/tokens.css.
 *
 * THÔNG TIN TỔ CHỨC lấy nguyên từ dự án vietducgroup (src/lib/site-config.ts):
 * tên pháp nhân, trụ sở, hai văn phòng, điện thoại, email, website. Ở đó có một
 * quy tắc mà bản này giữ nguyên: chuỗi rỗng nghĩa là "chưa cấu hình", và giao
 * diện khi ấy phải không hiện gì cả, chứ không hiện chỗ trống hay một đường dẫn
 * đoán bừa.
 */
export const brand = {
  name: "Việt Đức",
  /** Tên đầy đủ của pháp nhân, dùng ở chân trang và trang pháp lý. */
  fullName: "Việt Đức Group",
  /** Khẩu hiệu của tập đoàn, dùng nguyên văn ở chân trang. */
  motto: "Kiến tạo tri thức – Dẫn lối tương lai",
  tagline: {
    vi: "Học tiếng Đức trực tuyến A1–B2",
    de: "Deutsch online lernen, A1–B2",
  },
  /**
   * Tiêu đề hero. Ngắn có chủ đích: ở 1440px một câu dài sẽ vỡ thành sáu dòng
   * và mất hết sức nặng. Phần còn lại của lời hứa nằm ở `promise` bên dưới.
   */
  headline: {
    vi: "Nói được tiếng Đức trong đời sống thật ở Đức",
    de: "Deutsch, das im echten Alltag trägt",
  },
  /** Câu hứa học tập đầy đủ. Nói được điều gì, không hứa đỗ thi. */
  promise: {
    vi: "Từ câu chào đầu tiên đến buổi phỏng vấn Ausbildung — bạn nói, cô Anna nghe và trả lời.",
    de: "Vom ersten Gruß bis zum Ausbildungsgespräch — Sie sprechen, Anna hört zu und antwortet.",
  },
  email: "info@vietducgroup.com.vn",
  phone: "024 3 123 6868",
  /** Dạng E.164 cho thuộc tính href="tel:", tách khỏi dạng để đọc. */
  phoneE164: "+842431236868",
  website: "https://www.vietducgroup.com.vn",
  /**
   * Chỉ những mạng xã hội có URL thật mới được render. Danh sách rỗng là đúng
   * cho tới khi chủ dự án cung cấp đường dẫn - không dựng icon dẫn tới "#".
   */
  social: [] as { label: string; href: string }[],
  /**
   * Trụ sở và các văn phòng. Trụ sở là địa chỉ ghi trên giấy tờ và cũng là điểm
   * được ghim trên bản đồ ở chân trang.
   */
  headquarters:
    "Tầng 4, Toà nhà Rainbow, số 79 Đường 19/5, KĐTM Văn Quán, Phường Hà Đông, Thành phố Hà Nội, Việt Nam",
  offices: [
    {
      city: "Hà Nội",
      address:
        "Tầng 4, Toà nhà Rainbow, số 79 Đường 19/5, KĐTM Văn Quán, Phường Hà Đông, Thành phố Hà Nội, Việt Nam",
    },
    { city: "Quảng Trị", address: "Phường Đồng Thuận, Tỉnh Quảng Trị, Việt Nam" },
  ],
  /**
   * Khung nhìn bản đồ trụ sở: Văn Quán, Hà Đông. Ghim đặt theo địa chỉ, còn nút
   * "Chỉ đường" thì tìm theo địa chỉ viết ra, nên dịch vụ bản đồ nào cũng ra
   * đúng toà nhà kể cả khi ghim lệch vài mét.
   */
  map: { bbox: "105.7690,20.9660,105.7900,20.9780", marker: "20.9718,105.7793" },
  /**
   * Pháp nhân. Tên và địa chỉ đã có từ hồ sơ tập đoàn; mã số doanh nghiệp, mã
   * số thuế và người chịu trách nhiệm nội dung thì chưa - `null` để trang pháp
   * lý tự ghi rõ còn thiếu gì, thay vì bịa.
   */
  legalEntity: {
    company: "Công ty Cổ phần Tập đoàn Đầu tư và Giáo dục Quốc tế Việt Đức",
    address:
      "Tầng 4, Toà nhà Rainbow, số 79 Đường 19/5, KĐTM Văn Quán, Phường Hà Đông, Thành phố Hà Nội, Việt Nam",
    register: null as string | null,
    vatId: null as string | null,
    responsible: null as string | null,
  },
} as const;

export type Brand = typeof brand;

/** href="tel:" từ số đọc được. Rỗng thì trả null để giao diện bỏ hẳn dòng đó. */
export function telHref(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}
