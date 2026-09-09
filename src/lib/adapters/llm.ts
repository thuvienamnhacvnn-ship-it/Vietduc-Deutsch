import "server-only";

import { adapterMode } from "@/lib/config";

/**
 * Mô hình ngôn ngữ dùng cho giảng dạy và chấm bài.
 *
 * MẶC ĐỊNH LÀ TỰ HOST: llama.cpp chạy trên máy chủ của trường và phơi ra theo
 * chuẩn OpenAI (`/v1/chat/completions`). Chuẩn đó được chọn không phải vì thích
 * OpenAI mà vì gần như mọi engine mã nguồn mở đều nói được nó - đổi mô hình
 * hoặc đổi engine sau này không phải sửa dòng code nào ngoài biến môi trường.
 *
 * Không có engine thì adapter chạy `mock`: nó KHÔNG bịa ra lời giảng. Nó trả về
 * đúng một câu nói rằng phần này chưa mở, và giao diện hiển thị đúng như vậy.
 * Một lời giảng bịa ra trong lớp học ngoại ngữ là thứ tệ hơn không có lớp: người
 * học tin và học sai.
 */

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatResult =
  | { mode: "live"; text: string; ms: number }
  | { mode: "mock"; text: null; reason: string };

const MOCK_REASON =
  "Bộ giảng dạy chưa được kết nối trên bản cài này, nên chưa có câu trả lời của giáo viên.";

export async function chat(
  messages: ChatMessage[],
  options: { maxTokens?: number; temperature?: number; stop?: string[] } = {},
): Promise<ChatResult> {
  if (adapterMode("llm") !== "live") return { mode: "mock", text: null, reason: MOCK_REASON };

  const base = process.env.LINGORA_LLM_URL?.replace(/\/$/, "");
  if (!base) return { mode: "mock", text: null, reason: MOCK_REASON };

  const token = process.env.LINGORA_LLM_TOKEN?.trim();
  const started = Date.now();

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      model: process.env.LINGORA_LLM_MODEL || "local",
      messages,
      // Nhiệt độ thấp cho việc dạy: một giáo viên nói mỗi lần một kiểu về cùng
      // một quy tắc ngữ pháp thì người học không biết tin cái nào.
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 320,
      ...(options.stop ? { stop: options.stop } : {}),
      stream: false,
    }),
    // Mô hình chạy trên CPU: một câu trả lời ngắn mất vài giây, câu dài có thể
    // tới nửa phút. Ngắt sớm hơn là tự tạo ra lỗi không có thật.
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) throw new Error(`bộ giảng dạy trả ${res.status}`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("bộ giảng dạy trả về rỗng");
  return { mode: "live", text, ms: Date.now() - started };
}

/**
 * Gọi mô hình và đọc ra JSON.
 *
 * Mô hình nhỏ hay bọc JSON trong ```json ... ``` hoặc thêm một câu dẫn phía
 * trước. Thay vì ép mô hình bằng lời nhắc dài, cắt lấy đoạn từ dấu { đầu tiên
 * tới dấu } cuối cùng - rẻ hơn và chịu được nhiều kiểu lệch hơn.
 */
export async function chatJson<T>(
  messages: ChatMessage[],
  options: { maxTokens?: number; temperature?: number } = {},
): Promise<{ mode: "live"; data: T } | { mode: "mock"; data: null; reason: string }> {
  const result = await chat(messages, options);
  if (result.mode === "mock") return { mode: "mock", data: null, reason: result.reason };

  const start = result.text.indexOf("{");
  const end = result.text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("bộ giảng dạy không trả về JSON");
  return { mode: "live", data: JSON.parse(result.text.slice(start, end + 1)) as T };
}

/** Engine có sống không, và đang nạp mô hình nào. */
export async function llmHealth(): Promise<{ ok: boolean; detail: string }> {
  if (adapterMode("llm") !== "live") return { ok: false, detail: "chưa cấu hình bộ giảng dạy" };
  const base = process.env.LINGORA_LLM_URL?.replace(/\/$/, "");
  if (!base) return { ok: false, detail: "thiếu LINGORA_LLM_URL" };

  try {
    const token = process.env.LINGORA_LLM_TOKEN?.trim();
    const res = await fetch(`${base}/models`, {
      headers: token ? { authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false, detail: `engine trả ${res.status}` };
    const data = (await res.json()) as { data?: { id?: string }[] };
    const names = (data.data ?? []).map((m) => m.id).filter(Boolean);
    return { ok: true, detail: names.length ? names.join(", ") : "engine sống" };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : "không gọi được engine" };
  }
}
