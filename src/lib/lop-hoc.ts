import "server-only";

import type { Level } from "@/lib/db/schema";
import { chatJson, type ChatMessage } from "@/lib/adapters/llm";

/**
 * Buổi học nói với cô Anna.
 *
 * Đây là chỗ biến một mô hình ngôn ngữ chung chung thành một giáo viên tiếng Đức
 * cho người Việt. Bốn ràng buộc, và cả bốn đều đến từ việc dạy chứ không từ kỹ
 * thuật:
 *
 * 1. **Nói ở đúng mức người học.** Đưa câu B2 cho người A1 thì họ im lặng và
 *    thoát. Mức nằm trong lời nhắc và được nhắc lại ở mỗi lượt, vì mô hình nhỏ
 *    quên rất nhanh.
 * 2. **Sửa MỘT lỗi mỗi lượt.** Sửa hết mọi lỗi của một câu A1 thì người học
 *    nhận về một trang đỏ và bỏ cuộc. Chọn lỗi cản trở việc hiểu nhiều nhất.
 * 3. **Giải thích bằng tiếng Việt, nói bằng tiếng Đức.** Người mới không học
 *    được ngữ pháp Đức bằng tiếng Đức; nhưng nghe và nói thì phải là tiếng Đức
 *    thật, không pha.
 * 4. **Không chấm điểm trong lớp.** Lớp học là chỗ tập, không phải chỗ thi. Mức
 *    trình độ chỉ đổi qua bài kiểm tra xếp lớp, nơi có quy chế và hồ sơ.
 */

export type ClassTurn = {
  /** Tiếng Đức Anna nói ra. Đây là phần được đọc thành tiếng. */
  replyDe: string;
  /** Nghĩa tiếng Việt của câu trên, cho người mới bám theo. */
  glossVi: string;
  /** Một lỗi được sửa, hoặc null khi câu của người học đã dùng được. */
  correction: { wrong: string; right: string; why: string } | null;
  /** Gợi ý để người học nói tiếp - lớp học không được để rơi vào im lặng. */
  hintVi: string;
};

export type Lesson = {
  code: string;
  level: Level;
  title: string;
  /** Tình huống của buổi học, viết cho người học đọc. */
  situationVi: string;
  /** Việc người học phải làm được khi hết buổi. */
  goalVi: string;
  /** Câu Anna mở lời. Cố định để buổi học luôn bắt đầu giống nhau. */
  openerDe: string;
  openerVi: string;
  /** Từ và cấu trúc buổi này xoay quanh. */
  focus: string[];
};

/**
 * Lời nhắc hệ thống.
 *
 * Viết bằng tiếng Anh CÓ CHỦ ĐÍCH: mô hình mã nguồn mở cỡ nhỏ bám luật tiếng
 * Anh chắc hơn hẳn, trong khi nội dung tiếng Đức và tiếng Việt vẫn ra đúng.
 * Đây là lựa chọn kỹ thuật, không phải chuyện thẩm mỹ.
 */
function systemPrompt(lesson: Lesson, level: Level, learnerName: string): string {
  return [
    "You are Anna, a German teacher for Vietnamese learners at a German language school.",
    `The learner is named ${learnerName} and is at CEFR level ${level}.`,
    `Lesson: ${lesson.title}. Situation: ${lesson.situationVi}`,
    `Target structures for this lesson: ${lesson.focus.join("; ")}`,
    "",
    "RULES:",
    `1. Speak German at ${level} level only. Short sentences. No vocabulary above ${level}.`,
    "2. Correct AT MOST ONE mistake per turn - the one that most blocks understanding. If the learner's sentence is usable, correct nothing.",
    "3. Explanations are always in Vietnamese. German is only for what you say out loud.",
    "4. Never give a level, score or grade. Never say the learner passed or failed.",
    "5. Always end your German with a question, so the learner has something to answer.",
    "6. If the learner writes in Vietnamese, answer the question briefly in Vietnamese, then return to German.",
    "",
    "Reply with JSON only, no markdown fence:",
    '{"replyDe": "...", "glossVi": "...", "correction": {"wrong": "...", "right": "...", "why": "..."} or null, "hintVi": "..."}',
    "replyDe: what you say in German (1-3 sentences, ending with a question).",
    "glossVi: Vietnamese meaning of replyDe.",
    "correction.why: explain in Vietnamese, one sentence.",
    "hintVi: a Vietnamese hint telling the learner what to say next, with a German example phrase.",
  ].join("\n");
}

/**
 * Một lượt trong buổi học.
 *
 * `history` là các lượt trước, đã cắt ngắn. Mô hình 7B trên CPU chạy chậm dần
 * theo độ dài ngữ cảnh, và một buổi học nói không cần nhớ hai mươi lượt trước -
 * sáu lượt gần nhất là đủ để câu chuyện liền mạch.
 */
export async function classTurn(args: {
  lesson: Lesson;
  level: Level;
  learnerName: string;
  history: { role: "user" | "assistant"; content: string }[];
  said: string;
}): Promise<{ mode: "live"; turn: ClassTurn } | { mode: "mock"; turn: null; reason: string }> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt(args.lesson, args.level, args.learnerName) },
    ...args.history.slice(-6),
    { role: "user", content: args.said },
  ];

  const result = await chatJson<Partial<ClassTurn>>(messages, { maxTokens: 320 });
  if (result.mode === "mock") return { mode: "mock", turn: null, reason: result.reason };

  const data = result.data;
  const replyDe = typeof data.replyDe === "string" ? data.replyDe.trim() : "";
  if (!replyDe) throw new Error("bộ giảng dạy không trả về câu tiếng Đức");

  // Dọn lại phần sửa lỗi: mô hình nhỏ hay trả về một đối tượng rỗng thay vì
  // null khi không có gì để sửa, và một khung sửa lỗi trống trên màn hình làm
  // người học tưởng mình sai mà không biết sai ở đâu.
  const c = data.correction;
  const correction =
    c && typeof c.wrong === "string" && c.wrong.trim() && typeof c.right === "string" && c.right.trim()
      ? { wrong: c.wrong.trim(), right: c.right.trim(), why: (c.why ?? "").trim() }
      : null;

  return {
    mode: "live",
    turn: {
      replyDe,
      glossVi: typeof data.glossVi === "string" ? data.glossVi.trim() : "",
      correction,
      hintVi: typeof data.hintVi === "string" ? data.hintVi.trim() : "",
    },
  };
}
