import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Băm mật khẩu, tách khỏi `auth/session.ts` để script seed dùng được mà không
 * kéo theo các API request của Next.js.
 *
 * scrypt lấy từ chính node:crypto. argon2 và bcrypt đều ship native binary, thứ
 * bị Smart App Control chặn trên máy phát triển này - hàm băm mật khẩu không
 * phải chỗ để phát hiện điều đó lúc chạy.
 */

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEYLEN);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = await scrypt(password, salt, KEYLEN);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

/**
 * Yêu cầu tối thiểu cho mật khẩu. Cố ý không bắt ký tự đặc biệt: độ dài mới là
 * thứ thật sự có ích, và luật rườm rà chỉ đẩy người dùng sang mật khẩu dễ đoán.
 */
export function passwordProblem(password: string): string | null {
  if (password.length < 10) return "Mật khẩu cần ít nhất 10 ký tự.";
  if (password.length > 200) return "Mật khẩu quá dài.";
  if (/^\d+$/.test(password)) return "Mật khẩu không nên chỉ gồm chữ số.";
  return null;
}
