import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { issueAuthToken } from "@/lib/auth/session";
import { resetPasswordMail, sendMail } from "@/lib/adapters/mail";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const Body = z.object({ email: z.string().trim().toLowerCase().email() });

/**
 * Luôn trả `{ok:true}` dù email có tồn tại hay không. Ở đây khác với luồng đăng
 * ký: bất kỳ ai cũng gọi được endpoint này cho email của người khác, nên câu trả
 * lời khác nhau sẽ thành công cụ dò xem ai có tài khoản.
 */
export async function POST(request: Request) {
  /*
   * Hai mức chặn, vì hai kiểu lạm dụng khác nhau.
   *
   * Theo IP thì rộng tay: cả một lớp học ngồi chung một đường mạng văn phòng,
   * ba lượt cho cả toà nhà là chặn nhầm người thật.
   *
   * Theo địa chỉ email mới là mức chặt, và đó mới là mức bảo vệ đúng người:
   * thứ cần ngăn là dội thư đặt lại mật khẩu vào hộp thư của một người, mà việc
   * đó đếm theo email chứ không đếm theo IP - đổi IP là lách được.
   *
   * Cả hai mức đều trả lời giống hệt nhau dù email có tài khoản hay không, nên
   * không mức nào biến thành công cụ dò xem ai có tài khoản.
   */
  const ip = clientIp(request);
  const byIp = hit(`quen-mk-ip:${ip}`, 12, 10 * 60 * 1000);
  if (!byIp.allowed) return tooMany(byIp);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: true });

  const email = parsed.data.email;
  const byMail = hit(`quen-mk-mail:${email}`, 3, 10 * 60 * 1000);
  if (!byMail.allowed) return tooMany(byMail);

  const db = await getDb();
  const rows = await db
    .select({ id: users.id, name: users.name, status: users.status })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = rows[0];
  if (user && user.status === "active") {
    const token = await issueAuthToken(user.id, "reset_password");
    await sendMail(resetPasswordMail(email, user.name, token));
    await audit({
      actorUserId: user.id,
      action: "auth.reset_requested",
      entity: "users",
      entityId: user.id,
      ip,
    });
  }

  return Response.json({ ok: true });
}
