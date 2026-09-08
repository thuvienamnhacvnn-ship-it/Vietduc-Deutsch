/**
 * Thương hiệu. Đổi ở đây là đổi toàn bộ giao diện, metadata, email và logo -
 * không có chuỗi thương hiệu nào rải rác trong component.
 *
 * Đây là nền tảng dạy tiếng Đức trực tuyến của Việt Đức Group. Logo là ngọn lửa
 * ghép từ cờ Việt Nam và cờ Đức; hệ màu lấy trực tiếp từ tệp logo, xem
 * src/styles/tokens.css.
 */
export const brand = {
  name: "Việt Đức",
  /** Tên đầy đủ của pháp nhân, dùng ở chân trang và trang pháp lý. */
  fullName: "Việt Đức Group",
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
  email: "info@vietducgroup.vn",
  /**
   * Chỉ những mạng xã hội có URL thật mới được render. Danh sách rỗng là đúng
   * cho tới khi chủ dự án cung cấp đường dẫn - không dựng icon dẫn tới "#".
   */
  social: [] as { label: string; href: string }[],
  /** Pháp nhân: điền trước khi mở bán. Chưa có thì trang pháp lý tự ghi rõ. */
  legalEntity: null as null | {
    company: string;
    address: string;
    register: string;
    vatId: string;
    responsible: string;
  },
} as const;

export type Brand = typeof brand;
