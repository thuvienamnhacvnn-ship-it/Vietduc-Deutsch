import type { Lesson } from "@/lib/lop-hoc";

/**
 * Mười hai buổi học nói đầu tiên, ba buổi mỗi cấp.
 *
 * Tình huống chọn theo đời sống thật của người Việt ở Đức chứ không theo thứ tự
 * ngữ pháp: buổi đầu của A1 là tự giới thiệu vì đó là câu người ta phải nói
 * trong tuần đầu tiên đặt chân sang, còn buổi đầu của B1 là hẹn bác sĩ vì đó là
 * chỗ người ta hay đứng im vì không biết mở lời.
 *
 * Mỗi buổi có câu Anna mở lời CỐ ĐỊNH. Để mô hình tự nghĩ câu mở đầu thì mỗi
 * lần vào lớp lại một kiểu, và người học quay lại buổi cũ sẽ không nhận ra mình
 * đang ở đâu.
 */
export const LESSONS: Lesson[] = [
  /* ------------------------------------------------------------------ A1 */
  {
    code: "A1-B01",
    level: "A1",
    title: "Chào hỏi và tự giới thiệu",
    situationVi: "Buổi đầu ở lớp tiếng Đức. Bạn làm quen với một người mới.",
    goalVi: "Nói được tên, quê, nơi ở và nghề của mình bằng ba tới bốn câu.",
    openerDe: "Hallo! Ich bin Anna. Wie heißt du?",
    openerVi: "Xin chào! Tôi là Anna. Bạn tên gì?",
    focus: ["heißen, kommen, wohnen ở ngôi ich và du", "câu hỏi với wie, woher, wo"],
  },
  {
    code: "A1-B02",
    level: "A1",
    title: "Đi chợ và hỏi giá",
    situationVi: "Bạn ở quầy rau trong siêu thị và muốn mua vài thứ.",
    goalVi: "Hỏi giá, xin một lượng cụ thể và trả tiền.",
    openerDe: "Guten Tag! Was möchten Sie kaufen?",
    openerVi: "Chào bạn! Bạn muốn mua gì?",
    focus: ["möchten", "was kostet", "số đếm và tiền", "danh từ ở cách 4"],
  },
  {
    code: "A1-B03",
    level: "A1",
    title: "Hỏi đường",
    situationVi: "Bạn đang tìm nhà ga và hỏi một người đi đường.",
    goalVi: "Hỏi đường và hiểu được chỉ dẫn ngắn.",
    openerDe: "Entschuldigung, suchst du etwas?",
    openerVi: "Xin lỗi, bạn đang tìm gì à?",
    focus: ["wo ist…", "geradeaus, links, rechts", "giới từ chỉ nơi chốn"],
  },

  /* ------------------------------------------------------------------ A2 */
  {
    code: "A2-B01",
    level: "A2",
    title: "Gọi điện báo ốm",
    situationVi: "Sáng nay bạn ốm và phải gọi cho chỗ làm.",
    goalVi: "Báo nghỉ, nêu lý do và nói khi nào quay lại.",
    openerDe: "Guten Morgen, hier ist Anna vom Büro. Was ist los?",
    openerVi: "Chào buổi sáng, Anna ở văn phòng đây. Có chuyện gì vậy?",
    focus: ["krank sein", "weil", "thì Perfekt", "morgen, übermorgen"],
  },
  {
    code: "A2-B02",
    level: "A2",
    title: "Kể về cuối tuần",
    situationVi: "Sáng thứ Hai, đồng nghiệp hỏi bạn cuối tuần thế nào.",
    goalVi: "Kể ba tới bốn việc đã làm, dùng thì quá khứ.",
    openerDe: "Hallo! Wie war dein Wochenende?",
    openerVi: "Chào bạn! Cuối tuần của bạn thế nào?",
    focus: ["Perfekt với haben và sein", "trạng ngữ thời gian", "und, dann, danach"],
  },
  {
    code: "A2-B03",
    level: "A2",
    title: "Đặt lịch hẹn",
    situationVi: "Bạn gọi tới phòng khám để xin một lịch hẹn.",
    goalVi: "Xin hẹn, đề nghị đổi giờ và xác nhận lại.",
    openerDe: "Praxis Doktor Klein, guten Tag. Wie kann ich Ihnen helfen?",
    openerVi: "Phòng khám bác sĩ Klein xin nghe. Tôi có thể giúp gì cho bạn?",
    focus: ["Termin vereinbaren", "cách xưng hô Sie", "giờ và thứ", "Konjunktiv lịch sự"],
  },

  /* ------------------------------------------------------------------ B1 */
  {
    code: "B1-B01",
    level: "B1",
    title: "Phỏng vấn xin học nghề",
    situationVi: "Bạn ngồi trước người tuyển của một doanh nghiệp nhận Ausbildung.",
    goalVi: "Nói được vì sao chọn nghề này và mình có gì phù hợp.",
    openerDe: "Schön, dass Sie da sind. Erzählen Sie mir bitte kurz von sich.",
    openerVi: "Rất vui vì bạn đã tới. Bạn hãy kể ngắn gọn về bản thân.",
    focus: ["giới thiệu nghề nghiệp", "weil, deshalb", "Erfahrung, Praktikum", "câu phức"],
  },
  {
    code: "B1-B02",
    level: "B1",
    title: "Khiếu nại với chủ nhà",
    situationVi: "Máy sưởi trong căn hộ của bạn hỏng đã một tuần.",
    goalVi: "Trình bày vấn đề, nêu hậu quả và đề nghị hướng giải quyết.",
    openerDe: "Guten Tag, Sie wollten mich sprechen. Worum geht es?",
    openerVi: "Chào bạn, bạn muốn gặp tôi. Có việc gì vậy?",
    focus: ["kaputt, funktioniert nicht", "seit + Dativ", "bị động", "đề nghị lịch sự"],
  },
  {
    code: "B1-B03",
    level: "B1",
    title: "Nói về kế hoạch tương lai",
    situationVi: "Một người bạn hỏi bạn định làm gì trong hai năm tới.",
    goalVi: "Trình bày kế hoạch và lý do, có điều kiện và giả định.",
    openerDe: "Und was hast du für die nächsten zwei Jahre vor?",
    openerVi: "Thế hai năm tới bạn định làm gì?",
    focus: ["vorhaben, planen", "wenn", "Konjunktiv II", "damit, um … zu"],
  },

  /* ------------------------------------------------------------------ B2 */
  {
    code: "B2-B01",
    level: "B2",
    title: "Bảo vệ quan điểm trong cuộc họp",
    situationVi: "Nhóm bạn đề xuất đổi quy trình làm việc và có người phản đối.",
    goalVi: "Nêu lập luận, đáp lại ý phản bác và giữ giọng lịch sự.",
    openerDe: "Sie haben einen Vorschlag gemacht. Wie begründen Sie ihn?",
    openerVi: "Bạn vừa nêu một đề xuất. Bạn giải thích nó thế nào?",
    focus: ["einerseits/andererseits", "zwar … allerdings", "indem, sodass", "văn phong trang trọng"],
  },
  {
    code: "B2-B02",
    level: "B2",
    title: "Xin thêm thời gian cho dự án",
    situationVi: "Bạn phải nói với cấp trên rằng dự án cần lùi hạn hai tuần.",
    goalVi: "Nêu tình hình, nguyên nhân, đề xuất cụ thể và cam kết.",
    openerDe: "Sie wollten über den Zeitplan sprechen. Wie ist der Stand?",
    openerVi: "Bạn muốn nói về tiến độ. Tình hình thế nào rồi?",
    focus: ["danh hoá", "Passiv", "trotz, aufgrund + Genitiv", "cấu trúc nêu hậu quả"],
  },
  {
    code: "B2-B03",
    level: "B2",
    title: "Bàn về hội nhập và ngôn ngữ",
    situationVi: "Một cuộc trò chuyện về chuyện người mới sang nên học tiếng trước hay đi làm trước.",
    goalVi: "Trình bày quan điểm nhiều tầng và phản biện có dẫn chứng.",
    openerDe: "Manche sagen, Arbeit sei wichtiger als Sprachkurse. Was meinen Sie?",
    openerVi: "Có người nói đi làm quan trọng hơn học tiếng. Bạn nghĩ sao?",
    focus: ["Konjunktiv I trong tường thuật", "meiner Ansicht nach", "so sánh và nhượng bộ"],
  },
];

export function lessonByCode(code: string): Lesson | undefined {
  return LESSONS.find((l) => l.code === code);
}

/** Buổi học gợi ý cho một mức: buổi đầu tiên của mức đó. */
export function firstLessonFor(level: string): Lesson {
  return LESSONS.find((l) => l.level === level) ?? LESSONS[0]!;
}
