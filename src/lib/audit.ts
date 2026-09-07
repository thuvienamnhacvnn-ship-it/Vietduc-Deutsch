import "server-only";

import { getDb } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

/**
 * Nhật ký audit. Mọi hành động đổi trạng thái quan trọng - đăng nhập, đổi hồ sơ,
 * chấm điểm, cấp quyền học, thao tác của agent - đều để lại một dòng ở đây.
 *
 * Không bao giờ ghi mật khẩu, token, nội dung thư hay dữ liệu audio thô vào
 * `before`/`after`: bản ghi audit phải an toàn để đọc rộng rãi khi vận hành.
 */

const REDACT = /password|token|secret|authorization|cvv|pan/i;

function scrub(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(scrub);
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    out[key] = REDACT.test(key) ? "[đã lược]" : scrub(v);
  }
  return out;
}

export async function audit(entry: {
  actorUserId?: number | null;
  actorKind?: "user" | "agent" | "system";
  action: string;
  entity?: string;
  entityId?: string | number;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
}): Promise<void> {
  try {
    const db = await getDb();
    await db.insert(auditLogs).values({
      actorUserId: entry.actorUserId ?? null,
      actorKind: entry.actorKind ?? "user",
      action: entry.action,
      entity: entry.entity ?? null,
      entityId: entry.entityId != null ? String(entry.entityId) : null,
      before: entry.before === undefined ? null : scrub(entry.before),
      after: entry.after === undefined ? null : scrub(entry.after),
      ip: entry.ip ?? null,
    });
  } catch (error) {
    // Ghi audit hỏng không được làm hỏng hành động của người dùng, nhưng cũng
    // không được biến mất không dấu vết.
    console.error("[audit] không ghi được nhật ký:", (error as Error).message);
  }
}
