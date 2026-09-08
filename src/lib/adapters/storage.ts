import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { adapterMode, config } from "@/lib/config";

/**
 * Lưu trữ tệp do người dùng tải lên - hiện chỉ có file ghi âm bài Nói.
 *
 * Bản mặc định ghi xuống đĩa cục bộ trong `data/uploads/`. Bản S3 sẽ thay chỗ
 * hàm `put` khi có cấu hình; phần còn lại của ứng dụng không phải biết.
 *
 * Ba ràng buộc, đều là yêu cầu H-05 và H-08:
 *   - giới hạn kích thước, kiểm MIME theo danh sách trắng
 *   - tên tệp do server sinh, KHÔNG bao giờ lấy từ tên người dùng gửi lên
 *   - mỗi tệp có hạn giữ; audio thô không nằm lại lâu hơn mức cần
 */

/** Định dạng trình duyệt thật sự tạo ra khi ghi âm. Không mở rộng thêm. */
const ALLOWED_AUDIO = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
]);

export const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

const UPLOAD_DIR = path.resolve(process.cwd(), "data", "uploads");

function extensionFor(mime: string): string {
  if (mime.startsWith("audio/webm")) return "webm";
  if (mime.startsWith("audio/ogg")) return "ogg";
  if (mime.startsWith("audio/mp4")) return "m4a";
  if (mime.startsWith("audio/mpeg")) return "mp3";
  return "wav";
}

export type StoredAsset = { assetId: number; storageKey: string; bytes: number };

/**
 * Lưu một đoạn ghi âm và ghi nó vào bảng `assets`.
 *
 * `ownerUserId` là bắt buộc: một tệp không có chủ thì không ai kiểm tra được ai
 * được phép nghe nó.
 */
export async function storeAudio(args: {
  ownerUserId: number;
  mime: string;
  data: ArrayBuffer;
}): Promise<StoredAsset> {
  // Trình duyệt gửi kèm codec, ví dụ `audio/webm;codecs=opus`.
  const baseMime = args.mime.split(";")[0]!.trim().toLowerCase();
  if (!ALLOWED_AUDIO.has(baseMime)) {
    throw new Error(`unsupported_mime:${baseMime}`);
  }
  if (args.data.byteLength === 0) throw new Error("empty_file");
  if (args.data.byteLength > MAX_AUDIO_BYTES) throw new Error("too_large");

  const key = `audio/${new Date().toISOString().slice(0, 10)}/${randomBytes(16).toString("hex")}.${extensionFor(baseMime)}`;

  if (adapterMode("storage") === "live") {
    // Bản S3 điền vào đây. Ném lỗi thay vì âm thầm ghi xuống đĩa của một máy
    // web bất kỳ - trên nhiều instance thì tệp sẽ biến mất ở request sau.
    throw new Error(
      "Adapter lưu trữ chưa có bản cài đặt S3. Xem docs/INTEGRATIONS.md, mục Object storage.",
    );
  }

  const filePath = path.join(UPLOAD_DIR, key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, Buffer.from(args.data));

  const expiresAt = new Date(Date.now() + config.audioRetentionDays * 24 * 60 * 60 * 1000);

  const db = await getDb();
  const created = await db
    .insert(assets)
    .values({
      storageKey: key,
      mime: baseMime,
      bytes: args.data.byteLength,
      kind: "audio",
      ownerUserId: args.ownerUserId,
      license: "learner_recording",
      altText: "Bản ghi âm bài nói của học viên",
      expiresAt,
    })
    .returning({ id: assets.id });

  return { assetId: created[0]!.id, storageKey: key, bytes: args.data.byteLength };
}
