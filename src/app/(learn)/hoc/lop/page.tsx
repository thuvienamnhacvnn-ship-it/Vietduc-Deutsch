import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";
import { lessonList } from "@/lib/lop-hoc-db";
import { skillStateFor } from "@/lib/queries";
import { adapterMode } from "@/lib/config";

export const metadata: Metadata = { title: "Lớp học nói" };

/**
 * Danh sách buổi học nói.
 *
 * Xếp theo mức của người học chứ không theo thứ tự trong cơ sở dữ liệu: buổi
 * đúng mức nằm trên cùng và được đánh dấu, những buổi cao hơn vẫn thấy được
 * nhưng không phải là thứ đập vào mắt trước.
 */
export default async function ClassListPage() {
  const user = await requireUser("/hoc/lop");
  const canSeeDrafts = user.role === "editor" || user.role === "admin";
  const lessons = await lessonList(canSeeDrafts);
  const skills = await skillStateFor(user.id);

  const measured = skills.filter((s) => !s.unknown && s.level).map((s) => s.level!);
  const order = ["A1", "A2", "B1", "B2"];
  const myLevel = measured.length
    ? order.find((l) => measured.includes(l as never)) ?? "A1"
    : null;

  const llmOff = adapterMode("llm") !== "live";

  return (
    <>
      <div className="page-head">
        <h1>Lớp học nói</h1>
        <p>
          Mỗi buổi là một tình huống thật: bạn nói, cô Anna nghe và trả lời bằng tiếng Đức, giải
          thích bằng tiếng Việt. Mỗi lượt chỉ sửa một lỗi.
        </p>
      </div>

      {llmOff && (
        <div className="alert" role="status" style={{ marginBottom: "var(--s-6)" }}>
          <p>
            Máy chủ giảng dạy chưa được bật trên bản cài này, nên chưa có buổi học nào diễn ra
            được. Bạn vẫn xem được nội dung từng buổi.
          </p>
        </div>
      )}

      {!myLevel && (
        <p className="note-quiet" style={{ marginBottom: "var(--s-6)" }}>
          Bạn chưa làm bài kiểm tra xếp lớp, nên chưa biết nên bắt đầu từ buổi nào.{" "}
          <Link href="/hoc/xep-lop">Làm bài kiểm tra</Link> trước sẽ hợp lý hơn.
        </p>
      )}

      {lessons.length === 0 ? (
        <div className="empty">
          <h3>Chưa có buổi học nào được duyệt</h3>
          <p>
            Nội dung đã soạn nhưng còn chờ người duyệt. Bài học do máy soạn phải có người đọc lại
            trước khi học viên học — đó là ràng buộc của dự án, không phải một bước hình thức.
          </p>
        </div>
      ) : (
        <div className="lesson-grid">
          {lessons.map((lesson) => (
            <Link key={lesson.code} href={`/hoc/lop/${lesson.code.toLowerCase()}`} className="lesson-card">
              <div className="lesson-card__top">
                <span className="badge badge--gold">{lesson.level}</span>
                {lesson.level === myLevel && <span className="badge">vừa mức của bạn</span>}
                {!lesson.published && <span className="badge badge--warning">bản nháp</span>}
              </div>
              <h2>{lesson.title}</h2>
              <p>{lesson.body?.situationVi}</p>
              <span className="lesson-card__go">Vào buổi học →</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
