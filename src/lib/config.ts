/**
 * Mọi cấu hình đọc từ biến môi trường ở đúng một chỗ. Không tệp nào khác được
 * đọc `process.env` cho các khóa dịch vụ - như vậy `adapterMode()` là câu trả
 * lời duy nhất cho câu hỏi "cái này đang chạy thật hay chạy mock".
 */

export type AdapterMode = "live" | "mock";

function has(...names: string[]): boolean {
  return names.every((n) => Boolean(process.env[n]?.trim()));
}

export const config = {
  appUrl: process.env.LINGORA_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3055",
  /** Múi giờ hiển thị mặc định; hồ sơ học viên ghi đè được. */
  defaultTimezone: process.env.LINGORA_DEFAULT_TZ ?? "Europe/Berlin",
  audioRetentionDays: Number(process.env.LINGORA_AUDIO_RETENTION_DAYS ?? 30),
} as const;

/**
 * Chế độ thật của từng adapter. Giao diện đọc hàm này để dán nhãn; báo cáo
 * nghiệm thu đọc nó để phân biệt PASS với BLOCKED.
 */
export function adapterMode(
  service:
    | "llm"
    | "stt"
    | "tts"
    | "avatar"
    | "mail"
    | "payments"
    | "storage"
    | "oauth_google",
): AdapterMode {
  switch (service) {
    // Mô hình ngôn ngữ cũng tự host (llama.cpp + model mã nguồn mở), phơi ra
    // theo chuẩn OpenAI để đổi mô hình không phải sửa code. Vẫn chấp nhận khóa
    // Anthropic nếu chủ dự án chọn dùng dịch vụ trả tiền.
    case "llm":
      return has("LINGORA_LLM_URL") || has("ANTHROPIC_API_KEY") ? "live" : "mock";
    // Nghe và đọc chạy trên CÙNG một engine tự host (piper + whisper.cpp), nên
    // chúng dùng chung một cặp biến môi trường. Không còn "provider" và "key"
    // của một dịch vụ bán theo lượt: engine là của trường.
    case "stt":
    case "tts":
      return has("LINGORA_VOICE_URL", "LINGORA_VOICE_TOKEN") ? "live" : "mock";
    case "avatar":
      // v1 avatar chạy cục bộ; "live" ở đây nghĩa là có dịch vụ đồng bộ khẩu hình.
      return has("LINGORA_AVATAR_PROVIDER", "LINGORA_AVATAR_KEY") ? "live" : "mock";
    case "mail":
      return has("LINGORA_MAIL_PROVIDER", "LINGORA_MAIL_KEY", "LINGORA_MAIL_FROM") ? "live" : "mock";
    case "payments":
      return has("PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_WEBHOOK_ID") ? "live" : "mock";
    case "storage":
      return process.env.LINGORA_STORAGE_DRIVER === "s3" && has("LINGORA_S3_BUCKET") ? "live" : "mock";
    case "oauth_google":
      return has("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET") ? "live" : "mock";
  }
}

/** Bảng trạng thái cho `/api/suc-khoe` và cổng quản trị. */
export function adapterStatus() {
  return {
    llm: adapterMode("llm"),
    stt: adapterMode("stt"),
    tts: adapterMode("tts"),
    avatar: adapterMode("avatar"),
    mail: adapterMode("mail"),
    payments: adapterMode("payments"),
    storage: adapterMode("storage"),
    oauth_google: adapterMode("oauth_google"),
  };
}
