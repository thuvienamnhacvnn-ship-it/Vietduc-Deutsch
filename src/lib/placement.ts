import "server-only";

import { and, eq, isNotNull } from "drizzle-orm";
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
  AUTO_ITEMS,
  LEVEL_ORDER,
  SPEAK_ITEMS,
  WRITE_ITEMS,
  gapIsCorrect,
  type GapItem,
  type McqItem,
  type PlacementItem,
  type WriteItem,
} from "@/content/placement";
import { LISTEN_LIMIT, REGULATION_VERSION, examCode } from "@/content/quy-che-thi";

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
  kind: "mcq" | "gap" | "write" | "speak";
  level: Level;
  skill: Skill;
  prompt: string;
  passage?: string;
  options?: string[];
  hint?: string;
  minWords?: number;
  /**
   * Câu này cần nghe audio. Chữ tiếng Đức KHÔNG nằm ở đây - nó được cấp từng
   * lượt qua /api/xep-lop/nghe để server đếm được số lần nghe.
   */
  needsAudio?: boolean;
  /** Số lần còn được nghe. Chỉ có nghĩa khi `needsAudio`. */
  listensLeft?: number;
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

  /* ---- hồ sơ điều kiện làm bài (quy chế 1.0) ---- */

  /** Thời điểm người học ký cam kết trung thực. Chưa ký thì chưa được làm bài. */
  pledgedAt?: string;
  /** Phiên bản quy chế áp dụng cho chính bài thi này. */
  regulation?: string;
  /** Số lần đã nghe từng đoạn audio. SERVER đếm, không phải client. */
  listens?: Record<string, number>;
  /** Thời điểm server phát mỗi câu ra, để đo thời gian làm bài. */
  servedAt?: Record<string, string>;
  /** Tổng số giây đã dùng cho từng kỹ năng. */
  sectionSeconds?: Record<string, number>;
};

export const EMPTY_STATE: SessionState = {
  answered: [],
  correct: {},
  skipped: [],
  stopped: [],
  listens: {},
  servedAt: {},
  sectionSeconds: {},
};

/* ------------------------------------------------------- chọn câu kế tiếp */

/**
 * Các câu chấm tự động của một kỹ năng ở một cấp: trắc nghiệm trước, điền sau.
 * Thứ tự cố ý - người học quen tay với dạng chọn rồi mới phải tự gõ.
 */
function autoBlock(skill: Skill, level: Level): (McqItem | GapItem)[] {
  const block = AUTO_ITEMS.filter((i) => i.skill === skill && i.level === level);
  return [...block.filter((i) => i.kind === "mcq"), ...block.filter((i) => i.kind === "gap")];
}

/**
 * Điểm của một cấp trong một kỹ năng: đúng bao nhiêu trên tổng đã LÀM.
 * Câu bị bỏ qua không nằm ở cả tử số lẫn mẫu số.
 */
function blockScore(state: SessionState, skill: Skill, level: Level) {
  const skipped = state.skipped ?? [];
  const block = autoBlock(skill, level);
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
      const block = autoBlock(skill, level);
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
      total += autoBlock(skill, level).length;
      if (
        state.answered.some((c) => autoBlock(skill, level).some((i) => i.code === c)) &&
        blockScore(state, skill, level).done === autoBlock(skill, level).length &&
        blockScore(state, skill, level).ratio < PASS_TO_CONTINUE
      ) {
        break;
      }
    }
  }
  return total + 2; // một đề Viết, một đề Nói
}

/**
 * Bản gửi ra trình duyệt: đã bỏ đáp án, lời giải thích, và cả câu tiếng Đức của
 * phần Nghe.
 *
 * Bỏ câu tiếng Đức là điều kiện để giới hạn số lần nghe có thật. Gửi kèm nó thì
 * client giữ sẵn chữ và phát lại bao nhiêu lần cũng được, và "được nghe tối đa
 * hai lần" chỉ còn là một dòng chữ trong quy chế.
 */
export function publicItem(
  item: PlacementItem,
  index: number,
  total: number,
  listensLeft?: number,
): PublicItem {
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
      needsAudio: Boolean(item.audioText),
      listensLeft: item.audioText ? listensLeft : undefined,
    };
  }
  if (item.kind === "gap") {
    // `accept` ở lại server. Gửi ra là đưa luôn đáp án cho người làm bài.
    return {
      ...base,
      kind: "gap",
      passage: item.passage,
      hint: item.hint,
      needsAudio: Boolean(item.audioText),
      listensLeft: item.audioText ? listensLeft : undefined,
    };
  }
  if (item.kind === "write") {
    return { ...base, kind: "write", hint: item.hint, minWords: item.minWords };
  }
  return { ...base, kind: "speak", hint: item.hint };
}

/* --------------------------------------------------------------- chấm bài */

/** Chấm một câu tự động. Trắc nghiệm so chỉ số, câu điền so chuỗi đã chuẩn hóa. */
export function autoIsCorrect(
  item: McqItem | GapItem,
  answer: { choice?: number | null; text?: string | null },
): boolean {
  if (item.kind === "mcq") return answer.choice === item.answer;
  return typeof answer.text === "string" && gapIsCorrect(item, answer.text);
}

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
  /**
   * Hồ sơ điều kiện làm bài, ghim vào TỪNG dòng điểm. Một mức trình độ mà không
   * kèm điều kiện tạo ra nó thì không kiểm chứng được: nghe lại mấy lần, làm
   * trong bao lâu, có ký cam kết không.
   */
  record?: ExamRecord,
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
      evidence: record
        ? { ...(r.evidence as Record<string, unknown>), examRecord: record }
        : r.evidence,
      rubricVersionId: r.skill === "writing" ? (rubric[0]?.id ?? null) : null,
    });
  }

  await db
    .update(assessmentSessions)
    .set({ status: "completed", completedAt: new Date() })
    .where(and(eq(assessmentSessions.id, sessionId), eq(assessmentSessions.userId, userId)));
}

/**
 * Phiên này đã thu được đoạn ghi âm bài Nói chưa.
 *
 * Có audio KHÔNG có nghĩa là chấm được: vẫn thiếu bộ phân tích giọng nói. Nhưng
 * nó đổi lời giải thích cho người học từ "chưa thu được âm thanh" thành "đã có
 * bản ghi, đang chờ chấm" - hai câu này nói hai chuyện khác nhau.
 */
export async function hasSpeakingAudio(sessionId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  const rows = await db
    .select({ id: responses.id })
    .from(responses)
    .innerJoin(questionVersions, eq(questionVersions.id, responses.questionVersionId))
    .innerJoin(questionBank, eq(questionBank.id, questionVersions.questionId))
    .where(
      and(
        eq(responses.sessionId, sessionId),
        eq(responses.userId, userId),
        eq(questionBank.skill, "speaking"),
        isNotNull(responses.audioAssetId),
      ),
    )
    .limit(1);
  return rows.length > 0;
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

/* -------------------------------------------------- điều kiện làm bài (quy chế) */

/** Số lần còn được nghe một đoạn. Trả 0 khi đã hết. */
export function listensLeftFor(state: SessionState, code: string, level: Level): number {
  const used = state.listens?.[code] ?? 0;
  return Math.max(0, LISTEN_LIMIT[level] - used);
}

/**
 * Ghi nhận một lượt nghe và trả về số lần còn lại, hoặc null khi đã hết.
 * Đếm ở server là điểm khác nhau giữa một quy định và một quy định có hiệu lực.
 */
export function consumeListen(
  state: SessionState,
  code: string,
  level: Level,
): number | null {
  if (!state.listens) state.listens = {};
  const used = state.listens[code] ?? 0;
  if (used >= LISTEN_LIMIT[level]) return null;
  state.listens[code] = used + 1;
  return LISTEN_LIMIT[level] - state.listens[code];
}

/** Đánh dấu thời điểm server phát một câu ra, để đo thời gian làm câu đó. */
export function markServed(state: SessionState, code: string): void {
  if (!state.servedAt) state.servedAt = {};
  if (!state.servedAt[code]) state.servedAt[code] = new Date().toISOString();
}

/**
 * Số giây người học đã dùng cho một câu, và cộng dồn vào tổng của kỹ năng.
 *
 * Chặn trên 30 phút cho một câu: người học mở tab rồi đi ăn trưa không nên biến
 * thành một con số vô nghĩa trong hồ sơ bài thi.
 */
export function recordElapsed(state: SessionState, code: string, skill: Skill): number {
  const served = state.servedAt?.[code];
  if (!served) return 0;
  const seconds = Math.min(1800, Math.round((Date.now() - new Date(served).getTime()) / 1000));
  if (!state.sectionSeconds) state.sectionSeconds = {};
  state.sectionSeconds[skill] = (state.sectionSeconds[skill] ?? 0) + seconds;
  return seconds;
}

export type ExamRecord = {
  code: string;
  regulation: string;
  startedAt: string;
  completedAt: string | null;
  /** Tổng thời gian làm bài, tính bằng phút. */
  minutes: number;
  sectionSeconds: Record<string, number>;
  pledgedAt: string | null;
  /** Tổng số lượt nghe đã dùng trên toàn bài. */
  listensUsed: number;
  itemsAnswered: number;
  itemsSkipped: number;
};

/** Hồ sơ điều kiện làm bài, in trên phiếu kết quả và lưu trong audit. */
export function examRecordOf(
  sessionId: number,
  startedAt: Date,
  completedAt: Date | null,
  state: SessionState,
): ExamRecord {
  const sectionSeconds = state.sectionSeconds ?? {};
  const total = Object.values(sectionSeconds).reduce((a, b) => a + b, 0);
  return {
    code: examCode(sessionId, startedAt),
    regulation: state.regulation ?? REGULATION_VERSION,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt ? completedAt.toISOString() : null,
    minutes: Math.max(1, Math.round(total / 60)),
    sectionSeconds,
    pledgedAt: state.pledgedAt ?? null,
    listensUsed: Object.values(state.listens ?? {}).reduce((a, b) => a + b, 0),
    itemsAnswered: state.answered.length,
    itemsSkipped: (state.skipped ?? []).length,
  };
}
