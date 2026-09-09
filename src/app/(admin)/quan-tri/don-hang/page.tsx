import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guard";
import { pendingOrders } from "@/lib/thanh-toan";
import { ConfirmPayment } from "@/components/ConfirmPayment";

export const metadata: Metadata = { title: "Đơn hàng" };

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(cents / 100);
}

/**
 * Đối chiếu sao kê và cấp quyền học.
 *
 * Đây là bước người thật trong luồng thanh toán bằng chuyển khoản. Nó cố ý
 * không tự động: không có webhook nào của ngân hàng ở đây, nên phải có người mở
 * sao kê ra, tìm mã chuyển khoản, rồi bấm xác nhận. Việc đó được ghi lại kèm
 * tên người bấm.
 */
export default async function OrdersPage() {
  const user = await requireStaff("/quan-tri/don-hang");
  const orders = await pendingOrders();
  const waiting = orders.filter((o) => o.status === "pending");

  return (
    <>
      <div className="page-head">
        <h1>Đơn hàng</h1>
        <p>
          {waiting.length} đơn chờ đối chiếu. Tìm mã chuyển khoản trong sao kê ngân hàng rồi xác
          nhận; quyền học được cấp ngay sau đó.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="empty">
          <h3>Chưa có đơn nào</h3>
          <p>Đơn xuất hiện ở đây ngay khi học viên đặt gói học.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Mã chuyển khoản</th>
                <th>Học viên</th>
                <th>Gói</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Xác nhận</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.code}</strong>
                  </td>
                  <td>#{o.userId}</td>
                  <td style={{ whiteSpace: "normal" }}>{o.planName}</td>
                  <td>{money(o.amountCents, o.currency)}</td>
                  <td>{o.status === "paid" ? "đã thanh toán" : "chờ chuyển khoản"}</td>
                  <td>
                    {o.status === "pending" && user.role === "admin" ? (
                      <ConfirmPayment orderId={o.id} code={o.code ?? ""} />
                    ) : o.status === "pending" ? (
                      <span className="hint">chỉ quản trị xác nhận được</span>
                    ) : (
                      <span className="hint">xong</span>
                    )}
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
