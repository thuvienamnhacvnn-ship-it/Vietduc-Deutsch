import "server-only";

import { and, desc, eq, gt, isNull, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  entitlements,
  learnerProfiles,
  planVersions,
  plans,
  reviewItems,
  skillScores,
  SKILLS,
  type Level,
  type Skill,
} from "@/lib/db/schema";

/* ---------------------------------------------------------------- gói học */

export type PublicPlan = {
  id: number;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  billingPeriod: string;
  trialDays: number;
  features: string[];
  /**
   * Giá đã được chủ dự án duyệt để bán hay chưa. Chưa duyệt thì giao diện phải
   * trình bày như GIÁ THAM KHẢO và không cho bấm mua - bản giao việc nói rõ giá
   * ví dụ không được tự biến thành giá kinh doanh.
   */
  approvedForSale: boolean;
};

/**
 * Bảng giá công khai: mỗi gói lấy đúng phiên bản mới nhất. Trang web không bao
 * giờ tự tính giá; nó chỉ hiển thị thứ đọc từ đây, và server cũng tính tiền từ
 * chính bảng này khi tạo đơn.
 */
export async function listPublicPlans(): Promise<PublicPlan[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select({
        id: planVersions.id,
        slug: plans.slug,
        name: plans.name,
        priceCents: planVersions.priceCents,
        currency: planVersions.currency,
        billingPeriod: planVersions.billingPeriod,
        trialDays: planVersions.trialDays,
        features: planVersions.features,
        approvedForSale: planVersions.approvedForSale,
        version: planVersions.version,
      })
      .from(planVersions)
      .innerJoin(plans, eq(plans.id, planVersions.planId))
      .where(eq(plans.active, true))
      .orderBy(plans.id, desc(planVersions.version));

    // Giữ lại phiên bản cao nhất của mỗi gói.
    const seen = new Set<string>();
    const out: PublicPlan[] = [];
    for (const row of rows) {
      if (seen.has(row.slug)) continue;
      seen.add(row.slug);
      out.push({
        id: row.id,
        slug: row.slug,
        name: row.name,
        priceCents: row.priceCents,
        currency: row.currency,
        billingPeriod: row.billingPeriod,
        trialDays: row.trialDays,
        features: row.features ?? [],
        approvedForSale: row.approvedForSale,
      });
    }
    return out;
  } catch {
    // Database chưa migrate: trang giới thiệu vẫn phải mở được, chỉ là khối giá
    // hiện trạng thái rỗng thay vì nổ.
    return [];
  }
}

/* -------------------------------------------------------------- tiến độ học */

export type SkillState = {
  skill: Skill;
  level: Level | null;
  confidence: number;
  /** Chưa đủ bằng chứng: giao diện phải nói "chưa đánh giá được", không vẽ điểm. */
  unknown: boolean;
};

/**
 * Trạng thái bốn kỹ năng của một học viên. Luôn trả đủ bốn dòng, kể cả khi chưa
 * kiểm tra gì - thiếu dữ liệu là một trạng thái phải hiển thị, không phải một
 * hàng bị bỏ trống.
 */
export async function skillStateFor(userId: number): Promise<SkillState[]> {
  const db = await getDb();
  const rows = await db
    .select({
      skill: skillScores.skill,
      levelEstimate: skillScores.levelEstimate,
      confidence: skillScores.confidence,
      insufficientEvidence: skillScores.insufficientEvidence,
      createdAt: skillScores.createdAt,
    })
    .from(skillScores)
    .where(eq(skillScores.userId, userId))
    .orderBy(desc(skillScores.createdAt));

  const latest = new Map<string, (typeof rows)[number]>();
  for (const row of rows) if (!latest.has(row.skill)) latest.set(row.skill, row);

  return SKILLS.map((skill) => {
    const row = latest.get(skill);
    if (!row || row.insufficientEvidence || !row.levelEstimate) {
      return { skill, level: null, confidence: row?.confidence ?? 0, unknown: true };
    }
    return {
      skill,
      level: row.levelEstimate,
      confidence: row.confidence,
      unknown: false,
    };
  });
}

/** Hồ sơ học viên. Tự tạo dòng rỗng ở lần đọc đầu để phần còn lại không phải lo null. */
export async function profileFor(userId: number) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(learnerProfiles)
    .where(eq(learnerProfiles.userId, userId))
    .limit(1);
  if (rows[0]) return rows[0];

  const created = await db.insert(learnerProfiles).values({ userId }).returning();
  return created[0]!;
}

/** Số mục tới hạn ôn hôm nay. */
export async function dueReviewCount(userId: number): Promise<number> {
  const db = await getDb();
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(reviewItems)
    .where(and(eq(reviewItems.userId, userId), sql`${reviewItems.dueAt} <= now()`));
  return rows[0]?.n ?? 0;
}

/**
 * Quyền học đang có hiệu lực. Đây là câu trả lời duy nhất cho "học viên này
 * được học gì" - không suy ra từ trạng thái đơn hàng hay từ giao diện.
 */
export async function activeEntitlements(userId: number) {
  const db = await getDb();
  return db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.userId, userId),
        isNull(entitlements.revokedAt),
        or(isNull(entitlements.activeUntil), gt(entitlements.activeUntil, new Date())),
      ),
    );
}
