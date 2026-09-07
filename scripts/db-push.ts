/**
 * Áp migration lên cơ sở dữ liệu.
 *
 * `drizzle-kit push` nói chuyện qua giao thức Postgres trên TCP, thứ mà PGlite
 * (engine nhúng) không có. Nhưng `drizzle-kit generate` chạy hoàn toàn offline,
 * nên quy trình là:
 *
 *   npx drizzle-kit generate     -> sinh SQL có phiên bản vào drizzle/
 *   npm run db:push              -> chạy chính các tệp SQL đó qua kết nối app
 *
 * Nghĩa là thứ chạy ở máy phát triển đúng bằng thứ sẽ chạy trên Postgres của
 * VPS: cùng những tệp SQL, không có nhánh riêng cho môi trường nào.
 */
import fs from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { getDb } from "../src/lib/db";

const MIGRATIONS = path.resolve(process.cwd(), "drizzle");

async function main() {
  if (!fs.existsSync(MIGRATIONS)) {
    console.error(
      "Chưa có thư mục drizzle/. Chạy `npx drizzle-kit generate` trước để sinh migration.",
    );
    process.exit(1);
  }

  const files = fs
    .readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.error("Thư mục drizzle/ không có tệp .sql nào. Chạy `npx drizzle-kit generate`.");
    process.exit(1);
  }

  const db = await getDb();

  // Bảng ghi migration đã chạy: chạy lại `npm run db:push` không được áp hai lần.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS __lingora_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const doneRows = await db.execute(sql`SELECT name FROM __lingora_migrations`);
  const done = new Set(rowsOf<{ name: string }>(doneRows).map((r) => r.name));

  let appliedFiles = 0;
  for (const file of files) {
    if (done.has(file)) {
      console.log(`  bỏ qua ${file} (đã áp)`);
      continue;
    }

    const raw = fs.readFileSync(path.join(MIGRATIONS, file), "utf8");
    const statements = raw
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      try {
        await db.execute(sql.raw(statement));
      } catch (error) {
        const message = (error as Error).message;
        // Chạy lại trên một database đã có sẵn bảng là chuyện thường; mọi lỗi
        // khác phải nổi lên chứ không được nuốt.
        if (/already exists/i.test(message)) continue;
        console.error(`\nLỗi trong ${file}:\n${statement.slice(0, 400)}\n`);
        throw error;
      }
    }

    await db.execute(sql`INSERT INTO __lingora_migrations (name) VALUES (${file})`);
    appliedFiles += 1;
    console.log(`  đã áp ${file} (${statements.length} câu lệnh)`);
  }

  console.log(`\nXong. ${appliedFiles} migration mới được áp, ${files.length} tệp tổng cộng.`);
  process.exit(0);
}

/** PGlite và node-postgres trả về hình dạng khác nhau; chuẩn hóa về một mảng. */
function rowsOf<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  const maybe = result as { rows?: T[] };
  return maybe?.rows ?? [];
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
