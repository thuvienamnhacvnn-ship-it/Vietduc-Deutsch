"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";
import type { Lesson } from "@/lib/lop-hoc";

/**
 * Một bài học trong màn hình duyệt.
 *
 * Nội dung mở sẵn, không giấu sau nút "xem chi tiết": người duyệt phải đọc được
 * mọi câu sẽ đến tay học viên mà không phải bấm thêm lần nào. Nút duyệt nằm ở
 * cuối, sau nội dung - đúng thứ tự của việc đọc rồi mới quyết.
 */
export function LessonReview({
  versionId,
  code,
  level,
  title,
  published,
  body,
  canPublish,
}: {
  versionId: number;
  code: string;
  level: string;
  title: string;
  published: boolean;
  body: Lesson;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    const res = await apiPost("/api/quan-tri/bai-hoc", {
      versionId,
      publish: !published,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    router.refresh();
  }

  return (
    <article className="card">
      <div className="lesson-card__top">
        <span className="badge badge--gold">{level}</span>
        <span className="badge">{code}</span>
        {published ? (
          <span className="badge">đã duyệt</span>
        ) : (
          <span className="badge badge--warning">chờ duyệt</span>
        )}
      </div>

      <h2 style={{ fontSize: "var(--fs-lg)" }}>{title}</h2>

      <dl className="exam-record__grid" style={{ marginTop: "var(--s-4)" }}>
        <div>
          <dt>Tình huống</dt>
          <dd>{body?.situationVi}</dd>
        </div>
        <div>
          <dt>Mục tiêu</dt>
          <dd>{body?.goalVi}</dd>
        </div>
        <div>
          <dt>Câu Anna mở lời</dt>
          <dd lang="de">{body?.openerDe}</dd>
        </div>
        <div>
          <dt>Nghĩa tiếng Việt</dt>
          <dd>{body?.openerVi}</dd>
        </div>
      </dl>

      {body?.focus?.length > 0 && (
        <ul className="tick" style={{ marginTop: "var(--s-4)" }}>
          {body.focus.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}

      {error && (
        <div className="alert alert--error" role="alert">
          <p>{error}</p>
        </div>
      )}

      {canPublish && (
        <button
          type="button"
          className={published ? "btn btn--secondary btn--sm" : "btn btn--primary btn--sm"}
          onClick={toggle}
          disabled={busy}
          style={{ marginTop: "var(--s-5)" }}
        >
          {busy && <span className="spinner" aria-hidden="true" />}
          {published ? "Rút lại để sửa" : "Tôi đã đọc và duyệt bài này"}
        </button>
      )}
    </article>
  );
}
