import type { Level, Skill } from "@/lib/db/schema";

/**
 * Danh mục khoá học và cách chọn khoá cho một kết quả xếp lớp.
 *
 * Một mức CEFR chưa phải là một lời khuyên. "Bạn ở A2" không nói cho người học
 * biết ngày mai vào lớp nào, học bao lâu, và phải bù kỹ năng gì. Tệp này biến
 * kết quả bốn kỹ năng thành đúng một câu trả lời hành động được.
 *
 * Ba quy tắc, viết ra ở đây vì chúng là quyết định sư phạm chứ không phải chi
 * tiết kỹ thuật:
 *
 * 1. **Xếp theo kỹ năng THẤP nhất, không phải cao nhất.** Vào lớp cao hơn sức
 *    của kỹ năng yếu nhất thì tuần đầu còn theo được, tuần thứ ba là bỏ. Kỹ
 *    năng mạnh hơn sẽ được nhắc tới trong phần bổ trợ, không bị bỏ phí.
 * 2. **Kỹ năng thiếu bằng chứng không được kéo mức xuống.** Không thu được âm
 *    thanh phần Nói thì đó là chuyện của thiết bị, không phải bằng chứng rằng
 *    người ta nói kém.
 * 3. **Nửa sau của một mức là một khoá riêng.** Người vừa chớm đạt A2 và người
 *    A2 vững không học chung một chỗ được; A2.1 và A2.2 là hai lớp khác nhau.
 */

export type Course = {
  code: string;
  name: string;
  level: Level;
  /** 1 là nửa đầu của mức, 2 là nửa sau. */
  half: 1 | 2;
  /** Số giờ học (Unterrichtseinheit 45 phút) theo thông lệ các trường ở Đức. */
  hours: number;
  /** Học xong thì làm được gì. Viết theo việc làm được, không theo tên ngữ pháp. */
  outcome: string;
  /** Nội dung chính, để người học biết mình sắp học gì. */
  focus: string[];
};

export const COURSES: Course[] = [
  {
    code: "A1.1",
    name: "Tiếng Đức A1.1 — bắt đầu từ con số không",
    level: "A1",
    half: 1,
    hours: 60,
    outcome: "Chào hỏi, tự giới thiệu, hỏi giá, nói về gia đình và nơi ở bằng câu ngắn.",
    focus: ["Bảng chữ cái và phát âm", "Động từ ở hiện tại", "Mạo từ và số nhiều", "Số đếm, giờ, ngày tháng"],
  },
  {
    code: "A1.2",
    name: "Tiếng Đức A1.2 — đủ câu cho việc thường ngày",
    level: "A1",
    half: 2,
    hours: 60,
    outcome: "Đi chợ, đặt lịch hẹn, viết tin nhắn ngắn, kể một ngày của mình.",
    focus: ["Cách 4 và cách 3", "Động từ tình thái", "Động từ tách", "Quá khứ với haben và sein"],
  },
  {
    code: "A2.1",
    name: "Tiếng Đức A2.1 — kể được chuyện đã qua",
    level: "A2",
    half: 1,
    hours: 60,
    outcome: "Kể lại việc đã xảy ra, nêu lý do, hẹn và đổi hẹn qua điện thoại.",
    focus: ["Thì Perfekt", "Câu với weil và deshalb", "So sánh hơn", "Giới từ chỉ nơi chốn"],
  },
  {
    code: "A2.2",
    name: "Tiếng Đức A2.2 — xoay xở được ở nơi công cộng",
    level: "A2",
    half: 2,
    hours: 60,
    outcome: "Làm việc với cơ quan hành chính, bác sĩ, chủ nhà; viết email đơn giản.",
    focus: ["Câu phụ với dass và wenn", "Konjunktiv II lịch sự", "Động từ kèm giới từ", "Đại từ phản thân"],
  },
  {
    code: "B1.1",
    name: "Tiếng Đức B1.1 — nói được ý của mình",
    level: "B1",
    half: 1,
    hours: 80,
    outcome: "Trình bày ý kiến, kể trải nghiệm dài, hiểu thông báo và bản tin ngắn.",
    focus: ["Mệnh đề quan hệ", "Bị động", "Câu hỏi gián tiếp", "Konjunktiv II để khuyên và đề nghị"],
  },
  {
    code: "B1.2",
    name: "Tiếng Đức B1.2 — sẵn sàng cho Ausbildung",
    level: "B1",
    half: 2,
    hours: 80,
    outcome: "Viết đơn xin việc, dự phỏng vấn, hiểu hợp đồng và quy định nơi làm việc.",
    focus: ["Ngôn ngữ hồ sơ và giấy tờ", "Từ vựng nghề nghiệp", "Trình bày và phản biện", "Ôn tập toàn bộ B1"],
  },
  {
    code: "B2.1",
    name: "Tiếng Đức B2.1 — lập luận và tranh luận",
    level: "B2",
    half: 1,
    hours: 80,
    outcome: "Bảo vệ quan điểm bằng lý lẽ, hiểu văn bản báo chí và bài giảng.",
    focus: ["Cấu trúc danh hoá", "Konnektor nâng cao", "Giới từ với Genitiv", "Văn phong trang trọng"],
  },
  {
    code: "B2.2",
    name: "Tiếng Đức B2.2 — dùng tiếng Đức trong công việc",
    level: "B2",
    half: 2,
    hours: 80,
    outcome: "Họp, thuyết trình, viết báo cáo và thư từ nghiệp vụ tương đối phức tạp.",
    focus: ["Ngôn ngữ chuyên ngành", "Partizip và cấu trúc rút gọn", "Viết luận có phản biện", "Ôn tập toàn bộ B2"],
  },
];

export function courseByCode(code: string): Course | undefined {
  return COURSES.find((c) => c.code === code);
}

const SKILL_NAME: Record<Skill, string> = {
  reading: "Đọc",
  listening: "Nghe",
  writing: "Viết",
  speaking: "Nói",
};

export type Recommendation = {
  course: Course;
  /** Khoá đi tiếp ngay sau, để người học thấy đường dài. */
  nextCourse: Course | null;
  /** Vì sao lại là khoá này. Một câu, đọc là hiểu. */
  reason: string;
  /** Những kỹ năng cần bù riêng, kèm việc cụ thể phải làm. */
  support: { skill: Skill; note: string }[];
  /** Kỹ năng chưa đo được, nói thẳng là chưa đo được. */
  unmeasured: Skill[];
  /** Bài dừng sớm hay làm hết. Ảnh hưởng tới cách đọc kết quả. */
  endedEarly: boolean;
};

type ResultLike = {
  skill: Skill;
  level: Level | null;
  confidence: number;
  insufficientEvidence: boolean;
};

const ORDER: Level[] = ["A1", "A2", "B1", "B2"];

/**
 * Chọn khoá học từ kết quả bốn kỹ năng.
 *
 * `endedEarly` không đổi cách chọn khoá - nó chỉ đổi cách nói. Người dừng giữa
 * chừng vẫn phải nhận được một khoá để bắt đầu, kèm lời nhắc rằng làm hết bài
 * sẽ cho kết quả sát hơn.
 */
export function recommendCourse(results: ResultLike[], endedEarly = false): Recommendation {
  const measured = results.filter((r) => !r.insufficientEvidence && r.level);
  const unmeasured = results.filter((r) => r.insufficientEvidence).map((r) => r.skill);

  // Không đo được kỹ năng nào thì bắt đầu từ đầu. Đó là câu trả lời trung thực,
  // và cũng là lựa chọn an toàn nhất cho người học.
  if (measured.length === 0) {
    return {
      course: courseByCode("A1.1")!,
      nextCourse: courseByCode("A1.2") ?? null,
      reason:
        "Bài chưa đủ dữ liệu để đánh giá, nên đề xuất khoá bắt đầu. Bạn làm lại bài kiểm tra bất cứ lúc nào để được xếp sát hơn.",
      support: [],
      unmeasured,
      endedEarly,
    };
  }

  const lowest = measured.reduce((a, b) =>
    ORDER.indexOf(a.level!) <= ORDER.indexOf(b.level!) ? a : b,
  );
  const highest = measured.reduce((a, b) =>
    ORDER.indexOf(a.level!) >= ORDER.indexOf(b.level!) ? a : b,
  );

  // Nửa sau của mức khi kỹ năng yếu nhất đã vững ở mức đó (độ tin cậy cao) và
  // các kỹ năng khác đã vượt lên trên. Nếu không thì vào nửa đầu - học lại một
  // phần đã biết vẫn hơn là ngồi trong lớp không theo kịp.
  const strong = lowest.confidence >= 0.7 && ORDER.indexOf(highest.level!) > ORDER.indexOf(lowest.level!);
  const half: 1 | 2 = strong ? 2 : 1;
  const course = COURSES.find((c) => c.level === lowest.level && c.half === half)!;
  const nextIndex = COURSES.indexOf(course) + 1;

  const gap = ORDER.indexOf(highest.level!) - ORDER.indexOf(lowest.level!);
  const reason =
    gap >= 1
      ? `Kỹ năng ${SKILL_NAME[lowest.skill]} của bạn đang ở ${lowest.level}, trong khi ${SKILL_NAME[highest.skill]} đã tới ${highest.level}. Lớp được xếp theo kỹ năng thấp nhất để bạn theo được cả khoá; phần bạn đã mạnh sẽ đi nhanh hơn.`
      : `Cả bốn kỹ năng đo được đều quanh mức ${lowest.level}, nên đây là khoá vừa sức để bắt đầu ngay.`;

  const support = measured
    .filter((r) => ORDER.indexOf(r.level!) < ORDER.indexOf(highest.level!))
    .map((r) => ({
      skill: r.skill,
      note: `${SKILL_NAME[r.skill]} đang ở ${r.level}, thấp hơn ${SKILL_NAME[highest.skill]} (${highest.level}). Cần luyện thêm riêng phần này trong khoá.`,
    }));

  return {
    course,
    nextCourse: COURSES[nextIndex] ?? null,
    reason,
    support,
    unmeasured,
    endedEarly,
  };
}
