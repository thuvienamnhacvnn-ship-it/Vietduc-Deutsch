import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { consents, learnerProfiles, users } from "@/lib/db/schema";
import { hashPassword, passwordProblem } from "@/lib/auth/password";
import { createSession, issueAuthToken } from "@/lib/auth/session";
import { sendMail, verifyEmailMail } from "@/lib/adapters/mail";
import { clientIp, hit, tooMany } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

/** Phiên bản văn bản pháp lý mà người dùng đồng ý. Tăng khi văn bản đổi. */
const LEGAL_VERSION = "0.1-draft";

const Body = z.object({
  email: z.string().trim().toLowerCase().email("Email không hợp lệ."),
  name: z.string().trim().min(2, "Cần ít nhất 2 ký tự.").max(120),
  password: z.string(),
  acceptTerms: z.literal(true, { message: "Cần đồng ý điều khoản để tạo tài khoản." }),
  marketingContact: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const ip = clientIp(request);
  // 10 chứ không phải 5: cả một văn phòng, một ký túc xá hay một nhà mạng dùng
  // CGNAT đều ra ngoài bằng chung một địa chỉ IP. Đặt quá chặt thì người thứ
  // sáu trong nhà không đăng ký được, mà kẻ tấn công thật thì đổi IP dễ hơn thế.
  const limit = hit(`dang-ky:${ip}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0])] = issue.message;
    return Response.json(
      { error: { code: "invalid_input", message: "Vui lòng kiểm tra lại thông tin.", fields } },
      { status: 400 },
    );
  }

  const { email, name, password, marketingContact } = parsed.data;

  const pwProblem = passwordProblem(password);
  if (pwProblem) {
    return Response.json(
      { error: { code: "invalid_input", message: pwProblem, fields: { password: pwProblem } } },
      { status: 400 },
    );
  }

  const db = await getDb();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    // Nói thật ở đây là đúng: người dùng cần biết để đi đăng nhập, và địa chỉ
    // email đã tồn tại hay chưa vốn đã lộ qua chính luồng đăng ký.
    return Response.json(
      {
        error: {
          code: "email_taken",
          message: "Email này đã có tài khoản. Bạn thử đăng nhập hoặc đặt lại mật khẩu.",
          fields: { email: "Email đã được dùng." },
        },
      },
      { status: 409 },
    );
  }

  const created = await db
    .insert(users)
    .values({ email, name, passwordHash: await hashPassword(password) })
    .returning({ id: users.id });
  const userId = created[0]!.id;

  await db.insert(learnerProfiles).values({ userId });
  await db.insert(consents).values([
    { userId, kind: "terms", granted: true, documentVersion: LEGAL_VERSION, ip },
    { userId, kind: "privacy", granted: true, documentVersion: LEGAL_VERSION, ip },
    { userId, kind: "marketing_contact", granted: marketingContact, documentVersion: LEGAL_VERSION, ip },
  ]);

  const token = await issueAuthToken(userId, "verify_email");
  const mail = await sendMail(verifyEmailMail(email, name, token));

  await createSession(userId);
  await audit({ actorUserId: userId, action: "auth.register", entity: "users", entityId: userId, ip });

  return Response.json({
    ok: true,
    needsVerification: true,
    // Nói rõ thư đang được gửi bằng adapter mock, để không ai tưởng đã có email thật.
    mailMode: mail.mode,
  });
}
