import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";
import { skillStateFor } from "@/lib/queries";
import { getDb } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { skillScores, SKILL_LABEL_VI, type Skill } from "@/lib/db/schema";
import { CURRICULUM } from "@/content/curriculum";
import { recommendCourse } from "@/content/khoa-hoc";
import { DISCLAIMER, RESULT_VALID_DAYS, SCORING } from "@/content/quy-che-thi";
import { PrintButton } from "@/components/PrintButton";
import { ResetPlacement } from "@/components/ResetPlacement";

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

  type ExamRecord = {
    code: string;
    regulation: string;
    startedAt: string;
    completedAt: string | null;
    minutes: number;
    pledgedAt: string | null;
    listensUsed: number;
    itemsAnswered: number;
    itemsSkipped: number;
  };
  const evidenceFor = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    if (!evidenceFor.has(row.skill)) {
      evidenceFor.set(row.skill, (row.evidence ?? {}) as Record<string, unknown>);
    }
  }

  // Hồ sơ bài thi được ghim vào từng dòng điểm của cùng một lần làm bài, nên
  // dòng mới nhất nào có nó cũng cho ra cùng một kết quả.
  const record =
    ([...evidenceFor.values()]
      .map((ev) => ev.examRecord)
      .find(Boolean) as ExamRecord | undefined) ?? null;

  const assessed = skills.filter((s) => !s.unknown);
  const known = assessed.map((s) => s.level!).filter(Boolean);
  // Điểm bắt đầu là mức THẤP NHẤT trong các kỹ năng đã đo được. Lấy mức cao
  // nhất sẽ đẩy người học vào bài quá sức ở đúng kỹ năng họ yếu nhất.
  const startLevel = known.length
    ? (["A1", "A2", "B1", "B2"].find((l) => known.includes(l as never)) ?? "A1")
    : null;
  const plan = CURRICULUM.find((c) => c.level === startLevel);

  // Khoá học đề xuất. Một mức CEFR chưa phải là lời khuyên: người học cần biết
  // ngày mai vào lớp nào, học bao nhiêu giờ, và phải bù kỹ năng gì.
  const endedEarly = [...evidenceFor.values()].some((ev) => ev.endedEarly === true);
  const recommendation = recommendCourse(
    skills.map((s) => ({
      skill: s.skill,
      level: s.level ?? null,
      confidence: s.confidence,
      insufficientEvidence: s.unknown,
    })),
    endedEarly,
  );

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

{/*
        Khoá học đề xuất đứng TRƯỚC bảng điểm từng kỹ năng.
        Người học mở trang này để biết "vậy giờ tôi học gì", không phải để đọc
        bốn con số. Bằng chứng nằm ngay bên dưới cho ai muốn xem.
      */}
      <section className="course-pick">
        <div className="course-pick__head">
          <span className="course-pick__code">{recommendation.course.code}</span>
          <div>
            <p className="course-pick__label">Khoá học phù hợp với bạn</p>
            <h2>{recommendation.course.name}</h2>
          </div>
        </div>

        <p className="course-pick__reason">{recommendation.reason}</p>

        <dl className="course-pick__facts">
          <div>
            <dt>Mức bắt đầu</dt>
            <dd>{startLevel ?? recommendation.course.level}</dd>
          </div>
          <div>
            <dt>Thời lượng</dt>
            <dd>{recommendation.course.hours} giờ học</dd>
          </div>
          <div>
            <dt>Học xong làm được</dt>
            <dd>{recommendation.course.outcome}</dd>
          </div>
        </dl>

        <div className="course-pick__focus">
          <h3>Nội dung chính</h3>
          <ul>
            {recommendation.course.focus.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        {recommendation.support.length > 0 && (
          <div className="course-pick__support">
            <h3>Cần bù thêm</h3>
            <ul>
              {recommendation.support.map((sup) => (
                <li key={sup.skill}>{sup.note}</li>
              ))}
            </ul>
          </div>
        )}

        {recommendation.endedEarly && (
          <p className="course-pick__flag">
            Bài này bạn dừng giữa chừng, nên kết quả mỏng hơn bình thường. Khoá ở trên vẫn dùng
            được để bắt đầu; làm hết bài một lần nữa sẽ cho kết quả sát hơn.
          </p>
        )}

        {recommendation.nextCourse && (
          <p className="course-pick__next">
            Sau khoá này: <strong>{recommendation.nextCourse.code}</strong> —{" "}
            {recommendation.nextCourse.name}
          </p>
        )}

        {plan?.headline && <p className="course-pick__plan">{plan.headline}</p>}
      </section>

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
                  <span className="badge badge--gold">{s.level}</span>
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

      {/*
        Hồ sơ bài thi. Một mức trình độ không kèm điều kiện tạo ra nó thì không
        kiểm chứng được: làm bao lâu, nghe lại mấy lần, có ký cam kết không.
        Đây là phần biến kết quả từ một con số thành một phiếu dùng được.
      */}
      {record && (
        <section className="card exam-record">
          <div className="exam-record__head">
            <h2>Hồ sơ bài thi</h2>
            <span className="exam-record__code">{record.code}</span>
          </div>

          <dl className="exam-record__grid">
            <div>
              <dt>Ngày làm bài</dt>
              <dd>{new Date(record.startedAt).toLocaleString("vi-VN")}</dd>
            </div>
            <div>
              <dt>Thời gian làm</dt>
              <dd>{record.minutes} phút</dd>
            </div>
            <div>
              <dt>Số câu đã làm</dt>
              <dd>
                {record.itemsAnswered}
                {record.itemsSkipped > 0 ? ` (bỏ qua ${record.itemsSkipped})` : ""}
              </dd>
            </div>
            <div>
              <dt>Lượt nghe đã dùng</dt>
              <dd>{record.listensUsed}</dd>
            </div>
            <div>
              <dt>Quy chế áp dụng</dt>
              <dd>
                <a href="/quy-che-thi">Phiên bản {record.regulation}</a>
              </dd>
            </div>
            <div>
              <dt>Cam kết trung thực</dt>
              <dd>
                {record.pledgedAt
                  ? `đã ký ${new Date(record.pledgedAt).toLocaleString("vi-VN")}`
                  : "không có"}
              </dd>
            </div>
          </dl>

          <p className="exam-record__valid">
            Kết quả có giá trị tham khảo trong {RESULT_VALID_DAYS} ngày kể từ ngày làm bài.
          </p>

          <PrintButton />
        </section>
      )}

      <section className="card" style={{ marginTop: "var(--s-8)" }}>
        <h2 style={{ fontSize: "var(--fs-lg)" }}>Cách chấm từng kỹ năng</h2>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Kỹ năng</th>
                <th>Cách chấm</th>
                <th>Độ tin cậy</th>
              </tr>
            </thead>
            <tbody>
              {SCORING.map((row) => (
                <tr key={row.skill}>
                  <td>{SKILL_LABEL_VI[row.skill]}</td>
                  <td style={{ whiteSpace: "normal" }}>{row.how}</td>
                  <td style={{ whiteSpace: "normal" }}>{row.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="tick" style={{ marginTop: "var(--s-5)", marginBottom: 0 }}>
          {DISCLAIMER.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

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

        {/*
          Hai đường làm lại, và chúng khác nhau:

          "Làm lại bài kiểm tra" ở trên giữ nguyên lịch sử - lần thi mới nằm
          cạnh lần cũ, và hệ thống tránh những câu đã gặp.

          Nút dưới đây XOÁ lịch sử. Cần khi ai đó đã thi nhiều lần và đề bắt đầu
          lặp, hoặc khi họ muốn bắt đầu lại sạch sẽ. Nó nằm tách xuống dưới,
          không cùng hàng với hai nút kia, vì một thao tác xoá không nên đứng
          cạnh những thao tác vô hại.
        */}
        <div className="ket-qua__lam-lai">
          <p>
            Đã thi nhiều lần và thấy câu hỏi lặp lại? Xoá lịch sử để đề rộng trở lại. Buổi học nói,
            thẻ ôn tập và gói học của bạn không bị đụng tới.
          </p>
          <ResetPlacement label="Xoá lịch sử và làm lại từ đầu" compact />
        </div>
      </div>
    </>
  );
}
