/**
 * DỮ LIỆU DEMO. Tách riêng khỏi mọi đường chạy của ứng dụng và chỉ tạo ra khi
 * ai đó chủ động chạy `npm run seed`.
 *
 * Những gì script này tạo:
 *   - một tài khoản quản trị và một tài khoản học viên để thử luồng
 *   - khung khóa học A1-B2 và các mục tiêu "có thể làm"
 *   - ba gói học VỚI GIÁ THAM KHẢO, cờ approved_for_sale = false
 *
 * Giá ở đây không phải giá kinh doanh. Bản giao việc nói rõ giá ví dụ không được
 * tự biến thành giá chính thức, nên cờ duyệt bán để false và giao diện tự dán
 * nhãn "giá tham khảo" cho tới khi chủ dự án bật nó trong cổng quản trị.
 *
 * Mật khẩu demo in ra màn hình, không nằm trong bất kỳ tệp nào được commit.
 */
import { randomBytes } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../src/lib/db";
import {
  courses,
  lessonVersions,
  lessons,
  modules,
  objectives,
  planVersions,
  plans,
  learnerProfiles,
  questionBank,
  questionVersions,
  rubricVersions,
  users,
} from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth/password";
import { CURRICULUM } from "../src/content/curriculum";
import { ALL_ITEMS } from "../src/content/placement";
import { LESSONS } from "../src/content/bai-hoc";

function demoPassword(): string {
  // Đủ dài để không phải mật khẩu yếu nếu ai đó lỡ để tài khoản demo trên máy
  // dùng chung, và khác nhau mỗi lần seed.
  return `lingora-${randomBytes(6).toString("hex")}`;
}

async function main() {
  const db = await getDb();

  /* ------------------------------------------------------------ tài khoản */

  const accounts = [
    { email: "admin@lingora.demo", name: "Quản trị demo", role: "admin" as const },
    { email: "hocvien@lingora.demo", name: "Học viên demo", role: "learner" as const },
  ];

  const credentials: string[] = [];
  for (const account of accounts) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, account.email))
      .limit(1);

    if (existing[0]) {
      console.log(`  giữ nguyên ${account.email} (đã có)`);
      continue;
    }

    const password = demoPassword();
    const created = await db
      .insert(users)
      .values({
        email: account.email,
        name: account.name,
        role: account.role,
        passwordHash: await hashPassword(password),
        // Xác minh sẵn: tài khoản demo không nên phụ thuộc vào email adapter.
        emailVerifiedAt: new Date(),
      })
      .returning({ id: users.id });

    await db.insert(learnerProfiles).values({ userId: created[0]!.id });
    credentials.push(`  ${account.email}  ${password}`);
  }

  /* -------------------------------------------------------------- khóa học */

  for (const level of CURRICULUM) {
    const slug = `tieng-duc-${level.level.toLowerCase()}`;
    const existing = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1);
    if (existing[0]) continue;

    const created = await db
      .insert(courses)
      .values({ slug, level: level.level, title: `Tiếng Đức ${level.level}`, summary: level.summary })
      .returning({ id: courses.id });

    // Mục tiêu "có thể làm" là cơ sở để đo độ phủ nội dung về sau.
    let i = 0;
    for (const canDo of level.canDo) {
      i += 1;
      await db.insert(objectives).values({
        code: `${level.level}-CAN-${String(i).padStart(2, "0")}`,
        level: level.level,
        // Mục tiêu ở khung này là mục tiêu giao tiếp tổng hợp; kỹ năng cụ thể
        // được gán khi biên soạn bài học thật.
        skill: "speaking",
        canDoVi: canDo,
        canDoDe: "",
      });
    }
    void created;
  }

  /* ------------------------------------------------ 12 buổi học nói mẫu */

  /*
   * Bài học vào cơ sở dữ liệu ở trạng thái CHỜ DUYỆT, không phải đã xuất bản.
   *
   * Nội dung do máy soạn thì phải có người đọc trước khi học viên học - đó là
   * ràng buộc của chính bản giao việc. Cổng quản trị có nút duyệt; trước khi ai
   * đó bấm, lớp học chỉ mở cho biên tập viên xem thử và dán nhãn bản nháp.
   */
  let seededLessons = 0;
  for (const lesson of LESSONS) {
    const courseSlug = `tieng-duc-${lesson.level.toLowerCase()}`;
    const course = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.slug, courseSlug))
      .limit(1);
    if (!course[0]) continue;

    const moduleSlug = `noi-${lesson.level.toLowerCase()}`;
    let mod = await db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.slug, moduleSlug))
      .limit(1);
    if (!mod[0]) {
      mod = await db
        .insert(modules)
        .values({
          courseId: course[0].id,
          slug: moduleSlug,
          title: `Luyện nói ${lesson.level}`,
          position: 1,
        })
        .returning({ id: modules.id });
    }

    const existing = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.slug, lesson.code.toLowerCase()))
      .limit(1);

    let lessonId = existing[0]?.id;
    if (!lessonId) {
      const created = await db
        .insert(lessons)
        .values({
          moduleId: mod[0]!.id,
          slug: lesson.code.toLowerCase(),
          title: lesson.title,
          position: seededLessons,
          estimatedMinutes: 20,
        })
        .returning({ id: lessons.id });
      lessonId = created[0]!.id;
    }

    /*
     * Nội dung đổi thì tạo PHIÊN BẢN MỚI, không sửa đè lên phiên bản cũ.
     *
     * Bài làm và buổi học của học viên trỏ tới đúng phiên bản họ đã học; sửa đè
     * là làm sai lệch lịch sử học của người khác. Phiên bản mới luôn ở trạng
     * thái chờ duyệt, kể cả khi phiên bản trước đã được duyệt - nội dung đổi thì
     * phải có người đọc lại.
     */
    const versions = await db
      .select({ version: lessonVersions.version, body: lessonVersions.body })
      .from(lessonVersions)
      .where(eq(lessonVersions.lessonId, lessonId))
      .orderBy(desc(lessonVersions.version));

    const newest = versions[0];
    const unchanged = newest && JSON.stringify(newest.body) === JSON.stringify(lesson);
    if (unchanged) continue;

    await db.insert(lessonVersions).values({
      lessonId,
      version: (newest?.version ?? 0) + 1,
      body: lesson,
      reviewState: "in_review",
    });
    seededLessons += 1;
  }

  /* --------------------------------------------------- ngân hàng câu hỏi */

  // Rubric cho phần Viết. Bất biến sau khi đã dùng để chấm - sửa tiêu chí thì
  // tạo phiên bản mới, không sửa tại chỗ.
  const existingRubric = await db
    .select({ id: rubricVersions.id })
    .from(rubricVersions)
    .where(eq(rubricVersions.code, "writing-placement"))
    .limit(1);

  let writingRubricId = existingRubric[0]?.id;
  if (!writingRubricId) {
    const created = await db
      .insert(rubricVersions)
      .values({
        code: "writing-placement",
        version: 1,
        skill: "writing",
        criteria: [
          { key: "task", label: "Hoàn thành yêu cầu của đề", machineCheckable: true },
          { key: "length", label: "Đủ độ dài tối thiểu", machineCheckable: true },
          { key: "coherence", label: "Mạch lạc", machineCheckable: false },
          { key: "vocabulary", label: "Từ vựng", machineCheckable: false },
          { key: "grammar", label: "Ngữ pháp", machineCheckable: false },
        ],
      })
      .returning({ id: rubricVersions.id });
    writingRubricId = created[0]!.id;
  }

  let newQuestions = 0;
  for (const item of ALL_ITEMS) {
    const existing = await db
      .select({ id: questionBank.id })
      .from(questionBank)
      .where(eq(questionBank.code, item.code))
      .limit(1);
    if (existing[0]) continue;

    // Độ khó thô theo cấp độ; dùng để xếp thứ tự, không phải để chấm.
    const difficulty = { A1: 0.2, A2: 0.4, B1: 0.6, B2: 0.85 }[item.level];

    const q = await db
      .insert(questionBank)
      .values({ code: item.code, level: item.level, skill: item.skill, difficulty })
      .returning({ id: questionBank.id });

    // `payload` giữ nguyên nội dung câu hỏi; `answerKey` tách riêng để phần
    // gửi ra trình duyệt không bao giờ kèm đáp án.
    const isMcq = item.kind === "mcq";
    await db.insert(questionVersions).values({
      questionId: q[0]!.id,
      version: 1,
      payload: item,
      answerKey: isMcq ? { answer: item.answer, why: item.why } : null,
      rubricVersionId: item.kind === "write" ? writingRubricId : null,
      // Bộ câu hỏi này do chủ dự án duyệt cùng lúc với việc nạp seed.
      reviewState: "published",
    });
    newQuestions += 1;
  }

  /* -------------------------------------------------------------- gói học */

  const demoPlans = [
    {
      slug: "co-ban",
      name: "Cơ bản",
      priceCents: 2900,
      billingPeriod: "monthly",
      trialDays: 7,
      features: ["Học một cấp độ", "8 buổi lớp AI mỗi tháng", "Bài tập và ôn tập không giới hạn"],
      limits: { classSessions: 8, sttMinutes: 240, ttsChars: 200000 },
      scope: "one_level",
    },
    {
      slug: "tieu-chuan",
      name: "Tiêu chuẩn",
      priceCents: 4900,
      billingPeriod: "monthly",
      trialDays: 7,
      features: [
        "Toàn bộ A1 đến B2",
        "20 buổi lớp AI mỗi tháng",
        "Chấm bài viết chi tiết",
        "Đánh giá lại theo yêu cầu",
      ],
      limits: { classSessions: 20, sttMinutes: 600, ttsChars: 500000 },
      scope: "all_levels",
    },
    {
      slug: "chuyen-sau",
      name: "Chuyên sâu",
      priceCents: 8900,
      billingPeriod: "monthly",
      trialDays: 0,
      features: [
        "Toàn bộ A1 đến B2",
        "45 buổi lớp AI mỗi tháng",
        "Luyện phỏng vấn Ausbildung",
        "Báo cáo tiến bộ hằng tháng",
      ],
      limits: { classSessions: 45, sttMinutes: 1400, ttsChars: 1200000 },
      scope: "all_levels",
    },
  ];

  for (const p of demoPlans) {
    const existing = await db.select({ id: plans.id }).from(plans).where(eq(plans.slug, p.slug)).limit(1);
    if (existing[0]) continue;

    const created = await db
      .insert(plans)
      .values({ slug: p.slug, name: p.name, active: true })
      .returning({ id: plans.id });

    await db.insert(planVersions).values({
      planId: created[0]!.id,
      version: 1,
      priceCents: p.priceCents,
      currency: "EUR",
      billingPeriod: p.billingPeriod,
      trialDays: p.trialDays,
      limits: p.limits,
      features: p.features,
      scope: p.scope,
      // Điểm mấu chốt: chưa được duyệt bán.
      approvedForSale: false,
    });
  }

  console.log(`\nĐã nạp dữ liệu demo. Câu hỏi xếp lớp mới nạp: ${newQuestions}.`);
  console.log(
    `Buổi học nói mới hoặc có bản mới: ${seededLessons} (đang CHỜ DUYỆT trong /quan-tri/bai-hoc).`,
  );
  if (credentials.length > 0) {
    console.log("\nTài khoản demo (mật khẩu chỉ hiện một lần, không lưu ở đâu cả):");
    console.log(credentials.join("\n"));
  }
  console.log(
    "\nGói học được nạp với GIÁ THAM KHẢO và approved_for_sale = false.\n" +
      "Giao diện sẽ dán nhãn đúng như vậy cho tới khi chủ dự án duyệt giá thật.",
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
