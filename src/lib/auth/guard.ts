import "server-only";

import { notFound, redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "./session";
import type { Role } from "@/lib/db/schema";

/**
 * Cửa duy nhất để vào dữ liệu riêng tư. Mọi route handler và mọi server
 * component có dữ liệu của học viên đều đi qua đây - yêu cầu B-06 nói rõ việc
 * ẩn nút trên giao diện không tính là phân quyền.
 */

const STAFF: Role[] = ["editor", "support", "admin"];

/** Dùng trong server component: chưa đăng nhập thì chuyển hướng. */
export async function requireUser(nextPath: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/dang-nhap?tiep=${encodeURIComponent(nextPath)}`);
  return user;
}

/**
 * Khu quản trị trả 404 chứ không 403: người không có quyền thậm chí không nên
 * biết đường dẫn đó tồn tại.
 */
export async function requireStaff(nextPath: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/dang-nhap?tiep=${encodeURIComponent(nextPath)}`);
  if (!STAFF.includes(user.role)) notFound();
  return user;
}

export async function requireAdmin(nextPath: string): Promise<SessionUser> {
  const user = await requireStaff(nextPath);
  if (user.role !== "admin") notFound();
  return user;
}

/** Dùng trong route handler: trả JSON 401/403, không bao giờ chuyển hướng. */
export async function apiUser(): Promise<
  { ok: true; user: SessionUser } | { ok: false; response: Response }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      response: Response.json(
        { error: { code: "unauthenticated", message: "Cần đăng nhập." } },
        { status: 401 },
      ),
    };
  }
  return { ok: true, user };
}

export async function apiStaff(): Promise<
  { ok: true; user: SessionUser } | { ok: false; response: Response }
> {
  const result = await apiUser();
  if (!result.ok) return result;
  if (!STAFF.includes(result.user.role)) {
    return {
      ok: false,
      response: Response.json(
        { error: { code: "forbidden", message: "Không có quyền." } },
        { status: 403 },
      ),
    };
  }
  return result;
}

/**
 * Chốt chặn cuối cùng cho ownership. Gọi nó ngay trước khi trả về hoặc ghi bất
 * kỳ bản ghi nào có `userId`; nó biến một lỗi phân quyền thành lỗi lập trình
 * nhìn thấy ngay, thay vì một lần rò dữ liệu im lặng.
 */
export function assertOwner(row: { userId: number } | null | undefined, userId: number): boolean {
  return Boolean(row) && row!.userId === userId;
}
