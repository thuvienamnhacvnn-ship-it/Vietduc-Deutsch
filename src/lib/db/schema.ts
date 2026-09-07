/**
 * Schema Lingora. Đọc docs/DATA_MODEL.md để biết vì sao các bảng có hình dạng
 * này. Mọi thứ ở đây là Postgres thuần: chạy y hệt trên PGlite khi phát triển
 * và trên Postgres thật khi triển khai.
 */
import {
  boolean,
  char,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/* ---------------------------------------------------------------- kiểu chung */

export const ROLES = ["learner", "editor", "support", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const LEVELS = ["A1", "A2", "B1", "B2"] as const;
export type Level = (typeof LEVELS)[number];

export const SKILLS = ["listening", "reading", "writing", "speaking"] as const;
export type Skill = (typeof SKILLS)[number];

export const SKILL_LABEL_VI: Record<Skill, string> = {
  listening: "Nghe",
  reading: "Đọc",
  writing: "Viết",
  speaking: "Nói",
};

/** Trạng thái duyệt dùng chung cho bài học và câu hỏi. */
export const REVIEW_STATES = ["draft", "in_review", "published", "archived"] as const;
export type ReviewState = (typeof REVIEW_STATES)[number];

const now = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/* -------------------------------------------------------------------- IDENTITY */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    /** Luôn lưu ở dạng viết thường; so sánh khi đăng nhập cũng viết thường. */
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    /**
     * NULL với tài khoản chỉ đăng nhập bằng nhà cung cấp ngoài (Google). Những
     * tài khoản đó không có mật khẩu để so khớp, và luồng đăng nhập bằng mật
     * khẩu phải từ chối họ chứ không được so với chuỗi rỗng.
     */
    passwordHash: text("password_hash"),
    role: varchar("role", { length: 20 }).$type<Role>().notNull().default("learner"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: now(),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    token: varchar("token", { length: 64 }).notNull(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    userAgent: varchar("user_agent", { length: 300 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: now(),
  },
  (t) => [uniqueIndex("sessions_token_uq").on(t.token), index("sessions_user_idx").on(t.userId)],
);

/**
 * Token dùng một lần cho xác minh email và đặt lại mật khẩu. Lưu HASH của token
 * chứ không lưu token: lộ cơ sở dữ liệu không được phép thành lộ quyền đặt lại
 * mật khẩu của mọi người.
 */
export const authTokens = pgTable(
  "auth_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 128 }).notNull(),
    purpose: varchar("purpose", { length: 30 }).$type<"verify_email" | "reset_password">().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: now(),
  },
  (t) => [
    uniqueIndex("auth_tokens_hash_uq").on(t.tokenHash),
    index("auth_tokens_user_idx").on(t.userId),
  ],
);

export const consents = pgTable(
  "consents",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 40 })
      .$type<"terms" | "privacy" | "marketing_contact">()
      .notNull(),
    granted: boolean("granted").notNull(),
    documentVersion: varchar("document_version", { length: 20 }).notNull(),
    /**
     * Người dùng đồng ý bằng cách nào: tick ô trong biểu mẫu đăng ký, hay bấm
     * nút "Tiếp tục với Google" ngay dưới dòng thông báo điều khoản. Hai cách
     * này có sức nặng khác nhau khi rà soát, nên phải phân biệt được về sau chứ
     * không gộp làm một.
     */
    method: varchar("method", { length: 30 })
      .$type<"form_checkbox" | "oauth_notice">()
      .notNull()
      .default("form_checkbox"),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    ip: varchar("ip", { length: 60 }),
  },
  (t) => [index("consents_user_idx").on(t.userId, t.kind)],
);

/**
 * Liên kết tài khoản với nhà cung cấp đăng nhập ngoài.
 *
 * Khóa nhận dạng là `provider_account_id` (trường `sub` của Google), KHÔNG phải
 * email: người dùng đổi được địa chỉ Gmail, còn `sub` thì không đổi. Dùng email
 * làm khóa sẽ khiến một tài khoản đổi tên miền biến thành hai người khác nhau.
 */
export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 30 }).$type<"google">().notNull(),
    providerAccountId: varchar("provider_account_id", { length: 190 }).notNull(),
    /** Email lúc liên kết, chỉ để hiển thị và đối soát. Không dùng để đăng nhập. */
    email: varchar("email", { length: 255 }).notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: now(),
  },
  (t) => [
    uniqueIndex("oauth_accounts_provider_uq").on(t.provider, t.providerAccountId),
    index("oauth_accounts_user_idx").on(t.userId),
  ],
);

export const learnerProfiles = pgTable(
  "learner_profiles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    /** giao_tiep | cuoc_song | cong_viec | ausbildung | thi_cu */
    goal: varchar("goal", { length: 40 }),
    goalNote: text("goal_note"),
    priorExperience: varchar("prior_experience", { length: 40 }),
    hoursPerWeek: integer("hours_per_week"),
    targetDate: timestamp("target_date", { withTimezone: true }),
    supportLanguage: varchar("support_language", { length: 5 }).notNull().default("vi"),
    timezone: varchar("timezone", { length: 60 }).notNull().default("Europe/Berlin"),
    /** { reducedMotion, captions, largeText, slowSpeech } */
    accessibility: jsonb("accessibility").$type<Record<string, boolean>>().notNull().default({}),
    /** [{ day: 1-7, from: "18:00", to: "20:00" }] */
    availability: jsonb("availability").$type<unknown[]>().notNull().default([]),
    /** immediate | end_of_turn - người học chọn kiểu sửa lỗi (yêu cầu D-05). */
    correctionStyle: varchar("correction_style", { length: 20 }).notNull().default("end_of_turn"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: now(),
  },
  (t) => [uniqueIndex("learner_profiles_user_uq").on(t.userId)],
);

/* -------------------------------------------------------------------- LEARNING */

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull(),
  level: varchar("level", { length: 4 }).$type<Level>().notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  summary: text("summary"),
  createdAt: now(),
});

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 80 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  position: integer("position").notNull().default(0),
  createdAt: now(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  position: integer("position").notNull().default(0),
  estimatedMinutes: integer("estimated_minutes").notNull().default(25),
  createdAt: now(),
});

/**
 * Nội dung bài nằm ở phiên bản, không nằm ở bài. Bài làm của học viên trỏ tới
 * đúng phiên bản họ đã học, nên biên tập viên sửa bài về sau không làm sai lệch
 * lịch sử học.
 */
export const lessonVersions = pgTable(
  "lesson_versions",
  {
    id: serial("id").primaryKey(),
    lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    schemaVersion: varchar("schema_version", { length: 12 }).notNull().default("1.0"),
    body: jsonb("body").$type<unknown>().notNull(),
    reviewState: varchar("review_state", { length: 20 })
      .$type<ReviewState>()
      .notNull()
      .default("draft"),
    reviewedBy: integer("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: now(),
  },
  (t) => [uniqueIndex("lesson_versions_uq").on(t.lessonId, t.version)],
);

export const objectives = pgTable("objectives", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 40 }).notNull(),
  level: varchar("level", { length: 4 }).$type<Level>().notNull(),
  skill: varchar("skill", { length: 20 }).$type<Skill>().notNull(),
  /** Câu "có thể làm", viết ở ngôi người học. */
  canDoVi: text("can_do_vi").notNull(),
  canDoDe: text("can_do_de").notNull(),
});

export const lessonObjectives = pgTable(
  "lesson_objectives",
  {
    lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
    objectiveId: integer("objective_id")
      .notNull()
      .references(() => objectives.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("lesson_objectives_uq").on(t.lessonId, t.objectiveId)],
);

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  storageKey: varchar("storage_key", { length: 300 }).notNull(),
  mime: varchar("mime", { length: 100 }).notNull(),
  bytes: integer("bytes").notNull().default(0),
  kind: varchar("kind", { length: 20 }).notNull(),
  license: varchar("license", { length: 120 }),
  altText: text("alt_text"),
  ownerUserId: integer("owner_user_id").references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: now(),
});

export const enrollments = pgTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: now(),
  },
  (t) => [uniqueIndex("enrollments_uq").on(t.userId, t.courseId)],
);

export const learningPlans = pgTable(
  "learning_plans",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    revision: integer("revision").notNull().default(1),
    items: jsonb("items").$type<unknown[]>().notNull().default([]),
    reason: text("reason"),
    active: boolean("active").notNull().default(true),
    createdAt: now(),
  },
  (t) => [index("learning_plans_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ ASSESSMENT */

export const rubricVersions = pgTable(
  "rubric_versions",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 60 }).notNull(),
    version: integer("version").notNull(),
    skill: varchar("skill", { length: 20 }).$type<Skill>().notNull(),
    criteria: jsonb("criteria").$type<unknown[]>().notNull(),
    createdAt: now(),
  },
  (t) => [uniqueIndex("rubric_versions_uq").on(t.code, t.version)],
);

export const questionBank = pgTable("question_bank", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 60 }).notNull(),
  level: varchar("level", { length: 4 }).$type<Level>().notNull(),
  skill: varchar("skill", { length: 20 }).$type<Skill>().notNull(),
  objectiveId: integer("objective_id").references(() => objectives.id),
  difficulty: real("difficulty").notNull().default(0.5),
  createdAt: now(),
});

export const questionVersions = pgTable(
  "question_versions",
  {
    id: serial("id").primaryKey(),
    questionId: integer("question_id")
      .notNull()
      .references(() => questionBank.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    payload: jsonb("payload").$type<unknown>().notNull(),
    answerKey: jsonb("answer_key").$type<unknown>(),
    rubricVersionId: integer("rubric_version_id").references(() => rubricVersions.id),
    audioAssetId: integer("audio_asset_id").references(() => assets.id),
    reviewState: varchar("review_state", { length: 20 })
      .$type<ReviewState>()
      .notNull()
      .default("draft"),
    createdAt: now(),
  },
  (t) => [uniqueIndex("question_versions_uq").on(t.questionId, t.version)],
);

export const assessmentSessions = pgTable(
  "assessment_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 20 }).$type<"quick" | "placement">().notNull(),
    status: varchar("status", { length: 20 }).notNull().default("in_progress"),
    /** Đủ để dựng lại đúng chỗ đang dở sau khi mất mạng (yêu cầu C-10). */
    resumeState: jsonb("resume_state").$type<unknown>().notNull().default({}),
    startedAt: now(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [index("assessment_sessions_user_idx").on(t.userId)],
);

export const responses = pgTable(
  "responses",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => assessmentSessions.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    questionVersionId: integer("question_version_id")
      .notNull()
      .references(() => questionVersions.id),
    raw: jsonb("raw").$type<unknown>().notNull(),
    audioAssetId: integer("audio_asset_id").references(() => assets.id),
    autoScore: real("auto_score"),
    createdAt: now(),
  },
  (t) => [
    index("responses_session_idx").on(t.sessionId),
    uniqueIndex("responses_uq").on(t.sessionId, t.questionVersionId),
  ],
);

export const skillScores = pgTable(
  "skill_scores",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    sessionId: integer("session_id").references(() => assessmentSessions.id, {
      onDelete: "set null",
    }),
    skill: varchar("skill", { length: 20 }).$type<Skill>().notNull(),
    levelEstimate: varchar("level_estimate", { length: 4 }).$type<Level>(),
    confidence: real("confidence").notNull().default(0),
    /**
     * Cột quyết định của yêu cầu C-08: thiếu audio hoặc độ tin cậy quá thấp thì
     * kỹ năng này được đánh dấu thiếu bằng chứng, KHÔNG được suy ra một mức.
     */
    insufficientEvidence: boolean("insufficient_evidence").notNull().default(true),
    evidence: jsonb("evidence").$type<unknown>().notNull().default({}),
    rubricVersionId: integer("rubric_version_id").references(() => rubricVersions.id),
    adjustedBy: integer("adjusted_by").references(() => users.id),
    adjustReason: text("adjust_reason"),
    createdAt: now(),
  },
  (t) => [index("skill_scores_user_idx").on(t.userId, t.skill)],
);

/* ------------------------------------------------------------------- CLASSROOM */

export const classSessions = pgTable(
  "class_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lessonVersionId: integer("lesson_version_id").references(() => lessonVersions.id),
    state: varchar("state", { length: 30 }).notNull().default("created"),
    summary: jsonb("summary").$type<unknown>(),
    startedAt: now(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (t) => [index("class_sessions_user_idx").on(t.userId)],
);

export const turns = pgTable(
  "turns",
  {
    id: serial("id").primaryKey(),
    classSessionId: integer("class_session_id")
      .notNull()
      .references(() => classSessions.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    /** uuid do client sinh; cho phép hủy đúng lượt khi học viên ngắt lời. */
    turnId: varchar("turn_id", { length: 40 }).notNull(),
    role: varchar("role", { length: 20 }).notNull(),
    transcript: text("transcript"),
    transcriptEditedByUser: boolean("transcript_edited_by_user").notNull().default(false),
    audioAssetId: integer("audio_asset_id").references(() => assets.id),
    latencyMs: jsonb("latency_ms").$type<{ stt?: number; model?: number; tts?: number }>(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: now(),
  },
  (t) => [uniqueIndex("turns_turn_uq").on(t.classSessionId, t.turnId)],
);

export const exerciseAttempts = pgTable(
  "exercise_attempts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    classSessionId: integer("class_session_id").references(() => classSessions.id, {
      onDelete: "set null",
    }),
    lessonVersionId: integer("lesson_version_id").references(() => lessonVersions.id),
    exerciseKey: varchar("exercise_key", { length: 80 }).notNull(),
    payload: jsonb("payload").$type<unknown>().notNull(),
    score: real("score"),
    rubricVersionId: integer("rubric_version_id").references(() => rubricVersions.id),
    feedback: jsonb("feedback").$type<unknown>(),
    createdAt: now(),
  },
  (t) => [index("exercise_attempts_user_idx").on(t.userId)],
);

export const progressEvents = pgTable(
  "progress_events",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 40 }).notNull(),
    payload: jsonb("payload").$type<unknown>().notNull().default({}),
    /** Request lặp không được ghi hai lần (yêu cầu F-10). */
    idempotencyKey: varchar("idempotency_key", { length: 80 }).notNull(),
    createdAt: now(),
  },
  (t) => [uniqueIndex("progress_events_idem_uq").on(t.idempotencyKey)],
);

export const reviewItems = pgTable(
  "review_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    itemType: varchar("item_type", { length: 30 }).$type<"vocab" | "error_pattern">().notNull(),
    itemKey: varchar("item_key", { length: 120 }).notNull(),
    content: jsonb("content").$type<unknown>().notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull().defaultNow(),
    intervalDays: real("interval_days").notNull().default(0),
    ease: real("ease").notNull().default(2.5),
    lapses: integer("lapses").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lastResult: varchar("last_result", { length: 20 }),
    createdAt: now(),
  },
  (t) => [
    uniqueIndex("review_items_uq").on(t.userId, t.itemType, t.itemKey),
    index("review_items_due_idx").on(t.userId, t.dueAt),
  ],
);

export const learnerMemories = pgTable(
  "learner_memories",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 40 }).notNull(),
    content: text("content").notNull(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    sourceSessionId: integer("source_session_id").references(() => classSessions.id, {
      onDelete: "set null",
    }),
    createdAt: now(),
  },
  (t) => [index("learner_memories_user_idx").on(t.userId, t.kind)],
);

/* -------------------------------------------------------------------- COMMERCE */

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 60 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  active: boolean("active").notNull().default(false),
  createdAt: now(),
});

export const planVersions = pgTable(
  "plan_versions",
  {
    id: serial("id").primaryKey(),
    planId: integer("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    /** Số nguyên cent. Không bao giờ dùng số thực cho tiền. */
    priceCents: integer("price_cents").notNull(),
    currency: char("currency", { length: 3 }).notNull().default("EUR"),
    billingPeriod: varchar("billing_period", { length: 20 }).notNull(),
    trialDays: integer("trial_days").notNull().default(0),
    /** { llmTokens, sttMinutes, ttsChars, classSessions } */
    limits: jsonb("limits").$type<Record<string, number>>().notNull().default({}),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    scope: varchar("scope", { length: 40 }).notNull().default("all_levels"),
    /**
     * Giá ví dụ dùng để dựng giao diện KHÔNG được tự thành giá kinh doanh.
     * Chỉ chủ dự án mới chuyển cờ này sang true.
     */
    approvedForSale: boolean("approved_for_sale").notNull().default(false),
    createdAt: now(),
  },
  (t) => [uniqueIndex("plan_versions_uq").on(t.planId, t.version)],
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planVersionId: integer("plan_version_id").notNull().references(() => planVersions.id),
  amountCents: integer("amount_cents").notNull(),
  currency: char("currency", { length: 3 }).notNull().default("EUR"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  provider: varchar("provider", { length: 30 }),
  providerOrderId: varchar("provider_order_id", { length: 120 }),
  createdAt: now(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 30 }).notNull(),
  providerPaymentId: varchar("provider_payment_id", { length: 120 }),
  amountCents: integer("amount_cents").notNull(),
  currency: char("currency", { length: 3 }).notNull().default("EUR"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  raw: jsonb("raw").$type<unknown>(),
  createdAt: now(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planVersionId: integer("plan_version_id").notNull().references(() => planVersions.id),
  provider: varchar("provider", { length: 30 }).notNull(),
  providerSubscriptionId: varchar("provider_subscription_id", { length: 120 }),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: now(),
});

/** Thứ duy nhất quyết định học viên được học gì. */
export const entitlements = pgTable(
  "entitlements",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    scope: varchar("scope", { length: 40 }).notNull(),
    sourcePaymentId: integer("source_payment_id").references(() => payments.id),
    sourceNote: varchar("source_note", { length: 120 }),
    activeFrom: timestamp("active_from", { withTimezone: true }).notNull().defaultNow(),
    activeUntil: timestamp("active_until", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: now(),
  },
  (t) => [index("entitlements_user_idx").on(t.userId)],
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: serial("id").primaryKey(),
    provider: varchar("provider", { length: 30 }).notNull(),
    /** Khóa chống xử lý trùng - webhook lặp không được cấp quyền hai lần. */
    eventId: varchar("event_id", { length: 160 }).notNull(),
    eventType: varchar("event_type", { length: 80 }).notNull(),
    signatureValid: boolean("signature_valid").notNull().default(false),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    payload: jsonb("payload").$type<unknown>().notNull(),
    createdAt: now(),
  },
  (t) => [uniqueIndex("webhook_events_uq").on(t.provider, t.eventId)],
);

/* ------------------------------------------------------------------ OPERATIONS */

export const agentRuns = pgTable(
  "agent_runs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    classSessionId: integer("class_session_id").references(() => classSessions.id, {
      onDelete: "set null",
    }),
    role: varchar("role", { length: 40 }).notNull(),
    promptVersion: varchar("prompt_version", { length: 20 }).notNull(),
    /** Vì sao orchestrator chọn vai trò này (yêu cầu E-02). */
    reasonForRole: varchar("reason_for_role", { length: 200 }),
    mode: varchar("mode", { length: 10 }).notNull().default("mock"),
    tokensIn: integer("tokens_in").notNull().default(0),
    tokensOut: integer("tokens_out").notNull().default(0),
    costMicros: integer("cost_micros").notNull().default(0),
    latencyMs: integer("latency_ms"),
    status: varchar("status", { length: 20 }).notNull().default("ok"),
    error: text("error"),
    createdAt: now(),
  },
  (t) => [
    index("agent_runs_user_idx").on(t.userId),
    index("agent_runs_created_idx").on(t.createdAt),
  ],
);

export const usageLedger = pgTable(
  "usage_ledger",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    classSessionId: integer("class_session_id").references(() => classSessions.id, {
      onDelete: "set null",
    }),
    service: varchar("service", { length: 20 }).notNull(),
    unit: varchar("unit", { length: 20 }).notNull(),
    quantity: real("quantity").notNull(),
    costMicros: integer("cost_micros").notNull().default(0),
    createdAt: now(),
  },
  (t) => [
    index("usage_ledger_user_idx").on(t.userId),
    index("usage_ledger_created_idx").on(t.createdAt),
  ],
);

export const jobs = pgTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    kind: varchar("kind", { length: 60 }).notNull(),
    payload: jsonb("payload").$type<unknown>().notNull().default({}),
    runAt: timestamp("run_at", { withTimezone: true }).notNull().defaultNow(),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    lockedBy: varchar("locked_by", { length: 60 }),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    lastError: text("last_error"),
    /** Không gửi nhắc học trùng (yêu cầu H-10). */
    idempotencyKey: varchar("idempotency_key", { length: 120 }).notNull(),
    createdAt: now(),
  },
  (t) => [uniqueIndex("jobs_idem_uq").on(t.idempotencyKey), index("jobs_run_idx").on(t.runAt)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    channel: varchar("channel", { length: 20 }).notNull(),
    kind: varchar("kind", { length: 40 }).notNull(),
    payload: jsonb("payload").$type<unknown>().notNull().default({}),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: now(),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    actorUserId: integer("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    actorKind: varchar("actor_kind", { length: 20 }).notNull().default("user"),
    action: varchar("action", { length: 80 }).notNull(),
    entity: varchar("entity", { length: 60 }),
    entityId: varchar("entity_id", { length: 60 }),
    before: jsonb("before").$type<unknown>(),
    after: jsonb("after").$type<unknown>(),
    ip: varchar("ip", { length: 60 }),
    createdAt: now(),
  },
  (t) => [
    index("audit_logs_actor_idx").on(t.actorUserId),
    index("audit_logs_created_idx").on(t.createdAt),
  ],
);
