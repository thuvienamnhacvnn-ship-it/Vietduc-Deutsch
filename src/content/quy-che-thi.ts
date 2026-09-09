/**
 * QUY CHẾ BÀI KIỂM TRA XẾP LỚP
 *
 * Trước đây bài kiểm tra chỉ là một chuỗi câu hỏi: không có quy định về điều
 * kiện làm bài, nghe lại vô hạn, không ghi thời gian, không có hồ sơ bài thi.
 * Kết quả từ một bài như thế không dùng để xếp lớp cho ai được, vì không ai
 * biết nó được tạo ra trong điều kiện nào.
 *
 * Tệp này là quy chế: cấu trúc, điều kiện, cách chấm và hiệu lực. Nó vừa là
 * cấu hình mà mã nguồn đọc, vừa là văn bản mà học viên đọc - hai thứ đó phải
 * là MỘT, nếu không quy chế công bố sẽ trôi khỏi hành vi thật của hệ thống.
 *
 * Tham chiếu khung CEFR cho mô tả trình độ. Đây KHÔNG phải kỳ thi được công
 * nhận và không cấp chứng chỉ; xem `DISCLAIMER` cuối tệp.
 */

import type { Level, Skill } from "@/lib/db/schema";

/** Phiên bản quy chế. Mỗi bài thi ghi lại phiên bản đã áp dụng cho nó. */
export const REGULATION_VERSION = "2.0";

/** Kết quả xếp lớp có hiệu lực bao lâu trước khi nên kiểm tra lại. */
export const RESULT_VALID_DAYS = 180;

/**
 * Số lần được nghe mỗi đoạn audio.
 *
 * Nghe lại vô hạn thì phần Nghe biến thành phần Đọc chép chậm: người học tua đi
 * tua lại tới khi bắt được từng từ, và điểm không còn nói lên khả năng nghe
 * hiểu nữa. Kỳ thi thật cho nghe một tới hai lần; ta lấy hai cho A1-A2 vì người
 * mới cần một lần để làm quen giọng, và hai cho các cấp trên.
 */
export const LISTEN_LIMIT: Record<Level, number> = {
  A1: 2,
  A2: 2,
  B1: 2,
  B2: 2,
};

/**
 * Thời lượng khuyến nghị cho từng phần, tính bằng phút. Không cắt ngang bài.
 *
 * Ngắn hơn bản trước vì bài đã đổi cách chạy: thay vì bò từ A1 lên B2, bài
 * phân nhánh theo sức người làm và chỉ hỏi khoảng 18 câu chấm máy. Ghi 38 phút
 * cho một bài thật ra dài 20 phút là tự dựng lên một rào cản không có thật -
 * người học nhìn con số rồi hẹn "để hôm khác".
 */
export const SECTION_MINUTES: Record<Skill, number> = {
  reading: 8,
  listening: 5,
  writing: 12,
  speaking: 3,
};

export type Section = {
  skill: Skill;
  title: string;
  /** Người học đọc gì trước khi vào phần này. */
  what: string;
  /** Điều kiện làm bài của riêng phần này. */
  rules: string[];
};

export const SECTIONS: Section[] = [
  {
    skill: "reading",
    title: "Đọc hiểu và cấu trúc",
    what: "Ba khối câu ngắn, đoạn văn và bài tập điền từ. Khối đầu để định mức, hai khối sau chọn theo kết quả của bạn.",
    rules: [
      "Mỗi câu chỉ trả lời một lần, không quay lại câu đã làm.",
      "Làm tốt thì khối sau khó lên, làm đuối thì khối sau nhẹ xuống — bài đi theo sức bạn.",
      "Làm rất thấp ở khối dễ nhất thì phần này dừng: đã đủ căn cứ để xếp lớp, hỏi thêm chỉ mất thời gian của bạn.",
    ],
  },
  {
    skill: "listening",
    title: "Nghe hiểu",
    what: "Hai khối câu và đoạn thoại tiếng Đức được đọc lên, kèm câu hỏi hiểu ý. Bắt đầu ở mức vừa với phần Đọc của bạn.",
    rules: [
      `Mỗi đoạn được nghe tối đa ${LISTEN_LIMIT.A1} lần. Hệ thống đếm và hiện số lần còn lại.`,
      "Nghe chậm tính là một lần nghe.",
      "Thiết bị không phát được tiếng Đức thì bỏ qua; câu bỏ qua không bị tính là sai.",
    ],
  },
  {
    skill: "writing",
    title: "Viết",
    what: "Một đề mở, chọn đúng cấp độ mà bạn vừa đạt ở phần Đọc.",
    rules: [
      "Viết trực tiếp trong ô, không dán từ nơi khác.",
      "Có yêu cầu độ dài tối thiểu; viết ngắn hơn thì không đủ căn cứ để chấm.",
    ],
  },
  {
    skill: "speaking",
    title: "Nói",
    what: "Một đề nói ngắn, ghi âm trực tiếp qua micro.",
    rules: [
      "Không bắt buộc. Bỏ qua thì kỹ năng Nói được ghi là chưa đánh giá được.",
      "Bản ghi tối đa 90 giây, nghe lại và ghi lại được trước khi gửi.",
    ],
  },
];

/**
 * Cam kết của người làm bài. Tick vào là một hành động có ý nghĩa: nó được ghi
 * vào hồ sơ bài thi cùng thời điểm và địa chỉ IP.
 */
/**
 * Quyền của người làm bài. Đặt ngay trước phần cam kết, vì một bản quy chế chỉ
 * liệt kê nghĩa vụ thì đọc như một cái bẫy.
 */
export const LEARNER_RIGHTS = [
  "Bạn dừng bài bất cứ lúc nào. Phần đã làm vẫn được chấm và bạn vẫn nhận được khoá học phù hợp, kết quả chỉ ghi rõ là bài dừng sớm.",
  "Mỗi lần làm là một đề khác, rút từ ngân hàng câu hỏi và tránh những câu bạn đã gặp lần trước.",
  "Bạn làm lại bài bất cứ lúc nào; kết quả mới thay cho kết quả cũ.",
  "Kỹ năng nào không đủ bằng chứng thì được ghi là chưa đánh giá được, chứ không bị đoán bừa một mức.",
];

export const HONESTY_PLEDGE = [
  "Tôi tự làm bài một mình, không nhờ người khác trả lời hộ.",
  "Tôi không dùng từ điển, công cụ dịch hay trợ lý AI trong lúc làm bài.",
  "Tôi hiểu kết quả này dùng để xếp lớp cho chính tôi, nên làm sai lệch nó chỉ khiến tôi học ở mức không phù hợp.",
];

/** Cách chấm từng kỹ năng, công bố cho học viên đọc trước khi làm. */
export const SCORING = [
  {
    skill: "reading" as Skill,
    how: "Chấm tự động theo đáp án chuẩn. Mức của bạn là cấp cao nhất mà bạn làm đúng từ 60% trở lên trong khối của cấp đó.",
    confidence: "Độ tin cậy tăng theo số khối bạn làm qua, tối đa 90%. Bài dừng sớm thì độ tin cậy bị hạ.",
  },
  {
    skill: "listening" as Skill,
    how: "Chấm tự động theo đáp án chuẩn, cùng quy tắc với phần Đọc.",
    confidence: "Câu bỏ qua vì thiết bị không phát được bị loại khỏi phép tính.",
  },
  {
    skill: "writing" as Skill,
    how: "Chấm phần kiểm được tự động: đủ độ dài và có mặt các cấu trúc đề yêu cầu.",
    confidence:
      "Độ tin cậy 30%, vì mạch lạc, từ vựng và độ chính xác ngữ pháp chưa được chấm. Đây là điểm sơ bộ.",
  },
  {
    skill: "speaking" as Skill,
    how: "Bản ghi được lưu làm bằng chứng nhưng chưa được chấm.",
    confidence:
      "Luôn ghi là chưa đánh giá được. Chúng tôi không suy mức Nói từ điểm các kỹ năng khác.",
  },
];

/** Những gì kết quả này KHÔNG phải. Hiển thị trên phiếu kết quả. */
export const DISCLAIMER = [
  "Đây là bài kiểm tra xếp lớp nội bộ của Việt Đức, không phải kỳ thi được công nhận.",
  "Kết quả không phải chứng chỉ CEFR và không thay thế chứng chỉ do các tổ chức khảo thí cấp.",
  `Kết quả có giá trị tham khảo trong ${RESULT_VALID_DAYS} ngày kể từ ngày làm bài.`,
];

/**
 * Mã bài thi hiển thị cho học viên và dùng khi liên hệ hỗ trợ.
 * Dạng VD-XL-<id bài thi>-<ngày>, đủ để tra ra đúng một bản ghi.
 */
export function examCode(sessionId: number, startedAt: Date): string {
  const ngay = startedAt.toISOString().slice(0, 10).replace(/-/g, "");
  return `VD-XL-${String(sessionId).padStart(5, "0")}-${ngay}`;
}
