import { randomUUID } from "node:crypto";
import { z } from "zod";
import { apiUser } from "@/lib/auth/guard";
import {
  classSessionOf,
  lessonByCodeDb,
  recentTurns,
  rememberCorrection,
  saveTurn,
} from "@/lib/lop-hoc-db";
import { classTurn } from "@/lib/lop-hoc";
import { speakGerman } from "@/lib/adapters/giong-noi";
import { hit, tooMany } from "@/lib/rate-limit";

const Body = z.object({
  classSessionId: z.number().int().positive(),
  lesson: z.string().min(3).max(40),
  /** Câu người học nói hoặc gõ. Đã qua bước nghe-ra-chữ nếu là nói. */
  said: z.string().min(1).max(1200),
  /** Người học tự sửa lại phần máy nghe được trước khi gửi. */
  edited: z.boolean().optional(),
});

/**
 * Một lượt trong buổi học: người học nói, Anna đáp.
 *
 * Câu Anna đáp lấy từ KỊCH BẢN của bài, nên nó ra ngay và luôn đúng cấp độ -
 * xem ghi chú đầu `src/lib/lop-hoc.ts` để biết vì sao không để mô hình sinh
 * câu này. Mô hình chỉ soi câu người học vừa nói và chỉ ra một lỗi; engine
 * giọng nói đọc câu đáp thành tiếng; lỗi được sửa thì thành một thẻ ôn tập.
 *
 * Lượt được ghi vào cơ sở dữ liệu TRƯỚC khi gọi mô hình. Mô hình chạy trên CPU
 * có thể mất mươi giây; người học đóng tab giữa chừng thì câu họ vừa nói vẫn
 * còn đó, và buổi sau Anna vẫn biết hôm trước nói tới đâu.
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  // Mỗi lượt tốn vài giây CPU của máy chủ. Trần này không phải để chặn người
  // học chăm, mà để một tab bị kẹt trong vòng lặp không kéo sập lớp của người
  // khác trên cùng một máy.
  const limit = hit(`lop-luot:${auth.user.id}`, 120, 60 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", message: "Thiếu nội dung lượt nói." } },
      { status: 400 },
    );
  }

  const { classSessionId, said } = parsed.data;
  const session = await classSessionOf(auth.user.id, classSessionId);
  if (!session) {
    return Response.json(
      { error: { code: "not_found", message: "Không tìm thấy buổi học." } },
      { status: 404 },
    );
  }
  if (session.state !== "open") {
    return Response.json(
      { error: { code: "closed", message: "Buổi học này đã kết thúc." } },
      { status: 409 },
    );
  }

  const canSeeDrafts = auth.user.role === "editor" || auth.user.role === "admin";
  const lesson = await lessonByCodeDb(parsed.data.lesson, canSeeDrafts);
  if (!lesson) {
    return Response.json(
      { error: { code: "not_found", message: "Chưa có bài học này." } },
      { status: 404 },
    );
  }

  await saveTurn({
    classSessionId,
    userId: auth.user.id,
    turnId: randomUUID(),
    role: "learner",
    transcript: said,
  });

  // Người học đã nói bao nhiêu lượt trước lượt này: đó là vị trí trong kịch bản.
  // Đếm từ cơ sở dữ liệu chứ không tin số client gửi lên - client mở hai tab là
  // số đếm lệch ngay.
  const history = await recentTurns(classSessionId, 100);
  const turnIndex = Math.max(0, history.filter((h) => h.role === "user").length - 1);
  const startedModel = Date.now();

  const result = await classTurn({
    lesson: lesson.body,
    level: lesson.level,
    learnerName: auth.user.name,
    turnIndex,
    said,
  });

  const modelMs = Date.now() - startedModel;
  const turn = result.turn;

  await saveTurn({
    classSessionId,
    userId: auth.user.id,
    turnId: randomUUID(),
    role: "teacher",
    transcript: turn.replyDe,
    latency: { model: modelMs },
  });

  // Lỗi được sửa thành thẻ ôn tập ngay tại đây, không đợi hết buổi: người học
  // hay đóng tab giữa chừng, và một buổi học dở dang vẫn nên để lại thứ gì đó.
  if (turn.correction) {
    await rememberCorrection({
      userId: auth.user.id,
      classSessionId,
      wrong: turn.correction.wrong,
      right: turn.correction.right,
      why: turn.correction.why,
    });
  }

  let audio: string | null = null;
  let ttsMs = 0;
  try {
    const spoken = await speakGerman(turn.replyDe, "anna");
    if (spoken.mode === "live") {
      audio = spoken.audio;
      ttsMs = spoken.ms;
    }
  } catch {
    audio = null;
  }

  return Response.json({
    turn,
    audio,
    // Nói rõ phần sửa lỗi có chạy hay không, để giao diện không im lặng khi bộ
    // giảng dạy đang tắt: người học cần biết vì sao không thấy ai chữa bài.
    correctionEngine: result.engine,
    latency: { model: modelMs, tts: ttsMs },
  });
}
