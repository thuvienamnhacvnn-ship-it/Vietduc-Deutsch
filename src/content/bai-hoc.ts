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
    script: [
      { de: "Freut mich, dich kennenzulernen. Woher kommst du?", vi: "Rất vui được làm quen. Bạn từ đâu tới?" },
      { de: "Ach, interessant! Und wo wohnst du jetzt?", vi: "Ồ, thú vị! Thế giờ bạn sống ở đâu?" },
      { de: "Was machst du beruflich?", vi: "Bạn làm nghề gì?" },
      { de: "Warum lernst du Deutsch?", vi: "Vì sao bạn học tiếng Đức?" },
      { de: "Sehr gut, Mai. Bis zum nächsten Mal!", vi: "Rất tốt. Hẹn gặp lại buổi sau nhé!" },
    ],
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
    script: [
      { de: "Gern. Wie viel möchten Sie davon?", vi: "Được ạ. Bạn muốn lấy bao nhiêu?" },
      { de: "Sonst noch etwas?", vi: "Còn gì nữa không ạ?" },
      { de: "Das macht zusammen sechs Euro zwanzig. Zahlen Sie bar oder mit Karte?", vi: "Tất cả là 6,20 euro. Bạn trả tiền mặt hay thẻ?" },
      { de: "Danke schön. Auf Wiedersehen!", vi: "Cảm ơn bạn. Tạm biệt!" },
    ],
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
    script: [
      { de: "Der Bahnhof? Gehen Sie geradeaus. Verstehen Sie das?", vi: "Nhà ga à? Bạn đi thẳng nhé. Bạn hiểu không?" },
      { de: "Dann nehmen Sie die zweite Straße links. Wie weit ist es zu Fuß, denken Sie?", vi: "Rồi rẽ trái ở phố thứ hai. Bạn nghĩ đi bộ mất bao lâu?" },
      { de: "Etwa zehn Minuten. Fragen Sie noch etwas?", vi: "Khoảng mười phút. Bạn muốn hỏi gì nữa không?" },
      { de: "Gute Reise! Auf Wiedersehen.", vi: "Chúc đi đường vui! Tạm biệt." },
    ],
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
    script: [
      { de: "Oh, das tut mir leid. Was fehlt Ihnen denn?", vi: "Ồ, tiếc quá. Bạn bị sao vậy?" },
      { de: "Waren Sie schon beim Arzt?", vi: "Bạn đã đi khám chưa?" },
      { de: "Und wann kommen Sie wieder zur Arbeit?", vi: "Thế bao giờ bạn đi làm lại?" },
      { de: "Gut, ich sage es dem Chef. Gute Besserung!", vi: "Được, tôi báo sếp giúp. Chúc bạn mau khỏe!" },
    ],
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
    script: [
      { de: "Schön! Was hast du am Samstag gemacht?", vi: "Hay quá! Thứ Bảy bạn làm gì?" },
      { de: "Und am Sonntag? Warst du zu Hause?", vi: "Còn Chủ nhật? Bạn ở nhà à?" },
      { de: "Mit wem warst du unterwegs?", vi: "Bạn đi cùng ai?" },
      { de: "Klingt gut. Was machst du nächstes Wochenende?", vi: "Nghe hay đấy. Cuối tuần tới bạn định làm gì?" },
      { de: "Danke fürs Erzählen. Bis morgen!", vi: "Cảm ơn bạn đã kể. Mai gặp lại!" },
    ],
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
    script: [
      { de: "Gern. Waren Sie schon einmal bei uns?", vi: "Được ạ. Bạn đã tới chỗ chúng tôi lần nào chưa?" },
      { de: "Am Dienstag um zehn Uhr hätten wir einen Termin frei. Passt Ihnen das?", vi: "Thứ Ba lúc 10 giờ chúng tôi còn lịch trống. Bạn thấy được không?" },
      { de: "Und was ist der Grund für den Termin?", vi: "Bạn tới khám vì lý do gì ạ?" },
      { de: "Alles klar. Bringen Sie bitte Ihre Versichertenkarte mit. Bis Dienstag!", vi: "Rõ rồi ạ. Bạn nhớ mang thẻ bảo hiểm nhé. Hẹn thứ Ba!" },
    ],
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
    script: [
      { de: "Danke. Warum interessiert Sie gerade dieser Beruf?", vi: "Cảm ơn. Vì sao bạn quan tâm đúng nghề này?" },
      { de: "Haben Sie schon praktische Erfahrung gesammelt?", vi: "Bạn đã có kinh nghiệm thực tế nào chưa?" },
      { de: "Was fällt Ihnen an der Arbeit am schwersten?", vi: "Điều gì trong công việc này khiến bạn thấy khó nhất?" },
      { de: "Wo sehen Sie sich in drei Jahren?", vi: "Ba năm nữa bạn thấy mình ở đâu?" },
      { de: "Vielen Dank. Wir melden uns nächste Woche bei Ihnen.", vi: "Cảm ơn bạn. Tuần sau chúng tôi sẽ liên hệ lại." },
    ],
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
    script: [
      { de: "Seit wann funktioniert die Heizung denn nicht?", vi: "Máy sưởi hỏng từ bao giờ vậy?" },
      { de: "Haben Sie den Schaden schon schriftlich gemeldet?", vi: "Bạn đã báo hỏng bằng văn bản chưa?" },
      { de: "Und was erwarten Sie jetzt von mir?", vi: "Vậy giờ bạn muốn tôi làm gì?" },
      { de: "In Ordnung, ich schicke morgen einen Handwerker. Einverstanden?", vi: "Được rồi, mai tôi cho thợ tới. Bạn đồng ý chứ?" },
    ],
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
    script: [
      { de: "Klingt spannend. Warum hast du dich dafür entschieden?", vi: "Nghe hấp dẫn đấy. Vì sao bạn chọn hướng đó?" },
      { de: "Was müsstest du dafür noch lernen?", vi: "Bạn còn phải học thêm gì cho việc đó?" },
      { de: "Und wenn es nicht klappt - was wäre dein Plan B?", vi: "Còn nếu không thành thì kế hoạch dự phòng của bạn là gì?" },
      { de: "Ich drücke dir die Daumen. Erzähl mir bald, wie es läuft!", vi: "Chúc bạn may mắn. Kể mình nghe tiến triển thế nào nhé!" },
    ],
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
    script: [
      { de: "Verstehe. Welche Nachteile sehen Sie selbst an Ihrem Vorschlag?", vi: "Tôi hiểu. Chính bạn thấy đề xuất của mình có nhược điểm gì?" },
      { de: "Ein Kollege sagt, das kostet zu viel Zeit. Was antworten Sie ihm?", vi: "Một đồng nghiệp nói cách đó tốn quá nhiều thời gian. Bạn đáp lại thế nào?" },
      { de: "Wie würden Sie den Erfolg messen?", vi: "Bạn sẽ đo kết quả bằng cách nào?" },
      { de: "Danke, das war überzeugend. Wir kommen darauf zurück.", vi: "Cảm ơn, khá thuyết phục. Chúng ta sẽ quay lại chuyện này." },
    ],
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
    script: [
      { de: "Woran liegt die Verzögerung konkret?", vi: "Cụ thể chậm là do đâu?" },
      { de: "Was schlagen Sie vor, damit das nicht noch einmal passiert?", vi: "Bạn đề xuất gì để chuyện này không lặp lại?" },
      { de: "Zwei Wochen sind viel. Können Sie einen Teil früher liefern?", vi: "Hai tuần là dài đấy. Bạn giao trước một phần được không?" },
      { de: "Gut, dann halten wir es so fest. Danke für die Offenheit.", vi: "Được, ta chốt như vậy. Cảm ơn bạn đã nói thẳng." },
    ],
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
    script: [
      { de: "Und welche Erfahrung steht hinter Ihrer Meinung?", vi: "Trải nghiệm nào đứng sau quan điểm đó của bạn?" },
      { de: "Manche sagen, Sprache lernt man am besten bei der Arbeit. Wie sehen Sie das?", vi: "Có người nói học tiếng tốt nhất là học ngay trong lúc làm. Bạn nghĩ sao?" },
      { de: "Was müsste der Staat dafür ändern?", vi: "Nhà nước phải thay đổi gì cho việc đó?" },
      { de: "Ein interessanter Blick. Danke für das Gespräch.", vi: "Một góc nhìn thú vị. Cảm ơn bạn đã trò chuyện." },
    ],
  },
];

export function lessonByCode(code: string): Lesson | undefined {
  return LESSONS.find((l) => l.code === code);
}

/** Buổi học gợi ý cho một mức: buổi đầu tiên của mức đó. */
export function firstLessonFor(level: string): Lesson {
  return LESSONS.find((l) => l.level === level) ?? LESSONS[0]!;
}
