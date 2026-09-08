import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";
import { skillStateFor } from "@/lib/queries";
import { getDb } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { skillScores, SKILL_LABEL_VI, type Skill } from "@/lib/db/schema";
import { CURRICULUM } from "@/content/curriculum";

export const metadata: Metadata = { title: "Kết quả kiểm tra" };

const SKILL_NOTE: Record<Skill, string> = {
  reading: "Đọc hiểu và nhận biết cấu trúc câu.",
  listening: "Nghe hiểu câu và đoạn thoại ngắn.",
  writing: "Viết đoạn ngắn theo yêu cầu của đề.",
  speaking: "Nói thành câu trong tình huống thật.",
};

/**
 * Kết quả xếp lớp.
 *
 * Trang này phải chịu được sự thật khó chịu: một người có thể ở A2 phần Nghe
 * nhưng A1 phần Viết, và phần Nói thì chưa đánh giá được. Nó trình bày từng kỹ
 * năng riêng, kèm bằng chứng, thay vì nặn ra một con số chung cho gọn.
 */
export default async function ResultPage() {
  const user = await requireUser("/hoc/ket-qua");
  const skills = await skillStateFor(user.id);

  const db = await getDb();
  const rows = await db
    .select({
      skill: skillScores.skill,
      evidence: skillScores.evidence,
      createdAt: skillScores.createdAt,
    })
    .from(skillScores)
    .where(eq(skillScores.userId, user.id))
    .orderBy(desc(skillScores.createdAt));

  const evidenceFor = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    if (!evidenceFor.has(row.skill)) {
      evidenceFor.set(row.skill, (row.evidence ?? {}) as Record<string, unknown>);
    }
  }

  const assessed = skills.filter((s) => !s.unknown);
  const known = assessed.map((s) => s.level!).filter(Boolean);
  // Điểm bắt đầu là mức THẤP NHẤT trong các kỹ năng đã đo được. Lấy mức cao
  // nhất sẽ đẩy người học vào bài quá sức ở đúng kỹ năng họ yếu nhất.
  const startLevel = known.length
    ? (["A1", "A2", "B1", "B2"].find((l) => known.includes(l as never)) ?? "A1")
    : null;
  const plan = CURRICULUM.find((c) => c.level === startLevel);

  if (assessed.length === 0 && rows.length === 0) {
    return (
      <>
        <div className="page-head">
          <h1>Kết quả kiểm tra</h1>
        </div>
        <div className="empty">
          <h3>Bạn chưa làm bài kiểm tra nào</h3>
          <p>Làm bài xếp lớp để biết nên bắt đầu từ đâu. Khoảng 10–15 phút.</p>
          <p style={{ marginTop: "var(--s-5)" }}>
            <Link href="/hoc/xep-lop" className="btn btn--primary">
              Làm bài kiểm tra
            </Link>
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>Kết quả kiểm tra</h1>
        <p>
          Mỗi kỹ năng được đo riêng. Chênh lệch giữa các kỹ năng là chuyện bình thường, không phải
          lỗi của bạn.
        </p>
      </div>

      {startLevel && (
        <div className="result-hero">
          <div>
            <p className="result-hero__label">Điểm bắt đầu đề xuất</p>
            <p className="result-hero__level">{startLevel}</p>
          </div>
          <div className="result-hero__body">
            <h2>{plan?.headline}</h2>
            <p>
              Chúng tôi lấy mức <strong>thấp nhất</strong> trong các kỹ năng đã đo được làm điểm
              bắt đầu. Bắt đầu ở mức cao hơn sẽ khiến bạn hụt hơi đúng ở kỹ năng yếu nhất, và đó là
              lý do phổ biến nhất khiến người học bỏ giữa chừng.
            </p>
          </div>
        </div>
      )}

      <div className="result-grid">
        {skills.map((s) => {
          const evidence = evidenceFor.get(s.skill) ?? {};
          const blocks = (evidence.blocks ?? []) as { level: string; right: number; done: number }[];
          const checked = (evidence.checked ?? []) as { label: string; ok: boolean }[];
          const reason = typeof evidence.reason === "string" ? evidence.reason : null;
          const note = typeof evidence.note === "string" ? evidence.note : null;
          const words = typeof evidence.words === "number" ? evidence.words : null;
          const minWords = typeof evidence.minWords === "number" ? evidence.minWords : null;

          return (
            <section key={s.skill} className="card result-card">
              <div className="result-card__head">
                <h3>{SKILL_LABEL_VI[s.skill]}</h3>
                {s.unknown ? (
                  <span className="badge badge--warning">chưa đánh giá được</span>
                ) : (
                  <span className="badge badge--lime">{s.level}</span>
                )}
              </div>
              <p className="result-card__note">{SKILL_NOTE[s.skill]}</p>

              {!s.unknown && (
                <p className="result-card__conf">
                  Độ tin cậy {Math.round(s.confidence * 100)}%
                  {s.confidence < 0.4 ? " — đây là ước lượng sơ bộ." : ""}
                </p>
              )}

              {blocks.length > 0 && (
                <ul className="result-blocks">
                  {blocks.map((b) => (
                    <li key={b.level}>
                      <span>{b.level}</span>
                      <span>
                        {b.right}/{b.done} câu đúng
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Đủ tiêu chí nội dung mà vẫn chưa đánh giá được thì gần như
                  luôn là do bài viết quá ngắn. Không nói ra thì người học nhìn
                  bốn dấu tích màu xanh và không hiểu mình còn thiếu gì. */}
              {words !== null && minWords !== null && (
                <p className="result-card__conf">
                  Bạn viết <strong>{words}</strong> từ; đề cần ít nhất{" "}
                  <strong>{minWords}</strong> từ.
                  {words < minWords ? " Viết dài hơn để có đủ bằng chứng chấm." : ""}
                </p>
              )}

              {checked.length > 0 && (
                <ul className="result-checks">
                  {checked.map((c) => (
                    <li key={c.label} data-ok={c.ok}>
                      {c.ok ? "✓" : "✕"} {c.label}
                    </li>
                  ))}
                </ul>
              )}

              {(reason || note) && <p className="result-card__why">{reason ?? note}</p>}
            </section>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: "var(--s-8)" }}>
        <h2 style={{ fontSize: "var(--fs-lg)" }}>Bước tiếp theo</h2>
        <ul className="tick">
          <li>Kỹ năng nào ghi &quot;chưa đánh giá được&quot; nghĩa là chúng tôi chưa có đủ bằng chứng — không phải bạn kém ở đó.</li>
          <li>Bạn làm lại bài kiểm tra bất cứ lúc nào; kết quả mới sẽ được dùng thay cho kết quả cũ.</li>
          <li>Bài học của cấp độ này đang được biên soạn và duyệt trước khi mở.</li>
        </ul>
        <div style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap", marginTop: "var(--s-5)" }}>
          <Link href="/hoc" className="btn btn--primary">
            Về bảng học
          </Link>
          <Link href="/hoc/xep-lop" className="btn btn--secondary">
            Làm lại bài kiểm tra
          </Link>
        </div>
      </div>
    </>
  );
}
