import "server-only";

import type { Level } from "@/lib/db/schema";
import { chatJson } from "@/lib/adapters/llm";

/**
 * Buổi học nói với cô Anna.
 *
 * CÂU ANNA NÓI LÀ KỊCH BẢN, KHÔNG PHẢI MÁY SINH. Mô hình chỉ lo phần sửa lỗi.
 *
 * Quyết định này đến từ số đo, không từ sở thích. Chạy thử trên chính máy chủ
 * của trường (8 nhân CPU, không GPU):
 *
 *   - Qwen2.5-7B: 2,4-4,3 token/giây, tức 25-45 giây cho MỘT câu đáp. Một buổi
 *     học mười lượt là bảy phút ngồi nhìn vòng xoay.
 *   - Qwen2.5-3B: nhanh hơn (16 giây) nhưng có lượt trả lời phần tiếng Việt
 *     bằng TIẾNG TRUNG, và phần giải thích thì viết bằng tiếng Đức.
 *
 * Người học A1 không thể chờ nửa phút cho một câu "Woher kommst du?", và càng
 * không thể nhận một câu tiếng Trung giữa lớp tiếng Đức. Nên câu Anna nói lấy
 * từ kịch bản của bài: ra ngay lập tức, đúng cấp độ, không bao giờ bịa. Mô hình
 * được giao đúng một việc nó làm được trong vài giây - nhìn câu người học vừa
 * nói và chỉ ra một lỗi - và khi nó chậm hay hỏng thì buổi học vẫn chạy.
 *
 * Đây cũng là lý do lớp học không cần GPU để dùng được hôm nay. Có GPU thì phần
 * sửa lỗi nhanh hơn và chính xác hơn, chứ không phải "có GPU mới học được".
 *
 * Các ràng buộc dạy học, tất cả đều từ việc dạy chứ không từ kỹ thuật:
 *
 * 1. **Nói ở đúng mức người học.** Đưa câu B2 cho người A1 thì họ im lặng và
 *    thoát. Mức nằm trong lời nhắc và được nhắc lại ở mỗi lượt, vì mô hình nhỏ
 *    quên rất nhanh.
 * 2. **Sửa MỘT lỗi mỗi lượt.** Sửa hết mọi lỗi của một câu A1 thì người học
 *    nhận về một trang đỏ và bỏ cuộc. Chọn lỗi cản trở việc hiểu nhiều nhất.
 * 3. **Giải thích bằng tiếng Việt, nói bằng tiếng Đức.** Người mới không học
 *    được ngữ pháp Đức bằng tiếng Đức; nhưng nghe và nói thì phải là tiếng Đức
 *    thật, không pha.
 * 4. **Không sửa lỗi gõ ký tự Đức.** Người học gõ trên bàn phím Việt, không có
 *    ß hay ä. Lần chạy thử đầu tiên mô hình sửa "Ich heisse Mai" thành "Ich
 *    heiße Mai" - một lỗi bàn phím - trong khi bỏ qua "Ich komme VON Vietnam"
 *    là lỗi giới từ thật. Sửa nhầm như vậy hai lần là người học mất tin.
 * 5. **Không chấm điểm trong lớp.** Lớp học là chỗ tập, không phải chỗ thi. Mức
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
  /** Đã hết kịch bản của buổi này. */
  done: boolean;
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
  /**
   * Kịch bản buổi học: những câu Anna nói tiếp sau câu mở lời, theo thứ tự.
   *
   * Hết kịch bản thì buổi học khép lại bằng câu cuối cùng - một buổi có điểm
   * dừng rõ ràng tốt hơn một cuộc trò chuyện lê thê không biết bao giờ xong.
   */
  script: { de: string; vi: string }[];
};

/**
 * Lời nhắc cho việc DUY NHẤT mô hình đảm nhận: soi câu người học vừa nói và chỉ
 * ra một lỗi.
 *
 * Viết bằng tiếng Anh có chủ đích - mô hình mã nguồn mở cỡ nhỏ bám luật tiếng
 * Anh chắc hơn hẳn. Yêu cầu ngắn và chỉ ba trường: mỗi trường thêm vào là thêm
 * vài giây chờ và thêm một chỗ để mô hình lạc đề.
 */
function correctionPrompt(level: Level): string {
  return [
    "You check one German sentence written by a Vietnamese learner and find AT MOST ONE mistake.",
    `The learner is at CEFR level ${level}. Judge only what matters at that level.`,
    "",
    "RULES:",
    "1. NEVER flag spelling of German special characters. The learner types on a Vietnamese keyboard: ss for ß and ae/oe/ue for ä/ö/ü are correct. Capital letters on nouns do not matter.",
    "2. Pick the ONE mistake that most blocks understanding: wrong preposition, wrong case, wrong word order, wrong auxiliary. Ignore the rest.",
    "3. If the sentence is usable as it is, return null. A learner who is right must be told nothing.",
    "4. The explanation is in VIETNAMESE. Never German, never English, never Chinese.",
    "",
    "5. NEVER translate. You correct German into better German. 'right' is always German.",
    "6. Everyday spoken German is CORRECT, not an error: zwei Kilo, um acht Uhr, gern, mal, Handy. Do not make it more formal. Only flag what a German would consider wrong.",
    "",
    'Reply with JSON only: {"wrong": "...", "right": "...", "why": "..."} or {"wrong": null}',
    "wrong: the learner's exact words that are wrong, copied from their sentence (a few words, not the whole sentence).",
    "right: the same words in correct GERMAN.",
    "why: ONE short Vietnamese sentence saying the rule.",
    "",
    // Ví dụ mẫu, không phải để trang trí: mô hình cỡ nhỏ bám ví dụ chắc hơn bám
    // luật rất nhiều. Ba ví dụ này chặn đúng ba kiểu hỏng đã gặp thật khi chạy
    // thử - dịch sang tiếng Việt, sửa lỗi gõ ß, và bới lỗi ở câu vốn đã đúng.
    "EXAMPLES:",
    'Learner: "Ich komme von Vietnam." -> {"wrong": "komme von", "right": "komme aus", "why": "Với tên nước, tiếng Đức dùng aus chứ không dùng von."}',
    'Learner: "Gestern ich habe nach Berlin gefahren." -> {"wrong": "Gestern ich habe", "right": "Gestern bin ich", "why": "Động từ đứng vị trí thứ hai, và fahren đi với sein."}',
    'Learner: "Ich heisse Mai." -> {"wrong": null}',
    'Learner: "Ich moechte zwei Kilo Tomaten." -> {"wrong": null}',
    'Learner: "Ich treffe meine Freundin um acht Uhr." -> {"wrong": null}',
  ].join("\n");
}

/**
 * Chữ có phải tiếng Việt không.
 *
 * Kiểm ở server vì lời nhắc không đủ: mô hình 3B đã có lượt trả về tiếng Trung
 * và tiếng Đức cho đúng ô "giải thích bằng tiếng Việt". Thà không hiện gì còn
 * hơn hiện một câu người học không đọc được.
 */
function laTiengViet(text: string): boolean {
  if (!text) return false;
  // Chữ Hán, Nhật, Hàn: chắc chắn không phải tiếng Việt.
  if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/.test(text)) return false;
  // Dấu tiếng Việt, hoặc một trong những chữ hay gặp nhất. Câu tiếng Đức hay
  // tiếng Anh thuần sẽ không khớp cái nào.
  return /[ăâđêôơưàáảãạèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵ]/i.test(text) || /\b(là|của|bạn|khi|dùng|thì|không|với|trong|câu)\b/i.test(text);
}

/**
 * Một lượt trong buổi học.
 *
 * Câu đáp lấy từ kịch bản theo số lượt đã nói - tức thì và luôn đúng cấp độ.
 * Phần sửa lỗi hỏi mô hình; mô hình chậm, hỏng hay chưa bật thì lượt vẫn trả
 * về, chỉ là không có ô sửa lỗi. Buổi học không bao giờ dừng vì một dịch vụ.
 */
export async function classTurn(args: {
  lesson: Lesson;
  level: Level;
  learnerName: string;
  /** Người học đã nói bao nhiêu lượt trước lượt này. Quyết định câu kịch bản. */
  turnIndex: number;
  said: string;
}): Promise<{ turn: ClassTurn; engine: "live" | "off" }> {
  const line =
    args.lesson.script[args.turnIndex] ??
    args.lesson.script[args.lesson.script.length - 1] ?? {
      de: "Gut gemacht! Das war unsere Übung für heute.",
      vi: "Tốt lắm! Buổi tập hôm nay tới đây thôi.",
    };

  const done = args.turnIndex >= args.lesson.script.length;

  let correction: ClassTurn["correction"] = null;
  let engine: "live" | "off" = "off";

  try {
    const result = await chatJson<{ wrong?: string | null; right?: string; why?: string }>(
      [
        { role: "system", content: correctionPrompt(args.level) },
        { role: "user", content: args.said },
      ],
      { maxTokens: 160, temperature: 0.2 },
    );

    if (result.mode === "live") {
      engine = "live";
      const d = result.data;
      const wrong = typeof d.wrong === "string" ? d.wrong.trim() : "";
      const right = typeof d.right === "string" ? d.right.trim() : "";
      const why = typeof d.why === "string" ? d.why.trim() : "";
      if (wrong && right) {
        correction = { wrong, right, why: laTiengViet(why) ? why : "" };
      }
    }
  } catch {
    // Mô hình hỏng hoặc quá giờ: bỏ phần sửa lỗi, giữ nguyên buổi học.
    correction = null;
  }

  // Chặn ở SERVER, không chỉ dặn trong lời nhắc: nếu câu sai và câu đúng chỉ
  // khác nhau ở ß/ä/ö/ü hay chữ hoa thì đó là bàn phím chứ không phải tiếng
  // Đức. Mô hình được dặn rồi vẫn sửa nhầm - lời nhắc là lời khuyên, đoạn mã
  // này mới là luật.
  const goiVeBanPhim = (value: string) =>
    value
      .toLowerCase()
      .replace(/ß/g, "ss")
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/[.,!?;:]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  if (correction && goiVeBanPhim(correction.wrong) === goiVeBanPhim(correction.right)) {
    correction = null;
  }

  /*
   * Hai chốt chặn cuối, và cả hai đều từ lỗi gặp thật khi chạy thử:
   *
   * 1. Mô hình 3B "sửa" câu "ich heisse" thành "tôi tên là" - nó DỊCH thay vì
   *    sửa. Câu sửa phải là tiếng Đức; có dấu tiếng Việt trong đó là hỏng.
   * 2. Mô hình bịa ra một câu người học không hề nói. Phần bị coi là sai phải
   *    thật sự nằm trong câu vừa nói, nếu không thì bỏ.
   *
   * Thà không chữa còn hơn chữa sai: người học tin lời cô giáo, và một lời chữa
   * sai làm hỏng đúng cái mà buổi học vừa dạy đúng.
   */
  if (correction && laTiengViet(correction.right)) correction = null;

  if (correction) {
    const noiDaNoi = goiVeBanPhim(args.said);
    if (!noiDaNoi.includes(goiVeBanPhim(correction.wrong))) correction = null;
  }

  return {
    engine,
    turn: {
      replyDe: line.de,
      glossVi: line.vi,
      correction,
      hintVi: done ? "Buổi học đã hết phần luyện. Bạn có thể học lại buổi này hoặc sang buổi sau." : "",
      done,
    },
  };
}
