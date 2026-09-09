"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";

/**
 * Nút đặt mua một gói.
 *
 * Không có ô nhập thẻ và không có iframe của cổng thanh toán nào ở đây: đặt đơn
 * xong thì học viên nhận một mã chuyển khoản, chuyển tiền qua ngân hàng của
 * mình, và trường đối chiếu sao kê. Xem `src/lib/thanh-toan.ts` để biết vì sao
 * làm như vậy.
 *
 * Mã chuyển khoản hiện ngay tại chỗ sau khi đặt, không bắt người học đi tìm
 * trong email - email giao dịch còn chưa được nối trên bản cài này.
 */
export function BuyPanel({ versionId, planName }: { versionId: number; planName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function order() {
    setBusy(true);
    setError(null);
    const res = await apiPost<{ code: string }>("/api/goi-hoc/dat", { versionId });
    setBusy(false);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    setCode(res.data.code);
    router.refresh();
  }

  if (code) {
    return (
      <div className="buy-done">
        <p>
          Đã ghi nhận đơn <strong>{planName}</strong>. Mã chuyển khoản của bạn:
        </p>
        <p className="buy-code">{code}</p>
        <p>
          Ghi đúng mã này ở phần nội dung chuyển khoản. Quyền học được mở sau khi trường đối chiếu
          sao kê — thường trong một ngày làm việc.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "var(--s-4)" }}>
      <button type="button" className="btn btn--primary btn--block" onClick={order} disabled={busy}>
        {busy && <span className="spinner" aria-hidden="true" />}
        Đặt gói này
      </button>
      {error && (
        <p className="hint" style={{ color: "var(--brand)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
