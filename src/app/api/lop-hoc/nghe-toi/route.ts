import { apiUser } from "@/lib/auth/guard";
import { transcribeGerman } from "@/lib/adapters/giong-noi";
import { MAX_AUDIO_BYTES } from "@/lib/adapters/storage";
import { hit, tooMany } from "@/lib/rate-limit";

/**
 * Nghe đoạn ghi âm của người học và trả về chữ.
 *
 * Bản ghi KHÔNG được lưu lại. Trong lớp học, đoạn tiếng nói chỉ là đường đi tới
 * câu chữ; giữ lại giọng của người học cho một việc đã xong là thu thập dữ liệu
 * không có lý do. Bài thi Nói thì khác - ở đó bản ghi là bằng chứng chấm điểm và
 * được lưu có chủ đích, xem /api/xep-lop/ghi-am.
 *
 * Người học được SỬA lại phần máy nghe được trước khi gửi cho giáo viên. Máy
 * nghe nhầm là chuyện thường với người mới học, và không cho sửa thì họ bị chữa
 * một lỗi họ không hề mắc.
 */
export async function POST(request: Request) {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  const limit = hit(`lop-nghe:${auth.user.id}`, 200, 60 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const url = new URL(request.url);
  const ext = url.searchParams.get("ext") ?? "webm";

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_AUDIO_BYTES) {
    return Response.json(
      { error: { code: "too_large", message: "Đoạn ghi âm quá dài." } },
      { status: 413 },
    );
  }

  const audio = Buffer.from(await request.arrayBuffer());
  if (audio.byteLength === 0) {
    return Response.json(
      { error: { code: "invalid_input", message: "Không nhận được âm thanh." } },
      { status: 400 },
    );
  }
  if (audio.byteLength > MAX_AUDIO_BYTES) {
    return Response.json(
      { error: { code: "too_large", message: "Đoạn ghi âm quá dài." } },
      { status: 413 },
    );
  }

  try {
    const result = await transcribeGerman(audio, ext, "nhanh");
    if (result.mode === "mock") {
      return Response.json(
        {
          error: {
            code: "chua_mo",
            message:
              "Phần nghe giọng nói chưa mở trên bản cài này. Bạn vẫn gõ câu tiếng Đức của mình để học tiếp.",
          },
        },
        { status: 503 },
      );
    }
    return Response.json({ text: result.text, ms: result.ms });
  } catch (error) {
    return Response.json(
      {
        error: {
          code: "engine_error",
          message: "Không nghe được đoạn ghi âm. Bạn gõ lại câu vừa nói nhé.",
          detail: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 503 },
    );
  }
}
