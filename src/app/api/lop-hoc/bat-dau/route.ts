import { z } from "zod";
import { apiUser } from "@/lib/auth/guard";
import { lessonByCodeDb, openClassSession, recentTurns, saveTurn } from "@/lib/lop-hoc-db";
import { speakGerman } from "@/lib/adapters/giong-noi";
import { adapterMode } from "@/lib/config";
import { hit, tooMany } from "@/lib/rate-limit";
import { randomUUID } from "node:crypto";

const Body = z.object({ lesson: z.string().min(3).max(40) });

/**
 * Mở một buổi học nói.
 *
 * Câu mở lời của Anna là câu CỐ ĐỊNH trong bài, không do mô hình nghĩ ra. Hai lý
 * do: buổi học luôn bắt đầu giống nhau nên người học quay lại nhận ra ngay mình
 * đang ở đâu, và câu đầu tiên không phải chờ mô hình chạy - trên CPU thì đó là
 * năm giây nhìn màn hình trống ngay lúc vừa vào lớp.
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  const limit = hit(`lop-bat-dau:${auth.user.id}`, 40, 60 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", message: "Thiếu mã bài học." } },
      { status: 400 },
    );
  }

  // Biên tập viên và quản trị xem được cả bài chưa duyệt, học viên thì không.
  const canSeeDrafts = auth.user.role === "editor" || auth.user.role === "admin";
  const lesson = await lessonByCodeDb(parsed.data.lesson, canSeeDrafts);
  if (!lesson) {
    return Response.json(
      { error: { code: "not_found", message: "Chưa có bài học này." } },
      { status: 404 },
    );
  }

  const classSessionId = await openClassSession(auth.user.id, lesson.versionId);
  const history = await recentTurns(classSessionId, 12);

  // Buổi mới thì ghi luôn câu mở lời vào lịch sử, để mô hình ở lượt sau biết
  // Anna đã nói gì. Buổi đang dở thì không ghi lại - nó đã có trong lịch sử.
  if (history.length === 0) {
    await saveTurn({
      classSessionId,
      userId: auth.user.id,
      turnId: randomUUID(),
      role: "teacher",
      transcript: lesson.body.openerDe,
    });
  }

  let audio: string | null = null;
  try {
    const spoken = await speakGerman(lesson.body.openerDe, "anna");
    if (spoken.mode === "live") audio = spoken.audio;
  } catch {
    // Engine giọng nói hỏng thì buổi học vẫn mở được, chỉ là không có tiếng.
    audio = null;
  }

  return Response.json({
    classSessionId,
    lesson: {
      code: lesson.code,
      level: lesson.level,
      title: lesson.title,
      situationVi: lesson.body.situationVi,
      goalVi: lesson.body.goalVi,
      focus: lesson.body.focus,
      published: lesson.published,
    },
    opener: { de: lesson.body.openerDe, vi: lesson.body.openerVi, audio },
    history,
    engines: { llm: adapterMode("llm"), tts: adapterMode("tts"), stt: adapterMode("stt") },
  });
}
