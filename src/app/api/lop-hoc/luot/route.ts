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
 * Ba việc chạy nối tiếp và cả ba đều trên máy chủ của trường: mô hình ngôn ngữ
 * soạn câu đáp, engine giọng nói đọc nó thành tiếng, và lỗi được sửa thì thành
 * một thẻ ôn tập.
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

  const history = await recentTurns(classSessionId, 6);
  const startedModel = Date.now();

  let result;
  try {
    result = await classTurn({
      lesson: lesson.body,
      level: lesson.level,
      learnerName: auth.user.name,
      // Bỏ lượt vừa ghi ra khỏi lịch sử: nó được gửi riêng ở `said`, để trong
      // cả hai chỗ thì mô hình thấy người học nói hai lần cùng một câu.
      history: history.slice(0, -1),
      said,
    });
  } catch (error) {
    return Response.json(
      {
        error: {
          code: "engine_error",
          message: "Bộ giảng dạy đang không trả lời. Câu bạn vừa nói đã được lưu.",
          detail: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 503 },
    );
  }

  if (result.mode === "mock") {
    return Response.json(
      {
        error: {
          code: "chua_mo",
          message:
            "Lớp học nói chưa mở trên bản cài này. Câu bạn vừa nói đã được lưu, nhưng chưa có câu trả lời của giáo viên.",
        },
      },
      { status: 503 },
    );
  }

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

  return Response.json({ turn, audio, latency: { model: modelMs, tts: ttsMs } });
}
