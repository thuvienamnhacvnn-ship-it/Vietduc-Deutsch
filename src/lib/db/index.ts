// Không có `server-only` ở đây: các script CLI trong /scripts import trực tiếp
// module này. Nó không bao giờ được import từ một client component.
import path from "node:path";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "./schema";

export * as schema from "./schema";
export type Db = PgliteDatabase<typeof schema>;

/**
 * Lingora chạy trên PGlite (chính Postgres biên dịch sang WASM) khi phát triển,
 * vì máy dev không cài được Postgres bản địa. Đặt DATABASE_URL là chuyển sang
 * Postgres thật; schema và mọi truy vấn giữ nguyên, không có nhánh code riêng.
 * Xem docs/adr/0002-pglite.md.
 */
const DATA_DIR = process.env.PGLITE_DATA_DIR
  ? path.resolve(process.env.PGLITE_DATA_DIR)
  : path.resolve(process.cwd(), "data", "pgdata");

declare global {
  var __lingora_db: Db | undefined;
}

async function create(): Promise<Db> {
  if (process.env.DATABASE_URL) {
    const [{ drizzle }, pg] = await Promise.all([
      import("drizzle-orm/node-postgres"),
      import("pg"),
    ]);
    const pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL });
    return drizzle(pool, { schema }) as unknown as Db;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  await claimDataDir();
  const client = await PGlite.create({ dataDir: DATA_DIR });
  return drizzlePglite(client, { schema });
}

/**
 * PGlite là engine nhúng: thư mục dữ liệu thuộc về đúng một tiến trình. Hai tiến
 * trình cùng mở - một `next dev` đang chạy và một `npm run seed` ở terminal khác
 * - sẽ làm hỏng dữ liệu, và hỏng theo kiểu chỉ lộ ra sau đó dưới dạng
 * "missing chunk number 0 for toast value ...".
 *
 * PGlite không tự chặn việc này trên Windows, nên khóa advisory dưới đây làm
 * thay: ghi PID chủ sở hữu và từ chối mở khi tiến trình đó còn sống, kèm thông
 * báo nói rõ phải làm gì.
 */
async function claimDataDir(): Promise<void> {
  const fs = await import("node:fs");
  const lockPath = path.join(DATA_DIR, ".lingora-lock");

  try {
    const raw = fs.readFileSync(lockPath, "utf8");
    const owner = Number(raw.split("\n")[0]);
    if (Number.isInteger(owner) && owner !== process.pid) {
      let alive = false;
      try {
        // Signal 0 chỉ kiểm tra sự tồn tại, không đụng vào tiến trình.
        process.kill(owner, 0);
        alive = true;
      } catch {
        alive = false; // khóa cũ của một tiến trình đã thoát
      }
      if (alive) {
        throw new Error(
          `Thư mục dữ liệu PGlite tại ${DATA_DIR} đang mở ở tiến trình ${owner}.\n` +
            "Dừng dev server trước khi chạy script ghi vào database (npm run db:push,\n" +
            "npm run seed), hoặc trỏ PGLITE_DATA_DIR sang thư mục khác. Mở hai lần\n" +
            "sẽ làm hỏng cơ sở dữ liệu.",
        );
      }
    }
  } catch (error) {
    // ENOENT chỉ có nghĩa là chưa ai giữ khóa.
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      if (error instanceof Error && error.message.includes("đang mở ở tiến trình")) throw error;
    }
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(lockPath, `${process.pid}\n${new Date().toISOString()}\n`);

  const release = () => {
    try {
      const raw = fs.readFileSync(lockPath, "utf8");
      if (Number(raw.split("\n")[0]) === process.pid) fs.unlinkSync(lockPath);
    } catch {
      /* đã biến mất rồi */
    }
  };
  process.once("exit", release);
  process.once("SIGINT", () => {
    release();
    process.exit(130);
  });
  process.once("SIGTERM", () => {
    release();
    process.exit(143);
  });
}

let pending: Promise<Db> | undefined;

/**
 * Cache qua các lần hot reload khi dev; PGlite giữ khóa độc quyền trên thư mục
 * dữ liệu nên một instance thứ hai sẽ lỗi chứ không im lặng chạy song song.
 */
export async function getDb(): Promise<Db> {
  if (globalThis.__lingora_db) return globalThis.__lingora_db;
  if (!pending) {
    pending = create().then((db) => {
      globalThis.__lingora_db = db;
      return db;
    });
  }
  return pending;
}
