"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";

/**
 * Nút xoá lịch sử bài kiểm tra để làm lại từ đầu.
 *
 * HAI BƯỚC có chủ đích. Đây là thao tác xoá và không lùi lại được; một cú bấm
 * nhầm ở trang kết quả sẽ cuốn đi toàn bộ bài đã làm. Bước thứ hai nói thẳng
 * cái gì mất, cái gì ở lại - người ta cần biết trước khi gật, không phải sau.
 *
 * Dùng ở hai nơi: học viên tự bấm trên trang kết quả của mình, và quản trị bấm
 * cho một học viên khi họ yêu cầu (`userId`).
 */
export function ResetPlacement({
  userId,
  label = "Làm lại từ đầu",
  compact = false,
}: {
  /** Bỏ trống là tự xoá của mình. Có giá trị là quản trị xoá cho học viên đó. */
  userId?: number;
  label?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reset() {
    setBusy(true);
    setError(null);
    const res = await apiPost<{ sessions: number; responses: number; scores: number }>(
      "/api/xep-lop/lam-lai",
      userId ? { userId } : {},
    );
    setBusy(false);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    setOpen(false);
    setDone(
      `Đã xoá ${res.data.sessions} lần làm bài, ${res.data.responses} câu trả lời và ${res.data.scores} dòng điểm kỹ năng.`,
    );
    router.refresh();
  }

  if (done) {
    return <p className="hint">{done}</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        className={compact ? "btn btn--ghost btn--sm" : "btn btn--secondary"}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="reset-xac-nhan" role="group" aria-label="Xác nhận làm lại bài kiểm tra">
      <strong>Xoá kết quả cũ và làm lại từ đầu?</strong>
      <ul>
        <li>
          <strong>Mất:</strong> mọi lần làm bài trước, các câu đã trả lời và mức trình độ đang có.
        </li>
        <li>
          <strong>Ở lại:</strong> tài khoản, buổi học nói đã học, thẻ ôn tập và gói học.
        </li>
        <li>
          Đề sẽ rộng trở lại, vì hệ thống không còn phải tránh những câu đã gặp.
        </li>
      </ul>

      {error && (
        <p className="hint" style={{ color: "var(--brand)" }}>
          {error}
        </p>
      )}

      <div className="reset-xac-nhan__row">
        <button type="button" className="btn btn--primary btn--sm" onClick={reset} disabled={busy}>
          {busy && <span className="spinner" aria-hidden="true" />}
          Xoá và làm lại
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setOpen(false)}
          disabled={busy}
        >
          Thôi, giữ nguyên
        </button>
      </div>
    </div>
  );
}
