import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { and, eq, gt, isNull, lt, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { authTokens, sessions, users, type Role } from "@/lib/db/schema";

export const SESSION_COOKIE = "lingora_session";
const SESSION_DAYS = 14;

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
};

export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const db = await getDb();

  const hdrs = await headers();
  await db.insert(sessions).values({
    token,
    userId,
    expiresAt,
    userAgent: hdrs.get("user-agent")?.slice(0, 300) ?? null,
  });
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    // Thu hồi thay vì xóa: giữ được dấu vết phiên cho audit.
    await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.token, token));
  }
  jar.delete(SESSION_COOKIE);
}

/** Người dùng của phiên hiện tại, hoặc null. Không bao giờ ném lỗi. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const db = await getDb();
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        emailVerifiedAt: users.emailVerifiedAt,
        status: users.status,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.token, token),
          gt(sessions.expiresAt, new Date()),
          isNull(sessions.revokedAt),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row || row.status !== "active") return null;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      emailVerified: Boolean(row.emailVerifiedAt),
    };
  } catch {
    // Database chưa sẵn sàng (chưa migrate) thì coi như chưa đăng nhập, chứ
    // không làm sập trang công khai.
    return null;
  }
}

/* ------------------------------------------------------- token dùng một lần */

const TOKEN_TTL_MINUTES = { verify_email: 60 * 24, reset_password: 60 } as const;

function digest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Sinh token dùng một lần. Chỉ HASH được lưu; giá trị thô trả về đúng một lần
 * cho người gọi để đưa vào email, sau đó không lấy lại được từ cơ sở dữ liệu.
 */
export async function issueAuthToken(
  userId: number,
  purpose: "verify_email" | "reset_password",
): Promise<string> {
  const db = await getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES[purpose] * 60 * 1000);

  // Token cũ cùng mục đích mất hiệu lực ngay: chỉ liên kết mới nhất còn dùng được.
  await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(
      and(eq(authTokens.userId, userId), eq(authTokens.purpose, purpose), isNull(authTokens.usedAt)),
    );

  await db.insert(authTokens).values({ userId, tokenHash: digest(token), purpose, expiresAt });
  return token;
}

/**
 * Dùng token đúng một lần. Trả về userId khi hợp lệ, null khi sai/hết hạn/đã
 * dùng. Việc đánh dấu đã dùng nằm trong cùng câu lệnh UPDATE có điều kiện, nên
 * hai request đồng thời không thể cùng đổi được một token.
 */
export async function consumeAuthToken(
  token: string,
  purpose: "verify_email" | "reset_password",
): Promise<number | null> {
  const db = await getDb();
  const updated = await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(authTokens.tokenHash, digest(token)),
        eq(authTokens.purpose, purpose),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, new Date()),
      ),
    )
    .returning({ userId: authTokens.userId });

  return updated[0]?.userId ?? null;
}

/** Dọn token hết hạn và phiên đã hết hiệu lực. Gọi từ job nền. */
export async function purgeExpired(): Promise<void> {
  const db = await getDb();
  const now = new Date();
  await db.delete(authTokens).where(lt(authTokens.expiresAt, now));
  await db.delete(sessions).where(or(lt(sessions.expiresAt, now), isNull(sessions.userId)));
}
