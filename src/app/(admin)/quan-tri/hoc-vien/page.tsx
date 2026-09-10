import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { requireStaff } from "@/lib/auth/guard";
import { ResetPlacement } from "@/components/ResetPlacement";
import { getDb } from "@/lib/db";
import { learnerProfiles, users } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Học viên" };

const ROLE_VI: Record<string, string> = {
  learner: "Học viên",
  editor: "Biên tập",
  support: "Hỗ trợ",
  admin: "Quản trị",
};

export default async function AdminLearners() {
  await requireStaff("/quan-tri/hoc-vien");
  const db = await getDb();

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      verified: users.emailVerifiedAt,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
      goal: learnerProfiles.goal,
      hoursPerWeek: learnerProfiles.hoursPerWeek,
    })
    .from(users)
    .leftJoin(learnerProfiles, eq(learnerProfiles.userId, users.id))
    .orderBy(desc(users.createdAt))
    .limit(200);

  return (
    <>
      <div className="page-head">
        <h1>Học viên</h1>
        <p>
          {rows.length} tài khoản. Danh sách này chỉ dành cho nhân viên; học viên không truy cập
          được trang hay API nào ở đây.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <h3>Chưa có tài khoản nào</h3>
          <p>Tài khoản đầu tiên xuất hiện ở đây ngay sau khi có người đăng ký.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Xác minh</th>
                <th>Mục tiêu</th>
                <th>Giờ/tuần</th>
                <th>Đăng nhập gần nhất</th>
                <th>Bài kiểm tra</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{ROLE_VI[row.role] ?? row.role}</td>
                  <td>
                    {row.verified ? (
                      <span className="badge badge--success">đã xác minh</span>
                    ) : (
                      <span className="badge badge--warning">chưa</span>
                    )}
                  </td>
                  <td>{row.goal ?? "—"}</td>
                  <td>{row.hoursPerWeek ?? "—"}</td>
                  <td>
                    {row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString("vi-VN") : "chưa"}
                  </td>
                                  {/* Reset theo yêu cầu của học viên: đề lặp vì đã thi quá nhiều
                      lần, hoặc lần thi trước hỏng giữa chừng. Thao tác ghi vào
                      nhật ký kèm tên người bấm. */}
                  <td>
                    <ResetPlacement userId={row.id} label="Cho làm lại" compact />
                  </td>
</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
