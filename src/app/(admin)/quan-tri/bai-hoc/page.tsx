import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guard";
import { lessonList } from "@/lib/lop-hoc-db";
import { LessonReview } from "@/components/LessonReview";

export const metadata: Metadata = { title: "Duyệt bài học" };

/**
 * Duyệt nội dung bài học.
 *
 * Bài học do máy soạn phải có người đọc trước khi học viên học. Trang này là
 * chỗ việc đó xảy ra, và nó cố tình bày ra TOÀN BỘ nội dung sẽ được dùng - câu
 * mở lời, tình huống, mục tiêu, trọng tâm - chứ không chỉ một cái tên bài và
 * một nút duyệt. Duyệt mà không đọc được nội dung thì chữ ký ấy vô nghĩa.
 */
export default async function LessonReviewPage() {
  const user = await requireStaff("/quan-tri/bai-hoc");
  const lessons = await lessonList(true);

  const waiting = lessons.filter((l) => !l.published);
  const published = lessons.filter((l) => l.published);

  return (
    <>
      <div className="page-head">
        <h1>Duyệt bài học</h1>
        <p>
          {waiting.length} bài chờ duyệt · {published.length} bài đã mở cho học viên. Bài chưa duyệt
          chỉ hiện với biên tập viên và quản trị.
        </p>
      </div>

      {lessons.length === 0 ? (
        <div className="empty">
          <h3>Chưa có bài học nào trong cơ sở dữ liệu</h3>
          <p>Chạy `npm run seed` để nạp bộ bài học mẫu.</p>
        </div>
      ) : (
        <div className="stack" style={{ gap: "var(--s-5)" }}>
          {[...waiting, ...published].map((lesson) => (
            <LessonReview
              key={lesson.versionId}
              versionId={lesson.versionId}
              code={lesson.code}
              level={lesson.level}
              title={lesson.title}
              published={lesson.published}
              body={lesson.body}
              canPublish={user.role === "admin" || user.role === "editor"}
            />
          ))}
        </div>
      )}
    </>
  );
}
