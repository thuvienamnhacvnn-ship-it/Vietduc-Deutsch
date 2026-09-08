import type { Metadata } from "next";
import { sql } from "drizzle-orm";
import { requireStaff } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { adapterStatus } from "@/lib/config";
import { agentRuns, auditLogs, lessonVersions, users } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Quản trị" };

const SERVICE_VI: Record<string, string> = {
  llm: "Mô hình ngôn ngữ",
  stt: "Nhận dạng giọng nói",
  tts: "Tổng hợp giọng nói",
  avatar: "Avatar khẩu hình",
  mail: "Email giao dịch",
  payments: "Thanh toán",
  storage: "Lưu trữ tệp",
};

async function count(table: Parameters<typeof sql>[0] extends never ? never : string) {
  const db = await getDb();
  const rows = await db.execute<{ n: number }>(sql.raw(`select count(*)::int as n from "${table}"`));
  // drizzle trả về hình dạng khác nhau giữa PGlite và node-postgres.
  const arr = (Array.isArray(rows) ? rows : (rows as { rows?: { n: number }[] }).rows) ?? [];
  return arr[0]?.n ?? 0;
}

export default async function AdminHome() {
  await requireStaff("/quan-tri");
  const status = adapterStatus();

  const [learners, publishedLessons, agentCalls, recent] = await Promise.all([
    count("users"),
    (async () => {
      const db = await getDb();
      const rows = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(lessonVersions)
        .where(sql`${lessonVersions.reviewState} = 'published'`);
      return rows[0]?.n ?? 0;
    })(),
    (async () => {
      const db = await getDb();
      const rows = await db.select({ n: sql<number>`count(*)::int` }).from(agentRuns);
      return rows[0]?.n ?? 0;
    })(),
    (async () => {
      const db = await getDb();
      return db
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          entity: auditLogs.entity,
          entityId: auditLogs.entityId,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .orderBy(sql`${auditLogs.createdAt} desc`)
        .limit(12);
    })(),
  ]);

  void users;

  return (
    <>
      <div className="page-head">
        <h1>Tổng quan vận hành</h1>
        <p>Số liệu đọc thẳng từ cơ sở dữ liệu đang chạy. Không có con số minh họa nào ở đây.</p>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <p className="stat__label">Tài khoản</p>
          <p className="stat__value">{learners}</p>
        </div>
        <div className="stat">
          <p className="stat__label">Bài học đã xuất bản</p>
          <p className="stat__value">{publishedLessons}</p>
          <p className="stat__note">Chỉ bản published mới đến được tay học viên.</p>
        </div>
        <div className="stat">
          <p className="stat__label">Lượt gọi agent</p>
          <p className="stat__value">{agentCalls}</p>
          <p className="stat__note">Chi phí và token ghi trong bảng agent_runs.</p>
        </div>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h2 style={{ fontSize: "var(--fs-lg)" }}>Kết nối dịch vụ</h2>
          <p style={{ color: "var(--muted)", fontSize: "var(--fs-sm)" }}>
            Đây là câu trả lời chính thức cho câu hỏi &quot;cái gì đã chạy thật&quot;. Bảng đọc từ
            biến môi trường của tiến trình đang chạy.
          </p>
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>Dịch vụ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(status).map(([key, mode]) => (
                  <tr key={key}>
                    <td>{SERVICE_VI[key] ?? key}</td>
                    <td>
                      {mode === "live" ? (
                        <span className="badge badge--success">live</span>
                      ) : (
                        <span className="mock-tag">mock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h2 style={{ fontSize: "var(--fs-lg)" }}>Trước khi mở bán</h2>
          <p style={{ color: "var(--muted)", fontSize: "var(--fs-sm)" }}>
            Danh sách này dành cho chủ dự án. Nó cố ý không nằm trên trang học phí công khai -
            người học không cần đọc kế hoạch nội bộ.
          </p>
          <ul className="tick" style={{ marginBottom: 0 }}>
            <li>Thông tin pháp nhân, tài khoản nhận tiền và thông tin thuế của doanh nghiệp.</li>
            <li>Điều khoản, chính sách hủy và hoàn tiền được người chịu trách nhiệm duyệt.</li>
            <li>Kết nối PayPal và một nhà cung cấp thẻ, kiểm thử sandbox trước khi bật live.</li>
            <li>Nội dung và bộ đánh giá của cấp độ được bán đã qua duyệt.</li>
            <li>Chuyển cờ <code>approved_for_sale</code> của bản giá tương ứng sang true.</li>
          </ul>
        </section>

        <section className="card">
          <h2 style={{ fontSize: "var(--fs-lg)" }}>Nhật ký gần đây</h2>
          {recent.length === 0 ? (
            <div className="empty">
              <h3>Chưa có hoạt động</h3>
              <p>Nhật ký ghi lại đăng nhập, đổi hồ sơ, chấm điểm và thao tác của agent.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>Thời điểm</th>
                    <th>Hành động</th>
                    <th>Đối tượng</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((row) => (
                    <tr key={row.id}>
                      <td>{new Date(row.createdAt).toLocaleString("vi-VN")}</td>
                      <td>{row.action}</td>
                      <td>
                        {row.entity}
                        {row.entityId ? ` #${row.entityId}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
