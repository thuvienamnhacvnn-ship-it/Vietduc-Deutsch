import type { Level } from "@/lib/db/schema";

/**
 * Bản đồ chương trình A1-B2.
 *
 * Đây là KHUNG mục tiêu giao tiếp, tham chiếu mô tả CEFR, viết lại bằng ngôn
 * ngữ của người học Việt Nam. Nó không sao chép giáo trình thương mại nào.
 *
 * Khung này là thứ trang giới thiệu và trang chương trình đọc. Nội dung bài học
 * thật (hội thoại, audio, bài tập) nằm trong cơ sở dữ liệu, có phiên bản và phải
 * qua duyệt - xem CONTENT_COVERAGE.md để biết đã phủ tới đâu.
 */

export type LevelPlan = {
  level: Level;
  /** Câu mô tả người học ở cấp này làm được gì, nói ở ngôi thứ hai. */
  headline: string;
  summary: string;
  /** Chủ đề giao tiếp. */
  topics: string[];
  /** Trọng tâm ngữ pháp và cấu trúc. */
  structures: string[];
  /** Mục tiêu "có thể làm" - dùng cho cả đo độ phủ nội dung. */
  canDo: string[];
  /** Số giờ học tự đánh giá, KHÔNG phải cam kết thời gian đạt trình độ. */
  typicalHours: string;
  accent: string;
};

export const CURRICULUM: LevelPlan[] = [
  {
    level: "A1",
    headline: "Bắt đầu từ con số không, nói được những câu đầu tiên",
    summary:
      "Bạn chào hỏi, giới thiệu bản thân, hỏi và trả lời thông tin cơ bản, mua sắm và gọi món. Mọi giải thích đều bằng tiếng Việt; tiếng Đức xuất hiện từng câu ngắn để bạn nói được ngay trong buổi đầu.",
    topics: [
      "Chào hỏi và làm quen",
      "Thông tin cá nhân",
      "Số, giờ và ngày tháng",
      "Gia đình và người quen",
      "Mua sắm hằng ngày",
      "Đồ ăn, thức uống, gọi món",
      "Địa điểm và hỏi đường ngắn",
    ],
    structures: [
      "Câu đơn và trật tự từ cơ bản",
      "Động từ thường và động từ bất quy tắc hay dùng",
      "Câu hỏi có từ để hỏi và câu hỏi có/không",
      "Phủ định với nicht và kein",
      "Mạo từ xác định, không xác định và giống của danh từ",
    ],
    canDo: [
      "Tự giới thiệu tên, tuổi, nơi ở và nghề nghiệp",
      "Hỏi giá và mua một món đồ trong cửa hàng",
      "Gọi món và trả tiền ở quán",
      "Hiểu thông báo ngắn, đơn giản khi được nói chậm",
      "Viết một tin nhắn ngắn cho bạn cùng nhà",
    ],
    typicalHours: "khoảng 100-150 giờ học",
    accent: "var(--skill-speaking)",
  },
  {
    level: "A2",
    headline: "Xoay xở được những việc thường ngày ở Đức",
    summary:
      "Bạn kể lại việc đã xảy ra, hẹn lịch, nói về sức khỏe và công việc, xử lý những cuộc trao đổi ngắn ở cơ quan hành chính hoặc phòng khám.",
    topics: [
      "Nhà ở và tìm phòng",
      "Sức khỏe và đi khám",
      "Công việc và một ngày làm việc",
      "Đi lại, tàu xe, mua vé",
      "Đặt và đổi cuộc hẹn",
      "Kể lại trải nghiệm đã qua",
    ],
    structures: [
      "Thì quá khứ Perfekt để kể chuyện",
      "Praeteritum của sein, haben và động từ khuyết thiếu",
      "Động từ khuyết thiếu đầy đủ",
      "Liên từ und, aber, denn, weil",
      "Giới từ chỉ nơi chốn và thời gian với cách đi kèm",
    ],
    canDo: [
      "Kể lại một ngày hoặc một chuyến đi đã qua",
      "Đặt lịch hẹn qua điện thoại và đổi lịch khi cần",
      "Mô tả triệu chứng cho bác sĩ",
      "Hiểu ý chính trong thông báo ngắn ở nơi làm việc",
      "Viết email ngắn xin nghỉ hoặc hỏi thông tin",
    ],
    typicalHours: "khoảng 150-200 giờ học",
    accent: "var(--skill-listening)",
  },
  {
    level: "B1",
    headline: "Tự xoay xở độc lập trong hoàn cảnh quen thuộc",
    summary:
      "Bạn giải thích được vấn đề, trình bày kế hoạch, nêu ý kiến và bảo vệ nó ở mức đơn giản, viết email công việc rõ ràng. Đây là mốc nhiều thủ tục ở Đức bắt đầu yêu cầu.",
    topics: [
      "Giải quyết trục trặc: hàng lỗi, hợp đồng, khiếu nại",
      "Kế hoạch học tập và nghề nghiệp",
      "Kể chuyện dài hơn, có mở và kết",
      "Email và thư trang trọng",
      "Nêu quan điểm cá nhân và lý do",
      "Truyền thông, tin tức đời sống",
    ],
    structures: [
      "Mệnh đề phụ với dass, wenn, obwohl, damit",
      "Bị động ở thì hiện tại và quá khứ",
      "Konjunktiv II cho đề nghị lịch sự và giả định",
      "Câu quan hệ",
      "Tính từ đứng trước danh từ và biến đuôi",
    ],
    canDo: [
      "Khiếu nại một dịch vụ và đề xuất cách giải quyết",
      "Trình bày kế hoạch trong 2-3 phút liền mạch",
      "Viết email trang trọng đúng giọng điệu",
      "Hiểu ý chính của một cuộc trao đổi giữa người bản xứ nói ở tốc độ vừa",
      "Nêu ý kiến và giải thích lý do đằng sau",
    ],
    typicalHours: "khoảng 200-300 giờ học",
    accent: "var(--skill-reading)",
  },
  {
    level: "B2",
    headline: "Thảo luận, lập luận và làm việc bằng tiếng Đức",
    summary:
      "Bạn tham gia thảo luận, bảo vệ lập luận, thuyết trình, đọc văn bản dài và viết văn bản có cấu trúc. Đây là mức nhiều chương trình Ausbildung và nơi làm việc yêu cầu.",
    topics: [
      "Thảo luận và phản biện",
      "Thuyết trình có cấu trúc",
      "Giao tiếp trong môi trường làm việc",
      "Văn bản dài: báo cáo, bài báo, hướng dẫn",
      "Chủ đề xã hội và nghề nghiệp",
      "Phỏng vấn và đàm phán ở mức cơ bản",
    ],
    structures: [
      "Konjunktiv I trong lời dẫn gián tiếp",
      "Danh hóa động từ và văn phong viết",
      "Cấu trúc phức: mệnh đề lồng, phân từ",
      "Từ nối lập luận và sắc thái nhấn mạnh",
      "Cụm động từ - danh từ cố định trong văn phong công việc",
    ],
    canDo: [
      "Bảo vệ một quan điểm trong tranh luận và phản hồi ý kiến trái chiều",
      "Thuyết trình 5-10 phút có mở, thân, kết",
      "Đọc và tóm tắt một bài báo dài",
      "Viết thư khiếu nại hoặc báo cáo có cấu trúc",
      "Tham gia họp và nêu ý kiến đúng lúc",
    ],
    typicalHours: "khoảng 250-400 giờ học",
    accent: "var(--skill-writing)",
  },
];

/** Chu trình dạy trong một buổi học - dùng ở trang "Lớp học hoạt động thế nào". */
export const TEACHING_CYCLE = [
  {
    step: "Gợi nhớ",
    detail:
      "Giáo viên hỏi lại vài điểm của buổi trước. Không phải để chấm, mà để biết hôm nay bắt đầu từ đâu.",
  },
  {
    step: "Đặt tình huống",
    detail: "Một hoàn cảnh có thật: quầy bánh mì, phòng khám, buổi phỏng vấn Ausbildung.",
  },
  {
    step: "Câu mẫu",
    detail: "Vài câu ngắn, đọc chậm được, có giải thích bằng tiếng Việt khi bạn cần.",
  },
  {
    step: "Luyện có hướng dẫn",
    detail: "Bạn nói theo, giáo viên gợi ý trước khi đưa đáp án và cho bạn thời gian nghĩ.",
  },
  {
    step: "Nhập vai tự do",
    detail: "Bạn giữ vai của mình trong tình huống đó. Đây là phần nói nhiều nhất.",
  },
  {
    step: "Phản hồi",
    detail:
      "Một hoặc hai lỗi trọng tâm, giải thích ngắn, rồi thử lại. Bạn chọn được sửa ngay hay tổng kết cuối lượt.",
  },
  {
    step: "Kiểm tra cuối bài",
    detail: "Vài câu ngắn để xem mục tiêu của bài đã đạt chưa.",
  },
  {
    step: "Lên lịch ôn",
    detail: "Từ và lỗi cần nhớ được xếp lịch ôn lại, dựa trên kết quả thật của bạn.",
  },
];
