import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { classSessions, turns, type Level } from "@/lib/db/schema";
import { lessonList } from "@/lib/lop-hoc-db";
import { dueReviewCount, profileFor, skillStateFor } from "@/lib/queries";

/**
 * Dữ liệu cho màn hình chính của khu học viên.
 *
 * Màn hình đó phải trả lời được đúng một câu: "bây giờ tôi làm gì tiếp?". Muốn
 * trả lời thì phải biết học viên đang ở đâu trong giáo trình, đã nói bao nhiêu,
 * còn bao nhiêu thẻ tới hạn - nên gom hết vào một hàm, chạy một lượt, thay vì
 * để trang tự ghép từ năm truy vấn rời.
 *
 * MỌI CON SỐ Ở ĐÂY LÀ SỐ THẬT. Không có mục tiêu giả, không có "chuỗi ngày" bịa
 * ra từ ngày đăng ký. Chưa học buổi nào thì chuỗi ngày là 0 và màn hình nói
 * thẳng như vậy.
 */

export type HomeLesson = {
  code: string;
  level: Level;
  title: string;
  situationVi: string;
  /** done: đã học xong ít nhất một lần. doing: đã mở nhưng chưa kết thúc. */
  state: "done" | "doing" | "new";
};

export type LearnerHome = {
  /** Buổi nên học tiếp. null khi chưa có buổi nào được duyệt. */
  next: HomeLesson | null;
  /** Buổi kế tiếp nữa, để màn hình cho thấy con đường còn đi tiếp. */
  after: HomeLesson | null;
  done: number;
  total: number;
  /** Số ngày liên tiếp có nói ít nhất một câu, tính đến hôm nay. */
  streak: number;
  /** Tổng số lượt học viên đã nói. */
  spoken: number;
  due: number;
  skills: Awaited<ReturnType<typeof skillStateFor>>;
  /** Mức thấp nhất đo được - mức nên học, không phải mức cao nhất khoe được. */
  level: Level | null;
};

const ORDER: Level[] = ["A1", "A2", "B1", "B2"];

/**
 * Ngày theo múi giờ của người học, dạng "2026-09-10".
 *
 * Phải theo múi giờ của họ chứ không theo giờ máy chủ: một buổi học lúc 23h ở
 * Hà Nội mà máy chủ ghi theo UTC sẽ rơi sang hôm sau và làm đứt chuỗi ngày của
 * người không làm gì sai cả.
 */
function ngay(d: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(d);
  } catch {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" }).format(d);
  }
}

function lui(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Chuỗi ngày học liên tiếp.
 *
 * Tính từ HÔM NAY hoặc HÔM QUA trở về trước. Cho phép bắt đầu từ hôm qua vì
 * người chưa học hôm nay vẫn đang giữ chuỗi - nó chỉ đứt khi qua hết một ngày
 * trọn vẹn không học. Đây cũng là cách các ứng dụng học tập vẫn tính, và nó
 * đúng về mặt động viên: không ai bị mất chuỗi lúc 0h01 chỉ vì chưa kịp mở máy.
 */
function chuoiNgay(days: Set<string>, homNay: string): number {
  let moc = days.has(homNay) ? homNay : lui(homNay, 1);
  if (!days.has(moc)) return 0;
  let n = 0;
  while (days.has(moc)) {
    n += 1;
    moc = lui(moc, 1);
  }
  return n;
}

export async function learnerHome(userId: number): Promise<LearnerHome> {
  const db = await getDb();

  const [lessons, due, skills, profile] = await Promise.all([
    lessonList(false),
    dueReviewCount(userId),
    skillStateFor(userId),
    profileFor(userId),
  ]);

  const [sessions, spokenRows] = await Promise.all([
    db
      .select({
        versionId: classSessions.lessonVersionId,
        state: classSessions.state,
      })
      .from(classSessions)
      .where(eq(classSessions.userId, userId)),
    db
      .select({ createdAt: turns.createdAt })
      .from(turns)
      .where(and(eq(turns.userId, userId), eq(turns.role, "learner")))
      .orderBy(desc(turns.createdAt))
      .limit(500),
  ]);

  /* Một buổi tính là xong khi có ít nhất một phiên đã kết thúc. Mở rồi bỏ dở
     thì là "đang học", không phải "đã học" - đếm nó vào là tự dối. */
  const trangThai = new Map<number, "done" | "doing">();
  for (const s of sessions) {
    if (s.versionId == null) continue;
    const cu = trangThai.get(s.versionId);
    if (cu === "done") continue;
    trangThai.set(s.versionId, s.state === "done" ? "done" : "doing");
  }

  const danhSach: (HomeLesson & { versionId: number })[] = lessons.map((l) => ({
    versionId: l.versionId,
    code: l.code,
    level: l.level,
    title: l.title,
    situationVi: l.body?.situationVi ?? "",
    state: trangThai.get(l.versionId) ?? "new",
  }));

  const measured = skills.filter((s) => !s.unknown && s.level).map((s) => s.level!);
  const level = measured.length ? (ORDER.find((l) => measured.includes(l)) ?? null) : null;

  /*
   * Chọn buổi tiếp theo, theo thứ tự ưu tiên:
   *   1. buổi đang dở - quay lại chỗ vừa rời đi
   *   2. buổi chưa học đúng mức của mình
   *   3. buổi chưa học thấp nhất còn lại
   *   4. buổi đầu tiên (đã học hết thì học lại từ đầu, và màn hình nói rõ)
   */
  const dangDo = danhSach.find((l) => l.state === "doing");
  const chuaHoc = danhSach.filter((l) => l.state === "new");
  const dungMuc = level ? chuaHoc.find((l) => l.level === level) : undefined;
  const next = dangDo ?? dungMuc ?? chuaHoc[0] ?? danhSach[0] ?? null;
  const after = next ? (danhSach.find((l) => l.code !== next.code && l.state !== "done") ?? null) : null;

  const tz = profile.timezone || "Europe/Berlin";
  const days = new Set(spokenRows.map((r) => ngay(r.createdAt, tz)));

  return {
    next,
    after,
    done: danhSach.filter((l) => l.state === "done").length,
    total: danhSach.length,
    streak: chuoiNgay(days, ngay(new Date(), tz)),
    spoken: spokenRows.length,
    due,
    skills,
    level,
  };
}
