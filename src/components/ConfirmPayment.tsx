"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";

/**
 * Xác nhận đã nhận được tiền của một đơn.
 *
 * Hai bước có chủ đích: bấm rồi mới hiện ô ghi chú và nút xác nhận thật. Cấp
 * quyền học là việc động tới tiền của người khác, và một cú bấm nhầm ở bảng
 * danh sách thì không lùi lại được bằng một cú bấm khác.
 *
 * Ô ghi chú bắt buộc điền: nó là chỗ ghi ngày sao kê hoặc số giao dịch, thứ duy
 * nhất nối bản ghi trong hệ thống với tờ sao kê của ngân hàng.
 */
export function ConfirmPayment({ orderId, code }: { orderId: number; code: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [months, setMonths] = useState(3);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    const res = await apiPost("/api/quan-tri/don-hang", { orderId, note: note.trim(), months });
    setBusy(false);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" className="btn btn--secondary btn--sm" onClick={() => setOpen(true)}>
        Đã nhận tiền
      </button>
    );
  }

  return (
    <div className="stack" style={{ gap: "var(--s-2)", minWidth: "240px" }}>
      <label className="hint" htmlFor={`note-${orderId}`}>
        Sao kê ngày nào, giao dịch nào ({code})
      </label>
      <input
        id={`note-${orderId}`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="vd: sao kê 12/09, GD 3391"
      />
      <label className="hint" htmlFor={`months-${orderId}`}>
        Quyền học trong bao nhiêu tháng
      </label>
      <input
        id={`months-${orderId}`}
        type="number"
        min={1}
        max={24}
        value={months}
        onChange={(e) => setMonths(Number(e.target.value))}
      />
      {error && (
        <p className="hint" style={{ color: "var(--brand)" }}>
          {error}
        </p>
      )}
      <div style={{ display: "flex", gap: "var(--s-2)" }}>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={confirm}
          disabled={busy || note.trim().length < 3}
        >
          {busy && <span className="spinner" aria-hidden="true" />}
          Xác nhận và cấp quyền
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setOpen(false)}
          disabled={busy}
        >
          Thôi
        </button>
      </div>
    </div>
  );
}
