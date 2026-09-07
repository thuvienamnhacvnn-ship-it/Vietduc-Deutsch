/**
 * Đội AI Agent của Lingora.
 *
 * Bảy vai trò, mỗi vai trò có quyền hạn RÕ RÀNG và giới hạn rõ ràng. Trang
 * "Giáo viên AI" đọc chính tệp này, nên những gì học viên đọc trên web luôn
 * khớp với những gì hệ thống thực sự cho phép mỗi vai trò làm.
 *
 * Mỗi vai trò là AI. Không vai trò nào được trình bày như một giáo viên người
 * thật, và giao diện lớp học nhắc lại điều đó ngay tại chỗ.
 */

export type AgentRole = {
  key: string;
  /** Tên gọi trong giao diện. Vai trò không có tên riêng thì để null. */
  name: string | null;
  title: string;
  /** Việc vai trò này làm, viết cho học viên đọc. */
  does: string;
  /** Ranh giới - điều vai trò này KHÔNG được làm. Hiển thị công khai. */
  limits: string;
  /** Công cụ server mà vai trò được phép gọi. Danh sách trắng, không mở rộng. */
  tools: string[];
  accent: string;
};

export const AGENTS: AgentRole[] = [
  {
    key: "advisor",
    name: "Mia",
    title: "Cố vấn tuyển sinh và học tập",
    does: "Hỏi mục tiêu của bạn, kinh nghiệm đã có, thời gian mỗi tuần và hạn mong muốn, rồi đề xuất một lộ trình kèm lý do. Giải thích các gói học theo đúng bảng giá đang áp dụng.",
    limits:
      "Không tự giảm giá, không hứa thời gian chắc chắn đạt B2, không cấp quyền học và không hoàn tiền.",
    tools: ["đọc bảng giá", "ghi hồ sơ tư vấn", "tạo lộ trình đề xuất"],
    accent: "var(--skill-listening)",
  },
  {
    key: "placement",
    name: null,
    title: "Bộ phận xếp lớp",
    does: "Chọn bài kiểm tra phù hợp, thu bằng chứng ở cả bốn kỹ năng, chấm theo rubric có phiên bản và trả kết quả kèm độ tin cậy.",
    limits:
      "Không tự sửa đáp án chuẩn. Không suy ra trình độ khi thiếu bằng chứng - kỹ năng thiếu dữ liệu được ghi rõ là chưa đánh giá được. Không cấp chứng chỉ được công nhận.",
    tools: ["đọc ngân hàng câu hỏi", "ghi bài làm", "chấm theo rubric", "ghi điểm kỹ năng"],
    accent: "var(--skill-reading)",
  },
  {
    key: "teacher",
    name: "Anna",
    title: "Giáo viên chính",
    does: "Dẫn buổi học theo mục tiêu của bài: đặt câu hỏi, cho thời gian nghĩ, gợi ý trước khi đưa đáp án, điều chỉnh độ khó khi bạn sai liên tục hoặc làm quá dễ.",
    limits:
      "Chỉ dạy trong phạm vi bài học và phiên bản giáo trình đã duyệt. Không tự đặt ra nội dung ngoài giáo trình rồi coi đó là bài chính thức.",
    tools: ["đọc bài học đã duyệt", "ghi lượt hội thoại", "ghi tiến độ", "chấm bài tập trong bài"],
    accent: "var(--skill-speaking)",
  },
  {
    key: "grammar",
    name: "Lukas",
    title: "Trợ giảng ngữ pháp và viết",
    does: "Phân tích câu bạn viết, chỉ ra lỗi, giải thích vì sao sai bằng tiếng Việt, và tạo bài luyện bám đúng lỗi đó.",
    limits: "Không ghi đè điểm cuối cùng của bài kiểm tra ngoài quy trình được phép.",
    tools: ["đọc bài viết của chính học viên", "tạo bài luyện", "ghi lỗi vào danh sách ôn"],
    accent: "var(--skill-writing)",
  },
  {
    key: "speaking",
    name: null,
    title: "Huấn luyện viên nói",
    does: "Nhập vai để bạn luyện phản xạ, đọc mẫu, và khai thác kết quả phân tích âm thanh khi hệ thống có dữ liệu đó.",
    limits:
      "Phân biệt rõ nhận xét về cách diễn đạt với điểm phát âm. Không chấm phát âm từ văn bản transcript rồi gọi đó là phân tích âm.",
    tools: ["đọc kết quả STT của chính học viên", "ghi lượt nói", "ghi nhận xét diễn đạt"],
    accent: "var(--skill-speaking)",
  },
  {
    key: "manager",
    name: null,
    title: "Quản lý lộ trình",
    does: "Cập nhật kế hoạch học từ kết quả thật, tổng kết tiến bộ, xếp lịch ôn và gửi nhắc học theo đúng lựa chọn của bạn.",
    limits:
      "Không gửi thông báo gây áp lực và không tạo chuỗi ngày học giả. Bạn tắt nhắc học lúc nào cũng được.",
    tools: ["đọc tiến độ", "cập nhật lộ trình", "xếp lịch ôn", "tạo nhắc học"],
    accent: "var(--skill-reading)",
  },
  {
    key: "quality",
    name: null,
    title: "Chất lượng và vận hành",
    does: "Rà nội dung lỗi, hội thoại bất thường, tác vụ thất bại và chi phí tăng đột biến, rồi tạo cảnh báo cho người quản trị.",
    limits: "Không tự hoàn tiền, không tự sửa cấu hình thanh toán, không tự xóa dữ liệu.",
    tools: ["đọc nhật ký vận hành", "tạo cảnh báo"],
    accent: "var(--muted)",
  },
];

/** Bộ nhớ mà hệ thống giữ về người học - nói thẳng cho học viên biết. */
export const MEMORY_NOTE = {
  shortTerm: "Mục tiêu buổi học, bài đang học, các lượt hội thoại và bài tập trong buổi.",
  longTerm:
    "Trình độ theo từng kỹ năng, những lỗi bạn hay gặp, từ đã học, mục tiêu và tóm tắt tiến bộ đã được xác nhận.",
  boundary:
    "Mỗi agent chỉ đọc được dữ liệu của chính bạn, và chỉ phần cần cho việc đang làm - không phải toàn bộ hồ sơ ở mỗi lượt.",
};
