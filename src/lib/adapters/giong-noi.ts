import "server-only";

import { adapterMode } from "@/lib/config";

/**
 * Giọng nói tiếng Đức: đọc chữ thành tiếng (TTS) và nghe tiếng ra chữ (STT).
 *
 * Chạy trên engine TỰ HOST của Việt Đức, không dùng dịch vụ trả tiền theo lượt:
 *
 *   - đọc  : piper + giọng de_DE (mã nguồn mở, MIT)
 *   - nghe : whisper.cpp + model đa ngữ (mã nguồn mở, MIT)
 *
 * Hai thứ này chạy sau một dịch vụ HTTP nhỏ trên máy chủ của trường, xác thực
 * bằng một header token. Ứng dụng KHÔNG gọi thẳng vào tệp mô hình: engine có
 * bộ nhớ đệm riêng, nên một câu nghe đã được đọc một lần thì lần sau trả về
 * trong vài mili giây.
 *
 * Chưa cấu hình engine thì adapter chạy chế độ `mock`: nó KHÔNG bịa ra âm
 * thanh, mà trả về đúng phần chữ để trình duyệt tự đọc bằng giọng có sẵn, và
 * luôn tự khai là mock. Giao diện dán nhãn theo đó.
 */

export type TtsResult =
  | { mode: "live"; audio: string; cached: boolean; ms: number }
  | { mode: "mock"; text: string };

export type SttResult = { mode: "live"; text: string; ms: number } | { mode: "mock"; text: null };

/** Giọng có trong engine. Tên ở đây là tên nhân vật, không phải tên tệp mô hình. */
export type Voice = "anna" | "eva";

function endpoint(path: string): string {
  const base = process.env.LINGORA_VOICE_URL?.replace(/\/$/, "") ?? "";
  return `${base}${path}`;
}

function headers(): HeadersInit {
  return {
    "content-type": "application/json",
    "x-voice-token": process.env.LINGORA_VOICE_TOKEN ?? "",
  };
}

/**
 * Đọc một câu tiếng Đức thành tiếng.
 *
 * Trả về dữ liệu âm thanh dạng data URL để trình duyệt phát thẳng. Cố ý không
 * trả về một đường dẫn tệp: câu nghe của bài thi không được có URL đoán ra
 * được, vì như thế là mở đường tải trước cả bài nghe mà không tốn lượt nào.
 */
export async function speakGerman(text: string, voice: Voice = "anna"): Promise<TtsResult> {
  if (adapterMode("tts") !== "live") return { mode: "mock", text };

  const res = await fetch(endpoint("/tts"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ text, voice }),
    // Câu dài nhất trong ngân hàng chưa tới 40 từ; quá 20 giây là engine có
    // chuyện, và chờ tiếp chỉ làm người học ngồi nhìn màn hình trắng.
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) throw new Error(`engine giọng nói trả ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return {
    mode: "live",
    audio: `data:audio/mpeg;base64,${buffer.toString("base64")}`,
    cached: res.headers.get("x-cached") === "true",
    ms: Number(res.headers.get("x-ms") ?? 0),
  };
}

/**
 * Nghe một đoạn ghi âm và trả về chữ.
 *
 * `model`: "nhanh" cho lớp học (đáp lại trong vài giây), "ky" cho chấm bài
 * (chậm hơn nhưng bắt đúng hơn, chạy nền chứ không bắt người học chờ).
 */
export async function transcribeGerman(
  audio: Buffer,
  ext: string,
  model: "nhanh" | "ky" = "nhanh",
): Promise<SttResult> {
  if (adapterMode("stt") !== "live") return { mode: "mock", text: null };

  const safeExt = ext.replace(/[^a-z0-9]/gi, "").slice(0, 5) || "webm";
  const res = await fetch(endpoint(`/stt?ext=${safeExt}&model=${model}`), {
    method: "POST",
    headers: { "x-voice-token": process.env.LINGORA_VOICE_TOKEN ?? "" },
    body: new Uint8Array(audio),
    // Bản ghi tối đa 90 giây; model "ky" chạy chậm hơn thời gian thực nên phải
    // rộng tay hơn nhiều so với phần đọc.
    signal: AbortSignal.timeout(300_000),
  });

  if (!res.ok) throw new Error(`engine nghe trả ${res.status}`);
  const data = (await res.json()) as { text?: string; ms?: number };
  return { mode: "live", text: (data.text ?? "").trim(), ms: data.ms ?? 0 };
}

/** Engine có sống không. Dùng cho trang sức khỏe và cổng quản trị. */
export async function voiceHealth(): Promise<{ ok: boolean; detail: string }> {
  if (adapterMode("tts") !== "live" && adapterMode("stt") !== "live") {
    return { ok: false, detail: "chưa cấu hình engine giọng nói" };
  }
  try {
    const res = await fetch(endpoint("/health"), { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { ok: false, detail: `engine trả ${res.status}` };
    const data = (await res.json()) as { voices?: string[]; models?: string[] };
    return {
      ok: true,
      detail: `giọng: ${(data.voices ?? []).join(", ") || "?"} · model nghe: ${(data.models ?? []).join(", ") || "?"}`,
    };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : "không gọi được engine" };
  }
}
