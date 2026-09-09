/**
 * Đặt vai trò cho một tài khoản.
 *
 *   npx tsx scripts/dat-quyen.ts <email> <learner|editor|support|admin>
 *
 * Vì sao là script chứ không phải một màn hình: nâng quyền là việc chỉ làm được
 * khi đã đứng ở máy chủ và mở được cơ sở dữ liệu. Một nút "tự phong quản trị"
 * trong giao diện thì chỉ cần một lỗ hổng phiên đăng nhập là mất cả hệ thống.
 *
 * PGlite chỉ cho MỘT tiến trình mở cơ sở dữ liệu. Dừng `npm run dev` trước khi
 * chạy script này, nếu không nó sẽ báo khoá và không đổi được gì.
 */
import { eq } from "drizzle-orm";
import { getDb } from "../src/lib/db";
import { users } from "../src/lib/db/schema";

const ROLES = ["learner", "editor", "support", "admin"] as const;
type Role = (typeof ROLES)[number];

async function main() {
  const [email, role] = process.argv.slice(2);

  if (!email || !role || !ROLES.includes(role as Role)) {
    console.error("Dùng: npx tsx scripts/dat-quyen.ts <email> <learner|editor|support|admin>");
    process.exit(1);
  }

  const db = await getDb();
  const found = await db
    .select({ id: users.id, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  const user = found[0];
  if (!user) {
    console.error(`Không có tài khoản nào với email ${email}. Đăng ký trên web trước đã.`);
    process.exit(1);
  }

  await db
    .update(users)
    .set({ role: role as Role })
    .where(eq(users.id, user.id));

  console.log(`${email} (${user.name}): ${user.role} -> ${role}`);
  if (role === "admin") {
    console.log("Tài khoản này giờ xác nhận được thanh toán và duyệt được bài học.");
  }
}

// PGlite giữ tiến trình sống sau khi xong việc, nên phải thoát tay - không thì
// script chạy xong vẫn treo ở terminal và trông như đang hỏng.
main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
