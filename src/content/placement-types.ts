import type { Level, Skill } from "@/lib/db/schema";

/**
 * Kiểu dữ liệu của câu hỏi xếp lớp, tách riêng khỏi nội dung.
 *
 * Tách ra vì ngân hàng câu hỏi giờ nằm ở nhiều tệp (một tệp mỗi cấp độ) còn
 * `placement.ts` là chỗ gom lại; để kiểu ở đó thì các tệp cấp độ và tệp gom
 * import vòng vào nhau.
 */

export type McqItem = {
  code: string;
  kind: "mcq";
  level: Level;
  skill: Skill;
  /** Câu dẫn. Tiếng Đức cho phần nội dung, tiếng Việt cho phần hỏi. */
  prompt: string;
  /** Đoạn văn đọc, nếu có. */
  passage?: string;
  /**
   * Câu tiếng Đức sẽ được đọc lên cho phần Nghe. Người học không nhìn thấy chữ
   * này - đó là điểm khác biệt giữa kỹ năng Nghe và kỹ năng Đọc.
   */
  audioText?: string;
  options: string[];
  answer: number;
  /** Vì sao đáp án đúng, viết cho người học đọc sau khi làm xong. */
  why: string;
};

/**
 * Câu điền đáp án: người học GÕ từ vào chỗ trống thay vì chọn trong bốn phương
 * án. Khó hơn trắc nghiệm thật sự - không đoán mò được, và nó đo được việc nhớ
 * hình thái từ chứ không chỉ nhận ra mặt chữ.
 */
export type GapItem = {
  code: string;
  kind: "gap";
  level: Level;
  skill: Skill;
  /** Câu có dấu ___ ở chỗ cần điền. */
  prompt: string;
  passage?: string;
  audioText?: string;
  /** Gợi ý dạng nguyên thể hoặc nghĩa, để đây không thành câu đố mẹo. */
  hint: string;
  /**
   * Mọi cách viết được chấp nhận. Luôn ghi cả biến thể không dấu Đức
   * (heisse cho heiße) - người học gõ trên bàn phím Việt không có ß.
   */
  accept: string[];
  why: string;
};

export type WriteItem = {
  code: string;
  kind: "write";
  level: Level;
  skill: "writing";
  prompt: string;
  hint: string;
  minWords: number;
  /**
   * Những dấu hiệu KIỂM TRA ĐƯỢC bằng máy: từ khóa chủ đề và cấu trúc bắt buộc.
   * Chúng cho một tín hiệu thật nhưng hẹp, nên điểm viết luôn được đánh dấu là
   * sơ bộ cho tới khi có người hoặc mô hình chấm theo rubric đầy đủ.
   */
  expectPatterns: { label: string; any: string[] }[];
};

export type SpeakItem = {
  code: string;
  kind: "speak";
  level: Level;
  skill: "speaking";
  prompt: string;
  hint: string;
};

export type PlacementItem = McqItem | GapItem | WriteItem | SpeakItem;
