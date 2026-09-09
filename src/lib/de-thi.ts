import type { Level, Skill } from "@/lib/db/schema";
import { AUTO_ITEMS, ALL_SPEAK_ITEMS, ALL_WRITE_ITEMS, LEVEL_ORDER } from "@/content/placement";

/**
 * Bộ tạo đề xếp lớp.
 *
 * Hai điều bài kiểm tra cũ không làm được, và đây là chỗ sửa:
 *
 * 1. **Mỗi lần thi một đề khác.** Trước đây mọi người làm đúng một danh sách
 *    câu theo đúng một thứ tự. Thi lại lần hai là làm lại đúng đề cũ, nên điểm
 *    lần hai đo trí nhớ chứ không đo trình độ. Giờ mỗi phiên rút ngẫu nhiên từ
 *    ngân hàng theo một hạt giống riêng, và tránh những câu người học đã gặp ở
 *    lần thi trước.
 *
 * 2. **Bài đi theo sức người làm.** Đây là lối thi nhiều giai đoạn có phân
 *    nhánh (multistage testing) mà các kỳ xếp lớp chuẩn dùng: một khối định
 *    tuyến ở giữa thang, rồi hai khối tiếp theo được chọn theo kết quả khối
 *    trước. Làm tốt thì được hỏi câu khó hơn, làm đuối thì lùi xuống - thay vì
 *    bắt mọi người bò từ A1 lên B2 hoặc chết đứng ở giữa.
 *
 * Vì sao 6 câu một khối: dưới 5 câu thì một câu đoán trúng đã đủ đẩy sai nhánh;
 * trên 8 câu thì bài dài quá mức cần thiết cho việc xếp lớp.
 *
 * Tệp này CỐ Ý không đụng tới cơ sở dữ liệu: nó nhận trạng thái vào, trả kế
 * hoạch ra, nên kiểm thử được mà không cần dựng phiên thật.
 */

export type StageId = "R1" | "R2" | "R3" | "L1" | "L2";

export type Stage = {
  id: StageId;
  skill: Skill;
  /** Cấp độ của khối. Khối định tuyến trộn hai cấp nên ghi cấp thấp hơn. */
  level: Level;
  /** Khối định tuyến trộn A1 và A2, không thuộc riêng cấp nào. */
  routing?: boolean;
  codes: string[];
};

export type ExamPlan = {
  /** Hạt giống ngẫu nhiên của phiên. Cùng hạt giống thì ra cùng đề. */
  seed: string;
  stages: Stage[];
  writeCode?: string;
  speakCode?: string;
};

/** Số câu mỗi khối. Đọc nhiều hơn Nghe vì phần Đọc còn gánh cả ngữ pháp. */
export const STAGE_SIZE = { reading: 6, listening: 4 } as const;

/** Ngưỡng coi như đạt một cấp. Giống ngưỡng chấm, cố ý để bài và điểm nói cùng một chuyện. */
const PASS = 0.6;

/**
 * Ngưỡng SÀN. Làm dưới mức này ở khối A1 nghĩa là người học đang bắt đầu từ
 * con số không - và điều đó đã đủ để xếp lớp.
 *
 * Trước đây bài vẫn chạy hết 28 câu cho cả người sai từ câu đầu. Đó là 20 phút
 * chép lại đúng một kết luận đã biết từ phút thứ ba, và là cách chắc chắn nhất
 * để người mới học bỏ ngang rồi không quay lại. Chạm sàn thì kỹ năng đó dừng.
 */
const FLOOR = 0.34;

/* --------------------------------------------------------------- ngẫu nhiên */

/**
 * Ngẫu nhiên CÓ HẠT GIỐNG. Không dùng Math.random: cùng một phiên phải rút ra
 * cùng một đề mỗi lần server dựng lại kế hoạch, nếu không thì người học tải lại
 * trang là đề đổi giữa chừng.
 */
function rngFrom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], rnd: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/* ------------------------------------------------------------- chọn câu hỏi */

function poolFor(skill: Skill, level: Level): string[] {
  return AUTO_ITEMS.filter((i) => i.skill === skill && i.level === level).map((i) => i.code);
}

/**
 * Rút n câu của một ô (kỹ năng × cấp độ).
 *
 * Ưu tiên câu người học CHƯA gặp ở những lần thi trước. Hết câu mới thì mới lấy
 * lại câu cũ - thi lại vẫn phải chấm được, không thể vì hết đề mà bỏ giữa
 * chừng. Câu đã dùng trong chính phiên này thì luôn bị loại.
 */
function draw(
  skill: Skill,
  level: Level,
  n: number,
  rnd: () => number,
  used: Set<string>,
  avoid: Set<string>,
): string[] {
  const pool = poolFor(skill, level).filter((c) => !used.has(c));
  const fresh = shuffle(
    pool.filter((c) => !avoid.has(c)),
    rnd,
  );
  const rest = shuffle(
    pool.filter((c) => avoid.has(c)),
    rnd,
  );
  const picked = [...fresh, ...rest].slice(0, n);
  for (const c of picked) used.add(c);
  return picked;
}

function levelUp(level: Level, step: number): Level {
  const i = LEVEL_ORDER.indexOf(level);
  return LEVEL_ORDER[Math.min(LEVEL_ORDER.length - 1, Math.max(0, i + step))]!;
}

/* ------------------------------------------------------------- dựng kế hoạch */

/**
 * Khối đầu tiên: định tuyến. Trộn nửa A1 nửa A2 - giữa thang, để cả người mới
 * bắt đầu lẫn người đã khá đều có câu làm được và câu làm không được. Bắt đầu
 * bằng toàn câu A1 thì người khá phải làm sáu câu vô nghĩa; bắt đầu bằng B1 thì
 * người mới học gặp sáu câu không hiểu gì và bỏ cuộc ngay.
 */
export function startPlan(seed: string, avoidCodes: string[] = []): ExamPlan {
  const rnd = rngFrom(seed);
  const used = new Set<string>();
  const avoid = new Set(avoidCodes);
  const half = STAGE_SIZE.reading / 2;
  const codes = [
    ...draw("reading", "A1", half, rnd, used, avoid),
    ...draw("reading", "A2", half, rnd, used, avoid),
  ];
  return { seed, stages: [{ id: "R1", skill: "reading", level: "A1", routing: true, codes }] };
}

/** Tỉ lệ đúng của một khối, tính trên số câu ĐÃ LÀM (câu bỏ qua không tính). */
export function stageRatio(
  stage: Stage,
  correct: Record<string, boolean>,
  answered: string[],
  skipped: string[],
): { done: number; right: number; ratio: number } {
  const done = stage.codes.filter((c) => answered.includes(c) && !skipped.includes(c));
  const right = done.filter((c) => correct[c]).length;
  return { done: done.length, right, ratio: done.length ? right / done.length : 0 };
}

export function stageDone(stage: Stage, answered: string[]): boolean {
  return stage.codes.every((c) => answered.includes(c));
}

/**
 * Cấp độ của khối tiếp theo, theo kết quả khối vừa xong.
 *
 * Khối định tuyến trộn A1+A2 nên thang khác: làm dưới nửa thì về A1, quá tay
 * thì nhảy thẳng B1. Các khối sau chỉ lên hoặc xuống một bậc - nhảy hai bậc dựa
 * trên sáu câu là kết luận vội.
 */
export function nextLevelAfter(stage: Stage, ratio: number): Level {
  if (stage.routing) {
    if (ratio < 0.5) return "A1";
    if (ratio < 0.84) return "A2";
    return "B1";
  }
  if (ratio >= 0.67) return levelUp(stage.level, 1);
  if (ratio < 0.34) return levelUp(stage.level, -1);
  return stage.level;
}

/**
 * Bổ sung khối kế tiếp vào kế hoạch khi khối hiện tại đã làm xong.
 *
 * Trả về true nếu có thêm khối mới. Hàm này SỬA `plan` tại chỗ, vì phiên làm
 * bài được lưu lại ngay sau đó - kế hoạch và trạng thái phải đi cùng nhau, tách
 * ra là có ngày lệch.
 */
export function extendPlan(
  plan: ExamPlan,
  correct: Record<string, boolean>,
  answered: string[],
  skipped: string[],
  avoidCodes: string[] = [],
): boolean {
  const rnd = rngFrom(plan.seed + ":" + plan.stages.length);
  const used = new Set(plan.stages.flatMap((s) => s.codes));
  const avoid = new Set(avoidCodes);
  const last = plan.stages[plan.stages.length - 1]!;
  if (!stageDone(last, answered)) return false;

  const ratio = stageRatio(last, correct, answered, skipped).ratio;
  const has = (id: StageId) => plan.stages.some((s) => s.id === id);

  // Chạm sàn ở A1: phần Đọc đã có câu trả lời, chuyển sang Nghe.
  const atFloor = !last.routing && last.level === "A1" && ratio < FLOOR;

  if ((last.id === "R1" || last.id === "R2") && !atFloor) {
    const id: StageId = last.id === "R1" ? "R2" : "R3";
    const level = nextLevelAfter(last, ratio);
    const codes = draw("reading", level, STAGE_SIZE.reading, rnd, used, avoid);
    if (codes.length === 0) return false;
    plan.stages.push({ id, skill: "reading", level, codes });
    return true;
  }

  if (last.skill === "reading" && !has("L1")) {
    // Nghe bắt đầu ở ngay dưới mức Đọc đang cho thấy: hai kỹ năng thường lệch
    // nhau, nhưng lệch quá hai bậc thì hiếm. Bắt đầu thấp hơn một bậc để người
    // học không vấp ngay câu đầu.
    const level = atFloor
      ? "A1"
      : levelUp(readingLevelOf(plan, correct, answered, skipped), -1);
    const codes = draw("listening", level, STAGE_SIZE.listening, rnd, used, avoid);
    if (codes.length === 0) return false;
    plan.stages.push({ id: "L1", skill: "listening", level, codes });
    return true;
  }

  if (last.id === "L1" && !has("L2") && !atFloor) {
    const level = nextLevelAfter(last, ratio);
    const codes = draw("listening", level, STAGE_SIZE.listening, rnd, used, avoid);
    if (codes.length === 0) return false;
    plan.stages.push({ id: "L2", skill: "listening", level, codes });
    return true;
  }

  return false;
}

/**
 * Mức của một kỹ năng theo các khối đã làm: mức cao nhất mà người học đạt
 * ngưỡng. Không đạt ngưỡng ở khối nào thì là A1 - đó là điểm bắt đầu học, không
 * phải "không đánh giá được".
 */
export function skillLevelOf(
  plan: ExamPlan,
  skill: Skill,
  correct: Record<string, boolean>,
  answered: string[],
  skipped: string[],
): { level: Level; blocks: { level: Level; right: number; done: number; routing?: boolean }[] } {
  const blocks = plan.stages
    .filter((s) => s.skill === skill)
    .map((s) => ({ stage: s, ...stageRatio(s, correct, answered, skipped) }))
    .filter((b) => b.done > 0);

  let level: Level = "A1";
  for (const b of blocks) {
    if (b.ratio >= PASS) {
      // Khối định tuyến trộn A1+A2: đạt ngưỡng ở đó mới chỉ chứng minh được A1.
      const claimed = b.stage.routing ? "A1" : b.stage.level;
      if (LEVEL_ORDER.indexOf(claimed) > LEVEL_ORDER.indexOf(level)) level = claimed;
    }
  }
  return {
    level,
    blocks: blocks.map((b) => ({
      level: b.stage.level,
      right: b.right,
      done: b.done,
      routing: b.stage.routing,
    })),
  };
}

function readingLevelOf(
  plan: ExamPlan,
  correct: Record<string, boolean>,
  answered: string[],
  skipped: string[],
): Level {
  return skillLevelOf(plan, "reading", correct, answered, skipped).level;
}

/**
 * Đề Viết và đề Nói, chọn ở đúng mức phần Đọc đang cho thấy. Đưa đề B2 cho
 * người đang ở A1 chỉ tạo ra một trang giấy trắng, không tạo ra thông tin.
 */
export function pickProductionItems(
  plan: ExamPlan,
  correct: Record<string, boolean>,
  answered: string[],
  skipped: string[],
  avoidCodes: string[] = [],
): void {
  const level = readingLevelOf(plan, correct, answered, skipped);
  const rnd = rngFrom(plan.seed + ":san-pham");
  const avoid = new Set(avoidCodes);

  if (!plan.writeCode) {
    const pool = ALL_WRITE_ITEMS.filter((i) => i.level === level).map((i) => i.code);
    const fresh = pool.filter((c) => !avoid.has(c));
    plan.writeCode = shuffle(fresh.length ? fresh : pool, rnd)[0];
  }
  if (!plan.speakCode) {
    const pool = ALL_SPEAK_ITEMS.filter((i) => i.level === level).map((i) => i.code);
    const fresh = pool.filter((c) => !avoid.has(c));
    plan.speakCode = shuffle(fresh.length ? fresh : pool, rnd)[0];
  }
}

/** Tổng số câu của một bài đầy đủ, để vẽ thanh tiến độ ngay từ câu đầu tiên. */
export const FULL_LENGTH = STAGE_SIZE.reading * 3 + STAGE_SIZE.listening * 2 + 2;
