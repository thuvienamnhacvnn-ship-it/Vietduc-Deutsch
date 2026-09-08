import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { assessmentSessions, responses } from "@/lib/db/schema";
import { apiUser } from "@/lib/auth/guard";
import { questionVersionIdFor, type SessionState } from "@/lib/placement";
import { MAX_AUDIO_BYTES, storeAudio } from "@/lib/adapters/storage";
import { itemByCode } from "@/content/placement";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

/**
 * Nhận đoạn ghi âm bài Nói.
 *
 * Đây là phần DUY NHẤT của kỹ năng Nói chạy được hôm nay mà không cần dịch vụ
 * ngoài: trình duyệt ghi âm, server nhận và lưu. Chấm điểm thì vẫn cần một bộ
 * phân tích giọng nói chưa được kết nối, nên kết quả vẫn ghi là chưa đánh giá
 * được - nhưng bằng chứng đã có sẵn ở đó cho lúc bộ chấm được bật.
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  const limit = hit(`ghi-am:${auth.user.id}`, 20, 60 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const form = await request.formData().catch(() => null);
  const file = form?.get("audio");
  const sessionId = Number(form?.get("sessionId"));
  const code = String(form?.get("code") ?? "");
  const seconds = Number(form?.get("seconds") ?? 0);

  if (!(file instanceof File) || !Number.isInteger(sessionId) || !code) {
    return Response.json(
      { error: { code: "invalid_input", message: "Thiếu dữ liệu ghi âm." } },
      { status: 400 },
    );
  }

  // Kiểm kích thước TRƯỚC khi đọc vào bộ nhớ.
  if (file.size > MAX_AUDIO_BYTES) {
    return Response.json(
      {
        error: {
          code: "too_large",
          message: `Đoạn ghi âm quá dài. Tối đa ${Math.round(MAX_AUDIO_BYTES / 1024 / 1024)} MB.`,
        },
      },
      { status: 413 },
    );
  }

  const item = itemByCode(code);
  if (!item || item.kind !== "speak") {
    return Response.json(
      { error: { code: "not_found", message: "Không tìm thấy đề nói." } },
      { status: 404 },
    );
  }

  const db = await getDb();
  const rows = await db
    .select()
    .from(assessmentSessions)
    .where(and(eq(assessmentSessions.id, sessionId), eq(assessmentSessions.userId, auth.user.id)))
    .limit(1);

  const session = rows[0];
  if (!session) {
    return Response.json(
      { error: { code: "not_found", message: "Không tìm thấy bài làm." } },
      { status: 404 },
    );
  }
  if (session.status !== "in_progress") {
    return Response.json(
      { error: { code: "closed", message: "Bài làm này đã nộp rồi." } },
      { status: 409 },
    );
  }

  let stored;
  try {
    stored = await storeAudio({
      ownerUserId: auth.user.id,
      mime: file.type || "audio/webm",
      data: await file.arrayBuffer(),
    });
  } catch (error) {
    const message = (error as Error).message;
    console.error("[ghi-am] lưu thất bại:", message);
    return Response.json(
      {
        error: {
          code: "store_failed",
          message: message.startsWith("unsupported_mime")
            ? "Trình duyệt của bạn ghi ra định dạng chúng tôi chưa nhận được."
            : "Chưa lưu được đoạn ghi âm. Bạn thử lại giúp nhé.",
        },
      },
      { status: 400 },
    );
  }

  const questionVersionId = await questionVersionIdFor(code);
  if (!questionVersionId) {
    return Response.json(
      { error: { code: "not_seeded", message: "Ngân hàng câu hỏi chưa được nạp." } },
      { status: 500 },
    );
  }

  const state = session.resumeState as SessionState;
  if (!Array.isArray(state.skipped)) state.skipped = [];

  if (!state.answered.includes(code)) {
    await db.insert(responses).values({
      sessionId,
      userId: auth.user.id,
      questionVersionId,
      raw: { code, spoken: true, seconds: Number.isFinite(seconds) ? Math.round(seconds) : null },
      audioAssetId: stored.assetId,
      // Không có điểm: chưa có gì chấm được đoạn âm thanh này.
      autoScore: null,
    });
    state.answered.push(code);
  }

  await db
    .update(assessmentSessions)
    .set({ resumeState: state })
    .where(eq(assessmentSessions.id, sessionId));

  await audit({
    actorUserId: auth.user.id,
    action: "placement.speaking_recorded",
    entity: "assets",
    entityId: stored.assetId,
    after: { bytes: stored.bytes, seconds },
    ip: clientIp(request),
  });

  return Response.json({ ok: true, seconds, bytes: stored.bytes });
}
