import "server-only";

import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  assessmentSessions,
  questionBank,
  questionVersions,
  responses,
  rubricVersions,
  skillScores,
  type Level,
  type Skill,
} from "@/lib/db/schema";
import {
  LEVEL_ORDER,
  MCQ_ITEMS,
  SPEAK_ITEMS,
  WRITE_ITEMS,
  type McqItem,
  type PlacementItem,
  type WriteItem,
} from "@/content/placement";

/**
 * Bài kiểm tra xếp lớp.
 *
 * Ba nguyên tắc chi phối toàn bộ tệp này:
 *
 * 1. **Đáp án không bao giờ rời khỏi server trước khi trả lời.** Hàm dựng câu
 *    hỏi gửi ra trình duyệt (`publicItem`) cố ý loại bỏ `answer`, `why` và
 *    `audioText` chưa cần thiết.
 * 2. **Thiếu bằng chứng thì nói là thiếu.** Không kỹ năng nào được suy ra mức
 *    từ dữ liệu của kỹ năng khác. Nói không có audio thì `insufficientEvidence`
 *    là true, chấm hết.
 * 3. **Chấm được bằng máy tới đâu thì nói tới đó.** Phần Viết chỉ kiểm được độ
 *    dài và các cấu trúc bắt buộc, nên độ tin cậy của nó thấp và bằng chứng ghi
 *    rõ đã kiểm những gì.
 *
 * Thứ tự bài: Đọc và cấu trúc (A1 lên B2), rồi Nghe (A1 lên B2), rồi Viết, rồi
 * Nói. Trong mỗi kỹ năng, làm hết một cấp rồi mới lên cấp trên; làm dưới 50%
 * một cấp thì dừng kỹ năng đó - hỏi tiếp câu khó hơn chỉ tốn thời gian của
 * người học mà không thêm thông tin gì.
 */

const PASS_TO_CONTINUE = 0.5;
const PASS_TO_CLAIM_LEVEL = 0.6;

export type PublicItem = {
  code: string;
  kind: "mcq" | "write" | "speak";
  level: Level;
  skill: Skill;
  prompt: string;
  passage?: string;
  options?: string[];
  hint?: string;
  minWords?: number;
  /** Câu tiếng Đức để trình duyệt đọc lên. Chỉ có ở câu Nghe. */
  speakText?: string;
  /** Số thứ tự và tổng ước lượng, để vẽ thanh tiến độ. */
  index: number;
  total: number;
};

export type SessionState = {
  /** Mã các câu đã đi qua, theo thứ tự. Gồm cả câu bị bỏ qua. */
  answered: string[];
  /** Kết quả đúng/sai của từng câu trắc nghiệm. */
  correct: Record<string, boolean>;
  /**
   * Câu người học bỏ qua vì KHÔNG LÀM ĐƯỢC do hoàn cảnh, chứ không phải vì
   * không biết đáp án - ví dụ máy không có giọng đọc tiếng Đức nên không nghe
   * được. Những câu này bị loại khỏi phép tính điểm: tính chúng là sai sẽ đổ
   * lỗi thiết bị lên đầu người học.
   */
  skipped: string[];
  /** Các kỹ năng đã dừng sớm vì làm dưới ngưỡng. */
  stopped: Skill[];
  /** Người học tự bỏ qua phần Nói. */
  skippedSpeaking?: boolean;
};

export const EMPTY_STATE: SessionState = { answered: [], correct: {}, skipped: [], stopped: [] };

/* ------------------------------------------------------- chọn câu kế tiếp */

function mcqBlock(skill: Skill, level: Level): McqItem[] {
  return MCQ_ITEMS.filter((i) => i.skill === skill && i.level === level);
}

/**
 * Điểm của một cấp trong một kỹ năng: đúng bao nhiêu trên tổng đã LÀM.
 * Câu bị bỏ qua không nằm ở cả tử số lẫn mẫu số.
 */
function blockScore(state: SessionState, skill: Skill, level: Level) {
  const skipped = state.skipped ?? [];
  const block = mcqBlock(skill, level);
  const done = block.filter((i) => state.answered.includes(i.code) && !skipped.includes(i.code));
  const right = done.filter((i) => state.correct[i.code]).length;
  return { done: done.length, total: block.length, right, ratio: done.length ? right / done.length : 0 };
}

/**
 * Câu tiếp theo, hoặc null khi đã xong. Đây là toàn bộ logic điều phối bài thi
 * và nó cố ý ở một chỗ để đọc được từ trên xuống.
 */
export function nextItem(state: SessionState, writeLevel?: Level): PlacementItem | null {
  // 1. Đọc và cấu trúc, rồi Nghe. Cùng một quy tắc cho cả hai.
  for (const skill of ["reading", "listening"] as const) {
    if (state.stopped.includes(skill)) continue;

    for (const level of LEVEL_ORDER) {
      const block = mcqBlock(skill, level);
      if (block.length === 0) continue;

      const remaining = block.filter((i) => !state.answered.includes(i.code));
      if (remaining.length > 0) return remaining[0]!;

      // Hết một cấp: làm dưới ngưỡng thì dừng kỹ năng này, không hỏi cấp cao hơn.
      if (blockScore(state, skill, level).ratio < PASS_TO_CONTINUE) {
        state.stopped.push(skill);
        break;
      }
    }
  }

  // 2. Viết: một đề, ở đúng cấp mà phần Đọc gợi ý.
  const write = WRITE_ITEMS.find((i) => i.level === (writeLevel ?? "A1"));
  if (write && !state.answered.includes(write.code)) return write;

  // 3. Nói: một đề, và bỏ qua được.
  const speak = SPEAK_ITEMS[0];
  if (speak && !state.answered.includes(speak.code) && !state.skippedSpeaking) return speak;

  return null;
}

/** Mức tạm thời của kỹ năng Đọc, dùng để chọn đề Viết cho vừa sức. */
export function readingLevelSoFar(state: SessionState): Level {
  let best: Level = "A1";
  for (const level of LEVEL_ORDER) {
    const score = blockScore(state, "reading", level);
    if (score.done > 0 && score.ratio >= PASS_TO_CLAIM_LEVEL) best = level;
  }
  return best;
}

/** Tổng số câu ước lượng còn phải làm, chỉ để vẽ thanh tiến độ. */
export function estimateTotal(state: SessionState): number {
  let total = 0;
  for (const skill of ["reading", "listening"] as const) {
    for (const level of LEVEL_ORDER) {
      total += mcqBlock(skill, level).length;
      if (
        state.answered.some((c) => mcqBlock(skill, level).some((i) => i.code === c)) &&
        blockScore(state, skill, level).done === mcqBlock(skill, level).length &&
        blockScore(state, skill, level).ratio < PASS_TO_CONTINUE
      ) {
        break;
      }
    }
  }
  return total + 2; // một đề Viết, một đề Nói
}

/** Bản gửi ra trình duyệt: đã bỏ đáp án và lời giải thích. */
export function publicItem(item: PlacementItem, index: number, total: number): PublicItem {
  const base = {
    code: item.code,
    level: item.level,
    skill: item.skill as Skill,
    prompt: item.prompt,
    index,
    total,
  };

  if (item.kind === "mcq") {
    return {
      ...base,
      kind: "mcq",
      passage: item.passage,
      options: item.options,
      // Câu Nghe: trình duyệt cần chữ để đọc lên, nhưng giao diện KHÔNG hiển thị
      // nó - hiện ra thì bài Nghe biến thành bài Đọc.
      speakText: item.audioText,
    };
  }
  if (item.kind === "write") {
    return { ...base, kind: "write", hint: item.hint, minWords: item.minWords };
  }
  return { ...base, kind: "speak", hint: item.hint };
}

/* --------------------------------------------------------------- chấm bài */

/**
 * Chấm phần Viết bằng những tiêu chí máy kiểm được: đủ độ dài chưa, và có mặt
 * các cấu trúc mà đề yêu cầu chưa.
 *
 * Đây là một tín hiệu THẬT nhưng HẸP. Nó không nói gì về mạch lạc hay độ chính
 * xác ngữ pháp, nên độ tin cậy trả về thấp và bằng chứng ghi đúng những gì đã
 * kiểm. Phần chấm theo rubric đầy đủ cần một bộ chấm chưa được kết nối.
 */
export function gradeWriting(item: WriteItem, text: string) {
  const normalized = text.toLowerCase();
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const longEnough = words >= item.minWords;

  const matched = item.expectPatterns.map((p) => ({
    label: p.label,
    ok: p.any.some((needle) => normalized.includes(needle)),
  }));
  const hits = matched.filter((m) => m.ok).length;

  return {
    words,
    longEnough,
    matched,
    hits,
    needed: item.expectPatterns.length,
    // Đủ dài và đạt ít nhất một nửa số dấu hiệu thì coi là có bằng chứng đủ để
    // đưa ra một mức sơ bộ. Thiếu một trong hai thì ghi là chưa đủ.
    enough: longEnough && hits >= Math.ceil(item.expectPatterns.length / 2),
  };
}

export type SkillResult = {
  skill: Skill;
  level: Level | null;
  confidence: number;
  insufficientEvidence: boolean;
  evidence: Record<string, unknown>;
};

/** Tính kết quả cả bốn kỹ năng từ trạng thái phiên làm bài. */
export function scoreSession(
  state: SessionState,
  writing: { item: WriteItem; text: string } | null,
  speakingAudio: boolean,
): SkillResult[] {
  const results: SkillResult[] = [];

  for (const skill of ["reading", "listening"] as const) {
    const blocks = LEVEL_ORDER.map((level) => ({ level, ...blockScore(state, skill, level) })).filter(
      (b) => b.done > 0,
    );

    if (blocks.length === 0) {
      results.push({
        skill,
        level: null,
        confidence: 0,
        insufficientEvidence: true,
        evidence: { reason: "Chưa làm câu nào của kỹ năng này." },
      });
      continue;
    }

    // Mức cao nhất mà người học đạt ngưỡng. Không đạt ngưỡng ở cấp nào thì mức
    // là A1 - đó là điểm bắt đầu, không phải "không đánh giá được".
    let level: Level = "A1";
    for (const b of blocks) if (b.ratio >= PASS_TO_CLAIM_LEVEL) level = b.level;

    // Càng làm nhiều cấp thì kết luận càng chắc. Trần 0.9: một bài trắc nghiệm
    // ngắn không bao giờ đáng tin tuyệt đối.
    const confidence = Math.min(0.9, 0.4 + 0.13 * blocks.length);

    results.push({
      skill,
      level,
      confidence,
      insufficientEvidence: false,
      evidence: {
        blocks: blocks.map((b) => ({ level: b.level, right: b.right, done: b.done })),
        rule: `Đạt mức khi làm đúng từ ${Math.round(PASS_TO_CLAIM_LEVEL * 100)}% trở lên ở cấp đó.`,
      },
    });
  }

  /* ---- Viết ---- */
  if (writing) {
    const graded = gradeWriting(writing.item, writing.text);
    results.push({
      skill: "writing",
      level: graded.enough ? writing.item.level : null,
      confidence: graded.enough ? 0.3 : 0.1,
      insufficientEvidence: !graded.enough,
      evidence: {
        words: graded.words,
        minWords: writing.item.minWords,
        checked: graded.matched,
        note:
          "Chấm sơ bộ bằng những tiêu chí kiểm được tự động: đủ độ dài và có mặt các cấu trúc đề yêu cầu. Mạch lạc, từ vựng và độ chính xác ngữ pháp chưa được chấm.",
      },
    });
  } else {
    results.push({
      skill: "writing",
      level: null,
      confidence: 0,
      insufficientEvidence: true,
      evidence: { reason: "Chưa làm phần Viết." },
    });
  }

  /* ---- Nói ---- */
  // Không có audio thì không có gì để chấm. Suy ra mức Nói từ điểm Đọc là chuyện
  // bản giao việc cấm thẳng, và cũng là chuyện sai về mặt sư phạm.
  results.push({
    skill: "speaking",
    level: null,
    confidence: 0,
    insufficientEvidence: true,
    evidence: {
      reason: speakingAudio
        ? "Đã thu được âm thanh nhưng chưa có dịch vụ phân tích giọng nói để chấm."
        : "Chưa thu được âm thanh cho phần Nói.",
    },
  });

  return results;
}

/* ---------------------------------------------------- truy cập cơ sở dữ liệu */

/** Tìm `question_versions.id` từ mã câu hỏi. Bài làm phải trỏ tới phiên bản. */
export async function questionVersionIdFor(code: string): Promise<number | null> {
  const db = await getDb();
  const rows = await db
    .select({ id: questionVersions.id })
    .from(questionVersions)
    .innerJoin(questionBank, eq(questionBank.id, questionVersions.questionId))
    .where(and(eq(questionBank.code, code), eq(questionVersions.version, 1)))
    .limit(1);
  return rows[0]?.id ?? null;
}

/** Phiên làm bài đang dở của học viên, nếu có. */
export async function openSessionFor(userId: number) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(assessmentSessions)
    .where(
      and(
        eq(assessmentSessions.userId, userId),
        eq(assessmentSessions.kind, "placement"),
        eq(assessmentSessions.status, "in_progress"),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/** Ghi kết quả bốn kỹ năng và đóng phiên. */
export async function finishSession(
  userId: number,
  sessionId: number,
  results: SkillResult[],
): Promise<void> {
  const db = await getDb();

  const rubric = await db
    .select({ id: rubricVersions.id })
    .from(rubricVersions)
    .where(eq(rubricVersions.code, "writing-placement"))
    .limit(1);

  for (const r of results) {
    await db.insert(skillScores).values({
      userId,
      sessionId,
      skill: r.skill,
      levelEstimate: r.level,
      confidence: r.confidence,
      insufficientEvidence: r.insufficientEvidence,
      evidence: r.evidence,
      rubricVersionId: r.skill === "writing" ? (rubric[0]?.id ?? null) : null,
    });
  }

  await db
    .update(assessmentSessions)
    .set({ status: "completed", completedAt: new Date() })
    .where(and(eq(assessmentSessions.id, sessionId), eq(assessmentSessions.userId, userId)));
}

/** Bài làm phần Viết của phiên, để chấm khi kết thúc. */
export async function writingResponseFor(sessionId: number, userId: number) {
  const db = await getDb();
  const rows = await db
    .select({ raw: responses.raw })
    .from(responses)
    .innerJoin(questionVersions, eq(questionVersions.id, responses.questionVersionId))
    .innerJoin(questionBank, eq(questionBank.id, questionVersions.questionId))
    .where(and(eq(responses.sessionId, sessionId), eq(responses.userId, userId), eq(questionBank.skill, "writing")))
    .limit(1);

  const raw = rows[0]?.raw as { code?: string; text?: string } | undefined;
  if (!raw?.code || typeof raw.text !== "string") return null;

  const item = WRITE_ITEMS.find((i) => i.code === raw.code);
  return item ? { item, text: raw.text } : null;
}
