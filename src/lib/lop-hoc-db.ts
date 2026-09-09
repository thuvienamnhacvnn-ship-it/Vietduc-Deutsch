import "server-only";

import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  classSessions,
  lessonVersions,
  lessons,
  modules,
  reviewItems,
  turns,
  type Level,
} from "@/lib/db/schema";
import type { Lesson } from "@/lib/lop-hoc";

/**
 * Buổi học nói: đọc bài từ cơ sở dữ liệu, ghi lại từng lượt, và biến lỗi được
 * sửa thành thẻ ôn tập.
 *
 * BÀI HỌC ĐỌC TỪ CƠ SỞ DỮ LIỆU, không đọc thẳng từ tệp nội dung. Vì bài phải
 * qua duyệt trước khi học viên học được, mà "đã duyệt hay chưa" là một trạng
 * thái thay đổi được - nó phải nằm trong cơ sở dữ liệu chứ không nằm trong mã
 * nguồn. Tệp `src/content/bai-hoc.ts` chỉ là NGUỒN để nạp vào lần đầu.
 */

export type LessonRow = {
  lessonId: number;
  versionId: number;
  code: string;
  level: Level;
  title: string;
  published: boolean;
  body: Lesson;
};

/**
 * Danh sách bài học.
 *
 * `includeDrafts` chỉ được bật cho biên tập viên và quản trị. Học viên thấy bài
 * chưa duyệt là hỏng chính cái quy trình duyệt.
 */
export async function lessonList(includeDrafts = false): Promise<LessonRow[]> {
  const db = await getDb();
  const rows = await db
    .select({
      lessonId: lessons.id,
      versionId: lessonVersions.id,
      slug: lessons.slug,
      title: lessons.title,
      state: lessonVersions.reviewState,
      version: lessonVersions.version,
      body: lessonVersions.body,
      position: lessons.position,
      moduleId: modules.id,
    })
    .from(lessonVersions)
    .innerJoin(lessons, eq(lessons.id, lessonVersions.lessonId))
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .orderBy(asc(lessons.position), asc(lessons.id));

  /*
   * Mỗi bài chỉ lấy MỘT phiên bản, và ưu tiên bản đã duyệt.
   *
   * Một bài có nhiều phiên bản là chuyện bình thường sau vài lần sửa nội dung.
   * Học viên phải thấy bản đã duyệt mới nhất; người biên tập thì thấy bản mới
   * nhất kể cả chưa duyệt, để còn đọc mà duyệt.
   */
  const best = new Map<number, (typeof rows)[number]>();
  for (const row of rows) {
    const current = best.get(row.lessonId);
    if (!current) {
      best.set(row.lessonId, row);
      continue;
    }
    const rowPublished = row.state === "published";
    const curPublished = current.state === "published";
    if (rowPublished !== curPublished) {
      if (rowPublished) best.set(row.lessonId, row);
      continue;
    }
    if (row.version > current.version) best.set(row.lessonId, row);
  }

  return [...best.values()]
    .filter((r) => includeDrafts || r.state === "published")
    .map((r) => {
      const body = r.body as Lesson;
      return {
        lessonId: r.lessonId,
        versionId: r.versionId,
        code: body?.code ?? r.slug.toUpperCase(),
        level: (body?.level ?? "A1") as Level,
        title: r.title,
        published: r.state === "published",
        body,
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
}

export async function lessonByCodeDb(code: string, includeDrafts = false): Promise<LessonRow | null> {
  const all = await lessonList(includeDrafts);
  return all.find((l) => l.code.toLowerCase() === code.toLowerCase()) ?? null;
}

/** Duyệt một bài: đây là hành động của người, và nó được ghi lại kèm ai duyệt. */
export async function publishLesson(versionId: number, byUserId: number): Promise<void> {
  const db = await getDb();
  await db
    .update(lessonVersions)
    .set({ reviewState: "published", reviewedBy: byUserId, reviewedAt: new Date() })
    .where(eq(lessonVersions.id, versionId));
}

export async function unpublishLesson(versionId: number, byUserId: number): Promise<void> {
  const db = await getDb();
  await db
    .update(lessonVersions)
    .set({ reviewState: "in_review", reviewedBy: byUserId, reviewedAt: new Date() })
    .where(eq(lessonVersions.id, versionId));
}

/* ------------------------------------------------------------ buổi học */

/**
 * Mở buổi học, hoặc trả lại buổi đang dở của cùng bài.
 *
 * Đang dở thì tiếp tục chứ không mở buổi mới: người học đóng tab giữa chừng rồi
 * quay lại là chuyện thường, và mỗi lần quay lại mở một buổi mới thì lịch sử
 * học vỡ thành hàng chục mảnh không đọc được.
 */
export async function openClassSession(userId: number, versionId: number): Promise<number> {
  const db = await getDb();
  const open = await db
    .select({ id: classSessions.id })
    .from(classSessions)
    .where(
      and(
        eq(classSessions.userId, userId),
        eq(classSessions.lessonVersionId, versionId),
        eq(classSessions.state, "open"),
      ),
    )
    .orderBy(desc(classSessions.id))
    .limit(1);
  if (open[0]) return open[0].id;

  const created = await db
    .insert(classSessions)
    .values({ userId, lessonVersionId: versionId, state: "open" })
    .returning({ id: classSessions.id });
  return created[0]!.id;
}

export async function classSessionOf(userId: number, id: number) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(classSessions)
    .where(and(eq(classSessions.id, id), eq(classSessions.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function saveTurn(args: {
  classSessionId: number;
  userId: number;
  turnId: string;
  role: "learner" | "teacher";
  transcript: string;
  latency?: { stt?: number; model?: number; tts?: number };
}): Promise<void> {
  const db = await getDb();
  await db.insert(turns).values({
    classSessionId: args.classSessionId,
    userId: args.userId,
    turnId: args.turnId,
    role: args.role,
    transcript: args.transcript,
    latencyMs: args.latency ?? {},
  });
}

/** Các lượt gần nhất, để đưa vào ngữ cảnh cho mô hình. */
export async function recentTurns(classSessionId: number, limit = 6) {
  const db = await getDb();
  const rows = await db
    .select({ role: turns.role, transcript: turns.transcript })
    .from(turns)
    .where(eq(turns.classSessionId, classSessionId))
    .orderBy(desc(turns.id))
    .limit(limit);

  return rows
    .reverse()
    .map((r) => ({
      role: r.role === "teacher" ? ("assistant" as const) : ("user" as const),
      content: r.transcript ?? "",
    }))
    .filter((r) => r.content);
}

export async function endClassSession(
  userId: number,
  id: number,
  summary: unknown,
): Promise<void> {
  const db = await getDb();
  await db
    .update(classSessions)
    .set({ state: "done", endedAt: new Date(), summary })
    .where(and(eq(classSessions.id, id), eq(classSessions.userId, userId)));
}

/* -------------------------------------------------------------- ôn tập */

/**
 * Lỗi vừa được sửa trong lớp thành một thẻ ôn tập.
 *
 * Đây là chỗ buổi học để lại dấu vết. Sửa xong một lỗi trong lớp rồi thôi thì
 * tuần sau người học lại sai đúng chỗ đó; thẻ ôn tập kéo nó quay lại sau vài
 * ngày, đúng lúc trí nhớ bắt đầu mờ.
 *
 * Khóa của thẻ là câu SAI đã chuẩn hóa, nên cùng một lỗi lặp lại nhiều buổi vẫn
 * là một thẻ - và số lần vấp (`lapses`) là con số nói lên lỗi nào dai dẳng.
 */
export async function rememberCorrection(args: {
  userId: number;
  classSessionId: number;
  wrong: string;
  right: string;
  why: string;
}): Promise<void> {
  const db = await getDb();
  const key = args.wrong.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 120);
  if (!key) return;

  const existing = await db
    .select({ id: reviewItems.id, lapses: reviewItems.lapses })
    .from(reviewItems)
    .where(
      and(
        eq(reviewItems.userId, args.userId),
        eq(reviewItems.itemType, "error_pattern"),
        eq(reviewItems.itemKey, key),
      ),
    )
    .limit(1);

  const content = { wrong: args.wrong, right: args.right, why: args.why };

  if (existing[0]) {
    await db
      .update(reviewItems)
      .set({
        content,
        lapses: existing[0].lapses + 1,
        // Vấp lại thì thẻ quay về hàng chờ ngay: khoảng cách ôn cũ rõ ràng là
        // quá dài đối với chính lỗi này.
        dueAt: new Date(),
        intervalDays: 0,
        lastResult: "again",
      })
      .where(eq(reviewItems.id, existing[0].id));
    return;
  }

  await db.insert(reviewItems).values({
    userId: args.userId,
    itemType: "error_pattern",
    itemKey: key,
    content,
    dueAt: new Date(),
  });
}

/** Thẻ tới hạn ôn, cũ nhất trước. */
export async function dueReviewItems(userId: number, limit = 20) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(reviewItems)
    .where(eq(reviewItems.userId, userId))
    .orderBy(asc(reviewItems.dueAt))
    .limit(limit);
  const now = Date.now();
  return rows.filter((r) => new Date(r.dueAt).getTime() <= now);
}

export async function reviewItemsByIds(userId: number, ids: number[]) {
  if (ids.length === 0) return [];
  const db = await getDb();
  return db
    .select()
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, userId), inArray(reviewItems.id, ids)));
}

/**
 * Cập nhật thẻ sau một lần ôn.
 *
 * Thuật toán khoảng cách tăng dần kiểu SM-2 rút gọn: nhớ được thì khoảng cách
 * nhân lên theo hệ số dễ, quên thì về 0 và hệ số dễ giảm. Không dùng nguyên
 * SM-2 vì thang chất lượng sáu mức bắt người học tự chấm mình quá tỉ mỉ; hai
 * nút "nhớ" và "quên" cho dữ liệu đủ tốt mà không ai bỏ ngang.
 */
export async function gradeReviewItem(
  userId: number,
  id: number,
  remembered: boolean,
): Promise<{ nextDays: number } | null> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(reviewItems)
    .where(and(eq(reviewItems.id, id), eq(reviewItems.userId, userId)))
    .limit(1);
  const item = rows[0];
  if (!item) return null;

  let ease = item.ease;
  let intervalDays: number;
  let lapses = item.lapses;

  if (remembered) {
    ease = Math.min(2.8, ease + 0.05);
    intervalDays = item.intervalDays <= 0 ? 1 : item.intervalDays < 3 ? 3 : item.intervalDays * ease;
  } else {
    ease = Math.max(1.3, ease - 0.2);
    intervalDays = 0;
    lapses += 1;
  }

  const dueAt = new Date(Date.now() + Math.max(0.25, intervalDays) * 24 * 60 * 60 * 1000);
  await db
    .update(reviewItems)
    .set({
      ease,
      intervalDays,
      lapses,
      reps: item.reps + 1,
      lastResult: remembered ? "good" : "again",
      dueAt,
    })
    .where(eq(reviewItems.id, id));

  return { nextDays: Math.round(intervalDays * 10) / 10 };
}
