import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { adapterStatus } from "@/lib/config";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";

/**
 * Kiểm tra sức khỏe. Dùng cho giám sát và cho việc xác nhận nhanh adapter nào
 * đã thật sự kết nối - đây là nguồn duy nhất để trả lời câu hỏi đó, thay vì
 * dựa vào trí nhớ của ai đó.
 */
export async function GET(request: Request) {
  const limit = hit(`suc-khoe:${clientIp(request)}`, 60, 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  let db: "ok" | "error" = "ok";
  try {
    const conn = await getDb();
    await conn.execute(sql`select 1`);
  } catch {
    db = "error";
  }

  return Response.json(
    { ok: db === "ok", db, adapters: adapterStatus(), time: new Date().toISOString() },
    { status: db === "ok" ? 200 : 503 },
  );
}
