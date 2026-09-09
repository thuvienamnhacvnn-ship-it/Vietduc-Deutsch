import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { adapterStatus } from "@/lib/config";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { voiceHealth } from "@/lib/adapters/giong-noi";
import { llmHealth } from "@/lib/adapters/llm";

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

  /*
   * Engine tự host được hỏi thẳng chứ không suy từ biến môi trường: có biến
   * không có nghĩa là máy chủ còn sống. Cả hai lời gọi đều có hạn 5 giây và tự
   * nuốt lỗi, nên trang sức khỏe không bao giờ treo vì engine chết.
   */
  const [voice, llm] = await Promise.all([voiceHealth(), llmHealth()]);

  return Response.json(
    {
      ok: db === "ok",
      db,
      adapters: adapterStatus(),
      engines: { giongNoi: voice, giangDay: llm },
      time: new Date().toISOString(),
    },
    { status: db === "ok" ? 200 : 503 },
  );
}
